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
      // Dời 21:52 30/10 (phần 4B): hoc_tro (23,8)->(25,8) — trước đây
      // đứng cách dai_phu chỉ ~1,4 ô (45px, TRONG bán kính tương tác
      // 72px) gây bắt nhầm thoại; ô mới cách dai_phu ~3,2 ô (101px),
      // vẫn ngay cửa hiệu thuốc như vai trò học trò của hiệu.
      { id: 'hoc_tro', x: 25, y: 8 },
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
      // Dời 21:52 30/10 (phần 4B): le_su (21,11)->(27,11) — trước đây
      // cách chap_su_thu_trieu ~2,24 ô (71,6px, sát dưới bán kính
      // tương tác 72px); ô (21,10) thử trước phạm luật ô đường '#'
      // (audit V10-L8) nên chốt ô đất '.' đầu đông khu chợ: cách
      // NPC gần nhất (tieu_thuong) 3 ô = 96px, các NPC còn lại
      // >= 115px, vẫn ở khu chợ lo lễ hội như vai trò.
      { id: 'le_su', x: 27, y: 11, sprite: 'chu_quan', name: 'Dì Tư', role: 'Người lo lễ hội làng Thanh Khê' }
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
      { sprite: 'sign', x: 23, y: 0, label: 'Làng Thanh Khê' },
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
      // Dời 22:14 30/10 (phần 7): tong_khi (25,12)->(24,11) — trước
      // đây cùng hàng cách chap_su_dai_hoi đúng 3 ô (96px) trong khi
      // biển tên rộng ~100-130px nên hai biển chồng/cắt chữ; ô mới
      // lệch hàng + cách ~4,1 ô (132px), hai hàng đại diện tông ở
      // quảng trường thành so le, vẫn trên sàn quảng trường 'Q'.
      { id: 'tong_khi', x: 24, y: 11, sect: 'thien_cong' },
      { id: 'tong_dan', x: 16, y: 15, sect: 'dan_ha' },
      { id: 'tong_thu', x: 23, y: 15, sect: 'van_thu' },
      { id: 'tong_phu', x: 12, y: 15, sect: 'thien_phu' },
      { id: 'tong_tran', x: 27, y: 15, sect: 'cuu_cung' },
      { id: 'tong_the', x: 17, y: 9, sect: 'kim_cang' },
      { id: 'tong_doc', x: 22, y: 9, sect: 'ngu_doc' },
      { id: 'tong_am', x: 20, y: 17, sect: 'huyen_am' },
      // Chấp Sự Đại Hội (js/tournament.js): ghi danh + bảng xếp hạng Đại
      // Hội Tu Tiên — đứng ở đầu đông quảng trường; tong_khi đã lùi
      // lệch hàng (24,11) nên cặp này cách ~4,1 ô, biển tên không chồng.
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
      realm: cfg.realm, // mục 28: giữ lại realm để cân bằng chặng cao đọc rank của map (trước đây highMap đánh rơi trường này, chỉ giữ reqRealm)
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
  var EXP_LAYOUT_V = 5; // phiên bản bố cục — game.js dịch save cũ 1 lần theo cờ này (V3: chỉ map 1 nới tiếp, xem EXP_V3_MAP1; V4: chỉ map 2 nới tiếp, xem EXP_V4_MAP2; V5: map 3-14 nới gấp 10 theo neo riêng EXP_V5_MAP3..MAP14, gom trong EXP_V5_ANCHORS)
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
  // ---- TRANG TRÍ VÀNH MAP 1 (lệnh Bui 21:46 ngày 2026-10-30: "Phần mở
  // rộng map Thanh Khê thêm vật, đất, đường đi cho hợp lý") ----
  // Vành V10 của map 1 vốn chỉ là rải ngẫu nhiên T/o trên '.' (nền lấp
  // mảng lấy mẫu nên vỡ ô như khảm, không đường, không ruộng, không vật
  // có chủ đích). Riêng map 1 được thiết kế lại toàn bộ vành như một
  // phần thật của làng: lưới đường đất rộng 2 ô (đường vòng sau làng +
  // 2 trục dọc + đường nam, nhánh vào làng ở 6 điểm khớp cặp ô đi được
  // ở mép lõi), ruộng nối tiếp ruộng lõi (đông bắc/đông nam/nam/tây +
  // mương), lùm cây cụm ở góc và mép xa, đá, hàng rào viền ruộng, đèn
  // đá ở nút giao, vật trang trí không chặn (bụi/chum/bao/biển) qua
  // props. CHỈ sửa ô vành — lõi cũ (x 12..67, y 8..47) giữ nguyên từng
  // ô. Chạy SAU expShiftMap, TRƯỚC expScatterClusters nên quái/dược
  // vành rải trên đúng địa hình cuối; các bãi quái vành hình thành sau
  // đó vẫn nằm trên đất '.' (đường/ruộng không nhận spawn), và 2 hậu xử
  // lý (quái đất + đường vào) áp như thường. Các vùng giữ trống quanh
  // vị trí bãi vành tương lai (ước theo rect zone nới): đông (68..73,
  // 21..25) + (68..73, 35..40), tây (7..11, 31..35), nam (34..42,
  // 48..51) không đặt vật chặn/ruộng/đường cắt ngang.
  function expDressRing1(map) {
    var Wd = map.w, Hd = map.h, ow = Wd - EXP_DW, oh = Hd - EXP_DH;
    var rows = map.tiles.map(function (r) { return r.split(''); });
    function inCore(x, y) { return x >= EXP_DX && x < EXP_DX + ow && y >= EXP_DY && y < EXP_DY + oh; }
    function setR(x, y, ch) { if (x >= 0 && y >= 0 && x < Wd && y < Hd && !inCore(x, y)) rows[y][x] = ch; }
    function rectR(x0, y0, x1, y1, ch, onlyDot) {
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        if (x < 0 || y < 0 || x >= Wd || y >= Hd || inCore(x, y)) continue;
        if (onlyDot && rows[y][x] !== '.') continue;
        rows[y][x] = ch;
      }
    }
    var x, y;
    // 1) Đưa vành về đất trống rồi mới thiết kế (bỏ rải ngẫu nhiên cũ).
    for (y = 0; y < Hd; y++) for (x = 0; x < Wd; x++) if (!inCore(x, y)) rows[y][x] = '.';
    // 2) Đường đất rộng 2 ô: vòng ngoài + nhánh vào làng.
    rectR(2, 3, 77, 4, '#');            // đường sau làng (bắc)
    rectR(4, 3, 5, 52, '#');            // trục tây
    rectR(74, 3, 75, 52, '#');          // trục đông
    rectR(4, 53, 75, 54, '#');          // đường nam
    rectR(6, 18, 11, 19, '#');          // nhánh tây chính (nối đường ngang trấn ở mép lõi)
    rectR(6, 26, 11, 27, '#');          // nhánh tây nam (vào Bãi Gà Thỏ)
    rectR(68, 19, 73, 20, '#');         // nhánh đông (vào Xóm Đông)
    rectR(68, 44, 73, 45, '#');         // nhánh đông nam
    rectR(26, 5, 27, 7, '#');           // ngõ bắc tây (xuống mép lõi gần Cổng Bắc)
    rectR(52, 5, 53, 7, '#');           // ngõ bắc đông
    rectR(31, 48, 32, 53, '#');         // nhánh nam tây (lên Ruộng Nam/bãi nam)
    rectR(58, 48, 59, 53, '#');         // nhánh nam đông
    // 3) Ruộng nối chất làng (chỉ lấp ô '.'): đông bắc + mương, đông
    // nam, nam (đường nam chạy xuyên qua như đường bờ ruộng), tây, bắc.
    rectR(68, 9, 72, 15, 'C', true);
    rectR(76, 9, 78, 15, 'C', true);
    rectR(69, 12, 71, 12, 'R', true);   // mương tưới trong ruộng đông bắc
    rectR(68, 42, 72, 46, 'C', true);
    rectR(76, 34, 78, 41, 'C', true);
    rectR(14, 49, 24, 52, 'C', true);
    rectR(56, 49, 66, 52, 'C', true);
    rectR(7, 10, 10, 14, 'C', true);    // ruộng tây
    rectR(60, 1, 66, 2, 'C', true);     // ruộng sau làng
    // 4) Lùm cây cụm (băm tất định trong cụm, chỉ trên '.') + cây lẻ ven đường.
    function grove(x0, y0, x1, y1, dens, salt) {
      for (var gy = y0; gy <= y1; gy++) for (var gx = x0; gx <= x1; gx++) {
        if (gx < 0 || gy < 0 || gx >= Wd || gy >= Hd || inCore(gx, gy)) continue;
        if (rows[gy][gx] !== '.') continue;
        if (hash01(gx + salt, gy + salt * 3) < dens) rows[gy][gx] = 'T';
      }
    }
    grove(0, 0, 3, 9, 0.55, 31);        // góc tây bắc
    grove(13, 0, 24, 2, 0.50, 47);      // dải cây mép bắc
    grove(35, 0, 50, 2, 0.50, 53);
    grove(56, 5, 66, 7, 0.45, 59);      // lùm trên ruộng đông bắc
    grove(0, 30, 3, 47, 0.55, 61);      // dải tây nam
    grove(0, 48, 3, 55, 0.50, 67);      // góc tây nam
    grove(76, 20, 79, 32, 0.50, 71);    // dải mép đông
    grove(76, 47, 79, 55, 0.50, 73);    // góc đông nam
    grove(44, 55, 66, 55, 0.45, 79);    // hàng cây mép nam
    grove(2, 48, 10, 50, 0.40, 83);     // lùm thưa tây nam trong
    [[6, 8], [72, 7], [7, 40], [46, 50], [13, 6]].forEach(function (p) { if (rows[p[1]][p[0]] === '.') setR(p[0], p[1], 'T'); });
    // 5) Đá cụm nhỏ + hàng rào viền ruộng + đèn đá ở nút giao (chỉ trên '.').
    [[1, 20], [2, 21], [77, 17], [78, 18], [20, 55], [63, 48], [12, 1], [36, 6], [37, 6]
    ].forEach(function (p) { if (rows[p[1]][p[0]] === '.') setR(p[0], p[1], 'o'); });
    rectR(68, 16, 72, 16, 'F', true);   // rào nam ruộng đông bắc
    rectR(15, 48, 23, 48, 'F', true);   // rào bắc ruộng nam tây (chừa lối ở x19 sau khi lấp: mở lại dưới)
    setR(19, 48, '.');
    rectR(57, 48, 66, 48, 'F', true);   // rào bắc ruộng nam đông (đường nhánh x58..59 đã là '#')
    setR(62, 48, '.');
    rectR(7, 17, 9, 17, 'F', true);     // rào hông nhánh tây chính
    [[6, 17], [73, 21], [30, 49], [54, 5], [3, 52]].forEach(function (p) { if (rows[p[1]][p[0]] === '.') setR(p[0], p[1], 'L'); });
    // 5b) Dọn túi đất cô lập trong lùm cây: ô '.' vành nào không tới
    // được từ điểm bắt đầu (BFS toàn lưới) thì lấp thành cây — không để
    // ô trống bị vây kín giữa tán cây (kiểm tools/check-ring1-paths.js).
    (function () {
      var seen = {}, qq = [[map.start.x, map.start.y]];
      seen[map.start.x + ',' + map.start.y] = 1;
      while (qq.length) {
        var c = qq.pop();
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (nx < 0 || ny < 0 || nx >= Wd || ny >= Hd || seen[k]) return;
          if (map.blocked[rows[ny][nx]]) return;
          seen[k] = 1; qq.push([nx, ny]);
        });
      }
      for (var yy = 0; yy < Hd; yy++) for (var xx = 0; xx < Wd; xx++) {
        if (!inCore(xx, yy) && rows[yy][xx] === '.' && !seen[xx + ',' + yy]) rows[yy][xx] = 'T';
      }
    })();
    map.tiles = rows.map(function (r) { return r.join(''); });
    // 6) Vật trang trí KHÔNG chặn (props, tọa độ mới — props lõi đã dịch
    // xong trong expShiftMap): bụi ven đường/ruộng, chum cạnh ruộng,
    // lán củi bên ruộng tây, xe ở góc ruộng đông nam, biển lối đi.
    [[13, 5], [34, 6], [57, 6], [44, 2], [2, 24], [3, 38], [77, 26], [76, 44], [25, 49], [48, 49], [10, 55]
    ].forEach(function (p) { map.props.push({ sprite: 'bush', x: p[0], y: p[1] }); });
    map.props.push({ sprite: 'jar', x: 69, y: 17 });
    map.props.push({ sprite: 'jar', x: 70, y: 17 });
    map.props.push({ sprite: 'sacks', x: 77, y: 16 });
    map.props.push({ sprite: 'woodshed', x: 9, y: 9 });
    map.props.push({ sprite: 'cart', x: 71, y: 47 });
    map.props.push({ sprite: 'sign', x: 11, y: 20, label: 'Lối Tây' });
    map.props.push({ sprite: 'sign', x: 68, y: 17, label: 'Ruộng Đông' });
    map.props.push({ sprite: 'sign', x: 33, y: 49, label: 'Lối Nam' });
  }
  // ---------- 5b2) TRANG TRÍ VÀNH map 2 (Rừng Thanh Sơn) + map 3 (Chân ----------
  // Núi Thanh Phong) — cùng chuẩn map 1 (mở rộng lệnh Bui 21:52 30/10).
  // Rừng (map2): đường mòn vòng rừng rộng 2 ô + bãi trống ven hồ/bờ tây/
  // nam cho cụm quái vành + rừng dày 0,58–0,66. Chân núi (map3): dải bắc
  // ngoài cổng là vách đá kín (hàng cổng + vách lõi đã bịt, không ô đi
  // được nào bị cô lập), thềm đá 'Q' hai sườn, bậc đá nối tiếp xuống thềm
  // nam; thông + đá tảng theo đúng chất núi. Dọn túi cô lập như map 1.
  function expDressRingCommon(map) {
    // BFS từ điểm rơi trong map: ô '.' thuộc VÀNH mà không tới được thì
    // hoá 'T' (chặn) — vành không còn túi đất chết; lõi không bị đụng.
    var W = map.w, H = map.h, g = [], x, y;
    for (y = 0; y < H; y++) g.push(map.tiles[y].split(''));
    var seen = {}, q = [[map.start.x, map.start.y]]; seen[map.start.x + ',' + map.start.y] = 1;
    while (q.length) {
      var cur = q.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = cur[0] + d[0], ny = cur[1] + d[1], k = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[k]) return;
        if (BLOCKED[g[ny][nx]]) return;
        seen[k] = 1; q.push([nx, ny]);
      });
    }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var inC = (x >= EXP_DX && x < EXP_DX + 56 && y >= EXP_DY && y < EXP_DY + 40);
      if (!inC && g[y][x] === '.' && !seen[x + ',' + y]) g[y][x] = 'T';
    }
    for (y = 0; y < H; y++) map.tiles[y] = g[y].join('');
  }
  function expDressRing2(map) {
    var W = map.w, H = map.h, g = [], x, y;
    for (y = 0; y < H; y++) g.push(map.tiles[y].split(''));
    function inCore(cx, cy) { return cx >= EXP_DX && cx < EXP_DX + 56 && cy >= EXP_DY && cy < EXP_DY + 40; }
    function set(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < W && cy < H && !inCore(cx, cy)) g[cy][cx] = ch; }
    function rect(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) set(xx, yy, ch); }
    function h2(ax, bx) { return ((ax * 73856093) ^ (bx * 19349663)) >>> 0; }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (!inCore(x, y)) g[y][x] = '.';
    // Đường mòn vòng rừng (rộng 2 ô) + nhánh vào các bãi vành.
    rect(2, 4, 77, 5, '#'); rect(4, 4, 5, 52, '#'); rect(74, 4, 75, 52, '#'); rect(4, 52, 75, 53, '#');
    rect(26, 6, 27, 7, '#'); rect(36, 6, 37, 7, '#');            // nối đường bắc xuống hàng cổng
    rect(6, 30, 11, 31, '#');                                     // nhánh bãi Lợn bờ tây
    rect(68, 12, 73, 13, '#');                                    // nhánh bãi ven hồ đông
    rect(68, 44, 73, 45, '#');                                    // nhánh đông nam
    rect(44, 48, 45, 51, '#');                                    // nhánh sào Sơn Quân phía nam
    // Hồ nhỏ + đầm lầy ven bờ đông (khớp suối/hồ của lõi).
    rect(70, 10, 73, 12, 'R'); rect(68, 20, 73, 25, 'w');
    // Rừng dày vành: băm tất định theo vùng (giữ trống quanh bãi/đường).
    var keep = [[7, 24, 11, 36], [68, 9, 73, 19], [28, 48, 43, 51], [66, 18, 75, 27], [26, 46, 47, 53]];
    function kept(cx, cy) { return keep.some(function (r) { return cx >= r[0] && cx <= r[2] && cy >= r[1] && cy <= r[3]; }); }
    var groves = [
      [2, 1, 26, 16, 0.66], [36, 1, 72, 8, 0.62], [2, 8, 11, 22, 0.60], [62, 26, 77, 42, 0.64],
      [2, 40, 26, 55, 0.60], [48, 40, 77, 55, 0.58], [14, 1, 60, 3, 0.60]
    ];
    groves.forEach(function (gv) {
      for (var yy = gv[1]; yy <= gv[3]; yy++) for (var xx = gv[0]; xx <= gv[2]; xx++) {
        if (inCore(xx, yy) || g[yy][xx] !== '.' || kept(xx, yy)) continue;
        if ((h2(xx, yy) % 1000) / 1000 < gv[4]) g[yy][xx] = 'T';
      }
    });
    [[20, 10], [58, 6], [8, 44], [70, 34], [30, 54], [64, 50], [14, 50], [76, 22], [24, 2], [50, 42]].forEach(function (p) { set(p[0], p[1], 'o'); });
    [[6, 7], [72, 47], [45, 51]].forEach(function (p) { set(p[0], p[1], 'L'); });
    for (y = 0; y < H; y++) map.tiles[y] = g[y].join('');
    expDressRingCommon(map);
    [[9, 26], [20, 8], [70, 16], [52, 49], [8, 38], [76, 40], [33, 6], [63, 30]].forEach(function (p) { map.props.push({ sprite: 'bush', x: p[0], y: p[1] }); });
    map.props.push({ sprite: 'rock', x: 21, y: 10 });
    map.props.push({ sprite: 'rock', x: 59, y: 48 });
    map.props.push({ sprite: 'sign', x: 12, y: 6, label: 'Đường Vòng Rừng' });
    map.props.push({ sprite: 'sign', x: 67, y: 13, label: 'Bãi Ven Hồ' });
    map.props.push({ sprite: 'sign', x: 6, y: 44, label: 'Rừng Sâu' });
  }
  function expDressRing3(map) {
    var W = map.w, H = map.h, g = [], x, y;
    for (y = 0; y < H; y++) g.push(map.tiles[y].split(''));
    function inCore(cx, cy) { return cx >= EXP_DX && cx < EXP_DX + 56 && cy >= EXP_DY && cy < EXP_DY + 40; }
    function set(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < W && cy < H && !inCore(cx, cy)) g[cy][cx] = ch; }
    function rect(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) set(xx, yy, ch); }
    function h2(ax, bx) { return ((ax * 73856093) ^ (bx * 19349663)) >>> 0; }
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (!inCore(x, y)) g[y][x] = '.';
    // Dải bắc ngoài hàng cổng: vách đá kín + thông/đá (chỉ làm cảnh —
    // hàng cổng y8 + vách lõi bịt kín, không ô đi được nào lọt vào).
    rect(0, 0, 79, 5, 'W');
    for (y = 6; y <= 7; y++) for (x = 0; x < 80; x++) {
      var r6 = (h2(x, y) % 100) / 100;
      g[y][x] = r6 < 0.5 ? 'W' : (r6 < 0.85 ? 'T' : 'o');
    }
    // Đường sườn tây/đông + nhánh ngang.
    rect(4, 8, 5, 52, '#'); rect(74, 8, 75, 52, '#');
    rect(6, 28, 11, 29, '#'); rect(68, 44, 73, 45, '#');
    rect(40, 50, 73, 51, '#'); rect(58, 48, 59, 51, '#');
    // Bậc đá nối tiếp đường nam của lõi xuống thềm ngắm cảnh.
    rect(37, 48, 38, 53, '#'); rect(32, 52, 43, 54, 'Q');
    // Thềm đá hai sườn (chất quảng trường lõi) + đèn đá.
    rect(7, 34, 11, 40, 'Q'); rect(68, 26, 73, 31, 'Q');
    [[7, 34], [11, 40], [68, 26], [73, 31], [33, 52], [42, 52], [6, 10], [72, 10]].forEach(function (p) { set(p[0], p[1], 'L'); });
    // Thông + đá tảng sườn núi (giữ trống quanh thềm/bãi nam).
    var keep = [[6, 33, 12, 41], [67, 25, 74, 32], [30, 46, 45, 55], [56, 46, 61, 53]];
    function kept(cx, cy) { return keep.some(function (r) { return cx >= r[0] && cx <= r[2] && cy >= r[1] && cy <= r[3]; }); }
    var groves = [
      [1, 9, 11, 26, 0.50], [62, 8, 79, 24, 0.50], [1, 42, 26, 55, 0.45], [46, 34, 79, 47, 0.45]
    ];
    groves.forEach(function (gv) {
      for (var yy = gv[1]; yy <= gv[3]; yy++) for (var xx = gv[0]; xx <= gv[2]; xx++) {
        if (inCore(xx, yy) || g[yy][xx] !== '.' || kept(xx, yy)) continue;
        var rr = (h2(xx, yy) % 1000) / 1000;
        if (rr < gv[4]) g[yy][xx] = 'T';
        else if (rr > 0.93) g[yy][xx] = 'o';
      }
    });
    [[18, 50], [24, 44], [66, 38], [52, 54], [9, 20], [70, 18]].forEach(function (p) { set(p[0], p[1], 'o'); });
    for (y = 0; y < H; y++) map.tiles[y] = g[y].join('');
    expDressRingCommon(map);
    [[9, 30], [70, 40], [20, 52], [64, 28], [8, 46], [76, 34]].forEach(function (p) { map.props.push({ sprite: 'bush', x: p[0], y: p[1] }); });
    map.props.push({ sprite: 'sign', x: 35, y: 51, label: 'Thềm Nam' });
    map.props.push({ sprite: 'sign', x: 12, y: 29, label: 'Sườn Tây' });
    map.props.push({ sprite: 'sign', x: 67, y: 45, label: 'Sườn Đông' });
  }
  var EXP_STATS = {};
  EXP_WORLD_IDS.forEach(function (id) {
    var mp = MAPS[id]; if (!mp) return;
    EXP_STATS[id] = { count: (mp.monsters || []).length, area: mp.w * mp.h };
    expShiftMap(mp);
    if (id === 'map1') expDressRing1(mp);
    if (id === 'map2') expDressRing2(mp);
    if (id === 'map3') expDressRing3(mp);
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
  // ---- MỞ RỘNG MAP 1 V3 — GẤP 5 DIỆN TÍCH (lệnh Bui 22:12 + chỉnh 22:13
  // ngày 2026-10-30): map 1 từ 80x56 (4480 ô, đã gồm lõi gốc 56x40) lên
  // 112x100 (11200 ô ≈ 5x diện tích map gốc 56x40 = 2240 ô). Toàn bộ
  // khối 80x56 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+12,+30) trong khung
  // mới — lệch tây-nam để phía bắc (vùng cao + Đài Vọng Khê) và phía đông
  // (ruộng bậc thang + Xóm Bến Hồ + rừng đông) mở rộng. Đất mới KHÔNG rải
  // ngẫu nhiên trống: có mạng đường nối liền các cổng, địa hình kể chuyện
  // (bậc đá ở 2 điểm lên dốc trên đường bắc, cầu đá qua suối nam, thềm đá
  // ngắm cảnh), xóm mới có NHÀ THẬT (tile 'H' + thềm cửa 'Q'), NPC dân
  // làng mới (khai ở đây + STORY.NPCS/DIALOGUE trong js/story.js), khu
  // quái theo thang cấp map 1 (càng xa làng càng mạnh: gà/thỏ bờ nam ->
  // sói rừng đông -> sói + lợn vùng cao bắc). EXP_LAYOUT_V nâng lên 3:
  // game.js migrateLayoutV10 dịch save theo EXP_V3_MAP1 cho riêng map 1
  // (save V1->V2 vẫn dùng EXP_DX/EXP_DY cho cả 14 map như cũ).
  var EXP_V3_MAP1 = { dx: 12, dy: 30 };
  (function expandMap1V3() {
    var map = MAPS.map1;
    var OW = map.w, OH = map.h, NW = 112, NH = 100;
    var AX = EXP_V3_MAP1.dx, AY = EXP_V3_MAP1.dy;
    var rows = [], y, x;
    for (y = 0; y < NH; y++) { var r0 = []; for (x = 0; x < NW; x++) r0.push('.'); rows.push(r0); }
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) rows[y + AY][x + AX] = map.tiles[y][x];
    function inBlock(cx, cy) { return cx >= AX && cx < AX + OW && cy >= AY && cy < AY + OH; }
    function S(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < NW && cy < NH && !inBlock(cx, cy)) rows[cy][cx] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      // Cây mọc thành CỤM có nhịp (không rắc muối): mặt nạ cụm theo ô
      // gộp 5x5 + nhiễu mịn trong cụm; đá rải lẻ ngoài cụm.
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || rows[yy][xx] !== '.') continue;
        var grove = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (grove < pT * 1.9 && h1 < 0.62) rows[yy][xx] = 'T';
        else if (h1 > 1 - pO) rows[yy][xx] = 'o';
      }
    }
    // -- Danh sách nội dung mới (dùng cho cả dọn bãi + đẩy dữ liệu) --
    var V3_SPAWNS = [['soi_con', 30, 10], ['soi_con', 52, 12], ['soi_con', 36, 26], ['soi_con', 58, 27], ['soi_con', 26, 20], ['soi_con', 64, 9],
     ['lon_rung', 24, 6], ['lon_rung', 66, 15], ['lon_rung', 33, 13], ['lon_rung', 61, 24],
     ['soi_con', 97, 10], ['soi_con', 105, 18], ['soi_con', 95, 27], ['soi_con', 108, 29], ['soi_con', 102, 6],
     ['soi_con', 95, 90], ['soi_con', 107, 95], ['soi_con', 104, 84],
     ['ga_rung', 20, 93], ['ga_rung', 30, 96], ['ga_rung', 24, 89],
     ['tho_hoang', 34, 91], ['tho_hoang', 17, 97]];
    var V3_HERBS = [[28, 14], [55, 18], [63, 25], [5, 46], [8, 51], [30, 19], [95, 35], [108, 42], [58, 86], [104, 92]];
    var V3_NPCS = [
      { id: 'van_tra', x: 95, y: 63, sprite: 'chu_quan', name: 'Vân Trà', role: 'Chủ quán trà Xóm Bến Hồ' },
      { id: 'thim_sau', x: 102, y: 70, sprite: 'giu_mieu', name: 'Nguyễn Thị Sáu', role: 'Dân Xóm Bến Hồ' },
      { id: 'anh_luc', x: 97, y: 41, sprite: 'tho_san_ha', name: 'Trần Lực', role: 'Nông dân ruộng bậc thang' },
      { id: 'ong_cau', x: 50, y: 86, sprite: 'dai_phu', name: 'Hà Văn Câu', role: 'Người câu cá ở Hồ Thanh Khê' },
      { id: 'be_nam', x: 102, y: 74, sprite: 'hoc_tro', name: 'Bé Nấm', role: 'Trẻ con Xóm Bến Hồ' }
    ];
    // -- Rải rừng/đá nền theo vùng (đường/nước/nhà vẽ đè lên sau) --
    scatter(0, 0, 111, 29, 0.30, 0.04, 501);        // vành bắc: rừng thông vùng cao
    scatter(92, 0, 111, 32, 0.34, 0.03, 502);       // rừng đông bắc
    scatter(0, 30, 11, 85, 0.30, 0.03, 503);        // rừng tây
    scatter(92, 81, 111, 99, 0.30, 0.03, 504);      // rừng đông nam
    scatter(92, 52, 111, 55, 0.08, 0.0, 505);       // cây thưa sau xóm
    scatter(0, 86, 39, 99, 0.05, 0.02, 506);        // đồng cỏ bờ nam (thưa)
    scatter(80, 88, 91, 99, 0.10, 0.02, 507);       // dải cỏ đông hồ
    // Khoảng trống giữ sạch: hành lang đường chính + các công trình.
    R(40, 0, 45, 29, '.'); R(36, 1, 51, 10, '.');   // hành lang + sân Đài Vọng Khê
    R(25, 15, 58, 25, '.');                          // hai thềm đá + lối nối
    R(2, 40, 10, 53, '.');                           // lán tiều phu + bãi tây
    R(92, 33, 111, 50, '.');                         // ruộng bậc thang + đường ruộng
    R(92, 56, 111, 80, '.');                         // Xóm Bến Hồ
    R(41, 86, 44, 99, '.'); R(43, 86, 101, 87, '.'); // đường nam + đường ven hồ
    // -- Nước: Hồ Thanh Khê (nam) + suối tây chảy vào hồ --
    R(53, 89, 77, 96, 'R'); R(52, 90, 52, 95, 'R'); R(78, 90, 78, 95, 'R'); R(54, 88, 76, 88, 'R'); R(54, 97, 76, 97, 'R');
    R(14, 92, 51, 92, 'R');
    // -- Ruộng bậc thang đông: 3 bậc 'C', mép bậc 'Q', mương 'R' phía tây --
    R(94, 33, 110, 37, 'C'); R(94, 38, 110, 38, 'Q');
    R(94, 39, 110, 43, 'C'); R(94, 44, 110, 44, 'Q');
    R(94, 45, 110, 47, 'C');
    R(93, 33, 93, 47, 'R');
    // -- Thềm đá / đài ngắm cảnh / bậc đá trên tuyến bắc --
    R(38, 3, 49, 8, 'Q');                            // Đài Vọng Khê
    R(38, 2, 49, 2, 'F');                            // lan can mép bắc đài
    S(38, 3, 'L'); S(49, 3, 'L');
    R(27, 17, 35, 21, 'Q');                          // thềm đá tây (nghỉ chân)
    R(48, 19, 56, 23, 'Q');                          // thềm đá đông
    // -- Mạng đường (# đất, >= 2 ô, nối liền mọi cổng/khu) --
    R(42, 9, 43, 29, '#');                           // đường vùng cao: đài -> vành bắc làng
    R(42, 12, 43, 15, 'Q'); R(42, 22, 43, 25, 'Q');  // 2 đoạn BẬC ĐÁ ở điểm lên dốc
    R(36, 19, 41, 20, '#');                          // lối vào thềm tây
    R(44, 21, 47, 22, '#');                          // lối vào thềm đông
    R(5, 30, 6, 47, '#');                            // đường mòn rừng tây: bãi bắc -> lán tiều
    R(2, 48, 11, 49, '#');                           // đường tây: lán -> vành tây làng
    R(88, 48, 110, 49, '#'); R(92, 50, 110, 50, '#'); // đường đông chính (3 ô ở đất mới)
    R(100, 36, 101, 47, '#');                        // nhánh ruộng (xuyên giữa 2 thửa)
    R(100, 50, 101, 85, '#');                        // nhánh xóm + xuống bờ hồ
    R(92, 66, 110, 67, '#');                         // phố chính Xóm Bến Hồ
    R(43, 87, 101, 87, '#');                         // đường ven hồ
    R(42, 86, 43, 96, '#');                          // đường nam: vành nam -> bãi chăn thả
    S(42, 92, 'Q'); S(43, 92, 'Q');                  // CẦU ĐÁ qua suối trên đường nam
    // -- Xóm Bến Hồ: nhà thật (H) + thềm cửa (Q) --
    R(94, 60, 97, 61, 'H'); R(94, 62, 97, 62, 'Q');  // Quán Trà Bến Hồ + thềm
    R(103, 60, 106, 61, 'H'); R(103, 62, 106, 62, 'Q'); // Nhà Kho Xóm + thềm
    R(93, 70, 95, 71, 'H'); S(94, 69, 'Q');          // nhà dân 1 + bậc cửa
    R(98, 71, 100, 72, 'H'); S(99, 70, 'Q');         // nhà dân 2 + bậc cửa
    R(105, 70, 107, 71, 'H'); S(106, 69, 'Q');       // nhà dân 3 + bậc cửa
    R(104, 76, 106, 77, 'H'); S(105, 75, 'Q');       // nhà dân 4 + bậc cửa
    R(3, 41, 5, 42, 'H'); S(4, 43, 'Q');             // Lán Tiều Phu (rừng tây) + bậc cửa
    [[92, 63], [92, 64], [92, 65], [108, 63], [108, 64], [108, 65]].forEach(function (p) { S(p[0], p[1], 'F'); }); // rào vườn xóm
    S(93, 65, 'L'); S(109, 65, 'L'); S(99, 57, 'L'); // đèn xóm
    [[14, 86], [15, 86], [16, 86], [17, 86], [18, 86], [19, 86], [20, 86],
     [24, 86], [25, 86], [26, 86], [27, 86], [28, 86], [29, 86], [30, 86]].forEach(function (p) { S(p[0], p[1], 'F'); }); // rào bãi chăn thả (có khoảng hở)
    // -- Dọn bãi 3x3 quanh mọi điểm spawn/dược/NPC mới (chỉ gạt T/o/F,
    // giữ nguyên đường/thềm/ruộng/nước/nhà) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = rows[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') rows[yy][xx] = '.';
      }
    }
    V3_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V3_HERBS.forEach(function (hb) { clearPatch(hb[0], hb[1]); });
    V3_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // -- Khoét thông túi đất cô lập trong đất mới (cùng thuật toán V10):
    // BFS từ toàn bộ khối cũ; ô đi được ở đất mới nào chưa tới được thì
    // khoét tuyến rẻ nhất qua T/o (không đụng nhà/nước/vách). --
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[rows[cy][cx]]; }
    function bfsReached() {
      var seen = {}, q = [], xx, yy;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        if (inBlock(xx, yy) && walkAt(xx, yy)) { var k = xx + ',' + yy; if (!seen[k]) { seen[k] = 1; q.push([xx, yy]); } }
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
    var reached = bfsReached();
    for (y = 0; y < NH; y++) for (x = 0; x < NW; x++) {
      if (inBlock(x, y) || !walkAt(x, y) || reached[x + ',' + y]) continue;
      var srcs = [];
      Object.keys(reached).forEach(function (k) { var p = k.split(','); srcs.push([+p[0], +p[1]]); });
      var tx0 = x, ty0 = y;
      var path = dvDijkstra(NW, NH, srcs, function (cx, cy) {
        var ch = rows[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (ch === 'T') return 7; if (ch === 'o') return 11;
        return Infinity;
      }, function (cx, cy) { return cx === tx0 && cy === ty0; });
      if (path) path.forEach(function (c) { if (map.blocked[rows[c[1]][c[0]]]) rows[c[1]][c[0]] = '.'; });
      reached = bfsReached();
    }
    // -- Dịch toàn bộ nội dung cũ của map 1 theo neo (+12,+30) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start); shPt(map.well); shPt(map.bossSpawn); shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 2/3 KHÔNG đổi hình học
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Cổng của map khác rơi VÀO map 1 phải dịch điểm rơi theo neo mới.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map1') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map1') { p.tx += AX; p.ty += AY; } });
    });
    // -- Nội dung mới (tọa độ khung 112x100) --
    map.zones.push(
      { id: 'vung_cao', name: 'Vùng Cao Thanh Phong', rects: [[20, 2, 70, 16], [18, 17, 72, 28]], types: ['soi_con', 'lon_rung'] },
      { id: 'rung_dong', name: 'Rừng Đông', rects: [[93, 4, 111, 32], [92, 81, 111, 99]], types: ['soi_con'] },
      { id: 'bai_nam', name: 'Bãi Cỏ Bờ Nam', rects: [[13, 87, 40, 99], [80, 88, 91, 99]], types: ['ga_rung', 'tho_hoang'] }
    );
    V3_SPAWNS.forEach(function (s) {
      // Gán khu theo TỌA ĐỘ THẬT: rừng đông là dải x >= 92 (cả khúc bắc
      // y<30 lẫn khúc nam y>=81); vùng cao là vành bắc x<92; còn lại
      // phía nam là bãi cỏ bờ nam. (Bản cũ gán theo y trước nên 5 con
      // sói rừng đông bị gán nhầm vung_cao.)
      var zn = s[1] >= 92 ? 'rung_dong' : (s[2] < 30 ? 'vung_cao' : 'bai_nam');
      map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: zn });
    });
    V3_HERBS.forEach(function (hb) { map.herbs.push({ x: hb[0], y: hb[1], item: 'thao_duoc' }); });
    V3_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 46, y: 5, label: 'Đài Vọng Khê' },
      { sprite: 'sign', x: 45, y: 26, label: 'Lên Đài Vọng Khê — bậc đá phía bắc' },
      { sprite: 'sign', x: 34, y: 18, label: 'Thềm Đá Nghỉ Chân' },
      { sprite: 'sign', x: 89, y: 47, label: 'Đông: Ruộng Bậc Thang · Xóm Bến Hồ' },
      { sprite: 'sign', x: 99, y: 52, label: 'Xóm Bến Hồ' },
      { sprite: 'sign', x: 98, y: 62, label: 'Quán Trà Bến Hồ' },
      { sprite: 'sign', x: 102, y: 62, label: 'Nhà Kho Xóm' },
      { sprite: 'sign', x: 48, y: 86, label: 'Hồ Thanh Khê' },
      { sprite: 'sign', x: 38, y: 95, label: 'Bãi Cỏ Bờ Nam' },
      { sprite: 'sign', x: 4, y: 47, label: 'Rừng Thông Tây' },
      { sprite: 'sign', x: 43, y: 25, label: 'Vùng Cao Thanh Phong' },
      { sprite: 'sign', x: 100, y: 49, label: 'Rừng Đông' }
    );
    // -- Luật QD (Bui 21:18): hộp lang thang ±4 quanh MỌI điểm spawn
    // quái đất (cũ đã dịch + mới) + bossSpawn + sào boss không còn cây
    // 'T' chặn đường — chỉ gạt 'T' -> '.', không đụng loại ô khác. --
    (function qdClear() {
      var centers = [];
      (map.monsters || []).forEach(function (m) { centers.push([m.x, m.y]); });
      if (map.bossSpawn) centers.push([map.bossSpawn.x, map.bossSpawn.y]);
      (map.bossLairs || []).forEach(function (l) { centers.push([l.x, l.y]); });
      centers.forEach(function (c) {
        for (var yy = c[1] - 4; yy <= c[1] + 4; yy++) for (var xx = c[0] - 4; xx <= c[0] + 4; xx++) {
          if (xx < 0 || yy < 0 || xx >= NW || yy >= NH) continue;
          if (rows[yy][xx] === 'T') rows[yy][xx] = '.';
        }
      });
    })();
    // -- Luật DV (đường vào >= 2 ô): mở 2 cây ở cổ chai (104,23)-(104,24)
    // — điểm nghẽn 1 ô duy nhất vào cụm spawn phía bắc Rừng Đông; tập ô
    // tối thiểu tính bằng Dijkstra trên lưới neo 2x2 (lượt dọn xanh
    // 30/10), chỉ gạt 'T' -> '.', không đụng ô khác. --
    [[104, 23], [104, 24]].forEach(function (c) { if (rows[c[1]][c[0]] === 'T') rows[c[1]][c[0]] = '.'; });
    map.tiles = rows.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map1-bg-v8.webp';
  })();

  // ---- MỞ RỘNG MAP 2 V4 — GẤP 10 DIỆN TÍCH (lệnh Bui 22:53 ngày
  // 2026-10-30, theo mục chương trình map 2–14 ghi 22:26): map 2 từ
  // 80x56 ô (4480, đã gồm lõi gốc 56x40 của nó) lên 160x140 ô (22400 ô
  // = đúng 10x diện tích map gốc 2240 ô). Toàn bộ khối 80x56 hiện có
  // GIỮ NGUYÊN TỪNG Ô, neo tại (+36,+16) trong khung mới — khối tựa
  // lên phía bắc (cổng về làng vốn ở mép bắc khối) để rừng mở sâu
  // xuống phía nam (Rừng Sâu + Cây Cổ Thụ) và hai cánh đông/tây.
  // Đất mới: mạng đường mòn >= 2 ô nối liền mọi cổng/khu; địa hình kể
  // chuyện theo tuyến di chuyển (bậc đá ở dốc sườn bắc và các đoạn
  // xuống rừng sâu, cầu đá qua suối tây, thềm ngắm Hồ Đông Nam);
  // công trình hợp rừng: Chòi Gác Rừng + Miếu Sơn Thần Sườn Bắc trên
  // sườn bắc, Lán Thợ Săn + Lán Tiều Phu phía tây, Trạm Dừng Chân
  // giữa đường nam; NPC hợp chỗ khai ở đây + hồ sơ/thoại trong
  // js/story.js (STORY.NPCS + DIALOGUE). Khu quái theo thang map 2,
  // càng xa cổng càng nặng: khỉ sườn bắc/rừng tây -> rắn + lợn thung
  // đông -> sói + lợn rừng sâu nam + rắn ven hồ. Sào Sơn Quân giữ
  // đúng vị trí tương đối trong lõi (dịch theo neo như mọi nội dung).
  // EXP_LAYOUT_V nâng lên 4: game.js migrateLayoutV10 dịch save theo
  // EXP_V4_MAP2 cho RIÊNG map 2; save cũ hơn vẫn chạy đủ các nấc
  // V1->V2 rồi V2->V3 như cũ. Tọa độ map 2 hardcode ngoài maps.js đã
  // dịch cùng neo trong cùng lượt: bosses.js (4 sào + 4 bia boss thế
  // giới), alchemy.js (điểm dược map 2), escort.js (chặng 0 hộ tống),
  // rift-events.js (điểm nứt map 2), secret-realms.js (2 neo spot).
  var EXP_V4_MAP2 = { dx: 36, dy: 16 };
  (function expandMap2V4() {
    var map = MAPS.map2;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V4_MAP2.dx, AY = EXP_V4_MAP2.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải cụm rừng cho đất MỚI (deterministic, cùng thuật toán các vành
    // trước; ô ven cụm luôn phủ đất trước khi rải).
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      function h2(xx, yy) { var n = Math.sin(xx * 127.1 + yy * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); }
      var cx, cy, px, py;
      for (cy = y0 - 3; cy <= y1 + 3; cy += 3) for (cx = x0 - 3; cx <= x1 + 3; cx += 3) {
        if (h2(cx, cy) > 0.45) continue;
        for (py = cy; py < cy + 3; py++) for (px = cx; px < cx + 3; px++) {
          if (px < x0 || px > x1 || py < y0 || py > y1 || inBlock(px, py)) continue;
          var r0 = h2(px, py);
          g[py][px] = r0 < pT ? 'T' : (r0 < pT + pO ? 'o' : '.');
        }
      }
    }
    scatter(0, 0, 159, 15, 0.32, 0.03, 601);      // sườn bắc: rừng thông già
    scatter(0, 16, 35, 139, 0.30, 0.03, 602);     // rừng tây
    scatter(116, 16, 159, 139, 0.28, 0.03, 603);  // thung đông + ven hồ
    scatter(36, 72, 115, 139, 0.32, 0.03, 604);   // rừng sâu phía nam
    // Dọn hành lang quanh các tuyến/công trình sẽ vẽ (chỉ đất mới).
    R(23, 3, 131, 15, '.');      // hành lang sườn bắc: 2 thềm + đường sườn
    R(24, 14, 31, 45, '.');      // hành lang đường xuống phía tây
    R(4, 40, 35, 50, '.');       // đường tây + Lán Thợ Săn
    R(13, 46, 22, 90, '.');      // đường tây nam + Lán Tiều Phu
    R(62, 72, 76, 122, '.');     // đường nam + Trạm Dừng Chân
    R(116, 40, 146, 50, '.');    // đường đông
    R(114, 51, 121, 96, '.');    // dải suối đông
    R(130, 84, 146, 94, '.');    // thềm ngắm hồ + đường ven hồ
    R(118, 92, 150, 116, '.');   // bồn Hồ Đông Nam
    R(13, 114, 146, 123, '.');   // đường vòng phía nam
    R(58, 122, 78, 133, '.');    // thềm Cây Cổ Thụ
    R(26, 104, 42, 117, '.');    // ao nam
    R(16, 17, 22, 23, '.');      // trảng nhỏ tây bắc (điểm neo bạn đồng hành net.js 19,20)
    // NƯỚC: suối tây từ sườn bắc chảy xuống rừng tây; suối đông đổ vào
    // Hồ Đông Nam; ao nhỏ phía nam cạnh đường vòng.
    R(20, 14, 21, 69, 'R');
    R(117, 52, 118, 95, 'R');
    R(119, 90, 121, 98, 'R');
    R(122, 96, 146, 112, 'R'); R(123, 95, 145, 95, 'R'); R(123, 113, 145, 113, 'R');
    R(30, 108, 38, 113, 'R'); R(31, 107, 37, 107, 'R'); R(31, 114, 37, 114, 'R');
    // THỀM ĐÁ + điểm nhấn trên thềm.
    R(23, 4, 32, 10, 'Q');       // thềm Chòi Gác Rừng
    R(121, 4, 130, 10, 'Q');     // thềm Miếu Sơn Thần Sườn Bắc
    R(132, 88, 144, 93, 'Q');    // thềm ngắm Hồ Đông Nam
    R(60, 124, 76, 131, 'Q');    // thềm Cây Cổ Thụ Thanh Sơn
    S(61, 125, 'T'); S(75, 125, 'T'); S(61, 130, 'T'); S(75, 130, 'T'); // cụm cổ thụ quanh thềm
    S(63, 124, 'L'); S(73, 124, 'L');   // đèn đá đầu thềm cổ thụ
    S(24, 9, 'L'); S(31, 9, 'L');       // đèn thềm chòi gác
    S(122, 9, 'L'); S(129, 9, 'L');     // đèn thềm miếu
    // ĐƯỜNG MÒN (mọi tuyến >= 2 ô, nối liền khối cũ và các khu mới).
    R(26, 12, 129, 13, '#');                       // đường sườn bắc
    R(58, 12, 65, 13, 'Q'); R(98, 12, 103, 13, 'Q'); // 2 đoạn bậc đá leo sườn
    R(26, 11, 29, 11, '#');                        // ngõ thềm chòi -> đường sườn
    R(125, 11, 126, 11, '#');                      // ngõ thềm miếu -> đường sườn
    R(27, 14, 28, 43, '#');                        // đường xuống phía tây
    R(27, 22, 28, 27, 'Q');                        // bậc đá đoạn dốc tây
    R(8, 44, 35, 45, '#');                         // đường tây -> mép tây khối cũ
    R(16, 46, 17, 117, '#');                       // đường tây nam: lán tiều -> đường vòng
    R(16, 58, 17, 63, 'Q');                        // bậc đá đoạn dốc tây nam
    R(66, 72, 67, 118, '#');                       // đường nam chính: mép nam khối -> đường vòng
    R(66, 84, 67, 89, 'Q'); R(66, 104, 67, 109, 'Q'); // 2 đoạn bậc đá xuống rừng sâu
    R(116, 44, 138, 45, '#');                      // đường đông -> thềm ngắm hồ
    R(137, 46, 138, 87, '#');                      // đường ven xuống thềm hồ
    R(17, 118, 140, 119, '#');                     // đường vòng phía nam (qua phía nam hồ)
    R(66, 120, 67, 123, '#');                      // nhánh vào thềm Cây Cổ Thụ
    // CẦU ĐÁ qua suối tây tại giao lộ với đường tây.
    S(20, 44, 'Q'); S(21, 44, 'Q'); S(20, 45, 'Q'); S(21, 45, 'Q');
    // CÔNG TRÌNH hợp rừng (mái 'H' chặn, bậc cửa 'Q' đi được).
    R(25, 5, 27, 6, 'H');                          // Chòi Gác Rừng
    R(124, 5, 126, 6, 'H');                        // Miếu Sơn Thần Sườn Bắc
    R(10, 38, 13, 39, 'H'); S(11, 40, 'Q');        // Lán Thợ Săn + bậc cửa
    R(10, 80, 13, 81, 'H'); S(11, 82, 'Q');        // Lán Tiều Phu + bậc cửa
    R(72, 96, 74, 97, 'H'); S(73, 98, 'Q');        // Trạm Dừng Chân + bậc cửa
    R(68, 98, 72, 98, '#');                        // ngõ trạm -> đường nam
    [[8, 41], [9, 41], [14, 41], [15, 41]].forEach(function (p) { S(p[0], p[1], 'F'); }); // rào Lán Thợ Săn
    // Dọn bãi 3x3 quanh spawn/dược/NPC mới (chỉ gạt T/o/F ở đất mới).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    var V4_SPAWNS = [
      ['khi_mat_do', 16, 5, 'suon_bac'], ['khi_mat_do', 34, 7, 'suon_bac'], ['khi_mat_do', 48, 4, 'suon_bac'],
      ['khi_mat_do', 110, 5, 'suon_bac'], ['khi_mat_do', 132, 7, 'suon_bac'], ['khi_mat_do', 148, 4, 'suon_bac'],
      ['khi_mat_do', 8, 56, 'rung_tay'], ['khi_mat_do', 24, 68, 'rung_tay'],
      ['ran_luc', 14, 60, 'rung_tay'], ['ran_luc', 26, 52, 'rung_tay'],
      ['ran_luc', 128, 58, 'thung_dong'], ['ran_luc', 144, 74, 'thung_dong'],
      ['lon_mong_sat', 136, 64, 'thung_dong'], ['lon_mong_sat', 150, 56, 'thung_dong'],
      ['soi_rung', 30, 94, 'rung_sau'], ['soi_rung', 44, 104, 'rung_sau'],
      ['soi_rung', 90, 94, 'rung_sau'], ['soi_rung', 102, 106, 'rung_sau'],
      ['lon_mong_sat', 48, 96, 'rung_sau'], ['lon_mong_sat', 108, 96, 'rung_sau'],
      ['ran_luc', 124, 124, 'ven_ho'], ['ran_luc', 140, 128, 'ven_ho']
    ];
    var V4_HERBS = [[33, 9], [124, 10], [19, 50], [22, 66], [116, 66], [115, 88],
      [64, 112], [70, 122], [128, 121], [10, 54], [44, 98], [98, 108]];
    var V4_NPCS = [
      { id: 'lam_ba', x: 29, y: 8, sprite: 'linh_gac', name: 'Lâm Bá', role: 'Người gác rừng trên sườn bắc' },
      { id: 'ong_tu', x: 128, y: 8, sprite: 'giu_mieu', name: 'Trần Văn Hậu', role: 'Người trông Miếu Sơn Thần Sườn Bắc' },
      { id: 'a_san', x: 12, y: 42, sprite: 'tho_san_ha', name: 'Đỗ Sơn', role: 'Thợ săn ở Lán Thợ Săn' },
      { id: 'ha_cui', x: 15, y: 84, sprite: 'tho_san_ha', name: 'Hà Văn Củi', role: 'Tiều phu rừng tây' }
    ];
    V4_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V4_HERBS.forEach(function (p) { clearPatch(p[0], p[1]); });
    V4_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // Khoét thông mọi túi đất-mới bị cô lập vào khối cũ (chỉ gạt T/o,
    // cùng thuật toán bản V3 của map 1).
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    function bfsT(sx, sy) {
      var seen = {}, q = [[sx, sy]];
      if (!walkT(sx, sy)) return seen;
      seen[sx + ',' + sy] = 1;
      while (q.length) {
        var c = q.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && walkT(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    function dvDijkstra(sx, sy, reach) {
      var dist = {}, prev = {}, pq = [[0, sx, sy]];
      dist[sx + ',' + sy] = 0;
      while (pq.length) {
        var bi = 0;
        for (var i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0]) bi = i;
        var cur = pq.splice(bi, 1)[0], cx2 = cur[1], cy2 = cur[2], ck = cx2 + ',' + cy2;
        if (reach[ck]) {
          var path = [], k2 = ck;
          while (prev[k2]) { var pp = prev[k2]; path.push([pp[0], pp[1]]); k2 = pp[0] + ',' + pp[1]; }
          return path;
        }
        if (dist[ck] !== cur[0]) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cx2 + d[0], ny = cy2 + d[1];
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny)) return;
          var ch = g[ny][nx], w = (ch === 'T' || ch === 'o') ? 1 : (blockedT[ch] ? 1e6 : 0), nk = nx + ',' + ny, nd = cur[0] + w;
          if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = [cx2, cy2]; pq.push([nd, nx, ny]); }
        });
      }
      return null;
    }
    (function carveOrphans() {
      for (var guard = 0; guard < 4000; guard++) {
        var reach = bfsT(AX + 40, AY + 28);
        var orphan = null;
        for (var yy = 0; yy < NH && !orphan; yy++) for (var xx = 0; xx < NW; xx++) {
          if (inBlock(xx, yy) || !walkT(xx, yy) || reach[xx + ',' + yy]) continue;
          orphan = [xx, yy]; break;
        }
        if (!orphan) return;
        var path = dvDijkstra(orphan[0], orphan[1], reach);
        if (!path || !path.length) return;
        path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') g[p[1]][p[0]] = '.'; });
      }
    })();
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 2 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map2') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map2') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'suon_bac', name: 'Sườn Núi Bắc', rects: [[6, 1, 58, 10], [100, 1, 154, 10]], types: ['khi_mat_do'] },
      { id: 'rung_tay', name: 'Rừng Tây', rects: [[2, 50, 30, 74]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'thung_dong', name: 'Thung Lũng Đông', rects: [[122, 52, 154, 84]], types: ['ran_luc', 'lon_mong_sat'] },
      { id: 'rung_sau', name: 'Rừng Sâu Thanh Sơn', rects: [[24, 88, 56, 112], [84, 88, 110, 112]], types: ['soi_rung', 'lon_mong_sat'] },
      { id: 'ven_ho', name: 'Ven Hồ Đông Nam', rects: [[116, 120, 152, 134]], types: ['ran_luc'] }
    );
    V4_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V4_HERBS.forEach(function (p) { map.herbs.push({ x: p[0], y: p[1], item: 'linh_chi' }); });
    V4_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 30, y: 10, label: 'Chòi Gác Rừng' },
      { sprite: 'sign', x: 127, y: 9, label: 'Miếu Sơn Thần Sườn Bắc' },
      { sprite: 'sign', x: 15, y: 40, label: 'Lán Thợ Săn' },
      { sprite: 'sign', x: 15, y: 82, label: 'Lán Tiều Phu' },
      { sprite: 'sign', x: 71, y: 99, label: 'Trạm Dừng Chân' },
      { sprite: 'sign', x: 68, y: 127, label: 'Cây Cổ Thụ Thanh Sơn' },
      { sprite: 'sign', x: 64, y: 74, label: 'Nam: Rừng Sâu Thanh Sơn' },
      { sprite: 'sign', x: 34, y: 46, label: 'Tây: Rừng Tây · Lán Thợ Săn' },
      { sprite: 'sign', x: 118, y: 42, label: 'Đông: Thung Lũng · Hồ Đông Nam' },
      { sprite: 'sign', x: 138, y: 90, label: 'Bãi Vọng Hồ Đông' },
      { sprite: 'sign', x: 20, y: 116, label: 'Đường Vòng Rừng Sâu' },
      { sprite: 'sign', x: 34, y: 8, label: 'Sườn Núi Bắc' },
      { sprite: 'sign', x: 17, y: 56, label: 'Rừng Tây' },
      { sprite: 'sign', x: 140, y: 60, label: 'Thung Lũng Đông' },
      { sprite: 'sign', x: 66, y: 100, label: 'Rừng Sâu Thanh Sơn' },
      { sprite: 'sign', x: 131, y: 119, label: 'Ven Hồ Đông Nam' }
    );
    // Đường mòn nối 2 cụm spawn của khu Rừng Sâu (tây x24-56 / đông
    // x84-110) thành một bãi liền mạch — luật DV: mọi spawn cùng khu
    // phải thông nhau qua đất đi được trong vùng khu.
    R(56, 100, 83, 101, '#');
    // -- Luật QD (Bui 21:18): hộp lang thang ±4 quanh MỌI điểm spawn
    // quái đất (cũ đã dịch + mới) + bossSpawn + sào boss không còn cây
    // 'T' chặn đường — chỉ gạt 'T' -> '.', không đụng loại ô khác. --
    (function qdClear() {
      var centers = [];
      (map.monsters || []).forEach(function (m) { centers.push([m.x, m.y]); });
      if (map.bossSpawn) centers.push([map.bossSpawn.x, map.bossSpawn.y]);
      (map.bossLairs || []).forEach(function (l) { centers.push([l.x, l.y]); });
      centers.forEach(function (c) {
        for (var yy = c[1] - 4; yy <= c[1] + 4; yy++) for (var xx = c[0] - 4; xx <= c[0] + 4; xx++) {
          if (xx < 0 || yy < 0 || xx >= NW || yy >= NH) continue;
          if (g[yy][xx] === 'T') g[yy][xx] = '.';
        }
      });
    })();
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map2-bg-v9.webp';
  })();
  // ---- TRỒNG CÂY PHỦ ĐẤT TRỐNG MAP 2 (lệnh parent 23:52 ngày
  // 2026-10-30): sau mở rộng V4, map 2 còn 16.515/22.400 ô '.' trống
  // không vật thể (73,7%) — vành mới đọc như đồng trơ. Khối này phủ
  // cây xanh theo CỤM có nhịp lên đất trống: rừng sâu phía nam rậm
  // nhất (mật độ ~0,60), vành nam/rừng tây/thung đông/sườn bắc vừa
  // (0,38–0,45), lõi cũ chỉ điểm cụm thưa (0,14) giữ trảng săn; đá
  // 'o' rải lẻ ~3% làm điểm vỡ mảng. GIỮ NGUYÊN mọi tọa độ nội dung:
  // chỉ đổi ô '.' sang 'T'/'o', không dời spawn/NPC/dược/cổng/sào.
  // Vùng bảo vệ không trồng: hộp ±4 quanh MỌI spawn quái + bossSpawn
  // + tâm sào (luật QD test: hộp lang thang không còn cây chắn), ô
  // 3x3 quanh NPC/dược/biển/start/ô cổng + điểm rơi, và trảng neo
  // bạn đồng hành net.js (19,20). Sau khi trồng, mọi túi đất đi được
  // bị cô lập đều xử lý (cụm < 40 ô lấp 'T', cụm lớn khoét 1 tuyến
  // qua T/o) để toàn map còn đúng 1 thành phần đi được — audit L6.
  // LƯU Ý: nền assets/map2-bg-v8.webp vẽ theo dữ liệu TRƯỚC lượt
  // trồng này — cần vẽ lại nền theo dữ liệu mới ở lượt mỹ thuật sau.
  (function plantMap2V5() {
    var map = MAPS.map2;
    var NW = map.w, NH = map.h, x, y;
    var g = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    var prot = {};
    function box(cx, cy, r) {
      for (var yy = cy - r; yy <= cy + r; yy++) for (var xx = cx - r; xx <= cx + r; xx++) {
        if (xx >= 0 && yy >= 0 && xx < NW && yy < NH) prot[xx + ',' + yy] = 1;
      }
    }
    (map.monsters || []).forEach(function (m) { box(m.x, m.y, 4); });
    if (map.bossSpawn) box(map.bossSpawn.x, map.bossSpawn.y, 4);
    (map.bossLairs || []).forEach(function (l) { box(l.x, l.y, 4); });
    (map.npcs || []).forEach(function (n) { box(n.x, n.y, 1); });
    (map.herbs || []).forEach(function (hb) { box(hb.x, hb.y, 1); });
    (map.props || []).forEach(function (p) { box(p.x, p.y, 1); });
    if (map.start) box(map.start.x, map.start.y, 1);
    (map.portals || []).forEach(function (p) { box(p.x, p.y, 1); });
    Object.keys(MAPS).forEach(function (id) {
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map2') box(p.tx, p.ty, 1); });
    });
    for (y = 15; y <= 24; y++) for (x = 14; x <= 24; x++) prot[x + ',' + y] = 1; // trảng neo (19,20)
    function density(cx, cy) {
      var inCore = cx >= 36 && cx < 116 && cy >= 16 && cy < 72;
      if (cy >= 104) return 0.60;
      if (!inCore && cy >= 72) return 0.45;
      if (cx < 36) return 0.42;
      if (cx >= 116) return 0.38;
      if (cy < 16) return 0.38;
      return 0.14;
    }
    for (y = 0; y < NH; y++) for (x = 0; x < NW; x++) {
      if (g[y][x] !== '.' || prot[x + ',' + y]) continue;
      var d = density(x, y);
      var grove = hash01(Math.floor(x / 4) + 911, Math.floor(y / 4) + 517);
      var cell = hash01(x + 331, y + 771);
      if (grove < d * 1.5 && cell < 0.74) g[y][x] = 'T';
      else if (hash01(x * 3 + 55, y * 7 + 99) > 0.966) g[y][x] = 'o';
    }
    // Thông/lấp túi đất đi được cô lập (theo cụm, như bản map 10 V5).
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[g[cy][cx]]; }
    function labelComponents() {
      var comp = {}, comps = [], xx, yy;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        if (!walkAt(xx, yy) || comp[xx + ',' + yy] !== undefined) continue;
        var id = comps.length, cells = [], q = [[xx, yy]];
        comp[xx + ',' + yy] = id;
        while (q.length) {
          var c = q.pop(); cells.push(c);
          [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (dd) {
            var ax = c[0] + dd[0], ay = c[1] + dd[1], k = ax + ',' + ay;
            if (comp[k] === undefined && walkAt(ax, ay)) { comp[k] = id; q.push([ax, ay]); }
          });
        }
        comps.push(cells);
      }
      return { comp: comp, comps: comps };
    }
    var lab = labelComponents();
    function mainCompOf(l2) { return l2.comp[map.start.x + ',' + map.start.y]; }
    var mainComp = mainCompOf(lab);
    lab.comps.slice().forEach(function (cells, ci) {
      if (ci === mainComp || cells.length < 40) return;
      var srcs = lab.comps[mainComp].map(function (c) { return [c[0], c[1]]; });
      var t0 = cells[0];
      var path = dvDijkstra(NW, NH, srcs, function (cx, cy) {
        var ch = g[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (ch === 'T') return 7; if (ch === 'o') return 11;
        return Infinity;
      }, function (cx, cy) { return cx === t0[0] && cy === t0[1]; });
      if (path) path.forEach(function (c) { if (map.blocked[g[c[1]][c[0]]]) g[c[1]][c[0]] = '.'; });
      lab = labelComponents();
      mainComp = mainCompOf(lab);
    });
    lab = labelComponents();
    mainComp = mainCompOf(lab);
    lab.comps.forEach(function (cells, ci) {
      if (ci === mainComp) return;
      cells.forEach(function (c) { g[c[1]][c[0]] = 'T'; });
    });
    map.tiles = g.map(function (r) { return r.join(''); });
  })();

  // ---- MỞ CỔ CHAI DV MAP 2 (lượt dọn xanh 30/10): lượt trồng cây V5
  // làm vài tuyến vào khu quái hẹp còn 1 ô — luật DV (Bui 21:47) đòi
  // đường vào >= 2 ô liên tục từ mọi điểm rơi tới bãi của từng spawn.
  // 33 ô 'T' dưới đây là tập tối thiểu tính bằng Dijkstra trên lưới
  // neo 2x2 từ 2 điểm rơi của map 2 tới các spawn nghẽn (suon_bac
  // (16,5)/(148,4), thung_dong (150,56), rung_sau cả 6 spawn + nối 2
  // cụm trong vùng khu, ven_ho (140,128)); chỉ gạt 'T' -> '.', áp SAU
  // plantMap2V5 để không bị trồng lại. --
  (function dvWidenMap2() {
    var map = MAPS.map2;
    var g = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    [[21, 8], [22, 8], [28, 73], [29, 71], [32, 72], [32, 73], [32, 75], [34, 74], [34, 88],
     [53, 98], [55, 100], [56, 98], [56, 99], [57, 99], [85, 98], [85, 99], [86, 99],
     [97, 110], [98, 111], [99, 111], [99, 117], [105, 101], [128, 129], [129, 127],
     [131, 127], [132, 129], [133, 128], [140, 9], [141, 9], [143, 9], [140, 53],
     [140, 54], [141, 53]].forEach(function (c) {
      if (g[c[1]][c[0]] === 'T') g[c[1]][c[0]] = '.';
    });
    map.tiles = g.map(function (r) { return r.join(''); });
  })();


  // ================= TÍCH HỢP V5 — MAP 3 (gói tmp/map-packages/map3) =================
// =====================================================================
// GÓI MAP 3 — MỞ RỘNG V5 "CHÂN NÚI THANH PHONG" GẤP 10 DIỆN TÍCH
// (xưởng map xuyên đêm, lệnh Bui 23:04 ngày 2026-10-30; theo mục chương
// trình MỞ RỘNG CÁC MAP 2–14 trong docs/auto-build-queue.md ghi 22:26)
//
// CÁCH TÍCH HỢP (đội tích hợp làm, KHÔNG nằm trong file này):
//   1. Dán TOÀN BỘ khối dưới đây vào js/maps.js NGAY SAU khối
//      expandMap2V4 (trước "function isBlockedIn"), cùng phạm vi IIFE
//      của maps.js (khối dùng MAPS, hash01, dvDijkstra của maps.js).
//   2. js/maps.js dòng EXP_LAYOUT_V: đổi 4 -> 5 (và cập nhật chú thích:
//      "V5: chỉ map 3 nới tiếp, xem EXP_V5_MAP3").
//   3. js/maps.js api export: thêm EXP_V5_MAP3: EXP_V5_MAP3.
//   4. js/game.js migrateLayoutV10: thêm nấc V4->V5 cho RIÊNG map 3
//      (mẫu code trong README.md của gói).
//   5. Cài tranh nền của gói vào assets/map3-bg-v8.webp (khối dưới tự
//      trỏ map.bg về đó).
//   6. Thêm hồ sơ + thoại 6 NPC mới vào js/story.js (khối sẵn trong
//      README.md của gói) và dịch các tọa độ cứng map 3 ngoài maps.js
//      theo neo (+40,+42) — danh sách trong README.md.
//
// QUY MÔ: map 3 từ 80x56 ô (4480, đã gồm lõi gốc 56x40 của nó) lên
// 160x140 ô (22400 ô = đúng 10x diện tích map gốc 2240 ô). Toàn bộ khối
// 80x56 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+40,+42) trong khung mới:
// cổng nam (về làng) và cổng bắc (lên Đại Sơn) giữ đúng vị trí tương
// đối trong lõi như tiền lệ V4 của map 2; đất mới ôm quanh lõi — sườn
// bắc leo lên các thềm vọng sơn (vào bằng đường vòng sườn tây và đường
// dịch vụ sườn đông), rừng bia + lán thợ săn phía tây, bãi luyện công
// mở rộng + đài vọng vân phía đông, thềm nam có đình đón khách và nhà
// nghỉ chân. Khu quái theo thang map 3, càng xa cổng càng nặng: khỉ
// sườn/rừng gần -> rắn ven suối -> lợn mông sắt sườn đông -> sói vùng
// cao bắc và sói rừng sâu nam.
// =====================================================================
  var EXP_V5_MAP3 = { dx: 40, dy: 42 };
  (function expandMap3V5() {
    var map = MAPS.map3;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V5_MAP3.dx, AY = EXP_V5_MAP3.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải rừng theo CỤM có nhịp (cùng thuật toán bản V3 của map 1):
    // mặt nạ cụm ô gộp 5x5 + nhiễu mịn trong cụm; đá rải lẻ ngoài cụm.
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || g[yy][xx] !== '.') continue;
        var grove = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (grove < pT * 1.9 && h1 < 0.62) g[yy][xx] = 'T';
        else if (h1 > 1 - pO) g[yy][xx] = 'o';
      }
    }
    // ---- Dọn hành lang quanh mọi tuyến/công trình sẽ vẽ (đất mới) ----
    R(2, 2, 157, 41, '.');        // toàn bộ vành bắc (sườn + thềm + thác)
    R(2, 42, 39, 97, '.');        // vành tây ngang lõi
    R(120, 42, 157, 97, '.');     // vành đông ngang lõi
    R(2, 98, 157, 137, '.');      // toàn bộ vành nam
    // ---- Rải rừng nền theo vùng ----
    scatter(2, 2, 157, 41, 0.30, 0.04, 701);    // sườn bắc: rừng thông già
    scatter(2, 42, 39, 137, 0.32, 0.03, 702);   // rừng tây + rừng bia
    scatter(120, 42, 157, 137, 0.26, 0.03, 703); // sườn đông + ven suối nam
    scatter(40, 98, 119, 137, 0.30, 0.03, 704); // rừng sâu phía nam
    // Dọn lại hành lang hẹp sau rải (rải chạy khắp vùng, tuyến phải sạch):
    R(8, 19, 71, 20, '.');        // đường vòng ngang sườn bắc
    R(10, 21, 11, 59, '.');       // trục dọc sườn tây
    R(38, 26, 53, 31, '.');       // thềm giữa dốc
    R(56, 2, 79, 15, '.');        // thềm vọng sơn + sân vọng cảnh
    R(76, 12, 110, 41, '.');      // đường dịch vụ đông + đầm sơn tuyền
    R(17, 12, 21, 16, '.');       // trảng neo bạn đồng hành net.js (19,14) — net.js giữ tọa độ THÔ, map chừa trảng tại điểm thô (tiền lệ V4 map 2)
    R(2, 54, 39, 62, '.');        // lán thợ săn tây + đường tây
    R(10, 84, 25, 95, '.');       // rừng bia
    R(84, 96, 95, 137, '.');      // trục nam + nhà nghỉ chân (dải hẹp quanh trục)
    R(42, 116, 117, 121, '.');    // dải đường vòng nam
    R(78, 104, 87, 113, '.');     // quanh Đình Đón Khách
    R(122, 62, 157, 73, '.');     // bãi luyện công đông + đường đông
    R(138, 82, 157, 91, '.');     // quanh Đài Vọng Vân Đông
    R(120, 98, 150, 135, '.');    // suối nam + thềm suối
    // ---- NƯỚC: thác + suối sườn đông bắc đổ vào Đầm Sơn Tuyền; suối nam ----
    R(88, 14, 89, 33, 'R');                       // Suối Thác Thanh Phong
    R(84, 34, 91, 40, 'R'); R(85, 33, 90, 33, 'R'); // Đầm Sơn Tuyền (bờ bo)
    R(130, 96, 131, 119, 'R');                    // suối nam sườn đông
    R(128, 120, 135, 120, 'R'); R(126, 121, 137, 126, 'R'); R(128, 127, 135, 127, 'R'); // ao suối nam
    // ---- THỀM ĐÁ + điểm nhấn sườn bắc ----
    R(65, 2, 78, 5, 'Q');                          // Sân Vọng Cảnh (đỉnh vành bắc)
    R(56, 8, 75, 13, 'Q');                         // Đài Vọng Sơn
    R(60, 9, 62, 10, 'H');                         // Chòi canh trên đài (mái chặn)
    S(57, 8, 'L'); S(74, 8, 'L');                  // đèn đá đài vọng sơn
    R(38, 26, 53, 31, 'Q');                        // Thềm Giữa Dốc
    R(42, 27, 44, 28, 'H');                        // Đình Nghỉ Chân (mái chặn)
    S(39, 26, 'L'); S(52, 26, 'L');                // đèn đá thềm giữa dốc
    R(20, 40, 31, 45, 'Q');                        // Thềm Chuyển Dốc (chân sườn tây)
    // ---- ĐƯỜNG (mọi tuyến >= 2 ô, có điểm đến) ----
    R(10, 21, 11, 57, '#');                        // trục sườn tây: đường vòng -> đường tây
    R(10, 19, 69, 20, '#');                        // đường vòng ngang sườn bắc
    R(58, 14, 59, 18, '#');                         // ngõ Đài Vọng Sơn -> đường vòng
    R(70, 6, 73, 7, '#');                          // bậc lên Sân Vọng Cảnh
    R(44, 21, 45, 25, '#');                        // ngõ Thềm Giữa Dốc -> đường vòng
    R(12, 42, 19, 43, '#');                        // ngõ Thềm Chuyển Dốc -> trục tây
    R(76, 12, 104, 13, '#');                       // đường dịch vụ sườn đông
    R(103, 14, 104, 40, '#');                      // dọc đông: đài -> đầm
    R(92, 39, 102, 40, '#');                       // bờ nam đầm -> trục đông nam
    R(105, 40, 121, 40, '#');                      // dải nối ngang vành đông (hàng 40)
    R(120, 41, 121, 69, '#');                      // dọc mép đông lõi: vành bắc -> đường đông
    R(2, 58, 39, 59, '#');                         // ĐƯỜNG TÂY: vành tây -> mép tây lõi (nối hàng 58-59 lõi)
    R(120, 70, 157, 71, '#');                      // ĐƯỜNG ĐÔNG: mép đông lõi -> bãi luyện công đông
    R(88, 98, 91, 137, '#');                       // TRỤC NAM: mép nam lõi -> nhà nghỉ chân
    R(88, 104, 91, 106, 'Q'); R(88, 124, 91, 126, 'Q'); // 2 đoạn BẬC ĐÁ trên trục nam
    R(44, 98, 45, 118, '#');                       // dọc tây nam: mép nam lõi -> đường vòng nam
    R(114, 98, 115, 118, '#');                     // dọc đông nam: mép nam lõi -> đường vòng nam
    R(45, 118, 129, 119, '#');                     // ĐƯỜNG VÒNG NAM
    S(130, 118, 'Q'); S(131, 118, 'Q'); S(130, 119, 'Q'); S(131, 119, 'Q'); // CẦU ĐÁ qua suối nam
    // ---- CÔNG TRÌNH phía tây / đông / nam (mái 'H' chặn, thềm cửa 'Q') ----
    R(14, 52, 17, 53, 'H'); R(14, 54, 17, 56, 'Q');   // Lán Thợ Săn Tây + sân
    R(12, 86, 23, 93, 'Q');                            // Rừng Bia Thanh Phong (thềm đá)
    S(14, 88, 'o'); S(18, 87, 'o'); S(21, 90, 'o');    // bia đá trong rừng bia
    R(124, 64, 139, 69, 'Q');                          // Bãi Luyện Công Đông (thềm đá)
    [[127, 65], [132, 65], [137, 66]].forEach(function (p) { S(p[0], p[1], 'S'); }); // cọc gỗ/giá binh khí
    S(125, 64, 'L'); S(138, 64, 'L');                  // đèn đá bãi luyện công đông
    R(140, 84, 155, 89, 'Q');                          // Đài Vọng Vân Đông
    S(141, 84, 'L'); S(154, 84, 'L');                  // đèn đá đài đông
    R(80, 106, 85, 111, 'Q');                          // Đình Đón Khách (thềm)
    R(81, 107, 82, 108, 'H');                          // mái đình đón khách
    R(94, 126, 97, 128, 'H');                          // Nhà Nghỉ Chân Thanh Phong (mái)
    R(93, 129, 99, 131, 'Q');                          // sân + thềm cửa nhà nghỉ
    S(93, 129, 'L'); S(99, 129, 'L');                  // đèn sân nhà nghỉ
    // ---- Nội dung mới (tọa độ khung 160x140) ----
    var V5_SPAWNS = [
      ['khi_mat_do', 20, 38, 'khi_suon_bac'], ['khi_mat_do', 34, 48, 'khi_suon_bac'], ['khi_mat_do', 24, 50, 'khi_suon_bac'],
      ['ran_luc', 85, 22, 'ran_suoi_bac'], ['ran_luc', 94, 30, 'ran_suoi_bac'], ['ran_luc', 95, 38, 'ran_suoi_bac'],
      ['soi_rung', 126, 10, 'soi_vung_cao'], ['soi_rung', 140, 16, 'soi_vung_cao'], ['soi_rung', 148, 24, 'soi_vung_cao'], ['soi_rung', 132, 26, 'soi_vung_cao'],
      ['khi_mat_do', 10, 72, 'khi_bia_lam'], ['khi_mat_do', 26, 78, 'khi_bia_lam'], ['khi_mat_do', 18, 100, 'khi_bia_lam'],
      ['lon_mong_sat', 128, 80, 'lon_suon_dong'], ['lon_mong_sat', 140, 88, 'lon_suon_dong'], ['lon_mong_sat', 134, 94, 'lon_suon_dong'], ['lon_mong_sat', 148, 78, 'lon_suon_dong'],
      ['ran_luc', 124, 124, 'ran_suoi_nam'], ['ran_luc', 140, 130, 'ran_suoi_nam'],
      ['soi_rung', 54, 110, 'soi_nam_sau'], ['soi_rung', 62, 120, 'soi_nam_sau'], ['soi_rung', 104, 122, 'soi_nam_sau'], ['soi_rung', 110, 129, 'soi_nam_sau'],
      ['khi_mat_do', 104, 106, 'khi_rung_nam'], ['khi_mat_do', 110, 111, 'khi_rung_nam']
    ];
    var V5_HERBS = [[28, 42], [50, 32], [94, 41], [20, 62], [24, 96], [126, 68], [144, 86], [92, 116], [84, 132], [140, 124]];
    var V5_NPCS = [
      { id: 'gac_son_mon', x: 70, y: 12, sprite: 'linh_gac', name: 'Vệ Thanh Sơn', role: 'Lính canh Đài Vọng Sơn của Thanh Phong Phái' },
      { id: 'truong_dinh', x: 47, y: 29, sprite: 'giu_mieu', name: 'Tống Thanh', role: 'Người trông Đình Nghỉ Chân giữa dốc Thanh Phong' },
      { id: 'tho_san_tay', x: 16, y: 57, sprite: 'tho_san_ha', name: 'Đỗ Văn Sơn', role: 'Thợ săn ở Lán Thợ Săn Tây' },
      { id: 'ong_bia', x: 16, y: 91, sprite: 'giu_mieu', name: 'Cố Văn Thạch', role: 'Người trông Rừng Bia Thanh Phong' },
      { id: 'tiep_khach', x: 84, y: 110, sprite: 'hoc_tro', name: 'Lý Văn Trà', role: 'Người trực Đình Đón Khách dưới chân núi Thanh Phong' },
      { id: 'chu_nha_nghi', x: 96, y: 130, sprite: 'chu_quan', name: 'Hà Văn Đón', role: 'Chủ Nhà Nghỉ Chân Thanh Phong' }
    ];
    var V5_SIGNS = [
      { sprite: 'sign', x: 66, y: 12, label: 'Đài Vọng Sơn' },
      { sprite: 'sign', x: 71, y: 4, label: 'Vọng Sơn Đài' },
      { sprite: 'sign', x: 40, y: 30, label: 'Đình Nghỉ Chân' },
      { sprite: 'sign', x: 21, y: 44, label: 'Thềm Chuyển Dốc' },
      { sprite: 'sign', x: 93, y: 41, label: 'Đầm Sơn Tuyền' },
      { sprite: 'sign', x: 36, y: 57, label: 'Tây: Rừng Bia · Lán Thợ Săn' },
      { sprite: 'sign', x: 18, y: 56, label: 'Lán Thợ Săn Tây' },
      { sprite: 'sign', x: 13, y: 87, label: 'Rừng Bia Thanh Phong' },
      { sprite: 'sign', x: 130, y: 68, label: 'Bãi Luyện Công Đông' },
      { sprite: 'sign', x: 147, y: 88, label: 'Đài Vọng Vân Đông' },
      { sprite: 'sign', x: 84, y: 105, label: 'Đình Đón Khách' },
      { sprite: 'sign', x: 92, y: 125, label: 'Nhà Nghỉ Chân Thanh Phong' },
      { sprite: 'sign', x: 60, y: 117, label: 'Nam: Khu Sói Rừng Sâu' },
      { sprite: 'sign', x: 122, y: 69, label: 'Đông: Bãi Luyện Công Đông' },
      { sprite: 'sign', x: 118, y: 20, label: 'Đông Bắc: Khu Sói Vùng Cao' }
    ];
    // Dọn bãi 3x3 quanh spawn/dược/NPC/biển mới (chỉ gạt T/o/F ở đất mới).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (p) { clearPatch(p[0], p[1]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    V5_SIGNS.forEach(function (n) { clearPatch(n.x, n.y); });
    // ---- Vành mép bản đồ: vách đá khép kín — sơn TRƯỚC vòng khoét túi
    // cô lập, vì vành là biên cứng của thế giới: nếu khoét trước, các túi
    // sát mép sẽ "thông" giả qua hành lang mép trống rồi bị vành cắt rời
    // sau khi sơn (lỗi đã gặp ở bản đầu của gói này). ----
    R(0, 0, NW - 1, 1, 'W'); R(0, NH - 2, NW - 1, NH - 1, 'W');
    R(0, 0, 1, NH - 1, 'W'); R(NW - 2, 0, NW - 1, NH - 1, 'W');
    // (R() né khối lõi nên vành chỉ áp lên đất mới; mép lõi vốn đã kín.)
    // Khoét thông mọi túi đất-mới bị cô lập vào lõi (chỉ gạt T/o, cùng
    // THUẬT TOÁN bản V3/V4 — tuyến rẻ nhất qua T/o bằng dvDijkstra của
    // maps.js — nhưng chạy theo THÀNH PHẦN LIÊN THÔNG, mỗi túi 1 lần
    // Dijkstra, thay vì theo từng ô như V3: khung 160x140 có 22400 ô,
    // cách cũ làm thời gian nạp map phình không chấp nhận được).
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[g[cy][cx]]; }
    function components() {
      var comp = new Int32Array(NW * NH), label = 0, stack = [], xx, yy, i;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        var idx = yy * NW + xx;
        if (comp[idx] || !walkAt(xx, yy)) continue;
        label++; comp[idx] = label; stack.push(idx);
        while (stack.length) {
          var cur = stack.pop(), cx = cur % NW, cy = (cur / NW) | 0;
          for (i = 0; i < 4; i++) {
            var nx = cx + [0, 1, 0, -1][i], ny = cy + [-1, 0, 1, 0][i];
            if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) continue;
            var ni = ny * NW + nx;
            if (!comp[ni] && walkAt(nx, ny)) { comp[ni] = label; stack.push(ni); }
          }
        }
      }
      return comp;
    }
    for (var guard = 0; guard < 2000; guard++) {
      var comp = components();
      var mainLabel = comp[(AY + 36) * NW + (AX + 31)]; // ô start của lõi
      if (!mainLabel) break;
      // Tìm túi đầu tiên (quét theo hàng) có ô thuộc đất mới.
      var pocket = null, seenLabels = {};
      for (y = 0; y < NH && !pocket; y++) for (x = 0; x < NW; x++) {
        var li = comp[y * NW + x];
        if (!li || li === mainLabel || seenLabels[li]) continue;
        seenLabels[li] = 1;
        var cells = [], hasNew = false, xx2, yy2;
        for (yy2 = 0; yy2 < NH; yy2++) for (xx2 = 0; xx2 < NW; xx2++) {
          if (comp[yy2 * NW + xx2] === li) { cells.push([xx2, yy2]); if (!inBlock(xx2, yy2)) hasNew = true; }
        }
        if (hasNew) pocket = cells;
      }
      if (!pocket) break;
      var mainComp = comp, path2 = dvDijkstra(NW, NH, pocket, function (cx, cy) {
        var ch = g[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (ch === 'T') return 7; if (ch === 'o') return 11;
        return Infinity;
      }, function (cx, cy) { return mainComp[cy * NW + cx] === mainLabel; });
      if (!path2) break; // không khoét nổi (bị vách/nước khép kín): để audit báo
      path2.forEach(function (c) { if (map.blocked[g[c[1]][c[0]]]) g[c[1]][c[0]] = '.'; });
    }
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 3 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map3') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map3') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'khi_suon_bac', name: 'Khu Khỉ Sườn Bắc', rects: [[14, 34, 44, 54]], types: ['khi_mat_do'] },
      { id: 'ran_suoi_bac', name: 'Rắn Suối Thác', rects: [[80, 18, 100, 41]], types: ['ran_luc'] },
      { id: 'soi_vung_cao', name: 'Khu Sói Vùng Cao', rects: [[122, 6, 152, 28]], types: ['soi_rung'] },
      { id: 'khi_bia_lam', name: 'Khu Khỉ Rừng Bia', rects: [[4, 64, 34, 82], [4, 96, 30, 112]], types: ['khi_mat_do'] },
      { id: 'lon_suon_dong', name: 'Khu Lợn Mông Sắt Sườn Đông', rects: [[122, 74, 152, 96]], types: ['lon_mong_sat'] },
      { id: 'ran_suoi_nam', name: 'Rắn Suối Nam', rects: [[120, 116, 144, 134]], types: ['ran_luc'] },
      { id: 'soi_nam_sau', name: 'Khu Sói Rừng Sâu Nam', rects: [[48, 102, 70, 124], [100, 118, 116, 130]], types: ['soi_rung'] },
      { id: 'khi_rung_nam', name: 'Khu Khỉ Rừng Nam', rects: [[96, 100, 118, 114]], types: ['khi_mat_do'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (p) { map.herbs.push({ x: p[0], y: p[1], item: 'linh_chi' }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    V5_SIGNS.forEach(function (s) { map.props.push(s); });
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map3-bg-v9.webp';
  })();


  // ================= TÍCH HỢP V5 — MAP 4 (gói tmp/map-packages/map4) =================
  // ---- MỞ RỘNG MAP 4 V5 — GẤP 10 DIỆN TÍCH GỐC (lệnh Bui 23:04 ngày
  // 2026-10-30 "thiết kế map từ giờ đến sáng tất cả phải xong", theo mục
  // chương trình map 2–14 ghi 22:26): map 4 Thập Vạn Đại Sơn từ 96x64 ô
  // (6144, đã gồm lõi gốc 72x48 của nó sau mở rộng V10) lên 216x160 ô
  // (34560 ô = đúng 10x diện tích map gốc 3456 ô). Toàn bộ khối 96x64
  // hiện có GIỮ NGUYÊN BỐ CỤC/DỮ LIỆU, neo tại (+60,+48) trong khung
  // mới — khối nằm giữa, núi mở ra bốn phía: dãy đỉnh bắc (bậc đá
  // switchback lên Đài Vọng Sơn + Miếu Sơn Thần), rừng thông đỉnh tây
  // + thác nguồn tây, rừng già phía tây (Thảo Lư Hái Thuốc), khe đá
  // đông bắc + Thượng Nguồn Linh Tuyền, khe suối đông, sườn nam đồng
  // cỏ (Đình Nghỉ Chân). Cây Cổ Thụ Linh Khí (KEEP_TREES) dịch cùng
  // neo, vùng bất biến giữ nguyên. Đất mới: mạng đường >= 2 ô nối liền
  // mọi khu/cổng, cầu đá qua suối, bậc đá 'Q' ở các điểm lên dốc, khu
  // quái theo thang map 4 (nam yếu -> xa dần mạnh dần), mật độ thưa
  // như chuẩn V10. EXP_LAYOUT_V nâng lên 5: game.js migrateLayoutV10
  // dịch save theo EXP_V5_MAP4 cho RIÊNG map 4 (xem README gói).
  // NPC mới khai ở đây; hồ sơ + thoại đề xuất nằm trong README của gói
  // (đội tích hợp chép vào js/story.js khi gộp).
  var EXP_V5_MAP4 = { dx: 60, dy: 48 };
  EXP_LAYOUT_V = 5;
  (function expandMap4V5() {
    var map = MAPS.map4;
    var OW = map.w, OH = map.h, NW = 216, NH = 160;
    var AX = EXP_V5_MAP4.dx, AY = EXP_V5_MAP4.dy;
    var rows = [], y, x;
    for (y = 0; y < NH; y++) { var r0 = []; for (x = 0; x < NW; x++) r0.push('.'); rows.push(r0); }
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) rows[y + AY][x + AX] = map.tiles[y][x];
    function inBlock(cx, cy) { return cx >= AX && cx < AX + OW && cy >= AY && cy < AY + OH; }
    function S(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < NW && cy < NH && !inBlock(cx, cy)) rows[cy][cx] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      // Cây mọc thành CỤM có nhịp (mặt nạ cụm ô 5x5 + nhiễu mịn), đá lẻ
      // ngoài cụm — cùng thuật toán với khối mở rộng map 1 V3.
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || rows[yy][xx] !== '.') continue;
        var grove = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (grove < pT * 1.9 && h1 < 0.62) rows[yy][xx] = 'T';
        else if (h1 > 1 - pO) rows[yy][xx] = 'o';
      }
    }
    function scatterCliff(x0, y0, x1, y1, p, salt) {
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || rows[yy][xx] !== '.') continue;
        if (hash01(xx + salt, yy + salt * 7) < p) rows[yy][xx] = 'W';
      }
    }
    // -- Danh sách nội dung mới (khai trước để dọn bãi + đẩy dữ liệu) --
    var V5_NPCS = [
      { id: 'thu_mieu_dai_son', x: 95, y: 5, sprite: 'giu_mieu', name: 'Mạc Thủ Sơn', role: 'Người giữ Miếu Sơn Thần Đại Sơn' },
      { id: 'tan_hai_son', x: 20, y: 85, sprite: 'tho_san_ha', name: 'Tần Hái Sơn', role: 'Người hái thuốc rừng tây' },
      { id: 'do_dinh_quan', x: 100, y: 128, sprite: 'chu_quan', name: 'Đỗ Đình Quán', role: 'Chủ Đình Nghỉ Chân sườn nam' }
    ];
    // Cụm spawn: [zoneId, type, tâm x, tâm y, số con] — placer tất định
    // phía dưới rải con quanh tâm theo luật audit (xem hàm placeSpawns).
    var V5_CLUSTERS = [
      ['rung_thong_dinh_tay', 'khi_mat_do', 18, 16, 5], ['rung_thong_dinh_tay', 'lon_mong_sat', 44, 28, 5], ['rung_thong_dinh_tay', 'khi_mat_do', 14, 38, 4],
      ['suon_dinh_bac', 'ran_luc', 76, 28, 5], ['suon_dinh_bac', 'khi_mat_do', 118, 30, 5], ['suon_dinh_bac', 'ran_luc', 96, 40, 4],
      ['rung_gia_tay', 'khi_mat_do', 24, 58, 5], ['rung_gia_tay', 'lon_mong_sat', 48, 60, 4], ['rung_gia_tay', 'lon_mong_sat', 44, 100, 5], ['rung_gia_tay', 'khi_mat_do', 16, 104, 4],
      ['khe_da_dong_bac', 'ran_luc', 168, 14, 5], ['khe_da_dong_bac', 'khi_mat_do', 206, 12, 4], ['khe_da_dong_bac', 'khi_mat_do', 196, 34, 4],
      ['khe_suoi_dong', 'ran_luc', 176, 58, 5], ['khe_suoi_dong', 'ran_luc', 200, 70, 4], ['khe_suoi_dong', 'ran_luc', 168, 104, 4], ['khe_suoi_dong', 'ran_luc', 204, 104, 4],
      ['suon_nam_lon', 'lon_rung', 24, 132, 5], ['suon_nam_lon', 'lon_rung', 56, 140, 5], ['suon_nam_lon', 'lon_rung', 70, 124, 4],
      ['suon_nam_soi', 'soi_rung', 130, 138, 5], ['suon_nam_soi', 'soi_rung', 160, 128, 4], ['suon_nam_soi', 'soi_rung', 196, 140, 4], ['suon_nam_soi', 'soi_rung', 120, 124, 4]
    ];
    var V5_HERBS = [
      [80, 20, 'linh_chi'], [112, 18, 'linh_chi'], [66, 36, 'linh_chi'], [122, 42, 'linh_chi'],
      [170, 10, 'linh_chi'], [208, 28, 'linh_chi'], [160, 52, 'linh_chi'], [205, 80, 'linh_chi'],
      [44, 20, 'linh_chi'], [24, 44, 'linh_chi'], [58, 96, 'linh_chi'], [150, 66, 'linh_chi'],
      [20, 130, 'thao_duoc'], [60, 146, 'thao_duoc'], [90, 136, 'thao_duoc'], [140, 148, 'thao_duoc'],
      [170, 132, 'thao_duoc'], [200, 150, 'thao_duoc'], [48, 150, 'thao_duoc'], [110, 118, 'thao_duoc'],
      [28, 100, 'thao_duoc'], [52, 84, 'thao_duoc'], [196, 96, 'thao_duoc'], [212, 60, 'thao_duoc'],
      [88, 152, 'thao_duoc'], [156, 118, 'thao_duoc']
    ];
    // -- Rải sinh cảnh nền theo vùng (đường/nước/công trình vẽ đè sau) --
    scatter(0, 0, 59, 46, 0.42, 0.03, 601);          // rừng thông đỉnh tây (dày)
    scatter(127, 0, 215, 46, 0.20, 0.05, 602);       // vai núi đông bắc (thông + đá)
    scatter(0, 48, 59, 111, 0.34, 0.03, 603);        // rừng già phía tây
    scatter(156, 48, 215, 111, 0.18, 0.05, 604);     // khe suối đông (cây thưa + đá)
    scatter(0, 112, 215, 158, 0.10, 0.02, 605);      // sườn nam đồng cỏ (thưa)
    scatter(64, 10, 126, 47, 0.10, 0.04, 606);       // sườn hành lang bắc (thưa)
    // Vách đá vai hành lang bắc + khe đá đông bắc (chừa vùng tính năng).
    scatterCliff(58, 12, 63, 46, 0.55, 607);
    scatterCliff(127, 12, 132, 46, 0.55, 608);
    scatterCliff(156, 2, 215, 17, 0.30, 609);
    scatterCliff(156, 31, 169, 36, 0.30, 610);
    scatterCliff(198, 31, 215, 36, 0.30, 611);
    // -- Vành biên: vách quanh map, chừa cửa suối --
    R(0, 0, 215, 0, 'W'); R(0, 1, 0, 159, 'W'); R(215, 1, 215, 159, 'W'); R(0, 159, 215, 159, 'W');
    // -- Nước: suối tây (thác nguồn -> đầm -> chảy khỏi mép nam) --
    R(36, 1, 37, 126, 'R');
    R(31, 127, 43, 136, 'R');                        // Đầm Thác Tây
    R(36, 137, 37, 158, 'R');
    R(32, 2, 39, 5, 'Q');                            // thềm đá đầu thác (điểm ngắm)
    S(36, 3, 'R'); S(37, 3, 'R');                    // cửa thác giữa thềm
    // -- Nước: Thượng Nguồn Linh Tuyền + suối đông --
    R(182, 20, 197, 30, 'R');                        // hồ nguồn đông bắc
    R(186, 31, 187, 115, 'R');
    R(181, 116, 192, 123, 'R');                      // ao đông nam
    R(186, 124, 187, 158, 'R');
    // -- Mạng đường (# >= 2 ô, nối liền mọi cổng/khu/công trình) --
    R(4, 73, 59, 74, '#');                           // trục tây: mép lõi -> đường dọc tây
    R(8, 19, 9, 121, '#');                           // đường dọc tây: rừng thông -> vòng nam
    R(10, 19, 63, 20, '#');                          // đường rừng thông đỉnh tây
    R(24, 6, 25, 18, '#');                           // nhánh lên thềm đầu thác
    R(30, 75, 31, 119, '#');                         // đường ven suối tây (bờ tây)
    R(19, 75, 20, 81, '#');                          // nhánh vào Thảo Lư Hái Thuốc
    R(84, 34, 87, 47, '#');                          // hành lang bắc: mép lõi -> chân bậc
    R(70, 22, 110, 23, '#');                         // thềm đáp giữa (landing)
    R(111, 22, 155, 23, '#');                        // đường vai đông bắc
    R(154, 24, 155, 38, '#');                        // dọc xuống thềm hồ nguồn
    R(160, 38, 199, 39, '#');                        // đường bờ nam hồ nguồn
    R(170, 40, 171, 88, '#');                        // dọc khe đông (đoạn dưới là bậc đá)
    R(156, 89, 207, 90, '#');                        // trục đông: mép lõi -> đài ngắm khe
    R(197, 91, 198, 119, '#');                       // dọc đông nam: trục đông -> vòng nam
    R(10, 120, 199, 121, '#');                       // vòng nam: dọc tây -> đông nam
    R(90, 112, 91, 119, '#');                        // nhánh cổng nam lõi -> vòng nam
    R(99, 122, 100, 124, '#');                       // nhánh vào Đình Nghỉ Chân
    // -- Bậc đá 'Q' ở các điểm lên dốc + cầu đá qua suối --
    R(84, 24, 85, 33, 'Q');                          // bậc 1: chân hành lang -> thềm đáp
    R(104, 14, 105, 21, 'Q');                        // bậc 2: thềm đáp -> sân đài
    R(170, 40, 171, 59, 'Q');                        // bậc khe đông: bờ hồ -> trục đông
    R(36, 73, 37, 74, 'Q');                          // cầu đá suối tây (trục tây)
    R(36, 120, 37, 121, 'Q');                        // cầu đá suối tây (vòng nam)
    R(36, 19, 37, 20, 'Q');                          // cầu đá suối tây (đường thông)
    R(186, 89, 187, 90, 'Q');                        // cầu đá suối đông (trục đông)
    R(181, 120, 192, 121, 'Q');                      // đê đá qua ao đông nam (trên vòng nam)
    // -- Sân đài + Miếu Sơn Thần (đỉnh bắc) --
    R(76, 6, 116, 13, 'Q');                          // sân Đài Vọng Vân
    R(92, 1, 98, 3, 'H');                            // Miếu Sơn Thần Đại Sơn
    R(92, 4, 98, 5, 'Q');                            // thềm miếu (NPC đứng ở đây)
    R(76, 5, 91, 5, 'F'); R(99, 5, 116, 5, 'F');     // lan can mép bắc sân đài
    S(77, 6, 'L'); S(115, 6, 'L');                   // đèn đá hai đầu sân
    // -- Đài ngắm khe đông --
    R(208, 86, 214, 93, 'Q');
    R(214, 86, 214, 88, 'F'); R(214, 91, 214, 93, 'F');
    S(209, 87, 'L');
    // -- Thảo Lư Hái Thuốc (rừng tây) --
    R(18, 82, 21, 84, 'H');
    R(18, 85, 21, 85, 'Q');                          // thềm cửa (NPC đứng ở đây)
    // -- Đình Nghỉ Chân (sườn nam) --
    R(98, 125, 102, 127, 'H');
    R(98, 128, 102, 128, 'Q');                       // thềm đình (NPC đứng ở đây)
    R(96, 129, 104, 130, 'Q');                       // sân đình
    S(97, 129, 'L'); S(103, 129, 'L');
    // -- Dọn bãi 3x3 quanh NPC/dược mới (chỉ gạt T/o/F) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = rows[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') rows[yy][xx] = '.';
      }
    }
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    V5_HERBS.forEach(function (hb) { clearPatch(hb[0], hb[1]); });
    // -- Khoét thông túi đất cô lập trong đất mới (thuật toán V10/V3):
    // BFS từ toàn bộ khối cũ; ô đi được ở đất mới nào chưa tới được thì
    // khoét tuyến rẻ nhất qua T/o/F (không đụng W/H/R/G và không đụng
    // vùng sào boss + vùng Cây Cổ Thụ Linh Khí). --
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[rows[cy][cx]]; }
    function bfsReached() {
      var seen = {}, q = [], xx, yy;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        if (inBlock(xx, yy) && walkAt(xx, yy)) { var k = xx + ',' + yy; if (!seen[k]) { seen[k] = 1; q.push([xx, yy]); } }
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
    var protRects = (map.bossLairs || []).map(function (l) {
      return l.rect ? [l.rect[0] + AX, l.rect[1] + AY, l.rect[2] + AX, l.rect[3] + AY] : null;
    }).filter(Boolean);
    if (typeof KEEP_TREES !== 'undefined' && KEEP_TREES.map4) {
      KEEP_TREES.map4.forEach(function (r) { protRects.push([r[0] + AX, r[1] + AY, r[2] + AX, r[3] + AY]); });
    }
    function inProt(cx, cy) {
      return protRects.some(function (r) { return cx >= r[0] && cx <= r[2] && cy >= r[1] && cy <= r[3]; });
    }
    var reached = bfsReached();
    for (y = 0; y < NH; y++) for (x = 0; x < NW; x++) {
      if (inBlock(x, y) || !walkAt(x, y) || reached[x + ',' + y]) continue;
      var srcs = [];
      Object.keys(reached).forEach(function (k) { var p = k.split(','); srcs.push([+p[0], +p[1]]); });
      var tx0 = x, ty0 = y;
      var path = dvDijkstra(NW, NH, srcs, function (cx, cy) {
        var ch = rows[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (inProt(cx, cy)) return Infinity;
        if (ch === 'T') return 7; if (ch === 'o') return 11; if (ch === 'F') return 9;
        return Infinity;
      }, function (cx, cy) { return cx === tx0 && cy === ty0; });
      if (path) path.forEach(function (c) { if (map.blocked[rows[c[1]][c[0]]]) rows[c[1]][c[0]] = '.'; });
      reached = bfsReached();
    }
    // -- Dịch toàn bộ nội dung cũ của map 4 theo neo (+60,+48) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start); shPt(map.well); shPt(map.bossSpawn); shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 3/5 KHÔNG đổi hình học
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    if (typeof KEEP_TREES !== 'undefined' && KEEP_TREES.map4) KEEP_TREES.map4.forEach(shRect);
    // Cổng của map khác rơi VÀO map 4 phải dịch điểm rơi theo neo mới.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map4') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map4') { p.tx += AX; p.ty += AY; } });
    });
    // -- Khu quái mới (chỉ nằm ở đất mở rộng) --
    map.zones.push(
      { id: 'rung_thong_dinh_tay', name: 'Rừng Thông Đỉnh Tây', rects: [[4, 8, 54, 44]], types: ['khi_mat_do', 'lon_mong_sat'] },
      { id: 'suon_dinh_bac', name: 'Sườn Đỉnh Bắc', rects: [[66, 16, 124, 44]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'rung_gia_tay', name: 'Rừng Già Phía Tây', rects: [[3, 50, 55, 70], [3, 92, 55, 110]], types: ['khi_mat_do', 'lon_mong_sat'] },
      { id: 'khe_da_dong_bac', name: 'Khe Đá Đông Bắc', rects: [[158, 6, 213, 36]], types: ['ran_luc', 'khi_mat_do'] },
      { id: 'khe_suoi_dong', name: 'Khe Suối Đông', rects: [[160, 44, 213, 86], [160, 92, 213, 114]], types: ['ran_luc'] },
      { id: 'suon_nam_lon', name: 'Sườn Nam Lợn Rừng', rects: [[6, 116, 84, 152]], types: ['lon_rung'] },
      { id: 'suon_nam_soi', name: 'Sườn Nam Sói Rừng', rects: [[112, 116, 210, 152]], types: ['soi_rung'] }
    );
    // -- Placer spawn tất định theo cụm: quét vòng quanh tâm theo thứ tự
    // cố định, chỉ nhận ô '.'/'T'/'o' (T/o được dọn 3x3 ngay sau), cách
    // spawn khác >= 3 Chebyshev, cách điểm nhạy cảm (cổng/điểm rơi/start/
    // NPC/sào boss/Cây Cổ Thụ) >= 6 Chebyshev, nằm trong rect zone. --
    var safePts = [];
    (map.portals || []).forEach(function (p) { safePts.push([p.x, p.y]); });
    Object.keys(MAPS).forEach(function (id) {
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map4') safePts.push([p.tx, p.ty]); });
    });
    if (map.start) safePts.push([map.start.x, map.start.y]);
    V5_NPCS.forEach(function (n) { safePts.push([n.x, n.y]); });
    (map.bossLairs || []).forEach(function (l) {
      if (l.rect) for (var ly = l.rect[1]; ly <= l.rect[3]; ly++) for (var lx = l.rect[0]; lx <= l.rect[2]; lx++) safePts.push([lx, ly]);
    });
    if (typeof KEEP_TREES !== 'undefined' && KEEP_TREES.map4) {
      KEEP_TREES.map4.forEach(function (r) {
        for (var ky = r[1]; ky <= r[3]; ky++) for (var kx = r[0]; kx <= r[2]; kx++) safePts.push([kx, ky]);
      });
    }
    function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
    var zoneRects = {};
    map.zones.forEach(function (z) { zoneRects[z.id] = z.rects; });
    function inZone(zid, cx, cy) {
      return (zoneRects[zid] || []).some(function (r) { return cx >= r[0] && cx <= r[2] && cy >= r[1] && cy <= r[3]; });
    }
    var placedPts = [];
    (map.monsters || []).forEach(function (mn) { placedPts.push([mn.x, mn.y]); });
    var newSpawns = [];
    V5_CLUSTERS.forEach(function (cl) {
      var zid = cl[0], type = cl[1], cx0 = cl[2], cy0 = cl[3], want = cl[4], got = 0;
      for (var rad = 0; rad <= 9 && got < want; rad++) {
        for (var dy = -rad; dy <= rad && got < want; dy++) for (var dx = -rad; dx <= rad && got < want; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== rad) continue;
          var cx = cx0 + dx, cy = cy0 + dy;
          if (cx < 1 || cy < 1 || cx >= NW - 1 || cy >= NH - 1 || inBlock(cx, cy)) continue;
          var ch = rows[cy][cx];
          if (ch !== '.' && ch !== 'T' && ch !== 'o') continue;
          if (!inZone(zid, cx, cy)) continue;
          var bad = false;
          for (var i = 0; i < safePts.length && !bad; i++) if (cheb(cx, cy, safePts[i][0], safePts[i][1]) < 6) bad = true;
          for (var j = 0; j < placedPts.length && !bad; j++) if (cheb(cx, cy, placedPts[j][0], placedPts[j][1]) < 3) bad = true;
          if (bad) continue;
          placedPts.push([cx, cy]);
          newSpawns.push({ type: type, x: cx, y: cy, zone: zid });
          got++;
        }
      }
    });
    // Dọn 3x3 quanh spawn mới (chỉ gạt T/o/F — spawn thành ô đi được).
    newSpawns.forEach(function (s) { clearPatch(s.x, s.y); });
    newSpawns.forEach(function (s) { map.monsters.push(s); });
    V5_HERBS.forEach(function (hb) { map.herbs.push({ x: hb[0], y: hb[1], item: hb[2] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 95, y: 14, label: 'Đài Vọng Sơn' },
      { sprite: 'sign', x: 91, y: 6, label: 'Miếu Sơn Thần Đại Sơn' },
      { sprite: 'sign', x: 33, y: 6, label: 'Thác Nguồn Tây' },
      { sprite: 'sign', x: 29, y: 124, label: 'Đầm Thác Tây' },
      { sprite: 'sign', x: 10, y: 17, label: 'Rừng Thông Đỉnh Tây' },
      { sprite: 'sign', x: 12, y: 71, label: 'Rừng Già Phía Tây' },
      { sprite: 'sign', x: 22, y: 86, label: 'Thảo Lư Hái Thuốc' },
      { sprite: 'sign', x: 34, y: 87, label: 'Cầu Đá — Suối Tây' },
      { sprite: 'sign', x: 118, y: 25, label: 'Sườn Đỉnh Bắc' },
      { sprite: 'sign', x: 172, y: 36, label: 'Khe Đá Đông Bắc' },
      { sprite: 'sign', x: 179, y: 33, label: 'Thượng Nguồn Linh Tuyền' },
      { sprite: 'sign', x: 175, y: 93, label: 'Khe Suối Đông' },
      { sprite: 'sign', x: 206, y: 87, label: 'Đài Ngắm Khe Đông' },
      { sprite: 'sign', x: 95, y: 123, label: 'Sườn Nam Đại Sơn' },
      { sprite: 'sign', x: 105, y: 129, label: 'Đình Nghỉ Chân' },
      { sprite: 'bush', x: 95, y: 15 }, { sprite: 'bush', x: 37, y: 88 }, { sprite: 'bush', x: 188, y: 88 },
      { sprite: 'bush', x: 100, y: 131 }, { sprite: 'bush', x: 181, y: 32 }, { sprite: 'bush', x: 15, y: 75 }
    );
    map.tiles = rows.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map4-bg-v9.webp';
  })();


  // ================= TÍCH HỢP V5 — MAP 5 (gói tmp/map-packages/map5) =================
  // ---- MỞ RỘNG MAP 5 V5 — GẤP 10 DIỆN TÍCH (lệnh Bui 23:04 ngày
  // 2026-10-30 "thiết kế map từ giờ đến sáng tất cả phải xong", theo mục
  // chương trình map 2–14 ghi 22:26): map 5 Thập Vạn Đại Sơn · Trung Phúc
  // từ 88x60 ô (5280, đã gồm lõi gốc 64x44 của nó) lên 176x160 ô
  // (28160 ô = đúng 10x diện tích map gốc 2816 ô). Toàn bộ khối 88x60
  // hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+44,+38) trong khung mới —
  // lõi phế tích/suối/khu quái cũ nằm giữa lòng núi, đất mới mở ra bốn
  // phía: BẮC là Phế Tích Thượng Cổ (sân đá lớn + tàn điện + thềm vọng),
  // TÂY là Rừng Già Tây + Lán Thợ Săn, ĐÔNG qua Cầu Đá là Cổ Thụ Phế
  // Tích + bãi lầy bờ suối mới, NAM là thung lũng bậc thềm + đầm lầy +
  // Đình Nghỉ Chân. Đất mới có mạng đường >= 2 ô nối liền mọi cổng/khu,
  // bậc đá 'Q' ở các điểm lên/xuống dốc trên tuyến chính, cầu đá qua
  // suối đông. Khu quái theo thang map 5 (Luyện Khí 4+), càng xa lõi
  // càng nặng: bắc/đông rắn lục + khỉ mặt đỏ, tây sói rừng già, nam
  // rắn đầm lầy + lợn mông sắt bãi cỏ. NPC mới khai ở đây + hồ sơ/thoại
  // đề xuất trong README của gói (js/story.js do đội tích hợp gắn).
  // EXP_LAYOUT_V nâng lên 5: game.js migrateLayoutV10 dịch save theo
  // EXP_V5_MAP5 cho RIÊNG map 5; save cũ hơn vẫn chạy đủ các nấc
  // V1->V2 (EXP_DX/EXP_DY), V2->V3 (map 1), V3->V4 (map 2) như cũ.
  // ĐIỂM GẮN: dán khối này vào js/maps.js NGAY SAU khối expandMap2V4
  // (trước hàm isBlockedIn), cùng phạm vi IIFE để dùng hash01/dvDijkstra.
  var EXP_V5_MAP5 = { dx: 44, dy: 38 };
  (function expandMap5V5() {
    var map = MAPS.map5;
    var OW = map.w, OH = map.h, NW = 176, NH = 160;
    var AX = EXP_V5_MAP5.dx, AY = EXP_V5_MAP5.dy;
    var rows = [], y, x;
    for (y = 0; y < NH; y++) { var r0 = []; for (x = 0; x < NW; x++) r0.push('.'); rows.push(r0); }
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) rows[y + AY][x + AX] = map.tiles[y][x];
    function inBlock(cx, cy) { return cx >= AX && cx < AX + OW && cy >= AY && cy < AY + OH; }
    function S(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < NW && cy < NH && !inBlock(cx, cy)) rows[cy][cx] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      // Cây mọc thành CỤM có nhịp (mặt nạ cụm 5x5 + nhiễu mịn), đá lẻ
      // ngoài cụm — cùng thuật toán với khối V3 map 1.
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || rows[yy][xx] !== '.') continue;
        var grove = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (grove < pT * 1.9 && h1 < 0.62) rows[yy][xx] = 'T';
        else if (h1 > 1 - pO) rows[yy][xx] = 'o';
      }
    }
    // -- Danh sách nội dung mới (dùng cho cả dọn bãi + đẩy dữ liệu) --
    var V5_SPAWNS = [
      // Phế Tích Thượng Cổ (bắc): rắn lục + khỉ mặt đỏ
      ['ran_luc', 60, 9, 'phe_tich_thuong_co'], ['ran_luc', 68, 12, 'phe_tich_thuong_co'], ['ran_luc', 92, 9, 'phe_tich_thuong_co'],
      ['ran_luc', 100, 13, 'phe_tich_thuong_co'], ['ran_luc', 64, 21, 'phe_tich_thuong_co'], ['ran_luc', 98, 21, 'phe_tich_thuong_co'],
      ['ran_luc', 84, 22, 'phe_tich_thuong_co'], ['ran_luc', 110, 23, 'phe_tich_thuong_co'],
      ['khi_mat_do', 76, 18, 'phe_tich_thuong_co'], ['khi_mat_do', 90, 16, 'phe_tich_thuong_co'], ['khi_mat_do', 102, 10, 'phe_tich_thuong_co'],
      ['khi_mat_do', 66, 16, 'phe_tich_thuong_co'], ['khi_mat_do', 88, 20, 'phe_tich_thuong_co'], ['khi_mat_do', 104, 17, 'phe_tich_thuong_co'],
      // Rừng Già Tây: sói rừng
      ['soi_rung', 8, 48, 'rung_gia_tay'], ['soi_rung', 16, 52, 'rung_gia_tay'], ['soi_rung', 26, 47, 'rung_gia_tay'],
      ['soi_rung', 34, 54, 'rung_gia_tay'], ['soi_rung', 10, 70, 'rung_gia_tay'], ['soi_rung', 28, 74, 'rung_gia_tay'],
      ['soi_rung', 38, 66, 'rung_gia_tay'], ['soi_rung', 6, 80, 'rung_gia_tay'], ['soi_rung', 18, 82, 'rung_gia_tay'],
      ['soi_rung', 36, 80, 'rung_gia_tay'], ['soi_rung', 30, 58, 'rung_gia_tay'], ['soi_rung', 10, 56, 'rung_gia_tay'],
      // Cổ Thụ Phế Tích (đông): khỉ mặt đỏ
      ['khi_mat_do', 140, 48, 'co_thu_dong'], ['khi_mat_do', 146, 56, 'co_thu_dong'], ['khi_mat_do', 140, 66, 'co_thu_dong'],
      ['khi_mat_do', 155, 48, 'co_thu_dong'], ['khi_mat_do', 170, 56, 'co_thu_dong'], ['khi_mat_do', 144, 72, 'co_thu_dong'],
      ['khi_mat_do', 168, 70, 'co_thu_dong'], ['khi_mat_do', 146, 62, 'co_thu_dong'], ['khi_mat_do', 172, 64, 'co_thu_dong'],
      ['khi_mat_do', 142, 52, 'co_thu_dong'],
      // Ven suối đông: rắn lục bờ tây suối mới
      ['ran_luc', 144, 44, 'ran_ven_suoi_dong'], ['ran_luc', 146, 54, 'ran_ven_suoi_dong'], ['ran_luc', 143, 64, 'ran_ven_suoi_dong'],
      ['ran_luc', 147, 72, 'ran_ven_suoi_dong'], ['ran_luc', 145, 48, 'ran_ven_suoi_dong'], ['ran_luc', 144, 60, 'ran_ven_suoi_dong'],
      // Bãi Lầy Đông Nam: lợn mông sắt
      ['lon_mong_sat', 138, 98, 'bai_lay_dong_nam'], ['lon_mong_sat', 148, 102, 'bai_lay_dong_nam'], ['lon_mong_sat', 160, 98, 'bai_lay_dong_nam'],
      ['lon_mong_sat', 169, 104, 'bai_lay_dong_nam'], ['lon_mong_sat', 142, 110, 'bai_lay_dong_nam'], ['lon_mong_sat', 156, 112, 'bai_lay_dong_nam'],
      ['lon_mong_sat', 136, 106, 'bai_lay_dong_nam'], ['lon_mong_sat', 164, 96, 'bai_lay_dong_nam'], ['lon_mong_sat', 156, 104, 'bai_lay_dong_nam'],
      ['lon_mong_sat', 170, 112, 'bai_lay_dong_nam'],
      // Đầm Lầy Nam: rắn lục
      ['ran_luc', 32, 106, 'dam_lay_nam'], ['ran_luc', 40, 114, 'dam_lay_nam'], ['ran_luc', 26, 118, 'dam_lay_nam'],
      ['ran_luc', 50, 126, 'dam_lay_nam'], ['ran_luc', 34, 134, 'dam_lay_nam'], ['ran_luc', 52, 138, 'dam_lay_nam'],
      ['ran_luc', 22, 130, 'dam_lay_nam'], ['ran_luc', 28, 140, 'dam_lay_nam'], ['ran_luc', 44, 141, 'dam_lay_nam'],
      ['ran_luc', 40, 130, 'dam_lay_nam'],
      // Bãi Cỏ Nam: lợn mông sắt
      ['lon_mong_sat', 102, 130, 'bai_co_nam'], ['lon_mong_sat', 112, 136, 'bai_co_nam'], ['lon_mong_sat', 124, 130, 'bai_co_nam'],
      ['lon_mong_sat', 134, 138, 'bai_co_nam'], ['lon_mong_sat', 106, 144, 'bai_co_nam'], ['lon_mong_sat', 120, 146, 'bai_co_nam'],
      ['lon_mong_sat', 138, 146, 'bai_co_nam'], ['lon_mong_sat', 128, 134, 'bai_co_nam']
    ];
    var V5_HERBS = [
      [64, 6, 'linh_chi'], [108, 6, 'linh_chi'], [90, 23, 'linh_chi'], [144, 50, 'linh_chi'], [170, 70, 'linh_chi'],
      [5, 87, 'thao_duoc'], [13, 90, 'thao_duoc'], [146, 84, 'thao_duoc'], [136, 112, 'thao_duoc'], [36, 144, 'thao_duoc'],
      [40, 100, 'thao_duoc'], [160, 134, 'thao_duoc'], [100, 152, 'thao_duoc'], [24, 100, 'thao_duoc']
    ];
    var V5_NPCS = [
      { id: 'tho_san_trung_phuc', x: 15, y: 64, sprite: 'tho_san_ha', name: 'Hà Văn Dũng', role: 'Thợ săn Trung Phúc' },
      { id: 'an_si_trung_phuc', x: 92, y: 121, sprite: 'dai_phu', name: 'Trần Văn Ẩn', role: 'Ẩn sĩ hái thuốc Trung Phúc' }
    ];
    // -- Rừng/đá nền theo vùng (đường/nước/công trình vẽ đè lên sau) --
    scatter(0, 0, 175, 36, 0.30, 0.04, 551);          // vành bắc: rừng già quanh phế tích
    scatter(0, 38, 43, 97, 0.34, 0.03, 552);          // rừng già tây (dày nhất map)
    scatter(132, 38, 175, 97, 0.26, 0.03, 553);       // rừng đông thưa hơn (đất phế tích)
    scatter(0, 98, 43, 159, 0.24, 0.03, 554);         // rừng tây nam + đầm lầy
    scatter(44, 98, 131, 159, 0.20, 0.03, 555);       // thung lũng nam thoáng
    scatter(132, 98, 175, 159, 0.26, 0.03, 556);      // rừng đông nam
    scatter(0, 150, 175, 159, 0.40, 0.02, 557);       // dải rừng rậm mép nam
    // Khoảng trống giữ sạch: sân phế tích bắc + thềm vọng + hành lang.
    R(54, 4, 116, 34, '.');                            // Phế Tích Thượng Cổ + thềm phía nam sân
    R(136, 42, 174, 76, '.');                          // Cổ Thụ Phế Tích + bãi đông
    R(2, 42, 42, 86, '.');                             // bãi rừng tây quanh lán thợ săn (rừng vẽ cụm đè mép sau)
    R(18, 102, 60, 144, '.');                          // đầm lầy nam
    R(96, 124, 144, 150, '.');                         // bãi cỏ nam
    R(132, 92, 172, 116, '.');                         // bãi lầy đông nam
    // -- PHẾ TÍCH THƯỢNG CỔ (bắc): sân đá lớn, tường gãy, tàn điện, ao thiêng --
    R(58, 8, 112, 24, 'Q');                            // sân đá thượng cổ
    R(58, 7, 70, 7, 'W'); R(76, 7, 90, 7, 'W'); R(96, 7, 112, 7, 'W'); // tường gãy mép bắc sân (hở trục vào)
    R(57, 10, 57, 22, 'W'); S(57, 15, '.'); S(57, 16, '.'); S(57, 17, '.'); // tường gãy tây + lối hở
    R(113, 10, 113, 22, 'W'); S(113, 16, '.'); S(113, 17, '.'); S(113, 18, '.'); // tường gãy đông + lối hở
    R(80, 10, 87, 12, 'H');                            // Tàn Điện Bắc (nhà đá cổ đổ nát một phần)
    R(82, 13, 84, 13, 'Q');                            // thềm cửa tàn điện
    R(104, 12, 109, 12, 'R'); R(103, 13, 110, 15, 'R'); R(104, 16, 109, 16, 'R'); // ao thiêng trong sân
    [[62, 10], [66, 20], [95, 11], [100, 22], [70, 15], [60, 22], [108, 9], [76, 22]
    ].forEach(function (p) { S(p[0], p[1], 'o'); });   // cột đá đổ trong sân
    // Thềm Vọng Bắc: thềm đá + lan can + đèn đá, nhìn xuống lòng núi.
    R(100, 27, 112, 29, 'Q');
    R(100, 26, 104, 26, 'F'); R(108, 26, 112, 26, 'F');
    S(101, 28, 'L'); S(111, 28, 'L');
    // -- Suối đông (tiếp nối suối trong lõi) + ao đông nam --
    R(150, 40, 152, 79, 'R'); R(150, 82, 152, 115, 'R');
    R(152, 116, 166, 116, 'R'); R(151, 117, 167, 129, 'R'); R(153, 130, 165, 130, 'R'); // ao cuối suối
    // Bãi lầy đông nam: 2 vũng lầy.
    R(140, 100, 143, 102, 'R'); R(158, 106, 161, 108, 'R');
    // -- Đầm lầy nam: 3 ao lầy --
    R(30, 122, 38, 122, 'R'); R(29, 123, 39, 127, 'R'); R(30, 128, 38, 128, 'R');
    R(44, 132, 50, 132, 'R'); R(43, 133, 51, 136, 'R'); R(44, 137, 50, 137, 'R');
    R(24, 108, 29, 108, 'R'); R(23, 109, 30, 111, 'R'); R(24, 112, 29, 112, 'R');
    // Ao rừng tây (cạnh lán thợ săn).
    R(7, 88, 11, 88, 'R'); R(6, 89, 12, 92, 'R'); R(7, 93, 11, 93, 'R');
    // -- Cổ Thụ Phế Tích (đông): sân đá quanh gốc cổ thụ + tường gãy --
    R(156, 52, 168, 64, 'Q');
    R(158, 51, 161, 51, 'W'); R(164, 51, 168, 51, 'W');
    S(162, 45, 'T'); S(163, 45, 'T'); S(162, 46, 'T'); S(163, 46, 'T'); // thân cổ thụ (khối cây 2x2)
    S(160, 44, 'T'); S(165, 44, 'T'); S(160, 47, 'T'); S(165, 47, 'T'); // tán gốc/rễ cây quanh thân
    [[158, 54], [166, 60], [160, 62]].forEach(function (p) { S(p[0], p[1], 'o'); }); // cột đổ quanh sân
    // -- Công trình: Lán Thợ Săn (tây) + Đình Nghỉ Chân (nam) --
    R(14, 60, 17, 62, 'H'); R(15, 63, 16, 63, 'Q');    // lán + thềm cửa
    S(13, 63, 'L');
    R(91, 117, 94, 119, 'H'); R(91, 120, 94, 120, 'Q'); // đình + thềm cửa
    // -- Thềm đá bậc thềm trên tuyến nam (địa hình kể chuyện) --
    R(60, 104, 100, 105, 'Q');                         // bậc thềm 1
    R(56, 120, 90, 121, 'Q');                          // bậc thềm 2 (đoạn tây đình)
    R(98, 126, 142, 127, 'Q');                         // bậc thềm 3 (sang bãi cỏ)
    // Thềm Vọng Nam (điểm dừng ngắm thung lũng).
    R(116, 144, 128, 147, 'Q');
    S(117, 145, 'L'); S(127, 145, 'L');
    // -- Mạng đường (# đất, >= 2 ô, nối liền mọi cổng/khu/công trình) --
    R(72, 14, 73, 24, '#'); R(72, 25, 73, 29, 'Q'); R(72, 30, 73, 37, '#'); // trục bắc: sân -> bậc đá -> mép bắc lõi (vào trục cổng bắc của lõi)
    R(21, 30, 99, 31, '#'); R(100, 30, 119, 30, '#'); R(21, 31, 119, 31, '#'); // đường thềm bắc: rừng tây <-> sân <-> thềm vọng <-> xuống đông
    R(20, 22, 21, 29, '#');                            // đầu bắc đường vòng tây
    R(20, 32, 21, 65, '#');                            // đường vòng tây: thềm bắc -> lán thợ săn
    R(8, 66, 43, 67, '#'); R(8, 67, 19, 67, '#');      // đường tây: lán -> mép tây lõi (hàng 66-67)
    R(20, 68, 21, 107, '#'); R(20, 108, 21, 109, 'Q'); R(20, 110, 21, 127, '#'); // đường vòng tây xuống nam (bậc đá giữa chừng)
    R(118, 32, 119, 79, '#');                          // đường đông bắc: thềm bắc -> cầu đá
    R(132, 80, 147, 81, '#'); R(148, 80, 153, 81, 'Q'); R(154, 80, 168, 81, '#'); // đường cầu: mép đông lõi -> CẦU ĐÁ qua suối -> bãi đông
    R(166, 65, 167, 79, '#');                          // nhánh cầu -> sân Cổ Thụ
    R(166, 82, 167, 116, '#');                         // đường đông: cầu -> bãi lầy (men bờ ao)
    R(87, 98, 88, 107, '#'); R(87, 108, 88, 110, 'Q'); R(87, 111, 88, 125, '#'); R(87, 126, 88, 128, 'Q'); R(87, 129, 88, 139, '#'); // trục nam: mép nam lõi -> 2 đoạn bậc đá -> bãi cỏ
    R(21, 128, 86, 129, '#'); R(21, 129, 86, 129, '#'); // đường nam: đầm lầy -> trục nam (qua bậc thềm 2)
    R(89, 140, 150, 141, '#');                         // đường vòng nam: trục nam -> bãi cỏ -> men ao đông nam
    R(146, 117, 147, 139, '#');                        // nhánh men ao: bãi lầy -> đường vòng nam
    // -- Dọn bãi 3x3 quanh spawn/dược/NPC mới (chỉ gạt T/o/F) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = rows[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') rows[yy][xx] = '.';
      }
    }
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (hb) { clearPatch(hb[0], hb[1]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // -- Khoét thông túi đất cô lập trong đất mới (cùng thuật toán V10/V3):
    // BFS từ toàn bộ khối cũ; ô đi được ở đất mới chưa tới được thì khoét
    // tuyến rẻ nhất qua T/o (không đụng nhà/nước/vách). --
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[rows[cy][cx]]; }
    function bfsReached() {
      var seen = {}, q = [], xx, yy;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        if (inBlock(xx, yy) && walkAt(xx, yy)) { var k = xx + ',' + yy; if (!seen[k]) { seen[k] = 1; q.push([xx, yy]); } }
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
    var reached = bfsReached();
    // Gom các túi chưa tới được thành từng cụm liên thông rồi khoét MỘT
    // tuyến rẻ nhất cho mỗi cụm (Dijkstra chạy từ cụm ra vùng đã tới —
    // tương đương thuật toán V10/V3 nhưng không lặp lại cho từng ô,
    // bản đồ 176x160 nạp không bị chậm).
    var compSeen = {};
    for (y = 0; y < NH; y++) for (x = 0; x < NW; x++) {
      var k0 = x + ',' + y;
      if (inBlock(x, y) || !walkAt(x, y) || reached[k0] || compSeen[k0]) continue;
      var comp = [], cq = [[x, y]];
      compSeen[k0] = 1;
      while (cq.length) {
        var cc = cq.pop(); comp.push(cc);
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var ax = cc[0] + d[0], ay = cc[1] + d[1], kk = ax + ',' + ay;
          if (!compSeen[kk] && walkAt(ax, ay) && !reached[kk]) { compSeen[kk] = 1; cq.push([ax, ay]); }
        });
      }
      var path = dvDijkstra(NW, NH, comp, function (cx, cy) {
        var ch = rows[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (inBlock(cx, cy)) return Infinity; // không khoét xuyên lõi: lõi giữ nguyên từng ô
        if (ch === 'T') return 7; if (ch === 'o') return 11;
        return Infinity;
      }, function (cx, cy) { return !!reached[cx + ',' + cy]; });
      if (path) path.forEach(function (c) { if (map.blocked[rows[c[1]][c[0]]]) rows[c[1]][c[0]] = '.'; });
      comp.forEach(function (c) { reached[c[0] + ',' + c[1]] = 1; });
      if (path) path.forEach(function (c) { reached[c[0] + ',' + c[1]] = 1; });
    }
    // -- Dịch toàn bộ nội dung cũ của map 5 theo neo (+44,+38) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start);
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 4/6 KHÔNG đổi hình học
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Cổng của map khác rơi VÀO map 5 phải dịch điểm rơi theo neo mới.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map5') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map5') { p.tx += AX; p.ty += AY; } });
    });
    // -- Nội dung mới (tọa độ khung 176x160) --
    map.zones.push(
      { id: 'phe_tich_thuong_co', name: 'Phế Tích Thượng Cổ', rects: [[56, 5, 114, 25]], types: ['ran_luc', 'khi_mat_do'] },
      { id: 'rung_gia_tay', name: 'Rừng Già Tây', rects: [[4, 42, 40, 84]], types: ['soi_rung'] },
      { id: 'co_thu_dong', name: 'Cổ Thụ Phế Tích', rects: [[138, 44, 141, 74], [149, 44, 172, 74]], types: ['khi_mat_do'] }, // TÍCH HỢP 31/10: tách dải suối x142..148 cho ran_ven_suoi_dong (rect cũ chồng lấn khiến zoneAt nuốt khu suối)
      { id: 'ran_ven_suoi_dong', name: 'Rắn Ven Suối Đông', rects: [[142, 40, 148, 78]], types: ['ran_luc'] },
      { id: 'bai_lay_dong_nam', name: 'Bãi Lầy Đông Nam', rects: [[134, 94, 170, 114]], types: ['lon_mong_sat'] },
      { id: 'dam_lay_nam', name: 'Đầm Lầy Nam', rects: [[20, 104, 58, 142]], types: ['ran_luc'] },
      { id: 'bai_co_nam', name: 'Bãi Cỏ Nam', rects: [[98, 126, 142, 148]], types: ['lon_mong_sat'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (hb) { map.herbs.push({ x: hb[0], y: hb[1], item: hb[2] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 71, y: 36, label: 'Lên Phế Tích Thượng Cổ' },
      { sprite: 'sign', x: 18, y: 65, label: 'Lán Thợ Săn' },
      { sprite: 'sign', x: 106, y: 32, label: 'Thềm Vọng Bắc' },
      { sprite: 'sign', x: 155, y: 79, label: 'Cầu Đá Đông' },
      { sprite: 'sign', x: 160, y: 67, label: 'Cổ Thụ Phế Tích' },
      { sprite: 'sign', x: 89, y: 115, label: 'Đình Nghỉ Chân' },
      { sprite: 'sign', x: 122, y: 143, label: 'Thềm Vọng Nam' },
      { sprite: 'sign', x: 30, y: 120, label: 'Đầm Lầy Nam' },
      { sprite: 'sign', x: 140, y: 93, label: 'Bãi Lầy Đông Nam' },
      { sprite: 'bush', x: 50, y: 20 }, { sprite: 'bush', x: 120, y: 44 }, { sprite: 'bush', x: 60, y: 140 },
      { sprite: 'rock', x: 10, y: 30 }, { sprite: 'rock', x: 168, y: 30 }, { sprite: 'rock', x: 70, y: 150 }
    );
    map.tiles = rows.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map5-bg-v9.webp';
  })();


  // ================= TÍCH HỢP V5 — MAP 6 (gói tmp/map-packages/map6) =================
  // ---- MỞ RỘNG MAP 6 V5 — GẤP 10 DIỆN TÍCH GỐC (gói xưởng map
  // xuyên đêm, lệnh Bui 23:04 ngày 2026-10-30 "toàn bộ thiết kế map
  // xong trong đêm"; bản gốc ghi 22:26: chương trình mở rộng map 2–14
  // gấp 10 lần diện tích gốc của chính map đó). Map 6 từ 88x60 ô
  // (5.280, đã gồm lõi gốc 64x44 = 2.816 ô) lên 176x160 ô = 28.160 ô
  // = đúng 10x diện tích map gốc. Toàn bộ khối 88x60 hiện có GIỮ
  // NGUYÊN TỪNG Ô, neo tại (+24,+20) trong khung mới — khe vực sông
  // ngầm + cầu đá của lõi giữ đúng vị trí tương đối; đất mới mở: vành
  // vách bắc (Đài Vọng Vực Bắc), thềm đá tây (Trạm Gác Vực), cánh
  // đông (chuỗi Suối Linh + Lán Hái Dược), và vùng vực sâu phía nam
  // (khe vực nối dài + Cầu Đá Vực Sâu + Đàm U Minh có Miếu Cổ).
  // Mạng đường >= 2 ô nối liền mọi cổng/khu; bậc đá 'Q' ở các đoạn
  // xuống dốc; cầu đá qua khe vực nam và qua suối đông. Khu quái theo
  // thang map 6 (Luyện Khí 7+), càng sâu vào vực càng nặng. NPC mới
  // khai ở đây + hồ sơ/thoại ở js/story.js (STORY.NPCS + DIALOGUE —
  // xem gói story-npcs.js đi kèm). EXP_LAYOUT_V nâng lên 5: game.js
  // migrateLayoutV10 dịch save theo EXP_V5_MAP6 cho RIÊNG map 6
  // (nấc V4->V5, cùng mẫu nấc V2->V3 của map 1); tọa độ map 6 hardcode
  // ngoài maps.js dịch cùng neo trong cùng lượt tích hợp: bosses.js
  // (sào + bia boss thế giới hang_vuc_tham_xu), alchemy.js (2 điểm
  // huyết sâm map 6).
  var EXP_V5_MAP6 = { dx: 24, dy: 20 };
  (function expandMap6V5() {
    var map = MAPS.map6;
    var OW = map.w, OH = map.h, NW = 176, NH = 160;
    var AX = EXP_V5_MAP6.dx, AY = EXP_V5_MAP6.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải cụm rừng cho đất MỚI (deterministic, cùng thuật toán các vành
    // trước; ô ven cụm luôn phủ đất trước khi rải).
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      function h2(xx, yy) { var n = Math.sin(xx * 127.1 + yy * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); }
      var cx, cy, px, py;
      for (cy = y0 - 3; cy <= y1 + 3; cy += 3) for (cx = x0 - 3; cx <= x1 + 3; cx += 3) {
        if (h2(cx, cy) > 0.45) continue;
        for (py = cy; py < cy + 3; py++) for (px = cx; px < cx + 3; px++) {
          if (px < x0 || px > x1 || py < y0 || py > y1 || inBlock(px, py)) continue;
          var r0 = h2(px, py);
          g[py][px] = r0 < pT ? 'T' : (r0 < pT + pO ? 'o' : '.');
        }
      }
    }
    scatter(0, 0, 175, 19, 0.30, 0.03, 801);      // vành vách bắc: thông già trên vành vực
    scatter(0, 20, 23, 115, 0.26, 0.03, 802);     // sườn tây
    scatter(112, 20, 175, 103, 0.24, 0.03, 803);  // cánh đông ven suối
    scatter(0, 80, 175, 159, 0.32, 0.03, 804);    // rừng vực sâu phía nam (dày, tối)
    // Dọn hành lang quanh các tuyến/công trình sẽ vẽ (chỉ đất mới).
    R(44, 2, 68, 29, '.');       // hành lang bắc: Đài Vọng Vực + đường xuống cổng bắc
    R(24, 8, 44, 20, '.');       // thềm tây bắc + nhánh đường vành
    R(0, 42, 24, 92, '.');       // Trạm Gác Vực + đường xuống thềm tây + đường tây nam
    R(48, 68, 80, 112, '.');     // đường nam + khe vực nối dài + Cầu Đá Vực Sâu
    R(70, 100, 140, 140, '.');   // thềm Đàm U Minh + đầm + bờ nam
    R(104, 34, 175, 110, '.');   // cánh đông: đường suối + chuỗi Suối Linh + Lán Hái Dược
    R(30, 86, 38, 144, '.');     // đường nối bờ tây xuống đường vòng nam
    R(30, 140, 140, 145, '.');   // đường vòng bờ nam
    // NƯỚC: khe vực sông ngầm nối dài về nam từ chân khối cũ, sông
    // ngầm rẽ đông đổ vào Đàm U Minh; chuỗi Suối Linh bậc thang ở
    // cánh đông (2 dòng suối nối 3 hồ phát sáng).
    for (y = 80; y <= 117; y++) { S(60, y, 'W'); S(61, y, 'W'); S(62, y, 'R'); S(63, y, 'R'); S(64, y, 'W'); S(65, y, 'W'); }
    R(62, 118, 95, 121, 'R');                       // sông ngầm rẽ đông
    R(66, 117, 95, 117, 'W'); R(66, 122, 95, 122, 'W'); // 2 bờ vách của khúc rẽ
    R(98, 112, 125, 131, 'R');                      // Đàm U Minh (hồ ngầm phát sáng)
    R(96, 115, 97, 128, 'R'); R(126, 115, 127, 128, 'R');
    R(101, 110, 122, 111, 'R'); R(101, 132, 122, 133, 'R');
    R(132, 44, 141, 51, 'R'); R(134, 42, 139, 43, 'R'); R(134, 52, 139, 53, 'R'); // Suối Linh Đông — hồ trên
    R(143, 52, 144, 61, 'R');                                                    // dòng nối 1
    R(146, 62, 155, 69, 'R'); R(148, 60, 153, 61, 'R'); R(148, 70, 153, 71, 'R'); // hồ giữa
    R(143, 70, 144, 79, 'R');                                                    // dòng nối 2
    R(132, 80, 141, 87, 'R'); R(134, 78, 139, 79, 'R'); R(134, 88, 139, 89, 'R'); // hồ dưới
    // THỀM ĐÁ + CÔNG TRÌNH (mái 'H' chặn, thềm/bậc 'Q' đi được).
    R(47, 4, 64, 9, 'Q');                            // Đài Vọng Vực Bắc
    S(48, 5, 'L'); S(63, 5, 'L');                    // đèn đá 2 đầu đài
    S(55, 5, 'o'); S(56, 5, 'o');                    // bia đá cổ trên đài
    R(28, 12, 35, 17, 'Q');                          // thềm đá tây bắc (điểm nghỉ vành vách)
    S(29, 13, 'L');
    R(5, 46, 14, 52, 'Q');                           // thềm Trạm Gác Vực
    R(7, 47, 10, 48, 'H');                           // Trạm Gác Vực
    S(6, 51, 'L'); S(13, 51, 'L');
    R(118, 50, 127, 55, 'Q');                        // thềm Lán Hái Dược
    R(120, 51, 123, 52, 'H');                        // Lán Hái Dược
    S(119, 54, 'L'); S(126, 54, 'L');
    R(130, 44, 131, 51, 'Q');                        // thềm đá bờ tây hồ Suối Linh trên
    R(156, 62, 157, 69, 'Q');                        // thềm đá bờ đông hồ Suối Linh giữa
    R(92, 104, 130, 109, 'Q');                       // thềm đá bắc Đàm U Minh
    R(104, 105, 108, 107, 'H');                      // Miếu Cổ Đàm U (trên thềm)
    S(93, 105, 'L'); S(129, 105, 'L');
    R(164, 96, 172, 103, 'Q');                       // Đài Vọng Đông
    S(165, 97, 'L'); S(171, 97, 'L');
    S(158, 100, 'T'); S(159, 100, 'T'); S(158, 101, 'T'); S(159, 101, 'T'); // Cổ Thụ Suối Đông (cụm tán 2x2)
    // ĐƯỜNG (mọi tuyến >= 2 ô, nối liền khối cũ và các khu mới).
    R(54, 10, 55, 27, '#');                          // đường bắc: đài -> vành bắc khối cũ
    R(54, 15, 55, 18, 'Q');                          // bậc đá đoạn xuống dốc vành bắc
    R(36, 14, 53, 15, '#');                          // nhánh vành: thềm tây bắc -> đường bắc
    R(2, 54, 23, 55, '#');                           // đường tây: mép tây khối cũ -> Trạm Gác Vực
    R(10, 53, 11, 84, '#');                          // đường xuống thềm tây
    R(10, 62, 11, 65, 'Q'); R(10, 76, 11, 79, 'Q');  // 2 đoạn bậc đá dốc tây
    R(10, 84, 55, 85, '#');                          // đường tây nam: thềm tây -> trục nam
    R(33, 86, 34, 141, '#');                         // đường nối bờ tây xuống đường vòng nam
    R(54, 72, 55, 99, '#');                          // đường nam chính: cổng nam khối cũ -> cầu vực sâu
    R(54, 90, 55, 93, 'Q');                          // bậc đá đoạn xuống vực
    R(50, 100, 57, 101, '#');                        // thềm chờ cầu (bờ tây)
    R(58, 100, 67, 101, 'Q');                        // CẦU ĐÁ VỰC SÂU qua khe vực nối dài
    R(68, 100, 76, 101, '#');                        // thềm chờ cầu (bờ đông)
    R(74, 102, 75, 107, '#');                        // nhánh cầu -> thềm Đàm U Minh
    R(75, 107, 91, 108, '#');                        // lối vào thềm đầm
    R(132, 89, 133, 142, '#');                       // đường bờ đông đầm: thềm hồ dưới -> đường vòng nam
    R(108, 58, 150, 59, '#');                        // đường suối đông: mép đông khối cũ -> hồ giữa
    R(122, 56, 123, 57, '#');                        // ngõ Lán Hái Dược -> đường suối đông
    R(149, 60, 150, 88, '#');                        // đường xuống hồ Suối Linh dưới
    R(133, 88, 150, 89, '#');                        // lối qua mép nam hồ dưới (đè viền suối = hiệu ứng cầu)
    R(133, 99, 163, 100, '#');                       // nhánh Đài Vọng Đông
    R(33, 142, 133, 143, '#');                       // đường vòng bờ nam
    R(96, 134, 131, 135, '#');                       // lối bờ nam Đàm U Minh
    // Dọn bãi 3x3 quanh spawn/dược/NPC mới (chỉ gạt T/o/F ở đất mới).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    var V5_SPAWNS = [
      ['khi_mat_do', 34, 6, 'vanh_vach_bac'], ['khi_mat_do', 42, 12, 'vanh_vach_bac'], ['khi_mat_do', 72, 5, 'vanh_vach_bac'],
      ['khi_mat_do', 84, 11, 'vanh_vach_bac'], ['khi_mat_do', 96, 6, 'vanh_vach_bac'], ['khi_mat_do', 124, 8, 'vanh_vach_bac'],
      ['khi_mat_do', 140, 5, 'vanh_vach_bac'], ['khi_mat_do', 158, 10, 'vanh_vach_bac'],
      ['khi_mat_do', 5, 62, 'them_da_tay'], ['khi_mat_do', 16, 66, 'them_da_tay'], ['khi_mat_do', 7, 72, 'them_da_tay'],
      ['khi_mat_do', 19, 76, 'them_da_tay'], ['khi_mat_do', 14, 58, 'them_da_tay'],
      ['lon_mong_sat', 8, 68, 'them_da_tay'], ['lon_mong_sat', 18, 62, 'them_da_tay'], ['lon_mong_sat', 6, 77, 'them_da_tay'],
      ['lon_mong_sat', 20, 70, 'them_da_tay'], ['lon_mong_sat', 12, 74, 'them_da_tay'],
      ['khi_mat_do', 134, 40, 'suoi_linh_dong'], ['khi_mat_do', 152, 46, 'suoi_linh_dong'], ['khi_mat_do', 158, 52, 'suoi_linh_dong'],
      ['khi_mat_do', 136, 76, 'suoi_linh_dong'], ['khi_mat_do', 156, 84, 'suoi_linh_dong'], ['khi_mat_do', 148, 90, 'suoi_linh_dong'],
      ['ran_luc', 144, 48, 'suoi_linh_dong'], ['ran_luc', 142, 66, 'suoi_linh_dong'], ['ran_luc', 160, 68, 'suoi_linh_dong'],
      ['ran_luc', 144, 84, 'suoi_linh_dong'], ['ran_luc', 150, 74, 'suoi_linh_dong'], ['ran_luc', 158, 80, 'suoi_linh_dong'],
      ['soi_rung', 42, 90, 'vuc_sau_nam'], ['soi_rung', 48, 98, 'vuc_sau_nam'], ['soi_rung', 40, 106, 'vuc_sau_nam'],
      ['soi_rung', 50, 110, 'vuc_sau_nam'], ['soi_rung', 84, 90, 'vuc_sau_nam'], ['soi_rung', 90, 98, 'vuc_sau_nam'],
      ['soi_rung', 82, 104, 'vuc_sau_nam'], ['soi_rung', 92, 88, 'vuc_sau_nam'],
      ['soi_rung', 30, 124, 'vuc_sau_nam'], ['soi_rung', 42, 132, 'vuc_sau_nam'], ['soi_rung', 28, 140, 'vuc_sau_nam'],
      ['soi_rung', 48, 146, 'vuc_sau_nam'],
      ['lon_mong_sat', 44, 94, 'vuc_sau_nam'], ['lon_mong_sat', 52, 102, 'vuc_sau_nam'], ['lon_mong_sat', 46, 112, 'vuc_sau_nam'],
      ['lon_mong_sat', 88, 94, 'vuc_sau_nam'], ['lon_mong_sat', 94, 102, 'vuc_sau_nam'], ['lon_mong_sat', 40, 100, 'vuc_sau_nam'],
      ['lon_mong_sat', 80, 100, 'vuc_sau_nam'],
      ['ran_luc', 90, 104, 'dam_u_minh'], ['ran_luc', 98, 105, 'dam_u_minh'], ['ran_luc', 120, 106, 'dam_u_minh'],
      ['ran_luc', 126, 105, 'dam_u_minh'], ['ran_luc', 112, 136, 'dam_u_minh'],
      ['soi_rung', 90, 124, 'dam_u_minh'], ['soi_rung', 92, 128, 'dam_u_minh'], ['soi_rung', 129, 116, 'dam_u_minh'],
      ['soi_rung', 129, 126, 'dam_u_minh'], ['soi_rung', 104, 136, 'dam_u_minh'], ['soi_rung', 118, 136, 'dam_u_minh']
    ];
    var V5_HERBS = [
      [30, 8, 'linh_chi'], [76, 14, 'linh_chi'], [120, 12, 'linh_chi'],
      [16, 50, 'thao_duoc'], [18, 72, 'linh_chi'], [20, 88, 'thao_duoc'],
      [126, 47, 'linh_chi'], [136, 54, 'linh_chi'], [148, 57, 'thao_duoc'],
      [140, 72, 'linh_chi'], [152, 80, 'linh_chi'], [160, 96, 'thao_duoc'],
      [52, 92, 'linh_chi'], [70, 96, 'thao_duoc'], [88, 100, 'linh_chi'],
      [100, 103, 'linh_chi'], [124, 110, 'linh_chi'], [136, 124, 'linh_chi'],
      [60, 130, 'thao_duoc'], [44, 138, 'linh_chi'], [100, 140, 'linh_chi'],
      [150, 140, 'thao_duoc'], [68, 102, 'linh_chi'], [24, 140, 'linh_chi']
    ];
    var V5_NPCS = [
      { id: 'ngo_truong_son', x: 11, y: 50, sprite: 'linh_gac', name: 'Ngô Trường Sơn', role: 'Lính gác vực ở Trạm Gác Vực' },
      { id: 'ly_thu_hang', x: 125, y: 54, sprite: 'giu_mieu', name: 'Lý Thu Hằng', role: 'Người hái dược ở Lán Hái Dược' },
      { id: 'ha_van_dinh', x: 57, y: 99, sprite: 'tho_san_ha', name: 'Hà Văn Đỉnh', role: 'Thợ đá giữ Cầu Đá Vực Sâu' },
      { id: 'au_duong_thach', x: 110, y: 108, sprite: 'chu_quan', name: 'Âu Dương Thạch', role: 'Ẩn sĩ bên Đàm U Minh' }
    ];
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (p) { clearPatch(p[0], p[1]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // Khoét thông mọi túi đất-mới bị cô lập vào khối cũ (chỉ gạt T/o,
    // cùng thuật toán các bản mở rộng trước).
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    function bfsT(sx, sy) {
      var seen = {}, q = [[sx, sy]];
      if (!walkT(sx, sy)) return seen;
      seen[sx + ',' + sy] = 1;
      while (q.length) {
        var c = q.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && walkT(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    function dvDijkstra(sx, sy, reach) {
      var dist = {}, prev = {}, pq = [[0, sx, sy]];
      dist[sx + ',' + sy] = 0;
      while (pq.length) {
        var bi = 0;
        for (var i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0]) bi = i;
        var cur = pq.splice(bi, 1)[0], cx2 = cur[1], cy2 = cur[2], ck = cx2 + ',' + cy2;
        if (reach[ck]) {
          var path = [], k2 = ck;
          while (prev[k2]) { var pp = prev[k2]; path.push([pp[0], pp[1]]); k2 = pp[0] + ',' + pp[1]; }
          return path;
        }
        if (dist[ck] !== cur[0]) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cx2 + d[0], ny = cy2 + d[1];
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny)) return;
          var ch = g[ny][nx], w = (ch === 'T' || ch === 'o') ? 1 : (blockedT[ch] ? 1e6 : 0), nk = nx + ',' + ny, nd = cur[0] + w;
          if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = [cx2, cy2]; pq.push([nd, nx, ny]); }
        });
      }
      return null;
    }
    (function carveOrphans() {
      for (var guard = 0; guard < 4000; guard++) {
        var reach = bfsT(AX + 40, AY + 28);
        var orphan = null;
        for (var yy = 0; yy < NH && !orphan; yy++) for (var xx = 0; xx < NW; xx++) {
          if (inBlock(xx, yy) || !walkT(xx, yy) || reach[xx + ',' + yy]) continue;
          orphan = [xx, yy]; break;
        }
        if (!orphan) return;
        var path = dvDijkstra(orphan[0], orphan[1], reach);
        if (!path || !path.length) return;
        path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') g[p[1]][p[0]] = '.'; });
      }
    })();
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 6 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map6') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map6') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'vanh_vach_bac', name: 'Vành Vách Bắc', rects: [[26, 2, 46, 16], [66, 2, 104, 16], [114, 2, 170, 14]], types: ['khi_mat_do'] },
      { id: 'them_da_tay', name: 'Thềm Đá Tây', rects: [[2, 56, 22, 82]], types: ['khi_mat_do', 'lon_mong_sat'] },
      { id: 'suoi_linh_dong', name: 'Suối Linh Đông', rects: [[128, 36, 162, 69], [126, 70, 164, 94]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'vuc_sau_nam', name: 'Vực Sâu Phía Nam', rects: [[36, 84, 53, 114], [78, 84, 95, 106], [24, 116, 53, 152]], types: ['soi_rung', 'lon_mong_sat'] },
      { id: 'dam_u_minh', name: 'Đàm U Minh', rects: [[84, 96, 128, 110], [86, 112, 95, 132], [96, 134, 128, 138], [129, 112, 133, 130]], types: ['ran_luc', 'soi_rung'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (p) { map.herbs.push({ x: p[0], y: p[1], item: p[2] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 54, y: 10, label: 'Đài Vọng Vực Bắc' },
      { sprite: 'sign', x: 30, y: 14, label: 'Vành Vách Bắc' },
      { sprite: 'sign', x: 13, y: 45, label: 'Trạm Gác Vực' },
      { sprite: 'sign', x: 13, y: 64, label: 'Thềm Đá Tây — Xuống Vực Sâu' },
      { sprite: 'sign', x: 124, y: 49, label: 'Lán Hái Dược' },
      { sprite: 'sign', x: 140, y: 43, label: 'Suối Linh Đông' },
      { sprite: 'sign', x: 56, y: 98, label: 'Cầu Đá Vực Sâu' },
      { sprite: 'sign', x: 103, y: 104, label: 'Đàm U Minh — Miếu Cổ' },
      { sprite: 'sign', x: 58, y: 88, label: 'Nam: Vực Sâu Thâm Xứ' },
      { sprite: 'sign', x: 166, y: 95, label: 'Đài Vọng Đông' },
      { sprite: 'sign', x: 157, y: 102, label: 'Cổ Thụ Suối Đông' },
      { sprite: 'sign', x: 36, y: 141, label: 'Đường Vòng Bờ Nam' }
    );
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map6-bg-v9.webp';
  })();


  // ================= TÍCH HỢP V5 — MAP 7 (gói tmp/map-packages/map7) =================
  // ---- MỞ RỘNG MAP 7 V5 — GẤP 10 DIỆN TÍCH GỐC (gói xưởng map xuyên
  // đêm, lệnh Bui 23:04 ngày 2026-10-30 "thiết kế lại các map, từ giờ
  // đến sáng tất cả phải xong"; theo mục chương trình map 2–14 ghi
  // 22:26): map 7 "Thập Vạn Đại Sơn · Chi Đỉnh" từ 80x56 ô (4.480, đã
  // gồm lõi gốc 56x40 = 2.240 ô) lên 160x140 ô (22.400 ô = đúng 10x
  // diện tích map GỐC). Toàn bộ khối 80x56 hiện có GIỮ NGUYÊN TỪNG Ô,
  // neo tại (+40,+24) trong khung mới — đỉnh (đài đá + bia cổ + sào
  // Phong Đỉnh Đài) tựa phía bắc, đất mới mở xuống phía nam (bậc đá
  // xuống Biển Mây + Đài Ngắm Mây ở rìa nam), phía tây (Rừng Thông Cổ
  // + Linh Tuyền + Miếu Phong Thần + Lán Hái Dược) và phía đông (Tuyết
  // Nguyên Đông + Đài Tuyết). Phía bắc của cổng Trúc Cơ: Thềm Vọng Vân
  // + Chòi Gác Cổng + Tiểu Đài Chi Đỉnh ở rìa bắc trên biển mây.
  // Địa hình kể chuyện theo tuyến: cổng nam -> trục đường đá (bậc 'Q'
  // ở 2 điểm dốc) xuống thềm mây nam; cổng bắc -> thềm vọng vân ->
  // tiểu đài; nhánh tây qua linh tuyền tới miếu; nhánh đông lên đài
  // tuyết (đoạn bậc đá). Mạng đường '#' rộng 2 ô nối liền vòng: trục
  // nam + đường vòng nam + 2 trục dọc tây/đông + nhánh tây/đông +
  // trục bắc — mọi nhánh đều kết thúc ở đài/miếu/lán/đài tuyết.
  // Khu quái theo thang map 7 (Luyện Khí tầng 9 viên mãn, eliteChance
  // 0,40 giữ nguyên), càng xa đỉnh càng nặng: thông cổ (khỉ+sói) ->
  // ven linh tuyền (khỉ) -> biển mây nam (khỉ+lợn) -> tuyết nguyên
  // (sói+lợn) -> thẳm vân hải góc đông nam (sói+lợn, xa nhất). Tổng
  // spawn 36 -> 153 (mật độ 0,68/100 ô = 85% mật độ V10 như chuẩn).
  // EXP_LAYOUT_V nâng lên 5: game.js migrateLayoutV10 cần thêm nấc
  // V4->V5 dịch save theo EXP_V5_MAP7 cho RIÊNG map 7 (xem README của
  // gói). Tọa độ cứng ngoài maps.js phải dịch cùng neo (+40,+24):
  // bosses.js (sào Phong Đỉnh Đài map 7), clouds.js (tâm sương map 7),
  // test-smoke.js (khối ds38) — danh sách đầy đủ trong README.
  var EXP_V5_MAP7 = { dx: 40, dy: 24 };
  (function expandMap7V5() {
    var map = MAPS.map7;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V5_MAP7.dx, AY = EXP_V5_MAP7.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Viền ngoài = vách đá trên biển mây (không cổng ở mép khung mới —
    // cả 2 cổng của map 7 nằm trong khối cũ).
    R(0, 0, NW - 1, 0, 'W'); R(0, NH - 1, NW - 1, NH - 1, 'W');
    R(0, 1, 0, NH - 2, 'W'); R(NW - 1, 1, NW - 1, NH - 2, 'W');
    // -- Rải sinh cảnh đất MỚI theo vùng (cụm có nhịp, tất định) --
    function grove(x0, y0, x1, y1, maskP, fillP, rockP, salt) {
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || g[yy][xx] !== '.') continue;
        var gm = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (gm < maskP && h1 < fillP) g[yy][xx] = 'T';
        else if (h1 > 1 - rockP) g[yy][xx] = 'o';
      }
    }
    function sprinkle(x0, y0, x1, y1, pO, pT, salt) {
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || g[yy][xx] !== '.') continue;
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (h1 < pO) g[yy][xx] = 'o';
        else if (h1 > 1 - pT) g[yy][xx] = 'T';
      }
    }
    grove(1, 1, 38, 79, 0.62, 0.66, 0.03, 701);        // tây: Rừng Thông Cổ dày
    sprinkle(120, 1, 158, 79, 0.15, 0.05, 702);        // đông: Tuyết Nguyên — đá tuyết nhiều, thông thưa
    sprinkle(1, 1, 158, 23, 0.10, 0.03, 703);          // bắc: thềm cao thưa đá (gần đỉnh, tuyết nhẹ)
    grove(1, 80, 158, 138, 0.20, 0.55, 0.04, 704);     // nam: đồng mây thưa cụm thông nhỏ
    sprinkle(40, 80, 119, 138, 0.05, 0.0, 705);        // nam giữa: rải đá lẻ trên thềm mây
    // -- Nước: Linh Tuyền phía tây (hồ nhỏ cạnh đường tây) --
    R(24, 50, 31, 55, 'R');
    // -- Đài / thềm đá (điểm nhấn đúng dòng di chuyển) --
    R(74, 4, 85, 9, 'Q');                              // Tiểu Đài Chi Đỉnh (rìa bắc)
    S(74, 4, 'o'); S(85, 4, 'o'); S(74, 9, 'o'); S(85, 9, 'o');
    R(72, 14, 87, 19, 'Q');                            // Thềm Vọng Vân (sân trước cổng Trúc Cơ)
    S(72, 14, 'L'); S(87, 14, 'L');                    // đèn đá 2 góc thềm
    R(140, 37, 155, 52, 'Q');                          // Đài Tuyết Đông
    S(140, 37, 'o'); S(155, 37, 'o'); S(140, 52, 'o'); S(155, 52, 'o');
    R(5, 64, 10, 68, 'Q');                             // Miếu Phong Thần (thềm tây nam)
    S(5, 64, 'o'); S(10, 64, 'o'); S(5, 68, 'o'); S(10, 68, 'o');
    R(60, 133, 77, 138, 'Q');                          // Đài Ngắm Mây (rìa nam trên biển mây)
    S(60, 133, 'o'); S(77, 133, 'o'); S(60, 138, 'o'); S(77, 138, 'o');
    // -- Nhà thật: Chòi Gác Cổng (bắc) + Lán Hái Dược (tây) --
    R(89, 15, 91, 17, 'H'); S(88, 16, 'Q');            // chòi + thềm cửa phía tây
    R(14, 53, 16, 55, 'H'); S(15, 56, 'Q');            // lán + bậc cửa phía nam
    // -- Mạng đường (# rộng 2 ô) + bậc đá 'Q' ở điểm dốc --
    R(78, 10, 79, 23, '#');                            // trục bắc: tiểu đài -> thềm -> mép khối (cổng)
    R(78, 20, 79, 22, 'Q');                            // bậc đá lên sân cổng
    R(4, 59, 39, 60, '#');                             // nhánh tây: mép khối -> rừng thông/linh tuyền
    S(15, 57, '#'); S(15, 58, '#');                    // lối vào Lán Hái Dược
    R(7, 61, 8, 63, '#');                              // lối xuống Miếu Phong Thần
    R(120, 44, 139, 45, '#');                          // nhánh đông: mép khối -> đài tuyết
    R(132, 44, 135, 45, 'Q');                          // đoạn bậc đá lên đài tuyết
    R(68, 80, 69, 129, '#');                           // trục nam: mép khối -> đường vòng nam
    R(68, 92, 69, 95, 'Q'); R(68, 110, 69, 113, 'Q');  // 2 đoạn bậc đá xuống thềm mây
    R(20, 61, 21, 129, '#');                           // trục dọc tây: nhánh tây -> vòng nam
    R(138, 46, 139, 129, '#');                         // trục dọc đông: nhánh đông -> vòng nam
    R(20, 130, 139, 131, '#');                         // đường vòng nam
    S(68, 132, '#'); S(69, 132, '#');                  // lối vào Đài Ngắm Mây
    // -- Khu quái mới: dọn vật chắn trong rect (giữ đường/đài/nước/nhà) --
    var V5_ZONES = [
      { id: 'thong_co_tay', name: 'Khu Thông Cổ Tây', rects: [[3, 42, 34, 57]], types: ['khi_mat_do', 'soi_rung'], n: 22 },
      { id: 'ven_linh_tuyen', name: 'Khu Ven Linh Tuyền', rects: [[3, 70, 32, 90]], types: ['khi_mat_do'], n: 14 },
      { id: 'tuyet_nguyen_dong', name: 'Khu Tuyết Nguyên Đông', rects: [[122, 26, 157, 64]], types: ['soi_rung', 'lon_mong_sat'], n: 30 },
      { id: 'bien_may_nam', name: 'Khu Biển Mây Nam', rects: [[36, 84, 120, 122]], types: ['khi_mat_do', 'lon_mong_sat'], n: 30 },
      { id: 'tham_van_hai', name: 'Khu Thẳm Vân Hải', rects: [[84, 124, 154, 137]], types: ['soi_rung', 'lon_mong_sat'], n: 21 }
    ];
    V5_ZONES.forEach(function (z) {
      z.rects.forEach(function (r) {
        for (var yy = r[1]; yy <= r[3]; yy++) for (var xx = r[0]; xx <= r[2]; xx++) {
          if (inBlock(xx, yy)) continue;
          if (g[yy][xx] === 'T' || g[yy][xx] === 'o') g[yy][xx] = '.';
        }
      });
    });
    // -- NPC mới (đứng cạnh trạm của mình, không giữa đường) --
    var V5_NPCS = [
      { id: 'nguoi_gac_cong_dinh', x: 84, y: 17, sprite: 'linh_gac', name: 'Cố Trường Thanh', role: 'Người gác cổng Trúc Cơ ở Chi Đỉnh' },
      { id: 'co_hai_duoc', x: 17, y: 56, sprite: 'giu_mieu', name: 'Lâm Thảo Nhi', role: 'Tu sĩ hái dược ở Lán Hái Dược' },
      { id: 'kiem_tu_ngam_may', x: 64, y: 135, sprite: 'hoc_tro', name: 'Giang Hàn', role: 'Đệ tử luyện kiếm ở Đài Ngắm Mây' }
    ];
    // -- Dọn bãi 3x3 quanh NPC (chỉ gạt T/o/F) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = g[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') g[yy][xx] = '.';
      }
    }
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // -- Khoét thông túi đất cô lập trong đất mới: gán nhãn thành
    // phần liên thông của ô đi được; thành phần chính = thành phần
    // chứa khối cũ. Mọi thành phần khác ở ĐẤT MỚI được nối về thành
    // phần chính bằng tuyến rẻ nhất qua T/o (chi phí T=7, o=11) tính
    // bằng MỘT lần Dijkstra đa nguồn từ thành phần chính (không đụng
    // nhà/nước/vách, không sửa ô trong khối cũ). --
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    var comp = [], nComp = 0, xx2, yy2;
    for (yy2 = 0; yy2 < NH; yy2++) { var crow = []; for (xx2 = 0; xx2 < NW; xx2++) crow.push(-1); comp.push(crow); }
    var compCells = [];
    for (yy2 = 0; yy2 < NH; yy2++) for (xx2 = 0; xx2 < NW; xx2++) {
      if (!walkT(xx2, yy2) || comp[yy2][xx2] >= 0) continue;
      var cid = nComp++, cells = [], q2 = [[xx2, yy2]];
      comp[yy2][xx2] = cid;
      while (q2.length) {
        var cc = q2.pop(); cells.push(cc);
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var ax3 = cc[0] + d[0], ay3 = cc[1] + d[1];
          if (ax3 < 0 || ay3 < 0 || ax3 >= NW || ay3 >= NH) return;
          if (comp[ay3][ax3] >= 0 || !walkT(ax3, ay3)) return;
          comp[ay3][ax3] = cid; q2.push([ax3, ay3]);
        });
      }
      compCells.push(cells);
    }
    var mainComp = comp[AY + 46][AX + 31]; // ô start trong khối cũ (đi được chắc chắn)
    var distC = {}, prevC = {}, heapC = [];
    function lessC(a, b) { return a[0] < b[0]; }
    function pushC(d, cx, cy) { heapC.push([d, cx, cy]); var i = heapC.length - 1; while (i > 0) { var p = (i - 1) >> 1; if (!lessC(heapC[i], heapC[p])) break; var t = heapC[i]; heapC[i] = heapC[p]; heapC[p] = t; i = p; } }
    function popC() { var top = heapC[0], last = heapC.pop(); if (heapC.length) { heapC[0] = last; var i = 0; for (;;) { var l = i * 2 + 1, r = l + 1, m = i; if (l < heapC.length && lessC(heapC[l], heapC[m])) m = l; if (r < heapC.length && lessC(heapC[r], heapC[m])) m = r; if (m === i) break; var t = heapC[i]; heapC[i] = heapC[m]; heapC[m] = t; i = m; } } return top; }
    compCells[mainComp].forEach(function (c) { var k = c[0] + ',' + c[1]; if (distC[k] === undefined) { distC[k] = 0; pushC(0, c[0], c[1]); } });
    while (heapC.length) {
      var cur = popC(), d0 = cur[0], cx0 = cur[1], cy0 = cur[2], k0 = cx0 + ',' + cy0;
      if (d0 !== distC[k0]) continue;
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
        var nx = cx0 + d[0], ny = cy0 + d[1];
        if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) return;
        var ch = g[ny][nx], cost;
        if (!blockedT[ch]) cost = 1;
        else if (ch === 'T') cost = 7;
        else if (ch === 'o') cost = 11;
        else return;
        var nk = nx + ',' + ny, nd = d0 + cost;
        if (distC[nk] === undefined || nd < distC[nk]) { distC[nk] = nd; prevC[nk] = k0; pushC(nd, nx, ny); }
      });
    }
    for (var ci = 0; ci < nComp; ci++) {
      if (ci === mainComp) continue;
      var cellsC = compCells[ci];
      var touchesNew = false, best = null, bestD = Infinity;
      for (var i2 = 0; i2 < cellsC.length; i2++) {
        var c2 = cellsC[i2];
        if (!inBlock(c2[0], c2[1])) touchesNew = true;
        var dd = distC[c2[0] + ',' + c2[1]];
        if (dd !== undefined && dd < bestD) { bestD = dd; best = c2; }
      }
      if (!touchesNew || !best) continue; // túi nằm trọn trong khối cũ: giữ nguyên như bản hiện hành
      var kk = best[0] + ',' + best[1], guard = 0;
      while (prevC[kk] && guard++ < 100000) {
        var pp = kk.split(','), px = +pp[0], py = +pp[1];
        if (!inBlock(px, py) && blockedT[g[py][px]]) g[py][px] = '.';
        kk = prevC[kk];
      }
    }
    // -- Chọn spawn tất định trong khu mới (luật audit L2/L3/L4): chỉ
    // ô '.' trong rect khu, cách spawn khác >= 2 Chebyshev, cách điểm
    // an toàn (cổng/điểm rơi/start/sào/NPC) >= 5, hộp lang thang +-4
    // không chứa điểm rơi/start. --
    var ENTRIES5 = [[71, 70], [72, 70], [79, 33], [80, 33]]; // start + điểm rơi map6/map8 (đã dịch neo)
    var safe5 = ENTRIES5.concat([[78, 41]]); // + tâm sào Phong Đỉnh Đài (đã dịch neo)
    (map.portals || []).forEach(function (p) { safe5.push([p.x + AX, p.y + AY]); });
    V5_NPCS.forEach(function (n) { safe5.push([n.x, n.y]); });
    // TÍCH HỢP 31/10 (đội tích hợp sửa bản đã dán, gói giữ nguyên): scatter
    // của gói quên tính BIỂN chỉ đường — 2 spawn vành rơi cách biển 1-2 ô,
    // vi phạm luật dự án "spawn cách biển >= 3 Chebyshev". Bổ sung tập
    // biển (biển lõi đã dịch neo + 12 biển vành sắp đẩy ở cuối khối) và
    // kiểm >= 3 trong spawnOK.
    var signs5 = [];
    (map.props || []).forEach(function (pr) { if (pr.sprite === 'sign') signs5.push([pr.x + AX, pr.y + AY]); });
    [[80, 11], [80, 21], [36, 57], [28, 58], [11, 66], [23, 75], [124, 47], [138, 42], [66, 100], [66, 90], [100, 128], [70, 128]].forEach(function (s2) { signs5.push(s2); });
    var taken5 = (map.monsters || []).map(function (m) { return [m.x + AX, m.y + AY]; });
    function cheb5(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
    function spawnOK(cx, cy) {
      if (g[cy][cx] !== '.') return false;
      for (var i = 0; i < safe5.length; i++) if (cheb5(cx, cy, safe5[i][0], safe5[i][1]) < 5) return false;
      for (var s9 = 0; s9 < signs5.length; s9++) if (cheb5(cx, cy, signs5[s9][0], signs5[s9][1]) < 3) return false;
      for (var j = 0; j < taken5.length; j++) if (cheb5(cx, cy, taken5[j][0], taken5[j][1]) < 2) return false;
      for (var e = 0; e < ENTRIES5.length; e++) {
        if (Math.abs(cx - ENTRIES5[e][0]) <= 4 && Math.abs(cy - ENTRIES5[e][1]) <= 4) return false;
      }
      return true;
    }
    var V5_SPAWNS = [];
    V5_ZONES.forEach(function (z, zi) {
      var cells = [], cx2, cy2;
      z.rects.forEach(function (r) {
        for (cy2 = r[1]; cy2 <= r[3]; cy2++) for (cx2 = r[0]; cx2 <= r[2]; cx2++) cells.push([cx2, cy2]);
      });
      var salt = 7300 + zi * 131;
      cells.sort(function (a, b) { return hash01(a[0] * 3 + salt, a[1] * 7) - hash01(b[0] * 3 + salt, b[1] * 7); });
      var picked = 0;
      for (var i = 0; i < cells.length && picked < z.n; i++) {
        var c = cells[i];
        if (!spawnOK(c[0], c[1])) continue;
        V5_SPAWNS.push({ type: z.types[picked % z.types.length], x: c[0], y: c[1], zone: z.id });
        taken5.push([c[0], c[1]]);
        picked++;
      }
      z.picked = picked;
    });
    // -- Chọn dược mới tất định theo vùng (ô '.', cách spawn >= 2) --
    var V5_HERB_AREAS = [
      { r: [64, 10, 95, 23], item: 'linh_chi', n: 4, salt: 741 },
      { r: [4, 44, 33, 57], item: 'thao_duoc', n: 5, salt: 742 },
      { r: [4, 70, 31, 89], item: 'thao_duoc', n: 5, salt: 743 },
      { r: [123, 28, 157, 63], item: 'linh_chi', n: 5, salt: 744 },
      { r: [38, 86, 118, 120], item: 'linh_chi', n: 4, salt: 745 },
      { r: [86, 125, 150, 136], item: 'thao_duoc', n: 3, salt: 746 }
    ];
    var V5_HERBS = [];
    V5_HERB_AREAS.forEach(function (ha) {
      var cells = [], cx3, cy3;
      for (cy3 = ha.r[1]; cy3 <= ha.r[3]; cy3++) for (cx3 = ha.r[0]; cx3 <= ha.r[2]; cx3++) cells.push([cx3, cy3]);
      cells.sort(function (a, b) { return hash01(a[0] * 5 + ha.salt, a[1] * 11) - hash01(b[0] * 5 + ha.salt, b[1] * 11); });
      var got = 0;
      for (var i = 0; i < cells.length && got < ha.n; i++) {
        var c = cells[i];
        if (g[c[1]][c[0]] !== '.') continue;
        var okH = true;
        for (var j = 0; j < taken5.length; j++) if (cheb5(c[0], c[1], taken5[j][0], taken5[j][1]) < 2) { okH = false; break; }
        if (okH) for (var k = 0; k < V5_HERBS.length; k++) if (cheb5(c[0], c[1], V5_HERBS[k].x, V5_HERBS[k].y) < 2) { okH = false; break; }
        if (!okH) continue;
        V5_HERBS.push({ x: c[0], y: c[1], item: ha.item });
        got++;
      }
      ha.got = got;
    });
    V5_HERBS.forEach(function (hb) { clearPatch(hb.x, hb.y); });
    // -- Dịch toàn bộ nội dung cũ của map 7 theo neo (+40,+24) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start); shPt(map.well); shPt(map.bossSpawn); shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 6/8 KHÔNG đổi hình học
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 7 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map7') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map7') { p.tx += AX; p.ty += AY; } });
    });
    // -- Đẩy nội dung mới --
    V5_ZONES.forEach(function (z) { map.zones.push({ id: z.id, name: z.name, rects: z.rects, types: z.types }); });
    V5_SPAWNS.forEach(function (s) { map.monsters.push(s); });
    V5_HERBS.forEach(function (hb) { map.herbs.push(hb); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 80, y: 11, label: 'Tiểu Đài Chi Đỉnh' },
      { sprite: 'sign', x: 80, y: 21, label: 'Thềm Vọng Vân · Chòi Gác Cổng' },
      { sprite: 'sign', x: 36, y: 57, label: 'Khu Thông Cổ Tây' },
      { sprite: 'sign', x: 28, y: 58, label: 'Linh Tuyền' },
      { sprite: 'sign', x: 11, y: 66, label: 'Miếu Phong Thần' },
      { sprite: 'sign', x: 23, y: 75, label: 'Khu Ven Linh Tuyền' },
      { sprite: 'sign', x: 124, y: 47, label: 'Khu Tuyết Nguyên Đông' },
      { sprite: 'sign', x: 138, y: 42, label: 'Đài Tuyết Đông' },
      { sprite: 'sign', x: 66, y: 100, label: 'Bậc Đá Xuống Biển Mây' },
      { sprite: 'sign', x: 66, y: 90, label: 'Khu Biển Mây Nam' },
      { sprite: 'sign', x: 100, y: 128, label: 'Khu Thẳm Vân Hải' },
      { sprite: 'sign', x: 70, y: 128, label: 'Đài Ngắm Mây · Biển Mây Nam' }
    );
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map7-bg-v9.webp';
  })();


  // ================= TÍCH HỢP V5 — MAP 8 (gói tmp/map-packages/map8) =================
  // ---- MAP 8 MỞ RỘNG GẤP 10 DIỆN TÍCH GỐC (gói xưởng map xuyên đêm,
  // lệnh Bui 23:04 ngày 2026-10-30 — GÓI GIAO RIÊNG, đội tích hợp dán
  // nguyên khối này vào js/maps.js NGAY SAU khối expandMap2V4, trước
  // hàm isBlockedIn; đồng thời: (1) nâng EXP_LAYOUT_V lên 5, (2) thêm
  // EXP_V5_MAP8 vào api export của maps.js, (3) thêm nấc V4->V5 vào
  // migrateLayoutV10 trong js/game.js theo mẫu nấc V3->V4 — chỉ nhân
  // vật đang ở map8 mới dịch thêm (+60,+38), (4) dịch tọa độ cứng map8
  // trong js/bosses.js: lair {24,14}->{84,52}, stele {25,14}->{85,52},
  // lair {60,43}->{120,81}, stele {61,43}->{121,81}. Nếu một gói map
  // khác đã chiếm số phiên bản 5 thì đội tích hợp đổi số tương ứng,
  // neo (+60,+38) và nội dung khối này giữ nguyên.) ----
  // Map 8 Sơn Trung Vân Hải: lõi hiện hành 88x60 (đã gồm nấc V10) giữ
  // nguyên TỪNG Ô, neo tại (+60,+38) trong khung mới 208x136 = 28.288 ô
  // = 10,04 lần diện tích gốc 64x44 (2.816 ô). Đất mới kể chuyện biển
  // mây theo 4 cánh quanh lõi: BẮC — đường leo bậc đá lên Vọng Hải Đài
  // (thềm đá tròn trên đỉnh, đèn đá 4 góc, vách đá sau lưng, thông cổ);
  // TÂY — Sườn Gác Mây: suối mây chảy dọc, cầu đá qua suối, Lán Gác Mây
  // có người canh mây; ĐÔNG — Thung Hồ Mây: suối đổ vào hồ mây lớn, bãi
  // thềm ngắm hồ + Chòi Vọng Hồ; NAM — Trạm Mây (đình nghỉ chân trên
  // thềm đá, người giữ trạm) rồi đường bậc đá xuống Rừng Thông Chân Mây
  // (quái đất mạnh nhất map). Đường vòng Vân Hải >= 2 ô nối liền 4 cánh
  // + 2 cổng lõi; khu quái mới theo thang Trúc Cơ của map, càng xa lõi
  // càng nặng; dược dùng đúng 3 item sẵn có của map (long_tien_thao,
  // linh_chi, tu_linh_qua). NPC mới khai ở đây + hồ sơ/thoại đề xuất
  // trong README của gói (STORY.NPCS + DIALOGUE trong js/story.js).
  var EXP_V5_MAP8 = { dx: 60, dy: 38 };
  (function expandMap8V5() {
    var map = MAPS.map8;
    var OW = map.w, OH = map.h, NW = 208, NH = 136;
    var AX = EXP_V5_MAP8.dx, AY = EXP_V5_MAP8.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải cụm thông/đá cho đất MỚI (tất định, cùng thuật toán các vành
    // trước; cụm 3x3 theo băm, ô ven cụm phủ kín trước khi rải).
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      function h2(xx, yy) { var n = Math.sin(xx * 127.1 + yy * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); }
      var cx, cy, px, py;
      for (cy = y0 - 3; cy <= y1 + 3; cy += 3) for (cx = x0 - 3; cx <= x1 + 3; cx += 3) {
        if (h2(cx, cy) > 0.45) continue;
        for (py = cy; py < cy + 3; py++) for (px = cx; px < cx + 3; px++) {
          if (px < x0 || px > x1 || py < y0 || py > y1 || inBlock(px, py)) continue;
          var r0 = h2(px, py);
          g[py][px] = r0 < pT ? 'T' : (r0 < pT + pO ? 'o' : '.');
        }
      }
    }
    scatter(0, 0, 207, 27, 0.26, 0.03, 801);       // cao nguyên bắc quanh Vọng Hải Đài
    scatter(0, 28, 51, 135, 0.30, 0.03, 802);      // sườn tây
    scatter(156, 0, 207, 50, 0.24, 0.03, 803);     // gò đông bắc
    scatter(156, 96, 207, 135, 0.26, 0.03, 804);   // đất đông nam
    scatter(0, 107, 207, 135, 0.34, 0.03, 805);    // Rừng Thông Chân Mây phía nam
    scatter(60, 28, 147, 37, 0.12, 0.02, 806);     // dải thưa trên lõi
    scatter(60, 98, 147, 104, 0.12, 0.02, 807);    // dải thưa dưới lõi
    scatter(148, 51, 207, 107, 0.20, 0.03, 808);   // thung đông (hồ/suối vẽ đè sau)
    scatter(54, 38, 59, 97, 0.18, 0.02, 809);      // dải hẹp sát tây lõi
    // Dọn hành lang quanh các tuyến/công trình sẽ vẽ (chỉ đất mới).
    R(90, 4, 116, 18, '.');      // thềm Vọng Hải Đài + vành quanh thềm
    R(100, 17, 105, 37, '.');    // hành lang đường leo bắc
    R(50, 27, 157, 32, '.');     // hành lang đường vòng bắc
    R(50, 27, 55, 107, '.');     // hành lang đường vòng tây
    R(24, 55, 55, 72, '.');      // đường tây + bãi Lán Gác Mây
    R(146, 60, 207, 70, '.');    // hành lang đường đông
    R(158, 30, 166, 72, '.');    // hành lang suối đông
    R(160, 68, 204, 100, '.');   // bồn Hồ Mây + bãi quanh hồ
    R(90, 110, 116, 122, '.');   // thềm Trạm Mây
    R(100, 97, 105, 135, '.');   // hành lang đường nam
    R(50, 103, 157, 108, '.');   // hành lang đường vòng nam
    R(42, 34, 47, 88, '.');      // hành lang suối tây
    R(14, 14, 22, 22, '.');      // ao mây tây bắc
    R(166, 112, 182, 124, '.');  // ao mây đông nam
    // NƯỚC / BIỂN MÂY: suối tây chảy dọc sườn, suối đông đổ vào Hồ Mây,
    // 2 ao mây nhỏ ở 2 góc xa.
    R(44, 36, 45, 86, 'R');                        // suối mây tây
    R(161, 34, 162, 69, 'R');                      // suối đông
    R(176, 72, 198, 94, 'R');                      // Hồ Mây
    R(177, 71, 197, 71, 'R'); R(177, 95, 197, 95, 'R'); R(175, 76, 175, 90, 'R');
    R(16, 16, 20, 20, 'R'); R(15, 17, 15, 19, 'R'); R(21, 17, 21, 19, 'R');   // ao mây tây bắc
    R(170, 116, 178, 121, 'R'); R(169, 117, 169, 120, 'R'); R(179, 117, 179, 120, 'R'); // ao mây đông nam
    // THỀM ĐÁ + CÔNG TRÌNH.
    R(92, 6, 114, 16, 'Q');                        // thềm Vọng Hải Đài
    S(93, 7, 'L'); S(113, 7, 'L'); S(93, 15, 'L'); S(113, 15, 'L');  // đèn đá 4 góc thềm
    S(90, 6, 'T'); S(116, 6, 'T'); S(90, 16, 'T'); S(116, 16, 'T');  // thông cổ trấn 4 góc ngoài
    R(84, 2, 96, 2, 'W'); R(104, 2, 116, 2, 'W'); R(120, 2, 124, 2, 'W'); // vách đá sau lưng đài (đứt đoạn)
    R(164, 84, 172, 90, 'Q');                      // thềm ngắm Hồ Mây
    R(166, 60, 168, 61, 'H'); S(167, 62, 'Q');     // Chòi Vọng Hồ + bậc cửa
    R(27, 57, 29, 58, 'H'); S(28, 59, 'Q');        // Lán Gác Mây + bậc cửa
    [[25, 60], [26, 60], [30, 60], [31, 60]].forEach(function (p) { S(p[0], p[1], 'F'); }); // rào lán
    R(92, 112, 114, 120, 'Q');                     // thềm Trạm Mây
    R(94, 114, 96, 115, 'H');                      // đình Trạm Mây (mái chặn, thềm là bậc cửa)
    S(93, 113, 'L'); S(113, 113, 'L');             // đèn đá đầu thềm trạm
    // ĐƯỜNG (mọi tuyến >= 2 ô, nối liền khối cũ và các khu mới).
    R(102, 17, 103, 37, '#');                      // đường leo bắc: mép bắc lõi -> thềm đài
    R(102, 21, 103, 24, 'Q'); R(102, 29, 103, 32, 'Q'); // 2 đoạn bậc đá leo dốc
    R(52, 29, 155, 30, '#');                       // đường vòng bắc
    R(52, 30, 53, 105, '#');                       // đường vòng tây
    R(154, 30, 155, 105, '#');                     // đường vòng đông
    R(52, 105, 155, 106, '#');                     // đường vòng nam
    R(30, 65, 52, 66, '#');                        // đường tây: vòng tây -> Lán Gác Mây
    R(148, 65, 167, 66, '#');                      // đường đông: mép đông lõi -> Chòi Vọng Hồ
    R(166, 67, 167, 83, '#');                      // lối ven hồ xuống thềm ngắm
    R(102, 98, 103, 111, '#');                     // đường nam chính: mép nam lõi -> Trạm Mây
    R(102, 100, 103, 103, 'Q');                    // đoạn bậc đá xuống trạm
    R(102, 121, 103, 133, '#');                    // đường xuống Rừng Thông Chân Mây
    R(102, 124, 103, 127, 'Q');                    // đoạn bậc đá xuống rừng
    // CẦU ĐÁ qua suối (vẽ sau đường + nước).
    S(44, 65, 'Q'); S(45, 65, 'Q'); S(44, 66, 'Q'); S(45, 66, 'Q');   // cầu suối tây
    S(161, 65, 'Q'); S(162, 65, 'Q'); S(161, 66, 'Q'); S(162, 66, 'Q'); // cầu suối đông
    // Nội dung mới: spawn / dược / NPC (dọn bãi 3x3 quanh điểm, chỉ
    // gạt T/o/F ở đất mới — cùng luật các bản mở rộng trước).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    var V5_SPAWNS = [
      ['khi_mat_do', 88, 12, 'dinh_ngam_may'], ['khi_mat_do', 120, 10, 'dinh_ngam_may'],
      ['khi_mat_do', 96, 24, 'dinh_ngam_may'], ['khi_mat_do', 112, 26, 'dinh_ngam_may'],
      ['soi_rung', 86, 20, 'dinh_ngam_may'], ['soi_rung', 122, 24, 'dinh_ngam_may'],
      ['khi_mat_do', 12, 50, 'suon_gac_may'], ['khi_mat_do', 36, 48, 'suon_gac_may'],
      ['ran_luc', 16, 72, 'suon_gac_may'], ['ran_luc', 38, 80, 'suon_gac_may'],
      ['khi_mat_do', 10, 84, 'suon_gac_may'],
      ['ran_luc', 168, 78, 'thung_ho_may'], ['ran_luc', 204, 96, 'thung_ho_may'],
      ['lon_mong_sat', 186, 58, 'thung_ho_may'], ['lon_mong_sat', 200, 80, 'thung_ho_may'],
      ['lon_mong_sat', 164, 100, 'thung_ho_may'],
      ['soi_rung', 30, 120, 'rung_chan_may'], ['soi_rung', 52, 128, 'rung_chan_may'],
      ['soi_rung', 150, 120, 'rung_chan_may'], ['soi_rung', 178, 128, 'rung_chan_may'],
      ['soi_rung', 100, 126, 'rung_chan_may'],
      ['lon_mong_sat', 64, 118, 'rung_chan_may'], ['lon_mong_sat', 138, 130, 'rung_chan_may'],
      ['lon_mong_sat', 116, 122, 'rung_chan_may']
    ];
    var V5_HERBS = [
      ['long_tien_thao', 90, 20], ['long_tien_thao', 118, 28], ['long_tien_thao', 36, 54],
      ['linh_chi', 44, 126], ['linh_chi', 158, 126], ['linh_chi', 72, 132],
      ['tu_linh_qua', 172, 76], ['tu_linh_qua', 202, 64], ['tu_linh_qua', 188, 100]
    ];
    var V5_NPCS = [
      { id: 'giang_van_tich', x: 108, y: 10, sprite: 'giu_mieu', name: 'Giang Vân Tịch', role: 'Tu sĩ ngắm biển mây ở Vọng Hải Đài' },
      { id: 'mac_van_sinh', x: 32, y: 61, sprite: 'linh_gac', name: 'Mạc Vân Sinh', role: 'Người canh mây ở Lán Gác Mây' },
      { id: 'du_van_lao', x: 168, y: 87, sprite: 'dai_phu', name: 'Du Vân Lão', role: 'Ông lão ngắm hồ ở Bãi Vọng Hồ Mây' },
      { id: 'tong_van_dinh', x: 104, y: 117, sprite: 'chu_quan', name: 'Tống Vân Đình', role: 'Người giữ Trạm Mây Sơn Trung' }
    ];
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (p) { clearPatch(p[1], p[2]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // Khoét thông mọi túi đất-mới bị cô lập vào khối cũ (chỉ gạt T/o,
    // cùng thuật toán bản V4 của map 2).
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    function bfsT(sx, sy) {
      var seen = {}, q = [[sx, sy]];
      if (!walkT(sx, sy)) return seen;
      seen[sx + ',' + sy] = 1;
      while (q.length) {
        var c = q.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && walkT(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    function dvDijkstra(sx, sy, reach) {
      var dist = {}, prev = {}, pq = [[0, sx, sy]];
      dist[sx + ',' + sy] = 0;
      while (pq.length) {
        var bi = 0;
        for (var i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0]) bi = i;
        var cur = pq.splice(bi, 1)[0], cx2 = cur[1], cy2 = cur[2], ck = cx2 + ',' + cy2;
        if (reach[ck]) {
          var path = [], k2 = ck;
          while (prev[k2]) { var pp = prev[k2]; path.push([pp[0], pp[1]]); k2 = pp[0] + ',' + pp[1]; }
          return path;
        }
        if (dist[ck] !== cur[0]) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cx2 + d[0], ny = cy2 + d[1];
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny)) return;
          var ch = g[ny][nx], w = (ch === 'T' || ch === 'o') ? 1 : (blockedT[ch] ? 1e6 : 0), nk = nx + ',' + ny, nd = cur[0] + w;
          if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = [cx2, cy2]; pq.push([nd, nx, ny]); }
        });
      }
      return null;
    }
    (function carveOrphans() {
      for (var guard = 0; guard < 4000; guard++) {
        var reach = bfsT(AX + 43, AY + 50);
        var orphan = null;
        for (var yy = 0; yy < NH && !orphan; yy++) for (var xx = 0; xx < NW; xx++) {
          if (inBlock(xx, yy) || !walkT(xx, yy) || reach[xx + ',' + yy]) continue;
          orphan = [xx, yy]; break;
        }
        if (!orphan) return;
        var path = dvDijkstra(orphan[0], orphan[1], reach);
        if (!path || !path.length) return;
        path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') g[p[1]][p[0]] = '.'; });
      }
    })();
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 8 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map8') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map8') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'dinh_ngam_may', name: 'Đỉnh Ngắm Biển Mây', rects: [[84, 2, 124, 27]], types: ['khi_mat_do', 'soi_rung'] },
      { id: 'suon_gac_may', name: 'Sườn Gác Mây', rects: [[4, 40, 46, 88]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'thung_ho_may', name: 'Thung Hồ Mây', rects: [[158, 52, 206, 102]], types: ['ran_luc', 'lon_mong_sat'] },
      { id: 'rung_chan_may', name: 'Rừng Thông Chân Mây', rects: [[20, 112, 80, 134], [84, 116, 124, 134], [128, 112, 190, 134]], types: ['soi_rung', 'lon_mong_sat'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (p) { map.herbs.push({ x: p[1], y: p[2], item: p[0] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 115, y: 17, label: 'Vọng Hải Đài' },
      { sprite: 'sign', x: 86, y: 4, label: 'Đỉnh Ngắm Biển Mây' },
      { sprite: 'sign', x: 54, y: 28, label: 'Đường Vòng Vân Hải' },
      { sprite: 'sign', x: 32, y: 62, label: 'Lán Gác Mây' },
      { sprite: 'sign', x: 6, y: 42, label: 'Sườn Gác Mây' },
      { sprite: 'sign', x: 104, y: 110, label: 'Trạm Mây' },
      { sprite: 'sign', x: 171, y: 91, label: 'Bãi Vọng Hồ Mây' },
      { sprite: 'sign', x: 160, y: 54, label: 'Thung Hồ Mây' },
      { sprite: 'sign', x: 22, y: 114, label: 'Rừng Thông Chân Mây' },
      { sprite: 'sign', x: 100, y: 36, label: 'Bắc: Đỉnh Ngắm Biển Mây' },
      { sprite: 'sign', x: 100, y: 99, label: 'Nam: Trạm Mây · Rừng Thông Chân Mây' },
      { sprite: 'sign', x: 58, y: 63, label: 'Tây: Sườn Gác Mây' },
      { sprite: 'sign', x: 149, y: 63, label: 'Đông: Thung Hồ Mây' }
    );
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map8-bg-v9.webp';
  })();


  // ================= TÍCH HỢP V5 — MAP 9 (gói tmp/map-packages/map9) =================
  // ---- MỞ RỘNG MAP 9 V5 — GẤP 10 DIỆN TÍCH (chương trình map 2–14
  // ghi 22:26 + lệnh xưởng xuyên đêm 23:04 ngày 2026-10-30): map 9
  // Đoạn Long Lĩnh từ 80x56 ô (4480, đã gồm lõi gốc 56x40) lên 160x140
  // ô (22400 ô = đúng 10x diện tích map gốc 2240 ô). Toàn bộ khối
  // 80x56 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+40,+42) trong khung
  // mới — khối nằm giữa, phía bắc mở lên sườn đỉnh Đoạn Long (Đài
  // Vọng Long trên thềm đá cao + bậc đá theo tuyến leo), phía tây là
  // rừng sườn tây + suối xuống Hồ Đoạn Long (cầu đá ở 2 giao lộ),
  // phía đông là Bãi Đá Cổ, phía nam là Thung Chân Lĩnh + đường vòng
  // nối 2 cánh. Khu quái theo thang Trúc Cơ của map, càng xa lõi càng
  // nặng (khỉ/rắn sườn bắc -> khỉ/rắn rừng tây -> lợn/rắn bãi đá đông
  // -> sói/lợn thung nam). Sào Hang Long Cốt giữ đúng vị trí tương
  // đối trong lõi (dịch theo neo như mọi nội dung). EXP_LAYOUT_V nâng
  // thêm 1 nấc khi tích hợp: game.js migrateLayoutV10 dịch save theo
  // EXP_V5_MAP9 cho riêng map 9 (save cũ hơn vẫn chạy đủ các nấc
  // V1->V2 -> V2->V3 -> V3->V4 như cũ). Tọa độ map 9 hardcode ngoài
  // maps.js phải dịch cùng neo khi tích hợp: bosses.js (sào + bia
  // Đoạn Long Lang Vương (54,14)/(55,14) -> (94,56)/(95,56)).
  var EXP_V5_MAP9 = { dx: 40, dy: 42 };
  (function expandMap9V5() {
    var map = MAPS.map9;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V5_MAP9.dx, AY = EXP_V5_MAP9.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải cụm cây/đá cho đất MỚI (deterministic, cùng thuật toán các
    // vành trước; ô ven cụm luôn phủ đất trước khi rải). Đoạn Long là
    // sống núi đá: phía đông đá nhiều hơn hẳn, sườn bắc thông + đá.
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      function h2(xx, yy) { var n = Math.sin(xx * 127.1 + yy * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); }
      var cx, cy, px, py;
      for (cy = y0 - 3; cy <= y1 + 3; cy += 3) for (cx = x0 - 3; cx <= x1 + 3; cx += 3) {
        if (h2(cx, cy) > 0.45) continue;
        for (py = cy; py < cy + 3; py++) for (px = cx; px < cx + 3; px++) {
          if (px < x0 || px > x1 || py < y0 || py > y1 || inBlock(px, py)) continue;
          var r0 = h2(px, py);
          g[py][px] = r0 < pT ? 'T' : (r0 < pT + pO ? 'o' : '.');
        }
      }
    }
    scatter(1, 1, 158, 41, 0.24, 0.06, 911);   // sườn bắc: thông già + đá sống núi
    scatter(1, 42, 39, 97, 0.30, 0.03, 912);   // rừng sườn tây
    scatter(120, 42, 158, 97, 0.16, 0.09, 913); // bãi đá cổ phía đông: đá trội
    scatter(1, 98, 158, 138, 0.20, 0.03, 914); // thung chân lĩnh phía nam
    // Dọn hành lang quanh các tuyến/công trình sẽ vẽ (chỉ đất mới).
    R(60, 2, 99, 15, '.');       // thềm Đài Vọng Long + sân
    R(76, 16, 83, 41, '.');      // hành lang đường trục leo đỉnh
    R(14, 18, 84, 27, '.');      // hành lang đường nhánh tây bắc
    R(78, 22, 145, 27, '.');     // hành lang đường nhánh đông bắc
    R(13, 18, 20, 121, '.');     // hành lang đường tây
    R(6, 60, 39, 74, '.');       // Lán Thợ Săn + Bãi Vọng Tây
    R(21, 28, 28, 136, '.');     // dải suối tây + bồn hồ
    R(117, 68, 146, 82, '.');    // Bãi Đá Cổ + đường ngang đông
    R(139, 22, 146, 121, '.');   // hành lang đường đông
    R(76, 96, 84, 121, '.');     // hành lang đường trục xuống thung nam
    R(80, 100, 90, 110, '.');    // Trạm Dừng Chân Nam
    R(14, 115, 145, 122, '.');   // hành lang đường vòng chân lĩnh
    R(32, 119, 46, 132, '.');    // thềm ngắm Hồ Đoạn Long
    // VIỀN VÁCH ĐÁ quanh đất mới (sống núi — mép map là vách).
    R(0, 0, 159, 0, 'W'); R(0, 139, 159, 139, 'W');
    R(0, 1, 0, 138, 'W'); R(159, 1, 159, 138, 'W');
    // NƯỚC: suối tây từ sườn bắc chảy dọc cánh tây xuống Hồ Đoạn Long.
    R(24, 30, 25, 121, 'R');
    R(20, 123, 30, 133, 'R'); R(19, 125, 19, 131, 'R'); R(31, 125, 31, 131, 'R');
    R(21, 122, 29, 122, 'R'); R(21, 134, 29, 134, 'R');
    // THỀM ĐÁ + điểm nhấn.
    R(66, 4, 93, 11, 'Q');       // thềm Đài Vọng Long
    R(66, 3, 93, 3, 'F'); S(79, 3, 'Q'); S(80, 3, 'Q'); // lan can mép bắc đài, chừa lối lên ở trục đường
    S(67, 4, 'L'); S(92, 4, 'L'); S(67, 11, 'L'); S(92, 11, 'L'); // đèn đá 4 góc đài
    R(33, 65, 39, 72, 'Q');      // Bãi Vọng Tây (thềm ngắm về phía lõi)
    R(120, 73, 126, 80, 'Q');    // thềm Bãi Đá Cổ (dính mép tây khối cũ)
    R(34, 124, 44, 129, 'Q');    // thềm ngắm Hồ Đoạn Long
    S(35, 124, 'L'); S(43, 124, 'L'); // đèn thềm hồ
    // ĐƯỜNG (mọi tuyến >= 2 ô, nối liền khối cũ qua đúng các ô mép
    // khung đang đi được: trục bắc/nam tại cột khung 39-40, nhánh
    // tây tại (khung 0,26), nhánh đông tại (khung 79,34)).
    R(79, 12, 80, 41, '#');                        // đường trục leo đỉnh: thềm đài -> mép bắc khối
    R(79, 30, 80, 34, 'Q'); R(79, 18, 80, 22, 'Q'); // 2 đoạn BẬC ĐÁ ở điểm lên dốc
    R(18, 20, 78, 21, '#');                        // đường nhánh tây bắc: trục -> đường tây
    R(81, 24, 141, 25, '#');                       // đường nhánh đông bắc: trục -> đường đông
    R(16, 21, 17, 118, '#');                       // đường tây: nhánh bắc -> đường vòng nam
    R(13, 68, 32, 69, '#');                        // nhánh ngang tây: đường tây -> Bãi Vọng Tây
    R(142, 25, 143, 118, '#');                     // đường đông: nhánh bắc -> đường vòng nam
    R(127, 76, 141, 77, '#');                      // nhánh ngang đông: thềm Bãi Đá Cổ -> đường đông
    R(79, 98, 80, 117, '#');                       // đường trục xuống thung: mép nam khối -> đường vòng
    R(79, 104, 80, 108, 'Q');                      // đoạn BẬC ĐÁ xuống thung
    R(17, 118, 142, 119, '#');                     // đường vòng chân lĩnh (qua phía nam hồ)
    R(38, 120, 39, 123, '#');                      // nhánh vào thềm ngắm hồ
    // CẦU ĐÁ qua suối tây tại 2 giao lộ (nhánh ngang tây + đường vòng).
    S(24, 68, 'Q'); S(25, 68, 'Q'); S(24, 69, 'Q'); S(25, 69, 'Q');
    S(24, 118, 'Q'); S(25, 118, 'Q'); S(24, 119, 'Q'); S(25, 119, 'Q');
    // CÔNG TRÌNH (mái 'H' chặn, bậc cửa 'Q' đi được, NPC đứng cạnh trạm).
    R(69, 6, 71, 7, 'H');                          // Chòi Gác Đỉnh trên thềm đài
    R(88, 6, 90, 7, 'H');                          // Miếu Đoạn Long trên thềm đài
    R(9, 64, 12, 65, 'H'); S(10, 66, 'Q');         // Lán Thợ Săn + bậc cửa
    [[8, 63], [13, 63], [8, 67]].forEach(function (p) { S(p[0], p[1], 'F'); }); // rào Lán Thợ Săn
    R(84, 104, 86, 105, 'Q'); S(83, 105, 'Q');     // sân lát đá trước Trạm Dừng Chân Nam
    S(81, 105, '#'); S(82, 105, '#');              // ngõ trạm -> đường trục nam
    R(131, 72, 133, 73, 'H'); S(132, 74, 'Q');     // Nhà Kho Bãi Đá + bậc cửa
    // -- ĐIỀU CHỈNH KHỚP TRANH (tự soi 100% sau khi AI tô: tranh vẽ
    // thêm công trình/hồ ở đất mới đúng vị trí đẹp — chốt dữ liệu
    // theo tranh để hình và logic là MỘT) --
    // Xóm Đá Đông (cụm 8 nhà quanh Bãi Đá Cổ, tranh tại x 122..140,
    // y 62..76): nền nhà 'H' + bậc cửa + đèn theo đúng tranh.
    R(123, 64, 126, 66, 'H'); R(129, 64, 132, 66, 'H'); R(135, 64, 138, 66, 'H');
    R(123, 68, 126, 70, 'H'); R(129, 68, 132, 70, 'H'); R(135, 68, 138, 70, 'H');
    R(129, 72, 132, 74, 'H'); R(135, 72, 138, 74, 'H');
    S(124, 67, 'Q'); S(131, 67, 'Q'); S(137, 67, 'Q');
    S(124, 71, 'Q'); S(131, 71, 'Q'); S(137, 71, 'Q');
    S(131, 75, 'Q'); S(137, 75, 'Q');
    S(122, 66, 'L'); S(128, 66, 'L'); S(134, 66, 'L'); S(140, 66, 'L');
    // Hồ Liên Đông Bắc (tranh tại x 135..156, y 29..42): cho thành
    // nước thật 2 thùy, chừa đường đông 142-143; 2 nhà ven hồ.
    R(135, 30, 141, 35, 'R'); R(144, 29, 153, 40, 'R'); R(154, 33, 156, 38, 'R');
    R(133, 36, 137, 38, 'H'); S(135, 39, 'Q');     // nhà ven hồ tây + bậc cửa
    R(145, 46, 149, 48, 'H'); S(147, 49, 'Q');     // nhà ven hồ nam + bậc cửa
    // Trạm Dừng Chân Nam: tranh đặt nhà trạm ở (90..92, 108..109) bên
    // suối nhỏ chảy dọc x 87..88 — chốt theo tranh.
    R(90, 108, 92, 109, 'H'); S(89, 109, 'Q');
    R(87, 100, 88, 113, 'R');
    // Quần thể bên Hồ Đoạn Long (tranh phủ lên thềm ngắm hồ): 3 mái
    // nhà trong sân đá — nền nhà 'H', sân giữ 'Q'.
    R(37, 126, 42, 127, 'H'); R(35, 129, 37, 131, 'H'); R(42, 129, 44, 131, 'H');
    // Suối Đông Nam + Ao Liên (tranh tại y 123..125 và x 137..147,
    // y 129..136): cho thành nước thật; cầu đá tại đường đông và tại
    // lối xuống Đình Suối Đông.
    R(124, 123, 151, 125, 'R');
    S(142, 123, 'Q'); S(143, 123, 'Q'); S(142, 124, 'Q'); S(143, 124, 'Q'); S(142, 125, 'Q'); S(143, 125, 'Q');
    R(126, 120, 127, 122, '#');
    S(126, 123, 'Q'); S(127, 123, 'Q'); S(126, 124, 'Q'); S(127, 124, 'Q'); S(126, 125, 'Q'); S(127, 125, 'Q');
    R(137, 129, 147, 136, 'R'); R(135, 131, 136, 134, 'R');
    R(126, 131, 129, 132, 'H'); S(127, 133, 'Q');  // Đình Suối Đông + bậc cửa
    R(127, 126, 127, 130, '#');                    // lối cầu -> đình
    // Dọn bãi 3x3 quanh spawn/dược/NPC/biển mới (chỉ gạt T/o/F ở đất mới).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    var V5_SPAWNS = [
      ['khi_mat_do', 60, 8, 'dinh_bac'], ['khi_mat_do', 100, 10, 'dinh_bac'], ['khi_mat_do', 30, 6, 'dinh_bac'],
      ['khi_mat_do', 48, 12, 'dinh_bac'], ['ran_luc', 70, 27, 'dinh_bac'], ['ran_luc', 90, 29, 'dinh_bac'],
      ['khi_mat_do', 10, 50, 'rung_tay'], ['khi_mat_do', 30, 84, 'rung_tay'],
      ['ran_luc', 28, 58, 'rung_tay'], ['ran_luc', 12, 92, 'rung_tay'],
      ['lon_mong_sat', 136, 52, 'bai_da_dong'], ['lon_mong_sat', 150, 66, 'bai_da_dong'],
      ['ran_luc', 130, 90, 'bai_da_dong'], ['ran_luc', 148, 96, 'bai_da_dong'],
      ['soi_rung', 40, 108, 'thung_nam'], ['soi_rung', 56, 126, 'thung_nam'],
      ['soi_rung', 96, 110, 'thung_nam'], ['soi_rung', 120, 124, 'thung_nam'],
      ['lon_mong_sat', 48, 118, 'thung_nam'], ['lon_mong_sat', 104, 130, 'thung_nam'],
      ['ran_luc', 40, 132, 'ven_ho'], ['soi_rung', 46, 120, 'ven_ho']
    ];
    var V5_HERBS = [
      [64, 14, 'long_tien_thao'], [96, 16, 'long_tien_thao'], [52, 24, 'long_tien_thao'],
      [26, 44, 'huyet_sam'], [140, 44, 'huyet_sam'], [118, 30, 'huyet_sam'],
      [20, 100, 'huyet_sam'], [146, 110, 'huyet_sam'],
      [60, 132, 'long_tien_thao'], [110, 134, 'long_tien_thao'],
      [36, 128, 'van_nien_linh_chi'], [150, 60, 'van_nien_linh_chi']
    ];
    var V5_NPCS = [
      { id: 'phong_gac', x: 74, y: 9, sprite: 'linh_gac', name: 'Đỗ Phong', role: 'Người gác Đài Vọng Long' },
      { id: 'tran_mieu', x: 85, y: 9, sprite: 'giu_mieu', name: 'Trần Thủ Nghĩa', role: 'Người trông Miếu Đoạn Long' },
      { id: 'a_linh', x: 14, y: 67, sprite: 'tho_san_ha', name: 'Tạ A Lĩnh', role: 'Thợ săn sườn tây Đoạn Long' },
      { id: 'luu_tram', x: 82, y: 107, sprite: 'chu_quan', name: 'Lưu Văn Trạm', role: 'Người coi Trạm Dừng Chân Đoạn Long' },
      { id: 'thach_khai', x: 129, y: 75, sprite: 'tho_san_ha', name: 'Thạch Văn Khai', role: 'Người khai đá ở Bãi Đá Cổ' }
    ];
    var V5_SIGNS = [
      [75, 10, 'Chòi Gác Đỉnh'], [86, 10, 'Miếu Đoạn Long'],
      [76, 13, 'Đài Vọng Long — Đỉnh Đoạn Long'],
      [20, 19, 'Tây: Rừng Sườn Tây · Lán Thợ Săn'],
      [36, 64, 'Bãi Vọng Tây'], [14, 62, 'Lán Thợ Săn'],
      [124, 27, 'Đông: Bãi Đá Cổ · Hồ Liên'], [128, 78, 'Bãi Đá Cổ'],
      [127, 61, 'Xóm Đá Đông'], [130, 133, 'Đình Suối Đông'],
      [82, 101, 'Nam: Thung Chân Lĩnh · Trạm Dừng Chân'],
      [84, 107, 'Trạm Dừng Chân Đoạn Long'],
      [36, 121, 'Hồ Đoạn Long'], [76, 116, 'Đường Vòng Chân Lĩnh']
    ];
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (p) { clearPatch(p[0], p[1]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    V5_SIGNS.forEach(function (s) { clearPatch(s[0], s[1]); });
    // Khoét thông mọi túi đất-mới bị cô lập vào khối cũ (chỉ gạt T/o,
    // cùng thuật toán bản V4 của map 2).
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    function bfsT(sx, sy) {
      var seen = {}, q = [[sx, sy]];
      if (!walkT(sx, sy)) return seen;
      seen[sx + ',' + sy] = 1;
      while (q.length) {
        var c = q.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && walkT(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    function dvDijkstra9(sx, sy, reach) {
      var dist = {}, prev = {}, pq = [[0, sx, sy]];
      dist[sx + ',' + sy] = 0;
      while (pq.length) {
        var bi = 0;
        for (var i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0]) bi = i;
        var cur = pq.splice(bi, 1)[0], cx2 = cur[1], cy2 = cur[2], ck = cx2 + ',' + cy2;
        if (reach[ck]) {
          var path = [], k2 = ck;
          while (prev[k2]) { var pp = prev[k2]; path.push([pp[0], pp[1]]); k2 = pp[0] + ',' + pp[1]; }
          return path;
        }
        if (dist[ck] !== cur[0]) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cx2 + d[0], ny = cy2 + d[1];
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny)) return;
          var ch = g[ny][nx], w = (ch === 'T' || ch === 'o') ? 1 : (blockedT[ch] ? 1e6 : 0), nk = nx + ',' + ny, nd = cur[0] + w;
          if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = [cx2, cy2]; pq.push([nd, nx, ny]); }
        });
      }
      return null;
    }
    (function carveOrphans() {
      for (var guard = 0; guard < 4000; guard++) {
        var reach = bfsT(AX + 39, AY + 46);
        var orphan = null;
        for (var yy = 0; yy < NH && !orphan; yy++) for (var xx = 0; xx < NW; xx++) {
          if (inBlock(xx, yy) || !walkT(xx, yy) || reach[xx + ',' + yy]) continue;
          orphan = [xx, yy]; break;
        }
        if (!orphan) return;
        var path = dvDijkstra9(orphan[0], orphan[1], reach);
        if (!path || !path.length) return;
        path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') g[p[1]][p[0]] = '.'; });
      }
    })();
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 9 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map9') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map9') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'dinh_bac', name: 'Sườn Bắc Đoạn Long', rects: [[16, 1, 143, 16], [58, 17, 101, 34]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'rung_tay', name: 'Rừng Sườn Tây Đoạn Long', rects: [[2, 40, 38, 100]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'bai_da_dong', name: 'Bãi Đá Cổ Đoạn Long', rects: [[121, 40, 158, 100]], types: ['lon_mong_sat', 'ran_luc'] },
      { id: 'thung_nam', name: 'Thung Chân Lĩnh', rects: [[24, 100, 70, 136], [90, 100, 136, 136]], types: ['soi_rung', 'lon_mong_sat'] },
      { id: 'ven_ho', name: 'Ven Hồ Đoạn Long', rects: [[14, 116, 50, 138]], types: ['ran_luc', 'soi_rung'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (p) { map.herbs.push({ x: p[0], y: p[1], item: p[2] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    V5_SIGNS.forEach(function (s) { map.props.push({ sprite: 'sign', x: s[0], y: s[1], label: s[2] }); });
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map9-bg-v8.webp';
  })();

 
  // ---- MỞ RỘNG MAP 10 V5 — GẤP 10 DIỆN TÍCH (chương trình map 2–14,
  // lệnh Bui 22:12–22:25 + hạn chót xuyên đêm 23:04 ngày 2026-10-30):
  // map 10 Xích Diệm Hoang Nguyên từ 88x60 ô (5280 ô, đã gồm lõi gốc
  // 64x44 = 2816 ô và vành V10) lên 176x160 ô (28160 ô = đúng 10x diện
  // tích map gốc). Toàn bộ khối 88x60 hiện có GIỮ NGUYÊN TỪNG Ô, neo
  // tại (+44,+0) trong khung mới — khối tựa lên phía bắc (cổng bắc lên
  // Hàn Băng Cốc giữ nguyên ở mép bắc khối như quy ước neo của map 2
  // V4) để đất mở sâu xuống phía nam (bãi săn boss đông người đúng
  // ghi chú chặng cao) và hai cánh tây/đông. Đất mới KHÔNG rải ngẫu
  // nhiên trống: mạng đường >= 2 ô nối liền cổng nam/trục chính tới
  // Tiền Đồn Xích Diệm (tiền đồn tu sĩ ngay dưới điểm rơi nam: nhà đội
  // trưởng + lò đan dã chiến + sân đá), Hồ Dung Nham lớn phía đông
  // nam có đê đá 'Q' bắc qua + Đài Giữa Hồ, Miếu Hỏa Thần trên thềm
  // đá tây bắc, Thềm Đá Đông, và Diệm Sơn Đài (đài đá lớn cuối trục
  // nam) với 2 đoạn BẬC ĐÁ trên đường lên đài. Khu quái theo thang
  // Kim Đan của map, càng xa điểm rơi càng nặng: khỉ Gò Bắc Diệm ->
  // sói Bãi Tro Tàn Tây / khỉ + sói + lợn Cao Nguyên Đông -> rắn Bờ
  // Nam Hồ Dung Nham -> lợn + rắn Thâm Hoang Nam (xa nhất, đất săn
  // boss). Tỉ lệ loài đã cân để atk trung bình toàn map không nghịch
  // tiến trình chuỗi (luật audit L7a: >= atk TB map 9 - 0,3).
  // Mật độ spawn mới giữ thưa theo chuẩn V10 (tổng map vẫn dưới trần
  // migrateLayoutV10 dịch save theo EXP_V5_MAP10 cho RIÊNG map 10;
  // save cũ hơn vẫn chạy đủ các nấc V1->V2, V2->V3, V3->V4 như cũ.
  // Tọa độ map 10 hardcode ngoài maps.js phải dịch cùng neo (+44,+0)
  // trong cùng lượt tích hợp: bosses.js (sào ho_diem_vuong (33,29) ->
  // (77,29), bia (34,29) -> (78,29); sào hang_xich_diem (60,16) ->
  // (104,16), bia (61,16) -> (105,16)). NPC mới khai ở đây + hồ sơ/
  // thoại trong js/story.js (STORY.NPCS + DIALOGUE: tran_viem,
  // ha_tu, chu_ba, ly_hoa_van — khối đề xuất kèm trong README của gói).
  var EXP_V5_MAP10 = { dx: 44, dy: 0 };
  (function expandMap10V5() {
    var map = MAPS.map10;
    var OW = map.w, OH = map.h, NW = 176, NH = 160;
    var AX = EXP_V5_MAP10.dx, AY = EXP_V5_MAP10.dy;
    var rows = [], y, x;
    for (y = 0; y < NH; y++) { var r0 = []; for (x = 0; x < NW; x++) r0.push('.'); rows.push(r0); }
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) rows[y + AY][x + AX] = map.tiles[y][x];
    function inBlock(cx, cy) { return cx >= AX && cx < AX + OW && cy >= AY && cy < AY + OH; }
    function S(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < NW && cy < NH && !inBlock(cx, cy)) rows[cy][cx] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      // Cây cháy/đá mọc thành CỤM có nhịp (mặt nạ cụm 5x5 + nhiễu mịn),
      // cùng thuật toán bản V3 của map 1 — đất hoang dung nham thưa hơn.
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || rows[yy][xx] !== '.') continue;
        var grove = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (grove < pT * 1.9 && h1 < 0.62) rows[yy][xx] = 'T';
        else if (h1 > 1 - pO) rows[yy][xx] = 'o';
      }
    }
    // -- Danh sách nội dung mới (dùng cho cả dọn bãi + đẩy dữ liệu) --
    var V5_NPCS = [
      { id: 'tran_viem', x: 85, y: 66, sprite: 'linh_gac', name: 'Trần Viêm', role: 'Đội trưởng Tiền Đồn Xích Diệm' },
      { id: 'ha_tu', x: 95, y: 66, sprite: 'dai_phu', name: 'Hà Tú', role: 'Đan sư lò dã chiến Tiền Đồn Xích Diệm' },
      { id: 'chu_ba', x: 17, y: 12, sprite: 'giu_mieu', name: 'Chu Bá', role: 'Người giữ Miếu Hỏa Thần' },
      { id: 'ly_hoa_van', x: 115, y: 97, sprite: 'tho_san_ha', name: 'Lý Hỏa Vân', role: 'Người hái Hỏa Diệm Liên ở bờ Hồ Dung Nham' }
    ];
    var V5_HERB_CLUSTERS = [
      { item: 'hoa_diem_lien', x: 114, y: 90, n: 3 }, { item: 'hoa_diem_lien', x: 163, y: 104, n: 3 },
      { item: 'hoa_diem_lien', x: 128, y: 113, n: 2 }, { item: 'hoa_diem_lien', x: 27, y: 103, n: 2 },
      { item: 'hoa_diem_lien', x: 64, y: 131, n: 2 },
      { item: 'doc_tam_hoa', x: 18, y: 142, n: 2 }, { item: 'doc_tam_hoa', x: 152, y: 142, n: 2 },
      { item: 'son_tinh', x: 90, y: 144, n: 2 }, { item: 'son_tinh', x: 28, y: 18, n: 2 }
    ];
    var V5_ZONES = [
      { id: 'bac_diem', name: 'Gò Bắc Diệm', rects: [[4, 4, 40, 24], [136, 4, 170, 24]], types: ['khi_mat_do'], count: 10 },
      { id: 'tro_tan_tay', name: 'Bãi Tro Tàn Tây', rects: [[4, 36, 40, 86]], types: ['soi_rung'], count: 12 },
      { id: 'cao_nguyen_dong', name: 'Cao Nguyên Đông', rects: [[136, 36, 170, 84]], types: ['khi_mat_do', 'soi_rung', 'lon_mong_sat'], count: 14 },
      { id: 'dung_nham_nam', name: 'Bờ Nam Hồ Dung Nham', rects: [[94, 104, 168, 118]], types: ['ran_luc'], count: 10 },
      { id: 'tham_hoang_nam', name: 'Thâm Hoang Nam', rects: [[8, 126, 168, 154]], types: ['lon_mong_sat', 'ran_luc'], count: 18 }
    ];
    // -- Vách khung ngoài của đất mới (khối cũ đã có vách riêng) --
    R(0, 0, 43, 0, 'W'); R(132, 0, 175, 0, 'W');
    R(0, 159, 175, 159, 'W'); R(0, 0, 0, 159, 'W'); R(175, 0, 175, 159, 'W');
    // -- Rải cây cháy/đá nền theo vùng (hồ/đường/nhà vẽ đè lên sau) --
    scatter(1, 1, 43, 58, 0.13, 0.03, 1011);       // cánh tây bắc
    scatter(132, 1, 174, 58, 0.13, 0.03, 1012);    // cánh đông bắc
    scatter(1, 60, 86, 158, 0.09, 0.03, 1013);     // hoang nam phía tây trục
    scatter(89, 60, 174, 158, 0.09, 0.03, 1014);   // hoang nam phía đông trục
    // Khoảng trống giữ sạch: hành lang đường + các công trình.
    R(74, 60, 100, 72, '.');                        // Tiền Đồn Xích Diệm
    R(85, 52, 90, 158, '.');                        // hành lang trục nam
    R(6, 118, 170, 123, '.');                       // hành lang đường ngang nam
    R(18, 76, 158, 81, '.');                        // hành lang đường ngang trung nam
    R(2, 28, 43, 33, '.'); R(132, 28, 173, 33, '.'); // hành lang đường tây/đông
    R(112, 93, 117, 100, '.');                      // bờ tây hồ + đầu đê đá
    R(130, 92, 150, 103, '.');                      // vùng Đài Giữa Hồ (vẽ Q/R sau)
    R(76, 144, 99, 158, '.');                       // Diệm Sơn Đài + thềm
    R(148, 40, 168, 52, '.');                       // Thềm Đá Đông
    R(4, 4, 28, 18, '.');                           // thềm Miếu Hỏa Thần (vẽ Q sau)
    // -- Nước dung nham ('R'): Hồ Dung Nham lớn + các hồ vệ tinh --
    function blob(spec, ch) { spec.forEach(function (s2) { R(s2[0], s2[1], s2[2], s2[1], ch); }); }
    blob([[128, 86, 150], [128, 87, 150], [128, 88, 150], [128, 89, 150],
          [122, 90, 156], [122, 91, 156], [122, 92, 156], [122, 93, 156],
          [118, 94, 160], [118, 95, 160], [118, 96, 160], [118, 97, 160], [118, 98, 160],
          [118, 99, 160], [118, 100, 160], [118, 101, 160], [118, 102, 160], [118, 103, 160],
          [122, 104, 156], [122, 105, 156], [122, 106, 156], [122, 107, 156],
          [128, 108, 150], [128, 109, 150], [128, 110, 150]], 'R'); // Hồ Dung Nham lớn
    blob([[14, 98, 23], [13, 99, 24], [12, 100, 25], [12, 101, 25], [12, 102, 25],
          [12, 103, 25], [12, 104, 25], [12, 105, 25], [13, 106, 24], [14, 107, 23]], 'R'); // hồ tây
    blob([[149, 12, 159], [148, 13, 160], [148, 14, 160], [148, 15, 160], [148, 16, 160],
          [148, 17, 160], [148, 18, 160], [149, 19, 159], [150, 20, 158]], 'R'); // hồ đông bắc
    blob([[69, 132, 78], [68, 133, 79], [68, 134, 79], [68, 135, 79], [68, 136, 79],
          [68, 137, 79], [69, 138, 78], [70, 139, 77]], 'R'); // hồ nam trung
    R(20, 64, 26, 68, 'R'); R(150, 128, 157, 134, 'R'); R(100, 140, 106, 144, 'R'); // hồ nhỏ
    // -- Đê đá qua Hồ Dung Nham + Đài Giữa Hồ ('Q') --
    R(118, 97, 160, 98, 'Q');
    R(133, 95, 146, 100, 'Q');
    [[118, 96], [130, 96], [142, 96], [154, 96], [124, 99], [148, 99], [160, 99]].forEach(function (p) { S(p[0], p[1], 'o'); });
    // -- Thềm/đài đá + bậc đá trên tuyến di chuyển --
    R(6, 6, 26, 16, 'Q');                            // thềm Miếu Hỏa Thần (tây bắc)
    R(150, 42, 166, 50, 'Q');                        // Thềm Đá Đông (ngắm cảnh)
    R(78, 148, 97, 156, 'Q');                        // Diệm Sơn Đài — đài săn boss cuối trục nam
    [[78, 148], [97, 148], [78, 156], [97, 156]].forEach(function (p) { S(p[0], p[1], 'o'); }); // trụ đá 4 góc đài
    R(84, 128, 91, 129, 'Q'); R(84, 140, 91, 141, 'Q'); // 2 đoạn BẬC ĐÁ trên trục nam lên đài
    // -- Mạng đường (# đất, >= 2 ô, nối liền mọi cổng/khu) --
    R(87, 60, 88, 147, '#');                         // trục nam: tiền đồn -> Diệm Sơn Đài
    R(8, 120, 168, 121, '#');                        // đường ngang nam
    R(20, 78, 156, 79, '#');                         // đường ngang trung nam
    R(4, 30, 43, 31, '#');                           // đường tây: mép khối -> thềm miếu/cánh tây
    R(132, 30, 171, 31, '#');                        // đường đông: mép khối -> cao nguyên đông
    R(89, 95, 117, 96, '#');                         // nhánh bờ hồ: trục -> đầu đê đá
    R(157, 32, 158, 41, '#');                        // nhánh Thềm Đá Đông
    R(15, 17, 16, 29, '#');                          // nhánh thềm miếu -> đường tây
    R(8, 152, 77, 153, '#'); R(98, 152, 168, 153, '#'); // đường vành nam vào Diệm Sơn Đài
    // -- Tiền Đồn Xích Diệm: nhà thật (H) + thềm cửa (Q) + sân đá --
    R(77, 61, 81, 62, 'H'); R(78, 63, 80, 63, 'Q');  // nhà đội trưởng + thềm cửa
    R(93, 61, 97, 62, 'H'); R(94, 63, 96, 63, 'Q');  // lò đan dã chiến + thềm cửa
    R(76, 65, 98, 67, 'Q');                          // sân tiền đồn
    S(76, 64, 'L'); S(98, 64, 'L'); S(76, 68, 'L'); S(98, 68, 'L'); // đèn 4 góc sân
    S(74, 60, 'F'); S(75, 60, 'F'); S(99, 60, 'F'); S(100, 60, 'F'); // rào góc tiền đồn
    // -- Miếu Hỏa Thần trên thềm tây bắc --
    R(11, 9, 14, 10, 'H');
    S(8, 8, 'L'); S(24, 8, 'L');
    // -- Dọn bãi 3x3 quanh NPC mới (chỉ gạt T/o/F, giữ đường/thềm/nước/nhà) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = rows[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') rows[yy][xx] = '.';
      }
    }
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // -- Xử lý túi đất cô lập trong đất mới (bản theo CỤM của thuật toán
    // V10/V3 — bản từng-ô quá chậm trên 28160 ô): gán nhãn mọi thành
    // phần đất đi được; cụm nào không chạm khối cũ là túi cô lập. Cụm
    // nhỏ (< 40 ô — đúng ngưỡng luật audit L6) thì LẤP thành địa hình
    // (cây cháy/đá theo băm: ô đất 1 mình giữa cụm cây là vết cháy, đặt
    // 'T'/'o' không đổi tính chất vùng); cụm lớn thì khoét ĐÚNG 1 tuyến
    // rẻ nhất qua T/o bằng dvDijkstra (không đụng nhà/nước/vách). --
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[rows[cy][cx]]; }
    function labelComponents() {
      var comp = {}, comps = [], xx, yy;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        if (!walkAt(xx, yy) || comp[xx + ',' + yy] !== undefined) continue;
        var id = comps.length, cells = [], q = [[xx, yy]];
        comp[xx + ',' + yy] = id;
        while (q.length) {
          var c = q.pop(); cells.push(c);
          [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
            var ax2 = c[0] + d[0], ay2 = c[1] + d[1], k2 = ax2 + ',' + ay2;
            if (comp[k2] === undefined && walkAt(ax2, ay2)) { comp[k2] = id; q.push([ax2, ay2]); }
          });
        }
        comps.push(cells);
      }
      return { comp: comp, comps: comps };
    }
    var lab = labelComponents();
    // Neo vùng chính = ô start cũ (lúc này start chưa dịch; vị trí của
    // nó trong khung mới là start + neo) — luôn là ô đi được trên trục.
    function mainCompOf(l2) { return l2.comp[(map.start.x + AX) + ',' + (map.start.y + AY)]; }
    var mainComp = mainCompOf(lab);
    // Lượt 1: khoét tuyến cho mọi cụm LỚN (>= 40 ô) chưa chạm vùng
    // chính — mỗi cụm 1 lần Dijkstra tới ô đầu của cụm, gán nhãn lại
    // sau mỗi lần khoét (cụm vừa nối nhập vào vùng chính).
    lab.comps.slice().forEach(function (cells, ci) {
      if (ci === mainComp || cells.length < 40) return;
      var srcs = lab.comps[mainComp].map(function (c) { return [c[0], c[1]]; });
      var t0 = cells[0];
      var path = dvDijkstra(NW, NH, srcs, function (cx, cy) {
        var ch = rows[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (ch === 'T') return 7; if (ch === 'o') return 11;
        return Infinity;
      }, function (cx, cy) { return cx === t0[0] && cy === t0[1]; });
      if (path) path.forEach(function (c) { if (map.blocked[rows[c[1]][c[0]]]) rows[c[1]][c[0]] = '.'; });
      lab = labelComponents();
      mainComp = mainCompOf(lab);
    });
    // Lượt 2: cụm còn sót (nhỏ < 40 ô — đúng ngưỡng luật audit L6 —
    // hoặc cụm mà Dijkstra không khoét nổi vì bị nước/vách bọc kín)
    // thì lấp thành địa hình cây cháy/đá: đất không tới được thì không
    // để là đất trống. Chạy SAU lượt khoét để không lấp nhầm ô mà
    // tuyến khoét của cụm lớn vừa đi qua.
    lab = labelComponents();
    mainComp = mainCompOf(lab);
    lab.comps.forEach(function (cells, ci) {
      if (ci === mainComp) return;
      cells.forEach(function (c) { rows[c[1]][c[0]] = hash01(c[0] + 77, c[1]) < 0.7 ? 'T' : 'o'; });
    });
    // -- Dịch toàn bộ nội dung cũ của map 10 theo neo (+44,+0) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start); shPt(map.well); shPt(map.bossSpawn); shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 9/11 KHÔNG đổi hình học
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Cổng của map khác rơi VÀO map 10 phải dịch điểm rơi theo neo mới.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map10') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map10') { p.tx += AX; p.ty += AY; } });
    });
    // -- Nội dung mới (tọa độ khung 176x160) --
    V5_ZONES.forEach(function (z) { map.zones.push({ id: z.id, name: z.name, rects: z.rects, types: z.types }); });
    // Điểm spawn tất định trong khu mới: chỉ ô '.' trong rect của khu,
    // cách điểm nhạy cảm >= 3 Chebyshev, hộp lang thang +-4 không chứa
    // điểm rơi/start, hai spawn cách nhau >= 3 Chebyshev (luật audit
    // L2/L3/L4 — bản này giữ biên an toàn hơn luật 1 ô).
    var landPts = [{ x: map.start.x, y: map.start.y }];
    Object.keys(MAPS).forEach(function (id) {
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map10') landPts.push({ x: p.tx, y: p.ty }); });
    });
    var safePts = landPts.slice();
    (map.portals || []).forEach(function (p) { safePts.push({ x: p.x, y: p.y }); });
    (map.bossLairs || []).forEach(function (l) { safePts.push({ x: l.x, y: l.y }); });
    V5_NPCS.forEach(function (n) { safePts.push({ x: n.x, y: n.y }); });
    function cheb(ax2, ay2, bx, by) { return Math.max(Math.abs(ax2 - bx), Math.abs(ay2 - by)); }
    V5_ZONES.forEach(function (z, zi) {
      var cells = [];
      z.rects.forEach(function (r) {
        for (var yy = r[1]; yy <= r[3]; yy++) for (var xx = r[0]; xx <= r[2]; xx++) {
          if (rows[yy][xx] === '.') cells.push([xx, yy]);
        }
      });
      var salt = 5000 + zi * 131 + z.id.length * 17;
      cells.sort(function (a, b) { return hash01(a[0] * 3 + salt, a[1] * 7 + salt) - hash01(b[0] * 3 + salt, b[1] * 7 + salt); });
      var picked = [];
      for (var i = 0; i < cells.length && picked.length < z.count; i++) {
        var c = cells[i], okS = true;
        for (var a2 = 0; a2 < safePts.length && okS; a2++) if (cheb(c[0], c[1], safePts[a2].x, safePts[a2].y) < 3) okS = false;
        for (var l2 = 0; l2 < landPts.length && okS; l2++) {
          if (Math.abs(c[0] - landPts[l2].x) <= 4 && Math.abs(c[1] - landPts[l2].y) <= 4) okS = false;
        }
        for (var j = 0; j < picked.length && okS; j++) if (cheb(c[0], c[1], picked[j].x, picked[j].y) < 3) okS = false;
        if (okS) picked.push({ type: z.types[picked.length % z.types.length], x: c[0], y: c[1], zone: z.id });
      }
      picked.forEach(function (m2) { map.monsters.push(m2); });
    });
    // Dược theo cụm quanh tâm (chỉ ô '.' chưa dùng, lệch theo mẫu sẵn có).
    var usedH = {};
    var offsH = [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [-2, -2], [3, 1], [-3, -1], [1, 3], [-1, -3]];
    V5_HERB_CLUSTERS.forEach(function (cl) {
      var got = 0;
      for (var i = 0; i < offsH.length && got < cl.n; i++) {
        var hx = cl.x + offsH[i][0], hy = cl.y + offsH[i][1], k = hx + ',' + hy;
        if (hx < 1 || hy < 1 || hx >= NW || hy >= NH || usedH[k]) continue;
        if (rows[hy][hx] !== '.') continue;
        usedH[k] = 1; map.herbs.push({ x: hx, y: hy, item: cl.item }); got++;
      }
    });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 86, y: 60, label: 'Tiền Đồn Xích Diệm' },
      { sprite: 'sign', x: 90, y: 94, label: 'Hồ Dung Nham Xích Diệm' },
      { sprite: 'sign', x: 161, y: 97, label: 'Đài Giữa Hồ' },
      { sprite: 'sign', x: 85, y: 146, label: 'Diệm Sơn Đài' },
      { sprite: 'sign', x: 18, y: 18, label: 'Miếu Hỏa Thần' },
      { sprite: 'sign', x: 156, y: 40, label: 'Thềm Đá Đông' },
      { sprite: 'sign', x: 10, y: 119, label: 'Thâm Hoang Nam — đất săn boss' }
    );
    map.tiles = rows.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map10-bg-v9.webp';
  })();

  // ---- MỞ RỘNG MAP 11 V5 — GẤP 10 DIỆN TÍCH GỐC (gói xưởng map xuyên
  // đêm, lệnh Bui 23:04 ngày 2026-10-30 "thiết kế lại các map, từ giờ
  // đến sáng tất cả phải xong"; theo mục chương trình map 2–14 ghi
  // 22:26 + ghi chú chặng cao "map 8–14 giữ chất riêng: ... hàn băng
  // ... đất rộng cho săn boss đông người"): map 11 "Hàn Băng Cốc"
  // (Kim Đan) từ 80x56 ô (4.480, đã gồm lõi gốc 56x40 = 2.240 ô) lên
  // 160x140 ô (22.400 ô = đúng 10x diện tích map GỐC). Toàn bộ khối
  // 80x56 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+40,+24) trong khung
  // mới — thung lũng băng cũ tựa giữa, đất mới mở ra 4 phía: phía bắc
  // là Băng Nguyên Bắc (Đài Hàn Ngọc + Băng Hồ Bắc + Chòi Gác Bắc),
  // phía tây là Rừng Tuyết Tùng + Linh Tuyền Băng + Lán Hái Dược +
  // Miếu Băng Thần, phía đông là Đài Băng Đông + Băng Hồ Đông lớn có
  // đê đá băng qua Đài Giữa Hồ, phía nam là Thẳm Băng Nam (đất săn
  // sâu nhất, Sân Băng Vực — quảng trường đá rộng cho săn boss đông
  // người) + Đài Ngắm Băng ở rìa nam. Địa hình kể chuyện theo tuyến:
  // đường vòng bắc -> đài hàn ngọc; nhánh tây qua linh tuyền tới
  // miếu; nhánh đông lên đài băng (đoạn bậc đá) rồi vòng quanh hồ;
  // trục nam xuống thềm băng bằng 2 đoạn bậc đá 'Q'. Mạng đường '#'
  // rộng 2 ô nối liền vòng: 2 trục dọc tây/đông + đường vòng bắc/nam
  // + nhánh tây/đông + trục nam — mọi nhánh đều kết thúc ở đài/miếu/
  // lán/sân băng, không đường cụt vô nghĩa.
  // Khu quái theo thang Kim Đan của map (đúng 4 loài sẵn có của map:
  // sói rừng / rắn lục / khỉ mặt đỏ / lợn mông sắt), càng xa điểm rơi
  // càng nặng: tuyết tùng tây (khỉ+sói) -> ven linh tuyền (khỉ) ->
  // băng nguyên bắc (sói+rắn) -> băng hồ đông (sói+lợn) -> thẳm băng
  // nam (lợn+rắn, xa nhất). Tổng spawn 40 -> 158 (mật độ 0,71/100 ô,
  // thưa hơn mật độ V10 0,89/100 — giữ chuẩn đất rộng thưa quái).
  // Dược mới +26 điểm (băng tinh hoa + ngọc tủy chi — đúng 2 dược
  // sẵn có của map). EXP_LAYOUT_V nâng lên 5: game.js
  // migrateLayoutV10 cần thêm nấc V4->V5 dịch save theo
  // EXP_V5_MAP11 cho RIÊNG map 11 (xem README của gói). Tọa độ cứng
  // ngoài maps.js phải dịch cùng neo (+40,+24): bosses.js dòng 404
  // (sào Động Băng Tinh map 11: lair (54,40)->(94,64), stele
  // (55,40)->(95,64)) — danh sách đầy đủ trong README.
  var EXP_V5_MAP11 = { dx: 40, dy: 24 };
  (function expandMap11V5() {
    var map = MAPS.map11;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V5_MAP11.dx, AY = EXP_V5_MAP11.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Viền ngoài = vách băng (không cổng ở mép khung mới — cả 2 cổng
    // chuỗi của map 11 nằm trong khối cũ).
    R(0, 0, NW - 1, 0, 'W'); R(0, NH - 1, NW - 1, NH - 1, 'W');
    R(0, 1, 0, NH - 2, 'W'); R(NW - 1, 1, NW - 1, NH - 2, 'W');
    // -- Rải sinh cảnh đất MỚI theo vùng (cụm có nhịp, tất định) --
    function grove(x0, y0, x1, y1, maskP, fillP, rockP, salt) {
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || g[yy][xx] !== '.') continue;
        var gm = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (gm < maskP && h1 < fillP) g[yy][xx] = 'T';
        else if (h1 > 1 - rockP) g[yy][xx] = 'o';
      }
    }
    function sprinkle(x0, y0, x1, y1, pO, pT, salt) {
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || g[yy][xx] !== '.') continue;
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (h1 < pO) g[yy][xx] = 'o';
        else if (h1 > 1 - pT) g[yy][xx] = 'T';
      }
    }
    grove(1, 1, 38, 79, 0.62, 0.62, 0.04, 1101);          // tây: Rừng Tuyết Tùng dày theo cụm
    grove(44, 2, 70, 9, 0.50, 0.50, 0.03, 1102);          // bắc: cụm thông tuyết tây đài
    sprinkle(1, 1, 158, 23, 0.08, 0.03, 1103);            // bắc: băng nguyên thưa đá/thông lẻ
    sprinkle(120, 1, 158, 79, 0.14, 0.05, 1104);          // đông: tuyết nguyên — đá nhiều, thông thưa
    grove(122, 56, 140, 78, 0.45, 0.50, 0.04, 1105);      // đông nam: cụm thông bờ hồ bắc
    grove(1, 80, 158, 138, 0.22, 0.52, 0.05, 1106);       // nam: thung băng thưa cụm thông nhỏ
    sprinkle(40, 80, 119, 138, 0.05, 0.0, 1107);          // nam giữa: rải đá lẻ trên thềm băng
    // -- Nước đóng băng: bờ hữu cơ (gặm mép theo băm tất định) --
    function blob(x0, y0, x1, y1, salt) {
      R(x0, y0, x1, y1, 'R');
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy)) continue;
        var edge = (xx === x0 || xx === x1 || yy === y0 || yy === y1);
        if (edge && hash01(xx + salt, yy + salt * 5) < 0.45) g[yy][xx] = '.';
      }
    }
    blob(23, 48, 30, 53, 1111);                            // Linh Tuyền Băng (tây)
    blob(99, 3, 117, 8, 1112);                             // Băng Hồ Bắc
    R(126, 90, 153, 112, 'R'); R(124, 94, 155, 108, 'R');  // Băng Hồ Đông (lớn)
    for (var yy2 = 90; yy2 <= 112; yy2++) for (var xx2 = 124; xx2 <= 155; xx2++) {
      if (inBlock(xx2, yy2) || g[yy2][xx2] !== 'R') continue;
      var edge2 = (g[yy2 - 1][xx2] !== 'R' || g[yy2 + 1][xx2] !== 'R' || g[yy2][xx2 - 1] !== 'R' || g[yy2][xx2 + 1] !== 'R');
      if (edge2 && hash01(xx2 + 1113, yy2 + 1113 * 5) < 0.35) g[yy2][xx2] = '.';
    }
    // -- Đài / thềm đá (điểm nhấn đúng dòng di chuyển) --
    R(74, 4, 85, 9, 'Q');                                  // Đài Hàn Ngọc (rìa bắc)
    S(74, 4, 'o'); S(85, 4, 'o'); S(74, 9, 'o'); S(85, 9, 'o');
    S(75, 9, 'L'); S(84, 9, 'L');                          // đèn đá 2 góc nam đài
    R(5, 64, 10, 68, 'Q');                                 // Miếu Băng Thần (thềm tây)
    S(5, 64, 'o'); S(10, 64, 'o'); S(5, 68, 'o'); S(10, 68, 'o');
    R(141, 36, 156, 51, 'Q');                              // Đài Băng Đông
    S(141, 36, 'o'); S(156, 36, 'o'); S(141, 51, 'o'); S(156, 51, 'o');
    R(137, 98, 144, 105, 'Q');                             // Đài Giữa Hồ (đảo đá giữa Băng Hồ Đông)
    S(137, 98, 'o'); S(144, 98, 'o'); S(137, 105, 'o'); S(144, 105, 'o');
    R(97, 115, 117, 129, 'Q');                             // Sân Băng Vực (quảng trường săn boss)
    S(97, 115, 'o'); S(117, 115, 'o'); S(97, 129, 'o'); S(117, 129, 'o');
    S(97, 122, 'L'); S(117, 122, 'L');                     // đèn đá giữa 2 mép sân
    R(60, 133, 77, 138, 'Q');                              // Đài Ngắm Băng (rìa nam)
    S(60, 133, 'o'); S(77, 133, 'o');
    // -- Nhà thật: Chòi Gác Bắc + Lán Hái Dược --
    R(44, 12, 46, 14, 'H'); S(43, 13, 'Q');                // chòi + thềm cửa phía tây
    R(13, 50, 15, 52, 'H'); S(14, 53, 'Q');                // lán + bậc cửa phía nam
    // -- Mạng đường (# rộng 2 ô) + bậc đá 'Q' ở điểm dốc --
    R(20, 10, 139, 11, '#');                               // đường vòng bắc
    R(78, 12, 79, 23, '#');                                // trục bắc: vòng bắc -> mép khối (thềm cổng)
    R(78, 16, 79, 19, 'Q');                                // bậc đá lên thềm bắc
    R(20, 12, 21, 129, '#');                               // trục dọc tây
    R(138, 12, 139, 85, '#');                              // trục dọc đông (đoạn bắc)
    R(118, 86, 139, 87, '#');                              // vòng tránh hồ: rẽ tây
    R(118, 88, 119, 120, '#');                             // vòng tránh hồ: dọc bờ tây hồ
    R(118, 121, 139, 122, '#');                            // vòng tránh hồ: rẽ đông
    R(138, 123, 139, 129, '#');                            // trục dọc đông (đoạn nam)
    R(4, 59, 39, 60, '#');                                 // nhánh tây: mép khối -> rừng tuyết tùng/linh tuyền
    R(14, 54, 15, 58, '#');                                // lối vào Lán Hái Dược
    R(26, 54, 27, 58, '#');                                // lối xuống Linh Tuyền Băng
    R(7, 61, 8, 63, '#');                                  // lối xuống Miếu Băng Thần
    R(120, 44, 139, 45, '#');                              // nhánh đông: mép khối -> đài băng
    R(132, 44, 135, 45, 'Q');                              // đoạn bậc đá lên Đài Băng Đông
    R(68, 80, 69, 129, '#');                               // trục nam: mép khối -> đường vòng nam
    R(68, 92, 69, 95, 'Q'); R(68, 110, 69, 113, 'Q');      // 2 đoạn bậc đá xuống thẳm băng
    R(20, 130, 139, 131, '#');                             // đường vòng nam
    S(68, 132, '#'); S(69, 132, '#');                      // lối vào Đài Ngắm Băng
    R(70, 121, 96, 122, '#');                              // nhánh ngang vào Sân Băng Vực
    R(120, 101, 136, 102, 'Q');                            // đê đá qua hồ -> Đài Giữa Hồ
    // -- Khu quái mới: dọn vật chắn trong rect (giữ đường/đài/nước/nhà) --
    var V5_ZONES = [
      { id: 'tuyet_tung_tay', name: 'Khu Tuyết Tùng Tây', rects: [[3, 40, 34, 57]], types: ['khi_mat_do', 'soi_rung'], n: 24 },
      { id: 'ven_linh_tuyen_bang', name: 'Khu Ven Linh Tuyền Băng', rects: [[3, 68, 32, 90]], types: ['khi_mat_do'], n: 14 },
      { id: 'bang_nguyen_bac', name: 'Khu Băng Nguyên Bắc', rects: [[44, 2, 116, 21]], types: ['soi_rung', 'ran_luc'], n: 22 },
      { id: 'bang_ho_dong', name: 'Khu Băng Hồ Đông', rects: [[121, 82, 158, 118]], types: ['soi_rung', 'lon_mong_sat'], n: 28 },
      { id: 'tham_bang_nam', name: 'Khu Thẳm Băng Nam', rects: [[36, 108, 120, 132]], types: ['lon_mong_sat', 'ran_luc'], n: 30 }
    ];
    V5_ZONES.forEach(function (z) {
      z.rects.forEach(function (r) {
        for (var yy = r[1]; yy <= r[3]; yy++) for (var xx = r[0]; xx <= r[2]; xx++) {
          if (inBlock(xx, yy)) continue;
          if (g[yy][xx] === 'T' || g[yy][xx] === 'o') g[yy][xx] = '.';
        }
      });
    });
    // -- NPC mới (đứng cạnh trạm của mình, không giữa đường) --
    var V5_NPCS = [
      { id: 'tuan_bang_son', x: 47, y: 13, sprite: 'linh_gac', name: 'Lục Hàn Sơn', role: 'Tuần tra băng cốc, giữ Chòi Gác Bắc ở Hàn Băng Cốc' },
      { id: 'ton_tuyet_nuong', x: 17, y: 53, sprite: 'giu_mieu', name: 'Tôn Tuyết Nương', role: 'Dược nữ hái băng tinh hoa ở Lán Hái Dược' },
      { id: 'han_ngoc_dao', x: 80, y: 6, sprite: 'hoc_tro', name: 'Hàn Ngọc Dao', role: 'Tu sĩ Kim Đan ngắm băng luyện tâm ở Đài Hàn Ngọc' }
    ];
    // -- Dọn bãi 3x3 quanh NPC (chỉ gạt T/o/F) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = g[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') g[yy][xx] = '.';
      }
    }
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // -- Khoét thông túi đất cô lập trong đất mới: gán nhãn thành
    // phần liên thông của ô đi được; thành phần chính = thành phần
    // chứa khối cũ. Mọi thành phần khác ở ĐẤT MỚI được nối về thành
    // phần chính bằng tuyến rẻ nhất qua T/o (chi phí T=7, o=11) tính
    // bằng MỘT lần Dijkstra đa nguồn từ thành phần chính (không đụng
    // nhà/nước/vách, không sửa ô trong khối cũ). --
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    var comp = [], nComp = 0, xx2, yy2;
    for (yy2 = 0; yy2 < NH; yy2++) { var crow = []; for (xx2 = 0; xx2 < NW; xx2++) crow.push(-1); comp.push(crow); }
    var compCells = [];
    for (yy2 = 0; yy2 < NH; yy2++) for (xx2 = 0; xx2 < NW; xx2++) {
      if (!walkT(xx2, yy2) || comp[yy2][xx2] >= 0) continue;
      var cid = nComp++, cells = [], q2 = [[xx2, yy2]];
      comp[yy2][xx2] = cid;
      while (q2.length) {
        var cc = q2.pop(); cells.push(cc);
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
          var ax3 = cc[0] + d[0], ay3 = cc[1] + d[1];
          if (ax3 < 0 || ay3 < 0 || ax3 >= NW || ay3 >= NH) return;
          if (comp[ay3][ax3] >= 0 || !walkT(ax3, ay3)) return;
          comp[ay3][ax3] = cid; q2.push([ax3, ay3]);
        });
      }
      compCells.push(cells);
    }
    var mainComp = comp[AY + 46][AX + 39]; // ô start trong khối cũ (đi được chắc chắn)
    var distC = {}, prevC = {}, heapC = [];
    function lessC(a, b) { return a[0] < b[0]; }
    function pushC(d, cx, cy) { heapC.push([d, cx, cy]); var i = heapC.length - 1; while (i > 0) { var p = (i - 1) >> 1; if (!lessC(heapC[i], heapC[p])) break; var t = heapC[i]; heapC[i] = heapC[p]; heapC[p] = t; i = p; } }
    function popC() { var top = heapC[0], last = heapC.pop(); if (heapC.length) { heapC[0] = last; var i = 0; for (;;) { var l = i * 2 + 1, r = l + 1, m = i; if (l < heapC.length && lessC(heapC[l], heapC[m])) m = l; if (r < heapC.length && lessC(heapC[r], heapC[m])) m = r; if (m === i) break; var t = heapC[i]; heapC[i] = heapC[m]; heapC[m] = t; i = m; } } return top; }
    compCells[mainComp].forEach(function (c) { var k = c[0] + ',' + c[1]; if (distC[k] === undefined) { distC[k] = 0; pushC(0, c[0], c[1]); } });
    while (heapC.length) {
      var cur = popC(), d0 = cur[0], cx0 = cur[1], cy0 = cur[2], k0 = cx0 + ',' + cy0;
      if (d0 !== distC[k0]) continue;
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
        var nx = cx0 + d[0], ny = cy0 + d[1];
        if (nx < 0 || ny < 0 || nx >= NW || ny >= NH) return;
        var ch = g[ny][nx], cost;
        if (!blockedT[ch]) cost = 1;
        else if (ch === 'T') cost = 7;
        else if (ch === 'o') cost = 11;
        else return;
        var nk = nx + ',' + ny, nd = d0 + cost;
        if (distC[nk] === undefined || nd < distC[nk]) { distC[nk] = nd; prevC[nk] = k0; pushC(nd, nx, ny); }
      });
    }
    for (var ci = 0; ci < nComp; ci++) {
      if (ci === mainComp) continue;
      var cellsC = compCells[ci];
      var touchesNew = false, best = null, bestD = Infinity;
      for (var i2 = 0; i2 < cellsC.length; i2++) {
        var c2 = cellsC[i2];
        if (!inBlock(c2[0], c2[1])) touchesNew = true;
        var dd = distC[c2[0] + ',' + c2[1]];
        if (dd !== undefined && dd < bestD) { bestD = dd; best = c2; }
      }
      if (!touchesNew || !best) continue; // túi nằm trọn trong khối cũ: giữ nguyên như bản hiện hành
      var kk = best[0] + ',' + best[1], guard = 0;
      while (prevC[kk] && guard++ < 100000) {
        var pp = kk.split(','), px = +pp[0], py = +pp[1];
        if (!inBlock(px, py) && blockedT[g[py][px]]) g[py][px] = '.';
        kk = prevC[kk];
      }
    }
    // -- Chọn spawn tất định trong khu mới (luật audit L2/L3/L4): chỉ
    // ô '.' trong rect khu, cách spawn khác >= 2 Chebyshev, cách điểm
    // an toàn (cổng/điểm rơi/start/sào/NPC) >= 5, hộp lang thang +-4
    // không chứa điểm rơi/start. --
    var ENTRIES5 = [[79, 70], [80, 70], [79, 33], [80, 33]]; // start + điểm rơi map10/map12 (đã dịch neo)
    var safe5 = ENTRIES5.concat([[94, 64]]); // + tâm sào Động Băng Tinh (đã dịch neo)
    (map.portals || []).forEach(function (p) { safe5.push([p.x + AX, p.y + AY]); });
    V5_NPCS.forEach(function (n) { safe5.push([n.x, n.y]); });
    var taken5 = (map.monsters || []).map(function (m) { return [m.x + AX, m.y + AY]; });
    function cheb5(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
    function spawnOK(cx, cy) {
      if (g[cy][cx] !== '.') return false;
      for (var i = 0; i < safe5.length; i++) if (cheb5(cx, cy, safe5[i][0], safe5[i][1]) < 5) return false;
      for (var j = 0; j < taken5.length; j++) if (cheb5(cx, cy, taken5[j][0], taken5[j][1]) < 2) return false;
      for (var e = 0; e < ENTRIES5.length; e++) {
        if (Math.abs(cx - ENTRIES5[e][0]) <= 4 && Math.abs(cy - ENTRIES5[e][1]) <= 4) return false;
      }
      return true;
    }
    var V5_SPAWNS = [];
    V5_ZONES.forEach(function (z, zi) {
      var cells = [], cx2, cy2;
      z.rects.forEach(function (r) {
        for (cy2 = r[1]; cy2 <= r[3]; cy2++) for (cx2 = r[0]; cx2 <= r[2]; cx2++) cells.push([cx2, cy2]);
      });
      var salt = 11300 + zi * 131;
      cells.sort(function (a, b) { return hash01(a[0] * 3 + salt, a[1] * 7) - hash01(b[0] * 3 + salt, b[1] * 7); });
      var picked = 0;
      for (var i = 0; i < cells.length && picked < z.n; i++) {
        var c = cells[i];
        if (!spawnOK(c[0], c[1])) continue;
        V5_SPAWNS.push({ type: z.types[picked % z.types.length], x: c[0], y: c[1], zone: z.id });
        taken5.push([c[0], c[1]]);
        picked++;
      }
      z.picked = picked;
    });
    // -- Chọn dược mới tất định theo vùng (ô '.', cách spawn >= 2) --
    var V5_HERB_AREAS = [
      { r: [44, 2, 116, 21], item: 'bang_tinh_hoa', n: 5, salt: 1141 },
      { r: [4, 40, 33, 57], item: 'bang_tinh_hoa', n: 5, salt: 1142 },
      { r: [20, 44, 34, 58], item: 'ngoc_tuy_chi', n: 4, salt: 1143 },
      { r: [121, 82, 158, 118], item: 'bang_tinh_hoa', n: 5, salt: 1144 },
      { r: [38, 110, 118, 131], item: 'ngoc_tuy_chi', n: 4, salt: 1145 },
      { r: [3, 62, 14, 72], item: 'bang_tinh_hoa', n: 3, salt: 1146 }
    ];
    var V5_HERBS = [];
    V5_HERB_AREAS.forEach(function (ha) {
      var cells = [], cx3, cy3;
      for (cy3 = ha.r[1]; cy3 <= ha.r[3]; cy3++) for (cx3 = ha.r[0]; cx3 <= ha.r[2]; cx3++) cells.push([cx3, cy3]);
      cells.sort(function (a, b) { return hash01(a[0] * 5 + ha.salt, a[1] * 11) - hash01(b[0] * 5 + ha.salt, b[1] * 11); });
      var got = 0;
      for (var i = 0; i < cells.length && got < ha.n; i++) {
        var c = cells[i];
        if (g[c[1]][c[0]] !== '.') continue;
        var okH = true;
        for (var j = 0; j < taken5.length; j++) if (cheb5(c[0], c[1], taken5[j][0], taken5[j][1]) < 2) { okH = false; break; }
        if (okH) for (var k = 0; k < V5_HERBS.length; k++) if (cheb5(c[0], c[1], V5_HERBS[k].x, V5_HERBS[k].y) < 2) { okH = false; break; }
        if (!okH) continue;
        V5_HERBS.push({ x: c[0], y: c[1], item: ha.item });
        got++;
      }
      ha.got = got;
    });
    V5_HERBS.forEach(function (hb) { clearPatch(hb.x, hb.y); });
    // -- Dịch toàn bộ nội dung cũ của map 11 theo neo (+40,+24) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start); shPt(map.well); shPt(map.bossSpawn); shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 10/12 KHÔNG đổi hình học ở khối này
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 11 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map11') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map11') { p.tx += AX; p.ty += AY; } });
    });
    // -- Đẩy nội dung mới --
    V5_ZONES.forEach(function (z) { map.zones.push({ id: z.id, name: z.name, rects: z.rects, types: z.types }); });
    V5_SPAWNS.forEach(function (s) { map.monsters.push(s); });
    V5_HERBS.forEach(function (hb) { map.herbs.push(hb); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 80, y: 11, label: 'Đài Hàn Ngọc' },
      { sprite: 'sign', x: 48, y: 11, label: 'Chòi Gác Bắc · Đường Vòng Bắc' },
      { sprite: 'sign', x: 95, y: 13, label: 'Khu Băng Nguyên Bắc · Băng Hồ Bắc' },
      { sprite: 'sign', x: 36, y: 57, label: 'Khu Tuyết Tùng Tây' },
      { sprite: 'sign', x: 28, y: 58, label: 'Linh Tuyền Băng' },
      { sprite: 'sign', x: 11, y: 66, label: 'Miếu Băng Thần' },
      { sprite: 'sign', x: 23, y: 75, label: 'Khu Ven Linh Tuyền Băng' },
      { sprite: 'sign', x: 124, y: 47, label: 'Đài Băng Đông · Băng Hồ Đông' },
      { sprite: 'sign', x: 143, y: 99, label: 'Đài Giữa Hồ Băng' },
      { sprite: 'sign', x: 66, y: 100, label: 'Bậc Đá Xuống Thẳm Băng' },
      { sprite: 'sign', x: 100, y: 128, label: 'Sân Băng Vực — Đất Săn Boss' },
      { sprite: 'sign', x: 70, y: 128, label: 'Đài Ngắm Băng · Thẳm Băng Nam' }
    );
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map11-bg-v9.webp';
  })();

  // ---- MỞ RỘNG MAP 12 V5 — GẤP 10 DIỆN TÍCH (chương trình map 2–14
  // ghi 22:26 + lệnh xưởng xuyên đêm 23:04 ngày 2026-10-30): map 12
  // Lôi Trì Thiên Khanh từ 88x60 ô (5280, đã gồm lõi gốc 64x44) lên
  // 176x160 ô (28160 ô = đúng 10x diện tích map gốc 2816 ô). Toàn bộ
  // khối 88x60 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+44,+0) trong
  // khung mới — khối tựa lên phía bắc (cổng bắc lên Tinh Vẫn giữ ở
  // mép bắc khối như quy ước neo map 10 V5) để đất mở sâu xuống phía
  // nam: Thiên Khanh là hố trời khổng lồ, càng xuống đáy càng nguy
  // hiểm. Đất mới: cánh tây có Bãi Cột Sét (cột đá bị sét chẻ) +
  // rừng thông lôi Sườn Tây + Đài Tụ Lôi + Hồ Lôi Tây; cánh đông có
  // Miếu Lôi Thần trên thềm đá + Lều Đội Săn + Hồ Lôi Đông lớn bờ
  // hữu cơ có đê đá 'Q' bắc qua Đài Giữa Hồ; trục nam từ điểm rơi
  // xuống Trạm Dừng Chân Thiên Khanh, qua 2 đoạn BẬC ĐÁ 'Q', vòng
  // Đường Vòng Khanh ở hàng 118-119, vào Thâm Khanh và kết ở Sân
  // Săn Thiên Khanh (sân đá rộng săn boss đông người) + Đài Ngắm
  // Lôi ở rìa nam. Khu quái theo thang Nguyên Anh của map, càng xa
  // điểm rơi càng nặng: khỉ/rắn cánh gần -> rắn/sói ven hồ -> sói/
  // lợn Thâm Khanh và Sân Săn phía nam sâu nhất. EXP_LAYOUT_V nâng
  // thêm 1 nấc khi tích hợp: game.js migrateLayoutV10 dịch save
  // theo EXP_V5_MAP12 cho riêng map 12 (save cũ hơn vẫn chạy đủ
  // các nấc trước như cũ). Tọa độ map 12 hardcode ngoài maps.js
  // phải dịch cùng neo (+44,+0) khi tích hợp: bosses.js (sào + bia
  // Lôi Xà Vương (44,30)/(45,30) -> (88,30)/(89,30); Thiên Lôi Xà
  // Vương (22,16)/(23,16) -> (66,16)/(67,16)).
  var EXP_V5_MAP12 = { dx: 44, dy: 0 };
  (function expandMap12V5() {
    var map = MAPS.map12;
    var OW = map.w, OH = map.h, NW = 176, NH = 160;
    var AX = EXP_V5_MAP12.dx, AY = EXP_V5_MAP12.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải CỤM cây/đá cho đất MỚI (deterministic, cùng thuật toán cụm
    // 3x3 các vành trước — cụm có nhịp, không rải điểm đều). Thiên
    // Khanh là đất sét đánh: phía bắc tây đá cột trội, sườn tây
    // thông lôi thành rừng, đáy khanh phía nam đá trơ trội.
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      function h2(xx, yy) { var n = Math.sin(xx * 127.1 + yy * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); }
      var cx, cy, px, py;
      for (cy = y0 - 3; cy <= y1 + 3; cy += 3) for (cx = x0 - 3; cx <= x1 + 3; cx += 3) {
        if (h2(cx, cy) > 0.45) continue;
        for (py = cy; py < cy + 3; py++) for (px = cx; px < cx + 3; px++) {
          if (px < x0 || px > x1 || py < y0 || py > y1 || inBlock(px, py)) continue;
          var r0 = h2(px, py);
          g[py][px] = r0 < pT ? 'T' : (r0 < pT + pO ? 'o' : '.');
        }
      }
    }
    scatter(1, 1, 42, 33, 0.10, 0.30, 1201);   // Bãi Cột Sét bắc tây: đá cột trội
    scatter(1, 35, 42, 84, 0.30, 0.05, 1202);  // Sườn Tây: rừng thông lôi
    scatter(1, 86, 46, 136, 0.18, 0.08, 1203); // ven Hồ Lôi Tây
    scatter(133, 1, 174, 40, 0.14, 0.20, 1204);// đông bắc: thông + đá quanh miếu
    scatter(133, 42, 174, 72, 0.22, 0.08, 1205); // đông giữa: rừng quanh Lều Đội Săn
    scatter(133, 108, 174, 140, 0.20, 0.10, 1206); // đông nam dưới hồ
    scatter(2, 100, 60, 157, 0.10, 0.14, 1207);  // nam tây đáy khanh
    scatter(116, 100, 173, 157, 0.10, 0.14, 1208); // nam đông đáy khanh
    scatter(48, 62, 127, 97, 0.08, 0.16, 1209);  // gò giữa nam dưới khối
    scatter(48, 100, 127, 136, 0.06, 0.18, 1210); // Thâm Khanh: đá trơ trội
    // Dọn hành lang quanh các tuyến/công trình sẽ vẽ (chỉ đất mới).
    R(14, 21, 20, 121, '.');     // hành lang đường tây
    R(14, 21, 43, 26, '.');      // nhánh tây bắc vào khối
    R(14, 35, 43, 40, '.');      // nhánh ngang tây vào khối
    R(156, 21, 161, 121, '.');   // hành lang đường đông
    R(132, 21, 161, 26, '.');    // nhánh đông bắc vào khối
    R(132, 35, 161, 40, '.');    // nhánh ngang đông vào khối
    R(15, 66, 160, 71, '.');     // hành lang đường ngang giữa (qua trạm)
    R(15, 116, 160, 121, '.');   // hành lang Đường Vòng Khanh
    R(85, 58, 90, 158, '.');     // hành lang trục nam (phần trong khối tự giữ)
    R(30, 7, 38, 15, '.');       // Chòi Gác Tây
    R(21, 41, 34, 54, '.');      // Đài Tụ Lôi Tây
    R(6, 8, 40, 32, '.');        // thềm Bãi Cột Sét (chỉ dọn thưa, cột đá đặt tay ở dưới)
    R(75, 69, 101, 79, '.');     // Trạm Dừng Chân Thiên Khanh
    R(137, 17, 154, 30, '.');    // Miếu Lôi Thần
    R(140, 55, 158, 69, '.');    // Lều Đội Săn
    R(16, 82, 42, 104, '.');     // Hồ Lôi Tây + thềm ngắm
    R(124, 74, 174, 110, '.');   // Hồ Lôi Đông + đê đá + đài giữa hồ
    R(63, 135, 112, 152, '.');   // Sân Săn Thiên Khanh
    R(80, 150, 95, 158, '.');    // Đài Ngắm Lôi
    // VIỀN VÁCH ĐÁ quanh đất mới (rìa Thiên Khanh là vách trời).
    R(0, 0, 43, 0, 'W'); R(132, 0, 175, 0, 'W');
    R(0, 159, 175, 159, 'W');
    R(0, 1, 0, 158, 'W'); R(175, 1, 175, 158, 'W');
    // NƯỚC: hồ lôi bờ HỮU CƠ (hợp nhiều elip + nhiễu băm ở mép) —
    // tuyệt đối không hồ hình hộp như nền cũ bị QA chê.
    function blob(cells, salt) {
      function hb(xx, yy) { var n = Math.sin(xx * 269.5 + yy * 183.3 + salt * 41.3) * 43758.5453; return n - Math.floor(n); }
      var x0 = 999, y0 = 999, x1 = -1, y1 = -1, i, c;
      for (i = 0; i < cells.length; i++) { c = cells[i]; x0 = Math.min(x0, Math.floor(c[0] - c[2] - 1)); x1 = Math.max(x1, Math.ceil(c[0] + c[2] + 1)); y0 = Math.min(y0, Math.floor(c[1] - c[3] - 1)); y1 = Math.max(y1, Math.ceil(c[1] + c[3] + 1)); }
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        var best = 1e9;
        for (i = 0; i < cells.length; i++) { c = cells[i]; var dx = (xx - c[0]) / c[2], dy = (yy - c[1]) / c[3], v = dx * dx + dy * dy; if (v < best) best = v; }
        if (best < 1 + (hb(xx, yy) - 0.5) * 0.55) S(xx, yy, 'R');
      }
    }
    blob([[27, 93, 7, 5], [33, 97, 5, 3.4], [22, 97, 4.5, 3]], 1221); // Hồ Lôi Tây
    blob([[152, 90, 13, 9], [139, 83, 7, 5], [164, 98, 8, 6], [145, 100, 6, 4]], 1222); // Hồ Lôi Đông
    // Lấp "lỗ đất" lọt trong hồ: ô '.' bị nước bao >= 3 phía là lỗi
    // răng cưa của bờ hữu cơ — cho thành nước để mặt hồ liền (đê đá
    // và Đài Giữa Hồ vẽ sau sẽ đè lên bình thường).
    (function fillLakeHoles() {
      var changed = true, gd = 0;
      while (changed && gd++ < 20) {
        changed = false;
        for (var yy = 1; yy < NH - 1; yy++) for (var xx = 1; xx < NW - 1; xx++) {
          if (inBlock(xx, yy) || g[yy][xx] !== '.') continue;
          var nR = (g[yy - 1][xx] === 'R') + (g[yy + 1][xx] === 'R') + (g[yy][xx - 1] === 'R') + (g[yy][xx + 1] === 'R');
          if (nR >= 3) { g[yy][xx] = 'R'; changed = true; }
        }
      }
    })();
    // ĐƯỜNG (mọi tuyến >= 2 ô, nối liền khối cũ qua đúng các ô mép
    // khối đang đi được: nhánh tây tại hàng 23-24 và 37-38, nhánh
    // đông tương ứng, trục nam tại cột 87-88 dưới điểm rơi).
    R(16, 24, 17, 118, '#');                       // đường tây: nhánh bắc -> Đường Vòng
    R(18, 23, 43, 24, '#');                        // nhánh tây bắc: đường tây -> mép khối
    R(18, 37, 43, 38, '#');                        // nhánh ngang tây: đường tây -> mép khối
    R(158, 24, 159, 118, '#');                     // đường đông: nhánh bắc -> Đường Vòng
    R(132, 23, 157, 24, '#');                      // nhánh đông bắc: mép khối -> đường đông
    R(132, 37, 157, 38, '#');                      // nhánh ngang đông: mép khối -> đường đông
    R(18, 68, 157, 69, '#');                       // đường ngang giữa: tây -> đông (qua trạm dừng chân)
    R(87, 60, 88, 137, '#');                       // trục nam: mép nam khối -> Sân Săn
    R(87, 76, 88, 80, 'Q'); R(87, 106, 88, 110, 'Q'); // 2 đoạn BẬC ĐÁ ở điểm xuống dốc đáy khanh
    R(17, 118, 158, 119, '#');                     // Đường Vòng Khanh (nối 2 cánh ở đáy)
    R(148, 66, 149, 67, '#');                      // ngõ Lều Đội Săn -> đường ngang giữa
    R(87, 151, 88, 152, '#');                      // ngõ Sân Săn -> Đài Ngắm Lôi
    // CÔNG TRÌNH + điểm nhấn (mái 'H' chặn, bậc cửa 'Q' đi được).
    R(24, 44, 31, 51, 'Q');                        // Đài Tụ Lôi Tây (thềm đá tụ lôi)
    S(24, 44, 'o'); S(31, 44, 'o'); S(24, 51, 'o'); S(31, 51, 'o'); // 4 cột dẫn lôi ở góc đài
    S(26, 45, 'L'); S(29, 45, 'L');                // đèn đá trên đài
    R(18, 47, 23, 48, '#');                        // nhánh vào Đài Tụ Lôi từ đường tây
    R(33, 10, 35, 11, 'H'); S(34, 12, 'Q');        // Chòi Gác Tây + bậc cửa
    S(32, 13, 'F'); S(36, 13, 'F');                // rào chòi gác
    R(8, 10, 15, 15, 'Q'); R(22, 18, 27, 22, 'Q'); // 2 thềm đá Bãi Cột Sét
    [[10, 20], [11, 20], [30, 8], [31, 8], [18, 28], [19, 28], [36, 26], [37, 26], [6, 30], [7, 30]].forEach(function (p) { S(p[0], p[1], 'o'); }); // cặp cột sét chẻ đặt tay theo cụm
    R(81, 71, 94, 76, 'Q');                        // sân đá Trạm Dừng Chân Thiên Khanh
    R(78, 71, 80, 72, 'H'); S(79, 73, 'Q');        // nhà trạm tây + bậc cửa
    R(95, 71, 97, 72, 'H'); S(96, 73, 'Q');        // nhà trạm đông + bậc cửa
    S(82, 76, 'L'); S(93, 76, 'L');                // đèn sân trạm
    S(77, 74, 'F'); S(98, 74, 'F');                // rào 2 đầu sân trạm
    R(140, 20, 151, 27, 'Q');                      // thềm Miếu Lôi Thần
    R(143, 22, 145, 23, 'H');                      // miếu (mái trên thềm)
    S(141, 21, 'L'); S(150, 21, 'L');              // đèn miếu
    S(140, 27, 'o'); S(151, 27, 'o');              // 2 cột đá chân thềm miếu
    R(144, 59, 146, 60, 'H'); S(145, 61, 'Q');     // lều săn tây + bậc cửa
    R(151, 59, 153, 60, 'H'); S(152, 61, 'Q');     // lều săn đông + bậc cửa
    R(147, 62, 150, 64, 'Q');                      // sân Lều Đội Săn
    S(143, 58, 'F'); S(154, 58, 'F'); S(143, 65, 'F'); S(154, 65, 'F'); // rào lều
    S(147, 58, 'L'); S(150, 58, 'L');              // đèn lều
    // (Đã bỏ thềm ngắm Hồ Lôi Tây: tranh tô lại hồ dạt sát mép tây,
    // điểm ngắm hồ chuyển thành biển + NPC Tần Hái ngay bờ đông của hồ.)
    S(23, 85, 'L'); S(28, 85, 'L');                // đèn thềm hồ tây
    R(126, 90, 172, 91, 'Q');                      // đê đá qua Hồ Lôi Đông
    R(149, 87, 154, 94, 'Q');                      // Đài Giữa Hồ (đảo đá giữa hồ lôi)
    S(149, 87, 'o'); S(154, 87, 'o'); S(149, 94, 'o'); S(154, 94, 'o'); // cột góc đài
    S(151, 88, 'L'); S(152, 88, 'L');              // đèn đài giữa hồ
    R(66, 138, 109, 150, 'Q');                     // Sân Săn Thiên Khanh (sân đá rộng cuối trục nam)
    S(66, 138, 'o'); S(109, 138, 'o'); S(66, 150, 'o'); S(109, 150, 'o'); // cột góc sân
    S(76, 138, 'L'); S(99, 138, 'L'); S(76, 150, 'L'); S(99, 150, 'L');   // đèn sân săn
    R(83, 153, 92, 156, 'Q');                      // Đài Ngắm Lôi ở rìa nam
    [83, 84, 85, 86, 89, 90, 91, 92].forEach(function (xx) { S(xx, 156, 'F'); }); // lan can đài, chừa lối trục 87-88
    S(87, 156, 'Q'); S(88, 156, 'Q');
    S(84, 153, 'L'); S(91, 153, 'L');              // đèn đài ngắm
    // Dọn bãi 3x3 quanh spawn/dược/NPC/biển mới (chỉ gạt T/o/F ở đất mới).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    var V5_SPAWNS = [
      ['khi_mat_do', 14, 24, 'cot_set'], ['khi_mat_do', 36, 16, 'cot_set'], ['ran_luc', 24, 30, 'cot_set'],
      ['ran_luc', 10, 52, 'suon_tay'], ['khi_mat_do', 30, 60, 'suon_tay'], ['ran_luc', 8, 74, 'suon_tay'],
      ['ran_luc', 41, 90, 'ven_ho_tay'], ['soi_rung', 16, 108, 'ven_ho_tay'], ['ran_luc', 40, 105, 'ven_ho_tay'],
      ['khi_mat_do', 138, 12, 'mieu_dong'], ['soi_rung', 166, 14, 'mieu_dong'], ['khi_mat_do', 160, 32, 'mieu_dong'],
      ['ran_luc', 136, 66, 'bo_ho_dong'], ['soi_rung', 168, 64, 'bo_ho_dong'], ['ran_luc', 138, 108, 'bo_ho_dong'], ['soi_rung', 166, 110, 'bo_ho_dong'],
      ['soi_rung', 60, 104, 'tham_khanh'], ['lon_mong_sat', 100, 100, 'tham_khanh'], ['soi_rung', 76, 112, 'tham_khanh'], ['lon_mong_sat', 116, 108, 'tham_khanh'],
      ['lon_mong_sat', 56, 128, 'nam_khanh'], ['soi_rung', 120, 130, 'nam_khanh'], ['lon_mong_sat', 88, 144, 'nam_khanh'], ['soi_rung', 104, 146, 'nam_khanh'], ['lon_mong_sat', 70, 148, 'nam_khanh'], ['soi_rung', 52, 146, 'nam_khanh']
    ];
    var V5_HERBS = [
      [20, 14, 'thien_loi_qua'], [148, 30, 'thien_loi_qua'], [38, 104, 'thien_loi_qua'],
      [137, 104, 'thien_loi_qua'], [164, 84, 'thien_loi_qua'],
      [60, 124, 'thien_loi_qua'], [112, 126, 'thien_loi_qua'],
      [88, 141, 'thanh_linh_tuy'], [12, 124, 'thanh_linh_tuy'], [170, 140, 'thanh_linh_tuy'],
      [44, 152, 'van_nien_linh_chi'], [131, 152, 'van_nien_linh_chi']
    ];
    var V5_NPCS = [
      { id: 'han_ba', x: 87, y: 74, sprite: 'chu_quan', name: 'Hàn Bá', role: 'Người coi Trạm Dừng Chân Thiên Khanh' },
      { id: 'trinh_vien', x: 34, y: 13, sprite: 'linh_gac', name: 'Trình Viễn', role: 'Người gác Bãi Cột Sét phía tây Thiên Khanh' },
      { id: 'an_tich', x: 146, y: 25, sprite: 'giu_mieu', name: 'Ân Tịch', role: 'Người trông Miếu Lôi Thần' },
      { id: 'loi_tam_nuong', x: 148, y: 63, sprite: 'tho_san_ha', name: 'Lôi Tam Nương', role: 'Thợ săn lôi thú ở Lều Đội Săn' },
      { id: 'tan_hai', x: 19, y: 92, sprite: 'tho_san_ha', name: 'Tần Hái', role: 'Người hái Thiên Lôi Quả ở bờ Hồ Lôi Tây' }
    ];
    var V5_SIGNS = [
      [85, 70, 'Trạm Dừng Chân Thiên Khanh'],
      [20, 46, 'Đài Tụ Lôi Tây'],
      [14, 17, 'Bãi Cột Sét'],
      [22, 90, 'Bờ Hồ Lôi Tây'],
      [142, 18, 'Miếu Lôi Thần'],
      [147, 56, 'Lều Đội Săn Thiên Khanh'],
      [132, 87, 'Hồ Lôi Đông'],
      [60, 117, 'Đường Vòng Khanh'],
      [70, 136, 'Sân Săn Thiên Khanh'],
      [85, 152, 'Đài Ngắm Lôi'],
      [100, 67, 'Nam: Thâm Khanh · Sân Săn Thiên Khanh'],
      [24, 120, 'Nam: Thâm Khanh'],
      [156, 40, 'Đông: Miếu Lôi Thần · Hồ Lôi Đông']
    ];
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (p) { clearPatch(p[0], p[1]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    V5_SIGNS.forEach(function (s) { clearPatch(s[0], s[1]); });
    // Khoét thông mọi túi đất-mới bị cô lập vào khối cũ (chỉ gạt T/o,
    // cùng thuật toán bản V5 của map 9).
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    function bfsT(sx, sy) {
      var seen = {}, q = [[sx, sy]];
      if (!walkT(sx, sy)) return seen;
      seen[sx + ',' + sy] = 1;
      while (q.length) {
        var c = q.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && walkT(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    // Dijkstra heap nhị phân từ 1 ô túi tới vùng đã thông (chỉ đất
    // mới; chi phí: T/o = 1, ô chắn khác = 1e6) — thay bản quét tuyến
    // tính của map 9 vì lưới 176x160 lớn hơn hẳn.
    function dvDijkstra9(sx, sy, reach) {
      var dist = {}, prev = {}, heap = [];
      function hpush(it) { heap.push(it); var i = heap.length - 1; while (i > 0) { var p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; var t = heap[p]; heap[p] = heap[i]; heap[i] = t; i = p; } }
      function hpop() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var i = 0; for (;;) { var l = i * 2 + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; var t = heap[m]; heap[m] = heap[i]; heap[i] = t; i = m; } } return top; }
      dist[sx + ',' + sy] = 0;
      hpush([0, sx, sy]);
      while (heap.length) {
        var cur = hpop(), cx2 = cur[1], cy2 = cur[2], ck = cx2 + ',' + cy2;
        if (dist[ck] !== cur[0]) continue;
        if (reach[ck]) {
          var path = [], k2 = ck;
          while (prev[k2]) { var pp = prev[k2]; path.push([pp[0], pp[1]]); k2 = pp[0] + ',' + pp[1]; }
          return path;
        }
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cx2 + d[0], ny = cy2 + d[1];
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny)) return;
          var ch = g[ny][nx], w = (ch === 'T' || ch === 'o') ? 1 : (blockedT[ch] ? 1e6 : 0), nk = nx + ',' + ny, nd = cur[0] + w;
          if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = [cx2, cy2]; hpush([nd, nx, ny]); }
        });
      }
      return null;
    }
var LAKE_WEST_SPANS = { 81: '5,7-8,10', 82: '5-13', 83: '5-15', 84: '4-6,8-15', 85: '2-15', 86: '2-16,18-21', 87: '3-22', 88: '2-21', 89: '2-21', 90: '3-21', 91: '4-16,19-21', 92: '4-15', 93: '4-15', 94: '5-15', 95: '6-14', 96: '8-14', 97: '8-14', 98: '11-13' };
var LAKE_EAST_SPANS = { 76: '140-141', 77: '139,141-142', 78: '137-142,151', 79: '135-143,150-151,158', 80: '134-144,150-152,158', 81: '133-145,148-153,158', 82: '132-156,158', 83: '132-159', 84: '132-158,160', 85: '132-158,160-162', 86: '132-148,150-152,154-165', 87: '136-147,155-165', 88: '137-147,155-158,160-165', 89: '138-147,155-158,160-165', 90: '138-141,143-145,158-160,162-166', 91: '139-144,158-160,162,164-166', 92: '139-147,155-158,160-165', 93: '139-147,155-168', 94: '139-147,155-157,160-169', 95: '140-146,148-157,160-170', 96: '139-157,160-172', 97: '140-157,160-172', 98: '141-158,160-171', 99: '140-158,160-171', 100: '139-158,160-171', 101: '139-151,158-171', 102: '140-149,158,160-170', 103: '142-149,161-168', 104: '144-147,161-167' };
  // CHỈNH DỮ LIỆU KHỚP TRANH (theo cách đội map 9): dấu chân nước đo từ
  // tranh nền đã tô (phân đoạn màu + flood-fill từng thùy hồ). Ô đang là
  // đường (#), thềm/đê/đảo (Q), vách biên (W) hoặc cổng (G) thì giữ nguyên.
  function alignLake(spans, x0, y0, x1, y1) {
    var inside = {};
    for (var sy in spans) {
      spans[sy].split(',').forEach(function (part) {
        var ab = part.split('-'); var a = +ab[0]; var b = ab.length > 1 ? +ab[1] : a;
        for (var xx = a; xx <= b; xx++) inside[xx + ',' + sy] = 1;
      });
    }
    for (var yy = y0; yy <= y1; yy++) for (var xx2 = x0; xx2 <= x1; xx2++) {
      var ch = g[yy][xx2];
      if (ch === 'Q' || ch === '#' || ch === 'W' || ch === 'G') continue;
      if (inside[xx2 + ',' + yy]) g[yy][xx2] = 'R';
      else if (ch === 'R') g[yy][xx2] = '.';
    }
  }
  alignLake(LAKE_WEST_SPANS, 2, 78, 30, 106);
  alignLake(LAKE_EAST_SPANS, 124, 72, 175, 112);
  // 2 mỏm đá nhô giữa Hồ Lôi Đông trong tranh (ô đất bị nước bao kín):
  S(140, 77, 'o'); S(147, 95, 'o');
    var carveSkip = {};
    (function carveOrphans() {
      // Gán nhãn thành phần liên thông 1 lần cho toàn đất mới, rồi
      // khoét từng THÀNH PHẦN mồ côi (không phải từng ô) vào vùng đã
      // thông từ điểm rơi trong lõi.
      for (var guard = 0; guard < 500; guard++) {
        var reach = bfsT(AX + 43, AY + 50);
        var comp = {}, nComp = 0, orphans = [];
        for (var yy = 0; yy < NH; yy++) for (var xx = 0; xx < NW; xx++) {
          if (inBlock(xx, yy) || !walkT(xx, yy) || comp[xx + ',' + yy] !== undefined) continue;
          nComp++;
          var cells = [], qq = [[xx, yy]];
          comp[xx + ',' + yy] = nComp;
          var touches = false;
          while (qq.length) {
            var c = qq.pop(); cells.push(c);
            if (reach[c[0] + ',' + c[1]]) touches = true;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
              var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
              if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny) || !walkT(nx, ny) || comp[k] !== undefined) return;
              comp[k] = nComp; qq.push([nx, ny]);
            });
          }
          if (!touches && cells.length) orphans.push(cells[0]);
        }
        if (!orphans.length) return;
        // Chỉ tính là khoét được khi đường khoét thật sự gạt được
        // >= 1 ô T/o; thành phần không khoét được (vd bị nước/vách
        // bao kín) thì bỏ qua hẳn trong lượt này, tránh kẹt vòng lặp.
        var carved = false;
        for (var oi = 0; oi < orphans.length; oi++) {
          var sk = orphans[oi][0] + ',' + orphans[oi][1];
          if (carveSkip[sk]) continue;
          var path = dvDijkstra9(orphans[oi][0], orphans[oi][1], reach);
          var nClear = 0;
          if (path) path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') nClear++; });
          if (path && nClear > 0) {
            path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') g[p[1]][p[0]] = '.'; });
            carved = true;
            break; // tính lại nhãn sau mỗi lần khoét (gộp thành phần)
          }
          carveSkip[sk] = 1;
        }
        if (!carved) return;
      }
    })();
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 12 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map12') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map12') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'cot_set', name: 'Bãi Cột Sét Tây Thiên Khanh', rects: [[3, 3, 42, 34]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'suon_tay', name: 'Sườn Tây Thiên Khanh', rects: [[3, 36, 42, 82]], types: ['ran_luc', 'khi_mat_do'] },
      { id: 'ven_ho_tay', name: 'Ven Hồ Lôi Tây', rects: [[12, 84, 46, 114]], types: ['ran_luc', 'soi_rung'] },
      { id: 'mieu_dong', name: 'Gò Miếu Lôi Phía Đông', rects: [[133, 5, 172, 36]], types: ['khi_mat_do', 'soi_rung'] },
      { id: 'bo_ho_dong', name: 'Bờ Hồ Lôi Đông', rects: [[130, 58, 174, 114]], types: ['ran_luc', 'soi_rung'] },
      { id: 'tham_khanh', name: 'Thâm Khanh', rects: [[46, 94, 128, 117]], types: ['soi_rung', 'lon_mong_sat'] },
      { id: 'nam_khanh', name: 'Đáy Nam Thiên Khanh', rects: [[44, 120, 131, 157]], types: ['lon_mong_sat', 'soi_rung'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (p) { map.herbs.push({ x: p[0], y: p[1], item: p[2] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    V5_SIGNS.forEach(function (s) { map.props.push({ sprite: 'sign', x: s[0], y: s[1], label: s[2] }); });
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map12-bg-v8.webp';
  })();

  // ---- MỞ RỘNG MAP 13 V5 — GẤP 10 DIỆN TÍCH (chương trình map 2–14
  // ghi 22:26 + lệnh xưởng xuyên đêm 23:04 ngày 2026-10-30): map 13
  // Tinh Vẫn Chi Địa từ 80x56 ô (4480, đã gồm lõi gốc 56x40) lên
  // 160x140 ô (22400 ô = đúng 10x diện tích map gốc 2240 ô). Toàn bộ
  // khối 80x56 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+40,+42) trong
  // khung mới — khối nằm giữa, phía bắc mở lên sườn vẫn thạch (Đài
  // Quan Tinh trên thềm đá cao + bậc đá theo tuyến leo + Hố Vẫn Bắc),
  // phía tây là Trạm Khai Tinh + suối Tinh Tuyền xuống Hồ Tinh Quang,
  // phía đông là Xóm Đúc Tinh + Hồ Vẫn Đông, phía nam là Thung Vẫn
  // Nam + Hố Vẫn Nam (hồ tinh thể trong lòng hố). Khu quái theo thang
  // Hóa Thần của map, càng xa lõi càng nặng (rắn/sói sườn bắc -> khỉ/
  // rắn bãi tây -> lợn/khỉ bãi đông -> sói/lợn thung nam). Sào Hố Vẫn
  // Tinh giữ đúng vị trí tương đối trong lõi (dịch theo neo như mọi
  // nội dung). EXP_LAYOUT_V nâng thêm 1 nấc khi tích hợp: game.js
  // migrateLayoutV10 dịch save theo EXP_V5_MAP13 cho riêng map 13
  // (save cũ hơn vẫn chạy đủ các nấc V1->V2 -> V2->V3 -> V3->V4 như
  // cũ). Tọa độ map 13 hardcode ngoài maps.js phải dịch cùng neo khi
  // tích hợp: bosses.js (sào + bia boss Hố Vẫn Tinh (30,28)/(31,28)
  // -> (70,70)/(71,70)).
  var EXP_V5_MAP13 = { dx: 40, dy: 42 };
  (function expandMap13V5() {
    var map = MAPS.map13;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V5_MAP13.dx, AY = EXP_V5_MAP13.dy;
    function inBlock(x, y) { return x >= AX && x < AX + OW && y >= AY && y < AY + OH; }
    var g = [], x, y;
    for (y = 0; y < NH; y++) { var row = []; for (x = 0; x < NW; x++) row.push('.'); g.push(row); }
    var oldRows = map.tiles.map(function (r) { return typeof r === 'string' ? r.split('') : r.slice(); });
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) g[AY + y][AX + x] = oldRows[y][x];
    function S(x, y, ch) { if (x < 0 || y < 0 || x >= NW || y >= NH || inBlock(x, y)) return; g[y][x] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    // Rải cụm cây/đá cho đất MỚI (deterministic, cùng thuật toán các
    // vành trước; ô ven cụm luôn phủ đất trước khi rải). Tinh Vẫn là
    // đất vẫn thạch: phía bắc đá vẫn thạch trội hẳn, phía đông là
    // rừng tinh thể (cây nhiều), phía nam thưa dần xuống thung.
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      function h2(xx, yy) { var n = Math.sin(xx * 127.1 + yy * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); }
      var cx, cy, px, py;
      for (cy = y0 - 3; cy <= y1 + 3; cy += 3) for (cx = x0 - 3; cx <= x1 + 3; cx += 3) {
        if (h2(cx, cy) > 0.45) continue;
        for (py = cy; py < cy + 3; py++) for (px = cx; px < cx + 3; px++) {
          if (px < x0 || px > x1 || py < y0 || py > y1 || inBlock(px, py)) continue;
          var r0 = h2(px, py);
          g[py][px] = r0 < pT ? 'T' : (r0 < pT + pO ? 'o' : '.');
        }
      }
    }
    scatter(1, 1, 158, 41, 0.10, 0.14, 1311);   // sườn bắc: bãi vẫn thạch, đá trội
    scatter(1, 42, 39, 97, 0.18, 0.08, 1312);   // bãi tây: cây tinh thể + đá
    scatter(120, 42, 158, 97, 0.22, 0.06, 1313); // rừng tinh thể đông: cây trội
    scatter(1, 98, 158, 138, 0.08, 0.12, 1314); // thung nam: thưa cây, đá vẫn thạch
    // Dọn hành lang quanh các tuyến/công trình sẽ vẽ (chỉ đất mới).
    R(64, 2, 95, 15, '.');       // thềm Đài Quan Tinh + sân
    R(76, 16, 83, 41, '.');      // hành lang đường trục leo bắc
    R(24, 7, 44, 21, '.');       // bãi Hố Vẫn Bắc
    R(14, 18, 84, 27, '.');      // hành lang đường nhánh tây bắc
    R(78, 22, 145, 27, '.');     // hành lang đường nhánh đông bắc
    R(13, 18, 20, 121, '.');     // hành lang đường tây
    R(6, 56, 39, 76, '.');       // Trạm Khai Tinh + đường ngang tây
    R(21, 28, 28, 136, '.');     // dải suối tây + bồn Hồ Tinh Quang
    R(117, 56, 146, 82, '.');    // Xóm Đúc Tinh + Bãi Tinh Cổ
    R(139, 22, 146, 121, '.');   // hành lang đường đông
    R(130, 26, 158, 44, '.');    // bồn Hồ Vẫn Đông
    R(76, 96, 84, 121, '.');     // hành lang đường trục xuống thung nam
    R(80, 100, 90, 110, '.');    // Trạm Dừng Chân Nam
    R(14, 115, 145, 122, '.');   // hành lang đường vòng chân vẫn
    R(32, 119, 46, 132, '.');    // thềm ngắm Hồ Tinh Quang
    R(44, 119, 68, 135, '.');    // bãi Hố Vẫn Nam
    R(124, 120, 151, 136, '.');  // Suối Tinh Đông Nam + Ao Tinh + đình
    // VIỀN VÁCH ĐÁ quanh đất mới (sống vẫn thạch — mép map là vách).
    R(0, 0, 159, 0, 'W'); R(0, 139, 159, 139, 'W');
    R(0, 1, 0, 138, 'W'); R(159, 1, 159, 138, 'W');
    // HỐ VẪN (vòng đá vẫn thạch 'o' khép kín, chừa cửa theo hướng ghi):
    // Hố Vẫn Bắc cửa nam (về đường nhánh), Hố Vẫn Nam cửa bắc (về
    // đường vòng chân vẫn).
    function crater(cx, cy, rx, ry, gap) {
      for (var dy = -ry - 1; dy <= ry + 1; dy++) for (var dx = -rx - 1; dx <= rx + 1; dx++) {
        var v = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        if (v < 0.80 || v > 1.10) continue;
        if (gap === 'S' && dy > 0 && Math.abs(dx) <= 2) continue;
        if (gap === 'N' && dy < 0 && Math.abs(dx) <= 2) continue;
        S(cx + dx, cy + dy, 'o');
      }
    }
    crater(34, 14, 8, 5, 'S');    // Hố Vẫn Bắc
    crater(56, 127, 10, 6, 'N'); // Hố Vẫn Nam
    S(30, 12, 'o'); S(38, 16, 'o');           // đá rơi trong Hố Vẫn Bắc
    S(52, 124, 'o'); S(61, 129, 'o');         // đá rơi trong Hố Vẫn Nam
    // NƯỚC: suối Tinh Tuyền từ sườn bắc chảy dọc cánh tây xuống Hồ
    // Tinh Quang; Hồ Vẫn Đông 2 thùy chừa đường đông 142-143.
    R(24, 30, 25, 121, 'R');
    R(20, 123, 30, 133, 'R'); R(19, 125, 19, 131, 'R'); R(31, 125, 31, 131, 'R');
    R(21, 122, 29, 122, 'R'); R(21, 134, 29, 134, 'R');
    R(135, 28, 141, 36, 'R'); R(144, 30, 155, 41, 'R'); R(133, 34, 134, 39, 'R');
    R(54, 126, 57, 127, 'R');                 // hồ tinh thể trong Hố Vẫn Nam
    // THỀM ĐÁ + điểm nhấn.
    R(66, 4, 93, 11, 'Q');       // thềm Đài Quan Tinh
    R(66, 3, 93, 3, 'F'); S(79, 3, 'Q'); S(80, 3, 'Q'); // lan can mép bắc đài, chừa lối lên ở trục đường
    S(67, 4, 'L'); S(92, 4, 'L'); S(67, 11, 'L'); S(92, 11, 'L'); // đèn đá 4 góc đài
    R(120, 73, 126, 80, 'Q');    // Bãi Tinh Cổ (thềm ngắm về phía lõi)
    R(34, 124, 44, 129, 'Q');    // thềm ngắm Hồ Tinh Quang
    S(35, 124, 'L'); S(43, 124, 'L'); // đèn thềm hồ
    // ĐƯỜNG (mọi tuyến >= 2 ô, nối liền khối cũ qua đúng các ô mép
    // khung đang đi được: trục bắc/nam tại cột khung 39-40, nhánh
    // tây tại (khung 0,22-23), nhánh đông tại (khung 79,22-23)).
    R(79, 12, 80, 41, '#');                        // đường trục leo bắc: thềm đài -> mép bắc khối
    R(79, 30, 80, 34, 'Q'); R(79, 18, 80, 22, 'Q'); // 2 đoạn BẬC ĐÁ ở điểm lên dốc
    R(18, 20, 78, 21, '#');                        // đường nhánh tây bắc: trục -> đường tây
    R(81, 24, 141, 25, '#');                       // đường nhánh đông bắc: trục -> đường đông
    R(16, 21, 17, 118, '#');                       // đường tây: nhánh bắc -> đường vòng nam
    R(18, 64, 39, 65, '#');                        // nhánh ngang tây: đường tây -> mép tây khối (hàng khung 22-23)
    R(142, 25, 143, 118, '#');                     // đường đông: nhánh bắc -> đường vòng nam
    R(120, 64, 141, 65, '#');                      // nhánh ngang đông: mép đông khối -> đường đông
    R(122, 66, 140, 67, '#');                      // ngõ Xóm Đúc Tinh (giữa 2 dãy nhà)
    R(79, 98, 80, 117, '#');                       // đường trục xuống thung: mép nam khối -> đường vòng
    R(79, 104, 80, 108, 'Q');                      // đoạn BẬC ĐÁ xuống thung
    R(17, 118, 142, 119, '#');                     // đường vòng chân vẫn (qua phía nam hồ)
    R(38, 120, 39, 123, '#');                      // nhánh vào thềm ngắm hồ
    R(127, 126, 127, 130, '#');                    // lối cầu -> Đình Tinh Tuyền
    // CẦU ĐÁ qua suối tây tại 2 giao lộ (nhánh ngang tây + đường vòng).
    S(24, 64, 'Q'); S(25, 64, 'Q'); S(24, 65, 'Q'); S(25, 65, 'Q');
    S(24, 118, 'Q'); S(25, 118, 'Q'); S(24, 119, 'Q'); S(25, 119, 'Q');
    // CÔNG TRÌNH (mái 'H' chặn, bậc cửa 'Q' đi được, NPC đứng cạnh trạm).
    R(69, 6, 71, 7, 'H');                          // Đài Quan Tinh (tháp quan tinh) trên thềm
    R(88, 6, 90, 7, 'H');                          // Miếu Tinh Quân trên thềm
    R(9, 60, 12, 61, 'H'); S(10, 62, 'Q');         // Trạm Khai Tinh + bậc cửa
    [[8, 59], [13, 59], [8, 62]].forEach(function (p) { S(p[0], p[1], 'F'); }); // rào Trạm Khai Tinh
    S(3, 54, 'o'); S(4, 54, 'o'); S(5, 55, 'o'); S(3, 56, 'o'); S(6, 54, 'o'); S(4, 58, 'o'); // miệng Mỏ Tinh Thiết (cụm đá vẫn thạch)
    R(84, 104, 86, 105, 'Q'); S(83, 105, 'Q');     // sân lát đá trước Trạm Dừng Chân Nam
    S(81, 105, '#'); S(82, 105, '#');              // ngõ trạm -> đường trục nam
    R(90, 108, 92, 109, 'H'); S(89, 109, 'Q');     // nhà Trạm Dừng Chân Nam (bên suối x 87-88)
    R(87, 100, 88, 113, 'R');                      // suối nhỏ cạnh trạm
    // Xóm Đúc Tinh (cụm 7 nhà quanh ngõ xóm, lò đúc lớn ở giữa dãy bắc).
    R(123, 60, 126, 62, 'H'); R(129, 59, 133, 62, 'H'); R(135, 60, 138, 62, 'H');
    R(123, 69, 126, 71, 'H'); R(129, 69, 132, 71, 'H'); R(135, 69, 138, 71, 'H');
    S(124, 63, 'Q'); S(131, 63, 'Q'); S(136, 63, 'Q');
    S(124, 68, 'Q'); S(130, 68, 'Q'); S(136, 68, 'Q');
    S(122, 62, 'L'); S(140, 62, 'L'); S(122, 71, 'L'); S(140, 71, 'L');
    R(131, 74, 133, 75, 'H'); S(132, 76, 'Q');     // Nhà Kho Tinh Thiết + bậc cửa
    R(145, 46, 149, 48, 'H'); S(147, 49, 'Q');     // nhà ven Hồ Vẫn Đông + bậc cửa
    // Quần thể bên Hồ Tinh Quang (3 mái nhà trong sân đá trên thềm).
    R(37, 126, 42, 127, 'H'); R(35, 129, 37, 131, 'H'); R(42, 129, 44, 131, 'H');
    // Suối Tinh Đông Nam + Ao Tinh: cho thành nước thật; cầu đá tại
    // đường đông và tại lối xuống Đình Tinh Tuyền.
    R(124, 123, 151, 125, 'R');
    S(142, 123, 'Q'); S(143, 123, 'Q'); S(142, 124, 'Q'); S(143, 124, 'Q'); S(142, 125, 'Q'); S(143, 125, 'Q');
    S(126, 123, 'Q'); S(127, 123, 'Q'); S(126, 124, 'Q'); S(127, 124, 'Q'); S(126, 125, 'Q'); S(127, 125, 'Q');
    R(137, 129, 147, 136, 'R'); R(135, 131, 136, 134, 'R');
    R(126, 131, 129, 132, 'H'); S(127, 133, 'Q');  // Đình Tinh Tuyền + bậc cửa
    // Dọn bãi 3x3 quanh spawn/dược/NPC/biển mới (chỉ gạt T/o/F ở đất mới).
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        if (g[yy][xx] === 'T' || g[yy][xx] === 'o' || g[yy][xx] === 'F') g[yy][xx] = '.';
      }
    }
    var V5_SPAWNS = [
      ['ran_luc', 70, 27, 'dinh_bac'], ['ran_luc', 90, 29, 'dinh_bac'], ['soi_rung', 60, 8, 'dinh_bac'],
      ['soi_rung', 100, 10, 'dinh_bac'], ['ran_luc', 30, 6, 'dinh_bac'], ['soi_rung', 48, 12, 'dinh_bac'],
      ['khi_mat_do', 10, 50, 'bai_tay'], ['khi_mat_do', 30, 84, 'bai_tay'],
      ['ran_luc', 28, 58, 'bai_tay'], ['ran_luc', 12, 92, 'bai_tay'],
      ['lon_mong_sat', 136, 52, 'bai_dong'], ['lon_mong_sat', 150, 66, 'bai_dong'],
      ['khi_mat_do', 130, 90, 'bai_dong'], ['khi_mat_do', 148, 96, 'bai_dong'],
      ['soi_rung', 40, 108, 'thung_nam'], ['soi_rung', 96, 110, 'thung_nam'],
      ['lon_mong_sat', 104, 130, 'thung_nam'], ['soi_rung', 120, 124, 'thung_nam'],
      ['soi_rung', 50, 126, 'thung_nam'], ['lon_mong_sat', 64, 133, 'thung_nam'],
      ['ran_luc', 40, 132, 'ven_ho_tinh'], ['soi_rung', 46, 120, 'ven_ho_tinh']
    ];
    var V5_HERBS = [
      [64, 14, 'tinh_van_thach'], [96, 16, 'tinh_van_thach'], [52, 24, 'tinh_van_thach'],
      [34, 14, 'tinh_van_thach'],
      [26, 44, 'son_tinh'], [140, 44, 'son_tinh'], [118, 30, 'thanh_linh_tuy'],
      [20, 100, 'son_tinh'], [146, 110, 'thanh_linh_tuy'],
      [48, 124, 'tinh_van_thach'], [56, 130, 'van_nien_linh_chi'], [150, 60, 'van_nien_linh_chi']
    ];
    var V5_NPCS = [
      { id: 'mac_quan', x: 74, y: 9, sprite: 'giu_mieu', name: 'Mạc Quan Tinh', role: 'Người quan tinh ở Đài Quan Tinh' },
      { id: 'thach_mo', x: 14, y: 67, sprite: 'tho_san_ha', name: 'Thạch Thiết Sơn', role: 'Thợ khai tinh thiết ở Trạm Khai Tinh' },
      { id: 'hoa_duc', x: 131, y: 67, sprite: 'tho_ren', name: 'Hỏa Vân Nương', role: 'Thợ đúc tinh thiết ở Xóm Đúc Tinh' },
      { id: 'tong_tram', x: 82, y: 107, sprite: 'chu_quan', name: 'Tống Hành Vân', role: 'Người coi Trạm Dừng Chân Tinh Vẫn' },
      { id: 'lieu_tuyen', x: 38, y: 121, sprite: 'tieu_thuong', name: 'Liễu Tinh Tuyền', role: 'Người canh Hồ Tinh Quang' }
    ];
    var V5_SIGNS = [
      [75, 10, 'Đài Quan Tinh'], [86, 10, 'Miếu Tinh Quân'],
      [76, 13, 'Đài Quan Tinh — Đài Vọng Vẫn'],
      [20, 19, 'Tây: Trạm Khai Tinh · Hồ Tinh Quang'],
      [12, 58, 'Mỏ Tinh Thiết'], [14, 62, 'Trạm Khai Tinh'],
      [124, 27, 'Đông: Xóm Đúc Tinh · Hồ Vẫn Đông'],
      [128, 78, 'Bãi Tinh Cổ'], [127, 61, 'Xóm Đúc Tinh'], [130, 133, 'Đình Tinh Tuyền'],
      [82, 101, 'Nam: Thung Vẫn Nam · Trạm Dừng Chân'],
      [84, 107, 'Trạm Dừng Chân Tinh Vẫn'],
      [36, 121, 'Hồ Tinh Quang'], [76, 116, 'Đường Vòng Chân Vẫn'],
      [50, 120, 'Hố Vẫn Nam']
    ];
    V5_SPAWNS.forEach(function (s) { clearPatch(s[1], s[2]); });
    V5_HERBS.forEach(function (p) { clearPatch(p[0], p[1]); });
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    V5_SIGNS.forEach(function (s) { clearPatch(s[0], s[1]); });
    // Khoét thông mọi túi đất-mới bị cô lập vào khối cũ (chỉ gạt T/o,
    // cùng thuật toán bản V4 của map 2).
    var blockedT = (map && map.blocked) || {};
    function walkT(xx, yy) { return xx >= 0 && yy >= 0 && xx < NW && yy < NH && !blockedT[g[yy][xx]]; }
    function bfsT(sx, sy) {
      var seen = {}, q = [[sx, sy]];
      if (!walkT(sx, sy)) return seen;
      seen[sx + ',' + sy] = 1;
      while (q.length) {
        var c = q.pop();
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = c[0] + d[0], ny = c[1] + d[1], k = nx + ',' + ny;
          if (!seen[k] && walkT(nx, ny)) { seen[k] = 1; q.push([nx, ny]); }
        });
      }
      return seen;
    }
    function dvDijkstra13(sx, sy, reach) {
      var dist = {}, prev = {}, pq = [[0, sx, sy]];
      dist[sx + ',' + sy] = 0;
      while (pq.length) {
        var bi = 0;
        for (var i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0]) bi = i;
        var cur = pq.splice(bi, 1)[0], cx2 = cur[1], cy2 = cur[2], ck = cx2 + ',' + cy2;
        if (reach[ck]) {
          var path = [], k2 = ck;
          while (prev[k2]) { var pp = prev[k2]; path.push([pp[0], pp[1]]); k2 = pp[0] + ',' + pp[1]; }
          return path;
        }
        if (dist[ck] !== cur[0]) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cx2 + d[0], ny = cy2 + d[1];
          if (nx < 0 || ny < 0 || nx >= NW || ny >= NH || inBlock(nx, ny)) return;
          var ch = g[ny][nx], w = (ch === 'T' || ch === 'o') ? 1 : (blockedT[ch] ? 1e6 : 0), nk = nx + ',' + ny, nd = cur[0] + w;
          if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = [cx2, cy2]; pq.push([nd, nx, ny]); }
        });
      }
      return null;
    }
    (function carveOrphans() {
      for (var guard = 0; guard < 4000; guard++) {
        var reach = bfsT(AX + 39, AY + 46);
        var orphan = null;
        for (var yy = 0; yy < NH && !orphan; yy++) for (var xx = 0; xx < NW; xx++) {
          if (inBlock(xx, yy) || !walkT(xx, yy) || reach[xx + ',' + yy]) continue;
          orphan = [xx, yy]; break;
        }
        if (!orphan) return;
        var path = dvDijkstra13(orphan[0], orphan[1], reach);
        if (!path || !path.length) return;
        path.forEach(function (p) { if (g[p[1]][p[0]] === 'T' || g[p[1]][p[0]] === 'o') g[p[1]][p[0]] = '.'; });
      }
    })();
    // ---- Dịch toàn bộ nội dung cũ theo neo + gắn nội dung mới ----
    function shPt(p) { p.x += AX; p.y += AY; }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    if (map.start) shPt(map.start);
    if (map.bossSpawn) shPt(map.bossSpawn);
    if (map.gate) shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { shPt(p); }); // tx/ty: đích ở map khác, không đổi hình học
    (map.npcs || []).forEach(function (n) { shPt(n); });
    (map.monsters || []).forEach(function (mn) { shPt(mn); });
    (map.herbs || []).forEach(function (hb) { shPt(hb); });
    (map.props || []).forEach(function (pr) { shPt(pr); });
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Điểm rơi vào map 13 trong cổng của MỌI map khác dịch theo neo.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map13') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map13') { p.tx += AX; p.ty += AY; } });
    });
    map.zones.push(
      { id: 'dinh_bac', name: 'Sườn Bắc Tinh Vẫn', rects: [[16, 1, 143, 16], [58, 17, 101, 34]], types: ['ran_luc', 'soi_rung'] },
      { id: 'bai_tay', name: 'Bãi Khai Tinh Tây', rects: [[2, 40, 38, 100]], types: ['khi_mat_do', 'ran_luc'] },
      { id: 'bai_dong', name: 'Bãi Tinh Đông', rects: [[121, 40, 158, 100]], types: ['lon_mong_sat', 'khi_mat_do'] },
      { id: 'thung_nam', name: 'Thung Vẫn Nam', rects: [[24, 100, 70, 136], [90, 100, 136, 136]], types: ['soi_rung', 'lon_mong_sat'] },
      { id: 'ven_ho_tinh', name: 'Ven Hồ Tinh Quang', rects: [[14, 116, 50, 138]], types: ['ran_luc', 'soi_rung'] }
    );
    V5_SPAWNS.forEach(function (s) { map.monsters.push({ type: s[0], x: s[1], y: s[2], zone: s[3] }); });
    V5_HERBS.forEach(function (p) { map.herbs.push({ x: p[0], y: p[1], item: p[2] }); });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    V5_SIGNS.forEach(function (s) { map.props.push({ sprite: 'sign', x: s[0], y: s[1], label: s[2] }); });
    map.tiles = g.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map13-bg-v9.webp';
  })();

  // ---- MỞ RỘNG MAP 14 V5 — GẤP 10 DIỆN TÍCH (chương trình map 2–14,
  // lệnh Bui 22:12–22:25 + hạn chót xuyên đêm 23:04 ngày 2026-10-30):
  // map 14 Độ Kiếp Đài từ 80x56 ô (4480 ô, đã gồm lõi gốc 56x40 = 2240 ô
  // và vành V10) lên 160x140 ô (22400 ô = đúng 10x diện tích map gốc).
  // Toàn bộ khối 80x56 hiện có GIỮ NGUYÊN TỪNG Ô, neo tại (+40,+42)
  // trong khung mới — khối nằm giữa khung (như neo map 9 V5): Đài cũ +
  // thềm đá + sào Đài Lôi Đỉnh ở nửa trên khối, điểm rơi từ Tinh Vẫn
  // Chi Địa + cổng về ở nửa nam khối (hàng 89 khung mới). Đất mới mở cả 4 phía:
  //   BẮC: Lôi Vân Nguyên + Kiếp Vân Đài (đài đá lớn trên đỉnh trời,
  //        2 Lôi Trì hai cánh) — đất săn nặng nhất, sau lưng Đài.
  //   NAM: Quảng Trường Nghênh Kiếp ngay dưới cổng về, Trạm Chuẩn Bị
  //        Độ Kiếp (đan phòng + tĩnh thất + sân đá) và đại lộ bậc đá
  //        xuống Thiên Ngoại Nguyên — bãi săn cuối trời ở mép nam.
  //   TÂY/ĐÔNG: Đài Quan Vân (thềm đá ngắm biển mây) + sương nguyên
  //        hai cánh nối vòng đường vành đai.
  // Mạng đường >= 2 ô nối liền: vòng vành đai (ngang bắc y20-21, dọc
  // tây x16-17, dọc đông x142-143, ngang nam y126-127) + 4 nan hoa
  // (trục bắc lên Kiếp Vân Đài, trục nam xuống Thiên Ngoại Nguyên,
  // nhánh tây/đông vào Đài Quan Vân). 2 đoạn BẬC ĐÁ 'Q' trên trục nam.
  // Khu quái theo thang Độ Kiếp (map cuối chuỗi): gần điểm rơi nhẹ
  // (khỉ/rắn ở Trạm Nam), càng xa càng nặng (sói+lợn ở Lôi Vân Nguyên,
  // lợn+rắn ở Thiên Ngoại Nguyên xa nhất). Tỉ lệ loài đã cân để atk
  // trung bình toàn map ~8,5 không nghịch tiến trình chuỗi (luật
  // audit L7a: >= atk TB map 13 - 0,3; max 12 giữ nguyên).
  // Mật độ spawn tổng 98/22400 = 0,0044 <= trần gốc 36/2240 = 0,0161.
  // EXP_LAYOUT_V nâng thêm 1 nấc: game.js migrateLayoutV10 dịch save
  // theo EXP_V5_MAP14 cho RIÊNG map 14; các nấc cũ chạy trước như cũ.
  // Tọa độ map 14 hardcode ngoài maps.js phải dịch cùng neo (+40,+42)
  // trong cùng lượt tích hợp: bosses.js dòng ~477 (sào dai_loi_dinh
  // (40,13) -> (80,55), bia (41,13) -> (81,55)). NPC mới khai ở đây +
  // hồ sơ/thoại trong js/story.js (STORY.NPCS + DIALOGUE: on_dan_thanh,
  // thiet_son, van_quan_lao, loi_ky_su — khối đề xuất kèm trong README).
  var EXP_V5_MAP14 = { dx: 40, dy: 42 };
  (function expandMap14V5() {
    var map = MAPS.map14;
    var OW = map.w, OH = map.h, NW = 160, NH = 140;
    var AX = EXP_V5_MAP14.dx, AY = EXP_V5_MAP14.dy;
    var rows = [], y, x;
    for (y = 0; y < NH; y++) { var r0 = []; for (x = 0; x < NW; x++) r0.push('.'); rows.push(r0); }
    for (y = 0; y < OH; y++) for (x = 0; x < OW; x++) rows[y + AY][x + AX] = map.tiles[y][x];
    function inBlock(cx, cy) { return cx >= AX && cx < AX + OW && cy >= AY && cy < AY + OH; }
    function S(cx, cy, ch) { if (cx >= 0 && cy >= 0 && cx < NW && cy < NH && !inBlock(cx, cy)) rows[cy][cx] = ch; }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) S(xx, yy, ch); }
    function scatter(x0, y0, x1, y1, pT, pO, salt) {
      // Thông mây/đá lôi mọc thành CỤM có nhịp (mặt nạ cụm 5x5 + nhiễu
      // mịn), cùng thuật toán bản V3 của map 1 — đất đỉnh trời thưa hơn.
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
        if (inBlock(xx, yy) || rows[yy][xx] !== '.') continue;
        var grove = hash01(Math.floor(xx / 5) + salt * 7, Math.floor(yy / 5) + salt * 13);
        var h1 = hash01(xx + salt, yy + salt * 3);
        if (grove < pT * 1.9 && h1 < 0.62) rows[yy][xx] = 'T';
        else if (h1 > 1 - pO) rows[yy][xx] = 'o';
      }
    }
    // -- Danh sách nội dung mới (dùng cho cả dọn bãi + đẩy dữ liệu) --
    var V5_NPCS = [
      { id: 'on_dan_thanh', x: 75, y: 110, sprite: 'dai_phu', name: 'Ôn Đan Thanh', role: 'Đan sư Trạm Chuẩn Bị Độ Kiếp' },
      { id: 'thiet_son', x: 84, y: 104, sprite: 'linh_gac', name: 'Thiết Sơn', role: 'Hộ pháp Quảng Trường Nghênh Kiếp' },
      { id: 'van_quan_lao', x: 126, y: 56, sprite: 'giu_mieu', name: 'Bạch Vân Lão Nhân', role: 'Người giữ Đài Quan Vân Đông' },
      { id: 'loi_ky_su', x: 84, y: 13, sprite: 'tho_san_ha', name: 'Lôi Ký Sử', role: 'Người ghi chép lôi kiếp ở Kiếp Vân Đài' }
    ];
    var V5_HERB_CLUSTERS = [
      { item: 'thien_lien', x: 24, y: 22, n: 3 }, { item: 'thien_lien', x: 133, y: 22, n: 3 },
      { item: 'thien_lien', x: 64, y: 14, n: 2 },
      { item: 'van_nien_linh_chi', x: 63, y: 6, n: 2 }, { item: 'van_nien_linh_chi', x: 96, y: 6, n: 2 },
      { item: 'van_nien_linh_chi', x: 14, y: 134, n: 2 }, { item: 'van_nien_linh_chi', x: 146, y: 134, n: 2 },
      { item: 'son_tinh', x: 20, y: 84, n: 2 }, { item: 'son_tinh', x: 140, y: 84, n: 2 },
      { item: 'son_tinh', x: 56, y: 120, n: 2 }
    ];
    var V5_ZONES = [
      { id: 'tram_chuan_bi', name: 'Khu Trạm Chuẩn Bị Nam', rects: [[44, 114, 72, 124], [88, 114, 116, 124]], types: ['khi_mat_do', 'ran_luc'], count: 8 },
      { id: 'loi_van_bac', name: 'Lôi Vân Nguyên', rects: [[6, 4, 60, 38], [100, 4, 153, 38]], types: ['soi_rung', 'lon_mong_sat'], count: 14 },
      { id: 'suong_tay', name: 'Sương Mù Tây Nguyên', rects: [[4, 44, 36, 120]], types: ['ran_luc', 'soi_rung'], count: 12 },
      { id: 'suong_dong', name: 'Sương Mù Đông Nguyên', rects: [[123, 44, 155, 120]], types: ['khi_mat_do', 'soi_rung', 'lon_mong_sat'], count: 12 },
      { id: 'thien_ngoai_nam', name: 'Thiên Ngoại Nguyên', rects: [[8, 130, 151, 137]], types: ['lon_mong_sat', 'ran_luc'], count: 16 }
    ];
    // -- Vách khung ngoài của đất mới (khối cũ đã có vách riêng) --
    R(0, 0, 159, 0, 'W'); R(0, 139, 159, 139, 'W');
    R(0, 0, 0, 139, 'W'); R(159, 0, 159, 139, 'W');
    // -- Rải thông mây/đá lôi nền theo vùng (hồ/đường/đài vẽ đè lên sau) --
    scatter(1, 1, 158, 41, 0.10, 0.05, 1401);      // vành bắc — Lôi Vân Nguyên (đá lôi dày)
    scatter(1, 43, 39, 138, 0.12, 0.03, 1402);     // cánh tây
    scatter(120, 43, 158, 138, 0.12, 0.03, 1403);  // cánh đông
    scatter(40, 98, 119, 138, 0.08, 0.03, 1404);   // hoang nam dưới khối
    // Khoảng trống giữ sạch: hành lang đường + các công trình.
    R(14, 19, 145, 22, '.');                        // hành lang đường ngang bắc
    R(14, 19, 19, 128, '.');                        // hành lang đường dọc tây
    R(140, 19, 145, 128, '.');                      // hành lang đường dọc đông
    R(14, 124, 145, 129, '.');                      // hành lang đường ngang nam
    R(72, 98, 87, 138, '.');                        // hành lang trục nam + quảng trường/trạm
    R(72, 11, 87, 41, '.');                         // hành lang trục bắc
    R(17, 56, 39, 72, '.');                         // nhánh + thềm Đài Quan Vân Tây
    R(120, 56, 142, 72, '.');                       // nhánh + thềm Đài Quan Vân Đông
    R(64, 2, 95, 12, '.');                          // vùng Kiếp Vân Đài (vẽ Q sau)
    R(24, 54, 42, 74, '.');                         // vùng thềm Quan Vân Tây (vẽ Q sau)
    R(117, 54, 135, 74, '.');                       // vùng thềm Quan Vân Đông (vẽ Q sau)
    R(64, 98, 95, 116, '.');                        // vùng Trạm Chuẩn Bị (vẽ nhà/sân sau)
    // -- Lôi Trì ('R'): 2 hồ lôi lớn hai cánh bắc + 1 hồ nhỏ tây nam --
    function blob(spec, ch) { spec.forEach(function (s2) { R(s2[0], s2[1], s2[2], s2[1], ch); }); }
    blob([[25, 25, 29], [24, 26, 30], [24, 27, 30], [24, 28, 30], [24, 29, 30],
          [24, 30, 30], [25, 31, 29]], 'R'); // Lôi Trì Tây
    blob([[130, 25, 134], [129, 26, 135], [129, 27, 135], [129, 28, 135], [129, 29, 135],
          [129, 30, 135], [130, 31, 134]], 'R'); // Lôi Trì Đông
    // -- Đài/thềm đá ('Q') + trụ đá + đèn --
    R(68, 4, 91, 10, 'Q');                          // Kiếp Vân Đài — đài đá đỉnh trời phía bắc
    [[68, 4], [91, 4], [68, 10], [91, 10]].forEach(function (p) { S(p[0], p[1], 'o'); }); // trụ đá 4 góc
    S(79, 4, 'L'); S(80, 4, 'L');                   // đèn đá giữa mép bắc đài
    R(68, 99, 91, 103, 'Q');                        // Quảng Trường Nghênh Kiếp (dưới cổng về)
    S(68, 99, 'L'); S(91, 99, 'L'); S(68, 103, 'L'); S(91, 103, 'L'); // đèn 4 góc quảng trường
    R(27, 58, 37, 70, 'Q');                         // Đài Quan Vân Tây
    [[27, 58], [37, 58], [27, 70], [37, 70]].forEach(function (p) { S(p[0], p[1], 'o'); });
    R(122, 58, 132, 70, 'Q');                       // Đài Quan Vân Đông
    [[122, 58], [132, 58], [122, 70], [132, 70]].forEach(function (p) { S(p[0], p[1], 'o'); });
    R(74, 108, 85, 109, 'Q'); R(74, 117, 85, 118, 'Q'); // 2 đoạn BẬC ĐÁ trên trục nam
    // -- Mạng đường (# đất, >= 2 ô, nối liền mọi cổng/khu) --
    R(78, 104, 81, 138, '#');                       // trục nam: quảng trường -> Thiên Ngoại Nguyên
    R(78, 98, 81, 98, '#');                         // nối quảng trường vào mép nam khối
    R(78, 11, 81, 41, '#');                         // trục bắc: mép bắc khối -> Kiếp Vân Đài
    R(16, 20, 143, 21, '#');                        // đường ngang bắc (vành đai)
    R(16, 20, 17, 127, '#');                        // đường dọc tây (vành đai)
    R(142, 20, 143, 127, '#');                      // đường dọc đông (vành đai)
    R(16, 126, 143, 127, '#');                      // đường ngang nam (vành đai)
    R(18, 63, 39, 64, '#');                         // nhánh Đài Quan Vân Tây
    R(120, 63, 141, 64, '#');                       // nhánh Đài Quan Vân Đông
    // -- Trạm Chuẩn Bị Độ Kiếp: nhà thật (H) + thềm cửa (Q) + sân đá --
    R(69, 106, 73, 107, 'H'); R(70, 108, 72, 108, 'Q');  // đan phòng + thềm cửa
    R(86, 106, 90, 107, 'H'); R(87, 108, 89, 108, 'Q');  // tĩnh thất + thềm cửa
    R(68, 111, 91, 113, 'Q');                       // sân trạm
    S(67, 110, 'L'); S(92, 110, 'L'); S(67, 114, 'L'); S(92, 114, 'L'); // đèn 4 góc sân
    S(66, 107, 'F'); S(93, 107, 'F');               // rào góc trạm
    // -- CHỈNH DỮ LIỆU KHỚP TRANH (sau khi AI tô, theo tiền lệ map 9):
    // tranh vẽ thêm ở đâu đẹp và hợp lý thì dữ liệu chốt theo tranh.
    // (a) Cánh tây: tại vị trí dự kiến hồ nhỏ, tranh vẽ một miếu nhỏ
    // mái cong (Vân Du Từ) — chốt 'H' + thềm cửa thay hồ.
    R(28, 107, 32, 110, 'H'); R(29, 111, 31, 111, 'Q');  // Vân Du Từ + thềm cửa
    // (b) Trạm nam: tranh vẽ thêm 2 đình lớn uy nghi hai bên trục nam
    // dưới sân trạm — chốt 'H' + thềm cửa (spawn/dược chọn SAU nên tự
    // tránh các ô này).
    R(67, 118, 75, 122, 'H'); R(70, 123, 72, 123, 'Q');  // đình tây trạm nam
    R(86, 118, 94, 122, 'H'); R(89, 123, 91, 123, 'Q');  // đình đông trạm nam
    // (c) Vành nam: tranh vẽ chuỗi hồ mây ven vành đai Thiên Ngoại
    // Nguyên — chốt 'R' theo đúng hình hồ trong tranh.
    blob([[65, 128, 69], [64, 129, 70], [64, 130, 70], [65, 131, 69]], 'R'); // hồ nam 1
    blob([[59, 130, 62], [58, 131, 63], [58, 132, 63], [59, 133, 62]], 'R'); // hồ nam 2
    blob([[73, 133, 75], [72, 134, 76], [73, 135, 75]], 'R');               // hồ nam 3 (nhỏ)
    blob([[90, 129, 98], [88, 130, 100], [88, 131, 101], [88, 132, 101],
          [89, 133, 100], [91, 134, 98]], 'R');                             // hồ nam 4 (lớn)
    blob([[105, 128, 107], [104, 129, 108], [104, 130, 108], [105, 131, 107]], 'R'); // hồ nam 5
    blob([[27, 131, 36], [25, 132, 38], [25, 133, 38], [25, 134, 38],
          [26, 135, 37], [28, 136, 35]], 'R');                              // hồ góc tây nam
    blob([[126, 130, 131], [124, 131, 133], [124, 132, 133], [125, 133, 132],
          [127, 134, 131]], 'R');                                           // hồ góc đông nam 1
    blob([[140, 129, 145], [138, 130, 147], [138, 131, 147], [138, 132, 147],
          [139, 133, 146], [141, 134, 144]], 'R');                          // hồ góc đông nam 2
    // -- Dọn bãi 3x3 quanh NPC mới (chỉ gạt T/o/F, giữ đường/thềm/nước/nhà) --
    function clearPatch(cx, cy) {
      for (var yy = cy - 1; yy <= cy + 1; yy++) for (var xx = cx - 1; xx <= cx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= NW || yy >= NH || inBlock(xx, yy)) continue;
        var ch = rows[yy][xx];
        if (ch === 'T' || ch === 'o' || ch === 'F') rows[yy][xx] = '.';
      }
    }
    V5_NPCS.forEach(function (n) { clearPatch(n.x, n.y); });
    // -- Xử lý túi đất cô lập trong đất mới (bản theo CỤM của thuật toán
    // V10/V3 — bản từng-ô quá chậm trên 22400 ô): gán nhãn mọi thành
    // phần đất đi được; cụm nào không chạm khối cũ là túi cô lập. Cụm
    // nhỏ (< 40 ô — đúng ngưỡng luật audit L6) thì LẤP thành địa hình
    // (thông mây/đá lôi theo băm); cụm lớn thì khoét ĐÚNG 1 tuyến rẻ
    // nhất qua T/o bằng dvDijkstra (không đụng nhà/nước/vách). --
    function walkAt(cx, cy) { return cx >= 0 && cy >= 0 && cx < NW && cy < NH && !map.blocked[rows[cy][cx]]; }
    function labelComponents() {
      var comp = {}, comps = [], xx, yy;
      for (yy = 0; yy < NH; yy++) for (xx = 0; xx < NW; xx++) {
        if (!walkAt(xx, yy) || comp[xx + ',' + yy] !== undefined) continue;
        var id = comps.length, cells = [], q = [[xx, yy]];
        comp[xx + ',' + yy] = id;
        while (q.length) {
          var c = q.pop(); cells.push(c);
          [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (d) {
            var ax2 = c[0] + d[0], ay2 = c[1] + d[1], k2 = ax2 + ',' + ay2;
            if (comp[k2] === undefined && walkAt(ax2, ay2)) { comp[k2] = id; q.push([ax2, ay2]); }
          });
        }
        comps.push(cells);
      }
      return { comp: comp, comps: comps };
    }
    var lab = labelComponents();
    // Neo vùng chính = ô start cũ (lúc này start chưa dịch; vị trí của
    // nó trong khung mới là start + neo) — luôn là ô đi được trên trục.
    function mainCompOf(l2) { return l2.comp[(map.start.x + AX) + ',' + (map.start.y + AY)]; }
    var mainComp = mainCompOf(lab);
    // Lượt 1: khoét tuyến cho mọi cụm LỚN (>= 40 ô) chưa chạm vùng
    // chính — mỗi cụm 1 lần Dijkstra tới ô đầu của cụm, gán nhãn lại
    // sau mỗi lần khoét (cụm vừa nối nhập vào vùng chính).
    lab.comps.slice().forEach(function (cells, ci) {
      if (ci === mainComp || cells.length < 40) return;
      var srcs = lab.comps[mainComp].map(function (c) { return [c[0], c[1]]; });
      var t0 = cells[0];
      var path = dvDijkstra(NW, NH, srcs, function (cx, cy) {
        var ch = rows[cy][cx];
        if (!map.blocked[ch]) return 1;
        if (ch === 'T') return 7; if (ch === 'o') return 11;
        return Infinity;
      }, function (cx, cy) { return cx === t0[0] && cy === t0[1]; });
      if (path) path.forEach(function (c) { if (map.blocked[rows[c[1]][c[0]]]) rows[c[1]][c[0]] = '.'; });
      lab = labelComponents();
      mainComp = mainCompOf(lab);
    });
    // Lượt 2: cụm còn sót (nhỏ < 40 ô — đúng ngưỡng luật audit L6 —
    // hoặc cụm mà Dijkstra không khoét nổi vì bị nước/vách bọc kín)
    // thì lấp thành địa hình thông mây/đá lôi: đất không tới được thì
    // không để là đất trống.
    lab = labelComponents();
    mainComp = mainCompOf(lab);
    lab.comps.forEach(function (cells, ci) {
      if (ci === mainComp) return;
      cells.forEach(function (c) { rows[c[1]][c[0]] = hash01(c[0] + 77, c[1]) < 0.7 ? 'T' : 'o'; });
    });
    // -- Dịch toàn bộ nội dung cũ của map 14 theo neo (+40,+42) --
    function shPt(p) { if (p) { p.x += AX; p.y += AY; } }
    function shRect(r) { r[0] += AX; r[1] += AY; r[2] += AX; r[3] += AY; }
    shPt(map.start); shPt(map.well); shPt(map.bossSpawn); shPt(map.gate);
    if (typeof map.wildY === 'number') map.wildY += AY;
    (map.portals || []).forEach(function (p) { p.x += AX; p.y += AY; }); // tx/ty: đích map 13 KHÔNG đổi hình học
    (map.npcs || []).forEach(shPt);
    (map.monsters || []).forEach(shPt);
    (map.herbs || []).forEach(shPt);
    (map.props || []).forEach(shPt);
    (map.zones || []).forEach(function (z) { (z.rects || []).forEach(shRect); });
    (map.bossLairs || []).forEach(function (l) { shPt(l); if (l.rect) shRect(l.rect); });
    // Cổng của map khác rơi VÀO map 14 phải dịch điểm rơi theo neo mới.
    Object.keys(MAPS).forEach(function (id) {
      if (id === 'map14') return;
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map14') { p.tx += AX; p.ty += AY; } });
    });
    // -- Nội dung mới (tọa độ khung 160x140) --
    V5_ZONES.forEach(function (z) { map.zones.push({ id: z.id, name: z.name, rects: z.rects, types: z.types }); });
    // Điểm spawn tất định trong khu mới: chỉ ô '.' trong rect của khu,
    // cách điểm nhạy cảm >= 3 Chebyshev, hộp lang thang +-4 không chứa
    // điểm rơi/start, hai spawn cách nhau >= 3 Chebyshev (luật audit
    // L2/L3/L4 — bản này giữ biên an toàn hơn luật 1 ô).
    var landPts = [{ x: map.start.x, y: map.start.y }];
    Object.keys(MAPS).forEach(function (id) {
      (MAPS[id].portals || []).forEach(function (p) { if (p.to === 'map14') landPts.push({ x: p.tx, y: p.ty }); });
    });
    var safePts = landPts.slice();
    (map.portals || []).forEach(function (p) { safePts.push({ x: p.x, y: p.y }); });
    (map.bossLairs || []).forEach(function (l) { safePts.push({ x: l.x, y: l.y }); });
    V5_NPCS.forEach(function (n) { safePts.push({ x: n.x, y: n.y }); });
    function cheb(ax2, ay2, bx, by) { return Math.max(Math.abs(ax2 - bx), Math.abs(ay2 - by)); }
    V5_ZONES.forEach(function (z, zi) {
      var cells = [];
      z.rects.forEach(function (r) {
        for (var yy = r[1]; yy <= r[3]; yy++) for (var xx = r[0]; xx <= r[2]; xx++) {
          if (rows[yy][xx] === '.') cells.push([xx, yy]);
        }
      });
      var salt = 5000 + zi * 131 + z.id.length * 17;
      cells.sort(function (a, b) { return hash01(a[0] * 3 + salt, a[1] * 7 + salt) - hash01(b[0] * 3 + salt, b[1] * 7 + salt); });
      var picked = [];
      for (var i = 0; i < cells.length && picked.length < z.count; i++) {
        var c = cells[i], okS = true;
        for (var a2 = 0; a2 < safePts.length && okS; a2++) if (cheb(c[0], c[1], safePts[a2].x, safePts[a2].y) < 3) okS = false;
        for (var l2 = 0; l2 < landPts.length && okS; l2++) {
          if (Math.abs(c[0] - landPts[l2].x) <= 4 && Math.abs(c[1] - landPts[l2].y) <= 4) okS = false;
        }
        for (var j = 0; j < picked.length && okS; j++) if (cheb(c[0], c[1], picked[j].x, picked[j].y) < 3) okS = false;
        if (okS) picked.push({ type: z.types[picked.length % z.types.length], x: c[0], y: c[1], zone: z.id });
      }
      picked.forEach(function (m2) { map.monsters.push(m2); });
    });
    // Dược theo cụm quanh tâm (chỉ ô '.' chưa dùng, lệch theo mẫu sẵn có).
    var usedH = {};
    var offsH = [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [-2, -2], [3, 1], [-3, -1], [1, 3], [-1, -3]];
    V5_HERB_CLUSTERS.forEach(function (cl) {
      var got = 0;
      for (var i = 0; i < offsH.length && got < cl.n; i++) {
        var hx = cl.x + offsH[i][0], hy = cl.y + offsH[i][1], k = hx + ',' + hy;
        if (hx < 1 || hy < 1 || hx >= NW || hy >= NH || usedH[k]) continue;
        if (rows[hy][hx] !== '.') continue;
        usedH[k] = 1; map.herbs.push({ x: hx, y: hy, item: cl.item }); got++;
      }
    });
    V5_NPCS.forEach(function (n) { map.npcs.push(n); });
    map.props.push(
      { sprite: 'sign', x: 75, y: 105, label: 'Trạm Chuẩn Bị Độ Kiếp' },
      { sprite: 'sign', x: 93, y: 101, label: 'Quảng Trường Nghênh Kiếp' },
      { sprite: 'sign', x: 75, y: 13, label: 'Kiếp Vân Đài' },
      { sprite: 'sign', x: 32, y: 56, label: 'Đài Quan Vân Tây' },
      { sprite: 'sign', x: 130, y: 56, label: 'Đài Quan Vân Đông' },
      { sprite: 'sign', x: 20, y: 124, label: 'Thiên Ngoại Nguyên — đất cuối trời' },
      { sprite: 'sign', x: 30, y: 113, label: 'Vân Du Từ' },
      { sprite: 'sign', x: 138, y: 24, label: 'Lôi Vân Nguyên' }
    );
    map.tiles = rows.map(function (r) { return r.join(''); });
    map.w = NW; map.h = NH;
    map.bg = 'assets/map14-bg-v9.webp';
  })();

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
  // ---- TÍCH HỢP V5 — ĐẶT LẠI CỔNG THEO BẢN MỞ RỘNG (lệnh Bui 07:51–
  // 07:52 ngày 31/10/2026: "cổng di chuyển phù hợp / không ở map gốc
  // nữa"): mọi dải cổng đi bộ của chuỗi Đại Sơn được dời từ vị trí lõi
  // cũ ra biên thật của layout mở rộng, lần theo hành lang đường/thềm
  // hiện có (BFS trên ô đường ' #'/'Q'/'G'/đất '.' từ dải cũ; dải mới
  // là dải 6 ô xa nhất về phía biên mà 2 ô giữa vẫn là đường/thềm,
  // không đè NPC/biển). Vị trí cũ trả về ô đường '#'. Cặp hai chiều
  // khớp lại điểm rơi: rơi vào ô kề phía trong của dải về. Khóa cảnh
  // giới/tầng giữ nguyên trên chính các portal được dời. NGOẠI LỆ:
  // map 1/2 giữ vị trí (chương trình V3/V4) — chỉ cập nhật điểm rơi;
  // 10 cổng sơn môn trên map 3 là cổng dịch chuyển vào instance, giữ
  // tại quảng trường. Chạy TRƯỚC khối QD bên dưới để spawn được dọn
  // quanh cổng mới. ----
  (function relocatePortalsV5() {
    var CHAIN = ['map1', 'map3', 'map4', 'map5', 'map6', 'map7', 'map8', 'map9', 'map10', 'map11', 'map12', 'map13', 'map14'];
    var CORR = { '#': 1, Q: 1, G: 1, '.': 1 };
    function stripsOf(map, to) {
      var by = {}, out = [];
      (map.portals || []).forEach(function (p) {
        if (p.to !== to) return;
        (by[p.y] = by[p.y] || []).push(p);
      });
      Object.keys(by).forEach(function (y) { out.push(by[y]); });
      return out;
    }
    function planMove(map, strip, dir) {
      var cx = Math.round(strip.reduce(function (s, p) { return s + p.x; }, 0) / strip.length);
      var cy = strip[0].y;
      var occ = {};
      (map.npcs || []).forEach(function (n) { occ[n.x + ',' + n.y] = 1; });
      (map.props || []).forEach(function (p) { if (p.sprite === 'sign') occ[p.x + ',' + p.y] = 1; });
      var seen = {}, q = [];
      strip.forEach(function (p) { seen[p.x + ',' + p.y] = 1; q.push([p.x, p.y]); });
      while (q.length) {
        var c = q.pop();
        for (var d = 0; d < 4; d++) {
          var nx = c[0] + [1, -1, 0, 0][d], ny = c[1] + [0, 0, 1, -1][d];
          if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
          var k = nx + ',' + ny;
          if (seen[k] || !CORR[map.tiles[ny][nx]] || isBlockedIn(map, nx, ny)) continue;
          seen[k] = 1; q.push([nx, ny]);
        }
      }
      var yFrom = dir === 'N' ? 0 : map.h - 1, step = dir === 'N' ? 1 : -1;
      for (var y = yFrom; y !== cy + step; y += step) {
        var best = null;
        for (var x0 = Math.max(0, cx - 12); x0 <= Math.min(map.w - 6, cx + 12); x0++) {
          var ok = true, roadMid = 0;
          for (var i = 0; i < 6; i++) {
            var x = x0 + i, kk = x + ',' + y;
            if (!seen[kk] || occ[kk]) { ok = false; break; }
            if ((i === 2 || i === 3) && map.tiles[y][x] !== '.') roadMid++;
          }
          if (ok && roadMid === 2) {
            var dc = Math.abs(x0 + 2.5 - cx);
            if (!best || dc < best.dc) best = { x0: x0, dc: dc };
          }
        }
        if (best) return { x: best.x0, y: y };
      }
      return { x: strip[0].x, y: cy };
    }
    var newStripPos = {}; // 'mapId>to' -> {x, y, dir}
    CHAIN.forEach(function (mid, i) {
      var map = MAPS[mid];
      if (!map || mid === 'map1') return; // map 1 giữ vị trí
      [['S', CHAIN[i - 1]], ['N', CHAIN[i + 1]]].forEach(function (cfg) {
        var dir = cfg[0], to = cfg[1];
        if (!to) return;
        stripsOf(map, to).forEach(function (strip) {
          var mv = planMove(map, strip, dir);
          newStripPos[mid + '>' + to] = { x: mv.x, y: mv.y, dir: dir };
          if (mv.x !== strip[0].x || mv.y !== strip[0].y) {
            var rows = map.tiles.map(function (r) { return r.split(''); });
            strip.forEach(function (p) { rows[p.y][p.x] = '#'; });
            strip.forEach(function (p, idx) {
              p.x = mv.x + idx; p.y = mv.y;
              rows[p.y][p.x] = 'G';
            });
            map.tiles = rows.map(function (r) { return r.join(''); });
          } else {
            strip.forEach(function (p, idx) { p.x = mv.x + idx; p.y = mv.y; });
          }
        });
      });
    });
    // Điểm rơi: tính từ dải về trong map đích (dải đã dời hoặc dải giữ
    // nguyên của map 1); rơi = hàng kề phía trong của dải về, x = +2/+3.
    function landingFor(destId, fromId) {
      var dest = MAPS[destId];
      var strips = stripsOf(dest, fromId);
      if (!strips.length) return null;
      var strip = strips[0];
      var info = newStripPos[destId + '>' + fromId];
      var dir = info ? info.dir : (destId === 'map1' ? 'N' : 'S');
      var s = dir === 'N' ? 1 : -1;
      var xs = strip.map(function (p) { return p.x; });
      var x0 = Math.min.apply(null, xs);
      var rowsTry = [strip[0].y + s, strip[0].y + 2 * s];
      for (var r = 0; r < rowsTry.length; r++) {
        var ly = rowsTry[r];
        if (ly < 0 || ly >= dest.h) continue;
        if (!isBlockedIn(dest, x0 + 2, ly) && !isBlockedIn(dest, x0 + 3, ly)) {
          return { x2: x0 + 2, x3: x0 + 3, y: ly };
        }
      }
      return { x2: x0 + 2, x3: x0 + 3, y: strip[0].y + s };
    }
    CHAIN.forEach(function (mid, i) {
      var map = MAPS[mid];
      if (!map) return;
      [CHAIN[i - 1], CHAIN[i + 1]].forEach(function (to) {
        if (!to) return;
        var land = landingFor(to, mid);
        if (!land) return;
        stripsOf(map, to).forEach(function (strip) {
          strip.forEach(function (p, idx) {
            p.tx = idx < 3 ? land.x2 : land.x3;
            p.ty = land.y;
          });
        });
      });
    });
  })();

  // ---- TÍCH HỢP V5 — CHỈNH HỘP LANG THANG THEO LUẬT QD (Bui 21:18
  // 2026-10-29: hộp ±4 quanh spawn quái đất không còn cây 'T' chắn, trừ
  // danh lam giữ nguyên). Các gói V5 đặt spawn vành trong rừng — spawn nào
  // hộp còn cây, hoặc đứng < 3 ô Chebyshev so với biển/cổng/NPC/điểm rơi,
  // được DỜI trong maps.js đã gộp tới ô hợp lệ gần nhất CÙNG KHU (giữ
  // nguyên số lượng + zone + mật độ; thuật toán tất định, chạy 1 lần lúc
  // nạp). Ngoại lệ giữ cây: Cây Cổ Thụ Linh Khí map 4 (khớp QD_KEEP test).
  (function qdRelocateV5() {
    var KEEP_T = { map4: [[110, 75, 112, 76]] };
    function zoneIdAt(map, x, y) {
      var zs = map.zones || [];
      for (var i = 0; i < zs.length; i++) {
        var rc = zs[i].rects || (zs[i].rect ? [zs[i].rect] : []);
        for (var j = 0; j < rc.length; j++) {
          var r = rc[j];
          if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return zs[i].id;
        }
      }
      return null;
    }
    ['map3', 'map4', 'map5', 'map6', 'map7', 'map8', 'map9', 'map10', 'map11', 'map12', 'map13', 'map14'].forEach(function (mid) {
      var map = MAPS[mid];
      if (!map || !map.monsters) return;
      var keep = KEEP_T[mid] || [];
      function isKeep(x, y) {
        return keep.some(function (r) { return x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]; });
      }
      function boxTrees(x0, y0) {
        var n = 0;
        for (var y = y0 - 4; y <= y0 + 4; y++) for (var x = x0 - 4; x <= x0 + 4; x++) {
          if (x < 0 || y < 0 || x >= map.w || y >= map.h) continue;
          if (map.tiles[y][x] === 'T' && !isKeep(x, y)) n++;
        }
        return n;
      }
      function boxReach(x0, y0) {
        var seen = {}, q = [[x0, y0]], n = 0;
        seen[x0 + ',' + y0] = 1;
        while (q.length) {
          var c = q.pop(); n++;
          for (var d = 0; d < 4; d++) {
            var nx = c[0] + [1, -1, 0, 0][d], ny = c[1] + [0, 0, 1, -1][d], k = nx + ',' + ny;
            if (Math.abs(nx - x0) > 4 || Math.abs(ny - y0) > 4 || seen[k]) continue;
            if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
            if (isBlockedIn(map, nx, ny)) continue;
            seen[k] = 1; q.push([nx, ny]);
          }
        }
        return n;
      }
      var bans = [];
      (map.portals || []).forEach(function (p) { bans.push([p.x, p.y]); });
      (map.npcs || []).forEach(function (n) { bans.push([n.x, n.y]); });
      (map.props || []).forEach(function (pr) { if (pr.sprite === 'sign') bans.push([pr.x, pr.y]); });
      if (map.start) bans.push([map.start.x, map.start.y]);
      Object.keys(MAPS).forEach(function (oid) {
        (MAPS[oid].portals || []).forEach(function (p) { if (p.to === mid) bans.push([p.tx, p.ty]); });
      });
      function tooClose(x, y) {
        for (var i = 0; i < bans.length; i++) {
          if (Math.max(Math.abs(x - bans[i][0]), Math.abs(y - bans[i][1])) < 3) return true;
        }
        return false;
      }
      // Luật L3 (audit bố trí): spawn không được nằm trong hộp Chebyshev
      // <= 4 quanh ĐIỂM RƠI/START/EXIT. Các gói V5 tự sinh spawn tính
      // điểm rơi theo vị trí cổng TRƯỚC lượt đặt lại cổng ra biên
      // (relocatePortalsV5 chạy sau khi gói nạp) nên phải gác lại ở đây
      // theo điểm rơi cuối cùng — cùng ngưỡng các gói tự dùng.
      var landBans = [];
      if (map.start) landBans.push([map.start.x, map.start.y]);
      if (map.exit) landBans.push([map.exit.x, map.exit.y]);
      Object.keys(MAPS).forEach(function (oid) {
        (MAPS[oid].portals || []).forEach(function (p) { if (p.to === mid) landBans.push([p.tx, p.ty]); });
      });
      function tooCloseLand(x, y) {
        for (var i = 0; i < landBans.length; i++) {
          if (Math.abs(x - landBans[i][0]) <= 4 && Math.abs(y - landBans[i][1]) <= 4) return true;
        }
        return false;
      }
      var placed = map.monsters.map(function (m) { return [m.x, m.y]; });
      map.monsters.forEach(function (m, mi) {
        var bad = boxTrees(m.x, m.y) > 0 || tooClose(m.x, m.y) || tooCloseLand(m.x, m.y) ||
          (m.zone && zoneIdAt(map, m.x, m.y) !== m.zone) || boxReach(m.x, m.y) < 24;
        if (!bad) return;
        var zid = m.zone || zoneIdAt(map, m.x, m.y);
        var found = null;
        for (var r = 1; r <= 14 && !found; r++) {
          for (var dy = -r; dy <= r && !found; dy++) {
            for (var dx = -r; dx <= r && !found; dx++) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
              var nx = m.x + dx, ny = m.y + dy;
              if (nx < 1 || ny < 1 || nx >= map.w - 1 || ny >= map.h - 1) continue;
              if (isBlockedIn(map, nx, ny)) continue;
              if (zid && zoneIdAt(map, nx, ny) !== zid) continue;
              if (boxTrees(nx, ny) > 0) continue;
              if (tooClose(nx, ny)) continue;
              if (tooCloseLand(nx, ny)) continue;
              if (boxReach(nx, ny) < 24) continue;
              var clash = false;
              for (var pi = 0; pi < placed.length; pi++) {
                if (pi !== mi && Math.max(Math.abs(nx - placed[pi][0]), Math.abs(ny - placed[pi][1])) < 2) { clash = true; break; }
              }
              if (clash) continue;
              found = [nx, ny];
            }
          }
        }
        if (!found && zid) {
          // Tìm mở rộng trên toàn rect khu (rừng vành không có khoảng
          // trống 9x9 gần spawn — quét cả khu theo khoảng cách tăng dần).
          var zr = null;
          (map.zones || []).forEach(function (z) { if (z.id === zid) zr = z.rects || (z.rect ? [z.rect] : []); });
          if (zr) {
            var best = null, bestD = 1e9;
            zr.forEach(function (r) {
              for (var cy = r[1]; cy <= r[3]; cy++) for (var cx = r[0]; cx <= r[2]; cx++) {
                if (cx < 1 || cy < 1 || cx >= map.w - 1 || cy >= map.h - 1) continue;
                if (isBlockedIn(map, cx, cy)) continue;
                if (boxTrees(cx, cy) > 0) continue;
                if (tooClose(cx, cy)) continue;
                if (tooCloseLand(cx, cy)) continue;
                if (boxReach(cx, cy) < 24) continue;
                var clash2 = false;
                for (var pj = 0; pj < placed.length; pj++) {
                  if (pj !== mi && Math.max(Math.abs(cx - placed[pj][0]), Math.abs(cy - placed[pj][1])) < 2) { clash2 = true; break; }
                }
                if (clash2) continue;
                var dd = Math.max(Math.abs(cx - m.x), Math.abs(cy - m.y));
                if (dd < bestD) { bestD = dd; best = [cx, cy]; }
              }
            });
            if (best) found = best;
          }
        }
        if (found) { m.x = found[0]; m.y = found[1]; placed[mi] = found; }
        else if (boxTrees(m.x, m.y) > 0) {
          // Khu rừng đặc không còn ô hợp lệ nào: DỌN CÂY trong hộp ±4
          // quanh spawn (đúng cách lượt dọn cây QD gốc đã làm cho map
          // 1–4) — trừ ô danh lam giữ nguyên và vành biên ngoài của map.
          for (var by2 = m.y - 4; by2 <= m.y + 4; by2++) for (var bx2 = m.x - 4; bx2 <= m.x + 4; bx2++) {
            if (bx2 < 2 || by2 < 2 || bx2 >= map.w - 2 || by2 >= map.h - 2) continue;
            if (map.tiles[by2][bx2] === 'T' && !isKeep(bx2, by2)) {
              if (typeof map.tiles[by2] === 'string') map.tiles[by2] = map.tiles[by2].substring(0, bx2) + '.' + map.tiles[by2].substring(bx2 + 1);
              else map.tiles[by2][bx2] = '.';
            }
          }
        }
      });
    });
  })();

  // ---- TÍCH HỢP V5 — BIỂN ĐỨNG TRÊN Ô CHẶN (gói map 7 đặt 2 biển lên ô
  // đá/cây ở vành tây): biển nào ô đứng bị chặn thì dời tới ô đi được gần
  // nhất thuộc thành phần liên thông của điểm bắt đầu (tất định).
  (function qdSignFixV5() {
    ['map3', 'map4', 'map5', 'map6', 'map7', 'map8', 'map9'].forEach(function (mid) {
      var map = MAPS[mid];
      if (!map || !map.props || !map.start) return;
      var bad = (map.props || []).filter(function (pr) {
        return pr.sprite === 'sign' && isBlockedIn(map, pr.x, pr.y);
      });
      if (!bad.length) return;
      var seen = {}, q = [[map.start.x, map.start.y]];
      seen[map.start.x + ',' + map.start.y] = 1;
      while (q.length) {
        var c = q.pop();
        for (var d = 0; d < 4; d++) {
          var nx = c[0] + [1, -1, 0, 0][d], ny = c[1] + [0, 0, 1, -1][d], k = nx + ',' + ny;
          if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h || seen[k]) continue;
          if (isBlockedIn(map, nx, ny)) continue;
          seen[k] = 1; q.push([nx, ny]);
        }
      }
      bad.forEach(function (pr) {
        for (var r = 1; r <= 6; r++) {
          var done = false;
          for (var dy = -r; dy <= r && !done; dy++) for (var dx = -r; dx <= r && !done; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            var nx = pr.x + dx, ny = pr.y + dy;
            if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
            if (isBlockedIn(map, nx, ny)) continue;
            if (!seen[nx + ',' + ny]) continue;
            pr.x = nx; pr.y = ny; done = true;
          }
          if (done) break;
        }
      });
    });
  })();

// ================================================================
// SƠN MÔN THANH PHONG PHÁI — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá/kiếm thạch (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_THANHPHONG = {
  id: 'sonmon_thanhphong',
  name: 'Sơn Môn Thanh Phong Phái',
  sect: 'thanh_phong',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-thanhphong-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW.....TT.T.T.T......T......T.T......T..........T...T.T....TT.....T.....T.......T...T......T.T.T.T........T..T..TT.T...T.......T.....T..T....T....T....TT.....WW',
    'WW.....T...........T...TT.....T...T...T...........T........T.TT...............T.......T...T.......T.......T..............T..T..T.......T........T.............WW',
    'WW....T..TTT.....T.T.TT....T.T......TTT.TT........T...TT.T.........T..T.............T....T.....T..............TT....T..TT...........TTT......T..o.TT..T.......WW',
    'WW..T.o.T.TT..TT.T....To.TTT..T....T.T...TTTT.....T...T....T...........T......T....T......T....T...............T...T.....TT.T...T.......TT.......T....TT......WW',
    'WW....TTT.TT........TToT........T......T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.................................T..............T..T..........WW',
    'WW...TT..................T.T...T...T......T.....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH...................................T...TT..T...o...T....T.T...WW',
    'WW........T.....T..T...TT.....TTT......T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................................T..............T.....T....WW',
    'WW........T........T....T.......T...T...........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......................o.T........T...T.T............T...T..T..WW',
    'WW................T.....TT..T.....T...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...............TT...T..To........T..........WW',
    'WW....T.....T.......T......TT.o.TTooo..T......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...To....T...............T....T....T........WW',
    'WW.............TT.o.........TT................HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..To........................................WW',
    'WW..T.....T.T.T..........T.....T.T.....T......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.....TTT............oo..T.TTT.T.............WW',
    'WW..T....T..T.....TT......T.....T...T.T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.....TT.....T...T....T.T....T..........T....WW',
    'WW...T.T....T...T.T.o..T....TT.T..TT.....To...HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH......o..T.o..TT.T...T..o......T........o...WW',
    'WW..T..T.......TT.....T......To........TT.....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......To....................T.........T....WW',
    'WW.......o..T..............T.............T......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......................T.T....TT.......o......T....T........T..WW',
    'WW.......T.T.....T................T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ........T.T.......T...T...T...T....T..T...WW',
    'WW..................T.............T.TT....oTQQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQT...........T......o..TT.....T.......TT...WW',
    'WW............o..T..T.......................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T............TTTT...T..T...T.......WW',
    'WW........T......T....T.TT.T.o..T.....T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.T..T.TTT....T..T................T.T....WW',
    'WW........T.T....oT......TT.........T......TQQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ........T............T....................WW',
    'WW......T....TT...TT.T..o..T..T..........T..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T...T.T....T...T...T...T.T....T.........WW',
    'WW.........T..T.T.....TTT.....T..TT...T....TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o.....TT.......T.o.........T..........T..WW',
    'WW..T....T.T..........T...T.T......T...T..T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ....T......TT..........T......T.T.........WW',
    'WW..o.......T.T.T....T.....T.............TT.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T..........T...................T.......WW',
    'WW......T....T....T...T....T.T.TT......T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...TT...T......T....T...oT.TT.........T...WW',
    'WW....T..T.T.........T......T..T.T..T.....T.QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ..T.........T..o..T.T...T......TT......o..WW',
    'WW..oT.T.......T............TT...T..T.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.............T.T..........T............o..WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........o.................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW..................o........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQoQQQQ######QQQQoQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQoQ######QoQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...T....TT..T....TTTT.....T##.......T.....T...T..T.T.......T...............######..T.T...T.....T...T.........................T............T..........WWWWWWWWW',
    'WW......T.....T..TT........T.##T...........T..T.......T.....T................######........T......T.......................T...T......TT....T....T......WWWWWWWWW',
    'WW.......T......T.T..........##......T.TT.T..............T.T.................######....................................................................WWWWWWWWW',
    'WW......T...T.......TTT.T....##...........T.........T.TT.TT..T...............######......T.............................................................WWWWWWWWW',
    'WW...........................##...............##.............................######.................QQQQQQQQQQQQQQQQQQQQoQQQQQQQ##QoQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######............T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...T..TT.........QQQQQSQQQQQQQQQQQLQQQQQQQQQQ##QQQQLQQQQQQQQQQQQQQoQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQSQSQSQQQQQQQQQQQSQQ......######....T............QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.........T.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....T...........QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...TT............QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQoQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQLQQQQQQQQQQ##QQQQLQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQSQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQSQQQSQQQQQQ......######...........T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................WWWWWWW##WWWWWWWWWWWWWWW##WW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...T.............WWWWWWW##WWWWWWWWWWWWWWW##WW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.......TT........QLQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQLQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..........T......QQQQQQQQQQQQQQoQQQQQQQQQQQQQ##QQQQQQQoQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQ......######..........T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..QQSQQQQQQQQQQQQQQQQQQ......######........T.T......QQQoQoQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQoQQQQQQQQQQQQQWWWWWWWWW',
    'WW.....T.....................###############################################.######....T............QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................###############################################.######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW..T........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQLQQ######Q################QQQQQQQQQQQQQQQoQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######Q################QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.....TT....................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T..T....................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQL......WWWWWWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQQ......WWWWWWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW...T.T..QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQoQQQQQ##QQQQQQQoQQoQQQQQQQQQQWWWWWWWWW',
    'WW..T.....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQoQQQQQoQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQoQQQQQQQQQWWWWWWWWW',
    'WW.......TQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....###################............######.................HHHHHHQooQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T....QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW......T.QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######................LQQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW...T.T..QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW...........................##...............##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW...........................##..............................................######.............................................##.....................WWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######.................T............................##...............##..........WW',
    'WW...........................##..............................................######.............o..........T..TT.................##...............##..........WW',
    'WW...........................##..............................................######...........................T..##..............##............QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######..............................##..............##............QQQ##HHHHQ.....WW',
    'WW.....T..TTTT.TTT..TTT.TT.T.##T.T...T.TT....................................######..............T.....T.........##..............##............QQQ##HHHHQ.....WW',
    'WW...TT.TTT.##T..TT....TTTTT.##.T..T.T.......................................######...........................T..##..............##............QQQ##HHHHQ.....WW',
    'WW......TT.T##..T...TT.TTT..T##..TTT....T.................................L..######..L...........................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW..TTTT.........TT.TT..T..T.##TT..T.T..T....................................######.................T..T.........##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW.....TT.........T..TT..T...##TT...TTT.T....................................######..........................o.T.##........RRRRRR###################..........WW',
    'WW..TTT..........T..T..T.TTT.##.....TTT.T....................................######..................T..T........##...RRRRRRRRRRRR##################..........WW',
    'WW....TT.........T...T.....TT##T.TT.....T....................................######............................o.##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T............T.T..T..TTTT##T......T......................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...............T.TT.....TT.##T.T......T....................................######.......................T...T..##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T.TT.........T.TTT..TTT.T##T..T.TTT.T....................................######........................To....##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.....T.TTT##T...T...TTT...T..TTTTTTTTTT.................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T.TT....##.T.T..T....TT..TTTTT.TTTTT..................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..TTTT.TT.##T.T.T.....T..T..TTT...T..T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################.T..T....T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################T....T.T.TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.......T.T.TTTTT.TT.TT....TTTTTTT...T.T...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...........T..TTTTT.TT.T.T..############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..TTT...T....TT...TTTTTT.T.T############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..TTTTTTT.TT....TT.....TTT...TT.TT..T.....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....TT..TTT..TTT....T.TT.T....TT..........##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...........##...RRRRRRRRRRRRRRRRRRRRRRR.....##..........WW',
    'WW..T.....TT..TT...TT...T..TTTT...T....TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW....T...TT...TT.TTTT.T......T....T..TTT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW....TT.TT.T.T.......T.T..TT.T.T.T.TTT.T...CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW..T..T..T.TT......TT.....TT.T..T..........CCCCCC##CCCC##................L.Q######Q.L...........................##...............................##..........WW',
    'WW..TTT.TTT..TTTT..TTTT..TT.TT.TTTT.T.......CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW..T....TT..#############################################..................Q######Q..............................................................##..........WW',
    'WW..TT.T...T.############################################C.........HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW...T.T.TT.T...T..TTTT.....T...T..T..T.T..........................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW..T.T..TT..T..T.T..TT.TTTT.TTTTTT.T...T..........................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 70, ty: 64, name: 'Xuống Chân Núi Thanh Phong' },
    { x: 78, y: 139, to: 'map3', tx: 70, ty: 64, name: 'Xuống Chân Núi Thanh Phong' },
    { x: 79, y: 139, to: 'map3', tx: 70, ty: 64, name: 'Xuống Chân Núi Thanh Phong' },
    { x: 80, y: 139, to: 'map3', tx: 70, ty: 64, name: 'Xuống Chân Núi Thanh Phong' },
    { x: 81, y: 139, to: 'map3', tx: 70, ty: 64, name: 'Xuống Chân Núi Thanh Phong' },
    { x: 82, y: 139, to: 'map3', tx: 70, ty: 64, name: 'Xuống Chân Núi Thanh Phong' },
  ],
  npcs: [
    { id: 'ta_thanh_van', x: 80, y: 20, sprite: 'sect_master_thanh_phong' },
    { id: 'chap_su_tp', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'de_tu_kiem_dai', x: 125, y: 62, sprite: 'de_tu_phai' },
    { id: 'de_tu_ngoai_mon', x: 24, y: 90, sprite: 'de_tu_phai' },
    { id: 'thu_mo_tp', x: 102, y: 96, sprite: 'dai_phu' },
  ],
  zones: [
    { id: 'tang_thuong_son_mon', name: 'Tầng Thượng Sơn Môn', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu', name: 'Khu Đệ Tử Thanh Phong', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'kiem_mo', name: 'Kiếm Mộ', rects: [[98, 56, 152, 98]], types: [] },
    { id: 'chan_nui_son_mon', name: 'Chân Núi Sơn Môn', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 13, y: 113, item: 'linh_chi' },
    { x: 15, y: 116, item: 'linh_chi' },
    { x: 46, y: 122, item: 'linh_chi' },
    { x: 54, y: 126, item: 'linh_chi' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 130, y: 95, item: 'linh_chi' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Thanh Phong Phái' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 49, y: 68, label: 'Diễn Võ Trường' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 101, y: 77, label: 'Kiếm Mộ' },
    { sprite: 'sign', x: 115, y: 62, label: 'Kiếm Đài' },
    { sprite: 'sign', x: 19, y: 39, label: 'Linh Tuyền' },
    { sprite: 'sign', x: 124, y: 40, label: 'Vọng Vân Đài' },
    { sprite: 'sign', x: 115, y: 119, label: 'Hồ Tẩy Kiếm' },
    { sprite: 'sign', x: 17, y: 120, label: 'Trúc Lâm' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Thanh Phong' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Kinh Các' },
    { sprite: 'sign', x: 100, y: 19, label: 'Nghị Sự Đường' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN HUYỀN PHÁP TÔNG — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 31/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau SONMON_THANHPHONG), đăng ký
// vào registry instance riêng (đề xuất SONMONS) + nối cổng ở map 3
// — xem README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160
// cột (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá/trụ đá (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_HUYENPHAP = {
  id: 'sonmon_huyenphap',
  name: 'Sơn Môn Huyền Pháp Tông',
  sect: 'huyen_phap',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-huyenphap-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWT..........T.........T...T...T....T.T..T.T.......T.........T....T..............................T...T...T.TT..T.....T...T...T.....T.............o.........T..WW',
    'WW..T..T...TT..TT.T...o.T.TT.......T.......o..............T...TTo....o....T...............T.........................T........T.o........T...........T.......T.WW',
    'WW......T...T......T.......T..T..........T.......T...T.T..T..T.......T...T.TT.......T..........T...................T.T...T...T...T....T.T....T.T...oT.....T.T.WW',
    'WW.....T..........o...T..........T...T....T.....T..o..TT.......T............T............o......T.................T....T............T.............TT.TT.o..T..WW',
    'WWT....T........T.....T.T.T.o.......TTT...o...............T.....HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.TTT.....T.TT.....TT......T.....T....T........T.oT.T...T......WW',
    'WW.........T..T......TT.......T...TT.T....T..TT...T...T.T.T..T..HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..T.TTT..T..............o...T....T.....T...........T........T.WW',
    'WW......T.T.....T...............TT...T.....T........TTTTT...T...HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.TT...........TT....T.............T.T..........T....TT..T.....WW',
    'WW..TT..T..............T....T...T.......T.......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.T........T.T..T...T........o....T...T..T...oT............T.TTWW',
    'WW........T...T.......T.T.T.T.........TT.T.T.THHHHHHHHHHHH....o.HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...................T.T.............TT.......WW',
    'WW..TT.......o..T.......T....T.T....T.........HHHHHHHHHHHH..T..THHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.T....HHHHHHHHHHHH..T.T............T.....T......T...T..T..o..TWW',
    'WW.T.T.......................................THHHHHHHHHHHH.T....HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..TT..HHHHHHHHHHHH...T..T....T........TT..o...T....TT..T.....TWW',
    'WWTT....o..T.T.............T.o......T.........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..T.T.HHHHHHHHHHHH...........T......T......T......T..T.....T..WW',
    'WW...............T......TT.To.................HHHHHHHHHHHH..T...HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T..TTTTTTTT..................T.T......TTTWW',
    'WW...o..........T.T......T...T....T.T.........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.T...THHHHHHHHHHHH.TT....o........T....T..........T......T....WW',
    'WW.........TT......T..T.T.......T.T...o.....T.HHHHHHHHHHHH...T.THHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.T.T.....T.....T............................WW',
    'WW..TT.....................................T########################################################################.......T....T...T..T.T..TT......T.....T.T.WW',
    'WW...T..T.T............T.T....T.....T.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.........T..T.T......T..T.T....T.T..T.....WW',
    'WWT.......T....T....T.......T..TT....T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT.T..T.T..T.............T....TT......TT...WW',
    'WW.......T....T..........o.....TT....TT.T...QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T....T.....T....T......T.T.T......T....WW',
    'WW...T......T.......T.......T..T...o.....T..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ........T........T....T.....T.....T..T....WW',
    'WWT........TTT.....T.......T....o.T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T..TT....T......T........T...T..T....WW',
    'WW..........T..T..........T..T....T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ............T....To....T...........T......WW',
    'WW......T..................T....T.T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQ########QLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ....TT...oT......T....T....T...........T..WW',
    'WW.T.................T........T..T.T.T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...........................T.T............WW',
    'WW.T.T..T......T...T....T.o.T.......T.T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT....TTT......T.T...........TTT...T....T..WW',
    'WW..TTT.......o.................T.........T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...............T.......T.T.......TT...T...WW',
    'WW....T.T...T.............T..o..TT.TT....T..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ............T...T..........T..T...........WW',
    'WW...T.....TT...TT.TTT...T............T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.........T.T..T.......T..........T.T....T.WW',
    'WW.T..T....T....o...T....TT.....T........T.T.T.....TQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ...................TT....T.T..T........TT...T.TT.TWW',
    'WW..........T...................T.T.......T.........QQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ......T.TT....T...............T....TT.......T.....WW',
    'WWT.......T.................T..T......T.....T...T.T.QQLQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQLQQ...T............T..........T.....T.........T...T..WW',
    'WW..T....QQQQQQQQQQQQQQQQ.......o...T...TT.....T...TQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ......T....T..................T....T..T..T....T...WW',
    'WW.T.T...QQQQQQQQQQQQQQQQ...T..T.....T....T..TT.....QQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQT....o.T.T...T....RRRRRRRRRRRRRRRRRRRRRRR.........WW',
    'WW.T.....QQoQQQQQQQQQQoQQ....TT..T...T....TT..T..T..QQQQQQQQQQQQQQQQQQQQQQQ##########QQQQQQQQQQQQQQQQQQQQQQQ............T.....RRRRRRRRRRRRRRRRRRRRRRRT........WW',
    'WW.TT.T..QQQQQQQQQQQQQQQQ.............T............oQQQQQQQQQQQQQQQQQQQQQQL##########LQQQQQQQQQQQQQQQQQQQQQQ........T.T.....T.RRRRRRRRRRRRRRRRRRRRRRR...T.....WW',
    'WW.....T.QQQQQQQQQQQQQQQQ..To........T.o.T.T....T...QQQQQQQQQQQQQQQQQQQQQQ#Q########Q#QQQQQQQQQQQQQQQQQQQQQQ............TT....RRRRRRRRRRRRRRRRRRRRRRRT..T.....WW',
    'WWT.T..T.QQQQQQQQQQQQQQQQ..T........................QQQQQQQQQQQQQQQQQQQQQQ#Q########Q#QQQQQQQQQQQQQQQQQQQQQQ......T......T....RRRRRRRRQQQQQQQQRRRRRRR.TT...TT.WW',
    'WW..T....QQQQQQQooQQQQQQQ.....T.........T.....T..T.TQQQQQQQQQQQQQQQQQQQQQ##Q########Q##QQQQQQQQQQQQQQQQQQQQQ.oT........T..T...RRRRRRRRQQoQQoQQRRRRRRR.........WW',
    'WW.......QQQQQQQooQQQQQQQ#############################################################################################################QQQQQQQQRRRRRRR.....T...WW',
    'WW.T.....QQQQQQQQQQQQQQQQ#############################################################################################################QQQQQQQQRRRRRRR.T..T....WW',
    'WW...T...QQQQQQQQQQQQQQQQ...##.T...T..o...T.o.....T.QQQQQQQQQQQQQQQQQQQQQQ#Q########Q#QQQQQQQQQQQQQQQQQQQQQQ.......T..........RRR##RRRQQoQQoQQRRRRRRR.....o...WW',
    'WW.......QQQQQQQQQQQQQQQQ...##..T........T.T.....T..QQQQQQQQQQQQQQQQQQQQQQ############QQQQQQQQQQQQQQQQQQQQQQ.......TT.........RRR##RRRQQQQQQQQRRRRRRRTT...TT..WW',
    'WW.......QQoQQQQQQQQQQoQQ...##.....o....T.....T..T..QQQQQQQQQQQQQQQQQQQQQQQ##########QQQQQQQQQQQQQQQQQQQQQQQ.......T......TTT.RRR##RRRRRRRRRRRRRRRRRR......T..WW',
    'WW.....T.QQQQQQQQQQQQQQQQ.T.##TT...T..T.TT.........TQQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ...........TT.....RRR##RRRRRRRRRRRRRRRRRR.........WW',
    'WW.....T.QQQQQQQQQQQQQQQQ..T##T.T...T.TT...T........QQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ.T....T...........RRR##RRRRRRRRRRRRRRRRRR.........WW',
    'WW......T...T.............T.##T.......T.............QQLQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQLQQ....TT..T.T.T...T.RRR##RRRRRRRRRRRRRRRRRR.....T.T.WW',
    'WW..To.....T....T.......T.To##T..............T..T...QQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ.........T.........T.##.T.........T.......T...T...WW',
    'WW.............T.T..........##.T..TT..TTTT..T.......QQQQQQQQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQQQQQQQ...........T..TT....T##........T...TT.TT..o.......WW',
    'WWTT..oT.....T...T..........##T....T.....T...T..T.....T........T.....T...T..########...T..............T..T....T..T.........T.oT..##..T.T.T.............TT.....WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW..T..............T.......T##.............T..oT.........T...............T..########.........T.......T.T..............T..........##......T.......o...T.T......WW',
    'WW......T....T...T...T......##........To...T.T.......T.......T......T.......########...T..T.....................T........oT......##...........T....T.......T..WW',
    'WW.TT.QQQQQQQQQQQQQQQQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQT....o...............o...########....T........T.....T..T............T.......o.##..T.T.........T......o.....WW',
    'WW....QQQQQQQQQQQQQQQQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ...T.....T...T..T.......T########.T.TT.T...T.To.T....o.T.................o....##...T....T....T.o.....T.....WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQHHHHHHHHHHHHHQQ.QQQQQQQQQQQQQQQQQQQQQ...########..T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T.T##.....T......oT...To.......TWW',
    'WW...TQQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQHHHHHHHHHHHHHQQ.QQQQQQQQQQoQQQQQQQQQQT..########...TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...........T...........................WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQTQQHHHHHHHHHHHHHQQ.QQQQQQQQQQQQQQQQQQQQQ...########T...QQQQQQQQQQQQSQQQQQSQQQQQQQQQQQQo.T...L......................L....T....WW',
    'WWT..TQQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQHHHHHHHHHHHHHQQTQQQoQQQQQQQQQQQQQoQQQ...########...TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T...T.......................T...T....WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQTQQHHHHHHHHHHHHHQQ.QQQQQQQQQQQQQQQQQQQQQ...########..T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.............THHHHHHHH...T..........T..WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQTQQHHHHHHHHHHHHHQQ.QQQQQQQQQQQQQQQQQQQQQ...########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ........T.....HHHHHHHH.T.T..TT.........WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQHHHHHHHHHHHHHQQ.QQQQQQQQQQQQQQQQQQQQQ.L.########TL..QQQQQQoQQQQQQQQQQQQQQQQQoQQQQQQ..............HHHHHHHH....T.T..........WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQHHHHHHHHHHHHHQQTQQQQQQQQQQQQQQQQQQQQQ.T.########..T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.........T..HHHHHHHH..T.......T....T.WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQTQQHHHHHHHHHHHHHQQ.QQQQQQQQQQQQQQQQQQQQQ...########T.TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...........T..HHHHHHHH.....TT...T......WW',
    'WW....QQQQQQQQQQQQQQQQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQ###QQQQQQQQQ.T.########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....TTT..TT..HHHHHHHH..T............T.WW',
    'WW....QQQQQQQQQQQQQQQQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QoQQQQQQQ###QQQQQQQoQ...########..TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T........HHHHHHHH.....T.T.TT..T...WW',
    'WW.T..QQQQQQQQQQQQQQQQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQ###QQQQQQQQQ..o########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T.##############..........T.......WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQTQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQQQQQ...########.T.TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......##############.T....o.......T...WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQTQQQQQQQQQQQQQQQQQQQQQ...########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ......T..........T.........T...........WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQQQQQ...########....QQQQQQoQQQQQQQQQQQQQQQQQoQQQQQQ.....T...........T.......T..T..........WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQQQQQT..########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.............T.T....TT..T.T.......TTTT.WW',
    'WW..T.QQHHHHHHHHHHHHHQQQEQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQQQQQ...########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...TT..........T....TTT................WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQoQQQQQQQQQQQQQoQQQ...########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T.TT..........T...T..T..........T.T.WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQQQQQ.LT########.L..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.TT...TT.....o.T....T.....T.T...T....T.WW',
    'WW.T..QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQQoQQQQQQQQQQ...########T...QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..oT.......T............TT....T........WW',
    'WW....QQHHHHHHHHHHHHHQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQQQQQ.T.########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ....T........o.....T.............TT....WW',
    'WW..T.QQQQQQQQQQQQQQQQQQQQQQ##QQQ.QQQQQQQQQQQQQQQQQ..T...T..........T...T..T########....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ............T......o......T......TT....WW',
    'WW....QQQQQQQQQQQQQQQQQQQQQQ##QQQTQQQQQQQQQQQQQQQQQ.......T...TT...........T########..TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.........T.....................T..T....WW',
    'WW..o.........T.............########################################################################################################T..oT..T...T.............TWW',
    'WWT..........T..............########################################################################################################.............T.....T......WW',
    'WW.................T......T.##.TT..........o..o.........T....T.......TT.T...########...o...T...T...T.......T.....T.....To..........o...TTT............T.......WW',
    'WW...T..T........o..........##....T........T......T........T..T...T.....T...########.................................T.......T........T...TT.T........T.......WW',
    'WWT...................T.....##....T........T.........T...TTT..........T.....########.......T..T.........T...TT...................T....T...T...T.........T..T.oWW',
    'WWT...To.........T..........##....CCSCCCCCCCCCSCC.TT......CCCCCCCCCCCCCCC.T.########..T.T.........T........T......T...............T.T...............T.......T.WW',
    'WWT.T...................T...##....CCCCCCCCCCCCCCC........TCCCCCCCCCCCCCCC...########....................T....T.......o..T..T...........T....T..o...T..........WW',
    'WW.............T........T..o##.TT.CCCCCCCCCCCCCCCT..T.....CCCCCCCCCCCCCCCT..########..........................T..T............T....o.....TT.T.....T....T....T.WW',
    'WW......TT.........T..T.....##....CCCCCCCCCCCCCCC..T...TT.CCCCCCCCCCCCCCC...########.T...........T..T...........T....T..T.......TT.....T...........T.T........WW',
    'WW.T.....T.......T.........T##...TCCCCCCCCCCCCCCC.........CCCCCCCCCCCCCCC...########.........TT......T..ToT.TTT.T.......T....T.....T.T.TTTT.....T.............WW',
    'WWT..................T...T..##....CCCCCCCCCCCCCCC.....T.T.CCCCCCCCCCCCCCC...########..........T.T.TT......T.................T........T.....T.T......T.T....T..WW',
    'WW.T...T.T.....T.T..TT......##....CCCCCCCCCCCCCCC..TT.....CCCCCCCCCCCCCCC.L.########.L.........TTTT....T...T................T...T.............T...T...T..o....WW',
    'WW..T.T..T............TTT...##.TT.CCCCCCCCCCCCCCC.........CCCCCCCCCCCCCCC.T.########.......T....T.T..............T..........o..TT.T..........T.T.T.oT..T..T...WW',
    'WW...TT..............T......##....CCCCCCCCCCCCCCC.o.T.....CCCCCCCCCCCCCCC...########......o..............T..o........T....T.T....T......T......T......T.......WW',
    'WWT.T.......................##....CCCCCCCCCCCCCCC.........CCCCCCCCCCCCCCCT..########.T....TTTT.............T...T.....TT.T.....T..T..............T....T........WW',
    'WW........o......T..........##....CCCCCCCCCCCCCCCT...T.T..CCCCCCCCCCCCCCCT..########T..T...T....T.T...T..T.........T...T.T.....T....oT.T..T...............T...WW',
    'WW................T........T##....CCCCCCCCCCCCCCC...TT....CCCCCCCCCCCCCCC...########.................................oT....T...TTT....T...........TT....T....TWW',
    'WW.T.......T.T..TTTT........##....CCCCCCCCCCCCCCC......TT..T..o...T....T....########T.o.T..T...T............T.......................T........TTT...T........TTWW',
    'WW..T.T.T.....T.............##..T....T...........TT.T.T.....................########....T..............T.T..........ToT..T..............T.T........T...T.T....WW',
    'WWT.......T..TT.......T....T##TT.......................T.oo......T..T.......########..T.................T.......TT.......T..TT.....T...T...T....T......T......WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........TT.o....T.......##..........TTT....T....................T......########..TTT............T...........T.T............T##...T...T..o..T..........T..WW',
    'WWT...............TT.........##....T......T............To..T..T..T.......T..########T.........T...T...o.T.....T.....T..........T.##....T.....T..............T.WW',
    'WW....TTTTT...T.T....TTTT.T..##TT.T..TT.T...T....T..........T........T.T....########........TT.T.T.............T....T......T.....##.................o.....T...WW',
    'WW.TT.T..TTT...TTTT.TTT...TTT##.T.T.........T.............T....T.......T...T########T.T....T...........T....T....................##..T...T...T.o...TT.T.......WW',
    'WW......TTT....T..T.TTT..TTT.##TTT...TT............TTT.T.T...........T......########..............T...oT...T.oT....TT....T....TT.##.o.T..T....T....ToT........WW',
    'WW..TTT..TT...TT.....TTT..TTT##..T..TTTT....T.T....T............T....TTT..T.########TT.....T..T.T....T...TT......................##......T.T..............T...WW',
    'WW..TTTTTTTT.TTTT.TTTTTTT.TTT##..TT..TTT.TTT....T...............TT..T..o...T########..........T.....T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ....T....TT...TWW',
    'WW..T.T.........T.T.T......TT##TT......T..............T..T.....T........T...########....T..TT......T.T.T......QLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQ.....TT........WW',
    'WW.....T..TT...T.T.......TToT##TTTTT..TTT.........T.....T...T.......T.....L.########.L......TT........o.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT..T.....TTT..TWW',
    'WW..T.TTT..TT......o...o..TTT##..T.T.TTTT........T..o.....T..T.......T......########TT.T.T...T.T.......T.....TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...............WW',
    'WW...TT.T.T...T.T..T.....T.T.##oT...TT.TTTT.T.TT.T.............T...T..T...T.########.......o.T.....T.......TTTQQQQQQoQQQQQQQQQQQQQQQQQQQoQQQQQQ....T...T......WW',
    'WW.......TTT.....TTo...o...T.##TTT.TT..T....T................T.T............########..TTTT.....T........T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ......T...T..T.WW',
    'WW..T.TTT.......T..........TT##.T..T..TTT.T.....T.T.T.T....T..T...T.........########............T.............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T..T.T....WW',
    'WW...T.TTTT..TT.TTT..TTTTTTTT##.....T...T..............T...T..To.T..........########..............T.......T.TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T..........T.WW',
    'WW..TT...TTTTTTT.TT.T.T..TTT.##oT.TTTTT.....CCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQT.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...RRRRRRRRR...WW',
    'WWo.T.T..TTTT.TT..TT..T.TTTTT##.TTTT.TTTTT..CCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ.T.T..TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...RRRRRRRRR...WW',
    'WW......................T..T................##############QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQT...T...QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ...RRRRRRRRR..TWW',
    'WW..T..TT...T.T...T....T....................##############QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ......T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...RRRRRRRRRT..WW',
    'WW....TTT.......TTTTTTT....T.T.T...T..T.T...CCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..TRRRRRRRRR..TWW',
    'WW...TTTT..T.....T..TTT.TT.TTTTT..TT.T......CCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ.....T..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...RRRRRRRRRT.TWW',
    'WW..TT.TT.TT..TT...TTTTTTTTTTTTT.T....T.....CCCCCCCCCCCC..QQQQQQQQQQQQQQQQLQ########QLQQQQQQQQQQQQQQQQ.T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...RRRRRRRRR.T.WW',
    'WW......TT...T.T......TTT.TTT....TT.TTTT..TTCCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.RRRRRRRRR...WW',
    'WW......TTT.....TTTTT.TT...TTTTT.TT..TTT....CCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ.......TQQQQQQoQQQQQQQQQQQQQQQQQQQoQQQQQQ.T.RRRRRRRRR...WW',
    'WW..TTTTT.T.T.TTTTTT..T.TT.TTTTT.TTTTT.T...oCCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ....T.T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.o..T.....T..WW',
    'WW...TTTT.TT..T..TT.TT...T.TTTT...TTT.......CCCCCCCCCCCC..QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ.TT.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T....T......WW',
    'WW...TTTT.T.......T..T..TT......T..TT.T.T....T..o.........QQQQQQQQQQQQQQQQQQ########QQQQQQQQQQQQQQQQQQ.......TQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQT........T.....WW',
    'WW..TTTT...T..T...TT...TTTT..T.TTT..TT.TT......T...........o...oT..T....oT..########..T......TT...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ......T.T......WW',
    'WW.....TT..T..TT.TTT.T.TTT..TT.TTTT......T...T........T.T.......T...........########..T..............T.....T...T..T.T.TT.............T.........TTT............WW',
    'WW..TT.T..TTT.TTTTTTT..T.T.TTTTT..TTTTT..........o...........T.T........T...########...........TT...T........T....T..T.T..........T.T...T...T.............TT.TWW',
    'WW.TT.TT...TT...T.TTT.oT.T..T.....TT....T.................T.T..T.T....o.T...########.........T.......T.......T...o.T.........T...T.T..T.....T.T..T.........T.TWW',
    'WW.....TTT.T..TTT.TTT.T........TTTTT.TToT...T.......T....T...T...THHHHHHHHHH########HHHHHHHHHH................................T.T..T..T.......T....T........T.WW',
    'WWT.TT.T.T.TT...T.TTT....TT....TT.TTTTTTTT.T.TTT..T....T..........HHHHHHHHHH########HHHHHHHHHH........o......T....T.TT......T..............T.......T..........WW',
    'WW..TTTT......TT...TT.T..TTTT........TTTT.....T..........T........HHHHHHHHHH########HHHHHHHHHHT.T...oTT..T..T........T.T.TT.......T....T....T.................WW',
    'WW..T.............TT...T...oTT......TT....o.T.....T.........o.....HHHHHHHHHH########HHHHHHHHHH............TT.....T..T...........T...T.....o.......o..T........WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHH########HHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWGGGGGGWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 65, ty: 64, name: 'Xuống Chân Núi Huyền Pháp Tông' },
    { x: 78, y: 139, to: 'map3', tx: 65, ty: 64, name: 'Xuống Chân Núi Huyền Pháp Tông' },
    { x: 79, y: 139, to: 'map3', tx: 65, ty: 64, name: 'Xuống Chân Núi Huyền Pháp Tông' },
    { x: 80, y: 139, to: 'map3', tx: 65, ty: 64, name: 'Xuống Chân Núi Huyền Pháp Tông' },
    { x: 81, y: 139, to: 'map3', tx: 65, ty: 64, name: 'Xuống Chân Núi Huyền Pháp Tông' },
    { x: 82, y: 139, to: 'map3', tx: 65, ty: 64, name: 'Xuống Chân Núi Huyền Pháp Tông' }
  ],
  npcs: [
    { id: 'lieu_ngung_suong', x: 80, y: 20, sprite: 'sect_master_huyen_phap' },
    { id: 'thu_cac_hp', x: 51, y: 17, sprite: 'truong_lang' },
    { id: 'chap_su_hp', x: 72, y: 124, sprite: 'dai_phu' },
    { id: 'tran_su_hp', x: 62, y: 79, sprite: 'giu_mieu' },
    { id: 'de_tu_noi_mon_hp', x: 103, y: 69, sprite: 'de_tu_phai' },
    { id: 'de_tu_ngoai_mon_hp', x: 40, y: 92, sprite: 'hoc_tro' }
  ],
  zones: [
    { id: 'tang_thuong_huyen_phap', name: 'Tầng Thượng Sơn Môn', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_hp', name: 'Khu Đệ Tử Huyền Pháp', rects: [[4, 54, 50, 80]], types: [] },
    { id: 'vuon_linh_thao_hp', name: 'Vườn Linh Thảo', rects: [[30, 82, 56, 100]], types: [] },
    { id: 'tran_do_luyen_phap', name: 'Trận Đồ Luyện Pháp', rects: [[50, 54, 86, 100]], types: [] },
    { id: 'khu_luyen_cong_hp', name: 'Khu Luyện Công', rects: [[88, 54, 155, 100]], types: [] },
    { id: 'chan_nui_huyen_phap', name: 'Chân Núi Sơn Môn', rects: [[2, 104, 157, 137]], types: [] },
    { id: 'vanh_nui_huyen_phap', name: 'Vành Núi Ngoài', rects: [[2, 104, 10, 137], [150, 54, 157, 100]], types: ['khi_mat_do'] }
  ],
  monsters: [
    { type: 'khi_mat_do', x: 6, y: 108, zone: 'vanh_nui_huyen_phap' },
    { type: 'khi_mat_do', x: 8, y: 130, zone: 'vanh_nui_huyen_phap' },
    { type: 'khi_mat_do', x: 152, y: 59, zone: 'vanh_nui_huyen_phap' },
    { type: 'khi_mat_do', x: 152, y: 92, zone: 'vanh_nui_huyen_phap' }
  ],
  herbs: [
    { x: 36, y: 88, item: 'linh_chi' },
    { x: 44, y: 95, item: 'linh_chi' },
    { x: 62, y: 90, item: 'linh_chi' },
    { x: 68, y: 95, item: 'linh_chi' },
    { x: 12, y: 120, item: 'linh_chi' },
    { x: 21, y: 116, item: 'linh_chi' },
    { x: 124, y: 48, item: 'linh_chi' },
    { x: 20, y: 44, item: 'linh_chi' },
    { x: 100, y: 133, item: 'linh_chi' }
  ],
  props: [
    { sprite: 'sign', x: 85, y: 130, label: 'Sơn Môn Huyền Pháp Tông' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Huyền Pháp' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Kinh Các' },
    { sprite: 'sign', x: 100, y: 19, label: 'Truyền Pháp Đường' },
    { sprite: 'sign', x: 120, y: 36, label: 'Hàn Đàm' },
    { sprite: 'sign', x: 134, y: 38, label: 'Pháp Đàn Cổ' },
    { sprite: 'sign', x: 15, y: 31, label: 'Pháp Đàn Thượng' },
    { sprite: 'sign', x: 62, y: 81, label: 'Trận Đồ Luyện Pháp' },
    { sprite: 'sign', x: 45, y: 83, label: 'Vườn Linh Thảo' },
    { sprite: 'sign', x: 30, y: 57, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 95, y: 59, label: 'Khu Luyện Công' },
    { sprite: 'sign', x: 135, y: 71, label: 'Tĩnh Tâm Đài' },
    { sprite: 'sign', x: 16, y: 118, label: 'Ngũ Hành Lâm' },
    { sprite: 'sign', x: 113, y: 111, label: 'Đài Thử Pháp' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 138, y: 38 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 9, y: 123 }
  ]
};
// ============================================================
// SƠN MÔN THIÊN CÔNG PHƯỜNG — map instance riêng của tông thien_cong
// (gói tmp/map-packages/sonmon-thiencong/, sinh tự động bằng
//  gen/build_data_js.py từ gen_layout.py — không sửa tay file này).
// Đội tích hợp: nạp sau maps.js, đăng ký vào danh sách map với
// cờ instance (không tính vào bản đồ thế giới/minimap chung),
// cổng vào đặt ở map 3 cạnh NPC tong_khi kèm điều kiện reqSect.
// ============================================================
var SONMON_THIENCONG = {
  id: 'sonmon_thiencong',
  name: 'Sơn Môn Thiên Công Phường',
  sect: 'thien_cong',
  instance: true,
  bg: null,
  bgChunks: {
    src: 'assets/sonmon-thiencong-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54,
    overlapTiles: 8, originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW..T....TT......T..................T..........T......TT......T..........T.TT........T..T.....T..T......T.T..T...T..TT..........TTT.......T.TT....T....T......WW',
    'WW..T.T.....T....T.T.TT..........T.TT..T...T..T...T.T.....T.T...T............T.T..T..................T..........T.T.....T.......T..T......T.......TTT.........WW',
    'WW.....T...T.T...ToT..T.....T.....T.T......T....T...T........T...........T.....T....T..TT...T.T..T.T.T.T...TTT.....T.T.....T...TT......T.TT....T...TT.....T...WW',
    'WW....T....T.T....T.TT.....T...........TT.oTT.T.....TT..T.......T.T.......T...T..T...T.TT.....T........................TT....T.T.o.......T..T....TT.....T..T..WW',
    'WW....T....T....ToT................TT...........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................T.oT......T........TT......T......WW',
    'WW...T.....T..T.....T.o......T.........T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.......................T......TT...........T....TT....o...T...WW',
    'WW.......T............T.T........T....T.........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.........................T.............To.T.T...T....T.TT.....WW',
    'WW..............o....T...T......TT...T..oT......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.........................T...oo.......o.To....o............T..WW',
    'WW....T.T....T..T......T.........TT...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......TT....T.T........T............T......WW',
    'WW.......T......TT..T....TT...........T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..TT.........T.....T...T........T........T..WW',
    'WW......To.TT..T......T.To.T..........o.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.....T.....T...T...T...T....T......T....T...WW',
    'WW.....TTT..............oT.....TTTT.T.T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...........T....oT..T............To...T..T..WW',
    'WW..................T....T.T.T....T.TT........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T....T....T....T.T....T..............o...WW',
    'WW......oT.T.....T.TT...TT..oT......T..T..o...HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..........TT........TTT....T..........T.....WW',
    'WW.......T.......TTT..........TT.T.TT......T..HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH......T.T..T........T.oT...........TT....T..WW',
    'WW...T......T.T.....................T....T.o....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................T..T.....T....T..................T........WW',
    'WW..........T........o..T...TT.........T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o.......T...T.o...T.T....T........T......WW',
    'WW..T.....T....T.T.....T....T.......T..T....QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQTT....TT.......T..T....T........T.........WW',
    'WW.............T......T......T............TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.........T.........T..T.T..............T..WW',
    'WW...T.T...TT..T.....TT.....TT...T.T........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.....T.........TTT...............T...T..WW',
    'WW.............o..........................T.QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ.T...TTT.....TT.......T.....T.T.T.........WW',
    'WW....T...TT..T........T...TT...T....T...T.TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.T...............T....T.....T...T.......WW',
    'WW..T....T...............T............To....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.............o..T...T........T............WW',
    'WW...............T...TTT..............T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...TTT........T.T...........T....T........WW',
    'WW..T...............o......TT...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T..T..o...........TT.....ToTT......WW',
    'WW.........................T......T........TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T...T...................T.........o...T..WW',
    'WW...TTT............To.....T...o.......T....QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQT.......T.T..TT.TT.....T......oTTT....T...WW',
    'WW....T................T.o......To.....T...TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T....T.T..........T.....T..T....TT...WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQoQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQoQQQQ######QQQQoQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQSQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQoQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQSQQQQQQQQQQQQoQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQoQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQSQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQoQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW........TT.................##T....T.....T...T..............TT..............######.T.....T.....T..........T.T...T............................T.....T..WWWWWWWWW',
    'WW..TT..........T......T.....##.T..T..T........TT.....T.T.T..T...............######.T............T.T............TT...T.......T.T...................TTT.WWWWWWWWW',
    'WW..T...T...T.......T.......T##......T..T...T....TT..T....TTTT...............######....................................................................WWWWWWWWW',
    'WW......T...T....TT.........T##.....T..T.T...T....TT....TT...T...............######....T...............................................................WWWWWWWWW',
    'WW...........................##...............##.............................######.......T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..T..T...........QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQSQSQSQQQQQQQQQQQSQQ......######........T........QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...........T.....QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..T..............QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######........T........QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....T..T........QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQSQQQSQQQQQQ......######......T..........QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T...............QQQQQQHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######........T........QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T...............QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....TT..........QQQQQQQQQQQQQQQQQQoQQ##QQQoQQQQQQQoQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.......T...................##...............##..QQSQQQQQQQQQQQQQQQQQQ......######.......T.T..T....QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T......................###############################################.######.................QQQQRRRRRRRRRRQQQQSQQ##QQQSQQQQQQQSQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T......................###############################################.######.T.....T.........QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQLQQ######Q################QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.......T...................##...............##..................QQQQQQQQQQQ######Q################QQQQRRRRRRRRRRQQQQoQQ##QQQQQQQQQQQoQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T......................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T.......................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQL......QQQQRRRRRRRRRRQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.......T...................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQQ......QQQQQQQQQQQQQQQQQQSQQ##QQQQQQQQQQQSQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######.................QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##QQQQQQQQQQQQQQQQQ............######.................QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.......TQQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##QQQoQQQQQQQQQQQQQ............######.................QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##QQQQQQQQQQQQQQQQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##QQQoQoQQQQQQQQQQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##QQQQQQQoQQQQQQQQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW.....T..QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##QQQQQQQQQQQQQQQQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW......T.QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##QQQQQQQQQQQQQQQQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW..T...T.QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##QQQQQQQQQQQQQQQQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##QoQQQQQQQooQQQoQQ............######.................QQQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQQQWWWWWWWWW',
    'WW.......TQQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##QQQQQQQQQQQQQQQQQ............######.................QLQQHHHHHHHHHHHHHHHHQ##QQQHHHHHHHHHHHHHHHHQQQQQQQLQWWWWWWWWW',
    'WW......TTQQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##QQQQQQQQQQQQQQQQQ............######.................QQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T..TTQQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##QQQQQQQQQQQQQQQQQ............######.............................................##.....................WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##QQQQQQQQQQQQQQQQQ............######.............................................##.....................WWWWWWWWW',
    'WW...........................##...............##QQQQQQQQQQQQQQQQQ............######.............................................##.....................WWWWWWWWW',
    'WW...........................##..............................................######.............................................##.....................WWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW......o..o##.....o.o....o..##........To....................................######.......................T.T....................##...............##..........WW',
    'WW...o...o.o##o........o.....##...o.o........................................######..........................o...................##...............##..........WW',
    'WW..T..o....##.o......oT....o##....o.........................................######.............T...........T....##..............##............QQQ##QQQQQ.....WW',
    'WW..........##...............##.o............................................######....................T.........##..............##............QQQ##HHHHQ.....WW',
    'WW..ooo..o..##......o........##.....o..o.....................................######.................T..........o.##..............##............QQQ##HHHHQ.....WW',
    'WW......o...###################T.oo..o.......................................######..................T......o....##..............##............QQQ##HHHHQ.....WW',
    'WWWWWWW.....###################o.oT...oT..................................L..######..L....................T....T.##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WWWWWWW..o..##....T..o.......##o...o...o.....................................######..............................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WWWWWWW.....##.o..o......o...##.....o........................................######..............................##........RRRRRR###################..........WW',
    'WWWWWWW.....##.....T.oo......##.T..oo........................................######....................T........T##...RRRRRRRRRRRR##################..........WW',
    'WWWWWWW...To##.o.o..T..T....o##oo....T..o....................................######...............o...T........T.##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWWTo...##o.....o....T...##...o..........................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW..oo.##o....o.........##.To....o......................................######..............TT...T..........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW..HHHHHHHHo.o........T##oT.o..o.......................................######...................T..T.......##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW..HHHHHHHH.....o......o.......o....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW..HHHHHHHH..L....o......o..........................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW..HHHHHHHH...ooo.o............T..o...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WWWWWWW##HHHHHHHH.......o.o.o...............CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WWWWWWW##o....oo..o........T................CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW.......T.....L.....o....o............CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW............o......o.o.############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWWo......................############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW...............o.....oo..o...T.o.o...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WWWWWWW................o..o.......o.T...o...##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...........##...RRRRRRRRRRRRRRRRRRRRRRR.....##..........WW',
    'WWWWWWWo............o......o.......o.T......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW.................o.ooo.o..................CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW.......o..............T.o.o.oo..o.o..o....CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW....o......................T....o...T.....CCCCCC##CCCC##................L.Q######Q.L...........................##...............................##..........WW',
    'WW....o.o............o....oo.......o........CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW.....o....o#############################################..................Q######Q..............................................................##..........WW',
    'WW...o..T....############################################C.........HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.......oTo................o..........o...........................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW...T.o.T..o......o....o..o.oo.......oTo..........................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED, // dùng lại bảng BLOCKED của maps.js (W,H,T,S,L,F,o,E,R)
  start: { x: 80, y: 134 }, // điểm rơi khi bước qua cổng ở map 3
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 75, ty: 63, name: 'Xuống Chân Núi Thiên Công' },
    { x: 78, y: 139, to: 'map3', tx: 75, ty: 63, name: 'Xuống Chân Núi Thiên Công' },
    { x: 79, y: 139, to: 'map3', tx: 75, ty: 63, name: 'Xuống Chân Núi Thiên Công' },
    { x: 80, y: 139, to: 'map3', tx: 75, ty: 63, name: 'Xuống Chân Núi Thiên Công' },
    { x: 81, y: 139, to: 'map3', tx: 75, ty: 63, name: 'Xuống Chân Núi Thiên Công' },
    { x: 82, y: 139, to: 'map3', tx: 75, ty: 63, name: 'Xuống Chân Núi Thiên Công' },
  ],
  npcs: [
    { id: 'mac_thiet_tam', x: 80, y: 20, sprite: 'sect_master_thien_cong' },
    { id: 'chap_su_tc', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'tho_ca_tc', x: 122, y: 79, sprite: 'de_tu_phai' },
    { id: 'coi_lo_tc', x: 109, y: 84, sprite: 'dai_phu' },
    { id: 'de_tu_tc', x: 58, y: 66, sprite: 'de_tu_phai' },
    { id: 'de_tu_ngoai_tc', x: 24, y: 90, sprite: 'de_tu_phai' },
  ],
  zones: [
    { id: 'tang_thuong_tc', name: 'Tầng Thượng Sơn Môn', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_tc', name: 'Khu Đệ Tử Thiên Công', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'lo_ren', name: 'Lò Rèn Thiên Công', rects: [[98, 56, 152, 98]], types: [] },
    { id: 'chan_nui_tc', name: 'Chân Núi Sơn Môn', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái, không PvP
  herbs: [
    { x: 12, y: 126, item: 'linh_chi' },
    { x: 15, y: 129, item: 'linh_chi' },
    { x: 46, y: 122, item: 'linh_chi' },
    { x: 54, y: 126, item: 'linh_chi' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 151, y: 44, item: 'linh_chi' },
  ],
  props: [
    { x: 86, y: 131, sprite: 'sign', label: 'Sơn Môn Thiên Công Phường' },
    { x: 60, y: 119, sprite: 'sign', label: 'Tiếp Khách Đài' },
    { x: 49, y: 68, sprite: 'sign', label: 'Bãi Luyện Tay' },
    { x: 45, y: 83, sprite: 'sign', label: 'Khu Đệ Tử' },
    { x: 102, y: 71, sprite: 'sign', label: 'Lò Rèn Thiên Công' },
    { x: 115, y: 78, sprite: 'sign', label: 'Bể Tôi' },
    { x: 124, y: 91, sprite: 'sign', label: 'Kho Tinh Thiết' },
    { x: 19, y: 120, sprite: 'sign', label: 'Hầm Mỏ Mẫu' },
    { x: 19, y: 39, sprite: 'sign', label: 'Suối Khoáng' },
    { x: 124, y: 40, sprite: 'sign', label: 'Bãi Thử Khí' },
    { x: 115, y: 119, sprite: 'sign', label: 'Hồ Làm Mát' },
    { x: 74, y: 29, sprite: 'sign', label: 'Đại Điện Thiên Công' },
    { x: 59, y: 19, sprite: 'sign', label: 'Tàng Khí Các' },
    { x: 100, y: 19, sprite: 'sign', label: 'Hội Công Đường' },
    { x: 30, y: 44, sprite: 'bush', label: '' },
    { x: 63, y: 33, sprite: 'bush', label: '' },
    { x: 96, y: 33, sprite: 'bush', label: '' },
    { x: 8, y: 124, sprite: 'bush', label: '' },
  ]
};
// ================================================================
// SƠN MÔN ĐAN HÀ CỐC — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá thạch (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_DANHA = {
  id: 'sonmon_danha',
  name: 'Sơn Môn Đan Hà Cốc',
  sect: 'dan_ha',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-danha-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW.........T.....T.T....T..........TT.T...T..T........T........T.T....T..T............TT....T....T.............................T........TTT...................WW',
    'WW..........T..T.....T...T.TT..T...........T.TT...TT...T..T......T..T.......T...T...T..T.......T..T......T........T......T..........T.TT.......T..TT..........WW',
    'WW....TT.T.T..T..T....TTT....T..T..TTT...T.....T....T......T............T.T....T..........TT....T.......T.T........TTT.T..T.....T.......T......T.......T......WW',
    'WW............T......T.................TTT.T............T..T.........T.T............T....TT..T........T.............TT........T..........T....T...............WW',
    'WW..............................................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..............................................................WW',
    'WW..............................................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH...........................................RRRRRRR............WW',
    'WW....................#.........................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..........................................RRRRRRRR............WW',
    'WW....................#.........................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.........................................RRRRRRRRRR...........WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH........................RRRRRRRR............WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.........................RRRRRRR............WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH............................................WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...........................RR...............WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...........................RR...............WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...........................RR...............WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..T.....T...T.......T.T....RRo...T.T........WW',
    'WW....................#.........................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH........................................TT...RR...o...........WW',
    'WW......#############################.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT...T.o.T.T.....T........RR...T...........WW',
    'WW....................#.....................QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ.T.T...o......T.......T.TRR......T........WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T.........T.......TT.TRRTT.T...........WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...........T...TT........RR.T.T.T.........WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT..T...T...........T.....RR.....T....T....WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T...................T...RR.To.......T....WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ......T....T....T........RR..TT...........WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T..........o..T.o.RRT..T......T....WW',
    'WW........CCCCCCCCCCC.#.CCCCCCCCCCC.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T.....T........TT......RR...T....o.T....WW',
    'WW....................#.....................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.............T......T....RR............T..WW',
    'WW....................#.....................QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ.....................o...RRT....T....ToT..WW',
    'WW..........................................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ................TT.......RR.T.....T..T....WW',
    'WW.....T..................T..##.......o.............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##..........RR...............WW',
    'WW..............T........T...##.T...................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##.........RR................WW',
    'WW................T...o......##To...o...T...........QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........RR................WW',
    'WW......T.T....T..T......o...##......TT.............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW..............T......TT..T.##...oT................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW........T.........T..TT..T.#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQLQQQQQQQQ##QQQQQLQQ.RR................WW',
    'WW.........T..T..............#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW.......TTT........##.......##T.....TTTT...........QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW...T.o............##.......##..o......T...........QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW...T....T.T.......##.....T.##T.....o.TT...........QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW.....TT...T......T##..T....##.....T...............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW.....TTT..........TT.T.oT..##....T.T..............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW.......TRRRRRRR............##.........T...........QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW......TRRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQLQQQQQQQQ##QQQQQLQQ.RR................WW',
    'WW...o...RRRRRRRRR...........##T....T...............QQQQQQQQQQQQQQQQQQQQQQQoQ######QoQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW...T....RRRRRRR..T.........##.T...................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..........QQQQQQQQQQQ##QQQQQQQQ.RR................WW',
    'WW....T...............o......##T....o.T.............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........RRR...............WW',
    'WW............oT.T.T...TT..T.##....TT...............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........RR..............WW',
    'WW...TT...T.T................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........RR..............WW',
    'WW......................o...T##...TT..T.............QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........RR..............WW',
    'WW........T...TT...T....T...T##.T.....T......................................######..............................................##...........RR..............WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWRRWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWRRWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWRRWWWWWWWWWWWWWWWW',
    'WW.......................####..............................T............T....######........TT......T.................T.T............T......##.RR..............WW',
    'WW.......................####......................T.........................######........................................................##.RR..............WW',
    'WW.......................####.........................T......................######..............................................T.........##.RR..............WW',
    'WW.......................####................................................######.......T................................................##.RR..............WW',
    'WW.......................##..................##QQQQQQQQQQQQQQQQQQQQQQQ.......######.........T.....QQQQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHHQQ##.RR..............WW',
    'WW....L..................##.................L##QQHHHHHHHHQQQHHHHHHHHQQ.......######..T...T........QQQQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHHQQ##.RR..............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQ.......######..T............QQLQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHLQQ##.RR..............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQ.......######...............QQQQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHHQQ##.RR.QQQQQQQQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQ.......######...............QQQQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHHQQ##.RR.QQQQQQQQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQ.......######...............QQQQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHHQQ##.RR.QQQHHHHQQ....WW',
    'WW..T...CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...T.....T.T...QQQQHHHHHHHHHHHHHHHHHHHQQQHHHHHHHHHHHHHQQ##.RR.QQQHHHHQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######........T......QQQQHHHHHHHHHHHHHHHHHHHQQQQQQQQQQQQQQQQQQ##.RR.QQQHHHHQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######.###############QQQHHHHHHHHHHHHHHHHHHHQQQQQQQQQQQQQQQQQQ#####.QQQQQQQQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######.###############QQQHHHHHHHHHHHHHHHHHHHQQQQQQQQQQQQQQQQQQ##.RR.QQQQQQQQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQHHHHHHHHHHHHHHHHHHHQQQQQQQQQQQQQQQQQQ##.RR.QQQQQQQQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ##.RR.QQQQQQQQQ....WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ##.RR..............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW.......................##R.................##QQQQQQQQQQQQQQQQQQQQQQQ.......######........................................................##RR...............WW',
    'WW...T...................##R.................##QQQQQQQQQQQQQQQQQQQQQQQ.......######........................................................##RR...............WW',
    'WW.......................##R.................##...........E..................######........................................................##RR...............WW',
    'WW......RRRRRRRRRRRRRRRRR##RRRRRRRRRRRRRRRR..###############################.######...............QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW.......................##R.................###############################.######...............QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##...................QQQQQQQQQQQ######QQQQQQQQQQQ....QQQQSQQQQQSQQQQQSQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW..T...CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##...................QQQQQQQQQQQ######QQQQQQQQQQQ....QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQ....QQQQQQQQQQQQQQQQQQQQQQQ.QQQQSQQQQQSQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQQQQLQQQ######QQQLQQQQQQQ....QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQQQQQQQQ######QQQQQQHHHQQ....QQQQSQQQQQSQQQQQSQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQQQQQQQQ######QQQQQQHHHQQ....QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQQQQQQQQ######QQQQQQQQQQQ....QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW..T...CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQHHHHHHHHQQQHHHHHHHHQQ.......######.......................................QQQQSQQQQQSQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######.......................................QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######.......................................QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW...T..CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQ.QQQQQQQQQQQQQQQQQ##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCCCCCCCC..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##RR...............WW',
    'WW....#########################################QQHHHHHHHHQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##RR...............WW',
    'WW.......................##R.................##QQHHHHHHHHQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCC.HHHHH..##QQHHHHHHHHQQQQQQQQQQQQQ.......######...............QQQQQQQQQQoooQQQQQQQQQQ..................##RR...............WW',
    'WW..TT..CCCCCCCCCCCCCC...##R.CCCCCCCC.HHHHH..##QQHHHHHHHHQQQQQQQQQQQQQ.......######...............QQQQQQQQQQoQoQQQQQQQQQQ..................##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCC.HHHHH..##QQHHHHHHHHQQQQQQQQQQQQQ.......######...............QQQQQQQQQQoQoQQQQQQQQQQ..................##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCC.HHHHH..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##RR...............WW',
    'WW......CCCCCCCCCCCCCC...##R.CCCCCCCC.HHHHH..##QQQQQQQQQQQQQQQQQQQQQQQ.......######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##R................WW',
    'WW..T...CCCCCCCCCCCCCC...##R.CCCCCCCC........##..............................######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##R................WW',
    'WW....L..................##.................L##..............................######...............QQQQQQQQQQQQQQQQQQQQQQQ..................##R................WW',
    'WW.......................######..............##..............................######........................................................##R................WW',
    'WW.......................######..............................................######........................................................##R................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWRRWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWRRWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWRRWWWWWWWWWWWWWWWWWW',
    'WW...........................................................................######.............................................##..........RR....##..........WW',
    'WW..TT.......................................................................######.............................................##..........RR....##..........WW',
    'WW....................#.....................................HHHHHHH..........######..........HHHHHHHH...........................##..........RR..QQ##QQQQQ.....WW',
    'WW....T...............#.....................................HHHHHHH..........######..........HHHHHHHH...........................##..........RR..QQ##HHHHQ.....WW',
    'WW..T...CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.......................HHHHHHH..........######..........HHHHHHHH...........................##..........RR..QQ##HHHHQ.....WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.......................HHHHHHH..........######..........HHHHHHHH...........................##..........RR..QQ##HHHHQ.....WW',
    'WW....T.CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.......................HHHHHHH.......L..######..L.......HHHHHHHH......................RRRRR##RR........RR..QQ##QQQQQ.....WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.......................HHHHHHH..........######..........HHHHHHHH..........L...........RRRRR##RR........RR.L..##..........WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.......................HHHHHHH..........######..........HHHHHHHH............RRRRRRRRRRRRRRR##RRRRRRRRRRRR....##..........WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................L..................######..................#L########.RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##.....TT...WW',
    'WW..T...CCCCCCCCCCCCC.#.CCCCCCCCCCCCC........................S...S...........######..................##########.RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##.......T..WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC........................................######.............................RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##TT........WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC........................................######.............................RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##..........WW',
    'WW....T.CCCCCCCCCCCCC.#.CCCCCCCCCCCCC........................................######...................T.........RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##.T........WW',
    'WW....................#...................................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..........RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##.T....T...WW',
    'WW......RRRRRRRRRRRRRR#RRRRRRRRRRRRRR.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQT.....T...RRRRRRRRRRRRRRRR##RRRRRRRRRRRRR...##.......T..WW',
    'WW....................#...................................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..o.....######################################..T.......WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..........RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR...........oT..WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..........RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.........oT....WW',
    'WW..T...CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQT.....T...RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.....T.........WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..........RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR...............WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..o.......RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR...............WW',
    'WW....T.CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..........RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR...........o...WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...T......RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR...............WW',
    'WW..T...CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ......T....RRRRRRRRRRRRRRRRRRRRRRRRRRRRR................WW',
    'WW......CCCCCCCCCCCCC.#.CCCCCCCCCCCCC.....................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ....T...........................................T.......WW',
    'WW....................#.................................##..................Q######Q................................................................T.T....T..WW',
    'WW....................#.................................##..................Q######Q......................T...................................................WW',
    'WW......................................................##..................Q######Q...................o..o.........................................T....TT...WW',
    'WW...........#############################################..................Q######Q.....................T.............................................T......WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.........T....T.T..........................................T.....WW',
    'WW...T......................................................T.T..T.HHHHHHHHHQ######QHHHHHHHHH.............T.............................................T.....WW',
    'WW....................................T..............T.......T.....HHHHHHHHHQ######QHHHHHHHHH............................................................o....WW',
    'WW.........................................T................T......HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 67, ty: 67, name: 'Xuống Chân Núi Đan Hà Cốc' },
    { x: 78, y: 139, to: 'map3', tx: 67, ty: 67, name: 'Xuống Chân Núi Đan Hà Cốc' },
    { x: 79, y: 139, to: 'map3', tx: 67, ty: 67, name: 'Xuống Chân Núi Đan Hà Cốc' },
    { x: 80, y: 139, to: 'map3', tx: 67, ty: 67, name: 'Xuống Chân Núi Đan Hà Cốc' },
    { x: 81, y: 139, to: 'map3', tx: 67, ty: 67, name: 'Xuống Chân Núi Đan Hà Cốc' },
    { x: 82, y: 139, to: 'map3', tx: 67, ty: 67, name: 'Xuống Chân Núi Đan Hà Cốc' },
  ],
  npcs: [
    { id: 'tan_duoc_tu', x: 80, y: 20, sprite: 'sect_master_dan_ha' },
    { id: 'chap_su_dh', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'quan_vuon_dh', x: 25, y: 74, sprite: 'dai_phu' },
    { id: 'dan_su_dh', x: 111, y: 71, sprite: 'de_tu_phai' },
    { id: 'de_tu_hai_duoc_dh', x: 13, y: 133, sprite: 'de_tu_phai' },
  ],
  zones: [
    { id: 'tang_thuong_dan_ha', name: 'Tầng Thượng Đan Hà', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'vuon_duoc_trung_coc', name: 'Vườn Dược Trung Cốc', rects: [[4, 54, 46, 100]], types: [] },
    { id: 'khu_de_tu_dan_ha', name: 'Khu Đệ Tử Đan Hà', rects: [[44, 54, 95, 100]], types: [] },
    { id: 'dan_phong_khu', name: 'Khu Đan Phòng', rects: [[96, 54, 152, 100]], types: [] },
    { id: 'bo_suoi_dong', name: 'Bờ Suối Đan Hà', rects: [[140, 54, 157, 100]], types: [] },
    { id: 'chan_coc_dan_ha', name: 'Chân Cốc Đan Hà', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 15, y: 13, item: 'ngoc_tuy_chi' },
    { x: 29, y: 23, item: 'huyet_sam' },
    { x: 15, y: 23, item: 'linh_chi' },
    { x: 14, y: 66, item: 'linh_chi' },
    { x: 35, y: 66, item: 'thao_duoc' },
    { x: 14, y: 83, item: 'linh_chi' },
    { x: 32, y: 95, item: 'ngoc_tuy_chi' },
    { x: 14, y: 112, item: 'thao_duoc' },
    { x: 30, y: 124, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 111, y: 117, item: 'hoa_diem_lien' },
    { x: 147, y: 85, item: 'linh_chi' },
    { x: 152, y: 58, item: 'thao_duoc' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Đan Hà Cốc' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Đan Hà' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Đan Các' },
    { sprite: 'sign', x: 100, y: 19, label: 'Tĩnh Tu Đường' },
    { sprite: 'sign', x: 44, y: 74, label: 'Vườn Dược Trung Cốc' },
    { sprite: 'sign', x: 99, y: 73, label: 'Đan Phòng' },
    { sprite: 'sign', x: 121, y: 82, label: 'Luyện Công Bình' },
    { sprite: 'sign', x: 63, y: 104, label: 'Sảnh Giao Dịch Đan Dược' },
    { sprite: 'sign', x: 104, y: 108, label: 'Kho Dược' },
    { sprite: 'sign', x: 111, y: 110, label: 'Hồ Hà' },
    { sprite: 'sign', x: 19, y: 39, label: 'Linh Tuyền' },
    { sprite: 'sign', x: 124, y: 40, label: 'Vọng Hà Đài' },
    { sprite: 'sign', x: 17, y: 120, label: 'Vườn Dược Chân Cốc' },
    { sprite: 'sign', x: 105, y: 90, label: 'Đan Đài Lộ Thiên' },
    { sprite: 'sign', x: 144, y: 66, label: 'Bờ Suối Đan Hà' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 139, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN VẠN THÚ MÔN — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà/chuồng (chặn), "T" cây (chặn),
// "S" sạp/giá/máng/chướng ngại (chặn), "L" đèn đá (chặn),
// "F" hàng rào chuồng (chặn), "C" ruộng, "o" đá (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_VANTHU = {
  id: 'sonmon_vanthu',
  name: 'Sơn Môn Vạn Thú Môn',
  sect: 'van_thu',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-vanthu-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...T...T...................TT........T...TT.........T.TTT.TT.....T......TTTT.T..T.....TT....T.T......T...T.....T..T....TT.T....TT......T....................WW',
    'WW..T..........T......TT......T..........T.TT........T..T.....T..T......T.T..T...T..TT..........TTT.......T.TT....T....T....T.T.....T....T.T.TT..........T.T..WW',
    'WW..T..T...TT..T.To..T.T..T...T.T..T.T..T..........T.T..T..................T..........T.T.....T.......T..T......T.......TTT..........T...T.T...TT.TT.....T.T..WW',
    'WW...T...T......TT.....T...T......T..T...........T.....T....T..TT...T.T..T.T.T.T...TTT.....T......T...T.......T.....TTTT.T.....T...TTo....TT.T.o...T.T.T......WW',
    'WW...o..T.o.T..T......T....T.....T........TT....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......................T................T.o......To.....T...T..WW',
    'WW...........T....o.T...............T......T....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.....................T..........T......T..T....T...T..........WW',
    'WW..................T.....................o.....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.......................T.....T.T.o.......T........T........T..WW',
    'WW....T....T....ToT................TT...........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................T.oT......T........TT......T......WW',
    'WW...T.....T..T.....T.o......T.........T......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.....T......TT...........T....TT....o...T...WW',
    'WW.......T............T.T........T....T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......T.............To.T.T...T....T.TT.....WW',
    'WW..............o....T...T......TT...T..oT....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......T...oo.......o.To....o............T..WW',
    'WW....T.T....T..T......T.........TT...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......TT....T.T........T............T......WW',
    'WW.......T......TT..T....TT...........T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..TT.........T.....T...T........T........T..WW',
    'WW......To.TT..T......T.To.T..........o.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.....T.....T...T...T...T....T......T....T...WW',
    'WW.....TTT..............oT.....TTTT.T.T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...........T....oT..T............To...T..T..WW',
    'WW..................T....T.T.T....T.TT..........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.....................T....T....T....T.T....T..............o...WW',
    'WW......oT.T.....T.TT...TT..oT......T..T..o.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ........TT........TTT....T..........T.....WW',
    'WW.......T.......TTT..........TT.T.TT......TQQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ....T.T..T........T.oT...........TT....T..WW',
    'WW...T......T.T.....................T....T.oQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT..T.....T....T..................T........WW',
    'WW..........T........o..T...TT.........T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o.......T...T.o...T.T....T........T......WW',
    'WW..T.....T....T.T.....T....T.......T..T....QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQTT....TT.......T..T....T........T.........WW',
    'WW.............T......T......T............TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.........T.........T..T.T..............T..WW',
    'WW...T.T...TT..T.....TT.....TT...T.T........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.....T.........TTT...............T...T..WW',
    'WW.............o..........................T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T...TTT.....TT.......T.....T.T.T.........WW',
    'WW....T...TT..T........T...TT...T....T...T.TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.T...............T....T.....T...T.......WW',
    'WW..T....T...............T............To....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.............o..T...T........T............WW',
    'WW...............T...TTT..............T.....QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ...TTT........T.T...........T....T........WW',
    'WW..T...............o......TT...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T..T..o...........TT.....ToTT......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQoQQQQ######QQQQoQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW..T...........TT.TT.T.....T##T..T.......T.T.......T...T..T...T.............######........T...o................................##.....................WWWWWWWWW',
    'WW..TT.....T.................##.......T...............T....T.................######.............................................##.....................WWWWWWWWW',
    'WW..T........TT..............##...T....T.....T...T..............T............######.....o......T................................##.....................WWWWWWWWW',
    'WW..T..TT..........T......T..##....T..T..T........TT.....T.T.T..T............######..TT..T....TTTT.FFFFFFFFFFFFFFFFFFFFFFFFFFFFF##FFFFFFFFFFFFFFFFFFFFFWWWWWWWWW',
    'WW...........................##...............##.............................######.......T...T....F....T.......................##................o....WWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T..........T...F..o...L.....................##........HHHHHHLHH...TWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######......T.........F...............T............##........HHHHHHHHH....WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQSQSQSQQQQQQQQQQQSQQ......######..TT.....T......F.T.T...............T........##........HHHHHHHHH....WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...............TF.T.T.....................T..##........HHHHHHHHH.T..WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######................F.........T.............T....##......o.HHHHHHHHH....WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######................F.T......o..............T....##T....................WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...T.....T...T.TF......................o.....##...T..o...T........T.WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.............o..F.....SS.............TT...T..##..............o..o...WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...T.......T.T..F.........o..T.....o.........##...........o..T....o.WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQSQQQSQQQQQQ......######................F........T...................##....T.o..............WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...oTT.T.....T..FFFFFFFF##FFFFFFFFFFFFFFF##FF##FFFFFFFFFFF##FFFFFFFFWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######....T...........FFFFFFFF##FFFFFFFFFFFFFFF##FF##FFFFFFFFFFF##FFFFFFFFWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..........o.....F............o.....T.........##...o....T..o..o......WWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T..............F....HHHHHHH.................##...S.................WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T.....o........F....HHHHHHH.....o....RRRR...##.....................WWWWWWWWW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQ......######.....T..T.......F....HHHHHHH...o.....RRRRRR..##.................T...WWWWWWWWW',
    'WW....T......................##...............##..QQSQQQQQQQQQQQQQQQQQQ......######........To......F..o.HHHHHHH...T....RRRRRRRR.##.T................T..WWWWWWWWW',
    'WW...T.......................###############################################.######..o.............F....HHHHHHH........RRRRRRRR.##............To.......WWWWWWWWW',
    'WW...........................###############################################.######................F.........T.........RRRRRRRR.##.....................WWWWWWWWW',
    'WW......T....................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ.....F....................RRRRRR.T##.....................WWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQLQQ######Q################...o.....T....T..o...RRRR...##.TT...T..o.o....o....WWWWWWWWW',
    'WW...T.......................##...............##..................QQQQQQQQQQQ######Q################.....o......SS..............##............T......o.WWWWWWWWW',
    'WW....T......................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ.....F...T......TTT...............##.............T......oWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQL.....FFFFFFFFFFFFFFFF##FFFFFFFFFFF##FFFFFFFFFFF##FFFFFFFFWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQQ.....FFFFFFFFFFFFFFFF##FFFFFFFFFFF##FFFFFFFFFFF##FFFFFFFFWWWWWWWWW',
    'WW...TT.T.QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQQQQQQQQQ.....F......L..............o.T.T..##.o............L......WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######................FT......................T....##..TT.................WWWWWWWWW',
    'WW......T.QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######................F...o..................TT....##...o.......o.........WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######................F.........T..o......TT......T##....T..T............TWWWWWWWWW',
    'WW....T...QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######................F..........................T.##........T.T.........TWWWWWWWWW',
    'WW....T...QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######................FT.......o........T......T...##.T....T......TT....T.WWWWWWWWW',
    'WW....T...QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######................FHHHHHH...........o..........##...T.o.....o.........WWWWWWWWW',
    'WW.....T..QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##CCCCCCC##CCCCCCCC............######................FHHHHHH......................##.......T....T.TT.....WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....###################............######................FHHHHHH....T............T....##..................oT.WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######................FHHHHHH....T...............TT##T..T.................WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######................FHHHHHH......................##......T..........oT..WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######................F................T...SS...T..##...T........T........WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######................F......................T.T...##.................T...WWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######................FFFFFFFFFFFFFFFFFFFFFFFFFFFFF##FFFFFFFFFFFFFFFFFFFFFWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW...........................##...............##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW...........................##..............................................######.............................................##.....................WWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######..............T..To...........................##...............##..........WW',
    'WW...........................##..............................................######.................o............................##...............##..........WW',
    'WW...........................##..............................................######.....................QQQQQQQQQ##QQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..........WW',
    'WW...........................##..............................................######...................T.QLQQQQQQQ##QQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..........WW',
    'WW..T.T.TT.T....TT.T..T.TT.T.##TT.T.TTTTT....................................######..................T..QQQQQQQQQ##QQQSQQQQQQQQQQ##QQQQQQQQQQ.....##..........WW',
    'WW..T..T.TT.##...T.T.T...T...##.TTTT...T.....................................######...................ToQQQQQQQQQ##QQQQQQQQQQQSQQ##QQQQQQQQQQ.....##..........WW',
    'WW..TTT....T##T...TTTT....T.T##....TTT....................................L..######..L...........o.o....QQQQQQSQQ##QQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..........WW',
    'WW...T...............TT.T..TT##..T....T.T....................................######.....................QQQQQQQQQ##QQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..........WW',
    'WW..T..T..........T.TTT..TTT.##...T.TTT.T....................................######.................T..TQQQQQQQQQ##QQQQQQQQQQQQQQ#####S#############..........WW',
    'WW...TT...........T...T.T....##.TTT..T.TT....................................######....................oQQQQQQQQQ##QQQQQQQQQQQQQQQ##################..........WW',
    'WW....TT...........TT.T.TTT..##.T..T....T....................................######................T....QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW......T.........TT...T..T..##..T...TTT.....................................######..................T..QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW..T.TT...........TT.TT..T..##.TT..TT.......................................######.....................QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW..T...T........T..TT.TT.T..##TTT....TTT....................................######.....................QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW..TT.TTTT.##.TT.TTTT....TT...TTT..T.T.T.................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW...T..TT.T##..T...TTTT..T..T...TT..TT...................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..QQQQQQQQQ##QQQQQQQQQQQQQQQSQQQQQQQQQQ.....##..........WW',
    'WW..T.TTT...##T....TTT.T..TT...T..T.TT.TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ##QQQQQQQQS##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW..##########################..T.TTTT.T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW..##########################...TT....T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW...T....TT.T..TTTTT..TT.T......T..TTTTT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..QLQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQLQ.....##..........WW',
    'WW..TTT..TT.TTTTTTTT.TT....TTT############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..QQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQQQQQQ.....##..........WW',
    'WW.....T.T.....T..T....TT..T..############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW....T...T...T.....TTTTTTTT.TT...T.TT......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...........................................WW',
    'WW..TT..TT...TT.T...TRRR...TTTTT.T..TTTTT...##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ..FFFFF##FF##FF.....................FFFFF##FFFFFF.......WW',
    'WW..T.....TT.TTTTTT.TRRR.T.TT..T........T...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..F........##.F.....L...........L...F...........F.......WW',
    'WW............TT.T..RRRRRT....T..T..TTTTT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..F........#T.F.......HHHHHHHHH.....F.T.........F.......WW',
    'WW....TT.T.T.TTT....RRRRR.....T.....T..TT...CCCCCC##CCCC##..................Q######Q....................F........##.F.......HHHHHHHHH.....F...........F.......WW',
    'WW..T.....TTTTTTTT..TRRR.TT.....TTTTT.......CCCCCC##CCCC##................L.Q######Q.L..................F........##.F.......HHHHHHHHH.....F...........F.......WW',
    'WW..TTT.T.TT..TTTT.T.RRR.TTTTT....TT.TT.T...CCCCCC##CCCC##..................Q######Q....................F........##.F.......HHHHHHHHH.....F...........F.......WW',
    'WW..TT.TT.TT.#######.....#################################..................Q######Q....................F..S........F.......HHHHHHHHH.....F........S..F.......WW',
    'WW.....T.....#######TT.T.################################C.........HHHHHHHHHQ######QHHHHHHHHH...........F...........F.....................F...........F.......WW',
    'WW..TT...T.TTT.TTT.TTTTTTTTT..TT..T.TTTT...........................HHHHHHHHHQ######QHHHHHHHHH...........FFFFFFFFFFFFF.....................FFFFFFFFFFFFF.......WW',
    'WW..TT...T.T....TT..T..T.T...T..T.TTTTTTT..........................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 74, ty: 67, name: 'Xuống Chân Núi Vạn Thú Môn' },
    { x: 78, y: 139, to: 'map3', tx: 74, ty: 67, name: 'Xuống Chân Núi Vạn Thú Môn' },
    { x: 79, y: 139, to: 'map3', tx: 74, ty: 67, name: 'Xuống Chân Núi Vạn Thú Môn' },
    { x: 80, y: 139, to: 'map3', tx: 74, ty: 67, name: 'Xuống Chân Núi Vạn Thú Môn' },
    { x: 81, y: 139, to: 'map3', tx: 74, ty: 67, name: 'Xuống Chân Núi Vạn Thú Môn' },
    { x: 82, y: 139, to: 'map3', tx: 74, ty: 67, name: 'Xuống Chân Núi Vạn Thú Môn' },
  ],
  npcs: [
    { id: 'giang_tieu_thu', x: 80, y: 20, sprite: 'sect_master_van_thu' },
    { id: 'chap_su_vt', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'quan_thu_vien', x: 102, y: 96, sprite: 'dai_phu' },
    { id: 'thuan_thu_su', x: 122, y: 113, sprite: 'tho_san_ha' },
    { id: 'de_tu_chan_thu', x: 140, y: 134, sprite: 'de_tu_phai' },
  ],
  zones: [
    { id: 'tang_thuong_vt', name: 'Tầng Thượng Sơn Môn', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_vt', name: 'Khu Đệ Tử Vạn Thú', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'thu_vien', name: 'Thú Viên Vạn Thú', rects: [[96, 54, 157, 100]], types: [] },
    { id: 'rung_tha_thu', name: 'Rừng Thả Thú', rects: [[2, 104, 72, 137]], types: [] },
    { id: 'bai_thuan_thu', name: 'Bãi Thuần Thú', rects: [[96, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 13, y: 113, item: 'linh_chi' },
    { x: 15, y: 116, item: 'linh_chi' },
    { x: 46, y: 122, item: 'linh_chi' },
    { x: 54, y: 126, item: 'linh_chi' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 146, y: 66, item: 'linh_chi' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Vạn Thú Môn' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 49, y: 68, label: 'Sân Luyện Công' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 96, y: 77, label: 'Thú Viên' },
    { sprite: 'sign', x: 107, y: 108, label: 'Bãi Thuần Thú' },
    { sprite: 'sign', x: 122, y: 127, label: 'Khu Ấp Trứng' },
    { sprite: 'sign', x: 17, y: 120, label: 'Rừng Thả Thú' },
    { sprite: 'sign', x: 115, y: 71, label: 'Hồ Tắm Thú' },
    { sprite: 'sign', x: 19, y: 39, label: 'Linh Tuyền' },
    { sprite: 'sign', x: 124, y: 40, label: 'Vọng Thú Đài' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Vạn Thú' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Thú Các' },
    { sprite: 'sign', x: 100, y: 19, label: 'Nghị Sự Đường' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN THIÊN PHÙ CÁC — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá/lư hương/bia phù
// (chặn), "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED maps.js.
// ================================================================
var SONMON_THIENPHU = {
  id: 'sonmon_thienphu',
  name: 'Sơn Môn Thiên Phù Các',
  sect: 'thien_phu',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-thienphu-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...............TT........T...TT.........T.TTT.TT.....T......TTTT.T..T.....TT....T.T......T...T.....T..T....TT.T....TT......T..................T..........T..WW',
    'WW........TT......T..........T.TT........T..T.....T..T......T....T...T..TT..........TTT.......T.TT....T....T....T.T.....T....T.T.TT..........T.TT..T...T..T...WW',
    'WW...To.T.T...T..T.T...TT...T....T.....T.T..T..................T..........T.T.....T.......T..T......T.......TTT..........T...T.T...TT.TT.....T.T.TTT...T......WW',
    'WW..TT.......T...T....T....T.....o..T.o.T..TT.....T....T..TT...T.T..T.T.T.T...TTT.....T......T...T.......T.....T.T.....TTo...T.T...oT.T....TT.T...T..T........WW',
    'WW........T....T.....T........TT.........T......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH...........................T.o......To.....T...T.T............WW',
    'WW....o.T...............T......T................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................T......T..T....T...T...........T.....T.T..WW',
    'WW......T.....................o...T....T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.....................o.......T........T........T........T.oT..WW',
    'WW..ToT................TT........T.....T..T.....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..........................T........TT......T.......T......TT..WW',
    'WW......T.o......T.........T.........T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.............T....TT....o...T......T........WW',
    'WW........T.T........T....T...................HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.........To.T.T...T....T.TT........T...oo...WW',
    'WW..o....T...T......TT...T..oT....T.T....T....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH........o.To....o............T.....TT....T..WW',
    'WW..T......T.........TT..............T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T........T............T....TT.........T..WW',
    'WW..TT..T....TT...........T.........To.TT..T..HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......T...T........T........T...T.....T....WW',
    'WW........T.To.T..........o........TTT........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T...T...T....T......T....T..........T....WW',
    'WW..........oT.....TTTT.T.T...................HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH....oT..T............To...T..T.T....T....T..WW',
    'WW......T....T.T.T....T.TT..........oT.T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH........................T.T....T..............o.........TT....WW',
    'WW...T.TT...TT..oT......T..T..o......T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ......TTT....T..........T.......T.T..T....WW',
    'WW...TTT..........TT.T.TT......T.T......T.T.QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ......T.oT...........TT....TT..T.....T....WW',
    'WW......................T....T.o........T...QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T..................T.......o.......T....WW',
    'WW.......o..T...TT.........T....T.....T....TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.o...T.T....T........T....TT....TT......WW',
    'WW...T.....T....T.......T..T...............TQQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ...T..T....T........T................T....WW',
    'WW........T......T............TT.T.T...TT..TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T..T.T..............T.T.....T......WW',
    'WW.......TT.....TT...T.T...................oQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....TTT...............T...T.T...TTT......WW',
    'WW............................T...T...TT..T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.TT.......T.....T.T.T........T.T..........WW',
    'WW.........T...TT...T....T...T.TT....T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T....T.....T...T...................WW',
    'WW...........T............To................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o..T...T........T.............TTT........WW',
    'WW...T...TTT..............T.....T...........QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ..T.T...........T....T.............T..T...WW',
    'WW......o......TT...........................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o...........TT.....ToTT.....T...T........WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........o.................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW..................o........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQoQQQQ######QQQQoQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW.......TT.TT.T.....TT..T...##....T.T.......T...T..T...T.TT.................######.............T...T.......T.......T......T......T....TT..T....TTTT...WWWWWWWWW',
    'WW..T........................##T...............T....T.....T..................######......T..........T...T....T..........T........T.....T....TT.....T...WWWWWWWWW',
    'WW....TT.................T...##.T.....T...T..............TT..TT..............######....................................................................WWWWWWWWW',
    'WW..........T......T......T..##T..T........TT.....T.T.T..T...T...............######....................................................................WWWWWWWWW',
    'WW...........................##...............##.............................######...T.....T.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T.T.............QLQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQLQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.........T.......QQQQSQQQQQQQSQQQQQQQQQQQQQQQ##QQQQQQSQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQSQQQSQQQSQQQSQQQSQQ......######.....T.T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQQQQSQQQQQQQ##QQQQQQQQQQQQQQSQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######....TT.T.........QQQQQQQQSQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQSQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T.....T.........QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQSQQQQQQQQQQQQQQQSQQQQQQQ##QQQQQQQQQQQQQQSQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..........T......QQQQQQQQQQQQSQQQQQQQQQQQQQQQ##QQQQQQSQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQSQQQQQQQSQQQQQQQSQQ......######.T...............QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######........T..T.....WWWWWWW##WWWWWWWWWWWWWWW##WW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................WWWWWWW##WWWWWWWWWWWWWWW##WW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..T..............QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQHHHHHHHHHHQQQQQQQQQQQQQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQ......######.....T..T........QQQQHHHHHHHHHHQQQSQQQSQQQQQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW.....T.....................##...............##..QQSQQQSQQQSQQQSQQQSQQ......######.................QQQQHHHHHHHHHHQQQQQQQQQQQQQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW...........................###############################################.######.################QQQQHHHHHHHHHHQQQQQQQQQQQQQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW...........................###############################################.######.################QQQQHHHHHHHHHHQQQQQQQQQQQQQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQHHHHHHHHHHQQQQQQQQQQQQQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQLQQ######QQQQQHHHHHH......QQQQHHHHHHHHHHQQQSQQQQQQQSQQ##QQQQQQHHHHHHHHHHQQQQQWWWWWWWWW',
    'WW..T........................##...............##..................QQQQQQQQQQQ######QQQQQHHHHHH......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQHHHHHH......QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQHHHHHH......WWWWWWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQHHHHHH......WWWWWWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWW##WWWWWWWWWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQQQQQQQQQ.L....QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQo#QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.......TQQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQoQQQQQQQQ##QQQQQQQoQQQQQQQQQQQQQWWWWWWWWW',
    'WW......T.QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQSQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQSQQQQWWWWWWWWW',
    'WW..TT....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW.......TQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....###################............######.................QQQQQQQQQQSQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQSQQQQWWWWWWWWW',
    'WW..T.....QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQoQQQQQQQQ##QQQQQQQoQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QLQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQLQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW..T.....QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW..T.....QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW...........................##...............##CCCCCCC##CCCCCCCC............######.............................................##.....................WWWWWWWWW',
    'WW......TT...................##..............................................######.............................................##.....................WWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######......................T......T.T..T.........T.##.....T.......o.##..........WW',
    'WW...........................##..............................................######.............T.......................T....T...##............TT.##.o........WW',
    'WW...........................##..............................................######..............................##.........T.T..##T...........QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######..............T.......T.o.TTT.##..............##T.T.........QQQ##HHHHQ.....WW',
    'WW..T.T.TT.T....TT.T..T.TT.T.##TT.T.TTTTT....................................######..................T....T..oo.T##...T..........##.T..........QQQ##HHHHQ.....WW',
    'WW..T..T.TT.##...T.T.T...T...##.TTTT...T.....................................######......................T.L.T...##.......T..L...##.....T......QQQ##HHHHQ.....WW',
    'WW..TTT....T##T...TTTT....T.T##....TTT....................................L..######..L..................T..oCCCCC####CCCCCCCC...T##............QQQ##QQQQQ.....WW',
    'WW...T...............TT.T..TT##..T....T.T....................................######.......................T.CCCCC####CCCCCCCCo..T##............QQQ##QQQQQ.....WW',
    'WW..T..T..........T.TTT..TTT.##...T.TTT.T....................................######...............T.........CCCCC####CCCCCCCC....###################..........WW',
    'WW...TT...........T...T.T....##.TTT..T.TT....................................######.............T.T.........CCCCC####CCCCCCCC.....##################..........WW',
    'WW....TT...........TT.T.TTT..##.T..T....T....................................######.............To.........TCCCCC####CCCCCCCC........T.RRRRRRR.T..##.TT.......WW',
    'WW......T.........TT...T..T..##..T...TTT.....................................######....................T....CCCCC####CCCCCCCC.T........RRRRRRR....##..........WW',
    'WW..T.TT...........TT.TT..T..##.TT..TT.......................................######...............T....T..TT#################...T....RRRRRRRRRRRTo##..........WW',
    'WW..T...T........T..TT.TT.T..##TTT....TTT....................................######...............T......TT.CCCCC####CCCCCCCC.T..T..RRRRRRRRRRRRR.##..........WW',
    'WW..TT.TTTT.##.TT.TTTT....TT...TTT..T.T.T.................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ....T.CCCCC####CCCCCCCCT..T...RRRRRRRRRRRRR.##.T........WW',
    'WW...T..TT.T##..T...TTTT..T..T...TT..TT...................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ......CCCCC####CCCCCCCC.......RRRRRRRRRRRRR.##.o........WW',
    'WW..T.TTT...##T....TTT.T..TT...T..T.TT.TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..T..TCCCCC####CCCCCCCCT#########################.......WW',
    'WW..##########################..T.TTTT.T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...T..CCCCC####CCCCCCCC.#########################.......WW',
    'WW..##########################...TT....T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ......CCCCC####CCCCCCCCT......RRRRRRRRRRRRR.##...T......WW',
    'WW...T....TT.T..TTTTT..TT.T......T..TTTTT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..T.T............RRRRRRRRRRRRR.##....o.....WW',
    'WW..TTT..TT.TTTTTTTT.TT....TTT############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...T......T##.T...T..T........RRRRRRRRRRRRR.##T.........WW',
    'WW.....T.......T..T....TT..T..############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..TT.T..TT.##.................RRRRRRRRRRRRR.##...o......WW',
    'WW....T.T.T...TT....TTTTTTTT.TT...T.TT......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..................RRRRRRRRRRR..##..TT......WW',
    'WW..TT..T....TT.T.......TTTTT.T..TTTTTT.....##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...........##......T...o.............T...T..##..........WW',
    'WW.....TT.TTTTT..T.T.TTT.T....T...T.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ.......T...##....T.....T.T..T......T........##..........WW',
    'WW......TT.TTTT....T.....T.TTT..T..T.T.TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ.....T.....##......................TT.......##..........WW',
    'WW..T...T.....T.....T..TTT.....TTTTTTTTT....CCCCCC##CCCC##..................Q######Q....................T...T.o..##...............................##..........WW',
    'WW..T.T......TTTTT....TT..T.TT..TTT..T..T...CCCCCC##CCCC##................L.Q######Q.L..................T........##...T.................T......T..##...T......WW',
    'WW..TTTT....TT.TT.TTT.TT.TT.........T.......CCCCCC##CCCC##..................Q######Q.....................T.T..T..##..T..TT...T..T.T....T..T......T##..........WW',
    'WW...TT.T.T..#############################################..................Q######Q........................o...............T......T.oo...T....T..##....T.....WW',
    'WW......TTT.T############################################C.........HHHHHHHHHQ######QHHHHHHHHH...........TT.T..........................T......T....##..........WW',
    'WW..TT.TTTTTTTTT..TT..T.TTTT.TT...T.T..............................HHHHHHHHHQ######QHHHHHHHHH......................T.T.T...T..................T...##..........WW',
    'WW..TT..T..T.T...T..T.TTTTTTTT......TT.............................HHHHHHHHHQ######QHHHHHHHHH.........................T..o...TT...................##.T........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 63, ty: 67, name: 'Xuống Chân Núi Thiên Phù Các' },
    { x: 78, y: 139, to: 'map3', tx: 63, ty: 67, name: 'Xuống Chân Núi Thiên Phù Các' },
    { x: 79, y: 139, to: 'map3', tx: 63, ty: 67, name: 'Xuống Chân Núi Thiên Phù Các' },
    { x: 80, y: 139, to: 'map3', tx: 63, ty: 67, name: 'Xuống Chân Núi Thiên Phù Các' },
    { x: 81, y: 139, to: 'map3', tx: 63, ty: 67, name: 'Xuống Chân Núi Thiên Phù Các' },
    { x: 82, y: 139, to: 'map3', tx: 63, ty: 67, name: 'Xuống Chân Núi Thiên Phù Các' },
  ],
  npcs: [
    { id: 'diep_phu_sinh', x: 80, y: 20, sprite: 'sect_master_thien_phu' },
    { id: 'chap_su_tpc', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'quan_dan_tpc', x: 128, y: 91, sprite: 'de_tu_phai' },
    { id: 'che_phu_tpc', x: 125, y: 76, sprite: 'dai_phu' },
    { id: 'de_tu_vuon_tpc', x: 13, y: 114, sprite: 'de_tu_phai' },
  ],
  zones: [
    { id: 'tang_thuong_thien_phu', name: 'Tầng Thượng Thiên Phù', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_thien_phu', name: 'Khu Đệ Tử Thiên Phù', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'phu_dan', name: 'Phù Đàn Thiên Phù', rects: [[98, 56, 152, 98]], types: [] },
    { id: 'chan_nui_thien_phu', name: 'Chân Núi Thiên Phù', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 13, y: 113, item: 'linh_chi' },
    { x: 15, y: 116, item: 'linh_chi' },
    { x: 46, y: 122, item: 'thanh_tam_thao' },
    { x: 54, y: 126, item: 'thanh_tam_thao' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 130, y: 95, item: 'thanh_tam_thao' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Thiên Phù Các' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 49, y: 68, label: 'Diễn Phù Trường' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 101, y: 75, label: 'Phù Đàn' },
    { sprite: 'sign', x: 112, y: 85, label: 'Đàn Thiên Phù' },
    { sprite: 'sign', x: 125, y: 72, label: 'Xưởng Chế Phù' },
    { sprite: 'sign', x: 94, y: 81, label: 'Tháp Treo Bùa' },
    { sprite: 'sign', x: 19, y: 39, label: 'Tẩy Bút Trì' },
    { sprite: 'sign', x: 124, y: 40, label: 'Vọng Vân Đài' },
    { sprite: 'sign', x: 17, y: 120, label: 'Trúc Lâm Giấy' },
    { sprite: 'sign', x: 106, y: 113, label: 'Vườn Chu Sa' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Thiên Phù' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Phù Các' },
    { sprite: 'sign', x: 100, y: 19, label: 'Nghị Sự Đường' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN CỬU CUNG TRẬN TÔNG — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá/trận thạch (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_CUUCUNG = {
  id: 'sonmon_cuucung',
  name: 'Sơn Môn Cửu Cung Trận Tông',
  sect: 'cuu_cung',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-cuucung-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW..........TT.................T...TTT..............T.....T...............T......TT.....T................................T......T........T.TTT............TT..WW',
    'WW.......T...T.......T......T................T.T......TT.....T...T.T..........T......T..T....T...T...........T...T.T.T.T.......T........T........T........T...WW',
    'WW..TT.....T.T...T.....TTT......TT.TT.T...T.T......TT...........T..T.TT....T.T.T.....TT.............TT.T.T...T....TTTT........T..TTT.....T.T.TT....T..........WW',
    'WW...T...T....T.TT...TTT.oT...T.T.T.T......T.....T....TT.........T.....T..TTT.......T........T...T.....T...T...T...T....T......T..T.TT.........T....TT..T.....WW',
    'WW....TT....T....T..............................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..............................................................WW',
    'WW.....T........ToT.............................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..............................................................WW',
    'WW..T........T...T.oo..T...........T..T...TT....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW.....T..T......T..........T...T...T..T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW........o......T........T......T............HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW..T..T.......T..T...........TT.T.o..T..T....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW....TTT....T..o..oTT...T.....T....T......T..HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW..............T.T....T..........TT....T.....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW........T........TTT....T.....T.......T.....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW............................T......T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH............................HHHHHHHHHHHHHHHHHH................WW',
    'WW.............TTT.T............T.............HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.....T............T....TT..o........T.........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..........TT........T..........T....T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..........T.....T...T.......T.T....o...T.TQQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW............................TT......o.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW......T...T.o.T.T.....T...........T.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.....T.T...o......T.......T.T......T......QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.....T.........T.......TT.TTT.T...........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........T...TT.........T.T.T.......T..TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.....T...........T..........T....T...T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ.......WW',
    'WW.................T....To.......T........T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.....T....T..........TT................T..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..........o..T.o.T..T......T....T.....T...QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ..........................................WW',
    'WW.......TT.........T....o.T...............TQQQQQQQQQQQQQQQQQQQQQQLQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..........................................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQL#########LQQQQQQQQQQQQQQQQQQQQQQ..............T......##.........o.T...............WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQQQQ#QQ#QQ######QQQ#QQ#QLQQQQQQQQQQQQQLQQ....................T##....T....T.T...............WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQ##QQQ######QQQQ##QQQQQQQQQQQQQQQQQQQ...........TT........##T.....T..T.....T........o..WW',
    'WW..................o........##.....................QQQQQQQQQQQQQQQQQQQQ##QQQ######QQQQ##QQQQQQQQQQQQQQQQQQQo................T...##......o............o.T.....WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQ#QQ#Q#########Q#QQ#QQQQQQQQQQQQQQQQQQ.............T.L...T.##..................L...T....WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQLQQQQ#Q######QQ#QQQQLQQQQQQQQQQQQQQQQQ.........T......To...##T...T....T.T....T..T.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQ#QoQ#Q#######Q#Q#oQQ#QQQQQQQQQQQQQQQQQ.........o.........TT##..............T......TT....WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQ#QQQ#QQ#######QQ#QQQ#QQQQQQQQQQQQQQQQQ........T....oT......##.....T.........T..TT..T....WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQ#QQ#QQQ######QQQQ#QQ#QQQQQQQQQQQQQQQQQ............T.T..T...##................TTT........WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQ#QQ#QQQ######QQQQ#QQ#QQQQQQQQQQQQQQQQQ.................T...##..TTTT.T.o.................WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQ##########o##########QQQQQQQQQQQQQQQQQ..............T....T.##T.T....T.To...........T.T..WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQ#QQ#QQQ######QQQQ#QQ#QQQQQQQQQQQQQQQQQ.............o.TT...T##T...T......T..T.........T..WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQ#QQ#QQQ######QQQQ#QQ#QQQQQQQQQQQQQQQQQ...............TTT...##.......TT.T.TT......T.T....WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQ#QQQ#QQ#######oQ#QQQ#QQQQQQQQQQQQQQQQQ............T.T......##...............T....T......WW',
    'WW.......RRRRRRRRR...........##.....................oQQQQQQQQQQQQQQQQQ#QQQ#o#######Q#Q#QQQ#QQQQQQQQQQQQQQQQQ..............oL.....##......T...oT......L...T....WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQLQQQQ#Q######QQ#QQQQLQQQQQQQQQQQQQQQQQ..........T.....T....##o.T.....o....T.......o..T..WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQ#QQ#Q#########Q#QQ#QQQQQQQQQQQQQQQQQQ.....................##..o......T....o.T..........WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQ##QQQ######QQQQ##QQQQQQQQQQQQQQQQQQQ............oT.T.T...##TT..T.....TT.....TT...T.T..WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQ##QQQ######QQQQ##QQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQ#QQ#QQ######QQQ#QQ#QQQQQQQQQQQQQQQQQQ................T...T##...TT..T........T...TT.....WW',
    'WW...........................##............................................L#########L..............................T....T...T.To##....T...............T......WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........TT...T..TTT....T##....T....TTT....T..............T..............######.............T...............................##............................WW',
    'WW.........TT......T.TTT....T##..........T.......T.T..T........T.............######....T.......T.T..............................##............................WW',
    'WW..TT...........TT....TT..T.##....T....T...........T......T.................######..T..T.T.....................................##............................WW',
    'WW....T.T.....T...T.T...T.T..##..T........T....TT....TT.......T..............######..........T.T..T.............................##............................WW',
    'WW...........................##...............##.............................######......T..........oooooooooooooooooooooooooooo.oooooooooooooooooooooo.......WW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....TT..........o.o...........o.......o.......o.........o.......o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######..........T......o.o.ooooooooo.o.ooooo.ooooo.o.ooooooo.o.o.ooooo.o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QSQQQQ#QQQQQQQ#QQQQSQ......######....T...TT.......o...o...o...o...o...o.......o.......o.o.o.....o...o.......WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######....TT...........ooooo.ooo.o.ooooo.o.ooooooooooooooo.o.o.o.ooo.ooo.o.......WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######.T.........T.....o.......o.o.....o.o...o...........o...o.o...o.o...o.......WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..Q###################Q......######..........T......o.ooooo.o.ooo.o.o.ooooo.o.ooooooooooooo.o.ooo.o.ooo.......WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######.................o.o...o...o.o.o...o.....o.........o.....o.o...o...o.......WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######..T..............o.o.o.ooooo.o.ooooo.ooooooooooooo.o.ooooo.o.ooooo.o.......WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######.T...T...........o.o.o.o.....o.....o.o.o.....o.....o.....o.o.o...o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQSQQQ#QQQoQQQ#QQQQQQ......######.................o.o.o.ooooo.ooooo.o.o.o.ooo.o.ooooooooo.ooo.o.o.o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######...T.............o...o.....o.o.....o.o.....o.o.........o...o.o.o.o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######....T............ooooooooo.o.o.ooo.o.ooooo.o.ooooooooo.ooo.o.o.o.o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######......TT.........o.....o...o.o...o.o.....o.o.........o.....o...o.o.o.......WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..Q###################Q......######.....T...........o.ooooo.ooo.ooo.ooooooo.o.ooooooo.o.ooooooooooo.o.o.......WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQ#QQQQQQQ#QQQQQQ......######............T....o.....o.o...o...o.......o.o.o...o.o...o.........o.o.......WW',
    'WW...........................##...............##..QQQQQQ#QQQQQQQ#QQQQQQ......######.................o.ooo.o.o.ooo.o.o.ooooooo.o.o.o.ooo.o.o.o.ooooooo.o.......WW',
    'WW...........................##...............##..QSQQQQ#QQQQQQQ#QQQQSQ......######.....T...........o...o.....o...o.o.o.........o.o...o.o.o.o.........o.......WW',
    'WW...........................###############################################.######...............L.ooo.ooooooo.ooooo.ooooo.ooooo.ooo.o.o.ooo........oo.......WW',
    'WW...........................###############################################.######...T.TT.....T....o...o.......o...o.....o.o.....o.o...o.............o.......WW',
    'WW.......T...................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......ooooo.ooooooo.o.ooooo.ooo.ooooo.oooooooooo........o.......WW',
    'WW...........................##...............##..................QQQQQQQQLQQ######Q################....o.o.......o...o.o.....o.....o.....o......o....o.......WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######Q################o.o.o.o.ooooooo.o.o.ooooooo.ooo.ooo.ooo.oo........o.......WW',
    'WW....T......................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......o.o.o.o.o...o...o.o.......o...o...o.o...o.........o.......WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQL....L.o.o.o.o.o.ooo.ooo.o.o.ooooo.o.ooo.o.o.ooo........oo.......WW',
    'WW.....TT....................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQQ......o.o...o.o...o...o...o.o...o.o...o...o...o.........o.......WW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQQQQQQQQQ......o.ooo.o.ooo.ooo.ooooooo.o.o.ooo.ooo.ooo.o.o.o.ooo.o.......WW',
    'WW...T....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######.................o...o.o.....o.o.....o...o.o.o.o.o...o...o.o...o...o.......WW',
    'WW.....T..QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................o.o.ooooooo.o.ooooo.o.ooo.o.o.o.ooo.o.ooo.ooooo.ooo.......WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................o.o.o.......o...o...o...o.....o...o.o.o...o.....o.o.......WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................ooo.o.ooooooooo.o.ooooo.ooooooooo.o.o.ooo.ooooo.o.o.......WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................o...o.o.......o.o.........o.......o.o...o.o...o...o.......WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................o.ooo.o.o.ooo.o.ooooooooooo.ooooooooooo.o.o.o.ooo.o.......WW',
    'WW.......TQQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##CCCCCCC##CCCCCCCC............######.................o...o.o.o...o.o.......o.....o...o.......o...o...o.o.......WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....###################............######.................o.o.o.o.ooo.o.ooooo.o.o.ooooo.o.o.ooooooo.ooooo.o.o.......WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................o.o.o.o.o...o...o...o.o.....o.o.o.o...o...o.....o.o.......WW',
    'WW...T..T.QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................o.o.o.ooo.ooooo.o.ooo.ooooo.o.o.o.o.o.ooooo.ooooo.o.......WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................o.o.......o.......o.......o.........o.......o.....o.......WW',
    'WW.......TQQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................oooooooooooooooooooooooooooo.oooooooooooooooooooooo.......WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######...........................................................................WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............##########################################################################.......WW',
    'WW...........................##...............##CCCCCCC##CCCCCCCC............######.............................................####..........................WW',
    'WW...........................##..............................................######.............................................####..........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######................T.............................##...............##..........WW',
    'WW...........................##..............................................######..............................................##...............##..........WW',
    'WW...........................##..............................................######..............................##..............##............QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######.............T................##..............##............QQQ##HHHHQ.....WW',
    'WW...TT.TT....o.TT.To.o.T....##o.o...T.TT....................................######...............T..T...........##..............##............QQQ##HHHHQ.....WW',
    'WW...o......##T.oT.....T..T..##....T.T.oT....................................######..............................##..............##............QQQ##HHHHQ.....WW',
    'WW.....T.oTT##...oo...oTTTToo##..o..T.TT..................................L..######..L...........................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW..o..To..........T.ToT...T.##...T.T.TT.....................................######.....................o..T.....##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW..o.o..........TTo.TT..T..T##..oT.T..o.....................................######..............................##........RRRRRR###################..........WW',
    'WW..oToTo.........oo...o..T.T##..To.....o....................................######..............................##...RRRRRRRRRRRR##################..........WW',
    'WW...oTo.........T...oTo..T.T##.TTToT.T.T....................................######.............T......o.........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...ToTo............T...o...##TTTToo........................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..o.oT.........TTT.To....T.##.ooTT.ooo.....................................######......................T.......##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..o............o.......T...##.oTT....To....................................######.....................T........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..o..oTo.o##.T..TT.T.ToT..T.T.ToT...TTT.................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.......T.o##.oT.T...T.oT.oo.T.....T.T...................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.....T..oT##....ToTo...T.T..o..T.T........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################oo..TToTToT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################....TTTTTT....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW........T.T..o.o..To.oT.TToo.T.TT..o.oT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....o.........ooo....oo..oT.############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...T........o..oToT..T.....T############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...o..oo..TT..oToTTo.......T.T.To.T..o....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...T...ToT...oTTTTTTooTT..TT.T..ooTo..T...##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...........##...RRRRRRRRRRRRRRRRRRRRRRR.....##..........WW',
    'WW..o..o..T..o.oTToTTTTT...oT...TT..o..T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW..T.T..T..oTo.TTooTTT....oTT.o.o..oT..o...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW...oTTooT...T...TTTTTTo.ooTTTT....T..T....CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW..TTT....TTo.....oo.To..ToT..T.T...To.....CCCCCC##CCCC##................L.Q######Q.L...........................##...............................##..........WW',
    'WW...TT....TT...T.T.T.....o.o.oToTTo.T.o....CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW....oo.o.o.#############################################..................Q######Q..............................................................##..........WW',
    'WW..oo.o.....############################################C.........HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW...o..o.oT.o..TTTT.T.T..o.To..oT..TTo............................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW..To......T.T...T............T..TTT.TT...........................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 80, ty: 66, name: 'Xuống Chân Núi Cửu Cung Trận Tông' },
    { x: 78, y: 139, to: 'map3', tx: 80, ty: 66, name: 'Xuống Chân Núi Cửu Cung Trận Tông' },
    { x: 79, y: 139, to: 'map3', tx: 80, ty: 66, name: 'Xuống Chân Núi Cửu Cung Trận Tông' },
    { x: 80, y: 139, to: 'map3', tx: 80, ty: 66, name: 'Xuống Chân Núi Cửu Cung Trận Tông' },
    { x: 81, y: 139, to: 'map3', tx: 80, ty: 66, name: 'Xuống Chân Núi Cửu Cung Trận Tông' },
    { x: 82, y: 139, to: 'map3', tx: 80, ty: 66, name: 'Xuống Chân Núi Cửu Cung Trận Tông' },
  ],
  npcs: [
    { id: 'au_duong_ky', x: 80, y: 20, sprite: 'sect_master_cuu_cung' },
    { id: 'bach_ky_sinh', x: 85, y: 35, sprite: 'de_tu_phai' },
    { id: 'chap_su_cc', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'quan_tran_cc', x: 134, y: 22, sprite: 'de_tu_phai' },
    { id: 'thu_cac_cc', x: 51, y: 17, sprite: 'dai_phu' },
    { id: 'de_tu_cc', x: 98, y: 79, sprite: 'de_tu_phai' },
  ],
  zones: [
    { id: 'tang_thuong_son_mon', name: 'Tầng Thượng Sơn Môn', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu', name: 'Khu Đệ Tử Cửu Cung', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'luyen_tran', name: 'Khu Luyện Trận', rects: [[98, 56, 152, 98]], types: [] },
    { id: 'chan_nui_son_mon', name: 'Chân Núi Sơn Môn', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 13, y: 113, item: 'linh_chi' },
    { x: 15, y: 116, item: 'linh_chi' },
    { x: 46, y: 122, item: 'linh_chi' },
    { x: 54, y: 126, item: 'linh_chi' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 146, y: 77, item: 'linh_chi' },
    { x: 130, y: 95, item: 'linh_chi' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Cửu Cung Trận Tông' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Cửu Cung' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Trận Các' },
    { sprite: 'sign', x: 120, y: 19, label: 'Tháp Quan Trận' },
    { sprite: 'sign', x: 68, y: 31, label: 'Đại Trận Đồ Cửu Cung' },
    { sprite: 'sign', x: 49, y: 68, label: 'Bãi Luyện Trận' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 97, y: 77, label: 'Thạch Trận Mê Cung' },
    { sprite: 'sign', x: 19, y: 39, label: 'Trận Nhãn Tuyền' },
    { sprite: 'sign', x: 115, y: 119, label: 'Hồ Trận Nhãn' },
    { sprite: 'sign', x: 17, y: 120, label: 'Trận Thạch Lâm' },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN KIM CANG MÔN — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" cọc/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá/tạ đá (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_KIMCANG = {
  id: 'sonmon_kimcang',
  name: 'Sơn Môn Kim Cang Môn',
  sect: 'kim_cang',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-kimcang-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW..T....T.....T..TT...........T......T..T...T........T.............TTT........T.T...........T...TT.............T..T..T........T..TT.....TTTT.T...T...T.......WW',
    'WW................TT........T...TT.......T.T.TTT.TT.....T......TTTT.T..T.....TT....T.T..........T.....T..T....TT.T....TT......T..................T............WW',
    'WW..TT.....T.TT......TT........T..T.TT.TT.TT......T..T.....T..T......T.T..T...T..TT..........TTT.......T.TT....T....T...TT..TT.T..T...TTTT....TT.T.TT.........WW',
    'WW..T.T..T.TT..T...T..T...TT.T.TT....T.T..T.T............T.T..T..................T............T.....T.......T..T......TT.......TTT.To.........T...T...T.TTTT..WW',
    'WW..T.T.......T..T...T...........T..............................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................T..............T.....T...............o....WW',
    'WW..T....T...T...................T....To........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH........................TT....................................WW',
    'WW.....T........T....T....T..........TT.........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH........................T......T........T.TTT............To...WW',
    'WW.............T..........o..T.o.T..T......T....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH........................T...o.......T......T..................WW',
    'WW......T.....T........TT.........T....o.T....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..T.o......To.....T...T.T..........T........WW',
    'WW...............T......T................T....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..T..T....T...T...........T.....T.T.o.......WW',
    'WW.....................o...T....T....ToT......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH....T........T........T........T.oT......T..WW',
    'WW..............TT........T.....T..T.....T.o..HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..........TT......T.......T......TT.........WW',
    'WW........T.........T.........T............T..HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH......T....TT....o...T......T...............WW',
    'WW...T........T....T.................o....T...HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..To.T.T...T....T.TT........T...oo.......o..WW',
    'WW....T......TT...T..oT....T.T....T..T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...To....o............T.....TT....T.T.......WW',
    'WW..T.........TT..............T......TT..T......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.......................T............T....TT.........T.....T...WW',
    'WW....TT...........T.........To.TT..T......TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T........T........T...T.....T...T...T...WW',
    'WW...To.T..........o........TTT.............QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ..T....T......T....T..........T....oT..T..WW',
    'WW...oT.....TTTT.T.T.....................T..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ............To...T..T.T....T....T....T.T..WW',
    'WW....T.T.T....T.TT..........oT.T.....T.TT..QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ....T..............o.........TT........T..WW',
    'WW...TT..oT......T..T..o......T.......TTT...QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQTT....T..........T.......T.T..T........T..WW',
    'WW.........TT.T.TT......T.T......T.T........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.oT...........TT....TT..T.....T....T......WW',
    'WW...............T....T.o........T........o.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..............T.......o.......T...T.o.....WW',
    'WW...T...TT.........T....T.....T....T.T.....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT.T....T........T....TT....TT.......T..T..WW',
    'WW..T....T.......T..T...............T......TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ....T........T................T.......T...WW',
    'WW........T............TT.T.T...TT..T.....TTQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT..T.T..............T.T.....T.........TT..WW',
    'WW.......TT...T.T...................o.......QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQT...............T...T.T...TTT.....TT......WW',
    'WW.....................T...T...TT..T........QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T.....T.T.T........T.T.................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........o.................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW..................o........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQoQQQQ##QQQQQQQQQQQQoQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQoQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............SQQQQQQ##QQQQQQQQQQQQQQQSQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##SQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQoQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQoQ######QoQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQoQQ##QQQQQQQQQoQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...T.....T.....T...........##....T........T...........T.....T..............######....................................................................WWWWWWWWW',
    'WW....T..TT...T.T....T.T.T...##T.T.....T......T...T.......T.....T............######.T..........TT......................................................WWWWWWWWW',
    'WW...T.....T...T....T......T.##T.....T...........TT.TT.T.....TT..............######.........TT.........................................................WWWWWWWWW',
    'WW..T.......T.T.......T...T..##T...T.TT.....T................................######....................................................................WWWWWWWWW',
    'WW...........................##...............##.............................######....T............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QLQQ####################QQQ####################QQLQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QSQQQQQQQQQQQQQQQQQSQ......######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...T.............QQQQ####################QQQ####################QQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQSQQSQQSQQSQQSQQQQ......######..T..............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######..........T......QQQQ####################QQQ####################QQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######........T........QQQQQQQQQQQQQQQQQQQQQQ#######QQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQSQQSQQSQQSQQQQQQ......######....T............QQQQQQQQQQQQQQQQQQQQ###########QQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....T...........QQQQQQQQoQQQQQQQQQ####QQQQQQQ####QQQQQQQQQoQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.................QQQQQQQQQQQQQQQQQ###QQQQQQQQQQQ###QQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQSQQSQQSQQSQQSQQQQ......######.................QQQQQQQQQQQQQQQQ###QQQQQQQQQQQQQ###QQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...T....TT..T....QQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....TTTT........QQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQSQQSQQSQQSQQQQQQ......######....T...T........QQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.T..........T....QQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.........T.......QQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..QQQQSQQSQQSQQSQQSQQQQ......######........TT.......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQ......######...T.............QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................#######################o###o###o###o###o#######.######............T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................###############################################.######.................QQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQWWWWWWWWW',
    'WW...T.......................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T......................##...............##..................QQQQQQQQLQQ######Q################QQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######Q################QQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQ##QQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQL......QQQQQQQQQQQQQQQQ###QQQQQQQQQQQQQ###QQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQHHHQQ......QQQQQQQQQQQQQQQQQ###QQQQQQQQQQQ###QQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQQQQQQQQQ......QQQQQQQQQQQQQQQQQQ####QQQQQQQ####QQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T...QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######.................QQQQQQQQQQQQQQQQQQQQ####QQQ####QQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQ##QQQ##QQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW..T.....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T.T.QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....###################............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................HHHHHHQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW....T...QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQWWWWWWWWW',
    'WW....T...QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQWWWWWWWWW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######....................................................................WWWWWWWWW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######....................................................................WWWWWWWWW',
    'WW..T.T......................##...............##CCCCCCC##CCCCCCCC............######....................................................................WWWWWWWWW',
    'WW...........................##..............................................######....................................................................WWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######..............................................##...............##..........WW',
    'WW...........................##..............................................######................T.........o.T.................##...............##..........WW',
    'WW...........................##..............................................######.............................T##..............##............QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######....................T.T.......##..............##............QQQ##HHHHQ.....WW',
    'WW..T...T..T....TT.T....T....##.....TTT.T....................................######..........................T..o##..............##............QQQ##HHHHQ.....WW',
    'WW..T..T.TT.##...T...T.......##.T.TT...T.....................................######..................T...........##..............##............QQQ##HHHHQ.....WW',
    'WW..TTT....T##T.....TT....T.T##..T.TTT....................................L..######..L...........................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW...............T......T..TT##.......TTT....................................######..............................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW..T..T..........T..T...TT..##...T..T..T....................................######...............T..............##........RRRRRR###################..........WW',
    'WW...TT...........T...T......##.T.TT...TT....................................######.................T..T.........##...RRRRRRRRRRRR##################..........WW',
    'WW....TT...........TT.T..TT..##.T...T...T....................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW......T..........T......T..##..T...T.T.....................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.....T.........T.TT.TT.....##.TT..TT.......................................######.......................o..T...##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T...T........TT..T.TT.T..##TTT....T.T....................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T..TTTT.##.T.....T....TT.....T....T...................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...T..TT.T##..T.T....T..T..TT..TTT.TT...................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T.TTT...##...T.TQQQQQQQQQQQQQQQQQTT.T...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################QQQQQQQ..TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################QQQQQQQ.......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T.T.T..TT....TTTQQQSQQQQQSQQQQQQQ.......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.....T............QQQQQQQQQQ############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...TT.T...TTT.....QQQQQQQQQQ############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.............TTT.TQQQQQQSQQQQQQQQQQ..T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T......TTTTT....QQQQQQQQQQQQSQQQQ...T...##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...........##...RRRRRRRRRRRRRRRRRRRRRRR.....##..........WW',
    'WW..TT.T...T........QQQQQQQQQQQQQQQQQT......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW...TT..T......T.T.QQoQQQQQoQQQQQoQQ..TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW.........TTTTT....QQQQQQQQQQQQQQQQQ..T....CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW...........TT...TT.T........T.T.....TTT...CCCCCC##CCCC##................L.Q######Q.L...........................##...............................##..........WW',
    'WW...TT......T.TTT.TT...T.TTT......T...T....CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW...........#############################################..................Q######Q..............................................................##..........WW',
    'WW...T.TT....############################################C.........HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW....T.....TT..T...T.T.T.T.....T..................................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.....T..T.T.....T.TTT.TT..T..T.....TTTT..........................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 68, ty: 61, name: 'Xuống Chân Núi Kim Cang Môn' },
    { x: 78, y: 139, to: 'map3', tx: 68, ty: 61, name: 'Xuống Chân Núi Kim Cang Môn' },
    { x: 79, y: 139, to: 'map3', tx: 68, ty: 61, name: 'Xuống Chân Núi Kim Cang Môn' },
    { x: 80, y: 139, to: 'map3', tx: 68, ty: 61, name: 'Xuống Chân Núi Kim Cang Môn' },
    { x: 81, y: 139, to: 'map3', tx: 68, ty: 61, name: 'Xuống Chân Núi Kim Cang Môn' },
    { x: 82, y: 139, to: 'map3', tx: 68, ty: 61, name: 'Xuống Chân Núi Kim Cang Môn' },
  ],
  npcs: [
    { id: 'tong_the', x: 80, y: 20, sprite: 'sect_master_kim_cang' },
    { id: 'chap_su_kc', x: 72, y: 124, sprite: 'dai_phu' },
    { id: 'quan_dai_kc', x: 112, y: 70, sprite: 'giu_mieu' },
    { id: 'huan_luyen_kc', x: 136, y: 39, sprite: 'tho_san_ha' },
    { id: 'de_tu_kc', x: 60, y: 80, sprite: 'hoc_tro' },
  ],
  zones: [
    { id: 'tang_thuong_kim_cang', name: 'Tầng Thượng Sơn Môn', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_kc', name: 'Khu Đệ Tử Kim Cang', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'vo_dai_kc', name: 'Võ Đài Kim Cang', rects: [[98, 56, 152, 98]], types: [] },
    { id: 'chan_nui_kim_cang', name: 'Chân Núi Sơn Môn', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 13, y: 113, item: 'linh_chi' },
    { x: 15, y: 116, item: 'linh_chi' },
    { x: 46, y: 122, item: 'linh_chi' },
    { x: 54, y: 126, item: 'linh_chi' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 147, y: 99, item: 'linh_chi' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Kim Cang Môn' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 49, y: 68, label: 'Sân Luyện Thể' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 101, y: 77, label: 'Võ Đài' },
    { sprite: 'sign', x: 115, y: 62, label: 'Khán Đài' },
    { sprite: 'sign', x: 19, y: 39, label: 'Linh Tuyền' },
    { sprite: 'sign', x: 124, y: 40, label: 'Sườn Đá Luyện Cước' },
    { sprite: 'sign', x: 115, y: 119, label: 'Hồ Ngâm Thân' },
    { sprite: 'sign', x: 18, y: 125, label: 'Trường Rèn Thể' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Kim Cang' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tháp Chuông' },
    { sprite: 'sign', x: 100, y: 19, label: 'Tháp Trống' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN NGŨ ĐỘC GIÁO — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá (chặn),
// "E" giếng (chặn), "R" nước (chặn), "F" hàng rào chuồng độc vật
// (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_NGUDOC = {
  id: 'sonmon_ngudoc',
  name: 'Sơn Môn Ngũ Độc Giáo',
  sect: 'ngu_doc',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-ngudoc-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW.......T..T.TT....T.T.T.....TT.............T..T.T...T......TT...........TTT.......T.TT....T............T.....TT...TT.T......T.T......T.....T....TT..........WW',
    'WW...T.....T..TTT.......T........T...T.....T...T...T...T....T......T..T.TT.........T....TT..T............TT...T..T.T....T....T....T.T....T..............T.....WW',
    'WW........TT......T.TTTT....T..ToT........T......T..T..T........T.TT...........TT....TT..T.....T...TT...........T...o...T..T.....T...T....T...TT.T...T.T......WW',
    'WW..TT.......T....TTT....TT.T...T.oo..TT..T...TT..TT....T................T.......T.T..T.T..............T.T.....T....T.T....TTT.T....T.........TT...T.To...TT..WW',
    'WW........T..T...TT...T..T......T..........T....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.......................T......TT...T..oT....T.T....T..T.......WW',
    'WW.....T...T..T..........o......T........T......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.....................T.........TT..............T......TT..T...WW',
    'WW......T..........T..T.......T..T..............................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.......................TT...........T.........To.TT..T........WW',
    'WW...TT.T.o..T..T....TTT....T..o..oTT...T.......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................T.To.T..........o........TTT..............WW',
    'WW....T....T......T............T.T....T.......HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH....oT.....TTTT.T.T.....................T...WW',
    'WW.......TT....T.........T........TTT....T....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.....T.T.T....T.TT..........oT.T.....T.TT...WW',
    'WW.....T.......T..............................HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH....TT..oT......T..T..o......T.......TTT....WW',
    'WW...T......T.................TTT.T...........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH..........TT.T.TT......T.T......T.T.........WW',
    'WW.....T..............T............T....TT....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH................T....T.o........T........o..WW',
    'WW..o........T.............TT........T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH....T...TT.........T....T.....T....T.T......WW',
    'WW......T....T.............T.....T...T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T....T.......T..T...............T........WW',
    'WW...T.T....o...T.T.............................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................T......T............TT.T.T...TT..T.....T..WW',
    'WW...TT......o.........T...T.o.T.T.....T....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT.....TT...T.T...................o........WW',
    'WW.........T..........T.T...o......T.......TQQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ....................T...T...TT..T.........WW',
    'WW...T......T.........T.........T.......TT.TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T...TT...T....T...T.TT....T..............WW',
    'WW..TT.T....................T...TT.........TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...T............To.................T...T..WW',
    'WW...T.T.......T..T...T...........T.........QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQTT..............T.....T...............o...WW',
    'WW...T....T...T...................T....To...QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....TT...................................WW',
    'WW......T........T....T....T..........TT....QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T......T........T.TTT............To..WW',
    'WW..............T..........o..T.o.T..T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....T...o.......T......T.................WW',
    'WW..T....T.....T........TT.........T....o.T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.o......To.....T...T.T..........T.......WW',
    'WW................T......T................T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T..T....T...T...........T.....T.T.o......WW',
    'WW......................o...T....T....ToT...QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ...T........T........T........T.oT........WW',
    'WW...............TT........T.....T..T.....T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQT........TT......T.......T......TT........WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........o.................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW..................o........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQoQQQQ######QQQQoQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQoQ######QoQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW..TT.....TT.......T.....T.T##.T........T.T..............TT....T............######...........................................................................WW',
    'WW.......T...T...............##...T..T...T........T.............T............######.........................................................................T.WW',
    'WW..TT........T.T...........T##....T.............T..T..T.....................######.....RR.....###HHHHHH................................................T.....WW',
    'WW....TT.....TTTT.....T...T..##.................T.........T...TT.............######.....RR.....###HHHHHH......................................................WW',
    'WW...........................##...............##.............................######.....RR...#####HHHHHH.....................##.........................##....WW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...#####HHHHHH.....................##.........................##....WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......FFFFFFFFFFFFFFFFFFFFFFF##.FFFFFFFFFFFFFFFFFFFFFFF.##....WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQSQSQSQQQQQQQQQQQSQQ......######.....RR...##.......F.....................F##.F.....................F.##....WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F...............o.....F##.F.......o.............F.##....WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F...S.................F##.F.................S...F.##T.T.WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##L......F.....................F##.F.....................F.##..T.WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.....o.F.....................F##oF.....................F.##....WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...################.......................###........................##....WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...################.......................###........................##....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQSQQQSQQQQQQ......######.....RR...##.......F.............T.......F##.F..............T......F.##....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F.....................F##.F.....................F.##T...WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F.................S...F##.F...S.................F.##....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F.....................F##.F.....................F.##T...WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F.......o.............F##.F...........o.........F.##....WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......F.....................F##.F.....................F.##....WW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQ......######.....RR...##.......FFFFFFFFFFFFFFFFFFFFFFF##.FFFFFFFFFFFFFFFFFFFFFFF.##....WW',
    'WW...........................##...............##..QQSQQQQQQQQQQQQQQQQQQ......######.....RR...##..............................##.........................##....WW',
    'WW.......T...................###############################################.######.....RR...##..............................##.........................##.T..WW',
    'WW..T........................###############################################.######.....RR...##.....L........................##.........................##T...WW',
    'WW.....T.....................##...............##..................QQQQQQQQQQQ######QQQ..RR...##..............................##.........................##....WW',
    'WW.......T...................##...............##..................QQQQQQQQLQQ######Q################.........................##.........................##....WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######Q################..FFFFFFFFFFFFFFFFFFFFFFF##.FFFFFFFFFFFFFFFFFFFFFFF.##....WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQ..RR...##.......F.....................F##.F.....................F.##....WW',
    'WW...........................##...............##..................QQLQQQQQQQQ######QQQ..RR...##.......F.........o...........F##.F.....................F.##....WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQ..RR...##.......F.................S...F##.F...S.................F.##T...WW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..................QQQQQQQQQQQ######QQQ..RR...##.......F.....................F##.F.....................F.##.T..WW',
    'WW...T....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.............................######.....RR...##.......F.....................F##.F................T....F.##....WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######...################.......................###........................##....WW',
    'WW.....T..QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######...################......T................###........................##....WW',
    'WW..T.....QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##.....o.F.....................F##oF....o................F.##.T..WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##L......F.....................F##.F.....................F.##....WW',
    'WW...T....QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##.......F...S.................F##.F.................S...F.##....WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##CCCCCCC##CCCCCCCC............######.....RR...##.......F.....................F##.F.....................F.##....WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....###################............######.....RR...##.......F..................o..F##.F...........o.........F.##.T..WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##.......F.....................F##.F.....................F.##....WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##.......FFFFFFFFFFFFFFFFFFFFFFF##.FFFFFFFFFFFFFFFFFFFFFFF.##....WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##..............................##.........................##....WW',
    'WW....TT..QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##...########################################################....WW',
    'WW......T.QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##...########################################################T...WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##CCCCCCC##CCCCCCCC............######.....RR...##..............................##.........................##....WW',
    'WW.......T...................##...............##CCCCCCC##CCCCCCCC............######.....RR....................................................................WW',
    'WW...........................##..............................................######.....RR..............................................................T.....WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######................T...........o.................##...........T..T##.....T....WW',
    'WW...........................##..............................................######..................T....T...o..................##.............T.##..........WW',
    'WW...........................##..............................................######.........................To...##..............##............QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######..............................##..............##...........TQQQ##HHHHQ.....WW',
    'WW..T...T..T....TT.T....T....##.....TTT.T....................................######..............T............T..##..............##............QQQ##HHHHQ...T.WW',
    'WW..T..T.TT....T...T........T##.TT...T.TT....................................######....................o.........##..............##............QQQ##HHHHQ.....WW',
    'WW..T....TT.....TT....T.T..T.##TTT........................................L..######..L.............o...T.........##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######..............o.......T.......##........RRRRRR##R...........QQQ##QQQQQT....WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCC##CCCC..........................................######..........................T...##........RRRRRR##R............T.##...T..TT..WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCC##CCCC..........................................######..............................##...RRRRRRRRRRRRRRRRRRRRRRR.....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCC##CCCC..........................................######.........................T....##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCC##CCCC..........................................######................T..........T..##o.RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCC##CCCC..........................................######.........................o.T..##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCC##CCCC..........................................######.....................o...T....##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ........TTT##..RRRRRRRRRRRRRRRRRRRRRRRRR....##........T.WW',
    'WW....#############################.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ.T.....T...##..RRRRRRRRRRRRRRRRRRRRRRRRR....##........T.WW',
    'WW....#############################.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..T........###################################..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################......TT..WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ.T.....T...##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCC############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQT.....T....##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCC############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ........T..##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQT..........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##......T.T.WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ....TT.....##...RRRRRRRRRRRRRRRRRRRRRRR.....##........T.WW',
    'WW....CCCCCCCCCCCCC##CCCCCCCCCCCCCC.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ..T.T......##..T...T.T............o...T.....##..........WW',
    'WW........................................................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ.T.....T...##o....o......T.T.............o..##..TT.TT.o.WW',
    'WW..........................................................................Q######Q.....................TT..o..T##....T.........T...o......o..o..##...T......WW',
    'WW....................................HHHHHH..............................L.Q######Q.L............T..............##......T...............T....o...##..T.......WW',
    'WW....................................HHHHHH................................Q######Q...............T..TT......T..##........T..........o...........##..........WW',
    'WW...............########################################...................Q######Q............T......T...T......T......o.........o..T.........T.##......T...WW',
    'WW...............########################################..........HHHHHHHHHQ######QHHHHHHHHH....T.......T....T...o......................o......T.##...TT..T..WW',
    'WW....................................HHHHHH.......................HHHHHHHHHQ######QHHHHHHHHH..........TTTT.......T...T....T..........T........T..##........T.WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH......TT....TT....................T..................##..........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH............T.....T...T.T............o....T.......T.T............WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 74, ty: 61, name: 'Xuống Chân Núi Ngũ Độc Giáo' },
    { x: 78, y: 139, to: 'map3', tx: 74, ty: 61, name: 'Xuống Chân Núi Ngũ Độc Giáo' },
    { x: 79, y: 139, to: 'map3', tx: 74, ty: 61, name: 'Xuống Chân Núi Ngũ Độc Giáo' },
    { x: 80, y: 139, to: 'map3', tx: 74, ty: 61, name: 'Xuống Chân Núi Ngũ Độc Giáo' },
    { x: 81, y: 139, to: 'map3', tx: 74, ty: 61, name: 'Xuống Chân Núi Ngũ Độc Giáo' },
    { x: 82, y: 139, to: 'map3', tx: 74, ty: 61, name: 'Xuống Chân Núi Ngũ Độc Giáo' },
  ],
  npcs: [
    { id: 'duong_tinh_nd', x: 80, y: 20, sprite: 'sect_master_ngu_doc' },
    { id: 'chap_su_nd', x: 72, y: 124, sprite: 'de_tu_phai' },
    { id: 'quan_doc_coc_nd', x: 110, y: 120, sprite: 'de_tu_phai' },
    { id: 'luyen_doc_su_nd', x: 100, y: 22, sprite: 'dai_phu' },
    { id: 'de_tu_chan_doc_nd', x: 94, y: 72, sprite: 'de_tu_phai' },
  ],
  zones: [
    { id: 'tang_thuong_ngu_doc', name: 'Tầng Thượng Ngũ Độc', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_ngu_doc', name: 'Khu Đệ Tử Ngũ Độc', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'trai_doc_vat', name: 'Trại Nuôi Độc Vật', rects: [[84, 54, 157, 100]], types: [] },
    { id: 'doc_coc', name: 'Độc Cốc', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 115, y: 116, item: 'doc_tam_hoa' },
    { x: 115, y: 124, item: 'doc_tam_hoa' },
    { x: 143, y: 116, item: 'doc_tam_hoa' },
    { x: 143, y: 125, item: 'doc_tam_hoa' },
    { x: 120, y: 130, item: 'doc_tam_hoa' },
    { x: 136, y: 130, item: 'doc_tam_hoa' },
    { x: 19, y: 44, item: 'doc_tam_hoa' },
    { x: 104, y: 112, item: 'doc_tam_hoa' },
    { x: 48, y: 124, item: 'doc_tam_hoa' },
    { x: 53, y: 130, item: 'doc_tam_hoa' },
    { x: 18, y: 116, item: 'linh_chi' },
    { x: 26, y: 124, item: 'linh_chi' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Ngũ Độc Giáo' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Ngũ Độc' },
    { sprite: 'sign', x: 59, y: 19, label: 'Kho Độc Dược' },
    { sprite: 'sign', x: 100, y: 19, label: 'Lò Luyện Độc' },
    { sprite: 'sign', x: 124, y: 40, label: 'Vọng Độc Đài' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 49, y: 68, label: 'Sân Luyện Độc' },
    { sprite: 'sign', x: 97, y: 61, label: 'Trại Nuôi Độc Vật' },
    { sprite: 'sign', x: 99, y: 77, label: 'Chuồng Xích Luyện Xà' },
    { sprite: 'sign', x: 127, y: 77, label: 'Chuồng Kim Tiễn Rết' },
    { sprite: 'sign', x: 115, y: 119, label: 'Độc Cốc' },
    { sprite: 'sign', x: 19, y: 39, label: 'Độc Tuyền' },
    { sprite: 'sign', x: 17, y: 120, label: 'Vườn Độc Thảo' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};
// ================================================================
// SƠN MÔN HUYỀN ÂM CUNG — khối map INSTANCE riêng (như bí cảnh/
// động phủ), KHÔNG thuộc EXP_LAYOUT_V của 14 map thế giới.
// Gói bàn giao (xưởng map xuyên đêm 30/10): đội tích hợp dán khối
// này vào js/maps.js (trong IIFE, sau MAP14), đăng ký vào registry
// instance riêng (đề xuất SONMONS) + nối cổng ở map 3 — xem
// README.md của gói. Tiles là mảng chuỗi tĩnh 140 hàng x 160 cột
// (sinh bởi gen/gen_layout.py, đã qua kiểm đường đi + audit).
// Chữ tile: "." cỏ/đất, "#" đường/bậc đá, "Q" sân đá, "W" vách
// (chặn), "G" cổng, "H" nhà (chặn), "T" cây (chặn), "S" sạp/giá
// (chặn), "L" đèn đá (chặn), "C" ruộng, "o" đá/đài thạch (chặn),
// "E" giếng (chặn), "R" nước (chặn) — cùng BLOCKED của maps.js.
// ================================================================
var SONMON_HUYENAM = {
  id: 'sonmon_huyenam',
  name: 'Sơn Môn Huyền Âm Cung',
  sect: 'huyen_am',
  instance: true,
  bg: null, // nền dự phòng 1 file (xem bgChunks)
  bgChunks: {
    src: 'assets/sonmon-huyenam-bg-r{r}c{c}.webp',
    cols: 3, rows: 3, chunkTilesW: 60, chunkTilesH: 54, overlapTiles: 8,
    originX: [0, 52, 100], originY: [0, 46, 86], tilePx: 32
  },
  w: 160, h: 140,
  tiles: [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...............TT........T...TT.........T.TTT.TT.....T......TTTT.T..T.....TT....T.T......T...T.....T..T....TT.T....TT......T..................T..........T..WW',
    'WW........TT......T..........T.TT........T..T.....T..T......T....T...T..TT..........TTT.......T.TT....T....T....T.T.....T....T.T.TT..........T.TT..T...T..T...WW',
    'WW...To.T.T...T..T.T...TT...T....T.....T.T..T..................T..........T.T.....T.......T..T......T.......TTT..........T...T.T...TT.TT.....T.T.TTT...T......WW',
    'WW..TT.......T...T....T....T.....o..T.o.T..TT.....T....T..TT...T.T..T.T.T.T...TTT.....T......T...T.......T.....T.T.....TTo...T.T...oT.T....TT.T...T..T........WW',
    'WW........T....T.....T........TT.........T......................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH...........................T.o......To.....T...T.T............WW',
    'WW....o.T...............T......T................................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH....................T......T..T....T...T...........T.....T.T..WW',
    'WW......T.....................o...T....T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH.....................o.......T........T........T........T.oT..WW',
    'WW..ToT................TT........T.....T..T.....................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH..........................T........TT......T.......T......TT..WW',
    'WW......T.o......T.........T.........T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.............T....TT....o...T......T........WW',
    'WW........T.T........T....T...................HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.........To.T.T...T....T.TT........T...oo...WW',
    'WW..o....T...T......TT...T..oT....T.T....T....HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH........o.To....o............T.....TT....T..WW',
    'WW..T......T.........TT..............T........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T........T............T....TT.........T..WW',
    'WW..TT..T....TT...........T.........To.TT..T..HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH.......T...T........T........T...T.....T....WW',
    'WW........T.To.T..........o........TTT........HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH...T...T...T....T......T....T..........T....WW',
    'WW..........oT.....TTTT.T.T...................HHHHHHHHHHHH......HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH......HHHHHHHHHHHH....oT..T............To...T..T.T....T....T..WW',
    'WW......T....T.T.T....T.TT..........oT.T........................HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH........................T.T....T..............o.........TT....WW',
    'WW...T.TT...TT..oT......T..T..o......T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ......TTT....T..........T.......T.T..T....WW',
    'WW...TTT..........TT.T.TT......T.T......T.T.QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ......T.oT...........TT....TT..T.....T....WW',
    'WW......................T....T.o........T...QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ..T..................T.......o.......T....WW',
    'WW.......o..T...TT.........T....T.....T....TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.T.o...T.T....T........T....TT....TT......WW',
    'WW...T.....T....T.......T..T...............TQQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQoQQQQQQQQQQQQQQQQ...T..T....T........T................T....WW',
    'WW........T......T............TT.T.T...TT..TQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T..T.T..............T.T.....T......WW',
    'WW.......TT.....TT...T.T...................oQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.....TTT...............T...T.T...TTT......WW',
    'WW............................T...T...TT..T.QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.TT.......T.....T.T.T........T.T..........WW',
    'WW.........T...TT...T....T...T.TT....T......QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.......T....T.....T...T...................WW',
    'WW...........T............To................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o..T...T........T.............TTT........WW',
    'WW...T...TTT..............T.....T...........QQLQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQLQQ..T.T...........T....T.............T..T...WW',
    'WW......o......TT...........................QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ.o...........TT.....ToTT.....T...T........WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##.........o.................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW..................o........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................#######################QQQQQQQQQQQQQQQQQQQQoQQQQ######QQQQoQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW..................##.......##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW.......RRRRRRRRR...........##.....................QQQQQQQQQQQQQQQQQQQQQQQoQ######QoQQQQQQQQQQQQQQQQQQQQQQQ..............QLQQQQQ##QQQQQQQQQQQQQQQQQQLQ.......WW',
    'WW........RRRRRRR............##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ..............QQQQQQQ##QQQQQQQQQQQQQQQQQQQQ.......WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##.....................QQLQQQQQQQQQQQQQLQQQQQQQQ######QQQQQQQQLQQQQQQQQQQQQQLQQ.....................##...........................WW',
    'WW...........................##.....................QQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQ.....................##...........................WW',
    'WW...........................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW.......TT.TT.T.....TT..T...##....T.T.......T...T..T...T.TT.................######.T............................................####################.........WW',
    'WW..T........................##T...............T....T.....T..................######.........................RRRRRRRRRRRRRRRRRRRRR..................##.........WW',
    'WW....TT.................T...##.T.....T...T..............TT..TT..............######...........T.............RRRRRRRRRRRRRRRRRRRRR..................##.........WW',
    'WW..........T......T......T..##T..T........TT.....T.T.T..T...T...............######....TT..T........L.......RRRRRRRRRRRRRRRRRRRRR..................##.........WW',
    'WW...........................##...............##.............................######.TTTT.......T.......RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.##.........WW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######....T....T.........RoRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRoR##.........WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######........T..........RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQSQSQSQQQQQQQQQQQSQQ......######.....T.............RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######....TT.....T.......RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...................RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHHQQQQHHH##HHHHHQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######........T..........RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...................RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...................RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.....T.....T.......RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##HHHH.....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQSQQQSQQQQQQ......######...T.T.............RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##HHHH.....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...........T.......RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRoRRRRRRRRRRRR##HHHH.....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######.......T.T.........RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQQQRRRRRRRRRR##HHHH.....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQ......######...................RRRRRRRRRRRRRRRRQLQQQQQQQQQQQQQQQQQRRRRRRRRRR##HHHH.....WW',
    'WW........QQHHHHHHHHHHQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQQQRRRRRRRRRR##.........WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQHHHHHHHHQQQQQRRRRRRRRRR##.........WW',
    'WW...........................##...............##..QQQQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQ.....QQQQQQQQQQRRRRRRRQQQQQQHHHHHHHHQQQQQRRRRRRRRRR##.........WW',
    'WW....T......................##...............##..QQSQQQQQQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQRRQQQQQQHHHHHHHHQQQQQRRRRRRRRRR##.........WW',
    'WW...........................###############################################Q######QQQQQQQQQQQQQQQQQQ.RRRRRRRRRQQQQQQQQQQQQQHHHHHHHHQQQQQQQQQQQQQQQ##.........WW',
    'WW...........................###############################################Q######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRQQQQQQQQHHHHHHHHQQQQQQQQQQQQQQQ##.........WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQQQRRRRRRRRRR##.........WW',
    'WW......T....................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQSQQQQQQQQQQQSQQQRRRRRRRRRR##.........WW',
    'WW..T........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQQQRRRRRRRRRR##.........WW',
    'WW...........................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQQQRRRRRRRRRR##.........WW',
    'WW......T....................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQLQRRRRRRRRRR##.........WW',
    'WW......T....................##...............##..................QQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRQQQQQQQQQQQQQQQQQQQRRRRRRRRRR##.........WW',
    'WW........QLQQQQQQQQQQQQQQQQQ##QQQQQQQQLQ.....##T.TT..T.......T.TTQQQQQQQQQQQ######QQQQQQQQQQQQQ......RRRRRRRRRRRRRRRRRRoRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##.T.T..T...........T..T.......######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW....T.T.QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQQQ....######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQQQ....######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##..QQQQHHHHHQQQQHHHHHQQQQQ.T..######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW......T.QQHHHHHHHHHQQQHHHHH##HHQQQQQQQQ.....##..QQQQHHHHHQQQQHHHHHQQQQQ....######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW....T...QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##.TQQQQHHHHHQQQQHHHHHQQQQQ....######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ..E..##..QQQQHHHHHQQQQHHHHHQQQQQ....######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW....T...QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##.TQQQQQQQQQQQQQQQQQQQQQQQTT..######.............##....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##.TQQQQQQQQQQQQQQQQQQQQQQQ....######.............##..L.RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR##.........WW',
    'WW....T...QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##.TQQQQQQQQQQQQQQQQQQQQQQQTT..######.............##....RoRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRoR##.........WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##..QQQQQQQQQQQQQQQQQQQQQQQ....######.............##.....RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.##.........WW',
    'WW......T.QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##..TT.T..T....T.TT.T..TTT.....######.............##............................................................WW',
    'WW........QQHHHHHHHHHQQQQQQQH##HHHHHHQQQQ.....##T..T.TT.....TTT.TTT.T..T.....######...................#############################################...........WW',
    'WW.....T..QQQQQQQQQQQQQQQQQQQ##QQQQQQQQQQ.....##.............................######..............................................##...........................WW',
    'WW......T....................##...............##.............................######..............................................##...........................WW',
    'WW.......T...................##..............................................######..............................................##...........................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW########WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW####WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WW...........................##..............................................######..................T..o.....T..................##...............##..........WW',
    'WW...........................##..............................................######..............................................##...............##..........WW',
    'WW...........................##..............................................######..............................##..............##............QQQ##QQQQQ.....WW',
    'WW...........................##..............................................######........................T.....##..............##............QQQ##HHHHQ.....WW',
    'WW..T.T.TT.T....TT.T..T.TT.T.##TT.T.TTTTT....................................######..........................T..T##..............##............QQQ##HHHHQ.....WW',
    'WW..T..T.TT.##...T.T.T...T...##.TTTT...T.....................................######..............................##..............##............QQQ##HHHHQ.....WW',
    'WW..TTT....T##T...TTTT....T.T##....TTT....................................L..######..L...........................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW...T...............TT.T..TT##..T....T.T....................................######..............................##........RRRRRR##R...........QQQ##QQQQQ.....WW',
    'WW..T..T..........T.TTT..TTT.##...T.TTT.T....................................######...............o..T...........##........RRRRRR###################..........WW',
    'WW...TT...........T...T.T....##.TTT..T.TT....................................######..............................##...RRRRRRRRRRRR##################..........WW',
    'WW....TT...........TT.T.TTT..##.T..T....T....................................######........................T.....##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW......T.........TT...T..T..##..T...TTT.....................................######..............o...............##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T.TT...........TT.TT..T..##.TT..TT.......................................######..............................##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T...T........T..TT.TT.T..##TTT....TTT....................................######................T.............##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..TT.TTTT.##.TT.TTTT....TT...TTT..T.T.T.................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...T..TT.T##..T...TTTT..T..T...TT..TT...................QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..T.TTT...##T....TTT.T..TT...T..T.TT.TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################..T.TTTT.T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........###################################..........WW',
    'WW..##########################...TT....T....CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW...T....TT.T..TTTTT..TT.T......T..TTTTT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..TTT..TT.TTTTTTTT.TT....TTT############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW.....T.......T..T....TT..T..############################QQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW....T.T.T...TT....TTTTTTTT.TT...T.TT......CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##..RRRRRRRRRRRRRRRRRRRRRRRRR....##..........WW',
    'WW..TT..T....TT.T.......TTTTT.T..TTTTTT.....##############QQQQQQQQQQQQQQQQLQQ######QQLQQQQQQQQQQQQQQQQ...........##...RRRRRRRRRRRRRRRRRRRRRRR.....##..........WW',
    'WW.....TT.TTTTT..T.T.TTT.T....T...T.........CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW......TT.TTTT....T.....T.TTT..T..T.T.TT...CCCCCC##CCCCCCQQQQQQQQQQQQQQQQQQQ######QQQQQQQQQQQQQQQQQQQ...........##...............................##..........WW',
    'WW..T...T.....T.....T..TTT.....TTTTTTTTT....CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW..T.T......TTTTT....TT..T.TT..TTT..T..T...CCCCCC##CCCC##................L.Q######Q.L...........................##...............................##..........WW',
    'WW..TTTT....TT.TT.TTT.TT.TT.........T.......CCCCCC##CCCC##..................Q######Q.............................##...............................##..........WW',
    'WW...TT.T.T..#############################################..................Q######Q..............................................................##..........WW',
    'WW......TTT.T############################################C.........HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW..TT.TTTTTTTTT..TT..T.TTTT.TT...T.T..............................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW..TT..T..T.T...T..T.TTTTTTTT......TT.............................HHHHHHHHHQ######QHHHHHHHHH.....................................................##..........WW',
    'WW.................................................................HHHHHHHHHQ######QHHHHHHHHH.................................................................WW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQQQQQQQQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWHHHHHHHHHQGGGGGGQHHHHHHHHHWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  ],
  blocked: BLOCKED,
  start: { x: 80, y: 134 },
  portals: [
    { x: 77, y: 139, to: 'map3', tx: 71, ty: 69, name: 'Xuống Chân Núi Huyền Âm Cung' },
    { x: 78, y: 139, to: 'map3', tx: 71, ty: 69, name: 'Xuống Chân Núi Huyền Âm Cung' },
    { x: 79, y: 139, to: 'map3', tx: 71, ty: 69, name: 'Xuống Chân Núi Huyền Âm Cung' },
    { x: 80, y: 139, to: 'map3', tx: 71, ty: 69, name: 'Xuống Chân Núi Huyền Âm Cung' },
    { x: 81, y: 139, to: 'map3', tx: 71, ty: 69, name: 'Xuống Chân Núi Huyền Âm Cung' },
    { x: 82, y: 139, to: 'map3', tx: 71, ty: 69, name: 'Xuống Chân Núi Huyền Âm Cung' },
  ],
  npcs: [
    { id: 'tieu_uyen_nhi', x: 80, y: 20, sprite: 'sect_master_huyen_am' },
    { id: 'chap_su_ha', x: 72, y: 124, sprite: 'dai_phu' },
    { id: 'quan_nhac_dai', x: 127, y: 80, sprite: 'truong_lang' },
    { id: 'nhac_su_ha', x: 60, y: 66, sprite: 'giu_mieu' },
    { id: 'de_tu_huyen_am', x: 24, y: 90, sprite: 'hoc_tro' },
  ],
  zones: [
    { id: 'tang_thuong_huyen_am', name: 'Tầng Thượng Huyền Âm', rects: [[2, 2, 157, 50]], types: [] },
    { id: 'khu_de_tu_ha', name: 'Khu Đệ Tử Huyền Âm Cung', rects: [[4, 54, 72, 100]], types: [] },
    { id: 'han_dam', name: 'Hàn Đàm · Nhạc Đài', rects: [[96, 54, 155, 100]], types: [] },
    { id: 'chan_nui_huyen_am', name: 'Chân Núi Huyền Âm Cung', rects: [[2, 104, 157, 137]], types: [] },
  ],
  monsters: [], // sơn môn là đất tông môn — không quái hoang (xem README)
  herbs: [
    { x: 13, y: 113, item: 'linh_chi' },
    { x: 15, y: 116, item: 'linh_chi' },
    { x: 46, y: 122, item: 'linh_chi' },
    { x: 54, y: 126, item: 'linh_chi' },
    { x: 47, y: 131, item: 'linh_chi' },
    { x: 19, y: 44, item: 'linh_chi' },
    { x: 100, y: 90, item: 'linh_chi' },
  ],
  props: [
    { sprite: 'sign', x: 86, y: 131, label: 'Sơn Môn Huyền Âm Cung' },
    { sprite: 'sign', x: 60, y: 119, label: 'Tiếp Khách Đài' },
    { sprite: 'sign', x: 49, y: 68, label: 'Luyện Âm Trường' },
    { sprite: 'sign', x: 45, y: 83, label: 'Khu Đệ Tử' },
    { sprite: 'sign', x: 98, y: 79, label: 'Hàn Đàm' },
    { sprite: 'sign', x: 92, y: 73, label: 'Nhạc Đài' },
    { sprite: 'sign', x: 19, y: 39, label: 'Hàn Tuyền' },
    { sprite: 'sign', x: 124, y: 40, label: 'Đài Vọng Nguyệt' },
    { sprite: 'sign', x: 115, y: 119, label: 'Tuyết Hồ' },
    { sprite: 'sign', x: 17, y: 120, label: 'Vườn Mai Trúc Tuyết' },
    { sprite: 'sign', x: 74, y: 29, label: 'Đại Điện Huyền Âm' },
    { sprite: 'sign', x: 59, y: 19, label: 'Tàng Âm Các' },
    { sprite: 'sign', x: 100, y: 19, label: 'Thanh Âm Đường' },
    { sprite: 'sign', x: 52, y: 97, label: 'Phòng Luyện Âm' },
    { sprite: 'bush', x: 30, y: 44 },
    { sprite: 'bush', x: 140, y: 36 },
    { sprite: 'bush', x: 63, y: 33 },
    { sprite: 'bush', x: 96, y: 33 },
    { sprite: 'bush', x: 8, y: 124 },
  ]
};

  // ---- TÍCH HỢP SƠN MÔN (31/10/2026): đăng ký 10 map instance vào MAPS +
  // cổng dịch chuyển trên quảng trường map 3 (cổng vào cạnh đại diện từng
  // tông, reqSect khóa theo tông; điểm rơi về = ô kề cổng vào của chính
  // tông đó — đã tách riêng từng tông, không còn trùng (24,9)/(30,9) như
  // bản gói). Tên cổng về đã sửa đúng từng tông; Thiên Công chuẩn hoá
  // rect->rects / label->name / type->sprite. NPC tông chủ dùng sheet
  // sect-masters qua sprite 'sect_master_<tông>' (game.js getNpcSheet).
  // Nền: engine nạp theo bgChunks (assets/sonmon-*-bg-r{r}c{c}.webp);
  // không chép file full dự phòng (tiết kiệm ~53MB) nên bg để null. ----
  var SONMONS = { sonmon_thanhphong: SONMON_THANHPHONG, sonmon_huyenphap: SONMON_HUYENPHAP, sonmon_thiencong: SONMON_THIENCONG, sonmon_danha: SONMON_DANHA, sonmon_vanthu: SONMON_VANTHU, sonmon_thienphu: SONMON_THIENPHU, sonmon_cuucung: SONMON_CUUCUNG, sonmon_kimcang: SONMON_KIMCANG, sonmon_ngudoc: SONMON_NGUDOC, sonmon_huyenam: SONMON_HUYENAM };
  Object.keys(SONMONS).forEach(function (id) { MAPS[id] = SONMONS[id]; });
  (function sonmonGates() {
    var m3 = MAPS.map3;
    var GATES = [
      { sect: 'thanh_phong', to: 'sonmon_thanhphong', x: 70, y: 63, name: 'Sơn Môn Thanh Phong Phái' },
      { sect: 'huyen_phap', to: 'sonmon_huyenphap', x: 65, y: 63, name: 'Sơn Môn Huyền Pháp Tông' },
      { sect: 'thien_cong', to: 'sonmon_thiencong', x: 75, y: 62, name: 'Sơn Môn Thiên Công Phường' },
      { sect: 'dan_ha', to: 'sonmon_danha', x: 67, y: 66, name: 'Sơn Môn Đan Hà Cốc' },
      { sect: 'van_thu', to: 'sonmon_vanthu', x: 74, y: 66, name: 'Sơn Môn Vạn Thú Môn' },
      { sect: 'thien_phu', to: 'sonmon_thienphu', x: 63, y: 66, name: 'Sơn Môn Thiên Phù Các' },
      { sect: 'cuu_cung', to: 'sonmon_cuucung', x: 79, y: 66, name: 'Sơn Môn Cửu Cung Trận Tông' },
      { sect: 'kim_cang', to: 'sonmon_kimcang', x: 68, y: 60, name: 'Sơn Môn Kim Cang Môn' },
      { sect: 'ngu_doc', to: 'sonmon_ngudoc', x: 74, y: 60, name: 'Sơn Môn Ngũ Độc Giáo' },
      { sect: 'huyen_am', to: 'sonmon_huyenam', x: 71, y: 68, name: 'Sơn Môn Huyền Âm Cung' },
    ];
    var rows = m3.tiles.map(function (r) { return r.split(''); });
    var occ = {};
    (m3.npcs || []).forEach(function (n) { occ[n.x + ',' + n.y] = 1; });
    (m3.props || []).forEach(function (p) { occ[p.x + ',' + p.y] = 1; });
    (m3.portals || []).forEach(function (p) { occ[p.x + ',' + p.y] = 1; });
    GATES.forEach(function (g) { occ[g.x + ',' + g.y] = 1; });
    GATES.forEach(function (g) {
      rows[g.y][g.x] = 'G';
      m3.portals.push({ x: g.x, y: g.y, to: g.to, tx: 80, ty: 134, name: g.name, reqSect: g.sect, reqSectName: g.name.replace('Sơn Môn ', '') });
      var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]], placed = false;
      for (var i = 0; i < dirs.length && !placed; i++) {
        var sx = g.x + dirs[i][0], sy = g.y + dirs[i][1];
        if (sx < 0 || sy < 0 || sx >= m3.w || sy >= m3.h || occ[sx + ',' + sy]) continue;
        m3.props.push({ sprite: 'sign', x: sx, y: sy, label: 'Cổng ' + g.name.replace('Sơn Môn ', '') });
        occ[sx + ',' + sy] = 1; placed = true;
      }
    });
    m3.tiles = rows.map(function (r) { return r.join(''); });
  })();

  // ---- Neo V5 gom cho migration (game.js đọc EXP_V5_ANCHORS): typeof-
  // guard để trạng thái gộp dở (chưa dán hết 12 gói) vẫn nạp được ----
  var EXP_V5_ANCHORS = {};
  if (typeof EXP_V5_MAP3 !== 'undefined') EXP_V5_ANCHORS.map3 = EXP_V5_MAP3;
  if (typeof EXP_V5_MAP4 !== 'undefined') EXP_V5_ANCHORS.map4 = EXP_V5_MAP4;
  if (typeof EXP_V5_MAP5 !== 'undefined') EXP_V5_ANCHORS.map5 = EXP_V5_MAP5;
  if (typeof EXP_V5_MAP6 !== 'undefined') EXP_V5_ANCHORS.map6 = EXP_V5_MAP6;
  if (typeof EXP_V5_MAP7 !== 'undefined') EXP_V5_ANCHORS.map7 = EXP_V5_MAP7;
  if (typeof EXP_V5_MAP8 !== 'undefined') EXP_V5_ANCHORS.map8 = EXP_V5_MAP8;
  if (typeof EXP_V5_MAP9 !== 'undefined') EXP_V5_ANCHORS.map9 = EXP_V5_MAP9;
  if (typeof EXP_V5_MAP10 !== 'undefined') EXP_V5_ANCHORS.map10 = EXP_V5_MAP10;
  if (typeof EXP_V5_MAP11 !== 'undefined') EXP_V5_ANCHORS.map11 = EXP_V5_MAP11;
  if (typeof EXP_V5_MAP12 !== 'undefined') EXP_V5_ANCHORS.map12 = EXP_V5_MAP12;
  if (typeof EXP_V5_MAP13 !== 'undefined') EXP_V5_ANCHORS.map13 = EXP_V5_MAP13;
  if (typeof EXP_V5_MAP14 !== 'undefined') EXP_V5_ANCHORS.map14 = EXP_V5_MAP14;
  var api = { MAP: MAP, MAP2: MAP2, MAP3: MAP3, MAP4: MAP4, MAP5: MAP5, MAP6: MAP6, MAP7: MAP7, MAP8: MAP8, MAP9: MAP9, MAP10: MAP10, MAP11: MAP11, MAP12: MAP12, MAP13: MAP13, MAP14: MAP14, MAPS: MAPS, HIGH_CHAIN: HIGH_CHAIN, REALMS: REALMS, realmById: realmById, realmRankOf: realmRankOf, realmGate: realmGate, getMap: getMap, isBlocked: isBlocked, isBlockedIn: isBlockedIn, tileAt: tileAt, zoneAt: zoneAt, EXP_LAYOUT_V: EXP_LAYOUT_V, EXP_DX: EXP_DX, EXP_DY: EXP_DY, EXP_V3_MAP1: EXP_V3_MAP1, EXP_V4_MAP2: EXP_V4_MAP2, EXP_V5_ANCHORS: EXP_V5_ANCHORS };
  api.SONMONS = SONMONS;
  // Export neo V5 riêng từng map (guard như trên).
  if (typeof EXP_V5_MAP3 !== 'undefined') api.EXP_V5_MAP3 = EXP_V5_MAP3;
  if (typeof EXP_V5_MAP4 !== 'undefined') api.EXP_V5_MAP4 = EXP_V5_MAP4;
  if (typeof EXP_V5_MAP5 !== 'undefined') api.EXP_V5_MAP5 = EXP_V5_MAP5;
  if (typeof EXP_V5_MAP6 !== 'undefined') api.EXP_V5_MAP6 = EXP_V5_MAP6;
  if (typeof EXP_V5_MAP7 !== 'undefined') api.EXP_V5_MAP7 = EXP_V5_MAP7;
  if (typeof EXP_V5_MAP8 !== 'undefined') api.EXP_V5_MAP8 = EXP_V5_MAP8;
  if (typeof EXP_V5_MAP9 !== 'undefined') api.EXP_V5_MAP9 = EXP_V5_MAP9;
  if (typeof EXP_V5_MAP10 !== 'undefined') api.EXP_V5_MAP10 = EXP_V5_MAP10;
  if (typeof EXP_V5_MAP11 !== 'undefined') api.EXP_V5_MAP11 = EXP_V5_MAP11;
  if (typeof EXP_V5_MAP12 !== 'undefined') api.EXP_V5_MAP12 = EXP_V5_MAP12;
  if (typeof EXP_V5_MAP13 !== 'undefined') api.EXP_V5_MAP13 = EXP_V5_MAP13;
  if (typeof EXP_V5_MAP14 !== 'undefined') api.EXP_V5_MAP14 = EXP_V5_MAP14;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_MAPS = api;
})();
