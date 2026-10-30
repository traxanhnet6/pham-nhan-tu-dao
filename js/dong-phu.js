// ============================================================
// ĐỘNG PHỦ CÁ NHÂN + LINH ĐIỀN DƯỢC VIÊN (gộp ý B1 + B2 trong
// docs/feature-ideas.md, Bui duyệt "thêm tất cả" 22:31 ngày 2026-10-29;
// ĐỔI THIẾT KẾ 22:53–22:56 ngày 2026-10-29 — xem story-bible mục 28).
//
// CẤP PHỦ THEO TÔNG MÔN (Bui 22:53): BỎ hẳn cơ chế mua Quyền Động Phủ
// 500 LT ở cửa đá. Từ nay TÔNG MÔN CẤP động phủ cho đệ tử: bái sư xong
// (flags.sectJoined có) là ensure() tự cấp phủ cấp 1 (cờ justGranted để
// game.js báo "đại diện tông trao Lệnh Bài Động Phủ" đúng 1 lần). Chưa
// bái sư thì cửa đá báo rõ "động phủ do tông môn cấp cho đệ tử — hãy
// bái nhập một tông môn". Save cũ ĐÃ MUA quyền theo cơ chế cũ: giữ
// nguyên quyền + cấp phủ (grantVia = 'legacy', không thu hồi, không
// cần bái sư mới vào được). Phủ mang DẤU ẤN TÔNG đã nhập: tên hiển thị
// "Động Phủ — Đệ tử <tên tông>", phướn màu tông + biển ấn ký + vật
// trang trí riêng theo tông trong phủ (decorFor/decorProps). NÂNG CẤP
// gắn thêm CẤP BẬC CỐNG HIẾN (js/sect-points.js): cấp 2 cần Nội Môn
// Đệ Tử (tổng 100 điểm), cấp 3 cần Đệ Tử Chân Truyền (tổng 300 điểm)
// — giá Linh Thạch + nguyên liệu giữ nguyên như cũ.
//
// INSTANCE RIÊNG THEO NHÂN VẬT (Bui 22:55): động phủ là 1 MAP RIÊNG
// cho mỗi người chơi — instance khoá theo ID NHÂN VẬT
// (ownerKey = "<tài khoản>::<tên nhân vật>", instanceId suy ra tất
// định từ ownerKey). Trạng thái runtime (cây đang trồng, trang trí
// tông, cấp phủ) nạp từ save của ĐÚNG nhân vật đang chơi: đổi tài
// khoản/nhân vật trên cùng máy thì vào đúng phủ của nhân vật đó,
// stateFor() trả null nếu ownerKey không khớp (không bao giờ lộ trạng
// thái phủ của nhân vật khác). Phủ là KHÔNG GIAN RIÊNG TƯ: khi online
// (khung js/net.js) người chơi khác KHÔNG vào được, KHÔNG thấy nhau
// trong phủ — kênh realtime của map 'dong_phu' phải key theo
// instanceId của bản thân (điểm nối ghi ở docs/multiplayer-design.md),
// đường vào luôn route về instance của chính mình.
//
// KHÁCH THĂM THEO LỜI MỜI (Bui 22:56): ngoại lệ duy nhất của riêng
// tư — CHỦ PHỦ MỜI (invite, gắn với ownerKey của khách, hạn 24 giờ)
// và khách CHẤP NHẬN (acceptInvite) mới vào thăm được instance của
// chủ (enterAsGuest). Chủ thu hồi bất cứ lúc nào (revokeInvite): lời
// mời biến mất, khách đang ở trong bị mất tư cách ngay
// (guestSessionValid = false — game loop/online dùng để đưa khách
// ra). KHÁCH CHỈ ĐƯỢC NGẮM: mọi tương tác tài sản của chủ bị chặn Ở
// TẦNG LOGIC bằng actorKey (plant/water/harvest/upgrade trả reason
// 'guest'; cultGainBase không nhân hệ số trận, restHeal = 0 cho
// khách) — không chỉ ẩn nút. Đợt này cài cơ chế ở tầng dữ liệu +
// luồng local (test mô phỏng khách bằng nhân vật thứ hai cùng máy);
// khi P1/P2 online vào, lời mời đi qua kênh bạn bè/realtime của
// net.js, các hàm API dưới đây giữ nguyên ký danh.
//
// TRONG PHỦ CÓ: đài TỤ LINH TRẬN (vùng 'Q'): đứng trong trận mà thổ
// nạp thì tu vi nhân hệ số theo cấp phủ (x1,5 / x2,0 / x2,5), áp đúng
// cả nút Thổ nạp lẫn Tự thổ nạp, tích lũy phần dư phân số nên trung
// bình dài hạn khớp hệ số tuyệt đối. Giường đá: thiền ở BẤT CỨ đâu
// trong phủ hồi thêm 10% HP tối đa mỗi lần thổ nạp (restHeal). LINH
// ĐIỀN: tối đa 12 ô 'C', mở theo cấp phủ (6/9/12), trồng linh dược
// của js/alchemy.js bằng HẠT GIỐNG 'hat_<dược>' (mua bằng Linh Thạch
// tại panel phủ hoặc rơi 12% khi hái hoang cùng loài), lớn theo GIỜ
// THẬT theo timestamp (30 phút – 12 giờ), tưới 1 lần giảm 30% thời
// gian còn lại, thu 1 ô = 2 dược. Sơn Tinh KHÔNG trồng được (tinh hoa
// núi kết trăm năm, chỉ mọc hoang). Chống lùi giờ: thao tác đi qua
// effNow = max(now, lastSeen), hàm đọc dùng peekNow chỉ kẹp không
// ghi. RƯƠNG CHỨA ĐỒ PHỤ: cắt gọn có chủ đích (túi chưa giới hạn ô).
//
// NỀN + LƯỚI (Việc "tạo hình thật đẹp", Bui 22:53): phủ có nền AI
// THẬT assets/dong-phu-bg.png (704×480 = 22×15 ô × 32px, sinh theo
// đúng bố cục: đài trận bắc-trung, giường đá tây-bắc, 2 đèn đá, linh
// điền tây-nam, hồ linh khí + thác đông-nam, cửa đá nam-trung, kệ
// dược dọc vách tây). Lưới logic CHỈNH THEO TRANH (ước lượng như các
// map v7 của dự án): đài trận cols 8–14 rows 2–4, giường đá cols 5–7
// rows 3–4, kệ dược 'S' cols 2–3 rows 4–11, hồ 'R' cols 16–19 rows
// 10–12, điền cols 4–9 rows 10–11, đèn 'L' (4,2) + (18,2).
// Điểm vào/ra giữ nguyên: CỬA ĐÁ sau giếng cổ map 1 (ô 24,7) — phủ
// nằm trong mạch núi sau làng, tông đã đăng ký cho đệ tử; điểm về là
// VỊ TRÍ THẬT lúc bước vào (flags.dp.returnTo). Đang có run bí cảnh
// (flags.sr.run) thì canEnter trả 'in_realm'.
//
// Trạng thái: flags.dp = { owned, level, plots[12], returnTo,
// lastSeen, cultFrac, ownerKey, grantedBy, grantVia, justGranted,
// invites } — ensure() khởi tạo lười, save cũ nạp được. Mọi hàm thời
// gian nhận `now` (ms) để test giả lập được; game.js truyền Date.now().
// ============================================================
(function (global) {
  'use strict';
  var L = null, M = null, SECTM = null, SP = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { M = require('./maps.js'); } catch (e) { M = null; }
    try { SECTM = require('./sects.js'); } catch (e) { SECTM = null; }
    try { SP = require('./sect-points.js'); } catch (e) { SP = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    M = global.PNT_MAPS || null;
  }
  // sects.js / sect-points.js: tra cứu LƯỜI mỗi lần gọi (thứ tự nạp
  // script thay đổi cũng không vỡ; Node test require trực tiếp ở trên).
  function sectsApi() {
    if (SECTM) return SECTM;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_SECTS) return globalThis.PNT_SECTS;
    if (typeof window !== 'undefined' && window.PNT_SECTS) return window.PNT_SECTS;
    return null;
  }
  function sectPointsApi() {
    if (SP) return SP;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_SECT) return globalThis.PNT_SECT;
    if (typeof window !== 'undefined' && window.PNT_SECT) return window.PNT_SECT;
    return null;
  }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }

  // ---------- Hằng số thiết kế ----------
  var MAP_ID = 'dong_phu';
  var GATE_MAP = 'map1';
  var GATE = { x: 48, y: 45 };            // cửa đá sau giếng cổ, sân trấn map 1 (V3: + neo V3 map1 (12,30) trên số V10)
  var START = { x: 11, y: 12 };          // điểm rơi trong phủ
  var EXIT_TILE = { x: 11, y: 13 };      // ô cửa ra trong phủ
  var ARRAY_RECT = { x0: 8, y0: 2, x1: 14, y1: 4 }; // đài Tụ Linh Trận (theo tranh nền)
  var HARVEST_YIELD = 2;                 // 1 ô chín thu được 2 dược
  var WATER_CUT = 0.30;                  // tưới: giảm 30% thời gian còn lại
  var WILD_SEED_CHANCE = 0.12;           // hái hoang rơi hạt cùng loài
  var REST_HEAL_PCT = 10;                // thiền trong phủ hồi % HP tối đa
  var INVITE_TTL_MS = 24 * 60 * 60 * 1000; // lời mời khách thăm: hạn 24 giờ thật
  var MAX_INVITES = 8;                   // tối đa lời mời đang hiệu lực mỗi phủ

  // Cấp phủ: plots = số ô điền mở, mult = hệ số Tụ Linh Trận.
  // upPrice/upMats = chi phí nâng LÊN cấp đó (giữ nguyên thang cũ);
  // needRank = idx cấp bậc cống hiến tối thiểu (PNT_SECT.rankOf):
  // cấp 2 cần Nội Môn (idx 1, tổng 100đ), cấp 3 cần Chân Truyền
  // (idx 2, tổng 300đ). Cấp 1 do tông cấp thẳng khi bái sư.
  var LEVELS = [
    { level: 1, plots: 6, mult: 1.5, upPrice: 0, upMats: {}, needRank: 0, needRankName: '' },
    { level: 2, plots: 9, mult: 2.0, upPrice: 800, upMats: { linh_chi: 5 }, needRank: 1, needRankName: 'Nội Môn Đệ Tử' },
    { level: 3, plots: 12, mult: 2.5, upPrice: 2000, upMats: { tinh_van_thach: 2, thanh_linh_tuy: 1 }, needRank: 2, needRankName: 'Đệ Tử Chân Truyền' }
  ];
  function levelDef(level) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].level === level) return LEVELS[i];
    return LEVELS[0];
  }
  function rankIdxOf(ch) {
    var sp = sectPointsApi();
    if (!sp || !ch || typeof sp.rankOf !== 'function') return -1; // -1: không có module điểm -> không áp cổng (không khóa cứng oan)
    return sp.rankOf(ch).idx;
  }

  // Hạt giống theo dược của js/alchemy.js: giá Linh Thạch + giờ thật để
  // chín (growMs). Dược càng quý hạt càng đắt, chín càng lâu.
  var MIN = 60 * 1000, HOUR = 60 * MIN;
  var SEEDS = {
    hat_thao_duoc: { id: 'hat_thao_duoc', herb: 'thao_duoc', price: 5, growMs: 30 * MIN },
    hat_thanh_tam_thao: { id: 'hat_thanh_tam_thao', herb: 'thanh_tam_thao', price: 8, growMs: 45 * MIN },
    hat_linh_chi: { id: 'hat_linh_chi', herb: 'linh_chi', price: 30, growMs: 2 * HOUR },
    hat_tu_linh_qua: { id: 'hat_tu_linh_qua', herb: 'tu_linh_qua', price: 45, growMs: 3 * HOUR },
    hat_huyet_sam: { id: 'hat_huyet_sam', herb: 'huyet_sam', price: 60, growMs: 4 * HOUR },
    hat_doc_tam_hoa: { id: 'hat_doc_tam_hoa', herb: 'doc_tam_hoa', price: 80, growMs: 4 * HOUR },
    hat_ngoc_tuy_chi: { id: 'hat_ngoc_tuy_chi', herb: 'ngoc_tuy_chi', price: 150, growMs: 8 * HOUR },
    hat_thanh_linh_tuy: { id: 'hat_thanh_linh_tuy', herb: 'thanh_linh_tuy', price: 200, growMs: 12 * HOUR },
    // Hạt Lúa Linh (mục 21 hàng chờ): chỉ có từ kỳ ngộ nguồn gốc NV06,
    // gieo theo đúng luật hạt giống sẵn có nhưng KHÔNG bán ở cửa phủ
    // (noShop) — game.js lọc khỏi danh sách mua, buySeed chặn mua.
    hat_lua_linh: { id: 'hat_lua_linh', herb: 'lua_linh', price: 0, growMs: 2 * HOUR, noShop: true }
  };
  function seedOfHerb(herbId) {
    var ids = Object.keys(SEEDS);
    for (var i = 0; i < ids.length; i++) if (SEEDS[ids[i]].herb === herbId) return SEEDS[ids[i]];
    return null;
  }

  // ---------- Map instance của động phủ (22 x 15, lưới theo tranh nền AI) ----------
  function grid(w, h, fill) {
    var rows = [], y, x, r;
    for (y = 0; y < h; y++) { r = ''; for (x = 0; x < w; x++) r += fill; rows.push(r); }
    return rows;
  }
  function rect(rows, x0, y0, x1, y1, ch) {
    for (var y = y0; y <= y1; y++) {
      var r = rows[y].split('');
      for (var x = x0; x <= x1; x++) r[x] = ch;
      rows[y] = r.join('');
    }
    return rows;
  }
  // Ô điền theo thứ tự mở khóa: hàng bắc (y10) trước, hàng nam (y11) sau.
  var PLOT_TILES = [];
  [10, 11].forEach(function (yy) { for (var xx = 4; xx <= 9; xx++) PLOT_TILES.push({ x: xx, y: yy }); });
  var BLOCKED = { W: true, H: true, T: true, S: true, L: true, F: true, o: true, E: true, R: true };
  var rowsP = grid(22, 15, 'W');
  rect(rowsP, 1, 1, 20, 13, '.');                       // sàn đá trong hang
  rect(rowsP, ARRAY_RECT.x0, ARRAY_RECT.y0, ARRAY_RECT.x1, ARRAY_RECT.y1, 'Q'); // đài Tụ Linh Trận
  rect(rowsP, 4, 10, 9, 11, 'C');                       // linh điền 12 ô (tây-nam, theo tranh)
  rect(rowsP, 16, 10, 19, 12, 'R');                     // hồ linh khí đông-nam (theo tranh)
  rect(rowsP, 5, 3, 7, 4, 'o');                         // giường đá tây-bắc (theo tranh)
  rect(rowsP, 2, 4, 3, 11, 'S');                        // kệ dược dọc vách tây (theo tranh)
  (function () { var r = rowsP[2].split(''); r[4] = 'L'; r[18] = 'L'; rowsP[2] = r.join(''); })(); // đèn đá 2 góc bắc (khớp vị trí đèn trong tranh nền)
  (function () { var r = rowsP[13].split(''); r[EXIT_TILE.x] = 'G'; rowsP[13] = r.join(''); })();  // cửa ra
  var CAVE_MAP = {
    id: MAP_ID, name: 'Động Phủ Riêng', instance: true,
    bg: 'assets/dong-phu-bg.png', w: 22, h: 15, tiles: rowsP, blocked: BLOCKED,
    start: START, exit: EXIT_TILE,
    portals: [], npcs: [], monsters: [], herbs: [],
    zones: [{ id: 'dong_phu', name: 'Động Phủ Riêng', x0: 0, y0: 0, x1: 21, y1: 14 }],
    props: [
      { x: 11, y: 1, sprite: 'sign', label: 'Tụ Linh Trận' },
      { x: 4, y: 9, sprite: 'sign', label: 'Linh Điền' },
      { x: 12, y: 13, sprite: 'sign', label: 'Cửa ra' }
    ]
  };
  function registerMaps(mapsApi) {
    var api = mapsApi || M;
    if (api && api.MAPS) api.MAPS[MAP_ID] = CAVE_MAP;
    return CAVE_MAP;
  }
  if (M && M.MAPS) registerMaps(M); // nạp sau maps.js: tự đăng ký ngay

  // ---------- Trạng thái (flags.dp) + cấp phủ theo tông ----------
  function ensure(flags) {
    if (!flags) return null;
    var s = flags.dp;
    if (!s || typeof s !== 'object') s = flags.dp = {};
    if (typeof s.owned !== 'boolean') s.owned = false;
    if (!s.level || !levelDef(s.level) || LEVELS.indexOf(levelDef(s.level)) < 0) s.level = s.owned ? s.level || 1 : 1;
    if (s.level < 1) s.level = 1;
    if (s.level > LEVELS.length) s.level = LEVELS.length;
    if (!Array.isArray(s.plots)) s.plots = [];
    while (s.plots.length < 12) s.plots.push(null);
    if (s.plots.length > 12) s.plots.length = 12;
    if (typeof s.lastSeen !== 'number' || !isFinite(s.lastSeen)) s.lastSeen = 0;
    if (typeof s.cultFrac !== 'number' || !isFinite(s.cultFrac)) s.cultFrac = 0;
    if (s.returnTo && typeof s.returnTo !== 'object') s.returnTo = null;
    if (typeof s.ownerKey !== 'string' || !s.ownerKey) s.ownerKey = null;
    if (s.grantedBy !== null && typeof s.grantedBy !== 'string') s.grantedBy = null;
    if (s.grantVia !== 'sect' && s.grantVia !== 'legacy') s.grantVia = null;
    if (typeof s.justGranted !== 'boolean') s.justGranted = false;
    if (!s.invites || typeof s.invites !== 'object' || Array.isArray(s.invites)) s.invites = {};
    // Save cũ đã MUA quyền (cơ chế trước 22:53): giữ nguyên quyền, đánh
    // dấu nguồn 'legacy' — không thu hồi, không đòi bái sư bổ sung.
    if (s.owned && !s.grantVia) s.grantVia = 'legacy';
    // CẤP PHỦ THEO TÔNG: đã bái sư mà chưa có phủ -> tông cấp ngay phủ
    // cấp 1. justGranted để game.js báo trao Lệnh Bài Động Phủ 1 lần
    // (cả khi bái sư trong phiên lẫn cấp bổ sung ở lần vào game kế).
    if (!s.owned && typeof flags.sectJoined === 'string' && flags.sectJoined) {
      s.owned = true;
      if (s.level < 1) s.level = 1;
      s.grantedBy = flags.sectJoined;
      s.grantVia = 'sect';
      s.justGranted = true;
    }
    if (s.owned && s.grantVia === 'sect' && !s.grantedBy && typeof flags.sectJoined === 'string') {
      s.grantedBy = flags.sectJoined;
    }
    return s;
  }
  // game.js gọi sau ensure: có thông báo cấp phủ mới thì trả thông tin
  // + xoá cờ (báo đúng 1 lần). Trả null khi không có gì mới.
  function takeGrantNotice(flags) {
    var s = ensure(flags);
    if (!s || !s.justGranted) return null;
    s.justGranted = false;
    return { sectId: s.grantedBy, level: s.level };
  }
  // Đồng hồ hiệu dụng: không bao giờ lùi dưới mốc lớn nhất từng thấy —
  // vặn ngược giờ hệ thống không làm cây chín sớm. Các hàm THAO TÁC
  // (trồng/tưới/thu) dùng effNow (có ghi mốc mới); hàm ĐỌC THUẦN
  // (plotView/readyCount cho render + panel) dùng peekNow — chỉ kẹp,
  // không ghi, để việc xem trước không làm mốc thời gian nhảy.
  function effNow(state, now) {
    var n = typeof now === 'number' && isFinite(now) ? now : Date.now();
    if (state && n > (state.lastSeen || 0)) state.lastSeen = n;
    return state ? Math.max(n, state.lastSeen || 0) : n;
  }
  function peekNow(state, now) {
    var n = typeof now === 'number' && isFinite(now) ? now : Date.now();
    return state ? Math.max(n, state.lastSeen || 0) : n;
  }
  function plotsUnlocked(state) { return levelDef(state ? state.level : 1).plots; }
  function arrayMult(state) { return state && state.owned ? levelDef(state.level).mult : 1; }
  function inArray(tx, ty) {
    return tx >= ARRAY_RECT.x0 && tx <= ARRAY_RECT.x1 && ty >= ARRAY_RECT.y0 && ty <= ARRAY_RECT.y1;
  }

  // ---------- Instance riêng theo nhân vật ----------
  // ID nhân vật = tài khoản + tên nhân vật (save hiện lưu 1 nhân vật/
  // tài khoản theo SAVE_PREFIX + username; giữ cả tên để sau này một
  // tài khoản nhiều nhân vật vẫn tách instance đúng).
  function ownerKeyOf(account, ch) {
    var acc = (typeof account === 'string' && account.trim()) ? account.trim() : 'local';
    var name = (ch && typeof ch.name === 'string' && ch.name.trim()) ? ch.name.trim() : 'vo_danh';
    return acc + '::' + name;
  }
  function hashKey(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function instanceIdFor(ownerKey) {
    return MAP_ID + '@' + hashKey(String(ownerKey || ''));
  }
  // Đóng dấu chủ nhân lên trạng thái (game.js gọi ở startGame). Đã có
  // dấu của người khác -> KHÔNG ghi đè, trả false (trạng thái ngoại lai).
  function stampOwner(flags, ownerKey) {
    var s = ensure(flags);
    if (!s || !ownerKey) return false;
    if (!s.ownerKey) { s.ownerKey = ownerKey; return true; }
    return s.ownerKey === ownerKey;
  }
  function isForeign(flags, ownerKey) {
    var s = flags && flags.dp;
    return !!(s && s.ownerKey && ownerKey && s.ownerKey !== ownerKey);
  }
  // Lấy trạng thái phủ CỦA ĐÚNG nhân vật: khớp ownerKey mới trả state;
  // trạng thái mang dấu nhân vật khác -> null (tuyệt đối không lộ).
  function stateFor(flags, ownerKey) {
    if (!flags || !ownerKey) return null;
    if (isForeign(flags, ownerKey)) return null;
    var s = ensure(flags);
    if (s && !s.ownerKey) s.ownerKey = ownerKey;
    return s;
  }
  function instanceId(flags) {
    var s = ensure(flags);
    return s && s.ownerKey ? instanceIdFor(s.ownerKey) : null;
  }
  // Người thao tác có phải CHỦ phủ không: actorKey không truyền (luồng
  // chủ phủ nội bộ cũ) -> coi là chủ; truyền vào mà khác ownerKey ->
  // là KHÁCH (hoặc người lạ) -> chặn mọi thao tác tài sản.
  function actorBlocked(state, actorKey) {
    if (!actorKey) return false;
    if (!state || !state.ownerKey) return false; // chưa đóng dấu chủ -> không đủ căn cứ chặn
    return actorKey !== state.ownerKey;
  }

  // ---------- Tên hiển thị + trang trí theo tông ----------
  function sectOf(flags) {
    var apiS = sectsApi();
    if (!apiS) return null;
    if (flags && typeof flags.sectJoined === 'string' && flags.sectJoined) {
      return apiS.sectById(flags.sectJoined);
    }
    var s = flags && flags.dp;
    if (s && s.grantedBy) return apiS.sectById(s.grantedBy);
    return null;
  }
  function caveName(flags) {
    var sect = sectOf(flags);
    return sect ? ('Động Phủ — Đệ tử ' + sect.name) : 'Động Phủ Riêng';
  }
  // Vật trang trí riêng theo tông: vị trí trên sàn '.' quanh sân giữa
  // (cột 4 = trước kệ dược phía tây, cột 16 = phía đông trước hồ; biển
  // ấn ký ở (18,1)). game.js cộng vào props của map khi vẽ phủ + miễn
  // trừ nền cho map phủ nên prop luôn hiện trên nền AI.
  var SECT_DECOR = {
    thanh_phong: { feature: 'Giá kiếm gỗ + đèn đá', props: [{ x: 4, y: 6, sprite: 'fence' }, { x: 4, y: 7, sprite: 'fence' }, { x: 16, y: 6, sprite: 'lantern' }] },
    huyen_phap: { feature: 'Lọ pháp tụ linh', props: [{ x: 4, y: 6, sprite: 'jar' }, { x: 4, y: 7, sprite: 'jar' }, { x: 16, y: 6, sprite: 'jar' }] },
    thien_cong: { feature: 'Xe nguyên liệu + bao quặng + đá thử rèn', props: [{ x: 16, y: 6, sprite: 'cart' }, { x: 4, y: 6, sprite: 'sacks' }, { x: 4, y: 7, sprite: 'rock' }] },
    dan_ha: { feature: 'Giá phơi dược + vò thuốc', props: [{ x: 16, y: 6, sprite: 'dryingrack' }, { x: 4, y: 6, sprite: 'jar' }, { x: 16, y: 7, sprite: 'jar' }, { x: 4, y: 7, sprite: 'crop' }] },
    van_thu: { feature: 'Ổ thú ấm bằng giỏ rơm + bụi cây', props: [{ x: 4, y: 6, sprite: 'basket' }, { x: 16, y: 6, sprite: 'basket' }, { x: 16, y: 7, sprite: 'bush' }] },
    thien_phu: { feature: 'Bao giấy bùa chu sa + đèn đá', props: [{ x: 4, y: 6, sprite: 'sacks' }, { x: 4, y: 7, sprite: 'sacks' }, { x: 16, y: 6, sprite: 'lantern' }] },
    cuu_cung: { feature: 'Kỳ thạch bày trận + hàng rào tre', props: [{ x: 4, y: 6, sprite: 'rock' }, { x: 16, y: 6, sprite: 'rock' }, { x: 16, y: 7, sprite: 'fence' }] },
    kim_cang: { feature: 'Tảng đá luyện thể + bao cát', props: [{ x: 16, y: 6, sprite: 'rock' }, { x: 4, y: 6, sprite: 'sacks' }, { x: 16, y: 7, sprite: 'sacks' }] },
    ngu_doc: { feature: 'Vò độc + độc thảo', props: [{ x: 4, y: 6, sprite: 'jar' }, { x: 16, y: 6, sprite: 'crop' }, { x: 16, y: 7, sprite: 'jar' }] },
    huyen_am: { feature: 'Đèn đá song đăng + giỏ đàn tịch', props: [{ x: 4, y: 6, sprite: 'lantern' }, { x: 16, y: 6, sprite: 'lantern' }, { x: 16, y: 7, sprite: 'basket' }] }
  };
  var GENERIC_DECOR = { feature: 'Vò sành + giỏ tre (trang trí chung)', props: [{ x: 4, y: 6, sprite: 'jar' }, { x: 16, y: 6, sprite: 'basket' }] };
  function decorFor(flags) {
    var sect = sectOf(flags);
    if (!sect) {
      return { sectId: null, sectName: null, color: '#8a7a5a', sigil: 'Động Phủ Ấn', feature: GENERIC_DECOR.feature, props: GENERIC_DECOR.props.slice() };
    }
    var d = SECT_DECOR[sect.id] || GENERIC_DECOR;
    return { sectId: sect.id, sectName: sect.name, color: sect.color, sigil: sect.sigil, feature: d.feature, props: d.props.slice() };
  }
  function decorProps(flags) {
    var d = decorFor(flags);
    var out = d.props.map(function (p) { return { x: p.x, y: p.y, sprite: p.sprite }; });
    out.push({ x: 18, y: 1, sprite: 'sign', label: d.sigil });
    return out;
  }

  // ---------- Nâng cấp (giá cũ + cổng cấp bậc cống hiến) ----------
  function upgradeInfo(ch, flags) {
    var s = ensure(flags);
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    if (s.level >= LEVELS.length) return { ok: false, reason: 'max', level: s.level };
    var next = levelDef(s.level + 1);
    var lackMats = [];
    if (L) Object.keys(next.upMats).forEach(function (m) {
      if (L.countItem(ch, m) < next.upMats[m]) lackMats.push(m);
    });
    var rIdx = rankIdxOf(ch);
    var lackRank = next.needRank > 0 && rIdx >= 0 && rIdx < next.needRank;
    return {
      ok: true, nextLevel: next.level, price: next.upPrice, mats: next.upMats,
      lackMats: lackMats, lackLt: (ch.linhThach || 0) < next.upPrice,
      needRank: next.needRank, needRankName: next.needRankName, rankIdx: rIdx, lackRank: lackRank,
      plots: next.plots, mult: next.mult
    };
  }
  function upgrade(ch, flags, actorKey) {
    var s = ensure(flags);
    if (actorBlocked(s, actorKey)) return { ok: false, reason: 'guest' };
    var info = upgradeInfo(ch, flags);
    if (!info.ok) return info;
    if (info.lackRank) return { ok: false, reason: 'rank', needRank: info.needRank, needRankName: info.needRankName };
    if (info.lackLt) return { ok: false, reason: 'linhThach', need: info.price };
    if (info.lackMats.length) return { ok: false, reason: 'mats', lack: info.lackMats };
    ch.linhThach -= info.price;
    Object.keys(info.mats).forEach(function (m) { L.consumeItem(ch, m, info.mats[m]); });
    s.level = info.nextLevel;
    return { ok: true, level: s.level, plots: info.plots, mult: info.mult };
  }

  // ---------- Vào / ra (vòng đời instance, không đụng bí cảnh) ----------
  function canEnter(flags) {
    var s = ensure(flags);
    if (!s) return { ok: false, reason: 'nostate' };
    if (!s.owned) {
      return { ok: false, reason: (flags && flags.sectJoined) ? 'not_granted' : 'no_sect' };
    }
    if (flags.sr && flags.sr.run) return { ok: false, reason: 'in_realm' };
    return { ok: true };
  }
  function enter(flags, returnTo) {
    var chk = canEnter(flags);
    if (!chk.ok) return chk;
    var s = ensure(flags);
    s.returnTo = returnTo ? { mapId: returnTo.mapId, x: returnTo.x, y: returnTo.y } : { mapId: GATE_MAP, x: GATE.x, y: GATE.y + 1 };
    return { ok: true, mapId: MAP_ID, instanceId: s.ownerKey ? instanceIdFor(s.ownerKey) : null, x: START.x, y: START.y };
  }
  function exit(flags) {
    var s = ensure(flags);
    var rt = (s && s.returnTo) ? s.returnTo : { mapId: GATE_MAP, x: GATE.x, y: GATE.y + 1 };
    return { ok: true, mapId: rt.mapId, x: rt.x, y: rt.y };
  }

  // ---------- Tụ Linh Trận + giường đá (điểm nối cơ chế thổ nạp) ----------
  // Hệ số thổ nạp tại vị trí đứng: chỉ khi ở trong động phủ VÀ đứng trên
  // đài trận mới nhân; mọi nơi khác = 1 (giữ nguyên cơ chế cũ). KHÁCH
  // thăm (actorKey khác chủ) đứng trong trận cũng KHÔNG được nhân —
  // trận chỉ nuôi chủ phủ.
  function cultMultAt(flags, mapId, tx, ty) {
    var s = ensure(flags);
    if (!s || !s.owned || mapId !== MAP_ID) return 1;
    return inArray(tx, ty) ? arrayMult(s) : 1;
  }
  // Base tu vi của 1 nhịp thổ nạp sau khi nhân hệ số trận. Phần dư phân
  // số được tích lũy vào state.cultFrac nên chuỗi nhịp dài hạn khớp hệ
  // số tuyệt đối (vd x1,5: nhịp base 1 cho ra 1,2,1,2... tổng đúng 1,5x).
  function cultGainBase(ch, flags, base, mapId, tx, ty, actorKey) {
    var s = ensure(flags);
    if (actorBlocked(s, actorKey)) return base;
    var mult = cultMultAt(flags, mapId, tx, ty);
    if (!s || mult === 1) return base;
    var total = base * mult + (s.cultFrac || 0);
    var whole = Math.floor(total);
    s.cultFrac = total - whole;
    return Math.max(base, whole);
  }
  // Thiền trong phủ (giường đá + không khí linh khí đặc): hồi thêm
  // REST_HEAL_PCT% HP tối đa mỗi lần thổ nạp. Trả số HP đã hồi thật.
  // Khách thăm không hưởng hồi phục của phủ (actorKey khác chủ -> 0).
  function restHeal(ch, flags, mapId, actorKey) {
    if (!ch || mapId !== MAP_ID || !L) return 0;
    var s = ensure(flags);
    if (!s || !s.owned) return 0;
    if (actorBlocked(s, actorKey)) return 0;
    var before = ch.hp;
    ch.hp = Math.min(L.effMaxHp(ch), ch.hp + Math.round(L.effMaxHp(ch) * REST_HEAL_PCT / 100));
    return ch.hp - before;
  }

  // ---------- Hạt giống ----------
  function buySeed(ch, seedId, n) {
    var def = SEEDS[seedId];
    if (!def || !L) return { ok: false, reason: 'noseed' };
    if (def.noShop) return { ok: false, reason: 'noshop' };
    n = Math.max(1, Math.floor(num(n, 1)));
    var cost = def.price * n;
    if ((ch.linhThach || 0) < cost) return { ok: false, reason: 'linhThach', need: cost };
    ch.linhThach -= cost;
    L.addItem(ch, seedId, n);
    return { ok: true, seed: seedId, n: n, cost: cost };
  }
  // Hái hoang: tỉ lệ rơi 1 hạt của CHÍNH dược vừa hái (dược không có hạt
  // như Sơn Tinh thì không rơi). game.js gọi sau mỗi lần hái thành công.
  function onWildGather(ch, herbId, rng) {
    var def = seedOfHerb(herbId);
    if (!def || !L) return null;
    var roll = typeof rng === 'function' ? rng() : Math.random();
    if (roll >= WILD_SEED_CHANCE) return null;
    L.addItem(ch, def.id, 1);
    return def.id;
  }

  // ---------- Linh điền: trồng / tưới / xem / thu ----------
  // Mọi thao tác ĐỔI trạng thái nhận actorKey tuỳ chọn (ownerKey của
  // người thao tác): khác chủ phủ -> reason 'guest' (chặn ở tầng
  // logic, khách thăm chỉ được xem qua plotView/readyCount).
  function plotAt(state, idx) {
    if (!state || typeof idx !== 'number' || idx < 0 || idx >= 12) return undefined;
    return state.plots[idx];
  }
  function plant(ch, flags, idx, seedId, now, actorKey) {
    var s = ensure(flags);
    var def = SEEDS[seedId];
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    if (actorBlocked(s, actorKey)) return { ok: false, reason: 'guest' };
    if (!def || !L) return { ok: false, reason: 'noseed' };
    if (typeof idx !== 'number' || idx < 0 || idx >= 12) return { ok: false, reason: 'badplot' };
    if (idx >= plotsUnlocked(s)) return { ok: false, reason: 'locked' };
    if (s.plots[idx]) return { ok: false, reason: 'busy' };
    if (L.countItem(ch, seedId) <= 0) return { ok: false, reason: 'noseeditem' };
    var t = effNow(s, now);
    if (!L.consumeItem(ch, seedId, 1)) return { ok: false, reason: 'noseeditem' };
    s.plots[idx] = { herb: def.herb, seed: seedId, plantedAt: t, readyAt: t + def.growMs, wateredAt: 0 };
    return { ok: true, herb: def.herb, readyAt: s.plots[idx].readyAt, growMs: def.growMs };
  }
  function water(flags, idx, now, actorKey) {
    var s = ensure(flags);
    var p = plotAt(s, idx);
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    if (actorBlocked(s, actorKey)) return { ok: false, reason: 'guest' };
    if (p === undefined) return { ok: false, reason: 'badplot' };
    if (!p) return { ok: false, reason: 'empty' };
    var t = effNow(s, now);
    if (t >= p.readyAt) return { ok: false, reason: 'ready' };
    if (p.wateredAt) return { ok: false, reason: 'watered' };
    p.wateredAt = t;
    p.readyAt = t + Math.round((p.readyAt - t) * (1 - WATER_CUT));
    return { ok: true, readyAt: p.readyAt };
  }
  // Giai đoạn cây cho render + panel: locked/empty/seed/sprout/grown/ready.
  // Hàm ĐỌC thuần — khách thăm cũng xem được (chỉ ngắm là quyền của khách).
  function plotView(flags, idx, now) {
    var s = ensure(flags);
    if (!s || typeof idx !== 'number' || idx < 0 || idx >= 12) return { stage: 'badplot' };
    if (idx >= plotsUnlocked(s)) return { stage: 'locked' };
    var p = s.plots[idx];
    if (!p) return { stage: 'empty' };
    var t = peekNow(s, now);
    var def = seedOfHerb(p.herb);
    var growMs = def ? def.growMs : Math.max(1, p.readyAt - p.plantedAt);
    var prog = Math.max(0, Math.min(1, (t - p.plantedAt) / growMs));
    var stage = t >= p.readyAt ? 'ready' : prog < 0.34 ? 'seed' : prog < 0.7 ? 'sprout' : 'grown';
    return {
      stage: stage, herb: p.herb, progress: prog, watered: !!p.wateredAt,
      readyAt: p.readyAt, msLeft: Math.max(0, p.readyAt - t)
    };
  }
  function harvest(ch, flags, idx, now, actorKey) {
    var s = ensure(flags);
    var p = plotAt(s, idx);
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    if (actorBlocked(s, actorKey)) return { ok: false, reason: 'guest' };
    if (p === undefined) return { ok: false, reason: 'badplot' };
    if (!p) return { ok: false, reason: 'empty' };
    var t = effNow(s, now);
    if (t < p.readyAt) return { ok: false, reason: 'notready', msLeft: p.readyAt - t };
    var herb = p.herb;
    s.plots[idx] = null;
    if (L) L.addItem(ch, herb, HARVEST_YIELD);
    return { ok: true, herb: herb, n: HARVEST_YIELD };
  }
  function readyCount(flags, now) {
    var s = ensure(flags);
    if (!s || !s.owned) return 0;
    var t = peekNow(s, now), n = 0;
    s.plots.forEach(function (p) { if (p && t >= p.readyAt) n++; });
    return n;
  }

  // ---------- Khách thăm theo lời mời (lưu trong save của CHỦ phủ) ----------
  // s.invites[guestKey] = { name, createdAt, expiresAt, acceptedAt }.
  // guestKey = ownerKey của khách ("<tài khoản>::<tên nhân vật>").
  // Hạn mời: INVITE_TTL_MS (24 giờ) tính từ lúc tạo — quá hạn thì cả
  // chấp nhận lẫn vào thăm đều bị chặn 'expired'. Thu hồi = xoá hẳn.
  function inviteStatus(s, inv, now) {
    if (!inv) return null;
    var t = peekNow(s, now);
    if (t > inv.expiresAt) return 'expired';
    return inv.acceptedAt ? 'accepted' : 'pending';
  }
  function invite(flags, guestKey, guestName, now) {
    var s = ensure(flags);
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    if (typeof guestKey !== 'string' || !guestKey.trim()) return { ok: false, reason: 'badguest' };
    guestKey = guestKey.trim();
    if (s.ownerKey && guestKey === s.ownerKey) return { ok: false, reason: 'self' };
    var t = effNow(s, now);
    var active = 0;
    Object.keys(s.invites).forEach(function (k) { if (inviteStatus(s, s.invites[k], t) !== 'expired') active++; });
    if (!s.invites[guestKey] && active >= MAX_INVITES) return { ok: false, reason: 'toomany' };
    s.invites[guestKey] = { name: (typeof guestName === 'string' && guestName.trim()) ? guestName.trim() : guestKey, createdAt: t, expiresAt: t + INVITE_TTL_MS, acceptedAt: 0 };
    return { ok: true, guestKey: guestKey, expiresAt: s.invites[guestKey].expiresAt, ttlMs: INVITE_TTL_MS };
  }
  function inviteInfo(flags, guestKey, now) {
    var s = ensure(flags);
    if (!s) return null;
    var inv = s.invites[guestKey];
    if (!inv) return null;
    return { guestKey: guestKey, name: inv.name, createdAt: inv.createdAt, expiresAt: inv.expiresAt, acceptedAt: inv.acceptedAt, status: inviteStatus(s, inv, now) };
  }
  function listInvites(flags, now) {
    var s = ensure(flags);
    if (!s) return [];
    return Object.keys(s.invites).map(function (k) { return inviteInfo(flags, k, now); }).filter(Boolean);
  }
  function acceptInvite(flags, guestKey, now) {
    var s = ensure(flags);
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    var inv = s.invites[guestKey];
    if (!inv) return { ok: false, reason: 'no_invite' };
    var t = effNow(s, now);
    if (t > inv.expiresAt) return { ok: false, reason: 'expired' };
    if (inv.acceptedAt) return { ok: true, already: true };
    inv.acceptedAt = t;
    return { ok: true };
  }
  function revokeInvite(flags, guestKey) {
    var s = ensure(flags);
    if (!s || !s.invites[guestKey]) return { ok: false, reason: 'no_invite' };
    var wasAccepted = !!s.invites[guestKey].acceptedAt;
    delete s.invites[guestKey];
    return { ok: true, wasAccepted: wasAccepted };
  }
  // Tư cách khách tại thời điểm `now`: phải có mời + đã chấp nhận +
  // chưa hết hạn. Dùng peekNow (đọc thuần) để game loop kiểm liên tục
  // mà không đẩy mốc thời gian của chủ.
  function guestAccess(flags, guestKey, now) {
    var s = ensure(flags);
    if (!s || !s.owned) return { ok: false, reason: 'not_owned' };
    var inv = s.invites[guestKey];
    if (!inv) return { ok: false, reason: 'no_invite' };
    if (peekNow(s, now) > inv.expiresAt) return { ok: false, reason: 'expired' };
    if (!inv.acceptedAt) return { ok: false, reason: 'not_accepted' };
    return { ok: true, name: inv.name, expiresAt: inv.expiresAt };
  }
  function guestSessionValid(flags, guestKey, now) {
    return guestAccess(flags, guestKey, now).ok;
  }
  // Khách bước vào instance CỦA CHỦ: cùng map mẫu, đúng instanceId của
  // chủ — khách không bao giờ rơi vào instance của chính mình khi thăm.
  function enterAsGuest(hostFlags, guestKey, now) {
    var chk = guestAccess(hostFlags, guestKey, now);
    if (!chk.ok) return chk;
    var s = ensure(hostFlags);
    return {
      ok: true, asGuest: true, mapId: MAP_ID,
      instanceId: s.ownerKey ? instanceIdFor(s.ownerKey) : null,
      x: START.x, y: START.y, expiresAt: chk.expiresAt
    };
  }

  var api = {
    MAP_ID: MAP_ID, GATE_MAP: GATE_MAP, GATE: GATE, START: START, EXIT_TILE: EXIT_TILE,
    ARRAY_RECT: ARRAY_RECT, LEVELS: LEVELS, levelDef: levelDef,
    SEEDS: SEEDS, seedOfHerb: seedOfHerb, HARVEST_YIELD: HARVEST_YIELD,
    WATER_CUT: WATER_CUT, WILD_SEED_CHANCE: WILD_SEED_CHANCE, REST_HEAL_PCT: REST_HEAL_PCT,
    INVITE_TTL_MS: INVITE_TTL_MS, MAX_INVITES: MAX_INVITES,
    CAVE_MAP: CAVE_MAP, PLOT_TILES: PLOT_TILES, registerMaps: registerMaps,
    ensure: ensure, takeGrantNotice: takeGrantNotice, effNow: effNow, plotsUnlocked: plotsUnlocked, arrayMult: arrayMult, inArray: inArray,
    ownerKeyOf: ownerKeyOf, instanceIdFor: instanceIdFor, stampOwner: stampOwner, isForeign: isForeign, stateFor: stateFor, instanceId: instanceId,
    caveName: caveName, decorFor: decorFor, decorProps: decorProps, SECT_DECOR: SECT_DECOR,
    upgradeInfo: upgradeInfo, upgrade: upgrade,
    canEnter: canEnter, enter: enter, exit: exit,
    cultMultAt: cultMultAt, cultGainBase: cultGainBase, restHeal: restHeal,
    buySeed: buySeed, onWildGather: onWildGather,
    plant: plant, water: water, plotView: plotView, harvest: harvest, readyCount: readyCount,
    invite: invite, inviteInfo: inviteInfo, listInvites: listInvites, acceptInvite: acceptInvite,
    revokeInvite: revokeInvite, guestAccess: guestAccess, guestSessionValid: guestSessionValid, enterAsGuest: enterAsGuest
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof global !== 'undefined') global.PNT_DONG_PHU = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_DONG_PHU = api;
})();
