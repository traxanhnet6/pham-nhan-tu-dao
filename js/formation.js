// ============================================================
// TRẬN KỲ — B4 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: Âu Dương Kỳ dạy "một người yếu, bày đúng trận thắng
// mười người mạnh" trong phép thử Cửu Cung (q_tong_tran: dẫn khí qua
// cửu cung). Qua được phép thử đó, người chơi học cách kết cờ trận
// tại chỗ — không cần bái nhập Cửu Cung mới bày được, nhưng đệ tử
// Cửu Cung bày trận mạnh hơn hẳn (bán kính, hiệu quả, thời gian đều
// tăng). Trận là vật ngoài thân kết bằng Linh Thạch + linh lực của
// chính người bày, nên nó tốn tài nguyên thật để duy trì, không phải
// buff miễn phí vĩnh viễn.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/companion.js / js/affinity.js:
// dữ liệu + luật thuần test bằng Node, game.js chỉ nối panel, tick,
// vẽ vòng trận và các điểm móc sát thương/thổ nạp):
// - Mở khóa: đã trả q_tong_tran (danh sách turnedIn của quest state).
//   Chưa qua phép thử thì panel chỉ hiện điều kiện, không cho cắm.
// - Cắm trận: tốn 30 Linh Thạch một lần kết cờ (khoản CHI, không sinh
//   Linh Thạch — xem docs/economy.md mục 13), cắm đúng ô đang đứng.
//   Tối đa 1 trận đang hoạt động; muốn cắm trận khác thì thu trận cũ
//   trước (thu trận không hoàn Linh Thạch kết cờ — cờ đã kết thì tan).
// - Duy trì: tốn 4 linh lực/giây (ch.ll của js/skills.js, hồi ~5/giây
//   ở trạng thái thường). Linh lực cạn (ll <= 0) thì trận tự tan —
//   bày trận trong lúc đánh nhau dồn dập là phải tính toán, vì chiêu
//   thức cũng ăn chung một bể linh lực. Thời gian trận tính theo thời
//   gian đứng trên đúng map đặt trận (game.js chỉ tick khi cùng map;
//   sang map khác trận "đóng băng", không mất thời gian, không tốn
//   linh lực — cờ đã cắm thì vẫn nằm đó chờ chủ quay lại).
// - Thời gian tối đa: 300 giây (Cửu Cung: 450 giây). Hết giờ trận tan.
// - 3 trận, mỗi trận một việc, bán kính tính theo px từ tâm ô cắm
//   (quy ước tâm thực thể của game: x*TILE+16, y*TILE+28):
//   + Tụ Khí Trận: thổ nạp trong vòng +20% tu vi (Cửu Cung +30%).
//     Chỉ áp cho thổ nạp (đường tu vi thật duy nhất gắn vị trí đứng
//     của người chơi); hạ quái trong game này không cho tu vi nên
//     trận này không nhân tu vi hạ quái — không bịa nguồn tu vi mới.
//   + Hộ Thể Trận: người chơi và bạn đi cùng đứng trong vòng nhận
//     ít hơn 20% sát thương từ đòn đánh trả thường của quái
//     (Cửu Cung 30%). Chỉ đòn đánh trả thường — sát thương từ kỹ
//     năng đặc biệt của boss, độc, lôi kiếp chạy đường riêng, không
//     qua đây.
//   + Khốn Thú Trận: quái trong vòng bị chậm di chuyển (dùng slowT
//     sẵn có của engine: tốc độ x0,5) và đòn đánh trả của chúng yếu
//     đi 15% (Cửu Cung 25%).
// - Cửu Cung Trận Tông (flags.sectJoined === 'cuu_cung'): bán kính
//   96 -> 144 px, thời gian 300 -> 450 giây, hiệu quả theo bảng trên.
// - Trạng thái nằm trong flags.formation của save (L.serialize mang
//   theo nguyên vẹn); save cũ không có trường này thì ensure() khởi
//   tạo lười (null = chưa cắm trận nào). Trận không tạo nguồn Linh
//   Thạch mới nên docs/economy.md chỉ ghi thêm khoản chi, không sửa
//   thang thu nhập.
// - Giới hạn nói thẳng: linh thú chưa hưởng Hộ Thể/Khốn Thú vì đường
//   sát thương của linh thú chạy riêng trong tickPets, không qua điểm
//   móc đòn đánh trả thường; bạn đi cùng thì đã nối (đòn trả lên bạn
//   đi cùng chạy qua companionAttackMonster trong game.js).
// ============================================================
(function (global) {
  'use strict';
  var SECT = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { SECT = require('./sects.js'); } catch (e) { SECT = null; }
  } else if (global) {
    SECT = global.PNT_SECTS || null;
  }

  var TILE = 32;
  var PLACE_COST = 30;
  var UPKEEP_LL_PER_SEC = 4;
  var BASE_RADIUS_PX = 96;
  var BASE_DURATION_SEC = 300;

  // Bảng trận: pct thường / pct khi là đệ tử Cửu Cung.
  var FORMATIONS = [
    { id: 'tu_khi', name: 'Tụ Khí Trận', color: '#7fd4ff',
      desc: 'Tụ linh khí quanh chỗ đứng: thổ nạp trong vòng được thêm tu vi.',
      tuviPct: 20, tuviPctCC: 30, dmgTakenPct: 0, dmgTakenPctCC: 0,
      monsterDmgPct: 0, monsterDmgPctCC: 0, slow: false },
    { id: 'ho_the', name: 'Hộ Thể Trận', color: '#ffd94a',
      desc: 'Trận hộ thể: người trong vòng nhận ít sát thương từ đòn đánh trả thường của quái.',
      tuviPct: 0, tuviPctCC: 0, dmgTakenPct: 20, dmgTakenPctCC: 30,
      monsterDmgPct: 0, monsterDmgPctCC: 0, slow: false },
    { id: 'khon_thu', name: 'Khốn Thú Trận', color: '#b6ff5e',
      desc: 'Trận khốn thú: quái trong vòng chậm đi một nửa và đòn đánh trả yếu đi.',
      tuviPct: 0, tuviPctCC: 0, dmgTakenPct: 0, dmgTakenPctCC: 0,
      monsterDmgPct: 15, monsterDmgPctCC: 25, slow: true }
  ];

  function byId(id) {
    for (var i = 0; i < FORMATIONS.length; i++) {
      if (FORMATIONS[i].id === id) return FORMATIONS[i];
    }
    return null;
  }
  function isCuuCung(flags) {
    return !!(flags && flags.sectJoined === 'cuu_cung');
  }
  function sectNameOf(flags) {
    if (SECT && SECT.sectById) {
      var s = SECT.sectById(flags && flags.sectJoined);
      if (s) return s.name;
    }
    return flags && flags.sectJoined ? flags.sectJoined : '';
  }
  // Đã học bày trận = đã trả phép thử Cửu Cung (q_tong_tran).
  function learned(turnedIn) {
    return Array.isArray(turnedIn) && turnedIn.indexOf('q_tong_tran') >= 0;
  }
  function radiusPx(flags) {
    return isCuuCung(flags) ? Math.round(BASE_RADIUS_PX * 1.5) : BASE_RADIUS_PX;
  }
  function durationSec(flags) {
    return isCuuCung(flags) ? Math.round(BASE_DURATION_SEC * 1.5) : BASE_DURATION_SEC;
  }
  // Hiệu quả đã tính theo tông của người bày.
  function effectOf(id, flags) {
    var f = byId(id);
    if (!f) return null;
    var cc = isCuuCung(flags);
    return {
      id: f.id, name: f.name, color: f.color, desc: f.desc,
      tuviPct: cc ? f.tuviPctCC : f.tuviPct,
      dmgTakenPct: cc ? f.dmgTakenPctCC : f.dmgTakenPct,
      monsterDmgPct: cc ? f.monsterDmgPctCC : f.monsterDmgPct,
      slow: f.slow, radiusPx: radiusPx(flags), durationSec: durationSec(flags)
    };
  }
  function ensure(flags) {
    if (!flags) return null;
    if (!('formation' in flags)) flags.formation = null;
    return flags.formation;
  }
  function active(flags) {
    if (!flags) return null;
    return flags.formation || null;
  }
  function remainingSec(flags) {
    var f = active(flags);
    if (!f) return 0;
    return Math.max(0, durationSec(flags) - (f.elapsed || 0));
  }
  function centerOf(f) {
    return { x: f.x * TILE + 16, y: f.y * TILE + 28 };
  }
  // Điểm (px) có nằm trong vòng trận trên đúng map không.
  function inZone(flags, mapId, px, py) {
    var f = active(flags);
    if (!f || f.map !== mapId) return false;
    if ((f.elapsed || 0) >= durationSec(flags)) return false;
    var c = centerOf(f);
    var dx = px - c.x, dy = py - c.y;
    return Math.sqrt(dx * dx + dy * dy) <= radiusPx(flags);
  }
  function place(flags, ch, turnedIn, typeId, mapId, tileX, tileY) {
    if (!byId(typeId)) return { ok: false, reason: 'unknown' };
    if (!learned(turnedIn)) return { ok: false, reason: 'not_learned' };
    if (active(flags)) return { ok: false, reason: 'already_active' };
    if (!ch || typeof ch.linhThach !== 'number' || ch.linhThach < PLACE_COST) {
      return { ok: false, reason: 'poor' };
    }
    ch.linhThach -= PLACE_COST;
    flags.formation = { type: typeId, map: mapId, x: tileX, y: tileY, elapsed: 0 };
    return { ok: true, formation: flags.formation };
  }
  function dissolve(flags) {
    var f = active(flags);
    if (!f) return null;
    flags.formation = null;
    return f;
  }
  // Tick 1 khung hình trên đúng map: trừ linh lực duy trì, cộng thời
  // gian trận. Trả về { ll, dissolved } — dissolved là null hoặc
  // 'expired' (hết giờ) / 'll_empty' (cạn linh lực).
  function tick(flags, dt, ll) {
    var f = active(flags);
    if (!f) return { ll: ll, dissolved: null };
    var nl = ll - UPKEEP_LL_PER_SEC * dt;
    f.elapsed = (f.elapsed || 0) + dt;
    if (nl <= 0) {
      dissolve(flags);
      return { ll: 0, dissolved: 'll_empty' };
    }
    if (f.elapsed >= durationSec(flags)) {
      dissolve(flags);
      return { ll: nl, dissolved: 'expired' };
    }
    return { ll: nl, dissolved: null };
  }
  // Hệ số sát thương người nhận còn lại (1 = không giảm) tại 1 điểm.
  // kind: 'player' dùng dmgTakenPct của Hộ Thể; 'monster' dùng
  // monsterDmgPct của Khốn Thú (áp cho đòn quái đánh ra khi quái đứng
  // trong vòng — game.js truyền vị trí quái cho kind này).
  function dmgTakenMult(flags, mapId, px, py, kind) {
    var f = active(flags);
    if (!f || f.map !== mapId) return 1;
    var eff = effectOf(f.type, flags);
    if (!eff) return 1;
    if (!inZone(flags, mapId, px, py)) return 1;
    if (kind === 'monster') {
      return eff.monsterDmgPct > 0 ? (1 - eff.monsterDmgPct / 100) : 1;
    }
    return eff.dmgTakenPct > 0 ? (1 - eff.dmgTakenPct / 100) : 1;
  }
  // Hệ số tu vi thổ nạp tại 1 điểm (1 = không tăng).
  function tuviMult(flags, mapId, px, py) {
    var f = active(flags);
    if (!f || f.map !== mapId) return 1;
    var eff = effectOf(f.type, flags);
    if (!eff || eff.tuviPct <= 0) return 1;
    if (!inZone(flags, mapId, px, py)) return 1;
    return 1 + eff.tuviPct / 100;
  }
  // Quái có bị Khốn Thú làm chậm tại vị trí của nó không.
  function monsterSlowed(flags, mapId, mx, my) {
    var f = active(flags);
    if (!f || f.map !== mapId || f.type !== 'khon_thu') return false;
    return inZone(flags, mapId, mx, my);
  }
  function describe(flags, turnedIn) {
    var list = FORMATIONS.map(function (f) {
      var e = effectOf(f.id, flags);
      return { id: f.id, name: f.name, color: f.color, desc: f.desc,
        tuviPct: e.tuviPct, dmgTakenPct: e.dmgTakenPct,
        monsterDmgPct: e.monsterDmgPct, slow: e.slow,
        radiusPx: e.radiusPx, durationSec: e.durationSec };
    });
    return {
      learned: learned(turnedIn), active: active(flags),
      remainingSec: remainingSec(flags), placeCost: PLACE_COST,
      upkeepLlPerSec: UPKEEP_LL_PER_SEC, isCuuCung: isCuuCung(flags),
      sectName: sectNameOf(flags), list: list
    };
  }

  var api = {
    FORMATIONS: FORMATIONS, PLACE_COST: PLACE_COST,
    UPKEEP_LL_PER_SEC: UPKEEP_LL_PER_SEC,
    BASE_RADIUS_PX: BASE_RADIUS_PX, BASE_DURATION_SEC: BASE_DURATION_SEC,
    byId: byId, isCuuCung: isCuuCung, learned: learned,
    radiusPx: radiusPx, durationSec: durationSec, effectOf: effectOf,
    ensure: ensure, active: active, remainingSec: remainingSec,
    centerOf: centerOf, inZone: inZone, place: place,
    dissolve: dissolve, tick: tick, dmgTakenMult: dmgTakenMult,
    tuviMult: tuviMult, monsterSlowed: monsterSlowed, describe: describe
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_FORMATION = api;
})(typeof window !== 'undefined' ? window : global);
