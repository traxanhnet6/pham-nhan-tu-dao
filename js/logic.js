// Phàm Nhân Tu Đạo — luật game thuần (không DOM, test được bằng Node).
// Tài khoản local: mật khẩu chỉ lưu dạng băm SHA-256, không lưu plaintext.
(function () {
  'use strict';
  // ---------- SHA-256 thuần (kiểm chứng bằng vector chuẩn trong test) ----------
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  function sha256Hex(str) {
    var bytes = [], i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) bytes.push(c);
      else if (c < 0x800) { bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var c2 = str.charCodeAt(i + 1);
        if (c2 >= 0xdc00 && c2 <= 0xdfff) {
          var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00); i++;
          bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        } else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      } else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    for (var off = 0; off < bytes.length; off += 64) {
      for (i = 0; i < 16; i++) w[i] = ((bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3]) | 0;
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = h[0], b = h[1], cc = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var mj = (a & b) ^ (a & cc) ^ (b & cc);
        var t2 = (S0 + mj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = cc; cc = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + cc) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) { var v = h[i] >>> 0; for (var s = 28; s >= 0; s -= 4) out += '0123456789abcdef'[(v >>> s) & 0xf]; }
    return out;
  }
  // ---------- Tài khoản local ----------
  function hashPassword(username, password) { return sha256Hex(username + ':' + password); }
  function validUsername(u) { return /^[A-Za-z0-9_À-ỹ]{3,20}$/.test(u); }
  function registerAccount(accounts, username, password) {
    if (!validUsername(username)) return { ok: false, error: 'Tên tài khoản 3–20 ký tự, chỉ gồm chữ, số, gạch dưới.' };
    if (!password || password.length < 4) return { ok: false, error: 'Mật khẩu ít nhất 4 ký tự.' };
    if (accounts[username]) return { ok: false, error: 'Tài khoản đã tồn tại.' };
    accounts[username] = { username: username, passHash: hashPassword(username, password), createdAt: Date.now() };
    return { ok: true };
  }
  function loginAccount(accounts, username, password) {
    var acc = accounts[username];
    if (!acc) return { ok: false, error: 'Tài khoản không tồn tại.' };
    if (acc.passHash !== hashPassword(username, password)) return { ok: false, error: 'Sai mật khẩu.' };
    return { ok: true, account: acc };
  }
  // ---------- Xuất thân, linh căn, nhân vật ----------
  var ORIGINS = {
    nong_dan: { name: 'Nông dân', desc: 'Khỏe mạnh, chịu đòn tốt.', hp: 120, atk: 9, def: 3, rate: 1.0 },
    tho_san: { name: 'Thợ săn', desc: 'Nhanh tay, đánh đau.', hp: 100, atk: 13, def: 2, rate: 1.0 },
    thu_sinh: { name: 'Thư sinh', desc: 'Ngộ tính cao, thổ nạp nhanh.', hp: 90, atk: 8, def: 2, rate: 1.3 }
  };
  var ROOTS = [
    { id: 'kim', name: 'Kim Linh Căn', color: '#d8b45a', weight: 16, desc: 'Sắc bén, công kích tăng.', atk: 2, mult: 1.0, bpBonus: 0 },
    { id: 'moc', name: 'Mộc Linh Căn', color: '#4caf50', weight: 16, desc: 'Sinh cơ dồi dào, Máu tăng.', atk: 0, mult: 1.0, bpBonus: 0 },
    { id: 'thuy', name: 'Thủy Linh Căn', color: '#5aa7d6', weight: 16, desc: 'Nhu hòa, thổ nạp nhanh hơn.', atk: 0, mult: 1.15, bpBonus: 2 },
    { id: 'hoa', name: 'Hỏa Linh Căn', color: '#e07b39', weight: 16, desc: 'Bùng nổ, công kích tăng.', atk: 3, mult: 1.0, bpBonus: 0 },
    { id: 'tho', name: 'Thổ Linh Căn', color: '#8b5a2b', weight: 16, desc: 'Vững chãi, phòng thủ tăng.', atk: 0, mult: 1.0, bpBonus: 0 },
    { id: 'phong', name: 'Phong Linh Căn', color: '#9ad6a8', weight: 8, desc: 'Hiếm: nhanh nhẹn, thổ nạp nhanh.', atk: 1, mult: 1.25, bpBonus: 3 },
    { id: 'loi', name: 'Lôi Linh Căn', color: '#b78ce0', weight: 7, desc: 'Rất hiếm: thiên lôi nhập thể, công kích cao.', atk: 5, mult: 1.2, bpBonus: 5 },
    { id: 'bang', name: 'Băng Linh Căn', color: '#bfe3ff', weight: 5, desc: 'Cực hiếm: hàn khí tuyệt đối, thổ nạp nhanh nhất.', atk: 2, mult: 1.4, bpBonus: 5 }
  ];
  function drawRoot(rng) {
    var total = 0, i;
    for (i = 0; i < ROOTS.length; i++) total += ROOTS[i].weight;
    var r = (rng ? rng() : Math.random()) * total;
    for (i = 0; i < ROOTS.length; i++) { if (r < ROOTS[i].weight) return ROOTS[i]; r -= ROOTS[i].weight; }
    return ROOTS[0];
  }
  // Thang cảnh giới: need = tu vi cần tích đầy Ở TẦNG ĐÓ để đột phá lên
  // tầng kế. Tầng 0-2 giữ nguyên số cũ (100/220/380 — save và truyện khớp
  // 1-1); tầng 3 trước đây là trần (need 0) nay mở tiếp tới tầng 9.
  // Tầng 9 need 0 = Luyện Khí VIÊN MÃN: đã chạm ngưỡng Trúc Cơ, cảnh giới
  // Trúc Cơ chưa mở (chỉ ghi nhận ngưỡng tại đây).
  var TIERS = [
    { tier: 0, realm: 'Phàm Nhân', need: 100 },
    { tier: 1, realm: 'Luyện Khí tầng 1', need: 220 },
    { tier: 2, realm: 'Luyện Khí tầng 2', need: 380 },
    { tier: 3, realm: 'Luyện Khí tầng 3', need: 550 },
    { tier: 4, realm: 'Luyện Khí tầng 4', need: 750 },
    { tier: 5, realm: 'Luyện Khí tầng 5', need: 1000 },
    { tier: 6, realm: 'Luyện Khí tầng 6', need: 1300 },
    { tier: 7, realm: 'Luyện Khí tầng 7', need: 1650 },
    { tier: 8, realm: 'Luyện Khí tầng 8', need: 2100 },
    { tier: 9, realm: 'Luyện Khí tầng 9', need: 0 }
  ];
  // ---------- Điều kiện + tỉ lệ đột phá (theo TẦNG ĐÍCH) ----------
  // BREAK_RULES[t] là luật đột phá từ tầng t-1 LÊN tầng t:
  //   baseRate    tỉ lệ gốc (%).
  //   pillMin     breakthroughBonus tối thiểu của đan hỗ trợ (0 = không
  //               bắt buộc; có đan vẫn được cộng tỉ lệ và bị tiêu hao).
  //   placeReq    null | 'linh_dia' (giếng cổ hoặc Đài Vọng Vân) | id nơi
  //               cụ thể trong BREAK_PLACES — phải ĐỨNG Ở ĐÓ khi đột phá.
  //   questReq    id nhiệm vụ phải đã TRẢ (mốc truyện/chứng đạo).
  //   yeuDan      số Yêu Đan Cấp 1 (yeu_dan_1) tốn cho lần đột phá này
  //               (lệnh Bui 21:58 29/10: nội đan cấp thấp là nguyên liệu
  //               tăng cấp Luyện Khí) — điều kiện cứng để ĐƯỢC THỬ, và
  //               CHỈ trừ khi đột phá THÀNH CÔNG (khác đan hỗ trợ: đan
  //               mất cả khi thất bại; yêu đan thất bại KHÔNG mất).
  //               Mốc lên tầng 1 (mốc truyện chương 4) tốn 0 viên.
  //   failLossPct thất bại mất % này của tu vi đang có (KHÔNG rớt tầng).
  //   cooldownSec thời gian "ngộ đạo hồi phục" sau thất bại (giây thật).
  // Tỉ lệ cuối = base + đan + địa điểm + linh căn (bpBonus), kẹp 5..95;
  // riêng lên tầng 1 luôn 100 (mốc truyện chương 4 không được kẹt).
  var BREAK_PLACES = {
    gieng_co: { id: 'gieng_co', name: 'Giếng cổ Thanh Khê (linh nhãn)', bonus: 10 },
    dai_vong_van: { id: 'dai_vong_van', name: 'Đài Vọng Vân (Chân Núi Thanh Phong)', bonus: 15 }
  };
  var BREAK_RULES = {
    1: { baseRate: 100, pillMin: 0, placeReq: null, questReq: null, yeuDan: 0, failLossPct: 10, cooldownSec: 0 },
    2: { baseRate: 90, pillMin: 0, placeReq: null, questReq: null, yeuDan: 1, failLossPct: 15, cooldownSec: 15 },
    3: { baseRate: 80, pillMin: 0, placeReq: null, questReq: null, yeuDan: 1, failLossPct: 20, cooldownSec: 30 },
    4: { baseRate: 70, pillMin: 10, placeReq: null, questReq: null, yeuDan: 1, failLossPct: 20, cooldownSec: 45 },
    5: { baseRate: 60, pillMin: 10, placeReq: null, questReq: 'q_chinh_7', yeuDan: 1, failLossPct: 25, cooldownSec: 60 },
    6: { baseRate: 50, pillMin: 15, placeReq: null, questReq: null, yeuDan: 1, failLossPct: 25, cooldownSec: 75 },
    7: { baseRate: 42, pillMin: 15, placeReq: 'linh_dia', questReq: 'q_chinh_18', yeuDan: 2, failLossPct: 30, cooldownSec: 90 },
    8: { baseRate: 35, pillMin: 20, placeReq: 'linh_dia', questReq: null, yeuDan: 2, failLossPct: 30, cooldownSec: 105 },
    9: { baseRate: 28, pillMin: 25, placeReq: 'dai_vong_van', questReq: 'q_chinh_18', yeuDan: 2, failLossPct: 30, cooldownSec: 120 }
  };
  // Tăng trưởng mỗi lần đột phá thành công — GIỮ NGUYÊN công thức cũ đã
  // áp cho tầng 1-3 (+20 HP, +3 công, +1 thủ) cho mọi tầng 1-9; linh lực
  // theo js/skills.js: 40 + 25 x tầng.
  var BREAK_GROWTH = { maxHp: 20, atk: 3, def: 1 };
  // Chuẩn hoá nhân vật theo TIERS hiện tại: save cũ ở tầng 3 có
  // tuViMax = 999 (trần cũ) — sau khi gọi hàm này tuViMax khớp need mới
  // của tầng (550), realm khớp tên tầng. Gọi khi nạp save + khi đột phá.
  function syncTier(ch) {
    if (!ch) return ch;
    migrateCurrency(ch);
    var t = TIERS[ch.tier || 0] || TIERS[0];
    ch.realm = t.realm;
    ch.tuViMax = t.need > 0 ? t.need : 999;
    // Cảnh giới cao (js/realms.js, tra cứu lười): nhân vật từ Trúc Cơ
    // trở lên giữ tên cảnh giới + tuViMax theo TIỂU GIAI của module đó,
    // không bị thang Luyện Khí ghi đè. Chưa nạp module thì y như cũ.
    var RMt = realmsLazy();
    if (RMt && typeof RMt.syncRealm === 'function') RMt.syncRealm(ch);
    return ch;
  }
  // Module cảnh giới cao js/realms.js — tra cứu lười như vũ khí/pháp
  // bảo/linh thú: thiếu module thì mọi hệ số của nó coi như trung tính.
  function realmsLazy() {
    if (typeof window !== 'undefined' && window.PNT_REALMS) return window.PNT_REALMS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_REALMS) return globalThis.PNT_REALMS;
    return null;
  }
  function createCharacter(name, gender, originId, lookId) {
    var o = ORIGINS[originId];
    var ch = {
      name: name, gender: gender, origin: originId,
      hp: o.hp, maxHp: o.hp, atk: o.atk, def: o.def, rate: o.rate,
      tuVi: 0, tuViMax: TIERS[0].need, tier: 0, realm: TIERS[0].realm,
      root: null, linhThach: 0, inventory: [], x: 43, y: 47, dir: 'down' // V3: start map1 (19,9) + offset V10 (12,8) + neo V3 (12,30)
    };
    // TẠO HÌNH NV01–NV12 (Bui duyệt hết 06:06 30/10/2026): trường 'look'
    // chỉ tồn tại khi người chơi chọn mẫu NV đúng giới; save cũ không có
    // trường này -> engine tự rơi về sheet theo xuất thân như trước
    // (không vỡ save). Chọn sai giới / mã lạ -> bỏ qua, giữ mặc định.
    var LOOK_GENDER = { nv01: 'nam', nv02: 'nam', nv03: 'nam', nv04: 'nam',
      nv05: 'nam', nv06: 'nam', nv07: 'nu', nv08: 'nu', nv09: 'nu',
      nv10: 'nu', nv11: 'nu', nv12: 'nu' };
    if (lookId && LOOK_GENDER[lookId] === gender) ch.look = lookId;
    // NGUỒN GỐC (mục 19 hàng chờ, docs/origins-and-encounters.md):
    // có look NV thì storyOrigin = look; không thì 'goc_' + khung xuất
    // thân (3 nguồn gốc nền). Nguồn gốc KHÔNG đổi chỉ số — chỉ số vẫn
    // là của khung ORIGINS ở trên. Vật dấu ấn trao ngay vào túi lúc
    // tạo nhân vật (vật cốt truyện, heal 0, không bán được như lệnh
    // bài); chi tiết lore/thoại NPC ở js/origins.js.
    var ORIGIN_TOKENS = { nv01: 'kiem_gi_cua_cha', nv02: 'nua_quyen_thanh_khe_chi',
      nv03: 'la_bua_khong_chu', nv04: 'nanh_soi_dau_tien', nv05: 'hat_trang_go_chay_sem',
      nv06: 'hat_giong_lua_cu_cua_ba', nv07: 'lenh_bai_tieu_cuc_ran', nv08: 'gio_thuoc_cua_me',
      nv09: 'ngoc_boi_khuyet_mot_goc', nv10: 'sung_nai_gac_dau_tien', nv11: 'con_dau_trien_gia_truyen',
      nv12: 'khan_hoa_dao_cua_chi', goc_nong_dan: 'cuoc_cu_cua_cha', goc_tho_san: 'mui_ten_gay_dau_tien',
      goc_thu_sinh: 'nghien_muc_nut' };
    ch.storyOrigin = ch.look || ('goc_' + originId);
    ch.inventory.push({ id: ORIGIN_TOKENS[ch.storyOrigin], count: 1 });
    return ch;
  }
  function rootOf(ch) { return ch.root ? ROOTS.filter(function (r) { return r.id === ch.root; })[0] : null; }
  function atkOf(ch) { var r = rootOf(ch); return ch.atk + (r ? r.atk : 0); }
  // Công hiệu dụng = công gốc + công vũ khí đang đeo. Module vũ khí
  // (js/weapons.js) nạp SAU logic.js nên tra cứu lười qua PNT_WEAPONS toàn
  // cục: chưa nạp thì coi như không có bonus, không lỗi. forSkill=true khi
  // tính sát thương chiêu (kiếm chiêu hưởng lợi theo loại vũ khí, xem
  // weapons.js weaponAtk).
  function weaponBonusOf(ch, forSkill) {
    var W = null;
    if (typeof window !== 'undefined' && window.PNT_WEAPONS) W = window.PNT_WEAPONS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_WEAPONS) W = globalThis.PNT_WEAPONS;
    if (!W || typeof W.weaponAtk !== 'function') return 0;
    return W.weaponAtk(ch, forSkill) || 0;
  }
  function effAtk(ch, forSkill) {
    var base = atkOf(ch) + weaponBonusOf(ch, forSkill);
    // Thiên Đạo Ấn (js/realms.js): mỗi ấn +2% công vĩnh viễn — nhân
    // trước buff đan dược. Chưa có ấn nào (mọi nhân vật hiện tại) thì
    // hệ số = 1, công y như cũ.
    var RMb = realmsLazy();
    if (RMb && typeof RMb.blessingMult === 'function') {
      var bmA = RMb.blessingMult(ch);
      if (bmA > 1) base = Math.round(base * bmA);
    }
    // Buff công % tạm thời từ đan dược (ch.buffs do js/alchemy.js ghi,
    // hợp đồng ở đầu file đó). Không có buff còn hạn thì số y như cũ.
    if (ch && ch.buffs && ch.buffs.length) {
      var nowA = Date.now(), pct = 0;
      ch.buffs.forEach(function (b) { if (b && b.stat === 'atkPct' && b.until > nowA) pct += b.val; });
      if (pct) base = Math.round(base * (1 + pct / 100));
    }
    return base;
  }
  // Tổng chỉ số pháp khí/bảo vật: module js/artifacts.js nạp SAU logic.js
  // nên tra cứu lười qua PNT_ARTIFACTS toàn cục như vũ khí ở trên. Chưa nạp
  // (hoặc nhân vật không đeo pháp bảo) thì mọi cộng thêm bằng 0, không lỗi.
  function artifactsApi() {
    var A = null;
    if (typeof window !== 'undefined' && window.PNT_ARTIFACTS) A = window.PNT_ARTIFACTS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_ARTIFACTS) A = globalThis.PNT_ARTIFACTS;
    return A;
  }
  function artifactStatsOf(ch) {
    var A = artifactsApi();
    if (!A || typeof A.totalStats !== 'function') return null;
    return A.totalStats(ch);
  }
  // Chống hack (js/anticheat.js): trần biến động cho các đường cộng
  // Linh Thạch/tu vi đi qua file này. Module chưa nạp -> cộng như cũ.
  function ahackApi() {
    var A = null;
    if (typeof window !== 'undefined' && window.PNT_ANTICHEAT) A = window.PNT_ANTICHEAT;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_ANTICHEAT) A = globalThis.PNT_ANTICHEAT;
    return A;
  }
  function guardGain(kind, amount) {
    var A = ahackApi();
    return (A && typeof A.guardGain === 'function') ? A.guardGain(kind, amount) : amount;
  }
  // Hệ số sát thương theo đối tượng của pháp bảo (thêm % lên boss/tinh anh,
  // kết liễu quái <30% HP, quái bị Soi Yêu đánh dấu) — artifacts.js tính;
  // không đeo pháp bảo liên quan thì = 1, đòn đánh y như cũ.
  function artifactVsMult(ch, monster) {
    var A = artifactsApi();
    if (!A || typeof A.dmgMultVs !== 'function' || !monster) return 1;
    var def = MONSTERS[monster.type];
    return A.dmgMultVs(ch, {
      boss: !!(def && def.boss), elite: !!monster.elite,
      hp: monster.hp, maxHp: monster.maxHp || (def ? def.hp : 0),
      markT: monster.markT || 0, markPct: monster.markPct || 0
    });
  }
  // effDef / effMaxHp được định nghĩa THỐNG NHẤT ở khối tổng hợp chỉ số
  // bên dưới (statTotals cộng cả vũ khí lẫn pháp bảo) — bản nháp trùng lặp
  // ở đây đã gỡ để tránh hai định nghĩa đè nhau.
  // ---------- Tổng hợp chỉ số trang bị (vũ khí + pháp khí) ----------
  // ĐỊNH DẠNG KHỐI CHỈ SỐ DÙNG CHUNG cho mọi hệ trang bị — vũ khí
  // (js/weapons.js) và pháp khí (js/artifacts.js) dùng Y HỆT nhau:
  //   stats: { hp, def, crit, critDmg, lifesteal, ll, llRegen, speed,
  //            elem: { <id linh căn>: % } }
  //     hp/def/ll cộng thẳng (điểm); llRegen điểm linh lực/giây;
  //     crit/critDmg/lifesteal/speed/elem là phần trăm. Thiếu khóa = 0.
  //   proc: { kind, chance, name, desc, ... } — hiệu ứng riêng của VŨ KHÍ
  //   Thiên phẩm; pháp khí có hệ fx/signature riêng do artifacts.js tự chạy.
  // statTotals cộng khối stats của vũ khí đang đeo (PNT_WEAPONS.equippedDef)
  // với khối stats của mọi pháp bảo đang đeo (PNT_ARTIFACTS.equippedDefs).
  // Trần cộng dồn cho speed/llRegen lấy theo PNT_ARTIFACTS.CAPS để hai hàm
  // tổng (hàm này và artifacts.totalStats) luôn cho cùng một con số.
  // Mọi module đều tra cứu lười qua biến toàn cục nên thứ tự nạp file không
  // quan trọng và thiếu module nào cũng không lỗi.
  var BASE_CRIT_DMG = 150; // đòn chí mạng nhân 150% + critDmg% cộng thêm từ trang bị
  function gearBlocks(ch) {
    var blocks = [];
    var W = null;
    if (typeof window !== 'undefined' && window.PNT_WEAPONS) W = window.PNT_WEAPONS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_WEAPONS) W = globalThis.PNT_WEAPONS;
    if (W && typeof W.equippedDef === 'function') {
      var wd = W.equippedDef(ch);
      if (wd && (wd.stats || wd.proc)) blocks.push({ stats: wd.stats || null, proc: wd.proc || null });
    }
    var A = null;
    if (typeof window !== 'undefined' && window.PNT_ARTIFACTS) A = window.PNT_ARTIFACTS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_ARTIFACTS) A = globalThis.PNT_ARTIFACTS;
    if (A && typeof A.equippedDefs === 'function') {
      // Chỉ lấy khối stats của pháp bảo: fx/signature của chúng do module
      // pháp khí tự chạy (trói, khiên, hồi sinh...), không qua proc vũ khí.
      A.equippedDefs(ch).forEach(function (def) {
        if (def && def.stats) blocks.push({ stats: def.stats, proc: null });
      });
    }
    // Linh thú (js/pets.js): hào quang của thú ĐANG XUẤT CHIẾN cộng như một
    // khối stats nữa — tra cứu lười PNT_PETS.totalStats, thiếu module thì bỏ.
    var PT = null;
    if (typeof window !== 'undefined' && window.PNT_PETS) PT = window.PNT_PETS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_PETS) PT = globalThis.PNT_PETS;
    if (PT && typeof PT.totalStats === 'function') {
      var pst = PT.totalStats(ch);
      if (pst) blocks.push({ stats: pst, proc: null });
    }
    // Y phục (js/wardrobe.js): "phong thái" của bộ đang mặc — chỉ bộ hiếm
    // nhất (Đại Hội Quán Quân Y) có một dòng chỉ số nhỏ (Tốc độ +3%), mọi
    // bộ khác thuần ngoại hình nên statTotals trả null. Tra cứu lười như
    // linh thú: thiếu module thì bỏ qua, không lỗi.
    var WD = null;
    if (typeof window !== 'undefined' && window.PNT_WARDROBE) WD = window.PNT_WARDROBE;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_WARDROBE) WD = globalThis.PNT_WARDROBE;
    if (WD && typeof WD.statTotals === 'function') {
      var wst = WD.statTotals(ch);
      if (wst) blocks.push({ stats: wst, proc: null });
    }
    return blocks;
  }
  function statTotals(ch) {
    var t = {
      hp: 0, def: 0, crit: 0, critDmg: 0, lifesteal: 0, ll: 0, llRegen: 0, speed: 0,
      elem: {}, critCh: 0, critDmgTotal: BASE_CRIT_DMG, procs: []
    };
    if (!ch) return t;
    gearBlocks(ch).forEach(function (b) {
      var s = b.stats;
      if (s) {
        ['hp', 'def', 'crit', 'critDmg', 'lifesteal', 'll', 'llRegen', 'speed'].forEach(function (k) {
          if (typeof s[k] === 'number') t[k] += s[k];
        });
        if (s.elem) Object.keys(s.elem).forEach(function (e) {
          if (typeof s.elem[e] === 'number') t.elem[e] = (t.elem[e] || 0) + s.elem[e];
        });
      }
      if (b.proc) t.procs.push(b.proc);
    });
    // Trần cộng dồn khớp artifacts.CAPS (speed 40%, hồi linh lực 150%).
    var A = null;
    if (typeof window !== 'undefined' && window.PNT_ARTIFACTS) A = window.PNT_ARTIFACTS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_ARTIFACTS) A = globalThis.PNT_ARTIFACTS;
    if (A && A.CAPS) {
      if (typeof A.CAPS.speed === 'number' && t.speed > A.CAPS.speed) t.speed = A.CAPS.speed;
      if (typeof A.CAPS.llRegen === 'number' && t.llRegen > A.CAPS.llRegen) t.llRegen = A.CAPS.llRegen;
    }
    // Buff tạm thời từ đan dược (ch.buffs do js/alchemy.js ghi): cộng SAU
    // trần trang bị vì là hiệu ứng thuốc có thời hạn, không bị CAPS kẹp.
    if (ch.buffs && ch.buffs.length) {
      var nowB = Date.now();
      ch.buffs.forEach(function (b) {
        if (!b || b.until <= nowB) return;
        if (b.stat === 'def') t.def += b.val;
        else if (b.stat === 'speed') t.speed += b.val;
      });
    }
    // Tỉ lệ chí mạng nền của nhân vật là 0% — chí mạng chỉ đến từ trang bị,
    // nên nhân vật không đồ cao cấp đánh y như trước (test cũ không đổi).
    t.critCh = t.crit;
    t.critDmgTotal = BASE_CRIT_DMG + t.critDmg;
    return t;
  }
  function effMaxHp(ch) {
    var v = ch.maxHp + statTotals(ch).hp;
    // Thiên Đạo Ấn (js/realms.js): mỗi ấn +2% HP tối đa vĩnh viễn.
    var RMh = realmsLazy();
    if (RMh && typeof RMh.blessingMult === 'function') {
      var bmH = RMh.blessingMult(ch);
      if (bmH > 1) v = Math.round(v * bmH);
    }
    return v;
  }
  function effDef(ch) { return ch.def + statTotals(ch).def; }
  // Lăn một đòn tấn công của người chơi qua tổng chỉ số trang bị: cộng %
  // sát thương theo hệ (opts.elem = id linh căn của chiêu — chỉ chiêu Thiên
  // Căn Thần Thông truyền vào), chí mạng, hút máu, hiệu ứng riêng. Hàm này
  // KHÔNG tự trừ HP của ai: nơi gọi áp dụng payload lên mục tiêu.
  // opts.allowProc = false để tắt proc (đòn lan của chính proc dùng).
  // Trả { dmg, crit, healed, procs } — procs là các hiệu ứng ĐÃ trúng tỉ lệ,
  // kèm payload số tính sẵn theo dmg của đòn: meteor/burst có dmg cộng thêm
  // (burst thêm heal), chain có dmg mỗi tia + count, burn có dmg/giây + dur,
  // freeze có dur.
  function applyOffense(ch, rawDmg, rng, opts) {
    opts = opts || {};
    var rand = rng || Math.random;
    var tot = statTotals(ch);
    var dmg = rawDmg;
    if (opts.elem && tot.elem[opts.elem]) dmg = Math.round(dmg * (1 + tot.elem[opts.elem] / 100));
    var crit = false;
    if (tot.critCh > 0 && rand() * 100 < tot.critCh) {
      crit = true;
      dmg = Math.round(dmg * tot.critDmgTotal / 100);
    }
    dmg = Math.max(1, dmg);
    var healed = tot.lifesteal > 0 ? Math.floor(dmg * tot.lifesteal / 100) : 0;
    var procs = [];
    if (opts.allowProc !== false) {
      tot.procs.forEach(function (p) {
        if (rand() * 100 >= p.chance) return;
        var hit = { proc: p, kind: p.kind, name: p.name };
        if (p.kind === 'meteor') {
          hit.dmg = Math.max(1, Math.round(dmg * p.dmgPct / 100));
          hit.splash = Math.max(1, Math.round(dmg * (p.splashPct || 0) / 100));
        } else if (p.kind === 'burst') {
          hit.dmg = Math.max(1, Math.round(dmg * p.dmgPct / 100));
          hit.heal = Math.max(1, Math.round(effMaxHp(ch) * (p.healPct || 0) / 100));
        } else if (p.kind === 'chain') {
          hit.dmg = Math.max(1, Math.round(dmg * p.dmgPct / 100));
          hit.count = p.count || 1;
        } else if (p.kind === 'burn') {
          hit.dmg = Math.max(1, Math.round(dmg * p.dmgPct / 100));
          hit.dur = p.dur || 3;
        } else if (p.kind === 'freeze') {
          hit.dur = p.dur || 1;
        }
        procs.push(hit);
      });
    }
    return { dmg: dmg, crit: crit, healed: healed, procs: procs };
  }
  function gainTuVi(ch, base) {
    var r = rootOf(ch);
    var mult = ch.rate * (r ? r.mult : 1);
    var aStats = artifactStatsOf(ch);
    if (aStats && aStats.tuViPct) mult *= 1 + aStats.tuViPct / 100; // Đăng Tụ Khí...
    var gained = Math.max(1, Math.round(base * mult));
    ch.tuVi = Math.min(ch.tuViMax, ch.tuVi + gained);
    return gained;
  }
  // ---------- Đột phá: điều kiện, tỉ lệ, kết quả ----------
  // HỢP ĐỒNG ĐAN HỖ TRỢ ĐỘT PHÁ (cho team đan dược): một vật phẩm là đan
  // hỗ trợ đột phá khi định nghĩa của nó trong ITEMS có:
  //   breakthroughBonus: <số điểm % cộng tỉ lệ> (vd 10/20/30)
  //   pillCat: 'dot_pha'  (nhóm đan hỗ trợ đột phá)
  //   pillBand: 'so' | 'trung' | 'cao'  (băng tần, chỉ để hiển thị/lọc)
  // Engine tự quét túi đồ: chọn viên YẾU NHẤT vẫn đạt pillMin của tầng
  // đích (để dành viên mạnh), cộng đúng breakthroughBonus của viên đó
  // vào tỉ lệ, và TIÊU HAO 1 viên mỗi lần thử (thành công hay thất bại).
  // Ba viên mẫu dưới đây là định nghĩa tham chiếu của hợp đồng.
  function breakPillDef(itemId) {
    var def = ITEMS[itemId];
    return (def && typeof def.breakthroughBonus === 'number' && def.breakthroughBonus > 0) ? def : null;
  }
  function bestBreakPill(ch, pillMin) {
    var best = null;
    (ch.inventory || []).forEach(function (it) {
      var def = breakPillDef(it.id);
      if (!def || it.count <= 0) return;
      if (def.breakthroughBonus < (pillMin || 0)) return;
      if (!best || def.breakthroughBonus < best.bonus) {
        best = { id: it.id, name: def.name, bonus: def.breakthroughBonus, count: it.count };
      }
    });
    return best;
  }
  function countItem(ch, itemId) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === itemId) n += it.count || 0; });
    return n;
  }
  function consumeItem(ch, itemId, n) {
    n = n || 1;
    for (var i = 0; i < ch.inventory.length; i++) {
      if (ch.inventory[i].id === itemId) {
        if (ch.inventory[i].count < n) return false;
        ch.inventory[i].count -= n;
        if (ch.inventory[i].count <= 0) ch.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  // Thông tin đột phá đầy đủ cho UI + kiểm tra. qs = trạng thái nhiệm vụ
  // (để xét mốc truyện); opts = { place: id nơi đang đứng | null,
  // now: mốc ms (mặc định Date.now()) }.
  function breakthroughInfo(ch, qs, opts) {
    opts = opts || {};
    var now = typeof opts.now === 'number' ? opts.now : Date.now();
    var info = {
      atMax: false, targetTier: null, targetRealm: null, rule: null,
      rate: 0, rateParts: { base: 0, pill: 0, place: 0, root: 0, talisman: 0 },
      pill: { need: 0, used: null, met: true },
      yeuDan: { need: 0, have: 0, met: true },
      place: { need: null, at: null, met: true, bonus: 0 },
      conditions: [], canAttempt: false, cooldownLeft: 0
    };
    if (!ch) return info;
    if ((ch.tier || 0) >= TIERS.length - 1) {
      info.atMax = true;
      info.conditions.push({ id: 'max', label: 'Luyện Khí viên mãn', met: true, detail: 'Đã chạm ngưỡng Trúc Cơ — cảnh giới Trúc Cơ chưa mở.' });
      return info;
    }
    var target = ch.tier + 1;
    var rule = BREAK_RULES[target];
    info.targetTier = target;
    info.targetRealm = TIERS[target].realm;
    info.rule = rule;
    var root = rootOf(ch);
    info.conditions.push({ id: 'root', label: 'Đã lộ linh căn', met: !!root, detail: root ? root.name : 'Tới giếng cổ xem điềm lạ để lộ linh căn trước.' });
    var tuviMet = ch.tuVi >= ch.tuViMax;
    info.conditions.push({ id: 'tuvi', label: 'Tu vi đầy tầng', met: tuviMet, detail: Math.floor(ch.tuVi) + '/' + ch.tuViMax + ' tu vi' });
    var cdLeft = Math.max(0, Math.ceil(((ch.bpCdUntil || 0) - now) / 1000));
    info.cooldownLeft = cdLeft;
    info.conditions.push({ id: 'cooldown', label: 'Tâm cảnh ổn định', met: cdLeft <= 0, detail: cdLeft > 0 ? 'Đột phá thất bại còn dư chấn — cần ngộ đạo thêm ' + cdLeft + ' giây.' : 'Tâm cảnh vững, sẵn sàng.' });
    var pill = bestBreakPill(ch, rule.pillMin);
    info.pill.need = rule.pillMin;
    info.pill.used = pill;
    info.pill.met = rule.pillMin <= 0 || !!pill;
    info.conditions.push({
      id: 'pill', met: info.pill.met,
      label: rule.pillMin > 0 ? 'Đan hỗ trợ đột phá (cộng tối thiểu +' + rule.pillMin + '%)' : 'Đan hỗ trợ đột phá (không bắt buộc)',
      detail: pill ? (pill.name + ' +' + pill.bonus + '% — sẽ dùng 1 viên khi đột phá, mất cả khi thất bại.') : (rule.pillMin > 0 ? 'Túi chưa có đan hỗ trợ đủ mạnh.' : 'Chưa có đan hỗ trợ nào trong túi.')
    });
    // Nguyên liệu Yêu Đan Cấp 1 (lệnh Bui 21:58): điều kiện cứng, panel
    // đọc info.yeuDan.need/have; chỉ tiêu hao khi đột phá THÀNH CÔNG.
    var ydNeed = rule.yeuDan || 0;
    var ydHave = countItem(ch, 'yeu_dan_1');
    info.yeuDan.need = ydNeed;
    info.yeuDan.have = ydHave;
    info.yeuDan.met = ydHave >= ydNeed;
    if (ydNeed > 0) {
      info.conditions.push({
        id: 'yeudan', met: info.yeuDan.met,
        label: 'Yêu Đan Cấp 1 (nguyên liệu đột phá)',
        detail: info.yeuDan.met
          ? 'Đang có ' + ydHave + ' / cần ' + ydNeed + ' viên — chỉ trừ khi đột phá thành công, thất bại không mất.'
          : 'Thiếu Yêu Đan Cấp 1 — săn boss yêu thú để lấy (đang có ' + ydHave + ' / cần ' + ydNeed + ' viên).'
      });
    }
    var atPlace = (opts.place && BREAK_PLACES[opts.place]) ? BREAK_PLACES[opts.place] : null;
    info.place.at = atPlace ? atPlace.id : null;
    info.place.bonus = atPlace ? atPlace.bonus : 0;
    info.place.need = rule.placeReq;
    var placeMet = true, placeLabel = 'Linh địa (không bắt buộc)', placeDetail = atPlace ? ('Đang đứng ở ' + atPlace.name + ': cộng +' + atPlace.bonus + '% tỉ lệ.') : 'Đột phá ở giếng cổ hoặc Đài Vọng Vân được cộng tỉ lệ.';
    if (rule.placeReq === 'linh_dia') {
      placeMet = !!atPlace;
      placeLabel = 'Đột phá tại linh địa';
      placeDetail = atPlace ? ('Đang đứng ở ' + atPlace.name + '.') : 'Tầng này bắt buộc đột phá ở giếng cổ (linh nhãn) hoặc Đài Vọng Vân.';
    } else if (rule.placeReq) {
      var needPlace = BREAK_PLACES[rule.placeReq];
      placeMet = !!atPlace && atPlace.id === rule.placeReq;
      placeLabel = 'Đột phá tại ' + (needPlace ? needPlace.name : rule.placeReq);
      placeDetail = placeMet ? 'Đang đứng ở đúng linh địa.' : 'Tầng này bắt buộc lên ' + (needPlace ? needPlace.name : rule.placeReq) + ' mới đột phá được.';
    }
    info.place.met = placeMet;
    info.conditions.push({ id: 'place', label: placeLabel, met: placeMet, detail: placeDetail });
    if (rule.questReq) {
      var q = QUESTS[rule.questReq];
      var qMet = !!(qs && isTurnedIn(qs, rule.questReq));
      info.conditions.push({
        id: 'quest', met: qMet,
        label: 'Chứng đạo: ' + (q ? q.title : rule.questReq),
        detail: qMet ? 'Đã hoàn thành mốc truyện này.' : 'Cần hoàn thành nhiệm vụ "' + (q ? q.title : rule.questReq) + '" trước.'
      });
    }
    var rp = info.rateParts;
    rp.base = rule.baseRate;
    rp.pill = pill ? pill.bonus : 0;
    rp.place = atPlace ? atPlace.bonus : 0;
    rp.root = (root && typeof root.bpBonus === 'number') ? root.bpBonus : 0;
    // HỘ ĐẠO PHÙ (js/talismans.js): +8 điểm % khi đã đốt sẵn, nhưng TỔNG
    // hỗ trợ từ vật phẩm (đan + phù) trần cứng 40 điểm % (TALISMAN_ITEM_CAP
    // trong talismans.js) và tỉ lệ cuối vẫn kẹp 95 — đồ không bao giờ đưa
    // đột phá tới chắc chắn.
    rp.talisman = talismanHoDaoBonus(ch);
    var itemBonus = Math.min(talismanItemCap(), rp.pill + rp.talisman);
    info.rate = target === 1 ? 100 : Math.max(5, Math.min(95, rp.base + itemBonus + rp.place + rp.root));
    info.canAttempt = info.conditions.every(function (c) { return c.met; });
    return info;
  }
  function canBreakthrough(ch, qs, opts) {
    return breakthroughInfo(ch, qs, opts).canAttempt;
  }
  // Thử đột phá. opts = { place, now, rng }. Trả:
  //   { ok:false, reason:'conditions'|'max', info } — chưa đủ điều kiện,
  //     không thay đổi gì.
  //   { ok:true, attempted:true, success:true, realm, tier, rate, pillUsed, yeuDanUsed } —
  //     thành công: +1 tầng, +20 HP/+3 công/+1 thủ, tu vi về 0, hồi đầy
  //     HP, tiêu hao yeuDanUsed viên Yêu Đan Cấp 1 (chi phí nguyên liệu
  //     của tầng đích theo BREAK_RULES.yeuDan).
  //   { ok:true, attempted:true, success:false, rate, lostTuVi, cooldownSec, pillUsed,
  //     yeuDanUsed: 0 } — thất bại: mất failLossPct% tu vi hiện có,
  //     KHÔNG rớt tầng, KHÔNG mất Yêu Đan, dính thời gian ngộ đạo hồi
  //     phục (ch.bpCdUntil).
  function doBreakthrough(ch, qs, opts) {
    opts = opts || {};
    syncTier(ch);
    var now = typeof opts.now === 'number' ? opts.now : Date.now();
    var info = breakthroughInfo(ch, qs, { place: opts.place, now: now });
    if (!info.canAttempt) return { ok: false, reason: info.atMax ? 'max' : 'conditions', info: info };
    var rule = info.rule;
    var pillUsed = info.pill.used;
    if (pillUsed) consumeItem(ch, pillUsed.id, 1);
    talismanConsumeHoDao(ch); // Hộ Đạo Phù cháy hết theo lần thử này (kể cả thất bại)
    var rng = opts.rng || Math.random;
    if (rng() * 100 < info.rate) {
      // Yêu Đan Cấp 1: CHỈ trừ ở nhánh thành công này (lệnh Bui 21:58).
      var yeuDanUsed = 0;
      if (info.yeuDan.need > 0 && consumeItem(ch, 'yeu_dan_1', info.yeuDan.need)) yeuDanUsed = info.yeuDan.need;
      ch.tier += 1;
      ch.maxHp += BREAK_GROWTH.maxHp; ch.atk += BREAK_GROWTH.atk; ch.def += BREAK_GROWTH.def;
      ch.tuVi = 0;
      ch.bpCdUntil = 0;
      syncTier(ch);
      ch.hp = effMaxHp(ch);
      return { ok: true, attempted: true, success: true, realm: ch.realm, tier: ch.tier, rate: info.rate, pillUsed: pillUsed ? pillUsed.id : null, yeuDanUsed: yeuDanUsed };
    }
    var loss = Math.floor(ch.tuVi * rule.failLossPct / 100);
    ch.tuVi -= loss;
    ch.bpCdUntil = now + rule.cooldownSec * 1000;
    return { ok: true, attempted: true, success: false, realm: ch.realm, tier: ch.tier, rate: info.rate, lostTuVi: loss, cooldownSec: rule.cooldownSec, pillUsed: pillUsed ? pillUsed.id : null, yeuDanUsed: 0 };
  }
  // ---------- Vật phẩm, quái, chiến đấu ----------
  var ITEMS = {
    thit_ga: { name: 'Thịt Gà', desc: 'Thịt gà rừng nướng thơm. Hồi 15 Máu.', heal: 15 },
    thit_tho: { name: 'Thịt Thỏ', desc: 'Thịt thỏ mềm. Hồi 12 Máu.', heal: 12 },
    thit_lon: { name: 'Thịt Lợn', desc: 'Thịt lợn rừng chắc nịch. Hồi 30 Máu.', heal: 30 },
    thao_duoc: { name: 'Thảo Dược', desc: 'Cầm máu, hồi 25 Máu.', heal: 25 },
    da_soi: { name: 'Da Sói', desc: 'Da sói con, thợ rèn thu mua.', heal: 0 },
    long_ga: { name: 'Lông Gà', desc: 'Lông gà rừng, nhẹ và đẹp.', heal: 0 },
    linh_chi: { name: 'Linh Chi', desc: 'Nấm linh chi mọc gần suối linh trong Rừng Thanh Sơn, tai nấm ánh xanh. Vật phẩm nhiệm vụ và nguyên liệu thuốc mạnh.', heal: 0 },
    // ----- Linh dược + đan dược (hệ luyện đan js/alchemy.js) -----
    // Dược liệu: nguyên liệu luyện đan, không dùng trực tiếp (heal 0).
    // Đan dược: tác dụng thật nằm ở PNT_ALCHEMY.PILLS — useItem uỷ quyền
    // sang alchemy.usePill; ở đây chỉ giữ tên + mô tả cho túi đồ.
    thanh_tam_thao: { name: 'Thanh Tâm Thảo', desc: 'Cỏ thơm hoa trắng nhỏ, tĩnh tâm hạ sốt. Nguyên liệu luyện đan.', heal: 0 },
    huyet_sam: { name: 'Huyết Sâm', desc: 'Củ sâm đỏ thẫm mọc nơi đất rừng lâu năm cạnh sào huyệt yêu thú. Nguyên liệu luyện đan đại bổ.', heal: 0 },
    tu_linh_qua: { name: 'Tụ Linh Quả', desc: 'Quả nhỏ vỏ ánh linh quang, tụ linh khí trong thịt quả. Nguyên liệu luyện đan, khỉ mặt đỏ cũng hay tha về tổ.', heal: 0 },
    doc_tam_hoa: { name: 'Độc Tâm Hoa', desc: 'Hoa tím nhụy đỏ mọc nơi rắn lục làm ổ, cánh hoa chứa độc nhẹ. Nguyên liệu luyện đan lấy độc trị độc.', heal: 0 },
    ngoc_tuy_chi: { name: 'Ngọc Tủy Chi', desc: 'Nấm trắng trong như ngọc, tủy nấm là tinh tuý linh khí đọng nhiều năm. Nguyên liệu luyện đan cao cấp.', heal: 0 },
    son_tinh: { name: 'Sơn Tinh', desc: 'Củ rễ hình người, tinh hoa của cả dãy núi kết lại. Nguyên liệu luyện đan Thiên phẩm.', heal: 0 },
    thanh_linh_tuy: { name: 'Thanh Linh Tủy', desc: 'Giọt tủy linh khí trong suốt đọng trong kẽ đá cạnh ao linh. Nguyên liệu luyện đan cao cấp.', heal: 0 },
    // ----- HẠT GIỐNG LINH ĐIỀN (Động Phủ + Linh Điền, js/dong-phu.js):
    // gieo ở linh điền trong động phủ, lớn theo GIỜ THẬT rồi thu hoạch
    // dược tương ứng (1 ô = 2 dược). Mua bằng Linh Thạch tại panel Động
    // Phủ (Lý Tiểu Hạnh gửi bán) hoặc rơi 12% khi hái chính dược đó
    // ngoài hoang. Giá + giờ chín nằm ở PNT_DONGPHU.SEEDS. Sơn Tinh
    // không có hạt — tinh hoa núi kết trăm năm, không trồng được.
    hat_thao_duoc: { name: 'Hạt Thảo Dược', desc: 'Hạt cỏ thuốc phơi khô của nhà họ Lý. Gieo ở linh điền trong động phủ, khoảng 30 phút là thu được Thảo Dược.', heal: 0 },
    hat_thanh_tam_thao: { name: 'Hạt Thanh Tâm Thảo', desc: 'Hạt cỏ thơm hoa trắng. Gieo ở linh điền, khoảng 45 phút là thu được Thanh Tâm Thảo.', heal: 0 },
    hat_linh_chi: { name: 'Hạt Linh Chi', desc: 'Bào tử linh chi đựng trong ống tre. Gieo ở linh điền, khoảng 2 giờ là thu được Linh Chi.', heal: 0 },
    hat_tu_linh_qua: { name: 'Hạt Tụ Linh Quả', desc: 'Hạt quả tụ linh, vỏ hạt ánh linh quang. Gieo ở linh điền, khoảng 3 giờ là thu được Tụ Linh Quả.', heal: 0 },
    hat_huyet_sam: { name: 'Hạt Huyết Sâm', desc: 'Hạt sâm đỏ hiếm, phải ủ đất mùn ẩm. Gieo ở linh điền, khoảng 4 giờ là thu được Huyết Sâm.', heal: 0 },
    hat_doc_tam_hoa: { name: 'Hạt Độc Tâm Hoa', desc: 'Hạt hoa tím nhụy đỏ, cầm phải cẩn thận. Gieo ở linh điền, khoảng 4 giờ là thu được Độc Tâm Hoa.', heal: 0 },
    hat_ngoc_tuy_chi: { name: 'Hạt Ngọc Tủy Chi', desc: 'Bào tử nấm ngọc trong hộp sáp ong. Gieo ở linh điền, khoảng 8 giờ là thu được Ngọc Tủy Chi.', heal: 0 },
    hat_thanh_linh_tuy: { name: 'Hạt Thanh Linh Tủy', desc: 'Giọt tủy giống kết tinh trong đá lạnh. Gieo ở linh điền, khoảng 12 giờ là thu được Thanh Linh Tủy.', heal: 0 },
    // ----- Linh dược / khoáng linh CHẶNG CẢNH GIỚI CAO của Thập Vạn Đại Sơn
    // (map 8–14, js/maps.js) — nguyên liệu farm cho điều kiện đột phá các
    // cảnh giới sau này (Trúc Cơ trở lên). Tên là ĐỀ XUẤT. Chưa đăng ký vào
    // bảng HERBS của js/alchemy.js (test của hệ đan dược ghim cứng số loại)
    // nên mọc lại theo mặc định 30s; vòng tích hợp sẽ bổ sung grade/respawn.
    long_tien_thao: { name: 'Long Tiên Thảo', desc: 'Cỏ tiên lá dài ánh bạc mọc ở Sơn Trung Vân Hải sâu trong Thập Vạn Đại Sơn, thấm linh khí biển mây. Nguyên liệu luyện đan cho tu sĩ Trúc Cơ.', heal: 0 },
    van_nien_linh_chi: { name: 'Vạn Niên Linh Chi', desc: 'Linh chi sống ngàn năm trên Đoạn Long Lĩnh, tai nấm tím sẫm viền vàng. Nguyên liệu luyện đan cao cấp.', heal: 0 },
    hoa_diem_lien: { name: 'Hỏa Diệm Liên', desc: 'Sen lửa nở giữa hoang nguyên dung nham Xích Diệm, cánh đỏ rực mà không cháy. Nguyên liệu luyện đan hệ Hỏa.', heal: 0 },
    bang_tinh_hoa: { name: 'Băng Tinh Hoa', desc: 'Hoa băng nở ven hồ đóng băng ở Hàn Băng Cốc, cánh trong như thủy tinh. Nguyên liệu luyện đan hệ Băng.', heal: 0 },
    thien_loi_qua: { name: 'Thiên Lôi Quả', desc: 'Quả tím đọng điện quang ở Lôi Trì Thiên Khanh, vỏ quả thi thoảng tóe tia sét nhỏ. Nguyên liệu luyện đan cao cấp.', heal: 0 },
    tinh_van_thach: { name: 'Tinh Vẫn Thạch', desc: 'Mảnh đá sao rơi ở Tinh Vẫn Chi Địa, nặng và lạnh, lõi đá ánh sao. Khoáng linh dùng luyện khí và luyện đan.', heal: 0 },
    thien_lien: { name: 'Thiên Liên', desc: 'Sen trời nở trên Độ Kiếp Đài ở đỉnh Thập Vạn Đại Sơn, tương truyền chỉ nở khi có người sắp độ kiếp. Nguyên liệu luyện đan Thiên phẩm.', heal: 0 },
    hoi_khi_tan: { name: 'Hồi Khí Tán', desc: 'Bột thuốc cầm máu hồi sức của nhà thuốc họ Lý. Hồi 30 Máu.', heal: 0 },
    linh_khi_tan: { name: 'Linh Khí Tán', desc: 'Bột tán từ Thanh Tâm Thảo. Hồi 20 linh lực.', heal: 0 },
    hoi_xuan_dan: { name: 'Hồi Xuân Đan', desc: 'Viên đan xanh ngọc từ linh chi và thảo dược. Hồi 70 Máu.', heal: 0 },
    tu_linh_dan: { name: 'Tụ Linh Đan', desc: 'Đan luyện từ Tụ Linh Quả. Hồi 45 linh lực.', heal: 0 },
    tieu_boi_nguyen_dan: { name: 'Tiểu Bồi Nguyên Đan', desc: 'Đan bồi nguyên khí cho người mới tu. Dùng được +25 tu vi.', heal: 0 },
    giai_doc_dan: { name: 'Giải Độc Đan', desc: 'Đan giải độc trứ danh của Lý lão. Giải mọi độc đang mang trên người.', heal: 0 },
    dai_hoi_xuan_dan: { name: 'Đại Hồi Xuân Đan', desc: 'Bản lớn của Hồi Xuân Đan theo phương Đan Hà Cốc. Hồi 140 Máu.', heal: 0 },
    cuong_the_dan: { name: 'Cường Thể Đan', desc: 'Đan từ Huyết Sâm làm gân cốt cứng cáp. Giáp +4 trong 5 phút.', heal: 0 },
    than_hanh_dan: { name: 'Thần Hành Đan', desc: 'Đan nhẹ thân từ Tụ Linh Quả. Tốc độ +15% trong 4 phút.', heal: 0 },
    sinh_co_dan: { name: 'Sinh Cơ Đan', desc: 'Đan sinh cơ của Đan Hà Cốc. Hồi 260 Máu và giải độc.', heal: 0 },
    dai_boi_nguyen_dan: { name: 'Đại Bồi Nguyên Đan', desc: 'Đan bồi nguyên bậc cao từ Ngọc Tủy Chi và Thanh Linh Tủy. Dùng được +80 tu vi.', heal: 0 },
    chien_y_dan: { name: 'Chiến Ý Đan', desc: 'Đan lấy độc trị thân của Đan Hà Cốc. Công +20% trong 5 phút.', heal: 0 },
    cuu_chuyen_hoi_hon_dan: { name: 'Cửu Chuyển Hồi Hồn Đan', desc: 'Đan Thiên phẩm luyện chín lần mới thành. Hồi đầy 100% Máu.', heal: 0 },
    nanh_son_quan: { name: 'Nanh Sơn Quân', desc: 'Nanh của lợn vương Sơn Quân, hút linh khí trăm năm. Vật phẩm cốt truyện: vật trấn trong lễ khấn trấn phong ấn giếng cổ.', heal: 0 },
    // Vật ký danh kỳ ngộ tông nhóm 1 (mục 22 hàng chờ): để trứng lại
    // cho thú mẹ ở Tổ Cổ thì nhận ấn này làm tin (kèm cờ Ân Thú).
    van_thu_an: { name: 'Vạn Thú Ấn', desc: 'Ấn gỗ khắc dấu chân thú của Vạn Thú Môn, làm tin cho lời hứa để trứng lại cho thú mẹ ở Tổ Cổ. Vật phẩm cốt truyện, không bán được.', heal: 0 },
    // Vật ký danh kỳ ngộ tông nhóm 2 (mục 23 hàng chờ): phá 3 tầng
    // bia khí sau thác ở Bia Luyện Thể Sau Thác thì nhận mảnh này
    // làm tín vật (vật cốt truyện, không cộng điểm luyện thể).
    thiet_bia_tan_phien: { name: 'Thiết Bia Tàn Phiến', desc: 'Mảnh bia đá luyện thể vỡ ra sau thác Đại Sơn, nặng và lạnh. Vật phẩm cốt truyện: tín vật để đệ tử Kim Cang nhận ra nhau khi hộ pháp độ kiếp.', heal: 0 },
    thit_son_quan: { name: 'Thịt Sơn Quân', desc: 'Thịt lợn vương chắc và bổ. Hồi 60 Máu.', heal: 60 },
    // ----- Yêu Đan (lệnh Bui 21:45 29/10): nội đan của yêu thú, CHỈ rơi
    // từ BOSS (Sơn Quân cốt truyện, 8 boss thế giới ở js/bosses.js, boss
    // bí cảnh ở js/secret-realms.js) — quái thường/tinh anh không rơi.
    // Cấp 1 là CHI PHÍ NGUYÊN LIỆU cho mọi lần đột phá tầng Luyện Khí
    // (BREAK_RULES.yeuDan, lệnh Bui 21:58 29/10); Cấp 2/3 để dành cho
    // nguyên liệu các cảnh giới lớn sau này (Trúc Cơ Đan lấy Cấp 3 làm
    // lõi). Vật phẩm thường trong ITEMS nên không có đường bán như vũ
    // khí/pháp bảo — người chơi giữ lại tích trữ thay vì bán sạch.
    yeu_dan_1: { name: 'Yêu Đan Cấp 1', desc: 'Nội đan của yêu thú, kết thành sau trăm năm hút linh khí. Nguyên liệu tăng cấp Luyện Khí: mỗi lần đột phá tầng cần 1–2 viên (chỉ trừ khi đột phá thành công, thất bại không mất). Yêu Đan cấp cao hơn để dành luyện Trúc Cơ Đan sau này. Chỉ rơi từ boss yêu thú.', heal: 0 },
    yeu_dan_2: { name: 'Yêu Đan Cấp 2', desc: 'Nội đan của yêu vương mạnh, linh khí đặc quánh ánh kim. Nguyên liệu luyện Trúc Cơ Đan — giữ lại để đột phá Trúc Cơ sau này. Chỉ rơi từ boss yêu thú mạnh.', heal: 0 },
    yeu_dan_3: { name: 'Yêu Đan Cấp 3', desc: 'Nội đan kết tinh của vương thú trấn Thập Vạn Đại Sơn, linh khí tím đặc quánh như ngọc sống. Nguyên liệu cốt lõi luyện Trúc Cơ Đan — chỉ rơi từ vương thú Thập Vạn Đại Sơn.', heal: 0 },
    kim_bai_dai_hoi: { name: 'Kim Bài Đại Hội', desc: 'Phần thưởng ký danh của Đại Hội Tu Tiên — tấm kim bài khắc ấn mười tông môn, chỉ trao cho QUÁN QUÂN bảng Luyện Khí. Không nơi nào bán, không quái nào rơi; giữ làm minh chứng một kỳ đại hội.', heal: 0 },
    thien_bai_dai_hoi: { name: 'Thiên Bài Quán Quân', desc: 'Phần thưởng ký danh tối cao của Đại Hội Tu Tiên — thiên bài lưu quang khắc ấn mười tông môn, chỉ trao cho QUÁN QUÂN bảng Trúc Cơ. Vật vô giá, chỉ có một chủ nhân mỗi kỳ đại hội.', heal: 0 },
    thien_nien_linh_nhu: { name: 'Thiên Niên Linh Nhũ', desc: 'Nhũ linh khí đọng ngàn năm trong lòng động đá, trắng ngà thơm mát. Thiên tài địa bảo chỉ xuất hiện ngẫu nhiên trong bí cảnh — nguyên liệu luyện đan cao cấp, hỗ trợ đột phá cảnh giới.', heal: 0 },
    dia_tam_ngoc_tuy: { name: 'Địa Tâm Ngọc Tủy', desc: 'Tủy ngọc kết tinh nơi địa tâm nóng chảy nguội dần, cầm lên ấm tay, linh khí dày đặc. Thiên tài địa bảo của bí cảnh — luyện đan cao cấp và luyện khí đều cầu mà không được.', heal: 0 },
    ngu_hanh_linh_chau: { name: 'Ngũ Hành Linh Châu', desc: 'Hạt châu ngũ sắc tự xoay chậm như có linh tính, năm hệ linh khí cân bằng trong một hạt. Thiên tài địa bảo hiếm của bí cảnh — phụ liệu quý cho đan phương đột phá.', heal: 0 },
    // Đan hỗ trợ đột phá — định nghĩa THAM CHIẾU cho hợp đồng với team
    // đan dược (xem breakPillDef/breakthroughInfo): pillCat 'dot_pha',
    // pillBand so/trung/cao, breakthroughBonus = điểm % cộng tỉ lệ.
    // Không dùng trực tiếp từ túi (heal 0) — engine đột phá tự tiêu hao.
    tu_khi_dan: { name: 'Tụ Khí Đan', desc: 'Đan hỗ trợ đột phá sơ cấp: cộng 10% tỉ lệ đột phá, dùng 1 viên mỗi lần đột phá (mất cả khi thất bại).', heal: 0, pillCat: 'dot_pha', pillBand: 'so', breakthroughBonus: 10 },
    ngung_khi_dan: { name: 'Ngưng Khí Đan', desc: 'Đan hỗ trợ đột phá trung cấp: cộng 20% tỉ lệ đột phá, dùng 1 viên mỗi lần đột phá (mất cả khi thất bại).', heal: 0, pillCat: 'dot_pha', pillBand: 'trung', breakthroughBonus: 20 },
    pha_canh_dan: { name: 'Phá Cảnh Đan', desc: 'Đan hỗ trợ đột phá cao cấp: cộng 30% tỉ lệ đột phá, dùng 1 viên mỗi lần đột phá (mất cả khi thất bại).', heal: 0, pillCat: 'dot_pha', pillBand: 'cao', breakthroughBonus: 30 },
    // Trúc Cơ Đan: ĐAN DẪN KIẾP cho mốc LIÊN cảnh giới Luyện Khí 9 ->
    // Trúc Cơ (lệnh Bui 22:00 29/10: lõi của phương là Yêu Đan Cấp 3 —
    // công thức nằm ở js/alchemy.js). Không ăn trực tiếp, không có
    // breakthroughBonus (không phải đan hỗ trợ tỉ lệ): khi người chơi
    // dẫn động lôi kiếp Trúc Cơ, js/realms.js tiêu hao 1 viên — chết
    // giữa kiếp là mất viên đan.
    truc_co_dan: { name: 'Trúc Cơ Đan', desc: 'Đan dẫn kiếp luyện từ Yêu Đan Cấp 3 — viên đan kết thành đạo cơ mới chịu nổi thiên lôi Trúc Cơ. Khi đột phá từ Luyện Khí tầng 9 lên Trúc Cơ, lò tu hành tự dùng 1 viên để dẫn động lôi kiếp (mất cả khi độ kiếp thất bại).', heal: 0, pillCat: 'dan_kiep' },
    lenh_bai_thanh_phong: { name: 'Lệnh Bài Thanh Phong', desc: 'Lệnh bài gỗ xanh khắc mây gió của Thanh Phong Phái. Chứng nhận đệ tử nhập môn, không dùng được, không bán.', heal: 0 },
    lenh_bai_huyen_phap: { name: 'Lệnh Bài Huyền Pháp', desc: 'Lệnh bài tím khắc ngũ hành luân của Huyền Pháp Tông. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_thien_cong: { name: 'Lệnh Bài Thiên Tấn công', desc: 'Lệnh bài đồng khắc chùy rèn của Thiên Công Phường. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_dan_ha: { name: 'Lệnh Bài Đan Hà', desc: 'Lệnh bài đỏ khắc lò đan của Đan Hà Cốc. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_van_thu: { name: 'Lệnh Bài Vạn Thú', desc: 'Lệnh bài xanh rêu khắc dấu chân thú của Vạn Thú Môn. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_thien_phu: { name: 'Lệnh Bài Thiên Phù', desc: 'Lệnh bài vàng khắc nét bùa chu sa của Thiên Phù Các. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_cuu_cung: { name: 'Lệnh Bài Cửu Cung', desc: 'Lệnh bài chàm khắc cửu cung bát quái của Cửu Cung Trận Tông. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_kim_cang: { name: 'Lệnh Bài Kim Cang', desc: 'Lệnh bài đồng vàng khắc nắm quyền của Kim Cang Môn. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_ngu_doc: { name: 'Lệnh Bài Ngũ Độc', desc: 'Lệnh bài lục trầm khắc trăng khuyết của Ngũ Độc Giáo. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    lenh_bai_huyen_am: { name: 'Lệnh Bài Huyền Âm', desc: 'Lệnh bài bạc khắc dây đàn của Huyền Âm Cung. Nhận khi bái nhập tông môn này ở Sơn Môn Đại Hội, không dùng được, không bán.', heal: 0 },
    // ----- VẬT DẤU ẤN NGUỒN GỐC (mục 19 hàng chờ, docs/origins-and-encounters.md):
    // 15 vật cốt truyện, không chỉ số, heal 0 (không dùng trực tiếp
    // được), không nằm trong danh sách bán của shop nào nên không bán
    // được — giá trị nằm ở thoại NPC nhận ra + kỳ ngộ riêng (mục 20/21).
    kiem_gi_cua_cha: { name: 'Kiếm Gỉ Của Cha', desc: 'Thanh kiếm đã gỉ của cha — tiêu sư chết trên đường nam mười lăm năm trước. Dấu ấn của Kiếm Khách Lãng Du, không dùng được, không bán.', heal: 0 },
    nua_quyen_thanh_khe_chi: { name: 'Nửa Quyển Thanh Khê Chí', desc: 'Nửa quyển sách chép tay về làng Thanh Khê do cha để lại. Dấu ấn của Thư Sinh Ôn Nhuận, không dùng được, không bán.', heal: 0 },
    la_bua_khong_chu: { name: 'Lá Bùa Không Chữ', desc: 'Lá bùa giấy vàng sư phụ để lại, trên mặt không một nét mực. Dấu ấn của Đạo Sĩ Vân Du, không dùng được, không bán.', heal: 0 },
    nanh_soi_dau_tien: { name: 'Nanh Sói Đầu Tiên', desc: 'Chiếc nanh của con sói đầu tiên tự hạ năm 14 tuổi. Dấu ấn của Thợ Săn Sơn Dã, không dùng được, không bán.', heal: 0 },
    hat_trang_go_chay_sem: { name: 'Hạt Tràng Gỗ Cháy Sém', desc: 'Nửa tràng hạt còn lại từ đêm chùa trên núi cháy. Dấu ấn của Tiểu Hòa Thượng, không dùng được, không bán.', heal: 0 },
    hat_giong_lua_cu_cua_ba: { name: 'Hạt Giống Lúa Cũ Của Bà', desc: 'Giống lúa cũ nhà ba đời, từng cứu đói cả làng năm mất mùa. Dấu ấn của Thôn Phu Cường Tráng, không dùng được, không bán.', heal: 0 },
    lenh_bai_tieu_cuc_ran: { name: 'Lệnh Bài Tiêu Cục Rạn', desc: 'Lệnh bài tiêu cục phương bắc của cha, đã rạn một góc. Dấu ấn của Nữ Hiệp Hồng Y, không dùng được, không bán.', heal: 0 },
    gio_thuoc_cua_me: { name: 'Giỏ Thuốc Của Mẹ', desc: 'Chiếc giỏ hái thuốc của mẹ — dược nương mất trong mùa dịch năm xưa. Dấu ấn của Dược Nương Hoa Cài, không dùng được, không bán.', heal: 0 },
    ngoc_boi_khuyet_mot_goc: { name: 'Ngọc Bội Khuyết Một Góc', desc: 'Miếng ngọc đeo từ khi được tìm thấy cạnh suối linh, khuyết đúng một góc. Dấu ấn của Tiên Tử Áo Tím, không dùng được, không bán.', heal: 0 },
    sung_nai_gac_dau_tien: { name: 'Sừng Nai Gác Đầu Tiên', desc: 'Chiếc sừng nai đầu tiên săn được ở bìa rừng, buộc dây cung kiểu dân giữ rừng. Dấu ấn của Sơn Nữ Thợ Săn, không dùng được, không bán.', heal: 0 },
    con_dau_trien_gia_truyen: { name: 'Con Dấu Triện Gia Truyền', desc: 'Con triện nhà bán sách giấy ở trấn trên, mang theo khi xuống Thanh Khê tránh nợ. Dấu ấn của Tài Nữ Thư Hương, không dùng được, không bán.', heal: 0 },
    khan_hoa_dao_cua_chi: { name: 'Khăn Hoa Đào Của Chị', desc: 'Chiếc khăn chị gái thêu cho trước khi đi lấy chồng xa qua đường nam. Dấu ấn của Thôn Nữ Hoa Đào, không dùng được, không bán.', heal: 0 },
    cuoc_cu_cua_cha: { name: 'Cuốc Cũ Của Cha', desc: 'Chiếc cuốc mòn cán của người làng Thanh Khê chính gốc. Dấu ấn nền của Nông Dân Thanh Khê, không dùng được, không bán.', heal: 0 },
    mui_ten_gay_dau_tien: { name: 'Mũi Tên Gãy Đầu Tiên', desc: 'Mũi tên gãy đầu tiên học việc ở lán Hà lão. Dấu ấn nền của Thợ Săn Thanh Khê, không dùng được, không bán.', heal: 0 },
    nghien_muc_nut: { name: 'Nghiên Mực Nứt', desc: 'Nghiên mực nứt dùng chép sách ở đình làng. Dấu ấn nền của Thư Sinh Thanh Khê, không dùng được, không bán.', heal: 0 },
    // ----- VẬT KÝ DANH SINH RA TRONG KỲ NGỘ NGUỒN GỐC NHÓM A (mục 20
    // hàng chờ, docs/origins-and-encounters.md mục 2–3): vật cốt truyện
    // như dấu ấn (heal 0, không dùng trực tiếp, không bán), chỉ khác là
    // chúng sinh ra TRONG kỳ ngộ chứ không có sẵn lúc tạo nhân vật.
    kiem_cua_cha_da_mai: { name: 'Kiếm Của Cha — Đã Mài', desc: 'Kiếm gỉ của cha sau khi mài lại bằng đá linh trong động cột đá — vết gỉ hết, chiêu kiếm dở dang trên cột đã ngộ. Vật ký danh của Kiếm Khách Lãng Du, không dùng được, không bán.', heal: 0 },
    long_linh_ho: { name: 'Lông Linh Hồ', desc: 'Chiếc lông linh hồ non để lại sau khi được băng bó rồi thả đi — rừng nhớ ân này. Vật ký danh của Thợ Săn Sơn Dã, không dùng được, không bán.', heal: 0 },
    // ----- VẬT KÝ DANH SINH RA TRONG KỲ NGỘ NGUỒN GỐC NHÓM B (mục 21
    // hàng chờ, docs/origins-and-encounters.md mục 2–3): cùng khuôn vật
    // cốt truyện như nhóm A (heal 0, không dùng trực tiếp, không bán),
    // trừ Đào Linh / Lúa Linh là đồ ăn theo đúng tài liệu chính.
    chuong_dong_nho: { name: 'Chuông Nhỏ', desc: 'Chuông nhỏ bằng đồng nhặt dưới đống tro nền chùa cũ trên đồi sau làng — tiếng chuông không người gõ đêm đó vẫn còn vang. Vật ký danh của Tiểu Hòa Thượng, không dùng được, không bán.', heal: 0 },
    manh_ngoc_khuyet: { name: 'Mảnh Ngọc Khuyết', desc: 'Mảnh ngọc thứ hai vớt dưới đáy suối linh — khớp đúng góc khuyết của Ngọc Bội Khuyết Một Góc. Vật ký danh của Tiên Tử Áo Tím, không dùng được, không bán.', heal: 0 },
    dao_linh_qua: { name: 'Đào Linh', desc: 'Quả đào rụng từ gốc đào cổ nở hoa trái mùa trong đêm — linh khí thấm vào thịt quả. Đồ ăn hồi 60 Máu, ngang Thịt Sơn Quân theo tài liệu chính.', heal: 60 },
    lua_linh: { name: 'Lúa Linh', desc: 'Bông lúa linh thu từ linh điền động phủ — hạt lúa cũ của bà nảy mầm trong linh khí. Lương thực linh, hồi 30 Máu; để dành cho Thiên 6 khi đường buôn bị cắt.', heal: 30 },
    hat_lua_linh: { name: 'Hạt Lúa Linh', desc: 'Hạt giống lúa linh thu được ở mảnh ruộng phát sáng sau mưa. Gieo ở linh điền trong động phủ, khoảng 2 giờ là thu được Lúa Linh — chỉ có từ kỳ ngộ nguồn gốc, không bán ở cửa phủ.', heal: 0 },
    // ----- Quyển ĐAN PHƯƠNG rơi từ BOSS THẾ GIỚI (lệnh Bui 22:10
    // 29/10): vật phẩm dạng bí tịch — BẤM DÙNG (đọc) trong túi để HỌC
    // đan phương tương ứng qua PNT_ALCHEMY.useRecipeScroll (học mở khóa
    // VĨNH VIỄN, là đường học thay thế ngoài chuỗi Lý lão/nhiệm vụ/Đan
    // Hà). Trường recipeScroll = id ĐAN trong PNT_ALCHEMY.PILLS. Quyển
    // chỉ tiêu hao khi học thành công phương mới; đã học rồi thì đọc
    // lại chỉ báo đã học và GIỮ NGUYÊN quyển (vật phẩm thường không có
    // đường bán — cách ít phá vỡ nhất). Bảng rơi nằm ở js/bosses.js.
    dp_giai_doc_dan: { name: 'Đan Phương: Giải Độc Đan', desc: 'Quyển phương chép tay nhặt từ ổ Xà Vương Đuôi Đỏ — phương giải độc trứ danh của Lý lão viết bằng mực nọc rắn pha. Bấm dùng trong túi để học đan phương Giải Độc Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'giai_doc_dan' },
    dp_tu_linh_dan: { name: 'Đan Phương: Tụ Linh Đan', desc: 'Quyển phương Hầu Vương Mặt Đỏ tha về tổ cùng Tụ Linh Quả — phương luyện đan hồi linh lực từ quả tụ linh. Bấm dùng trong túi để học đan phương Tụ Linh Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'tu_linh_dan' },
    dp_than_hanh_dan: { name: 'Đan Phương: Thần Hành Đan', desc: 'Quyển phương buộc ở cổ Lang Vương Huyết Nguyệt, giấy nhẹ như gió — phương đan nhẹ thân tăng tốc độ. Bấm dùng trong túi để học đan phương Thần Hành Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'than_hanh_dan' },
    dp_cuong_the_dan: { name: 'Đan Phương: Cường Thể Đan', desc: 'Quyển phương giấu trong sào huyệt Sơn Quân — phương đan từ Huyết Sâm làm gân cốt cứng cáp. Bấm dùng trong túi để học đan phương Cường Thể Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'cuong_the_dan' },
    dp_dai_hoi_xuan_dan: { name: 'Đan Phương: Đại Hồi Xuân Đan', desc: 'Quyển phương Thiết Bì Vương nuốt phải từ một hành trang cũ — bản lớn của Hồi Xuân Đan theo lối Đan Hà Cốc, nay khỏi cần qua phép thử của cốc cũng học được. Bấm dùng trong túi để học đan phương Đại Hồi Xuân Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'dai_hoi_xuan_dan' },
    dp_sinh_co_dan: { name: 'Đan Phương: Sinh Cơ Đan', desc: 'Quyển phương Cổ Mãng Vương giữ trong phế tích — đan sinh cơ bậc cao, thịt nát xương gãy cũng liền lại. Vốn chỉ truyền cho đệ tử Đan Hà, đây là đường học thay thế. Bấm dùng trong túi để học đan phương Sinh Cơ Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'sinh_co_dan' },
    dp_chien_y_dan: { name: 'Đan Phương: Chiến Ý Đan', desc: 'Quyển phương trong Hang Hổ Gầm — đan lấy độc trị thân, ăn vào huyết khí sôi lên, công tăng hẳn. Vốn chỉ truyền cho đệ tử Đan Hà, đây là đường học thay thế. Bấm dùng trong túi để học đan phương Chiến Ý Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'chien_y_dan' },
    dp_dai_boi_nguyen_dan: { name: 'Đan Phương: Đại Bồi Nguyên Đan', desc: 'Quyển phương Gầm Sơn Hổ Vương chôn dưới hang — đan bồi nguyên bậc cao, một viên bằng nhiều ngày thổ nạp. Bấm dùng trong túi để học đan phương Đại Bồi Nguyên Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'dai_boi_nguyen_dan' },
    dp_ngung_khi_dan: { name: 'Đan Phương: Ngưng Khí Đan', desc: 'Quyển phương của vương thú Thập Vạn Đại Sơn — phương đan HỖ TRỢ ĐỘT PHÁ trung cấp (+20% tỉ lệ), đường học thay thế ngoài nhiệm vụ của Lý lão. Bấm dùng trong túi để học đan phương Ngưng Khí Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'ngung_khi_dan' },
    dp_pha_canh_dan: { name: 'Đan Phương: Phá Cảnh Đan', desc: 'Quyển phương Thiết Bì Ma Vương giữ sâu trong Hang Vực Sâu — phương đan HỖ TRỢ ĐỘT PHÁ cao cấp nhất vùng Thanh Sơn (+30% tỉ lệ), vốn chỉ truyền cho đệ tử Đan Hà sau lễ bái sư. Bấm dùng trong túi để học đan phương Phá Cảnh Đan (học rồi thì quyển thừa không mất, đọc lại chỉ báo đã học).', heal: 0, recipeScroll: 'pha_canh_dan' },
    // ----- PHÙ CHÚ (hệ phù chú js/talismans.js, lệnh Bui 07:01+07:04
    // 2026-10-30): vật phẩm tiêu hao dùng 1 lần, tác dụng thật nằm ở
    // PNT_TALISMANS.useTalisman — useItem uỷ quyền sang đó. Ở đây chỉ
    // giữ tên + mô tả cho túi đồ (heal 0). Bùa Ngự Thú KHÔNG khai ở đây:
    // js/pets.js tự đăng ký (giữ nguyên đường cũ).
    giay_phu: { name: 'Giấy Phù', desc: 'Giấy vàng phơi nắng giếng cổ, sợi giấy từ cỏ thuốc bờ suối linh. Nguyên liệu nền của mọi lá phù — chế từ 3 Thảo Dược tại Bàn Phù hoặc mua ở Diệp Phù Sinh/thương nhân.', heal: 0 },
    giay_phu_thien: { name: 'Giấy Phù Thiên', desc: 'Tờ giấy vàng viền kim tuyến tự phát sáng mờ, chỉ rơi từ boss vương thú Thập Vạn Đại Sơn. Nguyên liệu viết Thế Lôi Phù — giấy thường không chịu nổi phù Thiên phẩm.', heal: 0 },
    chu_sa: { name: 'Chu Sa', desc: 'Khoáng đỏ mài mịn từ đất đá bờ mỏ — mực đỏ khóa linh khí của phù tu. Mua ở thương nhân/Diệp Phù Sinh, hoặc nhặt được khi Lợn Mông Sắt ủi đất đỏ (rơi 30%).', heal: 0 },
    linh_mac: { name: 'Linh Mặc', desc: 'Mực đen mài từ Linh Chi và Thanh Tâm Thảo, nét bùa viết bằng mực này giữ linh khí không thoát. Chỉ chế tại Bàn Phù, không nơi nào bán.', heal: 0 },
    hoa_phu_pham: { name: 'Hỏa Phù (Phàm)', desc: 'Phù công kích dùng 1 lần: nổ lửa vùng nhỏ quanh quái gần nhất, sát thương theo công (có trần, yếu hơn skill cùng cấp). Chế tại Bàn Phù của Diệp Phù Sinh.', heal: 0 },
    hoa_phu_linh: { name: 'Hỏa Phù (Linh)', desc: 'Phù công kích dùng 1 lần: nổ lửa vùng 100 quanh quái gần nhất, sát thương theo công (có trần).', heal: 0 },
    hoa_phu_huyen: { name: 'Hỏa Phù (Huyền)', desc: 'Phù công kích dùng 1 lần: cột lửa vùng 110 theo công (có trần) — phù phương độc quyền đệ tử Thiên Phù Các.', heal: 0 },
    loi_phu_pham: { name: 'Lôi Phù (Phàm)', desc: 'Phù công kích dùng 1 lần: một tia sét đánh quái gần nhất theo công (có trần).', heal: 0 },
    loi_phu_linh: { name: 'Lôi Phù (Linh)', desc: 'Phù công kích dùng 1 lần: sét tím trắng đánh quái gần nhất theo công (có trần, dưới Kiếm Khí Trảm).', heal: 0 },
    loi_phu_huyen: { name: 'Lôi Phù (Huyền)', desc: 'Phù công kích dùng 1 lần: điện quang dày đánh quái gần nhất theo công (trần 1,45 lần công). Phù phương độc quyền đệ tử Thiên Phù Các.', heal: 0 },
    bang_phu_linh: { name: 'Băng Phù (Linh)', desc: 'Phù công kích dùng 1 lần: ít sát thương băng, đóng băng quái thường 1,2 giây (boss 0,4 giây) + làm chậm 2,5 giây.', heal: 0 },
    bang_phu_huyen: { name: 'Băng Phù (Huyền)', desc: 'Phù công kích dùng 1 lần: ít sát thương băng, đóng băng quái thường 1,8 giây (boss 0,6 giây) + làm chậm 3,5 giây.', heal: 0 },
    kiem_khi_phu_linh: { name: 'Kiếm Khí Phù (Linh)', desc: 'Phù công kích dùng 1 lần: một vệt kiếm khí chém quái gần nhất từ xa theo công (có trần).', heal: 0 },
    kiem_khi_phu_huyen: { name: 'Kiếm Khí Phù (Huyền)', desc: 'Phù công kích dùng 1 lần: kiếm khí sắc bền chém xa theo công (có trần).', heal: 0 },
    kiem_khi_phu_dia: { name: 'Kiếm Khí Phù (Địa)', desc: 'Phù công kích dùng 1 lần: kiếm khí Địa phẩm chém xa theo công (trần 1,55 lần công — vẫn dưới chiêu cảnh giới). Phù phương chỉ có trong quyển chép tay rơi từ vương thú.', heal: 0 },
    pha_giap_phu_linh: { name: 'Phá Giáp Phù (Linh)', desc: 'Phù công kích dùng 1 lần: ít sát thương + khắc dấu phá giáp, mục tiêu nhận thêm 20% sát thương trong 6 giây.', heal: 0 },
    pha_giap_phu_huyen: { name: 'Phá Giáp Phù (Huyền)', desc: 'Phù công kích dùng 1 lần: ít sát thương + mục tiêu nhận thêm 30% sát thương trong 8 giây.', heal: 0 },
    kim_cang_phu_pham: { name: 'Kim Cang Phù (Phàm)', desc: 'Phù phòng thủ dùng 1 lần: dựng khiên linh khí chịu thay 15% Máu tối đa trong 20 giây.', heal: 0 },
    kim_cang_phu_linh: { name: 'Kim Cang Phù (Linh)', desc: 'Phù phòng thủ dùng 1 lần: khiên chịu thay 25% Máu tối đa trong 20 giây.', heal: 0 },
    kim_cang_phu_huyen: { name: 'Kim Cang Phù (Huyền)', desc: 'Phù phòng thủ dùng 1 lần: khiên hai lớp chịu thay 35% Máu tối đa trong 25 giây.', heal: 0 },
    ho_than_phu_linh: { name: 'Hộ Thân Phù (Linh)', desc: 'Phù phòng thủ dùng 1 lần: giảm 20% sát thương nhận vào trong 20 giây.', heal: 0 },
    ho_than_phu_huyen: { name: 'Hộ Thân Phù (Huyền)', desc: 'Phù phòng thủ dùng 1 lần: giảm 30% sát thương nhận vào trong 25 giây.', heal: 0 },
    tho_don_phu_pham: { name: 'Thổ Độn Phù (Phàm)', desc: 'Phù phòng thủ dùng 1 lần: độn về điểm vào của map đang đứng (không xuyên cổng) + ẩn tức 4 giây. Không dùng được giữa lôi kiếp.', heal: 0 },
    than_hanh_phu_pham: { name: 'Thần Hành Phù (Phàm)', desc: 'Phù hỗ trợ dùng 1 lần: tốc độ +15% trong 60 giây (ghi đè buff tốc độ của đan, không cộng dồn).', heal: 0 },
    than_hanh_phu_linh: { name: 'Thần Hành Phù (Linh)', desc: 'Phù hỗ trợ dùng 1 lần: tốc độ +20% trong 90 giây.', heal: 0 },
    hoi_xuan_phu_linh: { name: 'Hồi Xuân Phù (Linh)', desc: 'Phù hỗ trợ dùng 1 lần: hồi 4 Máu/giây trong 10 giây.', heal: 0 },
    hoi_xuan_phu_huyen: { name: 'Hồi Xuân Phù (Huyền)', desc: 'Phù hỗ trợ dùng 1 lần: hồi 7 Máu/giây trong 12 giây.', heal: 0 },
    tu_linh_phu_pham: { name: 'Tụ Linh Phù (Phàm)', desc: 'Phù hỗ trợ dùng 1 lần: hồi ngay 20 linh lực, thổ nạp +50% tu vi trong 120 giây.', heal: 0 },
    tu_linh_phu_linh: { name: 'Tụ Linh Phù (Linh)', desc: 'Phù hỗ trợ dùng 1 lần: hồi ngay 45 linh lực, thổ nạp +50% tu vi trong 180 giây.', heal: 0 },
    giai_doc_phu_pham: { name: 'Giải Độc Phù (Phàm)', desc: 'Phù hỗ trợ dùng 1 lần: đốt hít khói, giải mọi độc đang mang (đối trọng Ngũ Độc/rắn lục). Không có độc thì không đốt được.', heal: 0 },
    giai_doc_phu_linh: { name: 'Giải Độc Phù (Linh)', desc: 'Phù hỗ trợ dùng 1 lần: giải mọi độc đang mang + miễn nhiễm độc 60 giây.', heal: 0 },
    an_tuc_phu_linh: { name: 'Ẩn Tức Phù (Linh)', desc: 'Phù hỗ trợ dùng 1 lần: ẩn tức 25 giây — quái thường không phát hiện, đòn phản công đầu tiên khi bạn ra tay sẽ trượt và phá ẩn. Không áp dụng boss/tinh anh/quái sự kiện.', heal: 0 },
    an_tuc_phu_huyen: { name: 'Ẩn Tức Phù (Huyền)', desc: 'Phù hỗ trợ dùng 1 lần: ẩn tức 40 giây, cùng luật như bản Linh phẩm.', heal: 0 },
    truyen_tong_phu_linh: { name: 'Truyền Tống Phù (Linh)', desc: 'Phù đặc biệt dùng 1 lần: truyền tống về làng Thanh Khê từ map thường. Không dùng được trong bí cảnh, Võ Đài Đại Hội, giữa sự kiện hay giữa lôi kiếp.', heal: 0 },
    tran_ap_phu_linh: { name: 'Trấn Áp Phù (Linh)', desc: 'Phù đặc biệt dùng 1 lần: trong 120 giây, tỉ lệ thu phục bằng Bùa Ngự Thú tăng tương đối +15% (trần tổng 90%), chỉ quái hoang thường.', heal: 0 },
    tran_ap_phu_huyen: { name: 'Trấn Áp Phù (Huyền)', desc: 'Phù đặc biệt dùng 1 lần: trong 120 giây, tỉ lệ thu phục tăng tương đối +25% (trần tổng 90%).', heal: 0 },
    the_loi_phu: { name: 'Thế Lôi Phù (Thiên)', desc: 'THIÊN PHẨM CỰC HIẾM. Dùng khi đang chịu lôi kiếp: thay bạn hứng 30-50% sát thương của đúng 1 đạo sét rồi tan; mỗi kỳ kiếp tối đa 2 lá. Phần sát thương bị chặn KHÔNG tính điểm Luyện Thể. Không bán ở shop — rơi cực thấp từ vương thú, hoặc chế bằng phù phương Thiên phẩm (Giấy Phù Thiên + Tinh Vẫn Thạch + Yêu Đan Cấp 3).', heal: 0 },
    ho_dao_phu: { name: 'Hộ Đạo Phù (Địa)', desc: 'Địa phẩm cực hiếm. Đốt trước khi đột phá tầng/tiểu giai: +8 điểm % tỉ lệ cho lần thử kế tiếp (tiêu hao khi thử, kể cả thất bại). Tổng hỗ trợ từ vật phẩm (đan + phù) trần cứng 40 điểm %, tỉ lệ cuối không bao giờ chạm 100%. Tối đa 1 lá/lần đột phá. Không tác dụng với lôi kiếp liên cảnh giới.', heal: 0 },
    pp_kiem_khi_phu: { name: 'Phù Phương: Kiếm Khí Phù Địa', desc: 'Quyển phù phương chép tay rơi từ vương thú Thập Vạn Đại Sơn — phương chế Kiếm Khí Phù Địa phẩm. Bấm dùng trong túi để học phù phương (học rồi thì quyển thừa không mất).', heal: 0, talismanScroll: 'kiem_khi_phu_dia' },
    pp_the_loi_phu: { name: 'Phù Phương: Thế Lôi Phù', desc: 'Quyển phù phương Thiên phẩm rơi cực hiếm (3%) từ Thiết Bì Ma Vương — phương chế Thế Lôi Phù bằng Giấy Phù Thiên, Tinh Vẫn Thạch và Yêu Đan Cấp 3. Bấm dùng trong túi để học phù phương (học rồi thì quyển thừa không mất).', heal: 0, talismanScroll: 'the_loi_phu' },
    // ----- BÍ TỊCH SKILL (hệ bí tịch js/manuals.js, lệnh Bui 07:05
    // 2026-10-30): SÁCH HỌC CHIÊU ngoài bộ cơ bản — bấm dùng trong túi
    // để ĐỌC và học chiêu (đủ cảnh giới theo phẩm; chưa đủ thì sách
    // nằm yên trong túi). Học xong sách TIÊU HAO; sách trùng dùng để
    // tham ngộ nâng cấp chiêu hoặc bán theo giá phẩm (panel Kỹ Năng).
    // Trường manualSkill = id chiêu trong PNT_MANUALS.MANUALS. Khác
    // hẳn Đan Phương dp_* (cuộn buộc dây dạy đan phương) và phù phương
    // pp_* (dạy chế phù): bí tịch là SÁCH ĐỨNG dạy chiêu chiến đấu.
    bt_tp_kiem_tran: { name: 'Bí Tịch: Thanh Phong Kiếm Trận', desc: 'Tuyệt học ký danh Thanh Phong Phái (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Thanh Phong Kiếm Trận: phong kiếm giáng xuống cắm quanh mục tiêu. Quầy Tàng Kinh Các của Thanh Phong Phái đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn); sách là tri thức — nhặt được ở nơi khác cũng học được.', heal: 0, manualSkill: 'tp_kiem_tran' },
    bt_hp_ngu_hanh: { name: 'Bí Tịch: Ngũ Hành Luân Chuyển', desc: 'Tuyệt học ký danh Huyền Pháp Tông (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Ngũ Hành Luân Chuyển: pháp lực ngũ hành nhảy qua 4 kẻ địch gần nhất. Quầy Tàng Kinh Các của Huyền Pháp Tông đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'hp_ngu_hanh' },
    bt_tc_pha_son: { name: 'Bí Tịch: Thiên Công Phá Sơn Chùy', desc: 'Tuyệt học ký danh Thiên Công Phường (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Thiên Công Phá Sơn Chùy: chùy rèn nện nứt đất theo đường thẳng. Quầy Tàng Kinh Các của Thiên Công Phường đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'tc_pha_son' },
    bt_dh_dan_hoa: { name: 'Bí Tịch: Đan Hỏa Liệu Nguyên', desc: 'Tuyệt học ký danh Đan Hà Cốc (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Đan Hỏa Liệu Nguyên: lửa lò đan bùng nổ tại điểm chỉ định. Quầy Tàng Kinh Các của Đan Hà Cốc đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'dh_dan_hoa' },
    bt_vt_hao_lenh: { name: 'Bí Tịch: Vạn Thú Hào Lệnh', desc: 'Tuyệt học ký danh Vạn Thú Môn (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Vạn Thú Hào Lệnh: ảo ảnh bầy thú xúm quanh thân, tự vồ kẻ địch gần nhất. Quầy Tàng Kinh Các của Vạn Thú Môn đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'vt_hao_lenh' },
    bt_tphu_kiem_tran: { name: 'Bí Tịch: Kim Phù Kiếm Trận', desc: 'Tuyệt học ký danh Thiên Phù Các (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Kim Phù Kiếm Trận: kim phù hóa phù kiếm giáng xuống quanh mục tiêu. Quầy Tàng Kinh Các của Thiên Phù Các đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'tphu_kiem_tran' },
    bt_cc_khon_tran: { name: 'Bí Tịch: Cửu Cung Khốn Trận', desc: 'Tuyệt học ký danh Cửu Cung Trận Tông (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Cửu Cung Khốn Trận: bày trận níu chân và xé kẻ địch trong trận. Quầy Tàng Kinh Các của Cửu Cung Trận Tông đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'cc_khon_tran' },
    bt_kc_bat_hoai: { name: 'Bí Tịch: Kim Cang Bất Hoại Thể', desc: 'Tuyệt học ký danh Kim Cang Môn (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Kim Cang Bất Hoại Thể: dựng thể khiên chịu thay 45% Máu tối đa. Quầy Tàng Kinh Các của Kim Cang Môn đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'kc_bat_hoai' },
    bt_nd_thuc_cot: { name: 'Bí Tịch: Ngũ Độc Thực Cốt', desc: 'Tuyệt học ký danh Ngũ Độc Giáo (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Ngũ Độc Thực Cốt: làn chướng độc phun thẳng, làm chậm kẻ trúng đòn. Quầy Tàng Kinh Các của Ngũ Độc Giáo đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'nd_thuc_cot' },
    bt_ha_han_tien: { name: 'Bí Tịch: Huyền Âm Hàn Tiễn', desc: 'Tuyệt học ký danh Huyền Âm Cung (Huyền phẩm — cần Luyện Khí tầng 6). Bấm dùng trong túi để học chiêu Huyền Âm Hàn Tiễn: một mũi hàn tiễn bay thẳng xuyên mục tiêu. Quầy Tàng Kinh Các của Huyền Âm Cung đổi bằng 260 Điểm Cống Hiến (hàm Nội Môn).', heal: 0, manualSkill: 'ha_han_tien' },
    bt_boss_lang_hao: { name: 'Bí Tịch: Huyết Nguyệt Lang Hào', desc: 'Chiêu ký danh của Lang Vương Huyết Nguyệt (Huyền phẩm — cần Luyện Khí tầng 6), rơi 12% khi hạ boss này. Bấm dùng trong túi để học: tiếng hú trăng máu cuốn thành sóng chấn động quanh thân.', heal: 0, manualSkill: 'boss_lang_hao' },
    bt_boss_ho_gam: { name: 'Bí Tịch: Sơn Quân Hổ Gầm', desc: 'Chiêu ký danh của Sơn Quân (Địa phẩm — cần cảnh giới Trúc Cơ), rơi 10% khi hạ Sơn Quân thế giới. Bấm dùng trong túi để học: tiếng gầm hổ vương dội xuống một vùng. Cũng có lô trong Phiên Đấu Giá Liên Tông.', heal: 0, manualSkill: 'boss_ho_gam' },
    bt_boss_xa_thuc: { name: 'Bí Tịch: Xà Vương Thực Hồn', desc: 'Chiêu ký danh của Xà Vương Đuôi Đỏ (Huyền phẩm — cần Luyện Khí tầng 6), rơi 12% khi hạ boss này. Bấm dùng trong túi để học: nọc độc hóa tia xanh nhảy qua 3 kẻ địch.', heal: 0, manualSkill: 'boss_xa_thuc' },
    bt_boss_thiet_bi: { name: 'Bí Tịch: Thiết Bì Trùng Kích', desc: 'Chiêu ký danh của Thiết Bì Vương (Địa phẩm — cần cảnh giới Trúc Cơ), rơi 10% khi hạ boss này. Bấm dùng trong túi để học: lấy thân làm cối xay, lao thẳng xuyên qua kẻ địch.', heal: 0, manualSkill: 'boss_thiet_bi' },
    bt_boss_co_mang: { name: 'Bí Tịch: Cổ Mãng Bàn Long', desc: 'Chiêu ký danh của Cổ Mãng Vương (Địa phẩm — cần cảnh giới Trúc Cơ), rơi 8% khi hạ boss này. Bấm dùng trong túi để học: thân mãng linh khí cuộn quanh người, siết chậm kẻ bước vào.', heal: 0, manualSkill: 'boss_co_mang' },
    bt_boss_ma_vuong: { name: 'Bí Tịch: Ma Vương Diệt Thế Chùy', desc: 'Chiêu ký danh của Thiết Bì Ma Vương (Thiên phẩm — cần cảnh giới Kim Đan), rơi 8% khi hạ boss này. Bấm dùng trong túi để học: một chùy diệt thế nện xuống vùng chỉ định.', heal: 0, manualSkill: 'boss_ma_vuong' },
    bt_rare_van_kiem: { name: 'Bí Tịch: Vạn Kiếm Quy Tông', desc: 'Kiếm phổ thất truyền của cổ tu (Thiên phẩm — cần cảnh giới Kim Đan). Rơi cực hiếm: Kiếm Mộ Cổ 10%, Cổ Tu Động Phủ 6%, kỳ ngộ Tàn Phủ Thanh Khê 3%, vương thú chặng sâu 4%. Bấm dùng trong túi để học: vạn kiếm quy về một điểm.', heal: 0, manualSkill: 'rare_van_kiem' },
    bt_rare_cuu_u: { name: 'Bí Tịch: Cửu U Hàn Diệm', desc: 'Lửa lạnh rò ra từ Vết Nứt Hư Không (Địa phẩm — cần cảnh giới Trúc Cơ). Rơi ở Hàn Băng Động (vết nứt) 8% và vương thú chặng sâu 4–5%. Bấm dùng trong túi để học: hàn diệm nhảy qua 5 kẻ địch.', heal: 0, manualSkill: 'rare_cuu_u' },
    bt_rare_hoi_xuan: { name: 'Bí Tịch: Đại Bi Hồi Xuân Chú', desc: 'Chú văn của một y tu vô danh (Địa phẩm — cần cảnh giới Trúc Cơ). Rơi ở Vạn Yêu Sào 10%, kỳ ngộ Linh Điền Hoang 5%, vương thú 4–5%. Bấm dùng trong túi để học: sinh cơ bùng lên, quật ngã địch quanh thân và hồi 15% Máu.', heal: 0, manualSkill: 'rare_hoi_xuan' },
    bt_gen_phi_hoa: { name: 'Bí Tịch: Phi Hoa Trích Diệp', desc: 'Chiêu nhập môn của tán tu Thanh Sơn (Linh phẩm — cần Luyện Khí tầng 3). Kỳ ngộ Tàn Phủ Thanh Khê 30%, Tàng Kinh Các mọi tông đổi 130 Điểm Cống Hiến, có lô đấu giá. Bấm dùng trong túi để học: phi hoa làm ám khí bay thẳng xuyên mục tiêu.', heal: 0, manualSkill: 'gen_phi_hoa' },
    bt_gen_luu_sa: { name: 'Bí Tịch: Lưu Sa Chưởng', desc: 'Chưởng pháp của thợ mỏ Thập Vạn Đại Sơn (Linh phẩm — cần Luyện Khí tầng 3). Kỳ ngộ Hang Yêu Bỏ Hoang 25%, Tàng Kinh Các mọi tông đổi 130 Điểm Cống Hiến, có lô đấu giá. Bấm dùng trong túi để học: một chưởng đẩy cát đá nứt đất lao thẳng.', heal: 0, manualSkill: 'gen_luu_sa' },
    bt_cb_thanh_khe: { name: 'Bí Tịch: Thanh Khê Kiếm Quyết', desc: 'Kiếm quyết vỡ lòng của làng Thanh Khê (Phàm phẩm — cần Luyện Khí tầng 2). Trưởng làng tặng lúc lộ linh căn (NV chính 2); Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: kiếm khí mỏng bay thẳng xuyên mục tiêu.', heal: 0, manualSkill: 'cb_thanh_khe' },
    bt_cb_liet_phong: { name: 'Bí Tịch: Liệt Phong Chưởng', desc: 'Chưởng pháp vỡ lòng mượn sức gió núi (Phàm phẩm — cần Luyện Khí tầng 2). Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: liệt phong quét quanh thân tầm gần.', heal: 0, manualSkill: 'cb_liet_phong' },
    bt_cb_thiet_bo: { name: 'Bí Tịch: Thiết Bố Sam', desc: 'Công phu vận khí hộ thể vỡ lòng (Phàm phẩm — cần Luyện Khí tầng 2). Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: khiên khí chịu thay 15% Máu tối đa trong 5 giây.', heal: 0, manualSkill: 'cb_thiet_bo' },
    bt_cb_tat_phong: { name: 'Bí Tịch: Tật Phong Bộ', desc: 'Bộ pháp vỡ lòng mượn gió dưới chân (Phàm phẩm — cần Luyện Khí tầng 2). Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: tốc độ +18% trong 5 giây (chạy nhanh, không phải chiêu lướt).', heal: 0, manualSkill: 'cb_tat_phong' },
    bt_cb_dan_khi: { name: 'Bí Tịch: Dẫn Khí Quyết', desc: 'Khẩu quyết dẫn khí nhập thể (Phàm phẩm — BỊ ĐỘNG, cần Luyện Khí tầng 2). Trưởng làng tặng ở NV Thổ Nạp Đầu Tiên (NV chính 3); Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: thổ nạp +8% tu vi, mỗi cấp +2% (tối đa +12%).', heal: 0, manualSkill: 'cb_dan_khi' },
    bt_pq_hoa_cau: { name: 'Bí Tịch: Hỏa Cầu Thuật', desc: 'Pháp quyết nhập môn hệ Hỏa (Phàm phẩm — cần Luyện Khí tầng 2). Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: cầu lửa đơn thể, cháy bám thêm 2 giây.', heal: 0, manualSkill: 'pq_hoa_cau' },
    bt_pq_thuy_tien: { name: 'Bí Tịch: Thủy Tiễn Thuật', desc: 'Pháp quyết nhập môn hệ Thủy (Phàm phẩm — cần Luyện Khí tầng 2). Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: tên nước bay nhanh xuyên thẳng.', heal: 0, manualSkill: 'pq_thuy_tien' },
    bt_pq_bang_tien: { name: 'Bí Tịch: Băng Tiễn Thuật', desc: 'Pháp quyết nhập môn hệ Băng (Phàm phẩm — cần Luyện Khí tầng 2). Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: băng tiễn làm chậm kẻ trúng đòn 1,2 giây.', heal: 0, manualSkill: 'pq_bang_tien' },
    bt_pq_loi_kich: { name: 'Bí Tịch: Lôi Kích Thuật', desc: 'Pháp quyết nhập môn hệ Lôi (Phàm phẩm — cần Luyện Khí tầng 2). Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: sét giáng nhanh lên 1 mục tiêu, hồi chiêu 3 giây.', heal: 0, manualSkill: 'pq_loi_kich' },
    bt_pq_phong_nhan: { name: 'Bí Tịch: Phong Nhận Thuật', desc: 'Pháp quyết nhập môn hệ Phong (Phàm phẩm — cần Luyện Khí tầng 2). Tủ sách làng bán 50 Linh Thạch; Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: lưỡi gió bay xa 280.', heal: 0, manualSkill: 'pq_phong_nhan' },
    bt_pq_tho_thu: { name: 'Bí Tịch: Thổ Thứ Thuật', desc: 'Pháp quyết nhập môn hệ Thổ (Phàm phẩm — cần Luyện Khí tầng 2). Tàng Kinh Các mọi tông đổi 40 Điểm Cống Hiến. Bấm dùng trong túi để học: gai đá đội đất đâm lên dưới chân địch.', heal: 0, manualSkill: 'pq_tho_thu' },
    // CỔ VẬT VÙI LẤP (js/world-events.js, lệnh Bui 20:20 2026-10-30):
    // hái dược/hạ quái ở map cày có 1% thấy; bán cho Thương Nhân
    // Thần Bí giá cố định 15 / 30 LT (economy.md mục 21).
    dong_tien_co: { name: 'Đồng Tiền Cổ', desc: 'Tiền cổ của người xưa bị đất trồi lên theo linh khí quanh Thanh Sơn — mặt tiền mòn, lỗ vuông còn rõ. Vô dụng với tu sĩ, nhưng Thương Nhân Thần Bí ghé làng lại chịu thu 15 Linh Thạch.', heal: 0 },
    vun_ngoc_co: { name: 'Vụn Ngọc Cổ', desc: 'Mảnh ngọc vỡ của một món cổ vật nào đó, vân ngọc còn ấm linh khí nhạt. Thương Nhân Thần Bí ghé làng chịu thu 30 Linh Thạch — như thể ông ta biết nó thuộc về thời nào.', heal: 0 }
  };
  // LINH THẠCH RƠI TỪ QUÁI (chỉnh kinh tế cày cuốc — Bui 22:15 2026-10-29,
  // xem docs/economy.md): KHÔNG còn rơi phẳng chắc chắn. Mỗi loài khai
  // ltChance (tỉ lệ có rơi) + ltMin/ltMax (lượng khi rơi); trường linhThach
  // giữ lại = KỲ VỌNG (EV = chance × trung bình[min,max]) cho hiển thị +
  // các hệ đọc nhanh (bí cảnh scale, panel). EV tăng đơn điệu theo sức
  // loài: yếu nhất ~0,5 LT/con, mạnh nhất (Lợn Mông Sắt) ~5,2 LT/con.
  // Tinh anh: lượng lăn được × ELITE_LT_MULT ở đường thưởng.
  var ELITE_LT_MULT = 5;
  function ltEV(def) {
    if (!def) return 0;
    if (typeof def.ltChance === 'number') return def.ltChance * (def.ltMin + def.ltMax) / 2;
    return def.linhThach || 0;
  }
  function rollLt(def, rng) {
    var rand = rng || Math.random;
    if (!def || typeof def.ltChance !== 'number') return (def && def.linhThach) || 0;
    if (rand() >= def.ltChance) return 0;
    return def.ltMin + Math.floor(rand() * (def.ltMax - def.ltMin + 1));
  }
  var MONSTERS = {
    ga_rung: { name: 'Gà Rừng', hp: 20, atk: 2, ltChance: 0.40, ltMin: 1, ltMax: 2, linhThach: 0.6, drops: [{ id: 'thit_ga', chance: 1 }, { id: 'long_ga', chance: 0.5 }] },
    tho_hoang: { name: 'Thỏ Hoang', hp: 12, atk: 1, ltChance: 0.35, ltMin: 1, ltMax: 2, linhThach: 0.53, drops: [{ id: 'thit_tho', chance: 1 }] },
    soi_con: { name: 'Sói Con', hp: 35, atk: 5, ltChance: 0.45, ltMin: 1, ltMax: 3, linhThach: 0.9, drops: [{ id: 'da_soi', chance: 1 }, { id: 'thit_tho', chance: 0.5 }] },
    lon_rung: { name: 'Lợn Rừng', hp: 70, atk: 9, ltChance: 0.65, ltMin: 2, ltMax: 4, linhThach: 1.95, drops: [{ id: 'thit_lon', chance: 1 }, { id: 'da_soi', chance: 0.5 }] },
    soi_rung: { name: 'Sói Rừng', hp: 55, atk: 8, ltChance: 0.60, ltMin: 2, ltMax: 3, linhThach: 1.5, drops: [{ id: 'da_soi', chance: 1 }, { id: 'thit_tho', chance: 0.5 }, { id: 'huyet_sam', chance: 0.08 }] },
    lon_mong_sat: { name: 'Lợn Mông Sắt', hp: 110, atk: 12, ltChance: 0.80, ltMin: 5, ltMax: 8, linhThach: 5.2, drops: [{ id: 'thit_lon', chance: 1 }, { id: 'da_soi', chance: 0.5 }, { id: 'chu_sa', chance: 0.3 }] },
    ran_luc: { name: 'Rắn Lục Đuôi Đỏ', hp: 30, atk: 7, ltChance: 0.50, ltMin: 1, ltMax: 3, linhThach: 1, drops: [{ id: 'thao_duoc', chance: 0.5 }, { id: 'doc_tam_hoa', chance: 0.3 }] },
    khi_mat_do: { name: 'Khỉ Mặt Đỏ', hp: 40, atk: 6, ltChance: 0.55, ltMin: 1, ltMax: 3, linhThach: 1.1, drops: [{ id: 'thit_ga', chance: 0.5 }, { id: 'long_ga', chance: 0.5 }, { id: 'tu_linh_qua', chance: 0.25 }] },
    son_quan: { name: 'Sơn Quân', hp: 260, atk: 15, ltChance: 1, ltMin: 70, ltMax: 100, linhThach: 85, boss: true, drops: [{ id: 'nanh_son_quan', chance: 1 }, { id: 'thit_son_quan', chance: 1 }, { id: 'yeu_dan_1', chance: 1 }, { id: 'thanh_linh_tuy', chance: 0.5 }] }
  };
  function addItem(ch, itemId, n) {
    var it = null, i;
    for (i = 0; i < ch.inventory.length; i++) if (ch.inventory[i].id === itemId) it = ch.inventory[i];
    if (!it) { it = { id: itemId, count: 0 }; ch.inventory.push(it); }
    it.count += n || 1;
  }
  function manualsApi() {
    var MN = null;
    if (typeof window !== 'undefined' && window.PNT_MANUALS) MN = window.PNT_MANUALS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_MANUALS) MN = globalThis.PNT_MANUALS;
    return MN;
  }
  function alchemyApi() {
    var AL = null;
    if (typeof window !== 'undefined' && window.PNT_ALCHEMY) AL = window.PNT_ALCHEMY;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_ALCHEMY) AL = globalThis.PNT_ALCHEMY;
    return AL;
  }
  function talismanApi() {
    var T = null;
    if (typeof window !== 'undefined' && window.PNT_TALISMANS) T = window.PNT_TALISMANS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_TALISMANS) T = globalThis.PNT_TALISMANS;
    return T;
  }
  // HỘ ĐẠO PHÙ (js/talismans.js): điểm % cộng tỉ lệ đột phá + trần tổng
  // hỗ trợ vật phẩm. Thiếu module phù thì coi như không có phù (0 / 40).
  function talismanHoDaoBonus(ch) {
    var T = talismanApi();
    return (T && typeof T.hoDaoBonus === 'function') ? T.hoDaoBonus(ch) : 0;
  }
  function talismanItemCap() {
    var T = talismanApi();
    return (T && typeof T.ITEM_SUPPORT_CAP === 'number') ? T.ITEM_SUPPORT_CAP : 40;
  }
  function talismanConsumeHoDao(ch) {
    var T = talismanApi();
    if (T && typeof T.consumeHoDao === 'function') T.consumeHoDao(ch);
  }
  function useItem(ch, itemId) {
    var def = ITEMS[itemId];
    // Phù chú (js/talismans.js): uỷ quyền TRƯỚC heal như đan dược. Đường
    // này không có ngữ cảnh thế giới (không quái quanh) nên phù công sẽ
    // trả no_target và KHÔNG tiêu hao; game.js gọi thẳng TAL.useTalisman
    // với ngữ cảnh thật khi bấm dùng trong túi. Quyển phù phương pp_*
    // (trường talismanScroll) cũng uỷ quyền sang đây để học phương.
    var TAL = talismanApi();
    if (TAL && typeof TAL.isTalisman === 'function' && TAL.isTalisman(itemId)) return TAL.useTalisman(ch, itemId, {});
    if (def && def.talismanScroll && TAL && typeof TAL.useRecipeScroll === 'function') return TAL.useRecipeScroll(ch, itemId);
    // Đan dược của hệ luyện đan (js/alchemy.js): tác dụng (hồi linh lực,
    // tu vi, buff, giải độc...) nằm ở module đó — uỷ quyền trước khi xét
    // heal, vì đan khai heal 0 ở ITEMS. Thiếu module thì rơi về nhánh cũ.
    var AL = alchemyApi();
    if (AL && typeof AL.isPill === 'function' && AL.isPill(itemId)) return AL.usePill(ch, itemId);
    // Quyển đan phương rơi từ boss thế giới (trường recipeScroll trong
    // ITEMS): đọc trong túi để học đan phương — uỷ quyền cho alchemy.
    if (def && def.recipeScroll && AL && typeof AL.useRecipeScroll === 'function') return AL.useRecipeScroll(ch, itemId);
    // Bí tịch skill (trường manualSkill trong ITEMS): đọc trong túi để
    // HỌC chiêu ngoài bộ cơ bản — uỷ quyền cho js/manuals.js (cổng
    // cảnh giới theo phẩm, học xong sách tiêu hao, đã học thì giữ sách).
    var MN = manualsApi();
    if (def && def.manualSkill && MN && typeof MN.useManual === 'function') return MN.useManual(ch, itemId);
    if (!def || !def.heal) return { ok: false };
    for (var i = 0; i < ch.inventory.length; i++) {
      if (ch.inventory[i].id === itemId && ch.inventory[i].count > 0) {
        ch.inventory[i].count -= 1;
        if (ch.inventory[i].count <= 0) ch.inventory.splice(i, 1);
        var healAmt = def.heal;
        var aStU = artifactStatsOf(ch);
        if (aStU && aStU.healPct) healAmt = Math.round(healAmt * (1 + aStU.healPct / 100)); // Đan Đỉnh Ngọc...
        ch.hp = Math.min(effMaxHp(ch), ch.hp + healAmt);
        return { ok: true, healed: healAmt };
      }
    }
    return { ok: false };
  }
  function combatRound(ch, monster, rng) {
    var rand = rng || Math.random;
    var base = Math.max(1, effAtk(ch) + Math.floor(rand() * 4));
    var off = applyOffense(ch, base, rand, {});
    // Hiệu ứng riêng đánh thẳng lên mục tiêu thì áp dụng ngay tại đây;
    // proc lan (chain) trả ra ngoài cho game.js lan sang quái bên cạnh.
    var extraDmg = 0, procHeal = 0, chainProcs = [];
    off.procs.forEach(function (h) {
      if (h.kind === 'meteor' || h.kind === 'burst') {
        extraDmg += h.dmg;
        if (h.kind === 'burst' && h.heal) procHeal += h.heal;
      } else if (h.kind === 'freeze') {
        monster.freezeT = Math.max(monster.freezeT || 0, h.dur);
      } else if (h.kind === 'burn') {
        monster.burnT = Math.max(monster.burnT || 0, h.dur);
        monster.burnDmg = h.dmg;
      } else if (h.kind === 'chain') {
        chainProcs.push(h);
      }
    });
    var dmgToMonster = Math.round(off.dmg * artifactVsMult(ch, monster)) + extraDmg;
    monster.hp -= dmgToMonster;
    var healed = off.healed + procHeal;
    if (healed > 0) ch.hp = Math.min(effMaxHp(ch), ch.hp + healed);
    var log = 'Bạn chém ' + monster.name + ' mất ' + dmgToMonster + ' Máu.';
    if (off.crit) log += ' Chí mạng!';
    var dead = monster.hp <= 0;
    var dmgToPlayer = 0, drops = [], poisoned = false;
    if (!dead) {
      dmgToPlayer = Math.max(1, monster.atk - effDef(ch));
      ch.hp -= dmgToPlayer;
      log += ' ' + monster.name + ' cắn lại, bạn mất ' + dmgToPlayer + ' Máu.';
      // Rắn Lục Đuôi Đỏ cắn trúng thì 40% trúng độc: ch.poison do game.js
      // trừ HP theo giây (sàn 1 HP), Giải Độc Đan của js/alchemy.js giải.
      var TALp = talismanApi();
      if (monster.type === 'ran_luc' && rand() < 0.4 && !(TALp && typeof TALp.poisonImmune === 'function' && TALp.poisonImmune(ch, Date.now()))) {
        ch.poison = { until: Date.now() + 8000, dps: 3 };
        poisoned = true;
        log += ' Bạn trúng độc rắn lục! Dùng Giải Độc Đan hoặc chờ độc tự tan sau 8 giây.';
      }
    } else {
      // Linh Thạch rơi theo TỈ LỆ của loài (docs/economy.md): quái có
      // ltFlat (bí cảnh/encounter ghi đè phẳng) thì dùng phẳng, còn lại lăn
      // theo ltChance/ltMin/ltMax của loài; tinh anh × ELITE_LT_MULT.
      // Tụ Bảo Bồn...: Linh Thạch và tỉ lệ rơi vật phẩm thường nhân theo pháp bảo.
      var aSt = artifactStatsOf(ch);
      var ltRolled;
      if (typeof monster.ltFlat === 'number') ltRolled = monster.ltFlat;
      else ltRolled = rollLt(monster, rand);
      if (monster.elite) ltRolled *= ELITE_LT_MULT;
      var ltGain = Math.floor(ltRolled * (aSt ? 1 + aSt.ltPct / 100 : 1));
      ltGain = guardGain('monster', ltGain); // chống hack: trần 1 lần rơi quái/boss
      ch.linhThach += ltGain;
      var def = MONSTERS[monster.type];
      var dropMult = aSt ? 1 + aSt.dropPct / 100 : 1;
      def.drops.forEach(function (d) { if (rand() < d.chance * dropMult) { addItem(ch, d.id, 1); drops.push(d.id); } });
      log += ' ' + monster.name + ' gục! +' + ltGain + ' Linh Thạch.';
    }
    return {
      dmgToMonster: dmgToMonster, dmgToPlayer: dmgToPlayer, dead: dead, drops: drops, log: log,
      crit: off.crit, healed: healed, procs: chainProcs, poisoned: poisoned
    };
  }
  function newMonster(type, x, y) {
    var def = MONSTERS[type];
    return { type: type, name: def.name, hp: def.hp, maxHp: def.hp, atk: def.atk, linhThach: def.linhThach, ltChance: def.ltChance, ltMin: def.ltMin, ltMax: def.ltMax, x: x, y: y };
  }
  // ---------- Nhiệm vụ ----------
  var QUESTS = {
    q_chinh_1: { id: 'q_chinh_1', main: true, title: 'Gặp trưởng làng', giver: 'truong_lang',
      desc: 'Ra mắt trưởng làng để bắt đầu hành trình.', objectives: [{ type: 'talk', target: 'truong_lang', need: 1 }],
      rewards: { linhThach: 10, tuVi: 0, items: [] } },
    q_chinh_2: { id: 'q_chinh_2', main: true, title: 'Bí mật giếng cổ', giver: 'truong_lang', requires: 'q_chinh_1',
      desc: 'Tới giếng cổ giữa trấn, xem điềm lạ là gì.', objectives: [{ type: 'well', need: 1 }],
      rewards: { linhThach: 0, tuVi: 30, items: [{ id: 'bt_cb_thanh_khe', n: 1 }] } },
    q_chinh_3: { id: 'q_chinh_3', main: true, title: 'Thổ nạp đầu tiên', giver: 'truong_lang', requires: 'q_chinh_2',
      desc: 'Thổ nạp đủ 30 tu vi sau khi lộ linh căn.', objectives: [{ type: 'tuvi', need: 30 }],
      rewards: { linhThach: 0, tuVi: 0, items: [{ id: 'thao_duoc', n: 2 }, { id: 'bt_cb_dan_khi', n: 1 }] } },
    q_chinh_4: { id: 'q_chinh_4', main: true, title: 'Đột phá Luyện Khí', giver: 'truong_lang', requires: 'q_chinh_3',
      desc: 'Đột phá lên Luyện Khí tầng 1.', objectives: [{ type: 'breakthrough', need: 1 }],
      rewards: { linhThach: 30, tuVi: 0, items: [{ id: 'thit_ga', n: 2 }] } },
    q_phu_tho: { id: 'q_phu_tho', main: false, title: 'Thịt thỏ cho quán', giver: 'chu_quan',
      desc: 'Săn 3 Thỏ Hoang lấy thịt cho quán trọ.', objectives: [{ type: 'kill', target: 'tho_hoang', need: 3 }],
      rewards: { linhThach: 25, tuVi: 0, items: [] } },
    q_phu_thuoc: { id: 'q_phu_thuoc', main: false, title: 'Hái thảo dược', giver: 'dai_phu',
      desc: 'Hái 3 cây thảo dược ngoài ngoại ô.', objectives: [{ type: 'collect', target: 'thao_duoc', need: 3 }],
      rewards: { linhThach: 20, tuVi: 0, items: [{ id: 'thit_tho', n: 1 }] } },
    q_phu_da: { id: 'q_phu_da', main: false, title: 'Da sói cho thợ rèn', giver: 'tho_ren',
      desc: 'Săn 2 Sói Con lấy da cho thợ rèn.', objectives: [{ type: 'kill', target: 'soi_con', need: 2 }],
      rewards: { linhThach: 40, tuVi: 0, items: [] } },
    q_chinh_5: { id: 'q_chinh_5', main: true, title: 'Giữ cổng Nam Môn', giver: 'linh_gac', requires: 'q_chinh_4',
      desc: 'Giữ cổng Nam Môn trong sự kiện thú dữ tấn công làng: đánh đuổi 5 con sói đầu đàn.', objectives: [{ type: 'kill', target: 'soi_con', need: 5 }],
      rewards: { linhThach: 50, tuVi: 20, items: [{ id: 'thao_duoc', n: 2 }] } },
    q_chinh_6: { id: 'q_chinh_6', main: true, title: 'Truy vết Sơn Quân', giver: 'tho_san_ha', requires: 'q_chinh_5',
      desc: 'Vào Rừng Thanh Sơn, hạ 4 Sói Rừng dọc đường mòn để truy vết Sơn Quân.', objectives: [{ type: 'kill', target: 'soi_rung', need: 4 }],
      rewards: { linhThach: 50, tuVi: 30, items: [{ id: 'thit_lon', n: 1 }] } },
    q_chinh_7: { id: 'q_chinh_7', main: true, title: 'Đối đầu Sơn Quân', giver: 'giu_mieu', requires: 'q_chinh_6',
      desc: 'Phong ấn giếng cổ nứt thêm. Vào sâu Rừng Thanh Sơn đối đầu và hạ Sơn Quân, mang nanh về Miếu Sơn Thần.', objectives: [{ type: 'kill', target: 'son_quan', need: 1 }],
      rewards: { linhThach: 80, tuVi: 50, items: [] } },
    q_chinh_8: { id: 'q_chinh_8', main: true, title: 'Sơn môn mở', giver: 'de_tu_phai', requires: 'q_chinh_7',
      desc: 'Tới bãi tuyển đệ tử của Thanh Phong Phái ở Chân Núi Thanh Phong, đột phá lên Luyện Khí tầng 2 để qua khảo hạch tu vi.', objectives: [{ type: 'breakthrough', need: 1 }],
      rewards: { linhThach: 70, tuVi: 30, items: [{ id: 'lenh_bai_thanh_phong', n: 1 }] } },
    q_phu_thuoc_rung: { id: 'q_phu_thuoc_rung', main: false, title: 'Linh chi cho người bị thương', giver: 'hoc_tro',
      desc: 'Hái 3 tai Linh Chi gần suối linh trong Rừng Thanh Sơn cho Tiểu Hạnh giã thuốc cứu người bị thương.', objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }],
      rewards: { linhThach: 35, tuVi: 10, items: [{ id: 'thao_duoc', n: 2 }] } },
    // ----- Chuỗi nhiệm vụ ĐAN PHƯƠNG (hệ luyện đan js/alchemy.js) -----
    // Học trò Lý Tiểu Hạnh giao chính; đan phương thưởng qua ALCH.afterTurnIn.
    q_dan_1: { id: 'q_dan_1', main: false, title: 'Mẻ đan đầu tay', giver: 'hoc_tro', requires: 'q_phu_thuoc_rung',
      desc: 'Tiểu Hạnh xin thầy Lý cho bạn đứng lò lần đầu: tới Đan Lô ở hiệu thuốc học 2 phương cơ bản, rồi tự luyện thành công 1 viên Hồi Khí Tán mang về cho cô ấy xem.', objectives: [{ type: 'brew', target: 'hoi_khi_tan', need: 1 }],
      rewards: { linhThach: 30, tuVi: 0, items: [{ id: 'hoi_xuan_dan', n: 1 }] } },
    q_dan_2: { id: 'q_dan_2', main: false, title: 'Thuốc cho người sốt', giver: 'hoc_tro', requires: 'q_dan_1',
      desc: 'Mấy đứa nhỏ trong làng sốt không hạ, hiệu thuốc hết Thanh Tâm Thảo sắc thuốc hạ sốt. Hái 4 cây Thanh Tâm Thảo (bãi cỏ ngoại ô làng, bụi rậm ven suối rừng) mang về cho Tiểu Hạnh.', objectives: [{ type: 'collect', target: 'thanh_tam_thao', need: 4 }],
      rewards: { linhThach: 40, tuVi: 0, items: [{ id: 'giai_doc_dan', n: 1 }] } },
    q_dan_3: { id: 'q_dan_3', main: false, title: 'Đan khó hẹn giờ', giver: 'dai_phu', requires: 'q_dan_2',
      desc: 'Một người bị thú cào nặng đang chờ thuốc, Lý lão đích thân giao việc khó: luyện thành công 2 viên Hồi Xuân Đan giao lại cho ông trước khi trời tối. (Đúng hẹn là hẹn trong truyện — luyện xong lúc nào mang về lúc đó.)', objectives: [{ type: 'brew', target: 'hoi_xuan_dan', need: 2 }],
      rewards: { linhThach: 60, tuVi: 20, items: [{ id: 'ngung_khi_dan', n: 1 }] } },
    q_dan_4: { id: 'q_dan_4', main: false, title: 'Lò đan của Đan Hà', giver: 'hoc_tro', requires: 'q_dan_3',
      desc: 'Người của Đan Hà Cốc nghe tiếng mẻ đan hẹn giờ, muốn xem tận mắt dược liệu vùng Thanh Sơn. Hái 3 tai Ngọc Tủy Chi (kẽ đá bãi luyện công chân núi, gốc cây phía đông rừng) mang về cho Tiểu Hạnh gửi lên bãi tuyển.', objectives: [{ type: 'collect', target: 'ngoc_tuy_chi', need: 3 }],
      rewards: { linhThach: 70, tuVi: 0, items: [{ id: 'dai_hoi_xuan_dan', n: 1 }] } },
    q_phu_mo_duong: { id: 'q_phu_mo_duong', main: false, title: 'Mở lại đường buôn', giver: 'thuong_nhan_ma',
      desc: 'Dẹp 3 con Sói Rừng quanh khúc đường mòn trong rừng để xe hàng của thương đội qua được.', objectives: [{ type: 'kill', target: 'soi_rung', need: 3 }],
      rewards: { linhThach: 60, tuVi: 0, items: [{ id: 'thit_lon', n: 1 }] } },
    q_phu_bao_tin: { id: 'q_phu_bao_tin', main: false, title: 'Báo tin phong ấn', giver: 'giu_mieu', requires: 'q_chinh_7',
      desc: 'Về làng báo cho trưởng làng Trần Đức biết phong ấn giếng cổ chỉ được vá tạm, vết nứt vẫn còn.', objectives: [{ type: 'talk', target: 'truong_lang', need: 1 }],
      rewards: { linhThach: 20, tuVi: 20, items: [] } },
    // ----- Arc chương 9-12: Sơn Môn Đại Hội - mở khoá 10 tông môn (js/sects.js) -----
    q_chinh_9: { id: 'q_chinh_9', main: true, title: 'Mười tông tụ hội', giver: 'de_tu_phai', requires: 'q_chinh_8',
      desc: 'Chuyện phong ấn giếng cổ nứt dần đã kinh động các tông môn quanh Thanh Sơn. Về làng báo cho trưởng làng Trần Đức biết mười tông sắp tụ về bãi tuyển đệ tử, rồi quay lại gặp Tạ Thanh Vân.', objectives: [{ type: 'talk', target: 'truong_lang', need: 1 }],
      rewards: { linhThach: 40, tuVi: 20, items: [] } },
    q_tong_phap: { id: 'q_tong_phap', main: false, title: 'Ngũ hành thí pháp', giver: 'tong_phap', requires: 'q_chinh_9',
      desc: 'Dẹp 4 con Khỉ Mặt Đỏ đang phá đài thử pháp của Huyền Pháp Tông ở ven đường núi và rừng phía đông.', objectives: [{ type: 'kill', target: 'khi_mat_do', need: 4 }],
      rewards: { linhThach: 60, tuVi: 25, items: [] } },
    q_tong_khi: { id: 'q_tong_khi', main: false, title: 'Bờm sắt thử tay', giver: 'tong_khi', requires: 'q_tong_phap',
      desc: 'Hạ 2 con Lợn Mông Sắt trong Rừng Thanh Sơn, mang bờm sắt về cho phường chủ Thiên Công xem tay nghề tìm vật liệu.', objectives: [{ type: 'kill', target: 'lon_mong_sat', need: 2 }],
      rewards: { linhThach: 70, tuVi: 25, items: [{ id: 'thit_lon', n: 1 }] } },
    q_tong_dan: { id: 'q_tong_dan', main: false, title: 'Linh chi thử đan', giver: 'tong_dan', requires: 'q_tong_khi',
      desc: 'Hái 3 tai Linh Chi còn đẫm sương gần suối linh trong Rừng Thanh Sơn cho Đan Hà Cốc thử một mẻ đan.', objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }],
      rewards: { linhThach: 60, tuVi: 20, items: [{ id: 'thao_duoc', n: 2 }] } },
    q_tong_thu: { id: 'q_tong_thu', main: false, title: 'Người được thú nhận', giver: 'tong_thu', requires: 'q_tong_dan',
      desc: 'Tới lán trại trong Rừng Thanh Sơn gặp thợ săn Hà Thiết Sơn, theo ông vào gần bầy thú để Vạn Thú Môn xem ngươi có được thú rừng chấp nhận không.', objectives: [{ type: 'talk', target: 'tho_san_ha', need: 1 }],
      rewards: { linhThach: 55, tuVi: 25, items: [] } },
    q_tong_phu: { id: 'q_tong_phu', main: false, title: 'Giữ kho giấy bùa', giver: 'tong_phu', requires: 'q_tong_thu',
      desc: 'Dẹp 3 con Rắn Lục Đuôi Đỏ bò vào kho giấy bùa Thiên Phù Các dựng tạm ven suối linh trong Rừng Thanh Sơn.', objectives: [{ type: 'kill', target: 'ran_luc', need: 3 }],
      rewards: { linhThach: 65, tuVi: 25, items: [] } },
    // --- Chuỗi PHÙ PHƯƠNG của Thiên Phù Các (hệ phù chú js/talismans.js):
    // mở Bàn Phù học chế phù. Thưởng LT giữ trong trần NV lẻ của
    // economy.md (<= 300/NV); phù phương thưởng nằm ở TAL.QUEST_RECIPES,
    // game.js gọi TAL.afterTurnIn cùng chỗ với đan phương.
    q_tal_1: { id: 'q_tal_1', main: false, title: 'Nét bùa đầu tay', giver: 'tong_phu', requires: 'q_tong_phu',
      desc: 'Diệp Phù Sinh muốn xem tay nghề hái dược của ngươi trước khi truyền phù phương Linh phẩm: hái 5 cây Thảo Dược làm sợi giấy phù mang về bãi tuyển.', objectives: [{ type: 'collect', target: 'thao_duoc', need: 5 }],
      rewards: { linhThach: 40, tuVi: 20, items: [{ id: 'giay_phu', n: 4 }] } },
    q_tal_2: { id: 'q_tal_2', main: false, title: 'Chu sa đầu nguồn', giver: 'tong_phu', requires: 'q_tal_1',
      desc: 'Kho chu sa của Thiên Phù Các đã cạn: hạ 2 con Lợn Mông Sắt ở bãi hoang — chúng ủi đất đỏ, trong đất hay lẫn chu sa mang về cho Diệp Phù Sinh.', objectives: [{ type: 'kill', target: 'lon_mong_sat', need: 2 }],
      rewards: { linhThach: 65, tuVi: 25, items: [{ id: 'chu_sa', n: 3 }] } },
    // ----- Chuỗi TÀNG KINH CÁC (js/library.js quản, mục 9 hàng chờ) -----
    // Chỉ mở cho người ĐÃ BÁI NHẬP tông (cờ tkcQuest: availableQuests
    // bỏ qua, js/library.js kiểm flags.sectJoined). Thưởng mỗi NV trong
    // trần NV lẻ (<= 300 LT) của docs/economy.md; điểm cống hiến 10/việc
    // ở js/sect-points.js như q_tong_*. Việc giữ sách / trả sách của
    // thủ thư Cổ Mặc ở Tàng Kinh Các chung tại bãi tuyển map 3.
    q_tkc_1: { id: 'q_tkc_1', main: false, tkcQuest: true, title: 'Túi thơm chống ẩm', giver: 'thu_thu',
      desc: 'Tàng Kinh Các bị dột sau mưa đêm: hái 4 cây Thảo Dược tươi cho thủ thư Cổ Mặc phơi khô lót giá sách làm túi thơm chống ẩm, giữ sách khỏi mọt.',
      objectives: [{ type: 'collect', target: 'thao_duoc', need: 4 }],
      rewards: { linhThach: 60, tuVi: 20, items: [] } },
    q_tkc_2: { id: 'q_tkc_2', main: false, tkcQuest: true, title: 'Đường trả sách an toàn', giver: 'thu_thu', requires: 'q_tkc_1',
      desc: 'Dẹp 3 con Sói Rừng rình đường núi để đệ tử các tông gánh sách trả về núi đi qua an toàn, sổ mượn không còn dòng "mất trên đường".',
      objectives: [{ type: 'kill', target: 'soi_rung', need: 3 }],
      rewards: { linhThach: 80, tuVi: 25, items: [] } },
    q_tkc_3: { id: 'q_tkc_3', main: false, tkcQuest: true, title: 'Sổ mượn có người làm chứng', giver: 'thu_thu', requires: 'q_tkc_2',
      desc: 'Mang sổ mượn của Tàng Kinh Các tới bãi tuyển báo cho Tạ Thanh Vân biết kỳ này các không mất một quyển nào, không rách một trang nào.',
      objectives: [{ type: 'talk', target: 'de_tu_phai', need: 1 }],
      rewards: { linhThach: 100, tuVi: 30, items: [] } },
    // ----- Chuỗi KẾT NGHĨA (js/sworn.js quản, mục 16 hàng chờ) -----
    // Chỉ mở cho người ĐÃ CHIÊU MỘ bạn đi cùng + hảo cảm với đại
    // diện tông từ mốc Thân thiết (40) trở lên — cổng nằm ở
    // js/sworn.js gate(), không nằm ở requires. Người kết nghĩa
    // chính là bạn đi cùng đã chiêu mộ (mục 4), không tạo NPC mới.
    // giver 'sect_rep' = đại diện của tông NGƯỜI CHƠI ĐÃ BÁI NHẬP
    // ở map 3; nút Trả riêng của chuỗi nằm ở đại diện tông (vì
    // giver không khớp một NPC cố định nên nút Trả chung theo
    // giver không bắt được). Thưởng mỗi việc trong trần nhiệm vụ
    // lẻ <= 300 LT của docs/economy.md; trả xong q_kn_3 thì
    // flags.sworn.done = true, buff +2 công khi đi cùng nhau.
    q_kn_1: { id: 'q_kn_1', main: false, knQuest: true, title: 'Lễ vật kết nghĩa', giver: 'sect_rep',
      desc: 'Hái 3 tai Linh Chi tươi làm lễ vật dâng trời đất cho lễ kết nghĩa với bạn đi cùng — linh chi mọc gần suối linh trong Rừng Thanh Sơn, hái cây còn đẫm sương mới tính.',
      objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }],
      rewards: { linhThach: 60, tuVi: 20, items: [] } },
    q_kn_2: { id: 'q_kn_2', main: false, knQuest: true, title: 'Vai kề vai dẹp đường', giver: 'sect_rep', requires: 'q_kn_1',
      desc: 'Cùng bạn đi cùng hạ 3 con Khỉ Mặt Đỏ phá đường núi từ bãi tuyển lên rừng — một người đánh, một người giữ đường, đường sạch thì lễ thề mới có đường mà đi.',
      objectives: [{ type: 'kill', target: 'khi_mat_do', need: 3 }],
      rewards: { linhThach: 80, tuVi: 25, items: [] } },
    q_kn_3: { id: 'q_kn_3', main: false, knQuest: true, title: 'Lời thề dưới gốc đa', giver: 'sect_rep', requires: 'q_kn_2',
      desc: 'Mang lời thề về làng cho trưởng làng Trần Đức làm chứng — người làng chứng kiến thì lời thề mới nặng — rồi quay lại đại diện tông làm lễ thề dưới gốc đa với bạn đi cùng.',
      objectives: [{ type: 'talk', target: 'truong_lang', need: 1 }],
      rewards: { linhThach: 100, tuVi: 30, items: [] } },
    // --- VIỆC TIẾT (mục 17 hàng chờ, js/season-tide.js): mỗi tiết 1
    // việc, mỗi việc một lần duy nhất, chỉ nhận trong đúng tháng của
    // tiết; thưởng 50 LT/việc (trong trần NV lẻ ≤ 300 LT của
    // economy.md mục 6). Người giao đều là NPC làng map 1 đã có.
    q_tiet_linh: { id: 'q_tiet_linh', main: false, tietQuest: true, title: 'Tiết Linh Tố: Thuốc đầu mùa', giver: 'hoc_tro',
      desc: 'Tiết Linh Tố, đất làng thấm linh khí, dược mọc nhanh hơn mọi tháng. Hái 3 cây Thanh Tâm Thảo tươi cho Tiểu Hạnh giã thuốc dự trữ cho mùa khô sắp tới.',
      objectives: [{ type: 'collect', target: 'thanh_tam_thao', need: 3 }],
      rewards: { linhThach: 50, tuVi: 10, items: [] } },
    q_tiet_thu: { id: 'q_tiet_thu', main: false, tietQuest: true, title: 'Tiết Thú Dữ: Giữ cổng làng', giver: 'linh_gac',
      desc: 'Tiết Thú Dữ, trời khô thú đói, tinh anh xuống gần làng nhiều hơn. Hạ 3 con Sói Con lảng vảng quanh bãi hoang để A Hổ giữ yên cổng Nam Môn.',
      objectives: [{ type: 'kill', target: 'soi_con', need: 3 }],
      rewards: { linhThach: 50, tuVi: 10, items: [] } },
    q_tiet_dang: { id: 'q_tiet_dang', main: false, tietQuest: true, title: 'Tiết Đăng Hoa: Lời chúc hội đèn', giver: 'chu_quan',
      desc: 'Tiết Đăng Hoa, đêm hội đèn của làng. Mang lời chúc hội đèn của Hoa nương sang cho Dì Tư (người lo lễ hội của làng) rồi quay lại ăn cỗ hội.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }],
      rewards: { linhThach: 50, tuVi: 10, items: [{ id: 'thit_ga', n: 2 }] } },
    q_tiet_tinh: { id: 'q_tiet_tinh', main: false, tietQuest: true, title: 'Tiết Tĩnh Tu: Ngồi yên một tuần trà', giver: 'dai_phu',
      desc: 'Tiết Tĩnh Tu, linh khí lặng mà đầy, thổ nạp được thêm một phần tư. Ngồi thổ nạp tích đủ 30 tu vi trong tiết này cho Lý lão xem tâm tĩnh tới đâu.',
      objectives: [{ type: 'tuvi', need: 30 }],
      rewards: { linhThach: 50, tuVi: 10, items: [] } },
    q_tong_tran: { id: 'q_tong_tran', main: false, title: 'Dẫn khí qua cửu cung', giver: 'tong_tran', requires: 'q_tong_phu',
      desc: 'Theo trận đồ Cửu Cung của Cửu Cung Trận Tông mà dẫn khí đi đủ một vòng: thổ nạp tích đủ 50 tu vi.', objectives: [{ type: 'tuvi', need: 50 }],
      rewards: { linhThach: 70, tuVi: 20, items: [] } },
    q_tong_the: { id: 'q_tong_the', main: false, title: 'Tay không đấu lợn rừng', giver: 'tong_the', requires: 'q_tong_tran',
      desc: 'Kim Cang Môn thử thân: hạ 3 con Lợn Rừng ở bãi hoang phía nam làng bằng sức thân thể.', objectives: [{ type: 'kill', target: 'lon_rung', need: 3 }],
      rewards: { linhThach: 75, tuVi: 25, items: [{ id: 'thit_lon', n: 1 }] } },
    q_tong_doc: { id: 'q_tong_doc', main: false, title: 'Chén thuốc thử độc', giver: 'tong_doc', requires: 'q_tong_the',
      desc: 'Uống chén thuốc thử của Ngũ Độc Giáo rồi tự ra bãi hoang hái 4 cây Thảo Dược làm thuốc giải, mang về cho Đường Tĩnh xem sắc mặt.', objectives: [{ type: 'collect', target: 'thao_duoc', need: 4 }],
      rewards: { linhThach: 70, tuVi: 25, items: [] } },
    q_tong_am: { id: 'q_tong_am', main: false, title: 'Khúc đàn an hồn', giver: 'tong_am', requires: 'q_tong_doc',
      desc: 'Đưa thẻ ngọc âm của Huyền Âm Cung về quán trọ làng Thanh Khê cho Hoa nương - khúc an hồn này dành cho những người đã ngã xuống vì thú dữ.', objectives: [{ type: 'talk', target: 'chu_quan', need: 1 }],
      rewards: { linhThach: 60, tuVi: 30, items: [] } },
    q_chinh_18: { id: 'q_chinh_18', main: true, title: 'Lễ bái sư', giver: 'de_tu_phai', requires: 'q_tong_am',
      desc: 'Mười tông đã mở hết. Trở lại bãi tuyển gặp Tạ Thanh Vân làm lễ chọn tông, rồi mở bảng Tông Môn để bái nhập tông môn của ngươi.', objectives: [{ type: 'talk', target: 'de_tu_phai', need: 1 }],
      rewards: { linhThach: 100, tuVi: 40, items: [] } },
    // --- Chuỗi NGỰ KIẾM tông môn (story-bible mục 24, luật ở js/flight.js) ---
    // giver 'sect_rep' = đại diện của tông NGƯỜI CHƠI ĐÃ BÁI NHẬP ở map 3
    // (mỗi người chơi một tông khác nhau nên không gán cứng một NPC).
    // Cổng mở chuỗi KHÔNG nằm ở requires: phải Trúc Cơ (realmRank >= 2) +
    // đã bái sư (flags.sectJoined) — js/flight.js kiểm, availableQuests bỏ
    // qua toàn bộ nhiệm vụ sectQuest (xem dưới), game.js tự hiện/nhận/trả.
    // Hành động hoàn thành (đúc linh / hạ hình nhân / bay qua cột mốc) do
    // game.js + flight.js ghi thẳng progress/done, không qua recordEvent.
    q_ngu_kiem_1: { id: 'q_ngu_kiem_1', main: false, sectQuest: true, title: 'Kiếm Phôi Tâm Hợp', giver: 'sect_rep', requires: null,
      desc: 'Bài đầu của môn ngự kiếm: đúc linh cho một thanh KIẾM phẩm Linh trở lên (kiếm không mất — nó thành phi kiếm của riêng bạn) + nộp 200 Linh Thạch và 3 Linh Chi.',
      objectives: [{ type: 'forge', target: 'phi_kiem', need: 1 }],
      rewards: { linhThach: 40, tuVi: 40, items: [] } },
    q_ngu_kiem_2: { id: 'q_ngu_kiem_2', main: false, sectQuest: true, title: 'Thử Kiếm Đài', giver: 'sect_rep', requires: 'q_ngu_kiem_1',
      desc: 'Đánh bại Hình Nhân Kiếm Khí do tông môn dựng ở Bãi Luyện Công (map 3) — thử tay kiếm trước khi cho bạn rời mặt đất.',
      objectives: [{ type: 'kill', target: 'hinh_nhan_kiem', need: 1 }],
      rewards: { linhThach: 60, tuVi: 60, items: [] } },
    q_ngu_kiem_3: { id: 'q_ngu_kiem_3', main: false, sectQuest: true, title: 'Ngự Không Sơ Hành', giver: 'sect_rep', requires: 'q_ngu_kiem_2',
      desc: 'Bài bay thử đầu đời: ngự kiếm qua 5 cột mốc quanh trấn trên mây (map 3) theo đúng thứ tự, trong lúc đang bay. Xong bài này là học được Ngự Kiếm.',
      objectives: [{ type: 'flytrial', target: 'map3', need: 5 }],
      rewards: { linhThach: 100, tuVi: 100, items: [{ id: 'linh_chi', n: 2 }] } },
    // ===== SỰ KIỆN VẾT NỨT HƯ KHÔNG (hậu Trúc Cơ, js/rift-events.js quản) =====
    // Arc mở đầu Thiên 4: mở khi realmRank >= 2 + đã trả q_chinh_24 + đã
    // bái nhập tông (cổng ở rift-events.arcGateOpen, availableQuests loại
    // trừ bằng cờ riftArc). Objectives type 'rift' do module tự set done.
    q_vet_nut_1: { id: 'q_vet_nut_1', main: false, riftArc: true, title: 'Trời rách trên Thanh Khê', giver: 'sect_rep', requires: 'q_chinh_24',
      desc: 'Phong ấn giếng cổ đã nứt hẳn: Vết Nứt Hư Không bắt đầu xé mở trên đất Thanh Khê theo chu kỳ. Tới Miếu Sơn Thần gặp Từ bà — bà giữ tàn niệm của Thanh Khê lão nhân, người tự tay dệt phong ấn năm xưa.',
      objectives: [{ type: 'talk', target: 'giu_mieu', need: 1 }],
      rewards: { linhThach: 150, tuVi: 60, items: [] } },
    q_vet_nut_2: { id: 'q_vet_nut_2', main: false, riftArc: true, title: 'Bước vào hư không', giver: 'sect_rep', requires: 'q_vet_nut_1',
      desc: 'Bước vào một Vết Nứt Hư Không đang mở và hạ yêu thú canh giữ khe nứt trong cảnh. Nó mạnh hơn cảnh giới của ngươi một bậc; đan hồi Máu dưới Địa phẩm vào đó cháy thành tro; gục trong cảnh là bị hất văng ra và mất lượt tới hết chu kỳ.',
      objectives: [{ type: 'rift', target: 'boss', need: 1 }],
      rewards: { linhThach: 200, tuVi: 80, items: [{ id: 'yeu_dan_1', n: 1 }] } },
    q_vet_nut_3: { id: 'q_vet_nut_3', main: false, riftArc: true, title: 'Kẻ canh giữ thứ hai', giver: 'sect_rep', requires: 'q_vet_nut_2',
      desc: 'Trong vết nứt, yêu thú bị linh khí hư không kinh động sẽ hiện thân ngay cạnh ngươi khi ngươi ra tay trong cảnh — thứ mạnh nhất của cả cảnh. Hạ nó và mang yêu đan của nó về.',
      objectives: [{ type: 'rift', target: 'encounter', need: 1 }],
      rewards: { linhThach: 250, tuVi: 100, items: [{ id: 'yeu_dan_2', n: 1 }] } },
    q_vet_nut_4: { id: 'q_vet_nut_4', main: false, riftArc: true, title: 'Mảnh trời trong tay', giver: 'sect_rep', requires: 'q_vet_nut_3',
      desc: 'Mang về một mảnh trời rơi — thiên tài địa bảo phát sáng vàng mọc ngẫu nhiên trong cảnh của vết nứt. Đợt này tông đã nhờ Từ bà khấn trấn nên mảnh trời chắc chắn hiện ra. Hái được thì ra ngay, đừng tham.',
      objectives: [{ type: 'rift', target: 'treasure', need: 1 }],
      rewards: { linhThach: 300, tuVi: 120, items: [] } },
    // ===== THIÊN 4 TIẾP: CHƯƠNG 25-27 (mục 18 hàng chờ, js/thien4.js quản)
    // Mở sau arc vết nứt (q_vet_nut_4) + Trúc Cơ + bái nhập (cổng ở
    // thien4.js). Objectives type 'thien4' do module tự set done khi hệ
    // đã có báo thành công (hộ tống / đấu giá / nâng cấp động phủ) —
    // như tiền lệ type 'rift' của arc vết nứt.
    q_thien4_1: { id: 'q_thien4_1', main: true, thien4: true, title: 'Điểm mạch Thanh Sơn', giver: 'sect_rep', requires: 'q_vet_nut_4',
      desc: 'Vết nứt đã đo xong, các tông bắt đầu cắm cọc tranh linh mạch quanh Thanh Sơn. Tông của ngươi giao ngươi giữ một điểm mạch nhỏ ở Sơn Trung Vân Hải — việc đầu là hộ tống một chuyến hàng vận mạch của Mã Vạn Lai (đá trận, lương thực cho đệ tử giữ mạch) từ Rừng Thanh Sơn lên Trạm Buôn Chân Núi.',
      objectives: [{ type: 'thien4', target: 'escort', need: 1 }],
      rewards: { linhThach: 250, tuVi: 100, items: [] } },
    q_thien4_2: { id: 'q_thien4_2', main: true, thien4: true, title: 'Phiên đấu giá tranh mạch', giver: 'sect_rep', requires: 'q_thien4_1',
      desc: 'Bản đồ điểm mạch của vùng lọt vào phiên đấu giá Liên Tông ở bãi tuyển — đệ tử các tông đều ra giá, trong đó có thiên tài trẻ của tông đối trọng, kẻ vẫn coi ngươi là đối thủ đồng lứa từ ngày bái sư. Tông cần ngươi ra mặt: thắng 1 lô ở phiên đấu giá, đồ về tay tông là công của ngươi.',
      objectives: [{ type: 'thien4', target: 'auction', need: 1 }],
      rewards: { linhThach: 280, tuVi: 120, items: [] } },
    q_thien4_3: { id: 'q_thien4_3', main: true, thien4: true, title: 'Ấn cổ dưới điểm mạch', giver: 'sect_rep', requires: 'q_thien4_2',
      desc: 'Giữ được điểm mạch rồi, người giữ mạch đào thấy dưới mạch có khắc ấn cổ không thuộc tông nào — ấn của thời TRƯỚC Đại Kiếp, cùng loại ấn với vết khắc dưới đáy giếng cổ. Ấn chỉ "đọc" được qua Tụ Linh Trận mạnh: nâng động phủ riêng của ngươi lên cấp 2 (Tụ Linh Trận x2,0) rồi quay lại báo cho tông.',
      objectives: [{ type: 'thien4', target: 'cave', need: 1 }],
      rewards: { linhThach: 300, tuVi: 150, items: [] } },
    // ===== THIÊN 5 MỞ ĐẦU: CHƯƠNG 28-30 (lệnh Bui 19:11 30/10, js/thien5.js quản)
    // Vụ án đan độc mở đầu Thiên 5 "Kim Đan Phong Vân": mở sau Thiên 4
    // (q_thien4_3) + Trúc Cơ + bái nhập (cổng ở thien5.js). Ch.28 dùng
    // objective 'collect' sẵn có (recordEvent đếm khi hái điểm dược);
    // ch.29/30 dùng objective type 'thien5' do module tự set done khi
    // hệ đã có báo thành công (hạ boss thế giới / thú triều / vết nứt).
    q_thien5_1: { id: 'q_thien5_1', main: true, thien5: true, title: 'Đan độc vào làng', giver: 'sect_rep', requires: 'q_thien4_3',
      desc: 'Một mẻ đan giả đóng ấn Đan Hà Cốc bán qua phiên chợ: hai người làng và ba đệ tử trúng độc, cả vùng chỉ mặt Ngũ Độc Giáo. Tông giao ngươi tra án — việc đầu không phải đánh ai: hái 4 cây Độc Tâm Hoa còn tươi quanh bờ suối phía đông Rừng Thanh Sơn (hoặc khe suối Đại Sơn) mang về. Lý lão cần mẫu hoa THẬT để đối chiếu: độc trong đan giả bị tinh luyện lệch một nấc, chỉ mẫu tươi mới phân biệt được.',
      objectives: [{ type: 'collect', target: 'doc_tam_hoa', need: 4 }],
      rewards: { linhThach: 260, tuVi: 110, items: [] } },
    q_thien5_2: { id: 'q_thien5_2', main: true, thien5: true, title: 'Sào mãng sau Đầm Độc', giver: 'sect_rep', requires: 'q_thien5_1',
      desc: 'Đối chiếu xong: độc trong đan giả là nọc Cổ Mãng bị tinh luyện, mà quanh sào Cổ Mãng Vương ở Thập Vạn Đại Sơn (map 4) có dấu một lò luyện dã chiến. Hạ Cổ Mãng Vương, lục sào của nó lấy bằng chứng mang về — nghe nói trong sào còn có một trang sách lạ bị dùng làm giấy gói nọc.',
      objectives: [{ type: 'thien5', target: 'boss', need: 1 }],
      rewards: { linhThach: 280, tuVi: 130, items: [] } },
    q_thien5_3: { id: 'q_thien5_3', main: true, thien5: true, title: 'Kẻ giữ ấn lên tiếng', giver: 'sect_rep', requires: 'q_thien5_2',
      desc: 'Bằng chứng đủ rửa oan cho Ngũ Độc Giáo, nhưng kẻ luyện đan giả — một ma tu giữ di chỉ dưới điểm mạch — chưa lộ mặt. Hắn chỉ còn hai đường bịt đầu mối: xúi bầy thú đánh vào làng trong một lượt Thú Triều, hoặc trốn vào Vết Nứt Hư Không chờ khe khép. Giữ trọn một lượt Thú Triều (thắng cả 6 đợt), hoặc dọn xong một lượt Vết Nứt Hư Không — đường nào hắn cũng phải lộ diện.',
      objectives: [{ type: 'thien5', target: 'showdown', need: 1 }],
      rewards: { linhThach: 300, tuVi: 150, items: [] } },
    // ===== ARC CHUONG 13-20 (sau bai su, js/sect-arc.js quan bien the) =====
    // Truc chinh: q_chinh_19..27 (mo theo requires nhu cac chuong truoc).
    q_chinh_19: {"id": "q_chinh_19", "main": true, "title": "Báo danh nhập môn", "giver": "de_tu_phai", "requires": "q_chinh_18", "desc": "Lễ bái sư đã xong, tên ngươi đã vào sổ đệ tử của tông. Tạ Thanh Vân dặn: trước khi nhận việc tông đầu tiên, về làng Thanh Khê báo cho trưởng làng Trần Đức biết ngươi đã bái nhập tông nào — người giữ làng một đời đáng được nghe tin này từ chính miệng ngươi.", "objectives": [{"type": "talk", "target": "truong_lang", "need": 1}], "rewards": {"linhThach": 100, "tuVi": 30, "items": []}},
    q_chinh_20: {"id": "q_chinh_20", "main": true, "title": "Đường mòn lại động", "giver": "tho_san_ha", "requires": "q_chinh_19", "desc": "Mới yên được ít lâu, đường mòn trong Rừng Thanh Sơn lại có sói rừng kéo bầy chặn người qua lại — lần này chúng bạo hơn, như có linh khí lạ xúi giục. Hà Thiết Sơn nhờ ngươi dẹp 5 con Sói Rừng dọc đường mòn, giữ đường cho làng và cho cả bãi tuyển.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 5}], "rewards": {"linhThach": 120, "tuVi": 40, "items": [{"id": "yeu_dan_1", "n": 1}]}},
    q_chinh_21: {"id": "q_chinh_21", "main": true, "title": "Phá thêm một quan", "giver": "dai_phu", "requires": "q_chinh_20", "desc": "Lý lão bắt mạch cho ngươi rồi lắc đầu: nền thì có, mà khí còn nổi. Trước khi tông môn giao việc lớn hơn, ngươi phải tự phá thêm một quan nữa cho ông xem — đột phá thành công 1 lần, bằng chính tu vi của mình.", "objectives": [{"type": "breakthrough", "need": 1}], "rewards": {"linhThach": 100, "tuVi": 20, "items": [{"id": "ngung_khi_dan", "n": 1}]}},
    q_chinh_22: {"id": "q_chinh_22", "main": true, "title": "Vương thú kết đan", "giver": "tho_san_ha", "requires": "q_chinh_21", "desc": "Hà Thiết Sơn nói điều ông giữ kín mười năm: vương thú trấn núi sống đủ trăm năm sẽ kết Yêu Đan Cấp 3 trong bụng — thứ nguyên liệu cốt lõi của Trúc Cơ Đan. Hạ 1 vương thú mang hình Sơn Quân: Sơn Quân hồi sinh ở sào huyệt cũ trong Rừng Thanh Sơn, hoặc Gầm Sơn Hổ Vương ở Hang Hổ Gầm sâu trong Thập Vạn Đại Sơn.", "objectives": [{"type": "kill", "target": "son_quan", "need": 1}], "rewards": {"linhThach": 200, "tuVi": 60, "items": [{"id": "yeu_dan_3", "n": 1}]}},
    q_chinh_23: {"id": "q_chinh_23", "main": true, "title": "Phương đan dẫn kiếp", "giver": "hoc_tro", "requires": "q_chinh_22", "desc": "Tiểu Hạnh hớt hải tìm ngươi: thầy Lý nói người đã chạm tay vào Yêu Đan Cấp 3 thì phải nghe ông dặn về phương Trúc Cơ Đan — phương đan dẫn kiếp chỉ truyền cho người sắp dùng tới. Tới hiệu thuốc gặp Lý lão.", "objectives": [{"type": "talk", "target": "dai_phu", "need": 1}], "rewards": {"linhThach": 120, "tuVi": 30, "items": [{"id": "thanh_linh_tuy", "n": 1}, {"id": "ngoc_tuy_chi", "n": 1}]}},
    q_chinh_24: {"id": "q_chinh_24", "main": true, "title": "Giếng cổ lại sáng", "giver": "giu_mieu", "requires": "q_chinh_23", "desc": "Giữa trưa, giếng cổ Thanh Khê lại phát sáng — lần này mặt nước nứt một vệt sáng thẳng đứng như vết rách trên trời phản chiếu xuống đáy giếng. Từ bà ở Miếu Sơn Thần cho người gọi ngươi: bà cần ngươi về làng báo ngay cho trưởng làng Trần Đức từng điều mắt thấy.", "objectives": [{"type": "talk", "target": "truong_lang", "need": 1}], "rewards": {"linhThach": 80, "tuVi": 40, "items": []}},
    q_chinh_25: {"id": "q_chinh_25", "main": true, "title": "Ngưỡng cửa thiên lôi", "giver": "de_tu_phai", "requires": "q_chinh_24", "desc": "Tạ Thanh Vân nghe chuyện giếng sáng thì trầm ngâm rất lâu, rồi nói: phong ấn biến động là điềm của những năm không yên, mà việc của ngươi trước mắt chỉ có một — đứng vững ở ngưỡng Trúc Cơ. Trước ngày dẫn động lôi kiếp, tới Miếu Sơn Thần gặp Từ bà, nhận bài khấn trấn tâm bà giữ từ thời Thanh Khê lão nhân.", "objectives": [{"type": "talk", "target": "giu_mieu", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 50, "items": [{"id": "dai_hoi_xuan_dan", "n": 1}]}},
    q_chinh_26: {"id": "q_chinh_26", "main": true, "title": "Đạo cơ mới thành", "giver": "de_tu_phai", "requires": "q_chinh_25", "desc": "Mọi thứ đã sẵn: tu vi viên mãn, Trúc Cơ Đan trong tay, bài khấn trấn tâm trong lòng. Việc còn lại là của trời và của ngươi — mở lò tu hành, dẫn động lôi kiếp, sống sót qua thiên lôi để kết đạo cơ Trúc Cơ. Xong, quay lại bãi tuyển gặp Tạ Thanh Vân.", "objectives": [{"type": "breakthrough", "need": 1}], "rewards": {"linhThach": 200, "tuVi": 80, "items": []}},
    q_chinh_27: {"id": "q_chinh_27", "main": true, "title": "Vân Hải có đường", "giver": "de_tu_phai", "requires": "q_chinh_26", "desc": "Trúc Cơ thành, mắt nhìn thế giới đã khác: sau lưng Chi Đỉnh là Sơn Trung Vân Hải, đất của tu sĩ Trúc Cơ, và xa hơn nữa là Đoạn Long Lĩnh — đường tới Kim Đan bắt đầu từ đó. Tạ Thanh Vân giao ngươi thổ nạp tích 300 tu vi ở cảnh giới mới, cho đạo cơ đặc lại trước chuyến đi xa đầu tiên.", "objectives": [{"type": "tuvi", "need": 300}], "rewards": {"linhThach": 220, "tuVi": 0, "items": [{"id": "long_tien_thao", "n": 1}]}},
    // Bien the theo tong (sectArc: true — availableQuests bo qua, sect-arc.js
    // chi mo cho tong nguoi choi da bai nhap, dung chuyen mon cua tong do).
    q_mon_thanh_phong_1: {"id": "q_mon_thanh_phong_1", "main": true, "title": "Tuần sơn đầu tiên", "giver": "de_tu_phai", "desc": "Việc đầu tiên Thanh Phong giao cho đệ tử mới: theo đường núi từ bãi tuyển xuống bìa rừng, dẹp 3 con Sói Rừng đang rình người qua đường. Kiếm của phái là để chắn trước người khác — bắt đầu từ con đường này.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 3}], "rewards": {"linhThach": 90, "tuVi": 30, "items": []}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 13},
    q_mon_huyen_phap_1: {"id": "q_mon_huyen_phap_1", "main": true, "title": "Dẫn pháp nhập môn", "giver": "tong_phap", "desc": "Huyền Pháp Tông không giao việc tay chân trước: ngươi tới đài thử pháp, thổ nạp dẫn linh khí đi đủ một vòng ngũ hành, tích 60 tu vi cho Liễu Ngưng Sương xem tâm tĩnh tới đâu.", "objectives": [{"type": "tuvi", "need": 60}], "rewards": {"linhThach": 90, "tuVi": 30, "items": []}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 13},
    q_mon_thien_cong_1: {"id": "q_mon_thien_cong_1", "main": true, "title": "Bờm sắt nhập kho", "giver": "tong_khi", "desc": "Kho vật liệu của Thiên Công Phường đang thiếu bờm sắt. Hạ 2 con Lợn Mông Sắt trong Rừng Thanh Sơn, mang bờm về nguyên vẹn — phường coi đó là lễ nhập môn của thợ.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 2}], "rewards": {"linhThach": 100, "tuVi": 25, "items": [{"id": "thit_lon", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 13},
    q_mon_dan_ha_1: {"id": "q_mon_dan_ha_1", "main": true, "title": "Linh chi nhập cốc", "giver": "tong_dan", "desc": "Đan Hà Cốc giao việc đầu tiên nhẹ nhàng mà khó khinh: hái 3 tai Linh Chi còn đẫm sương gần suối linh, mang về nhập kho dược của Cốc. Dập một góc là dược tính thoát hết.", "objectives": [{"type": "collect", "target": "linh_chi", "need": 3}], "rewards": {"linhThach": 90, "tuVi": 25, "items": [{"id": "thao_duoc", "n": 2}]}, "sectArc": true, "sect": "dan_ha", "arcChapter": 13},
    q_mon_van_thu_1: {"id": "q_mon_van_thu_1", "main": true, "title": "Ra mắt bầy thú", "giver": "tong_thu", "desc": "Vạn Thú Môn không giao việc bằng miệng: tới lán trại trong rừng gặp Hà Thiết Sơn, để ông đưa ngươi ra mắt bầy thú rừng. Thú nhận ngươi rồi, môn mới nhận ngươi thật.", "objectives": [{"type": "talk", "target": "tho_san_ha", "need": 1}], "rewards": {"linhThach": 80, "tuVi": 30, "items": []}, "sectArc": true, "sect": "van_thu", "arcChapter": 13},
    q_mon_thien_phu_1: {"id": "q_mon_thien_phu_1", "main": true, "title": "Dọn kho giấy mới", "giver": "tong_phu", "desc": "Kho giấy bùa ven suối linh lại có rắn lục bò vào nằm cuộn trong xấp giấy khô. Dẹp 3 con Rắn Lục Đuôi Đỏ — tay nhanh mà không được giẫm hỏng giấy, như lệ của các.", "objectives": [{"type": "kill", "target": "ran_luc", "need": 3}], "rewards": {"linhThach": 95, "tuVi": 25, "items": []}, "sectArc": true, "sect": "thien_phu", "arcChapter": 13},
    q_mon_cuu_cung_1: {"id": "q_mon_cuu_cung_1", "main": true, "title": "Dẫn khí qua cửu cung — nhập môn", "giver": "tong_tran", "desc": "Cửu Cung Trận Tông cho đệ tử mới làm lại bài cũ ở mức khó hơn: dẫn linh khí đi đủ một vòng cửu cung bằng thổ nạp, tích 70 tu vi không để khí loạn một ô nào.", "objectives": [{"type": "tuvi", "need": 70}], "rewards": {"linhThach": 90, "tuVi": 30, "items": []}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 13},
    q_mon_kim_cang_1: {"id": "q_mon_kim_cang_1", "main": true, "title": "Việc tay chân đầu tiên", "giver": "tong_the", "desc": "Kim Cang Môn giao việc đầu tiên đúng chất môn: ra bãi hoang phía nam hạ 3 con Lợn Rừng bằng sức thân thể. Đứng vững, không lùi — đó là lễ nhập môn.", "objectives": [{"type": "kill", "target": "lon_rung", "need": 3}], "rewards": {"linhThach": 100, "tuVi": 25, "items": [{"id": "thit_lon", "n": 1}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 13},
    q_mon_ngu_doc_1: {"id": "q_mon_ngu_doc_1", "main": true, "title": "Độc hoa nhập kho", "giver": "tong_doc", "desc": "Kho độc của Ngũ Độc Giáo cần Độc Tâm Hoa mới. Ra bãi rắn lục làm ổ hái 3 cây Độc Tâm Hoa mang về cho Đường Tĩnh — tay không run mới được chạm vào hoa độc.", "objectives": [{"type": "collect", "target": "doc_tam_hoa", "need": 3}], "rewards": {"linhThach": 90, "tuVi": 25, "items": [{"id": "giai_doc_dan", "n": 1}]}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 13},
    q_mon_huyen_am_1: {"id": "q_mon_huyen_am_1", "main": true, "title": "Khúc đàn nhập môn", "giver": "tong_am", "desc": "Huyền Âm Cung giao việc đầu tiên là một việc tình cảm: mang tiếng đàn nhập môn về quán trọ làng Thanh Khê, đàn cho Hoa nương và khách đi đường nghe một khúc yên lòng.", "objectives": [{"type": "talk", "target": "chu_quan", "need": 1}], "rewards": {"linhThach": 80, "tuVi": 35, "items": []}, "sectArc": true, "sect": "huyen_am", "arcChapter": 13},
    q_mon_thanh_phong_2: {"id": "q_mon_thanh_phong_2", "main": true, "title": "Kiếm tuần Đại Sơn", "giver": "de_tu_phai", "desc": "Thanh Phong giao ngươi tuần tra khu Lợn Mông Sắt ở Thập Vạn Đại Sơn: hạ 3 con Lợn Mông Sắt đang phá đường mòn cửa sơn. Đệ tử của phái phải biết giữ đường cho người sau.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 3}], "rewards": {"linhThach": 140, "tuVi": 40, "items": []}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 14},
    q_mon_huyen_phap_2: {"id": "q_mon_huyen_phap_2", "main": true, "title": "Quả tụ linh trên cổ thụ", "giver": "tong_phap", "desc": "Khỉ Mặt Đỏ ở khu Cổ Thụ Đại Sơn tha Tụ Linh Quả về tổ. Hái — hay nói đúng hơn là lấy lại — 3 quả Tụ Linh Quả cho đài thử pháp của Huyền Pháp Tông.", "objectives": [{"type": "collect", "target": "tu_linh_qua", "need": 3}], "rewards": {"linhThach": 130, "tuVi": 40, "items": []}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 14},
    q_mon_thien_cong_2: {"id": "q_mon_thien_cong_2", "main": true, "title": "Huyết sâm gần sào huyệt", "giver": "tong_khi", "desc": "Huyết Sâm mọc nơi đất rừng lâu năm cạnh sào huyệt yêu thú ở Đại Sơn — vật liệu rèn lẫn luyện đan đều quý. Hái 3 củ mang về cho phường, cẩn thận chủ nhà của nó.", "objectives": [{"type": "collect", "target": "huyet_sam", "need": 3}], "rewards": {"linhThach": 140, "tuVi": 35, "items": []}, "sectArc": true, "sect": "thien_cong", "arcChapter": 14},
    q_mon_dan_ha_2: {"id": "q_mon_dan_ha_2", "main": true, "title": "Ngọc tủy chi cho Cốc", "giver": "tong_dan", "desc": "Đan Hà Cốc cần Ngọc Tủy Chi mọc ở kẽ đá bãi luyện công chân núi và gốc cây phía đông rừng. Hái 2 tai mang về — Cốc đang chuẩn bị những mẻ đan lớn cho đệ tử lên núi.", "objectives": [{"type": "collect", "target": "ngoc_tuy_chi", "need": 2}], "rewards": {"linhThach": 140, "tuVi": 35, "items": []}, "sectArc": true, "sect": "dan_ha", "arcChapter": 14},
    q_mon_van_thu_2: {"id": "q_mon_van_thu_2", "main": true, "title": "Sói cửa sơn", "giver": "tong_thu", "desc": "Bầy Sói Rừng ở cửa sơn Đại Sơn đang uy hiếp đàn linh thú non của Vạn Thú Môn chăn thả gần đó. Dẹp 4 con sói đầu bầy cho Giang Tiểu Thú.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 4}], "rewards": {"linhThach": 130, "tuVi": 40, "items": [{"id": "yeu_dan_1", "n": 1}]}, "sectArc": true, "sect": "van_thu", "arcChapter": 14},
    q_mon_thien_phu_2: {"id": "q_mon_thien_phu_2", "main": true, "title": "Bùa trấn đường sơn", "giver": "tong_phu", "desc": "Đường lên Đại Sơn cần bùa trấn mới: Thiên Phù Các bắt ngươi tĩnh tọa dẫn khí đủ 80 tu vi ngay tại bãi tuyển, nạp linh vào xấp bùa trấn đường cho mùa này.", "objectives": [{"type": "tuvi", "need": 80}], "rewards": {"linhThach": 120, "tuVi": 40, "items": []}, "sectArc": true, "sect": "thien_phu", "arcChapter": 14},
    q_mon_cuu_cung_2: {"id": "q_mon_cuu_cung_2", "main": true, "title": "Xem trận ở miếu", "giver": "tong_tran", "desc": "Trước khi đệ tử vào Đại Sơn, Cửu Cung Trận Tông bắt tới Miếu Sơn Thần gặp Từ bà, nghe bà kể thế trận phong ấn của Thanh Khê lão nhân — vào núi mà không hiểu thế đất là tự nộp mạng.", "objectives": [{"type": "talk", "target": "giu_mieu", "need": 1}], "rewards": {"linhThach": 110, "tuVi": 45, "items": []}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 14},
    q_mon_kim_cang_2: {"id": "q_mon_kim_cang_2", "main": true, "title": "Lợn rừng Đại Sơn", "giver": "tong_the", "desc": "Lợn Rừng ở Đại Sơn to và dữ hơn hẳn bãi hoang quê nhà. Hạ 4 con cho Kim Cang Môn — coi như bài kiểm tra thân thể đầu tiên ở đất lạ.", "objectives": [{"type": "kill", "target": "lon_rung", "need": 4}], "rewards": {"linhThach": 140, "tuVi": 35, "items": [{"id": "thit_lon", "n": 1}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 14},
    q_mon_ngu_doc_2: {"id": "q_mon_ngu_doc_2", "main": true, "title": "Rắn khe suối", "giver": "tong_doc", "desc": "Khe Suối Rắn Lục ở Đại Sơn là kho nọc sống của Ngũ Độc Giáo. Dẹp 4 con Rắn Lục Đuôi Đỏ quá dữ gần đường đi, phần còn lại để giáo tự thu nọc.", "objectives": [{"type": "kill", "target": "ran_luc", "need": 4}], "rewards": {"linhThach": 130, "tuVi": 40, "items": []}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 14},
    q_mon_huyen_am_2: {"id": "q_mon_huyen_am_2", "main": true, "title": "Thảo an thần", "giver": "tong_am", "desc": "Sau những chuyến vào Đại Sơn, thương binh cần thuốc an thần. Hái 4 cây Thanh Tâm Thảo cho Huyền Âm Cung sắc kèm khúc đàn an thần của cung.", "objectives": [{"type": "collect", "target": "thanh_tam_thao", "need": 4}], "rewards": {"linhThach": 120, "tuVi": 40, "items": []}, "sectArc": true, "sect": "huyen_am", "arcChapter": 14},
    q_mon_thanh_phong_3: {"id": "q_mon_thanh_phong_3", "main": true, "title": "Kiếm thí bãi luyện công", "giver": "de_tu_phai", "desc": "Đàn Khỉ Mặt Đỏ lại kéo xuống Bãi Luyện Công phá đài kiếm của Thanh Phong. Dẹp 4 con quậy nhất — phái gọi đây là kiếm thí: kiếm phải bén trước khi người phá quan.", "objectives": [{"type": "kill", "target": "khi_mat_do", "need": 4}], "rewards": {"linhThach": 140, "tuVi": 40, "items": []}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 15},
    q_mon_huyen_phap_3: {"id": "q_mon_huyen_phap_3", "main": true, "title": "Bế quan dẫn pháp", "giver": "tong_phap", "desc": "Huyền Pháp Tông cho ngươi bế quan ngắn ở đài thử pháp: thổ nạp tích 100 tu vi trong một vòng dẫn pháp không gián đoạn. Tâm tĩnh thì pháp mới chịu đỡ ngươi qua quan.", "objectives": [{"type": "tuvi", "need": 100}], "rewards": {"linhThach": 120, "tuVi": 50, "items": []}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 15},
    q_mon_thien_cong_3: {"id": "q_mon_thien_cong_3", "main": true, "title": "Thử giáp bờm sắt", "giver": "tong_khi", "desc": "Phường vừa rèn xong lô giáp bờm sắt mới, cần người mặc thử vào việc thật: hạ 3 con Lợn Mông Sắt trong rừng mà giáp không sứt. Qua được, phường ghi tên ngươi vào sổ thợ chính.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 3}], "rewards": {"linhThach": 150, "tuVi": 35, "items": [{"id": "yeu_dan_1", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 15},
    q_mon_dan_ha_3: {"id": "q_mon_dan_ha_3", "main": true, "title": "Mẻ bồi nguyên đầu tay", "giver": "tong_dan", "desc": "Đan Hà Cốc giao cho ngươi tự luyện 1 viên Đại Bồi Nguyên Đan — mẻ đan bồi nguyên đầu tay của đệ tử, luyện xong mang về cho Tần Dược Tử chấm. Đan này là để chính ngươi uống trước ngày phá quan.", "objectives": [{"type": "brew", "target": "dai_boi_nguyen_dan", "need": 1}], "rewards": {"linhThach": 130, "tuVi": 40, "items": []}, "sectArc": true, "sect": "dan_ha", "arcChapter": 15},
    q_mon_van_thu_3: {"id": "q_mon_van_thu_3", "main": true, "title": "Dược cho thú thương", "giver": "tong_thu", "desc": "Đàn thú chăn thả của Vạn Thú Môn bị sói cắn thương mấy con. Hái 3 tai Linh Chi gần suối linh mang về cho Giang Tiểu Thú giã thuốc cho chúng.", "objectives": [{"type": "collect", "target": "linh_chi", "need": 3}], "rewards": {"linhThach": 120, "tuVi": 40, "items": [{"id": "thao_duoc", "n": 2}]}, "sectArc": true, "sect": "van_thu", "arcChapter": 15},
    q_mon_thien_phu_3: {"id": "q_mon_thien_phu_3", "main": true, "title": "Tĩnh tọa vẽ đại phù", "giver": "tong_phu", "desc": "Thiên Phù Các chuẩn bị một lá đại phù cho mùa thú dữ tới: ngươi tĩnh tọa dẫn khí tích 100 tu vi, nạp linh vào nét bùa chính — tay run một nét là cả lá hỏng.", "objectives": [{"type": "tuvi", "need": 100}], "rewards": {"linhThach": 120, "tuVi": 50, "items": []}, "sectArc": true, "sect": "thien_phu", "arcChapter": 15},
    q_mon_cuu_cung_3: {"id": "q_mon_cuu_cung_3", "main": true, "title": "Bế quan cửu cung", "giver": "tong_tran", "desc": "Cửu Cung Trận Tông nâng bài nhập môn lên một bậc: dẫn khí qua cửu cung tích 120 tu vi, chín ô phải sáng đều như một. Âu Dương Kỳ nói đây là nền cho mọi đại trận sau này của ngươi.", "objectives": [{"type": "tuvi", "need": 120}], "rewards": {"linhThach": 120, "tuVi": 50, "items": []}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 15},
    q_mon_kim_cang_3: {"id": "q_mon_kim_cang_3", "main": true, "title": "Đấu lợn sắt luyện thể", "giver": "tong_the", "desc": "Luyện thể trước phá quan của Kim Cang Môn chỉ có một bài: đấu thẳng 4 con Lợn Mông Sắt, lấy cú húc của chúng tôi da thịt. Đau mà không ngã là qua.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 4}], "rewards": {"linhThach": 150, "tuVi": 40, "items": [{"id": "yeu_dan_1", "n": 1}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 15},
    q_mon_ngu_doc_3: {"id": "q_mon_ngu_doc_3", "main": true, "title": "Luyện độc hoa", "giver": "tong_doc", "desc": "Ngũ Độc Giáo cho ngươi tự thu 4 cây Độc Tâm Hoa luyện độc công: hoa phải nguyên, nọc trong cánh không được thoát. Đường Tĩnh sẽ xem tay ngươi có còn run không.", "objectives": [{"type": "collect", "target": "doc_tam_hoa", "need": 4}], "rewards": {"linhThach": 130, "tuVi": 40, "items": []}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 15},
    q_mon_huyen_am_3: {"id": "q_mon_huyen_am_3", "main": true, "title": "Đàn tĩnh tâm", "giver": "tong_am", "desc": "Trước ngày phá quan, Huyền Âm Cung bắt đệ tử ngồi đàn tĩnh tâm đủ một tuần hương: thổ nạp tích 100 tu vi theo nhịp đàn của Tiêu Uyển Nhi, không để tâm loạn một nhịp.", "objectives": [{"type": "tuvi", "need": 100}], "rewards": {"linhThach": 120, "tuVi": 50, "items": []}, "sectArc": true, "sect": "huyen_am", "arcChapter": 15},
    q_mon_thanh_phong_4: {"id": "q_mon_thanh_phong_4", "main": true, "title": "Dọn tai mắt của vương", "giver": "de_tu_phai", "desc": "Đoàn săn vương thú cần đường vào sào sạch sẽ: Thanh Phong giao ngươi dẹp 5 con Sói Rừng — tai mắt của vương thú — quanh đường mòn và cửa sơn. Kiếm đi trước, đoàn theo sau.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 5}], "rewards": {"linhThach": 160, "tuVi": 50, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 16},
    q_mon_huyen_phap_4: {"id": "q_mon_huyen_phap_4", "main": true, "title": "Pháp đàn áp trận", "giver": "tong_phap", "desc": "Trước trận săn vương, Huyền Pháp Tông dựng pháp đàn áp trận ở bãi tuyển: ngươi dẫn pháp tích 80 tu vi nạp vào đàn, để lúc vương thú vùng lên có pháp lực đè xuống.", "objectives": [{"type": "tuvi", "need": 80}], "rewards": {"linhThach": 150, "tuVi": 50, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 16},
    q_mon_thien_cong_4: {"id": "q_mon_thien_cong_4", "main": true, "title": "Giáp săn vương", "giver": "tong_khi", "desc": "Thiên Công Phường rèn giáp săn vương cho cả đoàn từ bờm sắt mới: hạ 4 con Lợn Mông Sắt lấy bờm tốt nhất. Giáp xong, phường chia cho ngươi một viên Yêu Đan Cấp 2 làm công săn.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 4}], "rewards": {"linhThach": 170, "tuVi": 45, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 16},
    q_mon_dan_ha_4: {"id": "q_mon_dan_ha_4", "main": true, "title": "Đan cho đoàn săn", "giver": "tong_dan", "desc": "Đoàn săn vương thú không thể đi tay không: Đan Hà Cốc bắt ngươi luyện 2 viên Đại Hồi Xuân Đan mang theo — đan cứu mạng của cả đoàn, luyện hỏng là người chết thật.", "objectives": [{"type": "brew", "target": "dai_hoi_xuan_dan", "need": 2}], "rewards": {"linhThach": 150, "tuVi": 45, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "dan_ha", "arcChapter": 16},
    q_mon_van_thu_4: {"id": "q_mon_van_thu_4", "main": true, "title": "Người dẫn đường vào sào", "giver": "tong_thu", "desc": "Cả đoàn săn chỉ có một người được thú rừng tin: tới lán trại gặp Hà Thiết Sơn, xin ông dẫn đường vào gần sào vương thú. Vạn Thú Môn cử ngươi đi vì thú ngửi được lòng ngươi.", "objectives": [{"type": "talk", "target": "tho_san_ha", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "van_thu", "arcChapter": 16},
    q_mon_thien_phu_4: {"id": "q_mon_thien_phu_4", "main": true, "title": "Dọn rắn đường săn", "giver": "tong_phu", "desc": "Đường săn qua khe suối đầy Rắn Lục Đuôi Đỏ — đoàn đi qua là bị cắn lén. Thiên Phù Các giao ngươi dẹp 4 con rắn dữ nhất ven đường trước ngày xuất phát.", "objectives": [{"type": "kill", "target": "ran_luc", "need": 4}], "rewards": {"linhThach": 160, "tuVi": 50, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "thien_phu", "arcChapter": 16},
    q_mon_cuu_cung_4: {"id": "q_mon_cuu_cung_4", "main": true, "title": "Trận dụ vương", "giver": "tong_tran", "desc": "Cửu Cung Trận Tông muốn bày trận dụ vương thú ra khỏi sào: tới Miếu Sơn Thần gặp Từ bà, xin bà chỉ thế đất quanh sào huyệt và bài khấn yên núi. Trận dụ được vương là nhờ hiểu đất của nó.", "objectives": [{"type": "talk", "target": "giu_mieu", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 16},
    q_mon_kim_cang_4: {"id": "q_mon_kim_cang_4", "main": true, "title": "Dọn đàn theo hầu", "giver": "tong_the", "desc": "Vương thú đi đâu cũng có đàn Lợn Rừng theo hầu. Kim Cang Môn giao ngươi dọn 5 con lợn theo hầu quanh cửa sơn, để ngày săn đoàn chỉ phải đối mặt một mình con vương.", "objectives": [{"type": "kill", "target": "lon_rung", "need": 5}], "rewards": {"linhThach": 160, "tuVi": 50, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 16},
    q_mon_ngu_doc_4: {"id": "q_mon_ngu_doc_4", "main": true, "title": "Độc săn vương", "giver": "tong_doc", "desc": "Ngũ Độc Giáo góp cho đoàn săn thứ vũ khí lặng lẽ nhất: thu 4 cây Độc Tâm Hoa tẩm độc săn vương. Đường Tĩnh dặn: độc này chỉ dùng cho con vương, không dùng bừa.", "objectives": [{"type": "collect", "target": "doc_tam_hoa", "need": 4}], "rewards": {"linhThach": 150, "tuVi": 50, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 16},
    q_mon_huyen_am_4: {"id": "q_mon_huyen_am_4", "main": true, "title": "Khúc đàn tiễn đoàn săn", "giver": "tong_am", "desc": "Đoàn săn lên đường cần một khúc đàn tiễn: về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc an hồn cho những người từng ngã xuống vì thú dữ — để đoàn nhớ mình săn vì ai.", "objectives": [{"type": "talk", "target": "chu_quan", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "huyen_am", "arcChapter": 16},
    q_mon_thanh_phong_5: {"id": "q_mon_thanh_phong_5", "main": true, "title": "Giữ đường vận dược", "giver": "de_tu_phai", "desc": "Dược liệu luyện Trúc Cơ Đan phải vận qua bãi khỉ cổ thụ, mà đàn Khỉ Mặt Đỏ cứ cướp phá đoàn thồ. Thanh Phong giao ngươi dẹp 5 con khỉ đầu đàn giữ đường cho dược đi qua.", "objectives": [{"type": "kill", "target": "khi_mat_do", "need": 5}], "rewards": {"linhThach": 160, "tuVi": 45, "items": [{"id": "linh_chi", "n": 2}]}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 17},
    q_mon_huyen_phap_5: {"id": "q_mon_huyen_phap_5", "main": true, "title": "Quả tụ linh cho lò đan", "giver": "tong_phap", "desc": "Lò luyện Trúc Cơ Đan cần Tụ Linh Quả giữ linh khí trong lò không tán. Lấy 4 quả Tụ Linh Quả từ đàn khỉ cổ thụ ở Đại Sơn mang về cho Huyền Pháp Tông góp vào lò.", "objectives": [{"type": "collect", "target": "tu_linh_qua", "need": 4}], "rewards": {"linhThach": 150, "tuVi": 45, "items": []}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 17},
    q_mon_thien_cong_5: {"id": "q_mon_thien_cong_5", "main": true, "title": "Thanh linh tủy cho lò", "giver": "tong_khi", "desc": "Lò của Thiên Công Phường rèn giữ lửa bằng Thanh Linh Tủy đọng ở kẽ đá cạnh sào Sơn Quân và phế tích Đại Sơn. Lấy 2 giọt mang về — đây là phần phường góp cho mẻ Trúc Cơ Đan của ngươi.", "objectives": [{"type": "collect", "target": "thanh_linh_tuy", "need": 2}], "rewards": {"linhThach": 160, "tuVi": 40, "items": [{"id": "linh_chi", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 17},
    q_mon_dan_ha_5: {"id": "q_mon_dan_ha_5", "main": true, "title": "Ngọc tủy góp lò", "giver": "tong_dan", "desc": "Đan Hà Cốc mở kho cũng không đủ Ngọc Tủy Chi cho mẻ Trúc Cơ Đan: hái 2 tai ở kẽ đá bãi luyện công mang về góp lò. Tần Dược Tử nói dược này mà thiếu, đan dẫn kiếp không kết nổi.", "objectives": [{"type": "collect", "target": "ngoc_tuy_chi", "need": 2}], "rewards": {"linhThach": 150, "tuVi": 40, "items": []}, "sectArc": true, "sect": "dan_ha", "arcChapter": 17},
    q_mon_van_thu_5: {"id": "q_mon_van_thu_5", "main": true, "title": "Linh chi góp lò", "giver": "tong_thu", "desc": "Vạn Thú Môn góp phần của môn vào mẻ Trúc Cơ Đan của ngươi bằng thứ môn có nhiều nhất: Linh Chi rừng. Hái 4 tai còn đẫm sương mang về cho Giang Tiểu Thú đóng gói gửi lò.", "objectives": [{"type": "collect", "target": "linh_chi", "need": 4}], "rewards": {"linhThach": 140, "tuVi": 45, "items": []}, "sectArc": true, "sect": "van_thu", "arcChapter": 17},
    q_mon_thien_phu_5: {"id": "q_mon_thien_phu_5", "main": true, "title": "Phù hộ lò đan", "giver": "tong_phu", "desc": "Luyện Trúc Cơ Đan phải có phù hộ lò giữ lửa không tắt giữa chừng: Thiên Phù Các bắt ngươi tĩnh tọa dẫn khí tích 90 tu vi, tự tay nạp linh vào ba lá phù hộ lò của chính mẻ đan của mình.", "objectives": [{"type": "tuvi", "need": 90}], "rewards": {"linhThach": 140, "tuVi": 50, "items": [{"id": "linh_chi", "n": 2}]}, "sectArc": true, "sect": "thien_phu", "arcChapter": 17},
    q_mon_cuu_cung_5: {"id": "q_mon_cuu_cung_5", "main": true, "title": "Trận tụ linh cho lò", "giver": "tong_tran", "desc": "Cửu Cung Trận Tông bày trận tụ linh quanh lò luyện Trúc Cơ Đan: ngươi dẫn khí qua cửu cung tích 90 tu vi để khép trận. Trận khép, linh khí trong lò mới không thoát ra ngoài.", "objectives": [{"type": "tuvi", "need": 90}], "rewards": {"linhThach": 140, "tuVi": 50, "items": [{"id": "linh_chi", "n": 2}]}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 17},
    q_mon_kim_cang_5: {"id": "q_mon_kim_cang_5", "main": true, "title": "Thồ dược qua núi", "giver": "tong_the", "desc": "Dược liệu nặng phải có người gánh qua núi: Kim Cang Môn giao ngươi dọn đường thồ — hạ 4 con Lợn Mông Sắt chặn đường mòn Đại Sơn, rồi gánh phần dược của môn về lò.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 4}], "rewards": {"linhThach": 160, "tuVi": 45, "items": [{"id": "linh_chi", "n": 2}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 17},
    q_mon_ngu_doc_5: {"id": "q_mon_ngu_doc_5", "main": true, "title": "Dược dẫn phụ", "giver": "tong_doc", "desc": "Mẻ Trúc Cơ Đan cần một vị dược dẫn cay độc để kéo dược lực vào đan: Ngũ Độc Giáo giao ngươi thu 3 cây Độc Tâm Hoa tốt nhất. Đường Tĩnh dặn liều lượng là mạng người, hoa phải nguyên.", "objectives": [{"type": "collect", "target": "doc_tam_hoa", "need": 3}], "rewards": {"linhThach": 140, "tuVi": 45, "items": [{"id": "linh_chi", "n": 2}]}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 17},
    q_mon_huyen_am_5: {"id": "q_mon_huyen_am_5", "main": true, "title": "Thảo an thần cho lò", "giver": "tong_am", "desc": "Người luyện Trúc Cơ Đan phải tĩnh tâm ba ngày canh lò: Huyền Âm Cung giao ngươi hái 5 cây Thanh Tâm Thảo sắc nước an thần cho người canh lò — trong đó có chính ngươi.", "objectives": [{"type": "collect", "target": "thanh_tam_thao", "need": 5}], "rewards": {"linhThach": 140, "tuVi": 45, "items": [{"id": "linh_chi", "n": 2}]}, "sectArc": true, "sect": "huyen_am", "arcChapter": 17},
    q_mon_thanh_phong_6: {"id": "q_mon_thanh_phong_6", "main": true, "title": "Giữ yên đường về làng", "giver": "de_tu_phai", "desc": "Trước ngày ngươi độ kiếp, Thanh Phong giao việc cuối: dẹp 4 con Sói Rừng đang lảng vảng đường về làng. Ngươi lên trời hay ở lại đất, con đường về nhà phải yên trước đã.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 4}], "rewards": {"linhThach": 160, "tuVi": 50, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 18},
    q_mon_huyen_phap_6: {"id": "q_mon_huyen_phap_6", "main": true, "title": "Pháp đàn cầu phúc", "giver": "tong_phap", "desc": "Huyền Pháp Tông dựng pháp đàn cầu phúc cho đệ tử sắp độ kiếp: ngươi dẫn pháp tích 100 tu vi nạp vào đàn. Liễu Ngưng Sương nói pháp đàn không chắn nổi thiên lôi — nó chỉ giúp ngươi tĩnh tâm mà chịu.", "objectives": [{"type": "tuvi", "need": 100}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 18},
    q_mon_thien_cong_6: {"id": "q_mon_thien_cong_6", "main": true, "title": "Rèn lại giáp độ kiếp", "giver": "tong_khi", "desc": "Thiên Công Phường gọi ngươi về lò rèn lại bộ giáp cho ngày độ kiếp: vật liệu vẫn là bờm sắt tốt nhất — hạ 3 con Lợn Mông Sắt mang bờm về, phường rèn gấp trong đêm.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 3}], "rewards": {"linhThach": 170, "tuVi": 45, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 18},
    q_mon_dan_ha_6: {"id": "q_mon_dan_ha_6", "main": true, "title": "Đan cứu mạng ngày kiếp", "giver": "tong_dan", "desc": "Đan Hà Cốc giao bài cuối trước ngày kiếp: tự luyện 1 viên Sinh Cơ Đan — viên đan cứu mạng ngươi sẽ mang theo vào lôi kiếp. Luyện bằng tay mình, uống bằng mạng mình, Tần Dược Tử nói vậy.", "objectives": [{"type": "brew", "target": "sinh_co_dan", "need": 1}], "rewards": {"linhThach": 160, "tuVi": 50, "items": []}, "sectArc": true, "sect": "dan_ha", "arcChapter": 18},
    q_mon_van_thu_6: {"id": "q_mon_van_thu_6", "main": true, "title": "Lời chúc của rừng", "giver": "tong_thu", "desc": "Trước ngày độ kiếp, Vạn Thú Môn bắt ngươi vào rừng một mình gặp Hà Thiết Sơn: rừng có lời chúc riêng cho người sắp lên trời, và chỉ người được thú tin mới nghe được.", "objectives": [{"type": "talk", "target": "tho_san_ha", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "van_thu", "arcChapter": 18},
    q_mon_thien_phu_6: {"id": "q_mon_thien_phu_6", "main": true, "title": "Bùa trấn tâm", "giver": "tong_phu", "desc": "Thiên Phù Các cho ngươi một việc nhỏ mà nặng: tới Miếu Sơn Thần gặp Từ bà, xin bà một lá bùa trấn tâm viết tay để mang theo vào ngày độ kiếp. Bùa không chống được sét — nó chống lòng ngươi run.", "objectives": [{"type": "talk", "target": "giu_mieu", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "thien_phu", "arcChapter": 18},
    q_mon_cuu_cung_6: {"id": "q_mon_cuu_cung_6", "main": true, "title": "Trận nhỏ giữ làng", "giver": "tong_tran", "desc": "Ngày ngươi độ kiếp, ai giữ làng? Cửu Cung Trận Tông giao ngươi về làng gặp trưởng làng Trần Đức, cùng ông chốt một trận nhỏ giữ cổng Nam Môn trong ngày ngươi vắng mặt trên trời.", "objectives": [{"type": "talk", "target": "truong_lang", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 55, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 18},
    q_mon_kim_cang_6: {"id": "q_mon_kim_cang_6", "main": true, "title": "Buổi luyện thể cuối", "giver": "tong_the", "desc": "Kim Cang Môn không có quà cáp gì cho ngày độ kiếp ngoài một buổi luyện thể cuối: hạ 4 con Lợn Rừng ở bãi hoang như ngày mới nhập môn. Thân này chịu được lôi kiếp hay không, hôm nay biết.", "objectives": [{"type": "kill", "target": "lon_rung", "need": 4}], "rewards": {"linhThach": 160, "tuVi": 50, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 18},
    q_mon_ngu_doc_6: {"id": "q_mon_ngu_doc_6", "main": true, "title": "Thuốc giải cho ngày kiếp", "giver": "tong_doc", "desc": "Lôi kiếp đánh người cháy xém, độc khí đất bốc lên theo: Ngũ Độc Giáo giao ngươi hái 5 cây Thảo Dược chuẩn bị sẵn thuốc giải và thuốc trị thương cho ngày trở về.", "objectives": [{"type": "collect", "target": "thao_duoc", "need": 5}], "rewards": {"linhThach": 150, "tuVi": 50, "items": [{"id": "giai_doc_dan", "n": 1}]}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 18},
    q_mon_huyen_am_6: {"id": "q_mon_huyen_am_6", "main": true, "title": "Khúc đàn trước kiếp", "giver": "tong_am", "desc": "Đêm trước ngày độ kiếp, Huyền Âm Cung bắt ngươi về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc tĩnh tâm cho cả quán nghe. Người sắp bước lên trời phải nhớ tiếng người dưới đất.", "objectives": [{"type": "talk", "target": "chu_quan", "need": 1}], "rewards": {"linhThach": 150, "tuVi": 60, "items": [{"id": "hoi_xuan_dan", "n": 1}]}, "sectArc": true, "sect": "huyen_am", "arcChapter": 18},
    q_mon_thanh_phong_7: {"id": "q_mon_thanh_phong_7", "main": true, "title": "Ngự kiếm tuần sơn", "giver": "de_tu_phai", "desc": "Đệ tử Trúc Cơ đầu tiên của Thanh Phong trong vùng được giao việc xứng tầm: hạ 1 vương thú mang hình Sơn Quân — ở sào huyệt cũ rừng Thanh Sơn hoặc Gầm Sơn Hổ Vương ở Đại Sơn. Kiếm đã biết bay, người phải dám dùng.", "objectives": [{"type": "kill", "target": "son_quan", "need": 1}], "rewards": {"linhThach": 220, "tuVi": 90, "items": []}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 19},
    q_mon_huyen_phap_7: {"id": "q_mon_huyen_phap_7", "main": true, "title": "Pháp luân Trúc Cơ", "giver": "tong_phap", "desc": "Vừa kết đạo cơ, Huyền Pháp Tông bắt ngươi vận pháp luân mới một vòng trọn: thổ nạp tích 150 tu vi cho Ngũ Hành Luân trên ngực chuyển đủ năm màu không nghẽn một hệ nào.", "objectives": [{"type": "tuvi", "need": 150}], "rewards": {"linhThach": 200, "tuVi": 100, "items": []}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 19},
    q_mon_thien_cong_7: {"id": "q_mon_thien_cong_7", "main": true, "title": "Vật liệu cho khí Trúc Cơ", "giver": "tong_khi", "desc": "Phường muốn rèn món khí đầu tiên cho đệ tử Trúc Cơ của vùng: hạ 5 con Lợn Mông Sắt ở Đại Sơn lấy bờm và da tốt nhất. Mạc Thiết Tâm nói khí Trúc Cơ phải bắt đầu từ vật liệu thật tay.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 5}], "rewards": {"linhThach": 220, "tuVi": 80, "items": [{"id": "yeu_dan_2", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 19},
    q_mon_dan_ha_7: {"id": "q_mon_dan_ha_7", "main": true, "title": "Mẻ đan Trúc Cơ đầu tiên", "giver": "tong_dan", "desc": "Đan Hà Cốc giao mẻ đan đầu tiên ở thân phận Trúc Cơ: luyện 1 viên Phá Cảnh Đan — phương của người đã bái nhập Cốc. Từ nay đan ngươi luyện không chỉ cho làng nữa, mà cho cả vùng núi này.", "objectives": [{"type": "brew", "target": "pha_canh_dan", "need": 1}], "rewards": {"linhThach": 200, "tuVi": 90, "items": []}, "sectArc": true, "sect": "dan_ha", "arcChapter": 19},
    q_mon_van_thu_7: {"id": "q_mon_van_thu_7", "main": true, "title": "Đàn thú dưới chân mây", "giver": "tong_thu", "desc": "Người Trúc Cơ đầu tiên mà đàn thú rừng thừa nhận — Vạn Thú Môn muốn ghi lại ngày này: dẹp 6 con Sói Rừng dữ nhất cửa sơn, cho đàn thú non yên ổn ra uống nước suối lần đầu.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 6}], "rewards": {"linhThach": 210, "tuVi": 90, "items": []}, "sectArc": true, "sect": "van_thu", "arcChapter": 19},
    q_mon_thien_phu_7: {"id": "q_mon_thien_phu_7", "main": true, "title": "Bùa trấn sơn môn mới", "giver": "tong_phu", "desc": "Có đệ tử Trúc Cơ, Thiên Phù Các nâng cấp bùa trấn cho cả vùng: dẹp 5 con Rắn Lục Đuôi Đỏ ở khe suối Đại Sơn, lấy đường sạch để đoàn phù sư lên đặt bùa mới.", "objectives": [{"type": "kill", "target": "ran_luc", "need": 5}], "rewards": {"linhThach": 210, "tuVi": 90, "items": []}, "sectArc": true, "sect": "thien_phu", "arcChapter": 19},
    q_mon_cuu_cung_7: {"id": "q_mon_cuu_cung_7", "main": true, "title": "Đại trận cửu cung Trúc Cơ", "giver": "tong_tran", "desc": "Cửu Cung Trận Tông cho ngươi bày đại trận cửu cung đầu tiên ở thân phận Trúc Cơ: dẫn khí tích 150 tu vi khép trọn đại trận quanh bãi tuyển. Âu Dương Kỳ nói trận này sẽ giữ núi một mùa.", "objectives": [{"type": "tuvi", "need": 150}], "rewards": {"linhThach": 200, "tuVi": 100, "items": []}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 19},
    q_mon_kim_cang_7: {"id": "q_mon_kim_cang_7", "main": true, "title": "Thể tu Trúc Cơ đấu vương", "giver": "tong_the", "desc": "Kim Cang Môn ăn mừng đệ tử Trúc Cơ bằng cách của môn: đấu 1 vương thú mang hình Sơn Quân — Sơn Quân hồi sinh ở rừng Thanh Sơn hoặc Gầm Sơn Hổ Vương ở Đại Sơn. Thắng, môn khắc tên ngươi lên bia đá cổng môn.", "objectives": [{"type": "kill", "target": "son_quan", "need": 1}], "rewards": {"linhThach": 220, "tuVi": 90, "items": []}, "sectArc": true, "sect": "kim_cang", "arcChapter": 19},
    q_mon_ngu_doc_7: {"id": "q_mon_ngu_doc_7", "main": true, "title": "Độc hành Đại Sơn sâu", "giver": "tong_doc", "desc": "Ngũ Độc Giáo cử đệ tử Trúc Cơ đầu tiên của giáo vào sâu Đại Sơn hành độc: dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích, mở đường cho giáo thu nọc mùa mới.", "objectives": [{"type": "kill", "target": "ran_luc", "need": 6}], "rewards": {"linhThach": 210, "tuVi": 90, "items": []}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 19},
    q_mon_huyen_am_7: {"id": "q_mon_huyen_am_7", "main": true, "title": "Khúc đàn trên mây", "giver": "tong_am", "desc": "Huyền Âm Cung có lệ: đệ tử Trúc Cơ đầu tiên phải đàn một khúc trên mây cho cả vùng nghe. Ngươi tĩnh tọa dẫn khí tích 150 tu vi theo đàn, để tiếng đàn theo linh khí mà đi xa.", "objectives": [{"type": "tuvi", "need": 150}], "rewards": {"linhThach": 200, "tuVi": 100, "items": []}, "sectArc": true, "sect": "huyen_am", "arcChapter": 19},
    q_mon_thanh_phong_8: {"id": "q_mon_thanh_phong_8", "main": true, "title": "Thám đường Vân Hải", "giver": "de_tu_phai", "desc": "Đường tới Kim Đan bắt đầu ở Sơn Trung Vân Hải sau Chi Đỉnh. Thanh Phong giao ngươi thám đường trước: dẹp 6 con Sói Rừng ở Đại Sơn sâu, mở lối cho đệ tử các đời sau.", "objectives": [{"type": "kill", "target": "soi_rung", "need": 6}], "rewards": {"linhThach": 240, "tuVi": 110, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "thanh_phong", "arcChapter": 20},
    q_mon_huyen_phap_8: {"id": "q_mon_huyen_phap_8", "main": true, "title": "Ngưng pháp ở biển mây", "giver": "tong_phap", "desc": "Huyền Pháp Tông chỉ đường Kim Đan bằng một câu: pháp phải ngưng như sương đọng. Thổ nạp tích 200 tu vi ở thân phận Trúc Cơ, cho Liễu Ngưng Sương xem pháp cơ của ngươi đặc tới đâu.", "objectives": [{"type": "tuvi", "need": 200}], "rewards": {"linhThach": 220, "tuVi": 120, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "huyen_phap", "arcChapter": 20},
    q_mon_thien_cong_8: {"id": "q_mon_thien_cong_8", "main": true, "title": "Tìm vật liệu Vân Hải", "giver": "tong_khi", "desc": "Khí của Kim Đan cần vật liệu sinh trong biển mây. Thiên Công Phường giao ngươi vào Đại Sơn sâu hạ 5 con Lợn Mông Sắt, tiện đường ghi lại những mỏ vật liệu lạ cho phường.", "objectives": [{"type": "kill", "target": "lon_mong_sat", "need": 5}], "rewards": {"linhThach": 240, "tuVi": 100, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "thien_cong", "arcChapter": 20},
    q_mon_dan_ha_8: {"id": "q_mon_dan_ha_8", "main": true, "title": "Dược Vân Hải", "giver": "tong_dan", "desc": "Đan Hà Cốc bắt đầu tính phương đan Kim Đan từ bây giờ: hái 4 tai Linh Chi Thanh Sơn làm nền dược, còn phần dược Vân Hải, Cốc sẽ cử ngươi đi lấy khi đường mở.", "objectives": [{"type": "collect", "target": "linh_chi", "need": 4}], "rewards": {"linhThach": 220, "tuVi": 110, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "dan_ha", "arcChapter": 20},
    q_mon_van_thu_8: {"id": "q_mon_van_thu_8", "main": true, "title": "Thú Vân Hải", "giver": "tong_thu", "desc": "Đàn Khỉ Mặt Đỏ ở rừng già Đại Sơn đang chặn đường thú di cư lên Vân Hải. Dẹp 6 con khỉ đầu đàn mở đường cho đàn thú — Vạn Thú Môn nói Kim Đan cũng bắt đầu từ một việc lành.", "objectives": [{"type": "kill", "target": "khi_mat_do", "need": 6}], "rewards": {"linhThach": 230, "tuVi": 110, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "van_thu", "arcChapter": 20},
    q_mon_thien_phu_8: {"id": "q_mon_thien_phu_8", "main": true, "title": "Phù mở đường mây", "giver": "tong_phu", "desc": "Đường lên Vân Hải cần phù mở đường cắm dọc lối mòn: Thiên Phù Các giao ngươi dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích, dọn sạch lối cắm phù.", "objectives": [{"type": "kill", "target": "ran_luc", "need": 6}], "rewards": {"linhThach": 230, "tuVi": 110, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "thien_phu", "arcChapter": 20},
    q_mon_cuu_cung_8: {"id": "q_mon_cuu_cung_8", "main": true, "title": "Đo thế trận Vân Hải", "giver": "tong_tran", "desc": "Cửu Cung Trận Tông muốn đo thế trận của cả dãy Vân Hải trước khi ai lên đó kết đan: về bãi tuyển gặp Tạ Thanh Vân, nghe sứ giả kể địa thế Sơn Trung Vân Hải và Đoạn Long Lĩnh.", "objectives": [{"type": "talk", "target": "de_tu_phai", "need": 1}], "rewards": {"linhThach": 220, "tuVi": 120, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "cuu_cung", "arcChapter": 20},
    q_mon_kim_cang_8: {"id": "q_mon_kim_cang_8", "main": true, "title": "Gánh đá mở đường", "giver": "tong_the", "desc": "Đường lên Chi Đỉnh có đoạn sạt đá chắn lối. Kim Cang Môn giao ngươi dẹp 6 con Lợn Rừng quanh đoạn đường đó rồi cùng dân làng gánh đá mở lại đường cho người sau.", "objectives": [{"type": "kill", "target": "lon_rung", "need": 6}], "rewards": {"linhThach": 240, "tuVi": 100, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "kim_cang", "arcChapter": 20},
    q_mon_ngu_doc_8: {"id": "q_mon_ngu_doc_8", "main": true, "title": "Độc Vân Hải", "giver": "tong_doc", "desc": "Ngũ Độc Giáo nghe nói trên Vân Hải có loài hoa độc chưa từng ghi sổ. Trước hết, thu 5 cây Độc Tâm Hoa ở đất cũ làm mẫu đối chiếu, mang về cho Đường Tĩnh.", "objectives": [{"type": "collect", "target": "doc_tam_hoa", "need": 5}], "rewards": {"linhThach": 220, "tuVi": 110, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "ngu_doc", "arcChapter": 20},
    q_mon_huyen_am_8: {"id": "q_mon_huyen_am_8", "main": true, "title": "Đàn vọng Vân Hải", "giver": "tong_am", "desc": "Trước chuyến đi xa nhất đời tu, Huyền Âm Cung bắt ngươi về làng gặp trưởng làng Trần Đức, đàn cho làng nghe một khúc và hứa ngày về. Kim Đan ở trên mây, gốc vẫn ở dưới đất.", "objectives": [{"type": "talk", "target": "truong_lang", "need": 1}], "rewards": {"linhThach": 220, "tuVi": 120, "items": [{"id": "long_tien_thao", "n": 1}]}, "sectArc": true, "sect": "huyen_am", "arcChapter": 20},
  };
  // ---------- Sự kiện "Thú dữ tấn công làng Thanh Khê" (q_chinh_5) ----------
  // State thuần trong flags.event: { active, wave (1..3), done }.
  // Đợt sau chỉ mở khi đợt trước chết hết; thua (HP 0) -> reset về đợt 1.
  var EVENT_WAVES = [
    ['soi_con', 'soi_con', 'soi_con'],
    ['soi_con', 'soi_con', 'lon_rung', 'lon_rung'],
    ['soi_rung', 'soi_rung', 'soi_rung', 'lon_mong_sat']
  ];
  function startBeastEvent(flags) {
    flags.event = { active: true, wave: 1, done: false };
    return flags.event;
  }
  function beastWave(flags) {
    var ev = flags && flags.event;
    if (!ev || !ev.active || ev.done) return null;
    return EVENT_WAVES[ev.wave - 1] || null;
  }
  // Gọi khi toàn bộ quái của đợt hiện tại đã chết. Trả về đợt vừa mở (2/3)
  // hoặc 'done' khi dọn sạch đợt 3, hoặc null nếu sự kiện không chạy.
  function advanceBeastWave(flags) {
    var ev = flags && flags.event;
    if (!ev || !ev.active || ev.done) return null;
    if (ev.wave < EVENT_WAVES.length) { ev.wave += 1; return ev.wave; }
    ev.done = true; ev.active = false;
    return 'done';
  }
  function resetBeastEvent(flags) {
    if (flags && flags.event && !flags.event.done) flags.event = { active: true, wave: 1, done: false };
    return flags ? flags.event : null;
  }
  // Boss Sơn Quân chỉ tồn tại khi q_chinh_7 đang được làm (chưa trả).
  function bossShouldSpawn(qs) {
    return !!(qs && qs.accepted && qs.accepted.q_chinh_7) && !isTurnedIn(qs, 'q_chinh_7');
  }
  function newQuestState() { return { accepted: {}, turnedIn: [] }; }
  function isTurnedIn(qs, qid) { return qs.turnedIn.indexOf(qid) >= 0; }
  function availableQuests(qs) {
    return Object.keys(QUESTS).filter(function (qid) {
      var q = QUESTS[qid];
      if (q.sectQuest) return false; // chuỗi ngự kiếm: cổng theo flags (Trúc Cơ + bái sư), js/flight.js quản
      if (q.tkcQuest) return false; // chuỗi Tàng Kinh Các: cổng bái nhập, js/library.js quản
      if (q.knQuest) return false; // chuỗi Kết Nghĩa: cổng chiêu mộ + hảo cảm 40, js/sworn.js quản
      if (q.tietQuest) return false; // việc tiết: chỉ mở trong đúng tháng của tiết, js/season-tide.js quản
      if (q.sectArc) return false; // arc chuong 13-20: js/sect-arc.js quan (chi mo cho tong da bai nhap)
      if (q.festQuest) return false; // chuỗi việc lễ: chỉ mở trong cửa sổ lễ, js/wardrobe.js quản
      if (q.riftArc) return false; // arc Vết Nứt Hư Không: cổng Trúc Cơ + chương 18, js/rift-events.js quản
      if (q.thien4) return false; // Thiên 4 ch.25-27: cổng Trúc Cơ + arc vết nứt + bái nhập, js/thien4.js quản
      if (q.thien5) return false; // Thiên 5 ch.28-30: cổng Trúc Cơ + đã xong Thiên 4 + bái nhập, js/thien5.js quản
      if (qs.accepted[qid] || isTurnedIn(qs, qid)) return false;
      if (q.requires && !isTurnedIn(qs, q.requires)) return false;
      return true;
    }).map(function (qid) { return QUESTS[qid]; });
  }
  function acceptQuest(qs, qid) {
    if (qs.accepted[qid] || isTurnedIn(qs, qid)) return { ok: false };
    qs.accepted[qid] = { progress: 0, done: false };
    return { ok: true };
  }
  function questProgress(qs, qid) { return qs.accepted[qid] || null; }
  function recordEvent(qs, ch, ev) {
    var changed = [];
    Object.keys(qs.accepted).forEach(function (qid) {
      var st = qs.accepted[qid];
      if (st.done) return;
      var q = QUESTS[qid], ob = q.objectives[0];
      var hit = false;
      if (ob.type === 'talk' && ev.type === 'talk' && ev.target === ob.target) hit = true;
      if (ob.type === 'well' && ev.type === 'well') hit = true;
      if (ob.type === 'tuvi' && ev.type === 'tuvi') { st.progress += ev.n; hit = true; }
      if (ob.type === 'kill' && ev.type === 'kill' && ev.target === ob.target) { st.progress += 1; hit = true; }
      if (ob.type === 'collect' && ev.type === 'collect' && ev.target === ob.target) { st.progress += 1; hit = true; }
      if (ob.type === 'breakthrough' && ev.type === 'breakthrough') { st.progress += 1; hit = true; }
      if (ob.type === 'brew' && ev.type === 'brew' && ev.target === ob.target) { st.progress += 1; hit = true; }
      if (hit) {
        if (ob.type !== 'tuvi' && ob.type !== 'kill' && ob.type !== 'collect' && ob.type !== 'breakthrough' && ob.type !== 'brew') st.progress = 1;
        if (st.progress >= ob.need) { st.progress = ob.need; st.done = true; }
        changed.push(qid);
      }
    });
    return changed;
  }
  function turnInQuest(qs, ch, qid) {
    var st = qs.accepted[qid];
    if (!st || !st.done || isTurnedIn(qs, qid)) return { ok: false };
    var q = QUESTS[qid];
    ch.linhThach += guardGain('quest', q.rewards.linhThach); // chống hack: trần thưởng NV
    if (q.rewards.tuVi) gainTuVi(ch, guardGain('questTuVi', q.rewards.tuVi));
    q.rewards.items.forEach(function (it) { addItem(ch, it.id, it.n); });
    delete qs.accepted[qid];
    qs.turnedIn.push(qid);
    return { ok: true, rewards: q.rewards };
  }
  function npcMarker(qs, npcId) {
    var turnIn = false, avail = false;
    Object.keys(qs.accepted).forEach(function (qid) {
      if (QUESTS[qid].giver === npcId && qs.accepted[qid].done) turnIn = true;
    });
    availableQuests(qs).forEach(function (q) { if (q.giver === npcId) avail = true; });
    if (turnIn) return '?';
    if (avail) return '!';
    return null;
  }
  // ---------- Lưu/tải ----------
  // TIỀN TỆ DUY NHẤT của game là LINH THẠCH (trường ch.linhThach) — lệnh
  // Bui 21:04 2026-10-29, bỏ hẳn tiền cũ. Save cũ lưu tiền ở trường ch.coins:
  // khi nạp, số đó thành Linh Thạch nguyên vẹn (tỉ lệ 1:1, giữ nguyên con
  // số và cân bằng kinh tế). Hàm này idempotent: đã có linhThach thì giữ
  // nguyên, chỉ dọn trường cũ — nạp lại bao nhiêu lần cũng không nhân đôi.
  function migrateCurrency(ch) {
    if (!ch) return ch;
    if (typeof ch.linhThach !== 'number' || isNaN(ch.linhThach)) {
      ch.linhThach = (typeof ch.coins === 'number' && !isNaN(ch.coins)) ? ch.coins : 0;
    }
    if ('coins' in ch) delete ch.coins;
    return ch;
  }
  function serialize(account, ch, qs, flags) {
    return JSON.stringify({ account: account, character: ch, quests: qs, flags: flags || {} });
  }
  function deserialize(s) {
    var data = null;
    try { data = JSON.parse(s); } catch (e) { return null; }
    if (data && data.character) migrateCurrency(data.character);
    return data;
  }
  var api = {
    sha256Hex: sha256Hex, hashPassword: hashPassword, validUsername: validUsername,
    registerAccount: registerAccount, loginAccount: loginAccount,
    ORIGINS: ORIGINS, ROOTS: ROOTS, drawRoot: drawRoot, TIERS: TIERS,
    createCharacter: createCharacter, rootOf: rootOf, atkOf: atkOf, effAtk: effAtk, gainTuVi: gainTuVi,
    BASE_CRIT_DMG: BASE_CRIT_DMG, gearBlocks: gearBlocks, statTotals: statTotals,
    effMaxHp: effMaxHp, effDef: effDef, applyOffense: applyOffense,
    canBreakthrough: canBreakthrough, doBreakthrough: doBreakthrough,
    BREAK_RULES: BREAK_RULES, BREAK_PLACES: BREAK_PLACES, BREAK_GROWTH: BREAK_GROWTH,
    syncTier: syncTier, breakPillDef: breakPillDef, bestBreakPill: bestBreakPill,
    breakthroughInfo: breakthroughInfo, consumeItem: consumeItem, countItem: countItem,
    ITEMS: ITEMS, MONSTERS: MONSTERS, addItem: addItem, useItem: useItem,
    combatRound: combatRound, newMonster: newMonster,
    ltEV: ltEV, rollLt: rollLt, ELITE_LT_MULT: ELITE_LT_MULT,
    EVENT_WAVES: EVENT_WAVES, startBeastEvent: startBeastEvent, beastWave: beastWave,
    advanceBeastWave: advanceBeastWave, resetBeastEvent: resetBeastEvent, bossShouldSpawn: bossShouldSpawn,
    QUESTS: QUESTS, newQuestState: newQuestState, isTurnedIn: isTurnedIn,
    availableQuests: availableQuests, acceptQuest: acceptQuest, questProgress: questProgress,
    recordEvent: recordEvent, turnInQuest: turnInQuest, npcMarker: npcMarker,
    serialize: serialize, deserialize: deserialize, migrateCurrency: migrateCurrency
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_LOGIC = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_LOGIC = api;
})();
