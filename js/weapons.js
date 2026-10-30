// Phàm Nhân Tu Đạo — hệ thống VŨ KHÍ (dữ liệu + luật thuần + vẽ, test bằng Node).
// Thiết kế:
// - Vũ khí là từng món riêng trong túi đồ: mỗi món là một entry
//   { id, count: 1, uid, w: 1 } trong ch.inventory (không cộng dồn như vật
//   phẩm thường), món đang đeo ghi ở ch.equipUid. Save cũ không có các
//   trường này vẫn nạp được nhờ ensureWeapons() khởi tạo lười + tặng kèm
//   vũ khí khởi đầu "Kiếm Gỗ Đào" đã đeo sẵn.
// - Công vũ khí cộng vào công nhân vật qua Logic.effAtk (logic.js tra cứu
//   lười PNT_WEAPONS.weaponAtk): đánh thường hưởng 100% công vũ khí; chiêu
//   thức (toàn bộ là kiếm chiêu) hưởng 100% nếu vũ khí là Kiếm, 70% nếu là
//   loại khác — đeo loại khác vẫn mạnh lên thật nhưng kiếm vẫn là "chính đạo"
//   của bộ skill hiện tại.
// - Hệ phẩm của game cho vật phẩm thường vốn chưa có thang phẩm; thang ở đây
//   bám thang phẩm tu tiên chuẩn và giọng đặt tên của game:
//   Phàm phẩm -> Linh phẩm -> Huyền phẩm -> Địa phẩm -> Thiên phẩm.
// - CHỈ SỐ PHỤ THEO PHẨM (v7): Phàm/Linh chỉ có công chính. Từ Huyền phẩm,
//   mỗi món có thêm khối `stats`; Địa phẩm 2 dòng, Thiên phẩm 3 dòng cộng
//   1 `proc` — hiệu ứng riêng ký danh chạy thật trong combat.
//   ĐỊNH DẠNG KHỐI CHỈ SỐ DÙNG CHUNG (mọi hệ trang bị PHẢI bám đúng —
//   pháp khí ở js/artifacts.js dùng y hệt định dạng này; Logic.statTotals
//   ở logic.js là nơi cộng dồn tất cả):
//     stats: { hp, def, crit, critDmg, lifesteal, ll, llRegen, speed,
//              elem: { <id linh căn: kim/moc/thuy/hoa/tho/phong/loi/bang>: % } }
//       hp/def/ll: cộng thẳng (điểm). llRegen: điểm linh lực/giây.
//       crit/critDmg/lifesteal/speed/elem: phần trăm. Thiếu khóa = 0.
//     proc: { kind: 'meteor'|'burst'|'chain'|'burn'|'freeze', chance: %,
//             name, desc, ...tham số theo kind (dmgPct, dur, count...) }.
//   Pháp khí đeo qua 2 ô ch.artSlots, Logic tự đọc khối stats của chúng
//   qua PNT_ARTIFACTS.equippedDefs(ch); hiệu ứng fx/signature của pháp khí
//   do module pháp khí tự chạy, không đi qua proc của vũ khí.
// - Hình vũ khí: lưới điểm 16x16 vẽ theo loại, bảng màu theo phẩm (thép xám
//   phàm phẩm -> vàng trắng thiên phẩm). Điểm khớp nối với team động tác:
//   vũ khí là LỚP VẼ ĐỘC LẬP gắn theo tay nhân vật — game.js gọi drawHeld()
//   sau khi vẽ sprite người; khi team động tác có frame vung kiếm riêng, chỉ
//   cần truyền anchor (điểm tay) khác vào drawHeldAt() là khớp.
(function () {
  'use strict';
  // ---------- Loại + phẩm ----------
  var TYPES = {
    kiem: { name: 'Kiếm' },
    dao: { name: 'Đao' },
    thuong: { name: 'Thương' },
    cung: { name: 'Cung' },
    truong: { name: 'Pháp Trượng' }
  };
  var GRADES = {
    pham: { name: 'Phàm phẩm', rank: 0, glow: null },
    linh: { name: 'Linh phẩm', rank: 1, glow: '#7fe8d6' },
    huyen: { name: 'Huyền phẩm', rank: 2, glow: '#cfa6ff' },
    dia: { name: 'Địa phẩm', rank: 3, glow: '#ffb84e' },
    thien: { name: 'Thiên phẩm', rank: 4, glow: '#ffe98a' }
  };
  // Bảng màu lưới theo phẩm: b = thân/lưỡi chính, B = cạnh sáng, d = sống tối,
  // g = chắn tay/kim loại phụ, o = ngọc/điểm nhấn. h/H/s là màu chung mọi phẩm.
  var GRADE_PALETTES = {
    pham: { b: '#9aa0a8', B: '#dde1e6', d: '#5a5f66', g: '#8b5a2b', o: '#7a7f87' },
    linh: { b: '#a8c8d8', B: '#eefaff', d: '#527a94', g: '#c9a44e', o: '#3fd6c0' },
    huyen: { b: '#9a7fd0', B: '#e2d6ff', d: '#463270', g: '#8a6fd0', o: '#cfa6ff' },
    dia: { b: '#d8a84e', B: '#ffeda8', d: '#7a5220', g: '#f2c14e', o: '#ff8a3c' },
    thien: { b: '#ffe98a', B: '#fffbe8', d: '#a87f2e', g: '#fff2b0', o: '#7fe8ff' }
  };
  var COMMON_PALETTE = { h: '#6b4a2a', H: '#3a2a1a', s: '#e8e4da', f: '#c0392b' };
  function paletteFor(grade) {
    var p = {}, k;
    for (k in COMMON_PALETTE) p[k] = COMMON_PALETTE[k];
    var g = GRADE_PALETTES[grade] || GRADE_PALETTES.pham;
    for (k in g) p[k] = g[k];
    return p;
  }
  // ---------- Danh mục vũ khí (5 loại x 6 bậc = 30 món) ----------
  // atk: cộng thẳng vào công. reqTier: tầng Luyện Khí tối thiểu để đeo
  // (0 = phàm nhân đeo được). price: giá bán ở lò rèn Thiết Cường (0 = không
  // bán). value: giá thợ rèn thu mua lại.
  var WEAPONS = {
    // --- Kiếm (loại chính của bộ skill) ---
    kiem_go: { id: 'kiem_go', type: 'kiem', grade: 'pham', name: 'Kiếm Gỗ Đào', atk: 2, reqTier: 0, price: 0, value: 5,
      desc: 'Kiếm gỗ tập võ của trẻ làng Thanh Khê. Nhẹ tay, lành tính, là bạn đồng hành đầu tiên của người mới bước lên đường tu.' },
    kiem_sat: { id: 'kiem_sat', type: 'kiem', grade: 'pham', name: 'Thiết Phong Kiếm', atk: 4, reqTier: 0, price: 90, value: 36,
      desc: 'Kiếm sắt rèn tay của Thiết Cường, lưỡi mỏng bén gió, cán quấn da sói chống trượt.' },
    kiem_linh: { id: 'kiem_linh', type: 'kiem', grade: 'linh', name: 'Thanh Linh Kiếm', atk: 7, reqTier: 1, price: 520, value: 128,
      desc: 'Lưỡi kiếm ánh xanh linh quang, dẫn linh khí chạy dọc thân kiếm khi vận công.' },
    kiem_huyen: { id: 'kiem_huyen', type: 'kiem', grade: 'huyen', name: 'Huyền Băng Kiếm', atk: 11, reqTier: 2, price: 0, value: 260,
      stats: { elem: { bang: 12 } },
      desc: 'Kiếm rèn từ huyền thiết chôn dưới suối lạnh, quanh năm tỏa hơi sương, chém trúng để lại vệt băng mỏng.' },
    kiem_dia: { id: 'kiem_dia', type: 'kiem', grade: 'dia', name: 'Trấn Nhạc Kiếm', atk: 16, reqTier: 3, price: 0, value: 520,
      stats: { hp: 35, def: 5 },
      desc: 'Trọng kiếm khắc phù trấn sơn, nặng như đeo núi trên tay, một chém xuống đất rung.' },
    kiem_thien: { id: 'kiem_thien', type: 'kiem', grade: 'thien', name: 'Lưu Tinh Thiên Kiếm', atk: 22, reqTier: 3, price: 0, value: 1100,
      stats: { crit: 14, critDmg: 50, speed: 8 },
      proc: { kind: 'meteor', chance: 15, dmgPct: 55, splashPct: 30, name: 'Lưu Tinh Trụy', desc: 'Tỉ lệ 15%: sao băng giáng xuống mục tiêu, gây thêm 55% sát thương của đòn đánh và lan 30% sang kẻ địch gần nhất.' },
      desc: 'Đúc từ thiên thạch rơi sau núi Thanh Sơn, lưỡi kiếm tự phát sáng như sao băng xẹt qua trời đêm.' },
    // --- Đao ---
    dao_cui: { id: 'dao_cui', type: 'dao', grade: 'pham', name: 'Đao Bổ Củi', atk: 3, reqTier: 0, price: 70, value: 28,
      desc: 'Đao bổ củi của dân làng, lưỡi dày nặng, bổ củi hay bổ sói đều thuận tay.' },
    dao_sat: { id: 'dao_sat', type: 'dao', grade: 'pham', name: 'Hổ Đầu Đao', atk: 5, reqTier: 0, price: 130, value: 52,
      desc: 'Chuôi đao khắc đầu hổ, lưỡi cong rộng, chém xả mạnh như hổ vồ.' },
    dao_linh: { id: 'dao_linh', type: 'dao', grade: 'linh', name: 'Linh Phong Đao', atk: 8, reqTier: 1, price: 600, value: 152,
      desc: 'Đao mỏng nhẹ dẫn gió, vung lên nghe tiếng rít như gió luồn khe núi.' },
    dao_huyen: { id: 'dao_huyen', type: 'dao', grade: 'huyen', name: 'Huyền Thiết Trọng Đao', atk: 13, reqTier: 2, price: 0, value: 320,
      stats: { hp: 25 },
      desc: 'Đao huyền thiết đen tuyền, không bén ở lưỡi mà thắng ở sức nặng nghìn cân.' },
    dao_son_quan: { id: 'dao_son_quan', type: 'dao', grade: 'dia', name: 'Nanh Quân Huyết Đao', atk: 18, reqTier: 2, price: 0, value: 640, signature: true,
      stats: { lifesteal: 8, critDmg: 30 },
      desc: 'Ký danh của Sơn Quân: rèn từ chính chiếc nanh của lợn vương, vệt đỏ sậm trên sống đao là huyết khí trăm năm chưa tan. Chỉ rơi từ Sơn Quân.' },
    dao_thien: { id: 'dao_thien', type: 'dao', grade: 'thien', name: 'Trảm Thiên Đao', atk: 24, reqTier: 3, price: 0, value: 1200,
      stats: { crit: 12, lifesteal: 9, hp: 40 },
      proc: { kind: 'burst', chance: 12, dmgPct: 40, healPct: 8, name: 'Phệ Huyết Trảm', desc: 'Tỉ lệ 12%: đòn chém bùng nổ huyết khí, gây thêm 40% sát thương và hồi ngay 8% HP tối đa.' },
      desc: 'Đao ý "một đao trảm thiên", lưỡi vàng trắng chói mắt, là đỉnh cao mà lò rèn làng Thanh Khê có thể đúc.' },
    // --- Thương ---
    thuong_tre: { id: 'thuong_tre', type: 'thuong', grade: 'pham', name: 'Thương Tre Vót Nhọn', atk: 3, reqTier: 0, price: 60, value: 24,
      desc: 'Cán tre già vót nhọn, nhẹ và dài, giữ khoảng cách an toàn với thú dữ.' },
    thuong_sat: { id: 'thuong_sat', type: 'thuong', grade: 'pham', name: 'Thiết Đầu Thương', atk: 5, reqTier: 0, price: 120, value: 48,
      desc: 'Đầu thương thép gắn cán sồi, tua đỏ phấp phới, đâm xa trúng sâu.' },
    thuong_linh: { id: 'thuong_linh', type: 'thuong', grade: 'linh', name: 'Ngân Linh Thương', atk: 8, reqTier: 1, price: 580, value: 144,
      desc: 'Mũi thương bạc ánh linh quang, đâm ra có tiếng ngân như chuông nhỏ.' },
    thuong_huyen: { id: 'thuong_huyen', type: 'thuong', grade: 'huyen', name: 'Huyền Long Thương', atk: 12, reqTier: 2, price: 0, value: 300,
      stats: { crit: 7 },
      desc: 'Thân thương khắc vảy rồng chìm, mũi thương tím sẫm như nanh rồng.' },
    thuong_dia: { id: 'thuong_dia', type: 'thuong', grade: 'dia', name: 'Phá Quân Thương', atk: 17, reqTier: 3, price: 0, value: 560,
      stats: { crit: 10, critDmg: 35 },
      desc: 'Thương phá quân trận, một đâm xuyên ba lớp giáp, khí thế như chẻ tre.' },
    thuong_thien: { id: 'thuong_thien', type: 'thuong', grade: 'thien', name: 'Thiên Long Phá Vân Thương', atk: 23, reqTier: 3, price: 0, value: 1150,
      stats: { crit: 14, speed: 8, elem: { loi: 20 } },
      proc: { kind: 'chain', chance: 15, count: 2, dmgPct: 40, name: 'Long Lôi', desc: 'Tỉ lệ 15%: long lôi từ mũi thương lan sang tối đa 2 kẻ địch gần nhất, mỗi tia gây 40% sát thương của đòn đánh.' },
      desc: 'Thương vàng trắng khắc rồng vờn mây, đâm ra nghe như rồng gầm giữa tầng mây.' },
    // --- Cung ---
    cung_tre: { id: 'cung_tre', type: 'cung', grade: 'pham', name: 'Cung Tre Săn Bắn', atk: 2, reqTier: 0, price: 55, value: 22,
      desc: 'Cung tre của thợ săn làng, tầm gần nhưng bắn nhanh, đủ hạ gà rừng thỏ hoang.' },
    cung_sat: { id: 'cung_sat', type: 'cung', grade: 'pham', name: 'Giác Cung', atk: 4, reqTier: 0, price: 110, value: 44,
      desc: 'Cánh cung ghép sừng và gân thú, sức kéo căng, tên đi thẳng.' },
    cung_linh: { id: 'cung_linh', type: 'cung', grade: 'linh', name: 'Linh Vũ Cung', atk: 7, reqTier: 1, price: 540, value: 132,
      desc: 'Cung khảm lông linh điểu, tên bay êm và xa hơn hẳn cung thường.' },
    cung_huyen: { id: 'cung_huyen', type: 'cung', grade: 'huyen', name: 'Huyền Nguyệt Cung', atk: 11, reqTier: 2, price: 0, value: 280,
      stats: { speed: 5 },
      desc: 'Cánh cung cong như trăng khuyết tím sẫm, bắn trong đêm ánh lên vệt sáng mờ.' },
    cung_dia: { id: 'cung_dia', type: 'cung', grade: 'dia', name: 'Xuyên Vân Cung', atk: 16, reqTier: 3, price: 0, value: 540,
      stats: { crit: 11, speed: 7 },
      desc: 'Cung mạnh tới mức tên xuyên qua mây mù trên đỉnh Thanh Sơn mà lực chưa giảm.' },
    cung_thien: { id: 'cung_thien', type: 'cung', grade: 'thien', name: 'Lạc Nhật Thiên Cung', atk: 22, reqTier: 3, price: 0, value: 1100,
      stats: { crit: 15, critDmg: 45, speed: 8 },
      proc: { kind: 'burn', chance: 20, dur: 3, dmgPct: 15, name: 'Liệu Nhật', desc: 'Tỉ lệ 20%: tên mang lửa mặt trời thiêu đốt mục tiêu 3 giây, mỗi giây chịu thêm 15% sát thương của đòn bắn.' },
      desc: 'Cung vàng trắng mang ý "bắn rơi mặt trời", là bảo vật trấn lò của thợ rèn Thanh Khê.' },
    // --- Pháp Trượng ---
    truong_go: { id: 'truong_go', type: 'truong', grade: 'pham', name: 'Trượng Gỗ Đào', atk: 2, reqTier: 0, price: 50, value: 20,
      desc: 'Trượng gỗ đào trừ tà của thầy cúng làng, đầu trượng buộc chuông đồng nhỏ.' },
    truong_sat: { id: 'truong_sat', type: 'truong', grade: 'pham', name: 'Đồng Tâm Trượng', atk: 4, reqTier: 0, price: 100, value: 40,
      desc: 'Trượng đồng nguyên khối, đầu trượng đúc vòng đồng tâm dẫn linh khí ổn định.' },
    truong_linh: { id: 'truong_linh', type: 'truong', grade: 'linh', name: 'Linh Ngọc Trượng', atk: 7, reqTier: 1, price: 560, value: 136,
      desc: 'Đầu trượng gắn linh ngọc xanh biếc, thổ nạp cạnh trượng cũng thấy linh khí tụ nhanh hơn.' },
    truong_huyen: { id: 'truong_huyen', type: 'truong', grade: 'huyen', name: 'Huyền Tinh Trượng', atk: 12, reqTier: 2, price: 0, value: 310,
      stats: { ll: 20 },
      desc: 'Tinh thạch tím gắn trên trượng gỗ nghìn năm, đêm xuống tự phát sáng như sao.' },
    truong_dia: { id: 'truong_dia', type: 'truong', grade: 'dia', name: 'Địa Linh Pháp Trượng', atk: 17, reqTier: 3, price: 0, value: 570,
      stats: { ll: 30, elem: { tho: 16 } },
      desc: 'Trượng dẫn địa mạch, cắm xuống đất là cảm được linh khí cả vùng Thanh Sơn.' },
    truong_thien: { id: 'truong_thien', type: 'truong', grade: 'thien', name: 'Thiên Cơ Trượng', atk: 23, reqTier: 3, price: 0, value: 1150,
      stats: { ll: 45, llRegen: 3, elem: { bang: 20 } },
      proc: { kind: 'freeze', chance: 18, dur: 1.2, name: 'Hàn Tinh Ấn', desc: 'Tỉ lệ 18%: hàn khí thiên cơ bùng ra đóng băng mục tiêu 1,2 giây, không thể di chuyển.' },
      desc: 'Đầu trượng là thiên cơ cầu trong suốt như chứa cả bầu trời sao, phẩm cao nhất lò rèn đúc nổi.' }
  };
  var START_WEAPON = 'kiem_go';
  // Lò rèn Thiết Cường bán các món price > 0 (phàm + linh phẩm).
  var SHOP = Object.keys(WEAPONS).filter(function (id) { return WEAPONS[id].price > 0; });
  // ---------- Chế tạo tại lò rèn (nguyên liệu sẵn có trong game) ----------
  // fee = công rèn bằng Linh Thạch. reqTier chỉ chặn khi ĐEO (equip), rèn thì không.
  var RECIPES = {
    kiem_sat: { fee: 30, mats: { da_soi: 3 } },
    cung_sat: { fee: 25, mats: { da_soi: 2, long_ga: 4 } },
    dao_linh: { fee: 80, mats: { da_soi: 4, linh_chi: 1 } },
    kiem_huyen: { fee: 140, mats: { da_soi: 5, linh_chi: 2 } },
    dao_huyen: { fee: 150, mats: { da_soi: 6, linh_chi: 2 } },
    kiem_thien: { fee: 400, mats: { da_soi: 8, linh_chi: 3 } },
    dao_thien: { fee: 420, mats: { da_soi: 8, linh_chi: 3 } },
    thuong_thien: { fee: 400, mats: { da_soi: 7, linh_chi: 3, long_ga: 4 } },
    cung_thien: { fee: 400, mats: { da_soi: 6, linh_chi: 3, long_ga: 6 } },
    truong_thien: { fee: 420, mats: { da_soi: 6, linh_chi: 4 } }
  };
  // ---------- Bảng rơi vũ khí theo loài quái (bổ sung cho bảng rơi vật phẩm) ----------
  // Vùng xa/map sau rơi đồ tốt hơn; boss Sơn Quân rơi ký danh 100%.
  var DROPS = {
    ga_rung: [{ id: 'cung_tre', chance: 0.03 }],
    tho_hoang: [],
    soi_con: [{ id: 'kiem_sat', chance: 0.04 }, { id: 'dao_cui', chance: 0.05 }],
    lon_rung: [{ id: 'dao_cui', chance: 0.04 }, { id: 'thuong_tre', chance: 0.05 }, { id: 'truong_go', chance: 0.03 }],
    soi_rung: [{ id: 'kiem_linh', chance: 0.05 }, { id: 'dao_linh', chance: 0.04 }, { id: 'thuong_linh', chance: 0.04 }],
    lon_mong_sat: [{ id: 'dao_huyen', chance: 0.04 }, { id: 'kiem_huyen', chance: 0.03 }, { id: 'thuong_huyen', chance: 0.03 }, { id: 'cung_huyen', chance: 0.02 }, { id: 'truong_huyen', chance: 0.02 }],
    ran_luc: [{ id: 'truong_linh', chance: 0.05 }, { id: 'cung_linh', chance: 0.03 }],
    khi_mat_do: [{ id: 'cung_linh', chance: 0.05 }, { id: 'truong_linh', chance: 0.03 }],
    son_quan: [{ id: 'dao_son_quan', chance: 1 }, { id: 'dao_huyen', chance: 0.2 },
      { id: 'kiem_dia', chance: 0.1 }, { id: 'thuong_dia', chance: 0.1 }, { id: 'cung_dia', chance: 0.1 }, { id: 'truong_dia', chance: 0.1 }]
  };
  // ---------- Trạng thái trên nhân vật ----------
  function isWeaponId(id) { return !!WEAPONS[id]; }
  function weaponDef(id) { return WEAPONS[id] || null; }
  function isWeaponEntry(it) { return !!(it && it.w && WEAPONS[it.id]); }
  function ensureWeapons(ch) {
    if (!ch) return ch;
    if (!Array.isArray(ch.inventory)) ch.inventory = [];
    if (typeof ch.wseq !== 'number' || isNaN(ch.wseq)) ch.wseq = 0;
    if (typeof ch.equipUid === 'undefined') ch.equipUid = null;
    if (!ch.wInit) {
      ch.wInit = true;
      var e = addWeapon(ch, START_WEAPON);
      ch.equipUid = e.uid;
    }
    if (ch.equipUid !== null && !findEntry(ch, ch.equipUid)) ch.equipUid = null;
    return ch;
  }
  function addWeapon(ch, defId) {
    if (!WEAPONS[defId]) return null;
    if (typeof ch.wseq !== 'number' || isNaN(ch.wseq)) ch.wseq = 0;
    ch.wseq += 1;
    var entry = { id: defId, count: 1, uid: ch.wseq, w: 1 };
    ch.inventory.push(entry);
    return entry;
  }
  function findEntry(ch, uid) {
    if (!ch || !Array.isArray(ch.inventory)) return null;
    for (var i = 0; i < ch.inventory.length; i++)
      if (isWeaponEntry(ch.inventory[i]) && ch.inventory[i].uid === uid) return ch.inventory[i];
    return null;
  }
  function weaponEntries(ch) {
    return (ch && Array.isArray(ch.inventory)) ? ch.inventory.filter(isWeaponEntry) : [];
  }
  function equippedEntry(ch) {
    if (!ch || ch.equipUid === null || typeof ch.equipUid === 'undefined') return null;
    return findEntry(ch, ch.equipUid);
  }
  function equippedDef(ch) {
    var e = equippedEntry(ch);
    if (!e) return null;
    var def = WEAPONS[e.id];
    // Cường hoá/tẩy luyện (20:26): món có cấp cường hoá hoặc dòng
    // phụ thì trả BẢN SAO đã hiệu chỉnh (công +%/cấp theo phẩm, dòng
    // phụ gộp vào stats) để Logic.statTotals/weaponAtk hưởng đúng;
    // món thường trả nguyên def gốc (giữ nguyên danh tính object).
    if ((e.enh || 0) > 0 || (e.subs && Object.keys(e.subs).length)) {
      var clone = {};
      for (var k in def) clone[k] = def[k];
      clone.atk = entryAtk(e);
      var st = {};
      if (def.stats) for (var k2 in def.stats) st[k2] = def.stats[k2];
      if (e.subs) for (var k3 in e.subs) st[k3] = (st[k3] || 0) + e.subs[k3];
      clone.stats = st;
      clone._enh = e.enh || 0;
      return clone;
    }
    return def;
  }
  // Công vũ khí cộng vào công nhân vật. forSkill: chiêu thức kiếm hưởng 100%
  // khi cầm Kiếm, 70% khi cầm loại khác; đánh thường luôn 100%.
  function weaponAtk(ch, forSkill) {
    var def = equippedDef(ch);
    if (!def) return 0;
    if (forSkill && def.type !== 'kiem') return Math.floor(def.atk * 0.7);
    return def.atk;
  }
  function canEquip(ch, uid) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = WEAPONS[e.id];
    if ((ch.tier || 0) < def.reqTier) return { ok: false, reason: 'tier', def: def };
    return { ok: true, def: def };
  }
  function equip(ch, uid) {
    var chk = canEquip(ch, uid);
    if (!chk.ok) return chk;
    ch.equipUid = uid;
    return { ok: true, def: chk.def };
  }
  function unequip(ch) {
    var had = equippedDef(ch);
    ch.equipUid = null;
    return { ok: true, def: had };
  }
  function compareDelta(ch, def) {
    var cur = equippedDef(ch);
    return def.atk - (cur ? cur.atk : 0);
  }
  // ---------- Chỉ số phụ + hiệu ứng riêng: hiển thị & so sánh ----------
  var STAT_LABELS = {
    hp: 'HP tối đa', def: 'Giáp', crit: 'Tỉ lệ chí mạng', critDmg: 'Sát thương chí mạng',
    lifesteal: 'Hút máu', ll: 'Linh lực tối đa', llRegen: 'Hồi linh lực', speed: 'Tốc độ di chuyển'
  };
  var STAT_SUFFIX = { hp: '', def: '', crit: '%', critDmg: '%', lifesteal: '%', ll: '', llRegen: '/giây', speed: '%' };
  var STAT_ORDER = ['hp', 'def', 'crit', 'critDmg', 'lifesteal', 'll', 'llRegen', 'speed', 'elem'];
  var ELEM_NAMES = { kim: 'Kim', moc: 'Mộc', thuy: 'Thủy', hoa: 'Hỏa', tho: 'Thổ', phong: 'Phong', loi: 'Lôi', bang: 'Băng' };
  function statBlockOf(def) { return def && def.stats ? def.stats : null; }
  function procOf(def) { return def && def.proc ? def.proc : null; }
  // Khối { stats, proc } của món đang đeo — đúng định dạng Logic.statTotals cộng.
  function equippedBlock(ch) {
    var def = equippedDef(ch);
    if (!def) return null;
    return { stats: def.stats || null, proc: def.proc || null };
  }
  // Mọi dòng chỉ số của một món (công chính trước, rồi từng chỉ số phụ, cuối
  // là hiệu ứng riêng) — dùng cho tooltip túi đồ, lò rèn và ảnh xem trước.
  function statLines(def) {
    var out = ['Công +' + def.atk];
    if (def.stats) {
      STAT_ORDER.forEach(function (k) {
        if (k === 'elem') {
          if (def.stats.elem) Object.keys(def.stats.elem).forEach(function (e) {
            out.push('Sát thương hệ ' + (ELEM_NAMES[e] || e) + ' +' + def.stats.elem[e] + '%');
          });
        } else if (def.stats[k]) {
          out.push(STAT_LABELS[k] + ' +' + def.stats[k] + (STAT_SUFFIX[k] || ''));
        }
      });
    }
    if (def.proc) out.push('Hiệu ứng riêng — ' + def.proc.name + ': ' + def.proc.desc);
    return out;
  }
  // So sánh TỪNG DÒNG giữa món ứng viên và món đang đeo (cho túi đồ):
  // mỗi dòng dạng 'Nhãn: +x' / 'Nhãn: -x' / 'Nhãn: ±0', kèm dòng hiệu ứng riêng.
  function compareLines(ch, def) {
    var cur = equippedDef(ch);
    var out = [];
    function push(label, d, suffix) {
      out.push(label + ': ' + (d > 0 ? '+' + d : (d < 0 ? '' + d : '±0')) + (suffix || ''));
    }
    push('Công', def.atk - (cur ? cur.atk : 0));
    STAT_ORDER.forEach(function (k) {
      if (k === 'elem') {
        var ce = (cur && cur.stats && cur.stats.elem) || {}, ne = (def.stats && def.stats.elem) || {};
        var keys = {};
        Object.keys(ce).forEach(function (e) { keys[e] = 1; });
        Object.keys(ne).forEach(function (e) { keys[e] = 1; });
        Object.keys(keys).forEach(function (e) {
          push('Sát thương hệ ' + (ELEM_NAMES[e] || e), (ne[e] || 0) - (ce[e] || 0), '%');
        });
      } else {
        var cv = cur && cur.stats ? (cur.stats[k] || 0) : 0;
        var nv = def.stats ? (def.stats[k] || 0) : 0;
        if (cv || nv) push(STAT_LABELS[k], nv - cv, STAT_SUFFIX[k]);
      }
    });
    var cp = cur && cur.proc, np = def.proc;
    if (np && !cp) out.push('Hiệu ứng riêng: + ' + np.name);
    else if (!np && cp) out.push('Hiệu ứng riêng: − ' + cp.name);
    else if (np && cp && np.name !== cp.name) {
      out.push('Hiệu ứng riêng: − ' + cp.name);
      out.push('Hiệu ứng riêng: + ' + np.name);
    }
    return out;
  }
  // ---------- Mua / bán / chế tạo ----------
  function sellPrice(def) { return def.value; }
  function buyWeapon(ch, defId, priceOverride) {
    var def = WEAPONS[defId];
    if (!def || def.price <= 0) return { ok: false, reason: 'not_sold' };
    ensureWeapons(ch);
    // Giá giảm theo hảo cảm (js/affinity.js): game.js chỉ truyền giá
    // đã giảm tối đa 10% — chặn mọi mức giảm vượt 10% tại đây để
    // không ai truyền giá rẻ tùy ý qua tham số này.
    var price = def.price;
    if (typeof priceOverride === 'number' && priceOverride >= Math.floor(def.price * 0.9) && priceOverride <= def.price) price = priceOverride;
    if (ch.linhThach < price) return { ok: false, reason: 'linhThach' };
    ch.linhThach -= price;
    var e = addWeapon(ch, defId);
    return { ok: true, entry: e, def: def };
  }
  function sellWeapon(ch, uid) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = WEAPONS[e.id];
    if (e.locked) return { ok: false, reason: 'locked', def: def }; // món đã khoá không bán được (20:26)
    if (ch.equipUid === uid) ch.equipUid = null; // bán món đang đeo: tự tháo trước
    ch.inventory.splice(ch.inventory.indexOf(e), 1);
    var gained = def.value;
    var AC = (typeof globalThis !== 'undefined') ? globalThis.PNT_ANTICHEAT : null; // chống hack: trần bán đồ
    if (AC && typeof AC.guardGain === 'function') gained = AC.guardGain('sell', gained);
    ch.linhThach += gained;
    return { ok: true, def: def, gained: gained };
  }
  // ---------- CƯỜNG HOÁ + TẨY LUYỆN + KHOÁ (lệnh Bui 20:26) ----------
  // Số liệu chuẩn ở docs/economy.md (mục Cường hoá/Tẩy luyện).
  // Trường trên món (nằm trong save theo entry túi đồ): enh (0..10),
  // subs {khoá chỉ số: giá trị}, subsPending (bản lăn chờ chọn),
  // locked (cờ khoá).
  var ENH = {
    MAX: 10,
    PCT: { pham: 4, linh: 3.5, huyen: 3, dia: 2.5, thien: 2 },
    BASE: { pham: 40, linh: 120, huyen: 300, dia: 700, thien: 1500 },
    FAIL: { 6: 0.2, 7: 0.3, 8: 0.4, 9: 0.5, 10: 0.6 },
    MAT_FROM: 5, MAT_ID: 'tinh_van_thach', MAT_NAME: 'Tinh Vẫn Thạch'
  };
  var REFINE = {
    COST_LT: 120, MAT_ID: 'tinh_van_thach', MAT_N: 1, MIN_GRADE_RANK: 2,
    POOL: [
      { k: 'speed', label: 'Tốc độ', min: 2, max: 6 },
      { k: 'crit', label: 'Chí mạng', min: 1, max: 4 },
      { k: 'critDmg', label: 'Sát thương chí mạng', min: 5, max: 12 },
      { k: 'lifesteal', label: 'Hút máu', min: 1, max: 3 }
    ]
  };
  function enhCost(def, targetLv) {
    var lt = Math.round(ENH.BASE[def.grade] * Math.pow(targetLv, 1.6) / 5) * 5;
    return { lt: lt, mats: targetLv >= ENH.MAT_FROM ? 1 : 0 };
  }
  function enhFailRate(targetLv) { return ENH.FAIL[targetLv] || 0; }
  function entryAtk(e) {
    var def = WEAPONS[e.id];
    if (!def) return 0;
    var enh = e.enh || 0;
    if (!enh) return def.atk;
    return Math.floor(def.atk * (1 + ENH.PCT[def.grade] * enh / 100));
  }
  function takeStack(ch, itemId, n) {
    for (var i = 0; i < ch.inventory.length; i++) {
      var it = ch.inventory[i];
      if (it && !it.w && it.id === itemId && (it.count || 1) >= n) {
        it.count -= n;
        if (it.count <= 0) ch.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  function tryEnhance(ch, uid, rng) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = WEAPONS[e.id];
    if (e.locked) return { ok: false, reason: 'locked', def: def };
    var cur = e.enh || 0;
    if (cur >= ENH.MAX) return { ok: false, reason: 'max', def: def, enh: cur };
    var target = cur + 1;
    var cost = enhCost(def, target);
    if ((ch.linhThach || 0) < cost.lt) return { ok: false, reason: 'lt', def: def, cost: cost };
    if (cost.mats && itemCount(ch, ENH.MAT_ID) < cost.mats) return { ok: false, reason: 'mat', def: def, cost: cost };
    ch.linhThach -= cost.lt;
    if (cost.mats) takeStack(ch, ENH.MAT_ID, cost.mats);
    var roll = (typeof rng === 'function' ? rng : Math.random)();
    if (roll < enhFailRate(target)) {
      // Thất bại: mất phí + nguyên liệu, KHÔNG mất món, KHÔNG tụt cấp.
      return { ok: true, success: false, def: def, enh: cur, cost: cost };
    }
    e.enh = target;
    return { ok: true, success: true, def: def, enh: target, cost: cost };
  }
  function refineRoll(rng) {
    var r = typeof rng === 'function' ? rng : Math.random;
    var pool = REFINE.POOL.slice();
    var n = r() < 0.5 ? 2 : 1;
    var out = {};
    for (var i = 0; i < n && pool.length; i++) {
      var idx = Math.floor(r() * pool.length);
      var p = pool.splice(idx, 1)[0];
      out[p.k] = p.min + Math.floor(r() * (p.max - p.min + 1));
    }
    return out;
  }
  function tryRefine(ch, uid, rng) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    var def = WEAPONS[e.id];
    if (e.locked) return { ok: false, reason: 'locked', def: def };
    if ((GRADES[def.grade] ? GRADES[def.grade].rank : 0) < REFINE.MIN_GRADE_RANK)
      return { ok: false, reason: 'grade', def: def };
    if ((ch.linhThach || 0) < REFINE.COST_LT) return { ok: false, reason: 'lt', def: def };
    if (itemCount(ch, REFINE.MAT_ID) < REFINE.MAT_N) return { ok: false, reason: 'mat', def: def };
    ch.linhThach -= REFINE.COST_LT;
    takeStack(ch, REFINE.MAT_ID, REFINE.MAT_N);
    e.subsPending = refineRoll(rng);
    return { ok: true, def: def, pending: e.subsPending };
  }
  function applyRefine(ch, uid, takeNew) {
    var e = findEntry(ch, uid);
    if (!e || !e.subsPending) return { ok: false, reason: 'nopending' };
    if (takeNew) e.subs = e.subsPending;
    var kept = e.subs || null;
    delete e.subsPending;
    return { ok: true, subs: kept };
  }
  function toggleLock(ch, uid) {
    var e = findEntry(ch, uid);
    if (!e) return { ok: false, reason: 'missing' };
    e.locked = !e.locked;
    return { ok: true, locked: !!e.locked, def: WEAPONS[e.id] };
  }
  function itemCount(ch, itemId) {
    var n = 0;
    (ch.inventory || []).forEach(function (it) { if (it.id === itemId && !it.w) n += it.count; });
    return n;
  }
  function takeItems(ch, itemId, n) {
    for (var i = ch.inventory.length - 1; i >= 0 && n > 0; i--) {
      var it = ch.inventory[i];
      if (it.id !== itemId || it.w) continue;
      var take = Math.min(it.count, n);
      it.count -= take; n -= take;
      if (it.count <= 0) ch.inventory.splice(i, 1);
    }
    return n <= 0;
  }
  function canCraft(ch, defId) {
    var r = RECIPES[defId];
    if (!r) return { ok: false, reason: 'no_recipe' };
    if (ch.linhThach < r.fee) return { ok: false, reason: 'linhThach', recipe: r };
    var lack = {};
    Object.keys(r.mats).forEach(function (mid) {
      var have = itemCount(ch, mid);
      if (have < r.mats[mid]) lack[mid] = r.mats[mid] - have;
    });
    if (Object.keys(lack).length) return { ok: false, reason: 'mats', lack: lack, recipe: r };
    return { ok: true, recipe: r };
  }
  function craft(ch, defId) {
    var chk = canCraft(ch, defId);
    if (!chk.ok) return chk;
    var r = chk.recipe;
    Object.keys(r.mats).forEach(function (mid) { takeItems(ch, mid, r.mats[mid]); });
    ch.linhThach -= r.fee;
    var e = addWeapon(ch, defId);
    return { ok: true, entry: e, def: WEAPONS[defId], recipe: r };
  }
  // Rơi vũ khí khi hạ quái: quái thường tối đa 1 món/lần; boss (allowMulti) rơi mọi món trúng bảng.
  function rollDrop(type, rng, allowMulti) {
    var table = DROPS[type] || [];
    var rand = rng || Math.random;
    var out = [];
    for (var i = 0; i < table.length; i++) {
      if (rand() < table[i].chance) {
        out.push(table[i].id);
        if (!allowMulti) break;
      }
    }
    return out;
  }
  // ---------- Hình vũ khí: lưới 16x16 theo loại (mũi/ngọc hướng lên) ----------
  var GRIDS = {
    kiem: [
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '.......Bb.......',
      '....ggggggg.....',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......oo.......'
    ],
    dao: [
      '.......BBb......',
      '......bBBBb.....',
      '......bBBBB.....',
      '......dBBB......',
      '......dBBB......',
      '......dBBB......',
      '......dBBB......',
      '......dBBB......',
      '......dBB.......',
      '.......bb.......',
      '....ggggg.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......oo.......'
    ],
    thuong: [
      '.......BB.......',
      '......bBBb......',
      '.....dbBBbd.....',
      '......bBB.......',
      '......fff.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......'
    ],
    cung: [
      '......bb........',
      '.....b..s.......',
      '....b...s.......',
      '...b....s.......',
      '..b.....s.......',
      '..b.....s.......',
      '..g.....s.......',
      '..b..hhBB.......',
      '..b.....s.......',
      '..b.....s.......',
      '...b....s.......',
      '....b...s.......',
      '.....b..s.......',
      '......bb........',
      '................',
      '................'
    ],
    truong: [
      '.......oo.......',
      '......oBBo......',
      '......oBBo......',
      '.......oo.......',
      '......g..g......',
      '.......gg.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.......oo.......'
    ]
  };
  function flipH(grid) { return grid.map(function (row) { return row.split('').reverse().join(''); }); }
  function flipV(grid) { return grid.slice().reverse(); }
  function rot90cw(grid) {
    var n = grid.length, out = [], r, c;
    for (r = 0; r < n; r++) { var row = ''; for (c = 0; c < n; c++) row += grid[n - 1 - c][r]; out.push(row); }
    return out;
  }
  function rot90ccw(grid) {
    var n = grid.length, out = [], r, c;
    for (r = 0; r < n; r++) { var row = ''; for (c = 0; c < n; c++) row += grid[c][n - 1 - r]; out.push(row); }
    return out;
  }
  // Lưới cầm trên tay theo hướng nhìn: kiếm/đao/thương xoay theo hướng;
  // cung luôn dựng đứng (lật ngang khi quay trái); trượng giữ ngọc hướng lên
  // khi quay xuống/lên, hướng về phía trước khi sang ngang.
  function heldGrid(def, dir) {
    var base = GRIDS[def.type];
    if (def.type === 'cung') return dir === 'left' ? flipH(base) : base;
    if (def.type === 'truong') {
      if (dir === 'right') return rot90cw(base);
      if (dir === 'left') return rot90ccw(base);
      return base;
    }
    if (dir === 'down') return flipV(base);
    if (dir === 'right') return rot90cw(base);
    if (dir === 'left') return rot90ccw(base);
    return base;
  }
  function gridPixels(grid, palette) {
    return grid.map(function (row) {
      return row.split('').map(function (ch) { return palette[ch] || null; });
    });
  }
  function iconPixels(def) { return gridPixels(GRIDS[def.type], paletteFor(def.grade)); }
  function heldPixels(def, dir) { return gridPixels(heldGrid(def, dir), paletteFor(def.grade)); }
  // Điểm tay (theo lưới nhân vật 32x32, gốc ở góc trái-trên sprite): game.js
  // vẽ người ở (px-48, py-96) tỉ lệ 3 -> điểm tay màn hình = gốc + grid*3.
  var HAND = {
    down: { gx: 23.5, gy: 20 },
    up: { gx: 8.5, gy: 20 },
    left: { gx: 5.5, gy: 20 },
    right: { gx: 26.5, gy: 20 }
  };
  function drawPixels(ctx, px, x, y, scale) {
    for (var r = 0; r < px.length; r++)
      for (var c = 0; c < px[r].length; c++)
        if (px[r][c]) { ctx.fillStyle = px[r][c]; ctx.fillRect(x + c * scale, y + r * scale, scale, scale); }
  }
  // Vẽ icon vào ctx tại (x, y) với tỉ lệ scale (16 ô * scale px).
  function drawIcon(ctx, def, x, y, scale) {
    drawPixels(ctx, iconPixels(def), x, y, scale);
  }
  // Vẽ vũ khí đang cầm: tâm lưới trùng điểm tay. quality: 'cao' | 'trung' | 'thap'
  // (khớp khóa đồ hoạ chung 'pnt-gfx-quality'). Cao: hào quang theo phẩm +
  // tỉ lệ 3; Trung bình: hào quang nhẹ chỉ Địa/Thiên phẩm; Thấp: tỉ lệ 2,
  // không hào quang, mất cạnh sáng (bản đơn giản).
  function drawHeldAt(ctx, def, dir, handX, handY, quality) {
    if (!def || !ctx) return;
    var q = quality || 'cao';
    var scale = q === 'thap' ? 2 : 3;
    var grade = GRADES[def.grade];
    if (grade && grade.glow && q !== 'thap') {
      var strong = grade.rank >= 3;
      if (q === 'cao' || strong) {
        if (ctx.save) ctx.save();
        ctx.globalAlpha = q === 'cao' ? (strong ? 0.4 : 0.22) : 0.25;
        ctx.fillStyle = grade.glow;
        ctx.beginPath();
        ctx.arc(handX, handY, strong ? 30 : 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (ctx.restore) ctx.restore();
      }
    }
    var px = heldPixels(def, dir);
    if (q === 'thap') {
      var pal = paletteFor(def.grade);
      px = px.map(function (row) {
        return row.map(function (col) { return col === pal.B ? pal.b : col; });
      });
    }
    var size = 16 * scale;
    drawPixels(ctx, px, handX - size / 2, handY - size / 2, scale);
  }
  // Tiện cho game.js: biết px/py/dir hiện tại của người chơi là vẽ được ngay.
  function drawHeld(ctx, def, dir, px, py, quality) {
    var h = HAND[dir] || HAND.down;
    drawHeldAt(ctx, def, dir, px - 48 + h.gx * 3, py - 96 + h.gy * 3, quality);
  }
  var api = {
    TYPES: TYPES, GRADES: GRADES, GRADE_PALETTES: GRADE_PALETTES,
    WEAPONS: WEAPONS, START_WEAPON: START_WEAPON, SHOP: SHOP, RECIPES: RECIPES, DROPS: DROPS,
    paletteFor: paletteFor,
    isWeaponId: isWeaponId, weaponDef: weaponDef, isWeaponEntry: isWeaponEntry,
    ensureWeapons: ensureWeapons, addWeapon: addWeapon, findEntry: findEntry,
    weaponEntries: weaponEntries, equippedEntry: equippedEntry, equippedDef: equippedDef,
    weaponAtk: weaponAtk, canEquip: canEquip, equip: equip, unequip: unequip, compareDelta: compareDelta,
    STAT_LABELS: STAT_LABELS, STAT_SUFFIX: STAT_SUFFIX, STAT_ORDER: STAT_ORDER, ELEM_NAMES: ELEM_NAMES,
    statBlockOf: statBlockOf, procOf: procOf, equippedBlock: equippedBlock, statLines: statLines, compareLines: compareLines,
    sellPrice: sellPrice, buyWeapon: buyWeapon, sellWeapon: sellWeapon,
    ENH: ENH, REFINE: REFINE, enhCost: enhCost, enhFailRate: enhFailRate,
    entryAtk: entryAtk, tryEnhance: tryEnhance, refineRoll: refineRoll,
    tryRefine: tryRefine, applyRefine: applyRefine, toggleLock: toggleLock,
    itemCount: itemCount, canCraft: canCraft, craft: craft, rollDrop: rollDrop,
    GRIDS: GRIDS, heldGrid: heldGrid, iconPixels: iconPixels, heldPixels: heldPixels,
    HAND: HAND, drawPixels: drawPixels, drawIcon: drawIcon, drawHeldAt: drawHeldAt, drawHeld: drawHeld
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_WEAPONS = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_WEAPONS = api;
})();

