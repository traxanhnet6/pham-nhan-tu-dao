// ============================================================
// BẢNG XẾP HẠNG TU SĨ THEO MÙA — mục 5 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: sau Sơn Môn Đại Hội, quảng trường Chân Núi Thanh Phong
// không chỉ có võ đài và sàn đấu giá — mười tông cần một thước đo
// chung, dài hơi hơn một kỳ đại hội: ai cống hiến đều nhất cho việc
// chung suốt một mùa. Thư lại Thẩm Ký giữ bảng đá ở quảng trường
// map 3, ghi điểm của mọi tu sĩ theo mùa dương lịch rồi trao thưởng
// khi mùa khép lại. Bảng này KHÔNG thay bảng vinh danh Đại Hội
// (quán quân từng kỳ, js/tournament.js) và KHÔNG thay bia truyền kỳ
// (mục 15 hàng chờ, ghi dấu mốc cả đời): bảng mùa chỉ đo MỘT mùa.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/auction.js / js/companion.js:
// dữ liệu + luật thuần test bằng Node, game.js chỉ nối NPC/panel,
// ghi điểm ở đúng 3 hook kết quả và DIỄN GIẢI thưởng bằng Linh Thạch):
// - Mùa = QUÝ dương lịch (giờ địa phương, như Đại Hội/đấu giá):
//   Q1 Xuân (tháng 1–3), Q2 Hạ (4–6), Q3 Thu (7–9), Q4 Đông (10–12).
//   seasonKey = 'YYYY-Qn'. Hết quý, điểm mùa cũ tự chuyển vào lịch
//   sử (history) khi ensure() chạy lần đầu ở quý mới — người chơi
//   nghỉ cả quý vẫn nhận thưởng mùa cũ được, không mất vì vắng mặt.
// - Điểm mùa = ĐIỂM THÀNH TÍCH, không phải Linh Thạch: Đại Hội theo
//   hạng (quán quân 100, á quân 60, hạng ba 40, hạng tư 25, tứ kết
//   15, tham gia 5); Thú Triều theo đợt giữ được (10/đợt + 30 nếu
//   giữ trọn 6 đợt, tối đa 90/lượt); Bí Cảnh 20/lượt hoàn thành
//   (định kỳ, luân phiên hay kỳ ngộ — đều qua completeRealmRun).
//   Mỗi kết quả ghi đúng 1 lần nhờ khóa chống trùng (seen): Đại Hội
//   theo sessionKey của kỳ, Thú Triều theo sessionKey của phiên,
//   Bí Cảnh theo (loại + cảnh + giờ kết thúc lượt).
// - Đối thủ: 10 đệ tử Đại Hội (1/tông — cùng những người đã đấu với
//   người chơi ở võ đài, nên bảng mùa là "đấu lại" với đúng họ).
//   Điểm cuối mùa của mỗi đối thủ là số ĐỊNH SẴN theo mùa + tên
//   (băm FNV của seasonKey + id, không lăn ngẫu nhiên — cùng một mùa
//   thì cùng một bảng, người chơi học được "phong độ" từng tông).
//   Dải điểm đối thủ 600–2400: một mùa chăm đấu (vài chục lượt Đại
//   Hội/Thú Triều/Bí Cảnh) mới lên được hạng cao; người chỉ chơi
//   vài lượt vẫn có điểm nhưng xếp cuối — đúng tinh thần "cày đều".
//   Trong mùa, bảng trực tiếp hiện điểm đối thủ theo TIẾN ĐỘ quý
//   (25% + 75% × số ngày đã qua của quý) để đầu mùa không tuyệt vọng
//   và cuối mùa khớp đúng điểm cuối mùa; hạng cuối mùa dùng điểm
//   cuối mùa, không dùng điểm tiến độ.
// - Thưởng CUỐI MÙA, nhận đúng 1 lần/mùa đã kết thúc, chỉ từ Linh
//   Thạch (không vật phẩm, không danh hiệu — tránh chồng chéo với
//   thưởng Đại Hội/Thú Triều/Bí Cảnh vốn đã có đồ riêng): hạng 1:
//   400, hạng 2: 250, hạng 3: 150, hạng 4–10: 80, hạng 11 (có điểm
//   nhưng dưới mọi đối thủ): 30. Đối chiếu docs/economy.md mục 6:
//   thưởng theo quý (không phải theo lượt) nên 400 vẫn dưới 1 giờ
//   farm giữa chặng (430 LT/giờ) và dưới nửa giờ farm cuối chặng
//   (1100–1700 LT/giờ); 30 đúng mức "tham gia" của Đại Hội. Mùa
//   0 điểm thì không có thưởng — bảng mùa thưởng thành tích, không
//   thưởng vì chỉ mở game.
// - Trạng thái nằm trong flags.seasonBoard của save (serialize mang
//   theo nguyên vẹn); save cũ không có trường này thì ensure() khởi
//   tạo lười. Bảng mùa KHÔNG tạo nguồn Linh Thạch mới ngoài thưởng
//   cuối mùa đã nêu — điểm thành tích không đổi được thành tiền
//   giữa mùa, không cộng dồn sang mùa sau.
// ============================================================
(function (global) {
  'use strict';
  var TOURN = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { TOURN = require('./tournament.js'); } catch (e) { TOURN = null; }
  } else if (global) {
    TOURN = global.PNT_TOURNAMENT || null;
  }

  var KEEPER = { id: 'ghi_bang_su', name: 'Thẩm Ký', title: 'Thư Lại Giữ Bảng Xếp Hạng Tu Sĩ', mapId: 'map3', x: 45, y: 22, sprite: 'hoc_tro' } // V10: + offset map (12,8);
  var SEASON_NAMES = ['Xuân', 'Hạ', 'Thu', 'Đông'];
  var TOURN_POINTS = { quan_quan: 100, a_quan: 60, hang_ba: 40, hang_tu: 25, tu_ket: 15, tham_gia: 5 };
  var TIDE_PER_WAVE = 10, TIDE_WIN_BONUS = 30, REALM_POINTS = 20;
  var REWARDS = { 1: 400, 2: 250, 3: 150 };
  var FALLBACK_RIVALS = [
    { id: 'dc_tp_kiem', name: 'Chu Kiếm Sinh', sect: 'thanh_phong' },
    { id: 'dc_hp_huyen', name: 'Bạch Tử Huyền', sect: 'huyen_phap' },
    { id: 'dc_tc_nguu', name: 'Đồng Thiết Ngưu', sect: 'thien_cong' },
    { id: 'dc_dh_chi', name: 'Diệp Linh Chi', sect: 'dan_ha' },
    { id: 'dc_vt_lang', name: 'Sơn Tiểu Lang', sect: 'van_thu' },
    { id: 'dc_tphu_sa', name: 'Chu Sa Nhi', sect: 'thien_phu' },
    { id: 'dc_cc_tran', name: 'Tư Mã Trận', sect: 'cuu_cung' },
    { id: 'dc_kc_luc', name: 'Thạch Đại Lực', sect: 'kim_cang' },
    { id: 'dc_nd_xa', name: 'Xà Thanh', sect: 'ngu_doc' },
    { id: 'dc_ha_cam', name: 'Tố Cầm', sect: 'huyen_am' }
  ];

  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function hash32(str) {
    var h = 2166136261, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seasonKeyOf(now) {
    var d = new Date(now);
    return d.getFullYear() + '-Q' + (Math.floor(d.getMonth() / 3) + 1);
  }
  function seasonInfoOf(key) {
    var m = /^(\d{4})-Q([1-4])$/.exec(key || '');
    if (!m) return null;
    var year = +m[1], q = +m[2];
    return { key: key, year: year, quarter: q, name: SEASON_NAMES[q - 1],
      months: (q - 1) * 3 + 1 + '–' + q * 3,
      label: 'Mùa ' + SEASON_NAMES[q - 1] + ' ' + year + ' (tháng ' + ((q - 1) * 3 + 1) + '–' + q * 3 + ')' };
  }
  function seasonNameOf(key) { var s = seasonInfoOf(key); return s ? s.label : key; }
  function quarterBounds(key) {
    var s = seasonInfoOf(key); if (!s) return null;
    var start = new Date(s.year, (s.quarter - 1) * 3, 1).getTime();
    var end = new Date(s.year, s.quarter * 3, 1).getTime();
    return { start: start, end: end, days: Math.round((end - start) / 86400000) };
  }
  function progressOf(key, now) {
    var b = quarterBounds(key); if (!b) return 1;
    if (now <= b.start) return 0;
    if (now >= b.end) return 1;
    return (now - b.start) / (b.end - b.start);
  }

  // ---------- Đối thủ: 10 đệ tử, 1/tông ----------
  function rivals() {
    if (TOURN && TOURN.DISCIPLES) {
      var want = ['dc_tp_kiem', 'dc_hp_huyen', 'dc_tc_nguu', 'dc_dh_chi', 'dc_vt_lang',
        'dc_tphu_sa', 'dc_cc_tran', 'dc_kc_luc', 'dc_nd_xa', 'dc_ha_cam'];
      var out = [];
      want.forEach(function (id) {
        var d = TOURN.discipleById(id);
        if (d) out.push({ id: d.id, name: d.name, sect: d.sect });
      });
      if (out.length === 10) return out;
    }
    return FALLBACK_RIVALS.slice();
  }
  function rivalFinalScore(seasonKey, rivalId) {
    var r = (hash32(seasonKey + '|' + rivalId) % 1000) / 1000;
    return 600 + Math.floor(r * 1801); // 600–2400
  }
  function rivalLiveScore(seasonKey, rivalId, now) {
    var fin = rivalFinalScore(seasonKey, rivalId);
    var p = progressOf(seasonKey, now);
    return Math.round(fin * (0.25 + 0.75 * p));
  }

  // ---------- Trạng thái trong save (flags.seasonBoard) ----------
  function freshSeason(key) {
    return { key: key, total: 0, tourn: 0, tide: 0, realm: 0,
      counts: { tourn: 0, tide: 0, realm: 0 } };
  }
  function ensure(flags, now) {
    if (!flags || typeof flags !== 'object') return null;
    var sb = flags.seasonBoard;
    if (!sb || typeof sb !== 'object') {
      sb = flags.seasonBoard = { season: null, current: null, history: {}, seen: [], claimed: {} };
    }
    if (!sb.history || typeof sb.history !== 'object') sb.history = {};
    if (!Array.isArray(sb.seen)) sb.seen = [];
    if (!sb.claimed || typeof sb.claimed !== 'object') sb.claimed = {};
    var key = seasonKeyOf(now == null ? Date.now() : now);
    if (!sb.current || typeof sb.current !== 'object') {
      sb.current = freshSeason(key); sb.season = key;
    } else if (sb.current.key !== key) {
      // Sang quý mới: mùa cũ vào lịch sử (điểm đóng băng), mùa mới bắt đầu 0.
      sb.history[sb.current.key] = { key: sb.current.key, total: sb.current.total,
        tourn: sb.current.tourn, tide: sb.current.tide, realm: sb.current.realm,
        counts: sb.current.counts };
      sb.current = freshSeason(key); sb.season = key;
      sb.seen = []; // khóa chống trùng chỉ có nghĩa trong một mùa
    }
    return sb;
  }

  function note(flags, now, source, points, dedupKey) {
    var sb = ensure(flags, now); if (!sb) return { ok: false, reason: 'nosave' };
    if (dedupKey && sb.seen.indexOf(dedupKey) >= 0) return { ok: false, reason: 'dup' };
    if (dedupKey) sb.seen.push(dedupKey);
    sb.current[source] = num(sb.current[source], 0) + points;
    sb.current.total = num(sb.current.total, 0) + points;
    sb.current.counts[source] = num(sb.current.counts[source], 0) + 1;
    return { ok: true, added: points, total: sb.current.total };
  }
  function noteTournament(flags, placement, sessionKey, now) {
    var pts = TOURN_POINTS[placement];
    if (pts == null) return { ok: false, reason: 'badplacement' };
    return note(flags, now, 'tourn', pts, sessionKey ? 'tourn|' + sessionKey : null);
  }
  function noteTide(flags, wavesCleared, outcome, sessionKey, now) {
    var k = Math.max(0, Math.min(6, wavesCleared | 0));
    var pts = k * TIDE_PER_WAVE + (outcome === 'win' ? TIDE_WIN_BONUS : 0);
    return note(flags, now, 'tide', pts, sessionKey ? 'tide|' + sessionKey : null);
  }
  function noteRealm(flags, run, now) {
    if (!run || typeof run !== 'object') return { ok: false, reason: 'norun' };
    var key = 'realm|' + (run.realmId || run.templateId || run.sessionKey || run.kind || '') + '|' + (run.endAt || 0);
    return note(flags, now, 'realm', REALM_POINTS, key);
  }

  // ---------- Bảng + hạng + thưởng ----------
  function boardFor(seasonKey, playerTotal, now, live) {
    var rows = rivals().map(function (r) {
      return { id: r.id, name: r.name, sect: r.sect, isPlayer: false,
        score: live ? rivalLiveScore(seasonKey, r.id, now) : rivalFinalScore(seasonKey, r.id) };
    });
    rows.push({ id: 'player', name: 'Bạn', sect: null, isPlayer: true, score: playerTotal });
    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isPlayer) return -1; if (b.isPlayer) return 1;
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });
    rows.forEach(function (r, i) { r.rank = i + 1; });
    return rows;
  }
  function liveBoard(flags, now) {
    var sb = ensure(flags, now); if (!sb) return null;
    var rows = boardFor(sb.current.key, sb.current.total, now, true);
    var me = rows.filter(function (r) { return r.isPlayer; })[0];
    return { seasonKey: sb.current.key, seasonLabel: seasonNameOf(sb.current.key),
      current: sb.current, rows: rows, playerRank: me.rank, playerScore: me.score };
  }
  function finalRank(seasonKey, playerTotal) {
    var rows = boardFor(seasonKey, playerTotal, 0, false);
    var me = rows.filter(function (r) { return r.isPlayer; })[0];
    return { rows: rows, rank: me.rank };
  }
  function rewardForRank(rank, playerTotal) {
    if (!playerTotal || playerTotal <= 0) return 0;
    if (REWARDS[rank]) return REWARDS[rank];
    if (rank >= 4 && rank <= 10) return 80;
    return 30; // hạng 11: có điểm nhưng dưới mọi đối thủ — vẫn có phần tham gia
  }
  function unclaimedFinished(flags, now) {
    var sb = ensure(flags, now); if (!sb) return [];
    var cur = seasonKeyOf(now == null ? Date.now() : now);
    return Object.keys(sb.history).filter(function (k) {
      return k !== cur && !sb.claimed[k] && sb.history[k].total > 0;
    }).sort();
  }
  function claimable(flags, now) {
    var list = unclaimedFinished(flags, now);
    if (!list.length) return null;
    var sb = ensure(flags, now);
    var key = list[list.length - 1]; // mùa chưa nhận gần nhất
    var hist = sb.history[key];
    var fr = finalRank(key, hist.total);
    return { seasonKey: key, seasonLabel: seasonNameOf(key), total: hist.total,
      rank: fr.rank, reward: rewardForRank(fr.rank, hist.total), rows: fr.rows };
  }
  function claim(flags, seasonKey, ch, now) {
    var sb = ensure(flags, now); if (!sb) return { ok: false, reason: 'nosave' };
    var hist = sb.history[seasonKey];
    if (!hist) return { ok: false, reason: 'noseason' };
    if (sb.claimed[seasonKey]) return { ok: false, reason: 'claimed' };
    if (seasonKey === seasonKeyOf(now == null ? Date.now() : now)) return { ok: false, reason: 'current' };
    var fr = finalRank(seasonKey, hist.total);
    var reward = rewardForRank(fr.rank, hist.total);
    if (reward <= 0) return { ok: false, reason: 'nopoints' };
    var AC = (typeof globalThis !== 'undefined') ? globalThis.PNT_ANTICHEAT : null; // chống hack: trần thưởng mùa
    if (AC && typeof AC.guardGain === 'function') reward = AC.guardGain('season', reward);
    sb.claimed[seasonKey] = { rank: fr.rank, reward: reward, total: hist.total };
    if (ch && typeof ch === 'object') ch.linhThach = num(ch.linhThach, 0) + reward;
    return { ok: true, seasonKey: seasonKey, seasonLabel: seasonNameOf(seasonKey),
      rank: fr.rank, reward: reward, total: hist.total };
  }
  function dialogueFor(npcId, flags, ch, now) {
    if (npcId !== KEEPER.id) return null;
    var sb = ensure(flags, now); if (!sb) return null;
    var live = liveBoard(flags, now);
    var lines = ['Ta là Thẩm Ký, thư lại giữ Bảng Xếp Hạng Tu Sĩ ở quảng trường này. Bảng ghi điểm cả mùa: Đại Hội theo hạng, Thú Triều theo đợt giữ được, Bí Cảnh theo lượt hoàn thành — mười tông cùng nhìn một bảng, không ai sửa được.',
      'Mùa này (' + live.seasonLabel + '): ngươi đang hạng ' + live.playerRank + '/11 với ' + live.playerScore + ' điểm (Đại Hội ' + live.current.tourn + ' · Thú Triều ' + live.current.tide + ' · Bí Cảnh ' + live.current.realm + '). Dẫn đầu hiện tại là ' + live.rows[0].name + ' với ' + live.rows[0].score + ' điểm.'];
    var cl = claimable(flags, now);
    if (cl) lines.push('Mùa ' + cl.seasonLabel + ' đã khép: ngươi hạng ' + cl.rank + ' với ' + cl.total + ' điểm, thưởng ' + cl.reward + ' Linh Thạch đang chờ. Bấm "Nhận thưởng mùa đã kết thúc" trong bảng là ta trao ngay.');
    else lines.push('Hết mùa, bảng đóng lại rồi ta mới trao thưởng — trong mùa thì điểm chỉ để xếp hạng, không đổi thành Linh Thạch được. Cứ đấu, giữ cổng, phá bí cảnh đều tay là hạng tự lên.');
    return lines;
  }

  var api = {
    KEEPER: KEEPER, SEASON_NAMES: SEASON_NAMES, TOURN_POINTS: TOURN_POINTS,
    TIDE_PER_WAVE: TIDE_PER_WAVE, TIDE_WIN_BONUS: TIDE_WIN_BONUS, REALM_POINTS: REALM_POINTS,
    seasonKeyOf: seasonKeyOf, seasonInfoOf: seasonInfoOf, seasonNameOf: seasonNameOf,
    quarterBounds: quarterBounds, progressOf: progressOf,
    rivals: rivals, rivalFinalScore: rivalFinalScore, rivalLiveScore: rivalLiveScore,
    ensure: ensure, noteTournament: noteTournament, noteTide: noteTide, noteRealm: noteRealm,
    boardFor: boardFor, liveBoard: liveBoard, finalRank: finalRank,
    rewardForRank: rewardForRank, unclaimedFinished: unclaimedFinished,
    claimable: claimable, claim: claim, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_SEASON_BOARD = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
