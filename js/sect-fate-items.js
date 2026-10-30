// Phàm Nhân Tu Đạo — VẬT KÝ DANH CỦA KỲ NGỘ TÔNG NHÓM 1 + NHÓM 2
// (mục 22–23 hàng chờ, docs/origins-and-encounters.md mục 4.1–4.10).
//
// Vì sao KHÔNG nằm trong danh mục gốc: danh mục gốc bị khóa số bởi
// test (30 vũ khí = 5 loại × 6 phẩm; 16 pháp bảo gốc) — đúng tiền lệ
// pháp bảo lễ của js/wardrobe.js, vật ký danh đăng ký ở module riêng
// này rồi MERGE vào PNT_WEAPONS / PNT_ARTIFACTS lúc nạp module
// (idempotent, không ghi đè món đã có). Nạp SAU weapons.js +
// artifacts.js, TRƯỚC game.js (index.html). Icon: vũ khí dùng lưới
// pixel theo loại/phẩm sẵn có của weapons.js; pháp bảo dùng lưới
// shape sẵn có của artifacts.js ở mức Thấp, ảnh riêng ở
// assets/artifacts-ai|md/<id>.png ở mức Cao/Trung bình (drawIconArt
// tự nạp theo id, không cần sửa js/artifact-ai.js — đúng mẫu lễ).
//
// Chỉ số: chép đúng món cùng phẩm sẵn có (xem từng món); noSell:
// vật ký danh không bán được — đường bán của weapons.js /
// artifacts.js đã chặn def.noSell (lý do 'nosell').
(function () {
  'use strict';
  var W = null, ART = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { W = require('./weapons.js'); } catch (e) { W = null; }
    try { ART = require('./artifacts.js'); } catch (e) { ART = null; }
  } else if (typeof window !== 'undefined') {
    W = window.PNT_WEAPONS || null;
    ART = window.PNT_ARTIFACTS || null;
  }
  // Thanh Phong Cổ Kiếm: chép đúng kiếm Huyền (atk 11, reqTier 2,
  // value 260); hệ nguyên tố đổi sang Phong 12 cho hợp Thanh Phong,
  // trị số giữ nguyên 12 như Huyền Băng Kiếm (Băng 12).
  var SECT_WEAPONS = {
    thanh_phong_co_kiem: { id: 'thanh_phong_co_kiem', type: 'kiem', grade: 'huyen', name: 'Thanh Phong Cổ Kiếm', atk: 11, reqTier: 2, price: 0, value: 260, noSell: true,
      stats: { elem: { phong: 12 } },
      desc: 'Kiếm của tổ sư Thanh Phong Phái rút khỏi bia kiếm trong Kiếm Mộ Sau Núi. Lưỡi kiếm nhẹ như gió núi, chỉ chịu nhận người biết đứng chắn trước người khác.' }
  };
  // Ngũ Hành Luân: chép đúng Dây Trói Tiên (Huyền, value 250,
  // fx bind 18% / 1,6 giây, speed 5), hình vòng ngũ hành.
  // Thiên Công Cổ Ấn: chép đúng Ấn Trấn Sơn (Địa, value 560,
  // vs_boss 18%, hp 30, lifesteal 5).
  var SECT_ARTIFACTS = {
    ngu_hanh_luan: { id: 'ngu_hanh_luan', kind: 'phap', shape: 'vong', grade: 'huyen', name: 'Ngũ Hành Luân', reqTier: 2, price: 0, value: 250, noSell: true,
      fx: { kind: 'bind', chance: 0.18, dur: 1.6, bossDur: 0.6 },
      stats: { speed: 5 },
      fxText: 'Đòn đánh có 18% xoay luân trói quái 1,6 giây (boss cũng bị trói 0,6 giây).',
      desc: 'Vòng ngũ hành vớt từ Pháp Đàn Cổ Dưới Hồ, năm màu chuyển nhau không dứt. Đàn cổ đo linh mạch bằng nó, nay nó theo người dẫn khí đúng thứ tự sinh khắc.' },
    thien_cong_co_an: { id: 'thien_cong_co_an', kind: 'phap', shape: 'an', grade: 'dia', name: 'Thiên Công Cổ Ấn', reqTier: 3, price: 0, value: 560, noSell: true,
      fx: { kind: 'vs_boss', pct: 18, llOnKill: 4 },
      stats: { hp: 30, lifesteal: 5 },
      fxText: 'Thêm 18% sát thương lên boss và quái tinh anh. Hạ một quái hồi 4 linh lực.',
      desc: 'Cổ ấn rèn từ phôi thép lạ trăm năm trong Lò Rèn Của Tiền Nhân — thép ấn cổ mà Thiên Công Phường đã tìm ba đời, nay thành ấn theo tay người rèn tiếp.' },
    // Nhóm 2 (mục 23): mỗi món chép đúng 1 món Huyền sẵn có, không món
    // nào trùng nguồn chép với nhau — 4 món Huyền gốc (Chuông, Dây,
    // Thần Hành Bội, Tụ Bảo Bồn) ánh xạ 1–1 sang 4 món ký danh mới.
    // Chu Sa Cổ Bút: chép Dây Trói Tiên (Huyền, value 250, bind 18% /
    // 1,6 giây, speed 5) — bút vẽ phù trói như dây trói.
    chu_sa_co_but: { id: 'chu_sa_co_but', kind: 'phap', shape: 'boi', grade: 'huyen', name: 'Chu Sa Cổ Bút', reqTier: 2, price: 0, value: 250, noSell: true,
      fx: { kind: 'bind', chance: 0.18, dur: 1.6, bossDur: 0.6 },
      stats: { speed: 5 },
      fxText: 'Đòn đánh có 18% phóng nét bùa trói quái 1,6 giây (boss cũng bị trói 0,6 giây).',
      desc: 'Bút chu sa vẽ nên nét cuối của Phù Trận Tàn Trong Động. Nét bút ngay thì trấn được tà — và trói được cả quái dám tới gần.' },
    // Cửu Cung Bàn: chép Chuông Trấn Hồn (Huyền, value 240, stun_react
    // 20% / 0,8 giây bán kính 70, def 2) — trận đồ phản chấn khi bị đánh.
    cuu_cung_ban: { id: 'cuu_cung_ban', kind: 'phap', shape: 'vong', grade: 'huyen', name: 'Cửu Cung Bàn', reqTier: 2, price: 0, value: 240, noSell: true,
      fx: { kind: 'stun_react', chance: 0.20, dur: 0.8, radius: 70 },
      stats: { def: 2 },
      fxText: 'Khi bị đánh, 20% trận bàn tự chấn: quái quanh bạn choáng 0,8 giây.',
      desc: 'Bàn trận cửu cung lấy từ Trận Đồ Trong Hang Sâu — bản nháp của trận trấn linh nhãn, Cửu Cung chỉ là người giữ bản chép.' },
    // Ngũ Độc Nguyệt Hoàn: chép Thần Hành Bội (Huyền, value 230,
    // speed 10) — hoàn nguyệt nhẹ thân, bước trong đầm độc không vướng.
    ngu_doc_nguyet_hoan: { id: 'ngu_doc_nguyet_hoan', kind: 'phap', shape: 'vong', grade: 'huyen', name: 'Ngũ Độc Nguyệt Hoàn', reqTier: 2, price: 0, value: 230, noSell: true,
      fx: {},
      stats: { speed: 10 },
      fxText: 'Tốc độ di chuyển tăng 10%.',
      desc: 'Nguyệt hoàn hái từ Đầm Độc Cổ cùng Độc Tâm Hoa Vương — độc thấm vào hoàn mà không thấm vào người đeo, bước chân nhẹ như đi trên mặt đầm.' },
    // Huyền Âm Cầm Huyền: chép Tụ Bảo Bồn (Huyền, value 260, dropPct
    // 25, ltPct 20, ll 15) — tiếng đàn mở vận, quái rơi nhiều hơn.
    huyen_am_cam_huyen: { id: 'huyen_am_cam_huyen', kind: 'phap', shape: 'day', grade: 'huyen', name: 'Huyền Âm Cầm Huyền', reqTier: 2, price: 0, value: 260, noSell: true,
      fx: { dropPct: 25, ltPct: 20 },
      stats: { ll: 15 },
      fxText: 'Tỉ lệ rơi vật phẩm tăng 25%, Linh Thạch rơi từ quái tăng 20% (không áp cho rơi vũ khí/pháp bảo).',
      desc: 'Dây đàn lấy từ Hàn Đàm An Hồn — khúc an hồn đã đưa 3 vong hồn về, nay dây đàn còn mở vận cho người gảy nó.' }
  };
  var _registered = false;
  function registerAll() {
    if (_registered) return true;
    if (!W || !ART) return false;
    Object.keys(SECT_WEAPONS).forEach(function (id) {
      if (!W.WEAPONS[id]) W.WEAPONS[id] = SECT_WEAPONS[id];
    });
    Object.keys(SECT_ARTIFACTS).forEach(function (id) {
      if (!ART.ARTIFACTS[id]) {
        var def = SECT_ARTIFACTS[id];
        def.icon = 'art_' + id;
        ART.ARTIFACTS[id] = def;
      }
    });
    _registered = true;
    return true;
  }
  registerAll();
  var api = { WEAPONS: SECT_WEAPONS, ARTIFACTS: SECT_ARTIFACTS, registerAll: registerAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.PNT_SECT_FATE_ITEMS = api;
})();
