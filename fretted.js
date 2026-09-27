// 줄 악기(일렉기타·베이스) 계산: 운지 찾기, 코드 다이어그램, 지판 그림, 타브

// 기타 대표 운지 (오픈 코드) — 키: 코드 종류, 근음(0~11)
const GUITAR_OPEN = { M: { 0: 'x,3,2,0,1,0', 2: 'x,x,0,2,3,2', 4: '0,2,2,1,0,0', 7: '3,2,0,0,0,3', 9: 'x,0,2,2,2,0' }, m: { 9: 'x,0,2,2,1,0', 2: 'x,x,0,2,3,1', 4: '0,2,2,0,0,0' }, '7': { 0: 'x,3,2,3,1,0', 2: 'x,x,0,2,1,2', 4: '0,2,0,1,0,0', 7: '3,2,0,0,0,1', 9: 'x,0,2,0,2,0', 11: 'x,2,1,2,0,2' }, M7: { 0: 'x,3,2,0,0,0', 2: 'x,x,0,2,2,2', 4: '0,2,1,1,0,0', 7: '3,2,0,0,0,2', 9: 'x,0,2,1,2,0', 5: 'x,x,3,2,1,0' }, m7: { 9: 'x,0,2,0,1,0', 2: 'x,x,0,2,1,1', 4: '0,2,0,0,0,0', 11: 'x,2,0,2,0,2' }, sus4: { 9: 'x,0,2,2,3,0', 2: 'x,x,0,2,3,3', 4: '0,2,2,2,0,0' }, sus2: { 9: 'x,0,2,2,0,0', 2: 'x,x,0,2,3,0' }, '5': { 4: '0,2,2,x,x,x', 9: 'x,0,2,2,x,x', 2: 'x,x,0,2,3,x' }, '6': { 0: 'x,3,2,2,1,0', 7: '3,2,0,0,0,0' }, '7sus4': { 9: 'x,0,2,0,3,0', 2: 'x,x,0,2,1,3', 4: '0,2,0,2,0,0' }, add9: { 0: 'x,3,2,0,3,0', 7: '3,x,0,2,0,3' } };

// 옮겨 쓰는 모양: [이름, 근음 줄의 개방현 음(0~11), 모양, 설명]
const GUITAR_SHAPES = {
  M: [['A폼 바레', 9, 'x,0,2,2,2,0', '5번줄 근음 바레'], ['E폼 바레', 4, '0,2,2,1,0,0', '6번줄 근음 풀 바레'], ['D폼', 2, 'x,x,0,2,3,2', '4번줄 근음, 고음 4줄'], ['고음 3줄 (E폼 윗부분)', 4, 'x,x,x,1,0,0', '리듬 커팅용'], ['고음 3줄 (A폼 윗부분)', 9, 'x,x,x,2,2,0', '리듬 커팅용'], ['C폼', 0, 'x,3,2,0,1,0', '울림이 풍부한 보이싱']],
  m: [['Am폼 바레', 9, 'x,0,2,2,1,0', '5번줄 근음 바레'], ['Em폼 바레', 4, '0,2,2,0,0,0', '6번줄 근음 풀 바레'], ['Dm폼', 2, 'x,x,0,2,3,1', '4번줄 근음'], ['고음 3줄 (Em폼 윗부분)', 4, 'x,x,x,0,0,0', '리듬 커팅용'], ['고음 3줄 (Am폼 윗부분)', 9, 'x,x,x,2,1,0', '리듬 커팅용']],
  '7': [['A7폼 바레', 9, 'x,0,2,0,2,0', '5번줄 근음 바레'], ['E7폼 바레', 4, '0,2,0,1,0,0', '6번줄 근음 풀 바레'], ['D7폼', 2, 'x,x,0,2,1,2', '4번줄 근음'], ['E7 셸 (5번줄 뮤트)', 4, '0,x,0,1,0,x', '블루스·재즈 셸 보이싱'], ['C7폼', 0, 'x,3,2,3,1,0', '5번줄 근음']],
  M7: [['AM7폼 바레', 9, 'x,0,2,1,2,0', '5번줄 근음 바레'], ['EM7 셸 (5·1번줄 뮤트)', 4, '0,x,1,1,0,x', '재즈·팝에서 많이 씀'], ['DM7폼', 2, 'x,x,0,2,2,2', '4번줄 근음'], ['CM7폼', 0, 'x,3,2,0,0,0', '5번줄 근음']],
  m7: [['Am7폼 바레', 9, 'x,0,2,0,1,0', '5번줄 근음 바레'], ['Em7폼 바레', 4, '0,2,0,0,0,0', '6번줄 근음 풀 바레'], ['Dm7폼', 2, 'x,x,0,2,1,1', '4번줄 근음'], ['Em7 셸 (5·1번줄 뮤트)', 4, '0,x,0,0,0,x', '재즈 셸 보이싱']],
  '5': [['6번줄 근음 파워코드', 4, '0,2,2,x,x,x', '록·메탈의 기본'], ['5번줄 근음 파워코드', 9, 'x,0,2,2,x,x', '록·메탈의 기본'], ['6번줄 2줄 파워코드', 4, '0,2,x,x,x,x', '가장 간단한 형태']],
  sus4: [['Asus4폼 바레', 9, 'x,0,2,2,3,0', '5번줄 근음'], ['Esus4폼 바레', 4, '0,2,2,2,0,0', '6번줄 근음']],
  sus2: [['Asus2폼', 9, 'x,0,2,2,0,0', '5번줄 근음']],
  '7sus4': [['A7sus4폼', 9, 'x,0,2,0,3,0', '5번줄 근음'], ['E7sus4폼', 4, '0,2,0,2,0,0', '6번줄 근음']],
  '6': [['E6 셸', 4, '0,x,-1,1,0,x', '6번줄 근음']], m6: [['Em6 셸', 4, '0,x,-1,0,0,x', '6번줄 근음']],
  '9': [['C9폼', 0, 'x,3,2,3,3,x', '5번줄 근음, 펑크 기타의 대표 보이싱']], M9: [['CM9폼', 0, 'x,3,2,4,3,x', '5번줄 근음']], m9: [['Cm9폼', 0, 'x,3,1,3,3,x', '5번줄 근음']], add9: [['Cadd9폼', 0, 'x,3,2,0,3,x', '5번줄 근음']],
  m7b5: [['Bm7♭5폼', 11, 'x,2,3,2,3,x', '5번줄 근음'], ['Em7♭5 (6번줄)', 4, '0,x,0,0,-1,x', '6번줄 근음']],
  dim7: [['dim7폼 (5번줄)', 9, 'x,0,1,-1,1,x', '3프렛마다 같은 모양 반복'], ['dim7폼 (4번줄)', 2, 'x,x,0,1,0,1', '3프렛마다 같은 모양 반복']],
  dim: [['dim 트라이어드 (고음)', 2, 'x,x,0,1,3,1', '4번줄 근음']], aug: [['aug 트라이어드', 9, 'x,0,3,2,2,x', '5번줄 근음, 4프렛마다 반복']], mM7: [['AmM7폼', 9, 'x,0,2,1,1,0', '5번줄 근음']],
};

// 베이스 대표 모양 (줄 순서: E, A, D, G)
const BASS_SHAPES = {
  M: [['메이저 3화음 (E줄 근음)', 4, '0,-1,-3,x', '근음·3도·5도를 한 손 모양으로'], ['메이저 3화음 (A줄 근음)', 9, 'x,0,-1,-3', '근음·3도·5도를 한 손 모양으로']],
  m: [['마이너 3화음 (E줄 근음)', 4, '0,-2,-3,x', '근음·♭3도·5도'], ['마이너 3화음 (A줄 근음)', 9, 'x,0,-2,-3', '근음·♭3도·5도']],
  '7': [['세븐 (E줄 근음)', 4, '0,-1,0,x', '근음·3도·♭7도'], ['세븐 (A줄 근음)', 9, 'x,0,-1,0', '근음·3도·♭7도']],
  M7: [['메이저 세븐 (E줄 근음)', 4, '0,-1,1,x', '근음·3도·7도'], ['메이저 세븐 (A줄 근음)', 9, 'x,0,-1,1', '근음·3도·7도']],
  m7: [['마이너 세븐 (E줄 근음)', 4, '0,-2,0,x', '근음·♭3도·♭7도'], ['마이너 세븐 (A줄 근음)', 9, 'x,0,-2,0', '근음·♭3도·♭7도']],
  '5': [['근음+5도 (E줄 근음)', 4, '0,2,x,x', '가장 기본 더블 스톱'], ['근음+5도 (A줄 근음)', 9, 'x,0,2,x', '가장 기본 더블 스톱'], ['근음+5도+옥타브 (E줄)', 4, '0,2,2,x', '묵직한 파워 사운드'], ['근음+5도+옥타브 (A줄)', 9, 'x,0,2,2', '묵직한 파워 사운드']],
};

// 모양을 근음 r에 맞게 옮기기
function placeShape(tpl, base, r, frets) {
  let f = (r - base + 12) % 12;
  const v = tpl.split(',');
  const nums = v.filter(x => x !== 'x').map(Number);
  if (f === 0 || Math.min(...nums) + f < 0) f += 12;
  while (Math.min(...nums) + f < 1 && nums.some(n => n !== 0)) f += 12;
  const out = v.map(x => (x === 'x' ? 'x' : String(+x + f)));
  if (out.some(x => x !== 'x' && +x > frets)) return null;
  return out.join(',');
}

// 운지 찾기: 누르는 프렛 간격 4칸 이내, 손가락 4개 이하(바레 1개), 중간 뮤트 줄 1개 이하
const FRET_CACHE = {};
function fretVoicings(inst, r, qi) {
  const key = inst.id + ':' + r + ':' + qi;
  if (FRET_CACHE[key]) return FRET_CACHE[key];
  const q = QUALITIES[qi];
  const { pcs, allow } = chordTones(r, qi);
  let { req } = chordTones(r, qi);
  if (inst.id === 'bass' && q.t.length === 4) req = new Set([...req].filter(p => p !== (r + 2) % 12)); // 베이스는 나인스의 9도 생략 허용
  const N = inst.tuning.length, minS = q.min || inst.minStrings;
  const seen = new Map();
  for (let w = 1; w <= inst.frets - 3; w++) {
    const choices = [];
    for (let s = 0; s < N; s++) {
      const c = ['x'];
      if (allow.has(inst.tuning[s] % 12)) c.push(0);
      for (let f = w; f <= w + 3; f++) if (allow.has((inst.tuning[s] + f) % 12)) c.push(f);
      choices.push(c);
    }
    const cur = [];
    (function rec(s) {
      if (s < N) { for (const c of choices[s]) { cur[s] = c; rec(s + 1); } return; }
      const pl = [];
      for (let i = 0; i < N; i++) if (cur[i] !== 'x') pl.push(i);
      if (pl.length < minS) return;
      let gap = 0;
      for (let i = pl[0]; i <= pl[pl.length - 1]; i++) if (cur[i] === 'x') gap++;
      if (gap > 1) return;
      const ps = new Set(pl.map(i => (inst.tuning[i] + cur[i]) % 12));
      for (const p of req) if (!ps.has(p)) return;
      const fr = pl.map(i => cur[i]).filter(f => f > 0);
      if (!fr.length) return; // 개방현만 쓰는 운지는 제외
      const mn = Math.min(...fr), mx = Math.max(...fr);
      const same = fr.filter(f => f === mn).length;
      const fg = same > 1 ? fr.filter(f => f !== mn).length + 1 : fr.length;
      if (fg > 4) return;
      if (fr.length > 4) { // 바레가 필요하면 바레 아래에 개방현이 올 수 없음
        const bs = pl.filter(i => cur[i] === mn);
        for (let i = bs[0]; i <= pl[pl.length - 1]; i++) if (cur[i] === 0) return;
      }
      const t = cur.map(String).join(',');
      if (seen.has(t)) return;
      const bass = (inst.tuning[pl[0]] + cur[pl[0]]) % 12;
      seen.set(t, {
        t: t.split(','), i: pcs.indexOf(bass), p: mn, mx, g: gap, fg, n: pl.length,
        sg: pl[0] >= inst.hiFrom ? 1 : pl[pl.length - 1] <= inst.loTo ? 2 : 3,
        om: q.t.some(x => !x[2]) && !ps.has((r + 7) % 12) ? 1 : 0,
        op: pl.filter(i => cur[i] === 0).length,
        midis: pl.map(i => inst.tuning[i] + cur[i]),
      });
    })(0);
  }
  const fam = [], fs = new Set();
  const add = (t, l, o) => { if (t && seen.has(t) && !fs.has(t)) { fam.push(Object.assign({}, seen.get(t), { l, o, f: 1 })); fs.add(t); } };
  if (inst.id === 'guitar' && GUITAR_OPEN[q.k] && GUITAR_OPEN[q.k][r]) add(GUITAR_OPEN[q.k][r], '오픈 코드', '가장 기본이 되는 운지');
  const shapes = (inst.id === 'guitar' ? GUITAR_SHAPES : BASS_SHAPES)[q.k] || [];
  shapes.forEach(([n, b, tpl, o]) => {
    const t = placeShape(tpl, b, r, inst.frets);
    if (t) {
      const m = Math.min(...t.split(',').filter(x => x !== 'x' && x !== '0').map(Number));
      add(t, n + (isFinite(m) ? ` (${m}프렛)` : ''), o);
    }
  });
  const score = v => v.g * 3 + v.fg * 0.6 + (v.i !== 0 ? 2 : 0) + (v.n < 4 && !q.only && N > 4 ? 1 : 0) + v.om * 0.5 + v.p * 0.04 - (v.op && v.p <= 4 ? 0.8 : 0);
  const rest = [...seen.values()].filter(v => !fs.has(v.t.join(','))).sort((a, b) => a.p - b.p || a.g - b.g || a.om - b.om || a.fg - b.fg || b.n - a.n);
  const all = fam.concat(rest);
  all.forEach((v, i) => { v.rank = i + 1; v.sc = score(v) - (v.f ? 3 : 0); });
  return (FRET_CACHE[key] = { all, nf: fam.length });
}

// 코드 다이어그램 (가로줄 = 줄, 맨 위가 가장 가는 줄)
function fretChordSvg(inst, t, r) {
  const N = inst.tuning.length;
  const fr = t.map(v => (v === 'x' || v === '0' ? null : +v)).filter(v => v !== null);
  const mx = fr.length ? Math.max(...fr) : 0, mn = fr.length ? Math.min(...fr) : 0;
  const st = mx <= 4 ? 1 : mn;
  const L = 22, W = 30, T = 8, S = 13, C = 4, H = S * (N - 1);
  let o = `<svg class="dg" viewBox="0 0 ${L + W * C + 6} ${T + H + 22}" role="img" aria-label="${t.join(' ')}">`;
  for (let i = 0; i < N; i++) o += `<line class="ln" x1="${L}" y1="${T + i * S}" x2="${L + W * C}" y2="${T + i * S}"/>`;
  for (let j = 0; j <= C; j++) {
    const x = L + j * W;
    o += `<line class="${j === 0 && st === 1 ? 'nut' : 'ln'}" x1="${x}" y1="${T}" x2="${x}" y2="${T + H}"/>`;
    if (j < C) o += `<text x="${x + W / 2}" y="${T + H + 15}" text-anchor="middle">${st + j}</text>`;
  }
  const same = fr.filter(v => v === mn).length;
  if (fr.length > 4 && same >= 2) {
    const ys = [];
    t.forEach((v, s) => { if (+v === mn && v !== '0') ys.push(T + (N - 1 - s) * S); });
    const x = L + (mn - st + 0.5) * W;
    o += `<rect class="bar" x="${x - 5}" y="${Math.min(...ys) - 5}" width="10" height="${Math.max(...ys) - Math.min(...ys) + 10}" rx="5"/>`;
  }
  t.forEach((v, s) => {
    const y = T + (N - 1 - s) * S;
    if (v === 'x') { o += `<text class="xm" x="${L - 11}" y="${y + 3.5}" text-anchor="middle">x</text>`; return; }
    const f = +v, root = (inst.tuning[s] + f) % 12 === r;
    if (f === 0) { o += `<circle class="${root ? 'opr' : 'op'}" cx="${L - 11}" cy="${y}" r="4"/>`; return; }
    o += `<circle class="${root ? 'rt' : 'dot'}" cx="${L + (f - st + 0.5) * W}" cy="${y}" r="5"/>`;
  });
  return o + '</svg>';
}

// 지판 그림: a~b 프렛, pcs 음을 이름과 함께 표시, hl = 강조할 5칸 구간 시작
function fretboardSvg(inst, a, b, pcs, names, hl, opt) {
  const N = inst.tuning.length, top = inst.stringNames.slice().reverse();
  const W = (opt && opt.w) || 30, S = (opt && opt.s) || 16, L = 26, T = 10, cols = b - a + 1, H = S * (N - 1);
  const w = L + cols * W + 6, h = T + H + 22;
  let o = `<svg class="fb" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${a}–${b}프렛 스케일 음 위치">`;
  if (hl != null) {
    const x0 = L + (Math.max(hl, a) - a) * W, x1 = L + (Math.min(hl + 4, b) - a + 1) * W;
    if (x1 > x0) o += `<rect class="win" x="${x0}" y="${T - 6}" width="${x1 - x0}" height="${H + 12}"/>`;
  }
  for (let j = 0; j < cols; j++) {
    const f = a + j, x = L + j * W + W / 2;
    if ([3, 5, 7, 9, 15, 17, 19, 21].includes(f)) o += `<circle class="mk" cx="${x}" cy="${T + H / 2}" r="3"/>`;
    if (f === 12 || f === 24) o += `<circle class="mk" cx="${x}" cy="${T + H * 0.3}" r="3"/><circle class="mk" cx="${x}" cy="${T + H * 0.7}" r="3"/>`;
    o += `<text class="fn" x="${x}" y="${T + H + 16}" text-anchor="middle">${f}</text>`;
  }
  for (let i = 0; i < N; i++) o += `<line class="ln" x1="${L}" y1="${T + i * S}" x2="${L + cols * W}" y2="${T + i * S}"/><text class="fn" x="4" y="${T + i * S + 3}">${top[i]}</text>`;
  for (let j = 0; j <= cols; j++) { const x = L + j * W; o += `<line class="${a === 0 && j === 1 ? 'nut' : 'fl'}" x1="${x}" y1="${T}" x2="${x}" y2="${T + H}"/>`; }
  for (let i = 0; i < N; i++) {
    const s = N - 1 - i;
    for (let f = a; f <= b; f++) {
      const k = pcs.indexOf((inst.tuning[s] + f) % 12);
      if (k < 0) continue;
      const x = L + (f - a) * W + W / 2, y = T + i * S;
      o += `<circle class="${k === 0 ? 'ndr' : 'nd'}" cx="${x}" cy="${y}" r="${S * 0.45}"/><text class="nt${k === 0 ? ' ntr' : ''}" x="${x}" y="${y + 3}" text-anchor="middle">${names[k].replace('𝄪', 'x')}</text>`;
    }
  }
  return o + '</svg>';
}

// 스케일 타브 글자: 줄마다 누를 프렛 번호
function fretScaleTab(inst, a, b, pcs) {
  const N = inst.tuning.length, top = inst.stringNames.slice().reverse();
  return top.map((n, i) => {
    const s = N - 1 - i, fs = [];
    for (let f = a; f <= b; f++) if (pcs.includes((inst.tuning[s] + f) % 12)) fs.push(f);
    return n + '|-' + fs.map(f => String(f).padStart(2, '-')).join('--') + '-|';
  }).join('\n');
}

// 음 하나를 가까운 줄·프렛에 놓기 (베이스 리프용)
function placeNote(inst, midi, anchor) {
  let best = null, bd = 1e9;
  inst.tuning.forEach((open, s) => {
    const f = midi - open;
    if (f < 0 || f > inst.frets) return;
    const d = Math.abs(f - anchor) + (f === 0 ? 0.5 : 0) + s * 0.05;
    if (d < bd) { bd = d; best = { s, f }; }
  });
  return best;
}
