// ============================================================
// THIÊN CƠ ĐỒ GIÁM — B6 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: Lục Tiểu Lục — kẻ nhiều chuyện nhất làng Thanh Khê,
// chuyên ghi chép tin tức dọc đường buôn — giữ một cuốn sổ tay gọi
// là Thiên Cơ Đồ Giám. Sổ KHÔNG phải vật phẩm mua được: nó tự ghi
// lại những gì người chơi đã thật sự gặp trên đường tu — quái đã
// hạ, boss đã thắng, linh thú đã thu phục, đan đã luyện, bí cảnh
// đã vào, vũ khí/pháp bảo đã từng sở hữu, NPC đã trò chuyện. Sổ
// không tạo ra quái/vật phẩm mới, không nhân Linh Thạch rơi, không
// nhân tu vi: nó chỉ ĐẾM lại hành trình đã qua.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/season-board.js /
// js/formation.js: dữ liệu + luật thuần test bằng Node, game.js
// chỉ nối 5 hook ghi nhận + panel + nút nhận thưởng):
// - Trang quái: hạ 1 con thì mở trang (biết tên + mô tả); hạ đủ
//   10 con cùng loài thì mở trang CHI TIẾT (hiện HP/công thật của
//   loài — số này vốn đã nằm trong bảng rơi/quái, sổ chỉ hiện ra
//   chứ không tiết lộ gì chưa từng đối đầu).
// - Trang boss: thắng 1 lần thì mở trang (kể cả boss cốt truyện
//   Sơn Quân — tính theo lần hạ, không theo lần trả nhiệm vụ).
// - Trang linh thú: thu phục hoặc ấp nở 1 lần thì mở trang; thú
//   đã bán/thả vẫn giữ trang (sổ ghi "đã từng sở hữu", không xóa
//   theo túi hiện tại — đúng nghĩa sổ tay hành trình).
// - Trang đan / bí cảnh / vũ khí / pháp bảo / NPC: tương tự —
//   luyện 1 lần, vào 1 lần, sở hữu 1 lần, trò chuyện 1 lần.
// - Điểm Đồ Giám (không phải Linh Thạch, không đổi được giữa
//   chừng): quái 1 điểm/trang + 1 điểm khi mở chi tiết; boss 3;
//   linh thú 2; đan 1; bí cảnh 2 khi vào + 1 khi hoàn thành lượt;
//   vũ khí 1; pháp bảo 2; NPC 1. Tổng tối đa theo dữ liệu thật
//   hiện tại: 9 quái ×2 + 21 boss ×3 + 51 thú ×2 + 17 đan + 15
//   bí cảnh ×3 + 30 vũ khí + 21 pháp bảo ×2 + 27 NPC = 344 điểm
//   (21 pháp bảo = 16 gốc trong js/artifacts.js + 5 pháp bảo lễ
//   hội do js/wardrobe.js đăng ký thêm vào cùng danh mục).
// - Mốc thưởng (nhận đúng 1 lần/mốc, chỉ khi đủ điểm, qua nút
//   trong panel — không tự cộng khi vừa đủ, để người chơi tự
//   quyết lúc nào "nộp sổ" cho Lục Tiểu Lục): 25→20 LT,
//   50→30, 75→40, 100→60 + 3 Linh Chi, 150→80, 200→100 +
//   1 Yêu Đan Cấp 1, 250→120, 300→150. Tổng cả đời 600 LT +
//   2 món vật phẩm farm được (Linh Chi, Yêu Đan Cấp 1 — đều là
//   đồ rơi thường, không phải đồ ký danh) + 1 danh hiệu/mốc
//   (chỉ hiển thị trong sổ, không cộng chỉ số). Đối chiếu
//   docs/economy.md mục 11: mỗi mốc ≤ 150 LT (< trần NV lẻ
//   300 và < 30 phút farm của chặng mở mốc muộn nhất); tổng
//   600 LT trải suốt hành trình phàm nhân → Trúc Cơ+ là tiền
//   dẫn đường của hệ sưu tầm, không thành nguồn farm.
// - Tương thích save cũ: ensure() khởi tạo lười flags.bestiary;
//   khớp lại từ trạng thái sẵn có (thú đang sở hữu, vũ khí/pháp
//   bảo trong túi, mốc chết boss thế giới) mỗi lần mở panel, nên
//   người chơi cũ không mất trang đã từng đạt trước khi có sổ.
//   Riêng quái đã hạ trước đây, đan đã luyện trước đây và NPC
//   đã gặp trước đây KHÔNG có số liệu lưu sẵn trong save nên
//   chỉ tính từ khi sổ ra đời — sổ ghi rõ điều này trong panel,
//   không bịa số cũ.
// - Chống hack: thưởng mốc đi qua guardGain('codex', ...) với
//   trần 200 trong js/anticheat.js (mốc lớn nhất 150 < 200);
//   điểm Đồ Giám nằm trong save đã ký nên sửa tay sẽ bị
//   validateSave phát hiện như mọi trường flags khác.
// ============================================================
(function (global) {
  'use strict';

  var KEEPER = { id: 'tieu_thuong', name: 'Lục Tiểu Lục', title: 'Tiểu thương sạp chợ — người giữ sổ', mapId: 'map1', x: 36, y: 19 }; // V10: (24,11) + offset map (12,8)
  var DETAIL_KILLS = 10;

  // Điểm theo từng loại trang (xem đầu file).
  var PTS = { monster: 1, monsterDetail: 1, boss: 3, pet: 2, pill: 1,
    realmEnter: 2, realmComplete: 1, weapon: 1, artifact: 2, npc: 1 };

  // Mốc thưởng: điểm → { Linh Thạch, danh hiệu, vật phẩm kèm (nếu có) }.
  // Vật phẩm kèm đều là đồ farm được thường (không ký danh, không
  // phải đồ nhiệm vụ): Linh Chi là dược liệu, Yêu Đan Cấp 1 là đồ
  // rơi boss — mỗi thứ đúng 1 lần trong cả đời nhân vật.
  var MILESTONES = [
    { pts: 25, lt: 20, title: 'Người Ghi Chép', item: null },
    { pts: 50, lt: 30, title: 'Học Giả Thanh Khê', item: null },
    { pts: 75, lt: 40, title: 'Kẻ Săn Tin Đại Sơn', item: null },
    { pts: 100, lt: 60, title: 'Thiên Cơ Học Đồ', item: { id: 'linh_chi', n: 3 } },
    { pts: 150, lt: 80, title: 'Sử Gia Thanh Sơn', item: null },
    { pts: 200, lt: 100, title: 'Thiên Cơ Đại Sư', item: { id: 'yeu_dan_1', n: 1 } },
    { pts: 250, lt: 120, title: 'Thiên Cơ Tông Sư', item: null },
    { pts: 300, lt: 150, title: 'Thiên Cơ Thánh Thủ', item: null }
  ];

  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function keysOf(o) { return (o && typeof o === 'object') ? Object.keys(o) : []; }

  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (!flags.bestiary || typeof flags.bestiary !== 'object') {
      flags.bestiary = { kills: {}, bosses: {}, pets: {}, pills: {},
        realms: {}, weapons: {}, artifacts: {}, npcs: {},
        claimed: [], titles: [] };
    }
    var b = flags.bestiary;
    ['kills', 'bosses', 'pets', 'pills', 'realms', 'weapons', 'artifacts', 'npcs'].forEach(function (k) {
      if (!b[k] || typeof b[k] !== 'object') b[k] = {};
    });
    if (!Array.isArray(b.claimed)) b.claimed = [];
    if (!Array.isArray(b.titles)) b.titles = [];
    return b;
  }

  // ---------- Ghi nhận (game.js gọi ở đúng 1 funnel mỗi loại) ----------
  // noteKill: quái thường. opts.worldBoss: boss thế giới — chỉ ghi
  // trang boss, KHÔNG cộng vào số hạ loài thường (thực thể boss
  // không phải con quái thường cùng loài). opts.bossId: boss cốt
  // truyện (Sơn Quân) — vừa cộng số hạ loài, vừa mở trang boss.
  function noteKill(flags, type, opts) {
    var b = ensure(flags); if (!b || !type) return b;
    opts = opts || {};
    if (opts.worldBoss) {
      if (opts.bossId) b.bosses[opts.bossId] = true;
      return b;
    }
    b.kills[type] = num(b.kills[type], 0) + 1;
    if (opts.bossId) b.bosses[opts.bossId] = true;
    return b;
  }
  function noteBoss(flags, bossId) {
    var b = ensure(flags); if (!b || !bossId) return b;
    b.bosses[bossId] = true; return b;
  }
  function notePet(flags, sp) { var b = ensure(flags); if (b && sp) b.pets[sp] = true; return b; }
  function notePill(flags, pillId) { var b = ensure(flags); if (b && pillId) b.pills[pillId] = true; return b; }
  function noteRealmEnter(flags, realmId) {
    var b = ensure(flags); if (!b || !realmId) return b;
    if (!b.realms[realmId] || typeof b.realms[realmId] !== 'object') b.realms[realmId] = {};
    b.realms[realmId].entered = true; return b;
  }
  function noteRealmComplete(flags, realmId) {
    var b = noteRealmEnter(flags, realmId); if (!b) return b;
    b.realms[realmId].completed = true; return b;
  }
  function noteWeapon(flags, id) { var b = ensure(flags); if (b && id) b.weapons[id] = true; return b; }
  function noteArtifact(flags, id) { var b = ensure(flags); if (b && id) b.artifacts[id] = true; return b; }
  function noteNpc(flags, npcId) { var b = ensure(flags); if (b && npcId) b.npcs[npcId] = true; return b; }

  // Khớp lại từ trạng thái sẵn có (save cũ + đường mua/chế không qua
  // hook rơi đồ): thú đang sở hữu, vũ khí/pháp bảo trong túi, mốc
  // chết boss thế giới. Trả về số trang mới mở được nhờ khớp lại.
  function syncFromCharacter(flags, ch, apis) {
    var b = ensure(flags); if (!b) return 0;
    var added = 0;
    function mark(set, id) { if (id && !set[id]) { set[id] = true; added++; } }
    apis = apis || {};
    (apis.petSpecies || []).forEach(function (sp) { mark(b.pets, sp); });
    (apis.weaponIds || []).forEach(function (id) { mark(b.weapons, id); });
    (apis.artifactIds || []).forEach(function (id) { mark(b.artifacts, id); });
    keysOf(apis.bossKills).forEach(function (id) { mark(b.bosses, id); });
    // Thú đang sở hữu đọc trực tiếp từ nhân vật nếu caller không
    // truyền danh sách (game.js luôn truyền, nhánh này chỉ để test
    // và save cũ tự chữa khi panel mở mà không có apis).
    if (ch && ch.pets && Array.isArray(ch.pets.owned)) {
      ch.pets.owned.forEach(function (p) { if (p && p.sp) mark(b.pets, p.sp); });
    }
    return added;
  }

  // ---------- Điểm + mốc ----------
  function points(flags) {
    var b = ensure(flags); if (!b) return 0;
    var total = 0, id;
    for (id in b.kills) {
      total += PTS.monster;
      if (num(b.kills[id], 0) >= DETAIL_KILLS) total += PTS.monsterDetail;
    }
    total += keysOf(b.bosses).length * PTS.boss;
    total += keysOf(b.pets).length * PTS.pet;
    total += keysOf(b.pills).length * PTS.pill;
    keysOf(b.realms).forEach(function (r) {
      var e = b.realms[r];
      if (e && e.entered) total += PTS.realmEnter;
      if (e && e.completed) total += PTS.realmComplete;
    });
    total += keysOf(b.weapons).length * PTS.weapon;
    total += keysOf(b.artifacts).length * PTS.artifact;
    total += keysOf(b.npcs).length * PTS.npc;
    return total;
  }

  // Tổng điểm tối đa theo số lượng catalog thật (game.js truyền số
  // đếm từ L.MONSTERS / BOS.BOSSES / PETS.SPECIES / ALCH.PILLS /
  // SR.POOL / W.WEAPONS / ART.ARTIFACTS / ST.NPCS). Dùng để khóa
  // mốc 300 luôn với tới được và để test đối chiếu với dữ liệu thật.
  function maxPoints(counts) {
    counts = counts || {};
    return (num(counts.monsters, 0) * (PTS.monster + PTS.monsterDetail)) +
      (num(counts.bosses, 0) * PTS.boss) +
      (num(counts.pets, 0) * PTS.pet) +
      (num(counts.pills, 0) * PTS.pill) +
      (num(counts.realms, 0) * (PTS.realmEnter + PTS.realmComplete)) +
      (num(counts.weapons, 0) * PTS.weapon) +
      (num(counts.artifacts, 0) * PTS.artifact) +
      (num(counts.npcs, 0) * PTS.npc);
  }

  function milestoneByPts(pts) {
    for (var i = 0; i < MILESTONES.length; i++) if (MILESTONES[i].pts === pts) return MILESTONES[i];
    return null;
  }
  function claimable(flags) {
    var b = ensure(flags); if (!b) return [];
    var p = points(flags);
    return MILESTONES.filter(function (m) {
      return p >= m.pts && b.claimed.indexOf(m.pts) < 0;
    });
  }
  function nextMilestone(flags) {
    var b = ensure(flags); if (!b) return null;
    var p = points(flags);
    for (var i = 0; i < MILESTONES.length; i++) {
      if (b.claimed.indexOf(MILESTONES[i].pts) < 0) {
        return { milestone: MILESTONES[i], points: p, need: MILESTONES[i].pts - p };
      }
    }
    return null;
  }
  // Nhận thưởng mốc: đúng 1 lần/mốc, chỉ khi đủ điểm. Cộng Linh
  // Thạch vào nhân vật (qua trần chống hack 'codex' 200 — mốc lớn
  // nhất 150 nên không bao giờ bị kẹp với người chơi thật), ghi
  // danh hiệu vào sổ. Vật phẩm kèm (nếu có) do game.js trao qua
  // L.addItem sau khi claim trả về — module thuần không đụng túi.
  function claim(flags, pts, ch) {
    var b = ensure(flags); if (!b) return { ok: false, reason: 'nosave' };
    var m = milestoneByPts(pts);
    if (!m) return { ok: false, reason: 'nomilestone' };
    if (b.claimed.indexOf(pts) >= 0) return { ok: false, reason: 'claimed' };
    if (points(flags) < pts) return { ok: false, reason: 'notenough' };
    var AC = (typeof globalThis !== 'undefined') ? globalThis.PNT_ANTICHEAT : null;
    var lt = m.lt;
    if (AC && typeof AC.guardGain === 'function') lt = AC.guardGain('codex', lt);
    b.claimed.push(pts);
    b.claimed.sort(function (a, c) { return a - c; });
    if (b.titles.indexOf(m.title) < 0) b.titles.push(m.title);
    if (ch && typeof ch === 'object') ch.linhThach = num(ch.linhThach, 0) + lt;
    return { ok: true, pts: pts, lt: lt, title: m.title, item: m.item };
  }

  // Tóm tắt theo từng loại trang để panel vẽ (totals do game.js
  // truyền từ catalog thật; thiếu totals thì chỉ trả số đã mở).
  function summary(flags, totals) {
    var b = ensure(flags); if (!b) return null;
    totals = totals || {};
    var detail = 0, id;
    for (id in b.kills) if (num(b.kills[id], 0) >= DETAIL_KILLS) detail++;
    var realmsEntered = 0, realmsDone = 0;
    keysOf(b.realms).forEach(function (r) {
      if (b.realms[r].entered) realmsEntered++;
      if (b.realms[r].completed) realmsDone++;
    });
    return {
      points: points(flags),
      monsters: { seen: keysOf(b.kills).length, detail: detail, total: num(totals.monsters, 0) },
      bosses: { won: keysOf(b.bosses).length, total: num(totals.bosses, 0) },
      pets: { owned: keysOf(b.pets).length, total: num(totals.pets, 0) },
      pills: { brewed: keysOf(b.pills).length, total: num(totals.pills, 0) },
      realms: { entered: realmsEntered, completed: realmsDone, total: num(totals.realms, 0) },
      weapons: { owned: keysOf(b.weapons).length, total: num(totals.weapons, 0) },
      artifacts: { owned: keysOf(b.artifacts).length, total: num(totals.artifacts, 0) },
      npcs: { met: keysOf(b.npcs).length, total: num(totals.npcs, 0) },
      claimed: b.claimed.slice(), titles: b.titles.slice()
    };
  }

  var api = { KEEPER: KEEPER, DETAIL_KILLS: DETAIL_KILLS, PTS: PTS,
    MILESTONES: MILESTONES, ensure: ensure, noteKill: noteKill,
    noteBoss: noteBoss, notePet: notePet, notePill: notePill,
    noteRealmEnter: noteRealmEnter, noteRealmComplete: noteRealmComplete,
    noteWeapon: noteWeapon, noteArtifact: noteArtifact, noteNpc: noteNpc,
    syncFromCharacter: syncFromCharacter, points: points,
    maxPoints: maxPoints, milestoneByPts: milestoneByPts,
    claimable: claimable, nextMilestone: nextMilestone, claim: claim,
    summary: summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_BESTIARY = api;
})(typeof window !== 'undefined' ? window : globalThis);
