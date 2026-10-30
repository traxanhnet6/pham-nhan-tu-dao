// Phàm Nhân Tu Đạo — js/anticheat.js — HỆ THỐNG CHỐNG HACK (phía client).
//
// Lệnh Bui 06:41 ngày 2026-10-30: "Thêm hệ thống chống hack". Game hiện
// chạy OFFLINE (tài khoản local, save ở localStorage, logic ở client)
// nên hệ này gồm 5 lớp bảo vệ NGAY trên client + đường nâng cấp
// server-validation khi bật online (xem docs/anti-cheat.md):
//
//   (a) CHỮ KÝ SAVE — mỗi bản save được ký SHA-256 (hàm băm sẵn có của
//       logic.js) trên nội dung chuẩn hoá + muối theo tài khoản. Lưu thì
//       ký, nạp thì kiểm: save bị sửa tay (Linh Thạch/chỉ số/item) bị
//       phát hiện ngay.
//   (b) SNAPSHOT DỰ PHÒNG — giữ vòng 3 bản save HỢP LỆ gần nhất ở khoá
//       riêng. Save chính hỏng chữ ký -> khôi phục bản hợp lệ gần nhất
//       và game.js THÔNG BÁO cho người chơi (không âm thầm xoá nhân
//       vật). Save cũ chưa có chữ ký (trước đợt này) được CHẤP NHẬN 1
//       lần rồi ký lại nâng cấp — không bao giờ làm mất save hiện có.
//   (c) KIỂM HỢP LỆ KHI NẠP — đối chiếu dữ liệu game thật: item lạ bị
//       loại, tầng vượt mốc nhiệm vụ bị hạ về mức hợp lệ, lệnh bài tông
//       môn khi chưa bái sư bị loại, Linh Thạch/tu vi âm hoặc vượt trần
//       vô lý bị kẹp. Mọi lần sửa đều ghi log vào save.
//   (d) TRẦN BIẾN ĐỘNG — các đường cộng Linh Thạch/tu vi chính đi qua
//       guardGain() với trần theo nguồn (số trần bám docs/economy.md +
//       dữ liệu rơi/thưởng thật). 1 lần cộng vượt trần -> kẹp + log.
//   (e) CHỐNG LÙI GIỜ — đồng hồ đơn điệu theo mẫu của động phủ
//       (effNow = max(now, mốc lớn nhất đã thấy)) dùng cho các cổng
//       theo giờ thật: phiên bí cảnh, đấu giá, thú triều, bảng mùa,
//       hồi sinh boss, vết nứt.
//
// GIỚI HẠN NÓI THẲNG: đây là client-only — người chơi mở được mã nguồn
// thì cuối cùng vẫn sửa được cả chữ ký. Các lớp trên chặn sửa save tay/
// công cụ phổ thông và tự bảo vệ dữ liệu khi save hỏng; chống hack
// TUYỆT ĐỐI chỉ có khi validate chuyển lên server (RLS/RPC — đã phác
// trong docs/anti-cheat.md mục "khi online bật", KHÔNG tự bật ở đây).
//
// Module thuần logic, nạp SAU logic.js (cần PNT_LOGIC.sha256Hex), test
// bằng node như mọi module khác (mục "AHACK:" trong test-smoke.js).
(function (global) {
  'use strict';

  var VERSION = 2;              // phiên bản phong bì save đã ký
  var LOG_MAX = 30;             // tối đa số dòng log vi phạm giữ trong save
  var PENDING_MAX = 50;         // tối đa vi phạm chờ ghi vào save
  var SNAP_COUNT = 3;           // số snapshot dự phòng giữ vòng
  var LT_HARD_CAP = 100000000;  // trần vô lý của Linh Thạch khi nạp (thu nhập giờ cao nhất ~1700 LT -> 100 triệu ≈ 58.000 giờ chơi)
  var STACK_CAP = 99999;        // trần số lượng 1 chồng vật phẩm khi nạp

  // Trần 1 LẦN CỘNG theo nguồn — căn cứ docs/economy.md + dữ liệu thật:
  //   quest     300  = NV thưởng LT lớn nhất (q_vet_nut_4)
  //   questTuVi 150  = NV thưởng tu vi lớn nhất 120 + biên
  //   monster   1000 = boss thế giới phẳng 600 x (1 + ltPct trần 60%) = 960
  //   realm     250  = trần ECO mỗi dòng LT bí cảnh (dữ liệu thật max 240)
  //   realmTuVi 320  = dòng tu vi bí cảnh lớn nhất 300 + biên
  //   tourn     3000 = Đại Hội Trúc Cơ quán quân
  //   tide      400  = Thú Triều thắng trọn 6 đợt: 40x6 + 160
  //   escort    200  = Hộ Tống full công 180 (90 + 10 x tầng 9)
  //   season    400  = thưởng hạng 1 cuối mùa
  //   sectRank  400  = thưởng LT thăng cấp bậc đệ tử cao nhất
  //   sell      1300 = giá thu mua cao nhất (pháp bảo 1250 / vũ khí 1200)
  //   codex     200  = mốc Đồ Giám lớn nhất 150 (js/bestiary.js)
  var GAIN_CAPS = {
    quest: 300, questTuVi: 150, monster: 1000, realm: 250, realmTuVi: 320,
    tourn: 3000, tide: 400, escort: 200, season: 400, sectRank: 400, sell: 1300,
    codex: 200, gift: 200
  };

  // ---------- Tra cứu lười các module khác (mẫu chung của dự án) ----------
  function logicApi() { return global.PNT_LOGIC || null; }
  function weaponsApi() { return global.PNT_WEAPONS || null; }
  function artifactsApi() { return global.PNT_ARTIFACTS || null; }
  function wardrobeApi() { return global.PNT_WARDROBE || null; }
  function sha256(str) {
    var L = logicApi();
    return (L && typeof L.sha256Hex === 'function') ? L.sha256Hex(str) : null;
  }

  // ---------- JSON chuẩn hoá (khóa sắp xếp đệ quy) để ký ổn định ----------
  function canonical(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
    if (Array.isArray(v)) {
      var parts = [];
      for (var i = 0; i < v.length; i++) parts.push(canonical(v[i] === undefined ? null : v[i]));
      return '[' + parts.join(',') + ']';
    }
    var keys = Object.keys(v).filter(function (k) { return v[k] !== undefined && typeof v[k] !== 'function'; }).sort();
    var out = [];
    for (var j = 0; j < keys.length; j++) out.push(JSON.stringify(keys[j]) + ':' + canonical(v[keys[j]]));
    return '{' + out.join(',') + '}';
  }

  // ---------- Log vi phạm: chờ trong bộ nhớ, dồn vào save khi lưu ----------
  var pending = [];
  function noteViolation(kind, detail) {
    pending.push({ kind: String(kind || 'unknown'), detail: String(detail == null ? '' : detail) });
    if (pending.length > PENDING_MAX) pending.splice(0, pending.length - PENDING_MAX);
  }
  function pendingCount() { return pending.length; }
  function drainPending() { var p = pending; pending = []; return p; }
  // Meta chống hack nằm trong flags (được ký cùng toàn bộ save):
  // flags.ahack = { log: [{kind, detail, at}], clock: { maxSeen } }
  function ensureMeta(flags) {
    if (!flags || typeof flags !== 'object') return null;
    if (!flags.ahack || typeof flags.ahack !== 'object') flags.ahack = {};
    if (!Array.isArray(flags.ahack.log)) flags.ahack.log = [];
    if (!flags.ahack.clock || typeof flags.ahack.clock !== 'object') flags.ahack.clock = { maxSeen: 0 };
    if (typeof flags.ahack.clock.maxSeen !== 'number' || !isFinite(flags.ahack.clock.maxSeen)) flags.ahack.clock.maxSeen = 0;
    return flags.ahack;
  }
  function attachLog(flags, now) {
    var meta = ensureMeta(flags);
    if (!meta) { return 0; }
    var moved = 0;
    while (pending.length) {
      var p = pending.shift();
      meta.log.push({ kind: p.kind, detail: p.detail, at: (typeof now === 'number' && isFinite(now)) ? now : 0 });
      moved++;
    }
    if (meta.log.length > LOG_MAX) meta.log.splice(0, meta.log.length - LOG_MAX);
    return moved;
  }
  function logOf(flags) {
    var meta = flags && flags.ahack;
    return (meta && Array.isArray(meta.log)) ? meta.log : [];
  }

  // ---------- (e) Đồng hồ đơn điệu (mẫu effNow của động phủ) ----------
  // Trả về mốc giờ hiệu dụng KHÔNG BAO GIỜ lùi dưới mốc lớn nhất từng
  // thấy trong save này; gọi bản Now thì đồng thời nâng mốc đã thấy.
  function clockNow(flags, now) {
    var n = (typeof now === 'number' && isFinite(now)) ? now : Date.now();
    var meta = ensureMeta(flags);
    if (!meta) return n;
    if (n > meta.clock.maxSeen) meta.clock.maxSeen = n;
    return Math.max(n, meta.clock.maxSeen);
  }
  function clockPeek(flags, now) {
    var n = (typeof now === 'number' && isFinite(now)) ? now : Date.now();
    var meta = flags && flags.ahack && flags.ahack.clock;
    var seen = (meta && typeof meta.maxSeen === 'number' && isFinite(meta.maxSeen)) ? meta.maxSeen : 0;
    return Math.max(n, seen);
  }

  // ---------- (a) Chữ ký save ----------
  function saltFor(account) {
    var h = sha256('pnt-ahack-v1|' + String(account == null ? '' : account));
    return h || ('pnt-ahack-v1|' + String(account == null ? '' : account));
  }
  function coreOf(env) {
    return { account: env.account, character: env.character, quests: env.quests, flags: env.flags };
  }
  function sign(account, core) {
    return sha256(saltFor(account) + '\n' + canonical(core));
  }
  // Đóng phong bì đã ký từ dữ liệu save hiện tại. Gọi TRƯỚC khi ghi:
  // dồn log vi phạm phiên này vào save + nâng mốc đồng hồ đơn điệu.
  function seal(account, data, now) {
    if (!data || !data.character) return null;
    var flags = data.flags || (data.flags = {});
    attachLog(flags, now);
    clockNow(flags, now);
    var env = { account: account, character: data.character, quests: data.quests || {}, flags: flags };
    env.ahack = { v: VERSION, sealedAt: (typeof now === 'number' && isFinite(now)) ? now : Date.now() };
    env.ahack.sig = sign(account, coreOf(env));
    return env;
  }
  // Phân loại 1 bản save thô: 'ok' (ký đúng) | 'legacy' (chưa ký, từ
  // trước đợt chống hack) | 'tampered' (có ký nhưng sai) | 'invalid'.
  function classify(account, raw) {
    if (typeof raw !== 'string' || !raw) return { status: 'invalid' };
    var obj = null;
    try { obj = JSON.parse(raw); } catch (e) { return { status: 'invalid' }; }
    if (!obj || typeof obj !== 'object' || !obj.character || typeof obj.character !== 'object') return { status: 'invalid' };
    if (obj.account != null && String(obj.account) !== String(account)) return { status: 'tampered', env: obj };
    if (obj.ahack && typeof obj.ahack.sig === 'string') {
      var expect = sign(account, coreOf(obj));
      if (expect && expect === obj.ahack.sig) return { status: 'ok', env: obj };
      return { status: 'tampered', env: obj };
    }
    return { status: 'legacy', env: obj };
  }

  // ---------- (b) Snapshot dự phòng (vòng 3 bản hợp lệ gần nhất) ----------
  // Khoá lưu PHẢI khớp game.js: save chính 'pnt-save-' + tài khoản,
  // snapshot thêm hậu tố '#ah1'..'#ah3' (1 = gần nhất).
  function mainKey(account) { return 'pnt-save-' + account; }
  function snapKey(account, i) { return 'pnt-save-' + account + '#ah' + i; }
  function storeGet(store, k) { try { return store.getItem(k); } catch (e) { return null; } }
  function storeSet(store, k, v) { try { store.setItem(k, v); return true; } catch (e) { return false; } }
  // Ghi save mới: bản chính CŨ chỉ được đẩy vào vòng snapshot khi nó
  // còn hợp lệ (ok/legacy) — bản đã hỏng/tampered KHÔNG được phép làm
  // ô nhiễm kho dự phòng.
  function writeSave(store, account, env) {
    if (!store || !env) return false;
    var cur = storeGet(store, mainKey(account));
    if (cur) {
      var st = classify(account, cur).status;
      if (st === 'ok' || st === 'legacy') {
        var s2 = storeGet(store, snapKey(account, 2)); if (s2) storeSet(store, snapKey(account, 3), s2);
        var s1 = storeGet(store, snapKey(account, 1)); if (s1) storeSet(store, snapKey(account, 2), s1);
        storeSet(store, snapKey(account, 1), cur);
      } else {
        noteViolation('snapshot_skip', 'bản chính hiện tại "' + st + '" — giữ nguyên vòng snapshot cũ');
      }
    }
    return storeSet(store, mainKey(account), JSON.stringify(env));
  }
  // Đọc save: chính ok/legacy -> dùng ngay; chính hỏng -> lùi dần qua
  // snapshot 1..3, lấy bản hợp lệ gần nhất ('restored'); không còn bản
  // nào hợp lệ -> 'lost' (game.js xử lý như chưa có nhân vật, KHÔNG
  // tự xoá gì thêm).
  function readSave(store, account) {
    if (!store) return { status: 'empty' };
    var raw = storeGet(store, mainKey(account));
    if (!raw) return { status: 'empty' };
    var c = classify(account, raw);
    if (c.status === 'ok' || c.status === 'legacy') return { status: c.status, raw: raw, env: c.env };
    for (var i = 1; i <= SNAP_COUNT; i++) {
      var sraw = storeGet(store, snapKey(account, i));
      if (!sraw) continue;
      var sc = classify(account, sraw);
      if (sc.status === 'ok' || sc.status === 'legacy') {
        noteViolation('restore', 'save chính "' + c.status + '" -> khôi phục snapshot ' + i + ' ("' + sc.status + '")');
        return { status: 'restored', raw: sraw, env: sc.env, from: i, cause: c.status };
      }
    }
    noteViolation('save_lost', 'save chính "' + c.status + '", không còn snapshot hợp lệ');
    return { status: 'lost', cause: c.status };
  }

  // ---------- (d) Trần biến động ----------
  // Hàm bảo vệ MỌI đường cộng Linh Thạch/tu vi chính đi qua. Vượt trần
  // 1 lần cộng -> kẹp về trần + ghi log (không chặn cứng về 0 để người
  // chơi thật không mất trắng vì 1 lỗi dữ liệu ở nguồn thưởng).
  function guardGain(kind, amount) {
    var n = (typeof amount === 'number' && isFinite(amount)) ? amount : NaN;
    if (!(n >= 0)) {
      noteViolation('gain_invalid', String(kind) + ': lượng cộng không hợp lệ (' + String(amount) + ') -> 0');
      return 0;
    }
    var cap = GAIN_CAPS[kind];
    if (cap != null && n > cap) {
      noteViolation('gain_cap', String(kind) + ': +' + n + ' vượt trần 1 lần cộng ' + cap + ' -> kẹp ' + cap);
      return cap;
    }
    return n;
  }

  // ---------- (c) Kiểm hợp lệ khi nạp ----------
  // Sửa TẠI CHỖ data = {character, quests, flags} theo dữ liệu game
  // thật; trả về danh sách dòng sửa (đồng thời ghi vào log trong save).
  // Nguyên tắc an toàn: catalog nào chưa nạp được thì BỎ QUA kiểm tra
  // thuộc catalog đó — thà sót còn hơn xoá nhầm đồ của người chơi thật.
  function validateSave(data) {
    var fixes = [];
    if (!data || !data.character || typeof data.character !== 'object') return fixes;
    var ch = data.character;
    var qs = data.quests || {};
    var flags = data.flags || {};
    var L = logicApi();
    function fix(kind, detail) {
      fixes.push(kind + ': ' + detail);
      noteViolation('validate_' + kind, detail);
    }
    // Linh Thạch: âm/NaN -> 0; vượt trần vô lý -> kẹp.
    if (typeof ch.linhThach !== 'number' || !isFinite(ch.linhThach) || ch.linhThach < 0) {
      fix('linhThach', 'Linh Thạch không hợp lệ (' + String(ch.linhThach) + ') -> 0');
      ch.linhThach = 0;
    } else if (ch.linhThach > LT_HARD_CAP) {
      fix('linhThach', 'Linh Thạch vượt trần vô lý -> kẹp ' + LT_HARD_CAP);
      ch.linhThach = LT_HARD_CAP;
    }
    ch.linhThach = Math.floor(ch.linhThach);
    // Tầng Luyện Khí phải khớp mốc nhiệm vụ của BREAK_RULES (logic.js):
    // tầng 5 cần nộp q_chinh_7, tầng 7+ cần nộp q_chinh_18.
    var turned = Array.isArray(qs.turnedIn) ? qs.turnedIn : [];
    function hasTurned(id) { return turned.indexOf(id) >= 0; }
    if (typeof ch.tier === 'number' && isFinite(ch.tier)) {
      var maxTier = 9;
      if (!hasTurned('q_chinh_7')) maxTier = Math.min(maxTier, 4);
      if (!hasTurned('q_chinh_18')) maxTier = Math.min(maxTier, 6);
      if (ch.tier > maxTier) {
        fix('tier_gate', 'Luyện Khí tầng ' + ch.tier + ' vượt mốc nhiệm vụ cho phép -> hạ tầng ' + maxTier);
        ch.tier = maxTier;
      }
      if (ch.tier < 0) { fix('tier_gate', 'tầng âm -> 0'); ch.tier = 0; }
      ch.tier = Math.floor(ch.tier);
    }
    // Cảnh giới lớn (realms.js): rank 0..6, stage 0..3; Trúc Cơ trở lên
    // (rank >= 2) bắc buộc Luyện Khí tầng 9 (cổng lôi kiếp trong game).
    if (typeof ch.realmRank === 'number' && isFinite(ch.realmRank)) {
      if (ch.realmRank < 0 || ch.realmRank > 6) {
        fix('realm', 'realmRank ' + ch.realmRank + ' ngoài thang -> kẹp 0..6');
        ch.realmRank = Math.max(0, Math.min(6, Math.floor(ch.realmRank)));
      }
      if (ch.realmRank >= 2 && (ch.tier || 0) < 9) {
        fix('realm', 'đã Trúc Cơ+ nhưng Luyện Khí mới tầng ' + (ch.tier || 0) + ' -> hạ về Luyện Khí');
        ch.realmRank = (ch.tier > 0 ? 1 : 0);
        ch.stage = 0;
      }
    }
    if (typeof ch.stage === 'number' && isFinite(ch.stage) && (ch.stage < 0 || ch.stage > 3)) {
      fix('realm', 'stage ' + ch.stage + ' ngoài 0..3 -> kẹp');
      ch.stage = Math.max(0, Math.min(3, Math.floor(ch.stage)));
    }
    // Đồng bộ thang tầng rồi kẹp tu vi/HP theo trần thật của nhân vật.
    if (L && typeof L.syncTier === 'function') { try { L.syncTier(ch); } catch (e) {} }
    if (typeof ch.tuVi !== 'number' || !isFinite(ch.tuVi) || ch.tuVi < 0) {
      fix('tuVi', 'tu vi không hợp lệ (' + String(ch.tuVi) + ') -> 0');
      ch.tuVi = 0;
    } else if (typeof ch.tuViMax === 'number' && isFinite(ch.tuViMax) && ch.tuVi > ch.tuViMax) {
      fix('tuVi', 'tu vi vượt trần tầng (' + ch.tuVi + '/' + ch.tuViMax + ') -> kẹp');
      ch.tuVi = ch.tuViMax;
    }
    // Chỉ số gốc: NaN/âm là hỏng chắc chắn -> trả về gốc theo xuất thân.
    var origin = (L && L.ORIGINS && ch.origin && L.ORIGINS[ch.origin]) ? L.ORIGINS[ch.origin] : null;
    [['atk', 'atk'], ['def', 'def'], ['maxHp', 'hp']].forEach(function (pair) {
      var k = pair[0];
      if (typeof ch[k] !== 'number' || !isFinite(ch[k]) || ch[k] < 0) {
        fix('stat', k + ' không hợp lệ -> gốc xuất thân');
        ch[k] = origin ? origin[pair[1]] : (k === 'maxHp' ? 100 : 10);
      }
    });
    if (typeof ch.hp === 'number' && isFinite(ch.hp)) {
      var capHp = null;
      if (L && typeof L.effMaxHp === 'function') { try { capHp = L.effMaxHp(ch); } catch (e) { capHp = null; } }
      if (capHp == null && typeof ch.maxHp === 'number') capHp = ch.maxHp;
      if (ch.hp < 0) { fix('stat', 'HP âm -> 0'); ch.hp = 0; }
      else if (capHp != null && ch.hp > capHp) { fix('stat', 'HP vượt trần ' + capHp + ' -> kẹp'); ch.hp = capHp; }
    }
    // Túi đồ: đối chiếu catalog thật (ITEMS + mã lễ của wardrobe;
    // mục có cờ w = vũ khí, cờ a = pháp bảo — gồm cả pháp bảo lễ).
    if (Array.isArray(ch.inventory)) {
      var W = weaponsApi(), A = artifactsApi(), WD = wardrobeApi();
      var items = L ? L.ITEMS : null;
      var festTokens = WD ? WD.FEST_TOKENS : null;
      var festArts = WD ? WD.FEST_ARTIFACTS : null;
      var joined = (typeof flags.sectJoined === 'string' && flags.sectJoined) ? flags.sectJoined : null;
      var kept = [];
      ch.inventory.forEach(function (it) {
        if (!it || typeof it !== 'object' || typeof it.id !== 'string') {
          fix('item_shape', 'mục túi hỏng (thiếu id) -> loại');
          return;
        }
        if (it.w) {
          if (W && W.WEAPONS && !W.WEAPONS[it.id]) { fix('item_unknown', 'vũ khí lạ "' + it.id + '" -> loại'); return; }
          it.count = 1;
          kept.push(it);
          return;
        }
        if (it.a) {
          if (A && A.ARTIFACTS && !A.ARTIFACTS[it.id] && !(festArts && festArts[it.id])) { fix('item_unknown', 'pháp bảo lạ "' + it.id + '" -> loại'); return; }
          it.count = 1;
          kept.push(it);
          return;
        }
        if (items && !items[it.id] && !(festTokens && festTokens[it.id])) {
          fix('item_unknown', 'vật phẩm lạ "' + it.id + '" -> loại');
          return;
        }
        // Lệnh bài tông môn: chỉ hợp lệ với tông đã bái nhập; riêng
        // lệnh bài Thanh Phong là vật cốt truyện (thưởng q_chinh_8
        // TRƯỚC khi bái sư) nên luôn được giữ.
        if (it.id.indexOf('lenh_bai_') === 0) {
          var sect = it.id.slice('lenh_bai_'.length);
          if (sect !== 'thanh_phong' && sect !== joined) {
            fix('sect_token', 'lệnh bài "' + it.id + '" khi chưa bái nhập tông tương ứng -> loại');
            return;
          }
        }
        if (typeof it.count !== 'number' || !isFinite(it.count) || it.count < 1) {
          fix('item_count', '"' + it.id + '" số lượng hỏng -> loại');
          return;
        }
        if (it.count > STACK_CAP) {
          fix('item_count', '"' + it.id + '" x' + it.count + ' vượt trần chồng -> kẹp ' + STACK_CAP);
          it.count = STACK_CAP;
        }
        it.count = Math.floor(it.count);
        kept.push(it);
      });
      ch.inventory = kept;
    }
    if (data.flags && typeof data.flags === 'object') attachLog(data.flags);
    return fixes;
  }

  var api = {
    VERSION: VERSION, LOG_MAX: LOG_MAX, SNAP_COUNT: SNAP_COUNT,
    LT_HARD_CAP: LT_HARD_CAP, STACK_CAP: STACK_CAP, GAIN_CAPS: GAIN_CAPS,
    canonical: canonical, saltFor: saltFor, sign: sign, seal: seal, classify: classify,
    mainKey: mainKey, snapKey: snapKey, writeSave: writeSave, readSave: readSave,
    guardGain: guardGain, validateSave: validateSave,
    clockNow: clockNow, clockPeek: clockPeek,
    noteViolation: noteViolation, pendingCount: pendingCount, drainPending: drainPending,
    ensureMeta: ensureMeta, attachLog: attachLog, logOf: logOf
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.PNT_ANTICHEAT = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
