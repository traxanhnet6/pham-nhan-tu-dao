// Pham Nhan Tu Dao — nap luei ICON PHU CHU (js/talisman-icons-ai.js).
// Sinh tu dong boi tools/art-talisman-icons-ai.py — KHONG sua tay.
// Bo icon AI THAT (muc hang cho 29): 6 sheet AI 3x3 nen magenta -> tach
// nen/cut o bang pipeline icon AI cua du an (key_sheet + fit_square).
// Pipeline 2 muc nhu yeu-dan-ai / herb-icons-ai:
//   Cao        = assets/talisman-icons-ai/<id>.png (192px)
//   Trung binh = assets/talisman-icons-md/<id>.png (120px, pixel hoa)
//   Thap       = luoi pixel 8x8 trong js/sprites.js (ITEM_ICONS).
// Game doc muc qua window.PNT_GFX_QUALITY / localStorage 'pnt-gfx-quality'
// giong cac bo icon khac: 'cao' -> -ai, 'trung' -> -md, 'thap' -> khong nap
// (renderInventory roi ve luoi). Anh tai xong phat su kien 'pnt-art-icon'
// de game ve lai tui do. Chi ve bang drawImage — khong logic game o day.
(function () {
  'use strict';
  var IDS = ["hoa_phu_pham", "hoa_phu_linh", "hoa_phu_huyen", "loi_phu_pham", "loi_phu_linh", "loi_phu_huyen", "bang_phu_linh", "bang_phu_huyen", "kiem_khi_phu_linh", "kiem_khi_phu_huyen", "kiem_khi_phu_dia", "pha_giap_phu_linh", "pha_giap_phu_huyen", "kim_cang_phu_pham", "kim_cang_phu_linh", "kim_cang_phu_huyen", "ho_than_phu_linh", "ho_than_phu_huyen", "tho_don_phu_pham", "than_hanh_phu_pham", "than_hanh_phu_linh", "hoi_xuan_phu_linh", "hoi_xuan_phu_huyen", "tu_linh_phu_pham", "tu_linh_phu_linh", "giai_doc_phu_pham", "giai_doc_phu_linh", "an_tuc_phu_linh", "an_tuc_phu_huyen", "bua_ngu_thu", "truyen_tong_phu_linh", "tran_ap_phu_linh", "tran_ap_phu_huyen", "ho_dao_phu", "the_loi_phu", "giay_phu", "giay_phu_thien", "chu_sa", "linh_mac", "pp_kiem_khi_phu", "pp_the_loi_phu"];
  var DIR = { cao: 'assets/talisman-icons-ai/', trung: 'assets/talisman-icons-md/' };
  var imgs = {}, loaded = {}, current = null;
  function level() {
    var q = (typeof window !== 'undefined' && window.PNT_GFX_QUALITY) || null;
    if (!q) { try { q = localStorage.getItem('pnt-gfx-quality'); } catch (e) { q = null; } }
    return (q === 'cao' || q === 'trung') ? q : null;
  }
  function ensure() {
    var lv = level();
    if (!lv) return;
    var key = lv;
    if (loaded[key]) return;
    loaded[key] = true; current = key;
    var dir = DIR[lv];
    IDS.forEach(function (id) {
      var im = new Image();
      im.onload = function () {
        imgs[id] = im;
        try { window.dispatchEvent(new Event('pnt-art-icon')); } catch (e) {}
      };
      im.src = dir + id + '.png';
    });
  }
  function has(id) { ensure(); return !!imgs[id]; }
  function draw(ctx, id, x, y, w, h) {
    ensure();
    var im = imgs[id];
    if (!im) return false;
    ctx.drawImage(im, x, y, w, h);
    return true;
  }
  window.PNT_TALISMAN_ART = { has: has, draw: draw, ids: IDS };
})();
