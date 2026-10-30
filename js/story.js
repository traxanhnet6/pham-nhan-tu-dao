// Phàm Nhân Tu Đạo — dữ liệu cốt truyện và lời thoại (file dữ liệu thuần, không logic).
// Cách dùng: nạp sau sprites.js, trước game.js (xem docs/story-bible.md mục 10).
// Mỗi NPC có: lines (mảng chuỗi, đúng định dạng game đang dùng), greeting, lore,
// idle, quest (theo mã nhiệm vụ), turnin (theo mã nhiệm vụ), origin (riêng trưởng làng).
(function () {
  'use strict';
  var STORY = {
    PROLOGUE: 'Dưới chân Thanh Sơn có một làng nhỏ tên Thanh Khê. Người làng làm ruộng, đi săn, buôn bán, canh cổng — sống như bao làng quê khác. Nhưng ai cũng từng nghe bà kể chuyện tiên nhân. Và đêm nay, giếng cổ đầu làng lại phát sáng.',
    WORLD: {
      village: 'Làng Thanh Khê',
      mountain: 'Dãy Thanh Sơn',
      wilds: 'Bãi hoang phía nam và rừng sâu',
      sect: 'Thanh Phong Phái',
      founder: 'Thanh Khê lão nhân',
      beastKing: 'Sơn Quân',
      era: 'Thời mạt pháp — sau Đại Kiếp, linh khí suy tàn, linh căn đa số ngủ say.',
      wellSecret: 'Giếng cổ nằm trên một linh nhãn, nhánh linh mạch của Thanh Sơn. Thanh Khê lão nhân đã phong ấn phần tu vi cuối đời xuống đáy giếng để giữ làng bình yên. Phong ấn yếu dần, thú dữ bạo dạn trở lại, và linh căn trong người nhân vật chính thức tỉnh.',
      rule: 'Tu vi là để bảo vệ, không phải để khoe. Thân thể là cái bình, tu vi là nước.',
      sectGathering: 'Sơn Môn Đại Hội (chương 9-12): phong ấn giếng cổ nứt dần, linh nhãn Thanh Khê lộ diện, mười tông môn quanh Thanh Sơn cùng kéo về bãi tuyển đệ tử ở Chân Núi Thanh Phong - bề ngoài tuyển đệ tử, bề trong tranh nhau xem linh nhãn và người tu sĩ trẻ đã trấn lại phong ấn. Thanh Phong Phái làm chủ nhà. Mở đủ 10 tông thì làm lễ chọn tông, bái nhập 1 tông (dữ liệu: js/sects.js).'
    },
    NPCS: {
      truong_lang: { name: 'Trần Đức', title: 'Trưởng làng', age: 72,
        personality: 'Điềm đạm, thương người, giữ chuyện.',
        past: 'Thợ săn cũ, làm trưởng làng 30 năm, người giữ bí mật giếng cổ.',
        relations: 'Như ông nội của nhân vật chính, người thầy đầu tiên.' },
      chu_quan: { name: 'Hoa nương', title: 'Chủ quán trọ', age: 38,
        personality: 'Ấm áp, nhanh nhẹn, hay lo.',
        past: 'Chồng mất trên đường nam vì thú dữ; mở quán trọ đón người đi đường.',
        relations: 'Như chị gái, nấu ăn cho lính gác bị thương.' },
      dai_phu: { name: 'Lý lão', title: 'Đại phu', age: 64,
        personality: 'Ngoài lạnh trong nóng, nói thẳng.',
        past: 'Làm đại phu 40 năm, học trò lên thành phố lấy thuốc chưa về.',
        relations: 'Thầy về thân thể, bắt mạch cho nhân vật chính.' },
      tho_ren: { name: 'Thiết Cường', title: 'Thợ rèn', age: 45,
        personality: 'Hào sảng, cười to, thật thà.',
        past: 'Ba đời thợ rèn ở làng, lò chưa từng tắt lửa.',
        relations: 'Như anh lớn, nể người chịu khó.' },
      linh_gac: { name: 'A Hổ', title: 'Lính gác cổng Nam Môn (ca ngày)', age: 24,
        personality: 'Bốc đồng, hay khoe, tốt bụng.',
        past: 'Song sinh với A Báo, canh cổng từ năm 16 tuổi.',
        relations: 'Bạn cùng lứa, hay ganh đua vui với nhân vật chính.' },
      linh_gac2: { name: 'A Báo', title: 'Lính gác cổng Nam Môn (ca đêm)', age: 24,
        personality: 'Ít nói, mắt tinh, cẩn thận.',
        past: 'Song sinh với A Hổ, bắn cung giỏi.',
        relations: 'Bạn cùng lứa, trầm tính hơn anh.' },
      tieu_thuong: { name: 'Lục Tiểu Lục', title: 'Tiểu thương sạp chợ', age: 20,
        personality: 'Lanh lợi, mơ lớn, hay chuyện.',
        past: 'Con nhà buôn phương bắc, kẹt lại làng vì đường nam có sói.',
        relations: 'Bạn mới, nguồn tin tức và tin đồn.' },
      tho_san_ha: { name: 'Hà Thiết Sơn', title: 'Thợ săn kỳ cựu ở Rừng Thanh Sơn', age: 58,
        personality: 'Trầm, cứng cỏi, nói ít mà trúng, thương rừng như thương nhà.',
        past: 'Ba mươi năm đi săn ở rừng phía nam, mười năm trước từng đối mặt Sơn Quân và mang vết sẹo dài ở vai trái. Nay dựng lán trại ở bìa rừng, dẫn đường cho người làng mỗi mùa thú dữ.',
        relations: 'Bạn săn cũ của Trần Đức; người dẫn đường của nhân vật chính ở chương 6-7; nể A Báo vì tài bắn cung.' },
      giu_mieu: { name: 'Ngô Thị Từ', title: 'Người giữ Miếu Sơn Thần', age: 68,
        personality: 'Hiền, chậm rãi, tin điềm báo nhưng không mê muội, nhớ mọi chuyện cũ của làng.',
        past: 'Giữ Miếu Sơn Thần ở bìa rừng từ khi còn trẻ. Chồng mất trong mùa thú dữ hai mươi năm trước. Là người duy nhất còn nhớ bài khấn trấn phong ấn giếng cổ mà Thanh Khê lão nhân để lại.',
        relations: 'Bạn già của Trần Đức và Lý lão; người cảnh báo biến cố phong ấn ở chương 7.' },
      thuong_nhan_ma: { name: 'Mã Vạn Lai', title: 'Trưởng thương đội phương bắc', age: 47,
        personality: 'Sởi lởi, tính toán rõ ràng, coi chữ tín hơn vàng.',
        past: 'Nhiều năm dẫn thương đội phương bắc qua Thanh Khê. Đợt này xe hàng bị sói rừng chặn ở đường mòn phía nam nên kẹt lại chờ đường thông.',
        relations: 'Người đỡ đầu làm ăn của Lục Tiểu Lục; bạn hàng lâu năm của Hoa nương.' },
      hoc_tro: { name: 'Lý Tiểu Hạnh', title: 'Học trò của Lý đại phu', age: 19,
        personality: 'Nhanh nhẹn, tò mò, hơi hấp tấp nhưng rất có tâm với người bệnh.',
        past: 'Chính là người học trò lên thành phố lấy thuốc được nhắc từ chương 1-4. Nay trở về làng đúng lúc mùa thú dữ, mang theo thuốc mới và tin tức về đợt tuyển đệ tử của Thanh Phong Phái.',
        relations: 'Học trò cưng của Lý lão; bạn nhỏ tuổi thân với A Hổ và A Báo.' },
      de_tu_phai: { name: 'Tạ Thanh Vân', title: 'Đệ tử ngoại môn Thanh Phong Phái - sứ giả tuyển đệ tử', age: 22,
        personality: 'Lễ độ, nghiêm mà không kiêu, đánh giá người bằng việc làm chứ không bằng lời nói.',
        past: 'Xuất thân làng chài, mười hai tuổi được Thanh Phong Phái thu nhận. Mùa xuân này lần đầu được giao nhiệm vụ xuống núi làm sứ giả tuyển đệ tử.',
        relations: 'Sứ giả của Thanh Phong Phái; người khảo hạch nhân vật chính ở chương 8; kính trọng Trần Đức vì từng nghe danh Thanh Khê lão nhân.' },
      tong_phap: { name: 'Liễu Ngưng Sương', title: 'Đại diện Huyền Pháp Tông', age: 26,
        personality: 'Lạnh lùng, kiêu hãnh, ít lời; trọng người có căn cơ thật, ghét kẻ khoe khoang.',
        past: 'Thiên tài pháp thuật của Huyền Pháp Tông, mười tám tuổi đã kết Ngũ Hành Luân. Lần đầu xuống núi làm đại diện tuyển đệ tử, trong lòng coi thường "hội hè ở chốn quê mùa" cho tới khi nghe chuyện giếng cổ Thanh Khê.',
        relations: 'Đại diện Huyền Pháp Tông ở Sơn Môn Đại Hội; người giao nhiệm vụ "Ngũ hành thí pháp".' },
      tong_khi: { name: 'Mạc Thiết Tâm', title: 'Đại diện Thiên Công Phường', age: 41,
        personality: 'Ít nói, khô khan, tay lúc nào cũng dính bụi than; trọng tay nghề hơn mọi lời hay.',
        past: 'Thợ cả của Thiên Công Phường, mười tuổi vào lò, ba mươi năm chưa từng để một món khí nào hỏng rời tay mình. Xuống núi lần này vì nghe tin phong ấn Thanh Khê nứt - phường muốn tận mắt xem linh nhãn.',
        relations: 'Đại diện Thiên Công Phường ở Sơn Môn Đại Hội; người giao nhiệm vụ "Bờm sắt thử tay".' },
      tong_dan: { name: 'Tần Dược Tử', title: 'Đại diện Đan Hà Cốc', age: 63,
        personality: 'Hiền hòa, hay cười, mũi thính lạ thường; gặp ai cũng hít hà đoán người ta vừa ăn gì, hái thuốc gì.',
        past: 'Trưởng lão luyện đan của Đan Hà Cốc, cả đời chỉ rời cốc hai lần. Lần này đích thân xuống núi vì linh chi quanh suối linh Thanh Sơn hút linh khí giếng cổ mà mọc - dược tính hiếm có.',
        relations: 'Đại diện Đan Hà Cốc ở Sơn Môn Đại Hội; người giao nhiệm vụ "Linh chi thử đan". Bạn già hay thư từ qua lại với Lý lão.' },
      tong_thu: { name: 'Giang Tiểu Thú', title: 'Đại diện Vạn Thú Môn', age: 17,
        personality: 'Lanh lợi, nói nhanh, cười nhiều; nói chuyện với thú còn nhiều hơn với người.',
        past: 'Đệ tử nhỏ nhất được cử đi đại diện: lớn lên trong chuồng thú của Vạn Thú Môn, sói mẹ nuôi từ bé. Môn phái cử cậu đi vì "thú rừng Thanh Sơn chỉ nghe lời người nó tin".',
        relations: 'Đại diện Vạn Thú Môn ở Sơn Môn Đại Hội; người giao nhiệm vụ "Người được thú nhận". Rất quý Hà Thiết Sơn sau lần gặp đầu.' },
      tong_phu: { name: 'Diệp Phù Sinh', title: 'Đại diện Thiên Phù Các', age: 35,
        personality: 'Nghiêm trang, nói chậm rãi, câu nào cũng cân nhắc như nét bùa; ghét sự hấp tấp.',
        past: 'Phù sư của Thiên Phù Các, nổi tiếng vì lá bùa trấn cổng viết trong một hơi không nhấc bút. Xuống núi vì nghe tin thú dữ từng đánh thẳng vào cổng làng Thanh Khê - đúng việc của phù tu.',
        relations: 'Đại diện Thiên Phù Các ở Sơn Môn Đại Hội; người giao nhiệm vụ "Giữ kho giấy bùa".' },
      tong_tran: { name: 'Âu Dương Kỳ', title: 'Đại diện Cửu Cung Trận Tông', age: 30,
        personality: 'Thích nói bằng câu đố và vị trí; hiền nhưng làm người đối diện hơi... mệt đầu óc.',
        past: 'Trận sư trẻ của Cửu Cung Trận Tông, đi đâu cũng đếm bước chân và nhìn hướng gió. Tới Thanh Sơn vì muốn tận mắt xem trận phong ấn của Thanh Khê lão nhân còn lại bao nhiêu phần.',
        relations: 'Đại diện Cửu Cung Trận Tông ở Sơn Môn Đại Hội; người giao nhiệm vụ "Dẫn khí qua cửu cung".' },
      tong_the: { name: 'Thạch Bất Động', title: 'Đại diện Kim Cang Môn', age: 38,
        personality: 'To con, cười sang sảng, nghĩ đơn giản mà sâu; coi ai cũng là em út trong nhà.',
        past: 'Đệ tử thể tu của Kim Cang Môn, từng đứng một mình giữ cổng núi cho sư huynh đệ rút lui trong một trận thú triều. Xuống núi tuyển đệ tử chỉ với một tiêu chí: đứng vững và không bỏ bạn.',
        relations: 'Đại diện Kim Cang Môn ở Sơn Môn Đại Hội; người giao nhiệm vụ "Tay không đấu lợn rừng".' },
      tong_doc: { name: 'Đường Tĩnh', title: 'Đại diện Ngũ Độc Giáo', age: 28,
        personality: 'Ít nói, cười nhẹ, ánh mắt làm người ta hơi rờn rợn; thật ra rất tử tế, chỉ là ít ai dám lại gần đủ lâu để biết.',
        past: 'Độc sư của Ngũ Độc Giáo, học độc để chế thuốc giải cho chính quê mình - nơi từng chết cả làng vì rắn độc. Xuống núi lần này là lần đầu giáo phái công khai xuất hiện ở một đại hội tuyển đệ tử.',
        relations: 'Đại diện Ngũ Độc Giáo ở Sơn Môn Đại Hội; người giao nhiệm vụ "Chén thuốc thử độc".' },
      tong_am: { name: 'Tiêu Uyển Nhi', title: 'Đại diện Huyền Âm Cung', age: 24,
        personality: 'Dịu dàng, nói năng như hát, thính tai đến mức nghe bước chân là đoán được tâm trạng người ta.',
        past: 'Đệ tử Huyền Âm Cung, ôm đàn đi khắp nơi đàn an hồn cho những làng vừa qua nạn thú dữ. Tới Thanh Khê vì nghe quán trọ nơi đây có một người đàn bà góa vì thú dữ - "khúc an hồn là nợ của cung ta với những làng như vậy".',
        relations: 'Đại diện Huyền Âm Cung ở Sơn Môn Đại Hội; người giao nhiệm vụ "Khúc đàn an hồn".' },
      chap_su_dai_hoi: { name: 'Hàn Sơn', title: 'Chấp Sự Đại Hội', age: 52,
        personality: 'Giọng sang sảng, công tâm, ghét nhất là gian lận; sổ ghi danh của ông không bao giờ sai một chữ.',
        past: 'Cựu đệ tử nội môn Thanh Phong Phái, giải nghệ sau một kỳ đại hội bị thương ở tay. Mười tông cử ông làm chấp sự chung của Đại Hội Tu Tiên vì khắp vùng không ai công bằng hơn.',
        relations: 'Người phụ trách ghi danh, giữ bảng xếp hạng và trao thưởng của Đại Hội Tu Tiên tại quảng trường Chân Núi Thanh Phong (dữ liệu sự kiện ở js/tournament.js).' },
      dau_gia_su: { name: 'Kim Vạn Thông', title: 'Chấp Sự Đấu Giá Liên Tông', age: 55,
        personality: 'Miệng nhanh như búa gõ, mắt tinh như cân vàng, công tâm đến mức mười tông đều tin.',
        past: 'Ba mươi năm giữ chợ đấu giá cho các thương hội phương bắc, được mười tông cùng mời về giữ búa phiên đấu giá chung khi nguyên liệu đột phá bắt đầu khan hiếm.',
        relations: 'Người giữ búa, giữ sổ và giữ giá trần của Phiên Đấu Giá Liên Tông tại quảng trường Chân Núi Thanh Phong (dữ liệu sự kiện ở js/auction.js).' },
      ghi_bang_su: { name: 'Thẩm Ký', title: 'Thư Lại Giữ Bảng Xếp Hạng Tu Sĩ', age: 41,
        personality: 'Cẩn thận tới mức ghi sai một điểm là tự gạch cả trang viết lại; tin rằng bảng công khai là cách giữ mười tông khỏi ganh nhau lén.',
        past: 'Thư lại của Thanh Phong Phái, từng giữ sổ điểm cho ba kỳ Sơn Môn Đại Hội. Khi mười tông lập bảng mùa chung, họ cùng chỉ mặt ông: người duy nhất mà cả mười tông đều tin là ghi đúng.',
        relations: 'Người giữ bảng đá, ghi điểm và trao thưởng cuối mùa của Bảng Xếp Hạng Tu Sĩ Theo Mùa tại quảng trường Chân Núi Thanh Phong (dữ liệu hệ thống ở js/season-board.js).' },
      thu_thu: { name: 'Cổ Mặc', title: 'Thủ Thư Tàng Kinh Các', age: 71,
        personality: 'Khó tính với sách hơn với người: rách một trang là bắt vá, trả trễ một ngày là ghi sổ đỏ, nhưng ai giữ sách cẩn thận thì ông quý như người nhà.',
        past: 'Giữ sách cho Thanh Phong Phái bốn mươi năm, từng vá lại cả một bộ kiếm phổ cháy dở sau trận thú triều xưa. Khi mười tông dựng các chung ở bãi tuyển, họ cùng mời ông về giữ — vì khắp vùng không ai thuộc vị trí từng quyển trên kệ bằng ông.',
        relations: 'Người giữ tòa Tàng Kinh Các chung, sổ mượn và chuỗi việc giữ sách / trả sách ở bãi tuyển Chân Núi Thanh Phong (dữ liệu hệ thống ở js/library.js; quầy đổi sách trong panel Tông Môn ở js/manuals.js).' },
      chap_su_thu_trieu: { name: 'Vệ Trường Không', title: 'Chấp Sự Thủ Triều', age: 47,
        personality: 'Ít lời, điểm danh nhanh và nhớ mặt từng đệ tử từng đứng cổng; tin rằng một cái cổng làng giữ được là nhờ mười tông chịu đứng chung, không nhờ một anh hùng.',
        past: 'Từng là lính gác cổng sơn môn của Thanh Phong Phái trong trận thú triều hai mươi năm trước — trận mà chồng của Từ bà ngã xuống ở chính cổng Nam Môn này. Sau trận đó ông xin về làng, lập sổ thủ thành và lệ "mười tông cử người" cho mỗi đợt thú triều.',
        relations: 'Người điểm danh, chia hàng giữ cổng và trao thưởng của sự kiện Thú Triều Thủ Hộ Làng tại Nam Môn làng Thanh Khê (dữ liệu sự kiện ở js/beast-tide.js).' },
      le_su: { name: 'Dì Tư', title: 'Người lo lễ hội làng Thanh Khê', age: 52,
        personality: 'Vui vẻ, nhớ ngày lễ hơn nhớ sinh nhật con cháu; tin rằng làng còn giữ lễ là còn giữ được nếp người.',
        past: 'Ba đời nhà bà lo lễ cho làng Thanh Khê: cúng giếng cổ ngày Tết, treo ngải Đoan Ngọ, làm bánh rằm Trung Thu. Bà thuộc lòng ngày âm lịch của từng lễ trong năm mà không cần xem lịch.',
        relations: 'Người giao chuỗi việc lễ theo mùa lễ thật và trao pháp bảo lễ giới hạn; giữ hộ Tủ Đồ y phục của dân làng lên núi tu hành (dữ liệu hệ thống ở js/wardrobe.js).' }
    },
    DIALOGUE: {
      // Thủ Thư Tàng Kinh Các — trong game, js/library.js ưu tiên thoại
      // theo cổng bái nhập + tiến độ chuỗi việc giữ sách; đây là thoại
      // dự phòng (và là nguồn bắt buộc cho test story: mọi nhiệm vụ
      // đều phải có quest/turnin lines của giver).
      thu_thu: {
        lines: [
          'Sách trong các này, quyển nào ta cũng biết nó nằm ở kệ nào, tầng nào, úp hay ngửa. Người ta giữ kiếm bằng tay, ta giữ sách bằng sổ — sổ mà lệch một dòng là sách lạc ngay.',
          'Kệ của mỗi tông chỉ mở cho đệ tử tông đó. Không phải ta khó tính — sách là của tông, mượn nhầm tông là mang nợ với cả một tông môn.',
          'Sách mượn về thì trả đúng hạn. Rách một trang, ta bắt vá lại bằng tay ngươi, không cho mượn giấy của các đâu.'
        ],
        greeting: ['Ngươi tới Tàng Kinh Các à? Ta là Cổ Mặc, thủ thư ở đây. Đứng ngoài cửa mà nhìn vào đã thấy kệ sách rồi — vào thì phải theo luật của các.'],
        lore: ['Mười tông dựng các chung ở bãi tuyển này vì một lý do giản dị: thời mạt pháp, sách quý mà để riêng từng núi thì núi nào cháy là mất tông đó. Để chung một các, có người giữ sổ chung, thì lửa có tới cũng còn kịp ôm sách chạy.',
          'Tuyệt học của mỗi tông nằm ở kệ riêng, chỉ đệ tử hàm Nội Môn trở lên mới đổi được bằng Điểm Cống Hiến. Không phải tông keo kiệt — tuyệt học mà vào tay người chưa đủ hàm thì học cũng không nổi, còn làm hỏng sách.'],
        idle: ['Đang kiểm sổ mượn kỳ này. Kỳ này mà sạch thì ta cho các nghỉ một buổi lau kệ.',
          'Giá thấp còn hơi ẩm sau trận mưa qua. Túi thơm thảo dược phơi chưa đủ khô thì mọt vẫn tới.'],
        quest: {
          q_tkc_1: ['Các bị dột một góc mái sau trận mưa đêm qua, sách trên giá thấp ẩm hết. May mà chưa rách trang nào — nhưng giá sách mà ẩm lâu thì mọt tới ngay. Ngươi hái cho ta 4 cây Thảo Dược tươi: phơi khô lót vào giá làm túi thơm chống ẩm, mùi dược đắng mọt không dám lại gần.'],
          q_tkc_2: ['Túi thơm đã lót xong, giá sách khô ráo rồi. Giờ tới việc thứ hai: đường từ bãi tuyển lên núi có bầy Sói Rừng rình người qua lại. Đệ tử các tông gánh sách trả về núi đi qua đó mà run tay — sách mà rơi xuống suối thì không vớt lại được. Ngươi dẹp 3 con Sói Rừng dọc đường núi cho ta.'],
          q_tkc_3: ['Đường sạch rồi, sách trả về núi đủ cả. Việc cuối cùng nhẹ mà quan trọng nhất: sổ mượn của các phải có người làm chứng. Ngươi mang sổ này tới gặp Tạ Thanh Vân ở bãi tuyển — báo cho cậu ấy biết kỳ này các không mất một quyển nào, không rách một trang nào.']
        },
        turnin: {
          q_tkc_1: ['Thảo dược tươi cả bốn cây, phơi khô lót giá là vừa. Giá sách hết mùi ẩm rồi — ngươi giữ sách có tâm, không thua gì đệ tử giữ kiếm.'],
          q_tkc_2: ['Đường núi sạch sói rồi, đệ tử gánh sách đi qua không còn run tay nữa. Sổ mượn kỳ này sẽ không còn dòng "mất trên đường" nào — công này ta ghi cho ngươi.'],
          q_tkc_3: ['Tạ Thanh Vân ký sổ rồi chứ? Tốt. Kỳ này các không mất một quyển, không rách một trang — lần đầu tiên từ khi mười tông dựng các chung ở bãi tuyển mà sổ sạch tới vậy. Từ nay ngươi là người giữ sách của các này rồi.']
        }
      },
      // Chấp Sự Đại Hội — trong game, js/tournament.js ưu tiên thoại theo
      // trạng thái phiên/kỳ của người chơi; đây là thoại dự phòng.
      chap_su_dai_hoi: {
        greeting: ['Tới ghi danh đại hội à? Sổ của ta đây — mười tông cùng bước lên một võ đài, thắng có thưởng, thua cũng có phần. Chỉ một điều ta không ghi: gian lận. Muốn đấu thì đấu cho đàng hoàng trước mắt Hàn Sơn này.'],
        lore: ['Ngày xưa ta cũng từng đứng trên võ đài này, thua một trận mà mất một cánh tay cầm kiếm. Thắng thua nhất thời, danh dự mới là lâu.'],
        idle: ['Sổ ghi danh của ta chưa sai bao giờ. Cứ yên tâm mà đấu.'],
        quest: {}
      },
      // Chấp Sự Thủ Triều — trong game, js/beast-tide.js ưu tiên thoại
      // theo trạng thái phiên/cảnh giới; đây là thoại dự phòng.
      chap_su_thu_trieu: {
        lines: [
          'Điểm danh trước, ra trận sau. Hàng thủ thành thiếu một người là cổng hở một chỗ.',
          'Mười tông cử người không phải để phô trương — là vì một tông giữ không nổi cổng này.',
          'Thú dữ không sợ người mạnh, chúng sợ hàng người không vỡ. Đứng đúng hàng của ngươi là được.',
          'Giữ được cổng qua hết đợt thì về đây lĩnh thưởng. Sổ của ta ghi công từng đợt, không sót ai.'
        ],
        greeting: ['Cổng Nam Môn này, hai mươi năm trước ta đứng một mình mà không giữ nổi. Nay lệ cũ còn ghi trong sổ: mười tông cử người về đứng chung một hàng, mà phải từ Trúc Cơ mới được ra trận. Ngươi đủ sức thì ghi tên vào sổ của ta.'],
        lore: ['Hai mươi năm trước ta đứng gác ở chính cổng này, trong trận thú triều mà nửa làng phải chạy lên núi. Từ đó ta lập lệ: mỗi đợt triều, mười tông đều cử người về đứng chung một hàng.'],
        idle: ['Sổ thủ thành của ta ghi đủ mặt từng người từng giữ cổng này. Thiếu ai, ta biết ngay.'],
        quest: {}
      },
      // Người lo lễ hội — trong game, js/wardrobe.js ưu tiên thoại theo
      // cửa sổ lễ + tiến độ chuỗi việc lễ của người chơi; đây là thoại
      // dự phòng khi ngoài mùa lễ.
      le_su: {
        lines: [
          'Dì lo lễ hội cho làng này mấy chục năm nay: Tết, Đoan Ngọ, Thất Tịch, Trung Thu, Hàn Thực — mùa nào làng mình cũng có hội.',
          'Tới ngày lễ thì quay lại sân làng gặp dì. Có việc lễ để làm, có pháp bảo lễ chỉ trao trong những ngày lễ thôi đó.'
        ],
        greeting: ['Làng Thanh Khê sắp có lễ thì ghé dì. Ngoài mùa lễ, dì giữ hộ tủ y phục cho bà con lên núi tu hành.'],
        lore: ['Ba đời nhà dì lo lễ cho làng: cúng giếng cổ ngày Tết, treo ngải ngày Đoan Ngọ, làm bánh đêm rằm. Làng còn giữ lễ là còn giữ được nếp người.'],
        idle: ['Ngày lễ tính theo lịch thật đó nghen — qua ngày là dì đóng sổ, chờ mùa lễ năm sau.'],
        quest: {}
      },
      // Đại diện tông môn (giver trừu tượng) cho chuỗi NGỰ KIẾM — dòng thoại
      // DỰ PHÒNG chung; trong game, js/flight.js ưu tiên lời riêng theo tông
      // người chơi đã bái nhập (SECT_FLAVOR), chỉ rơi về đây khi thiếu.
      sect_rep: {
        greeting: ['Đệ tử Trúc Cơ của tông môn, đến lúc học cách rời mặt đất rồi.'],
        lore: ['Ngự kiếm không phải để khoe. Bay được là để về kịp khi sơn môn — và làng của ngươi — có biến.'],
        idle: ['Gió trên cao lạnh hơn ngươi tưởng. Bay xa nhớ mang theo đan hồi phục.'],
        quest: {
          q_ngu_kiem_1: ['Đem một thanh kiếm phẩm Linh trở lên tới đây, cùng 200 Linh Thạch và 3 Linh Chi. Ta đúc linh cho nó — kiếm không mất, nó thành phi kiếm của ngươi.'],
          q_ngu_kiem_2: ['Ra Bãi Luyện Công phía đông trấn, đánh bại Hình Nhân Kiếm Khí do tông môn dựng. Thắng nó, ngươi mới được đặt chân lên kiếm.'],
          q_ngu_kiem_3: ['Bài bay thử: bay qua 5 cột mốc quanh trấn theo đúng thứ tự, trong lúc đang bay. Xong bài này, ngươi chính thức biết ngự kiếm.'],
          q_vet_nut_1: ['Trời rách thật rồi. Phong ấn giếng cổ nứt hẳn — vết nứt hư không bắt đầu xé mở trên đất Thanh Khê. Trước khi bàn chuyện vào nứt, tới Miếu Sơn Thần gặp Từ bà: bà giữ tàn niệm của Thanh Khê lão nhân, nghe lão nhân nói hết rồi hãy tính.'],
          q_vet_nut_2: ['Vào một Vết Nứt Hư Không đang mở và hạ yêu thú canh giữ khe nứt trong cảnh. Nói trước: nó mạnh hơn ngươi một bậc, đan hồi máu dưới Địa phẩm vào đó là tro, và gục trong cảnh là mất lượt tới hết chu kỳ.'],
          q_vet_nut_3: ['Trong cảnh còn kẻ canh giữ thứ hai — yêu thú bị linh khí hư không kinh động, hiện thân ngay cạnh ngươi khi ngươi động thủ. Nó là thứ mạnh nhất của cả cảnh. Hạ nó.'],
          q_vet_nut_4: ['Mang về một mảnh trời rơi — thiên tài địa bảo phát sáng vàng trong cảnh. Đợt này chắc chắn có một mảnh hiện ra cho ngươi. Hái được là ra ngay, đừng tham.']
        },
        turnin: {
          q_ngu_kiem_1: ['Kiếm phôi đã hợp tâm. Thanh kiếm này từ nay là chân của ngươi trên trời.'],
          q_ngu_kiem_2: ['Tay kiếm đã vững. Còn một bài bay thử nữa thôi.'],
          q_ngu_kiem_3: ['Đứng vững trên kiếm rồi đấy — từ nay trời cao là đường của ngươi. Muốn bay cứ bấm nút Ngự Kiếm (phím F). Chỉ nhớ một điều của người xưa để lại: cổng thành chỉ đón người hạ xuống đất đi bộ qua — đừng lao thẳng trên kiếm mà cụng đầu vào cổng.'],
          q_vet_nut_1: ['Đã nghe tàn niệm rồi thì từ nay đừng ai gọi chuyện vết nứt là "việc vặt" trước mặt ngươi nữa. Chuẩn bị đi — vết nứt mở theo chu kỳ, và nó không chờ ai.'],
          q_vet_nut_2: ['Ngươi còn sống trở ra, ấn hư không vỡ trên trán kẻ canh giữ — thế là đủ ghi công đầu cho đợt thám thính. Nhưng trong cảnh vẫn còn một thứ chưa lộ mặt.'],
          q_vet_nut_3: ['Yêu đan ngưng từ linh khí nát vụn — hàng thật. Các tông sẽ phải nhìn lớp đệ tử Trúc Cơ của vùng này bằng con mắt khác.'],
          q_vet_nut_4: ['Mảnh trời đã về tay tông môn. Kết quả đo không vui: vết nứt đang rộng ra. Từ nay vào nứt là việc của riêng ngươi — và nó sẽ còn đè nặng hơn mỗi khi ngươi mạnh lên.']
        }
      },
      truong_lang: {
        lines: [
          'Sáng nay ta vừa đếm lại sổ đinh của làng. Thêm một tu sĩ, là cả làng thêm một phần yên tâm đấy cháu.',
          'Mấy đứa trẻ trong làng giờ đứa nào cũng đòi học thở như cháu. Thanh Khê sắp đông tu sĩ lắm đây.',
          'Người tu tiên không phải để bay lên trời bỏ lại người dưới đất, mà để bảo vệ người dưới đất.',
          'Căn nhà tranh cuối xóm là của Từ bà, ở một mình. Cháu đi ngang thì ghé chào bà một tiếng nhé.'
        ],
        greeting: [
          'Cháu dậy sớm thế. Làng buổi sáng yên bình nhất, ra sân mà hít thở đi.',
          'Ngồi xuống uống chén trà đã. Việc làng không chạy đi đâu được.'
        ],
        lore: [
          'Làng ta tên Thanh Khê, vì dòng suối trong chảy qua làng. Tổ tiên ta theo Thanh Khê lão nhân tới đây lập nghiệp, tính ra đã hơn trăm năm.',
          'Thanh Khê lão nhân là tu sĩ đã tàn sau Đại Kiếp. Ông không về tông môn nữa, mà ở lại đào giếng, giữ làng. Người ta bảo tu vi của ông vẫn còn nằm dưới đáy giếng.',
          'Thời mạt pháp này, linh khí mỏng như sương. Người có linh căn mà không gặp linh nhãn thì cả đời cũng chỉ là phàm nhân. Cháu gặp được giếng, là duyên.',
          'Mùa thú dữ năm nay tới sớm hơn mọi năm. Phong ấn dưới giếng yếu đi, linh khí rò ra, thú hoang ngửi thấy mùi linh khí thì kéo về - chúng cũng chỉ tìm đường sống thôi, nhưng làng ta phải giữ.',
          'Thanh Phong Phái ba năm mới xuống núi một lần. Mùa xuân này họ tới, cháu cứ đi xem cho biết thế giới bên ngoài - nhưng đi đâu cũng đừng quên đường về làng.',
          'Nghe nói lần này không chỉ Thanh Phong Phái: mười tông môn quanh vùng cùng kéo về chân núi, mượn tiếng tuyển đệ tử mà xem linh nhãn của làng ta. Khách quý tới nhà thì phải tiếp cho đàng hoàng - nhưng giếng là của làng, cháu nhớ lấy.'
        ],
        idle: [
          'Trà nguội rồi, để ta châm thêm ấm mới.',
          'Cháu rảnh thì ra ruộng giúp bà con một tay. Tu sĩ cũng phải biết làm ruộng chứ.',
          'Đêm qua nước giếng lạnh buốt lạ thường. Ta già rồi, có những điềm ta không dám nói to.'
        ],
        origin: {
          nong_dan: ['Cháu làm ruộng từ nhỏ nên thân thể rắn rỏi — tu luyện cũng cần cái nền ấy.'],
          tho_san: ['Cháu đi săn từ nhỏ nên mắt tinh, tay nhanh — ra bãi hoang cũng đừng chủ quan.'],
          thu_sinh: ['Cháu đọc sách nhiều nên ngộ tính cao — thổ nạp sẽ nhanh hơn người khác, nhưng đừng vội, vững mới xa.']
        },
        quest: {
          q_chinh_1: [
            'Làng ta nhỏ, nhưng người làng đều là người nhà. Cháu ra mắt mọi người một lượt đi, rồi quay lại đây ta dặn chuyện giếng cổ.',
            'Đi đi, gặp được ai thì chào người ấy một tiếng. Làng này sống với nhau bằng cái chào đấy.'
          ],
          q_chinh_2: [
            'Giếng cổ đào từ thời ông cố ta. Nước giếng ngọt, đất làng lành, thú dữ ít dám tới gần — tất cả là nhờ giếng. Đêm nay nó sáng, ắt có điềm.',
            'Cháu tới xem, chạm tay vào thành giếng mà cảm thử. Đừng sợ, giếng làng chưa từng hại ai.'
          ],
          q_chinh_3: [
            'Muốn tu tiên, trước hết phải biết thở. Ngồi yên, hít một hơi dài, cảm luồng khí ấm chạy trong người.',
            'Thổ nạp đủ 30 tu vi rồi quay lại gặp ta. Đừng ham nhanh — hơi thở đầu tiên là khó nhất.'
          ],
          q_chinh_4: [
            'Đủ tu vi rồi thì đừng chần chừ. Ngồi xuống, tĩnh tâm, phá quan mà lên Luyện Khí tầng 1.',
            'Cả làng đang trông vào cháu đấy — nói vậy chứ, cứ bình tĩnh, ta tin cháu.'
          ]
        },
        turnin: {
          q_chinh_1: [
            'Tốt, cháu đã ra mắt mọi người. Giờ ta nói chuyện chính: giếng cổ đầu làng mấy đêm nay phát sáng. Cháu ra đó xem giúp ta.'
          ],
          q_chinh_2: [
            'Quả nhiên... linh căn của cháu đã thức tỉnh! Nghe đây, cháu: giếng này nằm trên một linh nhãn, là nhánh linh mạch của Thanh Sơn.',
            'Người sáng lập làng ta, Thanh Khê lão nhân, đã phong ấn phần tu vi cuối đời của mình xuống đó để giữ làng bình yên. Phong ấn yếu dần, nên thú dữ mới bạo dạn trở lại — và cũng vì thế mà linh căn trong người cháu mới tỉnh.',
            'Giếng không chọn người, cháu ạ. Giếng chỉ soi ra thứ vốn có trong người cháu. Từ nay cháu là tu sĩ của làng này rồi.'
          ],
          q_chinh_3: [
            'Thấy chưa, hơi thở đầu tiên là khó nhất. Từ nay cháu đã khác người phàm rồi — nhưng nhớ, tu vi là để bảo vệ, không phải để khoe.'
          ],
          q_chinh_4: [
            'Luyện Khí tầng 1! Ha ha, làng Thanh Khê ta cuối cùng cũng có tu sĩ của riêng mình! Đêm nay cả làng ăn mừng.',
            'Nhưng cháu cũng nghe đây: lính gác báo sói đã tới gần ruộng cuối làng. Mùa thú dữ sắp tới rồi. Cháu mạnh lên, là để bảo vệ nơi này — đó mới là tu tiên.'
          ]
        }
      },
      chu_quan: {
        lines: [
          'Cháo hôm nay ta nấu bằng gạo mới gặt, thơm lắm. Cháu ăn thêm một bát nữa không?',
          'Khách đường xa ghé quán hay hỏi đường lên núi. Ta chỉ họ đi về phía bắc — mà dặn kỹ là phải đi ban ngày thôi.',
          'Cái bàn gỗ kê sát cửa sổ là chỗ chồng ta hay ngồi ngày trước. Giờ ta để dành cho lính gác trực đêm về khuya ngồi ăn.'
        ],
        greeting: [
          'Khách tới là có cơm nóng. Ngồi đi, đừng khách sáo.',
          'Đi đâu về đấy? Vào quán uống chén nước đã.'
        ],
        lore: [
          'Chồng ta mất trên đường phía nam năm ấy, cũng vì thú dữ. Từ đó quán này mở cửa cho mọi người đi đường, để không ai phải đi trong đêm đói.',
          'Quán trọ này là tai mắt của làng đấy — thương đội, lữ khách qua lại đều ghé đây, tin tức gì ta cũng nghe trước.',
          'Nghe nói mùa xuân tới có người của Thanh Phong Phái xuống núi tuyển đệ tử. Cháu mà thành tu sĩ, nhớ ghé quán kể ta nghe chuyện trên núi nhé.',
          'Mùa thú dữ mà tới, quán này thành bếp của cả đội gác cổng. Cháo nóng, cơm nóng - người giữ làng no bụng thì làng mới yên.',
          'Có cô nương của Huyền Âm Cung ghé quán ta, nói muốn đàn một khúc an hồn cho những người làng mình đã mất vì thú dữ. Nghe tới đó ta lặng người mất một lúc. Chồng ta... cũng nằm trong số ấy.'
        ],
        idle: [
          'Cơm đang sôi, chờ một lát là có ăn.',
          'Cháu đói thì nói, đừng nhịn — người tu luyện cũng phải ăn no mới có sức.'
        ],
        quest: {
          q_phu_tho: [
            'Đêm qua sói về gần làng, đội lính gác đánh đuổi cả đêm, mấy người bị thương nhẹ. Ta đang nấu cháo thỏ hầm thảo dược cho họ bồi bổ.',
            'Cháu săn giúp ta 3 con Thỏ Hoang ngoài bãi, thỏ phải còn tươi thì cháo mới ngon. Ta trả công xứng đáng.'
          ]
        },
        turnin: {
          q_phu_tho: [
            'Thịt thỏ tới rồi! Để ta hầm ngay — mấy anh lính gác ăn được bát cháo nóng này là khỏe lại ngay.',
            'Cảm ơn cháu, đây là công của cháu. Lần sau đói thì cứ ghé quán, ta để phần.'
          ]
        }
      },
      dai_phu: {
        lines: [
          'Để ta bắt mạch cho cháu một cái... Ừm, mạch trầm mà vững, thổ nạp dạo này đều tay hơn trước nhiều rồi.',
          'Ta vừa phơi xong mẻ thảo dược trên sân sau. Mùi thuốc hăng thế mà ngửi quen lại thấy yên lòng, cháu nhỉ.',
          'Thảo dược ngoài bãi cỏ hoang cầm máu rất tốt. Cháu ra bãi thì hái về cho ta ít.'
        ],
        greeting: [
          'Vào đi, đừng đứng ngoài gió. Bị thương ở đâu?',
          'Người tới khám thì xếp hàng, người tới chơi thì pha trà.'
        ],
        lore: [
          'Người phàm muốn tu tiên, trước hết phải có thân thể khỏe. Thân thể là cái bình, tu vi là nước — bình nứt thì nước đổ hết.',
          'Ta làm đại phu ở làng này bốn mươi năm. Thuốc của ta không có phép tiên, chỉ có thảo dược và cái tâm — vậy mà cũng cứu được không ít người.',
          'Lão trưởng làng dặn ta để mắt tới cháu. Cháu mà thổ nạp quá sức thì tới đây, ta bắt mạch cho.',
          'Tiểu Hạnh - học trò ta - về rồi đấy. Nó lên thành phố lấy thuốc, về đúng lúc làng cần người. Từ nay việc thuốc thang có nó đỡ cho ta một tay.',
          'Đánh Sơn Quân thì nhớ một điều: bình nứt thì nước đổ hết. Bị thương nặng thì lùi, không ai cười người biết giữ mạng đâu.'
        ],
        idle: [
          'Đang giã thuốc, đừng làm ồn.',
          'Mấy đứa nhỏ sốt đã hạ rồi, may quá.'
        ],
        quest: {
          q_phu_thuoc: [
            'Thuốc cầm máu trong tủ sắp hết rồi, mà lính gác bị sói cào mấy người, mấy đứa nhỏ trong làng lại đang sốt. Học trò của ta thì lên thành phố lấy thuốc chưa về.',
            'Cháu ra bãi hoang hái giúp ta 3 cây thảo dược — lá xanh đậm, rễ ngắn, mọc ven đường bãi hoang. Đừng hái nhầm cỏ dại.'
          ],
          q_dan_3: [
            'Ngồi xuống, nghe ta nói. Có người bị thú cào nặng, vết thương không chờ được — ta cần 2 viên Hồi Xuân Đan, luyện cho kịp trước khi trời tối.',
            'Lò là của cháu, tay cũng là của cháu — ta chỉ đứng xem. Thân thể là cái bình, tu vi là nước; đan dược là thứ vá cái bình ấy cho người khác. Luyện hỏng thì làm lại, nhưng đừng để người bệnh chờ không. Làm đi.'
          ]
        },
        turnin: {
          q_phu_thuoc: [
            'Đủ rồi, đủ rồi! Có chỗ thuốc này là ta cứu được cả đội lính gác với lũ nhỏ.',
            'Cháu cầm lấy thịt thỏ ta để dành — đi đường xa mà đói thì ăn. Lần sau bị thương thì nhớ tới tìm ta sớm.'
          ],
          q_dan_3: [
            'Hai viên đều thành, lửa đều, dược tính không hao. Tay này... không thua gì học trò ta dạy mười năm.',
            'Ta truyền cho cháu phương Ngưng Khí Đan — đan hỗ trợ đột phá bậc trung, và cho thêm một viên ta luyện sẵn. Đường tu càng lên cao càng cần đan đỡ, cháu giữ lấy. Nhớ lời ta: bình nứt thì nước đổ hết — cứu người trước, tu mình sau cũng chưa muộn.'
          ]
        }
      },
      tho_ren: {
        lines: [
          'Nghe tiếng búa là biết lửa lò đang vừa tay! Lò này mà im tiếng thì là làng có chuyện đấy.',
          'Rèn xong giáp cho lính gác là ta rèn tới đồ của cháu. Người của làng này, ta không để ai thiếu đồ ra trận đâu.',
          'Có da sói thì mang tới, ta làm giáp cho. Mùa thú dữ sắp tới, lính gác cần giáp mới.'
        ],
        greeting: [
          'Vào lò thì nói to lên! Tai ta điếc vì tiếng búa rồi!',
          'Cần rèn cái gì thì nói, đừng ngại.'
        ],
        lore: [
          'Ta học rèn từ cha ta, cha ta học từ ông nội ta — ba đời thợ rèn ở làng này. Lò này chưa từng tắt lửa.',
          'Vũ khí tốt đánh quái mới đau, nhưng giáp tốt mới giữ được mạng. Người mới tu luyện hay ham công mà quên thủ — cháu đừng thế.',
          'Nghe nói trên Thanh Sơn có thợ rèn tiên gia, rèn ra kiếm biết bay. Ta cả đời chỉ mong được nhìn một lần.',
          'Giáp da sói cho hai anh em gác cổng xong rồi, mặc nhẹ mà dai. Mùa thú dữ này, đứa nào đứng cổng cũng phải có giáp tử tế.',
          'Nanh Sơn Quân mà mang về được, ta rèn cho cháu một món đồ ra trò. Nanh con lợn vương ấy cứng hơn sắt thường nhiều.'
        ],
        idle: [
          'Búa này nặng lắm, cháu nhấc thử không?',
          'Lửa lò đang vừa, đừng tưới nước vào.'
        ],
        quest: {
          q_phu_da: [
            'Mùa thú dữ sắp tới, đội lính gác cần giáp mới mà sắt thì nặng, mặc vào chạy không kịp sói. Ta tính làm giáp da sói — nhẹ mà dai.',
            'Cháu săn giúp ta 2 con Sói Con lấy da, da phải còn nguyên, đừng để rách — rách thì giáp không kín.'
          ]
        },
        turnin: {
          q_phu_da: [
            'Da tốt! Để ta thuộc da rồi rèn giáp cho A Hổ, A Báo. Có giáp này, hai đứa nó đứng cổng cũng vững hơn.',
            'Đây là công rèn của cháu. Sau này cháu cần rèn cái gì thì cứ mang tới, ta tính giá làng.'
          ]
        }
      },
      linh_gac: {
        lines: [
          'Đêm nào yên là đêm đó ta với A Báo thay nhau ngủ gật trên cổng — nói nhỏ thôi, trưởng làng mà nghe được thì chết hai đứa.',
          'Cháu thấy cổng này cũ vậy chứ nó đứng qua bao mùa thú dữ rồi. Gỗ mục thì ta thay, chứ cổng thì chưa ngã bao giờ.',
          'Có lần sói tới sát cổng mà ta cứ tưởng chó nhà ai đi lạc. Từ dạo đó, con gì tới gần cổng ta cũng ngắm kỹ ba lần.'
        ],
        greeting: [
          'Đứng lại! À, người làng à — đi đi, nhưng ra ngoài thì cẩn thận.',
          'Cổng Nam Môn mở cả ngày. Có việc thì tìm trưởng làng, đừng lang thang ngoài trấn ban đêm.'
        ],
        lore: [
          'Ta với A Báo là sinh đôi, canh cổng từ năm mười sáu tuổi. Người ta hay nhầm hai đứa ta — đến mẹ ta đôi khi cũng nhầm!',
          'Đêm qua sói tới gần ruộng cuối làng. Mùa này năm nào sói cũng bạo hơn năm trước.',
          'Lợn rừng phía nam mới đáng sợ. Nó húc một phát là gãy cả hàng rào. Nghe nói trong rừng sâu có một con lợn vương già, gọi là Sơn Quân — gặp nó thì chạy, đừng đánh.'
        ],
        idle: [
          'Gió đêm nay lạnh, cháu khoác thêm áo đi.',
          'Cổng này ta canh, cháu cứ yên tâm.'
        ],
        quest: {
          q_chinh_5: [
            'Tới rồi đấy! Chuông cổng vừa rung - thú dữ tràn qua bãi hoang, đang kéo thẳng về Nam Môn! Sói đi đầu, lợn rừng theo sau, đông hơn mọi năm gấp mấy lần.',
            'Ta với A Báo giữ hai bên cổng, cháu giữ chính giữa đường. Đừng để con nào lọt qua cổng - sau lưng cháu là cả làng đấy. Đánh đuổi 5 con sói đầu đàn là bầy sẽ vỡ!'
          ]
        },
        turnin: {
          q_chinh_5: [
            'Bầy vỡ rồi! Chúng chạy hết về phía rừng rồi! Cháu thấy không - cổng còn đứng, làng còn yên, là nhờ có cháu giữ giữa đường đấy.',
            'Nhưng nghe ta nói: bầy thú chạy có hàng có lối như có con gì dẫn đầu vậy. Trong rừng sâu, Sơn Quân đang gọi bầy. Cháu phải tìm Hà lão thợ săn - chỉ ông ấy biết đường tới sào huyệt của nó.'
          ]
        }
      },
      linh_gac2: {
        lines: [
          'Ca đêm buồn ngủ lắm, nhưng được cái ngắm trăng rõ. Trăng tròn là sói hay tru — đêm đó thì hết buồn ngủ.',
          'Anh ta — A Hổ — bắn tên không giỏi bằng ta đâu. Nhưng mà cháu đừng nói lại, anh ta cãi cả ngày đấy.',
          'Ngồi trên cổng ban đêm nghe được cả tiếng suối chảy qua làng. Yên vậy mà làng này phải giữ, cháu ạ.'
        ],
        greeting: [
          'Cổng vẫn mở. Có gì lạ thì chạy về báo, đừng đánh nhau một mình.',
          'Đêm yên thì ta chỉ ngồi nghe gió. Đêm có sói thì khác.'
        ],
        lore: [
          'Ta là A Báo, ca đêm. Anh ta là A Hổ, ca ngày — hai đứa ta là sinh đôi nên người ta hay nhầm.',
          'Đêm qua ta bắn ba mũi tên mới đuổi được sói khỏi ruộng cuối làng. Cháu ra bãi thì đi ban ngày, đừng đi đêm.',
          'Người làng bảo nhau: ban ngày gặp A Hổ thì cười, ban đêm gặp A Báo thì yên tâm ngủ. Cũng đúng.',
          'Đêm thú dữ đánh làng, ta đứng trên cổng bắn xuống mới thấy rõ: cả bầy chạy vòng quanh một điểm trống giữa bãi, như chờ lệnh. Con Sơn Quân chưa hề lộ mặt.',
          'Vào rừng tìm Sơn Quân thì đi theo vệt cây đổ và dấu chân to như cái mẹt. Ta bắn tên đánh dấu đường cho cháu rồi - cứ thế mà đi.'
        ],
        idle: [
          'Tên của ta còn đủ, cháu đừng lo.',
          'Đêm nay trăng sáng, sói ít dám tới gần.'
        ],
        quest: {},
        turnin: {}
      },
      tieu_thuong: {
        lines: [
          'Hàng của ta không nhiều, nhưng món nào cũng là ta tự tay lựa từ phương bắc mang xuống đấy — không qua tay ai đâu.',
          'Đi buôn xa nhà, thứ lãi nhất không phải bạc đâu cháu — là quen được người tốt ở dọc đường.',
          'Cháu mà lên tới thành phố, thấy sạp nào cân gian thì nhớ mặt nó, về kể ta nghe để ta còn tránh xa ra.'
        ],
        greeting: [
          'Hàng mới về đây! Ghé xem đi, không mua cũng được ngắm!',
          'Huynh đệ đi đâu đấy? Ghé sạp ta uống miếng nước.'
        ],
        lore: [
          'Ta theo thương đội từ phương bắc xuống, tới làng này thì đường phía nam có sói nên kẹt lại. Ở riết rồi quen cả làng.',
          'Thương đội ta hẹn mùa xuân sẽ quay lại. Nghe đâu lúc đó người của Thanh Phong Phái cũng xuống núi — làng này sắp náo nhiệt rồi.',
          'Ta mơ có ngày mở được cửa hàng lớn ở thành phố. Nhưng mà... ở làng này cũng vui, người ta thật thà.',
          'Tin tức thì ta nhiều lắm: phía nam rừng sâu có ánh sáng lạ ban đêm, có người bảo là bảo vật, có người bảo là yêu thú. Cháu mà thành tu sĩ rồi thì đi xem thử.',
          'Chú Mã của ta - trưởng thương đội - về tới làng rồi, xe hàng kẹt ở đường mòn phía nam vì sói rừng. Đường mà thông, hàng hóa với tin tức lại chảy về làng như cũ.',
          'Thanh Phong Phái dựng bãi tuyển đệ tử ở chân núi phía bắc đấy. Ta đã lượn qua xem - cờ phướn xanh bay đầy trời, oai lắm!'
        ],
        idle: [
          'Cân này của ta không bao giờ gian.',
          'Cháu cần gì thì nói, ta để giá làng cho.'
        ],
        quest: {},
        turnin: {}
      },
      tho_san_ha: {
        lines: [
          'Đi rừng thì bước nhẹ, mắt nhìn dấu chân, tai nghe tiếng cành gãy. Rừng không giấu gì người biết nhìn.',
          'Ba mươi năm ta đi rừng này. Mười năm trước ta gặp Sơn Quân ở sâu trong rừng - nó to như con trâu, nanh cong như liềm. Ta chạy thoát, để lại vết sẹo này.',
          'Thú dữ năm nay kéo về làng không phải vì chúng ác. Linh khí từ giếng rò ra ngày một nhiều, chúng ngửi mùi mà tới.'
        ],
        greeting: [
          'Người làng Thanh Khê à? Vào lán ngồi, uống ngụm nước suối đã.',
          'Đi rừng thì bước nhẹ thôi. Cháu dẫm gãy cành khô là cả đàn thú nghe thấy đấy.'
        ],
        lore: [
          'Sơn Quân không phải lợn thường nữa. Nó sống gần trăm năm cạnh linh mạch, ăn linh chi, uống nước suối linh - lông nó cứng như thép, người làng gọi đàn của nó là quân của núi.',
          'Dấu của Sơn Quân: chân to như cái mẹt, hai vệt nanh cày đất hai bên đường mòn, cây cối quanh sào huyệt đổ rạp như bị bão quét.',
          'Ta với Trần Đức đi săn với nhau từ hồi còn để chỏm. Ông ấy giữ giếng, ta giữ rừng - hai anh em giữ làng này mấy chục năm rồi.',
          'Có cậu nhỏ của Vạn Thú Môn lên lán của ta hôm rồi, nói năng lễ phép, thú rừng theo sau cả đàn mà không con nào sợ. Môn phái đó xem người bằng cách thú đối với người — cháu mà gặp cậu ta ở bãi tuyển thì cứ thật lòng, thú nó ngửi được cả lòng người đấy.'
        ],
        idle: [
          'Đang mài lại mũi tên. Tên cùn thì đừng vào rừng sâu.',
          'Đêm nay nghe tiếng tru dài lắm. Bầy sói rừng đang tụ lại.'
        ],
        quest: {
          q_chinh_6: [
            'A Hổ cho người nhắn: cháu muốn tìm Sơn Quân. Được - gan đấy. Nhưng đừng đi thẳng vào sào huyệt, phải đọc dấu của nó trước.',
            'Dọc đường mòn trong rừng có một bầy sói rừng là tai mắt của Sơn Quân. Hạ 4 con sói rừng, xem dấu chân và vệt nanh chúng để lại quanh đường mòn, rồi quay lại đây. Ta sẽ chỉ cháu chỗ nó nằm.'
          ]
        },
        turnin: {
          q_chinh_6: [
            'Dấu chân mới, vệt nanh còn ướt bùn... Đúng như ta đoán: Sơn Quân vừa rời sào huyệt ra suối uống nước mỗi sớm. Nó đang bồn chồn - linh khí rò từ giếng làm nó phát cuồng.',
            'Muốn đối đầu nó, cháu phải tới Miếu Sơn Thần gặp Từ bà trước. Phong ấn giếng và con lợn vương ấy có dây mơ rễ má với nhau - bà ấy biết rõ hơn ta.'
          ]
        }
      },
      giu_mieu: {
        lines: [
          'Vào miếu thì nhẹ chân. Sơn Thần không thích ồn ào, mà người già này cũng vậy.',
          'Ta giữ miếu này từ năm mười tám tuổi. Miếu nhỏ thôi, nhưng là chỗ người làng gửi gắm mỗi mùa thú dữ.',
          'Đêm qua ta mơ thấy nước giếng sôi. Sáng ra ra giếng xem thử - nước lạnh buốt, mặt nước nổi vòng sáng rồi tắt. Điềm không lành đâu cháu ạ.'
        ],
        greeting: [
          'Cháu tới thắp hương à? Vào đi, hương còn ấm.',
          'Ngồi xuống đây, để bà rót cho chén trà rừng.'
        ],
        lore: [
          'Bài khấn trấn phong ấn là do Thanh Khê lão nhân dạy miệng cho người giữ miếu đời đầu. Khấn chỉ làm phong ấn yên được một lúc, không vá được vết nứt - muốn giữ làng lâu dài phải có tu sĩ thật sự.',
          'Sơn Quân ở rừng sâu thực ra cũng là kẻ giữ núi. Nó phát cuồng là vì phong ấn nứt, linh khí thoát ra hỗn loạn làm thú nào gần linh mạch cũng bồn chồn.',
          'Chồng bà mất trong mùa thú dữ hai mươi năm trước, cũng ở cổng Nam Môn. Cho nên mỗi lần chuông cổng rung, bà lại ra miếu ngồi tới sáng.'
        ],
        idle: [
          'Hương sắp tàn, để bà thay nén mới.',
          'Lá bùa cũ trên cửa miếu ngả màu hết rồi. Năm nay nhiều điềm lạ quá.'
        ],
        quest: {
          q_chinh_7: [
            'Bà chờ cháu mãi. Nghe đây: phong ấn dưới giếng vừa nứt thêm một đường - giữa trưa mà nước giếng phát sáng, cả làng xì xào. Linh khí trào ra như nước vỡ bờ, Sơn Quân ngửi thấy sẽ kéo bầy về giếng.',
            'Phải đối đầu Sơn Quân ngay trong rừng, trước khi nó tới được làng. Hạ nó, mang nanh của nó về đây - nanh lợn vương hút linh khí trăm năm, dùng làm vật trấn trong lễ khấn thì phong ấn mới yên lại được một thời gian.'
          ],
          q_phu_bao_tin: [
            'Phong ấn yên lại rồi, nhưng đó chỉ là vá tạm. Cháu về làng báo lại cho Trần Đức từng lời bà dặn: vết nứt còn đó, làng cần người của Thanh Phong Phái giúp mới giữ được lâu dài.',
            'Đi đi, nói với ông ấy là bà Từ vẫn ngồi ở miếu này, chưa bỏ đi đâu cả.'
          ]
        },
        turnin: {
          q_chinh_7: [
            'Nanh Sơn Quân đây rồi... nặng trĩu linh khí. Sơn Quân chết, bầy thú mất đầu đàn, mùa thú dữ năm nay coi như qua, cháu ạ.',
            'Đêm nay bà làm lễ khấn trấn phong ấn bằng chiếc nanh này. Giếng sẽ yên lại một thời gian - nhưng nhớ lời bà: đây là vá tạm. Con đường dài của cháu, e là phải đi qua sơn môn Thanh Phong Phái.'
          ],
          q_phu_bao_tin: [
            'Trần Đức nghe rồi chứ? Tốt. Hai ông bà già này giữ làng được một đời, đời sau phải trông vào cháu và những người như cháu.',
            'Cầm lấy chút tu vi bà tích góp từ hương khói mà gửi cháu. Lên núi rồi, đừng quên làng.'
          ]
        }
      },
      thuong_nhan_ma: {
        lines: [
          'Đi buôn ba mươi năm, ta chỉ giữ một chữ tín. Hàng có thể mất, tín mất là mất hết.',
          'Xe hàng của ta đang kẹt ở đường mòn phía nam, sói rừng vây quanh không đi nổi. Hàng trong xe có thuốc, có vải, có muối cho cả vùng này.',
          'Tiểu Lục là cháu ta đấy. Nó kẹt ở làng này rồi thương làng lúc nào không hay - ta nhìn là biết.'
        ],
        greeting: [
          'Tu sĩ trẻ của làng Thanh Khê đây sao? Nghe danh cháu từ lúc còn ở ngoài bãi.',
          'Vào xem hàng đi. Hôm nay ta để giá làng cho người giữ làng.'
        ],
        lore: [
          'Đường mòn phía nam thông thì thương đội mới qua được. Đường tắc một mùa là cả vùng thiếu muối, thiếu thuốc - chuyện buôn bán hóa ra cũng là chuyện sống chết.',
          'Ta từng gặp người của Thanh Phong Phái trên đường núi. Họ ít nói, đi như gió, nhưng gặp xe đổ là dừng lại đỡ không lấy một đồng.',
          'Nghe nói bãi tuyển đệ tử ở chân núi phía bắc đã dựng xong. Thanh niên mấy làng quanh đây đang kéo về thử vận.'
        ],
        idle: [
          'Đang kiểm lại sổ hàng. Thiếu một bao muối là cả làng hỏi thăm.',
          'Ngựa hí suốt từ sáng. Chúng ngửi thấy mùi sói rừng còn vương trên đường.'
        ],
        quest: {
          q_phu_mo_duong: [
            'Cháu là tu sĩ của làng, ta nói thẳng: xe hàng của ta kẹt ở khúc đường mòn trong rừng, ba con sói rừng thay nhau rình, đánh xe không dám đi tiếp.',
            'Cháu dẹp giúp ta 3 con sói rừng quanh khúc đường ấy, xe lăn bánh được là ta trả công hậu hĩnh. Đường thông, cả làng cũng có lợi.'
          ]
        },
        turnin: {
          q_phu_mo_duong: [
            'Xe về tới cổng rồi! Người đánh xe kể cháu đánh sói rừng mà như dẹp cỏ. Đây, công của cháu, thêm một phần thịt lợn rừng cho nhà bếp quán trọ.',
            'Từ nay thương đội của ta coi Thanh Khê là nhà. Đường này, ta đi tới già.'
          ]
        }
      },
      hoc_tro: {
        lines: [
          'Em về rồi đây! Thành phố đông quá, mà thuốc quý nhất vẫn là thuốc cứu được người làng mình.',
          'Thầy Lý bắt mạch giỏi nhất vùng này đấy. Em học mười năm nữa chưa chắc theo kịp thầy.',
          'Sau trận thú dữ đánh làng, người bị thương nằm đầy sân hiệu thuốc. Tay em băng bó không kịp nghỉ luôn.'
        ],
        greeting: [
          'Chào anh/chị tu sĩ! Em là Tiểu Hạnh, học trò của thầy Lý - mới từ thành phố về.',
          'Có bị thương ở đâu không? Đưa em xem - em vừa học được cách băng bó mới trên thành phố.'
        ],
        lore: [
          'Trên thành phố, em nghe người ta kháo nhau Thanh Phong Phái mở bãi tuyển ở chân núi phía bắc. Ai có linh căn thức tỉnh đều được thử - làng ta cuối cùng cũng có người đi thử rồi.',
          'Linh chi mọc sâu trong rừng Thanh Sơn, gần suối linh, hút linh khí nên dược tính mạnh gấp mấy lần thảo dược thường. Người bị thú cào mà có linh chi giã đắp là lành nhanh lắm.',
          'Thầy Lý ngoài lạnh trong nóng thôi. Hồi em mới theo học, thầy mắng em suốt - mà đêm nào cũng để sẵn phần cơm cho em.'
        ],
        idle: [
          'Đang phơi thuốc, đừng giẫm lên mẹt thuốc của em.',
          'Sổ khám bệnh ghi gần hết cuốn rồi. Mùa này nhiều người bệnh quá.'
        ],
        quest: {
          q_phu_thuoc_rung: [
            'Sau trận thú dữ, người bị thương nhiều mà thảo dược thường cầm máu chậm quá. Em cần linh chi trong rừng Thanh Sơn để giã thuốc mạnh - mọc gần suối linh, tai nấm ánh xanh.',
            'Anh/chị vào rừng hái giúp em 3 tai linh chi. Cẩn thận sói rừng - thuốc quý mấy cũng không bằng mạng người đâu.'
          ],
          q_dan_1: [
            'Anh/chị biết không, thầy Lý vừa gật đầu cho anh/chị đứng lò đấy! Người làng mình mà biết luyện đan, sau này bị thương không phải chờ thành phố gửi thuốc nữa.',
            'Thầy dạy ai cũng bắt đầu từ hai phương cơ bản nhất. Anh/chị mở Đan Lô ở hiệu thuốc, học phương rồi tự luyện một viên Hồi Khí Tán mang về cho em xem — run tay là chuyện thường, mẻ đầu của em cháy mất nửa rổ thảo dược cơ mà.'
          ],
          q_dan_2: [
            'Mấy đứa nhỏ trong làng sốt hai hôm nay không hạ, mà Thanh Tâm Thảo sắc thuốc hạ sốt trong tủ vừa hết sạch. Em phải ở lại trông chúng, không đi hái được.',
            'Anh/chị hái giúp em 4 cây Thanh Tâm Thảo — cỏ thơm hoa trắng, mọc ở bãi cỏ ngoại ô làng với bụi rậm ven suối trong rừng. Nhanh chân giúp em, trẻ con sốt lâu là nguy.'
          ],
          q_dan_4: [
            'Anh/chị nghe tin gì chưa? Người của Đan Hà Cốc trên bãi tuyển nghe chuyện mẻ đan hẹn giờ của anh/chị, họ muốn tận mắt xem dược liệu vùng Thanh Sơn có thật tốt như lời đồn không.',
            'Em cần 3 tai Ngọc Tủy Chi gửi lên cho họ xem — nấm trắng trong như ngọc, mọc ở kẽ đá bãi luyện công trên chân núi, hiếm lắm. Mang được về, tiếng nhà thuốc làng mình đi xa đấy.'
          ]
        },
        turnin: {
          q_phu_thuoc_rung: [
            'Linh chi đây rồi, tai nào tai nấy còn đẫm sương! Có chỗ này, mấy anh lính gác bị thương nặng nhất cũng qua được.',
            'Thầy Lý mà biết anh/chị hái được linh chi tươi thế này, thế nào thầy cũng khen. Cảm ơn anh/chị - người làng mình cứu nhau là ở chỗ này.'
          ],
          q_dan_1: [
            'Trời ơi, viên Hồi Khí Tán đầu tay mà tròn đều thế này! Hồi em mới học, mẻ đầu cháy đen cả lò, thầy bắt dọn tro ba ngày.',
            'Thầy Lý nói người có tay đan thì phải dạy tiếp. Đây — phương Hồi Xuân Đan, Tụ Linh Đan với cả Tụ Khí Đan hỗ trợ đột phá, em chép sẵn cho anh/chị rồi. Từ nay anh/chị là người thứ hai của làng biết đứng lò đấy!'
          ],
          q_dan_2: [
            'Đủ 4 cây rồi! Anh/chị chờ em một lát — sắc ngay cho tụi nhỏ uống, đêm nay hạ sốt là mai lại chạy nhảy được.',
            'Nhân tiện, em gửi anh/chị thêm mấy phương em mới chép: Giải Độc Đan — thứ cứu người bị rắn cắn, Cường Thể Đan, với Tiểu Bồi Nguyên Đan bồi bổ tu vi. Học đi, làng mình cần người biết cả đánh thú lẫn cứu người.'
          ],
          q_dan_4: [
            'Ngọc Tủy Chi thật này! Trong như ngọc, sờ vào mát lạnh — đúng thứ mọc đủ năm hút sương núi mới được thế này.',
            'Em gửi kèm thư tay của em lên bãi tuyển rồi. Mà Đan Hà Cốc cũng để lại quà đáp lễ: phương Thần Hành Đan với một viên Đại Hồi Xuân Đan mẫu. Anh/chị cầm lấy — công hái dược hiếm là của anh/chị mà.'
          ]
        }
      },
      de_tu_phai: {
        lines: [
          'Thanh Phong Phái tuyển đệ tử không xem giàu nghèo, chỉ xem linh căn và tâm tính. Có căn mà không có tâm giữ người, phái cũng không nhận.',
          'Ta xuống núi lần này là lần đầu làm sứ giả. Trên đường đi, làng nào cũng kể chuyện thú dữ - Thanh Khê là làng duy nhất tự giữ được cổng của mình.',
          'Sơn môn ở trên cao, nhưng con đường tới sơn môn bắt đầu từ việc nhỏ nhất: giữ được một cái cổng làng.'
        ],
        greeting: [
          'Ngươi là tu sĩ trẻ của Thanh Khê? Ta là Tạ Thanh Vân, đệ tử Thanh Phong Phái, phụng lệnh xuống núi tuyển đệ tử.',
          'Đứng thẳng lên, để ta xem khí sắc. Ừm - mắt sáng, hơi thở đều. Có nền đấy.'
        ],
        lore: [
          'Thanh Phong Phái lập phái trên Thanh Sơn đã mấy trăm năm, thờ Thanh Phong kiếm ý: kiếm là để chắn trước người khác, không phải để giẫm lên người khác.',
          'Thanh Khê lão nhân năm xưa từng là khách khanh của phái. Chuyện ông phong ấn tu vi xuống giếng cứu làng, trong phái tới nay vẫn kể cho đệ tử mới nghe.',
          'Tuyển đệ tử có ba cửa: xem linh căn, xem tu vi, xem tâm. Hai cửa đầu đo được, cửa thứ ba phải nhìn việc người ta đã làm cho làng mình.',
          'Sơn Môn Đại Hội lần này do Thanh Phong Phái đứng ra chủ trì. Mười tông cùng về một bãi là chuyện mấy chục năm mới có - mà đầu mối, lại là cái giếng cổ ở làng ngươi.'
        ],
        idle: [
          'Cờ tuyển đệ tử đã treo. Người tới thử mỗi lúc một đông.',
          'Đang chép danh sách người qua thử linh căn. Tên làng Thanh Khê, ta để ở trang đầu.'
        ],
        quest: {
          q_chinh_8: [
            'Ta đã nghe hết chuyện của ngươi: giữ cổng Nam Môn, vào rừng hạ Sơn Quân, trấn lại phong ấn giếng cổ. Cửa tâm - ngươi qua rồi, khỏi phải thử.',
            'Chỉ còn cửa tu vi: Thanh Phong Phái chỉ nhận đệ tử từ Luyện Khí tầng 2. Ngươi thổ nạp cho đủ, đột phá lên tầng 2 rồi quay lại bãi tuyển này. Lệnh bài của phái đang chờ người xứng đáng.'
          ],
          q_chinh_9: [
            'Ngươi tới đúng lúc. Ta vừa nhận được phi thư của chưởng môn: chuyện phong ấn giếng cổ Thanh Khê nứt dần đã kinh động khắp vùng - linh nhãn lộ ra là chuyện lớn, không còn là việc riêng của Thanh Phong Phái nữa.',
            'Chín tông môn quanh Thanh Sơn đang kéo về đây: Huyền Pháp, Thiên Công, Đan Hà, Vạn Thú, Thiên Phù, Cửu Cung, Kim Cang, Ngũ Độc, Huyền Âm. Bề ngoài là dự Sơn Môn Đại Hội tuyển đệ tử, bề trong là ai cũng muốn tận mắt xem linh nhãn - và xem người đã trấn lại được phong ấn là ai.',
            'Trước khi họ tới, ngươi về làng báo cho trưởng làng Trần Đức một tiếng. Ông là người giữ bí mật giếng, khách tới xem giếng thì chủ nhà phải biết trước. Báo xong quay lại đây, ta lo phần còn lại.'
          ],
          q_chinh_18: [
            'Mười tông đều đã mở cửa với ngươi rồi. Trong mấy chục năm tuyển đệ tử, ta chưa từng thấy ai được cả mười tông gật đầu như vậy.',
            'Nhưng đường tu chỉ đi được một đường cho trọn. Hôm nay ta thay mặt Thanh Phong Phái chủ trì lễ chọn tông: ngươi hãy tĩnh tâm, mở bảng Tông Môn, và bái nhập tông mà ngươi muốn đi cùng tới cuối. Chọn xong, lệnh bài của tông đó sẽ trao tận tay ngươi.',
            'Và nhớ lời ta dặn từ ngày đầu: chọn tông nào cũng được, đừng chọn vì danh tiếng. Chọn vì con đường đó hợp với cái tâm đã giữ cổng Nam Môn của ngươi.'
          ]
        },
        turnin: {
          q_chinh_8: [
            'Luyện Khí tầng 2, khí tức vững như núi. Tốt. Đây là lệnh bài Thanh Phong - từ nay ngươi là đệ tử nhập môn của Thanh Phong Phái.',
            'Đừng vội mừng mà quên đường về. Sơn môn mở ra thế giới lớn, nhưng làng Thanh Khê mới là nơi dạy ngươi vì sao phải tu tiên. Mùa xuân này, chúng ta lên núi.'
          ],
          q_chinh_9: [
            'Trưởng làng đã hay tin rồi chứ? Tốt. Ông ấy giữ giếng một đời, đáng được biết trước tiên.',
            'Nhìn xuống bãi tuyển mà xem - cờ của các tông đang dựng lên rồi. Người đầu tiên ngươi nên gặp là Liễu Ngưng Sương của Huyền Pháp Tông, đài thử pháp của họ dựng ở phía tây bãi. Cứ thế mà đi, từng tông một. Ta ở đây chờ ngươi đi hết một vòng.'
          ],
          q_chinh_18: [
            'Lễ xong rồi. Từ giây phút ngươi chọn, con đường tu của ngươi chính thức có tên.',
            'Dù ngươi bái nhập tông nào, Thanh Khê vẫn là nhà, và cái giếng cổ kia vẫn chờ người trấn giữ. Đi đi - thế giới lớn đang mở, nhưng đừng quên đường về làng.'
          ]
        }
      },
      tong_phap: {
        lines: [
          'Huyền Pháp Tông xem người bằng tâm tĩnh hay loạn, không xem miệng nói hay.',
          'Ngũ hành luân trên ngực ta — pháp tùy tâm chuyển, tâm loạn thì pháp loạn.',
          'Đài thử pháp của tông ta dựng ở phía tây bãi. Đứng gần là biết ngay ai có pháp khí trong người.'
        ],
        greeting: [
          'Ngươi là người làng Thanh Khê đã trấn lại phong ấn? Hừm — để ta xem.',
          'Đứng yên. Ta đang xem khí quanh người ngươi... cũng không tệ.'
        ],
        lore: [
          'Huyền Pháp Tông tu pháp thuật ngũ hành: kim mộc thủy hỏa thổ, năm đường một gốc. Người nóng vội học pháp chỉ tổ tự đốt mình.',
          'Ta từng coi thường cái hội này. Nhưng một làng phàm tự giữ được cổng trước bầy thú, lại trấn được phong ấn linh nhãn — chuyện đó không phải làng nào cũng làm được.',
          'Thanh Khê lão nhân năm xưa từng đấu pháp với trưởng lão của tông ta trên đỉnh Thanh Sơn. Thắng bại không ai kể, chỉ kể rằng hai người uống rượu với nhau tới sáng.'
        ],
        idle: [
          'Đài thử pháp lại rung... khỉ núi ở đây quậy thật.',
          'Tâm tĩnh thì pháp mới nghe lời. Ta nói câu này mỗi ngày, với chính mình.'
        ],
        quest: {
          q_tong_phap: [
            'Muốn Huyền Pháp Tông mở cửa, đừng nói — hãy làm. Đài thử pháp của ta dựng chưa xong đã bị khỉ mặt đỏ trên núi kéo xuống phá: chúng giật cờ, lật đài, còn ngồi lên đầu cột mà kêu.',
            'Dẹp 4 con Khỉ Mặt Đỏ quậy phá quanh bãi tuyển và ven đường núi cho ta. Đánh được khỉ mà không để pháp khí loạn xạ — đó mới là cửa thử của pháp tu: tay nhanh, tâm phải tĩnh hơn tay.'
          ]
        },
        turnin: {
          q_tong_phap: [
            'Đài yên rồi. Ta đứng xa xem hết: đòn của ngươi gọn, không thừa một nhịp — pháp khí trong người ngươi nghe lời ngươi, điều đó hiếm ở người mới.',
            'Huyền Pháp Tông mở cửa với ngươi. Ngũ Hành Luân Ấn này, từ nay ngươi được phép nhắc tên tông ta trước mặt người ngoài.'
          ]
        }
      },
      tong_khi: {
        lines: [
          'Thiên Công Phường trọng tay nghề. Tay cháu mà vững, phường ta có chỗ.',
          'Khí do tay người, đạo do tâm rèn — nói ít thôi, làm đi.',
          'Đừng chạm vào mấy món khí trên bàn của ta. Có món còn nóng đấy.'
        ],
        greeting: [
          'Cháu là tu sĩ trẻ của Thanh Khê à? Đưa tay đây ta xem — ừm, tay có chai, là tay làm việc.',
          'Tìm phường ta có việc gì? Nói thẳng, ta không quen vòng vo.'
        ],
        lore: [
          'Thiên Công Phường rèn pháp bảo cho nửa vùng này. Kiếm của Thanh Phong, lò của Đan Hà, đến chuông cổng làng cháu — một nửa là đồ qua lò của phường.',
          'Vật liệu tốt phải tự tay đi lấy, người rèn mới hiểu nó. Sắt mua ngoài chợ rèn mười món hỏng chín, vì nó không có "duyên" với người cầm búa.',
          'Phong ấn giếng của làng cháu là đồ của Thanh Khê lão nhân để lại. Ta nói thật: khắp vùng này không còn ai rèn được một cái trận phong ấn như thế nữa.'
        ],
        idle: [
          'Đang mài dở lưỡi kiếm, đừng làm ta phân tâm.',
          'Bụi than bám tay là huân chương của phường ta đấy.'
        ],
        quest: {
          q_tong_khi: [
            'Phường ta thử người không bằng lời. Trong Rừng Thanh Sơn có Lợn Mông Sắt — bờm nửa thân sau của nó cứng như thép, là vật liệu rèn giáp tốt nhất vùng này, mà thợ non tay không dám lại gần.',
            'Hạ 2 con Lợn Mông Sắt, mang bờm sắt về đây cho ta. Làm được, Thiên Công Phường coi cháu là người của nghề. Làm không được thì cũng đừng cố — lò rèn không thiếu người, chỉ thiếu người biết giữ mạng.'
          ]
        },
        turnin: {
          q_tong_khi: [
            'Để ta gõ thử... keng! Đúng bờm sắt thật, sợi nào sợi nấy còn nguyên, không cháy xém, không dập nát — cháu hạ nó gọn gàng, biết giữ vật liệu.',
            'Tốt. Thiên Công Phường mở cửa với cháu. Sau này có món khí nào cháu mơ ước, cứ tới lò của phường — ta tính giá người nhà.'
          ]
        }
      },
      tong_dan: {
        lines: [
          'Hít hà... người cháu có mùi thuốc mới hái. Đan Hà Cốc thích người như vậy.',
          'Một lò đan tốt cứu người trước, cầu đạo sau. Nhớ lấy.',
          'Vào gần lò thì nín thở một chút — khói mẻ này hơi gắt.'
        ],
        greeting: [
          'Ồ, tu sĩ trẻ của làng Thanh Khê! Lại gần đây, để lão hít hà xem cháu vừa đi đâu về.',
          'Cháu tới thăm lò đan của Cốc ta đấy à? Ngồi, ngồi, trà thuốc vừa pha xong.'
        ],
        lore: [
          'Đan Hà Cốc ở trong một thung lũng phía đông, ba mặt là vách đá đỏ như lửa lò nên mới có tên Đan Hà. Đệ tử vào Cốc, việc đầu tiên học không phải luyện đan — là nhận mặt thuốc.',
          'Linh chi quanh suối linh của Thanh Sơn hút linh khí từ giếng cổ mà lớn, dược tính gấp mấy lần linh chi thường. Lão sống hơn sáu mươi năm, đây là lần thứ hai thấy loại này.',
          'Lý đại phu của làng cháu là bạn thư từ của lão mấy chục năm. Thuốc của ông ấy không có phép tiên, mà người làng qua tay ông ấy thì ít ai mất — cái tâm cũng là một vị thuốc đấy cháu.'
        ],
        idle: [
          'Mẻ này phải canh lửa ba ngày. Đan tu là nghề của người kiên nhẫn.',
          'Hít hà... gió đổi hướng rồi, sắp mưa. Đóng cửa lò thôi.'
        ],
        quest: {
          q_tong_dan: [
            'Đan Hà Cốc thử đệ tử bằng một mẻ đan thật. Lão cần linh chi quanh suối linh trong Rừng Thanh Sơn — hái cho lão 3 tai còn đẫm sương sớm, tai nào tai nấy phải nguyên, dập một góc là dược tính thoát hết.',
            'Hái linh chi là việc của tay nhẹ và mắt tinh. Cháu hái được đủ 3 tai nguyên vẹn mang về, lão mở lò ngay trước mặt cháu — xem hết một mẻ đan của Cốc ta, coi như qua cửa.'
          ]
        },
        turnin: {
          q_tong_dan: [
            'Hít hà... thơm! Ba tai linh chi còn nguyên sương, không dập một góc nào. Tay cháu nhẹ hơn khối đệ tử trong Cốc của lão đấy.',
            'Ngồi xuống mà xem lão mở lò. Khói này, lửa này — từ hôm nay Đan Hà Cốc mở cửa với cháu. Khi nào muốn học luyện đan, cứ theo mùi khói thuốc mà tìm tới Cốc.'
          ]
        }
      },
      tong_thu: {
        lines: [
          'Suỵt — nghe chim rừng kêu không? Chúng đang bàn tán về cháu đấy.',
          'Vạn Thú Môn không hỏi cháu giết được bao nhiêu thú, chỉ hỏi thú có chịu lại gần cháu không.',
          'Con chồn nhỏ kia là bạn ta. Nó cắn người lạ, cháu đừng thò tay.'
        ],
        greeting: [
          'A, người giữ cổng Nam Môn! Thú rừng quanh đây đồn về anh/chị hết rồi đấy.',
          'Lại gần đi, đừng sợ — đàn thú sau lưng ta hiền lắm, khi chúng chưa đói.'
        ],
        lore: [
          'Vạn Thú Môn tu bằng cách kết bạn với thú: cùng ăn, cùng ngủ, cùng đánh trận. Linh thú của môn ta không phải vật cưỡi — là anh em.',
          'Sơn Quân chết, bầy thú Thanh Sơn mất đầu đàn, đang rối như ong vỡ tổ. Mấy tháng này môn ta bận lắm — phải có người thú rừng tin được đứng ra giữ chúng yên.',
          'Hà lão thợ săn ở lán trại trong rừng là người lạ nhất ta từng gặp: săn thú cả đời mà thú rừng gặp ông không chạy. Môn ta xem vậy là đã tu được nửa đường của ngự thú rồi.'
        ],
        idle: [
          'Đang dỗ con sói con này ngủ. Nó mồ côi từ trận thú dữ đánh làng đợt trước.',
          'Hôm nay chim kêu hướng đông nhiều — trong rừng có chuyện vui đấy.'
        ],
        quest: {
          q_tong_thu: [
            'Vạn Thú Môn thử người không giống ai: ta không cần anh/chị đánh thắng con gì cả. Thú rừng ngửi được lòng người — kẻ tham, kẻ sợ, kẻ ác, chúng biết hết.',
            'Tới lán trại trong Rừng Thanh Sơn gặp Hà Thiết Sơn, xin theo ông vào gần bầy thú một buổi. Ông ấy là người duy nhất ở vùng này mà thú rừng tự nguyện lại gần. Nếu đi cùng ông mà bầy thú không gầm, không chạy — là anh/chị qua cửa của môn ta.'
          ]
        },
        turnin: {
          q_tong_thu: [
            'Hà lão cho người nhắn rồi: bầy sói rừng ngửi tay anh/chị xong còn nằm xuống ngủ tiếp. HA! Ta biết ngay mà — người giữ được cổng làng cho cả trăm người thì thú nào chẳng tin.',
            'Vạn Thú Môn mở cửa với anh/chị. Từ nay vào rừng, cứ huýt sáo ba tiếng — thú của môn ta nghe được sẽ không làm khó anh/chị đâu.'
          ]
        }
      },
      tong_phu: {
        lines: [
          'Đứng yên một chút — nét mặt cháu có khí loạn, vẽ bùa lúc này là hỏng.',
          'Một nét bùa ngay, trấn tà an dân. Tay phải vững như núi, cháu ạ.',
          'Giấy bùa sợ nhất là ẩm và người hấp tấp. Cháu đừng chạm vào xấp giấy kia.'
        ],
        greeting: [
          'Cháu tới rồi. Đứng thẳng, thở đều — để ta nhìn khí sắc đã.',
          'Thiên Phù Các chào người giữ cổng. Hôm thú dữ đánh làng, nếu có phù trấn của các ta thì cổng ấy còn vững hơn nữa.'
        ],
        lore: [
          'Bùa của Thiên Phù Các không phải mê tín: nét bùa là nét dẫn linh khí, giấy vàng giữ khí, chu sa khóa khí. Vẽ sai một nét, khí thoát hết — còn lại là tờ giấy.',
          'Cổng Nam Môn của làng cháu là chỗ các ta để mắt từ lâu. Một cái cổng làng phàm mà đứng vững qua một trận thú triều — nơi đó có "thế", phù tu nhìn là biết.',
          'Thanh Khê lão nhân trấn giếng bằng phong ấn, còn các ta trấn nhà bằng bùa. Hai đường khác nhau, cùng một ý: để người trong nhà ngủ yên.'
        ],
        idle: [
          'Đang phơi giấy bùa. Nắng hôm nay tốt, giấy khô đều.',
          'Nét này... chưa ngay. Vẽ lại.'
        ],
        quest: {
          q_tong_phu: [
            'Thiên Phù Các dựng tạm một kho giấy bùa ven suối linh trong Rừng Thanh Sơn, chuẩn bị viết bùa trấn cho cả vùng mùa thú dữ tới. Vậy mà rắn lục đuôi đỏ bò vào kho lúc nào không hay — chúng sợ giấy khô ấm, chui vào nằm cuộn trong xấp giấy.',
            'Dẹp 3 con Rắn Lục Đuôi Đỏ trong kho và quanh bờ suối cho các ta. Nhớ: tay phải nhanh mà không được hoảng — cháu mà giẫm bừa, xấp giấy hỏng hết, bùa trấn cả vùng cũng hỏng theo.'
          ],
          q_tal_1: [
            'Cháu giữ kho giấy có tâm, các ta nhìn thấy. Muốn học phù phương Linh phẩm thì trước hết phải hiểu tờ giấy mình viết lên: giấy phù của các ta xé sợi từ cỏ thuốc bờ suối, phơi đúng nắng giếng cổ mới giữ được linh khí.',
            'Đi hái 5 cây Thảo Dược tươi mang về đây. Các ta xem sợi cỏ cháu chọn có đều không — chọn dược cũng như chọn nét bùa, qua loa là hỏng cả lá.'
          ],
          q_tal_2: [
            'Giấy đã có, mà chu sa trong kho cạn sạch. Không có chu sa khóa khí thì bùa viết xong khí thoát hết sau một đêm — phù phương cao hơn cũng đừng mơ.',
            'Ra bãi hoang hạ 2 con Lợn Mông Sắt cho các ta. Giống lợn đó ủi đất đỏ cả ngày, đất bám bờm chúng hay lẫn chu sa thô. Mang về đây, các ta mài ra cho cháu thấy chu sa thật khác đất đỏ thường thế nào.'
          ]
        },
        turnin: {
          q_tong_phu: [
            'Kho sạch rồi, xấp giấy còn nguyên, không một vết giẫm. Tay cháu vừa nhanh vừa giữ được bình tĩnh trước rắn độc — đúng chất người cầm bút vẽ bùa.',
            'Thiên Phù Các mở cửa với cháu. Đây là lời của các ta: khi nào cổng làng cần bùa trấn, cháu cứ lên tiếng, các ta không lấy một đồng.'
          ],
          q_tal_1: [
            'Sợi đều, lá tươi, không lẫn cỏ úa. Được — tay này cầm bút được.',
            'Các ta truyền cho cháu sáu phù phương Linh phẩm đầu tiên: Hỏa, Lôi, Kim Cang, Hồi Xuân, Tụ Linh và Giải Độc. Nhớ kỹ: phù là đồ đỡ đòn đỡ việc, không phải đường tu — đừng vì có phù mà lười thổ nạp.'
          ],
          q_tal_2: [
            'Đúng chu sa thô, mài ra đỏ tươi không lẫn sạn. Kho có mực đỏ trở lại rồi.',
            'Truyền thêm cho cháu bảy phương nữa: Băng, Kiếm Khí, Phá Giáp, Hộ Thân, Ẩn Tức, Trấn Áp và Truyền Tống. Lá Truyền Tống đắt và khó viết nhất đám này — trong bí cảnh linh khí rối, tuyệt đối không được xé bừa.'
          ]
        }
      },
      tong_tran: {
        lines: [
          'Cháu đang đứng ở vị trí thứ mấy của bãi này? Không biết à — đó là câu hỏi đầu tiên của trận tu.',
          'Một trận bày ra, thiên quân khó phá. Đánh nhau là hạ sách, cháu nhớ cho.',
          'Đừng bước qua vạch phấn kia. Ta đang bày dở một trận nhỏ.'
        ],
        greeting: [
          'Người tới rồi. Cháu vào bãi bằng hướng nam, bước qua đúng vị trí ta đang chờ — thú vị.',
          'Âu Dương Kỳ, Cửu Cung Trận Tông. Cháu đừng nhìn ta, nhìn mặt đất quanh cháu trước đã.'
        ],
        lore: [
          'Trận pháp là mượn thế đất, thế gió, thế người mà dựng thành lũy. Người trong trận mạnh gấp mười, vì họ không đánh một mình — họ đánh bằng cả ngọn núi sau lưng.',
          'Phong ấn giếng cổ của Thanh Khê lão nhân, xét cho cùng, là một đại trận thu nhỏ: linh nhãn là tâm trận, mặt giếng là trận nhãn. Nó nứt dần vì trăm năm không có trận sư bảo trì — không phải vì nó yếu.',
          'Cửu Cung có chín ô, đời người cũng có chín khúc quanh. Đứng sai ô thì đánh trăm trận thua trăm, đứng đúng ô thì không cần đánh.'
        ],
        idle: [
          'Đang tính lại hướng gió. Trận mà lệch hướng gió là trận chết.',
          'Cháu đừng dẫm lên mấy viên sỏi kia — chúng có thứ tự cả đấy.'
        ],
        quest: {
          q_tong_tran: [
            'Trận Tông thử người bằng một việc nghe thì dễ: dẫn khí đi đúng một vòng Cửu Cung. Ta đã vẽ sẵn trận đồ trong đầu cháu rồi — việc của cháu là thổ nạp, để linh khí trong người tự chạy theo chín ô của trận.',
            'Thổ nạp tích đủ 50 tu vi. Khí đi loạn, trận không sáng; khí đi đúng vòng, cháu sẽ tự thấy chín điểm trong người lần lượt ấm lên. Làm được, Cửu Cung Trận Tông mở cửa.'
          ]
        },
        turnin: {
          q_tong_tran: [
            'Chín điểm sáng lên đúng thứ tự, không sót một ô. Ta bày trận ba mươi năm, người mới dẫn khí qua cửu cung một lần mà trúng hết — đếm trên đầu ngón tay.',
            'Cửu Cung Trận Tông mở cửa với cháu. Nhớ lấy lời này: từ nay đi đâu, hãy nhìn mặt đất trước khi nhìn kẻ địch.'
          ]
        }
      },
      tong_the: {
        lines: [
          'HA! Vai rộng, đứng thẳng — cái thân này rèn được đấy cháu!',
          'Kim Cang Môn không dạy chạy trốn. Thân này là pháp bảo đầu tiên của người tu!',
          'Cháu ăn cơm chưa? Tu thân mà đói thì đừng nói chuyện tu!'
        ],
        greeting: [
          'Ồ! Người giữ cổng Nam Môn đây sao! Lại đây, để ta vỗ vai một cái — ừm, cứng cáp!',
          'Kim Cang Môn chào cháu! Ngồi xuống ăn miếng thịt đã, chuyện tông môn nói sau!'
        ],
        lore: [
          'Thể tu bọn ta bị thiên hạ chê là "chỉ có sức". Nhưng khi thú dữ tràn tới cổng, kẻ đứng đầu gió không phải người đọc nhiều sách nhất — là người đứng không ngã.',
          'Môn ta có một quy củ: đệ tử mới vào, việc đầu tiên không phải tập quyền — là gánh nước, bổ củi, xây nhà cho dân quanh núi ba tháng. Thân rèn từ việc thật, tâm cũng rèn từ việc thật.',
          'Năm xưa thú triều đánh lên núi, sư thúc của ta đứng một mình ở cổng núi nửa ngày cho cả môn rút lui. Về sau người ta hỏi bí quyết, ông ấy nói: "Ta chỉ không chịu ngã."'
        ],
        idle: [
          'Đang đấm bao cát. Cháu muốn thử một quyền không?',
          'Ăn no, ngủ kỹ, đứng thẳng — ba bí quyết của môn ta đấy.'
        ],
        quest: {
          q_tong_the: [
            'Kim Cang Môn thử đệ tử đơn giản lắm: không mưu, không mẹo, không pháp bảo. Ra bãi hoang phía nam làng cháu, hạ 3 con Lợn Rừng bằng sức thân thể của mình.',
            'Lợn rừng húc đau như búa tạ đấy cháu. Đứng vững được trước nó, đỡ được đòn của nó mà không lùi — là qua cửa của môn ta. Đi đi, ta ở đây chờ tin!'
          ]
        },
        turnin: {
          q_tong_the: [
            'HA HA! Ba con lợn rừng, người không một vết thương nặng! Ta nghe dân làng kể cháu đánh mà như đóng cọc xuống đất — không lùi một bước!',
            'Kim Cang Môn mở cửa với cháu! Từ nay ai dám nói thể tu chỉ có sức, cháu cứ dẫn họ tới gặp ta!'
          ]
        }
      },
      tong_doc: {
        lines: [
          'Đừng sợ, ta cười hiền thế này cơ mà. Người của Ngũ Độc Giáo không hại người vô cớ.',
          'Độc cũng là thuốc — tùy tay người dùng. Tay cháu có run không, để ta xem.',
          'Mấy lọ trên bàn của ta, cháu đừng ngửi thử. Có lọ ngửi là ngủ ba ngày đấy.'
        ],
        greeting: [
          'Ngươi không né tránh ánh mắt ta. Ừm — người làng này gan dạ thật.',
          'Đường Tĩnh, Ngũ Độc Giáo. Ngồi xuống đi, trà này không có độc đâu... hôm nay thì không.'
        ],
        lore: [
          'Quê ta từng chết người cả một thôn vì rắn độc trong một mùa mưa, vì không ai biết thuốc giải. Ngũ Độc Giáo học độc trước hết là để không còn ai chết như vậy nữa.',
          'Thiên hạ sợ độc mà không hiểu độc: cùng một con rắn, nọc của nó giết người, mà pha đúng liều lại cứu người bị thú cào trúng độc. Ranh giới chỉ ở tay người cầm.',
          'Ta nghe chuyện giếng cổ của làng ngươi: linh khí hỗn loạn thoát ra làm thú phát cuồng — trong mắt độc sư, đó cũng là một thứ "độc của đất". Chữa đất cũng như chữa người, phải tìm đúng huyệt.'
        ],
        idle: [
          'Đang phơi nọc rắn. Việc này cần nắng và sự im lặng.',
          'Con bọ cạp này là bạn ta nuôi ba năm rồi. Nó chỉ cắn người nói dối — ta đùa đấy.'
        ],
        quest: {
          q_tong_doc: [
            'Ngũ Độc Giáo thử người bằng một chén thuốc. Trong chén này là độc nhẹ ta tự pha — uống vào chỉ tê lưỡi và hơi chóng mặt, không chết được, ta cam đoan bằng danh dự của giáo.',
            'Uống xong, ngươi tự ra bãi hoang hái 4 cây Thảo Dược làm thuốc giải mang về đây. Người hoảng loạn sẽ hái nhầm cỏ dại; người bình tĩnh mới phân biệt được thảo dược thật khi đầu đang quay. Qua được, giáo ta mở cửa.'
          ]
        },
        turnin: {
          q_tong_doc: [
            'Để ta xem... đúng thảo dược cả bốn cây, sắc mặt hồng hào, tay không run. Ngươi biết không, đa số người uống chén thuốc đó xong là chạy về làng gọi đại phu.',
            'Ngũ Độc Giáo mở cửa với ngươi. Nhớ lời ta: độc không đáng sợ — kẻ đáng sợ là người không hiểu mình đang cầm thứ gì.'
          ]
        }
      },
      tong_am: {
        lines: [
          'Tiếng bước chân của cháu hôm nay nghe yên hơn hôm qua nhiều.',
          'Huyền Âm Cung tu bằng tiếng đàn. Người nóng tính, đàn không hay — cháu thì ta chưa biết.',
          'Ngồi xuống nghe ta đàn một đoạn không? Không mất tiền đâu.'
        ],
        greeting: [
          'Cháu đến rồi. Tiếng lòng cháu đang rối — là vì mười tông cùng mở trước mặt một lúc, phải không?',
          'Tiêu Uyển Nhi chào người giữ cổng. Đàn của ta hôm nay muốn đàn cho làng cháu nghe.'
        ],
        lore: [
          'Âm tu không yếu như người ta tưởng: tiếng đàn của Huyền Âm Cung trị được thương, an được thần, và khi cần, một khúc đàn làm thú dữ đang điên cũng phải khựng lại nghe.',
          'Cung ta có lệ: nơi nào vừa qua nạn, đệ tử phải tới đàn một khúc an hồn, không lấy tiền, không hỏi tên. Người chết cần được tiễn, người sống cần được nghe rằng đời vẫn còn tiếng đàn.',
          'Hoa nương ở quán trọ làng cháu mất chồng vì thú dữ trên đường nam. Ta tới Thanh Khê lần này, một nửa là vì đại hội — nửa còn lại là vì một khúc đàn còn nợ những người như chị ấy.'
        ],
        idle: [
          'Đang lên dây đàn. Dây này vừa thay, tiếng còn hơi non.',
          'Gió hôm nay đi qua hàng thông nghe như tiếng sáo. Núi này biết nhạc đấy.'
        ],
        quest: {
          q_tong_am: [
            'Huyền Âm Cung thử người không bằng tai — bằng tim. Ta có một thẻ ngọc âm khắc khúc an hồn; khúc đàn chỉ trọn khi có người mang nó tới tận tay người cần nghe nhất.',
            'Mang thẻ ngọc này về quán trọ làng Thanh Khê, trao cho Hoa nương — người đàn bà góa chồng vì thú dữ, mấy năm nay vẫn mở quán cho người đi đường đỡ phải đi trong đêm đói. Nói với chị ấy: đêm nay, ở bãi tuyển này, sẽ có một khúc đàn đàn cho những người đã ngã xuống. Làm được việc nhỏ mà nặng tình này, Huyền Âm Cung mở cửa với cháu.'
          ]
        },
        turnin: {
          q_tong_am: [
            'Chị Hoa nương nhận thẻ rồi chứ? Tốt. Cháu biết không, lúc đưa thẻ, tay cháu có ngập ngừng không — đó mới là thứ cung ta xem, chứ không phải cháu đi nhanh hay chậm.',
            'Đêm nay ta đàn. Huyền Âm Cung mở cửa với cháu — người hiểu tiếng đàn là để an người, mới xứng nghe đến khúc thứ hai.'
          ]
        }
      }
    },
    QUEST_STORIES: {
      q_chinh_19: { title: "Báo danh nhập môn", giver: "de_tu_phai",
        story: "Lễ bái sư khép lại, sổ đệ tử của tông có thêm một cái tên từng là phàm nhân làng Thanh Khê. Việc đầu tiên của đời đệ tử không phải việc trên núi, mà là quay về làng báo tin cho người đã giữ mình từ thuở chưa biết tu hành là gì.",
        giverLines: ["Tên ngươi đã vào sổ đệ tử. Trước khi nhận việc tông đầu tiên, về làng Thanh Khê báo cho trưởng làng Trần Đức biết ngươi đã bái nhập tông nào.", "Người giữ làng một đời, đáng được nghe tin này từ chính miệng ngươi. Xong quay lại đây, việc của tông đang chờ."],
        turninLines: ["Trưởng làng đã biết tin. Tốt — gốc rễ yên rồi mới tu xa được.", "Từ giờ việc của tông sẽ qua tay ta giao cho ngươi. Làm cho tử tế, đừng phụ cái tên trong sổ."] },
      q_chinh_20: { title: "Đường mòn lại động", giver: "tho_san_ha",
        story: "Đường mòn Thanh Sơn yên chưa được bao lâu đã lại có sói kéo bầy chặn người — bạo hơn trước, như có linh khí lạ trong rừng xúi giục. Hà Thiết Sơn nhờ người đệ tử mới của tông môn dẹp bầy sói, giữ đường cho làng và bãi tuyển.",
        giverLines: ["Đường mòn lại có sói kéo bầy chặn người rồi — lần này chúng bạo hơn hẳn, như có linh khí lạ xúi giục trong rừng.", "Ngươi dẹp 5 con Sói Rừng dọc đường mòn cho ta. Đường yên thì làng mới yên, bãi tuyển mới có người qua lại."],
        turninLines: ["Đường mòn sạch bầy sói. Mắt ngươi giờ nhìn rừng khác hẳn hồi mới vào nghề săn.", "Viên Yêu Đan Cấp 1 này rơi từ con sói đầu đàn — ta lượm được lúc dọn đường. Của ngươi đấy."] },
      q_chinh_21: { title: "Phá thêm một quan", giver: "dai_phu",
        story: "Lý lão bắt mạch rồi lắc đầu: nền có mà khí còn nổi. Trước khi tông môn giao việc lớn, người đệ tử phải tự phá thêm một quan bằng chính tu vi của mình — mốc đứng vững ở hậu kỳ Luyện Khí.",
        giverLines: ["Ta bắt mạch cho ngươi rồi. Nền thì có, mà khí còn nổi — tu vi tích chưa đủ sâu.", "Trước khi tông môn giao việc lớn, ngươi tự phá thêm một quan nữa cho ta xem. Đột phá thành công một lần, bằng chính sức mình. Ta ở đây chờ tin."],
        turninLines: ["Khí đã trầm, mạch đã ổn. Giờ thì ta yên tâm kê đơn lớn cho ngươi rồi.", "Viên Ngưng Khí Đan này ta cho — uống trước những lần thổ nạp dài. Đi đi, đường của ngươi còn dài lắm."] },
      q_chinh_22: { title: "Vương thú kết đan", giver: "tho_san_ha",
        story: "Hà Thiết Sơn tiết lộ bí mật giữ kín mười năm: vương thú trấn núi sống đủ trăm năm sẽ kết Yêu Đan Cấp 3 — nguyên liệu cốt lõi của Trúc Cơ Đan. Muốn có đường lên Trúc Cơ, người đệ tử phải tự tay hạ một vương thú mang hình Sơn Quân.",
        giverLines: ["Ta nói điều giữ kín mười năm nay: vương thú trấn núi sống đủ trăm năm sẽ kết Yêu Đan Cấp 3 trong bụng.", "Thứ đó là nguyên liệu cốt lõi của Trúc Cơ Đan — không có nó, không ai trong vùng này lên được Trúc Cơ. Ngươi phải hạ 1 vương thú mang hình Sơn Quân: con cũ hồi sinh ở sào huyệt trong rừng nhà, hoặc Gầm Sơn Hổ Vương ở Hang Hổ Gầm trong Đại Sơn."],
        turninLines: ["Ngươi... hạ được vương thú thật rồi. Viên Yêu Đan Cấp 3 trong bụng nó đây — ta xử lý sạch cho ngươi.", "Giữ như giữ mạng. Cả vùng này mấy chục năm mới thấy một viên. Đường lên Trúc Cơ của ngươi bắt đầu từ viên đan này."] },
      q_chinh_23: { title: "Phương đan dẫn kiếp", giver: "hoc_tro",
        story: "Tin người đệ tử chạm tay vào Yêu Đan Cấp 3 lan về làng. Lý lão cho học trò gọi người lên hiệu thuốc: phương Trúc Cơ Đan — phương đan dẫn kiếp — chỉ truyền cho người sắp dùng tới, kèm hai vị dược khó trong kho của ông.",
        giverLines: ["Ngươi tới rồi! Thầy Lý dặn em chờ ngươi ở đây từ sáng.", "Thầy nói người đã chạm tay vào Yêu Đan Cấp 3 thì phải nghe thầy dặn về phương Trúc Cơ Đan — phương đan dẫn kiếp, chỉ truyền cho người sắp dùng tới. Tới hiệu thuốc gặp thầy ngay đi."],
        turninLines: ["Thầy đã truyền phương cho ngươi rồi phải không? Em thấy thầy cười cả buổi chiều.", "Thầy còn gửi ngươi Thanh Linh Tủy với Ngọc Tủy Chi trong kho nữa. Học trò của thầy chưa ai đi xa được như ngươi đâu."] },
      q_chinh_24: { title: "Giếng cổ lại sáng", giver: "giu_mieu",
        story: "Giữa trưa, giếng cổ Thanh Khê lại phát sáng — lần này mặt nước nứt một vệt sáng thẳng đứng như vết rách trên trời phản chiếu xuống đáy giếng. Đây là mầm của biến cố lớn sau này: vết nứt hư không đang gõ cửa vùng núi này. Từ bà cho gọi người đệ tử về báo gấp cho trưởng làng.",
        giverLines: ["Ngươi tới đúng lúc lắm. Giữa trưa nay, giếng cổ lại phát sáng — mà lần này khác hẳn những lần trước.", "Mặt nước nứt một vệt sáng thẳng đứng, như vết rách trên trời phản chiếu xuống đáy giếng. Bà già này coi miếu mấy chục năm chưa từng thấy. Về làng báo ngay cho trưởng làng Trần Đức từng điều ngươi nghe ở đây."],
        turninLines: ["Trưởng làng đã cho người canh giếng cả đêm. Ngươi làm đúng lắm — chuyện này không giấu được, cũng không nên giấu.", "Bà có linh cảm những năm tới núi này không yên. Ngươi tu cho vững vào — làng còn trông vào lớp trẻ các ngươi."] },
      q_chinh_25: { title: "Ngưỡng cửa thiên lôi", giver: "de_tu_phai",
        story: "Giếng sáng là điềm của những năm không yên, nhưng việc trước mắt của người đệ tử chỉ có một: đứng vững ở ngưỡng Trúc Cơ. Tạ Thanh Vân gửi viên Đại Hồi Xuân Đan của tông môn và dặn tới Miếu Sơn Thần nhận bài khấn trấn tâm Thanh Khê lão nhân để lại.",
        giverLines: ["Ngươi nghe chuyện giếng cổ lại sáng rồi chứ? Ta trầm ngâm cả buổi — phong ấn biến động là điềm của những năm không yên.", "Nhưng việc của ngươi trước mắt chỉ có một: đứng vững ở ngưỡng Trúc Cơ. Tới Miếu Sơn Thần gặp Từ bà, nhận bài khấn trấn tâm bà giữ từ thời Thanh Khê lão nhân."],
        turninLines: ["Từ bà đã trao bài khấn cho ngươi. Viên Đại Hồi Xuân Đan này là của tông môn gửi — mang theo vào ngày dẫn động thiên lôi.", "Nhớ: đột phá Trúc Cơ không phải bấm một nút là xong. Trời sẽ hỏi ngươi bằng sấm sét. Chuẩn bị cho đủ rồi hẵng mở lò."] },
      q_chinh_26: { title: "Đạo cơ mới thành", giver: "de_tu_phai",
        story: "Tu vi viên mãn, Trúc Cơ Đan trong tay, bài khấn trong lòng. Người đệ tử mở lò tu hành dẫn động lôi kiếp: sống sót qua thiên lôi là đạo cơ kết thành, bước sang hàng tu sĩ Trúc Cơ. Việc độ kiếp do hệ cảnh giới phụ trách — chương này dẫn truyện tới đúng ngưỡng đó.",
        giverLines: ["Mọi thứ đã sẵn: tu vi viên mãn, Trúc Cơ Đan trong tay, bài khấn trong lòng. Việc còn lại là của trời và của ngươi.", "Mở lò tu hành, dẫn động lôi kiếp, sống sót qua thiên lôi mà kết đạo cơ. Ta ở bãi tuyển này chờ — sống sót thì quay lại gặp ta."],
        turninLines: ["Thiên lôi tan rồi, đạo cơ đã kết. Từ hôm nay ngươi là tu sĩ Trúc Cơ — người thứ mấy của vùng này trong trăm năm, ngươi có biết không?", "Đừng vội mừng. Đạo cơ mới là nền móng. Phía trên còn Kim Đan, còn cả một bầu trời."] },
      q_chinh_27: { title: "Vân Hải có đường", giver: "de_tu_phai",
        story: "Trúc Cơ thành, mắt nhìn thế giới đã khác: sau Chi Đỉnh là Sơn Trung Vân Hải, đất của tu sĩ Trúc Cơ, và xa hơn là Đoạn Long Lĩnh — đường tới Kim Đan bắt đầu từ đó. Việc đầu tiên ở cảnh giới mới là thổ nạp cho đạo cơ đặc lại trước chuyến đi xa.",
        giverLines: ["Trúc Cơ thành, mắt ngươi nhìn thế giới đã khác. Sau Chi Đỉnh là Sơn Trung Vân Hải — đất của tu sĩ Trúc Cơ, và xa hơn là Đoạn Long Lĩnh.", "Trước chuyến đi xa đầu tiên, thổ nạp tích 300 tu vi cho đạo cơ đặc lại. Nền không vững mà đi xa là tự hại mình."],
        turninLines: ["Đạo cơ đã đặc, hơi thở dài và sâu như người tu mười năm. Ngươi sẵn sàng cho Vân Hải rồi.", "Hạt Long Tiên Thảo này ta tìm được trong kho tông — vị chính của phương Kim Đan sau này. Giữ kỹ, và đi cho xa."] },
      q_mon_thanh_phong_1: { title: "Tuần sơn đầu tiên", giver: "de_tu_phai",
        story: "Việc đầu tiên Thanh Phong giao cho đệ tử mới: theo đường núi từ bãi tuyển xuống bìa rừng, dẹp 3 con Sói Rừng đang rình người qua đường. Kiếm của phái là để chắn trước người khác — bắt đầu từ con đường này.",
        giverLines: ["Đệ tử mới của Thanh Phong? Việc đầu tiên ta giao không khó, mà là gốc: dẹp 3 con Sói Rừng rình người ở đường mòn rừng.", "Kiếm của phái này sinh ra để chắn trước người khác. Đi đi, cho ta xem kiếm của ngươi có chắn được không."],
        turninLines: ["Đường mòn yên rồi. Tốt — kiếm đầu tiên của đệ tử Thanh Phong phải là kiếm giữ đường, không phải kiếm khoe oai.", "Đây là thưởng của phái. Từ nay mỗi tuần đều có việc tuần sơn, đừng lười."] },
      q_mon_huyen_phap_1: { title: "Dẫn pháp nhập môn", giver: "tong_phap",
        story: "Huyền Pháp Tông không giao việc tay chân trước: ngươi tới đài thử pháp, thổ nạp dẫn linh khí đi đủ một vòng ngũ hành, tích 60 tu vi cho Liễu Ngưng Sương xem tâm tĩnh tới đâu.",
        giverLines: ["Huyền Pháp Tông không giao việc tay chân cho đệ tử mới. Tới đài thử pháp, dẫn linh khí đi đủ một vòng ngũ hành, tích 60 tu vi cho ta xem.", "Tâm tĩnh thì pháp mới sinh. Ngươi mà nóng vội, ngũ hành trong người sẽ tự đánh nhau."],
        turninLines: ["Ngũ hành luân chuyển êm như nước. Tốt — pháp căn của ngươi hợp với tông này hơn ta tưởng.", "Thưởng nhập môn đây. Nhớ: pháp tu hơn nhau ở cái tĩnh, không phải cái mạnh."] },
      q_mon_thien_cong_1: { title: "Bờm sắt nhập kho", giver: "tong_khi",
        story: "Kho vật liệu của Thiên Công Phường đang thiếu bờm sắt. Hạ 2 con Lợn Mông Sắt trong Rừng Thanh Sơn, mang bờm về nguyên vẹn — phường coi đó là lễ nhập môn của thợ.",
        giverLines: ["Vào phường của ta thì làm việc của phường: kho đang thiếu bờm sắt. Hạ 2 con Lợn Mông Sắt trong rừng, mang bờm về nguyên vẹn.", "Rách bờm là phường không nhận. Tay nghề bắt đầu từ chỗ biết giữ vật liệu."],
        turninLines: ["Bờm nguyên, không rách một sợi. Tay ngươi khéo hơn khối thằng thợ học việc của ta.", "Thưởng đây, với miếng thịt này mang về ăn. Từ nay ngươi là người của Thiên Công Phường."] },
      q_mon_dan_ha_1: { title: "Linh chi nhập cốc", giver: "tong_dan",
        story: "Đan Hà Cốc giao việc đầu tiên nhẹ nhàng mà khó khinh: hái 3 tai Linh Chi còn đẫm sương gần suối linh, mang về nhập kho dược của Cốc. Dập một góc là dược tính thoát hết.",
        giverLines: ["Việc đầu tiên Đan Hà Cốc giao cho đệ tử mới: hái 3 tai Linh Chi còn đẫm sương gần suối linh, mang về nhập kho dược.", "Dược hái vội là dược chết. Đi chậm, ngắt nhẹ — Cốc này coi trọng một tai nấm hơn một gánh củi."],
        turninLines: ["Linh chi còn nguyên sương, dược tính chưa thoát một phần. Tay ngươi hợp với nghề đan hơn ta tưởng.", "Thưởng nhập cốc đây, kèm ít Thảo Dược cho ngươi tập sắc thuốc. Từ nay kho dược của Cốc là nhà của ngươi."] },
      q_mon_van_thu_1: { title: "Ra mắt bầy thú", giver: "tong_thu",
        story: "Vạn Thú Môn không giao việc bằng miệng: tới lán trại trong rừng gặp Hà Thiết Sơn, để ông đưa ngươi ra mắt bầy thú rừng. Thú nhận ngươi rồi, môn mới nhận ngươi thật.",
        giverLines: ["Vạn Thú Môn không giao việc bằng miệng đâu. Xuống lán trại trong rừng gặp Hà Thiết Sơn, để ổng đưa ngươi ra mắt bầy thú.", "Thú nó ngửi được lòng người. Ngươi mà mang ý xấu, cả đàn sẽ biết trước cả ta."],
        turninLines: ["Ông Sơn bảo thú rừng chịu tới gần ngươi ăn cỏ — hiếm lắm đấy! Môn này chính thức nhận ngươi rồi.", "Thưởng nhập môn đây. Sau này thú của ngươi sẽ tự tìm về với ngươi, cứ chờ mà xem."] },
      q_mon_thien_phu_1: { title: "Dọn kho giấy mới", giver: "tong_phu",
        story: "Kho giấy bùa ven suối linh lại có rắn lục bò vào nằm cuộn trong xấp giấy khô. Dẹp 3 con Rắn Lục Đuôi Đỏ — tay nhanh mà không được giẫm hỏng giấy, như lệ của các.",
        giverLines: ["Kho giấy bùa ven suối linh lại có rắn lục bò vào nằm trong xấp giấy khô. Dẹp 3 con Rắn Lục Đuôi Đỏ cho ta.", "Giẫm hỏng giấy là ta trừ thưởng. Tay nhanh mà chân phải nhẹ — như lệ của các này."],
        turninLines: ["Rắn dẹp sạch, giấy không hỏng một tờ. Tay chân ngươi sinh ra để làm phù sư đấy.", "Thưởng nhập các đây. Từ nay giấy bùa qua tay ngươi phải sạch như vậy."] },
      q_mon_cuu_cung_1: { title: "Dẫn khí qua cửu cung — nhập môn", giver: "tong_tran",
        story: "Cửu Cung Trận Tông cho đệ tử mới làm lại bài cũ ở mức khó hơn: dẫn linh khí đi đủ một vòng cửu cung bằng thổ nạp, tích 70 tu vi không để khí loạn một ô nào.",
        giverLines: ["Bài nhập môn của Cửu Cung Trận Tông là bài cũ ở mức khó hơn: dẫn khí qua cửu cung, tích 70 tu vi, không để khí loạn một ô.", "Trận pháp bắt đầu từ thân mình. Thân còn loạn, bày trận lớn chỉ là tự hại người."],
        turninLines: ["Chín ô sáng đều, khí không loạn một nhịp. Nền trận của ngươi vững hơn ta dự tính.", "Thưởng nhập tông. Từ nay mỗi bước ngươi đi trong núi đều là một ô trận — tập nhìn như vậy."] },
      q_mon_kim_cang_1: { title: "Việc tay chân đầu tiên", giver: "tong_the",
        story: "Kim Cang Môn giao việc đầu tiên đúng chất môn: ra bãi hoang phía nam hạ 3 con Lợn Rừng bằng sức thân thể. Đứng vững, không lùi — đó là lễ nhập môn.",
        giverLines: ["Kim Cang Môn giao việc đầu tiên ít lời thôi: ra bãi hoang phía nam, hạ 3 con Lợn Rừng.", "Đứng vững. Không lùi. Đó là lễ nhập môn của môn này từ trăm năm nay."],
        turninLines: ["Ngươi không lùi một bước nào. Tốt. Môn này chỉ nhận người đứng vững.", "Thưởng đây, với miếng thịt — ăn cho có sức. Từ nay ngươi là người của Kim Cang Môn."] },
      q_mon_ngu_doc_1: { title: "Độc hoa nhập kho", giver: "tong_doc",
        story: "Kho độc của Ngũ Độc Giáo cần Độc Tâm Hoa mới. Ra bãi rắn lục làm ổ hái 3 cây Độc Tâm Hoa mang về cho Đường Tĩnh — tay không run mới được chạm vào hoa độc.",
        giverLines: ["Kho độc của giáo cần Độc Tâm Hoa mới. Ra bãi rắn lục làm ổ, hái 3 cây mang về.", "Tay không run mới được chạm vào hoa độc. Ngươi run, ta cho học lại từ đầu."],
        turninLines: ["Hoa nguyên, nọc trong cánh không thoát một giọt. Tay ngươi vững hơn ta tưởng.", "Thưởng đây, kèm viên Giải Độc Đan — người của Ngũ Độc Giáo ra ngoài phải mang theo thứ này trước tiên."] },
      q_mon_huyen_am_1: { title: "Khúc đàn nhập môn", giver: "tong_am",
        story: "Huyền Âm Cung giao việc đầu tiên là một việc tình cảm: mang tiếng đàn nhập môn về quán trọ làng Thanh Khê, đàn cho Hoa nương và khách đi đường nghe một khúc yên lòng.",
        giverLines: ["Việc đầu tiên Huyền Âm Cung giao cho ngươi là một việc tình cảm: mang tiếng đàn nhập môn về quán trọ làng Thanh Khê.", "Đàn cho Hoa nương và khách đi đường nghe một khúc yên lòng. Đàn của cung này trước hết là để yên lòng người."],
        turninLines: ["Khách trong quán nghe đàn của ngươi mà yên hẳn một buổi chiều. Hoa nương gửi lời khen.", "Thưởng nhập cung đây. Nhớ: đàn hay không ở tay nhanh, ở lòng người nghe được yên."] },
      q_mon_thanh_phong_2: { title: "Kiếm tuần Đại Sơn", giver: "de_tu_phai",
        story: "Thanh Phong giao ngươi tuần tra khu Lợn Mông Sắt ở Thập Vạn Đại Sơn: hạ 3 con Lợn Mông Sắt đang phá đường mòn cửa sơn. Đệ tử của phái phải biết giữ đường cho người sau.",
        giverLines: ["Lợn Mông Sắt ở Đại Sơn phá đường mòn cửa sơn ba hôm nay. Phái giao ngươi tuần tra khu đó, hạ 3 con phá đường nhất.", "Đệ tử Thanh Phong đi đâu, đường ở đó phải yên. Nhớ lấy."],
        turninLines: ["Đường cửa sơn sạch rồi. Ngươi bắt đầu ra dáng đệ tử tuần sơn của phái này đấy.", "Thưởng của phái đây. Lần sau vào Đại Sơn sâu hơn, kiếm phải nhanh hơn nữa."] },
      q_mon_huyen_phap_2: { title: "Quả tụ linh trên cổ thụ", giver: "tong_phap",
        story: "Khỉ Mặt Đỏ ở khu Cổ Thụ Đại Sơn tha Tụ Linh Quả về tổ. Hái — hay nói đúng hơn là lấy lại — 3 quả Tụ Linh Quả cho đài thử pháp của Huyền Pháp Tông.",
        giverLines: ["Đàn khỉ cổ thụ tha Tụ Linh Quả về tổ — quả đó là của đài thử pháp trồng dưỡng bao năm.", "Lấy lại 3 quả cho ta. Nhẹ tay thôi, pháp tu không cần cướp giật như thú."],
        turninLines: ["Quả còn nguyên linh khí. Đẹp lắm — ngươi lấy được mà đàn khỉ không hề hay biết à?", "Thưởng của tông. Quả này sẽ dùng cho bài dẫn pháp tiếp theo của chính ngươi."] },
      q_mon_thien_cong_2: { title: "Huyết sâm gần sào huyệt", giver: "tong_khi",
        story: "Huyết Sâm mọc nơi đất rừng lâu năm cạnh sào huyệt yêu thú ở Đại Sơn — vật liệu rèn lẫn luyện đan đều quý. Hái 3 củ mang về cho phường, cẩn thận chủ nhà của nó.",
        giverLines: ["Huyết Sâm mọc đất rừng lâu năm cạnh sào huyệt yêu thú ở Đại Sơn — rèn khí, luyện đan đều quý thứ này.", "Hái 3 củ mang về. Cẩn thận chủ nhà của nó — sâm quý thì thú dữ giữ càng kỹ."],
        turninLines: ["Ba củ sâm còn nguyên rễ. Tốt — đào sâm mà vội là hỏng cả củ lẫn người.", "Thưởng của phường. Lần sau vào sâu hơn nữa, vật liệu còn quý hơn nhiều."] },
      q_mon_dan_ha_2: { title: "Ngọc tủy chi cho Cốc", giver: "tong_dan",
        story: "Đan Hà Cốc cần Ngọc Tủy Chi mọc ở kẽ đá bãi luyện công chân núi và gốc cây phía đông rừng. Hái 2 tai mang về — Cốc đang chuẩn bị những mẻ đan lớn cho đệ tử lên núi.",
        giverLines: ["Cốc cần Ngọc Tủy Chi — mọc ở kẽ đá bãi luyện công chân núi và gốc cây phía đông rừng.", "Hái 2 tai mang về. Cốc đang chuẩn bị những mẻ đan lớn cho lớp đệ tử lên núi đợt này."],
        turninLines: ["Ngọc tủy còn trắng trong, chưa ngả màu. Tốt — thứ này hái sai giờ là thành nấm thường.", "Thưởng của Cốc. Nhớ đường kẽ đá đó, về sau ngươi còn phải quay lại nhiều lần."] },
      q_mon_van_thu_2: { title: "Sói cửa sơn", giver: "tong_thu",
        story: "Bầy Sói Rừng ở cửa sơn Đại Sơn đang uy hiếp đàn linh thú non của Vạn Thú Môn chăn thả gần đó. Dẹp 4 con sói đầu bầy cho Giang Tiểu Thú.",
        giverLines: ["Đàn linh thú non của môn chăn thả gần cửa sơn đang bị sói rừng rình. Dẹp 4 con Sói Rừng đầu bầy cho ta.", "Nhớ nhé: ta bảo dẹp sói dữ, không phải diệt cả bầy. Sói cũng là thú — con nào không dữ thì để nó sống."],
        turninLines: ["Sói dữ đã dẹp, đàn non yên rồi. Ngươi phân biệt được con nào đáng đánh — đó là tâm của Vạn Thú Môn.", "Viên Yêu Đan Cấp 1 này là của con sói đầu đàn. Môn chia cho ngươi — lấy của thú trả cho thú."] },
      q_mon_thien_phu_2: { title: "Bùa trấn đường sơn", giver: "tong_phu",
        story: "Đường lên Đại Sơn cần bùa trấn mới: Thiên Phù Các bắt ngươi tĩnh tọa dẫn khí đủ 80 tu vi ngay tại bãi tuyển, nạp linh vào xấp bùa trấn đường cho mùa này.",
        giverLines: ["Đường lên Đại Sơn mùa này cần bùa trấn mới. Ngươi tĩnh tọa dẫn khí tích 80 tu vi, nạp linh vào xấp bùa trấn đường.", "Bùa trấn đường mà linh yếu, thú dữ đi qua nó cười cho. Nạp cho đầy vào."],
        turninLines: ["Bùa nở linh quang đều cả xấp. Đoàn lên núi mùa này yên tâm hơn nhờ tay ngươi.", "Thưởng của các. Vẽ bùa là việc của tay, trấn được đường hay không là việc của tâm tĩnh."] },
      q_mon_cuu_cung_2: { title: "Xem trận ở miếu", giver: "tong_tran",
        story: "Trước khi đệ tử vào Đại Sơn, Cửu Cung Trận Tông bắt tới Miếu Sơn Thần gặp Từ bà, nghe bà kể thế trận phong ấn của Thanh Khê lão nhân — vào núi mà không hiểu thế đất là tự nộp mạng.",
        giverLines: ["Trước khi vào Đại Sơn, tới Miếu Sơn Thần gặp Từ bà, nghe bà kể thế trận phong ấn của Thanh Khê lão nhân.", "Vào núi mà không hiểu thế đất dưới chân là tự nộp mạng. Âu Dương Kỳ này không cho đệ tử đi mù."],
        turninLines: ["Bà Từ khen ngươi nghe chăm hơn đám đệ tử cũ của ta. Tốt.", "Giờ ngươi đã biết núi này đứng trên một thế trận cổ — đi đâu cũng nhìn thế đất trước, nhớ chưa."] },
      q_mon_kim_cang_2: { title: "Lợn rừng Đại Sơn", giver: "tong_the",
        story: "Lợn Rừng ở Đại Sơn to và dữ hơn hẳn bãi hoang quê nhà. Hạ 4 con cho Kim Cang Môn — coi như bài kiểm tra thân thể đầu tiên ở đất lạ.",
        giverLines: ["Lợn Rừng Đại Sơn to và dữ hơn bãi hoang quê nhà nhiều. Hạ 4 con.", "Coi như bài kiểm tra thân thể đầu tiên ở đất lạ. Ngã thì đứng dậy, đừng nằm than."],
        turninLines: ["Bốn con, người còn đứng thẳng. Thân thể ngươi chịu được đất Đại Sơn rồi.", "Thưởng của môn. Ăn miếng thịt này đi — luyện thể mà không ăn là tự phá thân."] },
      q_mon_ngu_doc_2: { title: "Rắn khe suối", giver: "tong_doc",
        story: "Khe Suối Rắn Lục ở Đại Sơn là kho nọc sống của Ngũ Độc Giáo. Dẹp 4 con Rắn Lục Đuôi Đỏ quá dữ gần đường đi, phần còn lại để giáo tự thu nọc.",
        giverLines: ["Khe Suối Rắn Lục ở Đại Sơn là kho nọc sống của giáo. Dẹp 4 con Rắn Lục Đuôi Đỏ quá dữ gần đường đi.", "Phần còn lại để yên — giáo tự thu nọc theo mùa. Giết bừa là phá kho của chính mình."],
        turninLines: ["Đường qua khe suối an toàn rồi. Ngươi biết dừng tay đúng lúc — người dùng độc phải thế.", "Thưởng của giáo. Nhớ: độc trong tay kẻ biết dừng mới là thuốc."] },
      q_mon_huyen_am_2: { title: "Thảo an thần", giver: "tong_am",
        story: "Sau những chuyến vào Đại Sơn, thương binh cần thuốc an thần. Hái 4 cây Thanh Tâm Thảo cho Huyền Âm Cung sắc kèm khúc đàn an thần của cung.",
        giverLines: ["Sau những chuyến vào Đại Sơn, thương binh cần thuốc an thần. Hái 4 cây Thanh Tâm Thảo mang về cho ta.", "Cung sẽ sắc kèm khúc đàn an thần — thuốc yên một nửa, đàn yên một nửa."],
        turninLines: ["Thảo đủ tươi. Đêm nay thương binh sẽ ngủ được một giấc trọn.", "Thưởng của cung. Ngươi hái dược mà cũng nhẹ nhàng như người của cung này vậy."] },
      q_mon_thanh_phong_3: { title: "Kiếm thí bãi luyện công", giver: "de_tu_phai",
        story: "Đàn Khỉ Mặt Đỏ lại kéo xuống Bãi Luyện Công phá đài kiếm của Thanh Phong. Dẹp 4 con quậy nhất — phái gọi đây là kiếm thí: kiếm phải bén trước khi người phá quan.",
        giverLines: ["Đàn khỉ lại kéo xuống bãi luyện công phá đài kiếm. Dẹp 4 con quậy nhất cho ta.", "Gọi là kiếm thí: kiếm bén rồi mới phá quan được. Người cũng vậy."],
        turninLines: ["Đài kiếm yên. Kiếm của ngươi sau đợt này khác hẳn — ánh mắt cũng khác.", "Cầm thưởng đi, về thổ nạp cho vững. Quan ải của ngươi gần lắm rồi."] },
      q_mon_huyen_phap_3: { title: "Bế quan dẫn pháp", giver: "tong_phap",
        story: "Huyền Pháp Tông cho ngươi bế quan ngắn ở đài thử pháp: thổ nạp tích 100 tu vi trong một vòng dẫn pháp không gián đoạn. Tâm tĩnh thì pháp mới chịu đỡ ngươi qua quan.",
        giverLines: ["Trước ngày phá quan, Huyền Pháp cho đệ tử bế quan ngắn: tích 100 tu vi trong một vòng dẫn pháp không gián đoạn.", "Đứt một hơi là làm lại từ đầu. Pháp không tha cho kẻ hấp tấp."],
        turninLines: ["Một vòng trọn, không đứt hơi nào. Tâm ngươi đã tĩnh hơn ngày mới vào tông nhiều lắm.", "Cầm thưởng, về chuẩn bị. Quan ải phía trước, pháp sẽ đỡ ngươi — nếu ngươi đủ tĩnh."] },
      q_mon_thien_cong_3: { title: "Thử giáp bờm sắt", giver: "tong_khi",
        story: "Phường vừa rèn xong lô giáp bờm sắt mới, cần người mặc thử vào việc thật: hạ 3 con Lợn Mông Sắt trong rừng mà giáp không sứt. Qua được, phường ghi tên ngươi vào sổ thợ chính.",
        giverLines: ["Phường rèn xong lô giáp bờm sắt mới, cần người mặc thử vào việc thật: hạ 3 con Lợn Mông Sắt mà giáp không sứt.", "Giáp qua được, ta ghi tên ngươi vào sổ thợ chính. Giáp hỏng... thì ngươi tự biết đường về bằng cách nào."],
        turninLines: ["Giáp không một vết sứt, người cũng nguyên. Sổ thợ chính có tên ngươi rồi đấy.", "Viên Yêu Đan Cấp 1 này là của ngươi — phường không giữ của người làm ra việc."] },
      q_mon_dan_ha_3: { title: "Mẻ bồi nguyên đầu tay", giver: "tong_dan",
        story: "Đan Hà Cốc giao cho ngươi tự luyện 1 viên Đại Bồi Nguyên Đan — mẻ đan bồi nguyên đầu tay của đệ tử, luyện xong mang về cho Tần Dược Tử chấm. Đan này là để chính ngươi uống trước ngày phá quan.",
        giverLines: ["Đã đến lúc ngươi tự luyện mẻ đan bồi nguyên đầu tay: 1 viên Đại Bồi Nguyên Đan, luyện xong mang về cho ta chấm.", "Đan này là để chính ngươi uống trước ngày phá quan. Luyện cho người khác thì qua loa được, luyện cho mình thì không."],
        turninLines: ["Đan tròn, vân đều, dược lực khóa kín bên trong. Mẻ đầu tay mà được vậy là có căn cơ làm đan sư.", "Cầm thưởng đi. Viên đan này uống trước khi phá quan — Cốc dạy ngươi tự cứu mình trước."] },
      q_mon_van_thu_3: { title: "Dược cho thú thương", giver: "tong_thu",
        story: "Đàn thú chăn thả của Vạn Thú Môn bị sói cắn thương mấy con. Hái 3 tai Linh Chi gần suối linh mang về cho Giang Tiểu Thú giã thuốc cho chúng.",
        giverLines: ["Mấy con trong đàn bị sói cắn thương, nằm rên cả đêm qua. Hái 3 tai Linh Chi gần suối linh về cho ta giã thuốc.", "Đi nhẹ chân thôi — thú thương nó sợ tiếng động lạ lắm."],
        turninLines: ["Thuốc đã đắp, đàn thú qua được đêm nay rồi. Ngươi hái dược mà biết chọn tai non nhất cho thú thương — ta ưng.", "Thưởng đây, kèm Thảo Dược cho ngươi tập chăm thú. Người của Vạn Thú Môn phải biết chữa trước khi biết sai khiến."] },
      q_mon_thien_phu_3: { title: "Tĩnh tọa vẽ đại phù", giver: "tong_phu",
        story: "Thiên Phù Các chuẩn bị một lá đại phù cho mùa thú dữ tới: ngươi tĩnh tọa dẫn khí tích 100 tu vi, nạp linh vào nét bùa chính — tay run một nét là cả lá hỏng.",
        giverLines: ["Các chuẩn bị một lá đại phù cho mùa thú dữ. Ngươi nạp linh vào nét bùa chính: tích 100 tu vi, một hơi không đứt.", "Tay run một nét là cả lá hỏng. Ta ngồi đây xem — run là biết ngay."],
        turninLines: ["Nét bùa trơn như nước chảy. Đại phù này treo lên cổng núi, thú dữ phải vòng đường khác.", "Thưởng đây. Ngươi tiến bộ nhanh hơn ta nghĩ — cái tĩnh của ngươi thật, không phải giả."] },
      q_mon_cuu_cung_3: { title: "Bế quan cửu cung", giver: "tong_tran",
        story: "Cửu Cung Trận Tông nâng bài nhập môn lên một bậc: dẫn khí qua cửu cung tích 120 tu vi, chín ô phải sáng đều như một. Âu Dương Kỳ nói đây là nền cho mọi đại trận sau này của ngươi.",
        giverLines: ["Nâng bài nhập môn lên một bậc: dẫn khí qua cửu cung tích 120 tu vi, chín ô phải sáng đều như một.", "Đây là nền cho mọi đại trận sau này của ngươi. Vội là hỏng, mà hỏng ở thân mình thì không ai chữa được."],
        turninLines: ["Chín ô như một — cảnh giới này ở đệ tử mới là hiếm. Ta bắt đầu hiểu vì sao các tông đều muốn ngươi.", "Thưởng của tông. Chuẩn bị phá quan đi, trận đã đỡ sẵn đường cho ngươi."] },
      q_mon_kim_cang_3: { title: "Đấu lợn sắt luyện thể", giver: "tong_the",
        story: "Luyện thể trước phá quan của Kim Cang Môn chỉ có một bài: đấu thẳng 4 con Lợn Mông Sắt, lấy cú húc của chúng tôi da thịt. Đau mà không ngã là qua.",
        giverLines: ["Bài luyện thể trước phá quan của môn chỉ có một: đấu thẳng 4 con Lợn Mông Sắt.", "Lấy cú húc của chúng tôi da thịt ngươi. Đau mà không ngã là qua. Khóc cũng được, ngã thì không."],
        turninLines: ["Da thịt ngươi sau đợt này cứng như da lợn sắt thật rồi. Quan ải phía trước, thân này qua được.", "Viên Yêu Đan Cấp 1 này là của ngươi — của kẻ đứng cuối cùng trên bãi."] },
      q_mon_ngu_doc_3: { title: "Luyện độc hoa", giver: "tong_doc",
        story: "Ngũ Độc Giáo cho ngươi tự thu 4 cây Độc Tâm Hoa luyện độc công: hoa phải nguyên, nọc trong cánh không được thoát. Đường Tĩnh sẽ xem tay ngươi có còn run không.",
        giverLines: ["Giáo cho ngươi tự thu 4 cây Độc Tâm Hoa luyện độc công. Hoa phải nguyên, nọc không được thoát.", "Ta đứng xa xem tay ngươi. Còn run một chút thôi là chưa được dùng độc lớn."],
        turninLines: ["Bốn cây đều nguyên vẹn. Tay ngươi hết run rồi — độc công của ngươi từ nay mới tính là nhập môn thật.", "Thưởng đây. Sắp phá quan, độc khí trong người phải nghe lời như tay ngươi bây giờ."] },
      q_mon_huyen_am_3: { title: "Đàn tĩnh tâm", giver: "tong_am",
        story: "Trước ngày phá quan, Huyền Âm Cung bắt đệ tử ngồi đàn tĩnh tâm đủ một tuần hương: thổ nạp tích 100 tu vi theo nhịp đàn của Tiêu Uyển Nhi, không để tâm loạn một nhịp.",
        giverLines: ["Trước ngày phá quan, cung bắt đệ tử ngồi đàn tĩnh tâm đủ một tuần hương: tích 100 tu vi theo nhịp đàn của ta.", "Tâm loạn một nhịp là đàn sai một nốt. Ta nghe được hết đấy — đừng giấu."],
        turninLines: ["Một tuần hương không sai một nhịp. Tâm ngươi đã tĩnh như mặt nước trong giếng cổ ngày yên.", "Thưởng đây. Mang cái tĩnh này vào quan ải phía trước — nó quý hơn đan dược."] },
      q_mon_thanh_phong_4: { title: "Dọn tai mắt của vương", giver: "de_tu_phai",
        story: "Đoàn săn vương thú cần đường vào sào sạch sẽ: Thanh Phong giao ngươi dẹp 5 con Sói Rừng — tai mắt của vương thú — quanh đường mòn và cửa sơn. Kiếm đi trước, đoàn theo sau.",
        giverLines: ["Đoàn săn vương thú cần đường vào sào sạch. Ngươi đi trước đoàn, dẹp 5 con Sói Rừng — tai mắt của con vương quanh đường mòn.", "Kiếm đi trước, đoàn theo sau. Đó là chỗ của Thanh Phong trong mọi đoàn săn."],
        turninLines: ["Đường vào sào thông rồi, đoàn săn đã sẵn sàng. Phần Yêu Đan Cấp 2 này là cổ phần săn của phái chia cho ngươi.", "Giữ kỹ — góp vào lò Trúc Cơ Đan của ngươi sau này."] },
      q_mon_huyen_phap_4: { title: "Pháp đàn áp trận", giver: "tong_phap",
        story: "Trước trận săn vương, Huyền Pháp Tông dựng pháp đàn áp trận ở bãi tuyển: ngươi dẫn pháp tích 80 tu vi nạp vào đàn, để lúc vương thú vùng lên có pháp lực đè xuống.",
        giverLines: ["Trước trận săn vương thú, tông dựng pháp đàn áp trận ở bãi tuyển. Ngươi dẫn pháp tích 80 tu vi nạp vào đàn.", "Lúc vương thú vùng lên, chính pháp đàn này sẽ đè nó xuống cho đoàn săn ra tay. Đừng để đàn đói linh."],
        turninLines: ["Pháp đàn đầy linh, ngũ sắc luân chuyển đều. Phần Yêu Đan Cấp 2 này tông chia cho ngươi.", "Giữ cho kỹ — nó là một phần của lò Trúc Cơ Đan ngày sau."] },
      q_mon_thien_cong_4: { title: "Giáp săn vương", giver: "tong_khi",
        story: "Thiên Công Phường rèn giáp săn vương cho cả đoàn từ bờm sắt mới: hạ 4 con Lợn Mông Sắt lấy bờm tốt nhất. Giáp xong, phường chia cho ngươi một viên Yêu Đan Cấp 2 làm công săn.",
        giverLines: ["Đoàn săn vương thú mà không có giáp tử tế là đi nộp mạng. Phường nhận rèn giáp săn vương cho cả đoàn.", "Ngươi hạ 4 con Lợn Mông Sắt lấy bờm tốt nhất về đây. Giáp xong trong đêm, mai đoàn lên đường."],
        turninLines: ["Bờm tốt thật. Giáp săn vương đã rèn xong — cả đoàn nhờ tay ngươi mà thêm phần sống.", "Phần Yêu Đan Cấp 2 này phường chia cho ngươi. Để dành cho lò Trúc Cơ Đan của ngươi."] },
      q_mon_dan_ha_4: { title: "Đan cho đoàn săn", giver: "tong_dan",
        story: "Đoàn săn vương thú không thể đi tay không: Đan Hà Cốc bắt ngươi luyện 2 viên Đại Hồi Xuân Đan mang theo — đan cứu mạng của cả đoàn, luyện hỏng là người chết thật.",
        giverLines: ["Đoàn săn vương thú không đi tay không được. Cốc bắt ngươi luyện 2 viên Đại Hồi Xuân Đan mang theo cho đoàn.", "Nhớ cho kỹ: đan cứu mạng mà luyện hỏng, người chết là thật, không phải chuyện trong sách."],
        turninLines: ["Hai viên đều đạt. Đoàn săn có đan của ngươi trong tay, cơ hội sống thêm ba phần.", "Đây — Yêu Đan Cấp 2, phần Cốc chia cho người giữ mạng đoàn. Để dành cho lò Trúc Cơ Đan của ngươi."] },
      q_mon_van_thu_4: { title: "Người dẫn đường vào sào", giver: "tong_thu",
        story: "Cả đoàn săn chỉ có một người được thú rừng tin: tới lán trại gặp Hà Thiết Sơn, xin ông dẫn đường vào gần sào vương thú. Vạn Thú Môn cử ngươi đi vì thú ngửi được lòng ngươi.",
        giverLines: ["Đoàn săn vương thú cần người dẫn đường vào gần sào. Chỉ có một người được thú rừng tin tuyệt đối: Hà Thiết Sơn.", "Tới lán trại xin ổng dẫn đường. Ngươi đi vì thú ngửi được lòng ngươi trong sạch — đừng làm mất cái tin đó."],
        turninLines: ["Ông Sơn nhận lời dẫn đường rồi! Cả đoàn săn nhờ ngươi mà có đường vào sào an toàn.", "Yêu Đan Cấp 2 này môn chia cho ngươi. Để dành — sau này góp vào lò Trúc Cơ Đan của ngươi."] },
      q_mon_thien_phu_4: { title: "Dọn rắn đường săn", giver: "tong_phu",
        story: "Đường săn qua khe suối đầy Rắn Lục Đuôi Đỏ — đoàn đi qua là bị cắn lén. Thiên Phù Các giao ngươi dẹp 4 con rắn dữ nhất ven đường trước ngày xuất phát.",
        giverLines: ["Đường săn qua khe suối đầy rắn lục — đoàn đi qua là bị cắn lén từ bụi cỏ. Dẹp 4 con rắn dữ nhất ven đường cho ta.", "Việc của Thiên Phù Các trong đoàn săn là dọn đường. Không hào nhoáng, mà thiếu là chết người."],
        turninLines: ["Đường săn sạch rắn. Đoàn đi qua khe suối lần này không ai phải lo nhìn chân nữa.", "Yêu Đan Cấp 2 — phần các chia cho ngươi. Để dành góp lò Trúc Cơ Đan, đừng bán."] },
      q_mon_cuu_cung_4: { title: "Trận dụ vương", giver: "tong_tran",
        story: "Cửu Cung Trận Tông muốn bày trận dụ vương thú ra khỏi sào: tới Miếu Sơn Thần gặp Từ bà, xin bà chỉ thế đất quanh sào huyệt và bài khấn yên núi. Trận dụ được vương là nhờ hiểu đất của nó.",
        giverLines: ["Tông muốn bày trận dụ vương thú ra khỏi sào. Muốn vậy phải hiểu thế đất quanh sào huyệt của nó.", "Tới Miếu Sơn Thần gặp Từ bà, xin bà chỉ thế đất và bài khấn yên núi. Trận dụ được vương là nhờ hiểu đất của nó, không nhờ sức."],
        turninLines: ["Bà Từ đã chỉ thế đất quanh sào. Trận dụ vương bày được rồi — đoàn săn có thêm phần thắng.", "Yêu Đan Cấp 2 này là phần tông chia cho ngươi. Giữ lấy, nó thuộc về lò Trúc Cơ Đan của ngươi."] },
      q_mon_kim_cang_4: { title: "Dọn đàn theo hầu", giver: "tong_the",
        story: "Vương thú đi đâu cũng có đàn Lợn Rừng theo hầu. Kim Cang Môn giao ngươi dọn 5 con lợn theo hầu quanh cửa sơn, để ngày săn đoàn chỉ phải đối mặt một mình con vương.",
        giverLines: ["Vương thú đi đâu cũng có đàn Lợn Rừng theo hầu. Dọn 5 con lợn theo hầu quanh cửa sơn cho ta.", "Ngày săn, đoàn chỉ phải đối mặt một mình con vương. Việc dọn đàn là việc của người có sức — là ngươi."],
        turninLines: ["Đàn theo hầu sạch rồi. Đoàn săn giờ chỉ còn một đối thủ duy nhất.", "Yêu Đan Cấp 2 — phần môn chia cho người dọn đường. Để dành cho lò Trúc Cơ Đan của ngươi đấy."] },
      q_mon_ngu_doc_4: { title: "Độc săn vương", giver: "tong_doc",
        story: "Ngũ Độc Giáo góp cho đoàn săn thứ vũ khí lặng lẽ nhất: thu 4 cây Độc Tâm Hoa tẩm độc săn vương. Đường Tĩnh dặn: độc này chỉ dùng cho con vương, không dùng bừa.",
        giverLines: ["Giáo góp cho đoàn săn thứ vũ khí lặng lẽ nhất: độc săn vương, tẩm từ Độc Tâm Hoa. Thu 4 cây tốt nhất về cho ta.", "Dặn trước: độc này chỉ dùng cho con vương. Dùng bừa vào việc khác, ta tự tay phế độc công của ngươi."],
        turninLines: ["Hoa đủ tốt, độc săn vương tẩm xong rồi. Đoàn săn có thêm một phần thắng không ai thấy được.", "Yêu Đan Cấp 2 — phần giáo chia. Giữ cho lò Trúc Cơ Đan của ngươi."] },
      q_mon_huyen_am_4: { title: "Khúc đàn tiễn đoàn săn", giver: "tong_am",
        story: "Đoàn săn lên đường cần một khúc đàn tiễn: về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc an hồn cho những người từng ngã xuống vì thú dữ — để đoàn nhớ mình săn vì ai.",
        giverLines: ["Đoàn săn lên đường cần một khúc đàn tiễn. Về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc an hồn cho những người từng ngã xuống vì thú dữ.", "Để đoàn nhớ mình săn vì ai. Đàn mà không có lòng, người nghe biết ngay."],
        turninLines: ["Quán trọ lặng đi một lúc lâu sau khúc đàn của ngươi. Đoàn săn lên đường với cái đầu cúi thấp và lòng vững.", "Yêu Đan Cấp 2 — phần cung chia cho ngươi. Để dành cho lò Trúc Cơ Đan nhé."] },
      q_mon_thanh_phong_5: { title: "Giữ đường vận dược", giver: "de_tu_phai",
        story: "Dược liệu luyện Trúc Cơ Đan phải vận qua bãi khỉ cổ thụ, mà đàn Khỉ Mặt Đỏ cứ cướp phá đoàn thồ. Thanh Phong giao ngươi dẹp 5 con khỉ đầu đàn giữ đường cho dược đi qua.",
        giverLines: ["Dược liệu cho mẻ Trúc Cơ Đan phải vận qua bãi khỉ cổ thụ, mà đàn khỉ cứ cướp phá đoàn thồ.", "Dẹp 5 con khỉ đầu đàn, giữ đường cho dược đi qua. Kiếm của ngươi lúc này là để mở đường cho chính lò đan của mình."],
        turninLines: ["Đoàn thồ qua được rồi. Đây, phái chia thêm 2 tai Linh Chi — góp vào lò của ngươi.", "Nguyên liệu lo dần từ bây giờ, ngày độ kiếp mới không cuống."] },
      q_mon_huyen_phap_5: { title: "Quả tụ linh cho lò đan", giver: "tong_phap",
        story: "Lò luyện Trúc Cơ Đan cần Tụ Linh Quả giữ linh khí trong lò không tán. Lấy 4 quả Tụ Linh Quả từ đàn khỉ cổ thụ ở Đại Sơn mang về cho Huyền Pháp Tông góp vào lò.",
        giverLines: ["Lò luyện Trúc Cơ Đan cần Tụ Linh Quả giữ linh khí không tán giữa chừng.", "Lấy 4 quả từ đàn khỉ cổ thụ ở Đại Sơn mang về. Lần này đàn khỉ có giận cũng kệ — lò của ngươi quan trọng hơn."],
        turninLines: ["Bốn quả đủ cả, linh khí còn đầy. Lò của ngươi có tông góp phần rồi đấy.", "Từ nay việc của lò là việc chung — ngươi không còn tu một mình nữa."] },
      q_mon_thien_cong_5: { title: "Thanh linh tủy cho lò", giver: "tong_khi",
        story: "Lò của Thiên Công Phường rèn giữ lửa bằng Thanh Linh Tủy đọng ở kẽ đá cạnh sào Sơn Quân và phế tích Đại Sơn. Lấy 2 giọt mang về — đây là phần phường góp cho mẻ Trúc Cơ Đan của ngươi.",
        giverLines: ["Lò của phường giữ lửa bằng Thanh Linh Tủy — thứ đọng ở kẽ đá cạnh sào Sơn Quân và trong phế tích Đại Sơn.", "Lấy 2 giọt mang về. Đây là phần phường góp cho mẻ Trúc Cơ Đan của ngươi — phường này không nợ ai bao giờ."],
        turninLines: ["Tủy còn trong, lửa lò sẽ giữ đều ba ngày. Mẻ đan của ngươi có phường đứng sau rồi.", "Thêm tai Linh Chi này nữa — phường góp thêm cho chắc. Lo dần đi, ngày kiếp không chờ ai."] },
      q_mon_dan_ha_5: { title: "Ngọc tủy góp lò", giver: "tong_dan",
        story: "Đan Hà Cốc mở kho cũng không đủ Ngọc Tủy Chi cho mẻ Trúc Cơ Đan: hái 2 tai ở kẽ đá bãi luyện công mang về góp lò. Tần Dược Tử nói dược này mà thiếu, đan dẫn kiếp không kết nổi.",
        giverLines: ["Kho của Cốc mở ra cũng không đủ Ngọc Tủy Chi cho mẻ Trúc Cơ Đan của ngươi.", "Hái 2 tai ở kẽ đá bãi luyện công mang về góp lò. Dược này mà thiếu, đan dẫn kiếp không kết nổi — ta nói thật, không dọa."],
        turninLines: ["Đủ rồi. Lò Trúc Cơ Đan của ngươi nay có đủ vị khó nhất nhì.", "Lo nguyên liệu từ bây giờ là đúng. Người chờ đến ngày kiếp mới lo thì không kịp nữa."] },
      q_mon_van_thu_5: { title: "Linh chi góp lò", giver: "tong_thu",
        story: "Vạn Thú Môn góp phần của môn vào mẻ Trúc Cơ Đan của ngươi bằng thứ môn có nhiều nhất: Linh Chi rừng. Hái 4 tai còn đẫm sương mang về cho Giang Tiểu Thú đóng gói gửi lò.",
        giverLines: ["Môn góp phần vào mẻ Trúc Cơ Đan của ngươi bằng thứ môn có nhiều nhất: Linh Chi rừng.", "Hái 4 tai còn đẫm sương mang về, ta đóng gói gửi lò cho ngươi. Thú rừng nhìn ngươi hái quen rồi, chúng sẽ không phá đâu."],
        turninLines: ["Bốn tai đủ cả, tai nào cũng đẹp. Lò của ngươi có phần của rừng này trong đó rồi.", "Nhớ lấy: ngươi lên cao được là nhờ cả rừng này nuôi. Sau này mạnh rồi, trả lại cho rừng."] },
      q_mon_thien_phu_5: { title: "Phù hộ lò đan", giver: "tong_phu",
        story: "Luyện Trúc Cơ Đan phải có phù hộ lò giữ lửa không tắt giữa chừng: Thiên Phù Các bắt ngươi tĩnh tọa dẫn khí tích 90 tu vi, tự tay nạp linh vào ba lá phù hộ lò của chính mẻ đan của mình.",
        giverLines: ["Luyện Trúc Cơ Đan phải có phù hộ lò — lửa tắt giữa chừng là hỏng cả mẻ, hỏng cả đường tu của ngươi.", "Tĩnh tọa tích 90 tu vi, tự tay nạp linh vào ba lá phù hộ lò của chính mẻ đan của mình. Làm cho tử tế vào."],
        turninLines: ["Ba lá phù đều linh, lửa lò của ngươi sẽ không tắt giữa chừng đâu.", "Thêm 2 tai Linh Chi các góp vào lò của ngươi. Các này tuy nhỏ mà chưa từng bỏ rơi đệ tử nào."] },
      q_mon_cuu_cung_5: { title: "Trận tụ linh cho lò", giver: "tong_tran",
        story: "Cửu Cung Trận Tông bày trận tụ linh quanh lò luyện Trúc Cơ Đan: ngươi dẫn khí qua cửu cung tích 90 tu vi để khép trận. Trận khép, linh khí trong lò mới không thoát ra ngoài.",
        giverLines: ["Lò luyện Trúc Cơ Đan của ngươi cần một trận tụ linh quanh lò, không thì linh khí thoát hết giữa chừng.", "Việc của ngươi: dẫn khí qua cửu cung tích 90 tu vi để khép trận. Trận khép kín, mẻ đan mới có cơ thành."],
        turninLines: ["Trận khép kín không một kẽ hở. Lò của ngươi từ nay có trận của tông giữ lửa.", "Thêm 2 tai Linh Chi tông góp vào lò. Ngươi không tu một mình nữa — tập quen với điều đó đi."] },
      q_mon_kim_cang_5: { title: "Thồ dược qua núi", giver: "tong_the",
        story: "Dược liệu nặng phải có người gánh qua núi: Kim Cang Môn giao ngươi dọn đường thồ — hạ 4 con Lợn Mông Sắt chặn đường mòn Đại Sơn, rồi gánh phần dược của môn về lò.",
        giverLines: ["Dược liệu nặng phải có người gánh qua núi. Dọn đường thồ: hạ 4 con Lợn Mông Sắt chặn đường mòn Đại Sơn.", "Xong rồi gánh phần dược của môn về lò. Kim Cang Môn góp cho lò của ngươi bằng vai và lưng, như lệ của môn."],
        turninLines: ["Đường thông, dược đã gánh về đủ. Lò của ngươi có phần mồ hôi của môn này trong đó.", "Thêm 2 tai Linh Chi môn góp. Nhớ: thân thể này là để gánh việc chung, không phải để khoe."] },
      q_mon_ngu_doc_5: { title: "Dược dẫn phụ", giver: "tong_doc",
        story: "Mẻ Trúc Cơ Đan cần một vị dược dẫn cay độc để kéo dược lực vào đan: Ngũ Độc Giáo giao ngươi thu 3 cây Độc Tâm Hoa tốt nhất. Đường Tĩnh dặn liều lượng là mạng người, hoa phải nguyên.",
        giverLines: ["Mẻ Trúc Cơ Đan cần một vị dược dẫn cay độc để kéo dược lực vào đan. Giáo giao ngươi thu 3 cây Độc Tâm Hoa tốt nhất.", "Liều lượng của vị này là mạng người. Hoa dập một cánh là bỏ — đừng tiếc."],
        turninLines: ["Ba cây đều đạt. Vị dược dẫn của mẻ đan ngươi đã có phần của giáo trong đó.", "Thêm 2 tai Linh Chi giáo góp. Người đời gọi giáo là độc — kệ họ. Việc cứu người bằng độc, giáo làm từ lâu rồi."] },
      q_mon_huyen_am_5: { title: "Thảo an thần cho lò", giver: "tong_am",
        story: "Người luyện Trúc Cơ Đan phải tĩnh tâm ba ngày canh lò: Huyền Âm Cung giao ngươi hái 5 cây Thanh Tâm Thảo sắc nước an thần cho người canh lò — trong đó có chính ngươi.",
        giverLines: ["Người luyện Trúc Cơ Đan phải tĩnh tâm ba ngày canh lò. Cung giao ngươi hái 5 cây Thanh Tâm Thảo sắc nước an thần.", "Cho người canh lò — trong đó có chính ngươi. Đừng nghĩ việc này nhỏ, ba ngày canh lò là ba ngày thử lòng."],
        turninLines: ["Thảo đủ rồi. Nước an thần đã sắc, lò của ngươi có cung canh cùng phần tĩnh lặng.", "Thêm 2 tai Linh Chi cung góp vào lò. Lên cao đến đâu cũng phải giữ được một góc lòng yên như thế này."] },
      q_mon_thanh_phong_6: { title: "Giữ yên đường về làng", giver: "de_tu_phai",
        story: "Trước ngày ngươi độ kiếp, Thanh Phong giao việc cuối: dẹp 4 con Sói Rừng đang lảng vảng đường về làng. Ngươi lên trời hay ở lại đất, con đường về nhà phải yên trước đã.",
        giverLines: ["Trước ngày ngươi độ kiếp, ta giao việc cuối cùng của phái: dẹp 4 con Sói Rừng lảng vảng đường về làng.", "Ngươi lên trời hay ở lại đất, con đường về nhà phải yên trước đã. Đó là điều Thanh Phong vẫn dạy."],
        turninLines: ["Đường về làng yên. Trong tay ngươi còn viên Hồi Xuân Đan của phái — mang theo vào ngày kiếp.", "Lên trời cho vững. Phái ở dưới này giữ đường cho ngươi về."] },
      q_mon_huyen_phap_6: { title: "Pháp đàn cầu phúc", giver: "tong_phap",
        story: "Huyền Pháp Tông dựng pháp đàn cầu phúc cho đệ tử sắp độ kiếp: ngươi dẫn pháp tích 100 tu vi nạp vào đàn. Liễu Ngưng Sương nói pháp đàn không chắn nổi thiên lôi — nó chỉ giúp ngươi tĩnh tâm mà chịu.",
        giverLines: ["Tông dựng pháp đàn cầu phúc cho ngươi trước ngày độ kiếp. Dẫn pháp tích 100 tu vi nạp vào đàn đi.", "Nói trước cho rõ: pháp đàn không chắn nổi thiên lôi. Nó chỉ giúp ngươi tĩnh tâm mà chịu — phần còn lại là của ngươi."],
        turninLines: ["Đàn đã nạp đầy. Viên Hồi Xuân Đan này mang theo — pháp tu yếu thân, phải biết tự giữ mạng.", "Đi đi. Thiên lôi dữ đến đâu, nhớ hơi thở đầu tiên ta dạy ngươi."] },
      q_mon_thien_cong_6: { title: "Rèn lại giáp độ kiếp", giver: "tong_khi",
        story: "Thiên Công Phường gọi ngươi về lò rèn lại bộ giáp cho ngày độ kiếp: vật liệu vẫn là bờm sắt tốt nhất — hạ 3 con Lợn Mông Sắt mang bờm về, phường rèn gấp trong đêm.",
        giverLines: ["Nghe nói ngươi sắp độ kiếp. Về lò ngay — ta rèn lại bộ giáp cho ngươi, vật liệu vẫn là bờm sắt tốt nhất.", "Hạ 3 con Lợn Mông Sắt mang bờm về, ta rèn gấp trong đêm. Giáp độ kiếp là giáp giữ mạng, không phải giáp đẹp."],
        turninLines: ["Giáp xong rồi, thử đi. Sét đánh vào giáp này trượt đi ba phần — hai phần còn lại là việc của ngươi.", "Viên Hồi Xuân Đan cầm theo. Lên trời cho nguyên vẹn mà về, phường còn nhiều việc cho ngươi."] },
      q_mon_dan_ha_6: { title: "Đan cứu mạng ngày kiếp", giver: "tong_dan",
        story: "Đan Hà Cốc giao bài cuối trước ngày kiếp: tự luyện 1 viên Sinh Cơ Đan — viên đan cứu mạng ngươi sẽ mang theo vào lôi kiếp. Luyện bằng tay mình, uống bằng mạng mình, Tần Dược Tử nói vậy.",
        giverLines: ["Bài cuối của Cốc trước ngày ngươi độ kiếp: tự luyện 1 viên Sinh Cơ Đan.", "Viên đan cứu mạng ngươi sẽ mang theo vào lôi kiếp. Luyện bằng tay mình, uống bằng mạng mình — đó là lệ của Đan Hà từ đời tổ sư."],
        turninLines: ["Đan thành, dược lực êm mà sâu. Viên này có thể kéo ngươi về từ cửa tử một lần.", "Mang theo bên người, đừng rời. Ta ở dưới này canh lò chờ tin ngươi."] },
      q_mon_van_thu_6: { title: "Lời chúc của rừng", giver: "tong_thu",
        story: "Trước ngày độ kiếp, Vạn Thú Môn bắt ngươi vào rừng một mình gặp Hà Thiết Sơn: rừng có lời chúc riêng cho người sắp lên trời, và chỉ người được thú tin mới nghe được.",
        giverLines: ["Trước ngày ngươi độ kiếp, vào rừng một mình gặp Hà Thiết Sơn đi. Rừng có lời chúc riêng cho người sắp lên trời.", "Ta không nói trước là gì đâu. Chỉ người được thú tin mới nghe được — mà ngươi thì nghe được, ta chắc."],
        turninLines: ["Ông Sơn gửi lời: thú rừng sẽ tránh xa bãi độ kiếp của ngươi ba ngày, để trời đánh ngươi cho yên.", "Đó là quà lớn nhất rừng tặng được. Viên Hồi Xuân Đan này của ta — mang theo nhé."] },
      q_mon_thien_phu_6: { title: "Bùa trấn tâm", giver: "tong_phu",
        story: "Thiên Phù Các cho ngươi một việc nhỏ mà nặng: tới Miếu Sơn Thần gặp Từ bà, xin bà một lá bùa trấn tâm viết tay để mang theo vào ngày độ kiếp. Bùa không chống được sét — nó chống lòng ngươi run.",
        giverLines: ["Trước ngày độ kiếp, tới Miếu Sơn Thần gặp Từ bà, xin bà một lá bùa trấn tâm viết tay mang theo.", "Nói rõ cho ngươi khỏi hiểu lầm: bùa không chống được sét. Nó chống lòng ngươi run. Mà người độ kiếp chết vì run nhiều hơn vì sét."],
        turninLines: ["Từ bà viết bùa cho ngươi rồi à? Bà ít viết cho ai lắm — ngươi được bà quý đấy.", "Viên Hồi Xuân Đan này mang theo. Lên trời cho vững, các chờ ngươi về vẽ tiếp."] },
      q_mon_cuu_cung_6: { title: "Trận nhỏ giữ làng", giver: "tong_tran",
        story: "Ngày ngươi độ kiếp, ai giữ làng? Cửu Cung Trận Tông giao ngươi về làng gặp trưởng làng Trần Đức, cùng ông chốt một trận nhỏ giữ cổng Nam Môn trong ngày ngươi vắng mặt trên trời.",
        giverLines: ["Ngày ngươi độ kiếp, ai giữ làng? Về làng gặp trưởng làng Trần Đức, cùng ông chốt một trận nhỏ giữ cổng Nam Môn trong ngày ngươi ở trên trời.", "Độ kiếp không chỉ là việc của người trên trời. Dưới đất phải yên, người trên trời mới dám đi hết đường."],
        turninLines: ["Trận giữ làng đã chốt với trưởng làng. Làng yên, ngươi cứ yên tâm mà lên.", "Viên Hồi Xuân Đan này mang theo. Thiên lôi không nể trận của ai đâu — tự giữ mình."] },
      q_mon_kim_cang_6: { title: "Buổi luyện thể cuối", giver: "tong_the",
        story: "Kim Cang Môn không có quà cáp gì cho ngày độ kiếp ngoài một buổi luyện thể cuối: hạ 4 con Lợn Rừng ở bãi hoang như ngày mới nhập môn. Thân này chịu được lôi kiếp hay không, hôm nay biết.",
        giverLines: ["Môn không có quà cáp cho ngày độ kiếp. Chỉ có một buổi luyện thể cuối: hạ 4 con Lợn Rừng ở bãi hoang, như ngày ngươi mới nhập môn.", "Thân này chịu được lôi kiếp hay không, hôm nay biết. Đi đi, đừng nghĩ nhiều."],
        turninLines: ["Vẫn đứng vững như ngày đầu, mà sức thì gấp mấy lần. Thân này qua được kiếp.", "Viên Hồi Xuân Đan cầm theo. Lên trời rồi nhớ: ngã thì đứng dậy. Môn chờ ngươi về."] },
      q_mon_ngu_doc_6: { title: "Thuốc giải cho ngày kiếp", giver: "tong_doc",
        story: "Lôi kiếp đánh người cháy xém, độc khí đất bốc lên theo: Ngũ Độc Giáo giao ngươi hái 5 cây Thảo Dược chuẩn bị sẵn thuốc giải và thuốc trị thương cho ngày trở về.",
        giverLines: ["Lôi kiếp đánh người cháy xém, độc khí trong đất bốc lên theo. Hái 5 cây Thảo Dược về, ta chuẩn bị thuốc giải và thuốc trị thương cho ngày ngươi về.", "Chuẩn bị cho ngày trở về còn quan trọng hơn chuẩn bị cho ngày đi. Nhớ lấy câu này."],
        turninLines: ["Dược đủ rồi. Thuốc giải đã sắc sẵn, để ở kho — ngày ngươi về là có ngay.", "Viên Giải Độc Đan này mang theo bên người. Lên trời cho cẩn thận, giáo không muốn mất người."] },
      q_mon_huyen_am_6: { title: "Khúc đàn trước kiếp", giver: "tong_am",
        story: "Đêm trước ngày độ kiếp, Huyền Âm Cung bắt ngươi về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc tĩnh tâm cho cả quán nghe. Người sắp bước lên trời phải nhớ tiếng người dưới đất.",
        giverLines: ["Đêm trước ngày độ kiếp, về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc tĩnh tâm cho cả quán nghe.", "Người sắp bước lên trời phải nhớ tiếng người dưới đất. Đó là lệ cuối cùng của cung dành cho ngươi."],
        turninLines: ["Cả quán im lặng nghe ngươi đàn. Có người khóc — không phải buồn, là yên lòng.", "Viên Hồi Xuân Đan này mang theo. Thiên lôi có dữ, dưới đất vẫn có tiếng đàn chờ ngươi về."] },
      q_mon_thanh_phong_7: { title: "Ngự kiếm tuần sơn", giver: "de_tu_phai",
        story: "Đệ tử Trúc Cơ đầu tiên của Thanh Phong trong vùng được giao việc xứng tầm: hạ 1 vương thú mang hình Sơn Quân — ở sào huyệt cũ rừng Thanh Sơn hoặc Gầm Sơn Hổ Vương ở Đại Sơn. Kiếm đã biết bay, người phải dám dùng.",
        giverLines: ["Đệ tử Trúc Cơ đầu tiên của vùng mà Thanh Phong nhận — việc đầu tiên phải xứng: hạ 1 vương thú mang hình Sơn Quân.", "Ở sào cũ trong rừng, hoặc Gầm Sơn Hổ Vương trong Đại Sơn. Kiếm đã biết bay rồi, người phải dám dùng."],
        turninLines: ["Vương thú gục dưới kiếm Trúc Cơ. Tốt. Từ nay bãi tuyển này có người giữ núi thật sự rồi.", "Thưởng của phái. Đường Vân Hải phía trước còn dài — kiếm đừng rời tay."] },
      q_mon_huyen_phap_7: { title: "Pháp luân Trúc Cơ", giver: "tong_phap",
        story: "Vừa kết đạo cơ, Huyền Pháp Tông bắt ngươi vận pháp luân mới một vòng trọn: thổ nạp tích 150 tu vi cho Ngũ Hành Luân trên ngực chuyển đủ năm màu không nghẽn một hệ nào.",
        giverLines: ["Vừa kết đạo cơ, vận thử pháp luân mới cho ta xem: tích 150 tu vi, cho Ngũ Hành Luân chuyển đủ năm màu không nghẽn một hệ.", "Trúc Cơ mà pháp luân nghẽn là đạo cơ nứt từ trong. Làm chậm thôi."],
        turninLines: ["Năm màu chuyển êm như một. Đạo cơ của ngươi vững hơn nhiều đệ tử ta từng dạy.", "Thưởng của tông. Từ nay ngươi là pháp tu Trúc Cơ trẻ nhất vùng này — đừng để ai nói là nhờ may."] },
      q_mon_thien_cong_7: { title: "Vật liệu cho khí Trúc Cơ", giver: "tong_khi",
        story: "Phường muốn rèn món khí đầu tiên cho đệ tử Trúc Cơ của vùng: hạ 5 con Lợn Mông Sắt ở Đại Sơn lấy bờm và da tốt nhất. Mạc Thiết Tâm nói khí Trúc Cơ phải bắt đầu từ vật liệu thật tay.",
        giverLines: ["Có đệ tử Trúc Cơ rồi, phường muốn rèn món khí đầu tiên xứng tầm: hạ 5 con Lợn Mông Sắt ở Đại Sơn, lấy bờm và da tốt nhất.", "Ta nói thật: khí Trúc Cơ phải bắt đầu từ vật liệu thật tay. Không có đường tắt ở phường này."],
        turninLines: ["Vật liệu đủ tốt. Món khí đầu tiên của ngươi, ta sẽ tự tay rèn.", "Phần Yêu Đan Cấp 2 kèm đây — phường chia cho người mang vật liệu về. Đường Vân Hải còn cần nhiều thứ lạ hơn nữa."] },
      q_mon_dan_ha_7: { title: "Mẻ đan Trúc Cơ đầu tiên", giver: "tong_dan",
        story: "Đan Hà Cốc giao mẻ đan đầu tiên ở thân phận Trúc Cơ: luyện 1 viên Phá Cảnh Đan — phương của người đã bái nhập Cốc. Từ nay đan ngươi luyện không chỉ cho làng nữa, mà cho cả vùng núi này.",
        giverLines: ["Ở thân phận Trúc Cơ, Cốc giao ngươi mẻ đan đầu tiên của hàng đan sư thật: luyện 1 viên Phá Cảnh Đan.", "Phương này chỉ truyền cho người đã bái nhập Cốc. Từ nay đan ngươi luyện không chỉ cho làng nữa, mà cho cả vùng núi này."],
        turninLines: ["Đan Trúc Cơ đầu tay mà vân đan đã đều thế này... Cốc có người kế nghiệp rồi.", "Thưởng của Cốc đây. Nhớ giữ lửa lò như giữ mạng — ở cảnh giới nào cũng vậy."] },
      q_mon_van_thu_7: { title: "Đàn thú dưới chân mây", giver: "tong_thu",
        story: "Người Trúc Cơ đầu tiên mà đàn thú rừng thừa nhận — Vạn Thú Môn muốn ghi lại ngày này: dẹp 6 con Sói Rừng dữ nhất cửa sơn, cho đàn thú non yên ổn ra uống nước suối lần đầu.",
        giverLines: ["Ngươi là người Trúc Cơ đầu tiên mà đàn thú rừng này thừa nhận. Ta muốn ghi lại ngày này tử tế.", "Dẹp 6 con Sói Rừng dữ nhất cửa sơn, cho đàn thú non yên ổn ra uống nước suối lần đầu tiên trong mùa."],
        turninLines: ["Đàn non ra suối rồi, uống nước không còn giật mình nữa. Cảnh đó đẹp hơn mọi lễ mừng của người.", "Thưởng của môn đây. Từ nay đi trong rừng, thú sẽ nhường đường cho ngươi trước."] },
      q_mon_thien_phu_7: { title: "Bùa trấn sơn môn mới", giver: "tong_phu",
        story: "Có đệ tử Trúc Cơ, Thiên Phù Các nâng cấp bùa trấn cho cả vùng: dẹp 5 con Rắn Lục Đuôi Đỏ ở khe suối Đại Sơn, lấy đường sạch để đoàn phù sư lên đặt bùa mới.",
        giverLines: ["Có đệ tử Trúc Cơ, các nâng cấp bùa trấn cho cả vùng. Dẹp 5 con Rắn Lục Đuôi Đỏ ở khe suối Đại Sơn, lấy đường sạch cho đoàn phù sư lên đặt bùa mới.", "Lần này ngươi đi không phải để dẹp rắn — là để mở đường cho cả một hệ thống trấn mới."],
        turninLines: ["Đường sạch rồi, đoàn phù sư đã lên đặt bùa. Từ mùa này đường Đại Sơn yên hơn hẳn.", "Thưởng của các. Bùa của ngươi giờ trấn được cả một vùng — nhớ cái trọng lượng đó mỗi khi đặt bút."] },
      q_mon_cuu_cung_7: { title: "Đại trận cửu cung Trúc Cơ", giver: "tong_tran",
        story: "Cửu Cung Trận Tông cho ngươi bày đại trận cửu cung đầu tiên ở thân phận Trúc Cơ: dẫn khí tích 150 tu vi khép trọn đại trận quanh bãi tuyển. Âu Dương Kỳ nói trận này sẽ giữ núi một mùa.",
        giverLines: ["Ở thân phận Trúc Cơ, ngươi bày đại trận cửu cung đầu tiên cho tông: dẫn khí tích 150 tu vi, khép trọn đại trận quanh bãi tuyển.", "Đại trận này sẽ giữ núi một mùa. Ngươi bày nó, tức là ngươi bắt đầu gánh việc của cả vùng."],
        turninLines: ["Đại trận khép trọn, chín cung sáng đều. Âu Dương Kỳ này nhận thua — ngươi bày nhanh hơn ta ngày trẻ.", "Thưởng của tông. Từ nay tên ngươi gắn với thế trận của cả dãy núi này."] },
      q_mon_kim_cang_7: { title: "Thể tu Trúc Cơ đấu vương", giver: "tong_the",
        story: "Kim Cang Môn ăn mừng đệ tử Trúc Cơ bằng cách của môn: đấu 1 vương thú mang hình Sơn Quân — Sơn Quân hồi sinh ở rừng Thanh Sơn hoặc Gầm Sơn Hổ Vương ở Đại Sơn. Thắng, môn khắc tên ngươi lên bia đá cổng môn.",
        giverLines: ["Kim Cang Môn mừng đệ tử Trúc Cơ bằng cách của môn: đấu 1 vương thú mang hình Sơn Quân.", "Sơn Quân hồi sinh ở rừng nhà, hoặc Gầm Sơn Hổ Vương trong Đại Sơn. Thắng, môn khắc tên ngươi lên bia đá cổng môn."],
        turninLines: ["Tên ngươi đã lên bia đá cổng môn rồi đấy. Trăm năm sau đệ tử nhìn lên sẽ hỏi người đó là ai.", "Thưởng của môn. Thể tu Trúc Cơ — đường Kim Đan của ngươi sẽ đi bằng chính đôi chân này."] },
      q_mon_ngu_doc_7: { title: "Độc hành Đại Sơn sâu", giver: "tong_doc",
        story: "Ngũ Độc Giáo cử đệ tử Trúc Cơ đầu tiên của giáo vào sâu Đại Sơn hành độc: dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích, mở đường cho giáo thu nọc mùa mới.",
        giverLines: ["Giáo cử đệ tử Trúc Cơ đầu tiên vào sâu Đại Sơn hành độc: dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích.", "Mở đường cho giáo thu nọc mùa mới. Từ nay vùng sâu đó là đất của ngươi đi thay giáo."],
        turninLines: ["Đường thu nọc mở rồi. Đệ tử Trúc Cơ của Ngũ Độc Giáo — danh này từ nay người trong vùng sẽ nhắc tới.", "Thưởng của giáo. Độc của ngươi giờ cứu được nhiều người hơn hại được — giữ nó như vậy."] },
      q_mon_huyen_am_7: { title: "Khúc đàn trên mây", giver: "tong_am",
        story: "Huyền Âm Cung có lệ: đệ tử Trúc Cơ đầu tiên phải đàn một khúc trên mây cho cả vùng nghe. Ngươi tĩnh tọa dẫn khí tích 150 tu vi theo đàn, để tiếng đàn theo linh khí mà đi xa.",
        giverLines: ["Huyền Âm Cung có lệ: đệ tử Trúc Cơ đầu tiên phải đàn một khúc trên mây cho cả vùng nghe.", "Ngươi dẫn khí tích 150 tu vi theo đàn — tiếng đàn theo linh khí mà đi xa, ai ở dưới cũng nghe được."],
        turninLines: ["Hôm đó cả vùng Thanh Khê ngẩng đầu lên trời. Người ta nói nghe tiếng đàn mà lòng yên lạ thường.", "Thưởng của cung. Từ nay tiếng đàn của ngươi không còn chỉ của một quán trọ nữa."] },
      q_mon_thanh_phong_8: { title: "Thám đường Vân Hải", giver: "de_tu_phai",
        story: "Đường tới Kim Đan bắt đầu ở Sơn Trung Vân Hải sau Chi Đỉnh. Thanh Phong giao ngươi thám đường trước: dẹp 6 con Sói Rừng ở Đại Sơn sâu, mở lối cho đệ tử các đời sau.",
        giverLines: ["Đường tới Kim Đan bắt đầu sau Chi Đỉnh, ở Sơn Trung Vân Hải. Phái giao ngươi thám đường: dẹp 6 con Sói Rừng ở Đại Sơn sâu, mở lối cho người sau.", "Đệ tử Thanh Phong đời nào cũng là người đi trước mở đường. Đời này là ngươi."],
        turninLines: ["Đường đã mở. Đây — hạt giống Long Tiên Thảo phái tìm được, gieo vào hành trang của ngươi cho chặng Kim Đan.", "Đi xa đến đâu cũng nhớ: kiếm mở đường là để người sau đi, không phải để khoe."] },
      q_mon_huyen_phap_8: { title: "Ngưng pháp ở biển mây", giver: "tong_phap",
        story: "Huyền Pháp Tông chỉ đường Kim Đan bằng một câu: pháp phải ngưng như sương đọng. Thổ nạp tích 200 tu vi ở thân phận Trúc Cơ, cho Liễu Ngưng Sương xem pháp cơ của ngươi đặc tới đâu.",
        giverLines: ["Đường Kim Đan của pháp tu gói trong một chữ: ngưng. Pháp phải ngưng như sương đọng trên lá mới kết được đan.", "Tích 200 tu vi cho ta xem pháp cơ của ngươi đã đặc tới đâu rồi."],
        turninLines: ["Đặc lắm rồi. Sương đã bắt đầu đọng — Kim Đan không còn là chuyện kể nữa.", "Hạt Long Tiên Thảo này tông giao ngươi giữ. Ngày lên Vân Hải hái dược thật, ngươi sẽ cần nó làm mẫu."] },
      q_mon_thien_cong_8: { title: "Tìm vật liệu Vân Hải", giver: "tong_khi",
        story: "Khí của Kim Đan cần vật liệu sinh trong biển mây. Thiên Công Phường giao ngươi vào Đại Sơn sâu hạ 5 con Lợn Mông Sắt, tiện đường ghi lại những mỏ vật liệu lạ cho phường.",
        giverLines: ["Khí của Kim Đan cần vật liệu sinh trong biển mây — thứ đó phường này chưa từng thấy.", "Ngươi vào Đại Sơn sâu hạ 5 con Lợn Mông Sắt, tiện đường ghi lại mọi mỏ vật liệu lạ cho ta. Mắt thợ của ngươi giờ là mắt của phường."],
        turninLines: ["Ghi chép rõ ràng lắm. Phường sẽ theo sổ này mà cử người đi khảo sát sau.", "Hạt Long Tiên Thảo này ngươi giữ — phường tìm được trong chuyến hàng cũ. Chặng Kim Đan của ngươi bắt đầu rồi đấy."] },
      q_mon_dan_ha_8: { title: "Dược Vân Hải", giver: "tong_dan",
        story: "Đan Hà Cốc bắt đầu tính phương đan Kim Đan từ bây giờ: hái 4 tai Linh Chi Thanh Sơn làm nền dược, còn phần dược Vân Hải, Cốc sẽ cử ngươi đi lấy khi đường mở.",
        giverLines: ["Cốc bắt đầu tính phương đan Kim Đan từ bây giờ, không phải chờ tới lúc ngươi đứng trước cửa mới lo.", "Hái 4 tai Linh Chi Thanh Sơn làm nền dược mang về. Phần dược Vân Hải, Cốc sẽ cử ngươi đi lấy khi đường mở."],
        turninLines: ["Linh chi nền đủ rồi. Phương đan Kim Đan của Cốc bắt đầu có hình hài từ hôm nay.", "Hạt Long Tiên Thảo này ngươi giữ — vị chính của phương đang nằm trong tay ngươi đấy."] },
      q_mon_van_thu_8: { title: "Thú Vân Hải", giver: "tong_thu",
        story: "Đàn Khỉ Mặt Đỏ ở rừng già Đại Sơn đang chặn đường thú di cư lên Vân Hải. Dẹp 6 con khỉ đầu đàn mở đường cho đàn thú — Vạn Thú Môn nói Kim Đan cũng bắt đầu từ một việc lành.",
        giverLines: ["Đàn khỉ ở rừng già đang chặn đường thú di cư lên Vân Hải — mùa này chúng không lên được là chết rét ở lại.", "Dẹp 6 con khỉ đầu đàn mở đường cho chúng. Kim Đan của người tu cũng bắt đầu từ một việc lành cho thú, ta tin vậy."],
        turninLines: ["Đường di cư thông rồi, đàn thú đã bắt đầu lên núi. Ngươi vừa cứu cả một mùa của chúng.", "Hạt Long Tiên Thảo này là của một con thú già tha về lán trại năm ngoái — giờ nó thuộc về ngươi."] },
      q_mon_thien_phu_8: { title: "Phù mở đường mây", giver: "tong_phu",
        story: "Đường lên Vân Hải cần phù mở đường cắm dọc lối mòn: Thiên Phù Các giao ngươi dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích, dọn sạch lối cắm phù.",
        giverLines: ["Đường lên Vân Hải cần phù mở đường cắm dọc lối mòn. Dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích, dọn lối cắm phù cho ta.", "Mỗi lá phù trên đường đó sau này là một mạng người được giữ. Dọn cho sạch."],
        turninLines: ["Lối cắm phù thông rồi. Hạt Long Tiên Thảo này các tìm được trong kho cũ — giao ngươi giữ cho chặng Kim Đan.", "Đi xa nhớ về. Các này nhỏ, thiếu một người là vắng hẳn."] },
      q_mon_cuu_cung_8: { title: "Đo thế trận Vân Hải", giver: "tong_tran",
        story: "Cửu Cung Trận Tông muốn đo thế trận của cả dãy Vân Hải trước khi ai lên đó kết đan: về bãi tuyển gặp Tạ Thanh Vân, nghe sứ giả kể địa thế Sơn Trung Vân Hải và Đoạn Long Lĩnh.",
        giverLines: ["Tông muốn đo thế trận của cả dãy Vân Hải trước khi bất kỳ ai lên đó kết đan. Việc này không làm bằng chân trước được.", "Về bãi tuyển gặp Tạ Thanh Vân, nghe sứ giả kể địa thế Sơn Trung Vân Hải và Đoạn Long Lĩnh, ghi lại cho ta từng điểm."],
        turninLines: ["Ghi chép đủ đầy. Thế Vân Hải hiểm hơn ta tưởng — may mà đo trước khi người lên.", "Hạt Long Tiên Thảo này tông giao ngươi. Đường Kim Đan của ngươi, trận pháp sẽ đi cùng tới cuối."] },
      q_mon_kim_cang_8: { title: "Gánh đá mở đường", giver: "tong_the",
        story: "Đường lên Chi Đỉnh có đoạn sạt đá chắn lối. Kim Cang Môn giao ngươi dẹp 6 con Lợn Rừng quanh đoạn đường đó rồi cùng dân làng gánh đá mở lại đường cho người sau.",
        giverLines: ["Đường lên Chi Đỉnh có đoạn sạt đá chắn lối. Dẹp 6 con Lợn Rừng quanh đoạn đường đó.", "Xong rồi cùng dân làng gánh đá mở lại đường. Đường tu không phải chỉ của người tu — người sau còn phải đi."],
        turninLines: ["Đường mở rồi, dân làng cảm ơn ngươi rối rít. Đó mới là sức mạnh đáng ghi sổ của Kim Cang Môn.", "Hạt Long Tiên Thảo này một bác tiều phu nhặt được gửi cho ngươi. Gốc của ngươi ở làng — đừng quên."] },
      q_mon_ngu_doc_8: { title: "Độc Vân Hải", giver: "tong_doc",
        story: "Ngũ Độc Giáo nghe nói trên Vân Hải có loài hoa độc chưa từng ghi sổ. Trước hết, thu 5 cây Độc Tâm Hoa ở đất cũ làm mẫu đối chiếu, mang về cho Đường Tĩnh.",
        giverLines: ["Giáo nghe nói trên Vân Hải có loài hoa độc chưa từng ghi sổ. Người của giáo nghe vậy là ngứa tay.", "Trước hết thu 5 cây Độc Tâm Hoa ở đất cũ làm mẫu đối chiếu, mang về cho ta. Có mẫu cũ mới nhận ra mẫu mới."],
        turninLines: ["Mẫu đối chiếu đủ rồi. Ngày ngươi lên Vân Hải, mắt ngươi là sổ độc của giáo mang theo.", "Hạt Long Tiên Thảo này ta đổi được từ một thương nhân — thứ này trên Vân Hải nhiều, giữ làm mẫu trước."] },
      q_mon_huyen_am_8: { title: "Đàn vọng Vân Hải", giver: "tong_am",
        story: "Trước chuyến đi xa nhất đời tu, Huyền Âm Cung bắt ngươi về làng gặp trưởng làng Trần Đức, đàn cho làng nghe một khúc và hứa ngày về. Kim Đan ở trên mây, gốc vẫn ở dưới đất.",
        giverLines: ["Trước chuyến đi xa nhất đời tu, về làng gặp trưởng làng Trần Đức. Đàn cho làng nghe một khúc, và hứa ngày về.", "Kim Đan ở trên mây, mà gốc của ngươi ở dưới đất này. Cung dạy ngươi điều đó sau cùng, mà là điều đầu tiên phải nhớ."],
        turninLines: ["Trưởng làng nắm tay ngươi lâu lắm. Cả làng sẽ chờ khúc đàn ngày ngươi trở về.", "Hạt Long Tiên Thảo này cung giao ngươi giữ. Đi xa đến đâu, đường về vẫn bắt đầu từ một lời hứa."] },
      q_chinh_1: { title: 'Gặp trưởng làng', giver: 'truong_lang',
        story: 'Buổi sáng đầu tiên của hành trình. Trưởng làng muốn gặp mặt người trẻ trong làng để dặn dò — và ông đã để ý giếng cổ phát sáng mấy đêm nay.',
        giverLines: ['Làng ta nhỏ, nhưng người làng đều là người nhà. Cháu ra mắt mọi người một lượt đi, rồi quay lại đây ta dặn chuyện giếng cổ.'],
        turninLines: ['Tốt, cháu đã ra mắt mọi người. Giờ ta nói chuyện chính: giếng cổ đầu làng mấy đêm nay phát sáng. Cháu ra đó xem giúp ta.'] },
      q_chinh_2: { title: 'Bí mật giếng cổ', giver: 'truong_lang',
        story: 'Giếng cổ nằm trên một linh nhãn. Đêm giếng phát sáng, linh căn ngủ say trong người nhân vật chính thức tỉnh — và trưởng làng kể bí mật phong ấn của Thanh Khê lão nhân.',
        giverLines: ['Cháu tới xem, chạm tay vào thành giếng mà cảm thử. Đừng sợ, giếng làng chưa từng hại ai.'],
        turninLines: ['Quả nhiên... linh căn của cháu đã thức tỉnh! Giếng không chọn người, cháu ạ. Giếng chỉ soi ra thứ vốn có trong người cháu.'] },
      q_chinh_3: { title: 'Thổ nạp đầu tiên', giver: 'truong_lang',
        story: 'Lần đầu cảm được linh khí và thổ nạp. Đại phu dặn: thân thể là cái bình, tu vi là nước — đừng ham nhanh.',
        giverLines: ['Ngồi yên, hít một hơi dài, cảm luồng khí ấm chạy trong người. Thổ nạp đủ 30 tu vi rồi quay lại gặp ta.'],
        turninLines: ['Thấy chưa, hơi thở đầu tiên là khó nhất. Từ nay cháu đã khác người phàm rồi — nhưng nhớ, tu vi là để bảo vệ, không phải để khoe.'] },
      q_chinh_4: { title: 'Đột phá Luyện Khí', giver: 'truong_lang',
        story: 'Phá quan lên Luyện Khí tầng 1, cả làng ăn mừng — và ngay lúc đó lính gác báo sói đã tới gần ruộng cuối làng. Người tu sĩ đầu tiên của làng ra đời đúng lúc làng cần nhất.',
        giverLines: ['Ngồi xuống, tĩnh tâm, phá quan mà lên Luyện Khí tầng 1. Cả làng đang trông vào cháu đấy.'],
        turninLines: ['Luyện Khí tầng 1! Làng Thanh Khê ta cuối cùng cũng có tu sĩ của riêng mình! Cháu mạnh lên, là để bảo vệ nơi này — đó mới là tu tiên.'] },
      q_phu_tho: { title: 'Thịt thỏ cho quán', giver: 'chu_quan',
        story: 'Đêm qua sói về gần làng, đội lính gác đánh đuổi cả đêm, mấy người bị thương nhẹ. Chủ quán nấu cháo thỏ hầm thảo dược cho họ bồi bổ, cần 3 con Thỏ Hoang tươi ngoài bãi.',
        giverLines: ['Cháu săn giúp ta 3 con Thỏ Hoang ngoài bãi, thỏ phải còn tươi thì cháo mới ngon. Ta trả công xứng đáng.'],
        turninLines: ['Thịt thỏ tới rồi! Để ta hầm ngay — mấy anh lính gác ăn được bát cháo nóng này là khỏe lại ngay.'] },
      q_phu_thuoc: { title: 'Hái thảo dược', giver: 'dai_phu',
        story: 'Thuốc cầm máu sắp hết, lính gác bị sói cào, mấy đứa nhỏ trong làng đang sốt, mà học trò của đại phu thì lên thành phố lấy thuốc chưa về. Cần 3 cây thảo dược ngoài bãi hoang.',
        giverLines: ['Cháu ra bãi hoang hái giúp ta 3 cây thảo dược — lá xanh đậm, rễ ngắn, mọc ven đường bãi hoang.'],
        turninLines: ['Đủ rồi, đủ rồi! Có chỗ thuốc này là ta cứu được cả đội lính gác với lũ nhỏ.'] },
      q_phu_da: { title: 'Da sói cho thợ rèn', giver: 'tho_ren',
        story: 'Mùa thú dữ sắp tới, lính gác cần giáp mới; sắt thì nặng, mặc vào chạy không kịp sói. Thợ rèn làm giáp da sói — nhẹ mà dai — cần 2 tấm da Sói Con còn nguyên.',
        giverLines: ['Cháu săn giúp ta 2 con Sói Con lấy da, da phải còn nguyên, đừng để rách — rách thì giáp không kín.'],
        turninLines: ['Da tốt! Để ta thuộc da rồi rèn giáp cho A Hổ, A Báo. Có giáp này, hai đứa nó đứng cổng cũng vững hơn.'] },
      q_chinh_5: { title: 'Giữ cổng Nam Môn', giver: 'linh_gac',
        story: 'Mùa thú dữ tới sớm. Bầy thú tràn qua bãi hoang đánh thẳng vào Nam Môn theo từng đợt (sự kiện Thú dữ tấn công làng Thanh Khê). Người chơi giữ chính giữa cổng cùng A Hổ, A Báo, hạ 5 con sói đầu đàn để làm vỡ bầy. Sau trận đánh mới lộ ra: bầy thú chạy có hàng lối như có kẻ dẫn đầu - Sơn Quân đang gọi bầy trong rừng sâu.',
        giverLines: ['Tới rồi đấy! Thú dữ tràn qua bãi hoang, đang kéo thẳng về Nam Môn! Cháu giữ chính giữa đường, đánh đuổi 5 con sói đầu đàn là bầy sẽ vỡ!'],
        turninLines: ['Bầy vỡ rồi! Cổng còn đứng, làng còn yên. Nhưng bầy thú chạy như có kẻ dẫn đầu - trong rừng sâu, Sơn Quân đang gọi bầy.'] },
      q_chinh_6: { title: 'Truy vết Sơn Quân', giver: 'tho_san_ha',
        story: 'Theo chỉ dẫn của A Hổ, người chơi qua cổng rừng ở cuối bãi hoang vào Rừng Thanh Sơn, tìm lán trại của thợ săn kỳ cựu Hà Thiết Sơn. Ông dạy cách đọc dấu Sơn Quân rồi giao việc: hạ 4 con sói rừng - tai mắt của Sơn Quân - dọc đường mòn và xem dấu chân, vệt nanh quanh đó. Dấu mới cho thấy Sơn Quân đang bồn chồn vì linh khí rò từ giếng.',
        giverLines: ['Đừng đi thẳng vào sào huyệt. Hạ 4 con sói rừng dọc đường mòn, xem dấu chân và vệt nanh chúng để lại, rồi quay lại đây.'],
        turninLines: ['Dấu chân mới, vệt nanh còn ướt bùn. Sơn Quân đang bồn chồn - trước khi đối đầu nó, cháu phải tới Miếu Sơn Thần gặp Từ bà.'] },
      q_chinh_7: { title: 'Đối đầu Sơn Quân', giver: 'giu_mieu',
        story: 'Phong ấn giếng cổ nứt thêm: giữa trưa nước giếng phát sáng, lạnh buốt bất thường (điềm báo biến cố). Từ bà ở Miếu Sơn Thần giải thích Sơn Quân cũng là kẻ giữ núi, bị linh khí hỗn loạn làm phát cuồng, và nó sẽ kéo bầy về giếng. Người chơi vào sâu trong rừng đối đầu trực tiếp Sơn Quân (boss), lấy nanh của nó làm vật trấn cho lễ khấn trấn phong ấn. Phong ấn chỉ được vá tạm - làng cần tới Thanh Phong Phái.',
        giverLines: ['Phong ấn vừa nứt thêm một đường. Phải đối đầu Sơn Quân ngay trong rừng, mang nanh của nó về làm vật trấn cho lễ khấn.'],
        turninLines: ['Nanh Sơn Quân đây rồi. Đêm nay bà làm lễ khấn trấn phong ấn. Nhưng đây chỉ là vá tạm - con đường dài của cháu phải đi qua sơn môn Thanh Phong Phái.'] },
      q_chinh_8: { title: 'Sơn môn mở', giver: 'de_tu_phai',
        story: 'Mùa xuân tới, Thanh Phong Phái dựng bãi tuyển đệ tử ở chân núi phía bắc (map 3), sứ giả Tạ Thanh Vân chủ trì. Nhờ những việc đã làm cho làng, người chơi qua cửa tâm không cần thử; chỉ còn cửa tu vi: đột phá lên Luyện Khí tầng 2. Đạt tầng 2, nhận Lệnh Bài Thanh Phong, trở thành đệ tử nhập môn - kết mở ra thế giới lớn trên núi, khép arc làng Thanh Khê.',
        giverLines: ['Cửa tâm ngươi qua rồi. Chỉ còn cửa tu vi: đột phá lên Luyện Khí tầng 2 rồi quay lại bãi tuyển này.'],
        turninLines: ['Đây là lệnh bài Thanh Phong - từ nay ngươi là đệ tử nhập môn. Sơn môn mở ra thế giới lớn, nhưng làng Thanh Khê mới là nơi dạy ngươi vì sao phải tu tiên.'] },
      q_phu_thuoc_rung: { title: 'Linh chi cho người bị thương', giver: 'hoc_tro',
        story: 'Sau trận thú dữ đánh làng, người bị thương nằm đầy sân hiệu thuốc, thảo dược thường cầm máu quá chậm. Tiểu Hạnh - học trò đại phu vừa từ thành phố trở về - nhờ hái 3 tai linh chi mọc gần suối linh trong Rừng Thanh Sơn để giã thuốc mạnh cứu lính gác bị thương nặng.',
        giverLines: ['Em cần 3 tai linh chi mọc gần suối linh trong rừng để giã thuốc mạnh. Cẩn thận sói rừng - thuốc quý mấy cũng không bằng mạng người đâu.'],
        turninLines: ['Linh chi còn đẫm sương! Có chỗ này, mấy anh lính gác bị thương nặng nhất cũng qua được. Cảm ơn anh/chị!'] },
      q_dan_1: { title: 'Mẻ đan đầu tay', giver: 'hoc_tro',
        story: 'Chuỗi nhiệm vụ ĐAN PHƯƠNG (js/alchemy.js), Tiểu Hạnh giao chính. Sau khi cứu người bằng linh chi, Tiểu Hạnh xin thầy Lý cho người chơi đứng lò lần đầu: học 2 phương cơ bản ở Đan Lô (Hồi Khí Tán, Linh Khí Tán qua teachBasics), tự luyện thành công 1 viên Hồi Khí Tán (mục tiêu brew). Thưởng: phương Hồi Xuân Đan + Tụ Linh Đan + Tụ Khí Đan (đan hỗ trợ đột phá +10%) qua ALCH.afterTurnIn, kèm 1 viên Hồi Xuân Đan.',
        giverLines: ['Thầy Lý gật đầu cho anh/chị đứng lò rồi! Mở Đan Lô ở hiệu thuốc, học phương rồi tự luyện một viên Hồi Khí Tán mang về cho em xem.'],
        turninLines: ['Viên đầu tay mà tròn đều thế này! Đây — phương Hồi Xuân Đan, Tụ Linh Đan với cả Tụ Khí Đan, em chép sẵn cho anh/chị rồi.'] },
      q_dan_2: { title: 'Thuốc cho người sốt', giver: 'hoc_tro',
        story: 'Chuỗi đan phương, mắt xích 2. Mấy đứa nhỏ trong làng sốt không hạ, hiệu thuốc hết Thanh Tâm Thảo sắc thuốc hạ sốt, Tiểu Hạnh phải ở lại trông bệnh nên nhờ hái 4 cây Thanh Tâm Thảo (điểm dược mới ở bãi ngoại ô làng + ven suối rừng). Thưởng: phương Giải Độc Đan + Cường Thể Đan + Tiểu Bồi Nguyên Đan, kèm 1 viên Giải Độc Đan.',
        giverLines: ['Tụi nhỏ sốt hai hôm không hạ mà Thanh Tâm Thảo trong tủ hết sạch. Anh/chị hái giúp em 4 cây — cỏ thơm hoa trắng, mọc ở bãi ngoại ô với ven suối trong rừng.'],
        turninLines: ['Đủ 4 cây rồi! Đây là phương Giải Độc Đan, Cường Thể Đan với Tiểu Bồi Nguyên Đan — em chép cho anh/chị, học đi.'] },
      q_dan_3: { title: 'Đan khó hẹn giờ', giver: 'dai_phu',
        story: 'Chuỗi đan phương, mắt xích 3 — Lý lão đích thân giao. Người bị thú cào nặng chờ thuốc, ông giao việc khó: luyện thành công 2 viên Hồi Xuân Đan (mục tiêu brew) giao trước khi trời tối — "đúng hẹn" là hẹn trong truyện, game không đếm giờ thật. Ông đứng xem không giúp tay: đây là bài kiểm tra tay nghề. Thưởng: phương Ngưng Khí Đan (đan hỗ trợ đột phá +20%) + 1 viên Ngưng Khí Đan + 20 tu vi.',
        giverLines: ['Người bị thú cào nặng không chờ được — ta cần 2 viên Hồi Xuân Đan trước khi trời tối. Lò là của cháu, tay cũng là của cháu. Làm đi.'],
        turninLines: ['Hai viên đều thành, lửa đều, dược tính không hao. Ta truyền cho cháu phương Ngưng Khí Đan — giữ lấy, đường tu càng lên cao càng cần đan đỡ.'] },
      q_dan_4: { title: 'Lò đan của Đan Hà', giver: 'hoc_tro',
        story: 'Chuỗi đan phương, mắt xích cuối — nối sang Đan Hà Cốc. Người của Đan Hà ở bãi tuyển nghe tiếng mẻ đan hẹn giờ, muốn tận mắt xem dược liệu vùng Thanh Sơn: hái 3 tai Ngọc Tủy Chi (dược Huyền phẩm mới ở kẽ đá bãi luyện công chân núi) gửi lên bãi tuyển. Thưởng: phương Thần Hành Đan + 1 viên Đại Hồi Xuân Đan mẫu của Đan Hà. Đường học cao hơn (phương Đan Hà) mở qua phép thử q_tong_dan và lễ bái nhập Đan Hà Cốc — xem js/alchemy.js syncSectRecipes.',
        giverLines: ['Người của Đan Hà Cốc muốn tận mắt xem dược liệu vùng mình. Em cần 3 tai Ngọc Tủy Chi gửi lên bãi tuyển — nấm trắng trong như ngọc ở kẽ đá bãi luyện công trên chân núi.'],
        turninLines: ['Ngọc Tủy Chi thật này! Đan Hà Cốc để lại quà đáp lễ: phương Thần Hành Đan với một viên Đại Hồi Xuân Đan mẫu. Anh/chị cầm lấy.'] },
      q_phu_mo_duong: { title: 'Mở lại đường buôn', giver: 'thuong_nhan_ma',
        story: 'Xe hàng của trưởng thương đội Mã Vạn Lai kẹt ở khúc đường mòn trong rừng vì sói rừng thay nhau rình. Đường tắc là cả vùng thiếu muối, thiếu thuốc. Người chơi dẹp 3 con sói rừng quanh khúc đường để xe lăn bánh, mở lại đường buôn phía nam cho làng.',
        giverLines: ['Xe hàng của ta kẹt ở khúc đường mòn trong rừng, sói rừng rình không đi nổi. Cháu dẹp giúp ta 3 con sói rừng quanh đó.'],
        turninLines: ['Xe về tới cổng rồi! Từ nay thương đội của ta coi Thanh Khê là nhà. Đường này, ta đi tới già.'] },
      q_phu_bao_tin: { title: 'Báo tin phong ấn', giver: 'giu_mieu',
        story: 'Sau lễ khấn trấn phong ấn (mở sau q_chinh_7), Từ bà nhờ người chơi về làng báo lại cho trưởng làng Trần Đức: phong ấn chỉ được vá tạm, vết nứt còn đó, làng cần nhờ Thanh Phong Phái mới giữ được lâu dài. Một nhiệm vụ đưa tin khép lại arc giếng cổ và nối thẳng sang chương tuyển đệ tử.',
        giverLines: ['Cháu về báo cho Trần Đức: phong ấn chỉ vá tạm, vết nứt còn đó. Làng cần người của Thanh Phong Phái giúp mới giữ được lâu dài.'],
        turninLines: ['Trần Đức nghe rồi chứ? Tốt. Đời sau của làng phải trông vào cháu và những người như cháu.'] },
      q_chinh_9: { title: 'Mười tông tụ hội', giver: 'de_tu_phai',
        story: 'Tin phong ấn giếng cổ nứt dần kinh động khắp vùng: linh nhãn Thanh Khê lộ diện không còn là bí mật của một làng. Chín tông môn quanh Thanh Sơn lần lượt kéo về bãi tuyển đệ tử, dựng cờ mở Sơn Môn Đại Hội - bề ngoài là tuyển đệ tử, bề trong là ai cũng muốn xem linh nhãn và xem người tu sĩ trẻ đã trấn lại phong ấn. Trước khi khách tới, người chơi về làng báo tin cho trưởng làng Trần Đức, người giữ bí mật giếng một đời.',
        giverLines: ['Chín tông môn đang kéo về đây. Trước khi họ tới, ngươi về làng báo cho trưởng làng Trần Đức một tiếng - khách tới xem giếng thì chủ nhà phải biết trước.'],
        turninLines: ['Trưởng làng đã hay tin rồi chứ? Nhìn xuống bãi tuyển mà xem - cờ của các tông đang dựng lên rồi.'] },
      q_tong_phap: { title: 'Ngũ hành thí pháp', giver: 'tong_phap',
        story: 'Huyền Pháp Tông tới đầu tiên và dựng đài thử pháp ở phía tây bãi tuyển. Liễu Ngưng Sương - đại diện lạnh lùng của tông - không buồn tiếp khách lâu: đài chưa dựng xong đã bị khỉ mặt đỏ trên núi kéo xuống phá. Cửa thử của pháp tu là dẹp 4 con khỉ quậy mà pháp khí không được loạn: tay nhanh, tâm phải tĩnh hơn tay.',
        giverLines: ['Dẹp 4 con Khỉ Mặt Đỏ quậy phá quanh bãi tuyển cho ta. Đánh được khỉ mà không để pháp khí loạn xạ - đó mới là cửa thử của pháp tu.'],
        turninLines: ['Đòn của ngươi gọn, không thừa một nhịp. Huyền Pháp Tông mở cửa với ngươi.'] },
      q_tong_khi: { title: 'Bờm sắt thử tay', giver: 'tong_khi',
        story: 'Thiên Công Phường của thợ cả Mạc Thiết Tâm thử người bằng vật liệu thật: bờm sắt của Lợn Mông Sắt trong Rừng Thanh Sơn - vật liệu rèn giáp tốt nhất vùng, mà thợ non tay không dám lại gần. Hạ 2 con, mang bờm về nguyên vẹn không cháy xém dập nát, tức là biết giữ vật liệu như người trong nghề.',
        giverLines: ['Hạ 2 con Lợn Mông Sắt, mang bờm sắt về đây cho ta. Làm được, Thiên Công Phường coi cháu là người của nghề.'],
        turninLines: ['Đúng bờm sắt thật, sợi nào sợi nấy còn nguyên. Thiên Công Phường mở cửa với cháu.'] },
      q_tong_dan: { title: 'Linh chi thử đan', giver: 'tong_dan',
        story: 'Trưởng lão Đan Hà Cốc Tần Dược Tử đích thân xuống núi vì linh chi quanh suối linh Thanh Sơn hút linh khí giếng cổ mà mọc - dược tính hiếm có. Cửa thử của đan tu là một mẻ đan thật: hái 3 tai linh chi còn đẫm sương, tai nào cũng phải nguyên vẹn, rồi ngồi xem hết một mẻ đan mở lò ngay trước mặt.',
        giverLines: ['Hái cho lão 3 tai linh chi còn đẫm sương sớm gần suối linh, tai nào tai nấy phải nguyên - dập một góc là dược tính thoát hết.'],
        turninLines: ['Ba tai linh chi còn nguyên sương! Ngồi xuống mà xem lão mở lò - Đan Hà Cốc mở cửa với cháu.'] },
      q_tong_thu: { title: 'Người được thú nhận', giver: 'tong_thu',
        story: 'Vạn Thú Môn cử đệ tử nhỏ nhất - Giang Tiểu Thú, người sói mẹ nuôi lớn - làm đại diện, và cửa thử của họ không giống ai: không cần đánh thắng con thú nào. Người chơi tới lán trại gặp Hà Thiết Sơn, theo ông vào gần bầy thú một buổi; thú rừng ngửi được lòng người, bầy thú không gầm không chạy tức là đã được thú nhận.',
        giverLines: ['Tới lán trại gặp Hà Thiết Sơn, theo ông vào gần bầy thú một buổi. Bầy thú không gầm, không chạy - là anh/chị qua cửa của môn ta.'],
        turninLines: ['Bầy sói rừng ngửi tay anh/chị xong còn nằm xuống ngủ tiếp! Vạn Thú Môn mở cửa với anh/chị.'] },
      q_tong_phu: { title: 'Giữ kho giấy bùa', giver: 'tong_phu',
        story: 'Thiên Phù Các dựng kho giấy bùa tạm ven suối linh để viết bùa trấn cho cả vùng mùa thú dữ tới, nhưng rắn lục đuôi đỏ bò vào kho giấy khô ấm nằm cuộn trong xấp giấy. Cửa thử của phù tu: dẹp 3 con rắn độc trong kho mà tay không được hoảng - giẫm hỏng xấp giấy là bùa trấn cả vùng hỏng theo.',
        giverLines: ['Dẹp 3 con Rắn Lục Đuôi Đỏ trong kho giấy bùa ven suối linh cho các ta. Tay phải nhanh mà không được hoảng.'],
        turninLines: ['Kho sạch rồi, xấp giấy còn nguyên. Thiên Phù Các mở cửa với cháu.'] },
      q_tong_tran: { title: 'Dẫn khí qua cửu cung', giver: 'tong_tran',
        story: 'Cửu Cung Trận Tông của trận sư Âu Dương Kỳ thử người bằng trận đồ vô hình: dẫn linh khí trong người đi đúng một vòng chín ô cửu cung bằng thổ nạp. Tích đủ 50 tu vi, khí đi đúng vòng thì chín điểm trong người lần lượt ấm lên - đi loạn thì trận không sáng.',
        giverLines: ['Thổ nạp tích đủ 50 tu vi, để linh khí tự chạy theo chín ô của trận. Khí đi đúng vòng, cháu sẽ tự thấy chín điểm trong người ấm lên.'],
        turninLines: ['Chín điểm sáng lên đúng thứ tự, không sót một ô. Cửu Cung Trận Tông mở cửa với cháu.'] },
      q_tong_the: { title: 'Tay không đấu lợn rừng', giver: 'tong_the',
        story: 'Kim Cang Môn của Thạch Bất Động thử đệ tử đơn giản nhất hội: không mưu, không mẹo, không pháp bảo. Ra bãi hoang phía nam làng hạ 3 con Lợn Rừng bằng sức thân thể - đứng vững trước cú húc như búa tạ mà không lùi một bước, như ngày nhân vật chính giữ cổng Nam Môn.',
        giverLines: ['Ra bãi hoang hạ 3 con Lợn Rừng bằng sức thân thể. Đứng vững được trước nó mà không lùi - là qua cửa của môn ta.'],
        turninLines: ['Ba con lợn rừng, người không một vết thương nặng! Kim Cang Môn mở cửa với cháu!'] },
      q_tong_doc: { title: 'Chén thuốc thử độc', giver: 'tong_doc',
        story: 'Ngũ Độc Giáo lần đầu công khai xuất hiện ở một đại hội tuyển đệ tử, và cửa thử của Đường Tĩnh là một chén độc nhẹ do chính tay nàng pha: uống vào chỉ tê lưỡi chóng mặt, rồi tự ra bãi hoang hái đúng 4 cây thảo dược làm thuốc giải mang về. Người hoảng loạn sẽ hái nhầm cỏ dại - người bình tĩnh mới qua được.',
        giverLines: ['Uống chén thuốc thử của ta, rồi tự hái 4 cây Thảo Dược làm thuốc giải mang về. Người bình tĩnh mới phân biệt được thảo dược thật khi đầu đang quay.'],
        turninLines: ['Đúng thảo dược cả bốn cây, tay không run. Ngũ Độc Giáo mở cửa với ngươi.'] },
      q_tong_am: { title: 'Khúc đàn an hồn', giver: 'tong_am',
        story: 'Huyền Âm Cung của Tiêu Uyển Nhi thử người bằng tim chứ không bằng tai: mang thẻ ngọc âm khắc khúc an hồn về quán trọ trao tận tay Hoa nương - người đàn bà góa chồng vì thú dữ, mấy năm nay vẫn mở quán cho người đi đường. Đêm đó ở bãi tuyển sẽ có một khúc đàn đàn cho những người làng đã ngã xuống vì thú dữ.',
        giverLines: ['Mang thẻ ngọc âm này về quán trọ trao cho Hoa nương. Đêm nay ở bãi tuyển sẽ có một khúc đàn đàn cho những người đã ngã xuống.'],
        turninLines: ['Chị Hoa nương nhận thẻ rồi chứ? Huyền Âm Cung mở cửa với cháu.'] },
      q_chinh_18: { title: 'Lễ bái sư', giver: 'de_tu_phai',
        story: 'Cả mười tông môn đều đã mở cửa. Tại bãi tuyển đệ tử, Tạ Thanh Vân thay mặt Thanh Phong Phái chủ trì lễ chọn tông: người chơi tĩnh tâm, mở bảng Tông Môn và bái nhập một tông duy nhất để đi cho trọn con đường tu - nhận lệnh bài của tông đó từ tay đại diện. Các tông còn lại vẫn mở cửa tham quan, như một lời hẹn cho những duyên sau.',
        giverLines: ['Mười tông đều đã mở cửa với ngươi. Hôm nay ta chủ trì lễ chọn tông: mở bảng Tông Môn, và bái nhập tông mà ngươi muốn đi cùng tới cuối.'],
        turninLines: ['Lễ xong rồi. Dù ngươi bái nhập tông nào, Thanh Khê vẫn là nhà, và cái giếng cổ kia vẫn chờ người trấn giữ.'] }
    },
    CHAPTERS: [
      { id: 'chuong_1', title: 'Người làng Thanh Khê', quests: ['q_chinh_1'], npcs: ['truong_lang'],
        beats: ['Buổi sáng ở làng Thanh Khê, nhân vật chính ra mắt trưởng làng.', 'Trưởng làng dặn dò, nhắc chuyện giếng cổ phát sáng mấy đêm nay.'],
        climax: 'Trưởng làng nhờ nhân vật chính ra giếng xem điềm lạ.',
        reward: '20 Linh Thạch và sự tin cậy của làng.', hook: 'Vì sao giếng cổ lại phát sáng?' },
      { id: 'chuong_2', title: 'Điềm lạ giếng cổ', quests: ['q_chinh_2'], npcs: ['truong_lang'],
        beats: ['Nhân vật chính tới giếng cổ giữa trấn.', 'Giếng phát sáng, linh căn thức tỉnh, hiện rõ loại linh căn.'],
        climax: 'Trưởng làng kể bí mật phong ấn và Thanh Khê lão nhân: giếng không chọn người, giếng chỉ soi ra thứ vốn có.',
        reward: '+30 tu vi.', hook: 'Phong ấn yếu dần — thú dữ sẽ còn bạo hơn.' },
      { id: 'chuong_3', title: 'Hơi thở đầu tiên', quests: ['q_chinh_3'], npcs: ['truong_lang', 'dai_phu'],
        beats: ['Nhân vật chính học thổ nạp.', 'Đại phu dạy: thân thể là cái bình, tu vi là nước.'],
        climax: 'Vòng tuần hoàn linh khí đầu tiên thành công.',
        reward: '2 Thảo Dược.', hook: 'Thổ nạp được rồi — tiếp theo là phá quan.' },
      { id: 'chuong_4', title: 'Luyện Khí tầng 1', quests: ['q_chinh_4'], npcs: ['truong_lang', 'linh_gac'],
        beats: ['Nhân vật chính tĩnh tâm phá quan.', 'Cả làng ăn mừng; lính gác báo sói đã tới gần ruộng cuối làng.'],
        climax: 'Đột phá thành công, nhân vật chính thề bảo vệ làng.',
        reward: '50 Linh Thạch và 2 Thịt Gà.', hook: 'Mùa thú dữ sắp tới; mùa xuân có tin Thanh Phong Phái xuống núi tuyển đệ tử.' },
      { id: 'chuong_5', title: 'Mùa thú dữ', quests: ['q_chinh_5'], npcs: ['linh_gac', 'linh_gac2', 'truong_lang', 'hoc_tro'],
        beats: ['Chuông cổng rung giữa ban ngày: bầy thú tràn qua bãi hoang đánh thẳng vào Nam Môn - sự kiện Thú dữ tấn công làng Thanh Khê chạy ngay trong nhiệm vụ này.', 'Người chơi giữ chính giữa cổng cùng A Hổ (dưới cổng) và A Báo (trên cổng bắn xuống), đánh qua 3 đợt sói và lợn rừng.', 'Tiểu Hạnh từ thành phố trở về làng, kịp thời cứu chữa người bị thương sau trận đánh.'],
        climax: 'Hạ con sói đầu đàn thứ 5, bầy thú vỡ trận chạy về rừng - nhưng chúng chạy có hàng lối như có kẻ dẫn đầu.',
        reward: '80 Linh Thạch, +20 tu vi và 2 Thảo Dược.', hook: 'Sơn Quân đang gọi bầy trong rừng sâu. Phải tìm Hà lão thợ săn - người duy nhất biết đường tới sào huyệt của nó.' },
      { id: 'chuong_6', title: 'Vết chân trong rừng sâu', quests: ['q_chinh_6'], npcs: ['tho_san_ha', 'thuong_nhan_ma', 'giu_mieu'],
        beats: ['Người chơi qua cổng rừng ở cuối bãi hoang (mép nam map 1) vào map 2 Rừng Thanh Sơn, tìm lán trại của Hà Thiết Sơn.', 'Hà lão dạy đọc dấu Sơn Quân: chân to như cái mẹt, vệt nanh cày đất, cây đổ rạp quanh sào huyệt.', 'Hạ 4 con sói rừng dọc đường mòn, thu thập dấu vết; dọc đường gặp xe hàng của Mã Vạn Lai bị kẹt và Miếu Sơn Thần của Từ bà.'],
        climax: 'Dấu chân Sơn Quân còn ướt bùn ngay gần suối linh - nó vừa rời sào huyệt, đang bồn chồn vì linh khí rò từ giếng cổ.',
        reward: '70 Linh Thạch, +30 tu vi và 1 Thịt Lợn.', hook: 'Phong ấn giếng và Sơn Quân có dây mơ rễ má - Từ bà ở Miếu Sơn Thần biết rõ, và bà đang chờ.' },
      { id: 'chuong_7', title: 'Sơn Quân và phong ấn nứt', quests: ['q_chinh_7'], npcs: ['giu_mieu', 'tho_san_ha', 'truong_lang'],
        beats: ['Biến cố phong ấn: giữa trưa nước giếng phát sáng, lạnh buốt bất thường, cá suối dạt bờ - cả làng xì xào điềm lạ.', 'Từ bà kể rõ: Sơn Quân vốn là kẻ giữ núi, bị linh khí hỗn loạn từ vết nứt phong ấn làm phát cuồng; nó sẽ kéo bầy về phía giếng.', 'Người chơi theo đường mòn sâu vào sào huyệt ở cuối map 2, đối đầu trực tiếp boss Sơn Quân.'],
        climax: 'Hạ Sơn Quân, lấy Nanh Sơn Quân. Đêm đó Từ bà dùng nanh làm vật trấn trong lễ khấn - mặt giếng yên lại, nhưng vết nứt vẫn còn.',
        reward: '120 Linh Thạch và +50 tu vi; Sơn Quân rớt Nanh Sơn Quân (tỉ lệ 100%) và Thịt Sơn Quân.', hook: 'Phong ấn chỉ được vá tạm. Mùa xuân đã tới - cờ Thanh Phong Phái xuất hiện ở chân núi phía bắc.' },
      { id: 'chuong_8', title: 'Sơn môn mở', quests: ['q_chinh_8'], npcs: ['de_tu_phai', 'truong_lang', 'tieu_thuong'],
        beats: ['Qua cổng bắc của làng lên map 3 Chân Núi Thanh Phong: bãi tuyển đệ tử dựng cờ xanh, thanh niên các làng quanh vùng kéo về thử vận.', 'Sứ giả Tạ Thanh Vân tuyên bố ba cửa khảo hạch: linh căn, tu vi, tâm tính - và nói riêng với người chơi rằng cửa tâm đã qua nhờ những việc làm cho làng.', 'Người chơi thổ nạp, tĩnh tâm ngay tại bãi tuyển trước sự chứng kiến của dân làng đi tiễn.'],
        climax: 'Đột phá Luyện Khí tầng 2 thành công, nhận Lệnh Bài Thanh Phong từ tay Tạ Thanh Vân - chính thức là đệ tử nhập môn Thanh Phong Phái.',
        reward: '100 Linh Thạch, +30 tu vi và Lệnh Bài Thanh Phong.', hook: 'Kết mở: con đường lên Thanh Sơn và thế giới tu tiên lớn hơn bắt đầu - arc tiếp theo là hành trình nhập môn trên núi (chưa làm ở đợt này).' },
      { id: 'chuong_9', title: 'Mười tông tụ hội', quests: ['q_chinh_9', 'q_tong_phap', 'q_tong_khi', 'q_tong_dan'], npcs: ['de_tu_phai', 'truong_lang', 'tong_phap', 'tong_khi', 'tong_dan'],
        beats: ['Tin phong ấn giếng cổ nứt dần kinh động khắp vùng: chín tông môn quanh Thanh Sơn lần lượt kéo về bãi tuyển đệ tử, Sơn Môn Đại Hội mở ra - bề ngoài tuyển đệ tử, bề trong xem linh nhãn.', 'Người chơi về làng báo tin cho trưởng làng Trần Đức - chủ nhà của giếng - trước khi khách tới, rồi quay lại bãi tuyển bắt đầu vòng gặp gỡ các tông.', 'Ba tông tới đầu tiên lần lượt mở cửa thử người: Huyền Pháp Tông (dẹp khỉ mặt đỏ phá đài thử pháp), Thiên Công Phường (bờm sắt của Lợn Mông Sắt), Đan Hà Cốc (hái linh chi thử một mẻ đan).'],
        climax: 'Ba lá cờ đầu tiên ngoài cờ Thanh Phong dựng thẳng ở bãi tuyển - người tu sĩ trẻ của Thanh Khê được cả ba tông gật đầu.',
        reward: 'Mở khoá Huyền Pháp Tông, Thiên Công Phường và Đan Hà Cốc; thưởng từng nhiệm vụ như dữ liệu nhiệm vụ.', hook: 'Trong rừng phía nam, thêm những lá cờ lạ nữa đang tiến về bãi tuyển - trong đó có một lá cờ mà giang hồ thường chỉ dám thì thầm tên.' },
      { id: 'chuong_10', title: 'Bùa, trận và tiếng thú rừng', quests: ['q_tong_thu', 'q_tong_phu', 'q_tong_tran'], npcs: ['tong_thu', 'tho_san_ha', 'tong_phu', 'tong_tran'],
        beats: ['Vạn Thú Môn tới bằng một đàn thú đi theo sau đại diện Giang Tiểu Thú; cửa thử của họ là để thú rừng tự đánh giá người - theo Hà Thiết Sơn vào gần bầy thú một buổi.', 'Thiên Phù Các dựng kho giấy bùa ven suối linh chuẩn bị viết bùa trấn cho cả vùng, rắn lục bò vào kho - người chơi dẹp rắn mà không giẫm hỏng một xấp giấy nào.', 'Cửu Cung Trận Tông bày trận đồ vô hình ngay trong người thử: dẫn khí qua đủ chín ô cửu cung bằng thổ nạp (50 tu vi), Âu Dương Kỳ đếm từng điểm sáng.'],
        climax: 'Ba tông nữa mở cửa. Bãi tuyển đông như hội làng, và tin về người đệ tử được sáu tông gật đầu bắt đầu lan khắp các làng quanh núi.',
        reward: 'Mở khoá Vạn Thú Môn, Thiên Phù Các và Cửu Cung Trận Tông.', hook: 'Ngày mai, ba tông cuối cùng sẽ tới - trong đó có Ngũ Độc Giáo, cái tên làm cả bãi tuyển xì xào.' },
      { id: 'chuong_11', title: 'Thân, độc và khúc đàn', quests: ['q_tong_the', 'q_tong_doc', 'q_tong_am'], npcs: ['tong_the', 'tong_doc', 'tong_am', 'chu_quan'],
        beats: ['Kim Cang Môn thử thân: tay không hạ 3 con Lợn Rừng ở bãi hoang, đứng không lùi một bước - Thạch Bất Động cười vang cả bãi khi nghe tin người chơi không một vết thương nặng.', 'Ngũ Độc Giáo công khai xuất hiện; Đường Tĩnh thử người bằng một chén độc nhẹ và bài toán bình tĩnh: tự hái đúng 4 cây thảo dược giải độc khi đầu đang quay.', 'Huyền Âm Cung thử bằng tim: mang thẻ ngọc âm về quán trọ cho Hoa nương. Đêm đó ở bãi tuyển, Tiêu Uyển Nhi đàn một khúc an hồn cho những người làng đã ngã xuống vì thú dữ - cả bãi lặng đi.'],
        climax: 'Khúc an hồn dứt, tông thứ mười mở cửa. Mười lá cờ đứng thành một vòng quanh bãi tuyển - lần đầu tiên sau Đại Kiếp, Thanh Sơn có đủ mười tông tụ hội.',
        reward: 'Mở khoá Kim Cang Môn, Ngũ Độc Giáo và Huyền Âm Cung - đủ 10/10 tông môn.', hook: 'Mười cửa đã mở, nhưng đường tu chỉ đi được một đường cho trọn. Lễ chọn tông đang chờ ở chương cuối.' },
      { id: 'chuong_12', title: 'Chọn đường', quests: ['q_chinh_18'], npcs: ['de_tu_phai'],
        beats: ['Tạ Thanh Vân thay mặt Thanh Phong Phái - tông chủ nhà - chủ trì lễ chọn tông ngay tại bãi tuyển, trước mặt đại diện cả mười tông.', 'Người chơi tĩnh tâm nhớ lại từng cửa thử đã qua: kiếm, pháp, khí, đan, thú, bùa, trận, thân, độc và tiếng đàn - mỗi tông là một cách trả lời cho câu hỏi "tu tiên để làm gì".'],
        climax: 'Người chơi mở bảng Tông Môn, bái nhập một tông duy nhất và nhận lệnh bài của tông đó. Các tông còn lại không giận mà chúc phúc - vì ai cũng hiểu: người này tu tông nào cũng sẽ quay về giữ cái giếng ở làng Thanh Khê.',
        reward: '150 Linh Thạch, +40 tu vi và lệnh bài của tông môn đã chọn (lưu vào save).', hook: 'Hành trình nhập môn trên núi bắt đầu từ đây - arc tiếp theo: lên sơn môn của tông đã chọn (chưa làm ở đợt này).' },
      { id: 'chuong_13', title: "Nhập môn", quests: ["q_chinh_19"], npcs: ["de_tu_phai", "truong_lang"],
        beats: ["Lễ bái sư xong, tên người chơi vào sổ đệ tử của tông đã chọn; Tạ Thanh Vân dặn về làng Thanh Khê báo tin cho trưởng làng Trần Đức trước khi nhận việc tông.", "Mỗi tông giao việc đầu tiên đúng nghề của mình: Thanh Phong tuần sơn, Đan Hà hái linh chi, Thiên Công lấy bờm sắt, Vạn Thú ra mắt bầy thú cùng Hà Thiết Sơn, Huyền Âm mang đàn về quán trọ..."],
        climax: "Người chơi quay lại bãi tuyển trong thân phận đệ tử chính thức — từ chương này, mỗi chương đều có một việc riêng của tông mình song song với trục chung.",
        reward: "Trục: 100 Linh Thạch, +30 tu vi. Biến thể: 80–100 Linh Thạch + tu vi/vật phẩm đầu tay theo tông.", hook: "Việc tông môn thường lệ bắt đầu — và đường mòn Thanh Sơn sắp không yên trở lại.", variants: 'q_mon_{sect}_1' },
      { id: 'chuong_14', title: "Tuần sơn", quests: ["q_chinh_20"], npcs: ["tho_san_ha"],
        beats: ["Sói rừng kéo bầy chặn đường mòn lần hai, bạo hơn trước như có linh khí lạ xúi giục — Hà Thiết Sơn nhờ đệ tử tông môn ra tay giữ đường.", "Song song, tông giao việc ở Thập Vạn Đại Sơn: tuần tra cửa sơn, lấy quả tụ linh, hái huyết sâm, xem thế trận ở miếu... đệ tử mới bắt đầu làm việc ở đất lạ."],
        climax: "Đường mòn và cửa sơn yên trở lại; Yêu Đan Cấp 1 đầu tiên của arc rơi vào tay người chơi từ sói đầu đàn.",
        reward: "Trục: 120 Linh Thạch, +40 tu vi, Yêu Đan Cấp 1 ×1. Biến thể: 110–140 Linh Thạch + tu vi; Vạn Thú thêm Yêu Đan Cấp 1 ×1.", hook: "Lý lão bắt mạch và lắc đầu: khí còn nổi — phải phá thêm một quan nữa.", variants: 'q_mon_{sect}_2' },
      { id: 'chuong_15', title: "Tôi luyện phá quan", quests: ["q_chinh_21"], npcs: ["dai_phu"],
        beats: ["Mỗi tông tôi luyện đệ tử theo đúng nghề trước ngày phá quan: Thanh Phong kiếm thí ở bãi luyện công, Huyền Pháp bế quan dẫn pháp, Thiên Công thử giáp bờm sắt, Đan Hà tự luyện mẻ Đại Bồi Nguyên Đan đầu tay, Kim Cang đấu lợn sắt luyện thể...", "Lý lão đặt mốc cứng: tự đột phá thành công một lần bằng chính tu vi của mình."],
        climax: "Người chơi phá thêm một quan, đứng vững ở hậu kỳ Luyện Khí — đủ tư cách nghe bí mật về vương thú kết đan.",
        reward: "Trục: Ngưng Khí Đan ×1, 100 Linh Thạch, +20 tu vi. Biến thể: 120–150 Linh Thạch + tu vi; Thiên Công/Kim Cang thêm Yêu Đan Cấp 1 ×1.", hook: "Hà Thiết Sơn gọi người chơi vào lán trại, nói điều ông giữ kín mười năm.", variants: 'q_mon_{sect}_3' },
      { id: 'chuong_16', title: "Săn vương thú", quests: ["q_chinh_22"], npcs: ["tho_san_ha"],
        beats: ["Bí mật mở ra: vương thú trấn núi sống trăm năm kết Yêu Đan Cấp 3 — lõi của Trúc Cơ Đan. Hai con đường: Sơn Quân hồi sinh ở sào huyệt cũ trong Rừng Thanh Sơn, hoặc Gầm Sơn Hổ Vương ở Hang Hổ Gầm trong Thập Vạn Đại Sơn.", "Cả tông góp sức cho đoàn săn theo nghề của mình: dọn tai mắt của vương, bày trận dụ vương, luyện đan cứu mạng cho đoàn, rèn giáp săn vương, tẩm độc săn vương, đàn tiễn đoàn... và mọi tông đều chia cho đệ tử một viên Yêu Đan Cấp 2 làm cổ phần săn."],
        climax: "Vương thú gục xuống. Yêu Đan Cấp 3 — thứ cả vùng mấy chục năm mới thấy một viên — nằm trong tay người chơi (thưởng cốt truyện chắc chắn của nhiệm vụ trục).",
        reward: "Trục: Yêu Đan Cấp 3 ×1 (chắc chắn), 200 Linh Thạch, +60 tu vi. Mọi biến thể: Yêu Đan Cấp 2 ×1 + 150–170 Linh Thạch + tu vi.", hook: "Tin lan về làng: Lý lão cho học trò gọi người chơi lên hiệu thuốc gấp.", variants: 'q_mon_{sect}_4' },
      { id: 'chuong_17', title: "Lửa lò Trúc Cơ", quests: ["q_chinh_23"], npcs: ["hoc_tro", "dai_phu"],
        beats: ["Lý lão truyền phương Trúc Cơ Đan (khớp hệ đan dược: truyền khi đạt tầng 9) và gửi kèm Thanh Linh Tủy + Ngọc Tủy Chi trong kho — hai vị khó của phương.", "Cả tông cùng góp nguyên liệu cho mẻ đan của đệ tử: giữ đường vận dược, lấy tụ linh quả, góp ngọc tủy, bày trận tụ linh quanh lò, cắm phù hộ lò giữ lửa, gánh dược qua núi... Linh Chi còn thiếu được các tông không hái dược bù bằng thưởng Linh Chi ×2."],
        climax: "Nguyên liệu của mẻ Trúc Cơ Đan gom đủ từng phần theo đúng công thức hiện hành — chỉ còn chờ người chơi tự tay mở lò luyện.",
        reward: "Trục: Thanh Linh Tủy ×1, Ngọc Tủy Chi ×1, 120 Linh Thạch, +30 tu vi. Biến thể: 140–160 Linh Thạch + tu vi + Linh Chi cho các tông không thu thập.", hook: "Giữa trưa một ngày yên trời, giếng cổ Thanh Khê lại phát sáng — lần này khác hẳn.", variants: 'q_mon_{sect}_5' },
      { id: 'chuong_18', title: "Giếng sáng và ngưỡng trời", quests: ["q_chinh_24", "q_chinh_25"], npcs: ["giu_mieu", "truong_lang", "de_tu_phai"],
        beats: ["Mặt nước giếng nứt một vệt sáng thẳng đứng như vết rách trên trời phản chiếu xuống đáy — mầm của vết nứt hư không, biến cố sẽ khuấy đảo vùng núi ở những arc sau. Từ bà cho gọi người chơi về báo gấp cho trưởng làng, làng cho người canh giếng cả đêm.", "Mỗi tông làm phần việc của mình trước ngày đệ tử độ kiếp: rèn lại giáp, luyện Sinh Cơ Đan cứu mạng, xin bùa trấn tâm, chốt trận giữ làng, đàn khúc tĩnh tâm...", "Tạ Thanh Vân kết lại chặng đường: nhận bài khấn trấn tâm ở Miếu Sơn Thần, mang theo Đại Hồi Xuân Đan của tông môn — và đứng ở ngưỡng cửa thiên lôi. Việc đột phá và lôi kiếp thuộc hệ cảnh giới; truyện dừng đúng ở ngưỡng đó."],
        climax: "Mọi điều kiện truyện đã đủ: tu vi, đan, khấn, lòng. Trời sắp hỏi người tu bằng sấm sét.",
        reward: "Trục: 80 + 150 Linh Thạch, Đại Hồi Xuân Đan ×1, +90 tu vi. Biến thể: 150–170 Linh Thạch + Hồi Xuân Đan/đan cứu mạng theo tông.", hook: "Chương 19 mở ra ở Đài Vọng Vân — nơi thiên lôi chờ sẵn.", variants: 'q_mon_{sect}_6' },
      { id: 'chuong_19', title: "Đạo cơ mới thành", quests: ["q_chinh_26"], npcs: ["de_tu_phai"],
        beats: ["Người chơi mở lò tu hành, dẫn động lôi kiếp Trúc Cơ theo hệ cảnh giới: ba đạo thiên lôi, vòng đỏ báo hiệu, đan và pháp bảo giảm sát thương — sống sót là thành, chết giữa kiếp là mất tu vi và tiêu hao Trúc Cơ Đan.", "Sau kiếp, mỗi tông giao việc Trúc Cơ đầu tiên đúng tầm vóc mới: ngự kiếm tuần sơn đấu vương thú, bày đại trận cửu cung, luyện mẻ Phá Cảnh Đan đầu tay, đàn một khúc trên mây cho cả vùng nghe..."],
        climax: "Đạo cơ kết thành. Từ một phàm nhân làng Thanh Khê, người chơi bước hẳn sang hàng tu sĩ Trúc Cơ — và cổng Sơn Trung Vân Hải sau Chi Đỉnh mở ra (cùng cổng ngự kiếm của chuỗi tông riêng).",
        reward: "Trục: 200 Linh Thạch, +80 tu vi. Biến thể: 200–220 Linh Thạch + 80–100 tu vi; Thiên Công thêm Yêu Đan Cấp 2 ×1.", hook: "Tạ Thanh Vân chỉ tay về phía biển mây sau Chi Đỉnh: đường tới Kim Đan bắt đầu từ đó.", variants: 'q_mon_{sect}_7' },
      { id: 'chuong_20', title: "Đường tới Kim Đan", quests: ["q_chinh_27"], npcs: ["de_tu_phai"],
        beats: ["Việc đầu tiên ở cảnh giới Trúc Cơ là thổ nạp 300 tu vi cho đạo cơ đặc lại — nền cho mọi chặng đường xa.", "Mỗi tông mở đường Kim Đan theo nghề của mình: thám đường Vân Hải, ngưng pháp ở biển mây, tìm vật liệu cho khí Kim Đan, tính phương đan Kim Đan từ bây giờ, đo thế trận cả dãy Vân Hải... Mọi biến thể đều gửi người chơi một hạt giống Long Tiên Thảo — vị chính của cổng Kim Đan (Yêu Đan Cấp 3 ×2 + Long Tiên Thảo ×2 theo hệ cảnh giới)."],
        climax: "Arc khép lại ở thế mở: người chơi đã có hạt giống của chặng Kim Đan, có tông môn đứng sau, và có một vùng trời mới để đi.",
        reward: "Trục: Long Tiên Thảo ×1, 220 Linh Thạch. Biến thể: Long Tiên Thảo ×1 + 220–240 Linh Thạch + 100–120 tu vi.", hook: "Thiên tiếp theo (Trúc Cơ Lập Nghiệp trong lộ trình dài hạn): vết nứt hư không ở giếng cổ sẽ mở thật — và người giữ nó lại là người đã trấn phong ấn hai lần.", variants: 'q_mon_{sect}_8' },
      { id: 'chuong_21', title: 'Trời rách trên Thanh Khê', quests: ['q_vet_nut_1'], npcs: ['sect_rep', 'giu_mieu'],
        beats: ['Phong ấn giếng cổ nứt hẳn sau chương 18: Vết Nứt Hư Không bắt đầu xé mở trên các map thường theo chu kỳ 3 giờ, mỗi lần 30 phút, mỗi lần một nơi.', 'Mười tông chấn động và họp kín: trận pháp trấn không nổi, phù văn giữ không xong — tông môn bất lực, chỉ còn cách cử lớp đệ tử Trúc Cơ đầu tiên vào thám thính.', 'Người chơi tới Miếu Sơn Thần: Từ bà mở tàn niệm của Thanh Khê lão nhân — phong ấn là khóa vay mượn thời gian, thứ bị nhốt không chết, chỉ chờ, và trong hư không có thứ cõi này không tự sinh được nữa.'],
        climax: 'Tàn niệm khép lại bằng một câu: "Vào nứt thì đi như đi trên miệng vực." Người chơi nhận lệnh thám thính đầu tiên.',
        reward: '150 Linh Thạch, +60 tu vi.', hook: 'Vết nứt đầu tiên đang chờ người bước vào — và thứ canh giữ nó mạnh hơn người vào một bậc.' },
      { id: 'chuong_22', title: 'Bước vào hư không', quests: ['q_vet_nut_2'], npcs: ['sect_rep'],
        beats: ['Người chơi canh chu kỳ vết nứt, bước qua khe nứt vào một cảnh ngẫu nhiên trong kho hư không (11 cảnh riftPool + 4 cảnh định kỳ).', 'Luật hư không áp ngay từ bước đầu: quái co theo cảnh giới người vào rồi đè thêm một bậc; đan hồi HP dưới Địa phẩm cháy thành tro; chết là bị hất văng ra và mất lượt cả chu kỳ.', 'Hạ yêu thú canh giữ khe nứt trong cảnh — trận đánh cược mạng đầu tiên của chặng Trúc Cơ.'],
        climax: 'Kẻ canh giữ gục xuống, ấn hư không trên trán nó vỡ ra thành tro tím. Người chơi trở ra với yêu đan — và với hiểu biết rằng hư không không hề thương ai.',
        reward: '200 Linh Thạch, +80 tu vi, Yêu Đan Cấp 1 ×1.', hook: 'Trong cảnh còn một thứ nữa chưa lộ mặt: kẻ bị linh khí hư không kinh động.' },
      { id: 'chuong_23', title: 'Kẻ canh giữ thứ hai', quests: ['q_vet_nut_3'], npcs: ['sect_rep'],
        beats: ['Đại diện tông giải thích kỳ ngộ trong cảnh: yêu thú bị linh khí hư không kinh động hiện thân bất chợt ngay cạnh người vào nứt — thứ mạnh nhất của cả cảnh.', 'Lần vào này, kỳ ngộ chắc chắn tìm tới khi người chơi ra tay trong cảnh (nhiệm vụ đang dở thì nó tự tìm tới ở lần động thủ đầu tiên).', 'Trận đấu không có đường lui: trong hư không, chạy cũng chết như đứng yên.'],
        climax: 'Kẻ canh giữ thứ hai gục xuống; yêu đan của nó ngưng từ linh khí nát vụn — hàng thật mà cõi này không luyện ra được.',
        reward: '250 Linh Thạch, +100 tu vi, Yêu Đan Cấp 2 ×1.', hook: 'Các tông cần một thứ để đo tốc độ vết nứt đang rộng ra: một mảnh trời rơi.' },
      { id: 'chuong_24', title: 'Mảnh trời trong tay', quests: ['q_vet_nut_4'], npcs: ['sect_rep', 'giu_mieu'],
        beats: ['Việc cuối của đợt thám thính đầu tiên: mang về một thiên tài địa bảo — mảnh trời rơi phát sáng vàng mọc ngẫu nhiên trong cảnh.', 'Từ bà khấn trấn giúp: lượt này mảnh trời chắc chắn hiện ra. Nhưng hái được là phải ra ngay — tham thêm một khắc là thêm một phần chết.', 'Mảnh trời được giao cho các tông đo đạc: kết quả không vui — vết nứt đang rộng ra theo từng chu kỳ.'],
        climax: 'Arc thám thính đầu tiên khép lại, nhưng sự kiện thì không: vết nứt tiếp tục mở theo chu kỳ cho mọi tu sĩ Trúc Cơ trở lên, và nó co theo cảnh giới người vào — Kim Đan vào gặp sức ép Kim Đan.',
        reward: '300 Linh Thạch, +120 tu vi.', hook: 'Thiên 4 còn dài: tranh linh mạch, đối thủ đồng lứa của tông đối trọng, và ấn cổ thời trước Đại Kiếp nằm dưới điểm mạch.' }
    ],
    EVENTS: [
      { id: 'su_kien_vet_nut', name: 'Vết Nứt Hư Không', quest: 'q_vet_nut_1..4 (arc sự kiện)', giver: 'sect_rep',
        trigger: 'Sự kiện lặp vĩnh viễn sau Trúc Cơ: mỗi chu kỳ 3 giờ, 1 vết nứt xé mở ngẫu nhiên trên 1 trong 4 map thường trong 30 phút (gieo hạt tất định theo chu kỳ — js/rift-events.js). Vào nứt bốc ngẫu nhiên 1 cảnh riftPool qua pickRiftRealm của secret-realms.js.',
        spawnGate: 'Neo vết nứt: sân giếng cổ map 1 (26,10) / bờ suối linh map 2 (20,20) / bãi tuyển đệ tử map 3 (30,16) / Ngoại Vi Đại Sơn map 4 (20,42). Đứng cạnh bấm E mở panel sự kiện.',
        waves: [
          'Luật khó: quái scale theo tầng + realmRank rồi nhân thêm HP ×1,45 / công ×1,20; boss kỳ ngộ thêm ×1,15/×1,10 (mạnh nhất cảnh).',
          'Đan hồi HP dưới Địa phẩm bị chặn trong cảnh (chỉ Địa/Thiên phẩm dùng được). Chết = đẩy ra + khóa lượt cả chu kỳ; tối đa 2 lượt/chu kỳ.',
          'Thưởng theo bảng của cảnh được bốc (secret-realms) + kỳ ngộ: Yêu Đan Cấp 3 chỉ tới được ở mức realmRank ≥ 2 qua kỳ ngộ 20% và Bãi Săn Tinh Anh 12%.'
        ],
        reward: 'Theo bảng rơi của từng cảnh (không phát Linh Thạch ngoài thang economy); arc 4 nhiệm vụ tổng 900 Linh Thạch + Yêu Đan Cấp 1 ×1 + Cấp 2 ×1.' },
      { id: 'su_kien_thu_du', name: 'Thú dữ tấn công làng Thanh Khê', quest: 'q_chinh_5', giver: 'linh_gac',
        trigger: 'Nhận q_chinh_5 từ A Hổ (linh_gac) sau khi đã trả q_chinh_4. Không cần cơ chế mới: bật cờ sự kiện, spawn quái theo đợt ở ngoại ô nam map 1.',
        spawnGate: 'Quái spawn ở bãi hoang phía nam (y 24-29, quanh đường dọc x 19-20) rồi đi lên phía Nam Môn (19,14) như quái lang thang/thường lệ.',
        waves: [
          'Đợt 1: 3 Sói Con (soi_con).',
          'Đợt 2 (khi đợt 1 chết hết): 2 Sói Con (soi_con) + 2 Lợn Rừng (lon_rung).',
          'Đợt 3 (khi đợt 2 chết hết): 3 Sói Rừng (soi_rung) + 1 Lợn Mông Sắt (lon_mong_sat). Đợt sau chỉ spawn khi đợt trước chết hết - đếm bằng sự kiện kill qua recordEvent như nhiệm vụ thường.'
        ],
        win: 'Đánh đuổi đủ 5 Sói Con (mục tiêu của q_chinh_5, tính qua kill soi_con) và dọn sạch các đợt - trả nhiệm vụ cho linh_gac là kết thúc sự kiện.',
        lose: 'Người chơi bị hạ (HP về 0): hồi sinh như thường lệ, sự kiện đặt lại từ đợt 1, nói chuyện lại với linh_gac để đánh tiếp. Không có thua vĩnh viễn, không mất vật phẩm.',
        reward: 'Thưởng nằm trong thưởng q_chinh_5 (80 Linh Thạch, +20 tu vi, 2 Thảo Dược) - không cần hệ thống thưởng riêng.',
        dialogue: 'Mở đầu: DIALOGUE.linh_gac.quest.q_chinh_5. Kết thúc: DIALOGUE.linh_gac.turnin.q_chinh_5. A Báo, dân làng chỉ đứng ở vị trí trang trí như NPC thường, không cần AI chiến đấu mới.' }
    ],
    NEW_MAPS: [
      { id: 'map_2', name: 'Rừng Thanh Sơn', size: '40x30',
        fromMap1: 'Cổng Rừng ở mép nam map 1 (x 19-20, y 29, cuối bãi hoang) -> vào map 2 ở mép bắc (x 19-20, y 0). Hai chiều, đi qua không màn hình chờ như Nam Môn.',
        terrain: 'Đường mòn đất uốn lượn từ bắc xuống nam qua rừng thông và trúc rậm; suối linh chảy ở phía đông với bãi linh chi; lán trại thợ săn ở phía tây; Miếu Sơn Thần nhỏ ở đông bắc; cuối phía nam là bãi đất trống cây đổ rạp - sào huyệt Sơn Quân.',
        npcs: ['tho_san_ha (lán trại phía tây, gợi ý 8,8)', 'giu_mieu (Miếu Sơn Thần đông bắc, gợi ý 32,6)', 'thuong_nhan_ma (cạnh xe hàng kẹt giữa đường mòn, gợi ý 20,14)'],
        monsters: ['soi_rung (đường mòn giữa map)', 'lon_mong_sat (bìa rừng)', 'ran_luc (bụi rậm ven suối)', 'khi_mat_do (tán cây phía đông)', 'son_quan (boss, chỉ ở bãi sào huyệt cuối phía nam, spawn khi đang làm q_chinh_7)'] },
      { id: 'map_3', name: 'Chân Núi Thanh Phong', size: '40x30',
        fromMap1: 'Cổng Bắc ở mép bắc map 1 (x 19-20, y 0, phía sau trấn) -> vào map 3 ở mép nam (x 19-20, y 29). Hai chiều.',
        terrain: 'Đường đá bậc thang leo dần lên phía bắc giữa rừng thông cao; quảng trường lát đá ở giữa map là bãi tuyển đệ tử với cờ phướn xanh Thanh Phong Phái, lư hương và đài thử linh căn; cuối phía bắc là sơn môn đá hai tầng mái (chỉ làm cảnh, chưa qua được - đường lên núi thuộc arc sau).',
        npcs: ['de_tu_phai (giữa bãi tuyển, gợi ý 19,12)'],
        monsters: ['khi_mat_do (ven đường đá, ít)', 'soi_rung (bìa rừng hai bên đường, thưa - đường lên núi không yên tĩnh hẳn)'] }
    ],
    NEW_MONSTERS: [
      { id: 'soi_rung', name: 'Sói Rừng', move: 'chạy', desc: 'Lớn và dữ hơn Sói Con ở bãi hoang, lông xám sẫm vệt đen dọc sống lưng, mắt vàng. Tai mắt của Sơn Quân, sống theo bầy dọc đường mòn Rừng Thanh Sơn.' },
      { id: 'lon_mong_sat', name: 'Lợn Mông Sắt', move: 'chạy', desc: 'Lợn rừng già lông bờm cứng như thép ở nửa thân sau, húc thẳng từng đợt ngắn. Đàn em thân cận của Sơn Quân.' },
      { id: 'ran_luc', name: 'Rắn Lục Đuôi Đỏ', move: 'trườn', desc: 'Rắn lục nhỏ núp trong bụi rậm ven suối linh, thân xanh lục, chót đuôi đỏ, trườn sát đất rất khó nhìn.' },
      { id: 'khi_mat_do', name: 'Khỉ Mặt Đỏ', move: 'nhảy', desc: 'Khỉ núi mặt đỏ, tay dài, di chuyển bằng những cú nhảy chuyền cành và nhảy bổ vào người, sống ở tán cây phía đông rừng và ven đường lên núi.' },
      { id: 'son_quan', name: 'Sơn Quân', move: 'chạy', desc: 'BOSS. Lợn vương gần trăm năm sống cạnh linh mạch: thân to như trâu mộng, lông đen ánh xanh linh khí, hai nanh trắng cong như liềm (nanh trái sứt một miếng), vết sẹo cũ trên vai phải. Đòn đặc trưng: dậm đất lấy đà rồi húc thẳng (chạy). Rớt 100%: Nanh Sơn Quân; kèm Thịt Sơn Quân.' }
    ],
    NEW_ITEMS: [
      { id: 'linh_chi', name: 'Linh Chi', desc: 'Nấm linh chi mọc gần suối linh trong Rừng Thanh Sơn, tai nấm ánh xanh. Vật phẩm nhiệm vụ (q_phu_thuoc_rung) và nguyên liệu thuốc mạnh.' },
      { id: 'nanh_son_quan', name: 'Nanh Sơn Quân', desc: 'Nanh của lợn vương Sơn Quân, hút linh khí trăm năm. Vật phẩm cốt truyện: dùng làm vật trấn trong lễ khấn trấn phong ấn giếng cổ.' },
      { id: 'thit_son_quan', name: 'Thịt Sơn Quân', desc: 'Thịt lợn vương chắc và bổ. Hồi nhiều HP (đề xuất heal 60) - phần thưởng sau khi hạ boss.' },
      { id: 'lenh_bai_thanh_phong', name: 'Lệnh Bài Thanh Phong', desc: 'Lệnh bài gỗ xanh khắc mây gió của Thanh Phong Phái. Vật phẩm cốt truyện chứng nhận đệ tử nhập môn (thưởng q_chinh_8), không dùng được, không bán.' }
    ],
    NEW_QUESTS: [
      { id: 'q_chinh_5', main: true, title: 'Giữ cổng Nam Môn', giver: 'linh_gac', requires: 'q_chinh_4', desc: 'Giữ cổng Nam Môn trong sự kiện thú dữ tấn công làng: đánh đuổi 5 con sói đầu đàn.', objectives: [{ type: 'kill', target: 'soi_con', need: 5 }], rewards: { linhThach: 50, tuVi: 20, items: [{ id: 'thao_duoc', n: 2 }] } },
      { id: 'q_chinh_6', main: true, title: 'Truy vết Sơn Quân', giver: 'tho_san_ha', requires: 'q_chinh_5', desc: 'Vào Rừng Thanh Sơn, hạ 4 Sói Rừng dọc đường mòn để truy vết Sơn Quân.', objectives: [{ type: 'kill', target: 'soi_rung', need: 4 }], rewards: { linhThach: 50, tuVi: 30, items: [{ id: 'thit_lon', n: 1 }] } },
      { id: 'q_chinh_7', main: true, title: 'Đối đầu Sơn Quân', giver: 'giu_mieu', requires: 'q_chinh_6', desc: 'Phong ấn giếng cổ nứt thêm. Vào sâu Rừng Thanh Sơn đối đầu và hạ Sơn Quân, mang nanh về Miếu Sơn Thần.', objectives: [{ type: 'kill', target: 'son_quan', need: 1 }], rewards: { linhThach: 80, tuVi: 50, items: [] } },
      { id: 'q_chinh_8', main: true, title: 'Sơn môn mở', giver: 'de_tu_phai', requires: 'q_chinh_7', desc: 'Tới bãi tuyển đệ tử của Thanh Phong Phái ở Chân Núi Thanh Phong, đột phá lên Luyện Khí tầng 2 để qua khảo hạch tu vi.', objectives: [{ type: 'breakthrough', need: 1 }], rewards: { linhThach: 70, tuVi: 30, items: [{ id: 'lenh_bai_thanh_phong', n: 1 }] } },
      { id: 'q_phu_thuoc_rung', main: false, title: 'Linh chi cho người bị thương', giver: 'hoc_tro', desc: 'Hái 3 tai Linh Chi gần suối linh trong Rừng Thanh Sơn cho Tiểu Hạnh giã thuốc cứu người bị thương.', objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }], rewards: { linhThach: 35, tuVi: 10, items: [{ id: 'thao_duoc', n: 2 }] } },
      { id: 'q_phu_mo_duong', main: false, title: 'Mở lại đường buôn', giver: 'thuong_nhan_ma', desc: 'Dẹp 3 con Sói Rừng quanh khúc đường mòn trong rừng để xe hàng của thương đội qua được.', objectives: [{ type: 'kill', target: 'soi_rung', need: 3 }], rewards: { linhThach: 60, tuVi: 0, items: [{ id: 'thit_lon', n: 1 }] } },
      { id: 'q_phu_bao_tin', main: false, title: 'Báo tin phong ấn', giver: 'giu_mieu', requires: 'q_chinh_7', desc: 'Về làng báo cho trưởng làng Trần Đức biết phong ấn giếng cổ chỉ được vá tạm, vết nứt vẫn còn.', objectives: [{ type: 'talk', target: 'truong_lang', need: 1 }], rewards: { linhThach: 20, tuVi: 20, items: [] } }
    ],
    // Arc chương 9-12 (Sơn Môn Đại Hội): đặc tả máy-đọc-được của 11 nhiệm vụ
    // mở khoá 10 tông môn - phải khớp nguyên trạng QUESTS trong logic.js
    // (kiểm chứng ở test mục 19). Dữ liệu tông môn đầy đủ nằm ở js/sects.js.
    SECT_QUESTS: [
      { id: 'q_chinh_9', main: true, title: 'Mười tông tụ hội', giver: 'de_tu_phai', requires: 'q_chinh_8', desc: 'Chuyện phong ấn giếng cổ nứt dần đã kinh động các tông môn quanh Thanh Sơn. Về làng báo cho trưởng làng Trần Đức biết mười tông sắp tụ về bãi tuyển đệ tử, rồi quay lại gặp Tạ Thanh Vân.', objectives: [{ type: 'talk', target: 'truong_lang', need: 1 }], rewards: { linhThach: 40, tuVi: 20, items: [] } },
      { id: 'q_tong_phap', main: false, title: 'Ngũ hành thí pháp', giver: 'tong_phap', requires: 'q_chinh_9', desc: 'Dẹp 4 con Khỉ Mặt Đỏ đang phá đài thử pháp của Huyền Pháp Tông ở ven đường núi và rừng phía đông.', objectives: [{ type: 'kill', target: 'khi_mat_do', need: 4 }], rewards: { linhThach: 60, tuVi: 25, items: [] } },
      { id: 'q_tong_khi', main: false, title: 'Bờm sắt thử tay', giver: 'tong_khi', requires: 'q_tong_phap', desc: 'Hạ 2 con Lợn Mông Sắt trong Rừng Thanh Sơn, mang bờm sắt về cho phường chủ Thiên Công xem tay nghề tìm vật liệu.', objectives: [{ type: 'kill', target: 'lon_mong_sat', need: 2 }], rewards: { linhThach: 70, tuVi: 25, items: [{ id: 'thit_lon', n: 1 }] } },
      { id: 'q_tong_dan', main: false, title: 'Linh chi thử đan', giver: 'tong_dan', requires: 'q_tong_khi', desc: 'Hái 3 tai Linh Chi còn đẫm sương gần suối linh trong Rừng Thanh Sơn cho Đan Hà Cốc thử một mẻ đan.', objectives: [{ type: 'collect', target: 'linh_chi', need: 3 }], rewards: { linhThach: 60, tuVi: 20, items: [{ id: 'thao_duoc', n: 2 }] } },
      { id: 'q_tong_thu', main: false, title: 'Người được thú nhận', giver: 'tong_thu', requires: 'q_tong_dan', desc: 'Tới lán trại trong Rừng Thanh Sơn gặp thợ săn Hà Thiết Sơn, theo ông vào gần bầy thú để Vạn Thú Môn xem ngươi có được thú rừng chấp nhận không.', objectives: [{ type: 'talk', target: 'tho_san_ha', need: 1 }], rewards: { linhThach: 55, tuVi: 25, items: [] } },
      { id: 'q_tong_phu', main: false, title: 'Giữ kho giấy bùa', giver: 'tong_phu', requires: 'q_tong_thu', desc: 'Dẹp 3 con Rắn Lục Đuôi Đỏ bò vào kho giấy bùa Thiên Phù Các dựng tạm ven suối linh trong Rừng Thanh Sơn.', objectives: [{ type: 'kill', target: 'ran_luc', need: 3 }], rewards: { linhThach: 65, tuVi: 25, items: [] } },
      { id: 'q_tong_tran', main: false, title: 'Dẫn khí qua cửu cung', giver: 'tong_tran', requires: 'q_tong_phu', desc: 'Theo trận đồ Cửu Cung của Cửu Cung Trận Tông mà dẫn khí đi đủ một vòng: thổ nạp tích đủ 50 tu vi.', objectives: [{ type: 'tuvi', need: 50 }], rewards: { linhThach: 70, tuVi: 20, items: [] } },
      { id: 'q_tong_the', main: false, title: 'Tay không đấu lợn rừng', giver: 'tong_the', requires: 'q_tong_tran', desc: 'Kim Cang Môn thử thân: hạ 3 con Lợn Rừng ở bãi hoang phía nam làng bằng sức thân thể.', objectives: [{ type: 'kill', target: 'lon_rung', need: 3 }], rewards: { linhThach: 75, tuVi: 25, items: [{ id: 'thit_lon', n: 1 }] } },
      { id: 'q_tong_doc', main: false, title: 'Chén thuốc thử độc', giver: 'tong_doc', requires: 'q_tong_the', desc: 'Uống chén thuốc thử của Ngũ Độc Giáo rồi tự ra bãi hoang hái 4 cây Thảo Dược làm thuốc giải, mang về cho Đường Tĩnh xem sắc mặt.', objectives: [{ type: 'collect', target: 'thao_duoc', need: 4 }], rewards: { linhThach: 70, tuVi: 25, items: [] } },
      { id: 'q_tong_am', main: false, title: 'Khúc đàn an hồn', giver: 'tong_am', requires: 'q_tong_doc', desc: 'Đưa thẻ ngọc âm của Huyền Âm Cung về quán trọ làng Thanh Khê cho Hoa nương - khúc an hồn này dành cho những người đã ngã xuống vì thú dữ.', objectives: [{ type: 'talk', target: 'chu_quan', need: 1 }], rewards: { linhThach: 60, tuVi: 30, items: [] } },
      { id: 'q_chinh_18', main: true, title: 'Lễ bái sư', giver: 'de_tu_phai', requires: 'q_tong_am', desc: 'Mười tông đã mở hết. Trở lại bãi tuyển gặp Tạ Thanh Vân làm lễ chọn tông, rồi mở bảng Tông Môn để bái nhập tông môn của ngươi.', objectives: [{ type: 'talk', target: 'de_tu_phai', need: 1 }], rewards: { linhThach: 100, tuVi: 40, items: [] } }
    ],
    SECT_ARC_QUESTS: [
      { chapter: 13, pattern: 'q_mon_{sect}_1', titles: {"thanh_phong": "Tuần sơn đầu tiên", "huyen_phap": "Dẫn pháp nhập môn", "thien_cong": "Bờm sắt nhập kho", "dan_ha": "Linh chi nhập cốc", "van_thu": "Ra mắt bầy thú", "thien_phu": "Dọn kho giấy mới", "cuu_cung": "Dẫn khí qua cửu cung — nhập môn", "kim_cang": "Việc tay chân đầu tiên", "ngu_doc": "Độc hoa nhập kho", "huyen_am": "Khúc đàn nhập môn"} },
      { chapter: 14, pattern: 'q_mon_{sect}_2', titles: {"thanh_phong": "Kiếm tuần Đại Sơn", "huyen_phap": "Quả tụ linh trên cổ thụ", "thien_cong": "Huyết sâm gần sào huyệt", "dan_ha": "Ngọc tủy chi cho Cốc", "van_thu": "Sói cửa sơn", "thien_phu": "Bùa trấn đường sơn", "cuu_cung": "Xem trận ở miếu", "kim_cang": "Lợn rừng Đại Sơn", "ngu_doc": "Rắn khe suối", "huyen_am": "Thảo an thần"} },
      { chapter: 15, pattern: 'q_mon_{sect}_3', titles: {"thanh_phong": "Kiếm thí bãi luyện công", "huyen_phap": "Bế quan dẫn pháp", "thien_cong": "Thử giáp bờm sắt", "dan_ha": "Mẻ bồi nguyên đầu tay", "van_thu": "Dược cho thú thương", "thien_phu": "Tĩnh tọa vẽ đại phù", "cuu_cung": "Bế quan cửu cung", "kim_cang": "Đấu lợn sắt luyện thể", "ngu_doc": "Luyện độc hoa", "huyen_am": "Đàn tĩnh tâm"} },
      { chapter: 16, pattern: 'q_mon_{sect}_4', titles: {"thanh_phong": "Dọn tai mắt của vương", "huyen_phap": "Pháp đàn áp trận", "thien_cong": "Giáp săn vương", "dan_ha": "Đan cho đoàn săn", "van_thu": "Người dẫn đường vào sào", "thien_phu": "Dọn rắn đường săn", "cuu_cung": "Trận dụ vương", "kim_cang": "Dọn đàn theo hầu", "ngu_doc": "Độc săn vương", "huyen_am": "Khúc đàn tiễn đoàn săn"} },
      { chapter: 17, pattern: 'q_mon_{sect}_5', titles: {"thanh_phong": "Giữ đường vận dược", "huyen_phap": "Quả tụ linh cho lò đan", "thien_cong": "Thanh linh tủy cho lò", "dan_ha": "Ngọc tủy góp lò", "van_thu": "Linh chi góp lò", "thien_phu": "Phù hộ lò đan", "cuu_cung": "Trận tụ linh cho lò", "kim_cang": "Thồ dược qua núi", "ngu_doc": "Dược dẫn phụ", "huyen_am": "Thảo an thần cho lò"} },
      { chapter: 18, pattern: 'q_mon_{sect}_6', titles: {"thanh_phong": "Giữ yên đường về làng", "huyen_phap": "Pháp đàn cầu phúc", "thien_cong": "Rèn lại giáp độ kiếp", "dan_ha": "Đan cứu mạng ngày kiếp", "van_thu": "Lời chúc của rừng", "thien_phu": "Bùa trấn tâm", "cuu_cung": "Trận nhỏ giữ làng", "kim_cang": "Buổi luyện thể cuối", "ngu_doc": "Thuốc giải cho ngày kiếp", "huyen_am": "Khúc đàn trước kiếp"} },
      { chapter: 19, pattern: 'q_mon_{sect}_7', titles: {"thanh_phong": "Ngự kiếm tuần sơn", "huyen_phap": "Pháp luân Trúc Cơ", "thien_cong": "Vật liệu cho khí Trúc Cơ", "dan_ha": "Mẻ đan Trúc Cơ đầu tiên", "van_thu": "Đàn thú dưới chân mây", "thien_phu": "Bùa trấn sơn môn mới", "cuu_cung": "Đại trận cửu cung Trúc Cơ", "kim_cang": "Thể tu Trúc Cơ đấu vương", "ngu_doc": "Độc hành Đại Sơn sâu", "huyen_am": "Khúc đàn trên mây"} },
      { chapter: 20, pattern: 'q_mon_{sect}_8', titles: {"thanh_phong": "Thám đường Vân Hải", "huyen_phap": "Ngưng pháp ở biển mây", "thien_cong": "Tìm vật liệu Vân Hải", "dan_ha": "Dược Vân Hải", "van_thu": "Thú Vân Hải", "thien_phu": "Phù mở đường mây", "cuu_cung": "Đo thế trận Vân Hải", "kim_cang": "Gánh đá mở đường", "ngu_doc": "Độc Vân Hải", "huyen_am": "Đàn vọng Vân Hải"} },
    ],
    WELL_LINES: [
      'Giếng cổ lặng yên đã lâu. Đêm nay, nước giếng bỗng ánh lên như có sao rơi xuống đáy.',
      'Một luồng khí ấm chạy từ lòng bàn tay lên khắp người. Thứ ngủ say trong người bạn bấy lâu nay — vừa mở mắt.'
    ]
  };
  // Arc chuong 13-20: thoai bien the theo tong + thoai truc chuong 13-20.
  // Ban du lieu nay GIONG HET DIALOGUES/TRUNK_DIALOGUES cua js/sect-arc.js
  // (module dung ban cua no de phuc vu marker + thoai theo tong da bai nhap);
  // ban o day giu DIALOGUE day du cho moi nhiem vu nhu cac chuong truoc.
  (function () {
    var ARC_DIA = {"de_tu_phai": {"q_mon_thanh_phong_1": [["Đệ tử mới của Thanh Phong? Việc đầu tiên ta giao không khó, mà là gốc: dẹp 3 con Sói Rừng rình người ở đường mòn rừng.", "Kiếm của phái này sinh ra để chắn trước người khác. Đi đi, cho ta xem kiếm của ngươi có chắn được không."], ["Đường mòn yên rồi. Tốt — kiếm đầu tiên của đệ tử Thanh Phong phải là kiếm giữ đường, không phải kiếm khoe oai.", "Đây là thưởng của phái. Từ nay mỗi tuần đều có việc tuần sơn, đừng lười."]], "q_mon_thanh_phong_2": [["Lợn Mông Sắt ở Đại Sơn phá đường mòn cửa sơn ba hôm nay. Phái giao ngươi tuần tra khu đó, hạ 3 con phá đường nhất.", "Đệ tử Thanh Phong đi đâu, đường ở đó phải yên. Nhớ lấy."], ["Đường cửa sơn sạch rồi. Ngươi bắt đầu ra dáng đệ tử tuần sơn của phái này đấy.", "Thưởng của phái đây. Lần sau vào Đại Sơn sâu hơn, kiếm phải nhanh hơn nữa."]], "q_mon_thanh_phong_3": [["Đàn khỉ lại kéo xuống bãi luyện công phá đài kiếm. Dẹp 4 con quậy nhất cho ta.", "Gọi là kiếm thí: kiếm bén rồi mới phá quan được. Người cũng vậy."], ["Đài kiếm yên. Kiếm của ngươi sau đợt này khác hẳn — ánh mắt cũng khác.", "Cầm thưởng đi, về thổ nạp cho vững. Quan ải của ngươi gần lắm rồi."]], "q_mon_thanh_phong_4": [["Đoàn săn vương thú cần đường vào sào sạch. Ngươi đi trước đoàn, dẹp 5 con Sói Rừng — tai mắt của con vương quanh đường mòn.", "Kiếm đi trước, đoàn theo sau. Đó là chỗ của Thanh Phong trong mọi đoàn săn."], ["Đường vào sào thông rồi, đoàn săn đã sẵn sàng. Phần Yêu Đan Cấp 2 này là cổ phần săn của phái chia cho ngươi.", "Giữ kỹ — góp vào lò Trúc Cơ Đan của ngươi sau này."]], "q_mon_thanh_phong_5": [["Dược liệu cho mẻ Trúc Cơ Đan phải vận qua bãi khỉ cổ thụ, mà đàn khỉ cứ cướp phá đoàn thồ.", "Dẹp 5 con khỉ đầu đàn, giữ đường cho dược đi qua. Kiếm của ngươi lúc này là để mở đường cho chính lò đan của mình."], ["Đoàn thồ qua được rồi. Đây, phái chia thêm 2 tai Linh Chi — góp vào lò của ngươi.", "Nguyên liệu lo dần từ bây giờ, ngày độ kiếp mới không cuống."]], "q_mon_thanh_phong_6": [["Trước ngày ngươi độ kiếp, ta giao việc cuối cùng của phái: dẹp 4 con Sói Rừng lảng vảng đường về làng.", "Ngươi lên trời hay ở lại đất, con đường về nhà phải yên trước đã. Đó là điều Thanh Phong vẫn dạy."], ["Đường về làng yên. Trong tay ngươi còn viên Hồi Xuân Đan của phái — mang theo vào ngày kiếp.", "Lên trời cho vững. Phái ở dưới này giữ đường cho ngươi về."]], "q_mon_thanh_phong_7": [["Đệ tử Trúc Cơ đầu tiên của vùng mà Thanh Phong nhận — việc đầu tiên phải xứng: hạ 1 vương thú mang hình Sơn Quân.", "Ở sào cũ trong rừng, hoặc Gầm Sơn Hổ Vương trong Đại Sơn. Kiếm đã biết bay rồi, người phải dám dùng."], ["Vương thú gục dưới kiếm Trúc Cơ. Tốt. Từ nay bãi tuyển này có người giữ núi thật sự rồi.", "Thưởng của phái. Đường Vân Hải phía trước còn dài — kiếm đừng rời tay."]], "q_mon_thanh_phong_8": [["Đường tới Kim Đan bắt đầu sau Chi Đỉnh, ở Sơn Trung Vân Hải. Phái giao ngươi thám đường: dẹp 6 con Sói Rừng ở Đại Sơn sâu, mở lối cho người sau.", "Đệ tử Thanh Phong đời nào cũng là người đi trước mở đường. Đời này là ngươi."], ["Đường đã mở. Đây — hạt giống Long Tiên Thảo phái tìm được, gieo vào hành trang của ngươi cho chặng Kim Đan.", "Đi xa đến đâu cũng nhớ: kiếm mở đường là để người sau đi, không phải để khoe."]], "q_chinh_19": [["Tên ngươi đã vào sổ đệ tử. Trước khi nhận việc tông đầu tiên, về làng Thanh Khê báo cho trưởng làng Trần Đức biết ngươi đã bái nhập tông nào.", "Người giữ làng một đời, đáng được nghe tin này từ chính miệng ngươi. Xong quay lại đây, việc của tông đang chờ."], ["Trưởng làng đã biết tin. Tốt — gốc rễ yên rồi mới tu xa được.", "Từ giờ việc của tông sẽ qua tay ta giao cho ngươi. Làm cho tử tế, đừng phụ cái tên trong sổ."]], "q_chinh_25": [["Ngươi nghe chuyện giếng cổ lại sáng rồi chứ? Ta trầm ngâm cả buổi — phong ấn biến động là điềm của những năm không yên.", "Nhưng việc của ngươi trước mắt chỉ có một: đứng vững ở ngưỡng Trúc Cơ. Tới Miếu Sơn Thần gặp Từ bà, nhận bài khấn trấn tâm bà giữ từ thời Thanh Khê lão nhân."], ["Từ bà đã trao bài khấn cho ngươi. Viên Đại Hồi Xuân Đan này là của tông môn gửi — mang theo vào ngày dẫn động thiên lôi.", "Nhớ: đột phá Trúc Cơ không phải bấm một nút là xong. Trời sẽ hỏi ngươi bằng sấm sét. Chuẩn bị cho đủ rồi hẵng mở lò."]], "q_chinh_26": [["Mọi thứ đã sẵn: tu vi viên mãn, Trúc Cơ Đan trong tay, bài khấn trong lòng. Việc còn lại là của trời và của ngươi.", "Mở lò tu hành, dẫn động lôi kiếp, sống sót qua thiên lôi mà kết đạo cơ. Ta ở bãi tuyển này chờ — sống sót thì quay lại gặp ta."], ["Thiên lôi tan rồi, đạo cơ đã kết. Từ hôm nay ngươi là tu sĩ Trúc Cơ — người thứ mấy của vùng này trong trăm năm, ngươi có biết không?", "Đừng vội mừng. Đạo cơ mới là nền móng. Phía trên còn Kim Đan, còn cả một bầu trời."]], "q_chinh_27": [["Trúc Cơ thành, mắt ngươi nhìn thế giới đã khác. Sau Chi Đỉnh là Sơn Trung Vân Hải — đất của tu sĩ Trúc Cơ, và xa hơn là Đoạn Long Lĩnh.", "Trước chuyến đi xa đầu tiên, thổ nạp tích 300 tu vi cho đạo cơ đặc lại. Nền không vững mà đi xa là tự hại mình."], ["Đạo cơ đã đặc, hơi thở dài và sâu như người tu mười năm. Ngươi sẵn sàng cho Vân Hải rồi.", "Hạt Long Tiên Thảo này ta tìm được trong kho tông — vị chính của phương Kim Đan sau này. Giữ kỹ, và đi cho xa."]]}, "tong_phap": {"q_mon_huyen_phap_1": [["Huyền Pháp Tông không giao việc tay chân cho đệ tử mới. Tới đài thử pháp, dẫn linh khí đi đủ một vòng ngũ hành, tích 60 tu vi cho ta xem.", "Tâm tĩnh thì pháp mới sinh. Ngươi mà nóng vội, ngũ hành trong người sẽ tự đánh nhau."], ["Ngũ hành luân chuyển êm như nước. Tốt — pháp căn của ngươi hợp với tông này hơn ta tưởng.", "Thưởng nhập môn đây. Nhớ: pháp tu hơn nhau ở cái tĩnh, không phải cái mạnh."]], "q_mon_huyen_phap_2": [["Đàn khỉ cổ thụ tha Tụ Linh Quả về tổ — quả đó là của đài thử pháp trồng dưỡng bao năm.", "Lấy lại 3 quả cho ta. Nhẹ tay thôi, pháp tu không cần cướp giật như thú."], ["Quả còn nguyên linh khí. Đẹp lắm — ngươi lấy được mà đàn khỉ không hề hay biết à?", "Thưởng của tông. Quả này sẽ dùng cho bài dẫn pháp tiếp theo của chính ngươi."]], "q_mon_huyen_phap_3": [["Trước ngày phá quan, Huyền Pháp cho đệ tử bế quan ngắn: tích 100 tu vi trong một vòng dẫn pháp không gián đoạn.", "Đứt một hơi là làm lại từ đầu. Pháp không tha cho kẻ hấp tấp."], ["Một vòng trọn, không đứt hơi nào. Tâm ngươi đã tĩnh hơn ngày mới vào tông nhiều lắm.", "Cầm thưởng, về chuẩn bị. Quan ải phía trước, pháp sẽ đỡ ngươi — nếu ngươi đủ tĩnh."]], "q_mon_huyen_phap_4": [["Trước trận săn vương thú, tông dựng pháp đàn áp trận ở bãi tuyển. Ngươi dẫn pháp tích 80 tu vi nạp vào đàn.", "Lúc vương thú vùng lên, chính pháp đàn này sẽ đè nó xuống cho đoàn săn ra tay. Đừng để đàn đói linh."], ["Pháp đàn đầy linh, ngũ sắc luân chuyển đều. Phần Yêu Đan Cấp 2 này tông chia cho ngươi.", "Giữ cho kỹ — nó là một phần của lò Trúc Cơ Đan ngày sau."]], "q_mon_huyen_phap_5": [["Lò luyện Trúc Cơ Đan cần Tụ Linh Quả giữ linh khí không tán giữa chừng.", "Lấy 4 quả từ đàn khỉ cổ thụ ở Đại Sơn mang về. Lần này đàn khỉ có giận cũng kệ — lò của ngươi quan trọng hơn."], ["Bốn quả đủ cả, linh khí còn đầy. Lò của ngươi có tông góp phần rồi đấy.", "Từ nay việc của lò là việc chung — ngươi không còn tu một mình nữa."]], "q_mon_huyen_phap_6": [["Tông dựng pháp đàn cầu phúc cho ngươi trước ngày độ kiếp. Dẫn pháp tích 100 tu vi nạp vào đàn đi.", "Nói trước cho rõ: pháp đàn không chắn nổi thiên lôi. Nó chỉ giúp ngươi tĩnh tâm mà chịu — phần còn lại là của ngươi."], ["Đàn đã nạp đầy. Viên Hồi Xuân Đan này mang theo — pháp tu yếu thân, phải biết tự giữ mạng.", "Đi đi. Thiên lôi dữ đến đâu, nhớ hơi thở đầu tiên ta dạy ngươi."]], "q_mon_huyen_phap_7": [["Vừa kết đạo cơ, vận thử pháp luân mới cho ta xem: tích 150 tu vi, cho Ngũ Hành Luân chuyển đủ năm màu không nghẽn một hệ.", "Trúc Cơ mà pháp luân nghẽn là đạo cơ nứt từ trong. Làm chậm thôi."], ["Năm màu chuyển êm như một. Đạo cơ của ngươi vững hơn nhiều đệ tử ta từng dạy.", "Thưởng của tông. Từ nay ngươi là pháp tu Trúc Cơ trẻ nhất vùng này — đừng để ai nói là nhờ may."]], "q_mon_huyen_phap_8": [["Đường Kim Đan của pháp tu gói trong một chữ: ngưng. Pháp phải ngưng như sương đọng trên lá mới kết được đan.", "Tích 200 tu vi cho ta xem pháp cơ của ngươi đã đặc tới đâu rồi."], ["Đặc lắm rồi. Sương đã bắt đầu đọng — Kim Đan không còn là chuyện kể nữa.", "Hạt Long Tiên Thảo này tông giao ngươi giữ. Ngày lên Vân Hải hái dược thật, ngươi sẽ cần nó làm mẫu."]]}, "tong_khi": {"q_mon_thien_cong_1": [["Vào phường của ta thì làm việc của phường: kho đang thiếu bờm sắt. Hạ 2 con Lợn Mông Sắt trong rừng, mang bờm về nguyên vẹn.", "Rách bờm là phường không nhận. Tay nghề bắt đầu từ chỗ biết giữ vật liệu."], ["Bờm nguyên, không rách một sợi. Tay ngươi khéo hơn khối thằng thợ học việc của ta.", "Thưởng đây, với miếng thịt này mang về ăn. Từ nay ngươi là người của Thiên Công Phường."]], "q_mon_thien_cong_2": [["Huyết Sâm mọc đất rừng lâu năm cạnh sào huyệt yêu thú ở Đại Sơn — rèn khí, luyện đan đều quý thứ này.", "Hái 3 củ mang về. Cẩn thận chủ nhà của nó — sâm quý thì thú dữ giữ càng kỹ."], ["Ba củ sâm còn nguyên rễ. Tốt — đào sâm mà vội là hỏng cả củ lẫn người.", "Thưởng của phường. Lần sau vào sâu hơn nữa, vật liệu còn quý hơn nhiều."]], "q_mon_thien_cong_3": [["Phường rèn xong lô giáp bờm sắt mới, cần người mặc thử vào việc thật: hạ 3 con Lợn Mông Sắt mà giáp không sứt.", "Giáp qua được, ta ghi tên ngươi vào sổ thợ chính. Giáp hỏng... thì ngươi tự biết đường về bằng cách nào."], ["Giáp không một vết sứt, người cũng nguyên. Sổ thợ chính có tên ngươi rồi đấy.", "Viên Yêu Đan Cấp 1 này là của ngươi — phường không giữ của người làm ra việc."]], "q_mon_thien_cong_4": [["Đoàn săn vương thú mà không có giáp tử tế là đi nộp mạng. Phường nhận rèn giáp săn vương cho cả đoàn.", "Ngươi hạ 4 con Lợn Mông Sắt lấy bờm tốt nhất về đây. Giáp xong trong đêm, mai đoàn lên đường."], ["Bờm tốt thật. Giáp săn vương đã rèn xong — cả đoàn nhờ tay ngươi mà thêm phần sống.", "Phần Yêu Đan Cấp 2 này phường chia cho ngươi. Để dành cho lò Trúc Cơ Đan của ngươi."]], "q_mon_thien_cong_5": [["Lò của phường giữ lửa bằng Thanh Linh Tủy — thứ đọng ở kẽ đá cạnh sào Sơn Quân và trong phế tích Đại Sơn.", "Lấy 2 giọt mang về. Đây là phần phường góp cho mẻ Trúc Cơ Đan của ngươi — phường này không nợ ai bao giờ."], ["Tủy còn trong, lửa lò sẽ giữ đều ba ngày. Mẻ đan của ngươi có phường đứng sau rồi.", "Thêm tai Linh Chi này nữa — phường góp thêm cho chắc. Lo dần đi, ngày kiếp không chờ ai."]], "q_mon_thien_cong_6": [["Nghe nói ngươi sắp độ kiếp. Về lò ngay — ta rèn lại bộ giáp cho ngươi, vật liệu vẫn là bờm sắt tốt nhất.", "Hạ 3 con Lợn Mông Sắt mang bờm về, ta rèn gấp trong đêm. Giáp độ kiếp là giáp giữ mạng, không phải giáp đẹp."], ["Giáp xong rồi, thử đi. Sét đánh vào giáp này trượt đi ba phần — hai phần còn lại là việc của ngươi.", "Viên Hồi Xuân Đan cầm theo. Lên trời cho nguyên vẹn mà về, phường còn nhiều việc cho ngươi."]], "q_mon_thien_cong_7": [["Có đệ tử Trúc Cơ rồi, phường muốn rèn món khí đầu tiên xứng tầm: hạ 5 con Lợn Mông Sắt ở Đại Sơn, lấy bờm và da tốt nhất.", "Ta nói thật: khí Trúc Cơ phải bắt đầu từ vật liệu thật tay. Không có đường tắt ở phường này."], ["Vật liệu đủ tốt. Món khí đầu tiên của ngươi, ta sẽ tự tay rèn.", "Phần Yêu Đan Cấp 2 kèm đây — phường chia cho người mang vật liệu về. Đường Vân Hải còn cần nhiều thứ lạ hơn nữa."]], "q_mon_thien_cong_8": [["Khí của Kim Đan cần vật liệu sinh trong biển mây — thứ đó phường này chưa từng thấy.", "Ngươi vào Đại Sơn sâu hạ 5 con Lợn Mông Sắt, tiện đường ghi lại mọi mỏ vật liệu lạ cho ta. Mắt thợ của ngươi giờ là mắt của phường."], ["Ghi chép rõ ràng lắm. Phường sẽ theo sổ này mà cử người đi khảo sát sau.", "Hạt Long Tiên Thảo này ngươi giữ — phường tìm được trong chuyến hàng cũ. Chặng Kim Đan của ngươi bắt đầu rồi đấy."]]}, "tong_dan": {"q_mon_dan_ha_1": [["Việc đầu tiên Đan Hà Cốc giao cho đệ tử mới: hái 3 tai Linh Chi còn đẫm sương gần suối linh, mang về nhập kho dược.", "Dược hái vội là dược chết. Đi chậm, ngắt nhẹ — Cốc này coi trọng một tai nấm hơn một gánh củi."], ["Linh chi còn nguyên sương, dược tính chưa thoát một phần. Tay ngươi hợp với nghề đan hơn ta tưởng.", "Thưởng nhập cốc đây, kèm ít Thảo Dược cho ngươi tập sắc thuốc. Từ nay kho dược của Cốc là nhà của ngươi."]], "q_mon_dan_ha_2": [["Cốc cần Ngọc Tủy Chi — mọc ở kẽ đá bãi luyện công chân núi và gốc cây phía đông rừng.", "Hái 2 tai mang về. Cốc đang chuẩn bị những mẻ đan lớn cho lớp đệ tử lên núi đợt này."], ["Ngọc tủy còn trắng trong, chưa ngả màu. Tốt — thứ này hái sai giờ là thành nấm thường.", "Thưởng của Cốc. Nhớ đường kẽ đá đó, về sau ngươi còn phải quay lại nhiều lần."]], "q_mon_dan_ha_3": [["Đã đến lúc ngươi tự luyện mẻ đan bồi nguyên đầu tay: 1 viên Đại Bồi Nguyên Đan, luyện xong mang về cho ta chấm.", "Đan này là để chính ngươi uống trước ngày phá quan. Luyện cho người khác thì qua loa được, luyện cho mình thì không."], ["Đan tròn, vân đều, dược lực khóa kín bên trong. Mẻ đầu tay mà được vậy là có căn cơ làm đan sư.", "Cầm thưởng đi. Viên đan này uống trước khi phá quan — Cốc dạy ngươi tự cứu mình trước."]], "q_mon_dan_ha_4": [["Đoàn săn vương thú không đi tay không được. Cốc bắt ngươi luyện 2 viên Đại Hồi Xuân Đan mang theo cho đoàn.", "Nhớ cho kỹ: đan cứu mạng mà luyện hỏng, người chết là thật, không phải chuyện trong sách."], ["Hai viên đều đạt. Đoàn săn có đan của ngươi trong tay, cơ hội sống thêm ba phần.", "Đây — Yêu Đan Cấp 2, phần Cốc chia cho người giữ mạng đoàn. Để dành cho lò Trúc Cơ Đan của ngươi."]], "q_mon_dan_ha_5": [["Kho của Cốc mở ra cũng không đủ Ngọc Tủy Chi cho mẻ Trúc Cơ Đan của ngươi.", "Hái 2 tai ở kẽ đá bãi luyện công mang về góp lò. Dược này mà thiếu, đan dẫn kiếp không kết nổi — ta nói thật, không dọa."], ["Đủ rồi. Lò Trúc Cơ Đan của ngươi nay có đủ vị khó nhất nhì.", "Lo nguyên liệu từ bây giờ là đúng. Người chờ đến ngày kiếp mới lo thì không kịp nữa."]], "q_mon_dan_ha_6": [["Bài cuối của Cốc trước ngày ngươi độ kiếp: tự luyện 1 viên Sinh Cơ Đan.", "Viên đan cứu mạng ngươi sẽ mang theo vào lôi kiếp. Luyện bằng tay mình, uống bằng mạng mình — đó là lệ của Đan Hà từ đời tổ sư."], ["Đan thành, dược lực êm mà sâu. Viên này có thể kéo ngươi về từ cửa tử một lần.", "Mang theo bên người, đừng rời. Ta ở dưới này canh lò chờ tin ngươi."]], "q_mon_dan_ha_7": [["Ở thân phận Trúc Cơ, Cốc giao ngươi mẻ đan đầu tiên của hàng đan sư thật: luyện 1 viên Phá Cảnh Đan.", "Phương này chỉ truyền cho người đã bái nhập Cốc. Từ nay đan ngươi luyện không chỉ cho làng nữa, mà cho cả vùng núi này."], ["Đan Trúc Cơ đầu tay mà vân đan đã đều thế này... Cốc có người kế nghiệp rồi.", "Thưởng của Cốc đây. Nhớ giữ lửa lò như giữ mạng — ở cảnh giới nào cũng vậy."]], "q_mon_dan_ha_8": [["Cốc bắt đầu tính phương đan Kim Đan từ bây giờ, không phải chờ tới lúc ngươi đứng trước cửa mới lo.", "Hái 4 tai Linh Chi Thanh Sơn làm nền dược mang về. Phần dược Vân Hải, Cốc sẽ cử ngươi đi lấy khi đường mở."], ["Linh chi nền đủ rồi. Phương đan Kim Đan của Cốc bắt đầu có hình hài từ hôm nay.", "Hạt Long Tiên Thảo này ngươi giữ — vị chính của phương đang nằm trong tay ngươi đấy."]]}, "tong_thu": {"q_mon_van_thu_1": [["Vạn Thú Môn không giao việc bằng miệng đâu. Xuống lán trại trong rừng gặp Hà Thiết Sơn, để ổng đưa ngươi ra mắt bầy thú.", "Thú nó ngửi được lòng người. Ngươi mà mang ý xấu, cả đàn sẽ biết trước cả ta."], ["Ông Sơn bảo thú rừng chịu tới gần ngươi ăn cỏ — hiếm lắm đấy! Môn này chính thức nhận ngươi rồi.", "Thưởng nhập môn đây. Sau này thú của ngươi sẽ tự tìm về với ngươi, cứ chờ mà xem."]], "q_mon_van_thu_2": [["Đàn linh thú non của môn chăn thả gần cửa sơn đang bị sói rừng rình. Dẹp 4 con Sói Rừng đầu bầy cho ta.", "Nhớ nhé: ta bảo dẹp sói dữ, không phải diệt cả bầy. Sói cũng là thú — con nào không dữ thì để nó sống."], ["Sói dữ đã dẹp, đàn non yên rồi. Ngươi phân biệt được con nào đáng đánh — đó là tâm của Vạn Thú Môn.", "Viên Yêu Đan Cấp 1 này là của con sói đầu đàn. Môn chia cho ngươi — lấy của thú trả cho thú."]], "q_mon_van_thu_3": [["Mấy con trong đàn bị sói cắn thương, nằm rên cả đêm qua. Hái 3 tai Linh Chi gần suối linh về cho ta giã thuốc.", "Đi nhẹ chân thôi — thú thương nó sợ tiếng động lạ lắm."], ["Thuốc đã đắp, đàn thú qua được đêm nay rồi. Ngươi hái dược mà biết chọn tai non nhất cho thú thương — ta ưng.", "Thưởng đây, kèm Thảo Dược cho ngươi tập chăm thú. Người của Vạn Thú Môn phải biết chữa trước khi biết sai khiến."]], "q_mon_van_thu_4": [["Đoàn săn vương thú cần người dẫn đường vào gần sào. Chỉ có một người được thú rừng tin tuyệt đối: Hà Thiết Sơn.", "Tới lán trại xin ổng dẫn đường. Ngươi đi vì thú ngửi được lòng ngươi trong sạch — đừng làm mất cái tin đó."], ["Ông Sơn nhận lời dẫn đường rồi! Cả đoàn săn nhờ ngươi mà có đường vào sào an toàn.", "Yêu Đan Cấp 2 này môn chia cho ngươi. Để dành — sau này góp vào lò Trúc Cơ Đan của ngươi."]], "q_mon_van_thu_5": [["Môn góp phần vào mẻ Trúc Cơ Đan của ngươi bằng thứ môn có nhiều nhất: Linh Chi rừng.", "Hái 4 tai còn đẫm sương mang về, ta đóng gói gửi lò cho ngươi. Thú rừng nhìn ngươi hái quen rồi, chúng sẽ không phá đâu."], ["Bốn tai đủ cả, tai nào cũng đẹp. Lò của ngươi có phần của rừng này trong đó rồi.", "Nhớ lấy: ngươi lên cao được là nhờ cả rừng này nuôi. Sau này mạnh rồi, trả lại cho rừng."]], "q_mon_van_thu_6": [["Trước ngày ngươi độ kiếp, vào rừng một mình gặp Hà Thiết Sơn đi. Rừng có lời chúc riêng cho người sắp lên trời.", "Ta không nói trước là gì đâu. Chỉ người được thú tin mới nghe được — mà ngươi thì nghe được, ta chắc."], ["Ông Sơn gửi lời: thú rừng sẽ tránh xa bãi độ kiếp của ngươi ba ngày, để trời đánh ngươi cho yên.", "Đó là quà lớn nhất rừng tặng được. Viên Hồi Xuân Đan này của ta — mang theo nhé."]], "q_mon_van_thu_7": [["Ngươi là người Trúc Cơ đầu tiên mà đàn thú rừng này thừa nhận. Ta muốn ghi lại ngày này tử tế.", "Dẹp 6 con Sói Rừng dữ nhất cửa sơn, cho đàn thú non yên ổn ra uống nước suối lần đầu tiên trong mùa."], ["Đàn non ra suối rồi, uống nước không còn giật mình nữa. Cảnh đó đẹp hơn mọi lễ mừng của người.", "Thưởng của môn đây. Từ nay đi trong rừng, thú sẽ nhường đường cho ngươi trước."]], "q_mon_van_thu_8": [["Đàn khỉ ở rừng già đang chặn đường thú di cư lên Vân Hải — mùa này chúng không lên được là chết rét ở lại.", "Dẹp 6 con khỉ đầu đàn mở đường cho chúng. Kim Đan của người tu cũng bắt đầu từ một việc lành cho thú, ta tin vậy."], ["Đường di cư thông rồi, đàn thú đã bắt đầu lên núi. Ngươi vừa cứu cả một mùa của chúng.", "Hạt Long Tiên Thảo này là của một con thú già tha về lán trại năm ngoái — giờ nó thuộc về ngươi."]]}, "tong_phu": {"q_mon_thien_phu_1": [["Kho giấy bùa ven suối linh lại có rắn lục bò vào nằm trong xấp giấy khô. Dẹp 3 con Rắn Lục Đuôi Đỏ cho ta.", "Giẫm hỏng giấy là ta trừ thưởng. Tay nhanh mà chân phải nhẹ — như lệ của các này."], ["Rắn dẹp sạch, giấy không hỏng một tờ. Tay chân ngươi sinh ra để làm phù sư đấy.", "Thưởng nhập các đây. Từ nay giấy bùa qua tay ngươi phải sạch như vậy."]], "q_mon_thien_phu_2": [["Đường lên Đại Sơn mùa này cần bùa trấn mới. Ngươi tĩnh tọa dẫn khí tích 80 tu vi, nạp linh vào xấp bùa trấn đường.", "Bùa trấn đường mà linh yếu, thú dữ đi qua nó cười cho. Nạp cho đầy vào."], ["Bùa nở linh quang đều cả xấp. Đoàn lên núi mùa này yên tâm hơn nhờ tay ngươi.", "Thưởng của các. Vẽ bùa là việc của tay, trấn được đường hay không là việc của tâm tĩnh."]], "q_mon_thien_phu_3": [["Các chuẩn bị một lá đại phù cho mùa thú dữ. Ngươi nạp linh vào nét bùa chính: tích 100 tu vi, một hơi không đứt.", "Tay run một nét là cả lá hỏng. Ta ngồi đây xem — run là biết ngay."], ["Nét bùa trơn như nước chảy. Đại phù này treo lên cổng núi, thú dữ phải vòng đường khác.", "Thưởng đây. Ngươi tiến bộ nhanh hơn ta nghĩ — cái tĩnh của ngươi thật, không phải giả."]], "q_mon_thien_phu_4": [["Đường săn qua khe suối đầy rắn lục — đoàn đi qua là bị cắn lén từ bụi cỏ. Dẹp 4 con rắn dữ nhất ven đường cho ta.", "Việc của Thiên Phù Các trong đoàn săn là dọn đường. Không hào nhoáng, mà thiếu là chết người."], ["Đường săn sạch rắn. Đoàn đi qua khe suối lần này không ai phải lo nhìn chân nữa.", "Yêu Đan Cấp 2 — phần các chia cho ngươi. Để dành góp lò Trúc Cơ Đan, đừng bán."]], "q_mon_thien_phu_5": [["Luyện Trúc Cơ Đan phải có phù hộ lò — lửa tắt giữa chừng là hỏng cả mẻ, hỏng cả đường tu của ngươi.", "Tĩnh tọa tích 90 tu vi, tự tay nạp linh vào ba lá phù hộ lò của chính mẻ đan của mình. Làm cho tử tế vào."], ["Ba lá phù đều linh, lửa lò của ngươi sẽ không tắt giữa chừng đâu.", "Thêm 2 tai Linh Chi các góp vào lò của ngươi. Các này tuy nhỏ mà chưa từng bỏ rơi đệ tử nào."]], "q_mon_thien_phu_6": [["Trước ngày độ kiếp, tới Miếu Sơn Thần gặp Từ bà, xin bà một lá bùa trấn tâm viết tay mang theo.", "Nói rõ cho ngươi khỏi hiểu lầm: bùa không chống được sét. Nó chống lòng ngươi run. Mà người độ kiếp chết vì run nhiều hơn vì sét."], ["Từ bà viết bùa cho ngươi rồi à? Bà ít viết cho ai lắm — ngươi được bà quý đấy.", "Viên Hồi Xuân Đan này mang theo. Lên trời cho vững, các chờ ngươi về vẽ tiếp."]], "q_mon_thien_phu_7": [["Có đệ tử Trúc Cơ, các nâng cấp bùa trấn cho cả vùng. Dẹp 5 con Rắn Lục Đuôi Đỏ ở khe suối Đại Sơn, lấy đường sạch cho đoàn phù sư lên đặt bùa mới.", "Lần này ngươi đi không phải để dẹp rắn — là để mở đường cho cả một hệ thống trấn mới."], ["Đường sạch rồi, đoàn phù sư đã lên đặt bùa. Từ mùa này đường Đại Sơn yên hơn hẳn.", "Thưởng của các. Bùa của ngươi giờ trấn được cả một vùng — nhớ cái trọng lượng đó mỗi khi đặt bút."]], "q_mon_thien_phu_8": [["Đường lên Vân Hải cần phù mở đường cắm dọc lối mòn. Dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích, dọn lối cắm phù cho ta.", "Mỗi lá phù trên đường đó sau này là một mạng người được giữ. Dọn cho sạch."], ["Lối cắm phù thông rồi. Hạt Long Tiên Thảo này các tìm được trong kho cũ — giao ngươi giữ cho chặng Kim Đan.", "Đi xa nhớ về. Các này nhỏ, thiếu một người là vắng hẳn."]]}, "tong_tran": {"q_mon_cuu_cung_1": [["Bài nhập môn của Cửu Cung Trận Tông là bài cũ ở mức khó hơn: dẫn khí qua cửu cung, tích 70 tu vi, không để khí loạn một ô.", "Trận pháp bắt đầu từ thân mình. Thân còn loạn, bày trận lớn chỉ là tự hại người."], ["Chín ô sáng đều, khí không loạn một nhịp. Nền trận của ngươi vững hơn ta dự tính.", "Thưởng nhập tông. Từ nay mỗi bước ngươi đi trong núi đều là một ô trận — tập nhìn như vậy."]], "q_mon_cuu_cung_2": [["Trước khi vào Đại Sơn, tới Miếu Sơn Thần gặp Từ bà, nghe bà kể thế trận phong ấn của Thanh Khê lão nhân.", "Vào núi mà không hiểu thế đất dưới chân là tự nộp mạng. Âu Dương Kỳ này không cho đệ tử đi mù."], ["Bà Từ khen ngươi nghe chăm hơn đám đệ tử cũ của ta. Tốt.", "Giờ ngươi đã biết núi này đứng trên một thế trận cổ — đi đâu cũng nhìn thế đất trước, nhớ chưa."]], "q_mon_cuu_cung_3": [["Nâng bài nhập môn lên một bậc: dẫn khí qua cửu cung tích 120 tu vi, chín ô phải sáng đều như một.", "Đây là nền cho mọi đại trận sau này của ngươi. Vội là hỏng, mà hỏng ở thân mình thì không ai chữa được."], ["Chín ô như một — cảnh giới này ở đệ tử mới là hiếm. Ta bắt đầu hiểu vì sao các tông đều muốn ngươi.", "Thưởng của tông. Chuẩn bị phá quan đi, trận đã đỡ sẵn đường cho ngươi."]], "q_mon_cuu_cung_4": [["Tông muốn bày trận dụ vương thú ra khỏi sào. Muốn vậy phải hiểu thế đất quanh sào huyệt của nó.", "Tới Miếu Sơn Thần gặp Từ bà, xin bà chỉ thế đất và bài khấn yên núi. Trận dụ được vương là nhờ hiểu đất của nó, không nhờ sức."], ["Bà Từ đã chỉ thế đất quanh sào. Trận dụ vương bày được rồi — đoàn săn có thêm phần thắng.", "Yêu Đan Cấp 2 này là phần tông chia cho ngươi. Giữ lấy, nó thuộc về lò Trúc Cơ Đan của ngươi."]], "q_mon_cuu_cung_5": [["Lò luyện Trúc Cơ Đan của ngươi cần một trận tụ linh quanh lò, không thì linh khí thoát hết giữa chừng.", "Việc của ngươi: dẫn khí qua cửu cung tích 90 tu vi để khép trận. Trận khép kín, mẻ đan mới có cơ thành."], ["Trận khép kín không một kẽ hở. Lò của ngươi từ nay có trận của tông giữ lửa.", "Thêm 2 tai Linh Chi tông góp vào lò. Ngươi không tu một mình nữa — tập quen với điều đó đi."]], "q_mon_cuu_cung_6": [["Ngày ngươi độ kiếp, ai giữ làng? Về làng gặp trưởng làng Trần Đức, cùng ông chốt một trận nhỏ giữ cổng Nam Môn trong ngày ngươi ở trên trời.", "Độ kiếp không chỉ là việc của người trên trời. Dưới đất phải yên, người trên trời mới dám đi hết đường."], ["Trận giữ làng đã chốt với trưởng làng. Làng yên, ngươi cứ yên tâm mà lên.", "Viên Hồi Xuân Đan này mang theo. Thiên lôi không nể trận của ai đâu — tự giữ mình."]], "q_mon_cuu_cung_7": [["Ở thân phận Trúc Cơ, ngươi bày đại trận cửu cung đầu tiên cho tông: dẫn khí tích 150 tu vi, khép trọn đại trận quanh bãi tuyển.", "Đại trận này sẽ giữ núi một mùa. Ngươi bày nó, tức là ngươi bắt đầu gánh việc của cả vùng."], ["Đại trận khép trọn, chín cung sáng đều. Âu Dương Kỳ này nhận thua — ngươi bày nhanh hơn ta ngày trẻ.", "Thưởng của tông. Từ nay tên ngươi gắn với thế trận của cả dãy núi này."]], "q_mon_cuu_cung_8": [["Tông muốn đo thế trận của cả dãy Vân Hải trước khi bất kỳ ai lên đó kết đan. Việc này không làm bằng chân trước được.", "Về bãi tuyển gặp Tạ Thanh Vân, nghe sứ giả kể địa thế Sơn Trung Vân Hải và Đoạn Long Lĩnh, ghi lại cho ta từng điểm."], ["Ghi chép đủ đầy. Thế Vân Hải hiểm hơn ta tưởng — may mà đo trước khi người lên.", "Hạt Long Tiên Thảo này tông giao ngươi. Đường Kim Đan của ngươi, trận pháp sẽ đi cùng tới cuối."]]}, "tong_the": {"q_mon_kim_cang_1": [["Kim Cang Môn giao việc đầu tiên ít lời thôi: ra bãi hoang phía nam, hạ 3 con Lợn Rừng.", "Đứng vững. Không lùi. Đó là lễ nhập môn của môn này từ trăm năm nay."], ["Ngươi không lùi một bước nào. Tốt. Môn này chỉ nhận người đứng vững.", "Thưởng đây, với miếng thịt — ăn cho có sức. Từ nay ngươi là người của Kim Cang Môn."]], "q_mon_kim_cang_2": [["Lợn Rừng Đại Sơn to và dữ hơn bãi hoang quê nhà nhiều. Hạ 4 con.", "Coi như bài kiểm tra thân thể đầu tiên ở đất lạ. Ngã thì đứng dậy, đừng nằm than."], ["Bốn con, người còn đứng thẳng. Thân thể ngươi chịu được đất Đại Sơn rồi.", "Thưởng của môn. Ăn miếng thịt này đi — luyện thể mà không ăn là tự phá thân."]], "q_mon_kim_cang_3": [["Bài luyện thể trước phá quan của môn chỉ có một: đấu thẳng 4 con Lợn Mông Sắt.", "Lấy cú húc của chúng tôi da thịt ngươi. Đau mà không ngã là qua. Khóc cũng được, ngã thì không."], ["Da thịt ngươi sau đợt này cứng như da lợn sắt thật rồi. Quan ải phía trước, thân này qua được.", "Viên Yêu Đan Cấp 1 này là của ngươi — của kẻ đứng cuối cùng trên bãi."]], "q_mon_kim_cang_4": [["Vương thú đi đâu cũng có đàn Lợn Rừng theo hầu. Dọn 5 con lợn theo hầu quanh cửa sơn cho ta.", "Ngày săn, đoàn chỉ phải đối mặt một mình con vương. Việc dọn đàn là việc của người có sức — là ngươi."], ["Đàn theo hầu sạch rồi. Đoàn săn giờ chỉ còn một đối thủ duy nhất.", "Yêu Đan Cấp 2 — phần môn chia cho người dọn đường. Để dành cho lò Trúc Cơ Đan của ngươi đấy."]], "q_mon_kim_cang_5": [["Dược liệu nặng phải có người gánh qua núi. Dọn đường thồ: hạ 4 con Lợn Mông Sắt chặn đường mòn Đại Sơn.", "Xong rồi gánh phần dược của môn về lò. Kim Cang Môn góp cho lò của ngươi bằng vai và lưng, như lệ của môn."], ["Đường thông, dược đã gánh về đủ. Lò của ngươi có phần mồ hôi của môn này trong đó.", "Thêm 2 tai Linh Chi môn góp. Nhớ: thân thể này là để gánh việc chung, không phải để khoe."]], "q_mon_kim_cang_6": [["Môn không có quà cáp cho ngày độ kiếp. Chỉ có một buổi luyện thể cuối: hạ 4 con Lợn Rừng ở bãi hoang, như ngày ngươi mới nhập môn.", "Thân này chịu được lôi kiếp hay không, hôm nay biết. Đi đi, đừng nghĩ nhiều."], ["Vẫn đứng vững như ngày đầu, mà sức thì gấp mấy lần. Thân này qua được kiếp.", "Viên Hồi Xuân Đan cầm theo. Lên trời rồi nhớ: ngã thì đứng dậy. Môn chờ ngươi về."]], "q_mon_kim_cang_7": [["Kim Cang Môn mừng đệ tử Trúc Cơ bằng cách của môn: đấu 1 vương thú mang hình Sơn Quân.", "Sơn Quân hồi sinh ở rừng nhà, hoặc Gầm Sơn Hổ Vương trong Đại Sơn. Thắng, môn khắc tên ngươi lên bia đá cổng môn."], ["Tên ngươi đã lên bia đá cổng môn rồi đấy. Trăm năm sau đệ tử nhìn lên sẽ hỏi người đó là ai.", "Thưởng của môn. Thể tu Trúc Cơ — đường Kim Đan của ngươi sẽ đi bằng chính đôi chân này."]], "q_mon_kim_cang_8": [["Đường lên Chi Đỉnh có đoạn sạt đá chắn lối. Dẹp 6 con Lợn Rừng quanh đoạn đường đó.", "Xong rồi cùng dân làng gánh đá mở lại đường. Đường tu không phải chỉ của người tu — người sau còn phải đi."], ["Đường mở rồi, dân làng cảm ơn ngươi rối rít. Đó mới là sức mạnh đáng ghi sổ của Kim Cang Môn.", "Hạt Long Tiên Thảo này một bác tiều phu nhặt được gửi cho ngươi. Gốc của ngươi ở làng — đừng quên."]]}, "tong_doc": {"q_mon_ngu_doc_1": [["Kho độc của giáo cần Độc Tâm Hoa mới. Ra bãi rắn lục làm ổ, hái 3 cây mang về.", "Tay không run mới được chạm vào hoa độc. Ngươi run, ta cho học lại từ đầu."], ["Hoa nguyên, nọc trong cánh không thoát một giọt. Tay ngươi vững hơn ta tưởng.", "Thưởng đây, kèm viên Giải Độc Đan — người của Ngũ Độc Giáo ra ngoài phải mang theo thứ này trước tiên."]], "q_mon_ngu_doc_2": [["Khe Suối Rắn Lục ở Đại Sơn là kho nọc sống của giáo. Dẹp 4 con Rắn Lục Đuôi Đỏ quá dữ gần đường đi.", "Phần còn lại để yên — giáo tự thu nọc theo mùa. Giết bừa là phá kho của chính mình."], ["Đường qua khe suối an toàn rồi. Ngươi biết dừng tay đúng lúc — người dùng độc phải thế.", "Thưởng của giáo. Nhớ: độc trong tay kẻ biết dừng mới là thuốc."]], "q_mon_ngu_doc_3": [["Giáo cho ngươi tự thu 4 cây Độc Tâm Hoa luyện độc công. Hoa phải nguyên, nọc không được thoát.", "Ta đứng xa xem tay ngươi. Còn run một chút thôi là chưa được dùng độc lớn."], ["Bốn cây đều nguyên vẹn. Tay ngươi hết run rồi — độc công của ngươi từ nay mới tính là nhập môn thật.", "Thưởng đây. Sắp phá quan, độc khí trong người phải nghe lời như tay ngươi bây giờ."]], "q_mon_ngu_doc_4": [["Giáo góp cho đoàn săn thứ vũ khí lặng lẽ nhất: độc săn vương, tẩm từ Độc Tâm Hoa. Thu 4 cây tốt nhất về cho ta.", "Dặn trước: độc này chỉ dùng cho con vương. Dùng bừa vào việc khác, ta tự tay phế độc công của ngươi."], ["Hoa đủ tốt, độc săn vương tẩm xong rồi. Đoàn săn có thêm một phần thắng không ai thấy được.", "Yêu Đan Cấp 2 — phần giáo chia. Giữ cho lò Trúc Cơ Đan của ngươi."]], "q_mon_ngu_doc_5": [["Mẻ Trúc Cơ Đan cần một vị dược dẫn cay độc để kéo dược lực vào đan. Giáo giao ngươi thu 3 cây Độc Tâm Hoa tốt nhất.", "Liều lượng của vị này là mạng người. Hoa dập một cánh là bỏ — đừng tiếc."], ["Ba cây đều đạt. Vị dược dẫn của mẻ đan ngươi đã có phần của giáo trong đó.", "Thêm 2 tai Linh Chi giáo góp. Người đời gọi giáo là độc — kệ họ. Việc cứu người bằng độc, giáo làm từ lâu rồi."]], "q_mon_ngu_doc_6": [["Lôi kiếp đánh người cháy xém, độc khí trong đất bốc lên theo. Hái 5 cây Thảo Dược về, ta chuẩn bị thuốc giải và thuốc trị thương cho ngày ngươi về.", "Chuẩn bị cho ngày trở về còn quan trọng hơn chuẩn bị cho ngày đi. Nhớ lấy câu này."], ["Dược đủ rồi. Thuốc giải đã sắc sẵn, để ở kho — ngày ngươi về là có ngay.", "Viên Giải Độc Đan này mang theo bên người. Lên trời cho cẩn thận, giáo không muốn mất người."]], "q_mon_ngu_doc_7": [["Giáo cử đệ tử Trúc Cơ đầu tiên vào sâu Đại Sơn hành độc: dẹp 6 con Rắn Lục Đuôi Đỏ ở khe suối và phế tích.", "Mở đường cho giáo thu nọc mùa mới. Từ nay vùng sâu đó là đất của ngươi đi thay giáo."], ["Đường thu nọc mở rồi. Đệ tử Trúc Cơ của Ngũ Độc Giáo — danh này từ nay người trong vùng sẽ nhắc tới.", "Thưởng của giáo. Độc của ngươi giờ cứu được nhiều người hơn hại được — giữ nó như vậy."]], "q_mon_ngu_doc_8": [["Giáo nghe nói trên Vân Hải có loài hoa độc chưa từng ghi sổ. Người của giáo nghe vậy là ngứa tay.", "Trước hết thu 5 cây Độc Tâm Hoa ở đất cũ làm mẫu đối chiếu, mang về cho ta. Có mẫu cũ mới nhận ra mẫu mới."], ["Mẫu đối chiếu đủ rồi. Ngày ngươi lên Vân Hải, mắt ngươi là sổ độc của giáo mang theo.", "Hạt Long Tiên Thảo này ta đổi được từ một thương nhân — thứ này trên Vân Hải nhiều, giữ làm mẫu trước."]]}, "tong_am": {"q_mon_huyen_am_1": [["Việc đầu tiên Huyền Âm Cung giao cho ngươi là một việc tình cảm: mang tiếng đàn nhập môn về quán trọ làng Thanh Khê.", "Đàn cho Hoa nương và khách đi đường nghe một khúc yên lòng. Đàn của cung này trước hết là để yên lòng người."], ["Khách trong quán nghe đàn của ngươi mà yên hẳn một buổi chiều. Hoa nương gửi lời khen.", "Thưởng nhập cung đây. Nhớ: đàn hay không ở tay nhanh, ở lòng người nghe được yên."]], "q_mon_huyen_am_2": [["Sau những chuyến vào Đại Sơn, thương binh cần thuốc an thần. Hái 4 cây Thanh Tâm Thảo mang về cho ta.", "Cung sẽ sắc kèm khúc đàn an thần — thuốc yên một nửa, đàn yên một nửa."], ["Thảo đủ tươi. Đêm nay thương binh sẽ ngủ được một giấc trọn.", "Thưởng của cung. Ngươi hái dược mà cũng nhẹ nhàng như người của cung này vậy."]], "q_mon_huyen_am_3": [["Trước ngày phá quan, cung bắt đệ tử ngồi đàn tĩnh tâm đủ một tuần hương: tích 100 tu vi theo nhịp đàn của ta.", "Tâm loạn một nhịp là đàn sai một nốt. Ta nghe được hết đấy — đừng giấu."], ["Một tuần hương không sai một nhịp. Tâm ngươi đã tĩnh như mặt nước trong giếng cổ ngày yên.", "Thưởng đây. Mang cái tĩnh này vào quan ải phía trước — nó quý hơn đan dược."]], "q_mon_huyen_am_4": [["Đoàn săn lên đường cần một khúc đàn tiễn. Về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc an hồn cho những người từng ngã xuống vì thú dữ.", "Để đoàn nhớ mình săn vì ai. Đàn mà không có lòng, người nghe biết ngay."], ["Quán trọ lặng đi một lúc lâu sau khúc đàn của ngươi. Đoàn săn lên đường với cái đầu cúi thấp và lòng vững.", "Yêu Đan Cấp 2 — phần cung chia cho ngươi. Để dành cho lò Trúc Cơ Đan nhé."]], "q_mon_huyen_am_5": [["Người luyện Trúc Cơ Đan phải tĩnh tâm ba ngày canh lò. Cung giao ngươi hái 5 cây Thanh Tâm Thảo sắc nước an thần.", "Cho người canh lò — trong đó có chính ngươi. Đừng nghĩ việc này nhỏ, ba ngày canh lò là ba ngày thử lòng."], ["Thảo đủ rồi. Nước an thần đã sắc, lò của ngươi có cung canh cùng phần tĩnh lặng.", "Thêm 2 tai Linh Chi cung góp vào lò. Lên cao đến đâu cũng phải giữ được một góc lòng yên như thế này."]], "q_mon_huyen_am_6": [["Đêm trước ngày độ kiếp, về quán trọ làng Thanh Khê gặp Hoa nương, đàn khúc tĩnh tâm cho cả quán nghe.", "Người sắp bước lên trời phải nhớ tiếng người dưới đất. Đó là lệ cuối cùng của cung dành cho ngươi."], ["Cả quán im lặng nghe ngươi đàn. Có người khóc — không phải buồn, là yên lòng.", "Viên Hồi Xuân Đan này mang theo. Thiên lôi có dữ, dưới đất vẫn có tiếng đàn chờ ngươi về."]], "q_mon_huyen_am_7": [["Huyền Âm Cung có lệ: đệ tử Trúc Cơ đầu tiên phải đàn một khúc trên mây cho cả vùng nghe.", "Ngươi dẫn khí tích 150 tu vi theo đàn — tiếng đàn theo linh khí mà đi xa, ai ở dưới cũng nghe được."], ["Hôm đó cả vùng Thanh Khê ngẩng đầu lên trời. Người ta nói nghe tiếng đàn mà lòng yên lạ thường.", "Thưởng của cung. Từ nay tiếng đàn của ngươi không còn chỉ của một quán trọ nữa."]], "q_mon_huyen_am_8": [["Trước chuyến đi xa nhất đời tu, về làng gặp trưởng làng Trần Đức. Đàn cho làng nghe một khúc, và hứa ngày về.", "Kim Đan ở trên mây, mà gốc của ngươi ở dưới đất này. Cung dạy ngươi điều đó sau cùng, mà là điều đầu tiên phải nhớ."], ["Trưởng làng nắm tay ngươi lâu lắm. Cả làng sẽ chờ khúc đàn ngày ngươi trở về.", "Hạt Long Tiên Thảo này cung giao ngươi giữ. Đi xa đến đâu, đường về vẫn bắt đầu từ một lời hứa."]]}, "tho_san_ha": {"q_chinh_20": [["Đường mòn lại có sói kéo bầy chặn người rồi — lần này chúng bạo hơn hẳn, như có linh khí lạ xúi giục trong rừng.", "Ngươi dẹp 5 con Sói Rừng dọc đường mòn cho ta. Đường yên thì làng mới yên, bãi tuyển mới có người qua lại."], ["Đường mòn sạch bầy sói. Mắt ngươi giờ nhìn rừng khác hẳn hồi mới vào nghề săn.", "Viên Yêu Đan Cấp 1 này rơi từ con sói đầu đàn — ta lượm được lúc dọn đường. Của ngươi đấy."]], "q_chinh_22": [["Ta nói điều giữ kín mười năm nay: vương thú trấn núi sống đủ trăm năm sẽ kết Yêu Đan Cấp 3 trong bụng.", "Thứ đó là nguyên liệu cốt lõi của Trúc Cơ Đan — không có nó, không ai trong vùng này lên được Trúc Cơ. Ngươi phải hạ 1 vương thú mang hình Sơn Quân: con cũ hồi sinh ở sào huyệt trong rừng nhà, hoặc Gầm Sơn Hổ Vương ở Hang Hổ Gầm trong Đại Sơn."], ["Ngươi... hạ được vương thú thật rồi. Viên Yêu Đan Cấp 3 trong bụng nó đây — ta xử lý sạch cho ngươi.", "Giữ như giữ mạng. Cả vùng này mấy chục năm mới thấy một viên. Đường lên Trúc Cơ của ngươi bắt đầu từ viên đan này."]]}, "dai_phu": {"q_chinh_21": [["Ta bắt mạch cho ngươi rồi. Nền thì có, mà khí còn nổi — tu vi tích chưa đủ sâu.", "Trước khi tông môn giao việc lớn, ngươi tự phá thêm một quan nữa cho ta xem. Đột phá thành công một lần, bằng chính sức mình. Ta ở đây chờ tin."], ["Khí đã trầm, mạch đã ổn. Giờ thì ta yên tâm kê đơn lớn cho ngươi rồi.", "Viên Ngưng Khí Đan này ta cho — uống trước những lần thổ nạp dài. Đi đi, đường của ngươi còn dài lắm."]]}, "hoc_tro": {"q_chinh_23": [["Anh... ngươi tới rồi! Thầy Lý dặn em chờ ngươi ở đây từ sáng.", "Thầy nói người đã chạm tay vào Yêu Đan Cấp 3 thì phải nghe thầy dặn về phương Trúc Cơ Đan — phương đan dẫn kiếp, chỉ truyền cho người sắp dùng tới. Tới hiệu thuốc gặp thầy ngay đi."], ["Thầy đã truyền phương cho ngươi rồi phải không? Em thấy thầy cười cả buổi chiều.", "Thầy còn gửi ngươi Thanh Linh Tủy với Ngọc Tủy Chi trong kho nữa. Học trò của thầy chưa ai đi xa được như ngươi đâu."]]}, "giu_mieu": {"q_chinh_24": [["Ngươi tới đúng lúc lắm. Giữa trưa nay, giếng cổ lại phát sáng — mà lần này khác hẳn những lần trước.", "Mặt nước nứt một vệt sáng thẳng đứng, như vết rách trên trời phản chiếu xuống đáy giếng. Bà già này coi miếu mấy chục năm chưa từng thấy. Về làng báo ngay cho trưởng làng Trần Đức từng điều ngươi nghe ở đây."], ["Trưởng làng đã cho người canh giếng cả đêm. Ngươi làm đúng lắm — chuyện này không giấu được, cũng không nên giấu.", "Bà có linh cảm những năm tới núi này không yên. Ngươi tu cho vững vào — làng còn trông vào lớp trẻ các ngươi."]]}};
    Object.keys(ARC_DIA).forEach(function (npc) {
      var d = STORY.DIALOGUE[npc];
      if (!d) return;
      d.quest = d.quest || {};
      d.turnin = d.turnin || {};
      Object.keys(ARC_DIA[npc]).forEach(function (qid) {
        d.quest[qid] = ARC_DIA[npc][qid][0];
        d.turnin[qid] = ARC_DIA[npc][qid][1];
      });
    });
  })();
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
  else if (typeof window !== 'undefined') window.PNT_STORY = STORY;
})();
