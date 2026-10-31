// Phàm Nhân Tu Đạo — hệ thống TRANG BỊ ĐEO (Giai đoạn 2, docs/equipment-slots-design.md).
// Bộ 16 ô quanh người giấy gồm 4 hệ: vũ khí (js/weapons.js), pháp bảo x2
// (js/artifacts.js), trang phục (js/wardrobe.js), linh thú (js/pets.js) —
// ĐÃ CÓ từ trước — và 11 ô MỚI do module này quản:
//   Phòng thân 6: Mũ · Giáp · Áo choàng · Đai lưng · Bao tay · Giày
//   Trang sức 5: Trâm · Vòng cổ · Vòng tay · Nhẫn 1 · Nhẫn 2
// Mỗi món gear là một entry riêng { id, count: 1, uid, g: 1 } trong
// ch.inventory (không cộng dồn, như vũ khí/pháp bảo); ô đang đeo ghi ở
// ch.gearSlots = { mu, giap, choang, dai, baotay, giay, tram, vongco,
// vongtay, nhan: [uid, uid] }. Save cũ nạp được nhờ ensureGear() khởi
// tạo lười + di trú: ô trỏ tới món không tồn tại/không khớp loại thì
// dọn ô, món vẫn nằm nguyên trong túi (KHÔNG mất đồ).
// Chỉ số: mọi món mang khối `stats` ĐÚNG định dạng dùng chung
// (weapons.js/artifacts.js): { hp, def, crit, critDmg, lifesteal, ll,
// llRegen, speed, elem: { <hệ>: % } } và cộng vào nhân vật CHỈ qua
// Logic.gearBlocks -> Logic.statTotals (logic.js tra cứu lười
// PNT_GEAR.equippedDefs) -> Logic.applyOffense hưởng crit/hút máu...
// QUYẾT ĐỊNH PARENT (GĐ2, hằng số dễ chỉnh tại đây):
//   GEAR_CRIT_CAP = 35 — trần tỉ lệ chí mạng TỪ TRANG BỊ (%): tổng crit
//     cộng dồn trong Logic.statTotals bị kẹp ở mức này (full Thiên mọi
//     ô theo thiết kế đạt 39% -> thực nhận 35%).
//   Đồ Địa phẩm yêu cầu cảnh giới Trúc Cơ trở lên (reqRealm rank 2),
//     đồ Thiên phẩm yêu cầu Kim Đan trở lên (reqRealm rank 3) — rank
//     theo thang maps.js REALMS (0 Phàm Nhân · 1 Luyện Khí · 2 Trúc Cơ
//     · 3 Kim Đan · 4 Nguyên Anh · 5 Hóa Thần · 6 Độ Kiếp). Đồ dưới
//     Địa phẩm không cổng cảnh giới (chỉ reqTier như thang cũ).
(function () {
  'use strict';
  var GEAR_CRIT_CAP = 35;
  var GRADES = {
    pham: { name: 'Phàm phẩm', rank: 0, glow: null },
    linh: { name: 'Linh phẩm', rank: 1, glow: '#7fe8d6' },
    huyen: { name: 'Huyền phẩm', rank: 2, glow: '#cfa6ff' },
    dia: { name: 'Địa phẩm', rank: 3, glow: '#ffb84e' },
    thien: { name: 'Thiên phẩm', rank: 4, glow: '#ffe98a' }
  };
  var GRADE_ORDER = ['pham', 'linh', 'huyen', 'dia', 'thien'];
  var REQ_TIER = { pham: 0, linh: 1, huyen: 2, dia: 3, thien: 3 };
  var REQ_REALM = { pham: 0, linh: 0, huyen: 0, dia: 2, thien: 3 };
  var REALM_NAMES = { 0: 'Phàm Nhân', 1: 'Luyện Khí', 2: 'Trúc Cơ', 3: 'Kim Đan', 4: 'Nguyên Anh', 5: 'Hóa Thần', 6: 'Độ Kiếp' };
  // Bảng màu icon theo phẩm (khớp GRADE_PALETTES của weapons.js):
  // b thân chính, B cạnh sáng, d tối, g kim loại phụ, o ngọc nhấn.
  var GRADE_PALETTES = {
    pham: { b: '#9aa0a8', B: '#dde1e6', d: '#5a5f66', g: '#8b5a2b', o: '#7a7f87' },
    linh: { b: '#a8c8d8', B: '#eefaff', d: '#527a94', g: '#c9a44e', o: '#3fd6c0' },
    huyen: { b: '#9a7fd0', B: '#e2d6ff', d: '#463270', g: '#8a6fd0', o: '#cfa6ff' },
    dia: { b: '#d8a84e', B: '#ffeda8', d: '#7a5220', g: '#f2c14e', o: '#ff8a3c' },
    thien: { b: '#ffe98a', B: '#fffbe8', d: '#a87f2e', g: '#fff2b0', o: '#7fe8ff' }
  };
  var COMMON_PALETTE = { h: '#6b4a2a', H: '#3a2a1a', s: '#e8e4da', f: '#c0392b' };
  function paletteFor(grade) {
    var p = {}, k;
    for (k in COMMON_PALETTE) p[k] = COMMON_PALETTE[k];
    var g = GRADE_PALETTES[grade] || GRADE_PALETTES.pham;
    for (k in g) p[k] = g[k];
    return p;
  }
  // ---------- 11 ô mới ----------
  var SLOTS = {
    mu: { id: 'mu', name: 'Mũ / Nón', role: 'Thần thức · Linh lực', group: 'phongthan' },
    giap: { id: 'giap', name: 'Giáp', role: 'Phòng thủ chính', group: 'phongthan' },
    choang: { id: 'choang', name: 'Áo choàng', role: 'Thân pháp · Tốc độ', group: 'phongthan' },
    dai: { id: 'dai', name: 'Đai lưng', role: 'Căn cơ · Máu', group: 'phongthan' },
    baotay: { id: 'baotay', name: 'Bao tay', role: 'Ra đòn · Chí mạng', group: 'phongthan' },
    giay: { id: 'giay', name: 'Giày', role: 'Di chuyển · Tốc độ', group: 'phongthan' },
    tram: { id: 'tram', name: 'Trâm cài tóc', role: 'Linh căn · Hệ', group: 'trangsuc' },
    vongco: { id: 'vongco', name: 'Vòng cổ · Ngọc bội', role: 'Dưỡng nguyên · Hồi linh lực', group: 'trangsuc' },
    vongtay: { id: 'vongtay', name: 'Vòng tay', role: 'Huyết khí · Hút máu', group: 'trangsuc' },
    nhan: { id: 'nhan', name: 'Nhẫn', role: 'Tinh chỉnh · 1 dòng', group: 'trangsuc' }
  };
  var SLOT_KEYS = ['mu', 'giap', 'choang', 'dai', 'baotay', 'giay', 'tram', 'vongco', 'vongtay'];
  // ---------- Thang số theo thiết kế mục 3 (chủ đạo theo phẩm + dòng phụ) ----------
  // Mỗi loại: main[khoá chỉ số] = [Phàm, Linh, Huyền, Địa, Thiên];
  // sub = { <phẩm bắt đầu>: { khoá: giá trị, ...theo từng phẩm } } — ghi
  // tường minh từng phẩm cho khỏi suy diễn.
  var SCALES = {
    mu: { main: { key: 'll', vals: [4, 8, 14, 22, 32] }, sub: { huyen: { llRegen: 0.3 }, dia: { llRegen: 0.5 }, thien: { llRegen: 0.8 } } },
    giap: { main: { key: 'def', vals: [2, 4, 7, 11, 16] }, sub: { dia: { hp: 20 }, thien: { hp: 35 } } },
    choang: { main: { key: 'speed', vals: [2, 3, 5, 7, 10] }, sub: { thien: { crit: 4 } } },
    dai: { main: { key: 'hp', vals: [10, 18, 30, 48, 70] }, sub: { huyen: { def: 1 }, dia: { def: 2 }, thien: { def: 3 } } },
    baotay: { main: { key: 'crit', vals: [1, 2, 3, 5, 7] }, sub: { dia: { critDmg: 10 }, thien: { critDmg: 18 } } },
    giay: { main: { key: 'speed', vals: [3, 4, 6, 9, 12] }, sub: { dia: { def: 1 }, thien: { def: 2 } } },
    tram: { main: { key: 'elemPct', vals: [4, 6, 9, 13, 18] }, sub: { thien: { ll: 12 } } },
    vongco: { main: { key: 'llRegen', vals: [0.2, 0.35, 0.5, 0.8, 1.2] }, sub: { linh: { hp: 8 }, huyen: { hp: 15 }, dia: { hp: 25 }, thien: { hp: 40 } } },
    vongtay: { main: { key: 'lifesteal', vals: [1, 2, 3, 4, 6] }, sub: { dia: { crit: 2 }, thien: { crit: 3 } } }
  };
  // Nhẫn: đúng 1 dòng/món từ nhóm tinh chỉnh; thang theo phẩm, trần ở
  // Huyền/Thiên như thiết kế (crit 1/2/3 · elem 3/5/8 · llRegen
  // 0,15/0,3/0,5 · speed 1/2/3 cho Phàm/Linh/Huyền, Địa/Thiên giữ trần).
  var RING_LINES = {
    crit: { label: 'Chí mạng', vals: [1, 2, 3, 3, 3] },
    elem: { label: 'Hệ linh căn', vals: [3, 5, 8, 8, 8] },
    llregen: { label: 'Hồi linh lực', vals: [0.15, 0.3, 0.5, 0.5, 0.5] },
    speed: { label: 'Tốc độ', vals: [1, 2, 3, 3, 3] }
  };
  // Tên theo loại x phẩm (thiết kế mục 5).
  var NAMES = {
    mu: ['Khăn Lam Thanh Khê', 'Linh Trúc Đẩu Lạp', 'Ngân Nguyệt Quan', 'Tử Kim Huyền Quan', 'Cửu Thiên Tinh Quan'],
    giap: ['Bố Y Giáp', 'Thiết Diệp Giáp', 'Huyền Lân Giáp', 'Trấn Sơn Bảo Giáp', 'Thiên Cương Thần Giáp'],
    choang: ['Thô Bố Phi Phong', 'Phong Linh Phi Phong', 'Huyền Vân Phi Phong', 'Lưu Vân Phi Phong', 'Thái Hư Phi Phong'],
    dai: ['Đai Vải Gai', 'Da Sói Chiến Đai', 'Huyền Ngọc Đai', 'Khảm Long Đai', 'Thương Hải Long Đai'],
    baotay: ['Bố Chỉ Thủ Sáo', 'Thiết Chỉ Thủ Sáo', 'Huyền Tơ Thủ Sáo', 'Phá Quân Thủ Sáo', 'Trích Tinh Thủ Sáo'],
    giay: ['Thảo Biên Ngoa', 'Tật Phong Ngoa', 'Huyền Vân Ngoa', 'Lưu Vân Ngoa', 'Lăng Hư Thiên Ngoa'],
    tram: ['Đào Mộc Trâm', 'Ngân Linh Trâm', 'Bích Ngọc Huyền Trâm', 'Phượng Vũ Trâm', 'Cửu Phượng Thiên Trâm'],
    vongco: ['Thanh Ngọc Bội', 'Linh Tâm Bội', 'Huyền Tâm Bội', 'Địa Tâm Ngọc Bội', 'Thiên Tâm Thần Bội'],
    vongtay: ['Mun Mộc Trạc', 'Thiết Huyết Trạc', 'Huyền Băng Trạc', 'Xích Long Trạc', 'Thiên Cương Trạc'],
    nhan: ['Đồng Cổ Giới', 'Linh Vân Giới', 'Huyền Quang Giới', 'Địa Tâm Giới Chỉ', 'Thiên Cơ Giới Chỉ']
  };
  var TYPE_FLAVOR = {
    mu: 'che đầu, tụ thần thức, mở rộng biển linh lực',
    giap: 'lớp phòng thủ chính của thân, chịu đòn thay da thịt',
    choang: 'khoác ngoài nhẹ như mây, mượn gió mà nhanh chân',
    dai: 'siết chặt căn cơ, giữ khí huyết không tán',
    baotay: 'ôm sát cổ tay, ra đòn thêm phần hiểm',
    giay: 'nhẹ bước như đạp gió, đi xa không mỏi',
    tram: 'cài trên búi tóc, dẫn linh căn cộng hưởng với hệ của người đeo',
    vongco: 'ngọc đeo trước ngực, dưỡng nguyên hồi linh',
    vongtay: 'vòng ôm cổ tay, dẫn huyết khí quay về thân',
    nhan: 'nhẫn nhỏ mà tinh, chỉ mang đúng một dòng tinh chỉnh'
  };
  // Giá neo theo thiết kế mục 3: Phàm shop 40–120 · Linh shop 300–520
  // (value ~25–40%) · Huyền value 190–280 · Địa value 420–560 ·
  // Thiên value 900–1100. price > 0 chỉ ở Phàm/Linh (bán ở tiệm).
  var PRICE = {
    mu: [50, 320], giap: [110, 500], choang: [80, 420], dai: [60, 340], baotay: [70, 380],
    giay: [90, 460], tram: [100, 480], vongco: [120, 520], vongtay: [110, 500], nhan: [120, 520]
  };
  var VALUE_HIGH = {
    mu: [200, 440, 950], giap: [270, 550, 1080], choang: [240, 500, 1000], dai: [210, 450, 920],
    baotay: [230, 480, 980], giay: [250, 520, 1020], tram: [260, 530, 1050], vongco: [280, 560, 1100],
    vongtay: [270, 540, 1060], nhan: [280, 560, 1100]
  };
  function priceOf(slot, gi) {
    if (gi === 0) { var p0 = PRICE[slot][0]; return { price: p0, value: Math.round(p0 * 0.4) }; }
    if (gi === 1) { var p1 = PRICE[slot][1]; return { price: p1, value: Math.round(p1 * 0.25) }; }
    return { price: 0, value: VALUE_HIGH[slot][gi - 2] };
  }
  function buildStats(slot, grade) {
    var gi = GRADE_ORDER.indexOf(grade);
    var sc = SCALES[slot];
    var st = {};
    if (sc.main.key === 'elemPct') st._elemPct = sc.main.vals[gi];
    else st[sc.main.key] = sc.main.vals[gi];
    var sub = sc.sub[grade];
    if (sub) for (var k in sub) st[k] = sub[k];
    return st;
  }
  var GEAR = {};
  SLOT_KEYS.forEach(function (slot) {
    GRADE_ORDER.forEach(function (grade, gi) {
      var id = slot + '_' + grade;
      var pv = priceOf(slot, gi);
      var def = {
        id: id, slot: slot, grade: grade, name: NAMES[slot][gi],
        reqTier: REQ_TIER[grade], reqRealm: REQ_REALM[grade],
        price: pv.price, value: pv.value,
        desc: NAMES[slot][gi] + ' — ' + SLOTS[slot].name.toLowerCase() + ' ' + GRADES[grade].name.toLowerCase() + ', ' + TYPE_FLAVOR[slot] + '.'
      };
      var st = buildStats(slot, grade);
      if (typeof st._elemPct === 'number') { def.elemPct = st._elemPct; delete st._elemPct; }
      if (Object.keys(st).length) def.stats = st;
      GEAR[id] = def;
    });
  });
  // Nhẫn: 4 biến thể dòng x 5 phẩm.
  Object.keys(RING_LINES).forEach(function (rk) {
    GRADE_ORDER.forEach(function (grade, gi) {
      var id = 'nhan_' + grade + '_' + rk;
      var pv = priceOf('nhan', gi);
      var line = RING_LINES[rk];
      var def = {
        id: id, slot: 'nhan', grade: grade, ringKey: rk,
        name: NAMES.nhan[gi] + ' · ' + line.label,
        reqTier: REQ_TIER[grade], reqRealm: REQ_REALM[grade],
        price: pv.price, value: pv.value,
        desc: NAMES.nhan[gi] + ' — nhẫn ' + GRADES[grade].name.toLowerCase() + ' chỉ mang một dòng ' + line.label.toLowerCase() + '; hai nhẫn đeo cùng lúc không được trùng dòng nhau.'
      };
      if (rk === 'elem') def.elemPct = line.vals[gi];
      else if (rk === 'llregen') def.stats = { llRegen: line.vals[gi] };
      else { def.stats = {}; def.stats[rk] = line.vals[gi]; }
      GEAR[id] = def;
    });
  });
  // ---------- Cửa hàng / chế tạo / rơi ----------
  var SHOP_FORGE = Object.keys(GEAR).filter(function (id) {
    var d = GEAR[id]; return d.price > 0 && SLOTS[d.slot].group === 'phongthan';
  });
  var SHOP_JEWEL = Object.keys(GEAR).filter(function (id) {
    var d = GEAR[id]; return d.price > 0 && SLOTS[d.slot].group === 'trangsuc';
  });
  // Chế tạo ở lò rèn (đồ phòng thân) — nguyên liệu sẵn có như rèn vũ khí.
  var RECIPES = {
    giap_linh: { fee: 70, mats: { da_soi: 4 } },
    giay_linh: { fee: 60, mats: { da_soi: 3, long_ga: 3 } },
    dai_linh: { fee: 55, mats: { da_soi: 3 } },
    mu_huyen: { fee: 130, mats: { da_soi: 4, linh_chi: 2 } },
    giap_huyen: { fee: 160, mats: { da_soi: 6, linh_chi: 2 } },
    dai_huyen: { fee: 120, mats: { da_soi: 5, linh_chi: 1 } },
    baotay_huyen: { fee: 140, mats: { da_soi: 5, linh_chi: 2 } },
    choang_thien: { fee: 380, mats: { da_soi: 7, linh_chi: 3, long_ga: 4 } },
    giay_thien: { fee: 380, mats: { da_soi: 6, linh_chi: 3, long_ga: 5 } }
  };
  // Chế tác trang sức ở tiệm Lý lão.
  var JEWEL_RECIPES = {
    tram_linh: { fee: 70, mats: { linh_chi: 1, da_soi: 2 } },
    vongco_huyen: { fee: 140, mats: { linh_chi: 3, da_soi: 3 } },
    vongtay_huyen: { fee: 140, mats: { linh_chi: 2, da_soi: 5 } },
    nhan_huyen_crit: { fee: 150, mats: { linh_chi: 3, da_soi: 2 } },
    tram_thien: { fee: 400, mats: { linh_chi: 5, da_soi: 4 } }
  };
  function recipeOf(id) { return RECIPES[id] || JEWEL_RECIPES[id] || null; }
  // Bảng rơi theo loài (cùng thang tỉ lệ rơi vũ khí cùng phẩm).
  var DROPS = {
    ga_rung: [{ id: 'giay_pham', chance: 0.03 }, { id: 'dai_pham', chance: 0.03 }],
    tho_hoang: [],
    soi_con: [{ id: 'giap_pham', chance: 0.04 }, { id: 'baotay_pham', chance: 0.04 }, { id: 'mu_pham', chance: 0.03 }],
    lon_rung: [{ id: 'dai_pham', chance: 0.04 }, { id: 'giay_pham', chance: 0.04 }, { id: 'choang_pham', chance: 0.03 }],
    soi_rung: [{ id: 'giap_linh', chance: 0.04 }, { id: 'giay_linh', chance: 0.04 }, { id: 'mu_linh', chance: 0.03 }, { id: 'vongtay_linh', chance: 0.03 }],
    lon_mong_sat: [{ id: 'giap_huyen', chance: 0.03 }, { id: 'baotay_huyen', chance: 0.03 }, { id: 'choang_huyen', chance: 0.02 }, { id: 'tram_huyen', chance: 0.02 }],
    ran_luc: [{ id: 'tram_linh', chance: 0.05 }, { id: 'vongco_linh', chance: 0.04 }],
    khi_mat_do: [{ id: 'vongco_linh', chance: 0.04 }, { id: 'nhan_linh_speed', chance: 0.03 }],
    son_quan: [{ id: 'giap_dia', chance: 0.12 }, { id: 'dai_dia', chance: 0.12 }, { id: 'choang_dia', chance: 0.1 }, { id: 'baotay_dia', chance: 0.1 }, { id: 'nhan_dia_crit', chance: 0.08 }]
  };
  // ---------- Trạng thái trên nhân vật ----------
  function isGearId(id) { return !!GEAR[id]; }
  function gearDef(id) { return GEAR[id] || null; }
  function isGearEntry(it) { return !!(it && it.g && GEAR[it.id]); }
  function emptySlots() {
    return { mu: null, giap: null, choang: null, dai: null, baotay: null, giay: null, tram: null, vongco: null, vongtay: null, nhan: [null, null] };
  }
  function findEntry(ch, uid) {
    if (!ch || !Array.isArray(ch.inventory)) return null;
    for (var i = 0; i < ch.inventory.length; i++)
      if (isGearEntry(ch.inventory[i]) && ch.inventory[i].uid === uid) return ch.inventory[i];
    return null;
  }
  // Khởi tạo lười + DI TRÚ save cũ: bảo đảm cấu trúc gearSlots hợp lệ.
  // Ô nào trỏ tới uid không còn trong túi, hoặc món ở ô không khớp loại
  // ô (save lỗi/sửa tay), thì DỌN Ô — món (nếu còn) nằm nguyên trong
  // túi, không mất đồ. Hai nhẫn trùng uid/trùng dòng: giữ nhẫn đầu,
  // tháo nhẫn sau về túi.
  function ensureGear(ch) {
    if (!ch) return ch;
    if (!Array.isArray(ch.inventory)) ch.inventory = [];
    if (typeof ch.gseq !== 'number' || isNaN(ch.gseq)) ch.gseq = 0;
    if (!ch.gearSlots || typeof ch.gearSlots !== 'object') ch.gearSlots = emptySlots();
    var gs = ch.gearSlots;
    SLOT_KEYS.forEach(function (k) { if (typeof gs[k] === 'undefined') gs[k] = null; });
    if (!Array.isArray(gs.nhan)) gs.nhan = [null, null];
    while (gs.nhan.length < 2) gs.nhan.push(null);
    gs.nhan.length = 2;
    SLOT_KEYS.forEach(function (k) {
      if (gs[k] === null || typeof gs[k] === 'undefined') { gs[k] = null; return; }
      var e = findEntry(ch, gs[k]);
      if (!e || GEAR[e.id].slot !== k) gs[k] = null;
    });
    var seenUid = {}, seenKey = {};
    for (var i = 0; i < 2; i++) {
      var uid = gs.nhan[i];
      if (uid === null || typeof uid === 'undefined') { gs.nhan[i] = null; continue; }
      var re = findEntry(ch, uid);
      if (!re || GEAR[re.id].slot !== 'nhan' || seenUid[uid] || seenKey[GEAR[re.id].ringKey]) { gs.nhan[i] = null; continue; }
      seenUid[uid] = 1; seenKey[GEAR[re.id].ringKey] = 1;
    }
    return ch;
  }
  function addGear(ch, defId) {
    if (!GEAR[defId]) return null;
    ensureGear(ch);
    ch.gseq += 1;
    var entry = { id: defId, count: 1, uid: ch.gseq, g: 1 };
    ch.inventory.push(entry);
    return entry;
  }
  function gearEntries(ch) {
    return (ch && Array.isArray(ch.inventory)) ? ch.inventory.filter(isGearEntry) : [];
  }
  // Ô đang giữ uid: { slot: 'giap' } hoặc { slot: 'nhan', ring: 0|1 }.
  function slotOf(ch, uid) {
    if (!ch || !ch.gearSlots) return null;
    var gs = ch.gearSlots;
    for (var i = 0; i < SLOT_KEYS.length; i++) if (gs[SLOT_KEYS[i]] === uid) return { slot: SLOT_KEYS[i], ring: -1 };
    if (Array.isArray(gs.nhan)) for (var j = 0; j < 2; j++) if (gs.nhan[j] === uid) return { slot: 'nhan', ring: j };
    return null;
  }
  function equippedEntryAt(ch, slot, ring) {
    ensureGear(ch);
    var uid = slot === 'nhan' ? ch.gearSlots.nhan[ring || 0] : ch.gearSlots[slot];
    return (uid === null || typeof uid === 'undefined') ? null : findEntry(ch, uid);
  }
  // Def đã HIỆU CHỈNH theo người đeo: trâm/nhẫn hệ mang elemPct — hệ
  // cộng hưởng theo LINH CĂN CỦA NGƯỜI ĐEO (ch.root); chưa lộ linh căn
  // thì dòng hệ chưa phát huy (chỉ còn dòng phụ nếu có).
  function resolveDef(ch, def) {
    if (!def) return null;
    if (typeof def.elemPct !== 'number') return def;
    var clone = {};
    for (var k in def) clone[k] = def[k];
    var st = {};
    if (def.stats) for (var k2 in def.stats) st[k2] = def.stats[k2];
    if (ch && ch.root) { st.elem = {}; st.elem[ch.root] = def.elemPct; }
    clone.stats = st;
    return clone;
  }
  function equippedDefAt(ch, slot, ring) {
    var e = equippedEntryAt(ch, slot, ring);
    return e ? resolveDef(ch, GEAR[e.id]) : null;
  }
  // Mọi def gear đang đeo (11 ô) — Logic.gearBlocks cộng khối stats.
  function equippedDefs(ch) {
    if (!ch) return [];
    ensureGear(ch);
    var out = [];
    SLOT_KEYS.forEach(function (k) {
      var d = equippedDefAt(ch, k);
      if (d) out.push(d);
    });
    for (var i = 0; i < 2; i++) {
      var rd = equippedDefAt(ch, 'nhan', i);
      if (rd) out.push(rd);
    }
    return out;
  }
  // ---------- Đeo / tháo ----------
  function realmRankOf(ch) {
    var MP = null;
    if (typeof window !== 'undefined' && window.PNT_MAPS) MP = window.PNT_MAPS;
    else if (typeof globalThis !== 'undefined' && globalThis.PNT_MAPS) MP = globalThis.PNT_MAPS;
    if (MP && typeof MP.realmRankOf === 'function') return MP.realmRankOf(ch);
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    if (ch.realm) {
      var names = ['Phàm Nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Độ Kiếp'];
      for (var i = names.length - 1; i >= 0; i--) if (ch.realm.indexOf(names[i]) === 0) return i;
    }
    return (ch.tier || 0) > 0 ? 1 : 0;
  }
  function realmName(rank) { return REALM_NAMES[rank] || ('Cảnh giới ' + rank); }
  function canEquip(ch, uid) {
    ensureGear(ch);
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = GEAR[e.id];
    if ((ch.tier || 0) < def.reqTier) return { ok: false, reason: 'tier', def: def };
    if (def.reqRealm && realmRankOf(ch) < def.reqRealm) return { ok: false, reason: 'realm', def: def };
    if (def.slot === 'nhan') {
      for (var i = 0; i < 2; i++) {
        var oUid = ch.gearSlots.nhan[i];
        if (oUid === uid) return { ok: true, def: def, slot: 'nhan', ring: i };
        if (oUid !== null && typeof oUid !== 'undefined') {
          var oE = findEntry(ch, oUid);
          if (oE && GEAR[oE.id].ringKey === def.ringKey) return { ok: false, reason: 'dup_ring_key', def: def };
        }
      }
    }
    return { ok: true, def: def };
  }
  function equip(ch, uid) {
    var chk = canEquip(ch, uid);
    if (!chk.ok) return chk;
    var def = chk.def;
    var cur = slotOf(ch, uid);
    if (cur) return { ok: true, def: def, slot: cur.slot, ring: cur.ring, already: true };
    if (def.slot === 'nhan') {
      var gs = ch.gearSlots;
      for (var i = 0; i < 2; i++) {
        if (gs.nhan[i] === null || typeof gs.nhan[i] === 'undefined') {
          gs.nhan[i] = uid;
          return { ok: true, def: def, slot: 'nhan', ring: i };
        }
      }
      return { ok: false, reason: 'full', def: def };
    }
    ch.gearSlots[def.slot] = uid;
    return { ok: true, def: def, slot: def.slot, ring: -1 };
  }
  function unequip(ch, uid) {
    ensureGear(ch);
    var cur = slotOf(ch, uid);
    if (!cur) return { ok: false, reason: 'not_equipped' };
    if (cur.slot === 'nhan') ch.gearSlots.nhan[cur.ring] = null;
    else ch.gearSlots[cur.slot] = null;
    var e = findEntry(ch, uid);
    return { ok: true, def: e ? GEAR[e.id] : null, slot: cur.slot, ring: cur.ring };
  }
  function unequipSlot(ch, slot, ring) {
    var e = equippedEntryAt(ch, slot, ring);
    if (!e) return { ok: false, reason: 'empty' };
    return unequip(ch, e.uid);
  }
  // ---------- Chỉ số: hiển thị + so sánh (dùng chung nhãn với weapons) ----------
  var STAT_LABELS = {
    hp: 'Máu tối đa', def: 'Giáp', crit: 'Tỉ lệ chí mạng', critDmg: 'Sát thương chí mạng',
    lifesteal: 'Hút máu', ll: 'Linh lực tối đa', llRegen: 'Hồi linh lực', speed: 'Tốc độ di chuyển'
  };
  var STAT_SUFFIX = { hp: '', def: '', crit: '%', critDmg: '%', lifesteal: '%', ll: '', llRegen: '/giây', speed: '%' };
  var STAT_ORDER = ['hp', 'def', 'crit', 'critDmg', 'lifesteal', 'll', 'llRegen', 'speed', 'elem'];
  var ELEM_NAMES = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ', phong: 'Phong', loi: 'Lôi', bang: 'Băng' };
  function statLines(def, ch) {
    var d = ch ? resolveDef(ch, def) : def;
    var out = [];
    if (!d) return out;
    var s = d.stats || {};
    STAT_ORDER.forEach(function (k) {
      if (k === 'elem') {
        if (s.elem) Object.keys(s.elem).forEach(function (e) {
          out.push('Sát thương hệ ' + (ELEM_NAMES[e] || e) + ' +' + s.elem[e] + '%');
        });
        else if (typeof d.elemPct === 'number') out.push('Sát thương hệ linh căn +' + d.elemPct + '% (theo hệ của bạn)');
      } else if (s[k]) out.push(STAT_LABELS[k] + ' +' + s[k] + (STAT_SUFFIX[k] || ''));
    });
    return out;
  }
  function compareLines(ch, def) {
    var mine = ch ? resolveDef(ch, def) : def;
    var out = [];
    function curStats() {
      if (def.slot === 'nhan') {
        var acc = {};
        [0, 1].forEach(function (i) {
          var d = equippedDefAt(ch, 'nhan', i);
          if (d && d.stats) Object.keys(d.stats).forEach(function (k) {
            if (k === 'elem') { acc.elem = acc.elem || {}; Object.keys(d.stats.elem).forEach(function (e) { acc.elem[e] = (acc.elem[e] || 0) + d.stats.elem[e]; }); }
            else acc[k] = (acc[k] || 0) + d.stats[k];
          });
        });
        return acc;
      }
      var cd = equippedDefAt(ch, def.slot);
      return (cd && cd.stats) || {};
    }
    var cs = curStats(), ns = (mine && mine.stats) || {};
    STAT_ORDER.forEach(function (k) {
      if (k === 'elem') {
        var ce = cs.elem || {}, ne = ns.elem || {};
        var keys = {};
        Object.keys(ce).forEach(function (e) { keys[e] = 1; });
        Object.keys(ne).forEach(function (e) { keys[e] = 1; });
        Object.keys(keys).forEach(function (e) {
          var dv = (ne[e] || 0) - (ce[e] || 0);
          out.push('Sát thương hệ ' + (ELEM_NAMES[e] || e) + ': ' + (dv > 0 ? '+' + dv : (dv < 0 ? '' + dv : '±0')) + '%');
        });
      } else {
        var cv = cs[k] || 0, nv = ns[k] || 0;
        if (cv || nv) {
          var d = Math.round((nv - cv) * 100) / 100;
          out.push(STAT_LABELS[k] + ': ' + (d > 0 ? '+' + d : (d < 0 ? '' + d : '±0')) + (STAT_SUFFIX[k] || ''));
        }
      }
    });
    return out;
  }
  // ---------- Mua / bán / chế tạo ----------
  function itemCount(ch, itemId) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === itemId && !it.w && !it.a && !it.g) n += it.count; });
    return n;
  }
  function takeItems(ch, itemId, n) {
    for (var i = ch.inventory.length - 1; i >= 0 && n > 0; i--) {
      var it = ch.inventory[i];
      if (it.id !== itemId || it.w || it.a || it.g) continue;
      var take = Math.min(it.count, n);
      it.count -= take; n -= take;
      if (it.count <= 0) ch.inventory.splice(i, 1);
    }
    return n <= 0;
  }
  function buyGear(ch, defId, priceOverride) {
    var def = GEAR[defId];
    if (!def || def.price <= 0) return { ok: false, reason: 'not_sold' };
    ensureGear(ch);
    var price = def.price;
    if (typeof priceOverride === 'number' && priceOverride >= Math.floor(def.price * 0.9) && priceOverride <= def.price) price = priceOverride;
    if ((ch.linhThach || 0) < price) return { ok: false, reason: 'linhThach' };
    ch.linhThach -= price;
    var e = addGear(ch, defId);
    return { ok: true, entry: e, def: def };
  }
  function sellGear(ch, uid) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = GEAR[e.id];
    if (def && def.noSell) return { ok: false, reason: 'nosell', def: def };
    var cur = slotOf(ch, uid);
    if (cur) unequip(ch, uid); // bán món đang đeo: tự tháo trước (như vũ khí)
    ch.inventory.splice(ch.inventory.indexOf(e), 1);
    var gained = def.value;
    var AC = (typeof globalThis !== 'undefined') ? globalThis.PNT_ANTICHEAT : null;
    if (AC && typeof AC.guardGain === 'function') gained = AC.guardGain('sell', gained);
    ch.linhThach = (ch.linhThach || 0) + gained;
    return { ok: true, def: def, gained: gained };
  }
  function canCraft(ch, defId) {
    var r = recipeOf(defId);
    if (!r) return { ok: false, reason: 'no_recipe' };
    if ((ch.linhThach || 0) < r.fee) return { ok: false, reason: 'linhThach', recipe: r };
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
    var e = addGear(ch, defId);
    return { ok: true, entry: e, def: GEAR[defId], recipe: r };
  }
  function rollDrop(type, rng, allowMulti) {
    var table = DROPS[type] || [];
    var rand = rng || Math.random;
    var out = [];
    for (var i = 0; i < table.length; i++) {
      if (rand() < table[i].chance) {
        out.push(table[i].id);
        if (!allowMulti) break;
      }
    }
    return out;
  }
  // ---------- Icon: lưới 16x16 theo loại, màu theo phẩm ----------
  var GRIDS = {
    mu: [
      '................',
      '................',
      '......oooo......',
      '.....obBBbo.....',
      '....obBBBBbo....',
      '...obBBBBBBbo...',
      '..obBBBBBBBBbo..',
      '.gggbbbbbbbbggg.',
      'gggggggggggggggg',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ],
    giap: [
      '................',
      '...gg......gg...',
      '..gbbg....gbbg..',
      '..bbbb....bbbb..',
      '...bbbbbbbbbb...',
      '...bBBbbbbBBb...',
      '...bBboooobBb...',
      '...bbbbooobbb...',
      '...bbbbbbbbbb...',
      '...dbbbbbbbbd...',
      '...dbbggggbbd...',
      '...dbbbbbbbbd...',
      '....bbbbbbbb....',
      '....dddddddd....',
      '................',
      '................'
    ],
    choang: [
      '................',
      '.....gggggg.....',
      '....gbbbbbbg....',
      '...bbbbbbbbbb...',
      '...bBBBBBBBBb...',
      '...bBbbbbbbBb...',
      '..bb.bbbbb..bb..',
      '..bb.bbbb...bb..',
      '..b..bbbb...b...',
      '..b..bbbb...b...',
      '.....bbbb.......',
      '.....bbbb.......',
      '.....b..b.......',
      '.....d..d.......',
      '................',
      '................'
    ],
    dai: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '.bbbbbbbbbbbbbb.',
      '.bbbggggggggbbb.',
      '.bbbgooooogbbb..',
      '.bbbgooooogbbb..',
      '.bbbggggggggbbb.',
      '.bbbbbbbbbbbbbb.',
      '................',
      '................',
      '................',
      '................'
    ],
    baotay: [
      '................',
      '................',
      '.....b..b..b....',
      '.....b..b..b....',
      '.....bb.bb.b....',
      '....bbbbbbb.....',
      '....bBBBBBb.....',
      '....bBBBBBb..b..',
      '....bBBBBBbb....',
      '....bBBBBBb.....',
      '....bbbbbbb.....',
      '....ggggggg.....',
      '....ddddddd.....',
      '................',
      '................',
      '................'
    ],
    giay: [
      '................',
      '................',
      '................',
      '......bb........',
      '......bb........',
      '......bbb.......',
      '......bbbb......',
      '.....bbbbb......',
      '.....bbbbbb.....',
      '....bbbbbbbb....',
      '...bbbbbbbbbb...',
      '..bbbbbbbbbbbb..',
      '..gggggggggggg..',
      '..dddddddddddd..',
      '................',
      '................'
    ],
    tram: [
      '.......oo.......',
      '......oBBo......',
      '......oooo......',
      '.......gg.......',
      '........g.......',
      '.........g......',
      '..........g.....',
      '...........g....',
      '............g...',
      '.............g..',
      '..............g.',
      '...............g',
      '................',
      '................',
      '................',
      '................'
    ],
    vongco: [
      '................',
      '....g......g....',
      '...g........g...',
      '..g..........g..',
      '..g..........g..',
      '...g........g...',
      '....g..oo..g....',
      '.....goBBog.....',
      '......oBBo......',
      '.......oo.......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'
    ],
    vongtay: [
      '................',
      '................',
      '.....bbbbbb.....',
      '....b......b....',
      '...b........b...',
      '...b...oo...b...',
      '...b..oBBo..b...',
      '...b...oo...b...',
      '...b........b...',
      '....b......b....',
      '.....bbbbbb.....',
      '................',
      '................',
      '................',
      '................',
      '................'
    ],
    nhan: [
      '................',
      '................',
      '................',
      '.....oooo.......',
      '....oBBBBo......',
      '....oooooo......',
      '....bb..bb......',
      '...b......b.....',
      '...b......b.....',
      '....b....b......',
      '....bb..bb......',
      '.....bbbb.......',
      '................',
      '................',
      '................',
      '................'
    ]
  };
  function gridPixels(grid, palette) {
    return grid.map(function (row) {
      return row.split('').map(function (ch) { return palette[ch] || null; });
    });
  }
  function iconPixels(def) { return gridPixels(GRIDS[def.slot], paletteFor(def.grade)); }
  function drawPixels(ctx, px, x, y, scale) {
    for (var r = 0; r < px.length; r++)
      for (var c = 0; c < px[r].length; c++)
        if (px[r][c]) { ctx.fillStyle = px[r][c]; ctx.fillRect(x + c * scale, y + r * scale, scale, scale); }
  }
  function drawIcon(ctx, def, x, y, scale) {
    if (!def || !ctx) return;
    drawPixels(ctx, iconPixels(def), x, y, scale);
  }
  var api = {
    GEAR_CRIT_CAP: GEAR_CRIT_CAP,
    GRADES: GRADES, GRADE_ORDER: GRADE_ORDER, SLOTS: SLOTS, SLOT_KEYS: SLOT_KEYS,
    GEAR: GEAR, SHOP_FORGE: SHOP_FORGE, SHOP_JEWEL: SHOP_JEWEL,
    RECIPES: RECIPES, JEWEL_RECIPES: JEWEL_RECIPES, DROPS: DROPS,
    paletteFor: paletteFor,
    isGearId: isGearId, gearDef: gearDef, isGearEntry: isGearEntry,
    ensureGear: ensureGear, addGear: addGear, findEntry: findEntry, gearEntries: gearEntries,
    slotOf: slotOf, equippedEntryAt: equippedEntryAt, equippedDefAt: equippedDefAt, equippedDefs: equippedDefs,
    resolveDef: resolveDef, realmRankOf: realmRankOf, realmName: realmName,
    canEquip: canEquip, equip: equip, unequip: unequip, unequipSlot: unequipSlot,
    STAT_LABELS: STAT_LABELS, STAT_SUFFIX: STAT_SUFFIX, STAT_ORDER: STAT_ORDER, ELEM_NAMES: ELEM_NAMES,
    statLines: statLines, compareLines: compareLines,
    sellPrice: function (def) { return def.value; },
    buyGear: buyGear, sellGear: sellGear, itemCount: itemCount,
    recipeOf: recipeOf, canCraft: canCraft, craft: craft, rollDrop: rollDrop,
    GRIDS: GRIDS, iconPixels: iconPixels, drawPixels: drawPixels, drawIcon: drawIcon
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_GEAR = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_GEAR = api;
})();
