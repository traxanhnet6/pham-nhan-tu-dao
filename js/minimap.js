// ============================================================
// MINIMAP + BẢN ĐỒ THẾ GIỚI — mục 25 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC: game vốn chưa có minimap dù team điều khiển đã chừa ô neo HUD
// (js/controls.js: hudSlot góc trên-phải khi ngang, góc trên-trái khi
// dọc) và dòng hướng dẫn dưới canvas đã hứa "chạm bản đồ nhỏ để mở
// bản đồ thế giới". Module này lấp đúng chỗ trống đó, không bịa dữ
// liệu: mọi chấm lấy từ maps.js (tiles, portals, npcs) và trạng thái
// thật trong game (vị trí người chơi, quái đang sống ở map).
//
// LUẬT (module ĐỘC LẬP, thuần logic, test bằng Node như các module
// trước; game.js chỉ nối vẽ + panel + ghi dấu đã tới):
// - Nền minimap vẽ từ tiles thật của map: ô chặn (blocked trong
//   maps.js) tối, đường/sân sáng hơn, nước 'R' xanh, còn lại là đất.
//   Không dùng ảnh nền: ảnh nền là tranh AI, không khớp lưới ô.
// - Chấm theo màu chuẩn, ghi rõ trong COLORS: người chơi vàng tươi,
//   người dân xanh dương, cổng cam, quái đỏ. Quái đã chết/dying
//   không vẽ (game.js chỉ đưa quái đang sống vào state).
// - Cổng là dải 6 ô nên gộp theo đích: 1 chấm ở tâm dải mỗi đích,
//   không vẽ 6 chấm chồng nhau thành vệt.
// - Bản đồ thế giới chỉ liệt kê 14 map thế giới (map1–map14), KHÔNG
//   liệt kê map instance (bí cảnh, đấu trường, động phủ): đó là
//   không gian riêng, không nằm trên bản đồ thế giới.
// - "Đã mở khóa" định nghĩa đúng bằng dữ liệu sẵn có, không bịa
//   tiến độ: map đã tới (flags.minimap.visited) hoặc kề qua cổng từ
//   một map đã tới VÀ thỏa khóa cảnh giới của cổng đó (gate.rank
//   trong maps.js, so với rank người chơi). Map kề nhưng chưa đủ
//   cảnh giới hiện trạng thái "bị khóa" kèm tên cảnh giới yêu cầu
//   (lấy từ gate.name, không bịa tên mới). Map chưa tới và không kề
//   thì ẩn tên, chỉ hiện "vùng chưa khám phá".
// - Module KHÔNG thưởng, KHÔNG chạm Linh Thạch, KHÔNG đổi cổng hay
//   khóa cổng: chỉ hiển thị. Vì vậy không cần sửa economy.md.
// - Trạng thái chỉ có flags.minimap.visited (mảng id map đã tới);
//   save cũ không có thì ensure() khởi tạo lười, markVisited()
//   ghi trùng cũng chỉ giữ 1 lần.
// ============================================================
(function (global) {
  'use strict';

  var WORLD_IDS = ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7',
    'map8', 'map9', 'map10', 'map11', 'map12', 'map13', 'map14'];

  // Màu chuẩn của 4 loại chấm + nền (đọc rõ trên nền đất tối).
  var COLORS = {
    player: '#ffd75e', npc: '#7fd7ff', portal: '#ff9f1e', monster: '#ff5a4e',
    walk: '#3d6b35', blocked: '#1e2a1a', path: '#8a7a52', water: '#3a7bd5',
    border: '#8b5a2b', label: '#ffe9a8'
  };

  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (!flags.minimap || typeof flags.minimap !== 'object' || !Array.isArray(flags.minimap.visited)) {
      flags.minimap = { visited: [] };
    }
    return flags.minimap;
  }

  // Ghi dấu đã tới: trùng thì không thêm lần nữa.
  function markVisited(flags, mapId) {
    var st = ensure(flags);
    if (!st || !mapId) return st;
    if (st.visited.indexOf(mapId) < 0) st.visited.push(mapId);
    return st;
  }

  function visitedList(flags) {
    var st = ensure(flags);
    return st ? st.visited.slice() : [];
  }

  // Màu nền của 1 ô theo tiles + bảng blocked của map.
  function tileColor(map, x, y) {
    if (!map || !map.tiles || !map.tiles[y]) return COLORS.blocked;
    var t = map.tiles[y][x];
    if (t === 'R') return COLORS.water;
    if (map.blocked && map.blocked[t]) return COLORS.blocked;
    if (t === '#' || t === 'Q') return COLORS.path;
    return COLORS.walk;
  }

  // Cổng gộp theo đích: tâm dải của mỗi đích (trung bình vị trí ô).
  function portalsOf(map) {
    var out = [], byTo = {};
    (map.portals || []).forEach(function (p) {
      var k = p.to || '';
      if (!byTo[k]) { byTo[k] = { to: k, xs: [], ys: [], gate: p.gate || null }; out.push(byTo[k]); }
      byTo[k].xs.push(num(p.x, 0)); byTo[k].ys.push(num(p.y, 0));
      if (p.gate) byTo[k].gate = p.gate;
    });
    return out.map(function (g) {
      var sx = 0, sy = 0, i;
      for (i = 0; i < g.xs.length; i++) { sx += g.xs[i]; sy += g.ys[i]; }
      return { to: g.to, x: Math.round(sx / g.xs.length), y: Math.round(sy / g.ys.length), gate: g.gate };
    });
  }

  // Vị trí các chấm trên minimap, đã kẹp trong biên map. state:
  // { player: {x,y}, npcs: [{x,y}], monsters: [{x,y}] } — tọa độ Ô.
  // Quái chết game.js không đưa vào nên ở đây không lọc thêm.
  function dots(map, state) {
    state = state || {};
    var w = map ? num(map.w, 0) : 0, h = map ? num(map.h, 0) : 0;
    function pt(p) {
      if (!p) return null;
      return { x: clamp(Math.floor(num(p.x, 0)), 0, Math.max(0, w - 1)), y: clamp(Math.floor(num(p.y, 0)), 0, Math.max(0, h - 1)) };
    }
    var res = { player: pt(state.player), npcs: [], portals: [], monsters: [] };
    (state.npcs || []).forEach(function (n) { var p = pt(n); if (p) res.npcs.push(p); });
    portalsOf(map || {}).forEach(function (g) { var p = pt(g); if (p) res.portals.push({ x: p.x, y: p.y, to: g.to, gate: g.gate }); });
    (state.monsters || []).forEach(function (m) { var p = pt(m); if (p) res.monsters.push(p); });
    return res;
  }

  // Kích thước ô (px nguyên, tối thiểu 1) để minimap vừa khung cho
  // trước mà không méo tỉ lệ map.
  function cellSize(map, maxW, maxH) {
    if (!map || !map.w || !map.h) return 1;
    return Math.max(1, Math.floor(Math.min(num(maxW, 180) / map.w, num(maxH, 140) / map.h)));
  }

  // Vẽ minimap lên ctx 2d (chỉ dùng fillRect: chạy được cả trên
  // canvas thật lẫn ctx giả trong test). Trả về {w,h,cell}.
  function draw(ctx, map, state, maxW, maxH) {
    if (!ctx || !map) return null;
    var cell = cellSize(map, maxW, maxH);
    var w = map.w * cell, h = map.h * cell, x, y;
    for (y = 0; y < map.h; y++) for (x = 0; x < map.w; x++) {
      ctx.fillStyle = tileColor(map, x, y);
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
    var d = dots(map, state);
    function dot(p, color, r) {
      ctx.fillStyle = color;
      ctx.fillRect(p.x * cell - r, p.y * cell - r, cell + r * 2, cell + r * 2);
    }
    d.portals.forEach(function (p) { dot(p, COLORS.portal, 1); });
    d.npcs.forEach(function (p) { dot(p, COLORS.npc, 1); });
    d.monsters.forEach(function (p) { dot(p, COLORS.monster, 1); });
    if (d.player) {
      ctx.fillStyle = '#202020';
      ctx.fillRect(d.player.x * cell - 2, d.player.y * cell - 2, cell + 4, cell + 4);
      dot(d.player, COLORS.player, 1);
    }
    return { w: w, h: h, cell: cell };
  }

  // Trạng thái mở khóa của từng map thế giới:
  // current > visited > gated (kề nhưng thiếu cảnh giới) >
  // adjacent (kề, đủ điều kiện) > unknown (chưa tới, không kề).
  // rank: bậc cảnh giới người chơi (so với gate.rank của cổng).
  function worldList(maps, flags, currentId, rank) {
    var visited = visitedList(flags);
    var has = {};
    visited.forEach(function (id) { has[id] = 1; });
    if (currentId) has[currentId] = 1;
    rank = num(rank, 0);
    // id đích -> {rank, name} của cổng chặn mạnh nhất (rank cao nhất)
    // từ map đã tới. PHẢI lưu đối tượng ngay cả khi cổng không khóa
    // (gate null): lưu thẳng gate sẽ thành falsy và map kề bị rớt
    // thành "unknown" dù đã mở.
    var adjGate = {};
    function noteAdj(g) {
      if (!g.to) return;
      var gr = g.gate ? num(g.gate.rank, 0) : 0;
      if (!adjGate[g.to] || gr > adjGate[g.to].rank) {
        adjGate[g.to] = { rank: gr, name: g.gate ? (g.gate.name || null) : null };
      }
    }
    visited.forEach(function (srcId) {
      var src = maps ? maps[srcId] : null;
      if (!src) return;
      portalsOf(src).forEach(noteAdj);
    });
    if (currentId) {
      var cur = maps ? maps[currentId] : null;
      if (cur) portalsOf(cur).forEach(noteAdj);
    }
    return WORLD_IDS.filter(function (id) { return maps && maps[id]; }).map(function (id) {
      var mp = maps[id], status, gateName = null;
      if (id === currentId) status = 'current';
      else if (has[id]) status = 'visited';
      else if (adjGate[id]) {
        var need = num(adjGate[id].rank, 0);
        if (need > rank) { status = 'gated'; gateName = adjGate[id].name || null; }
        else status = 'adjacent';
      }
      else status = 'unknown';
      return { id: id, name: mp.name, status: status, gateName: gateName };
    });
  }

  var api = { WORLD_IDS: WORLD_IDS, COLORS: COLORS, ensure: ensure,
    markVisited: markVisited, visitedList: visitedList,
    tileColor: tileColor, portalsOf: portalsOf, dots: dots,
    cellSize: cellSize, draw: draw, worldList: worldList };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_MINIMAP = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
