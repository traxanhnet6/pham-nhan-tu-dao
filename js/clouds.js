// Phàm Nhân Tu Đạo — hiệu ứng MÂY BAY cho map 3 "Chân Núi Thanh Phong".
// Mây là lớp ĐỘNG trong engine (trôi theo thời gian thực trong vòng lặp của
// game.js), KHÔNG vẽ chết vào ảnh nền. Bốn lớp, vẽ theo thứ tự trong draw():
//   1) Bóng mây đổ xuống mặt đất (bản sao tối của mây trời, lệch theo nắng,
//      ép dẹt theo chiều dọc) — lớp làm cảm giác "mây đang bay" rõ nhất.
//   2) Sương mỏng quanh Đài Vọng Vân + thềm đá: các cụm sương neo tại chỗ,
//      lững lờ qua lại; nhân vật đứng gần đài thì sương đặc lên (mây luồn
//      dưới chân người đứng trên đài).
//   3) Mây trôi trên cao: 2 tầng tốc độ (xa chậm/nhỏ/mờ, gần nhanh/to/rõ)
//      cho chiều sâu parallax nhẹ, trôi theo gió đông, vòng quanh biên map.
//   4) Mây tiền cảnh: thi thoảng một cụm lớn mờ bay ngang sát camera.
// Hình mây: mỗi biến thể là một "công thức cụm" (danh sách blob radial) —
// trình duyệt raster hoá MỘT LẦN ra canvas đệm (trắng + bản bóng đen) rồi
// drawImage lại mỗi frame (không sinh hình mỗi frame). Cùng công thức này
// được tools/render-clouds-preview.py dùng để dựng ảnh xem trước bằng PIL
// nên ảnh xem trước khớp hình trong game.
// Mức đồ hoạ dùng CHUNG khóa 'pnt-gfx-quality' / window.PNT_GFX_QUALITY:
//   Cao        = đủ 4 lớp.
//   Trung bình = mây trôi (ít cụm hơn) + bóng mây + sương thưa, bỏ tiền cảnh.
//   Thấp       = chỉ bóng mây rất nhẹ (alpha ~0.05), còn lại tắt.
(function () {
  'use strict';
  var QUALITY_KEY = 'pnt-gfx-quality';
  var MAP_ID = 'map3';
  var TILE = 32;
  var BOX_W = 320, BOX_H = 200; // khung công thức của một cụm mây (px ở scale 1)
  var SHADOW_DX = 120, SHADOW_DY = 175, SHADOW_SQUASH = 0.6;

  function normQ(q) { return (q === 'trung' || q === 'thap') ? q : 'cao'; }
  function getQuality() {
    try {
      if (typeof window !== 'undefined') {
        if (window.PNT_GFX_QUALITY) return normQ(window.PNT_GFX_QUALITY);
        if (typeof localStorage !== 'undefined') {
          var v = localStorage.getItem(QUALITY_KEY);
          if (v) return normQ(v);
        }
      }
    } catch (e) {}
    return 'cao';
  }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  // Hash xác định (cùng họ với skill-fx.js): cùng (seed, i, k) cho cùng số.
  function rnd(seed, i, k) {
    var x = Math.sin((seed || 1) * 7919 + i * 127.1 + (k || 0) * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // ----- Công thức cụm mây: blob {x, y (tỉ lệ khung), r (tỉ lệ BOX_W), a} ---
  // Các blob tụ ở nửa dưới khung, đáy phẳng dần, đỉnh gồ ghề — ra dáng mây
  // tích (cumulus) mềm khi chồng radial gradient, không phải hình tròn đặc.
  var SPRITES = [
    { blobs: [
      { x: 0.30, y: 0.60, r: 0.26, a: 0.75 }, { x: 0.47, y: 0.46, r: 0.30, a: 0.95 },
      { x: 0.65, y: 0.58, r: 0.25, a: 0.75 }, { x: 0.38, y: 0.68, r: 0.34, a: 0.55 },
      { x: 0.58, y: 0.69, r: 0.32, a: 0.55 }, { x: 0.50, y: 0.60, r: 0.40, a: 0.40 }
    ] },
    { blobs: [
      { x: 0.24, y: 0.62, r: 0.22, a: 0.70 }, { x: 0.42, y: 0.52, r: 0.27, a: 0.90 },
      { x: 0.60, y: 0.44, r: 0.24, a: 0.85 }, { x: 0.76, y: 0.60, r: 0.21, a: 0.65 },
      { x: 0.50, y: 0.68, r: 0.38, a: 0.50 }, { x: 0.35, y: 0.70, r: 0.30, a: 0.45 }
    ] },
    { blobs: [
      { x: 0.35, y: 0.55, r: 0.28, a: 0.85 }, { x: 0.55, y: 0.50, r: 0.26, a: 0.90 },
      { x: 0.70, y: 0.62, r: 0.20, a: 0.65 }, { x: 0.45, y: 0.68, r: 0.36, a: 0.55 },
      { x: 0.62, y: 0.70, r: 0.28, a: 0.45 }, { x: 0.28, y: 0.66, r: 0.22, a: 0.50 }
    ] },
    { blobs: [
      { x: 0.28, y: 0.58, r: 0.24, a: 0.80 }, { x: 0.50, y: 0.42, r: 0.31, a: 0.95 },
      { x: 0.68, y: 0.56, r: 0.23, a: 0.70 }, { x: 0.42, y: 0.66, r: 0.33, a: 0.55 },
      { x: 0.60, y: 0.68, r: 0.30, a: 0.50 }, { x: 0.50, y: 0.58, r: 0.38, a: 0.38 }
    ] }
  ];

  // ----- Vùng sương của map 3 (toạ độ px, ô 32) -----
  // dai: Đài Vọng Vân x38..48, y22..25. them: thềm đá dưới đài x42..52,
  // y27..32. bac: đường đá + bãi luyện công phía bắc đài x30..47, y12..17.
  var MIST_ZONES = [
    { id: 'dai', x0: 50 * TILE, y0: 30 * TILE, x1: 61 * TILE, y1: 34 * TILE, cx: 55.5 * TILE, cy: 32 * TILE, weight: 1.0, puffs: 5 },
    { id: 'them', x0: 54 * TILE, y0: 35 * TILE, x1: 65 * TILE, y1: 41 * TILE, cx: 59.5 * TILE, cy: 38 * TILE, weight: 0.65, puffs: 3 },
    { id: 'bac', x0: 42 * TILE, y0: 20 * TILE, x1: 60 * TILE, y1: 26 * TILE, cx: 51 * TILE, cy: 23 * TILE, weight: 0.45, puffs: 3 }
  ];
  // V9: mở hệ mây cho map 7 (Thập Vạn Đại Sơn · Chi Đỉnh — vùng đỉnh mây).
  // Zones sương của map 7 tính theo ô của map 7 (56x40): quanh đài đá + bia
  // cổ ở bắc-trung (nơi tu luyện tầng 9), biển mây sườn nam và sườn đông.
  // MIST_ZONES của map 3 ở trên giữ nguyên tuyệt đối (test cũ ghim toạ độ).
  var MIST_ZONES7 = [
    { id: 'dinh', x0: 30 * TILE, y0: 11 * TILE, x1: 47 * TILE, y1: 23 * TILE, cx: 38.5 * TILE, cy: 17 * TILE, weight: 1.0, puffs: 5 },
    { id: 'suon', x0: 28 * TILE, y0: 30 * TILE, x1: 48 * TILE, y1: 46 * TILE, cx: 38 * TILE, cy: 38 * TILE, weight: 0.6, puffs: 3 },
    { id: 'dong', x0: 50 * TILE, y0: 24 * TILE, x1: 67 * TILE, y1: 39 * TILE, cx: 58 * TILE, cy: 31.5 * TILE, weight: 0.45, puffs: 3 }
  ];
  var MAP_IDS = { map3: true, map7: true };
  function zonesFor(mapId) { return mapId === 'map7' ? MIST_ZONES7 : MIST_ZONES; }

  function createState(seed, mapId) {
    seed = seed || 7;
    var zones = zonesFor(mapId);
    var sky = [], i, layer;
    for (i = 0; i < 8; i++) {
      layer = i < 4 ? 'far' : 'near';
      sky.push({
        x: -300 + rnd(seed, i, 1) * 2300,
        y: layer === 'far' ? -60 + rnd(seed, i, 2) * 560 : -80 + rnd(seed, i, 2) * 720,
        layer: layer,
        spr: Math.floor(rnd(seed, i, 3) * SPRITES.length) % SPRITES.length,
        scale: layer === 'far' ? 0.7 + rnd(seed, i, 4) * 0.25 : 1.1 + rnd(seed, i, 4) * 0.35,
        speed: layer === 'far' ? 5 + rnd(seed, i, 5) * 3 : 10 + rnd(seed, i, 5) * 5,
        a: layer === 'far' ? 0.30 : 0.48,
        ph: rnd(seed, i, 6) * Math.PI * 2
      });
    }
    var mist = [], mi = 0;
    zones.forEach(function (z, zi) {
      for (var j = 0; j < z.puffs; j++, mi++) {
        mist.push({
          zone: zi,
          bx: z.x0 + (0.15 + 0.7 * rnd(seed, 100 + mi, 1)) * (z.x1 - z.x0),
          by: z.y0 + (0.2 + 0.6 * rnd(seed, 100 + mi, 2)) * (z.y1 - z.y0),
          spr: Math.floor(rnd(seed, 100 + mi, 3) * SPRITES.length) % SPRITES.length,
          scale: 1.5 + rnd(seed, 100 + mi, 4) * 0.8,
          a: 0.10 + rnd(seed, 100 + mi, 5) * 0.07,
          ph: rnd(seed, 100 + mi, 6) * Math.PI * 2,
          per: 9 + rnd(seed, 100 + mi, 7) * 7,
          amp: 26 + rnd(seed, 100 + mi, 8) * 18
        });
      }
    });
    return {
      t: 0, seed: seed, mapId: mapId || MAP_ID, zones: zones, sky: sky, mist: mist, mistBoost: 1,
      fg: { active: false, x: 0, y: 0, spr: 1, scale: 2.3, speed: 65, nextIn: 14, seedN: 0 }
    };
  }

  // env: {mapW, mapH (px), camX, camY, viewW, viewH, px, py, quality}
  function update(state, dt, env) {
    if (!state || !(dt > 0)) return state;
    dt = Math.min(dt, 1); // loop game đã kẹp dt <= 0.05; đây chỉ chống nhảy giờ bất thường
    state.t += dt;
    var mapW = env.mapW || 56 * TILE, mapH = env.mapH || 40 * TILE;
    state.sky.forEach(function (c) {
      c.x += c.speed * dt;
      var halfW = BOX_W * c.scale / 2;
      if (c.x - halfW > mapW + 80) {
        c.x = -halfW - 40 - rnd(state.seed, Math.floor(state.t), c.spr) * 160;
        var band = c.layer === 'far' ? [-60, 500] : [-80, 640];
        c.y = band[0] + rnd(state.seed, Math.floor(state.t * 3), c.spr + 2) * (band[1] - band[0]);
      }
    });
    // Sương đặc lên khi nhân vật tới gần tâm zones[0] (Đài Vọng Vân ở map
    // 3, đài đá Chi Đỉnh ở map 7).
    var dai = (state.zones || MIST_ZONES)[0];
    var dx = (env.px || 0) - dai.cx, dy = (env.py || 0) - dai.cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    state.mistBoost = 1 + 0.75 * clamp01(1 - dist / 320);
    // Mây tiền cảnh: hẹn giờ xuất hiện, bay ngang theo khung camera hiện tại.
    var fg = state.fg;
    if (!fg.active) {
      fg.nextIn -= dt;
      if (fg.nextIn <= 0) {
        fg.seedN++;
        fg.active = true;
        fg.spr = Math.floor(rnd(state.seed, 200 + fg.seedN, 1) * SPRITES.length) % SPRITES.length;
        fg.scale = 2.1 + rnd(state.seed, 200 + fg.seedN, 2) * 0.5;
        fg.speed = 55 + rnd(state.seed, 200 + fg.seedN, 3) * 25;
        fg.x = (env.camX || 0) - BOX_W * fg.scale / 2 - 60;
        fg.y = (env.camY || 0) + (env.viewH || 576) * (0.12 + rnd(state.seed, 200 + fg.seedN, 4) * 0.45);
      }
    } else {
      fg.x += fg.speed * dt;
      if (fg.x - BOX_W * fg.scale / 2 > (env.camX || 0) + (env.viewW || 768) + 80) {
        fg.active = false;
        fg.nextIn = 24 + rnd(state.seed, 300 + fg.seedN, 1) * 22;
      }
    }
    return state;
  }

  // Danh sách item vẽ {spr, x, y (tâm, toạ độ thế giới), w, h, a} theo lớp.
  function layers(state, quality) {
    var q = normQ(quality || getQuality());
    var out = { shadows: [], sky: [], mist: [], fg: null };
    if (!state) return out;
    var t = state.t;
    state.sky.forEach(function (c, i) {
      var w = BOX_W * c.scale, h = BOX_H * c.scale;
      var y = c.y + Math.sin(t * 0.11 + c.ph) * 8;
      var keepSky = q === 'cao' ||
        (q === 'trung' && (c.layer === 'near' ? (i % 4 !== 3) : (i % 2 === 0)));
      if (keepSky) out.sky.push({ spr: c.spr, x: c.x, y: y, w: w, h: h, a: c.a });
      // Bóng đi cùng cụm mây của nó; mức Thấp chỉ còn bóng mây gần, rất nhẹ.
      var keepShadow = keepSky || (q === 'thap' && c.layer === 'near');
      if (keepShadow) {
        var sa = Math.min(0.15, c.a * 0.30) * (q === 'thap' ? 0.35 : 1);
        out.shadows.push({ spr: c.spr, x: c.x + SHADOW_DX, y: y + SHADOW_DY, w: w * 1.05, h: h * SHADOW_SQUASH, a: sa });
      }
    });
    if (q !== 'thap') {
      state.mist.forEach(function (p, i) {
        if (q === 'trung' && i % 3 === 2) return;
        var z = (state.zones || MIST_ZONES)[p.zone];
        var x = p.bx + Math.sin(t / p.per * Math.PI * 2 + p.ph) * p.amp;
        var y = p.by + Math.cos(t / (p.per * 1.3) * Math.PI * 2 + p.ph) * p.amp * 0.35;
        var boost = 1 + (state.mistBoost - 1) * z.weight;
        out.mist.push({ spr: p.spr, x: x, y: y, w: BOX_W * p.scale, h: BOX_H * p.scale, a: p.a * boost * (q === 'trung' ? 0.85 : 1) });
      });
    }
    if (q === 'cao' && state.fg.active) {
      out.fg = { spr: state.fg.spr, x: state.fg.x, y: state.fg.y, w: BOX_W * state.fg.scale, h: BOX_H * state.fg.scale, a: 0.15 };
    }
    return out;
  }

  // ----- Raster hoá sprite đệm (chỉ trình duyệt; Node/test tự bỏ qua) -----
  var _cache = {};
  function spriteCanvas(idx, dark) {
    var key = idx + (dark ? 'd' : 'w');
    if (key in _cache) return _cache[key];
    var img = null;
    try {
      if (typeof document !== 'undefined' && document.createElement) {
        var c = document.createElement('canvas');
        c.width = BOX_W; c.height = BOX_H;
        var g = c.getContext && c.getContext('2d');
        if (g && g.createRadialGradient && g.fillRect) {
          var col = dark ? '8,14,28' : '255,255,255';
          SPRITES[idx].blobs.forEach(function (b) {
            var cx = b.x * BOX_W, cy = b.y * BOX_H, r = b.r * BOX_W;
            var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
            gr.addColorStop(0, 'rgba(' + col + ',' + b.a + ')');
            gr.addColorStop(0.55, 'rgba(' + col + ',' + (b.a * 0.55).toFixed(3) + ')');
            gr.addColorStop(1, 'rgba(' + col + ',0)');
            g.fillStyle = gr;
            g.fillRect(cx - r, cy - r, r * 2, r * 2);
          });
          img = c;
        }
      }
    } catch (e) { img = null; }
    _cache[key] = img;
    return img;
  }

  function drawItems(ctx, items, camX, camY, viewW, viewH, dark, squash) {
    if (!ctx || !items) return;
    items.forEach(function (it) {
      var h = it.h * (squash || 1);
      var sx = it.x - it.w / 2 - camX, sy = it.y - h / 2 - camY;
      if (sx + it.w < -80 || sx > viewW + 80 || sy + h < -80 || sy > viewH + 80) return;
      ctx.globalAlpha = Math.max(0, Math.min(1, it.a));
      var img = spriteCanvas(it.spr, dark);
      if (img && ctx.drawImage) {
        ctx.drawImage(img, sx, sy, it.w, h);
      } else if (ctx.createRadialGradient) {
        // Dự phòng: vẽ thẳng từng blob bằng gradient (không qua canvas đệm).
        var col = dark ? '8,14,28' : '255,255,255';
        SPRITES[it.spr].blobs.forEach(function (b) {
          var cx = it.x + (b.x - 0.5) * it.w - camX;
          var cy = it.y + (b.y - 0.5) * h - camY;
          var r = b.r * it.w;
          var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          gr.addColorStop(0, 'rgba(' + col + ',' + b.a + ')');
          gr.addColorStop(1, 'rgba(' + col + ',0)');
          ctx.fillStyle = gr;
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        });
      } else if (ctx.ellipse && ctx.fill) {
        ctx.fillStyle = dark ? '#0a1020' : '#ffffff';
        ctx.globalAlpha = it.a * 0.4;
        ctx.beginPath();
        ctx.ellipse(it.x - camX, it.y - camY, it.w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }

  function drawShadows(ctx, state, camX, camY, viewW, viewH, quality) {
    var ly = layers(state, quality);
    drawItems(ctx, ly.shadows, camX, camY, viewW, viewH, true, 1);
  }
  function drawMist(ctx, state, camX, camY, viewW, viewH, quality) {
    var ly = layers(state, quality);
    drawItems(ctx, ly.mist, camX, camY, viewW, viewH, false, 1);
  }
  function drawSky(ctx, state, camX, camY, viewW, viewH, quality) {
    var ly = layers(state, quality);
    drawItems(ctx, ly.sky, camX, camY, viewW, viewH, false, 1);
  }
  function drawForeground(ctx, state, camX, camY, viewW, viewH, quality) {
    var ly = layers(state, quality);
    if (ly.fg) drawItems(ctx, [ly.fg], camX, camY, viewW, viewH, false, 1);
  }

  function snapshot(state, quality) {
    var ly = layers(state, quality);
    return {
      t: state ? state.t : 0,
      mistBoost: state ? state.mistBoost : 1,
      counts: { sky: ly.sky.length, shadows: ly.shadows.length, mist: ly.mist.length, fg: ly.fg ? 1 : 0 },
      skyPos: ly.sky.map(function (c) { return { x: Math.round(c.x), y: Math.round(c.y) }; }),
      fgActive: !!(state && state.fg.active)
    };
  }

  // Đổi map cho state đang sống (game.js gọi khi nhân vật đi giữa 2 map
  // có mây): dựng lại sương theo zones của map mới, giữ mây trời + đồng hồ.
  function setMap(state, mapId) {
    if (!state || !MAP_IDS[mapId]) return state;
    if (state.mapId === mapId && state.zones) return state;
    var fresh = createState(state.seed, mapId);
    state.mapId = fresh.mapId; state.zones = fresh.zones;
    state.mist = fresh.mist; state.mistBoost = 1;
    return state;
  }

  var api = {
    MAP_ID: MAP_ID, MAP_IDS: MAP_IDS, QUALITY_KEY: QUALITY_KEY,
    BOX_W: BOX_W, BOX_H: BOX_H, SPRITES: SPRITES, MIST_ZONES: MIST_ZONES, MIST_ZONES7: MIST_ZONES7,
    SHADOW_DX: SHADOW_DX, SHADOW_DY: SHADOW_DY, SHADOW_SQUASH: SHADOW_SQUASH,
    getQuality: getQuality, normQ: normQ,
    createState: createState, setMap: setMap, update: update, layers: layers,
    drawShadows: drawShadows, drawMist: drawMist, drawSky: drawSky, drawForeground: drawForeground,
    snapshot: snapshot,
    activeFor: function (mapId) { return !!MAP_IDS[mapId]; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_CLOUDS = api;
})();
