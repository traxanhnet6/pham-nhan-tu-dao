// Phàm Nhân Tu Đạo — HỆ THỐNG Y PHỤC (tủ đồ) + Y PHỤC THEO MÙA + PHÁP BẢO
// SỰ KIỆN LỄ (lệnh Bui 22:32–22:33 ngày 2026-10-29: "tạo hệ thống y phục" +
// "thêm y phục theo mùa, pháp bảo theo sự kiện lễ").
//
// THIẾT KẾ (chốt):
// A. Y PHỤC là lớp NGOẠI HÌNH riêng lưu ở ch.wardrobe (nằm trong nhân vật
//    nên tự đi theo save theo tài khoản). Mặc đè lên ngoại hình gốc, KHÔNG
//    thay chỉ số trang bị chính: mọi bộ THUẦN NGOẠI HÌNH, NGOẠI TRỪ đúng
//    một bộ hiếm nhất (Đại Hội Quán Quân Y, thưởng quán quân Đại Hội) có
//    MỘT dòng chỉ số nhỏ "phong thái" (Tốc độ +3%) chạy thật qua
//    Logic.statTotals (khối lazy trong logic.js, cùng mẫu linh thú).
//    Lớp phủ theo CẢNH GIỚI là TỰ ĐỘNG theo realmRank (js/realms.js
//    drawFormBack/Front, team mỹ thuật vẽ overlay 7 bậc) — KHÔNG nằm
//    trong tủ đồ này. Tủ đồ là lớp SƯU TẦM phủ trên cùng.
//    Quy ước nối hình cho team mỹ thuật: sheet phủ theo costumeId + giới
//    tính, CÙNG định dạng sheet nhân vật chuẩn (hero-ai):
//      assets/costumes-ai/<costumeId>/<gender>/<dir>-<action>.png
//      assets/costumes-md/<costumeId>/<gender>/<dir>-<action>.png
//    (20 frame/dải, ô 192 Cao / 120 Trung bình, neo chân như hero) và đăng
//    ký vào js/costume-ai.js (PNT_COSTUME_AI.types[costumeId] =
//    { cellCao: 192, cellTrung: 120, genders: ['nam','nu'] }).
//    LUẬT CỦA BUI: bộ nào manifest CHƯA có hình thì ẨN HẲN khỏi tủ (không
//    placeholder, không mua/mặc được qua panel) — quyền sở hữu do thưởng
//    cấp vẫn ghi nhận, hình về là tự hiện. Test dùng hook _registerArt.
// B. Y PHỤC THEO MÙA: 4 mùa theo THÁNG DƯƠNG LỊCH thật của máy người chơi
//    (Xuân 1–3, Hạ 4–6, Thu 7–9, Đông 10–12), mỗi mùa 1 bộ, CHỈ MUA ĐƯỢC
//    TRONG MÙA của nó (panel hiện bộ mùa khác kèm chữ "Hết mùa"); hết mùa
//    bộ đã mua vẫn mặc bình thường.
// C. PHÁP BẢO LỄ: 5 lễ theo lịch thật (Nguyên Đán/Đoan Ngọ/Thất Tịch/
//    Trung Thu theo ngày ÂM LỊCH tra bảng 2025–2032 + cửa sổ quanh ngày
//    lễ; Hàn Thực theo lịch dương cố định 2–6/4). Mỗi lễ 1 pháp bảo GIỚI
//    HẠN đăng ký vào PNT_ARTIFACTS (cùng 16 món thường: đeo 2 ô, kích
//    hoạt phím 6/7 qua đúng luật artifacts.js — active chỉ dùng 2 kind
//    engine đã chạy được: 'mark'; sức mạnh NGANG pháp bảo cùng bậc,
//    khan hiếm nằm ở ngoại hình + cửa sổ lễ). Nhận bằng CHUỖI 4 VIỆC LỄ
//    (festQuest, logic.js availableQuests bỏ qua như sectQuest/sectArc)
//    do NPC lễ Dì Tư (id 'le_su', làng Thanh Khê) giao trong cửa sổ lễ;
//    việc cuối nộp VẬT PHẨM LỄ (token rơi từ thưởng các việc trước) mới
//    nhận pháp bảo. Ngoài cửa sổ: không nhận việc mới, việc cuối không
//    trả được (không còn nguồn pháp bảo mới); người đã có giữ dùng. Chuỗi
//    làm lại được MỖI NĂM (mở cửa sổ năm mới thì reset lượt của năm đó).
// Mọi tên riêng (bộ y phục, lễ, pháp bảo, NPC) là ĐỀ XUẤT chờ Bui chốt.
(function () {
  'use strict';
  var L = null, ART = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { ART = require('./artifacts.js'); } catch (e) { ART = null; }
  } else if (typeof window !== 'undefined') {
    L = window.PNT_LOGIC || null;
    ART = window.PNT_ARTIFACTS || null;
  }
  function sectApi() {
    if (typeof window !== 'undefined' && window.PNT_SECT) return window.PNT_SECT;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_SECT) return globalThis.PNT_SECT;
    return null;
  }
  function costumeAiData() {
    if (typeof window !== 'undefined' && window.PNT_COSTUME_AI) return window.PNT_COSTUME_AI;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_COSTUME_AI) return globalThis.PNT_COSTUME_AI;
    return null;
  }

  // ================= PHẦN A — DANH MỤC Y PHỤC =================
  // kind: 'shop' (Linh Thạch, bán thường trực) | 'season' (chỉ trong mùa)
  //     | 'sect' (đổi Điểm Cống Hiến) | 'tournament' (thưởng quán quân).
  // Giá Linh Thạch bám docs/economy.md mục 6.7: đồ sưu tầm là khoản chi
  // xa xỉ — bộ rẻ nhất ~1 giờ farm đầu chặng, bộ đắt ~2 giờ farm cuối
  // chặng Luyện Khí. aura: null = thuần ngoại hình.
  var COSTUMES = {
    thanh_sam_truong_bao: { id: 'thanh_sam_truong_bao', name: 'Thanh Sam Trường Bào', kind: 'shop', price: 300,
      colors: ['#3f6d4e', '#274435', '#c9a959'],
      desc: 'Trường bào xanh rêu của thư sinh lên kinh ứng thí, may bằng vải thô nhuộm lá. Bộ y phục đầu tiên mà một phàm nhân tu đạo nên có.' },
    huyen_y_da_hanh: { id: 'huyen_y_da_hanh', name: 'Huyền Y Dạ Hành', kind: 'shop', price: 800,
      colors: ['#23242e', '#3a3f52', '#7a4fd0'],
      desc: 'Áo dạ hành đen tuyền viền tím thẫm, đi trong rừng đêm khó bị thú dữ phát hiện — ít nhất là trông nó nói vậy.' },
    bach_y_tien_bao: { id: 'bach_y_tien_bao', name: 'Bạch Y Tiên Bào', kind: 'shop', price: 1500,
      colors: ['#f2eee2', '#cfd6cf', '#d8b45a'],
      desc: 'Bạch bào thêu chỉ bạc, tà áo không vướng bụi đường. Mặc vào tự nhiên thấy mình nên nói năng nhỏ nhẹ hơn.' },
    kim_van_tien_ao: { id: 'kim_van_tien_ao', name: 'Kim Vân Tiên Áo', kind: 'shop', price: 2600,
      colors: ['#8a6d1f', '#f2c14e', '#fff2b0'],
      desc: 'Áo gấm thêu mây vàng cuốn quanh thân, là loại vải các trưởng lão tông môn mặc ngày đại lễ. Đắt bằng mấy tháng cày cuốc của một tu sĩ trẻ.' },
    dao_hoa_xuan_y: { id: 'dao_hoa_xuan_y', name: 'Đào Hoa Xuân Y', kind: 'season', season: 'xuan', price: 600,
      colors: ['#e8a0b4', '#f6d7de', '#7fae6e'],
      desc: 'Y phục mùa xuân thêu hoa đào rơi, viền tay áo điểm lá non. Chỉ bán trong mùa xuân (tháng 1–3).' },
    lien_ha_bich_y: { id: 'lien_ha_bich_y', name: 'Liên Hạ Bích Y', kind: 'season', season: 'ha', price: 600,
      colors: ['#2e7a6a', '#8fd0c2', '#e87fa1'],
      desc: 'Y phục mùa hạ xanh biếc thêu lá sen và một nụ sen hồng, vải mỏng mát cho những ngày nắng gắt. Chỉ bán trong mùa hạ (tháng 4–6).' },
    thu_nguyet_phong_y: { id: 'thu_nguyet_phong_y', name: 'Thu Nguyệt Phong Y', kind: 'season', season: 'thu', price: 600,
      colors: ['#a8542e', '#d88f3c', '#f2e3b3'],
      desc: 'Y phục mùa thu thêu lá phong đỏ dưới trăng rằm, màu áo trầm ấm như chiều cuối thu. Chỉ bán trong mùa thu (tháng 7–9).' },
    tuyet_vien_dong_ao: { id: 'tuyet_vien_dong_ao', name: 'Tuyết Viên Đông Áo', kind: 'season', season: 'dong', price: 700,
      colors: ['#5a6d82', '#e8edf2', '#c9ccd4'],
      desc: 'Áo đông dày viền lông trắng như tuyết phủ, cổ áo cao chắn gió núi. Chỉ bán trong mùa đông (tháng 10–12).' },
    tong_mon_le_phuc: { id: 'tong_mon_le_phuc', name: 'Tông Môn Lễ Phục', kind: 'sect', points: 300,
      colors: ['#3a5f9e', '#f5eeda', '#c9a227'],
      desc: 'Lễ phục trang trọng đổi bằng Điểm Cống Hiến ở tông môn — mặc khi dự lễ bái sư, đại hội, tiếp khách quý của tông.' },
    quan_quan_dai_hoi_y: { id: 'quan_quan_dai_hoi_y', name: 'Đại Hội Quán Quân Y', kind: 'tournament',
      colors: ['#7a3b22', '#f2c14e', '#ffe98a'], aura: { speed: 3 },
      auraText: 'Phong thái quán quân: Tốc độ +3%',
      desc: 'Y phục thêu ấn mười tông môn, chỉ trao cho QUÁN QUÂN Đại Hội Tu Tiên. Bộ duy nhất trong tủ có phong thái thật: người mặc bước đi nhanh nhẹn hơn hẳn (+3% tốc độ).' },
    // ===== ĐỢT 1 (lệnh Bui 20:41 31/10): 8 bộ trang phục CÓ CHỈ SỐ =====
    // Khác các bộ cũ (thuần ngoại hình): 8 bộ này mang khối `stats` chạy
    // thật qua statTotals của module này -> Logic.gearBlocks -> statTotals
    // (cùng đường với aura của Quán Quân Y). Phẩm trải Linh/Huyền/Địa —
    // trang phục KHÔNG lên Thiên ở đợt này. Thang số neo theo pháp bảo
    // cùng phẩm (nhỏ hơn một món gear phòng thân cùng phẩm một bậc).
    // artBatch 1 = đội mỹ thuật đang làm sheet mặc được (Hỏa Phượng, Mặc
    // Ngọc, Kim Lân, Tuyết Liên); artBatch 2 = chờ sheet đợt 2 (Thanh
    // Vân, Bích Hải, Lôi Đình, Tinh Hà): theo luật ẩn đồ chưa vẽ, bộ
    // đợt 2 CHƯA có đường sở hữu nào chạy được trong game (mua bị chặn
    // 'hidden', thưởng sự kiện có cổng hasArt) — sheet về là tự mở.
    // Sheet của 4 bộ đợt 1 là hero look nv14–nv17 trong js/hero-ai.js
    // (trường look/lookGender trên từng bộ dưới đây); game.js lúc khởi
    // động sẽ gọi _registerArt cho bộ có look khớp giới để mở khóa sở
    // hữu + vẽ bằng look đó. 4 bộ đợt 2 không có look nên giữ khóa.
    thanh_van_du_hiep: { id: 'thanh_van_du_hiep', name: 'Thanh Vân Du Hiệp', kind: 'shop', price: 900,
      grade: 'linh', artBatch: 2, colors: ['#7fb2d9', '#eef6ff', '#3f6d9e'],
      stats: { speed: 4 }, auraText: 'Phong thái du hiệp: Tốc độ +4%',
      desc: 'Trường sam xanh mây của hiệp khách giang hồ, vạt áo xẻ cao cho dễ lên ngựa xuống đò. Mặc vào chân như nhẹ đi một bậc.' },
    bich_hai_trieu_sinh: { id: 'bich_hai_trieu_sinh', name: 'Bích Hải Triều Sinh', kind: 'shop', price: 1000,
      grade: 'linh', artBatch: 2, colors: ['#2e7a8a', '#8fd0d8', '#ffd94a'],
      stats: { ll: 8, elem: { thuy: 8 } }, auraText: 'Phong thái triều sinh: Linh lực tối đa +8, sát thương hệ Thủy +8%',
      desc: 'Áo dệt sợi tảo biển bích ngọc, gấu áo thêu sóng triều dâng. Linh khí hệ Thủy quanh người mặc tuần hoàn không dứt.' },
    hoa_phuong_chien_y: { id: 'hoa_phuong_chien_y', name: 'Hỏa Phượng Chiến Y', kind: 'boss',
      grade: 'huyen', artBatch: 1, look: 'nv14', lookGender: 'nu', colors: ['#c93c22', '#ff9a3c', '#ffd94a'],
      stats: { elem: { hoa: 12 }, hp: 25 }, auraText: 'Phong thái hỏa phượng: Sát thương hệ Hỏa +12%, Máu tối đa +25',
      desc: 'Chiến y đỏ rực thêu phượng hoàng lửa bằng chỉ vàng, may từ lông vũ cháy của Hầu Vương Xích Diệm. Chỉ rơi từ boss Xích Diệm — mặc vào như mang theo một mùa hè trên lưng.' },
    mac_ngoc_huyen_y: { id: 'mac_ngoc_huyen_y', name: 'Mặc Ngọc Huyền Y', kind: 'shop', price: 2000,
      grade: 'huyen', artBatch: 1, look: 'nv15', lookGender: 'nam', colors: ['#23242e', '#3a4a44', '#8ff5df'],
      stats: { def: 3, hp: 30 }, auraText: 'Phong thái mặc ngọc: Giáp +3, Máu tối đa +30',
      desc: 'Huyền y đen như mực ngọc, sợi vải dệt lẫn bột ngọc trai đen nên cứng mà mềm. Bộ áo dạ hành đắt nhất quầy may — mặc vào đứng trong bóng tối là mất hút.' },
    loi_dinh_dao_bao: { id: 'loi_dinh_dao_bao', name: 'Lôi Đình Đạo Bào', kind: 'sect', points: 350,
      grade: 'huyen', artBatch: 2, colors: ['#4a3f7a', '#cfa6ff', '#ffe98a'],
      stats: { elem: { loi: 12 }, ll: 12 }, auraText: 'Phong thái lôi đình: Sát thương hệ Lôi +12%, Linh lực tối đa +12',
      desc: 'Đạo bào tím thẫm thêu vân lôi bằng chỉ bạc, đổi bằng Điểm Cống Hiến ở tông môn. Đạo sĩ hành lôi mặc bào này, dẫn sét như dẫn nước.' },
    kim_lan_giap: { id: 'kim_lan_giap', name: 'Kim Lân Giáp', kind: 'boss',
      grade: 'dia', artBatch: 1, look: 'nv16', lookGender: 'nam', colors: ['#8a6d1f', '#f2c14e', '#fff2b0'],
      stats: { def: 5, hp: 40 }, auraText: 'Phong thái kim lân: Giáp +5, Máu tối đa +40',
      desc: 'Giáp vảy vàng rèn từ vảy rụng của Cổ Mãng Vương, mỗi vảy khảm tay lên nền da thú. Chỉ rơi từ Cổ Mãng Vương — mặc vào nghe tiếng vảy khua như chuông nhỏ.' },
    tuyet_lien_tien_y: { id: 'tuyet_lien_tien_y', name: 'Tuyết Liên Tiên Y', kind: 'boss',
      grade: 'dia', artBatch: 1, look: 'nv17', lookGender: 'nu', colors: ['#e8edf2', '#bfe3ff', '#8fd0a2'],
      stats: { hp: 45, llRegen: 0.6 }, auraText: 'Phong thái tuyết liên: Máu tối đa +45, Hồi linh lực +0,6/giây',
      desc: 'Tiên y trắng như tuyết đầu mùa thêu sen băng, may từ cánh Tuyết Liên hái ở Băng Cốc. Chỉ rơi từ Băng Cốc Thiết Bì Vương — mặc vào hơi lạnh quanh thân mà linh khí hồi nhanh lạ thường.' },
    tinh_ha_phap_y: { id: 'tinh_ha_phap_y', name: 'Tinh Hà Pháp Y', kind: 'event',
      grade: 'dia', artBatch: 2, colors: ['#2a2d52', '#7a6fd0', '#ffe98a'],
      stats: { ll: 20, crit: 4 }, auraText: 'Phong thái tinh hà: Linh lực tối đa +20, Chí mạng +4%',
      desc: 'Pháp y thêu dải ngân hà bằng chỉ bạc và hạt tinh thạch, là phần thưởng đặc biệt cho người giữ vững Nam Môn qua trọn Thú Triều. Sao trên áo lấp lánh theo nhịp thở của người mặc.' }
  };
  // Bảng rơi TRANG PHỤC theo boss thế giới (đợt 1) — game.js lăn trong
  // grantBossTableDrops cạnh bảng chính, KHÔNG gộp vào bosses.js (test
  // khóa snapshot bảng boss cũ, như tiền lệ manuals/artifacts). Tỉ lệ
  // 10% bám thang ký danh boss của economy.md (8-12%).
  var BOSS_COSTUME_DROPS = {
    hau_xich_diem: [{ id: 'hoa_phuong_chien_y', chance: 0.10 }],
    co_mang_vuong: [{ id: 'kim_lan_giap', chance: 0.10 }],
    lon_bang_coc: [{ id: 'tuyet_lien_tien_y', chance: 0.10 }]
  };
  function rollBossCostumeDrop(bossId, rng) {
    var table = BOSS_COSTUME_DROPS[bossId] || [];
    var rand = rng || Math.random;
    for (var i = 0; i < table.length; i++) if (rand() < table[i].chance) return table[i].id;
    return null;
  }
  var COSTUME_IDS = Object.keys(COSTUMES);
  var SEASONS = {
    xuan: { id: 'xuan', name: 'Xuân', months: 'tháng 1–3', costume: 'dao_hoa_xuan_y' },
    ha: { id: 'ha', name: 'Hạ', months: 'tháng 4–6', costume: 'lien_ha_bich_y' },
    thu: { id: 'thu', name: 'Thu', months: 'tháng 7–9', costume: 'thu_nguyet_phong_y' },
    dong: { id: 'dong', name: 'Đông', months: 'tháng 10–12', costume: 'tuyet_vien_dong_ao' }
  };
  function seasonOf(now) {
    var m = new Date(typeof now === 'number' ? now : Date.now()).getMonth() + 1;
    return m <= 3 ? 'xuan' : (m <= 6 ? 'ha' : (m <= 9 ? 'thu' : 'dong'));
  }
  function costumeById(id) { return COSTUMES[id] || null; }
  // Hàng shop cho panel Tủ Đồ: bộ thường + 4 bộ mùa (kèm cờ đang trong
  // mùa / đã có hình) — panel tự quyết cách hiện theo luật ẩn đồ chưa vẽ.
  function shopRows(ch, now) {
    var sNow = seasonOf(now);
    return COSTUME_IDS.filter(function (id) {
      return COSTUMES[id].kind === 'shop' || COSTUMES[id].kind === 'season';
    }).map(function (id) {
      var def = COSTUMES[id];
      return { def: def, seasonal: def.kind === 'season', owned: owns(ch, id),
        visible: isVisible(ch, id), inSeason: def.kind !== 'season' || def.season === sNow };
    });
  }

  // ---------- Trạng thái tủ đồ trên nhân vật (đi theo save) ----------
  function ensure(ch) {
    if (!ch) return null;
    if (!ch.wardrobe || typeof ch.wardrobe !== 'object') ch.wardrobe = {};
    var w = ch.wardrobe;
    if (!w.owned || typeof w.owned !== 'object') w.owned = {};
    Object.keys(w.owned).forEach(function (id) { if (!COSTUMES[id]) delete w.owned[id]; });
    if (typeof w.worn !== 'string' || !COSTUMES[w.worn] || !w.owned[w.worn]) w.worn = null;
    if (!w.festYears || typeof w.festYears !== 'object') w.festYears = {};
    return w;
  }
  function owns(ch, id) { var w = ensure(ch); return !!(w && w.owned[id]); }
  function ownedList(ch) { var w = ensure(ch); return w ? COSTUME_IDS.filter(function (id) { return w.owned[id]; }) : []; }
  function wornId(ch) { var w = ensure(ch); return w ? w.worn : null; }
  function wornDef(ch) { var id = wornId(ch); return id ? COSTUMES[id] : null; }

  // ---------- Hình: manifest team mỹ thuật + hook test ----------
  var _artOverride = {};
  function hasArt(id, gender) {
    if (!COSTUMES[id]) return false;
    var ov = _artOverride[id];
    if (ov) {
      if (!gender) return true;
      return (ov.genders || ['nam', 'nu']).indexOf(gender) >= 0;
    }
    var d = costumeAiData();
    if (!d || !d.types || !d.types[id]) return false;
    var t = d.types[id];
    if (gender && t.genders) return t.genders.indexOf(gender) >= 0;
    return true;
  }
  // Bộ HIỆN trong tủ: có hình (theo giới tính nhân vật) mới hiện — luật Bui.
  function isVisible(ch, id) { return hasArt(id, ch ? ch.gender : null); }
  function visibleCostumes(ch) { return COSTUME_IDS.filter(function (id) { return isVisible(ch, id); }); }
  function _registerArt(id, opts) {
    if (!COSTUMES[id]) return false;
    _artOverride[id] = { genders: (opts && opts.genders) || ['nam', 'nu'] };
    return true;
  }
  function _clearArt() { _artOverride = {}; }

  // ---------- Mua / đổi / nhận / mặc ----------
  function grantCostume(ch, id, source) {
    var def = COSTUMES[id];
    if (!def || !ch) return { ok: false, reason: 'unknown' };
    var w = ensure(ch);
    if (w.owned[id]) return { ok: true, already: true, def: def, source: source || '' };
    w.owned[id] = true;
    return { ok: true, def: def, source: source || '' };
  }
  function buyCostume(ch, id, now) {
    var def = COSTUMES[id];
    if (!def) return { ok: false, reason: 'unknown' };
    if (def.kind !== 'shop' && def.kind !== 'season') return { ok: false, reason: 'not_sold_lt' };
    if (!isVisible(ch, id)) return { ok: false, reason: 'hidden', def: def }; // chưa có hình -> ẩn hẳn
    if (owns(ch, id)) return { ok: false, reason: 'owned', def: def };
    if (def.kind === 'season' && seasonOf(now) !== def.season)
      return { ok: false, reason: 'off_season', def: def, season: SEASONS[def.season] };
    if ((ch.linhThach || 0) < def.price) return { ok: false, reason: 'linhThach', def: def };
    ch.linhThach -= def.price;
    ensure(ch).owned[id] = true;
    return { ok: true, def: def };
  }
  function sectPointsBalance(ch) {
    var SP = sectApi();
    if (!SP || typeof SP.pointsOf !== 'function') return null;
    return SP.pointsOf(ch);
  }
  function buyWithSectPoints(ch, flags, id) {
    var def = COSTUMES[id];
    if (!def) return { ok: false, reason: 'unknown' };
    if (def.kind !== 'sect') return { ok: false, reason: 'not_sect', def: def };
    var SP = sectApi();
    if (!SP || typeof SP.spendPoints !== 'function' || typeof SP.pointsOf !== 'function')
      return { ok: false, reason: 'no_sect_api', def: def };
    if (!isVisible(ch, id)) return { ok: false, reason: 'hidden', def: def };
    if (owns(ch, id)) return { ok: false, reason: 'owned', def: def };
    var r = SP.spendPoints(ch, flags, def.points, 'y_phuc:' + id);
    if (!r || !r.ok) return { ok: false, reason: 'points', error: r && r.error, def: def };
    ensure(ch).owned[id] = true;
    return { ok: true, def: def, points: r.points };
  }
  function wearCostume(ch, id) {
    var def = COSTUMES[id];
    if (!def) return { ok: false, reason: 'unknown' };
    if (!owns(ch, id)) return { ok: false, reason: 'not_owned', def: def };
    if (!isVisible(ch, id)) return { ok: false, reason: 'hidden', def: def };
    ensure(ch).worn = id;
    return { ok: true, def: def };
  }
  function unwear(ch) { var w = ensure(ch); if (w) w.worn = null; return { ok: true }; }
  // Khối chỉ số "phong thái" của bộ đang mặc — logic.js gearBlocks cộng
  // qua statTotals. Bộ cũ dùng trường `aura` (chỉ Đại Hội Quán Quân Y);
  // 8 bộ đợt 1 dùng trường `stats` — statTotals nhận cả hai (ưu tiên
  // stats), bộ thuần ngoại hình không có cả hai thì trả null như cũ.
  function statTotals(ch) {
    var def = wornDef(ch);
    if (!def) return null;
    var block = def.stats || def.aura;
    if (!block) return null;
    if (!isVisible(ch, def.id)) return null;
    var s = {};
    Object.keys(block).forEach(function (k) {
      if (k === 'elem' && block.elem) { s.elem = {}; Object.keys(block.elem).forEach(function (e) { s.elem[e] = block.elem[e]; }); }
      else s[k] = block[k];
    });
    return s;
  }
  // Thưởng Đại Hội: quán quân (bảng hall của js/tournament.js có entry
  // isPlayer + placement 1) -> trao Đại Hội Quán Quân Y, mỗi kỳ một lần.
  function syncRewards(ch, flags) {
    var granted = [];
    // Sảnh vinh danh Đại Hội nằm ở flags.tourn.hall (js/tournament.js);
    // mỗi bản ghi: { key, bracket, champion, isPlayer = nhà vô địch CHÍNH
    // LÀ người chơi, placement = hạng của người chơi dạng chuỗi }.
    if (!ch || !flags || !flags.tourn || !Array.isArray(flags.tourn.hall)) return granted;
    var w = ensure(ch);
    if (!w.tournKeys || typeof w.tournKeys !== 'object') w.tournKeys = {};
    flags.tourn.hall.forEach(function (h) {
      if (!h || h.isPlayer !== true || !h.key) return;
      if (w.tournKeys[h.key]) return;
      w.tournKeys[h.key] = true;
      var r = grantCostume(ch, 'quan_quan_dai_hoi_y', 'tournament:' + h.key);
      if (r.ok && !r.already) granted.push(r.def);
    });
    return granted;
  }

  // ================= PHẦN C — LỄ + PHÁP BẢO LỄ =================
  var FEST_NPC = { id: 'le_su', name: 'Dì Tư', title: 'Người lo lễ hội làng Thanh Khê', sprite: 'chu_quan', mapId: 'map1', x: 61, y: 44 } // V7-EXPAND: (33,19)+neo map1 (28,25) // V10: + offset map (12,8), rồi +1 ô đông khi Dì Tư rời ô đường (playtest 12:46);
  // Ngày lễ ÂM LỊCH quy ra dương lịch theo năm (gần đúng, tra lịch vạn
  // niên 2025–2032). Ngoài bảng: dùng ngày của năm gần nhất trong bảng.
  var LUNAR_DATES = {
    nguyen_dan: { 2025: [1, 29], 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3], 2031: [1, 23], 2032: [2, 11] },
    doan_ngo: { 2025: [5, 31], 2026: [6, 19], 2027: [6, 9], 2028: [5, 28], 2029: [6, 16], 2030: [6, 5], 2031: [5, 25], 2032: [6, 13] },
    that_tich: { 2025: [8, 29], 2026: [8, 19], 2027: [8, 8], 2028: [8, 26], 2029: [8, 16], 2030: [9, 4], 2031: [8, 24], 2032: [8, 12] },
    trung_thu: { 2025: [10, 6], 2026: [9, 25], 2027: [9, 15], 2028: [10, 3], 2029: [9, 22], 2030: [10, 12], 2031: [10, 1], 2032: [9, 19] }
  };
  var FESTIVALS = {
    nguyen_dan: { id: 'nguyen_dan', name: 'Tết Nguyên Đán', artifact: 'nguyen_dan_hong_dang', token: 'le_loc_dau_nam', tokenNeed: 5,
      before: 2, after: 6, lunar: true,
      blurb: 'Làng Thanh Khê treo đèn đỏ đón năm mới. Dì Tư lo cỗ bàn và đèn lồng cho cả làng — giúp bà đủ việc, dâng đủ 5 phong Lộc Đầu Năm thì nhận Nguyên Đán Hồng Đăng.' },
    doan_ngo: { id: 'doan_ngo', name: 'Tết Đoan Ngọ', artifact: 'doan_ngo_hung_hoang_chau', token: 'le_ngai_khu_ta', tokenNeed: 5,
      before: 3, after: 3, lunar: true,
      blurb: 'Đoan Ngọ là ngày diệt sâu bọ và trừ tà: rắn độc bò ra nhiều, nhà nhà treo ngải. Gom đủ 5 bó Ngải Khu Tà cho Dì Tư để nhận Hùng Hoàng Châu trấn tà.' },
    that_tich: { id: 'that_tich', name: 'Thất Tịch', artifact: 'that_tich_song_tam_boi', token: 'le_soi_to_hong', tokenNeed: 5,
      before: 2, after: 2, lunar: true,
      blurb: 'Đêm Thất Tịch, quạ bắc cầu Ô Thước cho Ngưu Lang Chức Nữ gặp nhau. Gom đủ 5 Sợi Tơ Hồng dâng lên cầu, nhận Song Tâm Bội làm tin.' },
    trung_thu: { id: 'trung_thu', name: 'Tết Trung Thu', artifact: 'trung_thu_nguyet_hoa_kinh', token: 'le_banh_nguyet_linh', tokenNeed: 5,
      before: 3, after: 3, lunar: true,
      blurb: 'Rằm tháng tám trăng sáng nhất năm, làng làm bánh ngắm trăng ở sân đình. Gom đủ 5 chiếc Bánh Nguyệt Linh cho mâm cỗ rằm, nhận Nguyệt Hoa Kính soi trăng.' },
    han_thuc: { id: 'han_thuc', name: 'Tết Hàn Thực', artifact: 'han_thuc_thanh_liu_hoan', token: 'le_canh_lieu_xanh', tokenNeed: 5,
      solar: { month: 4, day: 4, before: 2, after: 2 },
      blurb: 'Hàn Thực ăn đồ nguội, cắm cành liễu trước cửa nhớ người xưa. Gom đủ 5 Cành Liễu Xanh cho Dì Tư cắm khắp làng, nhận Thanh Liễu Hoàn.' }
  };
  var FEST_IDS = Object.keys(FESTIVALS);
  // Pháp bảo lễ — đăng ký vào ARTIFACTS của artifacts.js lúc nạp module.
  // shape dùng lưới icon CÓ SẴN của artifacts.js (mức Thấp); icon AI
  // riêng ở assets/artifacts-ai|md/<id>.png (tools/art-fest-icons.py),
  // drawIconArt tự nạp theo id nên KHÔNG cần sửa artifact-ai.js.
  var FEST_ARTIFACTS = {
    nguyen_dan_hong_dang: { id: 'nguyen_dan_hong_dang', kind: 'bao', shape: 'dang', grade: 'huyen', name: 'Nguyên Đán Hồng Đăng', reqTier: 1, price: 0, value: 260,
      fx: { tuViPct: 15 }, stats: { ll: 15 },
      fxText: 'Tu vi nhận được tăng 15% (thổ nạp, thưởng nhiệm vụ đều hưởng).',
      desc: 'Đèn lồng đỏ thêu chỉ vàng, quanh năm chỉ thắp trong những ngày Tết Nguyên Đán ở làng Thanh Khê. Linh khí đầu năm tụ trong tim đèn — người cầm đèn đi tới đâu, lộc tới đó. Pháp bảo lễ giới hạn: chỉ nhận được qua chuỗi việc lễ Tết trong cửa sổ lễ.', fest: 'nguyen_dan' },
    doan_ngo_hung_hoang_chau: { id: 'doan_ngo_hung_hoang_chau', kind: 'bao', shape: 'chau', grade: 'huyen', name: 'Đoan Ngọ Hùng Hoàng Châu', reqTier: 1, price: 0, value: 250,
      fx: { dmgRedPct: 10 }, stats: { hp: 25 },
      fxText: 'Giảm 10% mọi sát thương nhận vào.',
      desc: 'Viên châu ngâm hùng hoàng và ngải cứu suốt một mùa Đoan Ngọ, chuyên trấn tà khí và độc khí ngày diệt sâu bọ. Pháp bảo lễ giới hạn: chỉ nhận được qua chuỗi việc lễ Đoan Ngọ trong cửa sổ lễ.', fest: 'doan_ngo' },
    that_tich_song_tam_boi: { id: 'that_tich_song_tam_boi', kind: 'bao', shape: 'boi', grade: 'dia', name: 'Thất Tịch Song Tâm Bội', reqTier: 2, price: 0, value: 540,
      fx: { llRegenPct: 50 }, stats: { crit: 4 },
      active: { name: 'Ô Thước Soi Tâm', mana: 12, cd: 12, kind: 'mark', range: 180, dur: 4, pct: 25 },
      fxText: 'Tốc độ hồi linh lực tăng 50%. Kích hoạt Ô Thước Soi Tâm (12 linh lực): quái quanh bạn bị soi, nhận thêm 25% sát thương trong 4 giây.',
      desc: 'Đôi bội ngọc khắc hai nửa trái tim khép lại thành một, kết bằng sợi tơ hồng dâng trên cầu Ô Thước đêm Thất Tịch. Pháp bảo lễ giới hạn: chỉ nhận được qua chuỗi việc lễ Thất Tịch trong cửa sổ lễ.', fest: 'that_tich' },
    trung_thu_nguyet_hoa_kinh: { id: 'trung_thu_nguyet_hoa_kinh', kind: 'phap', shape: 'kinh', grade: 'dia', name: 'Trung Thu Nguyệt Hoa Kính', reqTier: 2, price: 0, value: 560,
      fx: { kind: 'execute', pct: 20 }, stats: { def: 2 },
      active: { name: 'Nguyệt Soi', mana: 10, cd: 11, kind: 'mark', range: 190, dur: 4, pct: 30 },
      fxText: 'Quái dưới 30% Máu nhận thêm 20% sát thương. Kích hoạt Nguyệt Soi (10 linh lực): quái quanh bạn bị soi, nhận thêm 30% sát thương trong 4 giây.',
      desc: 'Mặt kính đồng hứng trọn ánh trăng rằm tháng tám một đêm không mây, mặt kính lạnh như nước hồ thu. Pháp bảo lễ giới hạn: chỉ nhận được qua chuỗi việc lễ Trung Thu trong cửa sổ lễ.', fest: 'trung_thu' },
    han_thuc_thanh_liu_hoan: { id: 'han_thuc_thanh_liu_hoan', kind: 'bao', shape: 'hat', grade: 'huyen', name: 'Hàn Thực Thanh Liễu Hoàn', reqTier: 1, price: 0, value: 250,
      fx: { healPct: 35 }, stats: { hp: 25 },
      fxText: 'Đan dược và thức ăn hồi máu hiệu quả thêm 35%.',
      desc: 'Vòng hạt kết từ cành liễu non cắm cửa ngày Hàn Thực, hơi lạnh của đồ ăn nguội ngày lễ thấm vào hạt gỗ. Pháp bảo lễ giới hạn: chỉ nhận được qua chuỗi việc lễ Hàn Thực trong cửa sổ lễ.', fest: 'han_thuc' }
  };
  var FEST_TOKENS = {
    le_loc_dau_nam: { name: 'Lộc Đầu Năm', desc: 'Phong bao đỏ nhỏ gói hạt linh khí đầu năm. Vật phẩm lễ Tết Nguyên Đán: gom đủ 5 phong dâng Dì Tư đổi Nguyên Đán Hồng Đăng (chỉ trong những ngày Tết).', heal: 0 },
    le_ngai_khu_ta: { name: 'Ngải Khu Tà', desc: 'Bó ngải cứu buộc chỉ đỏ treo cửa trừ tà ngày Đoan Ngọ. Vật phẩm lễ: gom đủ 5 bó dâng Dì Tư đổi Hùng Hoàng Châu (chỉ trong mùa Đoan Ngọ).', heal: 0 },
    le_soi_to_hong: { name: 'Sợi Tơ Hồng', desc: 'Sợi tơ hồng óng ánh rơi từ cầu Ô Thước đêm Thất Tịch. Vật phẩm lễ: gom đủ 5 sợi dâng Dì Tư đổi Song Tâm Bội (chỉ trong dịp Thất Tịch).', heal: 0 },
    le_banh_nguyet_linh: { name: 'Bánh Nguyệt Linh', desc: 'Bánh nướng nhân linh dược của làng Thanh Khê, in hình mặt trăng. Vật phẩm lễ: gom đủ 5 chiếc cho mâm cỗ rằm đổi Nguyệt Hoa Kính (chỉ trong dịp Trung Thu).', heal: 0 },
    le_canh_lieu_xanh: { name: 'Cành Liễu Xanh', desc: 'Cành liễu non cắm cửa ngày Hàn Thực, nhớ người xưa, giữ nhà yên. Vật phẩm lễ: gom đủ 5 cành dâng Dì Tư đổi Thanh Liễu Hoàn (chỉ trong dịp Hàn Thực).', heal: 0 }
  };
  // Chuỗi 4 việc lễ / lễ. festQuest: logic.js availableQuests bỏ qua,
  // module này quản theo cửa sổ lễ (như sectQuest/sectArc). Việc 2+3
  // thưởng VẬT PHẨM LỄ (2 + 3 = 5 = tokenNeed), việc cuối (festFinal)
  // objective talk với Dì Tư — trả qua turnInFestQuest: kiểm token trong
  // túi, tiêu hao, trao pháp bảo.
  var FEST_QUESTS = {
    // --- Tết Nguyên Đán ---
    q_le_tet_1: { id: 'q_le_tet_1', festQuest: true, festId: 'nguyen_dan', main: false, title: 'Đón Tết ở Thanh Khê', giver: 'le_su',
      desc: 'Tết Nguyên Đán về tới làng Thanh Khê. Gặp Dì Tư — người lo lễ hội của làng — nhận việc chuẩn bị Tết.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 10, tuVi: 10, items: [] } },
    q_le_tet_2: { id: 'q_le_tet_2', festQuest: true, festId: 'nguyen_dan', main: false, title: 'Đuổi thú giữ làng ngày Tết', giver: 'le_su', requires: 'q_le_tet_1',
      desc: 'Sói con lảng vảng bãi hoang phía nam làm trẻ con không dám ra sân chơi Tết. Dẹp 5 con Sói Con cho làng yên vui đón năm mới.',
      objectives: [{ type: 'kill', target: 'soi_con', need: 5 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_loc_dau_nam', n: 2 }] } },
    q_le_tet_3: { id: 'q_le_tet_3', festQuest: true, festId: 'nguyen_dan', main: false, title: 'Hái lộc đầu năm', giver: 'le_su', requires: 'q_le_tet_2',
      desc: 'Đêm giao thừa cần Linh Chi tươi thắp đèn cúng giếng cổ. Hái 3 tai Linh Chi gần suối linh trong Rừng Thanh Sơn mang về cho Dì Tư.',
      objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_loc_dau_nam', n: 3 }] } },
    q_le_tet_4: { id: 'q_le_tet_4', festQuest: true, festId: 'nguyen_dan', festFinal: true, main: false, title: 'Dâng lộc nhận đèn', giver: 'le_su', requires: 'q_le_tet_3',
      desc: 'Mang đủ 5 phong Lộc Đầu Năm về cho Dì Tư làm lễ thắp đèn đầu năm — bà sẽ trao bạn Nguyên Đán Hồng Đăng.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 30, tuVi: 20, items: [] } },
    // --- Tết Đoan Ngọ ---
    q_le_doan_ngo_1: { id: 'q_le_doan_ngo_1', festQuest: true, festId: 'doan_ngo', main: false, title: 'Đoan Ngọ diệt sâu bọ', giver: 'le_su',
      desc: 'Mùa Đoan Ngọ tới, rắn độc và sâu bọ bò ra nhiều. Gặp Dì Tư ở sân làng nhận việc trừ tà cho làng.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 10, tuVi: 10, items: [] } },
    q_le_doan_ngo_2: { id: 'q_le_doan_ngo_2', festQuest: true, festId: 'doan_ngo', main: false, title: 'Dẹp rắn ngày Đoan Ngọ', giver: 'le_su', requires: 'q_le_doan_ngo_1',
      desc: 'Rắn Lục Đuôi Đỏ bò vào tận bãi cỏ ven làng ngày Đoan Ngọ. Dẹp 4 con cho trẻ con yên tâm ra sân gói bánh.',
      objectives: [{ type: 'kill', target: 'ran_luc', need: 4 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_ngai_khu_ta', n: 2 }] } },
    q_le_doan_ngo_3: { id: 'q_le_doan_ngo_3', festQuest: true, festId: 'doan_ngo', main: false, title: 'Độc hoa trị độc', giver: 'le_su', requires: 'q_le_doan_ngo_2',
      desc: 'Hùng hoàng ngâm châu cần Độc Tâm Hoa làm vị dẫn lấy độc trị độc. Hái 3 cây Độc Tâm Hoa nơi rắn lục làm ổ mang về cho Dì Tư.',
      objectives: [{ type: 'collect', target: 'doc_tam_hoa', need: 3 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_ngai_khu_ta', n: 3 }] } },
    q_le_doan_ngo_4: { id: 'q_le_doan_ngo_4', festQuest: true, festId: 'doan_ngo', festFinal: true, main: false, title: 'Treo ngải nhận châu', giver: 'le_su', requires: 'q_le_doan_ngo_3',
      desc: 'Mang đủ 5 bó Ngải Khu Tà về treo khắp các cửa nhà trong làng cùng Dì Tư — bà trao bạn Hùng Hoàng Châu đã ngâm đủ mùa.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 30, tuVi: 20, items: [] } },
    // --- Thất Tịch ---
    q_le_that_tich_1: { id: 'q_le_that_tich_1', festQuest: true, festId: 'that_tich', main: false, title: 'Đêm Thất Tịch', giver: 'le_su',
      desc: 'Đêm Thất Tịch sắp tới, Dì Tư kể chuyện Ngưu Lang Chức Nữ cho trẻ con cả làng nghe. Gặp bà ở sân làng nhận việc chuẩn bị lễ.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 10, tuVi: 10, items: [] } },
    q_le_that_tich_2: { id: 'q_le_that_tich_2', festQuest: true, festId: 'that_tich', main: false, title: 'Tĩnh tọa chờ Ô Thước', giver: 'le_su', requires: 'q_le_that_tich_1',
      desc: 'Muốn sợi tơ hồng rơi xuống phải có người tĩnh tâm dẫn linh khí lên trời cao. Thổ nạp tích đủ 60 tu vi dưới sân làng đêm nay.',
      objectives: [{ type: 'tuvi', need: 60 }], rewards: { linhThach: 20, tuVi: 0, items: [{ id: 'le_soi_to_hong', n: 2 }] } },
    q_le_that_tich_3: { id: 'q_le_that_tich_3', festQuest: true, festId: 'that_tich', main: false, title: 'Khỉ phá cầu Ô Thước', giver: 'le_su', requires: 'q_le_that_tich_2',
      desc: 'Đàn Khỉ Mặt Đỏ kéo xuống bãi cỏ phá đèn hoa đăng dựng cho đêm hội. Dẹp 4 con quậy nhất cho đêm Thất Tịch được yên.',
      objectives: [{ type: 'kill', target: 'khi_mat_do', need: 4 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_soi_to_hong', n: 3 }] } },
    q_le_that_tich_4: { id: 'q_le_that_tich_4', festQuest: true, festId: 'that_tich', festFinal: true, main: false, title: 'Dâng tơ hồng', giver: 'le_su', requires: 'q_le_that_tich_3',
      desc: 'Mang đủ 5 Sợi Tơ Hồng về cho Dì Tư kết lại dưới cầu Ô Thước — bà trao bạn Song Tâm Bội làm tin cho đêm hẹn.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 30, tuVi: 20, items: [] } },
    // --- Tết Trung Thu ---
    q_le_trung_thu_1: { id: 'q_le_trung_thu_1', festQuest: true, festId: 'trung_thu', main: false, title: 'Rằm tháng tám', giver: 'le_su',
      desc: 'Trung Thu tới gần, làng Thanh Khê chuẩn bị mâm cỗ rằm ở sân đình. Gặp Dì Tư nhận việc chuẩn bị lễ ngắm trăng.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 10, tuVi: 10, items: [] } },
    q_le_trung_thu_2: { id: 'q_le_trung_thu_2', festQuest: true, festId: 'trung_thu', main: false, title: 'Dược làm bánh rằm', giver: 'le_su', requires: 'q_le_trung_thu_1',
      desc: 'Bánh Nguyệt Linh của làng phải có nhân Linh Chi tươi mới thơm. Hái 3 tai Linh Chi gần suối linh mang về cho Dì Tư làm bánh.',
      objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_banh_nguyet_linh', n: 2 }] } },
    q_le_trung_thu_3: { id: 'q_le_trung_thu_3', festQuest: true, festId: 'trung_thu', main: false, title: 'Giữ đêm rằm', giver: 'le_su', requires: 'q_le_trung_thu_2',
      desc: 'Đêm rằm trẻ con rước đèn khắp làng, Sói Rừng lảng vảng đường mòn là không yên. Dẹp 4 con Sói Rừng giữ đường cho đêm hội.',
      objectives: [{ type: 'kill', target: 'soi_rung', need: 4 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_banh_nguyet_linh', n: 3 }] } },
    q_le_trung_thu_4: { id: 'q_le_trung_thu_4', festQuest: true, festId: 'trung_thu', festFinal: true, main: false, title: 'Mâm cỗ dưới trăng', giver: 'le_su', requires: 'q_le_trung_thu_3',
      desc: 'Mang đủ 5 chiếc Bánh Nguyệt Linh về bày mâm cỗ rằm cùng Dì Tư — bà trao bạn Nguyệt Hoa Kính hứng ánh trăng đêm nay.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 30, tuVi: 20, items: [] } },
    // --- Tết Hàn Thực ---
    q_le_han_thuc_1: { id: 'q_le_han_thuc_1', festQuest: true, festId: 'han_thuc', main: false, title: 'Hàn Thực nhớ người xưa', giver: 'le_su',
      desc: 'Ngày Hàn Thực, làng ăn đồ nguội và cắm cành liễu trước cửa. Gặp Dì Tư ở sân làng nhận việc chuẩn bị lễ.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 10, tuVi: 10, items: [] } },
    q_le_han_thuc_2: { id: 'q_le_han_thuc_2', festQuest: true, festId: 'han_thuc', main: false, title: 'Thuốc nguội cho ngày lễ', giver: 'le_su', requires: 'q_le_han_thuc_1',
      desc: 'Ngày không nhóm lửa, hiệu thuốc phải sắc sẵn thuốc nguội cho người già trong làng. Hái 5 cây Thảo Dược mang về cho Dì Tư chia phần.',
      objectives: [{ type: 'collect', target: 'thao_duoc', need: 5 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_canh_lieu_xanh', n: 2 }] } },
    q_le_han_thuc_3: { id: 'q_le_han_thuc_3', festQuest: true, festId: 'han_thuc', main: false, title: 'Giữ yên ngày kiêng lửa', giver: 'le_su', requires: 'q_le_han_thuc_2',
      desc: 'Ngày kiêng lửa mà Lợn Rừng phá ruộng thì cả làng không yên. Dẹp 3 con Lợn Rừng ở bãi hoang phía nam.',
      objectives: [{ type: 'kill', target: 'lon_rung', need: 3 }], rewards: { linhThach: 20, tuVi: 10, items: [{ id: 'le_canh_lieu_xanh', n: 3 }] } },
    q_le_han_thuc_4: { id: 'q_le_han_thuc_4', festQuest: true, festId: 'han_thuc', festFinal: true, main: false, title: 'Cắm liễu trước cửa', giver: 'le_su', requires: 'q_le_han_thuc_3',
      desc: 'Mang đủ 5 Cành Liễu Xanh về cắm trước cửa các nhà trong làng cùng Dì Tư — bà trao bạn Thanh Liễu Hoàn kết từ liễu lễ năm nay.',
      objectives: [{ type: 'talk', target: 'le_su', need: 1 }], rewards: { linhThach: 30, tuVi: 20, items: [] } }
  };
  var FEST_CHAINS = {};
  FEST_IDS.forEach(function (fid) {
    FEST_CHAINS[fid] = Object.keys(FEST_QUESTS).filter(function (qid) { return FEST_QUESTS[qid].festId === fid; })
      .sort(function (a, b) { return a < b ? -1 : 1; });
  });

  // ---------- Cửa sổ lễ theo lịch thật ----------
  function dayMs(y, m, d) { return new Date(y, m - 1, d).getTime(); }
  function lunarDayOf(festId, year) {
    var t = LUNAR_DATES[festId];
    if (!t) return null;
    if (t[year]) return t[year];
    var years = Object.keys(t).map(Number).sort(function (a, b) { return a - b; });
    return t[year < years[0] ? years[0] : years[years.length - 1]];
  }
  // Cửa sổ của lễ trong "năm lễ" year: [start, end) theo giờ địa phương.
  function festWindow(fest, year) {
    if (fest.solar) {
      var s = fest.solar;
      return { start: dayMs(year, s.month, s.day - s.before), end: dayMs(year, s.month, s.day + s.after + 1), day: dayMs(year, s.month, s.day), year: year };
    }
    var md = lunarDayOf(fest.id, year);
    if (!md) return null;
    var base = dayMs(year, md[0], md[1]);
    return { start: base - fest.before * 86400000, end: base + (fest.after + 1) * 86400000, day: base, year: year };
  }
  // Lễ đang diễn ra tại thời điểm now (ms). Lễ có thể vắt qua giao thừa
  // (Tết) nên xét cả "năm lễ" hiện tại và năm kề.
  function festivalAt(now) {
    var t = typeof now === 'number' ? now : Date.now();
    var y = new Date(t).getFullYear();
    for (var i = 0; i < FEST_IDS.length; i++) {
      var fest = FESTIVALS[FEST_IDS[i]];
      for (var dy = -1; dy <= 1; dy++) {
        var w = festWindow(fest, y + dy);
        if (w && t >= w.start && t < w.end) return { fest: fest, start: w.start, end: w.end, day: w.day, year: w.year };
      }
    }
    return null;
  }
  function nextFestival(now) {
    var t = typeof now === 'number' ? now : Date.now();
    var y = new Date(t).getFullYear();
    var best = null;
    FEST_IDS.forEach(function (fid) {
      var fest = FESTIVALS[fid];
      for (var dy = 0; dy <= 1; dy++) {
        var w = festWindow(fest, y + dy);
        if (w && w.start > t && (!best || w.start < best.start))
          best = { fest: fest, start: w.start, end: w.end, day: w.day, year: w.year };
      }
    });
    return best;
  }
  function fmtDay(ms) {
    var d = new Date(ms);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }

  // ---------- Icon lưới 16x16 cho trang phục (đợt 1) ----------
  // Cùng phong cách icon lưới của gear/artifacts: hình áo + họa tiết
  // riêng từng bộ, màu lấy từ chính `colors` của bộ (b = màu chính,
  // B = màu phụ, o = màu nhấn) + d viền tối, s vải sáng, g kim.
  // Bộ cũ chưa có lưới riêng thì dùng lưới áo chung 'robe'.
  var COSTUME_GRIDS = {
    robe: [
      '................',
      '......dddd......',
      '.....dbBBbd.....',
      '....dbBBBBbd....',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '......bBBb......',
      '.....bBBBBb.....',
      '.....bBBBBb.....',
      '....bBBBBBBb....',
      '....bBBBBBBb....',
      '...bBBBBBBBBb...',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ],
    thanh_van_du_hiep: [
      '................',
      '......dddd......',
      '.....dbBBbd.....',
      '....dbBBoBd.....',
      '..ddbBBoBBbdd...',
      '..dbdbobBBbd....',
      '..db..bBBb..bd..',
      '......boBb......',
      '.....bBBBBb.....',
      '....gggBBgg.....',
      '....bBBBBBBb....',
      '....bBBBBBBb....',
      '...bBBBBBBBBb...',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ],
    bich_hai_trieu_sinh: [
      '................',
      '......dddd......',
      '.....dbBBbd.....',
      '....dbBBBBbd....',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '......bBBb......',
      '.....bBBBBb.....',
      '.....bBBBBb.....',
      '....bBBBBBBb....',
      '...oo.oooo.oo...',
      '..o..o....o..o..',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ],
    hoa_phuong_chien_y: [
      '................',
      '......dddd......',
      '.....dbBBbd.....',
      '....dbBBBBbd....',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '......bBBb......',
      '.....bBBoBb.....',
      '.....bBooBb.....',
      '....bBBBBBBb....',
      '....bBoBBobB....',
      '...bBBBBBBBBb...',
      '...o.bbBBbb.o...',
      '..dddddddddddd..',
      '................'
    ],
    mac_ngoc_huyen_y: [
      '................',
      '......dddd......',
      '.....dbbbbd.....',
      '....dbBBBBbd....',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '......bBBb......',
      '.....bBooBb.....',
      '.....boBBob.....',
      '....bBBBBBBb....',
      '....bBBBBBBb....',
      '...bBBBBBBBBb...',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ],
    loi_dinh_dao_bao: [
      '................',
      '......dddd......',
      '.....dbBBbd.....',
      '....dbBBBBbd....',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '......bBBb......',
      '.....bBbobB.....',
      '.....bBbobB.....',
      '....bBBBoBBb....',
      '....bBBBBobB....',
      '...bBBBBBBBBb...',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ],
    kim_lan_giap: [
      '................',
      '.....dddddd.....',
      '....dbBBBBbd....',
      '...dbBBBBBBbd...',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '.....bBbBbB.....',
      '....bBbBbBbB....',
      '....bBbBbBbB....',
      '...bBbBbBbBbB...',
      '...bBbBbBbBbB...',
      '...bBBBBBBBBb...',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ],
    tuyet_lien_tien_y: [
      '................',
      '......dddd......',
      '.....dsSSsd.....',
      '....dsSSSSsd....',
      '..ddsSSSSSSsdd..',
      '..dsdsSSSSsdsd..',
      '..ds..sSSs..sd..',
      '......sSSs......',
      '.....sSSoSs.....',
      '.....sSooSs.....',
      '....sSSooSSs....',
      '....sSSSSSSs....',
      '...sSSSSSSSSs...',
      '...sSSSSSSSSs...',
      '..dddddddddddd..',
      '................'
    ],
    tinh_ha_phap_y: [
      '................',
      '......dddd......',
      '.....dbBBbd.....',
      '....dbBBBBbd....',
      '..ddbBBBBBBbdd..',
      '..dbdbBBBBbdbd..',
      '..db..bBBb..bd..',
      '......bBBb......',
      '.....bBoBobb....',
      '.....bBBBBb.....',
      '....bBBobBBBb...',
      '....bBBBBBBb....',
      '...bBboBBBBBb...',
      '...bBBBBBBBBb...',
      '..dddddddddddd..',
      '................'
    ]
  };
  function costumePalette(def) {
    var c = (def && def.colors) || ['#8a8f98', '#c9ccd4', '#c9a44e'];
    return { b: c[0], B: c[1], o: c[2], d: '#23242e', s: '#e8e4da', S: c[1], g: '#c9a44e' };
  }
  function costumeGridPixels(grid, palette) {
    return grid.map(function (row) {
      return row.split('').map(function (ch) { return palette[ch] || null; });
    });
  }
  function costumeIconPixels(def) {
    if (!def) return [];
    return costumeGridPixels(COSTUME_GRIDS[def.id] || COSTUME_GRIDS.robe, costumePalette(def));
  }
  function drawCostumePixels(ctx, px, x, y, scale) {
    for (var r = 0; r < px.length; r++)
      for (var c = 0; c < px[r].length; c++)
        if (px[r][c]) { ctx.fillStyle = px[r][c]; ctx.fillRect(x + c * scale, y + r * scale, scale, scale); }
  }
  function drawCostumeIcon(ctx, def, x, y, scale) {
    if (!def || !ctx) return;
    drawCostumePixels(ctx, costumeIconPixels(def), x, y, scale);
  }

  // ---------- Đăng ký vào logic.js + artifacts.js (idempotent) ----------
  var _registered = false;
  function registerAll() {
    if (_registered) return true;
    if (!L || !ART) return false;
    Object.keys(FEST_ARTIFACTS).forEach(function (id) {
      if (!ART.ARTIFACTS[id]) {
        var def = FEST_ARTIFACTS[id];
        def.icon = 'art_' + id;
        ART.ARTIFACTS[id] = def;
      }
    });
    Object.keys(FEST_TOKENS).forEach(function (id) {
      if (!L.ITEMS[id]) L.ITEMS[id] = FEST_TOKENS[id];
    });
    Object.keys(FEST_QUESTS).forEach(function (qid) {
      if (!L.QUESTS[qid]) L.QUESTS[qid] = FEST_QUESTS[qid];
    });
    _registered = true;
    return true;
  }

  // ---------- Chuỗi việc lễ: nhận / trả / reset theo năm ----------
  function ensureFestYear(qs, ch, active) {
    if (!qs || !ch || !active) return false;
    var w = ensure(ch);
    if (!w) return false;
    var fid = active.fest.id;
    if (w.festYears[fid] === active.year) return false;
    // Năm lễ mới: gỡ lượt cũ khỏi turnedIn/accepted để làm lại chuỗi.
    FEST_CHAINS[fid].forEach(function (qid) {
      var ix = qs.turnedIn.indexOf(qid);
      if (ix >= 0) qs.turnedIn.splice(ix, 1);
      if (qs.accepted[qid]) delete qs.accepted[qid];
    });
    w.festYears[fid] = active.year;
    return true;
  }
  function availableFestQuestId(qs, ch, now) {
    if (!qs || !registerAll()) return null;
    var active = festivalAt(now);
    if (!active) return null;
    ensureFestYear(qs, ch, active);
    var chain = FEST_CHAINS[active.fest.id];
    for (var i = 0; i < chain.length; i++) {
      var qid = chain[i], q = L.QUESTS[qid];
      if (L.isTurnedIn(qs, qid)) continue;
      if (qs.accepted[qid]) return null; // đang làm dở một việc trong chuỗi
      if (q.requires && !L.isTurnedIn(qs, q.requires)) return null;
      return qid;
    }
    return null;
  }
  function activeFestQuestId(qs) {
    if (!qs || !qs.accepted) return null;
    var ids = Object.keys(qs.accepted);
    for (var i = 0; i < ids.length; i++) {
      var q = L.QUESTS[ids[i]];
      if (q && q.festQuest) return ids[i];
    }
    return null;
  }
  function chainProgress(qs, festId) {
    var chain = FEST_CHAINS[festId] || [];
    var done = 0;
    chain.forEach(function (qid) { if (qs && L.isTurnedIn(qs, qid)) done++; });
    var active = activeFestQuestId(qs);
    return { total: chain.length, done: done, activeQid: (active && L.QUESTS[active].festId === festId) ? active : null, chain: chain };
  }
  function turnInFestQuest(qs, ch, qid, now) {
    if (!registerAll()) return { ok: false, reason: 'no_module' };
    var q = L.QUESTS[qid];
    if (!q || !q.festQuest) return { ok: false, reason: 'not_fest' };
    var st = qs.accepted[qid];
    if (!st || !st.done) return { ok: false, reason: 'not_done' };
    if (!q.festFinal) return L.turnInQuest(qs, ch, qid);
    // Việc cuối: chỉ trong cửa sổ lễ + nộp đủ vật phẩm lễ -> trao pháp bảo.
    var active = festivalAt(now);
    if (!active || active.fest.id !== q.festId)
      return { ok: false, reason: 'closed', fest: FESTIVALS[q.festId] };
    var fest = FESTIVALS[q.festId];
    var have = L.countItem(ch, fest.token);
    if (have < fest.tokenNeed)
      return { ok: false, reason: 'token', have: have, need: fest.tokenNeed, token: fest.token, fest: fest };
    if (!L.consumeItem(ch, fest.token, fest.tokenNeed))
      return { ok: false, reason: 'token', have: have, need: fest.tokenNeed, token: fest.token, fest: fest };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    ART.ensureArtifacts(ch);
    var entry = ART.addArtifact(ch, fest.artifact);
    return { ok: true, rewards: r.rewards, artifact: ART.ARTIFACTS[fest.artifact], entry: entry, fest: fest };
  }
  // Pháp bảo lễ còn nguồn mới không: đúng cửa sổ lễ của chính nó và chuỗi
  // năm nay chưa trả xong việc cuối.
  function artifactSourceOpen(qs, festId, now) {
    var active = festivalAt(now);
    return !!(active && active.fest.id === festId);
  }

  // ---------- Thoại + dấu nhiệm vụ cho NPC lễ ----------
  function markerFor(npcId, qs, ch, now) {
    if (npcId !== FEST_NPC.id || !qs) return null;
    var act = activeFestQuestId(qs);
    if (act && qs.accepted[act].done) return '?';
    if (availableFestQuestId(qs, ch, now)) return '!';
    return null;
  }
  function dialogueFor(npcId, qs, ch, now) {
    if (npcId !== FEST_NPC.id) return null;
    var active = festivalAt(now);
    var act = activeFestQuestId(qs);
    if (act && L.QUESTS[act]) {
      var q = L.QUESTS[act];
      if (qs.accepted[act].done) return ['Việc "' + q.title + '" đã xong rồi đó. Trả việc cho dì ngay dưới này nhé.'];
      return ['Đang làm việc lễ "' + q.title + '" phải không? ' + q.desc];
    }
    if (active) {
      var avail = availableFestQuestId(qs, ch, now);
      if (avail) return [active.fest.blurb, 'Việc lễ đang chờ: "' + L.QUESTS[avail].title + '". Nhận ngay dưới này nhé.'];
      return ['Lễ ' + active.fest.name + ' năm nay làng mình lo chu toàn cả rồi. Cảm ơn ngươi đã giúp — hẹn mùa lễ năm sau!'];
    }
    var nx = nextFestival(now);
    var lines = ['Dì lo lễ hội cho làng Thanh Khê mấy chục năm nay: Tết, Đoan Ngọ, Thất Tịch, Trung Thu, Hàn Thực — mùa nào làng mình cũng có hội.'];
    if (nx) lines.push('Lễ gần nhất là ' + nx.fest.name + ', bắt đầu ' + fmtDay(nx.start) + '. Tới lúc đó quay lại gặp dì, có việc lễ và pháp bảo lễ giới hạn chờ ngươi.');
    lines.push('Tủ y phục của ngươi dì giữ hộ ở đây — bấm nút Tủ Đồ dưới góc màn hình, hoặc nút ngay dưới này, để xem và thay đồ.');
    return lines;
  }

  registerAll();
  var api = {
    COSTUMES: COSTUMES, COSTUME_IDS: COSTUME_IDS, SEASONS: SEASONS, seasonOf: seasonOf,
    BOSS_COSTUME_DROPS: BOSS_COSTUME_DROPS, rollBossCostumeDrop: rollBossCostumeDrop,
    COSTUME_GRIDS: COSTUME_GRIDS, costumeIconPixels: costumeIconPixels, drawCostumeIcon: drawCostumeIcon,
    costumeById: costumeById, shopRows: shopRows,
    ensure: ensure, owns: owns, ownedList: ownedList, wornId: wornId, wornDef: wornDef,
    hasArt: hasArt, isVisible: isVisible, visibleCostumes: visibleCostumes,
    _registerArt: _registerArt, _clearArt: _clearArt,
    grantCostume: grantCostume, buyCostume: buyCostume, buyWithSectPoints: buyWithSectPoints,
    sectPointsBalance: sectPointsBalance,
    wearCostume: wearCostume, unwear: unwear, statTotals: statTotals, syncRewards: syncRewards,
    FESTIVALS: FESTIVALS, FEST_IDS: FEST_IDS, FEST_ARTIFACTS: FEST_ARTIFACTS, FEST_TOKENS: FEST_TOKENS,
    FEST_QUESTS: FEST_QUESTS, FEST_CHAINS: FEST_CHAINS, FEST_NPC: FEST_NPC, LUNAR_DATES: LUNAR_DATES,
    festWindow: festWindow, festivalAt: festivalAt, nextFestival: nextFestival, fmtDay: fmtDay,
    registerAll: registerAll, ensureFestYear: ensureFestYear,
    availableFestQuestId: availableFestQuestId, activeFestQuestId: activeFestQuestId,
    chainProgress: chainProgress, turnInFestQuest: turnInFestQuest, artifactSourceOpen: artifactSourceOpen,
    markerFor: markerFor, dialogueFor: dialogueFor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_WARDROBE = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_WARDROBE = api;
})();
