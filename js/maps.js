// Phàm Nhân Tu Đạo — chuỗi map liền mạch, qua cổng không màn hình chờ:
// map 1 Làng Thanh Khê (trấn bắc, Nam Môn, ngoại ô nam), map 2 Rừng Thanh Sơn
// (nối Cổng Rừng ở mép nam map 1), map 3 Chân Núi Thanh Phong (nối Cổng Bắc ở
// mép bắc map 1). Tilemap chỉ giữ logic; hình nền là ảnh AI khớp bố cục.
// V7 (mở rộng map): cả 3 map nới từ 40x30 lên 56x40 ô — thêm đất phía đông
// (x40..55) và phía nam (y30..39). Vùng lõi cũ (x<40, y<30) GIỮ NGUYÊN tọa độ:
// giếng (19,7), cổng liên map (hàng 0/29, cột 17..22), NPC, điểm bắt đầu,
// bossSpawn đều không đổi; chỉ nền đổi sang ảnh *-bg-v7.png (nền cũ dán
// nguyên vẹn ở góc trên-trái, đất mới là ảnh AI sinh tiếp cùng phong cách).
// Đất quái tổ chức thành KHU RIÊNG theo loài (trường zones của từng map):
// mỗi khu có rect(s) riêng, biển tên khu (props sign), quái spawn/respawn
// trong khu của nó (game.js hồi sinh quái tại điểm spawn, lang thang ±4 ô).
// Tiles: '.' cỏ/đất, '#' đường, 'Q' sân đá, 'W' tường/vách (chặn), 'G' cổng (đi được),
// 'H' nhà (chặn), 'T' cây (chặn), 'S' sạp/xe (chặn), 'L' đèn (chặn), 'F' hàng rào (chặn),
// 'C' ruộng, 'o' đá (chặn), 'E' giếng (chặn), 'R' suối (chặn).
(function () {
  'use strict';
  var W = 56, H = 40;
  var BLOCKED = { W: 1, H: 1, T: 1, S: 1, L: 1, F: 1, o: 1, E: 1, R: 1 };
  function grid(fill) {
    var g = [], y, x;
    for (y = 0; y < H; y++) { var row = []; for (x = 0; x < W; x++) row.push(fill); g.push(row); }
    return g;
  }
  function rect(g, x0, y0, x1, y1, ch) {
    for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch;
  }
  function set(g, x, y, ch) { g[y][x] = ch; }
  function join(g) { return g.map(function (row) { return row.join(''); }); }
  function hash01(x, y) {
    var h = (x * 73856093) ^ (y * 19349663) ^ 98764321;
    return (((h % 1000) + 1000) % 1000) / 1000;
  }
  // ================= MAP 1 — Làng Thanh Khê (giữ nguyên hành vi cũ) =================
  function buildTiles1() {
    var g = grid('.'), y, x;
    rect(g, 14, 5, 25, 9, 'Q');            // sân trấn
    for (x = 0; x < W; x++) g[10][x] = '#'; // đường ngang trấn
    for (y = 5; y < H; y++) { g[y][19] = '#'; g[y][20] = '#'; } // đường dọc qua cổng xuống ngoại ô
    for (x = 0; x < W; x++) g[14][x] = 'W'; // tường thành
    g[14][19] = 'G'; g[14][20] = 'G';   // cổng Nam Môn
    rect(g, 4, 6, 9, 8, 'C');              // ruộng
    [[3, 6], [3, 7], [3, 8], [10, 6], [10, 7], [10, 8]].forEach(function (p) { set(g, p[0], p[1], 'F'); });
    [[6, 3], [32, 3]].forEach(function (p) { set(g, p[0], p[1], 'H'); });
    // V5: sạp/gian hàng nằm ở hàng 12, khớp vị trí sạp/giá phơi/lán trong ảnh nền AI.
    [[6, 12], [7, 12], [8, 12], [11, 12], [12, 12], [13, 12], [15, 12], [16, 12], [17, 12],
     [23, 12], [24, 12], [26, 12], [27, 12], [31, 12], [32, 12]].forEach(function (p) { set(g, p[0], p[1], 'S'); });
    [[14, 5], [25, 5], [14, 9], [25, 9]].forEach(function (p) { set(g, p[0], p[1], 'L'); });
    [[4, 2], [35, 2], [3, 12], [36, 12],
     [6, 17], [10, 21], [15, 26], [22, 19], [28, 18], [33, 22], [8, 25], [31, 27], [17, 29], [25, 29],
     [4, 16], [36, 16],
     [4, 20], [35, 20]
    ].forEach(function (p) { set(g, p[0], p[1], 'T'); });
    [[3, 18], [29, 21], [21, 21], [16, 24], [24, 26], [27, 25], [33, 26], [4, 25]
    ].forEach(function (p) { set(g, p[0], p[1], 'o'); });
    set(g, 19, 7, 'E'); // giếng cổ (điểm kỳ ngộ)
    // ---- V7: đất mới phía đông (Xóm Đông) + phía nam (bãi nam) ----
    rect(g, 40, 0, 55, 5, 'C');            // ruộng đông bắc
    rect(g, 41, 1, 46, 1, 'R');            // mương nước trong ruộng (khớp ảnh)
    rect(g, 48, 3, 52, 3, 'R');
    rect(g, 41, 4, 44, 4, 'R');
    rect(g, 40, 11, 44, 13, 'C');          // thửa ruộng nhỏ cạnh xóm
    [[46, 9], [47, 9], [51, 9], [52, 9], [47, 11], [52, 11]].forEach(function (p) { set(g, p[0], p[1], 'H'); }); // nhà Xóm Đông
    [[47, 15], [50, 15], [53, 15], [47, 17], [51, 17]].forEach(function (p) { set(g, p[0], p[1], 'S'); });        // sạp chợ đông
    [[44, 19], [46, 19], [48, 19], [50, 19], [52, 19], [54, 19]].forEach(function (p) { set(g, p[0], p[1], 'F'); }); // hàng rào ruộng
    set(g, 54, 6, 'T');
    // Ao sen tây nam (khớp ảnh nền): vùng nước y34..38.
    rect(g, 5, 35, 11, 35, 'R'); rect(g, 4, 36, 12, 37, 'R'); rect(g, 5, 38, 11, 38, 'R');
    rect(g, 27, 32, 33, 34, 'C');          // ruộng nam
    // Rải cây/đá ở đất hoang mới (băm tất định, né đường/ao/ruộng).
    for (y = 15; y < H; y++) for (x = 40; x < W; x++) {
      if (g[y][x] !== '.') continue;
      if (hash01(x + 7, y) < 0.16) set(g, x, y, 'T');
      else if (hash01(y + 3, x) > 0.96) set(g, x, y, 'o');
    }
    for (y = 30; y < H; y++) for (x = 0; x < 40; x++) {
      if (g[y][x] !== '.') continue;
      if (x >= 17 && x <= 22) continue;    // dải đường chính + lối cổng
      if (hash01(x, y + 11) < 0.15) set(g, x, y, 'T');
      else if (hash01(y, x + 5) > 0.965) set(g, x, y, 'o');
    }
    // Điểm spawn quái / điểm hái / biển khu ở đất mới phải đi được.
    [[46, 17], [52, 20], [49, 21], [43, 21], [51, 25], [44, 26], [51, 30],
     [12, 30], [30, 24], [24, 31], [48, 36], [24, 37], [12, 35], [36, 38],
     [8, 33], [30, 35], [46, 33], [22, 16], [22, 23], [40, 24], [41, 11], [28, 30]
    ].forEach(function (p) { set(g, p[0], p[1], '.'); });
    // Cổng liên map: Cổng Bắc (y0) -> map 3, Cổng Rừng (y29) -> map 2.
    // Dải cổng rộng 17..22 (khoan dung khi đi lệch lối), ghi đè cả cây ở (17,29).
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { set(g, gx, 0, 'G'); set(g, gx, 29, 'G'); });
    return join(g);
  }
  // Cổng ở mép map: dải 6 ô (17..22) đều qua được, điểm rơi giữ ở 2 ô giữa (19/20).
  function edgePortals(y, to, ty, name) {
    return [17, 18, 19, 20, 21, 22].map(function (x) {
      return { x: x, y: y, to: to, tx: x <= 19 ? 19 : 20, ty: ty, name: name };
    });
  }
  // Cổng PHÂN TẦNG (chuỗi Đại Sơn): như edgePortals nhưng mỗi ô cổng mang
  // minTier (tầng Luyện Khí tối thiểu) + reqLabel (nhãn cảnh giới hiện trong
  // thông báo chặn). game.js checkPortal kiểm tra trước khi cho qua; cổng
  // chiều về KHÔNG dùng helper này nên không bao giờ khóa.
  function edgePortalsTier(y, to, ty, name, minTier, reqLabel) {
    return [17, 18, 19, 20, 21, 22].map(function (x) {
      return { x: x, y: y, to: to, tx: x <= 19 ? 19 : 20, ty: ty, name: name, minTier: minTier, reqLabel: reqLabel };
    });
  }
  var MAP = {
    id: 'map1', name: 'Làng Thanh Khê', bg: 'assets/map1-bg-v7.png',
    w: W, h: H, tiles: buildTiles1(), blocked: BLOCKED,
    start: { x: 19, y: 9 },
    gate: { x: 19, y: 14, w: 2, name: 'Nam Môn' },
    well: { x: 19, y: 7 },
    wildY: 15,
    portals: edgePortals(29, 'map2', 1, 'Cổng Rừng').concat(edgePortals(0, 'map3', 28, 'Cổng Bắc')),
    npcs: [
      { id: 'truong_lang', x: 18, y: 7 },
      { id: 'chu_quan', x: 16, y: 11 },
      { id: 'dai_phu', x: 22, y: 7 },
      { id: 'hoc_tro', x: 23, y: 8 },
      { id: 'tho_ren', x: 12, y: 8 },
      // Playtest thật 12:46 30/10: hai lính gác lùi xuống hàng sân cổng
      // (y 15->16) và Dì Tư rời ô đường (20,11)->(21,11): hàng đáp cổng
      // trống hoàn toàn, họng Nam Môn + đường chợ->giếng giữ hành lang
      // >= 2 ô, không NPC nào đứng giữa lối duy nhất (luật L8 trong
      // tools/audit-layout.js). Lính gác giữ nguyên cột 18/21 vì cột 17
      // phạm L2 với bãi gà thỏ phía nam (spawn cách NPC >= 3 ô).
      { id: 'linh_gac', x: 18, y: 16 },
      { id: 'linh_gac2', x: 21, y: 16, sprite: 'linh_gac', name: 'A Báo', role: 'Lính gác cổng Nam Môn (ca đêm)' },
      { id: 'chap_su_thu_trieu', x: 22, y: 13 },
      { id: 'tieu_thuong', x: 24, y: 11 },
      { id: 'le_su', x: 21, y: 11, sprite: 'chu_quan', name: 'Dì Tư', role: 'Người lo lễ hội làng Thanh Khê' }
    ],
    zones: [
      { id: 'ga_tho', name: 'Bãi Gà Thỏ', rects: [[4, 15, 55, 21]], types: ['ga_rung', 'tho_hoang'] },
      { id: 'soi_con', name: 'Khu Sói Con', rects: [[4, 22, 38, 32]], types: ['soi_con'] },
      { id: 'lon_rung', name: 'Khu Lợn Rừng', rects: [[39, 22, 55, 32], [4, 33, 55, 39]], types: ['lon_rung'] }
    ],
    monsters: [
      { type: 'ga_rung', x: 15, y: 17, zone: 'ga_tho' }, { type: 'ga_rung', x: 24, y: 18, zone: 'ga_tho' }, { type: 'ga_rung', x: 20, y: 20, zone: 'ga_tho' },
      { type: 'ga_rung', x: 46, y: 17, zone: 'ga_tho' }, { type: 'ga_rung', x: 52, y: 20, zone: 'ga_tho' },
      { type: 'tho_hoang', x: 12, y: 20, zone: 'ga_tho' }, { type: 'tho_hoang', x: 30, y: 19, zone: 'ga_tho' }, { type: 'tho_hoang', x: 36, y: 20, zone: 'ga_tho' },
      { type: 'tho_hoang', x: 17, y: 21, zone: 'ga_tho' }, { type: 'tho_hoang', x: 49, y: 21, zone: 'ga_tho' },
      { type: 'soi_con', x: 14, y: 24, zone: 'soi_con' }, { type: 'soi_con', x: 26, y: 26, zone: 'soi_con' }, { type: 'soi_con', x: 16, y: 23, zone: 'soi_con' },
      { type: 'soi_con', x: 12, y: 30, zone: 'soi_con' }, { type: 'soi_con', x: 30, y: 24, zone: 'soi_con' }, { type: 'soi_con', x: 28, y: 32, zone: 'soi_con' },
      { type: 'lon_rung', x: 44, y: 26, zone: 'lon_rung' }, { type: 'lon_rung', x: 51, y: 30, zone: 'lon_rung' },
      { type: 'lon_rung', x: 48, y: 36, zone: 'lon_rung' }, { type: 'lon_rung', x: 24, y: 37, zone: 'lon_rung' },
      { type: 'lon_rung', x: 12, y: 35, zone: 'lon_rung' }, { type: 'lon_rung', x: 36, y: 38, zone: 'lon_rung' }
    ],
    herbs: [
      { x: 13, y: 19, item: 'thao_duoc' }, { x: 25, y: 21, item: 'thao_duoc' }, { x: 18, y: 26, item: 'thao_duoc' },
      { x: 29, y: 24, item: 'thao_duoc' }, { x: 11, y: 23, item: 'thao_duoc' },
      { x: 43, y: 21, item: 'thao_duoc' }, { x: 51, y: 25, item: 'thao_duoc' }, { x: 8, y: 33, item: 'thao_duoc' },
      { x: 30, y: 35, item: 'thao_duoc' }, { x: 46, y: 33, item: 'thao_duoc' }
    ],
    // Vật trang trí đi được (không chặn đường): chum, lán củi, giá phơi thịt, bao tải, giỏ rau.
    props: [
      { sprite: 'jar', x: 13, y: 9 }, { sprite: 'jar', x: 26, y: 9 },
      { sprite: 'fence', x: 11, y: 12 }, { sprite: 'fence', x: 12, y: 12 },
      { sprite: 'fence', x: 13, y: 12 }, { sprite: 'fence', x: 14, y: 12 },
      { sprite: 'crop', x: 27, y: 12 }, { sprite: 'crop', x: 28, y: 12 },
      { sprite: 'woodshed', x: 8, y: 12 }, { sprite: 'dryingrack', x: 29, y: 12 },
      { sprite: 'sacks', x: 15, y: 12 }, { sprite: 'sacks', x: 27, y: 12 },
      { sprite: 'basket', x: 23, y: 12 }, { sprite: 'basket', x: 21, y: 12 },
      { sprite: 'cart', x: 8, y: 9 }, { sprite: 'jar', x: 22, y: 12 },
      { sprite: 'jar', x: 30, y: 11 }, { sprite: 'jar', x: 9, y: 11 },
      { sprite: 'sign', x: 10, y: 11, label: 'Tiệm rèn' },
      { sprite: 'sign', x: 15, y: 11, label: 'Quán trọ' },
      { sprite: 'sign', x: 25, y: 11, label: 'Sạp chợ' },
      { sprite: 'sign', x: 28, y: 11, label: 'Hiệu thuốc' },
      { sprite: 'bush', x: 12, y: 18 }, { sprite: 'bush', x: 28, y: 19 },
      { sprite: 'bush', x: 16, y: 22 }, { sprite: 'bush', x: 22, y: 25 },
      { sprite: 'bush', x: 30, y: 24 }, { sprite: 'bush', x: 9, y: 22 },
      { sprite: 'bush', x: 18, y: 29 }, { sprite: 'bush', x: 26, y: 21 },
      { sprite: 'jar', x: 15, y: 7 }, { sprite: 'jar', x: 24, y: 7 },
      { sprite: 'basket', x: 17, y: 9 }, { sprite: 'basket', x: 23, y: 9 },
      // V4: lấp khoảng trống — sân trấn + quanh nhà + ven tường + ngoại ô.
      { sprite: 'jar', x: 15, y: 9 }, { sprite: 'basket', x: 24, y: 9 },
      { sprite: 'sacks', x: 16, y: 8 }, { sprite: 'basket', x: 22, y: 8 },
      { sprite: 'jar', x: 5, y: 3 }, { sprite: 'jar', x: 7, y: 3 },
      { sprite: 'jar', x: 29, y: 3 }, { sprite: 'jar', x: 31, y: 3 },
      { sprite: 'jar', x: 5, y: 9 }, { sprite: 'jar', x: 7, y: 9 },
      { sprite: 'jar', x: 29, y: 9 }, { sprite: 'jar', x: 31, y: 9 },
      { sprite: 'bush', x: 5, y: 13 }, { sprite: 'bush', x: 10, y: 13 },
      { sprite: 'bush', x: 15, y: 13 }, { sprite: 'bush', x: 25, y: 13 },
      { sprite: 'bush', x: 30, y: 13 }, { sprite: 'bush', x: 35, y: 13 },
      { sprite: 'woodshed', x: 28, y: 13 }, { sprite: 'dryingrack', x: 7, y: 13 },
      { sprite: 'sacks', x: 16, y: 12 }, { sprite: 'basket', x: 22, y: 11 },
      { sprite: 'cart', x: 33, y: 11 },
      { sprite: 'bush', x: 12, y: 17 }, { sprite: 'bush', x: 18, y: 18 },
      { sprite: 'bush', x: 26, y: 20 }, { sprite: 'bush', x: 14, y: 27 },
      { sprite: 'bush', x: 24, y: 28 }, { sprite: 'bush', x: 32, y: 25 },
      { sprite: 'bush', x: 6, y: 20 }, { sprite: 'bush', x: 34, y: 24 },
      // V7: Xóm Đông + biển tên các khu quái ở đất mới.
      { sprite: 'sign', x: 41, y: 11, label: 'Xóm Đông' },
      { sprite: 'sign', x: 28, y: 30, label: 'Ruộng Nam' },
      { sprite: 'sign', x: 35, y: 12, label: 'Vườn Đào' },
      { sprite: 'sign', x: 22, y: 16, label: 'Bãi Gà Thỏ' },
      { sprite: 'sign', x: 22, y: 23, label: 'Khu Sói Con' },
      { sprite: 'sign', x: 40, y: 24, label: 'Khu Lợn Rừng' },
      { sprite: 'jar', x: 45, y: 12 }, { sprite: 'jar', x: 54, y: 12 },
      { sprite: 'sacks', x: 49, y: 13 }, { sprite: 'cart', x: 42, y: 18 },
      { sprite: 'bush', x: 45, y: 28 }, { sprite: 'bush', x: 18, y: 34 },
      { sprite: 'bush', x: 33, y: 36 }, { sprite: 'bush', x: 52, y: 34 }
    ]
  };
  // ================= MAP 2 — Rừng Thanh Sơn =================
  // Đường mòn uốn lượn bắc->nam, suối linh phía đông, lán thợ săn phía tây,
  // Miếu Sơn Thần đông bắc, xe hàng kẹt giữa đường, sào huyệt Sơn Quân ở nam.
  function buildTiles2() {
    var g = grid('.'), x, y;
    var pathRows = [
      [19, 20], [18, 21], [18, 21], [18, 21], [18, 21],
      [17, 20], [17, 20], [17, 20], [17, 20], [16, 19],
      [16, 19], [16, 19], [16, 19], [16, 19], [16, 19],
      [16, 19], [16, 19], [17, 20], [17, 20], [17, 20], [17, 20]
    ];
    for (y = 0; y < pathRows.length; y++) rect(g, pathRows[y][0], y, pathRows[y][1], y, '#');
    // Suối linh phía đông: dải nước uốn lượn rồi chảy ra mép đông ở phía nam.
    var streamX = [29, 29, 30, 30, 29, 28, 29, 30, 31, 31, 30, 29, 30, 31, 31, 32, 32, 33, 34, 35];
    for (y = 1; y <= 20; y++) { set(g, streamX[y - 1], y, 'R'); set(g, streamX[y - 1] + 1, y, 'R'); }
    rect(g, 36, 20, 39, 20, 'R');
    // Đá bước qua ĐẦU suối (hàng 1): lối vượt suối phía bắc duy nhất đạt
    // chuẩn hành lang >= 2 ô — suối rộng 2 ô uốn lượn nên không hành lang
    // đất nào qua được theo lưới neo 2x2; phía nam vòng qua cửa suối ven hồ.
    // ('#' không bị rải rừng ghi đè vì scatter chỉ thay ô '.')
    set(g, 29, 1, '#'); set(g, 30, 1, '#');
    // Ghềnh đá 2x2 qua suối ở hàng 16-17 (suối x32-33): nối bãi miếu phía
    // tây với dải bờ hồ phía đông thành MỘT bãi rắn lục liền mạch — trước
    // đây 2 bờ chỉ gặp nhau bằng vòng cung đầu suối cách cụm spawn ~15 ô.
    set(g, 32, 16, '#'); set(g, 33, 16, '#'); set(g, 32, 17, '#'); set(g, 33, 17, '#');
    // Rừng: cây rải dày ngoài đường mòn/suối/khu trống (hàm băm tất định).
    var clearings = [
      [4, 4, 11, 10],   // lán trại thợ săn
      [30, 1, 35, 7],   // miếu + bãi linh chi bờ đông bắc
      [26, 6, 35, 19],  // hai bờ suối (bãi hái linh chi + rắn lục)
      [2, 21, 37, 29]   // bãi sào huyệt phía nam
    ];
    function inClearing(cx, cy) {
      return clearings.some(function (c) { return cx >= c[0] && cx <= c[2] && cy >= c[1] && cy <= c[3]; });
    }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (g[y][x] !== '.') continue;
      if (inClearing(x, y)) continue;
      if (hash01(x, y) < 0.42) set(g, x, y, 'T');
      else if (hash01(y, x) > 0.93) set(g, x, y, 'o');
    }
    // Cấu trúc: lán thợ săn, miếu, xe hàng kẹt.
    set(g, 5, 5, 'H'); set(g, 6, 5, 'H');
    set(g, 9, 6, 'S');
    set(g, 32, 2, 'H'); set(g, 33, 2, 'H');
    set(g, 32, 4, 'L');
    [[20, 13], [21, 13], [20, 14], [21, 14], [22, 14]].forEach(function (p) { set(g, p[0], p[1], 'S'); });
    // Ô đứng của NPC / điểm spawn quái / điểm hái phải đi được.
    [[8, 8], [32, 6], [17, 14],
     [18, 10], [17, 13], [19, 17], [18, 19], [12, 17], [13, 21], [27, 11], [27, 16], [33, 13], [35, 18],
     [31, 7], [33, 10], [31, 13], [34, 16], [32, 19], [19, 25], [19, 1], [20, 1]
    ].forEach(function (p) { set(g, p[0], p[1], p[0] >= 16 && p[0] <= 21 && p[1] <= 20 ? g[p[1]][p[0]] : '.'); });
    [[31, 7], [33, 10], [32, 13], [34, 16], [32, 19], [8, 8], [32, 6], [12, 17], [13, 21], [27, 11], [27, 16], [33, 13], [35, 18], [19, 25]].forEach(function (p) { set(g, p[0], p[1], '.'); });
    // Lối vòng qua đầu suối (hàng 0) + đường mòn bờ đông (cột 36) để tới được
    // miếu và bãi linh chi phía đông suối.
    for (x = 21; x <= 38; x++) set(g, x, 0, '.');
    for (y = 1; y <= 19; y++) set(g, 36, y, '.');
    // ---- V7: đất mới — Hồ Linh phía đông + rừng sâu phía nam ----
    // Hồ Linh (khớp ảnh nền): khối nước x42..55, y11..27.
    rect(g, 45, 11, 55, 11, 'R'); rect(g, 44, 12, 55, 12, 'R');
    rect(g, 42, 13, 55, 24, 'R');
    rect(g, 43, 25, 55, 25, 'R'); rect(g, 44, 26, 55, 26, 'R'); rect(g, 46, 27, 55, 27, 'R');
    // Suối cũ chảy vào hồ ở bờ tây (hàng 19-20).
    set(g, 40, 19, 'R'); set(g, 41, 19, 'R'); set(g, 40, 20, 'R'); set(g, 41, 20, 'R');
    set(g, 44, 10, 'R'); set(g, 45, 10, 'R'); set(g, 46, 10, 'R');
    // Cầu gỗ qua vịnh bắc hồ (hàng 9) + hai đầu cầu.
    rect(g, 42, 9, 47, 9, '#');
    [[40, 9], [41, 9], [48, 9], [49, 9]].forEach(function (p) { set(g, p[0], p[1], '.'); });
    // Bãi Vọng Hồ đông bắc: dọn trống ngắm cảnh, giữ 2 cây làm bóng.
    rect(g, 43, 1, 54, 8, '.'); set(g, 44, 2, 'T'); set(g, 53, 7, 'T');
    for (x = 39; x <= 54; x++) set(g, x, 0, '.');   // lối vòng đầu suối kéo dài tới bãi vọng hồ
    // Ao Phát Sáng trong rừng sâu (khớp ảnh): nước x19..28, y34..36 + bãi quanh ao.
    rect(g, 15, 32, 31, 38, '.');
    rect(g, 20, 34, 27, 34, 'R'); rect(g, 19, 35, 28, 35, 'R'); rect(g, 20, 36, 27, 36, 'R');
    // Đường mòn từ sào huyệt xuống phía nam (bờ đông bãi sào huyệt).
    rect(g, 33, 30, 34, 39, '#');
    // Điểm spawn quái / điểm hái / biển khu ở đất mới phải đi được.
    [[23, 6], [21, 6], [22, 6], [22, 11], [6, 19], [9, 23], [5, 26], [29, 18], [40, 16], [41, 24],
     [36, 11], [48, 5], [52, 7], [45, 6], [49, 28], [40, 22], [17, 37], [30, 33],
     [15, 17], [26, 9], [34, 10], [19, 22], [47, 3],
     // Lối đi dọc bờ tây hồ (từ cầu xuống bờ nam) + dải cỏ nối sào huyệt -> ao.
     [40, 10], [40, 11], [41, 12], [40, 14], [41, 15], [40, 18], [41, 21], [40, 23],
     [41, 26], [40, 27], [43, 28], [45, 28], [47, 28],
     [41, 28], [42, 28], [44, 28], [46, 28], [48, 28], [50, 28],
     [16, 30], [20, 30], [24, 30], [28, 30], [16, 31], [22, 31], [28, 31], [31, 31],
     [32, 33], [32, 35]
    ].forEach(function (p) { set(g, p[0], p[1], '.'); });
    // Cổng về map 1: dải 17..22 ở hàng 0 — dọn cả cây rải ngẫu nhiên mọc trên
    // hàng cổng (trước đây (18,0) bị cây chặn, đi bộ lên không qua được).
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { set(g, gx, 0, 'G'); });
    return join(g);
  }
  var MAP2 = {
    id: 'map2', name: 'Rừng Thanh Sơn', bg: 'assets/map2-bg-v7.png',
    w: W, h: H, tiles: buildTiles2(), blocked: BLOCKED,
    start: { x: 19, y: 1 },
    bossSpawn: { x: 19, y: 25 },
    portals: edgePortals(0, 'map1', 28, 'Cổng Rừng'),
    npcs: [
      { id: 'tho_san_ha', x: 8, y: 8 },
      { id: 'giu_mieu', x: 32, y: 6 },
      { id: 'thuong_nhan_ma', x: 17, y: 14 }
    ],
    zones: [
      { id: 'soi_rung', name: 'Khu Sói Rừng', rects: [[16, 2, 24, 20]], types: ['soi_rung'] },
      { id: 'lon_mong_sat', name: 'Khu Lợn Mông Sắt', rects: [[2, 14, 15, 29]], types: ['lon_mong_sat'] },
      { id: 'ran_luc', name: 'Bờ Suối Rắn Lục', rects: [[25, 8, 30, 20], [40, 12, 41, 27]], types: ['ran_luc'] },
      { id: 'khi_mat_do', name: 'Khu Khỉ Mặt Đỏ', rects: [[31, 9, 38, 20], [43, 1, 54, 8]], types: ['khi_mat_do'] },
      { id: 'son_quan', name: 'Sào Huyệt Sơn Quân', rects: [[16, 21, 37, 29], [10, 30, 32, 38]], types: ['son_quan'] }
    ],
    monsters: [
      { type: 'soi_rung', x: 18, y: 10, zone: 'soi_rung' }, { type: 'soi_rung', x: 23, y: 14, zone: 'soi_rung' },
      { type: 'soi_rung', x: 19, y: 17, zone: 'soi_rung' }, { type: 'soi_rung', x: 18, y: 19, zone: 'soi_rung' },
      { type: 'soi_rung', x: 23, y: 6, zone: 'soi_rung' }, { type: 'soi_rung', x: 22, y: 11, zone: 'soi_rung' },
      { type: 'lon_mong_sat', x: 12, y: 17, zone: 'lon_mong_sat' }, { type: 'lon_mong_sat', x: 13, y: 21, zone: 'lon_mong_sat' },
      { type: 'lon_mong_sat', x: 6, y: 19, zone: 'lon_mong_sat' }, { type: 'lon_mong_sat', x: 9, y: 23, zone: 'lon_mong_sat' },
      { type: 'lon_mong_sat', x: 5, y: 26, zone: 'lon_mong_sat' },
      { type: 'ran_luc', x: 27, y: 11, zone: 'ran_luc' }, { type: 'ran_luc', x: 27, y: 16, zone: 'ran_luc' },
      { type: 'ran_luc', x: 29, y: 18, zone: 'ran_luc' },
      { type: 'ran_luc', x: 40, y: 16, zone: 'ran_luc' }, { type: 'ran_luc', x: 41, y: 24, zone: 'ran_luc' },
      { type: 'khi_mat_do', x: 33, y: 13, zone: 'khi_mat_do' }, { type: 'khi_mat_do', x: 35, y: 18, zone: 'khi_mat_do' },
      { type: 'khi_mat_do', x: 36, y: 11, zone: 'khi_mat_do' },
      { type: 'khi_mat_do', x: 48, y: 5, zone: 'khi_mat_do' }, { type: 'khi_mat_do', x: 52, y: 7, zone: 'khi_mat_do' }
    ],
    herbs: [
      { x: 31, y: 7, item: 'linh_chi' }, { x: 33, y: 10, item: 'linh_chi' }, { x: 32, y: 13, item: 'linh_chi' },
      { x: 34, y: 16, item: 'linh_chi' }, { x: 32, y: 19, item: 'linh_chi' },
      { x: 45, y: 6, item: 'linh_chi' }, { x: 49, y: 28, item: 'linh_chi' }, { x: 40, y: 22, item: 'linh_chi' },
      { x: 17, y: 37, item: 'linh_chi' }, { x: 30, y: 33, item: 'linh_chi' }
    ],
    props: [
      { sprite: 'bush', x: 26, y: 9 }, { sprite: 'bush', x: 26, y: 15 },
      { sprite: 'rock', x: 10, y: 24 }, { sprite: 'bush', x: 30, y: 24 },
      { sprite: 'sign', x: 18, y: 2, label: 'Rừng Thanh Sơn' },
      { sprite: 'sign', x: 19, y: 3, label: 'Khu Sói Rừng' },
      { sprite: 'sign', x: 15, y: 17, label: 'Khu Lợn Mông Sắt' },
      { sprite: 'sign', x: 26, y: 9, label: 'Bờ Suối Rắn Lục' },
      { sprite: 'sign', x: 34, y: 10, label: 'Khu Khỉ Mặt Đỏ' },
      { sprite: 'sign', x: 19, y: 22, label: 'Sào Huyệt Sơn Quân' },
      { sprite: 'sign', x: 47, y: 3, label: 'Bãi Vọng Hồ' },
      { sprite: 'sign', x: 31, y: 31, label: 'Ao Phát Sáng' },
      { sprite: 'sign', x: 35, y: 10, label: 'Suối Linh' }
    ]
  };
  // ================= MAP 3 — Chân Núi Thanh Phong =================
  // Đường đá từ nam lên quảng trường bãi tuyển; sơn môn phía bắc chỉ làm cảnh (chặn).
  function buildTiles3() {
    var g = grid('.'), x, y;
    rect(g, 0, 0, W - 1, 7, 'W');         // vách đá + sơn môn phía bắc (chưa qua được)
    rect(g, 12, 8, 27, 17, 'Q');          // quảng trường bãi tuyển đệ tử
    rect(g, 18, 18, 21, 29, '#');         // đường đá bậc thang xuống nam
    [[15, 10], [18, 10], [21, 10], [24, 10]].forEach(function (p) { set(g, p[0], p[1], 'S'); }); // bàn ghi danh
    [[13, 9], [26, 9], [13, 16], [26, 16]].forEach(function (p) { set(g, p[0], p[1], 'L'); });   // đèn đá
    set(g, 20, 11, 'o');                  // lư hương lớn giữa quảng trường
    // Hai bên đường: thông + đá tảng rải theo băm tất định.
    for (y = 8; y < H; y++) for (x = 0; x < W; x++) {
      if (g[y][x] !== '.') continue;
      if (hash01(x + 40, y) < 0.38) set(g, x, y, 'T');
      else if (hash01(y, x + 40) > 0.92) set(g, x, y, 'o');
    }
    [[10, 21], [29, 20], [9, 26], [30, 25], [19, 12], [19, 28], [20, 28]].forEach(function (p) { set(g, p[0], p[1], p[1] >= 18 ? '#' : 'Q'); });
    set(g, 10, 21, '.'); set(g, 29, 20, '.'); set(g, 9, 26, '.'); set(g, 30, 25, '.'); set(g, 19, 12, 'Q');
    // ---- V7: đất mới — bãi luyện công + Đài Vọng Vân phía đông, thềm nam ----
    // (khớp ảnh nền: sân đá + giá binh khí ở x34..47/y17..21, sàn gỗ vọng vân
    // x38..48/y22..25; xa hơn về đông là vách núi biển mây, không đi được.)
    rect(g, 34, 17, 47, 21, 'Q');          // bãi luyện công lát đá
    [[37, 18], [41, 18], [45, 19], [39, 20]].forEach(function (p) { set(g, p[0], p[1], 'S'); }); // cọc gỗ/giá binh khí
    [[35, 17], [47, 17], [35, 21], [47, 21]].forEach(function (p) { set(g, p[0], p[1], 'L'); }); // đèn đá
    rect(g, 28, 12, 39, 13, '#');          // đường đá quảng trường -> bãi luyện công
    rect(g, 38, 22, 48, 25, '.');          // Đài Vọng Vân (sàn gỗ trong ảnh)
    rect(g, 48, 13, 55, 21, 'W');          // vách núi phía đông bãi luyện công
    rect(g, 49, 22, 55, 25, 'W');          // mỏm đá đông của đài
    rect(g, 38, 26, 43, 26, 'W'); rect(g, 47, 26, 55, 26, 'W');   // lan can nam đài, chừa lối giữa
    rect(g, 42, 27, 52, 32, '.');          // thềm đá dưới đài
    set(g, 46, 29, 'T'); set(g, 51, 31, 'T'); set(g, 44, 31, 'o');
    rect(g, 38, 33, 55, 39, 'W'); rect(g, 38, 27, 41, 32, 'W');   // vách vực phía nam
    // Thềm Bia Thanh Phong (tây nam) + đường đá bậc thang cong xuống nam.
    rect(g, 4, 30, 12, 34, 'Q');
    set(g, 6, 31, 'o'); set(g, 7, 31, 'o');
    set(g, 5, 33, 'L'); set(g, 11, 33, 'L');
    rect(g, 18, 30, 21, 33, '#'); rect(g, 21, 34, 24, 36, '#'); rect(g, 24, 37, 27, 39, '#');
    // Điểm spawn quái / điểm hái / lối nối ở đất mới phải đi được.
    [[34, 22], [14, 28], [17, 19], [31, 25], [32, 25], [39, 14], [39, 15], [39, 16], [37, 16],
     [13, 30], [14, 30], [14, 29], [13, 32], [14, 32], [15, 32], [16, 32], [17, 32]
    ].forEach(function (p) { set(g, p[0], p[1], '.'); });
    // ---- V8: đường đá bậc thang lên bắc (sau quảng trường) -> cổng Thập Vạn Đại Sơn ----
    // Khắc lối 2 ô (19,20) xuyên vách bắc hàng 1..7; hàng 0 mở dải cổng 17..22.
    for (y = 1; y <= 7; y++) { set(g, 19, y, '#'); set(g, 20, y, '#'); }
    // Cổng về map 1: dải 17..22 ở hàng 29 (ghi đè cây/đá rải ngẫu nhiên nếu có).
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { set(g, gx, 29, 'G'); set(g, gx, 0, 'G'); });
    return join(g);
  }
  var MAP3 = {
    id: 'map3', name: 'Chân Núi Thanh Phong', bg: 'assets/map3-bg-v7.png',
    w: W, h: H, tiles: buildTiles3(), blocked: BLOCKED,
    start: { x: 19, y: 28 },
    portals: edgePortals(29, 'map1', 1, 'Cổng Bắc').concat(edgePortals(0, 'map4', 46, 'Đường Lên Đại Sơn')),
    npcs: [
      { id: 'de_tu_phai', x: 19, y: 12 },
      // Đại diện 9 tông môn (arc chương 9-12): xuất hiện dần theo tiến độ mở
      // khoá tông - game.js lọc hiển thị bằng trường sect + js/sects.js.
      // Vị trí phải cách nhau >= 3 ô và cách điểm rơi cổng (19,14) đủ xa để
      // tương tác 72px luôn chọn đúng người (Tạ Thanh Vân là NPC duy nhất
      // trong tầm 72px tại điểm rơi). Đừng xếp 2 đại diện sát nhau < 3 ô.
      { id: 'tong_phap', x: 14, y: 12, sect: 'huyen_phap' },
      { id: 'tong_khi', x: 25, y: 12, sect: 'thien_cong' },
      { id: 'tong_dan', x: 16, y: 15, sect: 'dan_ha' },
      { id: 'tong_thu', x: 23, y: 15, sect: 'van_thu' },
      { id: 'tong_phu', x: 12, y: 15, sect: 'thien_phu' },
      { id: 'tong_tran', x: 27, y: 15, sect: 'cuu_cung' },
      { id: 'tong_the', x: 17, y: 9, sect: 'kim_cang' },
      { id: 'tong_doc', x: 22, y: 9, sect: 'ngu_doc' },
      { id: 'tong_am', x: 20, y: 17, sect: 'huyen_am' },
      // Chấp Sự Đại Hội (js/tournament.js): ghi danh + bảng xếp hạng Đại
      // Hội Tu Tiên — đứng ở đầu đông quảng trường, cách tong_khi 3 ô.
      { id: 'chap_su_dai_hoi', x: 28, y: 12 },
      // Chấp Sự Đấu Giá Liên Tông (js/auction.js): giữ búa phiên đấu giá
      // 12:00/20:00 tại quảng trường — ô (30,17) đi được, cách các NPC
      // quanh đó ≥ 3 ô để tương tác 72px luôn chọn đúng người.
      { id: 'dau_gia_su', x: 30, y: 17, sprite: 'chu_quan' },
      // Thư Lại Giữ Bảng Xếp Hạng Tu Sĩ Theo Mùa (js/season-board.js):
      // ô (33,14) đi được, cách Kim Vạn Thông (30,17) và Chấp Sự Đại
      // Hội (28,12) ≥ 3 ô theo Chebyshev để tương tác 72px luôn chọn
      // đúng người.
      { id: 'ghi_bang_su', x: 33, y: 14, sprite: 'hoc_tro' },
      // Thủ Thư Tàng Kinh Các (js/library.js): đứng trước tòa các
      // chung của mười tông ở phía đông bãi tuyển — ô (37,14) đi
      // được (tile '.'), cách Thẩm Ký (33,14) 4 ô và Kim Vạn Thông
      // (30,17) 7 ô theo Chebyshev, không chen tầm 72px của ai.
      // Sprite mượn của đại phu (ông lão); chưa có sheet thủ thư riêng.
      { id: 'thu_thu', x: 37, y: 14, sprite: 'dai_phu' }
    ],
    zones: [
      { id: 'khi_mat_do', name: 'Khu Khỉ Mặt Đỏ', rects: [[4, 18, 16, 24], [28, 18, 39, 24], [34, 17, 47, 21]], types: ['khi_mat_do'] },
      { id: 'soi_rung', name: 'Khu Sói Rừng', rects: [[4, 25, 16, 32], [28, 25, 39, 32], [42, 27, 52, 32]], types: ['soi_rung'] }
    ],
    monsters: [
      { type: 'khi_mat_do', x: 10, y: 21, zone: 'khi_mat_do' }, { type: 'khi_mat_do', x: 29, y: 20, zone: 'khi_mat_do' },
      { type: 'khi_mat_do', x: 34, y: 22, zone: 'khi_mat_do' }, { type: 'khi_mat_do', x: 46, y: 20, zone: 'khi_mat_do' },
      { type: 'soi_rung', x: 9, y: 26, zone: 'soi_rung' }, { type: 'soi_rung', x: 30, y: 25, zone: 'soi_rung' },
      { type: 'soi_rung', x: 8, y: 30, zone: 'soi_rung' }, { type: 'soi_rung', x: 48, y: 31, zone: 'soi_rung' }
    ],
    herbs: [
      { x: 38, y: 21, item: 'linh_chi' }, { x: 51, y: 30, item: 'linh_chi' }
    ],
    props: [
      { sprite: 'bush', x: 14, y: 20 }, { sprite: 'bush', x: 25, y: 22 },
      { sprite: 'sign', x: 23, y: 16, label: 'Bãi tuyển đệ tử' },
      { sprite: 'sign', x: 36, y: 17, label: 'Bãi Luyện Công' },
      { sprite: 'sign', x: 45, y: 23, label: 'Đài Vọng Vân' },
      { sprite: 'sign', x: 9, y: 32, label: 'Bia Thanh Phong' },
      { sprite: 'sign', x: 17, y: 19, label: 'Khu Khỉ Mặt Đỏ' },
      { sprite: 'sign', x: 22, y: 34, label: 'Khu Sói Rừng' },
      { sprite: 'sign', x: 23, y: 8, label: 'Thập Vạn Đại Sơn' }
    ]
  };
  // ================= MAP 4 — Thập Vạn Đại Sơn (V8, map lớn nhất: 72x48) =================
  // Dãy núi hoang sau lưng Thanh Sơn: vào từ mép bắc map 3 (đường đá sau bãi
  // tuyển), điểm rơi ở cổng nam (19,46). Địa hình khớp ảnh nền AI: rừng già
  // tây bắc, phế tích cổ bắc-trung, khe suối + Suối Linh phía đông, cây cổ
  // thụ linh khí ở trung tâm. Càng sâu (lên bắc / sang đông) quái càng mạnh:
  // 8 khu thuần loài, 52 điểm spawn, 3 SÀO HUYỆT BOSS TRỐNG (trường bossLairs)
  // chờ team boss theo giờ đặt boss hồi sinh — đừng tự đặt quái vào đó.
  var W4 = 72, H4 = 48;
  function buildTiles4() {
    var g = [], y, x, row;
    for (y = 0; y < H4; y++) { row = []; for (x = 0; x < W4; x++) row.push('.'); g.push(row); }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch; }
    function S(px, py, ch) { g[py][px] = ch; }
    // Vành đai vách: bắc 2 hàng, tây/đông 1 cột, nam 1 hàng (cổng + suối xuyên qua sau).
    R(0, 0, W4 - 1, 1, 'W'); R(0, 2, 0, H4 - 1, 'W'); R(W4 - 1, 2, W4 - 1, H4 - 1, 'W'); R(1, H4 - 1, W4 - 2, H4 - 1, 'W');
    // Vai núi đá hai góc bắc (vách hang): rải 'W' tất định, chừa sàn hang vẽ sau.
    for (y = 2; y <= 8; y++) for (x = 1; x <= 24; x++) { if (hash01(x + 71, y) < 0.30) S(x, y, 'W'); }
    for (y = 2; y <= 8; y++) for (x = 48; x <= 70; x++) { if (hash01(x + 97, y) < 0.35) S(x, y, 'W'); }
    // Sàn 2 hang hai góc (sào huyệt boss A và C; hang C lùi 1 ô né khe suối).
    R(3, 2, 12, 7, '.'); R(61, 2, 70, 7, '.');
    // Phế tích cổ bắc-trung: nền đá 'Q', tường gãy ở mép bắc, cột đổ 'o'.
    R(24, 2, 47, 9, 'Q');
    R(24, 2, 32, 2, 'W'); R(41, 2, 47, 2, 'W');
    [[27, 5], [31, 3], [45, 5], [43, 7], [24, 9], [47, 6]].forEach(function (p) { S(p[0], p[1], 'o'); });
    // Khe suối phía đông: hẻm thác ở đông bắc -> Suối Linh (ao) -> chảy ra mép nam.
    R(59, 2, 60, 9, 'R'); S(58, 9, 'R'); S(57, 10, 'R'); S(58, 10, 'R'); R(56, 10, 57, 19, 'R');
    R(41, 20, 47, 24, 'R');                       // Suối Linh
    R(44, 25, 45, 33, 'R'); S(42, 33, 'R'); S(43, 34, 'R'); R(41, 34, 42, 40, 'R');
    S(40, 41, 'R'); S(41, 41, 'R'); R(39, 41, 40, 47, 'R');
    // Suối nhỏ phía tây (thác con trong rừng già).
    R(21, 24, 22, 33, 'R');
    // Hệ đường mòn '#': cổng nam -> ngã ba -> 3 nhánh (tây / trung / đông).
    R(17, 29, 18, 46, '#');                        // trục nam
    R(8, 29, 24, 29, '#');                         // nhánh tây (qua cầu suối nhỏ)
    R(10, 9, 11, 33, '#');                         // dọc tây: rừng già -> ngã ba lớn
    R(8, 34, 63, 34, '#');                         // ngã ba lớn đông-tây (qua cầu suối lớn)
    R(19, 28, 27, 28, '#'); R(27, 22, 28, 27, '#'); R(28, 21, 36, 21, '#'); R(30, 10, 31, 20, '#'); // trung: cổ thụ -> phế tích
    R(62, 8, 63, 33, '#');                         // dọc đông: hang vực -> ngã ba lớn
    R(52, 18, 63, 18, '#');                        // cầu qua khe suối
    R(7, 8, 11, 8, '#');                           // lối vào Hang Hổ Gầm
    // Cây cổ thụ linh khí (tán 3x2 ô ở trung tâm, khớp ảnh).
    [[38, 19], [39, 19], [40, 19], [38, 20], [39, 20], [40, 20]].forEach(function (p) { S(p[0], p[1], 'T'); });
    // Rừng rải tất định: rừng già tây bắc dày, sườn tây vừa, còn lại thưa.
    for (y = 2; y < H4; y++) for (x = 1; x < W4 - 1; x++) {
      if (g[y][x] !== '.') continue;
      var d = (x >= 2 && x <= 23 && y >= 9 && y <= 19) ? 0.42
        : (x >= 2 && x <= 17 && y >= 21 && y <= 32) ? 0.30
        : (x >= 23 && x <= 52 && y >= 13 && y <= 33) ? 0.03 : 0.08;
      if (hash01(x + 113, y) < d) S(x, y, 'T');
      else if (hash01(y + 131, x) > 0.97) S(x, y, 'o');
    }
    // Điểm spawn quái / hái dược / biển / điểm rơi phải đi được.
    [[19, 46], [20, 46], [22, 45], [17, 39], [23, 37], [12, 33], [52, 33], [33, 16], [12, 20], [65, 19], [31, 11],
     [8, 9], [35, 11], [63, 9], [36, 22], [40, 25],
     [5, 38], [12, 40], [8, 43], [14, 37], [6, 45], [13, 44],
     [26, 38], [33, 40], [24, 44], [30, 45], [36, 37], [28, 42],
     [6, 24], [14, 23], [12, 28], [5, 30], [15, 26], [8, 32],
     [58, 13], [61, 17], [49, 27], [40, 31], [46, 36], [51, 33],
     [32, 17], [36, 24], [48, 23], [31, 21], [45, 15], [50, 19],
     [5, 12], [16, 11], [20, 16], [7, 18], [13, 15], [19, 19], [4, 16], [22, 10],
     [66, 11], [69, 14], [65, 17], [70, 20], [67, 20], [64, 13],
     [26, 4], [25, 6], [29, 8], [44, 3], [42, 8], [36, 8],
     [10, 39], [15, 42], [28, 39], [34, 43], [25, 37], [7, 44], [31, 45], [36, 41],
     [58, 8], [61, 14], [54, 27], [40, 22], [48, 25], [48, 28], [43, 32], [38, 37], [45, 41],
     [28, 3], [44, 6], [31, 9], [38, 9], [6, 14], [19, 13], [14, 18], [36, 23], [43, 18], [20, 27], [24, 31]
    ].forEach(function (p) { S(p[0], p[1], '.'); });
    // Spawn trong rừng dày: dọn cả 4 ô kề thành khoảng trống chữ thập kẻo cây
    // rải kín mít bịt mất đường vào (quái đứng được nhưng người chơi không tới nổi).
    [[5, 12], [16, 11], [20, 16], [7, 18], [13, 15], [19, 19], [4, 16], [22, 10],
     [6, 24], [14, 23], [12, 28], [5, 30], [15, 26], [8, 32]
    ].forEach(function (p) {
      S(p[0], p[1], '.'); S(p[0] - 1, p[1], '.'); S(p[0] + 1, p[1], '.'); S(p[0], p[1] - 1, '.'); S(p[0], p[1] + 1, '.');
    });
    // Sàn sào huyệt boss phải trống tuyệt đối (ghi đè mọi rải cây/đá về sau).
    R(3, 2, 12, 7, '.'); R(61, 2, 70, 7, '.'); R(33, 2, 40, 6, 'Q');
    // ---- V9: cổng bắc lên Trung Phúc (map 5) — khoét vách bắc ở trục cổng
    // 17..22 + đường đá 2 ô (19,20) xuyên vai núi xuống lối vào Hang Hổ Gầm
    // (hàng 8). Không đụng zones/dược/3 sào boss: đường chỉ chạy hàng 0..8,
    // phía trên khu Khỉ Rừng Già (bắt đầu hàng 9), ngoài mọi sào huyệt.
    R(12, 8, 20, 8, '#');
    for (y = 1; y <= 7; y++) { S(19, y, '#'); S(20, y, '#'); }
    S(17, 2, '.'); S(18, 2, '.');
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { S(gx, 0, 'G'); });
    // Cổng về map 3: dải 17..22 ở hàng 47 (ghi đè vành vách nam).
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { S(gx, 47, 'G'); });
    // V9: thang đá lên CỔNG BẮC GIỮA (dải 28..33, sau phế tích) — cổng
    // chặng cao TỪNG ở đây, vòng tích hợp (mục 3 hàng chờ) đã dời sang
    // mép bắc map 7: dải này đóng lại thành vách ('W'), đường đá hàng 1
    // giữ nguyên làm lối cụt trang trí. Dải 17..22 ở mép bắc để NGUYÊN
    // cho chuỗi Luyện Khí (map 5) của team chuỗi — không đụng.
    [28, 29, 30, 31, 32, 33].forEach(function (gx) { S(gx, 1, '#'); S(gx, 0, 'W'); });
    S(30, 2, '#'); S(31, 2, '#'); S(31, 3, '#');
    return join(g);
  }
  var MAP4 = {
    id: 'map4', name: 'Thập Vạn Đại Sơn', bg: 'assets/map4-bg-v7.png',
    w: W4, h: H4, tiles: buildTiles4(), blocked: BLOCKED,
    start: { x: 19, y: 46 },
    portals: edgePortals(47, 'map3', 1, 'Cổng Xuống Đại Sơn')
      .concat(edgePortalsTier(0, 'map5', 42, 'Đường Lên Trung Phúc', 4, 'Luyện Khí tầng 4')),
    npcs: [],
    // Sào huyệt boss TRỐNG — team boss theo giờ đặt boss hồi sinh tại (x,y).
    bossLairs: [
      { id: 'hang_ho_gam', name: 'Hang Hổ Gầm', x: 7, y: 4, rect: [3, 2, 12, 7] },
      { id: 'tam_phe_tich', name: 'Tâm Phế Tích', x: 36, y: 4, rect: [33, 2, 40, 6] },
      { id: 'hang_vuc_sau', name: 'Hang Vực Sâu', x: 65, y: 4, rect: [61, 2, 70, 7] }
    ],
    zones: [
      { id: 'lon_rung_dai_son', name: 'Khu Lợn Rừng Đại Sơn', rects: [[2, 36, 16, 45]], types: ['lon_rung'] },
      { id: 'soi_cua_son', name: 'Khu Sói Cửa Sơn', rects: [[23, 36, 37, 45]], types: ['soi_rung'] },
      { id: 'lon_mong_sat_dai_son', name: 'Khu Lợn Mông Sắt', rects: [[3, 21, 16, 32]], types: ['lon_mong_sat'] },
      { id: 'ran_khe_suoi', name: 'Khe Suối Rắn Lục', rects: [[53, 11, 63, 19], [38, 25, 52, 40]], types: ['ran_luc'] },
      { id: 'khi_co_thu', name: 'Khu Khỉ Cổ Thụ', rects: [[30, 15, 50, 24]], types: ['khi_mat_do'] },
      { id: 'khi_rung_gia', name: 'Rừng Già Khỉ Mặt Đỏ', rects: [[2, 9, 23, 19]], types: ['khi_mat_do'] },
      { id: 'soi_vach_da', name: 'Vách Đá Sói Rừng', rects: [[64, 9, 70, 20]], types: ['soi_rung'] },
      { id: 'ran_phe_tich', name: 'Phế Tích Cổ Rắn Lục', rects: [[24, 2, 32, 9], [41, 2, 47, 9], [33, 7, 40, 9]], types: ['ran_luc'] }
    ],
    monsters: [
      { type: 'lon_rung', x: 5, y: 38, zone: 'lon_rung_dai_son' }, { type: 'lon_rung', x: 12, y: 40, zone: 'lon_rung_dai_son' }, { type: 'lon_rung', x: 8, y: 43, zone: 'lon_rung_dai_son' },
      { type: 'lon_rung', x: 14, y: 37, zone: 'lon_rung_dai_son' }, { type: 'lon_rung', x: 6, y: 45, zone: 'lon_rung_dai_son' }, { type: 'lon_rung', x: 13, y: 44, zone: 'lon_rung_dai_son' },
      { type: 'soi_rung', x: 26, y: 38, zone: 'soi_cua_son' }, { type: 'soi_rung', x: 33, y: 40, zone: 'soi_cua_son' }, { type: 'soi_rung', x: 28, y: 45, zone: 'soi_cua_son' },
      { type: 'soi_rung', x: 30, y: 45, zone: 'soi_cua_son' }, { type: 'soi_rung', x: 36, y: 37, zone: 'soi_cua_son' }, { type: 'soi_rung', x: 28, y: 42, zone: 'soi_cua_son' },
      { type: 'lon_mong_sat', x: 6, y: 24, zone: 'lon_mong_sat_dai_son' }, { type: 'lon_mong_sat', x: 14, y: 23, zone: 'lon_mong_sat_dai_son' }, { type: 'lon_mong_sat', x: 12, y: 28, zone: 'lon_mong_sat_dai_son' },
      { type: 'lon_mong_sat', x: 5, y: 30, zone: 'lon_mong_sat_dai_son' }, { type: 'lon_mong_sat', x: 15, y: 26, zone: 'lon_mong_sat_dai_son' }, { type: 'lon_mong_sat', x: 8, y: 32, zone: 'lon_mong_sat_dai_son' },
      { type: 'ran_luc', x: 58, y: 13, zone: 'ran_khe_suoi' }, { type: 'ran_luc', x: 61, y: 17, zone: 'ran_khe_suoi' }, { type: 'ran_luc', x: 49, y: 27, zone: 'ran_khe_suoi' },
      { type: 'ran_luc', x: 40, y: 31, zone: 'ran_khe_suoi' }, { type: 'ran_luc', x: 46, y: 36, zone: 'ran_khe_suoi' }, { type: 'ran_luc', x: 51, y: 33, zone: 'ran_khe_suoi' },
      { type: 'khi_mat_do', x: 32, y: 17, zone: 'khi_co_thu' }, { type: 'khi_mat_do', x: 36, y: 24, zone: 'khi_co_thu' }, { type: 'khi_mat_do', x: 48, y: 23, zone: 'khi_co_thu' },
      { type: 'khi_mat_do', x: 31, y: 21, zone: 'khi_co_thu' }, { type: 'khi_mat_do', x: 45, y: 15, zone: 'khi_co_thu' }, { type: 'khi_mat_do', x: 50, y: 19, zone: 'khi_co_thu' },
      { type: 'khi_mat_do', x: 5, y: 12, zone: 'khi_rung_gia' }, { type: 'khi_mat_do', x: 16, y: 11, zone: 'khi_rung_gia' }, { type: 'khi_mat_do', x: 20, y: 16, zone: 'khi_rung_gia' },
      { type: 'khi_mat_do', x: 7, y: 18, zone: 'khi_rung_gia' }, { type: 'khi_mat_do', x: 13, y: 15, zone: 'khi_rung_gia' }, { type: 'khi_mat_do', x: 19, y: 19, zone: 'khi_rung_gia' },
      { type: 'khi_mat_do', x: 4, y: 16, zone: 'khi_rung_gia' }, { type: 'khi_mat_do', x: 22, y: 10, zone: 'khi_rung_gia' },
      { type: 'soi_rung', x: 66, y: 11, zone: 'soi_vach_da' }, { type: 'soi_rung', x: 69, y: 14, zone: 'soi_vach_da' }, { type: 'soi_rung', x: 65, y: 17, zone: 'soi_vach_da' },
      { type: 'soi_rung', x: 70, y: 20, zone: 'soi_vach_da' }, { type: 'soi_rung', x: 67, y: 20, zone: 'soi_vach_da' }, { type: 'soi_rung', x: 64, y: 13, zone: 'soi_vach_da' },
      { type: 'ran_luc', x: 26, y: 4, zone: 'ran_phe_tich' }, { type: 'ran_luc', x: 25, y: 6, zone: 'ran_phe_tich' }, { type: 'ran_luc', x: 29, y: 8, zone: 'ran_phe_tich' },
      { type: 'ran_luc', x: 44, y: 3, zone: 'ran_phe_tich' }, { type: 'ran_luc', x: 42, y: 8, zone: 'ran_phe_tich' }, { type: 'ran_luc', x: 36, y: 8, zone: 'ran_phe_tich' }
    ],
    herbs: [
      { x: 10, y: 39, item: 'thao_duoc' }, { x: 15, y: 42, item: 'thao_duoc' }, { x: 28, y: 39, item: 'thao_duoc' }, { x: 34, y: 43, item: 'thao_duoc' },
      { x: 25, y: 37, item: 'thao_duoc' }, { x: 7, y: 44, item: 'thao_duoc' }, { x: 31, y: 45, item: 'thao_duoc' }, { x: 36, y: 41, item: 'thao_duoc' },
      { x: 58, y: 8, item: 'linh_chi' }, { x: 61, y: 14, item: 'linh_chi' }, { x: 54, y: 27, item: 'linh_chi' }, { x: 40, y: 22, item: 'linh_chi' },
      { x: 48, y: 25, item: 'linh_chi' }, { x: 48, y: 28, item: 'linh_chi' }, { x: 43, y: 32, item: 'linh_chi' }, { x: 38, y: 37, item: 'linh_chi' },
      { x: 45, y: 41, item: 'linh_chi' }, { x: 28, y: 3, item: 'linh_chi' }, { x: 44, y: 6, item: 'linh_chi' }, { x: 31, y: 9, item: 'linh_chi' },
      { x: 38, y: 9, item: 'linh_chi' }, { x: 6, y: 14, item: 'linh_chi' }, { x: 19, y: 13, item: 'linh_chi' }, { x: 14, y: 18, item: 'linh_chi' },
      { x: 36, y: 23, item: 'linh_chi' }, { x: 43, y: 18, item: 'linh_chi' }, { x: 20, y: 27, item: 'linh_chi' }, { x: 24, y: 31, item: 'linh_chi' }
    ],
    props: [
      { sprite: 'sign', x: 17, y: 44, label: 'Thập Vạn Đại Sơn' },
      { sprite: 'sign', x: 22, y: 45, label: 'Nguy hiểm! Cần Luyện Khí Tầng 3+' },
      { sprite: 'sign', x: 17, y: 39, label: 'Khu Lợn Rừng Đại Sơn' },
      { sprite: 'sign', x: 23, y: 37, label: 'Khu Sói Cửa Sơn' },
      { sprite: 'sign', x: 12, y: 33, label: 'Khu Lợn Mông Sắt' },
      { sprite: 'sign', x: 52, y: 33, label: 'Khe Suối Rắn Lục' },
      { sprite: 'sign', x: 33, y: 16, label: 'Khu Khỉ Cổ Thụ' },
      { sprite: 'sign', x: 12, y: 20, label: 'Rừng Già Khỉ Mặt Đỏ' },
      { sprite: 'sign', x: 65, y: 19, label: 'Vách Đá Sói Rừng' },
      { sprite: 'sign', x: 31, y: 11, label: 'Phế Tích Cổ Rắn Lục' },
      { sprite: 'sign', x: 8, y: 9, label: 'Hang Hổ Gầm' },
      { sprite: 'sign', x: 35, y: 11, label: 'Tâm Phế Tích' },
      { sprite: 'sign', x: 63, y: 9, label: 'Hang Vực Sâu' },
      { sprite: 'sign', x: 36, y: 22, label: 'Cây Cổ Thụ Linh Khí' },
      { sprite: 'sign', x: 40, y: 25, label: 'Suối Linh' },
      { sprite: 'bush', x: 15, y: 30 }, { sprite: 'bush', x: 24, y: 33 }, { sprite: 'bush', x: 55, y: 36 },
      { sprite: 'bush', x: 60, y: 44 }, { sprite: 'bush', x: 47, y: 12 }, { sprite: 'bush', x: 58, y: 46 },
      { sprite: 'rock', x: 33, y: 44 }, { sprite: 'rock', x: 9, y: 27 }, { sprite: 'rock', x: 28, y: 14 }, { sprite: 'rock', x: 3, y: 34 },
      { sprite: 'sign', x: 17, y: 2, label: 'Lên Trung Phúc — Cần Luyện Khí tầng 4' }
    ]
  };
  // ================= CHUỖI ĐẠI SƠN PHÂN TẦNG (V9) =================
  // Map 4 = Ngoại Vi (Luyện Khí 1-3, vào tự do). Ba map sâu nối tiếp bằng
  // cổng mép bắc KIỂM TRA CẢNH GIỚI (trường minTier trên từng ô cổng;
  // game.js checkPortal chặn + báo rõ khi chưa đủ tầng; cổng chiều về dùng
  // edgePortals thường nên không bao giờ khóa):
  //   map 5 Trung Phúc — tối thiểu Luyện Khí tầng 4
  //   map 6 Thâm Xứ    — tối thiểu Luyện Khí tầng 7
  //   map 7 Chi Đỉnh   — tối thiểu Luyện Khí tầng 9 (viên mãn)
  // Mép bắc map 7 đã CHỪA SẴN dải cổng 25..30 ở hàng 0 (tâm cx=28, đúng
  // quy ước chainPortals của chặng cao) + thềm đá hàng 1 và bậc xuống đài;
  // vòng tích hợp (mục 3 hàng chờ, 2026-10-30) ĐÃ dời cổng vào map 8 từ
  // mép bắc map 4 lên đây: chainPortals(0, 28, 'map8', ..., realmGate('truc_co'))
  // cộng vào MAP7.portals, cổng về của map 8 sang (27/28, 1) trên map 7.
  // LUẬT BUI 21:18: khu quái đất là BÃI TRỐNG đi được — builders dưới đây
  // bảo vệ toàn bộ rect của zones/lair khỏi vòng rải cây/đá, spawn luôn
  // đứng trên ô đi được và BFS trong khu nối mọi spawn (test mục 38).
  // Độ khó tăng theo độ sâu = THÀNH PHẦN + MẬT ĐỘ quái + tỉ lệ tinh anh
  // theo map (trường eliteChance, game.js makeMonster đọc; map không khai
  // thì dùng tỉ lệ gốc của artifacts.js). Game KHÔNG có hệ nhân chỉ số
  // theo map và ở đây không tự chế thêm.
  function buildGridWH(w, h) {
    var g = [], y, x, row;
    for (y = 0; y < h; y++) { row = []; for (x = 0; x < w; x++) row.push('.'); g.push(row); }
    return g;
  }
  function inRectXY(x, y, r) { return x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]; }
  // ================= MAP 5 — Thập Vạn Đại Sơn · Trung Phúc (64x44, Luyện Khí 4+) =================
  // Ảnh nền: rừng già + phế tích cổ bắc-trung + suối đông chảy vào ao nam.
  var W5 = 64, H5 = 44;
  function buildTiles5() {
    var g = buildGridWH(W5, H5), y, x;
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch; }
    function S(px, py, ch) { g[py][px] = ch; }
    R(0, 0, W5 - 1, 0, 'W'); R(0, H5 - 1, W5 - 1, H5 - 1, 'W');
    R(0, 1, 0, H5 - 2, 'W'); R(W5 - 1, 1, W5 - 1, H5 - 2, 'W');
    // Phế tích cổ bắc-trung: sân đá + tường gãy mép bắc sân + cột đổ.
    R(16, 2, 30, 12, 'Q');
    R(16, 2, 18, 2, 'W'); R(21, 2, 30, 2, 'W');
    S(17, 4, 'o'); S(18, 6, 'o');
    // Suối phía đông uốn lượn + ao cuối suối ở đông nam.
    for (y = 2; y <= 8; y++) { S(58, y, 'R'); S(59, y, 'R'); }
    for (y = 9; y <= 16; y++) { S(57, y, 'R'); S(58, y, 'R'); }
    for (y = 17; y <= 24; y++) { S(58, y, 'R'); S(59, y, 'R'); }
    for (y = 25; y <= 32; y++) { S(59, y, 'R'); S(60, y, 'R'); }
    R(56, 33, 61, 33, 'R'); R(54, 34, 61, 40, 'R'); R(56, 41, 60, 41, 'R');
    // Đường mòn: cổng nam -> phế tích; nhánh tây xuống khu sói; nhánh đông
    // sang khu khỉ; đường dọc bờ tây suối.
    R(19, 26, 20, 42, '#'); R(19, 25, 23, 25, '#'); R(22, 13, 23, 25, '#');
    R(10, 26, 11, 30, '#'); R(10, 30, 19, 30, '#');
    R(23, 20, 41, 20, '#'); R(40, 14, 41, 20, '#');
    R(52, 10, 52, 32, '#');
    R(16, 1, 23, 1, '#'); R(16, 42, 23, 42, '#');
    // Rải cây/đá tất định NGOÀI zones/lair/trục cổng (luật 21:18).
    var zones5 = [[16, 8, 30, 13], [5, 16, 16, 25], [19, 20, 29, 28], [38, 14, 49, 22], [52, 8, 55, 30]];
    var lair5 = [23, 3, 29, 7];
    function protected5(px, py) {
      if (py <= 1 || py >= 42) return true;
      if (px >= 17 && px <= 22) return true;
      if (inRectXY(px, py, lair5)) return true;
      for (var i = 0; i < zones5.length; i++) if (inRectXY(px, py, zones5[i])) return true;
      return false;
    }
    for (y = 2; y < H5 - 1; y++) for (x = 1; x < W5 - 1; x++) {
      if (g[y][x] !== '.') continue;
      if (protected5(x, y)) continue;
      var d5 = (x <= 15 && y <= 30) ? 0.45 : (x >= 33 && x <= 51 && y >= 2 && y <= 33) ? 0.22 : 0.15;
      if (hash01(x + 211, y) < d5) S(x, y, 'T');
      else if (hash01(y + 223, x) > 0.965) S(x, y, 'o');
    }
    // Bờ đông bên kia suối (đông của ô R cuối mỗi hàng, y2..41): tranh nền
    // vẽ rừng rậm kín — phủ 'T' cho khớp tranh và hết đất đi-được-nhưng-
    // không-tới-được (team bố trí map, lệnh Bui 05:57 30/10). Bay ngự kiếm
    // vẫn qua được cây như mọi khu rừng khác.
    for (y = 2; y <= 41; y++) {
      var lastR = -1;
      for (x = 52; x < W5 - 1; x++) if (g[y][x] === 'R') lastR = x;
      if (lastR < 0) continue;
      for (x = lastR + 1; x < W5 - 1; x++) if (g[y][x] === '.') S(x, y, 'T');
    }
    // Điểm dược/biển ngoài vùng bảo vệ phải đi được.
    [[31, 10], [56, 26], [36, 24], [44, 13], [12, 29], [24, 31], [24, 29], [43, 23], [33, 34]
    ].forEach(function (p) { S(p[0], p[1], '.'); });
    // Cổng: nam về map 4 (hàng 43), bắc lên map 6 (hàng 0, khoét sau cùng).
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { S(gx, 43, 'G'); S(gx, 0, 'G'); });
    return join(g);
  }
  var MAP5 = {
    id: 'map5', name: 'Thập Vạn Đại Sơn · Trung Phúc', bg: 'assets/map5-bg-v7.png',
    w: W5, h: H5, tiles: buildTiles5(), blocked: BLOCKED,
    start: { x: 19, y: 42 },
    eliteChance: 0.12,
    portals: edgePortals(43, 'map4', 1, 'Cổng Xuống Ngoại Vi')
      .concat(edgePortalsTier(0, 'map6', 42, 'Đường Lên Thâm Xứ', 7, 'Luyện Khí tầng 7')),
    npcs: [],
    bossLairs: [
      { id: 'dien_co_trung_phuc', name: 'Điện Cổ Trung Phúc', x: 26, y: 5, rect: [23, 3, 29, 7] }
    ],
    zones: [
      { id: 'ran_phe_tich_trung_phuc', name: 'Phế Tích Cổ Rắn Lục', rects: [[16, 8, 30, 13]], types: ['ran_luc'] },
      { id: 'soi_rung_gia', name: 'Khu Sói Rừng Già', rects: [[5, 16, 16, 25]], types: ['soi_rung'] },
      { id: 'lon_mong_sat_trung_phuc', name: 'Khu Lợn Mông Sắt', rects: [[19, 20, 29, 28]], types: ['lon_mong_sat'] },
      { id: 'khi_co_thu_trung_phuc', name: 'Khu Khỉ Cổ Thụ', rects: [[38, 14, 49, 22]], types: ['khi_mat_do'] },
      { id: 'ran_bo_suoi', name: 'Bờ Suối Rắn Lục', rects: [[52, 8, 55, 30]], types: ['ran_luc'] }
    ],
    monsters: [
      { type: 'ran_luc', x: 18, y: 9, zone: 'ran_phe_tich_trung_phuc' }, { type: 'ran_luc', x: 21, y: 10, zone: 'ran_phe_tich_trung_phuc' }, { type: 'ran_luc', x: 24, y: 9, zone: 'ran_phe_tich_trung_phuc' },
      { type: 'ran_luc', x: 27, y: 11, zone: 'ran_phe_tich_trung_phuc' }, { type: 'ran_luc', x: 29, y: 12, zone: 'ran_phe_tich_trung_phuc' }, { type: 'ran_luc', x: 19, y: 12, zone: 'ran_phe_tich_trung_phuc' },
      { type: 'ran_luc', x: 25, y: 12, zone: 'ran_phe_tich_trung_phuc' }, { type: 'ran_luc', x: 22, y: 8, zone: 'ran_phe_tich_trung_phuc' },
      { type: 'soi_rung', x: 6, y: 17, zone: 'soi_rung_gia' }, { type: 'soi_rung', x: 10, y: 18, zone: 'soi_rung_gia' }, { type: 'soi_rung', x: 14, y: 17, zone: 'soi_rung_gia' },
      { type: 'soi_rung', x: 7, y: 21, zone: 'soi_rung_gia' }, { type: 'soi_rung', x: 12, y: 22, zone: 'soi_rung_gia' }, { type: 'soi_rung', x: 15, y: 24, zone: 'soi_rung_gia' },
      { type: 'soi_rung', x: 9, y: 24, zone: 'soi_rung_gia' }, { type: 'soi_rung', x: 13, y: 20, zone: 'soi_rung_gia' }, { type: 'soi_rung', x: 5, y: 20, zone: 'soi_rung_gia' },
      { type: 'lon_mong_sat', x: 20, y: 21, zone: 'lon_mong_sat_trung_phuc' }, { type: 'lon_mong_sat', x: 24, y: 22, zone: 'lon_mong_sat_trung_phuc' }, { type: 'lon_mong_sat', x: 28, y: 21, zone: 'lon_mong_sat_trung_phuc' },
      { type: 'lon_mong_sat', x: 21, y: 24, zone: 'lon_mong_sat_trung_phuc' }, { type: 'lon_mong_sat', x: 26, y: 25, zone: 'lon_mong_sat_trung_phuc' }, { type: 'lon_mong_sat', x: 29, y: 27, zone: 'lon_mong_sat_trung_phuc' },
      { type: 'lon_mong_sat', x: 23, y: 27, zone: 'lon_mong_sat_trung_phuc' }, { type: 'lon_mong_sat', x: 27, y: 23, zone: 'lon_mong_sat_trung_phuc' }, { type: 'lon_mong_sat', x: 20, y: 27, zone: 'lon_mong_sat_trung_phuc' },
      { type: 'lon_mong_sat', x: 29, y: 24, zone: 'lon_mong_sat_trung_phuc' },
      { type: 'khi_mat_do', x: 39, y: 15, zone: 'khi_co_thu_trung_phuc' }, { type: 'khi_mat_do', x: 43, y: 16, zone: 'khi_co_thu_trung_phuc' }, { type: 'khi_mat_do', x: 47, y: 15, zone: 'khi_co_thu_trung_phuc' },
      { type: 'khi_mat_do', x: 39, y: 18, zone: 'khi_co_thu_trung_phuc' }, { type: 'khi_mat_do', x: 45, y: 21, zone: 'khi_co_thu_trung_phuc' }, { type: 'khi_mat_do', x: 49, y: 18, zone: 'khi_co_thu_trung_phuc' },
      { type: 'khi_mat_do', x: 42, y: 21, zone: 'khi_co_thu_trung_phuc' }, { type: 'khi_mat_do', x: 48, y: 22, zone: 'khi_co_thu_trung_phuc' }, { type: 'khi_mat_do', x: 44, y: 14, zone: 'khi_co_thu_trung_phuc' },
      { type: 'ran_luc', x: 53, y: 10, zone: 'ran_bo_suoi' }, { type: 'ran_luc', x: 54, y: 14, zone: 'ran_bo_suoi' }, { type: 'ran_luc', x: 53, y: 18, zone: 'ran_bo_suoi' },
      { type: 'ran_luc', x: 55, y: 22, zone: 'ran_bo_suoi' }, { type: 'ran_luc', x: 53, y: 26, zone: 'ran_bo_suoi' }, { type: 'ran_luc', x: 54, y: 30, zone: 'ran_bo_suoi' },
      { type: 'ran_luc', x: 55, y: 11, zone: 'ran_bo_suoi' }, { type: 'ran_luc', x: 55, y: 25, zone: 'ran_bo_suoi' }
    ],
    herbs: [
      { x: 17, y: 3, item: 'linh_chi' }, { x: 31, y: 10, item: 'linh_chi' }, { x: 53, y: 12, item: 'linh_chi' },
      { x: 56, y: 26, item: 'linh_chi' }, { x: 36, y: 24, item: 'linh_chi' }, { x: 44, y: 13, item: 'linh_chi' },
      { x: 12, y: 29, item: 'linh_chi' }, { x: 24, y: 31, item: 'linh_chi' },
      { x: 8, y: 18, item: 'thao_duoc' }, { x: 14, y: 23, item: 'thao_duoc' }, { x: 21, y: 22, item: 'thao_duoc' },
      { x: 27, y: 26, item: 'thao_duoc' }, { x: 42, y: 17, item: 'thao_duoc' }, { x: 47, y: 20, item: 'thao_duoc' },
      { x: 53, y: 17, item: 'thao_duoc' }, { x: 33, y: 34, item: 'thao_duoc' }
    ],
    props: [
      { sprite: 'sign', x: 17, y: 40, label: 'Thập Vạn Đại Sơn · Trung Phúc' },
      { sprite: 'sign', x: 17, y: 1, label: 'Lên Thâm Xứ — Cần Luyện Khí tầng 7' },
      { sprite: 'sign', x: 26, y: 8, label: 'Điện Cổ Trung Phúc' },
      { sprite: 'sign', x: 22, y: 14, label: 'Phế Tích Cổ Rắn Lục' },
      { sprite: 'sign', x: 10, y: 26, label: 'Khu Sói Rừng Già' },
      { sprite: 'sign', x: 24, y: 29, label: 'Khu Lợn Mông Sắt' },
      { sprite: 'sign', x: 43, y: 23, label: 'Khu Khỉ Cổ Thụ' },
      { sprite: 'sign', x: 52, y: 31, label: 'Bờ Suối Rắn Lục' },
      { sprite: 'bush', x: 15, y: 31 }, { sprite: 'bush', x: 50, y: 33 }, { sprite: 'rock', x: 36, y: 36 }
    ]
  };
  // ================= MAP 6 — Thập Vạn Đại Sơn · Thâm Xứ (64x44, Luyện Khí 7+) =================
  // Ảnh nền: khe vực sông ngầm tây-trung (cầu đá ở giữa), 2 Suối Linh phát
  // sáng phía đông, rừng già tối. Quái dày nhất chuỗi, dược dày nhất chuỗi.
  var W6 = 64, H6 = 44;
  function buildTiles6() {
    var g = buildGridWH(W6, H6), y, x;
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch; }
    function S(px, py, ch) { g[py][px] = ch; }
    R(0, 0, W6 - 1, 0, 'W'); R(0, H6 - 1, W6 - 1, H6 - 1, 'W');
    R(0, 1, 0, H6 - 2, 'W'); R(W6 - 1, 1, W6 - 1, H6 - 2, 'W');
    // Khe vực: 2 vách đá + sông ngầm ở giữa, cầu đá ở hàng 20-21.
    for (y = 2; y <= 41; y++) { S(24, y, 'W'); S(25, y, 'W'); S(26, y, 'R'); S(27, y, 'R'); S(28, y, 'W'); S(29, y, 'W'); }
    R(24, 20, 29, 21, '#');
    // 2 Suối Linh phía đông (nước phát sáng trong ảnh).
    R(47, 5, 54, 5, 'R'); R(45, 6, 56, 12, 'R'); R(47, 13, 54, 13, 'R');
    R(47, 26, 54, 26, 'R'); R(45, 27, 56, 33, 'R'); R(47, 34, 54, 34, 'R');
    // Đường: trục tây (cổng nam <-> cổng bắc + sào huyệt + 2 khu tây),
    // cầu đá, trục đông (2 khu đông + bờ đông).
    R(16, 1, 23, 1, '#'); R(16, 42, 23, 42, '#');
    R(19, 2, 20, 19, '#'); R(19, 22, 20, 41, '#');
    R(13, 2, 18, 2, '#'); R(16, 10, 18, 10, '#'); R(16, 31, 18, 31, '#');
    R(21, 20, 23, 21, '#'); R(30, 20, 39, 21, '#');
    R(39, 2, 40, 19, '#'); R(39, 22, 40, 41, '#');
    // Cổ thụ thâm xứ: cụm cây landmark cạnh cầu phía đông (ngoài zones).
    S(31, 23, 'o'); S(32, 24, 'o'); // gốc cổ thụ: đá 'o' — ô 'T' gần spawn sẽ bị hậu xử lý luật quái đất (clearMonsterHabitats) chuyển thành đất trống
    // Rải cây/đá tất định NGOÀI zones/lair/hành lang hồ (luật 21:18).
    var zones6 = [[3, 5, 16, 16], [3, 26, 16, 37], [34, 5, 44, 16], [34, 25, 44, 37], [51, 16, 61, 23]];
    var lair6 = [4, 1, 12, 4];
    function protected6(px, py) {
      if (py <= 1 || py >= 42) return true;
      if (px >= 17 && px <= 22) return true;
      if (inRectXY(px, py, lair6)) return true;
      if (inRectXY(px, py, [44, 14, 61, 15]) || inRectXY(px, py, [44, 24, 61, 25])) return true;
      for (var i = 0; i < zones6.length; i++) if (inRectXY(px, py, zones6[i])) return true;
      return false;
    }
    for (y = 2; y < H6 - 1; y++) for (x = 1; x < W6 - 1; x++) {
      if (g[y][x] !== '.') continue;
      if (protected6(x, y)) continue;
      var d6 = (x >= 2 && x <= 17 && y >= 17 && y <= 25) ? 0.35 : 0.18;
      if (hash01(x + 307, y) < d6) S(x, y, 'T');
      else if (hash01(y + 311, x) > 0.97) S(x, y, 'o');
    }
    // Điểm dược/biển ngoài vùng bảo vệ phải đi được.
    [[57, 9], [57, 30], [22, 8], [22, 30], [30, 19], [21, 15], [21, 35], [17, 10], [17, 31],
     [33, 10], [33, 31], [50, 20], [30, 24], [18, 33], [58, 36]
    ].forEach(function (p) { S(p[0], p[1], '.'); });
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { S(gx, 43, 'G'); S(gx, 0, 'G'); });
    return join(g);
  }
  var MAP6 = {
    id: 'map6', name: 'Thập Vạn Đại Sơn · Thâm Xứ', bg: 'assets/map6-bg-v7.png',
    w: W6, h: H6, tiles: buildTiles6(), blocked: BLOCKED,
    start: { x: 19, y: 42 },
    eliteChance: 0.20,
    portals: edgePortals(43, 'map5', 1, 'Cổng Xuống Trung Phúc')
      .concat(edgePortalsTier(0, 'map7', 38, 'Đường Lên Chi Đỉnh', 9, 'Luyện Khí tầng 9')),
    npcs: [],
    bossLairs: [
      { id: 'hang_vuc_tham_xu', name: 'Hang Vực Thâm Xứ', x: 8, y: 2, rect: [4, 1, 12, 4] }
    ],
    zones: [
      { id: 'soi_rung_tham_xu', name: 'Khu Sói Rừng Thâm Xứ', rects: [[3, 5, 16, 16]], types: ['soi_rung'] },
      { id: 'lon_mong_sat_tham_xu', name: 'Khu Lợn Mông Sắt Thâm Xứ', rects: [[3, 26, 16, 37]], types: ['lon_mong_sat'] },
      { id: 'khi_mat_do_tham_xu', name: 'Khu Khỉ Mặt Đỏ Thâm Xứ', rects: [[34, 5, 44, 16]], types: ['khi_mat_do'] },
      { id: 'ran_suoi_linh', name: 'Khu Rắn Lục Suối Linh', rects: [[34, 25, 44, 37]], types: ['ran_luc'] },
      { id: 'soi_bo_dong', name: 'Khu Sói Rừng Bờ Đông', rects: [[51, 16, 61, 23]], types: ['soi_rung'] }
    ],
    monsters: [
      { type: 'soi_rung', x: 4, y: 6, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 8, y: 7, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 13, y: 6, zone: 'soi_rung_tham_xu' },
      { type: 'soi_rung', x: 5, y: 11, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 10, y: 12, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 15, y: 10, zone: 'soi_rung_tham_xu' },
      { type: 'soi_rung', x: 6, y: 15, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 11, y: 16, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 14, y: 14, zone: 'soi_rung_tham_xu' },
      { type: 'soi_rung', x: 4, y: 13, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 9, y: 9, zone: 'soi_rung_tham_xu' }, { type: 'soi_rung', x: 16, y: 7, zone: 'soi_rung_tham_xu' },
      { type: 'lon_mong_sat', x: 4, y: 27, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 8, y: 28, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 13, y: 27, zone: 'lon_mong_sat_tham_xu' },
      { type: 'lon_mong_sat', x: 5, y: 32, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 10, y: 33, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 15, y: 31, zone: 'lon_mong_sat_tham_xu' },
      { type: 'lon_mong_sat', x: 6, y: 36, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 11, y: 37, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 14, y: 35, zone: 'lon_mong_sat_tham_xu' },
      { type: 'lon_mong_sat', x: 4, y: 34, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 9, y: 30, zone: 'lon_mong_sat_tham_xu' }, { type: 'lon_mong_sat', x: 16, y: 28, zone: 'lon_mong_sat_tham_xu' },
      { type: 'khi_mat_do', x: 35, y: 6, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 38, y: 6, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 43, y: 7, zone: 'khi_mat_do_tham_xu' },
      { type: 'khi_mat_do', x: 35, y: 11, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 41, y: 12, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 44, y: 15, zone: 'khi_mat_do_tham_xu' },
      { type: 'khi_mat_do', x: 36, y: 15, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 42, y: 10, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 37, y: 13, zone: 'khi_mat_do_tham_xu' },
      { type: 'khi_mat_do', x: 44, y: 5, zone: 'khi_mat_do_tham_xu' }, { type: 'khi_mat_do', x: 34, y: 9, zone: 'khi_mat_do_tham_xu' },
      { type: 'ran_luc', x: 35, y: 26, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 38, y: 27, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 43, y: 26, zone: 'ran_suoi_linh' },
      { type: 'ran_luc', x: 35, y: 32, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 41, y: 33, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 44, y: 36, zone: 'ran_suoi_linh' },
      { type: 'ran_luc', x: 36, y: 36, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 42, y: 30, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 37, y: 29, zone: 'ran_suoi_linh' },
      { type: 'ran_luc', x: 44, y: 29, zone: 'ran_suoi_linh' }, { type: 'ran_luc', x: 34, y: 34, zone: 'ran_suoi_linh' },
      { type: 'soi_rung', x: 52, y: 17, zone: 'soi_bo_dong' }, { type: 'soi_rung', x: 56, y: 18, zone: 'soi_bo_dong' }, { type: 'soi_rung', x: 60, y: 17, zone: 'soi_bo_dong' },
      { type: 'soi_rung', x: 53, y: 21, zone: 'soi_bo_dong' }, { type: 'soi_rung', x: 57, y: 22, zone: 'soi_bo_dong' }, { type: 'soi_rung', x: 61, y: 20, zone: 'soi_bo_dong' },
      { type: 'soi_rung', x: 54, y: 19, zone: 'soi_bo_dong' }, { type: 'soi_rung', x: 59, y: 23, zone: 'soi_bo_dong' }, { type: 'soi_rung', x: 51, y: 22, zone: 'soi_bo_dong' },
      { type: 'soi_rung', x: 58, y: 16, zone: 'soi_bo_dong' }
    ],
    herbs: [
      { x: 44, y: 6, item: 'linh_chi' }, { x: 44, y: 12, item: 'linh_chi' }, { x: 57, y: 9, item: 'linh_chi' },
      { x: 44, y: 27, item: 'linh_chi' }, { x: 44, y: 33, item: 'linh_chi' }, { x: 57, y: 30, item: 'linh_chi' },
      { x: 22, y: 8, item: 'linh_chi' }, { x: 22, y: 30, item: 'linh_chi' }, { x: 22, y: 21, item: 'linh_chi' },
      { x: 30, y: 19, item: 'linh_chi' }, { x: 36, y: 7, item: 'linh_chi' }, { x: 42, y: 14, item: 'linh_chi' },
      { x: 36, y: 35, item: 'linh_chi' }, { x: 43, y: 28, item: 'linh_chi' }, { x: 6, y: 7, item: 'linh_chi' },
      { x: 14, y: 14, item: 'linh_chi' }, { x: 54, y: 18, item: 'linh_chi' }, { x: 59, y: 21, item: 'linh_chi' },
      { x: 5, y: 12, item: 'thao_duoc' }, { x: 10, y: 9, item: 'thao_duoc' }, { x: 6, y: 30, item: 'thao_duoc' },
      { x: 13, y: 34, item: 'thao_duoc' }, { x: 35, y: 10, item: 'thao_duoc' }, { x: 43, y: 13, item: 'thao_duoc' },
      { x: 37, y: 30, item: 'thao_duoc' }, { x: 42, y: 36, item: 'thao_duoc' }, { x: 53, y: 20, item: 'thao_duoc' },
      { x: 55, y: 23, item: 'thao_duoc' }, { x: 21, y: 15, item: 'thao_duoc' }, { x: 21, y: 35, item: 'thao_duoc' }
    ],
    props: [
      { sprite: 'sign', x: 17, y: 40, label: 'Thập Vạn Đại Sơn · Thâm Xứ' },
      { sprite: 'sign', x: 17, y: 1, label: 'Lên Chi Đỉnh — Cần Luyện Khí tầng 9' },
      { sprite: 'sign', x: 13, y: 2, label: 'Hang Vực Thâm Xứ' },
      { sprite: 'sign', x: 17, y: 10, label: 'Khu Sói Rừng Thâm Xứ' },
      { sprite: 'sign', x: 17, y: 31, label: 'Khu Lợn Mông Sắt Thâm Xứ' },
      { sprite: 'sign', x: 33, y: 10, label: 'Khu Khỉ Mặt Đỏ Thâm Xứ' },
      { sprite: 'sign', x: 33, y: 31, label: 'Khu Rắn Lục Suối Linh' },
      { sprite: 'sign', x: 50, y: 20, label: 'Khu Sói Rừng Bờ Đông' },
      { sprite: 'sign', x: 30, y: 24, label: 'Cổ Thụ Thâm Xứ' },
      { sprite: 'sign', x: 44, y: 9, label: 'Suối Linh Thâm Xứ' },
      { sprite: 'bush', x: 18, y: 33 }, { sprite: 'rock', x: 58, y: 36 }
    ]
  };
  // ================= MAP 7 — Thập Vạn Đại Sơn · Chi Đỉnh (56x40, Luyện Khí 9 viên mãn) =================
  // Ảnh nền: cao nguyên đỉnh núi — đài đá tròn + bia đá cổ ở bắc-trung, đường
  // đá bậc thang từ nam lên, tuyết nhẹ về bắc, biển mây ở mép nam/đông (mây
  // ĐỘNG của js/clouds.js cũng mở cho map 7). Ít quái nhưng đàn toàn loài
  // lăn tinh anh + eliteChance cao nhất chuỗi. Bia cổ chỉ là điểm nhấn cốt
  // truyện hướng về ngưỡng Trúc Cơ — KHÔNG mở cảnh giới mới ở đây.
  var W7 = 56, H7 = 40;
  function buildTiles7() {
    var g = buildGridWH(W7, H7), y, x;
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch; }
    function S(px, py, ch) { g[py][px] = ch; }
    R(0, 0, W7 - 1, 0, 'W'); R(0, H7 - 1, W7 - 1, H7 - 1, 'W');
    R(0, 1, 0, H7 - 2, 'W'); R(W7 - 1, 1, W7 - 1, H7 - 2, 'W');
    // Đài đá đỉnh: sân 'Q' + bia đá cổ (3 ô đá ở mép bắc đài, NGOÀI sào).
    R(18, 3, 34, 14, 'Q');
    S(18, 3, 'o'); S(34, 3, 'o'); S(18, 14, 'o'); S(34, 14, 'o');
    S(25, 4, 'o'); S(26, 4, 'o'); S(27, 4, 'o');
    // Cụm vách đá tuyết ở 4 góc (khớp ảnh).
    R(2, 8, 5, 11, 'W'); R(48, 6, 52, 9, 'W'); R(3, 29, 7, 32, 'W'); R(46, 29, 52, 33, 'W');
    // Đường đá bậc thang: cổng nam -> đài; thềm 2 cổng; nhánh sang 2 khu bên.
    R(24, 1, 31, 1, '#'); R(16, 38, 23, 38, '#');
    R(26, 2, 27, 2, '#'); R(19, 15, 20, 37, '#');
    R(17, 20, 18, 20, '#'); R(33, 22, 37, 22, '#');
    // Rải đá/thông thưa tất định NGOÀI zones/lair/đài (luật 21:18).
    var zones7 = [[6, 16, 16, 26], [38, 17, 49, 27], [20, 24, 32, 33]];
    var lair7 = [21, 5, 31, 12];
    function protected7(px, py) {
      if (py <= 1 || py >= 38) return true;
      if (px >= 17 && px <= 22) return true;
      if (inRectXY(px, py, lair7)) return true;
      if (px >= 24 && px <= 31 && py <= 2) return true;
      if (inRectXY(px, py, [18, 3, 34, 14])) return true;
      for (var i = 0; i < zones7.length; i++) if (inRectXY(px, py, zones7[i])) return true;
      return false;
    }
    for (y = 2; y < H7 - 1; y++) for (x = 1; x < W7 - 1; x++) {
      if (g[y][x] !== '.') continue;
      if (protected7(x, y)) continue;
      var d7 = (y <= 6) ? 0.10 : 0.05;
      if (hash01(x + 401, y) < d7) S(x, y, 'o');
      else if (hash01(y + 409, x) > 0.96) S(x, y, 'T');
    }
    // Điểm dược/biển ngoài vùng bảo vệ phải đi được.
    [[24, 16], [30, 16], [22, 2], [33, 36], [33, 29], [24, 2], [31, 2]
    ].forEach(function (p) { S(p[0], p[1], '.'); });
    [25, 26, 27, 28, 29, 30].forEach(function (gx) { S(gx, 0, 'G'); });
    [17, 18, 19, 20, 21, 22].forEach(function (gx) { S(gx, 39, 'G'); });
    return join(g);
  }
  var MAP7 = {
    id: 'map7', name: 'Thập Vạn Đại Sơn · Chi Đỉnh', bg: 'assets/map7-bg-v7.png',
    w: W7, h: H7, tiles: buildTiles7(), blocked: BLOCKED,
    start: { x: 19, y: 38 },
    eliteChance: 0.40,
    // Cổng bắc lên map 8 khai ở mục "Nối chuỗi cổng" cuối file:
    // chainPortals(0, 28, 'map8', ..., realmGate('truc_co')) cộng vào
    // MAP7.portals theo quy ước chặng cảnh giới cao (vòng tích hợp 2026-10-30).
    portals: edgePortals(39, 'map6', 1, 'Cổng Xuống Thâm Xứ'),
    npcs: [],
    bossLairs: [
      { id: 'phong_dinh_dai', name: 'Phong Đỉnh Đài', x: 26, y: 9, rect: [21, 5, 31, 12] }
    ],
    zones: [
      { id: 'khi_dinh_may', name: 'Khu Khỉ Đỉnh Mây', rects: [[6, 16, 16, 26]], types: ['khi_mat_do'] },
      { id: 'soi_dinh_tuyet', name: 'Khu Sói Đỉnh Tuyết', rects: [[38, 17, 49, 27]], types: ['soi_rung'] },
      { id: 'lon_da_dinh', name: 'Khu Lợn Đá Đỉnh', rects: [[20, 24, 32, 33]], types: ['lon_mong_sat'] }
    ],
    monsters: [
      { type: 'khi_mat_do', x: 7, y: 17, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 11, y: 18, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 15, y: 17, zone: 'khi_dinh_may' },
      { type: 'khi_mat_do', x: 8, y: 22, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 13, y: 23, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 16, y: 25, zone: 'khi_dinh_may' },
      { type: 'khi_mat_do', x: 10, y: 25, zone: 'khi_dinh_may' },
      { type: 'soi_rung', x: 39, y: 18, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 44, y: 19, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 48, y: 18, zone: 'soi_dinh_tuyet' },
      { type: 'soi_rung', x: 40, y: 23, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 45, y: 24, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 49, y: 26, zone: 'soi_dinh_tuyet' },
      { type: 'soi_rung', x: 42, y: 26, zone: 'soi_dinh_tuyet' },
      { type: 'lon_mong_sat', x: 21, y: 25, zone: 'lon_da_dinh' }, { type: 'lon_mong_sat', x: 26, y: 26, zone: 'lon_da_dinh' }, { type: 'lon_mong_sat', x: 31, y: 25, zone: 'lon_da_dinh' },
      { type: 'lon_mong_sat', x: 22, y: 30, zone: 'lon_da_dinh' }, { type: 'lon_mong_sat', x: 27, y: 31, zone: 'lon_da_dinh' }, { type: 'lon_mong_sat', x: 32, y: 32, zone: 'lon_da_dinh' },
      // QA 14:31 30/10 (lượt test+khắc phục lệnh Bui 19:35): map 7
      // thưa quái nhất chuỗi (20 spawn/4.480 ô = 0,45/100 ô — các map
      // 8–14 đều 0,80/100) vì cụm vành V10 của riêng map này bị kiểm
      // liên thông zone bác sạch. Bổ sung 16 spawn vào ĐÚNG 3 khu sẵn
      // có bằng 3 loài sẵn có (khỉ +6, sói +6, lợn +4 -> tổng 36,
      // ~0,80/100 ô ngang dãy; tỉ lệ loài giữ atk trung bình map ở
      // 8,39 — trong dung sai tiến trình của audit, và không con
      // mạnh nhất nào đứng gần điểm vào quá luật L7): mọi vị trí đã
      // kiểm trên lưới cuối — đất đi được, hộp lang thang ±4 thoáng
      // >= 55%, cách spawn khác/dược/biển >= 2 ô, trong rect khu.
      { type: 'khi_mat_do', x: 6, y: 26, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 13, y: 26, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 14, y: 20, zone: 'khi_dinh_may' },
      { type: 'khi_mat_do', x: 9, y: 16, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 11, y: 16, zone: 'khi_dinh_may' }, { type: 'khi_mat_do', x: 13, y: 16, zone: 'khi_dinh_may' },
      { type: 'soi_rung', x: 38, y: 27, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 49, y: 22, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 45, y: 27, zone: 'soi_dinh_tuyet' },
      { type: 'soi_rung', x: 41, y: 17, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 43, y: 17, zone: 'soi_dinh_tuyet' }, { type: 'soi_rung', x: 45, y: 17, zone: 'soi_dinh_tuyet' },
      { type: 'lon_mong_sat', x: 29, y: 28, zone: 'lon_da_dinh' }, { type: 'lon_mong_sat', x: 23, y: 33, zone: 'lon_da_dinh' },
      { type: 'lon_mong_sat', x: 23, y: 24, zone: 'lon_da_dinh' }, { type: 'lon_mong_sat', x: 25, y: 24, zone: 'lon_da_dinh' }
    ],
    herbs: [
      { x: 24, y: 16, item: 'linh_chi' }, { x: 30, y: 16, item: 'linh_chi' }, { x: 12, y: 20, item: 'linh_chi' },
      { x: 43, y: 21, item: 'linh_chi' }, { x: 26, y: 28, item: 'linh_chi' }, { x: 22, y: 2, item: 'linh_chi' },
      { x: 9, y: 24, item: 'thao_duoc' }, { x: 46, y: 25, item: 'thao_duoc' }, { x: 23, y: 31, item: 'thao_duoc' },
      { x: 33, y: 36, item: 'thao_duoc' }
    ],
    props: [
      { sprite: 'sign', x: 17, y: 37, label: 'Thập Vạn Đại Sơn · Chi Đỉnh' },
      { sprite: 'sign', x: 24, y: 13, label: 'Bia Cổ — Ngưỡng Trúc Cơ' },
      { sprite: 'sign', x: 28, y: 13, label: 'Phong Đỉnh Đài' },
      { sprite: 'sign', x: 17, y: 21, label: 'Khu Khỉ Đỉnh Mây' },
      { sprite: 'sign', x: 37, y: 22, label: 'Khu Sói Đỉnh Tuyết' },
      { sprite: 'sign', x: 33, y: 29, label: 'Khu Lợn Đá Đỉnh' }
    ]
  };
  // ================= CHẶNG CẢNH GIỚI CAO — SÂU TRONG THẬP VẠN ĐẠI SƠN (V9) =================
  // Lệnh Bui 21:19 2026-10-29: thêm nhiều map cho các cảnh giới CAO sau này
  // (Trúc Cơ -> Kim Đan -> Nguyên Anh -> Hóa Thần -> Độ Kiếp), đất rộng để
  // đông người cùng săn boss / farm quái / hái linh dược làm điều kiện đột
  // phá về sau. Mọi tên map/khu/dược trong chặng này đều là ĐỀ XUẤT.
  // Chuỗi: map 4 -> map 5 -> map 6 -> map 7 (mép bắc, dải 25..30)
  // -> map 8 -> map 9 -> map 10 -> map 11 -> map 12 -> map 13 -> map 14
  // (đỉnh). Cổng vào map 8 đã dời từ map 4 sang map 7 ở mục "Nối chuỗi
  // cổng" cuối file (vòng tích hợp 2026-10-30).
  // ----- Thang cảnh giới tổng (realmRank) -----
  // Cổng kiểm tra theo HẠNG này chứ không ghim vào tầng Luyện Khí: hôm nay
  // mọi nhân vật đều hạng 0–1 nên bị chặn ở cổng Trúc Cơ; khi hệ cảnh giới
  // cao ra mắt, nó chỉ cần ghi ch.realmRank (hoặc đặt ch.realm bắt đầu
  // bằng tên cảnh giới, vd 'Trúc Cơ sơ kỳ') là cổng tự mở.
  var REALMS = [
    { id: 'pham_nhan', name: 'Phàm Nhân', rank: 0 },
    { id: 'luyen_khi', name: 'Luyện Khí', rank: 1 },
    { id: 'truc_co', name: 'Trúc Cơ', rank: 2 },
    { id: 'kim_dan', name: 'Kim Đan', rank: 3 },
    { id: 'nguyen_anh', name: 'Nguyên Anh', rank: 4 },
    { id: 'hoa_than', name: 'Hóa Thần', rank: 5 },
    { id: 'do_kiep', name: 'Độ Kiếp', rank: 6 }
  ];
  function realmById(id) {
    for (var i = 0; i < REALMS.length; i++) if (REALMS[i].id === id) return REALMS[i];
    return REALMS[0];
  }
  function realmRankOf(ch) {
    if (!ch) return 0;
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    if (ch.realm) {
      for (var i = REALMS.length - 1; i >= 0; i--) {
        if (ch.realm.indexOf(REALMS[i].name) === 0) return REALMS[i].rank;
      }
    }
    if (typeof ch.tier === 'number') return ch.tier > 0 ? 1 : 0;
    return 0;
  }
  // Dữ liệu khóa cổng gắn trên portal: { realm, rank, name }.
  function realmGate(realmId) { var r = realmById(realmId); return { realm: r.id, rank: r.rank, name: r.name }; }
  // Dải cổng 6 ô ở hàng y, tâm dải scx của map nguồn; điểm rơi trong map
  // đích theo tâm đích tcx (nửa trái rơi tcx-1, nửa phải rơi tcx).
  function chainPortals(y, scx, to, tcx, ty, gate) {
    var out = [];
    for (var i = 0; i < 6; i++) {
      var p = { x: scx - 3 + i, y: y, to: to, tx: i < 3 ? tcx - 1 : tcx, ty: ty, name: gate ? ('Cổng ' + gate.name) : 'Cổng' };
      if (gate) p.gate = gate;
      out.push(p);
    }
    return out;
  }
  function gridWH(w, h, fill) {
    var g = [], y, x;
    for (y = 0; y < h; y++) { var row = []; for (x = 0; x < w; x++) row.push(fill); g.push(row); }
    return g;
  }
  // Lưới cho map chặng cao: vành vách + xương sống đường mòn (trục dọc theo
  // cột cổng, 2 trục ngang) + ao địa hình + đài đá. Khu quái và sào boss
  // được DỌN SẠCH vật chắn sau khi rải trang trí — luật Bui 21:18: quái
  // dưới đất chỉ ở đất đi được, thông nhau (test BFS kiểm chứng).
  function buildHighTiles(cfg) {
    var w = cfg.w, h = cfg.h, cx = Math.floor(w / 2);
    var g = gridWH(w, h, '.'), x, y;
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch; }
    function S(px, py, ch) { g[py][px] = ch; }
    R(0, 0, w - 1, 0, 'W'); R(0, h - 1, w - 1, h - 1, 'W');
    R(0, 1, 0, h - 2, 'W'); R(w - 1, 1, w - 1, h - 2, 'W');
    R(cx - 1, 1, cx, h - 2, '#');
    var hy1 = Math.floor(h * 0.36), hy2 = Math.floor(h * 0.66);
    R(1, hy1, w - 2, hy1, '#'); R(1, hy1 + 1, w - 2, hy1 + 1, '#');
    R(1, hy2, w - 2, hy2, '#'); R(1, hy2 + 1, w - 2, hy2 + 1, '#');
    (cfg.pools || []).forEach(function (r) { R(r[0], r[1], r[2], r[3], 'R'); });
    if (cfg.platform) R(cfg.platform[0], cfg.platform[1], cfg.platform[2], cfg.platform[3], 'Q');
    var dens = cfg.scatter || 0.10, sch = cfg.scatterChar || 'T';
    for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
      if (g[y][x] !== '.') continue;
      if (hash01(x + cfg.seed, y) < dens) S(x, y, sch);
      else if (hash01(y + cfg.seed * 3, x) > 0.975) S(x, y, 'o');
    }
    cfg.zones.forEach(function (z) { z.rects.forEach(function (r) { R(r[0], r[1], r[2], r[3], '.'); }); });
    (cfg.lairs || []).forEach(function (l) { R(l.rect[0], l.rect[1], l.rect[2], l.rect[3], 'Q'); });
    if (cfg.platform) {
      R(cfg.platform[0], cfg.platform[1], cfg.platform[2], cfg.platform[3], 'Q');
      (cfg.pillars || []).forEach(function (p) { S(p[0], p[1], 'o'); });
    }
    for (x = cx - 3; x <= cx + 2; x++) { S(x, 0, 'G'); S(x, h - 1, 'G'); S(x, 1, '#'); S(x, h - 2, '#'); }
    return { tiles: join(g), cx: cx };
  }
  // Chọn điểm spawn tất định trong khu: rải theo băm, cách nhau >= 4 ô
  // (Manhattan), chỉ lấy ô đi được — quái đất không bao giờ đứng ô chắn.
  function pickSpawns(mp, zone, n) {
    var cells = [], x, y;
    zone.rects.forEach(function (r) {
      for (y = r[1]; y <= r[3]; y++) for (x = r[0]; x <= r[2]; x++) cells.push([x, y]);
    });
    var salt = zone.id.length * 13 + n;
    cells.sort(function (a, b) { return hash01(a[0] * 3 + salt, a[1] * 7) - hash01(b[0] * 3 + salt, b[1] * 7); });
    // Luật an toàn điểm rơi (team bố trí map, lệnh Bui 05:57 30/10): hộp
    // lang thang ±4 quanh spawn KHÔNG được chứa điểm rơi cổng/start của
    // map — điểm rơi của chuỗi cổng luôn ở (cx-1|cx, 1) phía bắc và
    // (cx-1|cx, h-2) phía nam (= start), nên lọc theo 4 neo đó.
    var cxH = Math.floor(mp.w / 2);
    var anchorsH = [[cxH - 1, 1], [cxH, 1], [cxH - 1, mp.h - 2], [cxH, mp.h - 2]];
    var picked = [];
    for (var i = 0; i < cells.length && picked.length < n; i++) {
      var c = cells[i];
      if (isBlockedIn(mp, c[0], c[1])) continue;
      var okS = true;
      for (var a2 = 0; a2 < anchorsH.length; a2++) {
        if (Math.abs(c[0] - anchorsH[a2][0]) <= 4 && Math.abs(c[1] - anchorsH[a2][1]) <= 4) { okS = false; break; }
      }
      if (!okS) continue;
      for (var j = 0; j < picked.length; j++) {
        if (Math.abs(picked[j].x - c[0]) + Math.abs(picked[j].y - c[1]) < 4) { okS = false; break; }
      }
      if (okS) picked.push({ type: zone.types[0], x: c[0], y: c[1], zone: zone.id });
    }
    return picked;
  }
  // Điểm dược theo CỤM: mỗi cụm cho tối đa n node quanh tâm, chỉ ô đi được.
  function pickHerbs(mp, clusters) {
    var out = [], used = {};
    var offs = [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [-2, -2], [3, 1], [-3, -1], [1, 3], [-1, -3]];
    clusters.forEach(function (cl) {
      var got = 0;
      for (var i = 0; i < offs.length && got < cl.n; i++) {
        var x = cl.x + offs[i][0], y = cl.y + offs[i][1], k = x + ',' + y;
        if (x < 1 || y < 1 || x >= mp.w - 0 || y >= mp.h || used[k]) continue;
        if (x >= mp.w || isBlockedIn(mp, x, y)) continue;
        used[k] = 1; out.push({ x: x, y: y, item: cl.item }); got++;
      }
    });
    return out;
  }
  function highMap(cfg) {
    var built = buildHighTiles(cfg);
    var mp = {
      id: cfg.id, name: cfg.name, bg: cfg.bg, w: cfg.w, h: cfg.h,
      tiles: built.tiles, blocked: BLOCKED,
      start: { x: built.cx - 1, y: cfg.h - 2 },
      reqRealm: realmGate(cfg.realm),
      portals: [], npcs: [], zones: cfg.zones, bossLairs: cfg.lairs || [],
      monsters: [], herbs: [], props: []
    };
    cfg.zones.forEach(function (z, zi) { mp.monsters = mp.monsters.concat(pickSpawns(mp, z, cfg.spawns[zi])); });
    mp.herbs = pickHerbs(mp, cfg.clusters || []);
    mp.props.push({ sprite: 'sign', x: built.cx - 4, y: cfg.h - 3, label: cfg.name });
    mp.props.push({ sprite: 'sign', x: built.cx + 3, y: cfg.h - 3, label: 'Đất ' + realmById(cfg.realm).name });
    cfg.zones.forEach(function (z) { mp.props.push({ sprite: 'sign', x: z.rects[0][0] + 1, y: z.rects[0][1], label: z.name }); });
    (cfg.lairs || []).forEach(function (l) { mp.props.push({ sprite: 'sign', x: l.rect[0] + 1, y: l.rect[3] + 1, label: l.name }); });
    (cfg.signs || []).forEach(function (s2) { mp.props.push(s2); });
    return mp;
  }
  var Z64 = function (a, b, c, d) { // 4 khu góc cho map 64x44
    return [
      { id: a[0], name: a[1], rects: [[3, 3, 26, 13]], types: [a[2]] },
      { id: b[0], name: b[1], rects: [[37, 3, 60, 13]], types: [b[2]] },
      { id: c[0], name: c[1], rects: [[3, 31, 26, 41]], types: [c[2]] },
      { id: d[0], name: d[1], rects: [[37, 31, 60, 41]], types: [d[2]] }
    ];
  };
  var Z56 = function (a, b, c, d) { // 4 khu góc cho map 56x40
    return [
      { id: a[0], name: a[1], rects: [[3, 3, 23, 11]], types: [a[2]] },
      { id: b[0], name: b[1], rects: [[32, 3, 52, 11]], types: [b[2]] },
      { id: c[0], name: c[1], rects: [[3, 28, 23, 37]], types: [c[2]] },
      { id: d[0], name: d[1], rects: [[32, 28, 52, 37]], types: [d[2]] }
    ];
  };
  // ---- MAP 8: Sơn Trung Vân Hải (Trúc Cơ) 64x44 ----
  var MAP8 = highMap({
    id: 'map8', name: 'Sơn Trung Vân Hải', bg: 'assets/map8-bg-v7.png', realm: 'truc_co',
    w: 64, h: 44, seed: 801, scatter: 0.10, pools: [[52, 19, 58, 25]],
    zones: Z64(
      ['soi_van_hai', 'Khu Sói Rừng Vân Hải', 'soi_rung'],
      ['khi_co_thu_cao', 'Khu Khỉ Cổ Thụ Cao', 'khi_mat_do'],
      ['lon_van_hai', 'Khu Lợn Mông Sắt Vân Hải', 'lon_mong_sat'],
      ['ran_khe_may', 'Khe Mây Rắn Lục', 'ran_luc']),
    spawns: [7, 7, 7, 7],
    lairs: [
      { id: 'hang_van_hai', name: 'Hang Vân Hải', x: 12, y: 6, rect: [8, 4, 16, 9] },
      { id: 'dong_suoi_may', name: 'Động Suối Mây', x: 48, y: 35, rect: [44, 33, 53, 38] }
    ],
    clusters: [
      { item: 'long_tien_thao', x: 10, y: 12, n: 3 }, { item: 'long_tien_thao', x: 20, y: 5, n: 3 },
      { item: 'long_tien_thao', x: 45, y: 12, n: 3 }, { item: 'long_tien_thao', x: 55, y: 5, n: 2 },
      { item: 'linh_chi', x: 14, y: 33, n: 3 }, { item: 'linh_chi', x: 50, y: 40, n: 3 },
      { item: 'tu_linh_qua', x: 40, y: 8, n: 2 }, { item: 'tu_linh_qua', x: 58, y: 10, n: 2 }
    ]
  });
  // ---- MAP 9: Đoạn Long Lĩnh (Trúc Cơ) 56x40 ----
  var MAP9 = highMap({
    id: 'map9', name: 'Đoạn Long Lĩnh', bg: 'assets/map9-bg-v7.png', realm: 'truc_co',
    w: 56, h: 40, seed: 901, scatter: 0.12,
    zones: Z56(
      ['ran_lung_rong', 'Khu Rắn Lục Lưng Rồng', 'ran_luc'],
      ['soi_doan_long', 'Khu Sói Rừng Đoạn Long', 'soi_rung'],
      ['lon_linh', 'Khu Lợn Mông Sắt Lĩnh', 'lon_mong_sat'],
      ['khi_linh', 'Khu Khỉ Mặt Đỏ Lĩnh', 'khi_mat_do']),
    spawns: [6, 6, 6, 6],
    lairs: [
      { id: 'hang_long_cot', name: 'Hang Long Cốt', x: 42, y: 6, rect: [38, 4, 47, 8] }
    ],
    clusters: [
      { item: 'van_nien_linh_chi', x: 8, y: 6, n: 3 }, { item: 'van_nien_linh_chi', x: 18, y: 33, n: 2 },
      { item: 'long_tien_thao', x: 36, y: 33, n: 3 }, { item: 'long_tien_thao', x: 48, y: 6, n: 2 },
      { item: 'huyet_sam', x: 12, y: 10, n: 2 }, { item: 'huyet_sam', x: 44, y: 35, n: 2 }
    ]
  });
  // ---- MAP 10: Xích Diệm Hoang Nguyên (Kim Đan) 64x44 ----
  var MAP10 = highMap({
    id: 'map10', name: 'Xích Diệm Hoang Nguyên', bg: 'assets/map10-bg-v7.png', realm: 'kim_dan',
    w: 64, h: 44, seed: 1001, scatter: 0.08, pools: [[28, 18, 30, 26], [34, 18, 36, 26], [12, 18, 15, 24]],
    zones: Z64(
      ['lon_hoa_nguyen', 'Khu Lợn Mông Sắt Hỏa Nguyên', 'lon_mong_sat'],
      ['khi_xich_diem', 'Khu Khỉ Mặt Đỏ Xích Diệm', 'khi_mat_do'],
      ['soi_hoang_nguyen', 'Khu Sói Rừng Hoang Nguyên', 'soi_rung'],
      ['ran_diem', 'Khu Rắn Lục Diệm', 'ran_luc']),
    spawns: [7, 7, 7, 7],
    lairs: [
      { id: 'ho_diem_vuong', name: 'Hồ Diệm Vương', x: 21, y: 21, rect: [18, 19, 24, 24] },
      { id: 'hang_xich_diem', name: 'Hang Xích Diệm', x: 48, y: 8, rect: [44, 5, 53, 10] }
    ],
    clusters: [
      { item: 'hoa_diem_lien', x: 6, y: 20, n: 3 }, { item: 'hoa_diem_lien', x: 24, y: 20, n: 2 },
      { item: 'hoa_diem_lien', x: 40, y: 20, n: 3 }, { item: 'hoa_diem_lien', x: 58, y: 24, n: 2 },
      { item: 'hoa_diem_lien', x: 10, y: 6, n: 2 },
      { item: 'doc_tam_hoa', x: 44, y: 36, n: 2 }, { item: 'doc_tam_hoa', x: 52, y: 32, n: 2 },
      { item: 'son_tinh', x: 24, y: 33, n: 2 }
    ]
  });
  // ---- MAP 11: Hàn Băng Cốc (Kim Đan) 56x40 ----
  var MAP11 = highMap({
    id: 'map11', name: 'Hàn Băng Cốc', bg: 'assets/map11-bg-v7.png', realm: 'kim_dan',
    w: 56, h: 40, seed: 1101, scatter: 0.10, pools: [[6, 17, 12, 24], [43, 17, 49, 24]],
    zones: Z56(
      ['soi_bang_coc', 'Khu Sói Rừng Băng Cốc', 'soi_rung'],
      ['ran_bang', 'Khu Rắn Lục Băng', 'ran_luc'],
      ['khi_bang_coc', 'Khu Khỉ Mặt Đỏ Băng Cốc', 'khi_mat_do'],
      ['lon_bang', 'Khu Lợn Mông Sắt Băng', 'lon_mong_sat']),
    spawns: [6, 6, 6, 6],
    lairs: [
      { id: 'dong_bang_tinh', name: 'Động Băng Tinh', x: 42, y: 32, rect: [38, 30, 47, 35] }
    ],
    clusters: [
      { item: 'bang_tinh_hoa', x: 8, y: 6, n: 3 }, { item: 'bang_tinh_hoa', x: 18, y: 33, n: 3 },
      { item: 'bang_tinh_hoa', x: 36, y: 6, n: 2 }, { item: 'bang_tinh_hoa', x: 48, y: 33, n: 2 },
      { item: 'ngoc_tuy_chi', x: 20, y: 20, n: 2 }, { item: 'ngoc_tuy_chi', x: 38, y: 20, n: 2 }
    ]
  });
  // ---- MAP 12: Lôi Trì Thiên Khanh (Nguyên Anh) 64x44 ----
  var MAP12 = highMap({
    id: 'map12', name: 'Lôi Trì Thiên Khanh', bg: 'assets/map12-bg-v7.png', realm: 'nguyen_anh',
    w: 64, h: 44, seed: 1201, scatter: 0.08, scatterChar: 'o',
    pools: [[10, 19, 16, 25], [47, 19, 53, 25]],
    platform: [27, 18, 36, 27], pillars: [[27, 18], [36, 18], [27, 27], [36, 27]],
    zones: Z64(
      ['ran_loi_tri', 'Khu Rắn Lục Lôi Trì', 'ran_luc'],
      ['soi_loi', 'Khu Sói Rừng Thiên Khanh', 'soi_rung'],
      ['khi_loi', 'Khu Khỉ Mặt Đỏ Lôi', 'khi_mat_do'],
      ['lon_loi', 'Khu Lợn Mông Sắt Lôi Trì', 'lon_mong_sat']),
    spawns: [7, 7, 7, 7],
    lairs: [
      { id: 'huyet_loi_vuong', name: 'Huyệt Lôi Vương', x: 32, y: 22, rect: [29, 20, 35, 25] },
      { id: 'hang_thien_loi', name: 'Hang Thiên Lôi', x: 10, y: 8, rect: [6, 5, 14, 10] }
    ],
    clusters: [
      { item: 'thien_loi_qua', x: 20, y: 21, n: 3 }, { item: 'thien_loi_qua', x: 44, y: 21, n: 3 },
      { item: 'thien_loi_qua', x: 8, y: 6, n: 2 }, { item: 'thien_loi_qua', x: 56, y: 36, n: 2 },
      { item: 'thanh_linh_tuy', x: 24, y: 12, n: 2 }, { item: 'thanh_linh_tuy', x: 40, y: 33, n: 2 }
    ]
  });
  // ---- MAP 13: Tinh Vẫn Chi Địa (Hóa Thần) 56x40 ----
  var MAP13 = highMap({
    id: 'map13', name: 'Tinh Vẫn Chi Địa', bg: 'assets/map13-bg-v7.png', realm: 'hoa_than',
    w: 56, h: 40, seed: 1301, scatter: 0.12, scatterChar: 'o', pools: [[8, 18, 13, 23], [42, 18, 47, 23]],
    zones: Z56(
      ['khi_tinh_van', 'Khu Khỉ Mặt Đỏ Tinh Vẫn', 'khi_mat_do'],
      ['lon_tinh_van', 'Khu Lợn Mông Sắt Tinh Vẫn', 'lon_mong_sat'],
      ['soi_tinh_van', 'Khu Sói Rừng Tinh Vẫn', 'soi_rung'],
      ['ran_tinh_van', 'Khu Rắn Lục Tinh Vẫn', 'ran_luc']),
    spawns: [6, 6, 6, 6],
    lairs: [
      { id: 'van_tinh_ho', name: 'Hố Vẫn Tinh', x: 18, y: 20, rect: [15, 18, 21, 23] }
    ],
    clusters: [
      { item: 'tinh_van_thach', x: 24, y: 20, n: 3 }, { item: 'tinh_van_thach', x: 33, y: 20, n: 3 },
      { item: 'tinh_van_thach', x: 10, y: 6, n: 2 }, { item: 'tinh_van_thach', x: 46, y: 33, n: 2 },
      { item: 'son_tinh', x: 26, y: 33, n: 2 }
    ]
  });
  // ---- MAP 14: Độ Kiếp Đài (Độ Kiếp) 56x40 — đỉnh cao nhất, cuối chuỗi ----
  var MAP14 = highMap({
    id: 'map14', name: 'Độ Kiếp Đài', bg: 'assets/map14-bg-v7.png', realm: 'do_kiep',
    w: 56, h: 40, seed: 1401, scatter: 0.06,
    platform: [18, 8, 37, 20], pillars: [[18, 8], [37, 8], [18, 20], [37, 20], [26, 13]],
    zones: [
      { id: 'khi_thien_dai', name: 'Khu Khỉ Mặt Đỏ Thiên Đài', rects: [[3, 3, 16, 11]], types: ['khi_mat_do'] },
      { id: 'soi_thien_dai', name: 'Khu Sói Rừng Thiên Đài', rects: [[39, 3, 52, 11]], types: ['soi_rung'] },
      { id: 'lon_thien_dai', name: 'Khu Lợn Mông Sắt Thiên Đài', rects: [[3, 28, 23, 37]], types: ['lon_mong_sat'] },
      { id: 'ran_thien_dai', name: 'Khu Rắn Lục Thiên Đài', rects: [[32, 28, 52, 37]], types: ['ran_luc'] }
    ],
    spawns: [6, 6, 6, 6],
    lairs: [
      { id: 'dai_loi_dinh', name: 'Đài Lôi Đỉnh', x: 28, y: 5, rect: [24, 4, 32, 7] }
    ],
    clusters: [
      { item: 'thien_lien', x: 21, y: 15, n: 3 }, { item: 'thien_lien', x: 34, y: 15, n: 3 },
      { item: 'van_nien_linh_chi', x: 10, y: 24, n: 2 }, { item: 'van_nien_linh_chi', x: 46, y: 24, n: 2 }
    ],
    signs: [{ sprite: 'sign', x: 24, y: 9, label: 'Độ Kiếp Đài — đỉnh Thập Vạn Đại Sơn' }]
  });
  // ---- Nối chuỗi cổng (dữ liệu): vào khóa theo hạng cảnh giới của map
  // đích; quay về KHÔNG gắn gate nên không bao giờ khóa. ----
  // Vòng tích hợp (mục 3 hàng chờ, 2026-10-30): cổng vào chặng cao dời
  // từ mép bắc map 4 sang mép bắc map 7 — đúng dải cổng 25..30 đã chừa
  // sẵn (tâm cx=28, theo quy ước chainPortals) + thềm đá hàng 1; cổng về
  // của map 8 đổi sang (27/28, 1) trên map 7. Chuỗi đúng từ đây là:
  // map 4 -> map 5 -> map 6 -> map 7 -> map 8 -> ... -> map 14.
  MAP7.portals = MAP7.portals.concat(chainPortals(0, 28, 'map8', Math.floor(MAP8.w / 2), MAP8.h - 2, realmGate('truc_co')));
  MAP7.props.push({ sprite: 'sign', x: 31, y: 2, label: 'Lên Sơn Trung Vân Hải — Cần Trúc Cơ' });
  var HIGH_CHAIN = [MAP8, MAP9, MAP10, MAP11, MAP12, MAP13, MAP14];
  HIGH_CHAIN.forEach(function (mp, i) {
    var cx = Math.floor(mp.w / 2);
    if (i === 0) mp.portals = mp.portals.concat(chainPortals(mp.h - 1, cx, 'map7', 28, 1, null));
    if (i > 0) {
      var prev = HIGH_CHAIN[i - 1];
      mp.portals = mp.portals.concat(chainPortals(mp.h - 1, cx, prev.id, Math.floor(prev.w / 2), 1, null));
    }
    if (i < HIGH_CHAIN.length - 1) {
      var nxt = HIGH_CHAIN[i + 1];
      mp.portals = mp.portals.concat(chainPortals(0, cx, nxt.id, Math.floor(nxt.w / 2), nxt.h - 2, realmGate(nxt.reqRealm.realm)));
      // QA 14:31 30/10: biển cổng phải nói cả ĐIỀU KIỆN như biển map 7
      // ("Lên Sơn Trung Vân Hải — Cần Trúc Cơ") — trước đây 6 biển
      // chặng cao chỉ ghi tên map đích, người chơi đi vào mới bị cổng
      // chặn mới biết thiếu cảnh giới.
      mp.props.push({ sprite: 'sign', x: cx + 3, y: 2, label: 'Lên ' + nxt.name + ' — Cần ' + nxt.reqRealm.name });
    }
  });
  var MAPS = { map1: MAP, map2: MAP2, map3: MAP3, map4: MAP4, map5: MAP5, map6: MAP6, map7: MAP7, map8: MAP8, map9: MAP9, map10: MAP10, map11: MAP11, map12: MAP12, map13: MAP13, map14: MAP14 };
  // ---- MỞ RỘNG MAP V10 (lệnh Bui 12:33 + bổ sung 12:37 ngày 2026-10-30) ----
  // Mỗi map thế giới chính +24 cột/+16 hàng (56x40 -> 80x56, 64x44 -> 88x60,
  // 72x48 -> 96x64; diện tích +78..100%). Toàn bộ nội dung cũ (tile, NPC,
  // cổng + điểm rơi, spawn, sào boss, dược, biển, khu quái) dịch (+12,+8)
  // để giữ nguyên căn chỉnh tương đối; ảnh nền assets/map*-bg-v7.png được
  // nới cùng offset (ô cũ dán ở (+384,+256)px, vành mới lấp bằng mảng địa
  // hình lấy mẫu từ chính nền map đó — xem tools/expand-bg-v10.py).
  // Đất mới KHÔNG lấp trống: rải CỤM SINH CẢNH quái theo loài (sói rìa
  // rừng, lợn gần nước/trảng trống, rắn cạnh bụi/đá, khỉ cạnh rừng, gà/thỏ
  // đất trống) — tổng spawn mới giữ mật độ/100 ô ở 85% mật độ cũ: map rộng
  // ra để THƯA và thoáng hơn, không nhồi thêm quái. Chỉ số/tỉ lệ rơi của
  // quái không đổi. Khối này chạy TRƯỚC 2 hậu xử lý (luật quái đất + đường
  // vào bãi quái) ở dưới để chúng áp trên bố cục mới. Instance (bí cảnh,
  // động phủ, đấu trường) KHÔNG qua khối này.
  var EXP_DX = 12, EXP_DY = 8, EXP_DW = 24, EXP_DH = 16;
  var EXP_LAYOUT_V = 2; // phiên bản bố cục — game.js dịch save cũ 1 lần theo cờ này
  // Vùng cây danh lam KHÔNG bị luật quái đất dọn (khai ở đây vì khối mở
  // rộng chạy trước; clearMonsterHabitats ở dưới dùng chung biến này):
  // Cây Cổ Thụ Linh Khí map 4 — spawn vành không được có hộp lang thang
  // ±4 chạm vùng này (kiểm QD trong test-smoke tính cả cây giữ lại).
  var KEEP_TREES = { map4: [[50, 27, 52, 28]] }; // tọa độ MỚI: (38,19)-(40,20) cũ + (12,8)
  // Vành đất mới: [xác suất ký tự A, ký tự A, xác suất ký tự B, ký tự B]
  // theo mật độ rải trang trí gốc của từng map.
  var EXP_RING = {
    map1: [0.10, 'T', 0.035, 'o'], map2: [0.34, 'T', 0.05, 'o'],
    map3: [0.30, 'T', 0.06, 'o'], map4: [0.10, 'T', 0.03, 'o'],
    map5: [0.22, 'T', 0.03, 'o'], map6: [0.16, 'T', 0.03, 'o'],
    map7: [0.08, 'o', 0.03, 'T'], map8: [0.10, 'T', 0.025, 'o'],
    map9: [0.12, 'T', 0.025, 'o'], map10: [0.08, 'T', 0.025, 'o'],
    map11: [0.10, 'T', 0.025, 'o'], map12: [0.09, 'o', 0.0, 'T'],
    map13: [0.12, 'o', 0.0, 'T'], map14: [0.06, 'T', 0.025, 'o']
  };
  var EXP_WORLD_IDS = ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7', 'map8', 'map9', 'map10', 'map11', 'map12', 'map13', 'map14'];
  function expShiftPt(p) { if (p) { p.x += EXP_DX; p.y += EXP_DY; } }
  function expShiftRect(r) { r[0] += EXP_DX; r[1] += EXP_DY; r[2] += EXP_DX; r[3] += EXP_DY; }
  function expExpandTiles(map) {
    var ow = map.w, oh = map.h, nw = ow + EXP_DW, nh = oh + EXP_DH;
    var th = EXP_RING[map.id] || [0.10, 'T', 0.03, 'o'];
    var salt = (map.id.length * 131 + ow * 7 + oh) | 0;
    var rows = [], y, x;
    for (y = 0; y < nh; y++) {
      var row = [];
      for (x = 0; x < nw; x++) {
        if (x >= EXP_DX && x < EXP_DX + ow && y >= EXP_DY && y < EXP_DY + oh) { row.push(map.tiles[y - EXP_DY][x - EXP_DX]); continue; }
        var r1 = hash01(x + salt, y + salt * 3);
        row.push(r1 < th[0] ? th[1] : (r1 < th[0] + th[2] ? th[3] : '.'));
      }
      rows.push(row);
    }
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < nw && cy < nh && !map.blocked[rows[cy][cx]]; }
    function bfsReached() {
      var seen = {}, q = [], xx, yy;
      for (yy = 0; yy < oh; yy++) for (xx = 0; xx < ow; xx++) {
        var nx = xx + EXP_DX, ny = yy + EXP_DY, k = nx + ',' + ny;
        if (walkAt(nx, ny) && !seen[k]) { seen[k] = 1; q.push([nx, ny]); }
      }
      while (q.length) {
        var c = q.pop();
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var ax = c[0] + d[0], ay = c[1] + d[1], k2 = ax + ',' + ay;
          if (!seen[k2] && walkAt(ax, ay)) { seen[k2] = 1; q.push([ax, ay]); }
        });
      }
      return seen;
    }
    // Đất mới phải thông với vùng cũ: túi đất đi được nào bị cô lập (rải
    // cây/đá/vách cũ bịt) thì khoét tuyến rẻ nhất (chỉ đổi T/o/W -> '.')
    // bằng dvDijkstra (khai báo ở khối đường vào phía dưới, đã hoist).
    var reached = bfsReached();
    for (y = 0; y < nh; y++) for (x = 0; x < nw; x++) {
      if (!walkAt(x, y) || reached[x + ',' + y]) continue;
      var srcs = [];
      Object.keys(reached).forEach(function (k) { var p = k.split(','); srcs.push([+p[0], +p[1]]); });
      var tx0 = x, ty0 = y;
      var path = dvDijkstra(nw, nh, srcs, function (cx, cy) {
        var ch = rows[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (ch === 'T') return 7; if (ch === 'o') return 11; if (ch === 'W') return 25;
        return Infinity;
      }, function (cx, cy) { return cx === tx0 && cy === ty0; });
      if (path) path.forEach(function (c) { if (map.blocked[rows[c[1]][c[0]]]) rows[c[1]][c[0]] = '.'; });
      reached = bfsReached();
    }
    map.tiles = rows.map(function (r) { return r.join(''); });
    map.w = nw; map.h = nh;
  }
  function expShiftMap(map) {
    expExpandTiles(map);
    expShiftPt(map.start); expShiftPt(map.well); expShiftPt(map.bossSpawn); expShiftPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += EXP_DY;
    (map.portals || []).forEach(function (p) { p.x += EXP_DX; p.y += EXP_DY; p.tx += EXP_DX; p.ty += EXP_DY; });
    (map.npcs || []).forEach(expShiftPt);
    (map.monsters || []).forEach(expShiftPt);
    (map.herbs || []).forEach(expShiftPt);
    (map.props || []).forEach(expShiftPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(expShiftRect); });
    (map.bossLairs || []).forEach(function (l) { expShiftPt(l); if (l.rect) expShiftRect(l.rect); });
  }
  function expEntriesOf(mapId) {
    var out = [], seen = {};
    function add(x, y) { var k = x + ',' + y; if (!seen[k]) { seen[k] = 1; out.push({ x: x, y: y }); } }
    var mp = MAPS[mapId];
    if (mp.start) add(mp.start.x, mp.start.y);
    EXP_WORLD_IDS.concat(Object.keys(MAPS)).forEach(function (id) {
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === mapId) add(p.tx, p.ty); });
    });
    return out;
  }
  // Rải cụm sinh cảnh + dược vào vành đất mới. Luật cứng khi đặt (khớp
  // audit-layout L1-L4, L7b): spawn cách cổng/điểm rơi/NPC/start/giếng/sào
  // >= 5 ô Chebyshev (an toàn cả luật hộp lang thang ±4), cách spawn khác
  // >= 2, tâm cụm cách nhau >= 12 Manhattan, thành viên chỉ đứng trên đất
  // vành (không lấn vùng cũ) và thuộc đúng zone chứa loài đó (rect zone
  // được nới đúng bằng hộp thành viên của cụm).
  function expScatterClusters(map, oldCount, oldArea, entries) {
    var nw = map.w, nh = map.h;
    var targetTotal = Math.floor(oldCount * (nw * nh / oldArea) * 0.85);
    var toAdd = targetTotal - oldCount;
    var rows = map.tiles;
    function walkAt(cx, cy) { return cx >= 1 && cy >= 1 && cx < nw - 1 && cy < nh - 1 && !map.blocked[rows[cy][cx]]; }
    function inRing(cx, cy) { return cx < EXP_DX || cx >= EXP_DX + (nw - EXP_DW) || cy < EXP_DY || cy >= EXP_DY + (nh - EXP_DH); }
    function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
    var safe = [];
    (map.portals || []).forEach(function (p) { safe.push([p.x, p.y]); });
    (map.npcs || []).forEach(function (n) { safe.push([n.x, n.y]); });
    entries.forEach(function (e) { safe.push([e.x, e.y]); });
    if (map.well) safe.push([map.well.x, map.well.y]);
    if (map.gate) safe.push([map.gate.x, map.gate.y]);
    if (map.bossSpawn) safe.push([map.bossSpawn.x, map.bossSpawn.y]);
    (map.bossLairs || []).forEach(function (l) { safe.push([l.x, l.y]); });
    var land = []; // điểm hạ cánh/start/exit — luật L3 khắt khe nhất
    entries.forEach(function (e) { land.push([e.x, e.y]); });
    if (map.exit) land.push([map.exit.x, map.exit.y]);
    function farSafe(x, y, d) { for (var i = 0; i < safe.length; i++) if (cheb(x, y, safe[i][0], safe[i][1]) < d) return false; return true; }
    function farLand(x, y) { for (var i = 0; i < land.length; i++) { if (Math.abs(x - land[i][0]) <= 4 && Math.abs(y - land[i][1]) <= 4) return false; } return true; }
    function farSpawn(x, y, d) { for (var i = 0; i < map.monsters.length; i++) if (cheb(x, y, map.monsters[i].x, map.monsters[i].y) < d) return false; return true; }
    function habitatScore(type, x, y) {
      var aT = 0, aR = 0, aO = 0, aC = 0, open = 0;
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
        var ch = rows[y + d[1]][x + d[0]];
        if (ch === 'T') aT++; else if (ch === 'R') aR++; else if (ch === 'o') aO++; else if (ch === 'C') aC++;
        if (!map.blocked[ch]) open++;
      });
      if (type === 'ga_rung' || type === 'tho_hoang') return aC * 2 + (open === 4 ? 2 : open);
      if (type === 'ran_luc') return (aT + aO) * 2 + aR;
      if (type === 'lon_rung' || type === 'lon_mong_sat') return aR * 2 + (open === 4 ? 1 : 0);
      if (type === 'khi_mat_do') return aT * 2 + aO;
      return aT * 2 + open; // soi_rung / soi_con: rìa rừng
    }
    var types = [];
    (map.monsters || []).forEach(function (m) { if (m.type !== 'son_quan' && types.indexOf(m.type) < 0) types.push(m.type); });
    function zoneFor(type) {
      for (var i = 0; i < (map.zones || []).length; i++) if (map.zones[i].types.indexOf(type) >= 0) return map.zones[i];
      return null;
    }
    // Luật bãi liên mạch (kiểm DV trong test-smoke): mọi spawn của một
    // zone phải cùng một thành phần đất đi được — cụm vành chỉ được mọc
    // SÁT bãi nhà (tâm cách rect zone <= 8 ô Chebyshev; vùng kiểm DV nới
    // rect +3 / spawn +5 / giãn +2 nên 8 ô vẫn nối liền mạch) để bãi
    // nới rộng tự nhiên vào đất mới, không thành ốc đảo tách rời.
    function nearZone(x, y, zone) {
      for (var i = 0; i < zone.rects.length; i++) {
        var r = zone.rects[i];
        var dx = Math.max(r[0] - x, 0, x - r[2]), dy = Math.max(r[1] - y, 0, y - r[3]);
        if (Math.max(dx, dy) <= 8) return true;
      }
      return false;
    }
    // Bản sao đúng phép kiểm DV của test-smoke (dvRegion + dvComp):
    // vùng = rect zone +3, mọi spawn +5, ô đường/quảng trường/cổng
    // trong hộp bao rect +3, tất cả giãn +2; spawn cũ + cụm ứng viên
    // phải cùng một thành phần đi được trong vùng đó.
    function zoneLinked(zone, candMembers) {
      var spawns = map.monsters.filter(function (m) { return m.zone === zone.id; });
      if (!spawns.length) return true;
      function dvW(x, y) { return x >= 0 && y >= 0 && x < nw && y < nh && !map.blocked[rows[y][x]]; }
      var set = {};
      function put(x, y) { if (x >= 0 && y >= 0 && x < nw && y < nh) set[x + ',' + y] = 1; }
      var bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
      zone.rects.forEach(function (r) {
        bx0 = Math.min(bx0, r[0]); by0 = Math.min(by0, r[1]); bx1 = Math.max(bx1, r[2]); by1 = Math.max(by1, r[3]);
        for (var y = r[1] - 3; y <= r[3] + 3; y++) for (var x = r[0] - 3; x <= r[2] + 3; x++) put(x, y);
      });
      spawns.forEach(function (t) { for (var y = t.y - 5; y <= t.y + 5; y++) for (var x = t.x - 5; x <= t.x + 5; x++) put(x, y); });
      candMembers.forEach(function (t) { for (var y = t[1] - 5; y <= t[1] + 5; y++) for (var x = t[0] - 5; x <= t[0] + 5; x++) put(x, y); });
      for (var y2 = by0 - 3; y2 <= by1 + 3; y2++) for (var x2 = bx0 - 3; x2 <= bx1 + 3; x2++) {
        if (x2 < 0 || y2 < 0 || x2 >= nw || y2 >= nh) continue;
        var ch = rows[y2][x2];
        if (ch === '#' || ch === 'Q' || ch === 'G') put(x2, y2);
      }
      var region = {};
      Object.keys(set).forEach(function (k) {
        var p = k.split(','), px = +p[0], py = +p[1];
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
          var nx = px + dx, ny = py + dy;
          if (nx >= 0 && ny >= 0 && nx < nw && ny < nh) region[nx + ',' + ny] = 1;
        }
      });
      var seen = {}, q = [[spawns[0].x, spawns[0].y]];
      if (!region[spawns[0].x + ',' + spawns[0].y] || !dvW(spawns[0].x, spawns[0].y)) return false;
      seen[spawns[0].x + ',' + spawns[0].y] = 1;
      while (q.length) {
        var c = q.pop();
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && region[k] && dvW(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      for (var i = 0; i < spawns.length; i++) if (!seen[spawns[i].x + ',' + spawns[i].y]) return false;
      for (var j = 0; j < candMembers.length; j++) if (!seen[candMembers[j][0] + ',' + candMembers[j][1]]) return false;
      return true;
    }
    var rejectedCenters = {};
    // Giữ TỈ LỆ LOÀI của map: cụm vành của mỗi loài không vượt quá tỉ
    // lệ loài đó trong bầy gốc (làm tròn lên, tối thiểu 2) — nếu không,
    // loài yếu dễ đặt (đất trống/rìa rừng) sẽ lấn át và kéo atk trung
    // bình của map tụt dưới chặng trước (luật tiến trình L7).
    var oldByType = {}, addedByType = {};
    (map.monsters || []).forEach(function (m) { oldByType[m.type] = (oldByType[m.type] || 0) + 1; });
    function capOf(type) { return Math.max(2, Math.ceil(toAdd * (oldByType[type] || 0) / Math.max(1, oldCount))); }
    var centers = [], added = 0, ci = 0, skipRun = 0;
    while (added < toAdd && types.length) {
      var type = types[ci % types.length]; ci++;
      if ((addedByType[type] || 0) >= capOf(type)) { if (++skipRun > types.length * 2) break; continue; }
      var zone = zoneFor(type); if (!zone) continue;
      var best = null, bestScore = -1;
      for (var y = 1; y < nh - 1; y++) for (var x = 1; x < nw - 1; x++) {
        if (!inRing(x, y) || rows[y][x] !== '.' || !walkAt(x, y)) continue;
        if (rejectedCenters[x + ',' + y]) continue;
        if (!nearZone(x, y, zone)) continue;
        if (!farSafe(x, y, 5) || !farLand(x, y) || !farSpawn(x, y, 3)) continue;
        if (Math.min(Math.abs(x - EXP_DX), Math.abs(x - (EXP_DX + nw - EXP_DW - 1)), Math.abs(y - EXP_DY), Math.abs(y - (EXP_DY + nh - EXP_DH - 1))) < 3 && (x >= EXP_DX && x < EXP_DX + nw - EXP_DW && y >= EXP_DY && y < EXP_DY + nh - EXP_DH)) continue; // tâm không sát biên vùng cũ (giữ hộp cụm trong vành)
        var okC = true;
        for (var c2 = 0; c2 < centers.length; c2++) if (Math.abs(x - centers[c2][0]) + Math.abs(y - centers[c2][1]) < 12) { okC = false; break; }
        if (!okC) continue;
        var sc = habitatScore(type, x, y) * 1000 - (x * 7 + y * 13) % 97;
        if (sc > bestScore) { bestScore = sc; best = [x, y]; }
      }
      if (!best) break;
      centers.push(best);
      var want = Math.min(3 + (centers.length % 3 === 0 ? 2 : centers.length % 2), toAdd - added); // cụm 3-5 con
      want = Math.min(want, capOf(type) - (addedByType[type] || 0)); // không vượt hạn tỉ lệ loài dù cụm to
      var members = [];
      var cand = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [-2, 0], [0, 2], [0, -2], [2, 1], [1, 2], [-2, -1], [-1, -2], [2, -1], [-1, 2], [1, -2], [-2, 1], [2, 2], [-2, 2], [2, -2], [-2, -2]];
      for (var k = 0; k < cand.length && members.length < want; k++) {
        var mx = best[0] + cand[k][0], my = best[1] + cand[k][1];
        if (mx < 1 || my < 1 || mx >= nw - 1 || my >= nh - 1) continue;
        if (!inRing(mx, my) || rows[my][mx] !== '.' || !walkAt(mx, my)) continue;
        if (!farSafe(mx, my, 3) || !farLand(mx, my) || !farSpawn(mx, my, 2)) continue;
        // Hộp lang thang ±4 của spawn vành không được chạm vùng cây giữ
        // lại (KEEP_TREES) — luật quái đất không dọn cây ở đó nên hộp sẽ
        // còn cây chắn, phạm kiểm QD.
        var keepHit = false;
        ((typeof KEEP_TREES !== 'undefined' && KEEP_TREES[map.id]) || []).forEach(function (r) {
          if (mx + 4 >= r[0] && mx - 4 <= r[2] && my + 4 >= r[1] && my - 4 <= r[3]) keepHit = true;
        });
        if (keepHit) continue;
        if (map.monsters.some(function (mm) { return mm.x === mx && mm.y === my; })) continue;
        // Thành viên cùng cụm chưa push vào map.monsters (chốt sau kiểm
        // DV) — phải tự giữ khoảng cách >= 2 với nhau (luật L4).
        if (members.some(function (mm) { return cheb(mx, my, mm[0], mm[1]) < 2; })) continue;
        members.push([mx, my]);
      }
      // Kiểm DV thật trước khi chốt cụm: mọi spawn của zone (cũ + cụm
      // mới) phải cùng thành phần đi được trong vùng kiểm (rect +3,
      // spawn +5, giãn +2, tính cả ô đường/quảng trường/cổng trong hộp
      // bao rect) — cụm nào nối không liền thì bỏ, không đẩy số.
      if (members.length && !zoneLinked(zone, members)) { rejectedCenters[best[0] + ',' + best[1]] = 1; members = []; }
      if (members.length) {
        skipRun = 0;
        addedByType[type] = (addedByType[type] || 0) + members.length;
        members.forEach(function (mm) { map.monsters.push({ type: type, x: mm[0], y: mm[1], zone: zone.id }); added++; });
        var rx0 = 1e9, ry0 = 1e9, rx1 = -1, ry1 = -1;
        members.forEach(function (mm) { rx0 = Math.min(rx0, mm[0]); ry0 = Math.min(ry0, mm[1]); rx1 = Math.max(rx1, mm[0]); ry1 = Math.max(ry1, mm[1]); });
        zone.rects.push([rx0, ry0, rx1, ry1]);
      }
    }
    // Dược vành mới: 2-5 điểm theo lượng spawn thêm, dùng dược sẵn có của map.
    var herbItems = [];
    (map.herbs || []).forEach(function (h) { herbItems.push(h.item); });
    if (herbItems.length) {
      var herbWant = Math.min(5, 2 + Math.floor(toAdd / 6)), herbAdded = 0;
      var hItem = herbItems[0];
      for (var hy = 1; hy < nh - 1 && herbAdded < herbWant; hy++) for (var hx = 1; hx < nw - 1 && herbAdded < herbWant; hx++) {
        if (!inRing(hx, hy) || rows[hy][hx] !== '.' || !walkAt(hx, hy)) continue;
        if (!farSafe(hx, hy, 3)) continue;
        if (hash01(hx * 3 + 17, hy * 5 + (map.id.length * 29)) > 0.055) continue;
        if ((map.herbs || []).some(function (h) { return cheb(hx, hy, h.x, h.y) < 4; })) continue;
        map.herbs.push({ x: hx, y: hy, item: hItem }); herbAdded++;
      }
    }
  }
  var EXP_STATS = {};
  EXP_WORLD_IDS.forEach(function (id) {
    var mp = MAPS[id]; if (!mp) return;
    EXP_STATS[id] = { count: (mp.monsters || []).length, area: mp.w * mp.h };
    expShiftMap(mp);
  });
  EXP_WORLD_IDS.forEach(function (id) {
    var mp = MAPS[id]; if (!mp) return;
    expScatterClusters(mp, EXP_STATS[id].count, EXP_STATS[id].area, expEntriesOf(id));
  });
  // ---- Luật quái đất (Bui 21:18 2026-10-29): cây 'T' CHẶN ĐI BỘ nên quái
  // đi dưới đất không thể sống ở khu có cây chắn. Vùng sống của mỗi con quái
  // đất = hộp ±4 ô quanh điểm spawn (đúng biên lang thang trong game.js:
  // đích lang thang bị kẹp |gx-sx|<=4, |gy-sy|<=4), cộng bossSpawn và các
  // sào bossLairs (boss thế giới cũng là quái đất, đi tuần quanh sào).
  // Hậu xử lý dữ liệu: trong các hộp đó, ô 'T' đổi thành đất đi được '.'
  // trên LƯỚI LOGIC; tranh nền vẫn còn cây ở những ô đó — va chạm theo lưới
  // logic là chuẩn đã chấp nhận của dự án (đi dưới tán cây).
  // Ngoại lệ duy nhất: Cây Cổ Thụ Linh Khí map 4 (50..52, 27..28) là cây
  // danh lam có biển tên riêng — thân cây phải chặn như giếng cổ 'E'.
  // (KEEP_TREES khai ở khối EXPAND V10 phía trên — khối đó chạy trước.)
  function clearMonsterHabitats(map) {
    var centers = [];
    (map.monsters || []).forEach(function (m) { centers.push([m.x, m.y]); });
    if (map.bossSpawn) centers.push([map.bossSpawn.x, map.bossSpawn.y]);
    (map.bossLairs || []).forEach(function (l) { centers.push([l.x, l.y]); });
    if (!centers.length) return;
    var keep = KEEP_TREES[map.id] || [];
    function kept(x, y) {
      for (var i = 0; i < keep.length; i++) {
        var r = keep[i];
        if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
      }
      return false;
    }
    var rows = map.tiles.map(function (r) { return r.split(''); });
    centers.forEach(function (c) {
      for (var y = c[1] - 4; y <= c[1] + 4; y++) {
        if (y < 0 || y >= map.h) continue;
        for (var x = c[0] - 4; x <= c[0] + 4; x++) {
          if (x < 0 || x >= map.w) continue;
          if (rows[y][x] === 'T' && !kept(x, y)) rows[y][x] = '.';
        }
      }
    });
    map.tiles = rows.map(function (r) { return r.join(''); });
  }
  Object.keys(MAPS).forEach(function (id) { clearMonsterHabitats(MAPS[id]); });

  // ---- Luật ĐƯỜNG VÀO + BÃI TRỐNG khu quái (Bui 21:47 2026-10-29) ----
  // Mỗi khu quái phải có: (1) bãi trống LIỀN MẠCH quanh cụm spawn đủ rộng
  // để đứng đánh nhau (tối thiểu 24 ô và >= 6 ô/spawn, tính trong vùng
  // khu: rect khu nới 3 + hộp +-5 quanh spawn + mạng đường mòn, nới thêm 2);
  // (2) đường vào rộng >= 2 ô LIÊN TỤC từ điểm rơi của map (điểm bắt đầu +
  // mọi điểm rơi cổng đến) tới bãi của TỪNG spawn — kiểm bằng lưới neo 2x2:
  // khối 2x2 nào cả 4 ô đều đi được thì là "neo"; còn tuyến neo liên tục
  // từ điểm vào tới ô lang thang của spawn thì hành lang rộng >= 2 ô thật
  // (khe len 1 ô giữa cây/vật chắn không tạo được neo nên không tính).
  // Hậu xử lý này chỉ KHOÉT tối thiểu cây 'T'/đá 'o' dọc tuyến rẻ nhất
  // (ưu tiên bám đường mòn '#'), không đụng cổng/điểm rơi/NPC/giếng/sào
  // boss/điểm dược và giữ nguyên thân Cây Cổ Thụ Linh Khí (KEEP_TREES).
  var DV_STATS = { carved: 0, byMap: {} };
  function dvKeepHit(map, x, y) {
    var keep = KEEP_TREES[map.id] || [];
    for (var i = 0; i < keep.length; i++) { var r = keep[i]; if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true; }
    return false;
  }
  function dvCarvable(map, rows, x, y) {
    if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
    var ch = rows[y][x];
    return (ch === 'T' || ch === 'o') && !dvKeepHit(map, x, y);
  }
  function dvCarveCost(ch) { return ch === 'T' ? 7 : 11; }
  // Dijkstra trên lưới ô với heap nhị phân; deterministic (phá hòa theo y,x).
  function dvDijkstra(w, h, sources, enterCost, isTarget) {
    var dist = {}, prev = {}, done = {}, heap = [];
    function less(a, b) { return a[0] < b[0] || (a[0] === b[0] && (a[2] < b[2] || (a[2] === b[2] && a[1] < b[1]))); }
    function push(d, x, y) { heap.push([d, x, y]); var i = heap.length - 1; while (i > 0) { var p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; var t = heap[i]; heap[i] = heap[p]; heap[p] = t; i = p; } }
    function pop() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var i = 0; for (;;) { var l = i * 2 + 1, r = l + 1, m = i; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; var t = heap[i]; heap[i] = heap[m]; heap[m] = t; i = m; } } return top; }
    sources.forEach(function (s) { var k = s[0] + ',' + s[1]; if (dist[k] === undefined) { dist[k] = 0; push(0, s[0], s[1]); } });
    var dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    while (heap.length) {
      var cur = pop(), d = cur[0], x = cur[1], y = cur[2], k = x + ',' + y;
      if (done[k] || d !== dist[k]) continue;
      done[k] = 1;
      if (isTarget(x, y)) {
        var path = [[x, y]], kk = k;
        while (prev[kk]) { var pp = prev[kk].split(','); path.push([+pp[0], +pp[1]]); kk = prev[kk]; }
        return path.reverse();
      }
      for (var i = 0; i < 4; i++) {
        var nx = x + dirs[i][0], ny = y + dirs[i][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        var c = enterCost(nx, ny); if (!isFinite(c)) continue;
        var nk = nx + ',' + ny, nd = d + c;
        if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = k; push(nd, nx, ny); }
      }
    }
    return null;
  }
  function ensureZoneAccess(map) {
    var zones = map.zones || [];
    if (!zones.length) return;
    var blocked = map.blocked;
    var rows = map.tiles.map(function (r) { return r.split(''); });
    var carved0 = DV_STATS.carved;
    function walk(x, y) { return x >= 0 && y >= 0 && x < map.w && y < map.h && !blocked[rows[y][x]]; }
    function carve(x, y) { if (rows[y][x] !== '.') { rows[y][x] = '.'; DV_STATS.carved++; } }
    function targetsOf(z) {
      var ts = (map.monsters || []).filter(function (m) { return m.zone === z.id; }).map(function (m) { return { x: m.x, y: m.y }; });
      if (!ts.length && map.bossSpawn && z.rects.some(function (r) { return map.bossSpawn.x >= r[0] && map.bossSpawn.y >= r[1] && map.bossSpawn.x <= r[2] && map.bossSpawn.y <= r[3]; }))
        ts = [{ x: map.bossSpawn.x, y: map.bossSpawn.y }];
      return ts;
    }
    function regionOf(z, ts) {
      var set = {}, bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
      function put(x, y) { if (x >= 0 && y >= 0 && x < map.w && y < map.h) set[x + ',' + y] = 1; }
      z.rects.forEach(function (r) {
        bx0 = Math.min(bx0, r[0]); by0 = Math.min(by0, r[1]); bx1 = Math.max(bx1, r[2]); by1 = Math.max(by1, r[3]);
        for (var y = r[1] - 3; y <= r[3] + 3; y++) for (var x = r[0] - 3; x <= r[2] + 3; x++) put(x, y);
      });
      ts.forEach(function (t) { for (var y = t.y - 5; y <= t.y + 5; y++) for (var x = t.x - 5; x <= t.x + 5; x++) put(x, y); });
      for (var y2 = by0 - 3; y2 <= by1 + 3; y2++) for (var x2 = bx0 - 3; x2 <= bx1 + 3; x2++) {
        if (x2 < 0 || y2 < 0 || x2 >= map.w || y2 >= map.h) continue;
        var ch = rows[y2][x2];
        if (ch === '#' || ch === 'Q' || ch === 'G') put(x2, y2);
      }
      var out = {};
      Object.keys(set).forEach(function (k) {
        var p = k.split(','), px = +p[0], py = +p[1];
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) put2(px + dx, py + dy);
      });
      function put2(x, y) { if (x >= 0 && y >= 0 && x < map.w && y < map.h) out[x + ',' + y] = 1; }
      return out;
    }
    function labelRegion(region) {
      // Gán nhãn thành phần liên thông đất đi được trong vùng: 1 lượt BFS
      // cho cả vùng thay vì BFS riêng từng spawn (nhanh hơn nhiều lần).
      var labels = {}, sizes = {}, nLab = 0;
      Object.keys(region).forEach(function (k0) {
        if (labels[k0] !== undefined) return;
        var p0 = k0.split(','), sx = +p0[0], sy = +p0[1];
        if (!walk(sx, sy)) { labels[k0] = -1; return; }
        nLab++; var lab = nLab, cnt = 0, q = [[sx, sy]];
        labels[k0] = lab;
        while (q.length) {
          var c = q.pop(); cnt++;
          [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
            var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
            if (labels[k] === undefined && region[k] && walk(nx, ny)) { labels[k] = lab; q.push([nx, ny]); }
          });
        }
        sizes[lab] = cnt;
      });
      return { labels: labels, sizes: sizes };
    }
    function patchOf(t) {
      var seen = {}, q = [[t.x, t.y]];
      seen[t.x + ',' + t.y] = 1;
      while (q.length) {
        var c = q.pop();
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && Math.abs(nx - t.x) <= 4 && Math.abs(ny - t.y) <= 4 && walk(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    // (1) Bãi cụm liền mạch + đủ rộng: nối các mẩu tách rời bằng tuyến
    // khoét rẻ nhất trong vùng khu (mở rộng tìm toàn map nếu vùng bí).
    zones.forEach(function (z) {
      var ts = targetsOf(z); if (!ts.length) return;
      var need = Math.max(24, ts.length * 6);
      for (var round = 0; round < 8; round++) {
        var region = regionOf(z, ts);
        var lr = labelRegion(region), labels = lr.labels;
        var mainLab = 0, mainSize = -1;
        ts.forEach(function (t) { var lb = labels[t.x + ',' + t.y] || 0; if (lb > 0 && (lr.sizes[lb] || 0) > mainSize) { mainLab = lb; mainSize = lr.sizes[lb]; } });
        var detached = ts.filter(function (t) { return labels[t.x + ',' + t.y] !== mainLab; });
        if (!detached.length && mainSize >= need) break;
        if (detached.length) {
          var tgt = detached[0], tgtLab = labels[tgt.x + ',' + tgt.y], tgtPart = {}, srcCells = [];
          Object.keys(labels).forEach(function (k) {
            if (labels[k] === tgtLab) tgtPart[k] = 1;
            else if (labels[k] === mainLab) { var p = k.split(','); srcCells.push([+p[0], +p[1]]); }
          });
          function cellCost(regionOnly) {
            return function (x, y) {
              if (regionOnly && !region[x + ',' + y]) return Infinity;
              var ch = rows[y][x];
              if (!blocked[ch]) return ch === '#' ? 0.2 : 1;
              if (dvCarvable(map, rows, x, y)) return dvCarveCost(ch);
              return Infinity;
            };
          }
          var path = dvDijkstra(map.w, map.h, srcCells, cellCost(true), function (x, y) { return !!tgtPart[x + ',' + y]; });
          if (!path) path = dvDijkstra(map.w, map.h, srcCells, cellCost(false), function (x, y) { return !!tgtPart[x + ',' + y]; });
          if (!path) break;
          path.forEach(function (c) { if (!walk(c[0], c[1])) carve(c[0], c[1]); });
        } else {
          // Liền mạch nhưng chật: gặm dần ô khoét được kề bãi trong vùng.
          var grew = false;
          var frontier = {};
          Object.keys(labels).forEach(function (k) {
            if (labels[k] !== mainLab) return;
            var p = k.split(','), x = +p[0], y = +p[1];
            [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
              var nx = x + d[0], ny = y + d[1];
              if (region[nx + ',' + ny] && dvCarvable(map, rows, nx, ny)) frontier[nx + ',' + ny] = 1;
            });
          });
          var fl = Object.keys(frontier).map(function (k) { var p = k.split(','); return [+p[0], +p[1]]; });
          fl.sort(function (a, b) {
            function dmin(c) { var m = 1e9; ts.forEach(function (t) { m = Math.min(m, Math.abs(c[0] - t.x) + Math.abs(c[1] - t.y)); }); return m; }
            return dmin(a) - dmin(b) || a[1] - b[1] || a[0] - b[0];
          });
          for (var gi = 0; gi < fl.length && mainSize < need; gi++) { carve(fl[gi][0], fl[gi][1]); mainSize++; grew = true; }
          if (!grew) break;
        }
      }
    });
    // (2) Đường vào >= 2 ô: tuyến neo 2x2 từ từng điểm vào tới bãi của
    // từng spawn; thiếu thì khoét các khối neo dọc tuyến neo rẻ nhất.
    var entries = [], seenE = {};
    function addEntry(x, y) { var k = x + ',' + y; if (!seenE[k]) { seenE[k] = 1; entries.push({ x: x, y: y }); } }
    if (map.start) addEntry(map.start.x, map.start.y);
    Object.keys(MAPS).forEach(function (id) {
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === map.id) addEntry(p.tx, p.ty); });
    });
    function blockCost(bx, by) {
      var cost = 0;
      var cells = [[bx, by], [bx + 1, by], [bx, by + 1], [bx + 1, by + 1]];
      for (var i = 0; i < 4; i++) {
        var ch = rows[cells[i][1]][cells[i][0]];
        if (!blocked[ch]) continue;
        if (!dvCarvable(map, rows, cells[i][0], cells[i][1])) return Infinity;
        cost += dvCarveCost(ch);
      }
      return cost;
    }
    function nearBlocks(e) {
      var out = [];
      for (var by = Math.max(0, e.y - 2); by <= Math.min(map.h - 2, e.y + 1); by++)
        for (var bx = Math.max(0, e.x - 2); bx <= Math.min(map.w - 2, e.x + 1); bx++) {
          var cells = [[bx, by], [bx + 1, by], [bx, by + 1], [bx + 1, by + 1]], near = false;
          cells.forEach(function (c) { if (Math.max(Math.abs(c[0] - e.x), Math.abs(c[1] - e.y)) <= 1) near = true; });
          if (near) out.push([bx, by]);
        }
      return out;
    }
    // Lưới chi phí khối neo tính 1 lần/map (tính lại mỗi khi có khoét):
    // mỗi điểm vào chỉ cần 1 lượt BFS phủ trên lưới này, mọi spawn có bãi
    // chạm vùng neo đã phủ đều đạt — tránh kiểm lặp từng cặp vào x spawn.
    var blockGrid = null;
    function buildBlocks() {
      blockGrid = [];
      for (var by = 0; by < map.h - 1; by++) { var rowB = []; for (var bx = 0; bx < map.w - 1; bx++) rowB.push(blockCost(bx, by)); blockGrid.push(rowB); }
    }
    function reachedFrom(e) {
      var grid = [], seen = {}, q = [];
      for (var gy = 0; gy < map.h - 1; gy++) { var grow = []; for (var gx = 0; gx < map.w - 1; gx++) grow.push(0); grid.push(grow); }
      nearBlocks(e).forEach(function (b) { var k = b[0] + ',' + b[1]; if (blockGrid[b[1]][b[0]] === 0 && !seen[k]) { seen[k] = 1; grid[b[1]][b[0]] = 1; q.push(b); } });
      while (q.length) {
        var b = q.pop();
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var nx = b[0] + d[0], ny = b[1] + d[1], k = nx + ',' + ny;
          if (nx < 0 || ny < 0 || nx > map.w - 2 || ny > map.h - 2 || seen[k]) return;
          if (blockGrid[ny][nx] === 0) { seen[k] = 1; grid[ny][nx] = 1; q.push([nx, ny]); }
        });
      }
      return grid;
    }
    function patchCovered(patch, grid) {
      // Ô bãi (x,y) được phủ khi 1 trong 4 khối neo chứa nó đã được phủ.
      var ks = Object.keys(patch);
      for (var i = 0; i < ks.length; i++) {
        var p = ks[i].split(','), x = +p[0], y = +p[1];
        for (var dy = -1; dy <= 0; dy++) for (var dx = -1; dx <= 0; dx++) {
          var bx = x + dx, by = y + dy;
          if (bx >= 0 && by >= 0 && bx < map.w - 1 && by < map.h - 1 && grid[by][bx]) return true;
        }
      }
      return false;
    }
    buildBlocks();
    var reachByEntry = entries.map(function (e) { return reachedFrom(e); });
    zones.forEach(function (z) {
      var ts = targetsOf(z); if (!ts.length) return;
      ts.forEach(function (t) {
        var patch = patchOf(t);
        entries.forEach(function (e, ei) {
          if (patchCovered(patch, reachByEntry[ei])) return;
          var starts = nearBlocks(e).filter(function (b) { return isFinite(blockGrid[b[1]][b[0]]); });
          if (!starts.length) return;
          var bpath = dvDijkstra(map.w - 1, map.h - 1, starts,
            function (bx, by) { var c = blockGrid[by][bx]; return isFinite(c) ? 1 + c : Infinity; },
            function (bx, by) {
              return !!patch[bx + ',' + by] || !!patch[(bx + 1) + ',' + by] || !!patch[bx + ',' + (by + 1)] || !!patch[(bx + 1) + ',' + (by + 1)];
            });
          if (!bpath) return;
          bpath.forEach(function (b) {
            [[b[0], b[1]], [b[0] + 1, b[1]], [b[0], b[1] + 1], [b[0] + 1, b[1] + 1]].forEach(function (c) {
              if (!walk(c[0], c[1]) && dvCarvable(map, rows, c[0], c[1])) carve(c[0], c[1]);
            });
          });
          buildBlocks();
          reachByEntry = entries.map(function (ee) { return reachedFrom(ee); });
          patch = patchOf(t);
        });
      });
    });
    map.tiles = rows.map(function (r) { return r.join(''); });
    DV_STATS.byMap[map.id] = DV_STATS.carved - carved0;
  }
  Object.keys(MAPS).forEach(function (id) { ensureZoneAccess(MAPS[id]); });
  function isBlockedIn(map, x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
    return !!map.blocked[map.tiles[y][x]];
  }
  function isBlocked(x, y) { return isBlockedIn(MAP, x, y); }
  function tileAt(x, y) { return MAP.tiles[y][x]; }
  function getMap(id) { return MAPS[id] || MAP; }
  function zoneAt(map, x, y) {
    var zs = map.zones || [], i, j;
    for (i = 0; i < zs.length; i++) {
      for (j = 0; j < zs[i].rects.length; j++) {
        var r = zs[i].rects[j];
        if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return zs[i];
      }
    }
    return null;
  }
  var api = { MAP: MAP, MAP2: MAP2, MAP3: MAP3, MAP4: MAP4, MAP5: MAP5, MAP6: MAP6, MAP7: MAP7, MAP8: MAP8, MAP9: MAP9, MAP10: MAP10, MAP11: MAP11, MAP12: MAP12, MAP13: MAP13, MAP14: MAP14, MAPS: MAPS, HIGH_CHAIN: HIGH_CHAIN, REALMS: REALMS, realmById: realmById, realmRankOf: realmRankOf, realmGate: realmGate, getMap: getMap, isBlocked: isBlocked, isBlockedIn: isBlockedIn, tileAt: tileAt, zoneAt: zoneAt, EXP_LAYOUT_V: EXP_LAYOUT_V, EXP_DX: EXP_DX, EXP_DY: EXP_DY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_MAPS = api;
})();
