// 처음 화면(악기 고르기)과 탭 전환

const TABS = [['t-key', 'p-key', renderKeyTab], ['t-dic', 'p-dic', renderDictTab], ['t-sc', 'p-sc', renderScaleTab], ['t-rf', 'p-rf', renderRiffPage]];
let RENDERED = {};

function chooseInstrument(id) {
  stopLoop();
  SAMP = [];
  INST = INSTRUMENTS[id];
  RENDERED = {};
  $('home').hidden = true;
  $('app').hidden = false;
  $('iname').textContent = INST.name;
  $('apph1').textContent = INST.name + ' 코드 도감';
  $('applead').textContent = INST.lead + ' 곡의 키를 고르면 그 키의 코드를, 코드 사전에서는 20가지 코드 종류 × 12개 근음을, 스케일 도감에서는 대표 스케일 4가지를, 리프 만들기에서는 코드 진행으로 만든 리프를 볼 수 있어요.';
  $('readhow').innerHTML = '읽는 법: ' + INST.readHow;
  document.body.dataset.inst = id;
  TABS.forEach(([, p]) => ($(p).innerHTML = ''));
  showTab('t-key');
  try { localStorage.setItem('inst', id); } catch (e) {}
  window.scrollTo(0, 0);
}

function showTab(t) {
  TABS.forEach(([t2, p2, render]) => {
    $(t2).setAttribute('aria-selected', t2 === t);
    $(p2).hidden = t2 !== t;
    if (t2 === t && !RENDERED[t2]) { RENDERED[t2] = 1; render(); }
  });
}

TABS.forEach(([t]) => ($(t).onclick = () => showTab(t)));
$('switch').onclick = () => { stopLoop(); $('app').hidden = true; $('home').hidden = false; markLast(); window.scrollTo(0, 0); };
document.querySelectorAll('[data-inst]').forEach(b => (b.onclick = () => chooseInstrument(b.dataset.inst)));

function markLast() {
  let last = null;
  try { last = localStorage.getItem('inst'); } catch (e) {}
  document.querySelectorAll('[data-inst]').forEach(b => { const tag = b.querySelector('.last'); if (tag) tag.hidden = b.dataset.inst !== last; });
}
markLast();
