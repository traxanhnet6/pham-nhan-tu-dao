// TRANG PHUC THIET KE RIENG theo CANH GIOI (team trang phuc
// canh gioi, lenh Bui 06:11 2026-10-30): sheet DAY DU 60 frame
// cho 5 bac cao rank 2..6 (Truc Co..Do Kiep) x 2 gioi, thay co
// che PHU DOI MAU (js/hero-realm.js) o bac >= 2 khi nhan vat
// khong mac y phuc suu tam. Dinh dang sheet chuan hero-ai:
// <tiers>/rank<r>/<gender>/<dir>-<action>.png, 1 dai 60 frame,
// o 192 (Cao) / 120 (Trung binh), neo chan day o.
// Sinh boi tools/art-realm-costumes60.py.
(function () {
  'use strict';
  var data = {"tiers": {"cao": "assets/hero-realms-ai", "trung": "assets/hero-realms-md"}, "types": {"rank2_nam": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 2, "gender": "nam", "name": "Tr\u00fac C\u01a1"}, "rank2_nu": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 2, "gender": "nu", "name": "Tr\u00fac C\u01a1"}, "rank3_nam": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 3, "gender": "nam", "name": "Kim \u0110an"}, "rank3_nu": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 3, "gender": "nu", "name": "Kim \u0110an"}, "rank4_nam": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 4, "gender": "nam", "name": "Nguy\u00ean Anh"}, "rank4_nu": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 4, "gender": "nu", "name": "Nguy\u00ean Anh"}, "rank5_nam": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 5, "gender": "nam", "name": "H\u00f3a Th\u1ea7n"}, "rank5_nu": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 5, "gender": "nu", "name": "H\u00f3a Th\u1ea7n"}, "rank6_nam": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 6, "gender": "nam", "name": "\u0110\u1ed9 Ki\u1ebfp"}, "rank6_nu": {"dispW": 96, "dispH": 96, "cellCao": 192, "cellTrung": 120, "frames": 60, "rank": 6, "gender": "nu", "name": "\u0110\u1ed9 Ki\u1ebfp"}}};
  data.frames = 60;
  data.costumeId = function (rank, gender) {
    if (!rank || rank < 2 || rank > 6 || !gender) return null;
    var id = 'rank' + rank + '_' + gender;
    return this.types[id] ? id : null;
  };
  data.path = function (level, rank, gender, set) {
    if (!this.costumeId(rank, gender)) return null;
    var dir = this.tiers[level];
    if (!dir) return null;
    return dir + '/rank' + rank + '/' + gender + '/' + set + '.png';
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else if (typeof window !== 'undefined') window.PNT_REALM_COSTUMES = data;
})();
