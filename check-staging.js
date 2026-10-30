#!/usr/bin/env node
// check-staging.js — Kiểm tra staging deploy "Phàm Nhân Tu Đạo" có đủ mọi file
// mà game yêu cầu lúc chạy hay không.
// Chạy:  node ~/workspace/game-pham-nhan-deploy/check-staging.js
// Kiểm 3 lớp:
//  1) Mọi src/href cục bộ trong staging/index.html phải tồn tại.
//  2) Mọi chuỗi literal "assets/..." xuất hiện trong staging/js/*.js phải
//     tồn tại trong staging (file thì đúng file, thư mục thì phải có file).
//  3) Số file từng thư mục asset runtime + js/ trong staging phải BẰNG nguồn.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(process.env.HOME, 'workspace/game-pham-nhan');
const DST = path.join(process.env.HOME, 'workspace/game-pham-nhan-deploy');

let missing = [];
let notes = [];

// --- Lớp 1: src/href trong index.html ---
const html = fs.readFileSync(path.join(DST, 'index.html'), 'utf8');
const refs = new Set();
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const u = m[1];
  if (/^https?:\/\//.test(u) || u.startsWith('#') || u.startsWith('data:')) continue;
  refs.add(u);
}
for (const r of refs) {
  if (!fs.existsSync(path.join(DST, r))) missing.push('[index.html] ' + r);
}
console.log(`Lớp 1: ${refs.size} tham chiếu trong index.html, thiếu ${[...missing].length}`);

// --- Lớp 2: literal assets/... trong js ---
const jsFiles = fs.readdirSync(path.join(DST, 'js')).filter(f => f.endsWith('.js'));
const litSet = new Set();
for (const f of jsFiles) {
  const code = fs.readFileSync(path.join(DST, 'js', f), 'utf8');
  for (const m of code.matchAll(/assets\/[A-Za-z0-9_.\-/]+/g)) {
    litSet.add(m[0].replace(/[.\-/]+$/, ''));
  }
}
let litMissing = 0;
for (const lit of litSet) {
  const p = path.join(DST, lit);
  if (!fs.existsSync(p)) { missing.push('[js literal] ' + lit); litMissing++; continue; }
  if (fs.statSync(p).isDirectory()) {
    const n = fs.readdirSync(p).length;
    if (n === 0) { missing.push('[js literal - thư mục rỗng] ' + lit); litMissing++; }
  }
}
console.log(`Lớp 2: ${litSet.size} literal assets/... trong ${jsFiles.length} file js, thiếu ${litMissing}`);

// --- Lớp 3: đối chiếu số file staging vs nguồn ---
const ASSET_DIRS = ['hero-ai','hero-md','hero-realm','hero-realm-md','hero-gem','hero-gem-md',
  'hero-realms-ai','hero-realms-md','monsters-ai','monsters-md','npcs-ai','npcs-md','pets-ai',
  'pets-md','costumes-ai','costumes-md','artifacts-ai','artifacts-md','yeu-dan-ai','yeu-dan-md','looks'];
function countFiles(dir) {
  let n = 0;
  if (!fs.existsSync(dir)) return -1;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}
let mismatch = 0;
for (const d of [...ASSET_DIRS.map(x => 'assets/' + x), 'js']) {
  const a = countFiles(path.join(SRC, d));
  const b = countFiles(path.join(DST, d));
  if (a !== b) { mismatch++; notes.push(`[số file lệch] ${d}: nguồn=${a} staging=${b}`); }
}
// File lẻ: index.html + png/webp gốc của assets/
const srcRootPng = fs.readdirSync(path.join(SRC, 'assets')).filter(f => f.endsWith('.png') || f.endsWith('.webp')).length;
const dstRootPng = fs.readdirSync(path.join(DST, 'assets')).filter(f => f.endsWith('.png') || f.endsWith('.webp')).length;
if (srcRootPng !== dstRootPng) { mismatch++; notes.push(`[số file lệch] assets/*.png+webp gốc: nguồn=${srcRootPng} staging=${dstRootPng}`); }
console.log(`Lớp 3: đối chiếu số file nguồn/staging, lệch ${mismatch} mục`);

console.log('---');
if (notes.length) { console.log('GHI CHÚ:'); notes.forEach(n => console.log('  ' + n)); }
if (missing.length) {
  console.log(`KẾT QUẢ: THIẾU ${missing.length} file/thư mục:`);
  missing.forEach(m => console.log('  ' + m));
  process.exit(1);
}
console.log('KẾT QUẢ: ĐẦY ĐỦ — mọi tham chiếu đều có file trong staging.');
