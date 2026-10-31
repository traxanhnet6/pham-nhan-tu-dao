// ============================================================
// ĐẠI HỘI TU TIÊN LIÊN TÔNG MÔN (lệnh Bui 22:13–22:14 ngày 2026-10-29) —
// module ĐỘC LẬP js/tournament.js, cùng mẫu với secret-realms.js /
// flight.js: dữ liệu + luật thuần (test bằng Node), game.js chỉ nối
// NPC/panel/spawn/kill-hook và DIỄN GIẢI phần thưởng bằng hệ thật.
//
// THIẾT KẾ ĐÃ CHỐT:
// - Khung: 10 tông môn giao lưu tỉ thí tại VÕ ĐÀI ĐẠI HỘI riêng (map
//   instance 'map_dai_hoi' do module này tự đăng ký vào PNT_MAPS.MAPS —
//   lệnh Bui 22:44 ngày 2026-10-29; trước đó đấu tạm ở Bãi Luyện Công
//   map 3, nay bãi đó trả lại vai trò luyện tập + Thử Kiếm Đài ngự
//   kiếm). NPC "Chấp Sự Đại Hội" Hàn Sơn đứng ở quảng trường map 3
//   (28,12) lo ghi danh + bảng xếp hạng; bấm "Vào trận" là CHUYỂN CẢNH
//   sang võ đài, đấu xong tự về quảng trường map 3 (28,13).
// - Đấu trường 60x40: đài đá trung tâm LỚN (36x18 ô = 648 ô, gấp
//   2,8 lần sàn đầu 21x11 — mở rộng theo lệnh Bui 23:06 ngày
//   2026-10-29 vì bản đầu quá chật cho các trận Trúc Cơ dùng chiêu
//   diện rộng/lướt; nền AI assets/dai-hoi-bg-v7.png 1920x1280 sinh
//   đúng tỉ lệ 60x40 rồi chốt lưới logic theo vị trí sàn/khán đài/cổng
//   đo từ tranh), khán đài bắc + 2 khán đài bên
//   có ĐỆ TỬ 10 TÔNG ngồi xem
//   (NPC trang trí đứng yên), cờ 10 tông trong tranh nền, cổng lớn phía
//   nam (cổng về quảng trường khi không đấu).
// - LUẬT RANH ĐÀI (chốt): đài có vành rào đá chỉ chừa BẬC THANG phía
//   nam; đang đấu mà người chơi bước QUA bậc thang xuống khỏi đài =
//   XUỐNG ĐÀI = xử thua trận đó (game.js tickTournArena kiểm ô người
//   chơi so với ARENA.ring rồi reportLoss — thua bán kết vẫn được đánh
//   tranh hạng ba như thua thường). Rời map giữa trận = bỏ cuộc (hook
//   switchMap sẵn có). Âm thanh: trống trận lúc vào trận + tiếng reo
//   khán đài khi người chơi thắng (sfx tourn_drum/tourn_cheer trong
//   sound.js); khán giả là NPC tĩnh nên "phản ứng" = tiếng reo + toast.
// - Lịch PHIÊN giờ thật (đồng hồ địa phương, như bí cảnh): 2 phiên/ngày
//   — 10:00 và 19:30. Mỗi phiên: mở GHI DANH 30 phút trước giờ đấu,
//   toàn phiên kéo dài 90 phút kể từ giờ đấu. Mỗi kỳ (phiên) người chơi
//   chỉ đấu 1 BẢNG (chốt ở lần ghi danh).
// - Hai BẢNG: Luyện Khí (tầng 3+) và Trúc Cơ (realmRank >= 2 theo
//   maps.realmRankOf — bảng này khoá tới khi hệ cảnh giới mở Trúc Cơ,
//   nhưng dữ liệu/đối thủ/test giả lập đã sẵn).
// - Thể thức: 16 người (người chơi + 15 đệ tử của 10 tông), loại trực
//   tiếp: Vòng loại → Tứ kết → Bán kết → Chung kết; thua Bán kết được
//   đánh thêm trận TRANH HẠNG BA. Đấu bằng engine chiến đấu thật:
//   đối thủ là quái dạng người (thân khi_mat_do như hình nhân ngự kiếm,
//   render ghi đè bằng sheet hero đệ tử — xem game.js), chỉ số CO GIÃN
//   theo tầng/tiểu giai của người chơi (chụp tại lúc ghi danh) và tăng
//   dần theo vòng, nhân thêm hệ số phong cách từng đệ tử.
// - Thưởng theo HẠNG, thang CHẬT theo nhịp cày cuốc (team kinh tế giữ
//   nguyên các nguồn khác): quán quân kèm KÝ DANH riêng của Đại Hội
//   (Kim Bài / Thiên Bài — vật phẩm chỉ có từ Đại Hội, không bán ở đâu)
//   + vũ khí phẩm cao không bán ở shop + DANH HIỆU "Quán Quân Đại Hội"
//   lưu save, hiện ở HUD cạnh tên. Thưởng mỗi kỳ nhận đúng 1 lần
//   (lastResult.rewarded chốt ở module; game.js phát ngay khi kết thúc).
// - Bảng VINH DANH: quán quân các kỳ gần nhất (người chơi hoặc đệ tử
//   NPC vô địch khi người chơi bị loại) lưu trong flags.tourn.hall.
//
// Trạng thái nằm trong flags.tourn của save (L.serialize mang theo
// nguyên vẹn); save cũ không có trường này thì ensure() khởi tạo lười.
// Mọi hàm thời gian nhận `now` (ms), rng tiêm được — test giả lập được.
// Tên đệ tử + tên vật phẩm ký danh là ĐỀ XUẤT, chờ Bui chốt.
// ============================================================
(function (global) {
  'use strict';
  var L = null, SECT = null, M = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SECT = require('./sects.js'); } catch (e) { SECT = null; }
    try { M = require('./maps.js'); } catch (e) { M = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    SECT = global.PNT_SECTS || null;
    M = global.PNT_MAPS || null;
  }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }

  // ---------- Hằng số khung ----------
  var STEWARD = { id: 'chap_su_dai_hoi', name: 'Hàn Sơn', title: 'Chấp Sự Đại Hội', mapId: 'map3', x: 120, y: 97 } // V7-EXPAND: (80,62)+neo map3 (40,35) // V10: + offset map (12,8); V5: +40,+42 — dòng này là STEWARD Hàn Sơn;
  // Võ đài riêng: người chơi vào đài ở đầu TÂY (playerStart), đối thủ
  // đứng đầu ĐÔNG (x,y của ARENA). ring = toàn bộ bệ đài kể cả vành rào
  // — ô người chơi ra khỏi ring khi đang đấu = xuống đài = thua.
  var ARENA = {
    mapId: 'map_dai_hoi', name: 'Võ Đài Đại Hội',
    x: 44, y: 19,
    playerStart: { x: 15, y: 19 },
    returnPoint: { mapId: 'map3', x: 120, y: 98 }, // V7-EXPAND: (80,63)+neo map3 (40,35)
    ring: { x0: 12, y0: 11, x1: 47, y1: 28 },
    gate: { x: 29, y: 38 }
  };
  function inRing(x, y) { var r = ARENA.ring; return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1; }
  var OPP_TYPE = 'khi_mat_do'; // thân quái dạng người duy nhất (như hình nhân ngự kiếm)
  var SESSIONS = [10 * 60, 19 * 60 + 30]; // 10:00 và 19:30, phút từ 00:00 giờ địa phương
  var REG_BEFORE_MIN = 30;  // ghi danh mở trước giờ đấu 30 phút
  var DUR_MIN = 90;         // phiên kéo dài 90 phút từ giờ đấu
  var HALL_MAX = 6;

  var ROUNDS = ['Vòng loại', 'Tứ kết', 'Bán kết', 'Chung kết'];
  var THIRD_NAME = 'Tranh hạng ba';
  var PLACEMENTS = {
    quan_quan: { label: 'Quán quân', rank: 1 },
    a_quan: { label: 'Á quân', rank: 2 },
    hang_ba: { label: 'Hạng ba', rank: 3 },
    hang_tu: { label: 'Hạng tư', rank: 4 },
    tu_ket: { label: 'Dừng ở Tứ kết', rank: 5 },
    tham_gia: { label: 'Tham gia', rank: 6 }
  };
  // Hệ số sức mạnh theo vòng (chung kết là trận khó nhất; tranh hạng ba
  // dùng hệ số của Bán kết).
  var ROUND_MULT = [
    { hp: 0.80, atk: 0.80 },
    { hp: 0.95, atk: 0.92 },
    { hp: 1.15, atk: 1.06 },
    { hp: 1.40, atk: 1.26 }
  ];

  // ---------- Hai bảng đấu + thưởng theo hạng ----------
  // kind: 'linhThach' | 'item' | 'weapon' | 'title' — game.js diễn giải.
  // Ký danh: kim_bai_dai_hoi / thien_bai_dai_hoi là VẬT PHẨM trong
  // logic.js ITEMS (chỉ Đại Hội mới có). Vũ khí quán quân lấy từ kho
  // sẵn có, price 0 = lò rèn không bán (kiem_dia / kiem_thien).
  var BRACKETS = {
    luyen_khi: {
      id: 'luyen_khi', name: 'Bảng Luyện Khí', minTier: 3,
      condText: 'Luyện Khí tầng 3 trở lên',
      titleText: 'Quán Quân Đại Hội Luyện Khí',
      rewards: {
        quan_quan: [{ kind: 'linhThach', n: 800 }, { kind: 'item', id: 'kim_bai_dai_hoi', n: 1 }, { kind: 'weapon', id: 'kiem_dia' }, { kind: 'item', id: 'yeu_dan_1', n: 2 }, { kind: 'title' }],
        a_quan: [{ kind: 'linhThach', n: 400 }, { kind: 'item', id: 'dai_hoi_xuan_dan', n: 2 }, { kind: 'item', id: 'yeu_dan_1', n: 1 }],
        hang_ba: [{ kind: 'linhThach', n: 250 }, { kind: 'item', id: 'hoi_xuan_dan', n: 2 }, { kind: 'item', id: 'yeu_dan_1', n: 1 }],
        hang_tu: [{ kind: 'linhThach', n: 150 }, { kind: 'item', id: 'hoi_xuan_dan', n: 1 }],
        tu_ket: [{ kind: 'linhThach', n: 80 }, { kind: 'item', id: 'hoi_xuan_dan', n: 1 }],
        tham_gia: [{ kind: 'linhThach', n: 30 }]
      }
    },
    truc_co: {
      id: 'truc_co', name: 'Bảng Trúc Cơ', minRank: 2,
      condText: 'Đã đột phá Trúc Cơ',
      titleText: 'Quán Quân Đại Hội Trúc Cơ',
      rewards: {
        quan_quan: [{ kind: 'linhThach', n: 3000 }, { kind: 'item', id: 'thien_bai_dai_hoi', n: 1 }, { kind: 'weapon', id: 'kiem_thien' }, { kind: 'item', id: 'yeu_dan_2', n: 2 }, { kind: 'title' }],
        a_quan: [{ kind: 'linhThach', n: 1500 }, { kind: 'item', id: 'dai_hoi_xuan_dan', n: 3 }, { kind: 'item', id: 'yeu_dan_2', n: 1 }],
        hang_ba: [{ kind: 'linhThach', n: 900 }, { kind: 'item', id: 'dai_hoi_xuan_dan', n: 1 }, { kind: 'item', id: 'yeu_dan_2', n: 1 }],
        hang_tu: [{ kind: 'linhThach', n: 500 }, { kind: 'item', id: 'dai_hoi_xuan_dan', n: 1 }],
        tu_ket: [{ kind: 'linhThach', n: 250 }, { kind: 'item', id: 'hoi_xuan_dan', n: 1 }],
        tham_gia: [{ kind: 'linhThach', n: 100 }]
      }
    }
  };
  function bracketById(id) { return BRACKETS[id] || null; }

  // ---------- 15 đệ tử của 10 tông (ĐỀ XUẤT) ----------
  // skillId/skillName: chiêu tủ theo hệ skill hiện có (skills.js) — engine
  // quái không thi triển skill nên đây là danh tính phong cách: hiện ở
  // panel + lời thoại trước trận; sức mạnh khác nhau qua hpMult/atkMult.
  // gender/origin: sheet hero dùng để render đối thủ dạng người.
  var DISCIPLES = [
    { id: 'dc_tp_kiem', name: 'Chu Kiếm Sinh', sect: 'thanh_phong', gender: 'nam', origin: 'nong_dan', skillId: 'kiem_khi', skillName: 'Kiếm Khí Trảm', hpMult: 1.00, atkMult: 1.10,
      lines: { pre: 'Thanh Phong kiếm ý: nhanh và sạch. Xin chỉ giáo!', win: 'Kiếm của ngươi còn chậm một nhịp. Về luyện thêm đi.', lose: 'Kiếm ý của ngươi... thẳng hơn ta tưởng. Ta thua tâm phục.' } },
    { id: 'dc_tp_song', name: 'Tần Vô Song', sect: 'thanh_phong', gender: 'nu', origin: 'thu_sinh', skillId: 'ngu_kiem', skillName: 'Ngự Kiếm Thuật', hpMult: 0.95, atkMult: 1.15,
      lines: { pre: 'Ta là người giữ nhịp kiếm của Thanh Phong khóa này. Đừng nương tay.', win: 'Phi kiếm chưa kịp rời tay ngươi đã thua rồi.', lose: 'Hay! Lâu lắm Thanh Phong mới có người ép ta tới nước này.' } },
    { id: 'dc_hp_huyen', name: 'Bạch Tử Huyền', sect: 'huyen_phap', gender: 'nu', origin: 'thu_sinh', skillId: 'thien_can', skillName: 'Thiên Căn Thần Thông', hpMult: 0.90, atkMult: 1.22,
      lines: { pre: 'Pháp tùy tâm chuyển. Tâm ngươi loạn thì đừng trách pháp của ta nặng.', win: 'Thấy chưa — ra tay ít mà trúng đích nhiều, đó là Huyền Pháp.', lose: 'Ngộ tính của ngươi... không tệ. Trận này ta nhớ.' } },
    { id: 'dc_hp_hanh', name: 'Mộ Dung Hành', sect: 'huyen_phap', gender: 'nam', origin: 'tho_san', skillId: 'toan_phong', skillName: 'Toàn Phong Kiếm', hpMult: 0.95, atkMult: 1.12,
      lines: { pre: 'Ngũ hành luân chuyển, gió cũng là tay của ta.', win: 'Gió cuốn ngươi đi xa quá. Lần sau đứng cho vững.', lose: 'Luân của ta vỡ rồi... ngươi phá pháp khéo lắm.' } },
    { id: 'dc_tc_nguu', name: 'Đồng Thiết Ngưu', sect: 'thien_cong', gender: 'nam', origin: 'tho_san', skillId: 'luu_tinh', skillName: 'Lưu Tinh Đột', hpMult: 1.12, atkMult: 1.00,
      lines: { pre: 'Khí do tay người rèn. Người của Thiên Công thì cứng như hàng của Thiên Công!', win: 'Hàng của ta chưa cong, người của ngươi đã cong rồi.', lose: 'Được! Món hàng này... à không, NGƯỜI này đạt chuẩn xuất xưởng.' } },
    { id: 'dc_dh_chi', name: 'Diệp Linh Chi', sect: 'dan_ha', gender: 'nu', origin: 'nong_dan', skillId: 'thien_can', skillName: 'Thiên Căn Thần Thông', hpMult: 1.00, atkMult: 1.00,
      lines: { pre: 'Đan Hà đi đâu cũng được chào đón — trừ trên võ đài. Đừng trách ta.', win: 'Bị thương thì ghé cốc ta, ta giảm giá thuốc cho người quen.', lose: 'Tay đan của ta run rồi... ngươi mạnh hơn mùi thuốc của ta nhiều.' } },
    { id: 'dc_dh_hoa', name: 'Đan Tiểu Hỏa', sect: 'dan_ha', gender: 'nam', origin: 'nong_dan', skillId: 'dan_hoa', skillName: 'Đan Hỏa Thuật', hpMult: 0.96, atkMult: 1.10,
      lines: { pre: 'Lửa lò của ta chưa tắt bao giờ. Cẩn thận bỏng đấy!', win: 'Đan hỏa liệu thiên — ngươi thấy nóng không?', lose: 'Lò tắt rồi... thôi, về ta nhóm lại, kỳ sau gặp lại.' } },
    { id: 'dc_vt_lang', name: 'Sơn Tiểu Lang', sect: 'van_thu', gender: 'nam', origin: 'tho_san', skillId: 'toan_phong', skillName: 'Toàn Phong Kiếm', hpMult: 1.05, atkMult: 1.05,
      lines: { pre: 'Thú rừng Thanh Sơn chỉ nghe lời người nó tin. Ta cũng vậy — đánh thắng ta đi rồi nói chuyện.', win: 'Đàn thú của ta cười ngươi kìa. Về tập thêm đi.', lose: 'Thú còn quý ngươi hơn quý ta... ta thua là phải.' } },
    { id: 'dc_vt_ung', name: 'Phong Ưng Nhi', sect: 'van_thu', gender: 'nu', origin: 'tho_san', skillId: 'luu_tinh', skillName: 'Lưu Tinh Đột', hpMult: 0.92, atkMult: 1.12,
      lines: { pre: 'Ta nhanh như ưng vồ mồi. Nháy mắt là mất dấu ta đấy.', win: 'Đã bảo đừng nháy mắt mà.', lose: 'Bay nhanh mấy cũng có lúc sa lưới... hay lắm.' } },
    { id: 'dc_tphu_sa', name: 'Chu Sa Nhi', sect: 'thien_phu', gender: 'nu', origin: 'thu_sinh', skillId: 'kiem_khi', skillName: 'Kiếm Khí Trảm', hpMult: 1.00, atkMult: 1.06,
      lines: { pre: 'Một nét bùa ngay, trấn tà an dân. Tay ta vững lắm, đừng mong ta run.', win: 'Bùa đã dán lên nhịp đánh của ngươi từ đầu trận rồi.', lose: 'Nét bùa cuối cùng... đứt rồi. Ta nhận thua.' } },
    { id: 'dc_cc_tran', name: 'Tư Mã Trận', sect: 'cuu_cung', gender: 'nam', origin: 'thu_sinh', skillId: 'toan_phong', skillName: 'Toàn Phong Kiếm', hpMult: 1.06, atkMult: 1.00,
      lines: { pre: 'Ngươi đã bước vào trận của ta từ lúc nghe tên ta. Cứ tự nhiên.', win: 'Thiên quân khó phá một trận đã bày. Ngươi cũng vậy thôi.', lose: 'Trận bị phá từ trong... ngươi đọc được thế trận của ta sao?' } },
    { id: 'dc_kc_luc', name: 'Thạch Đại Lực', sect: 'kim_cang', gender: 'nam', origin: 'nong_dan', skillId: 'luu_tinh', skillName: 'Lưu Tinh Đột', hpMult: 1.28, atkMult: 0.95,
      lines: { pre: 'Thân này là pháp bảo đầu tiên của ta. Cứ đánh thoải mái, ta đứng đây!', win: 'Ha ha! Đánh ta như gãi ngứa. Về ăn thêm cơm rồi quay lại!', lose: 'Đau... đau thật đấy! Lâu lắm mới có người đánh ta đau. Hay!' } },
    { id: 'dc_kc_sam', name: 'Thiết Sam', sect: 'kim_cang', gender: 'nam', origin: 'tho_san', skillId: 'kiem_khi', skillName: 'Kiếm Khí Trảm', hpMult: 1.20, atkMult: 0.98,
      lines: { pre: 'Ta từng đứng một mình giữ cổng núi. Một võ đài thì nhằm nhò gì.', win: 'Cổng còn đứng. Ngươi thì không.', lose: 'Cổng... sập rồi. Ta thua, nhưng thua vui.' } },
    { id: 'dc_nd_xa', name: 'Xà Thanh', sect: 'ngu_doc', gender: 'nu', origin: 'tho_san', skillId: 'thien_can', skillName: 'Thiên Căn Thần Thông', hpMult: 0.95, atkMult: 1.12,
      lines: { pre: 'Độc cũng là thuốc — tùy tay người dùng. Tay ta thì... ngươi tự cảm nhận.', win: 'Đừng lo, độc của ta có thuốc giải. Thắng xong ta đưa.', lose: 'Người bình tĩnh như ngươi... thảo nào độc không thấm nổi.' } },
    { id: 'dc_ha_cam', name: 'Tố Cầm', sect: 'huyen_am', gender: 'nu', origin: 'thu_sinh', skillId: 'ngu_kiem', skillName: 'Ngự Kiếm Thuật', hpMult: 0.95, atkMult: 1.06,
      lines: { pre: 'Một khúc đàn hay an được cả người sống. Còn trên võ đài, đàn của ta tiễn người thua.', win: 'Khúc nhạc dứt rồi. Ngươi nghe kịp không?', lose: 'Dây đàn đứt giữa khúc... trận này là của ngươi.' } }
  ];
  var DISC_BY_ID = {};
  DISCIPLES.forEach(function (d) { DISC_BY_ID[d.id] = d; });
  function discipleById(id) { return DISC_BY_ID[id] || null; }
  function sectNameOf(d) {
    if (!d) return '';
    if (SECT && SECT.sectById) { var s = SECT.sectById(d.sect); if (s) return s.name; }
    return d.sect;
  }
  function discipleLabel(d) { return d ? (d.name + ' — ' + sectNameOf(d)) : ''; }

  // ---------- MAP ĐẤU TRƯỜNG (instance tự đăng ký vào PNT_MAPS.MAPS) --
  // 60x40, bố cục khớp nền AI assets/dai-hoi-bg-v7.png (đài đá x12..47 /
  // y11..28, khán đài bắc y6..10 + 2 khán đài bên x6..10/x49..53, cổng
  // nam ở y38).
  // Khán giả: đệ tử 10 tông (sprite = đại diện tông tương ứng trong
  // sprites.js/npcs-ai), ĐỨNG YÊN trên khán đài kín rào — người chơi
  // không bước vào được. Trường sectTag (KHÔNG dùng 'sect' để khỏi bị
  // npcVisible của game.js lọc theo tiến độ mở tông).
  var SECT_SPRITES = [
    ['thanh_phong', 'de_tu_phai', 'Thanh Phong Phái'], ['huyen_phap', 'tong_phap', 'Huyền Pháp Tông'],
    ['thien_cong', 'tong_khi', 'Thiên Công Phường'], ['dan_ha', 'tong_dan', 'Đan Hà Cốc'],
    ['van_thu', 'tong_thu', 'Vạn Thú Môn'], ['thien_phu', 'tong_phu', 'Thiên Phù Các'],
    ['cuu_cung', 'tong_tran', 'Cửu Cung Trận Tông'], ['kim_cang', 'tong_the', 'Kim Cang Môn'],
    ['ngu_doc', 'tong_doc', 'Ngũ Độc Giáo'], ['huyen_am', 'tong_am', 'Huyền Âm Cung']
  ];
  function buildArenaTiles() {
    var W = 60, H = 40, g = [], x, y, row;
    for (y = 0; y < H; y++) { row = []; for (x = 0; x < W; x++) row.push('.'); g.push(row); }
    function R(x0, y0, x1, y1, ch) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = ch; }
    function S(px, py, ch) { g[py][px] = ch; }
    R(0, 0, W - 1, 0, 'W'); R(0, H - 1, W - 1, H - 1, 'W'); R(0, 1, 0, H - 2, 'W'); R(W - 1, 1, W - 1, H - 2, 'W');
    R(1, 1, W - 2, 3, 'W');                       // dải cờ phướn + trời sau khán đài bắc
    R(1, 4, 4, 10, 'W'); R(55, 4, 58, 10, 'W');   // vách đá/mây 2 góc bắc (khớp tranh)
    R(1, 4, W - 2, 4, 'W');                       // chân cờ phướn: không đi sau khán đài
    R(5, 5, 7, 11, 'W'); R(52, 5, 54, 11, 'W');   // hốc vách sau 2 đầu khán đài bắc
    R(1, 12, 4, 26, 'W'); R(55, 12, 58, 26, 'W'); // vách mây dọc sau khán đài bên
    R(1, 32, 18, 38, 'W'); R(41, 32, 58, 38, 'W');// vách + mây 2 góc nam quanh cổng
    // Khán đài bắc (kín rào): sàn y6..10, rào sau y5, rào hông x8/x51,
    // rào trước là hàng y11 (chung vành với đài ở giữa).
    R(9, 6, 50, 10, 'Q'); R(9, 5, 50, 5, 'F'); R(8, 6, 8, 10, 'F'); R(51, 6, 51, 10, 'F');
    R(9, 11, 11, 11, 'F'); R(48, 11, 50, 11, 'F');
    // Khán đài tây + đông (kín rào): sàn x6..10 / x49..53, y12..26.
    R(6, 12, 10, 26, 'Q'); R(5, 12, 5, 26, 'F'); R(11, 12, 11, 26, 'F'); R(6, 11, 10, 11, 'F'); R(6, 27, 10, 27, 'F');
    R(49, 12, 53, 26, 'Q'); R(54, 12, 54, 26, 'F'); R(48, 12, 48, 26, 'F'); R(49, 11, 53, 11, 'F'); R(49, 27, 53, 27, 'F');
    // Đài đá trung tâm 36x18: sàn Q, vành rào F, 4 trụ góc 'o', bậc thang nam.
    R(ARENA.ring.x0, ARENA.ring.y0, ARENA.ring.x1, ARENA.ring.y1, 'Q');
    R(ARENA.ring.x0, ARENA.ring.y0, ARENA.ring.x1, ARENA.ring.y0, 'F'); R(ARENA.ring.x0, ARENA.ring.y1, ARENA.ring.x1, ARENA.ring.y1, 'F');
    R(ARENA.ring.x0, ARENA.ring.y0, ARENA.ring.x0, ARENA.ring.y1, 'F'); R(ARENA.ring.x1, ARENA.ring.y0, ARENA.ring.x1, ARENA.ring.y1, 'F');
    S(12, 11, 'o'); S(47, 11, 'o'); S(12, 28, 'o'); S(47, 28, 'o');
    S(29, 28, 'Q'); S(30, 28, 'Q');               // bậc thang xuống đài (lối ra duy nhất)
    // Đường đá cổng -> bậc thang; cổng về quảng trường ở (29..30, 38).
    R(29, 29, 30, 38, '#'); S(29, 38, 'G'); S(30, 38, 'G'); S(29, 39, '#'); S(30, 39, '#');
    // Tường cổng + đèn đá + giá binh khí + thông ven (khớp tranh nền).
    R(19, 36, 27, 36, 'F'); R(32, 36, 40, 36, 'F'); S(24, 34, 'L'); S(35, 34, 'L');
    S(18, 29, 'S'); S(19, 29, 'S'); S(39, 29, 'S'); S(40, 29, 'S');
    S(7, 29, 'T'); S(52, 29, 'T');
    return g.map(function (r) { return r.join(''); });
  }
  function buildAudience() {
    var list = [], n = 0;
    function add(sectRow, x, y) {
      n++;
      list.push({ id: 'khan_gia_' + (n < 10 ? '0' : '') + n, sprite: sectRow[1], sectTag: sectRow[0], name: 'Đệ tử ' + sectRow[2], x: x, y: y });
    }
    var rowAx = [12, 16, 20, 24, 28, 32, 36, 40, 44, 47], rowBx = [14, 18, 22, 26, 30, 34, 38, 42, 45, 48], i;
    for (i = 0; i < 10; i++) add(SECT_SPRITES[i], rowAx[i], 7);
    for (i = 0; i < 10; i++) add(SECT_SPRITES[i], rowBx[i], 9);
    add(SECT_SPRITES[0], 8, 13); add(SECT_SPRITES[7], 8, 16); add(SECT_SPRITES[4], 8, 19); add(SECT_SPRITES[5], 8, 22); add(SECT_SPRITES[2], 8, 25);
    add(SECT_SPRITES[1], 51, 13); add(SECT_SPRITES[3], 51, 16); add(SECT_SPRITES[6], 51, 19); add(SECT_SPRITES[8], 51, 22); add(SECT_SPRITES[9], 51, 25);
    return list;
  }
  var ARENA_MAP = {
    id: ARENA.mapId, name: ARENA.name, instance: true,
    bg: 'assets/dai-hoi-bg-v7.png', w: 60, h: 40,
    tiles: buildArenaTiles(),
    blocked: { W: 1, H: 1, T: 1, S: 1, L: 1, F: 1, o: 1, E: 1, R: 1 },
    start: { x: 29, y: 33 },
    portals: [
      { x: 29, y: 38, to: 'map3', tx: 80, ty: 63, name: 'Về Quảng Trường' },
      { x: 30, y: 38, to: 'map3', tx: 80, ty: 63, name: 'Về Quảng Trường' }
    ],
    npcs: buildAudience(),
    zones: [], monsters: [], herbs: [],
    props: [
      { sprite: 'sign', x: 27, y: 29, label: 'Võ Đài Đại Hội' },
      { sprite: 'sign', x: 44, y: 10, label: 'Khán Đài Thập Tông' },
      { sprite: 'sign', x: 31, y: 36, label: 'Cổng Võ Đài' }
    ]
  };
  function registerMaps(mapsApi) {
    if (!mapsApi || !mapsApi.MAPS) return false;
    mapsApi.MAPS[ARENA_MAP.id] = ARENA_MAP;
    return true;
  }
  if (M) registerMaps(M); // nạp sau maps.js: tự đăng ký ngay (như secret-realms)

  // ---------- Trạng thái trong save (flags.tourn) ----------
  function ensure(flags) {
    if (!flags || typeof flags !== 'object') return null;
    var t = flags.tourn;
    if (!t || typeof t !== 'object') {
      t = flags.tourn = { playedKey: '', run: null, titleLK: false, titleTC: false, hall: [], lastResult: null };
    }
    if (typeof t.playedKey !== 'string') t.playedKey = '';
    if (t.run === undefined) t.run = null;
    if (typeof t.titleLK !== 'boolean') t.titleLK = !!t.titleLK;
    if (typeof t.titleTC !== 'boolean') t.titleTC = !!t.titleTC;
    if (!Array.isArray(t.hall)) t.hall = [];
    if (t.lastResult === undefined) t.lastResult = null;
    return t;
  }

  // ---------- Lịch phiên ----------
  function dayKey(now) {
    var d = new Date(now);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function sessionKey(now, idx) { return dayKey(now) + '#' + idx; }
  // Cửa sổ phiên: [start - REG_BEFORE_MIN, start + DUR_MIN).
  function sessionAt(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < SESSIONS.length; i++) {
      var start = base + SESSIONS[i] * 60000;
      var regStart = start - REG_BEFORE_MIN * 60000;
      var end = start + DUR_MIN * 60000;
      if (now >= regStart && now < end) {
        return { index: i, start: start, regStart: regStart, end: end, key: sessionKey(now, i), phase: now < start ? 'reg' : 'fight' };
      }
    }
    return null;
  }
  function nextSession(now) {
    var d = new Date(now);
    var base = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    for (var i = 0; i < SESSIONS.length; i++) {
      var regStart = base + SESSIONS[i] * 60000 - REG_BEFORE_MIN * 60000;
      if (now < regStart) return { index: i, start: base + SESSIONS[i] * 60000, regStart: regStart, dayOffset: 0 };
    }
    return { index: 0, start: base + 86400000 + SESSIONS[0] * 60000, regStart: base + 86400000 + SESSIONS[0] * 60000 - REG_BEFORE_MIN * 60000, dayOffset: 1 };
  }
  function rankOf(ch) {
    if (!ch) return 0;
    if (M && M.realmRankOf) return M.realmRankOf(ch);
    return num(ch.realmRank, 0);
  }
  function eligible(ch, bracketId) {
    var b = bracketById(bracketId);
    if (!b) return { ok: false, reason: 'bad_bracket' };
    if (bracketId === 'luyen_khi') {
      return (num(ch && ch.tier, 0) >= b.minTier) ? { ok: true } : { ok: false, reason: 'low_tier' };
    }
    return (rankOf(ch) >= b.minRank) ? { ok: true } : { ok: false, reason: 'low_realm' };
  }
  function status(flags, ch, now) {
    var t = ensure(flags); if (!t) return null;
    var ses = sessionAt(now);
    return {
      open: !!ses, session: ses,
      next: ses ? null : nextSession(now),
      playedThis: !!(ses && t.playedKey === ses.key),
      run: t.run,
      eligLK: eligible(ch, 'luyen_khi'), eligTC: eligible(ch, 'truc_co'),
      title: titleText(flags),
      hall: t.hall.slice()
    };
  }

  // ---------- Ghi danh + bốc thăm ----------
  function canRegister(flags, ch, bracketId, now) {
    var t = ensure(flags); if (!t) return { ok: false, reason: 'nosave' };
    if (!bracketById(bracketId)) return { ok: false, reason: 'bad_bracket' };
    if (t.run) return { ok: false, reason: 'inrun' };
    var ses = sessionAt(now);
    if (!ses) return { ok: false, reason: 'closed' };
    if (t.playedKey === ses.key) return { ok: false, reason: 'played' };
    var el = eligible(ch, bracketId);
    if (!el.ok) return el;
    return { ok: true, session: ses };
  }
  function shuffle(ids, rng) {
    var a = ids.slice(), rand = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)) % (i + 1);
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  // Ghi danh: bốc thăm TOÀN BỘ 15 đệ tử (thứ tự bốc = thứ tự đối thủ trên
  // đường đi của người chơi: [0] vòng loại, [1] tứ kết, [2] bán kết,
  // [3] chung kết, [4] tranh hạng ba). Chụp sức người chơi tại thời điểm
  // ghi danh để giữa kỳ đột phá không làm lệch độ khó.
  function register(flags, ch, bracketId, now, rng) {
    var chk = canRegister(flags, ch, bracketId, now);
    if (!chk.ok) return chk;
    var t = ensure(flags);
    var draw = shuffle(DISCIPLES.map(function (d) { return d.id; }), rng);
    t.run = {
      bracket: bracketId, sessionKey: chk.session.key,
      draw: draw, round: 0, phase: 'await', third: false,
      powerTier: num(ch.tier, 0), powerStage: num(ch.stage, 0),
      beaten: [], placement: null
    };
    t.playedKey = chk.session.key;
    return { ok: true, run: t.run, session: chk.session };
  }

  // ---------- Đối thủ + co giãn sức mạnh ----------
  function roundIndexOf(run) {
    if (!run) return 0;
    return run.third ? 2 : run.round;
  }
  function roundNameOf(run) {
    if (!run) return '';
    return run.third ? THIRD_NAME : ROUNDS[run.round];
  }
  function currentDisciple(run) {
    if (!run) return null;
    var idx = run.third ? 4 : run.round;
    return discipleById(run.draw[idx]) || null;
  }
  function baseStats(run) {
    if (run.bracket === 'truc_co') {
      var s = Math.max(0, Math.min(3, run.powerStage || 0));
      return { hp: 430 + 140 * s, atk: 21 + 5 * s };
    }
    var tier = Math.max(0, run.powerTier || 0);
    return { hp: 90 + 22 * tier, atk: 5 + 1.1 * tier };
  }
  function opponentStats(run, disc) {
    var base = baseStats(run);
    var rm = ROUND_MULT[roundIndexOf(run)] || ROUND_MULT[0];
    return {
      hp: Math.max(20, Math.round(base.hp * rm.hp * (disc ? disc.hpMult : 1))),
      atk: Math.max(2, Math.round(base.atk * rm.atk * (disc ? disc.atkMult : 1)))
    };
  }
  // Mô tả spawn cho game.js: quái dạng người trên Võ Đài Đại Hội
  // (map_dai_hoi, đầu đông của đài), render ghi đè sheet hero theo
  // gender/origin của đệ tử (m.discHero). game.js chuyển cảnh người
  // chơi vào đài TRƯỚC khi gọi hàm này (phase còn 'await').
  function startMatch(flags) {
    var t = ensure(flags); if (!t || !t.run) return { ok: false, reason: 'norun' };
    var run = t.run;
    if (run.phase === 'live') return { ok: false, reason: 'live' };
    if (run.phase !== 'await') return { ok: false, reason: 'badphase' };
    var disc = currentDisciple(run);
    if (!disc) return { ok: false, reason: 'nodisc' };
    var st = opponentStats(run, disc);
    run.phase = 'live';
    return {
      ok: true, disciple: disc, roundName: roundNameOf(run),
      spawn: {
        type: OPP_TYPE, x: ARENA.x, y: ARENA.y, mapId: ARENA.mapId,
        extra: { tourn: true, noRespawn: true, linhThach: 0 },
        name: disc.name, hp: st.hp, atk: st.atk,
        discHero: { gender: disc.gender, origin: disc.origin },
        sectName: sectNameOf(disc)
      }
    };
  }

  // ---------- Kết quả trận ----------
  function finishRun(flags, placement, chName) {
    var t = ensure(flags); if (!t || !t.run) return null;
    var run = t.run;
    var bracket = bracketById(run.bracket);
    // Quán quân của kỳ cho bảng vinh danh: người chơi vô địch thì là
    // người chơi; không thì là đệ tử mạnh nhất chưa bị người chơi hạ
    // (nếu thua chung kết thì chính là đối thủ chung kết).
    var champion = null, championIsPlayer = false;
    if (placement === 'quan_quan') { champion = chName || 'Người chơi'; championIsPlayer = true; }
    else if (placement === 'a_quan') { var f = currentDisciple(run); champion = f ? f.name : null; }
    if (!champion) {
      var best = null, bestPow = -1;
      run.draw.forEach(function (id) {
        if (run.beaten.indexOf(id) >= 0) return;
        var d = discipleById(id); if (!d) return;
        var pow = d.hpMult * d.atkMult;
        if (pow > bestPow) { bestPow = pow; best = d; }
      });
      champion = best ? best.name : '—';
    }
    var rewards = rewardsFor(run.bracket, placement);
    if (placement === 'quan_quan') {
      if (run.bracket === 'luyen_khi') t.titleLK = true; else t.titleTC = true;
    }
    t.hall.unshift({ key: run.sessionKey, bracket: run.bracket, champion: champion, isPlayer: championIsPlayer, placement: placement });
    if (t.hall.length > HALL_MAX) t.hall.length = HALL_MAX;
    t.lastResult = {
      bracket: run.bracket, placement: placement, sessionKey: run.sessionKey,
      rewards: rewards, rewarded: false, champion: champion
    };
    t.run = null;
    return { placement: placement, bracket: bracket, rewards: rewards, champion: champion, championIsPlayer: championIsPlayer };
  }
  function reportWin(flags, chName) {
    var t = ensure(flags); if (!t || !t.run) return { ok: false, reason: 'norun' };
    var run = t.run;
    if (run.phase !== 'live') return { ok: false, reason: 'notlive' };
    var disc = currentDisciple(run);
    if (disc) run.beaten.push(disc.id);
    if (run.third) {
      var fin3 = finishRun(flags, 'hang_ba', chName);
      return { ok: true, event: 'finished', result: fin3 };
    }
    if (run.round >= 3) {
      var finC = finishRun(flags, 'quan_quan', chName);
      return { ok: true, event: 'finished', result: finC };
    }
    run.round += 1;
    run.phase = 'await';
    return { ok: true, event: 'advanced', round: run.round, roundName: ROUNDS[run.round], next: currentDisciple(run) };
  }
  function reportLoss(flags, chName, opts) {
    var t = ensure(flags); if (!t || !t.run) return { ok: false, reason: 'norun' };
    var run = t.run;
    if (run.phase !== 'live' && !(opts && opts.fromAwait)) return { ok: false, reason: 'notlive' };
    var forfeit = !!(opts && opts.forfeit);
    if (run.third) {
      var finT = finishRun(flags, 'hang_tu', chName);
      return { ok: true, event: 'finished', result: finT };
    }
    if (run.round === 0) { var f0 = finishRun(flags, 'tham_gia', chName); return { ok: true, event: 'finished', result: f0 }; }
    if (run.round === 1) { var f1 = finishRun(flags, 'tu_ket', chName); return { ok: true, event: 'finished', result: f1 }; }
    if (run.round === 2) {
      if (forfeit) { var f2 = finishRun(flags, 'hang_tu', chName); return { ok: true, event: 'finished', result: f2 }; }
      run.third = true;
      run.phase = 'await';
      return { ok: true, event: 'third', roundName: THIRD_NAME, next: currentDisciple(run) };
    }
    var f3 = finishRun(flags, 'a_quan', chName);
    return { ok: true, event: 'finished', result: f3 };
  }
  // Bỏ cuộc: từ trạng thái chờ (chưa vào trận) hoặc đang đấu — tính như
  // thua trận hiện tại nhưng KHÔNG được đánh tranh hạng ba.
  function forfeit(flags, chName) {
    var t = ensure(flags); if (!t || !t.run) return { ok: false, reason: 'norun' };
    if (t.run.phase === 'await') t.run.phase = 'live';
    return reportLoss(flags, chName, { forfeit: true, fromAwait: true });
  }

  // ---------- Thưởng ----------
  function rewardsFor(bracketId, placement) {
    var b = bracketById(bracketId);
    if (!b || !b.rewards[placement]) return [];
    return b.rewards[placement].map(function (r) {
      var e = { kind: r.kind };
      if (r.id) e.id = r.id;
      if (r.n) e.n = r.n;
      return e;
    });
  }
  // game.js gọi NGAY khi một run kết thúc: phát thưởng đúng 1 lần.
  function claimRewards(flags) {
    var t = ensure(flags); if (!t || !t.lastResult) return null;
    if (t.lastResult.rewarded) return null;
    t.lastResult.rewarded = true;
    return t.lastResult.rewards;
  }
  function titleText(flags) {
    var t = ensure(flags); if (!t) return null;
    if (t.titleTC) return BRACKETS.truc_co.titleText;
    if (t.titleLK) return BRACKETS.luyen_khi.titleText;
    return null;
  }
  function placementLabel(p) { return PLACEMENTS[p] ? PLACEMENTS[p].label : p; }

  // ---------- Thoại Chấp Sự (game.js ưu tiên trước thoại mặc định) ----
  function dialogueFor(npcId, flags, ch, now) {
    if (npcId !== STEWARD.id) return null;
    var t = ensure(flags); if (!t) return null;
    var st = status(flags, ch, now);
    if (t.run) {
      var disc = currentDisciple(t.run);
      return ['Đại Hội đang giữa chừng của ngươi đấy — ' + roundNameOf(t.run) + (disc ? ', đối thủ là ' + discipleLabel(disc) : '') + '.',
        'Bấm "Vào trận" là ta đưa ngươi vào Võ Đài Đại Hội. Nhớ luật đài: bước xuống khỏi đài giữa trận là xử thua. Thắng thì lên vòng, thua thì dừng — ta ghi sổ rõ ràng, không ai thiệt.'];
    }
    if (t.lastResult && !t.lastResult.rewarded) {
      return ['Sổ của ta ghi: ngươi đạt ' + placementLabel(t.lastResult.placement) + ' ở ' + bracketById(t.lastResult.bracket).name + '. Phần thưởng ta trao ngay đây.'];
    }
    if (!st.open) {
      var nx = st.next;
      return ['Đại Hội Tu Tiên là dịp mười tông giao lưu tỉ thí — đệ tử các tông đấu giao hữu, thắng thua có thưởng, quan trọng là học lẫn nhau.',
        'Phiên tới ' + (nx.dayOffset ? 'ngày mai ' : '') + 'mở ghi danh lúc ' + fmtClock(nx.regStart) + ', khai mạc ' + fmtClock(nx.start) + '. Tới sớm kẻo hết phiên.'];
    }
    var lines = ['Đại Hội đang ' + (st.session.phase === 'reg' ? 'mở ghi danh — sắp tới giờ khai mạc.' : 'diễn ra, còn ghi danh được trong phiên này.'),
      'Bảng Luyện Khí cần ' + BRACKETS.luyen_khi.condText.toLowerCase() + '; bảng Trúc Cơ chỉ dành cho người ' + BRACKETS.truc_co.condText.toLowerCase() + '. Mỗi kỳ chỉ được đấu một bảng.'];
    if (st.playedThis) lines.push('Kỳ này ngươi đã đấu rồi. Nghỉ ngơi đi, phiên sau quay lại.');
    return lines;
  }
  function fmtClock(ms) { var d = new Date(ms); function p(n) { return (n < 10 ? '0' : '') + n; } return p(d.getHours()) + ':' + p(d.getMinutes()); }

  var api = {
    STEWARD: STEWARD, ARENA: ARENA, ARENA_MAP: ARENA_MAP, registerMaps: registerMaps,
    inRing: inRing, isArenaMap: function (id) { return id === ARENA.mapId; },
    OPP_TYPE: OPP_TYPE,
    SESSIONS: SESSIONS, REG_BEFORE_MIN: REG_BEFORE_MIN, DUR_MIN: DUR_MIN,
    ROUNDS: ROUNDS, THIRD_NAME: THIRD_NAME, PLACEMENTS: PLACEMENTS, ROUND_MULT: ROUND_MULT,
    BRACKETS: BRACKETS, bracketById: bracketById,
    DISCIPLES: DISCIPLES, discipleById: discipleById, sectNameOf: sectNameOf, discipleLabel: discipleLabel,
    ensure: ensure, dayKey: dayKey, sessionAt: sessionAt, nextSession: nextSession,
    rankOf: rankOf, eligible: eligible, status: status,
    canRegister: canRegister, register: register,
    roundIndexOf: roundIndexOf, roundNameOf: roundNameOf, currentDisciple: currentDisciple,
    baseStats: baseStats, opponentStats: opponentStats, startMatch: startMatch,
    reportWin: reportWin, reportLoss: reportLoss, forfeit: forfeit,
    rewardsFor: rewardsFor, claimRewards: claimRewards,
    titleText: titleText, placementLabel: placementLabel, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_TOURNAMENT = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
