#!/usr/bin/env bash
# sync-staging.sh — Đồng bộ BẢN RUNTIME của game "Phàm Nhân Tu Đạo" từ thư mục
# nguồn (nơi các team đang làm việc) sang thư mục staging deploy.
#
# Chạy:  bash ~/workspace/game-pham-nhan-deploy/sync-staging.sh
# Kết quả: staging = bản sao SẠCH, mới nhất của đúng các file game cần lúc chạy
# (index.html + js/ + assets runtime). Mọi file khác của nguồn (previews/,
# tmp/, assets-src/, docs/, tools/, test-smoke.js...) KHÔNG được chép sang.
# Các file quản trị trong staging (script này, check-staging.js, DEPLOY-PLAN.md,
# .git) được bảo vệ, không bị xoá khi đồng bộ.
set -euo pipefail

SRC="$HOME/workspace/game-pham-nhan/"
DST="$HOME/workspace/game-pham-nhan-deploy/"

# Thư mục con của assets/ mà code game thật sự nạp lúc chạy (đã kiểm bằng cách
# quét mọi tham chiếu "assets/..." trong js/*.js + manifest nhúng trong các
# file *-ai.js). hero-realms-ai/md: loader js/realm-costumes.js đang được team
# trang phục cảnh giới viết (index.html đã trỏ sẵn) — chép kèm để khi loader
# xong là đủ file ngay.
ASSET_DIRS=(
  hero-ai hero-md
  hero-realm hero-realm-md
  hero-gem hero-gem-md
  hero-realms-ai hero-realms-md
  monsters-ai monsters-md
  npcs-ai npcs-md
  pets-ai pets-md
  costumes-ai costumes-md
  artifacts-ai artifacts-md
  yeu-dan-ai yeu-dan-md
  herb-icons-ai herb-icons-md
  talisman-icons-ai talisman-icons-md
  manual-icons-ai manual-icons-md
  origin-icons-ai origin-icons-md
  looks
)

ARGS=(
  -a --delete --delete-excluded
  --filter='P /DEPLOY-PLAN.md'
  --filter='P /sync-staging.sh'
  --filter='P /check-staging.js'
  --filter='P /.git'
  --filter='P /.git/**'
  --include='/index.html'
  --include='/js/'
  --include='/js/***'
  --include='/assets/'
  --include='/assets/*.png'
)
for d in "${ASSET_DIRS[@]}"; do
  ARGS+=(--include="/assets/$d/***")
done
ARGS+=(--exclude='*')

rsync "${ARGS[@]}" "$SRC" "$DST"

echo "== Staging sau đồng bộ =="
echo "Files: $(find "$DST" -type f -not -path '*/.git/*' | wc -l)"
du -sh --exclude=.git "$DST"
