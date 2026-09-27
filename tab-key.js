// 키별 코드 탭: 키를 고르면 그 키의 코드를 조건에 맞는 운지로 보여주고, 주법별 추천도 보여줘요

const KEY = { root: 7, minor: 0, seventh: 0, f: {} };

function renderKeyTab() {
  INST.filters.forEach(f => { KEY.f[f.id] = f.type === 'window' ? f.def : 0; });
  $('p-key').innerHTML = `
    <div class="ctl"><span class="lb">키 근음</span><div class="roots" id="kroots" style="margin:0"></div></div>
    <div class="ctl"><span class="lb">장·단조</span><div class="seg" id="kmode"></div><span class="lb">코드</span><div class="seg" id="kset"></div></div>
    ${INST.filters.map(f => `<div class="ctl"><span class="lb">${f.label}</span><div id="kf-${f.id}" class="${f.type === 'seg' ? 'seg' : 'fwrap'}"></div></div>`).join('')}
    <p class="how" id="kdesc"></p>
    <div class="lg">${INST.legend}</div>
    <div class="cnt" id="kcnt"></div>
    <div id="krows"></div>
    <section class="sty"><h2>주법별 추천 코드</h2><p class="how" id="sdesc"></p><div id="kstyles"></div></section>`;
  seg($('kmode'), ['장조', '단조'], KEY.minor, i => { const pc = pcOf((KEY.minor ? MINOR_KEYS : MAJOR_KEYS)[KEY.root]); KEY.minor = i; KEY.root = (i ? MINOR_KEYS : MAJOR_KEYS).findIndex(n => pcOf(n) === pc); drawKeyRoots(); drawKey(); });
  seg($('kset'), ['3화음', '세븐스'], KEY.seventh, i => { KEY.seventh = i; drawKey(); });
  INST.filters.forEach(f => {
    const el = $('kf-' + f.id);
    if (f.type === 'seg') seg(el, f.opts, KEY.f[f.id], i => { KEY.f[f.id] = i; drawKey(); });
    else windowControl(el, f.min, f.max, f.fmt, KEY.f[f.id], n => { KEY.f[f.id] = n; drawKey(); });
  });
  drawKeyRoots();
  drawKey();
}

function drawKeyRoots() {
  const L = KEY.minor ? MINOR_KEYS : MAJOR_KEYS;
  $('kroots').innerHTML = L.map((n, i) => `<button id="kr${i}" aria-pressed="${i === KEY.root}">${n}${KEY.minor ? 'm' : ''}</button>`).join('');
  $('kroots').querySelectorAll('button').forEach((b, i) => (b.onclick = () => { KEY.root = i; drawKeyRoots(); drawKey(); }));
}

function drawKey() {
  const kn = (KEY.minor ? MINOR_KEYS : MAJOR_KEYS)[KEY.root];
  const chords = keyChords(kn, KEY.minor, KEY.seventh);
  const test = filterTest(INST.filters, KEY.f);
  $('kdesc').textContent = `${kn}${KEY.minor ? ' 단조' : ' 장조'}에서 쓰는 코드예요. 고른 조건에 맞는 ${INST.unit}을 치기 쉬운 순서로 보여줘요. 옆으로 밀면 더 볼 수 있어요.` + (KEY.minor ? ' 단조의 V(메이저)는 화성단음계에서 온 코드로, 실제 곡에서 v보다 더 자주 쓰여요.' : '');
  const counts = chords.map(c => [c.rn, c.names[0], INST.voicings(c.r, c.qi).all.filter(test).length]);
  $('kcnt').innerHTML = `<table><caption>현재 조건(${filterSummary(INST.filters, KEY.f)})에서 코드별 가능한 ${INST.unit} 개수 · 합계 ${counts.reduce((a, x) => a + x[2], 0)}개</caption><tr>${counts.map(x => `<th>${x[0]}<br>${x[1]}</th>`).join('')}</tr><tr>${counts.map(x => `<td class="${x[2] ? '' : 'z'}">${x[2] ? `<b>${x[2]}</b>개` : '0개'}</td>`).join('')}</tr></table>`;
  $('krows').innerHTML = chords.map(c => {
    const VA = INST.voicings(c.r, c.qi).all.filter(test);
    const V = VA.slice().sort((a, b) => a.sc - b.sc).slice(0, 10);
    return `<div class="row"><div class="rowh"><span class="rn">${c.rn}</span><span class="rc">${c.names[0]}</span><span class="rt2">${QUALITIES[c.qi].n} · 이 조건 ${INST.unit} ${VA.length}개 중 상위 ${V.length}개</span></div><div class="strip">${V.map(v => INST.card(v, c.names, c.r, false)).join('') || `<p class="meta">이 조건에 맞는 ${INST.unit}이 없어요. 조건을 바꿔 보세요.</p>`}</div></div>`;
  }).join('');
  drawStyles(kn);
}

function drawStyles(kn) {
  $('sdesc').textContent = `현재 선택한 키(${kn}${KEY.minor ? ' 단조' : ' 장조'})를 기준으로, 주법마다 잘 어울리는 조건을 정해 코드마다 가장 치기 쉬운 ${INST.unit}을 1개씩 골랐어요. 위쪽 필터와는 따로 계산돼요.`;
  const minor = KEY.minor;
  const one = st => {
    const cond = [...st.w.map(st.wfmt), ...st.cond];
    return `<div class="sb"><div class="tg">${st.tag}</div><h3>${st.n}</h3><p>${st.d}</p><div class="cond">${cond.map(c => `<span>${c}</span>`).join('')}</div>` +
      st.w.map(w => {
        let tot = 0;
        const cards = (minor ? MINOR_CHORDS : MAJOR_CHORDS).map(([deg, semi, rn, tq, sq]) => {
          const root = spell(kn, deg, semi), r = pcOf(root), qi = QI[st.q(tq, sq, rn)], nm = chordNames(root, qi);
          const L = INST.voicings(r, qi).all.filter(v => st.test(v, w)).sort((a, b) => a.sc - b.sc);
          tot += L.length;
          return L.length ? INST.card(L[0], nm, r, false).replace('<div class="top">', `<div class="top"><span class="rk">${rn}</span>`) : `<div class="c"><div class="nm">${nm[0]}</div><p class="meta">${rn} · 이 조건에 맞는 ${INST.unit}이 없어요.</p></div>`;
        }).join('');
        return `<div class="wn">${st.wfmt(w)} 추천 (조건에 맞는 ${INST.unit} 총 ${tot}개)</div><div class="strip">${cards}</div>`;
      }).join('') + '</div>';
  };
  $('kstyles').innerHTML = INST.styleGroups.map(g => `<h2 class="sgh">${g.title}</h2>` + g.items.map(one).join('')).join('');
}
