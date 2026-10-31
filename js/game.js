// Phàm Nhân Tu Đạo — glue trình duyệt: màn hình, canvas, camera, tương tác.
// Mở đầu: đăng kí -> đăng nhập -> tạo nhân vật -> chơi. Không cần server.
(function () {
  'use strict';
  var S = window.PNT_SPRITES, L = window.PNT_LOGIC, M = window.PNT_MAPS;
  var ST = (typeof window !== 'undefined') ? window.PNT_STORY : null;
  var SK = (typeof window !== 'undefined') ? window.PNT_SKILLS : null;
  var SECT = (typeof window !== 'undefined') ? window.PNT_SECTS : null;
  var FX = (typeof window !== 'undefined') ? window.PNT_SKILLFX : null;
  var MAI = (typeof window !== 'undefined') ? window.PNT_MONSTER_AI : null;
  var HRM = (typeof window !== 'undefined') ? window.PNT_HERO_REALM : null;
  var HAI = (typeof window !== 'undefined') ? window.PNT_HERO_AI : null;
  var NAI = (typeof window !== 'undefined') ? window.PNT_NPC_AI : null;
  var W = (typeof window !== 'undefined') ? window.PNT_WEAPONS : null;
  var ART = (typeof window !== 'undefined') ? window.PNT_ARTIFACTS : null;
  var GR = (typeof window !== 'undefined') ? window.PNT_GEAR : null; // Trang bị đeo 11 ô mới (js/gear.js, GĐ2 bộ 16 ô)
  var RM = (typeof window !== 'undefined') ? window.PNT_REALMS : null;
  var CL = (typeof window !== 'undefined') ? window.PNT_CLOUDS : null;
  var SND = (typeof window !== 'undefined') ? window.PNT_SOUND : null;
  var SR = (typeof window !== 'undefined') ? window.PNT_SECRET_REALMS : null;
  var RA = (typeof window !== 'undefined') ? window.PNT_REALM_AMBIENT : null;
  var TOURN = (typeof window !== 'undefined') ? window.PNT_TOURNAMENT : null;
  var BT = (typeof window !== 'undefined') ? window.PNT_BEAST_TIDE : null;
  var ESC = (typeof window !== 'undefined') ? window.PNT_ESCORT : null;
  var AUC = (typeof window !== 'undefined') ? window.PNT_AUCTION : null;
  var COMP = (typeof window !== 'undefined') ? window.PNT_COMPANION : null;
  var SB = (typeof window !== 'undefined') ? window.PNT_SEASON_BOARD : null;
  var LIB = (typeof window !== 'undefined') ? window.PNT_LIBRARY : null; // Tàng Kinh Các (js/library.js)
  var AFF = (typeof window !== 'undefined') ? window.PNT_AFFINITY : null; // Hảo cảm NPC (js/affinity.js)
  var SWN = (typeof window !== 'undefined') ? window.PNT_SWORN : null; // Kết nghĩa (js/sworn.js)
  var FM = (typeof window !== 'undefined') ? window.PNT_FORMATION : null; // Trận kỳ (js/formation.js)
  var BX = (typeof window !== 'undefined') ? window.PNT_BESTIARY : null; // Thiên Cơ Đồ Giám (js/bestiary.js)
  var FAIR = (typeof window !== 'undefined') ? window.PNT_MARKET_FAIR : null; // Chợ Phiên Thanh Khê (js/market-fair.js)
  var LG = (typeof window !== 'undefined') ? window.PNT_LEGEND_BOARD : null; // Bia Truyền Kỳ Thanh Sơn (js/legend-board.js)
  var MM = (typeof window !== 'undefined') ? window.PNT_MINIMAP : null; // Minimap + Bản đồ thế giới (js/minimap.js, mục 25 hàng chờ)
  var TD = (typeof window !== 'undefined') ? window.PNT_SEASON_TIDE : null; // Linh Khí Thủy Triều theo mùa (js/season-tide.js)
  var WE = (typeof window !== 'undefined') ? window.PNT_WORLD_EVENTS : null; // Sự kiện ngẫu nhiên thế giới (js/world-events.js)
  var DM = (typeof window !== 'undefined') ? window.PNT_DEMON : null;
  var SM = (typeof window !== 'undefined') ? window.PNT_SMOOTH : null;
  var BOS = (typeof window !== 'undefined') ? window.PNT_BOSSES : null;
  var YDART = (typeof window !== 'undefined') ? window.PNT_YEU_DAN_ART : null;
  var HART = (typeof window !== 'undefined') ? window.PNT_HERB_ART : null;
  var MANU = (typeof window !== 'undefined') ? window.PNT_MANUALS : null; // bí tịch skill (js/manuals.js)
  var MART = (typeof window !== 'undefined') ? window.PNT_MANUAL_ART : null; // icon AI bí tịch (js/manual-icons-ai.js)
  var PETS = (typeof window !== 'undefined') ? window.PNT_PETS : null;
  var PAI = (typeof window !== 'undefined') ? window.PNT_PET_AI : null;
  var NET = (typeof window !== 'undefined') ? window.PNT_NET : null;
  var ALCH = (typeof window !== 'undefined') ? window.PNT_ALCHEMY : null;
  var TAL = (typeof window !== 'undefined') ? window.PNT_TALISMANS : null; // phù chú (js/talismans.js)
  var TALART = (typeof window !== 'undefined') ? window.PNT_TALISMAN_ART : null; // icon AI phù (js/talisman-icons-ai.js)
  var OGART = (typeof window !== 'undefined') ? window.PNT_ORIGIN_ART : null; // icon AI dấu ấn nguồn gốc (js/origin-icons-ai.js)
  var QART = (typeof window !== 'undefined') ? window.PNT_QUEST_ART : null; // icon AI vật phẩm nhiệm vụ/lệnh bài (js/quest-items-ai.js, tích hợp 31/10)
  var FLIGHT = (typeof window !== 'undefined') ? window.PNT_FLIGHT : null;
  var FLIGHT2 = (typeof window !== 'undefined') ? window.PNT_FLIGHT2 : null; // ngự pháp bảo + ngự linh thú (js/flight2.js, mục 27)
  var HB = (typeof window !== 'undefined') ? window.PNT_HIGHBAL : null; // cân bằng chặng cao (js/high-balance.js, mục 28)
  var WD = (typeof window !== 'undefined') ? window.PNT_WARDROBE : null;
  var CAI = (typeof window !== 'undefined') ? window.PNT_COSTUME_AI : null;
  var RC = (typeof window !== 'undefined') ? window.PNT_REALM_COSTUMES : null;
  var SL = (typeof window !== 'undefined') ? window.PNT_SECT_LOOKS : null; // đồ tông (js/sect-looks.js, mục 26)
  var SECTP = (typeof window !== 'undefined') ? window.PNT_SECT : null;
  var SECTARC = (typeof window !== 'undefined') ? window.PNT_SECT_ARC : null;
  var DP = (typeof window !== 'undefined') ? window.PNT_DONG_PHU : null;
  var RIFT = (typeof window !== 'undefined') ? window.PNT_RIFT_EVENTS : null;
  var THIEN4 = (typeof window !== 'undefined') ? window.PNT_THIEN4 : null; // Thiên 4 ch.25-27 (js/thien4.js)
  var THIEN5 = (typeof window !== 'undefined') ? window.PNT_THIEN5 : null; // Thiên 5 ch.28-30 (js/thien5.js)
  var OG = (typeof window !== 'undefined') ? window.PNT_ORIGINS : null; // Nguồn gốc nhân vật (js/origins.js, mục 19)
  var GC = (typeof window !== 'undefined') ? window.PNT_GIFTCODE : null; // Giftcode nhập mã quà (js/giftcode.js, lệnh Bui 20:19)
  var AC = (typeof window !== 'undefined') ? window.PNT_ANTICHEAT : null; // chống hack (js/anticheat.js): ký save + snapshot + trần biến động + đồng hồ đơn điệu
  var CTL = (typeof window !== 'undefined') ? window.PNT_CONTROLS : null; // điều khiển & màn hình (js/controls.js): gán phím/joystick/tay cầm/layout/zoom
  var PROPZ = (typeof window !== 'undefined') ? window.PNT_PROP_ZONES : null; // vùng prop sống (js/prop-zones.js, ATLAS LAB tích hợp 31/10)
  var PROPS = (typeof window !== 'undefined') ? window.PNT_PROPS : null; // engine prop y-sort + thu hoạch (js/props.js)
  var D8 = (typeof window !== 'undefined') ? window.PNT_DIR8 : null; // engine 8 hướng (js/dir8.js, lệnh Bui 20:45 31/10)
  var PLZ = (typeof window !== 'undefined') ? window.PNT_PLAZA_GUIDE : null; // dẫn đường quảng trường sơn môn map 3 (js/plaza-guide.js, mục 108)
  // TÍCH HỢP A (01/11/2026): đăng ký hình cho các bộ trang phục có sheet
  // dạng hero look — 4 bộ đợt 1 (trường look/lookGender trong
  // js/wardrobe.js trỏ tới looks nv14–nv17 của js/hero-ai.js). Gọi
  // _registerArt đúng giới của look để hasArt mở: bộ hiện trong tủ,
  // mua/rớt/mặc chạy thật, và nhánh vẽ nhân vật dùng chính look đó làm
  // hình thân. Bộ chưa có look (đợt 2) không được đăng ký — giữ ẩn
  // theo luật "hình chưa xong thì ẩn" của Bui.
  if (WD && WD._registerArt && WD.COSTUMES && HAI && HAI.looks) {
    Object.keys(WD.COSTUMES).forEach(function (cid) {
      var cdefA = WD.COSTUMES[cid];
      if (cdefA.look && cdefA.lookGender && HAI.looks[cdefA.lookGender + '_' + cdefA.look]) {
        WD._registerArt(cid, { genders: [cdefA.lookGender] });
      }
    });
  }
  // Móc controls (3): zoom camera — khung nhìn HIỆU DỤNG theo mức zoom.
  // Toạ độ thế giới + va chạm KHÔNG đổi; chỉ camera nhìn rộng/hẹp hơn.
  function ctlZoom() { try { return (CTL && CTL.zoom) ? CTL.zoom() : 1; } catch (e) { return 1; } }
  function effVW() { return VIEW_W / ctlZoom(); }
  function effVH() { return VIEW_H / ctlZoom(); }
  var pendingAhackNotice = null; // thông báo khôi phục save (từ loadSave) — hiện 1 lần khi vào game
  var TILE = 32, VIEW_W = 768, VIEW_H = 576;
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  canvas.width = VIEW_W; canvas.height = VIEW_H;
  var ACC_KEY = 'pnt-accounts-v1';
  var SAVE_PREFIX = 'pnt-save-';
  var accounts = {};
  // ----- Kho tài khoản: đọc THẲNG từ localStorage mỗi lần cần -----
  // VÁ LỖI MẤT TÀI KHOẢN SAU F5 (playtest live 12:46 ngày 2026-10-30):
  // bản cũ nạp kho tài khoản 1 LẦN lúc mở trang vào bộ nhớ rồi mỗi lần
  // đăng kí lại ghi ĐÈ cả kho bằng bản chụp đó. Trang/tab nào mở TRƯỚC
  // (bản chụp chưa có tài khoản mới) mà đăng kí SAU sẽ âm thầm xoá mọi
  // tài khoản đã đăng kí ở tab khác sau khi nó mở — tải lại trang là
  // "Tài khoản không tồn tại." dù không hề có lệnh xoá nào. Bản vá:
  // (1) ghi theo kiểu GỘP với kho đang có trong storage, (2) đăng nhập
  // làm mới từ storage trước khi kiểm, (3) ghi xong đọc lại kiểm chứng,
  // hỏng thì trả false để handler BÁO LỖI thay vì nuốt im lặng như cũ,
  // (4) JSON kho hỏng thì giữ bản thô ở khoá '.corrupt' thay vì coi như
  // kho rỗng (mất trắng mọi tài khoản mà không để lại dấu vết).
  function readStoredAccounts() {
    var raw = null;
    try { raw = localStorage.getItem(ACC_KEY); } catch (e) { return null; }
    if (!raw) return {};
    try {
      var obj = JSON.parse(raw);
      return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
    } catch (e) {
      try { localStorage.setItem(ACC_KEY + '.corrupt', raw); } catch (e2) {}
      return {};
    }
  }
  accounts = readStoredAccounts() || {};
  function saveAccounts() {
    try {
      var stored = readStoredAccounts();
      if (stored === null) return false;
      var merged = {};
      Object.keys(stored).forEach(function (k) { merged[k] = stored[k]; });
      Object.keys(accounts).forEach(function (k) { merged[k] = accounts[k]; });
      localStorage.setItem(ACC_KEY, JSON.stringify(merged));
      var back = readStoredAccounts();
      if (!back) return false;
      for (var k in accounts) { if (Object.prototype.hasOwnProperty.call(accounts, k) && !back[k]) return false; }
      accounts = merged;
      return true;
    } catch (e) { return false; }
  }
  // Bổ sung vào bản bộ nhớ mọi tài khoản đã có trong storage mà phiên
  // này chưa biết (đăng kí ở tab/cửa sổ khác sau khi trang này mở) —
  // chỉ THÊM, không ghi đè bản ghi đang có trong bộ nhớ.
  function refreshAccounts() {
    var stored = readStoredAccounts();
    if (stored === null) return;
    Object.keys(stored).forEach(function (k) { if (!accounts[k]) accounts[k] = stored[k]; });
  }
  var currentAccount = null, ch = null, qs = null, flags = {};
  var curMapId = 'map1';
  var mapEntry = { mapId: 'map1', tx: 71, ty: 72 }; // điểm vào map hiện tại (Thổ Độn Phù độn về đây) — V7-EXPAND (tích hợp A 01/11/2026): start map1 (71,72) trên khung 168x150, = số cũ (43,47) + neo map1 (28,25)
  function curMap() { return (M.MAPS && M.MAPS[curMapId]) || M.MAP; }
  var px = 0, py = 0, dir = 'down', moving = false, walkTimer = 0, walkFrameIdx = 0;
  var dir8 = 'down'; // DIR8: hướng HIỂN THỊ 8 hướng của nhân vật (chỉ runtime, dẫn xuất từ vận tốc — save vẫn giữ dir 4 hướng như cũ)
  var monsters = [], herbs = [], floaters = [], skillFx = null;
  // Hệ thống skill: hiệu ứng đang chạy, combo đánh thường, rung màn hình.
  var effects = [], fxSeq = 0, comboStep = 0, comboTimer = 0;
  var shakeT = 0, shakeMag = 0, skillBarBuilt = false, barTick = 0;
  var portalCooldown = 0;
  var gateWarnAt = 0; // chống spam toast khi đứng trên cổng bị khóa cảnh giới (chặng Đại Sơn cao, js/maps.js)
  var poisonAcc = 0; // tích luỹ giây cho nhịp trừ HP của độc rắn lục (hệ đan dược)
  var talHotAcc = 0; // tích luỹ giây cho nhịp hồi HP của Hồi Xuân Phù (js/talismans.js)
  var autoAttack = false, autoMeditate = false, autoAtkTimer = 0, autoMedTimer = 0;
  var keys = {}, dlg = null, talkingNpc = null, dlgCycle = {};
  var dlgOriginCue = false; // QA 18:16 30/10: hộp thoại vừa mở có phải câu NHẬN RA DẤU ẤN (origins.js) không — để openDialogue phát tiếng kỳ ngộ thay vì im lặng
  var lastTime = 0, camX = 0, camY = 0, loopStarted = false;
  var moveTarget = null, movePath = null, stuckFrames = 0, lastPX = 0, lastPY = 0;
  // V7 di chuyển + động tác: vận tốc px/giây có easing (gia tốc/giảm tốc),
  // pha đi bộ khóa theo quãng đường, camera lerp có nhìn trước, động tác
  // nhân vật đang chạy (sprites.actionFrame), tư thế thổ nạp, bụi bước chân.
  var MOVE_TOP = 150;
  var pvx = 0, pvy = 0, walkPhase = 0, idleT = 0, stuckT = 0;
  var action = null, deathPending = false;
  var medPoseT = 0, medPhase = 0;
  var dusts = [], dustAcc = 0;
  var lastStepHalf = -1; // lượt âm thanh 31/10: nửa chu kỳ đi bộ đã phát tiếng bước chân gần nhất (chân chạm đất ở mốc 0/10 của chu kỳ 20 frame)
  // Mây bay map 3 (js/clouds.js): trạng thái mây sống theo thời gian thực,
  // chỉ cập nhật/vẽ khi đang ở map 3; map khác giữ nguyên không đụng.
  var cloudState = null;
  // Môi trường động bí cảnh vết nứt (js/realm-ambient.js): hạt + mảnh hư
  // không sống theo thời gian thực, chỉ chạy ở 11 map kho vết nứt.
  var realmFxState = null;
  // ----- NGỰ KIẾM PHI HÀNH (luật + dữ liệu ở js/flight.js, story-bible 24) --
  // flying: đang ở chế độ bay — trạng thái PHIÊN CHƠI, không lưu vào save
  // (nạp lại luôn ở mặt đất). flyLift: độ nâng render nội suy (px), qua nó
  // nhân vật + phi kiếm + bóng tách nhau. flyTrial: bài bay thử Q3 đang chạy
  // { next, timeLeft } — chỉ sống trong phiên, rời map/hết giờ là hủy.
  // LƯU Ý CHO AUDIT CHẠM ĐẤT (lệnh Bui 20:36): luật "chân chạm đất, bộ phận
  // liền khối" CHỈ áp cho frame ĐI BỘ và ĐỨNG. Bay là CHẾ ĐỘ RIÊNG hợp lệ
  // theo thiết kế (1 trong 3 chế độ bay được phép: ngự kiếm / ngự pháp bảo /
  // ngự linh thú) — flyLift là offset render của chế độ bay, KHÔNG phải
  // frame đi bộ lơ lửng; audit chạm đất không được bắt nhầm chế độ này.
  var flying = false, flyLift = 0, flyTrial = null;
  // NGỰ PHÁP BẢO + NGỰ LINH THÚ (js/flight2.js, mục 27): kiểu bay đang
  // chọn ('sword' | 'artifact' | 'pet'). Bay CHỈ ở 3 chế độ ngự này; tốc
  // độ / va chạm chiều cao / cổng phải hạ đất dùng chung khung ngự kiếm
  // nên mọi điểm gọi landPlayer/checkPortal hiện có áp nguyên cho cả 3.
  // Sở thích kiểu bay lưu ở flags.flyMode (khôi phục ở startGame); trạng
  // thái đang bay thì không lưu (nạp lại luôn ở mặt đất).
  var flyMode = 'sword';
  // Linh thú (js/pets.js): thực thể thú xuất chiến đi theo chủ — vị trí px,
  // hướng mặt, nhịp tấn công/kỹ năng riêng, mục tiêu hiện tại. Logic loài/
  // chỉ số/thu phục/trứng nằm hết ở pets.js; ở đây chỉ hành vi + vẽ.
  var petEnt = { x: 0, y: 0, face: 'right', faceV: 'front', animT: 0, atkT: 0, skillT: 3, hitT: 0, target: null, vx: 0, vy: 0 };
  // Đệ tử đồng hành (js/companion.js): thực thể người đi cùng — vị trí
  // px, hướng mặt, nhịp tấn công/kỹ năng riêng, mục tiêu đánh phụ.
  // Logic chiêu mộ/chỉ số/chọn mục tiêu nằm hết ở companion.js; ở đây
  // chỉ hành vi + vẽ bằng sheet NPC của tông (npc-ai.js).
  var compEnt = { x: 0, y: 0, face: 'right', faceV: 'front', animT: 0, atkT: 0, skillT: 3, hitT: 0, target: null, vx: 0, vy: 0 };
  function activeCompanionDef() { return (COMP && ch) ? COMP.activeCompanion(flags) : null; }
  function syncCompEnt(snap) {
    var comp = activeCompanionDef();
    if (!comp) { compEnt.target = null; return; }
    if (snap || compEnt.x === 0) { compEnt.x = px + 30; compEnt.y = py + 6; compEnt.vx = 0; compEnt.vy = 0; }
    compEnt.face = dir === 'left' ? 'left' : 'right';
    compEnt.faceV = dir === 'up' ? 'back' : 'front';
  }
  var PET_ELEM_COLOR = { kim: '#ffd94a', moc: '#69d66f', thuy: '#5aa7d6', hoa: '#ff7a3c', tho: '#d99a4e', phong: '#9ad6a8', loi: '#cfa6ff', bang: '#bfe3ff' };
  function activePetInst() { return (PETS && ch) ? PETS.activePet(ch) : null; }
  function syncPetEnt(snap) {
    var pet = activePetInst();
    if (!pet) { petEnt.target = null; return; }
    if (snap || petEnt.x === 0) { petEnt.x = px - 30; petEnt.y = py + 6; petEnt.vx = 0; petEnt.vy = 0; }
    petEnt.face = dir === 'left' ? 'left' : 'right';
    petEnt.faceV = dir === 'up' ? 'back' : 'front';
  }
  // Pháp khí/bảo vật (js/artifacts.js): đồng hồ quỹ đạo bay quanh nhân vật,
  // hẹn giờ phi kiếm hộ thân, trạng thái thanh kích hoạt pháp bảo.
  var animClock = 0, flyT = 0, artBarBuilt = false, artBarTick = 0;
  // V10 MƯỢT (js/smooth.js): lớp nội suy render + đo FPS. showFps bật bằng
  // phím F9 hoặc dấu ` — ô nhỏ góc trái hiện FPS thật + mức tự giảm tải.
  var showFps = false;
  // Đệm dùng lại cho vòng vẽ (không cấp phát trong frame nóng): danh sách
  // y-sort dùng pool vật thể, nhãn dùng mảng tĩnh, fxv của hiệu ứng kỹ
  // năng dùng 1 vật thể cào chung (FX.draw đọc đồng bộ nên an toàn).
  var _drawList = [], _pool = [], _poolN = 0;
  var _npcLabels = [], _placedLabels = [];
  function pooledObj() { var o = _pool[_poolN]; if (!o) { o = {}; _pool[_poolN] = o; } _poolN++; return o; }
  var _fxv = { skill: null, root: null, dir: 'right', x: 0, y: 0, step: 0, seed: 0, color: null, radius: 0, from: null, targets: [] };
  var _fxTPool = [], _fxQ = 'cao';
  function drawFxLayer(c2, fr) { FX.draw(c2, _fxv, fr, _fxQ, camX, camY); }
  // Tự giảm tải CHỈ hạ mật độ hạt/glow của FX theo mức FPS (0..3), không
  // bao giờ đụng nội suy chuyển động.
  function degradeFxQ(q, lvl) {
    if (lvl >= 3) return 'thap';
    if (lvl === 2) return q === 'cao' ? 'trung' : 'thap';
    return q;
  }
  // Bảng màu bụi bước chân theo 21 nấc alpha — khỏi nối chuỗi mỗi hạt.
  var DUST_STYLES = [];
  for (var dsi = 0; dsi <= 20; dsi++) DUST_STYLES.push('rgba(216,196,150,' + (0.30 * dsi / 20).toFixed(3) + ')');
  // V5: nền map là ảnh vẽ sẵn (assets/map1-bg-v5.png) khớp bố cục tilemap;
  // tilemap chỉ giữ logic (va chạm / cổng / quái / nhiệm vụ). Môi trường không
  // có Image (test Node) hoặc ảnh chưa nạp xong thì tự rơi về vẽ tile như cũ.
  var bgImgs = {};
  // Hàng chờ 33 (QA 14:01 30/10): KHÔNG nạp sẵn nền của MỌI map ngay
  // khi mở trang nữa (14 map chính + bí cảnh ≈ 114 MB — điện thoại
  // yếu treo ngay ở màn hình đăng nhập). Nay nạp LƯỜI: map đang đứng
  // + nạp trước nền các map tới được qua cổng của map đó; tới map
  // nào thiếu nền thì nạp thêm map đó (đúng nguyên tắc tải dần theo
  // map đã chốt cho game). Trong lúc nền đang tải, curBg() trả null
  // và game tự vẽ bằng tile như cũ — không vỡ hình.
  function ensureBg(mid) {
    if (typeof Image === 'undefined' || bgImgs[mid]) return;
    if (!M.MAPS || !M.MAPS[mid] || !M.MAPS[mid].bg) return;
    if (M.MAPS[mid].bgChunks) return; // map chia mảng: nạp theo mảng (drawBgChunks), không tải file full
    var im = new Image();
    im.onload = function () { im._ready = true; refreshBgLoadStatus(); };
    im.src = M.MAPS[mid].bg;
    bgImgs[mid] = im;
  }
  // QA35 (hang cho 35, QA (g) 14:01 30/10): dong trang thai tai nen
  // map1 tren man dang ki. Chi theo doi nen GAME (bgImgs['map1']) —
  // anh trang tri #bgArt la file webp rieng, khong phai nen game.
  // Hien khi nen game map1 chua san, an ngay khi onload cua
  // ensureBg bao san. Vong nap 14 map luc mo trang cua muc 33 van
  // KHONG tro lai: day chi la 1 file map1 (lang khoi dau chac chan
  // cua nhan vat moi), startGame prefetch co cache-check nen khong
  // tai lai; nguoi choi cu ve map tu save thi duong startGame lo.
  function bgMap1Ready() { var b = bgImgs['map1']; return !!(b && b._ready); }
  function refreshBgLoadStatus() {
    var el = $('bgLoadStatus');
    if (!el) return;
    if (bgMap1Ready()) { el.style.display = 'none'; return; }
    el.textContent = 'Đang tải nền map…';
    el.style.display = 'block';
  }
  // ----- TÍCH HỢP SƠN MÔN (31/10/2026): nền chia mảng bgChunks -----
  // Map instance lớn (sơn môn) dùng nền cắt lưới (vd 3x3) có vùng chồng
  // lấn: chỉ nạp mảng giao khung nhìn + lề, vẽ đè lên lớp tile (tile
  // luôn là nền dự phòng cho mảng chưa nạp). Vùng chồng lấn giữa các
  // mảng là tranh giống hệt nhau nên vẽ đè không lộ seam.
  var bgChunkImgs = {}; // key 'mid|r|c' -> Image (có _ready khi nạp xong)
  function bgChunkKey(mid, r, c) { return mid + '|' + r + '|' + c; }
  function ensureBgChunk(mid, bc, r, c) {
    var k = bgChunkKey(mid, r, c);
    if (bgChunkImgs[k] || typeof Image === 'undefined') return;
    var im = new Image();
    im.onload = function () { im._ready = true; };
    im.src = bc.src.replace('{r}', r).replace('{c}', c);
    bgChunkImgs[k] = im;
    var keys = Object.keys(bgChunkImgs);
    if (keys.length > 36) keys.forEach(function (kk) { if (kk.indexOf(mid + '|') !== 0) delete bgChunkImgs[kk]; });
  }
  function bgChunkAt(bc, tx, ty) {
    // Mảng chứa ô (tx,ty): mảng c phủ [originX[c], originX[c]+chunkTilesW)
    var c = 0, r = 0, i;
    for (i = 0; i < bc.cols; i++) if (tx >= bc.originX[i]) c = i;
    for (i = 0; i < bc.rows; i++) if (ty >= bc.originY[i]) r = i;
    return [r, c];
  }
  function drawBgChunks(mp, VIEW_W, VIEW_H) {
    var bc = mp.bgChunks; if (!bc) return;
    var tp = bc.tilePx || 32;
    var vx0 = camX - tp * 2, vy0 = camY - tp * 2, vx1 = camX + VIEW_W + tp * 2, vy1 = camY + VIEW_H + tp * 2;
    for (var r = 0; r < bc.rows; r++) for (var c = 0; c < bc.cols; c++) {
      var ox = bc.originX[c] * tp, oy = bc.originY[r] * tp;
      var cw = bc.chunkTilesW * tp, ch = bc.chunkTilesH * tp;
      if (ox + cw < vx0 || oy + ch < vy0 || ox > vx1 || oy > vy1) continue;
      ensureBgChunk(mp.id, bc, r, c);
      var im = bgChunkImgs[bgChunkKey(mp.id, r, c)];
      if (im && im._ready) ctx.drawImage(im, ox - camX, oy - camY);
    }
  }
  function prefetchBgAround(mid) {
    ensureBg(mid);
    var mpP = (M.MAPS || {})[mid];
    if (mpP && mpP.portals) mpP.portals.forEach(function (p) {
      ensureBg(p.to);
      var dest = (M.MAPS || {})[p.to];
      if (dest && dest.bgChunks) { var rc = bgChunkAt(dest.bgChunks, p.tx, p.ty); ensureBgChunk(p.to, dest.bgChunks, rc[0], rc[1]); }
    });
  }
  function curBg() { var b = bgImgs[curMapId]; return (b && b._ready) ? b : null; }
  // ----- V7/V8: 3 mức đồ hoạ cho QUÁI + NHÂN VẬT + NPC (sheet ảnh AI) -----
  //   Cao        = sheet ảnh thiết kế AI gốc (assets/monsters-ai, nạp lười).
  //   Trung bình = sheet ảnh AI giảm chi tiết riêng (assets/monsters-md).
  //   Thấp       = sprite lưới ký tự MONSTER_FRAMES như trước (sprites.js).
  // Lưu theo tài khoản: localStorage 'pnt-gfx-<username>'; mặc định 'cao'.
  // Đổi mức áp dụng ngay ở frame vẽ tiếp theo, không tải lại trang.
  var gfxLevel = 'cao';
  var GFX_LABEL = { cao: 'Cao', trung: 'Trung bình', thap: 'Thấp' };
  var _monSheets = {};
  function getMonsterSheet(level, type, key) {
    if (!MAI || !MAI.tiers || typeof Image === 'undefined') return null;
    var dir = MAI.tiers[level];
    if (!dir || !MAI.types || !MAI.types[type]) return null;
    var ck = level + '/' + type + '/' + key;
    var im = _monSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = dir + '/' + type + '/' + key + '.png';
      _monSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // ----- V8/V9: sheet AI cho NHÂN VẬT + NPC (cùng mẫu nạp lười như quái) -----
  // Nhân vật (V9, ĐỊNH DẠNG SHEET CHUẨN của team động tác):
  //   hero-ai/hero-md/<gender>/<origin>/<dir>-<action>.png — 4 hướng AI
  //   thật, đủ 15 action (idle/walk + 13 động tác), 20 frame/dải, neo chân.
  // NPC: npcs-ai/npcs-md/<id>/<down|up|left|right>-idle.png (4 hướng thật).
  var _heroSheets = {};
  function getHeroSheet(level, gender, origin, set) {
    if (!HAI || !HAI.tiers || typeof Image === 'undefined') return null;
    var dir = HAI.tiers[level];
    // origin co the la xuat than goc (HAI.types, sheet 20 frame) hoac ma
    // tao hinh NV01-NV12 (HAI.looks, sheet 60 frame) — cung quy uoc duong
    // dan hero-ai|hero-md/<gender>/<origin>/<dir>-<action>.png.
    if (!dir || !(HAI.types && HAI.types[gender + '_' + origin]) &&
        !(HAI.looks && HAI.looks[gender + '_' + origin])) return null;
    var ck = level + '/' + gender + '/' + origin + '/' + set;
    var im = _heroSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = dir + '/' + gender + '/' + origin + '/' + set + '.png';
      _heroSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // DIR8: sheet CHÉO (8 hướng) của look — chỉ look có bộ chéo trong
  // HAI.diag (hiện: nu_nv13, set nu/nv13diag, file
  // <tiers>/<set>/<dir8>-<action>.png, 60 frame, cell bằng cell look).
  // Cùng mẫu nạp lười + cache với getHeroSheet; key cache có tiền tố
  // 'diag/' để không đụng bộ 4 hướng.
  function getHeroDiagSheet(level, lookKey, set) {
    if (!HAI || !D8 || typeof Image === 'undefined') return null;
    var p = D8.heroDiagPath(HAI, level, lookKey, set);
    if (!p) return null;
    var ck = 'diag/' + level + '/' + lookKey + '/' + set;
    var im = _heroSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = p;
      _heroSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // ----- Y PHỤC (js/wardrobe.js + js/costume-ai.js): sheet PHỦ theo
  // costumeId + giới tính, cùng định dạng hero (dir-action, 20 frame).
  // Manifest rỗng (team mỹ thuật chưa giao hình) thì loader trả null và
  // nhân vật vẽ như thường — bộ chưa có hình vốn đã bị ẩn khỏi tủ đồ.
  var _costumeSheets = {};
  function getCostumeSheet(level, costumeId, gender, set) {
    if (!CAI || !CAI.tiers || typeof Image === 'undefined' || !WD) return null;
    if (!WD.hasArt(costumeId, gender)) return null;
    var dir = CAI.tiers[level];
    if (!dir) return null;
    var ck = level + '/' + costumeId + '/' + gender + '/' + set;
    var im = _costumeSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = dir + '/' + costumeId + '/' + gender + '/' + set + '.png';
      _costumeSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // ----- V10 (team mỹ thuật nhân vật): lớp phủ Y PHỤC THEO CẢNH GIỚI
  // (js/hero-realm.js — tự áp theo realmRank, không nằm trong tủ đồ) +
  // viên ngọc LINH CĂN ở ngực. Cùng định dạng sheet chuẩn với hero-ai.
  var _realmOvSheets = {};
  function getRealmOvSheet(level, gender, origin, rank, set) {
    if (!HRM || typeof Image === 'undefined') return null;
    var p = HRM.realmPath(level, gender, origin, rank, set);
    if (!p) return null;
    var ck = 'r/' + level + '/' + gender + '/' + origin + '/' + rank + '/' + set;
    var im = _realmOvSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = p;
      _realmOvSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  var _gemSheets = {};
  function getGemSheet(level, root, gender, set) {
    if (!HRM || typeof Image === 'undefined') return null;
    var p = HRM.gemPath(level, root, gender, set);
    if (!p) return null;
    var ck = 'g/' + level + '/' + root + '/' + gender + '/' + set;
    var im = _gemSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = p;
      _gemSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // TRANG PHỤC CẢNH GIỚI THIẾT KẾ RIÊNG (js/realm-costumes.js): sheet đầy
  // đủ 60 frame theo bậc (rank 2..6) + giới — xem docs/realm-costumes.md.
  var _rcSheets = {};
  function getRealmCostumeSheet(level, rank, gender, set) {
    if (!RC || typeof Image === 'undefined') return null;
    var p = RC.path(level, rank, gender, set);
    if (!p) return null;
    var ck = 'rc/' + level + '/' + rank + '/' + gender + '/' + set;
    var im = _rcSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = p;
      _rcSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // ĐỒ TÔNG (js/sect-looks.js, mục 26): sheet đầy đủ 60 frame theo tông +
  // giới, THAY sheet gốc khi SL.layerFor cho phép (đã bái nhập + không
  // mặc tủ đồ + chưa Trúc Cơ). Chưa bái sư thì layerFor = null nên
  // không bao giờ hiện đồ tông. Sheet chưa nạp xong -> trả null để
  // engine vẽ sheet gốc như cũ (không vẽ nửa chừng).
  var _sectSheets = {};
  function getSectSheet(level, sectId, gender, set) {
    if (!SL || typeof Image === 'undefined') return null;
    var p = SL.path(level, sectId, gender, set);
    if (!p) return null;
    var ck = 'sect/' + level + '/' + sectId + '/' + gender + '/' + set;
    var im = _sectSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = p;
      _sectSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  var _npcSheets = {};
  // TÍCH HỢP SƠN MÔN (31/10/2026): sheet TÔNG CHỦ (assets/sect-masters-ai|md,
  // 60 frame/dải, ô 192/120 — manifest assets/sect-masters-ai/manifest.json)
  // thay nguồn sheet thường cho NPC tông chủ trong sơn môn: sprite của họ
  // trong maps.js là 'sect_master_<tông>', ánh xạ sang slug thư mục ở đây.
  var SECT_MASTER_SLUG = { sect_master_thanh_phong: 'thanh-phong', sect_master_huyen_phap: 'huyen-phap', sect_master_thien_cong: 'thien-cong', sect_master_dan_ha: 'dan-ha', sect_master_van_thu: 'van-thu', sect_master_thien_phu: 'thien-phu', sect_master_cuu_cung: 'cuu-cung', sect_master_kim_cang: 'kim-cang', sect_master_ngu_doc: 'ngu-doc', sect_master_huyen_am: 'huyen-am' };
  var SECT_MASTER_DIRS = { cao: 'assets/sect-masters-ai', trung: 'assets/sect-masters-md' };
  function getNpcSheet(level, id, set) {
    var mSlug = SECT_MASTER_SLUG[id];
    if (mSlug) {
      var mDir = SECT_MASTER_DIRS[level];
      if (!mDir || typeof Image === 'undefined') return null;
      var mck = 'master/' + level + '/' + mSlug + '/' + set;
      var mim = _npcSheets[mck];
      if (!mim) {
        mim = new Image();
        mim.onload = function () { mim._ready = true; };
        mim.src = mDir + '/' + mSlug + '/' + set + '.png';
        _npcSheets[mck] = mim;
      }
      return mim._ready ? mim : null;
    }
    if (!NAI || !NAI.tiers || typeof Image === 'undefined') return null;
    var dir = NAI.tiers[level];
    if (!dir || !NAI.types || !NAI.types[id]) return null;
    var ck = level + '/' + id + '/' + set;
    var im = _npcSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = dir + '/' + id + '/' + set + '.png';
      _npcSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // TÍCH HỢP A (01/11/2026): nạp sheet NPC theo ĐƯỜNG DẪN ĐẦY ĐỦ (dùng
  // cho sheet archetype 8 hướng — js/dir8.js npcSheetPath trả path
  // trọn, không theo cặp id/set của bộ nạp cũ). Cùng cache _npcSheets.
  function getNpcSheetByPath(p) {
    if (typeof Image === 'undefined' || !p) return null;
    var ck = 'path/' + p;
    var im = _npcSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = p;
      _npcSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // ----- Linh thú (js/pet-ai.js): nạp lười sheet theo (mức, loài, view-act)
  // như quái. Từ đợt 4DIR (30/10): CẢ 51 loài đều có sheet hướng sau THẬT
  // 60 frame (types[id].back = true, backFrames = 60) sinh bởi
  // tools/art-pets-back60.py; hit/death hướng trước dùng sheet ngang.
  var _petSheets = {};
  // PET-ENG (tích hợp 31/10/2026): số frame THẬT của từng họ dải theo
  // manifest pet-ai — back 60 (mọi loài), front/right 60 ở các loài R1
  // có frontFrames/rightFrames (trước đây engine mặc định 20 cho
  // front/right nên loài R1 chỉ chạy 1/3 đầu dải 60 frame).
  function petStripFrames(pInfo, key) {
    if (!pInfo || !key) return 20;
    if (key.indexOf('back-') === 0) return pInfo.backFrames || 20;
    if (key.indexOf('front-') === 0) return pInfo.frontFrames || 20;
    if (key.indexOf('right-') === 0) return pInfo.rightFrames || 20;
    return 20;
  }
  function getPetSheet(level, petId, key) {
    if (!PAI || !PAI.types || typeof Image === 'undefined') return null;
    var t = PAI.types[petId];
    if (!t) return null;
    var dir = level === 'trung' ? t.dirTrung : t.dirCao;
    if (!dir) return null;
    var ck = level + '/' + petId + '/' + key;
    var im = _petSheets[ck];
    if (!im) {
      im = new Image();
      im.onload = function () { im._ready = true; };
      im.src = dir + '/' + key + '.png';
      _petSheets[ck] = im;
    }
    return im._ready ? im : null;
  }
  // Lưới THẤP của linh thú (pet-ai.js frames): 1 lưới thiết kế 28x28/loài/
  // hướng, JS ghép 3 dải ngang (đầu 0-9 / thân 10-19 / chân 20-27) với lệch
  // pha theo động tác + frame -> frame động thật, không cần sheet riêng.
  function petGridFrame(petId, view, act, f) {
    if (!PAI || !PAI.frames || !PAI.frames[petId]) return null;
    var fd = PAI.frames[petId];
    var g = fd[view === 'front' || view === 'back' ? 'front' : 'right'];
    if (!g || !g.rows) return null;
    var headDy = 0, bodyDy = 0, legDy = 0, allDx = 0, allDy = 0, sink = 0;
    if (act === 'idle') headDy = (f >= 5 && f < 15) ? 1 : 0;
    else if (act === 'move') { var half = Math.floor(f / 5) % 2; legDy = half ? -1 : 0; bodyDy = half ? 0 : -1; }
    else if (act === 'attack') { var lg = f < 12 ? Math.round(3 * Math.sin(Math.PI * f / 11)) : 0; if (view === 'front' || view === 'back') allDy = lg; else allDx = (view === 'left' ? -lg : lg); }
    else if (act === 'hit') { if (view === 'right') allDx = f < 6 ? -1 : 0; else if (view === 'left') allDx = f < 6 ? 1 : 0; }
    else if (act === 'death') sink = Math.floor(f / 20 * 4);
    var out = [];
    for (var r = 0; r < 28; r++) { var row = []; for (var c = 0; c < 28; c++) row.push(null); out.push(row); }
    for (var y = 0; y < 28; y++) {
      var dyB = y < 10 ? headDy : (y < 20 ? bodyDy : legDy);
      var src = g.rows[y];
      if (view === 'left') src = src.split('').reverse().join(''); // lật gương lưới ngang cho hướng trái
      for (var x = 0; x < 28; x++) {
        var ch2 = src[x];
        if (ch2 === '.' || !g.pal[ch2]) continue;
        var nx = x + allDx, ny = y + dyB + allDy + sink;
        if (nx >= 0 && nx < 28 && ny >= 0 && ny < 28) out[ny][nx] = g.pal[ch2];
      }
    }
    return out;
  }
  function updateGfxBtn() {
    var b = $('btnGfx');
    if (b) b.textContent = 'Đồ hoạ: ' + GFX_LABEL[gfxLevel];
  }
  function syncGfxShared() {
    // Khóa dùng chung 'pnt-gfx-quality' + window.PNT_GFX_QUALITY: hiệu ứng
    // kỹ năng (skill-fx.js) đọc đúng khóa này nên tự bám theo mức đồ hoạ.
    try { localStorage.setItem('pnt-gfx-quality', gfxLevel); } catch (e) {}
    try { window.PNT_GFX_QUALITY = gfxLevel; } catch (e) {}
  }
  function loadGfx() {
    gfxLevel = 'cao';
    try {
      var v = localStorage.getItem('pnt-gfx-' + (currentAccount || ''));
      if (v !== 'cao' && v !== 'trung' && v !== 'thap') v = localStorage.getItem('pnt-gfx-quality');
      if (v === 'cao' || v === 'trung' || v === 'thap') gfxLevel = v;
    } catch (e) {}
    updateGfxBtn();
    syncGfxShared();
  }
  function setGfx(level) {
    if (level !== 'cao' && level !== 'trung' && level !== 'thap') return;
    gfxLevel = level;
    try { localStorage.setItem('pnt-gfx-' + (currentAccount || ''), level); } catch (e) {}
    updateGfxBtn();
    syncGfxShared();
  }
  function cycleGfx() {
    setGfx(gfxLevel === 'cao' ? 'trung' : (gfxLevel === 'trung' ? 'thap' : 'cao'));
    toast('Đồ hoạ: ' + GFX_LABEL[gfxLevel] + ' (quái, nhân vật, người làng).');
  }
  // Ảnh AI pháp bảo nạp lười (js/artifacts.js phát 'pnt-art-icon' khi một
  // ảnh nạp xong): vẽ lại các panel đang mở để icon pixel tạm được thay
  // bằng ảnh AI. Orbit trong vòng lặp tự ăn ảnh mới, không cần xử lý ở đây.
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pnt-art-icon', function () {
      if (!ch) return;
      try { updateArtBar(); } catch (e) {}
      try { var pShop = $('panelArtShop'); if (pShop && pShop.style.display !== 'none') renderArtShop(); } catch (e) {}
      try { var pInv = $('panelInv'); if (pInv && pInv.style.display !== 'none') renderInventory(); } catch (e) {}
      try { var pAl = $('panelAlchemy'); if (pAl && pAl.style.display !== 'none') renderAlchemyPanel(); } catch (e) {}
      try { var pBk = $('panelBooks'); if (pBk && pBk.style.display !== 'none') renderBooksPanel(); } catch (e) {}
      try { if (bossPanelOpen) renderBossPanel(); } catch (e) {}
    });
  }
  // ----- Âm thanh tổng hợp WebAudio (js/sound.js) -----
  // Nút "Âm thanh" xoay vòng Bật -> Nhỏ -> Tắt như nút Đồ hoạ; lưu theo
  // tài khoản 'pnt-snd-<username>' (+ khóa chung 'pnt-snd-settings').
  // Module tự khởi tạo lười sau tương tác đầu tiên; thiếu module thì mọi
  // lời gọi đều được bỏ qua an toàn (if (SND)).
  var sndLevel = 'bat';
  var SND_LABEL = { bat: 'Bật', nho: 'Nhỏ', tat: 'Tắt' };
  function updateSndBtn() {
    var b = $('btnSnd');
    if (b) b.textContent = 'Âm thanh: ' + SND_LABEL[sndLevel];
  }
  function applySnd() {
    if (SND) SND.setLevel(sndLevel);
    try { localStorage.setItem('pnt-snd-settings', sndLevel); } catch (e) {}
    try { window.PNT_SOUND_LEVEL = sndLevel; } catch (e) {}
    updateSndBtn();
  }
  function loadSnd() {
    sndLevel = 'bat';
    try {
      var v = localStorage.getItem('pnt-snd-' + (currentAccount || ''));
      if (v !== 'bat' && v !== 'nho' && v !== 'tat') v = localStorage.getItem('pnt-snd-settings');
      if (v === 'bat' || v === 'nho' || v === 'tat') sndLevel = v;
    } catch (e) {}
    applySnd();
  }
  function setSndLevel(lv) {
    if (lv !== 'bat' && lv !== 'nho' && lv !== 'tat') return;
    sndLevel = lv;
    try { localStorage.setItem('pnt-snd-' + (currentAccount || ''), lv); } catch (e) {}
    applySnd();
  }
  function cycleSnd() {
    if (SND) SND.unlock();
    setSndLevel(sndLevel === 'bat' ? 'nho' : (sndLevel === 'nho' ? 'tat' : 'bat'));
    toast('Âm thanh: ' + SND_LABEL[sndLevel] + '.');
  }
  // Khoảng cách px từ nhân vật tới một quái + hệ số âm lượng theo khoảng
  // cách cho tiếng quái (gần to, xa nhỏ, quá 360px thì câm).
  function distToM(m) {
    var dx = m.x * TILE + 16 - px, dy = m.y * TILE + 28 - py;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function sndVol(d) { return Math.max(0, Math.min(1, 1 - d / 360)); }
  function $(id) { return document.getElementById(id); }
  function showScreen(id) {
    ['screen-register', 'screen-login', 'screen-create', 'screen-game'].forEach(function (s) {
      $(s).style.display = s === id ? 'block' : 'none';
    });
    // MÀN ĐẦU CÓ HỒN (20:22 mục 4): ngoài màn chơi, phủ nền tranh
    // map 1 v7 (nạp lười qua CSS #bgArt) + pan chậm; lỗi nạp thì
    // lớp nền không hiện, giữ nguyên nền trơn cũ.
    try {
      if (id !== 'screen-game') {
        if (!showScreen._bgTried) {
          showScreen._bgTried = true;
          var bim = new Image();
          bim.onload = function () { document.body.classList.add('has-art'); };
          bim.onerror = function () {};
          bim.src = 'assets/map1-bg-v7.webp'; // WebP q95 từ đúng tranh v7 (1,26MB thay 5,22MB PNG, PSNR 41,6dB)
        } else if (showScreen._bgOk !== false) document.body.classList.add('has-art');
      } else document.body.classList.remove('has-art');
      // QA35: man dang ki bat dau tai nen game map1 (1 file, khong
      // phai vong 14 map) + hien dong trang thai trong luc chua san.
      if (id === 'screen-register') { ensureBg('map1'); refreshBgLoadStatus(); }
    } catch (e) {}
  }
  // Toast (lệnh Bui 20:16 30/10): toast TRÙNG nhau liên tiếp không
  // cộng dồn thành nhiều dòng nữa — cùng một câu thì gộp thành
  // "câu ×N"; riêng họ "Zoom map: X%" (số thay đổi liên tục khi kéo
  // zoom) thì chỉ CẬP NHẬT dòng đang hiện thành % mới nhất. Cửa sổ
  // gộp 4 giây, chỉ gộp với dòng trên cùng của log.
  var toastMerge = { key: null, base: null, n: 0, el: null, at: 0 };
  // Phần 9: phân loại tin nhật ký/toast theo hệ màu chung (CSS .lg-*).
  function toastKind(msg) {
    if (typeof msg !== 'string') return 'info';
    if (/mất|chết|thua|bị thương|hết sạch/.test(msg)) return 'loss';
    if (/không đủ|chưa đủ|thiếu|cảnh báo|sắp|nguy hiểm/.test(msg)) return 'warn';
    if (/sự kiện|thú triều|đại hội|boss|phiên/.test(msg)) return 'event';
    if (/nhận được|nhận thưởng|phần thưởng|mở khóa|mở khoá|^\+/.test(msg)) return 'gain';
    return 'info';
  }
  function toast(msg) {
    var log = $('log');
    if (!log) return;
    var now = Date.now();
    var fam = (typeof msg === 'string' && msg.indexOf('Zoom map:') === 0) ? 'zoom' : null;
    var top = log.firstChild;
    if (top && toastMerge.el === top && now - toastMerge.at < 4000 &&
        ((fam && toastMerge.key === 'zoom') || (!fam && toastMerge.base === msg))) {
      if (fam) { top.textContent = msg; }
      else { toastMerge.n += 1; top.textContent = msg + ' ×' + toastMerge.n; }
      toastMerge.at = now;
      return;
    }
    var d = document.createElement('div');
    d.textContent = msg;
    d.className = 'lg-' + toastKind(msg);
    log.insertBefore(d, log.firstChild);
    while (log.children.length > 4) log.removeChild(log.lastChild);
    toastMerge = { key: fam, base: fam ? null : msg, n: 1, el: d, at: now };
  }
  // Chống lùi giờ bằng đồng hồ đơn điệu (anticheat.js lớp e): các cổng theo
  // giờ thật (phiên bí cảnh/đấu giá/thú triều, hồi sinh boss, vết nứt,
  // bảng mùa) đi qua hàm này thay vì Date.now() trần — giờ hệ thống lùi
  // bất thường thì giữ mốc lớn nhất đã thấy trong save. Chưa nạp được
  // module chống hack thì dùng giờ thật như cũ.
  function gameNow() {
    return (AC && flags) ? AC.clockNow(flags) : Date.now();
  }
  function saveGame() {
    if (!currentAccount || !ch) return;
    ch.px = Math.round(px); ch.py = Math.round(py);
    ch.mapId = curMapId;
    if (px > 0 || py > 0) { ch.x = Math.floor(px / TILE); ch.y = Math.floor(py / TILE); }
    try {
      if (AC) {
        // Chống hack lớp a+b: ký toàn vẹn bản save + vòng 3 snapshot
        // hợp lệ gần nhất trước khi ghi đè.
        var env = AC.seal(currentAccount, { character: ch, quests: qs, flags: flags });
        if (env) { AC.writeSave(localStorage, currentAccount, env); return; }
      }
      localStorage.setItem(SAVE_PREFIX + currentAccount, L.serialize(currentAccount, ch, qs, flags));
    } catch (e) {}
  }
  // MIGRATION BỐ CỤC V10 (lệnh Bui 12:33 2026-10-30): 14 map thế giới
  // chính mở rộng +24x+16 ô, toàn bộ nội dung dịch (+12,+8). Save ghi
  // trước V10 chưa có cờ flags.layoutV: nếu nhân vật đang ở map thế
  // giới (hoặc mapId trống/lạ — game tự rơi về map1) thì dịch tọa độ ô
  // (x, y) và điểm ảnh (px, py) đúng 1 lần rồi đóng cờ; đang ở map
  // instance (bí cảnh / động phủ / đấu trường — có mặt trong M.MAPS
  // nhưng không khớp mẫu map1..map14) thì giữ nguyên. Nhân vật tạo sau
  // V10 được đóng cờ ngay lúc tạo nên không bao giờ bị dịch oan, và cờ
  // đã đóng thì nạp lại bao nhiêu lần cũng không dịch lặp.
  function migrateLayoutV10(data) {
    if (!data || !data.character) return;
    var fl = data.flags || (data.flags = {});
    var v = (M && M.EXP_LAYOUT_V) || 3;
    if (fl.layoutV === v) return;
    var c = data.character;
    var mid = c.mapId || '';
    var isWorld = /^map([1-9]|1[0-4])$/.test(mid) || !mid || !(M && M.MAPS && M.MAPS[mid]);
    if (isWorld) {
      var fromV = fl.layoutV || 1;
      function sh(dx, dy) {
        if (typeof c.x === 'number') c.x += dx;
        if (typeof c.y === 'number') c.y += dy;
        if (typeof c.px === 'number') c.px += dx * TILE;
        if (typeof c.py === 'number') c.py += dy * TILE;
      }
      // V1 -> V2: ca 14 map the gioi dich (+12,+8) nhu cu.
      if (fromV < 2) sh((M && M.EXP_DX) || 12, (M && M.EXP_DY) || 8);
      // V2 -> V3 (mo rong map 1 gap 5, lenh Bui 22:12 2026-10-30): CHI
      // nhan vat dang o map 1 (hoac mapId trong/la - game roi ve map 1)
      // dich them neo EXP_V3_MAP1 (+12,+30); map the gioi khac giu nguyen.
      if (fromV < 3 && (mid === 'map1' || !mid || !(M && M.MAPS && M.MAPS[mid]))) {
        var s3 = (M && M.EXP_V3_MAP1) || { dx: 12, dy: 30 };
        sh(s3.dx, s3.dy);
      }
      // V3 -> V4 (mo rong map 2 gap 10 dien tich, lenh Bui 22:53
      // 2026-10-30): CHI nhan vat dang o map 2 dich them neo
      // EXP_V4_MAP2 (+36,+16); map the gioi khac giu nguyen.
      if (fromV < 4 && mid === 'map2') {
        var s4 = (M && M.EXP_V4_MAP2) || { dx: 36, dy: 16 };
        sh(s4.dx, s4.dy);
      }
      // V4 -> V5 (mở rộng map 3-14 gấp 10 diện tích gốc, lệnh Bui
      // 23:04 2026-10-30): neo RIÊNG của từng map nằm trong
      // M.EXP_V5_ANCHORS (js/maps.js, gom từ EXP_V5_MAP3..MAP14 của
      // các gói V5); nhân vật đang ở map nào thì dịch đúng neo của map
      // đó, map 1/2 và map instance giữ nguyên. Nấc này chạy cho mọi
      // save có fromV < 5 bất kể map (kể cả map không có neo) để cờ
      // được đóng 5 đồng nhất ở cuối hàm.
      if (fromV < 5) {
        var anch5 = (M && M.EXP_V5_ANCHORS) || {};
        if (anch5[mid]) sh(anch5[mid].dx, anch5[mid].dy);
      }
      // V5 -> V7 (mở rộng cả 14 map thế giới x1,5, lệnh Bui 18:18
      // 2026-10-31; nấc này do đợt tích hợp A bổ sung 01/11/2026, đồng
      // thời với việc maps.js nâng EXP_LAYOUT_V lên 7 qua tái nướng):
      // nhân vật đang ở map thế giới nào thì dịch đúng neo
      // EXP_V7_ANCHORS của map đó; mapId trống/lạ (game tự rơi về
      // map 1) dịch theo neo map 1 như nấc V3.
      if (fromV < 7) {
        var anch7 = (M && M.EXP_V7_ANCHORS) || {};
        var a7 = anch7[mid] || ((mid === 'map1' || !mid || !(M && M.MAPS && M.MAPS[mid])) ? anch7.map1 : null);
        if (a7) sh(a7.dx, a7.dy);
      }
    }
    fl.layoutV = v;
  }
  function loadSave(username) {
    try {
      if (AC) {
        var res = AC.readSave(localStorage, username);
        if (res.status === 'empty') return null;
        if (res.status === 'lost') {
          // Save chính hỏng và không còn snapshot hợp lệ: KHÔNG xoá
          // thêm gì — đối xử như chưa có nhân vật, người chơi tạo mới.
          pendingAhackNotice = 'Bản lưu của bạn đã hỏng và không còn bản dự phòng hợp lệ. Rất tiếc, hãy tạo nhân vật mới — hệ thống chống hack đã ghi nhận sự cố này.';
          return null;
        }
        var data = L.deserialize(res.raw);
        if (!data || !data.character) return null;
        data.flags = data.flags || {};
        // Lớp c: kiểm hợp lệ theo dữ liệu game thật (item lạ, tầng
        // vượt mốc nhiệm vụ, LT/tu vi ngoài trần...) — sửa + ghi log.
        AC.validateSave(data);
        migrateLayoutV10(data);
        if (res.status === 'restored') {
          pendingAhackNotice = 'Phát hiện bản lưu bị thay đổi/hỏng — đã khôi phục từ bản dự phòng gần nhất. Nhân vật của bạn vẫn an toàn.';
        }
        return data;
      }
      var raw = localStorage.getItem(SAVE_PREFIX + username);
      if (!raw) return null;
      var data2 = L.deserialize(raw);
      if (data2) migrateLayoutV10(data2);
      return data2 && data2.character ? data2 : null;
    } catch (e) { return null; }
  }
  // V10 (lệnh Bui 12:33 2026-10-30): tỉ lệ cỡ vẽ LƯỚI (mức Thấp) theo
  // hạng quái — đồng bộ với dispW mới trong js/monster-ai.js. Lưới gốc
  // 32 ô x hệ số 3 = 96px (Sơn Quân 48 ô = 144px); nhân hệ số này để
  // hạng nhỏ/trung/lớn/Sơn Quân hiện đúng 72/84/96/150px như đường AI.
  var MON_GRID_SCALE = { ga_rung: 0.75, tho_hoang: 0.75, soi_con: 0.875, ran_luc: 0.875, khi_mat_do: 0.875, son_quan: 150 / 144 };
  // Luật lang thang (QA nhiều lượt: quái đứng phủ ô cổng Nam Môn,
  // ô cổng map 4/6/9/12/14, ô lính gác): quái thường KHÔNG được chọn
  // đích lang thang rơi vào ô cổng, ô NPC, ô biển chỉ đường, điểm bắt
  // đầu hay ĐIỂM RƠI của cổng từ map khác tới (người chơi đáp xuống
  // không bị quái đứng sẵn chờ đánh). Tập ô cấm dựng 1 lần cho mỗi map
  // rồi cache; chỉ áp cho nhánh lang thang thường — quái thú triều
  // (phá cổng) và quái hộ tống giữ hành vi riêng của chúng.
  var _wanderBanCache = {};
  function wanderBanned(mapId, x, y) {
    var set = _wanderBanCache[mapId];
    if (!set) {
      set = {};
      var all = (M && M.MAPS) || {};
      var mpB = all[mapId];
      if (mpB) {
        (mpB.portals || []).forEach(function (p) { set[p.x + ',' + p.y] = 1; });
        (mpB.npcs || []).forEach(function (n) { set[n.x + ',' + n.y] = 1; });
        (mpB.props || []).forEach(function (pr) { if (pr && pr.sprite === 'sign') set[pr.x + ',' + pr.y] = 1; });
        if (mpB.start) set[mpB.start.x + ',' + mpB.start.y] = 1;
        Object.keys(all).forEach(function (id2) {
          (all[id2].portals || []).forEach(function (p2) { if (p2.to === mapId) set[p2.tx + ',' + p2.ty] = 1; });
        });
      }
      _wanderBanCache[mapId] = set;
    }
    return !!set[x + ',' + y];
  }
  function makeMonster(type, x, y, extra) {
    var mm = L.newMonster(type, x, y);
    mm.sx = x; mm.sy = y; mm.tx = x; mm.ty = y; mm.moveT = 0; mm.respawnAt = 0;
    mm.animT = Math.random() * 2; mm.face = 'right'; mm.faceV = 'front'; mm.faceAxis = 'h'; mm.vx = 0; mm.vy = 0; mm.svx = 0; mm.svy = 0;
    mm.hitT = 0; mm.atkT = 0; mm.deadT = 0; mm.dying = false;
    if (extra) Object.keys(extra).forEach(function (k) { mm[k] = extra[k]; });
    // extra.linhThach (boss bí cảnh/encounter do secret-realms co giãn) là
    // ghi đè PHẲNG cho Linh Thạch rơi — giữ ở ltFlat để đường thưởng dùng
    // thay cho bảng lăn theo loài (docs/economy.md).
    if (extra && typeof extra.linhThach === 'number') mm.ltFlat = extra.linhThach;
    // Quái TINH ANH (artifacts.js định nghĩa): chỉ quái hoang dã thường mới
    // lăn tỉ lệ — quái sự kiện/boss (có extra) không bao giờ thành tinh anh.
    // Tỉ lệ tinh anh theo map (trường eliteChance trong maps.js — chuỗi
    // Đại Sơn càng sâu càng cao); map không khai thì dùng tỉ lệ gốc.
    var eliteCh = (M && M.MAPS && M.MAPS[curMapId] && M.MAPS[curMapId].eliteChance != null) ? M.MAPS[curMapId].eliteChance : (ART ? ART.ELITE_CHANCE : 0);
    // THỦY TRIỀU THEO MÙA (js/season-tide.js): Tiết Thú Dữ tinh anh
    // xuất hiện nhiều hơn (×1,5, trần 0,5) — quái sự kiện/boss không lăn.
    if (TD) eliteCh = Math.min(0.5, eliteCh * TD.eliteMult(new Date(gameNow())));
    if (ART && !extra && ART.ELITE_TYPES.indexOf(type) >= 0 && Math.random() < eliteCh) {
      mm.elite = true;
      mm.maxHp = Math.round(mm.maxHp * ART.ELITE_HP_MULT); mm.hp = mm.maxHp; mm.eliteHp = mm.maxHp;
      mm.atk += ART.ELITE_ATK_ADD; // Linh Thạch tinh anh ×5 áp ở đường thưởng theo cờ elite (docs/economy.md)
      mm.name = 'Tinh Anh ' + mm.name;
    }
    // CÂN BẰNG CHẶNG CAO (mục 28): quái HOANG DÃ (không extra: không phải
    // boss/sự kiện/bí cảnh) ở map realmRank >= 2 nhân chỉ số theo thang
    // của js/high-balance.js; tinh anh nhân trên nền đã nhân tinh anh.
    if (HB && !extra) {
      var sc = HB.scaleStats({ hp: mm.maxHp, atk: mm.atk }, curMapId, M);
      mm.maxHp = sc.maxHp; mm.hp = sc.maxHp; mm.atk = sc.atk;
      if (mm.elite) mm.eliteHp = mm.maxHp;
    }
    // Chỉ số đã chốt lúc spawn — đường hồi sinh dùng lại, không rơi về
    // chỉ số gốc của loài (kẻo quái chặng cao hồi sinh thành quái yếu).
    mm.baseMaxHp = mm.maxHp;
    return mm;
  }
  // Boss THẾ GIỚI (bosses.js): instance dựng từ định nghĩa boss — chỉ số/tên/
  // tỉ lệ phóng ghi đè lên loài gốc, sào huyệt = điểm spawn (sx/sy) để cơ chế
  // lang thang + tự quay về dùng chung. noRespawn: hồi sinh do lịch giờ thật
  // của bosses.js lo, không dùng respawn 10 giây của quái thường.
  function makeWorldBoss(def) {
    var lp = BOS ? BOS.lairOf(def) : def.lair; // sào map 4 đọc động từ MAP.bossLairs
    var mm = makeMonster(def.type, lp.x, lp.y, { boss: true, noRespawn: true, worldBoss: def.id });
    mm.name = def.name;
    mm.maxHp = def.hp; mm.hp = def.hp;
    mm.atk = def.atk; mm.linhThach = def.linhThach;
    mm.scale = def.scale || 1;
    return mm;
  }
  function loadMapEntities() {
    var mp = curMap();
    monsters = mp.monsters.map(function (m) { return makeMonster(m.type, m.x, m.y); });
    // Boss Sơn Quân: chỉ xuất hiện ở sào huyệt map 2 khi q_chinh_7 đang làm.
    if (mp.id === 'map2' && mp.bossSpawn && L.bossShouldSpawn(qs)) {
      monsters.push(makeMonster('son_quan', mp.bossSpawn.x, mp.bossSpawn.y, { boss: true, noRespawn: true }));
    }
    // Bí cảnh: map instance — module bí cảnh bổ sung boss định kỳ / quái gác
    // kỳ ngộ theo run đang chạy (không có run thì map trống như thường).
    if (SR && SR.isRealmMap(mp.id)) {
      SR.entrySpawns(flags, mp.id, { tier: ch ? (ch.tier || 0) : 0, rank: (SR.rankOf && ch) ? SR.rankOf(ch) : 0 }).forEach(function (sp) {
        monsters.push(makeMonster(sp.type, sp.x, sp.y, sp.extra));
      });
      // VẾT NỨT HƯ KHÔNG: lượt vào qua vết nứt thì toàn cảnh bị đè thêm
      // một bậc sức ép (scale theo tầng/rank + hệ số sự kiện) — áp cho
      // cả quái thường của map instance lẫn boss canh giữ (rift-events).
      if (RIFT) RIFT.applyRunScaling(monsters, flags, ch);
    }
    // Boss THẾ GIỚI: spawn các boss đang sống theo lịch giờ thật của
    // bosses.js (Sơn Quân chỉ vào chế độ này sau khi trả nhiệm vụ chương 7;
    // boss chờ map 4 bị stateOf chặn ở mode 'pending').
    if (BOS) {
      BOS.list().forEach(function (def) {
        if (def.mapId !== mp.id) return;
        var bst = BOS.stateOf(def, flags, qs, Date.now());
        if (bst.mode === 'world' && bst.available) monsters.push(makeWorldBoss(def));
      });
    }
    // SỰ KIỆN NGẪU NHIÊN (js/world-events.js): vương thú đang lang
    // thang ở đúng map này + NPC tạm thương nhân — dựng lại mỗi lần
    // nạp map (vào map giữa sự kiện / nạp save giữa sự kiện).
    syncWevKing();
    syncWevMerchant(true);
    herbs = mp.herbs.map(function (h) { return { x: h.x, y: h.y, item: h.item || 'thao_duoc', taken: false, respawnAt: 0 }; });
    // PROP SỐNG (ATLAS LAB): dựng runtime prop của map + áp trạng thái
    // đã thu từ save (flags.propCut), dọn prop tới giờ mọc lại.
    if (PROPS) PROPS.enterMap(curMapId, flags, Date.now());
    // Điểm linh dược bổ sung của hệ luyện đan (theo zone, js/alchemy.js).
    if (ALCH) ALCH.spotsFor(mp.id).forEach(function (s) { herbs.push({ x: s.x, y: s.y, item: s.item, taken: false, respawnAt: 0 }); });
    // Thiên tài địa bảo ngẫu nhiên của lượt bí cảnh (module lăn khi bắt
    // đầu run, lưu trong run.treasures): thành node hái có cờ treasure.
    if (SR && SR.treasuresFor) {
      SR.treasuresFor(flags).forEach(function (t) {
        herbs.push({ x: t.x, y: t.y, item: t.item, taken: !!t.taken, respawnAt: 0, treasure: true });
      });
    }
    // Chữa save cũ: đã nhận q_chinh_5 (đường tự nhận từng bỏ qua bước
    // bật cờ) mà sự kiện chưa từng chạy -> bật lại từ đợt 1 để nhiệm
    // vụ không kẹt vĩnh viễn (kiểm chứng live 21:43 30/10).
    if (mp.id === 'map1' && qs.accepted && qs.accepted.q_chinh_5 && !qs.accepted.q_chinh_5.done && !(flags.event && (flags.event.active || flags.event.done))) L.startBeastEvent(flags);
    // Sự kiện thú dữ đang chạy dở (tải save giữa chừng): dựng lại đợt hiện tại.
    if (mp.id === 'map1' && flags.event && flags.event.active && !flags.event.done) spawnEventWave();
    // THÚ TRIỀU: lượt thủ thành đang chạy dở (tải save / quay lại map 1):
    // dựng lại đợt hiện tại + hàng đệ tử đồng minh theo trạng thái đã lưu.
    if (mp.id === 'map1' && BT && flags.tide && flags.tide.run) respawnTideBattle();
    // HỘ TỐNG: lượt đang chạy dở mà xe ở đúng map này + đang bị phục
    // kích thì dựng lại đợt phục kích (quái phục kích chỉ sống ở map
    // của xe; đổi map là quái cũ bị dọn theo loadMapEntities).
    if (ESC && flags.escort && flags.escort.run && flags.escort.run.mapId === mp.id && flags.escort.run.ambush && !monsters.some(function (m) { return m.escort; })) {
      // Dựng lại đúng số quái còn lại của đợt (không reset đợt về
      // đủ quân như lượt mới) — số đã hạ vẫn được tính.
      var eplan = ESC.ambushPlan(flags);
      if (eplan) { eplan.spawns = eplan.spawns.slice(0, flags.escort.run.ambush.remaining); spawnEscortAmbush(eplan); }
    }
    maybeFestBanner();
    pruneSheetCaches();
  }
  // QA (g) 14:01 30/10 — MỤC 34 HÀNG CHỜ: XẢ CACHE SHEET THEO MAP.
  // loadMapEntities() vừa dựng xong quái của map mới nên đây là điểm
  // xả duy nhất: _monSheets chỉ giữ loài đang có mặt (kể cả sheet
  // thiết kế boss_<id>/alias của boss thế giới, vì draw() chọn sheet
  // theo aiType chứ không phải m.type), _petSheets chỉ giữ loài thú
  // đang xuất chiến theo người chơi qua mọi map. _heroSheets KHÔNG
  // xả: nhân vật theo người chơi mọi map. _npcSheets cũng không xả
  // (ngoài phạm vi mục 34; NPC sơn môn/map kề vẫn cần khi quay lại).
  // Chỉ xóa mục cache — loader nạp lười (getMonsterSheet/getPetSheet)
  // tạo lại ngay khi cần nên không đổi logic chiến đấu hay hình vẽ.
  function pruneSheetCaches() {
    var keepMon = {}, keepPet = {};
    monsters.forEach(function (m) {
      if (m.type) keepMon[m.type] = true;
      if (m.worldBoss) {
        keepMon['boss_' + m.worldBoss] = true;
        var al34 = { thiet_bi_vuong: 'boss_thiet_bi', co_mang_vuong: 'boss_co_mang', thiet_bi_ma_vuong: 'boss_thiet_bi_ma' }[m.worldBoss];
        if (al34) keepMon[al34] = true;
      }
    });
    var ap34 = activePetInst();
    if (ap34 && ap34.sp) keepPet[ap34.sp] = true;
    Object.keys(_monSheets).forEach(function (ck) { if (!keepMon[ck.split('/')[1]]) delete _monSheets[ck]; });
    Object.keys(_petSheets).forEach(function (ck) { if (!keepPet[ck.split('/')[1]]) delete _petSheets[ck]; });
  }
  // Banner LỄ HỘI (js/wardrobe.js): vào làng trong cửa sổ lễ thì báo một
  // lần/phiên cho mỗi lễ — panel Tủ Đồ + NPC Dì Tư giữ phần việc lễ.
  var festBannerKey = null;
  var festBannerUntil = 0; // mốc hết cửa sổ hiện banner lễ (cho cơ chế strip dùng chung)
  function maybeFestBanner() {
    if (!WD || curMapId !== 'map1') return;
    var act = WD.festivalAt(Date.now());
    var b = $('festBanner');
    if (!b) return;
    if (!act) { b.style.display = 'none'; return; }
    var key = act.fest.id + ':' + act.year;
    if (festBannerKey === key) return;
    festBannerKey = key;
    festBannerUntil = Date.now() + 9000;
    setStripText(b, 'LỄ HỘI: ' + act.fest.name + ' đang diễn ra ở làng Thanh Khê (' +
      WD.fmtDay(act.start) + ' – ' + WD.fmtDay(act.end - 86400000) + ')! Gặp Dì Tư ở sân làng để nhận việc lễ và đổi pháp bảo lễ giới hạn.');
    b.style.display = stripWanted('festBanner') ? 'block' : 'none';
    setTimeout(function () { b.style.display = 'none'; }, 9000);
  }
  function startGame() {
    // Vào thế giới là nhả tiêu điểm khỏi form đăng nhập / nút vừa
    // bấm — không thì phím di chuyển bị ô nhập giữ mất cho tới khi
    // người chơi bấm xuống mặt đất (playtest live 01/11/2026).
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    loadGfx();
    loadSnd();
    loadHudPref();
    var qtEl = $('questTracker');
    if (qtEl) qtEl.style.display = 'block'; // thẻ theo dõi mục tiêu (20:22) — hiện khi vào thế giới
    if (MM) MM.markVisited(flags, curMapId); // minimap: map vào game đã tính là đã tới
    if (pendingAhackNotice) { // chống hack: chỉ thông báo khi THẬT SỰ khôi phục/mất save (không popup dồn dập)
      var acNotice = pendingAhackNotice; pendingAhackNotice = null;
      setTimeout(function () { toast(acNotice); }, 800);
    }
    if (L.syncTier) L.syncTier(ch); // save cũ tầng 3 (trần cũ tuViMax 999): khớp thang Luyện Khí 1-9 mới
    if (W) W.ensureWeapons(ch); // save cũ chưa có vũ khí: tặng + đeo sẵn Kiếm Gỗ Đào
    if (ART) { ART.ensureArtifacts(ch); initArtBar(); } // save cũ: thêm 2 ô pháp bảo trống
    if (SR) SR.ensure(flags); // save cũ: khởi tạo trạng thái bí cảnh (lượt vào/cooldown/run)
    if (RIFT) RIFT.ensure(flags); // sự kiện Vết Nứt Hư Không: trạng thái chu kỳ/lượt/khóa (js/rift-events.js)
    if (DP) {
      DP.registerMaps(M); DP.ensure(flags);
      // INSTANCE ĐỘNG PHỦ theo nhân vật: đóng dấu chủ nhân (tài khoản +
      // tên nhân vật) — trạng thái phủ nạp từ save của đúng nhân vật
      // này, đổi tài khoản/nhân vật trên cùng máy không lẫn chéo.
      DP.stampOwner(flags, DP.ownerKeyOf(currentAccount, ch));
      // Đã bái sư mà chưa có phủ (save cũ) -> tông cấp bổ sung ngay lúc
      // vào game: báo trao Lệnh Bài Động Phủ đúng 1 lần.
      var dpGrant = DP.takeGrantNotice(flags);
      if (dpGrant) setTimeout(function () {
        var sd = (typeof window !== 'undefined' && window.PNT_SECTS) ? window.PNT_SECTS.sectById(dpGrant.sectId) : null;
        toast((sd ? sd.repName + ' của ' + sd.name : 'Tông môn') + ' trao bạn Lệnh Bài Động Phủ — động phủ riêng của bạn nằm sau cửa đá ở giếng cổ Thanh Khê, mang ấn ' + (sd ? sd.sigil : 'tông môn') + '.');
      }, 1200);
    }
    if (TOURN) TOURN.ensure(flags); // save cũ: khởi tạo trạng thái Đại Hội (flags.tourn)
    if (BT) BT.ensure(flags); // save cũ: khởi tạo trạng thái Thú Triều (flags.tide + flags.beastTideMerit)
    if (ESC) ESC.ensure(flags); // save cũ: khởi tạo trạng thái Hộ Tống Thương Đội (flags.escort)
    if (AUC) AUC.ensure(flags); // save cũ: khởi tạo trạng thái Đấu Giá Liên Tông (flags.auction)
    if (BOS) BOS.ensureState(flags); // save cũ: khởi tạo mốc chết boss thế giới (flags.bossKills)
    if (PETS) { PETS.ensurePets(ch); syncPetEnt(true); } // save cũ chưa có thú: chuồng rỗng
    if (COMP) { COMP.ensure(flags); syncCompEnt(true); } // save cũ chưa có đồng hành: chưa chiêu mộ
    if (AFF) { AFF.ensure(flags); } // save cũ chưa có hảo cảm: khởi tạo lười
    if (OG) {
      // QA 18:16 30/10: save cũ được trao bù dấu ấn thì phải BÁO +
      // có tiếng nhặt đồ — trước đây ensure() trao lặng lẽ vào túi,
      // người chơi không hề biết túi mình vừa có thêm vật cốt truyện.
      var hadTok = OG.hasToken(ch);
      OG.ensure(ch, flags);
      if (!hadTok && OG.hasToken(ch)) {
        var tokDef = L.ITEMS[OG.tokenOf(ch)];
        toast('Nhận được vật dấu ấn nguồn gốc: ' + (tokDef ? tokDef.name : OG.tokenOf(ch)) + ' — vật của nhà, giữ trong túi làm kỷ niệm.');
        if (SND) SND.sfx('pickup');
      }
    } // save cũ chưa có nguồn gốc: suy storyOrigin + trao bù dấu ấn
    var sbSeasonBefore = (SB && flags.seasonBoard && flags.seasonBoard.season) || null; // lượt âm thanh 31/10: nhớ mùa TRƯỚC ensure để biết có vừa sang mùa không (dòng ensure dưới giữ nguyên văn vì test SB khóa chuỗi nối dây)
    if (SB) SB.ensure(flags, Date.now()); // save cũ: khởi tạo Bảng Mùa (flags.seasonBoard), sang quý mới thì lưu mùa cũ vào lịch sử — giữ Date.now() trần: test SB khóa chuỗi nối dây này; các đường CÓ THƯỞNG của SB (claim/note*) đều qua gameNow() chống lùi giờ
    if (SB && sbSeasonBefore && SB.seasonKeyOf && sbSeasonBefore !== SB.seasonKeyOf(Date.now())) {
      // Sang quý mới trong lúc người chơi vắng mặt: trước đây Bảng Mùa
      // lặng lẽ reset — nay báo + có tiếng chuông đổi mùa.
      toast('Đã sang ' + (SB.seasonNameOf ? SB.seasonNameOf(SB.seasonKeyOf(Date.now())) : 'mùa mới') + ' — Bảng Mùa bắt đầu lại từ 0 điểm.');
      if (SND) SND.sfx('season_change');
    }
    if (BX) BX.ensure(flags); // save cũ: khởi tạo Thiên Cơ Đồ Giám (flags.bestiary)
    if (LG) LG.ensure(flags); // save cũ: khởi tạo Bia Truyền Kỳ (flags.legendBoard)
    if (ALCH) { ALCH.ensureAlchemy(ch); ALCH.syncSectRecipes(ch, qs, flags); } // save cũ: thêm ch.alchemy + đồng bộ phương Đan Hà đã đạt
    if (FLIGHT) FLIGHT.ensure(flags); // save cũ: thêm flags.flight (kiếm đã đúc linh)
    if (SECTP) { SECTP.ensure(ch); SECTP.bind(ch, flags); } // save cũ: thêm ch.congHien (0 điểm) + bind API PNT_SECT cho các hệ khác
    if (WD) { WD.ensure(ch); WD.syncRewards(ch, flags); } // save cũ: thêm ch.wardrobe (tủ đồ rỗng) + rà thưởng y phục Đại Hội đã đạt
    // NGỰ KIẾM: trạng thái bay không lưu — nạp game luôn bắt đầu trên mặt đất.
    flying = false; flyLift = 0; flyTrial = null;
    // MỤC 27: khôi phục kiểu bay đã chọn (mặc định ngự kiếm; giá trị lạ
    // từ save cũ thì rơi về ngự kiếm, không bao giờ bay ở chế độ không có).
    flyMode = (FLIGHT2 && FLIGHT2.validMode(flags.flyMode)) ? flags.flyMode : 'sword';
    refreshFlyButton(); refreshFlyModeButton();
    curMapId = (ch.mapId && M.MAPS && M.MAPS[ch.mapId]) ? ch.mapId : 'map1';
    prefetchBgAround(curMapId); // QA (g) 01:15 31/10: nạp nền SAU khi lấy map từ save — trước đây nạp ở đầu startGame khi curMapId vẫn là 'map1' mặc định, nên người chơi quay lại map khác làng cả phiên chỉ thấy vẽ tile, không thấy tranh nền (xem player-qa.md).
    if (SND) SND.setMap(curMapId);
    px = ch.px || (ch.x * TILE + 16);
    py = ch.py || (ch.y * TILE + 28);
    dir = ch.dir || 'down';
    dir8 = dir; // DIR8: khởi tạo hướng hiển thị theo hướng đã lưu
    pvx = 0; pvy = 0; action = null; deathPending = false; medPoseT = 0; dusts = [];
    snapCamera();
    if (SK) {
      SK.ensureState(ch); // save cũ chưa có ll/cd: khởi tạo, không phá dữ liệu cũ
      initSkillBar();
      seedSeenSkills();
    }
    loadMapEntities();
    showScreen('screen-game');
    updateHUD();
    if (!loopStarted) { loopStarted = true; requestAnimationFrame(loop); }
  }
  // ---------- KHUNG MULTIPLAYER (js/net.js) — cờ 'pnt-online' ----------
  // MẶC ĐỊNH TẮT: không đặt cờ (hoặc thiếu module) thì netSession luôn null
  // và mọi điểm nối là no-op — game chơi đơn y hệt trước. Bật 'sim' mới có
  // người chơi mô phỏng cùng map (offline). Kiến trúc: docs/multiplayer-design.md.
  var netSession = null, netPanelEl = null, netPanelTxt = '';
  function netProfile() {
    return { id: 'self', name: ch ? ch.name : '', realm: ch ? ch.realm : '', gender: ch ? ch.gender : 'nam', origin: ch ? ch.origin : 'nong_dan' };
  }
  function netEnsure() {
    if (!NET || !NET.getSession) return null;
    var s = NET.getSession();
    if (s !== netSession) {
      netSession = s;
      if (netSession) {
        try { netSession.joinMap(curMapId, netProfile()); } catch (e) { netSession = null; }
      }
      netPanelTxt = '';
    }
    return netSession;
  }
  function netTick(dt) {
    var s = netEnsure();
    if (!s || !ch) { netPanelSync(0); return; }
    s.setSelf({ x: px, y: py, dir: dir, moving: moving });
    s.update(dt);
    netPanelSync(s.peerCount());
  }
  function netPanelSync(n) {
    if (!netSession) {
      if (netPanelEl) netPanelEl.style.display = 'none';
      return;
    }
    if (typeof document === 'undefined' || !document.createElement || !document.body) return;
    if (!netPanelEl) {
      netPanelEl = document.createElement('div');
      netPanelEl.id = 'onlinePanel';
      netPanelEl.style.cssText = 'position:fixed;top:10px;right:10px;z-index:60;background:rgba(20,26,20,.82);color:#dff5d8;border:1px solid #5a7d4f;border-radius:8px;padding:5px 10px;font:12px sans-serif;pointer-events:none;';
      document.body.appendChild(netPanelEl);
    }
    var txt = (n + 1) + ' người cùng map · ' + curMap().name + (NET && NET.mode() === 'sim' ? ' · mô phỏng offline' : '');
    if (txt !== netPanelTxt) { netPanelTxt = txt; netPanelEl.textContent = txt; }
    netPanelEl.style.display = 'block';
  }
  function switchMap(toId, tx, ty) {
    curMapId = toId;
    if (MM) MM.markVisited(flags, toId); // minimap: ghi dấu map đã tới (mục 25)
    prefetchBgAround(toId); // nền nạp lười theo map (hàng chờ 33)
    mapEntry = { mapId: toId, tx: tx, ty: ty };
    if (netSession) { try { netSession.joinMap(toId, netProfile()); } catch (e) {} netPanelTxt = ''; }
    px = tx * TILE + 16; py = ty * TILE + 28;
    moveTarget = null; movePath = null;
    pvx = 0; pvy = 0; action = null;
    snapCamera();
    portalCooldown = 0.5;
    // NGỰ KIẾM: qua cổng = tự hạ cánh (cổng chỉ kích hoạt khi đi bộ trên
    // đất — xem lời gọi checkPortal trong loop); bài bay thử dở cũng hủy
    // (bài thử chỉ tồn tại khi đang ở map 3, đổi map tức là đã rời trấn).
    if (flyTrial) { flyTrial = null; toast('Bài bay thử bị hủy vì rời trấn trên mây.'); }
    flying = false; flyLift = 0;
    // ĐẠI HỘI: đang đấu trên Võ Đài Đại Hội mà chuyển map rời đài =
    // bỏ cuộc (trận 'live' chỉ tồn tại ở map_dai_hoi, nên đổi map là
    // rời võ đài). Chuyển cảnh VÀO đài lúc phase 'await' (startTournMatch)
    // và về quảng trường sau khi trận đã chốt (phase khác 'live') thì
    // không kích hoạt hook này.
    if (TOURN) {
      var tstS = TOURN.ensure(flags);
      if (tstS && tstS.run && tstS.run.phase === 'live') {
        onTournMatchEnd(TOURN.forfeit(flags, ch.name), null);
        toast('Rời võ đài giữa trận — tính là bỏ cuộc.');
      }
    }
    loadMapEntities();
    if (PETS) { if (toId === 'map1') PETS.restAtVillage(ch); syncPetEnt(true); } // về làng: thú gục hồi 50%, thú sống hồi đầy
    if (COMP) { if (toId === 'map1') COMP.restAtVillage(flags, ch); syncCompEnt(true); } // về làng: đồng hành cùng luật hồi phục
    toast('Đã tới: ' + curMap().name);
    // QA32 (muc 32 hang cho): HUD phai doi ten map NGAY khi doi map,
    // khong cho nhip tick 0,12s sau moi cap nhat (truoc day switchMap
    // khong goi updateHUD, ten map cu van hien toi nhip tick ke).
    updateHUD();
    if (SND) { SND.sfx('portal'); SND.setMap(toId); }
    saveGame();
  }
  // ================= NGỰ KIẾM — ENGINE BAY (luật: js/flight.js) ==========
  // Va chạm bay theo CHIỀU CAO (Bui 21:48): chỉ vật CAO chặn — tường/vách
  // núi 'W', nhà 'H', đá 'o' + biên map (FLIGHT.FLY_BLOCKED). Vật THẤP bay
  // qua hết: cây 'T', suối/nước 'R', hàng rào 'F', sạp/xe 'S', đèn đá 'L',
  // giếng 'E' và mọi ô đi bộ được. Ô NPC không chặn khi bay (bay trên đầu).
  function flyBlockedTile(tx, ty) {
    var mp = curMap();
    if (tx < 0 || ty < 0 || tx >= mp.tiles[0].length || ty >= mp.tiles.length) return true; // biên map
    return !!(FLIGHT && FLIGHT.FLY_BLOCKED[mp.tiles[ty][tx]]);
  }
  // Hộp chân như collideAt nhưng theo luật bay.
  function collideFlyAt(x, y) {
    var x0 = Math.floor((x - 10) / TILE), x1 = Math.floor((x + 10) / TILE);
    var y0 = Math.floor((y - 6) / TILE), y1 = Math.floor(y / TILE);
    for (var ty = y0; ty <= y1; ty++)
      for (var tx = x0; tx <= x1; tx++)
        if (flyBlockedTile(tx, ty)) return true;
    return false;
  }
  // MỤC 27 — ngữ cảnh bay chung cho 3 chế độ (js/flight2.js): rank lấy
  // bằng thang REALMS dùng chung; pháp bảo bay được lấy từ túi đồ thật
  // (không cần đeo — cưỡi pháp bảo trong túi cũng như rút kiếm trong túi);
  // linh thú bay được lấy từ thú XUẤT CHIẾN hiện tại, không phải thú
  // nằm trong chuồng.
  function flyCtx() {
    if (!ch) return { rank: 0, swordFlight: false, flyableArtifact: null, activePetSpecies: null };
    var art = null;
    if (ART && FLIGHT2) {
      var defs = ART.artifactEntries(ch).map(function (e) { return ART.ARTIFACTS[e.id]; });
      art = FLIGHT2.findFlyableArtifact(defs);
    }
    var ap = activePetInst();
    return {
      rank: (M && M.realmRankOf) ? M.realmRankOf(ch) : 0,
      swordFlight: !!(flags && flags.swordFlight),
      flyableArtifact: art,
      activePetSpecies: (PETS && ap) ? PETS.species(ap.sp) : null
    };
  }
  function flyModeLabel() { return FLIGHT2 ? FLIGHT2.modeName(flyMode) : 'Ngự Kiếm'; }
  function setFlyMode(mode) {
    if (!FLIGHT2 || !FLIGHT2.validMode(mode)) return false;
    flyMode = mode;
    if (flags) flags.flyMode = mode;
    if (flying) landPlayer(true); // đổi kiểu giữa trời thì hạ xuống rồi bay lại bằng kiểu mới
    refreshFlyButton(); refreshFlyModeButton();
    try { saveGame(); } catch (e) {}
    return true;
  }
  function cycleFlyMode() {
    if (!FLIGHT2) return flyMode;
    var next = FLIGHT2.nextMode(flyMode, flyCtx());
    setFlyMode(next);
    toast('Kiểu bay: ' + FLIGHT2.modeName(next) + (FLIGHT2.modeUnlocked(next, flyCtx()) ? '.' : ' (chưa mở — xem điều kiện ở nút Bay).'));
    return next;
  }
  // Được phép bay khi: (a) ngự kiếm đã học (flags.swordFlight) HOẶC đang
  // trong bài bay thử Q3 (tông cho mượn phi kiếm để thử — chỉ chế độ kiếm);
  // (b) chế độ pháp bảo/linh thú đủ cổng Trúc Cơ + vật cưỡi đủ chuẩn.
  // Bay KHÔNG tốn linh lực (bay là di chuyển, không phải chiêu thức).
  function canFlyNow() {
    if (!FLIGHT || !ch) return false;
    if (flyTrial && flyMode === 'sword') return true;
    if (flyMode === 'sword') return !!flags.swordFlight;
    return FLIGHT2 ? FLIGHT2.canFlyMode(flyMode, flyCtx()) : false;
  }
  function tryTakeoff() {
    if (!FLIGHT || flying) return flying;
    if (!canFlyNow()) {
      // MỤC 27: báo đúng điều thiếu của từng chế độ (cổng Trúc Cơ chung,
      // rồi điều kiện riêng) — không để người chơi đoán vì sao nút khóa.
      if (flyMode === 'artifact' || flyMode === 'pet') {
        var rs = FLIGHT2 ? FLIGHT2.modeReason(flyMode, flyCtx()) : 'no_ctx';
        if (rs === 'not_realm') toast('Chưa Trúc Cơ nên chưa ngự được — linh lực Luyện Khí chưa đủ nâng cả vật lẫn người.');
        else if (rs === 'no_artifact') toast('Chưa có pháp khí phẩm Địa trở lên để ngự (Phi Kiếm Bảo, Ấn Trấn Sơn, Thiên La Địa Võng, Định Hải Thần Châu).');
        else if (rs === 'no_pet') toast('Chưa có linh thú bay xuất chiến (loài mountable, biết bay) để ngự.');
        else toast('Chưa mở được kiểu bay này.');
      } else {
        toast(FLIGHT.gateReason(ch, flags) === 'not_sect'
          ? 'Ngự kiếm là phép truyền của tông môn — bái sư trước đã.'
          : 'Chưa học ngự kiếm. Đạt Trúc Cơ và theo chuỗi nhiệm vụ của tông môn (Kiếm Phôi Tâm Hợp → Thử Kiếm Đài → Ngự Không Sơ Hành) mới học được.');
      }
      return false;
    }
    if (deathPending) return false;
    flying = true; moveTarget = null; movePath = null;
    if (SND) SND.sfx('fly_whoosh'); // QA 15:16 30/10: cất cánh phải có tiếng gió — trước đây bay lên im lặng tuyệt đối
    toast(flyTrial ? 'Bay thử bắt đầu — cột mốc 1: ' + FLIGHT.CHECKPOINTS[0].name + '.' : flyModeLabel() + '! Bấm F (hoặc nút Bay) để hạ xuống.');
    refreshFlyButton();
    return true;
  }
  // Hạ cánh: chỉ đáp ở ô ĐI BỘ ĐƯỢC (collideAt mặt đất). force=true (vào
  // combat / hết giờ bay thử): nếu đang lơ lửng trên ô không đáp được thì
  // trượt tới ô đất trống gần nhất trong bán kính 4 ô rồi hạ.
  function landPlayer(force) {
    if (!flying) return true;
    if (!collideAt(px, py)) { flying = false; if (SND) SND.sfx('fly_whoosh'); refreshFlyButton(); return true; }
    if (!force) { toast('Dưới chân không phải đất trống — bay tới bãi đất trống rồi mới hạ được.'); return false; }
    var pt = playerTile();
    for (var r = 1; r <= 4; r++) {
      for (var oy = -r; oy <= r; oy++) for (var ox = -r; ox <= r; ox++) {
        if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
        var cx = (pt.x + ox) * TILE + 16, cy = (pt.y + oy) * TILE + 28;
        if (!collideAt(cx, cy)) { px = cx; py = cy; pvx = 0; pvy = 0; moveTarget = null; movePath = null; flying = false; if (SND) SND.sfx('fly_whoosh'); refreshFlyButton(); return true; }
      }
    }
    return false;
  }
  function toggleFlight() {
    if (!FLIGHT) return;
    if (flying) landPlayer(false); else tryTakeoff();
    refreshFlyButton();
  }
  var flyBtnState = '';
  function refreshFlyButton() {
    var b = $('btnFly');
    if (!b) return;
    var label = flyModeLabel();
    var st = !FLIGHT ? 'off' : flying ? 'flying' : canFlyNow() ? 'ready' : 'locked';
    // MỤC 27: trạng thái nút phải tính cả kiểu bay đang chọn (không thì
    // nút ngự kiếm sáng trong khi người chơi đang chọn kiểu linh thú khóa).
    var key = flyMode + '|' + st;
    if (key === flyBtnState) return;
    flyBtnState = key;
    if (st === 'flying') { b.textContent = label + ' (F): Đang bay'; b.style.opacity = '1'; }
    else if (st === 'ready') { b.textContent = label + ' (F): Bay'; b.style.opacity = '1'; }
    else if (st === 'off') { b.textContent = label + ' (F): Khóa'; b.style.opacity = '0.55'; }
    else { b.textContent = label + ' (F): Khóa'; b.style.opacity = '0.55'; }
  }
  // MỤC 27: nút đổi kiểu bay — chỉ xoay trong các chế độ đã mở (cycleFlyMode);
  // chưa mở chế độ nào thì nút vẫn hiện chế độ hiện tại, bấm sẽ báo điều thiếu.
  function refreshFlyModeButton() {
    var b = $('btnFlyMode');
    if (!b) return;
    b.textContent = 'Kiểu bay: ' + flyModeLabel();
    b.style.opacity = (FLIGHT2 && flyCtx && FLIGHT2.unlockedModes(flyCtx()).length > 1) ? '1' : '0.7';
  }
  // --- Chuỗi nhiệm vụ ngự kiếm: hành động dùng chung thoại + hook test ---
  function acceptFlightQuest() {
    if (!FLIGHT) return { ok: false, reason: 'no_module' };
    var qid = FLIGHT.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  // --- Arc chương 13-20: nhận/trả nhiệm vụ biến thể theo tông (sect-arc.js) ---
  function acceptSectArcQuest() {
    if (!SECTARC) return { ok: false, reason: 'no_module' };
    var qid = SECTARC.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInSectArcQuest() {
    if (!SECTARC) return { ok: false, reason: 'no_module' };
    var qid = SECTARC.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    if (SND) SND.sfx('quest_complete');
    toast('Trả nhiệm vụ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.');
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // --- TÀNG KINH CÁC: nhận việc giữ sách ở thủ thư Cổ Mặc ---
  // Trả nhiệm vụ đi đường nút Trả chung (giver là thu_thu) nên ở đây
  // chỉ cần nút nhận; đường trả chung đã gọi đủ hook điểm tông.
  function acceptLibraryQuest() {
    if (!LIB) return { ok: false, reason: 'no_module' };
    var qid = LIB.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  // --- KẾT NGHĨA: nhận/trả chuỗi kết nghĩa ở đại diện tông ---
  // Trả đi đường riêng (không đi đường nút Trả chung theo giver) vì
  // giver 'sect_rep' không khớp một NPC cố định; trả xong việc 3
  // thì js/sworn.js ghi cờ kết nghĩa, cộng điểm tông + hảo cảm với
  // chính đại diện tông như mọi nhiệm vụ trả tại người giao.
  function acceptSwornQuest() {
    if (!SWN) return { ok: false, reason: 'no_module' };
    var qid = SWN.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInSwornQuest(nid) {
    if (!SWN) return { ok: false, reason: 'no_module' };
    var qid = SWN.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    if (SND) SND.sfx('quest_complete');
    toast('Trả nhiệm vụ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.');
    if (SECTP) announceSectPoints(SECTP.onQuestTurnIn(ch, flags, qid));
    if (AFF && nid) {
      var affTurn = AFF.onQuestTurnIn(flags, qid, nid);
      if (affTurn.added > 0) toast('Hảo cảm với ' + affTurn.npc.name + ' +' + affTurn.added + ' (nay ' + affTurn.points + ' điểm).');
    }
    var sw = SWN.afterTurnIn(flags, qid);
    if (sw.sworn) {
      if (SND) SND.sfx('kyngo');
      toast('LỄ KẾT NGHĨA THÀNH! Từ nay đi cùng nhau, bạn đi cùng được +2 công.');
    }
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // --- THỦY TRIỀU THEO MÙA: nhận/trả việc tiết ở NPC làng ---
  // Việc tiết không chen vào thoại nhiệm vụ thường (theo mẫu nút mời
  // đồng hành): chỉ nút nhận/trả ở hộp thoại + marker '!' của module.
  function acceptTideQuest() {
    if (!TD) return { ok: false, reason: 'no_module' };
    // QA 15:31 30/10: đang dở một việc tiết thì không nhận thêm việc
    // tiết khác — nói rõ đang dở việc nào thay vì im lặng "none".
    var actT = TD.activeQuestId(qs);
    if (actT) { toast('Bạn đang dở việc tiết "' + L.QUESTS[actT].title + '" — xong việc đó đã mới nhận việc tiết khác được.'); return { ok: false, reason: 'busy' }; }
    var qid = TD.availableQuestId(ch, flags, qs, new Date(gameNow()));
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận việc tiết: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInTideQuest(nid) {
    if (!TD) return { ok: false, reason: 'no_module' };
    var qid = TD.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_complete');
      // QA 15:46 30/10: toast trả việc phải kê cả thưởng VẬT PHẨM
      // (việc Đăng Hoa có 2 Thịt Gà cỗ hội) — trước đây chỉ kê Linh
      // Thạch + tu vi, người chơi tưởng thưởng bị nuốt.
      var itemTxtT = (r.rewards.items || []).map(function (it) { return (L.ITEMS[it.id] ? L.ITEMS[it.id].name : it.id) + ' ×' + it.n; }).join(', ');
      toast('Trả việc tiết ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi' + (itemTxtT ? ', ' + itemTxtT : '') + '.');
      if (SECTP) announceSectPoints(SECTP.onQuestTurnIn(ch, flags, qid));
      if (AFF && nid) {
        var affTurn = AFF.onQuestTurnIn(flags, qid, nid);
        if (affTurn.added > 0) toast('Hảo cảm với ' + affTurn.npc.name + ' +' + affTurn.added + ' (nay ' + affTurn.points + ' điểm).');
      }
      updateHUD(); saveGame(); renderQuestPanel();
    }
    return r;
  }
  // --- Sự kiện VẾT NỨT HƯ KHÔNG: nhận/trả nhiệm vụ arc ở đại diện tông ---
  function acceptRiftQuest() {
    if (!RIFT) return { ok: false, reason: 'no_module' };
    var qid = RIFT.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInRiftQuest() {
    if (!RIFT) return { ok: false, reason: 'no_module' };
    var qid = RIFT.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    if (SND) SND.sfx('quest_complete');
    toast('Trả nhiệm vụ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.');
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // --- THIÊN 4 ch.25-27: nhận/trả nhiệm vụ tranh linh mạch ở đại diện tông --
  // (giver 'sect_rep' không khớp một NPC cố định nên đi đường nút riêng
  // như chuỗi vết nứt / kết nghĩa, không đi đường nút Trả chung).
  function acceptThien4Quest() {
    if (!THIEN4) return { ok: false, reason: 'no_module' };
    var qid = THIEN4.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      // Phủ đã cấp 2 trở lên trước khi nhận việc 3 thì trận đã đủ mạnh:
      // tông công nhận ngay, như tiền lệ giếng cổ của q_chinh_2.
      if (qid === 'q_thien4_3' && DP) {
        var dps = DP.ensure(flags);
        var cq = THIEN4.noteCaveLevel(qs, dps ? dps.level : 1);
        if (cq.questDone) toast('Động phủ của ngươi đã cấp 2 trở lên — Tụ Linh Trận đủ mạnh, việc này coi như xong, về trả cho tông.');
      }
      // QA 16:50 30/10: nhận việc đấu giá NGOÀI giờ phiên thì phải
      // báo ngay phiên sau mở lúc mấy giờ — trước đây người chơi nhận
      // xong đi tìm phiên, không thấy đâu, tưởng game lỗi (phiên chỉ
      // mở 12:00/20:00, mỗi phiên 90 phút).
      if (qid === 'q_thien4_2' && AUC && AUC.sessionAt) {
        var sesA = AUC.sessionAt(Date.now());
        if (sesA && !sesA.active && sesA.next) toast('Phiên đấu giá chưa mở — phiên sau mở lúc ' + AUC.fmtTime(sesA.next.start) + ' (12:00 và 20:00 mỗi ngày, mỗi phiên 90 phút).');
      }
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInThien4Quest(nid) {
    if (!THIEN4) return { ok: false, reason: 'no_module' };
    var qid = THIEN4.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    if (SND) SND.sfx('quest_complete');
    toast('Trả nhiệm vụ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.');
    if (SECTP) announceSectPoints(SECTP.onQuestTurnIn(ch, flags, qid));
    if (AFF && nid) {
      var affTurn = AFF.onQuestTurnIn(flags, qid, nid);
      if (affTurn.added > 0) toast('Hảo cảm với ' + affTurn.npc.name + ' +' + affTurn.added + ' (nay ' + affTurn.points + ' điểm).');
    }
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // --- THIÊN 5 ch.28-30: nhận/trả nhiệm vụ vụ án đan độc ở đại diện tông --
  // (cùng khuôn Thiên 4: giver 'sect_rep' đi đường nút riêng).
  // THIÊN 5 ch.30 (QA 19:31 30/10): thoại hứa kẻ giữ ấn "lộ mặt / lên
  // tiếng" thì hắn phải CÓ MẶT thật trong thế giới — khi việc 3 xong,
  // một bóng người áo tối hiện ra, nói đúng một câu rồi tan biến.
  // Hình dùng sheet SẴN CÓ 'tong_doc' (áo tối của Ngũ Độc Giáo — gần
  // nhất với một ma tu trong kho hình hiện tại), KHÔNG bịa sheet mới;
  // sheet riêng cho ma tu là nợ hình đã ghi ở docs/player-qa.md.
  var thien5Fig = null;
  function showThien5Figure(mapId, tx, ty) {
    var mp5 = M.MAPS[mapId];
    if (!mp5) return;
    var fx = tx, fy = ty;
    if (fx < 0 || fy < 0 || fx >= mp5.w || fy >= mp5.h) { fx = tx - 4; fy = ty; }
    thien5Fig = { mapId: mapId, until: Date.now() + 60000,
      npc: { id: 'ke_giu_an', sprite: 'tong_doc', name: 'Kẻ giữ ấn', role: 'Ma tu giữ di chỉ dưới điểm mạch', x: fx, y: fy } };
    if (mapId === curMapId) toast('Một bóng người áo tối đứng lặng gần đó — Kẻ giữ ấn. Hắn nói khẽ: "Giữ được làng, dọn được nứt... Ấn cổ không tự chọn người hiền. Đọc được nó rồi, ngươi sẽ hiểu vì sao ta phải giữ." Nói xong, bóng người tan vào sương.');
  }
  function acceptThien5Quest() {
    if (!THIEN5) return { ok: false, reason: 'no_module' };
    var qid = THIEN5.availableQuestId(ch, flags, qs);
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận nhiệm vụ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInThien5Quest(nid) {
    if (!THIEN5) return { ok: false, reason: 'no_module' };
    var qid = THIEN5.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    if (SND) SND.sfx('quest_complete');
    toast('Trả nhiệm vụ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.');
    if (SECTP) announceSectPoints(SECTP.onQuestTurnIn(ch, flags, qid));
    if (AFF && nid) {
      var affTurn5 = AFF.onQuestTurnIn(flags, qid, nid);
      if (affTurn5.added > 0) toast('Hảo cảm với ' + affTurn5.npc.name + ' +' + affTurn5.added + ' (nay ' + affTurn5.points + ' điểm).');
    }
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // --- Chuỗi VIỆC LỄ (js/wardrobe.js): nhận/trả ở NPC lễ Dì Tư ---
  function acceptFestQuest() {
    if (!WD) return { ok: false, reason: 'no_module' };
    var qid = WD.availableFestQuestId(qs, ch, Date.now());
    if (!qid) return { ok: false, reason: 'none' };
    var r = L.acceptQuest(qs, qid);
    if (r.ok) {
      if (SND) SND.sfx('quest_accept');
      toast('Đã nhận việc lễ: ' + L.QUESTS[qid].title);
      saveGame(); renderQuestPanel();
    }
    return r;
  }
  function turnInFestQuest() {
    if (!WD) return { ok: false, reason: 'no_module' };
    var qid = WD.activeFestQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = WD.turnInFestQuest(qs, ch, qid, Date.now());
    if (!r.ok) {
      if (r.reason === 'closed') toast('Lễ đã qua — pháp bảo lễ chỉ trao trong những ngày lễ. Việc lễ dở dang giữ nguyên, chờ mùa lễ năm sau.');
      else if (r.reason === 'token') toast('Chưa đủ ' + (L.ITEMS[r.token] ? L.ITEMS[r.token].name : r.token) + ': đang có ' + r.have + '/' + r.need + '. Làm tiếp các việc lễ trước để gom vật phẩm lễ.');
      else toast('Chưa trả được việc lễ này.');
      return r;
    }
    if (SND) SND.sfx('quest_complete');
    var msg = 'Trả việc lễ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.';
    toast(msg);
    if (r.artifact) toast('Dì Tư trao bạn pháp bảo lễ giới hạn: ' + r.artifact.name + '! Mở Túi đồ để đeo (kích hoạt bằng phím 6/7 như pháp bảo thường).');
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // --- ĐIỂM CỐNG HIẾN (js/sect-points.js): thông báo cộng điểm + thăng
  // cấp đệ tử dùng chung cho mọi nguồn (nhiệm vụ tông, Đại Hội, thú triều…).
  function announceSectPoints(res) {
    if (!res || !res.added) return;
    toast('+' + res.added + ' Điểm Cống Hiến tông môn (tổng ' + res.points + ' điểm).');
    (res.rankUps || []).forEach(function (u) {
      var rw = u.reward;
      var extra = rw ? ' Thưởng thăng cấp: +' + (rw.linhThach || 0) + ' Linh Thạch' +
        (rw.items && rw.items.length ? ' + ' + rw.items.map(function (it) { return (L.ITEMS[it.id] ? L.ITEMS[it.id].name : it.id) + ' ×' + it.n; }).join(', ') : '') + '.' : '';
      if (SND) SND.sfx('kyngo');
      toast('THĂNG CẤP ĐỆ TỬ: ' + u.name + '!' + extra);
    });
  }
  function turnInFlightQuest() {
    if (!FLIGHT) return { ok: false, reason: 'no_module' };
    var qid = FLIGHT.activeQuestId(qs);
    if (!qid || !qs.accepted[qid].done) return { ok: false, reason: 'not_done' };
    var r = L.turnInQuest(qs, ch, qid);
    if (!r.ok) return r;
    if (SND) SND.sfx('quest_complete');
    toast('Trả nhiệm vụ ' + L.QUESTS[qid].title + ': +' + r.rewards.linhThach + ' Linh Thạch, +' + (r.rewards.tuVi || 0) + ' tu vi.');
    if (qid === 'q_ngu_kiem_3') {
      // Hoàn thành chuỗi: chính thức học được NGỰ KIẾM PHI HÀNH.
      flags.swordFlight = true;
      if (SND) SND.sfx('kyngo');
      toast('HỌC ĐƯỢC NGỰ KIẾM! Nút Ngự Kiếm (phím F) đã sáng — bay lên nào.');
    }
    if (SECTP) announceSectPoints(SECTP.onQuestTurnIn(ch, flags, qid));
    refreshFlyButton();
    updateHUD(); saveGame(); renderQuestPanel();
    return r;
  }
  // Q1: đúc linh kiếm phôi (flight.js kiểm + trừ phí; đây lo thông báo/lưu).
  function doFlyForge() {
    if (!FLIGHT) return { ok: false, reason: 'no_module' };
    var r = FLIGHT.applyForge(ch, flags, qs);
    if (!r.ok) {
      toast({
        no_quest: 'Chưa nhận nhiệm vụ Kiếm Phôi Tâm Hợp.',
        no_sword: 'Chưa có KIẾM phẩm Linh trở lên trong túi hoặc đang đeo.',
        no_lt: 'Chưa đủ ' + FLIGHT.FORGE.linhThach + ' Linh Thạch phí đúc linh.',
        no_herb: 'Chưa đủ ' + FLIGHT.FORGE.itemN + ' Linh Chi.'
      }[r.reason] || 'Chưa đủ điều kiện đúc linh.');
      return r;
    }
    if (SND) SND.sfx('kyngo');
    toast('Đúc linh thành công! ' + r.swordName + ' đã thành phi kiếm của bạn — kiếm vẫn nằm trong túi, không mất.');
    updateHUD(); saveGame(); renderQuestPanel();
    if (dlg) renderDlgActions();
    return r;
  }
  function duelMonster() {
    for (var i = 0; i < monsters.length; i++) if (monsters[i].duelFly) return monsters[i];
    return null;
  }
  // Q2: dựng Hình Nhân Kiếm Khí ở Bãi Luyện Công map 3 (chỉ số từ flight.js).
  function startFlyDuel() {
    if (!FLIGHT || !qs.accepted.q_ngu_kiem_2 || qs.accepted.q_ngu_kiem_2.done) return { ok: false, reason: 'no_quest' };
    if (curMapId !== FLIGHT.DUEL.mapId) { toast('Hình Nhân Kiếm Khí chỉ dựng ở trấn trên mây.'); return { ok: false, reason: 'wrong_map' }; }
    var ex = duelMonster();
    if (ex && ex.hp > 0) { toast(FLIGHT.DUEL.name + ' đang chờ sẵn ở Bãi Luyện Công phía đông trấn.'); return { ok: false, reason: 'exists' }; }
    var d = FLIGHT.DUEL;
    var m = makeMonster(d.type, d.x, d.y, { noRespawn: true, duelFly: true });
    m.name = d.name; m.maxHp = d.hp; m.hp = d.hp; m.atk = d.atk; m.linhThach = d.linhThach;
    monsters.push(m);
    closeDialogue();
    toast(d.name + ' đã dựng ở Bãi Luyện Công (phía đông trấn) — đánh bại nó!');
    return { ok: true };
  }
  // ================= ĐẠI HỘI TU TIÊN (js/tournament.js) =================
  function tournMonster() {
    for (var i = 0; i < monsters.length; i++) if (monsters[i].tourn) return monsters[i];
    return null;
  }
  // Đưa người chơi về quảng trường map 3 sau khi một trận/kỳ trên võ
  // đài kết thúc (điểm rơi cạnh Chấp Sự Đại Hội).
  function leaveTournArena() {
    if (!TOURN || curMapId !== TOURN.ARENA.mapId) return;
    var rp = TOURN.ARENA.returnPoint;
    switchMap(rp.mapId, rp.x, rp.y);
  }
  // Vào trận: CHUYỂN CẢNH sang Võ Đài Đại Hội riêng (map_dai_hoi) —
  // người chơi xuất hiện đầu tây đài, đệ tử đối thủ (quái dạng người,
  // render bằng sheet hero của đệ tử) đứng đầu đông.
  function startTournMatch() {
    if (!TOURN) return { ok: false, reason: 'nomodule' };
    var st = TOURN.ensure(flags);
    if (!st || !st.run) { toast('Bạn chưa ghi danh kỳ Đại Hội nào. Tới gặp Chấp Sự Đại Hội ở quảng trường Chân Núi Thanh Phong.'); return { ok: false, reason: 'norun' }; }
    var ex = tournMonster();
    if (ex && ex.hp > 0) { toast('Đối thủ đang chờ sẵn trên Võ Đài Đại Hội.'); return { ok: false, reason: 'exists' }; }
    // Lưu/nạp giữa trận: run còn 'live' nhưng đối thủ không còn trên võ
    // đài — chốt bỏ cuộc để không kẹt kỳ, rồi đưa về quảng trường.
    if (st.run.phase === 'live') {
      onTournMatchEnd(TOURN.forfeit(flags, ch.name), null);
      leaveTournArena();
      toast('Trận trước đã gián đoạn — tính là bỏ cuộc.');
      return { ok: false, reason: 'stale' };
    }
    // Chuyển cảnh vào đài TRƯỚC khi startMatch (phase đang 'await' nên
    // hook bỏ cuộc trong switchMap không kích hoạt).
    if (curMapId !== TOURN.ARENA.mapId) {
      switchMap(TOURN.ARENA.mapId, TOURN.ARENA.playerStart.x, TOURN.ARENA.playerStart.y);
    } else {
      px = TOURN.ARENA.playerStart.x * TILE + 16; py = TOURN.ARENA.playerStart.y * TILE + 28;
      pvx = 0; pvy = 0; moveTarget = null; movePath = null; snapCamera();
    }
    var r = TOURN.startMatch(flags);
    if (!r.ok) { toast('Chưa vào trận được (' + r.reason + ').'); return r; }
    var sp = r.spawn;
    var m = makeMonster(sp.type, sp.x, sp.y, sp.extra);
    m.name = sp.name; m.maxHp = sp.hp; m.hp = sp.hp; m.atk = sp.atk; m.linhThach = 0;
    m.discHero = sp.discHero; m.discipleId = r.disciple.id;
    monsters.push(m);
    if (SND) { SND.sfx('tourn_drum'); SND.sfx('quest_accept'); } // trống trận khai cuộc
    toast(r.roundName + ' — ' + TOURN.discipleLabel(r.disciple) + ' (chiêu tủ: ' + r.disciple.skillName + '): "' + r.disciple.lines.pre + '"');
    saveGame();
    return { ok: true };
  }
  // LUẬT RANH ĐÀI: đang đấu trên võ đài mà ô người chơi ra khỏi ring
  // (chỉ thoát được qua bậc thang nam — vành rào chặn hết các phía) thì
  // XUỐNG ĐÀI = xử thua trận đó (reportLoss thường: thua bán kết vẫn
  // còn tranh hạng ba). Gọi mỗi tick cạnh checkPortal.
  function tickTournArena() {
    if (!TOURN || curMapId !== TOURN.ARENA.mapId || deathPending) return;
    var st = TOURN.ensure(flags);
    if (!st || !st.run || st.run.phase !== 'live') return;
    var tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (!TOURN.inRing(tx, ty)) {
      onTournMatchEnd(TOURN.reportLoss(flags, ch.name), null);
      toast('Xuống đài! Theo luật tỉ võ, rời khỏi võ đài là thua trận này.');
    }
  }
  // Xử lý kết quả một trận từ module: toast theo sự kiện, và khi kỳ kết
  // thúc thì PHÁT THƯỞNG ngay (claimRewards chốt đúng 1 lần/kỳ).
  function onTournMatchEnd(res, killedMonster) {
    if (!TOURN || !res || !res.ok) return;
    if (res.event === 'advanced') {
      var beaten = null;
      if (killedMonster && killedMonster.discipleId) beaten = TOURN.discipleById(killedMonster.discipleId);
      if (beaten) toast(beaten.name + ': "' + beaten.lines.lose + '"');
      toast('Thắng trận! Vòng tiếp theo: ' + TOURN.ROUNDS[res.round] + (res.next ? ' — gặp ' + TOURN.discipleLabel(res.next) + '.' : '.'));
      if (SND) SND.sfx('tourn_cheer'); // khán đài 10 tông reo hò
      toast('Khán đài dậy tiếng reo hò — đệ tử các tông vỗ tay vang cả võ đài!');
    } else if (res.event === 'third') {
      toast('Thua bán kết — vẫn còn trận Tranh hạng ba' + (res.next ? ' gặp ' + TOURN.discipleLabel(res.next) : '') + '. Đừng bỏ cuộc!');
    } else if (res.event === 'finished' && res.result) {
      var rw = TOURN.claimRewards(flags);
      if (rw && rw.length) grantRealmRewards(rw, 'tourn'); // chống hack: trần Đại Hội riêng (quán quân Trúc Cơ 3000)
      if (SB) {
        var sbKey = (flags.tourn && flags.tourn.lastResult && flags.tourn.lastResult.sessionKey) || null;
        var sbNote = SB.noteTournament(flags, res.result.placement, sbKey, gameNow());
        if (sbNote.ok) toast('Bảng mùa: +' + sbNote.added + ' điểm (' + TOURN.placementLabel(res.result.placement) + ' Đại Hội) — tổng mùa ' + sbNote.total + ' điểm.');
      }
      if (rw && SECTP) announceSectPoints(SECTP.onTournamentFinish(ch, flags, res.result.placement)); // cống hiến theo hạng, chốt cùng lúc phát thưởng nên đúng 1 lần/kỳ
      // BIA TRUYỀN KỲ (js/legend-board.js): chỉ quán quân mới khắc bia.
      if (LG && res.result.placement === 'quan_quan') {
        var lgKey = (flags.tourn && flags.tourn.lastResult && flags.tourn.lastResult.sessionKey) || ('tourn-' + gameNow());
        var lgNote = LG.noteTournament(flags, 'quan_quan', lgKey, TOURN.bracketById(res.result.bracket) ? TOURN.bracketById(res.result.bracket).name : '', gameNow());
        if (lgNote.ok) toast('Bia Truyền Kỳ: khắc thêm dấu mốc — Quán quân Đại Hội!');
      }
      var bname = TOURN.bracketById(res.result.bracket) ? TOURN.bracketById(res.result.bracket).name : '';
      toast('Đại Hội (' + bname + ') kết thúc: ' + TOURN.placementLabel(res.result.placement) + '! Quán quân kỳ này: ' + res.result.champion + '.');
      if (SND) { SND.sfx('quest_complete'); if (res.result.placement === 'quan_quan') SND.sfx('tourn_cheer'); }
    }
    updateHUD(); saveGame();
    if ($('panelTournament').style.display === 'block') renderTournamentPanel();
    // Hết trận trên võ đài -> về quảng trường map 3 nhận kết quả/đấu
    // tiếp vòng sau. Đường chết KHÔNG qua đây: onPlayerDeath gọi
    // onTournMatchEnd lúc ch.hp <= 0 rồi tự hồi sinh về làng như cũ.
    if (ch.hp > 0) leaveTournArena();
  }
  function openTournamentPanel() {
    renderTournamentPanel();
    $('panelTournament').style.display = 'block';
  }
  function tournRewardText(list) {
    return (list || []).map(function (r) {
      if (r.kind === 'linhThach') return r.n + ' Linh Thạch';
      if (r.kind === 'weapon') return (W && W.WEAPONS[r.id]) ? W.WEAPONS[r.id].name : r.id;
      if (r.kind === 'artifact') return (ART && ART.ARTIFACTS[r.id]) ? ART.ARTIFACTS[r.id].name : r.id;
      if (r.kind === 'item') return (L.ITEMS[r.id] ? L.ITEMS[r.id].name : r.id) + (r.n > 1 ? ' ×' + r.n : '');
      if (r.kind === 'title') return 'Danh hiệu Quán Quân Đại Hội';
      return '';
    }).filter(Boolean).join(' · ');
  }
  function renderTournamentPanel() {
    if (!TOURN || !ch) return;
    var now = gameNow();
    var st = TOURN.status(flags, ch, now);
    var html = '';
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function clock(ms) { var d = new Date(ms); function p(n) { return (n < 10 ? '0' : '') + n; } return p(d.getHours()) + ':' + p(d.getMinutes()); }
    if (st.session) {
      html += '<p><b>Đang trong phiên Đại Hội</b> (' + (st.session.phase === 'reg' ? 'đang ghi danh, khai mạc ' : 'đang thi đấu, mở lúc ') + clock(st.session.start) + ', kết thúc ' + clock(st.session.end) + ').</p>';
    } else if (st.next) {
      html += '<p>Ngoài phiên đấu. Phiên tới: ' + (st.next.dayOffset ? 'ngày mai, ' : '') + 'ghi danh từ ' + clock(st.next.regStart) + ', khai mạc ' + clock(st.next.start) + '. (Mỗi ngày 2 phiên: 10:00 và 19:30.)</p>';
    }
    var run = st.run;
    if (run) {
      var disc = TOURN.currentDisciple(run);
      html += '<div class="qitem"><b>Kỳ này — ' + esc(TOURN.bracketById(run.bracket).name) + '</b><br>' +
        'Đang ở: <b>' + esc(TOURN.roundNameOf(run)) + '</b>' + (disc ? ' · Đối thủ: ' + esc(TOURN.discipleLabel(disc)) + ' (chiêu tủ: ' + esc(disc.skillName) + ')' : '') +
        '<br>Đường đi: ' + run.draw.slice(0, 5).map(function (id, i) {
          var dd = TOURN.discipleById(id);
          return (run.beaten.indexOf(id) >= 0 ? '✓ ' : '') + esc(dd ? dd.name : id);
        }).join(' → ') + '</div>';
    } else {
      ['luyen_khi', 'truc_co'].forEach(function (bid) {
        var b = TOURN.bracketById(bid);
        var el = TOURN.eligible(ch, bid);
        html += '<div class="qitem"><label><input type="radio" name="tournBracket" value="' + bid + '"' + (bid === 'luyen_khi' ? ' checked' : '') + '> <b>' + esc(b.name) + '</b></label>' +
          ' — điều kiện: ' + esc(b.condText) + (el.ok ? ' <span style="color:#2e7d32">(đủ điều kiện)</span>' : ' <span style="color:#b03a2e">(chưa đủ)</span>') + '<br>' +
          Object.keys(TOURN.PLACEMENTS).map(function (p) {
            return TOURN.placementLabel(p) + ': ' + esc(tournRewardText(TOURN.rewardsFor(bid, p)));
          }).join('<br>') + '</div>';
      });
      if (st.playedThis) html += '<p>Kỳ này bạn đã đấu rồi — mỗi kỳ chỉ đấu 1 bảng, chờ phiên sau.</p>';
    }
    if (flags.tourn && flags.tourn.lastResult) {
      var lr = flags.tourn.lastResult;
      html += '<p>Kết quả kỳ gần nhất: <b>' + esc(TOURN.placementLabel(lr.placement)) + '</b> (' + esc(TOURN.bracketById(lr.bracket).name) + ') — thưởng: ' + esc(tournRewardText(lr.rewards)) + '.</p>';
    }
    if (st.hall && st.hall.length) {
      html += '<div class="qitem"><b>Bảng vinh danh — quán quân các kỳ gần nhất</b><br>' + st.hall.map(function (h) {
        return esc(h.champion) + (h.isPlayer ? ' (bạn)' : '') + ' — ' + esc(TOURN.bracketById(h.bracket).name);
      }).join('<br>') + '</div>';
    }
    $('tournBody').innerHTML = html;
    var canReg = !run && st.session && !st.playedThis;
    $('btnTournRegister').style.display = canReg ? '' : 'none';
    $('btnTournFight').style.display = (run && (run.phase === 'await' || run.phase === 'live')) ? '' : 'none';
    $('btnTournForfeit').style.display = run ? '' : 'none';
  }
  // ================= THÚ TRIỀU THỦ HỘ LÀNG (js/beast-tide.js) =================
  // Runtime sân thủ thành: tideAllies TRỎ THẲNG vào run.allies (HP/sống
  // chết lưu trong save), chỉ gắn thêm vị trí/nhịp đánh tại chỗ. Đợt quái
  // dùng quái thường của engine với cờ tide (đích lang thang bị ghi đè
  // về miệng cổng trong vòng lặp quái); phá cổng + chuyển đợt + AI đồng
  // minh chạy ở tickTide mỗi frame.
  var tideAllies = [];
  var tideWaveLive = false; // đợt hiện tại đã spawn, chưa dọn sạch
  function setupTideAllies() {
    var st = BT ? BT.ensure(flags) : null;
    if (!st || !st.run) { tideAllies = []; return; }
    tideAllies = st.run.allies;
    tideAllies.forEach(function (a) {
      a.x = a.postX; a.y = a.postY; a.atkT = 0; a.atkAnimT = 0;
      a.animT = Math.random() * 2; a.vx = 0; a.vy = 0; a.face = 'left';
    });
  }
  function spawnTideWave(plan) {
    if (!plan) return;
    plan.spawns.forEach(function (sp) {
      var m = makeMonster(sp.type, sp.x, sp.y, { tide: true, noRespawn: true, linhThach: 0 });
      m.maxHp = sp.hp; m.hp = sp.hp; m.atk = sp.atk;
      if (sp.leader) { m.tideLeader = true; m.name = sp.name; m.scale = 1.6; }
      monsters.push(m);
    });
    tideWaveLive = true;
    // QA (e) 15:01 31/10: tiếng đợt thú phải đúng loài — đợt nào cũng hú
    // sói thì đợt 5–6 (không có sói) và Yêu Vương (lợn mông sắt) đều sai
    // tiếng. Ưu tiên tiếng thủ lĩnh ở đợt cuối, còn lại lấy loài đầu đợt.
    if (SND) { var lvT = null; for (var liT = 0; liT < plan.spawns.length; liT++) if (plan.spawns[liT].leader) { lvT = plan.spawns[liT].type; break; } SND.voice(lvT || (plan.spawns[0] && plan.spawns[0].type) || 'soi_rung', 'aggro', { vol: 0.9 }); }
    toast('Thú triều — đợt ' + plan.wave + '/' + BT.WAVE_COUNT + ': ' + plan.count + ' con thú tràn về Nam Môn' + (plan.wave === BT.WAVE_COUNT ? ' — YÊU VƯƠNG HỐNG SƠN dẫn đầu!' : '!'));
  }
  // Tải save / quay lại map 1 giữa lượt: dựng lại đợt hiện tại từ đầu
  // (đồng minh về hàng, giữ nguyên HP/sống chết đã lưu).
  function respawnTideBattle() {
    var st = BT ? BT.ensure(flags) : null;
    if (!st || !st.run) return;
    if (monsters.some(function (m) { return m.tide; })) return;
    setupTideAllies();
    spawnTideWave(BT.wavePlan(flags, st.run.wave));
  }
  function startTideRun() {
    if (!BT) return { ok: false, reason: 'nomodule' };
    if (curMapId !== BT.STEWARD.mapId) { toast('Trận thủ thành diễn ra ở Nam Môn làng Thanh Khê — hãy về làng, ra gặp Chấp Sự Thủ Triều trong cổng.'); return { ok: false, reason: 'wrong_map' }; }
    var r = BT.startRun(flags, ch, gameNow());
    if (!r.ok) {
      var why = { closed: 'Hiện ngoài phiên thú triều — mở bảng sự kiện xem phiên tới.', played: 'Phiên này bạn đã thủ thành rồi.', inrun: 'Bạn đang giữa một lượt thủ thành khác.', low_realm: BT.eligible(ch).needText }[r.reason] || r.reason;
      toast('Không nhận được nhiệm vụ: ' + why);
      return r;
    }
    setupTideAllies();
    spawnTideWave(r.plan);
    if (SND) SND.sfx('quest_accept');
    toast('THÚ TRIỀU TỚI! Đệ tử mười tông đã đứng thành hàng trước Nam Môn. Giữ cổng qua 6 đợt!');
    saveGame();
    if ($('panelBeastTide').style.display === 'block') renderBeastTidePanel();
    return { ok: true };
  }
  function tickTide(dt) {
    if (!BT || curMapId !== 'map1') return;
    var st = flags.tide;
    if (!st || !st.run) { if (tideAllies.length) tideAllies = []; tideWaveLive = false; return; }
    var run = st.run;
    // 1) Thú chạm vòng cổng Nam Môn -> phá cổng (quái tan, không tính hạ).
    for (var i = monsters.length - 1; i >= 0; i--) {
      var m = monsters[i];
      if (!m.tide || m.hp <= 0 || m.dying) continue;
      var mx = Math.floor(m.x), my = Math.floor(m.y);
      if (my <= BT.GATE.breachY && mx >= BT.GATE.breachX0 && mx <= BT.GATE.breachX1) {
        m.hp = 0; m.dying = true; m.deadT = 0.25; m.breached = true;
        var br = BT.noteBreach(flags, !!m.tideLeader);
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 12, txt: 'PHÁ CỔNG!', color: '#ff8a3c', big: true, t: 1.1 });
        if (SND) SND.sfx('boom_small');
        if (br && br.lost) { onTideFinish(br.result); return; }
        toast('Thú dữ phá cổng Nam Môn! Cổng còn ' + (br ? br.gateHp : run.gateHp) + '/' + run.gateMax + '.');
        saveGame();
      }
    }
    // 2) Đệ tử đồng minh tự đánh.
    tickTideAllies(dt, run);
    // 3) Dọn sạch đợt -> mở đợt kế / thắng.
    if (tideWaveLive) {
      var anyAlive = false;
      for (var j = 0; j < monsters.length; j++) {
        if (monsters[j].tide && monsters[j].hp > 0 && !monsters[j].dying) { anyAlive = true; break; }
      }
      if (!anyAlive) {
        tideWaveLive = false;
        var adv = BT.advanceWave(flags);
        if (!adv) return;
        if (adv.event === 'won') { onTideFinish(adv.result); return; }
        toast('Đã giữ sạch đợt ' + (adv.plan.wave - 1) + '! Đợt ' + adv.plan.wave + ' đang tràn tới...');
        spawnTideWave(adv.plan);
        saveGame();
        if ($('panelBeastTide').style.display === 'block') renderBeastTidePanel();
      }
    }
  }
  // AI đồng minh: chọn quái thú triều còn sống gần nhất trong tầm 16 ô,
  // chạy tới chặn (tách trục + kiểm ô chặn như quái — không đứng ô chặn),
  // vào tầm 1,9 ô thì đánh theo nhịp 1,1s; quái mục tiêu có 30% phản đòn.
  // Gục (HP 0) = rút khỏi trận, không chết hẳn.
  function tickTideAllies(dt, run) {
    var mp = curMap();
    tideAllies.forEach(function (a) {
      a.animT = (a.animT || 0) + dt;
      if (a.atkT > 0) a.atkT -= dt;
      if (a.atkAnimT > 0) a.atkAnimT -= dt;
      a.vx = 0; a.vy = 0;
      if (!a.alive) return;
      var tgt = null, bd = 1e9;
      monsters.forEach(function (m) {
        if (!m.tide || m.hp <= 0 || m.dying) return;
        var d = Math.abs(m.x - a.x) + Math.abs(m.y - a.y);
        if (d < bd) { bd = d; tgt = m; }
      });
      var engage = !!(tgt && bd <= 16);
      var gx = engage ? tgt.x : a.postX, gy = engage ? tgt.y : a.postY;
      var dx = gx - a.x, dy = gy - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var stopD = engage ? 1.5 : 0.12;
      if (dist > stopD) {
        var step = Math.min(3.4 * dt, dist - (engage ? 1.35 : 0));
        if (step > 0 && dist > 0) {
          var ux = dx / dist, uy = dy / dist;
          var stxA = Math.floor(a.x), styA = Math.floor(a.y);
          var nxA = a.x + ux * step, nyA = a.y + uy * step;
          if (!M.isBlockedIn(mp, Math.floor(nxA), styA)) { a.x = nxA; a.vx = ux * 3.4; }
          if (!M.isBlockedIn(mp, stxA, Math.floor(nyA))) { a.y = nyA; a.vy = uy * 3.4; }
          if (M.isBlockedIn(mp, Math.floor(a.x), Math.floor(a.y))) { a.x = stxA + 0.5; a.y = styA + 0.5; a.vx = 0; a.vy = 0; }
        }
        if (Math.abs(a.vx) > Math.abs(a.vy) && a.vx) a.face = a.vx < 0 ? 'left' : 'right';
      }
      if (engage && tgt && dist <= 1.95 && a.atkT <= 0) {
        a.atkT = 1.1; a.atkAnimT = 0.35;
        a.face = tgt.x < a.x ? 'left' : 'right';
        var dmg = Math.max(1, Math.round(a.atk * (0.85 + Math.random() * 0.3)));
        rawHitMonster(tgt, dmg, '#ffe9a8', false);
        if (tgt.hp <= 0 || tgt.dying) BT.noteAllyKill(flags);
        else if (Math.random() < 0.30) {
          var rd = Math.max(1, Math.round((tgt.atk || 2) * 0.55));
          a.hp -= rd;
          floaters.push({ x: a.x * TILE + 16, y: a.y * TILE - 20, txt: '-' + rd, color: '#ff9a8a', t: 0.8 });
          if (a.hp <= 0) {
            a.hp = 0; a.alive = false;
            toast(a.name + ' (' + a.sectName + ') bị thương nặng — rút khỏi hàng thủ thành!');
            if (SND) SND.sfx('hurt');
            updateHUD(); saveGame();
          }
        }
      }
    });
  }
  // Kết thúc 1 lượt (thắng/thua/gục/bỏ cuộc): dọn sân, phát thưởng đúng
  // 1 lần qua claimRewards của module, báo kết quả + danh hiệu nếu có.
  function onTideFinish(result, notePrefix) {
    if (!BT || !result) return;
    monsters.forEach(function (m) { if (m.tide && !m.dying) { m.hp = 0; m.dying = true; m.deadT = 0.3; } });
    tideAllies = []; tideWaveLive = false;
    var rw = BT.claimRewards(flags);
    if (rw && rw.length) grantTideRewards(rw);
    if (SB && result) {
      var sbTide = SB.noteTide(flags, result.wavesCleared, result.outcome, result.sessionKey, gameNow());
      if (sbTide.ok) toast('Bảng mùa: +' + sbTide.added + ' điểm (Thú Triều giữ ' + result.wavesCleared + '/6 đợt) — tổng mùa ' + sbTide.total + ' điểm.');
    }
    // BIA TRUYỀN KỲ (js/legend-board.js): chỉ thắng trọn mới khắc bia.
    if (LG && result.outcome === 'win') {
      var lgTide = LG.noteTide(flags, 'win', result.sessionKey || ('tide-' + gameNow()), result.wavesCleared, gameNow());
      if (lgTide.ok) toast('Bia Truyền Kỳ: khắc thêm dấu mốc — Thủ thành Thú Triều thắng trọn!');
    }
    // THIÊN 5 ch.30 (js/thien5.js): giữ trọn thú triều = một trong hai
    // đường bắt ma tu lộ mặt (đường còn lại: dọn xong lượt vết nứt).
    // QA 19:31 30/10: lộ mặt là CÓ MẶT thật — bóng kẻ giữ ấn hiện ra
    // ngay tại làng (xem showThien5Figure).
    if (THIEN5 && result.outcome === 'win') {
      var tq5t = THIEN5.noteTideWin(qs, result);
      if (tq5t.questDone) { toast('Nhiệm vụ chính đã xong: Kẻ giữ ấn lên tiếng — về gặp đại diện tông để trả.'); var pt5t = playerTile(); showThien5Figure(curMapId, pt5t.x + 2, pt5t.y); }
    }
    // TRANG PHỤC SỰ KIỆN (js/wardrobe.js, đợt 1): thắng TRỌN Thú Triều
    // nhận Tinh Hà Pháp Y — đúng 1 lần (đã sở hữu thì thôi). Cổng hasArt
    // giữ luật "hình chưa xong thì chưa cho sở hữu": sheet chưa về thì
    // nguồn này chưa mở, sheet đăng ký là tự chạy.
    if (WD && result.outcome === 'win' && WD.hasArt('tinh_ha_phap_y', ch.gender) && !WD.owns(ch, 'tinh_ha_phap_y')) {
      var cgTide = WD.grantCostume(ch, 'tinh_ha_phap_y', 'beast_tide_win');
      if (cgTide.ok && !cgTide.already) toast('Phần thưởng thủ thành đặc biệt: TINH HÀ PHÁP Y! Mở Tủ Đồ để mặc.');
    }
    var tt = BT.titleText(flags);
    if (result.outcome === 'win') {
      toast((notePrefix || '') + 'THỦ THÀNH THẮNG! Giữ vững Nam Môn qua trọn 6 đợt — làng Thanh Khê an toàn, mười tông cùng mừng.' + (tt ? ' Danh hiệu của bạn: ' + tt + '.' : ''));
      if (SND) SND.sfx('quest_complete');
    } else {
      toast((notePrefix || '') + 'Cổng Nam Môn sập sau khi giữ được ' + result.wavesCleared + '/6 đợt... Bầy thú vỡ vào làng rồi rút vào rừng. Thưởng tính theo số đợt đã giữ.');
      if (SND) SND.sfx('hurt');
    }
    updateHUD(); saveGame();
    if ($('panelBeastTide').style.display === 'block') renderBeastTidePanel();
  }
  // Phát thưởng thú triều: Linh Thạch + vật phẩm + ĐIỂM CỐNG HIẾN qua
  // PNT_SECT.addPointsTo (js/sect-points.js, lý do 'thu_trieu'). Chưa
  // bái nhập tông môn thì điểm dồn vào "sổ thủ thành" flags.beastTideMerit
  // (module cống hiến chỉ tích khi đã bái sư) để không mất điểm.
  function grantTideRewards(list) {
    if (!list || !list.length) return;
    list.forEach(function (r) {
      if (r.kind === 'linhThach') { var tideLt = AC ? AC.guardGain('tide', r.n) : r.n; ch.linhThach += tideLt; toast('Thưởng thủ thành: +' + tideLt + ' Linh Thạch.'); }
      else if (r.kind === 'item') { L.addItem(ch, r.id, r.n || 1); toast('Thưởng thủ thành: ' + (L.ITEMS[r.id] ? L.ITEMS[r.id].name : r.id) + ' x' + (r.n || 1) + '.'); }
      else if (r.kind === 'merit') {
        var added = 0, rankUps = [];
        if (SECTP && typeof SECTP.addPointsTo === 'function') {
          try {
            var rp = SECTP.addPointsTo(ch, flags, r.n, 'thu_trieu');
            if (rp && rp.added) { added = rp.added; rankUps = rp.rankUps || []; }
          } catch (e) { added = 0; }
        }
        if (added > 0) {
          toast('Thưởng thủ thành: +' + added + ' Điểm Cống Hiến tông môn.');
          rankUps.forEach(function (u) { toast('Thăng cấp đệ tử: ' + u.name + '!'); });
        } else {
          flags.beastTideMerit = (flags.beastTideMerit || 0) + r.n;
          toast('Thưởng thủ thành: +' + r.n + ' điểm ghi vào Sổ Thủ Thành (bái nhập tông môn để điểm thành Điểm Cống Hiến).');
        }
      }
    });
    updateHUD(); saveGame();
  }
  // ================= HỘ TỐNG THƯƠNG ĐỘI (luật ở js/escort.js) =========
  // Xe là trạng thái lưu trong flags.escort.run (vị trí float theo ô);
  // quái phục kích là quái thường của engine mang cờ escort, đích
  // lang thang bị ghi đè về xe trong vòng lặp quái (nhánh m.escort).
  function spawnEscortAmbush(plan) {
    if (!plan || !ESC) return;
    var run = flags.escort && flags.escort.run;
    if (!run) return;
    plan.spawns.forEach(function (sp) {
      var m = makeMonster(sp.type, sp.x, sp.y, { escort: true, noRespawn: true, linhThach: 0 });
      // Chỉ số co theo tầng/hạng lúc nhận nhiệm vụ bằng scaler chung
      // của bí cảnh (js/secret-realms.js) — cùng một thước với mọi
      // nội dung co giãn khác của game.
      if (SR && L.MONSTERS[sp.type]) {
        var sc = SR.scaleMonsterStats(L.MONSTERS[sp.type], run.tier, run.rank);
        m.maxHp = sc.maxHp; m.hp = sc.maxHp; m.atk = sc.atk;
      }
      monsters.push(m);
    });
    toast('PHỤC KÍCH! Thú dữ từ hai bên đường ập vào đoàn xe — dẹp sạch chúng rồi xe mới đi tiếp được!');
    // QA (e) 15:01 31/10: phục kích kêu đúng loài đầu đoàn (chân 2 là sói
    // con/lợn rừng, chân 3 là khỉ/sói) thay vì hú sói cứng cho mọi chân.
    if (SND) SND.voice((plan.spawns[0] && plan.spawns[0].type) || 'soi_rung', 'aggro', { vol: 0.9 });
  }
  function startEscortRun() {
    if (!ESC) return { ok: false, reason: 'nomodule' };
    if (curMapId !== ESC.LEGS[0].mapId) { toast('Chuyến hàng xuất phát ở Rừng Thanh Sơn — tới gặp Mã Vạn Lai cạnh xe hàng ở đường mòn rừng đã.'); return { ok: false, reason: 'wrong_map' }; }
    var r = ESC.startRun(flags, qs, ch);
    if (!r.ok) {
      var why = { need_road: 'Đường buôn chưa thông — làm nhiệm vụ "Mở lại đường buôn" (dẹp 3 sói rừng quanh khúc đường mòn) trước đã.', busy: 'Bạn đang giữa một lượt thủ thành — xong trận đó rồi hãy nhận hộ tống.', inrun: 'Bạn đang giữa một chuyến hộ tống khác.' }[r.reason] || r.reason;
      toast('Không nhận được hộ tống: ' + why);
      return r;
    }
    if (SND) SND.sfx('quest_accept');
    toast('HỘ TỐNG BẮT ĐẦU! Đoàn xe lăn bánh từ Rừng Thanh Sơn — đi cùng xe, qua làng Thanh Khê, giao lên Trạm Buôn Chân Núi!');
    saveGame();
    if ($('panelEscort').style.display === 'block') renderEscortPanel();
    return { ok: true };
  }
  function onEscortFinish(result) {
    if (!ESC || !result) return;
    monsters.forEach(function (m) { if (m.escort && !m.dying) { m.hp = 0; m.dying = true; m.deadT = 0.3; } });
    if (result.outcome === 'win') {
      var escortLt = AC ? AC.guardGain('escort', result.reward) : result.reward; // chống hack: trần hộ tống
      ch.linhThach += escortLt;
      toast('GIAO HÀNG THÀNH CÔNG! Trạm Buôn Chân Núi nhận hàng, trả công +' + escortLt + ' Linh Thạch (xe còn ' + result.integrity + '% bền, hạ ' + result.kills + ' quái phục kích).');
      if (SND) SND.sfx('quest_complete');
      // THIÊN 4 ch.25: chuyến hàng vận mạch tới nơi = xong việc giữ mạch.
      if (THIEN4) { var eq = THIEN4.noteEscortWin(qs); if (eq.questDone) toast('Nhiệm vụ chính đã xong: Điểm mạch Thanh Sơn — về gặp đại diện tông để trả.'); }
    } else if (result.outcome === 'lost') {
      toast('XE HÀNG BỊ PHÁ NÁT giữa đường... Đoàn xe quay về, chuyến này mất trắng tiền công. Lần sau đừng để quái kề xe.');
      if (SND) SND.sfx('hurt');
    } else {
      toast('Bạn bỏ chuyến hộ tống — đoàn xe quay về rừng, không có tiền công.');
    }
    updateHUD(); saveGame();
    if ($('panelEscort').style.display === 'block') renderEscortPanel();
  }
  function tickEscort(dt) {
    if (!ESC) return;
    var st = ESC.ensure(flags);
    if (!st || !st.run) return;
    var run = st.run;
    // 1) Quái phục kích chạm xe -> cắn xe (như thú phá cổng thú triều:
    // quái tan, không tính là hạ, không rơi đồ/Linh Thạch).
    if (curMapId === run.mapId) {
      for (var i = monsters.length - 1; i >= 0; i--) {
        var m = monsters[i];
        if (!m.escort || m.hp <= 0 || m.dying) continue;
        var mx = Math.floor(m.x), my = Math.floor(m.y);
        if (Math.max(Math.abs(mx - Math.floor(run.x)), Math.abs(my - Math.floor(run.y))) <= ESC.TOUCH_DIST) {
          m.hp = 0; m.dying = true; m.deadT = 0.25; m.breached = true;
          floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 12, txt: 'CẮN XE!', color: '#ff8a3c', big: true, t: 1.1 });
          if (SND) SND.sfx('boom_small');
          var br = ESC.noteTouch(flags);
          if (br && br.lost) { onEscortFinish(ESC.finishRun(flags, 'lost')); return; }
          toast('Quái cắn xe hàng! Xe còn ' + br.cartHp + '/' + run.cartMax + ' bền.');
          saveGame();
          if ($('panelEscort').style.display === 'block') renderEscortPanel();
        }
      }
    }
    // 2) Còn phục kích thì xe đứng yên (kể cả khi người chơi ở map
    // khác: quái chỉ sống ở map của xe, xe không tự chạy).
    if (run.ambush) return;
    if (curMapId !== run.mapId) return;
    // 3) Người chơi xa quá 7 ô thì xe đứng chờ (không chạy mất).
    var ptx = px / TILE, pty = py / TILE;
    var pdx = ptx - run.x, pdy = pty - run.y;
    if (Math.sqrt(pdx * pdx + pdy * pdy) > ESC.FOLLOW_DIST) return;
    // 4) Lăn về waypoint hiện tại, tách trục + kiểm ô chặn như đồng
    // minh thú triều (xe không bao giờ đứng trên ô chặn).
    var leg = ESC.LEGS[run.leg];
    var wp = leg.waypoints[run.wp];
    var dx = wp[0] - run.x, dy = wp[1] - run.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= 0.12) {
      // Tới waypoint: phục kích? cuối chặng? hay waypoint giữa?
      if (ESC.isAmbushWaypoint(run)) {
        var plan = ESC.triggerAmbush(flags);
        if (plan) { spawnEscortAmbush(plan); saveGame(); if ($('panelEscort').style.display === 'block') renderEscortPanel(); }
        return;
      }
      if (run.wp >= leg.waypoints.length - 1) {
        if (run.leg >= ESC.LEGS.length - 1) { onEscortFinish(ESC.finishRun(flags, 'win')); return; }
        var adv = ESC.advanceLeg(flags);
        toast('Đoàn xe qua cổng, sang ' + ESC.LEGS[adv.leg].name + ' — chặng ' + (adv.leg + 1) + '/3!');
        saveGame();
        if ($('panelEscort').style.display === 'block') renderEscortPanel();
        return;
      }
      run.wp++;
      saveGame();
      return;
    }
    var step = Math.min(ESC.CART_SPEED * dt, dist);
    var ux = dx / dist, uy = dy / dist;
    var mp = curMap();
    var nx = run.x + ux * step, ny = run.y + uy * step;
    if (!M.isBlockedIn(mp, Math.floor(nx), Math.floor(run.y))) run.x = nx;
    if (!M.isBlockedIn(mp, Math.floor(run.x), Math.floor(ny))) run.y = ny;
    if (M.isBlockedIn(mp, Math.floor(run.x), Math.floor(run.y))) { run.x = Math.floor(run.x) + 0.5; run.y = Math.floor(run.y) + 0.5; }
  }
  function openEscortPanel() {
    renderEscortPanel();
    $('panelEscort').style.display = 'block';
  }
  function renderEscortPanel() {
    if (!ESC || !ch) return;
    var st = ESC.status(flags, ch);
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var html = '<p>Chuyến hàng của trưởng thương đội Mã Vạn Lai: <b>Rừng Thanh Sơn → Làng Thanh Khê → Trạm Buôn Chân Núi</b>. Xe chỉ lăn khi bạn ở cùng map và trong vòng 7 ô; mỗi chặng có 1 đợt phục kích, xe dừng cho tới khi dẹp sạch.</p>';
    if (st.run) {
      var run = st.run;
      html += '<div class="qitem"><b>Chuyến đang chạy — Chặng ' + (run.leg + 1) + '/3: ' + esc(st.legName) + ' → ' + esc(st.destName) + '</b><br>' +
        'Xe hàng: <b>' + run.cartHp + '/' + run.cartMax + '</b> bền (' + st.integrity + '%) · Hạ phục kích: ' + run.kills + ' · Quái cắn xe: ' + run.touches + ' lần<br>' +
        (run.ambush ? '<span style="color:#b03a2e"><b>ĐANG BỊ PHỤC KÍCH</b> — còn ' + run.ambush.remaining + '/' + run.ambush.total + ' quái, dẹp sạch xe mới lăn tiếp.</span><br>' : 'Xe đang lăn theo bạn (hoặc đứng chờ nếu bạn xa quá 7 ô / ở map khác).<br>') +
        'Tiền công nếu giao ngay bây giờ: <b>' + st.rewardIfWinNow + ' Linh Thạch</b> (đủ công khi xe lành 100%: ' + ESC.fullReward(run.tier) + ').</div>';
    } else {
      html += '<div class="qitem"><b>Nhận chuyến mới tại Mã Vạn Lai</b> (Rừng Thanh Sơn, cạnh xe hàng ở đường mòn) — cần <b>đã trả nhiệm vụ "Mở lại đường buôn"</b>.<br>' +
        'Tiền công đủ: 90 + 10×tầng của bạn (90–180 Linh Thạch/lượt), nhân hệ số nguyên vẹn (xe lành 100% thì đủ, xe còn một nửa thì 75%). Quái phục kích không rơi Linh Thạch — mọi Linh Thạch qua tiền công.</div>';
    }
    html += '<p>Thống kê: đã nhận <b>' + st.stats.runs + '</b> chuyến · giao thành công <b>' + st.stats.wins + '</b> · thất bại/bỏ <b>' + st.stats.fails + '</b>' +
      (st.stats.bestIntegrity ? ' · Độ nguyên vẹn cao nhất khi giao: <b>' + st.stats.bestIntegrity + '%</b>' : '') + '</p>';
    if (st.lastResult) {
      var lr = st.lastResult;
      html += '<p>Chuyến gần nhất: <b>' + (lr.outcome === 'win' ? 'GIAO THÀNH CÔNG' : (lr.outcome === 'lost' ? 'XE BỊ PHÁ NÁT' : 'ĐÃ BỎ CHUYẾN')) + '</b>' + (lr.outcome === 'win' ? ' — tiền công: +' + lr.reward + ' Linh Thạch, xe còn ' + lr.integrity + '% bền.' : '.') + '</p>';
    }
    $('escortBody').innerHTML = html;
    var cj = ESC.canStart(flags, qs, ch, curMapId);
    $('btnEscortStart').style.display = cj.ok ? '' : 'none';
    $('btnEscortForfeit').style.display = st.run ? '' : 'none';
  }
  // ---------- Panel Phiên Đấu Giá Liên Tông (js/auction.js) ----------
  function auctionLotName(def) {
    if (!def) return '?';
    if (def.kind === 'weapon' && W && W.WEAPONS[def.id]) return W.WEAPONS[def.id].name + ' (' + W.GRADES[W.WEAPONS[def.id].grade].name + ')';
    if (def.kind === 'artifact' && ART && ART.ARTIFACTS[def.id]) return ART.ARTIFACTS[def.id].name + ' (' + ART.GRADES[ART.ARTIFACTS[def.id].grade].name + ')';
    if (def.kind === 'recipe' && ALCH && ALCH.pillDef(def.id)) return 'Đan phương: ' + ALCH.pillDef(def.id).name;
    if (def.kind === 'manual' && L.ITEMS[def.id]) return L.ITEMS[def.id].name;
    return def.id;
  }
  function auctionLotKind(def) {
    return def.kind === 'weapon' ? 'Vũ khí' : (def.kind === 'artifact' ? 'Pháp bảo' : (def.kind === 'manual' ? 'Bí tịch' : 'Đan phương'));
  }
  function openAuctionPanel() {
    renderAuctionPanel();
    $('panelAuction').style.display = 'block';
  }
  function renderAuctionPanel() {
    if (!AUC || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var st = AUC.ensure(flags);
    var ses = AUC.sessionAt(gameNow());
    var html = '<p>Phiên đấu giá của mười tông tại quảng trường Chân Núi Thanh Phong — <b>12:00 và 20:00 mỗi ngày, mỗi phiên 90 phút, 3 lô</b>. Thắng thì trả đúng giá chốt, thua/bỏ qua thì tiền còn nguyên. Giá trần là giới hạn cứng: không ai được trả quá trần lô.</p>';
    var ce = AUC.canEnter(flags, qs, ch, curMapId);
    if (!ce.ok) {
      html += '<div class="qitem"><b>Chưa vào được phiên:</b> ' + esc(ce.reason) + '</div>';
      $('btnAuctionEnter').style.display = 'none';
      $('btnAuctionBid').style.display = 'none';
      $('btnAuctionCloseLot').style.display = 'none';
      $('btnAuctionPass').style.display = 'none';
    } else if (st.session && st.session.key === ses.key) {
      var s = st.session, lot = s.lot, def = AUC.lotOf(lot.lotId);
      var cb = AUC.canBidLot(ch, def);
      var learned = (ALCH && ALCH.learnedList) ? ALCH.learnedList(ch) : [];
      var alreadyLearned = def.kind === 'recipe' && learned.indexOf(def.id) >= 0;
      html += '<div class="qitem"><b>Lô ' + (s.lotIndex + 1) + '/3: ' + esc(auctionLotName(def)) + '</b> — ' + auctionLotKind(def) +
        ' · Khởi điểm: ' + def.start + ' · Bước giá: ' + def.step + ' · <b>Giá trần: ' + def.cap + '</b> Linh Thạch · Yêu cầu tầng: ' + def.reqTier + '<br>' +
        'Giá hiện tại: <b>' + lot.price + ' Linh Thạch</b>' + (lot.leaderName ? ' — <b>' + esc(lot.leaderName) + '</b> đang dẫn.' : ' — chưa ai trả giá.') + '<br>' +
        'Linh Thạch của bạn: <b>' + (ch.linhThach | 0) + '</b>' +
        (!cb.ok ? '<br><span style="color:#b03a2e"><b>' + esc(cb.reason) + '</b> Vẫn xem được và bỏ qua lô được.</span>' : '') +
        (alreadyLearned ? '<br><span style="color:#b03a2e"><b>Bạn đã học đan phương này rồi</b> — không cần đấu nữa, hãy bỏ qua lô.</span>' : '') +
        '</div>';
      html += '<p>Đệ tử các tông đang ngồi sàn: ' + s.bidders.map(function (b) { return esc(b.name + ' (' + b.sectName + ')'); }).join(' · ') + '</p>';
      if (lot.bids.length) {
        html += '<p>Lịch sử trả giá lô này: ' + lot.bids.map(function (bd) { return esc(bd.name) + ' ' + bd.amount; }).join(' → ') + '</p>';
      }
      $('btnAuctionEnter').style.display = 'none';
      $('btnAuctionBid').style.display = (cb.ok && !alreadyLearned && lot.price + def.step <= def.cap) ? '' : 'none';
      $('btnAuctionCloseLot').style.display = (AUC.canCloseLot(s) && !alreadyLearned) ? '' : 'none';
      $('btnAuctionPass').style.display = '';
    } else if (ses.active) {
      html += '<div class="qitem"><b>Phiên đang mở</b> (tới ' + AUC.fmtTime(ses.end) + ') nhưng bạn chưa vào sàn. Bấm "Vào sàn đấu giá" để nhận 3 lô của phiên này — lô xoay theo ngày, qua phiên là đổi lô.</div>';
      $('btnAuctionEnter').style.display = '';
      $('btnAuctionBid').style.display = 'none';
      $('btnAuctionCloseLot').style.display = 'none';
      $('btnAuctionPass').style.display = 'none';
    } else {
      var preview = AUC.lotsForSessionKey(ses.next.key).map(function (id) { return esc(auctionLotName(AUC.lotOf(id))); }).join(' · ');
      html += '<div class="qitem"><b>Ngoài giờ phiên.</b> Phiên sau mở lúc <b>' + AUC.fmtTime(ses.next.start) + '</b> (12:00 và 20:00 mỗi ngày, 90 phút/phiên). 3 lô sẽ lên sàn: ' + preview + '.</div>';
      $('btnAuctionEnter').style.display = 'none';
      $('btnAuctionBid').style.display = 'none';
      $('btnAuctionCloseLot').style.display = 'none';
      $('btnAuctionPass').style.display = 'none';
    }
    if (st.lastSession && st.lastSession.history) {
      html += '<p>Phiên gần nhất đã gõ búa: ' + st.lastSession.history.map(function (h) { return esc(auctionLotName(AUC.lotOf(h.lotId))) + ' → ' + esc(h.winnerName) + ' ' + h.price; }).join(' · ') + '</p>';
    }
    html += '<p>Thống kê: đã đấu <b>' + st.stats.sessions + '</b> phiên · thắng <b>' + st.stats.lotsWon + '</b> lô · bỏ qua <b>' + st.stats.lotsPassed + '</b> lô · đã chi <b>' + st.stats.spent + '</b> Linh Thạch.</p>';
    $('auctionBody').innerHTML = html;
  }
  // ---------- Panel Bạn Đi Cùng (js/companion.js) ----------
  function openCompanionPanel() {
    renderCompanionPanel();
    $('panelCompanion').style.display = 'block';
  }
  function renderCompanionPanel() {
    if (!COMP || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var st = COMP.ensure(flags);
    var rec = COMP.recruitedCompanion(flags);
    var html = '<p>Đệ tử đồng môn đi cùng bạn trên đường tu hành — đánh phụ quái đã giao chiến, không tự mở combat, không tạo nguồn Linh Thạch mới. Chỉ số co theo tầng của bạn, gục thì về làng (map 1) để hồi lại.</p>';
    if (!rec) {
      var cr = COMP.canRecruit(flags);
      if (cr.ok) {
        html += '<div class="qitem"><b>' + esc(cr.companion.name) + '</b> (' + esc(cr.companion.sectName) + ' · ' + cr.companion.roleName + ') đang chờ ở bãi tuyển map 3 — nói chuyện với ' + esc(cr.companion.repName) + ' để mời đi cùng.<br><i>“' + esc(cr.companion.recruitLine) + '”</i></div>';
      } else {
        html += '<div class="qitem"><b>Chưa có đồng hành:</b> ' + esc(cr.needText || 'Hãy bái nhập một tông môn (lễ chọn tông, chương 12) rồi quay lại gặp đại diện tông của mình ở bãi tuyển map 3.') + '</div>';
      }
      $('btnCompToggle').style.display = 'none';
    } else {
      var maxHp = COMP.maxHpOf(ch);
      var hp = (st.hp === null || st.hp === undefined) ? maxHp : st.hp;
      var downed = hp <= 0;
      html += '<div class="qitem"><b>' + esc(rec.name) + '</b> — đệ tử ' + esc(rec.sectName) + ' · ' + rec.roleName + ' · Chiêu: ' + esc(rec.skill.name) +
        '<br>Máu: <b>' + hp + '/' + maxHp + '</b>' + (downed ? ' <b style="color:#b03a2e">(đã gục — về làng map 1 để hồi lại)</b>' : '') +
        ' · Tấn công: <b>' + COMP.atkOf(ch) + '</b> (tầng ' + (ch.tier | 0) + ') · Đã phụ hạ: <b>' + st.kills + '</b> quái' +
        '<br>Trạng thái: <b>' + (st.active ? 'Đang đi cùng bạn' : 'Đang nghỉ ở bãi tuyển') + '</b>' +
        '<br><i>“' + esc(rec.idleLine) + '”</i></div>';
      if (AFF) {
        var bondAtk = AFF.companionBondAtk(flags, rec.sectId);
        if (bondAtk > 0) html += '<p>Hảo cảm với ' + esc(rec.repName) + ' từ mốc Thân thiết trở lên: bạn đi cùng được <b>+' + bondAtk + ' công</b>.</p>';
      }
      if (SWN) {
        if (SWN.isSworn(flags)) {
          html += '<p><b>' + esc(SWN.oathLine(flags)) + '</b></p>';
        } else {
          var knGate = SWN.gate(flags);
          if (knGate.ok) html += '<p>Đủ điều kiện kết nghĩa — nói chuyện với ' + esc(rec.repName) + ' ở bãi tuyển map 3 để bắt đầu chuỗi kết nghĩa.</p>';
          else if (knGate.needText) html += '<p>Kết nghĩa: ' + esc(knGate.needText) + '</p>';
        }
      }
      html += '<p>Bạn đi cùng chỉ đánh quái <b>đã bị thương</b> trong tầm quanh bạn; quái nguyên máu thì bạn đi cùng chỉ đi theo. Khi bạn ngự kiếm bay, bạn đi cùng vẫn đi bộ dưới đất.</p>';
      $('btnCompToggle').style.display = '';
      $('btnCompToggle').textContent = st.active ? 'Cho đồng hành nghỉ ở bãi tuyển' : 'Gọi đồng hành đi cùng';
    }
    $('companionBody').innerHTML = html;
  }
  // ---------- Panel Hảo Cảm NPC (js/affinity.js) ----------
  function openAffinityPanel() {
    renderAffinityPanel();
    $('panelAffinity').style.display = 'block';
  }
  function renderAffinityPanel() {
    if (!AFF || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var rows = AFF.listAll(flags);
    var html = '<p>Hảo cảm tăng khi tặng quà đúng ý (món ưa thích +10, món tặng được khác +3, tối đa +20 điểm quà/ngày/người làng) và khi trả nhiệm vụ cho chính người giao (+8). Mốc 40 Thân thiết mở thoại riêng; mốc 70 Tri kỷ mở giảm giá shop (xem từng người).</p>';
    rows.forEach(function (r) {
      var gifts = AFF.giftableFor(r.id, ch);
      var shopNote = r.shop ? ' · Giảm giá ' + r.shop + ': ' + AFF.discountPct(r.id, flags) + '%' : '';
      var bondNote = '';
      if (flags.sectJoined && AFF.repIdOfSect(flags.sectJoined) === r.id) {
        var bond = AFF.companionBondAtk(flags, flags.sectJoined);
        if (bond > 0) bondNote = ' · Bạn đi cùng của tông được +' + bond + ' công nhờ hảo cảm này';
      }
      html += '<div class="qitem"><b>' + esc(r.name) + '</b> — ' + r.points + ' điểm · ' + r.tier.name + shopNote + bondNote +
        '<br>Ưa thích: ' + r.likes.map(function (g) { return esc(g.name); }).join(' · ') +
        (r.points >= 40 ? '<br><i>“' + esc(r.line) + '”</i>' : '<br><i>Thân thiết (40 điểm) sẽ mở câu chuyện riêng của người này.</i>') + '<br>';
      if (gifts.length) {
        html += '<select data-aff-select="' + esc(r.id) + '">' + gifts.map(function (g) {
          return '<option value="' + esc(g.id) + '">' + esc(g.name) + ' ×' + g.count + (g.liked ? ' (ưa thích)' : '') + '</option>';
        }).join('') + '</select> <button data-aff-gift="' + esc(r.id) + '">Tặng quà</button>';
      } else {
        html += '<i>Trong túi không còn món nào tặng được cho người này.</i>';
      }
      html += '</div>';
    });
    $('affinityBody').innerHTML = html;
    var btns = $('affinityBody').querySelectorAll('[data-aff-gift]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var nid = btn.getAttribute('data-aff-gift');
          var sel = $('affinityBody').querySelector('[data-aff-select="' + nid + '"]');
          if (!sel) return;
          var res = AFF.gift(ch, flags, nid, sel.value, Date.now());
          if (res.ok) {
            toast('Tặng ' + res.itemName + ' cho ' + res.npc.name + ': hảo cảm +' + res.gain + ' (nay ' + res.points + ' điểm, ' + res.tier.name + ').');
            if (SND) SND.sfx('quest_complete');
          } else if (res.reason === 'daily_cap') {
            toast('Hôm nay người này đã nhận đủ quà (tối đa +20 điểm quà/ngày) — mai quay lại.');
          } else if (res.reason === 'not_giftable') {
            toast('Người này không nhận món đó.');
          } else {
            toast('Chưa tặng được quà.');
          }
          updateHUD(); saveGame(); renderAffinityPanel();
        });
      })(btns[i]);
    }
  }
  // ---------- Panel Bảng Xếp Hạng Tu Sĩ Theo Mùa (js/season-board.js) ----------
  // ---------- Panel Trận Kỳ (js/formation.js) ----------
  function openFormationPanel() {
    renderFormationPanel();
    $('panelFormation').style.display = 'block';
  }
  function renderFormationPanel() {
    if (!FM || !ch || !$('formationBody')) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var d = FM.describe(flags, qs ? qs.turnedIn : []);
    var html = '<p>Cắm cờ trận tại chỗ đứng: một trận đang cắm, tốn 30 Linh Thạch khi kết cờ + ' + FM.UPKEEP_LL_PER_SEC + ' linh lực/giây để duy trì. Cạn linh lực hoặc hết giờ thì trận tự tan. Sang map khác trận đóng băng, không mất thời gian.</p>';
    if (!d.learned) {
      html += '<div class="qitem"><b>Chưa học bày trận:</b> trả phép thử “Dẫn khí qua cửu cung” của Âu Dương Kỳ (Cửu Cung Trận Tông) ở bãi tuyển map 3 để học cách kết cờ trận.</div>';
    }
    if (d.active) {
      var eff = FM.effectOf(d.active.type, flags);
      html += '<div class="qitem"><b>Đang cắm: ' + esc(eff ? eff.name : d.active.type) + '</b> — map ' + esc(d.active.map) + ', ô (' + d.active.x + ',' + d.active.y + ')' +
        '<br>Còn lại: <b>' + Math.ceil(d.remainingSec) + ' giây</b> (trên map đặt trận) · Bán kính: <b>' + (eff ? eff.radiusPx : 0) + 'px</b>' +
        (d.isCuuCung ? '<br><i>Đệ tử Cửu Cung: trận mạnh hơn (bán kính, hiệu quả, thời gian đều tăng).</i>' : '') + '</div>';
    } else if (d.learned) {
      html += '<div class="qitem">Chưa cắm trận nào — bấm nút bên dưới để cắm ngay tại chỗ bạn đang đứng.</div>';
    }
    d.list.forEach(function (it) {
      var effTxt = [];
      if (it.tuviPct > 0) effTxt.push('thổ nạp trong vòng +' + it.tuviPct + '% tu vi');
      if (it.dmgTakenPct > 0) effTxt.push('người trong vòng nhận ít hơn ' + it.dmgTakenPct + '% sát thương đánh trả thường');
      if (it.monsterDmgPct > 0) effTxt.push('đòn quái trong vòng yếu đi ' + it.monsterDmgPct + '%');
      if (it.slow) effTxt.push('quái trong vòng chậm đi một nửa');
      html += '<div class="qitem"><b style="color:' + esc(it.color) + '">' + esc(it.name) + '</b> — ' + esc(it.desc) +
        '<br>Hiệu quả: ' + effTxt.join('; ') + ' · Bán kính ' + it.radiusPx + 'px · Tối đa ' + it.durationSec + ' giây' + (d.isCuuCung ? ' (đã tính tăng cường Cửu Cung)' : '') + '</div>';
    });
    $('formationBody').innerHTML = html;
    var canPlace = d.learned && !d.active;
    $('btnFormTuKhi').style.display = canPlace ? '' : 'none';
    $('btnFormHoThe').style.display = canPlace ? '' : 'none';
    $('btnFormKhonThu').style.display = canPlace ? '' : 'none';
    $('btnFormDissolve').style.display = d.active ? '' : 'none';
  }
  function placeFormation(typeId) {
    if (!FM || !ch) return;
    var t = playerTile();
    var r = FM.place(flags, ch, qs ? qs.turnedIn : [], typeId, curMapId, t.x, t.y);
    if (!r.ok) {
      toast(r.reason === 'not_learned' ? 'Chưa học bày trận — trả phép thử của Âu Dương Kỳ trước.' :
        r.reason === 'already_active' ? 'Đã có trận đang cắm — thu trận cũ trước.' :
        r.reason === 'poor' ? 'Cần 30 Linh Thạch để kết cờ trận.' : 'Không cắm được trận.');
      return;
    }
    var eff = FM.effectOf(typeId, flags);
    toast('Đã cắm ' + (eff ? eff.name : typeId) + ' tại chỗ đứng! Duy trì tốn ' + FM.UPKEEP_LL_PER_SEC + ' linh lực/giây.');
    if (SND) SND.sfx('formation'); // QA 15:16 30/10: cắm trận phải có tiếng trận
    updateHUD(); saveGame(); renderFormationPanel();
  }
  function dissolveFormation() {
    if (!FM) return;
    var f = FM.dissolve(flags);
    if (f) { toast('Đã thu trận.'); if (SND) SND.sfx('formation'); }
    updateHUD(); saveGame(); renderFormationPanel();
  }
  // ---------- Panel Thiên Cơ Đồ Giám (js/bestiary.js) ----------
  var bxOpenedOnce = false; // lượt âm thanh 31/10: tiếng giở sổ chỉ phát ở lần mở Đồ Giám ĐẦU TIÊN của phiên (các lần sau đã có ui_click của nút)
  function openBestiaryPanel() {
    if (!bxOpenedOnce) { bxOpenedOnce = true; if (SND) SND.sfx('codex_open'); }
    renderBestiaryPanel();
    $('panelBestiary').style.display = 'block';
  }
  function renderBestiaryPanel() {
    if (!BX || !ch || !$('bestiaryBody')) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    // Khớp sổ với túi đồ hiện tại: vũ khí/pháp bảo mua/chế/rơi theo
    // đường không qua hook rơi, thú đang sở hữu, mốc chết boss cũ.
    var apis = { petSpecies: [], weaponIds: [], artifactIds: [], bossKills: flags.bossKills || {} };
    if (ch.pets && Array.isArray(ch.pets.owned)) apis.petSpecies = ch.pets.owned.map(function (p) { return p.sp; });
    if (W) apis.weaponIds = W.weaponEntries(ch).map(function (e) { return e.id; });
    if (ART) apis.artifactIds = ART.artifactEntries(ch).map(function (e) { return e.id; });
    BX.syncFromCharacter(flags, ch, apis);
    var b = BX.ensure(flags);
    var totals = {
      monsters: L ? Object.keys(L.MONSTERS).length : 0,
      bosses: BOS ? BOS.BOSSES.length : 0,
      pets: PETS ? Object.keys(PETS.SPECIES).length : 0,
      pills: ALCH ? Object.keys(ALCH.PILLS).length : 0,
      realms: SR ? SR.POOL.length : 0,
      weapons: W ? Object.keys(W.WEAPONS).length : 0,
      artifacts: ART ? Object.keys(ART.ARTIFACTS).length : 0,
      npcs: ST ? Object.keys(ST.NPCS).length : 0
    };
    var sum = BX.summary(flags, totals);
    var html = '<p>Sổ tay của Lục Tiểu Lục (sạp chợ làng Thanh Khê, map 1) — tự ghi những gì bạn đã thật sự gặp. Trang chưa gặp hiện “???”, không tiết lộ trước. Điểm Đồ Giám chỉ để nhận thưởng mốc, không phải tiền, không đổi giữa chừng.</p>';
    html += '<div class="qitem"><b>Điểm Đồ Giám: ' + sum.points + ' / ' + BX.maxPoints(totals) + '</b>' +
      (sum.titles.length ? '<br>Danh hiệu đã nhận: ' + sum.titles.map(esc).join(' · ') : '') + '</div>';
    // Quái: trang mở khi hạ 1, chi tiết khi hạ đủ 10.
    var monHtml = Object.keys(L.MONSTERS).map(function (id) {
      var def = L.MONSTERS[id], n = b.kills[id] || 0;
      if (!n) return '??? (chưa gặp)';
      if (n < BX.DETAIL_KILLS) return esc(def.name) + ' — đã hạ ' + n + ' con (đủ ' + BX.DETAIL_KILLS + ' con mở chi tiết)';
      return esc(def.name) + ' — đã hạ ' + n + ' con · Máu ' + def.hp + ' · Tấn công ' + def.atk;
    }).join('<br>');
    html += '<div class="qitem"><b>Quái đã hạ: ' + sum.monsters.seen + '/' + totals.monsters + ' loài (chi tiết ' + sum.monsters.detail + ' loài)</b><br>' + monHtml + '</div>';
    var bossHtml = BOS.BOSSES.map(function (def) {
      return b.bosses[def.id] ? esc(def.name) + ' — đã thắng (' + esc(def.lairName || '') + ')' : '??? (chưa thắng)';
    }).join('<br>');
    html += '<div class="qitem"><b>Boss đã thắng: ' + sum.bosses.won + '/' + totals.bosses + '</b><br>' + bossHtml + '</div>';
    var petHtml = Object.keys(PETS.SPECIES).map(function (id) {
      var def = PETS.SPECIES[id];
      return b.pets[id] ? esc(def.name) + ' (' + PETS.GRADES[def.grade].name + ' phẩm)' : '??? (chưa thu phục)';
    }).join('<br>');
    html += '<div class="qitem"><b>Linh thú đã thu phục: ' + sum.pets.owned + '/' + totals.pets + '</b><br>' + petHtml + '</div>';
    var pillHtml = Object.keys(ALCH.PILLS).map(function (id) {
      return b.pills[id] ? esc(ALCH.PILLS[id].name) : '??? (chưa luyện)';
    }).join(' · ');
    html += '<div class="qitem"><b>Đan đã luyện: ' + sum.pills.brewed + '/' + totals.pills + '</b><br>' + pillHtml + '</div>';
    var realmHtml = SR.POOL.map(function (def) {
      var e = b.realms[def.id];
      if (!e || !e.entered) return '??? (chưa vào)';
      return esc(def.name) + (e.completed ? ' — đã hoàn thành lượt' : ' — đã vào, chưa hoàn thành lượt');
    }).join('<br>');
    html += '<div class="qitem"><b>Bí cảnh đã vào: ' + sum.realms.entered + '/' + totals.realms + ' (hoàn thành ' + sum.realms.completed + ' cảnh)</b><br>' + realmHtml + '</div>';
    // Vũ Khí trong Đồ Giám (20:26 mục 5): đã sở hữu hiện rõ + chỉ
    // số; chưa có hiện bóng + nguồn lấy được; % sưu tập như các mục khác.
    function weaponSource(id) {
      var d = W.WEAPONS[id];
      if (d.price > 0) return 'Mua ở lò rèn của Thiết Cường';
      if (W.RECIPES && W.RECIPES[id]) return 'Rèn tại lò rèn (công thức riêng)';
      var dropped = false;
      if (W.DROPS) Object.keys(W.DROPS).forEach(function (bk) {
        (W.DROPS[bk] || []).forEach(function (dr) { if (dr.id === id) dropped = true; });
      });
      if (dropped) return 'Rớt từ boss thế giới';
      return 'Kỳ ngộ hoặc sự kiện trong thế giới';
    }
    var weapHtml = Object.keys(W.WEAPONS).map(function (id) {
      var d = W.WEAPONS[id];
      return b.weapons[id]
        ? '<b>' + esc(d.name) + '</b> (' + W.GRADES[d.grade].name + ' · Tấn công +' + d.atk + ')'
        : '??? (bóng ' + W.TYPES[d.type].name + ' · ' + W.GRADES[d.grade].name + ' — ' + weaponSource(id) + ')';
    }).join('<br>');
    var weapPct = totals.weapons ? Math.round(sum.weapons.owned / totals.weapons * 100) : 0;
    html += '<div class="qitem"><b>Vũ khí đã sở hữu: ' + sum.weapons.owned + '/' + totals.weapons + ' (' + weapPct + '% sưu tập)</b><br>' + weapHtml + '</div>';
    var artHtml = Object.keys(ART.ARTIFACTS).map(function (id) {
      return b.artifacts[id] ? esc(ART.ARTIFACTS[id].name) : '??? (chưa sở hữu)';
    }).join(' · ');
    html += '<div class="qitem"><b>Pháp bảo đã sở hữu: ' + sum.artifacts.owned + '/' + totals.artifacts + '</b><br>' + artHtml + '</div>';
    var npcHtml = Object.keys(ST.NPCS).map(function (id) {
      return b.npcs[id] ? esc(ST.NPCS[id].name) + ' — ' + esc(ST.NPCS[id].title || '') : '??? (chưa gặp)';
    }).join('<br>');
    html += '<div class="qitem"><b>Người làng đã gặp: ' + sum.npcs.met + '/' + totals.npcs + '</b><br>' + npcHtml + '</div>';
    var cl = BX.claimable(flags);
    if (cl.length) {
      html += '<div class="qitem"><b>Thưởng mốc đang chờ nhận:</b><br>' + cl.map(function (m) {
        return m.pts + ' điểm — “' + esc(m.title) + '”: +' + m.lt + ' Linh Thạch' + (m.item ? ' + ' + esc(L.ITEMS[m.item.id] ? L.ITEMS[m.item.id].name : m.item.id) + ' ×' + m.item.n : '') +
          ' <button data-bx-claim="' + m.pts + '">Nhận thưởng</button>';
      }).join('<br>') + '</div>';
    } else {
      var nx = BX.nextMilestone(flags);
      html += '<p>' + (nx ? 'Mốc kế: ' + nx.milestone.pts + ' điểm (“' + esc(nx.milestone.title) + '”, +' + nx.milestone.lt + ' Linh Thạch) — còn thiếu ' + nx.need + ' điểm.' : 'Đã nhận hết mọi mốc Đồ Giám.') + '</p>';
    }
    if (sum.claimed.length) {
      html += '<p>Đã nhận: ' + sum.claimed.map(function (pts) {
        var m = BX.milestoneByPts(pts); return pts + ' điểm (“' + esc(m.title) + '”, +' + m.lt + ' Linh Thạch)';
      }).join(' · ') + '.</p>';
    }
    html += '<p><i>Ghi chú trung thực: sổ chỉ tính từ khi ra đời đối với quái đã hạ, đan đã luyện và người làng đã gặp — save cũ không lưu sẵn các số này nên sổ không bịa lại quá khứ. Thú, vũ khí, pháp bảo và mốc boss cũ thì khớp lại được từ túi đồ và mốc chết boss nên vẫn giữ trang.</i></p>';
    $('bestiaryBody').innerHTML = html;
    var btns = $('bestiaryBody').querySelectorAll('[data-bx-claim]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var pts = +btn.getAttribute('data-bx-claim');
          var res = BX.claim(flags, pts, ch);
          if (res.ok) {
            if (res.item && L) L.addItem(ch, res.item.id, res.item.n);
            toast('Thiên Cơ Đồ Giám: mốc ' + pts + ' điểm — nhận danh hiệu “' + res.title + '” +' + res.lt + ' Linh Thạch' + (res.item ? ' + quà kèm' : '') + '!');
            if (SND) SND.sfx('quest_complete');
          } else {
            toast('Chưa nhận được thưởng mốc này.');
          }
          updateHUD(); saveGame(); renderBestiaryPanel();
        });
      })(btns[i]);
    }
  }
  // ---------- SỰ KIỆN NGẪU NHIÊN THẾ GIỚI (js/world-events.js) ----------
  var wevTickAcc = 0, wevKingSpawned = false, wevMonkPanelOpen = false;
  function wevMapLabel(ev) { return WE.mapName(ev.mapId); }
  function tickWorldEvents(dt) {
    if (!WE || !ch || !flags) return;
    wevTickAcc += dt;
    if (wevTickAcc < 0.25) { updateWevTimer(); return; }
    wevTickAcc = 0;
    var now = gameNow();
    var prevEv = WE.activeEvent(flags);
    var wasMerchant = !!(prevEv && prevEv.kind === 'merchant');
    var notices = WE.tick(flags, ch, now, Math.random, { mapId: curMapId, inRealm: /^realm_/.test(curMapId || '') });
    for (var i = 0; i < notices.length; i++) {
      var nt = notices[i], ev = nt.event;
      // QA 20:46 (mảng âm thanh): toast sự kiện trước đây câm hoàn
      // toàn — bắt đầu kêu tiếng kỳ ngộ, kết thúc kêu một tiếng UI
      // nhẹ (chỉ 1 lần mỗi lần mở/tan, không spam theo frame).
      if (SND) SND.sfx(nt.type === 'start' ? 'kyngo' : 'ui_click');
      if (nt.type === 'start') {
        if (nt.kind === 'burst') toast(ev.mapId === curMapId ? 'ĐIỂM LINH KHÍ BÙNG PHÁT ngay tại ' + wevMapLabel(ev) + '! Hạ quái trong vòng sáng là nhận tu vi.' : 'ĐIỂM LINH KHÍ BÙNG PHÁT xuất hiện ở ' + wevMapLabel(ev) + '!');
        else if (nt.kind === 'king') { syncWevKing(); toast(ev.mapId === curMapId ? 'VƯƠNG THÚ xuất hiện ngay tại ' + wevMapLabel(ev) + '! Hạ nó trước khi nó bỏ đi!' : 'Có VƯƠNG THÚ lang thang xuất hiện ở ' + wevMapLabel(ev) + '!'); }
        else if (nt.kind === 'merchant') { syncWevMerchant(true); toast('Một THƯƠNG NHÂN THẦN BÍ vừa dựng sạp ở quảng trường làng! Ông ta chỉ ở 15 phút.'); }
        else if (nt.kind === 'monk') toast(ev.mapId === curMapId ? 'Có tiếng rên yếu ớt đâu đây — ai đó đang GẶP NẠN ở ' + wevMapLabel(ev) + '!' : 'Nghe nói có tu sĩ GẶP NẠN ở ' + wevMapLabel(ev) + '.');
      } else {
        if (nt.kind === 'burst' && ev.mapId === curMapId) toast('Điểm linh khí bùng phát đã khép lại.');
        else if (nt.kind === 'king') { despawnWevKing(); if (ev.mapId === curMapId) toast('Vương thú đã bỏ đi mất.'); }
        else if (nt.kind === 'merchant') toast('Thương nhân thần bí đã thu sạp rời làng.');
        else if (nt.kind === 'monk' && ev.mapId === curMapId) toast('Tiếng rên của tu sĩ gặp nạn đã tắt hẳn.');
      }
    }
    if (notices.length) saveGame();
    if (wasMerchant && !WE.merchantActive(flags, now)) syncWevMerchant(false);
    // TU SĨ GẶP NẠN: lại gần điểm sáng (≤2 ô) thì mở panel lựa chọn
    // (khung panel kỳ ngộ sẵn có; chỉ mở khi panel đó đang ẩn và
    // người chơi không trong hội thoại).
    var act = WE.activeEvent(flags);
    if (act && act.kind === 'monk' && act.mapId === curMapId && !wevMonkPanelOpen && !dlg) {
      var pf = $('panelFateChoice');
      if (pf && pf.style.display !== 'block') {
        var mdx = px - (act.x * TILE + 16), mdy = py - (act.y * TILE + 16);
        if (Math.sqrt(mdx * mdx + mdy * mdy) <= TILE * 2) openWevMonkPanel();
      }
    }
    updateWevTimer();
  }
  function updateWevTimer() {
    var el = $('wevTimer');
    if (!el) return;
    var ev = (WE && flags) ? WE.activeEvent(flags) : null;
    if (!ev) { el.style.display = 'none'; return; }
    var left = Math.max(0, Math.ceil((ev.endsAt - gameNow()) / 1000));
    var mmss = Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
    var txt = '';
    if (ev.kind === 'burst') txt = 'Điểm linh khí bùng phát — ' + wevMapLabel(ev) + ' · còn ' + mmss;
    else if (ev.kind === 'king') txt = 'Vương thú ở ' + wevMapLabel(ev) + ' · còn ' + mmss;
    else if (ev.kind === 'merchant') txt = 'Thương Nhân Thần Bí ở quảng trường làng · còn ' + mmss;
    else if (ev.kind === 'monk') txt = 'Tu sĩ gặp nạn ở ' + wevMapLabel(ev) + ' · còn ' + mmss;
    setStripText(el, txt);
    el.style.display = stripWanted('wevTimer') ? 'block' : 'none';
  }
  function syncWevKing() {
    if (!WE || !ch) return;
    var ev = WE.activeEvent(flags);
    if (!ev || ev.kind !== 'king' || ev.mapId !== curMapId || ev.kingDown) return;
    if (monsters.some(function (m) { return m.wevKing; })) { wevKingSpawned = true; return; }
    var ks = WE.kingStats(ev.type);
    if (!ks) return;
    var km = makeMonster(ev.type, ev.x, ev.y, { wevKing: true, noRespawn: true });
    km.name = ks.name; km.maxHp = ks.maxHp; km.hp = ks.maxHp; km.atk = ks.atk; km.scale = 1.35;
    monsters.push(km);
    wevKingSpawned = true;
  }
  function despawnWevKing() {
    for (var i = monsters.length - 1; i >= 0; i--) if (monsters[i].wevKing) monsters.splice(i, 1);
    wevKingSpawned = false;
  }
  // NPC tạm của Thương Nhân Thần Bí: chèn vào danh sách NPC của
  // map 1 khi ông ta đang ghé, gỡ ra khi hết giờ. Danh sách NPC của
  // map là mảng dùng chung trong maps.js nên push/splice tại chỗ,
  // không gán lại mảng. Ô đứng ưu tiên (38,21) cạnh sạp chợ; bị
  // chặn thì lùi ra ô trống gần nhất trong bán kính 3.
  function syncWevMerchant(validateSpot) {
    if (!WE || !M || !M.MAPS || !M.MAPS.map1) return;
    var list = M.MAPS.map1.npcs;
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].id === WE.MERCHANT_NPC_ID) { idx = i; break; }
    var ev = WE.activeEvent(flags);
    var on = !!(ev && ev.kind === 'merchant');
    if (on && idx < 0) {
      var x = ev.x, y = ev.y;
      if (validateSpot && M.isBlockedIn(M.MAPS.map1, x, y)) {
        scan:
        for (var r = 1; r <= 3; r++) {
          for (var dx = -r; dx <= r; dx++) for (var dy = -r; dy <= r; dy++) {
            if (!M.isBlockedIn(M.MAPS.map1, ev.x + dx, ev.y + dy)) { x = ev.x + dx; y = ev.y + dy; break scan; }
          }
        }
        ev.x = x; ev.y = y;
      }
      list.push({ id: WE.MERCHANT_NPC_ID, x: x, y: y, sprite: 'thuong_nhan_ma', name: 'Thương Nhân Thần Bí', role: 'Thương nhân qua đường' });
    } else if (!on && idx >= 0) {
      list.splice(idx, 1);
    } else if (on && idx >= 0) {
      list[idx].x = ev.x; list[idx].y = ev.y;
    }
  }
  function openWevShop() {
    if (!WE || !WE.merchantActive(flags, gameNow())) { toast('Thương nhân thần bí đã rời làng rồi.'); return; }
    renderWevShop();
    $('panelWevShop').style.display = 'block';
    if (SND) SND.sfx('ui_click'); // mở hội thoại dùng ui_click (game không có hàm playSnd)
  }
  function closeWevShop() { var p = $('panelWevShop'); if (p) p.style.display = 'none'; }
  function renderWevShop() {
    var body = $('wevShopBody');
    if (!body || !WE) return;
    var ev = WE.activeEvent(flags);
    var html = '<p>Một thương nhân áo choàng kín mặt, giọng khàn khàn: "Hàng của ta không chợ nào có đâu. Ngươi đang có <b>' + (ch ? ch.linhThach : 0) + ' Linh Thạch</b> — mà ta thì chỉ ở đây một lát thôi."</p>';
    if (ev && ev.stock) {
      ev.stock.forEach(function (s) {
        var def = L.ITEMS[s.id];
        var leftN = s.stock - s.sold;
        html += '<div class="fair-row"><span>' + (def ? def.name : s.id) + ' — ' + s.price + ' Linh Thạch (còn ' + leftN + ')</span>' +
          (leftN > 0 ? '<button data-wevbuy="' + s.id + '">Mua</button>' : '<span>Đã hết</span>') + '</div>';
      });
    }
    html += '<h4>Thu mua cổ vật</h4>';
    Object.keys(WE.RELIC_PRICES).forEach(function (id) {
      var n = L.countItem(ch, id);
      var def2 = L.ITEMS[id];
      html += '<div class="fair-row"><span>' + (def2 ? def2.name : id) + ' — thu ' + WE.RELIC_PRICES[id] + ' Linh Thạch/cái (đang có ' + n + ')</span>' +
        (n > 0 ? '<button data-wevsell="' + id + '">Bán 1</button>' : '<span>—</span>') + '</div>';
    });
    body.innerHTML = html;
    Array.prototype.forEach.call(body.querySelectorAll('[data-wevbuy]'), function (b) {
      b.addEventListener('click', function () {
        var r = WE.buy(flags, ch, b.getAttribute('data-wevbuy'), gameNow());
        if (!r.ok) { toast(r.reason === 'linhThach' ? 'Không đủ Linh Thạch.' : (r.reason === 'soldout' ? 'Món này đã hết.' : 'Thương nhân đã rời làng.')); return; }
        toast('Mua ' + r.name + ' với ' + r.price + ' Linh Thạch.');
        if (SND) SND.sfx('shop_buy'); // QA 20:46: playSnd không tồn tại, gọi là ném lỗi trước saveGame
        updateHUD(); renderWevShop(); saveGame();
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-wevsell]'), function (b) {
      b.addEventListener('click', function () {
        var r = WE.sellRelic(flags, ch, b.getAttribute('data-wevsell'), 1, gameNow());
        if (!r.ok) { toast('Không bán được.'); return; }
        toast('Bán ' + r.name + ' +' + r.gain + ' Linh Thạch.');
        if (SND) SND.sfx('shop_sell'); // QA 20:46: như trên — phải là SND.sfx, không phải playSnd
        updateHUD(); renderWevShop(); saveGame();
      });
    });
  }
  function openWevMonkPanel() {
    var pf = $('panelFateChoice');
    if (!pf || !WE) return;
    var item = WE.rescueItemFor(ch);
    $('fateChoiceTitle').textContent = 'Tu Sĩ Gặp Nạn';
    $('fateChoiceText').textContent = WE.MONK_STORY;
    var btns = $('fateChoiceBtns');
    btns.innerHTML = '';
    var b1 = document.createElement('button');
    if (item) {
      b1.textContent = 'Cứu người (dùng 1 ' + (L.ITEMS[item] ? L.ITEMS[item].name : item) + ')';
      b1.addEventListener('click', function () {
        var r = WE.rescue(flags, ch, gameNow());
        hideWevMonkPanel();
        if (r.ok) {
          var tv2 = AC ? AC.guardGain('realmTuVi', r.tuVi) : r.tuVi;
          ch.tuVi = Math.min(ch.tuViMax, ch.tuVi + tv2);
          var lt2 = AC ? AC.guardGain('quest', r.linhThach) : r.linhThach;
          ch.linhThach += lt2;
          toast('Đã cứu tu sĩ họ Từ! +' + tv2 + ' tu vi, +' + lt2 + ' Linh Thạch.');
          showDialogueText('Tu Sĩ Họ Từ', [r.line], null);
          if (SND) SND.sfx('quest_complete'); // QA 20:46: playSnd không tồn tại, gọi là ném lỗi trước saveGame
          updateHUD(); saveGame();
        }
      });
    } else {
      b1.textContent = 'Cứu người (túi không có món hồi phục nào)';
      b1.disabled = true;
    }
    btns.appendChild(b1);
    var b2 = document.createElement('button');
    b2.textContent = 'Bỏ qua, đi tiếp';
    b2.addEventListener('click', function () {
      var r2 = WE.ignoreMonk(flags, gameNow());
      hideWevMonkPanel();
      if (r2.ok) { toast(r2.line); saveGame(); }
    });
    btns.appendChild(b2);
    pf.style.display = 'block';
    wevMonkPanelOpen = true;
    if (SND) SND.sfx('ui_click'); // mở hội thoại dùng ui_click (game không có hàm playSnd)
  }
  function hideWevMonkPanel() {
    var pf = $('panelFateChoice');
    if (pf) pf.style.display = 'none';
    wevMonkPanelOpen = false;
  }

  // ---------- Panel Chợ Phiên Thanh Khê (js/market-fair.js) ----------
  function openTidePanel() {
    renderTidePanel();
    $('panelTide').style.display = 'block';
  }
  function renderTidePanel() {
    if (!TD || !ch || !$('tideBody')) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var now = new Date(gameNow());
    var cur = TD.seasonOf(now);
    var nx = TD.nextSeasonOf(now);
    var st = TD.questStatus(qs, now);
    // QA52 (mục 52 hàng chờ, phương án (a)): đang dở việc tiết cũ
    // thì panel không được ghi "Đang mở nhận" cho việc tháng này —
    // việc tháng này chỉ mở sau khi xong việc cũ (availableQuestId
    // đã chặn), nên hiện rõ dòng đang dở ở đầu panel.
    var actTide52 = TD.activeQuestId(qs);
    var tideBusy52 = (actTide52 && actTide52 !== st.questId && L.QUESTS[actTide52])
      ? '<p><b>Đang dở việc tiết: ' + esc(L.QUESTS[actTide52].title) + '</b> — về gặp ' + esc(TD.QUEST_META[actTide52].giverName) + ' để trả trước đã; việc tiết tháng này chỉ mở nhận sau khi xong việc đó.</p>' : '';
    var q = L.QUESTS[st.questId];
    var stateText = st.state === 'turned_in' ? 'Đã trả xong — tiết này quay lại sau 4 tháng.'
      : st.state === 'done_waiting' ? 'Đã làm xong — về gặp ' + esc(st.giverName) + ' ở làng để trả.'
      : st.state === 'active' ? 'Đang làm — xem tiến độ ở panel Nhiệm vụ.'
      : 'Đang mở nhận ở ' + esc(st.giverName) + ' (làng Thanh Khê, map 1).';
    var rows = TD.SEASONS.map(function (s) {
      var mark = s.id === cur.id ? ' <b>(tiết này)</b>' : '';
      return '<div class="qitem"><b>Tiết ' + esc(s.name) + '</b>' + mark + ' — ' + esc(s.effect) + '<br><i>' + esc(s.lore) + '</i></div>';
    }).join('');
    var html = '<p><b>' + esc(cur.label) + '</b> — ' + esc(cur.def.effect) + '</p>'
      + tideBusy52
      + '<p>Tiết tới: <b>Tiết ' + esc(nx.name) + '</b> (tháng ' + nx.month + '/' + nx.year + '). Chu kỳ 4 tiết xoay theo tháng dương lịch: Linh Tố (1/5/9) · Thú Dữ (2/6/10) · Đăng Hoa (3/7/11) · Tĩnh Tu (4/8/12).</p>'
      + '<div class="qitem"><b>Việc tiết tháng này: ' + esc(q.title) + '</b> — ' + esc(q.desc) + '<br>Người giao: ' + esc(st.giverName) + ' · Thưởng: ' + q.rewards.linhThach + ' Linh Thạch, +' + (q.rewards.tuVi || 0) + ' tu vi' + ((q.rewards.items && q.rewards.items.length) ? ', ' + q.rewards.items.map(function (it) { return esc(L.ITEMS[it.id] ? L.ITEMS[it.id].name : it.id) + ' ×' + it.n; }).join(', ') : '') + '.<br>Trạng thái: ' + stateText + '</div>'
      + rows
      + '<p><i>Việc tiết mỗi việc chỉ làm một lần; bỏ lỡ một tiết thì tiết đó quay lại sau 4 tháng. Việc đã nhận rồi thì sang tháng sau vẫn trả được.</i></p>';
    $('tideBody').innerHTML = html;
  }
  function openFairPanel() {
    renderFairPanel();
    $('panelFair').style.display = 'block';
  }
  function renderFairPanel() {
    if (!FAIR || !ch || !$('fairBody')) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var now = new Date(gameNow());
    var f = FAIR.ensure(flags, now);
    var open = FAIR.isOpen(now);
    var st = FAIR.stallsFor(now);
    var atVillage = curMapId === FAIR.KEEPER.mapId;
    var html = '<p>Chợ phiên của thương đội Mã Vạn Lai — <b>mỗi Chủ nhật, tại quảng trường làng Thanh Khê (map 1)</b>, Lục Tiểu Lục coi sạp. 6 sạp xoay vòng theo tuần, bán hết trong ngày thì thôi; ngoài Chủ nhật chỉ xem trước sạp của phiên tới.</p>';
    html += '<div class="qitem"><b>Phiên ' + (open ? 'ĐANG MỞ hôm nay' : 'tới: Chủ nhật ' + st.date.getDate() + '/' + (st.date.getMonth() + 1)) + '</b> · Linh Thạch của bạn: <b>' + (ch.linhThach | 0) + '</b>' +
      (!atVillage ? '<br><span style="color:#b03a2e"><b>Bạn đang không ở làng — về quảng trường làng (map 1) mới mua/bán được.</b></span>' : '') + '</div>';
    html += '<div class="qitem"><b>Sạp phiên (' + st.slots.length + ' món):</b><br>' + st.slots.map(function (slot) {
      var rem = FAIR.remaining(flags, slot.id, now);
      var canBuy = open && atVillage && rem > 0 && (ch.linhThach | 0) >= slot.price;
      return esc(FAIR.itemName(slot.id)) + (slot.fairOnly ? ' <i>(chỉ có ở phiên)</i>' : '') +
        ' — ' + slot.price + ' Linh Thạch · còn ' + rem + '/' + slot.stock +
        (canBuy ? ' <button data-fair-buy="' + slot.id + '">Mua</button>' :
          ' <button disabled>' + (!open ? 'Ngoài phiên' : (!atVillage ? 'Xa làng' : (rem <= 0 ? 'Hết hàng' : 'Thiếu Linh Thạch'))) + '</button>');
    }).join('<br>') + '</div>';
    var bbHtml = FAIR.BUYBACK.map(function (def) {
      var have = L ? L.countItem(ch, def.id) : 0;
      var sold = f.buyback[def.id] | 0;
      var ltLeft = FAIR.BUYBACK_CAP_LT - (f.buybackLt | 0);
      var canSell = open && atVillage && have > 0 && sold < def.cap && ltLeft >= def.price;
      return esc(FAIR.itemName(def.id)) + ' — phiên thu ' + def.price + ' Linh Thạch/món · đã bán ' + sold + '/' + def.cap +
        ' · bạn có ' + have +
        (canSell ? ' <button data-fair-sell="' + def.id + '">Bán 1</button>' : ' <button disabled>' + (!open ? 'Ngoài phiên' : (!atVillage ? 'Xa làng' : (have <= 0 ? 'Không có hàng' : (sold >= def.cap ? 'Hết hạn mức món' : 'Hết hạn mức phiên')))) + '</button>');
    }).join('<br>');
    html += '<div class="qitem"><b>Thu mua phiên (hạn mức cả phiên: ' + FAIR.BUYBACK_CAP_LT + ' Linh Thạch, đã thu ' + (f.buybackLt | 0) + '):</b><br>' + bbHtml + '</div>';
    $('fairBody').innerHTML = html;
    var buys = $('fairBody').querySelectorAll('[data-fair-buy]');
    for (var i = 0; i < buys.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var r = FAIR.buy(flags, ch, btn.getAttribute('data-fair-buy'), new Date(gameNow()), curMapId);
          if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Chợ phiên: đã mua ' + r.name + ' −' + r.price + ' Linh Thạch.'); }
          else toast('Không mua được: ' + r.reason + '.');
          updateHUD(); saveGame(); renderFairPanel();
        });
      })(buys[i]);
    }
    var sells = $('fairBody').querySelectorAll('[data-fair-sell]');
    for (var j = 0; j < sells.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var raw = FAIR.sellback(flags, ch, btn.getAttribute('data-fair-sell'), 1, new Date(gameNow()), curMapId);
          var gain = raw.ok && AC ? AC.guardGain('sell', raw.gain) : (raw.ok ? raw.gain : 0);
          if (raw.ok && AC && gain !== raw.gain) { ch.linhThach -= (raw.gain - gain); }
          if (raw.ok) { if (SND) SND.sfx('shop_sell'); toast('Chợ phiên: đã bán ' + raw.n + ' ' + raw.name + ' (+' + gain + ' Linh Thạch).'); }
          else toast('Không bán được: ' + raw.reason + '.');
          updateHUD(); saveGame(); renderFairPanel();
        });
      })(sells[j]);
    }
  }
  function openSeasonPanel() {
    renderSeasonPanel();
    $('panelSeasonBoard').style.display = 'block';
  }
  function renderSeasonPanel() {
    if (!SB || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var now = Date.now();
    var live = SB.liveBoard(flags, now);
    var html = '<p>Bảng đá ở quảng trường map 3, do thư lại Thẩm Ký giữ. Điểm mùa: Đại Hội theo hạng (quán quân 100 · á quân 60 · hạng ba 40 · hạng tư 25 · tứ kết 15 · tham gia 5), Thú Triều 10/đợt giữ được + 30 khi giữ trọn 6 đợt, Bí Cảnh 20/lượt hoàn thành. Điểm trong mùa chỉ để xếp hạng — hết mùa mới đổi thành thưởng Linh Thạch.</p>';
    html += '<div class="qitem"><b>' + esc(live.seasonLabel) + ' — bạn hạng ' + live.playerRank + '/11 · ' + live.playerScore + ' điểm</b>' +
      '<br>Đại Hội ' + live.current.tourn + ' · Thú Triều ' + live.current.tide + ' · Bí Cảnh ' + live.current.realm +
      ' (lượt ghi điểm: Đại Hội ' + live.current.counts.tourn + ' · Thú Triều ' + live.current.counts.tide + ' · Bí Cảnh ' + live.current.counts.realm + ')</div>';
    html += '<div class="qitem"><b>Bảng trực tiếp mùa này</b><br>' + live.rows.map(function (r) {
      return r.rank + '. ' + esc(r.name) + (r.isPlayer ? ' (bạn)' : '') + ' — ' + r.score + ' điểm';
    }).join('<br>') + '</div>';
    var finished = SB.unclaimedFinished(flags, now);
    if (finished.length) {
      html += '<div class="qitem"><b>Thưởng mùa đã kết thúc đang chờ nhận:</b><br>' + finished.map(function (k) {
        var hist = SB.ensure(flags, now).history[k];
        var fr = SB.finalRank(k, hist.total);
        return esc(SB.seasonNameOf(k)) + ' — bạn hạng ' + fr.rank + ' với ' + hist.total + ' điểm → thưởng ' + SB.rewardForRank(fr.rank, hist.total) + ' Linh Thạch ' +
          '<button data-season-claim="' + esc(k) + '">Nhận thưởng mùa này</button>';
      }).join('<br>') + '</div>';
    } else {
      html += '<p>Chưa có mùa nào kết thúc mà còn thưởng chưa nhận. Hết mùa, quay lại đây nhận thưởng theo hạng cuối mùa.</p>';
    }
    var claimedKeys = Object.keys(SB.ensure(flags, now).claimed || {});
    if (claimedKeys.length) {
      html += '<p>Đã nhận: ' + claimedKeys.sort().map(function (k) {
        var c = SB.ensure(flags, now).claimed[k];
        return esc(SB.seasonNameOf(k)) + ' (hạng ' + c.rank + ', +' + c.reward + ' Linh Thạch)';
      }).join(' · ') + '.</p>';
    }
    $('seasonBody').innerHTML = html;
    var btns = $('seasonBody').querySelectorAll('[data-season-claim]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-season-claim');
          var res = SB.claim(flags, key, ch, gameNow());
          if (res.ok) {
            toast('Bảng mùa ' + res.seasonLabel + ': bạn hạng ' + res.rank + ' — nhận +' + res.reward + ' Linh Thạch!');
            if (SND) SND.sfx('quest_complete');
          } else {
            toast('Chưa nhận được thưởng mùa này.');
          }
          updateHUD(); saveGame(); renderSeasonPanel();
        });
      })(btns[i]);
    }
  }
  // ---------- Panel Bia Truyền Kỳ Thanh Sơn (js/legend-board.js) ----------
  function openLegendPanel() {
    renderLegendPanel();
    $('panelLegend').style.display = 'block';
  }
  function renderLegendPanel() {
    if (!LG || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var list = LG.entries(flags);
    var html = '<p>Bia đá ở quảng trường Chân Núi Thanh Phong (map 3), do thư lại Thẩm Ký giữ — cùng người giữ Bảng Mùa, nhưng bia này KHÔNG reset theo mùa và KHÔNG thưởng: nó chỉ khắc dấu mốc cả đời. Độ kiếp thành công, quán quân Đại Hội, thủ thành thắng trọn, lễ bái sư, lần đầu hạ boss — mỗi mốc khắc đúng 1 lần.</p>';
    if (list.length) {
      html += '<div class="qitem"><b>Dấu mốc của bạn (' + list.length + ')</b><br>' + list.map(function (e) {
        return esc(e.title) + ' — ' + esc(e.detail) + (e.at ? ' · ' + esc(LG.fmtDate(e.at)) : '');
      }).join('<br>') + '</div>';
    } else {
      html += '<div class="qitem">Bia của bạn còn trắng — độ kiếp, vô địch một kỳ Đại Hội, giữ trọn một phiên Thú Triều, bái nhập tông môn hay hạ một boss thế giới lần đầu, Thẩm Ký sẽ khắc ngay lên đây.</div>';
    }
    html += '<div class="qitem"><b>Dòng khắc cũ (đã mờ)</b><br>' + LG.OLD_LINES.map(function (o) { return esc(o.text); }).join('<br>') + '</div>';
    var hall = (flags.tourn && Array.isArray(flags.tourn.hall)) ? flags.tourn.hall : [];
    if (hall.length) {
      html += '<div class="qitem"><b>Quán quân Đại Hội các kỳ gần nhất (sổ của Thẩm Ký)</b><br>' + hall.map(function (h) {
        var bn = (TOURN && TOURN.bracketById(h.bracket)) ? TOURN.bracketById(h.bracket).name : h.bracket;
        return esc(h.champion) + (h.isPlayer ? ' (bạn)' : '') + ' — ' + esc(bn);
      }).join('<br>') + '</div>';
    }
    $('legendBody').innerHTML = html;
  }
  // MINIMAP — BẢN ĐỒ THẾ GIỚI (mục 25): chỉ liệt kê 14 map thế giới,
  // không liệt kê map instance. Tên map chưa tới + không kề cổng từ
  // map đã tới thì ẩn thành "vùng chưa khám phá" (module quyết trạng
  // thái, panel chỉ in ra). Không có nút dịch chuyển nhanh: bản đồ
  // chỉ để xem — đi map vẫn phải đi bộ qua cổng như luật game.
  function openWorldPanel() {
    renderWorldPanel();
    $('panelWorldMap').style.display = 'block';
  }
  function renderWorldPanel() {
    if (!MM || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var rank = (M && M.realmRankOf) ? M.realmRankOf(ch) : 0;
    var list = MM.worldList(M.MAPS, flags, curMapId, rank);
    var html = '<p>Chạm bản đồ nhỏ góc trên-phải để mở bảng này bất cứ lúc nào. ' +
      'Chấm vàng là bạn, chấm xanh là người dân, chấm cam là cổng, chấm đỏ là quái. ' +
      'Bản đồ chỉ để xem đường — muốn sang map khác vẫn phải đi bộ qua cổng.</p>' +
      '<p><b>Chú thích:</b> <span style="color:#b8860b">●</span> bạn · ' +
      '<span style="color:#1e7fb8">●</span> người dân · ' +
      '<span style="color:#d2691e">●</span> cổng · ' +
      '<span style="color:#c0392b">●</span> quái</p>';
    html += list.map(function (e) {
      var st = e.status === 'current' ? 'Đang ở đây' :
        e.status === 'visited' ? 'Đã tới' :
        e.status === 'adjacent' ? 'Đã mở — kề map đã tới' :
        e.status === 'gated' ? 'Chưa mở — cần ' + esc(e.gateName || 'cảnh giới cao hơn') :
        'Vùng chưa khám phá';
      var nm = e.status === 'unknown' ? '???' : esc(e.name);
      return '<div class="qitem"><b>' + nm + '</b> — ' + st + (e.status === 'current' ? ' (' + esc(curMap().name) + ')' : '') + '</div>';
    }).join('');
    var ports = MM.portalsOf(curMap());
    if (ports.length) {
      html += '<div class="qitem"><b>Cổng từ ' + esc(curMap().name) + ':</b><br>' + ports.map(function (p) {
        var dest = M.MAPS[p.to];
        return '→ ' + esc(dest ? dest.name : p.to) + (p.gate ? ' (cần ' + esc(p.gate.name) + ')' : '');
      }).join('<br>') + '</div>';
    }
    $('worldMapBody').innerHTML = html;
  }
  function tideRewardText(list) {
    return (list || []).map(function (r) {
      if (r.kind === 'linhThach') return r.n + ' Linh Thạch';
      if (r.kind === 'merit') return r.n + ' điểm cống hiến';
      if (r.kind === 'item') return (L.ITEMS[r.id] ? L.ITEMS[r.id].name : r.id) + (r.n > 1 ? ' ×' + r.n : '');
      return '';
    }).filter(Boolean).join(' · ');
  }
  function openBeastTidePanel() {
    renderBeastTidePanel();
    $('panelBeastTide').style.display = 'block';
  }
  function renderBeastTidePanel() {
    if (!BT || !ch) return;
    var now = Date.now();
    var st = BT.status(flags, ch, now);
    var html = '';
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function clock(ms) { var d = new Date(ms); function p(n) { return (n < 10 ? '0' : '') + n; } return p(d.getHours()) + ':' + p(d.getMinutes()); }
    html += '<p>Phong ấn giếng cổ chỉ vá tạm — thú triều quay lại đánh <b>Nam Môn làng Thanh Khê</b> theo đợt. Mười tông môn cử đệ tử về giữ cổng cùng bạn. <b>Điều kiện: từ Trúc Cơ trở lên.</b></p>';
    if (st.session) {
      html += '<p><b>Đang trong phiên thú triều</b> (mở nhận nhiệm vụ ' + clock(st.session.start) + ' – ' + clock(st.session.end) + '). Mỗi ngày 2 phiên: 11:30 và 20:30.</p>';
    } else if (st.next) {
      html += '<p>Ngoài phiên. Phiên tới: ' + (st.next.dayOffset ? 'ngày mai ' : '') + clock(st.next.start) + ' (mỗi ngày 2 phiên: 11:30 và 20:30, phiên 45 phút).</p>';
    }
    if (!st.elig.ok) {
      html += '<p style="color:#b03a2e"><b>Chưa đủ cảnh giới:</b> ' + esc(st.elig.needText) + '</p>';
    } else if (st.playedThis && !st.run) {
      html += '<p>Phiên này bạn đã thủ thành rồi — mỗi phiên 1 lượt. Chờ phiên sau.</p>';
    }
    var run = st.run;
    if (run) {
      var aliveN = run.allies.filter(function (a) { return a.alive; }).length;
      html += '<div class="qitem"><b>Lượt thủ thành đang diễn ra — Đợt ' + run.wave + '/' + BT.WAVE_COUNT + '</b><br>' +
        'Cổng Nam Môn: <b>' + run.gateHp + '/' + run.gateMax + '</b> · Đã giữ sạch: ' + run.wavesCleared + ' đợt · Hạ: ' + run.kills + ' (đồng minh hạ ' + run.allyKills + ') · Thú phá cổng: ' + run.breaches + '<br>' +
        'Đệ tử còn đứng: <b>' + aliveN + '/10</b><br>' +
        run.allies.map(function (a) {
          return esc(a.name) + ' (' + esc(a.sectName) + ') ' + (a.alive ? Math.max(0, a.hp) + '/' + a.maxHp + ' Máu' : '<span style="color:#b03a2e">đã rút</span>');
        }).join('<br>') + '</div>';
    } else {
      html += '<div class="qitem"><b>Thưởng theo thành tích</b><br>' +
        'Mỗi đợt giữ sạch: ' + esc(tideRewardText(BT.rewardsFor(1, 'lose'))) + ' (cộng dồn theo đợt)<br>' +
        'Thắng trọn 6 đợt: ' + esc(tideRewardText(BT.rewardsFor(6, 'win'))) + '<br>' +
        'Thua sớm: tính theo số đợt đã giữ; chưa giữ được đợt nào: ' + esc(tideRewardText(BT.rewardsFor(0, 'lose'))) + '<br>' +
        'Yêu vương đợt 6 (' + esc(BT.LEADER_NAME) + '): Yêu Đan Cấp 1 chắc chắn rơi, thêm Cấp 2 (60–90%) và Cấp 3 (15–35%) theo cảnh giới của bạn.<br>' +
        'Quái thú triều không rơi Linh Thạch — mọi thưởng đi qua sổ thủ thành của Chấp Sự.</div>';
    }
    var spt = (SECTP && typeof SECTP.pointsOf === 'function') ? SECTP.pointsOf(ch) : 0;
    html += '<p>Thống kê: đã thủ thành <b>' + st.stats.runs + '</b> lượt · thắng <b>' + st.stats.wins + '</b> · đợt cao nhất giữ được: <b>' + st.stats.bestWave + '/6</b>' +
      (st.title ? ' · Danh hiệu: <b>' + esc(st.title) + '</b>' : ' · Danh hiệu: thắng 2 lần được "Hộ Thôn Tu Sĩ", 5 lần được "Trấn Sơn Thủ Hộ"') + '<br>' +
      'Điểm Cống Hiến tông môn hiện có: <b>' + spt + '</b>' + (st.merit > 0 ? ' · Sổ Thủ Thành đang giữ hộ: <b>' + st.merit + '</b> điểm (chưa bái nhập tông môn)' : '') + '</p>';
    if (flags.tide && flags.tide.lastResult) {
      var lr = flags.tide.lastResult;
      html += '<p>Kết quả lượt gần nhất: <b>' + (lr.outcome === 'win' ? 'THẮNG — giữ trọn 6 đợt' : 'Thua — giữ được ' + lr.wavesCleared + '/6 đợt') + '</b> — thưởng: ' + esc(tideRewardText(lr.rewards)) + '.</p>';
    }
    $('tideBody').innerHTML = html;
    var cj = BT.canJoin(flags, ch, now);
    $('btnTideJoin').style.display = cj.ok ? '' : 'none';
    $('btnTideForfeit').style.display = run ? '' : 'none';
  }
  // Q3: bắt đầu bài bay thử — được bay TẠM bằng phi kiếm của tông cho tới
  // khi qua đủ 5 mốc / hết giờ / rời map 3.
  function startFlyTrial() {
    if (!FLIGHT || !qs.accepted.q_ngu_kiem_3 || qs.accepted.q_ngu_kiem_3.done) return { ok: false, reason: 'no_quest' };
    // MỤC 27: bài bay thử là của ngự kiếm (tông cho mượn phi kiếm) nên
    // bắt buộc về chế độ kiếm trước khi cất cánh thử.
    if (flyMode !== 'sword') setFlyMode('sword');
    if (curMapId !== FLIGHT.TRIAL_MAP) { toast('Bài bay thử chỉ diễn ra ở trấn trên mây.'); return { ok: false, reason: 'wrong_map' }; }
    flyTrial = { next: 0, timeLeft: FLIGHT.TRIAL_SECONDS };
    qs.accepted.q_ngu_kiem_3.progress = 0;
    closeDialogue();
    tryTakeoff();
    renderQuestPanel();
    return { ok: true };
  }
  function tickFlyTrial(dt) {
    if (!flyTrial || !FLIGHT) return;
    if (curMapId !== FLIGHT.TRIAL_MAP) { flyTrial = null; return; }
    flyTrial.timeLeft -= dt;
    if (flyTrial.timeLeft <= 0) {
      flyTrial = null;
      toast('Hết giờ bài bay thử! Về gặp đại diện tông môn để bay lại.');
      if (flying && !flags.swordFlight) landPlayer(true);
      renderQuestPanel();
      return;
    }
    if (!flying || flyMode !== 'sword') return; // cột mốc chỉ tính khi ĐANG BAY bằng ngự kiếm (mục 27: bay pháp bảo/linh thú giữa bài thử không tính mốc)
    if (FLIGHT.checkpointHit(px, py, flyTrial.next)) {
      flyTrial.next++;
      var st = qs.accepted.q_ngu_kiem_3;
      if (st) st.progress = flyTrial.next;
      if (flyTrial.next >= FLIGHT.CHECKPOINTS.length) {
        flyTrial = null;
        if (st) st.done = true;
        toast('Bay đủ 5 cột mốc! Về gặp đại diện tông môn để nhận phép Ngự Kiếm.');
      } else {
        toast('Cột mốc ' + flyTrial.next + '/5 — mốc tiếp: ' + FLIGHT.CHECKPOINTS[flyTrial.next].name + '.');
      }
      renderQuestPanel();
    }
  }
  function checkPortal() {
    if (portalCooldown > 0) return;
    var ptx = Math.floor(px / TILE), pty = Math.floor(py / TILE);
    var portals = curMap().portals || [];
    for (var i = 0; i < portals.length; i++) {
      if (portals[i].x === ptx && portals[i].y === pty) {
        // Cổng khóa theo HẠNG CẢNH GIỚI (trường gate trên portal, chặng
        // cảnh giới cao của Thập Vạn Đại Sơn — js/maps.js REALMS): hạng
        // của nhân vật lấy qua M.realmRankOf (đọc ch.realmRank nếu hệ
        // cảnh giới cao đã ghi, nếu chưa thì suy từ ch.realm/ch.tier).
        // Chiều về không bao giờ mang gate nên không bị khóa ngược.
        var pg = portals[i].gate;
        if (pg && M && M.realmRankOf && ch && M.realmRankOf(ch) < pg.rank) {
          var nowMs = Date.now();
          if (nowMs - gateWarnAt > 2500) {
            gateWarnAt = nowMs;
            toast('Cần đột phá ' + pg.name + ' mới qua được.');
          }
          return;
        }
        // Cổng PHÂN TẦNG LUYỆN KHÍ (chuỗi Đại Sơn map 5/6/7, trường
        // minTier trên portal): hạng cảnh giới (gate) không phân biệt
        // được các tầng trong cùng Luyện Khí nên cần khóa riêng này.
        // Chiều về không mang minTier nên không bao giờ khóa ngược.
        if (portals[i].minTier && ch && (ch.tier || 0) < portals[i].minTier) {
          var nowMsT = Date.now();
          if (nowMsT - gateWarnAt > 2500) {
            gateWarnAt = nowMsT;
            toast('Cần ' + (portals[i].reqLabel || ('Luyện Khí tầng ' + portals[i].minTier)) + ' mới qua được cổng này.');
          }
          return;
        }
        // Cổng SƠN MÔN (trường reqSect trên portal, tích hợp V5): chỉ
        // đệ tử của đúng tông mới qua được cổng vào sơn môn của tông
        // đó. Chiều về (từ sơn môn ra map 3) không mang reqSect nên
        // không bao giờ khóa ngược người đã vào.
        if (portals[i].reqSect && (!flags || flags.sectJoined !== portals[i].reqSect)) {
          var nowMsS = Date.now();
          if (nowMsS - gateWarnAt > 2500) {
            gateWarnAt = nowMsS;
            var sectNameS = portals[i].reqSectName;
            if (!sectNameS && typeof SECT !== 'undefined' && SECT && SECT.sectById) {
              var sdS = SECT.sectById(portals[i].reqSect);
              if (sdS) sectNameS = sdS.name;
            }
            toast('Cần bái nhập ' + (sectNameS || 'tông môn này') + ' mới qua được cổng sơn môn.');
          }
          return;
        }
        switchMap(portals[i].to, portals[i].tx, portals[i].ty);
        return;
      }
    }
  }
  // ---------- Sự kiện thú dữ tấn công làng (đợt quái ở bãi hoang nam map 1) ----------
  var EV_SPOTS = [[69, 89], [71, 90], [73, 89], [70, 91], [72, 91], [74, 90], [68, 90], [71, 88]]; // V7-EXPAND (tích hợp A 01/11/2026): bãi nam map1 = số V3 + neo map1 (28,25) — cả 8 điểm đã dò: đi được, thuộc Khu Sói Con cạnh Nam Môn (hồ sơ story-map-linkage G-3/S-3)
  function spawnEventWave() {
    var wave = L.beastWave(flags);
    if (!wave) return;
    monsters = monsters.filter(function (m) { return !m.ev || m.dying; });
    wave.forEach(function (type, i) {
      var s = EV_SPOTS[i % EV_SPOTS.length];
      monsters.push(makeMonster(type, s[0], s[1], { ev: true, noRespawn: true }));
    });
    toast('Thú dữ tấn công làng — đợt ' + flags.event.wave + '!');
  }
  function onMonsterKilled(m) {
    // Thành tựu sớm (20:22): cờ hạ TINH ANH đầu — mốc đọc từ đây.
    if (m.elite) { flags.achEv = flags.achEv || {}; flags.achEv.elite = 1; }
    // NGỰ KIẾM Q2: hạ Hình Nhân Kiếm Khí = qua bài Thử Kiếm Đài (chờ trả).
    if (m.duelFly && qs.accepted.q_ngu_kiem_2 && !qs.accepted.q_ngu_kiem_2.done) {
      qs.accepted.q_ngu_kiem_2.progress = 1;
      qs.accepted.q_ngu_kiem_2.done = true;
      toast('Hình Nhân Kiếm Khí đã gục! Về gặp đại diện tông môn để trả nhiệm vụ Thử Kiếm Đài.');
      renderQuestPanel();
    }
    // ĐẠI HỘI: hạ đệ tử đối thủ trên võ đài = thắng trận hiện tại.
    if (m.tourn && TOURN) onTournMatchEnd(TOURN.reportWin(flags, ch.name), m);
    // HỘ TỐNG: hạ quái phục kích — sạch đợt thì xe lăn tiếp (luật ở
    // js/escort.js; quái phục kích không rơi Linh Thạch trực tiếp,
    // mọi Linh Thạch qua tiền công giao hàng).
    if (m.escort && ESC) {
      var eadv = ESC.noteAmbushKill(flags);
      if (eadv && eadv.cleared) {
        toast('Dẹp sạch phục kích! Đoàn xe lại lăn bánh.');
        saveGame();
        if ($('panelEscort').style.display === 'block') renderEscortPanel();
      }
    }
    // THÚ TRIỀU: đếm đóng góp hạ thú triều; YÊU VƯƠNG đầu đàn rơi Yêu
    // Đan co theo cảnh giới (beast-tide.js lăn bảng), phát ngay tại chỗ.
    if (m.tide && BT) {
      BT.noteKill(flags, { leader: !!m.tideLeader });
      if (m.tideLeader) {
        var trew = BT.rollLeaderRewards(ch, Math.random);
        toast(BT.LEADER_NAME + ' gục ngã! Đầu đàn đã chết, bầy thú mất vía.');
        grantTideRewards(trew);
      }
    }
    if (SND) {
      SND.voice(m.type, 'death', { vol: sndVol(distToM(m)), elite: !!m.elite, boss: !!m.boss });
      if (m.boss) SND.bossFight(false);
    }
    if (m.ev) {
      var left = monsters.some(function (o) { return o.ev && o !== m && !o.dying && o.hp > 0; });
      if (!left && flags.event && flags.event.active) {
        var adv = L.advanceBeastWave(flags);
        if (adv === 'done') toast('Đã đánh đuổi hết thú dữ! Về gặp A Hổ ở cổng Nam Môn.');
        else if (adv) spawnEventWave();
      }
    }
    // Boss thế giới: ghi mốc chết theo GIỜ THẬT (chu kỳ hồi sinh chạy từ đây,
    // lưu trong save) + thông báo hạ boss. Boss cốt truyện Sơn Quân cũng ghi
    // mốc để khi trả nhiệm vụ chương 7, chu kỳ thế giới bắt đầu từ lần hạ đó.
    if (BOS && m.worldBoss) {
      var bdefK = BOS.bossById(m.worldBoss);
      BOS.recordKill(flags, m.worldBoss, gameNow()); // đồng hồ đơn điệu: lùi giờ không làm boss hồi sinh sớm
      // THIÊN 5 ch.29 (js/thien5.js): hạ Cổ Mãng Vương = bằng chứng vụ án đan độc.
      if (THIEN5) { var bq5 = THIEN5.noteBossKill(qs, m.worldBoss); if (bq5.questDone) toast('Nhiệm vụ chính đã xong: Sào mãng ở Tâm Phế Tích — về gặp đại diện tông để trả.'); }
      // BIA TRUYỀN KỲ (js/legend-board.js): lần đầu hạ boss mới khắc bia.
      if (LG && bdefK) { var lgBoss = LG.noteBossFirst(flags, m.worldBoss, bdefK.name, gameNow()); if (lgBoss.ok) toast('Bia Truyền Kỳ: khắc thêm dấu mốc — lần đầu hạ ' + bdefK.name + '!'); }
      delete bossAnnounced[m.worldBoss];
      if (bdefK) {
        var rsK = BOS.stateOf(bdefK, flags, qs, Date.now()).respawnAt;
        bossAnnounce('Hạ boss! ' + ch.name + ' đã hạ ' + bdefK.name + ' — hồi sinh lúc ' + BOS.fmtClock(rsK) + ' tại ' + bdefK.lairName + '.');
      }
      saveGame();
    } else if (BOS && m.boss && m.type === 'son_quan') {
      if (BOS.deathOf(flags, 'son_quan') == null) { BOS.recordKill(flags, 'son_quan', Date.now()); saveGame(); }
      // BIA TRUYỀN KỲ: Sơn Quân là boss cốt truyện chương 7 — lần đầu hạ cũng khắc bia như boss thế giới.
      if (LG) { var lgSq = LG.noteBossFirst(flags, 'son_quan', 'Sơn Quân', gameNow()); if (lgSq.ok) toast('Bia Truyền Kỳ: khắc thêm dấu mốc — lần đầu hạ Sơn Quân!'); }
    }
    // THIÊN CƠ ĐỒ GIÁM (js/bestiary.js): funnel hạ quái duy nhất —
    // boss thế giới chỉ mở trang boss, boss cốt truyện vừa tính số
    // hạ loài vừa mở trang boss, quái thường chỉ tính số hạ loài.
    if (BX) {
      if (m.worldBoss) BX.noteKill(flags, m.type, { worldBoss: true, bossId: m.worldBoss });
      else if (m.boss) BX.noteKill(flags, m.type, { bossId: m.type });
      else BX.noteKill(flags, m.type);
    }
    // SỰ KIỆN NGẪU NHIÊN (js/world-events.js): cùng phễu hạ quái —
    // vương thú nhận thưởng riêng; hạ quái TRONG vòng bùng phát nhận
    // tu vi (nguồn tu vi hạ quái duy nhất của game) + lăn hạt giống;
    // mọi lần hạ ở map cày lăn cổ vật vùi lấp 1%. Quái sự kiện (phục
    // kích/thú triều/võ đài) không tính.
    if (WE && ch && !m.escort && !m.tide && !m.tourn) {
      if (m.wevKing) {
        var krw = WE.noteKingKilled(flags, gameNow(), Math.random);
        if (krw) {
          var klt = AC ? AC.guardGain('monster', krw.linhThach) : krw.linhThach;
          ch.linhThach += klt;
          if (krw.yeuDan) L.addItem(ch, krw.yeuDan, 1);
          toast('Hạ VƯƠNG THÚ! +' + klt + ' Linh Thạch' + (krw.yeuDan ? ' + ' + (L.ITEMS[krw.yeuDan] ? L.ITEMS[krw.yeuDan].name : 'Yêu Đan') : '') + '!');
          if (SND) SND.sfx('quest_complete'); // QA 20:46: hạ vương thú phải có tiếng thưởng
          floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 6, txt: '+' + klt + ' Linh Thạch', color: '#ffd94a', t: 0 });
          wevKingSpawned = false;
          updateHUD(); saveGame();
        }
      } else if (WE.killInZone(flags, curMapId, m.x, m.y)) {
        var ztv = WE.zoneTuViFor(m.type);
        var ztv2 = AC ? AC.guardGain('realmTuVi', ztv) : ztv;
        if (ztv2 > 0) {
          ch.tuVi = Math.min(ch.tuViMax, ch.tuVi + ztv2);
          floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 6, txt: '+' + ztv2 + ' tu vi (linh khí)', color: '#7dffce', t: 0 });
        }
        var zseed = WE.rollZoneSeed(Math.random);
        if (zseed) { L.addItem(ch, zseed, 1); toast('Linh khí dồn tụ dưới chân quái: nhặt được ' + (L.ITEMS[zseed] ? L.ITEMS[zseed].name : zseed) + '!'); }
      }
      if (WE.isFarmMap(curMapId)) {
        var rel = WE.rollRelic(Math.random);
        if (rel) {
          L.addItem(ch, rel, 1); WE.noteRelic(flags);
          toast('Đất trồi linh khí — nhặt được ' + (L.ITEMS[rel] ? L.ITEMS[rel].name : rel) + '! (bán cho Thương Nhân Thần Bí khi ông ta ghé làng)');
        }
      }
    }
    if (m.boss) saveGame();
    // Linh thú: thú xuất chiến còn sống ăn EXP theo quái vừa hạ + lăn rơi
    // TRỨNG linh thú (boss 30% / tinh anh 10% / thường 1% — số ở pets.js).
    if (PETS && ch) {
      var pDef = L.MONSTERS[m.type];
      var lv = PETS.gainExp(ch, PETS.killExpFor(pDef));
      if (lv.levels > 0 && lv.pet) toast(PETS.species(lv.pet.sp).name + ' lên cấp ' + lv.pet.level + '!');
      var eggSp = PETS.rollEggDrop(m, Math.random);
      if (eggSp) {
        var eg = PETS.addEgg(ch, eggSp);
        if (eg.ok) toast('Rớt TRỨNG LINH THÚ: ' + PETS.species(eggSp).name + ' (' + PETS.GRADES[PETS.species(eggSp).grade].name + ' phẩm)! Mở panel Linh thú để theo dõi ấp.');
      }
      // TIẾN HOÁ HUYẾT MẠCH (mục 8): boss 25% / tinh anh 10% rơi Huyết
      // Mạch Tinh; quái thường không rơi. Không phải Linh Thạch.
      if (PETS.rollBloodDrop && PETS.rollBloodDrop(m, Math.random)) {
        if (L.addItem) L.addItem(ch, PETS.BLOOD_ID, 1);
        toast('Rớt HUYẾT MẠCH TINH! Linh thú cấp 10 có thể tiến hoá trong panel Linh thú.');
      }
    }
    onRealmKill(m);
  }
  // ---------- Linh thú: hành vi theo chủ + tự đánh + thu phục + panel ----------
  function petTargetPos(m) { return { x: m.x * TILE + 16, y: m.y * TILE + 28 }; }
  function tickPets(dt) {
    var st = PETS.ensurePets(ch);
    // Ấp trứng chạy theo thời gian chơi; trứng chín thì báo 1 lần.
    if (st.eggs.length) {
      PETS.tickEggs(ch, dt);
      st.eggs.forEach(function (e) {
        if (e.prog >= e.need && !e._announced) {
          e._announced = true;
          toast('Trứng ' + PETS.species(e.sp).name + ' đã chín! Mở panel Linh thú để cho nở.');
          if (SND) SND.sfx('pickup');
        }
      });
    }
    var pet = PETS.activePet(ch);
    if (!pet) { petEnt.target = null; return; }
    var def = PETS.species(pet.sp);
    petEnt.animT += dt;
    if (petEnt.hitT > 0) petEnt.hitT -= dt;
    if (PETS.isDowned(pet)) { petEnt.target = null; return; } // gục: nằm yên chờ về làng/cho ăn
    // MỤC 27: đang cưỡi chính con thú này thì nó ở dưới chân chủ, không
    // chạy theo sau cũng không đánh riêng (người cưỡi đánh bằng tay mình).
    if (flying && flyMode === 'pet') { petEnt.x = px; petEnt.y = py; petEnt.vx = 0; petEnt.vy = 0; petEnt.target = null; return; }
    // Bắt kịp chủ: xa quá thì tự về cạnh chủ (kẹt đường cũng không lạc).
    var dPl = Math.sqrt((px - petEnt.x) * (px - petEnt.x) + (py - petEnt.y) * (py - petEnt.y));
    if (dPl > PETS.VIEW.catchupDist) { petEnt.x = px - 26; petEnt.y = py + 8; petEnt.vx = 0; petEnt.vy = 0; }
    // Chọn mục tiêu: ưu tiên quái ĐÃ bị thương (mục tiêu chủ đang đánh) gần
    // chủ nhất, không có thì quái gần thú nhất trong tầm ngửi.
    var tgt = petEnt.target;
    if (tgt && (tgt.hp <= 0 || tgt.dying || tgt.gone)) tgt = null;
    if (!tgt) {
      var bestD = 1e9, hurtD = 1e9, hurt = null;
      monsters.forEach(function (m) {
        if (m.hp <= 0 || m.dying) return;
        var mp2 = petTargetPos(m);
        var dd = Math.sqrt((mp2.x - px) * (mp2.x - px) + (mp2.y - py) * (mp2.y - py));
        if (dd > PETS.VIEW.aggroRange + 60) return;
        if (m.hp < m.maxHp && dd < hurtD) { hurtD = dd; hurt = m; }
        var dp2 = Math.sqrt((mp2.x - petEnt.x) * (mp2.x - petEnt.x) + (mp2.y - petEnt.y) * (mp2.y - petEnt.y));
        if (dp2 < bestD) { bestD = dp2; tgt = m; }
      });
      tgt = hurt || tgt;
      petEnt.target = tgt;
    }
    // Điểm đến: có mục tiêu thì áp sát tới tầm đánh theo vai trò; không thì
    // bám sau lưng chủ theo hướng mặt của chủ.
    var range = def.role === 'melee' || def.role === 'tank' ? PETS.VIEW.rangeMelee : PETS.VIEW.rangeRanged;
    var ax, ay;
    if (tgt) {
      var tp = petTargetPos(tgt);
      var tdx = petEnt.x - tp.x, tdy = petEnt.y - tp.y;
      var tl = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
      ax = tp.x + tdx / tl * (range * 0.8); ay = tp.y + tdy / tl * (range * 0.8);
    } else {
      var fv = dirVec(dir);
      ax = px - fv.x * 44; ay = py - fv.y * 44 + 12;
    }
    var dx = ax - petEnt.x, dy = ay - petEnt.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var spd = Math.max(def.speed, dPl > 200 ? 175 : 0);
    var desVx = 0, desVy = 0;
    if (dist > 4) {
      var sc = Math.min(1, dist / 26);
      desVx = dx / dist * spd * sc; desVy = dy / dist * spd * sc;
    }
    var acc = 900 * dt;
    petEnt.vx += Math.max(-acc, Math.min(acc, desVx - petEnt.vx));
    petEnt.vy += Math.max(-acc, Math.min(acc, desVy - petEnt.vy));
    if (!desVx && Math.abs(petEnt.vx) < 2) petEnt.vx = 0;
    if (!desVy && Math.abs(petEnt.vy) < 2) petEnt.vy = 0;
    petEnt.x += petEnt.vx * dt; petEnt.y += petEnt.vy * dt;
    var mpW = curMap().w * TILE, mpH = curMap().h * TILE;
    petEnt.x = Math.max(10, Math.min(mpW - 10, petEnt.x));
    petEnt.y = Math.max(20, Math.min(mpH - 2, petEnt.y));
    if (Math.abs(petEnt.vy) > Math.abs(petEnt.vx) && Math.abs(petEnt.vy) > 12) petEnt.faceV = petEnt.vy < 0 ? 'back' : 'front';
    else if (Math.abs(petEnt.vx) > 12) petEnt.face = petEnt.vx < 0 ? 'left' : 'right';
    // Đánh: trong tầm thì đếm nhịp; kỹ năng riêng của loài mỗi skillCd giây.
    petEnt.atkT -= dt;
    petEnt.skillT -= dt;
    if (tgt) {
      var tp2 = petTargetPos(tgt);
      var td = Math.sqrt((tp2.x - petEnt.x) * (tp2.x - petEnt.x) + (tp2.y - petEnt.y) * (tp2.y - petEnt.y));
      if (td <= range + 14 && petEnt.atkT <= 0) {
        petEnt.atkT = PETS.VIEW.atkInterval;
        petAttackMonster(pet, def, tgt);
        // Phản đòn của quái lên thú — theo NHỊP ĐÒN của thú (không phải mỗi
        // frame): chỉ mục tiêu của thú mới đánh lại, thú đỡ đòn chịu thay
        // thường xuyên hơn.
        if (tgt.hp > 0 && !tgt.dying && Math.random() < (def.role === 'tank' ? 0.55 : 0.3)) {
          var pdmg = Math.max(1, Math.round((tgt.atk || 2) * 0.6));
          var dr = PETS.damagePet(ch, pdmg);
          petEnt.hitT = 0.3;
          floaters.push({ x: petEnt.x, y: petEnt.y - 46, txt: '-' + pdmg, color: '#ff9a8a', t: 0.8 });
          if (dr.downed) {
            toast(def.name + ' đã gục! Về làng (map 1) hoặc cho ăn để nó hồi lại.');
            petEnt.target = null;
            updateHUD(); saveGame();
          }
        }
      }
    }
  }
  function petAttackMonster(pet, def, m) {
    var color = PET_ELEM_COLOR[def.elem] || '#ffd94a';
    if (petEnt.skillT <= 0) {
      petEnt.skillT = PETS.VIEW.skillCd;
      // TIẾN HOÁ: kỹ năng thứ hai xen kẽ với kỹ năng loài (lần kỹ năng
      // chẵn dùng Huyết Mạch Bùng Nổ, lần lẻ dùng kỹ năng loài).
      if (PETS.isEvolved(pet) && petEnt.evoAlt) {
        petEnt.evoAlt = false;
        var edmg = PETS.evoSkillDamage(pet, Math.random);
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 24, txt: PETS.EVO_SKILL.name + '!', color: '#ffd94a', big: true, t: 1 });
        rawHitMonster(m, edmg, '#ffd94a', true);
        return;
      }
      if (PETS.isEvolved(pet)) petEnt.evoAlt = true;
      if (def.skill.kind === 'heal') {
        var maxHpE = L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp;
        if (ch.hp < maxHpE * 0.85) {
          var heal = PETS.skillHeal(pet);
          ch.hp = Math.min(maxHpE, ch.hp + heal);
          floaters.push({ x: px, y: py - 88, txt: def.skill.name + ' +' + heal, color: '#7dff8a', t: 1 });
          updateHUD();
          return;
        }
      } else {
        var sdmg = PETS.skillDamage(pet, Math.random);
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 24, txt: def.skill.name + '!', color: color, big: true, t: 1 });
        if (def.skill.kind === 'stun') m.freezeT = Math.max(m.freezeT || 0, 0.9);
        rawHitMonster(m, sdmg, color, true);
        return;
      }
    }
    rawHitMonster(m, PETS.attackDamage(pet, Math.random), color, false);
  }
  // ĐỒNG HÀNH (js/companion.js): bám sau-lệch bên chủ + đánh phụ.
  // Khác linh thú: CHỈ đánh quái đã bị thương (chủ/linh thú đã đánh
  // vào) — quái nguyên máu thì chỉ đi theo, không tự mở combat, để
  // đồng hành không thành máy farm thứ hai. Bạn đi cùng vẫn đi bộ dưới đất
  // mọi lúc, kể cả khi chủ ngự kiếm bay (không có chế độ bay riêng).
  function tickCompanion(dt) {
    var comp = activeCompanionDef();
    if (!comp) { compEnt.target = null; return; }
    var cst = COMP.ensure(flags);
    compEnt.animT += dt;
    if (compEnt.hitT > 0) compEnt.hitT -= dt;
    if (COMP.isDowned(flags)) { compEnt.target = null; return; } // gục: nằm yên chờ về làng
    var dPl = Math.sqrt((px - compEnt.x) * (px - compEnt.x) + (py - compEnt.y) * (py - compEnt.y));
    if (dPl > COMP.VIEW.catchupDist) { compEnt.x = px + 30; compEnt.y = py + 8; compEnt.vx = 0; compEnt.vy = 0; }
    // Chọn mục tiêu đánh phụ: quái đã thương gần chủ nhất trong tầm ngửi.
    var tgt = compEnt.target;
    if (tgt && (tgt.hp <= 0 || tgt.dying || tgt.gone || tgt.hp >= tgt.maxHp)) tgt = null;
    if (!tgt) {
      var pxList = monsters.map(function (m) {
        var p = petTargetPos(m);
        return { m: m, hp: m.hp, maxHp: m.maxHp, dying: !!m.dying, x: p.x, y: p.y };
      });
      var picked = COMP.pickTarget(pxList, px, py, compEnt.x, compEnt.y);
      tgt = picked ? picked.m : null;
      compEnt.target = tgt;
    }
    var range = COMP.rangeOf(comp);
    var ax, ay;
    if (tgt) {
      var tp = petTargetPos(tgt);
      var tdx = compEnt.x - tp.x, tdy = compEnt.y - tp.y;
      var tl = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
      ax = tp.x + tdx / tl * (range * 0.8); ay = tp.y + tdy / tl * (range * 0.8);
    } else {
      // Điểm bám: sau lưng chủ, lệch sang bên 40px (không đè linh thú).
      var fv = dirVec(dir);
      ax = px - fv.x * 44 - fv.y * 40; ay = py - fv.y * 44 + fv.x * 40 + 12;
    }
    var dx = ax - compEnt.x, dy = ay - compEnt.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var spd = dPl > 200 ? 190 : 160;
    var desVx = 0, desVy = 0;
    if (dist > 4) {
      var sc = Math.min(1, dist / 26);
      desVx = dx / dist * spd * sc; desVy = dy / dist * spd * sc;
    }
    var acc = 900 * dt;
    compEnt.vx += Math.max(-acc, Math.min(acc, desVx - compEnt.vx));
    compEnt.vy += Math.max(-acc, Math.min(acc, desVy - compEnt.vy));
    if (!desVx && Math.abs(compEnt.vx) < 2) compEnt.vx = 0;
    if (!desVy && Math.abs(compEnt.vy) < 2) compEnt.vy = 0;
    compEnt.x += compEnt.vx * dt; compEnt.y += compEnt.vy * dt;
    var mpW = curMap().w * TILE, mpH = curMap().h * TILE;
    compEnt.x = Math.max(10, Math.min(mpW - 10, compEnt.x));
    compEnt.y = Math.max(20, Math.min(mpH - 2, compEnt.y));
    if (Math.abs(compEnt.vy) > Math.abs(compEnt.vx) && Math.abs(compEnt.vy) > 12) compEnt.faceV = compEnt.vy < 0 ? 'back' : 'front';
    else if (Math.abs(compEnt.vx) > 12) compEnt.face = compEnt.vx < 0 ? 'left' : 'right';
    compEnt.atkT -= dt;
    compEnt.skillT -= dt;
    if (tgt) {
      var tp2 = petTargetPos(tgt);
      var td = Math.sqrt((tp2.x - compEnt.x) * (tp2.x - compEnt.x) + (tp2.y - compEnt.y) * (tp2.y - compEnt.y));
      if (td <= range + 14 && compEnt.atkT <= 0) {
        compEnt.atkT = COMP.VIEW.atkInterval;
        companionAttackMonster(comp, tgt);
        // Phản đòn của quái lên đồng hành — theo NHỊP ĐÒN của đồng hành
        // (như linh thú): đỡ đòn chịu trả thường xuyên hơn.
        if (tgt.hp > 0 && !tgt.dying && Math.random() < (comp.role === 'tank' ? 0.55 : 0.3)) {
          var pdmg = Math.max(1, Math.round((tgt.atk || 2) * 0.6));
          // TRẬN KỲ: bạn đi cùng đứng trong Hộ Thể thì đỡ hơn; quái
          // đứng trong Khốn Thú thì đánh yếu đi (cùng điểm móc như
          // đòn trả lên người chơi).
          if (FM) {
            var fmCM = FM.dmgTakenMult(flags, curMapId, compEnt.x, compEnt.y, 'player') *
              FM.dmgTakenMult(flags, curMapId, tgt.x * TILE + 16, tgt.y * TILE + 28, 'monster');
            pdmg = Math.max(1, Math.floor(pdmg * fmCM));
          }
          var dr = COMP.damageCompanion(flags, ch, pdmg);
          compEnt.hitT = 0.3;
          floaters.push({ x: compEnt.x, y: compEnt.y - 100, txt: '-' + pdmg, color: '#ff9a8a', t: 0.8 });
          if (dr.downed) {
            toast(comp.name + ' đã gục! Về làng (map 1) để đồng hành hồi lại.');
            compEnt.target = null;
            updateHUD(); saveGame();
          }
        }
      }
    }
  }
  function companionAttackMonster(comp, m) {
    var color = comp.sectColor || '#ffd94a';
    // Hảo cảm với đại diện tông (mốc Thân thiết trở lên) cho bạn đi
    // cùng thêm công — xem js/affinity.js companionBondAtk.
    var bondAtk = (AFF && comp) ? AFF.companionBondAtk(flags, comp.sectId) : 0;
    // Kết nghĩa (js/sworn.js): đi cùng nhau thì bạn đi cùng đánh
    // mạnh thêm một phần — cộng dồn với buff hảo cảm ở trên.
    var swornAtk = (SWN && comp) ? SWN.bonusAtk(flags) : 0;
    if (compEnt.skillT <= 0) {
      compEnt.skillT = COMP.VIEW.skillCd;
      if (comp.skill.kind === 'heal') {
        var maxHpE = L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp;
        if (ch.hp < maxHpE * 0.85) {
          var heal = COMP.skillHeal(ch);
          ch.hp = Math.min(maxHpE, ch.hp + heal);
          floaters.push({ x: px, y: py - 88, txt: comp.skill.name + ' +' + heal, color: '#7dff8a', t: 1 });
          updateHUD();
          return;
        }
      } else {
        var sdmg = COMP.skillDamage(ch, comp.skill.kind, Math.random) + bondAtk + swornAtk;
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 24, txt: comp.skill.name + '!', color: color, big: true, t: 1 });
        if (comp.skill.kind === 'stun') m.freezeT = Math.max(m.freezeT || 0, 0.9);
        rawHitMonster(m, sdmg, color, true);
        if (m.hp <= 0) COMP.noteKill(flags);
        return;
      }
    }
    rawHitMonster(m, COMP.attackDamage(ch, Math.random) + bondAtk + swornAtk, color, false);
    if (m.hp <= 0) COMP.noteKill(flags);
  }
  // TRẬN KỲ (js/formation.js): tick trên đúng map đặt trận — trừ linh
  // lực duy trì, hết giờ hoặc cạn linh lực thì trận tan; Khốn Thú làm
  // chậm quái đang đứng trong vòng (slowT sẵn có: tốc độ x0,5).
  // Sang map khác thì không tick: trận đóng băng, không mất thời gian,
  // không tốn linh lực, chờ chủ quay lại.
  function tickFormation(dt) {
    if (!FM || !ch || deathPending) return;
    var f = FM.active(flags);
    if (!f || f.map !== curMapId) return;
    if (SK) SK.ensureState(ch);
    var r = FM.tick(flags, dt, (typeof ch.ll === 'number' ? ch.ll : 0));
    ch.ll = r.ll;
    if (r.dissolved) {
      toast(r.dissolved === 'll_empty' ? 'Trận kỳ đã tan vì cạn linh lực!' : 'Trận kỳ đã hết thời gian và tự tan.');
      if (SND) SND.sfx('formation'); // QA 15:16 30/10: trận TỰ TAN cũng phải có tiếng — người chơi đang đánh phải biết trận vừa mất
      updateHUD(); saveGame(); renderFormationPanel();
      return;
    }
    if (f.type === 'khon_thu') {
      monsters.forEach(function (o) {
        if (o.hp > 0 && !o.dying && FM.monsterSlowed(flags, curMapId, o.x * TILE + 16, o.y * TILE + 28)) {
          o.slowT = Math.max(o.slowT || 0, 0.5);
        }
      });
    }
  }
  function tryCaptureNearest() {
    if (!PETS || !ch) return;
    if (deathPending) return;
    var m = nearestMonster(80);
    if (!m) { toast('Không có quái nào gần để thu phục.'); return; }
    var r = PETS.tryCapture(ch, m, Math.random);
    if (r.ok) {
      if (BX) BX.notePet(flags, r.pet.sp); // Đồ Giám: thu phục 1 lần là mở trang thú
      toast('Thu phục thành công ' + PETS.species(r.pet.sp).name + ' (' + PETS.GRADES[PETS.species(r.pet.sp).grade].name + ' phẩm)! Nó đã vào chuồng — mở panel Linh thú để cho xuất chiến.');
      m.hp = 0; m.dying = true; m.deadT = 0.7; // thu phục = quái biến mất, không thưởng hạ quái
      if (SND) SND.sfx('quest_complete');
      syncPetEnt(false);
    } else if (r.reason === 'not_wild') toast(m.name + ' không phải loài thu phục được (chỉ thu phục được: gà, thỏ, sói con, lợn rừng, rắn lục, khỉ mặt đỏ, sói rừng, lợn mông sắt).');
    else if (r.reason === 'hp_high') toast('Máu ' + m.name + ' còn ' + Math.round(r.hpPct * 100) + '% — đánh cho nó còn dưới 35% máu mới thu phục được.');
    else if (r.reason === 'no_charm') toast('Cần Bùa Ngự Thú mới thu phục được. Mua ở thương nhân Mã Vạn Lai (' + PETS.CHARM_PRICE + ' Linh Thạch/lá).');
    else if (r.reason === 'stable_full') toast('Chuồng đã đầy (' + PETS.STABLE_MAX + ' con).');
    else { if (SND) SND.sfx('capture_miss'); toast('Thu phục trượt! (tỉ lệ ' + Math.round(r.chance * 100) + '%) — mất 1 Bùa Ngự Thú.'); }
    updateHUD(); saveGame();
  }
  function openPetPanel() {
    if (!PETS) return;
    PETS.ensurePets(ch);
    renderPetPanel();
    $('panelPets').style.display = 'block';
  }
  function auraText(a) {
    var parts = [];
    if (!a) return '';
    if (a.hp) parts.push('Máu +' + a.hp);
    if (a.def) parts.push('Giáp +' + a.def);
    if (a.crit) parts.push('Chí mạng +' + a.crit + '%');
    if (a.llRegen) parts.push('Hồi linh lực +' + a.llRegen + '/s');
    if (a.speed) parts.push('Tốc độ +' + a.speed + '%');
    if (a.elem) Object.keys(a.elem).forEach(function (e) { parts.push(PETS.ELEMS[e] + ' +' + a.elem[e] + '%'); });
    return parts.join(', ');
  }
  function renderPetPanel() {
    if (!PETS || !ch) return;
    var st = PETS.ensurePets(ch);
    var sum = $('petSummary'), list = $('petList');
    if (!sum || !list) return;
    sum.innerHTML = 'Chuồng: <b>' + st.owned.length + '/' + PETS.STABLE_MAX + '</b> thú · Bùa Ngự Thú: <b>' +
      PETS.countItem(ch, PETS.CHARM_ID) + '</b> lá · Huyết Mạch Tinh: <b>' +
      PETS.countItem(ch, PETS.BLOOD_ID) + '</b> (rơi từ boss/tinh anh) · Thu phục: đánh quái hoang đúng loài còn dưới 35% máu rồi bấm nút Thu phục.' +
      '<br>Tiến hoá huyết mạch: linh thú đạt cấp 10 + 1 Yêu Đan đúng phẩm (Phàm/Linh: Cấp 1, Huyền trở lên: Cấp 2) + 1 Huyết Mạch Tinh → trần cấp 15 + kỹ năng thứ hai Huyết Mạch Bùng Nổ.' +
      (st.eggs.length ? '<br>Đang ấp ' + st.eggs.length + ' trứng.' : '');
    list.innerHTML = '';
    function row(html, btnText, onclick) {
      var d = document.createElement('div');
      d.style.cssText = 'border:1px solid #8b5a2b;border-radius:8px;padding:8px;margin:6px 0;background:#fff8ea';
      d.innerHTML = html;
      if (btnText) {
        var b = document.createElement('button');
        b.textContent = btnText;
        b.style.marginTop = '6px';
        b.onclick = onclick;
        d.appendChild(b);
      }
      list.appendChild(d);
    }
    st.eggs.forEach(function (e, i) {
      var ed = PETS.species(e.sp);
      var pct = Math.min(100, Math.floor(e.prog / e.need * 100));
      row('Trứng <b>' + ed.name + '</b> (' + PETS.GRADES[ed.grade].name + ' phẩm, hệ ' + PETS.ELEMS[ed.elem] + ') — ấp ' + pct + '% (' + Math.floor(e.prog) + '/' + e.need + 's)',
        pct >= 100 ? 'Cho nở!' : null, function () {
          var r = PETS.hatchEgg(ch, i);
          if (r.ok) { if (BX) BX.notePet(flags, e.sp); toast('Trứng nở thành ' + ed.name + '!'); if (SND) SND.sfx('kyngo'); syncPetEnt(false); }
          else toast('Chuồng đã đầy, chưa nở được.');
          renderPetPanel(); updateHUD(); saveGame();
        });
    });
    if (!st.owned.length && !st.eggs.length) {
      row('Chưa có linh thú nào. Nhận Sói Con từ thợ săn Hà Thiết Sơn (Rừng Thanh Sơn), thu phục quái hoang bằng Bùa Ngự Thú, hoặc ấp trứng rơi từ boss.', null, null);
    }
    st.owned.forEach(function (p) {
      var d = PETS.species(p.sp);
      var isAct = st.activeUid === p.uid;
      var hpTxt = Math.max(0, Math.ceil(p.hp)) + '/' + PETS.maxHpOf(p);
      var evoTxt = PETS.isEvolved(p) ? ' · <b style="color:#b8860b">HÌNH THÁI TIẾN HÓA</b> · Kỹ năng 2: <b>' + PETS.EVO_SKILL.name + '</b>' : '';
      var evoCostTxt = '';
      if (!PETS.isEvolved(p) && p.level >= PETS.MAX_LEVEL) {
        var ec = PETS.evoCostOf(p);
        evoCostTxt = '<br>Tiến hoá cần: 1 ' + L.ITEMS[ec.yeuDanId].name + ' (đang có ' + PETS.countItem(ch, ec.yeuDanId) + ') + 1 Huyết Mạch Tinh (đang có ' + PETS.countItem(ch, ec.bloodId) + ')';
      }
      var html = '<b style="color:' + PETS.GRADES[d.grade].color + '">' + PETS.displayNameOf(p) + '</b> · ' + PETS.GRADES[d.grade].name + ' phẩm · hệ ' + PETS.ELEMS[d.elem] +
        ' · ' + PETS.ROLES[d.role] + ' · Di chuyển: ' + PETS.MOVES[d.move] + (d.mountable ? (d.move === 'fly' ? ' · Ngự bay được (cần Trúc Cơ + đang xuất chiến, chọn Kiểu bay: Linh Thú rồi bấm F)' : ' · Loài đi bộ — không ngự bay được') : '') + evoTxt +
        '<br>Cấp ' + p.level + ' (Tu vi ' + p.exp + '/' + (p.level >= PETS.maxLevelOf(p) ? 'MAX' : PETS.expNeed(p.level)) + ') · Máu ' + hpTxt + ' · Tấn công ' + PETS.atkOf(p) +
        '<br>Kỹ năng: <b>' + d.skill.name + '</b> · Hào quang: ' + (auraText(d.aura) || 'không') + (isAct ? ' · <b>ĐANG XUẤT CHIẾN</b>' : '') + (PETS.isDowned(p) ? ' · <b style="color:#c33">ĐÃ GỤC</b>' : '') + evoCostTxt;
      if (d.desc) html += '<br><i style="color:#8a6d3b">' + d.desc + '</i>';
      row(html, isAct ? 'Thu hồi' : 'Xuất chiến', function () {
        var r = PETS.setActive(ch, isAct ? null : p.uid);
        if (r.ok) { syncPetEnt(true); toast(isAct ? 'Đã thu hồi ' + d.name + '.' : d.name + ' xuất chiến!'); }
        renderPetPanel(); updateHUD(); saveGame();
      });
      if (p.hp < PETS.maxHpOf(p)) {
        var fb = document.createElement('button');
        fb.textContent = 'Cho ăn (dùng đồ ăn trong túi)';
        fb.style.marginLeft = '8px';
        fb.onclick = function () {
          var food = ['thit_lon', 'thit_son_quan', 'thao_duoc', 'thit_ga', 'thit_tho'].filter(function (f) { return PETS.countItem(ch, f) > 0; })[0];
          if (!food) { toast('Túi không có đồ ăn nào cho thú (thịt/thảo dược).'); return; }
          var r = PETS.feedPet(ch, p.uid, food);
          toast(r.ok ? d.name + ' ăn ' + L.ITEMS[food].name + ', hồi ' + r.healed + ' Máu.' : 'Không cho ăn được.');
          renderPetPanel(); updateHUD(); saveGame(); renderInventory();
        };
        list.lastChild.appendChild(fb);
      }
      if (!PETS.isEvolved(p) && p.level >= PETS.MAX_LEVEL) {
        var eb = document.createElement('button');
        eb.textContent = 'Tiến Hoá Huyết Mạch';
        eb.style.marginLeft = '8px';
        eb.onclick = function () {
          var r = PETS.evolve(ch, p.uid);
          if (r.ok) {
            toast(PETS.displayNameOf(p) + ' đã tiến hoá! Trần cấp lên 15, học được ' + PETS.EVO_SKILL.name + '.');
            if (SND) SND.sfx('breakthrough'); // QA 15:16 30/10: tiến hoá huyết mạch là mốc lớn của linh thú — dùng tiếng đột phá
            if (isAct) syncPetEnt(false);
          } else if (r.reason === 'no_yeudan') toast('Thiếu Yêu Đan đúng phẩm — săn boss yêu thú để lấy.');
          else if (r.reason === 'no_blood') toast('Thiếu Huyết Mạch Tinh — hạ boss hoặc tinh anh để rơi.');
          else toast('Chưa tiến hoá được.');
          renderPetPanel(); updateHUD(); saveGame();
        };
        list.lastChild.appendChild(eb);
      }
    });
  }
  // QA (f) 14:16 30/10 — PHÍ HỒI SINH (mục 37 hàng chờ): chết ngoài
  // sự kiện ở map thường trước đây miễn phí mà vẫn về làng, rẻ hơn cả
  // Truyền Tống Phù nên người chơi map xa chỉ cần để quái đánh chết là
  // khỏi đi bộ về, khỏi mua phù. Phương án đã chọn: phí hồi sinh bằng
  // ĐÚNG giá Truyền Tống Phù trong economy.md mục 10 (150 Linh Thạch),
  // không tự chế số mới — chết về làng = dùng một lần truyền tống về
  // làng, nên trả đúng giá đó. Phí chỉ áp ngoài sự kiện; chết trong
  // Đại Hội/Thú Triều/vết nứt/sự kiện thú dữ/bí cảnh giữ nguyên luật
  // reset cũ của sự kiện đó, không cộng thêm phí. Hết Linh Thạch thì
  // trừ hết số còn lại, không bao giờ âm (người 0 LT vẫn hồi sinh, chỉ
  // mất sạch số lẻ còn lại — điểm yếu còn lại, ghi rõ ở hàng chờ).
  var DEATH_FEE = 150;
  function onPlayerDeath() {
    if (flags) lifetimeStats().deaths++; // thống kê trọn đời (20:24) — đếm từ bản này
    if (SND) SND.bossFight(false);
    // NGỰ KIẾM: chết là rơi khỏi kiếm + hủy bài bay thử; hình nhân thử
    // kiếm cũng tan (dựng lại khi nói chuyện với đại diện tông).
    flying = false; flyLift = 0; flyTrial = null;
    for (var di2 = monsters.length - 1; di2 >= 0; di2--) if (monsters[di2].duelFly) monsters.splice(di2, 1);
    // Chụp trạng thái sự kiện TRƯỚC khi các nhánh dưới chốt/xoá run,
    // để quyết phí: chỉ chết ngoài mọi sự kiện mới tốn phí.
    var deathTournLive = false, deathTideRun = false;
    if (TOURN) { var td0 = TOURN.ensure(flags); deathTournLive = !!(td0 && td0.run && td0.run.phase === 'live'); }
    if (BT) { var bd0 = BT.ensure(flags); deathTideRun = !!(bd0 && bd0.run); }
    var deathBeastEvent = !!(flags && flags.event && flags.event.active && !flags.event.done);
    var deathRealmMap = !!(SR && SR.isRealmMap(curMapId));
    // ĐẠI HỘI: gục giữa trận trên võ đài = thua trận đó (chốt trước hồi sinh).
    if (deathTournLive) onTournMatchEnd(TOURN.reportLoss(flags, ch.name), null);
    // THÚ TRIỀU: gục giữa trận thủ thành = chốt lượt thua theo số đợt
    // đã giữ + phát thưởng ngay (trước khi hồi sinh về làng như Đại Hội).
    if (deathTideRun) onTideFinish(BT.forfeit(flags), 'Bạn gục ngã trước cổng Nam Môn! ');
    // VẾT NỨT HƯ KHÔNG: gục trong cảnh của vết nứt = bị hư không hất
    // văng ra + vết nứt khép với người đó tới hết chu kỳ (noteDeath
    // phải đọc run TRƯỚC khi onRealmDeath xoá).
    var riftDeath = null;
    if (RIFT) riftDeath = RIFT.noteDeath(flags, gameNow());
    onRealmDeath();
    var deathInEvent = deathTournLive || deathTideRun || deathBeastEvent || deathRealmMap || !!(riftDeath && riftDeath.wasRift);
    var deathFee = 0;
    if (!deathInEvent && ch) {
      deathFee = Math.min(DEATH_FEE, Math.max(0, ch.linhThach || 0));
      if (deathFee > 0) ch.linhThach -= deathFee;
    }
    ch.hp = L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp;
    curMapId = 'map1';
    if (SND) SND.setMap('map1'); // QA (e) 00:31 31/10: đường chết không qua switchMap nên nhạc kẹt theme map đã chết — hồi sinh về làng phải đổi nhạc về làng
    prefetchBgAround(curMapId); // QA (g) 01:15 31/10: hồi sinh về làng cũng phải nạp nền làng + map kề (đường chết không qua switchMap nên trước đây chỉ có nền nhờ lần nạp sai map ở startGame).
    px = M.MAP.start.x * TILE + 16; py = M.MAP.start.y * TILE + 28;
    pvx = 0; pvy = 0; action = null; moveTarget = null; movePath = null;
    snapCamera();
    if (riftDeath && riftDeath.wasRift) {
      toast('Linh khí hư không hất văng bạn ra khỏi ' + riftDeath.realmName + '! Vết nứt đã khép với bạn trong chu kỳ này — hồi sinh tại trấn.');
    } else if (flags.event && flags.event.active && !flags.event.done) {
      L.resetBeastEvent(flags);
      toast('Bạn gục ngã... hồi sinh tại trấn. Sự kiện thú dữ bắt đầu lại từ đợt 1 — nói chuyện lại với A Hổ.');
    } else if (!deathInEvent && deathFee > 0) {
      toast('Bạn gục ngã... hồi sinh tại trấn, tốn ' + deathFee + ' Linh Thạch phí hồi sinh (bằng giá một lá Truyền Tống Phù).');
    } else if (!deathInEvent) {
      toast('Bạn gục ngã... hồi sinh tại trấn. Bạn không còn Linh Thạch nên lần này không tốn phí hồi sinh.');
    } else {
      toast('Bạn gục ngã... và hồi sinh tại trấn.');
    }
    loadMapEntities();
    if (deathFee > 0) { updateHUD(); saveGame(); } // phí phải chốt vào save ngay, kẻo tải lại save cũ là trốn được phí
    if (SND) SND.sfx('revive'); // QA 16:31 30/10: khoảnh khắc hồi sinh phải có tiếng — trước đây chỉ có tiếng chết, hồi sinh im lặng
  }
  // ---------- HUD thu gọn (lệnh Bui 21:50 30/10) ----------
  // Nút thu/gọn ngay trên khung HUD; trạng thái gọn CHỈ còn thanh HP,
  // Linh lực, Giáp (khi > 0) và Tu vi. Lưu theo tài khoản theo khuôn
  // 'pnt-hud-<username>' (như 'pnt-snd-<username>'), nạp lại giữ nguyên.
  var hudCompact = false;
  function isNarrowPortrait() {
    // Khung dọc nhỏ kiểu điện thoại (390x844): căn cứ innerWidth/
    // innerHeight thật của trình duyệt; môi trường không đo được
    // (không có số) thì KHÔNG tự gọn — giữ mặc định mở rộng cũ.
    try {
      return !!(window.innerWidth && window.innerHeight &&
        window.innerWidth <= 540 && window.innerHeight > window.innerWidth);
    } catch (e) { return false; }
  }
  function loadHudPref() {
    var v = null;
    try { v = localStorage.getItem('pnt-hud-' + (currentAccount || '')); } catch (e) {}
    if (v) hudCompact = (v === 'gon'); // người chơi đã chọn tay -> tôn trọng lựa chọn đã lưu
    else hudCompact = isNarrowPortrait(); // Phần 10 (22:45): chưa chọn + máy dọc nhỏ -> MẶC ĐỊNH GỌN cho đỡ chiếm diện tích lúc chơi
    applyHudCompact();
  }
  function classToggleSafe(el, cls, on) { if (el && el.classList && el.classList.toggle) el.classList.toggle(cls, on); }
  function applyHudCompact() {
    var h = $('hud'); if (!h) return;
    classToggleSafe(h, 'compact', hudCompact);
    classToggleSafe($('gameWrap'), 'hud-compact', hudCompact);
    var tg = $('hudToggle');
    if (tg) { tg.textContent = hudCompact ? '▸' : '▾'; tg.title = hudCompact ? 'Mở rộng khung thông tin' : 'Thu gọn khung thông tin'; }
  }
  function toggleHudCompact() {
    hudCompact = !hudCompact;
    try { localStorage.setItem('pnt-hud-' + (currentAccount || ''), hudCompact ? 'gon' : 'mo'); } catch (e) {}
    applyHudCompact();
  }
  function updateHUD() {
    if (!ch) return;
    var hudTxt = ch.name + ' · ' + ch.realm + (ch.root ? ' · ' + L.rootOf(ch).name : '');
    if (SECT && flags && flags.sectJoined) {
      var joinedDef = SECT.sectById(flags.sectJoined);
      if (joinedDef) hudTxt += ' · ' + joinedDef.name;
    }
    var tournTitle = TOURN ? TOURN.titleText(flags) : null;
    if (tournTitle) hudTxt += ' · ' + tournTitle;
    var wornT = '';
    try { wornT = wornTitleName(); } catch (e) {}
    if (wornT) hudTxt += ' · «' + wornT + '»';
    $('hudName').textContent = hudTxt;
    // QA 13:46 30/10: HUD phải cho biết đang ở map nào — tên map vốn
    // chỉ hiện ở dòng đếm người cùng map (chỉ hiện khi có người khác).
    var hudMapEl = $('hudMap');
    if (hudMapEl) hudMapEl.textContent = 'Đang ở: ' + curMap().name;
    var maxHpEff = L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp;
    $('hudHp').style.width = Math.max(0, ch.hp / maxHpEff * 100) + '%';
    $('hudHpText').textContent = Math.max(0, Math.ceil(ch.hp)) + '/' + maxHpEff;
    $('hudTuVi').style.width = Math.min(100, Math.max(0, ch.tuVi / ch.tuViMax * 100)) + '%';
    $('hudTuViText').textContent = Math.floor(ch.tuVi) + '/' + ch.tuViMax;
    if (SK && $('hudLL')) {
      SK.ensureState(ch);
      $('hudLL').style.width = Math.max(0, ch.ll / SK.maxLinhLuc(ch) * 100) + '%';
      $('hudLLText').textContent = Math.floor(ch.ll) + '/' + SK.maxLinhLuc(ch);
    }
    // Dòng Giáp cho HUD gọn (21:50): chỉ hiện khi Thủ/Giáp > 0 (CSS lo
    // việc chỉ bật ở trạng thái gọn qua lớp .on).
    var hArm = $('hudArmor'), hArmRow = $('hudArmorRow');
    if (hArm && hArmRow) {
      var defNow = L.effDef ? L.effDef(ch) : (ch.def || 0);
      hArm.textContent = 'Giáp ' + defNow;
      classToggleSafe(hArmRow, 'on', defNow > 0);
    }
    $('hudCoins').textContent = ch.linhThach + ' Linh Thạch';
    var ltIcon = $('hudLtIcon');
    if (ltIcon && S && S.ITEM_ICONS && S.ITEM_ICONS.linh_thach && !ltIcon.getAttribute('data-drawn')) {
      S.drawGridToCanvas(ltIcon.getContext('2d'), S.ITEM_ICONS.linh_thach, 0, 0, 2);
      ltIcon.setAttribute('data-drawn', '1');
    }
    var ha = $('hudAtk');
    if (ha) {
      if (W) W.ensureWeapons(ch);
      var wDef = W ? W.equippedDef(ch) : null;
      ha.textContent = 'Tấn công ' + L.effAtk(ch) + ' · Phòng thủ ' + (L.effDef ? L.effDef(ch) : ch.def) + (wDef ? ' (' + wDef.name + ' +' + wDef.atk + ')' : ' (tay không)');
    }
    var hpEl = $('hudPet');
    if (hpEl && PETS) {
      var aPet = PETS.activePet(ch);
      if (aPet) {
        var aDef = PETS.species(aPet.sp);
        hpEl.textContent = 'Linh thú: ' + aDef.name + ' Cấp ' + aPet.level + ' · Máu ' + Math.max(0, Math.ceil(aPet.hp)) + '/' + PETS.maxHpOf(aPet) + (PETS.isDowned(aPet) ? ' (gục — về làng để hồi)' : '');
      } else hpEl.textContent = '';
    }
    var hsEl = $('hudSeason');
    if (hsEl && SB) {
      var live = SB.liveBoard(flags, Date.now());
      hsEl.textContent = 'Bảng mùa ' + live.seasonLabel.replace(/^Mùa /, '') + ': hạng ' + live.playerRank + '/11 · ' + live.playerScore + ' điểm';
    }
    var htEl = $('hudTide');
    if (htEl && TD) {
      var ts = TD.seasonOf(new Date(gameNow()));
      htEl.textContent = 'Tiết ' + ts.name + ': ' + ts.def.hud;
    }
    var bp = $('btnBreak');
    if (bp) {
      if (!ch.root) { bp.disabled = true; bp.textContent = 'Đột phá (cần lộ linh căn)'; }
      else if (L.breakthroughInfo) {
        var bInfo = cultInfo();
        bp.disabled = false;
        bp.textContent = bInfo.atMax ? 'Tu hành (' + ch.realm + ')' : (bInfo.kind === 'cross' ? (bInfo.canAttempt ? 'Độ kiếp: ' + bInfo.targetRealm + '!' : 'Tu hành (xem điều kiện độ kiếp)') : (bInfo.canAttempt ? 'Đột phá! (' + bInfo.rate + '%)' : 'Tu hành (xem điều kiện)'));
      } else {
        bp.disabled = !L.canBreakthrough(ch);
        bp.textContent = L.canBreakthrough(ch) ? 'Đột phá!' : 'Đột phá (chưa đủ tu vi)';
      }
    }
  }
  // ---------- Màn hình đăng kí / đăng nhập / tạo nhân vật ----------
  $('formRegister').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = $('regUser').value.trim(), p = $('regPass').value;
    var r = L.registerAccount(accounts, u, p);
    if (!r.ok) { $('regErr').textContent = r.error; return; }
    if (!saveAccounts()) {
      // Storage từ chối ghi (bị chặn/hết quota): tài khoản mới chỉ có
      // trong bộ nhớ phiên này, tải lại trang là mất — PHẢI báo rõ,
      // tuyệt đối không hiện "Đăng kí thành công" như bản cũ.
      $('regErr').textContent = 'Không lưu được tài khoản trên trình duyệt này (lưu trữ bị chặn hoặc đã đầy). Hãy tắt chế độ chặn lưu trữ/đổi trình duyệt rồi đăng kí lại.';
      return;
    }
    $('regErr').textContent = '';
    $('loginUser').value = u;
    toast('Đăng kí thành công! Mời đăng nhập.');
    showScreen('screen-login');
  });
  $('toLogin').addEventListener('click', function () { showScreen('screen-login'); });
  $('toRegister').addEventListener('click', function () { showScreen('screen-register'); });
  $('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = $('loginUser').value.trim(), p = $('loginPass').value;
    refreshAccounts(); // nạp thêm tài khoản đã đăng kí ở tab/cửa sổ khác sau khi trang này mở
    var r = L.loginAccount(accounts, u, p);
    if (!r.ok) { $('loginErr').textContent = r.error; return; }
    currentAccount = u;
    var data = loadSave(u);
    if (data) {
      ch = data.character; qs = data.quests; flags = data.flags || {};
      startGame();
    } else {
      showScreen('screen-create');
    }
  });
  // ----- TẠO HÌNH NV01–NV12 (Bui duyệt hết 06:06 30/10/2026, nâng cấp
  // thiên hướng tu tiên 06:07): lưới chọn theo giới đang chọn; lựa chọn
  // đầu tiên là tạo hình mặc định theo xuất thân (sheet gốc). Ảnh xem
  // trước: assets/looks/nvXX.png (thiết kế) / <gender>_<origin>.png
  // (frame đầu sheet gốc). Xem trước trực tiếp khi bấm chọn.
  var CR_LOOKS = {
    nam: [['nv01', 'NV01 · Kiếm Khách Lãng Du'], ['nv02', 'NV02 · Thư Sinh Ôn Nhuận'],
      ['nv03', 'NV03 · Đạo Sĩ Vân Du'], ['nv04', 'NV04 · Thợ Săn Sơn Dã'],
      ['nv05', 'NV05 · Tiểu Hòa Thượng'], ['nv06', 'NV06 · Thôn Phu Cường Tráng']],
    nu: [['nv07', 'NV07 · Nữ Hiệp Hồng Y'], ['nv08', 'NV08 · Dược Nương Hoa Cài'],
      ['nv09', 'NV09 · Tiên Tử Áo Tím'], ['nv10', 'NV10 · Sơn Nữ Thợ Săn'],
      ['nv11', 'NV11 · Tài Nữ Thư Hương'], ['nv12', 'NV12 · Thôn Nữ Hoa Đào']]
  };
  function crRenderLooks() {
    var gender = document.querySelector('input[name="crGender"]:checked').value;
    var origin = document.querySelector('input[name="crOrigin"]:checked').value;
    var box = $('crLooks'); if (!box) return;
    var cur = $('crLook').value;
    var valid = CR_LOOKS[gender].some(function (p) { return p[0] === cur; });
    if (cur && !valid) { cur = ''; $('crLook').value = ''; }
    box.innerHTML = '';
    function addOpt(val, img, label) {
      var d = document.createElement('div');
      d.className = 'look-opt' + (cur === val ? ' sel' : '');
      var im = document.createElement('img'); im.src = img; im.alt = label;
      var sp = document.createElement('span'); sp.textContent = label;
      d.appendChild(im); d.appendChild(sp);
      d.addEventListener('click', function () {
        $('crLook').value = val;
        crRenderLooks();
      });
      box.appendChild(d);
    }
    addOpt('', 'assets/looks/' + gender + '_' + origin + '.png', 'Mặc định theo xuất thân');
    CR_LOOKS[gender].forEach(function (p) { addOpt(p[0], 'assets/looks/' + p[0] + '.png', p[1]); });
    var prev = $('crLookImg'), nm = $('crLookName');
    if (cur) {
      prev.src = 'assets/looks/' + cur + '.png';
      nm.textContent = CR_LOOKS[gender].filter(function (p) { return p[0] === cur; })[0][1] + ' — sheet 60 frame, 4 hướng thật';
    } else {
      prev.src = 'assets/looks/' + gender + '_' + origin + '.png';
      nm.textContent = 'Tạo hình mặc định theo xuất thân đã chọn';
    }
    // NGUỒN GỐC (mục 19): hiện lore + dấu ấn của nguồn gốc khi chọn
    // tạo hình — người chơi thấy ngay mình là ai trước khi vào làng.
    // QA 17:31 30/10: nói rõ ngay tại đây rằng CÂU CHUYỆN đi theo tạo
    // hình còn CHỈ SỐ đi theo khung Xuất thân (radio) — trước đây đổi
    // radio là chỉ số đổi âm thầm, màn hình không phản hồi gì, người
    // chơi tưởng game tự ý sửa nhân vật của mình.
    var loreEl = $('crOriginLore');
    if (loreEl) {
      if (OG && OG.createLine) {
        var defSel = OG.byId ? OG.byId(cur || ('goc_' + origin)) : null;
        var tkName = (defSel && L && L.ITEMS && L.ITEMS[defSel.token]) ? L.ITEMS[defSel.token].name : null;
        var orgDef = L.ORIGINS[origin];
        loreEl.textContent = OG.createLine(cur, origin, tkName)
          + (orgDef ? ' Chỉ số khởi đầu theo xuất thân đã chọn: ' + orgDef.name + ' (Máu ' + orgDef.hp + ', công ' + orgDef.atk + ', thủ ' + orgDef.def + ', tốc độ thổ nạp x' + orgDef.rate + '). Câu chuyện theo tạo hình; chỉ số theo xuất thân.' : '');
      } else loreEl.textContent = '';
    }
  }
  document.querySelectorAll('input[name="crGender"], input[name="crOrigin"]').forEach(function (r) {
    r.addEventListener('change', crRenderLooks);
  });
  crRenderLooks();
  $('formCreate').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('crName').value.trim();
    if (!name) { $('crErr').textContent = 'Nhập tên nhân vật.'; return; }
    var gender = document.querySelector('input[name="crGender"]:checked').value;
    var origin = document.querySelector('input[name="crOrigin"]:checked').value;
    var look = ($('crLook') && $('crLook').value) || '';
    ch = L.createCharacter(name, gender, origin, look || undefined);
    qs = L.newQuestState();
    flags = {};
    flags.layoutV = (M && M.EXP_LAYOUT_V) || 3; // nhân vật tạo sau V10: đã ở bố cục mới, không migration
    L.acceptQuest(qs, 'q_chinh_1');
    saveGame();
    startGame();
    if (SND) SND.sfx('pickup'); // QA 18:16 30/10: khoảnh khắc nhận dấu ấn nguồn gốc lúc tạo nhân vật có tiếng nhặt đồ, không im lặng
  });
  $('btnLogout').addEventListener('click', function () {
    saveGame();
    currentAccount = null; ch = null;
    showScreen('screen-login');
  });
  // ---------- Tương tác ----------
  // ---------- Tông môn (arc chương 9-12): đại diện xuất hiện theo tiến độ ----------
  // NPC có trường sect (chỉ ở bãi tuyển map 3) chỉ hiện khi tông của họ tới
  // lượt mở khoá / đang mở (xem SECTS.repVisible trong js/sects.js). NPC
  // thường không có trường sect -> luôn hiện như cũ.
  function npcVisible(n) {
    if (!n || !n.sect) return true;
    if (!SECT || !qs) return true;
    return SECT.repVisible(qs, n.sect);
  }
  // ----- V7: va chạm hộp chân + camera + động tác nhân vật -----
  // Hộp va chạm ở chân (ngang 20px, từ 6px trên chân xuống đúng chân): nhỏ
  // hơn một ô nên vẫn lọt lối 1 ô và trượt dọc tường mượt, nhưng không còn
  // là "một điểm" xuyên góc như trước.
  function collideAt(x, y) {
    // Prop cứng (đá/thân cây — type tương lai) chặn theo vòng chân; prop
    // mềm như lúa đi xuyên. Map không prop cứng thì PROPS trả false ngay.
    if (PROPS && PROPS.solidAt(curMapId, x, y)) return true;
    var x0 = Math.floor((x - 10) / TILE), x1 = Math.floor((x + 10) / TILE);
    var y0 = Math.floor((y - 6) / TILE), y1 = Math.floor(y / TILE);
    for (var ty = y0; ty <= y1; ty++)
      for (var tx = x0; tx <= x1; tx++)
        if (tileBlocked(tx, ty)) return true;
    return false;
  }
  function snapCamera() {
    var mp = curMap();
    camX = Math.max(0, Math.min(Math.max(0, mp.w * TILE - effVW()), px - effVW() / 2));
    camY = Math.max(0, Math.min(Math.max(0, mp.h * TILE - effVH()), py - effVH() / 2));
  }
  // Camera lerp mũ theo nhân vật + nhìn trước theo hướng vận tốc (tối đa
  // ~52px ngang / 40px dọc): bám mượt, không giật khi chạm mép vùng cuộn.
  function updateCamera(dt) {
    var mp = curMap();
    var lookX = Math.max(-52, Math.min(52, pvx * 0.34));
    var lookY = Math.max(-40, Math.min(40, pvy * 0.34));
    var tX = Math.max(0, Math.min(Math.max(0, mp.w * TILE - effVW()), px - effVW() / 2 + lookX));
    var tY = Math.max(0, Math.min(Math.max(0, mp.h * TILE - effVH()), py - effVH() / 2 + lookY));
    var k = 1 - Math.exp(-dt * 5.5);
    camX += (tX - camX) * k;
    camY += (tY - camY) * k;
    if (Math.abs(tX - camX) < 0.1) camX = tX;
    if (Math.abs(tY - camY) < 0.1) camY = tY;
  }
  // Động tác nhân vật: ưu tiên death > hit > chiêu > tương tác; động tác
  // ngang hàng được phép nối nhau (combo 3 đòn liên tiếp).
  var ACT_PRIO = { death: 100, hit: 60, slash1: 50, slash2: 50, slash3: 50, cast_slash: 50, spin: 50, channel: 50, dash_pose: 50, toss: 50, gather: 30, talk: 30 };
  function setAction(name, dur) {
    if (deathPending && name !== 'death') return;
    if (action && (ACT_PRIO[action.name] || 0) > (ACT_PRIO[name] || 0) && action.t < action.dur) return;
    action = { name: name, t: 0, dur: dur, dir: dir };
  }
  function medActiveNow() {
    return !!ch && !action && !deathPending && (medPoseT > 0 || (autoMeditate && !!ch.root && !moving));
  }
  function tileBlocked(tx, ty) {
    if (M.isBlockedIn(curMap(), tx, ty)) return true;
    var npcs = curMap().npcs;
    for (var i = 0; i < npcs.length; i++)
      if (npcVisible(npcs[i]) && npcs[i].x === tx && npcs[i].y === ty) return true;
    return false;
  }
  function nearestNpc(maxDist) {
    var best = null, bd = 1e9, i;
    var npcs = curMap().npcs;
    for (i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      if (!npcVisible(n)) continue;
      var dx = n.x * TILE + 16 - px, dy = n.y * TILE + 28 - py;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = n; }
    }
    return bd <= maxDist ? best : null;
  }
  function nearestMonster(maxDist) {
    var best = null, bd = 1e9, i;
    for (i = 0; i < monsters.length; i++) {
      var m = monsters[i];
      if (m.hp <= 0) continue;
      var dx = m.x * TILE + 16 - px, dy = m.y * TILE + 28 - py;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = m; }
    }
    return bd <= maxDist ? best : null;
  }
  // ---- Khóa mục tiêu đánh thường + hộp thân quái (vá lỗi ĐÁNH KHÔNG
  // TRÚNG, playtest live 31/10): hình người chơi vẽ rộng ~96px, quái
  // 72-224px; hai hình đã "chạm nhau" trên màn hình khi neo chân còn
  // cách tới ~84px, nên tầm khóa cứng 64px neo->neo cũ khiến người chơi
  // đứng sát quái vẫn nhận "Không có quái gần đây." (đo D-pad áp sát:
  // dừng ở 65,3-77,3px là trượt 100%). Tầm mới = 64px gốc + nửa bề
  // ngang thân quái: trúng khi thân hai bên chạm nhau hoặc cách nhau
  // không quá một vệt chém ~16px (sau khi trừ nửa thân người 48px).
  function monsterHalfW(m) {
    if (m._dw) return m._dw / 2;
    return 48 * (m.scale || 1) * (MON_GRID_SCALE[m.type] || 1);
  }
  function meleeRangeOf(m) { return 64 + monsterHalfW(m); }
  function nearestMonsterMelee() {
    var best = null, bd = 1e9;
    for (var i = 0; i < monsters.length; i++) {
      var m = monsters[i];
      if (m.hp <= 0 || m.dying) continue;
      var d = distToM(m);
      if (d <= meleeRangeOf(m) && d < bd) { bd = d; best = m; }
    }
    return best;
  }
  // Tự xoay mặt về phía quái vừa khóa mục tiêu (trục trội hơn thắng,
  // cùng quy ước của vòng di chuyển) — người chơi khỏi căn hướng tay.
  function faceToward(m) {
    var dx = m.x * TILE + 16 - px, dy = m.y * TILE + 28 - py;
    if (Math.abs(dx) >= Math.abs(dy)) dir = dx < 0 ? 'left' : 'right';
    else dir = dy < 0 ? 'up' : 'down';
    if (ch) ch.dir = dir;
    // DIR8: mặt hiển thị cũng xoay đủ 8 hướng về phía quái (đòn chém
    // chéo dùng dải slash chéo khi look có); dir logic vẫn 4 hướng.
    if (D8) { var s8 = D8.sectorOf(dx, dy); if (s8) dir8 = s8; }
  }
  // Hộp thân quái = đúng phần hình vẽ: tâm ngang tại neo, đáy tại neo
  // chân, cao _dh (cache lúc vẽ; chưa vẽ thì ước theo cỡ vẽ fallback).
  function monsterBodyBox(m) {
    var cx = m.x * TILE + 16, feet = m.y * TILE + 28;
    var bw = m._dw || (96 * (m.scale || 1) * (MON_GRID_SCALE[m.type] || 1));
    var bh = m._dh || bw;
    return { x0: cx - bw / 2, x1: cx + bw / 2, y0: feet - bh, y1: feet };
  }
  function distPointBox(x, y, b) {
    var dx = Math.max(b.x0 - x, 0, x - b.x1);
    var dy = Math.max(b.y0 - y, 0, y - b.y1);
    return Math.sqrt(dx * dx + dy * dy);
  }
  function distPointSeg(x, y, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len2 = dx * dx + dy * dy;
    var t = len2 ? ((x - x1) * dx + (y - y1) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    var cx = x1 + t * dx, cy = y1 + t * dy;
    return Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
  }
  function segsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
    function o(ax, ay, bx, by, cx2, cy2) { return (bx - ax) * (cy2 - ay) - (by - ay) * (cx2 - ax); }
    var d1 = o(x3, y3, x4, y4, x1, y1), d2 = o(x3, y3, x4, y4, x2, y2);
    var d3 = o(x1, y1, x2, y2, x3, y3), d4 = o(x1, y1, x2, y2, x4, y4);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  }
  // Khoảng cách từ ĐOẠN BAY (tiền kiểm chiêu projectile) tới hộp thân:
  // 0 khi đoạn chạm/cắt hộp, còn lại là khoảng cách hình học nhỏ nhất.
  function distSegBox(x1, y1, x2, y2, b) {
    if (x1 >= b.x0 && x1 <= b.x1 && y1 >= b.y0 && y1 <= b.y1) return 0;
    if (x2 >= b.x0 && x2 <= b.x1 && y2 >= b.y0 && y2 <= b.y1) return 0;
    var edges = [[b.x0, b.y0, b.x1, b.y0], [b.x1, b.y0, b.x1, b.y1], [b.x1, b.y1, b.x0, b.y1], [b.x0, b.y1, b.x0, b.y0]];
    for (var j = 0; j < 4; j++) if (segsCross(x1, y1, x2, y2, edges[j][0], edges[j][1], edges[j][2], edges[j][3])) return 0;
    var d = Math.min(distPointBox(x1, y1, b), distPointBox(x2, y2, b));
    var cs = [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]];
    for (var i = 0; i < 4; i++) d = Math.min(d, distPointSeg(cs[i][0], cs[i][1], x1, y1, x2, y2));
    return d;
  }
  function nearestHerb(maxDist) {
    var best = null, bd = 1e9, i;
    for (i = 0; i < herbs.length; i++) {
      var h = herbs[i];
      if (h.taken) continue;
      var dx = h.x * TILE + 16 - px, dy = h.y * TILE + 28 - py;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = h; }
    }
    return bd <= maxDist ? best : null;
  }
  function npcDef(npc) {
    var def = S.NPC[npc.sprite || npc.id] || S.NPC[npc.id];
    var stNpc = (ST && ST.NPCS) ? ST.NPCS[npc.id] : null;
    return {
      name: (stNpc && stNpc.name) || npc.name || def.name,
      role: npc.role || (stNpc && stNpc.title) || def.role,
      lines: def.lines, grid: def.grid
    };
  }
  // Marker nhiệm vụ trên đầu NPC: chuỗi ngự kiếm dùng marker riêng theo
  // tông đã bái nhập (flight.js), còn lại dùng marker chuẩn của logic.js.
  function questMarkerFor(npcId) {
    if (FLIGHT && FLIGHT.markerFor) {
      var fm = FLIGHT.markerFor(npcId, ch, flags, qs);
      if (fm) return fm;
    }
    if (WD && WD.markerFor) {
      var wm = WD.markerFor(npcId, qs, ch, Date.now());
      if (wm) return wm;
    }
    if (SECTARC && SECTARC.markerFor) {
      var am = SECTARC.markerFor(npcId, ch, flags, qs);
      if (am) return am;
    }
    if (RIFT && RIFT.markerFor) {
      var rm2 = RIFT.markerFor(npcId, ch, flags, qs);
      if (rm2) return rm2;
    }
    // THIÊN 4 ch.25-27: đại diện tông đã bái nhập — marker chuỗi tranh
    // linh mạch (js/thien4.js); chưa qua arc vết nứt thì không hiện.
    if (THIEN4 && THIEN4.markerFor) {
      var tm2 = THIEN4.markerFor(npcId, ch, flags, qs);
      if (tm2) return tm2;
    }
    // THIÊN 5 ch.28-30: đại diện tông đã bái nhập — marker chuỗi vụ án
    // đan độc (js/thien5.js); chưa xong Thiên 4 thì không hiện.
    if (THIEN5 && THIEN5.markerFor) {
      var tm5 = THIEN5.markerFor(npcId, ch, flags, qs);
      if (tm5) return tm5;
    }
    // TÀNG KINH CÁC: thủ thư Cổ Mặc — marker chuỗi việc giữ sách,
    // chỉ hiện khi đã bái nhập tông (js/library.js kiểm cổng).
    if (LIB && LIB.markerFor) {
      var lm = LIB.markerFor(npcId, flags, qs);
      if (lm) return lm;
    }
    // KẾT NGHĨA: đại diện tông đã bái nhập — marker chuỗi kết nghĩa,
    // chỉ hiện khi đủ cổng chiêu mộ + hảo cảm 40 (js/sworn.js kiểm).
    if (SWN && SWN.markerFor) {
      var km = SWN.markerFor(npcId, flags, qs);
      if (km) return km;
    }
    // THỦY TRIỀU THEO MÙA: việc tiết ở NPC làng — '!' việc tiết
    // không được che dấu '?' trả nhiệm vụ thường của cùng NPC.
    if (TD && TD.markerFor) {
      var tdm = TD.markerFor(npcId, flags, qs, new Date(gameNow()));
      if (tdm) {
        if (tdm === '!' && L.npcMarker(qs, npcId) === '?') return '?';
        return tdm;
      }
    }
    return L.npcMarker(qs, npcId);
  }
  function dialogueLinesFor(npc) {
    dlgOriginCue = false;
    // NGỰ KIẾM: đại diện tông đã bái nhập có thoại riêng theo tông cho
    // chuỗi (flight.js) — ưu tiên trước thoại nhiệm vụ thường.
    if (FLIGHT && FLIGHT.dialogueFor) {
      var flines = FLIGHT.dialogueFor(npc.id, ch, flags, qs);
      if (flines) return flines;
    }
    // ARC 13-20: thoại biến thể theo tông + thoại trục ở sect-arc.js.
    if (SECTARC && SECTARC.dialogueFor) {
      var alines = SECTARC.dialogueFor(npc.id, ch, flags, qs);
      if (alines) return alines;
    }
    // VẾT NỨT HƯ KHÔNG: thoại arc sự kiện ở đại diện tông + tàn niệm ở
    // Từ bà (miếu) — rift-events.js, chỉ lên tiếng khi arc liên quan.
    if (RIFT && RIFT.dialogueFor) {
      var rlines = RIFT.dialogueFor(npc.id, ch, flags, qs, Date.now());
      if (rlines) return rlines;
    }
    // ĐẠI HỘI: Chấp Sự nói theo trạng thái phiên/kỳ (tournament.js).
    if (TOURN && TOURN.dialogueFor && npc.id === TOURN.STEWARD.id) {
      var tlines = TOURN.dialogueFor(npc.id, flags, ch, Date.now());
      if (tlines) return tlines;
    }
    // THÚ TRIỀU: Chấp Sự Thủ Triều nói theo phiên/cảnh giới/lượt đang chạy.
    if (BT && BT.dialogueFor && npc.id === BT.STEWARD.id) {
      var blines = BT.dialogueFor(npc.id, flags, ch, Date.now());
      if (blines) return blines;
    }
    // HỘ TỐNG: Mã Vạn Lai nói theo trạng thái chuyến hàng.
    if (ESC && ESC.dialogueFor && npc.id === ESC.GIVER_ID) {
      var elines = ESC.dialogueFor(npc.id, flags, qs, ch);
      if (elines) return elines;
    }
    // ĐẤU GIÁ: Kim Vạn Thông nói theo phiên/khung giờ (js/auction.js).
    if (AUC && AUC.dialogueFor && npc.id === AUC.AUCTIONEER.id) {
      var alines = AUC.dialogueFor(npc.id, flags, qs, ch, Date.now());
      if (alines) return alines;
    }
    // BẢNG MÙA: Thẩm Ký nói theo bảng trực tiếp + thưởng mùa cũ chưa nhận.
    if (SB && SB.dialogueFor && npc.id === SB.KEEPER.id) {
      var sblines = SB.dialogueFor(npc.id, flags, ch, Date.now());
      if (sblines) return sblines;
    }
    // TÀNG KINH CÁC: thủ thư Cổ Mặc nói theo cổng bái nhập + tiến độ
    // chuỗi việc giữ sách (js/library.js); chưa bái nhập thì chỉ giải
    // thích luật kệ tông, không mở nhiệm vụ.
    if (LIB && LIB.dialogueFor) {
      var llines = LIB.dialogueFor(npc.id, flags, ch, qs);
      if (llines) return llines;
    }
    // KẾT NGHĨA: đại diện tông nói theo cổng + tiến độ chuỗi kết nghĩa
    // (js/sworn.js); chưa đủ cổng thì chỉ giải thích khi đã chiêu mộ
    // mà hảo cảm chưa tới 40, không chen vào thoại nhiệm vụ khác.
    if (SWN && SWN.dialogueFor) {
      var knlines = SWN.dialogueFor(npc.id, flags, ch, qs);
      if (knlines) return knlines;
    }
    // LỄ HỘI: Dì Tư nói theo cửa sổ lễ + tiến độ chuỗi việc lễ (wardrobe.js).
    if (WD && WD.dialogueFor && npc.id === WD.FEST_NPC.id) {
      var wlines = WD.dialogueFor(npc.id, qs, ch, Date.now());
      if (wlines) return wlines;
    }
    // HẢO CẢM (js/affinity.js): mốc Thân thiết trở lên mở 1 câu thoại
    // riêng — đặt SAU mọi module thoại theo trạng thái và CHỈ khi
    // không có nhiệm vụ !/?, nên thoại nhiệm vụ luôn thắng.
    if (AFF && AFF.dialogueFor) {
      var affLines = AFF.dialogueFor(npc.id, flags, questMarkerFor(npc.id));
      if (affLines) return affLines;
    }
    // NGUỒN GỐC (js/origins.js, mục 19): NPC nhận ra dấu ấn của người
    // chơi — cùng tầng ưu tiên với hảo cảm, sau mọi thoại theo trạng
    // thái, và chỉ khi không có dấu !/? nên thoại nhiệm vụ luôn thắng.
    if (OG && OG.dialogueFor) {
      var ogLines = OG.dialogueFor(npc.id, ch, flags, qs, questMarkerFor(npc.id));
      if (ogLines) { dlgOriginCue = true; return ogLines; }
    }
    if (!ST || !ST.DIALOGUE) return null;
    var d = ST.DIALOGUE[npc.id];
    if (!d) return null;
    var mk = questMarkerFor(npc.id);
    var i, q, av;
    if (mk === '?') {
      var qids = Object.keys(qs.accepted);
      for (i = 0; i < qids.length; i++) {
        q = L.QUESTS[qids[i]];
        if (q && q.giver === npc.id && qs.accepted[qids[i]].done && d.turnin && d.turnin[qids[i]]) return d.turnin[qids[i]];
      }
      // THIÊN 4 ch.25-27: nhiệm vụ chính nhưng giver trừu tượng
      // 'sect_rep' — thoại chỉ có một nguồn ở ST.DIALOGUE.sect_rep
      // (không bản sao module, bài học mục 47 hàng chờ); chỉ đọc khi
      // NPC đang nói chính là đại diện tông đã bái nhập.
      var dRep = ST.DIALOGUE.sect_rep;
      if (dRep && FLIGHT && FLIGHT.isGiver(npc.id, flags)) {
        for (i = 0; i < qids.length; i++) {
          q = L.QUESTS[qids[i]];
          if (q && q.giver === 'sect_rep' && qs.accepted[qids[i]].done && dRep.turnin && dRep.turnin[qids[i]]) return dRep.turnin[qids[i]];
        }
      }
    }
    if (mk === '!') {
      av = L.availableQuests(qs);
      for (i = 0; i < av.length; i++) {
        if (av[i].giver === npc.id && d.quest && d.quest[av[i].id]) return d.quest[av[i].id];
      }
      // THIÊN 4 cũng ngoài availableQuests (module quản cổng) nên lời
      // nhận nhiệm vụ lấy từ cùng một nguồn sect_rep như nhánh '?' trên.
      var dRep2 = ST.DIALOGUE.sect_rep;
      var tq = THIEN4 && THIEN4.availableQuestId(ch, flags, qs);
      if (dRep2 && tq && dRep2.quest && dRep2.quest[tq]) return dRep2.quest[tq];
      // THIÊN 5: cùng khuôn — lời nhận lấy từ sect_rep khi có việc mở.
      var tq5 = THIEN5 && THIEN5.availableQuestId(ch, flags, qs);
      if (dRep2 && tq5 && dRep2.quest && dRep2.quest[tq5]) return dRep2.quest[tq5];
    }
    // THỦY TRIỀU THEO MÙA (js/season-tide.js): đặt SAU mọi xử lý thoại
    // nhiệm vụ của story.js ở trên và TRƯỚC pool thoại chào — lời
    // nhận/trả việc tiết đã có bản soi gương ở ST.DIALOGUE nên nhánh
    // ST xử lý trước; nhánh này bắt hai trường hợp story.js không có
    // ô thoại (QA 15:46 30/10): câu NHẮC KÈM TIẾN ĐỘ khi việc tiết
    // đang dở (marker trống) và câu PHẢN ỨNG của Dì Tư (le_su không
    // phải người giao việc) khi mang lời chúc Đăng Hoa tới.
    if (TD && TD.dialogueFor) {
      var tdLines = TD.dialogueFor(npc.id, flags, qs, gameNow());
      if (tdLines) return tdLines;
    }
    var pool = (d.greeting || []).concat(d.lore || [], d.idle || []);
    if (!pool.length) return null;
    var idx = dlgCycle[npc.id] || 0;
    dlgCycle[npc.id] = idx + 1;
    return [pool[idx % pool.length]];
  }
  function openDialogue(npc) {
    // THƯƠNG NHÂN THẦN BÍ (sự kiện ngẫu nhiên, js/world-events.js):
    // nói chuyện với NPC tạm là mở thẳng panel sạp của ông ta.
    if (WE && npc.id === WE.MERCHANT_NPC_ID) { openWevShop(); return; }
    var def = npcDef(npc);
    talkingNpc = npc;
    // Quay mặt về phía NPC + gật đầu nói chuyện (động tác 'talk').
    var ndx = npc.x * TILE + 16 - px, ndy = npc.y * TILE + 28 - py;
    if (Math.abs(ndy) > Math.abs(ndx)) dir = ndy < 0 ? 'up' : 'down';
    else dir = ndx < 0 ? 'left' : 'right';
    if (ch) ch.dir = dir;
    setAction('talk', 0.5);
    var lines = dialogueLinesFor(npc) || def.lines;
    dlg = { npc: npc, def: def, lines: lines, line: 0 };
    // QA107: mo thoai thi dung ngay phim di chuyen dang giu (WASD + mui
    // ten) — neu khong, phim giu tu truoc khi bam E van keo nhan vat di
    // trong luc noi chuyen du keydown moi da bi chan o tren.
    ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].forEach(function (kk) { keys[kk] = false; });
    $('dlgName').textContent = def.name;
    var dlgRoleEl = $('dlgRole');
    if (dlgRoleEl) dlgRoleEl.textContent = def.role ? '— ' + def.role : '';
    $('dlgText').textContent = lines[0];
    renderDlgActions();
    $('dialogueBox').style.display = 'block';
    // QA 18:16 30/10: câu nhận ra dấu ấn là cao trào cảm xúc của hệ
    // nguồn gốc — mở ra phải có tiếng kỳ ngộ, không im lặng như thoại
    // thường. (Mở thoại bằng phím E cũng có tiếng ở keydown; đường
    // chạm/nút đã có tiếng bấm nút qua sound.js.)
    if (dlgOriginCue && SND) SND.sfx('kyngo');
    L.recordEvent(qs, ch, { type: 'talk', target: npc.id });
    if (BX) BX.noteNpc(flags, npc.id); // Đồ Giám: trò chuyện 1 lần là mở trang NPC
    updateHUD(); saveGame();
  }
  function renderDlgActions() {
    var box = $('dlgActions');
    box.innerHTML = '';
    if (!dlg) return;
    var nid = dlg.npc.id;
    var mk = questMarkerFor(nid);
    if (mk === '!') {
      L.availableQuests(qs).forEach(function (q) {
        if (q.giver !== nid) return;
        var b = document.createElement('button');
        b.textContent = 'Nhận nhiệm vụ: ' + q.title;
        b.onclick = function () {
          L.acceptQuest(qs, q.id);
          afterQuestAccepted(q.id);
          if (SND) SND.sfx('quest_accept');
          toast('Đã nhận nhiệm vụ: ' + q.title);
          if (q.id === 'q_chinh_5' && !(flags.event && flags.event.done)) {
            L.startBeastEvent(flags);
            spawnEventWave();
          }
          if (q.id === 'q_chinh_7') loadMapEntities();
          renderDlgActions(); updateHUD(); saveGame(); renderQuestPanel();
        };
        box.appendChild(b);
      });
    }
    if (mk === '?') {
      Object.keys(qs.accepted).forEach(function (qid) {
        var q = L.QUESTS[qid];
        if (q.giver === nid && qs.accepted[qid].done) {
          var b2 = document.createElement('button');
          b2.textContent = 'Trả nhiệm vụ: ' + q.title;
          b2.onclick = function () {
            var r = L.turnInQuest(qs, ch, qid);
            if (r.ok) {
              if (SND) SND.sfx('quest_complete');
              toast('Trả nhiệm vụ ' + q.title + ': +' + r.rewards.linhThach + ' Linh Thạch.');
              if (qid === 'q_chinh_7' || qid === 'q_chinh_5') loadMapEntities();
              if (qid === 'q_tong_thu' && PETS) {
                // Vạn Thú Môn công nhận: Giang Tiểu Thú tặng Hồ Ly (Linh phẩm).
                var gp = PETS.grantPet(ch, 'ho_ly');
                if (gp.ok) toast('Giang Tiểu Thú trao bạn một con Hồ Ly (Linh phẩm)! Mở panel Linh thú để xem.');
              }
              autoAcceptNextMain(qid);
              if (SECT) {
                SECT.afterTurnIn(flags, qid);
                if (qid === 'q_chinh_18') toast('Lễ chọn tông hoàn tất! Mở bảng Tông Môn để bái nhập một tông môn.');
              }
              if (SECTP) announceSectPoints(SECTP.onQuestTurnIn(ch, flags, qid));
              // HẢO CẢM: trả nhiệm vụ cho chính người giao thì +8 điểm
              // hảo cảm với người đó (module tự chặn cộng lặp 1 NV).
              if (AFF) {
                var affTurn = AFF.onQuestTurnIn(flags, qid, nid);
                if (affTurn.added > 0) toast('Hảo cảm với ' + affTurn.npc.name + ' +' + affTurn.added + ' (nay ' + affTurn.points + ' điểm).');
              }
              if (ALCH) {
                var newRecipes = ALCH.afterTurnIn(ch, qid);
                if (newRecipes.length) toast('Học được đan phương: ' + newRecipes.join(', ') + '! Mở Đan Lô ở hiệu thuốc của Lý lão để luyện.');
                var sectRecipes = ALCH.syncSectRecipes(ch, qs, flags);
                if (sectRecipes.length) toast('Đan Hà Cốc truyền đan phương: ' + sectRecipes.join(', ') + '!');
              }
              if (TAL) {
                var talRecipes = TAL.afterTurnIn(ch, qid);
                if (talRecipes.length) toast('Diệp Phù Sinh truyền phù phương: ' + talRecipes.join(', ') + '! Mở Bàn Phù chỗ Diệp Phù Sinh để chế phù.');
                var talBasics = TAL.teachBasics(ch, qs);
                if (talBasics.length) toast('Diệp Phù Sinh dạy phù phương Phàm phẩm: ' + talBasics.map(function (id) { var d = TAL.talismanDef(id); return d ? d.name : id; }).join(', ') + '!');
                var talSect = TAL.syncSectRecipes(ch, flags);
                if (talSect.length) toast('Thiên Phù Các truyền phù phương: ' + talSect.join(', ') + '!');
              }
              renderDlgActions(); updateHUD(); saveGame(); renderQuestPanel();
            }
          };
          box.appendChild(b2);
        }
      });
    }
    // --- KỲ NGỘ NGUỒN GỐC NHÓM B: nút gieo quẻ ở Từ bà (miếu) ---
    // NV03 chỉ mở khi đã trả q_chinh_7 + mang Lá Bùa Không Chữ +
    // chưa gặp kỳ ngộ — nút chỉ hiện đúng lúc đó, không chen vào
    // thoại nhiệm vụ (renderDlgActions chạy sau khi thoại đã chọn).
    if (nid === 'giu_mieu' && SR && SR.spotAvailable('spot_nv03', spotCtx(), flags.originFate)) {
      var bSpot = document.createElement('button');
      bSpot.textContent = 'Gieo quẻ dưới gốc đa (kỳ ngộ nguồn gốc)';
      bSpot.onclick = function () { enterOriginSpot('spot_nv03'); };
      box.appendChild(bSpot);
    }
    // --- KỲ NGỘ TÔNG NHÓM 1 (mục 22 hàng chờ): nút ở đại diện tông
    // khi đã bái nhập đúng tông đó + đã trả q_chinh_19 + chưa gặp
    // kỳ ngộ tông — nút chỉ hiện đúng lúc đó, không chen vào thoại
    // nhiệm vụ (renderDlgActions chạy sau khi thoại đã chọn).
    // Đại diện tông tra qua SECT (rep -> tông), không hardcode nid.
    if (SECT && SR && SR.sectFateAvailable) {
      var sectOfRep = null;
      SECT.SECTS.forEach(function (s) { if (s.rep === nid) sectOfRep = s; });
      if (sectOfRep && SR.sectFateAvailable(sectOfRep.id, flags, qs ? qs.turnedIn : [])) {
        (function (sid, tplName) {
          var bSect = document.createElement('button');
          bSect.textContent = 'Kỳ ngộ tông: ' + tplName;
          bSect.onclick = function () { enterSectFate(sid); };
          box.appendChild(bSect);
        })(sectOfRep.id, (SR.sectFateTemplate(sectOfRep.id) || {}).name || sectOfRep.name);
      }
    }
    // --- NGỰ KIẾM: nút chuỗi nhiệm vụ khi nói chuyện với đại diện tông ---
    if (FLIGHT && FLIGHT.isGiver(nid, flags)) {
      var fAvail = FLIGHT.availableQuestId(ch, flags, qs);
      if (fAvail) {
        var bf1 = document.createElement('button');
        bf1.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[fAvail].title;
        bf1.onclick = function () { acceptFlightQuest(); renderDlgActions(); };
        box.appendChild(bf1);
      }
      var fAct = FLIGHT.activeQuestId(qs);
      if (fAct && qs.accepted[fAct].done) {
        var bf2 = document.createElement('button');
        bf2.textContent = 'Trả nhiệm vụ: ' + L.QUESTS[fAct].title;
        bf2.onclick = function () { turnInFlightQuest(); renderDlgActions(); };
        box.appendChild(bf2);
      } else if (fAct === 'q_ngu_kiem_1') {
        var bf3 = document.createElement('button');
        bf3.textContent = 'Đúc linh kiếm phôi (kiếm Linh+ + ' + FLIGHT.FORGE.linhThach + ' Linh Thạch + ' + FLIGHT.FORGE.itemN + ' Linh Chi)';
        bf3.onclick = function () { doFlyForge(); };
        box.appendChild(bf3);
      } else if (fAct === 'q_ngu_kiem_2') {
        var bf4 = document.createElement('button');
        bf4.textContent = 'Dựng Hình Nhân Kiếm Khí (Bãi Luyện Công)';
        bf4.onclick = function () { startFlyDuel(); };
        box.appendChild(bf4);
      } else if (fAct === 'q_ngu_kiem_3') {
        var bf5 = document.createElement('button');
        bf5.textContent = 'Bắt đầu bài bay thử (5 cột mốc)';
        bf5.onclick = function () { startFlyTrial(); };
        box.appendChild(bf5);
      }
    }
    // --- ARC 13-20: nút nhiệm vụ biến thể theo tông ở đại diện tông ---
    if (SECTARC && SECTARC.isGiver(nid, flags)) {
      var aAvail = SECTARC.availableQuestId(ch, flags, qs);
      if (aAvail) {
        var ba1 = document.createElement('button');
        ba1.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[aAvail].title;
        ba1.onclick = function () { acceptSectArcQuest(); renderDlgActions(); };
        box.appendChild(ba1);
      }
      var aAct = SECTARC.activeQuestId(qs);
      if (aAct && qs.accepted[aAct].done) {
        var ba2 = document.createElement('button');
        ba2.textContent = 'Trả nhiệm vụ: ' + L.QUESTS[aAct].title;
        ba2.onclick = function () { turnInSectArcQuest(); renderDlgActions(); };
        box.appendChild(ba2);
      }
    }
    // --- THIÊN 4 ch.25-27: nút nhiệm vụ tranh linh mạch ở đại diện tông ---
    if (THIEN4 && THIEN4.isGiver(nid, flags)) {
      var tAvail = THIEN4.availableQuestId(ch, flags, qs);
      if (tAvail) {
        var tb1 = document.createElement('button');
        tb1.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[tAvail].title;
        tb1.onclick = function () { acceptThien4Quest(); renderDlgActions(); };
        box.appendChild(tb1);
      }
      var tAct = THIEN4.activeQuestId(qs);
      if (tAct && qs.accepted[tAct].done) {
        var tb2 = document.createElement('button');
        tb2.textContent = 'Trả nhiệm vụ: ' + L.QUESTS[tAct].title;
        tb2.onclick = function () { turnInThien4Quest(nid); renderDlgActions(); };
        box.appendChild(tb2);
      }
    }
    // --- THIÊN 5 ch.28-30: nút nhiệm vụ vụ án đan độc ở đại diện tông ---
    if (THIEN5 && THIEN5.isGiver(nid, flags)) {
      var t5Avail = THIEN5.availableQuestId(ch, flags, qs);
      if (t5Avail) {
        var tb51 = document.createElement('button');
        tb51.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[t5Avail].title;
        tb51.onclick = function () { acceptThien5Quest(); renderDlgActions(); };
        box.appendChild(tb51);
      }
      var t5Act = THIEN5.activeQuestId(qs);
      if (t5Act && qs.accepted[t5Act].done) {
        var tb52 = document.createElement('button');
        tb52.textContent = 'Trả nhiệm vụ: ' + L.QUESTS[t5Act].title;
        tb52.onclick = function () { turnInThien5Quest(nid); renderDlgActions(); };
        box.appendChild(tb52);
      }
    }
    // --- VẾT NỨT HƯ KHÔNG: nút nhiệm vụ sự kiện ở đại diện tông ---
    if (RIFT && RIFT.isGiver(nid, flags)) {
      var rAvail = RIFT.availableQuestId(ch, flags, qs);
      if (rAvail) {
        var br1 = document.createElement('button');
        br1.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[rAvail].title;
        br1.onclick = function () { acceptRiftQuest(); renderDlgActions(); };
        box.appendChild(br1);
      }
      var rAct = RIFT.activeQuestId(qs);
      if (rAct && qs.accepted[rAct].done) {
        var br2 = document.createElement('button');
        br2.textContent = 'Trả nhiệm vụ: ' + L.QUESTS[rAct].title;
        br2.onclick = function () { turnInRiftQuest(); renderDlgActions(); };
        box.appendChild(br2);
      }
    }
    // --- LỄ HỘI: nút việc lễ + mở Tủ Đồ khi nói chuyện với Dì Tư ---
    if (WD && nid === WD.FEST_NPC.id) {
      var wAvail = WD.availableFestQuestId(qs, ch, Date.now());
      if (wAvail) {
        var bw1 = document.createElement('button');
        bw1.textContent = 'Nhận việc lễ: ' + L.QUESTS[wAvail].title;
        bw1.onclick = function () { acceptFestQuest(); renderDlgActions(); };
        box.appendChild(bw1);
      }
      var wAct = WD.activeFestQuestId(qs);
      if (wAct && qs.accepted[wAct].done) {
        var bw2 = document.createElement('button');
        bw2.textContent = 'Trả việc lễ: ' + L.QUESTS[wAct].title;
        bw2.onclick = function () { turnInFestQuest(); renderDlgActions(); };
        box.appendChild(bw2);
      }
      var bw3 = document.createElement('button');
      bw3.textContent = 'Tủ Đồ: y phục & lễ hội';
      bw3.onclick = function () { closeDialogue(); openWardrobePanel(); };
      box.appendChild(bw3);
    }
    if (nid === 'dai_phu' && ART) {
      var ba = document.createElement('button');
      ba.textContent = 'Tiệm pháp khí: mua / chế tạo / thu mua pháp bảo';
      ba.onclick = function () { closeDialogue(); openArtShop(); };
      box.appendChild(ba);
    }
    // --- THÚ TRIỀU: Chấp Sự Thủ Triều mở panel sự kiện; đủ điều kiện
    // trong phiên thì nhận nhiệm vụ thủ thành ngay tại đây ---
    if (BT && nid === BT.STEWARD.id) {
      var btp = document.createElement('button');
      btp.textContent = 'Thú Triều Thủ Hộ Làng: xem bảng sự kiện';
      btp.onclick = function () { closeDialogue(); openBeastTidePanel(); };
      box.appendChild(btp);
      var bst2 = BT.ensure(flags);
      if (bst2 && bst2.run) {
        var btf = document.createElement('button');
        btf.textContent = 'Bỏ thủ thành (thưởng tính theo số đợt đã giữ)';
        btf.onclick = function () { closeDialogue(); onTideFinish(BT.forfeit(flags)); };
        box.appendChild(btf);
      } else if (BT.canJoin(flags, ch, Date.now()).ok) {
        var btj = document.createElement('button');
        btj.textContent = 'Nhận nhiệm vụ thủ thành — ra cổng Nam Môn!';
        btj.onclick = function () { closeDialogue(); startTideRun(); };
        box.appendChild(btj);
      }
    }
    // --- HỘ TỐNG: Mã Vạn Lai giao chuyến hàng / bỏ chuyến đang chạy ---
    if (ESC && nid === ESC.GIVER_ID) {
      var escSt = ESC.ensure(flags);
      var escBtn = document.createElement('button');
      escBtn.textContent = 'Hộ Tống Thương Đội: xem bảng chuyến hàng';
      escBtn.onclick = function () { closeDialogue(); openEscortPanel(); };
      box.appendChild(escBtn);
      if (escSt && escSt.run) {
        var ebf = document.createElement('button');
        ebf.textContent = 'Bỏ chuyến hộ tống (không có tiền công)';
        ebf.onclick = function () { closeDialogue(); onEscortFinish(ESC.forfeit(flags)); };
        box.appendChild(ebf);
      } else if (ESC.canStart(flags, qs, ch, curMapId).ok) {
        var ebj = document.createElement('button');
        ebj.textContent = 'Nhận hộ tống — đưa hàng lên Trạm Buôn Chân Núi!';
        ebj.onclick = function () { closeDialogue(); startEscortRun(); };
        box.appendChild(ebj);
      }
    }
    // --- BẢNG MÙA: Thẩm Ký mở panel Bảng Xếp Hạng Tu Sĩ Theo Mùa ---
    if (SB && nid === SB.KEEPER.id) {
      var sbb = document.createElement('button');
      sbb.textContent = 'Bảng Xếp Hạng Tu Sĩ Theo Mùa: xem bảng';
      sbb.onclick = function () { closeDialogue(); openSeasonPanel(); };
      box.appendChild(sbb);
    }
    // --- TÀNG KINH CÁC: thủ thư Cổ Mặc — nhận việc giữ sách + mở
    // quầy đổi sách trong panel Tông Môn (chỉ đệ tử đã bái nhập mới
    // thấy nút mở quầy; chưa bái nhập thì thoại đã giải thích luật).
    if (LIB && nid === LIB.LIBRARIAN.id) {
      var lAvail = LIB.availableQuestId(ch, flags, qs);
      if (lAvail) {
        var lb1 = document.createElement('button');
        lb1.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[lAvail].title;
        lb1.onclick = function () { acceptLibraryQuest(); renderDlgActions(); };
        box.appendChild(lb1);
      }
      if (flags.sectJoined) {
        var lb2 = document.createElement('button');
        lb2.textContent = 'Tàng Kinh Các: mở kệ sách của tông';
        lb2.onclick = function () { closeDialogue(); renderSectPanel(); $('panelSects').style.display = 'block'; };
        box.appendChild(lb2);
      }
    }
    // --- HẢO CẢM (js/affinity.js): nút mở sổ hảo cảm / tặng quà cho
    // đúng NPC đang nói chuyện (không chen vào thoại nhiệm vụ).
    if (AFF && AFF.npcById(nid)) {
      var affB = document.createElement('button');
      affB.textContent = 'Hảo cảm: tặng quà / xem sổ';
      affB.onclick = function () { closeDialogue(); openAffinityPanel(); };
      box.appendChild(affB);
    }
    // --- ĐẤU GIÁ: Kim Vạn Thông mở panel Phiên Đấu Giá Liên Tông ---
    if (AUC && nid === AUC.AUCTIONEER.id) {
      var aub = document.createElement('button');
      aub.textContent = 'Phiên Đấu Giá Liên Tông: xem bảng đấu giá';
      aub.onclick = function () { closeDialogue(); openAuctionPanel(); };
      box.appendChild(aub);
    }
    // --- THIÊN CƠ ĐỒ GIÁM: Lục Tiểu Lục mở sổ tay hành trình ---
    if (BX && nid === BX.KEEPER.id) {
      var bxb = document.createElement('button');
      bxb.textContent = 'Thiên Cơ Đồ Giám: xem sổ tay hành trình';
      bxb.onclick = function () { closeDialogue(); openBestiaryPanel(); };
      box.appendChild(bxb);
    }
    // --- CHỢ PHIÊN: Lục Tiểu Lục coi sạp phiên của thương đội Mã ---
    if (FAIR && nid === FAIR.KEEPER.id) {
      var frb = document.createElement('button');
      frb.textContent = 'Chợ Phiên Thanh Khê: xem sạp phiên';
      frb.onclick = function () { closeDialogue(); openFairPanel(); };
      box.appendChild(frb);
    }
    // --- BIA TRUYỀN KỲ: Thẩm Ký mở bia đá (cùng người giữ Bảng Mùa) ---
    if (LG && nid === LG.KEEPER.id) {
      var lgb = document.createElement('button');
      lgb.textContent = 'Bia Truyền Kỳ: xem dấu mốc';
      lgb.onclick = function () { closeDialogue(); openLegendPanel(); };
      box.appendChild(lgb);
    }
    // --- ĐỒNG HÀNH: đại diện của tông đã bái nhập mới có nút mời —
    // KHÔNG chen vào dialogueLinesFor (đại diện tông còn có thoại nhiệm
    // vụ q_tong_*; chen vào sẽ nuốt thoại nhiệm vụ). Nút chỉ hiện ở
    // đúng người đại diện đó, tại bãi tuyển map 3.
    if (COMP && SECT && flags.sectJoined) {
      var compInvite = COMP.recruitButtonFor(nid, flags);
      if (compInvite) {
        var cbi = document.createElement('button');
        cbi.textContent = 'Mời đồng hành: ' + compInvite.name + ' (' + compInvite.sectName + ')';
        cbi.onclick = function () {
          var r = COMP.recruit(flags, ch);
          if (r.ok) {
            syncCompEnt(true);
            toast(r.companion.name + ' đã nhận lời đi cùng bạn! "' + r.companion.recruitLine + '"');
            if (SND) SND.sfx('quest_complete'); // QA 16:31 30/10: mời được đồng hành là mốc quan hệ — phải có tiếng
            updateHUD(); saveGame();
          } else {
            toast('Chưa mời được đồng hành.');
          }
          closeDialogue(); openCompanionPanel();
        };
        box.appendChild(cbi);
      } else if (COMP.recruitedCompanion(flags)) {
        var joinedDef = SECT.sectById(flags.sectJoined);
        if (joinedDef && joinedDef.rep === nid) {
          var cbp = document.createElement('button');
          cbp.textContent = 'Bạn đi cùng: xem bảng ' + COMP.recruitedCompanion(flags).name;
          cbp.onclick = function () { closeDialogue(); openCompanionPanel(); };
          box.appendChild(cbp);
        }
      }
    }
    // --- KẾT NGHĨA: đại diện tông đã bái nhập — nhận/trả chuỗi kết nghĩa
    // (js/sworn.js). Nút chỉ hiện ở đúng đại diện tông đó, tại bãi
    // tuyển map 3; chưa đủ cổng thì thoại của người này đã giải thích.
    if (SWN && SWN.isRep(nid, flags)) {
      var knAvail = SWN.availableQuestId(ch, flags, qs);
      if (knAvail) {
        var knb1 = document.createElement('button');
        knb1.textContent = 'Nhận nhiệm vụ: ' + L.QUESTS[knAvail].title;
        knb1.onclick = function () { acceptSwornQuest(); renderDlgActions(); };
        box.appendChild(knb1);
      }
      var knAct = SWN.activeQuestId(qs);
      if (knAct && qs.accepted[knAct].done) {
        var knb2 = document.createElement('button');
        knb2.textContent = 'Trả nhiệm vụ: ' + L.QUESTS[knAct].title;
        knb2.onclick = function () { turnInSwornQuest(nid); renderDlgActions(); };
        box.appendChild(knb2);
      }
    }
    // --- THỦY TRIỀU THEO MÙA: NPC làng — nhận/trả việc tiết của tiết hiện tại
    if (TD) {
      var tdAvail = TD.availableQuestId(ch, flags, qs, new Date(gameNow()));
      if (tdAvail && TD.QUEST_META[tdAvail].giver === nid) {
        var tdb1 = document.createElement('button');
        tdb1.textContent = 'Nhận việc tiết: ' + L.QUESTS[tdAvail].title;
        tdb1.onclick = function () { acceptTideQuest(); renderDlgActions(); };
        box.appendChild(tdb1);
      }
      var tdAct = TD.activeQuestId(qs);
      if (tdAct && qs.accepted[tdAct].done && TD.QUEST_META[tdAct].giver === nid) {
        var tdb2 = document.createElement('button');
        tdb2.textContent = 'Trả việc tiết: ' + L.QUESTS[tdAct].title;
        tdb2.onclick = function () { turnInTideQuest(nid); renderDlgActions(); };
        box.appendChild(tdb2);
      }
    }
    // --- ĐẠI HỘI: Chấp Sự mở panel Đại Hội; có kỳ đang chạy thì vào trận ngay ---
    if (TOURN && nid === TOURN.STEWARD.id) {
      var bt = document.createElement('button');
      bt.textContent = 'Đại Hội Tu Tiên: ghi danh / bảng xếp hạng';
      bt.onclick = function () { closeDialogue(); openTournamentPanel(); };
      box.appendChild(bt);
      var tst = TOURN.ensure(flags);
      if (tst && tst.run && (tst.run.phase === 'await' || tst.run.phase === 'live')) {
        var bf = document.createElement('button');
        bf.textContent = 'Vào trận: ' + TOURN.roundNameOf(tst.run);
        bf.onclick = function () { closeDialogue(); startTournMatch(); };
        box.appendChild(bf);
      }
    }
    if ((nid === 'dai_phu' || nid === 'hoc_tro') && ALCH) {
      var bd = document.createElement('button');
      bd.textContent = 'Đan Lô: học đan phương / luyện đan';
      bd.onclick = function () { closeDialogue(); openAlchemyPanel(); };
      box.appendChild(bd);
    }
    if (nid === 'truong_lang' && MANU) {
      var bbk = document.createElement('button');
      bbk.textContent = 'Tủ sách làng: bí tịch vỡ lòng / pháp quyết nhập môn';
      bbk.onclick = function () { closeDialogue(); openBooksPanel(); };
      box.appendChild(bbk);
    }
    if (nid === 'tong_phu' && TAL) {
      var bp = document.createElement('button');
      bp.textContent = 'Bàn Phù: mua giấy/chu sa · chế phù';
      bp.onclick = function () { closeDialogue(); openTalismanPanel(); };
      box.appendChild(bp);
    }
    if (nid === 'tho_ren' && W) {
      // Trả xong nhiệm vụ "Da sói cho thợ rèn": Thiết Cường tặng kiếm rèn đầu tay.
      if (L.isTurnedIn(qs, 'q_phu_da') && !flags.smithGift) {
        var bg = document.createElement('button');
        bg.textContent = 'Nhận Thiết Phong Kiếm (Thiết Cường tặng)';
        bg.onclick = function () {
          if (W.addWeapon(ch, 'kiem_sat')) {
            flags.smithGift = true;
            toast('Thiết Cường tặng bạn Thiết Phong Kiếm! Mở Túi đồ để đeo.');
          }
          renderDlgActions(); updateHUD(); saveGame();
        };
        box.appendChild(bg);
      }
      var bs = document.createElement('button');
      bs.textContent = 'Lò rèn: mua / chế tạo / thu mua vũ khí';
      bs.onclick = function () { closeDialogue(); openShop(); };
      box.appendChild(bs);
    }
    if (PETS) {
      PETS.ensurePets(ch);
      if (nid === 'tho_san_ha' && !ch.pets.flags.starterHa) {
        var bh = document.createElement('button');
        bh.textContent = 'Nhận Sói Con của Hà Thiết Sơn (thú đầu tiên)';
        bh.onclick = function () {
          var g = PETS.grantPet(ch, 'soi_con');
          if (g.ok) {
            ch.pets.flags.starterHa = true;
            syncPetEnt(true);
            toast('Hà Thiết Sơn giao bạn một con Sói Con! Nó sẽ theo bạn và tự đánh quái gần.');
          } else toast('Chuồng đã đầy, không nhận thêm được.');
          renderDlgActions(); updateHUD(); saveGame();
        };
        box.appendChild(bh);
      }
      if (nid === 'tong_thu') {
        var bt = document.createElement('button');
        bt.textContent = 'Chuồng linh thú (Vạn Thú Môn xem hộ)';
        bt.onclick = function () { closeDialogue(); openPetPanel(); };
        box.appendChild(bt);
      }
      // Trạm dừng chân dọc Đại Sơn (mục 42 hàng chờ): người giữ trạm là
      // người của thương đội Mã Vạn Lai nên bán lại đúng 2 món của thương
      // đội, đúng giá sẵn có (Bùa 30 LT, Trứng 250 LT) — không thêm món.
      if (nid === 'thuong_nhan_ma' || nid === 'tram_chi_dinh' || nid === 'tram_xich_diem') {
        var bc = document.createElement('button');
        bc.textContent = 'Mua Bùa Ngự Thú — ' + PETS.CHARM_PRICE + ' Linh Thạch (đang có ' + PETS.countItem(ch, PETS.CHARM_ID) + ')';
        bc.onclick = function () {
          var r = PETS.buyCharm(ch, 1);
          if (r.ok && SND) SND.sfx('shop_buy');
          toast(r.ok ? 'Đã mua 1 Bùa Ngự Thú. Lại gần quái hoang đúng loài còn dưới 35% máu rồi bấm nút Thu phục.' : 'Không đủ Linh Thạch.');
          renderDlgActions(); updateHUD(); saveGame();
        };
        box.appendChild(bc);
        var be = document.createElement('button');
        be.textContent = 'Mua Trứng Linh Thú Ngẫu Nhiên — ' + PETS.EGG_PRICE + ' Linh Thạch';
        be.onclick = function () {
          var r2 = PETS.buyEgg(ch, Math.random);
          if (r2.ok) { if (SND) SND.sfx('shop_buy'); toast('Nhận được trứng ' + PETS.species(r2.egg.sp).name + '! Ấp tự chạy theo thời gian chơi — xem ở panel Linh thú.'); }
          else toast(r2.reason === 'egg_full' ? 'Đang ấp quá nhiều trứng.' : 'Không đủ Linh Thạch.');
          renderDlgActions(); updateHUD(); saveGame();
        };
        box.appendChild(be);
      }
    }
  }
  function afterQuestAccepted(qid) {
    // Nhận q_chinh_2 SAU khi đã lộ linh căn ở giếng: mục tiêu giếng coi như đã
    // xong ngay lúc nhận, nếu không nhiệm vụ kẹt 0/1 vĩnh viễn (giếng chỉ cấp
    // linh căn một lần, bấm lại không ghi sự kiện nữa).
    if (qid === 'q_chinh_2' && flags.kyNgo) L.recordEvent(qs, ch, { type: 'well' });
  }
  function autoAcceptNextMain(turnedInQid) {
    Object.keys(L.QUESTS).forEach(function (qid) {
      var q = L.QUESTS[qid];
      if (q.main && q.requires === turnedInQid && !qs.accepted[qid] && L.isTurnedIn(qs, qid) === false) {
        L.acceptQuest(qs, qid);
        afterQuestAccepted(qid);
        toast('Nhiệm vụ chính mới: ' + q.title);
        // BUG (kiểm chứng live 21:43 30/10): q_chinh_5 được TỰ nhận ở
        // đây thì trước đây KHÔNG bật sự kiện thú dữ (chỉ đường bấm
        // nút Nhận trong thoại mới bật) -> người chơi có nhiệm vụ mà
        // sự kiện không bao giờ kích hoạt, không đợt sói nào xuất
        // hiện. Bật cờ + spawn ngay như đường thoại (đang ở map 1
        // khi trả q_chinh_4; khác map thì loadMapEntities lo).
        if (qid === 'q_chinh_5' && !(flags.event && flags.event.done)) {
          L.startBeastEvent(flags);
          if (curMapId === 'map1') spawnEventWave();
        }
      }
    });
  }
  function closeDialogue() { dlg = null; talkingNpc = null; $('dialogueBox').style.display = 'none'; }
  $('dlgNext').addEventListener('click', function () {
    if (!dlg) return;
    var lines = dlg.lines || dlg.def.lines;
    if (dlg.line < lines.length - 1) {
      dlg.line += 1;
      $('dlgText').textContent = lines[dlg.line];
    } else closeDialogue();
  });
  $('dlgClose').addEventListener('click', closeDialogue);
  // Mục mobile-controls 31/10: bấm vào VÙNG CHỮ thoại cũng lật trang
  // (trước đây chỉ nút "Tiếp" nhỏ mới có listener — trên điện thoại
  // người chơi chạm thẳng vào đoạn chữ theo thói quen game mobile).
  var dlgTextEl = $('dlgText');
  if (dlgTextEl) dlgTextEl.addEventListener('click', function () { $('dlgNext').click(); });
  // Bán kính nói chuyện với NPC: 72px (đứng cách 2 ô vẫn bắt chuyện được).
  // Trước đây 52px chỉ đủ khi kề sát đúng 1 ô; trên trình duyệt thật ảnh nền
  // AI warp lệch nhẹ so với ô logic nên người chơi hay đứng cách ~2 ô cạnh
  // lán/xe/miếu trong hình nền -> bấm E vô hiệu như NPC hỏng.
  var NPC_TALK_DIST = 72;
  // Chọn mục tiêu tương tác GẦN NHẤT trong tầm (NPC 72 / giếng 56 / dược 48),
  // hòa thì ưu tiên NPC > giếng > dược. Nhờ vậy đứng sát giếng thì E xem giếng
  // dù trưởng làng cũng lọt vào tầm nói chuyện mở rộng.
  function nearestInteractable() {
    var best = null;
    var npc = nearestNpc(NPC_TALK_DIST);
    if (npc) {
      var nd = Math.sqrt(Math.pow(npc.x * TILE + 16 - px, 2) + Math.pow(npc.y * TILE + 28 - py, 2));
      best = { kind: 'npc', npc: npc, dist: nd };
    }
    var mp = curMap();
    if (mp.well) {
      var wd = Math.sqrt(Math.pow(mp.well.x * TILE + 16 - px, 2) + Math.pow(mp.well.y * TILE + 28 - py, 2));
      // Sau kỳ ngộ, giếng không được cướp tương tác của NPC đang
      // trong tầm nói chuyện chỉ vì nó gần hơn vài px (playtest live
      // 31/10: đứng nam giếng bấm E mãi vẫn "xem giếng lặng yên" thay
      // vì gặp trưởng làng đứng ngay cạnh) — NHƯNG chỉ khi việc quay
      // lại giếng không còn ý nghĩa nhiệm vụ: q_chinh_2 đang dở thì
      // bấm E ở giếng vẫn phải mở giếng để ghi sự kiện hoàn thành
      // (đường save cũ lộ linh căn trước khi nhận nhiệm vụ), và điểm
      // kỳ ngộ NV05 đang chờ ở giếng cũng vậy.
      var q2Pending = !!(qs.accepted && qs.accepted.q_chinh_2 && !qs.accepted.q_chinh_2.done);
      var wellSpent = flags.kyNgo && !q2Pending && !(SR && SR.spotAvailable && SR.spotAvailable('spot_nv05', spotCtx(), flags.originFate));
      if (wd <= 56 && (!best || (wd < best.dist && !(wellSpent && best.kind === 'npc')))) best = { kind: 'well', dist: wd };
    }
    // Cổng bí cảnh định kỳ: khe nứt cạnh giếng cổ, chỉ hiện khi phiên đang mở.
    if (SR && curMapId === SR.SCHEDULED.gateMap && (SR.status(flags, gameNow()).open || (SR.anyOpen && SR.anyOpen(gameNow())))) {
      var gd = Math.sqrt(Math.pow(SR.SCHEDULED.gate.x * TILE + 16 - px, 2) + Math.pow(SR.SCHEDULED.gate.y * TILE + 28 - py, 2));
      if (gd <= 56 && (!best || gd < best.dist)) best = { kind: 'realmGate', dist: gd };
    }
    // VẾT NỨT HƯ KHÔNG: khe nứt sự kiện trên map thường, chỉ hiện khi
    // đang trong 30 phút mở của chu kỳ (js/rift-events.js).
    if (RIFT) {
      var rinfo = RIFT.cycleInfo(Date.now());
      if (rinfo.active && curMapId === rinfo.anchor.mapId) {
        var rd2 = Math.sqrt(Math.pow(rinfo.anchor.x * TILE + 16 - px, 2) + Math.pow(rinfo.anchor.y * TILE + 28 - py, 2));
        if (rd2 <= 56 && (!best || rd2 < best.dist)) best = { kind: 'riftGate', dist: rd2 };
      }
    }
    // Bia sào huyệt boss thế giới: chạm để xem lịch hồi sinh + bảng rơi.
    if (BOS) {
      var steles = BOS.steleList(curMapId);
      for (var si = 0; si < steles.length; si++) {
        var sd = Math.sqrt(Math.pow(steles[si].x * TILE + 16 - px, 2) + Math.pow(steles[si].y * TILE + 28 - py, 2));
        if (sd <= 56 && (!best || sd < best.dist)) best = { kind: 'stele', bossId: steles[si].bossId, dist: sd };
      }
    }
    // Cửa đá Động Phủ ở map 1 (sau giếng cổ): mở panel phủ riêng/linh điền.
    if (DP && curMapId === DP.GATE_MAP) {
      var cgd = Math.sqrt(Math.pow(DP.GATE.x * TILE + 16 - px, 2) + Math.pow(DP.GATE.y * TILE + 28 - py, 2));
      if (cgd <= 56 && (!best || cgd < best.dist)) best = { kind: 'caveGate', dist: cgd };
    }
    // Trong động phủ: ô linh điền gần nhất (48px) + cửa ra (56px).
    if (DP && curMapId === DP.MAP_ID) {
      for (var dgi = 0; dgi < DP.PLOT_TILES.length; dgi++) {
        var dgp = DP.PLOT_TILES[dgi];
        var dgd = Math.sqrt(Math.pow(dgp.x * TILE + 16 - px, 2) + Math.pow(dgp.y * TILE + 28 - py, 2));
        if (dgd <= 48 && (!best || dgd < best.dist)) best = { kind: 'garden', plot: dgi, dist: dgd };
      }
      var exd = Math.sqrt(Math.pow(DP.EXIT_TILE.x * TILE + 16 - px, 2) + Math.pow(DP.EXIT_TILE.y * TILE + 28 - py, 2));
      if (exd <= 56 && (!best || exd < best.dist)) best = { kind: 'caveExit', dist: exd };
    }
    // ĐIỂM KÍCH HOẠT KỲ NGỘ NGUỒN GỐC NHÓM B (suối linh / vườn đào):
    // miếu (Từ bà) đi qua nút thoại, giếng cổ đi qua interactWell —
    // vòng này chỉ bắt các điểm ngoài trời còn lại, ưu tiên sau NPC /
    // giếng / cổng / bia / cửa phủ nhưng trước dược.
    if (SR && SR.SPOT_TEMPLATES) {
      SR.SPOT_TEMPLATES.forEach(function (sp) {
        if (!sp.anchor || sp.anchor.mapId !== curMapId) return;
        if (!SR.spotAvailable(sp.id, spotCtx(), flags.originFate)) return;
        var sd = Math.sqrt(Math.pow(sp.anchor.x * TILE + 16 - px, 2) + Math.pow(sp.anchor.y * TILE + 28 - py, 2));
        if (sd <= 56 && (!best || sd < best.dist)) best = { kind: 'originSpot', spotId: sp.id, dist: sd };
      });
    }
    var herb = nearestHerb(48);
    if (herb) {
      var hd = Math.sqrt(Math.pow(herb.x * TILE + 16 - px, 2) + Math.pow(herb.y * TILE + 28 - py, 2));
      if (!best || hd < best.dist) best = { kind: 'herb', herb: herb, dist: hd };
    }
    return best;
  }
  function interact() {
    if (dlg) { $('dlgNext').click(); return; }
    if (deathPending) return;
    if (flying) landPlayer(true); // nói chuyện/hái đồ phải đứng trên đất
    var t = nearestInteractable();
    if (t) {
      if (t.kind === 'npc') { openDialogue(t.npc); return; }
      if (t.kind === 'well') { interactWell(); return; }
      if (t.kind === 'realmGate') { openRealmPanel(); return; }
      if (t.kind === 'riftGate') { openRiftPanel(); return; }
      if (t.kind === 'stele') { openBossPanel(t.bossId); return; }
      if (t.kind === 'caveGate') { openDongPhuPanel(); return; }
      if (t.kind === 'caveExit') { exitCave(); return; }
      if (t.kind === 'garden') { openDongPhuPanel(t.plot); return; }
      if (t.kind === 'originSpot') { enterOriginSpot(t.spotId); return; }
      var herb = t.herb;
      herb.taken = true;
      // THỦY TRIỀU THEO MÙA (js/season-tide.js): Tiết Linh Tố dược
      // mọc lại nhanh hơn 25%, Tiết Thú Dữ (mùa khô) chậm hơn 50%.
      var tdHerbMult = TD ? TD.herbRespawnMult(new Date(gameNow())) : 1;
      herb.respawnAt = herb.treasure ? 0 : Date.now() + Math.round((ALCH ? ALCH.respawnMs(herb.item) : 30000) * tdHerbMult);
      if (herb.treasure && SR && SR.markTreasureTaken) SR.markTreasureTaken(flags, herb.x, herb.y);
      // VẾT NỨT: hái địa bảo trong cảnh của vết nứt → tiến độ nhiệm vụ 4.
      if (herb.treasure && RIFT) {
        var rtq = RIFT.noteTreasureTaken(flags, qs);
        if (rtq.questDone) toast('Mảnh trời rơi đã vào tay! Về gặp đại diện tông môn để trả nhiệm vụ "' + L.QUESTS[rtq.questDone].title + '".');
      }
      setAction('gather', 0.55); // cúi người hái dược
      if (SND) SND.sfx('gather');
      L.addItem(ch, herb.item, 1);
      // SỰ KIỆN NGẪU NHIÊN: cổ vật vùi lấp — hái dược ở map cày có
      // 1% thấy cổ vật người xưa bị đất trồi lên (js/world-events.js).
      if (WE && WE.isFarmMap(curMapId)) {
        var grel = WE.rollRelic(Math.random);
        if (grel) {
          L.addItem(ch, grel, 1); WE.noteRelic(flags);
          toast('Dưới gốc dược có vật cứng — ' + (L.ITEMS[grel] ? L.ITEMS[grel].name : grel) + '! (bán cho Thương Nhân Thần Bí khi ông ta ghé làng)');
        }
      }
      // Thống kê + thành tựu (20:22/20:24): đếm dược hái từ bản này.
      lifetimeStats().herbs++;
      flags.achEv = flags.achEv || {}; flags.achEv.herb = 1;
      // (gieo ở linh điền trong động phủ — js/dong-phu.js).
      if (DP && ALCH && ALCH.herbDef(herb.item)) {
        var seedDrop = DP.onWildGather(ch, herb.item, Math.random);
        if (seedDrop && L.ITEMS[seedDrop]) toast('Hạt giống rơi kèm theo dược! Nhận 1 ' + L.ITEMS[seedDrop].name + '.');
      }
      L.recordEvent(qs, ch, { type: 'collect', target: herb.item });
      toast(herb.treasure ? 'Thiên tài địa bảo! Nhặt được 1 ' + L.ITEMS[herb.item].name + '!' : 'Hái được 1 ' + L.ITEMS[herb.item].name + '.');
      onRealmGather();
      updateHUD(); saveGame(); renderQuestPanel();
      return;
    }
    toast('Quanh đây không có gì để tương tác.');
  }
  function interactWell() {
    setAction('gather', 0.55); // nghiêng người xem giếng cổ
    // ĐIỂM KÍCH HOẠT NV05: sau chương 5, tới giếng cổ nghe tiếng
    // chuông không người gõ — vào kỳ ngộ thay vì chỉ xem giếng lặng.
    if (SR && SR.spotAvailable('spot_nv05', spotCtx(), flags.originFate)) { enterOriginSpot('spot_nv05'); return; }
    if (flags.kyNgo) {
      // Đã lộ linh căn rồi: không cấp lại, nhưng vẫn ghi sự kiện giếng để
      // q_chinh_2 ("Bí mật giếng cổ") hoàn thành được khi người chơi lộ linh
      // căn trước lúc nhận nhiệm vụ (kể cả save cũ đã lỡ thứ tự) — trước đây
      // return sớm ở đây làm nhiệm vụ kẹt 0/1 vĩnh viễn.
      L.recordEvent(qs, ch, { type: 'well' });
      saveGame(); renderQuestPanel();
      toast('Giếng cổ lặng yên. Điềm lạ ngày ấy đã qua.');
      return;
    }
    var root = L.drawRoot();
    ch.root = root.id;
    flags.kyNgo = true;
    L.recordEvent(qs, ch, { type: 'well' });
    $('kyRootName').textContent = root.name;
    $('kyRootName').style.color = root.color;
    $('kyRootDesc').textContent = root.desc + ' Từ nay bạn có thể thổ nạp tu luyện.';
    $('modalKyNgo').style.display = 'block';
    if (SND) SND.sfx('kyngo');
    if (SK) { checkUnlockNotices(); refreshSkillIcons(); }
    updateHUD(); saveGame(); renderQuestPanel();
  }
  $('kyClose').addEventListener('click', function () { $('modalKyNgo').style.display = 'none'; });
  // Hồi chiêu đánh thường CHUNG cho mọi đường gọi (phím Space, nút
  // Đánh cảm ứng, Auto): 0,9s/đòn — đúng nhịp Auto sẵn có của game.
  // Trước đây attack() không có hồi chiêu nào: giữ Space ra ~30
  // đòn/giây theo tốc độ lặp phím, nhanh hơn Auto 20-30 lần (QA (f)
  // 02:46 31/10). Chỉ tính hồi chiêu khi vung trúng mục tiêu thật —
  // chém hụt vào không khí thì bấm lại ngay được.
  var ATK_CD_MS = 900, lastAtkAt = 0;
  function attack() {
    if (deathPending) return;
    if (flying) landPlayer(true); // vào chiến đấu là tự hạ khỏi kiếm
    var nowA = Date.now();
    if (nowA - lastAtkAt < ATK_CD_MS) return; // đang hồi chiêu: bỏ qua lặng lẽ
    var m = nearestMonsterMelee();
    if (!m && PROPS) {
      // Không có quái trong tầm: vung vào prop thu hoạch được trước mặt
      // (lúa ruộng...) thì thành cú thu hoạch — cùng nhịp hồi chiêu và
      // động tác chém như đánh quái (ATLAS LAB tích hợp 31/10).
      var hprops = PROPS.harvestNear(curMapId, px, py, dir, gfxLevel, Date.now());
      if (hprops.length) { harvestProps(hprops); return; }
    }
    if (!m) { toast('Không có quái gần đây.'); if (SND) SND.sfx('swing_miss'); return; }
    lastAtkAt = nowA;
    faceToward(m);
    // Combo 3 đòn: đánh tiếp trong 1,2s thì sang đòn kế, đòn 3 mạnh +30%.
    if (SK) {
      comboStep = comboTimer > 0 ? (comboStep + 1) % 3 : 0;
      comboTimer = 1.2;
      spawnEffect({ skill: 'combo', x: px, y: py, dir: dir, step: comboStep, dur: 0.42 });
    } else {
      skillFx = { kind: 'slash', frames: S.skillFrames('slash'), idx: 0, t: 0 };
    }
    // Động tác vung kiếm riêng theo từng đòn combo (khớp 0,42s của hiệu ứng).
    setAction('slash' + (comboStep + 1), 0.42);
    if (SND) SND.sfx('swing');
    var r = L.combatRound(ch, m, Math.random);
    var shownDmg = r.dmgToMonster;
    if (SK && comboStep === 2 && m.hp > 0) {
      var bonus = Math.max(1, Math.round(r.dmgToMonster * 0.3));
      m.hp -= bonus; shownDmg += bonus;
      if (m.hp <= 0) r.dead = true;
    }
    m.hitT = 0.35; m.face = (m.x * TILE + 16) < px ? 'right' : 'left';
    if (SND) {
      SND.sfx(r.crit ? 'hit_crit' : 'hit');
      SND.voice(m.type, 'hit', { vol: sndVol(distToM(m)), elite: !!m.elite, boss: !!m.boss });
    }
    floaters.push({ x: m.x * TILE + 16, y: m.y * TILE, txt: (r.crit ? 'Chí mạng ' : '') + '-' + shownDmg, color: r.crit ? '#ff8a3c' : '#ffd94a', big: !!r.crit, t: 1 });
    // Proc lan (Long Lôi của thương Thiên phẩm...) từ combatRound: lan sang quái gần.
    (r.procs || []).forEach(function (h) { splashProc(m, h.dmg, h.count || 1, '#cfa6ff'); });
    // Pháp khí trên đòn đánh: trói (Hồ Lô/Dây Trói Tiên) hoặc giăng võng
    // (Thiên La Địa Võng + ký danh sét võng) — số liệu ở artifacts.js.
    if (!r.dead) applyArtifactHit(m);
    if (r.healed > 0) floaters.push({ x: px, y: py - 88, txt: '+' + r.healed, color: '#7dff8a', t: 1 });
    var dmgTaken = r.dmgToPlayer;
    // ẨN TỨC PHÙ (js/talismans.js): đòn phản công ĐẦU TIÊN của quái
    // THƯỜNG trượt + phá ẩn (boss/tinh anh/quái sự kiện miễn nhiễm —
    // breakStealthOnHit tự lo phần phân biệt đó).
    if (TAL && dmgTaken > 0 && TAL.breakStealthOnHit(ch, m, Date.now())) {
      ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + dmgTaken);
      dmgTaken = 0;
      floaters.push({ x: px, y: py - 70, txt: 'Né được! (phá ẩn tức)', color: '#bfe3ff', t: 1 });
    }
    if (SK && dmgTaken > 0) {
      // Bị động Linh Khí Hộ Thể: linh khí tự đỡ một phần sát thương.
      var red = Math.floor(dmgTaken * SK.passiveReduction(ch));
      if (red > 0) { ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + red); dmgTaken -= red; }
    }
    // Khiên linh khí (skill linh_khien, Trúc Cơ): khiên chịu thay phần
    // sát thương còn lại cho tới khi vỡ hoặc hết giờ.
    if (dmgTaken > 0 && ch.rShield && ch.rShield.until > Date.now() && ch.rShield.hp > 0) {
      var shAbs = Math.min(ch.rShield.hp, dmgTaken);
      ch.rShield.hp -= shAbs;
      ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + shAbs);
      dmgTaken -= shAbs;
      if (shAbs > 0) floaters.push({ x: px, y: py - 104, txt: 'Khiên đỡ ' + shAbs, color: '#7fe8d6', t: 1 });
    }
    // Phù hộ thân (js/talismans.js): giảm % sát thương nhận vào còn lại
    // trong cửa sổ hiệu lực (sau khiên linh khí, trước pháp bảo).
    if (TAL && dmgTaken > 0) {
      var tRed = Math.floor(dmgTaken * TAL.dmgRedPct(ch, Date.now()) / 100);
      if (tRed > 0) { ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + tRed); dmgTaken -= tRed; }
    }
    // TRẬN KỲ (js/formation.js): Hộ Thể giảm sát thương khi người đứng
    // trong vòng; Khốn Thú giảm đòn của quái đang đứng trong vòng.
    // Cùng kiểu hoàn máu như các lớp giảm khác, đặt sau phù hộ thân.
    if (FM && dmgTaken > 0) {
      var fmMult = FM.dmgTakenMult(flags, curMapId, px, py, 'player') *
        FM.dmgTakenMult(flags, curMapId, m.x * TILE + 16, m.y * TILE + 28, 'monster');
      var fmRed = dmgTaken - Math.floor(dmgTaken * fmMult);
      if (fmRed > 0) { ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + fmRed); dmgTaken -= fmRed; }
    }
    if (ART && r.dmgToPlayer > 0 && dmgTaken > 0) {
      // Định Hải Thần Châu: khiên nước đang sẵn sàng thì chắn TRỌN đòn này;
      // khiên vỡ tung sóng nước (ký danh) làm chậm quái xung quanh.
      var shDef = null;
      ART.equippedDefs(ch).forEach(function (d) { if (d.fx && d.fx.kind === 'shield_orb') shDef = d; });
      if (shDef && ch.art && ch.art.shield) {
        ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + dmgTaken);
        dmgTaken = 0;
        ch.art.shield = false;
        ch.art.shieldCd = shDef.fx.cd || 6;
        floaters.push({ x: px, y: py - 96, txt: 'Khiên nước đỡ đòn!', color: '#7fe8ff', t: 1 });
        if (shDef.signature) {
          monstersInRadius(px, py, shDef.signature.radius || 85).forEach(function (o) {
            o.slowT = Math.max(o.slowT || 0, shDef.signature.slowDur || 1.5);
            o.freezeT = Math.max(o.freezeT || 0, 0.3);
          });
        }
      }
      // Hộ Tâm Bội...: giảm thêm % sát thương còn lại (trần riêng của pháp bảo).
      if (dmgTaken > 0) {
        var aRed = Math.floor(dmgTaken * ART.damageReduction(ch));
        if (aRed > 0) { ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + aRed); dmgTaken -= aRed; }
      }
      // Hỗn Nguyên Châu — BẢO KỸ Hỗn Nguyên Hộ Thể: khiên linh lực hấp
      // thụ phần sát thương còn lại trước khi vào Máu (đặt sau mọi lớp
      // giảm % để khiên chỉ gánh phần thật sự chạm thân).
      if (dmgTaken > 0 && typeof ART.absorbManaShield === 'function') {
        var hnAbs = ART.absorbManaShield(ch, dmgTaken);
        if (hnAbs > 0) {
          ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + hnAbs);
          dmgTaken -= hnAbs;
          floaters.push({ x: px, y: py - 112, txt: 'Khiên Hỗn Nguyên đỡ ' + hnAbs, color: '#ffe98a', t: 1 });
        }
      }
      // Chuông Trấn Hồn: bị đánh có tỉ lệ rung chuông làm choáng quái quanh.
      ART.forEquippedFx(ch, 'stun_react', function (fx) {
        if (Math.random() < fx.chance) {
          monstersInRadius(px, py, fx.radius || 70).forEach(function (o) { o.freezeT = Math.max(o.freezeT || 0, fx.dur); });
          floaters.push({ x: px, y: py - 96, txt: 'Trấn Hồn!', color: '#cfa6ff', t: 1 });
        }
      });
    }
    if (r.dmgToPlayer > 0) {
      m.atkT = 0.5;
      if (SND) SND.voice(m.type, 'attack', { vol: sndVol(distToM(m)), elite: !!m.elite, boss: !!m.boss });
      if (dmgTaken > 0) {
        if (SND) SND.sfx('hurt');
        if (SND && SND.setCombat) SND.setCombat(true); // lượt âm thanh 31/10: bị quái đánh trúng cũng là giao chiến (chiều ngược của rawHitMonster)
        floaters.push({ x: px, y: py - 70, txt: '-' + dmgTaken, color: '#ff5a4a', t: 1 });
        // Giật lùi khi bị phản đòn — trừ khi cú vung của chính đòn này vừa bắt
        // đầu (đòn vung được ưu tiên đọc hết; choáng chỉ chen khi đang rảnh).
        if (!action || action.t > 0.05) setAction('hit', 0.35);
      }
    }
    toast(r.log);
    if (r.dead) {
      m.hp = 0; m.dying = true; m.deadT = 0.7; // chạy hết bộ frame chết rồi mới biến mất/rớt xong
      if (m.worldBoss) grantBossTableDrops(m); else if (!m.tide) { grantWeaponDrop(m); grantArtifactDrop(m); grantGearDrop(m); }
      onKillArtifactFx();
      L.recordEvent(qs, ch, { type: 'kill', target: m.type });
      onMonsterKilled(m);
    }
    // Càn Khôn Kính — BẢO KỸ Kính Phản Chiếu: phản một phần sát thương
    // THỰC NHẬN (sau mọi lớp giảm + khiên) trở lại chính kẻ vừa đánh.
    // Đặt sau khối r.dead: quái đã gục vì đòn của người chơi thì không
    // phản nữa; quái còn sống bị phản chết thì chết qua rawHitMonster
    // như mọi đòn thô khác (rơi đồ/thưởng chạy đúng một lần).
    if (ART && r.dmgToPlayer > 0 && dmgTaken > 0 && m.hp > 0 && !m.dying && typeof ART.reflectAmount === 'function') {
      var reflDmg = ART.reflectAmount(ch, dmgTaken);
      if (reflDmg > 0) {
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 26, txt: 'Phản chiếu -' + reflDmg, color: '#ffe98a', t: 1 });
        rawHitMonster(m, reflDmg, '#ffe98a');
      }
    }
    if (ch.hp <= 0 && !deathPending) {
      // Chạy hết động tác ngã xuống (0,9s) rồi mới hồi sinh ở trấn.
      deathPending = true;
      if (SND) SND.sfx('player_death');
      moveTarget = null; movePath = null;
      action = { name: 'death', t: 0, dur: 0.9, dir: dir };
    }
    updateHUD(); saveGame(); renderQuestPanel();
  }
  // Thu hoạch prop bằng đòn đánh thường (ATLAS LAB): các prop trong tầm
  // chém thành gốc rạ (trạng thái lưu diff vào flags.propCut qua PROPS),
  // lăn bảng rơi của loại prop — vật phẩm cấp thấp CÓ SẴN trong ITEMS,
  // số lượng nhỏ theo tỉ lệ rơi của type, KHÔNG rơi Linh Thạch.
  function harvestProps(list) {
    lastAtkAt = Date.now();
    if (SK) {
      comboStep = comboTimer > 0 ? (comboStep + 1) % 3 : 0;
      comboTimer = 1.2;
      spawnEffect({ skill: 'combo', x: px, y: py, dir: dir, step: comboStep, dur: 0.42 });
    } else {
      skillFx = { kind: 'slash', frames: S.skillFrames('slash'), idx: 0, t: 0 };
    }
    setAction('slash' + (comboStep + 1), 0.42);
    if (SND) SND.sfx('swing');
    var gained = {};
    for (var i = 0; i < list.length; i++) {
      PROPS.markCut(curMapId, list[i], flags, Date.now());
      var drop = PROPS.rollDrop(list[i], Math.random);
      if (drop) { L.addItem(ch, drop, 1); gained[drop] = (gained[drop] || 0) + 1; }
    }
    Object.keys(gained).forEach(function (id) {
      var nm = L.ITEMS[id] ? L.ITEMS[id].name : id;
      toast('Thu hoạch được ' + gained[id] + ' ' + nm + '.');
      floaters.push({ x: px, y: py - 88, txt: '+' + gained[id] + ' ' + nm, color: '#b7e07a', t: 1 });
    });
    if (SND) SND.sfx('gather');
    saveGame();
  }
  // ---------- Hệ thống kỹ năng ----------
  function dirVec(d) {
    return d === 'up' ? { x: 0, y: -1 } : d === 'down' ? { x: 0, y: 1 } : d === 'left' ? { x: -1, y: 0 } : { x: 1, y: 0 };
  }
  function spawnEffect(e) {
    e.id = ++fxSeq; e.t = 0; e.seed = e.seed || (fxSeq * 3 + 1);
    e.hitSet = []; e.applied = false; e.tickAcc = 0; e.traveled = 0;
    effects.push(e);
    return e;
  }
  function spawnHitFx(m, color) {
    spawnEffect({ skill: 'hit', x: m.x * TILE + 16, y: m.y * TILE + 12, dir: dir, color: color, dur: 0.3, cosmetic: true });
  }
  function grantKillRewards(m) {
    var def = L.MONSTERS[m.type];
    // THÚ TRIỀU: quái sự kiện KHÔNG rơi Linh Thạch và không lăn bảng
    // rơi vũ khí/pháp bảo (thưởng đi qua ngân sách sự kiện ở
    // beast-tide.js); chỉ lăn rơi nguyên liệu loài ở nửa tỉ lệ, đầu
    // đàn thì bảng rơi riêng của module lo — tránh trùng vật phẩm cốt
    // truyện/bảng boss của loài gốc.
    if (m.tide) {
      if (!m.tideLeader) {
        var tdrops = [];
        def.drops.forEach(function (d) { if (Math.random() < d.chance * 0.5) { L.addItem(ch, d.id, 1); tdrops.push(L.ITEMS[d.id].name); } });
        if (tdrops.length) { if (SND) SND.sfx('pickup'); toast(m.name + ' gục! Rớt: ' + tdrops.join(', ') + '.'); }
      }
      return;
    }
    // Tụ Bảo Bồn...: Linh Thạch + tỉ lệ rơi vật phẩm thường nhân theo pháp bảo.
    var aTot = ART ? ART.totalStats(ch) : null;
    // Linh Thạch (docs/economy.md): boss thế giới = phẳng theo def boss;
    // quái có ltFlat (bí cảnh/encounter) = phẳng; còn lại LĂN theo tỉ lệ
    // loài (L.rollLt), tinh anh × ELITE_LT_MULT (5).
    var ltBase;
    if (m.worldBoss && BOS && BOS.bossById(m.worldBoss)) ltBase = BOS.bossById(m.worldBoss).linhThach;
    else if (typeof m.ltFlat === 'number') ltBase = m.ltFlat;
    else {
      ltBase = L.rollLt ? L.rollLt(def, Math.random) : (def.linhThach || 0);
      if (m.elite) ltBase *= (L.ELITE_LT_MULT || 5);
      // CÂN BẰNG CHẶNG CAO (mục 28): quái hoang dã map 8+ nhân Linh Thạch
      // rơi nhẹ theo bậc (boss phẳng/ltFlat bí cảnh không nhân).
      if (HB) ltBase *= HB.ltMultForMap(curMapId, M);
    }
    var ltGain = Math.floor(ltBase * (aTot ? 1 + aTot.ltPct / 100 : 1));
    if (AC) ltGain = AC.guardGain('monster', ltGain); // chống hack: trần 1 lần rơi quái/boss
    ch.linhThach += ltGain;
    // CÂN BẰNG CHẶNG CAO (mục 28): hạ quái hoang dã ở map realmRank >= 2
    // cho tu vi theo thang (ngoại lệ có chủ đích cho luật chung "hạ quái
    // không cho tu vi"; boss/sự kiện/bí cảnh không tính — chúng đã có
    // thưởng riêng, và đường tide/escort đã return trước khi tới đây).
    var tvGain = 0;
    if (HB && !m.worldBoss && !m.boss && !m.escort && !m.tide && typeof m.ltFlat !== 'number') {
      var tvBase = HB.tuViForMap(curMapId, M);
      if (tvBase > 0) tvGain = L.gainTuVi(ch, tvBase);
    }
    var drops = [];
    var dMult = aTot ? 1 + aTot.dropPct / 100 : 1;
    def.drops.forEach(function (d) { if (Math.random() < d.chance * dMult) { L.addItem(ch, d.id, 1); drops.push(L.ITEMS[d.id].name); } });
    if (SND) { SND.sfx('coin'); if (drops.length) SND.sfx('pickup'); }
    toast(m.name + ' gục! +' + ltGain + ' Linh Thạch.' + (tvGain ? ' +' + tvGain + ' tu vi.' : '') + (drops.length ? ' Rớt: ' + drops.join(', ') + '.' : ''));
  }
  // Rơi vũ khí theo bảng rơi riêng của weapons.js (quái thường tối đa 1 món,
  // boss rơi mọi món trúng bảng — Sơn Quân luôn rơi ký danh Nanh Quân Huyết Đao).
  function grantWeaponDrop(m) {
    if (!W) return;
    var isBoss = !!(L.MONSTERS[m.type] && L.MONSTERS[m.type].boss);
    var got = W.rollDrop(m.type, Math.random, isBoss);
    got.forEach(function (wid) {
      var def = W.WEAPONS[wid];
      if (W.addWeapon(ch, wid)) {
        toast('Rớt vũ khí: ' + def.name + ' (' + W.GRADES[def.grade].name + ', công +' + def.atk + ')! Mở Túi đồ để đeo.');
      }
    });
    if (got.length) { if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame(); }
  }
  // ---------- Pháp khí + bảo vật (js/artifacts.js) ----------
  // Rơi pháp bảo theo bảng rơi riêng: quái thường tối đa 1 món, tinh anh
  // bảng tinh anh, boss Sơn Quân lăn cả bảng boss (có món Thiên phẩm).
  function grantArtifactDrop(m) {
    if (!ART) return;
    var got = ART.rollDrop(m, Math.random);
    // TÍCH HỢP A (01/11/2026): món chưa có ảnh biểu tượng AI thì đang ẨN
    // theo luật của Bui (ART.isHidden, js/artifacts.js) — lăn trúng
    // cũng không trao, chờ ảnh về mới mở. Bảng rơi trong artifacts.js
    // giữ nguyên để test catalog còn nguyên tiền đề.
    if (ART.isHidden) got = got.filter(function (aid) { return !ART.isHidden(aid); });
    got.forEach(function (aid) {
      var def = ART.ARTIFACTS[aid];
      if (ART.addArtifact(ch, aid)) {
        toast('Rớt pháp bảo: ' + def.name + ' (' + ART.GRADES[def.grade].name + ')! Mở Túi đồ để đeo.');
      }
    });
    if (got.length) { if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame(); }
  }
  // Rơi TRANG BỊ ĐEO (js/gear.js, GĐ2): bảng rơi theo loài riêng — quái
  // thường tối đa 1 món, boss Sơn Quân lăn cả bảng (có đồ Địa phẩm).
  function grantGearDrop(m) {
    if (!GR) return;
    var isBoss = !!(L.MONSTERS[m.type] && L.MONSTERS[m.type].boss);
    var got = GR.rollDrop(m.type, Math.random, isBoss);
    got.forEach(function (gid) {
      var def = GR.GEAR[gid];
      if (GR.addGear(ch, gid)) {
        toast('Rớt trang bị: ' + def.name + ' (' + GR.GRADES[def.grade].name + ' · ' + GR.SLOTS[def.slot].name + ')! Mở Túi đồ để đeo.');
      }
    });
    if (got.length) { if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame(); }
  }
  // Rơi đồ của BOSS THẾ GIỚI theo bảng rơi riêng của bosses.js: mỗi dòng lăn
  // ĐỘC LẬP theo % tường minh (xem trước được ở bia/panel Boss); món ký danh
  // có tiền tố riêng. Đường này THAY 2 bảng rơi theo loài ở trên khi quái là
  // boss thế giới (bảng loài của Sơn Quân vẫn chạy cho bản cốt truyện).
  function grantBossTableDrops(m) {
    if (!BOS) return;
    var def = BOS.bossById(m.worldBoss);
    if (!def) return;
    var got = BOS.rollDrops(def, Math.random);
    got.forEach(function (d) {
      var tag = d.sig ? 'KÝ DANH! ' : '';
      if (d.kind === 'weapon' && W && W.WEAPONS[d.id] && W.addWeapon(ch, d.id)) {
        toast(tag + 'Boss rơi vũ khí: ' + W.WEAPONS[d.id].name + ' (' + W.GRADES[W.WEAPONS[d.id].grade].name + ', công +' + W.WEAPONS[d.id].atk + ')! Mở Túi đồ để đeo.');
      } else if (d.kind === 'artifact' && ART && ART.ARTIFACTS[d.id] && !(ART.isHidden && ART.isHidden(d.id)) && ART.addArtifact(ch, d.id)) {
        toast(tag + 'Boss rơi pháp bảo: ' + ART.ARTIFACTS[d.id].name + ' (' + ART.GRADES[ART.ARTIFACTS[d.id].grade].name + ')! Mở Túi đồ để đeo.');
      } else if (d.kind === 'gear' && GR && GR.GEAR[d.id] && GR.addGear(ch, d.id)) {
        toast(tag + 'Boss rơi trang bị: ' + GR.GEAR[d.id].name + ' (' + GR.GRADES[GR.GEAR[d.id].grade].name + ' · ' + GR.SLOTS[GR.GEAR[d.id].slot].name + ')! Mở Túi đồ để đeo.');
      } else if (d.kind === 'item' && L.ITEMS[d.id]) {
        L.addItem(ch, d.id, d.n);
        toast(tag + 'Boss rơi: ' + L.ITEMS[d.id].name + ' x' + d.n + '.');
      }
    });
    if (got.length) { if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame(); }
    // Bí tịch skill (js/manuals.js): bảng rơi RIÊNG của hệ bí tịch —
    // boss ký danh rơi sách của chính nó 8–12%, vương thú/boss chặng
    // sâu lăn hồ hiếm 4–5%. Không gộp vào bảng của bosses.js vì test
    // 33b khóa snapshot bảng cũ.
    // Pháp bảo ĐỢT 1 (js/artifacts.js): bảng rơi riêng theo boss —
    // cùng tiền lệ bí tịch ở dưới, không gộp bảng bosses.js.
    if (ART && typeof ART.rollBossDrop === 'function') {
      var artDrop2 = ART.rollBossDrop(def.id, Math.random);
      // TÍCH HỢP A: bảng rơi đợt 1 hiện chỉ chứa các món chưa có ảnh
      // biểu tượng (đang ẩn) — có ảnh về thì dòng này tự chạy lại.
      if (artDrop2 && ART.isHidden && ART.isHidden(artDrop2)) artDrop2 = null;
      if (artDrop2 && ART.ARTIFACTS[artDrop2] && ART.addArtifact(ch, artDrop2)) {
        toast('Boss rơi pháp bảo: ' + ART.ARTIFACTS[artDrop2].name + ' (' + ART.GRADES[ART.ARTIFACTS[artDrop2].grade].name + ')! Mở Túi đồ để đeo.');
        if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame();
      }
    }
    // Trang phục ĐỢT 1 (js/wardrobe.js): bảng rơi riêng theo boss —
    // sở hữu ghi nhận ngay; bộ chưa có hình vẫn ẩn trong tủ theo luật
    // của tủ đồ, hình về là mặc được.
    if (WD && typeof WD.rollBossCostumeDrop === 'function') {
      var cosDrop = WD.rollBossCostumeDrop(def.id, Math.random);
      if (cosDrop && WD.COSTUMES[cosDrop]) {
        var cosRes = WD.grantCostume(ch, cosDrop, 'boss:' + def.id);
        if (cosRes.ok && !cosRes.already) {
          toast('Boss rơi TRANG PHỤC: ' + WD.COSTUMES[cosDrop].name + '! Mở Tủ Đồ để mặc.');
          if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame();
        }
      }
    }
    if (MANU) {
      var manuItem = MANU.rollBossDrop(def.id, Math.random);
      if (manuItem && L.ITEMS[manuItem]) {
        L.addItem(ch, manuItem, 1);
        toast('Boss rơi BÍ TỊCH: ' + L.ITEMS[manuItem].name + '! Mở Túi đồ, bấm Dùng để đọc và học chiêu.');
        if (SND) SND.sfx('pickup_weapon'); updateHUD(); saveGame();
      }
    }
  }
  function onKillArtifactFx() {
    if (!ART || !SK) return;
    var gain = ART.llOnKill(ch);
    if (gain > 0) {
      SK.ensureState(ch);
      ch.ll = Math.min(SK.maxLinhLuc(ch), ch.ll + gain);
    }
  }
  // Proc pháp khí trên đòn đánh thường: trói đơn mục tiêu (chỉ món trói
  // mạnh nhất lăn) hoặc giăng võng diện rộng + ký danh sét võng.
  function applyArtifactHit(m) {
    if (!ART || !m || m.hp <= 0 || m.dying) return;
    var bindDur = ART.rollBind(ch, m, Math.random);
    if (bindDur > 0) {
      m.freezeT = Math.max(m.freezeT || 0, bindDur);
      floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Trói!', color: '#8ff5df', t: 1 });
      return;
    }
    var netDef = ART.rollNet(ch, Math.random);
    if (netDef) {
      var targets = monstersInRadius(m.x * TILE + 16, m.y * TILE + 28, netDef.fx.radius);
      targets.forEach(function (o) { o.freezeT = Math.max(o.freezeT || 0, netDef.fx.dur); });
      if (targets.length) {
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Thiên La Võng!', color: '#cfa6ff', t: 1 });
        // Ký danh Lôi Võng Thiên La: võng trói từ 2 quái trở lên -> sét đánh mỗi con.
        var sig = netDef.signature;
        if (sig && sig.kind === 'net_zap' && targets.length >= 2) {
          var zap = Math.max(1, Math.round(L.effAtk(ch) * sig.pct / 100));
          targets.forEach(function (o) { rawHitMonster(o, zap, '#cfa6ff'); });
        }
      }
    }
  }
  // Nhịp hiệu ứng pháp bảo theo thời gian: hồi chiêu kích hoạt, khiên Định
  // Hải tự tụ lại, phi kiếm hộ thân tự đánh, % hồi linh lực cộng thêm từ fx,
  // ký danh hồi sinh của Cửu Chuyển Linh Châu khi HP xuống thấp.
  function tickArtifactFx(dt) {
    ART.tickState(ch, dt);
    // % hồi linh lực từ fx (Ngọc Tụ Linh +40%, Cửu Chuyển +60%) do
    // skills.regenRate tự nhân qua regenPct của artifacts — không cộng thêm
    // ở đây để tránh tính trùng hai lần.
    // Định Hải Thần Châu: hết hồi chiêu khiên thì khiên tự tụ lại.
    var hasShieldOrb = false;
    ART.forEquippedFx(ch, 'shield_orb', function () { hasShieldOrb = true; });
    if (hasShieldOrb) {
      ART.ensureArtState(ch);
      if (!ch.art.shield && (ch.art.shieldCd || 0) <= 0) ch.art.shield = true;
    }
    // Phi Kiếm Bảo: phi kiếm lơ lửng tự đánh quái gần nhất theo nhịp riêng.
    var fsFx = null;
    ART.forEquippedFx(ch, 'flysword', function (fx) { fsFx = fx; });
    if (fsFx) {
      flyT -= dt;
      if (flyT <= 0) {
        flyT = fsFx.interval || 1.2;
        var near = null, nd = 1e9;
        monsters.forEach(function (o) {
          if (o.hp <= 0 || o.dying) return;
          var dx = o.x * TILE + 16 - px, dy = o.y * TILE + 28 - py;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d <= (fsFx.range || 150) && d < nd) { nd = d; near = o; }
        });
        if (near) skillDamageMonster(near, Math.max(1, Math.round(L.effAtk(ch) * (fsFx.pct || 40) / 100)), '#ffe98a', { allowProc: false });
      }
    }
    // Cửu Chuyển Hồi Sinh: HP dưới ngưỡng và hết hồi chiêu ký danh thì tự hồi.
    var healed = ART.checkRevive(ch);
    if (healed > 0) {
      floaters.push({ x: px, y: py - 100, txt: 'Cửu Chuyển Hồi Sinh +' + healed, color: '#8ff5df', big: true, t: 1 });
      toast('Cửu Chuyển Linh Châu phát động: hồi ' + healed + ' Máu!');
      updateHUD();
    }
    artBarTick += dt;
    if (artBarTick > 0.15) { artBarTick = 0; updateArtBar(); }
  }
  // Kích hoạt chủ động của pháp bảo ở ô slot (phím 6/7): Thu Yêu / Soi Yêu.
  function castArtifactActive(slot) {
    if (!ART || !SK || !ch || deathPending) return false;
    ART.ensureArtifacts(ch);
    var def = ART.equippedDefAt(ch, slot);
    if (!def || !def.active) { toast('Ô pháp bảo ' + (slot + 1) + ' không có chiêu kích hoạt.'); return false; }
    var gate = ART.canActivate(ch, slot);
    if (!gate.ok) {
      if (gate.reason === 'cd') toast(def.active.name + ' đang hồi chiêu...');
      else if (gate.reason === 'mana' || gate.reason === 'll') toast('Không đủ linh lực để dùng ' + def.active.name + '!');
      else toast('Chưa dùng được ' + def.active.name + '.');
      return false;
    }
    SK.ensureState(ch);
    ch.ll -= def.active.mana;
    ART.applyActivate(ch, slot);
    var act = def.active;
    if (act.kind === 'bind_nearest') {
      var near = null, nd = 1e9;
      monsters.forEach(function (o) {
        if (o.hp <= 0 || o.dying) return;
        var dx = o.x * TILE + 16 - px, dy = o.y * TILE + 28 - py;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d <= act.range && d < nd) { nd = d; near = o; }
      });
      if (near) {
        var isBoss = !!near.boss || !!near.elite;
        near.freezeT = Math.max(near.freezeT || 0, isBoss ? (act.bossDur || 0) : act.dur);
        floaters.push({ x: near.x * TILE + 16, y: near.y * TILE - 18, txt: 'Thu Yêu!', color: '#8ff5df', t: 1 });
      } else toast('Không có quái trong tầm Thu Yêu.');
    } else if (act.kind === 'mark') {
      var marked = 0;
      monstersInRadius(px, py, act.range).forEach(function (o) { o.markT = act.dur; o.markPct = act.pct; marked++; });
      floaters.push({ x: px, y: py - 96, txt: 'Soi Yêu!', color: '#ffd94a', t: 1 });
      if (!marked) toast('Không có quái quanh bạn để soi.');
    } else if (act.kind === 'sword_array') {
      // BẢO KỸ Tru Tiên Kiếm Trận (pháp bảo Thiên): trận kiếm diện rộng
      // quanh thân — sát thương qua skillDamageMonster như phi kiếm hộ
      // thân (không kích proc dây chuyền), hình dùng bộ fx của chiêu
      // Thiên Điều Kiếm Trận sẵn có ở dạng trang trí thuần.
      var saTargets = monstersInRadius(px, py, act.radius || 120);
      var saDmg = Math.max(1, Math.round(L.effAtk(ch) * (act.pct || 180) / 100));
      if (typeof spawnEffect === 'function') spawnEffect({ skill: 'kiem_tran', x: px, y: py, dir: dir, dur: 0.6, cosmetic: true });
      if (typeof addShake === 'function') addShake(3);
      saTargets.forEach(function (o) { skillDamageMonster(o, saDmg, act.color || '#ffd94a', { allowProc: false }); });
      floaters.push({ x: px, y: py - 96, txt: 'Kiếm Trận Tru Tiên!', color: '#ffd94a', big: true, t: 1 });
      if (!saTargets.length) toast('Không có quái trong vòng kiếm trận.');
    }
    if (SND) SND.sfx('artifact_cast');
    updateHUD(); saveGame(); updateArtBar();
    return true;
  }
  // Thanh kích hoạt pháp bảo (dưới thanh skill): một ô cho mỗi pháp bảo
  // đang đeo có chiêu kích hoạt, hiện icon + phím (6/7) + lớp hồi chiêu.
  function initArtBar() {
    var bar = $('artBar');
    if (!bar || artBarBuilt) return;
    artBarBuilt = true;
    bar.innerHTML = '';
    for (var s = 0; s < 2; s++) {
      (function (slot) {
        var el = document.createElement('div');
        el.className = 'skill-slot';
        el.id = 'aslot-' + slot;
        el.style.display = 'none';
        var cv = document.createElement('canvas');
        cv.width = 44; cv.height = 44; cv.className = 'skill-icon';
        el.appendChild(cv);
        var nm = document.createElement('div');
        nm.className = 'skill-name'; nm.id = 'anm-' + slot;
        el.appendChild(nm);
        var key = document.createElement('div');
        key.className = 'skill-key'; key.textContent = String(slot + 6);
        el.appendChild(key);
        var cd = document.createElement('div');
        cd.className = 'skill-cd'; cd.id = 'acd-' + slot; cd.style.display = 'none';
        el.appendChild(cd);
        var cdT = document.createElement('div');
        cdT.className = 'skill-cdt'; cdT.id = 'acdt-' + slot;
        el.appendChild(cdT);
        el.addEventListener('pointerup', function () { castArtifactActive(slot); });
        bar.appendChild(el);
      })(s);
    }
    updateArtBar();
  }
  function updateArtBar() {
    if (!ART || !artBarBuilt || !ch) return;
    for (var s = 0; s < 2; s++) {
      var el = $('aslot-' + s);
      if (!el) continue;
      var def = ART.equippedDefAt(ch, s);
      if (!def || !def.active) { el.style.display = 'none'; continue; }
      el.style.display = '';
      el.title = def.name + ' — kích hoạt ' + def.active.name + ' (phím ' + (s + 6) + ', tốn ' + def.active.mana + ' linh lực, hồi ' + def.active.cd + 's)';
      var nm = $('anm-' + s);
      if (nm) nm.textContent = def.active.name;
      var cv = el.children[0];
      if (cv && cv.getContext) {
        // Vẽ lại mỗi lần cập nhật (0,15s): ảnh AI nạp lười — nạp xong là
        // tự thay icon pixel tạm ở lần vẽ kế, không cần cờ _drawnFor nữa.
        try {
          var c2 = cv.getContext('2d');
          c2.clearRect(0, 0, 44, 44);
          ART.drawIconArt(c2, def, 2, 2, 40, gfxLevel);
        } catch (e) {}
      }
      var left = ART.cdLeftA(ch, def.id);
      var cd = $('acd-' + s), cdT = $('acdt-' + s);
      if (cd) {
        if (left > 0) {
          cd.style.display = 'block';
          cd.style.height = Math.min(100, left / def.active.cd * 100) + '%';
          if (cdT) cdT.textContent = Math.ceil(left);
        } else {
          cd.style.display = 'none';
          if (cdT) cdT.textContent = '';
        }
      }
      el.style.opacity = (SK && ch.ll < def.active.mana) ? '0.55' : '1';
    }
  }
  // ---------- PHÙ CHÚ (js/talismans.js): dùng phù + Bàn Phù của Diệp Phù Sinh ----------
  // Ngữ cảnh thế giới cho TAL.useTalisman: quái sống quanh (tọa độ pixel
  // như module mong đợi), map hiện tại, đang trong bí cảnh/sự kiện/kiếp.
  function talismanInEvent() {
    try { var bs = BT && BT.state ? BT.state(flags) : null; if (bs && (bs.phase === 'running' || bs.active)) return true; } catch (e) {}
    try { var es = ESC && ESC.state ? ESC.state(flags) : null; if (es && es.active) return true; } catch (e) {}
    try { var tst = TOURN ? TOURN.ensure(flags) : null; if (tst && tst.run && tst.run.phase === 'live') return true; } catch (e) {}
    return false;
  }
  function talismanCtx() {
    return {
      now: Date.now(), px: px, py: py, monsters: monsters, mapId: curMapId,
      inRealm: /^realm_/.test(curMapId || ''),
      inEvent: talismanInEvent(),
      inTribulation: !!(ch && ch.tribulation),
      entry: (mapEntry && mapEntry.mapId === curMapId) ? { tx: mapEntry.tx, ty: mapEntry.ty } : null,
      rng: Math.random
    };
  }
  function talismanElemFx(def, x, y) {
    if (!def) return;
    if (SND) {
      if (def.elem === 'hoa') SND.sfx('fire_tick');
      else if (def.elem === 'loi') SND.sfx('zap_small');
      else if (def.elem === 'bang') SND.sfx('ice_tick');
      else if (def.elem === 'kiem') SND.sfx('swing');
      else SND.sfx('use_item');
    }
    if (FX && FX.spawn) {
      var sk = def.elem === 'hoa' ? 'hoa' : def.elem === 'loi' ? 'loi' : def.elem === 'bang' ? 'bang' : def.elem === 'kiem' ? 'kiem' : null;
      if (sk) { try { FX.spawn(sk, x, y, { dir: dir }); } catch (e) {} }
    }
  }
  // Áp KẾ HOẠCH của TAL.useTalisman lên thế giới: đòn thô qua
  // rawHitMonster (không chí mạng/hút máu như luật module), hiệu ứng phụ
  // (đóng băng/chậm/dấu phá giáp) qua TAL.applyHitEffects, dịch chuyển
  // qua switchMap (Truyền Tống) hoặc về điểm vào map (Thổ Độn sameMap).
  function applyTalismanResult(res, def) {
    if (!res || !res.ok) return;
    if (res.teleport) {
      if (res.teleport.sameMap) {
        var e = (mapEntry && mapEntry.mapId === curMapId) ? mapEntry : { tx: 71, ty: 72 }; // V7-EXPAND (tích hợp A 01/11/2026): mặc định = start map1 mới (71,72)
        px = e.tx * TILE + 16; py = e.ty * TILE + 28;
        moveTarget = null; movePath = null; snapCamera();
        floaters.push({ x: px, y: py - 70, txt: 'Thổ độn!', color: '#c9a86a', t: 1 });
      } else if (res.teleport.mapId) {
        switchMap(res.teleport.mapId, res.teleport.x, res.teleport.y);
      }
      return;
    }
    (res.hits || []).forEach(function (h) {
      var m = h.m;
      if (!m || m.hp <= 0 || m.dying) return;
      var col = def && def.elem === 'hoa' ? '#ff7a3c' : def && def.elem === 'loi' ? '#cfa6ff' : def && def.elem === 'bang' ? '#bfe3ff' : '#ffd94a';
      rawHitMonster(m, h.dmg, col, h.dmg >= 40);
      talismanElemFx(def, m.x * TILE + 16, m.y * TILE + 16);
      if (TAL.applyHitEffects) TAL.applyHitEffects(m, h);
      if (h.freeze) floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Đóng băng!', color: '#bfe3ff', t: 1 });
      if (h.vulnPct) floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Phá giáp!', color: '#ffb84e', t: 1 });
    });
    updateHUD();
  }
  function useTalismanItem(itemId) {
    if (!TAL || !ch) return;
    var res = TAL.useTalisman(ch, itemId, talismanCtx());
    if (!res) return;
    if (!res.ok) { toast(res.msg || 'Không dùng được lá phù này ở đây.'); return; }
    applyTalismanResult(res, TAL.talismanDef(itemId));
    if (SND && !(res.hits && res.hits.length)) SND.sfx('use_item');
    toast(res.msg || ('Đã đốt ' + (L.ITEMS[itemId] ? L.ITEMS[itemId].name : itemId) + '.'));
    updateHUD(); saveGame(); renderInventory();
  }
  function openTalismanPanel() {
    if (!TAL) return;
    var got = TAL.teachBasics(ch, qs);
    if (got.length) toast('Diệp Phù Sinh dạy phù phương Phàm phẩm: ' + got.map(function (id) { var d = TAL.talismanDef(id); return d ? d.name : id; }).join(', ') + '!');
    var sectGot = TAL.syncSectRecipes(ch, flags);
    if (sectGot.length) toast('Thiên Phù Các truyền phù phương: ' + sectGot.join(', ') + '!');
    renderTalismanPanel();
    $('panelTalisman').style.display = 'block';
  }
  var talismanCloseEl = $('talismanClose');
  if (talismanCloseEl) talismanCloseEl.addEventListener('click', function () { $('panelTalisman').style.display = 'none'; });
  function renderTalismanPanel() {
    var box = $('talismanList');
    if (!box || !TAL || !ch) return;
    TAL.ensureTalisman(ch);
    box.innerHTML = '';
    function head(t) {
      var h = document.createElement('h4');
      h.style.margin = '10px 0 4px'; h.textContent = t;
      box.appendChild(h);
    }
    function icon(id) {
      var cv = document.createElement('canvas');
      cv.width = 32; cv.height = 32;
      if (TALART && TALART.has(id)) TALART.draw(cv.getContext('2d'), id, 0, 0, 32, 32);
      else S.drawGridToCanvas(cv.getContext('2d'), S.ITEM_ICONS[id], 0, 0, 4);
      return cv;
    }
    function matsText(mats) {
      return Object.keys(mats).map(function (m) {
        return (L.ITEMS[m] ? L.ITEMS[m].name : m) + ' ' + TAL.itemCount(ch, m) + '/' + mats[m];
      }).join(' · ');
    }
    function buyRow(id, name, price, desc) {
      var row = document.createElement('div');
      row.className = 'shop-row';
      row.appendChild(icon(id));
      var info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = '<b>' + name + '</b> — ' + price + ' Linh Thạch (đang có ' + TAL.itemCount(ch, id) + ')<br>' + desc;
      row.appendChild(info);
      var b = document.createElement('button');
      b.textContent = 'Mua';
      b.disabled = ch.linhThach < price;
      b.onclick = function () {
        var r = TAL.buyItem(ch, id);
        if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Mua ' + name + ' −' + r.price + ' Linh Thạch.'); }
        else toast('Không đủ Linh Thạch.');
        renderTalismanPanel(); updateHUD(); saveGame();
      };
      row.appendChild(b);
      box.appendChild(row);
    }
    head('Bàn Phù — bạn có ' + ch.linhThach + ' Linh Thạch' + (flags.sectJoined === 'thien_phu' ? ' · Đệ tử Thiên Phù Các: nguyên liệu −20%, phí −20%, tỉ lệ chế +5%' : ''));
    head('Mua nguyên liệu & phù có sẵn');
    Object.keys(TAL.MATERIALS).forEach(function (id) {
      var m = TAL.MATERIALS[id];
      if (m.buyPrice > 0) buyRow(id, m.name, m.buyPrice, m.desc);
    });
    TAL.SHOP.forEach(function (id) {
      var d = TAL.talismanDef(id);
      if (d) buyRow(id, d.name + ' (' + TAL.GRADES[d.grade].name + ')', d.price, d.fxText);
    });
    head('Chế nguyên liệu');
    Object.keys(TAL.MAT_RECIPES).forEach(function (id) {
      var r = TAL.MAT_RECIPES[id];
      var row = document.createElement('div');
      row.className = 'shop-row';
      row.appendChild(icon(id));
      var info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = '<b>' + L.ITEMS[id].name + '</b><br>Nguyên liệu: ' + matsText(r.mats) + ' · Phí: ' + r.fee + ' Linh Thạch · Tỉ lệ ' + r.baseRate + '% (thất bại mất phí + nửa nguyên liệu)';
      row.appendChild(info);
      var b = document.createElement('button');
      b.textContent = 'Chế';
      b.onclick = function () {
        var res = TAL.craftMat(ch, id);
        toast(res.ok ? ('Chế thành công ' + L.ITEMS[id].name + '!') : (res.reason === 'failed' ? 'Mẻ chế hỏng — mất phí và nửa nguyên liệu.' : 'Chưa đủ nguyên liệu/phí để chế.'));
        if (SND) SND.sfx(res.ok ? 'use_item' : 'boom_small');
        renderTalismanPanel(); updateHUD(); saveGame();
      };
      row.appendChild(b);
      box.appendChild(row);
    });
    head('Chế phù (phù phương đã học: ' + TAL.learnedList(ch).length + ')');
    var quick = TAL.quickOf(ch);
    Object.keys(TAL.TALISMANS).forEach(function (id) {
      var def = TAL.TALISMANS[id];
      var r = TAL.recipeOf(id);
      var learned = TAL.hasLearned(ch, id);
      var row = document.createElement('div');
      row.className = 'shop-row';
      row.appendChild(icon(id));
      var info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = '<b>' + def.name + '</b> · ' + TAL.GRADES[def.grade].name + ' (đang có ' + TAL.itemCount(ch, id) + ')<br>' + def.fxText +
        (learned && r ? '<br>Nguyên liệu: ' + matsText(TAL.effMats(ch, flags, r.mats)) + ' · Phí: ' + TAL.effFee(ch, flags, r.fee) + ' Linh Thạch · Tỉ lệ ' + TAL.successRate(ch, flags, id) + '%' : '<br>Chưa học phù phương — ' + (r ? r.sourceText : def.sourceText || 'phù cực hiếm, không có phù phương thường') + '.');
      row.appendChild(info);
      if (learned) {
        var chk = TAL.canCraft(ch, flags, id);
        var b = document.createElement('button');
        b.textContent = 'Chế phù';
        b.disabled = !chk.ok;
        b.onclick = function () {
          var res = TAL.craft(ch, flags, id);
          toast(res.ok ? ('Chế thành công ' + def.name + ' (' + TAL.GRADES[def.grade].name + ')!') : (res.reason === 'failed' ? 'Nét bùa hỏng — mất phí và nửa nguyên liệu.' : 'Chưa chế được lá này.'));
          if (SND) SND.sfx(res.ok ? 'use_item' : 'boom_small');
          renderTalismanPanel(); updateHUD(); saveGame();
        };
        row.appendChild(b);
        var qb = document.createElement('button');
        qb.textContent = quick === id ? 'Đang gán phím B' : 'Gán phím B';
        qb.disabled = quick === id || TAL.itemCount(ch, id) < 1;
        qb.onclick = function () { TAL.setQuick(ch, id); toast('Đã gán ' + def.name + ' (' + TAL.GRADES[def.grade].name + ') vào ô dùng nhanh (phím B).'); renderTalismanPanel(); saveGame(); };
        row.appendChild(qb);
      }
      box.appendChild(row);
    });
    var note = document.createElement('div');
    note.style.marginTop = '8px';
    note.textContent = 'Dùng phù: bấm vào lá phù trong Túi đồ, hoặc gán 1 lá vào ô nhanh rồi bấm phím B. Phù công cần có quái trong tầm quanh bạn.';
    box.appendChild(note);
  }
  // ---------- Đan Lô của Lý lão: học đan phương + luyện đan (js/alchemy.js) ----------
  function openAlchemyPanel() {
    if (!ALCH) return;
    var learned = ALCH.syncSectRecipes(ch, qs, flags);
    if (learned.length) toast('Đan Hà Cốc truyền đan phương: ' + learned.join(', ') + '!');
    renderAlchemyPanel();
    $('panelAlchemy').style.display = 'block';
  }
  var alchemyCloseEl = $('alchemyClose');
  if (alchemyCloseEl) alchemyCloseEl.addEventListener('click', function () { $('panelAlchemy').style.display = 'none'; });
  function renderAlchemyPanel() {
    var box = $('alchemyList');
    if (!box || !ALCH || !ch) return;
    ALCH.ensureAlchemy(ch);
    box.innerHTML = '';
    function head(t) {
      var h = document.createElement('h4');
      h.style.margin = '10px 0 4px'; h.textContent = t;
      box.appendChild(h);
    }
    head('Đan Lô của Lý lão — bạn có ' + ch.linhThach + ' Linh Thạch' +
      (ALCH.hasDanDinh(ch) ? ' · Đang đeo Đan Đỉnh Ngọc: tỉ lệ luyện +10%, đan hồi máu +50%' : ''));
    var missing = ALCH.basicsMissing(ch);
    if (missing.length) {
      var rb = document.createElement('div');
      rb.className = 'shop-row';
      var infoB = document.createElement('div');
      infoB.innerHTML = '<b>Học nghề đan</b><br>Lý lão dạy 2 đan phương cơ bản: Hồi Khí Tán, Linh Khí Tán.';
      rb.appendChild(infoB);
      var bb = document.createElement('button');
      bb.textContent = 'Học đan phương cơ bản';
      bb.onclick = function () {
        var got = ALCH.teachBasics(ch);
        if (got.length) toast('Lý lão dạy bạn: ' + got.map(function (id) { return ALCH.PILLS[id].name; }).join(', ') + '.');
        if (ALCH.teachRealmRecipes) {
          var gotR = ALCH.teachRealmRecipes(ch);
          if (gotR && gotR.length) toast('Lý lão truyền đan phương cảnh giới: ' + gotR.join(', ') + ' — nguyên liệu lõi là Yêu Đan Cấp 3, săn vương thú Đại Sơn mới có!');
        }
        renderAlchemyPanel(); updateHUD(); saveGame();
      };
      rb.appendChild(bb);
      box.appendChild(rb);
    }
    var ids = Object.keys(ALCH.RECIPES).sort(function (a, b) {
      return ALCH.GRADES[ALCH.PILLS[a].grade].rank - ALCH.GRADES[ALCH.PILLS[b].grade].rank;
    });
    ids.forEach(function (id) {
      var pill = ALCH.PILLS[id], r = ALCH.RECIPES[id];
      var learned = ALCH.hasLearned(ch, id);
      var row = document.createElement('div');
      row.className = 'shop-row';
      var cv = document.createElement('canvas');
      cv.width = 32; cv.height = 32;
      // Icon đan: ưu tiên ảnh AI (js/herb-icons-ai.js) theo mức đồ hoạ,
      // Thấp/chưa nạp xong thì lưới pixel 8x8.
      if (HART && HART.has(id)) HART.draw(cv.getContext('2d'), id, 0, 0, 32, gfxLevel);
      else S.drawGridToCanvas(cv.getContext('2d'), S.ITEM_ICONS[id], 0, 0, 4);
      row.appendChild(cv);
      var matsHtml = Object.keys(r.mats).map(function (m) {
        var have = ALCH.itemCount(ch, m);
        return L.ITEMS[m].name + ' ' + have + '/' + r.mats[m];
      }).join(' · ');
      var info = document.createElement('div');
      info.innerHTML = '<b>' + pill.name + '</b> · ' + ALCH.GRADES[pill.grade].name + '<br>' + pill.fxText +
        '<br>Nguyên liệu: ' + matsHtml + ' · Phí lò: ' + r.fee + ' Linh Thạch' +
        (learned ? '<br>Tỉ lệ thành công: ' + ALCH.successRate(ch, id) + '%' : '<br>Chưa học — ' + r.sourceText + '.');
      row.appendChild(info);
      if (learned) {
        var chk = ALCH.canBrew(ch, id);
        var b = document.createElement('button');
        b.textContent = 'Luyện đan';
        b.disabled = !chk.ok;
        b.onclick = function () {
          var res = ALCH.brew(ch, id);
          if (res.ok) {
            if (BX) BX.notePill(flags, id); // Đồ Giám: luyện 1 lần là mở trang đan
            if (SND) SND.sfx('use_item');
            toast('Luyện thành công ' + pill.name + '! (tỉ lệ ' + res.rate + '%)');
            L.recordEvent(qs, ch, { type: 'brew', target: id });
            renderQuestPanel();
          } else if (res.reason === 'failed') {
            if (SND) SND.sfx('boom_small'); // mẻ đan hỏng phải có tiếng nổ xẹp — trước đây câm hoàn toàn
            toast('Mẻ đan hỏng! Mất một phần nguyên liệu (tỉ lệ ' + res.rate + '%). Lửa đan vô tình — luyện lại mẻ khác.');
          } else {
            toast('Chưa luyện được mẻ này.');
          }
          renderAlchemyPanel(); updateHUD(); saveGame();
        };
        row.appendChild(b);
      }
      box.appendChild(row);
    });
  }
  // ---------- Tiệm pháp khí của đại phu Lý lão: bán + chế tạo + thu mua ----------
  function openArtShop() {
    renderArtShop();
    renderArtSets();
    $('panelArtShop').style.display = 'block';
  }
  var artShopCloseEl = $('artShopClose');
  if (artShopCloseEl) artShopCloseEl.addEventListener('click', function () { $('panelArtShop').style.display = 'none'; });
  function renderArtShop() {
    var box = $('artShopList');
    if (!box || !ART) return;
    ART.ensureArtifacts(ch);
    box.innerHTML = '';
    function head(t) {
      var h = document.createElement('h4');
      h.style.margin = '10px 0 4px'; h.textContent = t;
      box.appendChild(h);
    }
    function row(def, html, btnText, disabled, fn) {
      var r = document.createElement('div');
      r.className = 'shop-row';
      var cv = document.createElement('canvas');
      cv.width = 32; cv.height = 32;
      ART.drawIconArt(cv.getContext('2d'), def, 0, 0, 32, gfxLevel);
      r.appendChild(cv);
      var info = document.createElement('div');
      info.innerHTML = html;
      r.appendChild(info);
      var b = document.createElement('button');
      b.textContent = btnText;
      b.disabled = !!disabled;
      b.onclick = fn;
      r.appendChild(b);
      box.appendChild(r);
    }
    function defHtml(def, extra) {
      var lines = ART.statLines(def);
      return '<b>' + def.name + '</b> · ' + ART.KINDS[def.kind].name + ' · ' + ART.GRADES[def.grade].name +
        (def.reqTier > 0 ? ' · cần Luyện Khí tầng ' + def.reqTier : '') +
        '<br>' + def.fxText +
        (lines.length ? '<br>' + lines.join(' · ') : '') +
        (def.signature ? '<br>Ký danh — ' + def.signature.name : '') +
        (extra || '');
    }
    head('Mua pháp khí — Đại phu Lý lão (bạn có ' + ch.linhThach + ' Linh Thạch)');
    ART.SHOP.forEach(function (id) {
      // TÍCH HỢP A (01/11/2026): món chưa có ảnh biểu tượng AI thì ẨN
      // khỏi quầy theo luật của Bui (ART.isHidden) — có ảnh về
      // là tự hiện lại, không phải sửa danh sách ở đây.
      if (ART.isHidden && ART.isHidden(id)) return;
      var def = ART.ARTIFACTS[id];
      (function (def) {
        // Hảo cảm với Lý lão giảm giá Tiệm pháp khí: 40 điểm −5%, 70 điểm −10%.
        var affPctA = (AFF ? AFF.discountPct('dai_phu', flags) : 0);
        var affPriceA = (AFF ? AFF.discountPrice('dai_phu', flags, def.price) : def.price);
        row(def, defHtml(def) + (affPctA ? '<br>Giá giảm ' + affPctA + '% nhờ hảo cảm với Lý lão: ' + affPriceA + ' Linh Thạch' : ''), 'Mua ' + affPriceA + ' Linh Thạch', ch.linhThach < affPriceA, function () {
          var r = ART.buyArtifact(ch, def.id, affPriceA);
          if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Đã mua ' + def.name + '! Mở Túi đồ để đeo.'); }
          else toast('Không đủ Linh Thạch!');
          renderArtShop(); updateHUD(); saveGame();
        });
      })(def);
    });
    head('Chế tạo (nguyên liệu trong túi)');
    Object.keys(ART.RECIPES).forEach(function (id) {
      // TÍCH HỢP A: công thức của món đang ẩn (chưa có ảnh) cũng ẩn.
      if (ART.isHidden && ART.isHidden(id)) return;
      var def = ART.ARTIFACTS[id];
      var rec = ART.RECIPES[id];
      var matTxt = Object.keys(rec.mats).map(function (mid) {
        return (L.ITEMS[mid] ? L.ITEMS[mid].name : mid) + ' ' + ART.itemCount(ch, mid) + '/' + rec.mats[mid];
      }).join(', ');
      (function (def, rec) {
        row(def, defHtml(def, '<br>Nguyên liệu: ' + matTxt + ' · Phí chế tạo: ' + rec.fee + ' Linh Thạch'),
          'Chế tạo', !ART.canCraft(ch, def.id).ok, function () {
            var r = ART.craft(ch, def.id);
            if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Lý lão đã chế xong ' + def.name + '!'); }
            else toast('Chưa đủ nguyên liệu hoặc Linh Thạch công chế.');
            renderArtShop(); updateHUD(); saveGame();
          });
      })(def, rec);
    });
    var owned = ART.artifactEntries(ch);
    if (owned.length) {
      head('Thu mua pháp bảo của bạn');
      owned.forEach(function (e) {
        var def = ART.ARTIFACTS[e.id];
        var sl = ART.slotOf(ch, e.uid);
        (function (e, def, sl) {
          row(def, defHtml(def, sl >= 0 ? '<br><i>Đang đeo ở ô pháp bảo ' + (sl + 1) + ' — bán sẽ tự tháo.</i>' : ''),
            'Bán ' + def.value + ' Linh Thạch', false, function () {
              var r = ART.sellArtifact(ch, e.uid);
              if (r.ok) { if (SND) SND.sfx('shop_sell'); toast('Đã bán ' + def.name + ' (+' + r.gain + ' Linh Thạch).'); }
              renderArtShop(); updateHUD(); saveGame(); renderInventory(); updateArtBar();
            });
        })(e, def, sl);
      });
    }
    renderGearJewelSections(box, head);
  }
  // ----- Trang sức ở Tiệm pháp khí Lý lão (js/gear.js, GĐ2) -----
  function renderGearJewelSections(box, head) {
    if (!GR || !box) return;
    GR.ensureGear(ch);
    function rowJ(def, html, btnText, disabled, fn) {
      var r = document.createElement('div');
      r.className = 'shop-row';
      var cv = document.createElement('canvas');
      cv.width = 32; cv.height = 32;
      GR.drawIcon(cv.getContext('2d'), def, 0, 0, 2);
      r.appendChild(cv);
      var info = document.createElement('div');
      info.style.flex = '1'; info.innerHTML = html;
      r.appendChild(info);
      var b = document.createElement('button');
      b.textContent = btnText; b.disabled = !!disabled; b.onclick = fn;
      r.appendChild(b);
      box.appendChild(r);
    }
    function jSuffix(def) {
      var lines = GR.statLines(def, ch);
      var s = lines.length ? '<br>' + lines.join(' · ') : '';
      if (def.reqRealm > 0) s += '<br>Cần cảnh giới ' + GR.realmName(def.reqRealm) + ' để đeo';
      else if (def.reqTier > 0) s += ' · Cần Luyện Khí tầng ' + def.reqTier + ' để đeo';
      return s;
    }
    var affPctJ = (AFF ? AFF.discountPct('dai_phu', flags) : 0);
    head('Mua trang sức — trâm, ngọc bội, vòng tay, nhẫn (Lý lão)');
    GR.SHOP_JEWEL.forEach(function (id) {
      var def = GR.GEAR[id];
      var affPriceJ = (AFF ? AFF.discountPrice('dai_phu', flags, def.price) : def.price);
      rowJ(def, '<b>' + def.name + '</b> · ' + GR.SLOTS[def.slot].name + ' · ' + GR.GRADES[def.grade].name + jSuffix(def) +
        '<br>Giá: ' + affPriceJ + ' Linh Thạch' + (affPctJ ? ' (giảm ' + affPctJ + '% nhờ hảo cảm với Lý lão)' : ''),
        'Mua', ch.linhThach < affPriceJ, function () {
          var r = GR.buyGear(ch, id, affPriceJ);
          if (r.ok && SND) SND.sfx('shop_buy');
          toast(r.ok ? 'Đã mua ' + def.name + '. Mở Túi đồ để đeo.' : 'Không đủ Linh Thạch!');
          renderArtShop(); updateHUD(); saveGame();
        });
    });
    head('Chế tác trang sức (nguyên liệu trong túi)');
    Object.keys(GR.JEWEL_RECIPES).forEach(function (id) {
      var def = GR.GEAR[id], rec = GR.JEWEL_RECIPES[id];
      var matTxt = Object.keys(rec.mats).map(function (mid) {
        return (L.ITEMS[mid] ? L.ITEMS[mid].name : mid) + ' ' + GR.itemCount(ch, mid) + '/' + rec.mats[mid];
      }).join(', ');
      rowJ(def, '<b>' + def.name + '</b> · ' + GR.SLOTS[def.slot].name + ' · ' + GR.GRADES[def.grade].name + jSuffix(def) +
        '<br>Nguyên liệu: ' + matTxt + ' · Phí chế tác: ' + rec.fee + ' Linh Thạch',
        'Chế tác', !GR.canCraft(ch, id).ok, function () {
          var r = GR.craft(ch, id);
          if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Lý lão đã chế xong ' + def.name + '!'); }
          else toast('Chưa đủ nguyên liệu hoặc Linh Thạch công chế.');
          renderArtShop(); updateHUD(); saveGame();
        });
    });
    var ownedJ = GR.gearEntries(ch).filter(function (e) { return GR.SLOTS[GR.GEAR[e.id].slot].group === 'trangsuc'; });
    if (ownedJ.length) {
      head('Thu mua trang sức của bạn');
      ownedJ.forEach(function (e) {
        var def = GR.GEAR[e.id];
        var sl = GR.slotOf(ch, e.uid);
        rowJ(def, '<b>' + def.name + '</b> · ' + GR.SLOTS[def.slot].name + ' · ' + GR.GRADES[def.grade].name + jSuffix(def) +
          (sl ? '<br><i>Đang đeo — bán sẽ tự tháo.</i>' : ''),
          'Bán ' + def.value + ' Linh Thạch', false, function () {
            var r = GR.sellGear(ch, e.uid);
            if (r.ok) { if (SND) SND.sfx('shop_sell'); toast('Đã bán ' + def.name + ' (+' + r.gained + ' Linh Thạch).'); }
            renderArtShop(); updateHUD(); saveGame(); renderInventory();
          });
      });
    }
  }
  // ---------- TỦ ĐỒ (js/wardrobe.js): y phục sưu tầm + shop mùa + lễ hội ----------
  function wdSwatches(def) {
    return def.colors.map(function (c) { return '<span class="wd-swatch" style="background:' + c + '"></span>'; }).join('');
  }
  function openWardrobePanel() {
    if (!WD) { toast('Chưa có hệ tủ đồ.'); return; }
    WD.ensure(ch);
    var granted = WD.syncRewards(ch, flags);
    if (granted.length) { toast('Nhận y phục thưởng Đại Hội: ' + granted[0].name + '!'); saveGame(); }
    renderWardrobePanel();
    $('panelWardrobe').style.display = 'block';
  }
  function renderWardrobePanel() {
    if (!WD) return;
    WD.ensure(ch);
    var now = Date.now();
    var worn = WD.wornId(ch);
    var h = '<div style="font-size:13px">Linh Thạch: <b>' + ch.linhThach + '</b>' +
      (SECTP ? ' &nbsp;·&nbsp; Điểm Cống Hiến: <b>' + SECTP.pointsOf(ch) + '</b>' : '') + '</div>';
    h += '<h4 style="margin:8px 0 4px">Đang mặc</h4>';
    if (worn) {
      var wd = WD.costumeById(worn);
      h += '<div>' + wdSwatches(wd) + ' <b>' + esc(wd.name) + '</b> — ' + esc(wd.desc) +
        (wd.auraText ? '<br><i>' + esc(wd.auraText) + '</i>' : '') +
        ' <button data-wd="unwear">Cởi bỏ</button></div>';
    } else h += '<div>Ngoại hình gốc (chưa mặc y phục sưu tầm nào).</div>';
    h += '<div style="font-size:12px;color:#8a6d3b;margin-top:2px">Lớp phủ theo cảnh giới tự áp theo tu vi — không nằm trong tủ này.</div>';
    h += '<h4 style="margin:10px 0 4px">Bộ sưu tập</h4>';
    var owned = WD.visibleCostumes(ch).filter(function (c) { return WD.owns(ch, c.id); });
    if (!owned.length) h += '<div>Chưa sở hữu bộ nào có hình. Mua ở cửa hàng dưới đây hoặc làm việc lễ để nhận pháp bảo lễ.</div>';
    owned.forEach(function (c) {
      h += '<div style="margin:3px 0">' + wdSwatches(c) + ' <b>' + esc(c.name) + '</b> — ' + esc(c.desc) +
        (c.auraText ? '<br><i>' + esc(c.auraText) + '</i>' : '') +
        (worn === c.id ? ' <i>(đang mặc)</i>' : ' <button data-wd="wear" data-id="' + c.id + '">Mặc</button>') + '</div>';
    });
    h += '<h4 style="margin:10px 0 4px">Cửa hàng y phục — Linh Thạch</h4>';
    WD.shopRows(ch, now).forEach(function (row) {
      var c = row.def;
      if (!row.visible) {
        h += '<div style="margin:3px 0;color:#999">' + wdSwatches(c) + ' <b>' + esc(c.name) + '</b> — <i>Đang hoàn thiện hình, chưa mở bán.</i></div>';
        return;
      }
      if (row.seasonal) {
        var sName = WD.SEASONS[c.season].name;
        h += '<div style="margin:3px 0">' + wdSwatches(c) + ' <b>' + esc(c.name) + '</b> (mùa ' + sName + ') — ' + c.price + ' Linh Thạch. ' +
          (row.owned ? '<i>Đã sở hữu</i>'
            : row.inSeason ? '<button data-wd="buy" data-id="' + c.id + '">Mua</button> <i>Chỉ bán trong mùa ' + sName + '!</i>'
            : '<i style="color:#999">Đã hết mùa — chờ mùa ' + sName + ' năm sau.</i>') + '</div>';
      } else {
        h += '<div style="margin:3px 0">' + wdSwatches(c) + ' <b>' + esc(c.name) + '</b> — ' + c.price + ' Linh Thạch. ' +
          (row.owned ? '<i>Đã sở hữu</i>' : '<button data-wd="buy" data-id="' + c.id + '">Mua</button>') + '</div>';
      }
    });
    var hiddenCount = WD.COSTUME_IDS.filter(function (id) { var d = WD.costumeById(id); return (d.kind === 'shop' || d.kind === 'season') && !WD.hasArt(id, ch.gender); }).length;
    if (hiddenCount) h += '<div style="font-size:12px;color:#8a6d3b">(' + hiddenCount + ' bộ đang được thợ may hoàn thiện hình — có hình mới mở bán.)</div>';
    if (SECTP) {
      h += '<h4 style="margin:10px 0 4px">Đổi bằng Điểm Cống Hiến</h4>';
      WD.COSTUME_IDS.filter(function (id) { return WD.costumeById(id).kind === 'sect'; }).forEach(function (sid) {
        var sectC = WD.costumeById(sid);
        h += '<div style="margin:3px 0">' + wdSwatches(sectC) + ' <b>' + esc(sectC.name) + '</b> — ' + sectC.points + ' điểm. ' +
          (sectC.auraText ? '<i>' + esc(sectC.auraText) + '</i> ' : '') +
          (WD.owns(ch, sectC.id) ? '<i>Đã sở hữu</i>'
            : WD.hasArt(sectC.id, ch.gender) ? '<button data-wd="buypoints" data-id="' + sectC.id + '">Đổi điểm</button>'
            : '<i style="color:#999">Đang hoàn thiện hình.</i>') + '</div>';
      });
    }
    var tC = WD.costumeById('quan_quan_dai_hoi_y');
    h += '<h4 style="margin:10px 0 4px">Vinh danh Đại Hội</h4>';
    h += '<div style="margin:3px 0">' + wdSwatches(tC) + ' <b>' + esc(tC.name) + '</b> — thưởng cho Quán Quân Đại Hội Tu Tiên. ' +
      (WD.owns(ch, tC.id) ? '<i>Đã sở hữu — mặc từ Bộ sưu tập ở trên.</i>' : '<i>Chưa đạt.</i>') + '</div>';
    h += '<h4 style="margin:10px 0 4px">Lễ hội</h4>';
    var act = WD.festivalAt(now);
    if (act) {
      var prog = WD.chainProgress(qs, act.fest.id);
      var tokN = L.countItem(ch, act.fest.token);
      h += '<div><b>' + esc(act.fest.name) + '</b> đang diễn ra (' + WD.fmtDay(act.start) + ' – ' + WD.fmtDay(act.end - 86400000) + '). ' +
        'Chuỗi việc lễ: <b>' + prog.done + '/' + prog.total + '</b> việc đã trả · Vật phẩm lễ ' +
        (L.ITEMS[act.fest.token] ? esc(L.ITEMS[act.fest.token].name) : act.fest.token) + ': <b>' + tokN + '/' + act.fest.tokenNeed + '</b>. ' +
        'Gặp <b>Dì Tư</b> ở sân làng để nhận việc; đủ vật phẩm lễ và trả việc cuối trong những ngày lễ sẽ nhận pháp bảo <b>' +
        esc(ART && ART.ARTIFACTS[act.fest.artifact] ? ART.ARTIFACTS[act.fest.artifact].name : act.fest.artifact) + '</b>.</div>';
    } else {
      var nx = WD.nextFestival(now);
      h += '<div>Hiện không có lễ nào. Lễ gần nhất: <b>' + esc(nx.fest.name) + '</b> — mở ' + WD.fmtDay(nx.start) + '.</div>';
    }
    var body = $('wardrobeBody');
    body.innerHTML = h;
    body.querySelectorAll('button[data-wd]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act2 = b.getAttribute('data-wd'), id = b.getAttribute('data-id'), r;
        if (act2 === 'wear') r = WD.wearCostume(ch, id);
        else if (act2 === 'unwear') r = WD.unwear(ch);
        else if (act2 === 'buy') r = WD.buyCostume(ch, id, now);
        else if (act2 === 'buypoints') r = WD.buyWithSectPoints(ch, flags, id);
        else return;
        if (r && r.ok) {
          if (act2 === 'buy' || act2 === 'buypoints') { if (SND) SND.sfx('shop_buy'); }
          if (act2 === 'buy') toast('Đã mua ' + WD.costumeById(id).name + ' — bấm Mặc trong Bộ sưu tập.');
          if (act2 === 'buypoints') toast('Đã đổi ' + WD.costumeById(id).name + ' bằng Điểm Cống Hiến.');
          updateHUD(); saveGame();
        } else if (r && r.reason === 'linhThach') toast('Chưa đủ Linh Thạch.');
        else if (r && r.reason === 'points') toast('Chưa đủ Điểm Cống Hiến.');
        else if (r && r.reason === 'off_season') toast('Bộ này đã hết mùa bán.');
        else if (r && r.reason === 'hidden') toast('Bộ này chưa có hình — đang hoàn thiện.');
        renderWardrobePanel();
      });
    });
  }
  function killMonsterBySkill(m) {
    m.hp = 0; m.dying = true; m.deadT = 0.7;
    grantKillRewards(m);
    if (m.worldBoss) grantBossTableDrops(m); else if (!m.tide) { grantWeaponDrop(m); grantArtifactDrop(m); grantGearDrop(m); }
    onKillArtifactFx();
    L.recordEvent(qs, ch, { type: 'kill', target: m.type });
    onMonsterKilled(m);
    renderQuestPanel();
  }
  // Đòn đánh THÔ lên một quái: trừ HP, floater, frame trúng đòn, xử lý chết.
  // Không lăn chỉ số/proc — dùng cho đòn đã lăn ở nơi khác (sát thương lan
  // của proc, thiêu đốt theo giây) để proc không tự kích hoạt dây chuyền.
  function rawHitMonster(m, dmg, color, big) {
    if (!m || m.hp <= 0 || m.dying) return;
    if (SND && SND.setCombat) SND.setCombat(true); // lượt âm thanh 31/10: mọi đòn trúng quái (người chơi/thú/bạn đều qua đây) = đang giao chiến — nhạc chuyển ngữ cảnh combat, tự hết hạn sau 6s yên ắng
    m.hp -= dmg;
    m.hitT = 0.35; m.face = (m.x * TILE + 16) < px ? 'right' : 'left';
    if (SND) SND.voice(m.type, 'hit', { vol: sndVol(distToM(m)) * 0.7, elite: !!m.elite, boss: !!m.boss });
    floaters.push({ x: m.x * TILE + 16, y: m.y * TILE, txt: '-' + dmg, color: color || '#ffd94a', big: !!big, t: 1 });
    spawnHitFx(m, color);
    if (m.hp <= 0) killMonsterBySkill(m);
    updateHUD(); saveGame();
  }
  // Lan sát thương của proc (sét lan Long Lôi, sao băng lan...) sang các
  // quái còn sống gần mục tiêu gốc nhất. Đòn lan là đòn thô, không lăn tiếp.
  function splashProc(from, dmg, count, color) {
    var cands = monsters.filter(function (o) { return o !== from && o.hp > 0 && !o.dying; })
      .map(function (o) { return { m: o, d: Math.abs(o.x - from.x) + Math.abs(o.y - from.y) }; })
      .sort(function (a, b) { return a.d - b.d; })
      .slice(0, count);
    cands.forEach(function (c) { rawHitMonster(c.m, dmg, color); });
  }
  // Mọi đòn skill đều qua đây: lăn qua Logic.applyOffense để CHÍ MẠNG, HÚT
  // MÁU, % hệ linh căn (opts.elem — chỉ Thiên Căn Thần Thông truyền) và HIỆU
  // ỨNG RIÊNG của vũ khí Thiên phẩm đều chạy thật. Đòn thường đi đường
  // combatRound ở logic.js, cũng lăn cùng một applyOffense.
  function skillDamageMonster(m, dmg, color, opts) {
    if (!m || m.hp <= 0 || m.dying) return;
    var off = L.applyOffense ? L.applyOffense(ch, dmg, Math.random, opts || {}) : { dmg: dmg, crit: false, healed: 0, procs: [] };
    rawHitMonster(m, off.dmg, off.crit ? '#ff8a3c' : color, off.crit);
    if (off.healed > 0 && ch.hp > 0) {
      ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + off.healed);
      if (off.healed >= 3) floaters.push({ x: px, y: py - 88, txt: '+' + off.healed, color: '#7dff8a', t: 1 });
    }
    (off.procs || []).forEach(function (h) {
      if (m.hp <= 0 || m.dying) return;
      if (h.kind === 'freeze') {
        m.freezeT = Math.max(m.freezeT || 0, h.dur);
        if (SND) SND.sfx('ice_tick');
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Đóng băng!', color: '#bfe3ff', t: 1 });
      } else if (h.kind === 'burn') {
        m.burnT = Math.max(m.burnT || 0, h.dur); m.burnDmg = h.dmg;
        if (SND) SND.sfx('fire_tick');
        floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Thiêu đốt!', color: '#ff7a3c', t: 1 });
      } else if (h.kind === 'meteor' || h.kind === 'burst') {
        if (SND) SND.sfx('boom_small');
        if (h.dmg) rawHitMonster(m, h.dmg, '#ffe98a');
        if (h.kind === 'burst' && h.heal && ch.hp > 0) {
          ch.hp = Math.min(L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp, ch.hp + h.heal);
          floaters.push({ x: px, y: py - 88, txt: '+' + h.heal, color: '#7dff8a', t: 1 });
        }
        if (h.kind === 'meteor' && h.splash) splashProc(m, h.splash, 1, '#ffe98a');
      } else if (h.kind === 'chain') {
        if (SND) SND.sfx('zap_small');
        splashProc(m, h.dmg, h.count || 1, '#cfa6ff');
      }
    });
    updateHUD();
  }
  function monstersInRadius(cx, cy, radius) {
    return monsters.filter(function (m) {
      if (m.hp <= 0 || m.dying) return false;
      var dx = m.x * TILE + 16 - cx, dy = m.y * TILE + 28 - cy;
      return Math.sqrt(dx * dx + dy * dy) <= radius + 14;
    });
  }
  function addShake(mag) { shakeMag = Math.max(shakeMag, mag); shakeT = 0.35; }
  function castSkill(id) {
    if (!SK || !FX || !ch || deathPending) return false;
    if (flying) landPlayer(true); // ra chiêu là tự hạ khỏi kiếm
    var chk = SK.canCast(ch, id);
    var def = SK.skillDef(id, ch);
    if (!chk.ok) {
      if (chk.reason === 'locked') toast('Chưa mở khoá ' + def.name + ' — cần ' + SK.needText(id) + (id === 'thien_can' && !ch.root ? ' và đã lộ linh căn' : '') + '.');
      else if (chk.reason === 'mana') toast('Không đủ linh lực để dùng ' + def.name + '! Thổ nạp (T) để hồi nhanh.');
      else if (chk.reason === 'cd') toast(def.name + ' đang hồi chiêu...');
      return false;
    }
    // Bị động từ bí tịch (Dẫn Khí Quyết): học xong tự vận hành, bấm ô
    // chiêu chỉ báo lại — không thi triển, không tốn gì.
    if (def.passive) { toast(def.name + ' là công pháp bị động — học xong tự vận hành, không cần thi triển.'); return true; }
    // Hàng chờ mục 36 (QA 14:07/14:16 30/10): chiêu bay thẳng đơn thể
    // tung HỤT — không quái nào nằm trên đường bay — thì KHÔNG trừ
    // linh lực, KHÔNG vào hồi chiêu (trước đây applyCast trừ trước
    // rồi mới bay). Hành lang kiểm tra khớp đúng luật trúng của
    // updateEffects: tâm quái cách đường bay <= width/2 + 15 và quãng
    // bay trong tầm range. Chỉ chặn khi chắc chắn hụt; trị số
    // mana/hồi chiêu của chiêu không đổi.
    if (def.mech === 'projectile' || def.mech === 'projectile_wide') {
      var pdv = dirVec(dir);
      var psx = px + pdv.x * 18, psy = py - 44 + pdv.y * 14;
      // Hành lang bay đo tới HỘP THÂN quái (phần hình nhìn thấy), không
      // đo tới neo chân nữa: đạn xuất phát ở tầm ngực (py-44) trong khi
      // lim cũ width/2+15=36 < 44 nên bắn NGANG không bao giờ trúng
      // quái cùng hàng (playtest live 31/10: kề sát cũng bị chặn hụt).
      // Tiền kiểm này và luật trúng thật trong updateEffects dùng
      // chung một phép đo hộp thân nên không lệch nhau nữa.
      var pLim = (def.width || 40) / 2 + 4;
      var pHit = false;
      for (var pmi = 0; pmi < monsters.length; pmi++) {
        var pm = monsters[pmi];
        if (pm.hp <= 0 || pm.dying) continue;
        if (distSegBox(psx, psy, psx + pdv.x * (def.range || 0), psy + pdv.y * (def.range || 0), monsterBodyBox(pm)) <= pLim) { pHit = true; break; }
      }
      if (!pHit) { toast(def.name + ' bay hụt — không có mục tiêu nào trên đường chiêu nên không tốn linh lực.'); return false; }
    }
    SK.applyCast(ch, id);
    var dv = dirVec(dir);
    var cx = px, cy = py - 44;
    if (def.mech === 'projectile' || def.mech === 'projectile_wide') {
      spawnEffect({ skill: id, fxSkill: id === 'thien_can' ? 'thien_can' : id, rootFx: id === 'thien_can' ? ch.root : (def.elem || null),
        mech: 'projectile', x: cx + dv.x * 18, y: cy + dv.y * 14, dir: dir, speed: def.speed, range: def.range, width: def.width,
        mult: def.mult, slow: def.slow || 0, color: def.color, dur: def.range / def.speed + 0.15,
        burnDmg: def.burnPct ? Math.max(1, Math.round((L.effAtk(ch, true) + 4) * (def.mult || 1) * def.burnPct / 100)) : 0,
        burnDur: def.burnDur || 0 });
    } else if (def.mech === 'aoe_self') {
      spawnEffect({ skill: id, mech: 'aoe_self', follow: true, x: px, y: py, dir: dir, hitAt: 0.30, radius: def.radius, mult: def.mult,
        healPct: def.healPct || 0, color: def.color, rootFx: id === 'thien_can' ? ch.root : null, dur: id === 'thien_can' ? 0.95 : 0.7 });
      if (id === 'toan_phong') addShake(2);
    } else if (def.mech === 'aoe_point') {
      var tgt = nearestMonster(210);
      var gx = tgt ? tgt.x * TILE + 16 : px + dv.x * 92;
      var gy = tgt ? tgt.y * TILE + 28 : py + dv.y * 70;
      spawnEffect({ skill: id, mech: 'aoe_point', x: gx, y: gy, dir: dir, hitAt: ch.root === 'kim' ? 0.5 : 0.3, radius: def.radius,
        mult: def.mult, freeze: def.freeze || 0, color: def.color, rootFx: def.elem || ch.root, dur: 1.0 });
      addShake(4);
    } else if (def.mech === 'line') {
      spawnEffect({ skill: id, mech: 'line', x: px, y: py, dir: dir, hitAt: 0.32, range: def.range, width: def.width, mult: def.mult, color: def.color, rootFx: def.elem || ch.root, dur: 0.85 });
      addShake(3);
    } else if (def.mech === 'chain') {
      var inRange = monsters.filter(function (m) { return m.hp > 0 && !m.dying; })
        .map(function (m) { return { m: m, d: Math.sqrt(Math.pow(m.x * TILE + 16 - px, 2) + Math.pow(m.y * TILE + 28 - py, 2)) }; })
        .filter(function (o) { return o.d <= def.range; })
        .sort(function (a, b) { return a.d - b.d; })
        .slice(0, def.targets || 3);
      if (!inRange.length) { ch.ll += SK.SKILLS[id].mana; delete ch.cd[id]; toast('Không có kẻ địch nào trong tầm Thiên Lôi!'); updateHUD(); return false; }
      var tgts = inRange.map(function (o) { return { x: o.m.x * TILE + 16, y: o.m.y * TILE + 28, m: o.m }; });
      spawnEffect({ skill: id, mech: 'chain', x: px, y: py, dir: dir, hitAt: 0.10, targets: tgts, mult: def.mult, color: def.color, rootFx: def.elem || ch.root, dur: 0.8 });
      addShake(5);
    } else if (def.mech === 'dash') {
      spawnEffect({ skill: id, mech: 'dash', x: cx, y: cy, from: { x: cx, y: cy }, dir: dir, range: def.range, mult: def.mult, color: def.color, dur: 0.55 });
      addShake(2);
    } else if (def.mech === 'shield') {
      // Linh Khí Khiên (Trúc Cơ): khiên chịu thay sát thương tới khi vỡ.
      var shMax = L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp;
      ch.rShield = { hp: Math.round(shMax * def.shieldPct / 100), until: Date.now() + def.dur * 1000 };
      spawnEffect({ skill: id, fxSkill: id, mech: 'shield', follow: true, x: px, y: py, dir: dir, color: def.color, dur: def.dur });
      toast(def.name + '! Khiên chịu thay ' + ch.rShield.hp + ' sát thương trong ' + def.dur + ' giây.');
    } else if (def.mech === 'haste') {
      // Tật Phong Bộ (bí tịch vỡ lòng): buff tốc độ qua ch.buffs — đúng
      // khung buff tạm thời của đan dược/phù chú (Logic.statTotals cộng
      // stat 'speed'), thay lá buff tốc cũ cùng loại còn hiệu lực.
      var nowH = Date.now();
      ch.buffs = (ch.buffs || []).filter(function (b) { return b.stat !== 'speed' || b.until <= nowH; });
      ch.buffs.push({ stat: 'speed', val: def.speedPct, until: nowH + def.dur * 1000 });
      spawnEffect({ skill: id, fxSkill: id, mech: 'shield', follow: true, x: px, y: py, dir: dir, color: def.color, dur: def.dur });
      toast(def.name + '! Tốc độ +' + def.speedPct + '% trong ' + def.dur + ' giây.');
    } else if (def.mech === 'domain') {
      // Thần Thức Lĩnh Vực (Hóa Thần): tick xử lý ở updateEffects.
      spawnEffect({ skill: id, fxSkill: id, mech: 'domain', follow: true, x: px, y: py, dir: dir, radius: def.radius, mult: def.mult, tick: def.tick, slowPct: def.slowPct, color: def.color, dur: def.dur });
      toast(def.name + '! Lĩnh vực mở trong ' + def.dur + ' giây.');
    } else if (def.mech === 'orbit') {
      spawnEffect({ skill: id, mech: 'orbit', follow: true, x: px, y: py, dir: dir, radius: def.radius, mult: def.mult, tick: def.tick, color: def.color, dur: def.dur });
      toast(def.name + '! Phi kiếm hộ thân ' + def.dur + ' giây.');
    }
    // Động tác ra chiêu riêng cho từng skill, thời lượng khớp nhịp hiệu ứng.
    var actMap = { kiem_khi: 'cast_slash', toan_phong: 'spin', thien_can: 'channel', luu_tinh: 'dash_pose', ngu_kiem: 'toss',
      xuyen_van: 'cast_slash', pha_huyen: 'cast_slash', linh_khien: 'channel', dan_hoa: 'channel', than_loi: 'channel',
      phan_than: 'toss', tran_ap: 'channel', linh_vuc: 'channel', kiem_tran: 'channel', loi_kiep: 'channel' };
    var actDur = { thien_can: 0.9, toan_phong: 0.7, ngu_kiem: 0.6, luu_tinh: 0.5, kiem_khi: 0.38, linh_vuc: 0.8, loi_kiep: 0.8, phan_than: 0.6 };
    if (actMap[id]) setAction(actMap[id], actDur[id] || 0.55);
    if (SND) SND.skill(id, ch.root);
    updateHUD(); updateSkillBar();
    return true;
  }
  function applyEffectHit(e) {
    var def = { mult: e.mult };
    // Thiên Căn Thần Thông: truyền hệ của chiêu để % sát thương theo hệ
    // trên vũ khí phẩm cao cộng vào (applyOffense ở logic.js).
    var elemOpts = e.rootFx ? { elem: e.rootFx } : null;
    if (e.mech === 'aoe_self') {
      monstersInRadius(px, py, e.radius).forEach(function (m) {
        skillDamageMonster(m, SK.skillDamage(L.effAtk(ch, true), def, Math.random), e.color, elemOpts);
      });
      if (e.healPct) {
        var maxHpEff = L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp;
        var heal = Math.round(maxHpEff * e.healPct);
        ch.hp = Math.min(maxHpEff, ch.hp + heal);
        floaters.push({ x: px, y: py - 76, txt: '+' + heal, color: '#7dff8a', t: 1.1 });
      }
    } else if (e.mech === 'aoe_point') {
      monstersInRadius(e.x, e.y, e.radius).forEach(function (m) {
        skillDamageMonster(m, SK.skillDamage(L.effAtk(ch, true), def, Math.random), e.color, elemOpts);
        if (m.hp > 0 && e.freeze) { m.freezeT = Math.max(m.freezeT || 0, e.freeze); }
      });
    } else if (e.mech === 'line') {
      var dv = dirVec(e.dir);
      monsters.forEach(function (m) {
        if (m.hp <= 0 || m.dying) return;
        var rx = m.x * TILE + 16 - px, ry = m.y * TILE + 28 - py;
        var along = rx * dv.x + ry * dv.y, perp = Math.abs(rx * -dv.y + ry * dv.x);
        if (along >= 6 && along <= e.range + 14 && perp <= e.width / 2 + 14) {
          skillDamageMonster(m, SK.skillDamage(L.effAtk(ch, true), def, Math.random), e.color, elemOpts);
        }
      });
    } else if (e.mech === 'chain') {
      (e.targets || []).forEach(function (t, i) {
        if (t.m.hp > 0 && !t.m.dying) {
          var fall = { mult: e.mult * (1 - i * 0.15) };
          skillDamageMonster(t.m, SK.skillDamage(L.effAtk(ch, true), fall, Math.random), e.color, elemOpts);
        }
      });
    }
  }
  function updateEffects(dt) {
    for (var i = effects.length - 1; i >= 0; i--) {
      var e = effects[i];
      e.t += dt;
      if (e.follow) { e.x = px; e.y = py; }
      // Lĩnh vực Hóa Thần: mỗi tick làm chậm + gây sát thương quanh người.
      if (e.mech === 'domain') {
        e.tickAcc = (e.tickAcc || 0) + dt;
        if (e.tickAcc >= (e.tick || 0.5)) {
          e.tickAcc = 0;
          monstersInRadius(px, py, e.radius).forEach(function (m) {
            m.slowT = Math.max(m.slowT || 0, (e.tick || 0.5) + 0.15);
            skillDamageMonster(m, SK.skillDamage(L.effAtk(ch, true), { mult: e.mult }, Math.random), e.color);
          });
        }
      }
      if (e.mech === 'projectile') {
        var dv = dirVec(e.dir);
        e.x += dv.x * e.speed * dt; e.y += dv.y * e.speed * dt;
        e.traveled += e.speed * dt;
        var self = e;
        monsters.forEach(function (m) {
          if (m.hp <= 0 || m.dying || self.hitSet.indexOf(m) >= 0) return;
          // Trúng khi đạn chạm HỘP THÂN quái (phần hình nhìn thấy),
          // không phải neo chân — khớp tiền kiểm trong castSkill
          // (vá lỗi bắn ngang trượt 100%, playtest live 31/10).
          var lim = self.width / 2 + 4;
          if (distPointBox(self.x, self.y, monsterBodyBox(m)) <= lim) {
            self.hitSet.push(m);
            skillDamageMonster(m, SK.skillDamage(L.effAtk(ch, true), { mult: self.mult }, Math.random), self.color, self.rootFx ? { elem: self.rootFx } : null);
            if (m.hp > 0 && self.slow) m.slowT = Math.max(m.slowT || 0, self.slow);
            if (m.hp > 0 && self.burnDmg) {
              // Cháy bám của Hỏa Cầu Thuật (pháp quyết nhập môn): cùng
              // cơ chế burnT/burnDmg với proc cháy của vũ khí.
              m.burnT = Math.max(m.burnT || 0, self.burnDur || 2);
              m.burnDmg = Math.max(m.burnDmg || 0, self.burnDmg);
              if (SND) SND.sfx('fire_tick');
              floaters.push({ x: m.x * TILE + 16, y: m.y * TILE - 18, txt: 'Thiêu đốt!', color: '#ff7a3c', t: 1 });
            }
          }
        });
        if (e.traveled >= e.range) { effects.splice(i, 1); continue; }
      }
      if ((e.mech === 'aoe_self' || e.mech === 'aoe_point' || e.mech === 'line' || e.mech === 'chain') && !e.applied && e.t >= e.hitAt * (e.dur || 1)) {
        e.applied = true;
        applyEffectHit(e);
      }
      if (e.mech === 'dash') {
        var dvv = dirVec(e.dir);
        if (e.traveled < e.range) {
          var stepLeft = Math.min(640 * dt, e.range - e.traveled);
          var nx = px + dvv.x * stepLeft, ny = py + dvv.y * stepLeft;
          if (!collideAt(nx, py)) px = nx;
          if (!collideAt(px, ny)) py = ny;
          e.traveled += stepLeft;
          e.x = px; e.y = py - 44;
          var selfD = e;
          monsters.forEach(function (m) {
            if (m.hp <= 0 || m.dying || selfD.hitSet.indexOf(m) >= 0) return;
            var dx = m.x * TILE + 16 - px, dy = m.y * TILE + 28 - py;
            if (Math.sqrt(dx * dx + dy * dy) <= 48) {
              selfD.hitSet.push(m);
              skillDamageMonster(m, SK.skillDamage(L.effAtk(ch, true), { mult: selfD.mult }, Math.random), selfD.color);
            }
          });
        }
      }
      if (e.mech === 'orbit') {
        e.tickAcc += dt;
        if (e.tickAcc >= e.tick) {
          e.tickAcc = 0;
          var nm = nearestMonster(e.radius + 22);
          if (nm) skillDamageMonster(nm, SK.skillDamage(L.effAtk(ch, true), { mult: e.mult }, Math.random), e.color);
        }
      }
      if (e.t >= e.dur) effects.splice(i, 1);
    }
  }
  // ---------- Thanh skill + panel kỹ năng ----------
  function seedSeenSkills() {
    if (!flags.seenSkills) { flags.seenSkills = SK.unlockedList(ch); saveGame(); }
  }
  function checkUnlockNotices() {
    if (!SK || !ch) return;
    if (!flags.seenSkills) { seedSeenSkills(); return; }
    SK.unlockedList(ch).forEach(function (id) {
      if (flags.seenSkills.indexOf(id) < 0) {
        flags.seenSkills.push(id);
        var def = SK.skillDef(id, ch);
        toast('Mở khoá kỹ năng mới: ' + def.name + '! (phím ' + SK.SKILLS[id].key + ')');
      }
    });
    Object.keys(SK.PASSIVES).forEach(function (pid) {
      var key = 'pass_' + pid;
      if (SK.passiveUnlocked(ch, pid) && flags.seenSkills.indexOf(key) < 0) {
        flags.seenSkills.push(key);
        toast('Mở khoá bị động: ' + SK.PASSIVES[pid].name + '!');
      }
    });
  }
  function initSkillBar() {
    if (!SK || !FX || skillBarBuilt) return;
    var bar = $('skillBar');
    if (!bar) return;
    skillBarBuilt = true;
    bar.innerHTML = '';
    var bar2 = $('skillBar2');
    if (bar2) bar2.innerHTML = '';
    function buildSlot(id, parent) {
      var def = SK.SKILLS[id];
      var slot = document.createElement('div');
      slot.className = 'skill-slot';
      slot.id = 'slot-' + id;
      slot.title = def.name + ' (phím ' + def.key + ') — giữ lâu để xem mô tả';
      var cv = document.createElement('canvas');
      cv.width = 44; cv.height = 44; cv.className = 'skill-icon';
      slot.appendChild(cv);
      var nm = document.createElement('div');
      nm.className = 'skill-name'; nm.textContent = def.name;
      slot.appendChild(nm);
      var key = document.createElement('div');
      key.className = 'skill-key'; key.textContent = def.key;
      slot.appendChild(key);
      var cd = document.createElement('div');
      cd.className = 'skill-cd'; cd.id = 'cd-' + id; cd.style.display = 'none';
      slot.appendChild(cd);
      var cdT = document.createElement('div');
      cdT.className = 'skill-cdt'; cdT.id = 'cdt-' + id;
      slot.appendChild(cdT);
      var lock = document.createElement('div');
      lock.className = 'skill-lock'; lock.id = 'lock-' + id;
      slot.appendChild(lock);
      var holdTimer = null, held = false;
      slot.addEventListener('pointerdown', function () {
        held = false;
        holdTimer = setTimeout(function () { held = true; openSkillPanel(id); }, 450);
      });
      slot.addEventListener('pointerup', function () {
        if (holdTimer) clearTimeout(holdTimer);
        if (!held) { if (id === 'combo') attack(); else castSkill(id); }
      });
      slot.addEventListener('pointerleave', function () { if (holdTimer) clearTimeout(holdTimer); });
      parent.appendChild(slot);
      try { FX.drawIcon(cv.getContext('2d'), id === 'thien_can' ? 'thien_can' : id, ch ? ch.root : null, 44); } catch (e) {}
    }
    SK.BAR.forEach(function (id) { buildSlot(id, bar); });
    // Hàng phụ: skill theo CẢNH GIỚI (Trúc Cơ trở lên, js/realms.js) —
    // chỉ hiện khi đã có ít nhất 1 chiêu mở khoá, giữ nguyên bố cục HUD.
    if (bar2 && SK.BAR2) SK.BAR2.forEach(function (id) { buildSlot(id, bar2); });
    // Hàng bí tịch (js/manuals.js đăng ký vào SK.BAR3): chiêu học từ
    // sách, nằm cùng hàng phụ với skill cảnh giới.
    if (bar2 && SK.BAR3) SK.BAR3.forEach(function (id) { buildSlot(id, bar2); });
    updateSkillBar();
  }
  function refreshSkillIcons() {
    if (!skillBarBuilt) return;
    SK.BAR.concat(SK.BAR2 || []).concat(SK.BAR3 || []).forEach(function (id) {
      var slot = $('slot-' + id);
      if (!slot || !slot.children[0] || !slot.children[0].getContext) return;
      try {
        var c2 = slot.children[0].getContext('2d');
        c2.clearRect(0, 0, 44, 44);
        FX.drawIcon(c2, id, ch ? ch.root : null, 44);
      } catch (e) {}
    });
  }
  function updateSkillBar() {
    if (!SK || !skillBarBuilt || !ch) return;
    SK.BAR.concat(SK.BAR2 || []).concat(SK.BAR3 || []).forEach(function (id) {
      var def = SK.SKILLS[id];
      var unlocked = SK.isUnlocked(ch, id);
      var lock = $('lock-' + id);
      if (lock) {
        lock.style.display = unlocked ? 'none' : 'flex';
        lock.textContent = def.unlockRealm ? (SK.realmNameOf ? SK.realmNameOf(def.unlockRealm) : 'Cảnh giới') : ('Tầng ' + def.unlockTier);
      }
      var left = SK.cdLeft(ch, id);
      var cd = $('cd-' + id), cdt = $('cdt-' + id);
      if (cd) {
        if (unlocked && left > 0) {
          cd.style.display = 'block';
          cd.style.height = Math.min(100, left / def.cd * 100) + '%';
          if (cdt) cdt.textContent = Math.ceil(left);
        } else {
          cd.style.display = 'none';
          if (cdt) cdt.textContent = '';
        }
      }
      var slot = $('slot-' + id);
      if (slot) slot.style.opacity = (!unlocked || ch.ll < def.mana) ? '0.55' : '1';
    });
    // Hàng phụ chỉ hiện khi có ít nhất 1 skill cảnh giới/bí tịch đã mở.
    var b2 = $('skillBar2');
    if (b2 && SK.BAR2) {
      var anyOpen = SK.BAR2.concat(SK.BAR3 || []).some(function (id) { return SK.isUnlocked(ch, id); });
      b2.style.display = anyOpen ? 'flex' : 'none';
    }
  }
  function renderSkillPanel() {
    var box = $('skillList');
    if (!box || !SK) return;
    box.innerHTML = '';
    function row(id, def, stateHtml) {
      var r = document.createElement('div');
      r.className = 'skill-row';
      var cv = document.createElement('canvas');
      cv.width = 44; cv.height = 44; cv.className = 'skill-icon';
      r.appendChild(cv);
      var info = document.createElement('div');
      var eff = SK.skillDef(id, ch);
      info.innerHTML = '<b>' + eff.name + '</b> · phím ' + def.key +
        (def.mana ? ' · Linh lực: ' + def.mana : '') + (def.cd ? ' · Hồi chiêu: ' + def.cd + 's' : '') +
        '<br>' + (eff.rootDesc || def.desc) + '<br>' + stateHtml;
      r.appendChild(info);
      box.appendChild(r);
      try { FX.drawIcon(cv.getContext('2d'), id, ch ? ch.root : null, 44); } catch (e) {}
    }
    SK.BAR.concat(SK.BAR2 || []).concat(SK.BAR3 || []).forEach(function (id) {
      var def = SK.SKILLS[id];
      var st;
      if (def.manual && MANU) {
        if (SK.isUnlocked(ch, id)) {
          var u0 = MANU.upgradeInfo(ch, id);
          st = '<span style="color:#2e7d32"><b>Đã học từ bí tịch</b> — cấp ' + u0.level + '/' + u0.maxLvl + ' · Tham ngộ ' + u0.progress + '/100 (xem mục tham ngộ bên dưới)</span>';
        } else {
          st = '<span style="color:#a33"><b>Chưa học</b> — cần ' + SK.needText(id) + '</span>';
        }
      } else {
        st = SK.isUnlocked(ch, id)
          ? '<span style="color:#2e7d32"><b>Đã mở khoá</b></span>'
          : '<span style="color:#a33"><b>Chưa mở</b> — cần ' + SK.needText(id) + (id === 'thien_can' ? ' và đã lộ linh căn' : '') + '</span>';
      }
      row(id, def, st);
    });
    Object.keys(SK.PASSIVES).forEach(function (pid) {
      var p = SK.PASSIVES[pid];
      var r = document.createElement('div');
      r.className = 'skill-row';
      var info = document.createElement('div');
      info.innerHTML = '<b>' + p.name + '</b> · <i>Bị động — tự kích hoạt</i><br>' + p.desc + '<br>' +
        (SK.passiveUnlocked(ch, pid) ? '<span style="color:#2e7d32"><b>Đang hiệu lực</b></span>' : '<span style="color:#a33"><b>Chưa mở</b> — cần ' + (p.unlockRealm ? 'cảnh giới ' + (SK.realmNameOf ? SK.realmNameOf(p.unlockRealm) : '') : 'Luyện Khí tầng ' + p.unlockTier) + '</span>');
      r.appendChild(info);
      box.appendChild(r);
    });
    // ----- Bí tịch đã học: THAM NGỘ nâng cấp (js/manuals.js) -----
    if (MANU) {
      var learnedM = MANU.learnedList(ch);
      if (learnedM.length) {
        var hd = document.createElement('div');
        hd.className = 'skill-row';
        var hdInfo = document.createElement('div');
        hdInfo.innerHTML = '<b>BÍ TỊCH ĐÃ HỌC — THAM NGỘ NÂNG CẤP</b><br>Đọc sách trùng của chính chiêu đó, hoặc tĩnh tọa tham ngộ (tốn tu vi + Linh Thạch) để tích điểm tham ngộ — đủ 100 điểm chiêu lên 1 cấp (sát thương/tầm/khống chế tăng theo cấp). Sách trùng thừa đem bán theo giá phẩm.';
        hd.appendChild(hdInfo);
        box.appendChild(hd);
        learnedM.forEach(function (sid) {
          var ui = MANU.upgradeInfo(ch, sid);
          var d2 = MANU.MANUALS[sid];
          var r2 = document.createElement('div');
          r2.className = 'skill-row';
          var info2 = document.createElement('div');
          info2.innerHTML = '<b>' + d2.name + '</b> (' + MANU.gradeName(d2) + ' phẩm) · Cấp <b>' + ui.level + '/' + ui.maxLvl + '</b> · Tham ngộ: <b>' + ui.progress + '/100</b> · Sách trùng trong túi: <b>' + ui.books + '</b>' +
            (ui.capped ? '<br><span style="color:#2e7d32"><b>Chiêu đã viên mãn.</b></span>'
              : '<br>Tĩnh tọa: +' + MANU.MEDITATE_GAIN + ' điểm, tốn ' + ui.medTuVi + ' tu vi + ' + ui.medLt + ' Linh Thạch · Đọc sách trùng: +' + ui.progPerBook + ' điểm');
          r2.appendChild(info2);
          var acts = document.createElement('div');
          function mkBtn(label, fn) {
            var b = document.createElement('button');
            b.textContent = label;
            b.addEventListener('click', fn);
            acts.appendChild(b);
          }
          if (!ui.capped) mkBtn('Tĩnh tọa tham ngộ', function () {
            var rr = MANU.meditate(ch, sid);
            toast(rr.ok ? ('Tham ngộ ' + d2.name + ': +' + rr.gained + ' điểm' + (rr.leveled ? ' — LÊN CẤP ' + rr.level + '!' : '') + ' (−' + rr.tuViCost + ' tu vi, −' + rr.ltCost + ' Linh Thạch)') : (rr.error || 'Chưa tham ngộ được.'));
            if (rr.ok) { updateHUD(); updateSkillBar(); saveGame(); }
            renderSkillPanel();
          });
          if (!ui.capped && ui.books > 0) mkBtn('Đọc sách trùng (+' + ui.progPerBook + ' điểm)', function () {
            var rr = MANU.useDuplicate(ch, sid);
            toast(rr.ok ? ('Đọc quyển trùng của ' + d2.name + ': +' + rr.gained + ' điểm tham ngộ' + (rr.leveled ? ' — LÊN CẤP ' + rr.level + '!' : '')) : (rr.error || 'Chưa đọc được.'));
            if (rr.ok) { updateHUD(); saveGame(); }
            renderSkillPanel();
          });
          if (ui.books > 0) mkBtn('Bán 1 sách trùng (+' + ui.sell + ' Linh Thạch)', function () {
            var rr = MANU.sellManual(ch, d2.item);
            toast(rr.ok ? ('Đã bán 1 quyển ' + d2.name + ' lấy ' + rr.gained + ' Linh Thạch.') : (rr.error || 'Chưa bán được.'));
            if (rr.ok) { updateHUD(); saveGame(); }
            renderSkillPanel();
          });
          r2.appendChild(acts);
          box.appendChild(r2);
        });
      }
    }
  }
  function openSkillPanel(focusId) {
    renderSkillPanel();
    $('panelSkills').style.display = 'block';
  }
  // QA 15:31 30/10: hệ số Tiết Tĩnh Tu x1,25 KHÔNG làm tròn từng lần
  // nữa. Làm tròn từng lần biến đường thổ nạp tay (base 2 -> 2,5 ->
  // 3, tức +50%) và đường tự thổ nạp (base 1 -> 1,25 -> 1, tức +0%)
  // thành hai con số đều sai lời hứa "+25%" in trên panel/mô tả.
  // Phần lẻ nay TÍCH LŨY dùng chung cho cả hai đường qua
  // flags.tdMedFrac (cùng tiền lệ cultFrac của Tụ Linh Trận trong
  // dong-phu.js): trung bình dài hạn đúng x1,25 ở cả hai đường.
  function applyTdMedMult(base, mult) {
    if (!(mult > 1) || !(base > 0) || !flags) return base;
    var raw = base * mult + (flags.tdMedFrac || 0);
    var gain = Math.floor(raw);
    flags.tdMedFrac = raw - gain;
    return Math.max(1, gain);
  }
  // QA38 (muc 38 hang cho, quyet (b)): GIU NGUYEN base tay = 2, KHONG
  // them hoi chieu cho nut tay o luot nay. Ly do: moi lan tay la mot
  // lan bam co chu dich (tra bang su chu y), trong khi Tu tho nap la
  // thu dong 1/giay; phim T giu da bi chan repeat o keydown (test
  // skill khoa: repeat=true khong tang tu vi) nen khong con duong
  // "giu mot phim la cay". economy.md khong co ti le tay/tu nao de
  // ap, nen khong tu che hoi chieu hay doi base khi chua doi chieu
  // xong — neu luot sau muon can bang thi quyet bang so economy chu
  // khong phai bang cam tinh 2x.
  function meditate() {
    if (deathPending) return;
    if (flying) landPlayer(true); // thổ nạp phải ngồi trên đất
    if (!ch.root) { toast('Bạn vẫn là phàm nhân. Ra giếng cổ xem điềm lạ trước đã.'); return; }
    // TỤ LINH TRẬN (js/dong-phu.js): đứng trên đài trận trong động phủ
    // thì base tu vi nhân hệ số cấp phủ; giường đá trong phủ hồi thêm HP.
    var medTile = playerTile();
    var dpMult = DP ? DP.cultMultAt(flags, curMapId, medTile.x, medTile.y) : 1;
    var medBase = DP ? DP.cultGainBase(ch, flags, 2, curMapId, medTile.x, medTile.y) : 2;
    var talMedMult = TAL ? TAL.medMult(ch, Date.now()) : 1; // TỤ LINH PHÙ: thổ nạp x1.5 trong cửa sổ
    if (talMedMult > 1) medBase = Math.max(1, Math.round(medBase * talMedMult));
    var manuMedPct = MANU ? MANU.medTuViPct(ch) : 0; // DẪN KHÍ QUYẾT (bí tịch bị động): thổ nạp +8–12%
    if (manuMedPct > 0) medBase = Math.max(1, Math.round(medBase * (1 + manuMedPct / 100)));
    // TRẬN KỲ (js/formation.js): ngồi thổ nạp trong Tụ Khí Trận thì
    // tu vi nhân thêm theo trận (chỉ khi trận đang cắm trên đúng map).
    var fmMedMult = (FM && ch) ? FM.tuviMult(flags, curMapId, px, py) : 1;
    if (fmMedMult > 1) medBase = Math.max(1, Math.round(medBase * fmMedMult));
    // THỦY TRIỀU THEO MÙA (js/season-tide.js): Tiết Tĩnh Tu thổ nạp
    // +25% (nhân sau các hệ số đã có; phần lẻ tích lũy — xem
    // applyTdMedMult, không làm tròn từng lần nữa).
    var tdMedMult = TD ? TD.medMult(new Date(gameNow())) : 1;
    if (tdMedMult > 1) medBase = applyTdMedMult(medBase, tdMedMult);
    var g = L.gainTuVi(ch, medBase);
    if (DP && curMapId === DP.MAP_ID) DP.restHeal(ch, flags, curMapId);
    if (SK) { SK.ensureState(ch); ch.ll = Math.min(SK.maxLinhLuc(ch), ch.ll + 8); }
    skillFx = { kind: 'meditate', frames: S.skillFrames('meditate'), idx: 0, t: 0 };
    medPoseT = 1.6; // ngồi xuống thổ nạp (tư thế xếp bằng)
    L.recordEvent(qs, ch, { type: 'tuvi', n: g });
    if (SND) SND.sfx('meditate');
    toast('Thổ nạp +' + g + ' tu vi.' + (dpMult > 1 ? ' (Tụ Linh Trận x' + dpMult + ')' : '') + (talMedMult > 1 ? ' (Tụ Linh Phù x' + talMedMult + ')' : '') + (manuMedPct > 0 ? ' (Dẫn Khí Quyết +' + manuMedPct + '%)' : '') + (fmMedMult > 1 ? ' (Tụ Khí Trận x' + fmMedMult + ')' : '') + (tdMedMult > 1 ? ' (Tiết Tĩnh Tu +25%)' : ''));
    updateHUD(); saveGame(); renderQuestPanel();
  }
  $('btnAttack').addEventListener('click', attack);
  $('btnMeditate').addEventListener('click', meditate);
  $('btnAutoAtk').addEventListener('click', function () {
    autoAttack = !autoAttack;
    $('btnAutoAtk').textContent = 'Đánh tự động: ' + (autoAttack ? 'BẬT' : 'TẮT');
  });
  $('btnAutoMed').addEventListener('click', function () {
    autoMeditate = !autoMeditate;
    $('btnAutoMed').textContent = 'Tự thổ nạp: ' + (autoMeditate ? 'BẬT' : 'TẮT');
  });
  var btnGfxEl = $('btnGfx');
  if (btnGfxEl) btnGfxEl.addEventListener('click', cycleGfx);
  var btnFlyEl = $('btnFly');
  if (btnFlyEl) btnFlyEl.addEventListener('click', toggleFlight); // BAY (phím F, theo kiểu bay đang chọn)
  var btnFlyModeEl = $('btnFlyMode');
  if (btnFlyModeEl) btnFlyModeEl.addEventListener('click', cycleFlyMode); // MỤC 27: đổi kiểu bay
  var btnSndEl = $('btnSnd');
  if (btnSndEl) btnSndEl.addEventListener('click', cycleSnd);
  // Âm thanh chỉ được khởi tạo sau tương tác đầu tiên (chính sách
  // autoplay của trình duyệt): chạm phím/chạm màn hình lần đầu là mở.
  if (SND) {
    var sndUnlockFn = function () { SND.unlock(); };
    document.addEventListener('pointerdown', sndUnlockFn);
    document.addEventListener('keydown', sndUnlockFn);
  }
  $('btnInteract').addEventListener('click', interact);
  // ---------- Tu hành: panel điều kiện đột phá (thang Luyện Khí 1-9) ----------
  // Linh địa nhận diện theo vị trí đứng: giếng cổ map 1 (tâm giếng, bán
  // kính 72px) và Đài Vọng Vân map 3 (ô x 38-48, y 22-25 trong maps.js).
  function currentPlace() {
    if (curMapId === 'map1') {
      var mp = curMap();
      if (mp.well) {
        var dx = px - (mp.well.x * TILE + 16), dy = py - (mp.well.y * TILE + 28);
        if (Math.sqrt(dx * dx + dy * dy) <= 72) return 'gieng_co';
      }
    }
    if (curMapId === 'map3') {
      var tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
      if (tx >= 50 && tx <= 60 && ty >= 30 && ty <= 33) return 'dai_vong_van'; // V10: đài (38..48, 22..25) + offset map (12,8)
    }
    // Độ Kiếp Đài: cả map 14 là đài độ kiếp trên đỉnh Đại Sơn (js/maps.js).
    if (curMapId === 'map14') return 'do_kiep_dai';
    return null;
  }
  // Thông tin đột phá dùng cho panel + nút Tu hành: từ Trúc Cơ trở lên
  // (và ở mốc Luyện Khí 9) do js/realms.js phụ trách (tiểu giai quay tỉ
  // lệ, mốc liên cảnh giới là LÔI KIẾP); dưới đó uỷ quyền logic.js.
  function cultInfo() {
    if (RM && ch && RM.handles(ch)) return RM.info(ch, qs, { place: currentPlace() });
    return L.breakthroughInfo(ch, qs, { place: currentPlace() });
  }
  function renderCultPanel() {
    var body = $('cultBody');
    if (!body || !ch || !L.breakthroughInfo) return;
    var info = cultInfo();
    var html = '<p style="margin-top:0">Cảnh giới hiện tại: <b>' + ch.realm + '</b>' + (ch.root ? ' · ' + L.rootOf(ch).name : ' · Chưa lộ linh căn') + '</p>';
    if (RM) {
      html += '<p style="margin:2px 0;font-size:13px">Thiên Đạo Ấn: <b>' + (ch.thienDaoAn || 0) + '/' + RM.AN_MAX + '</b> — mỗi ấn +2% Máu tối đa và +2% công vĩnh viễn' +
        (ch.temperTotal ? ' · Luyện thể tích luỹ từ lôi kiếp: <b>+' + ch.temperTotal.maxHp + ' Máu, +' + ch.temperTotal.def + ' thủ, +' + ch.temperTotal.atk + ' công</b>' : '') + '</p>';
      var formNow = RM.formOf(ch);
      html += '<p style="margin:2px 0;font-size:13px">Hình thái: ' + formNow.desc + '</p>';
    }
    var pct = Math.min(100, Math.floor(ch.tuVi / ch.tuViMax * 100));
    html += '<div style="background:#2a2016;border:1px solid #8b5a2b;border-radius:6px;height:16px;overflow:hidden"><div style="background:#7ec850;height:100%;width:' + pct + '%"></div></div>';
    html += '<p style="margin:4px 0">Tu vi: <b>' + Math.floor(ch.tuVi) + '/' + ch.tuViMax + '</b></p>';
    if (info.atMax) {
      html += '<p><b>' + ch.realm + '</b> — đã đứng ở đỉnh thang cảnh giới hiện tại.</p>';
    } else {
      html += '<h4 style="margin:8px 0 4px">Đột phá lên ' + info.targetRealm + ' — điều kiện:</h4>';
      info.conditions.forEach(function (c) {
        html += '<div style="padding:3px 0;border-bottom:1px solid #e2d3ac"><span style="color:' + (c.met ? '#2e7d32' : '#a33') + '"><b>' + (c.met ? 'ĐẠT' : 'CHƯA ĐẠT') + '</b></span> · <b>' + c.label + '</b><br><span style="font-size:13px">' + c.detail + '</span></div>';
      });
      if (info.kind === 'cross' && info.tribulation) {
        var tb = info.tribulation;
        html += '<h4 style="margin:8px 0 4px">⚡ Lôi kiếp ' + info.targetRealm + ' — ' + tb.strikes + ' đạo thiên lôi</h4>';
        html += '<p style="margin:2px 0;font-size:13px">Mốc liên cảnh giới không quay tỉ lệ: dẫn động thiên lôi và SỐNG SÓT. Mỗi đạo có vòng đỏ báo hiệu ' + tb.telegraphSec + 's rồi sét giáng — đứng trong vòng chịu <b>' + tb.dmgPcts.join('% → ') + '%</b> Máu tối đa theo thứ tự đạo (chưa trừ giảm sát thương từ bị động/pháp bảo/linh địa), né ra ngoài chỉ chịu 10% con số đó. Giữa các đạo nghỉ ' + tb.restSec + 's để uống đan hồi phục.</p>';
        html += '<p style="margin:2px 0;font-size:13px">Đứng chịu trọn 1 đạo = +1 điểm <b>luyện thể</b>: độ kiếp thành công quy thành +Máu/+thủ/+công vĩnh viễn. Né hết thì an toàn nhưng không luyện được gì.</p>';
        html += '<p style="margin:2px 0;font-size:13px">Hình thái lôi kiếp có thể gặp (lăn ngẫu nhiên khi dẫn động — linh căn càng tốt, cảnh giới càng cao càng dễ gặp hình thái mạnh và hiếm): ' + tb.forms.map(function (fid) { var fd = RM.TRIB_FORMS[fid]; return '<b>' + fd.name + '</b> (sát thương x' + fd.dmgMult + ', luyện thể x' + fd.temperMult + ')'; }).join(' · ') + '.</p>';
        html += '<p style="margin:2px 0;font-size:13px">Chết giữa kiếp: mất ' + info.rule.failLossPct + '% tu vi, vật dẫn kiếp đã tiêu hao không hoàn lại, cần ngộ đạo ' + info.rule.cooldownSec + ' giây. Sống sót hết ' + tb.strikes + ' đạo: đột phá thành công, Thiên Đạo ban phước — hồi đầy Máu/linh lực và +1 Thiên Đạo Ấn.</p>';
        if (DM) {
          var dmChance = Math.round((DM.CHANCES[info.targetRank] || 0) * 100);
          html += '<p style="margin:2px 0;font-size:13px">Tâm Ma Kiếp: trước khi lôi kiếp giáng, có ' + dmChance + '% gặp bản sao của chính mình trong thức hải (đấu theo lượt, dùng đúng chiêu bạn đã học). Thắng thì giữ nguyên tu vi rồi dẫn kiếp ngay; thua thì mất thêm 10% tu vi, phải thổ nạp bù lại mới dẫn kiếp được — thức hải đấu không làm mất máu thật và không mất vật dẫn kiếp.' +
            (flags.demonPending ? ' Tâm ma đang chờ ở mốc này — bấm đột phá sẽ mở lại thức hải.' : '') +
            (flags.demonTitles && flags.demonTitles.length ? ' Danh hiệu tâm cảnh: ' + flags.demonTitles.map(function (t) { return t.title; }).join(' · ') + '.' : '') +
            (flags.demonWard ? ' Đang có Ấn Tâm: lần gặp kế tiếp bản sao yếu đi.' : '') + '</p>';
        }
      } else {
        var rp = info.rateParts;
        html += '<p style="margin:8px 0 2px">Tỉ lệ thành công: <b style="font-size:17px">' + info.rate + '%</b></p>';
        html += '<p style="margin:2px 0;font-size:13px">Tỉ lệ gốc ' + rp.base + '% · Đan hỗ trợ +' + rp.pill + '% · Linh địa +' + rp.place + '% · Linh căn +' + rp.root + '%' + (info.targetTier > 1 || info.kind === 'stage' ? ' (trần 95%)' : '') + '</p>';
        html += '<p style="margin:2px 0;font-size:13px">Nếu thất bại: mất ' + info.rule.failLossPct + '% tu vi hiện có (không rớt ' + (info.kind === 'stage' ? 'giai đoạn' : 'tầng') + ')' + (info.rule.cooldownSec ? ', cần ngộ đạo ' + info.rule.cooldownSec + ' giây mới thử lại được' : '') + (info.yeuDan && info.yeuDan.need > 0 ? '. Yêu Đan Cấp 1 chỉ trừ khi đột phá thành công — thất bại không mất viên nào.' : '.') + '</p>';
      }
    }
    if (RM && RM.ladder) {
      html += '<h4 style="margin:10px 0 4px">Thang cảnh giới — Trúc Cơ tới Độ Kiếp đều phải độ kiếp</h4>';
      RM.ladder().forEach(function (row) {
        var cur = RM.rankOf(ch) === row.rank;
        html += '<div style="padding:2px 0;font-size:13px;border-bottom:1px solid #e2d3ac;' + (cur ? 'color:#2e7d32' : '') + '"><b>' + row.name + '</b>' + (cur ? ' ← bạn đang ở đây' : '') + '<br>Tu vi từng giai đoạn: ' + row.needs.map(function (n) { return n > 0 ? n : '—'; }).join(' · ') +
          (row.tribulation ? ' · Lôi kiếp: ' + row.tribulation.strikes + ' đạo (' + row.tribulation.dmgPcts.join('/') + '% Máu)' : '') +
          (row.cross ? '<br>Vượt lên cảnh giới kế cần: ' + row.cross.items.map(function (e) { return (L.ITEMS[e.id] ? L.ITEMS[e.id].name : e.id) + ' x' + e.n; }).join(' · ') + (row.cross.placeReq ? ' · độ kiếp tại ' + RM.PLACES[row.cross.placeReq].name : '') : '') + '</div>';
      });
    }
    body.innerHTML = html;
    var go = $('btnBreakGo');
    if (go) {
      go.disabled = !info.canAttempt;
      go.textContent = info.atMax ? 'Đã đạt Viên Mãn' : (info.kind === 'cross' ? ('Dẫn động lôi kiếp — lên ' + info.targetRealm) : ('Đột phá lên ' + info.targetRealm + (info.canAttempt ? ' (' + info.rate + '%)' : '')));
    }
  }
  function attemptBreakthrough() {
    // Mốc LIÊN cảnh giới (từ Trúc Cơ trở đi): là sự kiện LÔI KIẾP sống
    // sót, không quay tỉ lệ — đi đường riêng startTribulationFlow.
    if (RM && RM.handles(ch) && !ch.tribulation) {
      var inf = RM.info(ch, qs, { place: currentPlace() });
      if (inf && inf.kind === 'cross') {
        if (!inf.canAttempt) { renderCultPanel(); return; }
        if (gateDemonForCross(inf.targetRank)) return;
        startTribulationFlow();
        return;
      }
    }
    var r = (RM && RM.handles(ch)) ? RM.doBreakthrough(ch, qs, { place: currentPlace() }) : L.doBreakthrough(ch, qs, { place: currentPlace() });
    if (!r.ok) { renderCultPanel(); return; }
    if (r.reason === 'tribulation') { if (r.info && gateDemonForCross(r.info.targetRank)) return; startTribulationFlow(); return; }
    skillFx = { kind: 'meditate', frames: S.skillFrames('meditate'), idx: 0, t: 0 };
    medPoseT = 1.6; // đột phá trong tư thế ngồi thổ nạp
    var bh = $('modalBreak').querySelector('h2');
    if (r.success) {
      if (SND) SND.sfx('breakthrough');
      if (SK) { SK.ensureState(ch); ch.ll = SK.maxLinhLuc(ch); checkUnlockNotices(); refreshSkillIcons(); }
      L.recordEvent(qs, ch, { type: 'breakthrough' });
      if (bh) bh.textContent = 'Đột phá!';
      $('breakText').textContent = 'Đột phá thành công (tỉ lệ ' + r.rate + '%). Cảnh giới hiện tại: ' + r.realm + '. Máu, công, thủ đều tăng, linh lực hồi đầy.' + (r.yeuDanUsed ? ' Đã dùng ' + r.yeuDanUsed + ' Yêu Đan Cấp 1 làm nguyên liệu đột phá.' : '');
    } else {
      if (SND) SND.sfx('break_fail'); // đột phá hỏng phải có tiếng trầm đi kèm banner
      if (bh) bh.textContent = 'Đột phá thất bại!';
      $('breakText').textContent = 'Linh khí tán loạn ở phút chót (tỉ lệ thành công là ' + r.rate + '%). Bạn mất ' + r.lostTuVi + ' tu vi, tâm cảnh chấn động — cần ngộ đạo ' + r.cooldownSec + ' giây mới thử lại được. Cảnh giới giữ nguyên: ' + r.realm + '.';
    }
    $('modalBreak').style.display = 'block';
    updateHUD(); saveGame(); renderQuestPanel(); renderCultPanel();
  }
  // ---------- TÂM MA KIẾP (js/inner-demon.js, mục 7 hàng chờ) ----------
  // Cổng đặt TRƯỚC startTribulationFlow, không đặt trong nó: hook
  // PNT_TEST gọi thẳng startTribulationFlow để mô phỏng lôi kiếp phải
  // đi đường không tâm ma, còn đường bấm nút của người chơi thì qua
  // cổng này. Trận thức hải là panel theo lượt, không vẽ lên canvas
  // thế giới — bản sao dùng đúng sheet hero + chiêu đã học ở tầng dữ
  // liệu (xem js/inner-demon.js), panel chỉ hiện thanh máu + log.
  var demonRun = null; // {variant, targetRank, stage, dialogue, duel, result}
  function gateDemonForCross(targetRank) {
    if (!DM) return false;
    var enc = DM.beginEncounter(flags, targetRank);
    if (enc.triggered) { openDemonPanel(enc.variant, targetRank); return true; }
    return false;
  }
  function openDemonPanel(variant, targetRank) {
    demonRun = { variant: variant, targetRank: targetRank, stage: 'dialogue', dialogue: null, duel: null, result: null };
    var pc = $('panelCult'); if (pc) pc.style.display = 'none';
    renderDemonPanel();
    var p = $('panelDemon'); if (p) p.style.display = 'block';
  }
  function demonBar(cur, max) {
    var pct = max > 0 ? Math.max(0, Math.min(100, Math.floor(cur / max * 100))) : 0;
    return '<div style="background:#2a2016;border:1px solid #8b5a2b;border-radius:6px;height:14px;overflow:hidden"><div style="background:#7ec850;height:100%;width:' + pct + '%"></div></div>';
  }
  function renderDemonPanel() {
    if (!DM || !demonRun || !ch) return;
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var html = '<p style="margin-top:0">Mốc liên cảnh giới lên <b>' + esc(DM.realmNameOf(demonRun.targetRank)) + '</b> — trước khi lôi kiếp giáng, thức hải của bạn mở ra.</p>';
    html += '<div class="qitem"><b>' + esc(demonRun.variant.name) + '</b><br><i>' + esc(demonRun.variant.taunt) + '</i></div>';
    if (demonRun.stage === 'dialogue') {
      html += '<p>Bản sao mang đúng hình dáng và chiêu thức của bạn. Nó hỏi một câu — câu trả lời làm nó yếu đi hoặc mạnh lên:</p>';
      DM.DIALOGUE.forEach(function (d) {
        html += '<div class="qitem">' + esc(d.text) + '<br><button data-demon-choice="' + esc(d.id) + '">Chọn câu này</button></div>';
      });
      html += '<p>Đóng panel giữa chừng = tạm lui, không mất gì — tâm ma vẫn chờ ở đúng mốc này cho lần bấm đột phá sau.</p>';
    } else if (demonRun.stage === 'duel') {
      var du = demonRun.duel;
      html += '<div class="qitem"><b>' + esc(demonRun.dialogue.reply) + '</b></div>';
      html += '<div class="qitem"><b>Bạn</b> — Máu thức hải: ' + Math.max(0, Math.floor(du.playerHp)) + '/' + du.playerMaxHp + demonBar(du.playerHp, du.playerMaxHp) +
        '<br><b>' + esc(du.clone.name) + '</b> — Máu: ' + Math.max(0, Math.floor(du.clone.hp)) + '/' + du.clone.maxHp + demonBar(du.clone.hp, du.clone.maxHp) +
        '<br>Bản sao dùng chiêu mạnh nhất của bạn: <b>' + esc(du.clone.bestSkill.name) + '</b>. Bạn đánh trước mỗi vòng.</div>';
      if (du.log.length) {
        html += '<div class="qitem"><b>Diễn biến</b><br>' + du.log.slice(-8).map(function (r) {
          return 'Vòng ' + r.round + ': bạn dùng ' + esc(r.playerSkill) + (r.playerDmg ? ' gây ' + r.playerDmg : '') +
            (r.cloneSkill ? ' · bản sao dùng ' + esc(r.cloneSkill) + ' gây ' + r.cloneDmg + (r.cloneAbsorbed ? ' (khiên đỡ ' + r.cloneAbsorbed + ')' : '') : '') +
            ' — bạn còn ' + Math.max(0, Math.floor(r.playerHpAfter)) + ', bản sao còn ' + Math.max(0, Math.floor(r.cloneHpAfter));
        }).join('<br>') + '</div>';
      }
      html += '<p>Chọn chiêu của bạn cho vòng ' + (du.round + 1) + ':</p>';
      du.skills.forEach(function (s) {
        html += '<button data-demon-skill="' + esc(s.id) + '" style="margin:2px">' + esc(s.name) + ' (x' + (s.mult || 1) + ')</button> ';
      });
    } else if (demonRun.stage === 'done') {
      var res = demonRun.result;
      if (res.win) {
        html += '<div class="qitem"><b>Bạn thắng tâm ma.</b> Tu vi giữ nguyên — điều kiện dẫn kiếp vẫn đạt. Danh hiệu tâm cảnh: <b>' + esc(res.title) + '</b>' +
          (res.ward ? ' · Nhận <b>Ấn Tâm</b>: lần gặp tâm ma kế tiếp bản sao yếu đi.' : '') + '</div>';
        html += '<button data-demon-continue="trib">Tiếp tục dẫn lôi kiếp</button>';
      } else {
        html += '<div class="qitem"><b>Tâm ma thắng vòng này.</b> Bạn mất thêm <b>' + res.lostTuVi + ' tu vi</b> (thức hải đấu không làm mất máu thật, không mất vật dẫn kiếp). Danh hiệu tâm cảnh: <b>' + esc(res.title) + '</b>.</div>';
        html += '<p>Tu vi không còn đầy nên chưa dẫn kiếp được — thổ nạp bù lại cho đầy rồi bấm đột phá lại.</p>';
        html += '<button data-demon-continue="refill">Về thổ nạp bù tu vi</button>';
      }
    }
    $('demonBody').innerHTML = html;
    var btns = $('demonBody').querySelectorAll('[data-demon-choice]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var dr = DM.dialogueResult(btn.getAttribute('data-demon-choice'));
          if (!dr.ok) return;
          var eff = DM.effectiveCloneMult(flags, dr.cloneMult);
          demonRun.dialogue = dr;
          demonRun.duel = DM.newDuel(ch, eff.mult);
          demonRun.stage = 'duel';
          renderDemonPanel();
        });
      })(btns[i]);
    }
    var sks = $('demonBody').querySelectorAll('[data-demon-skill]');
    for (var j = 0; j < sks.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var step = DM.duelStep(demonRun.duel, btn.getAttribute('data-demon-skill'));
          if (!step.ok) return;
          if (step.done) {
            demonRun.result = DM.resolveDuel(ch, flags, demonRun.duel, demonRun.dialogue, demonRun.targetRank);
            demonRun.stage = 'done';
            if (SND) SND.sfx(demonRun.result.win ? 'quest_complete' : 'break_fail');
            saveGame();
          }
          renderDemonPanel();
        });
      })(sks[j]);
    }
    var conts = $('demonBody').querySelectorAll('[data-demon-continue]');
    for (var k = 0; k < conts.length; k++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-demon-continue');
          $('panelDemon').style.display = 'none';
          demonRun = null;
          updateHUD(); saveGame(); renderCultPanel();
          if (mode === 'trib') startTribulationFlow();
          else toast('Thổ nạp cho tu vi đầy lại rồi bấm đột phá để dẫn kiếp.');
        });
      })(conts[k]);
    }
  }
  var demonClose = $('demonClose');
  if (demonClose) demonClose.addEventListener('click', function () { $('panelDemon').style.display = 'none'; });
  // ---------- LÔI KIẾP thời gian thực (js/realms.js) ----------
  // Vòng đỏ báo hiệu khoá tâm tại chỗ người chơi đứng lúc mỗi đạo bắt
  // đầu; sét giáng sau telegraphSec — trong vòng chịu trọn, ngoài vòng
  // chỉ chịu phần nhỏ (graze). Logic thuần ở realms.js (start/resolve),
  // ở đây chỉ chạy sự kiện + render + trừ máu qua khiên linh khí.
  var tribRun = null; // { idx, phase:'telegraph'|'struck'|'rest', t, cx, cy }
  function startTribulationFlow() {
    var st = RM.startTribulation(ch, qs, { place: currentPlace() });
    if (!st.ok) { renderCultPanel(); toast(st.message || 'Chưa đủ điều kiện độ kiếp.'); return; }
    var panel = $('panelCult'); if (panel) panel.style.display = 'none';
    tribRun = { idx: 0, phase: 'telegraph', t: 0, cx: px, cy: py };
    bossAnnounce('⚡ THIÊN KIẾP GIÁNG XUỐNG — ' + st.form.name + ': ' + st.form.desc + ' (' + st.trib.strikes + ' đạo)');
    toast('Lôi kiếp hình thái ' + st.form.name + ' — sống sót ' + st.trib.strikes + ' đạo thiên lôi để đột phá ' + (st.info ? st.info.targetRealm : '') + '!');
    if (SND) SND.sfx('kyngo');
    updateHUD(); saveGame();
  }
  function tribStrikeHit() {
    var trib = ch && ch.tribulation;
    if (!trib || !tribRun) return;
    var tb = RM.TRIBULATIONS[trib.targetRank];
    var dist = Math.sqrt(Math.pow(px - tribRun.cx, 2) + Math.pow(py - tribRun.cy, 2));
    var inside = dist <= tb.radius;
    var hit = RM.tribStrikeDamage(ch, trib, tribRun.idx, inside);
    var dmg = hit.dmg;
    // Khiên linh khí (skill linh_khien) chịu thay trước, như đòn quái.
    if (ch.rShield && ch.rShield.until > Date.now() && ch.rShield.hp > 0 && dmg > 0) {
      var absorbed = Math.min(ch.rShield.hp, dmg);
      ch.rShield.hp -= absorbed; dmg -= absorbed;
      if (absorbed > 0) floaters.push({ x: px, y: py - 98, txt: 'Khiên đỡ ' + absorbed, color: '#7fe8d6', t: 1 });
    }
    ch.hp -= dmg;
    if (inside) {
      trib.tanked += 1;
      // THẾ LÔI PHÙ: phần bị phù chặn không tính Luyện Thể (trib.tankedEff).
      trib.tankedEff = (trib.tankedEff || 0) + (hit.talisman ? (1 - hit.talisman.pct / 100) : 1);
      if (hit.talisman) floaters.push({ x: px, y: py - 116, txt: 'Thế Lôi Phù hứng ' + hit.talisman.pct + '% đạo này!', color: '#ffd94a', t: 1.2 });
    }
    floaters.push({ x: px, y: py - 70, txt: '-' + dmg + (inside ? '' : ' (né!)'), color: inside ? '#ff5a4a' : '#ffb84e', t: 1.1 });
    spawnEffect({ skill: 'loi', fxSkill: 'loi', x: tribRun.cx, y: tribRun.cy, targets: [{ x: tribRun.cx, y: tribRun.cy }], color: RM.formColorAt(RM.TRIB_FORMS[trib.form], tribRun.idx), dur: 0.8, cosmetic: true });
    if (SND && SND.skill) SND.skill('thien_can', 'loi');
    addShake(inside ? 6 : 3);
    if (ch.hp <= 0) { ch.hp = 0; finishTribulation(false); }
    updateHUD();
  }
  function updateTribulation(dt) {
    if (!tribRun || !ch || !ch.tribulation || !RM) return;
    var trib = ch.tribulation;
    var tb = RM.TRIBULATIONS[trib.targetRank];
    tribRun.t += dt;
    if (tribRun.phase === 'telegraph') {
      if (tribRun.t >= tb.telegraphSec) { tribRun.phase = 'struck'; tribRun.t = 0; tribStrikeHit(); }
    } else if (tribRun.phase === 'struck') {
      if (tribRun.t >= 0.4) {
        if (!ch.tribulation) return; // đã kết thúc trong tribStrikeHit (chết)
        tribRun.idx += 1; trib.idx = tribRun.idx;
        if (tribRun.idx >= tb.strikes) { finishTribulation(true); return; }
        tribRun.phase = 'rest'; tribRun.t = 0;
        toast('Đạo lôi ' + (tribRun.idx + 1) + '/' + tb.strikes + ' sắp giáng — tranh thủ uống đan, đổi vị trí!');
      }
    } else if (tribRun.phase === 'rest') {
      if (tribRun.t >= tb.restSec) { tribRun.phase = 'telegraph'; tribRun.t = 0; tribRun.cx = px; tribRun.cy = py; }
    }
  }
  function finishTribulation(survived) {
    var r = RM.resolveTribulation(ch, survived ? 'survived' : 'dead');
    tribRun = null;
    skillFx = { kind: 'meditate', frames: S.skillFrames('meditate'), idx: 0, t: 0 };
    medPoseT = 1.6;
    var bh = $('modalBreak').querySelector('h2');
    if (r.success) {
      if (SND) SND.sfx('breakthrough');
      spawnEffect({ skill: 'ban_phuoc', fxSkill: 'ban_phuoc', follow: true, x: px, y: py, dur: 2.2, cosmetic: true });
      if (SK) { SK.ensureState(ch); ch.ll = SK.maxLinhLuc(ch); checkUnlockNotices(); refreshSkillIcons(); }
      L.recordEvent(qs, ch, { type: 'breakthrough' });
      // BIA TRUYỀN KỲ (js/legend-board.js): độ kiếp thành công khắc bia theo cảnh giới đạt được.
      if (LG) { var lgTrib = LG.noteTribulation(flags, r.realm, r.formName, r.tanked, gameNow()); if (lgTrib.ok) toast('Bia Truyền Kỳ: khắc thêm dấu mốc — độ kiếp thành công lên ' + r.realm + '!'); }
      if (bh) bh.textContent = 'Độ kiếp thành công — Thiên Đạo ban phước!';
      $('breakText').textContent = 'Bạn đã sống sót qua lôi kiếp ' + r.formName + ' (' + r.tanked + ' đạo chịu trọn), đột phá lên ' + r.realm + '! Nhận Thiên Đạo Ấn thứ ' + r.thienDaoAn + ' (mỗi ấn +2% Máu và +2% công vĩnh viễn). Luyện thể: +' + r.temper.maxHp + ' Máu tối đa, +' + r.temper.def + ' thủ, +' + r.temper.atk + ' công. Thiên Đạo ban phước hồi đầy Máu và linh lực.';
    } else {
      ch.hp = 1; // gục giữa kiếp nhưng giữ được mạng — không kích hoạt luồng chết thường
      if (SND) SND.sfx('break_fail');
      if (bh) bh.textContent = 'Độ kiếp thất bại!';
      $('breakText').textContent = 'Bạn gục xuống giữa lôi kiếp ' + r.formName + '. Mất ' + r.lostTuVi + ' tu vi, vật dẫn kiếp đã tiêu hao không hoàn lại, cần ngộ đạo ' + r.cooldownSec + ' giây mới thử lại được. Cảnh giới giữ nguyên: ' + r.realm + '.';
    }
    $('modalBreak').style.display = 'block';
    updateHUD(); saveGame(); renderQuestPanel(); renderCultPanel();
  }
  $('btnBreak').addEventListener('click', function () {
    renderCultPanel();
    $('panelCult').style.display = $('panelCult').style.display === 'block' ? 'none' : 'block';
  });
  var btnGo = $('btnBreakGo');
  if (btnGo) btnGo.addEventListener('click', attemptBreakthrough);
  var cultClose = $('cultClose');
  if (cultClose) cultClose.addEventListener('click', function () { $('panelCult').style.display = 'none'; });
  $('breakClose').addEventListener('click', function () { $('modalBreak').style.display = 'none'; });
  $('btnSave').addEventListener('click', function () { saveGame(); toast('Đã lưu tiến trình.'); });
  // ---- Gắn kết giao diện mới (lệnh Bui 20:13–20:24) ----
  // HUD bấm được (20:17): chạm khung nhân vật mở panel Nhân Vật.
  $('hud').addEventListener('click', function () { openCharacterPanel(); });
  // Nút thu/gọn HUD (21:50): chặn nổi bọt để KHÔNG mở panel Nhân Vật;
  // bấm phần còn lại của khung (kể cả khi đang gọn) vẫn mở như cũ.
  var hudTgEl = $('hudToggle');
  if (hudTgEl) hudTgEl.addEventListener('click', function (e) { if (e && e.stopPropagation) e.stopPropagation(); toggleHudCompact(); });
  // QA 13:46 30/10 (mục 31): nút thanh công cụ chưa đủ điều kiện thì MỜ
  // (opacity 0.55 + title ghi lý do, theo mẫu nút khóa Ngự Kiếm), KHÔNG
  // ẩn và KHÔNG disable — bấm vào vẫn mở panel/toast giải thích, và đếm
  // nút vẫn đủ 31. Mọi cổng lấy đúng từ module sẵn có, không bịa thêm
  // điều kiện: Thổ nạp cần lộ linh căn (meditate() chặn y vậy); Trận Kỳ
  // cần đã trả q_tong_tran (FORM.learned); Đi Cùng cần đã bái nhập
  // (COMP.canRecruit); Hộ Tống cần đường buôn đã thông
  // (ESC.canStart, lý do need_road); Đấu Giá cần đúng map 3 + qua
  // chương 8 (AUC.canEnter). Các nút còn lại luôn sáng.
  function refreshMenuButtons() {
    function dim(id, reason) {
      var b = $(id);
      if (!b) return;
      if (reason) { b.style.opacity = '0.55'; b.title = reason; }
      else { b.style.opacity = ''; b.title = ''; }
    }
    try {
      dim('btnMeditate', (!ch || !ch.root) ? 'Vẫn là phàm nhân — ra giếng cổ xem điềm lạ trước đã.' : null);
      dim('btnFormation', (FM && qs && !FM.learned(qs.turnedIn || [])) ? 'Chưa học trận pháp — hoàn thành chuỗi trận kỳ của tông rồi quay lại.' : null);
      var cr = (COMP && flags) ? COMP.canRecruit(flags) : null;
      dim('btnCompanion', (cr && !cr.ok && cr.reason === 'no_sect') ? (cr.needText || 'Chưa bái nhập tông nên chưa có đồng môn đi cùng.') : null);
      var es = (ESC && flags) ? ESC.canStart(flags, qs, ch, null) : null;
      dim('btnEscort', (es && !es.ok && es.reason === 'need_road') ? (es.needText || '') : null);
      var ce = (AUC && flags) ? AUC.canEnter(flags, qs, ch, curMapId) : null;
      dim('btnAuction', (ce && !ce.ok) ? ce.reason : null);
    } catch (e) {}
  }
  // Menu gom nút (20:16).
  $('btnMenu').addEventListener('click', function () {
    refreshMenuButtons();
    if (minState['panelMenu']) { restoreMinPanel('panelMenu'); return; }
    $('panelMenu').style.display = 'block';
  });
  $('menuClose').addEventListener('click', function () { $('panelMenu').style.display = 'none'; });
  $('charClose').addEventListener('click', function () { $('panelCharacter').style.display = 'none'; });
  $('welcomeClose').addEventListener('click', function () { $('panelWelcome').style.display = 'none'; });
  $('btnWelcomeGift').addEventListener('click', function () {
    var r = redeemGiftCode('TANTHU');
    if (r.ok) $('panelWelcome').style.display = 'none';
    else toast(r.msg || 'Chưa nhận được quà.');
  });
  $('giftBtn').addEventListener('click', function () {
    var inp = $('giftInput');
    var r = redeemGiftCode(inp ? inp.value : '');
    var gm = $('giftMsg');
    if (gm) { gm.textContent = r.msg || ''; gm.style.color = r.ok ? '#7ec850' : '#e57373'; }
    if (r.ok && inp) inp.value = '';
    renderCharacterPanel();
  });
  // Thẻ nhiệm vụ (20:22): bấm thẻ mở panel Nhiệm vụ; nút chỉ đường
  // là nút con — chặn nổi bọt.
  $('questTracker').addEventListener('click', function () {
    renderQuestPanel();
    $('panelQuests').style.display = 'block';
  });
  $('qtGuide').addEventListener('click', function (ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    toggleGuide();
  });
  $('liveTicker').addEventListener('click', function () { tickerClick(); });
  var btnSk = $('btnSkills');
  if (btnSk) btnSk.addEventListener('click', function () {
    renderSkillPanel();
    $('panelSkills').style.display = $('panelSkills').style.display === 'block' ? 'none' : 'block';
  });
  var skClose = $('skillClose');
  if (skClose) skClose.addEventListener('click', function () { $('panelSkills').style.display = 'none'; });
  // ---------- Boss yêu thú thế giới (js/bosses.js) ----------
  // Lịch hồi sinh theo GIỜ THẬT cố định; mốc chết lưu trong flags.bossKills
  // (save) nên offline quay lại trạng thái vẫn đúng.
  var bossAnnounced = {}; // bossId -> mốc hồi sinh đã thông báo (mỗi mốc 1 lần)
  var bossTick = 0, bossPanelOpen = false, bossBannerUntil = 0, bossAnnounceSeq = 0;
  function bossAnnounce(msg) {
    toast(msg);
    bossAnnounceSeq++; // mỗi thông báo là một sự kiện riêng (kể cả 2 tin trong cùng 1 mili-giây)
    bossBannerUntil = Date.now() + 6000; // đặt mốc TRƯỚC: khóa sự kiện của strip tính theo mốc này
    var b = $('bossBanner');
    if (b) { setStripText(b, msg); b.style.display = stripWanted('bossBanner') ? 'block' : 'none'; }
    if (SND) SND.sfx('kyngo');
  }
  function checkWorldBosses() {
    if (bossBannerUntil && Date.now() > bossBannerUntil) {
      bossBannerUntil = 0;
      var bb = $('bossBanner');
      if (bb) bb.style.display = 'none';
    }
    if (!BOS || !ch) return;
    var nowB = Date.now();
    BOS.list().forEach(function (def) {
      if (def.pending) return;
      var st = BOS.stateOf(def, flags, qs, nowB);
      if (st.mode !== 'world' || !st.available) return;
      if (st.respawnAt && bossAnnounced[def.id] !== st.respawnAt) {
        bossAnnounced[def.id] = st.respawnAt;
        bossAnnounce('Boss xuất hiện! ' + def.name + ' đã hiện hình tại ' + def.lairName + ' (' + (M.MAPS[def.mapId] ? M.MAPS[def.mapId].name : def.mapId) + ').');
      }
      if (def.mapId === curMapId && !monsters.some(function (mm) { return mm.worldBoss === def.id; })) {
        monsters.push(makeWorldBoss(def));
      }
    });
    if (bossPanelOpen) renderBossPanel();
  }
  function bossStatusHtml(def, st, nowB) {
    if (st.mode === 'pending') return '<span style="color:#888"><b>Chưa mở</b> — chờ map Thập Vạn Đại Sơn.</span>';
    if (st.mode === 'story') return '<span style="color:#a33"><b>Boss cốt truyện</b> — đối đầu trong nhiệm vụ chương 7 trước; hạ xong sẽ thành boss thế giới hồi sinh theo giờ.</span>';
    if (st.available) {
      var here = def.mapId === curMapId && monsters.some(function (mm) { return mm.worldBoss === def.id && mm.hp > 0; });
      return '<span style="color:#2e7d32"><b>Đang sống</b>' + (here ? ' — đang ở sào huyệt trên map này!' : ' — hãy tới sào huyệt: ' + def.lairName + '.') + '</span>';
    }
    return '<span style="color:#a33"><b>Đã bị hạ</b> — hồi sinh lúc <b>' + BOS.fmtClock(st.respawnAt) + '</b> (còn ' + BOS.fmtLeft(st.respawnAt - nowB) + ')</span>';
  }
  function renderBossPanel(focusId) {
    var box = $('bossList');
    if (!box || !BOS) return;
    var sum = $('bossSummary');
    var nowB = Date.now();
    if (sum) sum.innerHTML = '<p style="margin-top:0">Boss thế giới hồi sinh theo <b>giờ thật</b> cố định. Mỗi món trong bảng rơi lăn tỉ lệ <b>độc lập</b>. Chạm bia ở sào huyệt để xem đếm ngược của từng boss.</p>';
    box.innerHTML = '';
    BOS.list().forEach(function (def) {
      var st = BOS.stateOf(def, flags, qs, nowB);
      var row = document.createElement('div');
      row.className = 'boss-row';
      if (focusId && def.id === focusId) row.style.background = 'rgba(255,217,74,0.18)';
      var dropsHtml = BOS.dropDisplay(def).map(function (d) {
        var ydIcon = (YDART && YDART.has(d.id)) ? '<canvas data-yd="' + d.id + '" width="20" height="20" style="vertical-align:-5px;margin-right:4px"></canvas>' : '';
        if (!ydIcon && HART && HART.has(d.id)) ydIcon = '<canvas data-hb="' + d.id + '" width="20" height="20" style="vertical-align:-5px;margin-right:4px"></canvas>';
        return '<div class="boss-drop">' + ydIcon + '• ' + d.name + (d.sub ? ' <i>(' + d.sub + ')</i>' : '') + ' — <b>' + Math.round(d.chance * 100) + '%</b>' + (d.sig ? ' <b style="color:#c0392b">[KÝ DANH]</b>' : '') + '</div>';
      }).join('');
      // Dòng rơi BÍ TỊCH của hệ bí tịch (js/manuals.js, bảng riêng):
      // boss ký danh rơi sách của chính nó; vương thú/boss sâu là hồ hiếm.
      var manuInfo = (MANU && MANU.bossDropInfo) ? MANU.bossDropInfo(def.id) : null;
      var manuHtml = manuInfo ? manuInfo.names.map(function (nm) {
        return '<div class="boss-drop">• ' + nm + ' — <b>' + Math.round(manuInfo.chance * 100) + '%</b>' + (manuInfo.pool ? ' <i>(hồ bí tịch hiếm — 1 trong các quyển)</i>' : ' <b style="color:#7a4fd0">[BÍ TỊCH]</b>') + '</div>';
      }).join('') : '';
      row.innerHTML = '<b style="font-size:15px">' + def.name + '</b> · ' + (L.MONSTERS[def.type] ? L.MONSTERS[def.type].name : def.type) +
        ' · Máu ' + def.hp + ' · Tấn công ' + def.atk + ' · Thưởng ' + def.linhThach + ' Linh Thạch' +
        '<br>' + def.desc +
        '<br>Sào huyệt: ' + def.lairName + ' (' + (M.MAPS[def.mapId] ? M.MAPS[def.mapId].name : 'Thập Vạn Đại Sơn') + ')' +
        '<br>Lịch: ' + BOS.scheduleText(def) +
        '<br>Trạng thái: ' + bossStatusHtml(def, st, nowB) +
        '<br><b>Bảng rơi:</b>' + dropsHtml + manuHtml;
      box.appendChild(row);
      // Icon Yêu Đan ở dòng rơi: vẽ ảnh AI (Cao/Trung bình) hoặc lưới
      // pixel (Thấp) vào các canvas vừa gắn trong hàng.
      if (YDART && row.querySelectorAll) {
        try {
          var ycs = row.querySelectorAll('canvas[data-yd]');
          for (var yi = 0; yi < ycs.length; yi++)
            YDART.draw(ycs[yi].getContext('2d'), ycs[yi].getAttribute('data-yd'), 0, 0, 20, gfxLevel);
        } catch (e) {}
      }
      // Icon dược/đan/quyển đan phương ở dòng rơi: cùng cơ chế với Yêu Đan.
      if (HART && row.querySelectorAll) {
        try {
          var hcs = row.querySelectorAll('canvas[data-hb]');
          for (var hi = 0; hi < hcs.length; hi++)
            HART.draw(hcs[hi].getContext('2d'), hcs[hi].getAttribute('data-hb'), 0, 0, 20, gfxLevel);
        } catch (e) {}
      }
    });
  }
  function openBossPanel(focusId) {
    renderBossPanel(focusId);
    var p = $('panelBoss');
    if (p) p.style.display = 'block';
    bossPanelOpen = true;
  }
  var btnBoss = $('btnBoss');
  if (btnBoss) btnBoss.addEventListener('click', function () {
    var p = $('panelBoss');
    if (p && p.style.display === 'block') { p.style.display = 'none'; bossPanelOpen = false; }
    else openBossPanel();
  });
  var bossClose = $('bossClose');
  if (bossClose) bossClose.addEventListener('click', function () { $('panelBoss').style.display = 'none'; bossPanelOpen = false; });
  // ---------- Panel Đại Hội Tu Tiên (js/tournament.js) ----------
  var btnTournament = $('btnTournament');
  if (btnTournament) btnTournament.addEventListener('click', function () {
    var p = $('panelTournament');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openTournamentPanel();
  });
  var tournClose = $('tournClose');
  if (tournClose) tournClose.addEventListener('click', function () { $('panelTournament').style.display = 'none'; });
  // ---------- Panel Tủ Đồ (js/wardrobe.js) ----------
  var btnWardrobe = $('btnWardrobe');
  if (btnWardrobe) btnWardrobe.addEventListener('click', function () {
    var p = $('panelWardrobe');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openWardrobePanel();
  });
  var wardrobeClose = $('wardrobeClose');
  if (wardrobeClose) wardrobeClose.addEventListener('click', function () { $('panelWardrobe').style.display = 'none'; });
  // ---------- Panel Thú Triều Thủ Hộ Làng (js/beast-tide.js) ----------
  var btnBeastTide = $('btnBeastTide');
  if (btnBeastTide) btnBeastTide.addEventListener('click', function () {
    var p = $('panelBeastTide');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openBeastTidePanel();
  });
  // HỘ TỐNG: nút mở panel + nhận/bỏ chuyến (panel tự ẩn nút nhận khi
  // chưa đủ điều kiện — xem renderEscortPanel).
  var btnEscort = $('btnEscort');
  if (btnEscort) btnEscort.addEventListener('click', function () {
    var p = $('panelEscort');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openEscortPanel();
  });
  var escortClose = $('escortClose');
  if (escortClose) escortClose.addEventListener('click', function () { $('panelEscort').style.display = 'none'; });
  var btnEscortStart = $('btnEscortStart');
  if (btnEscortStart) btnEscortStart.addEventListener('click', function () {
    var r = startEscortRun();
    if (r.ok) $('panelEscort').style.display = 'none';
    else renderEscortPanel();
  });
  // ĐẤU GIÁ: nút mở panel + vào sàn/trả giá/chốt/bỏ qua (panel tự ẩn nút
  // không đủ điều kiện — xem renderAuctionPanel).
  var btnAuction = $('btnAuction');
  if (btnAuction) btnAuction.addEventListener('click', function () {
    var p = $('panelAuction');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openAuctionPanel();
  });
  var auctionClose = $('auctionClose');
  if (auctionClose) auctionClose.addEventListener('click', function () { $('panelAuction').style.display = 'none'; });
  var btnAuctionEnter = $('btnAuctionEnter');
  if (btnAuctionEnter) btnAuctionEnter.addEventListener('click', function () {
    var r = AUC ? AUC.startSession(flags, qs, ch, Date.now()) : { ok: false };
    if (r.ok) saveGame();
    renderAuctionPanel();
  });
  var btnAuctionBid = $('btnAuctionBid');
  if (btnAuctionBid) btnAuctionBid.addEventListener('click', function () {
    if (!AUC) return;
    var r = AUC.playerBid(flags, ch);
    if (r.ok) { if (SND) SND.sfx('auction_bid'); saveGame(); } // QA (e) 02:38 31/10: trả giá thành công phải có tiếng "ting" xác nhận
    renderAuctionPanel();
  });
  var btnAuctionCloseLot = $('btnAuctionCloseLot');
  if (btnAuctionCloseLot) btnAuctionCloseLot.addEventListener('click', function () {
    if (!AUC) return;
    var learned = (ALCH && ALCH.learnedList) ? ALCH.learnedList(ch) : [];
    var r = AUC.closeLot(flags, ch, { learned: learned });
    if (r.ok && r.grant) {
      var g = r.grant;
      if (g.kind === 'weapon' && W) W.addWeapon(ch, g.id);
      else if (g.kind === 'artifact' && ART) ART.addArtifact(ch, g.id);
      else if (g.kind === 'recipe' && ALCH) ALCH.teachRecipe(ch, g.id);
      else if (g.kind === 'manual') L.addItem(ch, g.id, 1);
      toast('Đấu giá thắng: ' + auctionLotName(AUC.lotOf(g.id)) + ' — ' + g.price + ' Linh Thạch!');
      if (SND) SND.sfx('auction_win'); // QA (e) 02:38 31/10: gõ búa thắng lô phải có chuông thắng — trước đây câm
      // THIÊN 4 ch.26: thắng 1 lô ở phiên = xong việc tranh mạch.
      if (THIEN4) { var aq = THIEN4.noteAuctionWin(qs); if (aq.questDone) toast('Nhiệm vụ chính đã xong: Phiên đấu giá tranh mạch — về gặp đại diện tông để trả.'); }
      updateHUD(); saveGame();
    }
    renderAuctionPanel();
  });
  var btnAuctionPass = $('btnAuctionPass');
  if (btnAuctionPass) btnAuctionPass.addEventListener('click', function () {
    if (!AUC) return;
    var r = AUC.passLot(flags);
    if (r.ok) saveGame();
    renderAuctionPanel();
  });
  // ĐỒNG HÀNH: nút mở panel + gọi lại/cho nghỉ (panel tự ẩn nút
  // không đủ điều kiện — xem renderCompanionPanel).
  var btnCompanion = $('btnCompanion');
  if (btnCompanion) btnCompanion.addEventListener('click', function () {
    var p = $('panelCompanion');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openCompanionPanel();
  });
  var compClose = $('companionClose');
  if (compClose) compClose.addEventListener('click', function () { $('panelCompanion').style.display = 'none'; });
  // Bảng mùa: nút thanh công cụ + nút đóng panel (js/season-board.js).
  var btnSeasonBoard = $('btnSeasonBoard');
  if (btnSeasonBoard) btnSeasonBoard.addEventListener('click', function () {
    var p = $('panelSeasonBoard');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openSeasonPanel();
  });
  var seasonClose = $('seasonClose');
  if (seasonClose) seasonClose.addEventListener('click', function () { $('panelSeasonBoard').style.display = 'none'; });
  // Bia Truyền Kỳ: nút thanh công cụ + nút đóng panel (js/legend-board.js).
  var btnLegend = $('btnLegend');
  if (btnLegend) btnLegend.addEventListener('click', function () {
    var p = $('panelLegend');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openLegendPanel();
  });
  var legendClose = $('legendClose');
  if (legendClose) legendClose.addEventListener('click', function () { $('panelLegend').style.display = 'none'; });
  // Minimap + Bản đồ thế giới: chạm minimap hoặc nút Menu đều mở panel.
  var btnWorldMap = $('btnWorldMap');
  if (btnWorldMap) btnWorldMap.addEventListener('click', function () {
    var p = $('panelWorldMap');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openWorldPanel();
  });
  var minimapWrap = $('minimapWrap');
  // Mục mobile-controls 31/10: chạm minimap khi panel Bản đồ đang mở
  // phải ĐÓNG lại được (trước đây chỉ mở — muốn đóng phải vòng qua nút
  // Menu hoặc nút ✕ nhỏ trong panel). Cùng mẫu toggle với btnWorldMap.
  if (minimapWrap) minimapWrap.addEventListener('click', function () {
    var p = $('panelWorldMap');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openWorldPanel();
  });
  var worldClose = $('worldClose');
  if (worldClose) worldClose.addEventListener('click', function () { $('panelWorldMap').style.display = 'none'; });
  var btnCompToggle = $('btnCompToggle');
  if (btnCompToggle) btnCompToggle.addEventListener('click', function () {
    if (!COMP) return;
    var st = COMP.ensure(flags);
    var r = COMP.setActive(flags, !st.active);
    if (r.ok) { syncCompEnt(true); saveGame(); }
    renderCompanionPanel();
  });
  // Hảo cảm: nút thanh công cụ + nút đóng panel (js/affinity.js).
  var btnAffinity = $('btnAffinity');
  if (btnAffinity) btnAffinity.addEventListener('click', function () {
    var p = $('panelAffinity');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openAffinityPanel();
  });
  var affinityClose = $('affinityClose');
  if (affinityClose) affinityClose.addEventListener('click', function () { $('panelAffinity').style.display = 'none'; });
  // TRẬN KỲ: nút mở panel + cắm/thu trận (panel tự ẩn nút không đủ
  // điều kiện — xem renderFormationPanel).
  var btnFormation = $('btnFormation');
  if (btnFormation) btnFormation.addEventListener('click', function () {
    var p = $('panelFormation');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openFormationPanel();
  });
  var formationClose = $('formationClose');
  if (formationClose) formationClose.addEventListener('click', function () { $('panelFormation').style.display = 'none'; });
  // THIÊN CƠ ĐỒ GIÁM: nút mở panel + đóng panel.
  var btnBestiary = $('btnBestiary');
  if (btnBestiary) btnBestiary.addEventListener('click', function () {
    var p = $('panelBestiary');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openBestiaryPanel();
  });
  var bestiaryClose = $('bestiaryClose');
  if (bestiaryClose) bestiaryClose.addEventListener('click', function () { $('panelBestiary').style.display = 'none'; });
  // CHỢ PHIÊN: nút mở panel + đóng panel.
  var btnFair = $('btnFair');
  if (btnFair) btnFair.addEventListener('click', function () {
    var p = $('panelFair');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openFairPanel();
  });
  var fairClose = $('fairClose');
  if (fairClose) fairClose.addEventListener('click', function () { $('panelFair').style.display = 'none'; });
  // SỰ KIỆN NGẪU NHIÊN: nút đóng panel sạp Thương Nhân Thần Bí.
  var wevShopClose = $('wevShopClose');
  if (wevShopClose) wevShopClose.addEventListener('click', closeWevShop);
  // THỦY TRIỀU THEO MÙA: nút mở panel + đóng panel.
  var btnTide = $('btnTide');
  if (btnTide) btnTide.addEventListener('click', function () {
    var p = $('panelTide');
    if (p && p.style.display === 'block') p.style.display = 'none';
    else openTidePanel();
  });
  var tideClose = $('tideClose');
  if (tideClose) tideClose.addEventListener('click', function () { $('panelTide').style.display = 'none'; });
  var btnFormTuKhi = $('btnFormTuKhi');
  if (btnFormTuKhi) btnFormTuKhi.addEventListener('click', function () { placeFormation('tu_khi'); });
  var btnFormHoThe = $('btnFormHoThe');
  if (btnFormHoThe) btnFormHoThe.addEventListener('click', function () { placeFormation('ho_the'); });
  var btnFormKhonThu = $('btnFormKhonThu');
  if (btnFormKhonThu) btnFormKhonThu.addEventListener('click', function () { placeFormation('khon_thu'); });
  var btnFormDissolve = $('btnFormDissolve');
  if (btnFormDissolve) btnFormDissolve.addEventListener('click', function () { dissolveFormation(); });
  var btnEscortForfeit = $('btnEscortForfeit');
  if (btnEscortForfeit) btnEscortForfeit.addEventListener('click', function () {
    onEscortFinish(ESC.forfeit(flags));
  });
  var tideClose = $('tideClose');
  if (tideClose) tideClose.addEventListener('click', function () { $('panelBeastTide').style.display = 'none'; });
  var btnTideJoin = $('btnTideJoin');
  if (btnTideJoin) btnTideJoin.addEventListener('click', function () {
    var r = startTideRun();
    if (r.ok) $('panelBeastTide').style.display = 'none';
    else renderBeastTidePanel();
  });
  var btnTideForfeit = $('btnTideForfeit');
  if (btnTideForfeit) btnTideForfeit.addEventListener('click', function () {
    if (!BT) return;
    onTideFinish(BT.forfeit(flags));
  });
  var btnTournRegister = $('btnTournRegister');
  if (btnTournRegister) btnTournRegister.addEventListener('click', function () {
    if (!TOURN) return;
    var sel = document.querySelector('input[name="tournBracket"]:checked');
    var bid = sel ? sel.value : 'luyen_khi';
    var r = TOURN.register(flags, ch, bid, Date.now());
    if (!r.ok) {
      var why = { closed: 'Hiện ngoài phiên Đại Hội — chờ phiên tới.', played: 'Kỳ này bạn đã đấu rồi.', inrun: 'Bạn đang giữa một kỳ Đại Hội khác.', low_tier: 'Bảng Luyện Khí cần đạt Luyện Khí tầng 3.', low_realm: 'Bảng Trúc Cơ chỉ dành cho tu sĩ đã đột phá Trúc Cơ.', bad_bracket: 'Bảng đấu không hợp lệ.' }[r.reason] || r.reason;
      toast('Không ghi danh được: ' + why);
    } else {
      toast('Đã ghi danh ' + TOURN.bracketById(bid).name + '! Trận đầu: ' + TOURN.roundNameOf(r.run) + ' gặp ' + TOURN.discipleLabel(TOURN.currentDisciple(r.run)) + ' — bấm "Vào trận" để lên Võ Đài Đại Hội.');
      if (SND) SND.sfx('quest_accept');
    }
    renderTournamentPanel(); updateHUD(); saveGame();
  });
  var btnTournFight = $('btnTournFight');
  if (btnTournFight) btnTournFight.addEventListener('click', function () {
    $('panelTournament').style.display = 'none';
    startTournMatch();
  });
  var btnTournForfeit = $('btnTournForfeit');
  if (btnTournForfeit) btnTournForfeit.addEventListener('click', function () {
    if (!TOURN) return;
    var st2 = TOURN.ensure(flags);
    if (st2 && st2.run) {
      // Đang có đối thủ trên võ đài thì dọn quái trước khi chốt bỏ cuộc.
      for (var i2 = monsters.length - 1; i2 >= 0; i2--) if (monsters[i2].tourn) monsters.splice(i2, 1);
      onTournMatchEnd(TOURN.forfeit(flags, ch.name), null);
      toast('Đã bỏ cuộc kỳ Đại Hội này.');
    }
    renderTournamentPanel();
  });
  // ---------- Bảng Tông Môn (arc chương 9-12) ----------
  // Khối CẤP BẬC ĐỆ TỬ + CỬA HÀNG TÔNG MÔN (Kho Tông) — dữ liệu/luật ở
  // js/sect-points.js (PNT_SECT); ở đây chỉ render + nút mua.
  function renderSectRankShop() {
    var rankBox = $('sectRank'), shopBox = $('sectShop');
    if (!rankBox || !shopBox) return;
    rankBox.innerHTML = ''; shopBox.innerHTML = '';
    if (!SECTP || !ch || !flags) return;
    var joined = SECT ? SECT.joinedSect(flags) : null;
    if (!joined) {
      rankBox.innerHTML = '<p style="margin:6px 0"><b>Điểm Cống Hiến:</b> bái nhập một tông môn để bắt đầu tích điểm từ việc tông, thăng cấp đệ tử (Ngoại Môn → Nội Môn → Chân Truyền → Hạch Tâm) và mở Kho Tông.</p>';
      return;
    }
    var rk = SECTP.rankOf(ch);
    var pctNext = rk.next ? Math.min(100, Math.floor(rk.total / rk.next.need * 100)) : 100;
    rankBox.innerHTML = '<div style="border:1px solid ' + joined.color + ';border-radius:6px;padding:8px;margin:8px 0">' +
      '<b>' + joined.name + '</b> — Cấp bậc đệ tử: <b>' + rk.name + '</b><br>' +
      'Điểm Cống Hiến: <b>' + rk.points + '</b> điểm (tổng tích luỹ ' + rk.total + ' — tiêu điểm không làm tụt cấp).<br>' +
      (rk.next
        ? 'Cấp kế: <b>' + rk.next.name + '</b> ở ' + rk.next.need + ' điểm tổng — còn thiếu ' + rk.next.missing + ' điểm. <span style="display:inline-block;vertical-align:middle;width:120px;height:8px;background:#ddd;border-radius:4px"><span style="display:block;height:8px;width:' + pctNext + '%;background:' + joined.color + ';border-radius:4px"></span></span>'
        : 'Đã đạt cấp đệ tử cao nhất của tông. Điểm dư dùng đổi đồ trong Kho Tông bên dưới.') +
      '</div>';
    var list = SECTP.shopList(ch, flags);
    if (!list.length) return;
    var head = document.createElement('div');
    head.innerHTML = '<b>Kho Tông — đổi Điểm Cống Hiến lấy đặc sản ' + joined.name + '</b>';
    shopBox.appendChild(head);
    list.forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'sect-row';
      var info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = '<b>' + e.name + '</b> ×' + e.n + ' — <b>' + e.price + ' điểm</b>' +
        (e.kind === 'rieng' ? ' <span style="color:#2e7d32">(đặc sản tông)</span>' : ' <span style="color:#666">(hàng chung)</span>') +
        '<br><span style="color:#555">' + e.desc + '</span>';
      row.appendChild(info);
      var bb = document.createElement('button');
      bb.textContent = 'Đổi (' + e.price + ' điểm)';
      bb.disabled = rk.points < e.price;
      bb.onclick = function () {
        var r = SECTP.buy(ch, flags, e.id);
        if (r.ok) {
          if (SND) SND.sfx('shop_buy');
          toast('Đã đổi ' + r.entry.name + ' ×' + r.entry.n + ' từ Kho Tông (−' + r.entry.price + ' điểm, còn ' + r.points + ' điểm).');
          updateHUD(); saveGame(); renderSectPanel();
        } else {
          toast(r.error || 'Chưa đổi được món này.');
        }
      };
      row.appendChild(bb);
      shopBox.appendChild(row);
    });
    // ----- TÀNG KINH CÁC: quầy bí tịch skill (js/manuals.js) -----
    // Tuyệt học của CHÍNH tông đã bái nhập (260 điểm, hàm Nội Môn) +
    // 2 quyển Linh phẩm chung (130 điểm). Đổi xong sách vào túi — mở
    // túi bấm Dùng để đọc và học chiêu (cổng cảnh giới theo phẩm).
    if (MANU) {
      var shelf = MANU.shelfList(ch, flags);
      if (shelf.length) {
        var tkcHead = document.createElement('div');
        tkcHead.innerHTML = '<b>Tàng Kinh Các — bí tịch của ' + joined.name + '</b><br><span style="color:#555">Sách là tri thức: quầy của tông chỉ bán cho đệ tử trong tông, nhưng sách nhặt được từ boss, bí cảnh hay đấu giá thì ai đủ cảnh giới cũng học được.</span>';
        shopBox.appendChild(tkcHead);
        shelf.forEach(function (e) {
          var srow = document.createElement('div');
          srow.className = 'sect-row';
          var sinfo = document.createElement('div');
          sinfo.style.flex = '1';
          sinfo.innerHTML = '<b>' + e.name + '</b> (' + e.gradeName + ' phẩm) — <b>' + e.price + ' điểm</b>' +
            (e.kind === 'tong' ? ' <span style="color:#2e7d32">(tuyệt học tông)</span>' : ' <span style="color:#666">(sách chung)</span>') +
            (e.learned ? ' <span style="color:#2e7d32"><b>Đã học chiêu này</b></span>' : (e.owned ? ' · đang có ' + e.owned + ' quyển trong túi' : '')) +
            '<br><span style="color:#555">' + e.desc + '</span>' +
            (e.locked ? '<br><span style="color:#a33"><b>' + e.lockText + '</b></span>' : '');
          srow.appendChild(sinfo);
          var sbb = document.createElement('button');
          sbb.textContent = 'Đổi bí tịch (' + e.price + ' điểm)';
          sbb.disabled = e.locked || rk.points < e.price;
          sbb.onclick = function () {
            var r = MANU.buyFromShelf(ch, flags, e.item);
            if (r.ok) {
              if (SND) SND.sfx('shop_buy');
              toast('Đã đổi ' + r.entry.name + ' từ Tàng Kinh Các (−' + r.entry.price + ' điểm, còn ' + r.points + ' điểm). Mở Túi đồ, bấm Dùng để đọc và học chiêu.');
              updateHUD(); saveGame(); renderSectPanel();
            } else {
              toast(r.error || 'Chưa đổi được bí tịch này.');
            }
          };
          srow.appendChild(sbb);
          shopBox.appendChild(srow);
        });
      }
    }
  }
  function renderSectPanel() {
    var box = $('sectList');
    if (!box || !SECT || !qs) return;
    var sum = $('sectSummary');
    var opened = SECT.unlockedList(qs).length;
    var joined = SECT.joinedSect(flags);
    if (sum) {
      sum.innerHTML = '<p style="margin-top:0">Đã mở <b>' + opened + '/10</b> tông môn.' +
        (joined ? ' Bạn đã bái nhập <b>' + joined.name + '</b> — các tông còn lại vẫn vào tham quan tự do.' :
          (SECT.canJoin(flags, qs) ? ' Lễ chọn tông đã sẵn sàng — hãy chọn một tông để bái nhập.' :
            ' Hoàn thành chuỗi nhiệm vụ Sơn Môn Đại Hội để mở hết các tông, làm lễ bái sư với Tạ Thanh Vân, rồi quay lại đây chọn tông.')) + '</p>';
    }
    box.innerHTML = '';
    SECT.SECTS.forEach(function (def) {
      var st = SECT.statusOf(flags, qs, def.id);
      var row = document.createElement('div');
      row.className = 'sect-row';
      var chip = document.createElement('span');
      chip.className = 'sect-chip';
      chip.style.background = def.color;
      chip.title = def.sigil;
      row.appendChild(chip);
      var info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = '<b>' + def.name + '</b> · ' + def.path + ' · Đại diện: ' + def.repName +
        '<br><i>“' + def.motto + '”</i><br>' + def.desc +
        '<br>Ấn ký: ' + def.sigil + '. ' +
        (st.state === 'joined' ? '<span style="color:#2e7d32"><b>' + st.text + '</b></span>' :
          st.state === 'open' ? '<span style="color:#2e7d32"><b>' + st.text + '</b></span>' :
            '<span style="color:#a33"><b>' + st.text + '</b></span>');
      row.appendChild(info);
      if (st.state === 'open' && !joined) {
        var jb = document.createElement('button');
        jb.textContent = SECT.canJoin(flags, qs) ? ('Bái nhập ' + def.name) : 'Bái nhập (chờ lễ chọn tông)';
        jb.disabled = !SECT.canJoin(flags, qs);
        jb.onclick = function () {
          var r = SECT.join(flags, qs, def.id);
          if (r.ok) {
            L.addItem(ch, r.token, 1);
            var dpMsg = '';
            if (DP) {
              DP.stampOwner(flags, DP.ownerKeyOf(currentAccount, ch));
              DP.ensure(flags);
              var gn = DP.takeGrantNotice(flags);
              if (gn) dpMsg = ' ' + def.repName + ' trao thêm Lệnh Bài Động Phủ: động phủ riêng của đệ tử ' + def.name + ' đã sẵn sàng sau cửa đá ở giếng cổ Thanh Khê.';
            }
            toast('Bạn đã bái nhập ' + def.name + '! Nhận ' + L.ITEMS[r.token].name + '.' + dpMsg);
            if (SND) SND.sfx('quest_complete'); // QA 15:16 30/10: lễ bái nhập tông là mốc cả đời — phải có tiếng, trước đây im lặng
            updateHUD(); saveGame(); renderSectPanel();
          } else {
            toast(r.error || 'Chưa thể bái nhập lúc này.');
          }
        };
        row.appendChild(jb);
      }
      box.appendChild(row);
    });
    renderSectRankShop();
  }
  var btnSect = $('btnSects');
  if (btnSect) btnSect.addEventListener('click', function () {
    renderSectPanel();
    $('panelSects').style.display = $('panelSects').style.display === 'block' ? 'none' : 'block';
  });
  var sectClose = $('sectClose');
  if (sectClose) sectClose.addEventListener('click', function () { $('panelSects').style.display = 'none'; });
  var btnPets = $('btnPets');
  if (btnPets) btnPets.addEventListener('click', openPetPanel);
  var petClose = $('petClose');
  if (petClose) petClose.addEventListener('click', function () { $('panelPets').style.display = 'none'; });
  var btnCapture = $('btnCapture');
  if (btnCapture) btnCapture.addEventListener('click', tryCaptureNearest);
  // ---------- Panel nhiệm vụ / túi đồ ----------
  // Tên người giao nhiệm vụ: 'sect_rep' (chuỗi ngự kiếm) = đại diện tông
  // NGƯỜI CHƠI ĐÃ BÁI NHẬP, không phải một NPC cố định.
  function questGiverName(q) {
    if (q.giver === 'sect_rep') return (FLIGHT && FLIGHT.giverName(flags)) || 'Đại diện tông môn';
    // Tên ĐẦY ĐỦ kèm chức danh/vai trò (lệnh Bui 21:52 30/10) — phân
    // giải đúng như npcDef (tên + title từ ST.NPCS / role trên map),
    // không để người chơi đoán "người này là ai" từ tên trơ.
    var home = npcHome(q.giver);
    if (home && home.npc) { var d = npcDef(home.npc); return d.role ? d.name + ' — ' + d.role : d.name; }
    var nd = S.NPC[q.giver];
    return nd ? nd.name + (nd.role ? ' — ' + nd.role : '') : q.giver;
  }
  // Mục mobile-controls 31/10: tên người giao KÈM TÊN MAP khi người đó
  // ở map khác map hiện tại — panel Nhiệm vụ trước đây chỉ ghi tên,
  // người chơi phải tự đoán người giao ở đâu (QA (c) 03:53). Chỉ dùng
  // cho dòng hiển thị trong panel; tracker/toast giữ questGiverName.
  function questGiverPlace(q) {
    var s = questGiverName(q);
    var home = q ? npcHome(q.giver) : null;
    if (home && home.mapId !== curMapId && M.MAPS[home.mapId]) s += ' — ở ' + M.MAPS[home.mapId].name;
    return s;
  }
  // Nhiệm vụ ĐANG KHÓA ở biên chuỗi hiện tại (lệnh Bui 21:43 30/10 —
  // CHỈ lớp hiển thị, tuyệt đối không đổi logic khóa/mở): Q hiện dạng
  // khóa khi nhiệm vụ tiền đề `requires` của nó đang ở biên (đang làm,
  // đang mở để nhận, hoặc là cổng module đang mở). Tên tiền đề lấy từ
  // dữ liệu thật L.QUESTS; tiền đề đã trả mà Q vẫn chưa mở = cổng khác
  // (module/cờ truyện) thì KHÔNG liệt kê bừa để tránh gợi ý sai.
  function lockedQuestList() {
    var avail = {};
    L.availableQuests(qs).forEach(function (q) { avail[q.id] = 1; });
    [FLIGHT, SECTARC, RIFT, THIEN4, THIEN5].forEach(function (mod) {
      if (mod && mod.availableQuestId) { var mid = mod.availableQuestId(ch, flags, qs); if (mid) avail[mid] = 1; }
    });
    var out = [];
    Object.keys(L.QUESTS).forEach(function (qid) {
      var q = L.QUESTS[qid];
      if (!q || !q.requires) return;
      if (q.sectQuest || q.tkcQuest || q.knQuest || q.tietQuest || q.sectArc || q.festQuest || q.riftArc || q.thien4 || q.thien5) return;
      if (qs.accepted[qid] || L.isTurnedIn(qs, qid) || avail[qid]) return;
      if (L.isTurnedIn(qs, q.requires)) return;
      if (qs.accepted[q.requires] || avail[q.requires]) out.push({ q: q, pre: L.QUESTS[q.requires] });
    });
    return out;
  }
  // Phần 9: lớp màu theo LOẠI nhiệm vụ (hệ màu chung ở index.html).
  function questKindClass(q) {
    if (!q) return 'q-side';
    if (q.main) return 'q-main';
    if (q.sectQuest || q.sectArc) return 'q-sect';
    if (q.festQuest || q.riftArc || q.thien4 || q.thien5 || q.tkcQuest || q.knQuest || q.tietQuest) return 'q-event';
    return 'q-side';
  }
  function renderQuestPanel() {
    var box = $('questList');
    if (!box) return;
    var html = '';
    // Mục mobile-controls 31/10: nhiệm vụ thẻ Mục tiêu ĐANG hiện (theo
    // ghim của người chơi hoặc tự chọn) để ghi chú ngay trong panel.
    var effT = trackedQuest();
    var effQid = effT ? effT.q.id : null;
    Object.keys(qs.accepted).forEach(function (qid) {
      var q = L.QUESTS[qid], st = qs.accepted[qid], ob = q.objectives[0];
      html += '<div class="qitem ' + questKindClass(q) + '"><b class="qn">' + q.title + '</b> ' + (st.done ? '(trả được — gặp ' + questGiverPlace(q) + ')' : '(đang làm)') +
        '<br>' + q.desc + '<br>Mục tiêu: ' + st.progress + '/' + ob.need +
        ' · Thưởng: ' + q.rewards.linhThach + ' Linh Thạch' +
        (q.rewards.items.length ? ', ' + q.rewards.items.map(function (it) { return L.ITEMS[it.id].name + ' x' + it.n; }).join(', ') : '') +
        (q.rewards.tuVi ? ', +' + q.rewards.tuVi + ' tu vi' : '') +
        '<br><button type="button" class="track-btn" data-trackq="' + qid + '">' +
        (qs.trackSel === qid ? '✔ Đang ghim theo dõi — bấm để bỏ ghim' : '◎ Theo dõi nhiệm vụ này') + '</button>' +
        (effQid === qid && qs.trackSel !== qid ? ' <span class="giver">(thẻ Mục tiêu đang hiện nhiệm vụ này)</span>' : '') + '</div>';
    });
    L.availableQuests(qs).forEach(function (q) {
      html += '<div class="qitem dim ' + questKindClass(q) + '"><b class="qn">' + q.title + '</b> (chưa nhận)<br>' + q.desc +
        '<br>Nhận tại: <span class="giver">' + questGiverPlace(q) + '</span></div>';
    });
    // Chuỗi ngự kiếm KHÔNG nằm trong availableQuests (cổng theo flags) —
    // hiện riêng như nhiệm vụ thường khi đã mở cổng Trúc Cơ + bái sư.
    if (FLIGHT) {
      var fq = FLIGHT.availableQuestId(ch, flags, qs);
      if (fq) {
        var fqDef = L.QUESTS[fq];
        html += '<div class="qitem dim"><b>' + fqDef.title + '</b> (chưa nhận — chuỗi Ngự Kiếm)<br>' + fqDef.desc +
          '<br>Nhận tại: ' + questGiverPlace(fqDef) + ' (' + ((FLIGHT.flavor(flags) || {}).art || 'Ngự Kiếm') + ')</div>';
      }
    }
    // Arc chương 13-20: biến thể theo tông cũng không nằm trong
    // availableQuests (cổng theo tông đã bái nhập + tiến trình truyện).
    if (SECTARC) {
      var aq = SECTARC.availableQuestId(ch, flags, qs);
      if (aq) {
        var aqDef = L.QUESTS[aq];
        html += '<div class="qitem dim"><b>' + aqDef.title + '</b> (chưa nhận — nhiệm vụ tông môn chương ' + aqDef.arcChapter + ')<br>' + aqDef.desc +
          '<br>Nhận tại: ' + questGiverPlace(aqDef) + '</div>';
      }
    }
    // Arc SỰ KIỆN VẾT NỨT HƯ KHÔNG: cũng ngoài availableQuests (cổng
    // Trúc Cơ + chương 18 + bái sư ở rift-events.js).
    if (RIFT) {
      var rq = RIFT.availableQuestId(ch, flags, qs);
      if (rq) {
        var rqDef = L.QUESTS[rq];
        html += '<div class="qitem dim"><b>' + rqDef.title + '</b> (chưa nhận — sự kiện Vết Nứt Hư Không)<br>' + rqDef.desc +
          '<br>Nhận tại: ' + questGiverPlace(rqDef) + '</div>';
      }
    }
    // THIÊN 4 ch.25-27: cũng ngoài availableQuests (cổng Trúc Cơ + arc
    // vết nứt + bái nhập ở js/thien4.js).
    if (THIEN4) {
      var tq2 = THIEN4.availableQuestId(ch, flags, qs);
      if (tq2) {
        var tqDef = L.QUESTS[tq2];
        html += '<div class="qitem dim"><b>' + tqDef.title + '</b> (chưa nhận — Thiên 4: Trúc Cơ Lập Nghiệp)<br>' + tqDef.desc +
          '<br>Nhận tại: ' + questGiverPlace(tqDef) + '</div>';
      }
    }
    // THIÊN 5 ch.28-30: cũng ngoài availableQuests (cổng Trúc Cơ + đã
    // xong Thiên 4 + bái nhập ở js/thien5.js).
    if (THIEN5) {
      var tq5p = THIEN5.availableQuestId(ch, flags, qs);
      if (tq5p) {
        var tq5Def = L.QUESTS[tq5p];
        html += '<div class="qitem dim"><b>' + tq5Def.title + '</b> (chưa nhận — Thiên 5: Kim Đan Phong Vân)<br>' + tq5Def.desc +
          '<br>Nhận tại: ' + questGiverPlace(tq5Def) + '</div>';
      }
    }
    // Nhiệm vụ ĐANG KHÓA (21:43): hiện mờ + dòng tiền đề rõ ràng, xếp
    // sau việc đang làm/đang mở và theo đúng thứ tự chuỗi dữ liệu.
    var lockedRows = lockedQuestList();
    if (lockedRows.length) {
      html += '<div class="menu-sec">Đang khóa — hoàn thành nhiệm vụ trước để mở</div>';
      lockedRows.forEach(function (lk) {
        html += '<div class="qitem dim lock ' + questKindClass(lk.q) + '"><b class="qn">' + lk.q.title + '</b> (đang khóa)<br>' + lk.q.desc +
          '<br><span class="lockline">Hoàn thành «' + (lk.pre ? lk.pre.title : lk.q.requires) + '» để mở</span>' +
          '<br>Nhận tại: <span class="giver">' + questGiverPlace(lk.q) + '</span></div>';
      });
    }
    qs.turnedIn.forEach(function (qid) {
      html += '<div class="qitem dim"><b>' + L.QUESTS[qid].title + '</b> (đã xong)</div>';
    });
    box.innerHTML = html || '<div>Chưa có nhiệm vụ.</div>';
    // Mục mobile-controls 31/10: ghim/bỏ ghim nhiệm vụ theo dõi — thẻ
    // Mục tiêu + Chỉ đường đi theo ngay, lựa chọn lưu cùng save.
    if (box.querySelectorAll) box.querySelectorAll('[data-trackq]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-trackq');
        qs.trackSel = (qs.trackSel === id) ? null : id;
        saveGame();
        trackerTickLast = 0;
        tickTracker();
        renderQuestPanel();
      });
    });
  }
  $('btnQuests').addEventListener('click', function () {
    renderQuestPanel();
    $('panelQuests').style.display = $('panelQuests').style.display === 'block' ? 'none' : 'block';
  });
  $('questClose').addEventListener('click', function () { $('panelQuests').style.display = 'none'; });
  // Dòng tóm tắt pháp bảo trong panel nhân vật: món đang đeo ở 2 ô riêng +
  // tổng hiệu ứng hỗ trợ (rơi đồ, tu vi, giảm sát thương...) từ artifacts.
  function artInfoHtml() {
    var names = [];
    for (var s = 0; s < 2; s++) {
      var d = ART.equippedDefAt(ch, s);
      names.push(d ? d.name : '(trống)');
    }
    var fx = ART.describeStats(ch);
    return '<br>Pháp bảo: <b>' + names[0] + '</b> · <b>' + names[1] + '</b>' +
      (fx.length ? '<br>Hiệu ứng pháp bảo: ' + fx.join(' · ') : '') +
      '<br>Mua/chế tạo pháp bảo tại nhà đại phu Lý lão. Pháp bảo đang đeo bay quanh người và tự phát huy hiệu ứng.';
  }
  function renderInventory() {
    var grid = $('invGrid');
    grid.innerHTML = '';
    if (W) W.ensureWeapons(ch);
    if (ART) ART.ensureArtifacts(ch);
    if (GR) GR.ensureGear(ch);
    var info = $('invInfo');
    if (info) {
      var eqDef = W ? W.equippedDef(ch) : null;
      // Panel nhân vật: tổng chỉ số SAU trang bị (Logic.statTotals cộng vũ
      // khí + pháp khí) để người chơi thấy sức mạnh thật của mình.
      var tot = L.statTotals ? L.statTotals(ch) : null;
      var totTxt = '';
      if (tot) {
        var parts = ['Máu tối đa <b>' + (L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp) + '</b>',
          'Giáp <b>' + (L.effDef ? L.effDef(ch) : ch.def) + '</b>'];
        if (tot.critCh) parts.push('Chí mạng <b>' + tot.critCh + '%</b> (x' + tot.critDmgTotal + '%)');
        if (tot.lifesteal) parts.push('Hút máu <b>' + tot.lifesteal + '%</b>');
        if (tot.speed) parts.push('Tốc độ <b>+' + tot.speed + '%</b>');
        if (SK) parts.push('Linh lực <b>' + SK.maxLinhLuc(ch) + '</b>');
        Object.keys(tot.elem).forEach(function (e) {
          parts.push('Hệ ' + (W && W.ELEM_NAMES[e] ? W.ELEM_NAMES[e] : e) + ' <b>+' + tot.elem[e] + '%</b>');
        });
        totTxt = '<br>Chỉ số tổng: ' + parts.join(' · ');
      }
      info.innerHTML = 'Công hiện tại: <b>' + L.effAtk(ch) + '</b>' +
        (eqDef ? ' — đang cầm: <b>' + eqDef.name + '</b> (+' + eqDef.atk + ' công)' : ' — đang tay không') +
        totTxt +
        (ART ? artInfoHtml() : '') +
        '<br>Bấm vào vũ khí/pháp bảo/trang bị để mở panel So sánh (đeo/tháo/khoá tại đó). Bán, cường hoá và tẩy luyện vũ khí tại lò rèn của Thiết Cường; đồ phòng thân ở Lò rèn, trang sức ở Tiệm pháp khí của Lý lão.';
    }
    var nSlots = Math.max(20 + (ART ? ART.totalStats(ch).invBonus : 0), ch.inventory.length);
    for (var i = 0; i < nSlots; i++) {
      var slot = document.createElement('div');
      slot.className = 'slot';
      var it = ch.inventory[i];
      if (it && GR && GR.isGearEntry(it)) {
        // Ô trang bị đeo (GĐ2): icon theo loại/phẩm, huy hiệu = ô đang
        // đeo (nếu có) hoặc tên ô; bấm mở panel So sánh của chính ô đó.
        var gDef = GR.GEAR[it.id];
        var gCv = document.createElement('canvas');
        gCv.width = 32; gCv.height = 32;
        GR.drawIcon(gCv.getContext('2d'), gDef, 0, 0, 2);
        slot.appendChild(gCv);
        var gSlot = GR.slotOf(ch, it.uid);
        var gBadge = document.createElement('span');
        gBadge.className = 'badge';
        gBadge.textContent = gSlot ? (gSlot.slot === 'nhan' ? 'Nhẫn ' + (gSlot.ring + 1) : GR.SLOTS[gDef.slot].name) : GR.SLOTS[gDef.slot].name;
        if (gSlot) gBadge.style.background = '#6a1b9a';
        slot.appendChild(gBadge);
        (function (entry, def, sl) {
          var lines = GR.statLines(def, ch);
          slot.title = def.name + ' — ' + GR.SLOTS[def.slot].name + ', ' + GR.GRADES[def.grade].name +
            (def.reqTier > 0 ? ', cần Luyện Khí tầng ' + def.reqTier : '') +
            (def.reqRealm > 0 ? ', cần cảnh giới ' + GR.realmName(def.reqRealm) : '') +
            (lines.length ? '\n' + lines.join('\n') : '') +
            (sl ? '\n(đang đeo)' : '\nSo với món đang đeo cùng ô:\n' + GR.compareLines(ch, def).join('\n')) +
            '\n' + def.desc + '\n(bấm để mở panel So sánh — đeo/tháo tại đó)';
          slot.onclick = function () { openCompare('gear', entry.uid); };
        })(it, gDef, gSlot);
      } else if (it && ART && ART.isArtifactEntry(it)) {
        // Ô pháp bảo: icon riêng, huy hiệu = ô pháp bảo đang đeo (nếu có).
        var aDef = ART.ARTIFACTS[it.id];
        var aCv = document.createElement('canvas');
        aCv.width = 32; aCv.height = 32;
        ART.drawIconArt(aCv.getContext('2d'), aDef, 0, 0, 32, gfxLevel);
        slot.appendChild(aCv);
        var aSlot = ART.slotOf(ch, it.uid);
        var aBadge = document.createElement('span');
        aBadge.className = 'badge';
        aBadge.textContent = aSlot >= 0 ? 'Pháp bảo ' + (aSlot + 1) : ART.KINDS[aDef.kind].name;
        if (aSlot >= 0) aBadge.style.background = '#6a1b9a';
        slot.appendChild(aBadge);
        (function (entry, def, sl) {
          var lines = ART.statLines(def);
          slot.title = def.name + ' — ' + ART.KINDS[def.kind].name + ', ' + ART.GRADES[def.grade].name +
            (def.reqTier > 0 ? ', cần Luyện Khí tầng ' + def.reqTier : '') +
            '\n' + def.fxText +
            (lines.length ? '\n' + lines.join('\n') : '') +
            (def.signature ? '\nKý danh — ' + def.signature.name : '') +
            (def.active ? '\nKích hoạt: ' + def.active.name + ' (phím 6/7 khi đang đeo, tốn ' + def.active.mana + ' linh lực)' : '') +
            (sl >= 0 ? '\n(đang đeo ở ô pháp bảo ' + (sl + 1) + ')' : '\n(chưa đeo)') +
            '\n' + def.desc + '\n(bấm để mở panel So sánh — đeo/tháo tại đó)';
          slot.onclick = function () { openCompare('artifact', entry.uid); };
        })(it, aDef, aSlot);
      } else if (it && W && W.isWeaponEntry(it)) {
        // Ô vũ khí: icon riêng theo loại/phẩm, huy hiệu là trạng thái đeo.
        var wDef = W.WEAPONS[it.id];
        var wCv = document.createElement('canvas');
        wCv.width = 32; wCv.height = 32;
        W.drawIcon(wCv.getContext('2d'), wDef, 0, 0, 2);
        slot.appendChild(wCv);
        var equipped = ch.equipUid === it.uid;
        var wBadge = document.createElement('span');
        wBadge.className = 'badge';
        wBadge.textContent = equipped ? 'Đang đeo' : '+' + wDef.atk;
        if (equipped) wBadge.style.background = '#2e7d32';
        slot.appendChild(wBadge);
        (function (entry, def, isEq) {
          slot.title = def.name + ' — ' + W.TYPES[def.type].name + ', ' + W.GRADES[def.grade].name +
            (def.reqTier > 0 ? ', cần Luyện Khí tầng ' + def.reqTier : '') +
            '\n' + W.statLines(def).join('\n') +
            (isEq ? '\n(đang đeo)' :
              '\nSo với vũ khí đang đeo:\n' + W.compareLines(ch, def).join('\n')) +
            '\n' + def.desc + '\n(bấm để mở panel So sánh — đeo/khoá tại đó)';
          slot.onclick = function () { openCompare('weapon', entry.uid); };
        })(it, wDef, equipped);
      } else if (it) {
        var cv = document.createElement('canvas');
        cv.width = 32; cv.height = 32;
        var c2 = cv.getContext('2d');
        // Yêu Đan có ảnh AI riêng (js/yeu-dan-ai.js): Cao/Trung bình vẽ
        // ảnh AI, Thấp (hoặc chưa nạp xong) tự rơi về lưới pixel 8x8.
        // Linh dược/hạt/đan/quyển đan phương có bộ AI riêng
        // (js/herb-icons-ai.js) — cùng cơ chế rơi về lưới pixel.
        if (YDART && YDART.has(it.id)) YDART.draw(c2, it.id, 0, 0, 32, gfxLevel);
        else if (MART && MART.has(it.id)) MART.draw(c2, it.id, 0, 0, 32, gfxLevel);
        else if (HART && HART.has(it.id)) HART.draw(c2, it.id, 0, 0, 32, gfxLevel);
        else if (TALART && TALART.has(it.id)) TALART.draw(c2, it.id, 0, 0, 32, 32);
        else if (OGART && OGART.has(it.id)) OGART.draw(c2, it.id, 0, 0, 32, gfxLevel);
        else if (QART && QART.has(it.id)) QART.draw(c2, it.id, 0, 0, 32, gfxLevel);
        else S.drawGridToCanvas(c2, S.ITEM_ICONS[it.id], 0, 0, 4);
        slot.appendChild(cv);
        var badge = document.createElement('span');
        badge.className = 'badge'; badge.textContent = it.count;
        slot.appendChild(badge);
        (function (itemId) {
          // Vat dau an nguon goc (heal 0, khong dung duoc): tooltip khong
          // duoc hua "bam de dung" nhu do dung duoc — bam vao chi hien
          // toast "khong dung truc tiep duoc" (QA-A 18:01 30/10).
          var isOriginToken = !!(OG && OG.DEFS && OG.DEFS.some(function (d) { return d.token === itemId; }));
          slot.title = L.ITEMS[itemId].name + ' — ' + L.ITEMS[itemId].desc + (isOriginToken ? ' (vật cốt truyện — không dùng trực tiếp được)' : ' (bấm để dùng)');
          slot.onclick = function () {
            // PHÙ CHÚ (js/talismans.js): phải dùng qua ngữ cảnh thế giới
            // thật (quái quanh/map/kiếp) — không qua L.useItem (thiếu ctx
            // sẽ làm Truyền Tống/Thế Lôi chạy sai luật cấm).
            if (TAL && TAL.isTalisman(itemId)) { useTalismanItem(itemId); return; }
            if (TAL && L.ITEMS[itemId] && L.ITEMS[itemId].talismanScroll) {
              var sr = TAL.useRecipeScroll(ch, itemId);
              toast(sr.msg || 'Đọc phù phương.');
              if (sr.ok && SND) SND.sfx('use_item');
              updateHUD(); saveGame(); renderInventory(); return;
            }
            // VẾT NỨT HƯ KHÔNG: đan hồi HP dưới Địa phẩm bị linh khí hư
            // không thiêu rụi dược lực — chặn ngay, không tiêu hao.
            if (RIFT) {
              var pBlock = RIFT.pillBlockReason(flags, itemId);
              if (pBlock) { toast(pBlock); return; }
            }
            var r = L.useItem(ch, itemId);
            if (r.ok) { if (SND) SND.sfx('use_item'); toast(r.pill && r.msg ? r.msg : 'Dùng ' + L.ITEMS[itemId].name + ', hồi ' + r.healed + ' Máu.'); updateHUD(); saveGame(); renderInventory(); }
            else toast(r.pill && r.msg ? r.msg : 'Vật phẩm này không dùng trực tiếp được.');
          };
        })(it.id);
      }
      grid.appendChild(slot);
    }
  }
  $('btnInv').addEventListener('click', function () {
    renderInventory();
    $('panelInv').style.display = $('panelInv').style.display === 'block' ? 'none' : 'block';
  });
  $('invClose').addEventListener('click', function () { $('panelInv').style.display = 'none'; });
  // ---------- Lò rèn Thiết Cường: mua / chế tạo / thu mua vũ khí ----------
  function renderShop() {
    var box = $('shopList');
    if (!box || !W) return;
    W.ensureWeapons(ch);
    box.innerHTML = '';
    function head(t) {
      var h = document.createElement('h4');
      h.style.margin = '10px 0 4px'; h.textContent = t;
      box.appendChild(h);
    }
    function row(def, html, btnText, disabled, fn) {
      var r = document.createElement('div');
      r.className = 'shop-row';
      if (def) {
        var cv = document.createElement('canvas');
        cv.width = 32; cv.height = 32;
        W.drawIcon(cv.getContext('2d'), def, 0, 0, 2);
        r.appendChild(cv);
      }
      var info = document.createElement('div');
      info.style.flex = '1'; info.innerHTML = html;
      r.appendChild(info);
      var b = document.createElement('button');
      b.textContent = btnText; b.disabled = !!disabled; b.onclick = fn;
      r.appendChild(b);
      box.appendChild(r);
    }
    // Dòng chỉ số phụ + hiệu ứng riêng (chỉ phẩm Huyền trở lên mới có).
    function statSuffix(def) {
      var lines = W.statLines(def).slice(1);
      return lines.length ? '<br>' + lines.join(' · ') : '';
    }
    head('Mua vũ khí — bạn có ' + ch.linhThach + ' Linh Thạch');
    W.SHOP.forEach(function (id) {
      var def = W.WEAPONS[id];
      // Hảo cảm với Thiết Cường giảm giá Lò rèn: 40 điểm −5%, 70 điểm −10%.
      var affPctW = (AFF ? AFF.discountPct('tho_ren', flags) : 0);
      var affPriceW = (AFF ? AFF.discountPrice('tho_ren', flags, def.price) : def.price);
      row(def, '<b>' + def.name + '</b> · ' + W.GRADES[def.grade].name + ' · Tấn công +' + def.atk +
        (def.reqTier ? ' · Cần Luyện Khí tầng ' + def.reqTier + ' để đeo' : '') + statSuffix(def) + '<br>Giá: ' + affPriceW + ' Linh Thạch' +
        (affPctW ? ' (giảm ' + affPctW + '% nhờ hảo cảm với Thiết Cường)' : ''),
        'Mua', ch.linhThach < affPriceW, function () {
          var r = W.buyWeapon(ch, id, affPriceW);
          if (r.ok && SND) SND.sfx('shop_buy');
          toast(r.ok ? 'Đã mua ' + def.name + '. Mở Túi đồ để đeo.' : 'Không đủ Linh Thạch!');
          updateHUD(); saveGame(); renderShop();
        });
    });
    head('Chế tạo — đưa nguyên liệu, Thiết Cường rèn cho');
    Object.keys(W.RECIPES).forEach(function (id) {
      var def = W.WEAPONS[id], rec = W.RECIPES[id];
      var mats = Object.keys(rec.mats).map(function (mid) {
        return L.ITEMS[mid].name + ' ' + W.itemCount(ch, mid) + '/' + rec.mats[mid];
      }).join(', ');
      row(def, '<b>' + def.name + '</b> · ' + W.GRADES[def.grade].name + ' · Tấn công +' + def.atk +
        (def.reqTier ? ' · Cần Luyện Khí tầng ' + def.reqTier + ' để đeo' : '') + statSuffix(def) +
        '<br>Nguyên liệu: ' + mats + ' · Tấn công rèn: ' + rec.fee + ' Linh Thạch',
        'Rèn', !W.canCraft(ch, id).ok, function () {
          var r = W.craft(ch, id);
          if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Thiết Cường đã rèn xong ' + def.name + '!'); }
          updateHUD(); saveGame(); renderShop();
        });
    });
    head('Thu mua — bán vũ khí của bạn cho thợ rèn');
    var owned = W.weaponEntries(ch);
    if (!owned.length) {
      var p = document.createElement('div');
      p.textContent = 'Bạn chưa có vũ khí nào.';
      box.appendChild(p);
    }
    owned.forEach(function (e) {
      var def = W.WEAPONS[e.id];
      var isEq = ch.equipUid === e.uid;
      row(def, '<b>' + def.name + '</b>' + ((e.enh || 0) > 0 ? ' <b>+' + e.enh + '</b>' : '') + ' · ' + W.GRADES[def.grade].name + ' · Tấn công +' + W.entryAtk(e) +
        (isEq ? ' · <b>Đang đeo</b> (bán sẽ tự tháo ra trước)' : '') + statSuffix(def) +
        (e.locked ? '<br><b style="color:#b8860b">Đang KHOÁ — thợ rèn không thu mua món đã khoá.</b>' : '<br>Thợ rèn mua lại: ' + def.value + ' Linh Thạch'),
        e.locked ? 'Đã khoá' : 'Bán +' + def.value + ' Linh Thạch', !!e.locked, function () {
          var r = W.sellWeapon(ch, e.uid);
          if (r.ok) { if (SND) SND.sfx('shop_sell'); toast('Đã bán ' + def.name + ', +' + r.gained + ' Linh Thạch.'); }
          else if (r.reason === 'locked') toast(def.name + ' đang khoá — mở khoá trong panel So sánh (bấm món trong Túi đồ) rồi mới bán được.');
          updateHUD(); saveGame(); renderShop();
        });
    });
    // CƯỜNG HOÁ (20:26): rèn tại đây; số liệu docs/economy.md.
    head('Cường hoá vũ khí — bạn có ' + ch.linhThach + ' Linh Thạch, ' + W.itemCount(ch, 'tinh_van_thach') + ' Tinh Vẫn Thạch');
    W.weaponEntries(ch).forEach(function (e) {
      var def = W.WEAPONS[e.id];
      var cur = e.enh || 0;
      if (cur >= W.ENH.MAX) {
        row(def, '<b>' + def.name + '</b> <b>+' + cur + '</b> · Tấn công hiệu dụng ' + W.entryAtk(e) + '<br>Đã đạt trần cường hoá +10.', 'Trần +10', true, function () {});
        return;
      }
      var cNext = W.enhCost(def, cur + 1);
      var failPct = Math.round(W.enhFailRate(cur + 1) * 100);
      var htmlE = '<b>' + def.name + '</b> <b>+' + cur + '</b> · Tấn công hiệu dụng ' + W.entryAtk(e) +
        '<br>Nâng lên <b>+' + (cur + 1) + '</b>: ' + cNext.lt + ' Linh Thạch' + (cNext.mats ? ' + ' + cNext.mats + ' Tinh Vẫn Thạch' : '') +
        (failPct ? ' · Tỉ lệ thất bại ' + failPct + '% (thất bại chỉ mất phí, không tụt cấp)' : ' · Chắc chắn thành công') +
        (e.locked ? '<br><b style="color:#b8860b">Đang KHOÁ — không cường hoá được.</b>' : '');
      row(def, htmlE, 'Cường hoá', !!e.locked, function () {
        var r = W.tryEnhance(ch, e.uid);
        if (!r.ok) toast(r.reason === 'lt' ? 'Không đủ Linh Thạch.' : (r.reason === 'mat' ? 'Thiếu Tinh Vẫn Thạch.' : (r.reason === 'locked' ? 'Món đang khoá.' : 'Không cường hoá được.')));
        else if (r.success) { if (SND) SND.sfx('breakthrough'); toast(def.name + ' đã lên +' + r.enh + '!'); }
        else toast('Cường hoá THẤT BẠI — mất phí lần này, món giữ nguyên +' + r.enh + '.');
        updateHUD(); saveGame(); renderShop();
      });
      row(def, 'Cường hoá liên tiếp: rèn liền tay tới khi thất bại, đạt trần hoặc hết tiền/nguyên liệu.', 'Liên tiếp', !!e.locked, function () {
        var tries = 0, lastOk = 0, stopWhy = '';
        while (tries < 10) {
          var rr = W.tryEnhance(ch, e.uid);
          if (!rr.ok) { stopWhy = rr.reason === 'lt' ? 'hết Linh Thạch' : (rr.reason === 'mat' ? 'hết Tinh Vẫn Thạch' : (rr.reason === 'max' ? 'đạt trần +10' : 'bị chặn')); break; }
          tries++;
          if (!rr.success) { stopWhy = 'thất bại ở lần ' + tries; break; }
          lastOk = rr.enh;
          if (rr.enh >= W.ENH.MAX) { stopWhy = 'đạt trần +10'; break; }
        }
        if (SND && lastOk) SND.sfx('breakthrough');
        toast('Cường hoá liên tiếp: ' + tries + ' lần thử' + (lastOk ? ', lên +' + lastOk : '') + (stopWhy ? ' — dừng vì ' + stopWhy + '.' : '.'));
        updateHUD(); saveGame(); renderShop();
      });
    });
    // TẨY LUYỆN (20:26): Huyền phẩm+, xem TRƯỚC/SAU rồi chọn.
    head('Tẩy luyện chỉ số phụ — chỉ Huyền phẩm trở lên · ' + W.REFINE.COST_LT + ' Linh Thạch + 1 Tinh Vẫn Thạch mỗi lần lăn');
    W.weaponEntries(ch).forEach(function (e) {
      var def = W.WEAPONS[e.id];
      if ((W.GRADES[def.grade] ? W.GRADES[def.grade].rank : 0) < W.REFINE.MIN_GRADE_RANK) return;
      if (e.subsPending) {
        row(def, '<b>' + def.name + '</b><br>Đang có bản lăn chờ chọn:<br>TRƯỚC: ' + (subsText(e.subs) || '(chưa có dòng phụ)') + '<br>SAU: ' + subsText(e.subsPending),
          'Giữ cũ', false, function () {
            W.applyRefine(ch, e.uid, false);
            toast('Đã giữ dòng phụ cũ của ' + def.name + '.');
            updateHUD(); saveGame(); renderShop();
          });
        row(def, 'Lấy bản lăn mới ở trên thay cho dòng phụ hiện tại.', 'Lấy mới', false, function () {
          W.applyRefine(ch, e.uid, true);
          toast(def.name + ' đã mang dòng phụ mới.');
          updateHUD(); saveGame(); renderShop();
        });
        return;
      }
      row(def, '<b>' + def.name + '</b>' + ((e.enh || 0) > 0 ? ' <b>+' + e.enh + '</b>' : '') +
        '<br>Dòng phụ hiện tại: ' + (subsText(e.subs) || '(chưa có — lăn lần đầu)') +
        (e.locked ? '<br><b style="color:#b8860b">Đang KHOÁ — không tẩy luyện được.</b>' : ''),
        'Tẩy luyện', !!e.locked, function () {
          var r = W.tryRefine(ch, e.uid);
          if (!r.ok) toast(r.reason === 'lt' ? 'Không đủ Linh Thạch.' : (r.reason === 'mat' ? 'Thiếu Tinh Vẫn Thạch.' : (r.reason === 'locked' ? 'Món đang khoá.' : 'Không tẩy luyện được.')));
          else toast('Đã lăn xong — xem TRƯỚC/SAU bên dưới rồi chọn Giữ cũ hoặc Lấy mới.');
          updateHUD(); saveGame(); renderShop();
        });
    });
    renderGearForgeSections(box, head);
  }
  // ----- Trang bị đeo ở Lò rèn (js/gear.js, GĐ2): đồ PHÒNG THÂN -----
  function renderGearForgeSections(box, head) {
    if (!GR) return;
    GR.ensureGear(ch);
    function rowG(def, html, btnText, disabled, fn) {
      var r = document.createElement('div');
      r.className = 'shop-row';
      var cv = document.createElement('canvas');
      cv.width = 32; cv.height = 32;
      GR.drawIcon(cv.getContext('2d'), def, 0, 0, 2);
      r.appendChild(cv);
      var info = document.createElement('div');
      info.style.flex = '1'; info.innerHTML = html;
      r.appendChild(info);
      var b = document.createElement('button');
      b.textContent = btnText; b.disabled = !!disabled; b.onclick = fn;
      r.appendChild(b);
      box.appendChild(r);
    }
    function gSuffix(def) {
      var lines = GR.statLines(def, ch);
      var s = lines.length ? '<br>' + lines.join(' · ') : '';
      if (def.reqRealm > 0) s += '<br>Cần cảnh giới ' + GR.realmName(def.reqRealm) + ' để đeo';
      else if (def.reqTier > 0) s += ' · Cần Luyện Khí tầng ' + def.reqTier + ' để đeo';
      return s;
    }
    var affPctG = (AFF ? AFF.discountPct('tho_ren', flags) : 0);
    head('Mua đồ phòng thân — mũ, giáp, choàng, đai, bao tay, giày');
    GR.SHOP_FORGE.forEach(function (id) {
      var def = GR.GEAR[id];
      var affPriceG = (AFF ? AFF.discountPrice('tho_ren', flags, def.price) : def.price);
      rowG(def, '<b>' + def.name + '</b> · ' + GR.SLOTS[def.slot].name + ' · ' + GR.GRADES[def.grade].name + gSuffix(def) +
        '<br>Giá: ' + affPriceG + ' Linh Thạch' + (affPctG ? ' (giảm ' + affPctG + '% nhờ hảo cảm với Thiết Cường)' : ''),
        'Mua', ch.linhThach < affPriceG, function () {
          var r = GR.buyGear(ch, id, affPriceG);
          if (r.ok && SND) SND.sfx('shop_buy');
          toast(r.ok ? 'Đã mua ' + def.name + '. Mở Túi đồ để đeo.' : 'Không đủ Linh Thạch!');
          updateHUD(); saveGame(); renderShop();
        });
    });
    head('Chế tạo đồ phòng thân — Thiết Cường rèn kèm');
    Object.keys(GR.RECIPES).forEach(function (id) {
      var def = GR.GEAR[id], rec = GR.RECIPES[id];
      var mats = Object.keys(rec.mats).map(function (mid) {
        return (L.ITEMS[mid] ? L.ITEMS[mid].name : mid) + ' ' + GR.itemCount(ch, mid) + '/' + rec.mats[mid];
      }).join(', ');
      rowG(def, '<b>' + def.name + '</b> · ' + GR.SLOTS[def.slot].name + ' · ' + GR.GRADES[def.grade].name + gSuffix(def) +
        '<br>Nguyên liệu: ' + mats + ' · Công rèn: ' + rec.fee + ' Linh Thạch',
        'Rèn', !GR.canCraft(ch, id).ok, function () {
          var r = GR.craft(ch, id);
          if (r.ok) { if (SND) SND.sfx('shop_buy'); toast('Thiết Cường đã rèn xong ' + def.name + '!'); }
          updateHUD(); saveGame(); renderShop();
        });
    });
    var ownedG = GR.gearEntries(ch).filter(function (e) { return GR.SLOTS[GR.GEAR[e.id].slot].group === 'phongthan'; });
    if (ownedG.length) {
      head('Thu mua đồ phòng thân của bạn');
      ownedG.forEach(function (e) {
        var def = GR.GEAR[e.id];
        var sl = GR.slotOf(ch, e.uid);
        rowG(def, '<b>' + def.name + '</b> · ' + GR.SLOTS[def.slot].name + ' · ' + GR.GRADES[def.grade].name + gSuffix(def) +
          (sl ? '<br><i>Đang đeo — bán sẽ tự tháo ra trước.</i>' : '') +
          '<br>Thợ rèn mua lại: ' + def.value + ' Linh Thạch',
          'Bán +' + def.value + ' Linh Thạch', false, function () {
            var r = GR.sellGear(ch, e.uid);
            if (r.ok) { if (SND) SND.sfx('shop_sell'); toast('Đã bán ' + def.name + ', +' + r.gained + ' Linh Thạch.'); }
            updateHUD(); saveGame(); renderShop(); renderInventory();
          });
      });
    }
  }
  function openShop() {
    renderShop();
    $('panelShop').style.display = 'block';
  }
  var shopCloseEl = $('shopClose');
  if (shopCloseEl) shopCloseEl.addEventListener('click', function () { $('panelShop').style.display = 'none'; });
  // ---------- Tủ sách làng Thanh Khê: bí tịch vỡ lòng + pháp quyết nhập môn ----------
  function openBooksPanel() {
    if (!MANU) return;
    renderBooksPanel();
    $('panelBooks').style.display = 'block';
  }
  var booksCloseEl = $('booksClose');
  if (booksCloseEl) booksCloseEl.addEventListener('click', function () { $('panelBooks').style.display = 'none'; });
  function renderBooksPanel() {
    var box = $('booksList');
    if (!box || !MANU) return;
    box.innerHTML = '';
    var h = document.createElement('h4');
    h.style.margin = '10px 0 4px';
    h.textContent = 'Sách vỡ lòng & pháp quyết nhập môn — bạn có ' + ch.linhThach + ' Linh Thạch (học cần Luyện Khí tầng 2)';
    box.appendChild(h);
    MANU.villageShopList(ch).forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'shop-row';
      var cv = document.createElement('canvas');
      cv.width = 32; cv.height = 32;
      if (MART && MART.has(e.item)) MART.draw(cv.getContext('2d'), e.item, 0, 0, 32, gfxLevel);
      else S.drawGridToCanvas(cv.getContext('2d'), S.ITEM_ICONS[e.item], 0, 0, 4);
      row.appendChild(cv);
      var info = document.createElement('div');
      info.style.flex = '1';
      info.innerHTML = '<b>' + e.name + '</b> · ' + e.gradeName + ' phẩm<br>' + e.desc +
        '<br>Giá: ' + e.price + ' Linh Thạch (đang có ' + e.owned + (e.learned ? ' · đã học chiêu này' : '') + ')';
      row.appendChild(info);
      var b = document.createElement('button');
      b.textContent = 'Mua';
      b.disabled = ch.linhThach < e.price;
      b.onclick = function () {
        var r = MANU.buyFromVillageShop(ch, e.item);
        if (r.ok && SND) SND.sfx('shop_buy');
        toast(r.ok ? 'Đã mua ' + e.name + '. Mở Túi đồ, bấm dùng để học (cần Luyện Khí tầng 2).' : (r.error || 'Không mua được.'));
        renderBooksPanel(); updateHUD(); saveGame();
      };
      row.appendChild(b);
      box.appendChild(row);
    });
  }
  // ---------- Bàn phím + D-pad 8 hướng ----------
  var KEYMAP = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0], arrowup: [0, -1], arrowleft: [-1, 0], arrowdown: [0, 1], arrowright: [1, 0] };
  // Esc đóng lớp giao diện trên cùng (QA 13:46 30/10): panel lựa chọn
  // kỳ ngộ thì Esc = nút "Để sau" (gác lại, giữ run); hộp thoại thì
  // đóng như nút ×; còn lại ẩn panel đang hiện đầu tiên trong danh
  // sách — đúng việc các nút × của từng panel vẫn làm (chỉ ẩn, mở lại
  // là dựng lại từ trạng thái đã lưu). PanelCult/PanelDemon cố ý KHÔNG
  // nằm trong danh sách: đó là hai panel lựa chọn có hậu quả (đột phá /
  // tâm ma), không cho tắt ngang bằng Esc.
  var ESC_PANELS = ['panelMenu', 'panelCharacter', 'panelWelcome', 'panelCompare', 'panelAuction', 'panelArtShop', 'panelShop', 'panelFair', 'panelDongPhu', 'panelAlchemy', 'panelTalisman', 'panelFormation', 'panelBooks', 'panelSkills', 'panelWardrobe', 'panelSects', 'panelTournament', 'panelBeastTide', 'panelEscort', 'panelCompanion', 'panelAffinity', 'panelPets', 'panelBestiary', 'panelLegend', 'panelSeasonBoard', 'panelBoss', 'panelRealms', 'panelRift', 'panelFate', 'panelTide', 'panelQuests', 'panelInv'];
  function closeTopPanel() {
    if (fateChoicePanelOpen()) {
      $('panelFateChoice').style.display = 'none';
      fateChoiceDeferred = true; fateChoiceAway = false;
      toast('Đã gác lại lựa chọn — quay về gần điểm vào cảnh để chọn tiếp, hoặc đi ra ô sáng ở cửa để rời cảnh.');
      return true;
    }
    if (dlg) { closeDialogue(); return true; }
    // QA 13:46 30/10 (mục 30): 2 modal thông báo (lộ linh căn, kết quả
    // đột phá) cũng đóng bằng Esc như nút Tiếp tục của chúng — khác
    // PanelCult/PanelDemon là panel lựa chọn có hậu quả nên vẫn miễn Esc.
    for (var mi = 0; mi < ['modalKyNgo', 'modalBreak'].length; mi++) {
      var mp = $(['modalKyNgo', 'modalBreak'][mi]);
      if (mp && mp.style.display === 'block') { mp.style.display = 'none'; return true; }
    }
    for (var i = 0; i < ESC_PANELS.length; i++) {
      var p = $(ESC_PANELS[i]);
      if (p && p.style.display === 'block') { p.style.display = 'none'; return true; }
    }
    return false;
  }
  // QA 13:46 30/10 (mục 30) — QUYẾT cho ghi chú "panel mở có tạm dừng
  // quái không": KHÔNG tạm dừng (tạm dừng sẽ đóng băng cả vòng sự kiện
  // giờ thật, thú triều, phiên đấu giá đang chạy trong loop); thay vào
  // đó panel đang mở ở map có quái mang viền cảnh báo đỏ + dải chữ, để
  // người chơi biết thế giới vẫn chạy. Chỉ đổi class khi trạng thái đổi
  // (không chạm DOM mỗi frame); hộp thoại cũng tính là lớp đang mở.
  var panelDangerKey = '';
  function refreshPanelDanger() {
    var ids = ESC_PANELS.concat(['dialogueBox']);
    var anyMon = !!(monsters && monsters.length);
    var open = [];
    for (var i = 0; i < ids.length; i++) {
      var p = $(ids[i]);
      if (p && p.style.display === 'block') open.push(ids[i]);
    }
    var key = (anyMon ? 'M' : '-') + '|' + open.join(',');
    if (key === panelDangerKey) return;
    panelDangerKey = key;
    ids.forEach(function (id) {
      var pp = $(id);
      if (pp && pp.classList) {
        if (anyMon && open.indexOf(id) >= 0) pp.classList.add('panel-danger');
        else pp.classList.remove('panel-danger');
      }
    });
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    // Chỉ nhường phím khi đang GÕ CHỮ thật (ô nhập văn bản, textarea,
    // select, vùng soạn thảo). Nút bấm và ô trượt/ô tick GIỮ TIÊU
    // ĐIỂM sau khi bấm không được nuốt phím: playtest live 01/11 cho
    // thấy sau khi đăng nhập / bấm nút, tiêu điểm kẹt lại nên WASD
    // và phím mũi tên chết cho tới khi bấm xuống mặt đất mới đi
    // được. Các đích đó nay rơi xuống xử lý phím game như thường
    // (nhánh KEYMAP bên dưới vẫn preventDefault nên trang không
    // cuộn theo phím mũi tên).
    var tIsTextInput = !!t && t.tagName === 'INPUT' &&
      /^(text|password|search|email|number|tel|url)$/.test(t.type || 'text');
    if (t && (tIsTextInput || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    var k = e.key.toLowerCase();
    // Móc controls (1): phím đã bị gán lại trong Cài đặt Điều khiển thì
    // js/controls.js tự xử lý — bỏ qua toàn bộ phím cứng bên dưới.
    if (CTL && CTL.swallowKey && CTL.swallowKey(k)) { e.preventDefault(); return; }
    // QA107 (KHAN 17:02 31/10): phim mui ten hoat dong dung nhu WASD —
    // KEYMAP da co san arrowup/arrowdown/arrowleft/arrowright. Cong chan
    // duy nhat con thieu la hop thoai: phim di chuyen bam KHI thoai dang
    // mo khong duoc ghi vao keys (nhan vat dung yen, khong danh), nhung
    // van preventDefault de trang khong cuon theo mui ten. Phim dang giu
    // tu truoc khi mo thoai thi openDialogue() xoa (xem duoi). Panel mo
    // va dang bay giu nguyen nhu WASD: khong co cong rieng cho ca hai,
    // mui ten di bay qua dung readMoveVector + he so toc do bay nhu WASD.
    if (KEYMAP[k]) { if (!dlg) keys[k] = true; e.preventDefault(); }
    // PANEL LỰA CHỌN KỲ NGỘ ĐANG MỞ (QA 19:01 30/10): nuốt mọi phím
    // hành động — trước đây Space/E/T/F/B/1–7 vẫn chạy xuyên xuống
    // game trong lúc panel che màn hình. Phím 1/2 chọn ngay lựa chọn
    // tương ứng (trước đây bấm số chỉ trừ linh lực qua chiêu). Phím di
    // chuyển ở trên vẫn chạy để người chơi đi ra ô thoát được.
    if (fateChoicePanelOpen()) {
      if (k === '1' || k === '2') {
        var fcBtns = $('fateChoiceBtns');
        var fcBtn = fcBtns && fcBtns.children ? fcBtns.children[parseInt(k, 10) - 1] : null;
        if (fcBtn && fcBtn.click) fcBtn.click();
      }
      e.preventDefault();
      return;
    }
    if (k === 'escape') { if (closeTopPanel()) e.preventDefault(); return; }
    // QA 18:16 30/10: mở được hộp thoại bằng phím E thì có tiếng
    // ui_click — trước đây mở bằng bàn phím là im lặng hoàn toàn
    // (chỉ bấm nút/chạm mới có tiếng qua listener của sound.js).
    // Câu nhận ra dấu ấn đã có tiếng kỳ ngộ riêng thì không chồng.
    if (k === 'e') { var hadDlgE = !!dlg; interact(); if (!hadDlgE && dlg && !dlgOriginCue && SND) SND.sfx('ui_click'); }
    if (k === 'f9' || k === '`') showFps = !showFps; // bật/tắt ô đo FPS (js/smooth.js)
    // QA 13:46 30/10: Space khi hộp thoại đang mở thì LẬT THOẠI (như
    // nút Tiếp), không đánh vào khoảng không sau lưng NPC nữa.
    if (k === ' ') { e.preventDefault(); if (dlg) { $('dlgNext').click(); } else attack(); }
    if (k === 't' && !e.repeat) meditate(); // QA 14:16 30/10 (f): giữ phím T không được thổ nạp lặp — key repeat của trình duyệt mà lọt vào đây thì giữ một phím là cày tu vi miễn phí (meditate() không có hồi chiêu); phím đã gán lại trong Cài đặt vốn đã chặn repeat ở controls.js:849, phím cứng T phải chặn như vậy.
    if (k === 'i' && $('btnInv')) $('btnInv').click(); // QA 13:46: phím I mở/đóng Túi đồ
    // QA 13:46 30/10 (mục 30): phím Q mở/đóng Nhiệm vụ — NHƯNG Q vốn là
    // phím chiêu Ngũ Lôi Oanh Đỉnh (js/skills.js, mở ở Kim Đan, cảnh giới
    // bậc 3). Trước bậc đó bấm Q chỉ nhận toast "chưa mở khóa" nên Q
    // làm phím Nhiệm vụ là lợi thuần; từ Kim Đan trở đi Q giữ nguyên là
    // chiêu (người chơi vẫn mở Nhiệm vụ bằng nút Nhiệm vụ), và khối SK
    // bên dưới bị chặn chỉ khi Q vừa mở Nhiệm vụ để khỏi hiện toast
    // "chưa mở khóa" chồng lên panel.
    var qQuest = false;
    if (k === 'q' && $('btnQuests') && !(SK && SK.isUnlocked && ch && SK.isUnlocked(ch, 'than_loi'))) { $('btnQuests').click(); qQuest = true; }
    if (k === 'b' && TAL && ch) { // PHÙ CHÚ: ô dùng nhanh (gán ở Bàn Phù)
      var qRes = TAL.useQuick(ch, talismanCtx());
      if (!qRes) toast('Ô dùng nhanh trống — gán 1 lá phù ở Bàn Phù của Diệp Phù Sinh.');
      else if (!qRes.ok) toast(qRes.msg || 'Không dùng được lá phù này ở đây.');
      else { applyTalismanResult(qRes, TAL.talismanDef(TAL.quickOf(ch))); toast(qRes.msg || 'Đã đốt phù.'); updateHUD(); saveGame(); }
    }
    if (k === 'f') toggleFlight(); // NGỰ KIẾM: bật/tắt bay (js/flight.js)
    if (SK && !qQuest) {
      // Skill trên thanh: phím số 1-5 là hàng chính; skill theo CẢNH
      // GIỚI dùng phím riêng trong def.key (8/9/0/Q/V/R/G/H/J/K...) —
      // phím 6/7 vẫn dành cho pháp bảo bên dưới.
      var sidK = SK.skillByKey ? SK.skillByKey(k) : null;
      if (sidK) castSkill(sidK);
      else if (['1', '2', '3', '4', '5'].indexOf(k) >= 0) {
        var sid = SK.BAR[parseInt(k, 10)];
        if (sid) castSkill(sid);
      }
    }
    if (ART && (k === '6' || k === '7')) castArtifactActive(parseInt(k, 10) - 6);
  });
  document.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
  // Nút bấm trong game nhả tiêu điểm ngay sau khi bấm: nút còn giữ
  // tiêu điểm thì Space/Enter sẽ "bấm lại" chính nút đó thay vì
  // đánh/tương tác, và ô trượt trong panel cũng giữ tiêu điểm tương
  // tự (playtest live 01/11/2026). Chỉ bỏ tiêu điểm của NÚT — bấm
  // vào ô nhập để gõ thì không đụng vào.
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.tagName === 'BUTTON' && t.blur) t.blur();
  });
  document.querySelectorAll('.dpad-btn').forEach(function (btn) {
    var dd = btn.getAttribute('data-dir');
    if (!dd) return;
    var d = dd.split(',').map(Number);
    function on(ev) { ev.preventDefault(); keys['pad_' + d.join('_')] = true; btn._dir = d; }
    function off(ev) { ev.preventDefault(); keys['pad_' + d.join('_')] = false; }
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off); // trượt tay/hệ thống hủy chạm: nhả phím, tránh kẹt di chuyển
  });
  // MỤC 106 — CLICK TỰ TÌM ĐƯỜNG TRONG MAP (KHẨN, lệnh Bui 17:02 31/10):
  // bấm ô đích trong cùng map thì chạy BFS bằng đúng isBlockedIn của
  // maps.js (cộng thêm ô NPC đang đứng, vốn đã chặn đi bộ qua tileBlocked)
  // để tìm đường tới ô đích, nhân vật tự đi theo đường từng đoạn (mỗi ô
  // là một điểm dừng). Chỉ khi BFS thật sự không có đường mới báo
  // "Không tới được ô đó" — trước đây click chỉ đi thẳng nên thua ngay
  // khi có cây/vách ở giữa dù BFS xác nhận ô đó tới được.
  // - Ô đích là ô tương tác (NPC / biển / cổng) mà không đi bộ lên được:
  //   đường dừng ở ô đi được kề đích gần nhất, không báo không tới được.
  // - Ô cổng chỉ được bước lên khi chính nó là đích: đường tới đích trong
  //   cùng map không tự đi xuyên cổng sang map khác; bước lên ô cổng thì
  //   luật chuyển map cũ (checkPortal/switchMap) vẫn chạy và xóa đường.
  // - Đang bay: BFS dùng luật chặn theo chiều cao (FLY_BLOCKED) thay cho
  //   isBlockedIn, NPC dưới đất không chặn đường bay.
  function clickPortalAt(mp, tx, ty) {
    var ps = mp.portals || [], i;
    for (i = 0; i < ps.length; i++) if (ps[i].x === tx && ps[i].y === ty) return true;
    return false;
  }
  function clickTileFree(mp, tx, ty, dest, fly) {
    if (tx < 0 || ty < 0 || tx >= mp.w || ty >= mp.h) return false;
    if (fly) return !(FLIGHT && FLIGHT.FLY_BLOCKED[mp.tiles[ty][tx]]);
    if (M.isBlockedIn(mp, tx, ty)) return false;
    if (clickPortalAt(mp, tx, ty) && !(tx === dest.x && ty === dest.y)) return false;
    var npcs = mp.npcs || [], i;
    for (i = 0; i < npcs.length; i++)
      if (npcVisible(npcs[i]) && npcs[i].x === tx && npcs[i].y === ty) return false;
    return true;
  }
  function clickInteractable(mp, tx, ty) {
    if (tx < 0 || ty < 0 || tx >= mp.w || ty >= mp.h) return false;
    var npcs = mp.npcs || [], i;
    for (i = 0; i < npcs.length; i++)
      if (npcVisible(npcs[i]) && npcs[i].x === tx && npcs[i].y === ty) return true;
    if (clickPortalAt(mp, tx, ty)) return true;
    var prs = mp.props || [];
    for (i = 0; i < prs.length; i++)
      if (prs[i].sprite === 'sign' && prs[i].x === tx && prs[i].y === ty) return true;
    return false;
  }
  // Trả về mảng ô [{x,y}] từ ô kề ô bắt đầu tới đích (không gồm ô bắt
  // đầu), hoặc [] khi đã ở đích / đã kề ô tương tác, hoặc null khi
  // không có đường thật. BFS 4 hướng, lớp đầu tiên chạm đích là ngắn nhất.
  function findClickPath(mp, sx, sy, tx, ty, fly) {
    if (sx === tx && sy === ty) return [];
    var dest = { x: tx, y: ty };
    var direct = clickTileFree(mp, tx, ty, dest, fly);
    var adjMode = !direct && clickInteractable(mp, tx, ty);
    if (!direct && !adjMode) return null;
    var key = function (x, y) { return x + ',' + y; };
    var prev = {}, seen = {}, q = [[sx, sy]], head = 0;
    seen[key(sx, sy)] = 1;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < q.length) {
      var cur = q[head++];
      if (adjMode && Math.abs(cur[0] - tx) + Math.abs(cur[1] - ty) === 1) {
        var pathA = [], cxA = cur[0], cyA = cur[1];
        while (!(cxA === sx && cyA === sy)) { pathA.unshift({ x: cxA, y: cyA }); var pA = prev[key(cxA, cyA)]; cxA = pA[0]; cyA = pA[1]; }
        return pathA;
      }
      if (!adjMode && cur[0] === tx && cur[1] === ty) {
        var pathD = [], cxD = cur[0], cyD = cur[1];
        while (!(cxD === sx && cyD === sy)) { pathD.unshift({ x: cxD, y: cyD }); var pD = prev[key(cxD, cyD)]; cxD = pD[0]; cyD = pD[1]; }
        return pathD;
      }
      for (var d = 0; d < 4; d++) {
        var nx = cur[0] + dirs[d][0], ny = cur[1] + dirs[d][1];
        if (seen[key(nx, ny)]) continue;
        if (!clickTileFree(mp, nx, ny, dest, fly)) continue;
        seen[key(nx, ny)] = 1; prev[key(nx, ny)] = cur; q.push([nx, ny]);
      }
    }
    return null;
  }
  // MỤC 106 (bổ sung sau test toàn suite): đoạn thẳng từ chân nhân vật
  // tới điểm bấm mà không chạm ô chặn nào thì GIỮ NGUYÊN hành vi click cũ
  // (đi thẳng tới đúng pixel đã bấm) — vừa nhanh như cũ, vừa không bắt
  // người chơi đi zigzag qua tâm ô khi đường đã thông. Chỉ khi đoạn thẳng
  // chạm ô chặn mới dùng đường BFS từng đoạn. Kiểm tra bằng thuật toán
  // duyệt lưới (Amanatides–Woo) trên các ô mà đoạn thẳng đi qua, dùng
  // đúng luật chặn hiện hành (đi bộ: tileBlocked gồm NPC; bay:
  // flyBlockedTile), và ô cổng giữa đường cũng tính là chặn để đường
  // tới đích trong cùng map không tự xuyên cổng.
  function clickLineClear(mp, sx, sy, dx, dy, dest, fly) {
    var blockedFn = fly ? flyBlockedTile : tileBlocked;
    var x = Math.floor(sx / TILE), y = Math.floor(sy / TILE);
    var tx = Math.floor(dx / TILE), ty = Math.floor(dy / TILE);
    if (x === tx && y === ty) return true;
    var stepX = dx > sx ? 1 : (dx < sx ? -1 : 0);
    var stepY = dy > sy ? 1 : (dy < sy ? -1 : 0);
    var tDeltaX = stepX !== 0 ? Math.abs(TILE / (dx - sx)) : Infinity;
    var tDeltaY = stepY !== 0 ? Math.abs(TILE / (dy - sy)) : Infinity;
    var nextX = stepX > 0 ? (x + 1) * TILE : x * TILE;
    var nextY = stepY > 0 ? (y + 1) * TILE : y * TILE;
    var tMaxX = stepX !== 0 ? Math.abs((nextX - sx) / (dx - sx)) : Infinity;
    var tMaxY = stepY !== 0 ? Math.abs((nextY - sy) / (dy - sy)) : Infinity;
    for (var guard = 0; guard < 10000; guard++) {
      if (tMaxX < tMaxY) { x += stepX; tMaxX += tDeltaX; }
      else { y += stepY; tMaxY += tDeltaY; }
      if (x === tx && y === ty) return true;
      if (blockedFn(x, y)) return false;
      if (clickPortalAt(mp, x, y)) return false;
    }
    return false;
  }
  function handleCanvasClickMove(e) {
    if (!ch || dlg) return;
    var rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: VIEW_W, height: VIEW_H };
    var cx = (e.clientX - rect.left) * (VIEW_W / rect.width);
    var cy = (e.clientY - rect.top) * (VIEW_H / rect.height);
    // Móc controls (5): đổi toạ độ màn hình -> thế giới theo zoom camera.
    var wx = camX + cx / ctlZoom(), wy = camY + cy / ctlZoom();
    var tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    var mp = curMap();
    var path = findClickPath(mp, Math.floor(px / TILE), Math.floor(py / TILE), tx, ty, !!flying);
    if (!path) { toast('Không tới được ô đó.'); return; }
    var directDest = clickTileFree(mp, tx, ty, { x: tx, y: ty }, !!flying);
    if (directDest && clickLineClear(mp, px, py, wx, wy, { x: tx, y: ty }, !!flying)) {
      movePath = null; moveTarget = { x: wx, y: wy };
    } else {
      movePath = path.map(function (t) { return { x: t.x * TILE + 16, y: t.y * TILE + 28 }; });
      // Đích đi bộ được thì đoạn cuối ngắm đúng pixel đã bấm (như click
      // cũ), không dừng ở tâm ô; đích tương tác thì dừng ở ô kề như BFS.
      if (directDest && movePath.length) movePath[movePath.length - 1] = { x: wx, y: wy };
      moveTarget = movePath.length ? movePath.shift() : null;
    }
    stuckT = 0;
  }
  canvas.addEventListener('click', handleCanvasClickMove);
  // Chuột phải làm đúng việc như click trái (chặn menu ngữ cảnh của
  // trình duyệt trên canvas) — đây là nút bấm mà playtest dùng để di chuyển.
  canvas.addEventListener('contextmenu', function (e) { if (e.preventDefault) e.preventDefault(); handleCanvasClickMove(e); });
  function readMoveVector() {
    var vx = 0, vy = 0;
    Object.keys(keys).forEach(function (k) {
      if (!keys[k]) return;
      if (KEYMAP[k]) { vx += KEYMAP[k][0]; vy += KEYMAP[k][1]; }
      else if (k.indexOf('pad_') === 0) {
        var p = k.slice(4).split('_').map(Number);
        vx += p[0]; vy += p[1];
      }
    });
    // Móc controls (2): cộng vector từ joystick ảo / D-pad ảo / tay cầm /
    // phím gán riêng (js/controls.js đã kẹp độ dài tổng <= 1 ở đầu ra, và
    // chỗ này còn chuẩn hoá lần nữa — không nhân đôi tốc độ).
    if (CTL && CTL.moveVec) {
      var cvCtl = CTL.moveVec();
      if (cvCtl) { vx += cvCtl.x; vy += cvCtl.y; }
    }
    if (vx === 0 && vy === 0) return null;
    var len = Math.sqrt(vx * vx + vy * vy);
    return { x: vx / len, y: vy / len };
  }
  // ---------- Vòng lặp game ----------
  function loop(ts) {
    requestAnimationFrame(loop);
    if (SM) SM.meter.sample(lastTime ? (ts - lastTime) / 1000 : 0.016); // FPS thật (dt chưa kẹp)
    var dt = Math.max(0, Math.min(0.05, (ts - lastTime) / 1000 || 0.016));
    lastTime = ts;
    if (!ch) return;
    // ----- Di chuyển V7: vận tốc có gia tốc/giảm tốc (easing), va chạm hộp
    // chân + trượt tường, pha đi bộ khóa theo quãng đường đi được. -----
    // Tốc độ trần cộng % từ trang bị phẩm cao (chỉ số speed trong statTotals).
    // NGỰ KIẾM: đang bay thì tốc độ trần x1,8 (SPEED_MULT ở js/flight.js).
    var topSpd = MOVE_TOP * (1 + (L.statTotals ? L.statTotals(ch).speed : 0) / 100) * (flying ? (FLIGHT ? FLIGHT.SPEED_MULT : 1.8) : 1);
    var want = readMoveVector();
    var desX = 0, desY = 0, hasWant = false, wantDir = null;
    if (deathPending) { moveTarget = null; movePath = null; }
    else if (want) { moveTarget = null; movePath = null; desX = want.x * topSpd; desY = want.y * topSpd; hasWant = true; wantDir = want; }
    else if (moveTarget) {
      var mdx = moveTarget.x - px, mdy = moveTarget.y - py;
      var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      // MỤC 106: tới một đoạn đường thì sang đoạn kế; hết đường mới dừng.
      if (mdist <= 5) { moveTarget = (movePath && movePath.length) ? movePath.shift() : null; if (!moveTarget) movePath = null; }
      else {
        var arrF = mdist < 30 ? (0.5 + 0.5 * (mdist / 30)) : 1; // chậm dần khi sắp tới điểm bấm
        desX = mdx / mdist * topSpd * arrF; desY = mdy / mdist * topSpd * arrF;
        hasWant = true;
        wantDir = { x: mdx / mdist, y: mdy / mdist };
      }
    }
    var acc = hasWant ? 1350 : 1750;
    var dvx2 = desX - pvx, dvy2 = desY - pvy;
    var dvl = Math.sqrt(dvx2 * dvx2 + dvy2 * dvy2), maxDv = acc * dt;
    if (dvl > maxDv && dvl > 0) { dvx2 = dvx2 / dvl * maxDv; dvy2 = dvy2 / dvl * maxDv; }
    pvx += dvx2; pvy += dvy2;
    if (!hasWant && Math.abs(pvx) < 1.5) pvx = 0;
    if (!hasWant && Math.abs(pvy) < 1.5) pvy = 0;
    // Tích phân theo tiểu bước (chống xuyên tường khi lướt nhanh), mỗi trục
    // độc lập: trục nào bị chặn thì dừng riêng trục đó -> trượt dọc tường.
    // NGỰ KIẾM: đang bay dùng luật va chạm theo CHIỀU CAO (collideFlyAt —
    // chỉ vật cao W/H/đá 'o'/biên map chặn), đi bộ dùng collideAt như cũ.
    var colFn = flying ? collideFlyAt : collideAt;
    var stepLen = Math.max(Math.abs(pvx), Math.abs(pvy)) * dt;
    var subN = Math.max(1, Math.min(6, Math.ceil(stepLen / 7)));
    var sdt = dt / subN;
    for (var si = 0; si < subN; si++) {
      var nx = px + pvx * sdt;
      if (!colFn(nx, py)) px = nx; else pvx = 0;
      var ny = py + pvy * sdt;
      if (!colFn(px, ny)) py = ny; else pvy = 0;
    }
    var spdNow = Math.sqrt(pvx * pvx + pvy * pvy);
    moving = spdNow > 12;
    if (spdNow > 20) {
      // Đổi hướng có trễ (hysteresis): trục trội phải hơn hẳn mới nhận hướng.
      var ax = Math.abs(pvx), ay = Math.abs(pvy);
      if (ay > ax * 1.35) dir = pvy < 0 ? 'up' : 'down';
      else if (ax > ay * 1.35) dir = pvx < 0 ? 'left' : 'right';
      else if (wantDir) {
        if (Math.abs(wantDir.y) > Math.abs(wantDir.x)) dir = wantDir.y < 0 ? 'up' : 'down';
        else dir = wantDir.x < 0 ? 'left' : 'right';
      }
      ch.dir = dir;
      // DIR8: hướng hiển thị đi đủ 8 hướng theo vector vận tốc thật
      // (hysteresis trong js/dir8.js chống giật ở biên sector); dir
      // 4 hướng ở trên GIỮ NGUYÊN cho mọi logic khác (lưu save, tầm
      // đánh, tương tác...). Di chuyển vốn đã là vector liên tục
      // (WASD/mũi tên tổ hợp, joystick, click-tìm-đường) nên chỉ
      // tầng HIỂN THỊ đổi — không sửa hệ di chuyển.
      if (D8) dir8 = D8.update(dir8, pvx, pvy);
    }
    if (moving) {
      walkPhase += spdNow * dt / 3.6; // 72px quãng đường = 1 chu kỳ đi 20 frame
      walkTimer += dt;
      if (medPoseT > 0) medPoseT = 0; // đang đi thì thôi tư thế ngồi
    } else {
      // Khóa về frame trung tính gần nhất (0/10) thay vì khựng giữa sải chân.
      var phT = Math.round(walkPhase / 10) * 10;
      walkPhase += (phT - walkPhase) * Math.min(1, dt * 12);
      if (Math.abs(phT - walkPhase) < 0.05) walkPhase = phT; // snap nốt đoạn cuối
      idleT += dt;
    }
    walkFrameIdx = ((Math.floor(walkPhase) % 20) + 20) % 20;
    // TIẾNG BƯỚC CHÂN (QA (e) 00:31 31/10): phát đúng nhịp chân chạm
    // đất — nửa chu kỳ đi (mốc 10 frame) vừa lật thì kêu một bước;
    // đang bay thì im (ngự kiếm đã có fly_whoosh riêng), đứng yên im.
    if (moving && !flying && spdNow > 20) {
      var stepHalfNow = Math.floor(walkPhase / 10);
      if (stepHalfNow !== lastStepHalf) { lastStepHalf = stepHalfNow; if (SND) SND.sfx('footstep'); }
    }
    if (moveTarget) {
      if (spdNow < 8 && hasWant) { stuckT += dt; if (stuckT > 0.4) { moveTarget = null; movePath = null; stuckT = 0; } }
      else stuckT = 0;
    } else stuckT = 0;
    // Bụi bước chân theo mức đồ hoạ (Cao nhiều, Trung bình ít, Thấp tắt).
    if (spdNow > 95 && gfxLevel !== 'thap') {
      dustAcc += dt * (gfxLevel === 'cao' ? 1 : 0.5) * (SM ? SM.meter.particleScale() : 1);
      while (dustAcc > 0.11) {
        dustAcc -= 0.11;
        var sideSign = (Math.floor(walkPhase / 10) % 2 === 0) ? -1 : 1;
        dusts.push({ x: px + sideSign * 7 + (Math.random() * 4 - 2), y: py - 1, t: 0, life: 0.55 + Math.random() * 0.25, vx: -pvx * 0.12 + (Math.random() * 8 - 4), vy: -7 - Math.random() * 6, r: 2.5 + Math.random() * 2 });
        if (dusts.length > 42) dusts.shift();
      }
    }
    // Động tác nhân vật: đếm giờ; động tác chết chạy hết mới hồi sinh.
    if (action) {
      action.t += dt;
      if (action.t >= action.dur) {
        var wasDeath = action.name === 'death';
        action = null;
        if (wasDeath && deathPending) { deathPending = false; onPlayerDeath(); }
      }
    }
    if (medPoseT > 0) { medPoseT -= dt; medPhase += dt; }
    else if (autoMeditate && ch.root && !moving && !action && !deathPending) medPhase += dt;
    // NGỰ KIẾM: độ nâng render tiến về LIFT khi bay, về 0 khi hạ (draw()
    // dùng flyLift để tách nhân vật khỏi bóng đổ dưới đất).
    var liftGoal = flying ? (FLIGHT ? FLIGHT.LIFT : 26) : 0;
    flyLift += (liftGoal - flyLift) * Math.min(1, dt * 5);
    if (Math.abs(liftGoal - flyLift) < 0.4) flyLift = liftGoal;
    refreshFlyButton();
    updateCamera(dt);
    refreshPanelDanger(); // QA 13:46 30/10 (mục 30): viền cảnh báo panel mở ở map có quái
    // Mây bay (js/clouds.js): cập nhật sau camera để mây tiền cảnh bám
    // đúng khung hình hiện tại. Chỉ chạy ở map có mây (map 3 + map 7 Chi
    // Đỉnh — CL.activeFor) — map khác không tốn gì.
    if (CL && CL.activeFor(curMapId)) {
      if (!cloudState) cloudState = CL.createState(null, curMapId);
      else if (CL.setMap) CL.setMap(cloudState, curMapId);
      var cMp = curMap();
      CL.update(cloudState, dt, {
        mapW: cMp.w * TILE, mapH: cMp.h * TILE, camX: camX, camY: camY,
        viewW: VIEW_W, viewH: VIEW_H, px: px, py: py, quality: gfxLevel
      });
    }
    // Môi trường động kho vết nứt: hạt chủ đề + mảnh hư không trôi theo
    // thời gian thực — chỉ chạy ở 11 map riftPool, map khác không tốn gì.
    if (RA && RA.activeFor(curMapId)) {
      var raMp = curMap();
      if (!realmFxState || realmFxState.mapId !== curMapId) realmFxState = RA.createState(curMapId, raMp.w * TILE, raMp.h * TILE);
      RA.update(realmFxState, dt);
    }
    for (var di = dusts.length - 1; di >= 0; di--) {
      var dp = dusts[di];
      dp.t += dt; dp.x += dp.vx * dt; dp.y += dp.vy * dt; dp.r += 5 * dt;
      if (dp.t >= dp.life) dusts.splice(di, 1);
    }
    if (portalCooldown > 0) portalCooldown -= dt;
    // NGỰ KIẾM: cổng CHỈ kích hoạt khi đi bộ trên đất — đang bay thì bay
    // ngang dải cổng cũng không nhảy map; hạ xuống đất bước lên mới qua.
    if (!flying) { checkPortal(); tickTournArena(); }
    if (PETS && ch && !deathPending) tickPets(dt); // linh thú: ấp trứng + theo chủ + tự đánh
    if (COMP && ch && !deathPending) tickCompanion(dt); // đồng hành: bám theo + đánh phụ quái đã thương
    if (BT && ch && !deathPending) tickTide(dt); // THÚ TRIỀU: đồng minh đánh + thú phá cổng + chuyển đợt
    if (ESC && ch && !deathPending) tickEscort(dt); // HỘ TỐNG: xe lăn + quái cắn xe + phục kích + giao hàng
    if (FM && ch && !deathPending) tickFormation(dt); // TRẬN KỲ: duy trì + làm chậm quái trong Khốn Thú
    tickRealms();
    if (WE && ch && !deathPending) tickWorldEvents(dt); // SỰ KIỆN NGẪU NHIÊN: lịch sự kiện + điểm tu sĩ nạn + thanh đếm
    tickRift(); // VẾT NỨT HƯ KHÔNG: banner mở nứt 1 lần/chu kỳ + thanh đếm ngược
    if (ch) { tickMinPanels(); tickTracker(); tickTicker(); tickWelcome(); tickAch(); syncBestiaryGear(); }
    tickFlyTrial(dt); // ngự kiếm: đếm giờ + kiểm cột mốc bài bay thử Q3
    // Skill: hồi linh lực + đếm hồi chiêu, combo, hiệu ứng đang chạy, rung màn hình.
    if (SK && ch) {
      SK.tickState(ch, dt);
      if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) comboStep = 0; }
      updateEffects(dt);
      if (tribRun) updateTribulation(dt); // LÔI KIẾP: chạy sự kiện độ kiếp
      barTick += dt;
      if (barTick > 0.12) { barTick = 0; updateSkillBar(); if ($('hudLL')) updateHUD(); }
    }
    if (shakeT > 0) { shakeT -= dt; if (shakeT <= 0) shakeMag = 0; }
    // Pháp khí/bảo vật: nhịp hiệu ứng riêng (khiên, phi kiếm, hồi sinh...).
    animClock += dt;
    if (ART && ch && !deathPending) tickArtifactFx(dt);
    // HỒI XUÂN PHÙ (js/talismans.js): hồi HP theo nhịp 1 giây (cùng nhịp
    // trừ độc) — tickHot(ch, now) hồi đúng hps mỗi lần gọi 1 giây.
    if (TAL && ch && !deathPending && ch.talFx && ch.talFx.hot) {
      talHotAcc += dt;
      if (talHotAcc >= 1) {
        talHotAcc -= 1;
        var hotGain = TAL.tickHot(ch, Date.now());
        if (hotGain > 0) floaters.push({ x: px, y: py - 34, txt: '+' + hotGain, color: '#7dff8a', t: 0 });
      }
    } else { talHotAcc = 0; }
    // Độc rắn lục (hệ đan dược): mỗi giây trừ dps HP nhưng sàn 1 HP — độc
    // không giết được người, chỉ ép phải giải độc hoặc rút lui.
    if (ch && !deathPending && ch.poison) {
      if (Date.now() >= ch.poison.until) { ch.poison = null; poisonAcc = 0; }
      else {
        poisonAcc += dt;
        if (poisonAcc >= 1) {
          poisonAcc -= 1;
          if (ch.hp > 1) {
            ch.hp = Math.max(1, ch.hp - (ch.poison.dps || 3));
            floaters.push({ x: px, y: py - 34, text: 'Độc -' + (ch.poison.dps || 3), color: '#b6ff5e', t: 0 });
            if (SND) SND.sfx('poison_tick'); // QA (e) 20:16 31/10: nhịp độc rút HP từng câm — nay có tiếng tick khẽ mỗi giây.
            updateHUD();
          }
        }
      }
    }
    // Quái: lang thang quanh điểm spawn (map 1 chỉ ở ngoại ô y>=wildY),
    // quái sự kiện kéo về phía Nam Môn; trạng thái hoạt ảnh theo hành vi.
    var now = Date.now();
    var mpNow = curMap();
    monsters.forEach(function (m) {
      m.animT += dt;
      if (m.hitT > 0) m.hitT -= dt;
      if (m.atkT > 0) m.atkT -= dt;
      if (m.dying) {
        m.deadT -= dt;
        if (m.deadT <= 0) {
          m.dying = false;
          if (!m.noRespawn) m.respawnAt = now + 10000;
          else m.gone = true;
        }
        return;
      }
      if (m.hp <= 0) {
        if (m.respawnAt && now >= m.respawnAt) {
          var def = L.MONSTERS[m.type];
          m.maxHp = m.baseMaxHp || m.eliteHp || def.hp; m.hp = m.maxHp; m.x = m.sx; m.y = m.sy; m.tx = m.sx; m.ty = m.sy; m.respawnAt = 0;
          m.svx = 0; m.svy = 0; m.vx = 0; m.vy = 0;
        }
        return;
      }
      // Hiệu ứng skill khống chế: băng phong đông cứng, thủy long làm chậm.
      // Thiêu đốt (proc Liệu Nhật của cung Thiên phẩm): mỗi giây cháy một
      // lần bằng đòn thô (không lăn proc tiếp), cháy cả khi đang bị chậm.
      if (m.burnT > 0 && m.burnDmg > 0) {
        m.burnT -= dt;
        m.burnTick = (m.burnTick || 0) + dt;
        if (m.burnTick >= 1) {
          m.burnTick -= 1;
          rawHitMonster(m, m.burnDmg, '#ff7a3c');
          if (m.dying || m.hp <= 0) return;
        }
      }
      if (m.freezeT > 0) { m.freezeT -= dt; m.vx = 0; m.vy = 0; m.svx = 0; m.svy = 0; return; }
      // Boss thế giới: chống dắt đi xa giết an toàn — đang bị thương mà
      // người chơi ở xa (>220px) quá 4 giây không đánh thì boss tự quay về
      // sào huyệt (đích = điểm spawn) và hồi 25% HP/giây tới đầy.
      if (m.worldBoss) {
        if (m.hitT > 0) m.calmT = 0; else m.calmT = (m.calmT || 0) + dt;
        var pdL = Math.sqrt(Math.pow(px - (m.x * TILE + 16), 2) + Math.pow(py - (m.y * TILE + 28), 2));
        if (m.hp < m.maxHp && m.calmT > 4 && pdL > 220) {
          m.tx = m.sx; m.ty = m.sy;
          m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.25 * dt);
        }
      }
      if (m.slowT > 0) m.slowT -= dt;
      if (m.markT > 0) m.markT -= dt; // dấu Soi Yêu của Kính Chiếu Yêu
      // Âm thanh: quái PHÁT HIỆN người chơi khi lọt vào tầm gần (mỗi con
      // có đồng hồ riêng, 7s mới kêu lại); boss Sơn Quân gầm khi người
      // chơi vào sào huyệt + bật lớp nhạc giao chiến, rời xa thì tắt.
      if (SND) {
        var sdd = distToM(m);
        if (m.boss) {
          if (sdd < 300 && !m.sndRoar) { m.sndRoar = true; SND.voice(m.type, 'aggro', { vol: 1, boss: true }); SND.bossFight(true); }
          else if (sdd > 430 && m.sndRoar) { m.sndRoar = false; SND.bossFight(false); }
        } else if (sdd < 120 && now - (m.sndAggro || 0) > 7000) {
          m.sndAggro = now;
          SND.voice(m.type, 'aggro', { vol: sndVol(sdd), elite: !!m.elite });
        }
      }
      m.moveT -= dt;
      if (m.moveT <= 0) {
        m.moveT = 1.5 + Math.random() * 1.5;
        var gx, gy;
        if (m.escort && ESC && flags.escort && flags.escort.run) {
          // HỘ TỐNG: quái phục kích bỏ qua lang thang, kéo thẳng về
          // xe hàng (ô đứng hiện tại của xe trong flags.escort.run).
          gx = Math.floor(flags.escort.run.x); gy = Math.floor(flags.escort.run.y);
        } else if (m.tide) {
          // THÚ TRIỀU: thú bỏ qua lang thang, kéo thẳng về miệng cổng
          // Nam Môn (hàng 53, cột cổng 43-44 — tọa độ V3) để phá cổng.
          gx = 43 + (Math.random() < 0.5 ? 0 : 1); gy = 53;
        } else if (m.ev) {
          gx = 18 + Math.floor(Math.random() * 4); gy = 16 + Math.floor(Math.random() * 3);
        } else {
          var dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
          var d = dirs[Math.floor(Math.random() * dirs.length)];
          gx = Math.floor(m.x) + d[0]; gy = Math.floor(m.y) + d[1];
          if (Math.abs(gx - m.sx) > 4 || Math.abs(gy - m.sy) > 4) { gx = m.sx; gy = m.sy; }
          // Ô cấm (cổng/NPC/biển/điểm rơi): đứng yên kỳ này thay vì
          // bước lên — xem wanderBanned ở trên.
          if (wanderBanned(curMapId, gx, gy)) { gx = Math.floor(m.x); gy = Math.floor(m.y); }
        }
        // HỘ TỐNG: xe đi cả vùng bắc map 1 (trên wildY) nên quái phục
        // kích được miễn giới hạn wildY — vẫn kiểm ô chặn như thường.
        var tgtOk = m.escort ? !M.isBlockedIn(mpNow, gx, gy)
          : ((!mpNow.wildY || gy >= mpNow.wildY) && !M.isBlockedIn(mpNow, gx, gy));
        if (tgtOk) { m.tx = gx; m.ty = gy; }
      }
      var cx = m.x * TILE + 16, cy = m.y * TILE + 28;
      var tx2 = m.tx * TILE + 16, ty2 = m.ty * TILE + 28;
      var dx = tx2 - cx, dy = ty2 - cy, dist = Math.sqrt(dx * dx + dy * dy);
      // Nội suy mượt V7: vận tốc rượt theo hướng đích có gia tốc + chậm dần
      // khi sắp tới nơi (arrive), thay cho tốc độ hằng số xuất phát/dừng gắt.
      var spdM = (m.type === 'ran_luc' ? 55 : (m.type === 'khi_mat_do' || m.type === 'tho_hoang' ? 70 : 40)) * (m.slowT > 0 ? 0.5 : 1);
      var desVx = 0, desVy = 0;
      if (dist > 1) {
        var arrM = dist < 18 ? Math.max(0.25, dist / 18) : 1;
        desVx = dx / dist * spdM * arrM; desVy = dy / dist * spdM * arrM;
      }
      var mAcc = 240 * dt;
      var mvx = (m.svx || 0), mvy = (m.svy || 0);
      var ddx = desVx - mvx, ddy = desVy - mvy;
      var ddl = Math.sqrt(ddx * ddx + ddy * ddy);
      if (ddl > mAcc && ddl > 0) { ddx = ddx / ddl * mAcc; ddy = ddy / ddl * mAcc; }
      mvx += ddx; mvy += ddy;
      if (!desVx && Math.abs(mvx) < 2) mvx = 0;
      if (!desVy && Math.abs(mvy) < 2) mvy = 0;
      m.svx = mvx; m.svy = mvy;
      if (mvx || mvy) {
        // Luật quái đất (Bui 21:18): quái KHÔNG bao giờ đứng trên ô chặn.
        // Tích phân cũ cộng thẳng vị trí theo vận tốc (arrive/nội suy) nên
        // quái trôi xuyên cây/tường khi đổi hướng hoặc boss đi thẳng về sào.
        // Nay tích phân TÁCH TRỤC có kiểm ô đứng (floor của vị trí, đúng ô
        // mà chọn đích lang thang dùng): trục nào đưa ô đứng vào ô chặn thì
        // bỏ trục đó + triệt vận tốc trục đó (trượt dọc vật cản như người
        // chơi); cả bước chéo cũng kiểm lại ô đích cuối.
        var ncxM = cx + mvx * dt, ncyM = cy + mvy * dt;
        var stxM = Math.floor(m.x), styM = Math.floor(m.y);
        var inBlockedM = M.isBlockedIn(mpNow, stxM, styM);
        var okXM = inBlockedM || !M.isBlockedIn(mpNow, Math.floor((ncxM - 16) / TILE), styM);
        var okYM = inBlockedM || !M.isBlockedIn(mpNow, stxM, Math.floor((ncyM - 28) / TILE));
        if (okXM) cx = ncxM; else { m.svx = 0; mvx = 0; }
        if (okYM) cy = ncyM; else { m.svy = 0; mvy = 0; }
        if (!inBlockedM && M.isBlockedIn(mpNow, Math.floor((cx - 16) / TILE), Math.floor((cy - 28) / TILE))) {
          // Bước chéo lọt góc 2 vật cản: lùi trục dọc nếu vừa đi, không thì lùi trục ngang.
          if (okYM && mvy) { cy = m.y * TILE + 28; m.svy = 0; mvy = 0; }
          else { cx = m.x * TILE + 16; m.svx = 0; mvx = 0; }
        }
        m.x = (cx - 16) / TILE;
        m.y = (cy - 28) / TILE;
      }
      m.vx = mvx; m.vy = mvy; // render đọc vx/vy (px/giây) để chọn act/hướng
      if (Math.abs(mvx) > 14) m.face = mvx < 0 ? 'left' : 'right';
      // V8: truc doc co thiet ke AI that rieng (front/back): dang di doc thi
      // chot huong doc, sang ngang thi chot truc ngang; dung de render chon
      // view on dinh thay vi nhay theo vy tuc thoi.
      if (Math.abs(mvy) > Math.abs(mvx) && Math.abs(mvy) > 14) { m.faceV = mvy < 0 ? 'back' : 'front'; m.faceAxis = 'v'; }
      else if (Math.abs(mvx) > 14) m.faceAxis = 'h';
    });
    // Nén tại chỗ (không cấp phát mảng mới mỗi frame như filter).
    var hasGone = false;
    for (var gi = 0; gi < monsters.length; gi++) if (monsters[gi].gone) { hasGone = true; break; }
    if (hasGone) {
      var gw = 0;
      for (var gr2 = 0; gr2 < monsters.length; gr2++) if (!monsters[gr2].gone) monsters[gw++] = monsters[gr2];
      monsters.length = gw;
    }
    herbs.forEach(function (h) { if (h.taken && h.respawnAt && now >= h.respawnAt) { h.taken = false; h.respawnAt = 0; } });
    // Boss thế giới: nhịp 1 giây — kiểm hồi sinh theo giờ thật (thông báo +
    // spawn tại chỗ nếu đang ở đúng map), ẩn banner hết hạn, làm mới đếm
    // ngược khi panel Boss đang mở.
    bossTick += dt;
    if (bossTick >= 1) { bossTick = 0; checkWorldBosses(); }
    if (autoAttack) {
      autoAtkTimer -= dt;
      if (autoAtkTimer <= 0) { autoAtkTimer = 0.9; if (nearestMonsterMelee()) attack(); }
    }
    // QA38 (muc 38 hang cho): tu tho nap CHI khi dung yen — cung dieu
    // kien voi medActiveNow() (!moving && !action && !deathPending).
    // Truoc day tick nay chi kiem autoMeditate && ch.root nen bat Tu
    // tho nap roi chay/danh khap map van nhan 1 tu vi/giay, trong khi
    // tu the ngoi (medActiveNow) da doi dung yen — hai duong lech nhau.
    // Khong phai "tinh tam nen" co chu dich: dang chay thi khong ngoi
    // thien duoc. Khi khong du dieu kien thi reset dong ho ve 1 giay
    // de dung lai khong an ngay mot lan tu vi ton tu luc dang chay.
    if (autoMeditate && ch.root && !moving && !action && !deathPending) {
      autoMedTimer -= dt;
      if (autoMedTimer <= 0) {
        autoMedTimer = 1.0;
        var amTile = playerTile();
        var amBase = DP ? DP.cultGainBase(ch, flags, 1, curMapId, amTile.x, amTile.y) : 1;
        if (TAL) { var amMult = TAL.medMult(ch, Date.now()); if (amMult > 1) amBase = Math.max(1, Math.round(amBase * amMult)); } // TỤ LINH PHÙ
        if (MANU) { var amManuPct = MANU.medTuViPct(ch); if (amManuPct > 0) amBase = Math.max(1, Math.round(amBase * (1 + amManuPct / 100))); } // DẪN KHÍ QUYẾT (bị động)
        if (TD) { var amTdMult = TD.medMult(new Date(gameNow())); if (amTdMult > 1) amBase = applyTdMedMult(amBase, amTdMult); } // TIẾT TĨNH TU: tự thổ nạp +25% (phần lẻ tích lũy chung với đường tay — QA 15:31)
        var g = L.gainTuVi(ch, amBase);
        if (DP && curMapId === DP.MAP_ID) DP.restHeal(ch, flags, curMapId);
        L.recordEvent(qs, ch, { type: 'tuvi', n: g });
        updateHUD(); saveGame();
      }
    } else if (autoMeditate) { autoMedTimer = 1.0; } // QA38: dang chay/danh/chet thi dong ho khong tich luy san
    floaters.forEach(function (f) { f.t -= dt; f.y -= 30 * dt; });
    var fw = 0;
    for (var fi = 0; fi < floaters.length; fi++) if (floaters[fi].t > 0) floaters[fw++] = floaters[fi];
    floaters.length = fw;
    if (skillFx) {
      skillFx.t += dt;
      skillFx.idx = Math.floor(skillFx.t / 0.035);
      skillFx.fF = skillFx.t / 0.035; // frame FLOAT cho tầng nội suy khi vẽ
      if (skillFx.idx >= 20) skillFx = null;
    }
    netTick(dt);
    // Móc controls (4): áp zoom bằng transform quanh draw() — restore
    // ngay sau, không rò transform sang frame/UI khác.
    var zvCtl = ctlZoom();
    if (zvCtl !== 1) {
      ctx.save(); ctx.scale(zvCtl, zvCtl); draw();
      try { drawGuideArrow(performance.now()); } catch (e) {}
      try { drawPlazaGuideArrow(performance.now()); } catch (e) {}
      ctx.restore();
    }
    else { draw(); try { drawGuideArrow(performance.now()); } catch (e) {} try { drawPlazaGuideArrow(performance.now()); } catch (e) {} }
    // Hạt môi trường làng: lớp phủ không gian màn hình, ngoài zoom.
    try { drawAmbientFx(performance.now()); } catch (e) {}
  }
  // ---------- Vẽ nền V4: đất ấm LIỀN MẠCH, không caro ----------
  // Bí quyết xóa cảm giác lưới ô: mọi ô đất dùng CÙNG một nền đất ấm,
  // chỉ khác nhau ở chi tiết thưa bên trong ô (sỏi, cỏ, hoa) — không đổi màu cả ô.
  function hash01(x, y) {
    var h = (x * 73856093) ^ (y * 19349663);
    return (((h % 1000) + 1000) % 1000) / 1000;
  }
  function drawGround(x, y, t) {
    var gx = x * TILE - camX, gy = y * TILE - camY;
    var h = hash01(x, y), h2 = hash01(y, x);
    var isMeadow = false;
    var base = '#c2a071'; // đất ấm chung cho mọi ô đi được
    if (t === '.') {
      // Ngoại ô: mảng đồng cỏ 3x3 (không caro) xen đất, như video mẫu;
      // gặm mép mảng cỏ cho viền không thẳng đuột.
      var bx = Math.floor(x / 3), by = Math.floor(y / 3);
      var onBorder = (x % 3 === 0) || (y % 3 === 0);
      if (y >= 15 && hash01(bx, by) < 0.45 && !(onBorder && h > 0.6)) {
        base = '#93b45e'; isMeadow = true;
      } else {
        base = h < 0.33 ? '#c2a071' : (h < 0.66 ? '#bda87e' : '#c7a878');
      }
    }
    else if (t === 'Q') base = '#b7a98f';      // sân lát đá tông ấm
    else if (t === 'W') base = '#7d766b'; // tường đá
    else if (t === 'G') base = '#4a3826'; // lối cổng tối
    else if (t === 'C') base = '#8a6a44'; // đất ruộng đã cày
    else if (t === '#') base = '#cbb083'; // đường đất nén, sáng hơn đất thường
    ctx.fillStyle = base;
    ctx.fillRect(gx, gy, TILE, TILE);
    if (t === 'Q') {
      // Mạch đá lát: đường joint mờ, tông đá từng ô chỉ lệch rất nhẹ (alpha).
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      if (h < 0.5) ctx.fillRect(gx, gy, TILE, TILE);
      ctx.fillStyle = '#8d8578';
      ctx.fillRect(gx, gy + 15, TILE, 1);
      ctx.fillRect(gx + ((y % 2) ? 8 : 24), gy, 1, TILE);
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.fillRect(gx + Math.floor(h * 24), gy + Math.floor(h2 * 24), 3, 2);
    } else if (t === '#') {
      ctx.fillStyle = '#a8855c';
      ctx.fillRect(gx + Math.floor(h * 26), gy + Math.floor(h2 * 26), 3, 2);
      ctx.fillRect(gx + Math.floor(h2 * 22), gy + Math.floor(h * 22), 2, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(gx + 4, gy + 4, 2, 2);
      if (h2 > 0.7) { // cỏ dại ven đường
        ctx.fillStyle = '#5d8f3e';
        ctx.fillRect(gx + Math.floor(h * 24), gy + 24, 2, 6);
        ctx.fillRect(gx + Math.floor(h * 24) + 3, gy + 26, 2, 5);
      }
    } else if (t === 'W') {
      // Mặt tường: dải trên sáng (mặt đi) + thân tường + mạch gạch + chân tối.
      ctx.fillStyle = '#8d8578';
      ctx.fillRect(gx, gy, TILE, 8);
      ctx.fillStyle = '#6e675c';
      ctx.fillRect(gx, gy + 8, TILE, 1);
      ctx.fillRect(gx, gy + 16, TILE, 1);
      ctx.fillRect(gx + ((y % 2) ? 10 : 22), gy + 9, 1, 7);
      ctx.fillRect(gx + ((y % 2) ? 22 : 10), gy + 17, 1, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(gx, gy + 28, TILE, 4);
    } else if (t === 'G') {
      ctx.fillStyle = '#5a4632';
      ctx.fillRect(gx, gy, TILE, 4);
      ctx.fillStyle = '#2a1e12';
      ctx.fillRect(gx + 6, gy + 4, TILE - 12, TILE - 8);
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(gx + 4, gy, 3, TILE);
      ctx.fillRect(gx + 25, gy, 3, TILE);
    } else if (t === 'C') {
      // Luống cày: rãnh dọc tối + mầm xanh rõ.
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(gx + 6, gy, 2, TILE);
      ctx.fillRect(gx + 16, gy, 2, TILE);
      ctx.fillRect(gx + 26, gy, 2, TILE);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(gx + 10, gy + 8 + Math.floor(h * 10), 3, 6);
      ctx.fillRect(gx + 20, gy + 12 + Math.floor(h2 * 8), 3, 6);
      ctx.fillRect(gx + 9, gy + 20, 3, 5);
      ctx.fillRect(gx + 21, gy + 22, 3, 5);
    } else {
      // Đất thường / đồng cỏ: sỏi thưa + cỏ dại + mảng cỏ mềm thưa, to (không chấm bi).
      ctx.fillStyle = isMeadow ? '#7a8a4a' : '#a8855c';
      ctx.fillRect(gx + Math.floor(h * 26), gy + Math.floor(h2 * 26), 3, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fillRect(gx + Math.floor(h2 * 22), gy + Math.floor(h * 22), 2, 2);
      if (h2 > 0.5) {
        ctx.fillStyle = '#5d8f3e';
        ctx.fillRect(gx + Math.floor(h * 22) + 2, gy + Math.floor(h2 * 18), 2, 6);
        ctx.fillRect(gx + Math.floor(h * 22) + 5, gy + Math.floor(h2 * 18) + 2, 2, 5);
      }
      if (!isMeadow && h > 0.80 && h < 0.90) { // mảng cỏ mềm, thưa và to
        ctx.fillStyle = 'rgba(122,166,72,0.45)';
        ctx.beginPath();
        ctx.ellipse(gx + 16, gy + 16, 11, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (h >= 0.93) { // hoa dại
        ctx.fillStyle = '#f2c14e';
        ctx.fillRect(gx + Math.floor(h2 * 22) + 3, gy + Math.floor(h * 22) + 3, 3, 3);
      } else if (h >= 0.88) {
        ctx.fillStyle = '#e8e0cc';
        ctx.fillRect(gx + Math.floor(h2 * 22) + 3, gy + Math.floor(h * 22) + 3, 2, 2);
      }
    }
  }
  // Bóng đổ dài về hướng đông-nam (mặt trời từ tây-bắc), 2 lớp mờ dần.
  // V7.1: thực thể (người chơi/quái/NPC) truyền cen=true — bóng đổ nằm
  // ĐÚNG NGAY DƯỚI CHÂN (lệnh cứng của Bui); vật cảnh (nhà/cây/đá) giữ
  // bóng lệch nắng như cũ.
  function drawShadow(cx, feetY, rx, cen) {
    var ox1 = cen ? 0 : 10, ox2 = cen ? 0 : 20;
    ctx.fillStyle = 'rgba(20,16,8,0.20)';
    ctx.beginPath();
    ctx.ellipse(cx + ox1, feetY - 2, rx, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(20,16,8,0.08)';
    ctx.beginPath();
    ctx.ellipse(cx + ox2, feetY, rx + 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // V10: placeLabel hoist ra tầng module dùng chung _placedLabels (trước
  // đây khai lại trong draw() mỗi frame).
  function placeLabel(cx, y, w, h) {
    var bh = h || 16;
    var x0 = Math.max(4, Math.min(effVW() - w - 4, cx - w / 2));
    var yy = y;
    for (var tries = 0; tries < 8; tries++) {
      var hit = _placedLabels.some(function (b) {
        return x0 < b.x + b.w && x0 + w > b.x && yy < b.y + b.h && yy + bh > b.y;
      });
      if (!hit) break;
      yy += bh + 1;
    }
    _placedLabels.push({ x: x0, y: yy, w: w, h: bh });
    return { x: x0, y: yy };
  }
  // ----- VÁ LỆCH NỀN V7 (playtest live 01/11/2026) -----
  // Tranh nền của 14 map thế giới là tranh KHUNG CŨ (trước mở rộng
  // x1,5): map1 dùng map1-bg-v8.webp 3584x3200px = 112x100 ô trong
  // khi lưới logic là 168x150 ô. Trước đây draw() vẽ tranh 1:1 từ gốc
  // thế giới nên mọi vật trong tranh (giếng cổ, nhà, sạp...) nằm ở
  // tọa độ CŨ, lệch đúng neo V7 so với logic: giếng trong tranh ở ô
  // cũ (43,45) còn giếng logic ở (71,70) = cũ + neo map1 (28,25).
  // Người chơi tới giếng TRONG TRANH bấm E chỉ nhận "không có gì để
  // tương tác", đứng ở giếng logic thì không thấy giếng (lớp vật thể
  // theo ô bị tắt khi có tranh), cổng ở vành mới thì tranh không có.
  // Vá ở ENGINE (không sửa dữ liệu nướng maps.js, không dùng tranh
  // ứng viên chưa được duyệt): tranh đặt DỊCH theo neo lõi
  // M.EXP_V7_ANCHORS của chính map đó, giữ nguyên kích thước tự
  // nhiên — vật trong tranh khớp lại logic lõi; vành ngoài vùng
  // tranh vẽ bằng lớp ô như cũ. Vật thể theo ô chỉ vẽ ở NGOÀI vùng
  // tranh phủ (trong vùng phủ tranh đã chứa sẵn). Map chia mảng
  // (bgChunks — sơn môn) không có bg toàn cảnh nên không đi đường
  // này (curBg() trả null, bgCov null, hành vi như cũ).
  var _bgCovCache = {}; // id map -> { img, cov } — cov null khi map không có neo / tranh chưa có kích thước
  function bgCoverFor(mp, img) {
    if (!mp || !img) return null;
    var ent = _bgCovCache[mp.id];
    if (ent && ent.img === img) return ent.cov;
    var cov = null;
    var anch = (M && M.EXP_V7_ANCHORS) ? M.EXP_V7_ANCHORS[mp.id] : null;
    var iw = img.naturalWidth || img.width || 0, ih = img.naturalHeight || img.height || 0;
    if (anch && iw >= TILE && ih >= TILE) {
      cov = {
        x0: anch.dx, y0: anch.dy,
        x1: Math.min(mp.w, anch.dx + Math.floor(iw / TILE)),
        y1: Math.min(mp.h, anch.dy + Math.floor(ih / TILE)),
        px: anch.dx * TILE, py: anch.dy * TILE, iw: iw, ih: ih
      };
    }
    _bgCovCache[mp.id] = { img: img, cov: cov };
    return cov;
  }
  function bgCoversTile(cov, x, y) {
    return !!cov && x >= cov.x0 && x < cov.x1 && y >= cov.y0 && y < cov.y1;
  }
  function draw() {
    // Móc controls (4): trong draw(), VIEW_W/VIEW_H là biến CỤC BỘ = khung
    // nhìn hiệu dụng theo zoom (loop đã bọc ctx.scale(zoom) quanh draw).
    var VIEW_W = effVW(), VIEW_H = effVH();
    var mp = curMap();
    var bgR = curBg();
    // Camera do vòng lặp cập nhật bằng lerp (updateCamera); ở đây chỉ cộng
    // rung màn hình tạm thời lên trên — không gán cứng lại theo px/py nữa.
    if (shakeT > 0 && shakeMag > 0) {
      camX += (Math.random() * 2 - 1) * shakeMag * (shakeT / 0.35);
      camY += (Math.random() * 2 - 1) * shakeMag * (shakeT / 0.35);
    }
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    var x0 = Math.floor(camX / TILE), y0 = Math.floor(camY / TILE);
    var x1 = Math.min(mp.w - 1, x0 + VIEW_W / TILE + 1), y1 = Math.min(mp.h - 1, y0 + VIEW_H / TILE + 1);
    var x, y;
    // VÁ LỆCH NỀN V7: bgCov = vùng tranh phủ sau khi dịch theo neo
    // (null khi map không có tranh toàn cảnh hoặc không có neo).
    var bgCov = bgR ? bgCoverFor(mp, bgR) : null;
    if (bgR && bgCov) {
      // Ô mặt đất phủ toàn khung nhìn trước (vành ngoài tranh có
      // đất/đường/cổng dạng ô), rồi đặt tranh đã dịch neo đè lên
      // đúng vùng lõi — chỉ vẽ phần giao với khung nhìn, dùng
      // drawImage dạng cắt hình chữ nhật nguồn/đích.
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        drawGround(x, y, mp.tiles[y][x]);
      }
      var bgIx0 = Math.max(camX, bgCov.px), bgIy0 = Math.max(camY, bgCov.py);
      var bgIx1 = Math.min(camX + VIEW_W, bgCov.px + bgCov.iw), bgIy1 = Math.min(camY + VIEW_H, bgCov.py + bgCov.ih);
      if (bgIx1 > bgIx0 && bgIy1 > bgIy0) {
        ctx.drawImage(bgR, bgIx0 - bgCov.px, bgIy0 - bgCov.py, bgIx1 - bgIx0, bgIy1 - bgIy0,
          bgIx0 - camX, bgIy0 - camY, bgIx1 - bgIx0, bgIy1 - bgIy0);
      }
    } else if (bgR) {
      // Không có neo (không xảy ra với 14 map thế giới): giữ đường cũ.
      ctx.drawImage(bgR, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
    } else if (mp.bgChunks) {
      // Map chia mảng: tile dự phòng bên dưới, mảng đã nạp đè lên trên.
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        drawGround(x, y, mp.tiles[y][x]);
      }
      drawBgChunks(mp, VIEW_W, VIEW_H);
    } else {
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        drawGround(x, y, mp.tiles[y][x]);
      }
    }
    // Bụi bước chân (vẽ trên nền, dưới thực thể): hạt mềm bốc lên sau gót.
    dusts.forEach(function (dp) {
      var da = 1 - dp.t / dp.life;
      ctx.fillStyle = DUST_STYLES[Math.max(0, Math.min(20, Math.round(da * 20)))];
      ctx.beginPath();
      ctx.ellipse(dp.x - camX, dp.y - camY, dp.r, dp.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Kho vết nứt — mảnh hư không + linh quang: vẽ trên nền, dưới thực
    // thể (lớp mặt đất của môi trường động, js/realm-ambient.js).
    if (RA && realmFxState && RA.activeFor(curMapId)) {
      RA.drawBelow(ctx, realmFxState, camX, camY, VIEW_W, VIEW_H, gfxLevel);
    }
    // Cổng bí cảnh định kỳ: khe nứt phong ấn phát sáng cạnh giếng cổ (map 1),
    // chỉ vẽ khi phiên đang mở — đóng phiên là khe biến mất.
    if (SR && curMapId === SR.SCHEDULED.gateMap && (SR.status(flags, gameNow()).open || (SR.anyOpen && SR.anyOpen(gameNow())))) {
      var gx2 = SR.SCHEDULED.gate.x * TILE + 16 - camX, gy2 = SR.SCHEDULED.gate.y * TILE + 28 - camY;
      if (gx2 > -60 && gx2 < VIEW_W + 60 && gy2 > -80 && gy2 < VIEW_H + 60) {
        var pu = 0.5 + 0.5 * Math.sin(animClock * 3.2);
        ctx.fillStyle = 'rgba(138,111,208,0.20)';
        ctx.beginPath(); ctx.ellipse(gx2, gy2 - 16, 20 + 4 * pu, 34 + 5 * pu, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(88,52,160,0.55)';
        ctx.beginPath(); ctx.ellipse(gx2, gy2 - 16, 10 + 2 * pu, 26 + 3 * pu, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(230,220,255,0.9)';
        ctx.beginPath(); ctx.ellipse(gx2, gy2 - 16, 3.5, 18 + 2 * pu, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(30,18,52,0.5)';
        ctx.beginPath(); ctx.ellipse(gx2, gy2 + 2, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        ctx.strokeText('Liệt Khích Phong Ấn', gx2, gy2 - 62);
        ctx.fillStyle = '#e6dcff';
        ctx.fillText('Liệt Khích Phong Ấn', gx2, gy2 - 62);
      }
    }
    // VẾT NỨT HƯ KHÔNG (sự kiện hậu Trúc Cơ): vết rách đen-tím răng cưa
    // xé trên map thường khi đang trong 30 phút mở của chu kỳ — khác hẳn
    // khe nứt giếng cổ: lõi ĐEN hút sáng, viền tím rực, mảnh hư không
    // trôi lên. Vẽ + nhãn + đếm ngược ngay tại neo (rift-events.js).
    if (RIFT) {
      var rinf2 = RIFT.cycleInfo(Date.now());
      if (rinf2.active && curMapId === rinf2.anchor.mapId) {
        var rx2 = rinf2.anchor.x * TILE + 16 - camX, ry2 = rinf2.anchor.y * TILE + 28 - camY;
        if (rx2 > -80 && rx2 < VIEW_W + 80 && ry2 > -100 && ry2 < VIEW_H + 80) {
          var rpu = 0.5 + 0.5 * Math.sin(animClock * 2.3);
          ctx.fillStyle = 'rgba(40,8,66,0.30)';
          ctx.beginPath(); ctx.ellipse(rx2, ry2 - 18, 30 + 6 * rpu, 46 + 7 * rpu, 0, 0, Math.PI * 2); ctx.fill();
          // Thân vết rách: đa giác răng cưa dọc, lõi đen, viền tím.
          ctx.beginPath();
          var jag = [[0, -52], [7, -34], [3, -18], [10, -2], [4, 14], [8, 30], [0, 46], [-8, 30], [-4, 14], [-10, -2], [-3, -18], [-7, -34]];
          jag.forEach(function (p, ji) { var jx = rx2 + p[0] * (1 + 0.12 * rpu), jy = ry2 - 18 + p[1]; if (ji === 0) ctx.moveTo(jx, jy); else ctx.lineTo(jx, jy); });
          ctx.closePath();
          ctx.fillStyle = 'rgba(6,2,14,0.92)'; ctx.fill();
          ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(178,102,255,' + (0.65 + 0.3 * rpu).toFixed(3) + ')'; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(rx2, ry2 - 66); ctx.lineTo(rx2 + 1, ry2 + 26);
          ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(230,210,255,0.85)'; ctx.stroke();
          // Mảnh hư không trôi lên quanh vết rách.
          ctx.fillStyle = 'rgba(196,141,255,0.7)';
          for (var rfi = 0; rfi < 5; rfi++) {
            var rfx = rx2 + Math.sin(animClock * 0.9 + rfi * 2.4) * (16 + rfi * 4);
            var rfy = ry2 + 8 - ((animClock * 14 + rfi * 23) % 74);
            ctx.fillRect(rfx, rfy, 3, 3);
          }
          ctx.fillStyle = 'rgba(30,18,52,0.55)';
          ctx.beginPath(); ctx.ellipse(rx2, ry2 + 2, 19, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
          ctx.lineWidth = 3; ctx.strokeStyle = '#160a26';
          var rsec = Math.max(0, Math.round((rinf2.expiresAt - Date.now()) / 1000));
          var rlab = 'Vết Nứt Hư Không · còn ' + Math.floor(rsec / 60) + ':' + ('0' + (rsec % 60)).slice(-2);
          ctx.strokeText(rlab, rx2, ry2 - 82);
          ctx.fillStyle = '#d9b8ff';
          ctx.fillText(rlab, rx2, ry2 - 82);
        }
      }
    }
    // Cửa đá Động Phủ (map 1, sau giếng cổ): tảng đá khắc phù văn — sáng
    // ngọc khi người chơi đã được tông môn cấp phủ, xám lặng khi chưa
    // (js/dong-phu.js: phủ do tông cấp khi bái sư, không còn mua quyền).
    if (DP && curMapId === DP.GATE_MAP) {
      var cgx = DP.GATE.x * TILE + 16 - camX, cgy = DP.GATE.y * TILE + 28 - camY;
      if (cgx > -60 && cgx < VIEW_W + 60 && cgy > -80 && cgy < VIEW_H + 60) {
        var caveOwned = !!(flags.dp && flags.dp.owned);
        var cpu2 = 0.5 + 0.5 * Math.sin(animClock * 2.1);
        ctx.fillStyle = caveOwned ? 'rgba(127,232,214,' + (0.13 + 0.10 * cpu2).toFixed(3) + ')' : 'rgba(160,150,130,0.10)';
        ctx.beginPath(); ctx.ellipse(cgx, cgy - 14, 17, 26, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5d564a';
        ctx.beginPath(); ctx.ellipse(cgx, cgy - 12, 11, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = caveOwned ? '#7fe8d6' : '#9a917e';
        ctx.fillRect(cgx - 1, cgy - 26, 2, 12);
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        ctx.strokeText('Động Phủ', cgx, cgy - 46);
        ctx.fillStyle = caveOwned ? '#bff5ea' : '#d8d2c2';
        ctx.fillText('Động Phủ', cgx, cgy - 46);
      }
    }
    // Đài Tụ Linh Trận trong động phủ: vòng linh văn phát sáng trên sân đá.
    if (DP && curMapId === DP.MAP_ID) {
      var arR = DP.ARRAY_RECT;
      var acx = (arR.x0 + arR.x1 + 1) * TILE / 2 - camX, acy = (arR.y0 + arR.y1 + 1) * TILE / 2 - camY;
      var apu = 0.5 + 0.5 * Math.sin(animClock * 2.6);
      ctx.fillStyle = 'rgba(127,232,214,' + (0.10 + 0.08 * apu).toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(acx, acy, (arR.x1 - arR.x0 + 1) * TILE / 2, (arR.y1 - arR.y0 + 1) * TILE / 2 * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(127,232,214,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(acx, acy, 40 + 6 * apu, 26 + 4 * apu, 0, 0, Math.PI * 2); ctx.stroke();
      // Phướn ấn ký tông hai bên đài trận: màu chủ đạo của tông đã nhập
      // (bộ chung khi phủ legacy chưa có tông) + quầng sáng sân nhuốm màu
      // tông rất nhẹ — dấu ấn tông nhìn thấy ngay khi bước vào phủ.
      var dpDecor = DP.decorFor(flags);
      var dpRgb = [parseInt(dpDecor.color.slice(1, 3), 16), parseInt(dpDecor.color.slice(3, 5), 16), parseInt(dpDecor.color.slice(5, 7), 16)];
      ctx.fillStyle = 'rgba(' + dpRgb[0] + ',' + dpRgb[1] + ',' + dpRgb[2] + ',0.07)';
      ctx.fillRect(4 * TILE - camX, 5 * TILE - camY, 14 * TILE, 5 * TILE);
      [7, 15].forEach(function (bx) {
        var bpx = bx * TILE + 16 - camX, bpy = 1 * TILE - camY;
        ctx.fillStyle = '#4a3826'; ctx.fillRect(bpx - 1, bpy - 6, 2, 34);
        ctx.fillStyle = dpDecor.color; ctx.fillRect(bpx - 7, bpy - 4, 14, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(bpx - 1, bpy + 1, 2, 12);
      });
    }
    // LỄ HỘI ĐĂNG HOA (QA 16:16 30/10): tiết Đăng Hoa là "hội đèn
    // làng" thì trong làng phải CÓ ĐÈN thật — trước đây hệ mùa chỉ
    // sống trong panel + thoại, ra sân làng không thấy gì khác ngày
    // thường. Đèn lồng đỏ treo ở giếng cổ, cổng Nam Môn và các sạp
    // chợ trong suốt tiết Đăng Hoa (tháng 3/7/11), tắt khi qua tiết.
    if (TD && curMapId === 'map1' && TD.seasonOf(gameNow()).id === 'dang_hoa') {
      var lspots = [];
      if (mp.well) { lspots.push({ x: mp.well.x - 1, y: mp.well.y - 1 }); lspots.push({ x: mp.well.x + 1, y: mp.well.y - 1 }); }
      if (mp.gate) { lspots.push({ x: mp.gate.x, y: mp.gate.y - 1 }); lspots.push({ x: mp.gate.x + 2, y: mp.gate.y - 1 }); }
      (mp.props || []).forEach(function (p) { if (p.sprite === 'stall' && lspots.length < 8) lspots.push({ x: p.x, y: p.y - 1 }); });
      lspots.forEach(function (s, li) {
        var lx = s.x * TILE + 16 - camX, ly = s.y * TILE + 10 - camY;
        if (lx < -40 || lx > VIEW_W + 40 || ly < -40 || ly > VIEW_H + 40) return;
        var lpu = 0.5 + 0.5 * Math.sin(animClock * 2.2 + li * 1.3);
        ctx.fillStyle = 'rgba(255,166,66,' + (0.16 + 0.10 * lpu).toFixed(3) + ')';
        ctx.beginPath(); ctx.ellipse(lx, ly, 16, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a2f23'; ctx.fillRect(lx - 1, ly - 16, 2, 6);
        ctx.fillStyle = '#d8402e'; ctx.beginPath(); ctx.ellipse(lx, ly - 4, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffb84d'; ctx.beginPath(); ctx.ellipse(lx, ly - 4, 3.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8b23a'; ctx.fillRect(lx - 1, ly + 5, 2, 5);
      });
    }
    // Ô THOÁT BÍ CẢNH: ô sáng ở cửa ra — đồng hồ bí cảnh hứa "đi về ô
    // sáng ở cửa để ra" thì trong cảnh phải có ô sáng thật ở đúng ô
    // thoát (QA 18:46 30/10: trước đây chỉ timer nói, cảnh không vẽ).
    // Vàng nhấp nháy cùng ngôn ngữ quầng sáng của cửa Động Phủ ở trên.
    if (SR && SR.isRealmMap(curMapId) && mp.exit && flags.sr && flags.sr.run && flags.sr.run.mapId === curMapId) {
      var exTx = mp.exit.x * TILE - camX, exTy = mp.exit.y * TILE - camY;
      if (exTx > -TILE && exTx < VIEW_W && exTy > -TILE && exTy < VIEW_H) {
        var epu2 = 0.5 + 0.5 * Math.sin(animClock * 2.6);
        ctx.fillStyle = 'rgba(255,214,90,' + (0.20 + 0.16 * epu2).toFixed(3) + ')';
        ctx.fillRect(exTx, exTy, TILE, TILE);
        ctx.strokeStyle = 'rgba(255,232,150,' + (0.55 + 0.35 * epu2).toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.strokeRect(exTx + 1, exTy + 1, TILE - 2, TILE - 2);
      }
    }
    // Cổng lầu Nam Môn — phần sau (mái 2 tầng + tầng lầu): vẽ trước thực thể,
    // cao khỏi đầu người để không bị che; biển + trụ trước vẽ sau thực thể (cuối draw).
    var gate = mp.gate;
    var gX0 = gate ? gate.x * TILE - camX : -999, gX1 = gate ? (gate.x + 2) * TILE - camX : -999;
    var gCX = (gX0 + gX1) / 2, gY = gate ? gate.y * TILE - camY : -999;
    if (gate && !bgCoversTile(bgCov, gate.x, gate.y) && gX1 >= 0 && gX0 <= VIEW_W) {
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(gX0 - 8, gY - 186, 80, 62);
      ctx.fillStyle = '#7a2e22';
      ctx.fillRect(gX0 - 8, gY - 186, 80, 4);
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1;
      ctx.strokeRect(gX0 + 6, gY - 174, 24, 30);
      ctx.strokeRect(gX0 + 42, gY - 174, 24, 30);
      ctx.beginPath();
      ctx.moveTo(gX0 + 18, gY - 174); ctx.lineTo(gX0 + 18, gY - 144);
      ctx.moveTo(gX0 + 54, gY - 174); ctx.lineTo(gX0 + 54, gY - 144);
      ctx.moveTo(gX0 + 6, gY - 159); ctx.lineTo(gX0 + 30, gY - 159);
      ctx.moveTo(gX0 + 42, gY - 159); ctx.lineTo(gX0 + 66, gY - 159);
      ctx.stroke();
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(gCX - 32, gY - 220, 64, 8);
      ctx.fillStyle = '#7a2e22';
      ctx.beginPath();
      ctx.moveTo(gCX - 74, gY - 186);
      ctx.lineTo(gCX + 74, gY - 186);
      ctx.lineTo(gCX + 48, gY - 212);
      ctx.lineTo(gCX - 48, gY - 212);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a34a2a';
      ctx.fillRect(gCX - 48, gY - 212, 96, 3);
      ctx.fillStyle = '#7a2e22';
      ctx.beginPath();
      ctx.moveTo(gCX - 52, gY - 220);
      ctx.lineTo(gCX + 52, gY - 220);
      ctx.lineTo(gCX + 32, gY - 242);
      ctx.lineTo(gCX - 32, gY - 242);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(gCX - 4, gY - 248, 8, 8);
      ctx.fillStyle = '#2a1e12';
      ctx.fillRect(gX0 + 4, gY + 2, 56, 30);
    }
    // Vật thể + thực thể, y-sort. V10: danh sách dùng POOL vật thể dùng
    // lại giữa các frame (không cấp phát) + CULL thực thể ngoài khung
    // hình (lề rộng) TRƯỚC khi sort — map càng rộng càng thắng FPS.
    var list = _drawList; list.length = 0; _poolN = 0;
    var lo;
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
      var tt = mp.tiles[y][x];
      if (!bgCoversTile(bgCov, x, y) && (tt === 'H' || tt === 'T' || tt === 'S' || tt === 'L' || tt === 'F' || tt === 'o' || tt === 'E')) {
        lo = pooledObj(); lo.kind = 'tile'; lo.tile = tt; lo.x = x; lo.y = y; lo.sy = (y + 1) * TILE; list.push(lo);
      }
    }
    // Trang trí RIÊNG theo tông đã nhập (js/dong-phu.js decorProps) cộng
    // vào danh sách vật thể khi đang ở trong phủ — nền AI là nền chung,
    // dấu ấn tông nằm ở lớp prop này + biển ấn ký.
    var drawProps = mp.props || [];
    if (DP && curMapId === DP.MAP_ID) drawProps = drawProps.concat(DP.decorProps(flags));
    drawProps.forEach(function (p) {
      if (bgCoversTile(bgCov, p.x, p.y) && p.sprite !== 'sign' && !(DP && curMapId === DP.MAP_ID)) return; // trong vùng tranh phủ, tranh đã có sẵn vật trang trí; chỉ giữ biển hiệu + nhãn (phủ: nền hang không chứa prop tông nên phải hiện). Ngoài vùng phủ (vành ô) prop vẽ bình thường.
      var psx = p.x * TILE - camX, psy = p.y * TILE - camY;
      if (psx < -160 || psx > VIEW_W + 96 || psy < -160 || psy > VIEW_H + 96) return;
      lo = pooledObj(); lo.kind = 'prop'; lo.sprite = p.sprite; lo.label = p.label; lo.x = p.x; lo.y = p.y; lo.sy = (p.y + 1) * TILE; list.push(lo);
    });
    if (BOS) BOS.steleList(mp.id).forEach(function (stl) {
      var ssx = stl.x * TILE - camX, ssy = stl.y * TILE - camY;
      if (ssx < -160 || ssx > VIEW_W + 96 || ssy < -160 || ssy > VIEW_H + 96) return;
      lo = pooledObj(); lo.kind = 'stele'; lo.bossId = stl.bossId; lo.x = stl.x; lo.y = stl.y; lo.sy = (stl.y + 1) * TILE; list.push(lo);
    });
    herbs.forEach(function (h) {
      if (h.taken) return;
      var hsx = h.x * TILE - camX, hsy = h.y * TILE - camY;
      if (hsx < -96 || hsx > VIEW_W + 64 || hsy < -96 || hsy > VIEW_H + 64) return;
      lo = pooledObj(); lo.kind = 'herb'; lo.item = h.item; lo.treasure = !!h.treasure; lo.x = h.x; lo.y = h.y; lo.sy = (h.y + 1) * TILE; list.push(lo);
    });
    // PROP SỐNG (ATLAS LAB): prop trong khung camera (culling bằng lưới
    // băm trong js/props.js) vào CHUNG danh sách y-sort, sy = y chân
    // prop — lúa trước che chân nhân vật, lúa sau nằm sau lưng, không
    // vẽ lớp riêng. Đếm số đang vẽ cho ngân sách hiệu năng (beginFrame).
    if (PROPS) {
      PROPS.beginFrame();
      var pview = PROPS.collect(curMapId, camX - 90, camY - 120, camX + VIEW_W + 90, camY + VIEW_H + 40, gfxLevel, Date.now());
      for (var pvi = 0; pvi < pview.length; pvi++) {
        lo = pooledObj(); lo.kind = 'rprop'; lo.prop = pview[pvi]; lo.sy = pview[pvi].y; list.push(lo);
      }
    }
    // Linh điền trong động phủ: cây đang trồng vào cùng danh sách y-sort
    // (ô trống/ô khóa không vẽ gì — nền ô đất 'C' đã có sẵn).
    if (DP && curMapId === DP.MAP_ID) {
      var dpNowDraw = Date.now();
      for (var dci = 0; dci < DP.PLOT_TILES.length; dci++) {
        var dcv = DP.plotView(flags, dci, dpNowDraw);
        if (dcv.stage === 'empty' || dcv.stage === 'locked' || dcv.stage === 'badplot') continue;
        var dcp = DP.PLOT_TILES[dci];
        lo = pooledObj(); lo.kind = 'crop'; lo.item = dcv.herb; lo.stage = dcv.stage; lo.watered = dcv.watered; lo.x = dcp.x; lo.y = dcp.y; lo.sy = (dcp.y + 1) * TILE; list.push(lo);
      }
    }
    mp.npcs.forEach(function (n) {
      if (!npcVisible(n)) return;
      var nsx = n.x * TILE - camX, nsy = n.y * TILE - camY;
      if (nsx < -160 || nsx > VIEW_W + 96 || nsy < -160 || nsy > VIEW_H + 96) return;
      lo = pooledObj(); lo.kind = 'npc'; lo.npc = n; lo.x = n.x; lo.y = n.y; lo.sy = (n.y + 1) * TILE; list.push(lo);
    });
    // THIÊN 5 ch.30: bóng Kẻ giữ ấn (xem showThien5Figure) — vào cùng
    // danh sách y-sort như NPC thường trong lúc còn hiện hình.
    if (thien5Fig && curMapId === thien5Fig.mapId && Date.now() < thien5Fig.until) {
      var f5n = thien5Fig.npc;
      var f5sx = f5n.x * TILE - camX, f5sy = f5n.y * TILE - camY;
      if (!(f5sx < -160 || f5sx > VIEW_W + 96 || f5sy < -160 || f5sy > VIEW_H + 96)) {
        lo = pooledObj(); lo.kind = 'npc'; lo.npc = f5n; lo.x = f5n.x; lo.y = f5n.y; lo.sy = (f5n.y + 1) * TILE; list.push(lo);
      }
    }
    // THIÊN 5 ch.29 (QA 19:31 30/10): thoại giao việc nhắc "lò luyện
    // dã chiến, khói còn chưa tan" quanh sào Cổ Mãng Vương — trong
    // lúc việc đang dở (đã nhận, chưa trả), dựng trại dã chiến bằng
    // vật thể SẴN CÓ của game (chum lò + lán củi + biển tên) ngay
    // phía nam sào; trả việc xong thì trại biến mất theo. Cộng tay
    // vào danh sách y-sort vì nền ảnh map 4 đã chứa trang trí tĩnh —
    // đi đường drawProps thường sẽ bị lớp nền nuốt mất.
    if (curMapId === 'map4' && BOS && BOS.bossById && qs && qs.accepted && qs.accepted.q_thien5_2) {
      var lair5 = BOS.lairOf(BOS.bossById('co_mang_vuong'));
      if (lair5) {
        var camp5 = [
          { sprite: 'jar', dx: -1, dy: 1 },
          { sprite: 'woodshed', dx: 1, dy: 1 },
          { sprite: 'sign', dx: 0, dy: 2, label: 'Lò luyện dã chiến' }
        ];
        camp5.forEach(function (cp) {
          var cxp = lair5.x + cp.dx, cyp = lair5.y + cp.dy;
          var csx = cxp * TILE - camX, csy = cyp * TILE - camY;
          if (csx < -160 || csx > VIEW_W + 96 || csy < -160 || csy > VIEW_H + 96) return;
          lo = pooledObj(); lo.kind = 'prop'; lo.sprite = cp.sprite; lo.label = cp.label; lo.x = cxp; lo.y = cyp; lo.sy = (cyp + 1) * TILE; list.push(lo);
        });
      }
    }
    // THÚ TRIỀU: đệ tử đồng minh đang thủ thành — vào cùng danh sách
    // y-sort như quái/NPC (chỉ map 1, chỉ khi lượt đang chạy).
    if (curMapId === 'map1' && BT && flags.tide && flags.tide.run) {
      tideAllies.forEach(function (a) {
        if (!a.alive) return;
        var asx2 = a.x * TILE + 16 - camX, asy2 = a.y * TILE + 28 - camY;
        if (asx2 < -176 || asx2 > VIEW_W + 176 || asy2 < -208 || asy2 > VIEW_H + 96) return;
        lo = pooledObj(); lo.kind = 'tideally'; lo.ally = a; lo.x = a.x; lo.y = a.y; lo.sy = a.y * TILE + 32; list.push(lo);
      });
    }
    // HỘ TỐNG: xe hàng đang chạy — vào cùng danh sách y-sort (chỉ
    // map của xe, chỉ khi lượt đang chạy). Vẽ bằng lưới 'cart' có sẵn
    // trong sprites.js (cùng lưới với xe trang trí ở các map).
    if (ESC && flags.escort && flags.escort.run && flags.escort.run.mapId === curMapId) {
      var erun = flags.escort.run;
      var ecx = erun.x * TILE + 16 - camX, ecy = erun.y * TILE + 28 - camY;
      if (!(ecx < -176 || ecx > VIEW_W + 176 || ecy < -208 || ecy > VIEW_H + 96)) {
        lo = pooledObj(); lo.kind = 'escortcart'; lo.x = erun.x; lo.y = erun.y; lo.sy = erun.y * TILE + 32; list.push(lo);
      }
    }
    monsters.forEach(function (m) {
      if (!(m.hp > 0 || m.dying)) return;
      var msx = m.x * TILE + 16 - camX, msy = m.y * TILE + 28 - camY;
      if (msx < -176 || msx > VIEW_W + 176 || msy < -208 || msy > VIEW_H + 96) return;
      lo = pooledObj(); lo.kind = 'monster'; lo.m = m; lo.x = m.x; lo.y = m.y; lo.sy = m.y * TILE + 32; list.push(lo);
    });
    if (PETS && activePetInst() && !(flying && flyMode === 'pet')) {
      var peSx = petEnt.x - camX, peSy = petEnt.y - camY;
      if (peSx > -140 && peSx < VIEW_W + 140 && peSy > -160 && peSy < VIEW_H + 96) {
        lo = pooledObj(); lo.kind = 'pet'; lo.sy = petEnt.y; list.push(lo);
      }
    }
    // ĐỒNG HÀNH: vào cùng danh sách y-sort như NPC/linh thú (mọi map,
    // chỉ khi đang đi cùng). Gục vẫn vẽ (mờ + nhãn "gục") để người chơi
    // thấy mà đưa về làng, không biến mất khó hiểu.
    if (COMP && activeCompanionDef()) {
      var ceSx = compEnt.x - camX, ceSy = compEnt.y - camY;
      if (ceSx > -140 && ceSx < VIEW_W + 140 && ceSy > -160 && ceSy < VIEW_H + 96) {
        lo = pooledObj(); lo.kind = 'companion'; lo.sy = compEnt.y; list.push(lo);
      }
    }
    if (netSession) {
      // Người chơi khác cùng map (khung multiplayer): vào cùng danh sách
      // y-sort như NPC/quái; tắt cờ thì netSession null, bỏ qua hoàn toàn.
      var nps = netSession.peers();
      for (var npi = 0; npi < nps.length; npi++) {
        var npp = nps[npi];
        var npsx = npp.x - camX, npsy = npp.y - camY;
        if (npsx < -140 || npsx > VIEW_W + 140 || npsy < -160 || npsy > VIEW_H + 96) continue;
        lo = pooledObj(); lo.kind = 'peer'; lo.peer = npp; lo.sy = npp.y; list.push(lo);
      }
    }
    lo = pooledObj(); lo.kind = 'player'; lo.sy = py; list.push(lo);
    list.sort(function (a, b) { return a.sy - b.sy; });
    var npcLabels = _npcLabels; npcLabels.length = 0;
    list.forEach(function (it) {
      // Bóng đổ dài (vẽ trước sprite, cùng lượt y-sort).
      if (it.kind === 'tile' && it.tile === 'H') drawShadow(it.x * TILE + 16 - camX, (it.y + 1) * TILE - camY, 44);
      else if (it.kind === 'tile' && it.tile === 'T') drawShadow(it.x * TILE + 16 - camX, (it.y + 1) * TILE - camY, 40);
      else if (it.kind === 'tile' && (it.tile === 'S' || it.tile === 'E')) drawShadow(it.x * TILE + 16 - camX, (it.y + 1) * TILE - camY, 26);
      else if (it.kind === 'npc') drawShadow(it.x * TILE + 16 - camX, (it.y + 1) * TILE - camY, 22, true);
      else if (it.kind === 'monster') { var shRxB = it.m._dw ? Math.max(13, Math.round(it.m._dw * 0.30)) : 16; drawShadow(it.m.x * TILE + 16 - camX, it.m.y * TILE + 28 - camY, (it.m.svx || it.m.svy) ? shRxB * (1 - 0.10 * Math.abs(Math.sin((it.m.animT || 0) * 9))) : shRxB, true); }
      else if (it.kind === 'tideally') drawShadow(it.ally.x * TILE + 16 - camX, it.ally.y * TILE + 28 - camY, 16, true);
      else if (it.kind === 'escortcart') drawShadow(it.x * TILE + 16 - camX, it.y * TILE + 28 - camY, 20, true);
      else if (it.kind === 'pet') { var pInstS = activePetInst(); if (pInstS && PETS.species(pInstS.sp).move !== 'fly' && PETS.species(pInstS.sp).move !== 'swim') drawShadow(petEnt.x - camX, petEnt.y - camY, 13, true); }
      else if (it.kind === 'companion') drawShadow(compEnt.x - camX, compEnt.y - camY, 22, true); // đồng hành đi bộ: bóng vẫn dưới đất
      else if (it.kind === 'peer') drawShadow(it.peer.x - camX, it.peer.y - camY, 20, true);
      else if (it.kind === 'player') drawShadow(px - camX, py - camY, (medActiveNow() ? 27 : 22 * (1 - 0.05 * Math.abs(Math.cos(walkPhase * Math.PI / 10)))) * (1 - flyLift * 0.008), true); // ngự kiếm: bóng vẫn DƯỚI ĐẤT, nhỏ dần theo độ nâng
      if (it.kind === 'tile') {
        var spr = { H: 'house', T: 'tree', S: 'stall', L: 'lantern', F: 'fence', o: 'rock', E: 'well' }[it.tile];
        var gw = (spr === 'house' || spr === 'tree' || spr === 'stall' || spr === 'well') ? 32 : 16;
        var sc = (spr === 'house' || spr === 'tree') ? 4 : (spr === 'stall' ? 3 : 2);
        var wpx = gw * sc;
        S.drawGridToCanvas(ctx, S.OBJECTS[spr], it.x * TILE + 16 - wpx / 2 - camX, (it.y + 1) * TILE - gw * sc - camY, sc);
      } else if (it.kind === 'prop') {
        // Vật trang trí 16 ô vẽ to 48px, căn đáy vào ô (trông như đồ thật, không tí hon).
        S.drawGridToCanvas(ctx, S.OBJECTS[it.sprite], it.x * TILE + 16 - 24 - camX, (it.y + 1) * TILE - 48 - camY, 3);
      } else if (it.kind === 'rprop') {
        // Prop sống (lúa): blit sprite tiền-scale từ atlas, neo chân tại
        // y prop (js/props.js lo cache + đếm số đang vẽ).
        if (PROPS) PROPS.drawOne(ctx, it.prop, camX, camY);
      } else if (it.kind === 'stele') {
        // Bia sào huyệt boss thế giới: tảng đá đứng như vật thể trong map.
        S.drawGridToCanvas(ctx, S.OBJECTS.rock, it.x * TILE + 16 - 24 - camX, (it.y + 1) * TILE - 48 - camY, 3);
      } else if (it.kind === 'herb') {
        var isLinhChi = it.item === 'linh_chi';
        var herbGrade = ALCH && ALCH.herbDef(it.item) ? ALCH.herbDef(it.item).grade : 'pham';
        ctx.fillStyle = isLinhChi ? 'rgba(64,224,208,0.35)'
          : herbGrade === 'dia' ? 'rgba(255,184,78,0.45)'
          : herbGrade === 'huyen' ? 'rgba(207,159,255,0.4)'
          : herbGrade === 'linh' ? 'rgba(127,232,214,0.35)' : '#2e7d32';
        ctx.beginPath(); ctx.arc(it.x * TILE + 16 - camX, it.y * TILE + 16 - camY, isLinhChi ? 13 : 10, 0, Math.PI * 2); ctx.fill();
        if (it.treasure) {
          var tp2 = 0.5 + 0.5 * Math.sin(animClock * 4 + it.x * 1.7 + it.y * 2.3);
          ctx.fillStyle = 'rgba(255,215,90,' + (0.35 + 0.25 * tp2).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(it.x * TILE + 16 - camX, it.y * TILE + 16 - camY, 15 + 3 * tp2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffe98a';
          ctx.fillRect(it.x * TILE + 14 - camX, it.y * TILE + 1 - camY, 4, 4);
        }
        S.drawGridToCanvas(ctx, S.OBJECTS.crop, it.x * TILE - camX, it.y * TILE - camY, 2);
        if (isLinhChi) {
          ctx.fillStyle = '#7fffe8';
          ctx.fillRect(it.x * TILE + 12 - camX, it.y * TILE + 8 - camY, 8, 5);
        }
      } else if (it.kind === 'crop') {
        // Cây linh điền theo giai đoạn: mầm nhỏ -> cây lớn; CHÍN thì
        // quầng vàng nhấp nháy + đốm sáng — nhìn phát biết thu được.
        var crGrade = ALCH && ALCH.herbDef(it.item) ? ALCH.herbDef(it.item).grade : 'pham';
        ctx.fillStyle = crGrade === 'dia' ? 'rgba(255,184,78,0.40)'
          : crGrade === 'huyen' ? 'rgba(207,159,255,0.38)'
          : crGrade === 'linh' ? 'rgba(127,232,214,0.32)' : 'rgba(126,217,87,0.30)';
        ctx.beginPath(); ctx.arc(it.x * TILE + 16 - camX, it.y * TILE + 16 - camY, it.stage === 'ready' ? 13 : 9, 0, Math.PI * 2); ctx.fill();
        var crSc = it.stage === 'seed' ? 1 : it.stage === 'sprout' ? 1.5 : 2;
        S.drawGridToCanvas(ctx, S.OBJECTS.crop, it.x * TILE + 16 - 8 * crSc - camX, it.y * TILE + 32 - 16 * crSc - camY, crSc);
        if (it.watered) { ctx.fillStyle = '#5aa7d6'; ctx.fillRect(it.x * TILE + 24 - camX, it.y * TILE + 22 - camY, 3, 3); }
        if (it.stage === 'ready') {
          var crPulse = 0.5 + 0.5 * Math.sin(animClock * 4 + it.x * 1.3 + it.y * 2.1);
          ctx.fillStyle = 'rgba(255,233,168,' + (0.35 + 0.30 * crPulse).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(it.x * TILE + 16 - camX, it.y * TILE + 10 - camY, 5 + 2 * crPulse, 0, 0, Math.PI * 2); ctx.fill();
        }
      } else if (it.kind === 'npc') {
        var def = npcDef(it.npc);
        // NPC đứng yên tại vị trí nhiệm vụ nhưng "thở" nhẹ (nhấp nhô 1–2px)
        // thay vì đóng băng; vị trí logic không đổi.
        // V7.1: NPC chỉ CHÌM xuống theo nhịp thở (0..2px), không nhấc
        // khỏi mặt đất — chân NPC luôn đứng tại neo trên bóng đổ.
        var bobY = Math.abs(Math.round(Math.sin(Date.now() * 0.0016 + (it.npc.x * 7 + it.npc.y * 13) * 1.7) * 1.5));
        // V9: muc Cao/Trung binh ve NPC bang sheet AI (idle 20 frame), du 4
        // huong THAT (ca trai — khong con lat ngang). NPC quay mat ve phia
        // nguoi choi khi dang thoai hoac nguoi choi dung gan (<= 2 o):
        // duoi -> down, tren -> up, trai -> left, phai -> right.
        var drewNpcAI = false;
        if (gfxLevel !== 'thap' && NAI) {
          var nId = it.npc.sprite || it.npc.id;
          // TÍCH HỢP A (01/11/2026): NPC có archetype thì vẽ bằng sheet
          // archetype 8 HƯỚNG (js/dir8.js + bảng archetypeOf trong
          // js/npc-ai.js, theo hồ sơ docs/npc-looks-design.md mục 4):
          // NPC đang mượn sheet của type khác (id khác sprite) dùng
          // archetype đã gán cho id; sprite trùng tên archetype (lính
          // gác...) dùng chính archetype đó. Khi người chơi đứng gần
          // (<= 2 ô) hoặc đang thoại, NPC quay ĐỦ 8 HƯỚNG về phía
          // người chơi (hướng chéo là sheet chéo thật); xa thì mặt
          // xuống như cũ. NPC có sheet riêng và tông chủ giữ nguyên
          // đường vẽ cũ ở nhánh dưới.
          var nArch = null;
          if (D8 && D8.NPC8_ENABLED && NAI.archetypeOf) {
            if (it.npc.id !== nId && NAI.archetypeOf[it.npc.id]) nArch = NAI.archetypeOf[it.npc.id];
            else if (D8.NPC8_ARCHETYPES.indexOf(nId) >= 0) nArch = nId;
          }
          if (nArch) {
            var ndxA = Math.floor(px / TILE) - it.x, ndyA = Math.floor(py / TILE) - it.y;
            var inTalkA = talkingNpc && talkingNpc.id === it.npc.id;
            var nDir8 = (inTalkA || Math.abs(ndxA) + Math.abs(ndyA) <= 2) ? (D8.sectorOf(ndxA, ndyA) || 'down') : 'down';
            var nPathA = D8.npcSheetPath(NAI, gfxLevel, nArch, nDir8);
            var nSheetA = nPathA ? getNpcSheetByPath(nPathA) : null;
            if (nSheetA) {
              var nCellA = gfxLevel === 'cao' ? 192 : 120;
              var nDxA = it.x * TILE + 16 - 48 - camX;
              var nDyA = (it.y + 1) * TILE - 96 + bobY - camY;
              var nFFA = Date.now() / 110 + (it.npc.x * 7 + it.npc.y * 13);
              if (SM) drewNpcAI = SM.drawSheetBlend(ctx, nSheetA, nFFA, 20, nCellA, nDxA, nDyA, 96, 96, { wrap: true });
              else { ctx.drawImage(nSheetA, Math.floor(nFFA) % 20 * nCellA, 0, nCellA, nCellA, nDxA, nDyA, 96, 96); drewNpcAI = true; }
            }
          }
          if (!drewNpcAI && ((NAI.types && NAI.types[nId]) || SECT_MASTER_SLUG[nId])) {
            var nView = 'down';
            var inTalkN = talkingNpc && talkingNpc.id === it.npc.id;
            var ndxT = Math.floor(px / TILE) - it.x, ndyT = Math.floor(py / TILE) - it.y;
            if (inTalkN || Math.abs(ndxT) + Math.abs(ndyT) <= 2) {
              if (Math.abs(ndxT) > Math.abs(ndyT)) nView = ndxT < 0 ? 'left' : 'right';
              else if (ndyT !== 0) nView = ndyT < 0 ? 'up' : 'down';
            }
            var nSheet = getNpcSheet(gfxLevel, nId, nView + '-idle');
            var nFlip = false;
            if (!nSheet && nView === 'left') { // du phong: thieu sheet trai thi lat sheet phai
              nSheet = getNpcSheet(gfxLevel, nId, 'right-idle');
              nFlip = !!nSheet;
            }
            if (nSheet) {
              var nInfo = (NAI.types && NAI.types[nId]) || { cellCao: 192, cellTrung: 120 };
              var nFrames = SECT_MASTER_SLUG[nId] ? 60 : 20; // sheet tông chủ 60 frame, NPC thường 20
              var nCell = gfxLevel === 'cao' ? nInfo.cellCao : nInfo.cellTrung;
              var nDx = it.x * TILE + 16 - 48 - camX;
              var nDy = (it.y + 1) * TILE - 96 + bobY - camY;
              // V10: frame FLOAT + crossfade 2 keyframe kề (thở liên tục,
              // không nhảy bậc 110ms như floor cũ).
              var nFF = Date.now() / 110 + (it.npc.x * 7 + it.npc.y * 13);
              if (SM) {
                drewNpcAI = SM.drawSheetBlend(ctx, nSheet, nFF, nFrames, nCell, nDx, nDy, 96, 96, { flip: nFlip, wrap: true });
              } else if (nFlip) {
                var nF = Math.floor(nFF) % nFrames;
                ctx.save();
                ctx.translate(nDx + 96, nDy);
                ctx.scale(-1, 1);
                ctx.drawImage(nSheet, nF * nCell, 0, nCell, nCell, 0, 0, 96, 96);
                ctx.restore();
                drewNpcAI = true;
              } else {
                ctx.drawImage(nSheet, Math.floor(nFF) % nFrames * nCell, 0, nCell, nCell, nDx, nDy, 96, 96);
                drewNpcAI = true;
              }
            }
          }
        }
        if (!drewNpcAI) {
          // V10: lưới NPC là TĨNH -> raster cache theo id rồi blit lại
          // (khỏi sinh lại ~1000 ô fillRect cho mỗi NPC mỗi frame).
          var drewNpcGrid = false;
          if (SM) {
            var nKey = 'npcgrid|' + (it.npc.sprite || it.npc.id);
            var entN = { key: nKey, gen: null };
            if (!SM.gridGet(nKey)) entN.gen = (function (g) { return function () { return S.gridToPixels(g); }; })(def.grid);
            drewNpcGrid = !!SM.drawGridBlend(ctx, entN, null, 0, it.x * TILE + 16 - camX, (it.y + 1) * TILE + bobY - camY, 3);
          }
          if (!drewNpcGrid) S.drawGridToCanvas(ctx, def.grid, it.x * TILE + 16 - 48 - camX, (it.y + 1) * TILE - 96 + bobY - camY, 3);
        }
        // Nhãn tên gom lại vẽ ở cuối (chống chồng nhau) — xem npcLabels bên dưới.
        npcLabels.push({ name: def.name, role: def.role, cx: it.x * TILE + 16 - camX, y: it.y * TILE - 74 + bobY - camY, markerY: it.y * TILE - 96 + bobY - camY });
        var mk = questMarkerFor(it.npc.id);
        if (mk) {
          ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
          ctx.lineWidth = 4; ctx.strokeStyle = '#202020';
          ctx.strokeText(mk, it.x * TILE + 16 - camX, it.y * TILE - 96 + bobY - camY);
          ctx.fillStyle = mk === '!' ? '#ffd94a' : '#7dff8a';
          ctx.fillText(mk, it.x * TILE + 16 - camX, it.y * TILE - 96 + bobY - camY);
        }
      } else if (it.kind === 'escortcart') {
        // HỘ TỐNG: xe hàng vẽ bằng lưới 'cart' có sẵn (16 ô -> 48px,
        // căn đáy vào ô như vật trang trí), kèm tên + thanh bền.
        var erun2 = flags.escort && flags.escort.run;
        S.drawGridToCanvas(ctx, S.OBJECTS.cart, it.x * TILE + 16 - 24 - camX, (it.y + 1) * TILE - 48 - camY, 3);
        if (erun2) {
          ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
          ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
          ctx.strokeText('Xe hàng thương đội', it.x * TILE + 16 - camX, it.y * TILE - 54 - camY);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('Xe hàng thương đội', it.x * TILE + 16 - camX, it.y * TILE - 54 - camY);
          ctx.fillStyle = '#400000';
          ctx.fillRect(it.x * TILE + 16 - 24 - camX, it.y * TILE - 50 - camY, 48, 6);
          ctx.fillStyle = (erun2.cartHp / erun2.cartMax) > 0.35 ? '#e8a33c' : '#e33';
          ctx.fillRect(it.x * TILE + 16 - 24 - camX, it.y * TILE - 50 - camY, 48 * Math.max(0, erun2.cartHp) / erun2.cartMax, 6);
        }
      } else if (it.kind === 'monster') {
        var m = it.m;
        // Hoạt ảnh thật theo MONSTER_FRAMES: death > hit > attack > move > idle,
        // 20 frame mỗi hành động; dọc dùng front, ngang dùng left/right.
        var act = 'idle', fps = 8;
        if (m.dying) { act = 'death'; fps = 28; }
        else if (m.hitT > 0) { act = 'hit'; fps = 20; }
        else if (m.atkT > 0) { act = 'attack'; fps = 14; }
        else if (m.vx || m.vy) {
          act = 'move';
          fps = m.type === 'ran_luc' ? 16 : (m.type === 'khi_mat_do' || m.type === 'tho_hoang' ? 7 : 12);
        } else if (m.type === 'ran_luc') { act = 'move'; fps = 16; } // rắn trườn liên tục kể cả khi đứng
        // V8: ca 4 huong deu co sheet AI that (truoc/sau sinh moi o art-v8,
        // ngang giu sheet art-v7) va du 5 dong tac o moi huong doc.
        // Chon view: truc van toc hien tai quyet; neu dang doc thi theo vy,
        // neu dang ngang thi theo truc da chot (faceAxis) de khong nhay view.
        var vDomNow = Math.abs(m.vy || 0) > Math.abs(m.vx || 0);
        var faceView = vDomNow ? ((m.vy || 0) < 0 ? 'back' : 'front')
          : (m.faceAxis === 'v' ? (m.faceV || 'front') : (m.face || 'right'));
        var mDir = faceView;
        // V10: frame FLOAT — tư thế nội suy liên tục giữa 2 keyframe kề ở
        // tầng render (sheet: crossfade; lưới: blend raster đã cache).
        var fF = (m.animT || 0) * fps;
        var fIdx = Math.floor(fF) % 20;
        if (m.dying) { fF = Math.min(19, (0.7 - Math.max(0, m.deadT)) / 0.7 * 20); fIdx = Math.floor(fF); }
        // Mức Cao/Trung bình vẽ bằng sheet ảnh AI (20 frame/dải); sheet chưa
        // nạp xong hoặc mức Thấp thì vẽ lưới ký tự như trước.
        var mPxW = 0, mPxH = 0, drewAI = false;
        // ĐẠI HỘI: đệ tử đối thủ là NGƯỜI — vẽ bằng sheet hero theo giới
        // tính/xuất thân của đệ tử (như người chơi khác ở net peers);
        // hụt sheet/mức Thấp thì rơi về thân quái dạng người như cũ.
        if (m.discHero && gfxLevel !== 'thap' && HAI) {
          var dhView = faceView === 'front' ? 'down' : (faceView === 'back' ? 'up' : faceView);
          var dhAct = m.dying ? 'death' : (act === 'move' ? 'walk' : (act === 'attack' ? 'slash1' : act));
          var dhSheet = getHeroSheet(gfxLevel, m.discHero.gender, m.discHero.origin, dhView + '-' + dhAct);
          var dhInfo = HAI.types[m.discHero.gender + '_' + m.discHero.origin];
          if (dhSheet && dhInfo) {
            var dhCell = gfxLevel === 'cao' ? dhInfo.cellCao : dhInfo.cellTrung;
            var dhDx = m.x * TILE + 16 - 48 - camX, dhDy = m.y * TILE + 28 - 96 - camY;
            var dhDrew = false;
            if (SM) dhDrew = SM.drawSheetBlend(ctx, dhSheet, fF, 20, dhCell, dhDx, dhDy, 96, 96, { flip: dhView === 'left', wrap: !m.dying });
            else if (dhView === 'left') {
              ctx.save(); ctx.translate(dhDx + 96, dhDy); ctx.scale(-1, 1);
              ctx.drawImage(dhSheet, fIdx * dhCell, 0, dhCell, dhCell, 0, 0, 96, 96);
              ctx.restore(); dhDrew = true;
            } else {
              ctx.drawImage(dhSheet, fIdx * dhCell, 0, dhCell, dhCell, dhDx, dhDy, 96, 96);
              dhDrew = true;
            }
            if (dhDrew) { mPxW = 96; mPxH = 96; drewAI = true; }
          }
        }
        if (!drewAI && gfxLevel !== 'thap' && MAI) {
          var aiView = faceView === 'left' ? 'right' : faceView;
          // Boss thế giới có sheet THIẾT KẾ RIÊNG (tools/art-bosses.py,
          // types 'boss_<id>' trong monster-ai.js): dùng khi có, chưa có
          // thì giữ nguyên hành vi cũ (loài gốc phóng lớn + hào quang).
          // 4DIR 30/10: 3 boss doi thiet ke dat khoa type ngan hon id
          // (boss_thiet_bi / boss_co_mang / boss_thiet_bi_ma) nen truoc
          // day KHONG BAO GIO duoc chon — bang alias noi dung sheet cua
          // chung (du 4 huong nhu cac boss thiet ke con lai).
          var BOSS_SHEET_ALIAS = { thiet_bi_vuong: 'boss_thiet_bi', co_mang_vuong: 'boss_co_mang', thiet_bi_ma_vuong: 'boss_thiet_bi_ma' };
          var aiType = (m.worldBoss && MAI.types['boss_' + m.worldBoss]) ? 'boss_' + m.worldBoss
            : (m.worldBoss && BOSS_SHEET_ALIAS[m.worldBoss] && MAI.types[BOSS_SHEET_ALIAS[m.worldBoss]]) ? BOSS_SHEET_ALIAS[m.worldBoss]
            : m.type;
          var aiSheet = getMonsterSheet(gfxLevel, aiType, aiView + '-' + act);
          if (aiSheet) {
            var aiT = MAI.types[aiType];
            var aiCell = gfxLevel === 'cao' ? aiT.cellCao : aiT.cellTrung;
            // PHẦN 7 SỬA LẠI (Bui chốt 22:17 30/10 "Giữ boss theo ảnh
            // trước"): boss thế giới GIỮ cỡ TO đã duyệt — sheet boss_*
            // VẪN nhân hệ số riêng của từng boss trong bosses.js
            // (Hầu Vương 136x1,5 = 204px). Chuẩn chiều cao vẽ
            // 180-224px đạt bằng cách chỉnh hệ số của đúng những con
            // ngoài chuẩn trong bosses.js, khóa bởi
            // tools/check-boss-scale.js. KHÔNG ép scale về 1 ở đây.
            var bsc = m.scale || 1;
            var dW = Math.round(aiT.dispW * bsc), dH = Math.round(aiT.dispH * bsc);
            var adx = m.x * TILE + 16 - dW / 2 - camX;
            var ady = m.y * TILE + 28 - dH - camY;
            if (SM) {
              drewAI = SM.drawSheetBlend(ctx, aiSheet, fF, 20, aiCell, adx, ady, dW, dH, { flip: mDir === 'left', wrap: !m.dying });
            } else if (mDir === 'left') {
              ctx.save();
              ctx.translate(adx + dW, ady);
              ctx.scale(-1, 1);
              ctx.drawImage(aiSheet, fIdx * aiCell, 0, aiCell, aiCell, 0, 0, dW, dH);
              ctx.restore();
              drewAI = true;
            } else {
              ctx.drawImage(aiSheet, fIdx * aiCell, 0, aiCell, aiCell, adx, ady, dW, dH);
              drewAI = true;
            }
            if (drewAI) { mPxW = dW; mPxH = dH; }
          }
        }
        if (!drewAI) {
          // V10: mức Thấp vẽ qua TẦNG NỘI SUY LƯỚI — raster cache theo
          // (loài, hành động, hướng, frame, scale) + crossfade frame kề;
          // hụt cache/module thì rơi về đường cũ nguyên vẹn bên dưới.
          var mGridDir = mDir === 'back' ? 'front' : mDir;
          var drewGrid = false;
          if (SM && S.monsterFramePx) {
            var spM = SM.splitFrame(fF, 20, !m.dying);
            var mScaleR = 3 * (m.scale || 1) * (MON_GRID_SCALE[m.type] || 1);
            var keyMA = 'mon|' + m.type + '|' + act + '|' + mGridDir + '|' + spM.i0 + '|' + mScaleR;
            var keyMB = 'mon|' + m.type + '|' + act + '|' + mGridDir + '|' + spM.i1 + '|' + mScaleR;
            var entMA = { key: keyMA, gen: null }, entMB = { key: keyMB, gen: null };
            if (!SM.gridGet(keyMA)) entMA.gen = (function (t2, a2, i2, d2) { return function () { return S.monsterFramePx(t2, a2, i2, d2); }; })(m.type, act, spM.i0, mGridDir);
            if (spM.frac > 0.003 && spM.i1 !== spM.i0 && !SM.gridGet(keyMB)) entMB.gen = (function (t2, a2, i2, d2) { return function () { return S.monsterFramePx(t2, a2, i2, d2); }; })(m.type, act, spM.i1, mGridDir);
            var rsM = SM.drawGridBlend(ctx, entMA, entMB, spM.frac, m.x * TILE + 16 - camX, m.y * TILE + 28 - camY, mScaleR);
            if (rsM) { drewGrid = true; mPxW = rsM.w; mPxH = rsM.h; }
          }
          if (!drewGrid) {
          // V7.1: vẽ qua monsterFramePx (đã hàn liền khối + khóa chân
          // chạm đáy lưới) thay cho lưới thô; lưới thô chỉ là dự phòng.
          var mPxGrid = S.monsterFramePx ? S.monsterFramePx(m.type, act, fIdx, mDir === 'back' ? 'front' : mDir) : null;
          if (mPxGrid) {
            var mSizeP = mPxGrid.length;
            var mPxP = Math.round(mSizeP * 3 * (m.scale || 1) * (MON_GRID_SCALE[m.type] || 1));
            S.drawPixelsToCanvas(ctx, mPxGrid, m.x * TILE + 16 - mPxP / 2 - camX, m.y * TILE + 28 - mPxP - camY, 3 * (m.scale || 1) * (MON_GRID_SCALE[m.type] || 1));
            mPxW = mPxP; mPxH = mPxP;
          } else {
            var mGrid = S.monsterFrame(m.type, act, fIdx, mDir === 'back' ? 'front' : mDir);
            var mSize = mGrid.length;
            var msc = 3 * (m.scale || 1) * (MON_GRID_SCALE[m.type] || 1);
            var mPx = mSize * msc;
            S.drawGridToCanvas(ctx, mGrid, m.x * TILE + 16 - mPx / 2 - camX, m.y * TILE + 28 - mPx - camY, msc);
            mPxW = mPx; mPxH = mPx;
          }
          }
        }
        m._dw = mPxW; m._dh = mPxH; // PHẦN 7: cache bề ngang vẽ thật — lượt vẽ bóng (đi trước thân) của khung sau dùng để tính rx bóng theo cỡ quái, hết khóa cứng 16px. _dh: chiều cao thân thật cho hộp trúng đòn (monsterBodyBox).
        if (m.freezeT > 0) {
          // Lớp băng phủ khi bị Băng Phong đóng băng.
          ctx.fillStyle = 'rgba(160,215,255,0.45)';
          ctx.fillRect(m.x * TILE + 16 - mPxW / 2 - camX, m.y * TILE + 28 - mPxH - camY, mPxW, mPxH);
          ctx.strokeStyle = 'rgba(230,248,255,0.8)';
          ctx.lineWidth = 1;
          ctx.strokeRect(m.x * TILE + 16 - mPxW / 2 - camX, m.y * TILE + 28 - mPxH - camY, mPxW, mPxH);
        }
        if (m.worldBoss) {
          // Hào quang boss thế giới: quầng lửa đỏ nhấp nháy dưới chân.
          ctx.save();
          ctx.globalAlpha = 0.28 + 0.18 * Math.sin((m.animT || 0) * 4);
          ctx.fillStyle = '#ff5a3c';
          ctx.beginPath();
          ctx.arc(m.x * TILE + 16 - camX, m.y * TILE + 26 - camY, mPxW * 0.52, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        ctx.strokeText(m.name, m.x * TILE + 16 - camX, m.y * TILE + 28 - mPxH - 4 - camY);
        ctx.fillStyle = m.boss ? '#ffb0a0' : (m.elite ? '#ffd94a' : '#ffe9c9');
        ctx.fillText(m.name, m.x * TILE + 16 - camX, m.y * TILE + 28 - mPxH - 4 - camY);
        if (!m.dying && m.hp < m.maxHp) {
          ctx.fillStyle = '#400000';
          ctx.fillRect(m.x * TILE + 16 - 18 - camX, m.y * TILE - 28 - camY, 36, 5);
          ctx.fillStyle = '#e33';
          ctx.fillRect(m.x * TILE + 16 - 18 - camX, m.y * TILE - 28 - camY, 36 * m.hp / m.maxHp, 5);
        }
      } else if (it.kind === 'tideally') {
        // Đệ tử đồng minh: NGƯỜI — vẽ bằng sheet hero theo giới tính/xuất
        // thân của đệ tử (như đối thủ Đại Hội); hụt sheet/mức Thấp thì
        // rơi về lưới đệ tử phái. Tên + tông + thanh HP trên đầu.
        var al = it.ally;
        var aAct = (al.atkAnimT > 0) ? 'slash1' : ((al.vx || al.vy) ? 'walk' : 'idle');
        var aView = (Math.abs(al.vy || 0) > Math.abs(al.vx || 0) && (al.vx || al.vy)) ? ((al.vy || 0) < 0 ? 'up' : 'down') : (al.face || 'right');
        var aFF = (al.animT || 0) * (aAct === 'walk' ? 10 : 7);
        var aFIdx = Math.floor(aFF) % 20;
        var aDrew = false;
        if (gfxLevel !== 'thap' && HAI) {
          var aSheet = getHeroSheet(gfxLevel, al.gender, al.origin, aView + '-' + aAct);
          var aInfo = HAI.types[al.gender + '_' + al.origin];
          if (aSheet && aInfo) {
            var aCell = gfxLevel === 'cao' ? aInfo.cellCao : aInfo.cellTrung;
            var aDx = al.x * TILE + 16 - 48 - camX, aDy = al.y * TILE + 28 - 96 - camY;
            if (SM) aDrew = SM.drawSheetBlend(ctx, aSheet, aFF, 20, aCell, aDx, aDy, 96, 96, { flip: aView === 'left', wrap: true });
            else if (aView === 'left') {
              ctx.save(); ctx.translate(aDx + 96, aDy); ctx.scale(-1, 1);
              ctx.drawImage(aSheet, aFIdx * aCell, 0, aCell, aCell, 0, 0, 96, 96);
              ctx.restore(); aDrew = true;
            } else {
              ctx.drawImage(aSheet, aFIdx * aCell, 0, aCell, aCell, aDx, aDy, 96, 96);
              aDrew = true;
            }
          }
        }
        if (!aDrew && S.NPC.de_tu_phai) {
          S.drawGridToCanvas(ctx, S.NPC.de_tu_phai.grid, al.x * TILE + 16 - 48 - camX, al.y * TILE + 28 - 96 - camY, 3);
        }
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        ctx.strokeText(al.name, al.x * TILE + 16 - camX, al.y * TILE - 68 - camY);
        ctx.fillStyle = '#bfe3ff';
        ctx.fillText(al.name, al.x * TILE + 16 - camX, al.y * TILE - 68 - camY);
        if (al.hp < al.maxHp) {
          ctx.fillStyle = '#203020';
          ctx.fillRect(al.x * TILE + 16 - 18 - camX, al.y * TILE - 64 - camY, 36, 5);
          ctx.fillStyle = '#5ec95e';
          ctx.fillRect(al.x * TILE + 16 - 18 - camX, al.y * TILE - 64 - camY, 36 * Math.max(0, al.hp) / al.maxHp, 5);
        }
      } else if (it.kind === 'pet') {
        var pInst = activePetInst();
        var pDef2 = PETS.species(pInst.sp);
        var pDown = PETS.isDowned(pInst);
        var pAct = 'idle', pFps = 8;
        if (pDown) pAct = 'death';
        else if (petEnt.hitT > 0) { pAct = 'hit'; pFps = 20; }
        else if (petEnt.atkT > PETS.VIEW.atkInterval - 0.3) { pAct = 'attack'; pFps = 14; }
        else if (Math.abs(petEnt.vx) > 6 || Math.abs(petEnt.vy) > 6) { pAct = 'move'; pFps = 12; }
        else if (pDef2.move === 'slither' || pDef2.move === 'swim' || pDef2.move === 'fly') { pAct = 'move'; pFps = 10; }
        var pView = (Math.abs(petEnt.vy) > Math.abs(petEnt.vx)) ? petEnt.faceV : petEnt.face;
        var pInfo = PAI && PAI.types ? PAI.types[pInst.sp] : null;
        // 4DIR (lenh Bui 05:59 30/10): chon sheet theo huong THAT ca 4 huong.
        // front/right = sheet 20 frame; left = lat guong sheet right (goc
        // nhin ngang chuan); back = sheet sau lung THAT 60 frame khi loai
        // co (types[id].back + backFrames) — toc do phat nhan theo ti le
        // frame de chu ky 60 frame dai bang chu ky 20 frame cua cac huong
        // khac; loai chua co thi tam dung anh front nhu ban truoc.
        var pKey = null, pFlip = false;
        if (pView === 'front') pKey = pAct === 'death' ? 'right-death' : (pAct === 'hit' ? 'front-attack' : 'front-' + pAct);
        else if (pView === 'back') pKey = (pInfo && pInfo.back) ? 'back-' + pAct : (pAct === 'death' ? 'right-death' : (pAct === 'hit' ? 'front-attack' : 'front-' + pAct));
        else if (pView === 'left') { pKey = 'right-' + pAct; pFlip = true; }
        else pKey = 'right-' + pAct;
        var pFrames = petStripFrames(pInfo, pKey); // PET-ENG: front/right R1 = 60 frame như back
        var pFF = pDown ? pFrames - 1 : petEnt.animT * pFps * (pFrames / 20);
        var pIdx = Math.floor(pFF) % pFrames;
        var dWp = pInfo ? pInfo.dispW : 84, dHp = pInfo ? pInfo.dispH : 84;
        // TIẾN HOÁ: hình thái tiến hoá vẽ lớn hơn 15% (chưa có sprite
        // riêng — xem story-bible mục 37).
        if (PETS.isEvolved(pInst)) { dWp *= 1.15; dHp *= 1.15; }
        var pDx = petEnt.x - dWp / 2 - camX, pDy = petEnt.y - dHp - camY;
        var drewPet = false;
        if (gfxLevel !== 'thap' && PAI) {
          var key = pKey, flip = pFlip;
          var pSheet = getPetSheet(gfxLevel, pInst.sp, key);
          if (pSheet) {
            var pCell = gfxLevel === 'cao' ? pInfo.cellCao : pInfo.cellTrung;
            if (SM && !pDown) {
              drewPet = SM.drawSheetBlend(ctx, pSheet, pFF, pFrames, pCell, pDx, pDy, dWp, dHp, { flip: flip, wrap: true });
            } else if (flip) {
              ctx.save();
              ctx.translate(pDx + dWp, pDy);
              ctx.scale(-1, 1);
              ctx.drawImage(pSheet, pIdx * pCell, 0, pCell, pCell, 0, 0, dWp, dHp);
              ctx.restore();
              drewPet = true;
            } else {
              ctx.drawImage(pSheet, pIdx * pCell, 0, pCell, pCell, pDx, pDy, dWp, dHp);
              drewPet = true;
            }
          }
        }
        if (!drewPet) {
          // Mức Thấp / sheet chưa nạp: vẽ qua TẦNG NỘI SUY LƯỚI của smooth.js
          // (crossfade 2 frame kề + raster cache) như quái; hụt module thì
          // rơi về vẽ lưới nguyên frame.
          var pgScale = dWp / 28;
          var drewPG = false;
          if (SM) {
            var spP = SM.splitFrame(pFF, 20, !pDown);
            var keyPA = 'pet|' + pInst.sp + '|' + pAct + '|' + pView + '|' + spP.i0 + '|' + pgScale;
            var keyPB = 'pet|' + pInst.sp + '|' + pAct + '|' + pView + '|' + spP.i1 + '|' + pgScale;
            var entPA = { key: keyPA, gen: null }, entPB = { key: keyPB, gen: null };
            if (!SM.gridGet(keyPA)) entPA.gen = (function (id2, v2, a2, i2) { return function () { return petGridFrame(id2, v2, a2, i2); }; })(pInst.sp, pView, pAct, spP.i0);
            if (spP.frac > 0.003 && spP.i1 !== spP.i0 && !SM.gridGet(keyPB)) entPB.gen = (function (id2, v2, a2, i2) { return function () { return petGridFrame(id2, v2, a2, i2); }; })(pInst.sp, pView, pAct, spP.i1);
            if (pDown) ctx.globalAlpha = 0.75;
            var rsP = SM.drawGridBlend(ctx, entPA, entPB, spP.frac, petEnt.x - camX, petEnt.y - camY, pgScale);
            if (pDown) ctx.globalAlpha = 1;
            drewPG = !!rsP;
          }
          if (!drewPG) {
            var pg = petGridFrame(pInst.sp, pView, pAct, pIdx);
            if (pg) {
              if (pDown) ctx.globalAlpha = 0.75;
              S.drawPixelsToCanvas(ctx, pg, petEnt.x - dWp / 2 - camX, petEnt.y - dHp - camY, pgScale);
              ctx.globalAlpha = 1;
            }
          }
        }
        // Tên + cấp trên đầu thú; thanh HP khi bị thương; nhãn khi gục.
        ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        var pName = PETS.displayNameOf(pInst) + ' Cấp ' + pInst.level + (pDown ? ' (gục)' : '');
        ctx.strokeText(pName, petEnt.x - camX, petEnt.y - dHp - 4 - camY);
        ctx.fillStyle = pDown ? '#ff9a8a' : (PETS.isEvolved(pInst) ? '#ffd94a' : '#c9f2c0');
        ctx.fillText(pName, petEnt.x - camX, petEnt.y - dHp - 4 - camY);
        if (!pDown && pInst.hp < PETS.maxHpOf(pInst)) {
          ctx.fillStyle = '#400000';
          ctx.fillRect(petEnt.x - 16 - camX, petEnt.y - dHp + 3 - camY, 32, 4);
          ctx.fillStyle = '#7dff8a';
          ctx.fillRect(petEnt.x - 16 - camX, petEnt.y - dHp + 3 - camY, 32 * pInst.hp / PETS.maxHpOf(pInst), 4);
        }
      } else if (it.kind === 'companion') {
        // ĐỒNG HÀNH: vẽ bằng sheet NPC idle của tông (4 hướng thật,
        // chân chạm đất như NPC đứng — không có dải đi/bay riêng nên
        // không tự bịa chuyển động; sheet chưa nạp thì rơi về lưới NPC).
        var cDef = activeCompanionDef();
        var cDown = COMP.isDowned(flags);
        var cView = (Math.abs(compEnt.vy) > Math.abs(compEnt.vx)) ? (compEnt.faceV === 'back' ? 'up' : 'down') : compEnt.face;
        var cDrew = false;
        if (gfxLevel !== 'thap' && NAI && NAI.types && NAI.types[cDef.sprite]) {
          var cSheet = getNpcSheet(gfxLevel, cDef.sprite, cView + '-idle');
          var cFlip = false;
          if (!cSheet && cView === 'left') { cSheet = getNpcSheet(gfxLevel, cDef.sprite, 'right-idle'); cFlip = !!cSheet; }
          if (cSheet) {
            var cInfo = NAI.types[cDef.sprite];
            var cCell = gfxLevel === 'cao' ? cInfo.cellCao : cInfo.cellTrung;
            var cDx = compEnt.x - 48 - camX, cDy = compEnt.y - 96 - camY;
            var cFF = compEnt.animT * 8;
            if (cDown) ctx.globalAlpha = 0.6;
            if (SM) cDrew = SM.drawSheetBlend(ctx, cSheet, cFF, 20, cCell, cDx, cDy, 96, 96, { flip: cFlip, wrap: true });
            else if (cFlip) {
              ctx.save(); ctx.translate(cDx + 96, cDy); ctx.scale(-1, 1);
              ctx.drawImage(cSheet, Math.floor(cFF) % 20 * cCell, 0, cCell, cCell, 0, 0, 96, 96); ctx.restore(); cDrew = true;
            } else {
              ctx.drawImage(cSheet, Math.floor(cFF) % 20 * cCell, 0, cCell, cCell, cDx, cDy, 96, 96); cDrew = true;
            }
            if (cDown) ctx.globalAlpha = 1;
          }
        }
        if (!cDrew) {
          var cGrid = (S.NPC[cDef.sprite] && S.NPC[cDef.sprite].grid) || (S.NPC.de_tu_phai && S.NPC.de_tu_phai.grid);
          if (cGrid) {
            if (cDown) ctx.globalAlpha = 0.6;
            S.drawGridToCanvas(ctx, cGrid, compEnt.x - 48 - camX, compEnt.y - 96 - camY, 3);
            if (cDown) ctx.globalAlpha = 1;
          }
        }
        // Tên + tông trên đầu; thanh HP khi bị thương; nhãn khi gục.
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        var cName = cDef.name + ' (' + cDef.sectName + ')' + (cDown ? ' (gục)' : '');
        ctx.strokeText(cName, compEnt.x - camX, compEnt.y - 100 - camY);
        ctx.fillStyle = cDown ? '#ff9a8a' : '#c9f2c0';
        ctx.fillText(cName, compEnt.x - camX, compEnt.y - 100 - camY);
        var cSt = COMP.ensure(flags);
        var cHp = (cSt.hp === null || cSt.hp === undefined) ? COMP.maxHpOf(ch) : cSt.hp;
        if (!cDown && cHp < COMP.maxHpOf(ch)) {
          ctx.fillStyle = '#400000';
          ctx.fillRect(compEnt.x - 18 - camX, compEnt.y - 96 - camY, 36, 5);
          ctx.fillStyle = '#7dff8a';
          ctx.fillRect(compEnt.x - 18 - camX, compEnt.y - 96 - camY, 36 * Math.max(0, cHp) / COMP.maxHpOf(ch), 5);
        }
      } else if (it.kind === 'peer') {
        // Người chơi khác: CÙNG đường render như nhân vật chính (sheet AI
        // theo giới tính/xuất thân + nội suy mượt, hụt thì lưới pixel),
        // nhãn tên + cảnh giới qua hệ chống chồng nhãn. Chỉ HIỆN DIỆN:
        // không thanh máu, không va chạm, không chiến đấu (pha P1).
        var pr = it.peer;
        var drewPeer = false;
        if (gfxLevel !== 'thap' && HAI) {
          var prSet = pr.dir + '-' + (pr.moving ? 'walk' : 'idle');
          var prSheet = getHeroSheet(gfxLevel, pr.gender, pr.origin, prSet);
          if (prSheet) {
            var prInfo = HAI.types[pr.gender + '_' + pr.origin];
            var prCell = gfxLevel === 'cao' ? prInfo.cellCao : prInfo.cellTrung;
            if (SM) drewPeer = SM.drawSheetBlend(ctx, prSheet, pr.phase, 20, prCell, pr.x - 48 - camX, pr.y - 96 - camY, prInfo.dispW, prInfo.dispH, { wrap: true });
            else {
              ctx.drawImage(prSheet, Math.floor(pr.phase) % 20 * prCell, 0, prCell, prCell, pr.x - 48 - camX, pr.y - 96 - camY, prInfo.dispW, prInfo.dispH);
              drewPeer = true;
            }
          }
        }
        if (!drewPeer) {
          var prFr = pr.moving ? S.walkFrame(pr.gender, pr.dir, Math.floor(pr.phase) % 20, pr.origin)
                               : S.idleFrame(pr.gender, pr.dir, pr.phase / 8, pr.origin);
          if (prFr) S.drawPixelsToCanvas(ctx, prFr, pr.x - 48 - camX, pr.y - 96 - camY, 3);
        }
        npcLabels.push({ name: pr.name, cx: pr.x - camX, y: pr.y - 122 - camY });
        ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 2; ctx.strokeStyle = '#202020';
        ctx.strokeText(pr.realm, pr.x - camX, pr.y - 107 - camY);
        ctx.fillStyle = '#9fd8ff';
        ctx.fillText(pr.realm, pr.x - camX, pr.y - 107 - camY);
      } else if (it.kind === 'player') {
        // NGỰ KIẾM: đang bay thì toàn bộ hình nhân vật (thân + vũ khí + pháp
        // bảo + tên/HP) được NÂNG lên flyLift px và NGHIÊNG theo vận tốc
        // ngang; bóng đổ ở vòng bóng riêng vẫn nằm dưới đất. Đây là offset
        // của CHẾ ĐỘ BAY — không phải frame đi bộ (audit chạm đất chỉ kiểm
        // đi bộ/đứng, xem ghi chú ở biến flying).
        var flyDrawT = flyLift > 0.5 && typeof ctx.save === 'function';
        if (flyDrawT) {
          ctx.save();
          ctx.translate(px - camX, py - camY);
          if (flying) ctx.rotate(Math.max(-0.16, Math.min(0.16, pvx * 0.0006)));
          ctx.translate(-(px - camX), -(py - camY) - flyLift);
        }
        // Ưu tiên hiển thị: động tác đang chạy > tư thế thổ nạp > đi bộ > đứng thở.
        // V9: muc Cao/Trung binh ve bang SHEET AI theo DINH DANG CHUAN
        // (hero-ai/<gender>/<origin>/<dir>-<action>) cho MOI trang thai —
        // pose mirror dung keyframe/timing cua S.actionFrame; muc Thap
        // hoac sheet chua nap xong thi dung frame luoi nhu truoc. actF
        // tinh mot lan dung chung cho ca sheet AI lan lop vu khi ben duoi.
        // HÌNH THÁI CẢNH GIỚI (js/realms.js): lớp SAU lưng nhân vật
        // (vòng sáng dưới chân + quầng hào quang) vẽ trước sheet.
        if (RM && ch) RM.drawFormBack(ctx, ch, px - camX, py - camY, animClock, gfxLevel);
        var actF = -1, fr;
        var actName = null;
        if (action) { actF = Math.min(19, Math.floor(action.t / action.dur * 20)); actName = action.name; }
        else if (medActiveNow()) { actF = Math.floor(medPhase / 2.4 * 20) % 20; actName = 'meditate'; }
        var drewHeroAI = false;
        if (gfxLevel !== 'thap' && HAI) {
          var hSet = dir + '-' + (actName || (moving ? 'walk' : 'idle'));
          // TẠO HÌNH NV01–NV12 (ch.look, sheet 60 frame ở HAI.looks): có
          // look hợp lệ thì sheet gốc + thông tin ô lấy theo look; save cũ
          // không có look -> hOrigin = xuất thân, hành vi y như trước.
          // hFF/hF thang 20 GIỮ NGUYÊN cho logic + các lớp phủ (y phục
          // sưu tầm, lớp phủ cảnh giới, ngọc linh căn); riêng SHEET GỐC
          // của look dùng pha 60 (hFFb = cùng mốc thời gian x3, theo đúng
          // tiền lệ sheet trang phục cảnh giới 60 frame ở nhánh RC dưới).
          var hOrigin = ch.origin, hInfo = null;
          if (ch.look && HAI.looks && HAI.looks[ch.gender + '_' + ch.look]) {
            hOrigin = ch.look;
            hInfo = HAI.looks[ch.gender + '_' + ch.look];
          }
          // TÍCH HỢP A (01/11/2026): trang phục đang mặc có sheet dạng
          // hero look (4 bộ đợt 1, trường look trong js/wardrobe.js)
          // thì THÂN vẽ bằng look của bộ đó — đè lên look gốc của nhân
          // vật, đúng thứ tự lớp "tủ đồ trên ngoại hình gốc"; giới
          // không khớp look thì giữ nguyên như cũ (bộ vẫn tính chỉ số
          // qua statTotals nếu hasArt cho phép, hình thân không đổi).
          var wornDefA = (WD && WD.wornDef) ? WD.wornDef(ch) : null;
          if (wornDefA && wornDefA.look && wornDefA.lookGender === ch.gender &&
              HAI.looks && HAI.looks[ch.gender + '_' + wornDefA.look]) {
            hOrigin = wornDefA.look;
            hInfo = HAI.looks[ch.gender + '_' + wornDefA.look];
          }
          if (!hInfo) hInfo = (HAI.types && HAI.types[ch.gender + '_' + ch.origin]) ||
            { cellCao: 192, cellTrung: 120, dispW: 96, dispH: 96 };
          var hSheet = getHeroSheet(gfxLevel, ch.gender, hOrigin, hSet);
          // DIR8: sheet GỐC dùng dải CHÉO THẬT khi hướng hiển thị là
          // hướng chéo + look có bộ chéo cho action này (hiện chỉ
          // NV13: idle/walk/slash1-3, qua D8.heroSetFor). Dải chéo 60
          // frame, cell bằng cell của look nên hCell/hFFb dùng chung
          // như cũ. Mọi LỚP PHỦ (tủ đồ, trang phục cảnh giới, đồ
          // tông, ngọc linh căn) vẫn dùng hSet 4 hướng — chưa có asset
          // chéo. Chưa nạp kịp dải chéo -> giữ sheet 4 hướng lần này.
          if (D8 && hSheet && dir8 !== dir) {
            var d8sel = D8.heroSetFor(HAI, ch.gender + '_' + hOrigin, dir8,
              actName || (moving ? 'walk' : 'idle'));
            if (d8sel.diag) {
              var d8sheet = getHeroDiagSheet(gfxLevel, ch.gender + '_' + hOrigin, d8sel.set);
              if (d8sheet) hSheet = d8sheet;
            }
          }
          var hCell = gfxLevel === 'cao' ? hInfo.cellCao : hInfo.cellTrung;
          var hF = actName ? actF : (moving ? walkFrameIdx : Math.floor(idleT * 8) % 20);
          // V10: frame FLOAT + crossfade — actF nguyên ở trên GIỮ NGUYÊN
          // cho điểm tay/logic (mốc f8/f10/f15 theo thời gian không đổi);
          // chỉ lớp VẼ dùng hFF liên tục.
          var hFF = actName === 'meditate' ? (medPhase / 2.4 * 20) % 20
            : actName ? Math.min(19, action.t / action.dur * 20)
            : (moving ? SM ? SM.wrap20(walkPhase) : walkFrameIdx : (idleT * 8) % 20);
          var hFrames = hInfo.frames || 20;
          var hFFb = hFrames === 20 ? hFF
            : actName === 'meditate' ? (medPhase / 2.4 * 60) % 60
            : actName ? Math.min(59, action.t / action.dur * 60)
            : (moving ? (SM ? SM.wrap20(walkPhase) * 3 : (walkFrameIdx * 3) % 60) : (idleT * 24) % 60);
          var hFb = hFrames === 20 ? hF : Math.min(hFrames - 1, Math.floor(hFFb));
          // TRANG PHỤC CẢNH GIỚI THIẾT KẾ RIÊNG (js/realm-costumes.js, lệnh
          // Bui 06:11 2026-10-30): từ Trúc Cơ (realmRank >= 2), khi KHÔNG
          // mặc y phục sưu tầm (tủ đồ vẫn ưu tiên cao nhất), nhân vật mặc
          // SHEET TRANG PHỤC RIÊNG của bậc + giới (60 frame — cùng chu kỳ
          // chuyển động lấy mẫu 60 pha, moc frame float = hFF x 3) THAY
          // sheet gốc + lớp phủ đổi màu cũ. Sheet chưa nạp xong -> rơi về
          // đúng hành vi cũ ở nhánh dưới. Ngọc linh căn vẫn vẽ trên cùng.
          var rcDrew = false;
          if (RC) {
            var wornPre = (WD && typeof WD.wornId === 'function') ? WD.wornId(ch) : null;
            var rkPre = (M && typeof M.realmRankOf === 'function') ? M.realmRankOf(ch) : 0;
            if (!wornPre && rkPre >= 2 && RC.costumeId(rkPre, ch.gender)) {
              var rcSheet = getRealmCostumeSheet(gfxLevel, rkPre, ch.gender, hSet);
              if (rcSheet) {
                var rcCell = gfxLevel === 'cao' ? 192 : 120;
                var rcFF = actName === 'meditate' ? (medPhase / 2.4 * 60) % 60
                  : actName ? Math.min(59, action.t / action.dur * 60)
                  : (moving ? (SM ? SM.wrap20(walkPhase) * 3 : (walkFrameIdx * 3) % 60) : (idleT * 24) % 60);
                if (SM) rcDrew = SM.drawSheetBlend(ctx, rcSheet, rcFF, 60, rcCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                  { wrap: !actName || actName === 'meditate' });
                else {
                  ctx.drawImage(rcSheet, Math.min(59, Math.floor(rcFF)) * rcCell, 0, rcCell, rcCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
                  rcDrew = true;
                }
                if (rcDrew) {
                  drewHeroAI = true;
                  if (HRM && ch.root) {
                    var gSheetR = getGemSheet(gfxLevel, ch.root, ch.gender, hSet);
                    if (gSheetR) {
                      var gCellR = gfxLevel === 'cao' ? HRM.cellCao : HRM.cellTrung;
                      if (SM) SM.drawSheetBlend(ctx, gSheetR, hFF, 20, gCellR, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                        { wrap: !actName || actName === 'meditate' });
                      else ctx.drawImage(gSheetR, hF * gCellR, 0, gCellR, gCellR, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
                    }
                  }
                }
              }
            }
          }
          if (!rcDrew && hSheet) {
            // ĐỒ TÔNG (mục 26): thay sheet gốc bằng sheet tông khi
            // SL.layerFor cho phép; pha 60 như sheet trang phục cảnh giới
            // (cùng mốc thời gian với sheet gốc). Lớp phủ tủ đồ/cảnh giới/
            // ngọc bên dưới vẫn chạy như cũ (tủ đồ đã loại ở layerFor nên
            // khối tủ đồ dưới đây thành no-op khi đang mặc đồ tông).
            var sectSheetNow = null, sectFFNow = 0;
            if (SL && flags) {
              var wornSect = (WD && typeof WD.wornId === 'function') ? WD.wornId(ch) : null;
              var rkSect = (M && typeof M.realmRankOf === 'function') ? M.realmRankOf(ch) : 0;
              if (SL.layerFor(flags, wornSect, rkSect, ch.gender)) sectSheetNow = getSectSheet(gfxLevel, flags.sectJoined, ch.gender, hSet);
              if (sectSheetNow) sectFFNow = actName === 'meditate' ? (medPhase / 2.4 * 60) % 60
                : actName ? Math.min(59, action.t / action.dur * 60)
                : (moving ? (SM ? SM.wrap20(walkPhase) * 3 : (walkFrameIdx * 3) % 60) : (idleT * 24) % 60);
            }
            if (sectSheetNow) {
              var sectCellNow = gfxLevel === 'cao' ? 192 : 120;
              if (SM) drewHeroAI = SM.drawSheetBlend(ctx, sectSheetNow, sectFFNow, 60, sectCellNow, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                { wrap: !actName || actName === 'meditate' });
              else {
                ctx.drawImage(sectSheetNow, Math.min(59, Math.floor(sectFFNow)) * sectCellNow, 0, sectCellNow, sectCellNow, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
                drewHeroAI = true;
              }
            } else if (SM) {
              drewHeroAI = SM.drawSheetBlend(ctx, hSheet, hFFb, hFrames, hCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                { wrap: !actName || actName === 'meditate' });
            } else {
              ctx.drawImage(hSheet, hFb * hCell, 0, hCell, hCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
              drewHeroAI = true;
            }
            // Y PHỤC (js/wardrobe.js): lớp phủ SƯU TẦM vẽ ĐÈ lên thân ngay
            // tại đây — cùng set/frame float/khung vẽ với sheet gốc, dưới
            // lớp vũ khí cầm tay và hào quang cảnh giới (drawFormFront vẽ
            // sau). Chưa có hình (manifest costume-ai rỗng) thì bỏ qua.
            if (drewHeroAI && WD && CAI) {
              var wornC = WD.wornId(ch);
              // TÍCH HỢP A: bộ có sheet dạng hero look đã vẽ ở lớp thân
              // (hOrigin ở trên) — không vẽ thêm lớp phủ costume-ai
              // (bộ đó không có sheet phủ, tránh nạp file không tồn tại).
              var wornDefB = wornC && WD.wornDef ? WD.wornDef(ch) : null;
              var lookBoundB = !!(wornDefB && wornDefB.look && wornDefB.lookGender === ch.gender);
              if (wornC && !lookBoundB) {
                var cSheet = getCostumeSheet(gfxLevel, wornC, ch.gender, hSet);
                if (cSheet) {
                  var cType = CAI.types[wornC];
                  var cCell = gfxLevel === 'cao' ? (cType.cellCao || 192) : (cType.cellTrung || 120);
                  if (SM) SM.drawSheetBlend(ctx, cSheet, hFF, 20, cCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                    { wrap: !actName || actName === 'meditate' });
                  else ctx.drawImage(cSheet, hF * cCell, 0, cCell, cCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
                }
              }
            }
            // Y PHỤC THEO CẢNH GIỚI (V10, team mỹ thuật): khi KHÔNG mặc
            // bộ sưu tầm nào, game TỰ áp lớp phủ trang phục theo
            // realmRank hiện tại (rank 0 Phàm Nhân = không phủ). Vẽ cùng
            // set/frame float như sheet gốc, ngay trên thân và dưới lớp
            // vũ khí. Sau đó là viên NGỌC LINH CĂN ở ngực (có cả khi mặc
            // đồ sưu tầm — linh căn là dấu ấn riêng của nhân vật).
            if (drewHeroAI && HRM) {
              var wornNow = (WD && typeof WD.wornId === 'function') ? WD.wornId(ch) : null;
              if (!wornNow) {
                var rkNow = (M && typeof M.realmRankOf === 'function') ? M.realmRankOf(ch) : 0;
                var rSheet = getRealmOvSheet(gfxLevel, ch.gender, hOrigin, rkNow, hSet);
                if (rSheet) {
                  var rCell = gfxLevel === 'cao' ? HRM.cellCao : HRM.cellTrung;
                  if (SM) SM.drawSheetBlend(ctx, rSheet, hFF, 20, rCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                    { wrap: !actName || actName === 'meditate' });
                  else ctx.drawImage(rSheet, hF * rCell, 0, rCell, rCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
                }
              }
              if (ch.root) {
                var gSheet = getGemSheet(gfxLevel, ch.root, ch.gender, hSet);
                if (gSheet) {
                  var gCell = gfxLevel === 'cao' ? HRM.cellCao : HRM.cellTrung;
                  if (SM) SM.drawSheetBlend(ctx, gSheet, hFF, 20, gCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH,
                    { wrap: !actName || actName === 'meditate' });
                  else ctx.drawImage(gSheet, hF * gCell, 0, gCell, gCell, px - 48 - camX, py - 96 - camY, hInfo.dispW, hInfo.dispH);
                }
              }
            }
          }
        }
        if (!drewHeroAI) {
          var drewHeroGrid = false;
          if (SM && (action || medActiveNow() || moving)) {
            // Lưới: blend 2 keyframe kề qua raster cache cho động tác +
            // thổ nạp + ĐI BỘ (walkFrame/actionFrame lượng tử hoá theo ô
            // pixel nên crossfade ở tầng canvas mới mượt thật ở mọi t).
            var gAct = actName || 'walk', gWrap = gAct === 'meditate' || gAct === 'walk';
            var gFF = gAct === 'meditate' ? (medPhase / 2.4 * 20) % 20
              : gAct === 'walk' ? SM.wrap20(walkPhase)
              : Math.min(19, action.t / action.dur * 20);
            var spH = SM.splitFrame(gFF, 20, gWrap);
            var keyHA = 'hero|' + ch.gender + '|' + ch.origin + '|' + dir + '|' + gAct + '|' + spH.i0;
            var keyHB = 'hero|' + ch.gender + '|' + ch.origin + '|' + dir + '|' + gAct + '|' + spH.i1;
            var entHA = { key: keyHA, gen: null }, entHB = { key: keyHB, gen: null };
            var genH = function (idx) {
              return function () {
                return gAct === 'walk'
                  ? S.walkFrame(ch.gender, dir, idx, ch.origin)
                  : S.actionFrame(ch.gender, dir, gAct, idx, ch.origin);
              };
            };
            if (!SM.gridGet(keyHA)) entHA.gen = genH(spH.i0);
            if (spH.frac > 0.003 && spH.i1 !== spH.i0 && !SM.gridGet(keyHB)) entHB.gen = genH(spH.i1);
            drewHeroGrid = !!SM.drawGridBlend(ctx, entHA, entHB, spH.frac, px - camX, py - camY, 3);
          }
          if (!drewHeroGrid) {
            if (action) {
              fr = S.actionFrame(ch.gender, dir, action.name, actF, ch.origin);
            } else if (medActiveNow()) {
              fr = S.actionFrame(ch.gender, dir, 'meditate', actF, ch.origin);
            } else if (moving) fr = S.walkFrame(ch.gender, dir, walkFrameIdx, ch.origin);
            else fr = S.idleFrame(ch.gender, dir, idleT, ch.origin);
            S.drawPixelsToCanvas(ctx, fr, px - 48 - camX, py - 96 - camY, 3);
          }
        }
        // NGỰ KIẾM: phi kiếm nằm ngang DƯỚI CHÂN khi đang bay — chính là
        // thanh kiếm đã đúc linh ở Q1 (vẽ bằng icon vũ khí thật của
        // weapons.js + quầng linh quang). Đang đeo đúng thanh đó thì lớp
        // vũ khí cầm tay bên dưới tự trống tay (kiếm đã xuống chân).
        if (flying && flyMode === 'sword' && flyLift > 1 && W && W.drawIcon) {
          var flyDef = null;
          if (flags.flight && flags.flight.forgedUid && W.findEntry) {
            var fe = W.findEntry(ch, flags.flight.forgedUid);
            if (fe) flyDef = W.WEAPONS[fe.id];
          }
          if (!flyDef) flyDef = W.equippedDef(ch);
          if (flyDef) {
            ctx.fillStyle = 'rgba(140,220,255,0.35)';
            ctx.beginPath(); ctx.ellipse(px - camX, py - 2 - camY, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
            W.drawIcon(ctx, flyDef, px - 16 - camX, py - 10 - camY + Math.sin(animClock * 3) * 1.2, 2);
          }
        }
        // MỤC 27 — NGỰ PHÁP BẢO: pháp khí Địa+ đang cưỡi vẽ to dưới chân
        // (ảnh AI thật khi có, icon pixel khi chưa nạp), kèm quầng theo phẩm.
        if (flying && flyMode === 'artifact' && flyLift > 1 && ART) {
          var flyArt = flyCtx().flyableArtifact;
          if (flyArt) {
            var ag = ART.GRADES[flyArt.grade];
            if (ag && ag.glow) { ctx.fillStyle = ag.glow; ctx.globalAlpha = 0.30; ctx.beginPath(); ctx.ellipse(px - camX, py - 4 - camY, 26, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
            if (ART.drawIconArt) ART.drawIconArt(ctx, flyArt, px - 24 - camX, py - 44 - camY + Math.sin(animClock * 3) * 1.2, 48, gfxLevel);
            else if (ART.drawIcon) ART.drawIcon(ctx, flyArt, px - 24 - camX, py - 44 - camY, 3);
          }
        }
        // MỤC 27 — NGỰ LINH THÚ: thú xuất chiến vẽ dưới chân chủ bằng
        // đúng sheet của nó (hướng theo hướng mặt của chủ, dải move; mức
        // Thấp thì khối vẽ thú đi theo vẫn chạy, chỉ không vẽ thêm ở đây).
        if (flying && flyMode === 'pet' && flyLift > 1) {
          var ridePet = activePetInst();
          if (ridePet && PAI && PAI.types && PAI.types[ridePet.sp]) {
            var rInfo = PAI.types[ridePet.sp];
            var rKey = dir === 'up' ? 'back-move' : (dir === 'left' ? 'right-move' : (dir === 'right' ? 'right-move' : 'front-move'));
            var rFlip = dir === 'left';
            var rSheet = getPetSheet(gfxLevel, ridePet.sp, rKey);
            if (rSheet) {
              var rCell = gfxLevel === 'cao' ? rInfo.cellCao : rInfo.cellTrung;
              var rFrames = petStripFrames(rInfo, rKey); // PET-ENG: front/right R1 = 60 frame như back
              var rIdx = Math.floor(petEnt.animT * 12 * (rFrames / 20)) % rFrames;
              var rWp = rInfo.dispW || 84, rHp = rInfo.dispH || 84;
              if (rFlip) { ctx.save(); ctx.translate(px - camX + rWp / 2, py - rHp - camY); ctx.scale(-1, 1); ctx.drawImage(rSheet, rIdx * rCell, 0, rCell, rCell, -rWp / 2, 0, rWp, rHp); ctx.restore(); }
              else ctx.drawImage(rSheet, rIdx * rCell, 0, rCell, rCell, px - rWp / 2 - camX, py - rHp - camY, rWp, rHp);
            }
          }
        }
        // Lớp vũ khí cầm tay bám theo ĐIỂM TAY của frame hiện tại: khi vung
        // kiếm, anchor tay được quay cùng cánh tay (S.actionHandPoint) nên
        // vệt kiếm của hiệu ứng và lưỡi kiếm luôn đi cùng nhau.
        if (W) {
          var heldDef = W.equippedDef(ch);
          // Đang bay mà món đang đeo CHÍNH LÀ phi kiếm dưới chân -> tay trống.
          if (heldDef && flying && flags.flight && flags.flight.forgedUid && W.equippedEntry) {
            var eqE = W.equippedEntry(ch);
            if (eqE && eqE.uid === flags.flight.forgedUid) heldDef = null;
          }
          if (heldDef) {
            var orbitOn = effects.some(function (e) { return e.mech === 'orbit'; });
            if (action && action.name === 'death') {
              // Đang ngã: không vẽ vũ khí trên tay.
            } else if (orbitOn && !(action && action.name === 'toss')) {
              // Kiếm đang bay quanh người (Ngự Kiếm): tay không còn cầm.
            } else if (action && S.actionHandPoint && W.HAND && W.drawHeldAt) {
              var wDir = action.name === 'spin' ? S.spinDir(dir, actF) : dir;
              var hnd = W.HAND[wDir];
              var hp2 = hnd ? S.actionHandPoint(wDir, action.name, actF, hnd.gx, hnd.gy) : null;
              if (hp2) W.drawHeldAt(ctx, heldDef, wDir, px - camX - 48 + hp2.x * 3, py - camY - 96 + hp2.y * 3, gfxLevel);
              else if (action.name !== 'toss') W.drawHeld(ctx, heldDef, dir, px - camX, py - camY, gfxLevel);
              // toss sau frame 15: kiếm đã rời tay (đang bay) -> không vẽ.
            } else if (W.HAND && W.drawHeldAt) {
              // Đi bộ/đứng yên/thổ nạp: anchor tay bám nhún thân của frame.
              var hnd3 = W.HAND[dir];
              var wob = 0;
              if (medActiveNow()) wob = 18; // ngồi xuống: tay hạ theo thân (+6 ô lưới)
              // V7.1: wob khớp bob mới của walkFrame (<=1 ô lưới) và
              // idleFrame mới (tay ghim cùng thân, wob = 0 khi đứng thở).
              else if (moving) wob = -Math.round(Math.abs(Math.cos(walkFrameIdx / 20 * Math.PI * 2)) * 1) * 3;
              else wob = 0;
              if (hnd3) W.drawHeldAt(ctx, heldDef, dir, px - camX - 48 + hnd3.gx * 3, py - camY - 96 + hnd3.gy * 3 + wob, gfxLevel);
              else W.drawHeld(ctx, heldDef, dir, px - camX, py - camY, gfxLevel);
            } else W.drawHeld(ctx, heldDef, dir, px - camX, py - camY, gfxLevel);
          }
        }
        // Pháp bảo đã đeo bay lơ lửng quanh nhân vật (mức Cao/Trung bình;
        // mức Thấp chỉ hiện trong panel). Quỹ đạo tầm vai/đầu, tách lớp
        // hẳn với vũ khí cầm tay ở điểm tay bên dưới.
        if (ART && gfxLevel !== 'thap' && !(action && action.name === 'death')) {
          ART.drawOrbit(ctx, ch, px - camX, py - camY, animClock, gfxLevel);
        }
        // HÌNH THÁI CẢNH GIỚI: lớp TRƯỚC (hạt linh khí + tia sét loé ở
        // cảnh giới cao + thông tin khiên linh khí đang đỡ).
        if (RM && ch) RM.drawFormFront(ctx, ch, px - camX, py - camY, animClock, gfxLevel);
        if (ch && ch.rShield && ch.rShield.until > Date.now() && ch.rShield.hp > 0) {
          ctx.save();
          ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
          ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
          ctx.strokeText('Khiên: ' + ch.rShield.hp, px - camX, py - 116 - camY);
          ctx.fillStyle = '#7fe8d6';
          ctx.fillText('Khiên: ' + ch.rShield.hp, px - camX, py - 116 - camY);
          ctx.restore();
        }
        // Tên người chơi cũng qua hệ chống chồng nhãn như NPC.
        npcLabels.push({ name: ch.name, cx: px - camX, y: py - 122 - camY });
        ctx.fillStyle = '#400000';
        ctx.fillRect(px - 24 - camX, py - 106 - camY, 48, 6);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(px - 24 - camX, py - 106 - camY, 48 * Math.max(0, ch.hp) / (L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp), 6);
        if (flyDrawT) ctx.restore(); // NGỰ KIẾM: hết khối nâng/nghiêng
      }
    });
    // Cổng lầu — biển + trụ trước + dầm vòm (vẽ sau thực thể để luôn đọc được).
    if (gate && !bgCoversTile(bgCov, gate.x, gate.y) && gX1 >= 0 && gX0 <= VIEW_W) {
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(gCX - 30, gY - 142, 60, 22);
      ctx.fillStyle = '#f2c14e';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NAM MÔN', gCX, gY - 126);
      ctx.fillStyle = '#8d8578';
      ctx.fillRect(gX0 - 4, gY - 10, 12, 44);
      ctx.fillRect(gX1 - 8, gY - 10, 12, 44);
      ctx.fillStyle = '#6e675c';
      ctx.fillRect(gX0 - 4, gY - 10, 12, 4);
      ctx.fillRect(gX1 - 8, gY - 10, 12, 4);
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(gX0 - 4, gY - 12, 72, 8);
      ctx.fillStyle = '#6e675c';
      ctx.fillRect(gX0, gY + 30, 64, 4);
    }
    // THÚ TRIỀU: thanh HP cổng + số đợt ngay trên biển Nam Môn khi lượt
    // thủ thành đang chạy — người chơi đứng ở bãi nam cũng đọc được.
    if (BT && gate && flags.tide && flags.tide.run && gX1 >= 0 && gX0 <= VIEW_W) {
      var trun2 = flags.tide.run;
      var gw3 = 150, gx3 = gCX - gw3 / 2, gy3 = gY - 172;
      ctx.fillStyle = 'rgba(20,10,5,0.78)';
      ctx.fillRect(gx3 - 4, gy3 - 15, gw3 + 8, 33);
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('THÚ TRIỀU — ĐỢT ' + trun2.wave + '/' + BT.WAVE_COUNT, gCX, gy3 - 4);
      ctx.fillStyle = '#400000';
      ctx.fillRect(gx3, gy3 + 1, gw3, 9);
      ctx.fillStyle = (trun2.gateHp / trun2.gateMax) > 0.35 ? '#e8a33c' : '#e33';
      ctx.fillRect(gx3, gy3 + 1, gw3 * Math.max(0, trun2.gateHp) / trun2.gateMax, 9);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Cổng: ' + trun2.gateHp + '/' + trun2.gateMax, gCX, gy3 + 9);
    }
    // Mây map 3 — bóng mây + sương Đài Vọng Vân: vẽ sau thực thể (cả thế
    // giới tối nhẹ, ướt sương dưới lớp mây) nhưng TRƯỚC nhãn tên/biển hiệu
    // để chữ luôn đọc rõ. Chỉ map 3, bám mức đồ hoạ chung.
    if (CL && cloudState && CL.activeFor(curMapId)) {
      CL.drawShadows(ctx, cloudState, camX, camY, VIEW_W, VIEW_H, gfxLevel);
      CL.drawMist(ctx, cloudState, camX, camY, VIEW_W, VIEW_H, gfxLevel);
    }
    // Kho vết nứt — hạt chủ đề (tuyết/lá/tàn lửa/bọt/tia điện...): vẽ
    // trên thực thể như sương, trước nhãn tên để chữ luôn đọc rõ.
    if (RA && realmFxState && RA.activeFor(curMapId)) {
      RA.drawAbove(ctx, realmFxState, camX, camY, VIEW_W, VIEW_H, gfxLevel);
    }
    // Nhãn tên NPC: vẽ tập trung, chống chồng bằng cách đẩy dọc khi giao nhau,
    // kẹp trong khung hình để không bị cắt chữ ở mép.
    // V10: placedLabels + placeLabel dùng bản tĩnh ở tầng module (khỏi
    // định nghĩa lại hàm + cấp phát mảng mỗi frame).
    var placedLabels = _placedLabels; placedLabels.length = 0;
    ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    npcLabels.forEach(function (lb) {
      // Biển tên ĐẦY ĐỦ (lệnh Bui 21:52 30/10): dòng 1 tên, dòng 2
      // chức danh/vai trò (nếu có) — chật thì biển cao 2 dòng, không
      // cắt chữ. Thú/người chơi không có role -> giữ biển 1 dòng.
      var hasRole = !!lb.role;
      var w = ctx.measureText(lb.name).width + 8;
      if (hasRole) {
        ctx.font = '9px sans-serif';
        var rw = ctx.measureText(lb.role).width + 8;
        if (rw > w) w = rw;
        ctx.font = 'bold 11px sans-serif';
      }
      var pos = placeLabel(lb.cx, lb.y - 12, w, hasRole ? 27 : 16);
      ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
      ctx.strokeText(lb.name, pos.x + w / 2, pos.y + 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lb.name, pos.x + w / 2, pos.y + 12);
      if (hasRole) {
        ctx.font = '9px sans-serif';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        ctx.strokeText(lb.role, pos.x + w / 2, pos.y + 24);
        ctx.fillStyle = '#ffe9a8';
        ctx.fillText(lb.role, pos.x + w / 2, pos.y + 24);
        ctx.font = 'bold 11px sans-serif';
      }
    });
    // Nhãn biển hiệu vẽ cuối cùng; nếu kề/đè nhãn NPC thì ẩn biển (NPC quan trọng hơn).
    (mp.props || []).forEach(function (p) {
      if (p.sprite !== 'sign' || !p.label) return;
      ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      var tw = ctx.measureText(p.label).width + 14;
      var tx0 = p.x * TILE + 16 - camX, ty0 = (p.y + 1) * TILE - 48 - 20 - camY;
      var clash = placedLabels.some(function (b) {
        return tx0 - tw / 2 < b.x + b.w + 6 && tx0 + tw / 2 > b.x - 6 && ty0 < b.y + b.h + 6 && ty0 + 18 > b.y - 6;
      });
      if (clash) return;
      placedLabels.push({ x: tx0 - tw / 2, y: ty0, w: tw, h: 18 });
      ctx.fillStyle = '#202020';
      ctx.fillRect(tx0 - tw / 2, ty0, tw, 18);
      ctx.fillStyle = '#f2e6c0';
      ctx.fillText(p.label, tx0, ty0 + 13);
    });
    // Bia boss thế giới: tên boss + trạng thái/đếm ngược hồi sinh (giờ thật)
    // vẽ ngay trên bia để người chơi đứng ở sào huyệt là đọc được.
    if (BOS) {
      BOS.steleList(mp.id).forEach(function (stl) {
        var bdef = BOS.bossById(stl.bossId);
        if (!bdef) return;
        var bst = BOS.stateOf(bdef, flags, qs, Date.now());
        var bx = stl.x * TILE + 16 - camX, by = (stl.y + 1) * TILE - 48 - 22 - camY;
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        var line1 = 'Bia ' + bdef.name;
        var line2 = bst.mode === 'story' ? 'Boss cốt truyện (chương 7)' :
          bst.mode === 'pending' ? 'Chưa mở' :
          bst.available ? 'Đang sống ở sào huyệt!' : 'Hồi sinh sau ' + BOS.fmtLeft(bst.respawnAt - Date.now());
        var bw = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width) + 14;
        ctx.fillStyle = 'rgba(24,16,10,0.88)';
        ctx.fillRect(bx - bw / 2, by - 15, bw, 32);
        ctx.fillStyle = '#f2c14e';
        ctx.fillText(line1, bx, by - 3);
        ctx.fillStyle = bst.available ? '#7dff8a' : '#ffb0a0';
        ctx.fillText(line2, bx, by + 12);
      });
    }
    // Mây map 3 — lớp mây trôi trên cao: vẽ sau biển hiệu, trước hiệu ứng
    // kỹ năng + chữ bay để không che thông tin chiến đấu.
    if (CL && cloudState && CL.activeFor(curMapId)) {
      CL.drawSky(ctx, cloudState, camX, camY, VIEW_W, VIEW_H, gfxLevel);
    }
    if (skillFx) {
      // V10: blend 2 frame kề của hiệu ứng cũ theo frame float (raster cache).
      var drewSfx = false;
      if (SM) {
        var spS = SM.splitFrame(Math.min(19, skillFx.fF != null ? skillFx.fF : skillFx.idx), 20, false);
        var keySA = 'sfx|' + skillFx.kind + '|' + spS.i0, keySB = 'sfx|' + skillFx.kind + '|' + spS.i1;
        var entSA = { key: keySA, gen: null }, entSB = { key: keySB, gen: null };
        if (!SM.gridGet(keySA)) entSA.gen = (function (fr2, i2) { return function () { return fr2[i2]; }; })(skillFx.frames, spS.i0);
        if (spS.frac > 0.003 && spS.i1 !== spS.i0 && !SM.gridGet(keySB)) entSB.gen = (function (fr2, i2) { return function () { return fr2[i2]; }; })(skillFx.frames, spS.i1);
        drewSfx = !!SM.drawGridBlend(ctx, entSA, entSB, spS.frac, px - camX, py - camY, 3);
      }
      if (!drewSfx) {
        var sf = skillFx.frames[skillFx.idx];
        S.drawPixelsToCanvas(ctx, sf, px - 48 - camX, py - 96 - camY, 3);
      }
    }
    // Hiệu ứng kỹ năng mới (engine lớp hạt/glow/vệt — js/skill-fx.js).
    if (FX && SK) {
      var gfxQ = FX.getQuality();
      _fxQ = SM ? degradeFxQ(gfxQ, SM.meter.level()) : gfxQ;
      effects.forEach(function (e) {
        // fxv dùng vật thể cào chung + pool targets (không cấp phát/frame).
        _fxv.skill = e.fxSkill || e.skill;
        _fxv.root = e.rootFx || (ch ? ch.root : null);
        _fxv.dir = e.dir || dir;
        _fxv.x = e.x; _fxv.y = e.y; _fxv.step = e.step || 0; _fxv.seed = e.seed;
        _fxv.color = e.color; _fxv.radius = e.radius; _fxv.from = e.from;
        _fxv.targets.length = 0;
        var ets = e.targets || [];
        for (var ti = 0; ti < ets.length; ti++) {
          var to = _fxTPool[ti];
          if (!to) { to = { x: 0, y: 0 }; _fxTPool[ti] = to; }
          to.x = ets[ti].x; to.y = ets[ti].y;
          _fxv.targets.push(to);
        }
        if (SM) {
          // Frame FLOAT: mốc nhả chiêu theo THỜI GIAN giữ nguyên (skills.js
          // không đổi); chỉ lớp vẽ nội suy giữa 2 frame mô tả kề.
          var frF = e.skill === 'ngu_kiem' ? (e.t * 20) % 20 : Math.min(19, Math.max(0, e.t / (e.dur || 1) * 20));
          // QA 17:06 30/10 (hàng chờ 67): máy đã tụt tới mức giảm tải
          // cao nhất (FPS thấp kéo dài) thì BỎ hẳn lớp blend — vẽ 1
          // frame như mức Thấp, khỏi phải sao chép toàn khung hình
          // qua canvas đệm nữa; máy khỏe không đổi gì.
          if (SM.meter && SM.meter.level() >= 3) { var spFx = SM.splitFrame(frF, 20, e.skill === 'ngu_kiem'); drawFxLayer(ctx, spFx.i0); }
          else SM.drawFxBlend(ctx, frF, 20, e.skill === 'ngu_kiem', VIEW_W, VIEW_H, drawFxLayer);
        } else {
          var fr = e.skill === 'ngu_kiem' ? Math.floor(e.t * 20) % 20 : FX.frameOf(e.t / (e.dur || 1));
          FX.draw(ctx, _fxv, fr, _fxQ, camX, camY);
        }
      });
    }
    // TRẬN KỲ: vòng trận trên mặt đất ở đúng map đặt trận — viền màu
    // trận + nền mờ (cùng ngôn ngữ vòng hiệu ứng mặt đất của boss/lôi
    // kiếp, không phải ảnh thay thế).
    if (FM && ch) {
      var ffm = FM.active(flags);
      if (ffm && ffm.map === curMapId) {
        var ffc = FM.centerOf(ffm), ffe = FM.effectOf(ffm.type, flags);
        var ffx = ffc.x - camX, ffy = ffc.y - camY, ffr = ffe ? ffe.radiusPx : 96;
        ctx.globalAlpha = 0.35; ctx.strokeStyle = ffe ? ffe.color : '#ffd94a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ffx, ffy, ffr, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.10; ctx.fillStyle = ffe ? ffe.color : '#ffd94a';
        ctx.beginPath(); ctx.arc(ffx, ffy, ffr, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.9; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = ffe ? ffe.color : '#ffd94a';
        ctx.fillText(ffe ? ffe.name : '', ffx, ffy - ffr - 6);
        ctx.globalAlpha = 1;
      }
    }
    // SỰ KIỆN NGẪU NHIÊN (js/world-events.js): vòng sáng điểm linh khí
    // bùng phát + điểm sáng tu sĩ gặp nạn, chỉ vẽ ở đúng map sự kiện
    // (cùng ngôn ngữ vòng hiệu ứng mặt đất với Trận Kỳ ở trên).
    if (WE && ch) {
      var wev = WE.activeEvent(flags);
      if (wev && wev.mapId === curMapId && wev.kind === 'burst') {
        var wx = wev.x * TILE + 16 - camX, wy = wev.y * TILE + 16 - camY, wr = WE.BURST_RADIUS * TILE;
        var wpulse = 0.75 + 0.25 * Math.sin(animClock * 2.4);
        ctx.globalAlpha = 0.5 * wpulse; ctx.strokeStyle = '#7dffce'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.10 * wpulse; ctx.fillStyle = '#7dffce';
        ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.95; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#7dffce';
        ctx.fillText('Điểm Linh Khí Bùng Phát', wx, wy - wr - 8);
        ctx.globalAlpha = 1;
      } else if (wev && wev.mapId === curMapId && wev.kind === 'monk') {
        var mxp = wev.x * TILE + 16 - camX, myp = wev.y * TILE + 16 - camY;
        var mpulse = 0.6 + 0.4 * Math.sin(animClock * 3);
        ctx.globalAlpha = 0.35 * mpulse; ctx.fillStyle = '#ffd94a';
        ctx.beginPath(); ctx.arc(mxp, myp, 20, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd94a';
        ctx.fillText('!', mxp, myp - 24 - 3 * mpulse);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Có người gặp nạn', mxp, myp + 34);
      }
    }
    // NGỰ KIẾM Q3: vòng sáng cột mốc bài bay thử trên map 3 — mốc hiện tại
    // pulse vàng + số thứ tự + đồng hồ còn lại; mốc đã qua xanh lá, mốc sau
    // xám mờ. Chỉ vẽ khi bài thử đang chạy.
    if (flyTrial && FLIGHT && curMapId === FLIGHT.TRIAL_MAP) {
      FLIGHT.CHECKPOINTS.forEach(function (cp, ci) {
        var cxp = cp.x * TILE + 16 - camX, cyp = cp.y * TILE + 16 - camY;
        if (cxp < -50 || cyp < -50 || cxp > VIEW_W + 50 || cyp > VIEW_H + 50) return;
        var doneCp = ci < flyTrial.next, curCp = ci === flyTrial.next;
        var rr = curCp ? 20 + Math.sin(animClock * 5) * 3 : 17;
        ctx.globalAlpha = doneCp ? 0.55 : curCp ? 0.95 : 0.4;
        ctx.strokeStyle = doneCp ? '#7dff8a' : curCp ? '#ffd94a' : '#cfd8dc';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cxp, cyp, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = doneCp ? '#7dff8a' : curCp ? '#ffd94a' : '#cfd8dc';
        ctx.fillText(doneCp ? 'đã qua' : String(ci + 1), cxp, cyp - rr - 6);
        ctx.globalAlpha = 1;
      });
      ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
      var trialTxt = 'Bay thử: mốc ' + (flyTrial.next + 1) + '/5 — ' + FLIGHT.CHECKPOINTS[flyTrial.next].name + ' — còn ' + Math.ceil(flyTrial.timeLeft) + 's';
      ctx.strokeText(trialTxt, VIEW_W / 2, 24);
      ctx.fillStyle = '#ffd94a';
      ctx.fillText(trialTxt, VIEW_W / 2, 24);
    }
    // LÔI KIẾP: vòng đỏ báo hiệu trên mặt đất (js/realms.js) — vòng
    // ngoài là biên chịu đòn trọn, vòng trong thu dần báo giờ giáng.
    if (tribRun && ch && ch.tribulation && RM) {
      var tbR = RM.TRIBULATIONS[ch.tribulation.targetRank];
      var tForm = RM.TRIB_FORMS[ch.tribulation.form];
      var trx = tribRun.cx - camX, try2 = tribRun.cy - camY;
      if (tribRun.phase === 'telegraph') {
        var prog = Math.min(1, tribRun.t / tbR.telegraphSec);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,60,40,0.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(trx, try2, tbR.radius, tbR.radius * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(255,60,40,' + (0.08 + 0.25 * prog) + ')';
        ctx.beginPath(); ctx.ellipse(trx, try2, tbR.radius, tbR.radius * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = tForm ? RM.formColorAt(tForm, tribRun.idx) : '#bfe6ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(trx, try2, Math.max(1, tbR.radius * prog), Math.max(1, tbR.radius * 0.42 * prog), 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      } else if (tribRun.phase === 'rest') {
        ctx.save();
        ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
        var restTxt = 'Đạo lôi ' + (tribRun.idx + 1) + '/' + tbR.strikes + ' — ' + (tForm ? tForm.name : '');
        ctx.strokeText(restTxt, trx, try2 - tbR.radius - 10);
        ctx.fillStyle = '#ffd94a'; ctx.fillText(restTxt, trx, try2 - tbR.radius - 10);
        ctx.restore();
      }
    }
    floaters.forEach(function (f) {
      ctx.globalAlpha = Math.max(0, f.t);
      ctx.font = 'bold ' + (f.big ? 20 : 15) + 'px sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = '#202020';
      ctx.strokeText(f.txt, f.x - camX, f.y - camY);
      ctx.fillStyle = f.color;
      ctx.fillText(f.txt, f.x - camX, f.y - camY);
      ctx.globalAlpha = 1;
    });
    // Gợi ý tương tác: khớp đúng mục tiêu mà phím E sẽ chọn (gần nhất trong tầm).
    var it = nearestInteractable();
    var hint = null;
    if (it) {
      if (it.kind === 'npc') { var hd2 = npcDef(it.npc); hint = 'E: Nói chuyện với ' + hd2.name + (hd2.role ? ' — ' + hd2.role : ''); }
      else if (it.kind === 'well') hint = 'E: Xem giếng cổ';
      else if (it.kind === 'realmGate') hint = 'E: Bí cảnh Liệt Khích Phong Ấn đang mở — xem lịch & vào';
      else if (it.kind === 'riftGate') hint = 'E: VẾT NỨT HƯ KHÔNG đang mở — chỉ dành cho tu sĩ Trúc Cơ trở lên';
      else if (it.kind === 'stele') hint = 'E: Xem bia boss — lịch hồi sinh & bảng rơi';
      else if (it.kind === 'caveGate') hint = 'E: Cửa đá Động Phủ — phủ riêng & linh điền';
      else if (it.kind === 'caveExit') hint = 'E: Rời động phủ';
      else if (it.kind === 'garden') hint = 'E: Linh điền — trồng / tưới / thu hoạch';
      else if (it.kind === 'originSpot') hint = 'E: Kỳ ngộ nguồn gốc — ' + (SR.spotTemplateById(it.spotId) ? SR.spotTemplateById(it.spotId).name : 'điểm kỳ ngộ');
      else hint = 'E: Hái ' + L.ITEMS[it.herb.item].name;
    }
    if (hint) {
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = '#202020';
      ctx.strokeText(hint, px - camX, py - 124 - camY);
      ctx.fillStyle = '#ffe9a8';
      ctx.fillText(hint, px - camX, py - 124 - camY);
    }
    // Mây map 3 — mây tiền cảnh: cụm lớn mờ thi thoảng bay ngang sát camera,
    // vẽ cuối cùng trong canvas (UI/panel là DOM nên không bao giờ bị che).
    if (CL && cloudState && CL.activeFor(curMapId)) {
      CL.drawForeground(ctx, cloudState, camX, camY, VIEW_W, VIEW_H, gfxLevel);
    }
    // Ô đo FPS (bật bằng F9 hoặc phím `): số FPS thật từ bộ đo của
    // smooth.js + hệ số hạt hiện tại khi tự giảm tải đang can thiệp.
    // MINIMAP (mục 25): vẽ lại mỗi frame lên canvas riêng góc trên-phải
    // trong #gameWrap — canvas chính không bị vẽ đè, và chạm minimap
    // (nút DOM riêng) không lẫn với bấm đất di chuyển trên canvas.
    // Guard MM + ch để test fake-DOM không có module vẫn chạy.
    try {
      if (MM && ch) {
        var mmCv = $('minimapCanvas');
        if (mmCv) {
          var mmState = { player: playerTile(), npcs: curMap().npcs || [],
            monsters: monsters.filter(function (mm2) { return !mm2.dying && mm2.hp > 0; }) };
          // Đặt kích thước TRƯỚC khi vẽ: gán width/height sau draw sẽ xóa canvas.
          var mmCell = MM.cellSize(curMap(), 180, 140);
          if (mmCv.width !== curMap().w * mmCell) mmCv.width = curMap().w * mmCell;
          if (mmCv.height !== curMap().h * mmCell) mmCv.height = curMap().h * mmCell;
          MM.draw(mmCv.getContext('2d'), curMap(), mmState, 180, 140);
          var mmName = $('minimapName');
          if (mmName) mmName.textContent = curMap().name;
        }
      }
    } catch (e) {}
    if (showFps && SM) {
      var frep = SM.meter.report();
      ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(8, 8, 252, 20);
      ctx.fillStyle = '#aef29a';
      ctx.fillText('FPS ' + frep.fps + ' · hạt x' + frep.particleScale + (frep.level ? ' (tự giảm tải mức ' + frep.level + ')' : ''), 14, 23);
    }
  }
  window.addEventListener('error', function (e) {
    var el = $('err');
    if (el) el.textContent = 'Lỗi game: ' + (e.message || e.error);
  });

  // ================================================================
  // GIAO DIỆN ĐẦU PHIÊN + THU NHỎ DÙNG CHUNG (lệnh Bui 20:11–20:24
  // ngày 30/10): cơ chế thu nhỏ panel, thanh theo dõi mục tiêu, dải
  // sự kiện trực tiếp, quà tân thủ, thành tựu sớm, panel Nhân Vật
  // đầy đủ (lộ trình đột phá / danh hiệu / chỉ số phụ / thẻ linh thú
  // + công pháp / thống kê trọn đời / xuất thẻ), giftcode.
  // ================================================================
  var ACH = (typeof window !== 'undefined') ? window.PNT_ACHIEVEMENTS : null;

  // ---------- Thống kê trọn đời: phần ĐÃ có bộ đếm (đồ giám) đọc
  // thẳng; phần chưa từng đếm (dược đã hái, số lần chết, giờ chơi)
  // bắt đầu đếm từ bản này qua flags.stats — ghi rõ trong panel.
  function lifetimeStats() {
    if (!flags.stats || typeof flags.stats !== 'object') flags.stats = { herbs: 0, deaths: 0, playSec: 0 };
    if (typeof flags.stats.herbs !== 'number') flags.stats.herbs = 0;
    if (typeof flags.stats.deaths !== 'number') flags.stats.deaths = 0;
    if (typeof flags.stats.playSec !== 'number') flags.stats.playSec = 0;
    return flags.stats;
  }
  // Đồ Giám vũ khí/pháp bảo (20:26 mục 5): noteWeapon/noteArtifact
  // vốn CHƯA từng được gọi ở đường nhận đồ nào — đồng bộ từ túi mỗi
  // giây: món đang sở hữu coi như đã ghi nhận (đồ giám chỉ ghi thêm).
  var lastGearSyncAt = 0;
  function syncBestiaryGear() {
    var nowMs = Date.now();
    if (nowMs - lastGearSyncAt < 1000) return;
    lastGearSyncAt = nowMs;
    try {
      if (!BX || !ch) return;
      if (W) W.weaponEntries(ch).forEach(function (e) { BX.noteWeapon(flags, e.id); });
      if (ART) ART.artifactEntries(ch).forEach(function (e) { BX.noteArtifact(flags, e.id); });
    } catch (e) {}
  }
  function bxTotals() {
    var t = { kills: 0, bosses: 0, realmsEntered: 0 };
    if (BX) {
      try {
        var b = BX.ensure(flags);
        if (b) {
          Object.keys(b.kills || {}).forEach(function (k) { t.kills += b.kills[k] || 0; });
          t.bosses = Object.keys(b.bosses || {}).length;
          Object.keys(b.realms || {}).forEach(function (r) { if (b.realms[r].entered) t.realmsEntered++; });
        }
      } catch (e) {}
    }
    return t;
  }

  // ---------- THU NHỎ DÙNG CHUNG (lệnh 20:11 + 20:12) ----------
  // Mọi panel phủ trên khung đều có nút "—": thu thành THẺ ở khay
  // #chipTray góc trên-phải, bấm thẻ mở lại nguyên trạng. Panel bị
  // thu thì tick không tự bung; panel TỰ hiện lúc panel khác đang mở
  // thì thu ngay + toast. Ngoại lệ có lý do (ghi ở player-qa.md):
  // panelCult/panelDemon (lựa chọn có hậu quả), dialogueBox (hội
  // thoại đang diễn ra), 2 modal story (modalKyNgo/modalBreak).
  function minLiveFate() {
    try {
      var off = SR && SR.validOffer ? SR.validOffer(flags, gameNow()) : null;
      if (!off) return '';
      var sec = Math.max(0, Math.round((off.at + SR.FATE.offerTtlMs - gameNow()) / 1000));
      return 'Còn ' + sec + 's để vào';
    } catch (e) { return ''; }
  }
  function minLiveRealms() {
    try {
      if (!SR) return '';
      var now = gameNow();
      if (flags.sr && flags.sr.run) return 'Đang trong bí cảnh';
      var st = SR.status(flags, now);
      if (st && st.open) return 'Đang mở — còn ' + Math.floor(st.endsInSec / 60) + ':' + ('0' + (st.endsInSec % 60)).slice(-2);
      if (st && st.next) return 'Phiên sau mở lúc ' + (SR.fmtTime ? SR.fmtTime(st.next.start) : '');
      return '';
    } catch (e) { return ''; }
  }
  function minLiveRift() {
    try {
      if (!RIFT) return '';
      var info = RIFT.cycleInfo(gameNow());
      if (info && info.active) return 'Đang mở — còn ' + Math.max(0, Math.round((info.expiresAt - gameNow()) / 60000)) + ' phút';
      return '';
    } catch (e) { return ''; }
  }
  // --- Strip thông báo sự kiện (riftBanner/wevTimer/realmTimer/bossBanner/
  // festBanner): cùng cơ chế thu nhỏ/đóng dùng chung với panel (lệnh đứng
  // Bui 20:12 30/10). alive/live cho thẻ thu nhỏ của từng strip.
  function stripAliveRift() {
    // Theo mốc sống do CHÍNH tickRift ghi (cùng nguồn giờ với tick):
    // tránh lệch nguồn khi tick được gọi bằng mốc kiểm thử/đơn điệu.
    return !!riftBannerLiveUntil && gameNow() < riftBannerLiveUntil;
  }
  function stripAliveWev() {
    try { return !!(WE && WE.activeEvent(flags)); } catch (e) { return false; }
  }
  function minLiveWev() {
    try {
      var ev = WE && WE.activeEvent(flags);
      if (!ev) return '';
      var left = Math.max(0, Math.ceil((ev.endsAt - gameNow()) / 1000));
      return 'Còn ' + Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
    } catch (e) { return ''; }
  }
  function stripAliveRealm() {
    try { var s = flags && flags.sr; return !!(s && s.run && curMapId === s.run.mapId); } catch (e) { return false; }
  }
  function minLiveRealmRun() {
    try {
      var s = flags && flags.sr;
      if (s && s.run && curMapId === s.run.mapId) {
        var left = Math.max(0, Math.round((s.run.endAt - gameNow()) / 1000));
        return 'Còn ' + Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
      }
      return '';
    } catch (e) { return ''; }
  }
  function stripAliveBoss() { return !!bossBannerUntil && Date.now() < bossBannerUntil; }
  function stripAliveFest() { return !!festBannerUntil && Date.now() < festBannerUntil; }
  var MIN_PANELS = [
    { id: 'panelFate', title: 'Kỳ ngộ', live: minLiveFate, alive: function () { return !!(SR && SR.validOffer && SR.validOffer(flags, gameNow())); } },
    { id: 'panelFateChoice', title: 'Lựa chọn kỳ ngộ', live: function () { return 'Đang chờ lựa chọn'; }, alive: function () { return !!(flags.sr && flags.sr.run && flags.sr.run.kind === 'ky_ngo'); } },
    { id: 'panelRealms', title: 'Bí Cảnh', live: minLiveRealms },
    { id: 'panelRift', title: 'Vết Nứt Hư Không', live: minLiveRift },
    { id: 'riftBanner', title: 'Vết Nứt (đang mở)', strip: true, live: minLiveRift, alive: stripAliveRift },
    { id: 'wevTimer', title: 'Sự kiện thế giới', strip: true, live: minLiveWev, alive: stripAliveWev },
    { id: 'realmTimer', title: 'Đang trong bí cảnh', strip: true, live: minLiveRealmRun, alive: stripAliveRealm },
    { id: 'bossBanner', title: 'Thông báo boss', strip: true, alive: stripAliveBoss },
    { id: 'festBanner', title: 'Lễ hội', strip: true, alive: stripAliveFest },
    { id: 'panelBeastTide', title: 'Thú Triều' },
    { id: 'panelTournament', title: 'Đại Hội' },
    { id: 'panelTide', title: 'Tiết Khí' },
    { id: 'panelBestiary', title: 'Đồ Giám' },
    { id: 'panelLegend', title: 'Truyền Kỳ' },
    { id: 'panelFair', title: 'Chợ Phiên' },
    { id: 'panelWevShop', title: 'Thương Nhân Thần Bí' },
    { id: 'panelDongPhu', title: 'Động Phủ' },
    { id: 'panelQuests', title: 'Nhiệm vụ' },
    { id: 'panelSeasonBoard', title: 'Bảng Mùa' },
    { id: 'panelEscort', title: 'Hộ Tống' },
    { id: 'panelAuction', title: 'Đấu Giá' },
    { id: 'panelCompanion', title: 'Đi Cùng' },
    { id: 'panelAffinity', title: 'Hảo Cảm' },
    { id: 'panelFormation', title: 'Trận Kỳ' },
    { id: 'panelBoss', title: 'Boss' },
    { id: 'panelInv', title: 'Túi đồ' },
    { id: 'panelSkills', title: 'Kỹ năng' },
    { id: 'panelSects', title: 'Tông Môn' },
    { id: 'panelPets', title: 'Linh thú' },
    { id: 'panelWardrobe', title: 'Tủ đồ' },
    { id: 'panelShop', title: 'Lò rèn' },
    { id: 'panelBooks', title: 'Tủ sách' },
    { id: 'panelArtShop', title: 'Tiệm pháp khí' },
    { id: 'panelAlchemy', title: 'Đan Lô' },
    { id: 'panelTalisman', title: 'Bàn Phù' },
    { id: 'panelMenu', title: 'Menu' },
    { id: 'panelCharacter', title: 'Nhân Vật' },
    { id: 'panelCompare', title: 'So sánh trang bị' },
    { id: 'panelWelcome', title: 'Quà tân thủ' },
    { id: 'questTracker', title: 'Mục tiêu', noAutoMin: true }
  ];
  var minState = {}, minPrev = {}, minRestoreAt = {}, minTickLast = 0, lastUserClickAt = 0;
  var chipLiveEls = {};
  // ---------- STRIP THÔNG BÁO SỰ KIỆN: hạ tầng dùng chung ----------
  // Strip KHÔNG phải overlay: tick sự kiện của chúng (tickRift,
  // updateWevTimer, tickRealms, checkWorldBosses, maybeFestBanner) vốn
  // ép display='block' + ghi textContent thẳng lên div mỗi tick — đó là
  // gốc lỗi Bui báo 31/10: banner khe nứt không có nút nào, ẩn tay cũng
  // bị tick bung lại sau ≤500ms. Khắc phục trong đúng cơ chế dùng chung:
  // (1) chữ ghi vào span.strip-text con để nút —/✕ inject không bị
  // textContent xoá; (2) tick chỉ hiện khi stripWanted() — đang thu nhỏ
  // (minState) hoặc đã đóng cho ĐÚNG sự kiện hiện tại (stripDismissKey
  // theo khóa sự kiện) thì giữ ẩn; sự kiện MỚI (khóa khác) lại hiện.
  var stripDismissKey = {};
  var STRIP_ORDER = ['bossBanner', 'riftBanner', 'festBanner', 'wevTimer', 'realmTimer'];
  function stripKey(id) {
    try {
      if (id === 'riftBanner') { var i = RIFT && RIFT.cycleInfo(gameNow()); return i ? 'cyc' + i.cycleId : ''; }
      if (id === 'wevTimer') { var ev = WE && WE.activeEvent(flags); return ev ? 'wev' + ev.kind + ':' + ev.endsAt : ''; }
      if (id === 'realmTimer') { var s = flags && flags.sr; return (s && s.run) ? 'run' + s.run.mapId + ':' + s.run.endAt : ''; }
      if (id === 'bossBanner') return bossBannerUntil ? 'boss' + bossAnnounceSeq + ':' + bossBannerUntil : '';
      if (id === 'festBanner') return festBannerKey ? 'fest' + festBannerKey : '';
    } catch (e) {}
    return '';
  }
  function stripWanted(id) {
    if (minState[id]) return false;
    var k = stripKey(id);
    if (k && stripDismissKey[id] === k) return false;
    return true;
  }
  function stripTextEl(el) {
    if (!el) return null;
    var sp = null;
    try { sp = el.querySelector('.strip-text'); } catch (e) {}
    if (!sp) {
      sp = document.createElement('span');
      sp.className = 'strip-text';
      if (el.firstChild) el.insertBefore(sp, el.firstChild); else el.appendChild(sp);
    }
    return sp;
  }
  function setStripText(el, txt) { var sp = stripTextEl(el); if (sp) sp.textContent = txt; }
  // Xếp các strip đang hiện thành hàng dọc (trước đây bossBanner và
  // riftBanner cùng top:10px chồng khít lên nhau, fest/wev chồng ở
  // 48–52px) + đẩy thẻ Mục tiêu xuống dưới cụm strip khi cụm tràn tới.
  function layoutStrips() {
    var used = 10;
    STRIP_ORDER.forEach(function (id) {
      var el = $(id);
      if (el && el.style.display === 'block') { el.style.top = used + 'px'; used += 46; }
    });
    var qt = $('questTracker');
    if (qt) {
      var wrap = $('gameWrap');
      var base = (wrap && (wrap.className || '').indexOf('hud-compact') >= 0) ? 100 : 132;
      qt.style.top = (used + 4 > base) ? (used + 4) + 'px' : '';
    }
  }
  document.addEventListener('click', function (e) {
    lastUserClickAt = Date.now();
    // Bấm nút Đóng của chính panel đang thu nhỏ -> dọn thẻ luôn.
    try {
      var t = e && e.target;
      if (t && t.closest && t.tagName === 'BUTTON') {
        var panel = t.closest('.overlay');
        if (panel && minState[panel.id] && (/Close$/.test(t.id || '') || t.id === 'fateSkip')) clearMinPanel(panel.id);
      }
    } catch (err) {}
  }, true);
  function minDef(id) { for (var i = 0; i < MIN_PANELS.length; i++) if (MIN_PANELS[i].id === id) return MIN_PANELS[i]; return null; }
  function renderChips() {
    var tray = $('chipTray');
    if (!tray) return;
    tray.innerHTML = '';
    chipLiveEls = {};
    Object.keys(minState).forEach(function (id) {
      var def = minDef(id);
      if (!def) return;
      var b = document.createElement('button');
      b.className = 'chip';
      b.setAttribute('data-chip', id);
      var ttl = document.createElement('span'); ttl.textContent = def.title;
      var sm = document.createElement('small');
      sm.textContent = def.live ? (def.live() || '') : '';
      b.appendChild(ttl); b.appendChild(sm);
      b.addEventListener('click', function () { restoreMinPanel(id); });
      tray.appendChild(b);
      chipLiveEls[id] = sm;
    });
  }
  function minimizePanel(id) {
    var p = $(id);
    if (!p) return false;
    p.style.display = 'none';
    minState[id] = true;
    minPrev[id] = false;
    renderChips();
    return true;
  }
  function restoreMinPanel(id) {
    var p = $(id);
    if (!p) return false;
    delete minState[id];
    minRestoreAt[id] = Date.now();
    renderChips();
    if (id === 'panelCharacter') renderCharacterPanel();
    p.style.display = 'block';
    minPrev[id] = true;
    return true;
  }
  function clearMinPanel(id) {
    if (!minState[id]) return;
    delete minState[id];
    renderChips();
  }
  function injectMinButtons() {
    MIN_PANELS.forEach(function (def) {
      var p = $(def.id);
      if (!p || p._minInjected) return;
      p._minInjected = true;
      if (def.strip && (p.className || '').indexOf('has-strip-btns') < 0) p.className = ((p.className || '') + ' has-strip-btns').trim();
      var b = document.createElement('button');
      b.className = 'min-btn';
      b.textContent = '—';
      b.title = 'Thu nhỏ panel này';
      b.addEventListener('click', function (ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        minimizePanel(def.id);
      });
      p.appendChild(b);
    });
  }
  // ---------- Nút ✕ đóng nhanh MỌI panel (lệnh Bui 21:58 30/10) ----------
  // Một cơ chế gắn chung injectXButtons (cùng nhịp injectMinButtons):
  // ✕ ở góc trên-phải cạnh nút "—", bấm = đúng hành vi Đóng hiện có của
  // panel (mọi nút *Close trong game đều chỉ ẩn panel) + dọn thẻ thu
  // nhỏ qua clearMinPanel. Ngoại lệ có chủ đích:
  // - dialogueBox: ✕ gọi closeDialogue() như nút Đóng thoại (dọn cả
  //   trạng thái hội thoại, không chỉ ẩn hộp).
  // - panelFate/panelFateChoice: panel LỰA CHỌN kỳ ngộ, không có nút
  //   Đóng thường; nút "Bỏ qua (mất)" là lựa chọn có hậu quả nên ✕
  //   KHÔNG bấm thay — ✕ = tạm lui an toàn qua thu nhỏ (thẻ ở góc,
  //   bấm mở lại, kỳ ngộ không mất, không ai chọn thay người chơi).
  // - questTracker: thẻ mục tiêu thường trực, không phải panel đóng
  //   được (không có hành vi Đóng; đã có nút "—" để tạm ẩn) -> không ✕.
  var PANEL_X_EXTRA = ['panelCult', 'panelDemon', 'dialogueBox', 'modalKyNgo', 'modalBreak'];
  function closePanelX(id) {
    if (id === 'dialogueBox') { closeDialogue(); return; }
    if (id === 'panelFate' || id === 'panelFateChoice') { minimizePanel(id); return; }
    var cdef = minDef(id);
    if (cdef && cdef.strip) { var k = stripKey(id); if (k) stripDismissKey[id] = k; } // đóng strip = đóng cho sự kiện hiện tại; sự kiện mới (khóa khác) hiện lại
    var p = $(id);
    if (p) p.style.display = 'none';
    clearMinPanel(id);
  }
  function injectXButtons() {
    var ids = MIN_PANELS.map(function (d) { return d.id; }).filter(function (id) { return id !== 'questTracker'; }).concat(PANEL_X_EXTRA);
    ids.forEach(function (id) {
      var p = $(id);
      if (!p || p._xInjected) return;
      p._xInjected = true;
      var xdef = minDef(id);
      if (xdef && xdef.strip && (p.className || '').indexOf('has-strip-btns') < 0) p.className = ((p.className || '') + ' has-strip-btns').trim();
      var host = p;
      if (p.querySelector) { var inner = null; try { inner = p.querySelector('.panel'); } catch (e) {} if (inner) host = inner; }
      var b = document.createElement('button');
      b.className = 'x-btn';
      b.textContent = '✕';
      b.title = 'Đóng panel';
      b.setAttribute('data-xpanel', id);
      b.addEventListener('click', function (ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        closePanelX(id);
      });
      host.appendChild(b);
    });
  }
  function anotherPanelOpen(exceptId) {
    for (var i = 0; i < MIN_PANELS.length; i++) {
      var d = MIN_PANELS[i];
      if (d.id === exceptId || d.id === 'questTracker' || d.strip) continue;
      var p = $(d.id);
      if (p && p.style.display === 'block') return true;
    }
    return false;
  }
  function tickMinPanels() {
    var now = Date.now();
    if (now - minTickLast < 250) return;
    minTickLast = now;
    injectMinButtons();
    injectXButtons();
    // Phần 10 (22:45): panel MỚI mở thì tự thu nhỏ panel CŨ đang mở
    // (cơ chế minimizePanel sẵn có) — hai panel mở chồng nhau sẽ che
    // cụm ✕/— của nhau. panelCompare là popup con mở ĐÈ lên panel
    // nền: mở nó KHÔNG thu nhỏ panel nền; khi panel khác mở đè thì
    // nó đóng hẳn (thoáng qua, không để thẻ thu nhỏ).
    (function () {
      var openNow = [], titles = {};
      MIN_PANELS.forEach(function (def) {
        if (def.id === 'questTracker' || def.strip) return; // strip sự kiện không tham gia cơ chế "mở panel mới thu nhỏ panel cũ"
        titles[def.id] = def.title;
        var p = $(def.id);
        if (p && p.style.display === 'block' && !minState[def.id]) openNow.push(def.id);
      });
      if (openNow.length < 2) return;
      var rising = openNow.filter(function (id) { return !minPrev[id]; });
      if (!rising.length) return;
      var keepId = rising[rising.length - 1];
      openNow.forEach(function (id) {
        if (id === keepId) return;
        if (id === 'panelCompare') { var pc = $('panelCompare'); if (pc) pc.style.display = 'none'; clearMinPanel('panelCompare'); return; }
        minimizePanel(id);
        toast('Đã thu nhỏ "' + (titles[id] || id) + '" vào góc màn hình — bấm thẻ để mở lại khi cần.');
      });
    })();
    MIN_PANELS.forEach(function (def) {
      var p = $(def.id);
      if (!p) return;
      var disp = p.style.display === 'block';
      if (minState[def.id]) {
        if (disp && now - (minRestoreAt[def.id] || 0) > 400) {
          p.style.display = 'none'; // tick nào tự bung lại -> gập xuống ngay
          disp = false;
        }
        if (!disp) {
          if (def.alive && !def.alive()) {
            var wasFate = def.id === 'panelFate';
            clearMinPanel(def.id);
            if (wasFate) toast('Lời mời kỳ ngộ đã hết hạn.');
          } else if (chipLiveEls[def.id] && def.live) {
            chipLiveEls[def.id].textContent = def.live() || '';
          }
        }
      }
      // (Nhánh tự thu nhỏ panel-mới-mở đã thay bằng cơ chế thu nhỏ
      // panel-CŨ ở đầu tickMinPanels — Phần 10, xem chú thích trên.)
      minPrev[def.id] = disp;
    });
    layoutStrips();
  }

  // ---------- THANH THEO DÕI MỤC TIÊU (lệnh 20:22 mục 1) ----------
  // Game chưa có hệ tự tìm đường riêng: nút Chỉ đường dùng đúng
  // click-to-move sẵn có (đặt moveTarget tới người giao) + vẽ mũi
  // tên nhấp nháy trên đầu NPC đích khi cùng map; khác map thì thẻ
  // ghi rõ đích ở map nào.
  var trackerCache = '', guideOn = false, trackerTickLast = 0, guideQuestId = null, guideTargetKey = null;
  function trackedQuest() {
    if (!qs) return null;
    // Mục mobile-controls 31/10: người chơi GHIM nhiệm vụ theo dõi từ
    // panel Nhiệm vụ (qs.trackSel, lưu cùng save) — thẻ Mục tiêu + Chỉ
    // đường đi theo lựa chọn này thay vì thứ tự cứng main->phụ->xong.
    // Ghim hỏng (nhiệm vụ đã trả/không còn) thì rơi về tự chọn như cũ.
    if (qs.trackSel && qs.accepted && qs.accepted[qs.trackSel] && L.QUESTS[qs.trackSel]) {
      var sq = L.QUESTS[qs.trackSel], sst = qs.accepted[qs.trackSel];
      return { q: sq, st: sst, done: !!sst.done };
    }
    var ids = Object.keys(qs.accepted || {});
    var pick = null;
    for (var i = 0; i < ids.length; i++) {
      var q = L.QUESTS[ids[i]];
      if (q && q.main && !qs.accepted[ids[i]].done) { pick = { q: q, st: qs.accepted[ids[i]] }; break; }
    }
    if (!pick) for (var j = 0; j < ids.length; j++) {
      var q2 = L.QUESTS[ids[j]];
      if (q2 && !qs.accepted[ids[j]].done) { pick = { q: q2, st: qs.accepted[ids[j]] }; break; }
    }
    if (!pick) for (var k = 0; k < ids.length; k++) {
      var q3 = L.QUESTS[ids[k]];
      if (q3 && qs.accepted[ids[k]].done) { pick = { q: q3, st: qs.accepted[ids[k]], done: true }; break; }
    }
    return pick;
  }
  function npcHome(npcId) {
    var found = null;
    Object.keys(M.MAPS).forEach(function (mid) {
      (M.MAPS[mid].npcs || []).forEach(function (n) { if (n.id === npcId) found = { npc: n, mapId: mid }; });
    });
    return found;
  }
  function trackerText() {
    var t = trackedQuest();
    if (t) {
      var ob = t.q.objectives && t.q.objectives[0];
      if (t.done) return 'Mục tiêu: ' + t.q.title + ' — đã xong, về gặp ' + questGiverName(t.q) + ' để trả.';
      return 'Mục tiêu: ' + t.q.title + (ob ? ' · ' + (t.st.progress || 0) + '/' + ob.need : '');
    }
    if (!qs.turnedIn || qs.turnedIn.indexOf('q_chinh_1') < 0) return 'Gợi ý: Nói chuyện với trưởng làng Trần Đức (dấu ! ở sân làng).';
    if (!flags.kyNgo) return 'Gợi ý: Tới giếng cổ giữa làng để lộ linh căn.';
    if (!ch.root) return 'Gợi ý: Tới giếng cổ giữa làng để lộ linh căn.';
    if ((ch.tier || 0) < 1) return 'Gợi ý: Thổ nạp (T) tích tu vi rồi đột phá Luyện Khí tầng 1 (nút Đột phá).';
    var lkHint = nextLockedMainHint();
    if (lkHint) return lkHint;
    return 'Gợi ý: Mở panel Nhiệm vụ xem việc làng đang chờ.';
  }
  // Bước chính kế tiếp đang bị khóa bởi nhiệm vụ trước chưa xong ->
  // thẻ mục tiêu chỉ đích danh "Làm trước: «Tên nhiệm vụ»" (21:43),
  // thay gợi ý mơ hồ. Chỉ đọc dữ liệu requires thật, khóa sâu hơn
  // một lớp thì không đoán.
  function nextLockedMainHint() {
    var avail = {};
    L.availableQuests(qs).forEach(function (q) { avail[q.id] = 1; });
    var ids = Object.keys(L.QUESTS);
    for (var i = 0; i < ids.length; i++) {
      var q = L.QUESTS[ids[i]];
      if (!q || !q.main || !q.requires) continue;
      if (qs.accepted[q.id] || L.isTurnedIn(qs, q.id)) continue;
      if (L.isTurnedIn(qs, q.requires)) return null;
      if (qs.accepted[q.requires] || avail[q.requires]) {
        var pre = L.QUESTS[q.requires];
        return 'Mục tiêu: Làm trước: «' + (pre ? pre.title : q.requires) + '» để mở nhiệm vụ «' + q.title + '».';
      }
      return null;
    }
    return null;
  }
  function tickTracker() {
    var now = Date.now();
    if (now - trackerTickLast < 500) return;
    trackerTickLast = now;
    var el = $('qtText');
    if (!el) return;
    var txt = trackerText();
    if (txt !== trackerCache) { trackerCache = txt; el.textContent = txt; }
    // Chỉ đường đang bật mà nhiệm vụ theo dõi ĐỔI (nhận mới / trả
    // xong): đích tự đi phải ngắm lại theo nhiệm vụ mới — trước đây
    // moveTarget chỉ đặt một lần lúc bật nên nhân vật cứ đi tới
    // người giao cũ dù thẻ đã sang việc khác (playtest live 31/10).
    // Đích nay lấy theo MỤC TIÊU đang dở (guideTarget), và khóa đích
    // gồm cả tọa độ nên đích động đổi (quái đang bám chết -> chọn
    // con khác, dược đã hái -> điểm khác) cũng ngắm lại kịp thời.
    if (guideOn) {
      var gt = trackedQuest();
      var gid = gt ? gt.q.id : null;
      var gtg = gt ? guideTarget() : null;
      var gkey = gid + '|' + (gtg ? gtg.mapId + ':' + gtg.x + ',' + gtg.y : '-');
      if (gid !== guideQuestId || gkey !== guideTargetKey) {
        guideQuestId = gid;
        guideTargetKey = gkey;
        if (gtg && gtg.mapId === curMapId) { moveTarget = { x: gtg.x * TILE + 16, y: gtg.y * TILE + 28 }; movePath = null; }
        else moveTarget = null; movePath = null;
      }
    }
    var gb = $('qtGuide');
    if (gb) gb.textContent = guideOn ? '➤ Chỉ đường: Bật (tới ' + guideTargetName() + ')' : '➤ Chỉ đường: Tắt';
  }
  // ĐÍCH CHỈ ĐƯỜNG THEO MỤC TIÊU ĐANG DỞ (vá playtest live
  // 01/11/2026): trước đây chỉ đường chỉ biết NGƯỜI GIAO — nhiệm vụ
  // "Bí mật giếng cổ" (objective type 'well') vẫn chỉ về trưởng làng
  // Trần Đức, người chơi đứng ở giếng bấm E mãi không xong việc. Nay
  // đích lấy theo objective đầu tiên của nhiệm vụ đang theo dõi:
  //  - 'talk'    -> NPC đích (objective.target), như hành vi cũ khi
  //                 đích trùng người giao;
  //  - 'well'    -> ô giếng của map có giếng (trường .well trong dữ
  //                 liệu map), tên đích "Giếng cổ";
  //  - 'kill'    -> quái CÒN SỐNG thuộc loài đích gần người chơi
  //                 nhất trên map hiện tại; map này không có con
  //                 nào thì rơi về người giao như cũ;
  //  - 'collect' -> điểm dược CHƯA HÁI đúng vật phẩm đích gần nhất
  //                 trên map hiện tại; không có thì rơi về người
  //                 giao như cũ;
  //  - còn lại (tuvi / breakthrough / brew...) và nhiệm vụ ĐÃ XONG
  //    (chờ trả) -> người giao, giữ nguyên hành vi cũ.
  // Đích động (kill/collect) GIỮ NGUYÊN cá thể đã chọn chừng nào cá
  // thể đó còn sống/chưa hái — tránh mũi tên nhảy qua lại giữa hai
  // con gần ngang nhau; cá thể chết/đã hái thì lần gọi sau chọn lại
  // con gần nhất. Trả { name, mapId, x, y } theo Ô, hoặc null khi
  // không xác định được đích nào.
  var guideDynRef = null; // { questId, kind, ref } — cá thể động đang bám
  function guideTarget() {
    var t = trackedQuest();
    if (!t) { guideDynRef = null; return null; }
    function giverTarget() {
      var h = npcHome(t.q.giver);
      return h ? { name: questGiverName(t.q), mapId: h.mapId, x: h.npc.x, y: h.npc.y } : null;
    }
    if (t.done) return giverTarget(); // xong việc: về gặp người giao để trả
    var ob = t.q.objectives && t.q.objectives[0];
    if (!ob) return giverTarget();
    if (ob.type === 'talk' && ob.target) {
      var th = npcHome(ob.target);
      if (th) {
        var td = npcDef(th.npc);
        return { name: td.role ? td.name + ' — ' + td.role : td.name, mapId: th.mapId, x: th.npc.x, y: th.npc.y };
      }
      return giverTarget();
    }
    if (ob.type === 'well') {
      var wFound = null;
      Object.keys(M.MAPS).forEach(function (mid) {
        if (!wFound && M.MAPS[mid].well) wFound = { mapId: mid, well: M.MAPS[mid].well };
      });
      if (wFound) return { name: 'Giếng cổ', mapId: wFound.mapId, x: wFound.well.x, y: wFound.well.y };
      return giverTarget();
    }
    if (ob.type === 'kill' && ob.target) {
      if (guideDynRef && guideDynRef.questId === t.q.id && guideDynRef.kind === 'kill' &&
          guideDynRef.ref && guideDynRef.ref.hp > 0 && !guideDynRef.ref.dying) {
        var kr = guideDynRef.ref;
        return { name: kr.name || ob.target, mapId: curMapId, x: Math.floor(kr.x), y: Math.floor(kr.y) };
      }
      var kBest = null, kBd = Infinity;
      monsters.forEach(function (m) {
        if (m.type !== ob.target || m.hp <= 0 || m.dying) return;
        var dx = m.x * TILE + 16 - px, dy = m.y * TILE + 28 - py, d = dx * dx + dy * dy;
        if (d < kBd) { kBd = d; kBest = m; }
      });
      if (kBest) {
        guideDynRef = { questId: t.q.id, kind: 'kill', ref: kBest };
        return { name: kBest.name || ob.target, mapId: curMapId, x: Math.floor(kBest.x), y: Math.floor(kBest.y) };
      }
      guideDynRef = null;
      return giverTarget();
    }
    if (ob.type === 'collect' && ob.target) {
      if (guideDynRef && guideDynRef.questId === t.q.id && guideDynRef.kind === 'collect' &&
          guideDynRef.ref && !guideDynRef.ref.taken) {
        var cr = guideDynRef.ref;
        return { name: (L.ITEMS[ob.target] ? L.ITEMS[ob.target].name : ob.target), mapId: curMapId, x: cr.x, y: cr.y };
      }
      var cBest = null, cBd = Infinity;
      herbs.forEach(function (h) {
        if (h.item !== ob.target || h.taken) return;
        var dx = h.x * TILE + 16 - px, dy = h.y * TILE + 28 - py, d = dx * dx + dy * dy;
        if (d < cBd) { cBd = d; cBest = h; }
      });
      if (cBest) {
        guideDynRef = { questId: t.q.id, kind: 'collect', ref: cBest };
        return { name: (L.ITEMS[ob.target] ? L.ITEMS[ob.target].name : ob.target), mapId: curMapId, x: cBest.x, y: cBest.y };
      }
      guideDynRef = null;
      return giverTarget();
    }
    return giverTarget();
  }
  function guideTargetName() {
    var t = trackedQuest();
    if (!t) return 'người giao';
    var tg = guideTarget();
    return tg ? tg.name : questGiverName(t.q);
  }
  function toggleGuide() {
    guideOn = !guideOn;
    if (guideOn) {
      var t = trackedQuest();
      guideQuestId = t ? t.q.id : null;
      var tg = t ? guideTarget() : null;
      guideTargetKey = t ? (t.q.id + '|' + (tg ? tg.mapId + ':' + tg.x + ',' + tg.y : '-')) : null;
      if (t && tg) {
        if (tg.mapId === curMapId) {
          moveTarget = { x: tg.x * TILE + 16, y: tg.y * TILE + 28 }; movePath = null;
          toast('Đang chỉ đường tới ' + tg.name + ' — nhân vật tự đi, mũi tên vàng nhấp nháy trên đầu đích.');
        } else {
          toast(tg.name + ' đang ở ' + M.MAPS[tg.mapId].name + ' — qua cổng bản đồ để sang đó.');
        }
      }
    } else { guideQuestId = null; guideTargetKey = null; }
    trackerTickLast = 0; // nhãn nút cập nhật ngay khi bấm, khỏi chờ nhịp 500ms
    tickTracker();
  }
  function drawGuideArrow(now) {
    if (!guideOn) return;
    var t = trackedQuest();
    if (!t) return;
    var tg = guideTarget();
    if (!tg || tg.mapId !== curMapId) return;
    var sx = tg.x * TILE + 16 - camX, sy = tg.y * TILE - camY - 14 - Math.abs(Math.sin(now / 280)) * 6;
    if (sx < -20 || sy < -30 || sx > VIEW_W + 20 || sy > VIEW_H + 20) return;
    ctx.save();
    ctx.fillStyle = '#ffd94a';
    ctx.strokeStyle = 'rgba(0,0,0,.65)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 9, sy - 14); ctx.lineTo(sx + 9, sy - 14); ctx.lineTo(sx, sy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // MỤC 108: mũi tên dẫn đường tới quảng trường sơn môn map 3.
  // Chỉ hiện ở map 3 khi chưa bái nhập và chưa vào sân (luật trong
  // js/plaza-guide.js). Đích trong màn hình: tam giác vàng nhấp nháy
  // trên đích như mũi tên nhiệm vụ; đích ngoài màn hình: tam giác
  // xoay theo hướng đích, kẹp ở rìa màn hình kèm nhãn — đây là điểm
  // khác mũi tên nhiệm vụ cũ (nó bỏ qua đích ngoài màn hình).
  function drawPlazaGuideArrow(now) {
    if (!PLZ || curMapId !== 'map3' || !ch) return;
    var pt = playerTile();
    var info = PLZ.arrowFor(curMap(), curMapId, flags.sectJoined, pt, { x: camX, y: camY }, { w: effVW(), h: effVH() }, TILE);
    if (!info) return;
    var bob = Math.abs(Math.sin(now / 280)) * 6;
    ctx.save();
    ctx.fillStyle = '#ffd94a';
    ctx.strokeStyle = 'rgba(0,0,0,.65)'; ctx.lineWidth = 2;
    if (info.onScreen) {
      var sx = info.txPx, sy = info.tyPx - 14 - bob;
      ctx.beginPath();
      ctx.moveTo(sx - 9, sy - 14); ctx.lineTo(sx + 9, sy - 14); ctx.lineTo(sx, sy);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      var ex = info.ex, ey = info.ey;
      ctx.translate(ex, ey); ctx.rotate(info.angle);
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.rotate(-info.angle);
      ctx.font = '13px sans-serif'; ctx.fillStyle = '#ffd94a';
      ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 3;
      var label = 'Quảng Trường Sơn Môn';
      var ly = Math.max(16, Math.min(effVH() - 10, ey + (info.tyPx > effVH() / 2 ? 26 : -22)));
      ctx.strokeText(label, ex - 62, ly); ctx.fillText(label, ex - 62, ly);
    }
    ctx.restore();
  }

  // ---------- DẢI SỰ KIỆN TRỰC TIẾP (lệnh 20:22 mục 3) ----------
  // Chỉ hiện thông tin LẤY TỪ DỮ LIỆU THẬT của các hệ sẵn có; hệ
  // nào chưa có dữ liệu (thương nhân thần bí — game chưa có hệ sự
  // kiện ngẫu nhiên đó) thì bỏ hẳn dòng, không bịa.
  var tickerTickLast = 0, tickerItems = [], tickerKind = null;
  function tickerData() {
    var items = [], now = gameNow();
    try {
      if (SR) {
        var st = SR.status(flags, now);
        if (st && st.open) {
          var openDef = SR.openRealm ? SR.openRealm(now) : null;
          items.push({ kind: 'realms', text: 'Bí cảnh ' + (openDef ? openDef.name : '') + ' đang mở — còn ' + Math.floor(st.endsInSec / 60) + ':' + ('0' + (st.endsInSec % 60)).slice(-2) });
        }
        else if (st && st.next) items.push({ kind: 'realms', text: 'Bí cảnh mở lúc ' + (SR.fmtTime ? SR.fmtTime(st.next.start) : '') });
      }
    } catch (e) {}
    try {
      if (BT && BT.nextSession) {
        var nx = BT.nextSession(now);
        if (nx) items.push({ kind: 'tide', text: 'Thú Triều phiên sau: ' + (BT.fmtClock ? BT.fmtClock(nx.start) : '') + (nx.dayOffset ? ' (mai)' : '') });
      }
    } catch (e) {}
    try {
      if (RIFT) {
        var ri = RIFT.cycleInfo(now);
        if (ri && ri.active) items.push({ kind: 'rift', text: 'Vết nứt đang mở tại ' + ri.anchor.place + ' — còn ' + Math.max(0, Math.round((ri.expiresAt - now) / 60000)) + ' phút' });
      }
    } catch (e) {}
    try {
      if (FAIR) {
        if (FAIR.isOpen(now)) items.push({ kind: 'fair', text: 'Chợ Phiên Thanh Khê ĐANG MỞ hôm nay!' });
        else {
          var fd = FAIR.fairDateFor(now);
          if (fd) { var dd = new Date(fd); items.push({ kind: 'fair', text: 'Chợ Phiên: Chủ nhật ' + dd.getDate() + '/' + (dd.getMonth() + 1) }); }
        }
      }
    } catch (e) {}
    try {
      if (TD && TD.seasonOf) {
        var sea = TD.seasonOf(new Date(now));
        if (sea && sea.name) items.push({ kind: 'season', text: 'Tiết ' + sea.name + ' đang diễn ra' });
      }
    } catch (e) {}
    try {
      // Thương Nhân Thần Bí: chỉ hiện khi module sự kiện thế giới
      // THẬT SỰ đã nạp và phiên thương nhân đang chạy — module chưa
      // nối vào game thì dòng này tự vắng, không bịa.
      var WEV = (typeof window !== 'undefined' && window.PNT_WORLD_EVENTS) || (typeof globalThis !== 'undefined' && globalThis.PNT_WORLD_EVENTS) || null;
      if (WEV && WEV.merchantActive && WEV.merchantActive(flags, now)) {
        items.push({ kind: 'merchant', text: 'Thương Nhân Thần Bí đang ghé làng Thanh Khê!' });
      }
    } catch (e) {}
    return items;
  }
  function tickTicker() {
    var now = Date.now();
    if (now - tickerTickLast < 1000) return;
    tickerTickLast = now;
    var el = $('liveTicker');
    if (!el) return;
    var on = true;
    try { on = !(window.PNT_CONTROLS && window.PNT_CONTROLS.getSettings && window.PNT_CONTROLS.getSettings().view.ticker === false); } catch (e) {}
    tickerItems = (on && ch) ? tickerData() : [];
    if (!tickerItems.length) { el.style.display = 'none'; tickerKind = null; return; }
    var idx = Math.floor(now / 5000) % tickerItems.length;
    el.textContent = tickerItems[idx].text;
    tickerKind = tickerItems[idx].kind;
    el.style.display = 'block';
  }
  function tickerClick() {
    if (tickerKind === 'realms') openRealmPanel();
    else if (tickerKind === 'rift') openRiftPanel();
    else if (tickerKind === 'tide') { renderBeastTidePanel(); $('panelBeastTide').style.display = 'block'; }
    else if (tickerKind === 'fair') { renderFairPanel(); $('panelFair').style.display = 'block'; }
    else if (tickerKind === 'season') { renderTidePanel(); $('panelTide').style.display = 'block'; }
  }

  // ---------- QUÀ TÂN THỦ + THÀNH TỰU SỚM (lệnh 20:22 mục 2 + 5) ----------
  var welcomeTickLast = 0, achTickLast = 0, achToastUntil = 0;
  function tickWelcome() {
    var now = Date.now();
    if (now - welcomeTickLast < 1000) return;
    welcomeTickLast = now;
    if (!ch || !GC || flags.welcomeGiftSeen) return;
    if (GC.isUsed(flags, 'TANTHU')) { flags.welcomeGiftSeen = now; return; }
    flags.welcomeGiftSeen = now;
    var p = $('panelWelcome');
    if (p) p.style.display = 'block';
    saveGame();
  }
  function toastAch(text) {
    var el = $('achToast');
    if (!el) return;
    el.textContent = text;
    el.style.display = 'block';
    achToastUntil = Date.now() + 3500;
  }
  function achCtx() {
    var bx = bxTotals();
    var petsN = 0;
    try { if (PETS) petsN = PETS.ensurePets(ch).owned.length; } catch (e) {}
    var comp = false;
    try { if (COMP) comp = !!COMP.recruitedCompanion(flags); } catch (e) {}
    return {
      kills: bx.kills, bosses: bx.bosses, realmsEntered: bx.realmsEntered,
      herb: !!(flags.achEv && flags.achEv.herb), elite: !!(flags.achEv && flags.achEv.elite),
      questsDone: (qs.turnedIn || []).length, root: !!ch.root, tier: ch.tier || 0,
      pets: petsN, gifts: GC ? GC.usedList(flags).length : 0,
      companion: comp, sect: !!flags.sectJoined
    };
  }
  function tickAch() {
    var now = Date.now();
    if (achToastUntil && now > achToastUntil) { var at = $('achToast'); if (at) at.style.display = 'none'; achToastUntil = 0; }
    if (now - achTickLast < 1000) return;
    achTickLast = now;
    if (!ch) return;
    var st = lifetimeStats();
    st.playSec += 1; // giờ chơi: đếm từ bản này (1s/lần tick)
    if (!ACH) return;
    var fresh = ACH.check(ch, flags, qs, achCtx(), gameNow());
    fresh.forEach(function (d) {
      toastAch('Thành tựu: ' + d.name + '!');
      if (SND) SND.sfx('quest_complete');
      if (d.reward) {
        Object.keys(d.reward).forEach(function (iid) {
          L.addItem(ch, iid, d.reward[iid]);
          toast('Thưởng thành tựu "' + d.name + '": ' + (L.ITEMS[iid] ? L.ITEMS[iid].name : iid) + ' x' + d.reward[iid] + '.');
        });
      }
      saveGame();
    });
  }

  // ---------- HẠT MÔI TRƯỜNG (lệnh 20:22 mục 6) ----------
  // Thuần lớp vẽ trên canvas: lá rơi + cánh hoa + bướm ở làng (map1).
  // Tắt ở đồ hoạ Thấp và khi người chơi tắt trong Cài đặt. Game chưa
  // có chu kỳ ngày/đêm toàn cục nên không vẽ đom đóm — chỉ hạt ngày.
  function ambientFxOn() {
    if (gfxLevel === 'thap') return false;
    try { if (window.PNT_CONTROLS && window.PNT_CONTROLS.getSettings && window.PNT_CONTROLS.getSettings().view.ambientFx === false) return false; } catch (e) {}
    return true;
  }
  function drawAmbientFx(ts) {
    if (!ch || curMapId !== 'map1' || !ambientFxOn()) return;
    var t = (ts || 0) / 1000;
    ctx.save();
    for (var i = 0; i < 14; i++) {
      var sd = i * 73.7 + 31;
      var fx = ((sd * 13 + t * (7 + (i % 5) * 2.2)) % (VIEW_W + 48)) - 24;
      var fy = ((sd * 29 + t * (13 + (i % 4) * 4.5)) % (VIEW_H + 36)) - 18;
      var rot = t * (0.7 + (i % 3) * 0.35) + sd;
      ctx.save();
      ctx.translate(fx, fy); ctx.rotate(rot);
      ctx.fillStyle = i % 2 ? 'rgba(240,178,196,.55)' : 'rgba(126,184,80,.5)';
      ctx.beginPath(); ctx.ellipse(0, 0, 5.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    for (var b = 0; b < 3; b++) {
      var bx2 = VIEW_W * (0.22 + b * 0.27) + Math.sin(t * 0.43 + b * 2.1) * 66;
      var by2 = VIEW_H * (0.3 + (b % 2) * 0.22) + Math.cos(t * 0.61 + b * 1.7) * 30;
      var flap = Math.abs(Math.sin(t * 9 + b * 2)) * 5 + 1.5;
      ctx.fillStyle = 'rgba(255,214,90,.85)';
      ctx.beginPath(); ctx.ellipse(bx2 - flap, by2, flap, 3.4, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bx2 + flap, by2, flap, 3.4, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(40,30,16,.9)';
      ctx.fillRect(bx2 - 1, by2 - 3, 2, 6);
    }
    ctx.restore();
  }

  // ---------- DANH HIỆU (lệnh 20:24 mục 2) ----------
  // Chỉ là chữ trang trí — KHÔNG cộng chỉ số. Nguồn mở khoá đều từ
  // dữ liệu thật: đồ giám, đại hội, thú triều, bia truyền kỳ, thành
  // tựu, boss, hàm tông. Đeo 1 danh hiệu: flags.titleWorn, hiện ở
  // panel + HUD cạnh tên.
  var TITLES = [
    { id: 't_bx', name: 'Kẻ Khai Sổ Đồ Giám', cond: 'Đạt mốc điểm Đồ Giám đầu tiên', test: function () { try { return BX && BX.MILESTONES && BX.points(flags) >= BX.MILESTONES[0].pts; } catch (e) { return false; } } },
    { id: 't_ach', name: 'Người Có Chí', cond: 'Đạt thành tựu đầu tiên', test: function () { return !!(flags.ach && Object.keys(flags.ach).length >= 1); } },
    { id: 't_achall', name: 'Chí Tại Tiên Đồ', cond: 'Đạt đủ 12 thành tựu sớm', test: function () { return !!(flags.ach && Object.keys(flags.ach).length >= 12); } },
    { id: 't_boss', name: 'Đồ Long Giả', cond: 'Hạ boss thế giới đầu tiên', test: function () { return bxTotals().bosses >= 1; } },
    { id: 't_tourn', name: 'Quán Quân Đại Hội', cond: 'Vô địch một kỳ Đại Hội Tu Tiên', test: function () { try { return !!(TOURN && TOURN.titleText && TOURN.titleText(flags)); } catch (e) { return false; } } },
    { id: 't_tide', name: 'Thủ Thành Anh Hùng', cond: 'Giữ trọn một phiên Thú Triều (có công thủ thành)', test: function () { return (flags.beastTideMerit || 0) > 0; } },
    { id: 't_legend', name: 'Danh Chấn Thanh Sơn', cond: 'Có dòng khắc trên Bia Truyền Kỳ', test: function () { try { return !!(LG && LG.entries && LG.entries(flags).length > 0); } catch (e) { return false; } } },
    { id: 't_sect', name: 'Đệ Tử Nội Môn', cond: 'Đạt hàm Nội Môn Đệ Tử trong tông môn', test: function () { try { return !!(SECTP && SECTP.rankOf(ch).idx >= 1); } catch (e) { return false; } } }
  ];
  function titleById(id) { for (var i = 0; i < TITLES.length; i++) if (TITLES[i].id === id) return TITLES[i]; return null; }
  function wornTitleName() {
    if (!flags.titleWorn) return '';
    var t = titleById(flags.titleWorn);
    return (t && t.test()) ? t.name : '';
  }

  // ---------- GIFTCODE: cộng thưởng qua đúng đường của game ----------
  function applyGiftPlan(plan) {
    var rw = plan.rewards || {};
    var parts = [];
    if (rw.linhThach) {
      var lt = AC ? AC.guardGain('gift', rw.linhThach) : rw.linhThach;
      ch.linhThach += lt;
      parts.push('+' + lt + ' Linh Thạch');
    }
    if (rw.tuVi) {
      var g = L.gainTuVi(ch, AC ? AC.guardGain('gift', rw.tuVi) : rw.tuVi);
      parts.push('+' + g + ' tu vi');
    }
    if (rw.items) Object.keys(rw.items).forEach(function (iid) {
      L.addItem(ch, iid, rw.items[iid]);
      parts.push((L.ITEMS[iid] ? L.ITEMS[iid].name : iid) + ' x' + rw.items[iid]);
    });
    GC.markUsed(flags, plan.code);
    if (SND) SND.sfx('quest_complete');
    updateHUD(); saveGame();
    return parts.join(', ');
  }
  function redeemGiftCode(rawCode) {
    if (!GC || !ch) return { ok: false, msg: 'Chưa vào game.' };
    var plan = GC.plan(ch, flags, rawCode, gameNow());
    if (!plan.ok) return plan;
    var got = applyGiftPlan(plan);
    toast('Giftcode ' + plan.code + ': nhận ' + got + '!');
    return { ok: true, code: plan.code, got: got, msg: 'Nhận thành công: ' + got + '.' };
  }

  // ---------- PANEL NHÂN VẬT ĐẦY ĐỦ (lệnh 20:19 + 20:24) ----------
  function escH(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  // ---------- NGƯỜI GIẤY panel Nhân Vật — MẪU A (lệnh Bui 22:01 30/10) ----------
  // Nhân vật đứng giữa hướng mặt trước, trang bị bao quanh. Hình nhân
  // vật VẼ LẠI BẰNG ĐÚNG sheet/logic engine dùng ngoài map (thứ bậc:
  // tủ đồ > trang phục cảnh giới > đồ cảnh giới/tông > nền, + vũ khí
  // cầm tay ở điểm tay) vào canvas riêng, frame đứng yên hướng xuống,
  // KHÔNG vẽ hình mới. Ô trang bị đọc đúng mô hình đeo hiện có (vũ khí
  // ch.equipUid, 2 ô pháp bảo ART, ô trang phục tủ đồ); bấm ô mở đúng
  // popup So sánh/Đeo ngay của túi đồ (openCompare) hoặc panel Tủ đồ.
  function dollSlotHtml(slotId, iconId, label, itemName, enh, gradeColor, empty, small) {
    return '<div class="doll-slot' + (empty ? ' empty' : '') + (small ? ' small' : '') + '" id="' + slotId + '" role="button" title="' + escH(label) + '" style="border-color:' + (gradeColor || '#8b5a2b') + '">'
      + '<canvas id="' + iconId + '" width="52" height="52"></canvas>'
      + (enh > 0 ? '<span class="ds-enh">+' + enh + '</span>' : '')
      + '<span class="ds-name">' + escH(itemName || label) + '</span></div>';
  }
  // Ô gear mới (js/gear.js): id theo khoá ô (nhẫn: nhan0/nhan1).
  function dollGearSlotHtml(key, ring, small) {
    var meta = GR.SLOTS[key];
    var def = GR.equippedDefAt(ch, key, ring || 0);
    var sid = 'dollSlotGear_' + key + (key === 'nhan' ? ring : '');
    var iid = 'dollIconGear_' + key + (key === 'nhan' ? ring : '');
    var label = (key === 'nhan' ? 'Nhẫn ' + (ring + 1) : meta.name) + ' — ' + meta.role + ' · bấm để So sánh/Đeo/Tháo';
    var gname = def ? def.name : ((key === 'nhan' ? 'Nhẫn ' + (ring + 1) : meta.name) + ' (trống)');
    var glow = def ? ((GR.GRADES[def.grade] || {}).glow || '#8b5a2b') : null;
    return dollSlotHtml(sid, iid, label, gname, 0, glow, !def, small);
  }
  function dollHtml() {
    if (GR) GR.ensureGear(ch);
    var wE = (W && W.equippedEntry) ? W.equippedEntry(ch) : null;
    var wDef = wE ? W.WEAPONS[wE.id] : null;
    var a0 = ART ? ART.equippedDefAt(ch, 0) : null;
    var a1 = ART ? ART.equippedDefAt(ch, 1) : null;
    var wornC = (WD && WD.wornDef) ? WD.wornDef(ch) : null;
    var gW = wDef ? ((W.GRADES[wDef.grade] || {}).glow || '#8b5a2b') : null;
    var gA0 = a0 ? ((ART.GRADES[a0.grade] || {}).glow || '#8b5a2b') : null;
    var gA1 = a1 ? ((ART.GRADES[a1.grade] || {}).glow || '#8b5a2b') : null;
    var petName = null;
    try {
      if (PETS) { var ap0 = PETS.activePet(ch); if (ap0) petName = PETS.species(ap0.sp).name; }
    } catch (e) {}
    var chip = 'Đang mặc: ' + (wDef ? wDef.name : 'Tay không') + ' · ' + (wornC ? wornC.name : 'Trang phục mặc định');
    var h = '<div class="doll-stack"><div class="doll-wrap">'
      + '<div class="doll-col">'
      + '<div class="doll-group" style="margin-top:0">Tay cầm</div>'
      + dollSlotHtml('dollSlotWeapon', 'dollIconWeapon', 'Vũ khí — bấm để So sánh/Đeo/Tháo', wDef ? wDef.name : 'Vũ khí (trống)', wE ? (wE.enh || 0) : 0, gW, !wDef)
      + dollSlotHtml('dollSlotArt0', 'dollIconArt0', 'Pháp bảo ô 1 — bấm để So sánh/Đeo/Tháo', a0 ? a0.name : 'Pháp bảo 1 (trống)', 0, gA0, !a0)
      + dollSlotHtml('dollSlotArt1', 'dollIconArt1', 'Pháp bảo ô 2 — bấm để So sánh/Đeo/Tháo', a1 ? a1.name : 'Pháp bảo 2 (trống)', 0, gA1, !a1)
      + dollSlotHtml('dollSlotPet', 'dollIconPet', 'Linh thú — bấm để mở panel Linh thú', petName ? petName : 'Linh thú (trống)', 0, petName ? '#7ec850' : null, !petName)
      + '</div>'
      + '<div style="text-align:center"><canvas id="charDoll" width="144" height="168" style="background:#1d1812;border:2px solid #8b5a2b;border-radius:8px"></canvas>'
      + '<br><span class="doll-chip">' + escH(chip) + '</span></div>'
      + '<div class="doll-col">'
      + '<div class="doll-group" style="margin-top:0">Thân trên</div>';
    if (GR) {
      h += dollGearSlotHtml('mu')
        + dollGearSlotHtml('giap')
        + dollSlotHtml('dollSlotCostume', 'dollIconCostume', 'Trang phục — bấm để mở Tủ đồ', wornC ? wornC.name : 'Trang phục (mặc định)', 0, wornC ? '#c9a959' : null, !wornC)
        + dollGearSlotHtml('choang');
    } else {
      h += dollSlotHtml('dollSlotCostume', 'dollIconCostume', 'Trang phục — bấm để mở Tủ đồ', wornC ? wornC.name : 'Trang phục (mặc định)', 0, wornC ? '#c9a959' : null, !wornC);
    }
    h += '</div></div>';
    if (GR) {
      h += '<div class="doll-group">Phòng thân — Đai · Tay · Chân</div>'
        + '<div class="doll-row">'
        + dollGearSlotHtml('dai') + dollGearSlotHtml('baotay') + dollGearSlotHtml('giay')
        + '</div>'
        + '<div class="doll-group">Trang sức — ô nhỏ, chỉ số tinh chỉnh</div>'
        + '<div class="doll-row small">'
        + dollGearSlotHtml('tram', 0, true) + dollGearSlotHtml('vongco', 0, true) + dollGearSlotHtml('vongtay', 0, true)
        + dollGearSlotHtml('nhan', 0, true) + dollGearSlotHtml('nhan', 1, true)
        + '</div>';
    }
    h += '</div>'
      + '<div style="text-align:center;font-size:11px;color:#8a7a5a;margin:0 0 8px">Bấm vào ô trang bị để So sánh / Đeo / Tháo</div>';
    return h;
  }
  function drawCharDoll() {
    var cv = $('charDoll');
    if (!cv || !ch) return;
    var c2 = cv.getContext('2d');
    if (!c2) return;
    c2.clearRect(0, 0, cv.width, cv.height);
    var K = cv.width / 96; // canvas 144x168 = không gian map 96x112 phóng 1,5 lần
    c2.save();
    c2.scale(K, K);
    var AX = 48, AY = 104; // neo chân (không gian map)
    // SÂN KHẤU panel Nhân Vật (thiết kế GĐ2): vòng hào quang vàng sau
    // lưng + đế đài dưới chân — người giấy đứng trên đài, hết nền phẳng.
    c2.fillStyle = '#241c11';
    c2.fillRect(0, 0, 96, 112);
    var halo = c2.createRadialGradient(AX, 54, 6, AX, 54, 46);
    halo.addColorStop(0, 'rgba(255,214,110,0.5)');
    halo.addColorStop(0.7, 'rgba(201,169,89,0.22)');
    halo.addColorStop(1, 'rgba(201,169,89,0)');
    c2.fillStyle = halo;
    c2.beginPath(); c2.arc(AX, 54, 46, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = 'rgba(230,190,100,0.85)';
    c2.lineWidth = 1.6;
    c2.beginPath(); c2.arc(AX, 54, 41, 0, Math.PI * 2); c2.stroke();
    c2.strokeStyle = 'rgba(230,190,100,0.4)';
    c2.lineWidth = 1;
    c2.beginPath(); c2.arc(AX, 54, 35.5, 0, Math.PI * 2); c2.stroke();
    c2.fillStyle = '#3a2d1a';
    c2.beginPath(); c2.ellipse(AX, AY + 2, 34, 7.5, 0, 0, Math.PI * 2); c2.fill();
    c2.strokeStyle = 'rgba(230,190,100,0.65)';
    c2.beginPath(); c2.ellipse(AX, AY + 2, 34, 7.5, 0, 0, Math.PI * 2); c2.stroke();
    c2.fillStyle = '#2c2113';
    c2.beginPath(); c2.ellipse(AX, AY + 0.5, 26, 5, 0, 0, Math.PI * 2); c2.fill();
    var drew = false;
    if (gfxLevel !== 'thap' && HAI) {
      var hOrigin = ch.origin, hInfo = null;
      if (ch.look && HAI.looks && HAI.looks[ch.gender + '_' + ch.look]) { hOrigin = ch.look; hInfo = HAI.looks[ch.gender + '_' + ch.look]; }
      if (!hInfo) hInfo = (HAI.types && HAI.types[ch.gender + '_' + ch.origin]) || { cellCao: 192, cellTrung: 120, dispW: 96, dispH: 96 };
      var dx = AX - hInfo.dispW / 2, dy = AY - hInfo.dispH;
      var set = 'down-idle';
      var rcDrew = false;
      if (RC) {
        var wornPre = (WD && typeof WD.wornId === 'function') ? WD.wornId(ch) : null;
        var rkPre = (M && typeof M.realmRankOf === 'function') ? M.realmRankOf(ch) : 0;
        if (!wornPre && rkPre >= 2 && RC.costumeId(rkPre, ch.gender)) {
          var rcSheet = getRealmCostumeSheet(gfxLevel, rkPre, ch.gender, set);
          if (rcSheet) {
            var rcCell = gfxLevel === 'cao' ? 192 : 120;
            c2.drawImage(rcSheet, 0, 0, rcCell, rcCell, dx, dy, hInfo.dispW, hInfo.dispH);
            rcDrew = true; drew = true;
            if (HRM && ch.root) {
              var gSR = getGemSheet(gfxLevel, ch.root, ch.gender, set);
              if (gSR) { var gCR = gfxLevel === 'cao' ? HRM.cellCao : HRM.cellTrung; c2.drawImage(gSR, 0, 0, gCR, gCR, dx, dy, hInfo.dispW, hInfo.dispH); }
            }
          }
        }
      }
      if (!rcDrew) {
        var sheet = getHeroSheet(gfxLevel, ch.gender, hOrigin, set);
        var cell = gfxLevel === 'cao' ? hInfo.cellCao : hInfo.cellTrung;
        // ĐỒ TÔNG (mục 26) trong ảnh đại diện: cùng luật layerFor như
        // khi vẽ trên map — chưa bái sư thì không bao giờ thay sheet.
        if (SL && flags) {
          var wornDoll = (WD && typeof WD.wornId === 'function') ? WD.wornId(ch) : null;
          var rkDoll = (M && typeof M.realmRankOf === 'function') ? M.realmRankOf(ch) : 0;
          if (SL.layerFor(flags, wornDoll, rkDoll, ch.gender)) {
            var sectDoll = getSectSheet(gfxLevel, flags.sectJoined, ch.gender, set);
            if (sectDoll) { sheet = sectDoll; cell = gfxLevel === 'cao' ? 192 : 120; }
          }
        }
        if (sheet) {
          c2.drawImage(sheet, 0, 0, cell, cell, dx, dy, hInfo.dispW, hInfo.dispH);
          drew = true;
          if (WD && CAI) {
            var wornC = WD.wornId(ch);
            if (wornC) {
              var cSheet = getCostumeSheet(gfxLevel, wornC, ch.gender, set);
              if (cSheet) {
                var cType = CAI.types[wornC];
                var cCell = gfxLevel === 'cao' ? (cType.cellCao || 192) : (cType.cellTrung || 120);
                c2.drawImage(cSheet, 0, 0, cCell, cCell, dx, dy, hInfo.dispW, hInfo.dispH);
              }
            }
          }
          if (HRM) {
            var wornNow = (WD && typeof WD.wornId === 'function') ? WD.wornId(ch) : null;
            if (!wornNow) {
              var rkNow = (M && typeof M.realmRankOf === 'function') ? M.realmRankOf(ch) : 0;
              var rSheet = getRealmOvSheet(gfxLevel, ch.gender, hOrigin, rkNow, set);
              if (rSheet) { var rCell = gfxLevel === 'cao' ? HRM.cellCao : HRM.cellTrung; c2.drawImage(rSheet, 0, 0, rCell, rCell, dx, dy, hInfo.dispW, hInfo.dispH); }
            }
            if (ch.root) {
              var gSheet = getGemSheet(gfxLevel, ch.root, ch.gender, set);
              if (gSheet) { var gCell = gfxLevel === 'cao' ? HRM.cellCao : HRM.cellTrung; c2.drawImage(gSheet, 0, 0, gCell, gCell, dx, dy, hInfo.dispW, hInfo.dispH); }
            }
          }
        }
      }
    }
    if (!drew) {
      var fr = S.idleFrame(ch.gender, 'down', 0, ch.origin);
      S.drawPixelsToCanvas(c2, fr, AX - 48, AY - 96, 3);
    }
    // Vũ khí cầm tay ở điểm tay hướng xuống — cùng hàm engine dùng.
    if (W && W.equippedDef) {
      var heldDef = W.equippedDef(ch);
      if (heldDef) {
        var hn = W.HAND && W.HAND.down;
        if (hn && W.drawHeldAt) W.drawHeldAt(c2, heldDef, 'down', AX - 48 + hn.gx * 3, AY - 96 + hn.gy * 3, gfxLevel);
        else if (W.drawHeld) W.drawHeld(c2, heldDef, 'down', AX, AY, gfxLevel);
      }
    }
    // Linh thú đang xuất chiến đứng cạnh chân trên sân khấu (thiết kế
    // GĐ2): strip front-idle frame 0 của loài, cỡ ~40% hình ngoài map;
    // sheet chưa nạp thì rơi về lưới Thấp của pet-ai. Nhẫn và các lớp
    // đeo gear mới KHÔNG vẽ lên người giấy (chưa có asset overlay đạt
    // chuẩn — đúng luật thiết kế: chưa đạt thì ẩn, chỉ hiện icon ô).
    try {
      if (PETS && PAI) {
        var apD = PETS.activePet(ch);
        if (apD) {
          var pInfD = PAI.types ? PAI.types[apD.sp] : null;
          var petDrew = false;
          if (gfxLevel !== 'thap' && pInfD) {
            var pSheetD = getPetSheet(gfxLevel, apD.sp, 'front-idle');
            if (pSheetD) {
              var pCellD = gfxLevel === 'cao' ? pInfD.cellCao : pInfD.cellTrung;
              var pWD = 38, pHD = 38;
              c2.drawImage(pSheetD, 0, 0, pCellD, pCellD, AX + 16, AY - pHD + 4, pWD, pHD);
              petDrew = true;
            }
          }
          if (!petDrew) {
            var pGridD = petGridFrame(apD.sp, 'front', 'idle', 0);
            if (pGridD && S.drawPixelsToCanvas) S.drawPixelsToCanvas(c2, pGridD, AX + 20, AY - 30, 1.2);
          }
        }
      }
    } catch (e) {}
    c2.restore();
  }
  function artEntryAtSlot(slot) {
    if (!ART) return null;
    var found = null;
    ART.artifactEntries(ch).forEach(function (x) { if (ART.slotOf(ch, x.uid) === slot) found = x; });
    return found;
  }
  function wireDoll() {
    try { drawCharDoll(); } catch (e) {}
    // Sheet AI nạp bất đồng bộ: vẽ lại một nhịp sau nếu panel còn mở.
    setTimeout(function () { if ($('panelCharacter') && $('panelCharacter').style.display === 'block') { try { drawCharDoll(); } catch (e) {} } }, 700);
    function iconCtx(id) { var c = $(id); return c ? c.getContext('2d') : null; }
    var wE = (W && W.equippedEntry) ? W.equippedEntry(ch) : null;
    if (wE && W.drawIcon) { var xw = iconCtx('dollIconWeapon'); if (xw) { try { W.drawIcon(xw, W.WEAPONS[wE.id], 2, 2, 3); } catch (e) {} } }
    [0, 1].forEach(function (slot) {
      var ae = artEntryAtSlot(slot);
      if (ae && ART.drawIconArt) { var xa = iconCtx('dollIconArt' + slot); if (xa) { try { ART.drawIconArt(xa, ART.ARTIFACTS[ae.id], 2, 2, 48, gfxLevel); } catch (e) {} } }
    });
    var wornC = (WD && WD.wornDef) ? WD.wornDef(ch) : null;
    if (wornC) {
      var xc = iconCtx('dollIconCostume');
      if (xc) {
        try {
          var cSh = (WD && CAI) ? getCostumeSheet(gfxLevel, wornC.id, ch.gender, 'down-idle') : null;
          if (cSh) { var cT = CAI.types[wornC.id]; var cC = gfxLevel === 'cao' ? (cT.cellCao || 192) : (cT.cellTrung || 120); xc.drawImage(cSh, 0, 0, cC, cC, 2, 2, 48, 48); }
          else if (wornC.colors) { wornC.colors.forEach(function (col, i) { xc.fillStyle = col; xc.fillRect(2 + i * 16, 14, 16, 24); }); }
        } catch (e) {}
      }
    }
    // Icon + bind 11 ô gear mới (js/gear.js): icon vẽ theo loại/phẩm;
    // ô có đồ bấm mở So sánh của món đó, ô trống bấm mở Túi đồ.
    if (GR) {
      var gearKeys = ['mu', 'giap', 'choang', 'dai', 'baotay', 'giay', 'tram', 'vongco', 'vongtay'];
      gearKeys.forEach(function (key) {
        var ge = GR.equippedEntryAt(ch, key);
        if (ge) { var xg = iconCtx('dollIconGear_' + key); if (xg) { try { GR.drawIcon(xg, GR.GEAR[ge.id], 2, 2, 3); } catch (e) {} } }
        bindSlotLater('dollSlotGear_' + key, key, -1);
      });
      [0, 1].forEach(function (ring) {
        var re2 = GR.equippedEntryAt(ch, 'nhan', ring);
        if (re2) { var xr = iconCtx('dollIconGear_nhan' + ring); if (xr) { try { GR.drawIcon(xr, GR.GEAR[re2.id], 2, 2, 3); } catch (e) {} } }
        bindSlotLater('dollSlotGear_nhan' + ring, 'nhan', ring);
      });
    }
    // Icon ô Linh thú: strip front-idle của loài đang xuất chiến.
    try {
      if (PETS && PAI) {
        var apI = PETS.activePet(ch);
        var xp = iconCtx('dollIconPet');
        if (apI && xp) {
          var pInfI = PAI.types ? PAI.types[apI.sp] : null;
          var drewPI = false;
          if (gfxLevel !== 'thap' && pInfI) {
            var pShI = getPetSheet(gfxLevel, apI.sp, 'front-idle');
            if (pShI) { var pCI = gfxLevel === 'cao' ? pInfI.cellCao : pInfI.cellTrung; xp.drawImage(pShI, 0, 0, pCI, pCI, 2, 2, 48, 48); drewPI = true; }
          }
          if (!drewPI) { var pGI = petGridFrame(apI.sp, 'front', 'idle', 0); if (pGI && S.drawPixelsToCanvas) S.drawPixelsToCanvas(xp, pGI, 10, 10, 1.15); }
        }
      }
    } catch (e) {}
    function bindSlot(id, fn) { var el = $(id); if (el) el.addEventListener('click', function (ev) { if (ev && ev.stopPropagation) ev.stopPropagation(); fn(); }); }
    function bindSlotLater(id, key, ring) {
      bindSlot(id, function () {
        var e3 = GR.equippedEntryAt(ch, key, ring < 0 ? 0 : ring);
        if (e3) openCompare('gear', e3.uid);
        else { $('panelCharacter').style.display = 'none'; renderInventory(); $('panelInv').style.display = 'block'; }
      });
    }
    bindSlot('dollSlotWeapon', function () {
      var e2 = (W && W.equippedEntry) ? W.equippedEntry(ch) : null;
      if (e2) openCompare('weapon', e2.uid);
      else { $('panelCharacter').style.display = 'none'; renderInventory(); $('panelInv').style.display = 'block'; }
    });
    bindSlot('dollSlotArt0', function () { dollArtClick(0); });
    bindSlot('dollSlotArt1', function () { dollArtClick(1); });
    bindSlot('dollSlotCostume', function () {
      $('panelCharacter').style.display = 'none'; renderWardrobePanel(); $('panelWardrobe').style.display = 'block';
    });
    bindSlot('dollSlotPet', function () {
      $('panelCharacter').style.display = 'none'; renderPetPanel(); $('panelPets').style.display = 'block';
    });
  }
  function dollArtClick(slot) {
    var ae = artEntryAtSlot(slot);
    if (ae) openCompare('artifact', ae.uid);
    else { $('panelCharacter').style.display = 'none'; renderInventory(); $('panelInv').style.display = 'block'; }
  }
  // Đeo/tháo qua popup So sánh xong: panel Nhân Vật (nếu đang mở dưới
  // popup) vẽ lại NGAY người giấy + ô + chỉ số (lệnh Bui 22:01 30/10).
  function refreshDollIfOpen() {
    var p = $('panelCharacter');
    if (p && p.style.display === 'block') renderCharacterPanel();
  }
  function renderCharacterPanel() {
    var body = $('charBody');
    if (!body || !ch) return;
    var h = '';
    h += dollHtml();
    // Đầu panel: tạo hình + danh tính + dấu ấn.
    var lookSrc = ch.look ? 'assets/looks/' + ch.look + '.png' : 'assets/looks/' + ch.gender + '_' + ch.origin + '.png';
    var orgName = (L.ORIGINS[ch.origin] || {}).name || ch.origin;
    var storyDef = (OG && OG.byId) ? OG.byId(ch.storyOrigin) : null;
    var tokenName = '';
    try { if (OG && OG.tokenOf) { var tk = OG.tokenOf(ch); if (tk && L.ITEMS[tk]) tokenName = L.ITEMS[tk].name + (OG.hasToken(ch) ? ' (đang giữ)' : ' (đã dùng/mất)'); } } catch (e) {}
    var worn = wornTitleName();
    h += '<div style="display:flex;gap:12px;align-items:flex-start">'
      + '<img src="' + lookSrc + '" alt="Tạo hình" style="width:84px;height:84px;object-fit:contain;background:#241f18;border:2px solid #8b5a2b;border-radius:8px">'
      + '<div><b style="font-size:17px">' + escH(ch.name) + '</b>'
      + (worn ? '<br><span style="color:#8a6d00;font-weight:bold">«' + escH(worn) + '»</span>' : '')
      + '<br>Giới tính: ' + (ch.gender === 'nu' ? 'Nữ' : 'Nam') + ' · Xuất thân: ' + escH(orgName)
      + (storyDef ? '<br>Nguồn gốc: ' + escH(storyDef.name) : '')
      + (tokenName ? '<br>Vật dấu ấn: ' + escH(tokenName) : '')
      + '</div></div>';
    // Linh căn + cảnh giới + thanh tu vi.
    var info = cultInfo();
    var pct = Math.min(100, Math.floor(ch.tuVi / ch.tuViMax * 100));
    h += '<h4 style="margin:10px 0 4px">Tu hành</h4>'
      + '<div>Linh căn: <b>' + (ch.root ? escH(L.rootOf(ch).name) : 'Chưa lộ linh căn') + '</b>'
      + ' · Cảnh giới: <b>' + escH(ch.realm) + '</b></div>'
      + '<div style="background:#2a2016;border:1px solid #8b5a2b;border-radius:6px;height:13px;overflow:hidden;margin:4px 0"><div style="background:#7ec850;height:100%;width:' + pct + '%"></div></div>'
      + '<div style="font-size:13px">Tu vi: <b>' + Math.floor(ch.tuVi) + '/' + ch.tuViMax + '</b>' + (info && info.targetRealm ? ' · Đích kế: <b>' + escH(info.targetRealm) + '</b>' : ' · Đã ở đỉnh thang hiện tại') + '</div>';
    // Lộ trình đột phá (mục 1 lệnh 20:24): điều kiện lấy nguyên từ
    // cultInfo() — cùng nguồn BREAK_RULES/logic mà panel Tu Hành dùng.
    if (info && !info.atMax && info.conditions) {
      h += '<div style="margin-top:6px"><b>Lộ trình đột phá:</b>';
      info.conditions.forEach(function (c) {
        h += '<div style="padding:2px 0;border-bottom:1px solid #e2d3ac;font-size:13px"><span style="color:' + (c.met ? '#2e7d32' : '#a33') + '"><b>' + (c.met ? '✓' : '✗') + '</b></span> <b>' + escH(c.label) + '</b> — ' + escH(c.detail) + '</div>';
      });
      h += (info.canAttempt
        ? '<button id="charBreakGo" style="margin-top:6px">Đột phá ngay</button>'
        : '<div style="font-size:12px;color:#777;margin-top:4px">Đủ hết các dòng trên thì nút Đột phá sẽ sáng ở đây (đi đúng đường đột phá của panel Tu Hành).</div>')
        + '</div>';
    }
    // Chỉ số tổng + tách nguồn trang bị (statTotals chỉ cộng TRANG BỊ —
    // hiện tổng hiệu dụng + phần trang bị cộng thêm, không bịa tách
    // nguồn sâu hơn dữ liệu cho phép).
    var tot = L.statTotals ? L.statTotals(ch) : {};
    var wDef = W ? W.equippedDef(ch) : null;
    h += '<h4 style="margin:10px 0 4px">Chỉ số</h4><div style="font-size:14px;line-height:1.5">'
      + 'Máu: <b>' + Math.max(0, Math.ceil(ch.hp)) + '/' + (L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp) + '</b>'
      + ' · Tấn công: <b>' + L.effAtk(ch) + '</b>'
      + ' · Phòng thủ: <b>' + (L.effDef ? L.effDef(ch) : ch.def) + '</b>'
      + ' · Linh lực: <b>' + Math.floor(ch.ll || 0) + '/' + (SK ? SK.maxLinhLuc(ch) : 0) + '</b>'
      + '<br><span style="font-size:13px">Trang bị cộng thêm: Máu +' + (tot.hp || 0) + ' · Phòng thủ +' + (tot.def || 0)
      + (wDef ? ' · Vũ khí: ' + escH(wDef.name) + ' (công +' + wDef.atk + ')' : ' · Tay không')
      + (tot.speed ? ' · Tốc độ +' + tot.speed + '%' : '') + '</span></div>';
    // Chỉ số phụ (mục 3 lệnh 20:24): chỉ hiện trường CÓ THẬT trong
    // statTotals/tổng pháp bảo và đang > 0; trần lấy từ CAPS sẵn có.
    var artTot = {};
    try { if (ART) artTot = ART.totalStats(ch) || {}; } catch (e) {}
    var secRows = [];
    function secRow(label, val, suffix, cap) {
      if (!val) return;
      secRows.push(label + ': <b>+' + val + (suffix || '%') + '</b>' + (cap ? ' <span style="color:#777">(trần +' + cap + (suffix || '%') + ')</span>' : ''));
    }
    secRow('Giảm sát thương', artTot.dmgRed);
    secRow('Hồi linh lực', tot.llRegen, '%', (ART && ART.CAPS) ? ART.CAPS.llRegen : null);
    secRow('Tốc độ di chuyển', tot.speed, '%', (ART && ART.CAPS) ? ART.CAPS.speed : null);
    secRow('Tỉ lệ rơi đồ', artTot.dropPct);
    secRow('Linh Thạch nhận', artTot.ltPct);
    secRow('Tu vi nhận', artTot.tuViPct);
    secRow('Hồi Máu theo thời gian', artTot.regenPct);
    secRow('Hiệu quả hồi phục', artTot.healPct);
    secRow('Sát thương lên boss', artTot.vsBoss);
    secRow('Chí mạng', tot.critCh, '%');
    secRow('Hút máu', tot.lifesteal);
    if (secRows.length) h += '<div style="font-size:13px;margin-top:4px"><b>Chỉ số phụ:</b> ' + secRows.join(' · ') + '</div>';
    // Tông môn + Thiên Đạo Ấn/Luyện Thể.
    if (flags.sectJoined && SECT) {
      var sd = SECT.sectById(flags.sectJoined);
      var rk = null;
      try { if (SECTP) rk = SECTP.rankOf(ch); } catch (e) {}
      h += '<div style="margin-top:6px">Tông môn: <b>' + escH(sd ? sd.name : flags.sectJoined) + '</b>'
        + (rk ? ' · Hàm: <b>' + escH(rk.name) + '</b> · Điểm Cống Hiến: <b>' + rk.points + '</b> (tổng ' + rk.total + ')' : '') + '</div>';
    }
    if (RM) {
      h += '<div style="font-size:13px">Thiên Đạo Ấn: <b>' + (ch.thienDaoAn || 0) + '/' + RM.AN_MAX + '</b> (mỗi ấn +2% Máu và +2% công)'
        + (ch.temperTotal ? ' · Luyện Thể: <b>+' + ch.temperTotal.maxHp + ' Máu, +' + ch.temperTotal.def + ' thủ, +' + ch.temperTotal.atk + ' công</b>' : ' · Luyện Thể: chưa có điểm') + '</div>';
    }
    // Hiệu ứng đang active.
    var fxRows = [];
    try {
      if (ALCH) ALCH.activeBuffs(ch).forEach(function (b) {
        fxRows.push('Đan dược: ' + escH(b.stat) + ' +' + b.val + ' (còn ' + Math.max(0, Math.round((b.until - Date.now()) / 1000)) + 's)');
      });
    } catch (e) {}
    try { if (flags.formation && FM) { var fd = FM.formationById ? FM.formationById(flags.formation.type) : null; fxRows.push('Trận kỳ: ' + escH(fd ? fd.name : flags.formation.type) + ' đang cắm'); } } catch (e) {}
    try { if (ch.art && ch.art.shield) fxRows.push('Pháp bảo hộ thể đang bật'); } catch (e) {}
    try {
      if (TD && TD.seasonOf) {
        var sea2 = TD.seasonOf(new Date(gameNow()));
        if (sea2 && sea2.id === 'tinh_tu') fxRows.push('Tiết Tĩnh Tu: thổ nạp x1,25');
      }
    } catch (e) {}
    if (fxRows.length) h += '<div style="font-size:13px;margin-top:4px"><b>Hiệu ứng đang chạy:</b> ' + fxRows.join(' · ') + '</div>';
    // Thẻ linh thú + công pháp (mục 4 lệnh 20:24).
    h += '<h4 style="margin:10px 0 4px">Linh thú & Công pháp</h4>';
    try {
      if (PETS) {
        var ap = PETS.activePet(ch);
        if (ap) {
          var ad = PETS.species(ap.sp);
          h += '<div style="font-size:14px">Linh thú xuất chiến: <b>' + escH(ad.name) + '</b> · Cấp ' + ap.level
            + ' · Kỹ năng: <b>' + escH(ad.skill ? ad.skill.name : '—') + '</b>'
            + (typeof ap.evo === 'number' ? ' · Bậc tiến hoá ' + ap.evo : '')
            + ' <button id="charGoPets" style="padding:3px 10px;font-size:12px">Mở Linh thú</button></div>';
        } else h += '<div style="font-size:13px">Chưa có linh thú xuất chiến. <button id="charGoPets" style="padding:3px 10px;font-size:12px">Mở Linh thú</button></div>';
      }
    } catch (e) {}
    try {
      if (SK) {
        var unl = SK.unlockedList(ch) || [];
        if (unl.length) {
          h += '<div style="font-size:13px;margin-top:4px">Chiêu đã học: ' + unl.map(function (sid) {
            var d = SK.SKILLS[sid];
            if (!d) return '';
            var passive = d.mech === 'passive' || d.kind === 'passive' || (SK.PASSIVE_IDS && SK.PASSIVE_IDS.indexOf(sid) >= 0);
            return escH(d.name) + (passive ? ' (bị động)' : ' (chủ động)');
          }).filter(Boolean).join(' · ') + ' <button id="charGoSkills" style="padding:3px 10px;font-size:12px">Mở Kỹ năng</button></div>';
        }
      }
    } catch (e) {}
    // Danh hiệu (mục 2 lệnh 20:24).
    h += '<h4 style="margin:10px 0 4px">Danh hiệu <span style="font-size:12px;color:#777">(chỉ trang trí, không cộng chỉ số)</span></h4>';
    TITLES.forEach(function (t) {
      var un = false;
      try { un = !!t.test(); } catch (e) {}
      var wearing = flags.titleWorn === t.id;
      h += '<div style="font-size:13px;padding:2px 0;' + (un ? '' : 'color:#999') + '">'
        + (un ? '<b>«' + escH(t.name) + '»</b>' : '«' + escH(t.name) + '»')
        + ' — ' + escH(t.cond)
        + (un ? (wearing ? ' · <b>Đang đeo</b> <button data-title-off="1" style="padding:2px 8px;font-size:11px">Bỏ đeo</button>'
                          : ' · <button data-title="' + t.id + '" style="padding:2px 8px;font-size:11px">Đeo</button>') : ' · <i>Chưa mở</i>')
        + '</div>';
    });
    // Thống kê trọn đời (mục 5 lệnh 20:24).
    var bx = bxTotals(), ls = lifetimeStats();
    var playH = Math.floor(ls.playSec / 3600), playM = Math.floor((ls.playSec % 3600) / 60);
    h += '<h4 style="margin:10px 0 4px">Thống kê trọn đời</h4><div style="font-size:13px;line-height:1.55">'
      + 'Tổng hạ quái: <b>' + bx.kills + '</b> · Boss thế giới đã hạ: <b>' + bx.bosses + '</b> · Lần vào bí cảnh: <b>' + bx.realmsEntered + '</b>'
      + '<br>Dược đã hái: <b>' + ls.herbs + '</b> · Số lần chết: <b>' + ls.deaths + '</b> · Thời gian chơi: <b>' + playH + ' giờ ' + playM + ' phút</b>'
      + '<br><span style="color:#777">Hạ quái/boss/bí cảnh lấy từ Đồ Giám (đếm từ đầu). Dược, số lần chết và giờ chơi bắt đầu đếm từ bản cập nhật này.</span></div>';
    // Thành tựu (lệnh 20:22 mục 5).
    if (ACH) {
      h += '<h4 style="margin:10px 0 4px">Thành tựu sớm</h4>';
      ACH.list(flags).forEach(function (a) {
        h += '<div style="font-size:13px;padding:2px 0;' + (a.done ? '' : 'color:#999') + '">' + (a.done ? '✓' : '·') + ' <b>' + escH(a.name) + '</b> — ' + escH(a.desc) + '</div>';
      });
    }
    h += '<div style="margin-top:10px"><button id="charCardBtn">Thẻ nhân vật (tải ảnh PNG)</button></div>';
    body.innerHTML = h;
    try { wireDoll(); } catch (e) {}
    // Gắn nút trong panel (nội dung dựng bằng innerHTML nên gắn sau).
    var bg = $('charBreakGo');
    if (bg) bg.addEventListener('click', function () {
      $('panelCharacter').style.display = 'none';
      var go = $('btnBreakGo');
      if (go) go.click();
    });
    var gp = $('charGoPets');
    if (gp) gp.addEventListener('click', function () { $('panelCharacter').style.display = 'none'; renderPetPanel(); $('panelPets').style.display = 'block'; });
    var gs = $('charGoSkills');
    if (gs) gs.addEventListener('click', function () { $('panelCharacter').style.display = 'none'; renderSkillPanel(); $('panelSkills').style.display = 'block'; });
    var cc = $('charCardBtn');
    if (cc) cc.addEventListener('click', function () { downloadCharCard(); });
    Array.prototype.forEach.call(body.querySelectorAll('[data-title]'), function (b) {
      b.addEventListener('click', function () {
        flags.titleWorn = b.getAttribute('data-title');
        updateHUD(); saveGame(); renderCharacterPanel();
        toast('Đã đeo danh hiệu mới.');
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-title-off]'), function (b) {
      b.addEventListener('click', function () {
        flags.titleWorn = null;
        updateHUD(); saveGame(); renderCharacterPanel();
      });
    });
  }
  function openCharacterPanel() {
    if (minState['panelCharacter']) { restoreMinPanel('panelCharacter'); return; }
    renderCharacterPanel();
    $('panelCharacter').style.display = 'block';
  }

  // ---------- XUẤT THẺ NHÂN VẬT (mục 6 lệnh 20:24) ----------
  // Vẽ thẻ 480x640 bằng canvas từ dữ liệu thật + nền map1 + ảnh tạo
  // hình; thuần client. Tách hàm vẽ (test chạy không throw) khỏi
  // hàm tải (DOM anchor).
  function buildCharCard() {
    var cv = document.createElement('canvas');
    cv.width = 480; cv.height = 640;
    var c = cv.getContext('2d');
    c.fillStyle = '#1a140e'; c.fillRect(0, 0, 480, 640);
    try {
      var bg = (typeof curBg === 'function') ? curBg() : null;
      if (bg) c.drawImage(bg, 0, 0, 480, 640);
    } catch (e) {}
    c.fillStyle = 'rgba(16,11,6,.72)'; c.fillRect(0, 0, 480, 640);
    c.strokeStyle = '#c9a227'; c.lineWidth = 4; c.strokeRect(8, 8, 464, 624);
    c.fillStyle = '#ffd94a'; c.font = 'bold 25px sans-serif'; c.textAlign = 'center';
    c.fillText(ch.name, 240, 58);
    var worn = wornTitleName();
    c.font = '15px sans-serif'; c.fillStyle = '#ffe9a8';
    if (worn) c.fillText('«' + worn + '»', 240, 84);
    c.textAlign = 'left'; c.fillStyle = '#f5eeda'; c.font = '17px sans-serif';
    var sd = (flags.sectJoined && SECT) ? SECT.sectById(flags.sectJoined) : null;
    var lines = [
      'Cảnh giới: ' + ch.realm,
      'Linh căn: ' + (ch.root ? L.rootOf(ch).name : 'Chưa lộ'),
      'Tông môn: ' + (sd ? sd.name : 'Chưa bái nhập'),
      'Máu tối đa: ' + (L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp),
      'Tấn công: ' + L.effAtk(ch) + ' · Phòng thủ: ' + (L.effDef ? L.effDef(ch) : ch.def),
      'Linh Thạch: ' + ch.linhThach,
      'Thiên Đạo Ấn: ' + (ch.thienDaoAn || 0)
    ];
    lines.forEach(function (ln, i) { c.fillText(ln, 56, 150 + i * 36); });
    try {
      var im = new Image();
      im.src = ch.look ? 'assets/looks/' + ch.look + '.png' : 'assets/looks/' + ch.gender + '_' + ch.origin + '.png';
      if (im.complete && im.naturalWidth) c.drawImage(im, 316, 400, 120, 120);
    } catch (e) {}
    c.font = '13px sans-serif'; c.fillStyle = '#c9b896'; c.textAlign = 'center';
    c.fillText('Phàm Nhân Tu Đạo — Tu tiên là để bảo vệ người dưới đất.', 240, 606);
    return cv;
  }
  function downloadCharCard() {
    try {
      var cv = buildCharCard();
      var a = document.createElement('a');
      a.download = 'the-nhan-vat-' + ch.name + '.png';
      a.href = cv.toDataURL ? cv.toDataURL('image/png') : '';
      if (a.href) { a.click(); toast('Đã tạo thẻ nhân vật — kiểm tra thư mục tải xuống.'); }
      else toast('Trình duyệt không hỗ trợ tải thẻ từ canvas.');
    } catch (e) { toast('Không tạo được thẻ: ' + e.message); }
  }
  // ---------- SO SÁNH TRANG BỊ + BỘ PHÁP BẢO (lệnh Bui 20:26) ----------
  // So sánh vũ khí: mô phỏng đeo thử (đổi equipUid, đọc statTotals/
  // effAtk THẬT rồi trả lại) — chênh lệch hiện đúng số người chơi
  // sẽ nhận. Pháp bảo: trừ trực tiếp stats của 2 def vì ô đeo có
  // trạng thái riêng, không mô phỏng qua equip được an toàn.
  var CMP_ROWS = [['atk', 'Công'], ['maxHp', 'Máu tối đa'], ['def', 'Thủ'], ['crit', 'Chí mạng %'], ['critDmg', 'ST chí mạng %'], ['lifesteal', 'Hút máu %'], ['ll', 'Linh lực tối đa'], ['llRegen', 'Hồi linh lực %'], ['speed', 'Tốc độ %']];
  var cmpTarget = null;
  function statSnapshot() {
    var t = L.statTotals ? L.statTotals(ch) : {};
    return {
      atk: L.effAtk(ch), maxHp: L.effMaxHp ? L.effMaxHp(ch) : ch.maxHp,
      def: t.def || 0, crit: t.critCh || 0, critDmg: t.critDmgTotal || 0,
      lifesteal: t.lifesteal || 0, ll: SK ? SK.maxLinhLuc(ch) : 0,
      llRegen: t.llRegen || 0, speed: t.speed || 0
    };
  }
  function cmpDeltaRows(before, after) {
    return CMP_ROWS.map(function (r) {
      var d = Math.round(((after[r[0]] || 0) - (before[r[0]] || 0)) * 10) / 10;
      var col = d > 0 ? '#2e7d32' : (d < 0 ? '#c62828' : '#888');
      var sign = d > 0 ? '+' + d : ('' + d);
      return '<div style="font-size:13px;padding:1px 0">' + r[1] + ': ' + (before[r[0]] || 0) + ' → <b>' + (after[r[0]] || 0) + '</b> <b style="color:' + col + '">(' + sign + ')</b></div>';
    }).join('');
  }
  function subsText(subs) {
    if (!subs || !Object.keys(subs).length) return '';
    return Object.keys(subs).map(function (k) {
      return (W.STAT_LABELS[k] || k) + ' +' + subs[k] + (W.STAT_SUFFIX[k] || '');
    }).join(' · ');
  }
  function openCompare(kind, uid) {
    cmpTarget = { kind: kind, uid: uid };
    renderCompare();
    $('panelCompare').style.display = 'block';
  }
  function renderCompare() {
    var body = $('compareBody');
    if (!body || !cmpTarget || !ch) return;
    var h = '';
    if (cmpTarget.kind === 'weapon' && W) {
      var e = W.findEntry(ch, cmpTarget.uid);
      if (!e) { body.innerHTML = '<p>Món này không còn trong túi.</p>'; return; }
      var def = W.WEAPONS[e.id];
      var isEq = ch.equipUid === e.uid;
      var before = statSnapshot();
      var savedUid = ch.equipUid;
      ch.equipUid = e.uid;
      var after = statSnapshot();
      ch.equipUid = savedUid;
      h += '<p style="margin:2px 0"><b>' + escH(def.name) + '</b>' + ((e.enh || 0) > 0 ? ' <b>+' + e.enh + '</b>' : '')
        + ' · ' + W.TYPES[def.type].name + ' · ' + W.GRADES[def.grade].name
        + '<br>Công hiệu dụng: <b>' + W.entryAtk(e) + '</b> (gốc ' + def.atk + ')'
        + (subsText(e.subs) ? '<br>Dòng phụ: ' + escH(subsText(e.subs)) : '')
        + (e.subsPending ? '<br><i>Có bản tẩy luyện đang chờ chọn ở lò rèn của Thiết Cường.</i>' : '')
        + (e.locked ? '<br><b style="color:#b8860b">Đang KHOÁ — không bán/cường hoá/tẩy luyện được.</b>' : '')
        + '</p>'
        + (isEq ? '<p><i>Đây là món đang đeo — số dưới là khi THÁO ra tay không:</i></p>' : '<p><i>Nếu đeo món này thay món hiện tại:</i></p>')
        + (isEq ? cmpDeltaRows(after, before) : cmpDeltaRows(before, after))
        + '<div style="margin-top:8px">'
        + (isEq ? '<button id="cmpUnequip">Tháo ra</button>' : '<button id="cmpEquip">Đeo ngay</button>')
        + ' <button id="cmpLock">' + (e.locked ? 'Mở khoá' : 'Khoá món này') + '</button></div>';
    } else if (cmpTarget.kind === 'artifact' && ART) {
      var ae = null;
      ART.artifactEntries(ch).forEach(function (x) { if (x.uid === cmpTarget.uid) ae = x; });
      if (!ae) { body.innerHTML = '<p>Pháp bảo này không còn trong túi.</p>'; return; }
      var adef = ART.ARTIFACTS[ae.id];
      var slot = ART.slotOf(ch, ae.uid);
      var other = null;
      if (slot < 0) {
        var equipped = ART.artifactEntries(ch).filter(function (x) { return ART.slotOf(ch, x.uid) >= 0; });
        if (equipped.length >= 2) other = ART.ARTIFACTS[equipped[0].id];
      }
      var lines = ART.statLines(adef);
      h += '<p style="margin:2px 0"><b>' + escH(adef.name) + '</b> · ' + ART.KINDS[adef.kind].name + ' · ' + ART.GRADES[adef.grade].name
        + '<br>' + escH(adef.fxText || '')
        + (lines.length ? '<br>' + lines.map(escH).join(' · ') : '')
        + (slot >= 0 ? '<br><i>Đang đeo ở ô pháp bảo ' + (slot + 1) + '.</i>'
          : (other ? '<br><i>Hai ô đã đầy — so với món ở ô 1 (' + escH(other.name) + ') nếu thay vào.</i>' : '<br><i>Đang có ô pháp bảo trống.</i>'))
        + '</p>';
      if (slot < 0 && other) {
        var keys = ['hp', 'def', 'crit', 'critDmg', 'lifesteal', 'll', 'llRegen', 'speed'];
        h += keys.map(function (k) {
          var d = ((adef.stats || {})[k] || 0) - ((other.stats || {})[k] || 0);
          if (!d) return '';
          return '<div style="font-size:13px">' + (W && W.STAT_LABELS[k] ? W.STAT_LABELS[k] : k) + ': <b style="color:' + (d > 0 ? '#2e7d32' : '#c62828') + '">' + (d > 0 ? '+' + d : d) + '</b></div>';
        }).join('');
      }
      h += '<div style="margin-top:8px">' + (slot >= 0 ? '<button id="cmpArtUnequip">Tháo ra</button>' : '<button id="cmpArtEquip">Đeo ngay</button>') + '</div>';
    } else if (cmpTarget.kind === 'gear' && GR) {
      var ge = GR.findEntry(ch, cmpTarget.uid);
      if (!ge) { body.innerHTML = '<p>Món này không còn trong túi.</p>'; return; }
      var gdef = GR.GEAR[ge.id];
      var gCur = GR.slotOf(ch, ge.uid);
      var gBefore = statSnapshot();
      var gSaved = JSON.parse(JSON.stringify(ch.gearSlots));
      var gSimOk = true;
      if (gCur) GR.unequip(ch, ge.uid);
      else { var gSim = GR.equip(ch, ge.uid); if (!gSim.ok) gSimOk = false; }
      var gAfter = statSnapshot();
      ch.gearSlots = gSaved;
      var gLines = GR.statLines(gdef, ch);
      var gChk = GR.canEquip(ch, ge.uid);
      h += '<p style="margin:2px 0"><b>' + escH(gdef.name) + '</b> · ' + GR.SLOTS[gdef.slot].name + ' · ' + GR.GRADES[gdef.grade].name
        + (gLines.length ? '<br>' + gLines.map(escH).join(' · ') : '')
        + (gdef.reqTier > 0 ? '<br>Cần Luyện Khí tầng ' + gdef.reqTier : '')
        + (gdef.reqRealm > 0 ? '<br>Cần cảnh giới <b>' + GR.realmName(gdef.reqRealm) + '</b> trở lên' : '')
        + '<br>' + escH(gdef.desc) + '</p>'
        + (gCur ? '<p><i>Đây là món đang đeo ở ' + (gCur.slot === 'nhan' ? 'ô Nhẫn ' + (gCur.ring + 1) : 'ô ' + GR.SLOTS[gCur.slot].name) + ' — số dưới là khi THÁO ra:</i></p>' + cmpDeltaRows(gAfter, gBefore)
          : (gSimOk ? '<p><i>Nếu đeo món này:</i></p>' + cmpDeltaRows(gBefore, gAfter)
            : '<p><i style="color:#c62828">Chưa đeo được món này' + (gChk.reason === 'tier' ? ' — cần Luyện Khí tầng ' + gdef.reqTier : (gChk.reason === 'realm' ? ' — cần cảnh giới ' + GR.realmName(gdef.reqRealm) : (gChk.reason === 'dup_ring_key' ? ' — nhẫn đang đeo đã có dòng này, hai nhẫn không trùng dòng' : (gChk.reason === 'full' ? ' — hai ô nhẫn đã đầy, tháo bớt một chiếc trước' : '')))) + '.</i></p>'))
        + '<div style="margin-top:8px">'
        + (gCur ? '<button id="cmpGearUnequip">Tháo ra</button>' : '<button id="cmpGearEquip">Đeo ngay</button>')
        + '</div>';
    } else {
      body.innerHTML = '<p>Không xem được món này.</p>';
      return;
    }
    body.innerHTML = h;
    function bind(id, fn) { var b = $(id); if (b) b.addEventListener('click', fn); }
    bind('cmpEquip', function () {
      var r = W.equip(ch, cmpTarget.uid);
      if (!r.ok) { toast(r.reason === 'tier' ? 'Chưa đeo được — cần cảnh giới cao hơn.' : 'Không đeo được vũ khí này.'); return; }
      toast('Đã đeo ' + def.name + '.');
      updateHUD(); saveGame(); renderInventory(); renderCompare(); refreshDollIfOpen();
    });
    bind('cmpUnequip', function () {
      W.unequip(ch);
      toast('Đã tháo vũ khí.');
      updateHUD(); saveGame(); renderInventory(); renderCompare(); refreshDollIfOpen();
    });
    bind('cmpLock', function () {
      var r = W.toggleLock(ch, cmpTarget.uid);
      if (r.ok) toast(r.locked ? 'Đã khoá món này — không bán/cường hoá/tẩy luyện được.' : 'Đã mở khoá.');
      saveGame(); renderInventory(); renderCompare();
    });
    bind('cmpArtEquip', function () {
      var r = ART.equip(ch, cmpTarget.uid);
      if (!r.ok) {
        toast(r.reason === 'full' ? 'Hai ô pháp bảo đã đầy — tháo bớt một món trước.' : (r.reason === 'dup' ? 'Đang đeo một món giống hệt rồi.' : (r.reason === 'tier' ? 'Chưa đủ cảnh giới để đeo pháp bảo này.' : 'Không đeo được pháp bảo này.')));
        return;
      }
      toast('Đã đeo pháp bảo vào ô ' + (r.slot + 1) + '.');
      updateHUD(); saveGame(); renderInventory(); updateArtBar(); renderCompare(); refreshDollIfOpen();
    });
    bind('cmpArtUnequip', function () {
      ART.unequip(ch, cmpTarget.uid);
      toast('Đã tháo pháp bảo.');
      updateHUD(); saveGame(); renderInventory(); updateArtBar(); renderCompare(); refreshDollIfOpen();
    });
    bind('cmpGearEquip', function () {
      var r = GR.equip(ch, cmpTarget.uid);
      if (!r.ok) {
        toast(r.reason === 'tier' ? 'Chưa đeo được — cần Luyện Khí tầng ' + r.def.reqTier + '.'
          : (r.reason === 'realm' ? 'Chưa đeo được — ' + r.def.name + ' cần cảnh giới ' + GR.realmName(r.def.reqRealm) + ' trở lên.'
          : (r.reason === 'dup_ring_key' ? 'Hai nhẫn không được trùng dòng — nhẫn đang đeo đã có dòng này.'
          : (r.reason === 'full' ? 'Hai ô nhẫn đã đầy — tháo bớt một chiếc trước.' : 'Không đeo được món này.'))));
        return;
      }
      toast('Đã đeo ' + r.def.name + '.');
      updateHUD(); saveGame(); renderInventory(); renderCompare(); refreshDollIfOpen();
    });
    bind('cmpGearUnequip', function () {
      var r = GR.unequip(ch, cmpTarget.uid);
      toast(r.ok ? 'Đã tháo ' + (r.def ? r.def.name : 'trang bị') + '.' : 'Món này chưa được đeo.');
      updateHUD(); saveGame(); renderInventory(); renderCompare(); refreshDollIfOpen();
    });
  }
  var cmpCloseEl = $('compareClose');
  if (cmpCloseEl) cmpCloseEl.addEventListener('click', function () { $('panelCompare').style.display = 'none'; });

  // Bộ đeo sẵn pháp bảo + gợi ý (20:26 mục 4): 3 bộ tự lưu theo
  // uid, áp bộ chỉ đeo món còn sở hữu; gợi ý chấm điểm từ stats
  // THẬT của def theo 3 tiêu chí.
  var ART_SETS = [
    { id: 'cay', name: 'Cày quái' }, { id: 'boss', name: 'Đánh boss' }, { id: 'thu', name: 'Phòng thủ' }
  ];
  function artScore(def, crit) {
    var s = (def && def.stats) || {};
    var elemSum = 0;
    if (s.elem) Object.keys(s.elem).forEach(function (k) { elemSum += s.elem[k] || 0; });
    if (crit === 'atk') return (s.crit || 0) * 2 + (s.critDmg || 0) + (s.vsBoss || 0) * 2 + (s.exec || 0) * 2 + elemSum;
    if (crit === 'surv') return (s.hp || 0) / 10 + (s.def || 0) + (s.dmgRed || 0) * 4 + (s.regenPct || 0) * 2 + (s.healPct || 0) + (s.lifesteal || 0) * 2;
    return (s.dropPct || 0) * 3 + (s.ltPct || 0) * 2 + (s.tuViPct || 0) * 2;
  }
  function suggestArtifacts(crit) {
    if (!ART) return [];
    var seen = {}, list = [];
    ART.artifactEntries(ch).forEach(function (e) {
      if (seen[e.id]) return;
      seen[e.id] = true;
      list.push({ entry: e, def: ART.ARTIFACTS[e.id], score: artScore(ART.ARTIFACTS[e.id], crit) });
    });
    list.sort(function (a, b) { return b.score - a.score; });
    return list.slice(0, 2);
  }
  function renderArtSets() {
    var box = $('artSets');
    if (!box || !ART || !ch) return;
    flags.artSets = flags.artSets || {};
    var equipped = ART.artifactEntries(ch).filter(function (e) { return ART.slotOf(ch, e.uid) >= 0; });
    var h = '<h4 style="margin:12px 0 4px">Pháp bảo của bạn</h4>'
      + '<div style="font-size:13px">Đang đeo: ' + (equipped.length ? equipped.map(function (e) { return '<b>' + escH(ART.ARTIFACTS[e.id].name) + '</b> (ô ' + (ART.slotOf(ch, e.uid) + 1) + ')'; }).join(' · ') : 'chưa đeo món nào') + '</div>';
    ART_SETS.forEach(function (set) {
      var saved = flags.artSets[set.id] || [];
      var names = saved.map(function (uid) {
        var f = null;
        ART.artifactEntries(ch).forEach(function (e) { if (e.uid === uid) f = e; });
        return f ? ART.ARTIFACTS[f.id].name : '(đã mất món)';
      });
      h += '<div style="font-size:13px;margin-top:6px">Bộ <b>' + set.name + '</b>: ' + (saved.length ? names.map(escH).join(' + ') : '<i>chưa lưu</i>')
        + ' <button data-artset-save="' + set.id + '" style="padding:2px 8px;font-size:11px">Lưu bộ đang đeo</button>'
        + ' <button data-artset-apply="' + set.id + '" style="padding:2px 8px;font-size:11px">Áp bộ</button></div>';
    });
    h += '<div style="font-size:13px;margin-top:8px">Gợi ý theo: '
      + '<select id="artCrit"><option value="atk">Công cao nhất</option><option value="surv">Sống sót</option><option value="farm">Cày đồ</option></select>'
      + ' <button id="artSuggestBtn" style="padding:2px 8px;font-size:11px">Gợi ý đeo</button>'
      + ' <span id="artSuggestOut"></span></div>';
    var owned = ART.artifactEntries(ch);
    if (owned.length) {
      h += '<div style="font-size:13px;margin-top:6px">' + owned.map(function (e) {
        var d = ART.ARTIFACTS[e.id];
        var ls = ART.statLines(d);
        return '<b>' + escH(d.name) + '</b>' + (ART.slotOf(ch, e.uid) >= 0 ? ' (đang đeo)' : '') + (ls.length ? ' — ' + ls.map(escH).join(' · ') : '');
      }).join('<br>') + '</div>';
    }
    box.innerHTML = h;
    var sb = $('artSuggestBtn');
    if (sb) sb.addEventListener('click', function () {
      var crit = ($('artCrit') || {}).value || 'atk';
      var sug = suggestArtifacts(crit);
      var out = $('artSuggestOut');
      if (!sug.length) { if (out) out.textContent = 'Bạn chưa có pháp bảo nào.'; return; }
      if (out) out.innerHTML = 'Nên đeo: <b>' + sug.map(function (s) { return escH(s.def.name); }).join(' + ') + '</b> <button id="artSuggestWear" style="padding:2px 8px;font-size:11px">Đeo theo gợi ý</button>';
      var wb = $('artSuggestWear');
      if (wb) wb.addEventListener('click', function () {
        ART.artifactEntries(ch).slice().forEach(function (e) { if (ART.slotOf(ch, e.uid) >= 0) ART.unequip(ch, e.uid); });
        sug.forEach(function (s) { ART.equip(ch, s.entry.uid); });
        toast('Đã đeo theo gợi ý.');
        updateHUD(); saveGame(); updateArtBar(); renderArtSets(); renderArtShop();
      });
    });
  }
  var artSetsEl = $('artSets');
  if (artSetsEl) artSetsEl.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.getAttribute) return;
    var saveId = t.getAttribute('data-artset-save');
    var applyId = t.getAttribute('data-artset-apply');
    if (saveId) {
      var eq = ART.artifactEntries(ch).filter(function (e) { return ART.slotOf(ch, e.uid) >= 0; });
      flags.artSets = flags.artSets || {};
      flags.artSets[saveId] = eq.map(function (e) { return e.uid; });
      saveGame(); renderArtSets();
      toast('Đã lưu bộ pháp bảo.');
    }
    if (applyId) {
      var savedUids = (flags.artSets || {})[applyId] || [];
      if (!savedUids.length) { toast('Bộ này chưa được lưu.'); return; }
      ART.artifactEntries(ch).slice().forEach(function (e) { if (ART.slotOf(ch, e.uid) >= 0) ART.unequip(ch, e.uid); });
      var missed = 0;
      savedUids.forEach(function (uid) {
        var f = null;
        ART.artifactEntries(ch).forEach(function (e) { if (e.uid === uid) f = e; });
        if (f) { var r = ART.equip(ch, uid); if (!r.ok) missed++; }
        else missed++;
      });
      toast(missed ? 'Áp bộ xong — có ' + missed + ' món không còn/không đeo được.' : 'Đã áp bộ pháp bảo.');
      updateHUD(); saveGame(); updateArtBar(); renderArtSets(); renderArtShop();
    }
  });
  // ---------- Bí cảnh (module PNT_SECRET_REALMS, js/secret-realms.js) ----------
  var srWasOpen = false, srTickLast = 0, srOpenId = null, srTreasureSeen = {};
  var riftTickLast = 0;
  var riftBannerLiveUntil = 0; // mốc hết hạn banner nứt do tickRift ghi (strip alive dùng chung nguồn giờ)
  function fmtClock(ms) { var d = new Date(ms); function p(n) { return (n < 10 ? '0' : '') + n; } return p(d.getHours()) + ':' + p(d.getMinutes()); }
  function fmtDur(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
  function playerTile() { return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) }; }
  function realmReturnPoint() { var t = playerTile(); return { mapId: curMapId, x: t.x, y: t.y }; }
  function nearRealmGate() {
    if (!SR || curMapId !== SR.SCHEDULED.gateMap) return false;
    var dx = SR.SCHEDULED.gate.x * TILE + 16 - px, dy = SR.SCHEDULED.gate.y * TILE + 28 - py;
    return Math.sqrt(dx * dx + dy * dy) <= 72;
  }
  // Diễn giải bảng thưởng của module bằng hệ thật: Linh Thạch (kind
  // 'linhThach' của module bí cảnh), tu vi, vật phẩm, vũ khí/pháp khí
  // theo phẩm qua kho hiện có.
  function grantRealmRewards(list, srcKind) {
    if (!list || !list.length) return;
    var ltKind = srcKind || 'realm'; // chống hack: trần theo nguồn phát (bí cảnh 250 / Đại Hội 3000)
    list.forEach(function (r) {
      if (r.kind === 'linhThach') { var realmLt = AC ? AC.guardGain(ltKind, r.n) : r.n; ch.linhThach += realmLt; toast('Thưởng bí cảnh: +' + realmLt + ' Linh Thạch.'); }
      else if (r.kind === 'tuvi') { var g = L.gainTuVi(ch, AC ? AC.guardGain('realmTuVi', r.n) : r.n); toast('Thưởng bí cảnh: +' + g + ' tu vi.'); }
      else if (r.kind === 'item') { L.addItem(ch, r.id, r.n || 1); var iname = (L.ITEMS[r.id] ? L.ITEMS[r.id].name : ((typeof TAL !== 'undefined' && TAL && TAL.talismanDef && TAL.talismanDef(r.id)) ? TAL.talismanDef(r.id).name : r.id)); toast('Thưởng bí cảnh: ' + iname + ' x' + (r.n || 1) + '.'); }
      else if (r.kind === 'weapon' && W) {
        // Kỳ ngộ tông (mục 22): thưởng ghi rõ id thì trao đúng món
        // ký danh đó, không lăn ngẫu nhiên theo phẩm như mẫu thường.
        if (r.id && W.WEAPONS[r.id]) {
          if (W.addWeapon(ch, r.id)) toast('Thưởng bí cảnh: vũ khí ký danh ' + W.WEAPONS[r.id].name + ' (' + W.GRADES[W.WEAPONS[r.id].grade].name + ')! Mở Túi đồ để đeo.');
        } else {
          var pool = Object.keys(W.WEAPONS).filter(function (id) { return W.WEAPONS[id].grade === r.grade; });
          if (pool.length) {
            var wid = pool[Math.floor(Math.random() * pool.length)];
            if (W.addWeapon(ch, wid)) toast('Thưởng bí cảnh: vũ khí ' + W.WEAPONS[wid].name + ' (' + W.GRADES[r.grade].name + ')! Mở Túi đồ để đeo.');
          }
        }
      } else if (r.kind === 'artifact' && ART) {
        if (r.id && ART.ARTIFACTS[r.id]) {
          if (ART.addArtifact(ch, r.id)) toast('Thưởng bí cảnh: pháp bảo ký danh ' + ART.ARTIFACTS[r.id].name + ' (' + ART.GRADES[ART.ARTIFACTS[r.id].grade].name + ')!');
        } else {
          var pool2 = Object.keys(ART.ARTIFACTS).filter(function (id) { return ART.ARTIFACTS[id].grade === r.grade; });
          if (pool2.length) {
            var aid = pool2[Math.floor(Math.random() * pool2.length)];
            if (ART.addArtifact(ch, aid)) toast('Thưởng bí cảnh: pháp bảo ' + ART.ARTIFACTS[aid].name + ' (' + ART.GRADES[r.grade].name + ')!');
          }
        }
      }
      else if (r.kind === 'egg' && PETS) {
        var spId = PETS.rollEggSpecies(Math.random);
        var er = PETS.addEgg(ch, spId);
        if (er.ok) toast('Thưởng bí cảnh: 1 Trứng ' + PETS.SPECIES[spId].name + '! Mở panel Linh Thú để ấp.');
        else { ch.linhThach += AC ? AC.guardGain('realm', 50) : 50; toast('Chuồng trứng đã đầy — quy đổi +50 Linh Thạch.'); }
      } else if (r.kind === 'recipe' && ALCH) {
        var learned = ALCH.teachRecipe(ch, r.id);
        var pillName = ALCH.PILLS[r.id] ? ALCH.PILLS[r.id].name : r.id;
        toast(learned ? 'Tàn thư trong động phủ! Bạn lĩnh ngộ đan phương: ' + pillName + '!' : 'Đan phương ' + pillName + ' bạn đã biết rồi — tàn thư hóa thành làn linh khí tan đi.');
      }
    });
    updateHUD(); saveGame();
  }
  function completeRealmRun(run) {
    // Kỳ ngộ nguồn gốc có lựa chọn (mục 20): chưa chọn thì CHỈ hiện
    // panel lựa chọn, chưa đánh dấu thưởng — chọn xong, đường chọn
    // mới gọi lại hàm này với run.choiceId để trả thưởng đúng đường.
    var tplC = (run && run.kind === 'ky_ngo' && SR) ? SR.templateById(run.templateId) : null;
    if (tplC && tplC.choices && !run.choiceId) { showFateChoicePanel(tplC); return; }
    if (BX) BX.noteRealmComplete(flags, (run && run.realmId) || 'liet_khach'); // Đồ Giám: hoàn thành lượt bí cảnh
    var realmWasRewarded = !!(flags.sr && flags.sr.run && flags.sr.run.rewarded);
    SR.markRewarded(flags);
    // Kỳ ngộ nguồn gốc chỉ tính là ĐÃ GẶP khi hoàn thành có thưởng —
    // bỏ dở / rời cảnh trước khi chọn thì lần lăn sau vẫn mời lại
    // (không mất duyên oan), nhưng đã hoàn thành thì không mời nữa.
    // Kỳ ngộ nguồn gốc (fate nhóm A/B lẫn điểm kích hoạt nhóm B):
    // điểm kích hoạt có originId nhưng không mang cờ originOnly
    // (không nằm trong FATE.templates) nên khóa theo originId.
    if (tplC && tplC.originId) {
      if (!flags.originFate) flags.originFate = {};
      flags.originFate[tplC.originId] = true;
      var chosen = null;
      if (tplC.choices) tplC.choices.forEach(function (c) { if (c.id === run.choiceId) chosen = c; });
      if (chosen && chosen.flag) {
        if (!flags.originFlags) flags.originFlags = {};
        flags.originFlags[chosen.flag] = true;
      }
    }
    // Kỳ ngộ tông nhóm 1 (mục 22): chỉ tính là ĐÃ GẶP khi hoàn
    // thành có thưởng như kỳ ngộ nguồn gốc — bỏ dở trước khi chọn
    // thì nói chuyện lại với đại diện tông để mở lại, không mất.
    // Cờ phụ của lựa chọn (vd Ân Thú) vào flags.sectFlags riêng,
    // không lẫn với flags.originFlags của kỳ ngộ nguồn gốc.
    if (tplC && tplC.sectId) {
      if (!flags.sectFate) flags.sectFate = {};
      flags.sectFate[tplC.sectId] = true;
      var chosenS = null;
      if (tplC.choices) tplC.choices.forEach(function (c) { if (c.id === run.choiceId) chosenS = c; });
      if (chosenS && chosenS.flag) {
        if (!flags.sectFlags) flags.sectFlags = {};
        flags.sectFlags[chosenS.flag] = true;
      }
      // Kỳ ngộ tông nhóm 2 (mục 23): dây phụ Thiên Phù × NV03 — hoàn
      // thành Phù Trận Tàn trong khi trong túi có Lá Bùa Không Chữ
      // thì bùa tự ấm lên, ghi cờ riêng cho Thiên 6 đọc (không chỉ
      // số, không mở thêm thưởng); không mang bùa thì không có cờ.
      if (tplC.sectId === 'thien_phu' && ch && ch.inventory &&
          ch.inventory.some(function (it) { return it && it.id === 'la_bua_khong_chu'; })) {
        if (!flags.sectFlags) flags.sectFlags = {};
        flags.sectFlags.bua_khong_chu_ung = true;
        toast('Lá Bùa Không Chữ trong túi tự ấm lên — nét cuối phù trận và lá bùa không chữ như hai nửa gặp nhau.');
      }
    }
    if (SB && !realmWasRewarded) {
      var sbRealm = SB.noteRealm(flags, run, gameNow());
      if (sbRealm.ok) toast('Bảng mùa: +20 điểm (hoàn thành bí cảnh) — tổng mùa ' + sbRealm.total + ' điểm.');
    }
    // THIÊN 5 ch.30 (js/thien5.js): lượt này vào qua VẾT NỨT HƯ KHÔNG
    // (run.rift) và đã dọn xong = đường thứ hai bắt ma tu lộ mặt.
    // QA 19:31 30/10: bóng kẻ giữ ấn chờ sẵn ở điểm về của lượt nứt —
    // người chơi vừa ra khỏi cảnh là thấy hắn (xem showThien5Figure).
    if (THIEN5 && run && run.rift) {
      var rq5 = THIEN5.noteRiftClear(qs);
      if (rq5.questDone) { toast('Nhiệm vụ chính đã xong: Kẻ giữ ấn lên tiếng — về gặp đại diện tông để trả.'); var rt5 = run.returnTo || { mapId: 'map1', x: 43, y: 50 }; showThien5Figure(rt5.mapId, rt5.x + 2, rt5.y); }
    }
    var doneDef = (run.realmId && SR.realmById) ? SR.realmById(run.realmId) : null;
    toast(run.kind === 'dinh_ky' ? (doneDef ? 'Đã hoàn thành bí cảnh ' + doneDef.name + '!' : 'Đã hạ Khích Linh Cự Thú — phong ấn tạm yên!') : 'Đã dọn sạch bí cảnh kỳ ngộ!');
    if (SND) SND.sfx('realm_clear'); // QA (e) 02:38 31/10: dọn xong bí cảnh là khoảnh khắc thưởng lớn nhất game — đúng 1 tiếng kết ở đây, grantRealmRewards không phát thêm tiếng theo từng món
    grantRealmRewards(SR.rollRewards(run, Math.random));
  }
  function exitRealm(reason) {
    if (!SR) return false;
    var run = SR.clearRun(flags);
    var timerEl = $('realmTimer'); if (timerEl) timerEl.style.display = 'none';
    hideFateChoicePanel(); // QA 19:01: rời cảnh là panel lựa chọn phải đóng theo, không kẹt lại che màn hình ở map thường
    if (!run) return false;
    var rt = run.returnTo || { mapId: 'map1', x: 43, y: 50 }; // V3: điểm về dự phòng (19,12) + offset V10 (12,8) + neo V3 (12,30)
    switchMap(rt.mapId, rt.x, rt.y);
    if (reason) toast(reason);
    saveGame();
    return true;
  }
  function enterScheduledRealm(now) {
    if (!SR) return { ok: false, reason: 'nomodule' };
    var openDef = SR.openRealm ? SR.openRealm(now) : null;
    if (!openDef) {
      var chk0 = SR.canEnter(flags, now, !!flags.kyNgo);
      return chk0.ok ? { ok: false, reason: 'closed' } : chk0;
    }
    if (openDef.id === 'liet_khach') {
      var chk = SR.canEnter(flags, now, !!flags.kyNgo);
      if (!chk.ok) return chk;
      var r = SR.beginRun(flags, now, !!flags.kyNgo, realmReturnPoint());
      if (!r.ok) return r;
      if (BX) BX.noteRealmEnter(flags, 'liet_khach'); // Đồ Giám: vào bí cảnh định kỳ
      $('panelRealms').style.display = 'none';
      var mp0 = SR.REALM_MAPS[SR.SCHEDULED.mapId];
      switchMap(SR.SCHEDULED.mapId, mp0.start.x, mp0.start.y);
      toast('Bí cảnh ' + SR.SCHEDULED.name + ' — ' + SR.SCHEDULED.intro);
      saveGame();
      return { ok: true };
    }
    var opts = { hasRoot: !!flags.kyNgo, tier: ch ? (ch.tier || 0) : 0 };
    var chk2 = SR.canEnterRealm(openDef.id, flags, now, opts);
    if (!chk2.ok) return chk2;
    var r2 = SR.beginRealmRun(openDef.id, flags, now, opts, realmReturnPoint());
    if (!r2.ok) return r2;
    if (BX) BX.noteRealmEnter(flags, openDef.id); // Đồ Giám: vào bí cảnh kỳ ngộ
    $('panelRealms').style.display = 'none';
    var mp = SR.REALM_MAPS[openDef.mapId];
    switchMap(openDef.mapId, mp.start.x, mp.start.y);
    toast('Bí cảnh ' + openDef.name + ' — ' + openDef.intro);
    saveGame();
    return { ok: true };
  }
  function enterReasonText(reason) {
    return {
      closed: 'Bí cảnh chưa mở — khe nứt chỉ hiện trong phiên mở.',
      noroot: 'Phải lộ linh căn ở giếng cổ trước đã.',
      sessionlimit: 'Bạn đã dùng hết lượt vào của phiên này.',
      daylimit: 'Bạn đã dùng hết 2 lượt vào hôm nay.',
      inrun: 'Bạn đang ở trong một bí cảnh khác.',
      tierlow: 'Cảnh giới chưa đủ — bí cảnh đang mở cần Luyện Khí tầng cao hơn.'
    }[reason] || 'Chưa thể vào bí cảnh lúc này.';
  }
  // ---------- Động Phủ + Linh Điền (module PNT_DONG_PHU, js/dong-phu.js) ----------
  function dpFmtLeft(ms) {
    var sec = Math.max(0, Math.ceil(ms / 1000));
    if (sec < 60) return sec + ' giây';
    var min = Math.floor(sec / 60);
    if (min < 60) return min + ' phút';
    var hh = Math.floor(min / 60), mm = min % 60;
    return hh + ' giờ' + (mm ? ' ' + mm + ' phút' : '');
  }
  function dpBtn(label, fn, dis) {
    var b = document.createElement('button');
    b.textContent = label;
    b.style.margin = '2px 4px 2px 0';
    if (dis) b.disabled = true;
    b.onclick = fn;
    return b;
  }
  function enterCave() {
    if (!DP) return;
    var r = DP.enter(flags, realmReturnPoint());
    if (!r.ok) {
      toast(r.reason === 'in_realm' ? 'Đang ở trong bí cảnh — ra khỏi bí cảnh rồi mới về động phủ được.'
        : r.reason === 'no_sect' ? 'Động phủ do tông môn cấp cho đệ tử — hãy bái nhập một tông môn trước đã.'
        : 'Động phủ chưa sẵn sàng.');
      return;
    }
    $('panelDongPhu').style.display = 'none';
    switchMap(r.mapId, r.x, r.y);
    toast('Về tới động phủ riêng. Đài Tụ Linh Trận ở phía bắc phủ — đứng trong trận mà thổ nạp thì tu vi nhân hệ số.');
    saveGame();
  }
  function exitCave() {
    if (!DP) return;
    var r = DP.exit(flags);
    $('panelDongPhu').style.display = 'none';
    switchMap(r.mapId, r.x, r.y);
    saveGame();
  }
  function openDongPhuPanel(focusPlot) {
    renderDongPhuPanel(focusPlot);
    $('panelDongPhu').style.display = 'block';
  }
  $('dongPhuClose').addEventListener('click', function () { $('panelDongPhu').style.display = 'none'; });
  function renderDongPhuPanel(focusPlot) {
    var body = $('dongPhuBody');
    if (!body || !DP || !ch) return;
    var s = DP.ensure(flags);
    var now = Date.now();
    var inCave = curMapId === DP.MAP_ID;
    var html = '';
    if (!s.owned) {
      html += '<p>Sau giếng cổ Thanh Khê có một <b>cửa đá khắc phù văn</b> dẫn xuống mạch núi — nơi các tông môn đăng ký động phủ riêng cho đệ tử của mình; linh khí trong phủ đặc hơn ngoài trời nhiều.</p>';
      html += '<p><b>Động phủ do tông môn cấp cho đệ tử</b> — hãy bái nhập một tông môn: ngay khi bái sư xong, đại diện tông sẽ trao <b>Lệnh Bài Động Phủ</b> và cửa đá này mở cho riêng bạn. Phủ mang ấn của tông đã nhập, có <b>Tụ Linh Trận x' + DP.LEVELS[0].mult + '</b> cho thổ nạp, giường đá hồi phục khi thiền, và <b>linh điền ' + DP.LEVELS[0].plots + ' ô</b> trồng linh dược theo giờ thật.</p>';
      body.innerHTML = html;
      return;
    }
    var lv = DP.levelDef(s.level);
    var decor = DP.decorFor(flags);
    html += '<p><b>' + DP.caveName(flags) + '</b> · Ấn ký: ' + decor.sigil + ' · Trang trí trong phủ: ' + decor.feature + '<br>Mã phủ riêng: <code>' + (DP.instanceId(flags) || '—') + '</code> — phủ là không gian riêng của đúng nhân vật này; người khác chỉ vào thăm khi được bạn mời.</p>';
    html += '<p><b>Động phủ cấp ' + s.level + '</b> · Tụ Linh Trận <b>x' + lv.mult + '</b> (đứng trên đài trận ở phía bắc phủ mà thổ nạp) · Linh điền <b>' + lv.plots + ' ô</b> · Thiền trong phủ hồi thêm ' + DP.REST_HEAL_PCT + '% Máu (giường đá).</p>';
    var readyN = DP.readyCount(flags, now);
    if (readyN) html += '<p style="color:#2e7d32"><b>Có ' + readyN + ' ô linh dược đã chín</b> — vào phủ để thu hoạch.</p>';
    body.innerHTML = html;
    if (inCave) body.appendChild(dpBtn('Rời động phủ', function () { exitCave(); }));
    else body.appendChild(dpBtn('Vào động phủ', function () { enterCave(); }));
    var up = DP.upgradeInfo(ch, flags);
    if (up.ok) {
      var matsTxt = Object.keys(up.mats).map(function (m) { return (L.ITEMS[m] ? L.ITEMS[m].name : m) + ' x' + up.mats[m] + ' (đang có ' + L.countItem(ch, m) + ')'; }).join(', ');
      var upP = document.createElement('p');
      upP.innerHTML = 'Nâng lên <b>cấp ' + up.nextLevel + '</b>: ' + up.price + ' Linh Thạch' + (matsTxt ? ' + ' + matsTxt : '') + (up.needRankName ? ' + cấp bậc tông môn <b>' + up.needRankName + '</b>' : '') + ' → linh điền ' + up.plots + ' ô, Tụ Linh Trận x' + up.mult + '.' + (up.lackRank ? ' <span style="color:#a33"><b>Chưa đủ cấp bậc cống hiến</b> — hãy làm nhiệm vụ tông môn để thăng cấp bậc trước.</span>' : '');
      body.appendChild(upP);
      body.appendChild(dpBtn('Nâng cấp động phủ', function () {
        var r = DP.upgrade(ch, flags);
        if (!r.ok) { toast(r.reason === 'linhThach' ? 'Chưa đủ Linh Thạch để nâng cấp.' : r.reason === 'mats' ? 'Chưa đủ nguyên liệu nâng cấp.' : r.reason === 'rank' ? 'Chưa đủ cấp bậc cống hiến — nâng cấp này cần cấp bậc ' + r.needRankName + ' trong tông môn.' : 'Chưa nâng cấp được.'); return; }
        if (SND) SND.sfx('shop_buy');
        toast('Động phủ lên cấp ' + r.level + '! Linh điền ' + r.plots + ' ô, Tụ Linh Trận x' + r.mult + '.');
        // THIÊN 4 ch.27: phủ lên cấp 2 trở lên = trận đủ mạnh để đọc ấn cổ.
        if (THIEN4) { var cq2 = THIEN4.noteCaveLevel(qs, r.level); if (cq2.questDone) toast('Nhiệm vụ chính đã xong: Ấn cổ dưới điểm mạch — về gặp đại diện tông để trả.'); }
        updateHUD(); saveGame(); renderDongPhuPanel(focusPlot);
      }, up.lackLt || up.lackMats.length > 0 || up.lackRank));
    } else if (up.reason === 'max') {
      var maxP = document.createElement('p');
      maxP.textContent = 'Động phủ đã ở cấp cao nhất (cấp ' + s.level + ').';
      body.appendChild(maxP);
    }
    // Mời khách thăm phủ: phủ là không gian riêng tư — chỉ khách được
    // CHỦ mời + đã chấp nhận mới vào thăm (hạn 24 giờ), và khách chỉ
    // ngắm, không chạm được vào tài sản phủ (chặn ở tầng logic của
    // js/dong-phu.js, không chỉ ẩn nút).
    var invTitle = document.createElement('p');
    invTitle.innerHTML = '<b>Mời khách thăm phủ</b> — nhập mã khách dạng <code>tài khoản::Tên nhân vật</code> (mã của chính bạn là <code>' + DP.ownerKeyOf(currentAccount, ch) + '</code>). Lời mời có hạn 24 giờ; thu hồi bất cứ lúc nào, khách đang ở trong phủ sẽ bị mời ra.';
    body.appendChild(invTitle);
    var invRow = document.createElement('div');
    var invInput = document.createElement('input');
    invInput.type = 'text';
    invInput.placeholder = 'vd: banbe::Tiểu Vân';
    invInput.style.cssText = 'width:65%;margin:2px 4px 2px 0;';
    invRow.appendChild(invInput);
    invRow.appendChild(dpBtn('Tạo lời mời (24 giờ)', function () {
      var gk = (invInput.value || '').trim();
      if (!gk) { toast('Hãy nhập mã khách (tài khoản::Tên nhân vật) trước đã.'); return; }
      var r = DP.invite(flags, gk, gk.split('::')[1] || gk, Date.now());
      if (!r.ok) { toast(r.reason === 'self' ? 'Không thể mời chính mình.' : r.reason === 'toomany' ? 'Đã đủ 8 lời mời còn hiệu lực — thu hồi bớt rồi mời tiếp.' : 'Chưa tạo được lời mời.'); return; }
      toast('Đã tạo lời mời cho ' + gk + ' — khách phải chấp nhận lời mời mới vào thăm phủ được.');
      saveGame(); renderDongPhuPanel(focusPlot);
    }));
    body.appendChild(invRow);
    DP.listInvites(flags, now).forEach(function (iv) {
      var row = document.createElement('div');
      row.style.cssText = 'border:1px solid #6b5a3e;border-radius:6px;padding:4px 6px;margin:3px 0;';
      var stTxt = iv.status === 'accepted' ? 'đã chấp nhận — khách có quyền vào thăm' : iv.status === 'expired' ? 'đã hết hạn' : 'đang chờ khách chấp nhận';
      var lbl = document.createElement('span');
      lbl.textContent = 'Khách ' + iv.name + ' (' + iv.guestKey + ') — ' + stTxt + ', hết hạn ' + new Date(iv.expiresAt).toLocaleString('vi-VN') + '. ';
      row.appendChild(lbl);
      row.appendChild(dpBtn('Thu hồi lời mời', function () {
        DP.revokeInvite(flags, iv.guestKey);
        toast('Đã thu hồi lời mời của ' + iv.name + ' — khách không còn vào phủ được nữa.');
        saveGame(); renderDongPhuPanel(focusPlot);
      }));
      body.appendChild(row);
    });
    var gTitle = document.createElement('p');
    gTitle.innerHTML = '<b>Linh Điền</b>' + (inCave ? ' — gieo hạt, tưới nước giếng, thu hoạch ngay tại đây.' : ' — phải vào trong phủ mới trồng/tưới/thu được; ở ngoài chỉ xem cây lớn tới đâu.');
    body.appendChild(gTitle);
    for (var drow = 0; drow < 12; drow++) {
      (function (idx) {
        var v = DP.plotView(flags, idx, now);
        var rowEl = document.createElement('div');
        rowEl.style.cssText = 'border:1px solid #6b5a3e;border-radius:6px;padding:4px 6px;margin:3px 0;' + (idx === focusPlot ? 'background:rgba(127,232,214,0.12);' : '');
        var label = 'Ô ' + (idx + 1) + ': ';
        if (v.stage === 'locked') { rowEl.textContent = label + 'chưa mở — nâng cấp động phủ để mở thêm ô điền.'; body.appendChild(rowEl); return; }
        if (v.stage === 'empty') {
          rowEl.innerHTML = label + 'đất trống.';
          if (inCave) {
            var sel = document.createElement('select');
            Object.keys(DP.SEEDS).forEach(function (sid) {
              var o = document.createElement('option');
              o.value = sid;
              o.textContent = (L.ITEMS[sid] ? L.ITEMS[sid].name : sid) + ' — đang có ' + L.countItem(ch, sid);
              sel.appendChild(o);
            });
            rowEl.appendChild(sel);
            rowEl.appendChild(dpBtn('Gieo hạt', function () {
              var r = DP.plant(ch, flags, idx, sel.value, Date.now());
              if (!r.ok) { toast({ noseeditem: 'Túi không có hạt đó — mua hạt ở mục Hạt giống bên dưới.', busy: 'Ô này đang có cây rồi.', locked: 'Ô điền chưa mở.' }[r.reason] || 'Chưa gieo được.'); return; }
              if (SND) SND.sfx('plant'); // gieo hạt: tiếng hạt chạm đất mềm
              toast('Đã gieo ' + (L.ITEMS[r.herb] ? L.ITEMS[r.herb].name : r.herb) + ' — chín sau ' + dpFmtLeft(r.growMs) + '.');
              saveGame(); renderDongPhuPanel(idx);
            }));
          }
          body.appendChild(rowEl); return;
        }
        var herbName = L.ITEMS[v.herb] ? L.ITEMS[v.herb].name : v.herb;
        var stageTxt = { seed: 'mới nảy mầm', sprout: 'đang lớn', grown: 'sắp chín', ready: 'ĐÃ CHÍN — thu hoạch được!' }[v.stage] || v.stage;
        rowEl.innerHTML = label + '<b>' + herbName + '</b> — ' + stageTxt + (v.stage === 'ready' ? '' : ' (còn ' + dpFmtLeft(v.msLeft) + ')') + (v.watered ? ' · đã tưới nước giếng' : '');
        if (inCave && v.stage !== 'ready') {
          rowEl.appendChild(dpBtn('Tưới nước giếng (-30% thời gian còn lại)', function () {
            var r = DP.water(flags, idx, Date.now());
            if (!r.ok) { toast(r.reason === 'watered' ? 'Cây này đã tưới rồi — mỗi cây chỉ tưới một lần.' : 'Chưa tưới được.'); return; }
            if (SND) SND.sfx('water'); // tưới nước giếng: tiếng nước rót
            toast('Đã tưới nước giếng linh — cây lớn nhanh hơn hẳn.');
            saveGame(); renderDongPhuPanel(idx);
          }, v.watered));
        }
        if (inCave && v.stage === 'ready') {
          rowEl.appendChild(dpBtn('Thu hoạch (+' + DP.HARVEST_YIELD + ' ' + herbName + ')', function () {
            var r = DP.harvest(ch, flags, idx, Date.now());
            if (!r.ok) { toast('Chưa thu hoạch được.'); return; }
            if (SND) SND.sfx('gather'); // thu hoạch linh điền dùng chung tiếng hái dược
            toast('Thu hoạch linh điền: +' + r.n + ' ' + herbName + ' vào túi — đem tới Đan Lô của Lý lão để luyện đan.');
            updateHUD(); saveGame(); renderDongPhuPanel(idx);
          }));
        }
        body.appendChild(rowEl);
      })(drow);
    }
    var sTitle = document.createElement('p');
    sTitle.innerHTML = '<b>Hạt giống</b> (Lý Tiểu Hạnh gửi bán tại cửa phủ — gieo 1 hạt thu ' + DP.HARVEST_YIELD + ' dược; hái hoang cũng có tỉ lệ rơi hạt cùng loài):';
    body.appendChild(sTitle);
    Object.keys(DP.SEEDS).forEach(function (sid) {
      var sd = DP.SEEDS[sid];
      if (sd.noShop) return; // Hạt Lúa Linh chỉ có từ kỳ ngộ NV06, không bán ở cửa phủ.
      var sRow = document.createElement('div');
      sRow.style.cssText = 'margin:3px 0;';
      sRow.innerHTML = (L.ITEMS[sid] ? L.ITEMS[sid].name : sid) + ' — ' + sd.price + ' Linh Thạch · chín sau ' + dpFmtLeft(sd.growMs) + ' · đang có ' + L.countItem(ch, sid) + ' hạt. ';
      sRow.appendChild(dpBtn('Mua 1', function () {
        var r = DP.buySeed(ch, sid, 1);
        if (!r.ok) { toast('Chưa đủ Linh Thạch mua hạt.'); return; }
        if (SND) SND.sfx('shop_buy');
        updateHUD(); saveGame(); renderDongPhuPanel(focusPlot);
      }, ch.linhThach < sd.price));
      sRow.appendChild(dpBtn('Mua 5', function () {
        var r = DP.buySeed(ch, sid, 5);
        if (!r.ok) { toast('Chưa đủ Linh Thạch mua 5 hạt.'); return; }
        if (SND) SND.sfx('shop_buy');
        updateHUD(); saveGame(); renderDongPhuPanel(focusPlot);
      }, ch.linhThach < sd.price * 5));
      body.appendChild(sRow);
    });
    var note = document.createElement('p');
    note.style.cssText = 'font-size:12px;opacity:0.85';
    note.textContent = 'Sơn Tinh không có hạt giống — tinh hoa của núi kết trăm năm mới thành hình, chỉ hái được ngoài hoang.';
    body.appendChild(note);
  }
  function renderRealmPanel() {
    if (!SR) return;
    var now = Date.now();
    var st = SR.status(flags, now);
    var day0 = new Date(now); day0.setHours(0, 0, 0, 0);
    var html = '';
    html += '<p><b>Bí cảnh Thanh Khê</b> — khe nứt của phong ấn dưới giếng cổ mở LUÂN PHIÊN các bí cảnh theo phiên trong ngày (mỗi phiên 25 phút, 1 lượt/phiên, tối đa 2 lượt/ngày mỗi cảnh). Đứng cạnh khe nứt phát sáng ở sân giếng cổ rồi bấm nút Vào.</p>';
    if (SR.rotationStatus) {
      SR.rotationStatus(flags, now).forEach(function (rw) {
        var def = SR.realmById(rw.id);
        var sched = def.sessions.map(function (m) { return fmtClock(day0.getTime() + m * 60000); }).join(' · ');
        var cond = rw.minTier > 0 ? ' Cần Luyện Khí tầng ' + rw.minTier + '+.' : ' Cần đã lộ linh căn.';
        if (rw.open) {
          html += '<p style="color:#2e7d32"><b>' + rw.name + '</b> (' + sched + ') — <b>ĐANG MỞ</b>, còn ' + fmtDur(rw.endsInSec) + '. Lượt còn: phiên này ' + rw.entriesLeftSession + ', hôm nay ' + rw.entriesLeftToday + '.' + cond + '</p>';
        } else {
          html += '<p><b>' + rw.name + '</b> (' + sched + ') — đang đóng. Phiên tới <b>' + (rw.next ? fmtClock(rw.next.start) : '?') + '</b>' + (rw.next && rw.next.dayOffset ? ' ngày mai' : '') + '. Lượt còn hôm nay: ' + rw.entriesLeftToday + '.' + cond + '</p>';
        }
      });
    }
    html += '<p>Trong mỗi lượt vào cảnh có thể mọc <b>thiên tài địa bảo</b> phát sáng ở vị trí ngẫu nhiên (hái như dược thường, hết lượt là biến mất) và một <b>kỳ ngộ yêu thú</b> mạnh theo cảnh giới của bạn có thể hiện thân (tối đa 1 lần/lượt).</p>';
    html += '<p>Ngoài 4 cảnh định kỳ, kho bí cảnh còn 11 cảnh nữa chỉ mở qua <b>Vết Nứt Hư Không</b> — sự kiện hậu Trúc Cơ: mỗi chu kỳ 3 giờ một vết nứt xé mở 30 phút trên một map thường (có banner báo), vào là bốc ngẫu nhiên 1 cảnh: Vườn Dược Cổ, Độc Sào Yêu Huyệt, Linh Mộc Lâm, Linh Thú Viên, Cổ Chiến Trường, Địa Mạch Hỏa Huyệt, Kiếm Mộ Cổ, Hàn Băng Động, Bãi Săn Tinh Anh, Thủy Phủ Tàn Cung, Lôi Vực Tàn Tích. Luật trong nứt khắc nghiệt hơn hẳn bí cảnh thường — xem panel Vết Nứt khi đứng cạnh vết rách.</p>';
    if (!flags.kyNgo) html += '<p style="color:#a33">Điều kiện chung: phải lộ linh căn ở giếng cổ trước.</p>';
    html += '<p><b>Bí cảnh kỳ ngộ:</b> khi đánh quái hoang dã hoặc hái dược ngoài trời, hiếm khi cơ duyên tới — một bí cảnh cá nhân hiện ra cho riêng bạn, vào ngay hoặc bỏ qua (bỏ là mất). ' + (st.fateCooldownSec > 0 ? 'Nhịp chờ kỳ ngộ hiện tại: còn ' + fmtDur(st.fateCooldownSec) + '.' : 'Kỳ ngộ có thể đến bất cứ lúc nào.') + '</p>';
    // QA 18:46 30/10: kỳ ngộ nguồn gốc của NV01/NV07 chỉ chờ ở bãi
    // quái Rừng Thanh Sơn (map 2) — tuyến chính rời map 2 từ rất sớm,
    // không nói rõ một câu ở đây thì người chơi không bao giờ quay
    // lại đó săn quái và kỳ ngộ không bao giờ tới.
    if (ch && (ch.storyOrigin === 'nv01' || ch.storyOrigin === 'nv07') && !(flags.originFate && flags.originFate[ch.storyOrigin])) {
      html += '<p><i>Kỳ ngộ nguồn gốc của bạn đang chờ ở bãi quái Rừng Thanh Sơn, phía đông làng — quay lại đó săn quái, cơ duyên sẽ tự tìm tới.</i></p>';
    }
    // NHÓM B (mục 21): gợi ý đúng điểm chờ của từng nguồn gốc, cùng
    // khuôn gợi ý NV01/NV07 ở trên — người chơi không phải đoán mò.
    if (ch && !(flags.originFate && flags.originFate[ch.storyOrigin])) {
      var ogHintB = {
        nv06: 'Kỳ ngộ nguồn gốc của bạn đang chờ ở bãi hoang Làng Thanh Khê — hái dược ở đó, mảnh ruộng phát sáng sẽ tự hiện ra.',
        nv11: 'Kỳ ngộ nguồn gốc của bạn đang chờ ở bãi tuyển Chân Núi Thanh Phong — săn quái hoặc hái dược ở đó, kho sách cũ sẽ tự mở.',
        nv03: 'Kỳ ngộ nguồn gốc của bạn đang chờ ở Miếu Sơn Thần — nói chuyện với Từ bà khi mang theo Lá Bùa Không Chữ.',
        nv05: 'Kỳ ngộ nguồn gốc của bạn đang chờ ở giếng cổ — sau chương 5, tới giếng nghe tiếng chuông không người gõ.',
        nv09: 'Kỳ ngộ nguồn gốc của bạn đang chờ ở suối linh Rừng Thanh Sơn — tới bờ suối khi mang theo Ngọc Bội Khuyết.',
        nv12: 'Kỳ ngộ nguồn gốc của bạn đang chờ ở vườn đào đầu làng — tới đó sau chương 5, gốc đào cổ sẽ nở hoa trái mùa.'
      }[ch.storyOrigin];
      if (ogHintB) html += '<p><i>' + ogHintB + '</i></p>';
    }
    $('realmBody').innerHTML = html;
    var openDef = SR.openRealm ? SR.openRealm(now) : null;
    var btn = $('btnEnterRealm');
    btn.disabled = !(openDef && nearRealmGate());
    btn.textContent = openDef ? (nearRealmGate() ? 'Vào ' + openDef.name : 'Vào bí cảnh (đi tới khe nứt cạnh giếng cổ trước)') : 'Vào bí cảnh (chưa mở)';
  }
  function openRealmPanel() { if (!SR) return; renderRealmPanel(); $('panelRealms').style.display = 'block'; }
  // ---------- SỰ KIỆN VẾT NỨT HƯ KHÔNG (js/rift-events.js) ----------
  function riftReasonText(reason) {
    return {
      nomodule: 'Sự kiện chưa sẵn sàng.',
      norift: 'Vết nứt chưa mở — nó xé mở theo chu kỳ, mỗi lần một nơi.',
      noroot: 'Chưa lộ linh căn ở giếng cổ — hư không sẽ xé nát người chưa có linh căn ngay khi bước vào.',
      lowrealm: 'CHƯA ĐỦ CẢNH GIỚI: chỉ tu sĩ từ Trúc Cơ trở lên mới vào được vết nứt. Kinh mạch dưới Trúc Cơ chạm linh khí hư không là đứt — tông môn cấm, và cấm là để giữ mạng ngươi.',
      locked: 'Bạn đã gục trong vết nứt chu kỳ này — khe nứt đã khép với bạn tới hết chu kỳ. Chờ chu kỳ sau.',
      limit: 'Đã hết lượt vào trong chu kỳ này (tối đa ' + (RIFT ? RIFT.MAX_ENTRIES : 2) + ' lượt/chu kỳ). Chờ chu kỳ sau.',
      inrun: 'Đang ở trong một bí cảnh khác — xong lượt đó rồi hẵng vào vết nứt.',
      nopick: 'Kho hư không không có cảnh nào mở cho cảnh giới của bạn lúc này.'
    }[reason] || 'Chưa vào được vết nứt.';
  }
  function nearRiftCrack(now) {
    if (!RIFT) return false;
    var info = RIFT.cycleInfo(now || Date.now());
    if (!info.active || curMapId !== info.anchor.mapId) return false;
    var d = Math.sqrt(Math.pow(info.anchor.x * TILE + 16 - px, 2) + Math.pow(info.anchor.y * TILE + 28 - py, 2));
    return d <= 72;
  }
  function renderRiftPanel() {
    if (!RIFT || !ch) return;
    var now = Date.now();
    var d = RIFT.panelData(flags, ch, qs, now);
    var html = '';
    html += '<p><b>Vết Nứt Hư Không</b> — phong ấn giếng cổ nứt hẳn, trời bắt đầu rách trên đất Thanh Khê. Mỗi chu kỳ <b>' + d.rules.cycleHours + ' giờ</b> một vết nứt xé mở ngẫu nhiên trên một map thường trong <b>' + d.rules.durationMin + ' phút</b>. Bước vào là bốc ngẫu nhiên một cảnh trong kho hư không.</p>';
    if (d.active) {
      html += '<p style="color:#7b2d8b"><b>ĐANG MỞ</b> tại <b>' + d.info.anchor.place + '</b> — còn ' + Math.floor(d.msLeft / 60000) + ' phút ' + Math.floor((d.msLeft % 60000) / 1000) + ' giây. Đứng cạnh vết rách phát sáng rồi bấm E (hoặc nút Vào bên dưới khi đã đứng cạnh).</p>';
    } else if (d.nextSpawnAt) {
      html += '<p>Vết nứt kế tiếp mở tại <b>' + d.nextAnchor.place + '</b> lúc ' + new Date(d.nextSpawnAt).toLocaleTimeString('vi-VN') + '.</p>';
    }
    html += '<p><b>Điều kiện:</b> cảnh giới <b>Trúc Cơ trở lên</b> ' + (d.rankOk ? '— bạn ĐẠT.' : '— bạn CHƯA đạt (hư không xé nát kinh mạch dưới Trúc Cơ trong vài hơi thở).') + '<br>Lượt vào chu kỳ này: <b>' + d.entriesUsed + '/' + d.rules.maxEntries + '</b>' + (d.locked ? ' · <b style="color:#a33">Bạn đã gục trong vết nứt chu kỳ này — khe đã khép với bạn tới hết chu kỳ.</b>' : '') + '</p>';
    html += '<p><b>Cảnh có thể bốc được ở cảnh giới của bạn:</b> ' + (d.eligibleRealms.length ? d.eligibleRealms.join(' · ') : '(chưa cảnh nào — cần Trúc Cơ)') + '</p>';
    html += '<p><b>Luật khó (chốt cứng):</b></p><ul style="margin:4px 0 4px 18px;padding:0">';
    html += '<li>Quái trong cảnh co theo tầng + cảnh giới của NGƯỜI VÀO rồi đè thêm một bậc: Máu ×' + d.rules.hpMult + ', công ×' + d.rules.atkMult + ' so với bí cảnh thường. Boss kỳ ngộ là thứ mạnh nhất cảnh.</li>';
    html += '<li>Đan hồi Máu <b>dưới Địa phẩm bị chặn</b> trong cảnh — linh khí hư không thiêu rụi dược lực; chỉ đan Địa/Thiên phẩm dùng được.</li>';
    html += '<li><b>Chết trong cảnh</b> = bị hất văng ra, hồi sinh ở trấn (không mất đồ/tu vi thêm) nhưng <b>vết nứt khép với bạn tới hết chu kỳ</b>.</li>';
    html += '<li>Cảnh không có boss thì phải hạ đủ ' + d.rules.clearKills + ' quái mới tính hoàn thành. Hết giờ trong cảnh cũng bị đẩy ra.</li></ul>';
    html += '<p>Thưởng theo bảng của cảnh được bốc: Yêu Đan các cấp, thiên tài địa bảo, trứng linh thú, đan phương — Yêu Đan Cấp 3 chỉ tới được qua kỳ ngộ trong cảnh (20%) và Bãi Săn Tinh Anh (12%), đúng mức cảnh giới của bạn.</p>';
    $('riftBody').innerHTML = html;
    var btn = $('btnEnterRift');
    var chk = RIFT.canEnterRift(flags, ch, now);
    btn.disabled = !(chk.ok && nearRiftCrack(now));
    btn.textContent = !d.active ? 'Vào vết nứt (chưa mở)' : (!chk.ok ? 'Vào vết nứt (' + riftReasonText(chk.reason).split(':')[0].toLowerCase() + ')' : (nearRiftCrack(now) ? 'BƯỚC VÀO VẾT NỨT' : 'Vào vết nứt (đi tới vết rách đang mở trước)'));
  }
  function openRiftPanel() { if (!RIFT) return; renderRiftPanel(); $('panelRift').style.display = 'block'; }
  function enterRift(now) {
    if (!RIFT || !SR) return { ok: false, reason: 'nomodule' };
    now = now || Date.now();
    var r = RIFT.beginRiftRun(flags, ch, qs, now, Math.random, realmReturnPoint());
    if (!r.ok) { toast(riftReasonText(r.reason)); return r; }
    $('panelRift').style.display = 'none';
    var mp = SR.REALM_MAPS[r.def.mapId];
    switchMap(r.def.mapId, mp.start.x, mp.start.y);
    toast('Bạn bước vào ' + r.def.name + ' — hư không đè xuống nặng hơn cảnh giới của bạn một bậc. Đan thường ở đây là tro. Sống sót trở ra!');
    if (SND) SND.sfx('kyngo');
    saveGame();
    return { ok: true, def: r.def };
  }
  // Tick sự kiện vết nứt: banner 1 lần/chu kỳ khi nứt mở + thanh banner
  // tím hiện trong suốt 30 phút mở (trừ lúc đang ở trong cảnh).
  function tickRift(nowOverride) {
    if (!RIFT || !ch) return;
    var now = nowOverride || Date.now();
    if (now - riftTickLast < 500) return;
    riftTickLast = now;
    var fresh = RIFT.pollBanner(flags, now);
    if (fresh) toast('⚠ VẾT NỨT HƯ KHÔNG đã xé mở tại ' + fresh.anchor.place + ' — chỉ mở 30 phút, chỉ dành cho tu sĩ Trúc Cơ trở lên!');
    var b = $('riftBanner');
    if (b) {
      var info = RIFT.cycleInfo(now);
      var inRealm = SR && SR.isRealmMap(curMapId);
      if (info.active && !inRealm) {
        riftBannerLiveUntil = info.expiresAt;
        var sec = Math.max(0, Math.round((info.expiresAt - now) / 1000));
        setStripText(b, 'VẾT NỨT HƯ KHÔNG đang mở tại ' + info.anchor.place + ' — còn ' + Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2) + ' · Chỉ Trúc Cơ trở lên');
        b.style.display = stripWanted('riftBanner') ? 'block' : 'none';
      } else { riftBannerLiveUntil = 0; b.style.display = 'none'; }
    }
  }
  // Hook hạ quái (cả 2 đường đánh thường/skill đều qua onMonsterKilled):
  // trong bí cảnh thì ghi tiến độ + trả thưởng; ngoài trời thì lăn kỳ ngộ.
  function onRealmKill(m) {
    if (!SR || !ch) return;
    var s = SR.ensure(flags);
    if (s && s.run && curMapId === s.run.mapId) {
      if (m.riftEncounter) {
        toast('Kỳ ngộ bí cảnh: đã hạ ' + m.name + '!');
        grantRealmRewards(SR.rollEncounterRewards(ch, Math.random));
        // VẾT NỨT: hạ kỳ ngộ trong cảnh của vết nứt → tiến độ nhiệm vụ 3.
        if (RIFT) {
          var rk3 = RIFT.noteEncounterKilled(flags, qs);
          if (rk3.questDone) toast('Đã hạ kẻ canh giữ thứ hai! Về gặp đại diện tông môn để trả nhiệm vụ "' + L.QUESTS[rk3.questDone].title + '".');
        }
        updateHUD(); saveGame();
        return;
      }
      var res = SR.noteKill(flags, { boss: !!m.realmBoss });
      // VẾT NỨT: tiến độ riêng của sự kiện — nhiệm vụ 2 (hạ boss cảnh)
      // + hoàn thành cảnh KHÔNG boss bằng số kill (noteKill của
      // secret-realms không tự chốt được cảnh goal 'clear').
      var rk = RIFT ? RIFT.noteRealmKill(flags, qs, m) : null;
      if (rk && rk.questDone) toast('Đã hạ yêu thú canh giữ khe nứt! Về gặp đại diện tông môn để trả nhiệm vụ "' + L.QUESTS[rk.questDone].title + '".');
      if (res.completed) completeRealmRun(s.run);
      else if (rk && rk.completed && !s.run.rewarded) completeRealmRun(s.run);
      else maybeSpawnEncounter();
      return;
    }
    if (m.ev || m.boss) return;
    maybeRollFate('kill', Math.random);
  }
  function onRealmGather() {
    if (!SR || !ch) return;
    var s = SR.ensure(flags);
    if (s && s.run) { maybeSpawnEncounter(); return; }
    maybeRollFate('gather', Math.random);
  }
  // Kỳ ngộ trong cảnh: boss co giãn theo cảnh giới hiện thân GẦN người
  // chơi (ô đi được gần nhất theo vòng lệch thử sẵn) — tối đa 1 lần/lượt,
  // module tự giữ cờ encounterUsed trong run.
  function maybeSpawnEncounter() {
    if (!SR || !ch || !SR.rollEncounter) return;
    var mp = curMap();
    var pt = playerTile();
    var offs = [[2, 0], [-2, 0], [0, 2], [0, -2], [3, 1], [-3, -1], [1, 3], [-1, -3], [3, 3], [-3, 3], [4, 0], [0, 4], [-4, 0], [0, -4], [2, 2], [-2, -2]];
    var placed = null;
    for (var i = 0; i < offs.length; i++) {
      var tx = pt.x + offs[i][0], ty = pt.y + offs[i][1];
      if (tx < 0 || ty < 0 || tx >= mp.w || ty >= mp.h) continue;
      if (M.isBlockedIn(mp, tx, ty)) continue;
      placed = { x: tx, y: ty }; break;
    }
    if (!placed) return;
    // VẾT NỨT: nhiệm vụ 3 đang dở → kỳ ngộ CHẮC CHẮN hiện thân ở lần
    // động thủ đầu tiên trong lượt (rng = 0) và nhận thêm hệ số sự
    // kiện để thành thứ mạnh nhất cảnh (rift-events.js).
    var forceEnc = !!(RIFT && RIFT.shouldForceEncounter(flags, qs));
    var sp = SR.rollEncounter(flags, ch, forceEnc ? function () { return 0; } : Math.random);
    if (!sp) return;
    var encM = makeMonster(sp.type, placed.x, placed.y, sp.extra);
    if (RIFT && RIFT.inRiftRun(flags)) RIFT.scaleEncounter(encM);
    monsters.push(encM);
    toast('Kỳ ngộ bí cảnh! ' + sp.extra.name + ' bị linh khí kinh động, hiện thân ngay gần bạn!');
    saveGame();
  }
  function maybeRollFate(kind, rngFn) {
    if (!SR || !ch) return null;
    if (SR.isRealmMap(curMapId)) return null;
    var offer = SR.rollFate(flags, {
      kind: kind, eligible: !!ch.root,
      // Kỳ ngộ nguồn gốc NHÓM A (mục 20): ngữ cảnh để module chọn mẫu
      // nguồn gốc ưu tiên — nguồn gốc từ ch.storyOrigin (OG.ensure đã
      // suy cho save cũ), map/tầng/nhiệm vụ trục đã trả tại thời điểm
      // lăn. Không có storyOrigin thì module giữ hành vi cũ (3 mẫu).
      storyOrigin: ch.storyOrigin || (OG ? OG.storyOriginFor(ch) : null),
      mapId: curMapId, tier: ch.tier || 0, turnedIn: qs.turnedIn
    }, Date.now(), rngFn);
    if (offer) {
      var tpl = SR.templateById(offer.templateId);
      $('fateTitle').textContent = 'Kỳ ngộ: ' + tpl.name + '!';
      $('fateText').textContent = tpl.story + ' Bí cảnh chỉ mở cho riêng bạn trong 60 giây — vào ngay hoặc bỏ qua (bỏ là mất).';
      $('panelFate').style.display = 'block';
      toast('Kỳ ngộ! ' + tpl.name + ' hiện ra trước mắt bạn.');
      saveGame();
    }
    return offer;
  }
  // ---------- KỲ NGỘ NGUỒN GỐC NHÓM B DẠNG ĐIỂM KÍCH HOẠT ----------
  // Ngữ cảnh kiểm tra điểm kích hoạt: nguồn gốc + nhiệm vụ trục đã
  // trả + vật phẩm trong túi (dấu ấn). Dùng chung cho nút gieo quẻ
  // ở Từ bà, tương tác giếng cổ và điểm suối/vườn đào trên map.
  function spotCtx() {
    return {
      storyOrigin: ch ? (ch.storyOrigin || (OG ? OG.storyOriginFor(ch) : null)) : null,
      turnedIn: qs ? qs.turnedIn : [],
      items: ch && ch.inventory ? ch.inventory.map(function (it) { return it.id; }) : []
    };
  }
  function enterOriginSpot(spotId) {
    if (!SR || !SR.beginSpotRun) return { ok: false, reason: 'nomodule' };
    if (!SR.spotAvailable(spotId, spotCtx(), flags.originFate)) {
      toast('Kỳ ngộ này chưa mở — xem lại điều kiện nguồn gốc / nhiệm vụ trục / dấu ấn trong túi.');
      return { ok: false, reason: 'locked' };
    }
    var r = SR.beginSpotRun(flags, spotId, Date.now(), realmReturnPoint());
    if (!r.ok) { toast(r.reason === 'inrun' ? 'Bạn đang ở trong một bí cảnh khác.' : 'Chưa vào được kỳ ngộ này.'); return r; }
    closeDialogue();
    var mp = SR.REALM_MAPS[SR.FATE.mapId];
    switchMap(SR.FATE.mapId, mp.start.x, mp.start.y);
    if (r.template.peaceful) {
      showFateChoicePanel(r.template);
      toast('Bạn bước vào ' + r.template.name + '. ' + r.template.story);
    } else toast('Bạn bước vào ' + r.template.name + '. Dọn sạch quái gác để nhận thưởng — rời khỏi đây là không vào lại được.');
    saveGame();
    return { ok: true, template: r.template };
  }
  // Kỳ ngộ tông nhóm 1 + nhóm 2 (mục 22–23): vào instance kỳ ngộ tông từ nút
  // thoại đại diện tông — khuôn y hệt enterOriginSpot, chỉ khác
  // cổng kiểm (sectFateAvailable) và hàm bắt đầu run (beginSectRun).
  // Kỳ ngộ tông nào cũng peaceful nên vào là hiện panel lựa chọn.
  function enterSectFate(sectId) {
    if (!SR || !SR.beginSectRun) return { ok: false, reason: 'nomodule' };
    if (!SR.sectFateAvailable(sectId, flags, qs ? qs.turnedIn : [])) {
      toast('Kỳ ngộ tông này chưa mở — cần bái nhập đúng tông và trả nhiệm vụ trục chương 13 (Báo danh nhập môn).');
      return { ok: false, reason: 'locked' };
    }
    var r = SR.beginSectRun(flags, sectId, Date.now(), realmReturnPoint());
    if (!r.ok) { toast(r.reason === 'inrun' ? 'Bạn đang ở trong một bí cảnh khác.' : 'Chưa vào được kỳ ngộ tông này.'); return r; }
    closeDialogue();
    var mp = SR.REALM_MAPS[SR.FATE.mapId];
    switchMap(SR.FATE.mapId, mp.start.x, mp.start.y);
    showFateChoicePanel(r.template);
    toast('Bạn bước vào ' + r.template.name + '. ' + r.template.story);
    saveGame();
    return { ok: true, template: r.template };
  }
  function acceptFateOffer(now) {
    if (!SR) return { ok: false, reason: 'nomodule' };
    var r = SR.acceptFate(flags, now || Date.now(), realmReturnPoint());
    $('panelFate').style.display = 'none';
    if (!r.ok) return r;
    var mp = SR.REALM_MAPS[SR.FATE.mapId];
    switchMap(SR.FATE.mapId, mp.start.x, mp.start.y);
    // Kỳ ngộ nguồn gốc HÒA BÌNH (NV04, NV08): không quái gác nên vào
    // là hiện lựa chọn ngay, không đợi dọn quái.
    if (r.template.peaceful) {
      showFateChoicePanel(r.template);
      toast('Bạn bước vào ' + r.template.name + '. ' + r.template.story);
    } else toast('Bạn bước vào ' + r.template.name + '. Dọn sạch quái gác để nhận thưởng — rời khỏi đây là không vào lại được.');
    saveGame();
    return { ok: true, template: r.template };
  }
  // Panel lựa chọn của kỳ ngộ nguồn gốc (mục 20): mỗi nút là một lựa
  // chọn trong template.choices; chọn xong mới trả thưởng (xem
  // completeRealmRun) nên không thể nhận cả hai đường.
  // QA 19:01 30/10 (lượt test+khắc phục theo lệnh Bui 19:35): panel này
  // từng KẸT LẠI che màn hình khi người chơi rời cảnh/chết/hết giờ mà
  // chưa chọn — panel không có nút đóng và lựa chọn thành nút chết.
  // Luật nay: (1) nút "Để sau" ẩn panel nhưng GIỮ run, quay về gần
  // điểm vào cảnh thì panel tự mở lại; (2) mọi đường thoát cảnh/chết/
  // hết giờ đều ẩn panel (hideFateChoicePanel gọi ở exitRealm,
  // onRealmDeath, tickRealms); (3) panel đang mở thì phím hành động bị
  // nuốt ở keydown, phím 1/2 chọn ngay lựa chọn tương ứng.
  var fateChoiceDeferred = false, fateChoiceAway = false;
  function fateChoicePanelOpen() {
    var el = $('panelFateChoice');
    return !!(el && el.style.display === 'block');
  }
  function hideFateChoicePanel() {
    var el = $('panelFateChoice');
    if (el) el.style.display = 'none';
    fateChoiceDeferred = false; fateChoiceAway = false;
  }
  function showFateChoicePanel(tpl) {
    var el = $('panelFateChoice'); if (!el || !tpl || !tpl.choices) return;
    fateChoiceDeferred = false; fateChoiceAway = false;
    $('fateChoiceTitle').textContent = 'Kỳ ngộ: ' + tpl.name + '!';
    $('fateChoiceText').textContent = tpl.story + ' Lựa chọn chỉ gặp một lần — chọn xong không đổi được, cân nhắc kỹ (phím 1/2 cũng chọn được).';
    var box = $('fateChoiceBtns'); box.innerHTML = '';
    tpl.choices.forEach(function (choice) {
      var b = document.createElement('button');
      var label = choice.label;
      // QA 18:31 30/10: nút thu phục NV04 phải hiện tỉ lệ ngay trên
      // nút — tỉ lệ thật tính đúng luật pets.js (máu 25% của template),
      // không đổi tỉ lệ, chỉ hiện ra cho người chơi cân nhắc.
      if (choice.capture && PETS && PETS.SPECIES && PETS.SPECIES[choice.capture]) {
        label += ' — tỉ lệ thu phục khoảng ' + Math.round(PETS.captureChance(PETS.SPECIES[choice.capture], choice.captureHpPct || 0.25) * 100) + '%';
      }
      b.textContent = label; b.style.display = 'block'; b.style.marginTop = '8px';
      b.addEventListener('click', function () { chooseFateChoice(choice.id); });
      box.appendChild(b);
    });
    var db = document.createElement('button');
    db.textContent = 'Để sau — ra ngoài đã';
    db.style.display = 'block'; db.style.marginTop = '8px';
    db.addEventListener('click', function () {
      el.style.display = 'none';
      fateChoiceDeferred = true; fateChoiceAway = false;
      toast('Đã gác lại lựa chọn — quay về gần điểm vào cảnh để chọn tiếp, hoặc đi ra ô sáng ở cửa để rời cảnh; rời cảnh khi chưa chọn thì kỳ ngộ này tan biến.');
    });
    box.appendChild(db);
    el.style.display = 'block';
  }
  function chooseFateChoice(choiceId) {
    if (!SR || !flags.sr || !flags.sr.run) return { ok: false, reason: 'norun' };
    var tpl = SR.templateById(flags.sr.run.templateId);
    var choice = null;
    if (tpl && tpl.choices) tpl.choices.forEach(function (c) { if (c.id === choiceId) choice = c; });
    if (!choice) return { ok: false, reason: 'badchoice' };
    // NV04 đường thu phục: kiểm tra điều kiện luật thu phục TRƯỚC khi
    // chốt lựa chọn — thiếu bùa hoặc chuồng đầy thì panel ở lại để
    // người chơi còn chọn đường băng bó thay vì mất kỳ ngộ oan.
    if (choice.capture && PETS) {
      if (PETS.countItem(ch, PETS.CHARM_ID) < 1) { toast('Cần Bùa Ngự Thú mới thu phục được. Mua ở thương nhân Mã Vạn Lai — hoặc chọn đường băng bó.'); return { ok: false, reason: 'no_charm' }; }
      if (PETS.ensurePets(ch).owned.length >= PETS.STABLE_MAX) { toast('Chuồng linh thú đã đầy — hoặc chọn đường băng bó.'); return { ok: false, reason: 'stable_full' }; }
    }
    var r = SR.chooseFateChoice(flags, choiceId);
    if (!r.ok) return r;
    // NV01 đường mài kiếm: dấu ấn cũ biến thành kiếm đã mài.
    if (choice.fromToken && L && L.consumeItem) L.consumeItem(ch, choice.fromToken, 1);
    // NV04 đường thu phục: lăn đúng luật thu phục của pets.js qua các
    // hàm đã xuất (tỉ lệ theo phẩm + máu bị thương 25%, trừ 1 bùa khi
    // lăn thật, trượt vẫn mất bùa; thành công mới có thú).
    if (choice.capture && PETS) {
      PETS.consumeItem(ch, PETS.CHARM_ID, 1);
      var def = PETS.SPECIES[choice.capture];
      var chance = def ? PETS.captureChance(def, choice.captureHpPct || 0.25) : 0;
      if (Math.random() < chance) {
        var g = PETS.grantPet(ch, choice.capture);
        toast(g.ok ? 'Thu phục thành công! Linh hồ non về với bạn.' : 'Chuồng đã đầy, linh hồ non chạy mất.');
      } else toast('Thu phục trượt! (tỉ lệ ' + Math.round(chance * 100) + '%) — mất 1 Bùa Ngự Thú.');
    }
    hideFateChoicePanel();
    toast(choice.text);
    completeRealmRun(flags.sr.run);
    saveGame();
    return { ok: true, choice: choice };
  }
  // Chết trong bí cảnh: lượt coi như mất, run hủy (hồi sinh ở trấn như thường).
  function onRealmDeath() {
    if (!SR || !SR.isRealmMap(curMapId)) return;
    SR.clearRun(flags);
    var t = $('realmTimer'); if (t) t.style.display = 'none';
    hideFateChoicePanel(); // QA 19:01: chết trong cảnh cũng phải đóng panel lựa chọn
  }
  // Tick bí cảnh trong vòng lặp chính: thông báo mở/đóng phiên, ẩn lời mời
  // hết hạn, đồng hồ đếm ngược trong bí cảnh, hết giờ đẩy ra, ô thoát.
  function tickRealms(nowOverride) {
    if (!SR || !ch) return;
    var now = nowOverride || Date.now();
    if (now - srTickLast < 200) return;
    srTickLast = now;
    var s = SR.ensure(flags, now);
    if (!s) return;
    var st = SR.status(flags, now);
    var openDef2 = SR.openRealm ? SR.openRealm(now) : null;
    var openId2 = openDef2 ? openDef2.id : null;
    if (openId2 && openId2 !== srOpenId) toast('Bí cảnh ' + openDef2.name + ' ĐÃ MỞ ở giếng cổ Thanh Khê — khe nứt chỉ mở ' + openDef2.durationMin + ' phút!');
    if (!openId2 && srOpenId && !(s.run && s.run.kind === 'dinh_ky')) toast('Bí cảnh đã đóng — khe nứt phong ấn khép lại.');
    srOpenId = openId2;
    srWasOpen = !!openId2;
    var fateEl = $('panelFate');
    if (fateEl && fateEl.style.display !== 'none' && !SR.validOffer(flags, now)) fateEl.style.display = 'none';
    var timerEl = $('realmTimer');
    if (s.run && curMapId === s.run.mapId) {
      var left = Math.max(0, Math.round((s.run.endAt - now) / 1000));
      if (timerEl) {
        var runDef = (s.run.realmId && SR.realmById) ? SR.realmById(s.run.realmId) : null;
        setStripText(timerEl, (s.run.kind === 'dinh_ky' ? (runDef ? runDef.name : SR.SCHEDULED.name) : 'Kỳ ngộ bí cảnh') + ' — còn ' + fmtDur(left) + (s.run.rewarded ? ' — đã nhận thưởng, đi về ô sáng ở cửa để ra' : ''));
        timerEl.style.display = stripWanted('realmTimer') ? 'block' : 'none';
        if (SR.treasuresFor) {
          var ptT = playerTile();
          SR.treasuresFor(flags).forEach(function (t) {
            if (t.taken) return;
            var key = curMapId + ':' + t.x + ':' + t.y;
            if (!srTreasureSeen[key] && Math.abs(t.x - ptT.x) + Math.abs(t.y - ptT.y) <= 3) {
              srTreasureSeen[key] = true;
              toast('Có thiên tài địa bảo phát sáng gần đây: ' + (L.ITEMS[t.item] ? L.ITEMS[t.item].name : t.item) + '!');
            }
          });
        }
      }
      if (now >= s.run.endAt) { exitRealm(s.run.kind === 'dinh_ky' ? 'Khe nứt khép lại! Bạn bị đẩy ra khỏi bí cảnh.' : 'Kỳ ngộ tan biến — bạn bị đưa ra ngoài.'); return; }
      var mp = curMap();
      if (mp.exit && portalCooldown <= 0) {
        var t2 = playerTile();
        if (t2.x === mp.exit.x && t2.y === mp.exit.y) exitRealm('Bạn rời khỏi bí cảnh.');
      }
      // Panel lựa chọn đã gác lại bằng nút "Để sau": chỉ mở lại khi
      // người chơi đã đi xa khỏi điểm vào cảnh rồi quay về gần nó —
      // không tự bật lại giữa đường (QA 19:01 30/10).
      if (fateChoiceDeferred && s.run.kind === 'ky_ngo' && SR.templateById) {
        var tplD = SR.templateById(s.run.templateId);
        if (tplD && tplD.choices && !s.run.choiceId && mp.start) {
          var ptD = playerTile();
          var dStart = Math.max(Math.abs(ptD.x - mp.start.x), Math.abs(ptD.y - mp.start.y));
          if (dStart > 4) fateChoiceAway = true;
          else if (fateChoiceAway && dStart <= 2) showFateChoicePanel(tplD);
        }
      }
    } else {
      if (timerEl) timerEl.style.display = 'none';
      if (s.run && !SR.isRealmMap(curMapId)) { SR.clearRun(flags); hideFateChoicePanel(); } // run treo do chết/đổi map bất thường — đóng cả panel lựa chọn (QA 19:01)
    }
  }
  var btnRealms = $('btnRealms');
  if (btnRealms) btnRealms.addEventListener('click', openRealmPanel);
  var realmCloseBtn = $('realmClose');
  if (realmCloseBtn) realmCloseBtn.addEventListener('click', function () { $('panelRealms').style.display = 'none'; });
  var btnEnterRealmEl = $('btnEnterRealm');
  if (btnEnterRealmEl) btnEnterRealmEl.addEventListener('click', function () {
    var r = enterScheduledRealm(Date.now());
    if (!r.ok) { toast(enterReasonText(r.reason)); renderRealmPanel(); }
  });
  var riftCloseBtn = $('riftClose');
  if (riftCloseBtn) riftCloseBtn.addEventListener('click', function () { $('panelRift').style.display = 'none'; });
  var btnEnterRiftEl = $('btnEnterRift');
  if (btnEnterRiftEl) btnEnterRiftEl.addEventListener('click', function () {
    var r = enterRift(Date.now());
    if (!r.ok) renderRiftPanel();
  });
  var fateEnterBtn = $('fateEnter');
  if (fateEnterBtn) fateEnterBtn.addEventListener('click', function () {
    var r = acceptFateOffer(Date.now());
    if (!r.ok) toast('Kỳ ngộ đã tan biến...');
  });
  var fateSkipBtn = $('fateSkip');
  if (fateSkipBtn) fateSkipBtn.addEventListener('click', function () {
    if (SR) SR.declineFate(flags);
    $('panelFate').style.display = 'none';
    toast('Bạn bỏ qua kỳ ngộ — cơ duyên tan biến.');
    saveGame();
  });
  // Móc controls (6): js/controls.js gọi các hành động thật của game qua
  // đây (tay cầm + nút ảo + phím gán lại) — chỉ xuất ra, không đổi luồng.
  if (typeof window !== 'undefined') {
    window.PNT_HOOKS = {
      account: function () { return currentAccount; },
      toast: function (m) { toast(m); },
      attack: function () { attack(); },
      interact: function () { interact(); },
      meditate: function () { meditate(); },
      fly: function () { toggleFlight(); },
      bar: function (i) { if (SK && SK.BAR && SK.BAR[i]) castSkill(SK.BAR[i]); },
      art: function (i) { castArtifactActive(i); },
      padSkill: function (d) {
        if (!d) return;
        if (d.kind === 'bar') { if (SK && SK.BAR && SK.BAR[d.index]) castSkill(SK.BAR[d.index]); }
        else if (d.kind === 'art') castArtifactActive(d.index);
        else if (d.kind === 'util') { if (d.id === 'meditate') meditate(); else if (d.id === 'fly') toggleFlight(); }
      }
    };
  }
  if (typeof window !== 'undefined') {
    window.PNT_TEST = {
      pos: function () { return { px: px, py: py }; },
      mapId: function () { return curMapId; },
      monsters: function () { return monsters.map(function (m) { return { type: m.type, x: m.x, y: m.y, hp: m.hp }; }); },
      moveTarget: function () { return moveTarget; },
      // MỤC 106: hook test đường click — clickPath trả mảng ô hoặc null,
      // movePathLeft trả số đoạn còn lại, clickTo đặt đường như handler.
      clickPath: function (tx, ty, fly) { var mp = curMap(); return findClickPath(mp, Math.floor(px / TILE), Math.floor(py / TILE), tx, ty, !!fly); },
      movePathLeft: function () { return movePath ? movePath.length : 0; },
      clickTo: function (tx, ty, fly) { var mp = curMap(); var p = findClickPath(mp, Math.floor(px / TILE), Math.floor(py / TILE), tx, ty, !!fly); if (!p) return null; var cxp = tx * TILE + 16, cyp = ty * TILE + 28; if (clickTileFree(mp, tx, ty, { x: tx, y: ty }, !!fly) && clickLineClear(mp, px, py, cxp, cyp, { x: tx, y: ty }, !!fly)) { movePath = null; moveTarget = { x: cxp, y: cyp }; } else { movePath = p.map(function (t) { return { x: t.x * TILE + 16, y: t.y * TILE + 28 }; }); moveTarget = movePath.length ? movePath.shift() : null; } return p; },
      teleport: function (tx, ty) { px = tx * TILE + 16; py = ty * TILE + 28; moveTarget = null; movePath = null; pvx = 0; pvy = 0; },
      switchMap: function (toId, tx, ty) { switchMap(toId, tx, ty); }, // QA32: doi map that de test HUD doi ten ngay
      // MUC 108: hinh hoc mui ten quang truong son mon o trang thai hien tai.
      plazaGuide: function () { if (!PLZ || !ch) return null; return PLZ.arrowFor(curMap(), curMapId, flags.sectJoined, playerTile(), { x: camX, y: camY }, { w: effVW(), h: effVH() }, TILE); },
      // QA37: mo phong chet de test phi hoi sinh (muc 37 hang cho).
      simulateDeath: function () { onPlayerDeath(); return { mapId: curMapId, linhThach: ch ? ch.linhThach : null, hp: ch ? ch.hp : null }; },
      deathFee: function () { return DEATH_FEE; },
      // QA35: trang thai tai nen map1 tren man dang ki (hook test).
      bgLoadStatus: function () { refreshBgLoadStatus(); var el = $('bgLoadStatus'); return el ? { visible: el.style.display !== 'none', text: el.textContent } : null; },
      bgLoadReset: function () { delete bgImgs['map1']; refreshBgLoadStatus(); return true; },
      bgLoadEnsure: function () { ensureBg('map1'); return bgMap1Ready(); },
      // QA34: xa cache sheet theo map — lo cache de test kiem chung.
      sheetCache: function () { return { mon: Object.keys(_monSheets), pet: Object.keys(_petSheets), hero: Object.keys(_heroSheets) }; },
      warmMonSheet: function (lv, type, key) { getMonsterSheet(lv, type, key); return Object.keys(_monSheets).indexOf(lv + '/' + type + '/' + key) >= 0; },
      warmPetSheet: function (lv, sp, key) { getPetSheet(lv, sp, key); return Object.keys(_petSheets).indexOf(lv + '/' + sp + '/' + key) >= 0; },
      warmHeroSheet: function (lv, gender, origin, set) { getHeroSheet(lv, gender, origin, set); return Object.keys(_heroSheets).indexOf(lv + '/' + gender + '/' + origin + '/' + set) >= 0; },
      cam: function () { return { x: Math.round(camX * 10) / 10, y: Math.round(camY * 10) / 10 }; },
      move: function () { return { vx: Math.round(pvx), vy: Math.round(pvy), speed: Math.round(Math.sqrt(pvx * pvx + pvy * pvy)), frame: walkFrameIdx, phase: Math.round(walkPhase * 10) / 10 }; },
      action: function () {
        if (action) return { name: action.name, t: Math.round(action.t * 100) / 100, frame: Math.min(19, Math.floor(action.t / action.dur * 20)) };
        if (medActiveNow()) return { name: 'meditate' };
        return null;
      },
      dust: function () { return dusts.length; },
      state: function () { return { ch: ch, qs: qs, flags: flags }; },
      refreshMenu: function () { refreshMenuButtons(); },
      cast: function (id) { return castSkill(id); },
      skillInfo: function () {
        if (!SK || !ch) return null;
        return { ll: ch.ll, maxLL: SK.maxLinhLuc(ch), unlocked: SK.unlockedList(ch), cd: ch.cd, effects: effects.length };
      },
      effects: function () { return effects.map(function (e) { return { skill: e.skill, mech: e.mech || null, t: Math.round(e.t * 100) / 100 }; }); },
      getGfx: function () { return gfxLevel; },
      // PROPS (ATLAS LAB): trạng thái prop của map hiện tại + số prop
      // trong khung quanh nhân vật — hook kiểm chứng tích hợp.
      propsInfo: function () { return PROPS ? PROPS.debugState(curMapId) : null; },
      propsNear: function () { return PROPS ? PROPS.collect(curMapId, px - 384, py - 288, px + 384, py + 288, gfxLevel, Date.now()).length : 0; },
      fps: function () { return SM ? SM.meter.report() : null; },
      smooth: function () { return SM ? SM.info() : null; },
      sound: function () { return SND ? SND.getState() : null; },
      sndLevel: function () { return sndLevel; },
      setSnd: function (lv) { setSndLevel(lv); },
      cycleSnd: function () { cycleSnd(); },
      sndUnlock: function () { return SND ? SND.unlock() : false; },
      sndPlay: function (kind, a, b) {
        if (!SND) return false;
        if (kind === 'voice') return SND.voice(a, b && b.occ, b || {});
        if (kind === 'skill') return SND.skill(a, b);
        return SND.sfx(a);
      },
      clouds: function () {
        if (!CL || !cloudState) return null;
        var sn = CL.snapshot(cloudState, gfxLevel);
        sn.mapId = curMapId;
        sn.active = CL.activeFor(curMapId);
        return sn;
      },
      realmAmbient: function () {
        if (!RA) return null;
        var sn2 = realmFxState ? RA.snapshot(realmFxState, gfxLevel) : null;
        return { active: RA.activeFor(curMapId), mapId: curMapId, snap: sn2 };
      },
      setGfx: function (lv) { setGfx(lv); },
      cycleGfx: function () { cycleGfx(); },
      npcs: function () { return curMap().npcs.filter(function (n) { return npcVisible(n); }).map(function (n) { return n.id; }); },
      tide: {
        state: function () { return flags.tide; },
        meritFlag: function () { return flags.beastTideMerit || 0; },
        start: function () { return startTideRun(); },
        tick: function (dt) { tickTide(dt || 0.5); },
        allies: function () { return tideAllies; },
        monstersRef: function () { return monsters; },
        forfeit: function () { var r = BT ? BT.forfeit(flags) : null; if (r) onTideFinish(r); return r; }
      },
      pets: function () {
        if (!PETS || !ch) return null;
        var st = PETS.ensurePets(ch);
        return {
          owned: st.owned.map(function (p) { var d = PETS.species(p.sp); return { uid: p.uid, sp: p.sp, name: d.name, grade: d.grade, level: p.level, exp: p.exp, hp: p.hp, maxHp: PETS.maxHpOf(p), atk: PETS.atkOf(p), active: st.activeUid === p.uid, downed: PETS.isDowned(p) }; }),
          activeUid: st.activeUid, eggs: st.eggs.map(function (e) { return { sp: e.sp, prog: e.prog, need: e.need }; }),
          ent: { x: Math.round(petEnt.x), y: Math.round(petEnt.y), face: petEnt.face, faceV: petEnt.faceV, hasTarget: !!petEnt.target }
        };
      },
      grantPet: function (sp) { if (!PETS) return null; var r = PETS.grantPet(ch, sp); if (r.ok) { syncPetEnt(true); updateHUD(); saveGame(); } return r.ok ? r.pet : null; },
      setActivePet: function (uid) { if (!PETS) return null; var r = PETS.setActive(ch, uid); if (r.ok) syncPetEnt(true); return r; },
      petCapture: function () { tryCaptureNearest(); },
      petPanelRows: function () { renderPetPanel(); var b = $('petList'); return b ? b.children.length : -1; },
      sects: function () {
        if (!SECT) return null;
        return { unlocked: SECT.unlockedList(qs).map(function (s) { return s.id; }), joined: flags.sectJoined || null, canJoin: SECT.canJoin(flags, qs), ceremony: flags.sectCeremony === true };
      },
      sectAfterTurnIn: function (qid) { if (SECT) SECT.afterTurnIn(flags, qid); },
      joinSect: function (id) {
        if (!SECT) return null;
        var r = SECT.join(flags, qs, id);
        if (r.ok) {
          if (SND) SND.sfx('sect_join'); // QA (e) 15:16 30/10 mục 49: lễ bái nhập tông là dấu mốc cả đời — chuông trang nghiêm, chỉ ở nhánh thành công
          // BIA TRUYỀN KỲ (js/legend-board.js): lễ bái sư là dấu mốc cả đời.
          if (LG) { var lgSect = LG.noteSectJoin(flags, id, SECT.sectById(id) ? SECT.sectById(id).name : id, gameNow()); if (lgSect.ok) toast('Bia Truyền Kỳ: khắc thêm dấu mốc — bái nhập tông môn!'); }
          L.addItem(ch, r.token, 1);
          if (DP) { DP.stampOwner(flags, DP.ownerKeyOf(currentAccount, ch)); DP.ensure(flags); DP.takeGrantNotice(flags); }
          updateHUD(); saveGame();
        }
        return r;
      },
      sectPanelRows: function () { renderSectPanel(); var b = $('sectList'); return b ? b.children.length : -1; },
      sectPoints: function () {
        if (!SECTP || !ch) return null;
        var rk = SECTP.rankOf(ch);
        return { points: rk.points, total: rk.total, rankIdx: rk.idx, rankName: rk.name, shop: SECTP.shopList(ch, flags).map(function (e) { return e.id; }), rankRows: ($('sectRank') ? 1 : 0), shopRows: $('sectShop') ? $('sectShop').children.length : -1 };
      },
      artifacts: function () {
        if (!ART || !ch) return null;
        return {
          slots: [0, 1].map(function (s) { var d = ART.equippedDefAt(ch, s); return d ? d.id : null; }),
          owned: ART.artifactEntries(ch).map(function (e) { return e.id; }),
          totalStats: ART.totalStats(ch),
          shield: !!(ch.art && ch.art.shield),
          acd: ch.acd || {}
        };
      },
      grantArtifact: function (id) { if (!ART) return false; var ok = ART.addArtifact(ch, id); if (ok) { updateHUD(); saveGame(); } return ok; },
      equipArtifact: function (uid) { if (!ART) return null; var r = ART.equip(ch, uid); updateArtBar(); return r; },
      castArtifact: function (slot) { return castArtifactActive(slot); },
      artShopRows: function () { renderArtShop(); var b = $('artShopList'); return b ? b.children.length : -1; },
      wardrobe: function () {
        if (!WD || !ch) return null;
        WD.ensure(ch);
        return { owned: Object.keys(ch.wardrobe.owned), worn: WD.wornId(ch), season: WD.seasonOf(Date.now()),
          festActive: (WD.festivalAt(Date.now()) || {}).festId || null };
      },
      wardrobeBuy: function (id) { var r = WD ? WD.buyCostume(ch, id, Date.now()) : null; if (r && r.ok) { updateHUD(); saveGame(); } return r; },
      wardrobeWear: function (id) { var r = WD ? WD.wearCostume(ch, id) : null; if (r && r.ok) saveGame(); return r; },
      festQuest: function () { return WD ? { avail: WD.availableFestQuestId(qs, ch, Date.now()), active: WD.activeFestQuestId(qs) } : null; },
      festTurnIn: function () { return turnInFestQuest(); },
      wardrobeRows: function () { renderWardrobePanel(); var b = $('wardrobeBody'); return b ? b.children.length : -1; },
      alchemy: function () {
        if (!ALCH || !ch) return null;
        return { learned: ALCH.learnedList(ch), buffs: ALCH.activeBuffs(ch), poison: ch.poison || null };
      },
      alchemyTeachBasics: function () { return ALCH ? ALCH.teachBasics(ch) : []; },
      alchemyBrew: function (id) {
        if (!ALCH) return null;
        var r = ALCH.brew(ch, id);
        if (r.ok) { if (BX) BX.notePill(flags, id); L.recordEvent(qs, ch, { type: 'brew', target: id }); renderQuestPanel(); }
        updateHUD(); saveGame();
        return r;
      },
      alchemyPanelRows: function () { renderAlchemyPanel(); var b = $('alchemyList'); return b ? b.children.length : -1; },
      cult: function () { return cultInfo(); },
      cultPlace: function () { return currentPlace(); },
      cultPanelRows: function () { renderCultPanel(); var b = $('cultBody'); return b ? b.children.length : -1; },
      cultAttempt: function () { return (RM && RM.handles(ch)) ? RM.doBreakthrough(ch, qs, { place: currentPlace() }) : L.doBreakthrough(ch, qs, { place: currentPlace() }); },
      // LÔI KIẾP (js/realms.js): kiểm thử chương trình hoá sự kiện độ kiếp.
      realms: function () { return RM || null; },
      tribStart: function () {
        var info = cultInfo();
        if (!info || info.kind !== 'cross' || !info.canAttempt) return info;
        startTribulationFlow();
        return { started: true, tribulation: ch.tribulation, run: tribRun };
      },
      tribTick: function (dt, pxO, pyO) {
        if (pxO != null) px = pxO;
        if (pyO != null) py = pyO;
        var steps = Math.max(1, Math.round((dt || 0.1) / 0.05));
        for (var i = 0; i < steps; i++) updateTribulation(0.05);
        return { run: tribRun, hp: ch ? ch.hp : 0, tribulation: ch ? ch.tribulation : null, tier: ch ? ch.tier : 0, realm: ch ? ch.realm : '' };
      },
      tribState: function () { return { run: tribRun, tribulation: ch ? ch.tribulation : null }; },
      bosses: function () {
        if (!BOS) return null;
        return BOS.list().map(function (d) {
          var st = BOS.stateOf(d, flags, qs, Date.now());
          return { id: d.id, mode: st.mode, available: st.available, respawnAt: st.respawnAt, deathAt: st.deathAt,
            aliveHere: monsters.some(function (mm) { return mm.worldBoss === d.id && mm.hp > 0; }) };
        });
      },
      setBossDeath: function (id, ts) { if (!BOS) return; BOS.ensureState(flags); if (ts == null) delete flags.bossKills[id]; else flags.bossKills[id] = ts; loadMapEntities(); },
      bossCheck: function () { checkWorldBosses(); },
      bossPanelRows: function () { renderBossPanel(); var b = $('bossList'); return b ? b.children.length : -1; },
      bossBanner: function () { var b = $('bossBanner'); if (!b) return null; var txt = b.textContent || ''; var kids = b.children || []; for (var i = 0; i < kids.length; i++) { if ((kids[i].className || '') === 'strip-text') { txt = kids[i].textContent; break; } } return { display: b.style.display, text: txt }; },
      bossMonsters: function () { return monsters.filter(function (mm) { return mm.worldBoss; }).map(function (mm) { return { id: mm.worldBoss, x: Math.round(mm.x * 10) / 10, y: Math.round(mm.y * 10) / 10, hp: Math.round(mm.hp), maxHp: mm.maxHp, sx: mm.sx, sy: mm.sy }; }); },
      hurtBoss: function (id, dmg) { var mm = monsters.filter(function (o) { return o.worldBoss === id; })[0]; if (mm) { mm.hp -= dmg; mm.hitT = 0.3; } return mm ? Math.round(mm.hp) : null; },
      killBossNow: function (id) { var mm = monsters.filter(function (o) { return o.worldBoss === id; })[0]; if (mm) killMonsterBySkill(mm); return !!mm; },
      realms: function () {
        if (!SR) return null;
        var now = Date.now();
        return {
          status: SR.status(flags, now),
          run: flags.sr ? flags.sr.run : null,
          offer: flags.sr ? flags.sr.fateOffer : null,
          gateOpen: SR.status(flags, now).open,
          nearGate: nearRealmGate(),
          poolSize: SR.POOL ? SR.POOL.length : 0,
          openRealmId: SR.openRealm ? (SR.openRealm(now) ? SR.openRealm(now).id : null) : null,
          rotation: SR.rotationStatus ? SR.rotationStatus(flags, now) : null
        };
      },
      realmStatusAt: function (ts) { return SR ? SR.status(flags, ts) : null; },
      realmEnterAt: function (ts) { return enterScheduledRealm(ts); },
      realmTickAt: function (ts) { srTickLast = 0; tickRealms(ts); },
      realmExit: function () { return exitRealm('test exit'); },
      realmKillAll: function () {
        var n = 0;
        monsters.slice().forEach(function (m) { if (m.hp > 0 && !m.dying) { killMonsterBySkill(m); n++; } });
        return n;
      },
      realmMonsters: function () {
        return monsters.map(function (m) { return { type: m.type, name: m.name, hp: m.hp, boss: !!m.boss, realmBoss: !!m.realmBoss, realmGuard: !!m.realmGuard }; });
      },
      fateTrigger: function (kind) { return maybeRollFate(kind || 'kill', function () { return 0; }); },
      fateAccept: function () { return acceptFateOffer(Date.now()); },
      fateSkip: function () { if (SR) SR.declineFate(flags); var el = $('panelFate'); if (el) el.style.display = 'none'; },
      fatePanelShown: function () { var el = $('panelFate'); return !!el && el.style.display === 'block'; },
      fateChoice: function (id) { return chooseFateChoice(id); },
      fateChoicePanelShown: function () { var el = $('panelFateChoice'); return !!el && el.style.display === 'block'; },
      fateChoiceButtons: function () { var el = $('fateChoiceBtns'); return el ? el.children.length : -1; },
      // QA 19:01 (lượt 19:35): móc bấm nút lựa chọn theo vị trí (0..n-2
      // là lựa chọn thật, nút cuối là "Để sau") + tên map HUD + hình ma
      // tu Thiên 5 — phục vụ test hồi quy panel kỳ ngộ/HUD/Thiên 5.
      fateChoiceClick: function (i) { var el = $('fateChoiceBtns'); var b = el && el.children[i]; if (!b) return false; if (b.click) b.click(); else if (b.dispatch) b.dispatch('click', {}); return true; },
      // --- Lượt bổ sung 20:11–20:26 (thu nhỏ/tỷ lệ/HUD/Menu/nhân vật/
      // giftcode/đầu phiên/vũ khí): móc kiểm thử cho test-smoke.
      minSys: function () {
        return {
          list: MIN_PANELS.map(function (d) { return d.id; }),
          isMin: function (id) { return !!minState[id]; },
          minimize: function (id) { return minimizePanel(id); },
          restore: function (id) { return restoreMinPanel(id); },
          chips: function () { var t = $('chipTray'); return t ? t.children.map(function (c) { return c.textContent; }) : []; },
          hasMinBtn: function (id) { var el = $(id); return !!(el && el.querySelector('.min-btn')); },
          tick: function () { minTickLast = 0; tickMinPanels(); }
        };
      },
      // Móc kiểm thử strip thông báo sự kiện (lượt sửa lỗi Bui 31/10:
      // banner khe nứt không thu nhỏ/đóng được).
      stripSys: function () {
        return {
          ids: STRIP_ORDER.slice(),
          isStrip: function (id) { var d = minDef(id); return !!(d && d.strip); },
          wanted: function (id) { return stripWanted(id); },
          key: function (id) { return stripKey(id); },
          dismissKey: function (id) { return stripDismissKey[id] || null; },
          closeX: function (id) { closePanelX(id); },
          hasXBtn: function (id) { var el = $(id); return !!(el && el.querySelector('.x-btn')); },
          disp: function (id) { var el = $(id); return el ? el.style.display : null; },
          top: function (id) { var el = $(id); return el ? (el.style.top || '') : null; },
          text: function (id) { var el = $(id); if (!el) return null; var kids = el.children || []; for (var i = 0; i < kids.length; i++) { if ((kids[i].className || '') === 'strip-text') return kids[i].textContent; } return el.querySelector ? (function () { var sp = el.querySelector('.strip-text'); return sp ? sp.textContent : null; })() : null; },
          wevTick: function () { updateWevTimer(); },
          bossSay: function (m) { bossAnnounce(m); },
          layout: function () { layoutStrips(); }
        };
      },
      toastLog: function () { var l = $('log'); return l ? l.children.map(function (c) { return c.textContent; }) : []; },
      toast: function (m) { toast(m); },
      tracker: function () {
        return {
          text: function () { return trackerText(); },
          quest: function () { var t = trackedQuest(); return t ? { id: t.id, def: t.def, st: t.st } : null; },
          tick: function () { trackerTickLast = 0; tickTracker(); },
          shown: function () { var e = $('qtText'); return e ? e.textContent : null; },
          guideOn: function () { return guideOn; },
          toggleGuide: function () { return toggleGuide(); }
        };
      },
      ticker: function () {
        return {
          items: function () { return tickerData(); },
          tick: function () { tickTicker(); },
          visible: function () { var e = $('liveTicker'); return !!e && e.style.display === 'block'; },
          text: function () { var e = $('liveTicker'); return e ? e.textContent : null; }
        };
      },
      welcome: function () {
        return {
          shown: function () { var e = $('panelWelcome'); return !!e && e.style.display === 'block'; },
          tick: function () { welcomeTickLast = 0; tickWelcome(); }
        };
      },
      ach: function () {
        return {
          list: function () { return ACH ? ACH.list(flags) : []; },
          tick: function () { achTickLast = 0; tickAch(); },
          toastShown: function () { var e = $('achToast'); return !!e && e.style.display === 'block'; }
        };
      },
      charPanel: function () {
        return {
          open: function () { openCharacterPanel(); var e = $('panelCharacter'); return !!e && e.style.display === 'block'; },
          html: function () { var e = $('charBody'); return e ? e.innerHTML : ''; },
          render: function () { renderCharacterPanel(); }
        };
      },
      giftRedeem: function (code) { return redeemGiftCode(code); },
      hudClick: function () { var h = $('hud'); if (h && h.click) h.click(); var e = $('panelCharacter'); return !!e && e.style.display === 'block'; },
      openCompare: function (kind, uid) { openCompare(kind, uid); var e = $('panelCompare'); return !!e && e.style.display === 'block'; },
      compareHtml: function () { var e = $('compareBody'); return e ? e.innerHTML : ''; },
      artSetsHtml: function () { renderArtSets(); var e = $('artSets'); return e ? e.innerHTML : ''; },
      suggestArtifacts: function (crit) { return suggestArtifacts(crit).map(function (s) { return s.entry.uid; }); },
      exportCard: function () { var cv = buildCharCard(); return { w: cv.width, h: cv.height }; },
      ambientOn: function () { return ambientFxOn(); },
      drawAmbient: function () { drawAmbientFx(1000); return true; },
      stats: function () { return { life: lifetimeStats(), bx: bxTotals() }; },
      titles: function () {
        return TITLES.map(function (t) { var un = false; try { un = !!t.test(); } catch (e) {} return { id: t.id, name: t.name, unlocked: un }; });
      },
      wornTitle: function () { return wornTitleName(); },
      fateChoiceLabels: function () { var el = $('fateChoiceBtns'); return el ? el.children.map(function (c) { return c.textContent; }) : []; },
      hudMap: function () { var e = $('hudMap'); return e ? e.textContent : null; },
      thien5Fig: function () { return thien5Fig; },
      thien5ShowFig: function () { var pt = playerTile(); showThien5Figure(curMapId, pt.x + 2, pt.y); return thien5Fig; },
      realmPanelOpen: function () { openRealmPanel(); var el = $('panelRealms'); return !!el && el.style.display === 'block'; },
      // --- VẾT NỨT HƯ KHÔNG (js/rift-events.js): trạng thái + hành động.
      rift: function () {
        if (!RIFT || !ch) return null;
        var now = Date.now();
        return {
          info: RIFT.cycleInfo(now), panel: RIFT.panelData(flags, ch, qs, now),
          canEnter: RIFT.canEnterRift(flags, ch, now), inRun: RIFT.inRiftRun(flags),
          availQ: RIFT.availableQuestId(ch, flags, qs), activeQ: RIFT.activeQuestId(qs),
          state: flags.rift || null
        };
      },
      riftEnter: function () { return enterRift(Date.now()); },
      riftPanelOpen: function () { openRiftPanel(); var el = $('panelRift'); return !!el && el.style.display === 'block'; },
      riftAccept: function () { return acceptRiftQuest(); },
      riftTurnIn: function () { return turnInRiftQuest(); },
      riftTickAt: function (ts) { riftTickLast = 0; tickRift(ts); },
      // --- NGỰ KIẾM (js/flight.js): trạng thái + hành động cho test/preview.
      flight: function () {
        if (!FLIGHT || !ch) return null;
        return {
          gate: FLIGHT.gateOpen(ch, flags), gateReason: FLIGHT.gateReason(ch, flags),
          unlocked: !!flags.swordFlight, flying: flying, lift: Math.round(flyLift * 10) / 10,
          canFly: canFlyNow(), availQ: FLIGHT.availableQuestId(ch, flags, qs),
          activeQ: FLIGHT.activeQuestId(qs),
          giver: FLIGHT.giverNpcId(flags), giverName: FLIGHT.giverName(flags),
          forgedUid: flags.flight ? flags.flight.forgedUid : null,
          trial: flyTrial ? { next: flyTrial.next, left: Math.round(flyTrial.timeLeft) } : null,
          duel: (function () { var m = duelMonster(); return m ? { name: m.name, hp: Math.round(m.hp), maxHp: m.maxHp, x: m.x, y: m.y } : null; })(),
          checkpoints: FLIGHT.CHECKPOINTS.map(function (c) { return { x: c.x, y: c.y, name: c.name }; })
        };
      },
      flyToggle: function () { toggleFlight(); return flying; },
      // MỤC 27 (js/flight2.js): trạng thái + hành động kiểu bay cho test.
      flight2: function () {
        if (!FLIGHT2 || !ch) return null;
        var c2 = flyCtx();
        return {
          mode: flyMode, modes: FLIGHT2.MODES.map(function (m) { return m.id; }),
          unlocked: FLIGHT2.unlockedModes(c2),
          canFly: { sword: FLIGHT2.canFlyMode('sword', c2), artifact: FLIGHT2.canFlyMode('artifact', c2), pet: FLIGHT2.canFlyMode('pet', c2) },
          reason: { sword: FLIGHT2.modeReason('sword', c2), artifact: FLIGHT2.modeReason('artifact', c2), pet: FLIGHT2.modeReason('pet', c2) },
          flyableArtifact: c2.flyableArtifact ? c2.flyableArtifact.id : null,
          activePet: c2.activePetSpecies ? c2.activePetSpecies.id : null,
          flying: flying
        };
      },
      flyModeSet: function (m) { return setFlyMode(m); },
      flyModeCycle: function () { return cycleFlyMode(); },
      flyTakeoff: function () { return tryTakeoff(); },
      flyLand: function () { return landPlayer(false); },
      flyLandForce: function () { return landPlayer(true); },
      flyCollide: function (x, y) { return collideFlyAt(x, y); },
      groundCollide: function (x, y) { return collideAt(x, y); },
      flyAccept: function () { return acceptFlightQuest(); },
      sectArcAccept: function () { return acceptSectArcQuest(); },
      sectArcTurnIn: function () { return turnInSectArcQuest(); },
      sectArcInfo: function () { return SECTARC ? { avail: SECTARC.availableQuestId(ch, flags, qs), active: SECTARC.activeQuestId(qs), rep: SECTARC.repOf(flags) } : null; },
      flyTurnIn: function () { return turnInFlightQuest(); },
      flyForge: function () { return doFlyForge(); },
      flyStartDuel: function () { return startFlyDuel(); },
      flyKillDuel: function () { var m = duelMonster(); if (m) killMonsterBySkill(m); return !!m; },
      flyStartTrial: function () { return startFlyTrial(); }
    };
  }
  showScreen('screen-register');
})();
