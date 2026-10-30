// Phàm Nhân Tu Đạo — THIÊN 4 TIẾP THEO: CHƯƠNG 25–27 (mục 18 hàng chờ,
// lệnh đứng 23:15 ngày 2026-10-29).
//
// Sau arc Vết Nứt Hư Không (chương 21–24, js/rift-events.js), Thiên 4
// "Trúc Cơ Lập Nghiệp" đi tiếp theo đúng lộ trình docs/feature-ideas.md
// Phần B: tranh linh mạch → đối thủ đồng lứa tông đối trọng → ấn cổ
// thời trước Đại Kiếp nằm dưới điểm mạch. Ba nhiệm vụ chính, mỗi nhiệm
// vụ MÓC THẬT vào một hệ đã có (không phải thoại suông):
//   q_thien4_1 "Điểm mạch Thanh Sơn" — hộ tống 1 chuyến hàng vận mạch
//     của Mã Vạn Lai (js/escort.js) tới Trạm Buôn Chân Núi.
//   q_thien4_2 "Phiên đấu giá tranh mạch" — thắng 1 lô ở phiên đấu giá
//     Liên Tông (js/auction.js), nơi đệ tử các tông cũng đang đấu.
//   q_thien4_3 "Ấn cổ dưới điểm mạch" — động phủ riêng đạt cấp 2 trở
//     lên (js/dong-phu.js): Tụ Linh Trận x2,0 mới đủ sức "đọc" ấn cổ.
//
// Mẫu nối dây theo js/rift-events.js: module quản cổng/marker/nút nhận
// -trả ở đại diện tông đã bái nhập (giver trừu tượng 'sect_rep' trong
// logic.js); thoại nhiệm vụ chỉ có MỘT nguồn là ST.DIALOGUE.sect_rep
// trong js/story.js (bài học mục 47 hàng chờ: không giữ 2 bản sao
// thoại) — game.js đọc thẳng lời đó qua nhánh fallback sect_rep, module
// này KHÔNG giữ bản sao thoại riêng.
// Cổng mở: đã bái nhập tông + Trúc Cơ trở lên + đã trả q_vet_nut_4.
// Thưởng (đối chiếu docs/economy.md mục 19 mới): 250 + 280 + 300 =
// 830 Linh Thạch toàn chuỗi, mỗi nhiệm vụ ≤ trần nhiệm vụ lẻ 300 LT;
// tiền công hộ tống / món thắng đấu giá là thưởng riêng của 2 hệ đó,
// không cộng dồn vào đây. Điểm cống hiến 15/việc (js/sect-points.js).
(function (global) {
  'use strict';

  function LM() { return global.PNT_LOGIC || null; }
  function MM() { return global.PNT_MAPS || null; }
  function SECT() { return global.PNT_SECTS || null; }
  function FLIGHT() { return global.PNT_FLIGHT || null; }

  var CHAIN = ['q_thien4_1', 'q_thien4_2', 'q_thien4_3'];
  var MIN_RANK = 2; // Trúc Cơ (thang realmRankOf của js/maps.js)

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
    return !!(flags && flags.sectJoined) && rankOf(ch) >= MIN_RANK && turned(qs, 'q_vet_nut_4');
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
  // nhiệm vụ khác). Trả { questDone } để game.js toast như rift.
  function markDone(qs, qid) {
    if (!qs || !qs.accepted || !qs.accepted[qid] || qs.accepted[qid].done) return {};
    qs.accepted[qid].progress = 1;
    qs.accepted[qid].done = true;
    return { questDone: qid };
  }
  function noteEscortWin(qs) { return markDone(qs, 'q_thien4_1'); }
  function noteAuctionWin(qs) { return markDone(qs, 'q_thien4_2'); }
  function noteCaveLevel(qs, level) {
    if ((level | 0) < 2) return {};
    return markDone(qs, 'q_thien4_3');
  }

  var api = {
    CHAIN: CHAIN, MIN_RANK: MIN_RANK,
    rankOf: rankOf, gateOpen: gateOpen, isGiver: isGiver, giverName: giverName,
    activeQuestId: activeQuestId, availableQuestId: availableQuestId, markerFor: markerFor,
    noteEscortWin: noteEscortWin, noteAuctionWin: noteAuctionWin, noteCaveLevel: noteCaveLevel
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_THIEN4 = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
