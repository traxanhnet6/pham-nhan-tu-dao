// ============================================================
// TÀNG KINH CÁC — KHÔNG GIAN + THỦ THƯ + CHUỖI VIỆC GIỮ SÁCH
// (mục 9 trong docs/auto-build-queue.md — phần còn lại của A3).
//
// Phần ĐỔI SÁCH đã có từ trước trong js/manuals.js: quầy Tàng Kinh
// Các trong panel Tông Môn, tuyệt học của chính tông đã bái nhập
// 260 Điểm Cống Hiến + hàm Nội Môn, 2 quyển Linh chung 130 điểm.
// Phần này bổ sung phần KHÔNG GIAN / TRUYỆN còn thiếu:
// - Một Tàng Kinh Các chung của mười tông dựng ở bãi tuyển đệ tử
//   Chân Núi Thanh Phong (map 3): kệ sách của mỗi tông đặt chung
//   một tòa các, nhưng chỉ đệ tử tông đó mới được mở kệ của mình
//   (luật này vốn đã có trong MANU.shelfList / buyFromShelf).
// - Thủ thư Cổ Mặc đứng trước tòa các ở ô (37,14) map 3: ô đi
//   được, cách Thư Lại Thẩm Ký (33,14) đúng 4 ô theo Chebyshev,
//   cách Chấp Sự Đấu Giá (30,17) 7 ô — không chen vào tầm tương
//   tác 72px của NPC nào khác. Sprite mượn của đại phu (ông lão),
//   vì dự án chưa vẽ sheet thủ thư riêng; không bịa sheet mới.
// - Chuỗi 3 việc giữ sách / trả sách, chỉ mở cho người ĐÃ BÁI
//   NHẬP tông (cờ flags.sectJoined), theo đúng mẫu chuỗi ngự
//   kiếm / arc tông: nhiệm vụ mang cờ tkcQuest nên
//   logic.js availableQuests bỏ qua, module này quản cổng +
//   marker + thoại, game.js chỉ nối nút nhận (trả nhiệm vụ đi
//   đường nút Trả chung của game.js, vì giver là thu_thu).
// - Thưởng chuỗi: 60 + 80 + 100 = 240 Linh Thạch, mỗi nhiệm vụ
//   trong trần nhiệm vụ lẻ (<= 300 LT) của docs/economy.md mục 6;
//   theo tiền lệ q_tal_*, chuỗi này thuộc nhóm nhiệm vụ lẻ ngoài
//   tổng khóa 4645 của test ECO (tổng đó chỉ cộng các nhóm đã
//   liệt kê). Điểm Cống Hiến: 10/việc như q_tong_* (bảng
//   QUEST_POINTS trong js/sect-points.js) — việc giữ sách là
//   việc tông, nên tông ghi công như mọi việc tông khác.
// - KHÔNG tạo nguồn Linh Thạch mới ngoài thưởng nhiệm vụ trên;
//   quầy đổi sách vẫn chỉ tiêu Điểm Cống Hiến, không đổi LT.
// ============================================================
(function (global) {
  'use strict';
  var L = null, SECTM = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECTM = require('./sects.js'); } catch (e) { SECTM = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    SECTM = global.PNT_SECTS || null;
  }

  var LIBRARIAN = { id: 'thu_thu', name: 'Cổ Mặc', title: 'Thủ Thư Tàng Kinh Các',
    mapId: 'map3', x: 129, y: 99, sprite: 'dai_phu' } // V7-EXPAND: (89,64)+neo map3 (40,35); // V10: + offset map (12,8); V5: +40,+42
  // Tòa các: trạm thủ thư + kệ sách trong panel Tông Môn (quầy đổi
  // sách của manuals.js). Không thêm map nội thất riêng: ảnh nền
  // map 3 v7 không có tòa nhà mới, vẽ thêm nền giả sẽ phá ảnh thật
  // nên không gian trong game chính là trạm này + panel quầy.
  var BUILDING = { mapId: 'map3', name: 'Tàng Kinh Các', x: 129, y: 99, // V7-EXPAND // V10: + offset map (12,8); V5: +40,+42
    note: 'Tòa các chung của mười tông ở bãi tuyển đệ tử Chân Núi Thanh Phong.' };
  var QUEST_IDS = ['q_tkc_1', 'q_tkc_2', 'q_tkc_3'];

  function sectNameOf(flags) {
    if (SECTM && SECTM.joinedSect) {
      var s = SECTM.joinedSect(flags);
      if (s) return s.name;
    }
    return (flags && flags.sectJoined) ? flags.sectJoined : '';
  }
  function gateOpen(flags) { return !!(flags && flags.sectJoined); }
  function isGiver(npcId, flags) { return npcId === LIBRARIAN.id && gateOpen(flags); }
  function turnedIn(qs, qid) { return !!(qs && qs.turnedIn && qs.turnedIn.indexOf(qid) >= 0); }

  function availableQuestId(ch, flags, qs) {
    if (!gateOpen(flags) || !qs || !L) return null;
    for (var i = 0; i < QUEST_IDS.length; i++) {
      var q = L.QUESTS[QUEST_IDS[i]];
      if (!q) continue;
      if (turnedIn(qs, QUEST_IDS[i]) || qs.accepted[QUEST_IDS[i]]) continue;
      if (q.requires && !turnedIn(qs, q.requires)) continue;
      return QUEST_IDS[i];
    }
    return null;
  }
  function activeQuestId(qs) {
    if (!qs) return null;
    for (var i = 0; i < QUEST_IDS.length; i++) {
      if (qs.accepted[QUEST_IDS[i]]) return QUEST_IDS[i];
    }
    return null;
  }
  function markerFor(npcId, flags, qs) {
    if (npcId !== LIBRARIAN.id || !gateOpen(flags) || !qs) return null;
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done) return '?';
    if (availableQuestId(null, flags, qs)) return '!';
    return null;
  }

  var QUEST_LINES = {
    q_tkc_1: ['Các bị dột một góc mái sau trận mưa đêm qua, sách trên giá thấp ẩm hết. May mà chưa rách trang nào — nhưng giá sách mà ẩm lâu thì mọt tới ngay. Ngươi hái cho ta 4 cây Thảo Dược tươi: phơi khô lót vào giá làm túi thơm chống ẩm, mùi dược đắng mọt không dám lại gần.',
      'Nhớ hái cây còn tươi, đừng hái cây đã úa — túi thơm mà dùng dược úa thì ẩm càng thêm ẩm, ta bắt ngươi phơi lại từ đầu đấy.'],
    q_tkc_2: ['Túi thơm đã lót xong, giá sách khô ráo rồi. Giờ tới việc thứ hai, cũng là việc nặng nhất của các: đường từ bãi tuyển lên núi có bầy Sói Rừng rình người qua lại. Đệ tử các tông gánh sách trả về núi đi qua đó mà run tay — sách mà rơi xuống suối thì không vớt lại được.',
      'Ngươi dẹp 3 con Sói Rừng dọc đường núi cho ta. Đường trả sách mà sạch, sổ mượn của các mới không còn dòng nào ghi "mất trên đường".'],
    q_tkc_3: ['Đường sạch rồi, sách trả về núi đủ cả. Việc cuối cùng nhẹ mà quan trọng nhất: sổ mượn của các phải có người làm chứng. Ngươi mang sổ này tới gặp Tạ Thanh Vân ở bãi tuyển — sứ giả chủ nhà của Thanh Phong Phái — báo cho cậu ấy biết: kỳ này các không mất một quyển nào, không rách một trang nào.',
      'Tạ Thanh Vân ký tên vào sổ là xong. Một tòa các mà sổ sách sạch thì mười tông mới yên tâm gửi thêm sách quý về đây.']
  };
  var TURNIN_LINES = {
    q_tkc_1: ['Thảo dược tươi cả bốn cây, phơi khô lót giá là vừa. Giá sách hết mùi ẩm rồi — ngươi giữ sách có tâm, không thua gì đệ tử giữ kiếm.',
      'Việc đầu xong. Đường trả sách còn một nỗi lo nữa, nghe ta nói tiếp.'],
    q_tkc_2: ['Đường núi sạch sói rồi, đệ tử gánh sách đi qua không còn run tay nữa. Sổ mượn kỳ này sẽ không còn dòng "mất trên đường" nào — công này ta ghi cho ngươi.',
      'Chỉ còn việc cuối: mang sổ tới cho Tạ Thanh Vân làm chứng.'],
    q_tkc_3: ['Tạ Thanh Vân ký sổ rồi chứ? Tốt. Kỳ này các không mất một quyển, không rách một trang — lần đầu tiên từ khi mười tông dựng các chung ở bãi tuyển mà sổ sạch tới vậy.',
      'Từ nay ngươi là người giữ sách của các này rồi. Kệ của tông ngươi ở trong panel Tông Môn, cứ tới đây gặp ta rồi mở kệ mà đổi — tuyệt học tông chỉ chờ người đủ hàm Nội Môn thôi.']
  };

  function dialogueFor(npcId, flags, ch, qs) {
    if (npcId !== LIBRARIAN.id) return null;
    if (!gateOpen(flags)) {
      return ['Ta là Cổ Mặc, thủ thư của Tàng Kinh Các này. Mười tông dựng các chung ở bãi tuyển, nhưng kệ sách của mỗi tông chỉ mở cho đệ tử tông đó — sách là của tông, không phải của chung.',
        'Ngươi chưa bái nhập tông nào thì ta chưa dẫn ngươi tới kệ được. Làm lễ bái sư với Tạ Thanh Vân trước, rồi quay lại đây: ta chỉ cho ngươi đúng kệ của tông mình, và việc giữ sách đầu tiên.'];
    }
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done) return TURNIN_LINES[act];
    if (act) {
      var st = qs.accepted[act], q = L ? L.QUESTS[act] : null;
      var need = q ? q.objectives[0].need : 0;
      var prog = 'Ngươi đang làm việc "' + (q ? q.title : act) + '" — đã được ' + st.progress + '/' + need + '. Xong thì quay lại đây trả sổ cho ta.';
      if (act === 'q_tkc_1') prog = 'Túi thơm chống ẩm cần 4 cây Thảo Dược tươi — ngươi đã hái ' + st.progress + '/4. Hái đủ thì mang về đây, ta phơi lót giá ngay.';
      if (act === 'q_tkc_2') prog = 'Đường trả sách cần sạch 3 con Sói Rừng — ngươi đã dẹp ' + st.progress + '/3. Đường mà còn sói thì đệ tử gánh sách không dám đi.';
      if (act === 'q_tkc_3') prog = 'Sổ mượn đang ở trong tay ngươi — tới gặp Tạ Thanh Vân ở bãi tuyển, báo cho cậu ấy biết kỳ này các không mất một quyển nào, rồi quay lại đây.';
      return [prog];
    }
    var av = availableQuestId(null, flags, qs);
    if (av) return QUEST_LINES[av];
    var sect = sectNameOf(flags);
    return ['Sổ mượn của ngươi sạch cả rồi — kỳ này các không mất một quyển, không rách một trang. Việc giữ sách như vậy mới xứng với người cầm sách.',
      'Kệ sách của ' + sect + ' ở trong panel Tông Môn: nói chuyện với ta rồi bấm nút mở Tàng Kinh Các là thấy — tuyệt học tông 260 điểm, hàm Nội Môn mới đổi được; sách chung thì 130 điểm. Sách mượn về thì nhớ trả đúng hạn, rách một trang là ta bắt vá lại đấy.'];
  }

  var api = {
    LIBRARIAN: LIBRARIAN, BUILDING: BUILDING, QUEST_IDS: QUEST_IDS,
    gateOpen: gateOpen, isGiver: isGiver,
    availableQuestId: availableQuestId, activeQuestId: activeQuestId,
    markerFor: markerFor, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_LIBRARY = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
