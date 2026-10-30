// Bo icon AI linh duoc + hat giong + dan duoc + quyen Dan Phuong
// (lenh Bui 06:38 + 06:39 2026-10-30; sinh boi tools/art-herb-icons.py,
// dung sua tay). Cao = assets/herb-icons-ai (anh AI net, o 192), Trung
// binh = assets/herb-icons-md (pixel hoa + 56 mau, o 120). Thap = luoi
// pixel 8x8 trong js/sprites.js (ITEM_ICONS). Moi mon la 1 PNG nen
// trong suot rieng: <thu muc>/<id>.png — tong 51 mon: 16 linh duoc,
// 8 hat giong, 17 dan duoc, 10 quyen Dan Phuong dp_* (bi tich dang
// sach duy nhat dang vat pham trong game; skill mo theo tien trinh
// nen khong co sach skill trong tui do).
// Kem theo PNT_HERB_ART: nap LAZY tung mon + ve icon (cung co che
// PNT_YEU_DAN_ART): muc Cao/Trung binh ve anh AI khi da nap, chua nap
// xong hoac muc Thap thi roi ve luoi pixel 8x8; anh nap xong phat su
// kien 'pnt-art-icon' de game.js ve lai panel dang mo.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/herb-icons-ai", "trung": "assets/herb-icons-md"}, "types": {"thao_duoc": {"cellCao": 192, "cellTrung": 120}, "thanh_tam_thao": {"cellCao": 192, "cellTrung": 120}, "linh_chi": {"cellCao": 192, "cellTrung": 120}, "huyet_sam": {"cellCao": 192, "cellTrung": 120}, "tu_linh_qua": {"cellCao": 192, "cellTrung": 120}, "doc_tam_hoa": {"cellCao": 192, "cellTrung": 120}, "ngoc_tuy_chi": {"cellCao": 192, "cellTrung": 120}, "son_tinh": {"cellCao": 192, "cellTrung": 120}, "thanh_linh_tuy": {"cellCao": 192, "cellTrung": 120}, "long_tien_thao": {"cellCao": 192, "cellTrung": 120}, "van_nien_linh_chi": {"cellCao": 192, "cellTrung": 120}, "hoa_diem_lien": {"cellCao": 192, "cellTrung": 120}, "bang_tinh_hoa": {"cellCao": 192, "cellTrung": 120}, "thien_loi_qua": {"cellCao": 192, "cellTrung": 120}, "tinh_van_thach": {"cellCao": 192, "cellTrung": 120}, "thien_lien": {"cellCao": 192, "cellTrung": 120}, "hoi_khi_tan": {"cellCao": 192, "cellTrung": 120}, "linh_khi_tan": {"cellCao": 192, "cellTrung": 120}, "hoi_xuan_dan": {"cellCao": 192, "cellTrung": 120}, "tu_linh_dan": {"cellCao": 192, "cellTrung": 120}, "tieu_boi_nguyen_dan": {"cellCao": 192, "cellTrung": 120}, "giai_doc_dan": {"cellCao": 192, "cellTrung": 120}, "tu_khi_dan": {"cellCao": 192, "cellTrung": 120}, "dai_hoi_xuan_dan": {"cellCao": 192, "cellTrung": 120}, "cuong_the_dan": {"cellCao": 192, "cellTrung": 120}, "than_hanh_dan": {"cellCao": 192, "cellTrung": 120}, "ngung_khi_dan": {"cellCao": 192, "cellTrung": 120}, "sinh_co_dan": {"cellCao": 192, "cellTrung": 120}, "dai_boi_nguyen_dan": {"cellCao": 192, "cellTrung": 120}, "chien_y_dan": {"cellCao": 192, "cellTrung": 120}, "pha_canh_dan": {"cellCao": 192, "cellTrung": 120}, "truc_co_dan": {"cellCao": 192, "cellTrung": 120}, "hat_thao_duoc": {"cellCao": 192, "cellTrung": 120}, "hat_thanh_tam_thao": {"cellCao": 192, "cellTrung": 120}, "hat_linh_chi": {"cellCao": 192, "cellTrung": 120}, "hat_tu_linh_qua": {"cellCao": 192, "cellTrung": 120}, "hat_huyet_sam": {"cellCao": 192, "cellTrung": 120}, "hat_doc_tam_hoa": {"cellCao": 192, "cellTrung": 120}, "hat_ngoc_tuy_chi": {"cellCao": 192, "cellTrung": 120}, "hat_thanh_linh_tuy": {"cellCao": 192, "cellTrung": 120}, "dp_giai_doc_dan": {"cellCao": 192, "cellTrung": 120}, "dp_tu_linh_dan": {"cellCao": 192, "cellTrung": 120}, "dp_than_hanh_dan": {"cellCao": 192, "cellTrung": 120}, "dp_cuong_the_dan": {"cellCao": 192, "cellTrung": 120}, "dp_dai_hoi_xuan_dan": {"cellCao": 192, "cellTrung": 120}, "dp_sinh_co_dan": {"cellCao": 192, "cellTrung": 120}, "dp_chien_y_dan": {"cellCao": 192, "cellTrung": 120}, "dp_dai_boi_nguyen_dan": {"cellCao": 192, "cellTrung": 120}, "cuu_chuyen_hoi_hon_dan": {"cellCao": 192, "cellTrung": 120}, "dp_ngung_khi_dan": {"cellCao": 192, "cellTrung": 120}, "dp_pha_canh_dan": {"cellCao": 192, "cellTrung": 120}}};
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
  // Ve icon tai (x, y) canh `size` theo muc do hoa. Tra ve true neu da
  // ve bang anh AI, false neu roi ve luoi pixel (Thap / chua nap).
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
  if (typeof window !== 'undefined') { window.PNT_HERB_AI = data; window.PNT_HERB_ART = art; }
  if (typeof globalThis !== 'undefined') globalThis.PNT_HERB_ART = art;
})();
