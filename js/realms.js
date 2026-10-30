// Phàm Nhân Tu Đạo — HỆ CẢNH GIỚI CAO + LÔI KIẾP (js/realms.js).
// Lệnh Bui 21:51 + 22:00 + 22:02 ngày 2026-10-29:
//   - Thang đầy đủ Trúc Cơ -> Độ Kiếp trên nền thang REALMS của js/maps.js
//     (Phàm Nhân 0, Luyện Khí 1, Trúc Cơ 2, Kim Đan 3, Nguyên Anh 4,
//     Hóa Thần 5, Độ Kiếp 6). Mỗi cảnh giới lớn có đúng 4 GIAI ĐOẠN
//     (chuẩn tên Bui chốt 22:57 2026-10-29): Sơ Kỳ / Trung Kỳ / Hậu Kỳ /
//     Viên Mãn — leo tu vi như thang tầng
//     Luyện Khí trong js/logic.js (TIERS/BREAK_RULES), module này là phần
//     MỞ RỘNG phía trên tầng 9, không sửa luật Luyện Khí.
//   - Đột phá TIỂU GIAI (trong cùng cảnh giới): quay tỉ lệ % như cũ.
//   - Đột phá LIÊN CẢNH GIỚI: dẫn động LÔI KIẾP phải sống sót (không quay
//     tỉ lệ): thiên lôi giáng theo số đạo tăng dần (Trúc Cơ 3, Kim Đan 5,
//     Nguyên Anh 7, Hóa Thần 9, Độ Kiếp 9 — Độ Kiếp chỉ ở Độ Kiếp Đài
//     map 14). Điều kiện cứng dùng tài nguyên đã xây: mốc Trúc Cơ cần
//     TRÚC CƠ ĐAN (đan dẫn kiếp, luyện từ Yêu Đan Cấp 3 — xem
//     js/alchemy.js); các mốc cao hơn tốn Yêu Đan Cấp 3 số lượng tăng dần
//     + nguyên liệu cấp cao (long_tien_thao, van_nien_linh_chi,
//     tinh_van_thach, thien_lien). Đan/vật dẫn kiếp TIÊU HAO NGAY khi dẫn
//     động kiếp — chết giữa kiếp là mất trắng (khác luật tầng Luyện Khí:
//     ở đó đan hỗ trợ chỉ trừ khi thành công theo hợp đồng cũ của
//     logic.js... thực tế logic.doBreakthrough cũng tiêu hao khi thử;
//     điểm khác cốt lõi là kiếp không có "tỉ lệ" — sống sót là qua).
//   - HÌNH THÁI LÔI KIẾP: mỗi lần độ kiếp lăn 1 hình thái theo trọng số
//     bám phẩm chất linh căn + cảnh giới đích (Thanh Lôi / Tử Điện Lôi /
//     Kim Quang Lôi / Ngũ Hành Lôi / Hỗn Độn Lôi) — quyết định hệ số sát
//     thương mỗi đạo, màu sét và thang thưởng luyện thể.
//   - LÔI KIẾP LUYỆN THỂ: mỗi đạo lôi ĐỨNG CHỊU TRỌN trong vòng = 1 điểm
//     luyện thể (né = an toàn nhưng không tích). Độ kiếp thành công thì
//     điểm quy thành cộng VĨNH VIỄN +HP/+thủ/+công (có trần mỗi lần kiếp),
//     ghi thẳng vào chỉ số gốc của nhân vật + tích luỹ ch.temperTotal.
//   - THIÊN ĐẠO BAN PHƯỚC: độ kiếp thành công -> hồi đầy HP/linh lực +
//     +1 Thiên Đạo Ấn (ch.thienDaoAn). Mỗi ấn +2% HP tối đa và +2% công
//     vĩnh viễn (logic.js effMaxHp/effAtk nhân qua blessingMult ở đây),
//     tối đa 5 ấn = số đại cảnh giới hiện có trong game.
//   - HÌNH THÁI NHÂN VẬT THEO CẢNH GIỚI (FORMS): dữ liệu hào quang + vòng
//     sáng + hạt linh quang + bảng màu trang phục cho từng cảnh giới,
//     game.js vẽ phủ lên sheet nhân vật hiện có (drawFormBack/Front).
//     Vẽ lại trang phục riêng từng cảnh giới là pha mỹ thuật sau.
//
//   - THẾ LÔI PHÙ + HỘ ĐẠO PHÙ (js/talismans.js, lệnh Bui 07:04
//     2026-10-30): Thế Lôi thay hứng 30-50% của đúng 1 đạo (tối đa 2
//     lá/kỳ) — phần bị chặn không tính điểm Luyện Thể (trib.tankedEff
//     tách khỏi trib.tanked, resolve tính luyện thể theo tankedEff).
//     Hộ Đạo cộng +8 điểm % cho mốc TIỂU GIAI qua rateParts.talisman với
//     trần tổng hỗ trợ vật phẩm 40 (ITEM_SUPPORT_CAP); mốc liên cảnh
//     giới không có tỉ lệ nên phù không chen vào được.
//
// Trạng thái lưu trên nhân vật (serialize của logic.js gói nguyên object
// nên tự được lưu): ch.realmRank (số, maps.realmRankOf đọc trực tiếp),
// ch.stage (0..3 trong cảnh giới lớn), ch.realm (chuỗi hiển thị, vd
// 'Trúc Cơ Sơ Kỳ'), ch.thienDaoAn, ch.temperTotal. ch.tribulation là
// trạng thái kiếp ĐANG DIỄN RA — chỉ tồn tại trong phiên chơi: syncRealm
// xoá nó khi nạp save (vật dẫn kiếp đã tiêu hao, tu vi chưa trừ — nạp
// lại giữa kiếp coi như kiếp tan, phải dẫn động lại từ đầu).
(function () {
  'use strict';

  function logicApi() {
    if (typeof window !== 'undefined' && window.PNT_LOGIC) return window.PNT_LOGIC;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_LOGIC) return globalThis.PNT_LOGIC;
    return null;
  }
  function mapsApi() {
    if (typeof window !== 'undefined' && window.PNT_MAPS) return window.PNT_MAPS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_MAPS) return globalThis.PNT_MAPS;
    return null;
  }
  function skillsApi() {
    if (typeof window !== 'undefined' && window.PNT_SKILLS) return window.PNT_SKILLS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_SKILLS) return globalThis.PNT_SKILLS;
    return null;
  }
  function artifactsApi() {
    if (typeof window !== 'undefined' && window.PNT_ARTIFACTS) return window.PNT_ARTIFACTS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_ARTIFACTS) return globalThis.PNT_ARTIFACTS;
    return null;
  }
  function talismanApi() {
    if (typeof window !== 'undefined' && window.PNT_TALISMANS) return window.PNT_TALISMANS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_TALISMANS) return globalThis.PNT_TALISMANS;
    return null;
  }
  function itemCount(ch, id) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === id) n += it.count; });
    return n;
  }
  function itemName(id) {
    var L = logicApi();
    return (L && L.ITEMS && L.ITEMS[id]) ? L.ITEMS[id].name : id;
  }

  // ---------------- Thang cảnh giới ----------------
  var STAGES = [
    { id: 'so', name: 'Sơ Kỳ', short: 'sơ kỳ' },
    { id: 'trung', name: 'Trung Kỳ', short: 'trung kỳ' },
    { id: 'hau', name: 'Hậu Kỳ', short: 'hậu kỳ' },
    { id: 'vien_man', name: 'Viên Mãn', short: 'viên mãn' }
  ];
  // needs[s] = tu vi cần tích đầy Ở tiểu giai s để lên tiểu giai kế (s=3
  // là viên mãn: need của nó dùng cho mốc LIÊN cảnh giới, riêng Độ Kiếp
  // viên mãn need 0 = đỉnh thang hiện tại, thiên kiếp để pha sau).
  // growth = cộng chỉ số khi lên 1 tiểu giai trong cảnh giới này (mốc liên
  // cảnh giới cộng growth của cảnh giới ĐÍCH x2 — bước nhảy lớn).
  // llBase/llStep: linh lực tối đa cộng thêm (skills.maxLinhLuc cộng qua
  // llBonus ở dưới): llBase tại Sơ Kỳ, mỗi tiểu giai thêm llStep.
  var HIGH = {
    2: { id: 'truc_co', name: 'Trúc Cơ', needs: [2400, 3200, 4200, 5500], growth: { maxHp: 60, atk: 9, def: 3 }, llBase: 200, llStep: 60 },
    3: { id: 'kim_dan', name: 'Kim Đan', needs: [7000, 9500, 12500, 16500], growth: { maxHp: 120, atk: 18, def: 6 }, llBase: 500, llStep: 90 },
    4: { id: 'nguyen_anh', name: 'Nguyên Anh', needs: [21000, 28000, 37000, 49000], growth: { maxHp: 240, atk: 36, def: 12 }, llBase: 900, llStep: 120 },
    5: { id: 'hoa_than', name: 'Hóa Thần', needs: [62000, 82000, 108000, 142000], growth: { maxHp: 480, atk: 72, def: 24 }, llBase: 1450, llStep: 160 },
    6: { id: 'do_kiep', name: 'Độ Kiếp', needs: [180000, 240000, 315000, 0], growth: { maxHp: 960, atk: 144, def: 48 }, llBase: 2200, llStep: 220 }
  };
  // Linh địa cho mốc cao: dùng lại BREAK_PLACES của logic.js (giếng cổ
  // +10, Đài Vọng Vân +15) và thêm Độ Kiếp Đài map 14 (+20) — game.js
  // currentPlace() trả 'do_kiep_dai' khi đứng ở map 14.
  var PLACES = {
    gieng_co: { id: 'gieng_co', name: 'Giếng cổ Thanh Khê (linh nhãn)', bonus: 10 },
    dai_vong_van: { id: 'dai_vong_van', name: 'Đài Vọng Vân (Chân Núi Thanh Phong)', bonus: 15 },
    do_kiep_dai: { id: 'do_kiep_dai', name: 'Độ Kiếp Đài (đỉnh Thập Vạn Đại Sơn)', bonus: 20 }
  };
  // Luật đột phá TIỂU GIAI (theo tiểu giai ĐANG ĐỨNG 0..2 -> lên kế):
  // tỉ lệ gốc giảm dần theo độ sâu tiểu giai và theo cảnh giới; pillMin
  // là breakthroughBonus tối thiểu của đan hỗ trợ (hợp đồng logic.js:
  // tu_khi +10 / ngung_khi +20 / pha_canh +30).
  function stageRule(rank, fromStage) {
    return {
      baseRate: [78, 68, 58][fromStage] - (rank - 2) * 3,
      pillMin: [15, 20, 25][fromStage],
      failLossPct: 25 + fromStage * 5,
      cooldownSec: 120 + fromStage * 60 + (rank - 2) * 30
    };
  }
  // Luật mốc LIÊN CẢNH GIỚI (theo cảnh giới ĐÍCH): items = vật dẫn kiếp
  // tiêu hao khi DẪN ĐỘNG kiếp (kể cả khi chết giữa kiếp); pillMin = đan
  // hỗ trợ đột phá tối thiểu (cũng tiêu hao lúc dẫn động); placeReq = nơi
  // bắt buộc đứng. failLossPct/cooldownSec áp khi chết giữa kiếp.
  var CROSS_RULES = {
    2: { items: [{ id: 'truc_co_dan', n: 1 }], pillMin: 0, placeReq: null, failLossPct: 40, cooldownSec: 300 },
    3: { items: [{ id: 'yeu_dan_3', n: 2 }, { id: 'long_tien_thao', n: 2 }], pillMin: 20, placeReq: null, failLossPct: 40, cooldownSec: 420 },
    4: { items: [{ id: 'yeu_dan_3', n: 4 }, { id: 'van_nien_linh_chi', n: 2 }], pillMin: 30, placeReq: null, failLossPct: 45, cooldownSec: 540 },
    5: { items: [{ id: 'yeu_dan_3', n: 6 }, { id: 'tinh_van_thach', n: 2 }], pillMin: 30, placeReq: 'dai_vong_van', failLossPct: 45, cooldownSec: 660 },
    6: { items: [{ id: 'yeu_dan_3', n: 9 }, { id: 'thien_lien', n: 1 }, { id: 'tinh_van_thach', n: 2 }], pillMin: 30, placeReq: 'do_kiep_dai', failLossPct: 50, cooldownSec: 900 }
  };
  // ---------------- Lôi kiếp ----------------
  // dmgPcts[i] = % máu tối đa (chưa qua giảm sát thương và chưa nhân hệ
  // số hình thái) của đạo thứ i+1 khi ĐỨNG TRONG vòng lúc sét giáng; né
  // ra ngoài vòng chỉ chịu GRAZE_PCT (10%) của con số đó ("tránh được
  // phần lớn"). telegraphSec = thời gian vòng đỏ báo hiệu trước khi sét
  // đánh; restSec = quãng nghỉ giữa hai đạo để uống đan/hồi phục.
  var GRAZE_PCT = 10;
  var TRIBULATIONS = {
    2: { strikes: 3, dmgPcts: [25, 35, 45], radius: 64, telegraphSec: 1.1, restSec: 2.5 },
    3: { strikes: 5, dmgPcts: [22, 28, 34, 40, 48], radius: 70, telegraphSec: 1.0, restSec: 2.5 },
    4: { strikes: 7, dmgPcts: [20, 25, 30, 35, 40, 46, 54], radius: 76, telegraphSec: 0.95, restSec: 2.2 },
    5: { strikes: 9, dmgPcts: [18, 22, 26, 30, 34, 38, 43, 49, 56], radius: 84, telegraphSec: 0.9, restSec: 2.0 },
    6: { strikes: 9, dmgPcts: [26, 32, 38, 44, 50, 56, 63, 71, 80], radius: 92, telegraphSec: 0.85, restSec: 2.0 }
  };
  // HÌNH THÁI LÔI KIẾP. dmgMult: hệ số sát thương mỗi đạo. temperMult:
  // hệ số thang thưởng luyện thể. colors: màu sét (Ngũ Hành Lôi xoay 5
  // màu theo thứ tự đạo). minRank: cảnh giới đích tối thiểu mới gặp;
  // needGoodRoot: chỉ linh căn tốt (phẩm chất >= 2) mới lăn trúng.
  var TRIB_FORMS = {
    thanh_loi: { id: 'thanh_loi', name: 'Thanh Lôi', dmgMult: 1.0, temperMult: 1.0, colors: ['#bfe6ff'],
      desc: 'Sét xanh trắng thuần khiết — hình thái thường gặp nhất của thiên kiếp, uy lực chuẩn mực.' },
    tu_dien: { id: 'tu_dien', name: 'Tử Điện Lôi', dmgMult: 1.15, temperMult: 1.3, colors: ['#cfa6ff'],
      desc: 'Điện quang tím sẫm cuộn xoáy, mỗi đạo nặng hơn Thanh Lôi một phần — luyện thể cũng tốt hơn.' },
    kim_quang: { id: 'kim_quang', name: 'Kim Quang Lôi', dmgMult: 1.25, temperMult: 1.6, colors: ['#ffd94a'],
      desc: 'Sét vàng kim như thiên binh giáng trần, sáng chói và nặng nề, rèn thân hiệu quả rõ rệt.' },
    ngu_hanh: { id: 'ngu_hanh', name: 'Ngũ Hành Lôi', dmgMult: 1.4, temperMult: 2.2, colors: ['#ffd94a', '#69d66f', '#5aa7d6', '#ff7a3c', '#d99a4e'],
      minRank: 3, needGoodRoot: true,
      desc: 'Năm sắc lôi luân phiên giáng xuống — kiếp hiếm chỉ dành cho linh căn tốt từ Kim Đan trở lên. Qua được thì thân thể như được ngũ hành tôi luyện lại.' },
    hon_don: { id: 'hon_don', name: 'Hỗn Độn Lôi', dmgMult: 1.6, temperMult: 3.0, colors: ['#9aa0b0'],
      minRank: 5,
      desc: 'Sét xám đen hỗn mang như thuở trời đất chưa phân — chỉ xuất hiện ở Hóa Thần, Độ Kiếp. Hung hiểm nhất, mà cũng là lò rèn thân thể lớn nhất.' }
  };
  // Phẩm chất linh căn theo độ hiếm (weight trong logic.ROOTS càng nhỏ
  // càng hiếm/càng tốt): thường 1, Phong 2, Lôi 3, Băng 4.
  function rootQuality(ch) {
    var L = logicApi();
    if (!L || !ch || !ch.root) return 0;
    var r = L.rootOf(ch);
    if (!r) return 0;
    if (r.weight >= 16) return 1;
    if (r.weight >= 8) return 2;
    if (r.weight >= 7) return 3;
    return 4;
  }
  // Trọng số lăn hình thái theo cảnh giới đích; linh căn tốt dồn thêm
  // trọng số sang hình thái mạnh/hiếm (lấy từ phần Thanh Lôi).
  function formWeights(toRank, q) {
    var base = {
      2: { thanh_loi: 70, tu_dien: 22, kim_quang: 8, ngu_hanh: 0, hon_don: 0 },
      3: { thanh_loi: 55, tu_dien: 28, kim_quang: 12, ngu_hanh: 0, hon_don: 0 },
      4: { thanh_loi: 45, tu_dien: 30, kim_quang: 15, ngu_hanh: 0, hon_don: 0 },
      5: { thanh_loi: 35, tu_dien: 30, kim_quang: 17, ngu_hanh: 0, hon_don: 4 },
      6: { thanh_loi: 25, tu_dien: 30, kim_quang: 20, ngu_hanh: 0, hon_don: 8 }
    }[toRank] || { thanh_loi: 100, tu_dien: 0, kim_quang: 0, ngu_hanh: 0, hon_don: 0 };
    var w = {}; Object.keys(base).forEach(function (k) { w[k] = base[k]; });
    // q = phẩm chất linh căn: 1 là TỐT NHẤT, 4 là kém nhất (rootQuality).
    // goodness g = 4 - q: linh căn càng tốt, trọng số hình thái mạnh/
    // hiếm càng cao và Thanh Lôi càng ít đi.
    var g = 4 - q;
    if (q >= 1 && q <= 3 && toRank >= 3) w.ngu_hanh = 3 + g * 2; // 9/7/5 — chỉ linh căn tốt
    if (toRank >= 5) w.hon_don = base.hon_don + g;               // cộng theo độ tốt của linh căn
    w.tu_dien += g * 3;
    w.kim_quang += g * 2;
    w.thanh_loi = Math.max(5, w.thanh_loi - g * 5 - (w.ngu_hanh || 0));
    return w;
  }
  function rollForm(toRank, ch, rng) {
    var rand = rng || Math.random;
    var w = formWeights(toRank, rootQuality(ch));
    var total = 0; Object.keys(w).forEach(function (k) { total += w[k]; });
    var r = rand() * total;
    var ids = Object.keys(TRIB_FORMS);
    for (var i = 0; i < ids.length; i++) {
      if (w[ids[i]] > 0) { if (r < w[ids[i]]) return TRIB_FORMS[ids[i]]; r -= w[ids[i]]; }
    }
    return TRIB_FORMS.thanh_loi;
  }
  function formColorAt(form, strikeIdx) {
    if (!form) return '#bfe6ff';
    return form.colors[strikeIdx % form.colors.length];
  }
  // Luyện thể: điểm -> chỉ số. perPoint theo temperMult của hình thái;
  // trần mỗi lần kiếp theo cảnh giới đích x temperMult.
  function temperPerPoint(form) {
    var m = form ? form.temperMult : 1;
    return { maxHp: Math.round(6 * m), def: 0.6 * m, atk: 0.5 * m };
  }
  function temperCaps(toRank, form) {
    var m = form ? form.temperMult : 1;
    return { maxHp: Math.round(60 * m * (toRank - 1)), def: Math.round(6 * m * (toRank - 1)), atk: Math.round(5 * m * (toRank - 1)) };
  }
  function temperGainsFor(toRank, form, points) {
    var per = temperPerPoint(form), cap = temperCaps(toRank, form);
    return {
      points: points,
      maxHp: Math.min(cap.maxHp, points * per.maxHp),
      def: Math.min(cap.def, Math.floor(points * per.def)),
      atk: Math.min(cap.atk, Math.floor(points * per.atk))
    };
  }

  // ---------------- Trạng thái / đồng bộ ----------------
  function rankOf(ch) {
    var MP = mapsApi();
    if (MP && typeof MP.realmRankOf === 'function') return MP.realmRankOf(ch);
    if (!ch) return 0;
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    return (ch.tier || 0) > 0 ? 1 : 0;
  }
  function displayName(rank, stage) {
    var H = HIGH[rank];
    if (!H) return null;
    return H.name + ' ' + STAGES[stage || 0].name;
  }
  function stageNeed(rank, stage) {
    var H = HIGH[rank];
    if (!H) return 999;
    var n = H.needs[stage || 0];
    return n > 0 ? n : 999;
  }
  // Chuẩn hoá nhân vật cảnh giới cao. logic.syncTier gọi hàm này ở cuối
  // (tra cứu lười) nên mọi đường nạp save/đột phá đều khớp: nhân vật từ
  // Trúc Cơ trở lên giữ tên cảnh giới + tuViMax theo tiểu giai. Nhân vật
  // Luyện Khí trở xuống: chỉ dọn trạng thái kiếp dở (phiên cũ) nếu có.
  function syncRealm(ch) {
    if (!ch) return ch;
    if (ch.tribulation) delete ch.tribulation; // kiếp chỉ sống trong phiên
    var rank = rankOf(ch);
    if (rank < 2) return ch;
    if (typeof ch.realmRank !== 'number') ch.realmRank = rank;
    ch.stage = Math.max(0, Math.min(3, ch.stage || 0));
    ch.realm = displayName(rank, ch.stage);
    ch.tuViMax = stageNeed(rank, ch.stage);
    return ch;
  }
  // Linh lực cộng thêm cho skills.maxLinhLuc (tra cứu lười từ skills.js).
  function llBonus(ch) {
    var rank = rankOf(ch);
    if (rank < 2 || !HIGH[rank]) return 0;
    return HIGH[rank].llBase + (ch.stage || 0) * HIGH[rank].llStep;
  }
  // Hồi linh lực cộng thêm (điểm/giây) cho skills.regenRate.
  function llRegenBonus(ch) {
    var rank = rankOf(ch);
    return rank >= 2 ? (rank - 1) * 1.5 : 0;
  }
  // Thiên Đạo Ấn: mỗi ấn +2% HP tối đa và +2% công; tối đa 5 ấn.
  var AN_PER_PCT = 2, AN_MAX = 5;
  function blessingMult(ch) {
    var an = Math.max(0, Math.min(AN_MAX, (ch && ch.thienDaoAn) || 0));
    return 1 + an * AN_PER_PCT / 100;
  }
  function handles(ch) {
    if (!ch) return false;
    return rankOf(ch) >= 2 || (ch.tier || 0) >= 9;
  }

  // ---------------- Thông tin đột phá (panel Tu hành) ----------------
  // Cùng hình dạng với logic.breakthroughInfo (conditions/rateParts/
  // pill/place/canAttempt/atMax/rule) + thêm: kind ('luyen_khi' |
  // 'stage' | 'cross'), targetRank/targetStage, targetRealm (tên đích),
  // tribulation (bảng kiếp khi kind = 'cross'), formPreview không có —
  // hình thái chỉ lăn khi dẫn động kiếp thật.
  function info(ch, qs, opts) {
    opts = opts || {};
    var L = logicApi();
    syncRealm(ch);
    var rank = rankOf(ch);
    if (rank < 2 && (ch.tier || 0) < 9) {
      var li = L.breakthroughInfo(ch, qs, opts);
      li.kind = 'luyen_khi';
      li.targetRank = 1; li.targetStage = null;
      return li;
    }
    var now = typeof opts.now === 'number' ? opts.now : Date.now();
    var out = {
      atMax: false, kind: null, targetTier: null, targetRank: null, targetStage: null,
      targetRealm: null, rule: null, rate: null,
      rateParts: { base: 0, pill: 0, place: 0, root: 0, talisman: 0 },
      pill: { need: 0, used: null, met: true },
      place: { need: null, at: null, met: true, bonus: 0 },
      items: [], conditions: [], canAttempt: false, cooldownLeft: 0, tribulation: null
    };
    var stage = rank >= 2 ? (ch.stage || 0) : 3; // Luyện Khí 9 = "viên mãn" của hạng 1
    var crossing = rank < 2 || stage >= 3;
    var toRank = crossing ? rank + 1 : rank;
    var toStage = crossing ? 0 : stage + 1;
    if (toRank > 6) {
      out.atMax = true;
      out.conditions.push({ id: 'max', label: 'Độ Kiếp Viên Mãn', met: true, detail: 'Đã đứng ở đỉnh thang cảnh giới hiện tại — thiên kiếp lớn hơn chưa mở.' });
      return out;
    }
    out.kind = crossing ? 'cross' : 'stage';
    out.targetRank = toRank; out.targetStage = toStage;
    out.targetRealm = displayName(toRank, toStage);
    var rule = crossing ? CROSS_RULES[toRank] : stageRule(rank, stage);
    out.rule = {
      baseRate: crossing ? null : rule.baseRate, pillMin: rule.pillMin || 0,
      failLossPct: rule.failLossPct, cooldownSec: rule.cooldownSec,
      items: crossing ? rule.items : null, placeReq: rule.placeReq || null
    };
    var root = L.rootOf(ch);
    out.conditions.push({ id: 'root', label: 'Đã lộ linh căn', met: !!root, detail: root ? root.name : 'Tới giếng cổ xem điềm lạ để lộ linh căn trước.' });
    var tuviMet = ch.tuVi >= ch.tuViMax;
    out.conditions.push({ id: 'tuvi', label: 'Tu vi đầy ' + (crossing ? 'Viên Mãn' : 'giai đoạn'), met: tuviMet, detail: Math.floor(ch.tuVi) + '/' + ch.tuViMax + ' tu vi' });
    var cdLeft = Math.max(0, Math.ceil(((ch.bpCdUntil || 0) - now) / 1000));
    out.cooldownLeft = cdLeft;
    out.conditions.push({ id: 'cooldown', label: 'Tâm cảnh ổn định', met: cdLeft <= 0, detail: cdLeft > 0 ? 'Đột phá thất bại còn dư chấn — cần ngộ đạo thêm ' + cdLeft + ' giây.' : 'Tâm cảnh vững, sẵn sàng.' });
    if (crossing) {
      // Vật dẫn kiếp: bắt buộc đủ số lượng, tiêu hao khi dẫn động.
      rule.items.forEach(function (req) {
        var have = itemCount(ch, req.id);
        out.items.push({ id: req.id, name: itemName(req.id), need: req.n, have: have, met: have >= req.n });
      });
      var itemsMet = out.items.every(function (e) { return e.met; });
      out.conditions.push({
        id: 'item', met: itemsMet,
        label: 'Vật dẫn kiếp ' + (toRank === 2 ? '(Trúc Cơ Đan)' : ''),
        detail: out.items.map(function (e) { return e.name + ' ' + e.have + '/' + e.need; }).join(' · ') + ' — tiêu hao ngay khi dẫn động lôi kiếp, chết giữa kiếp là mất.'
      });
    }
    // Đan hỗ trợ (hợp đồng logic.js): tiểu giai = cộng tỉ lệ như cũ; mốc
    // liên cảnh giới = đan "dẫn kiếp phụ" cũng tiêu hao lúc dẫn động và
    // cộng tỉ lệ SỐNG SÓT gián tiếp qua giảm... — giữ đúng hợp đồng cũ:
    // ở kiếp, đan hỗ trợ KHÔNG đổi tỉ lệ (không có tỉ lệ); nó chỉ bắt
    // buộc theo pillMin như điều kiện dẫn kiếp (đan càng mạnh, kiếp dẫn
    // càng ổn định — thể hiện bằng điều kiện, không bằng %).
    var pill = L.bestBreakPill(ch, rule.pillMin || 0);
    out.pill.need = rule.pillMin || 0;
    out.pill.used = pill;
    out.pill.met = (rule.pillMin || 0) <= 0 || !!pill;
    out.conditions.push({
      id: 'pill', met: out.pill.met,
      label: rule.pillMin > 0 ? 'Đan hỗ trợ đột phá (cộng tối thiểu +' + rule.pillMin + '%)' : 'Đan hỗ trợ đột phá (không bắt buộc)',
      detail: pill ? (pill.name + ' +' + pill.bonus + '% — sẽ dùng 1 viên khi đột phá' + (crossing ? '/dẫn kiếp' : '') + ', mất cả khi thất bại.') : (rule.pillMin > 0 ? 'Túi chưa có đan hỗ trợ đủ mạnh.' : 'Chưa có đan hỗ trợ nào trong túi.')
    });
    var atPlace = (opts.place && PLACES[opts.place]) ? PLACES[opts.place] : null;
    out.place.at = atPlace ? atPlace.id : null;
    out.place.bonus = atPlace ? atPlace.bonus : 0;
    out.place.need = rule.placeReq || null;
    var placeMet = true, placeLabel = 'Linh địa (không bắt buộc)', placeDetail = atPlace ? ('Đang đứng ở ' + atPlace.name + ': cộng +' + atPlace.bonus + '% tỉ lệ' + (crossing ? ' sống sót (giảm nhẹ sát thương kiếp — xem tribStrikeDamage)' : '') + '.') : 'Đột phá ở giếng cổ hoặc Đài Vọng Vân được cộng tỉ lệ.';
    if (rule.placeReq) {
      var needPlace = PLACES[rule.placeReq];
      placeMet = !!atPlace && atPlace.id === rule.placeReq;
      placeLabel = (crossing ? 'Độ kiếp tại ' : 'Đột phá tại ') + (needPlace ? needPlace.name : rule.placeReq);
      placeDetail = placeMet ? 'Đang đứng ở đúng linh địa.' : 'Mốc này bắt buộc ' + (crossing ? 'độ kiếp' : 'đột phá') + ' ở ' + (needPlace ? needPlace.name : rule.placeReq) + '.';
    }
    out.place.met = placeMet;
    out.conditions.push({ id: 'place', label: placeLabel, met: placeMet, detail: placeDetail });
    var rp = out.rateParts;
    rp.base = crossing ? 0 : rule.baseRate;
    rp.pill = pill ? pill.bonus : 0;
    rp.place = atPlace ? atPlace.bonus : 0;
    rp.root = (root && typeof root.bpBonus === 'number') ? root.bpBonus : 0;
    // HỘ ĐẠO PHÙ (js/talismans.js): chỉ áp cho mốc có tỉ lệ (tiểu giai);
    // mốc liên cảnh giới rate = null nên phù không chen vào được.
    var TALi = talismanApi();
    rp.talisman = (!crossing && TALi && typeof TALi.hoDaoBonus === 'function') ? TALi.hoDaoBonus(ch) : 0;
    var itemCap = (TALi && typeof TALi.ITEM_SUPPORT_CAP === 'number') ? TALi.ITEM_SUPPORT_CAP : 40;
    var itemBonus = Math.min(itemCap, rp.pill + rp.talisman);
    out.rate = crossing ? null : Math.max(5, Math.min(95, rp.base + itemBonus + rp.place + rp.root));
    if (crossing) {
      var tb = TRIBULATIONS[toRank];
      out.tribulation = {
        strikes: tb.strikes, dmgPcts: tb.dmgPcts.slice(), radius: tb.radius,
        telegraphSec: tb.telegraphSec, restSec: tb.restSec,
        forms: Object.keys(TRIB_FORMS).filter(function (fid) {
          var f = TRIB_FORMS[fid];
          if (f.minRank && toRank < f.minRank) return false;
          if (f.needGoodRoot && rootQuality(ch) < 2) return false;
          return true;
        })
      };
    }
    out.canAttempt = out.conditions.every(function (c) { return c.met; });
    return out;
  }
  function canBreakthrough(ch, qs, opts) { return info(ch, qs, opts).canAttempt; }

  // ---------------- Áp kết quả lên cảnh giới ----------------
  function applyAdvance(ch, toRank, toStage, crossing) {
    var L = logicApi();
    var g = HIGH[toRank].growth;
    var mult = crossing ? 2 : 1;
    ch.maxHp += g.maxHp * mult; ch.atk += g.atk * mult; ch.def += g.def * mult;
    ch.realmRank = toRank;
    ch.stage = toStage;
    ch.tuVi = 0;
    ch.bpCdUntil = 0;
    syncRealm(ch);
    ch.hp = L.effMaxHp(ch);
    var SK = skillsApi();
    if (SK && typeof SK.ensureState === 'function') { SK.ensureState(ch); ch.ll = SK.maxLinhLuc(ch); }
  }
  // Đột phá TIỂU GIAI + uỷ quyền Luyện Khí cho logic.js. Mốc LIÊN cảnh
  // giới KHÔNG quay tỉ lệ ở đây: trả reason 'tribulation' để game.js gọi
  // startTribulation (test dùng simulateTribulation).
  function doBreakthrough(ch, qs, opts) {
    opts = opts || {};
    var L = logicApi();
    if (rankOf(ch) < 2 && (ch.tier || 0) < 9) {
      var lr = L.doBreakthrough(ch, qs, opts);
      if (lr && lr.ok) lr.kind = 'luyen_khi';
      return lr;
    }
    var inf = info(ch, qs, opts);
    if (!inf.canAttempt) return { ok: false, reason: inf.atMax ? 'max' : 'conditions', info: inf };
    if (inf.kind === 'cross') return { ok: false, reason: 'tribulation', info: inf };
    var now = typeof opts.now === 'number' ? opts.now : Date.now();
    var pillUsed = inf.pill.used;
    if (pillUsed) L.consumeItem(ch, pillUsed.id, 1);
    var TALd = talismanApi();
    if (TALd && typeof TALd.consumeHoDao === 'function') TALd.consumeHoDao(ch); // Hộ Đạo Phù cháy theo lần thử tiểu giai này
    var rng = opts.rng || Math.random;
    if (rng() * 100 < inf.rate) {
      applyAdvance(ch, inf.targetRank, inf.targetStage, false);
      return { ok: true, success: true, kind: 'stage', realm: ch.realm, tier: ch.tier, rank: ch.realmRank, stage: ch.stage, rate: inf.rate, pillUsed: pillUsed ? pillUsed.id : null };
    }
    var loss = Math.floor(ch.tuVi * inf.rule.failLossPct / 100);
    ch.tuVi -= loss;
    ch.bpCdUntil = now + inf.rule.cooldownSec * 1000;
    return { ok: true, success: false, kind: 'stage', realm: ch.realm, tier: ch.tier, rank: ch.realmRank, stage: ch.stage, rate: inf.rate, lostTuVi: loss, cooldownSec: inf.rule.cooldownSec, pillUsed: pillUsed ? pillUsed.id : null };
  }

  // ---------------- Lôi kiếp: bắt đầu / sát thương / kết thúc ----------------
  // Dẫn động kiếp: kiểm điều kiện (info kind 'cross' + canAttempt), lăn
  // HÌNH THÁI, tiêu hao vật dẫn kiếp + đan hỗ trợ NGAY, ghi trạng thái
  // kiếp lên ch.tribulation. Trả { ok:true, trib } hoặc { ok:false, info }.
  function startTribulation(ch, qs, opts) {
    opts = opts || {};
    var L = logicApi();
    var inf = info(ch, qs, opts);
    if (!inf.canAttempt || inf.kind !== 'cross') return { ok: false, reason: inf.atMax ? 'max' : (inf.kind !== 'cross' ? 'not_cross' : 'conditions'), info: inf };
    var form = rollForm(inf.targetRank, ch, opts.rng);
    var usedItems = [];
    inf.items.forEach(function (e) { if (L.consumeItem(ch, e.id, e.need)) usedItems.push({ id: e.id, n: e.need }); });
    var pillUsed = inf.pill.used;
    if (pillUsed) L.consumeItem(ch, pillUsed.id, 1);
    var tb = TRIBULATIONS[inf.targetRank];
    ch.tribulation = {
      targetRank: inf.targetRank, form: form.id,
      strikes: tb.strikes, idx: 0, tanked: 0, tankedEff: 0,
      theLoiUsed: 0, theLoiArmed: 0,
      place: opts.place || null, startedAt: typeof opts.now === 'number' ? opts.now : Date.now(),
      usedItems: usedItems, pillUsed: pillUsed ? pillUsed.id : null
    };
    return { ok: true, trib: ch.tribulation, form: form, info: inf };
  }
  // % giảm sát thương kiếp từ bị động + pháp bảo (trần 60%): đây là lúc
  // đan buff/pháp bảo phát huy — giảm sát thương pháp bảo qua
  // artifacts.damageReduction (tổng từ statTotals của artifacts), bị
  // động hộ thể qua skills.passiveReduction. Linh địa đúng chỗ giảm
  // thêm theo bonus của nơi đó /2 (giếng +5%, Vọng Vân +7.5%, Độ Kiếp
  // Đài +10%) — đã hứa trong detail của điều kiện place.
  function tribReduction(ch, trib) {
    var red = 0;
    var SK = skillsApi();
    if (SK && typeof SK.passiveReduction === 'function') red += SK.passiveReduction(ch);
    var A = artifactsApi();
    if (A && typeof A.damageReduction === 'function') red += A.damageReduction(ch);
    if (trib && trib.place && PLACES[trib.place]) red += PLACES[trib.place].bonus / 200;
    return Math.min(0.6, red);
  }
  // Sát thương của đạo thứ idx (0-based): inside=true đứng trong vòng
  // chịu trọn; inside=false né ra ngoài chỉ chịu GRAZE_PCT.
  function tribStrikeDamage(ch, trib, idx, inside) {
    var L = logicApi();
    var tb = TRIBULATIONS[trib.targetRank];
    var form = TRIB_FORMS[trib.form] || TRIB_FORMS.thanh_loi;
    var pct = tb.dmgPcts[Math.min(idx, tb.dmgPcts.length - 1)];
    var raw = L.effMaxHp(ch) * pct / 100 * form.dmgMult;
    if (!inside) raw = raw * GRAZE_PCT / 100;
    var dmg = Math.max(1, Math.round(raw * (1 - tribReduction(ch, trib))));
    // THẾ LÔI PHÙ (js/talismans.js): lá đang chờ (trib.theLoiArmed) cháy
    // ở đạo đứng-trong-vòng này, hấp thụ pct% của sát thương SAU giảm
    // thường; né ra ngoài thì phù không cháy. Phần bị chặn không tính
    // Luyện Thể: bên gọi (simulate/game) cộng tankedEff theo phần trăm
    // còn lại dựa trên trường talisman trả ra ở đây.
    var tal = null;
    var TALt = talismanApi();
    if (TALt && typeof TALt.tribAbsorb === 'function') {
      var ab = TALt.tribAbsorb(ch, trib, inside);
      if (ab) {
        var absorbed = Math.round(dmg * ab.pct / 100);
        dmg = Math.max(0, dmg - absorbed);
        tal = { pct: ab.pct, absorbed: absorbed };
      }
    }
    return { dmg: dmg, pct: pct, formMult: form.dmgMult, inside: !!inside, talisman: tal };
  }
  // Kết thúc kiếp. outcome 'survived': lên cảnh giới + luyện thể + ban
  // phước (ấn + hồi đầy). outcome 'dead': mất % tu vi + cooldown, vật
  // dẫn kiếp đã mất ở startTribulation (không hoàn). Xoá ch.tribulation.
  function resolveTribulation(ch, outcome, opts) {
    opts = opts || {};
    var trib = ch.tribulation;
    if (!trib) return { ok: false, reason: 'no_tribulation' };
    var now = typeof opts.now === 'number' ? opts.now : Date.now();
    var toRank = trib.targetRank;
    var form = TRIB_FORMS[trib.form] || TRIB_FORMS.thanh_loi;
    delete ch.tribulation;
    if (outcome === 'survived') {
      // Luyện thể tính theo tankedEff: đạo bị Thế Lôi Phù chặn một phần
      // chỉ tính phần sát thương thân xác thật sự gánh (1 - pct chặn).
      // Không có phù thì tankedEff === tanked như cũ.
      var tPts = (typeof trib.tankedEff === 'number') ? trib.tankedEff : (trib.tanked || 0);
      var gains = temperGainsFor(toRank, form, tPts);
      // Luyện thể cộng VĨNH VIỄN vào chỉ số gốc (cùng đường BREAK_GROWTH).
      ch.maxHp += gains.maxHp; ch.atk += gains.atk; ch.def += gains.def;
      if (!ch.temperTotal) ch.temperTotal = { maxHp: 0, atk: 0, def: 0, points: 0 };
      ch.temperTotal.maxHp += gains.maxHp; ch.temperTotal.atk += gains.atk;
      ch.temperTotal.def += gains.def; ch.temperTotal.points += gains.points;
      applyAdvance(ch, toRank, 0, true); // cũng hồi đầy HP + linh lực (ban phước)
      ch.thienDaoAn = Math.min(AN_MAX, Math.max(ch.thienDaoAn || 0, toRank - 1));
      // Ấn cộng % HP tối đa nên phải hồi đầy LẠI sau khi nhận ấn.
      ch.hp = logicApi().effMaxHp(ch);
      return {
        ok: true, success: true, kind: 'cross', realm: ch.realm, rank: toRank, stage: 0,
        form: form.id, formName: form.name, tanked: trib.tanked || 0, tankedEff: (typeof trib.tankedEff === 'number' ? trib.tankedEff : (trib.tanked || 0)),
        temper: gains, thienDaoAn: ch.thienDaoAn, blessed: true
      };
    }
    var rule = CROSS_RULES[toRank];
    var loss = Math.floor(ch.tuVi * rule.failLossPct / 100);
    ch.tuVi -= loss;
    ch.bpCdUntil = now + rule.cooldownSec * 1000;
    syncRealm(ch);
    return {
      ok: true, success: false, kind: 'cross', realm: ch.realm, rank: rankOf(ch),
      form: form.id, formName: form.name, tanked: trib.tanked || 0, tankedEff: (typeof trib.tankedEff === 'number' ? trib.tankedEff : (trib.tanked || 0)),
      lostTuVi: loss, cooldownSec: rule.cooldownSec, usedItems: trib.usedItems || []
    };
  }
  // Mô phỏng kiếp không giao diện (test + cân bằng): policy(trib, idx)
  // trả 'stay' (chịu trọn trong vòng) hoặc 'dodge' (né ra ngoài); opts
  // .onRest(ch, trib, idx) chạy giữa các đạo (uống đan hồi máu, đốt
  // Thế Lôi Phù cho đạo kế... — mọi thao tác đều trên nhân vật nên ch
  // đứng đầu; hook cũ chỉ dùng trib/idx hoặc closure thì không đổi). Tự áp
  // sát thương lên ch.hp, đếm đạo chịu trọn, chết giữa kiếp thì resolve
  // 'dead', sống hết thì resolve 'survived'. Kết quả mang thêm cờ
  // survived (true/false) + strikesLog để bên gọi khỏi đoán qua success.
  function simulateTribulation(ch, qs, opts) {
    opts = opts || {};
    var st = startTribulation(ch, qs, opts);
    if (!st.ok) return st;
    var trib = st.trib;
    var log = [];
    for (var i = 0; i < trib.strikes; i++) {
      trib.idx = i;
      var act = typeof opts.policy === 'function' ? opts.policy(trib, i) : 'stay';
      var inside = act !== 'dodge';
      var hit = tribStrikeDamage(ch, trib, i, inside);
      ch.hp -= hit.dmg;
      if (inside) {
        trib.tanked += 1;
        trib.tankedEff = (trib.tankedEff || 0) + (hit.talisman ? (1 - hit.talisman.pct / 100) : 1);
      }
      log.push({ idx: i, action: inside ? 'stay' : 'dodge', dmg: hit.dmg, pct: hit.pct, hpAfter: ch.hp, talisman: hit.talisman || null });
      if (ch.hp <= 0) {
        ch.hp = 0;
        var dead = resolveTribulation(ch, 'dead', opts);
        dead.strikesLog = log; dead.diedAt = i; dead.survived = false;
        return dead;
      }
      if (i < trib.strikes - 1 && typeof opts.onRest === 'function') opts.onRest(ch, trib, i);
    }
    var win = resolveTribulation(ch, 'survived', opts);
    win.strikesLog = log; win.survived = true;
    return win;
  }

  // ---------------- Hình thái nhân vật theo cảnh giới ----------------
  // FORMS[rank]: dữ liệu hình thái phủ lên sheet nhân vật hiện có.
  // palette = tông màu trang phục theo cảnh giới (ao = áo chính, vien =
  // viền/đai, phatSang = điểm phát sáng) — pha mỹ thuật sau dùng bảng này
  // để vẽ lại trang phục riêng; hiện tại game.js dùng palette cho vòng
  // sáng/hạt/quầng hào quang quanh nhân vật (drawFormBack/Front).
  var FORMS = {
    0: { rank: 0, name: 'Phàm Nhân', auraColor: null, auraAlpha: 0, ringColor: null, ringR: 0, ring2: false, fieldR: 0,
      particles: 0, particleColor: null, orbitR: 0, orbitSpeed: 0, ghost: false, lightning: false,
      palette: { ao: '#8a7a5f', vien: '#5d4c33', phatSang: null },
      desc: 'Áo vải thô của người làng, không một tia linh quang.' },
    1: { rank: 1, name: 'Luyện Khí', auraColor: '#bfe3ff', auraAlpha: 0.10, ringColor: '#9fd8ff', ringR: 20, ring2: false, fieldR: 0,
      particles: 3, particleColor: '#cfeeff', orbitR: 25, orbitSpeed: 0.7, ghost: false, lightning: false,
      palette: { ao: '#7fa8c9', vien: '#d8e6f2', phatSang: '#bfe3ff' },
      desc: 'Linh quang mỏng như sương quanh thân, vòng sáng mờ dưới chân.' },
    2: { rank: 2, name: 'Trúc Cơ', auraColor: '#7fe8d6', auraAlpha: 0.16, ringColor: '#7fe8d6', ringR: 24, ring2: false, fieldR: 0,
      particles: 6, particleColor: '#a8fff2', orbitR: 28, orbitSpeed: 0.9, ghost: false, lightning: false,
      palette: { ao: '#3f9e8f', vien: '#ffe9a8', phatSang: '#7fe8d6' },
      desc: 'Đạo cơ đã thành: hào quang ngọc bích ổn định, viền áo ánh kim.' },
    3: { rank: 3, name: 'Kim Đan', auraColor: '#ffd94a', auraAlpha: 0.20, ringColor: '#ffd94a', ringR: 26, ring2: true, fieldR: 0,
      particles: 9, particleColor: '#ffe98a', orbitR: 30, orbitSpeed: 1.1, ghost: false, lightning: false,
      palette: { ao: '#c9932b', vien: '#fff3c4', phatSang: '#ffd94a' },
      desc: 'Kim đan rực sáng trong đan điền, hào quang vàng kim hai vòng chồng nhau.' },
    4: { rank: 4, name: 'Nguyên Anh', auraColor: '#cfa6ff', auraAlpha: 0.22, ringColor: '#cfa6ff', ringR: 28, ring2: true, fieldR: 0,
      particles: 12, particleColor: '#e6ccff', orbitR: 33, orbitSpeed: 1.3, ghost: true, lightning: false,
      palette: { ao: '#7a4fd0', vien: '#e6ccff', phatSang: '#cfa6ff' },
      desc: 'Nguyên anh hư ảnh thấp thoáng sau lưng, linh quang tím lưu chuyển không ngừng.' },
    5: { rank: 5, name: 'Hóa Thần', auraColor: '#dfe9ff', auraAlpha: 0.24, ringColor: '#dfe9ff', ringR: 30, ring2: true, fieldR: 46,
      particles: 15, particleColor: '#ffffff', orbitR: 36, orbitSpeed: 1.5, ghost: true, lightning: false,
      palette: { ao: '#e8ecf4', vien: '#9fc4ff', phatSang: '#ffffff' },
      desc: 'Thần thức hoá thành lĩnh vực bạc trắng bao quanh, hư ảnh rõ nét như người thứ hai.' },
    6: { rank: 6, name: 'Độ Kiếp', auraColor: '#f2e6ff', auraAlpha: 0.28, ringColor: '#e6ccff', ringR: 32, ring2: true, fieldR: 54,
      particles: 18, particleColor: '#f7efff', orbitR: 39, orbitSpeed: 1.8, ghost: true, lightning: true,
      palette: { ao: '#4a3a6e', vien: '#ffe9a8', phatSang: '#e6ccff' },
      desc: 'Áo tím sẫm viền vàng, điện quang trắng tím chớp loé quanh thân — người sắp đối mặt thiên kiếp.' }
  };
  function formOf(ch) { return FORMS[rankOf(ch)] || FORMS[0]; }
  function hexRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }
  // Lớp SAU nhân vật: quầng hào quang + vòng sáng dưới chân + vòng lĩnh
  // vực. (cx, feetY) là điểm chân nhân vật trên canvas (đã trừ camera).
  function drawFormBack(ctx, ch, cx, feetY, tSec, quality) {
    var f = formOf(ch);
    if (!f.ringColor && !f.auraColor) return;
    var q = quality || 'cao';
    if (f.auraColor && q !== 'thap') {
      var rgb = hexRgb(f.auraColor);
      var r = 52 + Math.sin(tSec * 2) * 3;
      var gr = ctx.createRadialGradient(cx, feetY - 42, 4, cx, feetY - 42, r);
      gr.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + f.auraAlpha + ')');
      gr.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(cx, feetY - 42, r, 0, Math.PI * 2); ctx.fill();
    }
    if (f.fieldR) {
      ctx.globalAlpha = 0.14 + 0.05 * Math.sin(tSec * 1.4);
      ctx.strokeStyle = f.ringColor; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, feetY - 2, f.fieldR, f.fieldR * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (f.ringColor) {
      ctx.globalAlpha = 0.55 + 0.2 * Math.sin(tSec * 2.4);
      ctx.strokeStyle = f.ringColor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, feetY - 2, f.ringR, f.ringR * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
      if (f.ring2) {
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(tSec * 2.4 + 1.2);
        ctx.beginPath(); ctx.ellipse(cx, feetY - 2, f.ringR * 0.72, f.ringR * 0.27, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  // Lớp TRƯỚC nhân vật: hạt linh quang bay quanh theo quỹ đạo + tia điện
  // chớp (Độ Kiếp). Vị trí hạt tất định theo tSec (không random/frame).
  function drawFormFront(ctx, ch, cx, feetY, tSec, quality) {
    var f = formOf(ch);
    var q = quality || 'cao';
    if (f.particles > 0 && q !== 'thap') {
      var n = q === 'trung' ? Math.ceil(f.particles * 0.6) : f.particles;
      ctx.fillStyle = f.particleColor;
      for (var i = 0; i < n; i++) {
        var a = tSec * f.orbitSpeed + i * (Math.PI * 2 / n);
        var ox = Math.cos(a) * f.orbitR, oy = Math.sin(a) * f.orbitR * 0.32 - 40 - (i % 3) * 9;
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(tSec * 3 + i * 1.7);
        ctx.beginPath(); ctx.arc(cx + ox, feetY + oy, 1.6 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (f.lightning && q === 'cao') {
      // Tia điện chớp quanh thân: đoạn gấp khúc tất định theo nhịp 0.4s.
      var beat = Math.floor(tSec / 0.4), ph = (tSec % 0.4) / 0.4;
      if (ph < 0.3) {
        ctx.globalAlpha = 0.8 * (1 - ph / 0.3);
        ctx.strokeStyle = '#e6ccff'; ctx.lineWidth = 1.6;
        for (var s = 0; s < 2; s++) {
          var seed = beat * 7 + s * 13;
          var bx = cx + ((seed * 37) % 41) - 20, by = feetY - 78;
          ctx.beginPath(); ctx.moveTo(bx, by);
          for (var k = 1; k <= 4; k++) ctx.lineTo(bx + ((seed * (k + 3) * 11) % 17) - 8, by + k * 15);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
    if (f.ghost && q !== 'thap') {
      // Hư ảnh nguyên anh/thần thức: bóng mờ lệch sau lưng (vẽ bằng vòng
      // sáng dọc mờ — sheet riêng cho hư ảnh là pha mỹ thuật sau).
      ctx.globalAlpha = 0.10 + 0.04 * Math.sin(tSec * 1.8);
      ctx.fillStyle = f.auraColor;
      ctx.beginPath(); ctx.ellipse(cx + 14, feetY - 46, 15, 34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ---------------- Thang tổng cho panel ----------------
  function ladder() {
    var L = logicApi();
    var rows = [
      { rank: 0, name: 'Phàm Nhân', stages: ['—'], needs: [100], cross: null },
      { rank: 1, name: 'Luyện Khí', stages: L ? L.TIERS.map(function (t) { return t.realm; }) : [], needs: L ? L.TIERS.map(function (t) { return t.need; }) : [], cross: CROSS_RULES[2] }
    ];
    [2, 3, 4, 5, 6].forEach(function (rank) {
      rows.push({
        rank: rank, name: HIGH[rank].name,
        stages: STAGES.map(function (s) { return HIGH[rank].name + ' ' + s.name; }),
        needs: HIGH[rank].needs.slice(),
        cross: rank < 6 ? CROSS_RULES[rank + 1] : null,
        tribulation: TRIBULATIONS[rank] || null
      });
    });
    return rows;
  }

  var api = {
    STAGES: STAGES, HIGH: HIGH, PLACES: PLACES, CROSS_RULES: CROSS_RULES,
    stageRule: stageRule, TRIBULATIONS: TRIBULATIONS, TRIB_FORMS: TRIB_FORMS,
    GRAZE_PCT: GRAZE_PCT, formWeights: formWeights, rollForm: rollForm,
    formColorAt: formColorAt, rootQuality: rootQuality,
    temperPerPoint: temperPerPoint, temperCaps: temperCaps, temperGainsFor: temperGainsFor,
    rankOf: rankOf, displayName: displayName, stageNeed: stageNeed, syncRealm: syncRealm,
    llBonus: llBonus, llRegenBonus: llRegenBonus,
    AN_PER_PCT: AN_PER_PCT, AN_MAX: AN_MAX, blessingMult: blessingMult,
    handles: handles, info: info, canBreakthrough: canBreakthrough, doBreakthrough: doBreakthrough,
    startTribulation: startTribulation, tribReduction: tribReduction,
    tribStrikeDamage: tribStrikeDamage, resolveTribulation: resolveTribulation,
    simulateTribulation: simulateTribulation,
    FORMS: FORMS, formOf: formOf, drawFormBack: drawFormBack, drawFormFront: drawFormFront,
    ladder: ladder
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_REALMS = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_REALMS = api;
})();
