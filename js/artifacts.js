// Phàm Nhân Tu Đạo — hệ thống PHÁP KHÍ + BẢO VẬT (dữ liệu + luật thuần + vẽ,
// test bằng Node). Pháp khí/bảo vật là dòng trang bị RIÊNG, khác vũ khí:
// vũ khí (js/weapons.js) cộng CÔNG, pháp bảo cho HIỆU ỨNG ĐẶC BIỆT + chỉ số phụ.
// Thiết kế:
// - Mỗi món là một entry { id, count: 1, uid, a: 1 } trong ch.inventory
//   (không cộng dồn), đeo ở 2 Ô PHÁP BẢO riêng ch.artSlots = [uid, uid]
//   (không giành ô vũ khí ch.equipUid). Save cũ không có các trường này vẫn
//   nạp được nhờ ensureArtifacts() khởi tạo lười.
// - Thang phẩm dùng CHUNG với vũ khí: Phàm -> Linh -> Huyền -> Địa -> Thiên.
// - KHỐI CHỈ SỐ dùng CHUNG với vũ khí (js/weapons.js), do Logic.statTotals
//   (js/logic.js) cộng từ equippedDefs() của module này + equippedDef của
//   vũ khí:
//     stats: { hp, def, crit, critDmg, lifesteal, ll, llRegen, speed,
//              elem: { kim|moc|thuy|hoa|tho|phong|loi|bang: % } }
//   hp/def/ll cộng thẳng (điểm); llRegen cộng thẳng (điểm linh lực/giây);
//   crit/critDmg/lifesteal/speed/elem là PHẦN TRĂM. Các khóa chung
//   (hp/def/crit/.../ll/llRegen/speed/elem) trong totalStats() của module
//   này KHỚP từng số với Logic.statTotals (test mục 22 kiểm chứng).
//   effMaxHp/effDef/applyOffense (logic.js), maxLinhLuc/regenRate
//   (skills.js), tốc độ chạy + panel nhân vật (game.js).
// - Hiệu ứng riêng của pháp khí (fx + ký danh Thiên phẩm ở trường
//   `signature`) do CHÍNH module này định nghĩa số liệu và game.js chạy
//   (trói/khiên/hồi sinh/sét võng...) — Logic chỉ cộng khối stats. Các % hỗ
//   trợ riêng (rơi đồ, Linh Thạch, tu vi, hồi máu thuốc, giảm sát thương...) nằm ở
//   totalStats() của module này, logic.js/game.js đọc trực tiếp.
// - Cộng dồn: chỉ số phụ cộng thẳng; % hiệu ứng hỗ trợ (hồi linh lực, rơi
//   đồ, tu vi...) cộng rồi CHẶN TRẦN (xem CAPS); giảm sát thương từ pháp bảo
//   trần 35%; Túi Trữ Vật lấy mức lớn nhất chứ không cộng; hai món cùng id
//   không đeo cùng lúc; trói: chỉ món trói mạnh nhất được lăn tỉ lệ.
// - Icon: 3 mức như mọi hệ hình khác — Cao/Trung bình dùng ẢNH AI riêng
//   từng món (assets/artifacts-ai, assets/artifacts-md; id 'art_<id>' giữ
//   nguyên), Thấp giữ lưới pixel 16x16 theo hình dạng + bảng màu theo phẩm.
(function () {
  'use strict';
  // ---------- Dòng + phẩm (khớp js/weapons.js) ----------
  var KINDS = {
    phap: { name: 'Pháp khí' },
    bao: { name: 'Bảo vật' }
  };
  var GRADES = {
    pham: { name: 'Phàm phẩm', rank: 0, glow: null },
    linh: { name: 'Linh phẩm', rank: 1, glow: '#7fe8d6' },
    huyen: { name: 'Huyền phẩm', rank: 2, glow: '#cfa6ff' },
    dia: { name: 'Địa phẩm', rank: 3, glow: '#ffb84e' },
    thien: { name: 'Thiên phẩm', rank: 4, glow: '#ffe98a' }
  };
  var GRADE_PALETTES = {
    pham: { b: '#9aa0a8', B: '#dde1e6', d: '#5a5f66', g: '#8b5a2b', o: '#7a7f87' },
    linh: { b: '#a8c8d8', B: '#eefaff', d: '#527a94', g: '#c9a44e', o: '#3fd6c0' },
    huyen: { b: '#9a7fd0', B: '#e2d6ff', d: '#463270', g: '#8a6fd0', o: '#cfa6ff' },
    dia: { b: '#d8a84e', B: '#ffeda8', d: '#7a5220', g: '#f2c14e', o: '#ff8a3c' },
    thien: { b: '#ffe98a', B: '#fffbe8', d: '#a87f2e', g: '#fff2b0', o: '#7fe8ff' }
  };
  var COMMON_PALETTE = { h: '#6b4a2a', H: '#3a2a1a', s: '#e8e4da', f: '#c0392b',
    j: '#2ea88f', J: '#8ff5df', y: '#f2c14e', w: '#fffdf5', k: '#20242c' };
  function paletteFor(grade) {
    var p = {}, k;
    for (k in COMMON_PALETTE) p[k] = COMMON_PALETTE[k];
    var g = GRADE_PALETTES[grade] || GRADE_PALETTES.pham;
    for (k in g) p[k] = g[k];
    return p;
  }
  var ELEM_NAMES = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ', phong: 'Phong', loi: 'Lôi', bang: 'Băng' };
  var SLOT_COUNT = 2;
  // ---------- Danh mục: 8 pháp khí + 8 bảo vật ----------
  // fx: hiệu ứng chính. Các trường % dùng chung tên với totalStats:
  // llRegenPct, dmgRedPct, speedPct, dropPct, ltPct, tuViPct, healPct.
  // fx.kind đặc biệt: bind / execute / stun_react / flysword / vs_boss /
  // net / shield_orb / storage. active: kích hoạt chủ động (phím 6/7).
  var ARTIFACTS = {
    // ===== PHÁP KHÍ (chủ động / chiến đấu) =====
    ho_lo_thu_yeu: { id: 'ho_lo_thu_yeu', kind: 'phap', shape: 'holo', grade: 'pham', name: 'Hồ Lô Thu Yêu', reqTier: 0, price: 120, value: 48,
      fx: { kind: 'bind', chance: 0.12, dur: 1.0, bossDur: 0, weakOnly: true },
      active: { name: 'Thu Yêu', mana: 15, cd: 12, kind: 'bind_nearest', range: 170, dur: 2.5, bossDur: 1.0 },
      fxText: 'Đòn đánh có 12% trói quái thường 1 giây. Kích hoạt Thu Yêu (15 linh lực): trói quái gần nhất 2,5 giây (boss 1 giây).',
      desc: 'Hồ lô đồng của đại phu Lý lão, miệng hồ lô khắc phù thu yêu. Quái yếu lỡ chui vào thì chỉ còn nước nằm yên.' },
    kinh_chieu_yeu: { id: 'kinh_chieu_yeu', kind: 'phap', shape: 'kinh', grade: 'linh', name: 'Kính Chiếu Yêu', reqTier: 1, price: 0, value: 130,
      fx: { kind: 'execute', pct: 25 },
      active: { name: 'Soi Yêu', mana: 10, cd: 10, kind: 'mark', range: 180, dur: 4, pct: 30 },
      fxText: 'Quái dưới 30% Máu nhận thêm 25% sát thương. Kích hoạt Soi Yêu (10 linh lực): quái quanh bạn bị soi, nhận thêm 30% sát thương trong 4 giây.',
      desc: 'Mặt kính đồng soi rõ yếu huyệt của yêu vật. Kẻ đã trọng thương mà bị kính chiếu vào thì khó lòng thoát.' },
    chuong_tran_hon: { id: 'chuong_tran_hon', kind: 'phap', shape: 'chuong', grade: 'huyen', name: 'Chuông Trấn Hồn', reqTier: 2, price: 0, value: 240,
      fx: { kind: 'stun_react', chance: 0.20, dur: 0.8, radius: 70 },
      stats: { def: 2 },
      fxText: 'Khi bị đánh, 20% chuông tự ngân: quái quanh bạn choáng 0,8 giây.',
      desc: 'Chuông đồng của miếu Sơn Thần, tiếng ngân trầm trấn hồn an phách, thú dữ nghe phải cũng chùn chân.' },
    day_troi_tien: { id: 'day_troi_tien', kind: 'phap', shape: 'day', grade: 'huyen', name: 'Dây Trói Tiên', reqTier: 2, price: 0, value: 250,
      fx: { kind: 'bind', chance: 0.18, dur: 1.6, bossDur: 0.6 },
      stats: { speed: 5 },
      fxText: 'Đòn đánh có 18% phóng dây trói quái 1,6 giây (boss cũng bị trói 0,6 giây).',
      desc: 'Dây bện từ gân thú ngâm linh dịch, gặp mục tiêu tự thắt nút. Tiên còn trói được, huống hồ lợn rừng.' },

    phi_kiem_bao: { id: 'phi_kiem_bao', kind: 'phap', shape: 'phi_kiem', grade: 'dia', name: 'Phi Kiếm Bảo', reqTier: 3, price: 0, value: 520,
      fx: { kind: 'flysword', pct: 40, interval: 1.2, range: 150 },
      stats: { crit: 6, critDmg: 30 },
      fxText: 'Một thanh phi kiếm lơ lửng hộ thân, tự đánh quái gần nhất mỗi 1,2 giây với 40% công của bạn.',
      desc: 'Phi kiếm không cán, đậu trên vai người tu như chim quen chủ. Khác Ngự Kiếm Thuật ở chỗ nó không tốn linh lực — nó là pháp khí có chủ.' },
    an_tran_son: { id: 'an_tran_son', kind: 'phap', shape: 'an', grade: 'dia', name: 'Ấn Trấn Sơn', reqTier: 3, price: 0, value: 560,
      fx: { kind: 'vs_boss', pct: 18, llOnKill: 4 },
      stats: { hp: 30, lifesteal: 5 },
      fxText: 'Thêm 18% sát thương lên boss và quái tinh anh. Hạ một quái hồi 4 linh lực.',
      desc: 'Ấn đồng nặng như đè núi, mặt ấn khắc hai chữ Trấn Sơn. Sơn Quân thấy ấn này cũng phải dè chừng ba phần.' },

    thien_la_vong: { id: 'thien_la_vong', kind: 'phap', shape: 'vong', grade: 'thien', name: 'Thiên La Địa Võng', reqTier: 3, price: 0, value: 1150,
      fx: { kind: 'net', chance: 0.25, dur: 1.2, radius: 95 },
      stats: { crit: 8, ll: 20, elem: { loi: 20 } },
      signature: { name: 'Lôi Võng Thiên La', kind: 'net_zap', pct: 30 },
      fxText: 'Đòn đánh có 25% giăng võng trời: trói MỌI quái trong vùng 1,2 giây. Ký danh Lôi Võng Thiên La: võng trói từ 2 quái trở lên thì sét đánh mỗi con 30% công.',
      desc: 'Tấm võng dệt bằng tơ trời và chỉ sét, tung ra là phủ kín một vùng. Kẻ sa vào võng còn bị thiên lôi hỏi thăm thêm một lượt.' },
    dinh_hai_than_chau: { id: 'dinh_hai_than_chau', kind: 'phap', shape: 'chau', grade: 'thien', name: 'Định Hải Thần Châu', reqTier: 3, price: 0, value: 1200,
      fx: { kind: 'shield_orb', cd: 6 },
      stats: { hp: 50, def: 4, llRegen: 1.5 },
      signature: { name: 'Thủy Triều Phá Võng', kind: 'shield_wave', slowPct: 50, slowDur: 1.5, radius: 85 },
      fxText: 'Mỗi 6 giây tự tụ một khiên nước chắn trọn 1 đòn. Ký danh Thủy Triều Phá Võng: khiên vỡ thì sóng nước làm chậm quái xung quanh 50% trong 1,5 giây.',
      desc: 'Viên châu sinh từ suối linh sâu nhất của Thanh Sơn, nước trong châu không bao giờ cạn. Một châu định được cả mặt hồ đang dậy sóng.' },
    // ===== BẢO VẬT (bị động / hỗ trợ) =====
    ngoc_tu_linh: { id: 'ngoc_tu_linh', kind: 'bao', shape: 'ngoc', grade: 'pham', name: 'Ngọc Tụ Linh', reqTier: 0, price: 150, value: 60,
      fx: { llRegenPct: 40 },
      fxText: 'Tốc độ hồi linh lực tăng 40%.',
      desc: 'Miếng ngọc bích tụ linh khí quanh thân người đeo. Tu sĩ nghèo ngày xưa chỉ ước có một miếng thế này.' },
    ho_tam_boi: { id: 'ho_tam_boi', kind: 'bao', shape: 'boi', grade: 'linh', name: 'Hộ Tâm Bội', reqTier: 1, price: 340, value: 88,
      fx: { dmgRedPct: 10 },
      fxText: 'Giảm 10% mọi sát thương nhận vào.',
      desc: 'Bội ngọc đeo trước ngực, ấm lên mỗi khi chủ nhân gặp nguy — nó đỡ đòn bằng chính linh khí tích trong ngọc.' },
    tui_tru_vat: { id: 'tui_tru_vat', kind: 'bao', shape: 'tui', grade: 'linh', name: 'Túi Trữ Vật', reqTier: 1, price: 460, value: 120,
      fx: { kind: 'storage', slots: 10 },
      fxText: 'Túi đồ thêm 10 ô chứa. Đeo hai túi cũng chỉ tính một (không cộng dồn).',
      desc: 'Túi vải nhỏ bằng bàn tay mà trong có khoang riêng chứa đồ như một rương lớn. Vật không thể thiếu của người tu hành.' },
    than_hanh_boi: { id: 'than_hanh_boi', kind: 'bao', shape: 'boi', grade: 'huyen', name: 'Thần Hành Bội', reqTier: 2, price: 0, value: 230,
      fx: {},
      stats: { speed: 10 },
      fxText: 'Tốc độ di chuyển tăng 10%.',
      desc: 'Bội khắc phù thần hành, đeo vào bước chân nhẹ như có gió đẩy sau lưng.' },
    tu_bao_bon: { id: 'tu_bao_bon', kind: 'bao', shape: 'bon', grade: 'huyen', name: 'Tụ Bảo Bồn', reqTier: 2, price: 0, value: 260,
      fx: { dropPct: 25, ltPct: 20 },
      stats: { ll: 15 },
      fxText: 'Tỉ lệ rơi vật phẩm tăng 25%, Linh Thạch rơi từ quái tăng 20% (không áp cho rơi vũ khí/pháp bảo).',
      desc: 'Chậu đồng thu nhỏ của nhà buôn Mã Vạn Lai, đặt đâu là tụ tài về đó. Bản thu nhỏ này chỉ đủ tụ vận may rơi đồ.' },
    dang_tu_khi: { id: 'dang_tu_khi', kind: 'bao', shape: 'dang', grade: 'dia', name: 'Đăng Tụ Khí', reqTier: 3, price: 0, value: 540,
      fx: { tuViPct: 20 },
      stats: { llRegen: 1, ll: 25 },
      fxText: 'Tu vi nhận được tăng 20% (thổ nạp, thưởng nhiệm vụ đều hưởng).',
      desc: 'Đèn dầu không bao giờ tắt, lửa đèn hút linh khí trời đất tụ về một điểm cho người ngồi cạnh tu luyện.' },
    dan_dinh_ngoc: { id: 'dan_dinh_ngoc', kind: 'bao', shape: 'dinh', grade: 'dia', name: 'Đan Đỉnh Ngọc', reqTier: 3, price: 0, value: 560,
      fx: { healPct: 50 },
      stats: { hp: 40, def: 2 },
      fxText: 'Đan dược và thức ăn hồi máu hiệu quả thêm 50%.',
      desc: 'Đỉnh ngọc thu nhỏ của Đan Hà Cốc, hơi thuốc quanh năm thấm vào người đeo — thuốc thường vào tay cũng thành thuốc tốt.' },
    cuu_chuyen_linh_chau: { id: 'cuu_chuyen_linh_chau', kind: 'bao', shape: 'hat', grade: 'thien', name: 'Cửu Chuyển Linh Châu', reqTier: 3, price: 0, value: 1250,
      fx: { llRegenPct: 60, tuViPct: 15 },
      stats: { hp: 60, ll: 30, crit: 5 },
      signature: { name: 'Cửu Chuyển Hồi Sinh', kind: 'revive', hpPct: 30, threshold: 25, cd: 60 },
      fxText: 'Hồi linh lực tăng 60%, tu vi nhận tăng 15%. Ký danh Cửu Chuyển Hồi Sinh: khi Máu xuống dưới 25%, tự hồi 30% Máu tối đa (mỗi 60 giây một lần).',
      desc: 'Chuỗi chín viên linh châu chuyển khí không ngừng, là bảo vật trấn thân mà tu sĩ Luyện Khí chỉ dám mơ.' }
  };
  Object.keys(ARTIFACTS).forEach(function (id) { ARTIFACTS[id].icon = 'art_' + id; });
  // Tiệm pháp khí của đại phu Lý lão: bán các món price > 0.
  var SHOP = Object.keys(ARTIFACTS).filter(function (id) { return ARTIFACTS[id].price > 0; });
  // Chế tạo tại Lý lão (nguyên liệu sẵn có trong game, fee = công chế bằng Linh Thạch).
  var RECIPES = {
    chuong_tran_hon: { fee: 80, mats: { da_soi: 4, linh_chi: 1 } },
    than_hanh_boi: { fee: 70, mats: { long_ga: 6, da_soi: 2 } },
    tu_bao_bon: { fee: 120, mats: { linh_chi: 2, da_soi: 3 } },
    dang_tu_khi: { fee: 160, mats: { linh_chi: 3, thao_duoc: 5 } }
  };
  // ---------- Bảng rơi pháp bảo ----------
  // Quái thường: tối đa 1 món/lần như vũ khí. Tinh anh: bảng riêng, 1 món.
  // Boss Sơn Quân: lăn cả bảng (nhiều món), có 3 món Thiên phẩm ký danh.
  var DROPS = {
    ga_rung: [], tho_hoang: [],
    soi_con: [{ id: 'ho_lo_thu_yeu', chance: 0.02 }],
    lon_rung: [{ id: 'ho_tam_boi', chance: 0.02 }],
    soi_rung: [{ id: 'kinh_chieu_yeu', chance: 0.03 }, { id: 'than_hanh_boi', chance: 0.02 }],
    lon_mong_sat: [{ id: 'day_troi_tien', chance: 0.03 }, { id: 'tu_bao_bon', chance: 0.02 }],
    ran_luc: [{ id: 'kinh_chieu_yeu', chance: 0.03 }, { id: 'chuong_tran_hon', chance: 0.015 }],
    khi_mat_do: [{ id: 'chuong_tran_hon', chance: 0.03 }, { id: 'tui_tru_vat', chance: 0.02 }]
  };
  var ELITE_DROPS = [
    { id: 'tui_tru_vat', chance: 0.12 }, { id: 'an_tran_son', chance: 0.10 },
    { id: 'phi_kiem_bao', chance: 0.08 }, { id: 'dang_tu_khi', chance: 0.08 },
    { id: 'dan_dinh_ngoc', chance: 0.08 }
  ];
  var BOSS_DROPS = [
    { id: 'an_tran_son', chance: 0.5 }, { id: 'thien_la_vong', chance: 0.25 },
    { id: 'dinh_hai_than_chau', chance: 0.2 }, { id: 'cuu_chuyen_linh_chau', chance: 0.15 }
  ];
  // Quái tinh anh: game.js lăn tỉ lệ khi dựng quái các loài này (không áp cho
  // boss / quái sự kiện): HP x1,8, công +4, Linh Thạch x5 (khớp ELITE_LT_MULT trong js/logic.js, test ECO khóa = 5), rơi theo ELITE_DROPS.
  var ELITE_TYPES = ['soi_rung', 'lon_mong_sat', 'khi_mat_do'];
  var ELITE_CHANCE = 0.08, ELITE_HP_MULT = 1.8, ELITE_ATK_ADD = 4;
  // Trần cộng dồn các % hỗ trợ (tránh đeo 2 món phá cân bằng).
  var CAPS = { dmgRed: 35, llRegen: 12, regenPct: 150, dropPct: 60, ltPct: 60, tuViPct: 40, speed: 40 };
  // ---------- Trạng thái trên nhân vật ----------
  function isArtifactId(id) { return !!ARTIFACTS[id]; }
  function artifactDef(id) { return ARTIFACTS[id] || null; }
  function isArtifactEntry(it) { return !!(it && it.a && ARTIFACTS[it.id]); }
  function ensureArtState(ch) {
    if (!ch.art || typeof ch.art !== 'object') ch.art = {};
    if (typeof ch.art.shield !== 'boolean') ch.art.shield = false;
    if (typeof ch.art.shieldCd !== 'number' || isNaN(ch.art.shieldCd)) ch.art.shieldCd = 0;
    if (typeof ch.art.revCd !== 'number' || isNaN(ch.art.revCd)) ch.art.revCd = 0;
    if (!ch.acd || typeof ch.acd !== 'object') ch.acd = {};
    return ch;
  }
  function ensureArtifacts(ch) {
    if (!ch) return ch;
    if (!Array.isArray(ch.inventory)) ch.inventory = [];
    if (typeof ch.aseq !== 'number' || isNaN(ch.aseq)) ch.aseq = 0;
    if (!Array.isArray(ch.artSlots)) ch.artSlots = [null, null];
    while (ch.artSlots.length < SLOT_COUNT) ch.artSlots.push(null);
    ch.artSlots.length = SLOT_COUNT;
    for (var i = 0; i < SLOT_COUNT; i++) {
      if (ch.artSlots[i] !== null && !findEntry(ch, ch.artSlots[i])) ch.artSlots[i] = null;
    }
    ensureArtState(ch);
    // Tháo món +HP thì HP hiện tại không được vượt trần mới.
    var cap = ch.maxHp + totalStats(ch).hp;
    if (ch.hp > cap) ch.hp = cap;
    return ch;
  }
  function addArtifact(ch, defId) {
    if (!ARTIFACTS[defId]) return null;
    if (typeof ch.aseq !== 'number' || isNaN(ch.aseq)) ch.aseq = 0;
    ch.aseq += 1;
    var entry = { id: defId, count: 1, uid: ch.aseq, a: 1 };
    ch.inventory.push(entry);
    return entry;
  }
  function findEntry(ch, uid) {
    if (!ch || !Array.isArray(ch.inventory)) return null;
    for (var i = 0; i < ch.inventory.length; i++)
      if (isArtifactEntry(ch.inventory[i]) && ch.inventory[i].uid === uid) return ch.inventory[i];
    return null;
  }
  function artifactEntries(ch) {
    return (ch && Array.isArray(ch.inventory)) ? ch.inventory.filter(isArtifactEntry) : [];
  }
  function slotOf(ch, uid) {
    if (!ch || !Array.isArray(ch.artSlots)) return -1;
    for (var i = 0; i < SLOT_COUNT; i++) if (ch.artSlots[i] === uid) return i;
    return -1;
  }
  function equippedEntries(ch) {
    if (!ch || !Array.isArray(ch.artSlots)) return [];
    var out = [];
    for (var i = 0; i < SLOT_COUNT; i++) {
      var e = ch.artSlots[i] !== null ? findEntry(ch, ch.artSlots[i]) : null;
      if (e) out.push(e);
    }
    return out;
  }
  function equippedDefs(ch) {
    return equippedEntries(ch).map(function (e) { return ARTIFACTS[e.id]; });
  }
  function equippedDefAt(ch, slot) {
    if (!ch || !Array.isArray(ch.artSlots) || ch.artSlots[slot] === null || typeof ch.artSlots[slot] === 'undefined') return null;
    var e = findEntry(ch, ch.artSlots[slot]);
    return e ? ARTIFACTS[e.id] : null;
  }
  function hasEquipped(ch, defId) {
    return equippedDefs(ch).some(function (d) { return d.id === defId; });
  }
  function canEquip(ch, uid) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = ARTIFACTS[e.id];
    if ((ch.tier || 0) < def.reqTier) return { ok: false, reason: 'tier', def: def };
    if (slotOf(ch, uid) >= 0) return { ok: false, reason: 'equipped', def: def };
    if (equippedDefs(ch).some(function (d) { return d.id === def.id; }))
      return { ok: false, reason: 'dup', def: def };
    for (var i = 0; i < SLOT_COUNT; i++) if (ch.artSlots[i] === null) return { ok: true, def: def, slot: i };
    return { ok: false, reason: 'full', def: def };
  }
  function equip(ch, uid) {
    ensureArtifacts(ch);
    var chk = canEquip(ch, uid);
    if (!chk.ok) return chk;
    ch.artSlots[chk.slot] = uid;
    return { ok: true, def: chk.def, slot: chk.slot };
  }
  function unequip(ch, uid) {
    var s = slotOf(ch, uid);
    if (s < 0) return { ok: false, reason: 'not_equipped' };
    var e = findEntry(ch, uid);
    ch.artSlots[s] = null;
    if (e && ARTIFACTS[e.id].id === 'dinh_hai_than_chau') { ensureArtState(ch); ch.art.shield = false; }
    ensureArtifacts(ch); // kẹp lại HP theo trần mới
    return { ok: true, def: e ? ARTIFACTS[e.id] : null, slot: s };
  }
  // ---------- Tổng hợp chỉ số (hàm tổng dùng chung) ----------
  function zeroStats() {
    return { hp: 0, def: 0, crit: 0, critDmg: 0, lifesteal: 0, ll: 0, llRegen: 0,
      speed: 0, elem: {}, regenPct: 0, dropPct: 0, ltPct: 0, tuViPct: 0, healPct: 0, dmgRed: 0,
      vsBoss: 0, exec: 0, invBonus: 0 };
  }
  function addStatsBlock(s, st) {
    if (!st) return;
    ['hp', 'def', 'crit', 'critDmg', 'lifesteal', 'll', 'llRegen', 'speed'].forEach(function (k) {
      if (typeof st[k] === 'number') s[k] += st[k];
    });
    if (st.elem) Object.keys(st.elem).forEach(function (el) { s.elem[el] = (s.elem[el] || 0) + st.elem[el]; });
  }
  function addFxTotals(s, fx) {
    if (!fx) return;
    if (fx.llRegenPct) s.regenPct += fx.llRegenPct;
    if (fx.dmgRedPct) s.dmgRed += fx.dmgRedPct;
    if (fx.speedPct) s.speed += fx.speedPct;
    if (fx.dropPct) s.dropPct += fx.dropPct;
    if (fx.ltPct) s.ltPct += fx.ltPct;
    if (fx.tuViPct) s.tuViPct += fx.tuViPct;
    if (fx.healPct) s.healPct += fx.healPct;
    if (fx.kind === 'vs_boss' && fx.pct) s.vsBoss += fx.pct;
    if (fx.kind === 'execute' && fx.pct) s.exec += fx.pct;
    if (fx.kind === 'storage' && fx.slots) s.invBonus = Math.max(s.invBonus, fx.slots);
  }
  function weaponsApi() {
    if (typeof window !== 'undefined' && window.PNT_WEAPONS) return window.PNT_WEAPONS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_WEAPONS) return globalThis.PNT_WEAPONS;
    return null;
  }
  // Tổng chỉ số của nhân vật = 2 ô pháp bảo + (trường `stats` của vũ khí đang
  // đeo nếu team vũ khí đã thêm theo cùng định dạng). logic.js/skills.js/
  // game.js đều đọc qua hàm này nên chỉ số luôn chạy thật, không ghi suông.
  function totalStats(ch) {
    var s = zeroStats();
    if (!ch) return s;
    equippedDefs(ch).forEach(function (def) { addStatsBlock(s, def.stats); addFxTotals(s, def.fx); });
    var W = weaponsApi();
    if (W && typeof W.equippedDef === 'function') {
      var wd = W.equippedDef(ch);
      if (wd && wd.stats) addStatsBlock(s, wd.stats);
    }
    Object.keys(CAPS).forEach(function (k) { if (s[k] > CAPS[k]) s[k] = CAPS[k]; });
    return s;
  }
  // Khối { stats, proc } của từng pháp bảo đang đeo. Logic.statTotals cộng
  // phần stats qua equippedDefs() (proc của pháp khí = null: hiệu ứng riêng
  // của pháp khí nằm ở fx/signature do game.js chạy, không qua proc vũ khí).
  function statBlocks(ch) {
    if (!ch) return [];
    return equippedDefs(ch).map(function (def) {
      return { stats: def.stats || null, proc: def.proc || null };
    });
  }
  function procOf(def) { return def && def.proc ? def.proc : null; }
  // % tăng hồi linh lực từ fx (Ngọc Tụ Linh, Cửu Chuyển Linh Châu) — phần
  // này KHÔNG nằm trong stats nên Logic.statTotals/skills.js không thấy;
  // game.js cộng thêm vào nhịp hồi linh lực theo tỉ lệ này.
  function fxRegenPct(ch) {
    var n = 0;
    equippedDefs(ch).forEach(function (d) { if (d.fx && d.fx.llRegenPct) n += d.fx.llRegenPct; });
    return n;
  }
  // ---------- Hàm tiện ích cho game.js / logic.js ----------
  function damageReduction(ch) { return totalStats(ch).dmgRed / 100; }
  function dropMult(ch) { return 1 + totalStats(ch).dropPct / 100; }
  function ltMult(ch) { return 1 + totalStats(ch).ltPct / 100; }
  function elemMult(ch, root) {
    var s = totalStats(ch);
    return 1 + ((root && s.elem[root]) || 0) / 100;
  }
  // Hệ số sát thương theo đối tượng: boss/tinh anh (Ấn Trấn Sơn), quái sắp
  // chết (Kính Chiếu Yêu), quái bị Soi Yêu đánh dấu (m.markT do game.js đặt).
  function dmgMultVs(ch, m) {
    if (!m) return 1;
    var s = totalStats(ch);
    var mult = 1;
    if ((m.boss || m.elite) && s.vsBoss) mult += s.vsBoss / 100;
    if (s.exec && m.maxHp && m.hp <= m.maxHp * 0.3) mult += s.exec / 100;
    if (m.markT > 0) mult += (m.markPct || 30) / 100;
    return mult;
  }
  function llOnKill(ch) {
    var n = 0;
    equippedDefs(ch).forEach(function (d) { if (d.fx && d.fx.llOnKill) n += d.fx.llOnKill; });
    return n;
  }
  function forEquippedFx(ch, kind, fn) {
    equippedDefs(ch).forEach(function (d) { if (d.fx && d.fx.kind === kind) fn(d.fx, d); });
  }
  // Trói khi đánh trúng: chỉ món trói MẠNH NHẤT (tỉ lệ cao nhất, hợp lệ với
  // loại quái) được lăn. Trả về số giây trói (0 = không trúng tỉ lệ).
  function rollBind(ch, m, rng) {
    var rand = rng || Math.random;
    var best = null;
    equippedDefs(ch).forEach(function (d) {
      if (!d.fx || d.fx.kind !== 'bind') return;
      if (d.fx.weakOnly && (m.boss || m.elite)) return;
      if (!best || d.fx.chance > best.chance) best = d.fx;
    });
    if (!best) return 0;
    if (rand() >= best.chance) return 0;
    return (m.boss || m.elite) ? (best.bossDur || 0) : best.dur;
  }
  // Thiên La Địa Võng: lăn tỉ lệ giăng võng (trói diện rộng) khi đánh trúng.
  function rollNet(ch, rng) {
    var rand = rng || Math.random;
    var found = null;
    equippedDefs(ch).forEach(function (d) { if (d.fx && d.fx.kind === 'net') found = d; });
    if (!found) return null;
    return rand() < found.fx.chance ? found : null;
  }
  // Cửu Chuyển Hồi Sinh (ký danh): HP dưới ngưỡng -> tự hồi, hồi chiêu nội tại.
  function checkRevive(ch) {
    ensureArtState(ch);
    if (ch.hp <= 0 || ch.art.revCd > 0) return 0;
    var def = null;
    equippedDefs(ch).forEach(function (d) { if (d.signature && d.signature.kind === 'revive') def = d; });
    if (!def) return 0;
    var cap = ch.maxHp + totalStats(ch).hp;
    if (ch.hp >= cap * (def.signature.threshold / 100)) return 0;
    var heal = Math.round(cap * def.signature.hpPct / 100);
    ch.hp = Math.min(cap, ch.hp + heal);
    ch.art.revCd = def.signature.cd;
    return heal;
  }
  // ---------- Kích hoạt chủ động (phím 6 = ô 1, phím 7 = ô 2) ----------
  function activeOf(ch, slot) {
    var def = equippedDefAt(ch, slot);
    return (def && def.active) ? def : null;
  }
  function cdLeftA(ch, defId) { return (ch && ch.acd && ch.acd[defId]) || 0; }
  function canActivate(ch, slot) {
    var def = equippedDefAt(ch, slot);
    if (!def) return { ok: false, reason: 'empty' };
    if (!def.active) return { ok: false, reason: 'no_active', def: def };
    ensureArtState(ch);
    if (cdLeftA(ch, def.id) > 0) return { ok: false, reason: 'cd', def: def, left: cdLeftA(ch, def.id) };
    if (typeof ch.ll === 'number' && ch.ll < def.active.mana) return { ok: false, reason: 'mana', def: def };
    return { ok: true, def: def };
  }
  function applyActivate(ch, slot) {
    var chk = canActivate(ch, slot);
    if (!chk.ok) return chk;
    ensureArtState(ch);
    ch.acd[chk.def.id] = chk.def.active.cd;
    return { ok: true, def: chk.def };
  }
  // Đếm ngược hồi chiêu kích hoạt + bộ đếm nội tại (khiên châu, hồi sinh).
  function tickState(ch, dt) {
    if (!ch) return;
    ensureArtState(ch);
    Object.keys(ch.acd).forEach(function (id) {
      ch.acd[id] -= dt;
      if (ch.acd[id] <= 0) delete ch.acd[id];
    });
    if (ch.art.shieldCd > 0) ch.art.shieldCd -= dt;
    if (ch.art.revCd > 0) ch.art.revCd -= dt;
  }
  // ---------- Mua / bán / chế tạo (tiệm của Lý lão) ----------
  function sellPrice(def) { return def.value; }
  function buyArtifact(ch, defId, priceOverride) {
    var def = ARTIFACTS[defId];
    if (!def || def.price <= 0) return { ok: false, reason: 'not_sold' };
    ensureArtifacts(ch);
    // Như buyWeapon (js/weapons.js): chỉ nhận giá giảm tối đa 10%
    // theo hảo cảm với Lý lão, chặn mọi mức giảm vượt 10%.
    var price = def.price;
    if (typeof priceOverride === 'number' && priceOverride >= Math.floor(def.price * 0.9) && priceOverride <= def.price) price = priceOverride;
    if (ch.linhThach < price) return { ok: false, reason: 'linhThach' };
    ch.linhThach -= price;
    var e = addArtifact(ch, defId);
    return { ok: true, entry: e, def: def };
  }
  function sellArtifact(ch, uid) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = ARTIFACTS[e.id];
    if (def && def.noSell) return { ok: false, reason: 'nosell', def: def }; // vật ký danh kỳ ngộ tông không bán được
    if (slotOf(ch, uid) >= 0) unequip(ch, uid);
    ch.inventory.splice(ch.inventory.indexOf(e), 1);
    var gained = def.value;
    var AC = (typeof globalThis !== 'undefined') ? globalThis.PNT_ANTICHEAT : null; // chống hack: trần bán đồ
    if (AC && typeof AC.guardGain === 'function') gained = AC.guardGain('sell', gained);
    ch.linhThach += gained;
    return { ok: true, def: def, gained: gained };
  }
  function itemCount(ch, itemId) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === itemId && !it.w && !it.a) n += it.count; });
    return n;
  }
  function takeItems(ch, itemId, n) {
    for (var i = ch.inventory.length - 1; i >= 0 && n > 0; i--) {
      var it = ch.inventory[i];
      if (it.id !== itemId || it.w || it.a) continue;
      var take = Math.min(it.count, n);
      it.count -= take; n -= take;
      if (it.count <= 0) ch.inventory.splice(i, 1);
    }
    return n <= 0;
  }
  function canCraft(ch, defId) {
    var r = RECIPES[defId];
    if (!r) return { ok: false, reason: 'no_recipe' };
    if (ch.linhThach < r.fee) return { ok: false, reason: 'linhThach', recipe: r };
    var lack = {};
    Object.keys(r.mats).forEach(function (mid) {
      var have = itemCount(ch, mid);
      if (have < r.mats[mid]) lack[mid] = r.mats[mid] - have;
    });
    if (Object.keys(lack).length) return { ok: false, reason: 'mats', lack: lack, recipe: r };
    return { ok: true, recipe: r };
  }
  function craft(ch, defId) {
    var chk = canCraft(ch, defId);
    if (!chk.ok) return chk;
    var r = chk.recipe;
    Object.keys(r.mats).forEach(function (mid) { takeItems(ch, mid, r.mats[mid]); });
    ch.linhThach -= r.fee;
    var e = addArtifact(ch, defId);
    return { ok: true, entry: e, def: ARTIFACTS[defId], recipe: r };
  }
  // Rơi pháp bảo khi hạ quái: thường tối đa 1 món; tinh anh bảng riêng 1 món;
  // boss lăn cả bảng BOSS_DROPS (allowMulti theo cờ boss của quái).
  function rollDrop(m, rng) {
    var rand = rng || Math.random;
    var table, multi;
    if (!m) return [];
    if (m.boss || m.type === 'son_quan') { table = BOSS_DROPS; multi = true; }
    else if (m.elite) { table = ELITE_DROPS; multi = false; }
    else { table = DROPS[m.type] || []; multi = false; }
    var out = [];
    for (var i = 0; i < table.length; i++) {
      if (rand() < table[i].chance) {
        out.push(table[i].id);
        if (!multi) break;
      }
    }
    return out;
  }
  // ---------- Dòng chữ chỉ số (cho túi đồ / tiệm / ảnh xem trước) ----------
  var STAT_LABELS = [
    ['hp', 'Máu tối đa +%v'], ['def', 'Giáp +%v'], ['crit', 'Chí mạng +%v%'],
    ['critDmg', 'Sát thương chí mạng +%v%'], ['lifesteal', 'Hút máu +%v%'],
    ['ll', 'Linh lực tối đa +%v'], ['llRegen', 'Hồi linh lực +%v/giây'], ['speed', 'Tốc độ +%v%']
  ];
  function statLines(def) {
    var out = [];
    if (!def) return out;
    var st = def.stats || {};
    STAT_LABELS.forEach(function (pair) {
      if (st[pair[0]]) out.push(pair[1].replace('%v', st[pair[0]]));
    });
    if (st.elem) Object.keys(st.elem).forEach(function (el) {
      out.push('Sát thương hệ ' + (ELEM_NAMES[el] || el) + ' +' + st.elem[el] + '%');
    });
    return out;
  }
  function statLineCount(def) {
    var st = (def && def.stats) || {};
    var n = 0;
    STAT_LABELS.forEach(function (pair) { if (st[pair[0]]) n++; });
    if (st.elem) n += Object.keys(st.elem).length;
    return n;
  }
  function describeStats(ch) {
    var s = totalStats(ch);
    var parts = [];
    STAT_LABELS.forEach(function (pair) {
      if (s[pair[0]]) parts.push(pair[1].replace('%v', s[pair[0]]));
    });
    Object.keys(s.elem).forEach(function (el) {
      if (s.elem[el]) parts.push('Sát thương hệ ' + (ELEM_NAMES[el] || el) + ' +' + s.elem[el] + '%');
    });
    if (s.regenPct) parts.push('Hồi linh lực +' + s.regenPct + '%');
    if (s.dropPct) parts.push('Rơi vật phẩm +' + s.dropPct + '%');
    if (s.ltPct) parts.push('Linh Thạch rơi +' + s.ltPct + '%');
    if (s.tuViPct) parts.push('Tu vi +' + s.tuViPct + '%');
    if (s.healPct) parts.push('Hồi máu từ thuốc +' + s.healPct + '%');
    if (s.dmgRed) parts.push('Giảm sát thương ' + s.dmgRed + '%');
    if (s.vsBoss) parts.push('Sát thương lên boss/tinh anh +' + s.vsBoss + '%');
    if (s.exec) parts.push('Kết liễu quái <30% Máu +' + s.exec + '%');
    if (s.invBonus) parts.push('Túi đồ +' + s.invBonus + ' ô');
    return parts;
  }
  // ---------- Hình pháp bảo: lưới 16x16 theo hình dạng ----------
  var GRIDS = {
    holo: [
      '.......gg.......',
      '......gJJg......',
      '.......hh.......',
      '.....bbbbbb.....',
      '....bBBBBBBb....',
      '....bBbbbbBb....',
      '....bBbbbbBb....',
      '.....bbbbbb.....',
      '......bbbb......',
      '...bbbbbbbbbb...',
      '..bBBBBBBBBBBb..',
      '..bBbbbbbbbbBb..',
      '..bBbbbbbbbbBb..',
      '..bBbbbbbbbbBb..',
      '..bbbbbbbbbbbb..',
      '...dddddddddd...'
    ],
    kinh: [
      '................',
      '.....oooooo.....',
      '....oBBBBBBo....',
      '...oBwwwwwwBo...',
      '...oBwsssswBo...',
      '...oBwwwwwwBo...',
      '...oBwwwwssBo...',
      '....oBBBBBBo....',
      '.....oooooo.....',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '......oooo......',
      '................'
    ],
    chuong: [
      '.......oo.......',
      '......oooo......',
      '.......hh.......',
      '.....bbbbbb.....',
      '....bBBBBBBb....',
      '....bBBBBBBb....',
      '...bBBBBBBBBb...',
      '...bBbbbbbbBb...',
      '...bBbbbbbbBb...',
      '..bBBBBBBBBBBb..',
      '..bbbbbbbbbbbb..',
      '..gggggggggggg..',
      '.......oo.......',
      '.......oo.......',
      '................',
      '................'
    ],
    day: [
      '................',
      '....hhhhhhhh....',
      '..hh........hh..',
      '..h..hhhhhh..h..',
      '..h.h......h.h..',
      '..h.h.ffff.h.h..',
      '..h.h.ffff.h.h..',
      '..h.h......h.h..',
      '..h..hhhhhh..h..',
      '..hh........hh..',
      '....hhhhhhhh....',
      '.......ff.......',
      '.......ff.......',
      '......ffff......',
      '......f..f......',
      '................'
    ],
    phi_kiem: [
      '.......Bb.......',
      '.......Bb.......',
      '......bBBb......',
      '......bBBb......',
      '......bBBb......',
      '.....bBBBBb.....',
      '.....bBBBBb.....',
      '......bBBb......',
      '....gggggggg....',
      '.......hh.......',
      '.......hh.......',
      '.......oo.......',
      '......s..s......',
      '.....s....s.....',
      '....s......s....',
      '................'
    ],
    an: [
      '................',
      '.......oo.......',
      '......oooo......',
      '.......oo.......',
      '....bbbbbbbb....',
      '...bBBBBBBBBb...',
      '...bB......Bb...',
      '...bB.ffff.Bb...',
      '...bB.ffff.Bb...',
      '...bB......Bb...',
      '...bBBBBBBBBb...',
      '...bbbbbbbbbb...',
      '...ffffffffff...',
      '...ffffffffff...',
      '................',
      '................'
    ],
    vong: [
      'b.b.b.b.b.b.b.b.',
      '.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b.',
      '.b.b.b.b.b.b.b.b',
      'b.b.b.bB.b.b.b.b',
      '.b.b.b.Bb.b.b.b.',
      'b.b.b.bB.b.b.b.b',
      '.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b.',
      '.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b.',
      '.b.b.b.b.b.b.b.b',
      '................',
      '.......oo.......',
      '......oooo......',
      '.......oo.......'
    ],
    chau: [
      '.......oo.......',
      '......o..o......',
      '....bbbbbbbb....',
      '...bBwwwwwwBb...',
      '..bBwwsssswwBb..',
      '..bBwsssssswBb..',
      '..bBssssssssBb..',
      '..bBssssssssBb..',
      '..bBwsssssswBb..',
      '...bBwwwwwwBb...',
      '....bbbbbbbb....',
      '.....dddddd.....',
      '....gggggggg....',
      '...gggggggggg...',
      '................',
      '................'
    ],
    ngoc: [
      '................',
      '.....jjjjjj.....',
      '....jJJJJJJj....',
      '...jJjjjjjjJj...',
      '...jJj....jJj...',
      '..jJj......jJj..',
      '..jJj......jJj..',
      '..jJj......jJj..',
      '..jJj......jJj..',
      '...jJj....jJj...',
      '...jJjjjjjjJj...',
      '....jJJJJJJj....',
      '.....jjjjjj.....',
      '................',
      '................',
      '................'
    ],
    boi: [
      '.......ff.......',
      '......f..f......',
      '......f..f......',
      '.......ff.......',
      '.......oo.......',
      '......oooo......',
      '.....bbbbbb.....',
      '....bBBBBBBb....',
      '....bBbbbbBb....',
      '....bBbbbbBb....',
      '.....bBBBBb.....',
      '......bBBb......',
      '.......bb.......',
      '.......oo.......',
      '................',
      '................'
    ],
    tui: [
      '................',
      '.......ff.......',
      '......ffff......',
      '.......hh.......',
      '......hhhh......',
      '....bbbbbbbb....',
      '...bBBBBBBBBb...',
      '..bBbbbbbbbbBb..',
      '..bBbbbBBbbbBb..',
      '..bBbbbBBbbbBb..',
      '..bBbbbbbbbbBb..',
      '..bBbbbbbbbbBb..',
      '...bBBBBBBBBb...',
      '....bbbbbbbb....',
      '.....dddddd.....',
      '................'
    ],
    bon: [
      '................',
      '......y..y......',
      '.....yyyyyy.....',
      '................',
      '..bbbbbbbbbbbb..',
      '.bBBBBBBBBBBBBb.',
      '.bByyyyyyyyyyBb.',
      '..bbbbbbbbbbbb..',
      '...bBBBBBBBBb...',
      '....bBBBBBBb....',
      '.....bbbbbb.....',
      '......gggg......',
      '.....gggggg.....',
      '....gggggggg....',
      '................',
      '................'
    ],
    dang: [
      '.......oo.......',
      '......oooo......',
      '.......hh.......',
      '....hhhhhhhh....',
      '...h........h...',
      '...h..ffff..h...',
      '...h..fyyf..h...',
      '...h..ffff..h...',
      '...h........h...',
      '....hhhhhhhh....',
      '.......hh.......',
      '......gggg......',
      '.....gggggg.....',
      '....gggggggg....',
      '................',
      '................'
    ],
    dinh: [
      '................',
      '......oooo......',
      '.....oooooo.....',
      '.......hh.......',
      '....hhhhhhhh....',
      '..bbbbbbbbbbbb..',
      '.bBBBBBBBBBBBBb.',
      '.bBbbbbbbbbbbBb.',
      '.bBbbbBBBBbbbBb.',
      '.bBbbbbbbbbbbBb.',
      '..bbbbbbbbbbbb..',
      '...bb......bb...',
      '...bb......bb...',
      '..bbb......bbb..',
      '................',
      '................'
    ],
    hat: [
      '................',
      '.....oo..oo.....',
      '....o......o....',
      '...o..oooo..o...',
      '...o..o..o..o...',
      '....o......o....',
      '.....oo..oo.....',
      '.......oo.......',
      '.......oo.......',
      '......oooo......',
      '.....oooooo.....',
      '....oooooooo....',
      '.....oooooo.....',
      '......oooo......',
      '................',
      '................'
    ]
  };
  function gridPixels(grid, palette) {
    return grid.map(function (row) {
      return row.split('').map(function (ch) { return palette[ch] || null; });
    });
  }
  function iconPixels(def) { return gridPixels(GRIDS[def.shape], paletteFor(def.grade)); }
  function drawPixels(ctx, px, x, y, scale) {
    for (var r = 0; r < px.length; r++)
      for (var c = 0; c < px[r].length; c++)
        if (px[r][c]) { ctx.fillStyle = px[r][c]; ctx.fillRect(x + c * scale, y + r * scale, scale, scale); }
  }
  function drawIcon(ctx, def, x, y, scale) {
    drawPixels(ctx, iconPixels(def), x, y, scale);
  }
  // ---------- Ảnh AI pháp bảo: Cao = assets/artifacts-ai (ô 192), Trung
  // bình = assets/artifacts-md (ô 120, pixel hoá từ bản AI). Thư mục lấy từ
  // js/artifact-ai.js (PNT_ARTIFACT_AI), thiếu thì dùng mặc định cùng tên.
  // Nạp LƯỜI từng món + đệm dùng chung; chưa nạp xong thì tạm vẽ icon pixel,
  // nạp xong phát sự kiện 'pnt-art-icon' để game.js vẽ lại panel đang mở
  // (orbit vẽ mỗi frame nên tự ăn ảnh mới ngay frame sau). Vòng lặp chỉ
  // drawImage ảnh đã nạp — không cấp phát, không giải mã trong frame.
  var AI_DIRS = { cao: 'assets/artifacts-ai', trung: 'assets/artifacts-md' };
  function artAiData() {
    if (typeof window !== 'undefined' && window.PNT_ARTIFACT_AI) return window.PNT_ARTIFACT_AI;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_ARTIFACT_AI) return globalThis.PNT_ARTIFACT_AI;
    return null;
  }
  var _artImgs = {};
  function artImage(def, level) {
    if (!def || typeof Image === 'undefined') return null;
    var lv = (level === 'trung') ? 'trung' : 'cao';
    var key = lv + '/' + def.id;
    var im = _artImgs[key];
    if (!im) {
      var data = artAiData();
      var dir = (data && data.tiers && data.tiers[lv]) || AI_DIRS[lv];
      im = new Image();
      im.onload = function () {
        im._ready = true;
        try {
          if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined')
            window.dispatchEvent(new CustomEvent('pnt-art-icon', { detail: def.id }));
        } catch (e) {}
      };
      im.src = dir + '/' + def.id + '.png';
      _artImgs[key] = im;
    }
    return im._ready ? im : null;
  }
  // Vẽ icon pháp bảo theo mức đồ hoạ tại (x, y) với cạnh `size`: Cao/Trung
  // bình vẽ ảnh AI khi đã nạp, chưa nạp hoặc mức Thấp thì lưới pixel phóng
  // theo size. Trả về true nếu đã vẽ bằng ảnh AI.
  function drawIconArt(ctx, def, x, y, size, level) {
    if (!ctx || !def) return false;
    if (level !== 'thap') {
      var im = artImage(def, level);
      if (im) { ctx.drawImage(im, x, y, size, size); return true; }
    }
    drawPixels(ctx, iconPixels(def), x, y, size / 16);
    return false;
  }
  // Pháp bảo đã đeo BAY LƠ LỬNG quanh nhân vật: 2 ô đối pha nhau trên vòng
  // elip ngang (bán kính 38px, tâm cao hơn chân 56px), nhấp nhô theo thời
  // gian t (giây). Tách hẳn lớp vũ khí cầm tay (vũ khí ở điểm tay ~ ngang
  // hông, pháp bảo bay ở tầm vai/đầu). quality: 'cao' có hào quang theo
  // phẩm + khiên nước của Định Hải Thần Châu khi đang sẵn sàng; 'trung'
  // hào quang nhẹ chỉ phẩm cao; game.js không gọi hàm này ở mức 'thap'.
  function orbitPos(cx, cy, t, slot) {
    var ang = t * 1.6 + slot * Math.PI;
    return {
      x: cx + Math.cos(ang) * 38,
      y: cy - 56 + Math.sin(ang * 2 + slot) * 6 + Math.sin(t * 2.2 + slot * 2) * 3
    };
  }
  function drawOrbit(ctx, ch, cx, cy, t, quality) {
    if (!ctx || !ch) return;
    var defs = equippedDefs(ch);
    if (!defs.length) return;
    var q = quality || 'cao';
    defs.forEach(function (def, i) {
      var p = orbitPos(cx, cy, t, i);
      var grade = GRADES[def.grade];
      if (grade && grade.glow && q !== 'thap') {
        var strong = grade.rank >= 3;
        if (q === 'cao' || strong) {
          if (ctx.save) ctx.save();
          ctx.globalAlpha = q === 'cao' ? (strong ? 0.38 : 0.2) : 0.22;
          ctx.fillStyle = grade.glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, strong ? 24 : 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          if (ctx.restore) ctx.restore();
        }
      }
      // Pháp bảo bay quanh vẽ bằng ẢNH AI 40px ở Cao/Trung bình (hào quang
      // phẩm đã vẽ ở trên), chưa nạp xong ảnh thì icon pixel tạm thay thế.
      drawIconArt(ctx, def, p.x - 20, p.y - 20, 40, q);
      // Khiên Định Hải đang sẵn sàng: vòng nước quanh thân người.
      if (def.id === 'dinh_hai_than_chau' && ch.art && ch.art.shield) {
        if (ctx.save) ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#7fe8ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy - 48, 34 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (ctx.restore) ctx.restore();
      }
    });
  }
  var api = {
    KINDS: KINDS, GRADES: GRADES, GRADE_PALETTES: GRADE_PALETTES, ELEM_NAMES: ELEM_NAMES,
    ARTIFACTS: ARTIFACTS, SHOP: SHOP, RECIPES: RECIPES,
    DROPS: DROPS, ELITE_DROPS: ELITE_DROPS, BOSS_DROPS: BOSS_DROPS,
    ELITE_TYPES: ELITE_TYPES, ELITE_CHANCE: ELITE_CHANCE, ELITE_HP_MULT: ELITE_HP_MULT, ELITE_ATK_ADD: ELITE_ATK_ADD,
    CAPS: CAPS, SLOT_COUNT: SLOT_COUNT, paletteFor: paletteFor,
    isArtifactId: isArtifactId, artifactDef: artifactDef, isArtifactEntry: isArtifactEntry,
    ensureArtifacts: ensureArtifacts, ensureArtState: ensureArtState,
    addArtifact: addArtifact, findEntry: findEntry, artifactEntries: artifactEntries,
    slotOf: slotOf, equippedEntries: equippedEntries, equippedDefs: equippedDefs,
    equippedDefAt: equippedDefAt, hasEquipped: hasEquipped,
    canEquip: canEquip, equip: equip, unequip: unequip,
    totalStats: totalStats, statBlocks: statBlocks, procOf: procOf, fxRegenPct: fxRegenPct, damageReduction: damageReduction,
    dropMult: dropMult, ltMult: ltMult, elemMult: elemMult, dmgMultVs: dmgMultVs,
    llOnKill: llOnKill, forEquippedFx: forEquippedFx, rollBind: rollBind, rollNet: rollNet,
    checkRevive: checkRevive,
    activeOf: activeOf, cdLeftA: cdLeftA, canActivate: canActivate, applyActivate: applyActivate,
    tickState: tickState,
    sellPrice: sellPrice, buyArtifact: buyArtifact, sellArtifact: sellArtifact,
    itemCount: itemCount, canCraft: canCraft, craft: craft, rollDrop: rollDrop,
    statLines: statLines, statLineCount: statLineCount, describeStats: describeStats,
    GRIDS: GRIDS, iconPixels: iconPixels, drawPixels: drawPixels, drawIcon: drawIcon,
    AI_DIRS: AI_DIRS, artImage: artImage, drawIconArt: drawIconArt,
    orbitPos: orbitPos, drawOrbit: drawOrbit
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_ARTIFACTS = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_ARTIFACTS = api;
})();
