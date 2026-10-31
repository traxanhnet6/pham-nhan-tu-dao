// Phàm Nhân Tu Đạo — KHAI BÁO VÙNG PROP SỐNG (ATLAS LAB tích hợp, lệnh
// Bui 18:46 31/10/2026). File này CHỈ khai báo vùng rải prop theo loại ô
// (tile) của từng map; engine rải/vẽ/thu hoạch nằm ở js/props.js. Tọa độ
// KHÔNG gõ cứng từng prop: zone nói "map nào, loại prop nào, rải trên ô
// chữ gì, mật độ bao nhiêu" — engine tự scatter tất định (seed cố định)
// trên các ô khớp trong lưới map, nên vùng tự bám theo lưới khi map sửa.
//
// REBASE-KHI-V7: ĐÃ XONG — lưới V7 (mở rộng ×1,5) đã hạ vào js/maps.js
// (docs/map-expansion-v7.md): map 1 thành 168×150, neo lõi (28,25), ô
// ruộng 'C' tăng 309 → 544 (ruộng lõi dịch theo neo + ruộng vành mới).
// Zone bám theo ô 'C' nên tự đúng vị trí, không phải sửa tọa độ; đã đo
// lại trên lưới V7: 557 cụm ở spacing 30. Mật độ dưới đây siết theo bản
// lab v2 (gói khít hơn để lúa che qua đầu gối nhân vật): spacing 27,
// skip 0,02 → ~750 cụm map 1, số đang vẽ tệ nhất ~600/frame < ngân
// sách 700 ở mức Cao. Nếu V7 đổi ký tự ô ruộng khác 'C' thì sửa trường
// tile; nếu đổi neo nữa thì chỉ cần chạy lại test PROPS đếm lại tổng.
(function () {
  'use strict';

  var ZONES = [
    {
      // Ruộng lúa sống ở Làng Thanh Khê: toàn bộ ô ruộng 'C' của map 1
      // (ruộng lõi quanh làng + ruộng vành sau mở rộng V7) thành ruộng
      // lúa y-sort, chém/thu hoạch được như ATLAS LAB.
      id: 'map1_ruong_lua',
      map: 'map1',
      type: 'rice',
      tile: 'C',
      spacing: 27,        // px thế giới giữa 2 điểm rải (trước jitter)
      jitter: 10,         // px lệch ngẫu nhiên tất định quanh điểm lưới
      skip: 0.02,         // tỉ lệ điểm lưới bỏ qua (thưa hữu cơ, lab v2)
      seed: 31102026,
      scaleMin: 0.85,
      scaleMax: 1.30
    }
  ];

  function zonesFor(mapId) {
    var out = [];
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i].map === mapId) out.push(ZONES[i]);
    return out;
  }

  var api = { ZONES: ZONES, zonesFor: zonesFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_PROP_ZONES = api;
})();
