// Phàm Nhân Tu Đạo — ÂM THANH tổng hợp 100% bằng WebAudio (không file ngoài).
// Lệnh Bui 20:52 2026-10-29: "Tạo âm thanh game, âm thanh boss quái".
//   - Tiếng RIÊNG cho 9 loài quái + boss Sơn Quân (+ tinh anh trầm hơn),
//     kêu theo dịp: phát hiện người chơi (aggro) / tấn công / trúng đòn / chết.
//   - Tiếng gameplay: chém trúng/trượt, từng skill một tiếng (Thiên Căn
//     Thần Thông có tiếng riêng theo 8 hệ linh căn), trúng đòn, đột phá,
//     nhiệm vụ, nhặt đồ, dùng đan, cổng, hái dược, kỳ ngộ giếng cổ.
//   - Nhạc nền ngũ cung + không khí theo map (làng / rừng / núi), chuyển
//     map liền mạch không cắt phựt; lớp trầm khi giao chiến boss.
//   - Lượt 31/10 (lệnh Bui "Tạo âm thanh cho game phù hợp"): lớp GIAI
//     ĐIỆU SÁNG TÁC theo NGỮ CẢNH (MUSIC_CONTEXTS: login/làng/dã
//     ngoại/giao chiến/boss/bí cảnh/sơn môn) gảy Karplus-Strong +
//     sáo trúc + chuông + trống trận, crossfade khi đổi ngữ cảnh;
//     lớp sinh cảnh biome (lửa/sấm xa/gió lạnh) cho map 10/11/12;
//     lấp nốt các khoảnh khắc câm: dọn xong bí cảnh, đấu giá, bái
//     nhập tông, sang mùa, mở Đồ Giám lần đầu, tiếng bước chân.
//   - Lượt 31/10 chiều (lệnh Bui 17:12 "Thêm âm thanh nền sống
//     động"): lớp AMBIENCE theo BIOME (AMBIENCES + biomeFor) nằm
//     dưới nhạc nền — nền liên tục nước chảy/lá xào xạc/rì rầm hang
//     + gió giật theo cơn; sự kiện ngẫu nhiên có kiểm soát (chim,
//     côn trùng, dế/ếch/cú đêm, gà gáy, chuông xa, chuông gió, giọt
//     nước hang; lửa/sấm/gió lạnh chuyển từ cờ MAP_THEMES sang
//     bảng biome). Chuyển map chỉ lướt gain (0 node mới), giao
//     chiến/boss thì lớp nền tự nhỏ đi (ducking), tắt tiếng = im cả.
// Kỹ thuật: AudioContext chỉ khởi tạo LƯỜI sau tương tác đầu tiên của
// người chơi (chính sách autoplay); tắt tiếng = im hoàn toàn ngay; mọi
// hàm công khai đều tự nuốt lỗi — game chạy bình thường khi không có
// âm thanh (môi trường test Node không có AudioContext cũng an toàn).
(function () {
  'use strict';

  // ==================================================================
  // DỮ LIỆU: bản đồ âm thanh (test đọc trực tiếp các bảng này)
  // ==================================================================
  // 9 loài trong logic.js MONSTERS + boss son_quan. Mỗi loài đủ 4 dịp.
  var VOICE_OCCASIONS = ['aggro', 'attack', 'hit', 'death'];
  var VOICES = {
    ga_rung:     { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    tho_hoang:   { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    soi_con:     { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    lon_rung:    { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    soi_rung:    { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    lon_mong_sat:{ occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    ran_luc:     { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    khi_mat_do:  { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 } },
    son_quan:    { occasions: { aggro: 1, attack: 1, hit: 1, death: 1 }, boss: 1 }
  };
  // Tiếng hiệu ứng gameplay / UI.
  var SFX = {
    swing: 1, swing_miss: 1, hit: 1, hit_crit: 1, hit_small: 1, hurt: 1,
    player_death: 1, breakthrough: 1, kyngo: 1, quest_accept: 1,
    quest_complete: 1, ui_click: 1, pickup: 1, pickup_weapon: 1, coin: 1,
    use_item: 1, portal: 1, meditate: 1, gather: 1, artifact_cast: 1,
    tourn_drum: 1, tourn_cheer: 1, fly_whoosh: 1, revive: 1, formation: 1,
    shop_buy: 1, shop_sell: 1, plant: 1, water: 1, capture_miss: 1, break_fail: 1,
    ice_tick: 1, fire_tick: 1, zap_small: 1, boom_small: 1,
    // Lượt âm thanh 31/10: lấp các khoảnh khắc từng câm (QA (e) 02:38) +
    // bước chân đồng bộ chu kỳ đi (QA (e) 00:31).
    realm_clear: 1, auction_bid: 1, auction_win: 1, sect_join: 1,
    season_change: 1, codex_open: 1, footstep: 1,
    // QA (e) 20:16 31/10: tiếng độc rút HP mỗi giây (trước đây nhịp độc câm).
    poison_tick: 1
  };
  // Tiếng tung chiêu theo id skill (thanh skill trong skills.js).
  // QA 15:16 30/10: 10 chiêu cảnh giới cao có bản tiếng RIÊNG ở
  // skillSound (ghép từ nguyên liệu sẵn có theo đúng hệ/hình thái
  // chiêu) — trước đây cả 10 đều rơi về một tiếng vút kiếm chung.
  var SKILL_SOUNDS = {
    combo: 1, kiem_khi: 1, toan_phong: 1, thien_can: 1, luu_tinh: 1, ngu_kiem: 1,
    xuyen_van: 1, linh_khien: 1, dan_hoa: 1, than_loi: 1, phan_than: 1,
    tran_ap: 1, linh_vuc: 1, kiem_tran: 1, loi_kiep: 1, pha_huyen: 1,
    // Lượt 31/10: 32 chiêu BÍ TỊCH (js/manuals.js — 10 tuyệt học tông,
    // 6 chiêu ký danh boss, 3 chiêu hiếm, 5 cơ bản, 6 phổ thông ngũ
    // hành, 2 phổ thông chung) trước đây KHÔNG có entry nào nên
    // skill() trả false = tung chiêu mà CÂM. Nay đủ tiếng riêng.
    tp_kiem_tran: 1, hp_ngu_hanh: 1, tc_pha_son: 1, dh_dan_hoa: 1,
    vt_hao_lenh: 1, tphu_kiem_tran: 1, cc_khon_tran: 1, kc_bat_hoai: 1,
    nd_thuc_cot: 1, ha_han_tien: 1,
    boss_lang_hao: 1, boss_ho_gam: 1, boss_xa_thuc: 1, boss_thiet_bi: 1,
    boss_co_mang: 1, boss_ma_vuong: 1,
    rare_van_kiem: 1, rare_cuu_u: 1, rare_hoi_xuan: 1,
    cb_thanh_khe: 1, cb_liet_phong: 1, cb_thiet_bo: 1, cb_tat_phong: 1, cb_dan_khi: 1,
    pq_hoa_cau: 1, pq_thuy_tien: 1, pq_bang_tien: 1, pq_loi_kich: 1,
    pq_phong_nhan: 1, pq_tho_thu: 1,
    gen_phi_hoa: 1, gen_luu_sa: 1
  };
  // Thiên Căn Thần Thông: tiếng riêng theo 8 hệ linh căn.
  var ROOT_SOUNDS = {
    kim: 1, moc: 1, thuy: 1, hoa: 1, tho: 1, phong: 1, loi: 1, bang: 1
  };
  // Nhạc + không khí theo map. scale = ngũ cung (độ so với gốc, semitone).
  var MAP_THEMES = {
    map1: { root: 261.63, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 850, wind: 0.012, bird: 1, insects: 0 },
    map2: { root: 220.00, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 620, wind: 0.030, bird: 0, insects: 1 },
    map3: { root: 293.66, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1350, wind: 0.075, bird: 0, insects: 0 },
    // Võ Đài Đại Hội (js/tournament.js): sáng, trang trọng, gió cao.
    map_dai_hoi: { root: 329.63, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1500, wind: 0.045, bird: 0, insects: 0 },
    // Chuỗi Đại Sơn Luyện Khí (map 4–7): tông trầm dần, gió núi mạnh dần.
    map4: { root: 196.00, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 540, wind: 0.055, bird: 0, insects: 0 },
    map5: { root: 207.65, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 560, wind: 0.060, bird: 0, insects: 0 },
    map6: { root: 185.00, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 500, wind: 0.065, bird: 0, insects: 0 },
    map7: { root: 233.08, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 700, wind: 0.070, bird: 0, insects: 0 },
    // Chặng cảnh giới cao (map 8–14): sáng và cao dần theo cảnh giới;
    // riêng Xích Diệm (map10) trầm nóng, Lôi Trì (map12) chói + gió giật.
    map8: { root: 329.63, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1200, wind: 0.050, bird: 0, insects: 0 },
    map9: { root: 293.66, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1000, wind: 0.055, bird: 0, insects: 0 },
    map10: { root: 164.81, scale: [0, 3, 5, 7, 10], chord: [0, 3, 7], bright: 430, wind: 0.030, bird: 0, insects: 0, fire: 1 },
    map11: { root: 246.94, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 900, wind: 0.060, bird: 0, insects: 0, cold: 1 },
    map12: { root: 349.23, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1650, wind: 0.075, bird: 0, insects: 0, thunder: 1 },
    map13: { root: 311.13, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1400, wind: 0.080, bird: 0, insects: 0 },
    map14: { root: 392.00, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1750, wind: 0.095, bird: 0, insects: 0 },
    // Động phủ riêng của người chơi: yên tĩnh, ấm, gần như không gió.
    dong_phu: { root: 277.18, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 720, wind: 0.006, bird: 0, insects: 0 },
    // Mọi bí cảnh instance (id bắt đầu bằng 'realm_'): hư không u ám.
    realm_: { root: 220.00, scale: [0, 3, 5, 7, 10], chord: [0, 3, 7], bright: 500, wind: 0.040, bird: 0, insects: 0 },
    // Map lạ (map mới của team khác về sau): dùng khung rừng làm mặc định.
    _default: { root: 220.00, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 620, wind: 0.03, bird: 0, insects: 1 }
  };
  // Mức âm thanh (nút "Âm thanh" xoay vòng như nút Đồ hoạ): hệ số gain.
  var LEVELS = {
    bat: { music: 1.0, sfx: 1.0 },
    nho: { music: 0.45, sfx: 0.5 },
    tat: { music: 0.0, sfx: 0.0 }
  };
  // Vòng chuyển hợp âm của pad nhạc nền (QA đợt 1: trước đây pad là 1 hợp
  // âm tĩnh suốt một map). PROG_DEGREES = bậc thang ngũ cung làm gốc hợp
  // âm: I (gốc) -> bậc 4 -> bậc 5 -> bậc 2, mỗi hợp âm giữ PROG_SEC giây
  // rồi 3 oscillator của pad lướt tần số chậm (crossfade bằng glide) sang
  // hợp âm kế — không thêm node, không ngắt nhạc. Hợp âm ở mỗi bậc =
  // theme.chord dịch lên số semitone của bậc đó trong thang của map, nên
  // giữ nguyên chất trưởng/thứ của từng map.
  var PROG_DEGREES = [0, 3, 4, 1];
  var PROG_SEC = 24;
  function chordSemis(th, stepIdx) {
    var deg = PROG_DEGREES[((stepIdx % PROG_DEGREES.length) + PROG_DEGREES.length) % PROG_DEGREES.length];
    var sc = th.scale || [0, 2, 4, 7, 9];
    var rootSemi = sc[deg % sc.length] + 12 * Math.floor(deg / sc.length);
    return (th.chord || [0, 4, 7]).map(function (c) { return c + rootSemi; });
  }

  // ==================================================================
  // NHẠC THEO NGỮ CẢNH — GIAI ĐIỆU SÁNG TÁC (lượt 31/10, lệnh Bui
  // "Tạo âm thanh cho game phù hợp"). Trước đây nhạc nền chỉ là pad +
  // gió + nốt gảy NGẪU NHIÊN thưa — không giai điệu, không phân biệt
  // được đang yên bình hay đang giao chiến. Nay mỗi ngữ cảnh có một
  // MOTIF giai điệu viết sẵn theo BẬC thang ngũ cung (degree), nên tự
  // chuyển được sang root/scale của mọi map (bản sắc từng map vẫn do
  // MAP_THEMES + pad/gió giữ). Quy ước mảng bước (mỗi phần tử = 1
  // step dài stepDur giây): -1 = nghỉ; 0..4 = bậc thang; 5..9 = các
  // bậc đó ở quãng tám trên; riêng -2 = nốt chệch nửa cung DƯỚI gốc
  // (chỉ motif boss dùng để tạo căng thẳng ngoài thang).
  //   lead: 'flute' sáo trúc (sine + vibrato + hơi thở), 'pluck' đàn
  //         gảy Karplus-Strong, 'alt' luân phiên pluck/sáo theo vòng.
  //   drum: 'D' trống lớn, 'd' trống nhỏ, 's' chũm chọe nhỏ, -1 nghỉ.
  //   bellEvery: điểm chuông khẽ mỗi bấy nhiêu step (0 = không).
  //   echo: phát lại nốt gảy 2 lần vọng (chỉ bí cảnh).
  // ==================================================================
  var MUSIC_CONTEXTS = {
    login: { // màn đăng nhập: sáo thưa, thanh bình, chưa có trống/bass
      stepDur: 0.46, steps: 32, lead: 'flute', bellEvery: 0, echo: 0,
      melody: [4, -1, -1, 3, -1, -1, 2, -1, 1, -1, -1, 2, -1, -1, -1, -1,
               3, -1, -1, 4, -1, -1, 5, -1, 4, -1, 3, 2, 1, -1, 0, -1],
      bass: null, drum: null
    },
    village: { // làng Thanh Khê: motif "về làng", gảy + sáo luân phiên
      stepDur: 0.44, steps: 32, lead: 'alt', bellEvery: 0, echo: 0,
      melody: [2, -1, 3, 4, -1, -1, 3, 2, 1, -1, 2, -1, -1, -1, -1, -1,
               4, -1, 3, 2, 1, -1, 2, 3, 2, -1, 1, -1, 0, -1, -1, -1],
      bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
             0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      drum: null
    },
    wild: { // dã ngoại/rừng/núi: gảy thưa, thiên nhiên, không trống
      stepDur: 0.42, steps: 32, lead: 'pluck', bellEvery: 0, echo: 0,
      melody: [0, -1, -1, 2, -1, -1, 3, -1, -1, 2, -1, -1, 1, -1, -1, -1,
               2, -1, -1, 3, -1, 4, -1, -1, 3, -1, 2, 1, 0, -1, -1, -1],
      bass: null, drum: null
    },
    combat: { // giao chiến thường: trống hành quân + bass pulse + motif ngắn
      stepDur: 0.26, steps: 16, lead: 'pluck', bellEvery: 0, echo: 0,
      melody: [0, -1, 0, 1, 0, -1, 0, -1, 2, -1, 1, 0, -1, 0, 1, -1],
      bass: [0, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, 0, -1, 1, -1],
      drum: ['D', -1, 'd', -1, 'D', -1, 'd', -1, 'D', -1, 'd', -1, 'D', -1, 'd', 'd']
    },
    boss: { // boss: trống dồn, bass có nốt chệch -2, motif tối trầm
      stepDur: 0.23, steps: 16, lead: 'pluck', bellEvery: 0, echo: 0,
      melody: [0, 0, -1, 0, -1, 0, -1, -1, -2, -1, 0, -1, 0, -1, 1, -1],
      bass: [0, -1, 0, -1, 0, -1, 0, -1, -2, -1, 0, -1, 0, 0, -1, -1],
      drum: ['D', -1, -1, 'D', -1, -1, 'D', -1, 'D', -1, -1, 'D', 'd', 'd', 'D', 's']
    },
    realm: { // bí cảnh: rất thưa, gảy có vọng, chuông khẽ — huyền bí
      stepDur: 0.55, steps: 32, lead: 'pluck', bellEvery: 16, echo: 1,
      melody: [4, -1, -1, -1, -1, -1, -1, 3, -1, -1, -1, -1, -1, 2, -1, -1,
               -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1],
      bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
             -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      drum: null
    },
    sect: { // sơn môn / võ đài: trang nghiêm, chuông điểm đầu mỗi nửa vòng
      stepDur: 0.48, steps: 32, lead: 'pluck', bellEvery: 16, echo: 0,
      melody: [0, -1, -1, -1, 2, -1, 3, -1, 4, -1, -1, 3, -1, 2, -1, -1,
               0, -1, -1, -1, 2, -1, 1, -1, 2, -1, 3, -1, -1, -1, 0, -1],
      bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
             0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      drum: null
    }
  };
  // Suy ngữ cảnh nền TỪ MAP (phần không phụ thuộc trạng thái giao
  // chiến): hàm thuần dữ liệu để test đọc trực tiếp.
  function baseContextFor(mapId) {
    var id = mapId || 'map1';
    if (id === 'map1' || id === 'dong_phu') return 'village';
    if (id.indexOf('realm_') === 0) return 'realm';
    if (id.indexOf('sonmon_') === 0 || id === 'map_dai_hoi') return 'sect';
    return 'wild';
  }

  // ==================================================================
  // ÂM THANH NỀN SỐNG ĐỘNG THEO BIOME (lượt 31/10, lệnh Bui 17:12
  // "Thêm âm thanh nền sống động cho game"). Lớp này nằm DƯỚI nhạc
  // nền (bus riêng ambBus -> musicBus nên thừa hưởng mức Bật/Nhỏ/Tắt
  // và trims như nhạc), gồm:
  //   - NỀN LIÊN TỤC dùng chung, tạo MỘT LẦN lúc khởi động nhạc:
  //     nước chảy (noise qua lowpass, đều), lá xào xạc (noise qua
  //     bandpass, biên độ lên xuống chậm bằng LFO), rì rầm trầm
  //     (noise lowpass rất thấp cho hang/núi lửa), gió giật (LFO phụ
  //     điều biên độ lên node gió sẵn có, mạnh theo hệ số gust).
  //     Chuyển map/biome chỉ LƯỚT gain về thông số mới (crossfade
  //     1–2s) — không tạo node mới, không rò node khi chuyển liên tục.
  //   - SỰ KIỆN NGẪU NHIÊN CÓ KIỂM SOÁT trong schedulerTick: mỗi
  //     trường là xác suất phát MỖI TICK (0,28s) — chim/côn trùng/
  //     dế/ếch/cú/gà gáy/chuông xa/chuông gió/giọt nước/lửa reo/sấm
  //     xa/gió rít lạnh. Cao độ và biến thể ngẫu nhiên theo từng lần
  //     phát nên không lặp máy móc. (Lửa/sấm/lạnh trước đây đọc cờ
  //     của MAP_THEMES — nay chuyển về bảng này làm một nguồn duy
  //     nhất; MAP_THEMES vẫn giữ cờ vì theme nhạc + test còn đọc.)
  //   water/leaves/rumble là tỉ lệ 0..1 của mức gain nền tối đa
  //   (water 0,030 · leaves 0,016 · rumble 0,050 trên ambBus).
  // ==================================================================
  var AMBIENCES = {
    village:   { water: 0.30, leaves: 0.25, rumble: 0,    gust: 0.35, bird: 0.055, insects: 0.05, cricket: 0,     frog: 0,     owl: 0,     rooster: 0.006, bell: 0,     chime: 0,     drip: 0,     fire: 0,    thunder: 0,     cold: 0 },
    homestead: { water: 0.15, leaves: 0.15, rumble: 0,    gust: 0.25, bird: 0.02,  insects: 0.06, cricket: 0.10,  frog: 0,     owl: 0.004, rooster: 0,     bell: 0,     chime: 0,     drip: 0.02,  fire: 0,    thunder: 0,     cold: 0 },
    forest:    { water: 0.45, leaves: 0.85, rumble: 0,    gust: 0.60, bird: 0.11,  insects: 0.20, cricket: 0,     frog: 0.02,  owl: 0,     rooster: 0,     bell: 0,     chime: 0,     drip: 0,     fire: 0,    thunder: 0,     cold: 0 },
    mountain:  { water: 0.25, leaves: 0.40, rumble: 0,    gust: 0.85, bird: 0.03,  insects: 0.02, cricket: 0,     frog: 0,     owl: 0.002, rooster: 0,     bell: 0.003, chime: 0.004, drip: 0,     fire: 0,    thunder: 0,     cold: 0 },
    sect:      { water: 0.20, leaves: 0.35, rumble: 0,    gust: 0.70, bird: 0.04,  insects: 0.03, cricket: 0,     frog: 0,     owl: 0,     rooster: 0,     bell: 0.010, chime: 0.014, drip: 0,     fire: 0,    thunder: 0,     cold: 0 },
    water:     { water: 1.00, leaves: 0.30, rumble: 0,    gust: 0.55, bird: 0.05,  insects: 0.06, cricket: 0.02,  frog: 0.03,  owl: 0,     rooster: 0,     bell: 0,     chime: 0.006, drip: 0.02,  fire: 0,    thunder: 0,     cold: 0 },
    swamp:     { water: 0.40, leaves: 0.30, rumble: 0,    gust: 0.40, bird: 0.02,  insects: 0.14, cricket: 0.09,  frog: 0.11,  owl: 0.004, rooster: 0,     bell: 0,     chime: 0,     drip: 0,     fire: 0,    thunder: 0,     cold: 0 },
    night:     { water: 0.50, leaves: 0.20, rumble: 0,    gust: 0.45, bird: 0,     insects: 0.02, cricket: 0.16,  frog: 0.06,  owl: 0.010, rooster: 0,     bell: 0,     chime: 0.004, drip: 0.01,  fire: 0,    thunder: 0,     cold: 0 },
    volcano:   { water: 0,    leaves: 0,    rumble: 0.55, gust: 0.40, bird: 0,     insects: 0,    cricket: 0,     frog: 0,     owl: 0,     rooster: 0,     bell: 0,     chime: 0,     drip: 0,     fire: 0.10, thunder: 0,     cold: 0 },
    frost:     { water: 0.05, leaves: 0.05, rumble: 0,    gust: 0.90, bird: 0,     insects: 0,    cricket: 0,     frog: 0,     owl: 0,     rooster: 0,     bell: 0,     chime: 0.008, drip: 0,     fire: 0,    thunder: 0,     cold: 0.06 },
    storm:     { water: 0.15, leaves: 0.50, rumble: 0.25, gust: 1.00, bird: 0,     insects: 0,    cricket: 0,     frog: 0,     owl: 0,     rooster: 0,     bell: 0,     chime: 0,     drip: 0,     fire: 0,    thunder: 0.012, cold: 0 },
    cave:      { water: 0.10, leaves: 0,    rumble: 0.40, gust: 0.30, bird: 0,     insects: 0,    cricket: 0.01,  frog: 0,     owl: 0,     rooster: 0,     bell: 0,     chime: 0,     drip: 0.07,  fire: 0,    thunder: 0,     cold: 0 }
  };
  // Ánh xạ map -> biome tường minh cho các map có cảnh rõ; phần còn
  // lại suy theo tiền tố (bí cảnh, sơn môn) rồi rơi về rừng (khớp
  // MAP_THEMES._default vốn là khung rừng).
  var AMBIENCE_MAP = {
    map1: 'village', dong_phu: 'homestead',
    map2: 'forest',
    map3: 'sect',
    map4: 'mountain', map5: 'mountain', map6: 'mountain', map7: 'mountain',
    map8: 'water',
    map9: 'mountain',
    map10: 'volcano', map11: 'frost', map12: 'storm',
    map13: 'mountain', map14: 'mountain',
    map_dai_hoi: 'sect',
    sonmon_huyenam: 'night',   // Huyền Âm Cung: hàn đàm, âm khí — cảnh đêm
    sonmon_ngudoc: 'swamp'     // Ngũ Độc Giáo: đầm độc — ếch/dế đầm lầy
  };
  function biomeFor(mapId) {
    var id = mapId || 'map1';
    if (AMBIENCE_MAP[id]) return AMBIENCE_MAP[id];
    if (id.indexOf('realm_') === 0) return 'cave';
    if (id.indexOf('sonmon_') === 0) return 'sect';
    return 'forest';
  }
  function ambienceFor(mapId) { return AMBIENCES[biomeFor(mapId)] || AMBIENCES.forest; }

  // ==================================================================
  // TRẠNG THÁI ENGINE
  // ==================================================================
  var ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  var level = 'bat';            // 'bat' | 'nho' | 'tat'
  var musicTrim = 1, sfxTrim = 1; // chỉnh riêng 0..1 qua setMusicVol/setSfxVol
  var curMap = 'map1', bossOn = false;
  var activeVoices = 0, MAX_VOICES = 12;
  var lastPlay = {};            // throttle theo khóa tiếng
  var musicNodes = null;        // { padOsc[], padGain, windSrc, windGain, windFilter }
  var schedTimer = null; // (nextNoteIn/bossPulseIn của khung cũ đã bỏ: giai điệu + nhịp boss nay do lớp ngữ cảnh lo)
  var progIdx = 0, progIn = PROG_SEC; // vị trí trong vòng chuyển hợp âm của pad
  // Lớp giai điệu theo NGỮ CẢNH: ctxName = ngữ cảnh ĐANG phát,
  // ctxWanted = ngữ cảnh đích theo trạng thái game (resolveContext),
  // ctxPending = đích đang chờ crossfade xong mới áp. Giai điệu chạy
  // trên ctxGain riêng (nối vào musicBus) để crossfade 2 lớp độc lập
  // với pad/gió (hai lớp đó không bao giờ cắt, như trước).
  var ctxGain = null;
  var ctxName = 'login', ctxWanted = 'login', ctxPending = null, ctxApplyAt = 0;
  var ctxStepIdx = 0, ctxNextT = 0, ctxRound = 0; // ctxRound: đếm vòng giai điệu (cho lead 'alt')
  var mapSeen = false;          // setMap đã gọi ít nhất 1 lần (trước đó = đang ở màn đăng nhập)
  // Lớp ambience theo biome: ambNodes tạo 1 lần trong startMusic
  // (ambBus + 3 nền loop + 2 LFO), curBiome suy từ map hiện tại,
  // ambDuck = hệ số lùi tiếng khi giao chiến (0,6) / boss (0,4).
  var ambNodes = null, curBiome = 'village', ambDuck = 1;
  var AMB_LEVEL = 0.9;          // mức tổng của ambBus trên musicBus
  var combatOn = false, combatFreshAt = 0; // giao chiến thường; tự hết hạn sau 6s không có đòn mới
  var ksCache = {}, ksCount = 0; // bộ đệm Karplus-Strong theo tần số đã làm tròn
  var CTX_LEVEL = 0.85;          // mức tổng của lớp giai điệu trên musicBus
  var delegatedClickArmed = false;

  function nowMs() { return (typeof Date !== 'undefined' && Date.now) ? Date.now() : 0; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function audible() { return !!ctx && level !== 'tat'; }
  function hasCtx() { return !!ctx; }

  // ==================================================================
  // KHỞI TẠO (lười, sau tương tác đầu tiên)
  // ==================================================================
  function ensureCtx() {
    if (ctx) return ctx;
    try {
      var W = (typeof window !== 'undefined') ? window : null;
      var AC = W && (W.AudioContext || W.webkitAudioContext);
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
      // Đệm nhiễu trắng 1,2s dùng chung cho mọi tiếng noise.
      var len = Math.floor(ctx.sampleRate * 1.2);
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      applyLevels();
      startMusic();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() {
    try {
      var c = ensureCtx();
      if (c && c.state === 'suspended' && c.resume) {
        var p = c.resume();
        if (p && p.catch) p.catch(function () {});
      }
      armDelegatedClick();
    } catch (e) {}
    return !!ctx;
  }
  // Mọi nút bấm trong game kêu "click" nhẹ — nghe qua lắng nghe ủy quyền
  // ở document nên không phải sửa từng handler nút.
  function armDelegatedClick() {
    if (delegatedClickArmed) return;
    try {
      if (typeof document === 'undefined' || !document.addEventListener) return;
      delegatedClickArmed = true;
      document.addEventListener('click', function (e) {
        try {
          var t = e && e.target;
          var tag = t && (t.tagName || (t.getAttribute && t.getAttribute('data-tag')));
          if (tag === 'BUTTON' || (t && t.classList && t.classList.contains && t.classList.contains('skill-slot'))) sfx('ui_click');
        } catch (err) {}
      });
    } catch (e) {}
  }
  function applyLevels() {
    if (!ctx) return;
    try {
      var lv = LEVELS[level] || LEVELS.bat;
      musicBus.gain.setTargetAtTime(0.36 * musicTrim * lv.music, ctx.currentTime, 0.1);
      sfxBus.gain.setTargetAtTime(0.9 * sfxTrim * lv.sfx, ctx.currentTime, 0.05);
    } catch (e) {}
  }

  // ==================================================================
  // NGUYÊN THỦY TỔNG HỢP (chỉ gọi khi đã có ctx)
  // ==================================================================
  function tone(o) {
    // o: {type, f0, f1, t (thời điểm bắt đầu tuyệt đối), dur, vol, bus, glideT}
    var t = (o.t != null) ? o.t : ctx.currentTime;
    var osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(20, o.f0), t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + (o.glideT || o.dur));
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol), t + (o.a || 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    var out = o.bus || sfxBus;
    if (o.filter) { // {type, f, q} — chèn lọc giữa osc và bus
      var fl = ctx.createBiquadFilter();
      fl.type = o.filter.type || 'lowpass';
      fl.frequency.value = o.filter.f || 1200;
      if (o.filter.q) fl.Q.value = o.filter.q;
      osc.connect(g); g.connect(fl); fl.connect(out);
    } else { osc.connect(g); g.connect(out); }
    trackVoice(osc); // gắn onended TRƯỚC start/stop để không hụt nhịp giảm đếm
    osc.start(t); osc.stop(t + o.dur + 0.05);
    return osc;
  }
  function noiseHit(o) {
    // o: {t, dur, vol, type (kiểu lọc), f0, f1, q, bus, a}
    var t = (o.t != null) ? o.t : ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    src.playbackRate.value = o.rate || 1;
    var fl = ctx.createBiquadFilter();
    fl.type = o.type || 'bandpass';
    fl.frequency.setValueAtTime(o.f0 || 1200, t);
    if (o.f1) fl.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), t + o.dur);
    fl.Q.value = o.q || 0.9;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol), t + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(fl); fl.connect(g); g.connect(o.bus || sfxBus);
    trackVoice(src);
    src.start(t, Math.random() * 0.8); src.stop(t + o.dur + 0.05);
    return src;
  }
  function trackVoice(node) {
    activeVoices++;
    try { node.onended = function () { activeVoices = Math.max(0, activeVoices - 1); }; } catch (e) {}
  }
  function throttled(key, ms) {
    var n = nowMs();
    if (lastPlay[key] && n - lastPlay[key] < ms) return true;
    lastPlay[key] = n;
    return false;
  }
  // Cổng chung cho mọi tiếng hiệu ứng: tắt ctx / quá tải / nghẽn đều bỏ qua.
  function gate(key, minMs, prio) {
    if (!audible()) return false;
    if (!prio && activeVoices >= MAX_VOICES) return false;
    if (key && throttled(key, minMs || 0)) return false;
    return true;
  }

  // ==================================================================
  // TIẾNG QUÁI + BOSS — công thức theo loài, biến thiên ngẫu nhiên nhẹ
  // ==================================================================
  function V() { return ctx.currentTime; }
  function cluck(t, f, vol) { // cục tác của gà: bật vuông rơi cao độ nhanh
    tone({ type: 'square', f0: f, f1: f * 0.45, t: t, dur: 0.07, vol: vol, a: 0.006 });
    noiseHit({ t: t, dur: 0.04, vol: vol * 0.4, type: 'bandpass', f0: 2200, q: 1.2 });
  }
  function voiceGa(occ, v) {
    var t = V(), f = rnd(680, 760);
    if (occ === 'aggro') { cluck(t, f, v); cluck(t + 0.1, f * 1.05, v); }
    else if (occ === 'attack') { cluck(t, f, v); cluck(t + 0.08, f * 1.1, v); cluck(t + 0.16, f * 0.95, v); }
    else if (occ === 'hit') { tone({ type: 'sawtooth', f0: 950, f1: 480, t: t, dur: 0.12, vol: v * 0.9 }); }
    else { tone({ type: 'sawtooth', f0: 820, f1: 190, t: t, dur: 0.38, vol: v }); cluck(t + 0.05, f, v * 0.7); }
  }
  function voiceTho(occ, v) { // thỏ: tiếng nhỏ, cao, khẽ
    var t = V(), f = rnd(1350, 1500);
    if (occ === 'aggro') { tone({ type: 'sine', f0: f, f1: f * 0.75, t: t, dur: 0.06, vol: v * 0.5 }); tone({ type: 'sine', f0: f * 1.1, f1: f * 0.8, t: t + 0.09, dur: 0.06, vol: v * 0.45 }); }
    else if (occ === 'attack') { tone({ type: 'sine', f0: f * 1.15, f1: f * 0.85, t: t, dur: 0.07, vol: v * 0.5 }); }
    else if (occ === 'hit') { tone({ type: 'sine', f0: 1650, f1: 900, t: t, dur: 0.09, vol: v * 0.8 }); }
    else { tone({ type: 'sine', f0: 1500, f1: 700, t: t, dur: 0.16, vol: v * 0.7 }); tone({ type: 'sine', f0: 1200, f1: 600, t: t + 0.14, dur: 0.18, vol: v * 0.6 }); }
  }
  function growl(t, f, dur, vol, rough) { // gầm gừ: răng cưa trầm + AM thô
    var osc = ctx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f * 0.8), t + dur);
    var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 520;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var am = ctx.createOscillator(); am.type = 'sine'; am.frequency.value = rough || 26;
    var amG = ctx.createGain(); amG.gain.value = vol * 0.55;
    am.connect(amG); amG.connect(g.gain);
    osc.connect(fl); fl.connect(g); g.connect(sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05); am.start(t); am.stop(t + dur + 0.05);
    trackVoice(osc);
  }
  function howl(t, f0, f1, dur, vol) {
    tone({ type: 'triangle', f0: f0, f1: f1, t: t, dur: dur, vol: vol, a: 0.09, glideT: dur * 0.55 });
    tone({ type: 'sine', f0: f0 * 2, f1: f1 * 2, t: t, dur: dur, vol: vol * 0.25, a: 0.09, glideT: dur * 0.55 });
    noiseHit({ t: t, dur: dur * 0.8, vol: vol * 0.12, type: 'highpass', f0: 2500 });
  }
  function voiceSoi(occ, v, big) {
    var t = V(), m = big ? 1 : 1.45; // sói con cao độ gấp ~1,45 sói rừng
    if (occ === 'aggro') {
      if (big) { howl(t, 370 * rnd(0.97, 1.03), 620, 0.75, v); growl(t + 0.1, 105, 0.7, v * 0.5); }
      else { tone({ type: 'sawtooth', f0: 520, f1: 320, t: t, dur: 0.09, vol: v * 0.8 }); tone({ type: 'sawtooth', f0: 540, f1: 330, t: t + 0.12, dur: 0.09, vol: v * 0.8 }); }
    } else if (occ === 'attack') {
      growl(t, 130 * m, 0.3, v, 30);
      noiseHit({ t: t, dur: 0.08, vol: v * 0.5, type: 'bandpass', f0: 1600, q: 1 });
    } else if (occ === 'hit') {
      tone({ type: 'sawtooth', f0: 720 * (big ? 0.8 : 1), f1: 380, t: t, dur: 0.13, vol: v * 0.85 });
    } else {
      howl(t, 500 * (big ? 0.85 : 1.1), 190, 0.6, v * 0.9);
      growl(t + 0.05, 120 * m, 0.45, v * 0.5);
    }
  }
  function grunt(t, f, vol) {
    tone({ type: 'square', f0: f, f1: f * 0.7, t: t, dur: 0.075, vol: vol, a: 0.008 });
    noiseHit({ t: t, dur: 0.06, vol: vol * 0.5, type: 'lowpass', f0: 700 });
  }
  function voiceLon(occ, v, sat) { // sat = lợn mông sắt: trầm hơn + keng kim loại khi trúng đòn
    var t = V(), m = sat ? 0.72 : 1, f = 118 * m * rnd(0.95, 1.05);
    if (occ === 'aggro') { grunt(t, f, v); grunt(t + 0.13, f * 1.05, v); grunt(t + 0.26, f, v * 0.9); tone({ type: 'sine', f0: 66 * m, f1: 45, t: t, dur: 0.16, vol: v * 0.6 }); }
    else if (occ === 'attack') { tone({ type: 'sawtooth', f0: 210 * m, f1: 85 * m, t: t, dur: 0.26, vol: v }); noiseHit({ t: t, dur: 0.14, vol: v * 0.5, type: 'lowpass', f0: 900 }); }
    else if (occ === 'hit') {
      grunt(t, f * 1.2, v);
      if (sat) tone({ type: 'triangle', f0: 880, f1: 620, t: t, dur: 0.06, vol: v * 0.4 }); // keng vào mông sắt
    } else {
      tone({ type: 'sawtooth', f0: 300 * m, f1: 75 * m, t: t, dur: 0.52, vol: v });
      grunt(t + 0.1, f, v * 0.8); grunt(t + 0.3, f * 0.9, v * 0.6);
    }
  }
  function hiss(t, dur, vol, fall) {
    noiseHit({ t: t, dur: dur, vol: vol, type: 'highpass', f0: fall ? 5200 : 4600, f1: fall ? 2400 : null, a: 0.03 });
    noiseHit({ t: t + dur * 0.3, dur: dur * 0.5, vol: vol * 0.5, type: 'highpass', f0: 5800, a: 0.02 });
  }
  function voiceRan(occ, v) {
    var t = V();
    if (occ === 'aggro') hiss(t, 0.55, v, false);
    else if (occ === 'attack') { hiss(t, 0.16, v, false); noiseHit({ t: t, dur: 0.05, vol: v * 0.6, type: 'bandpass', f0: 3000, q: 2 }); }
    else if (occ === 'hit') hiss(t, 0.14, v * 0.9, false);
    else hiss(t, 0.45, v * 0.8, true);
  }
  function voiceKhi(occ, v) {
    var t = V(), n = occ === 'aggro' ? 5 : (occ === 'attack' ? 4 : 2), i, tt = t;
    if (occ === 'death') {
      for (i = 0; i < 4; i++) { tone({ type: 'sawtooth', f0: 1250 - i * 190, f1: 700 - i * 110, t: tt, dur: 0.07, vol: v * (1 - i * 0.16) }); tt += 0.1 + i * 0.035; }
      return;
    }
    if (occ === 'attack' || occ === 'aggro') tone({ type: 'sawtooth', f0: 1650, f1: 900, t: t, dur: 0.18, vol: v * 0.8 });
    for (i = 0; i < n; i++) {
      tone({ type: 'sawtooth', f0: rnd(1150, 1400), f1: rnd(650, 800), t: tt + (occ === 'hit' ? 0 : 0.14), dur: 0.055, vol: v * 0.75 });
      tt += rnd(0.07, 0.11);
    }
    if (occ === 'hit') tone({ type: 'sawtooth', f0: 1700, f1: 1000, t: t, dur: 0.08, vol: v * 0.9 });
  }
  function roar(t, dur, vol, fall) { // GẦM BOSS: sub trầm + răng cưa + hơi thở nhiễu
    tone({ type: 'sine', f0: 56, f1: fall ? 34 : 48, t: t, dur: dur, vol: vol, a: 0.04 });
    var osc = ctx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(88, t);
    osc.frequency.exponentialRampToValueAtTime(fall ? 42 : 58, t + dur);
    var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 320;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * 0.85, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var am = ctx.createOscillator(); am.frequency.value = 19;
    var amG = ctx.createGain(); amG.gain.value = vol * 0.4;
    am.connect(amG); amG.connect(g.gain);
    osc.connect(fl); fl.connect(g); g.connect(sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05); am.start(t); am.stop(t + dur + 0.05);
    trackVoice(osc);
    noiseHit({ t: t, dur: dur * 0.85, vol: vol * 0.45, type: 'lowpass', f0: 420, a: 0.05 });
  }
  function voiceBoss(occ, v) {
    var t = V();
    if (occ === 'aggro') { roar(t, 0.95, v, false); tone({ type: 'sine', f0: 62, f1: 40, t: t + 0.55, dur: 0.3, vol: v * 0.7 }); }
    else if (occ === 'attack') { roar(t, 0.45, v * 0.9, false); tone({ type: 'sine', f0: 68, f1: 38, t: t + 0.05, dur: 0.22, vol: v * 0.8 }); }
    else if (occ === 'hit') { growl(t, 78, 0.28, v * 0.8, 22); }
    else { roar(t, 1.25, v, true); tone({ type: 'sine', f0: 48, f1: 26, t: t + 0.3, dur: 0.8, vol: v * 0.8 }); }
  }
  var VOICE_FNS = {
    ga_rung: voiceGa, tho_hoang: voiceTho,
    soi_con: function (o, v) { voiceSoi(o, v, false); },
    soi_rung: function (o, v) { voiceSoi(o, v, true); },
    lon_rung: function (o, v) { voiceLon(o, v, false); },
    lon_mong_sat: function (o, v) { voiceLon(o, v, true); },
    ran_luc: voiceRan, khi_mat_do: voiceKhi, son_quan: voiceBoss
  };
  function voice(type, occ, opts) {
    try {
      opts = opts || {};
      var fn = VOICE_FNS[type];
      if (!fn || VOICE_OCCASIONS.indexOf(occ) < 0) return false;
      var vol = (opts.vol == null) ? 1 : opts.vol;
      if (vol <= 0.02) return false;
      if (!gate('voice:' + type + ':' + occ, occ === 'hit' ? 90 : 45, occ === 'death' || opts.boss)) return false;
      var base = (type === 'son_quan') ? 0.85 : (type === 'tho_hoang' ? 0.4 : (type === 'khi_mat_do' ? 0.42 : 0.55)); // khỉ mặt đỏ: chuỗi sawtooth vốn réo — hạ riêng (QA đợt 1)
      var v = base * vol * (opts.elite ? 1.25 : 1);
      if (opts.elite) { // tinh anh: trầm và nặng hơn — hạ cao độ bằng rate trick trên tone không có;
        // thay bằng tăng vol + thêm lớp sub đi kèm cho các loài có tiếng trầm.
        tone({ type: 'sine', f0: 70, f1: 50, t: V(), dur: 0.18, vol: v * 0.35 });
      }
      fn(occ, Math.min(1, v));
      return true;
    } catch (e) { return false; }
  }

  // ==================================================================
  // TIẾNG HIỆU ỨNG GAMEPLAY / UI
  // ==================================================================
  function pluck(t, f, vol, dur) {
    tone({ type: 'sine', f0: f, t: t, dur: dur || 0.5, vol: vol, a: 0.008 });
    tone({ type: 'triangle', f0: f * 2, t: t, dur: (dur || 0.5) * 0.5, vol: vol * 0.3, a: 0.006 });
  }
  // Chuông/đồng khánh: tổng hợp cộng các partial phi hài (1, 2.02,
  // 2.74, 3.76) tắt dần theo bậc — dùng cho các mốc trang trọng/thắng.
  function bell(t, f, vol, dur, bus) {
    [1, 2.02, 2.74, 3.76].forEach(function (p, i) {
      tone({ type: 'sine', f0: f * p, t: t, dur: (dur || 1.2) * (1 - i * 0.18), vol: vol / (i + 1), a: 0.005, bus: bus || sfxBus });
    });
  }
  var SFX_FNS = {
    swing: function () { noiseHit({ dur: 0.09, vol: 0.16, type: 'bandpass', f0: 1500, f1: 480, q: 1.1 }); },
    swing_miss: function () { noiseHit({ dur: 0.13, vol: 0.09, type: 'bandpass', f0: 950, f1: 320, q: 1 }); },
    hit: function () {
      noiseHit({ dur: 0.05, vol: 0.3, type: 'bandpass', f0: 2100, q: 0.8 });
      tone({ type: 'square', f0: 210, f1: 120, dur: 0.06, vol: 0.18 });
    },
    hit_crit: function () {
      noiseHit({ dur: 0.05, vol: 0.32, type: 'bandpass', f0: 2300, q: 0.8 });
      tone({ type: 'triangle', f0: 2450, f1: 1900, dur: 0.13, vol: 0.22 });
      tone({ type: 'square', f0: 300, f1: 150, dur: 0.07, vol: 0.2 });
    },
    hit_small: function () { noiseHit({ dur: 0.04, vol: 0.14, type: 'bandpass', f0: 1900, q: 0.8 }); },
    poison_tick: function () { // Độc rắn lục rút HP mỗi giây: blip trầm khẽ, khác hẳn hurt to + trầm (QA (e) 20:16 31/10).
      tone({ type: 'sine', f0: 280, f1: 160, dur: 0.14, vol: 0.10 });
    },
    hurt: function () {
      tone({ type: 'sine', f0: 165, f1: 88, dur: 0.16, vol: 0.34 });
      noiseHit({ dur: 0.08, vol: 0.14, type: 'lowpass', f0: 800 });
    },
    player_death: function () {
      tone({ type: 'sawtooth', f0: 320, f1: 58, dur: 0.85, vol: 0.3, filter: { type: 'lowpass', f: 700 } });
      tone({ type: 'sine', f0: 70, f1: 34, t: V() + 0.1, dur: 0.5, vol: 0.4 });
    },
    breakthrough: function () { // chuông trang trọng + ngũ cung đi lên
      var t = V(), partials = [523.25, 783.99, 1046.5, 1567.98];
      partials.forEach(function (f, i) { tone({ type: 'sine', f0: f, t: t, dur: 1.5 - i * 0.25, vol: 0.22 / (i + 1), a: 0.005 }); });
      [523.25, 587.33, 659.25, 783.99, 880.0].forEach(function (f, i) { pluck(t + 0.25 + i * 0.11, f, 0.16, 0.7); });
      noiseHit({ t: t, dur: 0.7, vol: 0.05, type: 'highpass', f0: 6000 });
    },
    kyngo: function () { // giếng cổ lộ linh căn: lấp lánh kỳ ảo
      var t = V();
      [659.25, 880.0, 1174.66, 1567.98, 2093.0].forEach(function (f, i) { pluck(t + i * 0.07, f, 0.13, 0.8); });
      noiseHit({ t: t, dur: 0.5, vol: 0.05, type: 'highpass', f0: 7000 });
    },
    quest_accept: function () { var t = V(); pluck(t, 659.25, 0.16, 0.4); pluck(t + 0.12, 880.0, 0.16, 0.5); },
    quest_complete: function () {
      var t = V();
      [523.25, 659.25, 783.99].forEach(function (f, i) { pluck(t + i * 0.1, f, 0.17, 0.55); });
      pluck(t + 0.34, 1046.5, 0.15, 0.8);
      tone({ type: 'triangle', f0: 1960, f1: 2500, t: t + 0.36, dur: 0.1, vol: 0.1 });
    },
    ui_click: function () { tone({ type: 'triangle', f0: 980, dur: 0.035, vol: 0.07 }); },
    pickup: function () {
      var t = V();
      tone({ type: 'sine', f0: 520, f1: 940, t: t, dur: 0.07, vol: 0.2 });
      tone({ type: 'triangle', f0: 1860, t: t + 0.04, dur: 0.09, vol: 0.1 });
    },
    pickup_weapon: function () {
      var t = V();
      tone({ type: 'sine', f0: 520, f1: 940, t: t, dur: 0.07, vol: 0.2 });
      [1318.5, 1760.0].forEach(function (f, i) { tone({ type: 'triangle', f0: f, t: t + 0.06 + i * 0.06, dur: 0.16, vol: 0.13 }); });
    },
    coin: function () { tone({ type: 'triangle', f0: 1750, dur: 0.05, vol: 0.055 }); },
    shop_buy: function () { // mua: đồng xu rời tay (keng trầm dần) + tiếng nhận đồ khẽ
      var t = V();
      tone({ type: 'triangle', f0: 1560, t: t, dur: 0.05, vol: 0.06 });
      tone({ type: 'triangle', f0: 1170, t: t + 0.055, dur: 0.06, vol: 0.055 });
      tone({ type: 'sine', f0: 720, f1: 990, t: t + 0.03, dur: 0.07, vol: 0.07 });
    },
    shop_sell: function () { // bán: tiền về túi — hai tiếng keng sáng đi lên
      var t = V();
      tone({ type: 'triangle', f0: 1750, t: t, dur: 0.05, vol: 0.06 });
      tone({ type: 'triangle', f0: 2093, t: t + 0.055, dur: 0.07, vol: 0.065 });
      tone({ type: 'sine', f0: 2637, t: t + 0.1, dur: 0.05, vol: 0.03 });
    },
    use_item: function () { // uống đan: ực nhẹ + hơi ấm hồi phục
      var t = V();
      tone({ type: 'sine', f0: 300, f1: 540, t: t, dur: 0.13, vol: 0.2, a: 0.02 });
      tone({ type: 'sine', f0: 392, t: t + 0.1, dur: 0.35, vol: 0.1 });
      tone({ type: 'sine', f0: 587.33, t: t + 0.16, dur: 0.3, vol: 0.06 });
    },
    portal: function () {
      var t = V();
      noiseHit({ t: t, dur: 0.38, vol: 0.16, type: 'bandpass', f0: 380, f1: 2500, q: 1.4 });
      tone({ type: 'sine', f0: 290, f1: 920, t: t, dur: 0.34, vol: 0.12, glideT: 0.3 });
      tone({ type: 'sine', f0: 920, f1: 660, t: t + 0.36, dur: 0.18, vol: 0.07 });
    },
    meditate: function () {
      var t = V();
      tone({ type: 'sine', f0: 528, t: t, dur: 0.45, vol: 0.11 });
      tone({ type: 'sine', f0: 792, t: t + 0.09, dur: 0.4, vol: 0.06 });
    },
    gather: function () {
      noiseHit({ dur: 0.16, vol: 0.13, type: 'lowpass', f0: 1100 });
      tone({ type: 'sine', f0: 480, f1: 760, t: V() + 0.1, dur: 0.06, vol: 0.12 });
    },
    plant: function () { // gieo hạt: hạt chạm đất mềm — bụp trầm + vỗ đất nhẹ hai nhịp
      var t = V();
      noiseHit({ t: t, dur: 0.09, vol: 0.17, type: 'lowpass', f0: 520 });
      tone({ type: 'sine', f0: 150, f1: 88, t: t, dur: 0.09, vol: 0.21 });
      noiseHit({ t: t + 0.08, dur: 0.06, vol: 0.09, type: 'lowpass', f0: 700 });
    },
    fly_whoosh: function () { // cất cánh/hạ cánh ngự kiếm: gió quét lên rồi lắng (QA 15:16 30/10 — trước đây bay lên/xuống im lặng tuyệt đối)
      var t = V();
      noiseHit({ t: t, dur: 0.42, vol: 0.14, type: 'bandpass', f0: 480, f1: 1750, q: 1.1, a: 0.05 });
      tone({ type: 'sine', f0: 1567.98, t: t + 0.1, dur: 0.18, vol: 0.04 });
    },
    revive: function () { // hồi sinh sau khi gục: chuông nhỏ ngân lên hai nốt — đối nghịch tiếng chết trầm (QA 16:31 30/10)
      var t = V();
      tone({ type: 'sine', f0: 523.25, t: t, dur: 0.3, vol: 0.12 });
      tone({ type: 'sine', f0: 783.99, t: t + 0.14, dur: 0.42, vol: 0.12 });
      noiseHit({ t: t, dur: 0.3, vol: 0.05, type: 'bandpass', f0: 2400, q: 2 });
    },
    formation: function () { // cắm/thu/tan trận kỳ: trầm rung một nhịp + keng đá nhỏ — một tiếng dùng chung cho cả vòng đời trận (QA 15:16 30/10)
      var t = V();
      tone({ type: 'sine', f0: 130, f1: 82, t: t, dur: 0.28, vol: 0.2 });
      tone({ type: 'triangle', f0: 1567.98, t: t + 0.03, dur: 0.14, vol: 0.06 });
      noiseHit({ t: t, dur: 0.16, vol: 0.08, type: 'bandpass', f0: 900, q: 1.4 });
    },
    water: function () { // tưới nước giếng: dòng nước rót quét lên + vài giọt rơi leng keng cuối dòng
      var t = V();
      noiseHit({ t: t, dur: 0.55, vol: 0.10, type: 'bandpass', f0: 850, f1: 1650, q: 0.7, a: 0.05 });
      noiseHit({ t: t + 0.06, dur: 0.4, vol: 0.05, type: 'bandpass', f0: 2400, q: 1.2, a: 0.05 });
      [1960, 2210, 1760].forEach(function (f, i) {
        tone({ type: 'sine', f0: f, f1: f * 0.62, t: t + 0.34 + i * 0.09, dur: 0.05, vol: 0.045 });
      });
    },
    capture_miss: function () { // thu phục TRƯỢT: bùa vút qua hụt + trượt xuống buồn — khác hẳn arpeggio thành công
      var t = V();
      noiseHit({ t: t, dur: 0.2, vol: 0.13, type: 'bandpass', f0: 2500, f1: 480, q: 1.3 });
      tone({ type: 'triangle', f0: 660, f1: 235, t: t + 0.05, dur: 0.26, vol: 0.11, glideT: 0.22 });
    },
    break_fail: function () { // đột phá/độ kiếp THẤT BẠI: linh khí tán loạn trầm xuống, không chuông
      var t = V();
      tone({ type: 'sine', f0: 220, f1: 104, t: t, dur: 0.65, vol: 0.2, a: 0.02 });
      tone({ type: 'triangle', f0: 165, f1: 82, t: t + 0.07, dur: 0.55, vol: 0.12 });
      noiseHit({ t: t, dur: 0.3, vol: 0.07, type: 'lowpass', f0: 420 });
    },
    artifact_cast: function () {
      var t = V();
      [880.0, 1174.66, 1567.98].forEach(function (f, i) { pluck(t + i * 0.05, f, 0.13, 0.5); });
    },
    ice_tick: function () {
      tone({ type: 'sine', f0: 2650, f1: 1750, dur: 0.06, vol: 0.13 });
      noiseHit({ dur: 0.045, vol: 0.09, type: 'highpass', f0: 5200 });
    },
    fire_tick: function () { noiseHit({ dur: 0.11, vol: 0.11, type: 'lowpass', f0: 950 }); },
    zap_small: function () {
      tone({ type: 'square', f0: 190, f1: 55, dur: 0.07, vol: 0.16 });
      noiseHit({ dur: 0.05, vol: 0.13, type: 'highpass', f0: 3800 });
    },
    boom_small: function () {
      tone({ type: 'sine', f0: 95, f1: 38, dur: 0.26, vol: 0.3 });
      noiseHit({ dur: 0.2, vol: 0.14, type: 'lowpass', f0: 500 });
    },
    tourn_drum: function () { // trống trận Đại Hội: 3 hồi trầm dồn dập dần
      var t = V();
      for (var i = 0; i < 3; i++) {
        tone({ type: 'sine', f0: 128, f1: 52, t: t + i * 0.24, dur: 0.24, vol: 0.30 + i * 0.07 });
        noiseHit({ t: t + i * 0.24, dur: 0.09, vol: 0.12, type: 'lowpass', f0: 850 });
      }
    },
    tourn_cheer: function () { // khán đài reo: sóng nhiễu vỗ tay + ngũ cung mừng thắng
      var t = V();
      noiseHit({ t: t, dur: 1.15, vol: 0.13, type: 'bandpass', f0: 750, f1: 1350, q: 0.7 });
      noiseHit({ t: t + 0.18, dur: 0.8, vol: 0.09, type: 'bandpass', f0: 1500, q: 0.9 });
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { pluck(t + 0.08 + i * 0.13, f, 0.11, 0.6); });
    },
    realm_clear: function () { // DỌN XONG BÍ CẢNH: chuông thắng + ngũ cung đi lên + hợp âm giữ (QA (e) 02:38 — trước đây khoảnh khắc thưởng lớn nhất game câm hoàn toàn)
      var t = V();
      bell(t, 523.25, 0.20, 1.6);
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { pluck(t + 0.12 + i * 0.1, f, 0.15, 0.8); });
      tone({ type: 'triangle', f0: 261.63, t: t + 0.1, dur: 1.1, vol: 0.05 });
      tone({ type: 'triangle', f0: 392.0, t: t + 0.1, dur: 1.1, vol: 0.05 });
      noiseHit({ t: t + 0.1, dur: 0.8, vol: 0.04, type: 'highpass', f0: 6500 });
    },
    auction_bid: function () { // TRẢ GIÁ đấu giá: "ting" gọn — một nhịp kim loại sáng, nghe là biết giá vừa nhích
      var t = V();
      tone({ type: 'triangle', f0: 2093.0, t: t, dur: 0.06, vol: 0.10 });
      tone({ type: 'triangle', f0: 1567.98, t: t + 0.045, dur: 0.09, vol: 0.09 });
      tone({ type: 'sine', f0: 2637.0, t: t + 0.02, dur: 0.05, vol: 0.035 });
    },
    auction_win: function () { // GÕ BÚA THẮNG LÔ: chuông vui hai nhịp + gảy đi lên (QA (e) 02:38 — trước đây thắng lô câm)
      var t = V();
      bell(t, 783.99, 0.16, 1.1);
      bell(t + 0.16, 1046.5, 0.13, 1.3);
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { pluck(t + 0.05 + i * 0.08, f, 0.12, 0.6); });
    },
    sect_join: function () { // BÁI NHẬP TÔNG: chuông trang nghiêm trầm + hợp âm tông chậm (mục 49 hàng chờ — tiếng cuối cùng còn thiếu)
      var t = V();
      bell(t, 392.0, 0.22, 2.0);
      [392.0, 523.25, 587.33].forEach(function (f, i) { pluck(t + 0.18 + i * 0.16, f, 0.13, 0.9); });
      bell(t + 0.72, 1174.66, 0.05, 1.0);
    },
    season_change: function () { // SANG MÙA MỚI (Bảng Mùa đổi quý): chuông nhỏ hai nốt + gió đổi chiều quét qua
      var t = V();
      bell(t, 659.25, 0.10, 0.9);
      bell(t + 0.22, 783.99, 0.09, 1.1);
      noiseHit({ t: t, dur: 0.7, vol: 0.06, type: 'bandpass', f0: 500, f1: 1500, q: 0.9, a: 0.08 });
    },
    codex_open: function () { // MỞ ĐỒ GIÁM LẦN ĐẦU: tiếng giở sổ — giấy quét + gảy khẽ một nốt như lật trang đầu
      var t = V();
      noiseHit({ t: t, dur: 0.14, vol: 0.10, type: 'bandpass', f0: 900, f1: 2400, q: 0.8 });
      noiseHit({ t: t + 0.05, dur: 0.1, vol: 0.06, type: 'lowpass', f0: 700 });
      pluck(t + 0.1, 880.0, 0.08, 0.4);
    },
    footstep: function () { // BƯỚC CHÂN: bụp trầm rất khẽ + ma sát đất — gọi đúng nhịp chân chạm đất của vòng di chuyển, có biến thiên nhẹ
      var t = V();
      noiseHit({ t: t, dur: 0.05, vol: 0.045, type: 'lowpass', f0: rnd(420, 560) });
      tone({ type: 'sine', f0: rnd(88, 102), f1: 58, t: t, dur: 0.045, vol: 0.028 });
    }
  };
  function sfx(name, opts) {
    try {
      var fn = SFX_FNS[name];
      if (!fn) return false;
      var minMs = (name === 'ui_click') ? 40 : (name === 'coin' ? 160 : (name === 'hit_small' ? 70 :
        (name === 'footstep' ? 90 :
        (name === 'shop_buy' || name === 'shop_sell' ? 90 :
        (name === 'plant' || name === 'water' ? 80 :
        (name === 'realm_clear' || name === 'sect_join' || name === 'auction_win' || name === 'season_change' ? 300 :
        (name === 'capture_miss' ? 120 : (name === 'break_fail' ? 200 : 30))))))));
      if (!gate('sfx:' + name, minMs, name === 'breakthrough' || name === 'player_death' || name === 'break_fail')) return false;
      fn();
      return true;
    } catch (e) { return false; }
  }

  // ==================================================================
  // TIẾNG SKILL — bám hình thái hiệu ứng của từng chiêu / từng hệ
  // ==================================================================
  function skillSound(id, root) {
    var t = V();
    if (id === 'combo') { SFX_FNS.swing(); return; }
    if (id === 'kiem_khi') {
      noiseHit({ t: t, dur: 0.24, vol: 0.22, type: 'bandpass', f0: 620, f1: 2300, q: 1.2 });
      tone({ type: 'sawtooth', f0: 220, f1: 330, t: t, dur: 0.2, vol: 0.05, filter: { type: 'lowpass', f: 900 } });
      return;
    }
    if (id === 'toan_phong') {
      noiseHit({ t: t, dur: 0.62, vol: 0.2, type: 'bandpass', f0: 480, f1: 1750, q: 1.6 });
      noiseHit({ t: t + 0.3, dur: 0.32, vol: 0.14, type: 'bandpass', f0: 1750, f1: 520, q: 1.6 });
      return;
    }
    if (id === 'luu_tinh') {
      noiseHit({ t: t, dur: 0.3, vol: 0.22, type: 'bandpass', f0: 850, f1: 3100, q: 1.3 });
      [1567.98, 2093.0].forEach(function (f, i) { tone({ type: 'sine', f0: f, t: t + 0.05 + i * 0.05, dur: 0.14, vol: 0.07 }); });
      return;
    }
    if (id === 'ngu_kiem') {
      tone({ type: 'sine', f0: 1567.98, t: t, dur: 0.6, vol: 0.14 });
      tone({ type: 'sawtooth', f0: 110, t: t + 0.05, dur: 0.5, vol: 0.045, filter: { type: 'lowpass', f: 500 } });
      noiseHit({ t: t, dur: 0.18, vol: 0.1, type: 'bandpass', f0: 2400, q: 2 });
      return;
    }
    if (id === 'thien_can') {
      if (root === 'kim') { // mưa kim kiếm: chuỗi keng kim loại giáng xuống
        for (var i = 0; i < 7; i++) tone({ type: 'triangle', f0: rnd(1750, 2650), t: t + i * rnd(0.035, 0.055), dur: 0.16, vol: 0.13 });
        tone({ type: 'sine', f0: 130, f1: 70, t: t + 0.3, dur: 0.2, vol: 0.2 });
      } else if (root === 'moc') {
        noiseHit({ t: t, dur: 0.42, vol: 0.15, type: 'bandpass', f0: 1250, q: 0.7 });
        pluck(t + 0.05, 392.0, 0.14, 0.6); pluck(t + 0.16, 523.25, 0.12, 0.6);
      } else if (root === 'thuy') {
        noiseHit({ t: t, dur: 0.5, vol: 0.24, type: 'lowpass', f0: 320, f1: 980, q: 0.8 });
        tone({ type: 'sine', f0: 118, f1: 82, t: t, dur: 0.45, vol: 0.16 });
        tone({ type: 'sine', f0: 2350, t: t + 0.3, dur: 0.08, vol: 0.05 });
      } else if (root === 'hoa') {
        noiseHit({ t: t, dur: 0.42, vol: 0.3, type: 'lowpass', f0: 480, f1: 160, a: 0.02 });
        tone({ type: 'sine', f0: 92, f1: 40, t: t, dur: 0.35, vol: 0.32 });
        for (var j = 0; j < 4; j++) noiseHit({ t: t + 0.18 + j * rnd(0.05, 0.1), dur: 0.05, vol: 0.08, type: 'bandpass', f0: rnd(900, 1800), q: 2 });
      } else if (root === 'tho') {
        noiseHit({ t: t, dur: 0.5, vol: 0.26, type: 'lowpass', f0: 210, a: 0.02 });
        noiseHit({ t: t + 0.08, dur: 0.07, vol: 0.2, type: 'bandpass', f0: 320, q: 1 });
        tone({ type: 'sine', f0: 56, f1: 36, t: t, dur: 0.55, vol: 0.34 });
      } else if (root === 'phong') {
        noiseHit({ t: t, dur: 0.72, vol: 0.24, type: 'bandpass', f0: 420, f1: 1650, q: 1.8 });
        noiseHit({ t: t + 0.36, dur: 0.36, vol: 0.17, type: 'bandpass', f0: 1650, f1: 640, q: 1.8 });
      } else if (root === 'loi') { // thiên lôi: chớp nổ + ầm trầm + lách tách đuôi
        noiseHit({ t: t, dur: 0.09, vol: 0.4, type: 'highpass', f0: 2600 });
        tone({ type: 'sine', f0: 74, f1: 33, t: t, dur: 0.55, vol: 0.42 });
        noiseHit({ t: t + 0.02, dur: 0.4, vol: 0.22, type: 'lowpass', f0: 700 });
        for (var k = 0; k < 5; k++) noiseHit({ t: t + 0.12 + k * rnd(0.05, 0.11), dur: 0.03, vol: 0.09, type: 'highpass', f0: 4200 });
      } else if (root === 'bang') { // băng vỡ: tinh thể kêu leng keng rồi rạn
        for (var b = 0; b < 5; b++) tone({ type: 'sine', f0: rnd(2750, 3850), t: t + b * rnd(0.03, 0.06), dur: 0.2, vol: 0.1 });
        noiseHit({ t: t, dur: 0.22, vol: 0.14, type: 'highpass', f0: 4800 });
        tone({ type: 'sine', f0: 1180, f1: 940, t: t + 0.05, dur: 0.42, vol: 0.07 });
      } else { // chưa lộ linh căn / hệ lạ: dồn khí trầm
        tone({ type: 'sine', f0: 196, f1: 392, t: t, dur: 0.4, vol: 0.14 });
        noiseHit({ t: t, dur: 0.3, vol: 0.12, type: 'bandpass', f0: 900, f1: 1600, q: 1.2 });
      }
      return;
    }
    // ---- 10 chiêu cảnh giới cao (QA 15:16 30/10): mỗi chiêu một
    // bản tiếng riêng ghép từ nguyên liệu sẵn có, bám hệ + hình thái.
    if (id === 'xuyen_van') { // kiếm khí xuyên mây: vút cao, nhanh, có tiếng keng kim ở cuối đường bay
      noiseHit({ t: t, dur: 0.3, vol: 0.24, type: 'bandpass', f0: 900, f1: 3400, q: 1.3 });
      tone({ type: 'sine', f0: 2093.0, t: t + 0.16, dur: 0.12, vol: 0.07 });
      tone({ type: 'sawtooth', f0: 262, f1: 392, t: t, dur: 0.18, vol: 0.04, filter: { type: 'lowpass', f: 900 } });
      return;
    }
    if (id === 'pha_huyen') { // nhất kiếm phá huyền: một nhát nặng, trầm, dứt khoát
      noiseHit({ t: t, dur: 0.38, vol: 0.3, type: 'bandpass', f0: 500, f1: 2600, q: 1.1 });
      tone({ type: 'sine', f0: 90, f1: 48, t: t, dur: 0.32, vol: 0.3 });
      tone({ type: 'sine', f0: 1567.98, t: t + 0.05, dur: 0.34, vol: 0.05 });
      return;
    }
    if (id === 'linh_khien') { // khiên linh khí: ù ấm lên như bong bóng khí dựng quanh người
      tone({ type: 'sine', f0: 392.0, f1: 523.25, t: t, dur: 0.5, vol: 0.13 });
      tone({ type: 'triangle', f0: 783.99, t: t + 0.08, dur: 0.4, vol: 0.05 });
      noiseHit({ t: t, dur: 0.4, vol: 0.06, type: 'lowpass', f0: 600 });
      return;
    }
    if (id === 'dan_hoa') { // đan hỏa liệu thiên: bùng lửa + nổ nhỏ + tàn lửa lách tách
      noiseHit({ t: t, dur: 0.45, vol: 0.3, type: 'lowpass', f0: 520, f1: 170, a: 0.02 });
      tone({ type: 'sine', f0: 98, f1: 42, t: t, dur: 0.38, vol: 0.3 });
      for (var fh = 0; fh < 4; fh++) noiseHit({ t: t + 0.2 + fh * rnd(0.05, 0.1), dur: 0.05, vol: 0.08, type: 'bandpass', f0: rnd(900, 1800), q: 2 });
      return;
    }
    if (id === 'than_loi') { // ngũ lôi oanh đỉnh: chớp nổ gọn + lách tách đuôi (nhẹ hơn Lôi Kiếp)
      noiseHit({ t: t, dur: 0.08, vol: 0.34, type: 'highpass', f0: 2400 });
      tone({ type: 'sine', f0: 82, f1: 38, t: t, dur: 0.42, vol: 0.36 });
      for (var th = 0; th < 3; th++) noiseHit({ t: t + 0.1 + th * rnd(0.05, 0.1), dur: 0.03, vol: 0.08, type: 'highpass', f0: 4200 });
      return;
    }
    if (id === 'loi_kiep') { // cửu thiên lôi kiếp: sấm lớn hai lớp, trầm và dài nhất trong các chiêu lôi
      noiseHit({ t: t, dur: 0.1, vol: 0.42, type: 'highpass', f0: 2600 });
      tone({ type: 'sine', f0: 68, f1: 30, t: t, dur: 0.7, vol: 0.44 });
      noiseHit({ t: t + 0.03, dur: 0.5, vol: 0.24, type: 'lowpass', f0: 700 });
      noiseHit({ t: t + 0.28, dur: 0.08, vol: 0.3, type: 'highpass', f0: 2200 });
      tone({ type: 'sine', f0: 55, f1: 28, t: t + 0.28, dur: 0.5, vol: 0.3 });
      for (var lk = 0; lk < 5; lk++) noiseHit({ t: t + 0.14 + lk * rnd(0.05, 0.11), dur: 0.03, vol: 0.09, type: 'highpass', f0: 4200 });
      return;
    }
    if (id === 'phan_than') { // nguyên anh xuất khiếu: hai nốt lơ lửng lệch pha như bóng tách khỏi thân
      tone({ type: 'sine', f0: 783.99, t: t, dur: 0.65, vol: 0.1 });
      tone({ type: 'sine', f0: 1174.66, t: t + 0.09, dur: 0.55, vol: 0.07 });
      noiseHit({ t: t, dur: 0.5, vol: 0.08, type: 'bandpass', f0: 700, f1: 1500, q: 1.4 });
      return;
    }
    if (id === 'tran_ap') { // trấn áp hồn phách: áp lực trầm đè xuống, quét tần đi xuống
      tone({ type: 'sine', f0: 65, f1: 38, t: t, dur: 0.6, vol: 0.36 });
      noiseHit({ t: t, dur: 0.5, vol: 0.2, type: 'bandpass', f0: 1200, f1: 200, q: 1.1 });
      noiseHit({ t: t + 0.05, dur: 0.4, vol: 0.14, type: 'lowpass', f0: 210 });
      return;
    }
    if (id === 'linh_vuc') { // lĩnh vực hóa thần: ngân dài hai lớp, quét sáng dần
      tone({ type: 'sine', f0: 261.63, t: t, dur: 0.8, vol: 0.1 });
      tone({ type: 'sine', f0: 392.0, t: t + 0.12, dur: 0.7, vol: 0.08 });
      noiseHit({ t: t, dur: 0.75, vol: 0.07, type: 'bandpass', f0: 500, f1: 1900, q: 1.6 });
      return;
    }
    if (id === 'kiem_tran') { // thiên điều kiếm trận: mưa keng kim loại giáng xuống như Thiên Căn hệ Kim nhưng dày hơn
      for (var kt = 0; kt < 9; kt++) tone({ type: 'triangle', f0: rnd(1750, 2650), t: t + kt * rnd(0.03, 0.05), dur: 0.16, vol: 0.12 });
      tone({ type: 'sine', f0: 130, f1: 65, t: t + 0.34, dur: 0.24, vol: 0.2 });
      noiseHit({ t: t, dur: 0.3, vol: 0.1, type: 'bandpass', f0: 800, f1: 2400, q: 1.2 });
      return;
    }
    // ---- 32 chiêu bí tịch (lượt 31/10): mỗi chiêu một bản tiếng
    // riêng theo đúng mech + khí chất trong manuals.js. ----
    if (id === 'tp_kiem_tran') { // phong kiếm giáng cắm quanh mục tiêu: gió quét + 6 keng thưa hơn kiếm trận Thiên Điều
      noiseHit({ t: t, dur: 0.4, vol: 0.16, type: 'bandpass', f0: 500, f1: 1500, q: 1.4 });
      for (var tp = 0; tp < 6; tp++) tone({ type: 'triangle', f0: rnd(1500, 2300), t: t + 0.06 + tp * rnd(0.045, 0.07), dur: 0.15, vol: 0.11 });
      return;
    }
    if (id === 'hp_ngu_hanh') { // ngũ hành luân chuyển: 5 nốt gảy 5 "màu" nối vòng
      [523.25, 587.33, 659.25, 783.99, 880.0].forEach(function (f, i) { pluck(t + i * 0.07, f, 0.14, 0.5); });
      noiseHit({ t: t, dur: 0.35, vol: 0.08, type: 'bandpass', f0: 800, f1: 1600, q: 1.2 });
      return;
    }
    if (id === 'tc_pha_son') { // chùy phá sơn nện đất nứt đường thẳng: bụp ngàn cân + nứt toác + đá đội
      tone({ type: 'sine', f0: 84, f1: 36, t: t, dur: 0.42, vol: 0.36 });
      noiseHit({ t: t + 0.02, dur: 0.3, vol: 0.24, type: 'lowpass', f0: 300 });
      noiseHit({ t: t + 0.1, dur: 0.22, vol: 0.16, type: 'bandpass', f0: 260, f1: 700, q: 1.1 });
      return;
    }
    if (id === 'dh_dan_hoa') { // đan hỏa liệu nguyên: lửa lò nén bùng tại điểm + khánh lò khẽ
      noiseHit({ t: t, dur: 0.4, vol: 0.3, type: 'lowpass', f0: 560, f1: 180, a: 0.015 });
      tone({ type: 'sine', f0: 104, f1: 44, t: t, dur: 0.34, vol: 0.28 });
      bell(t + 0.05, 1567.98, 0.05, 0.7);
      return;
    }
    if (id === 'vt_hao_lenh') { // hào lệnh vạn thú: tiếng hiệu trầm + nhịp gảy dồn như bầy thú xúm lại
      tone({ type: 'sawtooth', f0: 196, f1: 147, t: t, dur: 0.4, vol: 0.1, filter: { type: 'lowpass', f: 700 } });
      noiseHit({ t: t, dur: 0.3, vol: 0.14, type: 'lowpass', f0: 500 });
      [392.0, 392.0, 523.25].forEach(function (f, i) { pluck(t + 0.12 + i * 0.09, f, 0.12, 0.4); });
      return;
    }
    if (id === 'tphu_kiem_tran') { // kim phù hóa kiếm: giấy cháy xì + phù kiếm keng vàng
      noiseHit({ t: t, dur: 0.2, vol: 0.16, type: 'bandpass', f0: 1400, f1: 3200, q: 1.0 });
      for (var tf = 0; tf < 5; tf++) tone({ type: 'triangle', f0: rnd(1900, 2600), t: t + 0.1 + tf * rnd(0.04, 0.06), dur: 0.14, vol: 0.1 });
      bell(t, 2093.0, 0.04, 0.5);
      return;
    }
    if (id === 'cc_khon_tran') { // cửu cung khốn trận: ù trận dâng + chuông trận trầm + quét khí níu chân
      tone({ type: 'sine', f0: 174.61, t: t, dur: 0.7, vol: 0.12 });
      tone({ type: 'sine', f0: 261.63, t: t + 0.1, dur: 0.6, vol: 0.08 });
      noiseHit({ t: t, dur: 0.6, vol: 0.1, type: 'bandpass', f0: 900, f1: 300, q: 1.3 });
      bell(t + 0.02, 587.33, 0.06, 1.0);
      return;
    }
    if (id === 'kc_bat_hoai') { // kim cang bất hoại: chuông đồng trầm vang + thân khiên dựng chắc
      bell(t, 392.0, 0.16, 1.4);
      tone({ type: 'sine', f0: 130.81, f1: 196.0, t: t, dur: 0.5, vol: 0.12 });
      noiseHit({ t: t, dur: 0.25, vol: 0.08, type: 'lowpass', f0: 500 });
      return;
    }
    if (id === 'nd_thuc_cot') { // chướng độc phun: xì độc + bong bóng độc sôi khẽ
      noiseHit({ t: t, dur: 0.35, vol: 0.2, type: 'bandpass', f0: 700, f1: 300, q: 0.9 });
      for (var nd = 0; nd < 4; nd++) tone({ type: 'sine', f0: rnd(300, 520), f1: rnd(120, 200), t: t + 0.05 + nd * rnd(0.05, 0.09), dur: 0.09, vol: 0.07 });
      return;
    }
    if (id === 'ha_han_tien') { // hàn tiễn: vút lạnh + tinh thể leng keng ở đuôi
      noiseHit({ t: t, dur: 0.26, vol: 0.2, type: 'bandpass', f0: 1000, f1: 3600, q: 1.3 });
      tone({ type: 'sine', f0: rnd(2900, 3400), t: t + 0.12, dur: 0.16, vol: 0.07 });
      tone({ type: 'sine', f0: 1174.66, f1: 880.0, t: t, dur: 0.3, vol: 0.05 });
      return;
    }
    if (id === 'boss_lang_hao') { // huyết nguyệt lang hào: tiếng hú vút lên rồi sóng chấn quanh thân
      tone({ type: 'sine', f0: 440, f1: 880, t: t, dur: 0.5, vol: 0.13 });
      tone({ type: 'sine', f0: 883, f1: 660, t: t + 0.5, dur: 0.3, vol: 0.1 });
      noiseHit({ t: t + 0.15, dur: 0.4, vol: 0.16, type: 'lowpass', f0: 400 });
      return;
    }
    if (id === 'boss_ho_gam') { // hổ gầm trấn núi dội xuống vùng: gầm trầm lớn + đất rung
      tone({ type: 'sawtooth', f0: 110, f1: 65, t: t, dur: 0.55, vol: 0.2, filter: { type: 'lowpass', f: 500 } });
      tone({ type: 'sine', f0: 58, f1: 34, t: t, dur: 0.6, vol: 0.32 });
      noiseHit({ t: t, dur: 0.45, vol: 0.2, type: 'lowpass', f0: 260 });
      return;
    }
    if (id === 'boss_xa_thuc') { // xà thực hồn: rít dài + tia độc nhảy 3 nốt
      noiseHit({ t: t, dur: 0.3, vol: 0.16, type: 'highpass', f0: 3200 });
      [659.25, 587.33, 523.25].forEach(function (f, i) { tone({ type: 'square', f0: f, t: t + 0.08 + i * 0.08, dur: 0.07, vol: 0.045, filter: { type: 'lowpass', f: 1600 } }); });
      return;
    }
    if (id === 'boss_thiet_bi') { // thiết bì trùng kích: lao như cối xay — gió rít + sắt ma sát mặt đất
      noiseHit({ t: t, dur: 0.4, vol: 0.24, type: 'bandpass', f0: 600, f1: 2400, q: 1.2 });
      noiseHit({ t: t + 0.05, dur: 0.35, vol: 0.14, type: 'bandpass', f0: 1800, q: 2.5 });
      tone({ type: 'sine', f0: 96, f1: 60, t: t, dur: 0.3, vol: 0.2 });
      return;
    }
    if (id === 'boss_co_mang') { // cổ mãng bàn long: thân cuộn ù trầm + khí xiết quanh vòng
      tone({ type: 'sine', f0: 82, t: t, dur: 0.75, vol: 0.2 });
      noiseHit({ t: t, dur: 0.7, vol: 0.13, type: 'bandpass', f0: 300, f1: 620, q: 1.5 });
      noiseHit({ t: t + 0.35, dur: 0.35, vol: 0.1, type: 'bandpass', f0: 620, f1: 300, q: 1.5 });
      return;
    }
    if (id === 'boss_ma_vuong') { // diệt thế chùy: nặng nhất dàn bí tịch — chùy + lửa + đất cùng lúc
      tone({ type: 'sine', f0: 72, f1: 30, t: t, dur: 0.6, vol: 0.42 });
      noiseHit({ t: t, dur: 0.5, vol: 0.3, type: 'lowpass', f0: 480, f1: 150, a: 0.02 });
      noiseHit({ t: t + 0.04, dur: 0.3, vol: 0.2, type: 'lowpass', f0: 260 });
      bell(t + 0.02, 98.0 * 8, 0.05, 0.8);
      return;
    }
    if (id === 'rare_van_kiem') { // vạn kiếm quy tông: mưa keng dày nhất + điểm chuông kết
      for (var vk = 0; vk < 12; vk++) tone({ type: 'triangle', f0: rnd(1700, 2700), t: t + vk * rnd(0.025, 0.045), dur: 0.16, vol: 0.11 });
      tone({ type: 'sine', f0: 130, f1: 65, t: t + 0.4, dur: 0.26, vol: 0.2 });
      bell(t + 0.42, 1567.98, 0.07, 1.0);
      return;
    }
    if (id === 'rare_cuu_u') { // cửu u hàn diệm: lửa lạnh nhảy 5 nốt — cháy xì xen tinh thể băng
      [880.0, 783.99, 880.0, 1046.5, 783.99].forEach(function (f, i) {
        tone({ type: 'sine', f0: f * 2, t: t + i * 0.07, dur: 0.12, vol: 0.06 });
        noiseHit({ t: t + i * 0.07, dur: 0.06, vol: 0.07, type: 'bandpass', f0: 1200, q: 1.5 });
      });
      return;
    }
    if (id === 'rare_hoi_xuan') { // hồi xuân chú: sinh cơ dâng — gảy đi lên + nước nguồn + gió xuân
      [392.0, 523.25, 659.25, 783.99].forEach(function (f, i) { pluck(t + i * 0.08, f, 0.13, 0.6); });
      noiseHit({ t: t, dur: 0.5, vol: 0.1, type: 'lowpass', f0: 700, f1: 1100 });
      return;
    }
    if (id === 'cb_thanh_khe') { // kiếm quyết vỡ lòng: vút mỏng + gảy một nốt quê nhà
      SFX_FNS.swing();
      pluck(t + 0.04, 523.25, 0.09, 0.4);
      return;
    }
    if (id === 'cb_liet_phong') { // liệt phong chưởng: quạt gió quanh thân
      noiseHit({ t: t, dur: 0.35, vol: 0.2, type: 'bandpass', f0: 400, f1: 1300, q: 1.3 });
      return;
    }
    if (id === 'cb_thiet_bo') { // thiết bố sam: vải căng + khiên trầm nhẹ
      noiseHit({ t: t, dur: 0.18, vol: 0.12, type: 'bandpass', f0: 900, q: 0.8 });
      tone({ type: 'sine', f0: 196, f1: 261.63, t: t, dur: 0.35, vol: 0.1 });
      return;
    }
    if (id === 'cb_tat_phong') { // tật phong bộ: hai lớp vút nhanh nối nhau
      noiseHit({ t: t, dur: 0.16, vol: 0.18, type: 'bandpass', f0: 800, f1: 2600, q: 1.4 });
      noiseHit({ t: t + 0.1, dur: 0.14, vol: 0.12, type: 'bandpass', f0: 1200, f1: 3000, q: 1.4 });
      return;
    }
    if (id === 'cb_dan_khi') { // dẫn khí quyết (bị động): chỉ là tiếng tụ khí khẽ nếu bị gọi
      tone({ type: 'sine', f0: 329.63, f1: 440.0, t: t, dur: 0.4, vol: 0.07 });
      return;
    }
    if (id === 'pq_hoa_cau') { // hỏa cầu thuật: cầu lửa nhỏ bay — bùng gọn
      noiseHit({ t: t, dur: 0.3, vol: 0.22, type: 'lowpass', f0: 600, f1: 220, a: 0.01 });
      tone({ type: 'sine', f0: 110, f1: 55, t: t, dur: 0.25, vol: 0.2 });
      return;
    }
    if (id === 'pq_thuy_tien') { // thủy tiễn: tên nước vút + tóe nước
      noiseHit({ t: t, dur: 0.24, vol: 0.2, type: 'bandpass', f0: 700, f1: 2200, q: 1.1 });
      noiseHit({ t: t + 0.1, dur: 0.15, vol: 0.1, type: 'lowpass', f0: 900 });
      return;
    }
    if (id === 'pq_bang_tien') { // băng tiễn: vút + tinh thể vỡ ở cuối
      noiseHit({ t: t, dur: 0.24, vol: 0.18, type: 'bandpass', f0: 900, f1: 3000, q: 1.2 });
      tone({ type: 'sine', f0: rnd(2600, 3200), t: t + 0.14, dur: 0.12, vol: 0.06 });
      return;
    }
    if (id === 'pq_loi_kich') { // lôi kích: chớp gọn nhảy tia
      noiseHit({ t: t, dur: 0.07, vol: 0.26, type: 'highpass', f0: 2400 });
      tone({ type: 'sine', f0: 98, f1: 45, t: t, dur: 0.3, vol: 0.26 });
      return;
    }
    if (id === 'pq_phong_nhan') { // phong nhận: lưỡi gió mỏng sắc
      noiseHit({ t: t, dur: 0.22, vol: 0.22, type: 'bandpass', f0: 1100, f1: 2800, q: 1.6 });
      return;
    }
    if (id === 'pq_tho_thu') { // thổ thứ: gai đất đội lên nhọn — nứt đất gọn + bụp
      noiseHit({ t: t, dur: 0.2, vol: 0.2, type: 'lowpass', f0: 350 });
      tone({ type: 'sine', f0: 90, f1: 50, t: t, dur: 0.22, vol: 0.22 });
      noiseHit({ t: t + 0.06, dur: 0.1, vol: 0.12, type: 'bandpass', f0: 500, q: 1.2 });
      return;
    }
    if (id === 'gen_phi_hoa') { // phi hoa trích diệp: lá hoa bay — gió nhẹ + gảy thanh
      noiseHit({ t: t, dur: 0.3, vol: 0.14, type: 'bandpass', f0: 600, f1: 1800, q: 1.0 });
      pluck(t + 0.05, 783.99, 0.1, 0.45); pluck(t + 0.14, 659.25, 0.09, 0.45);
      return;
    }
    if (id === 'gen_luu_sa') { // lưu sa chưởng: cát chảy xào + bụp trầm
      noiseHit({ t: t, dur: 0.4, vol: 0.18, type: 'bandpass', f0: 1500, f1: 500, q: 0.8 });
      tone({ type: 'sine', f0: 100, f1: 55, t: t, dur: 0.3, vol: 0.2 });
      return;
    }
    SFX_FNS.swing(); // skill lạ: rơi về tiếng vút kiếm
  }
  function skill(id, root) {
    try {
      if (!SKILL_SOUNDS[id]) return false;
      if (!gate('skill:' + id, 60, id === 'thien_can')) return false;
      skillSound(id, root);
      return true;
    } catch (e) { return false; }
  }

  // ==================================================================
  // ENGINE GIAI ĐIỆU THEO NGỮ CẢNH (chạy trên ctxGain -> musicBus)
  // ==================================================================
  // Bậc thang -> số semitone so với gốc: -2 là nốt chệch nửa cung
  // dưới gốc (motif boss); 0.. = bậc trong thang, tràn bậc cuốn lên
  // quãng tám theo đúng thang của map hiện tại.
  function degSemi(scale, deg) {
    if (deg === -2) return -1;
    var n = scale.length || 5;
    return scale[((deg % n) + n) % n] + 12 * Math.floor(deg / n);
  }
  function degFreq(th, deg, octMul) {
    return th.root * (octMul || 1) * Math.pow(2, degSemi(th.scale, deg) / 12);
  }
  // Đàn gảy Karplus-Strong: render sẵn buffer cho từng tần số (dây
  // rung tắt dần vật lý), cache tối đa ~48 tần số — lúc phát chỉ là
  // BufferSource + gain nên rất nhẹ CPU.
  function ksBuffer(freq) {
    var key = Math.round(freq);
    if (ksCache[key]) return ksCache[key];
    var sr = ctx.sampleRate, len = Math.floor(sr * 1.4);
    var buf = ctx.createBuffer(1, len, sr);
    var d = buf.getChannelData(0);
    var N = Math.max(2, Math.round(sr / freq));
    var i;
    for (i = 0; i <= N && i < len; i++) d[i] = Math.random() * 2 - 1;
    for (i = N + 1; i < len; i++) d[i] = 0.5 * (d[i - N] + d[i - N - 1]) * 0.996;
    if (ksCount > 48) { ksCache = {}; ksCount = 0; }
    ksCache[key] = buf; ksCount++;
    return buf;
  }
  function playPluckKS(t, freq, vol) {
    var src = ctx.createBufferSource();
    src.buffer = ksBuffer(freq);
    var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 3400;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.setTargetAtTime(0.0001, t + 1.05, 0.12); // cắt đuôi buffer, tránh chồng vòng sau
    src.connect(fl); fl.connect(g); g.connect(ctxGain);
    src.start(t); src.stop(t + 1.45);
  }
  // Sáo trúc: sine có vibrato nhẹ trễ + hài 2 khẽ + hơi thở bandpass.
  function playFlute(t, freq, vol, dur) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.07);
    g.gain.setValueAtTime(vol, t + Math.max(0.08, dur - 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2;
    var g2 = ctx.createGain(); g2.gain.value = 0.18;
    var vib = ctx.createOscillator(); vib.frequency.value = 5.2;
    var vibG = ctx.createGain(); vibG.gain.value = 0; // vibrato chỉ vào sau khi nốt đã đứng
    vib.connect(vibG); vibG.connect(o.detune);
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(6, t + 0.22); // ±6 cent
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ctxGain);
    o.start(t); o.stop(t + dur + 0.05); o2.start(t); o2.stop(t + dur + 0.05);
    vib.start(t); vib.stop(t + dur + 0.05);
    // hơi thở: nhiễu bandpass quanh 2x tần số, rất khẽ, đầu nốt
    var ns = ctx.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true;
    var nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = Math.min(6000, freq * 2); nf.Q.value = 1.4;
    var ng = ctx.createGain();
    ng.gain.setValueAtTime(vol * 0.22, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    ns.connect(nf); nf.connect(ng); ng.connect(ctxGain);
    ns.start(t, Math.random() * 0.7); ns.stop(t + 0.2);
  }
  // Trống trận: màng trống = sine rơi cao độ + da trống = nhiễu trầm.
  function playWarDrum(t, big) {
    tone({ type: 'sine', f0: big ? 118 : 150, f1: big ? 46 : 68, t: t, dur: big ? 0.3 : 0.18, vol: big ? 0.5 : 0.3, a: 0.006, bus: ctxGain });
    noiseHit({ t: t, dur: big ? 0.12 : 0.07, vol: big ? 0.16 : 0.1, type: 'lowpass', f0: 800, bus: ctxGain });
  }
  function scheduleCtxStep(def, idx, t) {
    var th = theme();
    // Trống trước (xương nhịp), rồi bass, rồi giai điệu, chuông điểm.
    if (def.drum) {
      var dk = def.drum[idx % def.drum.length];
      if (dk === 'D') playWarDrum(t, true);
      else if (dk === 'd') playWarDrum(t, false);
      else if (dk === 's') noiseHit({ t: t, dur: 0.09, vol: 0.05, type: 'highpass', f0: 6200, bus: ctxGain });
    }
    if (def.bass) {
      var bd = def.bass[idx % def.bass.length];
      if (bd != null && bd >= -2) playPluckKS(t, degFreq(th, bd, 0.5), 0.20);
    }
    var md = def.melody[idx % def.melody.length];
    if (md != null && md >= -2) {
      var f = degFreq(th, md, 1);
      var lead = def.lead;
      if (lead === 'alt') lead = (ctxRound % 2 === 0) ? 'pluck' : 'flute';
      if (lead === 'flute') playFlute(t, f, 0.105, def.stepDur * 2.1);
      else {
        playPluckKS(t, f, 0.15);
        if (def.echo) { // bí cảnh: vọng lại 2 lần xa dần (không cần DelayNode)
          playPluckKS(t + def.stepDur * 0.9, f, 0.06);
          playPluckKS(t + def.stepDur * 1.8, f, 0.028);
        }
      }
    }
    if (def.bellEvery && idx % def.bellEvery === 0) bell(t, th.root * 2, ctxName === 'realm' ? 0.035 : 0.055, 2.2, ctxGain);
    if (idx === def.steps - 1) ctxRound++;
  }
  // Ngữ cảnh đích theo trạng thái game: boss > giao chiến > theo map;
  // chưa từng setMap = vẫn ở màn đăng nhập.
  function resolveContext() {
    if (bossOn) return 'boss';
    if (combatOn) return 'combat';
    if (!mapSeen) return 'login';
    return baseContextFor(curMap);
  }
  // Đích thay đổi -> crossfade lớp giai điệu: hạ ctxGain về 0 (hằng
  // số 0.3s), tới hạn ctxApplyAt thì scheduler đổi motif + nâng lại.
  function refreshContext() {
    var want = resolveContext();
    ctxWanted = want;
    if (!ctx || !ctxGain) { ctxName = want; ctxPending = null; return; }
    if (want === ctxName) { ctxPending = null; return; }
    if (want === ctxPending) return;
    ctxPending = want;
    ctxApplyAt = ctx.currentTime + 0.85;
    try { ctxGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3); } catch (e) {}
  }
  // Giao chiến thường: game.js gọi mỗi khi có đòn trúng (cả hai
  // chiều); tự hết hạn trong schedulerTick sau 6 giây yên ắng.
  function setCombat(on) {
    try {
      if (on) { combatFreshAt = nowMs(); if (!combatOn) { combatOn = true; refreshContext(); } }
      else if (combatOn) { combatOn = false; refreshContext(); }
      refreshAmbDuck();
      return true;
    } catch (e) { return false; }
  }
  // Ép ngữ cảnh thủ công (vd màn hình đặc biệt); các sự kiện map/
  // boss/combat kế tiếp sẽ tự suy lại như thường.
  function setContext(name) {
    try {
      if (!MUSIC_CONTEXTS[name]) return false;
      ctxWanted = name;
      if (!ctx || !ctxGain) { ctxName = name; ctxPending = null; return true; }
      if (name !== ctxName) {
        ctxPending = name;
        ctxApplyAt = ctx.currentTime + 0.85;
        ctxGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
      }
      return true;
    } catch (e) { return false; }
  }

  // ==================================================================
  // NHẠC NỀN + KHÔNG KHÍ THEO MAP (khung liền mạch, chỉ đổi tông/lớp)
  // ==================================================================
  function theme() {
    if (MAP_THEMES[curMap]) return MAP_THEMES[curMap];
    if (curMap && curMap.indexOf('realm_') === 0) return MAP_THEMES.realm_;
    return MAP_THEMES._default;
  }
  function startMusic() {
    if (!ctx || musicNodes) return;
    try {
      var th = theme();
      var padGain = ctx.createGain(); padGain.gain.value = 0.0;
      var padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = th.bright;
      padFilter.connect(padGain); padGain.connect(musicBus);
      padGain.gain.setTargetAtTime(0.055, ctx.currentTime, 2.0);
      var oscs = chordSemis(th, progIdx).map(function (semi) {
        var o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.value = th.root * Math.pow(2, semi / 12) / 2; // pad nằm dưới một quãng tám
        o.connect(padFilter); o.start();
        return o;
      });
      // Gió: nhiễu vòng lặp qua bandpass, LFO quét tần số + lượng gió theo map.
      var wsrc = ctx.createBufferSource(); wsrc.buffer = noiseBuf; wsrc.loop = true;
      var wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 480; wf.Q.value = 0.6;
      var wg = ctx.createGain(); wg.gain.value = th.wind;
      var lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      var lfoG = ctx.createGain(); lfoG.gain.value = 190;
      lfo.connect(lfoG); lfoG.connect(wf.frequency);
      wsrc.connect(wf); wf.connect(wg); wg.connect(musicBus);
      wsrc.start(); lfo.start();
      // Lớp AMBIENCE theo biome (lượt 17:12 31/10): bus riêng nối
      // vào musicBus + 3 nền loop dùng chung (nước/lá/rì rầm) + LFO
      // lá thở + LFO gió giật gắn lên chính node gió ở trên. Tạo
      // đúng MỘT lần ở đây — chuyển map chỉ lướt gain (applyAmbience).
      var ambBus = ctx.createGain(); ambBus.gain.value = 0;
      ambBus.connect(musicBus);
      ambBus.gain.setTargetAtTime(AMB_LEVEL, ctx.currentTime, 1.2);
      var ambBed = function (rate, off, fType, fFreq, fQ) {
        var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = rate;
        var f = ctx.createBiquadFilter(); f.type = fType; f.frequency.value = fFreq; f.Q.value = fQ;
        var g = ctx.createGain(); g.gain.value = 0;
        s.connect(f); f.connect(g); g.connect(ambBus);
        s.start(0, off);
        return g;
      };
      var waterGain = ambBed(0.5, 0.31, 'lowpass', 480, 0.7);    // nước chảy róc rách đều
      var leavesGain = ambBed(0.8, 0.77, 'bandpass', 2600, 0.5); // lá xào xạc qua tán
      var rumbleGain = ambBed(0.3, 0.53, 'lowpass', 110, 0.7);   // rì rầm trầm (hang/lửa địa)
      // Lá thở: LFO chậm điều biên độ quanh mức gain của biome.
      var leavesLfo = ctx.createOscillator(); leavesLfo.frequency.value = 0.13;
      var leavesLfoG = ctx.createGain(); leavesLfoG.gain.value = 0;
      leavesLfo.connect(leavesLfoG); leavesLfoG.connect(leavesGain.gain);
      leavesLfo.start();
      // Gió giật: LFO rất chậm cộng/trừ vào gain gió theo hệ số gust
      // của biome (núi cao giật mạnh, làng chỉ gợn nhẹ).
      var gustLfo = ctx.createOscillator(); gustLfo.frequency.value = 0.045;
      var gustLfoG = ctx.createGain(); gustLfoG.gain.value = 0;
      gustLfo.connect(gustLfoG); gustLfoG.connect(wg.gain);
      gustLfo.start();
      ambNodes = { bus: ambBus, waterGain: waterGain, leavesGain: leavesGain, rumbleGain: rumbleGain, leavesLfoG: leavesLfoG, gustLfoG: gustLfoG };
      // Lớp giai điệu theo ngữ cảnh: gain riêng để crossfade motif
      // mà không đụng pad/gió. Khởi phát thẳng ngữ cảnh hiện tại
      // (không fade ở lần đầu — chưa có gì để fade từ đó).
      ctxGain = ctx.createGain(); ctxGain.gain.value = 0;
      ctxGain.connect(musicBus);
      ctxName = resolveContext(); ctxWanted = ctxName; ctxPending = null;
      ctxStepIdx = 0; ctxRound = 0; ctxNextT = ctx.currentTime + 0.15;
      ctxGain.gain.setTargetAtTime(CTX_LEVEL, ctx.currentTime, 0.8);
      musicNodes = { oscs: oscs, padGain: padGain, padFilter: padFilter, windGain: wg, ctxGain: ctxGain };
      applyTheme(0.1);
      applyAmbience(0.1);
      schedTimer = setInterval(schedulerTick, 280);
      if (schedTimer && schedTimer.unref) schedTimer.unref(); // Node test: đừng giữ tiến trình
    } catch (e) { musicNodes = null; }
  }
  function applyTheme(tc) {
    if (!ctx || !musicNodes) return;
    try {
      var th = theme(), t = ctx.currentTime, k = tc || 1.4;
      var semis = chordSemis(th, progIdx);
      musicNodes.oscs.forEach(function (o, i) {
        var semi = semis[i % semis.length];
        o.frequency.setTargetAtTime(th.root * Math.pow(2, semi / 12) / 2, t, k);
      });
      musicNodes.padFilter.frequency.setTargetAtTime(th.bright, t, k);
      musicNodes.windGain.gain.setTargetAtTime(th.wind, t, k);
    } catch (e) {}
  }
  function ambSpec() { return AMBIENCES[curBiome] || AMBIENCES.forest; }
  // Lướt toàn bộ lớp nền sang thông số của biome hiện tại (hằng số
  // thời gian ~1,6s = crossfade nghe được, không cắt cụp). Chỉ gọi
  // setTargetAtTime trên các node ĐÃ CÓ — không tạo node mới.
  function applyAmbience(tc) {
    if (!ctx || !ambNodes) return;
    try {
      var sp = ambSpec(), t = ctx.currentTime, k = tc || 1.6;
      ambNodes.waterGain.gain.setTargetAtTime((sp.water || 0) * 0.030, t, k);
      ambNodes.leavesGain.gain.setTargetAtTime((sp.leaves || 0) * 0.016, t, k);
      ambNodes.leavesLfoG.gain.setTargetAtTime((sp.leaves || 0) * 0.016 * 0.55, t, k);
      ambNodes.rumbleGain.gain.setTargetAtTime((sp.rumble || 0) * 0.050, t, k);
      ambNodes.gustLfoG.gain.setTargetAtTime(theme().wind * 0.5 * (sp.gust == null ? 0.6 : sp.gust), t, k);
    } catch (e) {}
  }
  // Ducking: boss/giao chiến thì lớp nền lùi xuống nhường tiếng
  // chiêu + nhạc chiến, nhưng không tắt hẳn (vẫn nghe gió/nước xa).
  function refreshAmbDuck() {
    var want = bossOn ? 0.4 : (combatOn ? 0.6 : 1);
    if (want === ambDuck) return;
    ambDuck = want;
    if (ctx && ambNodes) { try { ambNodes.bus.gain.setTargetAtTime(AMB_LEVEL * ambDuck, ctx.currentTime, 0.35); } catch (e) {} }
  }
  function schedulerTick() {
    if (!ctx || level === 'tat') return;
    try {
      var dt = 0.28, th = theme(), t = ctx.currentTime;
      // Vòng chuyển hợp âm chậm của pad: hết PROG_SEC giây thì lướt cả 3
      // oscillator sang hợp âm kế (hằng số thời gian 5s — nghe như hoà âm
      // tự đổi màu, không phô, không tốn thêm node).
      progIn -= dt;
      if (progIn <= 0) {
        progIn = PROG_SEC;
        progIdx = (progIdx + 1) % PROG_DEGREES.length;
        if (musicNodes) {
          var semis = chordSemis(th, progIdx);
          musicNodes.oscs.forEach(function (o, i) {
            o.frequency.setTargetAtTime(th.root * Math.pow(2, semis[i % semis.length] / 12) / 2, t, 5.0);
          });
        }
      }
      // GIAI ĐIỆU THEO NGỮ CẢNH (thay cho nốt gảy ngẫu nhiên cũ):
      // lên lịch từng step của motif trong cửa sổ 0,5s tới; tới hạn
      // crossfade thì đổi ngữ cảnh đang phát + bắt đầu vòng mới.
      if (ctxGain) {
        if (combatOn && nowMs() - combatFreshAt > 6000) { combatOn = false; refreshContext(); refreshAmbDuck(); }
        if (ctxPending && t >= ctxApplyAt) {
          ctxName = ctxPending; ctxPending = null;
          ctxStepIdx = 0; ctxRound = 0; ctxNextT = t + 0.06;
          ctxGain.gain.setTargetAtTime(CTX_LEVEL, t, 0.45);
        }
        if (!ctxPending) {
          var cdef = MUSIC_CONTEXTS[ctxName] || MUSIC_CONTEXTS.wild;
          if (ctxNextT < t - 0.1) ctxNextT = t + 0.05; // vừa tắt tiếng/bật lại: nhảy tới hiện tại, không dồn nốt quá khứ
          var guardN = 0;
          while (ctxNextT < t + 0.5 && guardN++ < 8) {
            scheduleCtxStep(cdef, ctxStepIdx, ctxNextT);
            ctxStepIdx = (ctxStepIdx + 1) % cdef.steps;
            ctxNextT += cdef.stepDur;
          }
        }
      }
      // SỰ KIỆN SINH CẢNH THEO BIOME (AMBIENCES): xác suất mỗi tick
      // lấy từ bảng biome của map hiện tại; cao độ/biến thể ngẫu
      // nhiên từng lần nên không lặp máy móc. Mọi tiếng đều khẽ hơn
      // hẳn tiếng chiêu cùng họ và đi qua ambBus (ducking được).
      var sp = ambSpec(), aBus = ambNodes ? ambNodes.bus : musicBus;
      if (sp.bird && Math.random() < sp.bird) { // chim hót: líu lo 2 nốt, đôi khi thêm nốt 3
        var bt = t + 0.05, bf = rnd(2500, 2900);
        tone({ type: 'sine', f0: bf, f1: bf * 1.28, t: bt, dur: 0.07, vol: 0.02, a: 0.01, bus: aBus });
        tone({ type: 'sine', f0: bf * 1.1, f1: bf * 0.9, t: bt + 0.11, dur: 0.06, vol: 0.016, a: 0.01, bus: aBus });
        if (Math.random() < 0.3) tone({ type: 'sine', f0: bf * 1.05, f1: bf * 1.2, t: bt + 0.21, dur: 0.05, vol: 0.012, a: 0.01, bus: aBus });
      }
      if (sp.insects && Math.random() < sp.insects) { // côn trùng: xung cao tần rất nhỏ, từng nhịp
        for (var i2 = 0; i2 < 3; i2++) tone({ type: 'sine', f0: 4300, t: t + i2 * 0.07, dur: 0.03, vol: 0.006, a: 0.004, bus: aBus });
      }
      if (sp.cricket && Math.random() < sp.cricket) { // dế đêm: 4 xung cao đều nhịp
        var cfq = rnd(4100, 4400);
        for (var ci = 0; ci < 4; ci++) tone({ type: 'sine', f0: cfq, t: t + ci * 0.055, dur: 0.028, vol: 0.008, a: 0.004, bus: aBus });
      }
      if (sp.frog && Math.random() < sp.frog) { // ếch bờ suối/đầm: ộp trầm ngắn, đôi khi đáp lại
        tone({ type: 'sine', f0: 760, f1: 470, t: t + 0.03, dur: 0.09, vol: 0.016, a: 0.008, bus: aBus });
        if (Math.random() < 0.6) tone({ type: 'sine', f0: 720, f1: 450, t: t + 0.19, dur: 0.08, vol: 0.012, a: 0.008, bus: aBus });
      }
      if (sp.owl && Math.random() < sp.owl) { // cú đêm: hai tiếng trầm cách nhau
        tone({ type: 'sine', f0: 392, f1: 330, t: t + 0.03, dur: 0.28, vol: 0.02, a: 0.06, bus: aBus });
        tone({ type: 'sine', f0: 380, f1: 318, t: t + 0.48, dur: 0.32, vol: 0.016, a: 0.06, bus: aBus });
      }
      if (sp.rooster && Math.random() < sp.rooster) { // gà gáy xa trong làng: rất thưa, chỉ làm điểm nhấn
        var rt = t + 0.03;
        tone({ type: 'sawtooth', f0: 700, f1: 1150, t: rt, dur: 0.16, vol: 0.028, a: 0.01, bus: aBus, filter: { type: 'lowpass', f: 1800 } });
        tone({ type: 'sawtooth', f0: 880, f1: 620, t: rt + 0.18, dur: 0.30, vol: 0.032, a: 0.01, bus: aBus, filter: { type: 'lowpass', f: 1800 } });
        tone({ type: 'sawtooth', f0: 760, f1: 560, t: rt + 0.52, dur: 0.20, vol: 0.016, a: 0.01, bus: aBus, filter: { type: 'lowpass', f: 1800 } });
      }
      if (sp.bell && Math.random() < sp.bell) { // chuông chùa/sơn môn vẳng xa: gốc của map, ngân dài, rất khẽ
        bell(t + 0.03, th.root, 0.05, 3.0, aBus);
      }
      if (sp.chime && Math.random() < sp.chime) { // chuông gió: 3 tiếng leng keng lệch nhịp
        var chf = rnd(2300, 2900);
        tone({ type: 'sine', f0: chf, t: t + 0.03, dur: 0.30, vol: 0.010, a: 0.004, bus: aBus });
        tone({ type: 'sine', f0: chf * 1.26, t: t + rnd(0.09, 0.16), dur: 0.26, vol: 0.008, a: 0.004, bus: aBus });
        tone({ type: 'sine', f0: chf * 0.89, t: t + rnd(0.2, 0.3), dur: 0.32, vol: 0.007, a: 0.004, bus: aBus });
      }
      if (sp.drip && Math.random() < sp.drip) { // giọt nước hang/động phủ: rơi + vọng 2 lần xa dần
        tone({ type: 'sine', f0: 1500, f1: 700, t: t + 0.03, dur: 0.09, vol: 0.012, a: 0.004, bus: aBus });
        tone({ type: 'sine', f0: 1400, f1: 680, t: t + 0.19, dur: 0.07, vol: 0.006, a: 0.004, bus: aBus });
        tone({ type: 'sine', f0: 1350, f1: 660, t: t + 0.34, dur: 0.06, vol: 0.003, a: 0.004, bus: aBus });
      }
      if (sp.leaves && Math.random() < sp.leaves * 0.06) { // cơn gió qua tán lá: xào dài hơn nền lá thường
        noiseHit({ t: t + 0.03, dur: rnd(0.6, 1.0), vol: 0.012, type: 'bandpass', f0: 1700, f1: 2600, q: 0.8, a: 0.25, bus: aBus });
      }
      // Lửa reo (Xích Diệm) / sấm xa (Lôi Trì) / gió rít lạnh (Hàn
      // Băng Cốc): chuyển từ cờ MAP_THEMES sang xác suất biome —
      // công thức tiếng giữ nguyên như bản trước (QA (e) 00:31).
      if (sp.fire && Math.random() < sp.fire) {
        noiseHit({ t: t + 0.03, dur: rnd(0.08, 0.16), vol: 0.02, type: 'lowpass', f0: rnd(700, 1100), bus: aBus });
        if (Math.random() < 0.5) noiseHit({ t: t + rnd(0.1, 0.25), dur: 0.06, vol: 0.012, type: 'bandpass', f0: rnd(1200, 2000), q: 2, bus: aBus });
      }
      if (sp.thunder && Math.random() < sp.thunder) {
        noiseHit({ t: t + 0.03, dur: 1.3, vol: 0.045, type: 'lowpass', f0: 220, a: 0.25, bus: aBus });
        tone({ type: 'sine', f0: 52, f1: 38, t: t + 0.05, dur: 1.1, vol: 0.035, a: 0.2, bus: aBus });
      }
      if (sp.cold && Math.random() < sp.cold) {
        noiseHit({ t: t + 0.03, dur: rnd(0.5, 0.9), vol: 0.011, type: 'bandpass', f0: 2400, f1: 3400, q: 1.6, a: 0.15, bus: aBus });
      }
      // Lớp trầm giao chiến boss ngày xưa (nhịp sub 0,92s) nay do
      // ngữ cảnh 'boss' của lớp giai điệu đảm nhiệm (trống + bass) —
      // bossOn chỉ còn lái resolveContext + độ trầm của pad.
    } catch (e) {}
  }
  function setMap(id) {
    try {
      curMap = id || 'map1';
      mapSeen = true;
      curBiome = biomeFor(curMap);
      if (ctx && musicNodes) applyTheme(1.4); // chỉ đổi tông/lớp — nhạc không cắt
      if (ctx && ambNodes) applyAmbience(1.6); // lớp nền lướt sang biome mới, không cắt
      refreshContext(); // giai điệu crossfade sang ngữ cảnh của map mới
    } catch (e) {}
  }
  function bossFight(on) {
    try {
      bossOn = !!on;
      if (ctx && musicNodes) { // pad trầm xuống một chút khi vào trận boss
        musicNodes.padFilter.frequency.setTargetAtTime(bossOn ? Math.min(500, theme().bright) : theme().bright, ctx.currentTime, 0.8);
      }
      refreshContext();
      refreshAmbDuck();
    } catch (e) {}
  }
  function stopAll() {
    try {
      if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
      if (ctx && ctx.close) ctx.close();
    } catch (e) {}
    ctx = null; musicNodes = null; bossOn = false; progIdx = 0; progIn = PROG_SEC;
    ambNodes = null; curBiome = 'village'; ambDuck = 1;
    ctxGain = null; ctxName = 'login'; ctxWanted = 'login'; ctxPending = null;
    ctxStepIdx = 0; ctxRound = 0; mapSeen = false; combatOn = false; ksCache = {}; ksCount = 0;
  }

  // ==================================================================
  // CÀI ĐẶT CÔNG KHAI
  // ==================================================================
  function setLevel(lv) {
    try {
      if (!LEVELS[lv]) return false;
      level = lv;
      applyLevels();
      return true;
    } catch (e) { return false; }
  }
  function setMusicVol(v) { try { musicTrim = Math.max(0, Math.min(1, +v || 0)); applyLevels(); return true; } catch (e) { return false; } }
  function setSfxVol(v) { try { sfxTrim = Math.max(0, Math.min(1, +v || 0)); applyLevels(); return true; } catch (e) { return false; } }
  function getState() {
    return { level: level, musicVol: musicTrim, sfxVol: sfxTrim, hasCtx: hasCtx(), map: curMap, boss: bossOn, activeVoices: activeVoices, progIdx: progIdx, progSec: PROG_SEC,
      context: ctxWanted, musicContext: ctxName, combat: combatOn,
      biome: curBiome, ambDuck: ambDuck };
  }

  var api = {
    VERSION: 1,
    VOICES: VOICES, VOICE_OCCASIONS: VOICE_OCCASIONS, SFX: SFX,
    SKILL_SOUNDS: SKILL_SOUNDS, ROOT_SOUNDS: ROOT_SOUNDS,
    MAP_THEMES: MAP_THEMES, LEVELS: LEVELS,
    PROG_DEGREES: PROG_DEGREES, PROG_SEC: PROG_SEC, chordSemis: chordSemis,
    MUSIC_CONTEXTS: MUSIC_CONTEXTS, baseContextFor: baseContextFor,
    AMBIENCES: AMBIENCES, biomeFor: biomeFor, ambienceFor: ambienceFor,
    unlock: unlock, hasCtx: hasCtx, getState: getState,
    voiceDefined: function (type, occ) { return !!(VOICES[type] && VOICE_OCCASIONS.indexOf(occ) >= 0); },
    setLevel: setLevel, setMusicVol: setMusicVol, setSfxVol: setSfxVol,
    voice: voice, sfx: sfx, skill: skill,
    setMap: setMap, bossFight: bossFight, stopAll: stopAll,
    setCombat: setCombat, setContext: setContext
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SOUND = api;
  // Môi trường Node (test) vừa có module vừa có global.window giả lập:
  // vẫn phải gắn lên window để game.js (eval) tra cứu được.
  try { if (typeof window !== 'undefined') window.PNT_SOUND = api; } catch (e) {}
})();
