// Phàm Nhân Tu Đạo — HỆ NGUỒN GỐC NHÂN VẬT (mục 19 hàng chờ,
// docs/origins-and-encounters.md mục 0–1 + story-bible mục 36).
//
// NGUYÊN TẮC CHỐT (không được phá khi các mục 20–23 nối tiếp):
// - Nguồn gốc KHÔNG tạo chênh lệch sức mạnh: 12 nguồn gốc NV gắn vào
//   đúng 3 khung chỉ số ORIGINS của logic.js (nong_dan / tho_san /
//   thu_sinh); khác nhau ở lore, dấu ấn, thoại NPC và kỳ ngộ riêng.
// - storyOrigin suy ra khi tạo nhân vật: có look NV thì = look;
//   không thì 'goc_' + khung xuất thân. Save cũ thiếu trường này thì
//   ensure() suy lười theo đúng quy tắc trên khi nạp, không vỡ save.
// - Dấu ấn là vật cốt truyện (js/logic.js ITEMS, heal 0, không nằm
//   trong danh sách bán của shop nào): không chỉ số, không bán được,
//   không dùng trực tiếp được. Trao vào túi lúc tạo nhân vật; save cũ
//   chưa có thì ensure() trao bù đúng 1 lần (kiểm tra túi trước).
// - Thoại NPC nhận ra dấu ấn: chỉ khi không có dấu !/? (thoại nhiệm
//   vụ luôn thắng, cùng mẫu js/affinity.js). Kỳ ngộ riêng (fateId)
//   CHƯA cài ở mục này — mục 20/21 dùng đúng fateId + cờ
//   flags.originFate.<id> ghi ở đây.
(function (global) {
  'use strict';

  var DEFS = [
    { id: 'nv01', name: 'Kiếm Khách Lãng Du', gender: 'nam', frame: 'tho_san', token: 'kiem_gi_cua_cha',
      lore: 'Cha là tiêu sư, chết trên đường nam trong mùa thú dữ nổi loạn mười lăm năm trước; mẹ gửi con ở lại Thanh Khê với thanh kiếm đã gỉ của cha. Cậu lớn lên học lỏm kiếm pháp qua những vết chém còn in trên cột đình làng.',
      fateId: 'nv01', fateTitle: 'Vết Chém Trên Cột Đá', fateKind: 'fate',
      recognizers: [{ npc: 'tho_ren', line: 'Thanh kiếm gỉ này... thép lò nhà ta đời ông nội rèn cho đội hộ vệ của Thanh Khê lão nhân. Cháu là con của tiêu sư năm xưa phải không? Giữ kiếm cho cẩn thận — gỉ thì mài được, còn người thì không lấy lại được.' }] },
    { id: 'nv02', name: 'Thư Sinh Ôn Nhuận', gender: 'nam', frame: 'thu_sinh', token: 'nua_quyen_thanh_khe_chi',
      lore: 'Con nhà nho nghèo; cha dạy chữ ở đình làng, mất sớm, để lại nửa quyển sách chép tay về làng Thanh Khê. Cậu chép sách thuê cho thương đội qua lại, mơ một ngày thi đỗ — nhưng thời mạt pháp, chữ nghĩa không giữ nổi làng trước bầy sói.',
      fateId: 'nv02', fateTitle: 'Động Đá Tàn Thư', fateKind: 'fate',
      recognizers: [{ npc: 'truong_lang', line: 'Nét chữ này... chính tay cha cháu chép. Năm xưa ta nhờ ông chép lại những điều không được viết vào gia phả, về giếng cổ. Cháu giữ nửa quyển này, tức là giữ nửa lời dặn của làng.' }] },
    { id: 'nv03', name: 'Đạo Sĩ Vân Du', gender: 'nam', frame: 'thu_sinh', token: 'la_bua_khong_chu',
      lore: 'Được một đạo sĩ già bỏ lại trước cửa Miếu Sơn Thần khi còn bé, Từ bà nuôi lớn bằng cơm miếu. Lớn lên cậu theo nếp sư phụ đi khắp các làng quanh Thanh Sơn xem quẻ, chữa bệnh vặt — rồi quay về đúng mùa giếng cổ phát sáng, như có ai gọi.',
      fateId: 'nv03', fateTitle: 'Quẻ Dưới Gốc Đa', fateKind: 'spot',
      recognizers: [{ npc: 'giu_mieu', line: 'Giấy bùa này là giấy của miếu, bị lấy đi từ đêm phong ấn trăm năm trước. Sư phụ cháu lấy nó, hay nó tự tìm tới cháu? Thôi — bùa không chữ thì người giữ phải tự viết chữ của mình lên.' }] },
    { id: 'nv04', name: 'Thợ Săn Sơn Dã', gender: 'nam', frame: 'tho_san', token: 'nanh_soi_dau_tien',
      lore: 'Học trò cũ bỏ dở của Hà Thiết Sơn. Cha anh chết trong mùa thú dữ hai mươi năm trước — cùng mùa chồng của Từ bà mất. Từ đó anh sống bằng săn bắn ở bìa rừng nam, tin vào tay mình hơn tin vào lời đồn tiên nhân.',
      fateId: 'nv04', fateTitle: 'Linh Thú Bị Thương', fateKind: 'fate',
      recognizers: [{ npc: 'tho_san_ha', line: 'Chiếc nanh này... ta còn nhớ ngày thằng bé vác xác sói về lán, và nhớ cả cha nó. Mùa thú dữ hai mươi năm trước lấy đi nhiều người tốt. Cháu sống bằng tay mình — rừng nể người như vậy.' }] },
    { id: 'nv05', name: 'Tiểu Hòa Thượng', gender: 'nam', frame: 'thu_sinh', token: 'hat_trang_go_chay_sem',
      lore: 'Trẻ mồ côi của ngôi chùa trên núi gửi xuống làng lánh nạn khi chùa cháy nhiều năm trước; chú tiểu ở nhờ hiệu thuốc họ Lý, quét sân miếu, thuộc kinh làu làu mà chưa từng thấy tượng Phật nguyên vẹn.',
      fateId: 'nv05', fateTitle: 'Tiếng Chuông Không Người Gõ', fateKind: 'spot',
      recognizers: [{ npc: 'dai_phu', line: 'Tràng hạt cháy sém... đêm chùa cháy, ta lên núi cấp cứu cho các sư và mang về đúng nửa tràng này. Nửa còn lại ở chỗ cháu — vậy là hai nửa lại gặp nhau sau ngần ấy năm.' }] },
    { id: 'nv06', name: 'Thôn Phu Cường Tráng', gender: 'nam', frame: 'nong_dan', token: 'hat_giong_lua_cu_cua_ba',
      lore: 'Con trưởng nhà nông ba đời; ruộng nhà anh ở cuối làng, sát bãi hoang — là ruộng đầu tiên sói về phá mỗi mùa. Bà nội anh chính là người dặn câu gốc của cả game: "tu tiên là để bảo vệ người dưới đất".',
      fateId: 'nv06', fateTitle: 'Mảnh Ruộng Phát Sáng', fateKind: 'fate',
      recognizers: [{ npc: 'chu_quan', line: 'Giống lúa cũ nhà cháu từng cứu đói cả làng năm mất mùa. Bà cháu dặn "tu tiên là để bảo vệ người dưới đất" — nghe câu đó, ta biết cháu tu vì cái gì.' }] },
    { id: 'nv07', name: 'Nữ Hiệp Hồng Y', gender: 'nu', frame: 'tho_san', token: 'lenh_bai_tieu_cuc_ran',
      lore: 'Con gái một tiêu cục phương bắc; theo cha áp tiêu qua Thanh Khê đúng mùa sói về, cha bị thương phải nằm lại quán trọ của Hoa nương. Cô ở lại làng trả ơn — và phát hiện đường tiêu năm xưa cha cô đi qua làng này nhiều hơn ông từng kể.',
      fateId: 'nv07', fateTitle: 'Chuyến Tiêu Cuối Cùng', fateKind: 'fate',
      recognizers: [
        { npc: 'chu_quan', line: 'Lệnh bài tiêu cục này... ta nhớ người tiêu sư năm xưa nằm lại quán ta dưỡng thương. Con gái ông ấy ở lại làng trả ơn — chính là cháu, phải không?' },
        { npc: 'thuong_nhan_ma', after: 'q_phu_mo_duong', line: 'Tiêu cục phương bắc này ta biết — đường tiêu của cha ngươi đi qua Thanh Khê nhiều hơn ông từng kể. Có chuyến hàng, tới giờ vẫn chưa ai kể hết đầu đuôi.' }
      ] },
    { id: 'nv08', name: 'Dược Nương Hoa Cài', gender: 'nu', frame: 'nong_dan', token: 'gio_thuoc_cua_me',
      lore: 'Học việc ở hiệu thuốc họ Lý từ năm mười tuổi — là người Lý Tiểu Hạnh gọi là "chị" trước khi lên thành phố. Mẹ cô cũng là dược nương, mất trong mùa dịch năm xưa vì vào rừng hái thuốc cứu người.',
      fateId: 'nv08', fateTitle: 'Linh Điền Sau Mưa', fateKind: 'fate',
      recognizers: [
        { npc: 'dai_phu', line: 'Giỏ thuốc này ta dạy cả hai mẹ con cháu dùng. Mẹ cháu vào rừng hái thuốc cứu người mùa dịch — tay hái thuốc khéo nhất làng nay lại ở trong giỏ này.' },
        { npc: 'hoc_tro', after: 'q_chinh_5', line: 'Chị ơi, giỏ thuốc của bác gái... em còn nhớ mùi thuốc trong giỏ mỗi lần chị mang về hiệu. Chị về rồi, hiệu thuốc lại có người hái thuốc giỏi nhất làng.' }
      ] },
    { id: 'nv09', name: 'Tiên Tử Áo Tím', gender: 'nu', frame: 'thu_sinh', token: 'ngoc_boi_khuyet_mot_goc',
      lore: 'Cô gái được tìm thấy cạnh suối linh khi còn đỏ hỏn, không ai trong vùng biết cha mẹ là ai; Trần Đức nhận nuôi, cả làng gọi đùa là "tiên tử rớt xuống suối". Cô từng thấy mặt giếng phát sáng từ khi còn rất nhỏ — từ trước khi chuyện giếng sáng thành chuyện của cả làng rất lâu; nói ra chẳng ai tin, nên cô giữ kín tới giờ.',
      fateId: 'nv09', fateTitle: 'Mảnh Ngọc Dưới Đáy Suối', fateKind: 'spot',
      recognizers: [{ npc: 'truong_lang', line: 'Miếng ngọc này... chất ngọc ta nhận ra, nhưng có nửa chuyện ta chưa nói được. Đợi cháu đủ duyên quay lại suối linh — có những chuyện chỉ nói khi người mang ngọc đã sẵn sàng.' }] },
    { id: 'nv10', name: 'Sơn Nữ Thợ Săn', gender: 'nu', frame: 'tho_san', token: 'sung_nai_gac_dau_tien',
      lore: 'Sinh ra trong lán thợ săn ở bìa rừng; mẹ là người của dân giữ rừng phía tây Thanh Sơn — tộc người sống cùng rừng, biết đường thú đi và luật của vương thú. Cô bắn cung từ năm bảy tuổi, nói chuyện với thú nhiều hơn với người làng.',
      fateId: 'nv10', fateTitle: 'Dấu Chân Không Thuộc Về Thú Nào', fateKind: 'fate',
      recognizers: [
        { npc: 'tho_san_ha', line: 'Sừng nai này buộc dây cung kiểu dân giữ rừng — ta biết mẹ cháu. Người giữ rừng sống cùng rừng, biết đường thú đi và luật của vương thú. Cháu mang máu đó trong tay cung.' },
        { npc: 'tong_thu', line: 'Cách buộc dây cung này là của dân giữ rừng phía tây Thanh Sơn. Thú ngửi được lòng người — cháu nói chuyện với thú nhiều hơn với người làng, ta nhìn là biết.' }
      ] },
    { id: 'nv11', name: 'Tài Nữ Thư Hương', gender: 'nu', frame: 'thu_sinh', token: 'con_dau_trien_gia_truyen',
      lore: 'Con gái nhà bán sách giấy ở trấn trên; nhà sa sút vì nợ, cô theo thương đội xuống Thanh Khê tránh nợ, ở lại chép sách cho đình và dạy chữ cho trẻ làng. Khác NV02: cô là người NGOÀI đến — và mang theo tin tức thiên hạ mà làng Thanh Khê không có.',
      fateId: 'nv11', fateTitle: 'Văn Thư Trong Hòm Sách Ướt', fateKind: 'fate',
      recognizers: [{ npc: 'tieu_thuong', line: 'Con triện nhà ngươi... thương đội phương bắc biết nhà ngươi, và biết cả món nợ. Ngươi yên tâm — Tiểu Lục này hứa không nói với ai, chữ tín của thương đội còn hơn vàng.' }] },
    { id: 'nv12', name: 'Thôn Nữ Hoa Đào', gender: 'nu', frame: 'nong_dan', token: 'khan_hoa_dao_cua_chi',
      lore: 'Em út nhà giữ vườn đào ở đầu làng — vườn đào trồng trên đất cũ Thanh Khê lão nhân để lại cho làng khi ông mới tới. Chiếc khăn hoa đào cô luôn mang theo là của chị gái thêu cho, trước khi chị đi lấy chồng xa qua đường nam. Cô vui vẻ, được cả làng quý, và là người đầu tiên mang cơm ra cổng cho lính gác trong đêm thú dữ về ở chương 5.',
      fateId: 'nv12', fateTitle: 'Gốc Đào Cổ Nở Hoa Trái Mùa', fateKind: 'spot',
      recognizers: [
        { npc: 'linh_gac', line: 'Khăn hoa đào này... đêm thú dữ về, chính ngươi mang cơm ra cổng, tay run mà không chịu vào. Hai anh em ta nhớ mãi — người làng như vậy, cổng này giữ cũng đáng.' },
        { npc: 'linh_gac2', line: 'Khăn hoa đào của chị ngươi... đêm đó ngươi mang cơm ra cổng, A Hổ kể mãi. Người làng như vậy thì đêm trực của ta cũng nhẹ đi một nửa.' }
      ] },
    { id: 'goc_nong_dan', name: 'Nông Dân Thanh Khê', gender: null, frame: 'nong_dan', token: 'cuoc_cu_cua_cha',
      lore: 'Người làng chính gốc, ruộng ở cuối làng. Không chọn tạo hình NV — nguồn gốc nền theo khung Nông dân, dấu ấn là chiếc cuốc mòn cán của cha.',
      fateId: null, fateTitle: null, fateKind: 'fallback',
      recognizers: [{ npc: 'truong_lang', line: 'Chiếc cuốc mòn cán này... người làng chính gốc như cháu, ruộng cuối làng là ruộng đầu tiên sói về phá mỗi mùa. Giữ cuốc cho chắc — tu tiên cũng từ đất mà lên.' }] },
    { id: 'goc_tho_san', name: 'Thợ Săn Thanh Khê', gender: null, frame: 'tho_san', token: 'mui_ten_gay_dau_tien',
      lore: 'Học việc ở lán Hà lão, sống bằng săn bắn bìa rừng. Không chọn tạo hình NV — nguồn gốc nền theo khung Thợ săn, dấu ấn là mũi tên gãy đầu tiên.',
      fateId: null, fateTitle: null, fateKind: 'fallback',
      recognizers: [{ npc: 'tho_san_ha', line: 'Mũi tên gãy đầu tiên... học việc ở lán ta ai cũng có một mũi như vậy. Gãy thì mài lại, hụt thì bắn lại — thợ săn sống bằng tay, không sống bằng lời đồn.' }] },
    { id: 'goc_thu_sinh', name: 'Thư Sinh Thanh Khê', gender: null, frame: 'thu_sinh', token: 'nghien_muc_nut',
      lore: 'Chép sách ở đình làng, chữ nghĩa là vốn liếng duy nhất. Không chọn tạo hình NV — nguồn gốc nền theo khung Thư sinh, dấu ấn là nghiên mực nứt.',
      fateId: null, fateTitle: null, fateKind: 'fallback',
      recognizers: [{ npc: 'truong_lang', line: 'Nghiên mực nứt này... chép sách ở đình làng bao năm, mực nứt mà chữ không nứt. Người chép sách giữ được chữ thì giữ được cả chuyện của làng.' }] }
  ];

  function byId(id) {
    for (var i = 0; i < DEFS.length; i++) if (DEFS[i].id === id) return DEFS[i];
    return null;
  }
  function isLookId(id) {
    return !!id && /^nv(0[1-9]|1[0-2])$/.test(id);
  }
  // Suy nguồn gốc: storyOrigin đã ghi thì dùng; có look NV thì = look;
  // không thì 'goc_' + khung xuất thân. Khung lạ -> goc_nong_dan để
  // không bao giờ có nhân vật mồ côi nguồn gốc.
  function storyOriginFor(ch) {
    if (!ch) return 'goc_nong_dan';
    if (ch.storyOrigin && byId(ch.storyOrigin)) return ch.storyOrigin;
    if (isLookId(ch.look)) return ch.look;
    var o = ch.origin;
    if (o === 'tho_san' || o === 'thu_sinh' || o === 'nong_dan') return 'goc_' + o;
    return 'goc_nong_dan';
  }
  function defOf(ch) { return byId(storyOriginFor(ch)); }
  function tokenOf(ch) { var d = defOf(ch); return d ? d.token : null; }
  function hasToken(ch) {
    var t = tokenOf(ch);
    if (!t || !ch || !ch.inventory) return false;
    for (var i = 0; i < ch.inventory.length; i++) {
      if (ch.inventory[i].id === t && ch.inventory[i].count > 0) return true;
    }
    return false;
  }
  // Nạp lười cho save cũ + nhân vật tạo trước mục 19: suy storyOrigin,
  // khởi tạo cờ kỳ ngộ nguồn gốc, trao bù dấu ấn đúng 1 lần. Trả về
  // true khi có thay đổi (để game.js saveGame sau startGame như cũ).
  function ensure(ch, flags) {
    if (!ch) return false;
    var changed = false;
    var so = storyOriginFor(ch);
    if (ch.storyOrigin !== so) { ch.storyOrigin = so; changed = true; }
    if (flags) {
      if (!flags.originFate) { flags.originFate = {}; changed = true; }
      if (!flags.originFlags) { flags.originFlags = {}; changed = true; }
    }
    if (!hasToken(ch)) {
      if (!ch.inventory) ch.inventory = [];
      ch.inventory.push({ id: tokenOf(ch), count: 1 });
      changed = true;
    }
    return changed;
  }
  function turned(qs, qid) {
    if (!qs || !qs.turnedIn) return false;
    if (Array.isArray(qs.turnedIn)) return qs.turnedIn.indexOf(qid) >= 0;
    return !!qs.turnedIn[qid];
  }
  function hasItemId(ch, id) {
    if (!ch || !ch.inventory) return false;
    for (var i = 0; i < ch.inventory.length; i++) {
      if (ch.inventory[i].id === id && ch.inventory[i].count > 0) return true;
    }
    return false;
  }
  // Thoại NPC nhận ra dấu ấn — chỉ khi không có dấu !/? (nhiệm vụ
  // thắng). Trả null khi NPC này không nhận ra nguồn gốc của người
  // chơi, hoặc đường thoại phụ chưa đủ điều kiện mốc truyện.
  // QA 17:46 30/10: câu nhận ra chỉ nói LẦN ĐẦU TIÊN với từng NPC
  // (ghi cờ flags.originFlags.recognized.<npc>) — trước đây MỌI lần
  // nói chuyện NPC đều lặp lại câu nhận ra và nuốt mất thoại thường
  // của họ, thành "lần đầu ngỡ ngàng, lần thứ mười vẫn ngỡ ngàng".
  // Riêng NV01 với thợ rèn: cầm Kiếm Của Cha ĐÃ MÀI thì câu nhận ra
  // là biến thể khác (khóa cờ riêng 'tho_ren_mai') — thợ rèn nhìn
  // lưỡi kiếm sáng phải nói khác lúc kiếm còn gỉ.
  var NV01_MAI_LINE = 'Thanh kiếm này... gỉ hết rồi, lưỡi sáng như nước. Cháu đã mài nó bằng đá linh phải không? Thép lò nhà ta đời ông nội, gặp được người biết giữ kiếm. Cha cháu mà thấy, chắc cũng gật đầu.';
  function dialogueFor(npcId, ch, flags, qs, marker) {
    if (!npcId || !ch) return null;
    if (marker === '!' || marker === '?') return null;
    var d = defOf(ch);
    if (!d) return null;
    for (var i = 0; i < d.recognizers.length; i++) {
      var r = d.recognizers[i];
      if (r.npc !== npcId) continue;
      if (r.after && !turned(qs, r.after)) continue;
      if (flags) {
        if (!flags.originFlags) flags.originFlags = {};
        if (!flags.originFlags.recognized) flags.originFlags.recognized = {};
        var rkey = npcId;
        var mai = d.id === 'nv01' && npcId === 'tho_ren' && hasItemId(ch, 'kiem_cua_cha_da_mai');
        if (mai) rkey = 'tho_ren_mai';
        if (flags.originFlags.recognized[rkey]) continue;
        flags.originFlags.recognized[rkey] = true;
        if (mai) return [NV01_MAI_LINE];
      }
      return [r.line];
    }
    return null;
  }
  // Dòng hiển thị ở màn tạo nhân vật khi chọn tạo hình / mặc định:
  // tên nguồn gốc + lore + tên vật dấu ấn (tên lấy từ ITEMS nếu có).
  function createLine(lookId, originId, itemName) {
    var so = null;
    if (isLookId(lookId)) so = lookId;
    else if (originId === 'tho_san' || originId === 'thu_sinh' || originId === 'nong_dan') so = 'goc_' + originId;
    else so = 'goc_nong_dan';
    var d = byId(so);
    if (!d) return '';
    return 'Nguồn gốc: ' + d.name + ' — ' + d.lore + ' Dấu ấn vào túi khi tạo nhân vật: ' + (itemName || d.token) + '.';
  }

  var api = {
    DEFS: DEFS, byId: byId, isLookId: isLookId,
    storyOriginFor: storyOriginFor, defOf: defOf, tokenOf: tokenOf,
    hasToken: hasToken, ensure: ensure, dialogueFor: dialogueFor,
    createLine: createLine
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_ORIGINS = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
