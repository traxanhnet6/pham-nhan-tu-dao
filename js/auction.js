// ============================================================
// PHIÊN ĐẤU GIÁ LIÊN TÔNG — mục 2 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: sau Sơn Môn Đại Hội (chương 8, q_chinh_8 đã trả), mười
// tông đều có đệ tử ở Chân Núi Thanh Phong — và họ đều thiếu cùng một
// thứ: nguyên liệu đột phá khan hiếm thời mạt pháp. Thay vì tranh nhau
// ngoài chợ đen, các tông lập phiên đấu giá chung tại quảng trường
// map 3, do chấp sự Kim Vạn Thông giữ búa. Người chơi đấu giá THẬT
// bằng Linh Thạch của mình, ngang hàng với đệ tử các tông — thắng thì
// mang vật phẩm về túi, thua thì tiền còn nguyên (chỉ trả khi chốt).
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/escort.js và js/tournament.js:
// dữ liệu + luật thuần test bằng Node, game.js chỉ nối NPC/panel và
// DIỄN GIẢI phần thưởng bằng hệ thật — vũ khí, pháp bảo, đan phương):
// - Lịch phiên giờ thật (đồng hồ địa phương, như Đại Hội): 2 phiên/ngày
//   — 12:00 và 20:00, mỗi phiên mở 90 phút. Ngoài khung giờ, panel chỉ
//   hiện giờ phiên sau + 3 lô sẽ lên sàn (xem trước, không đấu được).
// - Mỗi phiên đúng 3 lô, xoay vòng theo ngày + ca phiên trên bảng 17 lô
//   (pháp bảo/vũ khí/đan phương — xem LOTS): phiên hôm nay khác phiên
//   hôm qua, không lô nào lặp trong cùng một ngày.
// - Điều kiện vào phiên: đang đứng ở map 3 + đã trả q_chinh_8 (qua Sơn
//   Môn Đại Hội, các tông mới có mặt). Chưa qua thì Kim Vạn Thông nói
//   rõ: phiên này chỉ dành cho người đã qua sơn môn.
// - Người đấu cùng: đệ tử đại diện của các tông ĐÃ MỞ (theo
//   js/sects.js: nhiệm vụ mở khoá đã trả). Mỗi đệ tử có giá trần ẩn
//   định sẵn theo lô + tông (không lăn ngẫu nhiên — cùng một phiên, cùng
//   một lô thì cùng một kịch bản, người chơi học được "tính" từng tông).
//   Giá trần = tỉ lệ của giá trần lô, 70%–95%, riêng một tông "máu" mỗi
//   lô chịu tới sát trần (trần − 1 bước) — để người chơi LUÔN có cửa
//   thắng ở đúng giá trần: đệ tử máu nâng tới trần − 1 bước, người chơi
//   trả đúng trần là hết người nâng nổi. (Trần đệ tử mà bằng đúng giá
//   trần lô thì khi số bước chẵn, đệ tử sẽ chốt đúng trần và người chơi
//   không còn nước nào trả được — lô đó thành không thắng nổi.)
// - Cách đấu (theo lượt, trong panel — không cần tick thời gian thực):
//   giá khởi điểm -> người chơi bấm "Trả giá" (+1 bước giá) -> nếu còn
//   đệ tử chịu được giá mới, đệ tử đầu tiên theo thứ tự tông sẽ nâng
//   tiếp +1 bước. Hết đệ tử chịu nổi thì người chơi bấm "Chốt giá":
//   trừ Linh Thạch đúng giá chốt, vật phẩm vào túi ngay. Bấm "Bỏ qua
//   lô" thì các đệ tử tự đấu với nhau tới giá = giá trần cao thứ hai
//   + 1 bước (đệ tử trần cao nhất thắng), lô đó không còn cho người
//   chơi. Bỏ qua lô KHÔNG mất tiền.
// - Giá trần (đối chiếu docs/economy.md mục 6, quy tắc 7 — món tốt của
//   chặng phải ≥ 1 giờ farm LT thuần của chặng đó, và đây là KHOẢN CHI
//   nên càng đắt càng là hố rút Linh Thạch, không phải nguồn phát):
//   Linh phẩm khởi 300–340, trần 600–640 (vũ khí Linh ở shop đã 520–
//   600, đấu giá không rẻ hơn shop bao nhiêu — cái quý là hàng Huyền/
//   Địa vốn KHÔNG BÁN ở shop); Huyền phẩm khởi 480–560, trần 1000–
//   1120; Địa phẩm + đan phương Thiên phẩm khởi 900, trần 1800
//   (cuối chặng farm ~1100–1700 LT/giờ nên 1800 ≈ hơn 1 giờ farm cuối
//   chặng — đắt nhưng với tới được, đúng mức "đáng cân nhắc").
//   Người chơi KHÔNG BAO GIỜ được trả quá giá trần: nút Trả giá tắt
//   khi giá chốt đã chạm trần.
// - Lô có yêu cầu tầng (reqTier, cùng thang với vũ khí/pháp bảo): chưa
//   đủ tầng thì vẫn xem, vẫn bỏ qua, nhưng không được trả giá — tránh
//   mua đồ về rồi không dùng được mà không hiểu vì sao (panel nói rõ).
// - Trạng thái nằm trong flags.auction của save (L.serialize mang theo
//   nguyên vẹn); save cũ không có trường này thì ensure() khởi tạo lười.
//   Một phiên đã đấu xong thì ghi vào doneKeys — cùng phiên không đấu
//   lại được, sang phiên sau lô mới.
// ============================================================
(function (global) {
  'use strict';
  var L = null, SECT = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECT = require('./sects.js'); } catch (e) { SECT = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    SECT = global.PNT_SECTS || null;
  }

  var AUCTIONEER = { id: 'dau_gia_su', name: 'Kim Vạn Thông', title: 'Chấp Sự Đấu Giá Liên Tông', mapId: 'map3', x: 122, y: 102 } // V7-EXPAND: (82,67)+neo map3 (40,35) // V10: + offset map (12,8); V5: +40,+42;
  var SESSIONS = [12 * 60, 20 * 60]; // 12:00 và 20:00, phút từ 00:00 giờ địa phương
  var DUR_MIN = 90;
  var LOTS_PER_SESSION = 3;

  // kind: 'weapon' | 'artifact' | 'recipe'. start/cap/step tính bằng LT.
  // reqTier theo thang vũ khí/pháp bảo (0 = phàm, 1 = Linh, 2 = Huyền, 3 = Địa/Thiên).
  var LOTS = [
    { id: 'kiem_linh', kind: 'weapon', reqTier: 1, start: 320, cap: 620, step: 20 },
    { id: 'dao_linh', kind: 'weapon', reqTier: 1, start: 340, cap: 640, step: 20 },
    { id: 'thuong_linh', kind: 'weapon', reqTier: 1, start: 340, cap: 640, step: 20 },
    { id: 'cung_linh', kind: 'weapon', reqTier: 1, start: 320, cap: 620, step: 20 },
    { id: 'truong_linh', kind: 'weapon', reqTier: 1, start: 340, cap: 640, step: 20 },
    { id: 'kinh_chieu_yeu', kind: 'artifact', reqTier: 1, start: 300, cap: 600, step: 20 },
    { id: 'ho_tam_boi', kind: 'artifact', reqTier: 1, start: 340, cap: 640, step: 20 },
    { id: 'kiem_huyen', kind: 'weapon', reqTier: 2, start: 520, cap: 1080, step: 40 },
    { id: 'dao_huyen', kind: 'weapon', reqTier: 2, start: 560, cap: 1120, step: 40 },
    { id: 'thuong_huyen', kind: 'weapon', reqTier: 2, start: 540, cap: 1100, step: 40 },
    { id: 'cung_huyen', kind: 'weapon', reqTier: 2, start: 520, cap: 1080, step: 40 },
    { id: 'truong_huyen', kind: 'weapon', reqTier: 2, start: 560, cap: 1120, step: 40 },
    { id: 'chuong_tran_hon', kind: 'artifact', reqTier: 2, start: 500, cap: 1040, step: 40 },
    { id: 'dai_hoi_xuan_dan', kind: 'recipe', reqTier: 2, start: 300, cap: 600, step: 20 },
    { id: 'kiem_dia', kind: 'weapon', reqTier: 3, start: 900, cap: 1800, step: 50 },
    { id: 'phi_kiem_bao', kind: 'artifact', reqTier: 3, start: 900, cap: 1800, step: 50 },
    { id: 'cuu_chuyen_hoi_hon_dan', kind: 'recipe', reqTier: 3, start: 900, cap: 1800, step: 50 },
    // Lô BÍ TỊCH SKILL (hệ js/manuals.js — lệnh Bui 07:05 2026-10-30):
    // kind 'manual', id là vật phẩm bt_* trong Logic.ITEMS; thắng lô
    // thì sách vào túi (game.js nhánh grant 'manual'), đọc để học
    // chiêu. Trần giá theo đúng thang hiện hành của bảng này.
    { id: 'bt_gen_phi_hoa', kind: 'manual', reqTier: 1, start: 320, cap: 620, step: 20 },
    { id: 'bt_gen_luu_sa', kind: 'manual', reqTier: 1, start: 340, cap: 640, step: 20 },
    { id: 'bt_tp_kiem_tran', kind: 'manual', reqTier: 2, start: 520, cap: 1080, step: 40 },
    { id: 'bt_boss_ho_gam', kind: 'manual', reqTier: 3, start: 900, cap: 1800, step: 50 }
  ];
  var LOT_BY_ID = {};
  LOTS.forEach(function (l) { LOT_BY_ID[l.id] = l; });
  function lotOf(id) { return LOT_BY_ID[id] || null; }

  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function turnedIn(qs, qid) {
    if (!qs) return false;
    if (L && L.isTurnedIn) return L.isTurnedIn(qs, qid);
    return Array.isArray(qs.turnedIn) && qs.turnedIn.indexOf(qid) >= 0;
  }

  // ---------- Trạng thái trong save (flags.auction) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    var a = flags.auction;
    if (!a || typeof a !== 'object') {
      a = flags.auction = { session: null, lastSession: null, doneKeys: [], stats: { sessions: 0, lotsWon: 0, lotsPassed: 0, spent: 0 } };
    }
    if (!Array.isArray(a.doneKeys)) a.doneKeys = [];
    if (!a.stats || typeof a.stats !== 'object') a.stats = { sessions: 0, lotsWon: 0, lotsPassed: 0, spent: 0 };
    return a;
  }

  // ---------- Lịch phiên (giờ địa phương, như tournament.js) ----------
  function dayKeyOf(now) {
    var d = new Date(now);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function sessionAt(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var mins = d.getHours() * 60 + d.getMinutes();
    for (var i = 0; i < SESSIONS.length; i++) {
      var start = base + SESSIONS[i] * 60000;
      var end = start + DUR_MIN * 60000;
      if (now >= start && now < end) {
        return { index: i, start: start, end: end, key: dayKeyOf(now) + '-' + i, active: true, next: null };
      }
      if (now < start) {
        return { index: i, start: start, end: end, key: dayKeyOf(now) + '-' + i, active: false,
          next: { index: i, start: start, key: dayKeyOf(now) + '-' + i } };
      }
    }
    var nstart = base + 86400000 + SESSIONS[0] * 60000;
    return { index: 0, start: nstart, end: nstart + DUR_MIN * 60000,
      key: dayKeyOf(nstart) + '-0', active: false,
      next: { index: 0, start: nstart, key: dayKeyOf(nstart) + '-0' } };
  }
  function fmtTime(ms) {
    var d = new Date(ms);
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
  }

  // ---------- Lô của một phiên ----------
  // Xoay vòng: phiên thứ k trong ngày lấy 3 lô liên tiếp, bắt đầu từ
  // (ngày * 2 + ca) * 3 — 17 lô nên chu kỳ lặp sau 17 phiên (~8,5 ngày),
  // trong một ngày 2 phiên không trùng lô nhau.
  function lotsForSessionKey(key) {
    var parts = String(key).split('-');
    var dayNum = Math.floor(new Date(parts[0], parts[1] - 1, parts[2]).getTime() / 86400000);
    var idx = num(parts[3], 0);
    var base = ((dayNum * 2 + idx) * LOTS_PER_SESSION) % LOTS.length;
    var out = [];
    for (var i = 0; i < LOTS_PER_SESSION; i++) out.push(LOTS[(base + i) % LOTS.length].id);
    return out;
  }

  // ---------- Đệ tử đấu cùng ----------
  // sects: mảng tông (mặc định từ js/sects.js). Chỉ tông đã mở mới cử đệ tử.
  function biddersFor(qs, sects) {
    var list = sects || (SECT && SECT.SECTS) || [];
    var out = [];
    list.forEach(function (s) {
      if (!s || !s.id) return;
      var unlocked = SECT && SECT.isUnlocked ? SECT.isUnlocked(qs, s.id)
        : turnedIn(qs, s.unlockQuest);
      if (unlocked) out.push({ sectId: s.id, sectName: s.name, name: s.repName || s.name });
    });
    return out;
  }
  // Giá trần ẩn của một đệ tử cho một lô: 70%–95% giá trần lô theo
  // (vị trí lô + vị trí tông), riêng một tông mỗi lô chịu tới 100%.
  function npcMaxFor(lot, bidderIndex, lotIndex) {
    if (((lotIndex + bidderIndex) % 4) === 0) return lot.cap - lot.step;
    var pct = 70 + 5 * ((lotIndex + bidderIndex * 2) % 6); // 70,75,...,95
    var m = Math.floor(lot.cap * pct / 100 / lot.step) * lot.step;
    return Math.max(m, lot.start + lot.step);
  }

  function canEnter(flags, qs, ch, mapId) {
    if (mapId !== AUCTIONEER.mapId) return { ok: false, reason: 'Phiên đấu giá chỉ mở tại quảng trường Chân Núi Thanh Phong (map 3).' };
    if (!turnedIn(qs, 'q_chinh_8')) return { ok: false, reason: 'Phiên đấu giá Liên Tông chỉ dành cho người đã qua Sơn Môn Đại Hội (chương 8) — các tông chưa có mặt thì đấu với ai?' };
    return { ok: true };
  }
  function canBidLot(ch, lot) {
    var tier = ch ? (ch.tier | 0) : 0;
    if (tier < lot.reqTier) return { ok: false, reason: 'Cần tầng ' + lot.reqTier + ' trở lên mới được trả giá lô này (hiện tại tầng ' + tier + ').' };
    return { ok: true };
  }

  function startSession(flags, qs, ch, now, sects) {
    var a = ensure(flags);
    var ce = canEnter(flags, qs, ch, AUCTIONEER.mapId);
    if (!ce.ok) return { ok: false, reason: ce.reason };
    var ses = sessionAt(now);
    if (!ses.active) return { ok: false, reason: 'Ngoài giờ phiên. Phiên sau mở lúc ' + fmtTime(ses.next.start) + '.' };
    if (a.doneKeys.indexOf(ses.key) >= 0) return { ok: false, reason: 'Phiên này đã đấu xong — sang phiên sau hãy quay lại.' };
    if (a.session && a.session.key === ses.key) return { ok: true, session: a.session };
    var bidders = biddersFor(qs, sects);
    if (!bidders.length) return { ok: false, reason: 'Chưa có tông nào cử đệ tử tới phiên — hãy mở khoá ít nhất một tông.' };
    var lotIds = lotsForSessionKey(ses.key);
    a.session = { key: ses.key, index: ses.index, lotIndex: 0, lotIds: lotIds,
      bidders: bidders, lot: newLotState(lotIds[0], bidders, 0), history: [] };
    return { ok: true, session: a.session };
  }
  function newLotState(lotId, bidders, lotIndex) {
    var lot = lotOf(lotId);
    var npcMax = {};
    bidders.forEach(function (b, i) { npcMax[b.sectId] = npcMaxFor(lot, i, lotIndex); });
    return { lotId: lotId, price: lot.start, leader: null, leaderName: null,
      bids: [], npcMax: npcMax, closed: false };
  }
  function currentLot(flags) {
    var a = ensure(flags);
    return (a.session && a.session.lot) || null;
  }
  // Đệ tử đầu tiên (theo thứ tự tông) còn chịu được giá hiện tại.
  function nextNpcBidder(session) {
    var lot = session.lot, def = lotOf(lot.lotId);
    for (var i = 0; i < session.bidders.length; i++) {
      var b = session.bidders[i];
      if ((lot.npcMax[b.sectId] || 0) >= lot.price + def.step) return b;
    }
    return null;
  }
  function canCloseLot(session) {
    var lot = session.lot;
    return lot && lot.leader === 'player' && !nextNpcBidder(session);
  }

  function playerBid(flags, ch) {
    var a = ensure(flags);
    if (!a.session || !a.session.lot) return { ok: false, reason: 'Chưa có lô nào đang đấu.' };
    var lot = a.session.lot, def = lotOf(lot.lotId);
    var cb = canBidLot(ch, def);
    if (!cb.ok) return { ok: false, reason: cb.reason };
    var next = lot.price + def.step;
    if (next > def.cap) return { ok: false, reason: 'Đã chạm giá trần ' + def.cap + ' Linh Thạch của lô này.' };
    if ((ch.linhThach | 0) < next) return { ok: false, reason: 'Không đủ Linh Thạch (cần ' + next + ', đang có ' + (ch.linhThach | 0) + ').' };
    lot.price = next; lot.leader = 'player'; lot.leaderName = 'Ngươi';
    lot.bids.push({ by: 'player', name: 'Ngươi', amount: next });
    var npc = nextNpcBidder(a.session);
    if (npc) {
      lot.price += def.step; lot.leader = npc.sectId; lot.leaderName = npc.name + ' (' + npc.sectName + ')';
      lot.bids.push({ by: npc.sectId, name: lot.leaderName, amount: lot.price });
      return { ok: true, price: lot.price, leader: lot.leader, npcRaised: lot.leaderName };
    }
    return { ok: true, price: lot.price, leader: 'player', npcRaised: null };
  }

  // Người chơi chốt giá khi mình đang dẫn và không đệ tử nào nâng nổi.
  // opts.learned: mảng đan phương đã học (chặn chốt phương đã học).
  function closeLot(flags, ch, opts) {
    var a = ensure(flags);
    if (!a.session || !a.session.lot) return { ok: false, reason: 'Chưa có lô nào đang đấu.' };
    var lot = a.session.lot, def = lotOf(lot.lotId);
    if (!canCloseLot(a.session)) return { ok: false, reason: 'Chưa chốt được: vẫn còn đệ tử sẵn sàng nâng giá, hoặc ngươi không phải người dẫn giá.' };
    if (def.kind === 'recipe' && opts && Array.isArray(opts.learned) && opts.learned.indexOf(def.id) >= 0) {
      return { ok: false, reason: 'Ngươi đã học đan phương này rồi — không cần đấu nữa.' };
    }
    if ((ch.linhThach | 0) < lot.price) return { ok: false, reason: 'Không đủ Linh Thạch để chốt (cần ' + lot.price + ').' };
    ch.linhThach -= lot.price;
    var grant = { kind: def.kind, id: def.id, price: lot.price };
    a.session.history.push({ lotId: def.id, winner: 'player', winnerName: 'Ngươi', price: lot.price });
    a.stats.lotsWon += 1; a.stats.spent += lot.price;
    advanceSession(a);
    return { ok: true, grant: grant };
  }

  // Bỏ qua lô: các đệ tử tự đấu với nhau, người thắng trả giá = trần cao
  // thứ hai + 1 bước (hoặc trần của mình nếu chỉ có một đệ tử).
  function passLot(flags) {
    var a = ensure(flags);
    if (!a.session || !a.session.lot) return { ok: false, reason: 'Chưa có lô nào đang đấu.' };
    var lot = a.session.lot, def = lotOf(lot.lotId);
    var sorted = a.session.bidders.map(function (b) {
      return { b: b, max: lot.npcMax[b.sectId] || 0 };
    }).sort(function (x, y) { return y.max - x.max; });
    var winner = sorted[0];
    var price = sorted.length > 1 ? Math.min(winner.max, sorted[1].max + def.step) : winner.max;
    price = Math.max(price, def.start);
    a.session.history.push({ lotId: def.id, winner: winner.b.sectId,
      winnerName: winner.b.name + ' (' + winner.b.sectName + ')', price: price });
    a.stats.lotsPassed += 1;
    advanceSession(a);
    return { ok: true, winnerName: winner.b.name + ' (' + winner.b.sectName + ')', price: price };
  }
  function advanceSession(a) {
    var s = a.session;
    s.lotIndex += 1;
    if (s.lotIndex >= s.lotIds.length) {
      a.lastSession = { key: s.key, lotIds: s.lotIds, history: s.history };
      a.doneKeys.push(s.key);
      a.stats.sessions += 1;
      a.session = null;
    } else {
      s.lot = newLotState(s.lotIds[s.lotIndex], s.bidders, s.lotIndex);
    }
  }

  function dialogueFor(npcId, flags, qs, ch, now) {
    if (npcId !== AUCTIONEER.id) return null;
    var a = ensure(flags);
    var ce = canEnter(flags, qs, ch, AUCTIONEER.mapId);
    if (!ce.ok) return ['Phiên đấu giá Liên Tông chỉ mở cho người đã qua Sơn Môn Đại Hội.',
      'Mười tông chưa tề tựu thì búa của lão gõ cho ai nghe? Qua chương 8 rồi hãy quay lại đây.'];
    var ses = sessionAt(now || Date.now());
    if (a.session && a.session.key === ses.key) {
      var lot = a.session.lot;
      return ['Phiên đang mở! Lô ' + (a.session.lotIndex + 1) + '/' + a.session.lotIds.length +
        ' đang ở giá ' + lot.price + ' Linh Thạch' + (lot.leaderName ? ' — ' + lot.leaderName + ' đang dẫn.' : '.'),
        'Bấm "Đấu giá" mà xem bảng, đừng đứng ngoài mà tiếc.'];
    }
    if (a.doneKeys.indexOf(ses.key) >= 0) {
      return ['Phiên này lão đã gõ búa xong rồi. Phiên sau mở lúc ' +
        fmtTime(ses.active ? ses.start + 86400000 : ses.next.start) + ' — tới đúng giờ, đừng để đệ tử các tông hốt hết đồ ngon.'];
    }
    if (ses.active) return ['Phiên đang mở mà chưa vào sàn à? Vào đi, 3 lô ngon đang chờ búa gõ đấy.'];
    return ['Phiên sau mở lúc ' + fmtTime(ses.next.start) + ' — 12:00 và 20:00 mỗi ngày, mỗi phiên 90 phút.',
      'Mười tông tranh nguyên liệu đột phá khan hiếm: vũ khí, pháp bảo, đan phương — ai trả cao, người đó mang về. Lão giữ búa công tâm, không thiên vị tông nào.'];
  }

  var api = { AUCTIONEER: AUCTIONEER, SESSIONS: SESSIONS, DUR_MIN: DUR_MIN,
    LOTS_PER_SESSION: LOTS_PER_SESSION, LOTS: LOTS, lotOf: lotOf,
    ensure: ensure, sessionAt: sessionAt, fmtTime: fmtTime,
    lotsForSessionKey: lotsForSessionKey, biddersFor: biddersFor,
    npcMaxFor: npcMaxFor, canEnter: canEnter, canBidLot: canBidLot,
    startSession: startSession, currentLot: currentLot,
    nextNpcBidder: nextNpcBidder, canCloseLot: canCloseLot,
    playerBid: playerBid, closeLot: closeLot, passLot: passLot,
    dialogueFor: dialogueFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_AUCTION = api;
})(typeof window !== 'undefined' ? window : globalThis);
