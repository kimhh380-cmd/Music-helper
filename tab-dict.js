// 코드 사전 탭: 코드 종류와 근음을 고르면 가능한 운지(누르는 법)를 모두 보여줘요

const DICT = { q: 0, r: 0, k: -1, f: {}, lim: 60 };

function renderDictTab() {
  INST.filters.forEach(f => { DICT.f[f.id] = f.type === 'window' ? -1 : 0; });
  DICT.k = -1; DICT.lim = 60;
  $('p-dic').innerHTML = `
    <div class="qs" id="qs"></div>
    <div class="roots" id="roots"></div>
    <div class="lg">${INST.legend}</div>
    <div class="stats" id="stats"></div>
    <h2 id="famh"></h2>
    <div class="grid famgrid" id="fam"></div>
    <h2>전체 목록</h2>
    <div class="bar" id="bar"></div>
    <div class="cnt" id="dcnt"></div>
    <div class="grid" id="all"></div>
    <button class="more" id="more" hidden>더 보기</button>`;
  $('more').onclick = () => { DICT.lim += 120; drawDictList(); };
  drawDictQ(); drawDictRoots(); drawDict();
}

function drawDictQ() {
  $('qs').innerHTML = QUALITIES.map((q, i) => `<button id="q${i}" aria-pressed="${i === DICT.q}">${q.s || 'M'} <span style="font-weight:400">${q.n}</span></button>`).join('');
  $('qs').querySelectorAll('button').forEach((b, i) => (b.onclick = () => { DICT.q = i; DICT.k = -1; DICT.lim = 60; drawDictQ(); drawDictRoots(); drawDict(); }));
}
function drawDictRoots() {
  $('roots').innerHTML = DICT_ROOTS.map((n, i) => `<button id="r${i}" aria-pressed="${i === DICT.r}">${DICT_ROOT_LABEL[i] || n}${QUALITIES[DICT.q].s}</button>`).join('');
  $('roots').querySelectorAll('button').forEach((b, i) => (b.onclick = () => { DICT.r = i; DICT.k = -1; DICT.lim = 60; drawDictRoots(); drawDict(); }));
}

function drawDict() {
  const V = INST.voicings(DICT.r, DICT.q), nm = chordNames(DICT_ROOTS[DICT.r], DICT.q);
  // 통계: 전체 + 필터 항목별 개수
  let st = `<span class="stat">${nm[0]} 전체 <b>${V.all.length}</b>개</span>`;
  INST.filters.filter(f => f.type === 'seg').forEach(f => f.opts.forEach((o, i) => { if (i) st += `<span class="stat">${o} <b>${V.all.filter(v => f.test(v, i)).length}</b></span>`; }));
  $('stats').innerHTML = st;
  $('famh').textContent = V.nf ? nm[0] + ' 대표 ' + INST.unit : '';
  $('famh').hidden = !V.nf;
  $('fam').innerHTML = V.all.slice(0, V.nf).map(v => INST.card(v, nm, DICT.r, true)).join('');
  // 필터 막대
  let bar = `<button id="fa" data-k="-1" aria-pressed="${DICT.k < 0}">전체</button>` + nm.map((x, i) => `<button id="fk${i}" data-k="${i}" aria-pressed="${DICT.k === i}">${x}</button>`).join('');
  INST.filters.forEach(f => {
    const opts = f.type === 'window'
      ? [[-1, '전체']].concat(Array.from({ length: f.max - f.min + 1 }, (_, i) => [f.min + i, f.fmt(f.min + i)]))
      : f.opts.map((o, i) => [i, o]);
    bar += `<label for="df-${f.id}">${f.label}</label><select id="df-${f.id}">${opts.map(([v, t]) => `<option value="${v}"${v === DICT.f[f.id] ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
  });
  $('bar').innerHTML = bar + '<span class="meta" id="cnt"></span>';
  $('bar').querySelectorAll('button').forEach(b => (b.onclick = () => { DICT.k = +b.dataset.k; DICT.lim = 60; $('bar').querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', o === b)); drawDictList(); }));
  INST.filters.forEach(f => { $('df-' + f.id).onchange = e => { DICT.f[f.id] = +e.target.value; DICT.lim = 60; drawDictList(); }; });
  drawDictList();
}

function drawDictList() {
  const V = INST.voicings(DICT.r, DICT.q), nm = chordNames(DICT_ROOTS[DICT.r], DICT.q);
  const test = filterTest(INST.filters, DICT.f);
  const L = V.all.filter(v => (DICT.k < 0 || v.i === DICT.k) && test(v));
  const counts = DICT_ROOTS.map((n, i) => [(DICT_ROOT_LABEL[i] || n) + QUALITIES[DICT.q].s, INST.voicings(i, DICT.q).all.filter(test).length]);
  $('dcnt').innerHTML = `<table><caption>현재 조건에서 근음별 ${QUALITIES[DICT.q].n}(${QUALITIES[DICT.q].s || 'M'}) 코드의 가능한 ${INST.unit} 개수 (슬래시 코드 포함)</caption><tr>${counts.map(x => `<th>${x[0]}</th>`).join('')}</tr><tr>${counts.map(x => `<td class="${x[1] ? '' : 'z'}">${x[1] ? `<b>${x[1]}</b>개` : '0개'}</td>`).join('')}</tr></table>`;
  $('cnt').textContent = L.length + '개';
  $('all').innerHTML = L.slice(0, DICT.lim).map(v => INST.card(v, nm, DICT.r, false)).join('');
  $('more').hidden = L.length <= DICT.lim;
}
