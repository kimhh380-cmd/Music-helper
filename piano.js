// 피아노 계산: 코드 누르는 법(보이싱) 찾기, 건반 그림

const PIANO_LOW = 36;  // C2
const PIANO_HIGH = 96; // C7
const isBlack = pc => [1, 3, 6, 8, 10].includes(pc);
const octaveOf = m => Math.floor(m / 12) - 1;

// 가까이 붙여 쌓기: 음 목록(반음, 근음 기준)을 k번째 음부터 차례로 위로 쌓음
function closeStack(semis, k, startMidi) {
  const seq = semis.slice(k).concat(semis.slice(0, k));
  const out = [startMidi];
  for (let j = 1; j < seq.length; j++) {
    const up = (seq[j] - seq[j - 1] + 12) % 12 || 12;
    out.push(out[j - 1] + up);
  }
  return out;
}

const PIANO_CACHE = {};
function pianoVoicings(r, qi) {
  const key = r + ':' + qi;
  if (PIANO_CACHE[key]) return PIANO_CACHE[key];
  const q = QUALITIES[qi];
  const { tones, pcs } = chordTones(r, qi);
  const seen = new Map();
  const sets = [{ ts: tones, om: 0 }];
  if (q.t.some(t => !t[2])) sets.push({ ts: tones.filter(t => t[2]), om: 1 });
  const shellTones = tones.filter(t => t[1] !== 0 && t[2]);
  const hasShell = tones.length >= 4 && shellTones.length >= 2;

  const addV = v => {
    const k = v.lh.join('.') + '|' + v.rh.join('.');
    if (seen.has(k)) return;
    v.notes = v.lh.concat(v.rh);
    v.lo = Math.min(...v.notes); v.hi = Math.max(...v.notes); v.n = v.notes.length;
    v.i = pcs.indexOf(v.lo % 12);
    v.key = k;
    seen.set(k, v);
  };
  const stacks = (ts) => {
    const semis = ts.map(t => t[1] % 12).sort((a, b) => a - b);
    const res = [];
    for (let k = 0; k < semis.length; k++) {
      for (let o = 1; o <= 6; o++) {
        const start = 12 * (o + 1) + (r + semis[k]) % 12;
        const st = closeStack(semis, k, start);
        res.push({ notes: st, inv: k });
      }
    }
    return res;
  };

  sets.forEach(({ ts, om }) => {
    const S = stacks(ts);
    // 한 손
    S.forEach(({ notes, inv }) => {
      const lo = notes[0], hi = notes[notes.length - 1];
      if (lo < PIANO_LOW || hi > PIANO_HIGH || lo > 84 || hi - lo > 14) return;
      addV({ lh: [], rh: notes, hands: 1, inv, pos: octaveOf(lo), om, shell: 0 });
    });
    // 양손: 왼손 근음(한 음 또는 옥타브) + 오른손 코드
    const lhOpts = [];
    for (let m = PIANO_LOW; m < 60; m++) if (m % 12 === r) lhOpts.push([m]);
    for (let m = PIANO_LOW; m < 48; m++) if (m % 12 === r) lhOpts.push([m, m + 12]);
    lhOpts.forEach(lh => {
      const top = lh[lh.length - 1];
      S.forEach(({ notes, inv }) => {
        const lo = notes[0], hi = notes[notes.length - 1];
        if (lo <= top + 2 || lo < 53 || lo > 79 || hi > PIANO_HIGH || hi - lo > 14) return;
        addV({ lh, rh: notes, hands: 2, inv, pos: octaveOf(lo), om, shell: 0 });
      });
    });
  });
  // 재즈 셸: 왼손 근음 + 오른손 3도·7도
  if (hasShell) {
    const semis = shellTones.map(t => t[1] % 12).sort((a, b) => a - b);
    for (let m = PIANO_LOW; m < 60; m++) {
      if (m % 12 !== r) continue;
      for (let k = 0; k < semis.length; k++) for (let o = 3; o <= 5; o++) {
        const rh = closeStack(semis, k, 12 * (o + 1) + (r + semis[k]) % 12);
        if (rh[0] <= m + 2 || rh[0] < 53 || rh[0] > 79) continue;
        addV({ lh: [m], rh, hands: 2, inv: k, pos: octaveOf(rh[0]), om: 1, shell: 1 });
      }
    }
  }

  const all0 = [...seen.values()];
  const nearest = (list, target) => list.slice().sort((a, b) => Math.abs(a.rh[0] - target) - Math.abs(b.rh[0] - target))[0];
  const fam = [], fs = new Set();
  const add = (v, l, o) => { if (v && !fs.has(v.key)) { fam.push(Object.assign({}, v, { l, o, f: 1 })); fs.add(v.key); } };
  const oneFull = all0.filter(v => v.hands === 1 && !v.om);
  const invNames = ['기본형 (근음 자리)', '1전위', '2전위', '3전위', '4전위'];
  const invNotes = ['근음이 맨 아래에 오는 가장 기본 모양', '3도가 맨 아래 — 코드를 옮길 때 손 이동이 줄어요', '5도가 맨 아래 — 가운데 음역에서 자주 써요', '7도가 맨 아래', '맨 위 음을 아래로 내린 모양'];
  for (let k = 0; k < tones.length; k++) add(nearest(oneFull.filter(v => v.inv === k), 60), invNames[k] || `${k}전위`, (k === 0 ? '가운데 도(C4) 근처, 한 손으로. ' : '') + invNotes[k]);
  add(nearest(all0.filter(v => v.hands === 2 && v.lh.length === 1 && octaveOf(v.lh[0]) === 3 && v.inv === 0 && !v.om && !v.shell), 62), '양손 기본', '왼손 근음 + 오른손 기본형');
  add(nearest(all0.filter(v => v.hands === 2 && v.lh.length === 2 && !v.om && !v.shell), 64), '양손 옥타브 베이스', '왼손 근음을 옥타브로 잡아 묵직하게');
  if (hasShell) add(nearest(all0.filter(v => v.shell && octaveOf(v.lh[0]) === 3), 60), '재즈 셸 보이싱', '왼손 근음 + 오른손 3도·7도만');

  const score = v => Math.abs(v.pos - 4) * 1.2 + v.inv * 0.35 + (v.hands === 2 ? 0.3 : 0) + v.om * 0.4 + (v.n > 5 ? 0.6 : 0) + (v.shell ? 0.2 : 0);
  const rest = all0.filter(v => !fs.has(v.key)).sort((a, b) => a.pos - b.pos || a.hands - b.hands || a.inv - b.inv || a.n - b.n || a.lo - b.lo);
  const all = fam.concat(rest);
  all.forEach((v, i) => { v.rank = i + 1; v.sc = score(v) - (v.f ? 3 : 0); });
  return (PIANO_CACHE[key] = { all, nf: fam.length });
}

// 건반 그림: lo~hi 사이 건반, marks = Map(midi → {cls, label})
function keyboardSvg(lo, hi, marks, opt) {
  opt = opt || {};
  const start = lo - (lo % 12), end = hi + (11 - (hi % 12)); // 옥타브 단위로 넓힘
  const WW = opt.ww || 11, WH = opt.wh || 46, BW = WW * 0.62, BH = WH * 0.6, T = opt.top || 2;
  const whites = [];
  for (let m = start; m <= end; m++) if (!isBlack(m % 12)) whites.push(m);
  const xOf = {};
  whites.forEach((m, i) => { xOf[m] = i * WW; });
  const w = whites.length * WW + 1, h = T + WH + (opt.labels ? 16 : 2);
  let o = `<svg class="kb" width="${opt.fixed ? w : '100%'}" viewBox="0 0 ${w} ${h}" style="max-width:${w * (opt.scale || 1.4)}px" role="img" aria-label="${opt.aria || '건반'}">`;
  if (opt.hl) {
    const a = Math.max(opt.hl[0], start), b = Math.min(opt.hl[1], end);
    const xa = xOf[a] !== undefined ? xOf[a] : xOf[a + 1], xb = (xOf[b] !== undefined ? xOf[b] : xOf[b - 1]) + WW;
    if (xb > xa) o += `<rect class="win" x="${xa}" y="0" width="${xb - xa}" height="${T + WH + 2}"/>`;
  }
  whites.forEach(m => {
    const mk = marks.get(m);
    o += `<rect class="wk${mk ? ' ' + mk.cls : ''}" x="${xOf[m] + 0.5}" y="${T}" width="${WW - 1}" height="${WH}" rx="1.5"/>`;
    if (m % 12 === 0) o += `<text class="kc" x="${xOf[m] + WW / 2}" y="${T + WH - 4}" text-anchor="middle">C${octaveOf(m)}</text>`;
    if (mk && mk.label && opt.labels) o += `<text class="kl" x="${xOf[m] + WW / 2}" y="${T + WH + 12}" text-anchor="middle">${mk.label}</text>`;
  });
  for (let m = start; m <= end; m++) {
    if (!isBlack(m % 12)) continue;
    const x = xOf[m - 1] + WW - BW / 2;
    const mk = marks.get(m);
    o += `<rect class="bk${mk ? ' ' + mk.cls : ''}" x="${x}" y="${T}" width="${BW}" height="${BH}" rx="1"/>`;
    if (mk && mk.label && opt.labels) o += `<text class="kl kb2" x="${x + BW / 2}" y="${T + WH + 12}" text-anchor="middle">${mk.label}</text>`;
  }
  return o + '</svg>';
}

// 코드 카드용 건반: 왼손은 다른 색, 근음은 빨간색
function pianoChordSvg(v, r) {
  const marks = new Map();
  v.lh.forEach(m => marks.set(m, { cls: m % 12 === r ? 'kr' : 'kl2' }));
  v.rh.forEach(m => marks.set(m, { cls: m % 12 === r ? 'kr' : 'kp' }));
  return keyboardSvg(v.lo, v.hi, marks, { aria: v.notes.map(midiName).join(' ') });
}
