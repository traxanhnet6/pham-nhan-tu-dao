// ============================================================
// GIFTCODE — NHẬP MÃ NHẬN QUÀ (lệnh Bui 20:19 ngày 2026-10-30)
//
// GIỚI HẠN ĐÃ BIẾT (nói thẳng, không quảng cáo chống hack tuyệt
// đối): game hiện chạy offline/local nên BẢNG MÃ NẰM PHÍA CLIENT —
// người biết đọc mã nguồn sẽ thấy mã. Lớp bảo vệ thật ở bản này là:
// (1) mỗi mã dùng ĐÚNG 1 LẦN cho mỗi nhân vật qua cờ save
// flags.giftUsed.<code> (lưu trong save đã ký của anticheat);
// (2) thưởng đi qua guardGain của anticheat (trần 'gift' 200/lần).
// Khi nối online (Supabase) SAU NÀY, việc kiểm mã + phát thưởng
// PHẢI chuyển lên máy chủ (bảng mã + bảng đã dùng theo tài khoản),
// module này chỉ còn giữ phần giao diện tra cứu hiển thị.
//
// Luồng: plan() THUẦN kiểm tra (đúng mã? hết hạn? đã dùng?) và trả
// phần thưởng dự kiến — KHÔNG tự cộng gì. game.js cộng thưởng qua
// đúng đường tài nguyên của game (guardGain + L.gainTuVi +
// L.addItem) rồi gọi markUsed() để đóng cờ. Danh sách mã + thưởng
// quản trị ở docs/economy.md (mục Giftcode).
// ============================================================
(function (global) {
  'use strict';

  // Thưởng khiêm tốn theo economy.md: mỗi mã tổng giá trị quy đổi
  // <= ~150 Linh Thạch. items là id trong L.ITEMS của logic.js.
  var CODES = {
    TANTHU: {
      note: 'Quà chào tân thủ — Trưởng làng Thanh Khê gửi người mới lên đường.',
      rewards: { linhThach: 50, tuVi: 0, items: { hoi_xuan_dan: 2, tu_linh_dan: 1 } }
    },
    THANHKHE: {
      note: 'Quà làng Thanh Khê — hạt giống cho Linh Điền của người mới.',
      rewards: { linhThach: 30, tuVi: 0, items: { hat_linh_chi: 2, hat_thao_duoc: 3 } }
    },
    THIEN5: {
      note: 'Quà sự kiện Thiên 5 "Kim Đan Phong Vân" — dược liệu của vụ án đan độc.',
      rewards: { linhThach: 40, tuVi: 30, items: { doc_tam_hoa: 2 } },
      expiresAt: Date.UTC(2026, 11, 31, 23, 59, 59) // hết hạn cuối 31/12/2026 (UTC)
    }
  };

  function normalizeCode(raw) {
    return String(raw == null ? '' : raw).trim().toUpperCase();
  }
  function codeDef(code) {
    var c = normalizeCode(code);
    return CODES[c] ? { code: c, def: CODES[c] } : null;
  }
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (!flags.giftUsed || typeof flags.giftUsed !== 'object') flags.giftUsed = {};
    return flags.giftUsed;
  }
  function isUsed(flags, code) {
    var u = ensure(flags);
    return !!(u && u[normalizeCode(code)]);
  }
  // Kiểm tra THUẦN: { ok, reason?, msg, code?, rewards? }.
  // reason: 'empty' | 'badcode' | 'expired' | 'used'.
  function plan(ch, flags, rawCode, now) {
    var code = normalizeCode(rawCode);
    if (!code) return { ok: false, reason: 'empty', msg: 'Chưa nhập mã nào.' };
    var found = codeDef(code);
    if (!found) return { ok: false, reason: 'badcode', msg: 'Mã "' + code + '" không tồn tại. Kiểm tra lại chính tả nhé.' };
    var t = (typeof now === 'number') ? now : Date.now();
    if (found.def.expiresAt && t > found.def.expiresAt) {
      return { ok: false, reason: 'expired', code: code, msg: 'Mã ' + code + ' đã hết hạn.' };
    }
    if (isUsed(flags, code)) {
      return { ok: false, reason: 'used', code: code, msg: 'Mã ' + code + ' đã được nhân vật này dùng rồi — mỗi mã chỉ dùng 1 lần.' };
    }
    return { ok: true, code: code, rewards: found.def.rewards, note: found.def.note, msg: 'Nhận quà từ mã ' + code + '!' };
  }
  function markUsed(flags, code) {
    var u = ensure(flags);
    if (!u) return false;
    u[normalizeCode(code)] = Date.now();
    return true;
  }
  function usedList(flags) {
    var u = ensure(flags);
    return u ? Object.keys(u) : [];
  }

  var api = {
    CODES: CODES,
    normalizeCode: normalizeCode,
    codeDef: codeDef,
    isUsed: isUsed,
    plan: plan,
    markUsed: markUsed,
    usedList: usedList
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_GIFTCODE = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
