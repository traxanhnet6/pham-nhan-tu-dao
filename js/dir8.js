// DIR8 — ENGINE 8 HƯỚNG (lệnh Bui 20:45 31/10: "Tất cả chuyển động
// tạo hình phải 8 hướng"). Chuẩn hoá vector di chuyển -> 8 sector,
// chọn sheet CHÉO THẬT khi asset có dải chéo, rơi về hướng chính theo
// quy tắc cố định khi chưa có. Module thuần (không DOM, không trạng
// thái toàn cục) — game.js dùng lúc chạy, test-smoke.js dùng lúc kiểm.
// Sơ đồ + bảng ánh xạ: previews/engine-8huong.png.
(function () {
  'use strict';

  // 8 sector theo chiều kim đồng hồ từ trục +x. Hệ màn hình: y XUỐNG
  // dưới nên góc atan2(dy,dx): right=0, down=+90, left=180, up=-90.
  var DIRS = ['right', 'down_right', 'down', 'down_left',
              'left', 'up_left', 'up', 'up_right'];
  var CENTER = { right: 0, down_right: 45, down: 90, down_left: 135,
                 left: 180, up_left: -135, up: -90, up_right: -45 };
  var DIAGONAL = { down_left: true, down_right: true,
                   up_left: true, up_right: true };
  // RƠI VỀ hướng chính khi asset chưa có dải chéo — QUY TẮC CỐ ĐỊNH:
  // hướng chéo lấy thành phần NGANG của nó (down_left->left,
  // down_right->right, up_left->left, up_right->right); hướng chính
  // giữ nguyên. Lý do: sheet profile đọc được sải chân đi ngang và
  // khớp quy ước view ngang hiện hành của quái/peer (trục ngang thắng
  // khi |vx| trội). KHÔNG đổi quy tắc này tuỳ tiện — test khoá cứng.
  var FALLBACK = { down: 'down', up: 'up', left: 'left', right: 'right',
                   down_left: 'left', down_right: 'right',
                   up_left: 'left', up_right: 'right' };
  // View của sheet QUÁI (từ vựng front/back/left/right): hướng chéo
  // lấy thành phần DỌC (down_*->front, up_*->back) vì sheet quái giàu
  // ở front/back. Chuẩn bị cho đợt sheet quái chéo — game.js CHƯA dùng
  // (vòng chọn view quái là hàm riêng, từ vựng riêng, xem báo cáo).
  var MONSTER_VIEW = { down: 'front', up: 'back',
                       left: 'left', right: 'right',
                       down_left: 'front', down_right: 'front',
                       up_left: 'back', up_right: 'back' };
  // Hysteresis: giữ sector cũ cho tới khi góc lệch khỏi TÂM sector cũ
  // quá 22.5 + HYST_DEG độ — chống giật hướng khi đi sát biên 45 độ.
  var HYST_DEG = 8;

  function isDir(d) {
    return Object.prototype.hasOwnProperty.call(CENTER, d);
  }
  function isDiagonal(d) { return !!DIAGONAL[d]; }
  function angleDeg(dx, dy) { return Math.atan2(dy, dx) * 180 / Math.PI; }
  function angDiff(a, b) {
    var d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  // Vector -> sector gần nhất (không hysteresis). Vector 0 -> null.
  function sectorOf(dx, dy) {
    if (!dx && !dy) return null;
    var idx = Math.round(angleDeg(dx, dy) / 45);
    idx = ((idx % 8) + 8) % 8;
    return DIRS[idx];
  }

  // Cập nhật hướng hiển thị có hysteresis: prev không hợp lệ -> 'down';
  // vector 0 (đứng yên) -> giữ nguyên prev.
  function update(prev, dx, dy) {
    if (!isDir(prev)) prev = 'down';
    if (!dx && !dy) return prev;
    if (angDiff(angleDeg(dx, dy), CENTER[prev]) <= 22.5 + HYST_DEG) {
      return prev;
    }
    return sectorOf(dx, dy) || prev;
  }

  function fallbackCardinal(d) { return FALLBACK[d] || 'down'; }
  // Chọn hướng sheet: có chéo thì dùng dir8, không thì rơi về FALLBACK.
  function resolve(d, hasDiag) { return hasDiag ? d : fallbackCardinal(d); }
  function monsterView(d) { return MONSTER_VIEW[d] || 'front'; }

  // ---- HERO: bộ chéo của look (data.diag do js/hero-ai.js nạp, phản
  // ánh assets/hero-ai/nv13-diag-manifest.json). Hiện chỉ look nu_nv13
  // có bộ chéo: set 'nu/nv13diag', 4 hướng chéo x 5 action
  // (idle/walk/slash1/slash2/slash3), 60 frame/dải, file tại
  // <tiers[level]>/<set>/<dir8>-<action>.png (cả Cao và Trung).
  function heroCaps(HAI, lookKey) {
    if (!HAI || !HAI.diag || !lookKey) return null;
    return HAI.diag[lookKey] || null;
  }
  // Chọn set cho (look, dir8, action): trả {dir, set, diag, frames}.
  // diag=true CHỈ khi look có dải chéo của đúng hướng + action đó;
  // còn lại dir/set là hướng chính rơi về theo FALLBACK.
  function heroSetFor(HAI, lookKey, dir8, action) {
    var caps = heroCaps(HAI, lookKey);
    if (caps && DIAGONAL[dir8] &&
        caps.directions.indexOf(dir8) >= 0 &&
        caps.actions.indexOf(action) >= 0) {
      return { dir: dir8, set: dir8 + '-' + action,
               diag: true, frames: caps.frames || 60 };
    }
    var c = fallbackCardinal(dir8);
    return { dir: c, set: c + '-' + action, diag: false, frames: 0 };
  }
  // Đường dẫn file dải chéo theo mức đồ hoạ (null nếu look không có).
  function heroDiagPath(HAI, level, lookKey, setName) {
    var caps = heroCaps(HAI, lookKey);
    if (!caps || !HAI.tiers || !HAI.tiers[level]) return null;
    return HAI.tiers[level] + '/' + caps.set + '/' + setName + '.png';
  }

  // ---- NPC: đường đọc sheet 8 hướng (ĐÃ wiring ở đợt tích hợp A) ----
  // 16 archetype mới (docs/npc-looks-design.md mục 3-4): mỗi archetype
  // có sheet idle 8 hướng tại assets/npcs-ai (Cao) / assets/npcs-md
  // (Trung): <archetype>/<huong>-idle.png, <huong> dạng GẠCH NGANG
  // (down, down-right, right, up-right, up, up-left, left, down-left)
  // — khác quy ước gạch dưới của hero. NPC8_ENABLED = true (tích hợp A,
  // 01/11/2026): game.js vẽ NPC bằng sheet archetype 8 hướng cho các
  // NPC có archetype (bảng archetypeOf trong js/npc-ai.js cho NPC mượn
  // sheet, hoặc sprite trùng tên archetype); NPC có sheet riêng giữ
  // nguyên đường cũ.
  var NPC8_ENABLED = true;
  var NPC8_ARCHETYPES = ['dan_nam', 'dan_nu', 'truong_lao', 'lao_nu',
    'thuong_nam', 'thuong_nu', 'tho_san', 'tho_san_nu', 'ngu_nu',
    'de_tu_nam', 'de_tu_nu', 'linh_gac', 'tong_chu_nam', 'tong_chu_nu',
    'dao_si', 'dao_co'];
  var NPC_TOKEN = { down_left: 'down-left', down_right: 'down-right',
                    up_left: 'up-left', up_right: 'up-right' };
  function npcToken(dir8) { return NPC_TOKEN[dir8] || dir8; }
  // Đường dẫn sheet idle 8 hướng của archetype; null khi cờ chưa bật,
  // archetype không thuộc bộ mới, hoặc tham số sai.
  function npcSheetPath(NAI, level, archetype, dir8) {
    if (!NPC8_ENABLED) return null;
    if (!NAI || !NAI.tiers || !NAI.tiers[level]) return null;
    if (NPC8_ARCHETYPES.indexOf(archetype) < 0 || !isDir(dir8)) {
      return null;
    }
    return NAI.tiers[level] + '/' + archetype + '/' +
           npcToken(dir8) + '-idle.png';
  }

  var api = {
    DIRS: DIRS, CENTER: CENTER, DIAGONAL: DIAGONAL,
    FALLBACK: FALLBACK, MONSTER_VIEW: MONSTER_VIEW,
    HYST_DEG: HYST_DEG,
    isDir: isDir, isDiagonal: isDiagonal,
    sectorOf: sectorOf, update: update,
    fallbackCardinal: fallbackCardinal, resolve: resolve,
    monsterView: monsterView,
    heroCaps: heroCaps, heroSetFor: heroSetFor,
    heroDiagPath: heroDiagPath,
    NPC8_ENABLED: NPC8_ENABLED, NPC8_ARCHETYPES: NPC8_ARCHETYPES,
    npcToken: npcToken, npcSheetPath: npcSheetPath
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else if (typeof window !== 'undefined') {
    window.PNT_DIR8 = api;
  }
})();
