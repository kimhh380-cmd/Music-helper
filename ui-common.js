// 화면 공통 도우미: 버튼 묶음, 구간 선택, 현재 악기

let INST = INSTRUMENTS.guitar; // 지금 고른 악기
const $ = id => document.getElementById(id);

// 버튼 여러 개 중 하나 고르기
function seg(el, opts, val, cb) {
  el.innerHTML = opts.map((o, i) => `<button id="${el.id}-${i}" aria-pressed="${i === val}">${o}</button>`).join('');
  el.querySelectorAll('button').forEach((b, i) => (b.onclick = () => {
    el.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', o === b));
    cb(i);
  }));
}

// ◀ 구간 ▶ + 슬라이더
function windowControl(el, min, max, fmt, val, cb) {
  el.innerHTML = `<div class="fw"><button id="${el.id}-prev" aria-label="한 칸 아래로">◀</button><output id="${el.id}-out">${fmt(val)}</output><button id="${el.id}-next" aria-label="한 칸 위로">▶</button></div><input type="range" id="${el.id}-range" min="${min}" max="${max}" value="${val}" aria-label="구간 시작">`;
  const set = n => {
    n = Math.max(min, Math.min(max, n));
    $(el.id + '-range').value = n;
    $(el.id + '-out').textContent = fmt(n);
    cb(n);
  };
  $(el.id + '-range').oninput = e => set(+e.target.value);
  $(el.id + '-prev').onclick = () => set(+$(el.id + '-range').value - 1);
  $(el.id + '-next').onclick = () => set(+$(el.id + '-range').value + 1);
}

// 필터 조건을 글자로
function filterSummary(filters, vals) {
  return filters.map(f => {
    const v = vals[f.id];
    if (f.type === 'window') return v < 0 ? f.label + ' 전체' : f.fmt(v);
    return v === 0 ? f.label + ' 전체' : f.opts[v];
  }).join(' · ');
}
function filterTest(filters, vals) {
  return v => filters.every(f => {
    const k = vals[f.id];
    return f.type === 'window' && k < 0 ? true : f.test(v, k);
  });
}
