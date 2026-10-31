// ============================================================
// DẪN ĐƯỜNG TỚI QUẢNG TRƯỜNG SƠN MÔN MAP 3 — mục 108 hàng chờ
// (KHẨN, lệnh Bui 17:02 ngày 2026-10-31; cụ thể hoá "chỉ đường
// xuyên map" trong docs/player-qa.md 13:20 31/10).
//
// VẤN ĐỀ GỐC: qua 5 lượt playtest, người test lạc nhiều lần trên
// đường điểm rơi nam → quảng trường cổng sơn môn dù đường thông
// suốt, vì game không có bất kỳ chỉ dẫn nào trong map 3.
//
// LƯU Ý TOẠ ĐỘ: mục 108 ghi tọa độ theo khung TRƯỚC mở rộng V7
// (điểm rơi (71,118), quảng trường x63–79/y60–68, đích (71,63)).
// Khung hiện tại của map 3 là 240×210 sau mở rộng V7 (neo +40,+35
// so với khung đó): cụm 10 cổng sơn môn nằm ở x103–119/y95–103,
// đích tương đương là tâm cụm cổng. Vì vậy module này KHÔNG hardcode
// tọa độ cũ — mọi điểm đều suy từ dữ liệu portals thật của maps.js
// (cổng sonmon_*), nên lần mở rộng map sau vẫn đúng. Biển dẫn đường
// cũng đặt bằng thuật toán BFS trên lưới thật trong khối cuối
// js/maps.js (không hardcode ô), nhãn biển theo hướng đi thật tới
// quảng trường.
//
// LUẬT (chỉ hiển thị, không đổi cổng/khóa/thưởng/tile/spawn/quái):
// - Chỉ ở map 3 và chỉ khi chưa bái nhập tông nào (flags.sectJoined
//   trống): người đã bái nhập biết đường về sơn môn của mình rồi.
// - Vào trong sân quảng trường (bbox cụm cổng mở rộng 2 ô mỗi phía)
//   thì tắt — người chơi đã tới nơi, không cần mũi tên nữa.
// - Đích ở trong màn hình: tam giác vàng nhấp nháy phía trên đích
//   (cùng ngôn ngữ mũi tên chỉ đường nhiệm vụ đã có).
// - Đích ngoài màn hình: mũi tên xoay theo hướng đích, kẹp ở rìa
//   màn hình kèm nhãn "Quảng Trường Sơn Môn" — khác với mũi tên
//   nhiệm vụ cũ (chỉ vẽ khi đích trong màn hình).
// - Module thuần logic, test bằng Node không cần DOM: game.js chỉ
//   nối vẽ qua guard PLZ như các module trước.
// ============================================================
(function (global) {
  'use strict';
  function gatesOf(map) {
    if (!map || !map.portals) return [];
    return map.portals.filter(function (p) { return p.to && p.to.indexOf('sonmon_') === 0; });
  }
  function plazaRect(map) {
    var g = gatesOf(map);
    if (!g.length) return null;
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, i;
    for (i = 0; i < g.length; i++) {
      if (g[i].x < x0) x0 = g[i].x;
      if (g[i].y < y0) y0 = g[i].y;
      if (g[i].x > x1) x1 = g[i].x;
      if (g[i].y > y1) y1 = g[i].y;
    }
    // Sân quảng trường = bbox cụm cổng mở rộng 2 ô mỗi phía (mục 108:
    // sân y58–68 quanh cụm y60–68 ở khung cũ = mở rộng phía bắc 2 ô;
    // mở đều 4 phía cho mọi hướng tiếp cận đều tắt đúng lúc).
    return { x0: x0 - 2, y0: y0 - 2, x1: x1 + 2, y1: y1 + 2 };
  }
  function plazaTarget(map) {
    var g = gatesOf(map);
    if (!g.length) return null;
    var sx = 0, sy = 0, i;
    for (i = 0; i < g.length; i++) { sx += g[i].x; sy += g[i].y; }
    return { x: Math.round(sx / g.length), y: Math.round(sy / g.length) };
  }
  function inPlaza(map, tx, ty) {
    var r = plazaRect(map);
    if (!r) return false;
    return tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1;
  }
  // Điểm rơi nam vào map 3 (từ làng): cổng map1→map3 có tx,ty;
  // lấy ô giữa của dải (tránh mép dải). Dùng cho test/BFS, không
  // dùng trong vẽ mũi tên (vẽ chỉ cần đích quảng trường).
  function southDrop(maps) {
    if (!maps || !maps.map1 || !maps.map1.portals) return null;
    var ps = maps.map1.portals.filter(function (p) { return p.to === 'map3'; })
      .sort(function (a, b) { return a.x - b.x || a.y - b.y; });
    if (!ps.length) return null;
    var mid = ps[Math.floor(ps.length / 2)];
    return { x: mid.tx, y: mid.ty };
  }
  // Hình học mũi tên. playerTile: ô người chơi; camPx: góc camera
  // theo pixel; viewPx: khung nhìn hiệu dụng (đã chia zoom); tilePx
  // thường là 32. Trả null khi không nên vẽ (sai map / đã bái nhập /
  // đã vào sân / không có cổng sơn môn).
  function arrowFor(map, mapId, sectJoined, playerTile, camPx, viewPx, tilePx) {
    if (!map || mapId !== 'map3' || sectJoined) return null;
    var target = plazaTarget(map);
    if (!target) return null;
    if (inPlaza(map, playerTile.x, playerTile.y)) return null;
    var txPx = target.x * tilePx + tilePx / 2 - camPx.x;
    var tyPx = target.y * tilePx - camPx.y;
    var onScreen = txPx >= 0 && txPx <= viewPx.w && tyPx >= 0 && tyPx <= viewPx.h;
    var angle = Math.atan2(tyPx - viewPx.h / 2, txPx - viewPx.w / 2);
    var ex = txPx, ey = tyPx;
    if (!onScreen) {
      // Kẹp vào rìa màn hình, chừa 30px để tam giác + nhãn không
      // bị cắt; góc vẫn trỏ đúng hướng đích.
      ex = Math.max(30, Math.min(viewPx.w - 30, txPx));
      ey = Math.max(30, Math.min(viewPx.h - 30, tyPx));
    }
    return { target: target, onScreen: onScreen, angle: angle, ex: ex, ey: ey, txPx: txPx, tyPx: tyPx };
  }
  var api = {
    gatesOf: gatesOf, plazaRect: plazaRect, plazaTarget: plazaTarget,
    inPlaza: inPlaza, southDrop: southDrop, arrowFor: arrowFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (global) global.PNT_PLAZA_GUIDE = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
