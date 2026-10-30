// Phàm Nhân Tu Đạo — NGỰ KIẾM PHI HÀNH (dữ liệu + luật thuần, test bằng Node).
// Quyết định thiết kế (docs/story-bible.md mục 24, Bui chốt ý tưởng 21:47
// 29/10, parent chốt mốc cảnh giới): ngự kiếm mở ở TRÚC CƠ (realmRank >= 2
// theo thang REALMS của js/maps.js) — Luyện Khí linh lực chưa đủ nâng kiếm
// + người. Học qua CHUỖI 3 NHIỆM VỤ TÔNG MÔN do đại diện tông NGƯỜI CHƠI ĐÃ
// BÁI NHẬP giao (giver 'sect_rep' trong logic.js QUESTS — mỗi người chơi
// một tông nên không gán cứng NPC). Hệ Trúc Cơ CHƯA có (tu hành mới tới
// Luyện Khí 9) nên hiện CHƯA AI mở được chuỗi trong chơi thật — toàn bộ hệ
// xây sẵn, Trúc Cơ ra mắt là kích hoạt ngay. Engine bay nằm ở game.js; file
// này chỉ giữ dữ liệu + luật kiểm tra (null-safe như sects.js).
//
// Luật bay (game.js thi hành):
// - Tốc độ ~1,8x chạy bộ; KHÔNG tốn linh lực (bay là di chuyển, không phải
//   chiêu thức — cân bằng để vòng sau nếu cần).
// - Va chạm theo CHIỀU CAO (Bui 21:48): bay QUA được vật THẤP — cây 'T',
//   suối/nước 'R', hàng rào 'F', sạp/xe 'S', đèn đá 'L', giếng 'E' + mọi ô
//   đi bộ được; bị CHẶN bởi vật CAO — tường/vách núi 'W', nhà 'H', đá 'o',
//   và biên map. FLY_BLOCKED dưới đây là tập chặn; mọi ô còn lại bay qua.
// - Cổng chuyển map CHỈ kích hoạt khi đã hạ xuống đất đi bộ lên ô cổng
//   (bay ngang dải cổng không nhảy map). Hạ cánh chỉ ở ô đi bộ được.
//   Vào chiến đấu (tự ra đòn / bị đánh trúng) thì tự hạ xuống.
// - Ngự Kiếm Thuật (skill phím 5) là CHIÊU THỨC, khác hẳn chế độ bay này.
(function () {
  'use strict';
  var L = null, SECT = null, M = null, W = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECT = require('./sects.js'); } catch (e) { SECT = null; }
    try { M = require('./maps.js'); } catch (e) { M = null; }
    try { W = require('./weapons.js'); } catch (e) { W = null; }
  } else if (typeof window !== 'undefined') {
    L = window.PNT_LOGIC || null;
    SECT = window.PNT_SECTS || null;
    M = window.PNT_MAPS || null;
    W = window.PNT_WEAPONS || null;
  }

  var CHAIN = ['q_ngu_kiem_1', 'q_ngu_kiem_2', 'q_ngu_kiem_3'];
  // Điều kiện mở chuỗi: Trúc Cơ (rank 2 trong REALMS của maps.js) + đã bái sư.
  var REQUIRED_RANK = 2;
  // Ô CHẶN khi bay (vật cao). Mọi ô khác (kể cả ô chặn đi bộ như cây/nước)
  // đều bay qua được. Biên map luôn chặn (game.js kiểm biên riêng).
  var FLY_BLOCKED = { W: 1, H: 1, o: 1 };
  var FLY_PASS_LOW = ['T', 'R', 'F', 'S', 'L', 'E']; // vật thấp bay qua (tài liệu/test)
  var SPEED_MULT = 1.8;   // so với tốc độ chạy bộ MOVE_TOP của game.js
  var LIFT = 26;          // độ nâng render (px) khi bay
  // Q1 — đúc linh kiếm phôi: kiếm phẩm Linh trở lên (không tiêu hao) +
  // 200 Linh Thạch + 3 Linh Chi.
  var FORGE = { linhThach: 200, item: 'linh_chi', itemN: 3, minGrade: 'linh' };
  var GRADE_ORDER = { pham: 0, linh: 1, huyen: 2, dia: 3, thien: 4 };
  // Q2 — đấu thử: hình nhân kiếm khí dựng ở Bãi Luyện Công map 3. Dùng loài
  // khi_mat_do làm thân hình nhân (loài hình người duy nhất có sẵn) với tên
  // + chỉ số ghi đè ở game.js; sức cỡ boss nhẹ (Sơn Quân cốt truyện HP 260).
  var DUEL = { type: 'khi_mat_do', name: 'Hình Nhân Kiếm Khí', hp: 220, atk: 13, linhThach: 0, mapId: 'map3', x: 40, y: 19 };
  // Q3 — bay thử: 5 cột mốc quanh map 3, theo đúng thứ tự, phải đang bay.
  var TRIAL_SECONDS = 240; // giới hạn rộng rãi cho bài bay đầu đời
  var TRIAL_MAP = 'map3';
  var CHECKPOINTS = [
    { x: 20, y: 12, name: 'Quảng Trường Tuyển Đệ Tử' },
    { x: 40, y: 19, name: 'Bãi Luyện Công' },
    { x: 43, y: 23, name: 'Đài Vọng Vân' },
    { x: 8, y: 32, name: 'Thềm Bia Thanh Phong' },
    { x: 19, y: 4, name: 'Đường Lên Đại Sơn' }
  ];
  var CHECKPOINT_RADIUS = 52; // px tới tâm cột mốc

  // Giọng riêng từng tông cho chuỗi ngự kiếm (khung chung, vị riêng):
  // art = tên gọi môn ngự kiếm của tông; q1/q2/q3 = lời đặc trưng từng bài;
  // done = lời dặn khi trao cờ ngự kiếm.
  var SECT_FLAVOR = {
    thanh_phong: { art: 'Thanh Phong Ngự Kiếm',
      q1: 'Kiếm của Thanh Phong không nặng ở thép, nặng ở tâm. Đem thanh kiếm Linh phẩm của ngươi lại đây — ta đúc linh cho nó nhớ chủ, từ nay nó là chân của ngươi trên trời.',
      q2: 'Hình Nhân Kiếm Khí ở Bãi Luyện Công giữ đúng kiếm thức nhập môn của phái ta. Thắng được nó, kiếm mới chịu nghe lời ngươi lúc lơ lửng.',
      q3: 'Năm cột mốc quanh trấn là đường bay thử của đệ tử Thanh Phong từ trăm năm nay. Bay đúng thứ tự, và nhớ: trên trời cũng không được cắt ngang qua mái nhà người ta.',
      done: 'Từ nay Thanh Phong có thêm một người bay về kịp khi làng có biến. Nhớ cho kỹ: kiếm là để chắn trước người khác, bay cũng vậy.' },
    huyen_phap: { art: 'Pháp Giá Kiếm Du',
      q1: 'Pháp tu chúng ta vốn ngự pháp khí, nhưng mượn kiếm làm thuyền pháp cũng là một đường. Đem kiếm Linh phẩm tới — ta khắc phù văn dẫn linh vào thân kiếm cho ngươi.',
      q2: 'Hình Nhân Kiếm Khí kia là pháp thân ta mượn của bãi luyện công. Đừng chỉ lo đánh — hãy xem ngươi giữ được tâm tĩnh tới đâu khi kiếm khí ép tới.',
      q3: 'Bay thử của Huyền Pháp không đua nhanh, đua ỔN. Năm cột mốc, qua đủng đỉnh cũng được, rơi giữa chừng mới là mất mặt.',
      done: 'Pháp tùy tâm chuyển — kiếm cũng vậy. Tâm ngươi yên thì trời yên.' },
    thien_cong: { art: 'Đúc Linh Ngự Kiếm',
      q1: 'Ha, đúc linh kiếm phôi là nghề nhà của Thiên Công Phường! Đem kiếm Linh phẩm, Linh Thạch với Linh Chi đây — ta gõ ba nhịp đe là nó biết bay.',
      q2: 'Hình Nhân Kiếm Khí ở bãi luyện công là hàng phường ta đúc thử năm ngoái, cứng đầu lắm. Đánh thắng nó thì món hàng của ngươi mới gọi là đạt chuẩn xuất xưởng.',
      q3: 'Bay thử thì cứ bay như thợ kiểm hàng: đủ năm cột mốc, không thiếu một. Kiếm kêu rên hay run tay ở mốc nào, về nói ta chỉnh.',
      done: 'Xong! Hàng Thiên Công đúc, bay mười năm không rơ. Có hỏng cứ mang về phường, bảo hành bằng miệng của ta.' },
    dan_ha: { art: 'Dược Khí Ngự Kiếm',
      q1: 'Linh Chi ngươi nộp không phải để ăn — ta luyện lấy dược khí tẩm vào kiếm phôi, kiếm nhẹ đi mà linh bền hơn. Đem cả kiếm Linh phẩm tới nữa.',
      q2: 'Hình Nhân Kiếm Khí ở bãi luyện công đánh không biết mệt, người thì biết. Trước khi đấu nhớ uống đan hồi phục — thua vì hụt hơi là dở nhất.',
      q3: 'Bay thử của Đan Hà chậm rãi như sắc thuốc: năm cột mốc, qua hết là được, đừng ham nhanh mà đổ cả nồi.',
      done: 'Kiếm đã thấm dược khí, bay lâu không mỏi linh. Về sau có luyện Trúc Cơ Đan, nhớ ghé cốc ta.' },
    van_thu: { art: 'Ngự Kiếm Như Ngự Thú',
      q1: 'Ngự kiếm với ngự thú giống nhau ở một chỗ: phải cho nó ăn linh, nó mới nhận chủ. Đem kiếm Linh phẩm tới, ta dạy ngươi cách “cho kiếm ăn” bằng Linh Thạch và Linh Chi.',
      q2: 'Hình Nhân Kiếm Khí kia dữ như sói đầu đàn — đừng đối đầu trực diện hoài, vòng ra sau lưng nó mà đánh. Thú dữ nào cũng có phía không nhìn thấy.',
      q3: 'Bay thử thì cứ coi như cưỡi con thú bay đầu tiên của ngươi: năm cột mốc là năm chỗ dừng chân. Nó chưa quen ngươi đâu, bay cho êm.',
      done: 'Thấy chưa, kiếm cũng như thú — thuần rồi thì nó tự tìm đường về với ngươi.' },
    thien_phu: { art: 'Phù Giá Ngự Phong',
      q1: 'Kiếm phôi của ngươi thiếu một lá Ngự Phong Phù trấn ở sống kiếm. Đem kiếm Linh phẩm tới, phí đúc linh cứ theo lệ — ta vẽ phù cho ngươi ngay tại chỗ.',
      q2: 'Hình Nhân Kiếm Khí giữ bãi luyện công bị ta dán một lá Trấn Phù ở gáy — đánh trúng nhiều cũng vô ích nếu ngươi không giữ được nhịp. Thắng nó bằng nhịp, không bằng sức.',
      q3: 'Năm cột mốc quanh trấn, ta đã âm thầm dán phù dẫn đường. Bay theo thứ tự, phù sẽ tự sáng khi ngươi tới đúng mốc.',
      done: 'Phù và kiếm đã hợp. Từ nay ngươi bay, gió cũng phải nhường đường một chút.' },
    cuu_cung: { art: 'Trận Đồ Ngự Kiếm',
      q1: 'Mọi đường bay đều là một trận đồ chưa khép. Đem kiếm Linh phẩm tới — ta khắc trận văn dẫn linh vào kiếm, để nó tự tìm được thế cân bằng trên không.',
      q2: 'Hình Nhân Kiếm Khí đứng đúng tâm trận của bãi luyện công. Muốn thắng, trước hết đừng để nó ép ngươi ra khỏi thế đứng của mình.',
      q3: 'Năm cột mốc quanh trấn xếp đúng hình ngũ hành trận. Bay sai thứ tự, trận không khép — bài thử cũng không tính. Cứ theo thứ tự mà bay.',
      done: 'Trận đã khép, kiếm đã thông. Ngươi bay ở đâu, thế trận của ngươi mở tới đó.' },
    kim_cang: { art: 'Trầm Kiếm Ngự Không',
      q1: 'Người Kim Cang thân nặng hơn người thường, kiếm phôi phải đúc CHẮC trước, nhẹ sau. Đem kiếm Linh phẩm tới — ta nện lại sống kiếm cho chịu nổi sức ngươi đứng lên.',
      q2: 'Hình Nhân Kiếm Khí ở bãi luyện công là cục sắt biết vung kiếm. Đừng sợ nó — ngươi cũng là cục sắt biết vung kiếm. Ai đứng vững hơn, người đó thắng.',
      q3: 'Bay thử của Kim Cang không cần hoa hòe: năm cột mốc, bay thẳng, đáp chắc. Rơi mà không vỡ đất thì chưa gọi là đệ tử Kim Cang.',
      done: 'Đứng lên kiếm mà như đứng trên đất bằng — vậy là thành rồi. Bay đi, núi cũng không cản nổi ngươi lâu.' },
    ngu_doc: { art: 'Ảnh Kiếm Ngự Hành',
      q1: 'Đừng lo, ta không tẩm độc vào kiếm của ngươi — độc để dành cho kẻ địch, kiếm để dành cho mình. Đem kiếm Linh phẩm tới, ta dùng cổ linh tẩm sống kiếm cho nó lặng như bóng.',
      q2: 'Hình Nhân Kiếm Khí không biết đau nên độc vô dụng — trận này ngươi phải thắng bằng tay thật. Ta muốn xem tay ngươi nhanh tới đâu khi không có độc đỡ lưng.',
      q3: 'Năm cột mốc, bay như đi trong rừng đêm: lặng, đúng thứ tự, không để lại tiếng động thừa. Đó là bài bay thử của Ngũ Độc.',
      done: 'Bay lặng như ngươi vậy mới đáng sợ. Từ nay trời cao cũng là rừng của ngươi.' },
    huyen_am: { art: 'Đàn Tâm Ngự Kiếm',
      q1: 'Ngự kiếm của Huyền Âm mở đầu bằng một khúc đàn tĩnh tâm — kiếm nghe được tiếng đàn mới chịu bay êm. Đem kiếm Linh phẩm tới, ta gảy cho ngươi nghe.',
      q2: 'Hình Nhân Kiếm Khí ra đòn theo nhịp trống của bãi luyện công. Ngươi cứ giữ nhịp đàn trong đầu mà đánh, đừng để nhịp của nó cuốn đi.',
      q3: 'Năm cột mốc là năm nốt nhạc quanh trấn. Bay đúng thứ tự, khúc nhạc mới trọn — sai một nốt là phải bay lại từ đầu đoạn.',
      done: 'Khúc nhạc đã trọn. Từ nay ngươi bay đến đâu, tiếng đàn theo tới đó.' }
  };
  var GENERIC_FLAVOR = { art: 'Ngự Kiếm Phi Hành',
    q1: 'Đem thanh kiếm Linh phẩm của ngươi tới — ta đúc linh cho nó thành phi kiếm của riêng ngươi.',
    q2: 'Đánh bại Hình Nhân Kiếm Khí ở Bãi Luyện Công để chứng minh tay kiếm của ngươi.',
    q3: 'Bay qua năm cột mốc quanh trấn theo đúng thứ tự, trong lúc đang bay.',
    done: 'Ngươi đã học được ngự kiếm. Từ nay trời cao đất rộng đều là đường của ngươi.' };

  function ensure(flags) {
    if (!flags) return { forgedUid: null };
    if (!flags.flight || typeof flags.flight !== 'object') flags.flight = { forgedUid: null };
    if (flags.flight.forgedUid === undefined) flags.flight.forgedUid = null;
    return flags.flight;
  }
  function flavor(flags) {
    var id = flags && flags.sectJoined;
    return (id && SECT_FLAVOR[id]) || GENERIC_FLAVOR;
  }
  function sectOf(flags) { return (SECT && flags && flags.sectJoined) ? SECT.sectById(flags.sectJoined) : null; }
  function giverNpcId(flags) { var s = sectOf(flags); return s ? s.rep : null; }
  function giverName(flags) { var s = sectOf(flags); return s ? s.repName : null; }
  function isGiver(npcId, flags) { var g = giverNpcId(flags); return !!g && npcId === g; }
  // Cổng mở chuỗi: đã bái sư + cảnh giới từ Trúc Cơ (rank tra bằng
  // realmRankOf của maps.js — thang REALMS dùng chung toàn game).
  function gateOpen(ch, flags) {
    if (!ch || !flags || !flags.sectJoined) return false;
    if (!M || !M.realmRankOf) return false;
    return M.realmRankOf(ch) >= REQUIRED_RANK;
  }
  function gateReason(ch, flags) {
    if (!flags || !flags.sectJoined) return 'not_sect';
    if (!M || !M.realmRankOf || M.realmRankOf(ch) < REQUIRED_RANK) return 'not_realm';
    return null;
  }
  function turnedIn(qs, qid) { return !!(qs && qs.turnedIn && qs.turnedIn.indexOf(qid) >= 0); }
  function chainState(qs, qid) {
    if (!qs) return 'locked';
    if (turnedIn(qs, qid)) return 'turned';
    var st = qs.accepted && qs.accepted[qid];
    if (st) return st.done ? 'accepted_done' : 'accepted';
    return 'not_taken';
  }
  // Nhiệm vụ chuỗi đang chờ nhận (đã mở cổng + nhiệm vụ trước đã trả).
  function availableQuestId(ch, flags, qs) {
    if (!gateOpen(ch, flags) || !qs) return null;
    for (var i = 0; i < CHAIN.length; i++) {
      var qid = CHAIN[i], q = L ? L.QUESTS[qid] : null;
      if (!q) return null;
      if (turnedIn(qs, qid)) continue;
      if (qs.accepted && qs.accepted[qid]) return null; // đang làm dở bài trước
      if (q.requires && !turnedIn(qs, q.requires)) return null;
      return qid;
    }
    return null;
  }
  function activeQuestId(qs) {
    if (!qs || !qs.accepted) return null;
    for (var i = 0; i < CHAIN.length; i++) if (qs.accepted[CHAIN[i]]) return CHAIN[i];
    return null;
  }
  // Dấu ! / ? trên đầu đại diện tông cho chuỗi ngự kiếm (null = không có).
  function markerFor(npcId, ch, flags, qs) {
    if (!isGiver(npcId, flags)) return null;
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done) return '?';
    if (availableQuestId(ch, flags, qs)) return '!';
    return null;
  }
  // Kiếm đủ chuẩn đúc linh: loại KIẾM + phẩm từ Linh trở lên. Món đang đeo
  // được ưu tiên, rồi tới phẩm cao nhất. Kiếm KHÔNG bị tiêu hao khi đúc.
  function findForgeSword(ch) {
    if (!W || !ch) return null;
    var entries = W.weaponEntries(ch).filter(function (e) {
      var d = W.WEAPONS[e.id];
      return d && d.type === 'kiem' && (GRADE_ORDER[d.grade] || 0) >= (GRADE_ORDER[FORGE.minGrade] || 1);
    });
    if (!entries.length) return null;
    entries.sort(function (a, b) {
      var ea = ch.equipUid === a.uid ? 0 : 1, eb = ch.equipUid === b.uid ? 0 : 1;
      if (ea !== eb) return ea - eb;
      return (GRADE_ORDER[W.WEAPONS[b.id].grade] || 0) - (GRADE_ORDER[W.WEAPONS[a.id].grade] || 0);
    });
    return entries[0];
  }
  function forgeCheck(ch, flags, qs) {
    if (!activeQuestId(qs) || activeQuestId(qs) !== 'q_ngu_kiem_1') return { ok: false, reason: 'no_quest' };
    var entry = findForgeSword(ch);
    if (!entry) return { ok: false, reason: 'no_sword' };
    if ((ch.linhThach || 0) < FORGE.linhThach) return { ok: false, reason: 'no_lt', entry: entry };
    if (!L || L.countItem(ch, FORGE.item) < FORGE.itemN) return { ok: false, reason: 'no_herb', entry: entry };
    return { ok: true, entry: entry };
  }
  // Đúc linh: trừ phí + ghi uid kiếm thành phi kiếm + đánh dấu Q1 hoàn thành.
  // Gọi sau forgeCheck.ok (game.js chịu trách nhiệm toast/lưu/vẽ lại).
  function applyForge(ch, flags, qs) {
    var chk = forgeCheck(ch, flags, qs);
    if (!chk.ok) return chk;
    ch.linhThach -= FORGE.linhThach;
    L.consumeItem(ch, FORGE.item, FORGE.itemN);
    ensure(flags).forgedUid = chk.entry.uid;
    var st = qs.accepted.q_ngu_kiem_1;
    st.progress = 1; st.done = true;
    return { ok: true, entry: chk.entry, swordName: W.WEAPONS[chk.entry.id].name };
  }
  // Q3: điểm người chơi (px, py) có chạm cột mốc idx không (phải đang bay —
  // điều kiện bay do game.js kiểm trước khi gọi).
  function checkpointHit(px, py, idx) {
    var cp = CHECKPOINTS[idx];
    if (!cp) return false;
    var cx = cp.x * 32 + 16, cy = cp.y * 32 + 16;
    var dx = px - cx, dy = py - cy;
    return dx * dx + dy * dy <= CHECKPOINT_RADIUS * CHECKPOINT_RADIUS;
  }
  // Thoại chuỗi theo tông: trả mảng dòng khi NPC là đại diện tông đã bái
  // nhập và chuỗi có ngữ cảnh (chờ nhận / đang làm / chờ trả); null nếu
  // không — game.js rơi về thoại thường của NPC.
  function dialogueFor(npcId, ch, flags, qs) {
    if (!isGiver(npcId, flags)) return null;
    var fv = flavor(flags);
    var act = activeQuestId(qs);
    if (act) {
      var st = qs.accepted[act];
      if (st.done) {
        if (act === 'q_ngu_kiem_3') return ['Năm cột mốc đều sáng rồi — ta đứng đây mà nghe tiếng gió kiếm của ngươi vòng quanh trấn.', fv.done, 'Kể từ hôm nay, nút Ngự Kiếm (phím F) là của ngươi. Bay cẩn thận.'];
        if (act === 'q_ngu_kiem_1') return ['Kiếm phôi đã ngân linh quang — thanh kiếm này từ nay nhận ngươi là chủ trời.', 'Qua bài thử kiếm nữa là ngươi được đặt chân lên nó.'];
        return ['Hình Nhân Kiếm Khí đã gục. Tay kiếm của ngươi đủ vững để rời mặt đất rồi.', 'Còn một bài cuối: bay thử qua năm cột mốc quanh trấn.'];
      }
      if (act === 'q_ngu_kiem_1') return ['Kiếm phôi tâm hợp là cửa đầu tiên của ' + fv.art + '.', fv.q1, 'Cần: một thanh KIẾM phẩm Linh trở lên (không mất kiếm), ' + FORGE.linhThach + ' Linh Thạch và ' + FORGE.itemN + ' Linh Chi. Đủ rồi thì chọn “Đúc linh kiếm phôi” ở dưới.'];
      if (act === 'q_ngu_kiem_2') return [fv.q2, 'Khi sẵn sàng, chọn “Dựng Hình Nhân Kiếm Khí” ngay trong lúc nói chuyện với ta — hình nhân sẽ chờ ngươi ở Bãi Luyện Công phía đông trấn. Thắng nó rồi quay lại đây.'];
      return ['Bài bay thử: ta cho ngươi mượn phi kiếm của tông để bay thử trước khi chính thức nhận phép.', fv.q3, 'Chọn “Bắt đầu bài bay thử” — bay qua đủ 5 cột mốc theo thứ tự trong ' + TRIAL_SECONDS + ' giây. Hạ cánh giữa chừng không sao, nhưng cột mốc chỉ tính khi ngươi ĐANG BAY qua.'];
    }
    var av = availableQuestId(ch, flags, qs);
    if (av === 'q_ngu_kiem_1') return ['Ngươi đã Trúc Cơ rồi — linh lực trong người đủ nâng cả kiếm lẫn người rời đất.', 'Tông môn có môn ' + fv.art + ' chỉ truyền cho đệ tử Trúc Cơ đã bái sư. Ngươi đủ cả hai điều kiện.', fv.q1];
    if (av === 'q_ngu_kiem_2') return ['Kiếm phôi đã hợp tâm, nhưng kiếm nghe lời hay không phải thử mới biết.', fv.q2];
    if (av === 'q_ngu_kiem_3') return ['Chỉ còn bài cuối của ' + fv.art + ': bay thử.', fv.q3];
    return null;
  }

  var api = {
    CHAIN: CHAIN, REQUIRED_RANK: REQUIRED_RANK,
    FLY_BLOCKED: FLY_BLOCKED, FLY_PASS_LOW: FLY_PASS_LOW,
    SPEED_MULT: SPEED_MULT, LIFT: LIFT,
    FORGE: FORGE, GRADE_ORDER: GRADE_ORDER, DUEL: DUEL,
    TRIAL_SECONDS: TRIAL_SECONDS, TRIAL_MAP: TRIAL_MAP,
    CHECKPOINTS: CHECKPOINTS, CHECKPOINT_RADIUS: CHECKPOINT_RADIUS,
    SECT_FLAVOR: SECT_FLAVOR,
    ensure: ensure, flavor: flavor, giverNpcId: giverNpcId, giverName: giverName,
    isGiver: isGiver, gateOpen: gateOpen, gateReason: gateReason,
    chainState: chainState, availableQuestId: availableQuestId, activeQuestId: activeQuestId,
    markerFor: markerFor, findForgeSword: findForgeSword,
    forgeCheck: forgeCheck, applyForge: applyForge,
    checkpointHit: checkpointHit, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_FLIGHT = api;
})();
