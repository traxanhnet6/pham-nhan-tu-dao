// ============================================================
// CHỢ PHIÊN THANH KHÊ — mục 14 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: sau q_phu_mo_duong mở lại đường buôn, thương đội
// phương bắc của Mã Vạn Lai mới về làng đều đặn được — và mỗi
// Chủ nhật, đội dựng sạp ở quảng trường làng Thanh Khê (map 1),
// do Lục Tiểu Lục coi sạp (chính là NPC tieu_thuong đã đứng ở
// sạp chợ (24,11) từ đầu game, không cần thêm NPC mới). Chợ phiên
// là "quả chín" của dây truyện thương đội: đường thông thì hàng
// mới chảy về làng, và làng mới có phiên để chờ đợi mỗi tuần.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/auction.js /
// js/season-board.js: dữ liệu + luật thuần test bằng Node,
// game.js chỉ nối NPC/panel và DIỄN GIẢI mua/bán bằng hệ thật):
// - Lịch giờ thật (đồng hồ địa phương, như Đại Hội/đấu giá):
//   CHỦ NHẬT mỗi tuần, cả ngày. Ngoài Chủ nhật, panel chỉ hiện
//   ngày phiên tới + 6 sạp của phiên đó (xem trước, không mua
//   được) — giống cách đấu giá cho xem trước lô ngoài phiên.
// - Sạp xoay vòng theo hạt giống thời gian: mỗi phiên đúng 6
//   sạp, chọn từ bảng 18 món bằng xáo trộn gieo hạt theo ngày
//   Chủ nhật đó (cùng một Chủ nhật thì cùng một bảng sạp —
//   người chơi học được "tuần này phiên bán gì"). Mỗi sạp có
//   tồn kho riêng trong ngày, bán hết thì thôi, sang tuần mới
//   sạp mới.
// - Giá phiên KHÁC ngày thường (đúng yêu cầu hàng chờ): hạt
//   giống bán rẻ hơn giá niêm yết ở Động Phủ (ví dụ Hạt Linh
//   Chi 26 thay vì 30, Hạt Ngọc Tủy Chi 130 thay vì 150);
//   dược liệu/thịt bán theo giá phiên riêng, không đụng giá
//   shop vũ khí/pháp bảo.
// - Món CHỈ CÓ Ở PHIÊN (fairOnly, không bán ở shop nào khác):
//   Vạn Niên Linh Chi (dược cấp cao vốn chỉ hái ở Đại Sơn sâu
//   hoặc rơi boss — 380 LT, tồn 1) và Thịt Sơn Quân (đồ ăn hồi
//   60 HP vốn chỉ rơi từ boss Sơn Quân — 120 LT, tồn 2). Hai
//   món này KHÔNG phải nguyên liệu đột phá (không phải Yêu
//   Đan), nên bán ở phiên không phá vòng đột phá.
// - Thu mua phiên (van xả theo feature-ideas C1): phiên thu
//   mua 3 tài nguyên farm được (Da Sói 8, Lông Gà 6, Thịt Gà 7
//   LT) với HẠN MỨC CỨNG: mỗi loại tối đa 10 món/phiên và tổng
//   thu mua tối đa 150 Linh Thạch/phiên. 150 LT/tuần < nửa giờ
//   farm giữa chặng (430 LT/giờ) và < 1 giờ farm đầu chặng
//   (200–280 LT/giờ) — đúng thang docs/economy.md mục 6, quy
//   tắc 5 (nguồn lẻ không vượt ~30 phút farm chặng tương ứng;
//   đây là nguồn theo TUẦN nên càng không phá nhịp giờ).
//   Ngoài phiên hoặc hết hạn mức thì không thu mua được.
// - Mua/bán đều yêu cầu ĐANG Ở map 1 (quảng trường làng) —
//   sạp ở làng thì phải đứng ở làng mới mua được, giống đấu
//   giá yêu cầu đứng ở map 3. Nút trên thanh công cụ mở panel
//   xem trước được ở mọi map nhưng nút mua/bán tắt khi xa làng.
// - Trạng thái nằm trong flags.fair của save (serialize mang
//   theo nguyên vẹn); save cũ không có trường này thì ensure()
//   khởi tạo lười. Hết ngày phiên, lần ensure() đầu tiên ở
//   phiên sau tự đặt lại tồn kho + hạn mức thu mua.
// ============================================================
(function (global) {
  'use strict';
  var L = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
  }

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }

  var KEEPER = { id: 'tieu_thuong', name: 'Lục Tiểu Lục', mapId: 'map1', x: 76, y: 74 } // V7-EXPAND: (48,49)+neo map1 (28,25); // V3: (24,11) + offset V10 (12,8) + neo V3 map1 (12,30)
  var FAIR_DAY = 0; // Chủ nhật (getDay() địa phương)
  var SLOTS = 6;
  var BUYBACK_CAP_LT = 150;

  // Bảng 18 món: price = giá phiên; stock = tồn kho trong 1 ngày
  // phiên; fairOnly = chỉ bán ở phiên, không shop nào khác bán.
  var CATALOG = [
    { id: 'thao_duoc', price: 8, stock: 5, fairOnly: false },
    { id: 'thit_ga', price: 10, stock: 5, fairOnly: false },
    { id: 'thit_tho', price: 8, stock: 5, fairOnly: false },
    { id: 'thit_lon', price: 18, stock: 5, fairOnly: false },
    { id: 'linh_chi', price: 45, stock: 3, fairOnly: false },
    { id: 'thanh_tam_thao', price: 30, stock: 3, fairOnly: false },
    { id: 'tu_linh_qua', price: 50, stock: 3, fairOnly: false },
    { id: 'huyet_sam', price: 55, stock: 3, fairOnly: false },
    { id: 'doc_tam_hoa', price: 40, stock: 3, fairOnly: false },
    { id: 'ngoc_tuy_chi', price: 120, stock: 2, fairOnly: false },
    { id: 'thanh_linh_tuy', price: 150, stock: 2, fairOnly: false },
    { id: 'long_ga', price: 12, stock: 5, fairOnly: false },
    { id: 'hat_linh_chi', price: 26, stock: 3, fairOnly: false },
    { id: 'hat_huyet_sam', price: 52, stock: 2, fairOnly: false },
    { id: 'hat_ngoc_tuy_chi', price: 130, stock: 2, fairOnly: false },
    { id: 'hat_thanh_linh_tuy', price: 175, stock: 1, fairOnly: false },
    { id: 'van_nien_linh_chi', price: 380, stock: 1, fairOnly: true },
    { id: 'thit_son_quan', price: 120, stock: 2, fairOnly: true }
  ];

  // Thu mua phiên: giá + hạn mức mỗi loại trong 1 ngày phiên.
  var BUYBACK = [
    { id: 'da_soi', price: 8, cap: 10 },
    { id: 'long_ga', price: 6, cap: 10 },
    { id: 'thit_ga', price: 7, cap: 10 }
  ];

  // Xáo trộn gieo hạt xác định (mulberry32 + Fisher-Yates) để
  // cùng một ngày phiên thì cùng một bảng sạp.
  function rng32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dayKey(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) +
      '-' + ('0' + d.getDate()).slice(-2);
  }
  // Ngày Chủ nhật của phiên đang xét: hôm nay nếu là Chủ nhật,
  // ngược lại là Chủ nhật tới (dùng cho xem trước ngoài phiên).
  function fairDateFor(d) {
    var r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var add = (FAIR_DAY - r.getDay() + 7) % 7;
    r.setDate(r.getDate() + add);
    return r;
  }
  function isOpen(d) { return d.getDay() === FAIR_DAY; }
  function stallsFor(d) {
    var fd = fairDateFor(d);
    var days = Math.floor(Date.UTC(fd.getFullYear(), fd.getMonth(), fd.getDate()) / 86400000);
    var rng = rng32((days * 2654435761) >>> 0);
    var pool = CATALOG.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return { key: dayKey(fd), date: fd, slots: pool.slice(0, SLOTS) };
  }
  function ensure(flags, d) {
    if (!flags) flags = {};
    var st = stallsFor(d || new Date());
    if (!flags.fair || flags.fair.key !== st.key) {
      flags.fair = { key: st.key, sold: {}, buyback: {}, buybackLt: 0 };
    }
    if (!flags.fair.sold) flags.fair.sold = {};
    if (!flags.fair.buyback) flags.fair.buyback = {};
    if (flags.fair.buybackLt == null) flags.fair.buybackLt = 0;
    return flags.fair;
  }
  function itemName(id) {
    if (L && L.ITEMS && L.ITEMS[id]) return L.ITEMS[id].name;
    return id;
  }
  function slotOf(id, d) {
    var slots = stallsFor(d || new Date()).slots;
    for (var i = 0; i < slots.length; i++) if (slots[i].id === id) return slots[i];
    return null;
  }
  function remaining(flags, id, d) {
    var slot = slotOf(id, d);
    if (!slot) return 0;
    var sold = num(ensure(flags, d).sold[id], 0);
    return Math.max(0, slot.stock - sold);
  }
  function canTrade(flags, ch, mapId, d) {
    if (!isOpen(d || new Date())) return { ok: false, reason: 'closed' };
    if (mapId !== KEEPER.mapId) return { ok: false, reason: 'wrong_map' };
    return { ok: true };
  }
  function buy(flags, ch, id, d, mapId) {
    // mapId: game.js truyền map hiện tại; test không truyền thì chỉ
    // kiểm tra phiên/hàng/tiền, luật map do canTrade() khóa riêng.
    if (mapId != null && mapId !== KEEPER.mapId) return { ok: false, reason: 'wrong_map' };
    if (!isOpen(d || new Date())) return { ok: false, reason: 'closed' };
    var slot = slotOf(id, d);
    if (!slot) return { ok: false, reason: 'nostall' };
    if (remaining(flags, id, d) <= 0) return { ok: false, reason: 'soldout' };
    if (!ch || num(ch.linhThach, 0) < slot.price) return { ok: false, reason: 'linhThach', need: slot.price };
    ch.linhThach -= slot.price;
    if (L) L.addItem(ch, id, 1);
    var f = ensure(flags, d);
    f.sold[id] = num(f.sold[id], 0) + 1;
    return { ok: true, id: id, price: slot.price, name: itemName(id) };
  }
  function buybackDef(id) {
    for (var i = 0; i < BUYBACK.length; i++) if (BUYBACK[i].id === id) return BUYBACK[i];
    return null;
  }
  function sellback(flags, ch, id, n, d, mapId) {
    if (mapId != null && mapId !== KEEPER.mapId) return { ok: false, reason: 'wrong_map' };
    if (!isOpen(d || new Date())) return { ok: false, reason: 'closed' };
    var def = buybackDef(id);
    if (!def) return { ok: false, reason: 'nobuys' };
    var owned = (L && ch) ? L.countItem(ch, id) : 0;
    if (owned <= 0) return { ok: false, reason: 'nocount' };
    var f = ensure(flags, d);
    var itemLeft = def.cap - num(f.buyback[id], 0);
    var ltLeft = BUYBACK_CAP_LT - num(f.buybackLt, 0);
    var byLt = Math.floor(ltLeft / def.price);
    var take = Math.min(num(n, 1), owned, itemLeft, byLt);
    if (take <= 0) return { ok: false, reason: 'cap' };
    if (L) L.consumeItem(ch, id, take);
    f.buyback[id] = num(f.buyback[id], 0) + take;
    f.buybackLt = num(f.buybackLt, 0) + take * def.price;
    ch.linhThach = num(ch.linhThach, 0) + take * def.price;
    return { ok: true, id: id, n: take, gain: take * def.price, name: itemName(id) };
  }

  var api = { KEEPER: KEEPER, FAIR_DAY: FAIR_DAY, SLOTS: SLOTS,
    BUYBACK_CAP_LT: BUYBACK_CAP_LT, CATALOG: CATALOG, BUYBACK: BUYBACK,
    ensure: ensure, isOpen: isOpen, fairDateFor: fairDateFor,
    stallsFor: stallsFor, slotOf: slotOf, remaining: remaining,
    canTrade: canTrade, buy: buy, sellback: sellback,
    buybackDef: buybackDef, itemName: itemName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_MARKET_FAIR = api;
})(typeof window !== 'undefined' ? window : globalThis);
