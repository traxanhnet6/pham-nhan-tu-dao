// Phàm Nhân Tu Đạo — ENGINE PROP SỐNG "thế giới vật thể" (tích hợp cơ
// chế ATLAS LAB vào game chính, lệnh Bui 18:46 31/10/2026; hồ sơ gốc:
// prototypes/atlas-rice/INTEGRATION.md).
//
// Vai trò:
//  - Scatter tất định prop theo zone khai báo trong js/prop-zones.js
//    (theo loại ô của map, seed cố định → cùng bố cục mọi lần nạp).
//  - Lưới băm không gian (ô 128px) + culling theo khung camera; game.js
//    gom prop vào CHUNG danh sách y-sort với nhân vật/NPC/quái (kind
//    'rprop', sy = y chân prop) — không vẽ lớp riêng (sai chiều sâu).
//  - Cache sprite tiền-scale theo (ô atlas, lật, cỡ px) như lab: khi vẽ
//    chỉ blit 1:1, không scale mỗi frame.
//  - Ngân sách vẽ: mật độ hiển thị theo mức đồ hoạ đã lưu của game
//    ('cao' 100%, 'trung' ~60%, 'thap' ~35% và prop nhỏ bị loại hẳn ở
//    mức Thấp — cả vẽ lẫn tương tác, nhất quán hai phía).
//  - Thu hoạch: prop có bảng rơi (type) chuyển trạng thái đã thu (gốc
//    rạ), rơi vật phẩm CÓ SẴN trong ITEMS qua L.addItem ở game.js; trạng
//    thái lưu dạng diff trong save: flags.propCut = { mapId: { id: mốc
//    giờ mọc lại } } — save cũ không có trường này vẫn chạy (nguyên vẹn).
//  - Va chạm: prop mềm (lúa) đi xuyên; prop cứng (solid, cho type tương
//    lai như đá/thân cây) chặn theo vòng chân qua solidAt().
(function () {
  'use strict';

  var M = null, PZ = null;
  if (typeof window !== 'undefined') {
    M = window.PNT_MAPS || null;
    PZ = window.PNT_PROP_ZONES || null;
  }
  if (!M && typeof require !== 'undefined') { try { M = require('./maps.js'); } catch (e) {} }
  if (!PZ && typeof require !== 'undefined') { try { PZ = require('./prop-zones.js'); } catch (e) {} }

  var TILE = 32;              // khớp TILE của game.js / maps.js
  var CELL = 128;             // ô lưới băm không gian (px thế giới)
  var REGROW_MS = 300000;     // prop đã thu mọc lại sau 5 phút (giờ thật,
                              // cùng quy ước respawnAt của dược hoang)

  // Định nghĩa loại prop. atlas: sprite sheet ngang, mỗi ô CELL_PX px;
  // tiles = các ô biến thể; cutTile = ô trạng thái đã thu; bodyH = phần
  // thân sprite (theo tỉ lệ ô) dùng neo đáy khi vẽ (chân ở y prop).
  var TYPES = {
    rice: {
      atlas: 'assets/props/rice-atlas.png',
      cellPx: 160,
      tiles: [0, 1, 2, 3],
      cutTile: 4,
      drawW: 74,              // bề rộng vẽ ở tỉ lệ 1 (nhân vật vẽ ~96px)
      bodyBottom: 152 / 160,  // neo đáy trong ô atlas (như lab)
      solid: false,
      solidR: 0,
      harvest: { item: 'thao_duoc', chance: 0.22 }
    }
  };

  // ---- PRNG tất định (mulberry32) + băm điểm lưới: cùng seed → cùng map.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pointRnd(seed, gx, gy, salt) {
    var h = (seed ^ Math.imul(gx + 4096, 73856093) ^ Math.imul(gy + 4096, 19349663) ^ Math.imul(salt + 16, 83492791)) | 0;
    return mulberry32(h)();
  }
  // Tỉ lệ giữ theo mức đồ hoạ, tất định theo id prop (ổn định giữa các
  // frame và giữa vẽ/tương tác): dùng băm nhân Knuth trên id.
  function gfxKeep(id, gfx) {
    if (gfx === 'cao') return true;
    var h = (Math.imul(id + 1, 2654435761) >>> 0) % 100;
    if (gfx === 'trung') return h < 60;
    return h < 35; // 'thap'
  }

  // ---- Runtime theo map (cache; dựng lười khi vào map) ----
  var runtimes = {}; // mapId -> { list, hash, hasSolid, flags }

  function buildRuntime(mapId) {
    var rt = { list: [], hash: {}, hasSolid: false, flags: null, mapId: mapId };
    runtimes[mapId] = rt;
    if (!M || !PZ || !M.MAPS || !M.MAPS[mapId]) return rt;
    var mp = M.MAPS[mapId];
    var zones = PZ.zonesFor(mapId);
    if (!zones.length || !mp.tiles) return rt;
    // Ô cấm rải: ô NPC đứng (+ ô kề theo chân NPC) — tránh lúa mọc đè
    // giữa người làng; cổng/dược không nằm trên ô ruộng nên khỏi xét.
    var npcTiles = {};
    (mp.npcs || []).forEach(function (n) { npcTiles[n.x + ',' + n.y] = 1; });
    zones.forEach(function (z) {
      var td = TYPES[z.type];
      if (!td) return;
      var sp = z.spacing || 30;
      var wPx = mp.w * TILE, hPx = mp.h * TILE;
      for (var gy = Math.floor(sp / 2); gy < hPx; gy += sp) {
        for (var gx = Math.floor(sp / 2); gx < wPx; gx += sp) {
          var tx = Math.floor(gx / TILE), ty = Math.floor(gy / TILE);
          if (!mp.tiles[ty] || mp.tiles[ty][tx] !== z.tile) continue;
          if (pointRnd(z.seed, gx, gy, 1) < (z.skip || 0)) continue;
          var x = gx + (pointRnd(z.seed, gx, gy, 2) * 2 - 1) * (z.jitter || 0);
          var y = gy + (pointRnd(z.seed, gx, gy, 3) * 2 - 1) * (z.jitter || 0);
          var tx2 = Math.floor(x / TILE), ty2 = Math.floor(y / TILE);
          if (!mp.tiles[ty2] || mp.tiles[ty2][tx2] !== z.tile) continue; // jitter lấn sang đường/nước thì bỏ
          if (npcTiles[tx2 + ',' + ty2]) continue;
          var v = td.tiles[Math.floor(pointRnd(z.seed, gx, gy, 4) * td.tiles.length) % td.tiles.length];
          var s = (z.scaleMin || 0.85) + pointRnd(z.seed, gx, gy, 5) * ((z.scaleMax || 1.3) - (z.scaleMin || 0.85));
          var p = {
            id: rt.list.length, type: z.type, zone: z.id,
            x: Math.round(x), y: Math.round(y),
            v: v, s: Math.round(s * 100) / 100, f: pointRnd(z.seed, gx, gy, 6) < 0.5,
            cut: false, cutUntil: 0
          };
          rt.list.push(p);
          var k = Math.floor(p.x / CELL) + ':' + Math.floor(p.y / CELL);
          (rt.hash[k] = rt.hash[k] || []).push(p);
          if (td.solid) rt.hasSolid = true;
        }
      }
    });
    return rt;
  }

  function runtime(mapId) {
    return runtimes[mapId] || buildRuntime(mapId);
  }

  // Gắn save (flags) + dọn prop đã tới giờ mọc lại. game.js gọi mỗi lần
  // vào map (cùng nhịp nạp herbs). Trả tóm tắt { total, cut }.
  function enterMap(mapId, flags, now) {
    var rt = runtime(mapId);
    rt.flags = flags || null;
    var cut = 0;
    var saved = (flags && flags.propCut && flags.propCut[mapId]) || null;
    for (var i = 0; i < rt.list.length; i++) {
      var p = rt.list[i];
      var until = saved ? saved[p.id] : 0;
      if (until && until > now) { p.cut = true; p.cutUntil = until; cut++; }
      else {
        if (until && saved) delete saved[p.id]; // đã mọc lại: xoá diff khỏi save
        p.cut = false; p.cutUntil = 0;
      }
    }
    return { total: rt.list.length, cut: cut };
  }

  // Prop đã thu tới giờ mọc lại thì tự hồi (gọi lười trong collect /
  // harvestNear để người chơi đứng lâu trong map vẫn thấy lúa mọc lại).
  function refreshProp(rt, p, now) {
    if (p.cut && p.cutUntil && p.cutUntil <= now) {
      p.cut = false; p.cutUntil = 0;
      if (rt.flags && rt.flags.propCut && rt.flags.propCut[rt.mapId]) delete rt.flags.propCut[rt.mapId][p.id];
    }
  }

  // Gom prop trong hình chữ nhật thế giới (đã gồm lề do game.js truyền),
  // đã lọc: mức đồ hoạ + trạng thái mọc lại. Trả MẢNG DÙNG LẠI nội bộ —
  // caller phải dùng ngay trong frame, không giữ tham chiếu.
  var _view = [];
  function collect(mapId, x0, y0, x1, y1, gfx, now) {
    var rt = runtime(mapId);
    rt.mapId = mapId;
    _view.length = 0;
    var gx0 = Math.floor(x0 / CELL), gx1 = Math.floor(x1 / CELL);
    var gy0 = Math.floor(y0 / CELL), gy1 = Math.floor(y1 / CELL);
    for (var gy = gy0; gy <= gy1; gy++) {
      for (var gx = gx0; gx <= gx1; gx++) {
        var cell = rt.hash[gx + ':' + gy];
        if (!cell) continue;
        for (var i = 0; i < cell.length; i++) {
          var p = cell[i];
          if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
          refreshProp(rt, p, now);
          if (gfx === 'thap' && p.s < 0.95) continue; // Thấp: prop nhỏ không hiện/không tương tác
          if (!gfxKeep(p.id, gfx)) continue;
          _view.push(p);
        }
      }
    }
    return _view;
  }

  // Prop thu hoạch được quanh người chơi: tầm 58px theo hướng mặt
  // (cung ±80°, sát chân <20px thì hướng nào cũng trúng) — cùng thông số
  // lab (tầm 108px ở lab là cho nhân vật 132px; game nhân vật ~96px và
  // đòn cận chiến quái ~1.6 ô nên 58px khớp nhịp đánh hiện tại).
  function harvestNear(mapId, px, py, dir, gfx, now) {
    var rt = runtime(mapId);
    rt.mapId = mapId;
    var dv = dir === 'up' ? { x: 0, y: -1 } : dir === 'left' ? { x: -1, y: 0 } : dir === 'right' ? { x: 1, y: 0 } : { x: 0, y: 1 };
    var out = [];
    var gx0 = Math.floor((px - 70) / CELL), gx1 = Math.floor((px + 70) / CELL);
    var gy0 = Math.floor((py - 70) / CELL), gy1 = Math.floor((py + 70) / CELL);
    for (var gy = gy0; gy <= gy1; gy++) {
      for (var gx = gx0; gx <= gx1; gx++) {
        var cell = rt.hash[gx + ':' + gy];
        if (!cell) continue;
        for (var i = 0; i < cell.length; i++) {
          var p = cell[i];
          var td = TYPES[p.type];
          if (!td || !td.harvest) continue;
          refreshProp(rt, p, now);
          if (p.cut) continue;
          if (gfx === 'thap' && p.s < 0.95) continue;
          if (!gfxKeep(p.id, gfx)) continue;
          var dx = p.x - px, dy = p.y - py;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > 58) continue;
          if (d >= 20) {
            var dot = (dx * dv.x + dy * dv.y) / (d || 1);
            if (dot < 0.17) continue; // ngoài cung ±80°
          }
          out.push(p);
        }
      }
    }
    out.sort(function (a, b) {
      var da = (a.x - px) * (a.x - px) + (a.y - py) * (a.y - py);
      var db = (b.x - px) * (b.x - px) + (b.y - py) * (b.y - py);
      return da - db;
    });
    return out;
  }

  // Đánh dấu đã thu + ghi diff vào save. Trả true nếu trạng thái đổi.
  function markCut(mapId, p, flags, now) {
    if (!p || p.cut) return false;
    p.cut = true;
    p.cutUntil = now + REGROW_MS;
    if (flags) {
      flags.propCut = flags.propCut || {};
      flags.propCut[mapId] = flags.propCut[mapId] || {};
      flags.propCut[mapId][p.id] = p.cutUntil;
    }
    return true;
  }

  // Lăn bảng rơi của prop: rng là hàm [0,1) (game truyền Math.random,
  // test truyền hàm giả). Trả id vật phẩm hoặc null.
  function rollDrop(p, rng) {
    var td = TYPES[p.type];
    if (!td || !td.harvest) return null;
    return (rng || Math.random)() < td.harvest.chance ? td.harvest.item : null;
  }

  // Va chạm prop cứng: điểm (x,y) là TÂM hộp chân người chơi — game.js
  // gọi qua collideAt cùng lượt va chạm ô. Map không có prop cứng thì
  // trả false ngay (không tốn gì trong vòng di chuyển).
  function solidAt(mapId, x, y) {
    var rt = runtimes[mapId];
    if (!rt || !rt.hasSolid) return false;
    var gx0 = Math.floor((x - 24) / CELL), gx1 = Math.floor((x + 24) / CELL);
    var gy0 = Math.floor((y - 24) / CELL), gy1 = Math.floor((y + 24) / CELL);
    for (var gy = gy0; gy <= gy1; gy++) {
      for (var gx = gx0; gx <= gx1; gx++) {
        var cell = rt.hash[gx + ':' + gy];
        if (!cell) continue;
        for (var i = 0; i < cell.length; i++) {
          var p = cell[i], td = TYPES[p.type];
          if (!td || !td.solid || p.cut) continue;
          var dx = p.x - x, dy = p.y - y;
          if (dx * dx + dy * dy < td.solidR * td.solidR) return true;
        }
      }
    }
    return false;
  }

  // ---- Vẽ: atlas + cache sprite tiền-scale (như lab) ----
  var atlasImgs = {};   // type -> { img, ready }
  function atlasFor(type) {
    var td = TYPES[type];
    if (!td) return null;
    var a = atlasImgs[type];
    if (!a) {
      a = atlasImgs[type] = { img: null, ready: false };
      if (typeof Image !== 'undefined') {
        var im = new Image();
        im.onload = function () { a.ready = true; };
        im.src = td.atlas;
        a.img = im;
      }
    }
    return a;
  }
  var sprCache = {};
  function getSprite(type, tile, flip, sizePx) {
    var key = type + ':' + tile + (flip ? 'f' : '') + ':' + sizePx;
    var c = sprCache[key];
    if (c) return c;
    var a = atlasFor(type);
    if (!a || !a.ready || typeof document === 'undefined') return null;
    if (Object.keys(sprCache).length > 420) sprCache = {};
    var td = TYPES[type];
    c = document.createElement('canvas');
    c.width = c.height = Math.max(2, sizePx);
    var g = c.getContext('2d');
    if (flip) { g.translate(sizePx, 0); g.scale(-1, 1); }
    g.drawImage(a.img, tile * td.cellPx, 0, td.cellPx, td.cellPx, 0, 0, sizePx, sizePx);
    sprCache[key] = c;
    return c;
  }

  var drawnFrame = 0, drawnLast = 0;
  function beginFrame() { drawnLast = drawnFrame; drawnFrame = 0; }
  function drawOne(ctx, p, camX, camY) {
    var td = TYPES[p.type];
    if (!td) return;
    var a = atlasFor(p.type);
    if (!a || !a.ready) return;
    var w = td.drawW * p.s * (p.cut ? 1.12 : 1);
    var spr = getSprite(p.type, p.cut ? td.cutTile : p.v, p.f, Math.round(w));
    if (!spr) return;
    var sx = p.x - camX, sy = p.y - camY;
    ctx.drawImage(spr, sx - w / 2, sy - w * td.bodyBottom);
    drawnFrame++;
  }

  function debugState(mapId) {
    var rt = runtime(mapId);
    rt.mapId = mapId;
    var cut = 0;
    for (var i = 0; i < rt.list.length; i++) if (rt.list[i].cut) cut++;
    var keepT = 0, keepTh = 0;
    for (var j = 0; j < rt.list.length; j++) {
      if (gfxKeep(rt.list[j].id, 'trung')) keepT++;
      if (gfxKeep(rt.list[j].id, 'thap') && rt.list[j].s >= 0.95) keepTh++;
    }
    return {
      total: rt.list.length, cut: cut, drawnLast: drawnLast,
      keepTrung: keepT, keepThap: keepTh,
      first: rt.list.length ? { id: rt.list[0].id, x: rt.list[0].x, y: rt.list[0].y, type: rt.list[0].type } : null
    };
  }

  // ===== VẬT THỂ THẬT CỠ LỚN (bản đồ làm lại theo bản thử atlas-town) =====
  // Nền của các bản đồ này chỉ còn đất thuần; nhà, cây, sạp, giếng, cổng là
  // vật thể ảnh thật đặt theo lưới logic, gom vào cùng danh sách sắp xếp
  // theo chiều sâu của engine. Dữ liệu sinh tự động tại js/map1-objects.js
  // (PNT_OBJMAPS): { mapId: { atlas, keys, sprites: {khóa: [x,y,rộng,cao]},
  // placed: [[chỉ số sprite, tâm x, đáy y, mốc sắp xếp, bóng (phần nghìn
  // bề rộng), lật gương, bề rộng vẽ (0 = nguyên bản)], ...] } }.
  // Cơ chế tổng quát: bản đồ nào có dữ liệu trong PNT_OBJMAPS thì tự bật.
  var OBJMAPS = null;
  function objMaps() {
    if (OBJMAPS) return OBJMAPS;
    var w = null;
    if (typeof window !== 'undefined' && window.PNT_OBJMAPS) w = window.PNT_OBJMAPS;
    else if (typeof PNT_OBJMAPS !== 'undefined') w = PNT_OBJMAPS;
    if (w && Object.keys(w).length) OBJMAPS = w;
    return OBJMAPS || {};
  }
  function isObjMap(mapId) {
    var m = objMaps();
    return !!(m && m[mapId] && m[mapId].placed && m[mapId].placed.length);
  }
  var objRt = {};
  function objRuntime(mapId) {
    var rt = objRt[mapId];
    if (rt) return rt;
    var def = objMaps()[mapId];
    var list = [];
    var cells = new Map();
    var CELL = 128;
    for (var i = 0; i < def.placed.length; i++) {
      var p = def.placed[i];
      var key = def.keys[p[0]];
      var rect = def.sprites[key];
      var dw = p[6] || rect[2];
      var o = {
        key: key, rect: rect, def: def,
        x: p[1], y: p[2], sy: p[3], sh: p[4], f: p[5],
        dw: dw, dh: Math.round(rect[3] * dw / rect[2])
      };
      list.push(o);
      var ck = Math.floor(p[1] / CELL) + ':' + Math.floor(p[2] / CELL);
      if (!cells.has(ck)) cells.set(ck, []);
      cells.get(ck).push(o);
    }
    rt = { list: list, cells: cells, cell: CELL };
    objRt[mapId] = rt;
    return rt;
  }
  function collectObj(mapId, x0, y0, x1, y1) {
    if (!isObjMap(mapId)) return [];
    var rt = objRuntime(mapId);
    var CELL = rt.cell, out = [], seen = new Set();
    var cx0 = Math.floor(x0 / CELL), cx1 = Math.floor(x1 / CELL);
    var cy0 = Math.floor(y0 / CELL), cy1 = Math.floor(y1 / CELL);
    for (var cy = cy0; cy <= cy1; cy++) for (var cx = cx0; cx <= cx1; cx++) {
      var arr = rt.cells.get(cx + ':' + cy);
      if (!arr) continue;
      for (var i = 0; i < arr.length; i++) {
        var o = arr[i];
        if (seen.has(o)) continue;
        seen.add(o);
        if (o.x + o.dw / 2 >= x0 && o.x - o.dw / 2 <= x1 && o.y >= y0 && o.y - o.dh <= y1) out.push(o);
      }
    }
    return out;
  }
  var objAtlasCache = {};
  function objAtlasFor(def) {
    var a = objAtlasCache[def.atlas];
    if (!a) {
      a = { ready: false, img: null };
      objAtlasCache[def.atlas] = a;
      if (typeof Image !== 'undefined') {
        var im = new Image();
        im.onload = function () { a.ready = true; };
        im.src = def.atlas;
        a.img = im;
      }
    }
    return a;
  }
  var objSprCache = {};
  function objSprite(o) {
    var key = o.key + ':' + o.dw + (o.f ? 'f' : '');
    var c = objSprCache[key];
    if (c) return c;
    var a = objAtlasFor(o.def);
    if (!a.ready || typeof document === 'undefined') return null;
    if (Object.keys(objSprCache).length > 300) objSprCache = {};
    var r = o.rect;
    c = document.createElement('canvas');
    c.width = Math.max(2, o.dw); c.height = Math.max(2, o.dh);
    var g = c.getContext('2d');
    if (o.f) { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(a.img, r[0], r[1], r[2], r[3], 0, 0, c.width, c.height);
    objSprCache[key] = c;
    return c;
  }
  // Bóng tiếp xúc MỀM: một elip gradient xuyên tâm tan dần về mép (chuẩn
  // của bản thử) — tuyệt đối không chồng nhiều mảng elip trong suốt.
  var objShadowCache = {};
  function objShadowSpr(w) {
    var h = Math.max(4, Math.round(w * 0.30));
    var key = w + 'x' + h;
    var c = objShadowCache[key];
    if (c || typeof document === 'undefined') return c || null;
    c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(12,20,10,0.34)');
    gr.addColorStop(0.7, 'rgba(12,20,10,0.15)');
    gr.addColorStop(1, 'rgba(12,20,10,0)');
    g.fillStyle = gr;
    g.save();
    g.translate(w / 2, h / 2); g.scale(1, h / w); g.translate(-w / 2, -h / 2);
    g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.fill();
    g.restore();
    objShadowCache[key] = c;
    return c;
  }
  function drawObj(ctx, o, camX, camY) {
    if (!o || !o.def) return;
    if (o.sh) {
      var sw = Math.max(8, Math.round(o.dw * o.sh / 1000));
      var shImg = objShadowSpr(sw);
      if (shImg) ctx.drawImage(shImg, Math.round(o.x - sw / 2 - camX), Math.round(o.y - shImg.height / 2 - camY));
    }
    var spr = objSprite(o);
    if (!spr) return;
    ctx.drawImage(spr, Math.round(o.x - o.dw / 2 - camX), Math.round(o.y - o.dh - camY));
    drawnFrame++;
  }
  function debugObj(mapId) {
    if (!isObjMap(mapId)) return null;
    var rt = objRuntime(mapId);
    var counts = {};
    for (var i = 0; i < rt.list.length; i++) counts[rt.list[i].key] = (counts[rt.list[i].key] || 0) + 1;
    return { total: rt.list.length, counts: counts, list: rt.list };
  }

  var api = {
    TYPES: TYPES, REGROW_MS: REGROW_MS,
    enterMap: enterMap, collect: collect, harvestNear: harvestNear,
    markCut: markCut, rollDrop: rollDrop, solidAt: solidAt,
    beginFrame: beginFrame, drawOne: drawOne, debugState: debugState,
    isObjMap: isObjMap, collectObj: collectObj, drawObj: drawObj, debugObj: debugObj,
    _runtime: runtime
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_PROPS = api;
})();
