// Phàm Nhân Tu Đạo — dữ liệu + luật TÔNG MÔN (arc chương 9–12 "Sơn Môn Đại Hội").
// File thuần dữ liệu/luật (nạp được bằng Node để test như logic.js): trạng thái
// mở khoá SUY RA từ nhiệm vụ đã trả trong qs (không cần trường lưu riêng trừ
// lựa chọn gia nhập flags.sectJoined + flags.sectCeremony, nằm trong flags
// được serialize sẵn cùng save). Mọi tên riêng trong file này là ĐỀ XUẤT,
// chờ Bui chốt (xem docs/story-bible.md mục 19).
// Cách nạp: logic.js phải nạp TRƯỚC file này (index.html: ... logic, story,
// sects, ..., game). game.js đọc qua window.PNT_SECTS, mọi hàm đều null-safe.
(function () {
  'use strict';
  var L = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
  } else if (typeof window !== 'undefined') {
    L = window.PNT_LOGIC || null;
  }
  // Thứ tự trong mảng = thứ tự mở khoá của chuỗi nhiệm vụ Sơn Môn Đại Hội.
  // Thanh Phong Phái là tông chủ nhà: mở bằng chính q_chinh_8 của chương 8.
  var SECTS = [
    { id: 'thanh_phong', name: 'Thanh Phong Phái', path: 'Kiếm tu',
      motto: 'Kiếm là để chắn trước người khác, không phải để giẫm lên người khác.',
      color: '#3f7fbf', sigil: 'Thanh Phong Kiếm Ấn',
      rep: 'de_tu_phai', repName: 'Tạ Thanh Vân',
      unlockQuest: 'q_chinh_8',
      unlockText: 'Qua ba cửa khảo hạch của Thanh Phong Phái trong nhiệm vụ "Sơn môn mở" (chương 8).',
      token: 'lenh_bai_thanh_phong',
      desc: 'Tông môn chủ nhà của Thanh Sơn, lập phái mấy trăm năm trên núi. Kiếm ý thanh phong: nhanh, sạch, và luôn đứng chắn trước người yếu.' },
    { id: 'huyen_phap', name: 'Huyền Pháp Tông', path: 'Pháp tu',
      motto: 'Pháp tùy tâm chuyển — tâm loạn thì pháp loạn.',
      color: '#7a4fd0', sigil: 'Ngũ Hành Luân Ấn',
      rep: 'tong_phap', repName: 'Liễu Ngưng Sương',
      unlockQuest: 'q_tong_phap',
      unlockText: 'Hoàn thành nhiệm vụ "Ngũ hành thí pháp" của Liễu Ngưng Sương ở bãi tuyển đệ tử.',
      token: 'lenh_bai_huyen_phap',
      desc: 'Chuyên tu pháp thuật ngũ hành, coi trọng ngộ tính và sự điềm tĩnh. Đệ tử Huyền Pháp ra tay ít mà trúng đích nhiều.' },
    { id: 'thien_cong', name: 'Thiên Công Phường', path: 'Khí tu (luyện khí)',
      motto: 'Khí do tay người, đạo do tâm rèn.',
      color: '#b0782e', sigil: 'Thiên Công Chùy Ấn',
      rep: 'tong_khi', repName: 'Mạc Thiết Tâm',
      unlockQuest: 'q_tong_khi',
      unlockText: 'Hoàn thành nhiệm vụ "Bờm sắt thử tay" của Mạc Thiết Tâm ở bãi tuyển đệ tử.',
      token: 'lenh_bai_thien_cong',
      desc: 'Phường luyện khí danh tiếng: pháp bảo, binh khí của nửa vùng đều qua tay họ. Họ trọng người khéo tay hơn người khéo miệng.' },
    { id: 'dan_ha', name: 'Đan Hà Cốc', path: 'Đan tu',
      motto: 'Một lò đan tốt cứu người trước, cầu đạo sau.',
      color: '#c2482e', sigil: 'Đan Hà Lô Ấn',
      rep: 'tong_dan', repName: 'Tần Dược Tử',
      unlockQuest: 'q_tong_dan',
      unlockText: 'Hoàn thành nhiệm vụ "Linh chi thử đan" của Tần Dược Tử ở bãi tuyển đệ tử.',
      token: 'lenh_bai_dan_ha',
      desc: 'Ẩn cốc chuyên luyện đan dược. Đệ tử Đan Hà đi đâu cũng được chào đón, vì trong tay họ là thuốc cứu người.' },
    { id: 'van_thu', name: 'Vạn Thú Môn', path: 'Ngự thú',
      motto: 'Thú cũng là bạn, núi cũng là nhà.',
      color: '#4e7d32', sigil: 'Vạn Thú Trảo Ấn',
      rep: 'tong_thu', repName: 'Giang Tiểu Thú',
      unlockQuest: 'q_tong_thu',
      unlockText: 'Hoàn thành nhiệm vụ "Người được thú nhận" của Giang Tiểu Thú ở bãi tuyển đệ tử.',
      token: 'lenh_bai_van_thu',
      desc: 'Môn phái sống chung với thú rừng, tu bằng cách kết bạn và cùng chiến đấu với linh thú. Họ ghét nhất kẻ săn thú vì lòng tham.' },
    { id: 'thien_phu', name: 'Thiên Phù Các', path: 'Phù tu',
      motto: 'Một nét bùa ngay, trấn tà an dân.',
      color: '#c9a227', sigil: 'Thiên Phù Chu Ấn',
      rep: 'tong_phu', repName: 'Diệp Phù Sinh',
      unlockQuest: 'q_tong_phu',
      unlockText: 'Hoàn thành nhiệm vụ "Giữ kho giấy bùa" của Diệp Phù Sinh ở bãi tuyển đệ tử.',
      token: 'lenh_bai_thien_phu',
      desc: 'Tu bằng bùa chú: một lá bùa vẽ từ giấy vàng và chu sa, trấn được tà, giữ được nhà. Đệ tử Thiên Phù tay phải vững như núi.' },
    { id: 'cuu_cung', name: 'Cửu Cung Trận Tông', path: 'Trận tu',
      motto: 'Một trận bày ra, thiên quân khó phá.',
      color: '#3a5f9e', sigil: 'Cửu Cung Bát Quái Ấn',
      rep: 'tong_tran', repName: 'Âu Dương Kỳ',
      unlockQuest: 'q_tong_tran',
      unlockText: 'Hoàn thành nhiệm vụ "Dẫn khí qua cửu cung" của Âu Dương Kỳ ở bãi tuyển đệ tử.',
      token: 'lenh_bai_cuu_cung',
      desc: 'Chuyên trận pháp cửu cung bát quái. Họ ít khi ra tay — họ bày sẵn thế trận rồi để địch tự bước vào.' },
    { id: 'kim_cang', name: 'Kim Cang Môn', path: 'Thể tu',
      motto: 'Thân này là pháp bảo đầu tiên của người tu.',
      color: '#a8763e', sigil: 'Kim Cang Quyền Ấn',
      rep: 'tong_the', repName: 'Thạch Bất Động',
      unlockQuest: 'q_tong_the',
      unlockText: 'Hoàn thành nhiệm vụ "Tay không đấu lợn rừng" của Thạch Bất Động ở bãi tuyển đệ tử.',
      token: 'lenh_bai_kim_cang',
      desc: 'Tu thân thể đến mức đao thương khó nhập. Đệ tử Kim Cang ăn khỏe, cười to, và đứng chắn đầu gió cho đồng đội.' },
    { id: 'ngu_doc', name: 'Ngũ Độc Giáo', path: 'Độc tu',
      motto: 'Độc cũng là thuốc — tùy tay người dùng.',
      color: '#2e7a6a', sigil: 'Ngũ Độc Nguyệt Ấn',
      rep: 'tong_doc', repName: 'Đường Tĩnh',
      unlockQuest: 'q_tong_doc',
      unlockText: 'Hoàn thành nhiệm vụ "Chén thuốc thử độc" của Đường Tĩnh ở bãi tuyển đệ tử.',
      token: 'lenh_bai_ngu_doc',
      desc: 'Giáo phái bị giang hồ dè chừng vì chuyên độc công, nhưng trong tay người lành, độc là thuốc giải và là vũ khí giữ làng. Họ chỉ nhận người bình tĩnh.' },
    { id: 'huyen_am', name: 'Huyền Âm Cung', path: 'Âm tu',
      motto: 'Một khúc đàn hay an được cả người sống lẫn hồn người đi.',
      color: '#7a94a8', sigil: 'Huyền Âm Huyền Ấn',
      rep: 'tong_am', repName: 'Tiêu Uyển Nhi',
      unlockQuest: 'q_tong_am',
      unlockText: 'Hoàn thành nhiệm vụ "Khúc đàn an hồn" của Tiêu Uyển Nhi ở bãi tuyển đệ tử.',
      token: 'lenh_bai_huyen_am',
      desc: 'Tu bằng tiếng đàn: âm thanh của họ trị thương, an thần, và tiễn đưa. Huyền Âm Cung ít nhận đệ tử, vì người nóng tính đàn không hay.' }
  ];
  var BY_ID = {};
  SECTS.forEach(function (s) { BY_ID[s.id] = s; });
  function sectById(id) { return BY_ID[id] || null; }
  // Một tông coi là ĐÃ MỞ khi nhiệm vụ mở khoá của nó đã được TRẢ xong.
  function isUnlocked(qs, sectId) {
    var def = BY_ID[sectId];
    if (!def || !L || !qs) return false;
    return L.isTurnedIn(qs, def.unlockQuest);
  }
  function unlockedList(qs) { return SECTS.filter(function (s) { return isUnlocked(qs, s.id); }); }
  function lockedList(qs) { return SECTS.filter(function (s) { return !isUnlocked(qs, s.id); }); }
  function allUnlocked(qs) { return SECTS.every(function (s) { return isUnlocked(qs, s.id); }); }
  function nextLocked(qs) {
    var l = lockedList(qs);
    return l.length ? l[0] : null;
  }
  // Đại diện của tông xuất hiện ở bãi tuyển khi: tông đã mở, HOẶC nhiệm vụ mở
  // khoá của tông đang được làm, HOẶC đã tới lượt mở (nhiệm vụ đang "có sẵn").
  // Nhờ chuỗi requires, tại một thời điểm chỉ tối đa một đại diện "mới" lộ diện,
  // cộng với các đại diện của tông đã mở ở lại tham quan.
  function repVisible(qs, sectId) {
    var def = BY_ID[sectId];
    if (!def) return false;
    if (def.id === 'thanh_phong') return true; // chủ nhà, luôn có mặt (de_tu_phai)
    if (!L || !qs) return false;
    if (L.isTurnedIn(qs, def.unlockQuest)) return true;
    if (qs.accepted && qs.accepted[def.unlockQuest]) return true;
    return L.availableQuests(qs).some(function (q) { return q.id === def.unlockQuest; });
  }
  // game.js gọi sau mỗi lần trả nhiệm vụ thành công: trả xong nhiệm vụ lễ
  // (q_chinh_18) thì buổi lễ chọn tông coi như đã làm, mở nút bái nhập.
  function afterTurnIn(flags, qid) {
    if (!flags) return flags;
    if (qid === 'q_chinh_18') flags.sectCeremony = true;
    return flags;
  }
  function joinedSect(flags) {
    if (!flags || !flags.sectJoined) return null;
    return BY_ID[flags.sectJoined] || null;
  }
  function canJoin(flags, qs) {
    if (!flags || flags.sectJoined) return false;
    if (flags.sectCeremony !== true) return false;
    return allUnlocked(qs);
  }
  function join(flags, qs, sectId) {
    var def = BY_ID[sectId];
    if (!def) return { ok: false, error: 'Không có tông môn này.' };
    if (!flags) return { ok: false, error: 'Chưa có dữ liệu lưu.' };
    if (flags.sectJoined) {
      var cur = BY_ID[flags.sectJoined];
      return { ok: false, error: 'Bạn đã bái nhập ' + (cur ? cur.name : flags.sectJoined) + ' rồi.' };
    }
    if (!isUnlocked(qs, sectId)) return { ok: false, error: def.name + ' chưa mở khoá.' };
    if (!allUnlocked(qs)) return { ok: false, error: 'Phải mở đủ 10 tông môn mới được chọn tông.' };
    if (flags.sectCeremony !== true) return { ok: false, error: 'Hãy làm lễ chọn tông với Tạ Thanh Vân trước (nhiệm vụ "Lễ bái sư").' };
    flags.sectJoined = sectId;
    return { ok: true, sect: def, token: def.token };
  }
  // Trạng thái hiển thị cho bảng tông môn: joined / open / locked + câu chữ.
  function statusOf(flags, qs, sectId) {
    var def = BY_ID[sectId];
    if (!def) return { state: 'locked', text: '' };
    if (flags && flags.sectJoined === sectId) return { state: 'joined', text: 'Đã bái nhập — đây là tông môn của bạn.' };
    if (isUnlocked(qs, sectId)) {
      if (flags && flags.sectJoined) return { state: 'open', text: 'Đã mở — vào tham quan tự do.' };
      return { state: 'open', text: 'Đã mở.' };
    }
    return { state: 'locked', text: 'Chưa mở — ' + def.unlockText };
  }
  var api = {
    SECTS: SECTS, sectById: sectById,
    isUnlocked: isUnlocked, unlockedList: unlockedList, lockedList: lockedList,
    allUnlocked: allUnlocked, nextLocked: nextLocked, repVisible: repVisible,
    afterTurnIn: afterTurnIn, joinedSect: joinedSect, canJoin: canJoin, join: join,
    statusOf: statusOf
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SECTS = api;
})();
