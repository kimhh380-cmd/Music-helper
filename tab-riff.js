// 리프 만들기 탭: 키의 코드를 눌러 진행을 만들고, 주법에 맞는 리프를 보여주고 반복 재생해요

const RF = { keyRoot: 9, minor: 1, seventh: 0, prog: 'Am:4 F:4 C:4 G:4', ts: 4, bpm: 100, style: null, strum: 0, pos: -1, riff: null };

function renderRiffPage() {
  RF.style = INST.riffStyles[0][0]; RF.pos = -1;
  const smp = INST.samples ? `
    <details class="smp" style="margin-top:14px"><summary style="cursor:pointer;font-weight:700">실제 ${INST.name} 소리 쓰기 (녹음 파일 올리기)</summary>
    <p class="how">${INST.sampleHow} 모든 줄을 올리면 가장 자연스럽고, 1~2줄만 올려도 나머지 음은 가까운 녹음의 높이를 바꿔서 써요. 조용한 곳에서 한 줄만 울리게 녹음하고, 소리가 끝날 때까지 3~4초 기다려 주세요. 파일은 이 화면에서만 쓰이고 어디에도 올라가지 않아요.</p>
    <div class="rfg">${INST.samples.map((lb, i) => `<div><label class="lb2" for="smf${i}">${lb}</label><input type="file" id="smf${i}" accept="audio/*"><div class="meta" id="smst${i}">${SAMP[i] ? '사용 중' : '없음'}</div></div>`).join('')}</div>
    <div class="btns"><button class="btn sec" id="smclr"${SAMP.some(Boolean) ? '' : ' hidden'}>녹음 소리 지우고 기본 소리로</button></div></details>` : '';
  $('p-rf').innerHTML = `
    <p class="how">코드 진행과 박자를 넣으면 주법에 맞는 ${INST.unit}을 골라 리프를 만들어요. 코드 뒤에 <code>:박수</code>를 붙이면 그 코드를 몇 박 칠지 정할 수 있어요(없으면 1마디). 예: <code>G:4 D:4 Em:2 C:2</code></p>
    <h2 style="margin-top:14px">키로 코드 고르기</h2>
    <div class="ctl"><span class="lb">키 근음</span><div class="roots" id="rkr" style="margin:0"></div></div>
    <div class="ctl"><span class="lb">장·단조</span><div class="seg" id="rkm"></div><span class="lb">코드</span><div class="seg" id="rks"></div></div>
    <p class="how">아래 코드를 누른 순서대로 진행에 추가되고, 그 순서로 반복 재생돼요. 코드 하나는 1마디예요.</p>
    <div class="roots" id="rkc"></div>
    <div class="btns" style="margin-top:10px"><button class="btn sec" id="rkundo">마지막 코드 지우기</button><button class="btn sec" id="rkclr">전체 지우기</button></div>
    <div class="rfg" style="grid-template-columns:1fr"><div><label class="lb2" for="rfc">코드 진행 (직접 수정 가능)</label><input type="text" id="rfc" value="${RF.prog}" autocomplete="off" spellcheck="false"></div></div>
    <div class="rfg">
      <div><label class="lb2" for="rfts">박자표</label><select id="rfts">${[[4, '4/4'], [3, '3/4'], [6, '6/8']].map(([v, t]) => `<option value="${v}"${v === RF.ts ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      <div><label class="lb2" for="rfbpm">빠르기 (BPM)</label><input type="number" id="rfbpm" value="${RF.bpm}" min="40" max="220"></div>
      <div><label class="lb2" for="rfst">주법</label><select id="rfst">${INST.riffStyles.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
      <div id="rfspw"${INST.id === 'guitar' ? '' : ' hidden'}><label class="lb2" for="rfsp">스트로크 패턴</label><select id="rfsp">${STRUM_PATTERNS.map((p, i) => `<option value="${i}"${i === RF.strum ? ' selected' : ''}>${p.n}</option>`).join('')}</select></div>
      <div><label class="lb2" for="rfpos">${INST.type === 'keys' ? '오른손 위치' : '운지 위치'}</label><select id="rfpos">${INST.positions.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
    </div>
    <p class="how" id="rfspd"></p>
    ${smp}
    <div class="btns"><button class="btn" id="rfgo">리프 만들기</button><button class="btn sec" id="rfplay" aria-pressed="false">▶ 재생 (반복)</button><button class="btn sec" id="rfstop">■ 정지</button></div>
    <div class="err" id="rferr"></div>
    <h2>사용한 ${INST.unit}</h2><div class="vstrip" id="rfv"></div>
    <h2>${INST.type === 'keys' ? '피아노 롤' : '리프 타브'}</h2><div id="rft"></div>
    <p class="how">${INST.riffHow} 재생하면 정지를 누를 때까지 처음부터 계속 반복되고, 재생 중에 주법이나 빠르기를 바꾸면 바로 반영돼요. 코드와 주법 규칙으로 새로 만든 연습용 리프예요.</p>`;

  seg($('rkm'), ['장조', '단조'], RF.minor, i => { const pc = pcOf((RF.minor ? MINOR_KEYS : MAJOR_KEYS)[RF.keyRoot]); RF.minor = i; RF.keyRoot = (i ? MINOR_KEYS : MAJOR_KEYS).findIndex(n => pcOf(n) === pc); drawRiffKey(); });
  seg($('rks'), ['3화음', '세븐스'], RF.seventh, i => { RF.seventh = i; drawRiffKey(); });
  $('rkundo').onclick = () => { const p = $('rfc').value.trim().split(/\s+/); p.pop(); $('rfc').value = p.join(' '); if ($('rfc').value) makeRiff(); else clearRiff('코드를 눌러 진행을 만들어 보세요.'); };
  $('rkclr').onclick = () => { $('rfc').value = ''; clearRiff('코드를 눌러 진행을 만들어 보세요.'); };
  $('rfgo').onclick = makeRiff;
  $('rfplay').onclick = () => { if (isLooping()) return; makeRiff(); if (!RF.riff) return; try { startLoop(INST, RF.riff); setPlaying(true); } catch (e) { $('rferr').textContent = '이 브라우저에서는 소리를 낼 수 없어요.'; } };
  $('rfstop').onclick = () => { stopLoop(); setPlaying(false); };
  ['rfts', 'rfst', 'rfpos', 'rfsp'].forEach(id => ($(id).onchange = () => { syncStrum(); makeRiff(); }));
  $('rfbpm').onchange = () => { RF.bpm = Math.max(40, Math.min(220, +$('rfbpm').value || 100)); if (RF.riff) RF.riff.bpm = RF.bpm; };
  if (INST.samples) {
    INST.samples.forEach((_, i) => ($('smf' + i).onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      $('smst' + i).textContent = '불러오는 중…';
      loadSample(INST, i, f, (msg, ok) => { $('smst' + i).textContent = msg; if (ok) $('smclr').hidden = false; });
    }));
    $('smclr').onclick = () => { SAMP = []; INST.samples.forEach((_, i) => { $('smst' + i).textContent = '없음'; $('smf' + i).value = ''; }); $('smclr').hidden = true; };
  }
  drawRiffKey(); syncStrum(); makeRiff();
}

function setPlaying(on) { const b = $('rfplay'); if (!b) return; b.textContent = on ? '● 반복 재생 중' : '▶ 재생 (반복)'; b.setAttribute('aria-pressed', on); }
function clearRiff(msg) { stopLoop(); setPlaying(false); RF.riff = null; $('rft').innerHTML = `<p class="meta">${msg}</p>`; $('rfv').innerHTML = ''; $('rferr').textContent = ''; }
function syncStrum() {
  const on = INST.id === 'guitar' && $('rfst').value === 'strum';
  $('rfspw').hidden = !on;
  const p = STRUM_PATTERNS[+$('rfsp').value || 0];
  $('rfspd').textContent = on ? p.n + ': ' + p.d : '';
}

function drawRiffKey() {
  const L = RF.minor ? MINOR_KEYS : MAJOR_KEYS;
  $('rkr').innerHTML = L.map((n, i) => `<button id="rkr${i}" aria-pressed="${i === RF.keyRoot}">${n}${RF.minor ? 'm' : ''}</button>`).join('');
  $('rkr').querySelectorAll('button').forEach((b, i) => (b.onclick = () => { RF.keyRoot = i; drawRiffKey(); }));
  const chords = keyChords(L[RF.keyRoot], RF.minor, RF.seventh);
  $('rkc').innerHTML = chords.map((c, i) => `<button id="rkc${i}" data-c="${c.names[0]}" aria-label="${c.names[0]} 추가"><span style="display:block;font-size:.7rem;opacity:.7;font-weight:400">${c.rn}</span>${c.names[0]}</button>`).join('');
  $('rkc').querySelectorAll('button').forEach(b => (b.onclick = () => { const f = $('rfc'); f.value = (f.value.trim() ? f.value.trim() + ' ' : '') + b.dataset.c; makeRiff(); }));
}

function makeRiff() {
  $('rferr').textContent = '';
  try {
    RF.prog = $('rfc').value; RF.ts = +$('rfts').value; RF.style = $('rfst').value; RF.pos = +$('rfpos').value; RF.strum = +$('rfsp').value || 0;
    RF.bpm = Math.max(40, Math.min(220, +$('rfbpm').value || 100));
    const prog = parseProgression(RF.prog, RF.ts === 6 ? 6 : RF.ts);
    const R = buildRiff(INST, prog, RF.ts, RF.style, RF.pos, RF.strum);
    R.bpm = RF.bpm;
    RF.riff = R;
    if (isLooping()) LOOP.riff = R;
    $('rfv').innerHTML = R.used;
    $('rft').innerHTML = R.view === 'roll' ? renderRiffRoll(R) : renderRiffTab(INST, R);
  } catch (e) {
    $('rferr').textContent = typeof e === 'string' ? e : '리프를 만드는 중 문제가 생겼어요. 코드 진행을 다시 확인해 주세요.';
  }
}
