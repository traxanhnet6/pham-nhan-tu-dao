// Phàm Nhân Tu Đạo — ÂM THANH tổng hợp 100% bằng WebAudio (không file ngoài).
// Lệnh Bui 20:52 2026-10-29: "Tạo âm thanh game, âm thanh boss quái".
//   - Tiếng RIÊNG cho 9 loài quái + boss Sơn Quân (+ tinh anh trầm hơn),
//     kêu theo dịp: phát hiện người chơi (aggro) / tấn công / trúng đòn / chết.
//   - Tiếng gameplay: chém trúng/trượt, từng skill một tiếng (Thiên Căn
//     Thần Thông có tiếng riêng theo 8 hệ linh căn), trúng đòn, đột phá,
//     nhiệm vụ, nhặt đồ, dùng đan, cổng, hái dược, kỳ ngộ giếng cổ.
//   - Nhạc nền ngũ cung + không khí theo map (làng / rừng / núi), chuyển
//     map liền mạch không cắt phựt; lớp trầm khi giao chiến boss.
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
    ice_tick: 1, fire_tick: 1, zap_small: 1, boom_small: 1
  };
  // Tiếng tung chiêu theo id skill (thanh skill trong skills.js).
  // QA 15:16 30/10: 10 chiêu cảnh giới cao có bản tiếng RIÊNG ở
  // skillSound (ghép từ nguyên liệu sẵn có theo đúng hệ/hình thái
  // chiêu) — trước đây cả 10 đều rơi về một tiếng vút kiếm chung.
  var SKILL_SOUNDS = {
    combo: 1, kiem_khi: 1, toan_phong: 1, thien_can: 1, luu_tinh: 1, ngu_kiem: 1,
    xuyen_van: 1, linh_khien: 1, dan_hoa: 1, than_loi: 1, phan_than: 1,
    tran_ap: 1, linh_vuc: 1, kiem_tran: 1, loi_kiep: 1, pha_huyen: 1
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
    map10: { root: 164.81, scale: [0, 3, 5, 7, 10], chord: [0, 3, 7], bright: 430, wind: 0.030, bird: 0, insects: 0 },
    map11: { root: 246.94, scale: [0, 2, 3, 7, 9], chord: [0, 3, 7], bright: 900, wind: 0.060, bird: 0, insects: 0 },
    map12: { root: 349.23, scale: [0, 2, 4, 7, 9], chord: [0, 4, 7], bright: 1650, wind: 0.075, bird: 0, insects: 0 },
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
  // TRẠNG THÁI ENGINE
  // ==================================================================
  var ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  var level = 'bat';            // 'bat' | 'nho' | 'tat'
  var musicTrim = 1, sfxTrim = 1; // chỉnh riêng 0..1 qua setMusicVol/setSfxVol
  var curMap = 'map1', bossOn = false;
  var activeVoices = 0, MAX_VOICES = 12;
  var lastPlay = {};            // throttle theo khóa tiếng
  var musicNodes = null;        // { padOsc[], padGain, windSrc, windGain, windFilter }
  var schedTimer = null, nextNoteIn = 1.5, bossPulseIn = 0;
  var progIdx = 0, progIn = PROG_SEC; // vị trí trong vòng chuyển hợp âm của pad
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
    }
  };
  function sfx(name, opts) {
    try {
      var fn = SFX_FNS[name];
      if (!fn) return false;
      var minMs = (name === 'ui_click') ? 40 : (name === 'coin' ? 160 : (name === 'hit_small' ? 70 :
        (name === 'shop_buy' || name === 'shop_sell' ? 90 :
        (name === 'plant' || name === 'water' ? 80 :
        (name === 'capture_miss' ? 120 : (name === 'break_fail' ? 200 : 30))))));
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
      musicNodes = { oscs: oscs, padGain: padGain, padFilter: padFilter, windGain: wg };
      applyTheme(0.1);
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
      // Giai điệu ngũ cung thưa: pluck ngẫu nhiên trên thang của map.
      nextNoteIn -= dt;
      if (nextNoteIn <= 0) {
        nextNoteIn = rnd(1.6, 4.2);
        if (Math.random() < 0.75) {
          var semi = th.scale[Math.floor(Math.random() * th.scale.length)];
          var oct = Math.random() < 0.3 ? 2 : 1;
          var f = th.root * oct * Math.pow(2, semi / 12);
          tone({ type: 'sine', f0: f, t: t + 0.05, dur: 1.1, vol: 0.055, a: 0.01, bus: musicBus });
          tone({ type: 'triangle', f0: f * 2, t: t + 0.05, dur: 0.5, vol: 0.016, a: 0.01, bus: musicBus });
        }
      }
      // Chim hót ở làng (map1): vài tiếng líu lo lác đác, rất khẽ.
      if (th.bird && Math.random() < 0.05) {
        var bt = t + 0.05, bf = rnd(2500, 2900);
        tone({ type: 'sine', f0: bf, f1: bf * 1.28, t: bt, dur: 0.07, vol: 0.02, a: 0.01, bus: musicBus });
        tone({ type: 'sine', f0: bf * 1.1, f1: bf * 0.9, t: bt + 0.11, dur: 0.06, vol: 0.016, a: 0.01, bus: musicBus });
      }
      // Côn trùng trong rừng (map2): xung cao tần rất nhỏ, từng nhịp.
      if (th.insects && Math.random() < 0.16) {
        for (var i = 0; i < 3; i++) tone({ type: 'sine', f0: 4300, t: t + i * 0.07, dur: 0.03, vol: 0.006, a: 0.004, bus: musicBus });
      }
      // Lớp trầm giao chiến boss: nhịp trống sub đều + nốt căng thẳng.
      if (bossOn) {
        bossPulseIn -= dt;
        if (bossPulseIn <= 0) {
          bossPulseIn = 0.92;
          tone({ type: 'sine', f0: 55, f1: 36, t: t + 0.03, dur: 0.32, vol: 0.3, a: 0.008, bus: musicBus });
          if (Math.random() < 0.4) tone({ type: 'triangle', f0: th.root * Math.pow(2, 1 / 12) / 2, t: t + 0.03, dur: 0.8, vol: 0.03, a: 0.02, bus: musicBus });
        }
      }
    } catch (e) {}
  }
  function setMap(id) {
    try {
      curMap = id || 'map1';
      if (ctx && musicNodes) applyTheme(1.4); // chỉ đổi tông/lớp — nhạc không cắt
    } catch (e) {}
  }
  function bossFight(on) {
    try {
      bossOn = !!on;
      if (bossOn) bossPulseIn = 0;
      if (ctx && musicNodes) { // pad trầm xuống một chút khi vào trận boss
        musicNodes.padFilter.frequency.setTargetAtTime(bossOn ? Math.min(500, theme().bright) : theme().bright, ctx.currentTime, 0.8);
      }
    } catch (e) {}
  }
  function stopAll() {
    try {
      if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
      if (ctx && ctx.close) ctx.close();
    } catch (e) {}
    ctx = null; musicNodes = null; bossOn = false; progIdx = 0; progIn = PROG_SEC;
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
    return { level: level, musicVol: musicTrim, sfxVol: sfxTrim, hasCtx: hasCtx(), map: curMap, boss: bossOn, activeVoices: activeVoices, progIdx: progIdx, progSec: PROG_SEC };
  }

  var api = {
    VERSION: 1,
    VOICES: VOICES, VOICE_OCCASIONS: VOICE_OCCASIONS, SFX: SFX,
    SKILL_SOUNDS: SKILL_SOUNDS, ROOT_SOUNDS: ROOT_SOUNDS,
    MAP_THEMES: MAP_THEMES, LEVELS: LEVELS,
    PROG_DEGREES: PROG_DEGREES, PROG_SEC: PROG_SEC, chordSemis: chordSemis,
    unlock: unlock, hasCtx: hasCtx, getState: getState,
    voiceDefined: function (type, occ) { return !!(VOICES[type] && VOICE_OCCASIONS.indexOf(occ) >= 0); },
    setLevel: setLevel, setMusicVol: setMusicVol, setSfxVol: setSfxVol,
    voice: voice, sfx: sfx, skill: skill,
    setMap: setMap, bossFight: bossFight, stopAll: stopAll
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SOUND = api;
  // Môi trường Node (test) vừa có module vừa có global.window giả lập:
  // vẫn phải gắn lên window để game.js (eval) tra cứu được.
  try { if (typeof window !== 'undefined') window.PNT_SOUND = api; } catch (e) {}
})();
