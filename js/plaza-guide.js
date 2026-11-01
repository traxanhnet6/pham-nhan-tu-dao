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
  // targetOverride (tham số thứ 8, QA110 đợt 2): ô đích tạm để
  // mũi tên chỉ theo — game.js truyền điểm nhìn trước trên tuyến
  // đường thật (routeLookahead) để mũi tên dẫn theo đường vòng
  // thay vì đích cuối. Luật tắt (sai map / đã bái nhập / đã vào
  // sân) vẫn xét theo quảng trường thật. Không truyền thì giữ
  // nguyên hành vi cũ: chỉ thẳng về tâm cụm cổng.
  function arrowFor(map, mapId, sectJoined, playerTile, camPx, viewPx, tilePx, targetOverride) {
    if (!map || mapId !== 'map3' || sectJoined) return null;
    var target = targetOverride || plazaTarget(map);
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
    return { target: target, routed: !!targetOverride, onScreen: onScreen, angle: angle, ex: ex, ey: ey, txPx: txPx, tyPx: tyPx };
  }
  // Hình học NHÃN đi kèm mũi tên rìa màn hình (mục 110, 01/11/2026).
  // Lỗi cũ trong game.js: nhãn vẽ tại (ex − 62) cố định — khi mũi tên kẹp
  // ở rìa trái (ex = 30) tọa độ chữ thành −32 nên nhãn bị cắt mất một
  // phần, ở rìa phải thì chữ tràn khỏi màn hình; đó là một lý do mũi tên
  // "không xuất hiện" trong ảnh playtest dù logic đúng. Hàm này trả về
  // tọa độ GÓC TRÁI của dòng chữ (game.js vẽ với textAlign = 'left' và
  // bề rộng chữ đo thật bằng measureText truyền vào): chữ luôn nằm trọn
  // trong màn hình, chừa lề 4px hai phía; chiều dọc giữ luật cũ (đích ở
  // nửa dưới màn hình thì nhãn nằm dưới mũi tên +26, ngược lại −22) rồi
  // kẹp vào [16, h − 6].
  function labelLayout(info, viewPx, textW) {
    if (!info || !viewPx) return null;
    var w = Math.max(0, Math.round(textW || 0));
    var lx = Math.round(info.ex - w / 2);
    lx = Math.max(4, Math.min(Math.max(4, viewPx.w - w - 4), lx));
    var ly = info.ey + (info.tyPx > viewPx.h / 2 ? 26 : -22);
    ly = Math.max(16, Math.min(viewPx.h - 6, ly));
    return { x: lx, y: ly, w: w };
  }
  // ==========================================================
  // QA110 ĐỢT 2 (01/11/2026) — hai sửa từ nghiệm thu chơi thật:
  // (A) VÙNG AN TOÀN TRÁNH KHUNG HTML PHỦ TRÊN CANVAS. Đợt 1 chỉ
  // kẹp nhãn trong khung canvas, nhưng khung thông tin nhân vật
  // (góc trên-trái), thẻ nhiệm vụ, bản đồ nhỏ, dải sự kiện giữa-trên
  // là các phần tử HTML nằm TRÊN canvas (z-index cao hơn): nhãn nằm
  // gọn trong canvas vẫn bị chúng che mất phần đầu ("…ảng Trường
  // Sơn Môn"). Kiểm tra đơn vị đợt 1 không bắt được vì nó mô phỏng
  // canvas trống, không có hình chữ nhật phủ nào. Các hàm dưới đây
  // thuần: nhận danh sách hình chữ nhật bị phủ (đo từ DOM thật ở
  // game.js, quy về tọa độ vẽ) và trả vị trí có diện tích giao = 0
  // khi còn chỗ; cạn chỗ thì trả vị trí giao ÍT NHẤT kèm số giao
  // thật trong trường overlap (không giấu).
  // (B) DẪN ĐƯỜNG THEO TUYẾN ĐƯỜNG THẬT thay cho đường chim bay:
  // tìm đường BFS trên lưới ô (loại ô cổng — dẫm lên là dịch
  // chuyển map) tới điểm tiếp cận phía nam quảng trường, mũi tên
  // chỉ về điểm nhìn trước 5–8 ô trên tuyến nên người chơi đi theo
  // đường đất vòng thay vì đâm thẳng vào rừng.
  // ==========================================================
  function rectsOverlapArea(a, b) {
    if (!a || !b) return 0;
    var x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return (x > 0 && y > 0) ? x * y : 0;
  }
  function totalOverlap(rect, occluders) {
    var s = 0, i;
    if (!occluders) return 0;
    for (i = 0; i < occluders.length; i++) s += rectsOverlapArea(rect, occluders[i]);
    return s;
  }
  // Hộp nhãn đúng như game.js vẽ: nền (x-4, y-15, w+8, 21) quanh
  // baseline (x, y). Mọi tính giao đều dùng hộp này.
  function labelBox(lx, ly, textW) {
    return { x: lx - 4, y: ly - 15, w: textW + 8, h: 21 };
  }
  function clampLabelPos(lx, ly, viewPx, textW) {
    var x = Math.max(4, Math.min(Math.max(4, viewPx.w - textW - 4), Math.round(lx)));
    var y = Math.max(16, Math.min(viewPx.h - 6, Math.round(ly)));
    return { x: x, y: y };
  }
  // labelSafeLayout(info, viewPx, textW, textH, occluders):
  // vị trí baseline cho nhãn, ưu tiên vị trí ưa thích của
  // labelLayout; nếu bị phủ thì dò các ứng viên quanh mũi tên ở
  // khoảng cách tăng dần (8 hướng × 4 vòng) và 4 góc màn hình,
  // chọn giao nhỏ nhất, hòa thì gần vị trí ưa thích nhất.
  // Trả { x, y, w, box, overlap, displaced } — displaced = lệch
  // khỏi vị trí ưa thích > 1px (game.js vẽ nét đứt nối khi lệch xa).
  function labelSafeLayout(info, viewPx, textW, textH, occluders) {
    if (!info || !viewPx) return null;
    var w = Math.max(0, Math.round(textW || 0));
    var pref = labelLayout(info, viewPx, w);
    if (!pref) return null;
    var occ = occluders || [];
    function score(lx, ly) {
      var box = labelBox(lx, ly, w);
      return { x: lx, y: ly, w: w, box: box, overlap: totalOverlap(box, occ) };
    }
    var best = score(pref.x, pref.y);
    best.displaced = 0;
    if (best.overlap > 0) {
      var dists = [40, 64, 96, 140], di, ai, cand, dPref;
      var bestScore = best.overlap, bestDist = 0;
      function consider(lx, ly) {
        var p = clampLabelPos(lx, ly, viewPx, w);
        var s = score(p.x, p.y);
        var dd = Math.abs(p.x - pref.x) + Math.abs(p.y - pref.y);
        if (s.overlap < bestScore || (s.overlap === bestScore && dd < bestDist)) {
          best = s; bestScore = s.overlap; bestDist = dd; best.displaced = dd;
        }
      }
      for (di = 0; di < dists.length; di++) {
        for (ai = 0; ai < 8; ai++) {
          var ang = ai * Math.PI / 4;
          cand = clampLabelPos(info.ex + Math.cos(ang) * dists[di] - w / 2, info.ey + Math.sin(ang) * dists[di] + 5, viewPx, w);
          consider(cand.x, cand.y);
        }
        if (bestScore === 0) break;
      }
      if (bestScore > 0) {
        // Góc màn hình làm bến cuối: nhiều khi cả vùng quanh mũi tên
        // đều bị phủ nhưng góc xa vẫn trống.
        consider(4, 16); consider(viewPx.w - w - 4, 16);
        consider(4, viewPx.h - 6); consider(viewPx.w - w - 4, viewPx.h - 6);
        consider(viewPx.w / 2 - w / 2, 16); consider(viewPx.w / 2 - w / 2, viewPx.h - 6);
      }
      if (bestScore > 0 || best.displaced > 160) {
        // Quét lưới toàn khung (bước 8px): dải trên cùng của màn
        // hình thật bị khung nhân vật + dải sự kiện + bản đồ nhỏ
        // chia nhỏ, vòng quanh mũi tên không luôn có ô trống —
        // lưới toàn khung tìm được khe hẹp giữa các khung phủ,
        // gần vị trí ưa thích hơn bến góc xa.
        var gx, gy;
        for (gy = 16; gy <= viewPx.h - 6; gy += 8) {
          for (gx = 4; gx <= viewPx.w - w - 4; gx += 8) consider(gx, gy);
        }
      }
      dPref = Math.abs(best.x - pref.x) + Math.abs(best.y - pref.y);
      best.displaced = dPref;
    }
    return best;
  }
  // arrowSafePos(info, viewPx, occluders, radius): nếu vòng tròn
  // nền của mũi tên (bán kính radius quanh ex,ey) giao khung phủ
  // thì trượt tới điểm gần nhất không giao (dò vòng quanh vị trí
  // gốc, khoảng cách tăng dần); cạn chỗ thì trả điểm giao ít nhất
  // kèm overlap thật. Góc chỉ hướng (info.angle) KHÔNG đổi — chỉ
  // dời chỗ đứng của mũi tên.
  function arrowSafePos(info, viewPx, occluders, radius) {
    if (!info || !viewPx) return null;
    var r = radius || 20;
    var occ = occluders || [];
    function boxAt(x, y) { return { x: x - r, y: y - r, w: r * 2, h: r * 2 }; }
    function clampPt(x, y) {
      return {
        x: Math.max(r + 2, Math.min(viewPx.w - r - 2, Math.round(x))),
        y: Math.max(r + 2, Math.min(viewPx.h - r - 2, Math.round(y)))
      };
    }
    var home = clampPt(info.ex, info.ey);
    var homeOv = totalOverlap(boxAt(home.x, home.y), occ);
    if (homeOv === 0) return { x: home.x, y: home.y, overlap: 0, moved: 0 };
    var dists = [26, 44, 70, 104, 148, 200, 260], di, ai;
    var best = { x: home.x, y: home.y, overlap: homeOv, moved: 0 }, bestDist = 0;
    function considerPt(p) {
      var ov = totalOverlap(boxAt(p.x, p.y), occ);
      var dd = Math.abs(p.x - home.x) + Math.abs(p.y - home.y);
      if (ov < best.overlap || (ov === best.overlap && dd < bestDist)) {
        best = { x: p.x, y: p.y, overlap: ov, moved: dd }; bestDist = dd;
      }
    }
    for (di = 0; di < dists.length; di++) {
      for (ai = 0; ai < 16; ai++) {
        var ang = ai * Math.PI / 8;
        considerPt(clampPt(info.ex + Math.cos(ang) * dists[di], info.ey + Math.sin(ang) * dists[di]));
      }
      if (best.overlap === 0) break;
    }
    if (best.overlap > 0) {
      // Quét lưới toàn khung (bước 10px): khe trống giữa các khung
      // phủ ở dải trên thường hẹp và lệch hẳn khỏi vòng quanh vị
      // trí gốc (ví dụ phải trượt dọc mép trên qua khỏi khung
      // nhân vật mới có chỗ cho vòng tròn nền của mũi tên).
      var gx, gy;
      for (gy = r + 2; gy <= viewPx.h - r - 2; gy += 10) {
        for (gx = r + 2; gx <= viewPx.w - r - 2; gx += 10) considerPt({ x: gx, y: gy });
      }
    }
    return best;
  }
  // ---- Tìm đường theo tuyến thật trên lưới ô ----
  function portalSetOf(map) {
    var s = {};
    (map.portals || []).forEach(function (p) { s[p.x + ',' + p.y] = 1; });
    return s;
  }
  function makeWalk(map, isBlocked) {
    var W = map.w || 0, H = map.h || 0, portals = portalSetOf(map);
    return function (x, y) {
      if (x < 0 || y < 0 || x >= W || y >= H) return false;
      if (portals[x + ',' + y]) return false; // ô cổng: dẫm lên là sang map khác
      return !isBlocked(map, x, y);
    };
  }
  // bfsRoute(map, start, goal, isBlocked): đường 4 hướng ngắn nhất
  // từ start tới goal, mọi ô đều đi được và không phải ô cổng.
  // goal không đứng được (ví dụ tâm cụm cổng) thì lấy ô đi được
  // gần nhất trong vòng 4 ô Chebyshev. Trả mảng [{x,y}...] gồm cả
  // đầu và cuối, hoặc null khi không có đường.
  function bfsRoute(map, start, goal, isBlocked) {
    if (!map || !start || !goal || typeof isBlocked !== 'function') return null;
    var walk = makeWalk(map, isBlocked);
    var gx = goal.x, gy = goal.y, ring, dx, dy;
    if (!walk(gx, gy)) {
      var found = null;
      for (ring = 1; ring <= 4 && !found; ring++) {
        for (dx = -ring; dx <= ring && !found; dx++) {
          for (dy = -ring; dy <= ring; dy++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
            if (walk(gx + dx, gy + dy)) { found = { x: gx + dx, y: gy + dy }; break; }
          }
        }
      }
      if (!found) return null;
      gx = found.x; gy = found.y;
    }
    var W = map.w, prev = {}, seen = {}, queue = [{ x: start.x, y: start.y }], head = 0, hit = null;
    seen[start.x + ',' + start.y] = 1;
    while (head < queue.length) {
      var cur = queue[head++];
      if (cur.x === gx && cur.y === gy) { hit = cur; break; }
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) {
        var nx = cur.x + dirs[i][0], ny = cur.y + dirs[i][1], k = nx + ',' + ny;
        if (seen[k] || !walk(nx, ny)) continue;
        seen[k] = 1; prev[k] = cur; queue.push({ x: nx, y: ny });
      }
    }
    if (!hit) return null;
    var path = [], c = hit;
    while (c) { path.push({ x: c.x, y: c.y }); c = prev[c.x + ',' + c.y]; }
    return path.reverse();
  }
  // plazaApproach(map, isBlocked): điểm tiếp cận phía nam quảng
  // trường — suy từ dữ liệu cổng thật: cột của tâm cụm cổng, 5 ô
  // phía nam của mép nam sân (đúng điểm (111,110) trên lưới hiện
  // tại); ô đó không đứng được thì lấy ô đi được gần nhất trong
  // vòng 6 ô. Trả null khi không suy được.
  function plazaApproach(map, isBlocked) {
    if (!map || typeof isBlocked !== 'function') return null;
    var target = plazaTarget(map), rect = plazaRect(map);
    if (!target || !rect) return null;
    var walk = makeWalk(map, isBlocked);
    var cx = target.x, cy = rect.y1 + 5;
    if (walk(cx, cy)) return { x: cx, y: cy };
    var ring, dx, dy, best = null, bestD = Infinity;
    for (ring = 1; ring <= 6; ring++) {
      for (dx = -ring; dx <= ring; dx++) {
        for (dy = -ring; dy <= ring; dy++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
          if (!walk(cx + dx, cy + dy)) continue;
          var dd = dx * dx + dy * dy;
          if (dd < bestD) { bestD = dd; best = { x: cx + dx, y: cy + dy }; }
        }
      }
      if (best) return best;
    }
    return null;
  }
  // plazaRoute(map, start, isBlocked): tuyến đường thật từ ô
  // người chơi tới điểm tiếp cận quảng trường. Trả { path, goal }
  // hoặc null (đích không tới được — nơi gọi rơi về chỉ hướng
  // thẳng như cũ).
  function plazaRoute(map, start, isBlocked) {
    var goal = plazaApproach(map, isBlocked);
    if (!goal) return null;
    var path = bfsRoute(map, start, goal, isBlocked);
    if (!path) return null;
    return { path: path, goal: goal };
  }
  // routeLookahead(path, fromTile, hintIndex, ahead): tìm vị trí
  // của người chơi trên tuyến (dò quanh chỉ số gợi ý trước, lệch
  // quá xa mới quét toàn tuyến) rồi trả ô nhìn trước `ahead` ô —
  // đích tạm để mũi tên chỉ theo. Trả { index, tile, endDist }.
  function routeLookahead(path, fromTile, hintIndex, ahead) {
    if (!path || !path.length || !fromTile) return null;
    var n = path.length, i, best = -1, bestD = Infinity, d;
    var h = (typeof hintIndex === 'number' && hintIndex >= 0 && hintIndex < n) ? Math.round(hintIndex) : 0;
    var lo = Math.max(0, h - 24), hi = Math.min(n - 1, h + 24);
    for (i = lo; i <= hi; i++) {
      d = Math.max(Math.abs(path[i].x - fromTile.x), Math.abs(path[i].y - fromTile.y));
      if (d < bestD) { bestD = d; best = i; }
    }
    if (bestD > 24) {
      for (i = 0; i < n; i++) {
        d = Math.max(Math.abs(path[i].x - fromTile.x), Math.abs(path[i].y - fromTile.y));
        if (d < bestD) { bestD = d; best = i; }
      }
    }
    var li = Math.min(n - 1, best + (ahead || 7));
    return { index: best, tile: path[li], endDist: (n - 1) - best };
  }
  var api = {
    gatesOf: gatesOf, plazaRect: plazaRect, plazaTarget: plazaTarget,
    inPlaza: inPlaza, southDrop: southDrop, arrowFor: arrowFor,
    labelLayout: labelLayout,
    rectsOverlapArea: rectsOverlapArea, totalOverlap: totalOverlap,
    labelSafeLayout: labelSafeLayout, arrowSafePos: arrowSafePos,
    bfsRoute: bfsRoute, plazaApproach: plazaApproach,
    plazaRoute: plazaRoute, routeLookahead: routeLookahead
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (global) global.PNT_PLAZA_GUIDE = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
