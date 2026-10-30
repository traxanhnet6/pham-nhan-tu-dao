// V7 yeu dan dep hon (lenh Bui 21:57): du lieu anh AI cho 3 cap Yeu Dan
// (sinh boi tools/art-yeu-dan.py, dung sua tay). Cao = assets/yeu-dan-ai
// (anh AI net, o 192), Trung binh = assets/yeu-dan-md (pixel hoa + 56
// mau, o 120). Thap = luoi pixel 8x8 trong js/sprites.js (ITEM_ICONS).
// Moi cap la 1 PNG nen trong suot rieng: <thu muc>/<id>.png.
// Kem theo PNT_YEU_DAN_ART: nap LAZY tung cap + ve icon (ban sao gon cua
// co che ART.drawIconArt ben phap bao): muc Cao/Trung binh ve anh AI khi
// da nap, chua nap xong hoac muc Thap thi roi ve luoi pixel 8x8; anh nap
// xong phat su kien 'pnt-art-icon' de game.js ve lai panel dang mo.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/yeu-dan-ai", "trung": "assets/yeu-dan-md"}, "types": {"yeu_dan_1": {"cellCao": 192, "cellTrung": 120}, "yeu_dan_2": {"cellCao": 192, "cellTrung": 120}, "yeu_dan_3": {"cellCao": 192, "cellTrung": 120}}};
  var _imgs = {};
  function spritesLib() {
    if (typeof window !== 'undefined' && window.PNT_SPRITES) return window.PNT_SPRITES;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_SPRITES) return globalThis.PNT_SPRITES;
    return null;
  }
  function has(id) { return !!(id && data.types[id]); }
  function image(id, level) {
    if (!has(id) || typeof Image === 'undefined') return null;
    var lv = (level === 'trung') ? 'trung' : 'cao';
    var key = lv + '/' + id;
    var im = _imgs[key];
    if (!im) {
      im = new Image();
      im.onload = function () {
        im._ready = true;
        try {
          if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined')
            window.dispatchEvent(new CustomEvent('pnt-art-icon', { detail: id }));
        } catch (e) {}
      };
      im.src = data.tiers[lv] + '/' + id + '.png';
      _imgs[key] = im;
    }
    return im._ready ? im : null;
  }
  // Ve icon Yeu Dan tai (x, y) canh `size` theo muc do hoa. Tra ve true
  // neu da ve bang anh AI, false neu roi ve luoi pixel (Thap / chua nap).
  function draw(ctx, id, x, y, size, level) {
    if (!ctx || !has(id)) return false;
    if (level !== 'thap') {
      var im = image(id, level);
      if (im) { ctx.drawImage(im, x, y, size, size); return true; }
    }
    var S = spritesLib();
    if (S && S.ITEM_ICONS && S.ITEM_ICONS[id] && S.drawGridToCanvas)
      S.drawGridToCanvas(ctx, S.ITEM_ICONS[id], x, y, size / 8);
    return false;
  }
  var art = { data: data, has: has, image: image, draw: draw, AI_DIRS: data.tiers };
  if (typeof module !== 'undefined' && module.exports) { module.exports = data; module.exports.art = art; }
  if (typeof window !== 'undefined') { window.PNT_YEU_DAN_AI = data; window.PNT_YEU_DAN_ART = art; }
  if (typeof globalThis !== 'undefined') globalThis.PNT_YEU_DAN_ART = art;
})();
