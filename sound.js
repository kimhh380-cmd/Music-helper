// 소리: 악기별 음 합성(기타·베이스는 줄 진동, 피아노는 배음 합성), 리버브, 녹음 파일 재생, 반복 재생

let AC = null, MASTER = null, ROOM = null;
const CHAINS = {}, VOICES = new Map(), BUFS = {};
let SAMP = []; // 녹음 파일 (줄마다)

function ensureAC() {
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  if (!MASTER) {
    MASTER = AC.createGain(); MASTER.gain.value = 0.9;
    const comp = AC.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    MASTER.connect(comp); comp.connect(AC.destination);
  }
}
const mk = (type, props) => { const n = type === 'gain' ? AC.createGain() : type === 'conv' ? AC.createConvolver() : AC.createBiquadFilter(); if (type !== 'gain' && type !== 'conv') n.type = type; Object.entries(props || {}).forEach(([k, v]) => { if (n[k] && n[k].value !== undefined) n[k].value = v; else n[k] = v; }); return n; };

// 방 잔향(리버브): 초기 반사음 + 부드럽게 줄어드는 잔향
function irRoom() {
  const sr = AC.sampleRate, len = Math.floor(sr * 2.6), b = AC.createBuffer(2, len, sr), pre = Math.floor(sr * 0.018);
  const ER = [[0.011, 0.5], [0.019, 0.38], [0.027, 0.3], [0.037, 0.24], [0.049, 0.18], [0.061, 0.14]];
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    ER.forEach(([t, g], i) => { const n = Math.floor(sr * (t + (c ? 0.003 * (i % 2 ? 1 : -1) : 0))); if (n < len) d[n] += g * (i % 2 === c ? 1 : 0.7); });
    let lp = 0;
    for (let n = pre; n < len; n++) { const x = (n - pre) / (len - pre); lp += (0.5 - 0.38 * x) * ((Math.random() * 2 - 1) - lp); d[n] += lp * Math.min(1, (n - pre) / (sr * 0.03)) * Math.exp(-x * 6.2) * 0.55; }
  }
  return b;
}
function room() {
  if (ROOM) return ROOM;
  const inp = mk('gain'), lo = mk('highpass', { frequency: 160 }), conv = mk('conv'), damp = mk('lowpass', { frequency: 2600 });
  conv.buffer = irRoom();
  inp.connect(lo); lo.connect(conv); conv.connect(damp); damp.connect(MASTER);
  return (ROOM = inp);
}
// 기타 몸통 울림
function irBody() {
  const sr = AC.sampleRate, len = Math.floor(sr * 0.35), b = AC.createBuffer(2, len, sr);
  const modes = [[98, 0.9, 0.06], [196, 0.7, 0.05], [230, 0.5, 0.04], [390, 0.35, 0.03], [520, 0.3, 0.025], [700, 0.2, 0.02], [1050, 0.12, 0.015], [1600, 0.08, 0.01]];
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); d[0] = 1; for (let n = 1; n < len; n++) { const t = n / sr; let v = 0; for (const [f, a, tau] of modes) v += a * Math.exp(-t / tau) * Math.sin(2 * Math.PI * f * (1 + c * 0.004) * t); d[n] = v * 0.18; } }
  return b;
}
// 악기별 소리 경로
function chain(id) {
  if (CHAINS[id]) return CHAINS[id];
  const inp = mk('gain');
  let post;
  if (id === 'guitar') {
    const hp = mk('highpass', { frequency: 75 }), conv = mk('conv'), dry = mk('gain', { gain: 0.55 }), bodyG = mk('gain', { gain: 0.6 });
    const tone = mk('lowpass', { frequency: 3600, Q: 0.4 }), warm = mk('peaking', { frequency: 2500, Q: 0.9, gain: -5 });
    conv.normalize = true; conv.buffer = irBody();
    inp.connect(hp); hp.connect(dry); hp.connect(conv); conv.connect(bodyG); dry.connect(tone); bodyG.connect(tone); tone.connect(warm);
    post = warm;
    const out = mk('gain', { gain: 0.8 }), send = mk('gain', { gain: 0.42 });
    warm.connect(out); out.connect(MASTER); warm.connect(send); send.connect(room());
  } else if (id === 'bass') {
    const hp = mk('highpass', { frequency: 35 }), lp = mk('lowpass', { frequency: 1500, Q: 0.5 }), mid = mk('peaking', { frequency: 700, Q: 1, gain: -3 });
    inp.connect(hp); hp.connect(lp); lp.connect(mid);
    post = mid;
    const out = mk('gain', { gain: 1.1 }), send = mk('gain', { gain: 0.12 });
    mid.connect(out); out.connect(MASTER); mid.connect(send); send.connect(room());
  } else {
    const hp = mk('highpass', { frequency: 40 }), lp = mk('lowpass', { frequency: 6500, Q: 0.4 });
    inp.connect(hp); hp.connect(lp);
    post = lp;
    const out = mk('gain', { gain: 0.85 }), send = mk('gain', { gain: 0.34 });
    lp.connect(out); out.connect(MASTER); lp.connect(send); send.connect(room());
  }
  return (CHAINS[id] = { inp, post });
}

// 줄 진동 계산 (두 방향 진동을 합쳐 자연스럽게)
function ksString(y, len, sr, hz, decay, bright, pickPos, seed, soft) {
  const N = sr / hz, Ni = Math.floor(N), fr = N - Ni, buf = new Float32Array(len);
  let rnd = seed; const R = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 1073741823.5 - 1; };
  const ex = new Float32Array(Ni + 3); let lp = 0;
  for (let n = 0; n < ex.length; n++) { lp += soft * (R() - lp); ex[n] = lp; }
  const P = Math.max(1, Math.round(N * pickPos));
  for (let n = ex.length - 1; n >= P; n--) ex[n] -= ex[n - P];
  let m = 0; for (let n = 0; n < ex.length; n++) m += ex[n]; m /= ex.length;
  for (let n = 0; n < ex.length; n++) buf[n] = ex[n] - m;
  for (let n = ex.length; n < len; n++) { const a = buf[n - Ni] * (1 - fr) + buf[n - Ni - 1] * fr, b = buf[n - Ni - 1] * (1 - fr) + buf[n - Ni - 2] * fr; buf[n] = decay * ((1 - bright) * a + bright * b); }
  for (let n = 0; n < len; n++) y[n] += buf[n];
}
function finish(y, len, sr, att) {
  let dc = 0, prev = 0;
  for (let n = 0; n < len; n++) { const x = y[n]; dc = x - prev + 0.995 * dc; prev = x; y[n] = dc; }
  const a = Math.floor(sr * att); for (let n = 0; n < a && n < len; n++) y[n] *= n / a;
  const fade = Math.floor(sr * 0.2); for (let n = 0; n < fade; n++) y[len - 1 - n] *= n / fade;
  let pk = 0; for (let n = 0; n < len; n++) pk = Math.max(pk, Math.abs(y[n])); if (pk > 0) for (let n = 0; n < len; n++) y[n] /= pk;
}
function guitarBuf(midi, mute) {
  const key = 'g' + midi + (mute ? 'm' : ''); if (BUFS[key]) return BUFS[key];
  const sr = AC.sampleRate, hz = 440 * Math.pow(2, (midi - 69) / 12), len = Math.floor(sr * (mute ? 0.3 : 4.5));
  const buf = AC.createBuffer(1, len, sr), y = buf.getChannelData(0);
  const hi = Math.max(0, Math.min(1, (midi - 40) / 40)), T60 = mute ? 0.12 : (4.5 - hi * 2) * (1 + 2.2 * hi);
  const decay = Math.pow(10, -3 / (hz * T60)), bright = mute ? 0.5 : 0.34 - 0.24 * hi;
  ksString(y, len, sr, hz, decay, bright, 0.18, midi * 97 + 11, mute ? 0.18 : 0.24);
  ksString(y, len, sr, hz * 1.0009, decay * 0.9998, bright, 0.22, midi * 131 + 7, mute ? 0.18 : 0.2);
  finish(y, len, sr, 0.007);
  return (BUFS[key] = buf);
}
function bassBuf(midi, mute) {
  const key = 'b' + midi + (mute ? 'm' : ''); if (BUFS[key]) return BUFS[key];
  const sr = AC.sampleRate, hz = 440 * Math.pow(2, (midi - 69) / 12), len = Math.floor(sr * (mute ? 0.3 : 4));
  const buf = AC.createBuffer(1, len, sr), y = buf.getChannelData(0);
  const hi = Math.max(0, Math.min(1, (midi - 28) / 30)), T60 = mute ? 0.15 : (5 - hi * 1.5) * (1 + 1.5 * hi);
  const decay = Math.pow(10, -3 / (hz * T60));
  ksString(y, len, sr, hz, decay, 0.22, 0.25, midi * 53 + 3, 0.14);
  ksString(y, len, sr, hz * 1.0006, decay, 0.22, 0.3, midi * 71 + 5, 0.12);
  // 바탕에 깔리는 낮은 울림
  const w = 2 * Math.PI * hz / sr;
  for (let n = 0; n < len; n++) y[n] += 0.35 * Math.sin(w * n) * Math.exp(-n / sr / (T60 * 0.3));
  finish(y, len, sr, 0.006);
  return (BUFS[key] = buf);
}
// 피아노: 배음을 하나씩 더해 만들고, 처음엔 빨리 줄다가 천천히 사라지게
function pianoBuf(midi) {
  const key = 'p' + midi; if (BUFS[key]) return BUFS[key];
  const sr = AC.sampleRate, f0 = 440 * Math.pow(2, (midi - 69) / 12);
  const dur = midi < 48 ? 5 : midi < 72 ? 4 : 3, len = Math.floor(sr * dur);
  const buf = AC.createBuffer(1, len, sr), y = buf.getChannelData(0);
  const B = 0.00008 * Math.pow(2, (midi - 60) / 24), base = midi < 48 ? 3.4 : midi < 72 ? 2.4 : 1.5;
  const P = Math.min(12, Math.floor(sr / 2.4 / f0));
  for (let p = 1; p <= P; p++) {
    const fp = f0 * p * Math.sqrt(1 + B * p * p);
    const amp = Math.pow(p, -1.3) * (p === 1 ? 1 : Math.exp(-(p - 1) * (midi > 72 ? 0.35 : 0.18)));
    const tau = base / (1 + (p - 1) * 0.4);
    for (const det of [1, 1.0008]) {
      const w = 2 * Math.PI * fp * det / sr, c = Math.cos(w), s = Math.sin(w);
      let re = 1, im = 0;
      const k1 = Math.exp(-1 / (sr * tau * 0.22)), k2 = Math.exp(-1 / (sr * tau * 1.7));
      let e1 = 0.62, e2 = 0.38;
      for (let n = 0; n < len; n++) {
        y[n] += amp * 0.5 * im * (e1 + e2);
        const r2 = re * c - im * s; im = re * s + im * c; re = r2;
        e1 *= k1; e2 *= k2;
      }
    }
  }
  // 해머가 줄을 치는 짧은 소리
  let lp = 0; const hn = Math.floor(sr * 0.012);
  for (let n = 0; n < hn; n++) { lp += 0.3 * ((Math.random() * 2 - 1) - lp); y[n] += lp * 0.08 * (1 - n / hn); }
  finish(y, len, sr, 0.002);
  return (BUFS[key] = buf);
}

function killVoice(key, t, rel) {
  const v = VOICES.get(key); if (!v) return;
  try { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(Math.max(v.g.gain.value, 0.0001), t); v.g.gain.exponentialRampToValueAtTime(0.0001, t + (rel || 0.09)); v.o.forEach(o => o.stop(t + (rel || 0.09) + 0.03)); } catch (e) {}
  VOICES.delete(key);
}
function killAll() { if (!AC) return; const t = AC.currentTime; [...VOICES.keys()].forEach(k => killVoice(k, t)); }

// 음 하나 치기. ring = 울리는 시간(초)
function playNote(inst, ev, t, ring) {
  const piano = inst.id === 'piano';
  killVoice(ev.key, t, piano ? 0.14 : 0.09);
  const ch = chain(inst.id);
  const src = AC.createBufferSource();
  let vel = ev.vel * (0.9 + Math.random() * 0.2), dest = ch.inp, rel = piano ? 0.28 : 0.12;
  const sample = inst.type === 'fret' && SAMP.some(Boolean) && !ev.mute;
  if (sample) {
    let best = null, bd = 99;
    SAMP.forEach(x => { if (x) { const d = Math.abs(ev.midi - x.midi) + (ev.midi < x.midi ? 0.5 : 0); if (d < bd) { bd = d; best = x; } } });
    src.buffer = best.buf; src.playbackRate.value = Math.pow(2, (ev.midi - best.midi) / 12);
    vel *= 1.6; dest = ch.post;
  } else if (inst.id === 'guitar') { src.buffer = guitarBuf(ev.midi, ev.mute); vel *= 1 - 0.4 * Math.max(0, Math.min(1, (ev.midi - 52) / 30)); }
  else if (inst.id === 'bass') src.buffer = bassBuf(ev.midi, ev.mute);
  else { src.buffer = pianoBuf(ev.midi); vel *= 1 - 0.3 * Math.max(0, Math.min(1, (ev.midi - 60) / 36)); }
  const g = AC.createGain();
  g.gain.setValueAtTime(vel, t);
  const dur = src.buffer.duration / src.playbackRate.value;
  if (ev.mute) ring = 0.07;
  if (ring < dur) { g.gain.setValueAtTime(vel, t + ring); g.gain.exponentialRampToValueAtTime(0.0001, t + ring + rel); }
  let out = g;
  if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = ev.pan || 0; g.connect(p); out = p; }
  src.connect(g); out.connect(dest); src.start(t); src.stop(t + Math.min(dur, ring + rel) + 0.05);
  VOICES.set(ev.key, { g, o: [src] });
}

// 녹음 파일 불러오기 (줄 악기)
function loadSample(inst, i, file, done) {
  try { ensureAC(); } catch (e) { done('이 브라우저에서는 소리를 쓸 수 없어요.'); return; }
  file.arrayBuffer().then(ab => AC.decodeAudioData(ab)).then(buf => {
    const d = buf.getChannelData(0);
    let pk = 0; for (let n = 0; n < d.length; n++) pk = Math.max(pk, Math.abs(d[n]));
    let st0 = 0; while (st0 < d.length && Math.abs(d[st0]) < pk * 0.08) st0++;
    st0 = Math.max(0, st0 - Math.floor(buf.sampleRate * 0.004));
    const len = Math.min(d.length - st0, Math.floor(buf.sampleRate * 5));
    const nb = AC.createBuffer(1, len, buf.sampleRate), o = nb.getChannelData(0);
    for (let c = 0; c < buf.numberOfChannels; c++) { const x = buf.getChannelData(c); for (let n = 0; n < len; n++) o[n] += x[st0 + n] / buf.numberOfChannels; }
    let p2 = 0; for (let n = 0; n < len; n++) p2 = Math.max(p2, Math.abs(o[n])); if (p2 > 0) for (let n = 0; n < len; n++) o[n] /= p2;
    const fade = Math.floor(nb.sampleRate * 0.3); for (let n = 0; n < fade && n < len; n++) o[len - 1 - n] *= n / fade;
    SAMP[i] = { buf: nb, midi: inst.tuning[i] };
    done('사용 중 (' + nb.duration.toFixed(1) + '초)', true);
  }).catch(() => done('소리 파일을 읽을 수 없어요. mp3, m4a, wav 파일을 올려 주세요.'));
}

// 반복 재생
const LOOP = { riff: null, inst: null, timer: null, next: 0, idx: 0 };
function stepDur() { const R = LOOP.riff; return R.ts === 6 ? 60 / R.bpm / 3 / R.res : 60 / R.bpm / R.res; }
function tick() {
  const R = LOOP.riff; if (!R || !R.cols.length) return;
  const sd = stepDur();
  while (LOOP.next < AC.currentTime + 0.25) {
    const c = R.cols[LOOP.idx % R.cols.length];
    c.ev.forEach(ev => playNote(LOOP.inst, ev, LOOP.next + ev.delay + Math.random() * 0.006, ev.ring == null ? 4 : ev.ring * sd));
    LOOP.next += sd; LOOP.idx++;
  }
}
function startLoop(inst, riff) {
  stopLoop();
  ensureAC(); AC.resume();
  LOOP.riff = riff; LOOP.inst = inst; LOOP.idx = 0; LOOP.next = AC.currentTime + 0.08;
  tick(); LOOP.timer = setInterval(tick, 25);
}
function stopLoop() { if (LOOP.timer) { clearInterval(LOOP.timer); LOOP.timer = null; } killAll(); }
const isLooping = () => !!LOOP.timer;
