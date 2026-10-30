// Phàm Nhân Tu Đạo — KHUNG MULTIPLAYER (js/net.js, PNT_NET).
// Định hướng Bui chốt 21:53 29/10/2026: game NHIỀU NGƯỜI CHƠI dạng cày cuốc
// tài nguyên để tu tiên. Tài liệu kiến trúc đích: docs/multiplayer-design.md;
// schema server: docs/supabase-schema.sql (PROJECT SUPABASE RIÊNG, chưa tạo —
// chờ Bui duyệt; file này KHÔNG chứa URL/key thật nào).
//
// Trạng thái đợt này = KHUNG CHẠY THỬ OFFLINE sau cờ tính năng 'pnt-online':
//   - 'off'      (MẶC ĐỊNH): game chơi đơn y hệt hiện tại, module này ngủ.
//   - 'sim'      : transport MÔ PHỎNG offline — 4–6 "người chơi mô phỏng" đi
//                  lại trong map hiện tại, đi qua ĐÚNG đường truyền sẽ dùng
//                  cho server thật (snapshot 10 Hz + trễ giả lập + nội suy ở
//                  session) để chứng minh đường render/đồng bộ chạy được.
//   - 'supabase' : khung transport server — CHƯA cấu hình project nên tạo
//                  transport sẽ throw rõ "chưa cấu hình"; game tự rơi về
//                  chơi đơn + ghi log, không sập.
//
// Interface transport (cả 2 hiện thực đều theo):
//   join(mapId, selfProfile, handlers) / leave() / sendState(state) /
//   update(dt) / dispose()
//   handlers: onJoin(profile), onLeave(peerId), onState(peerId, snapshot)
// Session (dùng chung mọi transport): nhận snapshot thô -> đệm 2 mốc gần
// nhất -> nội suy tuyến tính tại (now - 120ms) ra trạng thái render
// {x, y, dir, moving, phase} — cùng nguyên lý lớp mượt js/smooth.js (vị trí
// liên tục theo thời gian thật, không nhảy bậc theo nhịp snapshot).
(function () {
  'use strict';

  var FLAG_KEY = 'pnt-online';
  var TILE = 32;
  var SEND_HZ = 10;              // nhịp gửi/nhận snapshot vị trí (giây^-1)
  var INTERP_DELAY = 0.12;       // đệm nội suy 120ms (khớp docs thiết kế)
  var SIM_LATENCY = 0.12;        // trễ mạng giả lập của transport mô phỏng
  var PEER_MIN = 4, PEER_MAX = 6;

  function mapsApi() {
    if (typeof module !== 'undefined' && module.exports) {
      try { return require('./maps.js'); } catch (e) { return null; }
    }
    if (typeof window !== 'undefined' && window.PNT_MAPS) return window.PNT_MAPS;
    if (typeof globalThis !== 'undefined' && globalThis.PNT_MAPS) return globalThis.PNT_MAPS;
    return null;
  }

  // ---------- Cờ tính năng ----------
  function storage() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) return localStorage;
    } catch (e) { /* môi trường chặn storage */ }
    return null;
  }
  function mode() {
    var st = storage();
    var v = null;
    if (st) { try { v = st.getItem(FLAG_KEY); } catch (e) { v = null; } }
    return (v === 'sim' || v === 'supabase') ? v : 'off';
  }
  function setMode(m) {
    var st = storage();
    if (!st) return false;
    try {
      if (m === 'off') st.removeItem(FLAG_KEY);
      else st.setItem(FLAG_KEY, m);
      return true;
    } catch (e) { return false; }
  }
  function enabled() { return mode() !== 'off'; }

  // ---------- RNG gieo hạt (cho mô phỏng tất định + test) ----------
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- Dữ liệu người chơi mô phỏng ----------
  var SIM_NAMES = ['Trần Mặc', 'Lý Sương', 'Vương Hạo', 'Chu Linh', 'Ngô Phong',
    'Tôn Tuyết Nhi', 'Trịnh Hổ', 'Phạm Dũng', 'Đỗ Quyên', 'Bùi Sơn', 'Hứa Thanh', 'Đặng Lộ'];
  var SIM_LOOKS = [
    { gender: 'nam', origin: 'nong_dan' }, { gender: 'nam', origin: 'tho_san' },
    { gender: 'nam', origin: 'thu_sinh' }, { gender: 'nu', origin: 'nong_dan' },
    { gender: 'nu', origin: 'tho_san' }, { gender: 'nu', origin: 'thu_sinh' }
  ];
  function realmPoolFor(mapId) {
    var n = parseInt(String(mapId).replace(/\D/g, ''), 10) || 1;
    if (n >= 5) return ['Luyện Khí tầng 4', 'Luyện Khí tầng 5', 'Luyện Khí tầng 6', 'Luyện Khí tầng 7', 'Luyện Khí tầng 9'];
    if (n >= 2) return ['Phàm Nhân', 'Luyện Khí tầng 1', 'Luyện Khí tầng 2', 'Luyện Khí tầng 3', 'Luyện Khí tầng 4'];
    return ['Phàm Nhân', 'Phàm Nhân', 'Luyện Khí tầng 1', 'Luyện Khí tầng 1', 'Luyện Khí tầng 2', 'Luyện Khí tầng 3'];
  }
  // Điểm neo tụ tập theo map (sân trấn/quảng trường); map lạ thì dò xoắn ốc
  // từ giữa map ra tới ô đi được đầu tiên.
  var ANCHORS = { map1: [19, 10], map2: [19, 20], map3: [19, 14], map4: [36, 24] };
  function findAnchor(M, map) {
    var cand = ANCHORS[map.id] ? [ANCHORS[map.id]] : [];
    cand.push([Math.floor(map.w / 2), Math.floor(map.h / 2)]);
    cand.push([19, 10]);
    for (var ci = 0; ci < cand.length; ci++) {
      var cx = cand[ci][0], cy = cand[ci][1];
      for (var r = 0; r < 14; r++) {
        for (var y = cy - r; y <= cy + r; y++) {
          for (var x = cx - r; x <= cx + r; x++) {
            if (x < 1 || y < 1 || x >= map.w - 1 || y >= map.h - 1) continue;
            if (!M.isBlockedIn(map, x, y)) return { x: x, y: y };
          }
        }
      }
    }
    return { x: 1, y: 1 };
  }
  function tileCenter(tx, ty) { return { x: tx * TILE + 16, y: ty * TILE + 28 }; }

  // =====================================================================
  // TRANSPORT MÔ PHỎNG OFFLINE
  // Bot đi lại trên Ô ĐI ĐƯỢC (kiểm M.isBlockedIn từng bước), phát snapshot
  // vị trí ở nhịp SEND_HZ qua hàng đợi có trễ SIM_LATENCY — session không
  // phân biệt được với gói tin server thật.
  // =====================================================================
  function createSimTransport(opts) {
    opts = opts || {};
    var M = opts.maps || mapsApi();
    if (!M) throw new Error('PNT_NET: thiếu PNT_MAPS cho transport mô phỏng.');
    var rng = opts.rng || Math.random;
    var map = null, mapId = null, handlers = null;
    var bots = [];            // {prof, x, y, tx, ty (đích px), speed, idleT, leaveT, phase}
    var queue = [];           // {at, peerId, snap} — gói snapshot đang "trên đường"
    var now = 0, snapAcc = 0, joinSeq = 0;
    var pendingJoins = [];    // {at, prof} — người mới sắp vào map
    var stats = { sent: 0, received: 0, joins: 0, leaves: 0 };

    function freeName(used) {
      var pool = SIM_NAMES.filter(function (n) { return !used[n]; });
      if (!pool.length) return null;
      return pool[Math.floor(rng() * pool.length)];
    }
    function makeProfile(name) {
      var look = SIM_LOOKS[Math.floor(rng() * SIM_LOOKS.length)];
      var realms = realmPoolFor(mapId);
      joinSeq++;
      return {
        id: 'sim-' + mapId + '-' + joinSeq + '-' + hashStr(name).toString(36),
        name: name,
        realm: realms[Math.floor(rng() * realms.length)],
        gender: look.gender, origin: look.origin,
        sim: true
      };
    }
    function spawnBot(prof) {
      var anchor = findAnchor(M, map);
      var spot = null;
      for (var tries = 0; tries < 60 && !spot; tries++) {
        var tx = anchor.x + Math.floor(rng() * 13) - 6;
        var ty = anchor.y + Math.floor(rng() * 11) - 5;
        if (tx >= 1 && ty >= 1 && tx < map.w - 1 && ty < map.h - 1 && !M.isBlockedIn(map, tx, ty)) spot = { x: tx, y: ty };
      }
      if (!spot) spot = anchor;
      var c = tileCenter(spot.x, spot.y);
      var bot = {
        prof: prof, x: c.x, y: c.y, tx: c.x, ty: c.y,
        speed: 70 + rng() * 45, idleT: rng() * 2,
        leaveT: 25 + rng() * 45, phase: rng() * 20,
        dir: 'down', moving: false
      };
      bots.push(bot);
      if (handlers && handlers.onJoin) handlers.onJoin(prof);
      stats.joins++;
      return bot;
    }
    function pickTarget(bot) {
      var anchor = findAnchor(M, map);
      for (var tries = 0; tries < 24; tries++) {
        var tx = anchor.x + Math.floor(rng() * 17) - 8;
        var ty = anchor.y + Math.floor(rng() * 15) - 7;
        if (tx < 1 || ty < 1 || tx >= map.w - 1 || ty >= map.h - 1) continue;
        if (M.isBlockedIn(map, tx, ty)) continue;
        var c = tileCenter(tx, ty);
        bot.tx = c.x; bot.ty = c.y;
        return;
      }
      bot.idleT = 1 + rng() * 2;
    }
    function stepBot(bot, dt) {
      // Rời map ngẫu nhiên (người chơi khác qua cổng/đăng xuất).
      bot.leaveT -= dt;
      if (bot.leaveT <= 0) return false;
      if (bot.idleT > 0) {
        bot.idleT -= dt; bot.moving = false;
        return true;
      }
      var dx = bot.tx - bot.x, dy = bot.ty - bot.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) { pickTarget(bot); if (bot.idleT <= 0 && rng() < 0.35) bot.idleT = 0.5 + rng() * 2.5; bot.moving = false; return true; }
      var vx = dx / dist * bot.speed, vy = dy / dist * bot.speed;
      // Kiểm va chạm theo trục như vòng lặp chính của game: trục bị chặn
      // thì dừng riêng trục đó (trượt dọc vật cản), không xuyên ô chặn.
      var prevX = bot.x, prevY = bot.y;
      var nx = bot.x + vx * dt;
      if (!M.isBlockedIn(map, Math.floor(nx / TILE), Math.floor(bot.y / TILE))) bot.x = nx;
      var ny = bot.y + vy * dt;
      if (!M.isBlockedIn(map, Math.floor(bot.x / TILE), Math.floor(ny / TILE))) bot.y = ny;
      // Bị chặn cả 2 trục (dính góc): đổi đích khác thay vì đứng mài tường.
      if (Math.abs(bot.x - prevX) < 0.01 && Math.abs(bot.y - prevY) < 0.01) {
        bot.stuckT = (bot.stuckT || 0) + dt;
        if (bot.stuckT > 0.6) { bot.stuckT = 0; pickTarget(bot); }
      } else bot.stuckT = 0;
      bot.moving = true;
      if (Math.abs(vy) > Math.abs(vx) * 1.35) bot.dir = vy < 0 ? 'up' : 'down';
      else if (Math.abs(vx) > Math.abs(vy) * 1.35) bot.dir = vx < 0 ? 'left' : 'right';
      else bot.dir = Math.abs(vy) > Math.abs(vx) ? (vy < 0 ? 'up' : 'down') : (vx < 0 ? 'left' : 'right');
      bot.phase += bot.speed * dt / 3.6; // 72px = 1 chu kỳ 20 frame (như game.js)
      return true;
    }
    return {
      kind: 'sim',
      stats: stats,
      join: function (toMapId, selfProfile, h) {
        this.leave();
        mapId = toMapId;
        map = M.getMap ? M.getMap(toMapId) : null;
        if (!map) throw new Error('PNT_NET sim: không thấy map ' + toMapId);
        handlers = h || {};
        now = 0; snapAcc = 0; queue = []; pendingJoins = [];
        var used = {};
        var n = PEER_MIN + Math.floor(rng() * (PEER_MAX - PEER_MIN + 1));
        for (var i = 0; i < n; i++) {
          var nm = freeName(used);
          if (!nm) break;
          used[nm] = 1;
          // Vào map lệch nhịp nhau 0–1.5s như người thật lần lượt đăng nhập.
          pendingJoins.push({ at: 0.25 + i * 0.3 + rng() * 0.4, prof: makeProfile(nm) });
        }
      },
      leave: function () {
        if (handlers && handlers.onLeave) {
          bots.forEach(function (b) { handlers.onLeave(b.prof.id); });
        }
        bots = []; queue = []; pendingJoins = []; handlers = null; map = null; mapId = null;
      },
      sendState: function (state) { stats.sent++; /* mô phỏng: bot không phản ứng với mình */ },
      update: function (dt) {
        if (!map) return;
        now += dt;
        for (var pi = pendingJoins.length - 1; pi >= 0; pi--) {
          if (now >= pendingJoins[pi].at) { spawnBot(pendingJoins[pi].prof); pendingJoins.splice(pi, 1); }
        }
        for (var bi = bots.length - 1; bi >= 0; bi--) {
          if (!stepBot(bots[bi], dt)) {
            var gone = bots.splice(bi, 1)[0];
            if (handlers && handlers.onLeave) handlers.onLeave(gone.prof.id);
            stats.leaves++;
            // Người mới khác vào thay sau 4–10s (giữ mật độ 4–6).
            var used = {};
            bots.forEach(function (b) { used[b.prof.name] = 1; });
            pendingJoins.forEach(function (p) { used[p.prof.name] = 1; });
            var nm2 = freeName(used);
            if (nm2) pendingJoins.push({ at: now + 4 + rng() * 6, prof: makeProfile(nm2) });
          }
        }
        // Phát snapshot nhịp SEND_HZ vào "đường truyền" có trễ.
        snapAcc += dt;
        var period = 1 / SEND_HZ;
        while (snapAcc >= period) {
          snapAcc -= period;
          bots.forEach(function (b) {
            queue.push({
              at: now + SIM_LATENCY, peerId: b.prof.id,
              snap: { t: now, x: b.x, y: b.y, dir: b.dir, moving: b.moving }
            });
          });
        }
        // Giao các snapshot đã "tới nơi".
        for (var qi = queue.length - 1; qi >= 0; qi--) {
          if (now >= queue[qi].at) {
            var q = queue.splice(qi, 1)[0];
            if (handlers && handlers.onState) { handlers.onState(q.peerId, q.snap); stats.received++; }
          }
        }
      },
      botCount: function () { return bots.length; },
      dispose: function () { this.leave(); }
    };
  }

  // =====================================================================
  // TRANSPORT SUPABASE — KHUNG (chưa cấu hình project).
  // Bước sau (khi Bui duyệt tạo project RIÊNG cho game này): nạp supabase-js,
  // channel Realtime 'map:<mapId>' với presence = profile, broadcast
  // 'state' = snapshot vị trí ở nhịp SEND_HZ, và gọi đúng 3 handler ở trên.
  // TUYỆT ĐỐI không đặt URL/key giả vào code — thiếu cấu hình là throw rõ.
  // =====================================================================
  function createSupabaseTransport(config) {
    if (!config || !config.url || !config.anonKey) {
      throw new Error('PNT_NET: transport Supabase CHƯA CẤU HÌNH — cần project Supabase riêng cho Phàm Nhân Tu Đạo + url/anonKey truyền vào (xem docs/multiplayer-design.md, pha P1).');
    }
    throw new Error('PNT_NET: transport Supabase mới là KHUNG — chưa nạp supabase-js/chưa nối Realtime (pha P1, chờ Bui duyệt tạo project).');
  }
  function createTransport(kind, opts) {
    if (kind === 'sim') return createSimTransport(opts || {});
    if (kind === 'supabase') return createSupabaseTransport(opts && opts.config);
    throw new Error('PNT_NET: transport không rõ: ' + kind);
  }

  // =====================================================================
  // SESSION — lớp dùng chung: quản lý kênh theo map, tiết chế nhịp gửi vị
  // trí bản thân, đệm + nội suy snapshot của người chơi khác.
  // =====================================================================
  function createSession(opts) {
    opts = opts || {};
    var sessMode = opts.mode || 'off';
    var rng = opts.rng || null;
    var transport = null;
    var mapId = null;
    var selfProfile = null;
    var selfState = null;
    var sendAcc = 0;
    var clock = 0; // đồng hồ phiên (giây, tích luỹ từ update) — tất định cho test
    var peers = {}; // id -> {prof, a, b, x, y, dir, moving, phase, lastSeen}
    var stats = { sent: 0, received: 0, joins: 0, leaves: 0 };

    var handlers = {
      onJoin: function (prof) {
        peers[prof.id] = {
          prof: prof, a: null, b: null,
          x: 0, y: 0, dir: 'down', moving: false, phase: 0, lastSeen: clock
        };
        stats.joins++;
      },
      onLeave: function (peerId) {
        if (peers[peerId]) { delete peers[peerId]; stats.leaves++; }
      },
      onState: function (peerId, snap) {
        var p = peers[peerId];
        if (!p) return;
        // Đóng dấu thời gian NHẬN theo đồng hồ phiên: nội suy trên trục
        // thời gian nhận này (đúng cách client thật đệm gói Realtime —
        // trễ đường truyền đã nằm trong lúc chờ gói tới).
        var stamped = { t: snap.t, rt: clock, x: snap.x, y: snap.y, dir: snap.dir, moving: snap.moving };
        p.a = p.b; p.b = stamped; p.lastSeen = clock;
        if (!p.a) { p.x = snap.x; p.y = snap.y; p.dir = snap.dir; p.moving = snap.moving; }
        stats.received++;
      }
    };

    function ensureTransport() {
      if (transport) return transport;
      if (sessMode === 'sim') transport = createSimTransport({ rng: rng || mulberry32(hashStr('pnt-sim')), maps: opts.maps });
      else if (sessMode === 'supabase') transport = createSupabaseTransport(opts.config);
      else return null;
      return transport;
    }
    function clearPeers() { peers = {}; }

    var session = {
      mode: sessMode,
      stats: stats,
      isActive: function () { return !!transport && !!mapId; },
      mapId: function () { return mapId; },
      joinMap: function (toMapId, profile) {
        if (sessMode === 'off') return false;
        var tr;
        try { tr = ensureTransport(); } catch (e) {
          if (typeof console !== 'undefined' && console.warn) console.warn('[PNT_NET] ' + e.message);
          return false;
        }
        if (!tr) return false;
        selfProfile = profile || selfProfile;
        if (mapId && mapId !== toMapId) { tr.leave(); clearPeers(); }
        mapId = toMapId;
        tr.join(toMapId, selfProfile, handlers);
        return true;
      },
      leaveMap: function () {
        if (transport) transport.leave();
        clearPeers();
        mapId = null;
      },
      setSelf: function (state) { selfState = state; },
      update: function (dt) {
        if (!transport || !mapId) return;
        clock += dt;
        // Gửi vị trí bản thân tiết chế ở SEND_HZ (không gửi mỗi frame).
        if (selfState) {
          sendAcc += dt;
          var period = 1 / SEND_HZ;
          if (sendAcc >= period) {
            sendAcc = sendAcc % period;
            transport.sendState({
              t: clock, x: selfState.x, y: selfState.y,
              dir: selfState.dir, moving: selfState.moving
            });
            stats.sent++;
          }
        }
        transport.update(dt);
        if (transport.stats) { stats.received = transport.stats.received; stats.joins = transport.stats.joins; stats.leaves = transport.stats.leaves; }
        // Nội suy vị trí render tại (clock - INTERP_DELAY) giữa 2 snapshot.
        var rt = clock - INTERP_DELAY;
        Object.keys(peers).forEach(function (id) {
          var p = peers[id];
          if (!p.b) return;
          var ox = p.x, oy = p.y;
          if (p.a && p.b.rt > p.a.rt) {
            var f = (rt - p.a.rt) / (p.b.rt - p.a.rt);
            f = f < 0 ? 0 : (f > 1 ? 1 : f);
            p.x = p.a.x + (p.b.x - p.a.x) * f;
            p.y = p.a.y + (p.b.y - p.a.y) * f;
          } else {
            p.x = p.b.x; p.y = p.b.y;
          }
          p.dir = p.b.dir;
          p.moving = p.b.moving;
          var moved = Math.sqrt((p.x - ox) * (p.x - ox) + (p.y - oy) * (p.y - oy));
          if (dt > 0) p.phase += (moved / dt) * dt / 3.6; // pha đi theo quãng đường render
        });
      },
      // Trạng thái render của người chơi khác (đã nội suy) cho game.js vẽ.
      peers: function () {
        return Object.keys(peers).map(function (id) {
          var p = peers[id];
          return {
            id: id, name: p.prof.name, realm: p.prof.realm,
            gender: p.prof.gender, origin: p.prof.origin, sim: !!p.prof.sim,
            x: p.x, y: p.y, dir: p.dir, moving: p.moving, phase: p.phase,
            hasPos: !!p.b
          };
        }).filter(function (p) { return p.hasPos; });
      },
      peerCount: function () { return Object.keys(peers).length; },
      dispose: function () {
        if (transport) { transport.dispose(); transport = null; }
        clearPeers(); mapId = null;
      }
    };
    return session;
  }

  // Singleton cho trình duyệt: game.js gọi lười biếng, hỏng cấu hình thì
  // trả null + log 1 lần (game tiếp tục chơi đơn, không sập).
  var _session = null, _sessionWarned = false;
  function getSession() {
    var m = mode();
    if (m === 'off') { if (_session) { _session.dispose(); _session = null; } return null; }
    if (_session && _session.mode === m) return _session;
    if (_session) { _session.dispose(); _session = null; }
    try {
      _session = createSession({ mode: m });
    } catch (e) {
      if (!_sessionWarned && typeof console !== 'undefined' && console.warn) {
        console.warn('[PNT_NET] ' + e.message + ' — tiếp tục chơi đơn offline.');
        _sessionWarned = true;
      }
      return null;
    }
    return _session;
  }

  var api = {
    VERSION: 'net-v1',
    FLAG_KEY: FLAG_KEY,
    SEND_HZ: SEND_HZ,
    INTERP_DELAY: INTERP_DELAY,
    PEER_MIN: PEER_MIN, PEER_MAX: PEER_MAX,
    mode: mode, setMode: setMode, enabled: enabled,
    createTransport: createTransport,
    createSupabaseTransport: createSupabaseTransport,
    createSession: createSession,
    getSession: getSession,
    SIM_NAMES: SIM_NAMES,
    _hashStr: hashStr, _mulberry32: mulberry32
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_NET = api;
  else if (typeof globalThis !== 'undefined') globalThis.PNT_NET = api;
})();
