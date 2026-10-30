// ============================================================
// HẢO CẢM NPC — mục 10 trong docs/auto-build-queue.md (ý A4 trong
// docs/feature-ideas.md), lệnh đứng Bui 23:15 ngày 2026-10-29.
//
// MÓC TRUYỆN: hồ sơ NPC trong docs/story-bible.md đã viết rất sâu
// (quá khứ, nỗi đau riêng) mà game mới dùng một phần nhỏ; động lực
// gốc của truyện là "tu tiên để bảo vệ người dưới đất" — hảo cảm
// biến câu đó thành cơ chế: làng NHỚ người chơi, không chỉ giao
// việc cho người chơi. Điểm hảo cảm KHÔNG mua bằng Linh Thạch và
// KHÔNG sinh Linh Thạch: quà là vật phẩm farm được (đồ ăn, dược
// liệu, vật liệu thợ săn), điểm từ quà + từ việc trả nhiệm vụ cho
// chính NPC đó — nên docs/economy.md không cần sửa số nào.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/library.js / js/companion.js:
// dữ liệu + luật thuần test bằng Node, game.js chỉ nối thoại, panel,
// giảm giá shop và buff bạn đi cùng):
// - Điểm mỗi NPC: 0–100 (kẹp trần, không âm). Mốc: 0 Xa lạ · 20 Quen
//   biết · 40 Thân thiết · 70 Tri kỷ · 100 Tâm giao.
// - Tặng quà: món NPC ưa thích +10, món tặng được khác +3. Mỗi NPC
//   tối đa +20 điểm quà/ngày thật (tránh spam quà farm rẻ để cày
//   mốc trong một buổi); quá trần ngày thì từ chối KHÔNG trừ đồ.
//   Món không tặng được (vũ khí, pháp bảo, vật cốt truyện, đan hỗ
//   trợ đột phá, yêu đan, hạt giống...) bị từ chối, không trừ đồ.
//   Quà đã tặng là tiêu hao thật: trừ 1 khỏi túi đồ. Nhiệm vụ thu
//   thập không trừ vật phẩm khi trả (logic.js turnInQuest chỉ cộng
//   thưởng), nên tặng dược đã hái không phá tiến độ nhiệm vụ.
// - Trả nhiệm vụ: +8 cho chính người giao (ghi cờ quest đã tính để
//   một nhiệm vụ chỉ cộng đúng 1 lần, kể cả khi game gọi hook lặp).
// - Mốc Thân thiết (40) mở 1 câu thoại riêng của NPC đó (đọc khi nói
//   chuyện lúc không có nhiệm vụ !/? — không nuốt thoại nhiệm vụ).
// - Giảm giá shop NHỎ, chỉ ở 2 shop có giá Linh Thạch do game kiểm
//   soát: Lò rèn của Thiết Cường (tho_ren) và Tiệm pháp khí của Lý
//   lão (dai_phu): Thân thiết −5%, Tri kỷ −10%. Mua bán ngược (thu
//   mua) KHÔNG tăng giá — chỉ giảm giá mua, đúng chữ "giảm giá shop
//   nhỏ". Hàm buyWeapon/buyArtifact nhận giá đã giảm qua tham số
//   phụ, và tự chặn mọi mức giảm vượt 10% (không tin giá truyền vào).
// - Điều kiện phụ cho bạn đi cùng (mục 4): hảo cảm với ĐẠI DIỆN của
//   tông đã bái nhập từ mốc Thân thiết trở lên cho bạn đi cùng của
//   tông đó +1 công, Tri kỷ +2 công (companionBondAtk). Khóa bái
//   nhập của mục 4 KHÔNG đổi: chưa bái nhập thì không có bạn đi
//   cùng để buff, và hảo cảm làng cao KHÔNG tự mở đường chiêu mộ
//   NPC làng làm bạn đi cùng — đường đó cần mở rộng module
//   companion.js riêng (ghi rõ trong hàng chờ, không tự bịa ở đây).
// - Trạng thái nằm trong flags.aff của save (L.serialize mang theo
//   nguyên vẹn); save cũ không có trường này thì ensure() khởi tạo
//   lười. Ngày tính theo ngày UTC (floor(now/86400000)) để test
//   không phụ thuộc múi giờ máy.
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

  var MAX_POINTS = 100;
  var GIFT_LIKED = 10, GIFT_OTHER = 3, GIFT_DAILY_CAP = 20, QUEST_POINTS = 8;
  var TIERS = [
    { min: 0, name: 'Xa lạ' },
    { min: 20, name: 'Quen biết' },
    { min: 40, name: 'Thân thiết' },
    { min: 70, name: 'Tri kỷ' },
    { min: 100, name: 'Tâm giao' }
  ];
  // Dược liệu tặng được nói chung (kể cả khi không nằm trong món ưa
  // thích của NPC đó) — đồ ăn hồi HP thì tính theo ITEMS.heal > 0.
  var HERBS = ['linh_chi', 'thanh_tam_thao', 'huyet_sam', 'tu_linh_qua',
    'doc_tam_hoa', 'ngoc_tuy_chi', 'son_tinh', 'thanh_linh_tuy',
    'long_tien_thao', 'van_nien_linh_chi', 'hoa_diem_lien',
    'bang_tinh_hoa', 'thien_loi_qua', 'tinh_van_thach', 'thien_lien'];
  // Shop có giảm giá theo hảo cảm (chỉ 2 shop giá Linh Thạch do game
  // kiểm soát trực tiếp; các quầy điểm cống hiến / phiên đấu giá
  // không nằm trong luật này).
  var SHOPKEEPERS = { tho_ren: 'Lò rèn', dai_phu: 'Tiệm pháp khí' };

  // Hàng dữ liệu: [npcId, tên, món ưa thích (2 món), câu thoại riêng
  // mở ở mốc Thân thiết (40)]. Tên NPC khớp story.js (NPCS) để panel
  // và thoại không vênh nhau; tông của đại diện suy từ sects.js.
  var ROWS = [
    ['truong_lang', 'Trần Đức', ['linh_chi', 'thanh_tam_thao'],
      'Làng này nuôi ngươi từ tấm bé — nay ngươi đi xa, nhớ rằng giếng cổ vẫn sáng mỗi đêm chờ người làng về.'],
    ['chu_quan', 'Hoa nương', ['thit_tho', 'thit_ga'],
      'Quán này lúc nào cũng còn một bát cháo nóng phần ngươi — đi đâu xa, nhớ về ăn trước khi cháo nguội.'],
    ['dai_phu', 'Lý lão', ['thao_duoc', 'thanh_tam_thao'],
      'Thân thể là cái bình — ngươi giữ bình cho làng, lão giữ thuốc cho ngươi. Cần gì, cứ tới hiệu thuốc, không cần khách sáo.'],
    ['hoc_tro', 'Lý Tiểu Hạnh', ['linh_chi', 'thao_duoc'],
      'Thuốc ta giã hôm nay có phần ngươi góp — người bị thương khỏi nhanh hơn, ta cũng yên tâm hơn khi ngươi vào rừng sâu.'],
    ['tho_ren', 'Thiết Cường', ['thit_lon', 'da_soi'],
      'Kiếm ta rèn cho ngươi, lưỡi đã tôi ba lần — chém yêu mà gãy, cứ mang về đây, ta rèn lại không lấy công.'],
    ['linh_gac', 'A Hổ', ['thit_lon', 'thit_ga'],
      'Cổng này ta giữ ban ngày, ngươi giữ ban đêm trong lòng dân làng — hai ta đổi ca, làng không bao giờ hở.'],
    ['linh_gac2', 'A Báo', ['thit_tho', 'thit_ga'],
      'Ta ít nói, nhưng mắt ta nhớ mặt ngươi — về khuya mà thấy bóng ngươi qua cổng, ta mới yên tâm chợp mắt.'],
    ['tieu_thuong', 'Lục Tiểu Lục', ['tu_linh_qua', 'thit_tho'],
      'Tin tức phương bắc ta nghe được đều kể cho ngươi trước — người làng mà đi xa, phải biết đường trước người khác một bước.'],
    ['tho_san_ha', 'Hà Thiết Sơn', ['thit_lon', 'da_soi'],
      'Dấu chân Sơn Quân ta dạy ngươi đọc, nay ngươi đọc giỏi hơn cả ta — rừng này có ngươi, ta mới dám già.'],
    ['giu_mieu', 'Ngô Thị Từ', ['thanh_tam_thao', 'linh_chi'],
      'Bài khấn trấn phong ấn ta chỉ dạy người giữ làng thật sự — ngươi nghe rồi, đừng để lời khấn đứt đoạn như lửa miếu.'],
    ['thuong_nhan_ma', 'Mã Vạn Lai', ['tu_linh_qua', 'thit_lon'],
      'Chữ tín của thương đội ta đặt lên xe hàng — ngươi hộ tống một chuyến, đời ta nhớ một chuyến.'],
    ['le_su', 'Dì Tư', ['thit_tho', 'tu_linh_qua'],
      'Lễ hội làng có ngươi, đèn mới sáng đủ — năm nào ngươi vắng, ta cũng để dành một chiếc đèn phần ngươi.'],
    ['thu_thu', 'Cổ Mặc', ['linh_chi', 'ngoc_tuy_chi'],
      'Sổ mượn của các sạch là nhờ tay ngươi — sách quý của mười tông, ta yên tâm giao ngươi giữ.'],
    ['ghi_bang_su', 'Thẩm Ký', ['thanh_tam_thao', 'tu_linh_qua'],
      'Bảng mùa ta ghi tên ngươi bằng nét đậm nhất — đời tu sĩ, có tên trên bảng đã khó, giữ tên ở lại càng khó hơn.'],
    ['dau_gia_su', 'Kim Vạn Thông', ['ngoc_tuy_chi', 'tu_linh_qua'],
      'Sàn đấu giá này, người ta nhớ kẻ trả giá cao — ta thì nhớ kẻ giữ chữ tín sau khi gõ búa, như ngươi.'],
    ['de_tu_phai', 'Tạ Thanh Vân', ['linh_chi', 'thao_duoc'],
      'Thanh Phong Phái nhận ngươi làm đệ tử, nhưng giữ làng là việc ngươi chọn trước cả khi bái sư — sư huynh nể ngươi ở điểm đó.'],
    ['tong_phap', 'Liễu Ngưng Sương', ['tu_linh_qua', 'thanh_tam_thao'],
      'Pháp không từ trời rơi — ngươi hiểu được điều đó thì đài thử pháp này không còn gì để thử ngươi nữa.'],
    ['tong_khi', 'Mạc Thiết Tâm', ['huyet_sam', 'thit_lon'],
      'Sắt tốt không nói dối — tay ngươi cầm chùy đã vững, phường này nhận ngươi làm người nhà.'],
    ['tong_dan', 'Tần Dược Tử', ['ngoc_tuy_chi', 'linh_chi'],
      'Mùi dược trên tay ngươi, ta ngửi là biết người chịu khó — lò đan của Cốc luôn còn một chỗ cho ngươi.'],
    ['tong_thu', 'Giang Tiểu Thú', ['thit_tho', 'linh_chi'],
      'Thú rừng gặp ngươi mà không chạy — đó là lời thú khen người, quý hơn mọi lời người khen nhau.'],
    ['tong_phu', 'Diệp Phù Sinh', ['thanh_tam_thao', 'tu_linh_qua'],
      'Nét bùa của ngươi đã ngay — một nét ngay cứu một mạng người, ta tin bùa ngươi vẽ.'],
    ['tong_tran', 'Âu Dương Kỳ', ['thanh_linh_tuy', 'tu_linh_qua'],
      'Trận đồ trong mắt ngươi đã thành thế — đứng đúng vị trí, thiên quân cũng khó phá ngươi.'],
    ['tong_the', 'Thạch Bất Động', ['thit_lon', 'huyet_sam'],
      'Thân ngươi đứng đã như núi — Kim Cang Môn trọng người như vậy hơn trọng mọi lời hay.'],
    ['tong_doc', 'Đường Tĩnh', ['doc_tam_hoa', 'thanh_tam_thao'],
      'Chén thuốc thử của ta, ngươi uống mà tay không run — độc hay thuốc, từ nay tùy tay ngươi dùng.'],
    ['tong_am', 'Tiêu Uyển Nhi', ['thanh_tam_thao', 'linh_chi'],
      'Khúc đàn an hồn ta đàn cho người đã khuất — ngươi nghe mà lòng không loạn, cung này nhận ngươi làm tri âm.']
  ];

  function npcById(id) {
    for (var i = 0; i < ROWS.length; i++) {
      if (ROWS[i][0] !== id) continue;
      return { id: ROWS[i][0], name: ROWS[i][1], likes: ROWS[i][2].slice(), line: ROWS[i][3] };
    }
    return null;
  }
  function allNpcs() { return ROWS.map(function (r) { return npcById(r[0]); }); }
  function itemName(id) {
    if (L && L.ITEMS && L.ITEMS[id]) return L.ITEMS[id].name;
    return id;
  }
  function itemDef(id) {
    if (L && L.ITEMS) return L.ITEMS[id] || null;
    return null;
  }
  function isHerb(id) { return HERBS.indexOf(id) >= 0; }
  function isGenericGiftable(id) {
    var d = itemDef(id);
    if (!d) return false;
    if (isHerb(id)) return true;
    return !!(d.heal && d.heal > 0);
  }
  function isGiftable(npcId, itemId) {
    var npc = npcById(npcId);
    if (!npc) return false;
    if (npc.likes.indexOf(itemId) >= 0) return true;
    return isGenericGiftable(itemId);
  }
  function isLiked(npcId, itemId) {
    var npc = npcById(npcId);
    return !!npc && npc.likes.indexOf(itemId) >= 0;
  }

  // ---------- Trạng thái trong save (flags.aff) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    var a = flags.aff;
    if (!a || typeof a !== 'object') a = flags.aff = { pts: {}, day: {}, quest: {} };
    if (!a.pts || typeof a.pts !== 'object') a.pts = {};
    if (!a.day || typeof a.day !== 'object') a.day = {};
    if (!a.quest || typeof a.quest !== 'object') a.quest = {};
    return a;
  }
  function pointsOf(flags, npcId) {
    var a = ensure(flags);
    if (!a) return 0;
    var v = a.pts[npcId];
    return (typeof v === 'number' && v > 0) ? Math.min(MAX_POINTS, v) : 0;
  }
  function tierOf(points) {
    var t = TIERS[0];
    for (var i = 0; i < TIERS.length; i++) {
      if (points >= TIERS[i].min) t = TIERS[i];
    }
    return t;
  }
  function tierNameOf(points) { return tierOf(points).name; }
  function addPoints(flags, npcId, n) {
    var a = ensure(flags);
    if (!a || !npcById(npcId)) return { added: 0, points: pointsOf(flags, npcId) };
    var before = pointsOf(flags, npcId);
    var after = Math.max(0, Math.min(MAX_POINTS, before + n));
    a.pts[npcId] = after;
    return { added: after - before, points: after, tierUp: tierOf(after).min > tierOf(before).min };
  }
  function dayKey(nowMs) {
    var t = (typeof nowMs === 'number' && isFinite(nowMs)) ? nowMs : Date.now();
    return Math.floor(t / 86400000);
  }

  // ---------- Tặng quà ----------
  function invCount(ch, itemId) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === itemId) n += it.count; });
    return n;
  }
  function consumeOne(ch, itemId) {
    for (var i = 0; i < (ch.inventory || []).length; i++) {
      if (ch.inventory[i].id === itemId && ch.inventory[i].count > 0) {
        ch.inventory[i].count -= 1;
        if (ch.inventory[i].count <= 0) ch.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  function gift(ch, flags, npcId, itemId, nowMs) {
    var npc = npcById(npcId);
    if (!npc) return { ok: false, reason: 'unknown_npc' };
    if (!itemDef(itemId)) return { ok: false, reason: 'unknown_item' };
    if (!isGiftable(npcId, itemId)) return { ok: false, reason: 'not_giftable', itemName: itemName(itemId) };
    if (!ch || invCount(ch, itemId) <= 0) return { ok: false, reason: 'missing', itemName: itemName(itemId) };
    var a = ensure(flags);
    if (!a) return { ok: false, reason: 'nosave' };
    var key = npcId + ':' + dayKey(nowMs);
    var dayPts = a.day[key] || 0;
    if (dayPts >= GIFT_DAILY_CAP) return { ok: false, reason: 'daily_cap', itemName: itemName(itemId) };
    var liked = isLiked(npcId, itemId);
    var gain = Math.min(liked ? GIFT_LIKED : GIFT_OTHER, GIFT_DAILY_CAP - dayPts);
    if (!consumeOne(ch, itemId)) return { ok: false, reason: 'missing', itemName: itemName(itemId) };
    a.day[key] = dayPts + gain;
    var r = addPoints(flags, npcId, gain);
    return { ok: true, liked: liked, gain: r.added, points: r.points,
      tier: tierOf(r.points), tierUp: r.tierUp, npc: npc, itemName: itemName(itemId) };
  }
  // Quà tặng được cho 1 NPC từ túi hiện tại: món ưa thích xếp trước,
  // món tặng được khác xếp sau; mỗi món kèm số lượng đang có.
  function giftableFor(npcId, ch) {
    var npc = npcById(npcId);
    if (!npc || !ch) return [];
    var seen = {}, out = [];
    (ch.inventory || []).forEach(function (it) {
      if (seen[it.id] || it.count <= 0) return;
      if (!isGiftable(npcId, it.id)) return;
      seen[it.id] = true;
      out.push({ id: it.id, name: itemName(it.id), count: invCount(ch, it.id), liked: isLiked(npcId, it.id) });
    });
    out.sort(function (x, y) { return (y.liked - x.liked) || (x.name < y.name ? -1 : 1); });
    return out;
  }

  // ---------- Trả nhiệm vụ: +8 cho chính người giao, đúng 1 lần/NV ----------
  function onQuestTurnIn(flags, qid, giverId) {
    var a = ensure(flags);
    if (!a || !npcById(giverId)) return { added: 0, points: 0 };
    if (a.quest[qid]) return { added: 0, points: pointsOf(flags, giverId) };
    a.quest[qid] = giverId;
    var r = addPoints(flags, giverId, QUEST_POINTS);
    return { added: r.added, points: r.points, tierUp: r.tierUp, npc: npcById(giverId) };
  }

  // ---------- Thoại riêng ở mốc Thân thiết ----------
  // marker: dấu !/? của NPC lúc nói chuyện — có nhiệm vụ thì thoại
  // nhiệm vụ thắng, hảo cảm không chen vào.
  function dialogueFor(npcId, flags, marker) {
    var npc = npcById(npcId);
    if (!npc) return null;
    if (marker === '!' || marker === '?') return null;
    if (pointsOf(flags, npcId) < 40) return null;
    return [npc.line];
  }

  // ---------- Giảm giá shop + buff bạn đi cùng ----------
  function discountPct(npcId, flags) {
    if (!SHOPKEEPERS[npcId]) return 0;
    var p = pointsOf(flags, npcId);
    if (p >= 70) return 10;
    if (p >= 40) return 5;
    return 0;
  }
  function discountPrice(npcId, flags, price) {
    var pct = discountPct(npcId, flags);
    if (!pct) return price;
    return Math.max(1, Math.round(price * (100 - pct) / 100));
  }
  function repIdOfSect(sectId) {
    if (SECT && SECT.sectById) {
      var s = SECT.sectById(sectId);
      if (s) return s.rep;
    }
    return null;
  }
  // Bạn đi cùng của tông đó mạnh thêm nhờ hảo cảm với đại diện tông:
  // Thân thiết +1 công, Tri kỷ +2 công. Chưa bái nhập thì không có
  // bạn đi cùng nên buff bằng 0 — khóa mục 4 giữ nguyên.
  function companionBondAtk(flags, sectId) {
    if (!flags || !flags.sectJoined || !sectId || flags.sectJoined !== sectId) return 0;
    var rep = repIdOfSect(sectId);
    if (!rep) return 0;
    var p = pointsOf(flags, rep);
    if (p >= 70) return 2;
    if (p >= 40) return 1;
    return 0;
  }
  function listAll(flags) {
    return allNpcs().map(function (npc) {
      var pts = pointsOf(flags, npc.id);
      return { id: npc.id, name: npc.name, points: pts, tier: tierOf(pts),
        likes: npc.likes.map(function (id) { return { id: id, name: itemName(id) }; }),
        line: npc.line, shop: SHOPKEEPERS[npc.id] || null };
    }).sort(function (a, b) { return b.points - a.points || (a.name < b.name ? -1 : 1); });
  }

  var api = { MAX_POINTS: MAX_POINTS, GIFT_LIKED: GIFT_LIKED, GIFT_OTHER: GIFT_OTHER,
    GIFT_DAILY_CAP: GIFT_DAILY_CAP, QUEST_POINTS: QUEST_POINTS, TIERS: TIERS,
    HERBS: HERBS, SHOPKEEPERS: SHOPKEEPERS,
    npcById: npcById, allNpcs: allNpcs, itemName: itemName,
    isGiftable: isGiftable, isLiked: isLiked, giftableFor: giftableFor,
    ensure: ensure, pointsOf: pointsOf, tierOf: tierOf, tierNameOf: tierNameOf,
    addPoints: addPoints, gift: gift, onQuestTurnIn: onQuestTurnIn,
    dialogueFor: dialogueFor, discountPct: discountPct, discountPrice: discountPrice,
    repIdOfSect: repIdOfSect, companionBondAtk: companionBondAtk, listAll: listAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_AFFINITY = api;
})(typeof window !== 'undefined' ? window : globalThis);
