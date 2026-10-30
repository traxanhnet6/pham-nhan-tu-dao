// V7: du lieu sprite AI cho quai (sinh boi tools/art-v7.py, dung sua tay).
// Cao = assets/monsters-ai (anh AI goc, o lon), Trung binh = assets/monsters-md
// (anh AI giam chi tiet: o nho + pixel hoa + luong tu mau). Thap = luoi ky tu
// MONSTER_FRAMES trong sprites.js. Moi sheet la 1 hang 20 frame, o vuong.
// Boss the gioi: them types boss_<id> (tools/art-bosses.py) — sheet
// thiet ke rieng, game.js chon theo worldBoss khi co.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/monsters-ai", "trung": "assets/monsters-md"}, "types": {"ga_rung": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "tho_hoang": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "soi_con": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "lon_rung": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "soi_rung": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "lon_mong_sat": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "ran_luc": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "khi_mat_do": {"dispW": 116, "dispH": 116, "cellCao": 192, "cellTrung": 120}, "son_quan": {"dispW": 176, "dispH": 176, "cellCao": 288, "cellTrung": 180}, "boss_lang_vuong": {"dispW": 150, "dispH": 150, "cellCao": 288, "cellTrung": 180}, "boss_son_quan": {"dispW": 190, "dispH": 190, "cellCao": 288, "cellTrung": 180}, "boss_xa_vuong": {"dispW": 150, "dispH": 150, "cellCao": 288, "cellTrung": 180}, "boss_thiet_bi": {"dispW": 150, "dispH": 150, "cellCao": 288, "cellTrung": 180}, "boss_co_mang": {"dispW": 140, "dispH": 140, "cellCao": 288, "cellTrung": 180}, "boss_ho_vuong": {"dispW": 180, "dispH": 180, "cellCao": 288, "cellTrung": 180}, "boss_thiet_bi_ma": {"dispW": 140, "dispH": 140, "cellCao": 288, "cellTrung": 180}, "boss_hau_vuong": {"dispW": 150, "dispH": 150, "cellCao": 288, "cellTrung": 180}}};
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else if (typeof window !== 'undefined') window.PNT_MONSTER_AI = data;
})();
