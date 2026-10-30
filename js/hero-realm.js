// V10 - TEAM MY THUAT NHAN VAT: lop phu Y PHUC theo CANH GIOI + theo MUA
// + ngoc LINH CAN. Sinh boi tools/art-realm-costume.py tu thiet ke AI
// (assets-src/costume-design/). Dinh dang sheet GIONG hero-ai: 1 dai
// 20 frame, o 192 (Cao) / 120 (Trung binh), neo chan day o — game ve de
// len sheet hero-ai cung frame (cung hFF crossfade cua smooth.js).
//
// QUY UOC DUONG DAN (game.js bam theo):
//   Realm  : <tiers.cao|trung>/<gender>/<origin>/rank<r>/<dir>-<action>.png
//            tiers.cao = assets/hero-realm, tiers.trung = assets/hero-realm-md
//            rank r = realmRank 1..6 (Luyen Khi..Do Kiep). Rank 0
//            (Pham Nhan) KHONG co lop phu -> realmPath tra null.
//            Game tu ap theo realmRank khi nhan vat KHONG mac y phuc
//            suu tam (wardrobe) — mac bo suu tam thi bo do thay the.
//   Gem    : <gemTiers>/<root>/<gender>/<dir>-<action>.png — vien ngoc
//            linh can o nguc, mau theo he (ch.root: kim/moc/thuy/hoa/
//            tho/phong/loi/bang). Ve sau lop phu khi ch.root ton tai.
//   Y phuc suu tam (theo mua/le/shop) do TEAM WARDROBE quan ly qua
//   js/wardrobe.js + js/costume-ai.js (assets/costumes-ai|costumes-md) —
//   team my thuat da dien hinh cho ca 10 bo vao dung he do.
(function () {
  'use strict';
  var RANKS = {
    1: { name: 'Luyện Khí', ao: '#7fa8c9', vien: '#d8e6f2', phatSang: '#bfe3ff' },
    2: { name: 'Trúc Cơ', ao: '#3f9e8f', vien: '#ffe9a8', phatSang: '#7fe8d6' },
    3: { name: 'Kim Đan', ao: '#c9932b', vien: '#fff3c4', phatSang: '#ffd94a' },
    4: { name: 'Nguyên Anh', ao: '#7a4fd0', vien: '#e6ccff', phatSang: '#cfa6ff' },
    5: { name: 'Hóa Thần', ao: '#e8ecf4', vien: '#9fc4ff', phatSang: '#ffffff' },
    6: { name: 'Độ Kiếp', ao: '#4a3a6e', vien: '#ffe9a8', phatSang: '#e6ccff' }
  };
  var ROOTS = { kim: '#ffd94a', moc: '#69d66f', thuy: '#5aa7d6', hoa: '#ff7a3c',
    tho: '#d99a4e', phong: '#9ad6a8', loi: '#cfa6ff', bang: '#bfe3ff' };
  var data = {
    tiers: { cao: 'assets/hero-realm', trung: 'assets/hero-realm-md' },
    gemTiers: { cao: 'assets/hero-gem', trung: 'assets/hero-gem-md' },
    cellCao: 192, cellTrung: 120, dispW: 96, dispH: 96,
    ranks: RANKS, roots: ROOTS,
    realmPath: function (level, gender, origin, rank, set) {
      if (!rank || rank < 1 || rank > 6) return null;
      var dir = this.tiers[level];
      if (!dir) return null;
      return dir + '/' + gender + '/' + origin + '/rank' + rank + '/' + set + '.png';
    },
    gemPath: function (level, root, gender, set) {
      if (!root || !this.roots[root]) return null;
      var dir = this.gemTiers[level];
      if (!dir) return null;
      return dir + '/' + root + '/' + gender + '/' + set + '.png';
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else if (typeof window !== 'undefined') window.PNT_HERO_REALM = data;
})();
