// ============================================================
// SỰ KIỆN NGẪU NHIÊN THẾ GIỚI — lệnh trực tiếp của Bui 20:20
// ngày 2026-10-30 ("Hãy thêm các tính năng khác có thể xảy ra
// khi chơi game"). Số liệu chuẩn ở docs/economy.md mục 21, móc
// truyện ở docs/story-bible.md mục 51.
//
// MÓC TRUYỆN: phong ấn giếng cổ yếu dần (story-bible mục gốc) —
// linh khí rò rỉ KHÔNG đều: có lúc dồn thành điểm bùng phát, có
// lúc nuôi lớn một con vương thú lang thang; thương nhân lạ mặt
// ngửi thấy mùi linh khí mà tìm về làng; tu sĩ đi đường cũng vì
// linh khí loạn mà gặp nạn; cổ vật của người xưa bị đất trồi lên
// theo linh khí. Năm loại sự kiện dưới đây đều là hệ quả của
// cùng một vết nứt phong ấn đó, không phải phép màu rời rạc.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/market-fair.js /
// js/season-tide.js: dữ liệu + luật thuần test bằng Node,
// game.js chỉ nối tick/hạ quái/hái dược/vẽ vòng + panel):
// - Một khung lịch chung: mỗi loại có đồng hồ hẹn riêng (nextAt
//   trong save), trọng số khi nhiều loại cùng tới hạn, và LUẬT
//   CHỐNG DỒN: tại một thời điểm tối đa 1 sự kiện CÓ GIỜ đang
//   chạy; sau khi một sự kiện kết thúc có 5 phút yên ắng mới mở
//   sự kiện giờ tiếp theo. Cổ Vật Vùi Lấp là móc rơi thụ động
//   (1%), không chiếm ô sự kiện giờ.
// - Cổng chung: chỉ kích hoạt sau khi nhân vật đã LỘ LINH CĂN
//   (ch.root) — riêng Thương Nhân Thần Bí không cần linh căn
//   (buôn bán là việc của cả người phàm).
// - Trạng thái nằm trong flags.worldEvents của save (JSON
//   thuần: mốc giờ/id/tọa độ/tồn kho) — lưu giữa sự kiện rồi
//   nạp lại thì sự kiện còn nguyên với thời gian còn lại đúng;
//   hết hạn trong lúc tắt game thì lần tick đầu tự dọn.
// - Thưởng: mọi sự kiện ≤ ~150 Linh Thạch quy đổi (docs/
//   economy.md mục 21), riêng Vương Thú đi theo trần boss nhỏ
//   (≤ 600 LT/con của test ECO) như thiết kế đã chốt.
//
// 5 LOẠI:
// 1. ĐIỂM LINH KHÍ BÙNG PHÁT (20–40'): một map cày ngẫu nhiên
//    nổi vòng sáng bán kính 4 ô trong 10 phút. Hạ quái TRONG
//    vòng: nhận tu vi theo loài (nguồn tu vi hạ quái DUY NHẤT
//    của game — ngoài vòng, hạ quái vẫn không cho tu vi như
//    luật chung ở economy.md) nhân hệ số vùng ×1,3, và 10%
//    rơi thêm 1 hạt giống dược của vùng đất đó.
// 2. VƯƠNG THÚ LANG THANG (45–90'): một tinh anh đặc biệt của
//    chính loài map đó (HP ×6, công ×1,8 +6 — mạnh hơn tinh
//    anh thường ×1,8 HP/+4 công nhiều), tên "Vương Thú: <loài>",
//    sống 15 phút rồi biến mất. Hạ được: Yêu Đan theo cấp map
//    với tỉ lệ cao + Linh Thạch phẳng theo nhóm map.
// 3. THƯƠNG NHÂN THẦN BÍ (60–120'): ghé quảng trường làng
//    map 1 trong 15 phút (NPC tạm, sprite thương nhân sẵn có).
//    Bán 3 món hiếm xoay theo ngày (đan cao/bùa Huyền/hạt
//    giống hiếm — kho món sẵn có), tồn 1–2/món, giá ở module
//    này theo neo giá sẵn có của game. Ông ta cũng THU MUA
//    cổ vật (xem loại 5) với giá cố định.
// 4. TU SĨ GẶP NẠN (30–60'): điểm sáng ở một map cày; đi tới
//    gần thì mở panel lựa chọn (khung panel kỳ ngộ sẵn có):
//    CỨU = tốn 1 món hồi phục rẻ nhất đang có trong túi (không
//    có thì không chọn được) → +30 tu vi + 40 Linh Thạch và
//    một đoạn thoại; BỎ QUA = không phạt, sự kiện tan.
// 5. CỔ VẬT VÙI LẤP (thụ động): hái dược/hạ quái ở map ngoài
//    trời (map cày) có 1% thấy Đồng Tiền Cổ (60%) / Vụn Ngọc
//    Cổ (40%) — xếp chồng trong túi, bán cho Thương Nhân
//    Thần Bí với giá cố định 15 / 30 Linh Thạch.
// ============================================================
(function (global) {
  'use strict';
  var L = null, M = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { M = require('./maps.js'); } catch (e) { M = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    M = global.PNT_MAPS || null;
  }

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function mins(n) { return n * 60000; }

  // ---------- Hằng số luật ----------
  var GAP_MS = mins(5);            // yên ắng giữa hai sự kiện giờ
  var BURST_RADIUS = 4;            // bán kính vòng bùng phát (ô)
  var ZONE_TUVI_MULT = 1.3;        // hệ số tu vi trong vòng (+30%)
  var ZONE_SEED_CHANCE = 0.10;     // tỉ lệ rơi thêm hạt giống trong vòng
  var RELIC_CHANCE = 0.01;         // tỉ lệ thấy cổ vật (hạ quái/hái dược)
  var KING_HP_MULT = 6, KING_ATK_MULT = 1.8, KING_ATK_ADD = 6;
  var MONK_REWARD = { tuVi: 30, linhThach: 40 };

  var KINDS = {
    burst:    { dur: mins(10), nextMin: mins(20),  nextMax: mins(40),  weight: 35, needRoot: true },
    king:     { dur: mins(15), nextMin: mins(45),  nextMax: mins(90),  weight: 25, needRoot: true },
    merchant: { dur: mins(15), nextMin: mins(60),  nextMax: mins(120), weight: 20, needRoot: false },
    monk:     { dur: mins(15), nextMin: mins(30),  nextMax: mins(60),  weight: 20, needRoot: true }
  };
  var KIND_ORDER = ['burst', 'king', 'merchant', 'monk'];
  // Lịch lần đầu cho save mới: so le để sớm gặp mà không dồn.
  var FIRST_DELAY = { burst: mins(6), king: mins(25), merchant: mins(12), monk: mins(18) };

  var ZONE_SEEDS = ['hat_thao_duoc', 'hat_thanh_tam_thao', 'hat_linh_chi', 'hat_tu_linh_qua', 'hat_huyet_sam'];
  var RELIC_PRICES = { dong_tien_co: 15, vun_ngoc_co: 30 };
  // Món hồi phục cho đường CỨU của Tu Sĩ Gặp Nạn: RẺ NHẤT trước
  // (theo lượng hồi tăng dần) để game không ăn mất đan quý.
  var RESCUE_ITEMS = ['thit_tho', 'thit_ga', 'thao_duoc', 'hoi_khi_tan', 'thit_lon',
    'hoi_xuan_dan', 'thit_son_quan', 'dai_hoi_xuan_dan', 'sinh_co_dan', 'cuu_chuyen_hoi_hon_dan'];

  var MERCHANT_NPC_ID = 'wev_merchant';
  var MERCHANT_SPOT = { mapId: 'map1', x: 78, y: 76 }; // V7-EXPAND: (50,51)+neo map1 (28,25) — quảng trường làng, cạnh sạp chợ
  // Kho hiếm của Thương Nhân: giá neo theo giá sẵn có của game
  // (đan: nguyên liệu + phí lò ở alchemy.js; hạt: giá Động Phủ/
  // chợ phiên; phù Huyền: vốn không mua được ở đâu — chỉ chế —
  // nên giá thần bí là giá duy nhất, ghi ở economy.md mục 21).
  var MERCHANT_POOL = [
    { id: 'sinh_co_dan', price: 300, stock: 1 },
    { id: 'dai_boi_nguyen_dan', price: 320, stock: 1 },
    { id: 'dai_hoi_xuan_dan', price: 220, stock: 1 },
    { id: 'kiem_khi_phu_huyen', price: 260, stock: 1 },
    { id: 'ho_than_phu_huyen', price: 260, stock: 1 },
    { id: 'hat_ngoc_tuy_chi', price: 150, stock: 2 },
    { id: 'hat_thanh_linh_tuy', price: 200, stock: 1 },
    { id: 'van_nien_linh_chi', price: 380, stock: 1 }
  ];
  var MERCHANT_SLOTS = 3;

  // Linh Thạch phẳng + bảng Yêu Đan của Vương Thú theo nhóm map
  // (nhóm 0: map 1–3, nhóm 1: map 4–7, nhóm 2: map 8–14).
  var KING_LT = [60, 120, 240];
  var KING_YEUDAN = [
    [{ id: 'yeu_dan_1', chance: 0.80 }],
    [{ id: 'yeu_dan_2', chance: 0.30 }, { id: 'yeu_dan_1', chance: 0.50 }],
    [{ id: 'yeu_dan_3', chance: 0.10 }, { id: 'yeu_dan_2', chance: 0.50 }]
  ];

  var MONK_STORY = 'Một tu sĩ lạ mặt nằm gục ven đường, áo rách đẫm máu, hơi thở yếu ớt. Thấy bạn tới gần, người ấy thều thào: "Đạo hữu đi ngang... xin cứu ta một mạng. Ta là tán tu họ Từ, bị yêu thú rượt trong rừng, gãy mất một chân, đan dược rơi sạch dọc đường..."';
  var MONK_RESCUE_LINE = 'Nuốt xuống món hồi phục, sắc mặt người tu sĩ dần hồng lại. Ông ta chống tay ngồi dậy, chắp tay vái sâu: "Ân cứu mạng này, họ Từ ta khắc ghi. Đường tu hiểm ác, may mà còn có người như đạo hữu." Nói rồi ông chống gậy, khập khiễng đi về phía làng.';
  var MONK_IGNORE_LINE = 'Bạn lặng lẽ đi tiếp. Tiếng rên sau lưng nhỏ dần rồi tắt hẳn — đường tu vốn vậy, mỗi người một mệnh, không ai gánh hộ ai được.';

  // ---------- Map cày + loài ----------
  function farmMapIds() {
    var ids = [];
    if (M && M.MAPS) {
      Object.keys(M.MAPS).forEach(function (id) {
        var mp = M.MAPS[id];
        // CHỈ map cày map1–14: các map bí cảnh (realm_*) / động phủ /
        // đấu trường cũng có zones (quái trong cảnh) nhưng KHÔNG phải
        // map cày ngoài trời — secret-realms.js đăng ký chúng vào cùng
        // M.MAPS dùng chung nên phải loại bằng tiền tố, không chỉ
        // nhìn zones (lỗi bắt được khi chạy toàn suite: vương thú
        // rơi vào realm_dinh_ky, speciesOf rỗng).
        if (/^map([1-9]|1[0-4])$/.test(id) && mp && mp.zones && mp.zones.length) ids.push(id);
      });
      ids.sort(function (a, b) { return (parseInt(a.slice(3), 10) || 0) - (parseInt(b.slice(3), 10) || 0); });
    }
    if (!ids.length) ids = ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7', 'map8', 'map9', 'map10', 'map11', 'map12', 'map13', 'map14'];
    return ids;
  }
  function isFarmMap(mapId) { return farmMapIds().indexOf(mapId) >= 0; }
  function mapName(mapId) {
    if (M && M.MAPS && M.MAPS[mapId]) return M.MAPS[mapId].name;
    return mapId;
  }
  function speciesOf(mapId) {
    var out = [];
    if (M && M.MAPS && M.MAPS[mapId] && M.MAPS[mapId].zones) {
      M.MAPS[mapId].zones.forEach(function (z) {
        (z.types || []).forEach(function (t) { if (t !== 'son_quan' && out.indexOf(t) < 0) out.push(t); });
      });
    }
    return out;
  }
  function mapGroup(mapId) {
    var n = parseInt(String(mapId).slice(3), 10) || 1;
    return n <= 3 ? 0 : (n <= 7 ? 1 : 2);
  }
  // Ô spawn quái sẵn có của map = ô chắc chắn đứng được (quái
  // vốn đứng đó) — dùng làm tâm vòng/điểm sự kiện/sào vương thú.
  function pickSpawnTile(mapId, rng) {
    var rand = rng || Math.random;
    if (M && M.MAPS && M.MAPS[mapId] && M.MAPS[mapId].monsters && M.MAPS[mapId].monsters.length) {
      var list = M.MAPS[mapId].monsters;
      var m = list[Math.floor(rand() * list.length)];
      return { x: m.x, y: m.y };
    }
    if (M && M.MAPS && M.MAPS[mapId] && M.MAPS[mapId].start) return { x: M.MAPS[mapId].start.x, y: M.MAPS[mapId].start.y };
    return { x: 20, y: 20 };
  }

  // ---------- Trạng thái ----------
  function ensure(flags, now) {
    if (!flags) flags = {};
    if (!flags.worldEvents) {
      var st = { active: null, nextAt: {}, nextAllowedAt: 0,
        stats: { burst: 0, king: 0, merchant: 0, monk: 0, relics: 0, rescues: 0, kingKills: 0 } };
      KIND_ORDER.forEach(function (k) { st.nextAt[k] = (now || 0) + FIRST_DELAY[k]; });
      flags.worldEvents = st;
    }
    var s = flags.worldEvents;
    if (!s.nextAt) s.nextAt = {};
    KIND_ORDER.forEach(function (k) { if (s.nextAt[k] == null) s.nextAt[k] = (now || 0) + FIRST_DELAY[k]; });
    if (!s.stats) s.stats = { burst: 0, king: 0, merchant: 0, monk: 0, relics: 0, rescues: 0, kingKills: 0 };
    if (s.nextAllowedAt == null) s.nextAllowedAt = 0;
    return s;
  }
  function activeEvent(flags) {
    if (!flags || !flags.worldEvents) return null;
    return flags.worldEvents.active || null;
  }
  function gateOk(kind, ch) {
    if (!KINDS[kind].needRoot) return true;
    return !!(ch && ch.root);
  }
  function randRange(rng, a, b) { return a + Math.floor((rng || Math.random)() * (b - a + 1)); }

  // Xáo trộn gieo hạt theo ngày (cùng mẫu market-fair.rng32):
  // cùng một ngày dương lịch thì sạp thần bí bán cùng 3 món.
  function rng32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function merchantStockFor(date) {
    var d = date || new Date();
    var days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    var rng = rng32((days * 2246822519) >>> 0);
    var pool = MERCHANT_POOL.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, MERCHANT_SLOTS).map(function (p) {
      return { id: p.id, price: p.price, stock: p.stock, sold: 0 };
    });
  }

  function startEvent(s, kind, ch, now, rng, ctx) {
    var rand = rng || Math.random;
    var def = KINDS[kind];
    var ev = { kind: kind, endsAt: now + def.dur };
    if (kind === 'burst' || kind === 'king' || kind === 'monk') {
      var mapId = null;
      if (kind === 'monk' && ctx && ctx.mapId && isFarmMap(ctx.mapId)) mapId = ctx.mapId;
      else {
        var ids = farmMapIds();
        mapId = ids[Math.floor(rand() * ids.length)];
      }
      var tile = pickSpawnTile(mapId, rand);
      ev.mapId = mapId; ev.x = tile.x; ev.y = tile.y;
      if (kind === 'king') {
        var sps = speciesOf(mapId);
        ev.type = sps.length ? sps[Math.floor(rand() * sps.length)] : 'soi_con';
        ev.kingDown = false;
      }
    } else if (kind === 'merchant') {
      ev.mapId = MERCHANT_SPOT.mapId;
      ev.x = MERCHANT_SPOT.x; ev.y = MERCHANT_SPOT.y;
      ev.stock = merchantStockFor(new Date(now));
    }
    s.active = ev;
    s.nextAt[kind] = now + randRange(rand, def.nextMin, def.nextMax);
    s.stats[kind] = (s.stats[kind] || 0) + 1;
    return ev;
  }

  // Tick lịch: dọn sự kiện hết hạn + mở sự kiện mới khi tới hạn.
  // ctx: { mapId, inRealm } — trong bí cảnh thì không mở mới.
  // Trả danh sách thông báo {type:'start'|'expire', kind, event}.
  function tick(flags, ch, now, rng, ctx) {
    var s = ensure(flags, now);
    var notices = [];
    if (s.active && now >= s.active.endsAt) {
      notices.push({ type: 'expire', kind: s.active.kind, event: s.active });
      s.active = null;
      s.nextAllowedAt = now + GAP_MS;
    }
    if (!s.active && !(ctx && ctx.inRealm) && now >= (s.nextAllowedAt || 0)) {
      var due = KIND_ORDER.filter(function (k) { return s.nextAt[k] <= now && gateOk(k, ch); });
      if (due.length) {
        var rand = rng || Math.random;
        var totalW = due.reduce(function (sum, k) { return sum + KINDS[k].weight; }, 0);
        var roll = rand() * totalW, kind = due[due.length - 1];
        for (var i = 0; i < due.length; i++) { roll -= KINDS[due[i]].weight; if (roll <= 0) { kind = due[i]; break; } }
        var ev = startEvent(s, kind, ch, now, rand, ctx || {});
        notices.push({ type: 'start', kind: kind, event: ev });
      }
    }
    return notices;
  }

  // ---------- 1. Điểm linh khí bùng phát ----------
  function killInZone(flags, mapId, mx, my) {
    var ev = activeEvent(flags);
    if (!ev || ev.kind !== 'burst' || ev.mapId !== mapId) return false;
    var dx = mx - ev.x, dy = my - ev.y;
    return (dx * dx + dy * dy) <= BURST_RADIUS * BURST_RADIUS;
  }
  // Tu vi hạ quái TRONG vòng: gốc theo loài = 2 × Linh Thạch kỳ
  // vọng của loài (thước sức mạnh sẵn có của economy), nhân 1,3.
  function zoneTuViFor(type) {
    var def = (L && L.MONSTERS) ? L.MONSTERS[type] : null;
    var base = Math.max(1, Math.round((def ? num(def.linhThach, 1) : 1) * 2));
    return Math.max(1, Math.round(base * ZONE_TUVI_MULT));
  }
  function rollZoneSeed(rng) {
    var rand = rng || Math.random;
    if (rand() >= ZONE_SEED_CHANCE) return null;
    return ZONE_SEEDS[Math.floor(rand() * ZONE_SEEDS.length)];
  }

  // ---------- 2. Vương thú lang thang ----------
  function kingStats(type) {
    var def = (L && L.MONSTERS) ? L.MONSTERS[type] : null;
    if (!def) return null;
    return { name: 'Vương Thú: ' + def.name,
      maxHp: Math.round(def.hp * KING_HP_MULT),
      atk: Math.round(def.atk * KING_ATK_MULT) + KING_ATK_ADD };
  }
  function kingRewards(mapId, rng) {
    var rand = rng || Math.random;
    var g = mapGroup(mapId);
    var table = KING_YEUDAN[g];
    var dan = null;
    for (var i = 0; i < table.length; i++) {
      if (rand() < table[i].chance) { dan = table[i].id; break; }
    }
    return { linhThach: KING_LT[g], yeuDan: dan };
  }
  function noteKingKilled(flags, now, rng) {
    var s = ensure(flags, now);
    var ev = s.active;
    if (!ev || ev.kind !== 'king') return null;
    var rw = kingRewards(ev.mapId, rng);
    s.active = null;
    s.nextAllowedAt = now + GAP_MS;
    s.stats.kingKills = (s.stats.kingKills || 0) + 1;
    return { mapId: ev.mapId, type: ev.type, linhThach: rw.linhThach, yeuDan: rw.yeuDan };
  }

  // ---------- 3. Thương nhân thần bí ----------
  function merchantActive(flags, now) {
    var ev = activeEvent(flags);
    return !!(ev && ev.kind === 'merchant' && now < ev.endsAt);
  }
  function itemName(id) {
    if (L && L.ITEMS && L.ITEMS[id]) return L.ITEMS[id].name;
    return id;
  }
  function merchantSlot(flags, id) {
    var ev = activeEvent(flags);
    if (!ev || ev.kind !== 'merchant' || !ev.stock) return null;
    for (var i = 0; i < ev.stock.length; i++) if (ev.stock[i].id === id) return ev.stock[i];
    return null;
  }
  function buy(flags, ch, id, now) {
    if (!merchantActive(flags, now)) return { ok: false, reason: 'absent' };
    var slot = merchantSlot(flags, id);
    if (!slot) return { ok: false, reason: 'nostock' };
    if (slot.sold >= slot.stock) return { ok: false, reason: 'soldout' };
    if (!ch || num(ch.linhThach, 0) < slot.price) return { ok: false, reason: 'linhThach', need: slot.price };
    ch.linhThach -= slot.price;
    if (L) L.addItem(ch, id, 1);
    slot.sold += 1;
    return { ok: true, id: id, price: slot.price, name: itemName(id) };
  }
  function sellRelic(flags, ch, id, n, now) {
    if (!merchantActive(flags, now)) return { ok: false, reason: 'absent' };
    var price = RELIC_PRICES[id];
    if (!price) return { ok: false, reason: 'notrelic' };
    var owned = L && ch ? L.countItem(ch, id) : 0;
    var take = Math.min(num(n, 1), owned);
    if (take <= 0) return { ok: false, reason: 'nocount' };
    L.consumeItem(ch, id, take);
    var gain = take * price;
    ch.linhThach = num(ch.linhThach, 0) + gain;
    return { ok: true, id: id, n: take, gain: gain, price: price, name: itemName(id) };
  }

  // ---------- 4. Tu sĩ gặp nạn ----------
  function rescueItemFor(ch) {
    if (!L || !ch) return null;
    for (var i = 0; i < RESCUE_ITEMS.length; i++) {
      if (L.countItem(ch, RESCUE_ITEMS[i]) > 0) return RESCUE_ITEMS[i];
    }
    return null;
  }
  function rescue(flags, ch, now) {
    var s = ensure(flags, now);
    var ev = s.active;
    if (!ev || ev.kind !== 'monk') return { ok: false, reason: 'noevent' };
    var item = rescueItemFor(ch);
    if (!item) return { ok: false, reason: 'no_item' };
    L.consumeItem(ch, item, 1);
    s.active = null;
    s.nextAllowedAt = now + GAP_MS;
    s.stats.rescues = (s.stats.rescues || 0) + 1;
    return { ok: true, item: item, itemName: itemName(item),
      tuVi: MONK_REWARD.tuVi, linhThach: MONK_REWARD.linhThach, line: MONK_RESCUE_LINE };
  }
  function ignoreMonk(flags, now) {
    var s = ensure(flags, now);
    var ev = s.active;
    if (!ev || ev.kind !== 'monk') return { ok: false, reason: 'noevent' };
    s.active = null;
    s.nextAllowedAt = now + GAP_MS;
    return { ok: true, line: MONK_IGNORE_LINE };
  }

  // ---------- 5. Cổ vật vùi lấp (thụ động) ----------
  function rollRelic(rng) {
    var rand = rng || Math.random;
    if (rand() >= RELIC_CHANCE) return null;
    return rand() < 0.6 ? 'dong_tien_co' : 'vun_ngoc_co';
  }
  function noteRelic(flags) {
    var s = ensure(flags, 0);
    s.stats.relics = (s.stats.relics || 0) + 1;
  }

  var api = {
    KINDS: KINDS, KIND_ORDER: KIND_ORDER, GAP_MS: GAP_MS,
    BURST_RADIUS: BURST_RADIUS, ZONE_TUVI_MULT: ZONE_TUVI_MULT,
    ZONE_SEED_CHANCE: ZONE_SEED_CHANCE, RELIC_CHANCE: RELIC_CHANCE,
    RELIC_PRICES: RELIC_PRICES, RESCUE_ITEMS: RESCUE_ITEMS,
    MONK_REWARD: MONK_REWARD, MONK_STORY: MONK_STORY,
    MONK_RESCUE_LINE: MONK_RESCUE_LINE, MONK_IGNORE_LINE: MONK_IGNORE_LINE,
    MERCHANT_NPC_ID: MERCHANT_NPC_ID, MERCHANT_SPOT: MERCHANT_SPOT,
    MERCHANT_POOL: MERCHANT_POOL, KING_LT: KING_LT, KING_YEUDAN: KING_YEUDAN,
    ensure: ensure, activeEvent: activeEvent, tick: tick, gateOk: gateOk,
    farmMapIds: farmMapIds, isFarmMap: isFarmMap, mapName: mapName,
    speciesOf: speciesOf, mapGroup: mapGroup, pickSpawnTile: pickSpawnTile,
    killInZone: killInZone, zoneTuViFor: zoneTuViFor, rollZoneSeed: rollZoneSeed,
    kingStats: kingStats, kingRewards: kingRewards, noteKingKilled: noteKingKilled,
    merchantStockFor: merchantStockFor, merchantActive: merchantActive,
    merchantSlot: merchantSlot, buy: buy, sellRelic: sellRelic,
    rescueItemFor: rescueItemFor, rescue: rescue, ignoreMonk: ignoreMonk,
    rollRelic: rollRelic, noteRelic: noteRelic, itemName: itemName
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_WORLD_EVENTS = api;
})(typeof window !== 'undefined' ? window : globalThis);
