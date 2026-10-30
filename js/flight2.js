// Phàm Nhân Tu Đạo — NGỰ PHÁP BẢO + NGỰ LINH THÚ (mục 27 hàng chờ).
// Hai chế độ bay còn lại, cùng với ngự kiếm (js/flight.js) thành đủ 3 chế
// độ bay DUY NHẤT được phép của game (lệnh cứng: bay CHỈ ở 3 chế độ ngự).
// Mọi chế độ dùng CHUNG khung của ngự kiếm: tốc độ ×1,8 (FLIGHT.SPEED_MULT),
// va chạm theo chiều cao (FLIGHT.FLY_BLOCKED), cổng chỉ kích hoạt khi đã
// hạ xuống đất đi bộ (game.js chỉ gọi checkPortal khi !flying), vào chiến
// đấu / nói chuyện / hái / thổ nạp / ra chiêu thì tự hạ (các điểm gọi
// landPlayer sẵn có). Module này chỉ giữ luật thuần, game.js thi hành.
//
// CỔNG MỞ (quyết ở lượt này, theo story-bible mục 24):
// - Cả 3 chế độ đều cần TRÚC CƠ trở lên (realmRank >= 2): Luyện Khí linh
//   lực còn mỏng, nâng được vật thì không nâng nổi người — lý do này của
//   ngự kiếm áp y hệt cho pháp bảo và linh thú.
// - Ngự kiếm cần thêm chuỗi tông (flags.swordFlight) vì đó là PHÉP TRUYỀN
//   của tông. Hai chế độ mới KHÔNG cần chuỗi đó (không thì chúng chỉ là
//   bản sao vô nghĩa của ngự kiếm): chúng cần VẬT CƯỠI đủ chuẩn của riêng
//   mình, người chơi tự có từ trước:
//   + Ngự pháp bảo: sở hữu 1 pháp khí (kind 'phap', KHÔNG tính bảo vật
//     'bao' đeo bị động) phẩm Địa trở lên (grade rank >= 3) — đúng 4 món
//     trong danh mục artifacts.js hiện có: Phi Kiếm Bảo, Ấn Trấn Sơn,
//     Thiên La Địa Võng, Định Hải Thần Châu. Không thêm món mới, không
//     đổi giá/thưởng (economy.md không cần sửa).
//   + Ngự linh thú: linh thú XUẤT CHIẾN hiện tại có mountable=true VÀ
//     move='fly' — đúng 9 loài trong pets.js hiện có (đính chính số "8
//     loài" trong hàng chờ: dữ liệu hiện tại có 11 loài mountable, trong
//     đó 9 loài bay được; 2 loài mountable còn lại đi bộ — Đạp Vân Linh
//     Câu (quad/walk) và Kỳ Lân Con (quad/walk) — không tính vì cưỡi
//     chúng thì vẫn là đi bộ, không phải bay).
// - Khi đang bay thử Q3 của ngự kiếm (flyTrial), chỉ chế độ kiếm được bay;
//   bài bay thử bắt buộc chuyển flyMode về 'sword' (game.js).
(function () {
  'use strict';
  var MODES = [
    { id: 'sword', name: 'Ngự Kiếm', short: 'Kiếm' },
    { id: 'artifact', name: 'Ngự Pháp Bảo', short: 'Pháp Bảo' },
    { id: 'pet', name: 'Ngự Linh Thú', short: 'Linh Thú' }
  ];
  var REQUIRED_RANK = 2; // Trúc Cơ, cùng thang REALMS của js/maps.js
  var GRADE_RANK = { pham: 0, linh: 1, huyen: 2, dia: 3, thien: 4 };
  function modeDef(id) {
    for (var i = 0; i < MODES.length; i++) if (MODES[i].id === id) return MODES[i];
    return null;
  }
  function modeName(id) { var d = modeDef(id); return d ? d.name : 'Ngự Kiếm'; }
  function validMode(id) { return !!modeDef(id); }
  // Pháp bảo bay được: pháp khí phẩm Địa+ (bảo vật bị động không cưỡi được).
  function artifactFlyable(def) {
    if (!def || def.kind !== 'phap') return false;
    return (GRADE_RANK[def.grade] || 0) >= 3;
  }
  // defs: mảng def pháp bảo/bảo vật người chơi đang sở hữu.
  function findFlyableArtifact(defs) {
    if (!defs) return null;
    for (var i = 0; i < defs.length; i++) if (artifactFlyable(defs[i])) return defs[i];
    return null;
  }
  // Linh thú cưỡi bay được: loài lớn biết bay, đang xuất chiến mới tính
  // (game.js truyền species của activePet; loài không xuất chiến thì null).
  function petFlyable(species) {
    if (!species) return false;
    return !!species.mountable && species.move === 'fly';
  }
  // ctx: { rank, swordFlight, flyableArtifact (def|null), activePetSpecies }
  function modeUnlocked(mode, ctx) {
    if (!ctx) return false;
    if (mode === 'sword') return !!ctx.swordFlight;
    if (mode === 'artifact') return !!ctx.flyableArtifact;
    if (mode === 'pet') return petFlyable(ctx.activePetSpecies);
    return false;
  }
  function modeReason(mode, ctx) {
    if (!ctx) return 'no_ctx';
    if ((ctx.rank || 0) < REQUIRED_RANK) return 'not_realm';
    if (mode === 'sword') return ctx.swordFlight ? null : 'not_sword';
    if (mode === 'artifact') return ctx.flyableArtifact ? null : 'no_artifact';
    if (mode === 'pet') return petFlyable(ctx.activePetSpecies) ? null : 'no_pet';
    return 'bad_mode';
  }
  function canFlyMode(mode, ctx) { return modeReason(mode, ctx) === null; }
  function unlockedModes(ctx) {
    return MODES.filter(function (m) { return modeUnlocked(m.id, ctx); }).map(function (m) { return m.id; });
  }
  // Đổi kiểu bay: xoay vòng trong các chế độ ĐÃ MỞ; chưa mở chế độ nào
  // ngoài chế độ hiện tại thì giữ nguyên (không nhảy sang chế độ khóa).
  function nextMode(current, ctx) {
    var unlocked = unlockedModes(ctx);
    if (!unlocked.length) return validMode(current) ? current : 'sword';
    var idx = unlocked.indexOf(current);
    if (idx < 0) return unlocked[0];
    return unlocked[(idx + 1) % unlocked.length];
  }
  var api = {
    MODES: MODES, REQUIRED_RANK: REQUIRED_RANK, GRADE_RANK: GRADE_RANK,
    modeDef: modeDef, modeName: modeName, validMode: validMode,
    artifactFlyable: artifactFlyable, findFlyableArtifact: findFlyableArtifact,
    petFlyable: petFlyable, modeUnlocked: modeUnlocked, modeReason: modeReason,
    canFlyMode: canFlyMode, unlockedModes: unlockedModes, nextMode: nextMode
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_FLIGHT2 = api;
})();
