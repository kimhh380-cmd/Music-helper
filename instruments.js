// 악기 설정: 악기마다 다른 것(필터, 카드 모양, 추천 주법, 스케일 그림, 리프 규칙)을 여기서 정해요.
// 새 악기를 추가하려면 INSTRUMENTS에 같은 모양으로 하나 더 넣으면 돼요.

const INSTRUMENTS = {};

// ───────── 공통: 줄 악기(기타·베이스) ─────────
function fretFilters(inst) {
  const N = inst.tuning.length;
  const ns = ['전체']; for (let n = N; n >= 2; n--) ns.push(n + '줄');
  return [
    { id: 'win', type: 'window', label: '프렛 구간', min: 0, max: inst.frets - 4, def: 0, fmt: k => `${k}–${k + 4}프렛`, test: (v, k) => v.p >= Math.max(k, 1) && v.mx <= k + 4 },
    { id: 'ns', type: 'seg', label: '사용 줄 수', opts: ns, test: (v, k) => k === 0 || v.n === N + 1 - k },
    { id: 'sg', type: 'seg', label: '줄 위치', opts: ['전체', inst.hiLabel, inst.loLabel, '양쪽 다 사용'], test: (v, k) => k === 0 || v.sg === k },
    { id: 'op', type: 'seg', label: '개방현', opts: ['전체', '개방현 포함', '개방현 없음'], test: (v, k) => k === 0 || (k === 1 ? v.op > 0 : v.op === 0) },
  ];
}
function fretCard(inst, v, nm, r, showNote) {
  const rng = (v.p === v.mx ? v.p + '프렛' : v.p + '–' + v.mx + '프렛') + ' · ' + v.n + '줄' + (v.sg === 1 ? ' · ' + inst.hiShort : v.sg === 2 ? ' · ' + inst.loShort : '') + (v.op ? ' · 개방현' : '');
  return `<div class="c${v.f ? ' fam' : ''}"><div class="top"><span class="nm${v.f ? ' fs' : ''}">${nm[v.i]}</span><span class="rk">#${v.rank}</span></div>${showNote && v.l ? `<div class="lab">${v.l}</div>` : ''}${fretChordSvg(inst, v.t, r)}<div class="meta">${v.t.join(' ')}<span class="reg">${rng}</span>${v.om ? ' · <span class="om">5도 생략</span>' : ''}</div>${showNote && v.o ? `<div class="note">${v.o}</div>` : ''}</div>`;
}
const FRET_LEGEND = '<span><i style="background:var(--root)"></i>근음</span><span><i style="background:var(--ink)"></i>누르는 곳</span><span><i style="border:1.5px solid var(--ink)"></i>개방현</span><span><b style="color:var(--ink)">x</b> 치지 않는 줄</span>';
function fretScaleView(inst) {
  return {
    min: 0, max: inst.frets - 4, def: 5, fmt: k => `${k}–${k + 4}프렛`,
    fullTitle: `넥 전체 (0–${inst.frets}프렛)`, fullHow: '색칠된 칸이 아래에서 고른 프렛 구간이에요. 옆으로 밀어 끝까지 볼 수 있어요.',
    winTitle: '프렛 구간별 보기', gridTitle: '5칸씩 나눠 한눈에 보기',
    full: (pcs, names, w) => fretboardSvg(inst, 0, inst.frets, pcs, names, w, { w: 30, s: 16 }),
    window: (pcs, names, w) => fretboardSvg(inst, w, w + 4, pcs, names, null, { w: 52, s: 24 }),
    text: (pcs, names, w) => `${w}–${w + 4}프렛 타브 (숫자 = 누를 프렛, 빨간 점 = 근음 ${names[0]})\n` + fretScaleTab(inst, w, w + 4, pcs),
    grid: (pcs, names) => [0, 5, 10, 15, 20].map(a => ({ label: `${a}–${a + 4}프렛`, svg: fretboardSvg(inst, a, a + 4, pcs, names, null, { w: 38, s: 18 }) })),
  };
}
const fretStyleTest = (inst, st) => (v, w) => v.p >= Math.max(w, 1) && v.mx <= w + 4 && st.ns.includes(v.n) && (!st.sg || v.sg === st.sg) && (!st.op || (st.op === 1 ? v.op > 0 : v.op === 0));
function fretStyleCond(inst, st) {
  return [st.ns.map(n => n + '줄').join('·'), st.sg ? (st.sg === 1 ? inst.hiLabel : inst.loLabel) : '', st.op === 1 ? '개방현 포함' : st.op === 2 ? '개방현 없음' : ''].filter(Boolean);
}

// ───────── 일렉기타 ─────────
INSTRUMENTS.guitar = {
  id: 'guitar', name: '일렉기타', type: 'fret', unit: '운지',
  tuning: [40, 45, 50, 55, 59, 64], stringNames: ['E', 'A', 'D', 'G', 'B', 'e'], frets: 24, minStrings: 3,
  hiLabel: '1~3번줄만', loLabel: '4~6번줄만', hiShort: '1~3번줄', loShort: '4~6번줄', hiFrom: 3, loTo: 2,
  lead: '표준 튜닝(E A D G B E), 24프렛 일렉기타 기준이에요.',
  legend: FRET_LEGEND,
  readHow: '가로줄 6개 중 맨 위가 1번줄(가는 e), 맨 아래가 6번줄(굵은 E)이에요. 굵은 세로선은 너트, 아래 숫자는 프렛 번호, 카드 아래 글자는 6번줄→1번줄 순서의 타브예요.<br>프렛 구간: 5칸 폭 안에서 누르는 음이 모두 들어가는 운지만 보여줘요. 개방현은 어느 구간에서나 함께 쓸 수 있고, 개방현만으로 된 운지는 뺐어요.<br>포함 기준: 3줄 이상(파워코드는 2줄부터), 손가락 4개 이하(바레 1개 허용), 누르는 프렛 간격 4칸 이내, 중간에 뮤트하는 줄은 최대 1줄. 세븐스·식스·나인스는 5도 생략을 허용하고 카드에 표시했어요.',
  styleGroups: [
    { title: '일렉기타', items: [
      { n: '파워코드 리프', tag: '록 · 메탈 · 펑크록', d: '근음과 5도만 쓰는 파워코드를 저음 줄에서 칩니다. 팜뮤트와 잘 어울리고, 디스토션을 걸어도 소리가 탁해지지 않아요.', q: () => '5', ns: [2, 3], sg: 2, op: 2, w: [1, 5] },
      { n: '바레 코드 스트로크', tag: '록 · 팝 반주', d: '5~6줄을 모두 울리는 바레 코드로 스트로크합니다. 개방현이 없어서 같은 모양을 그대로 옮기며 칠 수 있어요.', q: (t) => t, ns: [5, 6], sg: 0, op: 2, w: [1, 5] },
      { n: '펑크 커팅', tag: '펑크 · 시티팝 · R&B', d: '고음 쪽 3~4줄만 짧게 끊어 치는 16비트 커팅이에요. 메이저는 M7, 도미넌트(V)는 9, 마이너는 m7로 바꿔 세련된 소리를 냅니다.', q: (t, s, rn) => t === 'M' ? (rn === 'V' ? '9' : 'M7') : t === 'm' ? 'm7' : 'm7b5', ns: [3, 4], sg: 0, op: 2, w: [5, 8] },
      { n: '재즈 컴핑', tag: '재즈 · 보사노바', d: '세븐스 코드를 4줄 셸 보이싱으로 짧게 찍어 반주합니다.', q: (t, s) => s, ns: [4], sg: 0, op: 2, w: [3, 7] },
    ] },
    { title: '어쿠스틱 기타', items: [
      { n: '오픈 코드 스트로크', tag: '포크 · 통기타 반주', d: '개방현을 살린 낮은 포지션의 기본 코드로 크게 스트로크합니다.', q: (t) => t, ns: [5, 6], sg: 0, op: 1, w: [0, 2] },
      { n: '아르페지오', tag: '발라드 · 핑거링', d: '코드를 잡고 한 줄씩 뜯어 칩니다. 메이저는 add9, 마이너는 m7로 바꾸면 소리가 더 부드럽게 퍼져요.', q: (t) => t === 'M' ? 'add9' : t === 'm' ? 'm7' : 'm7b5', ns: [4, 5, 6], sg: 0, op: 1, w: [0, 3] },
      { n: '발라드 세븐스 반주', tag: '팝 발라드 · 어쿠스틱 팝', d: 'M7, m7 같은 세븐스 코드로 잔잔하게 반주합니다.', q: (t, s) => s, ns: [4, 5], sg: 0, op: 0, w: [0, 5] },
      { n: '개방현 울림(드론) 보이싱', tag: '모던 어쿠스틱 · 워십', d: '높은 포지션을 누르면서 개방현을 함께 울려 반짝이는 소리를 냅니다.', q: (t) => t, ns: [4, 5, 6], sg: 0, op: 1, w: [5, 7] },
    ] },
  ],
  riffStyles: [['strum', '스트로크 반주'], ['arp', '아르페지오'], ['pw', '파워코드 록 리프'], ['funk', '펑크 커팅']],
  riffHow: '타브 읽는 법: 맨 위가 1번줄(e), 맨 아래가 6번줄(E)이에요. 숫자는 누를 프렛, <code>x</code>는 줄을 살짝 막고 치는 뮤트 소리, <code>PM</code>은 팜뮤트, <code>↓ ↑</code>는 스트로크 방향이에요.',
  sampleHow: '기타 개방현을 한 줄씩 한 번 튕겨 녹음해서 올리면, 계산으로 만든 소리 대신 그 녹음으로 연주해요.',
};

// ───────── 베이스 ─────────
INSTRUMENTS.bass = {
  id: 'bass', name: '베이스', type: 'fret', unit: '운지',
  tuning: [28, 33, 38, 43], stringNames: ['E', 'A', 'D', 'G'], frets: 24, minStrings: 2,
  hiLabel: '1~3번줄만 (G·D·A)', loLabel: '2~4번줄만 (D·A·E)', hiShort: 'G·D·A줄', loShort: 'D·A·E줄', hiFrom: 1, loTo: 2,
  lead: '표준 튜닝(E A D G) 4현 24프렛 베이스 기준이에요. 베이스는 코드를 한꺼번에 치기보다 코드 음을 하나씩 짚는 경우가 많아서, 2~4음짜리 모양(더블 스톱·3화음)을 보여줘요.',
  legend: FRET_LEGEND,
  readHow: '가로줄 4개 중 맨 위가 1번줄(G), 맨 아래가 4번줄(굵은 E)이에요. 굵은 세로선은 너트, 아래 숫자는 프렛 번호, 카드 아래 글자는 4번줄→1번줄 순서의 타브예요.<br>포함 기준: 2줄 이상, 손가락 4개 이하, 누르는 프렛 간격 4칸 이내, 중간에 뮤트하는 줄은 최대 1줄. 코드에 꼭 필요한 음(근음·3도·7도 등)이 모두 들어간 모양만 보여주고, 나인스 코드는 9도 생략을 허용했어요.',
  styleGroups: [
    { title: '베이스', items: [
      { n: '근음+5도 파워 (록)', tag: '록 · 펑크록 · 메탈', d: '근음과 5도(와 옥타브)를 함께 눌러 기타 파워코드처럼 묵직하게 받쳐줘요.', q: () => '5', ns: [2, 3], sg: 0, op: 2, w: [1, 5] },
      { n: '3화음 아르페지오 (팝·발라드)', tag: '팝 · 발라드 · 가요', d: '근음·3도·5도를 한 손 모양 안에서 하나씩 짚어 코드 느낌을 살려요.', q: (t) => t, ns: [3], sg: 0, op: 0, w: [1, 5] },
      { n: '세븐스 아르페지오 (재즈·R&B)', tag: '재즈 · R&B · 소울', d: '근음·3도·7도를 짚어 세븐스 코드의 색깔을 들려줘요. 워킹 베이스의 기본 재료예요.', q: (t, s) => s, ns: [3, 4], sg: 0, op: 0, w: [3, 7] },
      { n: '개방현 활용 (저음 울림)', tag: '어쿠스틱 · 포크 · 모던 록', d: '개방현을 섞어 낮은 음을 크게 울려요. 손이 편하고 소리가 풍성해요.', q: (t) => t, ns: [2, 3, 4], sg: 0, op: 1, w: [0, 2] },
    ] },
  ],
  riffStyles: [['root8', '근음 8비트 (록·팝)'], ['r5', '근음-5도 (컨트리·포크)'], ['oct', '옥타브 (디스코·댄스)'], ['walk', '워킹 베이스 (재즈·블루스)']],
  riffHow: '타브 읽는 법: 맨 위가 1번줄(G), 맨 아래가 4번줄(E)이에요. 숫자는 누를 프렛이에요. 워킹 베이스는 마지막 박에 다음 코드 근음의 반음 아래 음을 쳐서 자연스럽게 이어줘요.',
  sampleHow: '베이스 개방현을 한 줄씩 한 번 튕겨 녹음해서 올리면, 계산으로 만든 소리 대신 그 녹음으로 연주해요.',
};

// 두 악기에 공통 기능 붙이기
['guitar', 'bass'].forEach(id => {
  const inst = INSTRUMENTS[id];
  inst.voicings = (r, qi) => fretVoicings(inst, r, qi);
  inst.card = (v, nm, r, showNote) => fretCard(inst, v, nm, r, showNote);
  inst.filters = fretFilters(inst);
  inst.scale = fretScaleView(inst);
  inst.styleGroups.forEach(g => g.items.forEach(st => { st.test = fretStyleTest(inst, st); st.cond = fretStyleCond(inst, st); st.wfmt = w => `${w}–${w + 4}프렛`; }));
  inst.positions = [['-1', '자동 (가깝게 이어서)']].concat(Array.from({ length: inst.frets - 3 }, (_, i) => [String(i), `${i}–${i + 4}프렛`]));
  inst.samples = inst.tuning.map((m, i) => `${inst.tuning.length - i}번줄 ${inst.stringNames[i]} 개방현`);
});

// ───────── 피아노 ─────────
function pianoCard(v, nm, r, showNote) {
  const lh = v.lh.map(midiName).join(' '), rh = v.rh.map(midiName).join(' ');
  const tags = [(v.hands === 2 ? '양손' : '한 손'), v.n + '음', 'C' + v.pos + ' 옥타브'].join(' · ');
  return `<div class="c${v.f ? ' fam' : ''}"><div class="top"><span class="nm${v.f ? ' fs' : ''}">${nm[v.i]}</span><span class="rk">#${v.rank}</span></div>${showNote && v.l ? `<div class="lab">${v.l}</div>` : ''}<div class="kbw">${pianoChordSvg(v, r)}</div><div class="meta">${lh ? `왼손 ${lh}<br>` : ''}${v.hands === 2 ? '오른손 ' : ''}${rh}<span class="reg">${tags}</span>${v.om ? ' · <span class="om">5도 생략</span>' : ''}${v.shell ? ' · <span class="om">셸</span>' : ''}</div>${showNote && v.o ? `<div class="note">${v.o}</div>` : ''}</div>`;
}
function scaleMarks(pcs, names, lo, hi) {
  const marks = new Map();
  for (let m = lo; m <= hi; m++) { const k = pcs.indexOf(m % 12); if (k >= 0) marks.set(m, { cls: k === 0 ? 'kr' : 'kp', label: names[k].replace('𝄪', 'x') }); }
  return marks;
}
INSTRUMENTS.piano = {
  id: 'piano', name: '피아노', type: 'keys', unit: '누르는 법',
  lead: '88건반 중 자주 쓰는 C2~C7 범위 기준이에요. 가운데 도는 C4예요.',
  legend: '<span><i style="background:var(--root)"></i>근음</span><span><i style="background:var(--ink)"></i>오른손(한 손)</span><span><i style="background:var(--acc)"></i>왼손</span>',
  readHow: '건반 그림에서 색칠된 건반을 함께 누르면 돼요. 빨간 건반이 근음, 주황 건반이 왼손, 짙은 건반이 오른손(한 손으로 칠 때는 그 손)이에요. C4가 가운데 도예요.<br>기본형은 근음이 맨 아래, 1전위는 3도가, 2전위는 5도가 맨 아래에 오는 모양이에요. 전위를 쓰면 코드를 바꿀 때 손을 크게 옮기지 않아도 돼요.<br>포함 기준: 한 손은 가까이 붙여 쌓은 모양(최대 9도 폭), 양손은 왼손 근음(한 음 또는 옥타브) + 오른손 코드, 세븐스 코드는 왼손 근음 + 오른손 3도·7도(셸)도 포함했어요.',
  voicings: (r, qi) => pianoVoicings(r, qi),
  card: pianoCard,
  filters: [
    { id: 'win', type: 'window', label: '오른손 위치', min: 2, max: 6, def: 4, fmt: k => `C${k}–B${k}`, test: (v, k) => v.pos === k },
    { id: 'hands', type: 'seg', label: '손', opts: ['전체', '한 손', '양손'], test: (v, k) => k === 0 || v.hands === k },
    { id: 'nn', type: 'seg', label: '음 개수', opts: ['전체', '3음', '4음', '5음', '6음 이상'], test: (v, k) => k === 0 || (k === 4 ? v.n >= 6 : v.n === k + 2) },
  ],
  styleGroups: [
    { title: '피아노', items: [
      { n: '기본형·전위 연결 (첫 반주)', tag: '동요 · 가요 · 첫 반주', d: '오른손 한 손으로 3화음을 누르되, 기본형과 전위를 섞어 가장 가까운 모양으로 이어요.', q: (t) => t, test: (v, w) => v.hands === 1 && !v.om && v.n === 3 && v.pos === w, cond: ['한 손', '3음'], w: [4] },
      { n: '블록 코드 (팝 반주)', tag: '팝 · 가요 반주', d: '왼손으로 근음, 오른손으로 코드를 한꺼번에 눌러 박자에 맞춰 칩니다.', q: (t) => t, test: (v, w) => v.hands === 2 && v.lh.length === 1 && !v.shell && !v.om && v.pos === w, cond: ['양손', '왼손 근음 1음'], w: [4, 5] },
      { n: '발라드 (옥타브 베이스)', tag: '발라드 · OST', d: '왼손 근음을 옥타브로 잡아 깊게 울리고, 오른손은 세븐스 코드로 부드럽게 채워요.', q: (t, s) => s, test: (v, w) => v.hands === 2 && v.lh.length === 2 && !v.shell && v.pos === w, cond: ['양손', '왼손 옥타브'], w: [4, 5] },
      { n: '재즈 셸 보이싱', tag: '재즈 · 보사노바 · 네오소울', d: '왼손 근음 + 오른손 3도·7도만 눌러 가볍고 세련된 소리를 내요.', q: (t, s) => s, test: (v, w) => v.shell && v.pos === w, cond: ['양손', '셸(3도·7도)'], w: [3, 4] },
    ] },
  ],
  riffStyles: [['block', '블록 코드 (팝 반주)'], ['arp', '아르페지오 (발라드)'], ['ballad', '발라드 왼손 분산 (근음-5도-옥타브)'], ['pop', '팝 8비트 (오른손 8분)']],
  riffHow: '그림 읽는 법: 가로가 시간, 세로가 음 높이예요. 주황 칸은 왼손, 짙은 칸은 오른손이 치는 음이에요. 윗줄의 코드 이름에서 코드가 바뀌어요.',
  positions: [['-1', '자동 (가깝게 이어서)'], ['3', '오른손 C3 옥타브'], ['4', '오른손 C4 옥타브 (가운데)'], ['5', '오른손 C5 옥타브']],
  samples: null,
  scale: {
    min: 2, max: 5, def: 4, fmt: k => `C${k}–B${k + 1}`,
    fullTitle: '건반 전체 (C2–C7)', fullHow: '색칠된 부분이 아래에서 고른 두 옥타브 구간이에요. 옆으로 밀어 끝까지 볼 수 있어요.',
    winTitle: '두 옥타브씩 보기', gridTitle: '옥타브별로 한눈에 보기',
    full: (pcs, names, w) => keyboardSvg(36, 96, scaleMarks(pcs, names, 36, 96), { labels: true, hl: [12 * (w + 1), 12 * (w + 3) - 1], fixed: true, ww: 16, wh: 64 }),
    window: (pcs, names, w) => keyboardSvg(12 * (w + 1), 12 * (w + 3) - 1, scaleMarks(pcs, names, 12 * (w + 1), 12 * (w + 3) - 1), { labels: true, fixed: true, ww: 24, wh: 96 }),
    text: (pcs, names, w) => {
      const lines = [];
      for (let o = w; o <= w + 1; o++) {
        const row = [];
        for (let m = 12 * (o + 1); m < 12 * (o + 2); m++) { const k = pcs.indexOf(m % 12); if (k >= 0) row.push(names[k] + (octaveOf(m))); }
        lines.push(`C${o} 옥타브: ` + row.join('  '));
      }
      return `C${w}–B${w + 1} 구간의 스케일 음 (빨간 건반 = 근음 ${names[0]})\n` + lines.join('\n');
    },
    grid: (pcs, names) => [2, 3, 4, 5, 6].map(o => ({ label: `C${o}–B${o}` + (o === 4 ? ' (가운데)' : ''), svg: keyboardSvg(12 * (o + 1), 12 * (o + 2) - 1, scaleMarks(pcs, names, 12 * (o + 1), 12 * (o + 2) - 1), { labels: true, scale: 2.2 }) })),
  },
};
INSTRUMENTS.piano.styleGroups.forEach(g => g.items.forEach(st => { st.wfmt = w => `오른손 C${w} 옥타브`; }));
