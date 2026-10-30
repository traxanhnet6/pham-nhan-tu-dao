// ============================================================
// BẢNG TRUYỀN KỲ THANH SƠN — mục 15 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: Đại Hội đã có danh hiệu Quán Quân nhưng thắng xong
// không để lại dấu vết lâu dài; thú triều giữ được rồi cũng qua,
// độ kiếp thành công rồi cũng chỉ còn trong panel Tu hành. Ở
// quảng trường Chân Núi Thanh Phong (map 3) — nơi mười tông cùng
// nhìn — dựng Bia Truyền Kỳ: bia đá khắc dấu mốc CẢ ĐỜI của tu
// sĩ, khác Bảng Mùa (js/season-board.js) chỉ đo MỘT mùa rồi reset.
// Người giữ bia là Thẩm Ký (ghi_bang_su, map 3 (33,14)) — cùng
// thư lại giữ bảng mùa, không cần thêm NPC mới hay sprite mới:
// một người giữ sổ thì giữ cả hai bảng, đúng như sổ điểm Đại Hội
// của ông vốn đã ghi quán quân từng kỳ (flags.tourn.hall).
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/season-board.js /
// js/market-fair.js: dữ liệu + luật thuần test bằng Node, game.js
// chỉ nối panel và GHI DẤU ở đúng 5 hook kết quả):
// - Dấu mốc ghi đúng 1 lần nhờ khóa chống trùng (key): độ kiếp
//   theo cảnh giới đạt được, quán quân theo sessionKey của kỳ
//   Đại Hội, thủ thành theo sessionKey của phiên Thú Triều,
//   bái sư theo tông, hạ boss thế giới lần đầu theo bossId.
//   Ghi trùng, sai hạng (không phải quán quân / không thắng
//   triều), thiếu khóa đều trả {ok:false} và KHÔNG ghi thêm.
// - Bia CHỈ GHI DANH, KHÔNG THƯỞNG: không Linh Thạch, không vật
//   phẩm, không danh hiệu, không chạm economy.md (mục 16 của
//   economy.md ghi rõ điều này). Vì vậy module KHÔNG nhận nhân
//   vật (ch) và không có hàm claim/reward nào — không thể thành
//   nguồn tiền dù game.js nối sai.
// - Trạng thái nằm trong flags.legendBoard của save (serialize
//   mang theo nguyên vẹn); save cũ không có trường này thì
//   ensure() khởi tạo lười. Mốc ghi bằng đồng hồ đơn điệu
//   gameNow() như các hook bảng mùa (chống lùi giờ), hiển thị
//   theo ngày của mốc đó.
// - Bản OFFLINE (theo docs/feature-ideas.md C2): bia ghi dấu mốc
//   của chính người chơi + 2 dòng khắc cũ còn đọc được (Thanh
//   Khê lão nhân, Sơn Quân — đều là truyện đã chốt trong
//   story-bible, không bịa thêm nhân vật lịch sử) + quán quân
//   Đại Hội các kỳ gần nhất lấy từ sổ thật flags.tourn.hall
//   (trong đó đã có quán quân NPC khi người chơi bị loại).
//   Bảng thật cả server (đọc characters_public) là việc của
//   giai đoạn online P1, không giả vờ có ở bản offline này.
// ============================================================
(function (global) {
  'use strict';

  var KEEPER = { id: 'ghi_bang_su', name: 'Thẩm Ký', title: 'Thư Lại Giữ Bia Truyền Kỳ', mapId: 'map3', x: 45, y: 22, sprite: 'hoc_tro' }; // V10: (33,14) nguồn + offset map (12,8) — khớp KEEPER của season-board.js
  var KINDS = {
    do_kiep: 'Độ kiếp thành công',
    quan_quan: 'Quán quân Đại Hội',
    thu_trieu: 'Thủ thành Thú Triều',
    bai_su: 'Lễ bái sư',
    boss_dau: 'Hạ boss thế giới lần đầu'
  };
  // Dòng khắc cũ trên bia — truyện đã chốt trong story-bible
  // (mục 3: phong ấn giếng cổ; mục 7/23: Sơn Quân trấn rừng).
  var OLD_LINES = [
    { text: 'Thanh Khê lão nhân — phong ấn tu vi dưới đáy giếng cổ, giữ làng Thanh Khê bình yên qua thời mạt pháp.' },
    { text: 'Sơn Quân — hổ tinh trấn rừng Thanh Sơn trăm năm, kẻ giữ núi trước khi phát cuồng vì linh khí rò qua vết nứt phong ấn.' }
  ];

  function num(v, d) { v = +v; return isFinite(v) ? v : d; }
  function str(v) { return (v == null ? '' : String(v)).trim(); }

  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (!flags.legendBoard || typeof flags.legendBoard !== 'object' || !Array.isArray(flags.legendBoard.entries)) {
      flags.legendBoard = { entries: [], seq: 0 };
    }
    if (typeof flags.legendBoard.seq !== 'number') flags.legendBoard.seq = flags.legendBoard.entries.length;
    return flags.legendBoard;
  }

  function push(flags, kind, key, title, detail, at) {
    var st = ensure(flags);
    if (!st) return { ok: false, reason: 'badflags' };
    if (!KINDS[kind] || !str(key)) return { ok: false, reason: 'badarg' };
    for (var i = 0; i < st.entries.length; i++) {
      if (st.entries[i].key === key) return { ok: false, reason: 'dup' };
    }
    st.seq = num(st.seq, 0) + 1;
    var e = { kind: kind, key: key, title: title, detail: detail || '', at: num(at, 0) || 0, seq: st.seq };
    st.entries.push(e);
    return { ok: true, entry: e };
  }

  // Độ kiếp thành công: 1 dòng cho mỗi cảnh giới đạt được.
  function noteTribulation(flags, realmName, formName, strikes, at) {
    realmName = str(realmName);
    if (!realmName) return { ok: false, reason: 'badarg' };
    var detail = 'Đột phá ' + realmName;
    if (str(formName)) detail += ' — lôi kiếp ' + str(formName);
    if (num(strikes, 0) > 0) detail += ' (' + Math.floor(num(strikes, 0)) + ' đạo)';
    return push(flags, 'do_kiep', 'do_kiep:' + realmName, KINDS.do_kiep, detail, at);
  }

  // Quán quân Đại Hội: chỉ hạng quan_quan mới lên bia; các hạng
  // khác là thành tích mùa (bảng mùa), không phải truyền kỳ.
  function noteTournament(flags, placement, sessionKey, bracketName, at) {
    if (placement !== 'quan_quan') return { ok: false, reason: 'not_champion' };
    sessionKey = str(sessionKey);
    if (!sessionKey) return { ok: false, reason: 'nosession' };
    var detail = 'Quán quân Đại Hội' + (str(bracketName) ? ' (' + str(bracketName) + ')' : '');
    return push(flags, 'quan_quan', 'quan_quan:' + sessionKey, KINDS.quan_quan, detail, at);
  }

  // Thủ thành Thú Triều: chỉ khi thắng trọn (outcome 'win').
  function noteTide(flags, outcome, sessionKey, waves, at) {
    if (outcome !== 'win') return { ok: false, reason: 'not_win' };
    sessionKey = str(sessionKey);
    if (!sessionKey) return { ok: false, reason: 'nosession' };
    var detail = 'Giữ vững Nam Môn' + (num(waves, 0) > 0 ? ' qua trọn ' + Math.floor(num(waves, 0)) + ' đợt' : '') + ', làng Thanh Khê an toàn.';
    return push(flags, 'thu_trieu', 'thu_trieu:' + sessionKey, KINDS.thu_trieu, detail, at);
  }

  // Lễ bái sư: 1 dòng cho tông đã bái nhập (người chơi chỉ bái
  // 1 tông nên thực tế chỉ có tối đa 1 dòng này).
  function noteSectJoin(flags, sectId, sectName, at) {
    sectId = str(sectId);
    if (!sectId) return { ok: false, reason: 'badarg' };
    var detail = 'Bái nhập ' + (str(sectName) || sectId) + ' — chọn con đường tu của mình tại Sơn Môn Đại Hội.';
    return push(flags, 'bai_su', 'bai_su:' + sectId, KINDS.bai_su, detail, at);
  }

  // Hạ boss thế giới lần đầu: mỗi boss 1 dòng, lần hạ lại sau
  // hồi sinh không khắc thêm (bia ghi "lần đầu", không ghi
  // "mỗi lần" — nếu không bia sẽ toàn tên một người farm boss).
  function noteBossFirst(flags, bossId, bossName, at) {
    bossId = str(bossId);
    if (!bossId) return { ok: false, reason: 'badarg' };
    var detail = 'Lần đầu hạ ' + (str(bossName) || bossId) + '.';
    return push(flags, 'boss_dau', 'boss_dau:' + bossId, KINDS.boss_dau, detail, at);
  }

  // Dấu mốc mới nhất trước (at giảm dần, cùng at thì seq sau
  // trước) — bia đọc từ trên xuống là hành trình gần nhất.
  function entries(flags) {
    var st = (flags && flags.legendBoard && Array.isArray(flags.legendBoard.entries)) ? flags.legendBoard : null;
    if (!st) return [];
    return st.entries.slice().sort(function (a, b) {
      if (b.at !== a.at) return b.at - a.at;
      return b.seq - a.seq;
    });
  }

  function countByKind(flags) {
    var out = {};
    Object.keys(KINDS).forEach(function (k) { out[k] = 0; });
    var list = (flags && flags.legendBoard && Array.isArray(flags.legendBoard.entries)) ? flags.legendBoard.entries : [];
    list.forEach(function (e) { if (out.hasOwnProperty(e.kind)) out[e.kind] += 1; });
    return out;
  }

  function fmtDate(at) {
    if (!at) return '';
    var d = new Date(at);
    if (isNaN(d.getTime())) return '';
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  var api = { KEEPER: KEEPER, KINDS: KINDS, OLD_LINES: OLD_LINES,
    ensure: ensure, entries: entries, countByKind: countByKind, fmtDate: fmtDate,
    noteTribulation: noteTribulation, noteTournament: noteTournament,
    noteTide: noteTide, noteSectJoin: noteSectJoin, noteBossFirst: noteBossFirst };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_LEGEND_BOARD = api;
})(typeof window !== 'undefined' ? window : globalThis);
