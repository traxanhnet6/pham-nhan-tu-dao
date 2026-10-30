// Phàm Nhân Tu Đạo — engine hiệu ứng kỹ năng (canvas, vẽ theo lớp).
// Mỗi chiêu có đúng 20 frame hiệu ứng. Lõi là describe(fx, frame, quality)
// trả về danh sách nguyên thủy vẽ (glow / hạt / vòng / vệt / đa giác) tính
// thuần từ (skill, frame, seed) — cùng một dữ liệu này dùng cho: canvas
// trong game, test Node (đủ 20 frame khác nhau, mật độ hạt theo mức đồ hoạ)
// và script render ảnh xem trước bằng PIL. Không dùng emoji, không ảnh tĩnh.
// Lớp hiệu ứng: hào quang phát sáng (glow, cộng sáng 'lighter') -> thân chiêu
// (vệt kiếm, sóng khí, trụ đá, tia sét) -> hạt (tia lửa, bụi, lá, tuyết, than)
// -> vòng chấn động mặt đất. Mức đồ hoạ: Cao = đủ hạt + glow + bóng mờ vệt;
// Trung bình = ~55% hạt, còn glow; Thấp = ~28% hạt, bỏ glow/bóng mờ nhưng
// thân chiêu vẫn nguyên vẹn để đọc được chiêu.
// KHÓA CHẤT LƯỢNG DÙNG CHUNG: window.PNT_GFX_QUALITY hoặc
// localStorage 'pnt-gfx-quality' ('cao' | 'trung' | 'thap') — team đồ hoạ
// nối cài đặt 3 mức của game vào đúng khóa này thì hiệu ứng tự bám theo.
(function () {
  'use strict';
  var FRAMES = 20;
  var QUALITY_KEY = 'pnt-gfx-quality';
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
  function density(q) { return q === 'cao' ? 1 : (q === 'trung' ? 0.55 : 0.28); }
  function frameOf(t01) { return Math.max(0, Math.min(FRAMES - 1, Math.floor(t01 * FRAMES))); }
  // Hash xác định: cùng (seed, i, k) luôn cho cùng một số 0..1 ở mọi máy.
  function rnd(seed, i, k) {
    var x = Math.sin((seed || 1) * 7919 + i * 127.1 + (k || 0) * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function dirAng(dir) { return dir === 'up' ? -Math.PI / 2 : dir === 'left' ? Math.PI : dir === 'right' ? 0 : Math.PI / 2; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function easeOut(p) { return 1 - (1 - p) * (1 - p); }
  // ---------- Các họ hình cơ bản ----------
  function arcBand(cx, cy, angC, span, rOut, rIn, squash) {
    var pts = [], i, a, steps = 10;
    for (i = 0; i <= steps; i++) { a = angC - span / 2 + span * i / steps; pts.push([cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut * squash]); }
    for (i = steps; i >= 0; i--) { a = angC - span / 2 + span * i / steps; pts.push([cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn * squash]); }
    return pts;
  }
  function shard(cx, cy, ang, len, wid, squash) {
    var dx = Math.cos(ang), dy = Math.sin(ang) * (squash || 1);
    var px = -Math.sin(ang), py = Math.cos(ang) * (squash || 1);
    return [
      [cx - dx * len * 0.35, cy - dy * len * 0.35],
      [cx + px * wid, cy + py * wid],
      [cx + dx * len * 0.65, cy + dy * len * 0.65],
      [cx - px * wid, cy - py * wid]
    ];
  }
  function dots(out, seed, n, q, fn) {
    var c = Math.max(2, Math.round(n * density(q)));
    for (var i = 0; i < c; i++) { var d = fn(i); if (d) out.push(d); }
  }
  // ---------- Mô tả từng chiêu ----------
  function descCombo(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y - 46, gy = fx.y - 2;
    var step = fx.step || 0, da = dirAng(fx.dir);
    var env = Math.sin(Math.PI * clamp01(p * 1.12));
    var sweep = step === 1 ? (da + 1.25 - p * 1.95) : (da - 1.25 + p * 1.95);
    var R = (step === 2 ? 36 : 30) + p * (step === 2 ? 24 : 16);
    out.push({ k: 'glow', x: cx + Math.cos(da) * 22, y: cy + Math.sin(da) * 16, r: R * 0.9, c: '#ffe9a8', a: 0.20 * env });
    out.push({ k: 'poly', pts: arcBand(cx, cy, sweep, step === 2 ? 1.5 : 1.05, R + 6, R - 14, 0.82), c: '#f2c14e', a: 0.35 * env });
    out.push({ k: 'poly', pts: arcBand(cx, cy, sweep, step === 2 ? 1.3 : 0.9, R, R - 8, 0.82), c: '#fff7cc', a: 0.9 * env });
    if (step === 2) out.push({ k: 'ring', x: cx, y: gy, rx: R * 0.95, ry: R * 0.4, w: 3, c: '#ffe9a8', a: 0.5 * env });
    dots(out, fx.seed, 9, q, function (i) {
      var a = sweep + (rnd(fx.seed, i, 1) - 0.5) * 1.1, rr = R + rnd(fx.seed, i, 2) * 12;
      return { k: 'dot', x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.82, r: 1.6 + rnd(fx.seed, i, 3) * 1.6, c: i % 3 ? '#fff7cc' : '#f2c14e', a: 0.85 * env };
    });
    return out;
  }
  function descKiemKhi(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y;
    var da = dirAng(fx.dir), dx = Math.cos(da), dy = Math.sin(da);
    var px = -dy, py = dx;
    var pulse = 1 + 0.07 * Math.sin(p * Math.PI * 4);
    var W = 30 * pulse, wide = fx.wide ? 1.5 : 1;
    function crescent(off, scale, color, alpha) {
      // Lưỡi liềm kiếm khí thật: hai đường cong gặp nhau ở hai đầu nhọn,
      // phình ở giữa theo hướng bay — không phải khối bầu dục đặc.
      var pts = [], i, t;
      for (i = 0; i <= 8; i++) { t = -1 + i / 4; pts.push([cx + dx * (off + (12 - 20 * t * t) * scale) + px * t * W * wide * scale, cy + dy * (off + (12 - 20 * t * t) * scale) + py * t * W * wide * scale]); }
      for (i = 8; i >= 0; i--) { t = -1 + i / 4; pts.push([cx + dx * (off + (0 - 8 * t * t) * scale) + px * t * W * wide * scale, cy + dy * (off + (0 - 8 * t * t) * scale) + py * t * W * wide * scale]); }
      return { k: 'poly', pts: pts, c: color, a: alpha };
    }
    var edge = fx.color || '#9fd8ff';
    var shim = Math.sin(f * 1.93) * 1.3;
    out.push({ k: 'glow', x: cx, y: cy, r: 34 * wide, c: edge, a: 0.32 });
    out.push(crescent(2 + shim, 1.22, edge, 0.35));
    out.push(crescent(shim, 1, '#f4fdff', 0.95));
    dots(out, fx.seed, fx.wide ? 15 : 10, q, function (i) {
      var back = 8 + ((i * 6.5 + f * 3.7) % 60), spread = (rnd(fx.seed, i, 1) - 0.5) * (14 + back * 0.35);
      return { k: 'dot', x: cx - dx * back + px * spread, y: cy - dy * back + py * spread, r: Math.max(0.8, 2.8 - back * 0.03), c: i % 2 ? '#ffffff' : edge, a: 0.75 * (1 - back / 75) };
    });
    for (var li = 0; li < 3; li++) {
      var off = (li - 1) * 15;
      out.push({ k: 'line', x1: cx - dx * 36 + px * off, y1: cy - dy * 36 + py * off, x2: cx - dx * 8 + px * off, y2: cy - dy * 8 + py * off, w: 1.6, c: '#ffffff', a: 0.30 });
    }
    if (fx.wide) dots(out, fx.seed + 5, 8, q, function (i) {
      return { k: 'dot', x: cx + (rnd(fx.seed, i, 6) - 0.5) * 44, y: cy + 12 + p * 16 * rnd(fx.seed, i, 7), r: 1.8, c: '#dff4ff', a: 0.7 };
    });
    return out;
  }
  function descToanPhong(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y - 46, gy = fx.y - 2;
    var R = 24 + p * 76, rot = p * Math.PI * 3;
    var fade = 1 - p * 0.45;
    out.push({ k: 'ring', x: cx, y: gy, rx: R, ry: R * 0.42, w: 3, c: '#ffe9a8', a: 0.55 * fade });
    out.push({ k: 'ring', x: cx, y: gy, rx: R * 0.55, ry: R * 0.24, w: 2, c: '#ffffff', a: 0.35 * fade });
    out.push({ k: 'glow', x: cx, y: cy, r: R * 0.85, c: '#e8f6ff', a: 0.13 * fade });
    for (var i = 0; i < 8; i++) {
      var a = rot + i * Math.PI / 4;
      var sx = cx + Math.cos(a) * R * 0.82, sy = cy + Math.sin(a) * R * 0.36;
      out.push({ k: 'poly', pts: shard(sx, sy, a + Math.PI / 2, 24, 4.5, 0.9), c: '#f4fdff', a: 0.9 * fade });
      out.push({ k: 'poly', pts: shard(sx, sy, a + Math.PI / 2, 30, 7, 0.9), c: '#9fd8ff', a: 0.25 * fade });
    }
    dots(out, fx.seed, 20, q, function (i) {
      var ang = i * 2.4 + rot * 1.35, rad = 14 + p * 82 * (0.4 + rnd(fx.seed, i, 1) * 0.6);
      return { k: 'dot', x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad * 0.45, r: 1.6 + rnd(fx.seed, i, 2) * 1.8, c: i % 3 === 0 ? '#7fae4c' : '#c9a86a', a: 0.85 * (1 - p * 0.7) };
    });
    return out;
  }
  function descLuuTinh(fx, f, q, P) {
    var p = f / 19, out = [], hx = fx.x, hy = fx.y;
    var da = dirAng(fx.dir), dx = Math.cos(da), dy = Math.sin(da);
    var px = -dy, py = dx;
    var tail = fx.from ? { x: fx.from.x, y: fx.from.y } : { x: hx - dx * 96, y: hy - dy * 96 };
    var fade = 1 - p * 0.35;
    function ribbon(w0, color, alpha) {
      var pts = [], i, fr;
      for (i = 0; i <= 5; i++) { fr = i / 5; pts.push([tail.x + (hx - tail.x) * fr + px * w0 * (1 - fr), tail.y + (hy - tail.y) * fr + py * w0 * (1 - fr)]); }
      for (i = 5; i >= 0; i--) { fr = i / 5; pts.push([tail.x + (hx - tail.x) * fr - px * w0 * (1 - fr), tail.y + (hy - tail.y) * fr - py * w0 * (1 - fr)]); }
      return { k: 'poly', pts: pts, c: color, a: alpha };
    }
    out.push(ribbon(13, fx.color || '#ffe9a8', 0.30 * fade));
    out.push(ribbon(6, '#ffffff', 0.9 * fade));
    out.push({ k: 'glow', x: hx, y: hy, r: 22, c: '#fff7cc', a: 0.5 * fade });
    for (var s = 0; s < 4; s++) {
      var sa = p * Math.PI + s * Math.PI / 2;
      out.push({ k: 'poly', pts: shard(hx, hy, sa, 17, 3, 1), c: '#fff7cc', a: 0.8 * fade });
    }
    dots(out, fx.seed, 10, q, function (i) {
      var back = 12 + i * 9, spread = (rnd(fx.seed, i, 1) - 0.5) * 12;
      return { k: 'dot', x: hx - dx * back + px * spread, y: hy - dy * back + py * spread, r: 1.5, c: '#ffffff', a: 0.7 * fade * (1 - i / 11) };
    });
    return out;
  }
  function descNguKiem(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y - 46, gy = fx.y - 2;
    var A = p * Math.PI * 2;
    out.push({ k: 'ring', x: cx, y: cy + 8, rx: 47, ry: 20, w: 1.6, c: '#ffe9a8', a: 0.30 });
    out.push({ k: 'poly', pts: arcBand(cx, cy + 8, A - Math.PI / 2 - 0.45, 0.9, 50, 44, 0.43), c: '#ffe9a8', a: 0.45 });
    var sx = cx + Math.cos(A) * 47, sy = cy + 8 + Math.sin(A) * 20 + Math.sin(p * Math.PI * 4) * 2.5;
    out.push({ k: 'glow', x: sx, y: sy, r: 13, c: '#fff7cc', a: 0.4 });
    out.push({ k: 'poly', pts: shard(sx, sy, A + Math.PI / 2, 23, 4.5, 1), c: '#f4fdff', a: 0.95 });
    out.push({ k: 'poly', pts: shard(sx, sy, A + Math.PI / 2, 12, 2.2, 1), c: '#f2c14e', a: 0.9 });
    dots(out, fx.seed, 6, q, function (i) {
      var a = rnd(fx.seed, i, 1) * Math.PI * 2 + p * 2;
      return { k: 'dot', x: cx + Math.cos(a) * 47, y: cy + 8 + Math.sin(a) * 20, r: 1.4, c: '#fff7cc', a: 0.35 + 0.4 * Math.abs(Math.sin(p * Math.PI * 2 + i)) };
    });
    return out;
  }
  function descKim(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, gy = fx.y, cy = gy - 40, R = fx.radius || 88;
    out.push({ k: 'ring', x: cx, y: gy, rx: R * (0.4 + 0.6 * p), ry: R * 0.42 * (0.4 + 0.6 * p), w: 3, c: '#ffd94a', a: 0.55 });
    out.push({ k: 'glow', x: cx, y: cy, r: R * 0.75, c: '#ffd94a', a: 0.16 });
    for (var i = 0; i < 14; i++) {
      var delay = i / 14 * 0.45, pi = clamp01((p - delay) / 0.4);
      if (pi <= 0) continue;
      var sx = cx + (rnd(fx.seed, i, 1) - 0.5) * 2 * R * 0.78;
      var sgy = gy + (rnd(fx.seed, i, 2) - 0.5) * R * 0.5;
      var sy = sgy - (1 - easeOut(pi)) * (1 - easeOut(pi)) * 135;
      out.push({ k: 'line', x1: sx, y1: sy - 44, x2: sx, y2: sy - 16, w: 2, c: '#ffe9a8', a: 0.5 * pi, g: 1 });
      out.push({ k: 'poly', pts: shard(sx, sy, Math.PI / 2, 27, 4, 1), c: '#ffd94a', a: 0.95 });
      out.push({ k: 'poly', pts: shard(sx, sy, Math.PI / 2, 15, 2, 1), c: '#fff7cc', a: 0.95 });
      if (pi >= 1) {
        var ip = clamp01((p - delay - 0.4) / 0.3);
        out.push({ k: 'ring', x: sx, y: sgy, rx: 8 + ip * 18, ry: 4 + ip * 7, w: 2, c: '#ffd94a', a: 0.6 * (1 - ip) });
        out.push({ k: 'glow', x: sx, y: sgy - 6, r: 10, c: '#ffd94a', a: 0.4 * (1 - ip) });
      }
    }
    return out;
  }
  function descHoa(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, gy = fx.y, cy = gy - 36, R = fx.radius || 102;
    out.push({ k: 'ring', x: cx, y: gy, rx: R * 0.8, ry: R * 0.34, w: 10, c: '#3a1c08', a: 0.20 });
    out.push({ k: 'ring', x: cx, y: gy, rx: R * (0.2 + p * 1.05), ry: R * 0.42 * (0.2 + p * 1.05), w: 4, c: '#ffd9a8', a: 0.6 * (1 - p) });
    out.push({ k: 'glow', x: cx, y: cy, r: R * (0.5 + p * 0.7), c: '#ff9a3c', a: 0.42 * (1 - p) + 0.10 });
    out.push({ k: 'glow', x: cx, y: cy, r: R * 0.42 * (1 - p * 0.4), c: '#fff3d6', a: 0.5 * (1 - p) });
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * Math.PI * 2 + p * 0.8;
      var len = R * (0.55 + 0.45 * Math.sin(Math.PI * clamp01(p * 1.1))) * (0.7 + rnd(fx.seed, i, 1) * 0.5);
      var bx = cx + Math.cos(a) * 8, by = cy + Math.sin(a) * 6;
      var tx = cx + Math.cos(a) * len, ty = cy + Math.sin(a) * len * 0.82;
      var mx = cx + Math.cos(a) * len * 0.5 + (-Math.sin(a)) * 9 * Math.sin(p * 3 + i);
      var my = cy + Math.sin(a) * len * 0.41 + Math.cos(a) * 4;
      out.push({ k: 'poly', pts: [[bx - (-Math.sin(a)) * 7, by - Math.cos(a) * 5], [mx, my], [tx, ty], [bx + (-Math.sin(a)) * 7, by + Math.cos(a) * 5]], c: i % 3 === 0 ? '#ff5a2a' : (i % 3 === 1 ? '#ff7a3c' : '#ffb03a'), a: 0.85 * (1 - p * 0.35) });
    }
    dots(out, fx.seed, 17, q, function (i) {
      var a = rnd(fx.seed, i, 1) * Math.PI * 2, rad = p * R * (0.3 + rnd(fx.seed, i, 2) * 0.7);
      return { k: 'dot', x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad * 0.7 - p * 34 * rnd(fx.seed, i, 3), r: 1.4 + rnd(fx.seed, i, 4) * 1.8, c: i % 2 ? '#ffb03a' : '#ff7a3c', a: 0.9 * (1 - p) };
    });
    return out;
  }
  function descBang(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, gy = fx.y, cy = gy - 30, R = fx.radius || 94;
    var ep = easeOut(p);
    out.push({ k: 'ring', x: cx, y: gy, rx: R * (0.3 + 0.7 * ep), ry: R * 0.45 * (0.3 + 0.7 * ep), w: 11, c: '#dff4ff', a: 0.38 });
    out.push({ k: 'glow', x: cx, y: cy, r: R * 0.8, c: '#bfe3ff', a: 0.26 * (1 - p * 0.4) });
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2 + 0.3;
      var rad = R * (0.25 + 0.72 * ep) * (0.8 + rnd(fx.seed, i, 1) * 0.35);
      var sx = cx + Math.cos(a) * rad, sy = gy + Math.sin(a) * rad * 0.45 - 6;
      out.push({ k: 'poly', pts: shard(sx, sy, a, 21 * (0.6 + rnd(fx.seed, i, 2) * 0.6), 5.5, 0.8), c: '#bfe3ff', a: 0.9 });
      out.push({ k: 'poly', pts: shard(sx, sy, a, 11, 2.4, 0.8), c: '#ffffff', a: 0.95 });
    }
    for (var cix = 0; cix < 6; cix++) {
      var px2 = cx + (rnd(fx.seed, cix, 5) - 0.5) * R * 1.2, pgy = gy + (rnd(fx.seed, cix, 6) - 0.5) * R * 0.5;
      var h = 26 * ep * (0.6 + rnd(fx.seed, cix, 7) * 0.7);
      out.push({ k: 'poly', pts: [[px2 - 6, pgy], [px2, pgy - h], [px2 + 6, pgy], [px2, pgy - h * 0.4]], c: '#dff4ff', a: 0.85 });
    }
    dots(out, fx.seed, 15, q, function (i) {
      return { k: 'dot', x: cx + (rnd(fx.seed, i, 8) - 0.5) * R * 1.7 + Math.sin(p * 5 + i) * 3, y: cy - 52 + ((p * 66 + rnd(fx.seed, i, 9) * 44) % 88), r: 1.3 + rnd(fx.seed, i, 10) * 1.2, c: '#ffffff', a: 0.8 };
    });
    return out;
  }
  function descMoc(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y - 46, gy = fx.y - 2, R = fx.radius || 96;
    out.push({ k: 'ring', x: cx, y: gy, rx: R * (0.35 + 0.65 * p), ry: R * 0.42 * (0.35 + 0.65 * p), w: 3, c: '#69d66f', a: 0.55 * (1 - p * 0.4) });
    out.push({ k: 'glow', x: cx, y: cy, r: R * 0.7, c: '#69d66f', a: 0.16 });
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2 + 0.4, pts = [], k;
      for (k = 0; k <= 4; k++) {
        var fr = k / 4, rad = R * easeOut(p) * fr * (0.7 + rnd(fx.seed, i, 1) * 0.4);
        pts.push([cx + Math.cos(a) * rad + Math.sin(fr * 5 + i * 2) * 6 * fr, gy + Math.sin(a) * rad * 0.42 - fr * 14]);
      }
      out.push({ k: 'line', pts: pts, w: 5.5, c: '#3e8e41', a: 0.9 });
      out.push({ k: 'line', pts: pts, w: 2.2, c: '#69d66f', a: 0.95 });
    }
    dots(out, fx.seed, 12, q, function (i) {
      var a = i / 7 * Math.PI * 2 + 0.4, rad = R * easeOut(p) * (0.5 + rnd(fx.seed, i, 3) * 0.5);
      return { k: 'dot', x: cx + Math.cos(a) * rad, y: gy + Math.sin(a) * rad * 0.42 - 12, r: 2.6, c: '#7fae4c', a: 0.9 };
    });
    dots(out, fx.seed + 9, 10, q, function (i) {
      return { k: 'dot', x: cx + (rnd(fx.seed, i, 4) - 0.5) * 38, y: cy + 22 - p * 56 * (0.5 + rnd(fx.seed, i, 5) * 0.6), r: 2.2, c: '#baffc0', a: Math.sin(Math.PI * clamp01(p * 1.1)) * 0.95 };
    });
    return out;
  }
  function descTho(fx, f, q, P) {
    var p = f / 19, out = [], fx0 = fx.x, fy0 = fx.y;
    var da = dirAng(fx.dir), dx = Math.cos(da), dy = Math.sin(da);
    var maxD = 26 + 4 * 30;
    out.push({ k: 'line', x1: fx0 + dx * 8, y1: fy0 + dy * 4, x2: fx0 + dx * maxD * easeOut(p), y2: fy0 + dy * maxD * 0.8 * easeOut(p), w: 3.4, c: '#4a3220', a: 0.8 });
    for (var b = 0; b < 6; b++) {
      var bd = 14 + rnd(fx.seed, b, 1) * maxD * 0.9 * easeOut(p);
      var ba = da + (b % 2 ? 1 : -1) * (0.5 + rnd(fx.seed, b, 2) * 0.5);
      var bl = 10 + rnd(fx.seed, b, 3) * 9;
      out.push({ k: 'line', x1: fx0 + dx * bd, y1: fy0 + dy * bd * 0.8, x2: fx0 + dx * bd + Math.cos(ba) * bl, y2: fy0 + dy * bd * 0.8 + Math.sin(ba) * bl * 0.8, w: 1.8, c: '#4a3220', a: 0.65 });
    }
    for (var i = 0; i < 5; i++) {
      var delay = i * 0.09, pi = clamp01((p - delay) / 0.35);
      if (pi <= 0) continue;
      var dist = 26 + i * 30;
      var bx = fx0 + dx * dist, by = fy0 + dy * dist * 0.8;
      var h = 36 * easeOut(pi) * (0.8 + rnd(fx.seed, i, 4) * 0.45), w = 21;
      out.push({ k: 'poly', pts: [[bx - w / 2, by], [bx - w * 0.28, by - h * 0.6], [bx + (rnd(fx.seed, i, 5) - 0.5) * 5, by - h], [bx + w * 0.24, by - h * 0.68], [bx + w / 2, by]], c: '#8a6a44', a: 0.98 });
      out.push({ k: 'poly', pts: [[bx - w * 0.26, by], [bx - w * 0.1, by - h * 0.55], [bx + (rnd(fx.seed, i, 5) - 0.5) * 3, by - h * 0.8], [bx + w * 0.14, by - h * 0.6], [bx + w * 0.26, by]], c: '#d99a4e', a: 0.9 });
      out.push({ k: 'ring', x: bx, y: by, rx: w * 0.7, ry: w * 0.3, w: 2, c: '#c9a86a', a: 0.5 * (1 - pi * 0.5) });
    }
    dots(out, fx.seed, 11, q, function (i) {
      var dist = 16 + rnd(fx.seed, i, 6) * maxD;
      return { k: 'dot', x: fx0 + dx * dist + (rnd(fx.seed, i, 7) - 0.5) * 26, y: fy0 + dy * dist * 0.8 - p * 18 * rnd(fx.seed, i, 8), r: 1.6 + rnd(fx.seed, i, 9) * 1.6, c: '#c9a86a', a: 0.8 * (1 - p * 0.5) };
    });
    return out;
  }
  function descPhong(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y;
    out.push({ k: 'poly', pts: [[cx - 11, cy + 27], [cx - 31, cy - 30], [cx + 31, cy - 30], [cx + 11, cy + 27]], c: '#9ad6a8', a: 0.13 });
    out.push({ k: 'glow', x: cx, y: cy, r: 34, c: '#9ad6a8', a: 0.25 });
    out.push({ k: 'ring', x: cx, y: cy + 26, rx: 35, ry: 13, w: 2.6, c: '#dff5e2', a: 0.5 });
    dots(out, fx.seed, 22, q, function (i) {
      var arm = i % 3, k = Math.floor(i / 3);
      var ang = arm * 2.09 + p * Math.PI * 5 + k * 0.55, rad = 8 + k * 4.4;
      return { k: 'dot', x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad * 0.52 - k * 1.6, r: 1.5 + (k % 3) * 0.5, c: i % 4 === 0 ? '#7fae4c' : '#dff5e2', a: 0.9 };
    });
    for (var s = 0; s < 3; s++) {
      var sa = p * Math.PI * 5 + s * 2.09;
      out.push({ k: 'poly', pts: arcBand(cx, cy, sa, 0.85, 33, 27, 0.52), c: '#ffffff', a: 0.5 });
    }
    return out;
  }
  function descLoi(fx, f, q, P) {
    var p = f / 19, out = [];
    var targets = fx.targets || [];
    var col = fx.color || '#b78ce0', env = (1 - p * 0.55) * (f < 2 ? 0.7 : 1);
    targets.forEach(function (t, j) {
      var tx = t.x, ty = t.y - 16, top = t.y - 205;
      var pts = [], k, fr;
      for (k = 0; k <= 6; k++) {
        fr = k / 6;
        var jit = (rnd(fx.seed + f * 31, j * 17, k) - 0.5) * 22 * Math.sin(Math.PI * fr);
        pts.push([tx + jit + (rnd(fx.seed, j, 1) - 0.5) * 8 * fr, top + (ty - top) * fr]);
      }
      out.push({ k: 'line', pts: pts, w: 7.5, c: col, a: 0.45 * env, g: 1 });
      out.push({ k: 'line', pts: pts, w: 2.6, c: '#ffffff', a: 0.95 * env, g: 1 });
      out.push({ k: 'glow', x: tx, y: ty, r: 27, c: col, a: (0.35 + 0.3 * rnd(fx.seed + f, j, 9)) * env });
      out.push({ k: 'ring', x: tx, y: t.y, rx: 14 + p * 22, ry: 6 + p * 9, w: 2.4, c: col, a: 0.6 * (1 - p) });
      for (var s = 0; s < 5; s++) {
        var sa = rnd(fx.seed, j * 10 + s, 3) * Math.PI * 2;
        out.push({ k: 'dot', x: tx + Math.cos(sa) * (6 + p * 24), y: ty + Math.sin(sa) * (6 + p * 24) * 0.7, r: 1.6, c: '#e9dcff', a: 0.85 * (1 - p) });
      }
    });
    return out;
  }
  function descHit(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, cy = fx.y;
    var col = fx.color || '#ffd94a';
    out.push({ k: 'glow', x: cx, y: cy, r: 15 * (1 - p * 0.4), c: col, a: 0.45 * (1 - p) });
    out.push({ k: 'ring', x: cx, y: cy, rx: 6 + p * 17, ry: (6 + p * 17) * 0.8, w: 2, c: col, a: 0.7 * (1 - p) });
    dots(out, fx.seed, 9, q, function (i) {
      var a = i / 9 * Math.PI * 2 + rnd(fx.seed, i, 1) * 0.5, d = 5 + p * 27;
      return { k: 'dot', x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.85, r: 1.7, c: i % 2 ? '#ffffff' : col, a: 0.9 * (1 - p) };
    });
    return out;
  }
  // Khiên linh khí (skill linh_khien): vòm sáng ôm thân + vòng chân +
  // hạt linh quang bốc lên — fx bám theo người chơi (follow).
  function descShield(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, gy = fx.y, cy = gy - 46;
    var col = fx.color || '#7fe8d6';
    var pulse = 0.85 + 0.15 * Math.sin(p * Math.PI * 4);
    out.push({ k: 'ring', x: cx, y: gy - 2, rx: 34 * pulse, ry: 14 * pulse, w: 2.5, c: col, a: 0.7 });
    out.push({ k: 'glow', x: cx, y: cy, r: 46 * pulse, c: col, a: 0.18 });
    var pts = [], i, a;
    for (i = 0; i <= 10; i++) { a = Math.PI + (i / 10) * Math.PI; pts.push([cx + Math.cos(a) * 36 * pulse, cy + 34 + Math.sin(a) * 52 * pulse]); }
    out.push({ k: 'line', pts: pts, w: 3, c: col, a: 0.85, g: 1 });
    out.push({ k: 'line', pts: pts.map(function (pt) { return [pt[0], pt[1] + 5]; }), w: 1.4, c: '#ffffff', a: 0.5 });
    dots(out, fx.seed, 8, q, function (i2) {
      var rise = (p * 46 + rnd(fx.seed, i2, 2) * 30) % 60;
      return { k: 'dot', x: cx + (rnd(fx.seed, i2, 1) - 0.5) * 52, y: gy - rise, r: 1.5, c: i2 % 2 ? '#ffffff' : col, a: 0.75 * (1 - rise / 70) };
    });
    return out;
  }
  // Lĩnh vực Hóa Thần (skill linh_vuc): vòng lĩnh vực lớn trên mặt đất +
  // linh văn xoay chậm + hạt xoáy vào trong — fx.radius là bán kính thật.
  function descDomain(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, gy = fx.y;
    var col = fx.color || '#dfe9ff', R = Math.min(fx.radius || 170, 190);
    var open = easeOut(Math.min(1, p * 3));
    out.push({ k: 'ring', x: cx, y: gy, rx: R * open, ry: R * 0.42 * open, w: 3, c: col, a: 0.55 });
    out.push({ k: 'ring', x: cx, y: gy, rx: R * 0.8 * open, ry: R * 0.34 * open, w: 1.6, c: '#ffffff', a: 0.3 });
    out.push({ k: 'glow', x: cx, y: gy - 30, r: R * 0.8, c: col, a: 0.08 });
    for (var i = 0; i < 10; i++) {
      var a = p * 1.4 + i * Math.PI / 5;
      out.push({ k: 'dot', x: cx + Math.cos(a) * R * 0.92 * open, y: gy + Math.sin(a) * R * 0.39 * open, r: 2.4, c: col, a: 0.8 });
    }
    dots(out, fx.seed, 16, q, function (i2) {
      var a2 = rnd(fx.seed, i2, 1) * Math.PI * 2 + p * 2.2, rr = R * (0.25 + rnd(fx.seed, i2, 2) * 0.65);
      return { k: 'dot', x: cx + Math.cos(a2) * rr, y: gy + Math.sin(a2) * rr * 0.42 - p * 8, r: 1.4 + rnd(fx.seed, i2, 3), c: i2 % 3 ? col : '#ffffff', a: 0.65 };
    });
    return out;
  }
  // Thiên Đạo Ban Phước (hiệu ứng khi độ kiếp thành công): cột sáng vàng
  // từ trời đổ xuống + hoa lành rơi + vòng sáng lan trên mặt đất.
  function descBanPhuoc(fx, f, q, P) {
    var p = f / 19, out = [], cx = fx.x, gy = fx.y, top = gy - 230;
    var env = Math.sin(Math.PI * Math.min(1, p * 1.05));
    out.push({ k: 'glow', x: cx, y: gy - 60, r: 90, c: '#ffd94a', a: 0.30 * env });
    out.push({ k: 'poly', pts: [[cx - 15, top], [cx + 15, top], [cx + 30, gy], [cx - 30, gy]], c: '#ffe9a8', a: 0.30 * env });
    out.push({ k: 'poly', pts: [[cx - 6, top], [cx + 6, top], [cx + 13, gy], [cx - 13, gy]], c: '#fffbe8', a: 0.55 * env });
    out.push({ k: 'ring', x: cx, y: gy, rx: 14 + p * 95, ry: 6 + p * 40, w: 3, c: '#ffd94a', a: 0.7 * (1 - p) });
    out.push({ k: 'ring', x: cx, y: gy, rx: 8 + p * 60, ry: 4 + p * 25, w: 2, c: '#ffffff', a: 0.5 * (1 - p) });
    dots(out, fx.seed, 20, q, function (i) {
      var fall = (rnd(fx.seed, i, 2) * 190 + p * 150) % 210;
      var sway = Math.sin(p * 6 + i * 1.9) * 7;
      return { k: 'dot', x: cx + (rnd(fx.seed, i, 1) - 0.5) * 130 + sway, y: top + 40 + fall, r: 1.8 + rnd(fx.seed, i, 3) * 1.6, c: i % 3 ? '#ffd9ec' : '#ffe9a8', a: 0.9 * env };
    });
    return out;
  }
  function describe(fx, frame, quality) {
    var q = normQ(quality || getQuality());
    var f = Math.max(0, Math.min(FRAMES - 1, frame | 0));
    var out;
    switch (fx.skill) {
      case 'combo': out = descCombo(fx, f, q); break;
      case 'kiem_khi': out = descKiemKhi(fx, f, q); break;
      case 'thuy': out = descKiemKhi(Object.assign({}, fx, { wide: true }), f, q); break;
      case 'toan_phong': out = descToanPhong(fx, f, q); break;
      case 'luu_tinh': out = descLuuTinh(fx, f, q); break;
      case 'ngu_kiem': out = descNguKiem(fx, f, q); break;
      case 'hit': out = descHit(fx, f, q); break;
      // ----- Skill sau đột phá + lôi kiếp + ban phước (js/realms.js,
      // js/skills.js BAR2): dùng lại thân chiêu đã kiểm chứng, đổi màu/
      // tầm theo fx của chiêu mới. -----
      case 'xuyen_van': out = descKiemKhi(fx, f, q); break;
      case 'pha_huyen': out = descKiemKhi(Object.assign({}, fx, { wide: true }), f, q); break;
      case 'dan_hoa': out = descHoa(fx, f, q); break;
      case 'kiem_tran': out = descKim(fx, f, q); break;
      case 'tran_ap': out = descBang(fx, f, q); break;
      case 'than_loi': case 'loi_kiep': case 'loi': out = descLoi(fx, f, q); break;
      case 'phan_than': out = descNguKiem(fx, f, q); break;
      case 'linh_khien': out = descShield(fx, f, q); break;
      case 'linh_vuc': out = descDomain(fx, f, q); break;
      case 'ban_phuoc': out = descBanPhuoc(fx, f, q); break;
      // ----- Chiêu BÍ TỊCH (js/manuals.js): mỗi chiêu dùng lại thân
      // hiệu ứng của hệ mình — phong kiếm/kim (tp_kiem_tran,
      // tphu_kiem_tran, rare_van_kiem), lôi xích (hp_ngu_hanh,
      // boss_xa_thuc, rare_cuu_u), thổ (tc_pha_son, gen_luu_sa), hỏa
      // (dh_dan_hoa, boss_ho_gam, boss_ma_vuong), ngự thú (vt_hao_lenh),
      // trận (cc_khon_tran, boss_co_mang), khiên (kc_bat_hoai), kiếm
      // khí (nd_thuc_cot wide / ha_han_tien / gen_phi_hoa), xung
      // (boss_lang_hao), lướt (boss_thiet_bi), hồi xuân (rare_hoi_xuan).
      case 'tp_kiem_tran': case 'tphu_kiem_tran': case 'rare_van_kiem': out = descKim(fx, f, q); break;
      case 'hp_ngu_hanh': case 'boss_xa_thuc': case 'rare_cuu_u': out = descLoi(fx, f, q); break;
      case 'tc_pha_son': case 'gen_luu_sa': out = descTho(fx, f, q); break;
      case 'dh_dan_hoa': case 'boss_ho_gam': case 'boss_ma_vuong': out = descHoa(fx, f, q); break;
      case 'vt_hao_lenh': out = descNguKiem(fx, f, q); break;
      case 'cc_khon_tran': case 'boss_co_mang': out = descDomain(fx, f, q); break;
      case 'kc_bat_hoai': out = descShield(fx, f, q); break;
      case 'nd_thuc_cot': out = descKiemKhi(Object.assign({}, fx, { wide: true }), f, q); break;
      case 'ha_han_tien': case 'gen_phi_hoa': out = descKiemKhi(fx, f, q); break;
      case 'boss_lang_hao': out = descToanPhong(fx, f, q); break;
      case 'boss_thiet_bi': out = descLuuTinh(fx, f, q); break;
      case 'rare_hoi_xuan': out = descMoc(fx, f, q); break;
      // ----- Bí tịch VỠ LÒNG + PHÁP QUYẾT NHẬP MÔN (đợt 2, Phàm
      // phẩm): kiếm quyết mượn thân kiếm khí, chưởng gió thân xoay,
      // khiên thân khiên, bộ pháp thân gió, dẫn khí thân mộc sinh cơ,
      // pháp quyết theo đúng hệ của chiêu. -----
      case 'cb_thanh_khe': out = descKiemKhi(fx, f, q); break;
      case 'cb_liet_phong': out = descToanPhong(fx, f, q); break;
      case 'cb_thiet_bo': out = descShield(fx, f, q); break;
      case 'cb_tat_phong': out = descPhong(fx, f, q); break;
      case 'cb_dan_khi': out = descMoc(fx, f, q); break;
      case 'pq_hoa_cau': out = descHoa(fx, f, q); break;
      case 'pq_thuy_tien': out = descKiemKhi(Object.assign({}, fx, { wide: true }), f, q); break;
      case 'pq_bang_tien': out = descKiemKhi(fx, f, q); break;
      case 'pq_loi_kich': out = descLoi(fx, f, q); break;
      case 'pq_phong_nhan': out = descPhong(fx, f, q); break;
      case 'pq_tho_thu': out = descTho(fx, f, q); break;
      case 'thien_can':
        switch (fx.root) {
          case 'kim': out = descKim(fx, f, q); break;
          case 'hoa': out = descHoa(fx, f, q); break;
          case 'bang': out = descBang(fx, f, q); break;
          case 'moc': out = descMoc(fx, f, q); break;
          case 'tho': out = descTho(fx, f, q); break;
          case 'phong': out = descPhong(fx, f, q); break;
          case 'loi': out = descLoi(fx, f, q); break;
          case 'thuy': out = descKiemKhi(Object.assign({}, fx, { wide: true }), f, q); break;
          default: out = descKim(fx, f, q); break;
        }
        break;
      default: out = descHit(fx, f, q); break;
    }
    if (q === 'thap') out = out.filter(function (pr) { return pr.k !== 'glow'; });
    return out;
  }
  // ---------- Vẽ lên canvas ----------
  function hexA(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function draw(ctx, fx, frame, quality, camX, camY) {
    var q = normQ(quality || getQuality());
    var prims = describe(fx, frame, q);
    camX = camX || 0; camY = camY || 0;
    for (var i = 0; i < prims.length; i++) {
      var pr = prims[i];
      ctx.globalCompositeOperation = (pr.k === 'glow' || pr.g) ? 'lighter' : 'source-over';
      ctx.globalAlpha = 1;
      if (pr.k === 'glow') {
        var X = pr.x - camX, Y = pr.y - camY;
        if (ctx.createRadialGradient) {
          var gr = ctx.createRadialGradient(X, Y, 0, X, Y, pr.r);
          gr.addColorStop(0, hexA(pr.c, pr.a));
          gr.addColorStop(1, hexA(pr.c, 0));
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(X, Y, pr.r, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.globalAlpha = pr.a * 0.6; ctx.fillStyle = pr.c;
          ctx.beginPath(); ctx.arc(X, Y, pr.r, 0, Math.PI * 2); ctx.fill();
        }
      } else if (pr.k === 'dot') {
        ctx.globalAlpha = pr.a; ctx.fillStyle = pr.c;
        ctx.beginPath(); ctx.arc(pr.x - camX, pr.y - camY, pr.r, 0, Math.PI * 2); ctx.fill();
      } else if (pr.k === 'ring') {
        ctx.globalAlpha = pr.a; ctx.strokeStyle = pr.c; ctx.lineWidth = pr.w;
        ctx.beginPath(); ctx.ellipse(pr.x - camX, pr.y - camY, Math.max(0.1, pr.rx), Math.max(0.1, pr.ry), 0, 0, Math.PI * 2); ctx.stroke();
      } else if (pr.k === 'line') {
        ctx.globalAlpha = pr.a; ctx.strokeStyle = pr.c; ctx.lineWidth = pr.w;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (pr.g && q === 'cao' && 'shadowBlur' in ctx) { ctx.shadowBlur = 13; ctx.shadowColor = pr.c; }
        ctx.beginPath();
        if (pr.pts) {
          ctx.moveTo(pr.pts[0][0] - camX, pr.pts[0][1] - camY);
          for (var j = 1; j < pr.pts.length; j++) ctx.lineTo(pr.pts[j][0] - camX, pr.pts[j][1] - camY);
        } else {
          ctx.moveTo(pr.x1 - camX, pr.y1 - camY); ctx.lineTo(pr.x2 - camX, pr.y2 - camY);
        }
        ctx.stroke();
        if ('shadowBlur' in ctx) ctx.shadowBlur = 0;
      } else if (pr.k === 'poly') {
        ctx.globalAlpha = pr.a; ctx.fillStyle = pr.c;
        ctx.beginPath();
        ctx.moveTo(pr.pts[0][0] - camX, pr.pts[0][1] - camY);
        for (var m = 1; m < pr.pts.length; m++) ctx.lineTo(pr.pts[m][0] - camX, pr.pts[m][1] - camY);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  // Icon cho thanh skill / panel: vẽ frame giữa của chiêu vào ô vuông size×size.
  function drawIcon(ctx, skillId, root, size) {
    var cx = size / 2;
    var fx = { skill: skillId, dir: 'right', root: root || 'kim', seed: 7, x: cx, y: size - 5 };
    if (skillId === 'kiem_khi' || skillId === 'thuy' || skillId === 'phong') { fx.x = cx; fx.y = cx; }
    if (skillId === 'xuyen_van' || skillId === 'pha_huyen') { fx.x = cx; fx.y = cx; }
    if (skillId === 'than_loi' || skillId === 'loi_kiep' || skillId === 'loi') {
      fx.targets = [{ x: cx - 10, y: size - 4 }, { x: cx + 4, y: size - 6 }, { x: cx + 13, y: size - 3 }];
    }
    if (skillId === 'linh_vuc') fx.radius = size * 0.44;
    if (skillId === 'dan_hoa' || skillId === 'kiem_tran' || skillId === 'tran_ap') fx.radius = size * 0.5;
    // Chiêu bí tịch (js/manuals.js): cấp sẵn tham số hình cho icon.
    if (skillId === 'hp_ngu_hanh' || skillId === 'boss_xa_thuc' || skillId === 'rare_cuu_u' ||
        skillId === 'pq_loi_kich') {
      fx.targets = [{ x: cx - 10, y: size - 4 }, { x: cx + 4, y: size - 6 }, { x: cx + 13, y: size - 3 }];
    }
    if (skillId === 'cc_khon_tran' || skillId === 'boss_co_mang') fx.radius = size * 0.44;
    if (skillId === 'pq_tho_thu') fx.radius = size * 0.4;
    if (skillId === 'tp_kiem_tran' || skillId === 'tphu_kiem_tran' || skillId === 'rare_van_kiem' ||
        skillId === 'dh_dan_hoa' || skillId === 'boss_ho_gam' || skillId === 'boss_ma_vuong') fx.radius = size * 0.5;
    if (skillId === 'boss_thiet_bi') { fx.x = size - 12; fx.y = cx; fx.from = { x: 8, y: cx }; }
    if (skillId === 'luu_tinh') { fx.x = size - 12; fx.y = cx; fx.from = { x: 8, y: cx }; }
    if (skillId === 'thien_can') {
      fx.y = size - 7;
      if ((root || 'kim') === 'loi') fx.targets = [{ x: cx - 9, y: size - 5 }, { x: cx + 11, y: size - 7 }, { x: cx + 1, y: size - 3 }];
      if ((root || '') === 'thuy') { fx.x = cx; fx.y = cx; }
      if ((root || '') === 'moc' || (root || '') === 'phong') { fx.y = size - 5; }
      if ((root || '') === 'phong') { fx.x = cx; fx.y = cx; }
    }
    draw(ctx, fx, 9, 'cao', 0, 0);
  }
  var api = {
    FRAMES: FRAMES, QUALITY_KEY: QUALITY_KEY, getQuality: getQuality, density: density,
    frameOf: frameOf, describe: describe, draw: draw, drawIcon: drawIcon
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SKILLFX = api;
})();
