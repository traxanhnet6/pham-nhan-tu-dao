// Phàm Nhân Tu Đạo — HỆ LUYỆN ĐAN (js/alchemy.js, lệnh Bui 20:50 2026-10-29):
// linh dược theo vùng + đan dược đủ nhóm tác dụng + đan phương học theo
// tiến trình + luyện đan tại Đan Lô của Lý lão.
//
// TIỀN TỆ (lệnh Bui 21:04 2026-10-29): mọi chi phí trong hệ này tính bằng
// LINH THẠCH — trường số `fee` trừ thẳng vào ch.linhThach (kho tiền duy
// nhất của nhân vật, khớp đổi tên của team tiền tệ trong logic.js), thang
// số giữ nguyên như thang giá cũ của game. Mọi chuỗi hiển thị đều ghi
// "Linh Thạch", không dùng đơn vị cũ.
//
// HỢP ĐỒNG ĐỘT PHÁ (với team tu hành, đã có sẵn trong js/logic.js): đan
// hỗ trợ đột phá KHÔNG ăn trực tiếp. Định nghĩa của nó nằm trong ITEMS của
// logic.js với pillCat: 'dot_pha', pillBand: 'so'|'trung'|'cao' và
// breakthroughBonus: <điểm % cộng tỉ lệ>. Engine đột phá (breakPillDef /
// bestBreakPill / doBreakthrough) tự quét túi đồ, chọn viên yếu nhất vẫn
// đạt pillMin của tầng đích (tầng 4-5 cần 10, tầng 6-7 cần 15, tầng 8 cần
// 20, tầng 9 cần 25), cộng bonus và TIÊU HAO 1 viên mỗi lần thử. Ba viên
// theo hợp đồng đã có sẵn trong ITEMS: tu_khi_dan (+10, 'so'),
// ngung_khi_dan (+20, 'trung'), pha_canh_dan (+30, 'cao') — module này
// chỉ thêm ĐAN PHƯƠNG để luyện ra chúng + metadata phẩm/hiển thị, không
// định nghĩa lại breakthroughBonus ở đây.
//
// HỢP ĐỒNG BUFF TẠM THỜI: đan buff ghi vào ch.buffs = [{ stat, val, until }]
// với stat thuộc 'atkPct' | 'def' | 'speed', until là mốc ms hết hạn.
// logic.js tự đọc mảng này (statTotals cộng def/speed sau trần trang bị,
// effAtk nhân atkPct) — buff cùng stat ăn sau GHI ĐÈ buff cũ, không cộng
// dồn. Độc rắn lục: ch.poison = { until, dps } do combatRound đặt khi bị
// Rắn Lục cắn trúng; game.js trừ HP theo giây (sàn 1 HP, độc không giết);
// Giải Độc Đan / Sinh Cơ Đan xoá ch.poison.
//
// HỌC ĐAN PHƯƠNG: trạng thái lưu ở ch.alchemy = { learned: [pillId...] }
// (tự khởi tạo lười, save cũ nạp được, serialize của logic gói nguyên
// nhân vật nên tự được lưu). Đường học:
//   - Lý lão dạy 2 phương cơ bản (teachBasics, mở từ panel Đan Lô).
//   - Chuỗi nhiệm vụ đan phương q_dan_1..q_dan_4 (afterTurnIn).
//   - Đan Hà Cốc: trả q_tong_dan -> 2 phương; bái nhập Đan Hà -> 3 phương
//     (syncSectRecipes, game.js gọi mỗi lần mở panel + sau trả nhiệm vụ).
//   - Phương Thiên phẩm để nguồn 'bi_canh': team bí cảnh gọi
//     PNT_ALCHEMY.teachRecipe(ch, pillId) khi trao thưởng là cắm xong.
// Đan Đỉnh Ngọc (pháp bảo Địa phẩm của js/artifacts.js, fx healPct +50):
// đan hồi máu nhân (1 + healPct/100) đúng như logic.useItem, và tỉ lệ
// luyện đan +10 điểm % khi đang ĐEO nó (đỉnh tốt giữ lửa đều).
(function () {
  'use strict';

  // Thang phẩm dùng chung toàn game (khớp js/weapons.js + js/artifacts.js).
  var GRADES = {
    pham: { name: 'Phàm phẩm', rank: 0, color: '#b8b0a0' },
    linh: { name: 'Linh phẩm', rank: 1, color: '#7fe8d6' },
    huyen: { name: 'Huyền phẩm', rank: 2, color: '#cf9fff' },
    dia: { name: 'Địa phẩm', rank: 3, color: '#ffb84e' },
    thien: { name: 'Thiên phẩm', rank: 4, color: '#ffe9a8' }
  };

  function logicApi() {
    if (typeof window !== 'undefined' && window.PNT_LOGIC) return window.PNT_LOGIC;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_LOGIC) return globalThis.PNT_LOGIC;
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
  function itemCount(ch, id) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === id) n += it.count; });
    return n;
  }

  // ---------------- LINH DƯỢC (nguyên liệu hái được) ----------------
  // respawnMs: thời gian mọc lại sau khi hái (game.js dùng thay cho mức
  // cứng 30 giây cũ; dược không có trong bảng này giữ mặc định 30000).
  // zones: các zone (theo js/maps.js) mà điểm hái của dược này thuộc về —
  // SPOTS bên dưới là toạ độ thật, test kiểm chứng từng điểm.
  var HERBS = {
    thao_duoc: { id: 'thao_duoc', name: 'Thảo Dược', grade: 'pham', respawnMs: 30000,
      rarity: 'Phổ biến', areas: 'Bãi hoang quanh làng, ven đường mọi vùng',
      zones: [{ map: 'map1', zone: null }, { map: 'map2', zone: null }, { map: 'map4', zone: null }],
      desc: 'Cỏ thuốc lá xanh đậm rễ ngắn, cầm máu nhanh. Mọc khắp bãi hoang quanh làng Thanh Khê.' },
    thanh_tam_thao: { id: 'thanh_tam_thao', name: 'Thanh Tâm Thảo', grade: 'pham', respawnMs: 45000,
      rarity: 'Thường', areas: 'Bãi cỏ ngoại ô làng, bụi rậm ven suối rừng',
      zones: [{ map: 'map1', zone: 'ga_tho' }, { map: 'map1', zone: 'lon_rung' }, { map: 'map1', zone: 'soi_con' },
              { map: 'map2', zone: 'ran_luc' }, { map: 'map4', zone: 'lon_rung_dai_son' }, { map: 'map4', zone: null }],
      desc: 'Cỏ thơm hoa trắng nhỏ, ngửi vào tĩnh tâm hạ sốt. Tiểu Hạnh vẫn hái về sắc thuốc cho người làng bị cảm sốt.' },
    linh_chi: { id: 'linh_chi', name: 'Linh Chi', grade: 'linh', respawnMs: 90000,
      rarity: 'Khá hiếm', areas: 'Gần suối linh trong rừng, bãi đá chân núi, rừng già Đại Sơn',
      zones: [{ map: 'map2', zone: null }, { map: 'map3', zone: null }, { map: 'map4', zone: null }],
      desc: 'Nấm linh chi tai ánh xanh, hút linh khí suối linh mà lớn. Nguyên liệu chính của các đan phương bậc trung.' },
    huyet_sam: { id: 'huyet_sam', name: 'Huyết Sâm', grade: 'linh', respawnMs: 150000,
      rarity: 'Hiếm', areas: 'Đất mùn quanh sào huyệt Sơn Quân, bìa rừng sâu Đại Sơn',
      zones: [{ map: 'map2', zone: 'son_quan' }, { map: 'map2', zone: 'soi_rung' },
              { map: 'map4', zone: 'soi_vach_da' }, { map: 'map4', zone: 'lon_mong_sat_dai_son' },
              { map: 'map6', zone: 'soi_rung_tham_xu' }],
      desc: 'Củ sâm đỏ thẫm như thấm máu thú, mọc nơi đất rừng lâu năm cạnh sào huyệt yêu thú. Đại bổ khí huyết.' },
    tu_linh_qua: { id: 'tu_linh_qua', name: 'Tụ Linh Quả', grade: 'linh', respawnMs: 120000,
      rarity: 'Khá hiếm', areas: 'Tán cây bãi luyện công chân núi, rừng cổ thụ Đại Sơn (khỉ mặt đỏ cũng hay tha về tổ)',
      zones: [{ map: 'map3', zone: 'khi_mat_do' }, { map: 'map4', zone: 'khi_co_thu' }, { map: 'map4', zone: 'khi_rung_gia' },
              { map: 'map7', zone: 'khi_dinh_may' }],
      desc: 'Quả cam nhỏ vỏ ánh linh quang, tụ linh khí trời đất trong thịt quả. Khỉ mặt đỏ tranh nhau thứ này.' },
    doc_tam_hoa: { id: 'doc_tam_hoa', name: 'Độc Tâm Hoa', grade: 'huyen', respawnMs: 120000,
      rarity: 'Hiếm', areas: 'Bờ suối ổ rắn lục, khe suối và phế tích cổ Đại Sơn',
      zones: [{ map: 'map2', zone: 'ran_luc' }, { map: 'map4', zone: 'ran_khe_suoi' }, { map: 'map4', zone: 'ran_phe_tich' },
              { map: 'map5', zone: 'ran_phe_tich_trung_phuc' }],
      desc: 'Hoa tím nhụy đỏ mọc nơi rắn lục làm ổ, cánh hoa chứa độc nhẹ. Lấy độc trị độc — dược tính mạnh, hái phải cẩn thận.' },
    ngoc_tuy_chi: { id: 'ngoc_tuy_chi', name: 'Ngọc Tủy Chi', grade: 'huyen', respawnMs: 240000,
      rarity: 'Rất hiếm', areas: 'Kẽ đá bãi luyện công hứng sương núi, gốc cây phía đông rừng',
      zones: [{ map: 'map2', zone: 'khi_mat_do' }, { map: 'map3', zone: 'khi_mat_do' }],
      desc: 'Nấm trắng trong như ngọc, tủy nấm là tinh tuý linh khí đọng qua nhiều năm sương núi. Một tai đáng giá cả rổ thảo dược.' },
    son_tinh: { id: 'son_tinh', name: 'Sơn Tinh', grade: 'dia', respawnMs: 300000,
      rarity: 'Cực hiếm', areas: 'Thềm Bia Thanh Phong, cửa hang yêu vương ở Thập Vạn Đại Sơn',
      zones: [{ map: 'map3', zone: 'soi_rung' }, { map: 'map4', zone: null }],
      desc: 'Củ rễ hình người, là tinh hoa của cả dãy núi kết lại. Tương truyền mọc đủ trăm năm mới thành hình.' },
    thanh_linh_tuy: { id: 'thanh_linh_tuy', name: 'Thanh Linh Tủy', grade: 'dia', respawnMs: 300000,
      rarity: 'Cực hiếm', areas: 'Ao Phát Sáng cạnh sào huyệt Sơn Quân, phế tích và khe suối Đại Sơn (Sơn Quân cũng có giữ trong ổ)',
      zones: [{ map: 'map2', zone: 'son_quan' }, { map: 'map4', zone: 'ran_khe_suoi' }, { map: 'map4', zone: null }],
      desc: 'Giọt tủy linh khí trong suốt đọng trong kẽ đá cạnh ao linh, mát lạnh thấu xương. Nguyên liệu đan cao cấp.' },
    // ---- 7 dược cấp cao (vòng tích hợp, mục 3 hàng chờ, 2026-10-30) ----
    // Trước đây chỉ có trong Logic.ITEMS + cụm dược của maps.js (map 8–14)
    // mà chưa đăng ký ở đây, nên panel dược không biết phẩm/mọc lại và
    // game.js tính mọc lại mặc định 30 giây cho dược cực hiếm — nay đăng
    // ký đủ phẩm + thời gian mọc lại + vùng mọc theo đúng cụm map 8–14.
    // Dược cấp cao KHÔNG đặt SPOTS ở map 5–7 (giữ tiến trình cảnh giới:
    // dược Trúc Cơ trở lên chỉ mọc ở chặng của nó); SPOTS map 5–7 bên
    // dưới dùng dược tầm trung vốn đã mọc ở Đại Sơn sâu.
    long_tien_thao: { id: 'long_tien_thao', name: 'Long Tiên Thảo', grade: 'linh', respawnMs: 180000,
      rarity: 'Hiếm', areas: 'Sơn Trung Vân Hải, Đoạn Long Lĩnh',
      zones: [{ map: 'map8', zone: 'soi_van_hai' }, { map: 'map8', zone: 'khi_co_thu_cao' },
              { map: 'map8', zone: 'lon_van_hai' }, { map: 'map8', zone: 'ran_khe_may' },
              { map: 'map9', zone: 'soi_doan_long' }, { map: 'map9', zone: 'lon_linh' }],
      desc: 'Cỏ tiên lá dài ánh bạc mọc ở Sơn Trung Vân Hải sâu trong Thập Vạn Đại Sơn, thấm linh khí biển mây. Nguyên liệu luyện đan cho tu sĩ Trúc Cơ.' },
    van_nien_linh_chi: { id: 'van_nien_linh_chi', name: 'Vạn Niên Linh Chi', grade: 'huyen', respawnMs: 240000,
      rarity: 'Rất hiếm', areas: 'Đoạn Long Lĩnh, Độ Kiếp Đài',
      zones: [{ map: 'map9', zone: 'ran_lung_rong' }, { map: 'map9', zone: 'lon_linh' },
              { map: 'map14', zone: 'lon_thien_dai' }, { map: 'map14', zone: 'ran_thien_dai' }],
      desc: 'Linh chi sống ngàn năm trên Đoạn Long Lĩnh, tai nấm tím sẫm viền vàng. Nguyên liệu luyện đan cao cấp.' },
    hoa_diem_lien: { id: 'hoa_diem_lien', name: 'Hỏa Diệm Liên', grade: 'huyen', respawnMs: 240000,
      rarity: 'Rất hiếm', areas: 'Xích Diệm Hoang Nguyên',
      zones: [{ map: 'map10', zone: null }],
      desc: 'Sen lửa nở giữa hoang nguyên dung nham Xích Diệm, cánh đỏ rực mà không cháy. Nguyên liệu luyện đan hệ Hỏa.' },
    bang_tinh_hoa: { id: 'bang_tinh_hoa', name: 'Băng Tinh Hoa', grade: 'huyen', respawnMs: 240000,
      rarity: 'Rất hiếm', areas: 'Hàn Băng Cốc',
      zones: [{ map: 'map11', zone: null }],
      desc: 'Hoa băng nở ven hồ đóng băng ở Hàn Băng Cốc, cánh trong như thủy tinh. Nguyên liệu luyện đan hệ Băng.' },
    thien_loi_qua: { id: 'thien_loi_qua', name: 'Thiên Lôi Quả', grade: 'dia', respawnMs: 300000,
      rarity: 'Cực hiếm', areas: 'Lôi Trì Thiên Khanh',
      zones: [{ map: 'map12', zone: null }],
      desc: 'Quả tím đọng điện quang ở Lôi Trì Thiên Khanh, vỏ quả thi thoảng tóe tia sét nhỏ. Nguyên liệu luyện đan cao cấp.' },
    tinh_van_thach: { id: 'tinh_van_thach', name: 'Tinh Vẫn Thạch', grade: 'dia', respawnMs: 300000,
      rarity: 'Cực hiếm', areas: 'Tinh Vẫn Chi Địa',
      zones: [{ map: 'map13', zone: null }],
      desc: 'Mảnh đá sao rơi ở Tinh Vẫn Chi Địa, nặng và lạnh, lõi đá ánh sao. Khoáng linh dùng luyện khí và luyện đan.' },
    thien_lien: { id: 'thien_lien', name: 'Thiên Liên', grade: 'thien', respawnMs: 600000,
      rarity: 'Thiên phẩm hiếm có', areas: 'Độ Kiếp Đài',
      zones: [{ map: 'map14', zone: null }],
      desc: 'Sen trời nở trên Độ Kiếp Đài ở đỉnh Thập Vạn Đại Sơn, tương truyền chỉ nở khi có người sắp độ kiếp. Nguyên liệu luyện đan Thiên phẩm.' },
    // ---- Lúa Linh (mục 21 hàng chờ, kỳ ngộ NV06): dược "trồng mới có"
    // — KHÔNG mọc hoang, KHÔNG có điểm hái SPOTS, chỉ thu từ linh điền
    // động phủ khi gieo Hạt Lúa Linh. Đăng ký ở đây vì test DP bắt mọi
    // hạt giống trong DP.SEEDS phải trỏ tới một dược có thật, và test
    // HICON bắt mọi hạt phải có icon + phẩm từ dược gốc. Phẩm Linh
    // (ngang Linh Chi), thời gian mọc lại chỉ dùng khi tính mọc lại
    // của ô điền theo luật chung (không áp cho hái hoang vì không có
    // SPOTS nào mang lúa linh).
    lua_linh: { id: 'lua_linh', name: 'Lúa Linh', grade: 'linh', respawnMs: 120000,
      rarity: 'Chỉ từ kỳ ngộ', areas: 'Linh điền động phủ (gieo từ Hạt Lúa Linh, không mọc hoang)',
      zones: [],
      desc: 'Bông lúa linh thu từ linh điền động phủ — hạt lúa cũ của bà nảy mầm trong linh khí sau cơn mưa linh. Lương thực linh, để dành cho Thiên 6 khi đường buôn bị cắt.' }
  };

  // Điểm hái BỔ SUNG (ngoài herbs có sẵn trong js/maps.js) — game.js cộng
  // vào danh sách điểm dược khi nạp map. Mọi toạ độ đã kiểm chứng: ô đi
  // được (không blocked) và thuộc đúng zone khai trong HERBS.zones.
  var SPOTS = [
    { map: 'map1', x: 70, y: 59, item: 'thanh_tam_thao', zone: 'ga_tho' },
    { map: 'map1', x: 67, y: 71, item: 'thanh_tam_thao', zone: 'lon_rung' },
    { map: 'map1', x: 48, y: 69, item: 'thanh_tam_thao', zone: 'soi_con' },
    { map: 'map2', x: 74, y: 33, item: 'thanh_tam_thao', zone: 'ran_luc' },
    { map: 'map2', x: 88, y: 38, item: 'thanh_tam_thao', zone: 'ran_luc' },
    { map: 'map4', x: 67, y: 43, item: 'thanh_tam_thao', zone: null },
    { map: 'map4', x: 20, y: 48, item: 'thanh_tam_thao', zone: 'lon_rung_dai_son' },
    { map: 'map2', x: 64, y: 54, item: 'huyet_sam', zone: 'son_quan' },
    { map: 'map2', x: 76, y: 54, item: 'huyet_sam', zone: 'son_quan' },
    { map: 'map2', x: 70, y: 35, item: 'huyet_sam', zone: 'soi_rung' },
    { map: 'map4', x: 78, y: 20, item: 'huyet_sam', zone: 'soi_vach_da' },
    { map: 'map4', x: 24, y: 36, item: 'huyet_sam', zone: 'lon_mong_sat_dai_son' },
    { map: 'map3', x: 46, y: 30, item: 'tu_linh_qua', zone: 'khi_mat_do' },
    { map: 'map3', x: 56, y: 28, item: 'tu_linh_qua', zone: 'khi_mat_do' },
    { map: 'map4', x: 48, y: 28, item: 'tu_linh_qua', zone: 'khi_co_thu' },
    { map: 'map4', x: 25, y: 23, item: 'tu_linh_qua', zone: 'khi_rung_gia' },
    { map: 'map4', x: 31, y: 27, item: 'tu_linh_qua', zone: 'khi_rung_gia' },
    { map: 'map2', x: 89, y: 45, item: 'doc_tam_hoa', zone: 'ran_luc' },
    { map: 'map2', x: 77, y: 42, item: 'doc_tam_hoa', zone: 'ran_luc' },
    { map: 'map4', x: 70, y: 23, item: 'doc_tam_hoa', zone: 'ran_khe_suoi' },
    { map: 'map4', x: 62, y: 46, item: 'doc_tam_hoa', zone: 'ran_khe_suoi' },
    { map: 'map4', x: 41, y: 16, item: 'doc_tam_hoa', zone: 'ran_phe_tich' },
    { map: 'map4', x: 37, y: 14, item: 'doc_tam_hoa', zone: 'ran_phe_tich' },
    { map: 'map4', x: 54, y: 16, item: 'doc_tam_hoa', zone: 'ran_phe_tich' },
    { map: 'map2', x: 95, y: 27, item: 'ngoc_tuy_chi', zone: 'khi_mat_do' },
    { map: 'map3', x: 52, y: 28, item: 'ngoc_tuy_chi', zone: 'khi_mat_do' },
    { map: 'map3', x: 48, y: 26, item: 'ngoc_tuy_chi', zone: 'khi_mat_do' },
    { map: 'map3', x: 25, y: 38, item: 'son_tinh', zone: 'soi_rung' },
    { map: 'map3', x: 26, y: 37, item: 'son_tinh', zone: 'soi_rung' },
    { map: 'map4', x: 19, y: 13, item: 'son_tinh', zone: null },
    { map: 'map4', x: 77, y: 13, item: 'son_tinh', zone: null },
    { map: 'map4', x: 22, y: 12, item: 'son_tinh', zone: null },
    { map: 'map2', x: 70, y: 53, item: 'thanh_linh_tuy', zone: 'son_quan' },
    { map: 'map2', x: 76, y: 55, item: 'thanh_linh_tuy', zone: 'son_quan' },
    { map: 'map4', x: 48, y: 12, item: 'thanh_linh_tuy', zone: null },
    { map: 'map4', x: 52, y: 36, item: 'thanh_linh_tuy', zone: 'ran_khe_suoi' },
    // Điểm hái bổ sung map 5–7 (vòng tích hợp, mục 3 hàng chờ, 2026-10-30):
    // dược tầm trung vốn đã mọc ở Đại Sơn sâu, mỗi điểm đã kiểm ô đi
    // được + đúng zone khai trong HERBS.zones (xem test mục IT).
    { map: 'map5', x: 28, y: 16, item: 'doc_tam_hoa', zone: 'ran_phe_tich_trung_phuc' },
    { map: 'map5', x: 30, y: 16, item: 'doc_tam_hoa', zone: 'ran_phe_tich_trung_phuc' },
    { map: 'map6', x: 15, y: 13, item: 'huyet_sam', zone: 'soi_rung_tham_xu' },
    { map: 'map6', x: 17, y: 13, item: 'huyet_sam', zone: 'soi_rung_tham_xu' },
    { map: 'map7', x: 18, y: 24, item: 'tu_linh_qua', zone: 'khi_dinh_may' },
    { map: 'map7', x: 20, y: 24, item: 'tu_linh_qua', zone: 'khi_dinh_may' }
  ];
  function spotsFor(mapId) { return SPOTS.filter(function (s) { return s.map === mapId; }); }
  function herbDef(itemId) { return HERBS[itemId] || null; }
  function respawnMs(itemId) { var h = HERBS[itemId]; return h ? h.respawnMs : 30000; }

  // ---------------- ĐAN DƯỢC (thành phẩm) ----------------
  // kind: heal | mana | tuvi | buff | cure | break.
  // Đan 'break' không ăn trực tiếp: số breakthroughBonus nằm ở ITEMS của
  // logic.js theo hợp đồng đột phá (xem đầu file) — ở đây chỉ giữ phẩm +
  // câu mô tả hiệu lực để panel hiển thị.
  var PILLS = {
    hoi_khi_tan: { id: 'hoi_khi_tan', name: 'Hồi Khí Tán', grade: 'pham', kind: 'heal', heal: 30,
      fxText: 'Hồi 30 Máu', desc: 'Bột thuốc cầm máu hồi sức của nhà thuốc họ Lý, đi đường xa không thể thiếu.' },
    linh_khi_tan: { id: 'linh_khi_tan', name: 'Linh Khí Tán', grade: 'pham', kind: 'mana', mana: 20,
      fxText: 'Hồi 20 linh lực', desc: 'Bột tán từ Thanh Tâm Thảo, giúp linh lực đang cạn hồi lại một mạch.' },
    hoi_xuan_dan: { id: 'hoi_xuan_dan', name: 'Hồi Xuân Đan', grade: 'linh', kind: 'heal', heal: 70,
      fxText: 'Hồi 70 Máu', desc: 'Viên đan xanh ngọc từ linh chi và thảo dược. Vết thương khép lại thấy rõ bằng mắt.' },
    tu_linh_dan: { id: 'tu_linh_dan', name: 'Tụ Linh Đan', grade: 'linh', kind: 'mana', mana: 45,
      fxText: 'Hồi 45 linh lực', desc: 'Đan luyện từ Tụ Linh Quả, linh khí trong đan tự tìm về đan điền.' },
    tieu_boi_nguyen_dan: { id: 'tieu_boi_nguyen_dan', name: 'Tiểu Bồi Nguyên Đan', grade: 'linh', kind: 'tuvi', tuvi: 25,
      fxText: '+25 tu vi', desc: 'Đan bồi nguyên khí cho người mới tu, dược lực êm, tích được một đoạn tu vi thật.' },
    giai_doc_dan: { id: 'giai_doc_dan', name: 'Giải Độc Đan', grade: 'linh', kind: 'cure',
      fxText: 'Giải mọi độc đang mang', desc: 'Đan giải độc trứ danh của Lý lão — cứu không biết bao nhiêu người bị rắn lục cắn trong rừng.' },
    tu_khi_dan: { id: 'tu_khi_dan', name: 'Tụ Khí Đan', grade: 'pham', kind: 'break',
      fxText: 'Đột phá +10% (tự dùng khi đột phá)', desc: 'Đan hỗ trợ đột phá sơ cấp theo phương của Lý lão. Engine đột phá tự dùng 1 viên mỗi lần thử.' },
    dai_hoi_xuan_dan: { id: 'dai_hoi_xuan_dan', name: 'Đại Hồi Xuân Đan', grade: 'huyen', kind: 'heal', heal: 140,
      fxText: 'Hồi 140 Máu', desc: 'Bản lớn của Hồi Xuân Đan theo phương Đan Hà Cốc, dược lực gấp đôi, vết thương nặng cũng kéo lại được.' },
    cuong_the_dan: { id: 'cuong_the_dan', name: 'Cường Thể Đan', grade: 'huyen', kind: 'buff', dur: 300,
      buffs: [{ stat: 'def', val: 4, label: 'Giáp +4' }], fxText: 'Giáp +4 trong 5 phút',
      desc: 'Đan từ Huyết Sâm làm gân cốt cứng như ngâm thuốc cả tháng. Dân làng gánh núi trước khi vào rừng sâu hay xin một viên.' },
    than_hanh_dan: { id: 'than_hanh_dan', name: 'Thần Hành Đan', grade: 'huyen', kind: 'buff', dur: 240,
      buffs: [{ stat: 'speed', val: 15, label: 'Tốc độ +15%' }], fxText: 'Tốc độ +15% trong 4 phút',
      desc: 'Đan nhẹ thân từ Tụ Linh Quả — ăn vào chân nhẹ như có gió đỡ, chạy trốn hay đuổi theo thú đều lợi.' },
    ngung_khi_dan: { id: 'ngung_khi_dan', name: 'Ngưng Khí Đan', grade: 'huyen', kind: 'break',
      fxText: 'Đột phá +20% (tự dùng khi đột phá)', desc: 'Đan hỗ trợ đột phá trung cấp, ngưng tụ linh khí quanh đan điền lúc xung quan. Engine đột phá tự dùng 1 viên mỗi lần thử.' },
    sinh_co_dan: { id: 'sinh_co_dan', name: 'Sinh Cơ Đan', grade: 'dia', kind: 'heal', heal: 260, cure: true,
      fxText: 'Hồi 260 Máu + giải độc', desc: 'Đan sinh cơ của Đan Hà Cốc: thịt nát xương gãy cũng liền lại, độc trong người bị đẩy ra theo mồ hôi.' },
    dai_boi_nguyen_dan: { id: 'dai_boi_nguyen_dan', name: 'Đại Bồi Nguyên Đan', grade: 'dia', kind: 'tuvi', tuvi: 80,
      fxText: '+80 tu vi', desc: 'Đan bồi nguyên bậc cao luyện từ Ngọc Tủy Chi và Thanh Linh Tủy. Một viên bằng nhiều ngày thổ nạp.' },
    chien_y_dan: { id: 'chien_y_dan', name: 'Chiến Ý Đan', grade: 'dia', kind: 'buff', dur: 300,
      buffs: [{ stat: 'atkPct', val: 20, label: 'Công +20%' }], fxText: 'Công +20% trong 5 phút',
      desc: 'Đan lấy độc trị thân của Đan Hà Cốc: ăn vào huyết khí sôi lên, đòn đánh nặng hẳn. Chỉ dành cho trận đánh khó.' },
    pha_canh_dan: { id: 'pha_canh_dan', name: 'Phá Cảnh Đan', grade: 'dia', kind: 'break',
      fxText: 'Đột phá +30% (tự dùng khi đột phá)', desc: 'Đan hỗ trợ đột phá cao cấp nhất vùng Thanh Sơn, dành cho cửa ải tầng cao. Engine đột phá tự dùng 1 viên mỗi lần thử.' },
    truc_co_dan: { id: 'truc_co_dan', name: 'Trúc Cơ Đan', grade: 'dia', kind: 'break',
      fxText: 'Đan dẫn kiếp Trúc Cơ (tự dùng khi dẫn động lôi kiếp)', desc: 'Đan vượt cảnh giới luyện từ Yêu Đan Cấp 3 — lõi đan gánh thay một phần thiên uy lúc lôi kiếp giáng xuống. Không ăn trực tiếp: khi đột phá Luyện Khí tầng 9 lên Trúc Cơ, lò tu hành tự dùng 1 viên để dẫn động lôi kiếp, mất cả khi độ kiếp thất bại.' },
    cuu_chuyen_hoi_hon_dan: { id: 'cuu_chuyen_hoi_hon_dan', name: 'Cửu Chuyển Hồi Hồn Đan', grade: 'thien', kind: 'heal', healPctMax: 100,
      fxText: 'Hồi đầy 100% Máu', desc: 'Đan Thiên phẩm tương truyền luyện chín lần mới thành. Người sắp tắt thở ăn vào cũng mở mắt ngồi dậy.' }
  };
  function isPill(id) { return !!PILLS[id]; }
  function pillDef(id) { return PILLS[id] || null; }

  // ---------------- ĐAN PHƯƠNG (công thức) ----------------
  // fee: Linh Thạch trả cho Lý lão mỗi mẻ luyện (lò + công trông lửa).
  // baseRate: tỉ lệ thành công gốc (%); tỉ lệ thật = baseRate + 6*tầng
  // + 10 nếu đang đeo Đan Đỉnh Ngọc, trần 95.
  // source: 'ly_lao' | 'quest:<qid>' | 'dan_ha' | 'dan_ha_join' | 'bi_canh'.
  var RECIPES = {
    hoi_khi_tan: { pill: 'hoi_khi_tan', mats: { thao_duoc: 2 }, fee: 5, baseRate: 90, source: 'ly_lao',
      sourceText: 'Lý lão dạy khi mở Đan Lô lần đầu' },
    linh_khi_tan: { pill: 'linh_khi_tan', mats: { thanh_tam_thao: 2 }, fee: 5, baseRate: 88, source: 'ly_lao',
      sourceText: 'Lý lão dạy khi mở Đan Lô lần đầu' },
    hoi_xuan_dan: { pill: 'hoi_xuan_dan', mats: { thao_duoc: 2, linh_chi: 1 }, fee: 15, baseRate: 80, source: 'quest:q_dan_1',
      sourceText: 'Thưởng nhiệm vụ "Mẻ đan đầu tay" (Tiểu Hạnh)' },
    tu_linh_dan: { pill: 'tu_linh_dan', mats: { thanh_tam_thao: 2, tu_linh_qua: 1 }, fee: 15, baseRate: 78, source: 'quest:q_dan_1',
      sourceText: 'Thưởng nhiệm vụ "Mẻ đan đầu tay" (Tiểu Hạnh)' },
    tu_khi_dan: { pill: 'tu_khi_dan', mats: { linh_chi: 1, thao_duoc: 2 }, fee: 20, baseRate: 75, source: 'quest:q_dan_1',
      sourceText: 'Thưởng nhiệm vụ "Mẻ đan đầu tay" (Tiểu Hạnh)' },
    giai_doc_dan: { pill: 'giai_doc_dan', mats: { thanh_tam_thao: 2, thao_duoc: 1 }, fee: 12, baseRate: 82, source: 'quest:q_dan_2',
      sourceText: 'Thưởng nhiệm vụ "Thuốc cho người sốt" (Tiểu Hạnh)' },
    cuong_the_dan: { pill: 'cuong_the_dan', mats: { huyet_sam: 1, thao_duoc: 2 }, fee: 20, baseRate: 75, source: 'quest:q_dan_2',
      sourceText: 'Thưởng nhiệm vụ "Thuốc cho người sốt" (Tiểu Hạnh)' },
    tieu_boi_nguyen_dan: { pill: 'tieu_boi_nguyen_dan', mats: { linh_chi: 1, thanh_tam_thao: 1 }, fee: 18, baseRate: 76, source: 'quest:q_dan_2',
      sourceText: 'Thưởng nhiệm vụ "Thuốc cho người sốt" (Tiểu Hạnh)' },
    ngung_khi_dan: { pill: 'ngung_khi_dan', mats: { linh_chi: 2, huyet_sam: 1 }, fee: 40, baseRate: 70, source: 'quest:q_dan_3',
      sourceText: 'Thưởng nhiệm vụ "Đan khó hẹn giờ" (Lý lão)' },
    than_hanh_dan: { pill: 'than_hanh_dan', mats: { tu_linh_qua: 2, thanh_tam_thao: 1 }, fee: 25, baseRate: 74, source: 'quest:q_dan_4',
      sourceText: 'Thưởng nhiệm vụ "Lò đan của Đan Hà" (Tiểu Hạnh)' },
    dai_hoi_xuan_dan: { pill: 'dai_hoi_xuan_dan', mats: { linh_chi: 2, huyet_sam: 1, thao_duoc: 2 }, fee: 35, baseRate: 72, source: 'dan_ha',
      sourceText: 'Đan Hà Cốc truyền sau phép thử "Linh chi thử đan"' },
    dai_boi_nguyen_dan: { pill: 'dai_boi_nguyen_dan', mats: { ngoc_tuy_chi: 1, linh_chi: 1, thanh_linh_tuy: 1 }, fee: 45, baseRate: 68, source: 'dan_ha',
      sourceText: 'Đan Hà Cốc truyền sau phép thử "Linh chi thử đan"' },
    sinh_co_dan: { pill: 'sinh_co_dan', mats: { huyet_sam: 2, ngoc_tuy_chi: 1 }, fee: 50, baseRate: 66, source: 'dan_ha_join',
      sourceText: 'Truyền cho đệ tử Đan Hà Cốc sau lễ bái sư' },
    chien_y_dan: { pill: 'chien_y_dan', mats: { doc_tam_hoa: 1, huyet_sam: 1, linh_chi: 1 }, fee: 50, baseRate: 66, source: 'dan_ha_join',
      sourceText: 'Truyền cho đệ tử Đan Hà Cốc sau lễ bái sư' },
    pha_canh_dan: { pill: 'pha_canh_dan', mats: { ngoc_tuy_chi: 2, thanh_linh_tuy: 1 }, fee: 90, baseRate: 58, source: 'dan_ha_join',
      sourceText: 'Truyền cho đệ tử Đan Hà Cốc sau lễ bái sư' },
    // Trúc Cơ Đan (lệnh Bui 22:00): LÕI là Yêu Đan Cấp 3 (rơi từ 3 vương
    // thú Đại Sơn), Yêu Đan Cấp 2 làm phụ liệu dẫn dược, thêm linh dược
    // cấp cao. Lý lão truyền phương khi người chơi đạt Luyện Khí tầng 9
    // (teachRealmRecipes — gọi cùng chỗ teachBasics ở game.js).
    truc_co_dan: { pill: 'truc_co_dan', mats: { yeu_dan_3: 1, yeu_dan_2: 2, linh_chi: 2, ngoc_tuy_chi: 1, thanh_linh_tuy: 1 }, fee: 200, baseRate: 55, source: 'truc_co',
      sourceText: 'Lý lão truyền khi đạt Luyện Khí tầng 9 — phương đan dẫn kiếp đầu tiên' },
    cuu_chuyen_hoi_hon_dan: { pill: 'cuu_chuyen_hoi_hon_dan', mats: { son_tinh: 1, ngoc_tuy_chi: 2, thanh_linh_tuy: 1 }, fee: 120, baseRate: 55, source: 'bi_canh',
      sourceText: 'Đan phương Thiên phẩm — chỉ tìm thấy trong bí cảnh' }
  };
  function recipeOf(pillId) { return RECIPES[pillId] || null; }

  // Chuỗi nhiệm vụ đan phương -> đan phương thưởng (game.js gọi sau khi
  // người chơi trả nhiệm vụ, cùng chỗ với SECT.afterTurnIn).
  var QUEST_RECIPES = {
    q_dan_1: ['hoi_xuan_dan', 'tu_linh_dan', 'tu_khi_dan'],
    q_dan_2: ['giai_doc_dan', 'cuong_the_dan', 'tieu_boi_nguyen_dan'],
    q_dan_3: ['ngung_khi_dan'],
    q_dan_4: ['than_hanh_dan']
  };

  // ---------------- Trạng thái học đan phương ----------------
  function ensureAlchemy(ch) {
    if (!ch) return null;
    if (!ch.alchemy || !Array.isArray(ch.alchemy.learned)) ch.alchemy = { learned: [] };
    return ch.alchemy;
  }
  function hasLearned(ch, pillId) {
    ensureAlchemy(ch);
    return ch.alchemy.learned.indexOf(pillId) >= 0;
  }
  function learnedList(ch) { ensureAlchemy(ch); return ch.alchemy.learned.slice(); }
  // Học một đan phương (API chung: nhiệm vụ, Đan Hà, và team bí cảnh gọi
  // khi trao phương Thiên phẩm). Trả true nếu là phương MỚI học.
  function teachRecipe(ch, pillId) {
    if (!RECIPES[pillId]) return false;
    ensureAlchemy(ch);
    if (ch.alchemy.learned.indexOf(pillId) >= 0) return false;
    ch.alchemy.learned.push(pillId);
    return true;
  }
  // Đọc QUYỂN ĐAN PHƯƠNG (vật phẩm dp_* trong ITEMS của logic.js, rơi
  // từ boss thế giới ở js/bosses.js) để học đan phương — đường học thay
  // thế ngoài chuỗi nhiệm vụ/Đan Hà. Quyển chỉ tiêu hao khi học thành
  // công phương MỚI; đã học rồi thì báo đã học và GIỮ NGUYÊN quyển
  // trong túi (vật phẩm thường không có đường bán — cách ít phá vỡ
  // nhất). Kết quả mang pill: true + msg để UI túi đồ hiện đúng câu
  // báo như khi dùng đan.
  function useRecipeScroll(ch, itemId) {
    var L = logicApi();
    var idef = L && L.ITEMS ? L.ITEMS[itemId] : null;
    if (!idef || !idef.recipeScroll) return { ok: false };
    var pillId = idef.recipeScroll;
    var def = PILLS[pillId];
    if (!def || !RECIPES[pillId]) return { ok: false };
    if (itemCount(ch, itemId) <= 0) return { ok: false, pill: true, recipeScroll: true, msg: 'Túi không có ' + idef.name + '.' };
    if (hasLearned(ch, pillId)) {
      return { ok: false, pill: true, recipeScroll: true, alreadyKnown: true,
        msg: 'Bạn đã học đan phương ' + def.name + ' rồi — quyển này không cần đọc lại, cứ giữ trong túi.' };
    }
    if (!L.consumeItem(ch, itemId, 1)) return { ok: false };
    teachRecipe(ch, pillId);
    return { ok: true, pill: true, recipeScroll: true, learned: pillId,
      msg: 'Mở quyển phương chép tay, học được đan phương: ' + def.name + '! Tới Đan Lô của Lý lão để luyện đan.' };
  }
  // Lý lão dạy 2 phương cơ bản. Trả danh sách id phương mới học.
  function teachBasics(ch) {
    var out = [];
    Object.keys(RECIPES).forEach(function (id) {
      if (RECIPES[id].source === 'ly_lao' && teachRecipe(ch, id)) out.push(id);
    });
    return out;
  }
  // Phương đan DẪN KIẾP (Trúc Cơ Đan): Lý lão chỉ truyền khi người chơi
  // đã chạm Luyện Khí tầng 9 — trước đó nhắc tới cũng vô ích vì chưa ai
  // gánh nổi dược lực của Yêu Đan Cấp 3. Trả danh sách TÊN phương mới học.
  function teachRealmRecipes(ch) {
    var names = [];
    if (!ch || (ch.tier || 0) < 9) return names;
    Object.keys(RECIPES).forEach(function (id) {
      if (RECIPES[id].source === 'truc_co' && teachRecipe(ch, id)) names.push(PILLS[id].name);
    });
    return names;
  }
  function basicsMissing(ch) {
    return Object.keys(RECIPES).filter(function (id) {
      return RECIPES[id].source === 'ly_lao' && !hasLearned(ch, id);
    });
  }
  // Sau khi trả nhiệm vụ: học các phương thưởng của nhiệm vụ đó.
  // Trả danh sách TÊN đan phương mới học (để game.js báo người chơi).
  function afterTurnIn(ch, qid) {
    var names = [];
    (QUEST_RECIPES[qid] || []).forEach(function (id) {
      if (teachRecipe(ch, id)) names.push(PILLS[id].name);
    });
    return names;
  }
  // Đồng bộ đường học Đan Hà Cốc: trả q_tong_dan -> phương 'dan_ha';
  // đã bái nhập Đan Hà (flags.sectJoined === 'dan_ha') -> 'dan_ha_join'.
  // Trả danh sách TÊN phương mới học.
  function syncSectRecipes(ch, qs, flags) {
    var L = logicApi();
    var names = [];
    var trialDone = !!(L && qs && L.isTurnedIn(qs, 'q_tong_dan'));
    var joined = !!(flags && flags.sectJoined === 'dan_ha');
    Object.keys(RECIPES).forEach(function (id) {
      var src = RECIPES[id].source;
      if ((src === 'dan_ha' && trialDone) || (src === 'dan_ha_join' && joined)) {
        if (teachRecipe(ch, id)) names.push(PILLS[id].name);
      }
    });
    return names;
  }

  // ---------------- Luyện đan ----------------
  function hasDanDinh(ch) {
    var A = artifactsApi();
    return !!(A && typeof A.hasEquipped === 'function' && A.hasEquipped(ch, 'dan_dinh_ngoc'));
  }
  // Tỉ lệ thành công (%): gốc theo phẩm đan + 6 điểm mỗi tầng tu vi của
  // người luyện + 10 nếu đang đeo Đan Đỉnh Ngọc; trần 95.
  function successRate(ch, pillId) {
    var r = RECIPES[pillId];
    if (!r) return 0;
    var rate = r.baseRate + (ch.tier || 0) * 6 + (hasDanDinh(ch) ? 10 : 0);
    return Math.max(5, Math.min(95, rate));
  }
  function canBrew(ch, pillId) {
    var r = RECIPES[pillId];
    if (!r) return { ok: false, reason: 'no_recipe' };
    if (!hasLearned(ch, pillId)) return { ok: false, reason: 'not_learned' };
    var lack = [];
    Object.keys(r.mats).forEach(function (m) {
      if (itemCount(ch, m) < r.mats[m]) lack.push(m);
    });
    if (lack.length) return { ok: false, reason: 'mats', lack: lack };
    if ((ch.linhThach || 0) < r.fee) return { ok: false, reason: 'linhThach' };
    return { ok: true };
  }
  // Luyện 1 mẻ. rng gieo được để test tất định. Thành công: trừ đủ nguyên
  // liệu + phí Linh Thạch, nhận 1 viên đan. Thất bại: mất phí + mất một
  // nửa (làm tròn lên) mỗi nguyên liệu, không ra đan.
  function brew(ch, pillId, rng) {
    var L = logicApi();
    var chk = canBrew(ch, pillId);
    if (!chk.ok) return chk;
    var r = RECIPES[pillId];
    var rate = successRate(ch, pillId);
    var roll = (typeof rng === 'function' ? rng() : Math.random()) * 100;
    ch.linhThach -= r.fee;
    if (roll < rate) {
      Object.keys(r.mats).forEach(function (m) { L.consumeItem(ch, m, r.mats[m]); });
      L.addItem(ch, pillId, 1);
      return { ok: true, rate: rate, pill: pillId };
    }
    var lost = {};
    Object.keys(r.mats).forEach(function (m) {
      var n = Math.ceil(r.mats[m] / 2);
      if (n > 0 && L.consumeItem(ch, m, n)) lost[m] = n;
    });
    return { ok: false, reason: 'failed', rate: rate, lost: lost };
  }

  // ---------------- Dùng đan ----------------
  function activeBuffs(ch, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    return (ch.buffs || []).filter(function (b) { return b && b.until > now; });
  }
  function applyBuffs(ch, def, nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    ch.buffs = activeBuffs(ch, now).filter(function (b) {
      return !def.buffs.some(function (nb) { return nb.stat === b.stat; });
    });
    def.buffs.forEach(function (b) {
      ch.buffs.push({ stat: b.stat, val: b.val, until: now + (def.dur || 0) * 1000 });
    });
  }
  function healPctOf(ch) {
    var A = artifactsApi();
    if (!A || typeof A.totalStats !== 'function') return 0;
    return A.totalStats(ch).healPct || 0;
  }
  // Dùng 1 viên đan từ túi (logic.useItem uỷ quyền sang đây cho mọi đan).
  // Trả { ok, pill: true, msg, ... } — msg là câu báo hoàn chỉnh cho UI.
  function usePill(ch, pillId) {
    var L = logicApi();
    var def = PILLS[pillId];
    if (!def || !L) return { ok: false };
    if (itemCount(ch, pillId) <= 0) return { ok: false, pill: true, msg: 'Túi không có ' + def.name + '.' };
    if (def.kind === 'break') {
      return { ok: false, pill: true, msg: def.name + ' là đan hỗ trợ đột phá — khi đột phá, lò tu hành tự dùng 1 viên và cộng tỉ lệ, không ăn trực tiếp.' };
    }
    if (def.kind === 'cure' && !ch.poison) {
      return { ok: false, pill: true, msg: 'Người không có độc, uống ' + def.name + ' bây giờ phí thuốc.' };
    }
    if (def.kind === 'heal' && ch.hp >= L.effMaxHp(ch) && !def.cure) {
      return { ok: false, pill: true, msg: 'Máu đang đầy, chưa cần dùng ' + def.name + '.' };
    }
    if (!L.consumeItem(ch, pillId, 1)) return { ok: false };
    var out = { ok: true, pill: true, kind: def.kind };
    if (def.kind === 'heal') {
      var amt = def.healPctMax ? Math.round(L.effMaxHp(ch) * def.healPctMax / 100) : def.heal;
      var pct = healPctOf(ch);
      if (pct) amt = Math.round(amt * (1 + pct / 100)); // Đan Đỉnh Ngọc cộng hưởng
      var before = ch.hp;
      ch.hp = Math.min(L.effMaxHp(ch), ch.hp + amt);
      out.healed = ch.hp - before;
      out.msg = 'Dùng ' + def.name + ', hồi ' + out.healed + ' Máu.';
      if (def.cure && ch.poison) { ch.poison = null; out.cured = true; out.msg += ' Độc trong người cũng tan hết.'; }
    } else if (def.kind === 'mana') {
      var SK = skillsApi();
      if (SK && typeof SK.ensureState === 'function') SK.ensureState(ch);
      var max = SK && typeof SK.maxLinhLuc === 'function' ? SK.maxLinhLuc(ch) : (ch.ll || 0) + def.mana;
      ch.ll = Math.min(max, (ch.ll || 0) + def.mana);
      out.mana = def.mana;
      out.msg = 'Dùng ' + def.name + ', hồi ' + def.mana + ' linh lực.';
    } else if (def.kind === 'tuvi') {
      out.tuVi = L.gainTuVi(ch, def.tuvi);
      out.msg = 'Dùng ' + def.name + ', +' + out.tuVi + ' tu vi.';
    } else if (def.kind === 'buff') {
      applyBuffs(ch, def);
      out.msg = 'Dùng ' + def.name + ': ' + def.fxText + '.';
    } else if (def.kind === 'cure') {
      ch.poison = null;
      out.cured = true;
      out.msg = 'Dùng ' + def.name + ' — độc tan, người nhẹ hẳn.';
    }
    return out;
  }

  var api = {
    GRADES: GRADES,
    HERBS: HERBS, SPOTS: SPOTS, spotsFor: spotsFor, herbDef: herbDef, respawnMs: respawnMs,
    PILLS: PILLS, isPill: isPill, pillDef: pillDef,
    RECIPES: RECIPES, recipeOf: recipeOf, QUEST_RECIPES: QUEST_RECIPES,
    ensureAlchemy: ensureAlchemy, hasLearned: hasLearned, learnedList: learnedList,
    teachRecipe: teachRecipe, useRecipeScroll: useRecipeScroll, teachBasics: teachBasics, teachRealmRecipes: teachRealmRecipes, basicsMissing: basicsMissing,
    afterTurnIn: afterTurnIn, syncSectRecipes: syncSectRecipes,
    hasDanDinh: hasDanDinh, successRate: successRate, canBrew: canBrew, brew: brew,
    activeBuffs: activeBuffs, usePill: usePill, itemCount: itemCount
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_ALCHEMY = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_ALCHEMY = api;
})();
