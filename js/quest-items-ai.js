// Bo icon AI vat pham nhiem vu / lenh bai tong mon / thuc pham CTX
// (ho quest-items: assets/quest-items-ai + -md, o Cao 192 / Trung 120).
// Gom boi DOI TICH HOP MAP 2026-10-31 tu assets/quest-items-ai/manifest.json
// (doi icon-fx/ctx-quest sinh anh + manifest; prop_* la prop cot truyen
// 512px, khong phai vat pham tui nen khong vao resolver nay).
// Cung co che PNT_HERB_ART: nap LAZY tung mon + ve icon, roi ve luoi
// pixel 8x8 trong js/sprites.js khi Thap / chua nap xong.
(function () {
  'use strict';
  var data = {"tiers":{"cao":"assets/quest-items-ai","trung":"assets/quest-items-md"},"types":{"lenh_bai_thanh_phong":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_huyen_phap":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_thien_cong":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_dan_ha":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_van_thu":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_thien_phu":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_cuu_cung":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_kim_cang":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_ngu_doc":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"lenh_bai_huyen_am":{"cellCao":192,"cellTrung":120,"group":"sect_token"},"nanh_son_quan":{"cellCao":192,"cellTrung":120,"group":"story"},"van_thu_an":{"cellCao":192,"cellTrung":120,"group":"story"},"thiet_bia_tan_phien":{"cellCao":192,"cellTrung":120,"group":"story"},"kim_bai_dai_hoi":{"cellCao":192,"cellTrung":120,"group":"event"},"thien_bai_dai_hoi":{"cellCao":192,"cellTrung":120,"group":"event"},"thien_nien_linh_nhu":{"cellCao":192,"cellTrung":120,"group":"treasure"},"dia_tam_ngoc_tuy":{"cellCao":192,"cellTrung":120,"group":"treasure"},"ngu_hanh_linh_chau":{"cellCao":192,"cellTrung":120,"group":"treasure"},"trang_thu_trat":{"cellCao":192,"cellTrung":120,"group":"evidence_proposed"},"dan_doc_gia":{"cellCao":192,"cellTrung":120,"group":"evidence_proposed"},"an_co_diem_mach":{"cellCao":192,"cellTrung":120,"group":"evidence_proposed"},"thit_ga":{"cellCao":192,"cellTrung":120,"group":"food"},"thit_tho":{"cellCao":192,"cellTrung":120,"group":"food"},"thit_lon":{"cellCao":192,"cellTrung":120,"group":"food"},"thit_son_quan":{"cellCao":192,"cellTrung":120,"group":"food"},"da_soi":{"cellCao":192,"cellTrung":120,"group":"material"},"long_ga":{"cellCao":192,"cellTrung":120,"group":"material"},"dong_tien_co":{"cellCao":192,"cellTrung":120,"group":"antique"},"vun_ngoc_co":{"cellCao":192,"cellTrung":120,"group":"antique"},"kiem_cua_cha_da_mai":{"cellCao":192,"cellTrung":120,"group":"origin_fate"},"long_linh_ho":{"cellCao":192,"cellTrung":120,"group":"origin_fate"},"chuong_dong_nho":{"cellCao":192,"cellTrung":120,"group":"origin_fate"},"manh_ngoc_khuyet":{"cellCao":192,"cellTrung":120,"group":"origin_fate"},"dao_linh_qua":{"cellCao":192,"cellTrung":120,"group":"origin_fate"}}};
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
  if (typeof window !== 'undefined') { window.PNT_QUEST_AI = data; window.PNT_QUEST_ART = art; }
  if (typeof globalThis !== 'undefined') globalThis.PNT_QUEST_ART = art;
})();
