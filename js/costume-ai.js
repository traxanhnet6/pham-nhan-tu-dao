// Du lieu anh AI cho Y PHUC (he thong tu do js/wardrobe.js) — file nay do
// TEAM MY THUAT dien khi ve xong sheet phu cua tung bo. Dinh dang giong
// js/hero-ai.js: moi bo la 1 muc trong "types", khoa = costumeId:
//   { "cellCao": 192, "cellTrung": 120, "genders": ["nam", "nu"] }
// Duong dan file sheet (CUNG dinh dang sheet nhan vat chuan cua hero-ai —
// 20 frame/dai, neo chan day o, ten file <dir>-<action>.png voi 15 action
// nhu nhan vat goc):
//   Cao        = assets/costumes-ai/<costumeId>/<gender>/<dir>-<action>.png
//   Trung binh = assets/costumes-md/<costumeId>/<gender>/<dir>-<action>.png
//   Thap       = khong phu (nhan vat ve luoi nhu thuong).
// LUAT: bo nao CHUA co muc trong "types" thi js/wardrobe.js AN HAN khoi tu
// do (khong placeholder) — dien muc vao day la bo tu hien trong game.
(function () {
  'use strict';
  var T = { "cellCao": 192, "cellTrung": 120, "genders": ["nam", "nu"] };
  var data = {"tiers": {"cao": "assets/costumes-ai", "trung": "assets/costumes-md"}, "types": {
    "dao_hoa_xuan_y": T, "lien_ha_bich_y": T, "thu_nguyet_phong_y": T,
    "tuyet_vien_dong_ao": T, "thanh_sam_truong_bao": T, "huyen_y_da_hanh": T,
    "bach_y_tien_bao": T, "kim_van_tien_ao": T, "tong_mon_le_phuc": T,
    "quan_quan_dai_hoi_y": T
  }};
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else if (typeof window !== 'undefined') window.PNT_COSTUME_AI = data;
  if (typeof globalThis !== 'undefined') globalThis.PNT_COSTUME_AI = data;
})();
