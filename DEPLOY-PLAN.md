# KẾ HOẠCH DEPLOY — "Phàm Nhân Tu Đạo" lên Render (CHUẨN BỊ — chưa push, chưa tạo site)

Cập nhật: 2026-10-30 ~06:45 +07. Thư mục staging này là bản sao runtime sạch của
`~/workspace/game-pham-nhan/`, sẵn sàng để parent tạo repo + push + tạo Render site.
Nguồn game VẪN đang được các team khác chỉnh sửa — **bắt buộc chạy lại sync ngay
trước khi push** (xem mục 3).

## 1. Staging gồm những gì (chỉ file runtime)

- `index.html` — điểm vào duy nhất; CSS nhúng trong file; font Be Vietnam Pro nạp từ Google Fonts.
- `js/` — toàn bộ 41 file js hiện có (index.html nạp 42 script — xem thiếu sót ở mục 5).
- `assets/*.png` ở thư mục gốc assets — 33 ảnh nền: map1–map14 (v7, riêng map1 có cả v5),
  15 nền bí cảnh `realm-*-bg.png`, `dai-hoi-bg-v7.png`, `dong-phu-bg.png`.
- 21 thư mục con của assets mà code thật sự nạp (đã quét mọi tham chiếu trong js):
  `hero-ai`, `hero-md`, `hero-realm`, `hero-realm-md`, `hero-gem`, `hero-gem-md`,
  `hero-realms-ai`, `hero-realms-md`, `monsters-ai`, `monsters-md`, `npcs-ai`, `npcs-md`,
  `pets-ai`, `pets-md`, `costumes-ai`, `costumes-md`, `artifacts-ai`, `artifacts-md`,
  `yeu-dan-ai`, `yeu-dan-md`, `looks`.
- File quản trị (không thuộc game, để ở gốc staging): `sync-staging.sh`,
  `check-staging.js`, `DEPLOY-PLAN.md` này. Khi push có thể để nguyên (vô hại,
  không file nào được index.html nạp) hoặc thêm vào `.gitignore` — parent quyết.

## 2. KHÔNG deploy (đã loại khỏi staging)

- `previews/` (117M ảnh xem trước), `tmp/` (327M), `assets-src/` (190M nguồn thiết kế AI),
  `docs/`, `tools/`, `test-smoke.js` (609K), log `tmp-rc-pilot*.log`.
- Trong `assets/`: file `hero-realm-audit.json` (báo cáo audit, không phải runtime)
  và 2 nền cũ không còn được code tham chiếu (`map2-bg-v6.png`, `map3-bg-v6.png` —
  thực tế script chép mọi `assets/*.png` ở gốc cho an toàn nên 2 file này vẫn có mặt,
  dung lượng không đáng kể).

## 3. Lệnh đồng bộ

```bash
bash ~/workspace/game-pham-nhan-deploy/sync-staging.sh   # rsync có --delete, idempotent
node ~/workspace/game-pham-nhan-deploy/check-staging.js  # kiểm 3 lớp, xem mục 5
```

Mỗi lần chạy, staging = bản sao sạch mới nhất của runtime nguồn (file quản trị và
`.git` trong staging được bảo vệ khỏi `--delete`).

## 4. Git + GitHub (đã kiểm chứng 2026-10-30)

- git 2.43.0 có sẵn. Thư mục nguồn game KHÔNG phải git repo; staging sẽ là repo mới.
- SSH GitHub qua cấu hình bền vững `/home/hatch/.ssh/config_github` (ProxyCommand lấy
  proxyauth động từ `$HTTPS_PROXY`, qua ssh.github.com:443): **DÙNG ĐƯỢC** —
  `git ls-remote git@github.com:traxanhnet6/tu-tien-online.git HEAD` trả về
  `c9bcd95d9ad2d53a10908d9601c8e26c39b8ce43`.
- Cách push sau này (giống repo cũ):
  `GIT_SSH_COMMAND="ssh -F /home/hatch/.ssh/config_github" git push ...`
- Repo đề xuất: **`traxanhnet6/pham-nhan-tu-dao`** — đã kiểm: CHƯA tồn tại
  (ls-remote khi đã xác thực trả "Repository not found").
  Tạo repo: parent tạo qua giao diện GitHub bằng trình duyệt (đăng nhập traxanhnet6 →
  New repository → tên `pham-nhan-tu-dao`, Public như repo cũ, KHÔNG tick README/.gitignore
  để push bản staging lên sạch). Không tạo được bằng SSH/git thuần.

## 5. Kiểm chứng staging (đã chạy)

- `check-staging.js`: Lớp 3 đối chiếu số file nguồn↔staging **lệch 0** (staging khớp
  100% nguồn tại thời điểm sync). Lớp 1+2 còn báo 4 mục — **cả 4 đều là vấn đề ở
  NGUỒN, không phải lỗi đồng bộ**:
  1. `js/realm-costumes.js` — index.html đã trỏ nhưng file CHƯA có trong nguồn:
     team trang phục cảnh giới đang viết (kèm thư mục `assets/hero-realms-ai/md`
     đã có sẵn và đã được chép vào staging). Thiếu file này trình duyệt chỉ 404
     1 script, game vẫn chạy (đã test HTTP: 41/42 script trả 200).
  2. `assets/realm-dinh-ky-bg.png` + `assets/realm-ky-ngo-bg.png` — `secret-realms.js`
     tham chiếu nhưng file chưa từng tồn tại trong nguồn (2 nền bí cảnh định kỳ/kỳ ngộ
     chưa được vẽ; game đang chạy thiếu 2 nền này ngay cả ở bản nguồn).
  3. `assets/looks/nvXX.png` — báo giả: chỉ là chữ trong comment ở `js/game.js:2257`.
- Test server tĩnh (python http.server trên staging): `index.html` 200, 41/42 script
  200, ảnh nền mẫu 200.
- Lưu ý sống: lúc chuẩn bị, team NV60 đang ghi file vào `assets/hero-ai`/`hero-md`
  theo thời gian thực (số file thay đổi trong vài chục giây). Sync lần cuối phải
  chạy SAU khi các team chốt file.

## 6. Dung lượng — VẤN ĐỀ LỚN CẦN CHỐT TRƯỚC KHI PUSH

- Staging hiện tại: **12.023 file, 1.516.234.521 byte (~1,45 GiB)**, trong đó
  11.963 file PNG. Không file nào > 20MB (giới hạn 100MB/file của GitHub: an toàn).
- Thành phần nặng nhất: `pets-ai` 410M, `hero-realm` 216M, `monsters-ai` 144M,
  `pets-md` 125M, `costumes-ai` 112M, `hero-ai` 94M, `hero-realm-md` 75M, `hero-md` 51M.
  Toàn bộ thư mục `*-ai` (mức đồ họa Cao) = 792M; toàn bộ `*-md` (Trung bình) = 342M.
- Đánh giá: repo ~1,45 GiB **vượt khuyến nghị 1 GiB của GitHub** — push lần đầu sẽ
  rất nặng/chậm, Render clone cả repo mỗi lần deploy. Chưa tới mức bị chặn cứng,
  nhưng parent/Bui nên cân nhắc 1 trong các hướng sau (chưa làm, chờ quyết):
  - (a) Push nguyên trạng — đơn giản nhất, chấp nhận nặng.
  - (b) Bỏ mức Trung bình (`*-md`, −342M → còn ~1,17 GiB): người chơi mức Thấp dùng
      lưới pixel trong code nên vẫn chơi được; mất riêng mức Trung bình.
  - (c) Khi team trang phục cảnh giới xong, nếu `hero-realms-*` thay thế hẳn lớp phủ
      cũ thì bỏ `hero-realm` + `hero-realm-md` (−291M nữa → ~880M nếu kết hợp (b)).
  - (d) Git LFS cho `assets/**/*.png` — cần kiểm chứng Render có pull LFS khi deploy
      static site không (chưa kiểm chứng).
  - (e) Nén lại PNG hàng loạt (pngquant/oxipng) — giảm sâu nhưng phải kiểm chất lượng.

## 7. Các bước còn lại cho parent

1. Chờ các team đang chạy chốt file (đặc biệt: `js/realm-costumes.js` của team trang
   phục cảnh giới; team NV60 ghi hero-ai/hero-md). Nếu muốn xử lý luôn 2 nền bí cảnh
   thiếu (`realm-dinh-ky-bg.png`, `realm-ky-ngo-bg.png`) thì giao team mỹ thuật vẽ.
2. Chốt phương án dung lượng ở mục 6 (nguyên trạng / (b) / (c) / (d) / (e)).
3. Chạy lại `sync-staging.sh` + `check-staging.js` — đạt: lớp 3 lệch 0, lớp 1 chỉ
   còn (hoặc hết) mục realm-costumes.
4. Tạo repo `traxanhnet6/pham-nhan-tu-dao` trên GitHub (trình duyệt, theo mục 4).
5. Trong staging: `git init` → `git add -A` → commit → `git branch -M main` →
   thêm remote SSH → push bằng `GIT_SSH_COMMAND="ssh -F /home/hatch/.ssh/config_github"`.
6. Tạo Render Static Site từ repo đó: Build Command để trống, Publish Directory = `.`
   (gốc repo). Manual Deploy → chờ "Deploy succeeded | Live".
7. Kiểm chứng live như chuẩn cũ: curl trang thật, đối chiếu vài file (index.html,
   js/game.js, 1 ảnh nền) giữa bản live và staging; mở thử game, đăng kí/đăng nhập/
   tạo nhân vật chạy được rồi mới báo Bui link chơi.
