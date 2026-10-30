// ============================================================
// HỘ TỐNG THƯƠNG ĐỘI — NHIỆM VỤ ĐỘNG CỦA MÃ VẠN LAI (mục 1 trong
// docs/auto-build-queue.md, lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: sau q_phu_mo_duong (xe kẹt ở đường mòn rừng vì sói),
// đường buôn đã thông — Mã Vạn Lai tin người chơi đủ để giao một
// chuyến hàng thật: từ xe ở Rừng Thanh Sơn, qua làng Thanh Khê, tới
// Trạm Buôn Chân Núi ở Chân Núi Thanh Phong. Tuyến buôn này là nguồn
// muối/thuốc/vải của cả vùng thời mạt pháp, nên mỗi chuyến đi được
// là một việc có ích thật, không phải việc giết quái lấy tiền suông.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/beast-tide.js: dữ liệu +
// luật thuần test bằng Node, game.js chỉ nối NPC/panel/spawn/tick):
// - Điều kiện nhận: ĐÃ TRẢ q_phu_mo_duong (đường đã thông, Mã mới
//   giao hàng) + đang đứng ở map2 cạnh Mã + không có lượt nào đang
//   chạy. Chưa trả nhiệm vụ mở đường thì Mã nói rõ: dẹp sói mở
//   đường trước đã.
// - Đoàn xe: 1 xe hàng (sprite 'cart' có sẵn trong sprites.js, vẽ
//   lại bằng chính lưới đó — không vẽ hình mới, không emoji).
//   Xe CHỈ lăn khi người chơi ở cùng map và trong vòng 7 ô — bỏ xe
//   lại thì xe đứng chờ, không tự chạy mất, không tự bị đánh khi
//   người chơi ở map khác (quái phục kích chỉ sống ở map của xe).
//   Tốc độ xe 2,2 ô/giây, chậm hơn người chơi: người chơi dẫn đường,
//   không phải xe đuổi theo người chơi.
// - Tuyến 3 chặng, waypoint đã kiểm BFS trên lưới thật của maps.js
//   (mọi đoạn nối nhau qua ô đi được; xem test HT ở test-smoke.js):
//   chặng 0 map2: (17,14)->(18,11)->(19,8)->(19,4)->(19,1) rồi qua
//     Cổng Rừng sang map1; chặng 1 map1: (19,28)->(19,24)->(19,20)->
//     (19,16)->(19,13)->(19,10)->(19,4)->(19,0) rồi qua Cổng Bắc
//     sang map3; chặng 2 map3: (19,28)->(19,23)->(19,20) Trạm Buôn.
//   Tới waypoint cuối mỗi chặng (trừ chặng cuối) xe "qua cổng" sang
//   điểm rơi của chặng sau — giống hệt cách người chơi qua cổng.
// - Phục kích: mỗi chặng đúng 1 đợt, kích hoạt khi xe tới waypoint
//   phục kích (chặng 0: (19,8) sói rừng; chặng 1: (19,20) sói con +
//   lợn rừng; chặng 2: (19,23) khỉ mặt đỏ + sói rừng). Xe DỪNG khi
//   còn quái phục kích sống. Số quái = 3 + floor(tầng/3), tối đa 5
//   — co theo tầng người chơi lúc nhận nhiệm vụ; chỉ số quái co
//   bằng SR.scaleMonsterStats chung của bí cảnh (game.js áp).
//   Quái phục kích kéo thẳng về xe (nhánh m.escort trong vòng lặp
//   quái của game.js, như nhánh m.tide kéo về cổng). Quái chạm xe
//   (Chebyshev <= 1 ô) thì CẮN XE: -12 bền rồi tan (không tính là
//   hạ, không rơi Linh Thạch — như thú phá cổng thú triều).
// - Xe: bền 100, chịu tối đa 8 lần cắn (8×12 = 96, còn 4). Bền về
//   0 = chuyến thất bại, không có tiền công, xe quay về (lượt sau
//   nhận lại được). Người chơi có thể bỏ giữa chừng qua panel/hội
//   thoại (forfeit, cũng 0 tiền công).
// - Thưởng (đối chiếu docs/economy.md mục 6, quy tắc 5: nhiệm vụ
//   lẻ không vượt EV ~30 phút farm chặng tương ứng; quái phục kích
//   KHÔNG rơi Linh Thạch trực tiếp, mọi LT qua tiền công):
//   tiền công đủ = 90 + 10×tầng (tầng 0–9 => 90–180 LT/lượt).
//   Giao đủ hàng nhưng xe sứt mẻ thì trả theo độ nguyên vẹn:
//   thưởng = round(đủ × (0,5 + 0,5 × bền%)) — xe còn 100% thì đủ,
//   xe còn một nửa thì 75%, xe gần nát thì suýt soát một nửa.
//   Đối chiếu: đầu chặng farm ~200–280 LT/giờ => 90 LT ≈ 20–27 phút;
//   giữa chặng ~430 LT/giờ => 130 LT ≈ 18 phút; cuối chặng
//   1100+ LT/giờ => 180 LT ≈ 10 phút. Không phá thang.
// - Thống kê lưu save: số lượt, số lần giao thành công, số lần
//   thất bại/bỏ, độ nguyên vẹn cao nhất khi giao thành công.
//   Trạng thái nằm trong flags.escort (L.serialize mang theo
//   nguyên vẹn); save cũ không có trường này thì ensure() khởi
//   tạo lười. Mọi hàm nhận rng tiêm được ở chỗ cần lăn.
// ============================================================
(function (global) {
  'use strict';
  var L = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
  }

  var GIVER_ID = 'thuong_nhan_ma';
  var CART_MAX = 100;
  var TOUCH_DMG = 12;
  var CART_SPEED = 2.2;      // ô/giây
  var FOLLOW_DIST = 7;       // ô (Euclid), xa hơn thì xe đứng chờ
  var TOUCH_DIST = 1;        // Chebyshev: quái kề xe là cắn

  // Waypoint cuối mỗi chặng là ô cổng (chặng 0: hàng 1 rồi qua cổng
  // y0; chặng 1: hàng 0) hoặc điểm đích (chặng 2: Trạm Buôn).
  var LEGS = [
    { mapId: 'map2', name: 'Rừng Thanh Sơn', destName: 'Cổng Rừng',
      waypoints: [[29, 22], [30, 19], [31, 16], [31, 12], [31, 9]],
      ambushAt: 2, ambushTypes: ['soi_rung'],
      ambushSpawns: [[28, 13], [34, 13], [28, 19], [34, 19], [31, 12]] },
    { mapId: 'map1', name: 'Làng Thanh Khê', destName: 'Cổng Bắc',
      waypoints: [[31, 36], [31, 32], [31, 28], [31, 24], [31, 21], [31, 18], [31, 12], [31, 8]],
      ambushAt: 2, ambushTypes: ['soi_con', 'lon_rung'],
      ambushSpawns: [[28, 25], [34, 25], [28, 31], [34, 31], [31, 32]] },
    { mapId: 'map3', name: 'Chân Núi Thanh Phong', destName: 'Trạm Buôn Chân Núi',
      waypoints: [[31, 36], [31, 31], [31, 28]],
      ambushAt: 1, ambushTypes: ['khi_mat_do', 'soi_rung'],
      ambushSpawns: [[27, 27], [35, 27], [28, 34], [34, 34], [31, 35]] }
  ];

  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function tierOf(ch) {
    if (!ch) return 0;
    var t = ch.tier | 0;
    return t < 0 ? 0 : (t > 9 ? 9 : t);
  }
  function rankOf(ch) {
    if (!ch) return 0;
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    var r = String(ch.realm || '');
    if (r.indexOf('Độ Kiếp') === 0) return 6;
    if (r.indexOf('Hóa Thần') === 0) return 5;
    if (r.indexOf('Nguyên Anh') === 0) return 4;
    if (r.indexOf('Kim Đan') === 0) return 3;
    if (r.indexOf('Trúc Cơ') === 0) return 2;
    if (r.indexOf('Luyện Khí') === 0) return 1;
    return 0;
  }

  // ---------- Trạng thái trong save (flags.escort) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    var e = flags.escort;
    if (!e || typeof e !== 'object') {
      e = flags.escort = { run: null, stats: { runs: 0, wins: 0, fails: 0, bestIntegrity: 0 }, lastResult: null };
    }
    if (e.run === undefined) e.run = null;
    if (!e.stats || typeof e.stats !== 'object') e.stats = { runs: 0, wins: 0, fails: 0, bestIntegrity: 0 };
    if (typeof e.stats.runs !== 'number') e.stats.runs = 0;
    if (typeof e.stats.wins !== 'number') e.stats.wins = 0;
    if (typeof e.stats.fails !== 'number') e.stats.fails = 0;
    if (typeof e.stats.bestIntegrity !== 'number') e.stats.bestIntegrity = 0;
    if (e.run) {
      // Vá save giữa chừng: run cũ thiếu trường thì bù mặc định,
      // không bao giờ làm mất lượt đang chạy của người chơi.
      if (typeof e.run.leg !== 'number') e.run.leg = 0;
      if (typeof e.run.wp !== 'number') e.run.wp = 0;
      if (typeof e.run.x !== 'number') e.run.x = LEGS[0].waypoints[0][0];
      if (typeof e.run.y !== 'number') e.run.y = LEGS[0].waypoints[0][1];
      if (typeof e.run.cartHp !== 'number') e.run.cartHp = CART_MAX;
      if (typeof e.run.cartMax !== 'number') e.run.cartMax = CART_MAX;
      if (typeof e.run.tier !== 'number') e.run.tier = 0;
      if (typeof e.run.rank !== 'number') e.run.rank = 0;
      if (e.run.ambush === undefined) e.run.ambush = null;
      if (!e.run.ambushDone) e.run.ambushDone = [false, false, false];
      if (typeof e.run.kills !== 'number') e.run.kills = 0;
      if (typeof e.run.touches !== 'number') e.run.touches = 0;
      e.run.mapId = LEGS[Math.min(2, Math.max(0, e.run.leg))].mapId;
    }
    return e;
  }

  function roadCleared(qs) {
    if (!qs) return false;
    if (L && typeof L.isTurnedIn === 'function') return L.isTurnedIn(qs, 'q_phu_mo_duong');
    return !!(qs.turnedIn && qs.turnedIn.indexOf('q_phu_mo_duong') >= 0);
  }

  // ---------- Điều kiện + bắt đầu ----------
  function canStart(flags, qs, ch, curMapId) {
    var e = ensure(flags);
    if (!e) return { ok: false, reason: 'nosave' };
    if (e.run) return { ok: false, reason: 'inrun' };
    if (!roadCleared(qs)) return { ok: false, reason: 'need_road',
      needText: 'Đường buôn chưa thông — dẹp 3 con sói rừng quanh khúc đường mòn (nhiệm vụ "Mở lại đường buôn") rồi ta mới giao chuyến hàng này cho ngươi.' };
    if (flags.tide && flags.tide.run) return { ok: false, reason: 'busy',
      needText: 'Ngươi đang giữa một lượt thủ thành — xong trận đó rồi hãy nhận hộ tống, xe hàng không chờ được hai việc cùng lúc.' };
    if (curMapId && curMapId !== LEGS[0].mapId) return { ok: false, reason: 'wrong_map',
      needText: 'Chuyến hàng xuất phát ở Rừng Thanh Sơn — tới gặp ta cạnh xe hàng ở đường mòn rừng đã.' };
    return { ok: true };
  }

  function startRun(flags, qs, ch) {
    var chk = canStart(flags, qs, ch, null);
    // canStart với curMapId null bỏ qua kiểm tra map (game.js đã kiểm
    // người chơi đang đứng cạnh Mã); các lý do khác vẫn giữ.
    if (!chk.ok) return chk;
    var e = ensure(flags);
    var s = LEGS[0].waypoints[0];
    e.run = { mapId: LEGS[0].mapId, leg: 0, wp: 0, x: s[0], y: s[1],
      cartHp: CART_MAX, cartMax: CART_MAX, tier: tierOf(ch), rank: rankOf(ch),
      ambush: null, ambushDone: [false, false, false], kills: 0, touches: 0 };
    e.stats.runs++;
    return { ok: true, run: e.run };
  }

  // ---------- Phục kích ----------
  function ambushCount(tier) {
    var t = tierOf({ tier: tier });
    var n = 3 + Math.floor(t / 3);
    return n > 5 ? 5 : n;
  }
  function ambushPlan(flags) {
    var e = ensure(flags);
    if (!e || !e.run) return null;
    var leg = LEGS[e.run.leg];
    var n = ambushCount(e.run.tier);
    var spawns = [];
    for (var i = 0; i < n; i++) {
      var s = leg.ambushSpawns[i % leg.ambushSpawns.length];
      spawns.push({ type: leg.ambushTypes[i % leg.ambushTypes.length], x: s[0], y: s[1] });
    }
    return { leg: e.run.leg, mapId: leg.mapId, count: n, spawns: spawns };
  }
  function triggerAmbush(flags) {
    var e = ensure(flags);
    if (!e || !e.run || e.run.ambush) return null;
    var plan = ambushPlan(flags);
    if (!plan) return null;
    e.run.ambush = { leg: e.run.leg, total: plan.count, killed: 0, remaining: plan.count };
    return plan;
  }
  // Quái phục kích bị hạ trong combat: trả {cleared} khi sạch đợt.
  function noteAmbushKill(flags) {
    var e = ensure(flags);
    if (!e || !e.run || !e.run.ambush) return null;
    e.run.kills++;
    e.run.ambush.killed++;
    e.run.ambush.remaining = Math.max(0, e.run.ambush.total - e.run.ambush.killed);
    if (e.run.ambush.remaining === 0) {
      e.run.ambushDone[e.run.leg] = true;
      e.run.ambush = null;
      return { cleared: true, leg: e.run.leg };
    }
    return { cleared: false, remaining: e.run.ambush.remaining };
  }
  // Quái chạm xe: trừ bền, trả {lost} khi xe nát.
  function noteTouch(flags) {
    var e = ensure(flags);
    if (!e || !e.run) return null;
    e.run.touches++;
    e.run.cartHp = Math.max(0, e.run.cartHp - TOUCH_DMG);
    if (e.run.cartHp <= 0) return { lost: true, cartHp: 0 };
    return { lost: false, cartHp: e.run.cartHp };
  }

  // ---------- Tiến chặng ----------
  function currentLeg(run) { return LEGS[run.leg]; }
  function currentWaypoint(run) {
    var leg = LEGS[run.leg];
    return leg.waypoints[Math.min(run.wp, leg.waypoints.length - 1)];
  }
  function isAmbushWaypoint(run) {
    var leg = LEGS[run.leg];
    return run.wp === leg.ambushAt && !run.ambushDone[run.leg];
  }
  // Xe tới waypoint cuối chặng: sang chặng sau (điểm rơi chặng sau)
  // hoặc tới đích (chặng cuối). Game.js gọi sau khi xe đã tới ô đích.
  function advanceLeg(flags) {
    var e = ensure(flags);
    if (!e || !e.run) return null;
    var run = e.run;
    if (run.leg >= LEGS.length - 1) return { event: 'done', run: run };
    run.leg++;
    run.wp = 0;
    var s = LEGS[run.leg].waypoints[0];
    run.x = s[0]; run.y = s[1];
    run.mapId = LEGS[run.leg].mapId;
    run.ambush = null;
    return { event: 'leg', leg: run.leg, mapId: run.mapId };
  }

  // ---------- Thưởng + kết thúc ----------
  function fullReward(tier) { return 90 + 10 * tierOf({ tier: tier }); }
  function rewardFor(tier, cartHp, cartMax) {
    var full = fullReward(tier);
    var frac = cartMax > 0 ? Math.max(0, Math.min(1, cartHp / cartMax)) : 0;
    return Math.round(full * (0.5 + 0.5 * frac));
  }
  function finishRun(flags, outcome) {
    var e = ensure(flags);
    if (!e || !e.run) return null;
    var run = e.run;
    var integrity = run.cartMax > 0 ? Math.round(100 * run.cartHp / run.cartMax) : 0;
    var reward = outcome === 'win' ? rewardFor(run.tier, run.cartHp, run.cartMax) : 0;
    var res = { outcome: outcome, legsDone: run.leg + (outcome === 'win' ? 1 : 0),
      cartHp: run.cartHp, cartMax: run.cartMax, integrity: integrity,
      reward: reward, kills: run.kills, touches: run.touches };
    if (outcome === 'win') {
      e.stats.wins++;
      if (integrity > e.stats.bestIntegrity) e.stats.bestIntegrity = integrity;
    } else {
      e.stats.fails++;
    }
    e.lastResult = res;
    e.run = null;
    return res;
  }
  function forfeit(flags) { return finishRun(flags, 'forfeit'); }

  function status(flags, ch) {
    var e = ensure(flags);
    if (!e) return null;
    var run = e.run;
    var st = { run: run, stats: e.stats, lastResult: e.lastResult };
    if (run) {
      var leg = LEGS[run.leg];
      st.legName = leg.name;
      st.destName = leg.destName;
      st.integrity = Math.round(100 * run.cartHp / run.cartMax);
      st.rewardIfWinNow = rewardFor(run.tier, run.cartHp, run.cartMax);
    }
    return st;
  }

  function dialogueFor(npcId, flags, qs, ch) {
    if (npcId !== GIVER_ID) return null;
    var e = ensure(flags);
    if (!e) return null;
    if (e.run) {
      var leg = LEGS[e.run.leg];
      return ['Đoàn xe đang ở ' + leg.name + ', chặng ' + (e.run.leg + 1) + '/3, xe còn ' + e.run.cartHp + '/' + e.run.cartMax + ' phần bền' + (e.run.ambush ? ' — ĐANG BỊ PHỤC KÍCH, dẹp sạch quái rồi xe mới lăn tiếp được!' : ' — đi cùng xe, đừng để nó lọt khỏi tầm mắt quá 7 ô, không nó đứng chờ đấy.')];
    }
    if (e.lastResult && e.lastResult.outcome === 'win') {
      return ['Chuyến hàng đã tới Trạm Buôn Chân Núi an toàn — sổ của ta ghi tiền công ' + e.lastResult.reward + ' Linh Thạch, xe còn ' + e.lastResult.integrity + '% bền. Có chuyến sau, ta lại gọi ngươi.'];
    }
    var chk = canStart(flags, qs, ch, null);
    if (!chk.ok && chk.reason === 'need_road') {
      return ['Cháu là tu sĩ của làng, ta nói thẳng: muốn nhận hộ tống thì dẹp giúp ta 3 con sói rừng quanh khúc đường mòn trước đã — xe kẹt ở đó thì lấy gì mà hộ tống?',
        'Đường thông rồi, thương đội mới có hàng mà chạy. Xong việc "Mở lại đường buôn" thì quay lại đây gặp ta.'];
    }
    if (!chk.ok && chk.reason === 'busy') {
      return ['Ngươi đang bận thủ thành ở Nam Môn — xong trận đó rồi hãy nhận hộ tống, một người không gánh hai chuyến cùng lúc được.'];
    }
    return ['Ta có một chuyến hàng cần người hộ tống: từ xe ở rừng này, qua làng Thanh Khê, giao lên Trạm Buôn Chân Núi ở chân núi phía bắc.',
      'Đường này sói rừng, lợn rừng, khỉ mặt đỏ rình rập — mỗi chặng chúng phục kích một đợt, xe dừng lại là ngươi phải dẹp sạch mới đi tiếp được. Xe nát là mất trắng tiền công.',
      'Tiền công tính theo tầng của ngươi và độ nguyên vẹn của xe khi giao hàng: xe càng lành, công càng đủ. Nhận thì đi cùng xe — bỏ xe quá 7 ô là xe đứng chờ, không tự chạy đâu.'];
  }

  var api = {
    GIVER_ID: GIVER_ID, CART_MAX: CART_MAX, TOUCH_DMG: TOUCH_DMG,
    CART_SPEED: CART_SPEED, FOLLOW_DIST: FOLLOW_DIST, TOUCH_DIST: TOUCH_DIST,
    LEGS: LEGS,
    ensure: ensure, tierOf: tierOf, rankOf: rankOf, roadCleared: roadCleared,
    canStart: canStart, startRun: startRun,
    ambushCount: ambushCount, ambushPlan: ambushPlan, triggerAmbush: triggerAmbush,
    noteAmbushKill: noteAmbushKill, noteTouch: noteTouch,
    currentLeg: currentLeg, currentWaypoint: currentWaypoint,
    isAmbushWaypoint: isAmbushWaypoint, advanceLeg: advanceLeg,
    fullReward: fullReward, rewardFor: rewardFor,
    finishRun: finishRun, forfeit: forfeit, status: status, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_ESCORT = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
