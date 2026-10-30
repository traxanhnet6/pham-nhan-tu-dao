// TẠO HÌNH 10 TÔNG MÔN (mục 26 hàng chờ, lệnh Bui 06:58 2026-10-30 +
// thiết kế docs/sect-looks.md): sheet ĐẦY ĐỦ thay sheet gốc khi đã bái
// nhập, theo đúng thứ tự lớp hình:
//   tạo hình NV gốc (chưa bái sư) → ĐỒ TÔNG (ngay khi flags.sectJoined
//   có, chỉ khi không mặc y phục sưu tầm và chưa tới Trúc Cơ) → trang
//   phục cảnh giới (Trúc Cơ+, js/realm-costumes.js) → tủ đồ (cao nhất).
// Luật cứng: chưa bái sư tuyệt đối không hiện đồ tông — layerFor trả
// null khi flags.sectJoined trống hoặc không phải 1 trong 10 tông.
// Định dạng sheet chuẩn hero-ai: <tiers>/<sect>/<gender>/<dir>-<action>.png,
// 1 dải 60 frame, ô 192 (Cao) / 120 (Trung bình), neo chân đáy ô.
// Sinh bởi tools/art-sect-looks60.py. Module thuần dữ liệu/luật, nạp
// được bằng Node để test như realm-costumes.js.
(function () {
  'use strict';
  // Tên + màu lấy ĐÚNG từ js/sects.js (trường color là màu định danh
  // chính thức của tông trong game); đạo cụ lấy từ docs/sect-looks.md
  // mục 4. Sửa ở đây thì phải sửa khớp với sects.js/sect-looks.md.
  var SECTS = [
    { id: 'thanh_phong', name: 'Thanh Phong Phái', color: '#3f7fbf', prop: 'Trường kiếm thẳng' },
    { id: 'huyen_phap', name: 'Huyền Pháp Tông', color: '#7a4fd0', prop: 'Pháp trượng đầu pha lê' },
    { id: 'thien_cong', name: 'Thiên Công Phường', color: '#b0782e', prop: 'Búa chùy rèn lớn' },
    { id: 'dan_ha', name: 'Đan Hà Cốc', color: '#c2482e', prop: 'Hồ lô đan' },
    { id: 'van_thu', name: 'Vạn Thú Môn', color: '#4e7d32', prop: 'Vuốt / sáo gọi thú (không cung)' },
    { id: 'thien_phu', name: 'Thiên Phù Các', color: '#c9a227', prop: 'Lá bùa chu sa (không bạch hồ)' },
    { id: 'cuu_cung', name: 'Cửu Cung Trận Tông', color: '#3a5f9e', prop: 'Cờ trận + bàn bát quái' },
    { id: 'kim_cang', name: 'Kim Cang Môn', color: '#a8763e', prop: 'Quyền tay không (không cờ trận)' },
    { id: 'ngu_doc', name: 'Ngũ Độc Giáo', color: '#2e7a6a', prop: 'Châm bạc + lọ độc + rắn lục' },
    { id: 'huyen_am', name: 'Huyền Âm Cung', color: '#7a94a8', prop: 'Cổ cầm (tóc đen, theo lệnh mục 26)' }
  ];
  var ACTIONS = ['idle', 'walk', 'slash1', 'slash2', 'slash3', 'cast_slash',
    'spin', 'channel', 'dash_pose', 'toss', 'hit', 'death',
    'gather', 'talk', 'meditate'];
  var DIRS = ['down', 'up', 'left', 'right'];
  var types = {};
  SECTS.forEach(function (s) {
    ['nam', 'nu'].forEach(function (g) {
      types[s.id + '_' + g] = { dispW: 96, dispH: 96, cellCao: 192, cellTrung: 120,
        frames: 60, sect: s.id, gender: g, name: s.name, color: s.color, prop: s.prop };
    });
  });
  var data = {
    tiers: { cao: 'assets/sect-looks-ai', trung: 'assets/sect-looks-md' },
    sects: SECTS, types: types, actions: ACTIONS, dirs: DIRS, frames: 60,
    // Mọi tổ hợp dir-action hợp lệ của một sheet tông (60 dải/tông/giới).
    sets: function () {
      var out = [];
      DIRS.forEach(function (d) { ACTIONS.forEach(function (a) { out.push(d + '-' + a); }); });
      return out;
    },
    costumeId: function (sectId, gender) {
      if (!sectId || !gender) return null;
      var id = sectId + '_' + gender;
      return this.types[id] ? id : null;
    },
    path: function (level, sectId, gender, set) {
      if (!this.costumeId(sectId, gender)) return null;
      var dir = this.tiers[level];
      if (!dir || DIRS.indexOf(set.split('-')[0]) < 0) return null;
      if (this.sets().indexOf(set) < 0) return null;
      return dir + '/' + sectId + '/' + gender + '/' + set + '.png';
    },
    // Lớp đồ tông có áp không? Chỉ áp khi: đã bái nhập đúng 1 trong 10
    // tông + không mặc y phục sưu tầm + chưa tới Trúc Cơ (rank >= 2 thì
    // trang phục cảnh giới phủ lên trên theo thứ tự lớp hình).
    layerFor: function (flags, wornId, rank, gender) {
      if (!flags || !flags.sectJoined) return null;
      if (wornId) return null;
      if (rank && rank >= 2) return null;
      return this.costumeId(flags.sectJoined, gender);
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else if (typeof window !== 'undefined') window.PNT_SECT_LOOKS = data;
})();
