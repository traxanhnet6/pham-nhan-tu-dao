// Phàm Nhân Tu Đạo — THIÊN 5 MỞ ĐẦU: CHƯƠNG 28–30 (lệnh trực tiếp
// của Bui 19:11 ngày 2026-10-30: "Tiếp tục các thiên").
//
// Thiên 5 "Kim Đan Phong Vân" (lộ trình docs/feature-ideas.md Phần B)
// mở đầu bằng vụ án đan độc đã gieo mầm từ chương 11 + mục 36/37 của
// story-bible: một mẻ đan giả đóng ấn Đan Hà lưu hành qua phiên chợ,
// Ngũ Độc Giáo bị vu oan, và kẻ đứng sau là "ma tu" đầu tiên lộ diện
// ở vùng Thanh Sơn — người giữ di chỉ dưới điểm mạch, nắm một phần
// ba sự thật về Đại Kiếp. Ba nhiệm vụ chính, mỗi nhiệm vụ MÓC THẬT
// vào một hệ đã có (không phải thoại suông):
//   q_thien5_1 "Đan độc vào làng" — hái 4 Độc Tâm Hoa ở điểm dược
//     sẵn có (objective 'collect' chạy qua recordEvent như mọi NV
//     hái dược; module chỉ quản cổng như khuôn Thiên 4).
//   q_thien5_2 "Sào mãng ở Tâm Phế Tích" — hạ boss thế giới Cổ Mãng
//     Vương (js/bosses.js, id 'co_mang_vuong', sào ở map 4).
//   q_thien5_3 "Kẻ giữ ấn lên tiếng" — giữ trọn 1 lượt Thú Triều
//     (thắng 6/6 đợt, js/beast-tide.js) HOẶC dọn xong 1 lượt Vết
//     Nứt Hư Không (js/rift-events.js) — hai đường thay nhau để
//     không kẹt một khung giờ sự kiện duy nhất.
//
// Mẫu nối dây theo js/thien4.js: module quản cổng/marker/nút nhận
// -trả ở đại diện tông đã bái nhập (giver trừu tượng 'sect_rep'
// trong logic.js); thoại nhiệm vụ chỉ có MỘT nguồn là
// ST.DIALOGUE.sect_rep trong js/story.js (bài học mục 47 hàng
// chờ) — module này KHÔNG giữ bản sao thoại riêng.
// Cổng mở: đã bái nhập tông + Trúc Cơ trở lên + đã trả q_thien4_3.
// Thưởng (đối chiếu docs/economy.md mục 20 mới): 260 + 280 + 300 =
// 840 Linh Thạch toàn chuỗi, mỗi nhiệm vụ ≤ trần nhiệm vụ lẻ 300 LT;
// chuỗi không có khoản chi Linh Thạch bắt buộc nào (khác bài học lỗ
// ròng của Thiên 4). Điểm cống hiến 15/việc (js/sect-points.js).
(function (global) {
  'use strict';

  function LM() { return global.PNT_LOGIC || null; }
  function MM() { return global.PNT_MAPS || null; }
  function SECT() { return global.PNT_SECTS || null; }
  function FLIGHT() { return global.PNT_FLIGHT || null; }

  var CHAIN = ['q_thien5_1', 'q_thien5_2', 'q_thien5_3'];
  var MIN_RANK = 2; // Trúc Cơ (thang realmRankOf của js/maps.js)
  var TARGET_BOSS = 'co_mang_vuong'; // Cổ Mãng Vương — boss thế giới ở map 4 (js/bosses.js)

  function rankOf(ch) {
    var m = MM();
    if (m && m.realmRankOf) return m.realmRankOf(ch || {});
    return (ch && ch.tier > 0) ? 1 : 0;
  }
  function turned(qs, id) {
    if (!qs || !qs.turnedIn) return false;
    if (Array.isArray(qs.turnedIn)) return qs.turnedIn.indexOf(id) >= 0;
    return !!qs.turnedIn[id];
  }
  function gateOpen(ch, flags, qs) {
    return !!(flags && flags.sectJoined) && rankOf(ch) >= MIN_RANK && turned(qs, 'q_thien4_3');
  }
  function isGiver(npcId, flags) {
    var fl = FLIGHT();
    if (fl && fl.isGiver) return fl.isGiver(npcId, flags);
    var sc = SECT();
    if (!sc || !flags || !flags.sectJoined) return false;
    var def = sc.sectById(flags.sectJoined);
    return !!(def && def.rep === npcId);
  }
  function giverName(flags) {
    var fl = FLIGHT();
    if (fl && fl.giverName) return fl.giverName(flags);
    var sc = SECT();
    if (!sc || !flags || !flags.sectJoined) return 'Đại diện tông môn';
    var def = sc.sectById(flags.sectJoined);
    return def ? (def.repName || def.name) : 'Đại diện tông môn';
  }
  function activeQuestId(qs) {
    if (!qs || !qs.accepted) return null;
    for (var i = 0; i < CHAIN.length; i++) if (qs.accepted[CHAIN[i]]) return CHAIN[i];
    return null;
  }
  function availableQuestId(ch, flags, qs) {
    if (!gateOpen(ch, flags, qs)) return null;
    for (var i = 0; i < CHAIN.length; i++) {
      var qid = CHAIN[i];
      if (qs.accepted[qid] || turned(qs, qid)) continue;
      var q = LM() && LM().QUESTS[qid];
      if (q && q.requires && !turned(qs, q.requires)) continue;
      return qid;
    }
    return null;
  }
  function markerFor(npcId, ch, flags, qs) {
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done && isGiver(npcId, flags)) return '?';
    if (isGiver(npcId, flags) && availableQuestId(ch, flags, qs)) return '!';
    return null;
  }
  // Đánh dấu xong mục tiêu khi hệ đã có báo thành công — chỉ khi nhiệm
  // vụ tương ứng đang dở (không tự xong khi chưa nhận, không xong hộ
  // nhiệm vụ khác). Trả { questDone } để game.js toast như thien4.
  function markDone(qs, qid) {
    if (!qs || !qs.accepted || !qs.accepted[qid] || qs.accepted[qid].done) return {};
    qs.accepted[qid].progress = 1;
    qs.accepted[qid].done = true;
    return { questDone: qid };
  }
  // Chương 29: chỉ Cổ Mãng Vương mới là bằng chứng của vụ án — hạ
  // boss thế giới khác không tính (sào mãng ở Đại Sơn mới có lò
  // luyện dã chiến + trang Thủ Trát bị đánh cắp).
  function noteBossKill(qs, bossId) {
    if (bossId !== TARGET_BOSS) return {};
    return markDone(qs, 'q_thien5_2');
  }
  // Chương 30, đường 1: giữ trọn lượt Thú Triều (thắng 6/6 đợt) —
  // ma tu xúi thú đánh làng bịt đầu mối, giữ làng là hắn phải lộ.
  function noteTideWin(qs, result) {
    if (!result || result.outcome !== 'win') return {};
    return markDone(qs, 'q_thien5_3');
  }
  // Chương 30, đường 2: dọn xong 1 lượt Vết Nứt Hư Không — hắn
  // trốn trong nứt chờ khe khép, dọn xong lượt là đường trốn hết.
  function noteRiftClear(qs) { return markDone(qs, 'q_thien5_3'); }

  var api = {
    CHAIN: CHAIN, MIN_RANK: MIN_RANK, TARGET_BOSS: TARGET_BOSS,
    rankOf: rankOf, gateOpen: gateOpen, isGiver: isGiver, giverName: giverName,
    activeQuestId: activeQuestId, availableQuestId: availableQuestId, markerFor: markerFor,
    noteBossKill: noteBossKill, noteTideWin: noteTideWin, noteRiftClear: noteRiftClear
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_THIEN5 = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
