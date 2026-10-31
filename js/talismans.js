// Phàm Nhân Tu Đạo — HỆ PHÙ CHÚ (js/talismans.js, lệnh Bui 07:01 +
// 07:04 ngày 2026-10-30: "Tạo các loại phù chú" + chốt dòng phù cực hiếm
// chặn một phần lôi kiếp / hỗ trợ đột phá). Mở rộng và THAY mục B3
// "Phù Lục 1 lần" trong docs/auto-build-queue.md.
//
// THIẾT KẾ:
// - Phù là VẬT PHẨM TIÊU HAO dùng 1 lần rồi mất, xếp chồng trong túi
//   (entry { id, count } thường như đan dược). 18 LOẠI phù trong 4 nhóm
//   (công / thủ / hỗ trợ / đặc biệt), mỗi loại có các bản theo phẩm
//   Phàm -> Linh -> Huyền -> Địa; Thiên phẩm chỉ có THẾ LÔI PHÙ cực hiếm.
// - Sát thương phù theo PHẨM + công người dùng nhưng bị TRẦN CỨNG
//   (capMult x effAtk + flat): mọi phù công đều yếu hơn skill cùng cấp
//   (Kiếm Khí Trảm hệ số 1,6; chiêu cảnh giới 2,6+) — phù là đồ hỗ trợ
//   tiêu hao, KHÔNG thay thế tu luyện. TUYỆT ĐỐI không có phù tăng tỉ lệ
//   đột phá ngoài Hộ Đạo Phù (+8 điểm %, trần tổng hỗ trợ vật phẩm 40
//   điểm — xem HO_DAO bên dưới) và không phù nào miễn nhiễm lôi kiếp:
//   Thế Lôi Phù chỉ hấp thụ 30-50% của ĐÚNG 1 đạo, tối đa 2 lá/kỳ kiếp,
//   và phần sát thương bị chặn KHÔNG tính điểm Luyện Thể (chặn kiếp thì
//   thân xác không được rèn phần đó — đánh đổi ghi rõ ở mô tả vật phẩm).
// - CHẾ PHÙ tại Bàn Phù của Diệp Phù Sinh (Thiên Phù Các, NPC tong_phu):
//   học phù phương như đan phương (nguồn: Diệp Phù Sinh dạy cơ bản sau
//   q_tong_phu; chuỗi q_tal_1/q_tal_2; bái nhập Thiên Phù; quyển phù
//   phương pp_* rơi từ boss vương thú). Đệ tử Thiên Phù Các: nguyên
//   liệu + phí giảm 20% (làm tròn lên cho nguyên liệu, tối thiểu 1),
//   tỉ lệ +5 điểm %, và mở phù phương 'thien_phu_join' độc quyền tông.
// - NGUYÊN LIỆU: Giấy Phù (chế từ 3 Thảo Dược + 3 LT, hoặc mua 6 LT),
//   Chu Sa (mua 10 LT ở thương nhân / Bàn Phù; rơi 30% từ Lợn Mông Sắt;
//   thưởng q_tal_2), Linh Mặc (chế từ Linh Chi + Thanh Tâm Thảo + 10
//   LT), Giấy Phù Thiên (chỉ rơi từ boss vương thú — nguyên liệu của
//   phương Thiên phẩm).
// - KINH TẾ (docs/economy.md mục 9): shop chỉ bán bản Phàm (20-40 LT,
//   ~5-10 phút farm đầu chặng) và Linh (70-150 LT, ~10-20 phút giữa
//   chặng); Huyền không bán bằng LT (chế, hoặc đổi Điểm Cống Hiến ở Kho
//   Tông Thiên Phù); Địa/Thiên không bán. Mọi khoản đều là CHI (chìm),
//   hệ này không tạo nguồn Linh Thạch mới.
// - Bùa Ngự Thú (js/pets.js) được ĐĂNG KÝ vào danh mục phù (loại đặc
//   biệt, id bua_ngu_thu, giá 30 LT giữ nguyên) — cách bắt thú giữ
//   nguyên ở pets.js, dùng phù qua nút Thu phục như cũ.
// - Trạng thái lưu: ch.talisman = { learned: [], quick: <itemId|null>,
//   hoDao: <bool> } (serialize cùng nhân vật như ch.alchemy); hiệu ứng
//   tạm thời ở ch.talFx = { dmgRed, stealthUntil, hot, medBoostUntil,
//   captureUntil/capturePct, poisonImmuneUntil } — khởi tạo lười, save
//   cũ nạp được.
(function () {
  'use strict';

  var GRADES = {
    pham: { name: 'Phàm phẩm', rank: 0, color: '#b8b0a0' },
    linh: { name: 'Linh phẩm', rank: 1, color: '#7fe8d6' },
    huyen: { name: 'Huyền phẩm', rank: 2, color: '#cf9fff' },
    dia: { name: 'Địa phẩm', rank: 3, color: '#ffb84e' },
    thien: { name: 'Thiên phẩm', rank: 4, color: '#ffe9a8' }
  };
  var GROUPS = {
    cong: { name: 'Công kích' },
    thu: { name: 'Phòng thủ' },
    tro: { name: 'Hỗ trợ' },
    dac: { name: 'Đặc biệt' }
  };
  var ELEM_NAMES = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ', phong: 'Phong', loi: 'Lôi', bang: 'Băng' };

  function gget(name) {
    if (typeof window !== 'undefined' && window[name]) return window[name];
    if (typeof globalThis !== 'undefined' && globalThis[name]) return globalThis[name];
    return null;
  }
  function logicApi() { return gget('PNT_LOGIC'); }
  function skillsApi() { return gget('PNT_SKILLS'); }
  function petsApi() { return gget('PNT_PETS'); }
  function sectPointsApi() { return gget('PNT_SECT'); }
  function itemCount(ch, id) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === id) n += it.count; });
    return n;
  }

  // ---------------- NGUYÊN LIỆU PHÙ ----------------
  var MATERIALS = {
    giay_phu: { id: 'giay_phu', name: 'Giấy Phù', buyPrice: 6,
      desc: 'Giấy vàng phơi nắng giếng cổ, sợi giấy từ cỏ thuốc bờ suối linh. Nguyên liệu nền của mọi lá phù.' },
    chu_sa: { id: 'chu_sa', name: 'Chu Sa', buyPrice: 10,
      desc: 'Khoáng đỏ mài mịn từ đất đá bờ mỏ — mực đỏ khóa linh khí của phù tu. Lợn Mông Sắt ủi đất đỏ cũng hay lòi ra vài cục.' },
    linh_mac: { id: 'linh_mac', name: 'Linh Mặc', buyPrice: 0,
      desc: 'Mực đen mài từ linh chi và cỏ thơm, nét bùa viết bằng mực này giữ linh khí không thoát. Chỉ chế được, không nơi nào bán.' },
    giay_phu_thien: { id: 'giay_phu_thien', name: 'Giấy Phù Thiên', buyPrice: 0,
      desc: 'Tờ giấy vàng viền kim tuyến tự phát sáng mờ, rơi ra từ sào huyệt vương thú Đại Sơn. Giấy thường không chịu nổi phù Thiên phẩm — phải dùng tờ này.' }
  };
  var MAT_RECIPES = {
    giay_phu: { mats: { thao_duoc: 3 }, fee: 3, baseRate: 100, sourceText: 'Xé sợi 3 cây Thảo Dược, phơi nắng thành 1 tờ giấy phù.' },
    linh_mac: { mats: { linh_chi: 1, thanh_tam_thao: 1 }, fee: 10, baseRate: 90, sourceText: 'Mài Linh Chi với Thanh Tâm Thảo thành 1 thỏi linh mặc.' }
  };

  // ---------------- DANH MỤC PHÙ ----------------
  // fx.kind: 'atk' | 'shield' | 'dmgred' | 'escape' | 'speed' | 'hot' |
  // 'mana' | 'cure' | 'stealth' | 'teleport' | 'capture' | 'trib' |
  // 'break' | 'charm' (đăng ký chéo sang pets.js).
  // atk: mult/flat theo công; capMult = trần hệ số (dmg <= effAtk x
  // capMult + flat). mode: 'aoe' (nổ quanh mục tiêu gần nhất) |
  // 'single' | 'ranged' (tầm xa). freeze/freezeBoss tính bằng giây;
  // vulnPct/vulnDur: dấu phá giáp dùng chung trường markT/markPct của
  // Kính Chiếu Yêu (artifacts.artifactVsMult tiêu thụ thật).
  var TALISMANS = {
    // ===== CÔNG KÍCH =====
    hoa_phu_pham: { id: 'hoa_phu_pham', type: 'hoa_phu', name: 'Hỏa Phù', grade: 'pham', group: 'cong', elem: 'hoa', price: 25,
      fx: { kind: 'atk', mode: 'aoe', mult: 0.45, flat: 8, capMult: 0.95, radius: 95, range: 280 },
      fxText: 'Nổ lửa quanh quái gần nhất: sát thương lửa vùng 95, yếu hơn chiêu cùng cấp.',
      desc: 'Lá bùa đầu tay của phù tu: nét chu sa hình ngọn lửa, đốt lên là nổ một chùm lửa nhỏ. Đồ tiêu hao hỗ trợ, không thay được kiếm pháp.' },
    hoa_phu_linh: { id: 'hoa_phu_linh', type: 'hoa_phu', name: 'Hỏa Phù', grade: 'linh', group: 'cong', elem: 'hoa', price: 90,
      fx: { kind: 'atk', mode: 'aoe', mult: 0.6, flat: 12, capMult: 1.15, radius: 100, range: 280 },
      fxText: 'Nổ lửa quanh quái gần nhất: sát thương lửa vùng 100 theo công của bạn (có trần).',
      desc: 'Hỏa Phù Linh phẩm viết bằng linh mặc, lửa xanh lõi đỏ, nổ gọn trong một vùng quanh mục tiêu.' },
    hoa_phu_huyen: { id: 'hoa_phu_huyen', type: 'hoa_phu', name: 'Hỏa Phù', grade: 'huyen', group: 'cong', elem: 'hoa', price: 0,
      fx: { kind: 'atk', mode: 'aoe', mult: 0.8, flat: 18, capMult: 1.3, radius: 110, range: 300 },
      fxText: 'Nổ lửa lớn vùng 110 theo công của bạn (có trần) — vẫn dưới Toàn Phong Kiếm cùng cấp.',
      desc: 'Hỏa Phù Huyền phẩm của Thiên Phù Các: ba nét lửa chồng nhau, cháy thành một cột lửa thấp khi kích hoạt.' },
    loi_phu_pham: { id: 'loi_phu_pham', type: 'loi_phu', name: 'Lôi Phù', grade: 'pham', group: 'cong', elem: 'loi', price: 30,
      fx: { kind: 'atk', mode: 'single', mult: 0.75, flat: 6, capMult: 1.1, range: 300 },
      fxText: 'Một tia sét đánh quái gần nhất theo công của bạn (có trần).',
      desc: 'Nét bùa hình tia chớp gãy khúc. Sét của phù yếu hơn thiên lôi thật nhiều — chỉ là mượn một tia điện quang nhỏ.' },
    loi_phu_linh: { id: 'loi_phu_linh', type: 'loi_phu', name: 'Lôi Phù', grade: 'linh', group: 'cong', elem: 'loi', price: 110,
      fx: { kind: 'atk', mode: 'single', mult: 0.95, flat: 10, capMult: 1.3, range: 300 },
      fxText: 'Sét mạnh đánh quái gần nhất theo công của bạn (có trần, dưới Kiếm Khí Trảm).',
      desc: 'Lôi Phù Linh phẩm: tia sét tím trắng đánh thẳng một mục tiêu, nghe như tiếng roi quật.' },
    loi_phu_huyen: { id: 'loi_phu_huyen', type: 'loi_phu', name: 'Lôi Phù', grade: 'huyen', group: 'cong', elem: 'loi', price: 0,
      fx: { kind: 'atk', mode: 'single', mult: 1.15, flat: 14, capMult: 1.45, range: 320 },
      fxText: 'Sét Huyền phẩm đánh quái gần nhất theo công của bạn (trần 1,45 lần công — vẫn dưới skill cùng cấp).',
      desc: 'Lôi Phù Huyền phẩm vẽ bằng chu sa pha bột đá sét: một đạo điện quang dày như ngón tay.' },
    bang_phu_linh: { id: 'bang_phu_linh', type: 'bang_phu', name: 'Băng Phù', grade: 'linh', group: 'cong', elem: 'bang', price: 110,
      fx: { kind: 'atk', mode: 'single', mult: 0.3, flat: 6, capMult: 0.8, range: 300, freeze: 1.2, freezeBoss: 0.4, slowDur: 2.5 },
      fxText: 'Ít sát thương băng; đóng băng quái thường 1,2 giây (boss 0,4 giây), làm chậm thêm 2,5 giây.',
      desc: 'Nét bùa hình bông tuyết sáu cánh. Băng của phù mỏng và tan nhanh — quý ở chỗ giữ chân quái, không phải ở sát thương.' },
    bang_phu_huyen: { id: 'bang_phu_huyen', type: 'bang_phu', name: 'Băng Phù', grade: 'huyen', group: 'cong', elem: 'bang', price: 0,
      fx: { kind: 'atk', mode: 'single', mult: 0.4, flat: 8, capMult: 0.9, range: 320, freeze: 1.8, freezeBoss: 0.6, slowDur: 3.5 },
      fxText: 'Ít sát thương băng; đóng băng quái thường 1,8 giây (boss 0,6 giây), làm chậm thêm 3,5 giây.',
      desc: 'Băng Phù Huyền phẩm: lớp băng dày phủ kín chân mục tiêu, rìa băng ánh lam như thủy tinh Hàn Băng Cốc.' },
    kiem_khi_phu_linh: { id: 'kiem_khi_phu_linh', type: 'kiem_khi_phu', name: 'Kiếm Khí Phù', grade: 'linh', group: 'cong', elem: 'kim', price: 120,
      fx: { kind: 'atk', mode: 'ranged', mult: 0.85, flat: 8, capMult: 1.2, range: 300 },
      fxText: 'Một vệt kiếm khí chém quái gần nhất từ xa theo công của bạn (có trần).',
      desc: 'Phong một vệt kiếm khí vào giấy: xé phù là kiếm khí tự bay. Tiện cho người chưa tu tới Ngự Kiếm, nhưng yếu hơn kiếm khí tự thân nhiều.' },
    kiem_khi_phu_huyen: { id: 'kiem_khi_phu_huyen', type: 'kiem_khi_phu', name: 'Kiếm Khí Phù', grade: 'huyen', group: 'cong', elem: 'kim', price: 0,
      fx: { kind: 'atk', mode: 'ranged', mult: 1.05, flat: 12, capMult: 1.4, range: 320 },
      fxText: 'Kiếm khí Huyền phẩm chém xa theo công của bạn (có trần).',
      desc: 'Vệt kiếm khí trong phù này sắc và bền hơn, bay xa hơn bản Linh phẩm một đoạn.' },
    kiem_khi_phu_dia: { id: 'kiem_khi_phu_dia', type: 'kiem_khi_phu', name: 'Kiếm Khí Phù', grade: 'dia', group: 'cong', elem: 'kim', price: 0,
      fx: { kind: 'atk', mode: 'ranged', mult: 1.25, flat: 16, capMult: 1.55, range: 340 },
      fxText: 'Kiếm khí Địa phẩm chém xa theo công của bạn (trần 1,55 lần công — vẫn dưới chiêu cảnh giới).',
      desc: 'Phù phương Địa phẩm chỉ truyền qua quyển chép tay rơi từ vương thú: kiếm khí phong trong giấy mang theo một phần yêu khí đã thuần.' },
    pha_giap_phu_linh: { id: 'pha_giap_phu_linh', type: 'pha_giap_phu', name: 'Phá Giáp Phù', grade: 'linh', group: 'cong', elem: 'tho', price: 100,
      fx: { kind: 'atk', mode: 'single', mult: 0.25, flat: 4, capMult: 0.7, range: 300, vulnPct: 20, vulnDur: 6 },
      fxText: 'Ít sát thương; khắc dấu phá giáp: mục tiêu nhận thêm 20% sát thương trong 6 giây.',
      desc: 'Nét bùa hình mũi đục: không đánh mạnh, mà khoét một điểm yếu trên lớp giáp/yêu khí của mục tiêu cho đòn sau của bạn.' },
    pha_giap_phu_huyen: { id: 'pha_giap_phu_huyen', type: 'pha_giap_phu', name: 'Phá Giáp Phù', grade: 'huyen', group: 'cong', elem: 'tho', price: 0,
      fx: { kind: 'atk', mode: 'single', mult: 0.3, flat: 6, capMult: 0.75, range: 320, vulnPct: 30, vulnDur: 8 },
      fxText: 'Ít sát thương; mục tiêu nhận thêm 30% sát thương trong 8 giây.',
      desc: 'Dấu phá giáp Huyền phẩm ăn sâu hơn: cả bầy đòn sau đó của bạn đều nặng hơn lên đúng một mục tiêu.' },
    // ===== PHÒNG THỦ =====
    kim_cang_phu_pham: { id: 'kim_cang_phu_pham', type: 'kim_cang_phu', name: 'Kim Cang Phù', grade: 'pham', group: 'thu', elem: 'kim', price: 35,
      fx: { kind: 'shield', shieldPct: 15, dur: 20 },
      fxText: 'Dựng khiên linh khí chịu thay 15% Máu tối đa trong 20 giây (chung khiên với Linh Khí Thần Khiên, lấy mức lớn hơn).',
      desc: 'Nét bùa hình chuông vàng úp. Đệ tử Kim Cang Môn cười phù này là "chuông giấy" — nhưng chuông giấy đỡ được đòn thật.' },
    kim_cang_phu_linh: { id: 'kim_cang_phu_linh', type: 'kim_cang_phu', name: 'Kim Cang Phù', grade: 'linh', group: 'thu', elem: 'kim', price: 120,
      fx: { kind: 'shield', shieldPct: 25, dur: 20 },
      fxText: 'Khiên chịu thay 25% Máu tối đa trong 20 giây.',
      desc: 'Kim Cang Phù Linh phẩm: khiên vàng mỏng như cánh chuồn mà cứng, vỡ thì tan thành bụi sáng.' },
    kim_cang_phu_huyen: { id: 'kim_cang_phu_huyen', type: 'kim_cang_phu', name: 'Kim Cang Phù', grade: 'huyen', group: 'thu', elem: 'kim', price: 0,
      fx: { kind: 'shield', shieldPct: 35, dur: 25 },
      fxText: 'Khiên chịu thay 35% Máu tối đa trong 25 giây.',
      desc: 'Bản Huyền phẩm của Thiên Phù Các: khiên hai lớp, lớp ngoài vỡ còn lớp trong giữ thêm một nhịp thở.' },
    ho_than_phu_linh: { id: 'ho_than_phu_linh', type: 'ho_than_phu', name: 'Hộ Thân Phù', grade: 'linh', group: 'thu', elem: 'tho', price: 120,
      fx: { kind: 'dmgred', pct: 20, dur: 20 },
      fxText: 'Giảm 20% sát thương nhận vào trong 20 giây (cộng dồn theo cơ chế giảm sát thương sẵn có, vẫn bị trần).',
      desc: 'Dán lên ngực áo: một lớp khí mỏng bám theo thân, đòn đánh tới bị trượt đi một phần lực.' },
    ho_than_phu_huyen: { id: 'ho_than_phu_huyen', type: 'ho_than_phu', name: 'Hộ Thân Phù', grade: 'huyen', group: 'thu', elem: 'tho', price: 0,
      fx: { kind: 'dmgred', pct: 30, dur: 25 },
      fxText: 'Giảm 30% sát thương nhận vào trong 25 giây.',
      desc: 'Hộ Thân Phù Huyền phẩm: khí hộ thân dày như áo giáp vô hình, người làng nhìn vào chỉ thấy bóng bạn hơi nhòe đi.' },
    tho_don_phu_pham: { id: 'tho_don_phu_pham', type: 'tho_don_phu', name: 'Thổ Độn Phù', grade: 'pham', group: 'thu', elem: 'phong', price: 40,
      fx: { kind: 'escape' },
      fxText: 'Thoát combat: độn về điểm vào của map đang đứng (không xuyên cổng/map) + ẩn tức 4 giây. Không dùng được giữa lôi kiếp.',
      desc: 'Phù cứu mạng của người đi rừng: bóp nát là đất dưới chân mềm ra, kéo người về chỗ an toàn gần nhất trong cùng một vùng đất.' },
    // ===== HỖ TRỢ =====
    than_hanh_phu_pham: { id: 'than_hanh_phu_pham', type: 'than_hanh_phu', name: 'Thần Hành Phù', grade: 'pham', group: 'tro', elem: 'phong', price: 25,
      fx: { kind: 'speed', pct: 15, dur: 60 },
      fxText: 'Tốc độ +15% trong 60 giây (chung cơ chế buff với Thần Hành Đan — ghi đè, không cộng dồn).',
      desc: 'Dán sau gót giày: bước chân nhẹ hẳn như có gió đẩy. Phù tu đi giao bùa trấn làng toàn dùng thứ này.' },
    than_hanh_phu_linh: { id: 'than_hanh_phu_linh', type: 'than_hanh_phu', name: 'Thần Hành Phù', grade: 'linh', group: 'tro', elem: 'phong', price: 0,
      fx: { kind: 'speed', pct: 20, dur: 90 },
      fxText: 'Tốc độ +20% trong 90 giây.',
      desc: 'Bản Linh phẩm giữ gió lâu hơn: chạy một mạch từ làng lên chân núi không đứt hơi.' },
    hoi_xuan_phu_linh: { id: 'hoi_xuan_phu_linh', type: 'hoi_xuan_phu', name: 'Hồi Xuân Phù', grade: 'linh', group: 'tro', elem: 'moc', price: 110,
      fx: { kind: 'hot', hps: 4, dur: 10 },
      fxText: 'Hồi 4 Máu/giây trong 10 giây.',
      desc: 'Nét bùa hình chồi non: sinh khí thấm dần vào vết thương như mưa xuân thấm đất.' },
    hoi_xuan_phu_huyen: { id: 'hoi_xuan_phu_huyen', type: 'hoi_xuan_phu', name: 'Hồi Xuân Phù', grade: 'huyen', group: 'tro', elem: 'moc', price: 0,
      fx: { kind: 'hot', hps: 7, dur: 12 },
      fxText: 'Hồi 7 Máu/giây trong 12 giây.',
      desc: 'Bản Huyền phẩm: chồi non trên giấy như sống dậy, sinh khí mạnh gần bằng một viên Hồi Xuân Đan mà êm hơn.' },
    tu_linh_phu_pham: { id: 'tu_linh_phu_pham', type: 'tu_linh_phu', name: 'Tụ Linh Phù', grade: 'pham', group: 'tro', elem: 'thuy', price: 30,
      fx: { kind: 'mana', mana: 20, medMult: 1.5, medDur: 120 },
      fxText: 'Hồi ngay 20 linh lực; thổ nạp +50% tu vi trong 120 giây.',
      desc: 'Dán cạnh chỗ ngồi thiền: linh khí quanh thân đặc lại một vòng, thổ nạp đỡ tốn công hẳn.' },
    tu_linh_phu_linh: { id: 'tu_linh_phu_linh', type: 'tu_linh_phu', name: 'Tụ Linh Phù', grade: 'linh', group: 'tro', elem: 'thuy', price: 100,
      fx: { kind: 'mana', mana: 45, medMult: 1.5, medDur: 180 },
      fxText: 'Hồi ngay 45 linh lực; thổ nạp +50% tu vi trong 180 giây.',
      desc: 'Bản Linh phẩm tụ khí thành một vũng nhỏ quanh người ngồi — đệ tử các tông hay xin phù này trước kỳ thổ nạp dài.' },
    giai_doc_phu_pham: { id: 'giai_doc_phu_pham', type: 'giai_doc_phu', name: 'Giải Độc Phù', grade: 'pham', group: 'tro', elem: 'moc', price: 20,
      fx: { kind: 'cure' },
      fxText: 'Đốt lên hít khói: giải mọi độc đang mang (đối trọng độc của Ngũ Độc và rắn lục).',
      desc: 'Phù giải độc của Thiên Phù Các phát cho dân làng vào mùa rắn: rẻ, sẵn, và cứu người thật.' },
    giai_doc_phu_linh: { id: 'giai_doc_phu_linh', type: 'giai_doc_phu', name: 'Giải Độc Phù', grade: 'linh', group: 'tro', elem: 'moc', price: 70,
      fx: { kind: 'cure', immuneSec: 60 },
      fxText: 'Giải mọi độc đang mang + miễn nhiễm độc 60 giây.',
      desc: 'Bản Linh phẩm để lại một lớp khói thuốc mỏng quanh thân: độc chạm vào tự tan trong một lúc.' },
    an_tuc_phu_linh: { id: 'an_tuc_phu_linh', type: 'an_tuc_phu', name: 'Ẩn Tức Phù', grade: 'linh', group: 'tro', elem: 'phong', price: 140,
      fx: { kind: 'stealth', dur: 25 },
      fxText: 'Ẩn tức 25 giây: quái thường không phát hiện bạn; đòn phản công đầu tiên khi bạn ra tay sẽ trượt và phá ẩn. Không áp dụng boss/tinh anh/quái sự kiện.',
      desc: 'Ép khí tức xuống như nén hơi thở của người lặn nước. Thú dữ đi ngang chỉ ngửi thấy mùi giấy cháy.' },
    an_tuc_phu_huyen: { id: 'an_tuc_phu_huyen', type: 'an_tuc_phu', name: 'Ẩn Tức Phù', grade: 'huyen', group: 'tro', elem: 'phong', price: 0,
      fx: { kind: 'stealth', dur: 40 },
      fxText: 'Ẩn tức 40 giây: quái thường không phát hiện bạn; đòn phản công đầu tiên khi bạn ra tay sẽ trượt và phá ẩn. Không áp dụng boss/tinh anh/quái sự kiện.',
      desc: 'Bản Huyền phẩm ấn khí sâu hơn: đứng yên giữa bãi thú cũng như một gốc cây khô.' },
    // ===== ĐẶC BIỆT =====
    bua_ngu_thu: { id: 'bua_ngu_thu', type: 'bua_ngu_thu', name: 'Bùa Ngự Thú', grade: 'pham', group: 'dac', elem: 'moc', price: 30,
      fx: { kind: 'charm' },
      fxText: 'Thu phục quái hoang đúng loài khi máu nó còn dưới 35% (dùng qua nút Thu phục — giữ nguyên luật của Vạn Thú Môn).',
      desc: 'Lá bùa của Vạn Thú Môn. Đăng ký chung vào danh mục phù của Thiên Phù Các: cùng là giấy vàng chu sa, khác nhau ở chỗ lá này vẽ để kết bạn với thú.' },
    truyen_tong_phu_linh: { id: 'truyen_tong_phu_linh', type: 'truyen_tong_phu', name: 'Truyền Tống Phù', grade: 'linh', group: 'dac', elem: 'phong', price: 150,
      fx: { kind: 'teleport' },
      fxText: 'Truyền tống về làng Thanh Khê từ map thường. KHÔNG dùng được trong bí cảnh, Võ Đài Đại Hội, giữa sự kiện (thú triều/hộ tống) hay giữa lôi kiếp.',
      desc: 'Phù đắt vì giấy phải chịu được một lần xé không gian ngắn. Thiên Phù Các dặn kỹ: trong bí cảnh linh khí rối, xé bừa là kẹt giữa hai tầng đất.' },
    tran_ap_phu_linh: { id: 'tran_ap_phu_linh', type: 'tran_ap_phu', name: 'Trấn Áp Phù', grade: 'linh', group: 'dac', elem: 'moc', price: 130,
      fx: { kind: 'capture', pct: 15, dur: 120 },
      fxText: 'Trong 120 giây: tỉ lệ thu phục bằng Bùa Ngự Thú tăng tương đối +15% (trần tổng 90%). Chỉ áp dụng quái hoang thường.',
      desc: 'Dán lên lưng áo trước khi vào bãi thú: khí tức của bạn nặng xuống như tay thợ săn già, thú yếu vía dễ khuất phục hơn.' },
    tran_ap_phu_huyen: { id: 'tran_ap_phu_huyen', type: 'tran_ap_phu', name: 'Trấn Áp Phù', grade: 'huyen', group: 'dac', elem: 'moc', price: 0,
      fx: { kind: 'capture', pct: 25, dur: 120 },
      fxText: 'Trong 120 giây: tỉ lệ thu phục bằng Bùa Ngự Thú tăng tương đối +25% (trần tổng 90%). Chỉ áp dụng quái hoang thường.',
      desc: 'Bản Huyền phẩm của Vạn Thú Môn đặt Thiên Phù Các vẽ riêng: thêm một nét trấn lên ấn ngự thú.' },
    the_loi_phu: { id: 'the_loi_phu', type: 'the_loi_phu', name: 'Thế Lôi Phù', grade: 'thien', group: 'dac', elem: 'loi', price: 0,
      fx: { kind: 'trib', absorbMin: 30, absorbMax: 50, maxPerTrib: 2 },
      fxText: 'THIÊN PHẨM CỰC HIẾM. Dùng khi đang chịu lôi kiếp: lá phù thay bạn hứng 30-50% sát thương của ĐÚNG 1 đạo sét rồi tan. Mỗi kỳ kiếp tối đa 2 lá. Đánh đổi: phần sát thương bị phù chặn KHÔNG tính điểm Luyện Thể — chặn kiếp thì thân xác không được rèn phần đó. Không bán, không chế bằng phương thường.',
      desc: 'Lá bùa viền vàng rực, giữa giấy là triện sét của một vị phù sư đã phi thăng để lại. Nó không làm kiếp nhẹ đi — nó chỉ đứng ra chịu thay một phần, và thiên đạo ghi sổ phần đó là "chưa rèn".' },
    ho_dao_phu: { id: 'ho_dao_phu', type: 'ho_dao_phu', name: 'Hộ Đạo Phù', grade: 'dia', group: 'dac', elem: 'kim', price: 0,
      fx: { kind: 'break', bonus: 8 },
      fxText: 'Đốt trước khi đột phá (tầng Luyện Khí / tiểu giai đoạn): +8 điểm % tỉ lệ thành công cho lần thử kế tiếp, tiêu hao khi thử (kể cả thất bại). Cộng dồn với đan hỗ trợ nhưng TỔNG hỗ trợ từ vật phẩm bị trần cứng 40 điểm % và tỉ lệ cuối vẫn không chạm 100%. Tối đa 1 lá mỗi lần đột phá. Không tác dụng với lôi kiếp liên cảnh giới (kiếp không có tỉ lệ — đó là phần của Thế Lôi Phù).',
      desc: 'Hộ ấn vàng khắc trên giấy trầm: không mở đường tắt, chỉ giữ tâm người đột phá vững thêm một phần trong khoảnh khắc xung quan.' }
  };
  // Danh sách bán bằng Linh Thạch (shop): chỉ Phàm + Linh có price > 0.
  var SHOP = Object.keys(TALISMANS).filter(function (id) { return TALISMANS[id].price > 0; });
  // Loại phù (type) — dùng cho ô dùng nhanh + kiểm đếm danh mục.
  var TYPES = {};
  Object.keys(TALISMANS).forEach(function (id) { TYPES[TALISMANS[id].type] = true; });

  // ---------------- PHÙ PHƯƠNG (công thức chế phù) ----------------
  // source: 'diep_phu' (Diệp Phù Sinh dạy sau q_tong_phu) |
  // 'quest:q_tal_1' | 'quest:q_tal_2' | 'thien_phu_join' (độc quyền
  // đệ tử Thiên Phù) | 'thien_phu_elite' (Thiên Phù + Chân Truyền) |
  // 'scroll:pp_*' (đọc quyển phù phương rơi từ boss).
  var RECIPES = {
    hoa_phu_pham: { mats: { giay_phu: 1, chu_sa: 1 }, fee: 5, baseRate: 90, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu (sau nhiệm vụ "Giữ kho giấy bùa")' },
    loi_phu_pham: { mats: { giay_phu: 1, chu_sa: 1 }, fee: 5, baseRate: 90, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu' },
    kim_cang_phu_pham: { mats: { giay_phu: 1, chu_sa: 1 }, fee: 6, baseRate: 88, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu' },
    tho_don_phu_pham: { mats: { giay_phu: 1, chu_sa: 1 }, fee: 6, baseRate: 88, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu' },
    than_hanh_phu_pham: { mats: { giay_phu: 1, chu_sa: 1 }, fee: 5, baseRate: 90, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu' },
    tu_linh_phu_pham: { mats: { giay_phu: 1, chu_sa: 1, thanh_tam_thao: 1 }, fee: 6, baseRate: 86, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu' },
    giai_doc_phu_pham: { mats: { giay_phu: 1, chu_sa: 1, thao_duoc: 1 }, fee: 5, baseRate: 88, source: 'diep_phu', sourceText: 'Diệp Phù Sinh dạy khi mở Bàn Phù lần đầu' },
    hoa_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 12, baseRate: 82, source: 'quest:q_tal_1', sourceText: 'Thưởng nhiệm vụ "Nét bùa đầu tay" (Diệp Phù Sinh)' },
    loi_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 12, baseRate: 82, source: 'quest:q_tal_1', sourceText: 'Thưởng nhiệm vụ "Nét bùa đầu tay" (Diệp Phù Sinh)' },
    kim_cang_phu_linh: { mats: { giay_phu: 2, chu_sa: 2 }, fee: 14, baseRate: 80, source: 'quest:q_tal_1', sourceText: 'Thưởng nhiệm vụ "Nét bùa đầu tay" (Diệp Phù Sinh)' },
    hoi_xuan_phu_linh: { mats: { giay_phu: 1, chu_sa: 1, linh_mac: 1, linh_chi: 1 }, fee: 14, baseRate: 80, source: 'quest:q_tal_1', sourceText: 'Thưởng nhiệm vụ "Nét bùa đầu tay" (Diệp Phù Sinh)' },
    tu_linh_phu_linh: { mats: { giay_phu: 1, chu_sa: 1, linh_mac: 1, tu_linh_qua: 1 }, fee: 12, baseRate: 80, source: 'quest:q_tal_1', sourceText: 'Thưởng nhiệm vụ "Nét bùa đầu tay" (Diệp Phù Sinh)' },
    giai_doc_phu_linh: { mats: { giay_phu: 1, chu_sa: 1, thanh_tam_thao: 2 }, fee: 12, baseRate: 80, source: 'quest:q_tal_1', sourceText: 'Thưởng nhiệm vụ "Nét bùa đầu tay" (Diệp Phù Sinh)' },
    bang_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 14, baseRate: 80, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    kiem_khi_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 14, baseRate: 80, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    pha_giap_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 12, baseRate: 80, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    ho_than_phu_linh: { mats: { giay_phu: 2, chu_sa: 2, linh_mac: 1 }, fee: 14, baseRate: 78, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    an_tuc_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 14, baseRate: 78, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    tran_ap_phu_linh: { mats: { giay_phu: 2, chu_sa: 1, linh_mac: 1 }, fee: 14, baseRate: 78, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    truyen_tong_phu_linh: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 1 }, fee: 20, baseRate: 75, source: 'quest:q_tal_2', sourceText: 'Thưởng nhiệm vụ "Chu sa đầu nguồn" (Diệp Phù Sinh)' },
    hoa_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 30, baseRate: 72, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    loi_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 30, baseRate: 72, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    bang_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 30, baseRate: 72, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    kim_cang_phu_huyen: { mats: { giay_phu: 3, chu_sa: 3, linh_mac: 1 }, fee: 30, baseRate: 72, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    hoi_xuan_phu_huyen: { mats: { giay_phu: 2, chu_sa: 2, linh_mac: 2, huyet_sam: 1 }, fee: 32, baseRate: 70, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    ho_than_phu_huyen: { mats: { giay_phu: 3, chu_sa: 3, linh_mac: 2 }, fee: 32, baseRate: 70, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    an_tuc_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 30, baseRate: 70, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    tran_ap_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 30, baseRate: 70, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    pha_giap_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 30, baseRate: 70, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    kiem_khi_phu_huyen: { mats: { giay_phu: 3, chu_sa: 2, linh_mac: 2 }, fee: 32, baseRate: 70, source: 'thien_phu_join', sourceText: 'Độc quyền đệ tử Thiên Phù Các — truyền khi bái nhập tông' },
    kiem_khi_phu_dia: { mats: { giay_phu: 4, chu_sa: 3, linh_mac: 3, yeu_dan_1: 1 }, fee: 60, baseRate: 62, source: 'scroll:pp_kiem_khi_phu', sourceText: 'Quyển Phù Phương: Kiếm Khí Phù Địa — rơi cực hiếm từ vương thú Đại Sơn' },
    ho_dao_phu: { mats: { giay_phu: 4, chu_sa: 3, linh_mac: 2, ngoc_tuy_chi: 1, yeu_dan_2: 1 }, fee: 150, baseRate: 58, source: 'thien_phu_elite', sourceText: 'Đệ tử Thiên Phù Các đạt Chân Truyền (300 Điểm Cống Hiến) mới được truyền phương Hộ Đạo' },
    the_loi_phu: { mats: { giay_phu_thien: 1, tinh_van_thach: 1, yeu_dan_3: 1, chu_sa: 3 }, fee: 300, baseRate: 50, source: 'scroll:pp_the_loi_phu', sourceText: 'Quyển Phù Phương: Thế Lôi Phù — rơi cực hiếm (3%) từ Thiết Bì Ma Vương' }
  };
  function recipeOf(id) { return RECIPES[id] || null; }
  var QUEST_RECIPES = {
    q_tal_1: ['hoa_phu_linh', 'loi_phu_linh', 'kim_cang_phu_linh', 'hoi_xuan_phu_linh', 'tu_linh_phu_linh', 'giai_doc_phu_linh'],
    q_tal_2: ['bang_phu_linh', 'kiem_khi_phu_linh', 'pha_giap_phu_linh', 'ho_than_phu_linh', 'an_tuc_phu_linh', 'tran_ap_phu_linh', 'truyen_tong_phu_linh']
  };
  // Quyển phù phương (vật phẩm pp_* trong ITEMS của logic.js): map sang
  // phù phương học được khi đọc.
  var SCROLLS = { pp_kiem_khi_phu: 'kiem_khi_phu_dia', pp_the_loi_phu: 'the_loi_phu' };

  // ---------------- Trạng thái ----------------
  function ensureTalisman(ch) {
    if (!ch) return null;
    if (!ch.talisman || typeof ch.talisman !== 'object') ch.talisman = { learned: [], quick: null, hoDao: false };
    if (!Array.isArray(ch.talisman.learned)) ch.talisman.learned = [];
    if (typeof ch.talisman.hoDao !== 'boolean') ch.talisman.hoDao = false;
    if (!ch.talFx || typeof ch.talFx !== 'object') ch.talFx = {};
    return ch.talisman;
  }
  function hasLearned(ch, id) { ensureTalisman(ch); return ch.talisman.learned.indexOf(id) >= 0; }
  function learnedList(ch) { ensureTalisman(ch); return ch.talisman.learned.slice(); }
  function teachRecipe(ch, id) {
    if (!RECIPES[id]) return false;
    ensureTalisman(ch);
    if (ch.talisman.learned.indexOf(id) >= 0) return false;
    ch.talisman.learned.push(id);
    return true;
  }
  function isThienPhu(flags) { return !!(flags && flags.sectJoined === 'thien_phu'); }
  // Diệp Phù Sinh dạy bộ cơ bản — chỉ khi Thiên Phù Các đã mở (đã trả
  // q_tong_phu). Trả danh sách id phương MỚI học.
  function teachBasics(ch, qs) {
    var L = logicApi();
    var out = [];
    if (!L || !qs || !L.isTurnedIn(qs, 'q_tong_phu')) return out;
    Object.keys(RECIPES).forEach(function (id) {
      if (RECIPES[id].source === 'diep_phu' && teachRecipe(ch, id)) out.push(id);
    });
    return out;
  }
  function basicsMissing(ch, qs) {
    var L = logicApi();
    if (!L || !qs || !L.isTurnedIn(qs, 'q_tong_phu')) return [];
    return Object.keys(RECIPES).filter(function (id) {
      return RECIPES[id].source === 'diep_phu' && !hasLearned(ch, id);
    });
  }
  function afterTurnIn(ch, qid) {
    var names = [];
    (QUEST_RECIPES[qid] || []).forEach(function (id) {
      if (teachRecipe(ch, id)) names.push(TALISMANS[id].name + ' ' + GRADES[TALISMANS[id].grade].name);
    });
    return names;
  }
  // Đồng bộ phương độc quyền tông: bái nhập Thiên Phù -> 'thien_phu_join';
  // thêm mốc Chân Truyền (tổng cống hiến >= 300) -> 'thien_phu_elite'.
  function syncSectRecipes(ch, flags) {
    var names = [];
    if (!isThienPhu(flags)) return names;
    Object.keys(RECIPES).forEach(function (id) {
      if (RECIPES[id].source === 'thien_phu_join' && teachRecipe(ch, id)) names.push(TALISMANS[id].name);
    });
    var SP = sectPointsApi();
    var total = SP && typeof SP.totalOf === 'function' ? SP.totalOf(ch) : 0;
    if (total >= 300) {
      Object.keys(RECIPES).forEach(function (id) {
        if (RECIPES[id].source === 'thien_phu_elite' && teachRecipe(ch, id)) names.push(TALISMANS[id].name);
      });
    }
    return names;
  }
  // Đọc quyển phù phương pp_*: học vĩnh viễn; quyển chỉ tiêu hao khi học
  // được phương MỚI (như quyển đan phương dp_*).
  function useRecipeScroll(ch, itemId) {
    var L = logicApi();
    var target = SCROLLS[itemId];
    if (!target || !L) return { ok: false };
    var def = TALISMANS[target];
    if (itemCount(ch, itemId) <= 0) return { ok: false, talismanScroll: true, msg: 'Túi không có quyển phù phương này.' };
    if (hasLearned(ch, target)) {
      return { ok: false, talismanScroll: true, alreadyKnown: true, msg: 'Bạn đã học phù phương ' + def.name + ' (' + GRADES[def.grade].name + ') rồi — quyển này cứ giữ trong túi.' };
    }
    if (!L.consumeItem(ch, itemId, 1)) return { ok: false };
    teachRecipe(ch, target);
    return { ok: true, talismanScroll: true, learned: target, msg: 'Mở quyển chép tay, học được phù phương: ' + def.name + ' (' + GRADES[def.grade].name + ')! Tới Bàn Phù của Diệp Phù Sinh để chế phù.' };
  }

  // ---------------- Chế phù / chế nguyên liệu ----------------
  // Đệ tử Thiên Phù: nguyên liệu giảm 20% (làm tròn lên, tối thiểu 1),
  // phí giảm 20% (làm tròn xuống), tỉ lệ +5 điểm %.
  function effMats(ch, flags, mats) {
    var out = {};
    var disc = isThienPhu(flags);
    Object.keys(mats).forEach(function (m) {
      out[m] = disc ? Math.max(1, Math.ceil(mats[m] * 0.8)) : mats[m];
    });
    return out;
  }
  function effFee(ch, flags, fee) { return isThienPhu(flags) ? Math.floor(fee * 0.8) : fee; }
  function successRate(ch, flags, id) {
    var r = RECIPES[id];
    if (!r) return 0;
    var rate = r.baseRate + (ch.tier || 0) * 3 + (isThienPhu(flags) ? 5 : 0);
    return Math.max(5, Math.min(95, rate));
  }
  function canCraft(ch, flags, id) {
    var r = RECIPES[id];
    if (!r) return { ok: false, reason: 'no_recipe' };
    if (!hasLearned(ch, id)) return { ok: false, reason: 'not_learned' };
    var mats = effMats(ch, flags, r.mats), lack = [];
    Object.keys(mats).forEach(function (m) { if (itemCount(ch, m) < mats[m]) lack.push(m); });
    if (lack.length) return { ok: false, reason: 'mats', lack: lack };
    if ((ch.linhThach || 0) < effFee(ch, flags, r.fee)) return { ok: false, reason: 'linhThach' };
    return { ok: true };
  }
  // Chế 1 lá phù. Thành công: trừ nguyên liệu (đã giảm nếu đệ tử Thiên
  // Phù) + phí, nhận 1 lá. Thất bại: mất phí + một nửa nguyên liệu (làm
  // tròn lên) như luyện đan — nét bùa hỏng thì giấy coi như bỏ.
  function craft(ch, flags, id, rng) {
    var L = logicApi();
    var chk = canCraft(ch, flags, id);
    if (!chk.ok) return chk;
    var r = RECIPES[id];
    var mats = effMats(ch, flags, r.mats);
    var fee = effFee(ch, flags, r.fee);
    var rate = successRate(ch, flags, id);
    var roll = (typeof rng === 'function' ? rng() : Math.random()) * 100;
    ch.linhThach -= fee;
    if (roll < rate) {
      Object.keys(mats).forEach(function (m) { L.consumeItem(ch, m, mats[m]); });
      L.addItem(ch, id, 1);
      return { ok: true, rate: rate, id: id };
    }
    var lost = {};
    Object.keys(mats).forEach(function (m) {
      var n = Math.ceil(mats[m] / 2);
      if (n > 0 && L.consumeItem(ch, m, n)) lost[m] = n;
    });
    return { ok: false, reason: 'failed', rate: rate, lost: lost };
  }
  function canCraftMat(ch, matId) {
    var r = MAT_RECIPES[matId];
    if (!r) return { ok: false, reason: 'no_recipe' };
    var lack = [];
    Object.keys(r.mats).forEach(function (m) { if (itemCount(ch, m) < r.mats[m]) lack.push(m); });
    if (lack.length) return { ok: false, reason: 'mats', lack: lack };
    if ((ch.linhThach || 0) < r.fee) return { ok: false, reason: 'linhThach' };
    return { ok: true };
  }
  function craftMat(ch, matId, rng) {
    var L = logicApi();
    var chk = canCraftMat(ch, matId);
    if (!chk.ok) return chk;
    var r = MAT_RECIPES[matId];
    var rate = r.baseRate;
    var roll = (typeof rng === 'function' ? rng() : Math.random()) * 100;
    ch.linhThach -= r.fee;
    if (roll < rate) {
      Object.keys(r.mats).forEach(function (m) { L.consumeItem(ch, m, r.mats[m]); });
      L.addItem(ch, matId, 1);
      return { ok: true, rate: rate, id: matId };
    }
    var lost = {};
    Object.keys(r.mats).forEach(function (m) {
      var n = Math.ceil(r.mats[m] / 2);
      if (n > 0 && L.consumeItem(ch, m, n)) lost[m] = n;
    });
    return { ok: false, reason: 'failed', rate: rate, lost: lost };
  }
  // Mua nguyên liệu / mua phù ở Bàn Phù + thương nhân (giá LT trong def).
  function buyItem(ch, id) {
    var L = logicApi();
    var price = 0;
    if (MATERIALS[id] && MATERIALS[id].buyPrice > 0) price = MATERIALS[id].buyPrice;
    else if (TALISMANS[id] && TALISMANS[id].price > 0) price = TALISMANS[id].price;
    if (!price) return { ok: false, reason: 'not_sold' };
    if ((ch.linhThach || 0) < price) return { ok: false, reason: 'linhThach' };
    ch.linhThach -= price;
    L.addItem(ch, id, 1);
    return { ok: true, price: price };
  }

  // ---------------- Sát thương phù công ----------------
  // Trần cứng: dmg <= effAtk x capMult + flat — mọi phù công đều dưới
  // skill cùng cấp (test PHU khóa bất biến này theo từng phẩm).
  function damageFor(ch, def, rng) {
    var L = logicApi();
    if (!L) return 0;
    var atk = L.effAtk(ch);
    var r = typeof rng === 'function' ? rng() : Math.random();
    var raw = atk * def.fx.mult + def.fx.flat;
    var dmg = Math.round(raw * (0.9 + r * 0.2));
    var cap = Math.round(atk * def.fx.capMult) + def.fx.flat;
    return Math.max(1, Math.min(cap, dmg));
  }
  function damageCap(ch, def) {
    var L = logicApi();
    if (!L) return 0;
    return Math.round(L.effAtk(ch) * def.fx.capMult) + def.fx.flat;
  }

  // ---------------- Hiệu ứng tạm thời (ch.talFx) ----------------
  function fxOf(ch) { ensureTalisman(ch); return ch.talFx; }
  function dmgRedPct(ch, now) {
    var f = fxOf(ch), d = f.dmgRed;
    if (!d || now >= d.until) return 0;
    return d.pct || 0;
  }
  function stealthActive(ch, now) {
    var f = fxOf(ch);
    return !!(f.stealthUntil && now < f.stealthUntil);
  }
  // Đòn phản công đầu tiên của quái THƯỜNG khi người chơi đang ẩn tức:
  // trượt + phá ẩn. Boss/tinh anh/quái sự kiện miễn nhiễm (trả false).
  function breakStealthOnHit(ch, monster, now) {
    if (!stealthActive(ch, now)) return false;
    if (!monster || monster.boss || monster.elite || monster.ev || monster.tide || monster.escort || monster.worldBoss) return false;
    ch.talFx.stealthUntil = 0;
    return true;
  }
  function poisonImmune(ch, now) {
    var f = fxOf(ch);
    return !!(f.poisonImmuneUntil && now < f.poisonImmuneUntil);
  }
  function captureBonusPct(ch, now) {
    var f = fxOf(ch);
    if (!f.captureUntil || now >= f.captureUntil) return 0;
    return f.capturePct || 0;
  }
  function medMult(ch, now) {
    var f = fxOf(ch);
    if (!f.medBoostUntil || now >= f.medBoostUntil) return 1;
    return f.medMult || 1;
  }
  // Hồi máu theo giây của Hồi Xuân Phù — game.js gọi mỗi giây (cùng nhịp
  // trừ độc). Trả lượng HP đã hồi kỳ này.
  function tickHot(ch, now) {
    var L = logicApi();
    var f = fxOf(ch), h = f.hot;
    if (!h || !L) return 0;
    if (now >= h.until) { f.hot = null; return 0; }
    var before = ch.hp;
    ch.hp = Math.min(L.effMaxHp(ch), ch.hp + h.hps);
    return ch.hp - before;
  }

  // ---------------- HỘ ĐẠO PHÙ (hỗ trợ đột phá) ----------------
  var HO_DAO_BONUS = 8;        // điểm % cộng tỉ lệ cho lần thử kế tiếp
  var ITEM_SUPPORT_CAP = 40;   // trần TỔNG hỗ trợ từ vật phẩm (đan + phù)
  function hoDaoArmed(ch) { ensureTalisman(ch); return !!ch.talisman.hoDao; }
  function hoDaoBonus(ch) { return hoDaoArmed(ch) ? HO_DAO_BONUS : 0; }
  // logic.js / realms.js gọi khi một lần thử đột phá THẬT diễn ra (đã
  // quay tỉ lệ): phù cháy hết dù thành công hay thất bại.
  function consumeHoDao(ch) {
    ensureTalisman(ch);
    if (!ch.talisman.hoDao) return false;
    ch.talisman.hoDao = false;
    return true;
  }

  // ---------------- THẾ LÔI PHÙ (chặn một phần lôi kiếp) ----------------
  var THE_LOI_MAX_PER_TRIB = 2;
  // Kích hoạt 1 lá Thế Lôi Phù cho đạo sét KẾ TIẾP: chỉ khi đang trong
  // lôi kiếp (ch.tribulation còn sống). % hấp thụ lăn 30-50 ngay lúc
  // kích hoạt và ghi vào trib.theLoiArmed; realms.tribStrikeDamage tiêu
  // thụ khi đạo đó giáng (đứng trong vòng). Trần 2 lá/kỳ tính cả lá
  // đang chờ (armed) lẫn lá đã cháy (theLoiUsed).
  function armTheLoi(ch, rng) {
    var trib = ch && ch.tribulation;
    if (!trib) return { ok: false, reason: 'no_tribulation', msg: 'Thế Lôi Phù chỉ cháy được khi thiên lôi đang giáng — ngoài lôi kiếp nó chỉ là tờ giấy vàng.' };
    var used = (trib.theLoiUsed || 0) + (trib.theLoiArmed ? 1 : 0);
    if (used >= THE_LOI_MAX_PER_TRIB) return { ok: false, reason: 'max_per_trib', msg: 'Mỗi kỳ kiếp chỉ được dùng tối đa ' + THE_LOI_MAX_PER_TRIB + ' lá Thế Lôi Phù — thiên đạo không cho chắn thêm.' };
    if (trib.theLoiArmed) return { ok: false, reason: 'already_armed', msg: 'Đã có một lá Thế Lôi Phù đang chờ hứng đạo sét kế tiếp.' };
    var L = logicApi();
    if (itemCount(ch, 'the_loi_phu') <= 0) return { ok: false, reason: 'no_item', msg: 'Túi không có Thế Lôi Phù.' };
    if (!L.consumeItem(ch, 'the_loi_phu', 1)) return { ok: false, reason: 'no_item', msg: 'Túi không có Thế Lôi Phù.' };
    var r = typeof rng === 'function' ? rng() : Math.random();
    var pct = 30 + Math.floor(r * 21); // 30..50
    trib.theLoiArmed = pct;
    return { ok: true, pct: pct, msg: 'Thế Lôi Phù bốc cháy lơ lửng trước mặt — nó sẽ thay bạn hứng ' + pct + '% sát thương của đạo sét kế tiếp (phần bị chặn không tính Luyện Thể).' };
  }
  // realms.js gọi trong tribStrikeDamage TRƯỚC khi chốt sát thương của
  // một đạo đứng-trong-vòng: trả { pct, mult } nếu lá đang chờ cháy kỳ
  // này, đồng thời xoá armed + tăng theLoiUsed. Né ra ngoài vòng thì
  // phù KHÔNG cháy (đạo đó vốn chỉ chạm 10%).
  function tribAbsorb(ch, trib, inside) {
    if (!trib || !inside || !trib.theLoiArmed) return null;
    var pct = trib.theLoiArmed;
    trib.theLoiArmed = 0;
    trib.theLoiUsed = (trib.theLoiUsed || 0) + 1;
    return { pct: pct, mult: 1 - pct / 100 };
  }

  // ---------------- Ô DÙNG NHANH (phím B) ----------------
  function setQuick(ch, id) {
    ensureTalisman(ch);
    if (id === null) { ch.talisman.quick = null; return { ok: true }; }
    if (!TALISMANS[id]) return { ok: false, reason: 'bad_id' };
    ch.talisman.quick = id;
    return { ok: true };
  }
  function quickOf(ch) { ensureTalisman(ch); return ch.talisman.quick; }
  function useQuick(ch, ctx) {
    var id = quickOf(ch);
    if (!id) return { ok: false, reason: 'no_quick', msg: 'Chưa gán phù nào vào ô dùng nhanh (phím B). Mở Bàn Phù của Diệp Phù Sinh để gán.' };
    if (itemCount(ch, id) <= 0) return { ok: false, reason: 'no_item', msg: 'Ô dùng nhanh đang gán ' + TALISMANS[id].name + ' nhưng túi đã hết lá đó.' };
    return useTalisman(ch, id, ctx);
  }

  // ---------------- DÙNG PHÙ ----------------
  // ctx: { now, px, py, tile, monsters, mapId, inRealm, inEvent, rng }.
  // Phù công: KHÔNG tự trừ HP quái — trả plan hits[] để game.js áp bằng
  // rawHitMonster (đúng đường floater/chết/thưởng) và applyHitEffects
  // (đóng băng/chậm/dấu phá giáp). Mọi phù khác áp thẳng lên ch.
  // Phù bị chặn ngữ cảnh thì KHÔNG tiêu hao.
  function useTalisman(ch, id, ctx) {
    var L = logicApi();
    var def = TALISMANS[id];
    if (!def || !L) return { ok: false, reason: 'bad_id' };
    ctx = ctx || {};
    var now = typeof ctx.now === 'number' ? ctx.now : Date.now();
    ensureTalisman(ch);
    var fx = def.fx || {};
    if (fx.kind === 'charm') {
      return { ok: false, reason: 'use_capture_ui', talisman: true, msg: 'Bùa Ngự Thú dùng qua nút Thu phục khi đứng gần quái hoang còn dưới 35% máu — không đốt trực tiếp được.' };
    }
    if (itemCount(ch, id) <= 0) return { ok: false, reason: 'no_item', talisman: true, msg: 'Túi không có ' + def.name + ' (' + GRADES[def.grade].name + ').' };
    var inTrib = !!ch.tribulation;

    if (fx.kind === 'trib') { // Thế Lôi Phù: đường riêng (armTheLoi)
      var ar = armTheLoi(ch, ctx.rng);
      ar.talisman = true;
      return ar;
    }
    if (fx.kind === 'break') { // Hộ Đạo Phù: đốt để "vũ trang" cho lần thử kế
      if (ch.talisman.hoDao) return { ok: false, reason: 'already_armed', talisman: true, msg: 'Hộ Đạo Phù đã cháy sẵn chờ lần đột phá kế tiếp — mỗi lần đột phá tối đa 1 lá.' };
      if (!L.consumeItem(ch, id, 1)) return { ok: false, reason: 'no_item', talisman: true };
      ch.talisman.hoDao = true;
      return { ok: true, talisman: true, kind: 'break', msg: 'Hộ Đạo Phù cháy thành một hộ ấn vàng lơ lửng trước ngực: lần đột phá kế tiếp (tầng/tiểu giai) được +' + HO_DAO_BONUS + '% tỉ lệ (tổng hỗ trợ vật phẩm trần ' + ITEM_SUPPORT_CAP + ' điểm %).' };
    }
    if (fx.kind === 'teleport') {
      if (inTrib) return { ok: false, reason: 'in_tribulation', talisman: true, msg: 'Đang giữa lôi kiếp — thiên lôi khóa không gian, Truyền Tống Phù không xé ra được.' };
      if (ctx.inRealm) return { ok: false, reason: 'in_realm', talisman: true, msg: 'Trong bí cảnh linh khí rối loạn — Truyền Tống Phù không dùng được (đúng lời dặn của Thiên Phù Các).' };
      if (ctx.inEvent) return { ok: false, reason: 'in_event', talisman: true, msg: 'Đang giữa sự kiện (thú triều / hộ tống / đại hội) — không truyền tống được.' };
      if (ctx.mapId === 'map1') return { ok: false, reason: 'at_home', talisman: true, msg: 'Bạn đang ở làng Thanh Khê rồi.' };
      if (!L.consumeItem(ch, id, 1)) return { ok: false, reason: 'no_item', talisman: true };
      return { ok: true, talisman: true, kind: 'teleport', teleport: { mapId: 'map1', x: 71, y: 72 }, msg: 'Truyền Tống Phù xé mở một khe sáng — bạn trở về làng Thanh Khê.' }; // V3: đích (19,9) + offset V10 (12,8) + neo V3 (12,30)
    }
    if (fx.kind === 'escape') {
      if (inTrib) return { ok: false, reason: 'in_tribulation', talisman: true, msg: 'Đang giữa lôi kiếp — đất trời đều khóa, Thổ Độn Phù không độn đi đâu được.' };
      if (!L.consumeItem(ch, id, 1)) return { ok: false, reason: 'no_item', talisman: true };
      ch.talFx.stealthUntil = Math.max(ch.talFx.stealthUntil || 0, now + 4000);
      return { ok: true, talisman: true, kind: 'escape', teleport: { sameMap: true }, msg: 'Thổ Độn Phù kéo bạn chìm qua đất về điểm vào map — ẩn tức 4 giây, chạy ngay đi!' };
    }
    if (fx.kind === 'cure' && !fx.immuneSec && !ch.poison) {
      return { ok: false, reason: 'no_poison', talisman: true, msg: 'Người không có độc — đốt ' + def.name + ' bây giờ phí phù.' };
    }
    if (fx.kind === 'atk') {
      var tile = ctx.tile || 32;
      var px = ctx.px || 0, py = ctx.py || 0;
      var monsters = ctx.monsters || [];
      var range = fx.range || 300;
      var target = null, bestD = Infinity;
      monsters.forEach(function (m) {
        if (!m || m.hp <= 0 || m.dying) return;
        var d = Math.sqrt(Math.pow(m.x * tile + tile / 2 - px, 2) + Math.pow(m.y * tile + tile / 2 - py, 2));
        if (d < bestD) { bestD = d; target = m; }
      });
      if (!target || bestD > range) return { ok: false, reason: 'no_target', talisman: true, msg: 'Không có quái nào trong tầm ' + def.name + ' — phù chưa cháy, vẫn còn trong túi.' };
      if (!L.consumeItem(ch, id, 1)) return { ok: false, reason: 'no_item', talisman: true };
      var hits = [];
      function mkHit(m, dmgScale) {
        var h = { m: m, dmg: Math.max(1, Math.round(damageFor(ch, def, ctx.rng) * (dmgScale || 1))) };
        if (fx.freeze) h.freeze = (m.boss || m.worldBoss) ? (fx.freezeBoss || 0) : fx.freeze;
        if (fx.slowDur) h.slow = fx.slowDur;
        if (fx.vulnPct) { h.vulnPct = fx.vulnPct; h.vulnDur = fx.vulnDur || 6; }
        return h;
      }
      if (fx.mode === 'aoe') {
        var cx = target.x * tile + tile / 2, cy = target.y * tile + tile / 2;
        monsters.forEach(function (m) {
          if (!m || m.hp <= 0 || m.dying) return;
          var d = Math.sqrt(Math.pow(m.x * tile + tile / 2 - cx, 2) + Math.pow(m.y * tile + tile / 2 - cy, 2));
          if (d <= (fx.radius || 95)) hits.push(mkHit(m, m === target ? 1 : 0.8));
        });
        if (!hits.length) hits.push(mkHit(target, 1));
      } else {
        hits.push(mkHit(target, 1));
      }
      return { ok: true, talisman: true, kind: 'atk', elem: def.elem, hits: hits,
        fxAt: { x: target.x * tile + tile / 2, y: target.y * tile + tile / 2, radius: fx.radius || 0, mode: fx.mode },
        msg: def.name + ' (' + GRADES[def.grade].name + ') cháy! ' + (hits.length > 1 ? 'Trúng ' + hits.length + ' quái.' : 'Đánh trúng ' + (target.name || 'mục tiêu') + '.') };
    }
    // Các phù tự thân: tiêu hao rồi áp hiệu ứng.
    if (!L.consumeItem(ch, id, 1)) return { ok: false, reason: 'no_item', talisman: true };
    var f = ch.talFx;
    if (fx.kind === 'shield') {
      var SK = skillsApi();
      var maxHp = L.effMaxHp(ch);
      var shieldHp = Math.round(maxHp * fx.shieldPct / 100);
      var cur = (ch.rShield && ch.rShield.until > now) ? ch.rShield.hp : 0;
      ch.rShield = { hp: Math.max(cur, shieldHp), until: now + fx.dur * 1000 };
      return { ok: true, talisman: true, kind: 'shield', shield: ch.rShield.hp, msg: 'Kim Cang Phù dựng khiên chịu thay ' + ch.rShield.hp + ' sát thương trong ' + fx.dur + ' giây.' };
    }
    if (fx.kind === 'dmgred') {
      var curR = f.dmgRed && now < f.dmgRed.until ? f.dmgRed.pct : 0;
      f.dmgRed = { pct: Math.max(curR, fx.pct), until: now + fx.dur * 1000 };
      return { ok: true, talisman: true, kind: 'dmgred', msg: 'Hộ Thân Phù dán lên ngực: giảm ' + f.dmgRed.pct + '% sát thương nhận vào trong ' + fx.dur + ' giây.' };
    }
    if (fx.kind === 'speed') {
      var AL = gget('PNT_ALCHEMY');
      var buffDef = { buffs: [{ stat: 'speed', val: fx.pct }], dur: fx.dur };
      if (AL && typeof AL.applyBuffs === 'function') AL.applyBuffs(ch, buffDef, now);
      else {
        ch.buffs = (ch.buffs || []).filter(function (b) { return b.stat !== 'speed' || b.until <= now; });
        ch.buffs.push({ stat: 'speed', val: fx.pct, until: now + fx.dur * 1000 });
      }
      return { ok: true, talisman: true, kind: 'speed', msg: 'Thần Hành Phù dán sau gót: tốc độ +' + fx.pct + '% trong ' + fx.dur + ' giây.' };
    }
    if (fx.kind === 'hot') {
      f.hot = { hps: fx.hps, until: now + fx.dur * 1000 };
      return { ok: true, talisman: true, kind: 'hot', msg: 'Hồi Xuân Phù tan thành sinh khí: hồi ' + fx.hps + ' Máu/giây trong ' + fx.dur + ' giây.' };
    }
    if (fx.kind === 'mana') {
      var SK2 = skillsApi();
      if (SK2 && typeof SK2.ensureState === 'function') SK2.ensureState(ch);
      var maxLl = SK2 && typeof SK2.maxLinhLuc === 'function' ? SK2.maxLinhLuc(ch) : (ch.ll || 0) + fx.mana;
      ch.ll = Math.min(maxLl, (ch.ll || 0) + fx.mana);
      f.medBoostUntil = now + fx.medDur * 1000;
      f.medMult = fx.medMult;
      return { ok: true, talisman: true, kind: 'mana', msg: 'Tụ Linh Phù tụ khí quanh thân: hồi ' + fx.mana + ' linh lực, thổ nạp +50% tu vi trong ' + Math.round(fx.medDur / 60) + ' phút.' };
    }
    if (fx.kind === 'cure') {
      var hadPoison = !!ch.poison;
      ch.poison = null;
      if (fx.immuneSec) f.poisonImmuneUntil = now + fx.immuneSec * 1000;
      return { ok: true, talisman: true, kind: 'cure', cured: hadPoison, msg: hadPoison ? 'Giải Độc Phù đốt thành khói thuốc — độc trong người tan hết.' + (fx.immuneSec ? ' Khói thuốc giữ miễn nhiễm độc ' + fx.immuneSec + ' giây.' : '') : 'Giải Độc Phù cháy thành khói thuốc quanh thân.' + (fx.immuneSec ? ' Miễn nhiễm độc ' + fx.immuneSec + ' giây.' : '') };
    }
    if (fx.kind === 'stealth') {
      f.stealthUntil = now + fx.dur * 1000;
      return { ok: true, talisman: true, kind: 'stealth', msg: 'Ẩn Tức Phù ép khí tức xuống: quái thường không phát hiện bạn trong ' + fx.dur + ' giây (boss/tinh anh vẫn thấy).' };
    }
    if (fx.kind === 'capture') {
      f.captureUntil = now + fx.dur * 1000;
      f.capturePct = fx.pct;
      return { ok: true, talisman: true, kind: 'capture', msg: 'Trấn Áp Phù nặng khí tức xuống: tỉ lệ thu phục tăng tương đối +' + fx.pct + '% trong ' + fx.dur + ' giây.' };
    }
    return { ok: false, reason: 'bad_kind', talisman: true };
  }
  // game.js áp plan hits[] của phù công: đóng băng/chậm/dấu phá giáp lên
  // quái (HP do game.js trừ qua rawHitMonster để đúng đường thưởng).
  function applyHitEffects(m, h) {
    if (!m || !h) return;
    if (h.freeze) m.freezeT = Math.max(m.freezeT || 0, h.freeze);
    if (h.slow) m.slowT = Math.max(m.slowT || 0, h.slow);
    if (h.vulnPct) { m.markT = Math.max(m.markT || 0, h.vulnDur || 6); m.markPct = Math.max(m.markPct || 0, h.vulnPct); }
  }
  function isTalisman(id) { return !!TALISMANS[id]; }
  function talismanDef(id) { return TALISMANS[id] || null; }

  var api = {
    GRADES: GRADES, GROUPS: GROUPS, ELEM_NAMES: ELEM_NAMES,
    MATERIALS: MATERIALS, MAT_RECIPES: MAT_RECIPES,
    TALISMANS: TALISMANS, SHOP: SHOP, TYPES: TYPES,
    RECIPES: RECIPES, recipeOf: recipeOf, QUEST_RECIPES: QUEST_RECIPES, SCROLLS: SCROLLS,
    ensureTalisman: ensureTalisman, hasLearned: hasLearned, learnedList: learnedList, teachRecipe: teachRecipe,
    teachBasics: teachBasics, basicsMissing: basicsMissing, afterTurnIn: afterTurnIn, syncSectRecipes: syncSectRecipes,
    useRecipeScroll: useRecipeScroll,
    effMats: effMats, effFee: effFee, successRate: successRate, canCraft: canCraft, craft: craft,
    canCraftMat: canCraftMat, craftMat: craftMat, buyItem: buyItem,
    damageFor: damageFor, damageCap: damageCap,
    dmgRedPct: dmgRedPct, stealthActive: stealthActive, breakStealthOnHit: breakStealthOnHit,
    poisonImmune: poisonImmune, captureBonusPct: captureBonusPct, medMult: medMult, tickHot: tickHot,
    HO_DAO_BONUS: HO_DAO_BONUS, ITEM_SUPPORT_CAP: ITEM_SUPPORT_CAP,
    hoDaoArmed: hoDaoArmed, hoDaoBonus: hoDaoBonus, consumeHoDao: consumeHoDao,
    THE_LOI_MAX_PER_TRIB: THE_LOI_MAX_PER_TRIB, armTheLoi: armTheLoi, tribAbsorb: tribAbsorb,
    setQuick: setQuick, quickOf: quickOf, useQuick: useQuick,
    useTalisman: useTalisman, applyHitEffects: applyHitEffects,
    isTalisman: isTalisman, talismanDef: talismanDef, itemCount: itemCount
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_TALISMANS = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_TALISMANS = api;
})();

