// Bo icon AI cho 32 quyen BI TICH SKILL (he js/manuals.js; lenh
// Bui 07:05 2026-10-30 + dot vo long/phap quyet 07:45-07:46; sinh boi
// tools/art-manual-icons.py, dung sua tay). Cao =
// assets/manual-icons-ai (anh AI net, o 192), Trung binh
// = assets/manual-icons-md (pixel hoa + bang mau V7, o 120). Thap =
// luoi sach dung 8x8 (bookIcon) trong js/sprites.js. Moi quyen la 1
// PNG nen trong suot rieng: <thu muc>/<id>.png. Dang sach DUNG co
// bieu tuong he/chieu khac tren bia + hao quang theo pham — phan
// biet ro voi Dan Phuong dp_* (cuon buoc day, o herb-icons-ai).
// Kem theo PNT_MANUAL_ART: nap LAZY tung quyen + ve icon (cung co
// che PNT_HERB_ART): muc Cao/Trung binh ve anh AI khi da nap, chua
// nap xong hoac muc Thap thi roi ve luoi pixel; anh nap xong phat
// su kien 'pnt-art-icon' de game.js ve lai panel dang mo.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/manual-icons-ai", "trung": "assets/manual-icons-md"}, "types": {"bt_tp_kiem_tran": {"cellCao": 192, "cellTrung": 120}, "bt_hp_ngu_hanh": {"cellCao": 192, "cellTrung": 120}, "bt_tc_pha_son": {"cellCao": 192, "cellTrung": 120}, "bt_dh_dan_hoa": {"cellCao": 192, "cellTrung": 120}, "bt_vt_hao_lenh": {"cellCao": 192, "cellTrung": 120}, "bt_tphu_kiem_tran": {"cellCao": 192, "cellTrung": 120}, "bt_cc_khon_tran": {"cellCao": 192, "cellTrung": 120}, "bt_kc_bat_hoai": {"cellCao": 192, "cellTrung": 120}, "bt_nd_thuc_cot": {"cellCao": 192, "cellTrung": 120}, "bt_ha_han_tien": {"cellCao": 192, "cellTrung": 120}, "bt_boss_lang_hao": {"cellCao": 192, "cellTrung": 120}, "bt_boss_xa_thuc": {"cellCao": 192, "cellTrung": 120}, "bt_boss_ho_gam": {"cellCao": 192, "cellTrung": 120}, "bt_boss_thiet_bi": {"cellCao": 192, "cellTrung": 120}, "bt_boss_co_mang": {"cellCao": 192, "cellTrung": 120}, "bt_boss_ma_vuong": {"cellCao": 192, "cellTrung": 120}, "bt_rare_van_kiem": {"cellCao": 192, "cellTrung": 120}, "bt_rare_cuu_u": {"cellCao": 192, "cellTrung": 120}, "bt_rare_hoi_xuan": {"cellCao": 192, "cellTrung": 120}, "bt_gen_phi_hoa": {"cellCao": 192, "cellTrung": 120}, "bt_gen_luu_sa": {"cellCao": 192, "cellTrung": 120}, "bt_cb_thanh_khe": {"cellCao": 192, "cellTrung": 120}, "bt_cb_liet_phong": {"cellCao": 192, "cellTrung": 120}, "bt_cb_thiet_bo": {"cellCao": 192, "cellTrung": 120}, "bt_cb_tat_phong": {"cellCao": 192, "cellTrung": 120}, "bt_cb_dan_khi": {"cellCao": 192, "cellTrung": 120}, "bt_pq_hoa_cau": {"cellCao": 192, "cellTrung": 120}, "bt_pq_thuy_tien": {"cellCao": 192, "cellTrung": 120}, "bt_pq_bang_tien": {"cellCao": 192, "cellTrung": 120}, "bt_pq_loi_kich": {"cellCao": 192, "cellTrung": 120}, "bt_pq_phong_nhan": {"cellCao": 192, "cellTrung": 120}, "bt_pq_tho_thu": {"cellCao": 192, "cellTrung": 120}}};
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
  // Ve icon tai (x, y) canh `size` theo muc do hoa. Tra ve true neu
  // da ve bang anh AI, false neu roi ve luoi pixel (Thap/chua nap).
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
  if (typeof window !== 'undefined') { window.PNT_MANUAL_AI = data; window.PNT_MANUAL_ART = art; }
  if (typeof globalThis !== 'undefined') globalThis.PNT_MANUAL_ART = art;
})();
