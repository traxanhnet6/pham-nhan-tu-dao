// ============================================================
// THÚ TRIỀU THỦ HỘ LÀNG — NHIỆM VỤ TÔNG MÔN CẤP CAO (ý tưởng D1 trong
// docs/feature-ideas.md; thiết kế Bui chốt 22:31 ngày 2026-10-29):
// "Thú triều nhiệm vụ tất cả tông môn cử người, từ Trúc Cơ mới có thể
// tham gia". Module ĐỘC LẬP js/beast-tide.js, cùng mẫu với
// secret-realms.js / tournament.js: dữ liệu + luật thuần (test bằng
// Node), game.js chỉ nối NPC/panel/spawn/kill-hook và DIỄN GIẢI phần
// thưởng bằng hệ thật.
//
// THIẾT KẾ ĐÃ CHỐT:
// - Khung truyện: phong ấn giếng cổ chỉ vá tạm (chương 7) nên thú triều
//   quay lại theo đợt, đánh thẳng Nam Môn làng Thanh Khê như chương 5.
//   Khi tới đợt, CẢ 10 TÔNG MÔN cử đệ tử về giữ làng cùng người chơi.
// - Điều kiện: realmRank >= 2 (TRÚC CƠ, qua maps.realmRankOf) — nội
//   dung hậu Trúc Cơ đầu tiên của game. Chưa đạt, Chấp Sự Thủ Triều ở
//   Nam Môn báo rõ chưa đủ cảnh giới (dialogueFor).
// - Lịch PHIÊN giờ thật (đồng hồ địa phương, như bí cảnh/đại hội):
//   2 phiên/ngày — 11:30 và 20:30, mỗi phiên 45 phút. Nhận nhiệm vụ tại
//   Chấp Sự Thủ Triều (map 1, trong cổng Nam Môn) trong phiên; mỗi
//   phiên chỉ thủ thành 1 lượt. Trận đang đánh dở thì đánh hết, không
//   bị cắt khi phiên hết giờ.
// - Diễn biến: 6 ĐỢT thú tràn về Nam Môn theo hàng từ bãi nam. Chỉ số
//   quái CO GIÃN theo cảnh giới người chơi (chụp lúc nhận nhiệm vụ)
//   bằng chính SR.scaleMonsterStats của bí cảnh + hệ số theo đợt.
//   Đợt 6 có YÊU VƯƠNG đầu đàn (Lợn Mông Sắt khổng lồ "Hống Sơn").
// - ĐỒNG MINH: mỗi tông 1 đệ tử (chính là các đệ tử của Đại Hội —
//   tournament.DISCIPLES, người đầu tiên của mỗi tông), có HP riêng,
//   tự đánh quái gần nhất (AI ở game.js); gục thì RÚT khỏi trận, không
//   chết hẳn. Vị trí đứng + di chuyển trên ô đi được do game.js lo.
// - CỔNG LÀNG có HP riêng: thú chạm vòng cổng Nam Môn thì phá cổng
//   (quái thường -8, yêu vương -25) rồi tan vào làng (không tính hạ).
//   Giữ qua hết 6 đợt = THẮNG; cổng về 0 = THUA, vẫn thưởng theo số
//   đợt đã giữ được.
// - Thưởng (thang CHẬT theo nhịp cày cuốc docs/economy.md): mỗi đợt
//   giữ sạch +40 Linh Thạch +5 điểm cống hiến; thắng +160 LT +20 điểm
//   (thắng trọn = 400 LT + 50 điểm); tham gia mà chưa giữ được đợt nào
//   +10 LT khích lệ. Quái thú triều
//   KHÔNG rơi Linh Thạch trực tiếp (mọi LT đi qua thưởng sự kiện).
//   Yêu vương rơi Yêu Đan theo mức co giãn (rollLeaderRewards): Cấp 1
//   chắc chắn, Cấp 2 theo hạng (60/75/90%), Cấp 3 (15/25/35%).
// - ĐIỂM CỐNG HIẾN: thưởng ghi kind 'merit' — game.js phát qua
//   PNT_SECT.addPointsTo(ch, flags, n, 'thu_trieu') của js/sect-points.js
//   (thang khớp mốc team cống hiến đã chốt cho thú triều: thắng trọn
//   6 đợt = 50 điểm). Người chơi CHƯA bái nhập tông môn thì addPointsTo
//   không tích — game.js dồn vào cờ tạm flags.beastTideMerit ("sổ thủ
//   thành") để không mất điểm, vòng tích hợp quy đổi sau.
// - Thống kê lưu save: số lượt thủ thành, số lần thắng, đợt cao nhất
//   giữ được; danh hiệu "Hộ Thôn Tu Sĩ" (2 lần thắng) / "Trấn Sơn
//   Thủ Hộ" (5 lần thắng) hiện trong panel sự kiện.
//
// Trạng thái nằm trong flags.tide của save (L.serialize mang theo
// nguyên vẹn); save cũ không có trường này thì ensure() khởi tạo lười.
// Mọi hàm thời gian nhận `now` (ms), rng tiêm được — test giả lập được.
// Tên chấp sự / yêu vương / danh hiệu là ĐỀ XUẤT, chờ Bui chốt.
// ============================================================
(function (global) {
  'use strict';
  var L = null, SECT = null, M = null, SR = null, TOURN = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECT = require('./sects.js'); } catch (e) { SECT = null; }
    try { M = require('./maps.js'); } catch (e) { M = null; }
    try { SR = require('./secret-realms.js'); } catch (e) { SR = null; }
    try { TOURN = require('./tournament.js'); } catch (e) { TOURN = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    SECT = global.PNT_SECTS || null;
    M = global.PNT_MAPS || null;
    SR = global.PNT_SECRET_REALMS || null;
    TOURN = global.PNT_TOURNAMENT || null;
  }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }

  // ---------- Hằng số khung ----------
  var STEWARD = { id: 'chap_su_thu_trieu', name: 'Vệ Trường Không', title: 'Chấp Sự Thủ Triều', mapId: 'map1', x: 22, y: 13 };
  // Cổng Nam Môn map 1: tường ở hàng 14, miệng cổng x19-20. Thú đi bộ
  // lên miệng cổng (hàng 15) trong dải x17-22 là coi như đã chạm cổng.
  var GATE = { mapId: 'map1', x: 19, y: 14, w: 2, breachY: 15, breachX0: 17, breachX1: 22 };
  var SESSIONS = [11 * 60 + 30, 20 * 60 + 30]; // 11:30 và 20:30, phút từ 00:00 giờ địa phương
  var DUR_MIN = 45;         // mỗi phiên mở nhận nhiệm vụ 45 phút
  var MIN_RANK = 2;         // Trúc Cơ
  var WAVE_COUNT = 6;
  var BREACH_DMG = 8, BREACH_DMG_LEADER = 25;
  // Thưởng theo đợt/ thắng — thang chật (xem đầu file).
  var REWARD = { perWaveLt: 40, perWaveMerit: 5, winLt: 160, winMerit: 20, joinLt: 10 };
  var LEADER_TYPE = 'lon_mong_sat';
  var LEADER_NAME = 'Yêu Vương Hống Sơn';
  var LEADER_SLOT = { x: 19, y: 30 };

  // ---------- 6 đợt thú (tăng dần về số lượng + sức loài) ----------
  var WAVES = [
    ['soi_rung', 'soi_rung', 'soi_rung', 'lon_rung'],
    ['soi_rung', 'soi_rung', 'soi_rung', 'lon_rung', 'lon_rung'],
    ['soi_rung', 'soi_rung', 'lon_mong_sat', 'lon_mong_sat', 'ran_luc', 'ran_luc'],
    ['lon_mong_sat', 'lon_mong_sat', 'lon_mong_sat', 'soi_rung', 'soi_rung', 'ran_luc', 'ran_luc'],
    ['khi_mat_do', 'khi_mat_do', 'lon_mong_sat', 'lon_mong_sat', 'lon_mong_sat', 'ran_luc', 'ran_luc', 'ran_luc'],
    ['khi_mat_do', 'khi_mat_do', 'lon_mong_sat', 'lon_mong_sat', 'ran_luc'] // + yêu vương ở wavePlan
  ];
  // Điểm tràn vào ở bãi nam map 1 (đã kiểm ô đi được trong maps.js).
  var SPAWN_SLOTS = [
    { x: 12, y: 28 }, { x: 16, y: 29 }, { x: 20, y: 28 }, { x: 24, y: 29 }, { x: 28, y: 28 },
    { x: 14, y: 31 }, { x: 26, y: 31 }, { x: 18, y: 32 }, { x: 22, y: 27 }, { x: 30, y: 30 }
  ];
  // Hàng đứng của 10 đệ tử đồng minh: trước cổng, hàng 17, trải x11-29.
  function allyPost(i) { return { x: 11 + i * 2, y: 17 }; }

  // ---------- Trạng thái trong save (flags.tide) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (typeof flags.beastTideMerit !== 'number') flags.beastTideMerit = 0;
    var t = flags.tide;
    if (!t || typeof t !== 'object') {
      t = flags.tide = { playedKey: '', run: null, stats: { runs: 0, wins: 0, bestWave: 0 }, lastResult: null };
    }
    if (typeof t.playedKey !== 'string') t.playedKey = '';
    if (t.run === undefined) t.run = null;
    if (!t.stats || typeof t.stats !== 'object') t.stats = { runs: 0, wins: 0, bestWave: 0 };
    if (typeof t.stats.runs !== 'number') t.stats.runs = 0;
    if (typeof t.stats.wins !== 'number') t.stats.wins = 0;
    if (typeof t.stats.bestWave !== 'number') t.stats.bestWave = 0;
    if (t.lastResult === undefined) t.lastResult = null;
    return t;
  }

  // ---------- Lịch phiên (cùng mẫu tournament/secret-realms) ----------
  function dayKey(now) {
    var d = new Date(now);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function sessionKey(now, idx) { return dayKey(now) + '#' + idx; }
  function sessionAt(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < SESSIONS.length; i++) {
      var start = base + SESSIONS[i] * 60000;
      var end = start + DUR_MIN * 60000;
      if (now >= start && now < end) return { index: i, start: start, end: end, key: sessionKey(now, i) };
    }
    return null;
  }
  function nextSession(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < SESSIONS.length; i++) {
      var start = base + SESSIONS[i] * 60000;
      if (now < start) return { index: i, start: start, dayOffset: 0 };
    }
    return { index: 0, start: base + 86400000 + SESSIONS[0] * 60000, dayOffset: 1 };
  }
  function fmtClock(ms) { var d = new Date(ms); function p(n) { return (n < 10 ? '0' : '') + n; } return p(d.getHours()) + ':' + p(d.getMinutes()); }

  // ---------- Điều kiện tham gia ----------
  function rankOf(ch) {
    if (!ch) return 0;
    if (M && M.realmRankOf) return M.realmRankOf(ch);
    return num(ch.realmRank, 0);
  }
  function realmTextOf(ch) {
    if (!ch) return 'phàm nhân';
    if (ch.realm) return ch.realm;
    return rankOf(ch) >= 1 ? 'Luyện Khí' : 'phàm nhân';
  }
  function eligible(ch) {
    if (rankOf(ch) >= MIN_RANK) return { ok: true };
    return { ok: false, reason: 'low_realm', needText: 'Thú triều là nhiệm vụ tông môn cấp cao — chỉ tu sĩ từ Trúc Cơ trở lên mới được tham gia. Cảnh giới hiện tại: ' + realmTextOf(ch) + '.' };
  }
  function canJoin(flags, ch, now) {
    var t = ensure(flags); if (!t) return { ok: false, reason: 'nosave' };
    if (t.run) return { ok: false, reason: 'inrun' };
    var ses = sessionAt(now);
    if (!ses) return { ok: false, reason: 'closed' };
    if (t.playedKey === ses.key) return { ok: false, reason: 'played' };
    var el = eligible(ch);
    if (!el.ok) return el;
    return { ok: true, session: ses };
  }
  function status(flags, ch, now) {
    var t = ensure(flags); if (!t) return null;
    var ses = sessionAt(now);
    return {
      open: !!ses, session: ses,
      next: ses ? null : nextSession(now),
      playedThis: !!(ses && t.playedKey === ses.key),
      run: t.run, elig: eligible(ch),
      stats: t.stats, merit: flags.beastTideMerit || 0,
      title: titleText(flags)
    };
  }

  // ---------- Đồng minh: 10 tông, mỗi tông 1 đệ tử ----------
  // Ưu tiên chính đội đệ tử của Đại Hội (tournament.DISCIPLES — người
  // đầu tiên xuất hiện của mỗi tông) để hai sự kiện dùng chung người;
  // thiếu module Đại Hội thì dựng từ danh sách tông của sects.js.
  function allyRoster() {
    var out = [], seen = {};
    if (TOURN && TOURN.DISCIPLES) {
      TOURN.DISCIPLES.forEach(function (d) {
        if (seen[d.sect]) return;
        seen[d.sect] = true;
        out.push({ id: d.id, name: d.name, sect: d.sect, sectName: sectNameOf(d.sect), gender: d.gender, origin: d.origin, hpMult: d.hpMult || 1, atkMult: d.atkMult || 1 });
      });
    }
    if (out.length < 10 && SECT && SECT.SECTS) {
      SECT.SECTS.forEach(function (s, i) {
        if (seen[s.id]) return;
        seen[s.id] = true;
        out.push({ id: 'tide_' + s.id, name: 'Đệ tử ' + s.name, sect: s.id, sectName: s.name, gender: i % 2 ? 'nu' : 'nam', origin: 'nong_dan', hpMult: 1, atkMult: 1 });
      });
    }
    return out;
  }
  function sectNameOf(sectId) {
    if (SECT && SECT.sectById) { var s = SECT.sectById(sectId); if (s) return s.name; }
    return sectId;
  }
  // Chỉ số đồng minh theo hạng/tiểu giai của NGƯỜI CHƠI (chụp lúc nhận
  // nhiệm vụ): đủ sức phụ giữ cổng vài đợt nhưng không gánh thay.
  function allyStatsFor(ch) {
    var rank = rankOf(ch), stage = Math.max(0, Math.min(3, num(ch && ch.stage, 0)));
    var baseHp = 240 + 110 * Math.max(0, rank - 2) + 30 * stage;
    var baseAtk = 15 + 7 * Math.max(0, rank - 2) + 2 * stage;
    return allyRoster().map(function (a, i) {
      var hp = Math.max(40, Math.round(baseHp * a.hpMult));
      var post = allyPost(i);
      return {
        id: a.id, name: a.name, sect: a.sect, sectName: a.sectName,
        gender: a.gender, origin: a.origin,
        hp: hp, maxHp: hp, atk: Math.max(3, Math.round(baseAtk * a.atkMult)),
        alive: true, postX: post.x, postY: post.y
      };
    });
  }

  // ---------- Co giãn chỉ số quái theo cảnh giới ----------
  // Dùng chính hàm dùng chung của bí cảnh khi có mặt; thiếu module thì
  // dùng bảng hệ số dự phòng cùng công thức (SCALE_ROWS của bí cảnh).
  var FALLBACK_ROWS = [
    { hp: 0.9, atk: 0.9 }, { hp: 1.1, atk: 1.0 }, { hp: 1.3, atk: 1.1 }, { hp: 1.55, atk: 1.2 },
    { hp: 1.8, atk: 1.35 }, { hp: 2.1, atk: 1.5 }, { hp: 2.45, atk: 1.65 }, { hp: 2.85, atk: 1.85 },
    { hp: 3.3, atk: 2.05 }, { hp: 3.8, atk: 2.3 }
  ];
  function fallbackScale(base, tier, rank) {
    var t = Math.max(0, Math.min(9, tier | 0));
    var row = FALLBACK_ROWS[t];
    var hpM = row.hp, atkM = row.atk;
    if (rank >= 2) { hpM *= 1 + 0.8 * (rank - 1); atkM *= 1 + 0.35 * (rank - 1); }
    return { maxHp: Math.max(1, Math.round(base.hp * hpM)), atk: Math.max(1, Math.round(base.atk * atkM)) };
  }
  function scaleFor(base, power, waveIdx, isLeader) {
    var tier = num(power && power.tier, 0), rank = num(power && power.rank, 0), stage = Math.max(0, Math.min(3, num(power && power.stage, 0)));
    var st = (SR && SR.scaleMonsterStats) ? SR.scaleMonsterStats(base, tier, rank) : fallbackScale(base, tier, rank);
    var w = Math.max(1, waveIdx || 1);
    var hp = st.maxHp * (1 + 0.10 * (w - 1)) * (1 + 0.12 * stage);
    var atk = st.atk * (1 + 0.06 * (w - 1)) * (1 + 0.05 * stage);
    if (isLeader) { hp *= 1.7; atk *= 1.2; }
    return { maxHp: Math.max(10, Math.round(hp)), atk: Math.max(1, Math.round(atk)) };
  }
  function gateMaxFor(rank, stage) {
    return 120 + 30 * Math.max(0, num(rank, 2) - 2) + 10 * Math.max(0, Math.min(3, num(stage, 0)));
  }

  // Kế hoạch spawn 1 đợt: [{type,x,y,hp,atk,leader,name?}] — vị trí lấy
  // vòng quanh SPAWN_SLOTS, lệch theo số đợt để các đợt không trùng hệt.
  function wavePlan(flags, waveIdx) {
    var t = ensure(flags); if (!t || !t.run) return null;
    var w = Math.max(1, Math.min(WAVE_COUNT, waveIdx || t.run.wave || 1));
    var comp = WAVES[w - 1] || [];
    var power = t.run.power;
    var off = (w - 1) * 3;
    var spawns = comp.map(function (type, i) {
      var base = (L && L.MONSTERS) ? L.MONSTERS[type] : null;
      if (!base) return null;
      var slot = SPAWN_SLOTS[(off + i) % SPAWN_SLOTS.length];
      var st = scaleFor(base, power, w, false);
      return { type: type, x: slot.x, y: slot.y, hp: st.maxHp, atk: st.atk, leader: false };
    }).filter(Boolean);
    if (w === WAVE_COUNT) {
      var lb = (L && L.MONSTERS) ? L.MONSTERS[LEADER_TYPE] : null;
      if (lb) {
        var lst = scaleFor(lb, power, w, true);
        spawns.push({ type: LEADER_TYPE, x: LEADER_SLOT.x, y: LEADER_SLOT.y, hp: lst.maxHp, atk: lst.atk, leader: true, name: LEADER_NAME });
      }
    }
    return { wave: w, spawns: spawns, count: spawns.length };
  }

  // ---------- Bắt đầu / diễn biến / kết thúc ----------
  function startRun(flags, ch, now) {
    var chk = canJoin(flags, ch, now);
    if (!chk.ok) return chk;
    var t = ensure(flags);
    var power = { tier: num(ch && ch.tier, 0), rank: rankOf(ch), stage: Math.max(0, Math.min(3, num(ch && ch.stage, 0))) };
    var gMax = gateMaxFor(power.rank, power.stage);
    t.run = {
      sessionKey: chk.session.key, wave: 1, wavesCleared: 0,
      gateHp: gMax, gateMax: gMax,
      kills: 0, allyKills: 0, breaches: 0, leaderDown: false,
      power: power, allies: allyStatsFor(ch)
    };
    t.playedKey = chk.session.key;
    t.stats.runs += 1;
    return { ok: true, run: t.run, plan: wavePlan(flags, 1), session: chk.session };
  }
  function noteKill(flags, opts) {
    var t = ensure(flags); if (!t || !t.run) return null;
    t.run.kills += 1;
    if (opts && opts.leader) t.run.leaderDown = true;
    return { kills: t.run.kills, leaderDown: t.run.leaderDown };
  }
  function noteAllyKill(flags) {
    var t = ensure(flags); if (!t || !t.run) return null;
    t.run.allyKills += 1;
    return { allyKills: t.run.allyKills };
  }
  // Thú chạm cổng: trừ HP cổng; cổng sập thì kết thúc THUA ngay.
  function noteBreach(flags, isLeader) {
    var t = ensure(flags); if (!t || !t.run) return null;
    t.run.breaches += 1;
    t.run.gateHp = Math.max(0, t.run.gateHp - (isLeader ? BREACH_DMG_LEADER : BREACH_DMG));
    if (t.run.gateHp <= 0) {
      var res = finishRun(flags, 'lose');
      return { gateHp: 0, lost: true, result: res };
    }
    return { gateHp: t.run.gateHp, lost: false };
  }
  // Gọi khi toàn bộ quái của đợt hiện tại đã hết (chết hoặc phá cổng —
  // nhưng cổng sập đã tự kết thúc ở noteBreach nên tới đây là giữ được).
  function advanceWave(flags) {
    var t = ensure(flags); if (!t || !t.run) return null;
    t.run.wavesCleared = t.run.wave;
    if (t.run.wave >= WAVE_COUNT) {
      var res = finishRun(flags, 'win');
      return { event: 'won', result: res };
    }
    t.run.wave += 1;
    return { event: 'wave', plan: wavePlan(flags, t.run.wave) };
  }
  function rewardsFor(wavesCleared, outcome) {
    var k = Math.max(0, Math.min(WAVE_COUNT, wavesCleared | 0));
    var out = [];
    var lt = REWARD.perWaveLt * k, merit = REWARD.perWaveMerit * k;
    if (outcome === 'win') { lt += REWARD.winLt; merit += REWARD.winMerit; }
    else if (k === 0) lt += REWARD.joinLt; // ra trận mà chưa giữ được đợt nào: khích lệ nhỏ
    if (lt > 0) out.push({ kind: 'linhThach', n: lt });
    if (merit > 0) out.push({ kind: 'merit', n: merit });
    return out;
  }
  function finishRun(flags, outcome) {
    var t = ensure(flags); if (!t || !t.run) return null;
    var run = t.run;
    var rewards = rewardsFor(run.wavesCleared, outcome);
    if (outcome === 'win') t.stats.wins += 1;
    if (run.wavesCleared > t.stats.bestWave) t.stats.bestWave = run.wavesCleared;
    t.lastResult = {
      outcome: outcome, wavesCleared: run.wavesCleared,
      kills: run.kills, allyKills: run.allyKills, breaches: run.breaches,
      gateHpLeft: run.gateHp, leaderDown: run.leaderDown,
      sessionKey: run.sessionKey, rewards: rewards, rewarded: false
    };
    t.run = null;
    return t.lastResult;
  }
  // Bỏ cuộc / gục giữa trận: tính như thua với số đợt đã giữ được.
  function forfeit(flags) {
    var t = ensure(flags); if (!t || !t.run) return null;
    return finishRun(flags, 'lose');
  }
  // game.js gọi NGAY khi một lượt kết thúc: phát thưởng đúng 1 lần.
  function claimRewards(flags) {
    var t = ensure(flags); if (!t || !t.lastResult) return null;
    if (t.lastResult.rewarded) return null;
    t.lastResult.rewarded = true;
    return t.lastResult.rewards;
  }
  // Thưởng hạ YÊU VƯƠNG đầu đàn (game.js phát ngay khi nó gục, tách
  // khỏi thưởng thủ thành): Yêu Đan co theo hạng cảnh giới người chơi.
  function rollLeaderRewards(ch, rng) {
    var rand = rng || Math.random;
    var rank = rankOf(ch);
    var out = [{ kind: 'linhThach', n: 60 + 20 * Math.max(0, rank - 2) }, { kind: 'item', id: 'yeu_dan_1', n: 1 }];
    var c2 = rank >= 4 ? 0.90 : (rank === 3 ? 0.75 : 0.60);
    var c3 = rank >= 4 ? 0.35 : (rank === 3 ? 0.25 : 0.15);
    if (rand() < c2) out.push({ kind: 'item', id: 'yeu_dan_2', n: 1 });
    if (rand() < c3) out.push({ kind: 'item', id: 'yeu_dan_3', n: 1 });
    return out;
  }
  function titleText(flags) {
    var t = ensure(flags); if (!t) return null;
    if (t.stats.wins >= 5) return 'Trấn Sơn Thủ Hộ';
    if (t.stats.wins >= 2) return 'Hộ Thôn Tu Sĩ';
    return null;
  }

  // ---------- Thoại Chấp Sự Thủ Triều (game.js ưu tiên trước thoại mặc định) ----
  function dialogueFor(npcId, flags, ch, now) {
    if (npcId !== STEWARD.id) return null;
    var t = ensure(flags); if (!t) return null;
    var st = status(flags, ch, now);
    if (t.run) {
      return ['Trận thủ thành đang giữa chừng: đợt ' + t.run.wave + '/' + WAVE_COUNT + ', cổng Nam Môn còn ' + t.run.gateHp + '/' + t.run.gateMax + ' phần bền.',
        'Đệ tử mười tông đang đứng cùng ngươi trước cổng. Đừng để thú lọt qua hàng người — chúng phá cổng là làng nguy.'];
    }
    if (t.lastResult && !t.lastResult.rewarded) {
      var lr = t.lastResult;
      return ['Sổ thủ thành của ta ghi: ngươi ' + (lr.outcome === 'win' ? 'đã GIỮ VỮNG Nam Môn qua trọn ' + WAVE_COUNT + ' đợt thú triều' : 'giữ được ' + lr.wavesCleared + '/' + WAVE_COUNT + ' đợt trước khi cổng sập') + '. Phần thưởng ta trao ngay đây.'];
    }
    var el = eligible(ch);
    if (!el.ok) {
      return ['Ta là Vệ Trường Không, Chấp Sự Thủ Triều — người điểm danh các tông về giữ cổng Nam Môn làng Thanh Khê mỗi đợt thú triều.',
        'Nói thẳng cho ngươi rõ: thú triều là NHIỆM VỤ TÔNG MÔN CẤP CAO, chỉ đệ tử từ TRÚC CƠ trở lên mới được ra trận. Ngươi đang ở ' + realmTextOf(ch) + ' — CHƯA ĐỦ CẢNH GIỚI. Về tu luyện, đột phá Trúc Cơ rồi quay lại, ta giữ một suất đứng cổng cho ngươi.'];
    }
    if (!st.open) {
      var nx = st.next;
      return ['Phong ấn giếng cổ chỉ vá tạm, thú triều rồi sẽ quay lại đánh Nam Môn. Mười tông đã hẹn: tới đợt là cử đệ tử về đây giữ làng cùng nhau.',
        'Đợt tới mở nhận nhiệm vụ ' + (nx.dayOffset ? 'ngày mai ' : '') + 'lúc ' + fmtClock(nx.start) + ' (phiên 45 phút; mỗi ngày 2 phiên: 11:30 và 20:30). Ngươi đã Trúc Cơ — tới phiên thì tới gặp ta.'];
    }
    var lines = ['Đợt thú triều đã tới! Mười tông đều cử đệ tử về giữ Nam Môn — họ đang chờ một tiếng của ngươi là ra đứng cổng.',
      'Luật thủ thành: 6 đợt thú, cổng làng có ' + 'phần bền riêng; thú chạm cổng là phá. Giữ hết 6 đợt thì thắng, cổng sập thì tính theo số đợt đã giữ. Thưởng Linh Thạch và điểm cống hiến tông môn theo thành tích.'];
    if (st.playedThis) lines.push('Phiên này ngươi đã ra trận rồi — sổ của ta ghi rõ. Nghỉ đi, phiên sau quay lại.');
    return lines;
  }

  var api = {
    STEWARD: STEWARD, GATE: GATE,
    SESSIONS: SESSIONS, DUR_MIN: DUR_MIN, MIN_RANK: MIN_RANK,
    WAVE_COUNT: WAVE_COUNT, WAVES: WAVES, SPAWN_SLOTS: SPAWN_SLOTS,
    BREACH_DMG: BREACH_DMG, BREACH_DMG_LEADER: BREACH_DMG_LEADER, REWARD: REWARD,
    LEADER_TYPE: LEADER_TYPE, LEADER_NAME: LEADER_NAME,
    ensure: ensure, dayKey: dayKey, sessionAt: sessionAt, nextSession: nextSession, fmtClock: fmtClock,
    rankOf: rankOf, realmTextOf: realmTextOf, eligible: eligible, canJoin: canJoin, status: status,
    allyRoster: allyRoster, allyStatsFor: allyStatsFor, allyPost: allyPost,
    scaleFor: scaleFor, gateMaxFor: gateMaxFor, wavePlan: wavePlan,
    startRun: startRun, noteKill: noteKill, noteAllyKill: noteAllyKill,
    noteBreach: noteBreach, advanceWave: advanceWave,
    rewardsFor: rewardsFor, finishRun: finishRun, forfeit: forfeit, claimRewards: claimRewards,
    rollLeaderRewards: rollLeaderRewards, titleText: titleText, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_BEAST_TIDE = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
