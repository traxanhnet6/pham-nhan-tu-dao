// V7 phap bao: du lieu anh AI cho 16 phap khi/bao vat (sinh boi
// tools/art-artifacts.py, dung sua tay). Cao = assets/artifacts-ai
// (anh AI net, o 192), Trung binh = assets/artifacts-md (pixel hoa
// + 56 mau, o 120). Thap = luoi pixel 16x16 trong js/artifacts.js.
// Moi mon la 1 PNG nen trong suot rieng: <thu muc>/<id>.png.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/artifacts-ai", "trung": "assets/artifacts-md"}, "types": {"ho_lo_thu_yeu": {"cellCao": 192, "cellTrung": 120}, "kinh_chieu_yeu": {"cellCao": 192, "cellTrung": 120}, "chuong_tran_hon": {"cellCao": 192, "cellTrung": 120}, "day_troi_tien": {"cellCao": 192, "cellTrung": 120}, "phi_kiem_bao": {"cellCao": 192, "cellTrung": 120}, "an_tran_son": {"cellCao": 192, "cellTrung": 120}, "thien_la_vong": {"cellCao": 192, "cellTrung": 120}, "dinh_hai_than_chau": {"cellCao": 192, "cellTrung": 120}, "ngoc_tu_linh": {"cellCao": 192, "cellTrung": 120}, "ho_tam_boi": {"cellCao": 192, "cellTrung": 120}, "tui_tru_vat": {"cellCao": 192, "cellTrung": 120}, "than_hanh_boi": {"cellCao": 192, "cellTrung": 120}, "tu_bao_bon": {"cellCao": 192, "cellTrung": 120}, "dang_tu_khi": {"cellCao": 192, "cellTrung": 120}, "dan_dinh_ngoc": {"cellCao": 192, "cellTrung": 120}, "cuu_chuyen_linh_chau": {"cellCao": 192, "cellTrung": 120}}};
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else if (typeof window !== 'undefined') window.PNT_ARTIFACT_AI = data;
})();
