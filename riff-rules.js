// 리프 규칙: 악기·주법별로 코드 진행을 "열"(한 칸씩 치는 음)로 바꿔요.
// 열 하나 = { chord: 코드 이름(바뀌는 칸만), mark: 표시, acc: 박 첫 칸인지,
//            notes: {줄번호: 프렛} (줄 악기), keys: [{m, hand}] (피아노),
//            ev: [{key, midi, vel, ring(칸 수, 없으면 길게), delay(초), mute, pan}] (소리) }

// 기타 스트로크 패턴 (D = 다운 ↓, U = 업 ↑, . = 쉼) — r: 한 박을 몇 칸으로 나누는지
const STRUM_PATTERNS = [
  { n: '칼립소 (포크 기본)', d: '↓ ↓↑ ↑↓↑ — 통기타 반주에서 가장 많이 쓰는 패턴', 4: { r: 2, p: 'D.DU.UDU' }, 3: { r: 2, p: 'D.DUDU' }, 6: { r: 1, p: 'D.DUDU' } },
  { n: '8비트 다운업', d: '↓↑↓↑ 고르게 — 록·팝 반주의 기본', 4: { r: 2, p: 'DUDUDUDU' }, 3: { r: 2, p: 'DUDUDU' }, 6: { r: 1, p: 'DUDUDU' } },
  { n: '슬로우 고고 (16비트 발라드)', d: '16분음표로 쪼갠 부드러운 발라드 리듬', 4: { r: 4, p: 'D..UD.DUD..UD.DU' }, 3: { r: 4, p: 'D..UD.DUD.DU' }, 6: { r: 2, p: 'D..UD.D..UDU' } },
  { n: '4비트 다운 (록 발라드)', d: '박마다 ↓ 한 번씩 — 가장 쉬운 패턴', 4: { r: 2, p: 'D.D.D.D.' }, 3: { r: 2, p: 'D.D.D.' }, 6: { r: 1, p: 'D..D..' } },
];
// 기타 주법 패턴: C = 코드, R = 근음, F = 5도, x = 뮤트
const GUITAR_PATTERNS = { pw: { 4: 'CCCCCCRF', 3: 'CCCCRF', 6: 'CCCRCF' }, funk: { 4: 'CxCCxCxC', 3: 'CxCxCC', 6: 'CxCCxC' } };

const inWindow = (v, pos) => v.p >= Math.max(pos, 1) && v.mx <= pos + 4;

function buildRiff(inst, prog, ts, style, pos, strumIdx) {
  if (inst.id === 'guitar') return buildGuitarRiff(inst, prog, ts, style, pos, strumIdx);
  if (inst.id === 'bass') return buildBassRiff(inst, prog, ts, style, pos);
  return buildPianoRiff(prog, ts, style, pos);
}

// ───────── 일렉기타 ─────────
function buildGuitarRiff(inst, prog, ts, st, pos, si) {
  const SP = st === 'strum' ? STRUM_PATTERNS[si][ts] : null;
  const spb = SP ? SP.r : (ts === 6 ? 1 : 2), barSteps = SP ? SP.p.length : (ts === 6 ? 6 : ts * 2);
  const N = inst.tuning.length;
  const suits = { pw: v => v.n <= 3 && v.sg === 2, arp: v => v.n >= 4 && v.i === 0, funk: v => v.n >= 3 && v.n <= 4 && v.sg !== 2 && v.p >= 4, strum: v => v.n >= 5 };
  const cols = [], used = [];
  let prev = null;
  prog.forEach(c => {
    const qi = st === 'pw' ? QI['5'] : c.qi;
    const all = fretVoicings(inst, c.r, qi).all;
    let F = all.filter(suits[st]);
    if (pos >= 0) { const w = F.filter(v => inWindow(v, pos)); if (w.length) F = w; }
    if (!F.length) F = all.filter(v => pos < 0 || inWindow(v, pos));
    if (!F.length) F = all;
    const anchor = prev ? prev.p : (pos >= 0 ? pos : (st === 'funk' ? 7 : st === 'pw' ? 3 : 1));
    const v = F.slice().sort((a, b) => (Math.abs(a.p - anchor) * 1.2 + a.sc) - (Math.abs(b.p - anchor) * 1.2 + b.sc))[0];
    prev = v;
    used.push(inst.card(v, chordNames(c.root, qi), c.r, false).replace(/<span class="nm">[^<]*<\/span>/, `<span class="nm">${c.name}</span>`));
    const pl = []; v.t.forEach((f, s) => { if (f !== 'x') pl.push(s); });
    const n = Math.round(c.beats * spb);
    for (let k = 0; k < n; k++) {
      const g = cols.length % barSteps;
      const col = { notes: {}, mark: '', chord: k === 0 ? c.name : '', acc: false };
      if (st === 'arp') {
        const up = pl.slice(1), cyc = up.concat(up.slice(1, -1).reverse());
        const bassHit = k % (barSteps / (ts === 6 ? 1 : 2)) === 0 && (k % barSteps === 0 || (ts === 4 && g === 4));
        const s = bassHit ? pl[0] : cyc.length ? cyc[(k - 1 + cyc.length * 4) % cyc.length] : pl[0];
        col.notes[s] = v.t[s];
      } else {
        const P = SP ? SP.p : GUITAR_PATTERNS[st][ts];
        const ch = P[g % P.length];
        col.acc = g % spb === 0;
        if (st === 'pw') {
          if (ch === 'C') { pl.forEach(s => (col.notes[s] = v.t[s])); col.mark = 'PM'; }
          else if (ch === 'R') col.notes[pl[0]] = v.t[pl[0]];
          else col.notes[pl[1] || pl[0]] = v.t[pl[1] || pl[0]];
        } else if (st === 'funk') pl.forEach(s => (col.notes[s] = ch === 'C' ? v.t[s] : 'x'));
        else if (ch !== '.') { pl.forEach(s => (col.notes[s] = v.t[s])); col.mark = ch === 'D' ? '↓' : '↑'; }
      }
      const ss = Object.keys(col.notes).map(Number).sort((a, b) => (col.mark === '↑' ? b - a : a - b));
      col.ev = ss.map((s, j) => {
        const val = col.notes[s], mute = val === 'x', pm = col.mark === 'PM';
        return { key: 's' + s, s, midi: inst.tuning[s] + (mute ? 0 : +val), mute, ring: pm ? 0.9 : st === 'funk' ? 0.8 : null, delay: j * (st === 'strum' ? 0.018 : 0.005), vel: (pm ? 0.45 : 0.38) / Math.max(1, ss.length * 0.42) * (col.mark === '↑' ? 0.7 : 1) * (col.acc ? 1.1 : 0.85), pan: (s - (N - 1) / 2) * 0.09 };
      });
      cols.push(col);
    }
  });
  return { cols, res: spb, barSteps, ts, used: used.join(''), view: 'tab' };
}

// ───────── 베이스 ─────────
function buildBassRiff(inst, prog, ts, st, pos) {
  const spb = ts === 6 ? 1 : 2, barSteps = ts === 6 ? 6 : ts * 2, beatLen = ts === 6 ? 3 : spb;
  let anchor = pos >= 0 ? pos + 2 : 3;
  const roots = prog.map(c => {
    let best = null, bs = 1e9;
    for (let m = 28; m <= 55; m++) {
      if (m % 12 !== c.r) continue;
      const p = placeNote(inst, m, anchor);
      if (!p) continue;
      const out = pos >= 0 && p.f !== 0 && (p.f < pos || p.f > pos + 4) ? 3 : 0;
      const sc = Math.abs(p.f - anchor) + (p.s > 1 ? 1.2 : 0) + out;
      if (sc < bs) { bs = sc; best = { m, s: p.s, f: p.f }; }
    }
    if (pos < 0 && best && best.f) anchor = best.f;
    return best;
  });
  const cols = [], used = [];
  prog.forEach((c, ci) => {
    const R = roots[ci], next = roots[(ci + 1) % roots.length];
    const { tones, pcs } = chordTones(c.r, c.qi);
    const third = tones.find(t => t[0] === 2) || tones.find(t => t[0] === 3 || t[0] === 1);
    const fifth = tones.find(t => t[0] === 4);
    const s3 = third ? third[1] : 7, s5 = fifth ? fifth[1] : 7;
    const toneNames = tones.map(t => spell(c.root, t[0], t[1]));
    const a = Math.max(0, Math.min(inst.frets - 4, R.f - 1));
    used.push(`<div class="c wide"><div class="top"><span class="nm">${c.name}</span><span class="rk">${a}–${a + 4}프렛</span></div><div class="fbw">${fretboardSvg(inst, a, a + 4, pcs, toneNames, null, { w: 30, s: 15 })}</div><div class="meta">근음: ${inst.stringNames[R.s]}줄 ${R.f}프렛</div></div>`);
    const n = Math.round(c.beats * spb), nb = Math.max(1, Math.floor(n / beatLen));
    for (let k = 0; k < n; k++) {
      const g = cols.length % barSteps;
      const col = { notes: {}, mark: '', chord: k === 0 ? c.name : '', acc: g % beatLen === 0, ev: [] };
      let target = null, ring = 0.9;
      if (st === 'root8') target = R.m;
      else if (st === 'oct') target = k % 2 === 0 ? R.m : R.m + 12;
      else if (k % beatLen === 0) {
        const bi = k / beatLen;
        ring = beatLen * 0.95;
        if (st === 'r5') target = bi % 2 === 0 ? R.m : R.m + s5;
        else if (st === 'walk') target = nb > 1 && bi === nb - 1 ? next.m - 1 : R.m + [0, s3, s5, 12][bi % 4];
      }
      if (target != null) {
        const p = placeNote(inst, target, R.f || anchor);
        if (p) {
          col.notes[p.s] = p.f;
          col.ev.push({ key: 's' + p.s, s: p.s, midi: target, vel: col.acc ? 0.72 : 0.56, ring, delay: 0, pan: 0 });
        }
      }
      cols.push(col);
    }
  });
  return { cols, res: spb, barSteps, ts, used: used.join(''), view: 'tab' };
}

// ───────── 피아노 ─────────
function buildPianoRiff(prog, ts, st, pos) {
  const spb = ts === 6 ? 1 : 2, barSteps = ts === 6 ? 6 : ts * 2, beatLen = ts === 6 ? 3 : spb;
  const cols = [], used = [];
  let prevRh = null;
  prog.forEach(c => {
    const all = pianoVoicings(c.r, c.qi).all;
    let cand = all.filter(v => v.hands === 2 && v.lh.length === 1 && !v.shell && octaveOf(v.lh[0]) === 3);
    if (pos >= 0) { const w = cand.filter(v => v.pos === pos); if (w.length) cand = w; }
    if (!cand.length) cand = all.filter(v => v.hands === 2);
    if (!cand.length) cand = all;
    const dist = v => prevRh
      ? v.rh.reduce((a, x) => a + Math.min(...prevRh.map(y => Math.abs(x - y))), 0) + v.om * 2
      : Math.abs(v.rh[0] - (pos >= 0 ? 12 * (pos + 1) + 4 : 62)) + v.inv * 2 + v.om * 3;
    const v = cand.slice().sort((a, b) => dist(a) - dist(b))[0];
    prevRh = v.rh;
    const L = v.lh.length ? v.lh[0] : v.rh[0] - 12, RH = v.rh;
    const low = L - 12 >= PIANO_LOW ? L - 12 : L;
    used.push(`<div class="c"><div class="top"><span class="nm">${c.name}</span></div><div class="kbw">${pianoChordSvg({ lh: [L], rh: RH, lo: Math.min(L, ...RH), hi: Math.max(...RH), notes: [L, ...RH] }, c.r)}</div><div class="meta">왼손 ${midiName(L)}<br>오른손 ${RH.map(midiName).join(' ')}</div></div>`);
    const n = Math.round(c.beats * spb);
    for (let k = 0; k < n; k++) {
      const g = cols.length % barSteps;
      const col = { keys: [], chord: k === 0 ? c.name : '', mark: '', acc: g % beatLen === 0, ev: [] };
      const push = (m, hand, ring, vel, delay) => { col.keys.push({ m, hand }); col.ev.push({ key: 'p' + m, midi: m, ring, vel, delay: delay || 0, pan: (m - 60) / 60 * 0.35 }); };
      if (st === 'block') {
        if (k % beatLen === 0) { push(L, 'l', beatLen * 0.95, col.acc && g === 0 ? 0.55 : 0.45); RH.forEach((m, j) => push(m, 'r', beatLen * 0.9, g === 0 ? 0.36 : 0.3, j * 0.004)); }
      } else if (st === 'arp') {
        if (k === 0) push(L, 'l', n, 0.5);
        const seq = RH.concat(RH.slice(1, -1).reverse());
        push(seq[k % seq.length], 'r', 3, 0.4);
      } else if (st === 'ballad') {
        push([low, low + 7, low + 12, low + 7][k % 4], 'l', 1.9, k % 4 === 0 ? 0.48 : 0.38);
        if (k % (2 * beatLen) === 0) RH.forEach((m, j) => push(m, 'r', 2 * beatLen, 0.3, j * 0.01));
      } else if (st === 'pop') {
        if (k % (2 * beatLen) === 0) push(L, 'l', 2 * beatLen * 0.95, 0.5);
        RH.forEach(m => push(m, 'r', 0.6, col.acc ? 0.34 : 0.26));
      }
      cols.push(col);
    }
  });
  return { cols, res: spb, barSteps, ts, used: used.join(''), view: 'roll' };
}

// ───────── 보여주기 ─────────
function countLabels(ts, res) {
  const sub = res >= 4 ? ['', 'e', '&', 'a'] : res === 2 ? ['', '&'] : [''];
  return Array.from({ length: ts }, (_, i) => sub.map((x, j) => (j === 0 ? String(i + 1) : x))).flat();
}

// 줄 악기 타브 (글자)
function renderRiffTab(inst, R) {
  const { cols, ts, barSteps, res } = R;
  const N = inst.tuning.length, top = inst.stringNames.slice().reverse();
  const W = res >= 4 ? 3 : 4, barsPerRow = res >= 4 ? 1 : 2, rowSteps = barSteps * barsPerRow;
  const cnt = countLabels(ts, res);
  const out = [];
  for (let r0 = 0; r0 < cols.length; r0 += rowSteps) {
    const seg = cols.slice(r0, r0 + rowSteps);
    let ch = '  ', mk = '  ', cn = '  ';
    const S = top.map(n => n + '|');
    seg.forEach((c, j) => {
      if (j > 0 && j % barSteps === 0) { S.forEach((_, i) => (S[i] += '|')); ch += ' '; mk += ' '; cn += ' '; }
      ch += (c.chord || '').padEnd(W).slice(0, W); mk += (c.mark || '').padEnd(W); cn += cnt[j % barSteps].padEnd(W);
      for (let i = 0; i < N; i++) { const v = c.notes[N - 1 - i]; S[i] += (v === undefined ? '-' : String(v)).padEnd(W, '-'); }
    });
    S.forEach((_, i) => (S[i] += '|'));
    out.push([ch, mk, ...S, cn].join('\n'));
  }
  return `<pre class="rtab">${out.join('\n\n')}</pre>`;
}

// 피아노 롤 (그림)
function renderRiffRoll(R) {
  const ms = new Set();
  R.cols.forEach(c => c.keys.forEach(k => ms.add(k.m)));
  if (!ms.size) return '';
  const lo = Math.min(...ms), hi = Math.max(...ms), rows = hi - lo + 1;
  const CW = 14, RH = 8, L = 42, T = 26, w = L + R.cols.length * CW + 6, h = T + rows * RH + 22;
  const cnt = countLabels(R.ts, R.res);
  let o = `<svg class="roll" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="피아노 롤">`;
  for (let m = lo; m <= hi; m++) {
    const y = T + (hi - m) * RH;
    if (isBlack(m % 12)) o += `<rect class="rb" x="${L}" y="${y}" width="${R.cols.length * CW}" height="${RH}"/>`;
    if (ms.has(m) || m % 12 === 0) o += `<text class="rl" x="${L - 4}" y="${y + RH - 1}" text-anchor="end">${midiName(m)}</text>`;
  }
  R.cols.forEach((c, j) => {
    const x = L + j * CW;
    const bar = j % R.barSteps === 0, beat = j % (R.ts === 6 ? 3 : R.res) === 0;
    if (bar || beat) o += `<line class="${bar ? 'rbar' : 'rbeat'}" x1="${x}" y1="${T}" x2="${x}" y2="${T + rows * RH}"/>`;
    if (c.chord) o += `<text class="rc" x="${x + 2}" y="${T - 10}">${c.chord}</text>`;
    o += `<text class="rn2" x="${x + CW / 2}" y="${T + rows * RH + 14}" text-anchor="middle">${cnt[j % R.barSteps]}</text>`;
    c.keys.forEach(k => { o += `<rect class="${k.hand === 'l' ? 'rlh' : 'rrh'}" x="${x + 1}" y="${T + (hi - k.m) * RH + 1}" width="${CW - 2}" height="${RH - 2}" rx="2"/>`; });
  });
  return `<div class="rollw">${o}</svg></div>`;
}
