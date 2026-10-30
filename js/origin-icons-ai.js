// Bộ icon AI 15 vật dấu ấn nguồn gốc (lệnh trực tiếp của Bui 18:35
// 2026-10-30; sinh bởi tools/art-origin-icons.py, đừng sửa tay).
// Cao = assets/origin-icons-ai (ảnh AI nét, ô 192), Trung bình =
// assets/origin-icons-md (pixel hoá + 56 màu, ô 120). Thấp = lưới
// pixel 8x8 trong js/sprites.js (ITEM_ICONS). Mỗi món là 1 PNG nền
// trong suốt riêng: <thư mục>/<token>.png — token và thứ tự lấy từ
// DEFS thật trong js/origins.js.
// Kèm theo PNT_ORIGIN_ART: nạp LAZY từng món + vẽ icon (cùng cơ chế
// PNT_HERB_ART): mức Cao/Trung bình vẽ ảnh AI khi đã nạp, chưa nạp
// xong hoặc mức Thấp thì rơi về lưới pixel 8x8; ảnh nạp xong phát sự
// kiện 'pnt-art-icon' để game.js vẽ lại panel đang mở.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/origin-icons-ai", "trung": "assets/origin-icons-md"}, "types": {"kiem_gi_cua_cha": {"cellCao": 192, "cellTrung": 120}, "nua_quyen_thanh_khe_chi": {"cellCao": 192, "cellTrung": 120}, "la_bua_khong_chu": {"cellCao": 192, "cellTrung": 120}, "nanh_soi_dau_tien": {"cellCao": 192, "cellTrung": 120}, "hat_trang_go_chay_sem": {"cellCao": 192, "cellTrung": 120}, "hat_giong_lua_cu_cua_ba": {"cellCao": 192, "cellTrung": 120}, "lenh_bai_tieu_cuc_ran": {"cellCao": 192, "cellTrung": 120}, "gio_thuoc_cua_me": {"cellCao": 192, "cellTrung": 120}, "ngoc_boi_khuyet_mot_goc": {"cellCao": 192, "cellTrung": 120}, "sung_nai_gac_dau_tien": {"cellCao": 192, "cellTrung": 120}, "con_dau_trien_gia_truyen": {"cellCao": 192, "cellTrung": 120}, "khan_hoa_dao_cua_chi": {"cellCao": 192, "cellTrung": 120}, "cuoc_cu_cua_cha": {"cellCao": 192, "cellTrung": 120}, "mui_ten_gay_dau_tien": {"cellCao": 192, "cellTrung": 120}, "nghien_muc_nut": {"cellCao": 192, "cellTrung": 120}}};
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
  // Vẽ icon tại (x, y) cạnh `size` theo mức đồ hoạ. Trả về true nếu đã
  // vẽ bằng ảnh AI, false nếu rơi về lưới pixel (Thấp / chưa nạp).
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
  if (typeof window !== 'undefined') { window.PNT_ORIGIN_AI = data; window.PNT_ORIGIN_ART = art; }
  if (typeof globalThis !== 'undefined') globalThis.PNT_ORIGIN_ART = art;
})();
