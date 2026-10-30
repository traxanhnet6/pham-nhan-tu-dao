// Phàm Nhân Tu Đạo — TẦNG NỘI SUY MƯỢT (render-time interpolation).
// Lệnh của Bui (20:57 29/10/2026): chuyển động phải mượt như 65 FPS cho nhân
// vật, quái, boss, linh thú. Cách làm đúng kỹ thuật:
//   - Chuẩn BIÊN SOẠN vẫn là 20 keyframe/động tác (khung xương, không đổi —
//     test phân biệt 20 frame vẫn chạy trên dữ liệu gốc của các team rig).
//   - Tầng này chỉ nằm ở RENDER: tại thời gian t THẬT của frame hiển thị,
//     tư thế được nội suy LIÊN TỤC giữa 2 keyframe kề (tham số hoá hoặc
//     crossfade 2 lớp alpha), nên tư thế đổi ở MỌI nhịp làm tươi màn hình
//     (60/90/120Hz đều mượt tối đa theo đúng tần số quét của màn hình đó),
//     thay vì nhảy bậc 20 lần/giây như công thức floor(t*20) cũ.
// Áp theo THỰC THỂ CHUYỂN ĐỘNG NÓI CHUNG — không khóa danh sách: nhân vật,
// quái, boss, NPC dùng ngay; LINH THÚ (js/pet-ai.js, cùng định dạng sheet
// dải 20 frame với quái) chỉ cần nạp sheet rồi gọi drawSheetBlend y hệt
// quái là ăn ngay lớp mượt này, kể cả mức lưới qua drawGridBlend.
// KHÔNG BAO GIỜ giảm nội suy khi máy yếu: cơ chế tự giảm tải (bộ đo FPS
// bên dưới) chỉ giảm MẬT ĐỘ HẠT/BỤI + mật độ hiệu ứng — chuyển động là
// cốt lõi, không đánh đổi.
(function () {
  'use strict';
  var FRAMES = 20;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, f) { return a + (b - a) * f; }
  function wrap20(x) { return ((x % FRAMES) + FRAMES) % FRAMES; }

  // Nội suy tuyến tính trên bảng mốc [frame, value] — cùng quy ước với
  // sprites.keyf: ngoài khoảng thì kẹp về mốc đầu/cuối. Đây là "hàm nội
  // suy tư thế" chuẩn: sampleKeys(keys, 7.5) cho giá trị nằm GIỮA 2
  // keyframe kề, khác cả hai, và thay đổi liên tục theo t.
  function sampleKeys(keys, f) {
    if (!keys || !keys.length) return 0;
    if (f <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) {
      if (f <= keys[i][0]) {
        var p = keys[i - 1], n = keys[i];
        return p[1] + (n[1] - p[1]) * ((f - p[0]) / (n[0] - p[0]));
      }
    }
    return keys[keys.length - 1][1];
  }

  // Tách frame float thành {i0, i1, frac}: i0 = keyframe trước, i1 =
  // keyframe sau, frac = phần lẻ (trọng số nội suy). wrap=true cho động
  // tác lặp vòng (idle/walk/move/meditate/ngự kiếm); wrap=false kẹp ở
  // frame cuối cho động tác một lần (death, chiêu thức).
  function splitFrame(ff, frames, wrap) {
    frames = frames || FRAMES;
    var x = +ff || 0;
    if (wrap) {
      x = ((x % frames) + frames) % frames;
      var i0 = Math.floor(x);
      return { i0: i0, i1: (i0 + 1) % frames, frac: x - i0 };
    }
    if (x <= 0) return { i0: 0, i1: 0, frac: 0 };
    if (x >= frames - 1) return { i0: frames - 1, i1: frames - 1, frac: 0 };
    var j0 = Math.floor(x);
    return { i0: j0, i1: j0 + 1, frac: x - j0 };
  }

  // ----- Vẽ SHEET dải (ảnh AI: hero/monster/npc/pet) với frame float -----
  // Lớp 1: keyframe i0 vẽ đặc. Lớp 2: keyframe i1 phủ lên với
  // globalAlpha = frac. Mắt người đọc thành tư thế trung gian thật.
  function drawSheetFrame(ctx, img, i, cell, dx, dy, dw, dh, flip, alpha) {
    var needState = flip || alpha < 1;
    var prevA = ctx.globalAlpha;
    if (needState && ctx.save) ctx.save();
    if (alpha < 1) ctx.globalAlpha = alpha;
    if (flip) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, i * cell, 0, cell, cell, 0, 0, dw, dh);
    } else {
      ctx.drawImage(img, i * cell, 0, cell, cell, dx, dy, dw, dh);
    }
    if (needState && ctx.restore) ctx.restore();
    ctx.globalAlpha = prevA;
  }
  function drawSheetBlend(ctx, img, frameFloat, frames, cell, dx, dy, dw, dh, opts) {
    if (!ctx || !img || !ctx.drawImage) return false;
    var sp = splitFrame(frameFloat, frames, !!(opts && opts.wrap));
    var flip = !!(opts && opts.flip);
    drawSheetFrame(ctx, img, sp.i0, cell, dx, dy, dw, dh, flip, 1);
    if (sp.frac > 0.003 && sp.i1 !== sp.i0) {
      drawSheetFrame(ctx, img, sp.i1, cell, dx, dy, dw, dh, flip, sp.frac);
    }
    return true;
  }

  // ----- Vẽ LƯỚI PIXEL (mức Thấp) với frame float + CACHE RASTER -----
  // Lưới của 1 (loại, hành động, hướng, frame) là xác định và lặp vòng —
  // raster hoá MỘT LẦN ra canvas đệm theo khóa ngữ nghĩa rồi blit lại;
  // các frame sau không tốn sinh lưới + fillRect từng ô nữa (thắng lớn
  // nhất cho FPS ở mức Thấp trên map đông quái). gen() CHỈ được gọi khi
  // cache miss. Neo vẽ: (cx, bottomY) = tâm ngang + đáy — đúng cách mọi
  // thực thể của game đang căn (giữa thân, chân chạm đất).
  var _gridCache = new Map();
  var GRID_CACHE_MAX = 600;
  function makeCanvas(w, h) {
    try {
      if (typeof document !== 'undefined' && document.createElement) {
        var c = document.createElement('canvas');
        if (c && c.getContext) { c.width = w; c.height = h; return c; }
      }
    } catch (e) {}
    return null;
  }
  function paintGrid(g, pxGrid, x, y, scale) {
    if (!g || !pxGrid) return;
    for (var r = 0; r < pxGrid.length; r++) {
      var row = pxGrid[r];
      if (!row) continue;
      for (var c = 0; c < row.length; c++) {
        var col = row[c];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
  function gridGet(key) {
    var cv = _gridCache.get(key);
    if (cv) { _gridCache.delete(key); _gridCache.set(key, cv); } // LRU: đưa lên cuối
    return cv || null;
  }
  function gridPut(key, pxGrid, scale) {
    if (!pxGrid || !pxGrid.length || !pxGrid[0]) return null;
    var cv = makeCanvas(pxGrid[0].length * scale, pxGrid.length * scale);
    if (!cv) return null;
    var g = null;
    try { g = cv.getContext('2d'); } catch (e) { g = null; }
    if (!g || !g.fillRect) return null;
    paintGrid(g, pxGrid, 0, 0, scale);
    if (_gridCache.size >= GRID_CACHE_MAX) {
      var k0 = _gridCache.keys().next().value;
      if (k0 !== undefined) _gridCache.delete(k0);
    }
    _gridCache.set(key, cv);
    return cv;
  }
  // ent = { key, gen } — gen trả lưới pixel của frame đó (chỉ chạy khi miss).
  function drawGridBlend(ctx, entA, entB, frac, cx, bottomY, scale) {
    if (!ctx || !entA) return null;
    var cvA = gridGet(entA.key), gridA = null;
    if (!cvA) {
      gridA = entA.gen ? entA.gen() : null;
      if (gridA) cvA = gridPut(entA.key, gridA, scale);
    }
    if (cvA && ctx.drawImage) {
      ctx.drawImage(cvA, cx - cvA.width / 2, bottomY - cvA.height);
      if (frac > 0.003 && entB && entB.key !== entA.key) {
        var cvB = gridGet(entB.key);
        if (!cvB) {
          var gridB = entB.gen ? entB.gen() : null;
          if (gridB) cvB = gridPut(entB.key, gridB, scale);
        }
        if (cvB) {
          var prevA = ctx.globalAlpha;
          if (ctx.save) ctx.save();
          ctx.globalAlpha = frac;
          ctx.drawImage(cvB, cx - cvB.width / 2, bottomY - cvB.height);
          if (ctx.restore) ctx.restore();
          ctx.globalAlpha = prevA;
        }
      }
      return { w: cvA.width, h: cvA.height };
    }
    if (gridA) {
      // Môi trường không có canvas đệm: vẽ thẳng 2 lớp fillRect (vẫn mượt,
      // chỉ tốn hơn) — không bao giờ rơi về nhảy bậc.
      var wA = gridA[0].length * scale, hA = gridA.length * scale;
      paintGrid(ctx, gridA, cx - wA / 2, bottomY - hA, scale);
      if (frac > 0.003 && entB) {
        var gB2 = entB.gen ? entB.gen() : null;
        if (gB2) {
          var pA2 = ctx.globalAlpha;
          if (ctx.save) ctx.save();
          ctx.globalAlpha = frac;
          paintGrid(ctx, gB2, cx - gB2[0].length * scale / 2, bottomY - gB2.length * scale, scale);
          if (ctx.restore) ctx.restore();
          ctx.globalAlpha = pA2;
        }
      }
      return { w: wA, h: hA };
    }
    return null;
  }

  // ----- Hiệu ứng kỹ năng (skill-fx): descriptors của FX là hàm LIÊN TỤC
  // theo f nhưng FX.describe tự floor — nên blend ở tầng canvas: vẽ frame
  // i0 thẳng lên canvas chính, frame i1 ra canvas đệm toàn khung rồi phủ
  // alpha = frac. drawFn(targetCtx, frameInt) do game.js cung cấp.
  var _fxCanvas = null, _fxCtx = null;
  function drawFxBlend(ctx, frameFloat, frames, wrap, viewW, viewH, drawFn) {
    if (!ctx || !drawFn) return;
    var sp = splitFrame(frameFloat, frames, wrap);
    drawFn(ctx, sp.i0);
    if (sp.frac <= 0.003 || sp.i1 === sp.i0) return;
    try {
      if (!_fxCanvas) {
        _fxCanvas = makeCanvas(viewW, viewH);
        if (_fxCanvas) { try { _fxCtx = _fxCanvas.getContext('2d'); } catch (e) { _fxCtx = null; } }
      }
      if (!_fxCanvas || !_fxCtx || !ctx.drawImage) return;
      if (_fxCanvas.width !== viewW || _fxCanvas.height !== viewH) {
        _fxCanvas.width = viewW; _fxCanvas.height = viewH;
      }
      _fxCtx.clearRect(0, 0, viewW, viewH);
      _fxCtx.globalCompositeOperation = 'source-over';
      _fxCtx.globalAlpha = 1;
      drawFn(_fxCtx, sp.i1);
      var prevA = ctx.globalAlpha;
      if (ctx.save) ctx.save();
      ctx.globalAlpha = sp.frac;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(_fxCanvas, 0, 0);
      if (ctx.restore) ctx.restore();
      ctx.globalAlpha = prevA;
    } catch (e) { /* đệm hỏng thì lớp 1 đã vẽ — không vỡ frame */ }
  }

  // ----- Bộ ĐO FPS + TỰ GIẢM TẢI -----
  // EMA theo dt thật của requestAnimationFrame. Đánh giá theo cửa sổ
  // 0.75s: FPS < 45 kéo dài -> tăng 1 mức giảm tải (tối đa 3); FPS > 57
  // trong 3 cửa sổ liên tiếp -> nới 1 mức. Giảm tải CHỈ chạm mật độ hạt:
  // particleScale nhân vào tốc độ sinh bụi + game.js hạ mật độ FX theo
  // mức; nội suy chuyển động giữ nguyên ở mọi mức.
  var DEGRADE_SCALES = [1, 0.6, 0.34, 0.15];
  function createFpsMeter() {
    var emaDt = 1 / 60, level = 0, winT = 0, winN = 0, goodStreak = 0, samples = 0;
    var meter = {
      sample: function (dt) {
        if (!(dt > 0) || dt > 0.25) return; // bỏ khựng bất thường (đổi tab, treo máy)
        emaDt += (dt - emaDt) * 0.05;
        winT += dt; winN++; samples++;
        if (winT >= 0.75) {
          var winFps = winN / winT;
          winT = 0; winN = 0;
          if (winFps < 45 && level < 3) { level++; goodStreak = 0; }
          else if (winFps > 57) {
            goodStreak++;
            if (goodStreak >= 3 && level > 0) { level--; goodStreak = 0; }
          } else goodStreak = 0;
        }
      },
      fps: function () { return 1 / Math.max(emaDt, 0.0001); },
      level: function () { return level; },
      particleScale: function () { return DEGRADE_SCALES[level]; },
      report: function () {
        return {
          fps: Math.round(meter.fps() * 10) / 10, level: level,
          particleScale: DEGRADE_SCALES[level], samples: samples
        };
      }
    };
    return meter;
  }
  var meter = createFpsMeter();

  function info() {
    var r = meter.report();
    return {
      version: 'smooth-v1', fps: r.fps, level: r.level,
      particleScale: r.particleScale, gridCache: _gridCache.size
    };
  }
  function resetBuffers() {
    _gridCache.clear();
    _fxCanvas = null; _fxCtx = null;
  }

  var api = {
    FRAMES: FRAMES,
    clamp: clamp, lerp: lerp, wrap20: wrap20,
    sampleKeys: sampleKeys, splitFrame: splitFrame,
    drawSheetBlend: drawSheetBlend,
    drawGridBlend: drawGridBlend, gridGet: gridGet, gridPut: gridPut,
    paintGrid: paintGrid,
    drawFxBlend: drawFxBlend,
    createFpsMeter: createFpsMeter, meter: meter,
    info: info, resetBuffers: resetBuffers
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SMOOTH = api;
})();
