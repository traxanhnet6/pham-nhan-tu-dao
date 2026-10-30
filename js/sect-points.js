// Phàm Nhân Tu Đạo — ĐIỂM CỐNG HIẾN + CẤP BẬC ĐỆ TỬ TÔNG MÔN (ý A2,
// docs/feature-ideas.md; Bui duyệt 22:31 29/10, làm đầu tiên vì là nền cho
// nhiệm vụ tông). File thuần dữ liệu/luật như sects.js: nạp được bằng Node
// để test, game.js chỉ lo hiển thị + toast. Mọi tên riêng là ĐỀ XUẤT.
//
// THIẾT KẾ:
// - Điểm Cống Hiến là điểm RIÊNG của tông môn, KHÔNG phải Linh Thạch:
//   kiếm từ việc tông (nhiệm vụ tông, Thú Triều, Đại Hội...), tiêu ở Cửa
//   Hàng Tông Môn (Kho Tông) trong panel Tông Môn.
// - Điểm CHỈ tích khi đã bái sư (flags.sectJoined là id tông, xem
//   js/sects.js) và thuộc về tông đã nhập. Chưa bái sư: mọi hàm cộng
//   điểm trả added = 0, không đổi gì.
// - Trạng thái lưu trên NHÂN VẬT: ch.congHien = { points, total, claimed }
//   points  = số dư tiêu được; total = tổng tích luỹ cả đời (căn cứ lên
//   cấp — tiêu điểm KHÔNG làm tụt cấp); claimed = idx cấp cao nhất đã
//   nhận thưởng thăng cấp (thưởng chỉ phát 1 lần/cấp). Save cũ không có
//   trường này: ensure() khởi tạo 0, cấp suy ra từ total.
//
// API CHO CÁC TEAM KHÁC (ký danh cố định, đừng đổi):
//   PNT_SECT.bind(ch, flags)              — game.js gọi 1 lần khi nhân vật
//                                           vào game (đăng nhập/tạo mới).
//   PNT_SECT.addPoints(n, lyDo)           — cộng n điểm cho nhân vật đang
//                                           bind; lyDo = chuỗi ngắn ghi
//                                           nguồn (vd 'thu_trieu',
//                                           'nhiem_vu:q_mon_dan_ha_1').
//                                           Trả { added, points, total,
//                                           rank, rankUps } — added = 0
//                                           khi chưa bái sư/chưa bind.
//   PNT_SECT.points()                     — số dư điểm của nhân vật đang
//                                           bind (0 nếu chưa bind).
//   PNT_SECT.rank()                       — cấp bậc của nhân vật đang bind:
//                                           { idx, name, need, next } —
//                                           next = null khi đã Hạch Tâm.
//   Bản tường minh cho test/module khác (không cần bind):
//   PNT_SECT.addPointsTo(ch, flags, n, lyDo), PNT_SECT.pointsOf(ch),
//   PNT_SECT.rankOf(ch), PNT_SECT.spendPoints(ch, flags, n, lyDo),
//   PNT_SECT.onQuestTurnIn(ch, flags, qid), PNT_SECT.onTournamentFinish(
//   ch, flags, placement), PNT_SECT.shopList(ch, flags),
//   PNT_SECT.buy(ch, flags, itemId).
// Nguồn điểm gợi ý cho team Thú Triều: PNT_SECT.THU_TRIEU_POINTS
// (tham_gia 20 / thang 50) — gọi addPoints(n, 'thu_trieu') khi sự kiện
// kết thúc. Team truyện arc 13–18: nhiệm vụ q_mon_* tự được 15 điểm qua
// onQuestTurnIn (mặc định), muốn số riêng thì thêm vào QUEST_POINTS.
(function () {
  'use strict';
  var L = null, SECTM = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECTM = require('./sects.js'); } catch (e) { SECTM = null; }
  } else if (typeof window !== 'undefined') {
    L = window.PNT_LOGIC || null;
    SECTM = window.PNT_SECTS || null;
  }
  // ---------- Cấp bậc đệ tử (theo TỔNG điểm tích luỹ) ----------
  // Thưởng thăng cấp phát 1 LẦN khi lần đầu chạm ngưỡng: Linh Thạch theo
  // thang chật của kinh tế cày cuốc (docs/economy.md — khoản một lần cỡ
  // vài giờ farm đầu chặng) + đan hỗ trợ đột phá ở 2 cấp cao.
  var RANKS = [
    { idx: 0, name: 'Ngoại Môn Đệ Tử', need: 0, reward: null },
    { idx: 1, name: 'Nội Môn Đệ Tử', need: 100, reward: { linhThach: 100, items: [] } },
    { idx: 2, name: 'Đệ Tử Chân Truyền', need: 300, reward: { linhThach: 200, items: [{ id: 'ngung_khi_dan', n: 1 }] } },
    { idx: 3, name: 'Đệ Tử Hạch Tâm', need: 700, reward: { linhThach: 400, items: [{ id: 'pha_canh_dan', n: 1 }] } }
  ];
  function rankIdxForTotal(total) {
    var idx = 0;
    for (var i = 0; i < RANKS.length; i++) if ((total || 0) >= RANKS[i].need) idx = i;
    return idx;
  }
  // ---------- Trạng thái trên nhân vật ----------
  function ensure(ch) {
    if (!ch) return null;
    var s = ch.congHien;
    if (!s || typeof s !== 'object') s = ch.congHien = { points: 0, total: 0, claimed: 0 };
    if (typeof s.points !== 'number' || isNaN(s.points) || s.points < 0) s.points = 0;
    if (typeof s.total !== 'number' || isNaN(s.total) || s.total < 0) s.total = 0;
    if (typeof s.claimed !== 'number' || isNaN(s.claimed) || s.claimed < 0) s.claimed = 0;
    s.points = Math.floor(s.points); s.total = Math.floor(s.total); s.claimed = Math.floor(s.claimed);
    return s;
  }
  // Tông của nhân vật: flags.sectJoined giữ ID tông (js/sects.js); chấp
  // thêm flags.sectId nếu sau này có module ghi dạng đó.
  function sectIdOf(flags) {
    if (!flags) return null;
    if (typeof flags.sectJoined === 'string' && flags.sectJoined) return flags.sectJoined;
    if (typeof flags.sectId === 'string' && flags.sectId) return flags.sectId;
    return null;
  }
  function pointsOf(ch) { var s = ensure(ch); return s ? s.points : 0; }
  function totalOf(ch) { var s = ensure(ch); return s ? s.total : 0; }
  function rankOf(ch) {
    var s = ensure(ch);
    var total = s ? s.total : 0;
    var idx = rankIdxForTotal(total);
    var cur = RANKS[idx];
    var next = idx + 1 < RANKS.length ? RANKS[idx + 1] : null;
    return {
      idx: idx, name: cur.name, need: cur.need,
      points: s ? s.points : 0, total: total,
      next: next ? { idx: next.idx, name: next.name, need: next.need, missing: next.need - total } : null
    };
  }
  // Cộng điểm (bản tường minh). Chưa bái sư / số không hợp lệ -> added 0.
  // Vượt ngưỡng cấp: phát thưởng từng cấp chưa nhận, kèm trong rankUps.
  function addPointsTo(ch, flags, n, lyDo) {
    var zero = { added: 0, points: pointsOf(ch), total: totalOf(ch), rank: rankOf(ch), rankUps: [], lyDo: lyDo || '' };
    if (!ch || !sectIdOf(flags)) { zero.reason = 'not_joined'; return zero; }
    n = Math.floor(n);
    if (!(n > 0)) { zero.reason = 'invalid'; return zero; }
    var s = ensure(ch);
    s.points += n; s.total += n;
    var rankUps = [];
    var target = rankIdxForTotal(s.total);
    while (s.claimed < target) {
      s.claimed += 1;
      var def = RANKS[s.claimed];
      if (def.reward) {
        if (def.reward.linhThach) {
          var ltRw = def.reward.linhThach;
          var AC = (typeof globalThis !== 'undefined') ? globalThis.PNT_ANTICHEAT : null; // chống hack: trần thưởng thăng cấp
          if (AC && typeof AC.guardGain === 'function') ltRw = AC.guardGain('sectRank', ltRw);
          ch.linhThach = (ch.linhThach || 0) + ltRw;
        }
        if (L && def.reward.items) def.reward.items.forEach(function (it) { L.addItem(ch, it.id, it.n); });
      }
      rankUps.push({ idx: def.idx, name: def.name, reward: def.reward });
    }
    return { added: n, points: s.points, total: s.total, rank: rankOf(ch), rankUps: rankUps, sectId: sectIdOf(flags), lyDo: lyDo || '' };
  }
  // Tiêu điểm (cửa hàng dùng nội bộ; team khác dùng khi cần sink riêng).
  function spendPoints(ch, flags, n, lyDo) {
    if (!ch || !sectIdOf(flags)) return { ok: false, error: 'Chưa bái nhập tông môn.' };
    n = Math.floor(n);
    if (!(n > 0)) return { ok: false, error: 'Số điểm không hợp lệ.' };
    var s = ensure(ch);
    if (s.points < n) return { ok: false, error: 'Không đủ Điểm Cống Hiến.' };
    s.points -= n;
    return { ok: true, points: s.points, lyDo: lyDo || '' };
  }
  // ---------- Nguồn điểm: nhiệm vụ tông ----------
  // Bảng điểm theo nhiệm vụ tông HIỆN CÓ. Lưu ý thực tế: chuỗi q_tong_*
  // + q_chinh_9/q_chinh_18 là phép thử TRƯỚC bái sư nên khi trả, người
  // chơi thường CHƯA nhập tông -> addPointsTo chặn, điểm không tích
  // (đúng luật "chỉ tích khi đã bái sư"). Chuỗi ngự kiếm q_ngu_kiem_*
  // làm SAU bái sư nên tích thật. Nhiệm vụ tông tương lai (arc 13–18
  // q_mon_<tông>_<n>, nhiệm vụ gắn cờ sectQuest, nhiệm vụ lặp của tông)
  // được điểm mặc định theo loại ở questPoints() — team truyện muốn số
  // riêng cho nhiệm vụ nào thì thêm 1 dòng vào bảng này.
  var QUEST_POINTS = {
    q_chinh_9: 5,
    q_tong_phap: 10, q_tong_khi: 10, q_tong_dan: 10, q_tong_thu: 10, q_tong_phu: 10,
    q_tong_tran: 10, q_tong_the: 10, q_tong_doc: 10, q_tong_am: 10,
    q_tkc_1: 10, q_tkc_2: 10, q_tkc_3: 10,
    q_kn_1: 10, q_kn_2: 10, q_kn_3: 10,
    q_chinh_18: 15,
    q_thien4_1: 15, q_thien4_2: 15, q_thien4_3: 15,
    q_thien5_1: 15, q_thien5_2: 15, q_thien5_3: 15,
    q_ngu_kiem_1: 20, q_ngu_kiem_2: 30, q_ngu_kiem_3: 40
  };
  var QUEST_DEFAULTS = { sectQuest: 20, q_mon: 15, q_tong: 10 };
  function questPoints(qid) {
    if (Object.prototype.hasOwnProperty.call(QUEST_POINTS, qid)) return QUEST_POINTS[qid];
    var q = (L && L.QUESTS) ? L.QUESTS[qid] : null;
    if (q && q.sectQuest) return QUEST_DEFAULTS.sectQuest;
    if (/^q_mon_/.test(qid)) return QUEST_DEFAULTS.q_mon;
    if (/^q_tong_/.test(qid)) return QUEST_DEFAULTS.q_tong;
    return 0;
  }
  function onQuestTurnIn(ch, flags, qid) {
    var n = questPoints(qid);
    if (n <= 0) return { added: 0, reason: 'no_points', rankUps: [] };
    return addPointsTo(ch, flags, n, 'nhiem_vu:' + qid);
  }
  // ---------- Nguồn điểm: Đại Hội Tu Tiên (js/tournament.js) ----------
  // Cộng 1 lần khi kỳ kết thúc (game.js gọi cùng chỗ claimRewards chốt
  // thưởng nên không trùng). placement là khóa hạng của tournament.js.
  var TOURN_POINTS = { tham_gia: 10, tu_ket: 15, hang_tu: 20, hang_ba: 30, a_quan: 45, quan_quan: 60 };
  function onTournamentFinish(ch, flags, placement) {
    var n = TOURN_POINTS[placement];
    if (!n) return { added: 0, reason: 'no_points', rankUps: [] };
    return addPointsTo(ch, flags, n, 'dai_hoi:' + placement);
  }
  // ---------- Nguồn điểm: Thú Triều (team khác đang xây) ----------
  // Giá trị GỢI Ý đã chốt sẵn để team thú triều bám vào: tham gia giữ
  // làng 20, giữ thành công 50. Họ gọi PNT_SECT.addPoints(n, 'thu_trieu').
  var THU_TRIEU_POINTS = { tham_gia: 20, thang: 50 };
  // ---------- Cửa hàng tông môn (Kho Tông) ----------
  // Hàng CHUNG mọi tông + hàng RIÊNG theo đặc sản từng tông (3–4 món,
  // toàn bộ là ITEMS có sẵn trong logic.js). Giá bằng ĐIỂM CỐNG HIẾN.
  var SHOP_COMMON = [
    { id: 'linh_khi_tan', n: 2, price: 18 },
    { id: 'hoi_xuan_dan', n: 1, price: 20 },
    { id: 'tu_khi_dan', n: 1, price: 60 },
    { id: 'ngung_khi_dan', n: 1, price: 110 }
  ];
  var SHOP_BY_SECT = {
    thanh_phong: [
      { id: 'thanh_tam_thao', n: 3, price: 15 }, { id: 'linh_chi', n: 2, price: 20 },
      { id: 'thanh_linh_tuy', n: 1, price: 45 }
    ],
    huyen_phap: [
      { id: 'tu_linh_qua', n: 2, price: 25 }, { id: 'thanh_linh_tuy', n: 1, price: 45 },
      { id: 'ngu_hanh_linh_chau', n: 1, price: 120 }
    ],
    thien_cong: [
      { id: 'son_tinh', n: 1, price: 80 }, { id: 'tinh_van_thach', n: 1, price: 90 },
      { id: 'dia_tam_ngoc_tuy', n: 1, price: 110 }
    ],
    dan_ha: [
      { id: 'linh_chi', n: 2, price: 20 }, { id: 'huyet_sam', n: 1, price: 35 },
      { id: 'ngoc_tuy_chi', n: 1, price: 40 }, { id: 'son_tinh', n: 1, price: 80 }
    ],
    van_thu: [
      { id: 'thit_son_quan', n: 2, price: 25 }, { id: 'huyet_sam', n: 1, price: 35 },
      { id: 'yeu_dan_1', n: 1, price: 130 }
    ],
    thien_phu: [
      { id: 'thanh_tam_thao', n: 3, price: 15 }, { id: 'linh_chi', n: 2, price: 20 },
      { id: 'tu_linh_qua', n: 2, price: 25 },
      // Phù Huyền của Kho Tông Thiên Phù (hệ phù chú js/talismans.js):
      // điểm cống hiến là đường mua duy nhất của phù Huyền, đúng luật
      // economy (shop LT chỉ bán Phàm/Linh). Chỉ 1 món để giữ trần
      // 3-4 món riêng/tông mà test CH khóa.
      { id: 'loi_phu_huyen', n: 1, price: 90 }
    ],
    cuu_cung: [
      { id: 'thanh_linh_tuy', n: 1, price: 45 }, { id: 'tinh_van_thach', n: 1, price: 90 },
      { id: 'ngu_hanh_linh_chau', n: 1, price: 120 }
    ],
    kim_cang: [
      { id: 'thit_son_quan', n: 2, price: 25 }, { id: 'huyet_sam', n: 1, price: 35 },
      { id: 'son_tinh', n: 1, price: 80 }
    ],
    ngu_doc: [
      { id: 'thanh_tam_thao', n: 3, price: 15 }, { id: 'doc_tam_hoa', n: 2, price: 30 },
      { id: 'huyet_sam', n: 1, price: 35 }
    ],
    huyen_am: [
      { id: 'thanh_tam_thao', n: 3, price: 15 }, { id: 'thanh_linh_tuy', n: 1, price: 45 },
      { id: 'thien_nien_linh_nhu', n: 1, price: 130 }
    ]
  };
  // Danh sách hàng của tông NGƯỜI CHƠI ĐÃ NHẬP: hàng riêng trước, hàng
  // chung sau (trùng id thì giữ bản riêng). Chưa bái sư -> rỗng.
  function shopList(ch, flags) {
    var sid = sectIdOf(flags);
    if (!sid || !ch) return [];
    ensure(ch);
    var seen = {}, out = [];
    function push(list, kind) {
      (list || []).forEach(function (e) {
        if (seen[e.id]) return;
        seen[e.id] = true;
        var def = (L && L.ITEMS) ? L.ITEMS[e.id] : null;
        out.push({ id: e.id, n: e.n, price: e.price, kind: kind, name: def ? def.name : e.id, desc: def ? def.desc : '' });
      });
    }
    push(SHOP_BY_SECT[sid], 'rieng');
    push(SHOP_COMMON, 'chung');
    return out;
  }
  function buy(ch, flags, itemId) {
    if (!ch || !sectIdOf(flags)) return { ok: false, error: 'Chưa bái nhập tông môn — Kho Tông chỉ mở cho đệ tử trong tông.' };
    var entry = null;
    shopList(ch, flags).forEach(function (e) { if (e.id === itemId) entry = e; });
    if (!entry) return { ok: false, error: 'Món này không có trong Kho của tông bạn.' };
    var sp = spendPoints(ch, flags, entry.price, 'kho_tong:' + itemId);
    if (!sp.ok) return { ok: false, error: sp.error };
    if (L) L.addItem(ch, entry.id, entry.n);
    return { ok: true, entry: entry, points: sp.points };
  }
  // ---------- Ngữ cảnh bind cho API gọn (addPoints/points/rank) ----------
  var _ctx = { ch: null, flags: null };
  function bind(ch, flags) { _ctx.ch = ch || null; _ctx.flags = flags || null; return api; }
  function unbind() { _ctx.ch = null; _ctx.flags = null; }
  function addPoints(n, lyDo) {
    if (!_ctx.ch) return { added: 0, reason: 'unbound', rankUps: [] };
    return addPointsTo(_ctx.ch, _ctx.flags, n, lyDo);
  }
  function points() { return _ctx.ch ? pointsOf(_ctx.ch) : 0; }
  function rank() { return _ctx.ch ? rankOf(_ctx.ch) : null; }
  var api = {
    RANKS: RANKS, rankIdxForTotal: rankIdxForTotal,
    ensure: ensure, sectIdOf: sectIdOf,
    pointsOf: pointsOf, totalOf: totalOf, rankOf: rankOf,
    addPointsTo: addPointsTo, spendPoints: spendPoints,
    bind: bind, unbind: unbind, addPoints: addPoints, points: points, rank: rank,
    QUEST_POINTS: QUEST_POINTS, QUEST_DEFAULTS: QUEST_DEFAULTS,
    questPoints: questPoints, onQuestTurnIn: onQuestTurnIn,
    TOURN_POINTS: TOURN_POINTS, onTournamentFinish: onTournamentFinish,
    THU_TRIEU_POINTS: THU_TRIEU_POINTS,
    SHOP_COMMON: SHOP_COMMON, SHOP_BY_SECT: SHOP_BY_SECT,
    shopList: shopList, buy: buy
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SECT = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_SECT = api;
})();
