// ============================================================
// LINH KHÍ THỦY TRIỀU THEO MÙA + LỄ HỘI LÀNG — mục 17 trong
// docs/auto-build-queue.md (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: story-bible mục 21 đã chốt linh nhãn Thanh Khê có
// "giờ linh khí thủy triều" — phong ấn nén linh khí như nén lò xo,
// mặt phong ấn nứt ra theo nhịp rồi tự khép. Nhịp tháng của linh
// nhãn là nhịp mùa vụ của làng quê (mùa thú dữ, mùa xuân tuyển đệ
// tử đã có trong truyện): mỗi tháng dương lịch thật, thủy triều
// đổi một "tiết", phủ lên mọi vòng lặp sẵn có mà không cần hệ mới
// — đổi tỉ lệ + một việc lễ làng nhỏ là chính (đúng ý tưởng D2
// trong docs/feature-ideas.md).
//
// PHÂN BIỆT VỚI 2 HỆ "MÙA" ĐÃ CÓ (tránh lẫn tên):
// - Bảng Mùa (js/season-board.js): "Mùa" = QUÝ dương lịch, đo thành
//   tích tu sĩ (Đại Hội/Thú Triều/Bí Cảnh) rồi trao thưởng cuối quý.
// - Lễ hội năm (js/wardrobe.js, Dì Tư): 5 lễ theo NGÀY ÂM LỊCH/năm,
//   chuỗi 4 việc lễ, thưởng pháp bảo lễ giới hạn.
// - Hệ này: "TIẾT" = THÁNG dương lịch, xoay vòng 4 tiết, đổi tỉ lệ
//   chơi (thổ nạp/dược mọc/tinh anh) + 1 việc tiết làng nhỏ mỗi
//   tiết. Không đụng điểm Bảng Mùa, không đụng pháp bảo lễ.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/sworn.js: dữ liệu + luật
// thuần test bằng Node, game.js chỉ nối tỉ lệ vào 3 chỗ đã có và
// nút nhận/trả việc tiết ở NPC làng):
// - Chu kỳ tháng: tháng dương lịch chia 4 dư — tháng 1/5/9 là
//   Tiết Linh Tố, 2/6/10 là Tiết Thú Dữ, 3/7/11 là Tiết Đăng Hoa,
//   4/8/12 là Tiết Tĩnh Tu. Cùng một tháng thì cùng một tiết —
//   người chơi học được "tháng này là tiết gì" như học lịch phiên.
// - Hiệu ứng (mỗi tiết đúng 1–2 tỉ lệ, đều NHỎ để giữ nguyên tắc
//   GIAN NAN của docs/economy.md):
//   · Linh Tố: dược mọc nhanh — thời gian mọc lại ×0,75.
//   · Thú Dữ (mùa khô): tinh anh xuất hiện nhiều hơn (tỉ lệ ×1,5,
//     trần 0,5) + dược mọc thưa (thời gian mọc lại ×1,5).
//   · Đăng Hoa: không đổi tỉ lệ — tiết này là lễ hội, việc tiết
//     của Hoa nương là phần chính.
//   · Tĩnh Tu (mùa linh khí dồi dào): thổ nạp +25% tu vi (cả
//     thổ nạp tay base 2 lẫn tự thổ nạp base 1/giây, nhân sau
//     các hệ số đã có như Tụ Linh Phù/Dẫn Khí Quyết/Trận Kỳ).
//     Phần lẻ của hệ số x1,25 được TÍCH LŨY (flags.tdMedFrac ở
//     game.js, sửa QA 15:31 30/10) — làm tròn từng lần từng biến
//     đường tay thành +50% và đường tự thổ nạp thành +0%.
// - Việc tiết: 4 việc, mỗi tiết 1 việc, MỖI VIỆC MỘT LẦN DUY NHẤT
//   (dùng đúng trạng thái nhiệm vụ chuẩn qs.accepted/turnedIn —
//   không bịa cơ chế lặp tháng, vì lặp sẽ phá tổng nhiệm vụ đã
//   khóa ở test ECO). Việc chỉ NHẬN được trong đúng tháng của
//   tiết nó; đã nhận rồi thì làm dở sang tháng sau vẫn trả được
//   (trả không khóa tiết — việc đã nhận là việc của người chơi).
//   Người chơi bỏ lỡ một tiết thì tiết đó quay lại sau 4 tháng.
//   Thưởng mỗi việc 50 Linh Thạch (+10 tu vi; việc Đăng Hoa thêm
//   2 Thịt Gà làm cỗ hội) — trong trần NV lẻ ≤ 300 LT của
//   economy.md mục 6, và 50 LT/tháng là tiền lẻ so với 430
//   LT/giờ farm giữa chặng nên không phá nhịp giờ.
// - VIỆC LỄ LẶP (mục 53 hàng chờ, 2026-11-01): sau khi cả 4 việc
//   gốc đã trả xong, mỗi tháng mở thêm 1 việc lễ lặp của tiết
//   tháng đó (mục tiêu chép việc gốc, thưởng 0 Linh Thạch, khóa
//   1 lần trả/tháng ở qs.repeatDone) — để từ tháng thứ 5 panel
//   Tiết Khí không chỉ còn hệ số.
// - Người giao đều là NPC làng đã có ở map 1 (không tạo NPC mới):
//   Tiểu Hạnh (Linh Tố), A Hổ (Thú Dữ), Hoa nương (Đăng Hoa),
//   Lý lão (Tĩnh Tu). Việc tiết KHÔNG chen vào thoại nhiệm vụ
//   thường của họ: nhận/trả đi đường nút ở hộp thoại + marker.
//   dialogueFor() của module được game.js gọi ở dialogueLinesFor
//   SAU nhánh story.js. QA55 (mục 55 hàng chờ, 2026-11-01) CHỐT:
//   module này là NGUỒN DUY NHẤT cho toàn bộ thoại việc tiết (lời
//   nhận/trả, câu nhắc kèm tiến độ, câu phản ứng Dì Tư, câu báo bận
//   việc tiết thứ hai) — bản sao q_tiet_*/q_tiet_lap_* trong
//   story.js đã gỡ, nhánh ST trong game.js bỏ qua việc tiết
//   (q.tietQuest) nên không còn hai bản để lệch. Phương án còn lại
//   của mục 55 (giữ ST làm nguồn + test khóa khớp) KHÔNG chọn, vì
//   test chung bắt mọi nhiệm vụ phải có thoại ST sẽ lại bắt buộc
//   bản sao; thay vào đó test QA55 khóa "ST không còn việc tiết"
//   và test chung được miễn trừ riêng cho việc tiết.
// ============================================================
(function (global) {
  'use strict';

  var SEASONS = [
    { id: 'linh_to', name: 'Linh Tố', medMult: 1, herbMult: 0.75, eliteMult: 1,
      hud: 'dược mọc nhanh',
      effect: 'Linh khí thấm đất: dược mọc lại nhanh hơn 25%.',
      lore: 'Đầu mùa, linh khí từ giếng cổ thấm ra ruộng vườn — thảo dược mọc nhanh hơn mọi tháng.' },
    { id: 'thu_du', name: 'Thú Dữ', medMult: 1, herbMult: 1.5, eliteMult: 1.5,
      hud: 'tinh anh ×1,5 · dược thưa',
      effect: 'Mùa khô: tinh anh xuất hiện nhiều hơn (×1,5); dược mọc thưa, mọc lại chậm hơn 50%.',
      lore: 'Trời khô, thú dữ đói nên tinh anh xuống gần làng nhiều hơn — mà đất khô thì dược mọc thưa đi.' },
    { id: 'dang_hoa', name: 'Đăng Hoa', medMult: 1, herbMult: 1, eliteMult: 1,
      hud: 'hội đèn làng',
      effect: 'Không đổi tỉ lệ — tiết này là lễ hội làng, việc tiết của Hoa nương đang mở.',
      lore: 'Đêm hội đèn: cả làng treo đèn, Hoa nương bày cỗ — tiết này không cày nhanh hơn, mà vui hơn.' },
    { id: 'tinh_tu', name: 'Tĩnh Tu', medMult: 1.25, herbMult: 1, eliteMult: 1,
      hud: 'thổ nạp +25%',
      effect: 'Mùa linh khí dồi dào: thổ nạp +25% tu vi (cả thổ nạp tay lẫn tự thổ nạp).',
      lore: 'Linh khí lặng mà đầy — ngồi yên một tuần trà cũng hơn ngày thường, đúng tiết để tĩnh tu.' }
  ];
  // Tháng 1/5/9 -> 0, 2/6/10 -> 1, 3/7/11 -> 2, 4/8/12 -> 3.
  function seasonIndexOf(d) {
    var m = d.getMonth() + 1;
    var r = m % 4;
    return r === 0 ? 3 : r - 1;
  }
  function toDate(v) {
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);
    return new Date();
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function seasonOf(v) {
    var d = toDate(v);
    var def = SEASONS[seasonIndexOf(d)];
    return { id: def.id, name: def.name, def: def,
      key: d.getFullYear() + '-' + pad2(d.getMonth() + 1),
      label: 'Tiết ' + def.name + ' — tháng ' + (d.getMonth() + 1) + '/' + d.getFullYear(),
      month: d.getMonth() + 1, year: d.getFullYear() };
  }
  function nextSeasonOf(v) {
    var d = toDate(v);
    var nx = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return seasonOf(nx);
  }
  function medMult(v) { return seasonOf(v).def.medMult; }
  function herbRespawnMult(v) { return seasonOf(v).def.herbMult; }
  function eliteMult(v) { return seasonOf(v).def.eliteMult; }

  var QUEST_IDS = ['q_tiet_linh', 'q_tiet_thu', 'q_tiet_dang', 'q_tiet_tinh'];
  var QUEST_META = {
    q_tiet_linh: { seasonId: 'linh_to', giver: 'hoc_tro', giverName: 'Lý Tiểu Hạnh' },
    q_tiet_thu: { seasonId: 'thu_du', giver: 'linh_gac', giverName: 'A Hổ' },
    q_tiet_dang: { seasonId: 'dang_hoa', giver: 'chu_quan', giverName: 'Hoa nương' },
    q_tiet_tinh: { seasonId: 'tinh_tu', giver: 'dai_phu', giverName: 'Lý lão' }
  };
  // GIỌNG NGƯỜI GIAO (QA 15:46 30/10, lượt test+khắc phục lệnh Bui
  // 19:35): Tiểu Hạnh tự xưng "em" gọi người chơi "anh/chị"; A Hổ, Hoa
  // nương, Lý lão đều tự xưng "ta" gọi người chơi "cháu" — khớp giọng
  // của chính họ ở mọi thoại khác trong story.js. Bản cũ cả 4 việc đều
  // "ta/ngươi" là sai giọng. Từ QA55 (mục 55 hàng chờ): lời ở đây là
  // NGUỒN DUY NHẤT, story.js không còn bản soi gương để lệch.
  var QUEST_LINES = {
    q_tiet_linh: ['Tiết Linh Tố về rồi — đất làng đang thấm linh khí, thảo dược mọc nhanh hơn mọi tháng. Nhân lúc này, anh/chị hái giúp em 3 cây Thanh Tâm Thảo tươi để em giã thuốc dự trữ cho mùa khô sắp tới.',
      'Linh Tố qua là đất khô ngay, thuốc dự trữ lúc đó mới quý. Anh/chị hái đủ 3 cây mang về đây cho em nhé.'],
    q_tiet_thu: ['Tiết Thú Dữ — trời khô, thú đói, tinh anh xuống gần làng nhiều hơn mọi tháng. Cổng Nam Môn cần người giữ: cháu hạ giúp ta 3 con Sói Con lảng vảng quanh bãi hoang, đừng để chúng mò vào ruộng.',
      'Hạ đủ 3 con là cổng yên một đêm. Tinh anh thì để lính gác lo — cháu giữ đường cho dân là đủ.'],
    q_tiet_dang: ['Tiết Đăng Hoa — đêm hội đèn của làng tới rồi! Cháu mang lời chúc hội đèn này sang cho Dì Tư (người lo lễ hội của làng) giúp ta một câu: "Đèn làng năm nay sáng hơn năm ngoái, cỗ Hoa nương nấu vẫn ngon như cũ."',
      'Dì Tư nghe lời chúc là cười ngay. Nói xong quay lại đây, ta dọn cỗ hội cho cháu ăn.'],
    q_tiet_tinh: ['Tiết Tĩnh Tu — linh khí lặng mà đầy, ngồi yên cũng hơn ngày thường. Cháu ngồi thổ nạp tích đủ 30 tu vi trong tiết này cho ta xem tâm tĩnh tới đâu — đừng vội, tĩnh mới là tu.',
      'Đủ 30 tu vi thì quay lại đây. Thổ nạp trong tiết Tĩnh Tu được thêm một phần tư, ngồi một tuần trà là đủ.']
  };
  var TURNIN_LINES = {
    q_tiet_linh: ['Ba cây Thanh Tâm Thảo còn đẫm sương — thuốc dự trữ cho mùa khô đủ rồi. Tiết Linh Tố đúng là tiết của người hái thuốc.'],
    q_tiet_thu: ['Ba con sói đã dẹp, cổng yên rồi. Tiết Thú Dữ mà có cháu giữ đường thì dân làng ngủ yên được.'],
    q_tiet_dang: ['Dì Tư cười rồi chứ? Tốt — lời chúc tới nơi là hội đèn sáng thêm một phần. Ngồi xuống ăn cỗ hội với làng đi.'],
    q_tiet_tinh: ['Đủ 30 tu vi trong một tiết — tâm cháu tĩnh được rồi. Giữ cái tĩnh này mà tu tiếp, đừng để ồn ào cuốn đi.']
  };

  // VIỆC LỄ LẶP (mục 53 hàng chờ, 2026-11-01): sau khi cả 4 việc
  // tiết gốc đã trả xong, mỗi tháng dương lịch mở thêm đúng 1 việc
  // lễ lặp của tiết tháng đó — mục tiêu chép đúng việc gốc cùng
  // tiết, người giao giữ nguyên, thưởng 0 Linh Thạch (chỉ +10 tu vi
  // và cỗ hội/hồi phục, xem js/logic.js). Từ QA55: thoại lặp cũng
  // chỉ có MỘT nguồn ở đây, bản soi gương ở story.js đã gỡ cùng
  // 4 việc gốc; test chung được miễn trừ riêng cho việc tiết và
  // test QA55 khóa "ST không còn việc tiết". Lời nhắc/bận của
  // việc lặp đi qua TD.dialogueFor ở nhánh dự phòng của game.js.
  var REPEAT_IDS = ['q_tiet_lap_linh', 'q_tiet_lap_thu', 'q_tiet_lap_dang', 'q_tiet_lap_tinh'];
  var REPEAT_META = {
    q_tiet_lap_linh: { seasonId: 'linh_to', giver: 'hoc_tro', giverName: 'Lý Tiểu Hạnh', origin: 'q_tiet_linh' },
    q_tiet_lap_thu: { seasonId: 'thu_du', giver: 'linh_gac', giverName: 'A Hổ', origin: 'q_tiet_thu' },
    q_tiet_lap_dang: { seasonId: 'dang_hoa', giver: 'chu_quan', giverName: 'Hoa nương', origin: 'q_tiet_dang' },
    q_tiet_lap_tinh: { seasonId: 'tinh_tu', giver: 'dai_phu', giverName: 'Lý lão', origin: 'q_tiet_tinh' }
  };
  var REPEAT_QUEST_LINES = {
    q_tiet_lap_linh: ['Lại tới tháng Linh Tố rồi — việc tiết gốc em nhờ anh/chị năm nào cũng xong, nhưng thuốc dự trữ thì tháng nào cũng cần giã mới. Hái giúp em 3 cây Thanh Tâm Thảo tươi như mọi lần nhé; lần này làng trả anh/chị bằng thuốc dự trữ, không phải Linh Thạch.',
      'Đất tháng này thấm linh khí, dược mọc nhanh — hái đủ 3 cây tươi mang về đây cho em giã thuốc dự trữ cho mùa khô nhé.'],
    q_tiet_lap_thu: ['Lại tới tháng Thú Dữ — cổng Nam Môn tháng nào cũng cần người giữ. Cháu hạ giúp ta 3 con Sói Con lảng vảng quanh bãi hoang như mọi lần; lần này làng trả cháu bằng phần ăn trực cổng, không phải Linh Thạch.',
      'Hạ đủ 3 con là cổng yên một đêm. Tinh anh thì để lính gác lo — cháu giữ đường cho dân là đủ.'],
    q_tiet_lap_dang: ['Lại tới tháng Đăng Hoa — hội đèn làng tháng nào cũng sáng, lời chúc tháng nào cũng cần người mang. Cháu mang lời chúc này sang cho Dì Tư giúp ta một câu: "Đèn làng năm nay sáng hơn năm ngoái, cỗ Hoa nương nấu vẫn ngon như cũ." — lần này trả cháu bằng cỗ hội, không phải Linh Thạch.',
      'Dì Tư nghe lời chúc là cười ngay. Nói xong quay lại đây, ta dọn cỗ hội cho cháu ăn.'],
    q_tiet_lap_tinh: ['Lại tới tháng Tĩnh Tu — linh khí lặng mà đầy, tháng nào cũng là tháng để ngồi yên. Cháu ngồi thổ nạp tích đủ 30 tu vi trong tiết này cho ta xem tâm tĩnh tới đâu; lần này làng trả cháu bằng thuốc hồi sức, không phải Linh Thạch.',
      'Đủ 30 tu vi thì quay lại đây. Thổ nạp trong tiết Tĩnh Tu được thêm một phần tư, ngồi một tuần trà là đủ.']
  };
  var REPEAT_TURNIN_LINES = {
    q_tiet_lap_linh: ['Ba cây Thanh Tâm Thảo còn đẫm sương — thuốc dự trữ tháng này đủ rồi. Cầm lấy phần thuốc của làng, tháng sau lại ghé nhé.'],
    q_tiet_lap_thu: ['Ba con sói đã dẹp, cổng yên rồi. Cầm lấy phần ăn trực cổng — tháng sau thú lại xuống thì cháu lại ghé giữ đường giúp làng.'],
    q_tiet_lap_dang: ['Dì Tư cười rồi chứ? Tốt — lời chúc tới nơi là hội đèn sáng thêm một phần. Ngồi xuống ăn cỗ hội với làng đi, tháng sau lại mang chúc tiếp nhé.'],
    q_tiet_lap_tinh: ['Đủ 30 tu vi trong một tiết — tâm cháu tĩnh được rồi. Cầm lấy thuốc hồi sức, giữ cái tĩnh này mà tu tiếp.']
  };
  function isRepeatQuest(qid) { return REPEAT_IDS.indexOf(qid) >= 0; }
  function allFourTurnedIn(qs) {
    if (!qs) return false;
    for (var i = 0; i < QUEST_IDS.length; i++) {
      if (!turnedIn(qs, QUEST_IDS[i])) return false;
    }
    return true;
  }
  function monthKeyOf(v) { return seasonOf(v).key; }
  function repeatQuestIdForSeason(seasonId) {
    for (var i = 0; i < REPEAT_IDS.length; i++) {
      if (REPEAT_META[REPEAT_IDS[i]].seasonId === seasonId) return REPEAT_IDS[i];
    }
    return null;
  }
  // Việc lễ lặp mở nhận: đủ cả 4 việc gốc + không đang dở việc tiết
  // nào (gốc hay lặp — một lúc chỉ một việc tiết) + chưa trả việc
  // lặp nào trong đúng tháng này. Khóa là TOÀN CỤC theo tháng
  // (bất kỳ giá trị nào trong qs.repeatDone bằng tháng hiện tại
  // cũng chặn), không phải theo từng việc — nếu không, việc lặp
  // tháng trước kéo sang trả trong tháng này rồi nhận tiếp việc
  // tháng này sẽ thành 2 lần trả trong cùng một tháng.
  function repeatDoneThisMonth(qs, key) {
    if (!qs || !qs.repeatDone) return false;
    var ids = Object.keys(qs.repeatDone);
    for (var i = 0; i < ids.length; i++) {
      if (qs.repeatDone[ids[i]] === key) return true;
    }
    return false;
  }
  function availableRepeatId(ch, flags, qs, date) {
    if (!qs) return null;
    if (activeQuestId(qs)) return null;
    if (!allFourTurnedIn(qs)) return null;
    var s = seasonOf(date);
    var rid = repeatQuestIdForSeason(s.id);
    if (!rid) return null;
    if (repeatDoneThisMonth(qs, s.key)) return null;
    return rid;
  }

  function turnedIn(qs, qid) { return !!(qs && qs.turnedIn && qs.turnedIn.indexOf(qid) >= 0); }
  function questOfSeason(seasonId) {
    for (var i = 0; i < QUEST_IDS.length; i++) {
      if (QUEST_META[QUEST_IDS[i]].seasonId === seasonId) return QUEST_IDS[i];
    }
    return null;
  }
  // Việc mở nhận: đúng tiết hiện tại + chưa nhận + chưa trả + KHÔNG
  // đang dở một việc tiết khác (QA 15:31 30/10: trước đây tháng sau
  // mở việc mới trong khi việc cũ còn dở — hai việc tiết chồng nhau,
  // marker ! của tiết mới nuốt mất câu nhắc của việc đang dở). Một
  // lúc chỉ một việc tiết: xong việc cũ thì việc tiết tháng này mở.
  function availableQuestId(ch, flags, qs, date) {
    if (!qs) return null;
    if (activeQuestId(qs)) return null;
    var qid = questOfSeason(seasonOf(date).id);
    if (!qid) return null;
    if (turnedIn(qs, qid) || (qs.accepted && qs.accepted[qid])) return null;
    return qid;
  }
  // Việc đang làm (không khóa tiết — đã nhận thì trả được sang tháng sau).
  // Từ mục 53: việc đang làm có thể là việc gốc hoặc việc lễ lặp.
  function activeQuestId(qs) {
    if (!qs) return null;
    for (var i = 0; i < QUEST_IDS.length; i++) {
      if (qs.accepted && qs.accepted[QUEST_IDS[i]]) return QUEST_IDS[i];
    }
    for (var j = 0; j < REPEAT_IDS.length; j++) {
      if (qs.accepted && qs.accepted[REPEAT_IDS[j]]) return REPEAT_IDS[j];
    }
    return null;
  }
  function giverOf(qid) {
    if (QUEST_META[qid]) return QUEST_META[qid].giver;
    if (REPEAT_META[qid]) return REPEAT_META[qid].giver;
    return null;
  }
  function markerFor(npcId, flags, qs, date) {
    if (!qs) return null;
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done && giverOf(act) === npcId) return '?';
    var av = availableQuestId(null, flags, qs, date);
    if (av && QUEST_META[av].giver === npcId) return '!';
    var avR = availableRepeatId(null, flags, qs, date);
    if (avR && REPEAT_META[avR].giver === npcId) return '!';
    return null;
  }
  // Câu nhắc khi việc tiết đang dở: nói rõ TIẾN ĐỘ đã làm được bao
  // nhiêu (đúng mẫu câu nhắc có đếm của các chuỗi khác) và giữ giọng
  // của người giao — thay câu chung chung "việc đang làm dở" trước
  // đây, vốn không cho người chơi biết còn thiếu gì (QA 15:46 30/10).
  function reminderLine(qid, progress) {
    var p = Math.max(0, progress | 0);
    if (qid === 'q_tiet_linh') return 'Thanh Tâm Thảo em nhờ, anh/chị đã hái ' + p + '/3 cây. Hái đủ 3 cây tươi mang về đây cho em giã thuốc dự trữ cho mùa khô nhé.';
    if (qid === 'q_tiet_thu') return 'Sói Con quanh bãi hoang, cháu đã hạ ' + p + '/3 con. Hạ đủ 3 con là cổng yên một đêm — xong thì quay lại đây gặp ta.';
    if (qid === 'q_tiet_dang') return 'Lời chúc chưa tới nơi à cháu? Dì Tư là người lo lễ hội của làng, ở ngay sân làng — mang lời chúc sang cho dì, rồi quay lại đây ăn cỗ hội với ta.';
    if (qid === 'q_tiet_tinh') return 'Cháu đã tích ' + p + '/30 tu vi trong tiết này. Cứ ngồi yên thổ nạp — tiết Tĩnh Tu cộng thêm một phần tư, đủ 30 thì quay lại đây.';
    return 'Việc tiết đang làm dở — xong thì quay lại gặp ta.';
  }
  function dialogueFor(npcId, flags, qs, date) {
    if (!qs) return null;
    // Dì Tư (le_su) không phải người giao việc nhưng là người NHẬN
    // lời chúc của việc Đăng Hoa: đang mang lời chúc tới thì bà có
    // câu phản ứng riêng, không nói thoại chào chung chung (QA
    // 15:46 30/10 — trước đây thoại này không tồn tại ở đâu cả).
    if (npcId === 'le_su' && qs.accepted && ((qs.accepted.q_tiet_dang && !qs.accepted.q_tiet_dang.done) || (qs.accepted.q_tiet_lap_dang && !qs.accepted.q_tiet_lap_dang.done))) {
      return ['Ôi chao — lời chúc của con bé Hoa nương đấy à? "Đèn làng năm nay sáng hơn năm ngoái" — nó miệng càu nhàu vậy thôi chứ bụng dạ thương làng lắm. Dì nhận lời chúc rồi đó nghen. Về thưa lại là dì cười rồi, cỗ hội năm nay dì cũng góp một tay.'];
    }
    var act = activeQuestId(qs);
    if (act && giverOf(act) === npcId) {
      if (qs.accepted[act].done) {
        if (isRepeatQuest(act)) return REPEAT_TURNIN_LINES[act];
        return TURNIN_LINES[act];
      }
      // Việc lặp dùng đúng câu nhắc của việc gốc cùng tiết (mục tiêu
      // giống hệt) — không viết thêm bản nhắc riêng.
      if (isRepeatQuest(act)) return [reminderLine(REPEAT_META[act].origin, qs.accepted[act].progress || 0)];
      return [reminderLine(act, qs.accepted[act].progress || 0)];
    }
    // QA (f) 15:31 30/10, mục 52 hàng chờ (phương án (a) — chặn việc
    // tiết thứ hai): đang dở một việc tiết thì người giao việc tiết
    // của tháng này cũng nói rõ lý do chưa mở nhận. Trước đây nhánh
    // này trả null nên người chơi gặp người giao mới chỉ thấy câu
    // chào chung, không biết vì sao không có nút nhận việc — trong
    // khi nút nhận vốn đã bị availableQuestId chặn (một lúc chỉ
    // một việc tiết) nên việc thứ hai không bao giờ rơi vào cảnh
    // "làm xong mà không có nút trả". Nhánh này chỉ chạy khi người
    // giao tháng này khác người giao việc đang dở và việc tháng này
    // chưa từng trả (đã trả rồi thì không còn việc để nhận nữa).
    var curQ52 = questOfSeason(seasonOf(date).id);
    if (act && curQ52 && QUEST_META[curQ52].giver === npcId && !turnedIn(qs, curQ52)) {
      return ['Việc tiết tháng này chưa mở nhận được — đang dở một việc tiết khác (' + QUEST_META[act].giverName + ' giao), làm xong việc đó đã rồi quay lại đây nhận việc mới.'];
    }
    var av = availableQuestId(null, flags, qs, date);
    if (av && QUEST_META[av].giver === npcId) return QUEST_LINES[av];
    var avR = availableRepeatId(null, flags, qs, date);
    if (avR && REPEAT_META[avR].giver === npcId) return REPEAT_QUEST_LINES[avR];
    return null;
  }
  // Trạng thái việc tiết của tiết hiện tại, cho panel Tiết Khí.
  // Từ mục 53: khi cả 4 việc gốc đã trả xong, panel chuyển sang
  // việc lễ lặp của tiết tháng này (state 'repeat_done' khi tháng
  // này đã trả xong một việc lặp — tháng sau lại mở việc mới).
  function questStatus(qs, date) {
    var s = seasonOf(date);
    var qid = questOfSeason(s.id);
    var meta = QUEST_META[qid];
    if (turnedIn(qs, qid) && allFourTurnedIn(qs)) {
      var rid = repeatQuestIdForSeason(s.id);
      var rmeta = REPEAT_META[rid];
      if (qs && qs.accepted && qs.accepted[rid]) {
        return { season: s, questId: rid, giver: rmeta.giver, giverName: rmeta.giverName, state: qs.accepted[rid].done ? 'done_waiting' : 'active', repeat: true };
      }
      if (repeatDoneThisMonth(qs, s.key)) {
        return { season: s, questId: rid, giver: rmeta.giver, giverName: rmeta.giverName, state: 'repeat_done', repeat: true };
      }
      return { season: s, questId: rid, giver: rmeta.giver, giverName: rmeta.giverName, state: 'available', repeat: true };
    }
    var state = 'available';
    if (turnedIn(qs, qid)) state = 'turned_in';
    else if (qs && qs.accepted && qs.accepted[qid]) state = qs.accepted[qid].done ? 'done_waiting' : 'active';
    return { season: s, questId: qid, giver: meta.giver, giverName: meta.giverName, state: state };
  }

  var api = {
    SEASONS: SEASONS, QUEST_IDS: QUEST_IDS, QUEST_META: QUEST_META,
    QUEST_LINES: QUEST_LINES, TURNIN_LINES: TURNIN_LINES,
    REPEAT_IDS: REPEAT_IDS, REPEAT_META: REPEAT_META,
    REPEAT_QUEST_LINES: REPEAT_QUEST_LINES, REPEAT_TURNIN_LINES: REPEAT_TURNIN_LINES,
    seasonIndexOf: seasonIndexOf, seasonOf: seasonOf, nextSeasonOf: nextSeasonOf,
    medMult: medMult, herbRespawnMult: herbRespawnMult, eliteMult: eliteMult,
    questOfSeason: questOfSeason, availableQuestId: availableQuestId,
    activeQuestId: activeQuestId, markerFor: markerFor, dialogueFor: dialogueFor,
    reminderLine: reminderLine, questStatus: questStatus,
    isRepeatQuest: isRepeatQuest, allFourTurnedIn: allFourTurnedIn,
    monthKeyOf: monthKeyOf, repeatQuestIdForSeason: repeatQuestIdForSeason,
    availableRepeatId: availableRepeatId, repeatDoneThisMonth: repeatDoneThisMonth
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_SEASON_TIDE = api;
})(typeof window !== 'undefined' ? window : globalThis);
