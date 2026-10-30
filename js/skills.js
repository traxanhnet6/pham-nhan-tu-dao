// Phàm Nhân Tu Đạo — hệ thống kỹ năng (dữ liệu + luật thuần, test bằng Node).
// Bám dữ liệu thật của game: cảnh giới trong logic.js chỉ tới Luyện Khí tầng 3
// (TIERS tier 0..3) nên các mốc mở khoá nén vào tầng 1–3; linh căn có 8 hệ
// (kim, mộc, thủy, hỏa, thổ, phong, lôi, băng) — mỗi hệ một thần thông riêng.
// Game gốc chưa có linh lực: module này bổ sung linh lực (ll) + hồi chiêu (cd)
// lưu ngay trên nhân vật (ll, cd) — save cũ không có hai trường này vẫn nạp
// được nhờ ensureState() khởi tạo lười.
(function () {
  'use strict';
  var FRAMES = 20; // chuẩn 20 frame cho hoạt ảnh hiệu ứng
  // ---------- Kỹ năng chủ động (theo thứ tự thanh skill) ----------
  var SKILLS = {
    combo: {
      id: 'combo', key: 'Space', name: 'Liên Hoàn Kiếm', mech: 'combo', unlockTier: 0,
      cd: 0, mana: 0, mult: 1,
      desc: 'Đánh thường nâng cấp thành combo 3 đòn có vệt kiếm: đòn 1–2 chém nhanh, đòn 3 chém vòng cung rộng, mạnh hơn 30%.'
    },
    kiem_khi: {
      id: 'kiem_khi', key: '1', name: 'Kiếm Khí Trảm', mech: 'projectile', unlockTier: 1,
      cd: 4, mana: 12, mult: 1.6, speed: 430, range: 200, width: 42,
      desc: 'Chém ra một luồng kiếm khí bay thẳng theo hướng nhìn, xuyên qua mọi mục tiêu trên đường đi.'
    },
    toan_phong: {
      id: 'toan_phong', key: '2', name: 'Toàn Phong Kiếm', mech: 'aoe_self', unlockTier: 2,
      cd: 8, mana: 20, mult: 1.35, radius: 98,
      desc: 'Xoay kiếm một vòng quanh thân, kiếm khí cuốn theo lá và bụi đất, đánh mọi kẻ địch xung quanh.'
    },
    thien_can: {
      id: 'thien_can', key: '3', name: 'Thiên Căn Thần Thông', mech: 'root', unlockTier: 2,
      cd: 14, mana: 35,
      desc: 'Chiêu mạnh nhất theo linh căn của bạn — hình thái và hiệu ứng khác hẳn nhau theo từng hệ. Cần đã lộ linh căn.'
    },
    luu_tinh: {
      id: 'luu_tinh', key: '4', name: 'Lưu Tinh Đột', mech: 'dash', unlockTier: 3,
      cd: 6, mana: 16, mult: 1.9, range: 132,
      desc: 'Lướt nhanh như sao băng, đâm xuyên qua kẻ địch trên đường lướt và để lại vệt sáng sau lưng.'
    },
    ngu_kiem: {
      id: 'ngu_kiem', key: '5', name: 'Ngự Kiếm Thuật', mech: 'orbit', unlockTier: 3,
      cd: 18, mana: 30, mult: 0.95, dur: 5, tick: 0.45, radius: 118,
      desc: 'Phi kiếm bay quanh thân tự tìm đánh kẻ địch gần nhất trong 5 giây — đỉnh cao của Luyện Khí kỳ.'
    },
    // ----- Skill SAU ĐỘT PHÁ (mở theo CẢNH GIỚI LỚN, trường unlockRealm
    // = hạng trong thang REALMS của js/maps.js: Trúc Cơ 2, Kim Đan 3,
    // Nguyên Anh 4, Hóa Thần 5, Độ Kiếp 6). Mỗi cảnh giới 2 chiêu. Cơ
    // chế bám mechs sẵn có của game.js (projectile/aoe_point/chain/
    // orbit) + 2 mech mới: 'shield' (khiên linh khí) và 'domain' (lĩnh
    // vực làm chậm) — game.js xử lý riêng trong castSkill/updateEffects.
    xuyen_van: {
      id: 'xuyen_van', key: '8', name: 'Xuyên Vân Kiếm Khí', mech: 'projectile', unlockRealm: 2,
      cd: 7, mana: 42, mult: 2.6, speed: 540, range: 330, width: 48, color: '#bfe6ff',
      desc: 'Kiếm khí Trúc Cơ ngưng tụ thành một đạo xuyên vân: bay xa 330, xuyên mọi mục tiêu trên đường, sát thương 260% công.'
    },
    linh_khien: {
      id: 'linh_khien', key: '9', name: 'Linh Khí Thần Khiên', mech: 'shield', unlockRealm: 2,
      cd: 16, mana: 38, shieldPct: 35, dur: 8, color: '#7fe8d6',
      desc: 'Dựng khiên linh khí quanh thân chịu thay 35% Máu tối đa trong 8 giây — tấm chắn để đứng chịu lôi kiếp và boss.'
    },
    dan_hoa: {
      id: 'dan_hoa', key: '0', name: 'Đan Hỏa Liệu Thiên', mech: 'aoe_point', unlockRealm: 3,
      cd: 14, mana: 70, mult: 3.1, radius: 150, color: '#ff9a3c',
      desc: 'Lửa kim đan bùng nổ tại điểm chỉ định, thiêu rụi vùng rộng 150 với sát thương 310% công.'
    },
    than_loi: {
      id: 'than_loi', key: 'q', name: 'Ngũ Lôi Oanh Đỉnh', mech: 'chain', unlockRealm: 3,
      cd: 13, mana: 66, mult: 2.9, range: 300, targets: 5, color: '#cfa6ff',
      desc: 'Năm đạo lôi giáng liên tiếp lên 5 kẻ địch gần nhất trong tầm 300, mỗi đạo 290% công rồi yếu dần.'
    },
    phan_than: {
      id: 'phan_than', key: 'r', name: 'Nguyên Anh Xuất Khiếu', mech: 'orbit', unlockRealm: 4,
      cd: 24, mana: 95, mult: 1.5, dur: 10, tick: 0.5, radius: 150, color: '#cfa6ff',
      desc: 'Nguyên anh xuất khiếu hoá thành phi kiếm hộ thân 10 giây, tự tìm đánh kẻ địch gần nhất mỗi 0,5 giây với 150% công.'
    },
    tran_ap: {
      id: 'tran_ap', key: 'v', name: 'Hồn Phách Trấn Áp', mech: 'aoe_point', unlockRealm: 4,
      cd: 16, mana: 90, mult: 3.3, radius: 130, freeze: 2.0, color: '#bfe3ff',
      desc: 'Uy áp nguyên anh trấn xuống vùng 130: 330% công và đóng băng mọi kẻ địch trúng đòn 2 giây.'
    },
    linh_vuc: {
      id: 'linh_vuc', key: 'g', name: 'Hóa Thần Lĩnh Vực', mech: 'domain', unlockRealm: 5,
      cd: 26, mana: 130, mult: 0.55, radius: 170, dur: 7, tick: 0.5, slowPct: 55, color: '#dfe9ff',
      desc: 'Mở lĩnh vực thần thức bán kính 170 trong 7 giây: kẻ địch trong lĩnh vực bị níu chân chậm đi một nửa và chịu 55% công mỗi 0,5 giây.'
    },
    kiem_tran: {
      id: 'kiem_tran', key: 'h', name: 'Thiên Điều Kiếm Trận', mech: 'aoe_point', unlockRealm: 5,
      cd: 20, mana: 125, mult: 4.0, radius: 170, color: '#ffd94a',
      desc: 'Kiếm trận từ trời giáng xuống vùng 170, vạn kiếm tề phát với sát thương 400% công.'
    },
    loi_kiep: {
      id: 'loi_kiep', key: 'j', name: 'Cửu Thiên Lôi Kiếp', mech: 'chain', unlockRealm: 6,
      cd: 30, mana: 180, mult: 3.8, range: 420, targets: 9, color: '#e6ccff',
      desc: 'Triệu hồi lôi kiếp của chính mình giáng xuống 9 kẻ địch trong tầm 420 — chiêu thức của người đã qua độ kiếp.'
    },
    pha_huyen: {
      id: 'pha_huyen', key: 'k', name: 'Phá Huyền Nhất Kiếm', mech: 'projectile', unlockRealm: 6,
      cd: 24, mana: 170, mult: 5.2, speed: 620, range: 380, width: 92, color: '#ffffff',
      desc: 'Một kiếm phá vỡ hư không: luồng kiếm khí khổng lồ rộng 92, xa 380, sát thương 520% công.'
    }
  };
  var BAR = ['combo', 'kiem_khi', 'toan_phong', 'thien_can', 'luu_tinh', 'ngu_kiem'];
  // Hàng skill phụ cho chiêu sau đột phá (game.js dựng thành hàng riêng
  // #skillBar2 ngay trên hàng chính — bố cục HUD cũ không đổi).
  var BAR2 = ['xuyen_van', 'linh_khien', 'dan_hoa', 'than_loi', 'phan_than', 'tran_ap', 'linh_vuc', 'kiem_tran', 'loi_kiep', 'pha_huyen'];
  // ---------- Thần thông theo linh căn (biến thể của thien_can) ----------
  var ROOT_SKILLS = {
    kim: { root: 'kim', name: 'Kim Quang Vạn Kiếm', mech: 'aoe_point', mult: 2.3, radius: 88, color: '#ffd94a',
      desc: 'Mười bốn thanh kim kiếm từ trời giáng xuống cắm quanh mục tiêu, kim quang chói lòa.' },
    moc: { root: 'moc', name: 'Mộc Linh Trùng Sinh', mech: 'aoe_self', mult: 1.7, radius: 96, healPct: 0.12, color: '#69d66f',
      desc: 'Dây leo linh mộc bùng lên quanh thân quật ngã kẻ địch, sinh cơ tràn về hồi 12% Máu.' },
    thuy: { root: 'thuy', name: 'Thủy Long Phá', mech: 'projectile_wide', mult: 2.0, speed: 370, range: 210, width: 68, slow: 1.6, color: '#5aa7d6',
      desc: 'Sóng nước cuộn hình đầu rồng lao thẳng, kẻ trúng đòn bị dòng nước níu chân, chậm đi một nửa trong 1,6 giây.' },
    hoa: { root: 'hoa', name: 'Hỏa Phượng Liệu Nguyên', mech: 'aoe_point', mult: 2.4, radius: 102, color: '#ff7a3c',
      desc: 'Hỏa phượng bùng nổ tại điểm chỉ định, lửa thiêu rụi cả vùng, sóng chấn động lan ra mặt đất.' },
    tho: { root: 'tho', name: 'Địa Liệt Sơn Hà', mech: 'line', mult: 2.2, range: 156, width: 78, color: '#d99a4e',
      desc: 'Mặt đất nứt toác theo đường kiếm, năm trụ đá liên tiếp đội đất trỗi lên đâm mọi kẻ địch trên đường nứt.' },
    phong: { root: 'phong', name: 'Phong Bạo Kiếm Vũ', mech: 'projectile', mult: 1.9, speed: 390, range: 200, width: 84, color: '#9ad6a8',
      desc: 'Một cơn lốc kiếm khí xoáy tròn lao về phía trước, cuốn phăng mọi kẻ địch trong vùng lốc.' },
    loi: { root: 'loi', name: 'Thiên Lôi Giáng Thế', mech: 'chain', mult: 2.1, range: 235, targets: 3, color: '#cfa6ff',
      desc: 'Thiên lôi giáng xuống ba kẻ địch gần nhất liên tiếp, tia sét xé trời kèm tiếng nổ chát chúa trong ánh chớp.' },
    bang: { root: 'bang', name: 'Băng Phong Thiên Lý', mech: 'aoe_point', mult: 1.9, radius: 94, freeze: 1.4, color: '#bfe3ff',
      desc: 'Hàn khí bùng nổ đóng băng cả vùng: kẻ địch trúng đòn bị đông cứng 1,4 giây giữa biển băng tinh.' }
  };
  // ---------- Kỹ năng bị động (học xong tự kích hoạt, không cần bấm) ----------
  var PASSIVES = {
    ho_the: { id: 'ho_the', name: 'Linh Khí Hộ Thể', unlockTier: 1, desc: 'Linh khí tự vận hành hộ thể: giảm 15% sát thương nhận vào.' },
    tu_linh: { id: 'tu_linh', name: 'Tụ Linh Quyết', unlockTier: 2, desc: 'Chu thiên vận chuyển không ngừng: tốc độ hồi linh lực tăng 60%.' },
    dan_the: { id: 'dan_the', name: 'Kim Đan Hộ Thể', unlockRealm: 3, desc: 'Kim đan vận chuyển hộ thể không ngừng: giảm thêm 10% sát thương nhận vào (cộng với Linh Khí Hộ Thể).' },
    than_thuc: { id: 'than_thuc', name: 'Thần Thức Ngoại Phóng', unlockRealm: 4, desc: 'Thần thức bao phủ một vùng quanh thân: tốc độ hồi linh lực tăng thêm 30%.' }
  };
  // ---------- Trạng thái linh lực / hồi chiêu ----------
  // Bonus linh lực từ trang bị phẩm cao (trượng Huyền/Địa/Thiên phẩm...) đi
  // qua Logic.statTotals — tra cứu lười PNT_LOGIC, thiếu module thì = 0.
  function gearStat(ch, key) {
    var Lg = null;
    if (typeof window !== 'undefined' && window.PNT_LOGIC) Lg = window.PNT_LOGIC;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_LOGIC) Lg = globalThis.PNT_LOGIC;
    if (!Lg || typeof Lg.statTotals !== 'function') return 0;
    return Lg.statTotals(ch)[key] || 0;
  }
  // Module cảnh giới cao (js/realms.js) — tra cứu lười như mọi module
  // khác: chưa nạp hoặc nhân vật dưới Trúc Cơ thì mọi cộng thêm = 0 và
  // hành vi khớp hệ cũ (thang linh lực 40 + 25 x tầng giữ nguyên).
  function realmsApi() {
    if (typeof window !== 'undefined' && window.PNT_REALMS) return window.PNT_REALMS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_REALMS) return globalThis.PNT_REALMS;
    return null;
  }
  function realmRankLazy(ch) {
    var MP = null;
    if (typeof window !== 'undefined' && window.PNT_MAPS) MP = window.PNT_MAPS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_MAPS) MP = globalThis.PNT_MAPS;
    if (MP && typeof MP.realmRankOf === 'function') return MP.realmRankOf(ch);
    if (!ch) return 0;
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    return (ch.tier || 0) > 0 ? 1 : 0;
  }
  function realmNameOf(rank) {
    var MP = null;
    if (typeof window !== 'undefined' && window.PNT_MAPS) MP = window.PNT_MAPS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_MAPS) MP = globalThis.PNT_MAPS;
    if (MP && typeof MP.realmById === 'function') return MP.realmById(rank === 2 ? 'truc_co' : rank === 3 ? 'kim_dan' : rank === 4 ? 'nguyen_anh' : rank === 5 ? 'hoa_than' : 'do_kiep').name;
    return { 2: 'Trúc Cơ', 3: 'Kim Đan', 4: 'Nguyên Anh', 5: 'Hóa Thần', 6: 'Độ Kiếp' }[rank] || 'Luyện Khí';
  }
  function maxLinhLuc(ch) {
    var RM = realmsApi();
    var bonus = (RM && typeof RM.llBonus === 'function') ? RM.llBonus(ch) : 0;
    return 40 + (ch.tier || 0) * 25 + bonus + gearStat(ch, 'll');
  }
  function ensureState(ch) {
    if (!ch) return ch;
    var max = maxLinhLuc(ch);
    if (typeof ch.ll !== 'number' || isNaN(ch.ll)) ch.ll = max;
    ch.ll = Math.max(0, Math.min(max, ch.ll));
    if (!ch.cd || typeof ch.cd !== 'object') ch.cd = {};
    return ch;
  }
  function passiveUnlocked(ch, id) {
    var def = PASSIVES[id];
    if (!ch || !def) return false;
    if (def.unlockRealm) return realmRankLazy(ch) >= def.unlockRealm;
    return (ch.tier || 0) >= def.unlockTier;
  }
  function passiveReduction(ch) {
    var r = 0;
    if (passiveUnlocked(ch, 'ho_the')) r += 0.15;
    if (passiveUnlocked(ch, 'dan_the')) r += 0.10;
    return r;
  }
  // % hồi linh lực từ hiệu ứng pháp bảo (fx.llRegenPct -> regenPct trong
  // artifacts.totalStats) — tra cứu lười, thiếu module pháp khí thì = 0.
  function artRegenPct(ch) {
    var A = null;
    if (typeof window !== 'undefined' && window.PNT_ARTIFACTS) A = window.PNT_ARTIFACTS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_ARTIFACTS) A = globalThis.PNT_ARTIFACTS;
    if (!A || typeof A.totalStats !== 'function') return 0;
    return A.totalStats(ch).regenPct || 0;
  }
  function regenRate(ch) {
    var flat = 5 * (passiveUnlocked(ch, 'tu_linh') ? 1.6 : 1) * (passiveUnlocked(ch, 'than_thuc') ? 1.3 : 1) + gearStat(ch, 'llRegen');
    var RM = realmsApi();
    if (RM && typeof RM.llRegenBonus === 'function') flat += RM.llRegenBonus(ch);
    return flat * (1 + artRegenPct(ch) / 100);
  }
  function tickState(ch, dt) {
    if (!ch) return;
    ensureState(ch);
    ch.ll = Math.min(maxLinhLuc(ch), ch.ll + regenRate(ch) * dt);
    Object.keys(ch.cd).forEach(function (id) {
      ch.cd[id] -= dt;
      if (ch.cd[id] <= 0) delete ch.cd[id];
    });
  }
  // ---------- Mở khoá ----------
  function rootSkillFor(ch) {
    if (!ch || !ch.root) return null;
    return ROOT_SKILLS[ch.root] || null;
  }
  function skillDef(id, ch) {
    var base = SKILLS[id];
    if (!base) return null;
    if (base.manual) {
      var MN0 = (typeof window !== 'undefined' && window.PNT_MANUALS) ||
        (typeof globalThis !== 'undefined' && globalThis.PNT_MANUALS) || null;
      if (MN0 && ch) { var ed0 = MN0.effectiveDef(ch, id); if (ed0) return ed0; }
      return base;
    }
    if (id !== 'thien_can') return base;
    var rs = rootSkillFor(ch);
    if (!rs) return base;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    out.name = rs.name; out.mech = rs.mech; out.mult = rs.mult; out.radius = rs.radius;
    out.range = rs.range; out.width = rs.width; out.speed = rs.speed; out.targets = rs.targets;
    out.slow = rs.slow; out.freeze = rs.freeze; out.healPct = rs.healPct; out.color = rs.color;
    out.rootDesc = rs.desc;
    return out;
  }
  function isUnlocked(ch, id) {
    if (!ch || !SKILLS[id]) return false;
    if (SKILLS[id].manual) {
      var MN1 = (typeof window !== 'undefined' && window.PNT_MANUALS) ||
        (typeof globalThis !== 'undefined' && globalThis.PNT_MANUALS) || null;
      return !!(MN1 && MN1.isLearned(ch, id));
    }
    if (SKILLS[id].unlockRealm) return realmRankLazy(ch) >= SKILLS[id].unlockRealm;
    if ((ch.tier || 0) < SKILLS[id].unlockTier) return false;
    if (id === 'thien_can' && !ch.root) return false;
    return true;
  }
  function unlockedList(ch) { return BAR.concat(BAR2).concat(api.BAR3 || []).filter(function (id) { return isUnlocked(ch, id); }); }
  function skillByKey(k) {
    if (!k || k === ' ') return null;
    var ids = Object.keys(SKILLS);
    for (var i = 0; i < ids.length; i++) {
      if (SKILLS[ids[i]].key && SKILLS[ids[i]].key.toLowerCase() === k) return ids[i];
    }
    return null;
  }
  function cdLeft(ch, id) { return (ch && ch.cd && ch.cd[id]) || 0; }
  function canCast(ch, id) {
    if (!SKILLS[id]) return { ok: false, reason: 'unknown' };
    ensureState(ch);
    if (!isUnlocked(ch, id)) return { ok: false, reason: 'locked' };
    if (cdLeft(ch, id) > 0) return { ok: false, reason: 'cd', left: cdLeft(ch, id) };
    if (ch.ll < SKILLS[id].mana) return { ok: false, reason: 'mana' };
    return { ok: true };
  }
  function applyCast(ch, id) {
    ensureState(ch);
    ch.ll -= SKILLS[id].mana;
    if (SKILLS[id].cd > 0) ch.cd[id] = SKILLS[id].cd;
    return skillDef(id, ch);
  }
  // Sát thương chiêu: (công + 4) * hệ số chiêu, dao động ±10% theo rng.
  function skillDamage(atkVal, def, rng) {
    var r = rng ? rng() : Math.random();
    return Math.max(1, Math.round((atkVal + 4) * (def.mult || 1) * (0.9 + r * 0.2)));
  }
  function needText(id) {
    if (SKILLS[id] && SKILLS[id].manual) {
      var gate = SKILLS[id].unlockRealm ? ('cảnh giới ' + realmNameOf(SKILLS[id].unlockRealm)) : ('Luyện Khí tầng ' + SKILLS[id].unlockTier);
      return 'học từ bí tịch "' + SKILLS[id].name + '" (sách trong túi đồ) — cần ' + gate;
    }
    if (SKILLS[id] && SKILLS[id].unlockRealm) return 'cảnh giới ' + realmNameOf(SKILLS[id].unlockRealm);
    return 'Luyện Khí tầng ' + SKILLS[id].unlockTier;
  }
  var api = {
    FRAMES: FRAMES, SKILLS: SKILLS, BAR: BAR, BAR2: BAR2, ROOT_SKILLS: ROOT_SKILLS, PASSIVES: PASSIVES,
    maxLinhLuc: maxLinhLuc, ensureState: ensureState, tickState: tickState,
    passiveUnlocked: passiveUnlocked, passiveReduction: passiveReduction, regenRate: regenRate,
    rootSkillFor: rootSkillFor, skillDef: skillDef, isUnlocked: isUnlocked, unlockedList: unlockedList,
    skillByKey: skillByKey, realmRankLazy: realmRankLazy, realmNameOf: realmNameOf,
    cdLeft: cdLeft, canCast: canCast, applyCast: applyCast, skillDamage: skillDamage, needText: needText
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SKILLS = api;
})();
