// ============================================================
// THÀNH TỰU SỚM — ACHIEVEMENTS (lệnh Bui 20:22 ngày 2026-10-30)
// ~12 mốc đầu đời để 5 phút đầu có mục tiêu + quà ngay. Mốc tính
// từ DỮ LIỆU SẴN CÓ (đồ giám/bestiary, cờ sự kiện, trạng thái nhân
// vật) do game.js gom vào ctx — module này THUẦN kiểm tra + ghi sổ
// flags.ach.<id> = mốc thời gian đạt. Mỗi mốc chỉ bắn 1 lần (đã có
// trong flags.ach thì không bao giờ bắn lại, kể cả nạp lại save).
// Thưởng: chỉ vật phẩm cơ bản (không Linh Thạch), tổng cả sổ quy
// đổi < ~150 LT theo trần đầu phiên ở docs/economy.md; game.js là
// bên cộng vật phẩm qua L.addItem như mọi đường thưởng khác.
// ============================================================
(function (global) {
  'use strict';

  var DEFS = [
    { id: 'first_kill', name: 'Hạ quái đầu tiên', desc: 'Hạ con quái đầu tiên ngoài bãi.', test: function (c) { return c.kills >= 1; }, reward: { thao_duoc: 1 } },
    { id: 'first_herb', name: 'Hái dược đầu tiên', desc: 'Hái cây dược liệu đầu tiên.', test: function (c) { return !!c.herb; }, reward: { hat_thao_duoc: 1 } },
    { id: 'first_quest', name: 'Hoàn thành nhiệm vụ đầu tiên', desc: 'Trả xong một nhiệm vụ bất kỳ.', test: function (c) { return c.questsDone >= 1; }, reward: null },
    { id: 'root_reveal', name: 'Lộ linh căn', desc: 'Giếng cổ soi ra linh căn của bạn.', test: function (c) { return !!c.root; }, reward: { tu_linh_dan: 1 } },
    { id: 'luyen_khi_1', name: 'Bước vào Luyện Khí', desc: 'Đột phá Luyện Khí tầng 1.', test: function (c) { return c.tier >= 1; }, reward: { hoi_xuan_dan: 1 } },
    { id: 'first_pet', name: 'Linh thú đầu tiên', desc: 'Thu phục linh thú đầu tiên.', test: function (c) { return c.pets >= 1; }, reward: null },
    { id: 'first_realm', name: 'Vào bí cảnh lần đầu', desc: 'Bước vào một bí cảnh bất kỳ.', test: function (c) { return c.realmsEntered >= 1; }, reward: null },
    { id: 'first_elite', name: 'Hạ quái tinh anh', desc: 'Hạ một con quái tinh anh.', test: function (c) { return !!c.elite; }, reward: null },
    { id: 'first_boss', name: 'Hạ boss thế giới', desc: 'Hạ một boss thế giới.', test: function (c) { return c.bosses >= 1; }, reward: { linh_chi: 1 } },
    { id: 'first_gift', name: 'Dùng giftcode đầu tiên', desc: 'Nhập một mã quà bất kỳ.', test: function (c) { return c.gifts >= 1; }, reward: null },
    { id: 'first_companion', name: 'Bạn đồng hành đầu tiên', desc: 'Chiêu mộ một đệ tử đi cùng.', test: function (c) { return !!c.companion; }, reward: null },
    { id: 'sect_join', name: 'Bái nhập tông môn', desc: 'Chính thức vào một tông môn.', test: function (c) { return !!c.sect; }, reward: null }
  ];

  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (!flags.ach || typeof flags.ach !== 'object') flags.ach = {};
    return flags.ach;
  }
  // Trả danh sách mốc MỚI đạt trong lần kiểm này (đã ghi sổ).
  function check(ch, flags, qs, ctx, now) {
    var ach = ensure(flags);
    if (!ach || !ctx) return [];
    var t = (typeof now === 'number') ? now : Date.now();
    var fresh = [];
    DEFS.forEach(function (d) {
      if (ach[d.id]) return;
      var ok = false;
      try { ok = !!d.test(ctx); } catch (e) { ok = false; }
      if (ok) { ach[d.id] = t; fresh.push(d); }
    });
    return fresh;
  }
  function list(flags) {
    var ach = ensure(flags) || {};
    return DEFS.map(function (d) {
      return { id: d.id, name: d.name, desc: d.desc, done: !!ach[d.id], at: ach[d.id] || 0, reward: d.reward };
    });
  }
  function defById(id) {
    for (var i = 0; i < DEFS.length; i++) if (DEFS[i].id === id) return DEFS[i];
    return null;
  }

  var api = { DEFS: DEFS, check: check, list: list, defById: defById, ensure: ensure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_ACHIEVEMENTS = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
