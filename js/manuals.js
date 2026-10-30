// Phàm Nhân Tu Đạo — HỆ BÍ TỊCH SKILL (lệnh Bui 07:05 ngày 2026-10-30:
// "Tạo bí tịch skill"). Module thuần dữ liệu + luật, test bằng Node
// (mục "BT:" trong test-smoke.js); game.js chỉ lo hiển thị/nối dây.
//
// THIẾT KẾ (chốt):
// - Trước đợt này game KHÔNG có vật phẩm bí tịch: skill mở theo tiến
//   trình. Hệ này thêm SÁCH HỌC CHIÊU ngoài bộ cơ bản — bộ cơ bản trong
//   js/skills.js giữ nguyên tuyệt đối. Bí tịch dạy 21 chiêu mở rộng:
//   10 chiêu định danh của 10 tông môn, 6 chiêu ký danh của boss thế
//   giới, 3 chiêu hiếm (bí cảnh/kỳ ngộ/vết nứt) và 2 chiêu phổ thông.
// - LUẬT HỌC (ghi rõ): sách là tri thức — ai GIỮ ĐƯỢC SÁCH và đủ CẢNH
//   GIỚI đều học được, không bắt buộc đúng tông. Tông môn chỉ kiểm
//   soát quầy TÀNG KINH CÁC của mình trong Kho Tông: đổi bí tịch của
//   tông mình bằng Điểm Cống Hiến, tuyệt học tông cần hàm Nội Môn.
// - PHẨM + CỔNG: Phàm (Luyện Khí tầng 1) · Linh (tầng 3) · Huyền
//   (tầng 6) · Địa (Trúc Cơ) · Thiên (Kim Đan). Nhặt được sách phẩm
//   cao mà chưa đủ cảnh giới thì sách nằm yên trong túi, panel/túi ghi
//   rõ "cần cảnh giới X" — đúng luật Bui chốt từ game tu tiên trước.
// - NÂNG CẤP: chiêu học từ bí tịch nâng cấp bằng THAM NGỘ. Điểm tham
//   ngộ (0–100/cấp) đến từ: đọc sách TRÙNG của chính chiêu đó (vật
//   phẩm) hoặc tĩnh tọa tham ngộ tốn tu vi + Linh Thạch. Đủ 100 điểm
//   là chiêu lên 1 cấp (tự động, không thêm phí). Cấp tối đa theo
//   phẩm: Phàm 3 · Linh 5 · Huyền 7 · Địa 9 · Thiên 10. Sách trùng
//   khi chiêu đã viên mãn thì BÁN được theo giá phẩm (mục SELL_LT,
//   ghi vào docs/economy.md) — bán qua panel Kỹ Năng.
// - Trạng thái lưu trên nhân vật: ch.manuals = { skillId: cấp },
//   ch.manualProg = { skillId: điểm tham ngộ }. Save cũ không có hai
//   trường này: ensure() khởi tạo lười, nạp an toàn tuyệt đối.
// - ĐỢT 2 (lệnh Bui 07:45 + 07:46 ngày 2026-10-30): thêm 11 quyển VỠ
//   LÒNG — 5 bí tịch cơ bản (kiếm quyết/chưởng/khiên hộ thể/bộ pháp/
//   bị động Dẫn Khí Quyết) + 6 pháp quyết nhập môn theo hệ (Hỏa Cầu
//   mẫu). Cả 11 đều Phàm phẩm nhưng có CỔNG RIÊNG từng quyển là Luyện
//   Khí tầng 2 (trường `gate` trong định nghĩa — cổng chung của phẩm
//   Phàm vẫn là tầng 1, không hạ). Nguồn dễ kiếm: Tủ sách làng (50 LT,
//   trưởng làng bán), nhiệm vụ chính 2 + 3 tặng 2 quyển đầu, Tàng Kinh
//   Các mọi tông 40 điểm cống hiến.
// - NỐI VÀO KHUNG SKILL: khi nạp, module đăng ký 21 chiêu vào
//   PNT_SKILLS.SKILLS + PNT_SKILLS.BAR3 (thanh bí tịch). skills.js có
//   móc lười: isUnlocked của chiêu manual = đã học ở đây; skillDef
//   của chiêu manual = effectiveDef() ở đây (đã co theo cấp). Phím /
//   hồi chiêu / linh lực đi qua đúng Logic sẵn có của skills.js.
// - CHỐNG HACK: vật phẩm bt_* đăng ký trong Logic.ITEMS (trường
//   manualSkill) nên bộ kiểm item lạ của js/anticheat.js chấp nhận;
//   đường bán sách đi qua guardGain('sell') như mọi đường bán đồ.
(function (global) {
  'use strict';

  // ---------- Tra cứu lười các module khác (mẫu chung của dự án) ----
  function lazy(name, nodePath) {
    if (typeof window !== 'undefined' && window[name]) return window[name];
    if (typeof globalThis !== 'undefined' && globalThis[name]) return globalThis[name];
    if (nodePath && typeof module !== 'undefined' && module.exports) {
      try { return require(nodePath); } catch (e) { return null; }
    }
    return null;
  }
  function logic() { return lazy('PNT_LOGIC', './logic.js'); }
  function mapsLib() { return lazy('PNT_MAPS', './maps.js'); }
  function skillsLib() { return lazy('PNT_SKILLS', './skills.js'); }
  function sectPoints() { return lazy('PNT_SECT', './sect-points.js'); }
  function sectsLib() { return lazy('PNT_SECTS', './sects.js'); }
  function realmRankOf(ch) {
    var MP = mapsLib();
    if (MP && typeof MP.realmRankOf === 'function') return MP.realmRankOf(ch);
    if (!ch) return 0;
    if (typeof ch.realmRank === 'number') return ch.realmRank;
    return (ch.tier || 0) > 0 ? 1 : 0;
  }
  var REALM_NAMES = { 2: 'Trúc Cơ', 3: 'Kim Đan', 4: 'Nguyên Anh', 5: 'Hóa Thần', 6: 'Độ Kiếp' };

  // ---------- Phẩm bí tịch ----------
  // gate: { tier } = cần Luyện Khí tầng đó; { realm } = cần cảnh giới
  // lớn hạng đó (thang REALMS của maps.js). medTuVi/medLt = phí 1 lần
  // tĩnh tọa tham ngộ ở CẤP 1 (nhân với cấp hiện tại khi tính phí).
  var GRADES = {
    pham: { id: 'pham', name: 'Phàm', maxLvl: 3, gate: { tier: 1 }, progPerBook: 50, sell: 25, medTuVi: 12, medLt: 8 },
    linh: { id: 'linh', name: 'Linh', maxLvl: 5, gate: { tier: 3 }, progPerBook: 40, sell: 70, medTuVi: 20, medLt: 14 },
    huyen: { id: 'huyen', name: 'Huyền', maxLvl: 7, gate: { tier: 6 }, progPerBook: 34, sell: 180, medTuVi: 30, medLt: 22 },
    dia: { id: 'dia', name: 'Địa', maxLvl: 9, gate: { realm: 2 }, progPerBook: 25, sell: 420, medTuVi: 45, medLt: 34 },
    thien: { id: 'thien', name: 'Thiên', maxLvl: 10, gate: { realm: 3 }, progPerBook: 20, sell: 900, medTuVi: 65, medLt: 50 }
  };
  var PROGRESS_MAX = 100;   // điểm tham ngộ cần cho 1 cấp
  var MEDITATE_GAIN = 20;   // điểm tham ngộ mỗi lần tĩnh tọa

  // ---------- Danh mục 21 bí tịch ----------
  // mech/color bám đúng các mech game.js đã xử lý (projectile,
  // projectile_wide, aoe_self, aoe_point, chain, dash, orbit, shield,
  // domain, line) — hiệu ứng vẽ qua js/skill-fx.js theo hệ của chiêu.
  var MANUALS = {
    // ===== 10 chiêu định danh tông môn (Huyền phẩm) =====
    tp_kiem_tran: { id: 'tp_kiem_tran', item: 'bt_tp_kiem_tran', sect: 'thanh_phong', grade: 'huyen',
      name: 'Thanh Phong Kiếm Trận', key: 'y', mech: 'aoe_point', color: '#7ec3f0',
      cd: 15, mana: 34, mult: 2.3, radius: 125,
      desc: 'Tuyệt học Thanh Phong Phái: mười hai thanh phong kiếm từ trời giáng xuống cắm quanh mục tiêu, kiếm ý thanh phong xé toạc cả vùng.',
      source: 'Tàng Kinh Các Thanh Phong Phái (260 điểm, Nội Môn) · đấu giá · boss' },
    hp_ngu_hanh: { id: 'hp_ngu_hanh', item: 'bt_hp_ngu_hanh', sect: 'huyen_phap', grade: 'huyen',
      name: 'Ngũ Hành Luân Chuyển', key: 'u', mech: 'chain', color: '#b78ce0',
      cd: 13, mana: 36, mult: 2.0, range: 260, targets: 4,
      desc: 'Tuyệt học Huyền Pháp Tông: ngũ hành luân xoay một vòng, pháp lực nhảy qua 4 kẻ địch gần nhất, mỗi vòng yếu dần mà không dừng.',
      source: 'Tàng Kinh Các Huyền Pháp Tông (260 điểm, Nội Môn) · boss · bí cảnh' },
    tc_pha_son: { id: 'tc_pha_son', item: 'bt_tc_pha_son', sect: 'thien_cong', grade: 'huyen',
      name: 'Thiên Công Phá Sơn Chùy', key: 'i', mech: 'line', color: '#d99a4e',
      cd: 12, mana: 32, mult: 2.4, range: 150, width: 80,
      desc: 'Tuyệt học Thiên Công Phường: một chùy rèn ngàn cân nện xuống làm mặt đất nứt toác theo đường thẳng, đá trụ đội lên đâm mọi kẻ trên đường nứt.',
      source: 'Tàng Kinh Các Thiên Công Phường (260 điểm, Nội Môn) · boss · bí cảnh' },
    dh_dan_hoa: { id: 'dh_dan_hoa', item: 'bt_dh_dan_hoa', sect: 'dan_ha', grade: 'huyen',
      name: 'Đan Hỏa Liệu Nguyên', key: 'o', mech: 'aoe_point', color: '#ff7a3c',
      cd: 14, mana: 34, mult: 2.4, radius: 115,
      desc: 'Tuyệt học Đan Hà Cốc: lửa lò đan nén trăm ngày bùng nổ tại điểm chỉ định — đan hỏa công, vừa là thuật luyện đan vừa là thuật giết địch.',
      source: 'Tàng Kinh Các Đan Hà Cốc (260 điểm, Nội Môn) · boss · bí cảnh' },
    vt_hao_lenh: { id: 'vt_hao_lenh', item: 'bt_vt_hao_lenh', sect: 'van_thu', grade: 'huyen',
      name: 'Vạn Thú Hào Lệnh', key: 'p', mech: 'orbit', color: '#69d66f',
      cd: 20, mana: 38, mult: 1.1, dur: 6, tick: 0.5, radius: 120,
      desc: 'Tuyệt học Vạn Thú Môn: một tiếng hào lệnh, ảo ảnh bầy thú linh khí xúm quanh thân 6 giây, tự vồ kẻ địch gần nhất mỗi nửa giây.',
      source: 'Tàng Kinh Các Vạn Thú Môn (260 điểm, Nội Môn) · boss · bí cảnh' },
    tphu_kiem_tran: { id: 'tphu_kiem_tran', item: 'bt_tphu_kiem_tran', sect: 'thien_phu', grade: 'huyen',
      name: 'Kim Phù Kiếm Trận', key: 'z', mech: 'aoe_point', color: '#ffd94a',
      cd: 15, mana: 34, mult: 2.2, radius: 120,
      desc: 'Tuyệt học Thiên Phù Các: chín lá kim phù bay lên không trung hóa thành phù kiếm giáng xuống quanh mục tiêu — bùa chưa chạm đất, kiếm đã tới nơi.',
      source: 'Tàng Kinh Các Thiên Phù Các (260 điểm, Nội Môn) · boss · bí cảnh' },
    cc_khon_tran: { id: 'cc_khon_tran', item: 'bt_cc_khon_tran', sect: 'cuu_cung', grade: 'huyen',
      name: 'Cửu Cung Khốn Trận', key: 'x', mech: 'domain', color: '#7aa2e0',
      cd: 24, mana: 40, mult: 0.5, radius: 150, dur: 6, tick: 0.5, slowPct: 45,
      desc: 'Tuyệt học Cửu Cung Trận Tông: bày trận cửu cung quanh thân 6 giây — địch trong trận bị thế trận níu chân, chậm gần một nửa và chịu trận khí xé mỗi nửa giây.',
      source: 'Tàng Kinh Các Cửu Cung Trận Tông (260 điểm, Nội Môn) · boss · bí cảnh' },
    kc_bat_hoai: { id: 'kc_bat_hoai', item: 'bt_kc_bat_hoai', sect: 'kim_cang', grade: 'huyen',
      name: 'Kim Cang Bất Hoại Thể', key: 'c', mech: 'shield', color: '#ffd94a',
      cd: 20, mana: 36, shieldPct: 45, dur: 7,
      desc: 'Tuyệt học Kim Cang Môn: thân thể hóa kim cang, dựng lớp thể khiên chịu thay 45% HP tối đa trong 7 giây — đứng yên giữa bầy thú mà không lùi một bước.',
      source: 'Tàng Kinh Các Kim Cang Môn (260 điểm, Nội Môn) · boss · bí cảnh' },
    nd_thuc_cot: { id: 'nd_thuc_cot', item: 'bt_nd_thuc_cot', sect: 'ngu_doc', grade: 'huyen',
      name: 'Ngũ Độc Thực Cốt', key: 'b', mech: 'projectile_wide', color: '#3fae6a',
      cd: 11, mana: 30, mult: 2.0, speed: 360, range: 210, width: 70, slow: 2.0,
      desc: 'Tuyệt học Ngũ Độc Giáo: một làn chướng độc xanh thẫm phun thẳng về phía trước, độc khí bám vào gân cốt làm kẻ trúng đòn chậm hẳn 2 giây.',
      source: 'Tàng Kinh Các Ngũ Độc Giáo (260 điểm, Nội Môn) · boss · bí cảnh' },
    ha_han_tien: { id: 'ha_han_tien', item: 'bt_ha_han_tien', sect: 'huyen_am', grade: 'huyen',
      name: 'Huyền Âm Hàn Tiễn', key: 'n', mech: 'projectile', color: '#bfe3ff',
      cd: 9, mana: 30, mult: 2.3, speed: 460, range: 260, width: 40, slow: 1.2,
      desc: 'Tuyệt học Huyền Âm Cung: một mũi hàn tiễn ngưng từ tiếng đàn đứt đoạn bay thẳng xuyên mục tiêu, hàn khí níu chân kẻ trúng đòn 1,2 giây.',
      source: 'Tàng Kinh Các Huyền Âm Cung (260 điểm, Nội Môn) · boss · bí cảnh' },
    // ===== 6 chiêu ký danh boss thế giới =====
    boss_lang_hao: { id: 'boss_lang_hao', item: 'bt_boss_lang_hao', boss: 'lang_vuong', grade: 'huyen',
      name: 'Huyết Nguyệt Lang Hào', key: 'm', mech: 'aoe_self', color: '#ff5a4e',
      cd: 12, mana: 32, mult: 1.9, radius: 105,
      desc: 'Chiêu của Lang Vương Huyết Nguyệt: tiếng hú trăng máu cuốn thành sóng chấn động quanh thân, xé nát mọi kẻ địch đứng gần.',
      source: 'Lang Vương Huyết Nguyệt rơi 12%' },
    boss_ho_gam: { id: 'boss_ho_gam', item: 'bt_boss_ho_gam', boss: 'son_quan', grade: 'dia',
      name: 'Sơn Quân Hổ Gầm', key: '', mech: 'aoe_point', color: '#ffb03a',
      cd: 16, mana: 48, mult: 2.8, radius: 130,
      desc: 'Chiêu của Sơn Quân: tiếng gầm của hổ vương trấn núi dội xuống một vùng, đất rung, thú nhỏ nghe thấy là quỵ chân.',
      source: 'Sơn Quân (thế giới) rơi 10%' },
    boss_xa_thuc: { id: 'boss_xa_thuc', item: 'bt_boss_xa_thuc', boss: 'xa_vuong', grade: 'huyen',
      name: 'Xà Vương Thực Hồn', key: 'l', mech: 'chain', color: '#57d977',
      cd: 12, mana: 32, mult: 1.9, range: 240, targets: 3,
      desc: 'Chiêu của Xà Vương Đuôi Đỏ: nọc độc hóa thành tia xanh nhảy qua 3 kẻ địch gần nhất, thấm thẳng vào hồn phách.',
      source: 'Xà Vương Đuôi Đỏ rơi 12%' },
    boss_thiet_bi: { id: 'boss_thiet_bi', item: 'bt_boss_thiet_bi', boss: 'thiet_bi_vuong', grade: 'dia',
      name: 'Thiết Bì Trùng Kích', key: '', mech: 'dash', color: '#d99a4e',
      cd: 10, mana: 40, mult: 2.6, range: 150,
      desc: 'Chiêu của Thiết Bì Vương: lấy thân làm cối xay, lao thẳng một đường xuyên qua kẻ địch — da sắt của nó chưa từng biết né.',
      source: 'Thiết Bì Vương rơi 10%' },
    boss_co_mang: { id: 'boss_co_mang', item: 'bt_boss_co_mang', boss: 'co_mang_vuong', grade: 'dia',
      name: 'Cổ Mãng Bàn Long', key: '', mech: 'domain', color: '#69d66f',
      cd: 24, mana: 52, mult: 0.6, radius: 140, dur: 6, tick: 0.5, slowPct: 40,
      desc: 'Chiêu của Cổ Mãng Vương: thân mãng linh khí cuộn thành vòng quanh người thi triển 6 giây, ai bước vào cũng bị siết chậm và nghiền nát dần.',
      source: 'Cổ Mãng Vương rơi 8%' },
    boss_ma_vuong: { id: 'boss_ma_vuong', item: 'bt_boss_ma_vuong', boss: 'thiet_bi_ma_vuong', grade: 'thien',
      name: 'Ma Vương Diệt Thế Chùy', key: '', mech: 'aoe_point', color: '#ff7a3c',
      cd: 22, mana: 80, mult: 3.6, radius: 150,
      desc: 'Chiêu của Thiết Bì Ma Vương: một chùy diệt thế nện xuống vùng chỉ định, lửa và đất đá bùng lên như ngày tận của Hang Vực Sâu.',
      source: 'Thiết Bì Ma Vương rơi 8%' },
    // ===== 3 chiêu hiếm: bí cảnh / kỳ ngộ / vết nứt =====
    rare_van_kiem: { id: 'rare_van_kiem', item: 'bt_rare_van_kiem', grade: 'thien',
      name: 'Vạn Kiếm Quy Tông', key: '', mech: 'aoe_point', color: '#ffd94a',
      cd: 24, mana: 85, mult: 3.4, radius: 160,
      desc: 'Kiếm phổ thất truyền của cổ tu: vạn kiếm từ bốn phương quy về một điểm — chiêu này không thuộc tông nào, chỉ thuộc về người đủ duyên mở được Kiếm Mộ.',
      source: 'Kiếm Mộ Cổ 10% · Cổ Tu Động Phủ 6% · kỳ ngộ Tàn Phủ 3% (cực hiếm)' },
    rare_cuu_u: { id: 'rare_cuu_u', item: 'bt_rare_cuu_u', grade: 'dia',
      name: 'Cửu U Hàn Diệm', key: '', mech: 'chain', color: '#9adbe8',
      cd: 16, mana: 55, mult: 2.4, range: 300, targets: 5,
      desc: 'Lửa lạnh của Cửu U rò ra từ Vết Nứt Hư Không: hàn diệm nhảy qua 5 kẻ địch, cháy mà không ấm, đông mà vẫn thiêu.',
      source: 'Hàn Băng Động (vết nứt) 8% · vương thú Đại Sơn sâu 4–5%' },
    rare_hoi_xuan: { id: 'rare_hoi_xuan', item: 'bt_rare_hoi_xuan', grade: 'dia',
      name: 'Đại Bi Hồi Xuân Chú', key: '', mech: 'aoe_self', color: '#69d66f',
      cd: 20, mana: 50, mult: 1.3, radius: 100, healPct: 0.15,
      desc: 'Chú văn của một y tu vô danh để lại trong Vạn Yêu Sào: sinh cơ bùng lên quanh thân, quật ngã kẻ địch và hồi 15% HP cho người niệm chú.',
      source: 'Vạn Yêu Sào 10% · kỳ ngộ Linh Điền Hoang 5% · vương thú 4–5%' },
    // ===== 5 bí tịch CƠ BẢN (Phàm phẩm — cổng riêng TỪNG QUYỂN là
    // Luyện Khí tầng 2, lệnh Bui 07:45 30/10 "Một số bí tịch cơ bản cho
    // luyện khí tầng 2"). Đồ vỡ lòng cho tân thủ: yếu rõ rệt so với 2
    // quyển Linh phẩm phổ thông (mult 1,7–1,9), trần cấp Phàm = 3.
    cb_thanh_khe: { id: 'cb_thanh_khe', item: 'bt_cb_thanh_khe', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Thanh Khê Kiếm Quyết', key: '', mech: 'projectile', color: '#a8c8b8',
      cd: 5, mana: 10, mult: 1.3, speed: 430, range: 200, width: 40,
      desc: 'Kiếm quyết vỡ lòng của làng Thanh Khê, trưởng làng Trần Đức chép tay từ kiếm phổ cũ của làng: một luồng kiếm khí mỏng bay thẳng xuyên mục tiêu — chiêu đầu tiên nhiều tu sĩ Thanh Sơn học trong đời.',
      source: 'Trưởng làng tặng lúc lộ linh căn (NV chính 2) · Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    cb_liet_phong: { id: 'cb_liet_phong', item: 'bt_cb_liet_phong', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Liệt Phong Chưởng', key: '', mech: 'aoe_self', color: '#9ad6a8',
      cd: 7, mana: 12, mult: 1.25, radius: 88,
      desc: 'Chưởng pháp vỡ lòng mượn sức gió núi Thanh Sơn: một chưởng đẩy luồng liệt phong quét quanh thân tầm gần, hất văng đám thú nhỏ đang bâu vào người.',
      source: 'Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    cb_thiet_bo: { id: 'cb_thiet_bo', item: 'bt_cb_thiet_bo', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Thiết Bố Sam', key: '', mech: 'shield', color: '#c9a876',
      cd: 14, mana: 14, shieldPct: 15, dur: 5,
      desc: 'Công phu vận khí vỡ lòng: linh khí kết thành lớp áo sắt mỏng hộ thể, chịu thay 15% HP tối đa trong 5 giây — đủ qua một đòn bất ngờ của thú dữ, không hơn.',
      source: 'Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    cb_tat_phong: { id: 'cb_tat_phong', item: 'bt_cb_tat_phong', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Tật Phong Bộ', key: '', mech: 'haste', color: '#9adbe8',
      cd: 16, mana: 12, speedPct: 18, dur: 5,
      desc: 'Bộ pháp vỡ lòng mượn gió dưới chân: tốc độ di chuyển +18% trong 5 giây — để chạy đường mòn, thoát vòng vây thú dữ hay đuổi theo con mồi sắp tuột. Chỉ là chạy nhanh, không phải chiêu lướt tấn công.',
      source: 'Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    cb_dan_khi: { id: 'cb_dan_khi', item: 'bt_cb_dan_khi', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Dẫn Khí Quyết', key: '', mech: 'passive', passive: true, color: '#8fd0a8',
      cd: 0, mana: 0, tuViPct: 8,
      desc: 'Công pháp BỊ ĐỘNG vỡ lòng: khẩu quyết dẫn khí nhập thể mà trưởng làng dạy buổi thổ nạp đầu tiên. Học xong tự vận hành — mỗi lần thổ nạp được +8% tu vi (mỗi cấp tham ngộ +2%, tối đa +12% ở cấp 3).',
      source: 'Trưởng làng tặng ở NV Thổ Nạp Đầu Tiên (NV chính 3) · Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    // ===== 6 PHÁP QUYẾT NHẬP MÔN (Phàm phẩm — cổng riêng tầng 2, lệnh
    // Bui 07:46 30/10): thuật pháp theo hệ cho tân thủ, mẫu là Hỏa Cầu
    // Thuật. Sát thương hệ đi qua Logic.applyOffense (opts.elem = hệ
    // của chiêu): người học có % hệ đó (từ trang bị) thì được cộng như
    // Thiên Căn Thần Thông, học khác hệ vẫn dùng được bình thường.
    pq_hoa_cau: { id: 'pq_hoa_cau', item: 'bt_pq_hoa_cau', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Hỏa Cầu Thuật', key: '', mech: 'projectile', elem: 'hoa', color: '#ff7a3c',
      cd: 5, mana: 12, mult: 1.5, speed: 400, range: 210, width: 44, burnPct: 20, burnDur: 2,
      desc: 'Pháp quyết nhập môn hệ Hỏa: ngưng một cầu lửa nhỏ ném thẳng vào địch, lửa bám cháy thêm 2 giây (mỗi giây 20% sát thương chiêu). Thuật pháp đầu tiên mà gần như mọi đệ tử mới đều tập qua.',
      source: 'Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    pq_thuy_tien: { id: 'pq_thuy_tien', item: 'bt_pq_thuy_tien', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Thủy Tiễn Thuật', key: '', mech: 'projectile', elem: 'thuy', color: '#5aa7d6',
      cd: 5, mana: 11, mult: 1.45, speed: 520, range: 240, width: 34,
      desc: 'Pháp quyết nhập môn hệ Thủy: nước suối linh ngưng thành mũi tiễn mảnh bay rất nhanh, xuyên thẳng qua mục tiêu trên đường — yếu mà nhanh và xa.',
      source: 'Tàng Kinh Các mọi tông (40 điểm)' },
    pq_bang_tien: { id: 'pq_bang_tien', item: 'bt_pq_bang_tien', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Băng Tiễn Thuật', key: '', mech: 'projectile', elem: 'bang', color: '#bfe3ff',
      cd: 6, mana: 12, mult: 1.35, speed: 460, range: 230, width: 38, slow: 1.2,
      desc: 'Pháp quyết nhập môn hệ Băng: một mũi băng tiễn bay thẳng, hàn khí níu chân kẻ trúng đòn, làm chậm 1,2 giây — chiêu giữ khoảng cách của tân thủ cẩn thận.',
      source: 'Tàng Kinh Các mọi tông (40 điểm)' },
    pq_loi_kich: { id: 'pq_loi_kich', item: 'bt_pq_loi_kich', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Lôi Kích Thuật', key: '', mech: 'chain', elem: 'loi', color: '#cfa6ff',
      cd: 3, mana: 10, mult: 1.55, range: 250, targets: 1,
      desc: 'Pháp quyết nhập môn hệ Lôi: một đạo sét nhỏ giáng thẳng xuống kẻ địch gần nhất — ra đòn nhanh nhất trong nhóm nhập môn, hồi chiêu chỉ 3 giây, nhưng chỉ đánh một mục tiêu.',
      source: 'Tàng Kinh Các mọi tông (40 điểm)' },
    pq_phong_nhan: { id: 'pq_phong_nhan', item: 'bt_pq_phong_nhan', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Phong Nhận Thuật', key: '', mech: 'projectile', elem: 'phong', color: '#9ad6a8',
      cd: 5, mana: 11, mult: 1.4, speed: 480, range: 280, width: 40,
      desc: 'Pháp quyết nhập môn hệ Phong: lưỡi gió mỏng như dao bay xa nhất trong nhóm nhập môn — tầm 280, hợp cho người thích đứng xa thả chiêu.',
      source: 'Tủ sách làng 50 LT · Tàng Kinh Các mọi tông (40 điểm)' },
    pq_tho_thu: { id: 'pq_tho_thu', item: 'bt_pq_tho_thu', grade: 'pham', gate: { tier: 2 }, basic: true,
      name: 'Thổ Thứ Thuật', key: '', mech: 'aoe_point', elem: 'tho', color: '#d99a4e',
      cd: 7, mana: 13, mult: 1.6, radius: 72,
      desc: 'Pháp quyết nhập môn hệ Thổ: gai đá nhọn đội đất đâm lên từ dưới chân kẻ địch ở điểm chỉ định — sát thương khá nhất nhóm nhập môn nhưng vùng đánh nhỏ.',
      source: 'Tàng Kinh Các mọi tông (40 điểm)' },
    // ===== 2 chiêu phổ thông (Linh phẩm) =====
    gen_phi_hoa: { id: 'gen_phi_hoa', item: 'bt_gen_phi_hoa', grade: 'linh',
      name: 'Phi Hoa Trích Diệp', key: '', mech: 'projectile', color: '#9ad6a8',
      cd: 6, mana: 18, mult: 1.7, speed: 420, range: 220, width: 46,
      desc: 'Chiêu nhập môn của các tán tu Thanh Sơn: hái hoa lá làm ám khí, một luồng phi hoa bay thẳng xuyên qua mục tiêu trên đường.',
      source: 'Kỳ ngộ Tàn Phủ 30% · Tàng Kinh Các (130 điểm) · đấu giá' },
    gen_luu_sa: { id: 'gen_luu_sa', item: 'bt_gen_luu_sa', grade: 'linh',
      name: 'Lưu Sa Chưởng', key: '', mech: 'line', color: '#d99a4e',
      cd: 9, mana: 22, mult: 1.9, range: 140, width: 72,
      desc: 'Chưởng pháp của thợ mỏ Thập Vạn Đại Sơn truyền lại: một chưởng đẩy cát đá nứt đất lao thẳng, chôn chân mọi kẻ trên đường nứt.',
      source: 'Kỳ ngộ Hang Yêu 25% · Tàng Kinh Các (130 điểm) · đấu giá' }
  };
  var MANUAL_IDS = Object.keys(MANUALS);
  var BY_ITEM = {};
  MANUAL_IDS.forEach(function (sid) { BY_ITEM[MANUALS[sid].item] = MANUALS[sid]; });

  // ---------- Bảng rơi bí tịch của boss thế giới ----------
  // Để RIÊNG ở module này (không sửa bảng rơi gốc của js/bosses.js —
  // test 33b khóa snapshot bảng cũ). game.js lăn thêm bảng này trong
  // grantBossTableDrops. Boss ký danh: 8–12% đúng chiêu của chính nó;
  // 2 vương thú map 4 còn lại + 13 boss chặng sâu: lăn HỒ HIẾM 4–5%.
  var BOSS_DROPS = {
    lang_vuong: { item: 'bt_boss_lang_hao', chance: 0.12 },
    son_quan: { item: 'bt_boss_ho_gam', chance: 0.10 },
    xa_vuong: { item: 'bt_boss_xa_thuc', chance: 0.12 },
    thiet_bi_vuong: { item: 'bt_boss_thiet_bi', chance: 0.10 },
    co_mang_vuong: { item: 'bt_boss_co_mang', chance: 0.08 },
    thiet_bi_ma_vuong: { item: 'bt_boss_ma_vuong', chance: 0.08 },
    hau_vuong: { pool: ['bt_rare_cuu_u', 'bt_rare_hoi_xuan'], chance: 0.05 },
    ho_vuong: { pool: ['bt_rare_van_kiem', 'bt_rare_cuu_u'], chance: 0.05 }
  };
  var DEEP_BOSS_IDS = ['mang_trung_phuc', 'lang_tham_xu', 'tuyet_lang_vuong',
    'lang_van_hai', 'lon_suoi_may', 'lang_doan_long', 'diem_xa_vuong',
    'hau_xich_diem', 'lon_bang_coc', 'loi_xa_vuong', 'thien_loi_xa_vuong',
    'hau_tinh_van', 'lang_thien_dai'];
  var DEEP_POOL = { pool: ['bt_rare_van_kiem', 'bt_rare_cuu_u', 'bt_rare_hoi_xuan'], chance: 0.04 };
  function bossDropEntry(bossId) {
    if (BOSS_DROPS[bossId]) return BOSS_DROPS[bossId];
    if (DEEP_BOSS_IDS.indexOf(bossId) >= 0) return DEEP_POOL;
    return null;
  }
  function rollBossDrop(bossId, rng) {
    var e = bossDropEntry(bossId);
    if (!e) return null;
    var rand = rng || Math.random;
    if (rand() >= e.chance) return null;
    if (e.item) return e.item;
    return e.pool[Math.floor(rand() * e.pool.length) % e.pool.length];
  }
  // Dòng hiển thị ở panel Boss (game.js ghép vào bảng rơi của boss).
  function bossDropInfo(bossId) {
    var e = bossDropEntry(bossId);
    if (!e) return null;
    var names;
    if (e.item) names = [itemName(e.item)];
    else names = e.pool.map(function (it) { return itemName(it); });
    return { chance: e.chance, pool: !!e.pool, names: names };
  }
  function itemName(itemId) {
    var d = BY_ITEM[itemId];
    return d ? ('Bí Tịch: ' + d.name) : itemId;
  }

  // ---------- Trạng thái trên nhân vật ----------
  function ensure(ch) {
    if (!ch) return null;
    if (!ch.manuals || typeof ch.manuals !== 'object') ch.manuals = {};
    if (!ch.manualProg || typeof ch.manualProg !== 'object') ch.manualProg = {};
    return ch.manuals;
  }
  function isLearned(ch, skillId) {
    if (!ch || !MANUALS[skillId]) return false;
    ensure(ch);
    return (ch.manuals[skillId] || 0) > 0;
  }
  function levelOf(ch, skillId) {
    if (!ch || !MANUALS[skillId]) return 0;
    ensure(ch);
    var lv = Math.floor(ch.manuals[skillId] || 0);
    var cap = GRADES[MANUALS[skillId].grade].maxLvl;
    return Math.max(0, Math.min(cap, lv));
  }
  function progressOf(ch, skillId) {
    if (!ch || !MANUALS[skillId]) return 0;
    ensure(ch);
    return Math.max(0, Math.min(PROGRESS_MAX, Math.floor(ch.manualProg[skillId] || 0)));
  }
  function learnedList(ch) {
    if (!ch) return [];
    ensure(ch);
    return MANUAL_IDS.filter(function (sid) { return (ch.manuals[sid] || 0) > 0; });
  }
  function bookCount(ch, itemId) {
    var L = logic();
    if (L && typeof L.countItem === 'function') return L.countItem(ch, itemId);
    var n = 0;
    (ch && ch.inventory || []).forEach(function (it) { if (it.id === itemId) n += it.count || 0; });
    return n;
  }

  // ---------- Cổng cảnh giới ----------
  // Cổng mặc định theo PHẨM; từng quyển được khai `gate` riêng thì dùng
  // cổng riêng (nhóm vỡ lòng/pháp quyết Phàm phẩm cổng tầng 2 trong khi
  // cổng chung của Phàm vẫn là tầng 1 — lệnh Bui 07:45 30/10).
  function gateOf(def) { return (def && def.gate) || GRADES[def.grade].gate; }
  function gateMet(ch, def) {
    if (!ch || !def) return false;
    var g = gateOf(def);
    if (g.tier) return (ch.tier || 0) >= g.tier;
    if (g.realm) return realmRankOf(ch) >= g.realm;
    return true;
  }
  function gateText(def) {
    var g = gateOf(def);
    if (g.tier) return 'Luyện Khí tầng ' + g.tier;
    if (g.realm) return 'cảnh giới ' + (REALM_NAMES[g.realm] || ('hạng ' + g.realm));
    return '';
  }
  function gradeName(def) { return GRADES[def.grade].name; }

  // ---------- Học bí tịch (dùng từ túi đồ qua Logic.useItem) ----------
  // Trả cùng định dạng với alchemy.useRecipeScroll: { ok, pill: true,
  // manual: true, msg } để game.js hiện toast đúng câu chữ ở đây.
  function useManual(ch, itemId) {
    var def = BY_ITEM[itemId];
    var L = logic();
    if (!def || !L) return { ok: false };
    ensure(ch);
    if (bookCount(ch, itemId) <= 0) {
      return { ok: false, pill: true, manual: true, msg: 'Túi không có ' + itemName(itemId) + '.' };
    }
    if (isLearned(ch, def.id)) {
      return { ok: false, pill: true, manual: true, alreadyKnown: true,
        msg: 'Bạn đã học ' + def.name + ' (cấp ' + levelOf(ch, def.id) + '/' + GRADES[def.grade].maxLvl + ') rồi — mở panel Kỹ Năng để tham ngộ nâng cấp bằng quyển trùng, hoặc bán quyển này lấy ' + GRADES[def.grade].sell + ' Linh Thạch.' };
    }
    if (!gateMet(ch, def)) {
      return { ok: false, pill: true, manual: true, gated: true,
        msg: 'Bí tịch ' + def.name + ' (' + gradeName(def) + ' phẩm) quá cao thâm — cần ' + gateText(def) + ' mới tham ngộ nổi. Sách vẫn giữ trong túi, đủ cảnh giới hãy đọc.' };
    }
    if (!L.consumeItem(ch, itemId, 1)) return { ok: false };
    ch.manuals[def.id] = 1;
    ch.manualProg[def.id] = 0;
    return { ok: true, pill: true, manual: true, learned: def.id,
      msg: 'Đọc ' + itemName(itemId) + ', lĩnh ngộ chiêu ' + def.name + '!' + (def.key ? ' (phím ' + def.key.toUpperCase() + ')' : ' (bấm ô chiêu trên thanh bí tịch để dùng)') + ' Mở panel Kỹ Năng để xem và tham ngộ nâng cấp.' };
  }

  // ---------- Tham ngộ nâng cấp ----------
  // Thêm điểm tham ngộ; đủ 100 và chưa viên mãn thì tự lên 1 cấp.
  function addProgress(ch, skillId, pts) {
    ensure(ch);
    var def = MANUALS[skillId];
    var cap = GRADES[def.grade].maxLvl;
    var lv = levelOf(ch, skillId);
    if (lv >= cap) return { leveled: false, level: lv, progress: progressOf(ch, skillId), capped: true };
    var p = progressOf(ch, skillId) + pts;
    var leveled = false;
    if (p >= PROGRESS_MAX) { lv += 1; ch.manuals[skillId] = lv; p -= PROGRESS_MAX; leveled = true; }
    ch.manualProg[skillId] = Math.min(PROGRESS_MAX, p);
    return { leveled: leveled, level: lv, progress: ch.manualProg[skillId], capped: lv >= cap };
  }
  // Tĩnh tọa tham ngộ: tốn tu vi + Linh Thạch (theo phẩm × cấp), +20 điểm.
  function meditate(ch, skillId) {
    var def = MANUALS[skillId];
    if (!def) return { ok: false, error: 'Không có chiêu này.' };
    if (!isLearned(ch, skillId)) return { ok: false, error: 'Chưa học ' + def.name + ' — hãy đọc bí tịch của nó trước.' };
    var g = GRADES[def.grade];
    var lv = levelOf(ch, skillId);
    if (lv >= g.maxLvl) return { ok: false, error: def.name + ' đã viên mãn (cấp ' + g.maxLvl + ').' };
    var tuViCost = g.medTuVi * lv;
    var ltCost = g.medLt * lv;
    if ((ch.tuVi || 0) < tuViCost) return { ok: false, error: 'Không đủ tu vi để tham ngộ (cần ' + tuViCost + ', đang có ' + Math.floor(ch.tuVi || 0) + ').' };
    if ((ch.linhThach || 0) < ltCost) return { ok: false, error: 'Không đủ Linh Thạch để tham ngộ (cần ' + ltCost + ', đang có ' + (ch.linhThach || 0) + ').' };
    ch.tuVi -= tuViCost;
    ch.linhThach -= ltCost;
    var r = addProgress(ch, skillId, MEDITATE_GAIN);
    return { ok: true, skillId: skillId, tuViCost: tuViCost, ltCost: ltCost, gained: MEDITATE_GAIN,
      leveled: r.leveled, level: r.level, progress: r.progress };
  }
  // Đọc 1 quyển TRÙNG: tốn đúng quyển sách, +điểm theo phẩm.
  function useDuplicate(ch, skillId) {
    var def = MANUALS[skillId];
    var L = logic();
    if (!def || !L) return { ok: false, error: 'Không có chiêu này.' };
    if (!isLearned(ch, skillId)) return { ok: false, error: 'Chưa học ' + def.name + ' — hãy đọc quyển đầu tiên để học chiêu trước.' };
    var g = GRADES[def.grade];
    var lv = levelOf(ch, skillId);
    if (lv >= g.maxLvl) return { ok: false, error: def.name + ' đã viên mãn — quyển trùng chỉ còn đem bán (' + g.sell + ' Linh Thạch/quyển).' };
    if (bookCount(ch, def.item) <= 0) return { ok: false, error: 'Không có quyển trùng của ' + def.name + ' trong túi.' };
    if (!L.consumeItem(ch, def.item, 1)) return { ok: false, error: 'Không trừ được sách trong túi.' };
    var r = addProgress(ch, skillId, g.progPerBook);
    return { ok: true, skillId: skillId, gained: g.progPerBook,
      leveled: r.leveled, level: r.level, progress: r.progress };
  }
  // Bán 1 quyển (trùng hoặc thừa): giá phẳng theo phẩm (docs/economy.md),
  // đi qua guardGain('sell') của chống hack như mọi đường bán đồ.
  function sellManual(ch, itemId) {
    var def = BY_ITEM[itemId];
    var L = logic();
    if (!def || !L) return { ok: false, error: 'Đây không phải bí tịch.' };
    if (bookCount(ch, itemId) <= 0) return { ok: false, error: 'Không có ' + itemName(itemId) + ' trong túi.' };
    if (!L.consumeItem(ch, itemId, 1)) return { ok: false, error: 'Không trừ được sách trong túi.' };
    var gain = GRADES[def.grade].sell;
    var AC = lazy('PNT_ANTICHEAT', './anticheat.js');
    if (AC && typeof AC.guardGain === 'function') gain = AC.guardGain('sell', gain);
    ch.linhThach = (ch.linhThach || 0) + gain;
    return { ok: true, item: itemId, gained: gain, linhThach: ch.linhThach };
  }
  function upgradeInfo(ch, skillId) {
    var def = MANUALS[skillId];
    if (!def) return null;
    var g = GRADES[def.grade];
    var lv = levelOf(ch, skillId);
    return {
      skillId: skillId, learned: lv > 0, level: lv, maxLvl: g.maxLvl,
      progress: progressOf(ch, skillId), progressMax: PROGRESS_MAX,
      progPerBook: g.progPerBook, books: bookCount(ch, def.item),
      medTuVi: g.medTuVi * Math.max(1, lv), medLt: g.medLt * Math.max(1, lv),
      sell: g.sell, capped: lv >= g.maxLvl
    };
  }

  // ---------- Định nghĩa chiêu hiệu dụng (co theo cấp) ----------
  var SKILL_FIELDS = ['key', 'name', 'mech', 'cd', 'mana', 'mult', 'speed', 'range', 'width',
    'radius', 'targets', 'dur', 'tick', 'slow', 'freeze', 'slowPct', 'shieldPct', 'healPct', 'color', 'desc',
    'elem', 'burnPct', 'burnDur', 'speedPct', 'tuViPct', 'passive'];
  function baseSkillDef(def) {
    var out = { id: def.id, manual: true };
    SKILL_FIELDS.forEach(function (k) { if (def[k] !== undefined) out[k] = def[k]; });
    // Nhãn khóa trên thanh skill (skills.js isUnlocked bỏ qua 2 trường
    // này với chiêu manual — chỉ để game.js hiện chữ ở ô khóa).
    var g = gateOf(def);
    if (g.tier) out.unlockTier = g.tier;
    if (g.realm) out.unlockRealm = g.realm;
    return out;
  }
  // Cấp càng cao: sát thương +12%/cấp, tầm/bán kính +2%/cấp, khống chế
  // +0,1s mỗi 2 cấp, khiên +2%/cấp, hồi máu +1%/cấp, chain +1 mục tiêu
  // ở cấp 5 và cấp 9. Linh lực + hồi chiêu giữ nguyên theo cấp (khung
  // skills.js tính phí theo định nghĩa gốc).
  function effectiveDef(ch, skillId) {
    var def = MANUALS[skillId];
    if (!def) return null;
    var out = baseSkillDef(def);
    var lv = levelOf(ch, skillId);
    if (lv <= 1) return out;
    var n = lv - 1;
    out.mult = Math.round(def.mult * (1 + 0.12 * n) * 100) / 100;
    if (def.radius) out.radius = Math.round(def.radius * (1 + 0.02 * n));
    if (def.range) out.range = Math.round(def.range * (1 + 0.02 * n));
    if (def.freeze) out.freeze = def.freeze + 0.1 * Math.floor(n / 2);
    if (def.slow) out.slow = def.slow + 0.1 * Math.floor(n / 2);
    if (def.shieldPct) out.shieldPct = Math.min(70, def.shieldPct + 2 * n);
    if (def.speedPct) out.speedPct = Math.min(30, def.speedPct + 2 * n);
    if (def.tuViPct) out.tuViPct = Math.min(12, def.tuViPct + 2 * n);
    if (def.healPct) out.healPct = Math.min(0.30, Math.round((def.healPct + 0.01 * n) * 100) / 100);
    if (def.targets) out.targets = def.targets + (lv >= 5 ? 1 : 0) + (lv >= 9 ? 1 : 0);
    out.level = lv;
    return out;
  }

  // ---------- Đăng ký vào khung skill (PNT_SKILLS) ----------
  var registered = false;
  function registerSkills() {
    var SK = skillsLib();
    if (!SK || !SK.SKILLS) return false;
    MANUAL_IDS.forEach(function (sid) {
      if (!SK.SKILLS[sid]) SK.SKILLS[sid] = baseSkillDef(MANUALS[sid]);
    });
    if (!Array.isArray(SK.BAR3)) SK.BAR3 = [];
    MANUAL_IDS.forEach(function (sid) { if (SK.BAR3.indexOf(sid) < 0) SK.BAR3.push(sid); });
    registered = true;
    return true;
  }
  function isRegistered() { return registered; }

  // ---------- TÀNG KINH CÁC — quầy bí tịch trong Kho Tông ----------
  // Hàng chung (mọi tông): 2 quyển Linh phẩm, 130 điểm. Hàng riêng:
  // tuyệt học của CHÍNH tông đã bái nhập, 260 điểm + hàm Nội Môn
  // (tổng điểm tích luỹ >= 100, cấp idx 1 — luật A3 trong
  // docs/feature-ideas.md). Đệ tử tông khác không mua được tuyệt học
  // của tông này ở quầy — muốn học thì săn sách rơi/đấu giá.
  var SHELF_PRICE_SIGNATURE = 260;
  var SHELF_RANK_NEED = 1;
  var SHELF_COMMON = [
    { item: 'bt_gen_phi_hoa', price: 130 },
    { item: 'bt_gen_luu_sa', price: 130 },
    // Nhóm vỡ lòng + pháp quyết nhập môn (Phàm, cổng tầng 2): giá cống
    // hiến thấp 40 điểm — đệ tử mới bái nhập là đổi được ngay.
    { item: 'bt_cb_thanh_khe', price: 40 },
    { item: 'bt_cb_liet_phong', price: 40 },
    { item: 'bt_cb_thiet_bo', price: 40 },
    { item: 'bt_cb_tat_phong', price: 40 },
    { item: 'bt_cb_dan_khi', price: 40 },
    { item: 'bt_pq_hoa_cau', price: 40 },
    { item: 'bt_pq_thuy_tien', price: 40 },
    { item: 'bt_pq_bang_tien', price: 40 },
    { item: 'bt_pq_loi_kich', price: 40 },
    { item: 'bt_pq_phong_nhan', price: 40 },
    { item: 'bt_pq_tho_thu', price: 40 }
  ];
  function shelfList(ch, flags) {
    var SP = sectPoints();
    if (!SP || !ch) return [];
    var sid = SP.sectIdOf ? SP.sectIdOf(flags) : null;
    if (!sid) return [];
    var SE = sectsLib();
    var sectName = SE && SE.sectById(sid) ? SE.sectById(sid).name : sid;
    var rk = SP.rankOf(ch);
    var out = [];
    MANUAL_IDS.forEach(function (msid) {
      var d = MANUALS[msid];
      if (d.sect === sid) {
        out.push({ item: d.item, skillId: msid, name: itemName(d.item), skillName: d.name,
          grade: d.grade, gradeName: GRADES[d.grade].name, price: SHELF_PRICE_SIGNATURE,
          rankNeed: SHELF_RANK_NEED, kind: 'tong',
          locked: rk.idx < SHELF_RANK_NEED,
          lockText: 'Cần hàm Nội Môn Đệ Tử (tổng 100 điểm) — hiện là ' + rk.name + '.',
          desc: d.desc });
      }
    });
    SHELF_COMMON.forEach(function (e) {
      var d = BY_ITEM[e.item];
      out.push({ item: e.item, skillId: d.id, name: itemName(e.item), skillName: d.name,
        grade: d.grade, gradeName: GRADES[d.grade].name, price: e.price,
        rankNeed: 0, kind: 'chung', locked: false, lockText: '', desc: d.desc });
    });
    return out.map(function (e) {
      e.owned = bookCount(ch, e.item);
      e.learned = isLearned(ch, e.skillId);
      return e;
    });
  }
  function buyFromShelf(ch, flags, itemId) {
    var SP = sectPoints();
    if (!SP || !ch) return { ok: false, error: 'Chưa có dữ liệu tông môn.' };
    if (!SP.sectIdOf(flags)) return { ok: false, error: 'Chưa bái nhập tông môn — Tàng Kinh Các chỉ mở cho đệ tử trong tông.' };
    var entry = null;
    shelfList(ch, flags).forEach(function (e) { if (e.item === itemId) entry = e; });
    if (!entry) return { ok: false, error: 'Quyển này không có trong Tàng Kinh Các của tông bạn.' };
    if (entry.locked) return { ok: false, error: entry.lockText };
    var sp = SP.spendPoints(ch, flags, entry.price, 'tang_kinh_cac:' + itemId);
    if (!sp.ok) return { ok: false, error: sp.error };
    var L = logic();
    if (L) L.addItem(ch, entry.item, 1);
    return { ok: true, entry: entry, points: sp.points };
  }

  // ---------- TỦ SÁCH LÀNG — shop làng Thanh Khê (bán bằng LT) -----
  // Trưởng làng Trần Đức giữ tủ sách vỡ lòng của làng: chỉ bán nhóm cơ
  // bản + 2 pháp quyết phổ biến nhất (Hỏa Cầu, Phong Nhận), giá Phàm
  // 50 LT/quyển — rẻ cho tân thủ (đầu game farm ~240 LT/giờ,
  // docs/economy.md mục 9). 4 pháp quyết còn lại chỉ có ở Tàng Kinh
  // Các (điểm cống hiến) để người chơi có lý do bái nhập tông sớm.
  var VILLAGE_SHOP_PRICE = 50;
  var VILLAGE_SHOP = ['bt_cb_thanh_khe', 'bt_cb_liet_phong', 'bt_cb_thiet_bo',
    'bt_cb_tat_phong', 'bt_cb_dan_khi', 'bt_pq_hoa_cau', 'bt_pq_phong_nhan']
    .map(function (item) { return { item: item, price: VILLAGE_SHOP_PRICE }; });
  function villageShopList(ch) {
    return VILLAGE_SHOP.map(function (e) {
      var d = BY_ITEM[e.item];
      return { item: e.item, skillId: d.id, name: itemName(e.item), skillName: d.name,
        grade: d.grade, gradeName: GRADES[d.grade].name, price: e.price,
        owned: bookCount(ch, e.item), learned: isLearned(ch, d.id), desc: d.desc };
    });
  }
  function buyFromVillageShop(ch, itemId) {
    var L = logic();
    if (!L || !ch) return { ok: false, error: 'Chưa có dữ liệu nhân vật.' };
    var entry = null;
    VILLAGE_SHOP.forEach(function (e) { if (e.item === itemId) entry = e; });
    if (!entry) return { ok: false, error: 'Quyển này không bán ở Tủ sách làng.' };
    if ((ch.linhThach || 0) < entry.price) {
      return { ok: false, error: 'Không đủ Linh Thạch (cần ' + entry.price + ', đang có ' + (ch.linhThach || 0) + ').' };
    }
    ch.linhThach -= entry.price;
    L.addItem(ch, itemId, 1);
    return { ok: true, item: itemId, price: entry.price, linhThach: ch.linhThach };
  }

  // ---------- Dẫn Khí Quyết (bị động): cộng % tu vi khi thổ nạp -----
  // game.js meditate() + tự thổ nạp nhân base tu vi theo % này, cùng
  // khung với Tụ Linh Phù (TAL.medMult) và Tụ Linh Trận (động phủ).
  function medTuViPct(ch) {
    if (!isLearned(ch, 'cb_dan_khi')) return 0;
    var ed = effectiveDef(ch, 'cb_dan_khi');
    return ed && ed.tuViPct ? ed.tuViPct : 0;
  }

  var api = {
    GRADES: GRADES, MANUALS: MANUALS, MANUAL_IDS: MANUAL_IDS, BY_ITEM: BY_ITEM,
    PROGRESS_MAX: PROGRESS_MAX, MEDITATE_GAIN: MEDITATE_GAIN,
    BOSS_DROPS: BOSS_DROPS, DEEP_BOSS_IDS: DEEP_BOSS_IDS, DEEP_POOL: DEEP_POOL,
    bossDropEntry: bossDropEntry, rollBossDrop: rollBossDrop, bossDropInfo: bossDropInfo,
    ensure: ensure, isLearned: isLearned, levelOf: levelOf, progressOf: progressOf,
    learnedList: learnedList, bookCount: bookCount,
    gateMet: gateMet, gateText: gateText, gradeName: gradeName,
    useManual: useManual, meditate: meditate, useDuplicate: useDuplicate,
    sellManual: sellManual, upgradeInfo: upgradeInfo,
    baseSkillDef: baseSkillDef, effectiveDef: effectiveDef,
    registerSkills: registerSkills, isRegistered: isRegistered,
    SHELF_PRICE_SIGNATURE: SHELF_PRICE_SIGNATURE, SHELF_RANK_NEED: SHELF_RANK_NEED,
    SHELF_COMMON: SHELF_COMMON, shelfList: shelfList, buyFromShelf: buyFromShelf,
    VILLAGE_SHOP: VILLAGE_SHOP, VILLAGE_SHOP_PRICE: VILLAGE_SHOP_PRICE,
    villageShopList: villageShopList, buyFromVillageShop: buyFromVillageShop,
    gateOf: gateOf, medTuViPct: medTuViPct
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_MANUALS = api;
  // Nạp trong trình duyệt: đăng ký chiêu vào khung skill ngay (skills.js
  // đã nạp trước theo thứ tự index.html). Trong Node, test gọi tay
  // registerSkills() sau khi gán globalThis.PNT_SKILLS.
  if (typeof window !== 'undefined') registerSkills();
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
