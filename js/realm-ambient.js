// Phàm Nhân Tu Đạo — HIỆU ỨNG MÔI TRƯỜNG ĐỘNG cho 11 bí cảnh KHO VẾT
// NỨT (lệnh Bui 22:41 ngày 2026-10-29: "hình chuyển động đẹp"). Đây là
// không gian nứt vỡ giữa các giới nên mọi cảnh dùng CHUNG 2 lớp nền:
//   - Mảnh hư không: vụn không gian tím sẫm trôi chậm + xoay, lơ lửng
//     trên mặt đất (vẽ dưới thực thể).
//   - Hạt linh quang: đốm sáng nhỏ bay lững lờ khắp cảnh.
// Cộng yếu tố RIÊNG theo chủ đề từng cảnh (vẽ trên thực thể như sương
// của clouds.js): cánh hoa (Vườn Dược Cổ), bào tử độc (Độc Sào), lá rơi
// (Linh Mộc Lâm), đom đóm (Linh Thú Viên), tro bụi (Cổ Chiến Trường),
// tàn lửa bay lên (Địa Mạch Hỏa), kiếm khí mờ (Kiếm Mộ), tuyết rơi
// (Hàn Băng), linh quang vàng (Bãi Tinh Anh), bọt nước bốc lên (Thủy
// Phủ), tia điện loé (Lôi Vực).
// Hiệu ứng chạy THẬT theo thời gian trong vòng lặp game.js (không phải
// tranh tĩnh): hạt tích phân vận tốc + lắc theo sin(t), mảnh xoay theo
// t, tia điện nhấp nháy theo chu kỳ sống. Mức đồ hoạ dùng CHUNG khóa
// 'pnt-gfx-quality' / window.PNT_GFX_QUALITY như clouds.js:
//   Cao        = đủ hạt + mảnh hư không.
//   Trung bình = ~55% hạt, ít mảnh hơn.
//   Thấp       = tắt hạt chủ đề + mảnh, chỉ còn vài đốm linh quang mờ.
(function () {
  'use strict';
  var QUALITY_KEY = 'pnt-gfx-quality';
  var TILE = 32;

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
  // Hash xác định cùng họ clouds.js/skill-fx.js.
  function rnd(seed, i, k) {
    var x = Math.sin((seed || 1) * 7919 + i * 127.1 + (k || 0) * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // ----- Chủ đề theo cảnh: kind quyết định chuyển động + màu hạt -----
  // fall: rơi xuống | rise: bốc lên | wander: lơ lửng quanh điểm neo |
  // blink: nhấp nháy tại chỗ (đom đóm) | spark: tia điện đời ngắn.
  var THEMES = {
    realm_vuon_duoc:    { kind: 'fall',  name: 'Cánh hoa linh dược', colors: ['255,183,214', '178,240,178'], speed: 13, size: 3.2, alpha: 0.75 },
    realm_sao_yeu:      { kind: 'fall',  name: 'Bào tử độc',         colors: ['150,230,120', '110,200,160'], speed: 8,  size: 2.6, alpha: 0.6 },
    realm_linh_moc:     { kind: 'fall',  name: 'Lá linh mộc rơi',    colors: ['120,220,120', '190,230,130'], speed: 16, size: 3.6, alpha: 0.8 },
    realm_linh_thu_vien:{ kind: 'blink', name: 'Đom đóm linh thú',   colors: ['255,240,150', '190,255,170'], speed: 6,  size: 2.4, alpha: 0.85 },
    realm_co_chien_truong: { kind: 'fall', name: 'Tro bụi chiến trường', colors: ['210,200,185', '170,160,150'], speed: 7, size: 2.2, alpha: 0.5 },
    realm_dia_mach_hoa: { kind: 'rise',  name: 'Tàn lửa địa mạch',   colors: ['255,170,70', '255,110,50'],  speed: 22, size: 2.6, alpha: 0.85 },
    realm_kiem_mo:      { kind: 'rise',  name: 'Kiếm khí mờ',        colors: ['190,235,255', '220,245,255'], speed: 9,  size: 3.0, alpha: 0.55 },
    realm_han_bang:     { kind: 'fall',  name: 'Tuyết rơi',           colors: ['255,255,255', '225,240,255'], speed: 19, size: 2.6, alpha: 0.9 },
    realm_bai_tinh_anh: { kind: 'wander', name: 'Linh quang vàng',   colors: ['255,215,110', '255,190,80'],  speed: 7,  size: 2.6, alpha: 0.8 },
    realm_thuy_phu:     { kind: 'rise',  name: 'Bọt nước thủy phủ',  colors: ['190,230,255', '230,248,255'], speed: 17, size: 2.8, alpha: 0.7 },
    realm_loi_vuc:      { kind: 'spark', name: 'Tia điện tàn tích',  colors: ['255,240,160', '200,170,255'], speed: 0,  size: 2.4, alpha: 0.95 }
  };
  var MAP_IDS = {};
  Object.keys(THEMES).forEach(function (id) { MAP_IDS[id] = true; });

  var N_THEMED = 46, N_MOTES = 22, N_SHARDS = 9;

  function seedOf(mapId) {
    var s = 0;
    for (var i = 0; i < mapId.length; i++) s = (s * 31 + mapId.charCodeAt(i)) % 9973;
    return s + 11;
  }

  function createState(mapId, mapWpx, mapHpx) {
    var theme = THEMES[mapId] || null;
    var seed = seedOf(mapId || 'realm');
    var W = mapWpx || 48 * TILE, H = mapHpx || 36 * TILE;
    var themed = [], i;
    for (i = 0; i < N_THEMED; i++) {
      themed.push({
        x: rnd(seed, i, 1) * W, y: rnd(seed, i, 2) * H,
        sp: 0.7 + rnd(seed, i, 3) * 0.7,           // hệ số tốc độ riêng
        swayAmp: 10 + rnd(seed, i, 4) * 22,
        swayPer: 2.6 + rnd(seed, i, 5) * 3.4,
        ph: rnd(seed, i, 6) * Math.PI * 2,
        ci: i % 2,
        life: rnd(seed, i, 7), maxLife: 0.5 + rnd(seed, i, 8) * 0.9 // cho spark
      });
    }
    var motes = [];
    for (i = 0; i < N_MOTES; i++) {
      motes.push({
        x: rnd(seed, 200 + i, 1) * W, y: rnd(seed, 200 + i, 2) * H,
        r: 14 + rnd(seed, 200 + i, 3) * 26,
        per: 5 + rnd(seed, 200 + i, 4) * 6,
        ph: rnd(seed, 200 + i, 5) * Math.PI * 2,
        a: 0.25 + rnd(seed, 200 + i, 6) * 0.35
      });
    }
    var shards = [];
    for (i = 0; i < N_SHARDS; i++) {
      shards.push({
        x: rnd(seed, 400 + i, 1) * W, y: rnd(seed, 400 + i, 2) * H,
        s: 7 + rnd(seed, 400 + i, 3) * 12,
        rot: rnd(seed, 400 + i, 4) * Math.PI * 2,
        vr: (rnd(seed, 400 + i, 5) - 0.5) * 0.5,
        vx: (rnd(seed, 400 + i, 6) - 0.5) * 7, vy: (rnd(seed, 400 + i, 7) - 0.5) * 4,
        a: 0.16 + rnd(seed, 400 + i, 8) * 0.16
      });
    }
    return { t: 0, mapId: mapId, theme: theme, seed: seed, W: W, H: H, themed: themed, motes: motes, shards: shards };
  }

  function wrap(v, max) { v %= max; return v < 0 ? v + max : v; }

  function update(state, dt) {
    if (!state || !(dt > 0)) return state;
    dt = Math.min(dt, 1);
    state.t += dt;
    var th = state.theme, W = state.W, H = state.H;
    if (th) {
      state.themed.forEach(function (p, i) {
        if (th.kind === 'fall') { p.y += th.speed * p.sp * dt; p.x += Math.sin(state.t * 0.7 + p.ph) * 4 * dt; }
        else if (th.kind === 'rise') { p.y -= th.speed * p.sp * dt; p.x += Math.sin(state.t * 0.9 + p.ph) * 5 * dt; }
        else if (th.kind === 'wander' || th.kind === 'blink') {
          p.x += Math.sin(state.t * 0.23 + p.ph + i) * 3.2 * dt;
          p.y += Math.cos(state.t * 0.19 + p.ph) * 2.6 * dt;
        } else if (th.kind === 'spark') {
          p.life += dt;
          if (p.life >= p.maxLife) { // tia mới ở vị trí ngẫu nhiên khác
            p.life = 0; p.maxLife = 0.4 + rnd(state.seed, Math.floor(state.t * 7) + i, 3) * 1.1;
            p.x = rnd(state.seed, Math.floor(state.t * 13) + i, 1) * W;
            p.y = rnd(state.seed, Math.floor(state.t * 13) + i, 2) * H;
          }
        }
        p.x = wrap(p.x, W); p.y = wrap(p.y, H);
      });
    }
    state.shards.forEach(function (s) {
      s.x = wrap(s.x + s.vx * dt, W); s.y = wrap(s.y + s.vy * dt, H);
      s.rot += s.vr * dt;
    });
    return state;
  }

  // Vị trí VẼ của 1 hạt chủ đề tại thời gian state.t (lắc ngang theo sin
  // cho hạt rơi/bốc — cảm giác bay lượn thay vì trượt thẳng).
  function themedPos(state, p) {
    var th = state.theme;
    var x = p.x, y = p.y;
    if (th && (th.kind === 'fall' || th.kind === 'rise')) {
      x += Math.sin(state.t / p.swayPer * Math.PI * 2 + p.ph) * p.swayAmp * 0.4;
    }
    return { x: x, y: y };
  }

  // Danh sách item vẽ theo lớp + mức đồ hoạ (lọc ở đây như clouds.js).
  function layers(state, quality) {
    var q = normQ(quality || getQuality());
    var out = { below: [], above: [] };
    if (!state) return out;
    var t = state.t;
    // Mảnh hư không + linh quang: lớp dưới (trên nền, dưới thực thể).
    var nShards = q === 'cao' ? state.shards.length : (q === 'trung' ? 5 : 0);
    for (var i = 0; i < nShards; i++) {
      var s = state.shards[i];
      out.below.push({ kind: 'shard', x: s.x, y: s.y, s: s.s, rot: s.rot + t * 0.05, a: s.a });
    }
    var nMotes = q === 'cao' ? state.motes.length : (q === 'trung' ? 12 : 6);
    for (var m = 0; m < nMotes; m++) {
      var mo = state.motes[m];
      out.below.push({
        kind: 'mote',
        x: mo.x + Math.sin(t / mo.per * Math.PI * 2 + mo.ph) * mo.r,
        y: mo.y + Math.cos(t / (mo.per * 1.3) * Math.PI * 2 + mo.ph) * mo.r * 0.5,
        s: 2.2, a: mo.a * (q === 'thap' ? 0.35 : 1)
      });
    }
    // Hạt chủ đề: lớp trên. Thấp tắt hẳn.
    if (state.theme && q !== 'thap') {
      var nTh = q === 'cao' ? state.themed.length : 26;
      for (var k = 0; k < nTh; k++) {
        var p = state.themed[k], pos = themedPos(state, p), a = state.theme.alpha;
        if (state.theme.kind === 'blink') a *= 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + p.ph));
        if (state.theme.kind === 'spark') {
          var lr = p.life / p.maxLife;
          a *= lr < 0.15 ? (lr / 0.15) : Math.max(0, 1 - (lr - 0.15) / 0.85);
        }
        out.above.push({ kind: 'themed', x: pos.x, y: pos.y, s: state.theme.size * (0.8 + 0.4 * p.sp), a: a, ci: p.ci, ph: p.ph });
      }
    }
    return out;
  }

  // ----- Raster hoá sprite hạt (chỉ trình duyệt; Node/test tự bỏ qua) --
  var _cache = {};
  function dotCanvas(rgb, hard) {
    var key = rgb + (hard ? 'h' : 's');
    if (key in _cache) return _cache[key];
    var img = null;
    try {
      if (typeof document !== 'undefined' && document.createElement) {
        var c = document.createElement('canvas');
        c.width = 24; c.height = 24;
        var g = c.getContext && c.getContext('2d');
        if (g && g.createRadialGradient) {
          var gr = g.createRadialGradient(12, 12, 0, 12, 12, 12);
          gr.addColorStop(0, 'rgba(' + rgb + ',1)');
          gr.addColorStop(hard ? 0.35 : 0.25, 'rgba(' + rgb + ',0.55)');
          gr.addColorStop(1, 'rgba(' + rgb + ',0)');
          g.fillStyle = gr;
          g.fillRect(0, 0, 24, 24);
          img = c;
        }
      }
    } catch (e) { img = null; }
    _cache[key] = img;
    return img;
  }

  function drawDot(ctx, rgb, x, y, r, a, hard) {
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    var img = dotCanvas(rgb, hard);
    if (img && ctx.drawImage) {
      ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    } else if (ctx.createRadialGradient) {
      var gr = ctx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(' + rgb + ',1)');
      gr.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = gr;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    } else if (ctx.ellipse && ctx.fill) {
      var parts = rgb.split(',');
      ctx.fillStyle = 'rgb(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ')';
      ctx.beginPath(); ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShard(ctx, it, camX, camY) {
    var x = it.x - camX, y = it.y - camY;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(it.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, it.a));
    // Mảnh vỡ không gian: thoi tím sẫm viền sáng — phần của thân cảnh
    // (không gian nứt), không phải vật thể rơi.
    ctx.beginPath();
    ctx.moveTo(0, -it.s);
    ctx.lineTo(it.s * 0.55, it.s * 0.3);
    ctx.lineTo(0, it.s);
    ctx.lineTo(-it.s * 0.55, it.s * 0.3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(64,40,110,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(196,168,255,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawLayer(ctx, items, camX, camY, viewW, viewH, state, layerName) {
    if (!ctx || !items) return;
    items.forEach(function (it) {
      var sx = it.x - camX, sy = it.y - camY;
      if (sx < -40 || sx > viewW + 40 || sy < -40 || sy > viewH + 40) return;
      if (it.kind === 'shard') { drawShard(ctx, it, camX, camY); return; }
      if (it.kind === 'mote') { drawDot(ctx, '206,184,255', sx, sy, it.s * 2.4, it.a, false); return; }
      // themed
      var th = state.theme;
      var rgb = th.colors[it.ci] || th.colors[0];
      if (th.kind === 'spark') {
        // Tia điện: chấm sáng lõi cứng + quầng, chớp theo pha.
        drawDot(ctx, rgb, sx, sy, it.s * 3.4, it.a * 0.5, false);
        drawDot(ctx, '255,255,240', sx, sy, it.s * 1.1, it.a, true);
      } else if (th.kind === 'rise' && state.mapId === 'realm_thuy_phu') {
        // Bọt nước: vòng tròn rỗng viền sáng thay vì đốm đặc.
        ctx.globalAlpha = Math.max(0, Math.min(1, it.a));
        ctx.strokeStyle = 'rgba(' + rgb + ',0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(sx, sy, it.s * 1.15, it.s * 1.15, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (th.kind === 'fall' && (state.mapId === 'realm_linh_moc' || state.mapId === 'realm_vuon_duoc')) {
        // Lá/cánh hoa: elip xoay theo pha — nhìn ra vật đang rơi xoay.
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.sin(state.t * 1.3 + it.ph) * 0.9);
        ctx.globalAlpha = Math.max(0, Math.min(1, it.a));
        ctx.fillStyle = 'rgba(' + rgb + ',0.85)';
        ctx.beginPath(); ctx.ellipse(0, 0, it.s * 1.25, it.s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      } else {
        drawDot(ctx, rgb, sx, sy, it.s * 2.2, it.a, th.kind === 'rise');
      }
    });
  }

  function drawBelow(ctx, state, camX, camY, viewW, viewH, quality) {
    var ly = layers(state, quality);
    drawLayer(ctx, ly.below, camX, camY, viewW, viewH, state, 'below');
  }
  function drawAbove(ctx, state, camX, camY, viewW, viewH, quality) {
    var ly = layers(state, quality);
    drawLayer(ctx, ly.above, camX, camY, viewW, viewH, state, 'above');
  }

  function snapshot(state, quality) {
    var ly = layers(state, quality);
    function round(list) {
      return list.map(function (it) { return { kind: it.kind, x: Math.round(it.x), y: Math.round(it.y) }; });
    }
    return {
      t: state ? state.t : 0,
      mapId: state ? state.mapId : null,
      theme: state && state.theme ? state.theme.kind : null,
      counts: {
        below: ly.below.length, above: ly.above.length,
        shards: ly.below.filter(function (i) { return i.kind === 'shard'; }).length,
        motes: ly.below.filter(function (i) { return i.kind === 'mote'; }).length,
        themed: ly.above.length
      },
      belowPos: round(ly.below), abovePos: round(ly.above)
    };
  }

  var api = {
    QUALITY_KEY: QUALITY_KEY, THEMES: THEMES, MAP_IDS: MAP_IDS,
    N_THEMED: N_THEMED, N_MOTES: N_MOTES, N_SHARDS: N_SHARDS,
    getQuality: getQuality, normQ: normQ,
    createState: createState, update: update, layers: layers,
    drawBelow: drawBelow, drawAbove: drawAbove, snapshot: snapshot,
    activeFor: function (mapId) { return !!MAP_IDS[mapId]; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_REALM_AMBIENT = api;
})();
