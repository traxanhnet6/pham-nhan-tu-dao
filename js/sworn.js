// ============================================================
// ĐỒNG TU KẾT NGHĨA — mục 16 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: sau mục 4, người chơi đã có 1 người bạn đi cùng cùng
// tông (js/companion.js). Kết nghĩa là bước tiếp theo hợp lý của
// mạch "đồng tu": hai người đã cùng đi, cùng đánh, cùng gục rồi
// đứng dậy — thì thề với nhau một lời dưới gốc đa ở bãi tuyển,
// có đại diện tông làm chủ lễ và trưởng làng Trần Đức làm chứng. Không
// tạo nhân vật mới: người kết nghĩa CHÍNH là người bạn đi cùng
// đã chiêu mộ (story-bible mục 32 đã mở đầu cho mục này).
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/library.js: dữ liệu +
// luật thuần test bằng Node, game.js chỉ nối marker/thoại/nút
// nhận-trả ở đại diện tông + buff vào đòn đánh phụ):
// - Cổng mở chuỗi (không tự bịa điều kiện mới): (1) đã chiêu mộ
//   bạn đi cùng (flags.companion.sectId, mục 4); (2) hảo cảm với
//   đại diện của tông đó từ mốc Thân thiết (40 điểm, mục 10) trở
//   lên — kết nghĩa với người lạ thì lời thề rỗng, nên phải thân
//   thiết trước. Chưa đủ thì đại diện tông giải thích đúng điều
//   còn thiếu (chưa chiêu mộ / chưa đủ 40 điểm), không mở chuỗi.
// - Chuỗi 3 việc, theo mẫu q_tkc_*: nhiệm vụ mang cờ knQuest nên
//   logic.js availableQuests bỏ qua, module này quản cổng +
//   marker + thoại, game.js nối nút nhận ở đại diện tông và nút
//   trả riêng (vì giver 'sect_rep' không khớp một NPC cố định
//   nên nút Trả chung theo giver không bắt được chuỗi này).
//   Việc 1 hái 3 tai Linh Chi làm lễ vật; việc 2 cùng nhau hạ 3
//   con Khỉ Mặt Đỏ phá đường núi; việc 3 về làng gặp trưởng làng
//   Trần Đức làm chứng, rồi quay lại đại diện tông làm lễ thề.
//   Trả xong việc 3 thì flags.sworn.done = true,
//   một lần duy nhất, không làm lại, không đổi người (người
//   chơi chỉ có đúng 1 bạn đi cùng nên cũng chỉ kết nghĩa 1 lần).
// - Buff NHỎ khi đi cùng nhau (chỉ khi bạn đi cùng đang active):
//   bạn đi cùng được +2 công (cộng dồn với +1/+2 từ hảo cảm của
//   mục 10, vẫn dưới công gốc của chủ ở mọi tầng — xem test KN).
//   Không hồi máu, không giảm sát thương, không Linh Thạch mới:
//   buff là sức mạnh, không phải tiền, nên docs/economy.md chỉ
//   ghi thêm thưởng nhiệm vụ của chuỗi, không sửa thang số nào.
// - Thưởng chuỗi: 60 + 80 + 100 = 240 Linh Thạch (+ 20/25/30 tu
//   vi), mỗi việc trong trần nhiệm vụ lẻ <= 300 LT của
//   economy.md mục 6 và trong trần anticheat đường 'quest' (300).
//   Điểm Cống Hiến 10/việc như q_tkc_* (việc tông, đã bái sư
//   nên điểm tích thật qua js/sect-points.js).
// - Trạng thái nằm trong flags.sworn của save (L.serialize mang
//   theo nguyên vẹn); save cũ không có trường này thì ensure()
//   khởi tạo lười. Đã kết nghĩa rồi mà cho bạn đi cùng nghỉ thì
//   buff tắt (vì không đi cùng nhau), quay lại đi cùng thì buff
//   trở lại — không mất lễ kết nghĩa.
// ============================================================
(function (global) {
  'use strict';
  var L = null, SECTM = null, COMPM = null, AFFM = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECTM = require('./sects.js'); } catch (e) { SECTM = null; }
    try { COMPM = require('./companion.js'); } catch (e) { COMPM = null; }
    try { AFFM = require('./affinity.js'); } catch (e) { AFFM = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    SECTM = global.PNT_SECTS || null;
    COMPM = global.PNT_COMPANION || null;
    AFFM = global.PNT_AFFINITY || null;
  }

  var QUEST_IDS = ['q_kn_1', 'q_kn_2', 'q_kn_3'];
  var AFF_MIN = 40; // mốc Thân thiết của js/affinity.js
  var BONUS_ATK = 2;

  function repIdOfSect(sectId) {
    if (SECTM && SECTM.sectById) {
      var s = SECTM.sectById(sectId);
      if (s) return s.rep;
    }
    return null;
  }
  function repId(flags) {
    return (flags && flags.sectJoined) ? repIdOfSect(flags.sectJoined) : null;
  }
  function isRep(npcId, flags) {
    var r = repId(flags);
    return !!r && npcId === r;
  }
  function companionSect(flags) {
    if (COMPM && COMPM.recruitedCompanion) {
      var c = COMPM.recruitedCompanion(flags);
      return c ? c.sectId : null;
    }
    return (flags && flags.companion && flags.companion.sectId) || null;
  }
  function affinityWithRep(flags) {
    var r = repId(flags);
    if (!r) return 0;
    if (AFFM && AFFM.pointsOf) return AFFM.pointsOf(flags, r);
    if (flags && flags.aff && flags.aff.pts) return flags.aff.pts[r] || 0;
    return 0;
  }

  // ---------- Trạng thái trong save (flags.sworn) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    var s = flags.sworn;
    if (!s || typeof s !== 'object') s = flags.sworn = { sectId: null, done: false };
    if (typeof s.done !== 'boolean') s.done = false;
    return s;
  }
  function isSworn(flags) {
    var s = ensure(flags);
    return !!(s && s.done && s.sectId);
  }
  // Cổng mở chuỗi: đã chiêu mộ + hảo cảm với đại diện tông >= 40.
  function gate(flags) {
    if (!flags) return { ok: false, reason: 'nosave' };
    if (isSworn(flags)) return { ok: false, reason: 'already' };
    if (!flags.sectJoined) return { ok: false, reason: 'no_sect',
      needText: 'Chỉ đệ tử đã bái nhập tông mới có bạn đi cùng để kết nghĩa — hãy làm lễ chọn tông (chương 12) rồi quay lại.' };
    if (!companionSect(flags)) return { ok: false, reason: 'no_companion',
      needText: 'Hãy mời bạn đi cùng ở đại diện tông của mình trước — chưa có người cùng đi thì kết nghĩa với ai?' };
    var pts = affinityWithRep(flags);
    if (pts < AFF_MIN) return { ok: false, reason: 'low_affinity', points: pts,
      needText: 'Tình nghĩa còn chưa đủ sâu (hảo cảm với đại diện tông mới ' + pts + '/' + AFF_MIN + ' điểm). Tặng quà, trả việc cho người đại diện tông tới mốc Thân thiết rồi quay lại làm lễ.' };
    return { ok: true, points: pts };
  }
  function turnedIn(qs, qid) { return !!(qs && qs.turnedIn && qs.turnedIn.indexOf(qid) >= 0); }
  function availableQuestId(ch, flags, qs) {
    if (!gate(flags).ok || !qs || !L) return null;
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
    if (!isRep(npcId, flags) || !qs) return null;
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done) return '?';
    if (availableQuestId(null, flags, qs)) return '!';
    return null;
  }

  var QUEST_LINES = {
    q_kn_1: ['Ngươi với người bạn đi cùng đã cùng đi một đoạn đường dài rồi — cùng đánh, cùng gục, cùng đứng dậy. Tông ta trọng nhất một chữ "nghĩa": nếu hai ngươi muốn thề làm huynh đệ kết nghĩa thì ta làm chủ lễ cho.',
      'Nhưng lễ kết nghĩa không thề suông được. Việc đầu: hái 3 tai Linh Chi tươi làm lễ vật dâng trời đất — linh chi mọc gần suối linh trong Rừng Thanh Sơn, hái cây còn đẫm sương mới tính.'],
    q_kn_2: ['Lễ vật đủ rồi. Việc thứ hai là việc của hai người cùng làm: đường núi từ bãi tuyển lên rừng có bầy Khỉ Mặt Đỏ phá phách, đệ tử gánh hàng đi qua hay bị giật đồ. Hai ngươi cùng nhau hạ 3 con Khỉ Mặt Đỏ đó cho ta.',
      'Nhớ là CÙNG nhau — một người đánh, một người giữ đường. Hạ xong thì đường núi sạch, lễ thề mới có đường mà đi.'],
    q_kn_3: ['Đường sạch rồi, lễ vật đủ rồi. Việc cuối cùng: mang lời thề này về làng cho trưởng làng Trần Đức làm chứng — người làng chứng kiến thì lời thề mới nặng, chứ thề trong bãi tuyển thì chỉ có tông nghe.',
      'Trưởng làng nghe hai ngươi đọc lời thề, gật đầu làm chứng là xong. Rồi quay lại đây, ta chủ trì lễ dưới gốc đa cho hai ngươi.']
  };
  var TURNIN_LINES = {
    q_kn_1: ['Ba tai linh chi còn đẫm sương, lễ vật này trời đất nhận. Việc đầu xong — giờ tới việc của hai người cùng làm.'],
    q_kn_2: ['Đường núi sạch khỉ rồi, đệ tử gánh hàng đi qua không còn bị giật đồ nữa. Hai ngươi đánh cùng nhau ăn ý như vậy, thề kết nghĩa là phải.',
      'Chỉ còn việc cuối: về làng gặp trưởng làng Trần Đức làm chứng.'],
    q_kn_3: ['Trưởng làng gật đầu làm chứng rồi chứ? Tốt. Vậy thì lễ thề thành — từ nay hai ngươi là huynh đệ kết nghĩa, cùng tiến cùng lui, sống chết có nhau.',
      'Đi cùng nhau, người bạn của ngươi đánh mạnh hơn một phần — không phải vì phép lạ, mà vì có người sau lưng để tin. Gục thì đỡ nhau dậy, đừng bỏ nhau giữa đường.']
  };
  function dialogueFor(npcId, flags, ch, qs) {
    if (!isRep(npcId, flags)) return null;
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done) return TURNIN_LINES[act];
    if (act) {
      var st = qs.accepted[act], q = L ? L.QUESTS[act] : null;
      var prog = 'Ngươi đang làm việc "' + (q ? q.title : act) + '" — đã được ' + st.progress + '/' + (q ? q.objectives[0].need : 0) + '. Xong thì quay lại đây.';
      if (act === 'q_kn_1') prog = 'Lễ vật kết nghĩa cần 3 tai Linh Chi tươi — ngươi đã hái ' + st.progress + '/3. Hái cây còn đẫm sương gần suối linh mới tính.';
      if (act === 'q_kn_2') prog = 'Vai kề vai cần hạ 3 con Khỉ Mặt Đỏ phá đường núi — hai ngươi đã hạ ' + st.progress + '/3. Một người đánh, một người giữ đường.';
      if (act === 'q_kn_3') prog = 'Lời thề đang chờ người làm chứng — về làng gặp trưởng làng Trần Đức, đọc lời thề cho ông nghe rồi quay lại đây làm lễ.';
      return [prog];
    }
    var av = availableQuestId(null, flags, qs);
    if (av) return QUEST_LINES[av];
    if (isSworn(flags)) {
      var comp = (COMPM && COMPM.recruitedCompanion) ? COMPM.recruitedCompanion(flags) : null;
      var nm = comp ? comp.name : 'người bạn đi cùng';
      return ['Hai ngươi đã thề dưới gốc đa rồi — ' + nm + ' là huynh đệ kết nghĩa của ngươi, tông ta ghi nhận. Đi cùng nhau thì đánh mạnh hơn một phần, vì có người sau lưng để tin.',
        'Lễ chỉ làm một lần. Giữ lời thề đó: gục thì đỡ nhau dậy, đừng bỏ nhau giữa đường.'];
    }
    var g = gate(flags);
    if (g.reason === 'low_affinity') {
      return ['Kết nghĩa không phải chuyện nói cho vui. Ngươi với người bạn đi cùng đã cùng đi một đoạn, nhưng tình nghĩa với tông ta còn chưa đủ sâu — hảo cảm mới ' + g.points + '/' + AFF_MIN + ' điểm.',
        'Tặng quà, trả việc cho ta tới mốc Thân thiết (' + AFF_MIN + ' điểm) rồi quay lại: ta sẽ mở lời thề cho hai ngươi.'];
    }
    return null;
  }

  // Trả xong việc 3 thì lễ thành: ghi cờ kết nghĩa, một lần duy nhất.
  function afterTurnIn(flags, qid) {
    var s = ensure(flags);
    if (!s) return { sworn: false };
    if (qid === 'q_kn_3' && flags.sectJoined && !s.done) {
      s.sectId = flags.sectJoined;
      s.done = true;
      return { sworn: true };
    }
    return { sworn: isSworn(flags) };
  }
  // Buff NHỎ khi đi cùng nhau: chỉ khi đã kết nghĩa VÀ bạn đi cùng
  // đang active VÀ đúng người đã kết nghĩa (cùng tông đã ghi cờ).
  function bonusAtk(flags) {
    var s = ensure(flags);
    if (!s || !s.done || !s.sectId) return 0;
    if (!flags.sectJoined || flags.sectJoined !== s.sectId) return 0;
    var active = null;
    if (COMPM && COMPM.activeCompanion) active = COMPM.activeCompanion(flags);
    else if (flags.companion && flags.companion.active) active = { sectId: flags.companion.sectId };
    if (!active || active.sectId !== s.sectId) return 0;
    return BONUS_ATK;
  }
  function oathLine(flags) {
    var comp = (COMPM && COMPM.recruitedCompanion) ? COMPM.recruitedCompanion(flags) : null;
    var nm = comp ? comp.name : 'người bạn đi cùng';
    return 'Đã kết nghĩa với ' + nm + ': cùng tiến cùng lui, sống chết có nhau. Khi đi cùng nhau, bạn đi cùng được +'
      + BONUS_ATK + ' công.';
  }

  var api = {
    QUEST_IDS: QUEST_IDS, AFF_MIN: AFF_MIN, BONUS_ATK: BONUS_ATK,
    QUEST_LINES: QUEST_LINES, TURNIN_LINES: TURNIN_LINES,
    repIdOfSect: repIdOfSect, repId: repId, isRep: isRep,
    ensure: ensure, isSworn: isSworn, gate: gate,
    availableQuestId: availableQuestId, activeQuestId: activeQuestId,
    markerFor: markerFor, dialogueFor: dialogueFor,
    afterTurnIn: afterTurnIn, bonusAtk: bonusAtk, oathLine: oathLine
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_SWORN = api;
})(typeof window !== 'undefined' ? window : globalThis);
