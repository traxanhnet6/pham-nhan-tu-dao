// Phàm Nhân Tu Đạo — SỰ KIỆN VẾT NỨT HƯ KHÔNG (js/rift-events.js)
// Lệnh Bui 22:59 2026-10-29: cốt truyện sự kiện cho người chơi TỪ TRÚC CƠ
// TRỞ LÊN, độ khó cực cao ("khó khăn một tỷ") — mở đầu Thiên 4 "Trúc Cơ
// Lập Nghiệp" (docs/feature-ideas.md Phần B + story-bible mục 29).
//
// Cơ chế: cứ mỗi chu kỳ 3 giờ, đúng MỘT vết nứt xé mở ngẫu nhiên trên một
// map thường (vị trí + thời điểm gieo hạt TẤT ĐỊNH theo số chu kỳ — mọi
// đường code tự tính lại giống hệt nhau, không cần lưu trạng thái), tồn
// tại 30 phút. Bước vào → bốc ngẫu nhiên 1 cảnh trong kho riftPool qua
// SR.pickRiftRealm (js/secret-realms.js — module này CHỈ TIÊU THỤ API,
// không sửa dữ liệu 15 cảnh).
//
// LUẬT KHÓ ĐÃ CHỐT (ghi ở story-bible mục 29):
//  - Quái trong cảnh: SR.scaleMonsterStats theo tầng + realmRank của
//    người vào, rồi nhân THÊM HP ×1,45 / công ×1,20 — sức ép ngang hoặc
//    trên cảnh giới người chơi một bậc (vào Trúc Cơ Sơ Kỳ gặp sức ép
//    cuối Trúc Cơ). Boss kỳ ngộ trong cảnh nhận thêm ×1,15/×1,10 — mức
//    cao nhất của cảnh. Người Kim Đan/Nguyên Anh vào thì scale tiếp
//    theo cột rank của hàm — sự kiện không lỗi thời sau Trúc Cơ.
//  - ĐAN HỒI HP: trong vết nứt, linh khí hư không thiêu rụi dược lực
//    của đan THẤP hơn Địa phẩm — chỉ đan Địa/Thiên phẩm dùng được.
//    Đan linh lực / tu vi / buff không bị chặn.
//  - CHẾT trong cảnh = bị hư không hất văng ra (hồi sinh ở trấn như
//    luật chết thường, KHÔNG mất đồ/tu vi thêm) + vết nứt ĐÓNG với
//    người đó trong chu kỳ này (mất lượt).
//  - Tối đa 2 lượt vào / chu kỳ — giữ khan hiếm.
//  - Cảnh không có boss (goal 'clear'): hoàn thành khi hạ đủ 8 quái.
//
// Arc sự kiện 4 nhiệm vụ q_vet_nut_1..4 (logic.js, cờ riftArc): mở khi
// realmRank ≥ 2 (Trúc Cơ) + đã trả q_chinh_24 (chương 18 "Giếng sáng và
// ngưỡng trời") + đã bái nhập tông. Người giao: đại diện tông đã bái
// nhập (cùng NPC với chuỗi ngự kiếm / arc 13-20); mắt xích đầu dẫn tới
// Từ bà ở Miếu Sơn Thần (giu_mieu) nghe tàn niệm Thanh Khê lão nhân.
(function (global) {
  'use strict';

  function SR() { return global.PNT_SECRET_REALMS || null; }
  function LM() { return global.PNT_LOGIC || null; }
  function MM() { return global.PNT_MAPS || null; }
  function SECT() { return global.PNT_SECTS || null; }
  function ALCH() { return global.PNT_ALCHEMY || null; }
  function FLIGHT() { return global.PNT_FLIGHT || null; }

  // ---------- Hằng số sự kiện ----------
  var CYCLE_MS = 3 * 60 * 60 * 1000;      // 1 vết nứt mỗi 3 giờ
  var DURATION_MS = 30 * 60 * 1000;       // tồn tại 30 phút
  var MAX_ENTRIES = 2;                    // tối đa 2 lượt / chu kỳ
  var CLEAR_KILLS = 8;                    // cảnh không boss: hạ 8 quái = xong
  var HP_MULT = 1.45, ATK_MULT = 1.20;    // hệ số "một tỷ" trên bí cảnh thường
  var ENC_HP_MULT = 1.15, ENC_ATK_MULT = 1.10; // boss kỳ ngộ: mức cao nhất
  var MIN_RANK = 2;                       // Trúc Cơ
  var CHAIN = ['q_vet_nut_1', 'q_vet_nut_2', 'q_vet_nut_3', 'q_vet_nut_4'];
  // Neo vết nứt trên map thường (ô thoáng đãng gần danh thắng, đã kiểm
  // đi được trong maps.js): sân giếng cổ / bờ suối linh / bãi tuyển đệ
  // tử / chân Thập Vạn Đại Sơn.
  var ANCHORS = [
    { mapId: 'map1', x: 38, y: 18, place: 'sân giếng cổ Thanh Khê' },
    { mapId: 'map2', x: 32, y: 28, place: 'bờ suối linh trong Rừng Thanh Sơn' },
    { mapId: 'map3', x: 42, y: 24, place: 'bãi tuyển đệ tử dưới Chân Núi' },
    { mapId: 'map4', x: 32, y: 50, place: 'Ngoại Vi Thập Vạn Đại Sơn' }
  ];

  // ---------- RNG tất định theo chu kỳ ----------
  function mulberry(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Thông tin vết nứt của 1 chu kỳ: mọi nơi tự tính lại giống nhau.
  function cycleInfoAt(cycleId) {
    var r = mulberry((cycleId ^ 0x9e3779b9) >>> 0);
    var spawnAt = cycleId * CYCLE_MS + (15 + Math.floor(r() * 120)) * 60000;
    var anchor = ANCHORS[Math.floor(r() * ANCHORS.length) % ANCHORS.length];
    return {
      cycleId: cycleId, spawnAt: spawnAt, expiresAt: spawnAt + DURATION_MS,
      anchor: anchor
    };
  }
  function cycleInfo(now) {
    var info = cycleInfoAt(Math.floor(now / CYCLE_MS));
    info.active = now >= info.spawnAt && now < info.expiresAt;
    info.next = info.active ? null : (now < info.spawnAt ? info : cycleInfoAt(info.cycleId + 1));
    return info;
  }

  // ---------- Trạng thái lưu trong flags ----------
  function ensure(flags) {
    if (!flags) return null;
    if (!flags.rift || typeof flags.rift !== 'object') {
      flags.rift = { cycleEntries: {}, lockedCycle: null, run: null, lastRealmId: null, bannerCycle: -1 };
    }
    var s = flags.rift;
    if (!s.cycleEntries || typeof s.cycleEntries !== 'object') s.cycleEntries = {};
    if (s.lockedCycle === undefined) s.lockedCycle = null;
    if (s.bannerCycle === undefined) s.bannerCycle = -1;
    return s;
  }
  function entriesUsed(flags, cycleId) {
    var s = ensure(flags); if (!s) return 0;
    return s.cycleEntries[cycleId] || 0;
  }
  function rankOf(ch) {
    var sr = SR();
    if (sr && sr.rankOf) return sr.rankOf(ch || {});
    var m = MM();
    if (m && m.realmRankOf) return m.realmRankOf(ch || {});
    return (ch && ch.tier > 0) ? 1 : 0;
  }
  function tierOf(ch) { return (ch && ch.tier) || 0; }
  function turned(qs, id) {
    if (!qs || !qs.turnedIn) return false;
    if (Array.isArray(qs.turnedIn)) return qs.turnedIn.indexOf(id) >= 0;
    return !!qs.turnedIn[id];
  }
  function inRiftRun(flags) {
    var sr = SR(); if (!sr) return false;
    var s = sr.ensure(flags);
    return !!(s && s.run && s.run.rift);
  }

  // ---------- Cổng vào vết nứt ----------
  // reason: norift | noroot | lowrealm | locked | limit | inrun | nopick
  function canEnterRift(flags, ch, now) {
    var sr = SR(); if (!sr) return { ok: false, reason: 'nomodule' };
    var s = ensure(flags);
    var info = cycleInfo(now);
    if (!info.active) return { ok: false, reason: 'norift', info: info };
    if (!flags.kyNgo) return { ok: false, reason: 'noroot', info: info };
    if (rankOf(ch) < MIN_RANK) return { ok: false, reason: 'lowrealm', info: info };
    if (s.lockedCycle === info.cycleId) return { ok: false, reason: 'locked', info: info };
    if (entriesUsed(flags, info.cycleId) >= MAX_ENTRIES) return { ok: false, reason: 'limit', info: info };
    var ss = sr.ensure(flags);
    if (ss && ss.run) return { ok: false, reason: 'inrun', info: info };
    return { ok: true, info: info };
  }
  // Bốc cảnh + dựng run rift trên machinery sẵn có của secret-realms
  // (run kind 'dinh_ky' để entrySpawns/treasures/timer/cổng thoát/roll
  // thưởng chạy nguyên xi; cờ rift + riftCycle là của riêng sự kiện).
  function beginRiftRun(flags, ch, qs, now, rng, returnTo) {
    var sr = SR(); if (!sr) return { ok: false, reason: 'nomodule' };
    var chk = canEnterRift(flags, ch, now);
    if (!chk.ok) return chk;
    var s = ensure(flags);
    var def = sr.pickRiftRealm(rng || Math.random, ch, s.lastRealmId);
    if (!def) return { ok: false, reason: 'nopick', info: chk.info };
    var ss = sr.ensure(flags, now);
    var endAt = Math.min(now + (def.durationMin || 25) * 60000, chk.info.expiresAt);
    ss.run = {
      kind: 'dinh_ky', realmId: def.id, mapId: def.mapId,
      sessionKey: 'rift@' + chk.info.cycleId,
      endAt: endAt, returnTo: returnTo, kills: 0, need: 0,
      needBoss: Math.max(1, (def.bosses || []).length), bossKills: 0,
      rewarded: false, encounterUsed: false, treasures: [],
      rift: true, riftCycle: chk.info.cycleId, riftKills: 0
    };
    ss.run.treasures = sr.placeTreasures(def, rng || null);
    // Nhiệm vụ 4 cần đúng 1 địa bảo trong cảnh: đang giữ nhiệm vụ mà
    // lăn ra 0 điểm thì lăn lại bằng rng thấp (chắc chắn có).
    if (qs && qs.accepted && qs.accepted.q_vet_nut_4 && !qs.accepted.q_vet_nut_4.done && !ss.run.treasures.length) {
      ss.run.treasures = sr.placeTreasures(def, function () { return 0.01; });
    }
    s.cycleEntries[chk.info.cycleId] = entriesUsed(flags, chk.info.cycleId) + 1;
    s.lastRealmId = def.id;
    s.run = { realmId: def.id, cycleId: chk.info.cycleId, startedAt: now };
    return { ok: true, def: def, run: ss.run, info: chk.info };
  }

  // ---------- Độ khó "một tỷ": scale quái trong cảnh ----------
  // Áp SAU khi game.js dựng quái (quái thường của map instance + boss
  // entrySpawns): SR.scaleMonsterStats(tầng, rank) rồi nhân thêm hệ số
  // sự kiện. Chỉ áp đúng 1 lần / quái (cờ riftScaled trên instance).
  function applyRunScaling(monsters, flags, ch) {
    var sr = SR(); if (!sr || !monsters) return 0;
    var ss = sr.ensure(flags);
    if (!ss || !ss.run || !ss.run.rift) return 0;
    var n = 0;
    for (var i = 0; i < monsters.length; i++) {
      var m = monsters[i];
      if (!m || m.riftScaled) continue;
      var st = sr.scaleMonsterStats({ hp: m.maxHp, atk: m.atk, linhThach: 0 }, tierOf(ch), rankOf(ch));
      m.maxHp = Math.max(1, Math.round(st.maxHp * HP_MULT));
      m.hp = m.maxHp;
      m.atk = Math.max(1, Math.round(st.atk * ATK_MULT));
      if (st.def) m.def = (m.def || 0) + st.def;
      m.riftScaled = true;
      n++;
    }
    return n;
  }
  // Boss kỳ ngộ trong cảnh: SR.rollEncounter đã scale theo tầng/rank —
  // nhân thêm hệ số kỳ ngộ để nó là thứ mạnh nhất trong cảnh.
  function scaleEncounter(m) {
    if (!m || m.riftScaled) return m;
    m.maxHp = Math.max(1, Math.round(m.maxHp * ENC_HP_MULT));
    m.hp = m.maxHp;
    m.atk = Math.max(1, Math.round(m.atk * ENC_ATK_MULT));
    m.riftScaled = true;
    return m;
  }

  // ---------- Luật đan trong vết nứt ----------
  // Chỉ chặn đan HỒI HP dưới Địa phẩm (rank < 3). Trả câu lý do hoặc null.
  function pillBlockReason(flags, itemId) {
    if (!inRiftRun(flags)) return null;
    var al = ALCH(); if (!al || !al.pillDef) return null;
    var def = al.pillDef(itemId);
    if (!def || def.kind !== 'heal') return null;
    var g = al.GRADES && al.GRADES[def.grade];
    if (g && g.rank >= 3) return null;
    return 'Linh khí hư không thiêu rụi dược lực của ' + def.name + ' ngay khi vừa nuốt — trong vết nứt chỉ đan Địa phẩm trở lên mới hồi được HP.';
  }

  // ---------- Chết trong vết nứt ----------
  // Gọi TRƯỚC khi run bị xoá (onRealmDeath của game.js): ghi khoá chu
  // kỳ, dọn marker. Hậu quả còn lại theo luật chết thường (hồi sinh ở
  // trấn, không mất đồ/tu vi thêm).
  function noteDeath(flags, now) {
    var sr = SR(); if (!sr) return { wasRift: false };
    var s = ensure(flags);
    var ss = sr.ensure(flags);
    var run = ss && ss.run;
    if (!run || !run.rift) { if (s) s.run = null; return { wasRift: false }; }
    s.lockedCycle = run.riftCycle;
    s.run = null;
    var def = sr.realmById(run.realmId);
    return { wasRift: true, realmName: def ? def.name : 'vết nứt', cycleId: run.riftCycle };
  }

  // ---------- Tiến độ trong cảnh (game.js gọi từ onRealmKill...) ----------
  // Hạ quái trong rift: đếm kill cho cảnh không boss, set done cho
  // nhiệm vụ 2 (hạ boss cảnh) — nhiệm vụ 3 xử ở nhánh riftEncounter của
  // game.js qua noteEncounterKilled. Trả {completed} khi cảnh không
  // boss đạt đủ CLEAR_KILLS để game.js chốt thưởng.
  function noteRealmKill(flags, qs, m) {
    var sr = SR(); if (!sr) return {};
    var ss = sr.ensure(flags);
    var run = ss && ss.run;
    if (!run || !run.rift) return {};
    var out = {};
    if (m && !m.realmBoss) run.riftKills = (run.riftKills || 0) + 1;
    if (m && m.realmBoss && qs && qs.accepted && qs.accepted.q_vet_nut_2 && !qs.accepted.q_vet_nut_2.done) {
      qs.accepted.q_vet_nut_2.progress = 1;
      qs.accepted.q_vet_nut_2.done = true;
      out.questDone = 'q_vet_nut_2';
    }
    var def = sr.realmById(run.realmId);
    if (def && !(def.bosses && def.bosses.length) && !run.rewarded && (run.riftKills || 0) >= CLEAR_KILLS) {
      out.completed = true;
    }
    return out;
  }
  function noteEncounterKilled(flags, qs) {
    if (!inRiftRun(flags)) return {};
    if (qs && qs.accepted && qs.accepted.q_vet_nut_3 && !qs.accepted.q_vet_nut_3.done) {
      qs.accepted.q_vet_nut_3.progress = 1;
      qs.accepted.q_vet_nut_3.done = true;
      return { questDone: 'q_vet_nut_3' };
    }
    return {};
  }
  // Nhiệm vụ 3 đang dở: ép kỳ ngộ xuất hiện ở lần hạ quái/hái dược đầu
  // tiên trong lượt (game.js truyền rng = 0 cho SR.rollEncounter).
  function shouldForceEncounter(flags, qs) {
    if (!inRiftRun(flags)) return false;
    var sr = SR(); if (!sr) return false;
    var ss = sr.ensure(flags);
    if (!ss || !ss.run || ss.run.encounterUsed) return false;
    return !!(qs && qs.accepted && qs.accepted.q_vet_nut_3 && !qs.accepted.q_vet_nut_3.done);
  }
  function noteTreasureTaken(flags, qs) {
    if (!inRiftRun(flags)) return {};
    if (qs && qs.accepted && qs.accepted.q_vet_nut_4 && !qs.accepted.q_vet_nut_4.done) {
      qs.accepted.q_vet_nut_4.progress = 1;
      qs.accepted.q_vet_nut_4.done = true;
      return { questDone: 'q_vet_nut_4' };
    }
    return {};
  }
  // Banner: game.js gọi mỗi tick — trả thông tin khi vết nứt của chu kỳ
  // hiện tại VỪA mở (đúng 1 lần / chu kỳ nhờ bannerCycle đã lưu).
  function pollBanner(flags, now) {
    var s = ensure(flags); if (!s) return null;
    var info = cycleInfo(now);
    if (info.active && s.bannerCycle !== info.cycleId) {
      s.bannerCycle = info.cycleId;
      return info;
    }
    return null;
  }

  // ---------- Arc sự kiện q_vet_nut_1..4 ----------
  function arcGateOpen(ch, flags, qs) {
    return !!(flags && flags.sectJoined) && rankOf(ch) >= MIN_RANK && turned(qs, 'q_chinh_24');
  }
  function isGiver(npcId, flags) {
    var fl = FLIGHT();
    if (fl && fl.isGiver) return fl.isGiver(npcId, flags);
    var sc = SECT(); if (!sc || !flags || !flags.sectJoined) return false;
    var def = sc.sectById(flags.sectJoined);
    return !!(def && def.rep === npcId);
  }
  function giverName(flags) {
    var fl = FLIGHT();
    if (fl && fl.giverName) return fl.giverName(flags);
    var sc = SECT(); if (!sc || !flags || !flags.sectJoined) return 'Đại diện tông môn';
    var def = sc.sectById(flags.sectJoined);
    return def ? (def.repName || def.name) : 'Đại diện tông môn';
  }
  function activeQuestId(qs) {
    if (!qs || !qs.accepted) return null;
    for (var i = 0; i < CHAIN.length; i++) if (qs.accepted[CHAIN[i]]) return CHAIN[i];
    return null;
  }
  function availableQuestId(ch, flags, qs) {
    if (!arcGateOpen(ch, flags, qs)) return null;
    for (var i = 0; i < CHAIN.length; i++) {
      var qid = CHAIN[i];
      if (qs.accepted[qid] || turned(qs, qid)) continue;
      var L = LM(); var q = L && L.QUESTS[qid];
      if (q && q.requires && !turned(qs, q.requires)) continue;
      return qid;
    }
    return null;
  }
  function markerFor(npcId, ch, flags, qs) {
    var act = activeQuestId(qs);
    if (act && qs.accepted[act].done && isGiver(npcId, flags)) return '?';
    // Mắt xích đầu của nhiệm vụ 1 nằm ở Miếu Sơn Thần.
    if (act === 'q_vet_nut_1' && !qs.accepted[act].done && npcId === 'giu_mieu') return '!';
    if (isGiver(npcId, flags) && availableQuestId(ch, flags, qs)) return '!';
    return null;
  }

  // Câu vị tông môn — một câu riêng cho mỗi tông trong thoại mở arc.
  var SECT_FLAVOR = {
    thanh_phong: 'Thanh Phong Phái ta lấy kiếm trấn sơn — khe nứt mở trên đất Thanh Sơn, người của Thanh Phong không thể đứng ngoài.',
    huyen_phap: 'Huyền Pháp Tông đã bấm quẻ ba lần: cả ba lần quẻ đều gãy. Thứ ở bên kia khe nứt không nằm trong quẻ nữa.',
    thien_cong: 'Thiên Công Phường đã rèn sẵn ba cây Chấn Không Đinh — nhưng đinh chỉ giữ được mép nứt, không giữ được người bước vào.',
    dan_ha: 'Đan Hà Cốc đã sắc sẵn Sinh Cơ Đan cho người vào nứt. Nhớ lấy: đan thường vào đó là tro — chỉ đan Địa phẩm trở lên mới còn dược lực.',
    van_thu: 'Vạn Thú Môn nghe được tiếng gầm từ bên kia khe nứt — không con thú nào của vùng này gầm như thế.',
    thien_phu: 'Thiên Phù Các đã dán chín lá Trấn Không Phù quanh sân giếng. Phù cháy mất ba lá trong một đêm.',
    cuu_cung: 'Cửu Cung Trận Tông bày trận đo thử: trận bàn nứt ngay khi chạm mép khe. Bên kia không theo trận lý của cõi này.',
    kim_cang: 'Kim Cang Môn cử hai đệ tử Trúc Cơ vào thử hôm qua. Một người trở ra, tóc bạc trắng, không nhớ nổi tên mình.',
    ngu_doc: 'Ngũ Độc Giáo thả trùng dò đường vào khe nứt — trùng chết trước khi qua được nửa bước. Độc của ta còn thua hư không.',
    huyen_am: 'Huyền Âm Cung nghe được tiếng đàn từ bên kia khe nứt. Không ai gảy. Tiếng đàn vẫn đều đều ba đêm nay.'
  };
  function sectFlavor(flags) {
    return SECT_FLAVOR[flags && flags.sectJoined] || 'Mười tông đều đã cử người tới Thanh Khê. Chưa tông nào dám nói mình hiểu thứ ở bên kia khe nứt.';
  }
  function repName(flags) { return giverName(flags); }

  function dialogueFor(npcId, ch, flags, qs, now) {
    var act = activeQuestId(qs);
    // --- Từ bà ở Miếu Sơn Thần: mắt xích tàn niệm của nhiệm vụ 1 ---
    if (npcId === 'giu_mieu') {
      if (act === 'q_vet_nut_1' && !qs.accepted[act].done) {
        return [
          'Bà đợi con từ đêm giếng sáng lần thứ ba. Lại gần miếu mà nghe — hôm nay không phải bà nói với con.',
          '(Một giọng già nua vang lên từ trong tượng Sơn Thần, như vọng qua trăm năm:) "Ta là Thanh Khê. Phong ấn ta dệt dưới đáy giếng… đã nứt HẲN rồi."',
          '"Ngày ta phong ấn, ta biết sẽ có ngày này. Thứ bị nhốt không chết đi — nó chỉ chờ linh khí cõi này yếu tới mức không giữ nổi khóa."',
          '"Vết nứt sẽ xé mở trên đất Thanh Khê theo từng chu kỳ, mỗi lần một nơi. Bên kia không phải bí cảnh — là HƯ KHÔNG, nơi tu sĩ Trúc Cơ vào mười chết chín."',
          '"Nhưng trong hư không có mảnh trời rơi và yêu đan ngưng từ linh khí nát vụn — thứ cõi này không tự sinh được nữa. Muốn đi tiếp trên đường tu, lớp trẻ các ngươi phải tự vào mà lấy."',
          'Bà không giữ con nữa. Về báo cho đại diện tông của con. Nhớ lời lão nhân: vào nứt thì đi như đi trên miệng vực — đừng tham, đừng ở lâu, đừng tin đan thường cứu được mạng.'
        ];
      }
      if (turned(qs, 'q_vet_nut_1')) {
        return ['Từ hôm nghe tàn niệm, đêm nào bà cũng thắp thêm một nén nhang trước miếu. Không phải cầu cho bà — cầu cho đứa sắp bước vào chỗ trời rách.'];
      }
      return null;
    }
    if (!isGiver(npcId, flags)) return null;
    var name = repName(flags);
    // Chưa qua chương 18: đại diện không nhắc chuyện vết nứt.
    if (!turned(qs, 'q_chinh_24')) return null;
    // Đã qua chương 18 nhưng CHƯA Trúc Cơ: thoại gác cổng — nứt vẫn
    // hiện trên map nhưng bước vào là chết, nói rõ điều kiện.
    if (rankOf(ch) < MIN_RANK) {
      return [
        'Ngươi cũng nghe tiếng trời rách rồi chứ? Vết Nứt Hư Không đã bắt đầu xé mở trên đất Thanh Khê — mỗi chu kỳ một nơi, mở chừng nửa canh giờ rồi khép.',
        'Đừng nhìn ta như thế. Ta không cản ngươi vì phân biệt đệ tử mới cũ — ta cản vì người dưới Trúc Cơ bước vào đó là CHẾT THẬT. Linh khí hư không xé nát kinh mạch chưa qua tẩy lễ Trúc Cơ trong vài hơi thở.',
        'Cả mười tông đã họp: chỉ đệ tử từ Trúc Cơ trở lên mới được cử vào thám thính. Ngươi cứ tu cho tới ngày độ kiếp thành công — khe nứt không chạy đi đâu, nó còn trở lại nhiều lần.',
        'Từ bà ở Miếu Sơn Thần giữ một mảnh tàn niệm của Thanh Khê lão nhân. Tới lúc ngươi đủ cảnh giới, bà sẽ cho ngươi nghe. Còn bây giờ — lo tu hành đi.'
      ];
    }
    if (!flags.sectJoined) return null;
    if (act && qs.accepted[act].done) {
      return ['Ngươi còn sống trở ra — thế là hơn khối đệ tử các tông rồi. Trả nhiệm vụ đi, ta ghi công cho ngươi trước mặt chưởng môn.'];
    }
    var avail = availableQuestId(ch, flags, qs);
    if (avail === 'q_vet_nut_1' || act === 'q_vet_nut_1') {
      return [
        'Trời rách thật rồi, ' + (ch && ch.name ? ch.name : 'đệ tử') + '. Ba đêm nay, vết nứt hư không xé mở khắp vùng Thanh Khê — giếng cổ chỉ là vết nứt đầu tiên, không phải vết cuối cùng.',
        sectFlavor(flags),
        'Chưởng môn các tông đã họp kín: tông môn BẤT LỰC. Trận pháp trấn không nổi, phù văn giữ không xong — khe nứt mở theo chu kỳ của nó, khép theo ý của nó.',
        'Ngươi là lớp đệ tử Trúc Cơ đầu tiên của vùng này. Tông cử ngươi vào khe nứt thám thính — không phải việc vặt, không có ai đi thay, và ta nói thẳng: vào đó là cược mạng.',
        'Trước khi đi, tới Miếu Sơn Thần gặp Từ bà. Bà giữ tàn niệm của Thanh Khê lão nhân — người tự tay dệt phong ấn năm xưa. Nghe lão nhân nói hết, rồi hãy quyết định bước vào hay không.'
      ];
    }
    if (avail === 'q_vet_nut_2' || act === 'q_vet_nut_2') {
      return [
        'Đã nghe tàn niệm rồi thì ta không vòng vo nữa. Vết nứt mở theo chu kỳ ba giờ, mỗi lần chừng ba mươi phút, mỗi chu kỳ ngươi chỉ vào được hai lượt.',
        'Trong cảnh, hạ con yêu thú canh giữ khe nứt — thứ đeo ấn hư không trên trán ấy. Nó mạnh hơn cảnh giới của ngươi một bậc. Đừng gọi đó là bất công: hư không không biết thương ai.',
        'Hai điều khắc cốt: một — đan hồi máu dưới Địa phẩm vào đó cháy thành tro, chỉ Sinh Cơ Đan trở lên mới dùng được. Hai — gục trong cảnh là bị hư không hất văng ra và khe nứt khép với ngươi tới hết chu kỳ. Không ai vào kéo ngươi ra được.'
      ];
    }
    if (avail === 'q_vet_nut_3' || act === 'q_vet_nut_3') {
      return [
        'Ngươi hạ được kẻ canh giữ rồi. Nhưng trong cảnh còn một thứ nữa: yêu thú bị linh khí hư không kinh động, hiện thân bất chợt ngay cạnh người vào nứt — bọn ta gọi là kẻ canh giữ thứ hai.',
        'Nó là thứ mạnh nhất trong cảnh, mạnh hơn cả con ngươi vừa hạ. Lần vào tới, khi ngươi ra tay đánh quái hay hái dược trong cảnh, nó sẽ tự tìm tới. Đừng chạy — trong hư không, chạy cũng chết như đứng yên, mà chết sau lưng thì nhục.',
        'Hạ được nó, yêu đan của nó ngưng từ linh khí nát vụn — hàng thật mà cõi này không luyện ra được.'
      ];
    }
    if (avail === 'q_vet_nut_4' || act === 'q_vet_nut_4') {
      return [
        'Việc cuối của đợt thám thính đầu tiên: mang về một mảnh trời rơi — thiên tài địa bảo ngưng trong hư không, phát sáng vàng ở nơi ngẫu nhiên trong cảnh.',
        'Mỗi lượt vào cảnh chỉ mọc ít mảnh, có lượt không mọc mảnh nào — trừ lượt này: tông đã nhờ Từ bà khấn trấn, mảnh trời chắc chắn hiện ra cho ngươi. Tìm nó, hái nó, và RA NGAY. Tham thêm một khắc là thêm một phần chết.',
        'Mang mảnh trời về đây. Các tông cần nó để đo xem khe nứt đang rộng ra nhanh tới mức nào — và để biết lớp đệ tử tiếp theo còn bao nhiêu thời gian.'
      ];
    }
    if (turned(qs, 'q_vet_nut_4')) {
      return [
        'Đợt thám thính đầu tiên đã khép, nhưng vết nứt thì không. Nó vẫn mở theo chu kỳ — và theo đo đạc từ mảnh trời ngươi mang về, nó đang RỘNG RA.',
        'Từ nay, vào nứt là việc của riêng ngươi và cái mạng của ngươi. Thưởng trong đó vẫn theo lệ cũ của kho cảnh: yêu đan, địa bảo, trứng thú — thứ gì lấy được đều phải trả bằng máu.',
        'Khi nào ngươi lên Kim Đan, đừng tưởng hư không sẽ nhẹ tay. Nó co theo cảnh giới người vào — ngươi mạnh lên một bậc, nó đè xuống thêm một bậc.'
      ];
    }
    return null;
  }

  // ---------- Dữ liệu cho panel sự kiện ----------
  function panelData(flags, ch, qs, now) {
    var sr = SR();
    var s = ensure(flags);
    var info = cycleInfo(now);
    var eligible = [];
    if (sr && sr.POOL) {
      eligible = sr.POOL.filter(function (d) { return d.riftPool && sr.realmTierOk(d, ch || {}); })
        .map(function (d) { return d.name; });
    }
    return {
      info: info,
      active: info.active,
      msLeft: info.active ? Math.max(0, info.expiresAt - now) : 0,
      nextSpawnAt: info.active ? null : (info.next ? info.next.spawnAt : null),
      nextAnchor: info.active ? info.anchor : (info.next ? info.next.anchor : null),
      rank: rankOf(ch), rankOk: rankOf(ch) >= MIN_RANK,
      entriesUsed: entriesUsed(flags, info.cycleId),
      entriesLeft: Math.max(0, MAX_ENTRIES - entriesUsed(flags, info.cycleId)),
      locked: s.lockedCycle === info.cycleId,
      eligibleRealms: eligible,
      arcQuest: availableQuestId(ch, flags, qs) || activeQuestId(qs),
      rules: {
        cycleHours: CYCLE_MS / 3600000, durationMin: DURATION_MS / 60000,
        maxEntries: MAX_ENTRIES, hpMult: HP_MULT, atkMult: ATK_MULT,
        clearKills: CLEAR_KILLS, minPillGrade: 'Địa'
      }
    };
  }

  var api = {
    CYCLE_MS: CYCLE_MS, DURATION_MS: DURATION_MS, MAX_ENTRIES: MAX_ENTRIES,
    CLEAR_KILLS: CLEAR_KILLS, HP_MULT: HP_MULT, ATK_MULT: ATK_MULT,
    ENC_HP_MULT: ENC_HP_MULT, ENC_ATK_MULT: ENC_ATK_MULT, MIN_RANK: MIN_RANK,
    CHAIN: CHAIN, ANCHORS: ANCHORS,
    mulberry: mulberry, cycleInfoAt: cycleInfoAt, cycleInfo: cycleInfo,
    ensure: ensure, entriesUsed: entriesUsed, rankOf: rankOf, tierOf: tierOf,
    inRiftRun: inRiftRun, canEnterRift: canEnterRift, beginRiftRun: beginRiftRun,
    applyRunScaling: applyRunScaling, scaleEncounter: scaleEncounter,
    pillBlockReason: pillBlockReason, noteDeath: noteDeath,
    noteRealmKill: noteRealmKill, noteEncounterKilled: noteEncounterKilled,
    shouldForceEncounter: shouldForceEncounter, noteTreasureTaken: noteTreasureTaken,
    pollBanner: pollBanner,
    arcGateOpen: arcGateOpen, isGiver: isGiver, giverName: giverName,
    activeQuestId: activeQuestId, availableQuestId: availableQuestId,
    markerFor: markerFor, dialogueFor: dialogueFor, panelData: panelData
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_RIFT_EVENTS = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
