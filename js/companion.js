// ============================================================
// ĐẠO LỮ / ĐỆ TỬ ĐỒNG HÀNH — mục 4 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: sau lễ bái sư (chương 12, q_chinh_18), người chơi là đệ
// tử chính thức của đúng 1 tông — và tông đó cử 1 đệ tử đồng môn đi
// cùng trên đường tu hành (mạch Thiên 3–4: đồng tu, không phải tôi tớ).
// Đồng hành là NGƯỜI, không phải linh thú: dùng đúng sheet NPC của đại
// diện tông đó (assets/npcs-ai, npc-ai.js) — không vẽ mới, không dùng
// emoji hay khối màu thay hình. Tên 10 đệ tử đồng hành là ĐỀ XUẤT,
// chờ Bui chốt như mọi tên riêng của arc 9–12 (xem docs/story-bible
// mục 19 + mục 32).
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/auction.js / js/pets.js:
// dữ liệu + luật thuần test bằng Node, game.js chỉ nối panel, bám
// theo, đánh phụ và vẽ bằng sheet NPC có sẵn):
// - Chiêu mộ: CHỈ khi đã bái nhập tông (flags.sectJoined) — nói chuyện
//   với đại diện của chính tông đó ở bãi tuyển map 3, bấm "Mời đồng
//   hành". Mỗi tông đúng 1 đệ tử; người chơi chỉ bái nhập được 1 tông
//   nên cũng chỉ có tối đa 1 đồng hành — không có chuyện đổi tông để
//   gom đủ 10 người. Đường "NPC làng hảo cảm cao" CHƯA mở: hệ hảo cảm
//   là mục 10 trong hàng chờ, chưa làm — khi mục 10 xong mới nối thêm
//   đường đó, không tự bịa điểm hảo cảm ở đây.
// - Đi cùng: đồng hành bám theo sau-lệch bên chủ (không đè lên linh
//   thú: linh thú bám sau lưng, đồng hành bám sau-lệch bên), xa quá
//   420px thì tự về cạnh chủ (không lạc, như linh thú). Đồng hành ĐI
//   BỘ trên đất mọi lúc — kể cả khi chủ ngự kiếm bay, đồng hành vẫn
//   đi bộ dưới đất (không có chế độ bay riêng, đúng 3 lệnh cứng: chân
//   chạm đất, bộ phận liền khối, bay chỉ 3 chế độ ngự của CHỦ).
// - Đánh phụ, KHÔNG mở combat: đồng hành CHỈ đánh quái ĐÃ bị thương
//   (chủ hoặc linh thú đã đánh vào) trong tầm ngửi quanh chủ. Quái
//   chưa ai động vào thì đồng hành chỉ đi theo, không tự lao vào —
//   khác linh thú ở đúng điểm này, để đồng hành không biến thành máy
//   farm thứ hai. Quái bị đồng hành hạ vẫn đi qua đường thưởng hạ quái
//   bình thường của game (như linh thú đánh phụ) — đồng hành KHÔNG
//   tạo nguồn Linh Thạch mới, không thưởng riêng, không phá thang
//   docs/economy.md (xem mục 32 story-bible).
// - Chỉ số co theo tầng người chơi (ch.tier 0–9), không lưu cấp riêng:
//   HP tối đa = 90 + 20×tầng; công = 7 + 2×tầng. Ở tầng 0: 90 HP / 7
//   công (dưới người chơi 120 HP / 9 công gốc, chưa tính vũ khí) —
//   đồng hành là người hỗ trợ, không mạnh hơn chủ. Vai trò theo đường
//   tu của tông: cận chiến / đánh xa / đỡ đòn / hỗ trợ (hồi máu).
// - Gục: quái đánh trả theo nhịp đòn của đồng hành (đỡ đòn chịu trả
//   thường xuyên hơn, như linh thú). Gục thì nằm yên tại chỗ, không
//   đánh nữa; về làng (map 1) thì hồi đầy nếu còn sống, 50% nếu đã
//   gục (cùng luật với linh thú). Không chết hẳn, không mất đồng hành.
// - Trạng thái nằm trong flags.companion của save (L.serialize mang
//   theo nguyên vẹn); save cũ không có trường này thì ensure() khởi
//   tạo lười. Chỉ lưu HP hiện tại + số quái đã phụ hạ + cờ đang đi
//   cùng; mọi chỉ số khác suy ra từ tầng người chơi nên lên tầng là
//   đồng hành mạnh lên ngay, không cần "nâng cấp" riêng.
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

  // Hàng dữ liệu: [sectId, tên đệ tử, vai trò, tên chiêu, loại chiêu,
  //   câu mời đi cùng, câu nói khi đi đường].
  // Loại chiêu theo mẫu pets.js: power = đòn mạnh cận chiến,
  // bolt = đánh xa theo hệ tông, heal = hồi máu cho chủ,
  // stun = đòn kèm làm choáng quái.
  var ROWS = [
    ['thanh_phong', 'Trần Vân Phi', 'melee', 'Thanh Phong Kiếm', 'power',
      'Sư huynh, đệ theo người giữ đường — kiếm này chỉ chắn trước người yếu, như tôn chỉ của phái.',
      'Đi sau người một bước, đệ nhìn đường cho người.'],
    ['huyen_phap', 'Tô Nguyệt Dao', 'ranged', 'Ngũ Hành Pháp', 'bolt',
      'Pháp tùy tâm chuyển. Tâm người vững, pháp của ta mới trúng.',
      'Đừng vội — một pháp trúng đích hơn mười pháp hụt.'],
    ['thien_cong', 'Cố Thiết Ngưu', 'tank', 'Thiên Công Chùy', 'power',
      'Chùy này rèn từ lò phường — đứng trước người, đệ chịu đòn.',
      'Khí do tay người rèn, đạo do tâm giữ.'],
    ['dan_ha', 'Hứa Linh Chi', 'support', 'Hồi Xuân Đan Khí', 'heal',
      'Một lò đan tốt cứu người trước, cầu đạo sau — đệ đi cùng để có người lo thuốc thang.',
      'Mệt thì nói một tiếng, đan của đệ còn ấm.'],
    ['van_thu', 'Đỗ Tiểu Thú', 'melee', 'Vạn Thú Trảo', 'power',
      'Thú cũng là bạn, núi cũng là nhà — đệ đánh cùng người, không để người đơn độc giữa rừng.',
      'Nghe tiếng rừng chưa? Có thú lạ tới gần đấy.'],
    ['thien_phu', 'Chu Sa Nhi', 'ranged', 'Trấn Tà Phù', 'stun',
      'Một nét bùa ngay, trấn tà an dân — đệ đi cùng, bùa đệ giữ chân địch cho người ra tay.',
      'Giấy vàng còn, chu sa còn — địch chưa tới gần được đâu.'],
    ['cuu_cung', 'Bạch Kỳ Sinh', 'support', 'Cửu Cung Khốn', 'stun',
      'Một trận bày ra, thiên quân khó phá — đệ đi cùng, trận đệ giữ chân địch cho người.',
      'Đứng đúng vị trí, trận tự lo phần còn lại.'],
    ['kim_cang', 'Ngưu Đại Lực', 'tank', 'Kim Cang Quyền', 'power',
      'Thân này là pháp bảo đầu tiên — đệ đứng đầu gió, người cứ đánh.',
      'Đệ ăn khỏe, đứng chắn khỏe hơn.'],
    ['ngu_doc', 'Miêu Thanh Thanh', 'ranged', 'Ngũ Độc Châm', 'bolt',
      'Độc cũng là thuốc, tùy tay người dùng — châm của đệ chỉ chĩa vào kẻ hại người.',
      'Châm đã tẩm sẵn, đừng chạm vào túi thuốc của đệ.'],
    ['huyen_am', 'Cầm Tâm Nhi', 'support', 'Huyền Âm An Hồn', 'heal',
      'Một khúc đàn hay an được cả người sống — đệ đi cùng, đàn đệ giữ tâm người tĩnh.',
      'Nghe một khúc rồi hãy đánh tiếp, tâm tĩnh thì tay mới chuẩn.']
  ];
  var ROLE_NAMES = { melee: 'Cận chiến', ranged: 'Đánh xa', tank: 'Đỡ đòn', support: 'Hỗ trợ' };
  var VIEW = { followDist: 52, catchupDist: 420, aggroRange: 250, rangeMelee: 52, rangeRanged: 150, atkInterval: 1.1, skillCd: 6 };

  function sectOf(id) {
    if (SECT && SECT.sectById) return SECT.sectById(id);
    return null;
  }
  // Định nghĩa đầy đủ của 1 đồng hành: ghép dữ liệu hàng + dữ liệu tông
  // (tên tông, màu, ấn ký, sprite đại diện) từ js/sects.js.
  function companionOf(sectId) {
    for (var i = 0; i < ROWS.length; i++) {
      if (ROWS[i][0] !== sectId) continue;
      var s = sectOf(sectId);
      return {
        sectId: sectId, name: ROWS[i][1], role: ROWS[i][2],
        roleName: ROLE_NAMES[ROWS[i][2]] || ROWS[i][2],
        skill: { name: ROWS[i][3], kind: ROWS[i][4] },
        recruitLine: ROWS[i][5], idleLine: ROWS[i][6],
        sectName: s ? s.name : sectId, sectPath: s ? s.path : '',
        sectColor: s ? s.color : '#888888', sectSigil: s ? s.sigil : '',
        sprite: s ? s.rep : 'de_tu_phai', repName: s ? s.repName : ''
      };
    }
    return null;
  }
  function allCompanions() {
    return ROWS.map(function (r) { return companionOf(r[0]); });
  }

  // ---------- Trạng thái trong save (flags.companion) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    var c = flags.companion;
    if (!c || typeof c !== 'object') {
      c = flags.companion = { sectId: null, active: false, hp: null, kills: 0 };
    }
    if (typeof c.kills !== 'number') c.kills = 0;
    if (typeof c.active !== 'boolean') c.active = false;
    return c;
  }
  function recruitedCompanion(flags) {
    var c = ensure(flags);
    return c && c.sectId ? companionOf(c.sectId) : null;
  }
  function activeCompanion(flags) {
    var c = ensure(flags);
    if (!c || !c.active || !c.sectId) return null;
    return companionOf(c.sectId);
  }
  function isDowned(flags) {
    var c = ensure(flags);
    return !!c && c.sectId && typeof c.hp === 'number' && c.hp <= 0;
  }

  // ---------- Chiêu mộ / gọi lại / cho nghỉ ----------
  // Điều kiện duy nhất: đã bái nhập tông (flags.sectJoined). Chưa bái
  // nhập thì đại diện tông chưa phải "người của mình" — không mời được.
  function canRecruit(flags) {
    var c = ensure(flags);
    if (!c) return { ok: false, reason: 'nosave' };
    if (c.sectId) return { ok: false, reason: 'already', companion: companionOf(c.sectId) };
    if (!flags.sectJoined) return { ok: false, reason: 'no_sect',
      needText: 'Chỉ đệ tử đã bái nhập tông mới có đồng môn đi cùng — hãy làm lễ chọn tông (chương 12) rồi quay lại gặp đại diện tông của mình.' };
    var def = companionOf(flags.sectJoined);
    if (!def) return { ok: false, reason: 'no_sect' };
    return { ok: true, companion: def };
  }
  function recruit(flags, ch) {
    var c = ensure(flags);
    var cr = canRecruit(flags);
    if (!cr.ok) return cr;
    c.sectId = flags.sectJoined;
    c.active = true;
    c.hp = maxHpOf(ch);
    c.kills = 0;
    return { ok: true, companion: cr.companion };
  }
  // Gọi lại (đi cùng) / cho nghỉ (ở lại bãi tuyển): chỉ đổi cờ active,
  // không mất người, không mất HP hiện tại.
  function setActive(flags, active) {
    var c = ensure(flags);
    if (!c || !c.sectId) return { ok: false, reason: 'none' };
    c.active = !!active;
    if (c.active && (c.hp === null || c.hp === undefined)) c.hp = 0;
    return { ok: true, companion: companionOf(c.sectId), active: c.active };
  }
  // Đại diện tông nào thì nút "Mời đồng hành" hiện ở thoại của người đó:
  // đúng đại diện của tông người chơi ĐÃ bái nhập, và chưa chiêu mộ ai.
  function recruitButtonFor(npcId, flags) {
    if (!flags || !flags.sectJoined) return null;
    var s = sectOf(flags.sectJoined);
    if (!s || s.rep !== npcId) return null;
    var c = ensure(flags);
    if (c && c.sectId) return null;
    return companionOf(flags.sectJoined);
  }

  // ---------- Chỉ số co theo tầng người chơi ----------
  function tierOf(ch) { return ch ? (ch.tier | 0) : 0; }
  function maxHpOf(ch) { return 90 + 20 * tierOf(ch); }
  function atkOf(ch) { return 7 + 2 * tierOf(ch); }
  function attackDamage(ch, rng) {
    var rand = rng || Math.random;
    return Math.max(1, Math.round(atkOf(ch) * (0.8 + rand() * 0.4)));
  }
  function skillDamage(ch, kind, rng) {
    var rand = rng || Math.random;
    var mult = kind === 'bolt' ? 1.5 : (kind === 'stun' ? 1.1 : 1.6);
    return Math.max(1, Math.round(atkOf(ch) * mult * (0.9 + rand() * 0.2)));
  }
  function skillHeal(ch) { return Math.max(8, Math.round(maxHpOf(ch) * 0.12)); }
  function damageCompanion(flags, ch, dmg) {
    var c = ensure(flags);
    if (!c || !c.sectId) return { downed: false, hp: 0 };
    if (c.hp === null || c.hp === undefined) c.hp = maxHpOf(ch);
    c.hp = Math.max(0, c.hp - Math.max(0, Math.round(dmg || 0)));
    return { downed: c.hp <= 0, hp: c.hp };
  }
  function noteKill(flags) {
    var c = ensure(flags);
    if (c) c.kills += 1;
    return c ? c.kills : 0;
  }
  // Về làng (map 1): thú gục hồi 50%, thú sống hồi đầy — đồng hành cùng
  // luật (xem pets.restAtVillage).
  function restAtVillage(flags, ch) {
    var c = ensure(flags);
    if (!c || !c.sectId) return 0;
    var max = maxHpOf(ch);
    c.hp = (c.hp !== null && c.hp <= 0) ? Math.round(max * 0.5) : max;
    return 1;
  }

  // ---------- Chọn mục tiêu đánh phụ (logic thuần, cho test + game) ----------
  // monsters: [{ hp, maxHp, x, y }] với x/y tính bằng PIXEL (game.js đổi
  // từ ô qua petTargetPos trước khi gọi). CHỈ quái đã bị thương mới là
  // mục tiêu hợp lệ — quái nguyên máu thì đồng hành không tự mở combat.
  // Trong số quái đã thương, ưu tiên quái gần CHỦ nhất trong tầm ngửi.
  function pickTarget(monsters, px, py, cx, cy) {
    var best = null, bestD = 1e9;
    (monsters || []).forEach(function (m) {
      if (!m || m.hp <= 0 || m.dying) return;
      if (m.hp >= (m.maxHp || m.hp)) return; // chưa ai động vào -> không đánh
      var dd = Math.sqrt((m.x - px) * (m.x - px) + (m.y - py) * (m.y - py));
      if (dd > VIEW.aggroRange + 60) return;
      if (dd < bestD) { bestD = dd; best = m; }
    });
    return best;
  }
  function rangeOf(comp) {
    if (!comp) return VIEW.rangeMelee;
    return (comp.role === 'ranged' || comp.role === 'support') ? VIEW.rangeRanged : VIEW.rangeMelee;
  }

  var api = { ROWS: ROWS, ROLE_NAMES: ROLE_NAMES, VIEW: VIEW,
    companionOf: companionOf, allCompanions: allCompanions,
    ensure: ensure, recruitedCompanion: recruitedCompanion,
    activeCompanion: activeCompanion, isDowned: isDowned,
    canRecruit: canRecruit, recruit: recruit, setActive: setActive,
    recruitButtonFor: recruitButtonFor,
    tierOf: tierOf, maxHpOf: maxHpOf, atkOf: atkOf,
    attackDamage: attackDamage, skillDamage: skillDamage, skillHeal: skillHeal,
    damageCompanion: damageCompanion, noteKill: noteKill,
    restAtVillage: restAtVillage, pickTarget: pickTarget, rangeOf: rangeOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_COMPANION = api;
})(typeof window !== 'undefined' ? window : globalThis);
