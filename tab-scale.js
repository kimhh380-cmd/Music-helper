// 스케일 도감 탭: 대표 스케일 4가지를 악기 전체와 구간별로 보여줘요

const SC = { q: 0, root: 9, w: 5 };

function renderScaleTab() {
  const S = INST.scale;
  SC.w = S.def;
  $('p-sc').innerHTML = `
    <div class="ctl"><span class="lb">스케일</span><div class="seg" id="sq"></div></div>
    <div class="ctl"><span class="lb">키 근음</span><div class="roots" id="sroots" style="margin:0"></div></div>
    <p class="how" id="sdesc2"></p>
    <div class="tones" id="stones"></div>
    <h2>${S.fullTitle}</h2>
    <p class="how">${S.fullHow}</p>
    <div class="neck" id="sneck"></div>
    <h2>${S.winTitle}</h2>
    <div class="ctl"><span class="lb">구간</span><div id="swc" class="fwrap"></div></div>
    <div class="sbig" id="swin"></div>
    <div class="stab" id="stab"></div>
    <h2>${S.gridTitle}</h2>
    <div class="wgrid" id="sgrid"></div>`;
  seg($('sq'), SCALES.map(x => x.n), SC.q, i => {
    const pc = pcOf((SCALES[SC.q].minor ? MINOR_KEYS : MAJOR_KEYS)[SC.root]);
    SC.q = i;
    SC.root = (SCALES[i].minor ? MINOR_KEYS : MAJOR_KEYS).findIndex(n => pcOf(n) === pc);
    drawScaleRoots(); drawScale();
  });
  windowControl($('swc'), S.min, S.max, S.fmt, SC.w, n => { SC.w = n; drawScale(); });
  drawScaleRoots();
  drawScale();
}

function drawScaleRoots() {
  const L = SCALES[SC.q].minor ? MINOR_KEYS : MAJOR_KEYS;
  $('sroots').innerHTML = L.map((n, i) => `<button id="sr${i}" aria-pressed="${i === SC.root}">${n}${SCALES[SC.q].minor ? 'm' : ''}</button>`).join('');
  $('sroots').querySelectorAll('button').forEach((b, i) => (b.onclick = () => { SC.root = i; drawScaleRoots(); drawScale(); }));
}

function drawScale() {
  const S = INST.scale;
  const { sc, keyName, pcs, names } = scaleNotes(SC.q, SC.root);
  $('sdesc2').textContent = `${keyName} ${sc.n}. ${sc.d}`;
  $('stones').innerHTML = names.map((x, i) => `<span class="${i ? '' : 'r'}">${x}<small>${sc.t[i][2]}</small></span>`).join('');
  $('sneck').innerHTML = S.full(pcs, names, SC.w);
  $('swin').innerHTML = S.window(pcs, names, SC.w);
  $('stab').textContent = S.text(pcs, names, SC.w);
  $('sgrid').innerHTML = S.grid(pcs, names).map(g => `<div class="c"><div class="top"><span class="nm">${g.label}</span><span class="rk">${keyName} ${sc.n.split(' ')[0]}</span></div><div style="overflow-x:auto;margin-top:6px">${g.svg}</div></div>`).join('');
}
