// ============================================================
// TÂM MA KIẾP — mục 7 trong docs/auto-build-queue.md
// (lệnh đứng Bui 23:15 ngày 2026-10-29).
//
// MÓC TRUYỆN: lôi kiếp ở js/realms.js mới là kiếp NGOÀI (sét đánh
// thân xác). Từ chương 1 story-bible mục 2 đã gieo luật "đột phá cần
// tâm cảnh vững", và mục 5 chốt động lực "tu tiên là để bảo vệ người
// dưới đất" — Tâm Ma Kiếp là cửa TRONG tâm khi đột phá ĐẠI cảnh giới:
// người chơi rơi vào thức hải, đối mặt bản sao của chính mình. Thiên 7
// "Hóa Thần Vấn Đạo" gieo tiếp: tàn niệm Đại Kiếp cũng là gương tối
// của đúng động lực "bảo vệ người của mình" — nên tâm ma ở mọi mốc
// đều chất vấn đúng một câu đó, chỉ khác giọng theo cảnh giới.
//
// LUẬT CHƠI (module ĐỘC LẬP, cùng mẫu js/auction.js / js/companion.js:
// dữ liệu + luật thuần test bằng Node, game.js chỉ nối panel + gọi
// startTribulationFlow sau khi trận thức hải ngã ngũ):
// - CHỈ ở mốc LIÊN cảnh giới (targetRank 2..6, tức Trúc Cơ trở lên):
//   đột phá tiểu giai và Luyện Khí không gặp tâm ma.
// - Tỉ lệ gặp theo cảnh giới đích, tăng dần vì càng lên cao tâm ma
//   càng nặng: Trúc Cơ 35%, Kim Đan 45%, Nguyên Anh 55%,
//   Hóa Thần 65%, Độ Kiếp 75%.
// - ĐÃ GẶP THÌ KHÔNG TRỐN ĐƯỢC BẰNG CÁCH THỬ LẠI: lần đầu lăn trúng,
//   flags.demonPending ghi mốc đích; mọi lần bấm đột phá ở cùng mốc
//   sau đó đều mở lại thức hải cho tới khi trận ngã ngũ (xóa pending).
//   Đóng panel giữa chừng = tạm lui, không mất gì, tâm ma vẫn chờ.
// - TRƯỚC TRẬN là đoạn đối thoại 3 lựa chọn. Chỉ một câu đúng với
//   động lực đã gieo ("bảo vệ người dưới đất"): chọn đúng làm bản
//   sao yếu đi (x0,85), chọn lệch (trường sinh trên tất cả, hoặc sợ
//   mất mà muốn nắm giữ) nuôi tâm ma mạnh lên (x1,10). Lựa chọn sai
//   không phạt trực tiếp — nó chỉ làm trận khó hơn, đúng nghĩa "tâm
//   ma là gương tối của mình".
// - TRẬN THỨC HẢI đấu theo lượt trong panel: bản sao dùng ĐÚNG sheet
//   hero của người chơi (hình) + ĐÚNG chiêu người chơi đã học (số:
//   unlockedList của js/skills.js, hệ số chiêu qua skillDamage), chỉ
//   số co theo người chơi (HP bản sao = 85% HP tối đa của chủ, công
//   = công của chủ, thủ = thủ của chủ, rồi nhân hệ số đối thoại).
//   Người chơi đánh trước mỗi vòng. Chiêu khiên (linh_khien) dựng
//   khiên 35% HP tối đa đỡ đòn sau đó; chiêu có healPct hồi máu theo
//   đúng hệ số đó. Bản sao luôn dùng chiêu sát thương mạnh nhất nó
//   có — nó là mình, nên nó biết chiêu mạnh nhất của mình.
// - THỨC HẢI ĐẤU KHÔNG ĐỘNG TỚI THÂN XÁC: máu trong trận là máu thức
//   hải suy ra từ chỉ số, HP thật ngoài map không đổi, người chơi
//   không thể chết thật ở đây — "thua mất thêm tu vi nhưng không
//   chết hẳn" theo đúng mục 7.
// - KẾT QUẢ (vật dẫn kiếp chưa tiêu hao trước trận, vì
//   startTribulation chỉ gọi sau khi trận xong ở đường thắng — thua
//   tâm ma không làm mất vật dẫn kiếp):
//   + THẮNG: giữ nguyên tu vi, không mất gì thêm, nên điều kiện "tu
//     vi đầy" của lôi kiếp vẫn đạt — bấm "Tiếp tục" là dẫn kiếp ngay.
//     Danh hiệu tâm cảnh "Tâm Như Bàn Thạch" ghi vào flags.demonTitles
//     (1 lần/mốc). Thắng mà đối thoại đúng còn được Ấn Tâm
//     (flags.demonWard): lần gặp tâm ma kế tiếp bản sao yếu đi x0,90
//     (Ấn Tâm tiêu hao khi trận kế bắt đầu) — "tâm cảnh vững hơn cho
//     kiếp sau" theo feature-ideas A1, nhưng gói gọn trong hệ tâm ma,
//     không sửa công thức lôi kiếp ở realms.js.
//   + THUA: mất thêm 10% tu vi hiện có (làm tròn xuống; tu vi không
//     âm). Vì tu vi không còn đầy, điều kiện dẫn kiếp không đạt nữa
//     — người chơi phải thổ nạp bù lại cho đầy rồi bấm đột phá lại
//     (lúc đó tâm ma đã ngã ngũ nên không mở lại, chỉ lăn tỉ lệ mới
//     cho lần gặp sau nếu có). Chết giữa lôi kiếp về sau thì chịu
//     thêm luật lôi kiếp riêng (40–50% tu vi theo realms.js) — hai
//     khoản mất khác nhau, không cộng dồn thành một, và thua tâm ma
//     không bao giờ làm mất vật dẫn kiếp hay làm chết thật.
// - KINH TẾ: Tâm Ma Kiếp KHÔNG cho và KHÔNG trừ Linh Thạch, không
//   vật phẩm, không tạo nguồn mới — docs/economy.md không cần sửa
//   số. Khoản duy nhất là tu vi (đơn vị tu luyện, không phải tiền).
// - 3 LỆNH CỨNG CHUYỂN ĐỘNG: trận thức hải là panel theo lượt, không
//   vẽ nhân vật chạy/nhảy/bay nên không đụng tới sheet chuyển động;
//   bản sao dùng nguyên sheet hero có sẵn, không vẽ mới, không lật
//   gương làm hướng sau giả.
// ============================================================
(function (global) {
  'use strict';
  var L = null, SK = null;
  if (typeof module !== 'undefined' && module.exports) {
    try { L = require('./logic.js'); } catch (e) { L = null; }
    try { SK = require('./skills.js'); } catch (e) { SK = null; }
  } else if (global) {
    L = global.PNT_LOGIC || null;
    SK = global.PNT_SKILLS || null;
  }

  var REALM_NAMES = { 2: 'Trúc Cơ', 3: 'Kim Đan', 4: 'Nguyên Anh', 5: 'Hóa Thần', 6: 'Độ Kiếp' };
  var CHANCES = { 2: 0.35, 3: 0.45, 4: 0.55, 5: 0.65, 6: 0.75 };
  var LOSE_LOSS_PCT = 10; // thua tâm ma: mất thêm 10% tu vi hiện có
  var CLONE_HP_PCT = 0.85; // HP bản sao = 85% HP tối đa của chủ
  var DIALOG_RIGHT_MULT = 0.85, DIALOG_WRONG_MULT = 1.10, WARD_MULT = 0.90;
  var TITLE_WIN = 'Tâm Như Bàn Thạch', TITLE_LOSE = 'Ma Niệm Chưa Tan';

  // Biến thể tâm ma theo cảnh giới đích: cùng một câu chất vấn gốc
  // ("ngươi tu vì ai?"), giọng điệu nặng dần theo cảnh giới.
  var VARIANTS = {
    2: { rank: 2, name: 'Tâm Ma Sơ Hiện',
      taunt: '“Ngươi nói tu để bảo vệ làng — hay để làng phải nhớ ơn ngươi? Nhìn kỹ mặt ta đi: ta chính là ngươi lúc thắp hương cầu cho mình được nhớ tới.”' },
    3: { rank: 3, name: 'Tâm Ma Kết Đan',
      taunt: '“Kim đan kết trong ngực, mà trong lòng còn một viên đan khác — viên đan tham. Ngươi giữ linh mạch cho tông, hay giữ cho riêng mình một con đường lên cao?”' },
    4: { rank: 4, name: 'Tâm Ma Phân Thần',
      taunt: '“Nguyên anh đã biết phân thần — vậy thần nào là ngươi thật? Thần ngồi trấn sơn, hay thần đã chán cảnh gánh làng trên vai?”' },
    5: { rank: 5, name: 'Tâm Ma Vấn Đạo',
      taunt: '“Tới Hóa Thần rồi, ngươi vẫn hỏi đạo là gì. Đạo của ngươi là bảo vệ — mà kẻ đánh cắp linh khí năm xưa cũng chỉ muốn cứu người của hắn. Ngươi khác hắn ở chỗ nào? Trả lời ta, đừng trả lời bằng kiếm.”' },
    6: { rank: 6, name: 'Tâm Ma Độ Kiếp',
      taunt: '“Đạo cuối cùng rồi. Phi thăng thì bỏ làng lại, trấn thủ thì bỏ trời lại — chọn đường nào ngươi cũng phản một nửa lời hứa năm xưa. Ta là nửa đó.”' }
  };

  // 3 lựa chọn đối thoại. Chỉ 'bao_ve' đúng với động lực story-bible
  // mục 5 ("bảo vệ người dưới đất", lời bà dặn). Hai câu lệch đều là
  // những lý do thật của con người — nên chúng không bị phạt ngay mà
  // chỉ nuôi tâm ma mạnh lên, đúng nghĩa gương tối.
  var DIALOGUE = [
    { id: 'bao_ve', text: '“Ta tu tiên để bảo vệ người dưới đất — như lời bà dặn, như cả làng đã nuôi ta thành tu sĩ.”', correct: true,
      reply: 'Bản sao khựng lại — câu đó không có kẽ hở cho nó chui vào. Nó yếu đi.' },
    { id: 'truong_sinh', text: '“Ta tu tiên để trường sinh bất tử, đứng trên tất cả — kẻ yếu thì tự lo lấy thân.”', correct: false,
      reply: 'Bản sao cười lớn — tham vọng đó chính là thức ăn của nó. Nó mạnh lên.' },
    { id: 'so_mat', text: '“Ta tu tiên vì sợ mất thêm ai nữa — ta không chịu nổi cảnh làng cháy thêm lần nào.”', correct: false,
      reply: 'Bản sao gật gù — sợ hãi cũng là xiềng xích, chỉ khác tham vọng ở vẻ ngoài. Nó mạnh lên.' }
  ];

  function variantOf(rank) { return VARIANTS[rank] || null; }
  function chanceOf(rank) { return CHANCES[rank] || 0; }
  function realmNameOf(rank) { return REALM_NAMES[rank] || ('cảnh giới ' + rank); }

  function effHp(ch) {
    if (L && typeof L.effMaxHp === 'function') { try { return L.effMaxHp(ch); } catch (e) {} }
    return ch.maxHp || 100;
  }
  function effAtk(ch) {
    if (L && typeof L.effAtk === 'function') { try { return L.effAtk(ch); } catch (e) {} }
    return ch.atk || 9;
  }
  function effDef(ch) {
    if (L && typeof L.effDef === 'function') { try { return L.effDef(ch); } catch (e) {} }
    return ch.def || 2;
  }
  function unlockedDamageSkills(ch) {
    var list = [];
    if (SK && typeof SK.unlockedList === 'function') {
      SK.unlockedList(ch).forEach(function (id) {
        var def = (typeof SK.skillDef === 'function') ? SK.skillDef(id, ch) : null;
        if (def) list.push(def);
      });
    }
    if (!list.length) list.push({ id: 'combo', name: 'Liên Hoàn Kiếm', mult: 1 });
    return list;
  }
  function skillDmg(atkVal, def, rng) {
    if (SK && typeof SK.skillDamage === 'function') return SK.skillDamage(atkVal, def, rng);
    var r = rng ? rng() : Math.random();
    return Math.max(1, Math.round((atkVal + 4) * (def.mult || 1) * (0.9 + r * 0.2)));
  }

  // --- Cửa gặp: pending đã ghi thì luôn gặp, chưa ghi thì lăn tỉ lệ.
  function shouldTrigger(flags, targetRank, rng) {
    if (!VARIANTS[targetRank]) return false;
    if (flags && flags.demonPending === targetRank) return true;
    var r = rng ? rng() : Math.random();
    return r < CHANCES[targetRank];
  }
  // game.js gọi ở cửa đột phá liên cảnh giới. Trả {triggered, variant}.
  // Khi triggered, flags.demonPending = targetRank (ghi chờ tới khi
  // trận ngã ngũ); khi không triggered, không ghi gì cả.
  function beginEncounter(flags, targetRank, rng) {
    if (!VARIANTS[targetRank]) return { triggered: false, variant: null };
    if (shouldTrigger(flags, targetRank, rng)) {
      if (flags) flags.demonPending = targetRank;
      return { triggered: true, variant: VARIANTS[targetRank] };
    }
    return { triggered: false, variant: null };
  }
  function dialogueResult(choiceId) {
    var opt = null;
    DIALOGUE.forEach(function (d) { if (d.id === choiceId) opt = d; });
    if (!opt) return { ok: false, reason: 'bad_choice' };
    return { ok: true, choice: opt, correct: opt.correct,
      cloneMult: opt.correct ? DIALOG_RIGHT_MULT : DIALOG_WRONG_MULT, reply: opt.reply };
  }
  // Ấn Tâm: thắng mà đối thoại đúng thì lần gặp kế bản sao yếu x0,90.
  // Hệ số cuối khi bắt đầu trận = hệ số đối thoại x (Ấn Tâm ? 0,90 : 1),
  // Ấn Tâm tiêu hao ngay khi trận kế bắt đầu (kể cả trận đó thua).
  function effectiveCloneMult(flags, dialogueMult) {
    var m = dialogueMult;
    var ward = !!(flags && flags.demonWard);
    if (ward) { m = Math.round(m * WARD_MULT * 100) / 100; if (flags) flags.demonWard = false; }
    return { mult: m, wardUsed: ward };
  }
  function cloneOf(ch, cloneMult) {
    var skills = unlockedDamageSkills(ch);
    var best = skills[0];
    skills.forEach(function (s) { if ((s.mult || 1) > (best.mult || 1)) best = s; });
    var maxHp = Math.max(1, Math.round(effHp(ch) * CLONE_HP_PCT * cloneMult));
    return { name: 'Tâm Ma của ' + (ch.name || 'ngươi'), maxHp: maxHp, hp: maxHp,
      atk: Math.max(1, Math.round(effAtk(ch) * cloneMult)),
      def: effDef(ch), skills: skills, bestSkill: best, cloneMult: cloneMult };
  }
  function newDuel(ch, cloneMult, opts) {
    opts = opts || {};
    var clone = cloneOf(ch, cloneMult);
    return { playerName: ch.name || 'ngươi', playerMaxHp: effHp(ch), playerHp: effHp(ch),
      playerAtk: effAtk(ch), playerDef: effDef(ch), clone: clone,
      skills: unlockedDamageSkills(ch), round: 0, shield: 0, log: [], done: false, winner: null };
  }
  // Một vòng đấu: người chơi đánh trước bằng skillId (chiêu đã học,
  // hoặc 'combo' = đánh thường). Chiêu khiên/heal không gây sát thương
  // mà dựng khiên/hồi máu. Bản sao còn sống thì đánh trả bằng chiêu
  // mạnh nhất của nó. Trả bản ghi vòng đó.
  function duelStep(st, skillId, rng) {
    if (!st || st.done) return { ok: false, reason: 'duel_over' };
    var def = null;
    st.skills.forEach(function (s) { if (s.id === skillId) def = s; });
    if (!def) def = { id: 'combo', name: 'Liên Hoàn Kiếm', mult: 1 };
    st.round += 1;
    var rec = { round: st.round, playerSkill: def.name, playerDmg: 0, cloneSkill: null, cloneDmg: 0,
      playerHpAfter: st.playerHp, cloneHpAfter: st.clone.hp };
    if (def.mech === 'shield' || def.shieldPct) {
      st.shield = Math.round(st.playerMaxHp * ((def.shieldPct || 35) / 100));
      rec.playerSkill += ' (dựng khiên ' + st.shield + ')';
    } else if (def.healPct) {
      var heal = Math.round(st.playerMaxHp * def.healPct);
      st.playerHp = Math.min(st.playerMaxHp, st.playerHp + heal);
      rec.playerSkill += ' (hồi ' + heal + ' Máu)';
    } else {
      var dmg = skillDmg(st.playerAtk, def, rng);
      st.clone.hp = Math.max(0, st.clone.hp - dmg);
      rec.playerDmg = dmg;
    }
    rec.cloneHpAfter = st.clone.hp;
    if (st.clone.hp <= 0) {
      st.done = true; st.winner = 'player';
      st.log.push(rec); rec.playerHpAfter = st.playerHp;
      return { ok: true, rec: rec, done: true, winner: 'player' };
    }
    var cdmg = skillDmg(st.clone.atk, st.clone.bestSkill, rng);
    var absorbed = 0;
    if (st.shield > 0) { absorbed = Math.min(st.shield, cdmg); st.shield -= absorbed; cdmg -= absorbed; }
    st.playerHp = Math.max(0, st.playerHp - cdmg);
    rec.cloneSkill = st.clone.bestSkill.name; rec.cloneDmg = cdmg + absorbed;
    rec.cloneAbsorbed = absorbed; rec.playerHpAfter = st.playerHp;
    st.log.push(rec);
    if (st.playerHp <= 0) { st.done = true; st.winner = 'clone'; return { ok: true, rec: rec, done: true, winner: 'clone' }; }
    return { ok: true, rec: rec, done: false, winner: null };
  }
  // Mô phỏng trọn trận cho test/cân bằng: policy(st) trả skillId mỗi
  // vòng. Trả {winner, rounds, log}.
  function runDuel(ch, cloneMult, policy, rng) {
    var st = newDuel(ch, cloneMult);
    var guard = 0;
    while (!st.done && guard < 200) {
      guard += 1;
      var sid = (typeof policy === 'function') ? policy(st) : 'combo';
      var r = duelStep(st, sid, rng);
      if (!r.ok) break;
    }
    return { winner: st.winner, rounds: st.round, log: st.log, state: st };
  }
  // Ngã ngũ trận: xóa pending, trừ tu vi nếu thua, ghi danh hiệu
  // 1 lần/mốc, ghi Ấn Tâm nếu thắng mà đối thoại đúng. Không động
  // tới Linh Thạch, không động tới HP thật ngoài map.
  function resolveDuel(ch, flags, duel, dialogue, targetRank) {
    if (flags) flags.demonPending = null;
    var win = !!(duel && duel.winner === 'player');
    var lostTuVi = 0;
    if (!win) {
      lostTuVi = Math.floor((ch.tuVi || 0) * LOSE_LOSS_PCT / 100);
      ch.tuVi = Math.max(0, (ch.tuVi || 0) - lostTuVi);
    }
    if (flags) {
      if (!flags.demonTitles) flags.demonTitles = [];
      var title = win ? TITLE_WIN : TITLE_LOSE;
      var has = flags.demonTitles.some(function (t) { return t.title === title && t.rank === targetRank; });
      if (!has) flags.demonTitles.push({ title: title, outcome: win ? 'win' : 'lose', rank: targetRank || null });
      if (win && dialogue && dialogue.correct) flags.demonWard = true;
    }
    return { ok: true, win: win, lostTuVi: lostTuVi, title: win ? TITLE_WIN : TITLE_LOSE,
      ward: !!(win && dialogue && dialogue.correct) };
  }
  function titlesOf(flags) { return (flags && flags.demonTitles) ? flags.demonTitles.slice() : []; }
  function hasWard(flags) { return !!(flags && flags.demonWard); }

  var api = { REALM_NAMES: REALM_NAMES, CHANCES: CHANCES, VARIANTS: VARIANTS, DIALOGUE: DIALOGUE,
    LOSE_LOSS_PCT: LOSE_LOSS_PCT, CLONE_HP_PCT: CLONE_HP_PCT,
    TITLE_WIN: TITLE_WIN, TITLE_LOSE: TITLE_LOSE,
    variantOf: variantOf, chanceOf: chanceOf, realmNameOf: realmNameOf,
    shouldTrigger: shouldTrigger, beginEncounter: beginEncounter,
    dialogueResult: dialogueResult, effectiveCloneMult: effectiveCloneMult,
    cloneOf: cloneOf, newDuel: newDuel, duelStep: duelStep, runDuel: runDuel,
    resolveDuel: resolveDuel, titlesOf: titlesOf, hasWard: hasWard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global) global.PNT_DEMON = api;
})(typeof window !== 'undefined' ? window : globalThis);
