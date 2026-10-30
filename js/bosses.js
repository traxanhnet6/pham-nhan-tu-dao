// bosses.js — Hệ BOSS YÊU THÚ THẾ GIỚI: hồi sinh theo giờ thật + bảng rơi tường minh.
// Lệnh Bui 20:51 29/10/2026: "tạo boss yêu thú hồi sinh theo giờ tỉ lệ rớt đồ".
//
// CƠ CHẾ LỊCH (chốt 1 cơ chế, ghi rõ): giờ ĐỊA PHƯƠNG (giờ máy người chơi).
// Mỗi boss có cycleMin (chu kỳ, phút) + offsetMin (lệch so với nửa đêm).
// Mốc hồi sinh = mốc lịch ĐẦU TIÊN lớn hơn thời điểm chết:
//   slot = 00:00 + offsetMin + k*cycleMin (k nguyên), chọn slot nhỏ nhất > deathAt.
// VD Sơn Quân: cycle 120, offset 0 → hồi sinh đúng các giờ chẵn 00:00, 02:00...
// Chết xong quay lại online sau nhiều giờ vẫn đúng trạng thái (tính từ mốc chết).
//
// SƠN QUÂN 2 CHẾ ĐỘ: khi nhiệm vụ chương 7 (q_chinh_7) chưa trả, Sơn Quân là
// BOSS CỐT TRUYỆN (spawn theo nhiệm vụ như cũ, game.js tự lo). Sau khi trả
// nhiệm vụ, Sơn Quân chuyển thành BOSS THẾ GIỚI theo lịch trên; lần hạ boss
// cốt truyện cũng ghi mốc chết để chu kỳ thế giới bắt đầu từ đó.
//
// BẢNG RƠI: mỗi dòng lăn ĐỘC LẬP (không phải tổng 100%) — % ghi tường minh,
// người chơi xem trước được ở bia sào huyệt/panel Boss. Mỗi boss 1 món
// KÝ DANH (sig) tỉ lệ thấp. Id rơi chỉ dùng id ĐANG CÓ trong game
// (vũ khí js/weapons.js, pháp khí js/artifacts.js, vật phẩm Logic.ITEMS);
// đan dược chưa có module đợt này nên dùng nhóm thưởng tương đương (Linh Chi…).
//
// YÊU ĐAN (Bui 21:45 29/10): mọi boss thế giới đều có dòng Yêu Đan lăn độc
// lập — boss map 2–3 rơi Cấp 1 (60–70%), boss Thập Vạn Đại Sơn chắc chắn
// Cấp 1 + cơ hội Cấp 2 (30–35%), Thiết Bì Ma Vương chỉ Cấp 2 (60% + 25%
// thêm viên nữa). Yêu Đan Cấp 3 chưa có nguồn (để dành boss map cảnh giới
// cao). Đây là nguyên liệu tích trữ cho Trúc Cơ Đan sau này.
//
// MỞ RỘNG BẢNG RƠI (Bui 22:10 29/10: "Boss có tỷ lệ rớt đan phương pháp
// bảo vũ khí"): cả 8 boss có đủ 3 loại dòng — VŨ KHÍ (theo phẩm khớp sức
// boss), PHÁP BẢO (ghép theo chủ đề loài) và QUYỂN ĐAN PHƯƠNG. Quyển là
// vật phẩm 'item' id dp_* trong Logic.ITEMS (trường recipeScroll): đọc
// trong túi để học đan phương qua PNT_ALCHEMY.useRecipeScroll — đường
// học thay thế ngoài chuỗi Lý lão/nhiệm vụ/Đan Hà (ưu tiên phương buff/
// chiến đấu/hồi phục cao cấp + phương đột phá Ngưng Khí/Phá Cảnh ở
// vương thú Đại Sơn, tỉ lệ 4–6% vì là mở khóa vĩnh viễn; boss tầm trung
// 8–10%). Mọi dòng mới lăn độc lập, % tường minh ở panel Boss; tỉ lệ
// các dòng cũ (ký danh/Linh Thạch/Yêu Đan/vũ khí/pháp bảo sẵn có) GIỮ
// NGUYÊN tuyệt đối — test 33b đối chiếu snapshot toàn bảng cũ.
//
// Boss map 4 (Thập Vạn Đại Sơn): neo vào 3 sào trống team map chừa sẵn
// trong MAP4.bossLairs (Hang Hổ Gầm / Tâm Phế Tích / Hang Vực Sâu). Cơ chế
// pending vẫn giữ cho boss của map tương lai chưa có dữ liệu. Hình boss
// đợt này = bản phóng lớn
// + hào quang + nameplate boss, KHÔNG sinh loài mới.
(function (root) {
  'use strict';

  function logic() { return root.PNT_LOGIC || (typeof module !== 'undefined' && module.exports ? null : null); }
  function mapsLib() { return root.PNT_MAPS || null; }
  function weaponsLib() { return root.PNT_WEAPONS || null; }
  function artifactsLib() { return root.PNT_ARTIFACTS || null; }

  // Danh sách boss — thứ tự = thang độ khó tăng dần.
  // lair: ô sào huyệt (đã kiểm đi được + nằm trong zone của loài ở maps.js).
  // stele: ô bia sào huyệt (chạm vào mở panel boss + xem đếm ngược/bảng rơi).
  var BOSSES = [
    {
      id: 'lang_vuong', name: 'Lang Vương Huyết Nguyệt', type: 'soi_rung',
      mapId: 'map2', lair: { x: 36, y: 18 }, stele: { x: 35, y: 18 },
      lairName: 'Khu Sói Rừng — ghềnh đá phía bắc', scale: 1.45,
      hp: 200, atk: 13, linhThach: 140, cycleMin: 120, offsetMin: 60,
      desc: 'Vua của bầy sói rừng Thanh Sơn, bộ lông ánh đỏ như trăng máu. Gầm của nó gọi cả bầy về quanh sào huyệt.',
      drops: [
        { kind: 'weapon', id: 'kiem_linh', chance: 0.35 },
        { kind: 'weapon', id: 'dao_linh', chance: 0.30 },
        { kind: 'weapon', id: 'thuong_linh', chance: 0.30 },
        { kind: 'weapon', id: 'cung_linh', chance: 0.20 },
        { kind: 'artifact', id: 'kinh_chieu_yeu', chance: 0.20 },
        { kind: 'artifact', id: 'than_hanh_boi', chance: 0.15 },
        { kind: 'item', id: 'da_soi', n: 3, chance: 0.60 },
        { kind: 'item', id: 'linh_chi', n: 1, chance: 0.25 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.60 },
        { kind: 'weapon', id: 'kiem_huyen', chance: 0.06, sig: true },
        { kind: 'item', id: 'dp_than_hanh_dan', chance: 0.08 }
      ]
    },
    {
      id: 'son_quan', name: 'Sơn Quân', type: 'son_quan',
      mapId: 'map2', lair: { x: 31, y: 33 }, stele: { x: 29, y: 30 },
      lairName: 'Sào Huyệt Sơn Quân', scale: 1.15,
      hp: 340, atk: 17, linhThach: 200, cycleMin: 120, offsetMin: 0,
      storyQuest: 'q_chinh_7',
      desc: 'Hổ tinh trấn giữ rừng Thanh Sơn. Sau khi bị đánh bại trong nhiệm vụ chương 7, yêu khí của nó vẫn tụ lại theo giờ — cứ hai giờ một lần nó lại hiện hình ở sào huyệt, mạnh hơn trước.',
      drops: [
        { kind: 'weapon', id: 'dao_son_quan', chance: 0.35, sig: true },
        { kind: 'weapon', id: 'dao_huyen', chance: 0.25 },
        { kind: 'weapon', id: 'kiem_dia', chance: 0.12 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.12 },
        { kind: 'weapon', id: 'cung_dia', chance: 0.12 },
        { kind: 'weapon', id: 'truong_dia', chance: 0.12 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.30 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.12 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.08 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.05 },
        { kind: 'item', id: 'linh_chi', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.70 },
        { kind: 'item', id: 'dp_cuong_the_dan', chance: 0.08 }
      ]
    },
    {
      id: 'xa_vuong', name: 'Xà Vương Đuôi Đỏ', type: 'ran_luc',
      mapId: 'map2', lair: { x: 40, y: 22 }, stele: { x: 39, y: 21 },
      lairName: 'Khu Rắn Lục — bờ suối phía đông', scale: 1.5,
      hp: 240, atk: 18, linhThach: 170, cycleMin: 120, offsetMin: 30,
      desc: 'Rắn lục chúa sống trăm năm, chót đuôi đỏ rực như than hồng. Đòn của nó là nặng nhất trong các yêu vương quanh Thanh Sơn.',
      drops: [
        { kind: 'weapon', id: 'truong_linh', chance: 0.35 },
        { kind: 'weapon', id: 'cung_linh', chance: 0.30 },
        { kind: 'weapon', id: 'truong_huyen', chance: 0.15 },
        { kind: 'artifact', id: 'chuong_tran_hon', chance: 0.20 },
        { kind: 'artifact', id: 'kinh_chieu_yeu', chance: 0.15 },
        { kind: 'item', id: 'thao_duoc', n: 3, chance: 0.60 },
        { kind: 'item', id: 'linh_chi', n: 1, chance: 0.30 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.60 },
        { kind: 'weapon', id: 'truong_dia', chance: 0.06, sig: true },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.05 },
        { kind: 'item', id: 'dp_giai_doc_dan', chance: 0.10 }
      ]
    },
    {
      id: 'hau_vuong', name: 'Hầu Vương Mặt Đỏ', type: 'khi_mat_do',
      mapId: 'map3', lair: { x: 55, y: 27 }, stele: { x: 49, y: 25 },
      lairName: 'Bãi Luyện Công — Chân Núi Thanh Phong', scale: 1.5,
      hp: 310, atk: 15, linhThach: 190, cycleMin: 240, offsetMin: 0,
      desc: 'Khỉ chúa chiếm bãi luyện công của đệ tử Thanh Phong, mặt đỏ như vẽ, nhanh và lì đòn. Nó chỉ tụ yêu khí bốn giờ một lần.',
      drops: [
        { kind: 'weapon', id: 'cung_linh', chance: 0.35 },
        { kind: 'weapon', id: 'truong_linh', chance: 0.30 },
        { kind: 'weapon', id: 'cung_huyen', chance: 0.18 },
        { kind: 'artifact', id: 'tui_tru_vat', chance: 0.22 },
        { kind: 'artifact', id: 'chuong_tran_hon', chance: 0.18 },
        { kind: 'artifact', id: 'phi_kiem_bao', chance: 0.10 },
        { kind: 'item', id: 'long_ga', n: 4, chance: 0.60 },
        { kind: 'item', id: 'linh_chi', n: 1, chance: 0.30 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.60 },
        { kind: 'weapon', id: 'cung_dia', chance: 0.07, sig: true },
        { kind: 'item', id: 'dp_tu_linh_dan', chance: 0.10 }
      ]
    },
    {
      id: 'thiet_bi_vuong', name: 'Thiết Bì Vương', type: 'lon_mong_sat',
      mapId: 'map2', lair: { x: 20, y: 35 }, stele: { x: 22, y: 33 },
      lairName: 'Khu Lợn Mông Sắt — bãi phía nam', scale: 1.5,
      hp: 420, atk: 16, linhThach: 240, cycleMin: 180, offsetMin: 0,
      desc: 'Lợn mông sắt chúa, da dày như giáp rèn, trâu nhất trong các yêu vương vùng Thanh Sơn. Dân làng gọi nó là "cái cối xay biết đi".',
      drops: [
        { kind: 'weapon', id: 'dao_huyen', chance: 0.30 },
        { kind: 'weapon', id: 'kiem_huyen', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_huyen', chance: 0.25 },
        { kind: 'weapon', id: 'cung_huyen', chance: 0.20 },
        { kind: 'weapon', id: 'truong_huyen', chance: 0.20 },
        { kind: 'artifact', id: 'day_troi_tien', chance: 0.25 },
        { kind: 'artifact', id: 'tu_bao_bon', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.10 },
        { kind: 'item', id: 'da_soi', n: 4, chance: 0.60 },
        { kind: 'item', id: 'linh_chi', n: 2, chance: 0.35 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 0.70 },
        { kind: 'weapon', id: 'kiem_dia', chance: 0.07, sig: true },
        { kind: 'item', id: 'dp_dai_hoi_xuan_dan', chance: 0.08 }
      ]
    },
    // ---- Boss map 4 Thập Vạn Đại Sơn: neo vào đúng 3 sào team map đã
    // chừa sẵn trong MAP4.bossLairs (sàn trống + biển tên): Hang Hổ Gầm
    // (7,4) tây bắc, Tâm Phế Tích (36,4) giữa phế tích bắc, Hang Vực Sâu
    // (65,4) đông bắc. Trường lairId = id sào trong maps.js để test khớp.
    {
      id: 'co_mang_vuong', name: 'Cổ Mãng Vương', type: 'ran_luc',
      mapId: 'map4', lairId: 'tam_phe_tich', lair: { x: 48, y: 12 }, stele: { x: 49, y: 13 },
      lairName: 'Tâm Phế Tích — Thập Vạn Đại Sơn', scale: 2.0,
      hp: 560, atk: 22, linhThach: 420, cycleMin: 240, offsetMin: 120,
      desc: 'Mãng xà cổ sống ngàn năm, chiếm giữ tâm phế tích phía bắc Thập Vạn Đại Sơn, vảy cứng như đá cổ. Mạnh nhất trong các yêu vương đã biết.',
      drops: [
        { kind: 'weapon', id: 'truong_dia', chance: 0.25 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.15 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.10 },
        { kind: 'item', id: 'linh_chi', n: 3, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.30 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.15 },
        { kind: 'weapon', id: 'truong_thien', chance: 0.05, sig: true },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.15 },
        { kind: 'item', id: 'dp_sinh_co_dan', chance: 0.05 },
        { kind: 'item', id: 'dp_ngung_khi_dan', chance: 0.06 }
      ]
    },
    {
      id: 'ho_vuong', name: 'Gầm Sơn Hổ Vương', type: 'son_quan',
      mapId: 'map4', lairId: 'hang_ho_gam', lair: { x: 19, y: 12 }, stele: { x: 20, y: 13 },
      lairName: 'Hang Hổ Gầm — Thập Vạn Đại Sơn', scale: 1.35,
      hp: 620, atk: 23, linhThach: 480, cycleMin: 300, offsetMin: 60,
      desc: 'Hổ vương trấn Hang Hổ Gầm ở tây bắc Thập Vạn Đại Sơn — họ hàng xa và hung dữ hơn hẳn Sơn Quân của rừng Thanh Sơn. Tiếng gầm của nó làm rung cả vách hang.',
      drops: [
        { kind: 'weapon', id: 'dao_son_quan', chance: 0.30 },
        { kind: 'weapon', id: 'kiem_dia', chance: 0.15 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.15 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.25 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.10 },
        { kind: 'item', id: 'linh_chi', n: 3, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.35 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.20 },
        { kind: 'weapon', id: 'kiem_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_chien_y_dan', chance: 0.05 },
        { kind: 'item', id: 'dp_dai_boi_nguyen_dan', chance: 0.06 },
        // Phù cực hiếm (js/talismans.js, lệnh Bui 07:04 2026-10-30): Thế
        // Lôi Phù + giấy viết nó + Hộ Đạo Phù rơi cực thấp từ 3 vương
        // thú Đại Sơn — không bán, không tạo nguồn LT mới.
        { kind: 'item', id: 'the_loi_phu', n: 1, chance: 0.03 },
        { kind: 'item', id: 'giay_phu_thien', n: 1, chance: 0.08 },
        { kind: 'item', id: 'ho_dao_phu', n: 1, chance: 0.05 }
      ]
    },
    {
      id: 'thiet_bi_ma_vuong', name: 'Thiết Bì Ma Vương', type: 'lon_mong_sat',
      mapId: 'map4', lairId: 'hang_vuc_sau', lair: { x: 77, y: 12 }, stele: { x: 76, y: 13 },
      lairName: 'Hang Vực Sâu — Thập Vạn Đại Sơn', scale: 1.9,
      hp: 680, atk: 24, linhThach: 540, cycleMin: 360, offsetMin: 0,
      desc: 'Ma vương lợn sắt trấn giữ Hang Vực Sâu ở đông bắc Thập Vạn Đại Sơn, giáp thịt cứng hơn cả thiết giáp, HP cao nhất trong các yêu vương.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.20 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.20 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.08 },
        { kind: 'item', id: 'linh_chi', n: 3, chance: 0.50 },
        { kind: 'item', id: 'da_soi', n: 5, chance: 0.60 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.60 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.25 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.30 },
        { kind: 'weapon', id: 'dao_thien', chance: 0.05, sig: true },
        { kind: 'artifact', id: 'dan_dinh_ngoc', chance: 0.06 },
        { kind: 'item', id: 'dp_pha_canh_dan', chance: 0.04 },
        { kind: 'item', id: 'dp_ngung_khi_dan', chance: 0.05 },
        // Phù cực hiếm: nguồn chính của Thế Lôi Phù + cả quyển phù
        // phương chế nó (pp_the_loi_phu 3%).
        { kind: 'item', id: 'the_loi_phu', n: 1, chance: 0.04 },
        { kind: 'item', id: 'giay_phu_thien', n: 1, chance: 0.10 },
        { kind: 'item', id: 'ho_dao_phu', n: 1, chance: 0.06 },
        { kind: 'item', id: 'pp_the_loi_phu', n: 1, chance: 0.03 }
      ]
    },
    // ---- Boss chặng Đại Sơn sâu + chặng cao (vòng tích hợp, mục 3
    // hàng chờ, 2026-10-30): gán đủ 13 sào trống còn lại — map 5/6/7 (mỗi
    // map 1 sào) + map 8–14 (10 sào) — qua lairId để lairOf đọc tọa độ
    // động từ MAP.bossLairs như 3 boss map 4. Thang sức mạnh tăng dần
    // theo độ sâu (HP/ATK/LT), Yêu Đan Cấp 3 chỉ bắt đầu rơi nhiều từ
    // chặng Kim Đan trở lên (đúng ghi chú "để dành boss map cảnh giới
    // cao" ở đầu file); mỗi boss đúng 1 ký danh + 1 quyển đan phương
    // (bắt buộc theo test 33b) và 1 dược đặc sản của map mình.
    {
      id: 'mang_trung_phuc', name: 'Cổ Mãng Trung Phúc', type: 'ran_luc',
      mapId: 'map5', lairId: 'dien_co_trung_phuc', lair: { x: 38, y: 13 }, stele: { x: 39, y: 13 },
      lairName: 'Điện Cổ Trung Phúc — Thập Vạn Đại Sơn', scale: 1.9,
      hp: 750, atk: 26, linhThach: 480, cycleMin: 240, offsetMin: 30,
      desc: 'Mãng xà cổ chiếm điện cổ ở Trung Phúc, vảy đã ngả màu rêu đá. Nó canh phế tích từ trước khi người đầu tiên đặt chân lên Đại Sơn sâu.',
      drops: [
        { kind: 'weapon', id: 'truong_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.12 },
        { kind: 'artifact', id: 'dang_tu_khi', chance: 0.10 },
        { kind: 'item', id: 'linh_chi', n: 3, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.35 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.15 },
        { kind: 'weapon', id: 'thuong_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_sinh_co_dan', chance: 0.05 },
        { kind: 'item', id: 'giay_phu_thien', n: 1, chance: 0.08 },
        { kind: 'item', id: 'ho_dao_phu', n: 1, chance: 0.05 },
        { kind: 'item', id: 'pp_kiem_khi_phu', n: 1, chance: 0.05 }
      ]
    },
    {
      id: 'lang_tham_xu', name: 'Lang Vương Thâm Xứ', type: 'soi_rung',
      mapId: 'map6', lairId: 'hang_vuc_tham_xu', lair: { x: 20, y: 10 }, stele: { x: 21, y: 10 },
      lairName: 'Hang Vực Thâm Xứ — Thập Vạn Đại Sơn', scale: 1.6,
      hp: 820, atk: 27, linhThach: 520, cycleMin: 300, offsetMin: 0,
      desc: 'Sói chúa của Thâm Xứ, lông xám như sương vực. Bầy của nó săn theo tiếng hú vang từ đáy hang vực, không bao giờ rời khỏi cửa hang quá xa.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.25 },
        { kind: 'weapon', id: 'cung_dia', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.22 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.08 },
        { kind: 'item', id: 'linh_chi', n: 3, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.35 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.20 },
        { kind: 'weapon', id: 'cung_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_chien_y_dan', chance: 0.05 }
      ]
    },
    {
      id: 'tuyet_lang_vuong', name: 'Tuyết Lang Vương', type: 'soi_rung',
      mapId: 'map7', lairId: 'phong_dinh_dai', lair: { x: 38, y: 17 }, stele: { x: 39, y: 17 },
      lairName: 'Phong Đỉnh Đài — Thập Vạn Đại Sơn', scale: 1.7,
      hp: 900, atk: 28, linhThach: 560, cycleMin: 360, offsetMin: 60,
      desc: 'Sói trắng trấn Phong Đỉnh Đài, đứng giữa bia cổ và biển mây. Người lên Chi Đỉnh muốn qua ngưỡng Trúc Cơ đều phải đi qua tiếng hú của nó.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.22 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.08 },
        { kind: 'item', id: 'linh_chi', n: 3, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.40 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.20 },
        { kind: 'weapon', id: 'kiem_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_ngung_khi_dan', chance: 0.06 }
      ]
    },
    {
      id: 'lang_van_hai', name: 'Lang Vương Vân Hải', type: 'soi_rung',
      mapId: 'map8', lairId: 'hang_van_hai', lair: { x: 24, y: 14 }, stele: { x: 25, y: 14 },
      lairName: 'Hang Vân Hải — Sơn Trung Vân Hải', scale: 1.7,
      hp: 1000, atk: 30, linhThach: 580, cycleMin: 300, offsetMin: 120,
      desc: 'Sói chúa đầu tiên của chặng Trúc Cơ, lông thấm hơi biển mây nên thoắt ẩn thoắt hiện trong sương. Đệ tử mới lên Vân Hải đều nghe tên nó trước khi gặp mặt.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.12 },
        { kind: 'artifact', id: 'phi_kiem_bao', chance: 0.10 },
        { kind: 'item', id: 'long_tien_thao', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.30 },
        { kind: 'weapon', id: 'dao_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_dai_boi_nguyen_dan', chance: 0.06 }
      ]
    },
    {
      id: 'lon_suoi_may', name: 'Lợn Vương Suối Mây', type: 'lon_mong_sat',
      mapId: 'map8', lairId: 'dong_suoi_may', lair: { x: 60, y: 43 }, stele: { x: 61, y: 43 },
      lairName: 'Động Suối Mây — Sơn Trung Vân Hải', scale: 1.9,
      hp: 1050, atk: 31, linhThach: 580, cycleMin: 360, offsetMin: 0,
      desc: 'Lợn mông sắt chúa chiếm động suối mây, da dày lại thêm hơi nước mây che phủ nên đao kiếm thường khó chạm tới thịt. Nó ngủ ngày, chỉ ra khỏi động khi sương xuống.',
      drops: [
        { kind: 'weapon', id: 'thuong_dia', chance: 0.25 },
        { kind: 'weapon', id: 'kiem_dia', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.22 },
        { kind: 'artifact', id: 'dan_dinh_ngoc', chance: 0.08 },
        { kind: 'item', id: 'long_tien_thao', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.30 },
        { kind: 'weapon', id: 'truong_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_pha_canh_dan', chance: 0.05 }
      ]
    },
    {
      id: 'lang_doan_long', name: 'Đoạn Long Lang Vương', type: 'soi_rung',
      mapId: 'map9', lairId: 'hang_long_cot', lair: { x: 54, y: 14 }, stele: { x: 55, y: 14 },
      lairName: 'Hang Long Cốt — Đoạn Long Lĩnh', scale: 1.8,
      hp: 1150, atk: 32, linhThach: 600, cycleMin: 360, offsetMin: 180,
      desc: 'Sói chúa giữ hang xương rồng trên Đoạn Long Lĩnh, bộ xương rồng cổ trong hang là tổ của nó. Đệ tử đi tìm Vạn Niên Linh Chi đều phải vòng qua lãnh địa của nó.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.25 },
        { kind: 'weapon', id: 'cung_dia', chance: 0.20 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.12 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.08 },
        { kind: 'item', id: 'van_nien_linh_chi', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_1', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.30 },
        { kind: 'weapon', id: 'thuong_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_ngung_khi_dan', chance: 0.06 }
      ]
    },
    {
      id: 'diem_xa_vuong', name: 'Diệm Xà Vương', type: 'ran_luc',
      mapId: 'map10', lairId: 'ho_diem_vuong', lair: { x: 33, y: 29 }, stele: { x: 34, y: 29 },
      lairName: 'Hồ Diệm Vương — Xích Diệm Hoang Nguyên', scale: 2.0,
      hp: 1300, atk: 34, linhThach: 600, cycleMin: 360, offsetMin: 60,
      desc: 'Rắn lửa chúa cuộn mình quanh hồ dung nham giữa hoang nguyên, vảy đỏ như than hồng chưa tắt. Hơi nóng của nó làm cả hồ sôi lăn tăn quanh năm.',
      drops: [
        { kind: 'weapon', id: 'truong_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.12 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.08 },
        { kind: 'item', id: 'hoa_diem_lien', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.40 },
        { kind: 'weapon', id: 'cung_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_sinh_co_dan', chance: 0.05 }
      ]
    },
    {
      id: 'hau_xich_diem', name: 'Hầu Vương Xích Diệm', type: 'khi_mat_do',
      mapId: 'map10', lairId: 'hang_xich_diem', lair: { x: 60, y: 16 }, stele: { x: 61, y: 16 },
      lairName: 'Hang Xích Diệm — Xích Diệm Hoang Nguyên', scale: 1.7,
      hp: 1350, atk: 35, linhThach: 600, cycleMin: 420, offsetMin: 0,
      desc: 'Khỉ chúa mặt đỏ như lửa của hoang nguyên, nhanh tới mức người ta chỉ thấy bóng đỏ lướt qua rồi mới nghe tiếng cười. Nó giữ Hỏa Diệm Liên như giữ bảo vật của đàn.',
      drops: [
        { kind: 'weapon', id: 'cung_dia', chance: 0.25 },
        { kind: 'weapon', id: 'kiem_dia', chance: 0.20 },
        { kind: 'artifact', id: 'phi_kiem_bao', chance: 0.12 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.08 },
        { kind: 'item', id: 'hoa_diem_lien', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.40 },
        { kind: 'weapon', id: 'kiem_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_chien_y_dan', chance: 0.05 }
      ]
    },
    {
      id: 'lon_bang_coc', name: 'Băng Cốc Thiết Bì Vương', type: 'lon_mong_sat',
      mapId: 'map11', lairId: 'dong_bang_tinh', lair: { x: 54, y: 40 }, stele: { x: 55, y: 40 },
      lairName: 'Động Băng Tinh — Hàn Băng Cốc', scale: 1.9,
      hp: 1500, atk: 36, linhThach: 600, cycleMin: 420, offsetMin: 120,
      desc: 'Lợn sắt chúa của Hàn Băng Cốc, lớp mỡ dưới da đã đông thành băng giáp. Nó nằm chặn cửa động băng tinh, thở ra hơi lạnh làm đóng băng cả lối vào.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.22 },
        { kind: 'artifact', id: 'dan_dinh_ngoc', chance: 0.08 },
        { kind: 'item', id: 'bang_tinh_hoa', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.40 },
        { kind: 'weapon', id: 'dao_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_dai_boi_nguyen_dan', chance: 0.06 }
      ]
    },
    {
      id: 'loi_xa_vuong', name: 'Lôi Xà Vương', type: 'ran_luc',
      mapId: 'map12', lairId: 'huyet_loi_vuong', lair: { x: 44, y: 30 }, stele: { x: 45, y: 30 },
      lairName: 'Huyệt Lôi Vương — Lôi Trì Thiên Khanh', scale: 2.0,
      hp: 1700, atk: 38, linhThach: 600, cycleMin: 420, offsetMin: 60,
      desc: 'Rắn sấm chúa cuộn trên đài đá giữa lôi trì, vảy tích điện nên mỗi lần nó trườn là tia sét nhỏ chạy dọc thân. Người lên Thiên Khanh đều tránh đài của nó khi trời nổi sấm.',
      drops: [
        { kind: 'weapon', id: 'truong_dia', chance: 0.25 },
        { kind: 'weapon', id: 'cung_dia', chance: 0.20 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.12 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.10 },
        { kind: 'item', id: 'thien_loi_qua', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.60 },
        { kind: 'weapon', id: 'truong_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_pha_canh_dan', chance: 0.05 }
      ]
    },
    {
      id: 'thien_loi_xa_vuong', name: 'Thiên Lôi Xà Vương', type: 'ran_luc',
      mapId: 'map12', lairId: 'hang_thien_loi', lair: { x: 22, y: 16 }, stele: { x: 23, y: 16 },
      lairName: 'Hang Thiên Lôi — Lôi Trì Thiên Khanh', scale: 2.0,
      hp: 1750, atk: 39, linhThach: 600, cycleMin: 480, offsetMin: 0,
      desc: 'Rắn sấm già hơn, sống trong hang phía tây Thiên Khanh, nơi sét đánh xuống nhiều nhất. Vảy của nó đã hóa thành vảy lôi, đánh vào như đánh vào đá tích điện.',
      drops: [
        { kind: 'weapon', id: 'truong_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.12 },
        { kind: 'artifact', id: 'cuu_chuyen_linh_chau', chance: 0.10 },
        { kind: 'item', id: 'thien_loi_qua', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.60 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'weapon', id: 'thuong_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_ngung_khi_dan', chance: 0.06 }
      ]
    },
    {
      id: 'hau_tinh_van', name: 'Tinh Vẫn Hầu Vương', type: 'khi_mat_do',
      mapId: 'map13', lairId: 'van_tinh_ho', lair: { x: 30, y: 28 }, stele: { x: 31, y: 28 },
      lairName: 'Hố Vẫn Tinh — Tinh Vẫn Chi Địa', scale: 1.8,
      hp: 2000, atk: 42, linhThach: 600, cycleMin: 480, offsetMin: 240,
      desc: 'Khỉ chúa sống trong hố vẫn tinh, lông đã nhuốm ánh sao rơi. Nó thu thập mảnh đá sao về tổ, coi đó là kho báu, kẻ nào động vào là bị cả đàn vây đánh.',
      drops: [
        { kind: 'weapon', id: 'cung_dia', chance: 0.25 },
        { kind: 'weapon', id: 'kiem_dia', chance: 0.20 },
        { kind: 'artifact', id: 'phi_kiem_bao', chance: 0.12 },
        { kind: 'artifact', id: 'thien_la_vong', chance: 0.10 },
        { kind: 'item', id: 'tinh_van_thach', n: 2, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.60 },
        { kind: 'weapon', id: 'cung_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_dai_hoi_xuan_dan', chance: 0.05 }
      ]
    },
    {
      id: 'lang_thien_dai', name: 'Thiên Đài Lang Vương', type: 'soi_rung',
      mapId: 'map14', lairId: 'dai_loi_dinh', lair: { x: 40, y: 13 }, stele: { x: 41, y: 13 },
      lairName: 'Đài Lôi Đỉnh — Độ Kiếp Đài', scale: 1.9,
      hp: 2400, atk: 45, linhThach: 600, cycleMin: 720, offsetMin: 0,
      desc: 'Sói chúa cuối cùng của Thập Vạn Đại Sơn, trấn giữ Đài Lôi Đỉnh nơi người ta độ kiếp. Nó đã thấy không biết bao nhiêu tu sĩ gục ngã dưới lôi kiếp, và vẫn đứng đó chờ kẻ tiếp theo.',
      drops: [
        { kind: 'weapon', id: 'kiem_dia', chance: 0.25 },
        { kind: 'weapon', id: 'thuong_dia', chance: 0.20 },
        { kind: 'artifact', id: 'an_tran_son', chance: 0.22 },
        { kind: 'artifact', id: 'dinh_hai_than_chau', chance: 0.10 },
        { kind: 'item', id: 'thien_lien', n: 1, chance: 0.50 },
        { kind: 'item', id: 'yeu_dan_2', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 1 },
        { kind: 'item', id: 'yeu_dan_3', n: 1, chance: 0.50 },
        { kind: 'weapon', id: 'kiem_thien', chance: 0.05, sig: true },
        { kind: 'item', id: 'dp_pha_canh_dan', chance: 0.05 }
      ]
    }
  ];

  var BY_ID = {};
  BOSSES.forEach(function (b) { BY_ID[b.id] = b; });

  function list() { return BOSSES.slice(); }
  function bossById(id) { return BY_ID[id] || null; }

  // ---- Lịch hồi sinh (giờ địa phương) ----
  // Mốc lịch đầu tiên LỚN HƠN ts theo lưới offset + k*cycle tính từ nửa đêm.
  function nextSlot(ts, cycleMin, offsetMin) {
    var d = new Date(ts);
    var mid = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
    var mins = (ts - mid) / 60000;
    var k = Math.floor((mins - offsetMin) / cycleMin) + 1;
    var slotMin = offsetMin + k * cycleMin;
    // slotMin có thể vượt sang ngày hôm sau (vd cycle 360 chết 23:59) — Date tự lo.
    return mid + slotMin * 60000;
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtClock(ts) {
    if (ts == null) return '--:--';
    var d = new Date(ts);
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  // Đếm ngược mm:ss (hoặc h:mm:ss khi > 1 giờ).
  function fmtLeft(ms) {
    if (ms == null || ms < 0) ms = 0;
    var s = Math.ceil(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    if (h > 0) return h + ':' + pad2(m) + ':' + pad2(ss);
    return pad2(m) + ':' + pad2(ss);
  }
  // Mô tả lịch 1 ngày: "Mỗi 2 giờ — hồi sinh lúc 00:00, 02:00, 04:00, ..."
  function scheduleText(def) {
    var times = [];
    for (var m = def.offsetMin; m < 1440; m += def.cycleMin) {
      times.push(pad2(Math.floor(m / 60)) + ':' + pad2(m % 60));
    }
    var cyc = def.cycleMin >= 60 ? (def.cycleMin / 60) + ' giờ' : def.cycleMin + ' phút';
    return 'Mỗi ' + cyc + ' — hồi sinh lúc ' + times.slice(0, 4).join(', ') + (times.length > 4 ? ', ...' : '');
  }

  // ---- Trạng thái boss theo save + nhiệm vụ + giờ thật ----
  function ensureState(flags) {
    if (!flags.bossKills || typeof flags.bossKills !== 'object') flags.bossKills = {};
    return flags.bossKills;
  }
  function deathOf(flags, id) {
    var bk = flags && flags.bossKills;
    var v = bk ? bk[id] : null;
    return (typeof v === 'number' && isFinite(v)) ? v : null;
  }
  function recordKill(flags, id, now) {
    ensureState(flags)[id] = now;
  }

  // mode: 'pending' (chờ map) | 'story' (boss cốt truyện, lịch thế giới chưa chạy)
  //     | 'world' (boss thế giới — available cho biết đang sống hay chờ hồi sinh).
  function stateOf(def, flags, qs, now) {
    if (def.pending) return { mode: 'pending', available: false, respawnAt: null, deathAt: deathOf(flags, def.id) };
    if (def.storyQuest) {
      var L = logic();
      var turnedIn = false;
      if (L && qs) { try { turnedIn = !!L.isTurnedIn(qs, def.storyQuest); } catch (e) { turnedIn = false; } }
      else if (qs && qs.turnedIn) turnedIn = Array.isArray(qs.turnedIn) ? qs.turnedIn.indexOf(def.storyQuest) >= 0 : !!qs.turnedIn[def.storyQuest];
      if (!turnedIn) return { mode: 'story', available: false, respawnAt: null, deathAt: deathOf(flags, def.id) };
    }
    var deathAt = deathOf(flags, def.id);
    if (deathAt == null) return { mode: 'world', available: true, respawnAt: null, deathAt: null };
    var rs = nextSlot(deathAt, def.cycleMin, def.offsetMin);
    return { mode: 'world', available: now >= rs, respawnAt: rs, deathAt: deathAt };
  }

  // ---- Bảng rơi ----
  // Lăn rơi: mỗi dòng độc lập. rng: hàm () → [0,1) (test gieo hạt được).
  function rollDrops(def, rng) {
    var r = rng || Math.random;
    var out = [];
    def.drops.forEach(function (d) {
      if (r() < d.chance) out.push({ kind: d.kind, id: d.id, n: d.n || 1, sig: !!d.sig });
    });
    return out;
  }
  // Kiểm tra bảng rơi hợp lệ: tỉ lệ (0,1], id tồn tại, đúng 1 món ký danh.
  function validateTable(def) {
    var errs = [];
    var W = weaponsLib(), A = artifactsLib(), L = logic();
    var sigCount = 0;
    def.drops.forEach(function (d) {
      if (!(d.chance > 0 && d.chance <= 1)) errs.push(def.id + '/' + d.id + ': chance ngoài (0,1]');
      if (d.kind === 'weapon' && W && !W.WEAPONS[d.id]) errs.push(def.id + '/' + d.id + ': vũ khí không tồn tại');
      if (d.kind === 'artifact' && A && !A.ARTIFACTS[d.id]) errs.push(def.id + '/' + d.id + ': pháp khí không tồn tại');
      if (d.kind === 'item' && L && !L.ITEMS[d.id]) errs.push(def.id + '/' + d.id + ': vật phẩm không tồn tại');
      if (d.kind !== 'weapon' && d.kind !== 'artifact' && d.kind !== 'item') errs.push(def.id + '/' + d.id + ': kind lạ ' + d.kind);
      if (d.sig) sigCount++;
    });
    if (sigCount !== 1) errs.push(def.id + ': cần đúng 1 món ký danh, hiện ' + sigCount);
    return errs;
  }
  // Hiển thị bảng rơi (giải tên + phẩm) cho panel/preview.
  function dropDisplay(def) {
    var W = weaponsLib(), A = artifactsLib(), L = logic();
    return def.drops.map(function (d) {
      var name = d.id, sub = '';
      if (d.kind === 'weapon' && W && W.WEAPONS[d.id]) {
        var w = W.WEAPONS[d.id];
        name = w.name;
        sub = W.GRADES[w.grade].name + ' · Công +' + w.atk;
      } else if (d.kind === 'artifact' && A && A.ARTIFACTS[d.id]) {
        var a = A.ARTIFACTS[d.id];
        name = a.name;
        // artifacts.js không có trường slotName (chỉ có kind phap/bao) —
        // trước đây sub in ra "undefined" ở panel Boss; nay ghi đúng loại.
        sub = A.GRADES[a.grade].name + ' · ' + (a.kind === 'bao' ? 'Bảo vật' : 'Pháp khí');
      } else if (d.kind === 'item' && L && L.ITEMS[d.id]) {
        name = L.ITEMS[d.id].name + ((d.n || 1) > 1 ? ' ×' + d.n : '');
        sub = L.ITEMS[d.id].recipeScroll ? 'Đan phương · đọc trong túi để học' : 'Vật phẩm';
      }
      return { kind: d.kind, id: d.id, name: name, sub: sub, chance: d.chance, sig: !!d.sig };
    });
  }
  function steleList(mapId) {
    return BOSSES.filter(function (b) { return b.mapId === mapId && b.stele; })
      .map(function (b) { return { bossId: b.id, x: b.stele.x, y: b.stele.y }; });
  }
  // Sào huyệt HIỆU LỰC của boss: nếu boss neo vào sào trống của team map
  // (lairId khớp 1 mục trong MAP.bossLairs của maps.js) thì ĐỌC TỌA ĐỘ TỪ
  // DỮ LIỆU MAP — team map dời sào là boss tự theo, không ghim tọa độ chết.
  // Không khớp thì dùng lair khai báo trong định nghĩa boss.
  function lairOf(def) {
    if (def.lairId) {
      var MP = mapsLib();
      var mp = MP && MP.MAPS ? MP.MAPS[def.mapId] : null;
      var ent = null;
      if (mp && mp.bossLairs) {
        for (var i = 0; i < mp.bossLairs.length; i++) if (mp.bossLairs[i].id === def.lairId) { ent = mp.bossLairs[i]; break; }
      }
      if (ent) return { x: ent.x, y: ent.y };
    }
    return def.lair;
  }

  var api = {
    BOSSES: BOSSES, list: list, bossById: bossById,
    nextSlot: nextSlot, fmtClock: fmtClock, fmtLeft: fmtLeft, scheduleText: scheduleText,
    ensureState: ensureState, deathOf: deathOf, recordKill: recordKill, stateOf: stateOf,
    rollDrops: rollDrops, validateTable: validateTable, dropDisplay: dropDisplay,
    steleList: steleList, lairOf: lairOf
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PNT_BOSSES = api;
})(typeof window !== 'undefined' ? window : globalThis);
