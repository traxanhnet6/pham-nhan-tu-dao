// Phàm Nhân Tu Đạo — HỆ THỐNG LINH THÚ (thú đồng hành), module logic thuần.
// 51 loài theo thang phẩm chung Phàm -> Linh -> Huyền -> Địa -> Thiên.
// Đường có thú: (a) THU PHỤC quái hoang đúng loài khi máu nó thấp (cần Bùa
// Ngự Thú), (b) TRỨNG linh thú ấp theo thời gian chơi (rơi boss/tinh anh/
// mua ở thương nhân), (c) thú đầu tiên thợ săn Hà Thiết Sơn tặng + Hồ Ly khi
// trả nhiệm vụ Vạn Thú Môn. 1 con XUẤT CHIẾN + chuồng chứa số còn lại.
// Thú có HP riêng, ăn EXP khi chủ hạ quái, lên cấp tăng chỉ số theo phẩm,
// hào quang hỗ trợ cộng qua Logic.statTotals (gearBlocks tra cứu lười
// PNT_PETS.totalStats — cùng mẫu pháp bảo). CƯỠI THÚ chưa làm: chỉ có cờ
// dữ liệu `mountable` cho loài lớn biết bay, để parent khớp nối sau.
// TIỀN TỆ DUY NHẤT là LINH THẠCH (trường ch.linhThach) — mọi giá/thưởng
// trong module này đều tính bằng Linh Thạch, giữ thang số như cũ.
// Save cũ chưa có ch.pets: ensurePets() khởi tạo rỗng, không phá dữ liệu.
(function () {
  'use strict';
  var L = null;
  if (typeof module !== 'undefined' && module.exports) { try { L = require('./logic.js'); } catch (e) { L = null; } }
  else if (typeof window !== 'undefined') L = window.PNT_LOGIC;
  else if (typeof globalThis !== 'undefined') L = globalThis.PNT_LOGIC;

  var GRADES = [
    { id: 'pham', name: 'Phàm', color: '#b8a888' },
    { id: 'linh', name: 'Linh', color: '#7fc46a' },
    { id: 'huyen', name: 'Huyền', color: '#5aa7e8' },
    { id: 'dia', name: 'Địa', color: '#c98ae8' },
    { id: 'thien', name: 'Thiên', color: '#ffb03a' }
  ];
  var ELEMS = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ', phong: 'Phong', loi: 'Lôi', bang: 'Băng' };
  var ROLES = { melee: 'Cận chiến', ranged: 'Đánh xa', support: 'Hỗ trợ', tank: 'Đỡ đòn' };
  var MOVES = { walk: 'Chạy bốn chân', hop: 'Nhảy', slither: 'Trườn', fly: 'Bay', swim: 'Bơi lượn' };

  // Hàng dữ liệu loài: [id, tên, phẩm(0-4), hệ, cls(rig), move, role,
  //   hp, atk, tốc độ(px/s), tên kỹ năng, loại kỹ năng, hào quang(stats),
  //   mountable, art]
  // art: {src:'monster', type} dùng lại sheet quái AI | {src:'recolor',
  //   type, mode} biến thể đổi màu sheet quái | {src:'sheet', sheet:'A'|'B',
  //   idx} loài mới trong sheet thiết kế AI linh thú (ô idx, lưới 5x4).
  // Loại kỹ năng: power = đòn mạnh cận chiến, bolt = phun hệ từ xa,
  //   heal = hồi máu cho chủ, stun = đòn kèm làm choáng quái.
  var ROWS = [
    // ----- Phàm phẩm (16) -----
    ['linh_ke', 'Linh Kê', 0, 'hoa', 'bird', 'walk', 'melee', 26, 5, 95, 'Mổ Lửa', 'power', { elem: { hoa: 3 } }, false, { src: 'monster', type: 'ga_rung' }],
    ['tho_ngoc', 'Thỏ Ngọc', 0, 'moc', 'rabbit', 'hop', 'support', 20, 3, 120, 'Nhảy Hồi Xuân', 'heal', { llRegen: 0.3 }, false, { src: 'monster', type: 'tho_hoang' }],
    ['soi_con', 'Sói Con', 0, 'phong', 'quad', 'walk', 'melee', 30, 5, 110, 'Phong Nha', 'power', { speed: 2 }, false, { src: 'monster', type: 'soi_con' }],
    ['lon_linh', 'Lợn Linh', 0, 'tho', 'quad', 'walk', 'tank', 48, 4, 70, 'Đất Lún', 'stun', { def: 1 }, false, { src: 'monster', type: 'lon_rung' }],
    ['ran_luc_linh', 'Lục Xà Linh', 0, 'moc', 'snake', 'slither', 'melee', 26, 5, 90, 'Độc Nha', 'power', { elem: { moc: 3 } }, false, { src: 'monster', type: 'ran_luc' }],
    ['khi_linh', 'Khỉ Linh', 0, 'phong', 'monkey', 'hop', 'melee', 28, 5, 115, 'Liên Hoàn Trảo', 'power', { crit: 2 }, false, { src: 'monster', type: 'khi_mat_do' }],
    ['meo_rung', 'U Ảnh Linh Miêu', 0, 'phong', 'quad', 'walk', 'melee', 24, 5, 125, 'Ảnh Trảo', 'power', { speed: 3 }, false, { src: 'sheet', sheet: 'A', idx: 0 }],
    ['cop_con', 'Kim Văn Hổ Nhi', 0, 'kim', 'quad', 'walk', 'melee', 32, 5, 105, 'Hổ Khiếu Trảo', 'power', { crit: 3 }, false, { src: 'sheet', sheet: 'A', idx: 1 }],
    ['ech_xanh', 'Bích Ngọc Linh Oa', 0, 'thuy', 'rabbit', 'hop', 'ranged', 26, 4, 85, 'Bích Ba Đạn', 'bolt', { elem: { thuy: 3 } }, false, { src: 'sheet', sheet: 'A', idx: 2 }],
    ['vit_troi', 'Vân Dực Linh Nhạn', 0, 'thuy', 'bird', 'fly', 'support', 22, 3, 100, 'Cam Lộ Vũ', 'heal', { llRegen: 0.3 }, false, { src: 'sheet', sheet: 'A', idx: 3 }],
    ['soc_nau', 'Phong Vĩ Linh Thử', 0, 'moc', 'rabbit', 'hop', 'support', 20, 3, 130, 'Phong Linh Quả', 'heal', { speed: 2 }, false, { src: 'sheet', sheet: 'A', idx: 4 }],
    ['rua_nui', 'Nhạc Thạch Linh Quy', 0, 'tho', 'quad', 'walk', 'tank', 55, 3, 45, 'Sơn Giáp Chấn', 'stun', { def: 2, hp: 8 }, false, { src: 'sheet', sheet: 'A', idx: 5 }],
    ['ca_chep_do', 'Xích Lân Linh Lý', 0, 'thuy', 'snake', 'swim', 'support', 20, 3, 80, 'Linh Tuyền', 'heal', { llRegen: 0.4 }, false, { src: 'sheet', sheet: 'A', idx: 6 }],
    ['buom_linh', 'Mộng Huyễn Linh Điệp', 0, 'phong', 'bird', 'fly', 'support', 16, 3, 110, 'Lân Phấn Mộng', 'stun', { llRegen: 0.3 }, false, { src: 'sheet', sheet: 'A', idx: 7 }],
    ['de_trang', 'Ngọc Giác Sơn Dương', 0, 'tho', 'quad', 'walk', 'melee', 30, 4, 95, 'Ngọc Giác Chấn', 'power', { hp: 6 }, false, { src: 'sheet', sheet: 'A', idx: 8 }],
    ['cho_co', 'Địa Linh Khuyển', 0, 'tho', 'quad', 'walk', 'melee', 28, 4, 105, 'Trung Khuyển Phệ', 'power', { crit: 2 }, false, { src: 'sheet', sheet: 'A', idx: 9 }],
    // ----- Linh phẩm (16) -----
    ['kim_ke', 'Kim Kê', 1, 'kim', 'bird', 'walk', 'melee', 34, 6, 100, 'Kim Mổ', 'power', { elem: { kim: 4 } }, false, { src: 'recolor', type: 'ga_rung', mode: 'gold' }],
    ['soi_rung', 'Sói Rừng Linh', 1, 'phong', 'quad', 'walk', 'melee', 40, 7, 112, 'Tru Phong Nha', 'power', { speed: 3 }, false, { src: 'monster', type: 'soi_rung' }],
    ['thiet_tru', 'Thiết Trư', 1, 'tho', 'quad', 'walk', 'tank', 70, 6, 65, 'Thiết Bì Xung', 'stun', { def: 3, hp: 10 }, false, { src: 'monster', type: 'lon_mong_sat' }],
    ['ho_ly', 'Hồ Ly', 1, 'hoa', 'quad', 'walk', 'ranged', 34, 7, 118, 'Hồ Hỏa', 'bolt', { elem: { hoa: 5 } }, false, { src: 'sheet', sheet: 'A', idx: 10 }],
    ['nai_sao', 'Tinh Văn Linh Lộc', 1, 'moc', 'quad', 'walk', 'support', 36, 5, 120, 'Sâm Lâm Hồi', 'heal', { llRegen: 0.5 }, false, { src: 'sheet', sheet: 'A', idx: 11 }],
    ['hac_trang', 'Hạc Trắng', 1, 'thuy', 'bird', 'fly', 'ranged', 32, 6, 115, 'Thủy Vũ Tiễn', 'bolt', { elem: { thuy: 5 } }, true, { src: 'sheet', sheet: 'A', idx: 12 }],
    ['cong_xanh', 'Công Xanh', 1, 'moc', 'bird', 'walk', 'support', 34, 5, 90, 'Khổng Tước Vũ', 'heal', { llRegen: 0.4, elem: { moc: 3 } }, false, { src: 'sheet', sheet: 'A', idx: 13 }],
    ['cu_meo', 'Hàn Nguyệt Linh Cú', 1, 'bang', 'bird', 'fly', 'ranged', 30, 6, 105, 'Hàn Quang', 'bolt', { elem: { bang: 5 } }, false, { src: 'sheet', sheet: 'A', idx: 14 }],
    ['bao_dom', 'Tật Ảnh Vân Báo', 1, 'phong', 'quad', 'walk', 'melee', 38, 7, 135, 'Tật Phong Phệ', 'power', { crit: 4 }, false, { src: 'sheet', sheet: 'A', idx: 15 }],
    ['te_te', 'Địa Giáp Linh Tê', 1, 'tho', 'quad', 'walk', 'tank', 60, 5, 60, 'Cuộn Giáp Chấn', 'stun', { def: 3 }, false, { src: 'sheet', sheet: 'A', idx: 16 }],
    ['ca_koi', 'Cẩm Lân Linh Lý', 1, 'thuy', 'snake', 'swim', 'support', 28, 5, 85, 'Ngọc Tuyền', 'heal', { llRegen: 0.5 }, false, { src: 'sheet', sheet: 'A', idx: 17 }],
    ['ran_hoa', 'Rắn Hoa', 1, 'hoa', 'snake', 'slither', 'melee', 32, 6, 95, 'Hoa Độc Nha', 'power', { elem: { hoa: 4 } }, false, { src: 'sheet', sheet: 'A', idx: 18 }],
    ['khi_vang', 'Khỉ Vàng', 1, 'kim', 'monkey', 'hop', 'melee', 36, 7, 120, 'Kim Trảo', 'power', { crit: 3 }, false, { src: 'sheet', sheet: 'A', idx: 19 }],
    ['ngua_con', 'Đạp Vân Linh Câu', 1, 'phong', 'quad', 'walk', 'melee', 42, 6, 140, 'Đạp Phong', 'power', { speed: 4 }, true, { src: 'sheet', sheet: 'B', idx: 0 }],
    ['doi_linh', 'Dơi Linh', 1, 'phong', 'bird', 'fly', 'ranged', 28, 6, 125, 'Âm Ba Chấn', 'bolt', { speed: 3 }, false, { src: 'sheet', sheet: 'B', idx: 1 }],
    // Loài 51 — tách từ Quy Linh (lệnh Bui 07:49 30/10): con rắn xanh vốn
    // quấn trên mai Huyền Vũ Linh Quy nay là loài riêng; sheet 'D' = bộ
    // sheet dựng riêng trong assets/pets-ai|pets-md (tools/art-pets-quylinh2.py).
    ['thanh_linh_xa', 'Thanh Linh Xà', 1, 'thuy', 'snake', 'slither', 'melee', 30, 7, 128, 'Bích Ba Độc Nha', 'power', { elem: { thuy: 5 }, speed: 2 }, false, { src: 'sheet', sheet: 'D', idx: 0 }],
    // ----- Huyền phẩm (11) -----
    ['ngan_lang', 'Ngân Lang', 2, 'bang', 'quad', 'walk', 'ranged', 55, 9, 120, 'Băng Nha Pháo', 'bolt', { elem: { bang: 7 } }, false, { src: 'recolor', type: 'soi_rung', mode: 'silver' }],
    ['ho_ba_duoi', 'Hồ Ba Đuôi', 2, 'hoa', 'quad', 'walk', 'ranged', 48, 10, 125, 'Tam Vĩ Hồ Hỏa', 'bolt', { elem: { hoa: 7 } }, false, { src: 'sheet', sheet: 'B', idx: 2 }],
    ['bach_hac', 'Bạch Hạc Tiên', 2, 'bang', 'bird', 'fly', 'ranged', 46, 9, 120, 'Tuyết Vũ', 'bolt', { elem: { bang: 6 }, llRegen: 0.4 }, true, { src: 'sheet', sheet: 'B', idx: 3 }],
    ['quy_linh', 'Huyền Vũ Linh Quy', 2, 'tho', 'quad', 'walk', 'tank', 110, 8, 50, 'Huyền Vũ Chấn', 'stun', { def: 5, hp: 20 }, false, { src: 'sheet', sheet: 'B', idx: 4 }],
    ['phuong_con', 'Phượng Con', 2, 'hoa', 'bird', 'fly', 'ranged', 44, 10, 125, 'Phượng Diễm', 'bolt', { elem: { hoa: 7 } }, true, { src: 'sheet', sheet: 'B', idx: 5 }],
    ['giao_xa', 'Giao Xà', 2, 'thuy', 'snake', 'slither', 'melee', 58, 10, 100, 'Giao Long Giảo', 'power', { elem: { thuy: 6 } }, false, { src: 'sheet', sheet: 'B', idx: 6 }],
    ['ky_lan_con', 'Kỳ Lân Con', 2, 'kim', 'quad', 'walk', 'melee', 60, 10, 115, 'Kỳ Lân Giác', 'power', { crit: 5, elem: { kim: 5 } }, true, { src: 'sheet', sheet: 'B', idx: 7 }],
    ['lang_vuong_con', 'Lang Vương Con', 2, 'loi', 'quad', 'walk', 'melee', 56, 10, 128, 'Lôi Nha', 'power', { elem: { loi: 7 } }, false, { src: 'sheet', sheet: 'B', idx: 8 }],
    ['diep_linh', 'Điệp Linh Vương', 2, 'phong', 'bird', 'fly', 'support', 36, 8, 115, 'Mộng Điệp Phấn', 'stun', { llRegen: 0.7 }, false, { src: 'sheet', sheet: 'B', idx: 9 }],
    ['hau_vuong_con', 'Hầu Vương Con', 2, 'tho', 'monkey', 'hop', 'melee', 58, 10, 125, 'Kim Cô Ảnh', 'power', { crit: 5 }, false, { src: 'sheet', sheet: 'B', idx: 10 }],
    ['ung_linh', 'Thiên Phong Linh Ưng', 2, 'phong', 'bird', 'fly', 'ranged', 48, 9, 135, 'Thiên Ưng Trảo', 'bolt', { speed: 5 }, true, { src: 'sheet', sheet: 'B', idx: 11 }],
    // ----- Địa phẩm (5) -----
    ['hoa_phuong', 'Hỏa Phượng', 3, 'hoa', 'bird', 'fly', 'ranged', 70, 13, 130, 'Niết Bàn Diễm', 'bolt', { elem: { hoa: 10 }, llRegen: 0.5 }, true, { src: 'sheet', sheet: 'B', idx: 12 }],
    ['bang_long_con', 'Băng Long Con', 3, 'bang', 'quad', 'fly', 'ranged', 78, 13, 115, 'Băng Long Tức', 'bolt', { elem: { bang: 10 } }, true, { src: 'sheet', sheet: 'B', idx: 13 }],
    ['loi_ho', 'Lôi Hổ', 3, 'loi', 'quad', 'walk', 'melee', 80, 13, 130, 'Lôi Đình Phệ', 'power', { elem: { loi: 10 }, crit: 4 }, false, { src: 'sheet', sheet: 'B', idx: 14 }],
    ['thanh_quy', 'Thanh Mộc Thần Quy', 3, 'moc', 'quad', 'walk', 'tank', 140, 11, 55, 'Thanh Mộc Chấn', 'stun', { def: 7, hp: 35 }, false, { src: 'sheet', sheet: 'B', idx: 15 }],
    ['kim_xi_dieu', 'Kim Xí Điêu', 3, 'kim', 'bird', 'fly', 'melee', 72, 12, 145, 'Kim Xí Trảm', 'power', { elem: { kim: 9 }, speed: 4 }, true, { src: 'sheet', sheet: 'B', idx: 16 }],
    // ----- Thiên phẩm (3) -----
    ['ngu_sac_phuong', 'Ngũ Sắc Phượng Hoàng', 4, 'hoa', 'bird', 'fly', 'ranged', 95, 15, 140, 'Ngũ Sắc Thần Diễm', 'bolt', { elem: { hoa: 13 }, llRegen: 0.8, crit: 4 }, true, { src: 'sheet', sheet: 'B', idx: 17 }],
    ['thanh_long_con', 'Thanh Long Con', 4, 'moc', 'quad', 'fly', 'ranged', 100, 15, 125, 'Thanh Long Tức', 'bolt', { elem: { moc: 13 }, llRegen: 0.6 }, true, { src: 'sheet', sheet: 'B', idx: 18 }],
    ['bach_ho_linh', 'Bạch Hổ Linh', 4, 'kim', 'quad', 'walk', 'melee', 105, 14, 135, 'Bạch Hổ Sát', 'power', { crit: 7, elem: { kim: 12 } }, false, { src: 'sheet', sheet: 'B', idx: 19 }]
  ];
  // Nguồn gốc tiên hiệp của từng loài (hiển thị trong panel Linh thú).
  var LORE = {
    linh_ke: 'Gà rừng quanh Thanh Sơn uống sương linh khí nhiều đời, mào và lông đuôi dần ánh lửa — dân làng xem là điềm lành đầu mùa.',
    tho_ngoc: 'Thỏ sống cạnh Hồ Linh, lông trắng như ngọc thấm linh khí, đôi tai nghe được tiếng linh mạch chảy dưới đất.',
    soi_con: 'Sói non sinh dưới chân Thanh Sơn, lớn lên theo hơi linh khí rò rỉ từ phong ấn giếng cổ.',
    lon_linh: 'Lợn rừng ăn rễ linh thảo quanh Ao Phát Sáng, da thịt ngấm linh khí nên cứng và dai hơn hẳn đồng loại.',
    ran_luc_linh: 'Rắn lục sống trong vườn thuốc bỏ hoang, vảy nhuộm màu linh dược, nọc cũng mang theo dược tính.',
    khi_linh: 'Khỉ mặt đỏ chuyền cành ở bìa Rừng Thanh Sơn, lanh lợi khác thường từ ngày linh khí giếng cổ rò ra.',
    meo_rung: 'Linh miêu sống nơi bóng râm linh mạch, linh văn xanh lam chỉ hiện dưới trăng; bước chân nó không để lại dấu trên sương.',
    cop_con: 'Hổ con mang kim văn thiên sinh trên trán — dấu tích của dòng hổ từng gác cửa linh sơn thuở xưa.',
    ech_xanh: 'Linh oa kết tinh từ bọt nước Hồ Linh, da ngọc trong suốt; tiếng kêu của nó làm mặt hồ gợn vòng linh quang.',
    vit_troi: 'Nhạn trắng nương theo khí lưu trên linh mạch bay về mỗi sớm, lông cánh kết thành hình mây — người xưa xem là sứ của trời trong.',
    soc_nau: 'Linh thử sống trên cổ thụ đầu làng, đuôi mang phong văn; mỗi lần vẫy đuôi là lá khô bay thành vòng.',
    rua_nui: 'Linh quy cõng trên lưng một phiến núi thu nhỏ: mai đá xếp lớp khắc thổ văn, tuổi thọ tính bằng trăm năm.',
    ca_chep_do: 'Linh lý ngậm linh khí ở Ao Phát Sáng mà sinh râu rồng; tương truyền con nào vượt được thác linh sẽ hóa giao.',
    buom_linh: 'Linh điệp sinh từ phấn hoa linh điền, cánh vẽ vầng trăng khuyết; ai mơ thấy nó thường sắp gặp kỳ ngộ.',
    de_trang: 'Sơn dương uống nước suối linh đầu nguồn, sừng hóa ngọc bích, gõ vào đá nghe tiếng trong như chuông.',
    cho_co: 'Khuyển giữ nhà cho các hộ sống gần linh mạch nhiều đời, vai mang thổ văn — trung thành và ngửi được yêu khí từ xa.',
    kim_ke: 'Dòng dõi của Linh Kê nhuộm nắng sớm trên đỉnh Thanh Sơn, lông hóa sắc vàng kim, tiếng gáy xua tan sương độc.',
    soi_rung: 'Sói rừng trưởng thành trong bầy gác đường mòn Thanh Sơn, hơi thở mang phong linh, chạy nhanh như bóng lướt.',
    thiet_tru: 'Lợn rừng tắm bùn khoáng sắt ở bãi đá, da hóa thành lớp bìa sắt mỏng — thợ rèn trong làng vẫn kể về nó.',
    ho_ly: 'Hồ ly ngụ trong hang đá sau làng, đầu đuôi mang hồ hỏa ấm; nó chỉ thân với người có lòng trong như nước suối.',
    nai_sao: 'Linh lộc có bộ lông điểm sao trời, hoa văn ứng với tinh tú; sừng kết tinh trong suốt như băng ngọc.',
    hac_trang: 'Hạc trắng làm tổ bên Hồ Linh, vũ mao thấm thủy linh; người già bảo tiếng hạc kêu là điềm mưa thuận gió hòa.',
    cong_xanh: 'Khổng tước ngụ ở linh điền, lông đuôi mở ra thành quạt ngọc mắt biếc, ánh lên bảy sắc khi nắng chiếu qua.',
    cu_meo: 'Linh cú đậu trên cành cổ thụ đầu núi, mắt chứa hàn nguyệt, nhìn thấu yêu khí ẩn trong sương đêm.',
    bao_dom: 'Vân báo săn mồi theo triền núi phía bắc, đốm lông xoáy như mây cuộn, thoắt ẩn thoắt hiện trong sương.',
    te_te: 'Tê tê đào hang xuyên lớp đất linh, vảy xếp như giáp ngọc đồng; thợ mỏ gặp nó là biết gần mạch khoáng tốt.',
    ca_koi: 'Cẩm lý sống trong ao sen nhà Lý lão, vảy viền vàng như gấm dệt, trên trán đỡ một viên ngọc nhỏ tự nhiên.',
    ran_hoa: 'Rắn hoa không mang nọc chết người, vảy nở hoa văn bốn mùa; nó là bạn của người hái thuốc, hay dẫn đường tới linh dược.',
    khi_vang: 'Khỉ lông vàng sống trên cây cao nhất Rừng Thanh Sơn, tương truyền là hậu duệ của linh hầu từng nghe đạo ở chùa cổ.',
    ngua_con: 'Linh câu sinh ở bãi cỏ ven suối, vó còn non mà đã mang phong văn; lớn lên đủ sức đạp mây vượt đèo.',
    doi_linh: 'Dơi linh trú trong hang đá ẩm, cánh mỏng bắt được tiếng vọng của linh mạch; nó bay đêm để hứng sương trăng.',
    thanh_linh_xa: 'Linh xà sống ở thủy mạch phía bắc Thanh Sơn — nơi Huyền Vũ Linh Quy trấn giữ; tương truyền nó vốn là linh khí kết hình bên mai thần quy, khi phong ấn giếng cổ rò rỉ thì tách ra thành loài riêng: vảy ngọc lục, bụng vàng nhạt, trườn trên mặt nước nhanh như một tia chớp xanh.',
    ngan_lang: 'Sói bạc của triền núi tuyết phủ, lông ánh bạc lạnh, hơi thở hóa khói băng — bầy của nó gác lối lên Đài Vọng Vân.',
    ho_ba_duoi: 'Hồ ly tu ba đời ở nhân gian mới thêm được chiếc đuôi thứ ba; hồ hỏa của nó đã đủ sáng để soi đường người lạc trong rừng.',
    bach_hac: 'Hạc tiên sống trên tầng mây Thanh Sơn, thọ vài trăm tuổi, chỉ hạ xuống khi có người hữu duyên lên núi.',
    quy_linh: 'Hậu duệ Huyền Vũ trấn giữ thủy mạch phía bắc Thanh Sơn: mai vẽ đồ hình tinh tú, đuôi ngắn mà chắc, bốn chân dẫm sương lướt trên mặt nước như đi trên đất bằng.',
    phuong_con: 'Phượng non mới nở trong tổ trên cây ngô đồng cổ, lông cánh đã ánh lửa lành — không phải lửa đốt, mà là lửa sưởi.',
    giao_xa: 'Giao xà ngụ ở đầm sâu cuối Rừng Thanh Sơn, sừng vừa nhú; thêm trăm năm nữa có thể hóa giao long thật sự.',
    ky_lan_con: 'Kỳ lân con ghé xuống vùng Thanh Sơn khi linh khí chuyển mùa; bước chân nó đến đâu, cỏ linh mọc đến đó.',
    lang_vuong_con: 'Con của Lang Vương triền đông, từ nhỏ đã mang lôi văn trên lưng; tiếng tru còn non mà dã thú quanh vùng đều nể.',
    diep_linh: 'Vua của loài linh điệp, cánh rộng mang mộng phấn; nó chọn ở lại vườn hoa của người biết giữ lời hứa với rừng.',
    hau_vuong_con: 'Khỉ con thuộc dòng Hầu Vương, trán đeo vòng kim nhỏ như vương miện; lanh lợi và trọng nghĩa khí như tổ tiên.',
    ung_linh: 'Thiên ưng lượn trên tầng mây thấp của Thanh Sơn, đầu cánh chạm phong linh, mắt nhìn xa mười dặm.',
    hoa_phuong: 'Hỏa phượng trưởng thành quanh năm đậu trên ngô đồng cổ; mỗi lần xòe cánh, thung lũng ấm lên như vào hạ.',
    bang_long_con: 'Băng long con ngụ trong hang băng trên cao, vảy kết tinh giá lạnh; hơi thở của nó làm mặt suối đóng một lớp băng mỏng.',
    loi_ho: 'Lôi hổ gầm trong khe núi phía tây mỗi khi trời chuyển giông, vằn lông tóe điện quang lành, không hại người vô tội.',
    thanh_quy: 'Thần quy cổ sống từ thời Thanh Khê lão nhân còn tại thế; trên mai nó, một mầm cây linh đã nảy suốt trăm năm chưa lớn.',
    kim_xi_dieu: 'Điêu cánh vàng bay cao nhất vùng trời Thanh Sơn, lông cánh cứng như lưỡi kiếm mỏng, chuyên săn yêu cầm gây hại.',
    ngu_sac_phuong: 'Phượng hoàng ngũ sắc — dấu hiệu đại cát trong sách cổ; nó chỉ xuất hiện quanh Thanh Sơn khi phong ấn linh nhãn đổi chiều.',
    thanh_long_con: 'Thanh long con nương theo thủy mạch lớn dưới lòng đất Thanh Sơn, thỉnh thoảng nổi lên mặt Hồ Linh uống trăng.',
    bach_ho_linh: 'Hậu duệ của Bạch Hổ trấn phía tây trong tứ linh, gác những lối mòn mà yêu khí hay theo đó vào làng.'
  };
  var SPECIES = {}, ORDER = [];
  ROWS.forEach(function (r) {
    SPECIES[r[0]] = {
      id: r[0], name: r[1], grade: r[2], elem: r[3], cls: r[4], move: r[5], role: r[6],
      baseHp: r[7], baseAtk: r[8], speed: r[9],
      skill: { name: r[10], kind: r[11] }, aura: r[12], mountable: !!r[13], art: r[14], desc: LORE[r[0]] || ''
    };
    ORDER.push(r[0]);
  });

  // Quái hoang thu phục được -> loài linh thú tương ứng.
  var WILD_CAPTURE = {
    ga_rung: 'linh_ke', tho_hoang: 'tho_ngoc', soi_con: 'soi_con', lon_rung: 'lon_linh',
    ran_luc: 'ran_luc_linh', khi_mat_do: 'khi_linh', soi_rung: 'soi_rung', lon_mong_sat: 'thiet_tru'
  };
  var CHARM_ID = 'bua_ngu_thu';
  var CHARM_PRICE = 30;   // Linh Thạch / lá
  var EGG_PRICE = 250;    // Linh Thạch / trứng ngẫu nhiên
  var STABLE_MAX = 12;    // tổng số thú sở hữu
  var EGG_MAX = 4;
  var MAX_LEVEL = 10;
  // ---------- TIẾN HOÁ HUYẾT MẠCH (mục 8 hàng chờ, 2026-10-30) ----------
  // Thú đạt cấp 10 ăn 1 Yêu Đan đúng phẩm + 1 Huyết Mạch Tinh thì thức
  // tỉnh huyết mạch: trần cấp +5 (tới 15), thêm kỹ năng thứ hai
  // 'Huyết Mạch Bùng Nổ' (đòn bùng nổ hệ, hệ số 2,0, xen kẽ với kỹ năng
  // loài mỗi lần dùng kỹ năng — xem game.js petAttackMonster), hình
  // thái đổi bằng cách vẽ lớn hơn 15% + bảng tên vàng (game.js).
  // Hình sprite tiến hoá RIÊNG chưa có (team mỹ thuật đang dồn sức cho
  // hướng sau 60 frame) nên KHÔNG bịa sheet mới: đổi hình thật bằng
  // tỉ lệ vẽ + bảng tên, ghi rõ trong story-bible mục 37.
  // Yêu Đan theo phẩm: Phàm/Linh -> Cấp 1, Huyền/Địa/Thiên -> Cấp 2.
  // Cấp 3 KHÔNG dùng ở đây — đó là lõi Trúc Cơ Đan, không tranh sink.
  // Huyết Mạch Tinh KHÔNG phải Linh Thạch, không bán, chỉ rơi từ
  // boss (25%) / tinh anh (10%), quái thường không rơi.
  var BLOOD_ID = 'huyet_mach_tinh';
  var BLOOD_DROP = { boss: 0.25, elite: 0.10, normal: 0 };
  var EVO_MAX_LEVEL = 15;
  var EVO_SKILL = { name: 'Huyết Mạch Bùng Nổ', kind: 'burst', mult: 2.0 };
  var CAPTURE_HP_PCT = 0.35;                 // chỉ thu phục khi máu quái <= 35%
  var CAPTURE_BASE = [0.50, 0.38, 0.26, 0.16, 0.10]; // theo phẩm 0..4
  var EGG_GRADE_W = [100, 70, 35, 12, 3];    // trọng số phẩm khi lăn trứng
  // Hằng số hành vi cho tầng render/game (game.js đọc, không tự bịa số):
  var VIEW = { followDist: 46, catchupDist: 420, aggroRange: 250, rangeMelee: 52, rangeRanged: 150, atkInterval: 0.95, skillCd: 6 };

  // Đăng ký vật phẩm Bùa Ngự Thú vào L.ITEMS (cộng dồn, không sửa logic.js).
  if (L && L.ITEMS && !L.ITEMS[CHARM_ID]) {
    L.ITEMS[CHARM_ID] = { name: 'Bùa Ngự Thú', desc: 'Lá bùa của Vạn Thú Môn. Dùng để thu phục quái hoang đúng loài khi máu nó còn dưới 35%. Mua ở thương nhân Mã Vạn Lai.', heal: 0 };
  }
  // Vật phẩm huyết mạch cho tiến hoá (không bán, không phải Linh Thạch).
  if (L && L.ITEMS && !L.ITEMS[BLOOD_ID]) {
    L.ITEMS[BLOOD_ID] = { name: 'Huyết Mạch Tinh', desc: 'Tinh thể huyết mạch kết từ yêu khí của boss/tinh anh đã hạ. Cùng 1 Yêu Đan đúng phẩm, dùng để tiến hoá linh thú đã đạt cấp 10 trong panel Linh thú. Vạn Thú Môn gọi đây là "giọt máu tổ" của loài.', heal: 0 };
  }

  var uidSeq = 1;
  function ensurePets(ch) {
    if (!ch) return null;
    if (!ch.pets || typeof ch.pets !== 'object') ch.pets = { owned: [], activeUid: null, eggs: [], flags: {} };
    if (!Array.isArray(ch.pets.owned)) ch.pets.owned = [];
    if (!Array.isArray(ch.pets.eggs)) ch.pets.eggs = [];
    if (!ch.pets.flags || typeof ch.pets.flags !== 'object') ch.pets.flags = {};
    if (typeof ch.pets.nextUid !== 'number') ch.pets.nextUid = 1;
    uidSeq = Math.max(uidSeq, ch.pets.nextUid);
    return ch.pets;
  }
  function species(id) { return SPECIES[id] || null; }
  function petByUid(ch, uid) {
    ensurePets(ch);
    for (var i = 0; i < ch.pets.owned.length; i++) if (ch.pets.owned[i].uid === uid) return ch.pets.owned[i];
    return null;
  }
  function activePet(ch) {
    ensurePets(ch);
    return ch.pets.activeUid ? petByUid(ch, ch.pets.activeUid) : null;
  }
  function isDowned(pet) { return !!pet && pet.hp <= 0; }
  // Chỉ số theo cấp: HP +12%/cấp, công +15%/cấp (công thú xuất chiến giữ ở
  // mức ~30-55% công chủ cùng tiến trình — xem test cân bằng).
  function maxHpOf(pet) { var d = SPECIES[pet.sp]; return d ? Math.round(d.baseHp * (1 + 0.12 * (pet.level - 1))) : 1; }
  function atkOf(pet) { var d = SPECIES[pet.sp]; return d ? Math.max(1, Math.round(d.baseAtk * (1 + 0.15 * (pet.level - 1)))) : 1; }
  function expNeed(level) { return 30 * level; }
  function grantPet(ch, spId, opts) {
    var st = ensurePets(ch);
    var def = SPECIES[spId];
    if (!def) return { ok: false, reason: 'bad_species' };
    if (st.owned.length >= STABLE_MAX) return { ok: false, reason: 'stable_full' };
    var pet = { uid: 'pet' + (st.nextUid++), sp: spId, level: (opts && opts.level) || 1, exp: 0, hp: 0 };
    pet.hp = maxHpOf(pet);
    st.owned.push(pet);
    if (!st.activeUid) st.activeUid = pet.uid;
    return { ok: true, pet: pet };
  }
  function setActive(ch, uid) {
    var st = ensurePets(ch);
    if (uid === null || uid === undefined) { st.activeUid = null; return { ok: true, pet: null }; }
    var pet = petByUid(ch, uid);
    if (!pet) return { ok: false, reason: 'not_found' };
    st.activeUid = uid;
    return { ok: true, pet: pet };
  }
  // Hào quang của thú XUẤT CHIẾN còn sống -> khối stats dùng chung (định
  // dạng ở đầu js/logic.js). logic.js gearBlocks cộng khối này như pháp bảo.
  function totalStats(ch) {
    var zero = { hp: 0, def: 0, crit: 0, critDmg: 0, lifesteal: 0, ll: 0, llRegen: 0, speed: 0, elem: {} };
    if (!ch || !ch.pets) return zero;
    var pet = activePet(ch);
    if (!pet || isDowned(pet)) return zero;
    var def = SPECIES[pet.sp];
    if (!def || !def.aura) return zero;
    var a = def.aura, out = { hp: 0, def: 0, crit: 0, critDmg: 0, lifesteal: 0, ll: 0, llRegen: 0, speed: 0, elem: {} };
    ['hp', 'def', 'crit', 'critDmg', 'lifesteal', 'll', 'llRegen', 'speed'].forEach(function (k) {
      if (typeof a[k] === 'number') out[k] = a[k];
    });
    if (a.elem) Object.keys(a.elem).forEach(function (e) { out.elem[e] = a.elem[e]; });
    return out;
  }
  // ---------- Thu phục ----------
  function captureChance(def, hpPct) {
    if (hpPct > CAPTURE_HP_PCT) return 0;
    var c = CAPTURE_BASE[def.grade] * (1.35 - hpPct);
    return Math.max(0, Math.min(0.85, c));
  }
  function countItem(ch, itemId) {
    if (!ch || !ch.inventory) return 0;
    for (var i = 0; i < ch.inventory.length; i++) if (ch.inventory[i].id === itemId) return ch.inventory[i].count;
    return 0;
  }
  function consumeItem(ch, itemId, n) {
    n = n || 1;
    for (var i = 0; i < ch.inventory.length; i++) {
      if (ch.inventory[i].id === itemId && ch.inventory[i].count >= n) {
        ch.inventory[i].count -= n;
        if (ch.inventory[i].count <= 0) ch.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  // monster: { type, hp, maxHp, boss?, elite?, ev?, noRespawn? }.
  // Chỉ trừ bùa khi lần thử thật sự được lăn (đúng loài + máu đủ thấp).
  function tryCapture(ch, monster, rng) {
    var st = ensurePets(ch);
    var rand = rng || Math.random;
    if (!monster || monster.boss || monster.ev) return { ok: false, reason: 'not_wild' };
    var spId = WILD_CAPTURE[monster.type];
    if (!spId) return { ok: false, reason: 'not_wild' };
    var def = SPECIES[spId];
    var hpPct = monster.maxHp > 0 ? monster.hp / monster.maxHp : 1;
    if (hpPct > CAPTURE_HP_PCT) return { ok: false, reason: 'hp_high', chance: 0, hpPct: hpPct };
    if (countItem(ch, CHARM_ID) < 1) return { ok: false, reason: 'no_charm', chance: captureChance(def, hpPct), hpPct: hpPct };
    if (st.owned.length >= STABLE_MAX) return { ok: false, reason: 'stable_full', hpPct: hpPct };
    consumeItem(ch, CHARM_ID, 1);
    var chance = captureChance(def, hpPct);
    // TRẤN ÁP PHÙ (js/talismans.js): trong cửa sổ hiệu lực, tỉ lệ thu
    // phục nhân (1 + pct/100) — tăng tương đối tối đa +25%, trần tổng
    // 0.9 như cap của captureChance. Không có phù thì chance giữ nguyên.
    var TALc = (typeof window !== 'undefined' && window.PNT_TALISMANS) ||
      ((typeof globalThis !== 'undefined') ? globalThis.PNT_TALISMANS : null);
    if (TALc && TALc.captureBonusPct) {
      var bonusPct = TALc.captureBonusPct(ch, Date.now());
      if (bonusPct > 0) chance = Math.min(0.9, chance * (1 + bonusPct / 100));
    }
    if (rand() < chance) {
      var g = grantPet(ch, spId);
      return { ok: true, pet: g.pet, chance: chance, hpPct: hpPct };
    }
    return { ok: false, reason: 'failed', chance: chance, hpPct: hpPct };
  }
  // ---------- Trứng ----------
  function hatchSeconds(grade) { return 60 + grade * 45; }
  function rollEggSpecies(rng) {
    var rand = rng || Math.random;
    var pool = [];
    ORDER.forEach(function (id) { pool.push({ id: id, w: EGG_GRADE_W[SPECIES[id].grade] }); });
    var total = pool.reduce(function (s, p) { return s + p.w; }, 0);
    var r = rand() * total;
    for (var i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) return pool[i].id; }
    return pool[0].id;
  }
  function addEgg(ch, spId) {
    var st = ensurePets(ch);
    var def = SPECIES[spId];
    if (!def) return { ok: false, reason: 'bad_species' };
    if (st.eggs.length >= EGG_MAX) return { ok: false, reason: 'egg_full' };
    var egg = { sp: spId, prog: 0, need: hatchSeconds(def.grade) };
    st.eggs.push(egg);
    return { ok: true, egg: egg };
  }
  function rollEggDrop(monster, rng) {
    var rand = rng || Math.random;
    if (!monster) return null;
    var p = monster.boss ? 0.30 : (monster.elite ? 0.10 : 0.01);
    if (rand() >= p) return null;
    return rollEggSpecies(rand);
  }
  function tickEggs(ch, dtSec) {
    var st = ensurePets(ch);
    var ready = [];
    st.eggs.forEach(function (e, i) { e.prog += Math.max(0, dtSec || 0); if (e.prog >= e.need) ready.push(i); });
    return ready;
  }
  function hatchEgg(ch, idx) {
    var st = ensurePets(ch);
    var egg = st.eggs[idx];
    if (!egg) return { ok: false, reason: 'no_egg' };
    if (egg.prog < egg.need) return { ok: false, reason: 'not_ready' };
    var g = grantPet(ch, egg.sp);
    if (!g.ok) return g;
    st.eggs.splice(idx, 1);
    return { ok: true, pet: g.pet };
  }
  // ---------- Mua bán (Linh Thạch) ----------
  function buyCharm(ch, n) {
    ensurePets(ch);
    n = Math.max(1, n || 1);
    var cost = CHARM_PRICE * n;
    if ((ch.linhThach || 0) < cost) return { ok: false, reason: 'no_money', cost: cost };
    ch.linhThach -= cost;
    if (L && L.addItem) L.addItem(ch, CHARM_ID, n); else { ch.inventory.push({ id: CHARM_ID, count: n }); }
    return { ok: true, cost: cost, count: countItem(ch, CHARM_ID) };
  }
  function buyEgg(ch, rng) {
    ensurePets(ch);
    if ((ch.linhThach || 0) < EGG_PRICE) return { ok: false, reason: 'no_money', cost: EGG_PRICE };
    var r = addEgg(ch, rollEggSpecies(rng));
    if (!r.ok) return r;
    ch.linhThach -= EGG_PRICE;
    return { ok: true, cost: EGG_PRICE, egg: r.egg };
  }
  // ---------- EXP / chiến đấu mô phỏng (logic thuần cho test + game) ----------
  function isEvolved(pet) { return !!pet && !!pet.evo; }
  function maxLevelOf(pet) { return isEvolved(pet) ? EVO_MAX_LEVEL : MAX_LEVEL; }
  function displayNameOf(pet) {
    var d = pet ? SPECIES[pet.sp] : null;
    return d ? (d.name + (isEvolved(pet) ? ' (Tiến Hóa)' : '')) : '';
  }
  function evoSkillOf(pet) { return isEvolved(pet) ? EVO_SKILL : null; }
  function evoCostOf(pet) {
    var d = pet ? SPECIES[pet.sp] : null;
    if (!d) return null;
    return { yeuDanId: d.grade <= 1 ? 'yeu_dan_1' : 'yeu_dan_2', yeuDanN: 1, bloodId: BLOOD_ID, bloodN: 1 };
  }
  function canEvolve(ch, pet) {
    if (!pet) return { ok: false, reason: 'not_found' };
    if (isEvolved(pet)) return { ok: false, reason: 'already' };
    if (pet.level < MAX_LEVEL) return { ok: false, reason: 'not_max' };
    var cost = evoCostOf(pet);
    if (countItem(ch, cost.yeuDanId) < cost.yeuDanN) return { ok: false, reason: 'no_yeudan', cost: cost };
    if (countItem(ch, cost.bloodId) < cost.bloodN) return { ok: false, reason: 'no_blood', cost: cost };
    return { ok: true, cost: cost };
  }
  function evolve(ch, uid) {
    var pet = petByUid(ch, uid);
    var chk = canEvolve(ch, pet);
    if (!chk.ok) return chk;
    consumeItem(ch, chk.cost.yeuDanId, chk.cost.yeuDanN);
    consumeItem(ch, chk.cost.bloodId, chk.cost.bloodN);
    pet.evo = true;
    pet.exp = 0;
    pet.hp = maxHpOf(pet); // huyết mạch thức tỉnh hồi đầy HP
    return { ok: true, pet: pet, cost: chk.cost };
  }
  // Rơi Huyết Mạch Tinh khi hạ quái: chỉ boss/tinh anh (quái thường 0%).
  function rollBloodDrop(monster, rng) {
    var rand = rng || Math.random;
    if (!monster) return false;
    var p = monster.boss ? BLOOD_DROP.boss : (monster.elite ? BLOOD_DROP.elite : BLOOD_DROP.normal);
    return rand() < p;
  }
  function evoSkillDamage(pet, rng) {
    var rand = rng || Math.random;
    return Math.max(1, Math.round(atkOf(pet) * EVO_SKILL.mult * (0.9 + rand() * 0.2)));
  }
  function gainExp(ch, amount) {
    var pet = activePet(ch);
    if (!pet || isDowned(pet) || !(amount > 0)) return { pet: pet || null, levels: 0 };
    pet.exp += Math.round(amount);
    var levels = 0;
    while (pet.level < maxLevelOf(pet) && pet.exp >= expNeed(pet.level)) {
      pet.exp -= expNeed(pet.level);
      pet.level++; levels++;
      pet.hp = Math.min(maxHpOf(pet), pet.hp + Math.round(maxHpOf(pet) * 0.3));
    }
    if (pet.level >= maxLevelOf(pet)) pet.exp = 0;
    return { pet: pet, levels: levels };
  }
  function killExpFor(monsterDef) { return Math.round(6 + ((monsterDef && monsterDef.hp) || 20) / 8); }
  function attackDamage(pet, rng) {
    var rand = rng || Math.random;
    return Math.max(1, Math.round(atkOf(pet) * (0.8 + rand() * 0.4)));
  }
  function skillDamage(pet, rng) {
    var def = SPECIES[pet.sp];
    var mult = def.skill.kind === 'bolt' ? 1.5 : (def.skill.kind === 'stun' ? 1.1 : 1.6);
    return Math.max(1, Math.round(atkOf(pet) * mult * (0.9 + (rng || Math.random)() * 0.2)));
  }
  function skillHeal(pet) { return Math.max(8, Math.round(maxHpOf(pet) * 0.12)); }
  function damagePet(ch, dmg) {
    var pet = activePet(ch);
    if (!pet) return { pet: null, downed: false };
    pet.hp = Math.max(0, pet.hp - Math.max(0, Math.round(dmg || 0)));
    return { pet: pet, downed: pet.hp <= 0 };
  }
  // Về làng/nghỉ: thú gục hồi 50%, mọi thú hồi đầy dần — ở đây hồi ĐẦY cho
  // thú đang sống và 50% cho thú gục (đúng luật "hồi phục khi về làng").
  function restAtVillage(ch) {
    var st = ensurePets(ch);
    st.owned.forEach(function (p) {
      p.hp = isDowned(p) ? Math.round(maxHpOf(p) * 0.5) : maxHpOf(p);
    });
    return st.owned.length;
  }
  function feedPet(ch, uid, itemId) {
    var pet = petByUid(ch, uid);
    if (!pet) return { ok: false, reason: 'not_found' };
    var def = L && L.ITEMS ? L.ITEMS[itemId] : null;
    if (!def || !def.heal) return { ok: false, reason: 'not_food' };
    if (countItem(ch, itemId) < 1) return { ok: false, reason: 'no_item' };
    consumeItem(ch, itemId, 1);
    var healed = Math.round(def.heal * 2.5);
    var before = pet.hp;
    pet.hp = Math.min(maxHpOf(pet), pet.hp + healed);
    return { ok: true, healed: pet.hp - before, pet: pet };
  }

  var api = {
    GRADES: GRADES, ELEMS: ELEMS, ROLES: ROLES, MOVES: MOVES,
    SPECIES: SPECIES, ORDER: ORDER, WILD_CAPTURE: WILD_CAPTURE,
    CHARM_ID: CHARM_ID, CHARM_PRICE: CHARM_PRICE, EGG_PRICE: EGG_PRICE,
    STABLE_MAX: STABLE_MAX, EGG_MAX: EGG_MAX, MAX_LEVEL: MAX_LEVEL,
    BLOOD_ID: BLOOD_ID, BLOOD_DROP: BLOOD_DROP, EVO_MAX_LEVEL: EVO_MAX_LEVEL, EVO_SKILL: EVO_SKILL,
    isEvolved: isEvolved, maxLevelOf: maxLevelOf, displayNameOf: displayNameOf,
    evoSkillOf: evoSkillOf, evoCostOf: evoCostOf, canEvolve: canEvolve, evolve: evolve,
    rollBloodDrop: rollBloodDrop, evoSkillDamage: evoSkillDamage,
    CAPTURE_HP_PCT: CAPTURE_HP_PCT, CAPTURE_BASE: CAPTURE_BASE, VIEW: VIEW,
    ensurePets: ensurePets, species: species, petByUid: petByUid, activePet: activePet,
    isDowned: isDowned, maxHpOf: maxHpOf, atkOf: atkOf, expNeed: expNeed,
    grantPet: grantPet, setActive: setActive, totalStats: totalStats,
    captureChance: captureChance, tryCapture: tryCapture,
    countItem: countItem, consumeItem: consumeItem,
    hatchSeconds: hatchSeconds, rollEggSpecies: rollEggSpecies, addEgg: addEgg,
    rollEggDrop: rollEggDrop, tickEggs: tickEggs, hatchEgg: hatchEgg,
    buyCharm: buyCharm, buyEgg: buyEgg,
    gainExp: gainExp, killExpFor: killExpFor, attackDamage: attackDamage,
    skillDamage: skillDamage, skillHeal: skillHeal, damagePet: damagePet,
    restAtVillage: restAtVillage, feedPet: feedPet
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_PETS = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_PETS = api;
})();
