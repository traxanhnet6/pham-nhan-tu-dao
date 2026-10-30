// Phàm Nhân Tu Đạo — ĐIỀU KHIỂN & BỐ CỤC MÀN HÌNH (js/controls.js).
// Lệnh của Bui (07:11 ngày 2026-10-30): thiết kế + cài đặt nút di chuyển /
// nút skill cho PC, điện thoại (cảm ứng) và TAY CẦM; tối ưu riêng màn hình
// DỌC và NGANG; zoom map to/nhỏ được.
//
// Kiến trúc: module này sở hữu TOÀN BỘ logic điều khiển mới (gán phím PC,
// joystick/D-pad ảo, Gamepad API, layout dọc/ngang, zoom camera) và chỉ
// móc vào js/game.js ở 6 điểm nhỏ, có đánh dấu "Móc controls":
//   1) keydown: PNT_CONTROLS.swallowKey(k) — nuốt phím mặc định đã bị gán
//      lại chỗ khác (mặc định không gán lại -> nuốt = false, hành vi cũ
//      giữ nguyên 100%).
//   2) readMoveVector: cộng PNT_CONTROLS.moveVec() (joystick + D-pad ảo +
//      tay cầm + phím gán riêng) rồi chuẩn hoá — không nhân đôi tốc độ.
//   3) Camera (snapCamera/updateCamera) dùng effVW()/effVH() = khung nhìn
//      hiệu dụng theo zoom; toạ độ THẾ GIỚI không đổi, va chạm không đổi.
//   4) draw(): biến cục bộ VIEW_W/VIEW_H = khung hiệu dụng + loop bọc
//      ctx.scale(zoom) quanh draw() — chỉ camera, không phá smooth.js.
//   5) Click map: chia toạ độ màn hình cho zoom khi đổi ra thế giới.
//   6) window.PNT_HOOKS (game.js xuất ra): attack/interact/meditate/fly/
//      bar/art/padSkill/toast/account — controls chỉ GỌI, không tự chế.
// Cài đặt lưu theo tài khoản ở localStorage 'pnt-ctrl-<username>' (+ khóa
// chung dự phòng 'pnt-ctrl-settings') — đúng mẫu 'pnt-gfx-<tk>' có sẵn.
// Node-safe: toàn bộ logic thuần (gán phím, vector, layout, zoom, lưu trữ)
// không chạm DOM/navigator; phần trình duyệt đều có guard.
(function () {
  'use strict';

  /* ================= HẰNG SỐ + LOGIC THUẦN ================= */

  var ZOOM_MIN = 0.6, ZOOM_MAX = 2.0;

  // Các hành động gán được phím PC. 'move' = 4 hướng; còn lại là hành động
  // bấm (fire). Mặc định PHẢI y hệt phím cứng hiện tại trong game.js.
  var KEY_ACTIONS = [
    { id: 'up', label: 'Đi lên', move: true },
    { id: 'down', label: 'Đi xuống', move: true },
    { id: 'left', label: 'Đi trái', move: true },
    { id: 'right', label: 'Đi phải', move: true },
    { id: 'attack', label: 'Đánh thường' },
    { id: 'interact', label: 'Tương tác' },
    { id: 'meditate', label: 'Thổ nạp' },
    { id: 'fly', label: 'Ngự kiếm (bay)' },
    { id: 'skill1', label: 'Chiêu 1 (Kiếm Khí Trảm)' },
    { id: 'skill2', label: 'Chiêu 2 (Toàn Phong Kiếm)' },
    { id: 'skill3', label: 'Chiêu 3 (Thiên Căn Thần Thông)' },
    { id: 'skill4', label: 'Chiêu 4 (Lưu Tinh Đột)' },
    { id: 'skill5', label: 'Chiêu 5 (Ngự Kiếm Thuật)' },
    { id: 'art1', label: 'Pháp bảo 1' },
    { id: 'art2', label: 'Pháp bảo 2' }
  ];
  var DEFAULT_KEYS = {
    up: ['w', 'arrowup'], down: ['s', 'arrowdown'],
    left: ['a', 'arrowleft'], right: ['d', 'arrowright'],
    attack: [' '], interact: ['e'], meditate: ['t'], fly: ['f'],
    skill1: ['1'], skill2: ['2'], skill3: ['3'], skill4: ['4'], skill5: ['5'],
    art1: ['6'], art2: ['7']
  };
  var MOVE_IDS = ['up', 'down', 'left', 'right'];
  // Hành động "bấm" map sang PNT_HOOKS: skillN -> bar(N), artN -> art(N-1).
  var FIRE_TO_HOOK = {
    attack: ['attack'], interact: ['interact'], meditate: ['meditate'], fly: ['fly'],
    skill1: ['bar', 1], skill2: ['bar', 2], skill3: ['bar', 3], skill4: ['bar', 4], skill5: ['bar', 5],
    art1: ['art', 0], art2: ['art', 1]
  };

  function cloneKeys(src) {
    var o = {};
    for (var id in DEFAULT_KEYS) {
      var v = (src && src[id]) || DEFAULT_KEYS[id];
      o[id] = v.slice();
    }
    return o;
  }
  function sameKeySet(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) < 0) return false;
    return true;
  }
  function isValidKeyList(v) {
    if (!Array.isArray(v) || !v.length || v.length > 4) return false;
    for (var i = 0; i < v.length; i++)
      if (typeof v[i] !== 'string' || !v[i] || v[i].length > 20) return false;
    return true;
  }
  // Chuẩn hoá bản đồ phím: thiếu/không hợp lệ -> mặc định của hành động đó.
  function normalizeKeys(raw) {
    var o = {};
    for (var id in DEFAULT_KEYS) {
      var v = raw && raw[id];
      o[id] = isValidKeyList(v) ? v.slice() : DEFAULT_KEYS[id].slice();
    }
    return o;
  }
  function isCustomized(keys) {
    var k = normalizeKeys(keys);
    for (var id in DEFAULT_KEYS) if (!sameKeySet(k[id], DEFAULT_KEYS[id])) return true;
    return false;
  }
  // Gán lại 1 phím: phím mới thành phím chính; giữ lại các phím mũi tên phụ
  // của chính hành động đó; gỡ phím mới khỏi mọi hành động khác (trừ mũi
  // tên dùng chung cho di chuyển thì không gỡ chéo giữa 4 hướng).
  function remapKey(keys, action, newKey) {
    var k = normalizeKeys(keys);
    if (!k[action] || typeof newKey !== 'string' || !newKey) return k;
    newKey = newKey.toLowerCase();
    var keep = k[action].filter(function (x) { return x.indexOf('arrow') === 0 && x !== newKey; });
    k[action] = [newKey].concat(keep);
    for (var id in k) {
      if (id === action) continue;
      k[id] = k[id].filter(function (x) { return x !== newKey || x.indexOf('arrow') === 0; });
      if (!k[id].length) k[id] = DEFAULT_KEYS[id].slice();
    }
    return k;
  }
  function keyLabel(k) {
    if (k === ' ') return 'Space';
    if (k === 'arrowup') return '↑';
    if (k === 'arrowdown') return '↓';
    if (k === 'arrowleft') return '←';
    if (k === 'arrowright') return '→';
    if (k && k.length === 1) return k.toUpperCase();
    return k || '';
  }
  function keysLabel(keys, action) {
    var k = normalizeKeys(keys);
    return (k[action] || []).map(keyLabel).join(' / ');
  }
  // game.js hỏi trước khi xử lý phím cứng: true = phím này thuộc về
  // controls (đã gán lại / đang chờ gán) — game.js bỏ qua, controls tự lo.
  // Chưa gán lại gì -> luôn false (hành vi cũ nguyên vẹn).
  function keySwallowed(keys, key, capturing) {
    if (capturing) return true;
    var k = normalizeKeys(keys);
    if (!isCustomized(k)) return false;
    for (var id in DEFAULT_KEYS) {
      if (sameKeySet(k[id], DEFAULT_KEYS[id])) continue; // hành động chưa đổi
      if (k[id].indexOf(key) >= 0) return true;          // phím mới của nó
      if (DEFAULT_KEYS[id].indexOf(key) >= 0) return true; // phím cũ mồ côi
    }
    return false;
  }
  // Vector từ tập phím đang giữ + bản đồ phím (chỉ tính 4 hướng).
  function keyboardVector(held, keys) {
    var k = normalizeKeys(keys);
    function on(act) {
      var list = k[act] || [];
      for (var i = 0; i < list.length; i++) if (held && held[list[i]]) return true;
      return false;
    }
    var dx = (on('right') ? 1 : 0) - (on('left') ? 1 : 0);
    var dy = (on('down') ? 1 : 0) - (on('up') ? 1 : 0);
    var l = Math.sqrt(dx * dx + dy * dy);
    if (l > 1) { dx /= l; dy /= l; }
    return { x: dx, y: dy };
  }
  // Cộng dồn vector nhiều nguồn rồi kẹp độ dài <= 1: không nhân đôi tốc độ.
  function combineVec(list) {
    var x = 0, y = 0;
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v) { x += v.x || 0; y += v.y || 0; }
    }
    var l = Math.sqrt(x * x + y * y);
    if (l > 1) { x /= l; y /= l; }
    return { x: x, y: y };
  }
  function dpadVector(held) {
    held = held || {};
    var dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    var dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    var l = Math.sqrt(dx * dx + dy * dy);
    if (l > 1) { dx /= l; dy /= l; }
    return { x: dx, y: dy };
  }

  /* ---------- Tay cầm: logic thuần (chuẩn W3C như gamepad.js của game cũ) ---------- */
  var PAD_DEADZONE = 0.15;
  var PAD_ACTIONS = [
    { id: 'attack', label: 'Đánh thường' },
    { id: 'skill1', label: 'Chiêu nhóm — ô 1' },
    { id: 'skill2', label: 'Chiêu nhóm — ô 2' },
    { id: 'skill3', label: 'Chiêu nhóm — ô 3' },
    { id: 'pagePrev', label: 'Nhóm chiêu trước' },
    { id: 'pageNext', label: 'Nhóm chiêu sau' },
    { id: 'dash', label: 'Lướt (Lưu Tinh Đột)' },
    { id: 'interact', label: 'Tương tác' },
    { id: 'menu', label: 'Menu cài đặt' },
    { id: 'bag', label: 'Túi đồ' }
  ];
  var DEFAULT_PAD_MAP = {
    attack: 0, skill1: 2, skill2: 3, skill3: 1,
    pagePrev: 4, pageNext: 5, dash: 7, interact: 6, menu: 9, bag: 8
  };
  var BTN_NAMES = {
    0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT',
    8: 'Select', 9: 'Start', 10: 'L3', 11: 'R3',
    12: 'D-pad ↑', 13: 'D-pad ↓', 14: 'D-pad ←', 15: 'D-pad →'
  };
  function padBtnName(i) { return BTN_NAMES[i] != null ? BTN_NAMES[i] : ('Nút ' + i); }
  function isValidPadMap(m) {
    if (!m || typeof m !== 'object') return false;
    for (var i = 0; i < PAD_ACTIONS.length; i++) {
      var v = m[PAD_ACTIONS[i].id];
      if (typeof v !== 'number' || v < 0 || v > 31) return false;
    }
    return true;
  }
  function normalizePadMap(raw) {
    return isValidPadMap(raw) ? JSON.parse(JSON.stringify(raw)) : JSON.parse(JSON.stringify(DEFAULT_PAD_MAP));
  }
  function axesVec(ax, ay) {
    ax = +ax || 0; ay = +ay || 0;
    var l = Math.sqrt(ax * ax + ay * ay);
    if (l < PAD_DEADZONE) return { x: 0, y: 0 };
    var s = Math.min(1, (l - PAD_DEADZONE) / (1 - PAD_DEADZONE)) / (l || 1);
    return { x: ax * s, y: ay * s };
  }
  // 3 nhóm chiêu cho X/Y/B; LB/RB chuyển nhóm. bar = chỉ số SK.BAR của
  // game.js (BAR[1..5] là 5 chiêu chính), art = ô pháp bảo, util = hỗ trợ.
  var PAD_PAGES = [
    [{ kind: 'bar', index: 1 }, { kind: 'bar', index: 2 }, { kind: 'bar', index: 3 }],
    [{ kind: 'bar', index: 4 }, { kind: 'bar', index: 5 }, { kind: 'art', index: 0 }],
    [{ kind: 'art', index: 1 }, { kind: 'util', id: 'meditate' }, { kind: 'util', id: 'fly' }]
  ];
  var PAD_PAGE_NAMES = ['Chiêu 1–3', 'Chiêu 4–5 + Pháp bảo 1', 'Pháp bảo 2 + Hỗ trợ'];
  function padSkillDesc(page, slot) {
    var p = PAD_PAGES[((page % PAD_PAGES.length) + PAD_PAGES.length) % PAD_PAGES.length];
    var d = p[slot];
    return d ? JSON.parse(JSON.stringify(d)) : null;
  }

  /* ---------- Bố cục dọc / ngang ----------
   * Toạ độ theo TỈ LỆ của hộp khung game (#gameWrap): x, y = tâm phần tử
   * theo bề ngang/dọc của hộp; d = đường kính theo bề NHỎ hơn của hộp.
   * Cùng một bảng số này lái cả CSS thực tế (JS đặt px theo tỉ lệ) lẫn
   * ảnh xem trước — sửa 1 chỗ, cả hai cùng đổi. */
  var LAYOUTS = {
    landscape: {
      label: 'Màn hình NGANG',
      joy: { x: 0.085, y: 0.76, d: 0.34 },
      dpad: { x: 0.085, y: 0.76, d: 0.34 },
      // Vòng cung nút chiêu quanh góc dưới-phải: Đánh to nhất ở tâm cung.
      skills: [
        { id: 'attack', x: 0.918, y: 0.76, d: 0.185 },
        { id: 'skill1', x: 0.838, y: 0.635, d: 0.125 },
        { id: 'skill2', x: 0.762, y: 0.755, d: 0.125 },
        { id: 'skill3', x: 0.838, y: 0.885, d: 0.125 },
        { id: 'skill4', x: 0.925, y: 0.545, d: 0.115 },
        { id: 'skill5', x: 0.945, y: 0.62, d: 0.115 },
        { id: 'interact', x: 0.945, y: 0.885, d: 0.115 }
      ],
      zoomIn: { x: 0.955, y: 0.335, d: 0.095 },
      zoomOut: { x: 0.955, y: 0.455, d: 0.095 },
      zoomReset: { x: 0.955, y: 0.575, d: 0.095 },
      hudSlot: { x: 0.89, y: 0.14, d: 0.26 }, // ô chừa HUD phụ góc trên-phải (minimap khi có)
      padHint: { x: 0.5, y: 0.035 }
    },
    portrait: {
      label: 'Màn hình DỌC',
      // Hàng điều khiển dồn ở khoang dưới (deck) của khung dọc.
      joy: { x: 0.16, y: 0.885, d: 0.30 },
      dpad: { x: 0.16, y: 0.885, d: 0.30 },
      skills: [
        { id: 'attack', x: 0.845, y: 0.885, d: 0.165 },
        { id: 'skill1', x: 0.685, y: 0.815, d: 0.11 },
        { id: 'skill2', x: 0.655, y: 0.93, d: 0.11 },
        { id: 'skill3', x: 0.845, y: 0.755, d: 0.11 },
        { id: 'skill4', x: 0.94, y: 0.795, d: 0.105 },
        { id: 'skill5', x: 0.94, y: 0.945, d: 0.105 },
        { id: 'interact', x: 0.72, y: 0.755, d: 0.105 }
      ],
      zoomIn: { x: 0.945, y: 0.075, d: 0.085 },
      zoomOut: { x: 0.945, y: 0.165, d: 0.085 },
      zoomReset: { x: 0.945, y: 0.255, d: 0.085 },
      hudSlot: { x: 0.135, y: 0.07, d: 0.24 }, // ô chừa HUD phụ góc trên-trái (minimap nhỏ)
      padHint: { x: 0.5, y: 0.03 }
    }
  };
  // orient: 'auto' | 'ngang' | 'doc' | 'full' (full -> ngang)
  function pickLayout(w, h, orient) {
    if (orient === 'ngang' || orient === 'full') return 'landscape';
    if (orient === 'doc') return 'portrait';
    return (w >= h) ? 'landscape' : 'portrait';
  }

  /* ---------- Zoom ---------- */
  function clampZoom(z) {
    z = +z;
    if (!(z > 0) || isNaN(z)) return 1;
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  }
  function stepZoom(z, dir) {
    var nz = clampZoom(clampZoom(z) * (dir > 0 ? 1.25 : 1 / 1.25));
    if (nz > 0.94 && nz < 1.06) nz = 1; // hít về 100% khi đi ngang qua
    return Math.round(nz * 1000) / 1000;
  }
  function pinchZoom(z0, dStart, dNow) {
    if (!(dStart > 0)) return clampZoom(z0);
    return clampZoom(z0 * (dNow / dStart));
  }

  /* ---------- Cài đặt: mặc định / chuẩn hoá / lưu trữ ---------- */
  function defaultSettings() {
    return {
      keys: cloneKeys(null),
      pad: { enabled: true, map: null },
      touch: { show: 'auto', mode: 'joystick', float: true, size: 1, opacity: 0.85 },
      view: { orient: 'auto', zoom: 1 }
    };
  }
  function clampNum(v, a, b, dft) {
    v = +v;
    if (isNaN(v)) return dft;
    return Math.min(b, Math.max(a, v));
  }
  function normalizeSettings(raw) {
    var s = defaultSettings();
    if (!raw || typeof raw !== 'object') return s;
    s.keys = normalizeKeys(raw.keys);
    if (raw.pad && typeof raw.pad === 'object') {
      s.pad.enabled = raw.pad.enabled !== false;
      s.pad.map = isValidPadMap(raw.pad.map) ? normalizePadMap(raw.pad.map) : null;
    }
    if (raw.touch && typeof raw.touch === 'object') {
      if (['auto', 'on', 'off'].indexOf(raw.touch.show) >= 0) s.touch.show = raw.touch.show;
      if (['joystick', 'dpad'].indexOf(raw.touch.mode) >= 0) s.touch.mode = raw.touch.mode;
      s.touch.float = raw.touch.float !== false;
      s.touch.size = clampNum(raw.touch.size, 0.8, 1.4, 1);
      s.touch.opacity = clampNum(raw.touch.opacity, 0.35, 1, 0.85);
    }
    if (raw.view && typeof raw.view === 'object') {
      if (['auto', 'ngang', 'doc', 'full'].indexOf(raw.view.orient) >= 0) s.view.orient = raw.view.orient;
      s.view.zoom = clampZoom(raw.view.zoom == null ? 1 : raw.view.zoom);
    }
    return s;
  }
  function storageKey(account) { return 'pnt-ctrl-' + (account || ''); }
  var SHARED_KEY = 'pnt-ctrl-settings';
  // store: { getItem, setItem } — inject được để test bằng node.
  function loadSettings(store, account) {
    var raw = null;
    try {
      raw = store && store.getItem ? store.getItem(storageKey(account)) : null;
      if (!raw && store && store.getItem) raw = store.getItem(SHARED_KEY);
    } catch (e) { raw = null; }
    if (!raw) return defaultSettings();
    try { return normalizeSettings(JSON.parse(raw)); } catch (e) { return defaultSettings(); }
  }
  function saveSettings(store, settings, account) {
    var s = normalizeSettings(settings);
    try {
      if (store && store.setItem) {
        store.setItem(storageKey(account), JSON.stringify(s));
        store.setItem(SHARED_KEY, JSON.stringify(s));
      }
    } catch (e) {}
    return s;
  }
  function resetGroup(settings, group) {
    var s = normalizeSettings(settings);
    var d = defaultSettings();
    if (group === 'keys') s.keys = d.keys;
    else if (group === 'pad') s.pad = d.pad;
    else if (group === 'touch') s.touch = d.touch;
    else if (group === 'view') s.view = d.view;
    return s;
  }

  /* ================= TRẠNG THÁI RUNTIME ================= */
  var settings = defaultSettings();
  var account = null;
  var heldKeys = {};        // phím di chuyển gán-riêng đang giữ
  var joyVec = { x: 0, y: 0 };
  var dpadHeld = {};
  var padVec = { x: 0, y: 0 };
  var capturing = null;     // action PC đang chờ bấm phím để gán
  var padPage = 0;

  function moveVec() {
    var customMove = MOVE_IDS.some(function (id) {
      return !sameKeySet(normalizeKeys(settings.keys)[id], DEFAULT_KEYS[id]);
    });
    var kv = customMove ? keyboardVector(heldKeys, settings.keys) : { x: 0, y: 0 };
    return combineVec([kv, joyVec, dpadVector(dpadHeld), padVec]);
  }
  function zoom() { return clampZoom(settings.view.zoom); }
  function swallowKey(key) { return keySwallowed(settings.keys, key, capturing); }

  /* ================= PHẦN TRÌNH DUYỆT ================= */
  var H = null; // PNT_HOOKS của game.js (nạp sau controls.js vẫn bắt được vì đọc tại thời điểm dùng)
  function hooks() {
    if (typeof window !== 'undefined' && window.PNT_HOOKS) H = window.PNT_HOOKS;
    return H;
  }
  function toast(msg) {
    var h = hooks();
    if (h && h.toast) { h.toast(msg); return; }
    try {
      var el = document.getElementById('ctlToast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ctlToast';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.display = 'block';
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.style.display = 'none'; }, 2200);
    } catch (e) {}
  }
  function fireHook(desc) {
    var h = hooks();
    if (!h) return;
    try {
      if (desc[0] === 'bar') h.bar(desc[1]);
      else if (desc[0] === 'art') h.art(desc[1]);
      else if (h[desc[0]]) h[desc[0]]();
    } catch (e) {}
  }
  function fireAction(actionId) {
    var d = FIRE_TO_HOOK[actionId];
    if (d) fireHook(d);
  }
  function store() {
    try { return (typeof localStorage !== 'undefined') ? localStorage : null; } catch (e) { return null; }
  }
  function persist() {
    settings = saveSettings(store(), settings, account);
    applyAll();
  }
  function currentAccount() {
    var h = hooks();
    try { return h && h.account ? h.account() : null; } catch (e) { return null; }
  }

  /* ---------- CSS (tiêm 1 lần) ---------- */
  var CSS = [
    '#ctlOverlay{position:absolute;inset:0;pointer-events:none;z-index:8;display:none}',
    '#ctlOverlay.on{display:block}',
    '#ctlOverlay .ctl-el{position:absolute;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none}',
    '#ctlJoyZone{left:0;bottom:0;width:46%;height:58%;pointer-events:auto;touch-action:none}',
    '#ctlJoy{border:2px solid rgba(245,238,218,.55);background:rgba(26,20,14,.38);border-radius:50%;display:none}',
    '#ctlJoyKnob{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;background:rgba(245,238,218,.5);border:2px solid rgba(26,20,14,.5);border-radius:50%}',
    '#ctlDpad{display:none}',
    '#ctlDpad .dpb{position:absolute;background:rgba(26,20,14,.5);color:#f5eeda;border:2px solid rgba(245,238,218,.55);border-radius:10px;font-weight:bold;display:flex;align-items:center;justify-content:center}',
    '#ctlDpad .dpb.on{background:rgba(122,59,34,.75)}',
    '.ctl-skill{background:rgba(26,20,14,.55);color:#f5eeda;border:2px solid #c9a227;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.1;padding:2px}',
    '.ctl-skill .sn{font-weight:bold;pointer-events:none}',
    '.ctl-skill .sk{color:#ffd94a;pointer-events:none}',
    '.ctl-skill.on{background:rgba(122,59,34,.8)}',
    '.ctl-skill.big{border-color:#ffd94a;background:rgba(64,32,16,.65)}',
    '#ctlZoom{position:absolute;pointer-events:none}',
    '.ctl-zbtn{position:absolute;pointer-events:auto;background:rgba(26,20,14,.55);color:#f5eeda;border:2px solid rgba(245,238,218,.55);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;touch-action:none;user-select:none;-webkit-user-select:none}',
    '#ctlPadHint{display:none;background:rgba(26,20,14,.72);color:#ffe9a8;border:1px solid #c9a227;border-radius:14px;padding:2px 10px;font-size:12px;white-space:nowrap;transform:translateX(-50%)}',
    '#ctlToast{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:rgba(26,20,14,.92);color:#ffe9a8;border:2px solid #c9a227;border-radius:8px;padding:8px 16px;z-index:99;display:none;font-size:14px}',
    'body.pnt-pt #gameWrap{padding-bottom:200px}',
    'body.pnt-pt #screen-game{max-width:100%}',
    'body.pnt-pt .overlay{top:auto !important;bottom:0;max-height:64%;animation:ctlUp .18s ease-out}',
    '@keyframes ctlUp{from{transform:translateY(16px);opacity:.4}to{transform:none;opacity:1}}',
    'body.pnt-ls #screen-game{max-width:1180px}',
    'body.pnt-ls #gameWrap{width:min(100%,calc((100dvh - 168px)*1.3333));min-width:320px}',
    'body.pnt-ls #hud{gap:8px;padding:6px 10px}',
    'body.pnt-ls #hud .bar{width:110px}',
    'body.pnt-ls #controls button{padding:7px 10px;font-size:13px}',
    '#ctlModal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;z-index:60;overflow-y:auto}',
    '#ctlModal .ctl-panel{max-width:560px;margin:36px auto;background:#f5eeda;color:#2a2016;border:3px solid #8b5a2b;border-radius:10px;padding:18px;box-shadow:0 0 0 3px #3a2a1a}',
    '#ctlModal h3{margin:14px 0 6px;color:#7a3b22}',
    '#ctlModal h3:first-child{margin-top:0}',
    '#ctlModal .row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #e2d5b8;font-size:14px}',
    '#ctlModal .row .nm{flex:1}',
    '#ctlModal .kbtn{min-width:86px;text-align:center}',
    '#ctlModal .kbtn.wait{background:#c0392b}',
    '#ctlModal select,#ctlModal input[type=range]{accent-color:#7a3b22}',
    '#ctlModal .grp-reset{font-size:12px;padding:5px 9px}',
    '#btnControls{background:#2e5d7d}',
    '#btnControls:hover{background:#38708f}'
  ].join('\n');

  /* ---------- DOM overlay ---------- */
  var els = {};
  var layoutName = 'landscape';
  var inGame = false;
  var padConnected = false;
  var padName = '';

  function $(id) { return document.getElementById(id); }
  function mk(tag, id, cls) {
    var e = document.createElement(tag);
    if (id) e.id = id;
    if (cls) e.className = cls;
    return e;
  }
  function skillShortName(id, fallback) {
    try {
      var SK = window.PNT_SKILLS;
      if (SK && SK.SKILLS && SK.SKILLS[id]) return SK.SKILLS[id].name;
      if (SK && SK.BAR) {
        var sid = SK.BAR[+id.replace('skill', '')];
        if (sid && SK.SKILLS && SK.SKILLS[sid]) return SK.SKILLS[sid].name;
      }
    } catch (e) {}
    return fallback;
  }
  function buildOverlay() {
    var wrap = $('gameWrap');
    if (!wrap || $('ctlOverlay')) return;
    var ov = mk('div', 'ctlOverlay');
    var zone = mk('div', 'ctlJoyZone', 'ctl-el');
    var joy = mk('div', 'ctlJoy', 'ctl-el');
    joy.appendChild(mk('div', 'ctlJoyKnob'));
    var dpad = mk('div', 'ctlDpad', 'ctl-el');
    [['up', '↑', 1, 0], ['left', '←', 0, 1], ['right', '→', 2, 1], ['down', '↓', 1, 2]].forEach(function (b) {
      var btn = mk('div', null, 'dpb');
      btn.textContent = b[1];
      btn.setAttribute('data-dir', b[0]);
      btn._gx = b[2]; btn._gy = b[3];
      dpad.appendChild(btn);
    });
    var skills = mk('div', 'ctlSkills');
    var defs = [
      { id: 'attack', big: true, name: 'Đánh', key: 'Space' },
      { id: 'skill1', name: 'Kiếm Khí', key: '1' },
      { id: 'skill2', name: 'Toàn Phong', key: '2' },
      { id: 'skill3', name: 'Thiên Căn', key: '3' },
      { id: 'skill4', name: 'Lưu Tinh', key: '4' },
      { id: 'skill5', name: 'Ngự Kiếm', key: '5' },
      { id: 'interact', name: 'Tương tác', key: 'E' }
    ];
    defs.forEach(function (d) {
      var b = mk('div', null, 'ctl-el ctl-skill' + (d.big ? ' big' : ''));
      b.setAttribute('data-act', d.id);
      var nm = d.name;
      if (d.id.indexOf('skill') === 0) nm = skillShortName(d.id, d.name);
      b.innerHTML = '<span class="sn"></span><span class="sk"></span>';
      b.querySelector('.sn').textContent = nm;
      b.querySelector('.sk').textContent = d.key;
      skills.appendChild(b);
    });
    var zoomBox = mk('div', 'ctlZoom');
    [['zoomIn', '+'], ['zoomOut', '−'], ['zoomReset', '1:1']].forEach(function (z) {
      var zb = mk('div', 'ctl' + z[0][0].toUpperCase() + z[0].slice(1), 'ctl-zbtn');
      zb.textContent = z[1];
      zb.setAttribute('data-zoom', z[0]);
      zoomBox.appendChild(zb);
    });
    var hint = mk('div', 'ctlPadHint', 'ctl-el');
    ov.appendChild(zone); ov.appendChild(joy); ov.appendChild(dpad);
    ov.appendChild(skills); ov.appendChild(zoomBox); ov.appendChild(hint);
    wrap.appendChild(ov);
    els = { ov: ov, zone: zone, joy: joy, knob: joy.firstChild, dpad: dpad, skills: skills, zoomBox: zoomBox, hint: hint };
    bindOverlay();
  }

  /* ---------- Định vị theo LAYOUTS ---------- */
  function place(el, spec, W, H, minDim) {
    var d = spec.d * minDim * settings.touch.size;
    el.style.width = d + 'px';
    el.style.height = d + 'px';
    el.style.left = (spec.x * W - d / 2) + 'px';
    el.style.top = (spec.y * H - d / 2) + 'px';
    el.style.fontSize = Math.max(10, d * 0.16) + 'px';
    var sn = el.querySelector ? el.querySelector('.sn') : null;
    if (sn) sn.style.fontSize = Math.max(9, d * 0.17) + 'px';
    var sk = el.querySelector ? el.querySelector('.sk') : null;
    if (sk) sk.style.fontSize = Math.max(8, d * 0.14) + 'px';
  }
  function applyLayout() {
    var wrap = $('gameWrap');
    if (!wrap || !els.ov) return;
    var orient = settings.view.orient;
    layoutName = pickLayout(window.innerWidth, window.innerHeight, orient);
    document.body.classList.toggle('pnt-pt', layoutName === 'portrait');
    document.body.classList.toggle('pnt-ls', layoutName === 'landscape');
    positionOverlay();
  }
  function positionOverlay() {
    var wrap = $('gameWrap');
    if (!wrap || !els.ov) return;
    var W = wrap.clientWidth, H = wrap.clientHeight;
    if (!W || !H) return;
    var minDim = Math.min(W, H);
    var L = LAYOUTS[layoutName];
    var touchMode = settings.touch.mode;
    els.joy.style.display = (touchMode === 'joystick' && (settings.touch.float ? joyActive : true)) ? 'block' : 'none';
    els.dpad.style.display = touchMode === 'dpad' ? 'block' : 'none';
    if (touchMode === 'joystick') {
      if (!settings.touch.float || joyCenter) {
        var c = joyCenter || { x: L.joy.x * W, y: L.joy.y * H };
        var d = L.joy.d * minDim * settings.touch.size;
        els.joy.style.width = d + 'px'; els.joy.style.height = d + 'px';
        els.joy.style.left = (c.x - d / 2) + 'px'; els.joy.style.top = (c.y - d / 2) + 'px';
      }
    } else {
      var dd = L.dpad.d * minDim * settings.touch.size;
      var cx = L.dpad.x * W, cy = L.dpad.y * H, cell = dd / 3;
      els.dpad.style.left = (cx - dd / 2) + 'px'; els.dpad.style.top = (cy - dd / 2) + 'px';
      els.dpad.style.width = dd + 'px'; els.dpad.style.height = dd + 'px';
      Array.prototype.forEach.call(els.dpad.children, function (b) {
        b.style.left = (b._gx * cell) + 'px'; b.style.top = (b._gy * cell) + 'px';
        b.style.width = cell + 'px'; b.style.height = cell + 'px';
        b.style.fontSize = (cell * 0.42) + 'px';
      });
    }
    Array.prototype.forEach.call(els.skills.children, function (b) {
      var spec = null;
      for (var i = 0; i < L.skills.length; i++) if (L.skills[i].id === b.getAttribute('data-act')) spec = L.skills[i];
      if (spec) place(b, spec, W, H, minDim);
    });
    Array.prototype.forEach.call(els.zoomBox.children, function (b) {
      var spec = L[b.getAttribute('data-zoom')];
      if (spec) place(b, spec, W, H, minDim);
    });
    els.hint.style.left = (L.padHint.x * W) + 'px';
    els.hint.style.top = (L.padHint.y * H) + 'px';
    els.ov.style.opacity = settings.touch.opacity;
  }
  function applyAll() {
    applyLayout();
    refreshOverlayVisibility();
    updatePadHint();
  }
  function touchCapable() {
    return ('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0);
  }
  function refreshOverlayVisibility() {
    if (!els.ov) return;
    var showTouch = settings.touch.show === 'on' || (settings.touch.show === 'auto' && touchCapable());
    els.ov.classList.toggle('on', inGame);
    els.zone.style.display = (showTouch && settings.touch.mode === 'joystick' && settings.touch.float) ? 'block' : 'none';
    els.skills.style.display = showTouch ? 'block' : 'none';
    els.joy.style.display = (showTouch && settings.touch.mode === 'joystick' && (!settings.touch.float || joyActive)) ? 'block' : 'none';
    els.dpad.style.display = (showTouch && settings.touch.mode === 'dpad') ? 'block' : 'none';
    positionOverlay();
  }

  /* ---------- Joystick / D-pad / nút chiêu / zoom ---------- */
  var joyActive = false, joyPid = null, joyCenter = null;
  function joyFromEvent(e) {
    var wrap = $('gameWrap');
    var r = wrap.getBoundingClientRect();
    var L = LAYOUTS[layoutName];
    var minDim = Math.min(r.width, r.height);
    var R = L.joy.d * minDim * settings.touch.size / 2;
    var dx = (e.clientX - r.left - joyCenter.x) / R;
    var dy = (e.clientY - r.top - joyCenter.y) / R;
    var l = Math.sqrt(dx * dx + dy * dy);
    if (l > 1) { dx /= l; dy /= l; }
    if (l < 0.14) { dx = 0; dy = 0; }
    joyVec = { x: dx, y: dy };
    els.knob.style.transform = 'translate(' + (dx * R * 0.55) + 'px,' + (dy * R * 0.55) + 'px)';
  }
  function bindOverlay() {
    var wrap = $('gameWrap');
    els.zone.addEventListener('pointerdown', function (e) {
      if (joyPid !== null) return;
      joyPid = e.pointerId; joyActive = true;
      var r = wrap.getBoundingClientRect();
      joyCenter = { x: e.clientX - r.left, y: e.clientY - r.top };
      try { els.zone.setPointerCapture(joyPid); } catch (_e) {}
      refreshOverlayVisibility();
      joyFromEvent(e);
      e.preventDefault();
    });
    els.zone.addEventListener('pointermove', function (e) { if (e.pointerId === joyPid) joyFromEvent(e); });
    var joyEnd = function (e) {
      if (e.pointerId !== joyPid) return;
      joyPid = null; joyActive = false; joyVec = { x: 0, y: 0 };
      els.knob.style.transform = '';
      if (!settings.touch.float) joyCenter = null;
      refreshOverlayVisibility();
    };
    els.zone.addEventListener('pointerup', joyEnd);
    els.zone.addEventListener('pointercancel', joyEnd);
    els.joy.addEventListener('pointerdown', function (e) {
      if (settings.touch.float || joyPid !== null) return;
      joyPid = e.pointerId; joyActive = true;
      if (!joyCenter) {
        var r = wrap.getBoundingClientRect(), L = LAYOUTS[layoutName];
        joyCenter = { x: L.joy.x * r.width, y: L.joy.y * r.height };
      }
      try { els.joy.setPointerCapture(joyPid); } catch (_e) {}
      joyFromEvent(e);
      e.preventDefault();
    });
    els.joy.addEventListener('pointermove', function (e) { if (e.pointerId === joyPid) joyFromEvent(e); });
    els.joy.addEventListener('pointerup', joyEnd);
    els.joy.addEventListener('pointercancel', joyEnd);
    Array.prototype.forEach.call(els.dpad.children, function (b) {
      var dir = b.getAttribute('data-dir');
      b.addEventListener('pointerdown', function (e) {
        dpadHeld[dir] = true; b.classList.add('on');
        try { b.setPointerCapture(e.pointerId); } catch (_e) {}
        e.preventDefault();
      });
      var off = function () { dpadHeld[dir] = false; b.classList.remove('on'); };
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
    });
    Array.prototype.forEach.call(els.skills.children, function (b) {
      b.addEventListener('pointerdown', function (e) {
        b.classList.add('on');
        fireAction(b.getAttribute('data-act'));
        e.preventDefault();
      });
      var off = function () { b.classList.remove('on'); };
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('pointerleave', off);
    });
    Array.prototype.forEach.call(els.zoomBox.children, function (b) {
      b.addEventListener('pointerdown', function (e) {
        var z = b.getAttribute('data-zoom');
        if (z === 'zoomIn') setZoom(stepZoom(zoom(), 1), true);
        else if (z === 'zoomOut') setZoom(stepZoom(zoom(), -1), true);
        else setZoom(1, true);
        e.preventDefault();
      });
    });
  }
  function setZoom(z, announce) {
    settings.view.zoom = clampZoom(z);
    persist();
    if (announce) toast('Zoom map: ' + Math.round(zoom() * 100) + '%');
  }

  /* ---------- Pinch / wheel / double-tap trên canvas ---------- */
  var pinch = null, suppressClickUntil = 0, lastTapT = 0, lastTapPos = null;
  function bindCanvasGestures() {
    var canvas = $('gameCanvas');
    if (!canvas) return;
    var pointers = {};
    canvas.addEventListener('pointerdown', function (e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y), z0: zoom() };
      }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (pinch) {
        var ids = Object.keys(pointers);
        if (ids.length === 2) {
          var a = pointers[ids[0]], b = pointers[ids[1]];
          settings.view.zoom = pinchZoom(pinch.z0, pinch.d0, Math.hypot(a.x - b.x, a.y - b.y));
          settings = normalizeSettings(settings);
        }
      }
    });
    var endPointer = function (e) {
      var wasPinch = !!pinch;
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length < 2 && pinch) {
        pinch = null;
        suppressClickUntil = Date.now() + 400;
        persist();
        toast('Zoom map: ' + Math.round(zoom() * 100) + '%');
      }
      if (!wasPinch && e.pointerType === 'touch') {
        var now = Date.now();
        if (lastTapPos && now - lastTapT < 320 && Math.hypot(e.clientX - lastTapPos.x, e.clientY - lastTapPos.y) < 28) {
          setZoom(1, true);
          suppressClickUntil = now + 400;
          lastTapT = 0; lastTapPos = null;
        } else { lastTapT = now; lastTapPos = { x: e.clientX, y: e.clientY }; }
      }
    };
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    // Sau pinch/double-tap: nuốt cú click sắp tới để nhân vật không chạy
    // tới điểm vừa zoom (listener capture ở document, chạy trước game.js).
    document.addEventListener('click', function (e) {
      if (Date.now() < suppressClickUntil && e.target === canvas) {
        e.stopPropagation(); e.preventDefault();
      }
    }, true);
    canvas.addEventListener('wheel', function (e) {
      if (!inGame) return;
      e.preventDefault();
      setZoom(stepZoom(zoom(), e.deltaY < 0 ? 1 : -1), false);
    }, { passive: false });
    canvas.addEventListener('dblclick', function (e) {
      setZoom(1, true);
      e.preventDefault();
    });
  }

  /* ---------- Bàn phím: gán lại + trạng thái di chuyển gán-riêng ---------- */
  function isFormTarget(t) {
    return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable));
  }
  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (capturing) {
        e.preventDefault(); e.stopPropagation();
        if (e.key !== 'Escape') {
          settings.keys = remapKey(settings.keys, capturing, e.key.toLowerCase());
          persist();
          toast('Đã gán: ' + KEY_ACTIONS.filter(function (a) { return a.id === capturing; })[0].label + ' = ' + keysLabel(settings.keys, capturing));
        }
        capturing = null;
        renderSettingsPanel();
        return;
      }
      if (isFormTarget(e.target)) return;
      var k = e.key.toLowerCase();
      var kmap = normalizeKeys(settings.keys);
      // Phím di chuyển gán-riêng: tự theo dõi để cộng vào moveVec.
      for (var i = 0; i < MOVE_IDS.length; i++) {
        var id = MOVE_IDS[i];
        if (!sameKeySet(kmap[id], DEFAULT_KEYS[id]) && kmap[id].indexOf(k) >= 0) heldKeys[k] = true;
      }
      // Phím hành động gán-riêng: tự bắn qua PNT_HOOKS + nuốt bản mặc định.
      if (!e.repeat && isCustomized(kmap) && keySwallowed(k, false)) {
        for (var a in FIRE_TO_HOOK) {
          if (kmap[a] && kmap[a].indexOf(k) >= 0) {
            fireAction(a);
            e.preventDefault(); e.stopPropagation();
            return;
          }
        }
        // Phím mồ côi (mặc định cũ đã bị thay): chỉ nuốt, không bắn.
        e.preventDefault(); e.stopPropagation();
      }
    }, true);
    document.addEventListener('keyup', function (e) {
      heldKeys[e.key.toLowerCase()] = false;
    }, true);
  }

  /* ---------- Tay cầm: poll + gợi ý nút ---------- */
  var padPrev = [], padCapture = null, padPollStarted = false;
  function getPad() {
    try {
      if (!navigator.getGamepads) return null;
      var ps = navigator.getGamepads();
      for (var i = 0; i < ps.length; i++) if (ps[i] && ps[i].connected) return ps[i];
    } catch (e) {}
    return null;
  }
  function padPressed(btns, i) {
    var b = btns[i];
    return !!(b && (b.pressed || b.value > 0.5));
  }
  function updatePadHint() {
    if (!els.hint) return;
    if (padConnected && settings.pad.enabled) {
      var map = normalizePadMap(settings.pad.map);
      els.hint.textContent = 'Tay cầm: A Đánh · ' + padBtnName(map.skill1) + '/' + padBtnName(map.skill2) + '/' + padBtnName(map.skill3) +
        ' Chiêu (nhóm ' + (padPage + 1) + '/3: ' + PAD_PAGE_NAMES[padPage] + ') · LB/RB đổi nhóm · RT Lướt · LT Tương tác';
      els.hint.style.display = 'block';
    } else {
      els.hint.style.display = 'none';
    }
  }
  function padFire(action) {
    var h = hooks();
    if (action === 'attack') fireHook(['attack']);
    else if (action === 'skill1' || action === 'skill2' || action === 'skill3') {
      var slot = { skill1: 0, skill2: 1, skill3: 2 }[action];
      var d = padSkillDesc(padPage, slot);
      if (h && h.padSkill) { try { h.padSkill(d); } catch (e) {} }
      else if (d && d.kind === 'bar') fireHook(['bar', d.index]);
      else if (d && d.kind === 'art') fireHook(['art', d.index]);
      else if (d && d.kind === 'util') fireHook([d.id]);
    }
    else if (action === 'pagePrev' || action === 'pageNext') {
      padPage = (padPage + (action === 'pageNext' ? 1 : PAD_PAGES.length - 1)) % PAD_PAGES.length;
      toast('Nhóm chiêu tay cầm ' + (padPage + 1) + '/3: ' + PAD_PAGE_NAMES[padPage]);
      updatePadHint();
    }
    else if (action === 'dash') fireHook(['bar', 4]); // Lưu Tinh Đột = BAR[4]
    else if (action === 'interact') fireHook(['interact']);
    else if (action === 'menu') toggleSettingsPanel(true);
    else if (action === 'bag') { var b = $('btnInv'); if (b) b.click(); }
  }
  function padPoll() {
    var p = settings.pad.enabled ? getPad() : null;
    if (!p) { padVec = { x: 0, y: 0 }; padPrev = []; return; }
    var btns = p.buttons || [];
    if (padCapture) {
      for (var i = 0; i < btns.length; i++) {
        if (padPressed(btns, i) && !padPrev[i]) {
          var map = normalizePadMap(settings.pad.map);
          map[padCapture] = i;
          settings.pad.map = map;
          padCapture = null;
          persist();
          renderSettingsPanel();
          toast('Đã gán nút tay cầm: ' + padBtnName(i));
          break;
        }
      }
      padPrev = [];
      for (var ci = 0; ci < btns.length; ci++) padPrev[ci] = padPressed(btns, ci);
      padVec = { x: 0, y: 0 };
      return;
    }
    var map2 = normalizePadMap(settings.pad.map);
    for (var a = 0; a < PAD_ACTIONS.length; a++) {
      var act = PAD_ACTIONS[a].id;
      var bi = map2[act];
      if (padPressed(btns, bi) && !padPrev[bi]) padFire(act);
    }
    padPrev = [];
    for (var j = 0; j < btns.length; j++) padPrev[j] = padPressed(btns, j);
    var ax = +(p.axes[0] || 0), ay = +(p.axes[1] || 0);
    if (padPressed(btns, 14)) ax -= 1;
    if (padPressed(btns, 15)) ax += 1;
    if (padPressed(btns, 12)) ay -= 1;
    if (padPressed(btns, 13)) ay += 1;
    var v = axesVec(ax, ay);
    padVec = { x: v.x, y: v.y };
  }
  function bindGamepad() {
    if (padPollStarted) return;
    padPollStarted = true;
    window.addEventListener('gamepadconnected', function (e) {
      padConnected = true;
      padName = String((e.gamepad && e.gamepad.id) || 'Gamepad').split('(')[0].trim().slice(0, 40) || 'Gamepad';
      toast('Đã kết nối tay cầm: ' + padName);
      updatePadHint();
    });
    window.addEventListener('gamepaddisconnected', function () {
      padConnected = false; padName = ''; padVec = { x: 0, y: 0 }; padCapture = null;
      toast('Đã ngắt tay cầm');
      updatePadHint();
    });
    (function loopPad() {
      try { padPoll(); } catch (e) {}
      requestAnimationFrame(loopPad);
    })();
  }
  function testRumble() {
    var p = getPad();
    try {
      if (p && p.vibrationActuator && p.vibrationActuator.playEffect) {
        p.vibrationActuator.playEffect('dual-rumble', { duration: 400, strongMagnitude: 0.8, weakMagnitude: 0.5 });
        toast('Tay cầm đang rung thử.');
        return true;
      }
    } catch (e) {}
    toast(padConnected ? 'Tay cầm này không hỗ trợ rung.' : 'Chưa kết nối tay cầm nào.');
    return false;
  }

  /* ---------- Panel Cài đặt "Điều khiển & Màn hình" ---------- */
  function toggleSettingsPanel(open) {
    var m = $('ctlModal');
    if (!m) return;
    var show = open != null ? open : m.style.display !== 'block';
    m.style.display = show ? 'block' : 'none';
    if (show) renderSettingsPanel();
  }
  function row(label, controlHtml) {
    return '<div class="row"><span class="nm">' + label + '</span>' + controlHtml + '</div>';
  }
  function renderSettingsPanel() {
    var body = $('ctlBody');
    if (!body) return;
    var html = '';
    html += '<h3>Bàn phím PC <button class="grp-reset" data-reset="keys">Về mặc định</button></h3>';
    KEY_ACTIONS.forEach(function (a) {
      var wait = capturing === a.id;
      html += row(a.label, '<button class="kbtn' + (wait ? ' wait' : '') + '" data-kact="' + a.id + '">' +
        (wait ? 'Bấm phím bất kỳ… (Esc hủy)' : keysLabel(settings.keys, a.id)) + '</button>');
    });
    html += '<h3>Tay cầm <button class="grp-reset" data-reset="pad">Về mặc định</button></h3>';
    html += row('Bật tay cầm', '<input type="checkbox" id="ctlPadOn"' + (settings.pad.enabled ? ' checked' : '') + '>');
    var pmap = normalizePadMap(settings.pad.map);
    PAD_ACTIONS.forEach(function (a) {
      var wait = padCapture === a.id;
      html += row(a.label, '<button class="kbtn' + (wait ? ' wait' : '') + '" data-pact="' + a.id + '">' +
        (wait ? 'Bấm nút trên tay cầm…' : padBtnName(pmap[a.id])) + '</button>');
    });
    html += row('Trạng thái', '<span id="ctlPadStatus">' + (padConnected ? ('Đã kết nối: ' + padName) : 'Chưa kết nối') + '</span>' +
      '<button class="kbtn" id="ctlRumble">Test rung</button>');
    html += '<h3>Cảm ứng (điện thoại) <button class="grp-reset" data-reset="touch">Về mặc định</button></h3>';
    html += row('Hiện nút cảm ứng', '<select id="ctlTouchShow">' +
      [['auto', 'Tự động (máy cảm ứng)'], ['on', 'Luôn hiện'], ['off', 'Tắt']].map(function (o) {
        return '<option value="' + o[0] + '"' + (settings.touch.show === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>');
    html += row('Kiểu điều khiển', '<select id="ctlTouchMode">' +
      [['joystick', 'Joystick ảo'], ['dpad', 'D-pad 4 hướng']].map(function (o) {
        return '<option value="' + o[0] + '"' + (settings.touch.mode === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>');
    html += row('Joystick nổi theo điểm chạm', '<input type="checkbox" id="ctlJoyFloat"' + (settings.touch.float ? ' checked' : '') + '>');
    html += row('Cỡ nút', '<input type="range" id="ctlSize" min="0.8" max="1.4" step="0.1" value="' + settings.touch.size + '"> <span>' + Math.round(settings.touch.size * 100) + '%</span>');
    html += row('Độ mờ nút', '<input type="range" id="ctlOpacity" min="0.35" max="1" step="0.05" value="' + settings.touch.opacity + '"> <span>' + Math.round(settings.touch.opacity * 100) + '%</span>');
    html += '<h3>Màn hình & Zoom <button class="grp-reset" data-reset="view">Về mặc định</button></h3>';
    html += row('Hướng màn hình', '<select id="ctlOrient">' +
      [['auto', 'Tự động theo máy'], ['ngang', 'Khóa ngang'], ['doc', 'Khóa dọc'], ['full', 'Toàn màn hình (ngang)']].map(function (o) {
        return '<option value="' + o[0] + '"' + (settings.view.orient === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select>');
    html += row('Zoom map', '<input type="range" id="ctlZoomRange" min="0.6" max="2" step="0.05" value="' + zoom() + '"> <span>' + Math.round(zoom() * 100) + '%</span>' +
      '<button class="kbtn" id="ctlZoomResetBtn">Về 100%</button>');
    html += row('Toàn màn hình', '<button class="kbtn" id="ctlFsBtn">Bật toàn màn hình</button>');
    html += '<p style="font-size:12px;color:#6b5836">Zoom: pinch 2 ngón / nút + − trên màn hình / lăn chuột trên map; chạm 2 lần (double-tap) để về 100%. Tay cầm: cần trái hoặc D-pad để đi, cắm là nhận.</p>';
    body.innerHTML = html;
    bindSettingsPanel();
  }
  function bindSettingsPanel() {
    var body = $('ctlBody');
    if (!body) return;
    Array.prototype.forEach.call(body.querySelectorAll('[data-kact]'), function (b) {
      b.addEventListener('click', function () {
        capturing = b.getAttribute('data-kact');
        renderSettingsPanel();
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-pact]'), function (b) {
      b.addEventListener('click', function () {
        if (!padConnected) { toast('Hãy kết nối tay cầm trước.'); return; }
        padCapture = b.getAttribute('data-pact');
        renderSettingsPanel();
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-reset]'), function (b) {
      b.addEventListener('click', function () {
        settings = resetGroup(settings, b.getAttribute('data-reset'));
        if (b.getAttribute('data-reset') === 'keys') heldKeys = {};
        if (b.getAttribute('data-reset') === 'pad') padCapture = null;
        persist();
        renderSettingsPanel();
        toast('Đã về mặc định nhóm này.');
      });
    });
    var q = function (id) { return body.querySelector('#' + id); };
    var padOn = q('ctlPadOn');
    if (padOn) padOn.addEventListener('change', function () { settings.pad.enabled = padOn.checked; persist(); updatePadHint(); });
    var rumble = q('ctlRumble');
    if (rumble) rumble.addEventListener('click', testRumble);
    var tShow = q('ctlTouchShow');
    if (tShow) tShow.addEventListener('change', function () { settings.touch.show = tShow.value; persist(); });
    var tMode = q('ctlTouchMode');
    if (tMode) tMode.addEventListener('change', function () { settings.touch.mode = tMode.value; joyVec = { x: 0, y: 0 }; dpadHeld = {}; persist(); });
    var jFloat = q('ctlJoyFloat');
    if (jFloat) jFloat.addEventListener('change', function () { settings.touch.float = jFloat.checked; joyCenter = null; persist(); });
    var size = q('ctlSize');
    if (size) size.addEventListener('input', function () { settings.touch.size = clampNum(size.value, 0.8, 1.4, 1); persist(); renderSettingsPanel(); });
    var op = q('ctlOpacity');
    if (op) op.addEventListener('input', function () { settings.touch.opacity = clampNum(op.value, 0.35, 1, 0.85); persist(); renderSettingsPanel(); });
    var orient = q('ctlOrient');
    if (orient) orient.addEventListener('change', function () {
      settings.view.orient = orient.value;
      persist();
      if (orient.value === 'full') requestFullscreen(true);
    });
    var zr = q('ctlZoomRange');
    if (zr) zr.addEventListener('input', function () { settings.view.zoom = clampZoom(zr.value); persist(); renderSettingsPanel(); });
    var zReset = q('ctlZoomResetBtn');
    if (zReset) zReset.addEventListener('click', function () { setZoom(1, true); renderSettingsPanel(); });
    var fs = q('ctlFsBtn');
    if (fs) fs.addEventListener('click', function () { requestFullscreen(settings.view.orient !== 'doc'); });
  }
  function requestFullscreen(lockLandscape) {
    try {
      var el = document.documentElement;
      var p = el.requestFullscreen ? el.requestFullscreen() : null;
      if (p && p.catch) p.catch(function () {});
      if (lockLandscape && screen.orientation && screen.orientation.lock) {
        var lp = screen.orientation.lock('landscape');
        if (lp && lp.catch) lp.catch(function () {});
      }
    } catch (e) {}
  }
  function buildSettingsPanel() {
    if ($('ctlModal')) return;
    var m = mk('div', 'ctlModal');
    m.innerHTML = '<div class="ctl-panel"><h2 style="margin-top:0;color:#7a3b22">Điều khiển & Màn hình</h2>' +
      '<div id="ctlBody"></div>' +
      '<button id="ctlClose" style="margin-top:14px">Đóng</button></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m) toggleSettingsPanel(false); });
    $('ctlClose').addEventListener('click', function () { toggleSettingsPanel(false); });
    var controlsBar = $('controls');
    if (controlsBar && !$('btnControls')) {
      var btn = mk('button', 'btnControls');
      btn.textContent = 'Điều khiển & Màn hình';
      btn.addEventListener('click', function () { toggleSettingsPanel(true); });
      controlsBar.appendChild(btn);
    }
  }

  /* ---------- Vòng đời ---------- */
  var started = false;
  function tick() {
    var sg = $('screen-game');
    inGame = !!(sg && sg.style.display !== 'none');
    var acc = currentAccount();
    if (acc !== account) {
      account = acc;
      settings = loadSettings(store(), account);
      applyAll();
      if ($('ctlModal') && $('ctlModal').style.display === 'block') renderSettingsPanel();
    }
    if (els.ov) {
      var want = inGame;
      if (els.ov.classList.contains('on') !== want) refreshOverlayVisibility();
    }
  }
  function init() {
    if (started) return;
    started = true;
    var st = mk('style', null);
    st.textContent = CSS;
    document.head.appendChild(st);
    account = currentAccount();
    settings = loadSettings(store(), account);
    buildOverlay();
    buildSettingsPanel();
    bindKeyboard();
    bindCanvasGestures();
    bindGamepad();
    window.addEventListener('resize', applyLayout);
    window.addEventListener('orientationchange', applyLayout);
    applyAll();
    setInterval(tick, 600);
    setInterval(positionOverlay, 1200); // khung đổi cỡ (xoay máy) thì đặt lại nút
  }

  var api = {
    // Thuần (test):
    KEY_ACTIONS: KEY_ACTIONS, DEFAULT_KEYS: DEFAULT_KEYS, MOVE_IDS: MOVE_IDS,
    normalizeKeys: normalizeKeys, isCustomized: isCustomized, remapKey: remapKey,
    keyLabel: keyLabel, keysLabel: keysLabel, keySwallowed: keySwallowed,
    keyboardVector: keyboardVector, combineVec: combineVec, dpadVector: dpadVector,
    PAD_ACTIONS: PAD_ACTIONS, DEFAULT_PAD_MAP: DEFAULT_PAD_MAP, BTN_NAMES: BTN_NAMES,
    padBtnName: padBtnName, isValidPadMap: isValidPadMap, normalizePadMap: normalizePadMap,
    axesVec: axesVec, PAD_PAGES: PAD_PAGES, PAD_PAGE_NAMES: PAD_PAGE_NAMES, padSkillDesc: padSkillDesc,
    PAD_DEADZONE: PAD_DEADZONE,
    LAYOUTS: LAYOUTS, pickLayout: pickLayout,
    ZOOM_MIN: ZOOM_MIN, ZOOM_MAX: ZOOM_MAX,
    clampZoom: clampZoom, stepZoom: stepZoom, pinchZoom: pinchZoom,
    defaultSettings: defaultSettings, normalizeSettings: normalizeSettings,
    loadSettings: loadSettings, saveSettings: saveSettings, resetGroup: resetGroup,
    storageKey: storageKey,
    // Runtime (trình duyệt; game.js gọi):
    moveVec: moveVec, zoom: zoom, swallowKey: swallowKey,
    getSettings: function () { return normalizeSettings(settings); },
    setZoom: setZoom,
    toggleSettingsPanel: toggleSettingsPanel
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_CONTROLS = api;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') init();
    else document.addEventListener('DOMContentLoaded', init);
  }
})();
