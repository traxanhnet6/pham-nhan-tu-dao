// ============================================================
// HỆ THỐNG BÍ CẢNH (lệnh Bui 20:49 ngày 2026-10-29) — module ĐỘC LẬP:
//   1) BÍ CẢNH ĐỊNH KỲ "Liệt Khích Phong Ấn" (tên ĐỀ XUẤT): khe nứt của
//      phong ấn Thanh Khê lão nhân dưới giếng cổ Thanh Khê. Mở theo LỊCH
//      GIỜ THẬT của máy người chơi (game offline nên dùng đồng hồ địa
//      phương — lựa chọn này ghi rõ trong báo cáo): 4 phiên/ngày lúc
//      07:00, 12:00, 17:00, 21:00, mỗi phiên 25 phút. Cổng (khe nứt phát
//      sáng) xuất hiện cạnh giếng cổ ở map 1 khi phiên mở; vào giới hạn
//      1 lượt/phiên, tối đa 2 lượt/ngày; hết giờ bị đẩy ra. Bên trong có
//      quái mạnh + boss bí cảnh "Khích Linh Cự Thú"; hạ boss nhận thưởng
//      hoàn thành lớn (Linh Thạch, tu vi, dược quý, tỉ lệ đồ Địa/Thiên qua
//      đúng phẩm của hệ vũ khí/pháp khí hiện có).
//   2) BÍ CẢNH KỲ NGỘ: ngẫu nhiên HIẾM khi hạ quái hoang dã (2%) hoặc
//      hái dược (5%) ngoài trời, chỉ sau khi đã lộ linh căn; chống spam
//      tối thiểu 10 phút giữa 2 lần mời. Mời hiện panel Vào ngay / Bỏ
//      qua (bỏ là mất, mời hết hạn sau 60 giây). Instance cá nhân MỘT
//      LẦN theo 1 trong 3 mẫu truyện (tàn phủ Thanh Khê lão nhân / linh
//      điền hoang / hang yêu bỏ hoang): dọn sạch quái gác là nhận
//      thưởng theo bảng của mẫu, ra là không vào lại được.
// Trạng thái (lượt vào, cooldown, phiên đang chạy, lời mời) nằm trong
// flags.sr của save (L.serialize mang theo nguyên vẹn) — save cũ không
// có trường này thì ensure() khởi tạo lười, không phá save cũ.
// Module này TỰ đăng ký 2 map instance vào PNT_MAPS.MAPS ngay khi nạp
// (nạp TRƯỚC game.js): 'realm_dinh_ky' và 'realm_ky_ngo'. Hai map dùng
// bg không tồn tại nên engine tự rơi về vẽ bằng ô tile (không cần ảnh
// nền AI) — không đụng id map4/map5 của các team khác.
// Mọi hàm thời gian nhận `now` (ms) để test giả lập được; game.js
// truyền Date.now().
// ============================================================
(function (global) {
  'use strict';
  var L = null, M = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { M = require('./maps.js'); } catch (e) { M = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    M = global.PNT_MAPS || null;
  }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }

  // ---------- Hằng số thiết kế ----------
  var SCHEDULED = {
    id: 'liet_khach',
    name: 'Liệt Khích Phong Ấn',
    mapId: 'realm_dinh_ky',
    sessions: [7 * 60, 12 * 60, 17 * 60, 21 * 60], // phút từ 00:00 giờ địa phương
    durationMin: 25,
    maxPerSession: 1,
    maxPerDay: 2,
    gateMap: 'map1',
    gate: { x: 33, y: 15 }, // ô sân đá ngay cạnh giếng cổ (31,15) ở Thanh Khê trấn — V10: + offset map (12,8)
    bossSpawn: { x: 12, y: 3 },
    bossType: 'lon_mong_sat',
    bossName: 'Khích Linh Cự Thú',
    bossHp: 340, bossAtk: 19,
    intro: 'Phong ấn dưới giếng cổ lại nứt thêm một khe. Linh khí xoáy thành hình thú dữ canh giữ tàn tích — hạ nó trước khi khe khép lại!',
    rewards: [
      { kind: 'linhThach', n: 100, chance: 1 },
      { kind: 'tuvi', n: 60, chance: 1 },
      { kind: 'item', id: 'linh_chi', n: 2, chance: 1 },
      { kind: 'item', id: 'thit_son_quan', n: 1, chance: 1 },
      { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.5 },
      { kind: 'weapon', grade: 'dia', chance: 0.35 },
      { kind: 'artifact', grade: 'dia', chance: 0.25 },
      { kind: 'weapon', grade: 'thien', chance: 0.08 }
    ]
  };
  var FATE = {
    mapId: 'realm_ky_ngo',
    chanceKill: 0.02,
    chanceGather: 0.05,
    minGapMs: 10 * 60 * 1000,   // tối thiểu giữa 2 lần mời (chống spam)
    offerTtlMs: 60 * 1000,      // lời mời sống 60 giây
    runLimitMs: 10 * 60 * 1000, // trần thời gian trong instance kỳ ngộ
    templates: [
      {
        id: 'tan_phu',
        name: 'Tàn Phủ Thanh Khê',
        story: 'Dưới rễ cây cổ thụ hé ra một cửa đá phủ rêu — tàn tích động phủ năm xưa Thanh Khê lão nhân từng ngồi tham ngộ trước khi phong ấn linh nhãn. Quái thú đã chiếm làm ổ.',
        spawns: [
          { type: 'soi_rung', x: 10, y: 7 }, { type: 'soi_rung', x: 10, y: 5 },
          { type: 'lon_mong_sat', x: 16, y: 7 }
        ],
        rewards: [
          { kind: 'tuvi', n: 80, chance: 1 },
          { kind: 'linhThach', n: 40, chance: 1 },
          { kind: 'item', id: 'linh_chi', n: 2, chance: 1 },
          { kind: 'artifact', grade: 'huyen', chance: 0.4 },
          { kind: 'item', id: 'bt_gen_phi_hoa', n: 1, chance: 0.3 },
          { kind: 'item', id: 'bt_rare_van_kiem', n: 1, chance: 0.03 }
        ]
      },
      {
        id: 'linh_dien',
        name: 'Linh Điền Hoang',
        story: 'Một mảnh linh điền bị bỏ hoang sau màn sương mỏng — linh chi mọc dại không ai hái, chỉ có thú hoang lảng vảng canh giữ.',
        spawns: [
          { type: 'ga_rung', x: 10, y: 7 }, { type: 'ga_rung', x: 10, y: 9 },
          { type: 'khi_mat_do', x: 16, y: 7 }, { type: 'khi_mat_do', x: 16, y: 5 }
        ],
        rewards: [
          { kind: 'item', id: 'linh_chi', n: 3, chance: 1 },
          { kind: 'item', id: 'thao_duoc', n: 3, chance: 1 },
          { kind: 'linhThach', n: 30, chance: 1 },
          { kind: 'tuvi', n: 40, chance: 1 },
          { kind: 'item', id: 'bt_rare_hoi_xuan', n: 1, chance: 0.05 }
        ]
      },
      {
        id: 'yeu_huyet',
        name: 'Hang Yêu Bỏ Hoang',
        story: 'Hang yêu thú bỏ hoang sau triền đá — bầy cũ đã dời đi, chỉ còn vài con ở lại giữ kho thịt khô và chiến lợi phẩm của thợ săn xấu số.',
        spawns: [
          { type: 'soi_rung', x: 10, y: 7 }, { type: 'lon_mong_sat', x: 10, y: 9 },
          { type: 'lon_mong_sat', x: 16, y: 7 }
        ],
        rewards: [
          { kind: 'weapon', grade: 'huyen', chance: 0.5 },
          { kind: 'linhThach', n: 50, chance: 1 },
          { kind: 'tuvi', n: 50, chance: 1 },
          { kind: 'item', id: 'thit_lon', n: 1, chance: 1 },
          { kind: 'item', id: 'bt_gen_luu_sa', n: 1, chance: 0.25 }
        ]
      }
    ]
  };
  function templateById(id) {
    for (var i = 0; i < FATE.templates.length; i++) if (FATE.templates[i].id === id) return FATE.templates[i];
    return null;
  }

  // ---------- 2 map instance (dùng lại hệ map: tiles/blocked/portals) --
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
  var BLOCKED = { W: true, H: true, T: true, S: true, L: true, F: true, o: true, E: true, R: true };
  // Bí cảnh định kỳ 24x18: hang đá dưới giếng — sân đá bắc là ổ của boss,
  // đường lát đá từ cửa nam lên, hai hốc phụ có hồ linh khí + linh chi.
  var rowsD = grid(24, 18, 'W');
  rect(rowsD, 1, 1, 22, 16, '.');
  rect(rowsD, 8, 2, 15, 5, 'Q');            // đài phong ấn (ổ boss)
  rect(rowsD, 11, 5, 12, 15, '#');          // đường lát đá lên đài
  rect(rowsD, 2, 2, 4, 4, 'R');             // hồ linh khí tây
  rect(rowsD, 19, 12, 21, 14, 'R');         // hồ linh khí đông nam
  rect(rowsD, 5, 12, 6, 13, 'o'); rect(rowsD, 17, 6, 18, 7, 'o'); // đá tảng trang trí/chắn
  var REALM_DK = {
    id: 'realm_dinh_ky', name: 'Liệt Khích Phong Ấn', instance: true,
    bg: 'assets/realm-dinh-ky-bg.png', w: 24, h: 18, tiles: rowsD, blocked: BLOCKED,
    start: { x: 12, y: 15 }, exit: { x: 12, y: 16 },
    portals: [], npcs: [],
    zones: [{ id: 'liet_khach', name: 'Liệt Khích Phong Ấn', x0: 0, y0: 0, x1: 23, y1: 17 }],
    monsters: [
      { type: 'soi_rung', x: 8, y: 10 }, { type: 'soi_rung', x: 16, y: 10 },
      { type: 'lon_mong_sat', x: 10, y: 7 }, { type: 'khi_mat_do', x: 14, y: 7 }
    ],
    herbs: [{ x: 5, y: 4, item: 'linh_chi' }, { x: 18, y: 4, item: 'linh_chi' }],
    props: [{ x: 12, y: 13, sprite: 'sign', label: 'Liệt Khích' }, { x: 6, y: 15, sprite: 'rock' }, { x: 17, y: 15, sprite: 'rock' }]
  };
  // Bí cảnh kỳ ngộ 20x15: ba khoang nối nhau bằng hành lang hàng 7 —
  // khoang vào (tây), khoang gác (giữa), khoang báu vật (đông, nền đá).
  var rowsK = grid(20, 15, 'W');
  rect(rowsK, 1, 3, 6, 11, '.');
  rect(rowsK, 8, 3, 12, 11, '.');
  rect(rowsK, 14, 3, 18, 11, 'Q');
  rect(rowsK, 6, 7, 8, 7, '.'); rect(rowsK, 12, 7, 14, 7, '.'); // hành lang nối
  rect(rowsK, 2, 3, 3, 4, 'o');
  var REALM_KN = {
    id: 'realm_ky_ngo', name: 'Kỳ Ngộ Bí Cảnh', instance: true,
    bg: 'assets/realm-ky-ngo-bg.png', w: 20, h: 15, tiles: rowsK, blocked: BLOCKED,
    start: { x: 3, y: 7 }, exit: { x: 2, y: 7 },
    portals: [], npcs: [],
    zones: [{ id: 'ky_ngo', name: 'Kỳ Ngộ Bí Cảnh', x0: 0, y0: 0, x1: 19, y1: 14 }],
    monsters: [],
    herbs: [{ x: 17, y: 11, item: 'linh_chi' }],
    props: [{ x: 17, y: 3, sprite: 'sacks', label: 'Rương cổ' }, { x: 3, y: 5, sprite: 'sign', label: 'Kỳ ngộ' }]
  };
  var MAP_DUOC_COC = {
    id: "realm_duoc_coc", name: "Linh Dược Bí Cốc", instance: true,
    bg: "assets/realm-duoc-coc-bg.png", w: 40, h: 30, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W......................................W",
      "W..............QQQQQQQQQQQ.............W",
      "W..TTT.........QQQQQQQQQQQ........TTT..W",
      "W..TTT.........QQQQQQQQQQQ........TTT..W",
      "W..TTT.........QQQQQQQQQQQRRRR.........W",
      "W..............QQQQQQQQQQQRRRR.........W",
      "W..............QQQQQQQQQQQRRRR.........W",
      "W..............QQQQQQQQQQQ.............W",
      "W..............QQQQQQQQQQQ.....RRRR....W",
      "W..................###.........RRRR....W",
      "W..................###.........RRRR....W",
      "W..................###.................W",
      "W..................###.................W",
      "W.####################################.W",
      "W.####################################.W",
      "W.####################################.W",
      "W..................###.................W",
      "W.......oo.........###........oo.......W",
      "W.......oo.........###........oo.......W",
      "W..................###.................W",
      "W..................###.................W",
      "W..TTT.............###.............TTT.W",
      "W..TTT.............###.............TTT.W",
      "W..TTT.............###.............TTT.W",
      "W..................###.................W",
      "W..................###.................W",
      "W..................###.................W",
      "W......................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":20,"y":26}, exit: {"x":20,"y":27},
    portals: [], npcs: [],
    zones: [{"id":"duoc_dien","name":"Dược Điền Tây","x0":1,"y0":1,"x1":18,"y1":13},{"id":"linh_ho","name":"Hồ Linh Đông","x0":21,"y0":1,"x1":38,"y1":13},{"id":"coc_tam","name":"Cốc Tâm","x0":14,"y0":1,"x1":26,"y1":10},{"id":"nam_duoc","name":"Dược Viên Nam","x0":1,"y0":16,"x1":38,"y1":28}],
    monsters: [{"type":"ga_rung","x":8,"y":8},{"type":"tho_hoang","x":12,"y":20},{"type":"soi_con","x":30,"y":20},{"type":"khi_mat_do","x":33,"y":6},{"type":"ga_rung","x":6,"y":24},{"type":"tho_hoang","x":28,"y":24},{"type":"soi_con","x":10,"y":5}],
    herbs: [{"x":6,"y":6,"item":"linh_chi"},{"x":9,"y":11,"item":"linh_chi"},{"x":13,"y":6,"item":"linh_chi"},{"x":24,"y":12,"item":"linh_chi"},{"x":36,"y":14,"item":"linh_chi"},{"x":17,"y":21,"item":"linh_chi"},{"x":7,"y":15,"item":"huyet_sam"},{"x":33,"y":16,"item":"huyet_sam"},{"x":12,"y":25,"item":"huyet_sam"},{"x":24,"y":6,"item":"huyet_sam"},{"x":15,"y":11,"item":"tu_linh_qua"},{"x":24,"y":20,"item":"tu_linh_qua"},{"x":5,"y":19,"item":"tu_linh_qua"},{"x":36,"y":25,"item":"tu_linh_qua"},{"x":28,"y":13,"item":"doc_tam_hoa"},{"x":10,"y":16,"item":"doc_tam_hoa"},{"x":34,"y":21,"item":"doc_tam_hoa"},{"x":18,"y":4,"item":"ngoc_tuy_chi"},{"x":22,"y":8,"item":"ngoc_tuy_chi"},{"x":8,"y":27,"item":"ngoc_tuy_chi"},{"x":31,"y":27,"item":"thanh_linh_tuy"},{"x":16,"y":14,"item":"thanh_linh_tuy"},{"x":20,"y":12,"item":"son_tinh"},{"x":4,"y":10,"item":"thanh_tam_thao"},{"x":37,"y":9,"item":"thanh_tam_thao"},{"x":21,"y":24,"item":"thanh_tam_thao"}],
    props: [{"x":20,"y":10,"sprite":"sign","label":"Linh Dược Bí Cốc"},{"x":18,"y":26,"sprite":"sign","label":"Cửa cốc"}]
  };
  var MAP_VAN_YEU = {
    id: "realm_van_yeu", name: "Vạn Yêu Sào", instance: true,
    bg: "assets/realm-van-yeu-bg.png", w: 40, h: 30, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W......................................W",
      "W..................###.................W",
      "W..TTTT............###...........TTTT..W",
      "W..TTTT...oo.......###...........TTTT..W",
      "W..TTTT...oo.......###...........TTTT..W",
      "W..................###.................W",
      "W..................###.................W",
      "W..................###.................W",
      "W..................###.................W",
      "W..................###.................W",
      "W...............QQQQQQQQQ..............W",
      "W...............QQQQQQQQQ..............W",
      "W...............QQQQQQQQQ..............W",
      "W.##############QQQQQQQQQ#############.W",
      "W.##############QQQQQQQQQ#############.W",
      "W.##############QQQQQQQQQ#############.W",
      "W...............QQQQQQQQQ..............W",
      "W...............QQQQQQQQQ..............W",
      "W...............QQQQQQQQQ..............W",
      "W..................###.................W",
      "W..................###.................W",
      "W..................###.................W",
      "W..........oo......###......oo.........W",
      "W..TTTT....oo......###......oo...TTTT..W",
      "W..TTTT............###...........TTTT..W",
      "W..TTTT............###...........TTTT..W",
      "W..................###.................W",
      "W......................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":20,"y":26}, exit: {"x":20,"y":27}, eliteChance: 0.3,
    portals: [], npcs: [],
    zones: [{"id":"sao_tay","name":"Sào Tây","x0":1,"y0":1,"x1":15,"y1":13},{"id":"sao_dong","name":"Sào Đông","x0":25,"y0":1,"x1":38,"y1":13},{"id":"dai_truong","name":"Đại Trường Vạn Yêu","x0":14,"y0":9,"x1":26,"y1":21},{"id":"cua_sao","name":"Cửa Sào Nam","x0":1,"y0":16,"x1":38,"y1":28}],
    monsters: [{"type":"soi_rung","x":10,"y":11},{"type":"soi_rung","x":29,"y":11},{"type":"lon_mong_sat","x":8,"y":20},{"type":"lon_mong_sat","x":31,"y":20},{"type":"khi_mat_do","x":20,"y":8},{"type":"ran_luc","x":5,"y":15},{"type":"ran_luc","x":34,"y":15},{"type":"soi_rung","x":15,"y":25}],
    herbs: [{"x":4,"y":8,"item":"huyet_sam"},{"x":35,"y":8,"item":"huyet_sam"},{"x":18,"y":24,"item":"linh_chi"},{"x":22,"y":24,"item":"linh_chi"}],
    props: [{"x":17,"y":26,"sprite":"sign","label":"Vạn Yêu Sào"},{"x":20,"y":12,"sprite":"sacks","label":"Ổ yêu vương"}]
  };
  var MAP_DONG_PHU = {
    id: "realm_dong_phu", name: "Cổ Tu Động Phủ", instance: true,
    bg: "assets/realm-dong-phu-bg.png", w: 36, h: 28, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..................................W",
      "W................###...............W",
      "W................###..QQQQQQQQQQQQ.W",
      "W..RRR...........###..QQQQQQQQQQQQ.W",
      "W..RRR.......oo..###..QQQQQQQQQQQQ.W",
      "W..RRR.......oo..###..QQQQQQQQQQQQ.W",
      "W................###..QQQQQQQQQQQQ.W",
      "W................###..QQQQQQQQQQQQ.W",
      "W................###..QQQQQQQQQQQQ.W",
      "W................###..QQQQQQQQQQQQ.W",
      "W................###..QQQQQQQQQQQQ.W",
      "W................###..QQQQQQQQQQQQ.W",
      "W.################################.W",
      "W.################################.W",
      "W.################################.W",
      "W................###...............W",
      "W................###...............W",
      "W................###...............W",
      "W................###...............W",
      "W................###...............W",
      "W..TTT...........###..........TTT..W",
      "W..TTT...........###..........TTT..W",
      "W..TTT...........###..........TTT..W",
      "W................###....oo.........W",
      "W................###....oo.........W",
      "W..................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":18,"y":24}, exit: {"x":18,"y":25},
    portals: [], npcs: [],
    zones: [{"id":"duoc_vien","name":"Dược Viên Cổ","x0":1,"y0":1,"x1":16,"y1":12},{"id":"dai_dien","name":"Đại Điện Động Phủ","x0":20,"y0":1,"x1":34,"y1":13},{"id":"tien_sanh","name":"Tiền Sảnh Nam","x0":1,"y0":15,"x1":34,"y1":26}],
    monsters: [{"type":"soi_rung","x":24,"y":18},{"type":"khi_mat_do","x":10,"y":18},{"type":"ran_luc","x":30,"y":16},{"type":"soi_rung","x":6,"y":10}],
    herbs: [{"x":6,"y":8,"item":"linh_chi"},{"x":10,"y":5,"item":"linh_chi"},{"x":13,"y":10,"item":"linh_chi"},{"x":8,"y":12,"item":"ngoc_tuy_chi"},{"x":14,"y":3,"item":"ngoc_tuy_chi"},{"x":5,"y":14,"item":"thanh_linh_tuy"},{"x":12,"y":8,"item":"thanh_linh_tuy"},{"x":9,"y":3,"item":"van_nien_linh_chi"},{"x":15,"y":12,"item":"van_nien_linh_chi"},{"x":4,"y":18,"item":"tinh_van_thach"},{"x":7,"y":20,"item":"huyet_sam"},{"x":28,"y":20,"item":"tu_linh_qua"}],
    props: [{"x":27,"y":20,"sprite":"sign","label":"Bia cổ động phủ"},{"x":31,"y":4,"sprite":"sacks","label":"Tàn thư các"},{"x":16,"y":24,"sprite":"sign","label":"Cổ Tu Động Phủ"}]
  };
  var MAP_VUON_DUOC = {
    id: "realm_vuon_duoc", name: "Vườn Dược Cổ", instance: true,
    bg: "assets/realm-vuon-duoc-bg.png", w: 48, h: 36, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..............................................W",
      "W..............................................W",
      "W.......................T..............RRRRR...W",
      "W......................................RRRRR...W",
      "W......................................RRRRR...W",
      "W...TTTTT..TTTTT.............T.TTTTTT..TTTTTT..W",
      "W..............................................W",
      "W......................#.......................W",
      "W...TT..TTTTTTTT..###########..TTTTTTTTTT..TT..W",
      "W................#############.................W",
      "W..............####....##...####......T........W",
      "W.............###...QQQQQQQ...###.....TTT......W",
      "W...TTT.......##..QQQQQRQQQQQ..##....TTTTT.....W",
      "W..TTTTT......##..QQQRRRRRQQQ..##....TTTTT.....W",
      "W..TTTTT.....####QQQRRRRRRRQQQ####...TTTTT.....W",
      "W..TTTTT......##..QQQRRRRRQQQ..##.....TTT......W",
      "W...TTT.......##..QQQQQRQQQQQ..##..............W",
      "W.T...........###...QQQQQQQ...###..........TTT.W",
      "W............T.####....Q....####...........TTT.W",
      "W................######.######.............TTT.W",
      "W...TTT..TTTTTTT..###########..TTTT..TTTTTTTT..W",
      "W......................##......................W",
      "W......................##......................W",
      "W...TTTTTTTT..TT.......##......TTTTTTTT..TTTT..W",
      "W......................##T.T...................W",
      "W...RRRRR..............##......................W",
      "W...RRRRR..............##......................W",
      "W...RRRRR..............##..T...................W",
      "W...RRRRR..............##......................W",
      "W......................##...TTT................W",
      "W.T....................##...TTT................W",
      "W...........................TTT............T...W",
      "W..............................................W",
      "W..............................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":24,"y":32}, exit: {"x":24,"y":33},
    portals: [], npcs: [],
    zones: [{"id":"vuon_tay_bac","name":"Vườn Tây Bắc","x0":1,"y0":1,"x1":19,"y1":14},{"id":"vuon_dong_bac","name":"Vườn Đông Bắc","x0":28,"y0":1,"x1":46,"y1":14},{"id":"vuon_tay_nam","name":"Vườn Tây Nam","x0":1,"y0":16,"x1":19,"y1":34},{"id":"vuon_dong_nam","name":"Vườn Đông Nam","x0":28,"y0":16,"x1":46,"y1":34},{"id":"gieng_co","name":"Giếng Cổ Linh Tuyền","x0":13,"y0":7,"x1":34,"y1":23}],
    monsters: [{"type":"ga_rung","x":8,"y":5},{"type":"tho_hoang","x":38,"y":5},{"type":"soi_con","x":9,"y":26},{"type":"ga_rung","x":38,"y":26},{"type":"tho_hoang","x":15,"y":15},{"type":"soi_con","x":32,"y":15},{"type":"ga_rung","x":23,"y":6},{"type":"tho_hoang","x":23,"y":25},{"type":"soi_con","x":10,"y":18},{"type":"ga_rung","x":36,"y":18},{"type":"tho_hoang","x":18,"y":9},{"type":"soi_con","x":29,"y":21}],
    herbs: [{"x":5,"y":4,"item":"thao_duoc"},{"x":8,"y":4,"item":"linh_chi"},{"x":12,"y":5,"item":"huyet_sam"},{"x":16,"y":7,"item":"thao_duoc"},{"x":6,"y":10,"item":"thanh_tam_thao"},{"x":11,"y":10,"item":"ngoc_tuy_chi"},{"x":15,"y":4,"item":"thanh_tam_thao"},{"x":9,"y":5,"item":"tu_linh_qua"},{"x":33,"y":4,"item":"linh_chi"},{"x":37,"y":5,"item":"thanh_tam_thao"},{"x":42,"y":2,"item":"thanh_tam_thao"},{"x":45,"y":7,"item":"linh_chi"},{"x":34,"y":10,"item":"linh_chi"},{"x":41,"y":10,"item":"linh_chi"},{"x":32,"y":5,"item":"linh_chi"},{"x":37,"y":10,"item":"thanh_tam_thao"},{"x":5,"y":20,"item":"tu_linh_qua"},{"x":9,"y":25,"item":"thanh_tam_thao"},{"x":12,"y":20,"item":"tu_linh_qua"},{"x":15,"y":27,"item":"huyet_sam"},{"x":10,"y":28,"item":"tu_linh_qua"},{"x":12,"y":26,"item":"ngoc_tuy_chi"},{"x":16,"y":23,"item":"linh_chi"},{"x":11,"y":30,"item":"tu_linh_qua"},{"x":33,"y":20,"item":"thao_duoc"},{"x":37,"y":25,"item":"linh_chi"},{"x":42,"y":20,"item":"huyet_sam"},{"x":44,"y":27,"item":"thao_duoc"},{"x":34,"y":28,"item":"thao_duoc"},{"x":40,"y":26,"item":"linh_chi"},{"x":45,"y":23,"item":"linh_chi"},{"x":38,"y":29,"item":"thanh_tam_thao"},{"x":23,"y":10,"item":"huyet_sam"},{"x":18,"y":13,"item":"tu_linh_qua"},{"x":28,"y":17,"item":"thao_duoc"},{"x":21,"y":20,"item":"thanh_tam_thao"}],
    props: [{"x":22,"y":32,"sprite":"sign","label":"Vườn Dược Cổ"}]
  };
  var MAP_SAO_YEU = {
    id: "realm_sao_yeu", name: "Độc Sào Yêu Huyệt", instance: true,
    bg: "assets/realm-sao-yeu-bg.png", w: 48, h: 36, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..............................................W",
      "W..QQQQQQQQQQ..................................W",
      "W..QQQQQQQQQQo.................................W",
      "W..QQQQQQQQQQ.o................................W",
      "W..QQQQQQQQQQ###############################...W",
      "W..QQQQQQQQQQ...o.........................##...W",
      "W.........................................##...W",
      "W.........................................##...W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW...##...W",
      "W.........................................##...W",
      "W.........................................##...W",
      "W.............................RRRR........##...W",
      "W....#########################RRRR##########...W",
      "W....##.......................RRRR.............W",
      "W....##.................................o......W",
      "W....##........................................W",
      "W....##..WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W....##........................................W",
      "W....##.............WWWW.......................W",
      "W....##.....o.......W..........................W",
      "W....###############W#######################...W",
      "W...................................o.....##...W",
      "W.........................................##...W",
      "W.........................................##...W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW...##...W",
      "W.........................................##...W",
      "W.........................................##...W",
      "W.............RRR.........................##...W",
      "W.............RRR.......o.................##...W",
      "W.............RRR........o................##...W",
      "W.........................................##...W",
      "W.......................####################...W",
      "W..............................................W",
      "W..............................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":24,"y":32}, exit: {"x":24,"y":33},
    portals: [], npcs: [],
    zones: [{"id":"sao_bac","name":"Sào Bắc","x0":1,"y0":1,"x1":46,"y1":9},{"id":"huyet_trung","name":"Huyệt Trung","x0":1,"y0":10,"x1":46,"y1":24},{"id":"huyet_nam","name":"Huyệt Nam","x0":1,"y0":25,"x1":46,"y1":34}],
    monsters: [{"type":"soi_con","x":10,"y":30},{"type":"soi_rung","x":36,"y":28},{"type":"soi_con","x":44,"y":21},{"type":"soi_rung","x":24,"y":20},{"type":"soi_con","x":6,"y":22},{"type":"soi_rung","x":6,"y":13},{"type":"soi_con","x":24,"y":12},{"type":"soi_rung","x":44,"y":13},{"type":"soi_con","x":44,"y":5},{"type":"soi_rung","x":16,"y":12}],
    herbs: [{"x":14,"y":32,"item":"huyet_sam"},{"x":30,"y":32,"item":"linh_chi"},{"x":18,"y":22,"item":"linh_chi"},{"x":38,"y":19,"item":"linh_chi"},{"x":12,"y":15,"item":"huyet_sam"},{"x":27,"y":15,"item":"huyet_sam"},{"x":36,"y":4,"item":"huyet_sam"},{"x":18,"y":3,"item":"linh_chi"}],
    props: [{"x":22,"y":32,"sprite":"sign","label":"Độc Sào"}]
  };
  var MAP_LINH_MOC = {
    id: "realm_linh_moc", name: "Linh Mộc Lâm", instance: true,
    bg: "assets/realm-linh-moc-bg.png", w: 52, h: 38, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..........................TTT...TTT...............W",
      "W....T....................TTTTT.TTTT......T...TTTT.W",
      "W........o.......o....TTT.TTTTT..TTT...........TTT.W",
      "W............Q.......TTTT.TTTTT................TTT.W",
      "W...........QQQ.......TTT..TTT...TTT...........TTT.W",
      "W..........QQ####..............T.TTT...........TTT.W",
      "WTTT........Q########............TTT...........TTT.W",
      "WTTT.........##########........T...................W",
      "WTTT...........###########....TTT..................W",
      "W.TTT....o.........######.....TTT...............T..W",
      "W.TTT................####.....TTTTTT...............W",
      "W.TTT..................##T...TTT.TTT.............T.W",
      "W....TTT..............#####..TTT.TTT............TTTW",
      "W....TTT.T...........#####...TTT................TTTW",
      "W....TTT...............##......T.TT..........TTTTTTW",
      "W......................##.T.........TTTT....TTTTT..W",
      "W.T............T.TTT...###.......TTTTTTTTT..TTTTT..W",
      "W................TTT.######......TTTTTTTT...TTTTTT.W",
      "W.............TTTTTT...######....TTTTTTTT...TTTTT..W",
      "W.............TTT.T.....######.TT....TTT.T.........W",
      "W.............TTT.TTT....#####..........T...T......W",
      "W.............TTTTTTTT...#####.....................W",
      "W.............TTTTTTTT...####....................T.W",
      "W.............TTTTTTTT..####....................T..W",
      "W.................TTTT........T....................W",
      "W..................TTT............TTT...........T..W",
      "WTTT...............TTTTTT.........TTT..............W",
      "WTTT........TTT....TTTTTT.....#...TTT..............W",
      "WTTT.....TTTTTT.......TTT......#...................W",
      "W........TTTTTT...............................R....W",
      "W..TTT...TTTT...TT.........#................RRRRR..W",
      "W.TTTTT..TTT..TT...........................RRRRRRR.W",
      "W.TTTTT..TTT...........................TTT..RRRRR..W",
      "W.TTTTT..TTT..TTT......................TTT....R....W",
      "W..TTTTTT.....TTT......................TTT...T.....W",
      "W.............TTT..................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":26,"y":34}, exit: {"x":26,"y":35},
    portals: [], npcs: [],
    zones: [{"id":"lam_bac","name":"Lâm Bắc","x0":1,"y0":1,"x1":50,"y1":12},{"id":"lam_trung","name":"Lâm Trung","x0":1,"y0":13,"x1":50,"y1":24},{"id":"lam_nam","name":"Lâm Nam","x0":1,"y0":25,"x1":50,"y1":36}],
    monsters: [{"type":"khi_mat_do","x":11,"y":5},{"type":"ga_rung","x":15,"y":8},{"type":"khi_mat_do","x":40,"y":8},{"type":"ga_rung","x":43,"y":11},{"type":"khi_mat_do","x":7,"y":20},{"type":"ga_rung","x":10,"y":23},{"type":"khi_mat_do","x":41,"y":26},{"type":"ga_rung","x":44,"y":29},{"type":"khi_mat_do","x":32,"y":32},{"type":"ga_rung","x":35,"y":34},{"type":"khi_mat_do","x":25,"y":17},{"type":"ga_rung","x":27,"y":24}],
    herbs: [{"x":10,"y":4,"item":"thanh_tam_thao"},{"x":16,"y":4,"item":"tu_linh_qua"},{"x":10,"y":9,"item":"ngoc_tuy_chi"},{"x":17,"y":7,"item":"linh_chi"},{"x":12,"y":10,"item":"tu_linh_qua"},{"x":15,"y":3,"item":"ngoc_tuy_chi"},{"x":39,"y":7,"item":"tu_linh_qua"},{"x":44,"y":8,"item":"linh_chi"},{"x":40,"y":12,"item":"linh_chi"},{"x":43,"y":6,"item":"linh_chi"},{"x":6,"y":19,"item":"thanh_linh_tuy"},{"x":11,"y":20,"item":"tu_linh_qua"},{"x":7,"y":24,"item":"linh_chi"},{"x":11,"y":23,"item":"thanh_linh_tuy"},{"x":40,"y":25,"item":"tu_linh_qua"},{"x":45,"y":26,"item":"thanh_tam_thao"},{"x":41,"y":30,"item":"linh_chi"},{"x":44,"y":24,"item":"tu_linh_qua"},{"x":31,"y":31,"item":"linh_chi"},{"x":36,"y":33,"item":"tu_linh_qua"},{"x":32,"y":35,"item":"tu_linh_qua"},{"x":35,"y":30,"item":"thanh_tam_thao"},{"x":26,"y":29,"item":"linh_chi"},{"x":23,"y":25,"item":"linh_chi"},{"x":29,"y":20,"item":"linh_chi"},{"x":20,"y":15,"item":"thanh_tam_thao"},{"x":27,"y":10,"item":"thanh_tam_thao"},{"x":17,"y":9,"item":"ngoc_tuy_chi"},{"x":24,"y":33,"item":"thanh_linh_tuy"},{"x":29,"y":27,"item":"thanh_tam_thao"}],
    props: [{"x":16,"y":8,"sprite":"sign","label":"Cổ thụ linh mộc"},{"x":24,"y":34,"sprite":"sign","label":"Linh Mộc Lâm"}]
  };
  var MAP_LINH_THU_VIEN = {
    id: "realm_linh_thu_vien", name: "Linh Thú Viên", instance: true,
    bg: "assets/realm-linh-thu-vien-bg.png", w: 52, h: 38, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..................................TTT.............W",
      "W.........................F........TTT.............W",
      "W.........................F........TTT.............W",
      "W.......R.................F...............Q........W",
      "W....RRRRRRR..............F.............QQQQQ......W",
      "W...RRRRRRRRR.............F.............QQQQQ......W",
      "W....RRRRRRR..............F............QQQQQQQ.....W",
      "W.......R...............................QQQQQ......W",
      "W.....................TTT...............QQQQQ......W",
      "W.....................TTT.F...............Q........W",
      "W.....................TTT.F........................W",
      "W.........................F.............T..TTT.....W",
      "W.........................F................TTT.....W",
      "W.........................F........TTT.....TTT.....W",
      "W.........................F.T......TTT.............W",
      "W.........................F........TTT.............W",
      "W.........................F........................W",
      "W.FFFFFFF..FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF.TFFFFF.W",
      "W....T....................F........................W",
      "W........TTT...T..........F........................W",
      "W........TTT.......................................W",
      "W........TTT.......................................W",
      "W.........................F........................W",
      "W.....................T...F........................W",
      "W.........................F........................W",
      "W.........................F..........T.............W",
      "W.........................F..............R.........W",
      "W.........................F...........RRRRRRR......W",
      "W.......T.................F..........RRRRRRRRR.....W",
      "W.....................................RRRRRRR......W",
      "W...................QQQQQQQQQQQQQ........R.TTT.....W",
      "W...................QQQQQQQQQQQQQ..........TTT.....W",
      "W...................QQQQQQQQQQQQQ..........TTT.....W",
      "W........T..........QQQQQQQQQQQQQ..................W",
      "W..T................QQQQQQQQQQQQQ..................W",
      "W..................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":26,"y":34}, exit: {"x":26,"y":35},
    portals: [], npcs: [],
    zones: [{"id":"vien_tay_bac","name":"Chuồng Tây Bắc","x0":1,"y0":1,"x1":25,"y1":17},{"id":"vien_dong_bac","name":"Chuồng Đông Bắc","x0":27,"y0":1,"x1":50,"y1":17},{"id":"vien_tay_nam","name":"Thảo Viên Tây Nam","x0":1,"y0":19,"x1":25,"y1":36},{"id":"vien_dong_nam","name":"Thảo Viên Đông Nam","x0":27,"y0":19,"x1":50,"y1":36}],
    monsters: [{"type":"soi_con","x":10,"y":10},{"type":"lon_rung","x":16,"y":14},{"type":"khi_mat_do","x":22,"y":5},{"type":"ga_rung","x":40,"y":6},{"type":"tho_hoang","x":45,"y":10},{"type":"lon_rung","x":35,"y":13},{"type":"soi_con","x":30,"y":4},{"type":"lon_rung","x":8,"y":22},{"type":"khi_mat_do","x":16,"y":27},{"type":"ga_rung","x":21,"y":30},{"type":"tho_hoang","x":40,"y":27},{"type":"lon_rung","x":46,"y":33},{"type":"soi_con","x":33,"y":24},{"type":"lon_rung","x":36,"y":29}],
    herbs: [{"x":6,"y":12,"item":"thanh_tam_thao"},{"x":14,"y":16,"item":"thanh_tam_thao"},{"x":20,"y":10,"item":"thao_duoc"},{"x":38,"y":12,"item":"thao_duoc"},{"x":47,"y":5,"item":"thanh_tam_thao"},{"x":33,"y":8,"item":"thao_duoc"},{"x":5,"y":29,"item":"thao_duoc"},{"x":13,"y":33,"item":"thanh_tam_thao"},{"x":19,"y":23,"item":"thao_duoc"},{"x":36,"y":33,"item":"thanh_tam_thao"},{"x":48,"y":26,"item":"thanh_tam_thao"},{"x":31,"y":29,"item":"thao_duoc"}],
    props: [{"x":45,"y":7,"sprite":"sacks","label":"Tổ trứng linh thú"},{"x":24,"y":34,"sprite":"sign","label":"Linh Thú Viên"}]
  };
  var MAP_KIEM_MO = {
    id: "realm_kiem_mo", name: "Kiếm Mộ Cổ", instance: true,
    bg: "assets/realm-kiem-mo-bg.png", w: 52, h: 38, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..................................................W",
      "W...........................................T......W",
      "W..................................................W",
      "W..................................................W",
      "W..........................##......QQQQQQQQQQQQQQQQW",
      "W...o...o.......o...o...o..##......QQQQQQQQQQQQQQQQW",
      "W..........................##......QQQQQQQQQQQQQQQQW",
      "W..........................########QQQQQQQQQQQQQQQQW",
      "W..........................########QQQQQQQQQQQQQQQQW",
      "W...o.......o...o...o...o..##......QQQQQQQQQQQQQQQQW",
      "W..........................##......QQQQQQQQQQQQQQQQW",
      "W..........................##......QQQQQQQQQQQQQQQQW",
      "W..........................##......QQQQQ####QQQQQQQW",
      "W.......o...o...o...o......##...........####.......W",
      "W..........................##....QQQQQQQ####QQQQQQQW",
      "W..........................##....QQQQQQQQQQQQQQQQQQW",
      "W..........................##....QQQQQQQQQQQQQQQQQQW",
      "W...o...o...o.......o...o..##....QQQQQQQQQQQQQQQQQQW",
      "W..........................##....QQQQQQQQQQQQQQQQQQW",
      "W..........................##....QQQQQQQQQQQQQQQQQQW",
      "W..........................##....QQQQQQQQQQQQQQQQQQW",
      "W...o...o.......o...o...o..##....QQQQQQQQQQQQQQQQQQW",
      "W..T.......................##....QQQQQ####QQQQQQQQQW",
      "W..........................##.........####.........W",
      "W..........................##..QQQQQQQ####QQQQQQQQQW",
      "W...o.......o...o...o...o..##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##..QQQQQQQQQQQQQQQQQQQQW",
      "W...o...o...o...o.......o..##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##..QQQQQQQQQQQQQQQQQQQQW",
      "W........T.................##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##..QQQQQQQQQQQQQQQQQQQQW",
      "W..........................##.....T................W",
      "W..................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":26,"y":34}, exit: {"x":26,"y":35},
    portals: [], npcs: [],
    zones: [{"id":"mo_bac","name":"Mộ Bắc","x0":1,"y0":1,"x1":50,"y1":13},{"id":"mo_trung","name":"Sảnh Mộ Trung","x0":1,"y0":14,"x1":50,"y1":24},{"id":"mo_nam","name":"Sảnh Mộ Nam","x0":1,"y0":25,"x1":50,"y1":36}],
    monsters: [{"type":"soi_rung","x":6,"y":8},{"type":"ran_luc","x":14,"y":12},{"type":"soi_rung","x":10,"y":20},{"type":"ran_luc","x":18,"y":24},{"type":"soi_rung","x":22,"y":16},{"type":"ran_luc","x":5,"y":28},{"type":"soi_rung","x":36,"y":29},{"type":"ran_luc","x":45,"y":27},{"type":"soi_rung","x":38,"y":19},{"type":"ran_luc","x":47,"y":17},{"type":"soi_rung","x":40,"y":9},{"type":"ran_luc","x":48,"y":11}],
    herbs: [{"x":6,"y":16,"item":"thanh_linh_tuy"},{"x":12,"y":8,"item":"thanh_linh_tuy"},{"x":17,"y":28,"item":"linh_chi"},{"x":21,"y":11,"item":"thanh_linh_tuy"},{"x":33,"y":31,"item":"tinh_van_thach"},{"x":44,"y":32,"item":"tinh_van_thach"},{"x":36,"y":21,"item":"tinh_van_thach"},{"x":48,"y":16,"item":"tinh_van_thach"},{"x":39,"y":7,"item":"tinh_van_thach"},{"x":46,"y":12,"item":"linh_chi"}],
    props: [{"x":31,"y":27,"sprite":"sign","label":"Kiếm mộ cổ"},{"x":46,"y":6,"sprite":"sacks","label":"Quan tài đá"}]
  };
  var MAP_CO_CHIEN_TRUONG = {
    id: "realm_co_chien_truong", name: "Cổ Chiến Trường", instance: true,
    bg: "assets/realm-co-chien-truong-bg.png", w: 56, h: 40, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W......................................................W",
      "W.....QQQQQQQQQ........................................W",
      "W.....QQQQQQQQQ........................................W",
      "W.....QQQQQQQQQ........................................W",
      "W.....QQQQQQQQQ........................................W",
      "W.....QQQQQQQQQ...............oo.......................W",
      "W.....QQQQQQQQQ.................oo.....................W",
      "W.........###.....................oo.......T...........W",
      "W.........###.......................o.o................W",
      "W....o....####.........................oo..............W",
      "W.....oo..####...........................oo............W",
      "W.......o..####............................oo..........W",
      "W........oo####........................................W",
      "W..........oo##....................................o...W",
      "W...........####..................................o....W",
      "W...........###o.................................o.....W",
      "W............###o...............................o......W",
      "W..........T.####oo............................o.......W",
      "W.............####.oo.........................o........W",
      "W.............####...o..............WWWWW..WWWWW.......W",
      "W..............####...oo....................o..........W",
      "W..............####.....o..................o...........W",
      "W...............####.............................T.....W",
      "W...............####....................o..T...........W",
      "W................####..................o........o......W",
      "W................####.................o..........o.....W",
      "W.................####...............o...T....####.....W",
      "W....T............####..............o.......######.....W",
      "W..................####............o.....#########.....W",
      "W.......WWW.WWW....#####..........o...##########.......W",
      "W...................######.......o..##########.........W",
      "W...................o######.....o.#########............W",
      "W....................o######...o########...............W",
      "W.......................##############.................W",
      "W........................###########...................W",
      "W...................T.....#######......T............T..W",
      "W..........................####........................W",
      "W......................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":28,"y":36}, exit: {"x":28,"y":37},
    portals: [], npcs: [],
    zones: [{"id":"truong_bac","name":"Trường Bắc","x0":1,"y0":1,"x1":54,"y1":13},{"id":"truong_trung","name":"Trường Trung","x0":1,"y0":14,"x1":54,"y1":26},{"id":"truong_nam","name":"Trường Nam","x0":1,"y0":27,"x1":54,"y1":38}],
    monsters: [{"type":"soi_rung","x":12,"y":12},{"type":"lon_mong_sat","x":20,"y":18},{"type":"khi_mat_do","x":30,"y":10},{"type":"soi_rung","x":44,"y":16},{"type":"soi_rung","x":50,"y":30},{"type":"lon_mong_sat","x":38,"y":25},{"type":"khi_mat_do","x":18,"y":30},{"type":"soi_rung","x":8,"y":20},{"type":"soi_rung","x":16,"y":26},{"type":"lon_mong_sat","x":40,"y":32},{"type":"khi_mat_do","x":48,"y":6},{"type":"soi_rung","x":27,"y":22}],
    herbs: [{"x":8,"y":3,"item":"huyet_sam"},{"x":13,"y":6,"item":"thanh_linh_tuy"},{"x":22,"y":20,"item":"linh_chi"},{"x":40,"y":22,"item":"linh_chi"},{"x":15,"y":31,"item":"linh_chi"},{"x":33,"y":29,"item":"huyet_sam"},{"x":47,"y":33,"item":"thanh_linh_tuy"},{"x":25,"y":8,"item":"linh_chi"}],
    props: [{"x":7,"y":32,"sprite":"sacks","label":"Rương chiến lợi"},{"x":49,"y":27,"sprite":"sacks","label":"Rương chiến lợi"},{"x":26,"y":36,"sprite":"sign","label":"Cổ Chiến Trường"}]
  };
  var MAP_DIA_MACH_HOA = {
    id: "realm_dia_mach_hoa", name: "Địa Mạch Hỏa Huyệt", instance: true,
    bg: "assets/realm-dia-mach-hoa-bg.png", w: 52, h: 38, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..................................................W",
      "W..................................................W",
      "W.......RRR...............................RRR......W",
      "W.......RRRRR...........................RRRRR......W",
      "W.......RRRRRRR.......................RRRRRRR......W",
      "W........RRRRRRR....................RRRRRRRR.......W",
      "W..........RRRRRRR................RRRRRRRR.........W",
      "W............RRRRRRR............RRRRRRRR...........W",
      "W.............RRRRRRRR........RRRRRRRR.............W",
      "W...............RRRRRRR......RRRRRRR...............W",
      "W.................RRRRR......RRRRR.................W",
      "W...................RRR..##..RRR...................W",
      "W........................##........................W",
      "W........................##........................W",
      "W.....................QQQQQQQQ.....................W",
      "W.....................QQQQQQQQ.....................W",
      "W.....................QQQQQQQQ.....................W",
      "W.....................QQQQQQQQ.....................W",
      "W.....................QQQQQQQQ.....................W",
      "W........................##........................W",
      "W........................##........................W",
      "W........................##........................W",
      "W........................##........................W",
      "W...RRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRR...W",
      "W...RRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRR...W",
      "W..................................................W",
      "W..................................................W",
      "W..........................................RRRRRR..W",
      "W..RRRRRR..................................RRRRRR..W",
      "W..RRRRRR..................................RRRRRR..W",
      "W..RRRRRR..................................RRRRRR..W",
      "W..RRRRRR..........................................W",
      "W..................................................W",
      "W..................................................W",
      "W..................................................W",
      "W..................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":26,"y":34}, exit: {"x":26,"y":35},
    portals: [], npcs: [],
    zones: [{"id":"hoa_bac","name":"Mạch Bắc","x0":1,"y0":1,"x1":50,"y1":11},{"id":"hoa_trung","name":"Mạch Trung","x0":1,"y0":12,"x1":50,"y1":23},{"id":"hoa_nam","name":"Mạch Nam","x0":1,"y0":26,"x1":50,"y1":36}],
    monsters: [{"type":"ran_luc","x":23,"y":16},{"type":"lon_mong_sat","x":28,"y":18},{"type":"khi_mat_do","x":15,"y":21},{"type":"ran_luc","x":36,"y":21},{"type":"ran_luc","x":10,"y":2},{"type":"lon_mong_sat","x":26,"y":3},{"type":"khi_mat_do","x":44,"y":2},{"type":"ran_luc","x":12,"y":30},{"type":"ran_luc","x":38,"y":34},{"type":"lon_mong_sat","x":20,"y":27}],
    herbs: [{"x":8,"y":22,"item":"hoa_diem_lien"},{"x":14,"y":23,"item":"linh_chi"},{"x":20,"y":22,"item":"huyet_sam"},{"x":32,"y":23,"item":"hoa_diem_lien"},{"x":40,"y":22,"item":"doc_tam_hoa"},{"x":46,"y":23,"item":"linh_chi"},{"x":10,"y":27,"item":"huyet_sam"},{"x":18,"y":26,"item":"linh_chi"},{"x":34,"y":26,"item":"huyet_sam"},{"x":44,"y":27,"item":"huyet_sam"},{"x":27,"y":15,"item":"doc_tam_hoa"},{"x":24,"y":19,"item":"hoa_diem_lien"},{"x":28,"y":16,"item":"hoa_diem_lien"},{"x":22,"y":18,"item":"hoa_diem_lien"},{"x":15,"y":10,"item":"huyet_sam"},{"x":24,"y":9,"item":"hoa_diem_lien"},{"x":34,"y":11,"item":"doc_tam_hoa"},{"x":20,"y":13,"item":"hoa_diem_lien"},{"x":30,"y":13,"item":"linh_chi"},{"x":38,"y":12,"item":"doc_tam_hoa"},{"x":10,"y":33,"item":"huyet_sam"},{"x":41,"y":32,"item":"hoa_diem_lien"},{"x":2,"y":20,"item":"doc_tam_hoa"},{"x":2,"y":8,"item":"hoa_diem_lien"},{"x":49,"y":20,"item":"doc_tam_hoa"},{"x":49,"y":10,"item":"hoa_diem_lien"}],
    props: [{"x":24,"y":34,"sprite":"sign","label":"Địa Mạch Hỏa"}]
  };
  var MAP_HAN_BANG = {
    id: "realm_han_bang", name: "Hàn Băng Động", instance: true,
    bg: "assets/realm-han-bang-bg.png", w: 52, h: 38, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..................................................W",
      "W.................................WWWWWWWWWWWWWWWW.W",
      "W.................................W..............W.W",
      "W.................................W...QQQQQQQQ...W.W",
      "W.................................W...QQQQQQQQ...W.W",
      "W.................................W...QQQQQQQQ...W.W",
      "W...........................T.....W...QQQQQQQQ...W.W",
      "W...................o.............W...QQQQQQQQ...W.W",
      "W.................................W...QQQQQQQQ...W.W",
      "W..TTT............................W....T.........W.W",
      "W.TTTTT..........................#W###...........W.W",
      "W.TTTTT.........TTT.........######WWWWWW..WWWWWWWW.W",
      "W.TTTTT.........TTT.....##############.............W",
      "W..TTTo.........TTT....############................W",
      "WTTT................##########.....................W",
      "WTTT......T........#######...WWWWWWWWWWWWWWW.......W",
      "WTTT.............########....W.............W.......W",
      "W................#######.....W.............W.......W",
      "W................#########...W.............W.......W",
      "W..........R.......#######.................W.......W",
      "W......RRRRRRRRR......#####..W.............W.......W",
      "W.....RRRRRRRRRRR......####..W.............W.......W",
      "W....RRRRRRRRRRRRR......####.W....T........W.......W",
      "W...RRRRRRRRRRRRRRR.....####.WWWWWWWWWWWWWWW.......W",
      "W...RRRRRRRRRRRRRRR......###.......................W",
      "W..RRRRRRRRRRRRRRRRR.....###.......................W",
      "W...RRRRRRRRRRRRRRR......###.......................W",
      "W...RRRRRRRRRRRRRRR...o..###.......................W",
      "W....RRRRRRRRRRRRR.....o.###.......TT..............W",
      "W.....RRRRRRRRRRR........###...o..............o....W",
      "W.....TRRRRRRRRR.........###....o..................W",
      "W..........R.............###..........T............W",
      "W..........TTT...........###..........TTT..........W",
      "W..........TTT...........###..........TTT..........W",
      "W..........TTT........................TTT..........W",
      "W..................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":26,"y":34}, exit: {"x":26,"y":35},
    portals: [], npcs: [],
    zones: [{"id":"bang_bac","name":"Động Bắc","x0":1,"y0":1,"x1":50,"y1":14},{"id":"bang_trung","name":"Động Trung","x0":1,"y0":15,"x1":50,"y1":25},{"id":"bang_nam","name":"Động Nam","x0":1,"y0":26,"x1":50,"y1":36}],
    monsters: [{"type":"soi_rung","x":39,"y":5},{"type":"khi_mat_do","x":44,"y":8},{"type":"soi_rung","x":33,"y":19},{"type":"soi_rung","x":40,"y":22},{"type":"khi_mat_do","x":14,"y":6},{"type":"soi_rung","x":24,"y":10},{"type":"soi_rung","x":22,"y":22},{"type":"khi_mat_do","x":16,"y":17},{"type":"soi_rung","x":36,"y":30},{"type":"soi_rung","x":8,"y":33}],
    herbs: [{"x":5,"y":19,"item":"linh_chi"},{"x":12,"y":18,"item":"ngoc_tuy_chi"},{"x":19,"y":21,"item":"ngoc_tuy_chi"},{"x":21,"y":27,"item":"bang_tinh_hoa"},{"x":4,"y":30,"item":"bang_tinh_hoa"},{"x":15,"y":33,"item":"bang_tinh_hoa"},{"x":18,"y":30,"item":"ngoc_tuy_chi"},{"x":6,"y":21,"item":"bang_tinh_hoa"},{"x":16,"y":4,"item":"thanh_linh_tuy"},{"x":22,"y":7,"item":"linh_chi"},{"x":28,"y":4,"item":"ngoc_tuy_chi"},{"x":12,"y":11,"item":"ngoc_tuy_chi"},{"x":30,"y":9,"item":"thanh_linh_tuy"},{"x":37,"y":10,"item":"bang_tinh_hoa"},{"x":46,"y":5,"item":"bang_tinh_hoa"},{"x":32,"y":18,"item":"ngoc_tuy_chi"},{"x":36,"y":22,"item":"bang_tinh_hoa"},{"x":41,"y":18,"item":"thanh_linh_tuy"},{"x":28,"y":28,"item":"linh_chi"},{"x":36,"y":27,"item":"thanh_linh_tuy"},{"x":48,"y":20,"item":"linh_chi"},{"x":26,"y":36,"item":"bang_tinh_hoa"},{"x":42,"y":33,"item":"bang_tinh_hoa"},{"x":33,"y":35,"item":"linh_chi"},{"x":49,"y":34,"item":"linh_chi"},{"x":24,"y":31,"item":"bang_tinh_hoa"}],
    props: [{"x":24,"y":34,"sprite":"sign","label":"Hàn Băng Động"}]
  };
  var MAP_BAI_TINH_ANH = {
    id: "realm_bai_tinh_anh", name: "Bãi Săn Tinh Anh", instance: true,
    bg: "assets/realm-bai-tinh-anh-bg.png", w: 52, h: 38, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W..................................................W",
      "W..................................................W",
      "W............................................R.....W",
      "W.........T.........................TTT....RRRRR...W",
      "W..................................TTTTT..RRRRRRR..W",
      "W..................................TTTTT...RRRRR...W",
      "W.....................#######......TTTTT.....R.....W",
      "W...................##.......##.....TTT............W",
      "W.................##..ooo..oo..##........TTT.......W",
      "W................##.ooo.....ooo.##.......TTT.......W",
      "W...............##.oo.........oo.##......TTT.......W",
      "W...............#.o.............o.#................W",
      "W..............#.oo.............oo.#...............W",
      "W..............#.o.......Q.......o.#...........T...W",
      "W........T....#.oo.....QQQQQ.....oo.#..............W",
      "W..T..........#.o.....QQQQQQQ.....o.#..............W",
      "W.............#.......QQQQQQQ.......#..............W",
      "W.............#......QQQQQQQQQ......#..............W",
      "W.............#.o.....QQQQQQQ.....o.#...TTT....T...W",
      "W.............#.o.....QQQQQQQ.....o.#...TTT........W",
      "W.............#.oo.....QQQQQ.....oo.#...TTT........W",
      "W..............#.o.......Q.......o.#...............W",
      "W..............#.oo.............oo.#...............W",
      "W...............#.o.............o.#................W",
      "W...............##.oo.........oo.##.....TTT........W",
      "W................##.ooo.....ooo.##......TTT.TTT....W",
      "W.................##..ooo..oo..##.......TTTTTTTT...W",
      "W...................##...##..##............TTTTT...W",
      "W.....................#######..............TTTTT...W",
      "W........................##.................TTT....W",
      "W........................##........................W",
      "W...................T....##........................W",
      "W........................##........................W",
      "W..................................................W",
      "W..................................................W",
      "W..................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":26,"y":34}, exit: {"x":26,"y":35}, eliteChance: 0.45,
    portals: [], npcs: [],
    zones: [{"id":"bai_bac","name":"Bãi Bắc","x0":1,"y0":1,"x1":50,"y1":13},{"id":"bai_trung","name":"Bãi Trung","x0":1,"y0":14,"x1":50,"y1":25},{"id":"bai_nam","name":"Bãi Nam","x0":1,"y0":26,"x1":50,"y1":36}],
    monsters: [{"type":"soi_rung","x":25,"y":11},{"type":"lon_mong_sat","x":19,"y":18},{"type":"khi_mat_do","x":31,"y":18},{"type":"soi_rung","x":25,"y":25},{"type":"lon_mong_sat","x":21,"y":14},{"type":"khi_mat_do","x":29,"y":22},{"type":"soi_rung","x":10,"y":8},{"type":"lon_mong_sat","x":40,"y":12},{"type":"khi_mat_do","x":12,"y":28},{"type":"soi_rung","x":38,"y":30},{"type":"lon_mong_sat","x":25,"y":4},{"type":"khi_mat_do","x":19,"y":31},{"type":"soi_rung","x":5,"y":18},{"type":"lon_mong_sat","x":46,"y":18},{"type":"khi_mat_do","x":15,"y":33},{"type":"soi_rung","x":35,"y":4}],
    herbs: [{"x":8,"y":12,"item":"linh_chi"},{"x":44,"y":24,"item":"linh_chi"},{"x":14,"y":4,"item":"linh_chi"},{"x":36,"y":33,"item":"linh_chi"},{"x":48,"y":12,"item":"huyet_sam"},{"x":3,"y":24,"item":"huyet_sam"}],
    props: [{"x":24,"y":34,"sprite":"sign","label":"Bãi Săn Tinh Anh"}]
  };
  var MAP_THUY_PHU = {
    id: "realm_thuy_phu", name: "Thủy Phủ Tàn Cung", instance: true,
    bg: "assets/realm-thuy-phu-bg.png", w: 56, h: 40, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W......................................................W",
      "W......................................................W",
      "W.................W..................W.................W",
      "W.................W....QQQQQQQQQQ....W.................W",
      "W....RRRRR........W....QQQQQQQQQQ....W.................W",
      "W....RRRRR........W....QQQQQQQQQQ....W.................W",
      "W....RRRRR........W....QQQQQQQQQQ....W.................W",
      "W....RRRRR.............QQQQQQQQQQ......................W",
      "W.................W....QQQQQQQQQQ....W.................W",
      "W.................W........##........W........RRRRR....W",
      "W.................W........##........W........RRRRR....W",
      "W.................W........##........W........RRRRR....W",
      "W.................W........##........W........RRRRR....W",
      "W.................W........##........W.................W",
      "W.................W........##........W.................W",
      "W..WWWWWW..WWWWWWWWWWWWWWWW##WWWWWWWWWWWWWWWW..WWWWWW..W",
      "W........##.......W........##........W.......##........W",
      "W........##.......W........##........W.....RR##RRRR....W",
      "W........##.......W.....QQQ##QQQ.....W.....RR##RRRR....W",
      "W........##.......W.....QQQ##QQQ.....W.....RR##RRRR....W",
      "W........##.............QQQ##QQQ.............##........W",
      "W........##.......W.....QQQ##QQQ.....W.......##........W",
      "W....RRRR##RRRR...W.....QQQ##QQQ.....W.......##........W",
      "W....RRRR##RRRR...W........##........W.......##........W",
      "W....RRRR##RRRR...W........##........W.......##........W",
      "W........##.......W........##........W.......##........W",
      "W..WWWWWW##WWWWWWWWWWWWWWWW##WWWWWWWWWWWWWWWW##WWWWWW..W",
      "W........##................##................##........W",
      "W........##................##................##........W",
      "W........##................##................##........W",
      "W...RRRRR##................##................##RRRRR...W",
      "W...RRRRR##................##................##RRRRR...W",
      "W...RRRRR##................##................##RRRRR...W",
      "W...RRRRR##................##................##RRRRR...W",
      "W...RRRRR##................##................##RRRRR...W",
      "W........##................##................##........W",
      "W......................................................W",
      "W......................................................W",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":28,"y":36}, exit: {"x":28,"y":37},
    portals: [], npcs: [],
    zones: [{"id":"phu_bac","name":"Hồ Phủ Bắc","x0":1,"y0":1,"x1":54,"y1":16},{"id":"phu_trung","name":"Điện Trung","x0":1,"y0":17,"x1":54,"y1":27},{"id":"phu_nam","name":"Điện Nam","x0":1,"y0":28,"x1":54,"y1":38}],
    monsters: [{"type":"ran_luc","x":13,"y":6},{"type":"soi_rung","x":7,"y":12},{"type":"ran_luc","x":43,"y":5},{"type":"soi_rung","x":49,"y":15},{"type":"ran_luc","x":24,"y":12},{"type":"soi_rung","x":31,"y":12},{"type":"ran_luc","x":10,"y":20},{"type":"soi_rung","x":15,"y":18},{"type":"ran_luc","x":42,"y":23},{"type":"soi_rung","x":48,"y":25},{"type":"ran_luc","x":20,"y":32},{"type":"soi_rung","x":36,"y":33}],
    herbs: [{"x":14,"y":10,"item":"thanh_linh_tuy"},{"x":11,"y":14,"item":"thanh_linh_tuy"},{"x":16,"y":4,"item":"linh_chi"},{"x":41,"y":12,"item":"bang_tinh_hoa"},{"x":44,"y":4,"item":"thanh_linh_tuy"},{"x":39,"y":9,"item":"thanh_linh_tuy"},{"x":21,"y":13,"item":"linh_chi"},{"x":34,"y":12,"item":"van_nien_linh_chi"},{"x":12,"y":18,"item":"thanh_linh_tuy"},{"x":16,"y":21,"item":"van_nien_linh_chi"},{"x":7,"y":20,"item":"bang_tinh_hoa"},{"x":41,"y":25,"item":"bang_tinh_hoa"},{"x":48,"y":22,"item":"thanh_linh_tuy"},{"x":39,"y":19,"item":"thanh_linh_tuy"},{"x":21,"y":20,"item":"bang_tinh_hoa"},{"x":34,"y":22,"item":"bang_tinh_hoa"},{"x":22,"y":25,"item":"van_nien_linh_chi"},{"x":14,"y":30,"item":"linh_chi"},{"x":24,"y":34,"item":"bang_tinh_hoa"},{"x":33,"y":30,"item":"thanh_linh_tuy"},{"x":41,"y":34,"item":"linh_chi"},{"x":52,"y":29,"item":"linh_chi"},{"x":19,"y":37,"item":"van_nien_linh_chi"},{"x":44,"y":30,"item":"linh_chi"}],
    props: [{"x":26,"y":36,"sprite":"sign","label":"Thủy Phủ Tàn Cung"},{"x":28,"y":21,"sprite":"sacks","label":"Kho báu thủy phủ"}]
  };
  var MAP_LOI_VUC = {
    id: "realm_loi_vuc", name: "Lôi Vực Tàn Tích", instance: true,
    bg: "assets/realm-loi-vuc-bg.png", w: 48, h: 36, tiles: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "WRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRRRQQQQQQQQQQRRRRRRRRRRRRRRRRRRW",
      "WRRRRRQQQQQQQRRRRRRQQQQQQQQQQRRRRRRQQQQQQQQRRRRW",
      "WRRRRRQQQQQQQ######QQQQQQQQQQ######QQQQQQQQRRRRW",
      "WRRRRRQQQQQQQ######QQQQQQQQQQ######QQQQQQQQRRRRW",
      "WRRRRRQQQQQQQRRRRRRQQQQQQQQQQRRRRRRQQQQQQQQRRRRW",
      "WRRRRRQQQQQQQRRRRRRQQQQQQQQQQRRRRRRQQQQQQQQRRRRW",
      "WRRRRRQQQQQQQRRRRRRRRRR##RRRRRRRRRRQQQQQQQQRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRQQQQQQQQRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRR#RRRRRRW",
      "WRRRRRRRRRRRRRRRoRRRRRR##RRRRRRRRRRRRRRR#RRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRoRRRRRRR#RRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRR#RRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRR#RRRRRRW",
      "WRRRRRRRRRRRRRRRRRRQQQQQQQQQQRRRRRRRRRRR#RRRRRRW",
      "WRRRQQQQQQQRRRRRRRRQQQQQQQQQQRRRRRRRRQQQQQQQQRRW",
      "WRRRQQQQQQQ########QQQQQQQQQQ########QQQQQQQQRRW",
      "WRRRQQQQQQQ########QQQQQQQQQQ########QQQQQQQQRRW",
      "WRRRQQQQQQQRRRRRRRRQQQQQQQQQQRRRRRRRRQQQQQQQQRRW",
      "WRRRQQQQQQQRRRRRRRRRRRR##RRRRRRRRRRRRQQQQQQQQRRW",
      "WRRRQQQQQQQRRRRRRRRRRRR##RRRRRRRRRRRRQQQQQQQQRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRoRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRoRRRRR##RRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRR..............RRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRR..............RRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRR..............RRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRR..............RRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRR..............RRRRRRRRRRRRRRRRW",
      "WRRRRRRRRRRRRRRRR..............RRRRRRRRRRRRRRRRW",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ], blocked: BLOCKED,
    start: {"x":24,"y":32}, exit: {"x":24,"y":33},
    portals: [], npcs: [],
    zones: [{"id":"loi_bac","name":"Đài Lôi Bắc","x0":1,"y0":1,"x1":46,"y1":13},{"id":"loi_trung","name":"Tích Trung","x0":1,"y0":14,"x1":46,"y1":24},{"id":"loi_nam","name":"Tích Nam","x0":1,"y0":25,"x1":46,"y1":34}],
    monsters: [{"type":"ran_luc","x":21,"y":3},{"type":"khi_mat_do","x":26,"y":6},{"type":"ran_luc","x":21,"y":16},{"type":"khi_mat_do","x":26,"y":18},{"type":"ran_luc","x":8,"y":5},{"type":"khi_mat_do","x":11,"y":7},{"type":"ran_luc","x":37,"y":5},{"type":"khi_mat_do","x":41,"y":8},{"type":"ran_luc","x":6,"y":18},{"type":"khi_mat_do","x":9,"y":20},{"type":"ran_luc","x":39,"y":18},{"type":"khi_mat_do","x":43,"y":20}],
    herbs: [{"x":24,"y":3,"item":"thien_loi_qua"},{"x":24,"y":17,"item":"thien_loi_qua"},{"x":20,"y":18,"item":"thien_loi_qua"},{"x":7,"y":4,"item":"thien_loi_qua"},{"x":39,"y":4,"item":"linh_chi"},{"x":36,"y":8,"item":"thien_loi_qua"},{"x":5,"y":17,"item":"linh_chi"},{"x":42,"y":17,"item":"thien_loi_qua"},{"x":19,"y":30,"item":"thien_loi_qua"},{"x":28,"y":31,"item":"thien_loi_qua"}],
    props: [{"x":22,"y":32,"sprite":"sign","label":"Lôi Vực Tàn Tích"}]
  };
  var REALM_MAPS = {};
  REALM_MAPS[REALM_DK.id] = REALM_DK;
  REALM_MAPS[REALM_KN.id] = REALM_KN;
  [MAP_DUOC_COC, MAP_VAN_YEU, MAP_DONG_PHU, MAP_VUON_DUOC, MAP_SAO_YEU, MAP_LINH_MOC,
   MAP_LINH_THU_VIEN, MAP_KIEM_MO, MAP_CO_CHIEN_TRUONG, MAP_DIA_MACH_HOA, MAP_HAN_BANG,
   MAP_BAI_TINH_ANH, MAP_THUY_PHU, MAP_LOI_VUC].forEach(function (mp) { REALM_MAPS[mp.id] = mp; });
  function isRealmMap(id) { return !!REALM_MAPS[id]; }
  function registerMaps(mapsApi) {
    if (!mapsApi || !mapsApi.MAPS) return false;
    Object.keys(REALM_MAPS).forEach(function (id) { mapsApi.MAPS[id] = REALM_MAPS[id]; });
    return true;
  }
  if (M) registerMaps(M);

  // ---------- Trạng thái trong save (flags.sr) ----------
  function dayKey(now) {
    var d = new Date(now);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function ensure(flags, now) {
    if (!flags || typeof flags !== 'object') return null;
    var s = flags.sr;
    if (!s || typeof s !== 'object') {
      s = flags.sr = { day: '', entries: {}, entriesToday: 0, lastFateAt: 0, fateOffer: null, run: null };
    }
    if (typeof s.entries !== 'object' || !s.entries) s.entries = {};
    if (typeof s.realmEntries !== 'object' || !s.realmEntries) s.realmEntries = {};
    if (typeof s.realmDay !== 'object' || !s.realmDay || typeof s.realmDay.counts !== 'object' || !s.realmDay.counts) s.realmDay = { dayStart: 0, counts: {} };
    if (s.lastRiftId === undefined) s.lastRiftId = null;
    s.entriesToday = num(s.entriesToday, 0);
    s.lastFateAt = num(s.lastFateAt, 0);
    if (s.fateOffer === undefined) s.fateOffer = null;
    if (s.run === undefined) s.run = null;
    // Reset lượt theo NGÀY: chỉ khi ngày của `now` thật sự TIẾN lên so với
    // ngày đã ghi (đồng hồ lùi hoặc mốc mô phỏng cũ hơn không được xóa lượt).
    var nowMs = now || Date.now();
    var dnow = new Date(nowMs);
    var todayStart = new Date(dnow.getFullYear(), dnow.getMonth(), dnow.getDate()).getTime();
    if (typeof s.dayStart !== 'number') {
      if (s.day && s.day !== dayKey(nowMs)) { s.entries = {}; s.entriesToday = 0; } // save cũ: lệch ngày thì reset 1 lần
      s.dayStart = todayStart; s.day = dayKey(nowMs);
    } else if (todayStart > s.dayStart) {
      s.dayStart = todayStart; s.day = dayKey(nowMs); s.entries = {}; s.entriesToday = 0;
    }
    // Lượt theo cảnh (kho mới): reset cùng nhịp ngày như trên.
    if (typeof s.realmDay.dayStart !== 'number' || !s.realmDay.dayStart) {
      s.realmDay.dayStart = todayStart;
    } else if (todayStart > s.realmDay.dayStart) {
      s.realmDay.dayStart = todayStart; s.realmDay.counts = {};
    }
    return s;
  }
  function sessionKey(now, idx) { return dayKey(now) + '#' + idx; }
  // Phiên chứa `now` (đầu ngày địa phương + start, kéo dài durationMin).
  function sessionAt(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < SCHEDULED.sessions.length; i++) {
      var start = base + SCHEDULED.sessions[i] * 60000;
      var end = start + SCHEDULED.durationMin * 60000;
      if (now >= start && now < end) return { index: i, start: start, end: end, key: sessionKey(now, i) };
    }
    return null;
  }
  function nextSession(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < SCHEDULED.sessions.length; i++) {
      var start = base + SCHEDULED.sessions[i] * 60000;
      if (now < start) return { index: i, start: start, dayOffset: 0 };
    }
    return { index: 0, start: base + 86400000 + SCHEDULED.sessions[0] * 60000, dayOffset: 1 };
  }
  function entriesUsed(flags, key) { var s = ensure(flags); return s ? num(s.entries[key], 0) : 0; }
  function status(flags, now) {
    var s = ensure(flags, now); if (!s) return null;
    var ses = sessionAt(now);
    var st = {
      open: !!ses, session: ses, durationMin: SCHEDULED.durationMin,
      endsInSec: ses ? Math.max(0, Math.round((ses.end - now) / 1000)) : 0,
      next: ses ? null : nextSession(now),
      entriesLeftSession: ses ? Math.max(0, SCHEDULED.maxPerSession - entriesUsed(flags, ses.key)) : 0,
      entriesLeftToday: Math.max(0, SCHEDULED.maxPerDay - s.entriesToday),
      fateCooldownSec: Math.max(0, Math.round((s.lastFateAt + FATE.minGapMs - now) / 1000)),
      offer: validOffer(flags, now)
    };
    return st;
  }
  // Điều kiện vào bí cảnh định kỳ. hasRoot = đã lộ linh căn (flags.kyNgo).
  function canEnter(flags, now, hasRoot) {
    var s = ensure(flags, now); if (!s) return { ok: false, reason: 'nosave' };
    if (s.run) return { ok: false, reason: 'inrun' };
    if (!hasRoot) return { ok: false, reason: 'noroot' };
    var ses = sessionAt(now);
    if (!ses) return { ok: false, reason: 'closed' };
    if (entriesUsed(flags, ses.key) >= SCHEDULED.maxPerSession) return { ok: false, reason: 'sessionlimit' };
    if (s.entriesToday >= SCHEDULED.maxPerDay) return { ok: false, reason: 'daylimit' };
    return { ok: true, session: ses };
  }
  // Bắt đầu 1 lượt định kỳ: trừ lượt + tạo run. returnTo = {mapId,x,y} ô đứng lúc vào.
  function beginRun(flags, now, hasRoot, returnTo) {
    var chk = canEnter(flags, now, hasRoot);
    if (!chk.ok) return chk;
    var s = ensure(flags, now);
    s.entries[chk.session.key] = entriesUsed(flags, chk.session.key) + 1;
    s.entriesToday += 1;
    s.run = {
      kind: 'dinh_ky', mapId: SCHEDULED.mapId, sessionKey: chk.session.key,
      endAt: chk.session.end, returnTo: returnTo, kills: 0, need: 0, rewarded: false,
      encounterUsed: false, treasures: []
    };
    s.run.treasures = placeTreasures(realmById('liet_khach'), null);
    return { ok: true, run: s.run };
  }
  // ==========================================================
  // MỞ RỘNG KHO 15 BÍ CẢNH (lệnh Bui 22:04 + 22:07 + 22:08 ngày
  // 2026-10-29): registry dạng KHO (POOL) đủ 15 cảnh — 4 cảnh ĐỊNH KỲ
  // mở luân phiên theo phiên trong ngày (gồm "Liệt Khích Phong Ấn" cũ
  // giữ nguyên 4 khung giờ gốc) + 11 cảnh chỉ nằm trong KHO VẾT NỨT
  // (riftPool) chờ sự kiện Vết Nứt Hư Không sau này: vết nứt xuất hiện
  // ở map thường sẽ đưa người chơi vào NGẪU NHIÊN 1 cảnh trong kho mà
  // họ đủ điều kiện (pickRiftRealm bên dưới — sự kiện vết nứt CHƯA làm
  // đợt này). Mọi tên cảnh là ĐỀ XUẤT.
  // Hai hệ áp cho cả kho: (1) THIÊN TÀI ĐỊA BẢO ngẫu nhiên mỗi lượt —
  // số điểm + vị trí lăn mới theo hệ số treasureRate của cảnh, mọc ở ô
  // trống hợp lệ, phát sáng riêng, biến mất khi cảnh đóng; (2) KỲ NGỘ
  // ĐÁNH BOSS TRONG CẢNH — tối đa 1 lần/lượt, boss co giãn chỉ số theo
  // CẢNH GIỚI người chơi qua scaleMonsterStats (hàm dùng chung đầu
  // tiên của game có quái scale theo người chơi; cột realmRank để sẵn
  // cho Trúc Cơ+).
  // ==========================================================
  function realmDefBase(o) {
    o.durationMin = o.durationMin || 25;
    o.maxPerSession = 1;
    o.maxPerDay = 2;
    o.gateMap = 'map1';
    o.gate = { x: 33, y: 15 }; // cùng khe nứt cạnh giếng cổ — phiên nào mở thì vào cảnh đó (V10: + offset (12,8))
    return o;
  }
  var POOL = [
    realmDefBase({
      id: 'liet_khach', name: SCHEDULED.name, mapId: SCHEDULED.mapId, theme: 'mixed',
      minTier: 0, size: '24×18', scheduled: true, riftPool: true,
      sessions: SCHEDULED.sessions, durationMin: SCHEDULED.durationMin,
      treasureRate: 0.8, encounterRate: 0.8,
      tags: ['yeu_dan', 'trang_bi', 'tu_vi'],
      intro: SCHEDULED.intro,
      bosses: [{ type: SCHEDULED.bossType, x: SCHEDULED.bossSpawn.x, y: SCHEDULED.bossSpawn.y, name: SCHEDULED.bossName, hp: SCHEDULED.bossHp, atk: SCHEDULED.bossAtk }],
      rewards: SCHEDULED.rewards
    }),
    realmDefBase({
      id: 'duoc_coc', name: 'Linh Dược Bí Cốc', mapId: 'realm_duoc_coc', theme: 'gather',
      minTier: 2, size: '40×30', scheduled: true, riftPool: true,
      sessions: [6 * 60, 19 * 60],
      treasureRate: 1.6, encounterRate: 0.5,
      tags: ['duoc', 'dan_duoc', 'trung_linh_thu'],
      intro: 'Một thung lũng dược viên bị phong ấn quên lãng — linh dược mọc dày như cỏ dại, chỉ có một con thú già canh giữ cốc tâm.',
      bosses: [{ type: 'lon_mong_sat', x: 20, y: 5, name: 'Linh Cốc Thủ Hộ Thú', hp: 230, atk: 15 }],
      rewards: [
        { kind: 'linhThach', n: 80, chance: 1 },
        { kind: 'tuvi', n: 40, chance: 1 },
        { kind: 'item', id: 'linh_chi', n: 2, chance: 1 },
        { kind: 'item', id: 'ngoc_tuy_chi', n: 1, chance: 0.4 },
        { kind: 'item', id: 'son_tinh', n: 1, chance: 0.15 },
        { kind: 'egg', chance: 0.15 }
      ]
    }),
    realmDefBase({
      id: 'van_yeu', name: 'Vạn Yêu Sào', mapId: 'realm_van_yeu', theme: 'boss',
      minTier: 4, size: '40×30', scheduled: true, riftPool: true,
      sessions: [9 * 60, 20 * 60],
      treasureRate: 0.6, encounterRate: 1.6,
      tags: ['yeu_dan', 'trung_linh_thu', 'linh_thach'],
      intro: 'Ba sào huyệt yêu thú chen nhau trong một thung lũng — sào nào cũng có vương thú trấn giữ. Săn sạch cả ba sào là chiến lợi phẩm hậu hĩnh.',
      bosses: [
        { type: 'soi_rung', x: 7, y: 7, name: 'Sào Lang Vương', hp: 300, atk: 18 },
        { type: 'lon_mong_sat', x: 32, y: 7, name: 'Thiết Bì Sào Chủ', hp: 430, atk: 21 },
        { type: 'son_quan', x: 20, y: 15, name: 'Vạn Yêu Sào Chủ', hp: 540, atk: 24 }
      ],
      rewards: [
        { kind: 'linhThach', n: 220, chance: 1 },
        { kind: 'tuvi', n: 70, chance: 1 },
        { kind: 'item', id: 'yeu_dan_1', n: 2, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.5 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.15 },
        { kind: 'egg', chance: 0.35 },
        { kind: 'weapon', grade: 'dia', chance: 0.3 },
        { kind: 'item', id: 'bt_rare_hoi_xuan', n: 1, chance: 0.1 }
      ]
    }),
    realmDefBase({
      id: 'dong_phu', name: 'Cổ Tu Động Phủ', mapId: 'realm_dong_phu', theme: 'mixed',
      minTier: 6, size: '36×28', scheduled: true, riftPool: true,
      sessions: [14 * 60 + 30, 22 * 60 + 30],
      treasureRate: 1.1, encounterRate: 1.0,
      tags: ['nguyen_lieu_cao', 'dan_phuong', 'tu_vi'],
      intro: 'Động phủ của một cổ tu vô danh: nửa là dược viên bỏ hoang đầy nguyên liệu quý, nửa là đại điện có thú trấn giữ — và một tàng thư các chép đan phương Thiên phẩm thất truyền.',
      bosses: [{ type: 'lon_mong_sat', x: 27, y: 7, name: 'Động Phủ Thủ Hộ Thú', hp: 470, atk: 22 }],
      rewards: [
        { kind: 'linhThach', n: 180, chance: 1 },
        { kind: 'tuvi', n: 150, chance: 1 },
        { kind: 'item', id: 'van_nien_linh_chi', n: 1, chance: 1 },
        { kind: 'item', id: 'thanh_linh_tuy', n: 1, chance: 0.6 },
        { kind: 'recipe', id: 'cuu_chuyen_hoi_hon_dan', chance: 1 },
        { kind: 'artifact', grade: 'dia', chance: 0.25 },
        { kind: 'item', id: 'bt_rare_van_kiem', n: 1, chance: 0.06 }
      ]
    }),
    // ----- 11 cảnh KHO VẾT NỨT (không lịch — chờ sự kiện vết nứt) -----
    realmDefBase({
      id: 'vuon_duoc', name: 'Vườn Dược Cổ', mapId: 'realm_vuon_duoc', theme: 'gather',
      minTier: 1, size: '48×36', scheduled: false, riftPool: true,
      treasureRate: 1.7, encounterRate: 0.4, goal: 'clear',
      tags: ['duoc'],
      intro: 'Một mảnh vườn dược bị bỏ quên sau màn sương — linh chi mọc thành từng cụm, thú canh toàn loài hiền.',
      bosses: [],
      rewards: [
        { kind: 'linhThach', n: 45, chance: 1 }, { kind: 'tuvi', n: 30, chance: 1 },
        { kind: 'item', id: 'linh_chi', n: 2, chance: 1 }
      ]
    }),
    realmDefBase({
      id: 'sao_yeu', name: 'Độc Sào Yêu Huyệt', mapId: 'realm_sao_yeu', theme: 'boss',
      minTier: 2, size: '48×36', scheduled: false, riftPool: true,
      treasureRate: 0.6, encounterRate: 1.2, goal: 'boss',
      tags: ['yeu_dan'],
      intro: 'Một sào huyệt đơn độc — một con lang vương trấn giữ kho chiến lợi phẩm của cả bầy.',
      bosses: [{ type: 'soi_rung', x: 7, y: 4, name: 'Độc Sào Lang Vương', hp: 210, atk: 14 }],
      rewards: [
        { kind: 'linhThach', n: 85, chance: 1 }, { kind: 'tuvi', n: 40, chance: 1 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.6 }
      ]
    }),
    realmDefBase({
      id: 'linh_moc', name: 'Linh Mộc Lâm', mapId: 'realm_linh_moc', theme: 'gather',
      minTier: 2, size: '52×38', scheduled: false, riftPool: true,
      treasureRate: 1.6, encounterRate: 0.5, goal: 'clear',
      tags: ['duoc', 'nguyen_lieu'],
      intro: 'Rừng linh mộc quanh một gốc cổ thụ ngàn năm — tụ linh quả chín rộ dưới tán, khỉ rừng canh giữ như vườn nhà.',
      bosses: [],
      rewards: [
        { kind: 'linhThach', n: 50, chance: 1 },
        { kind: 'item', id: 'tu_linh_qua', n: 2, chance: 1 },
        { kind: 'item', id: 'linh_chi', n: 1, chance: 1 }
      ]
    }),
    realmDefBase({
      id: 'linh_thu_vien', name: 'Linh Thú Viên', mapId: 'realm_linh_thu_vien', theme: 'special',
      minTier: 3, size: '52×38', scheduled: false, riftPool: true,
      treasureRate: 0.8, encounterRate: 0.9, goal: 'clear',
      tags: ['trung_linh_thu', 'thu_phuc'],
      intro: 'Một thảo viên linh khí ôn hòa — bầy linh thú hoang sống thảnh thơi quanh tổ trứng, rất hợp để thu phục và tìm trứng.',
      bosses: [],
      rewards: [
        { kind: 'egg', chance: 0.6 },
        { kind: 'linhThach', n: 55, chance: 1 }, { kind: 'tuvi', n: 30, chance: 1 }
      ]
    }),
    realmDefBase({
      id: 'co_chien_truong', name: 'Cổ Chiến Trường', mapId: 'realm_co_chien_truong', theme: 'mixed',
      minTier: 5, size: '56×40', scheduled: false, riftPool: true,
      treasureRate: 1.0, encounterRate: 1.1, goal: 'boss',
      tags: ['linh_thach', 'trang_bi'],
      intro: 'Chiến trường cổ chôn vùi chiến lợi phẩm của hai phe tu sĩ năm xưa — rương còn nguyên, nhưng cốt tướng vẫn chưa yên nghỉ.',
      bosses: [{ type: 'lon_mong_sat', x: 10, y: 4, name: 'Chiến Trường Cốt Tướng', hp: 450, atk: 21 }],
      rewards: [
        { kind: 'linhThach', n: 240, chance: 1 }, { kind: 'tuvi', n: 60, chance: 1 },
        { kind: 'weapon', grade: 'huyen', chance: 0.6 },
        { kind: 'weapon', grade: 'dia', chance: 0.25 }
      ]
    }),
    realmDefBase({
      id: 'dia_mach_hoa', name: 'Địa Mạch Hỏa Huyệt', mapId: 'realm_dia_mach_hoa', theme: 'gather',
      minTier: 6, size: '52×38', scheduled: false, riftPool: true,
      treasureRate: 1.5, encounterRate: 0.8, goal: 'boss',
      tags: ['duoc_hoa', 'dan_duoc'],
      intro: 'Địa mạch hỏa phun trào dưới lòng đất — hỏa diệm liên nở đỏ quanh các hồ dung nham, dược hệ hỏa luyện đan thượng hạng.',
      treasurePool: ['hoa_diem_lien', 'dia_tam_ngoc_tuy', 'thien_nien_linh_nhu', 'tinh_van_thach', 'huyet_sam'],
      bosses: [{ type: 'lon_mong_sat', x: 25, y: 17, name: 'Hỏa Mạch Thủ Thú', hp: 380, atk: 20 }],
      rewards: [
        { kind: 'linhThach', n: 90, chance: 1 }, { kind: 'tuvi', n: 50, chance: 1 },
        { kind: 'item', id: 'hoa_diem_lien', n: 2, chance: 1 }
      ]
    }),
    realmDefBase({
      id: 'kiem_mo', name: 'Kiếm Mộ Cổ', mapId: 'realm_kiem_mo', theme: 'mixed',
      minTier: 7, size: '52×38', scheduled: false, riftPool: true,
      treasureRate: 1.0, encounterRate: 1.1, goal: 'boss',
      tags: ['nguyen_lieu_vu_khi', 'trang_bi'],
      intro: 'Mộ của một kiếm tu vô danh — tinh vẫn thạch cắm quanh quan tài đá như kiếm gãy, thủ linh vẫn ngày đêm mài kiếm ý.',
      bosses: [{ type: 'khi_mat_do', x: 42, y: 8, name: 'Kiếm Mộ Thủ Linh', hp: 480, atk: 23 }],
      rewards: [
        { kind: 'linhThach', n: 140, chance: 1 },
        { kind: 'item', id: 'tinh_van_thach', n: 2, chance: 1 },
        { kind: 'weapon', grade: 'dia', chance: 0.45 },
        { kind: 'item', id: 'bt_rare_van_kiem', n: 1, chance: 0.1 }
      ]
    }),
    realmDefBase({
      id: 'han_bang', name: 'Hàn Băng Động', mapId: 'realm_han_bang', theme: 'gather',
      minTier: 7, size: '52×38', scheduled: false, riftPool: true,
      treasureRate: 1.5, encounterRate: 0.8, goal: 'boss',
      tags: ['duoc_bang', 'dan_duoc'],
      intro: 'Hang băng vạn năm không tan — băng tinh hoa nở trong suốt như thủy tinh giữa tiếng sói hú vọng xa.',
      treasurePool: ['bang_tinh_hoa', 'ngoc_tuy_chi', 'dia_tam_ngoc_tuy', 'thanh_linh_tuy', 'van_nien_linh_chi'],
      bosses: [{ type: 'soi_rung', x: 41, y: 6, name: 'Băng Động Lang Vương', hp: 500, atk: 23 }],
      rewards: [
        { kind: 'linhThach', n: 100, chance: 1 }, { kind: 'tuvi', n: 55, chance: 1 },
        { kind: 'item', id: 'bang_tinh_hoa', n: 2, chance: 1 },
        { kind: 'item', id: 'bt_rare_cuu_u', n: 1, chance: 0.08 }
      ]
    }),
    realmDefBase({
      id: 'bai_tinh_anh', name: 'Bãi Săn Tinh Anh', mapId: 'realm_bai_tinh_anh', theme: 'boss',
      minTier: 8, size: '52×38', scheduled: false, riftPool: true,
      treasureRate: 0.7, encounterRate: 1.8, goal: 'boss',
      tags: ['yeu_dan', 'trung_linh_thu'],
      intro: 'Một bãi đất linh khí đặc đến mức yêu thú nào sống ở đây cũng hóa tinh anh — đất săn yêu đan khét tiếng, kẻ yếu chớ vào.',
      bosses: [{ type: 'son_quan', x: 25, y: 18, name: 'Tinh Anh Yêu Vương', hp: 620, atk: 26 }],
      rewards: [
        { kind: 'linhThach', n: 220, chance: 1 },
        { kind: 'item', id: 'yeu_dan_1', n: 2, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.55 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.12 },
        { kind: 'egg', chance: 0.3 }
      ]
    }),
    realmDefBase({
      id: 'thuy_phu', name: 'Thủy Phủ Tàn Cung', mapId: 'realm_thuy_phu', theme: 'mixed',
      minTier: 9, size: '56×40', scheduled: false, riftPool: true,
      treasureRate: 1.3, encounterRate: 1.2, goal: 'boss',
      tags: ['nguyen_lieu_cao', 'yeu_dan'],
      intro: 'Tàn cung dưới đáy hồ linh — giao thú trấn giữ kho báu chìm, vạn niên linh chi mọc trên thềm đá ngập nước.',
      bosses: [{ type: 'lon_mong_sat', x: 27, y: 6, name: 'Thủy Phủ Giao Thú', hp: 660, atk: 27 }],
      rewards: [
        { kind: 'linhThach', n: 180, chance: 1 },
        { kind: 'item', id: 'van_nien_linh_chi', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.4 },
        { kind: 'artifact', grade: 'dia', chance: 0.3 }
      ]
    }),
    realmDefBase({
      id: 'loi_vuc', name: 'Lôi Vực Tàn Tích', mapId: 'realm_loi_vuc', theme: 'special',
      minTier: 10, lockRealm: 'truc_co', size: '48×36', scheduled: false, riftPool: true,
      treasureRate: 1.2, encounterRate: 1.4, goal: 'boss',
      tags: ['tu_vi', 'nguyen_lieu_cao'],
      intro: 'Tàn tích một đài độ kiếp xưa — thiên lôi quả đọng điện quang quanh đài đá vỡ. Linh khí nơi đây hung hãn, phi Trúc Cơ chớ bén mảng.',
      bosses: [{ type: 'khi_mat_do', x: 23, y: 4, name: 'Lôi Vực Thiên Lôi Thú', hp: 700, atk: 28 }],
      rewards: [
        { kind: 'tuvi', n: 300, chance: 1 },
        { kind: 'item', id: 'thien_loi_qua', n: 2, chance: 1 },
        { kind: 'linhThach', n: 170, chance: 1 }
      ]
    })
  ];
  function realmById(id) {
    for (var i = 0; i < POOL.length; i++) if (POOL[i].id === id) return POOL[i];
    return null;
  }
  function rankOf(ch) {
    if (M && M.realmRankOf) return M.realmRankOf(ch);
    if (!ch) return 0;
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    return (typeof ch.tier === 'number' && ch.tier > 0) ? 1 : 0;
  }
  // Đủ điều kiện cảnh giới vào 1 cảnh: cảnh khóa Trúc Cơ cần realmRank>=2,
  // còn lại cần tầng Luyện Khí >= minTier.
  function realmTierOk(def, ch) {
    if (!def || !ch) return false;
    if (def.lockRealm) return rankOf(ch) >= 2;
    return (typeof ch.tier === 'number' ? ch.tier : 0) >= (def.minTier || 0);
  }
  // ---------- Lịch LUÂN PHIÊN của nhóm định kỳ ----------
  function realmSessionAt(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < POOL.length; i++) {
      var def = POOL[i];
      if (!def.scheduled || !def.sessions) continue;
      for (var j = 0; j < def.sessions.length; j++) {
        var start = base + def.sessions[j] * 60000;
        var end = start + def.durationMin * 60000;
        if (now >= start && now < end) {
          return { realmId: def.id, def: def, index: j, start: start, end: end, key: def.id + '@' + dayKey(now) + '#' + j };
        }
      }
    }
    return null;
  }
  function openRealm(now) { var s = realmSessionAt(now); return s ? s.def : null; }
  function anyOpen(now) { return !!realmSessionAt(now); }
  function nextRealmOpen(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var best = null;
    POOL.forEach(function (def) {
      if (!def.scheduled || !def.sessions) return;
      def.sessions.forEach(function (m) {
        var start = base + m * 60000;
        if (start > now && (!best || start < best.start)) best = { realmId: def.id, def: def, start: start, dayOffset: 0 };
        var startT = start + 86400000;
        if (!best || startT < best.start) { if (start <= now) best = { realmId: def.id, def: def, start: startT, dayOffset: 1 }; }
      });
    });
    return best;
  }
  function nextStartOf(def, now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var list = (def.sessions || []).map(function (m) { return base + m * 60000; }).sort(function (a, b) { return a - b; });
    for (var i = 0; i < list.length; i++) if (now < list[i]) return { start: list[i], dayOffset: 0 };
    return list.length ? { start: list[0] + 86400000, dayOffset: 1 } : null;
  }
  // ---------- Lượt vào theo cảnh (đếm riêng từng cảnh) ----------
  function realmEntriesUsed(flags, key) { var s = ensure(flags); return s ? num(s.realmEntries[key], 0) : 0; }
  function realmDayCount(flags, id) { var s = ensure(flags); return s ? num(s.realmDay.counts[id], 0) : 0; }
  function canEnterRealm(id, flags, now, opts) {
    var def = realmById(id);
    if (!def || !def.scheduled) return { ok: false, reason: 'unknown' };
    var s = ensure(flags, now); if (!s) return { ok: false, reason: 'nosave' };
    if (s.run) return { ok: false, reason: 'inrun' };
    opts = opts || {};
    if (!opts.hasRoot) return { ok: false, reason: 'noroot' };
    var ses = realmSessionAt(now);
    if (!ses || ses.realmId !== id) return { ok: false, reason: 'closed' };
    if ((opts.tier || 0) < (def.minTier || 0)) return { ok: false, reason: 'tierlow', minTier: def.minTier };
    if (realmEntriesUsed(flags, ses.key) >= def.maxPerSession) return { ok: false, reason: 'sessionlimit' };
    if (realmDayCount(flags, id) >= def.maxPerDay) return { ok: false, reason: 'daylimit' };
    return { ok: true, session: ses, def: def };
  }
  function beginRealmRun(id, flags, now, opts, returnTo) {
    var chk = canEnterRealm(id, flags, now, opts);
    if (!chk.ok) return chk;
    var s = ensure(flags, now);
    var def = chk.def;
    s.realmEntries[chk.session.key] = realmEntriesUsed(flags, chk.session.key) + 1;
    s.realmDay.counts[id] = realmDayCount(flags, id) + 1;
    s.run = {
      kind: 'dinh_ky', realmId: id, mapId: def.mapId, sessionKey: chk.session.key,
      endAt: chk.session.end, returnTo: returnTo, kills: 0, need: 0,
      needBoss: Math.max(1, (def.bosses || []).length), bossKills: 0,
      rewarded: false, encounterUsed: false, treasures: []
    };
    s.run.treasures = placeTreasures(def, (opts && opts.rng) || null);
    return { ok: true, run: s.run, def: def };
  }
  function rotationStatus(flags, now) {
    var ses = realmSessionAt(now);
    return POOL.filter(function (d) { return d.scheduled; }).map(function (d) {
      var open = !!ses && ses.realmId === d.id;
      return {
        id: d.id, name: d.name, theme: d.theme, minTier: d.minTier, size: d.size,
        open: open, endsInSec: open ? Math.max(0, Math.round((ses.end - now) / 1000)) : 0,
        next: open ? null : nextStartOf(d, now),
        entriesLeftSession: open ? Math.max(0, d.maxPerSession - realmEntriesUsed(flags, ses.key)) : d.maxPerSession,
        entriesLeftToday: Math.max(0, d.maxPerDay - realmDayCount(flags, d.id))
      };
    });
  }
  // ---------- VẾT NỨT HƯ KHÔNG (mức dữ liệu — sự kiện để sau) ----------
  // Chọn ngẫu nhiên 1 cảnh trong kho mà người chơi đủ điều kiện tầng,
  // tránh lặp lại cảnh vừa vào gần nhất (avoidId). Trả def hoặc null.
  function pickRiftRealm(rng, ch, avoidId) {
    var rand = rng || Math.random;
    var elig = POOL.filter(function (d) { return d.riftPool && realmTierOk(d, ch || {}); });
    if (!elig.length) return null;
    var rest = elig.filter(function (d) { return d.id !== avoidId; });
    if (rest.length) elig = rest;
    return elig[Math.floor(rand() * elig.length) % elig.length];
  }
  // ---------- THIÊN TÀI ĐỊA BẢO ngẫu nhiên trong cảnh ----------
  var DEFAULT_TREASURE_POOL = [
    { id: 'thien_nien_linh_nhu', w: 3 }, { id: 'dia_tam_ngoc_tuy', w: 3 }, { id: 'ngu_hanh_linh_chau', w: 2 },
    { id: 'van_nien_linh_chi', w: 3 }, { id: 'tinh_van_thach', w: 3 }, { id: 'son_tinh', w: 2 },
    { id: 'thanh_linh_tuy', w: 3 }, { id: 'long_tien_thao', w: 2 }, { id: 'thien_loi_qua', w: 2 },
    { id: 'hoa_diem_lien', w: 2 }, { id: 'bang_tinh_hoa', w: 2 }, { id: 'ngoc_tuy_chi', w: 3 }
  ];
  function rollTreasureCount(def, rng) {
    var rand = rng || Math.random, p = 0.45 * (def.treasureRate || 0), n = 0;
    for (var i = 0; i < 3; i++) if (rand() < p) n++;
    return n;
  }
  function pickTreasureItem(def, rand) {
    var pool = (def.treasurePool && def.treasurePool.length)
      ? def.treasurePool.map(function (id) { return { id: id, w: 1 }; })
      : DEFAULT_TREASURE_POOL;
    var total = pool.reduce(function (s, p) { return s + p.w; }, 0);
    var r = rand() * total;
    for (var i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) return pool[i].id; }
    return pool[0].id;
  }
  // Lăn + đặt bảo vật cho 1 lượt vào cảnh: chỉ ô đi được, không trùng
  // start/exit/quái/dược/boss, cách start >= 3 ô, cách nhau >= 5 ô.
  function placeTreasures(def, rng) {
    var map = REALM_MAPS[def.mapId];
    if (!map) return [];
    var rand = rng || Math.random;
    var n = rollTreasureCount(def, rand);
    if (!n) return [];
    var occ = {};
    function mark(x, y) { occ[x + ',' + y] = true; }
    mark(map.start.x, map.start.y); mark(map.exit.x, map.exit.y);
    (map.monsters || []).forEach(function (m) { mark(m.x, m.y); });
    (map.herbs || []).forEach(function (hb) { mark(hb.x, hb.y); });
    (def.bosses || []).forEach(function (b) { mark(b.x, b.y); });
    var cand = [];
    for (var y = 1; y < map.h - 1; y++) for (var x = 1; x < map.w - 1; x++) {
      if (occ[x + ',' + y] || M.isBlockedIn(map, x, y)) continue;
      if (Math.abs(x - map.start.x) + Math.abs(y - map.start.y) < 3) continue;
      cand.push({ x: x, y: y });
    }
    // Trộn Fisher–Yates bằng rng tiêm được (test gieo hạt được).
    for (var i = cand.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)) % (i + 1); var tmp = cand[i]; cand[i] = cand[j]; cand[j] = tmp; }
    var out = [];
    for (var k = 0; k < cand.length && out.length < n; k++) {
      var c = cand[k], far = true;
      for (var q = 0; q < out.length; q++) if (Math.abs(out[q].x - c.x) + Math.abs(out[q].y - c.y) < 5) { far = false; break; }
      if (far) out.push({ x: c.x, y: c.y, item: pickTreasureItem(def, rand), taken: false });
    }
    return out;
  }
  function treasuresFor(flags) {
    var s = ensure(flags); if (!s || !s.run) return [];
    return s.run.treasures || [];
  }
  function markTreasureTaken(flags, x, y) {
    var s = ensure(flags); if (!s || !s.run || !s.run.treasures) return null;
    for (var i = 0; i < s.run.treasures.length; i++) {
      var t = s.run.treasures[i];
      if (t.x === x && t.y === y && !t.taken) { t.taken = true; return t; }
    }
    return null;
  }
  // ---------- KỲ NGỘ ĐÁNH BOSS TRONG CẢNH (scale theo cảnh giới) ----
  // Bảng hệ số theo TẦNG Luyện Khí (chỉ số tier 0..9). Cột realmRank:
  // rank >= 2 (Trúc Cơ+) nhân thêm hp x(1+0.8*(rank-1)), atk
  // x(1+0.35*(rank-1)) — để sẵn cho khi hệ Trúc Cơ mở.
  var SCALE_ROWS = [
    { hp: 0.9, atk: 0.9 }, { hp: 1.1, atk: 1.0 }, { hp: 1.3, atk: 1.1 }, { hp: 1.55, atk: 1.2 },
    { hp: 1.8, atk: 1.35 }, { hp: 2.1, atk: 1.5 }, { hp: 2.45, atk: 1.65 }, { hp: 2.85, atk: 1.85 },
    { hp: 3.3, atk: 2.05 }, { hp: 3.8, atk: 2.3 }
  ];
  // HÀM DÙNG CHUNG: co giãn chỉ số 1 quái gốc theo tầng + hạng cảnh giới
  // của người chơi. base: {hp, atk, linhThach} từ L.MONSTERS.
  function scaleMonsterStats(base, tier, rank) {
    var t = Math.max(0, Math.min(9, tier | 0));
    var row = SCALE_ROWS[t];
    var hpM = row.hp, atkM = row.atk;
    if (rank >= 2) { hpM *= 1 + 0.8 * (rank - 1); atkM *= 1 + 0.35 * (rank - 1); }
    return {
      maxHp: Math.max(1, Math.round(base.hp * hpM)),
      atk: Math.max(1, Math.round(base.atk * atkM)),
      def: Math.round(t * 1.5 * (rank >= 2 ? 2 : 1)),
      linhThach: Math.round((base.linhThach || 0) * (1 + 0.3 * t))
    };
  }
  var ENCOUNTER_BASE = 0.10; // tỉ lệ gốc mỗi sự kiện hạ quái/hái dược trong cảnh, nhân encounterRate của cảnh
  var ENCOUNTER_TYPES = ['soi_rung', 'lon_mong_sat', 'khi_mat_do', 'ran_luc'];
  // Lăn kỳ ngộ trong cảnh: tối đa 1 lần/lượt (run.encounterUsed). Trả
  // def spawn {type, extra} cho game.js đặt gần người chơi, hoặc null.
  function rollEncounter(flags, ch, rng) {
    var s = ensure(flags); if (!s || !s.run) return null;
    if (s.run.encounterUsed) return null;
    var def = s.run.realmId ? realmById(s.run.realmId) : realmById('liet_khach');
    if (!def) return null;
    var rand = rng || Math.random;
    if (rand() >= ENCOUNTER_BASE * (def.encounterRate || 0)) return null;
    var types = def.encounterTypes || ENCOUNTER_TYPES;
    var type = types[Math.floor(rand() * types.length) % types.length];
    var base = (L && L.MONSTERS) ? L.MONSTERS[type] : null;
    if (!base) return null;
    var tier = (ch && typeof ch.tier === 'number') ? ch.tier : 0;
    var st = scaleMonsterStats(base, tier, rankOf(ch));
    var elite = rand() < 0.3;
    if (elite) { st.maxHp = Math.round(st.maxHp * 1.8); st.atk = Math.round(st.atk * 1.25); }
    s.run.encounterUsed = true;
    return {
      type: type,
      extra: {
        name: (elite ? 'Tinh Anh Kỳ Ngộ · ' : 'Kỳ Ngộ · ') + base.name,
        noRespawn: true, riftEncounter: true, encounterElite: elite,
        maxHp: st.maxHp, hp: st.maxHp, atk: st.atk, def: st.def, linhThach: st.linhThach
      }
    };
  }
  // Thưởng hạ boss kỳ ngộ — theo MỨC co giãn của người chơi: Luyện Khí
  // thấp Cấp 1; tầng 8–9 thêm Cấp 2 chắc hơn; mức tương đương Trúc Cơ
  // (rank>=2) mới có cơ hội Yêu Đan Cấp 3.
  function rollEncounterRewards(ch, rng) {
    var rand = rng || Math.random;
    var tier = (ch && typeof ch.tier === 'number') ? ch.tier : 0;
    var rank = rankOf(ch);
    var out = [{ kind: 'linhThach', n: 10 + tier * 4 + Math.floor(rand() * 7) }]; // thang kinh te docs/economy.md
    function push(kind, id, n, chance) {
      if (rand() < chance) { var e = { kind: kind }; if (id) e.id = id; if (n) e.n = n; out.push(e); }
    }
    if (rank >= 2) {
      push('item', 'yeu_dan_1', 1, 1); push('item', 'yeu_dan_2', 1, 0.5);
      push('item', 'yeu_dan_3', 1, 0.2); push('egg', null, 0, 0.25);
    } else if (tier >= 8) {
      push('item', 'yeu_dan_1', 1, 1); push('item', 'yeu_dan_2', 1, 0.45); push('egg', null, 0, 0.2);
    } else if (tier >= 5) {
      push('item', 'yeu_dan_1', 1, 0.7); push('item', 'yeu_dan_2', 1, 0.25); push('egg', null, 0, 0.15);
    } else {
      push('item', 'yeu_dan_1', 1, 0.5);
    }
    return out;
  }

  // ---------- Kỳ ngộ ----------
  function validOffer(flags, now) {
    var s = ensure(flags, now); if (!s || !s.fateOffer) return null;
    if (now - s.fateOffer.at > FATE.offerTtlMs) { s.fateOffer = null; return null; }
    return s.fateOffer;
  }
  // Lăn kỳ ngộ sau 1 sự kiện farm. opts: {kind:'kill'|'gather', eligible}
  // (eligible do game.js quyết: đã lộ linh căn, ngoài trời, không trong
  // run, không có mời đang chờ). rng tiêm được để test.
  function rollFate(flags, opts, now, rng) {
    var s = ensure(flags, now); if (!s) return null;
    opts = opts || {};
    if (!opts.eligible) return null;
    if (s.run || validOffer(flags, now)) return null;
    if (now - s.lastFateAt < FATE.minGapMs) return null; // chống spam
    var rand = rng || Math.random;
    var chance = opts.kind === 'gather' ? FATE.chanceGather : FATE.chanceKill;
    if (rand() >= chance) return null;
    var tpl = FATE.templates[Math.floor(rand() * FATE.templates.length) % FATE.templates.length];
    s.lastFateAt = now; // tính từ lúc MỜI xuất hiện — bỏ qua cũng tốn nhịp chờ
    s.fateOffer = { templateId: tpl.id, at: now };
    return s.fateOffer;
  }
  function declineFate(flags) {
    var s = ensure(flags); if (!s) return false;
    var had = !!s.fateOffer;
    s.fateOffer = null;
    return had;
  }
  function acceptFate(flags, now, returnTo) {
    var s = ensure(flags, now); if (!s) return { ok: false, reason: 'nosave' };
    if (s.run) return { ok: false, reason: 'inrun' };
    var offer = validOffer(flags, now);
    if (!offer) return { ok: false, reason: 'nooffer' };
    var tpl = templateById(offer.templateId);
    if (!tpl) return { ok: false, reason: 'notemplate' };
    s.fateOffer = null;
    s.run = {
      kind: 'ky_ngo', mapId: FATE.mapId, templateId: tpl.id,
      endAt: now + FATE.runLimitMs, returnTo: returnTo,
      kills: 0, need: tpl.spawns.length, rewarded: false
    };
    return { ok: true, run: s.run, template: tpl };
  }
  // ---------- Tiến độ trong bí cảnh ----------
  // info: {boss:true} khi hạ boss bí cảnh định kỳ; kỳ ngộ tính theo số quái gác.
  function noteKill(flags, info) {
    var s = ensure(flags); if (!s || !s.run) return { active: false, completed: false };
    var run = s.run;
    run.kills += 1;
    var done;
    if (run.kind === 'dinh_ky' && run.realmId) {
      // Kho mới: run nhiều sào boss — hạ đủ bossKills/needBoss mới hoàn thành.
      if (info && info.boss) run.bossKills = (run.bossKills || 0) + 1;
      done = (run.bossKills || 0) >= (run.needBoss || 1);
    } else {
      done = run.kind === 'dinh_ky' ? !!(info && info.boss) : run.kills >= run.need;
    }
    return { active: true, completed: done && !run.rewarded, kills: run.kills, need: run.need, bossKills: run.bossKills || 0, needBoss: run.needBoss || 0 };
  }
  function markRewarded(flags) {
    var s = ensure(flags); if (!s || !s.run) return false;
    s.run.rewarded = true;
    return true;
  }
  function clearRun(flags) {
    var s = ensure(flags); if (!s) return null;
    var run = s.run; s.run = null;
    return run;
  }
  function runExpired(flags, now) {
    var s = ensure(flags, now); if (!s || !s.run) return false;
    return now >= s.run.endAt;
  }
  // Lăn bảng thưởng của 1 run thành danh sách cụ thể (rng tiêm được).
  function rollRewards(run, rng) {
    if (!run) return [];
    var table;
    if (run.kind === 'dinh_ky') {
      var rd = run.realmId ? realmById(run.realmId) : null;
      table = rd ? rd.rewards : SCHEDULED.rewards;
    } else {
      table = (templateById(run.templateId) || {}).rewards;
    }
    if (!table) return [];
    var rand = rng || Math.random, out = [];
    table.forEach(function (r) {
      if (rand() < (r.chance == null ? 1 : r.chance)) {
        var e = { kind: r.kind };
        if (r.id) e.id = r.id;
        if (r.n) e.n = r.n;
        if (r.grade) e.grade = r.grade;
        out.push(e);
      }
    });
    return out;
  }
  // Mô tả spawn phụ khi vào 1 map instance (game.js diễn giải bằng
  // makeMonster của engine): boss định kỳ hoặc đàn quái gác kỳ ngộ.
  function entrySpawns(flags, mapId) {
    var s = ensure(flags); if (!s || !s.run || s.run.mapId !== mapId) return [];
    if (s.run.kind === 'dinh_ky') {
      var rdef = s.run.realmId ? realmById(s.run.realmId) : null;
      var blist = rdef ? (rdef.bosses || []) : [{
        type: SCHEDULED.bossType, x: SCHEDULED.bossSpawn.x, y: SCHEDULED.bossSpawn.y,
        name: SCHEDULED.bossName, hp: SCHEDULED.bossHp, atk: SCHEDULED.bossAtk
      }];
      return blist.map(function (b) {
        return {
          type: b.type, x: b.x, y: b.y,
          extra: { name: b.name, boss: true, noRespawn: true, realmBoss: true, maxHp: b.hp, hp: b.hp, atk: b.atk, linhThach: 0 }
        };
      });
    }
    var tpl = templateById(s.run.templateId);
    if (!tpl) return [];
    return tpl.spawns.map(function (sp) {
      return { type: sp.type, x: sp.x, y: sp.y, extra: { noRespawn: true, realmGuard: true } };
    });
  }

  var api = {
    SCHEDULED: SCHEDULED, FATE: FATE, REALM_MAPS: REALM_MAPS,
    isRealmMap: isRealmMap, registerMaps: registerMaps, templateById: templateById,
    POOL: POOL, realmById: realmById, realmTierOk: realmTierOk, rankOf: rankOf,
    realmSessionAt: realmSessionAt, openRealm: openRealm, anyOpen: anyOpen,
    nextRealmOpen: nextRealmOpen, nextStartOf: nextStartOf, rotationStatus: rotationStatus,
    canEnterRealm: canEnterRealm, beginRealmRun: beginRealmRun,
    realmEntriesUsed: realmEntriesUsed, realmDayCount: realmDayCount,
    pickRiftRealm: pickRiftRealm,
    rollTreasureCount: rollTreasureCount, placeTreasures: placeTreasures,
    treasuresFor: treasuresFor, markTreasureTaken: markTreasureTaken,
    SCALE_ROWS: SCALE_ROWS, scaleMonsterStats: scaleMonsterStats,
    rollEncounter: rollEncounter, rollEncounterRewards: rollEncounterRewards,
    ENCOUNTER_BASE: ENCOUNTER_BASE, DEFAULT_TREASURE_POOL: DEFAULT_TREASURE_POOL,
    ensure: ensure, dayKey: dayKey, sessionAt: sessionAt, nextSession: nextSession,
    status: status, canEnter: canEnter, beginRun: beginRun,
    rollFate: rollFate, declineFate: declineFate, acceptFate: acceptFate, validOffer: validOffer,
    noteKill: noteKill, markRewarded: markRewarded, clearRun: clearRun,
    runExpired: runExpired, rollRewards: rollRewards, entrySpawns: entrySpawns
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_SECRET_REALMS = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
