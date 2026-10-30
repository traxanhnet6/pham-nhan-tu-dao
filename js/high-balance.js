// Phàm Nhân Tu Đạo — CÂN BẰNG CHẶNG CAO (js/high-balance.js, mục 28 hàng chờ).
//
// NỢ ĐÃ GHI NHẬN (lượt 03:16 ngày 2026-10-31): quái map 8–14 vẫn mang chỉ
// số gốc Luyện Khí (Sói Rừng 55 HP / công 8, Lợn Mông Sắt 110 HP / công 12
// — js/logic.js MONSTERS), trong khi nhu cầu tu vi thang cao tăng ~×3 mỗi
// cảnh giới (js/realms.js HIGH.needs: Trúc Cơ tổng 15300, Kim Đan 45500,
// Nguyên Anh 135000, Hóa Thần 394000, Độ Kiếp 735000) còn nguồn tu vi thì
// vẫn cỡ Luyện Khí (thổ nạp 1/giây, hạ quái ngoài vòng trận kỳ = 0 tu vi).
// Hậu quả trước lượt này: quái chặng cao bị một đòn hạ, mà một tiểu giai
// Độ Kiếp chỉ riêng thổ nạp đã tốn 50–87 giờ — gian nan thành phi lý.
//
// PHƯƠNG ÁN (không làm dễ, không sửa số economy cũ nào khác):
//   1. Quái HOANG DÃ ở map có realmRank >= 2 nhân chỉ số theo thang ×2 mỗi
//      bậc: HP ×6/12/24/48/96, công ×2/4/8/16/32 (Trúc Cơ → Độ Kiếp).
//      Neo theo sức người chơi cùng bậc: công người chơi cũng roughly ×2
//      mỗi cảnh giới (tăng trưởng realms.js + vũ khí), nên thời gian hạ
//      một con giữ ~4–10 đòn như chặng thấp; quái đánh trúng ~3–5% HP
//      người chơi cùng bậc — đau nhưng không một đòn chết.
//   2. Hạ quái hoang dã ở map realmRank >= 2 cho tu vi theo thang ×2 mỗi
//      bậc: 4/8/16/32/64 tu vi/con. Đây là NGOẠI LỆ CÓ CHỦ ĐÍCH cho luật
//      chung "hạ quái không cho tu vi" (chỉ áp map 8+, quái hoang dã —
//      boss thế giới, quái sự kiện/hộ tống/thú triều/bí cảnh KHÔNG tính,
//      bí cảnh giữ thang thưởng riêng của secret-realms.js).
//      Với nhịp 6 con/phút, một tiểu giai tốn 2,7h (Trúc Cơ) → 10,6h
//      (Độ Kiếp) nếu CHỈ farm quái; trộn thêm thổ nạp 3600/giờ thì còn
//      ít hơn — vẫn gian nan gấp nhiều lần một tầng Luyện Khí (~0,3h
//      thổ nạp thuần) nhưng không còn là 50–87 giờ.
//   3. Linh Thạch rơi của quái hoang dã chặng cao nhân nhẹ ×2/3/4/5/6 để
//      Linh Thạch/giờ không tụt khi quái khỏe lên; trần anticheat đường
//      'monster' (1000) vẫn không chạm tới: tối đa Lợn Mông Sắt tinh anh
//      map 14 = 8 × 6 × 5 = 240, ×1,6 Tụ Bảo Bồn = 384.
//   4. Quái đã nhân chỉ số giữ nguyên chỉ số khi hồi sinh (game.js lưu
//      baseMaxHp lúc spawn; đường hồi sinh ưu tiên baseMaxHp).
(function () {
  'use strict';

  // RANK_ROWS[rank] — rank = realmRank của MAP (không phải của người chơi).
  var RANK_ROWS = {
    2: { hp: 6, atk: 2, lt: 2, tuVi: 4 },
    3: { hp: 12, atk: 4, lt: 3, tuVi: 8 },
    4: { hp: 24, atk: 8, lt: 4, tuVi: 16 },
    5: { hp: 48, atk: 16, lt: 5, tuVi: 32 },
    6: { hp: 96, atk: 32, lt: 6, tuVi: 64 }
  };

  function rowForRank(rank) { return RANK_ROWS[rank] || null; }

  // rank của map qua mapsApi (PNT_MAPS): map.realm -> REALMS.rank;
  // fallback reqRealm.rank cho map builder cũ chưa giữ realm.
  function rankOfMap(mapId, mapsApi) {
    if (!mapsApi || !mapsApi.MAPS) return 0;
    var mp = mapsApi.MAPS[mapId];
    if (!mp) return 0;
    if (typeof mapsApi.realmById === 'function' && mp.realm) {
      var r = mapsApi.realmById(mp.realm);
      if (r) return r.rank;
    }
    if (mp.reqRealm && typeof mp.reqRealm.rank === 'number') return mp.reqRealm.rank;
    return 0;
  }

  function rowForMap(mapId, mapsApi) { return rowForRank(rankOfMap(mapId, mapsApi)); }

  // Nhân chỉ số quái hoang dã theo map. base = { hp, atk } HIỆN TẠI của
  // quái (đã qua lăn tinh anh nếu có) — trả về chỉ số đã nhân.
  function scaleStats(base, mapId, mapsApi) {
    var row = rowForMap(mapId, mapsApi);
    if (!row) return { maxHp: base.hp, atk: base.atk };
    return {
      maxHp: Math.max(1, Math.round(base.hp * row.hp)),
      atk: Math.max(1, Math.round(base.atk * row.atk))
    };
  }

  // Tu vi cho MỘT con quái hoang dã hạ ở map này (0 nếu map chặng thấp).
  function tuViForMap(mapId, mapsApi) {
    var row = rowForMap(mapId, mapsApi);
    return row ? row.tuVi : 0;
  }

  // Hệ số nhân Linh Thạch rơi của quái hoang dã ở map này (1 nếu thấp).
  function ltMultForMap(mapId, mapsApi) {
    var row = rowForMap(mapId, mapsApi);
    return row ? row.lt : 1;
  }

  // Ước lượng giờ farm quái thuần cho một tiểu giai: need tu vi, nhịp giết
  // con/phút. Dùng cho test + tài liệu, không dùng trong game.
  function stageHours(need, mapId, mapsApi, killsPerMin) {
    var tv = tuViForMap(mapId, mapsApi);
    if (!tv || !killsPerMin) return Infinity;
    return need / (tv * killsPerMin * 60);
  }

  var api = {
    RANK_ROWS: RANK_ROWS, rowForRank: rowForRank, rankOfMap: rankOfMap,
    rowForMap: rowForMap, scaleStats: scaleStats, tuViForMap: tuViForMap,
    ltMultForMap: ltMultForMap, stageHours: stageHours
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.PNT_HIGHBAL = api;
})();
