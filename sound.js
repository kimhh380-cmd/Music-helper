// 소리: 기타 음 합성, 리버브, 녹음 파일 재생, 반복 재생
let AC=null,MASTER=null,SCHED=null,NEXT=0,IDX=0;const VO=[null,null,null,null,null,null];
function killVoice(s,t){const v=VO[s];if(!v)return;try{v.g.gain.cancelScheduledValues(t);v.g.gain.setValueAtTime(Math.max(v.g.gain.value,0.0001),t);v.g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);v.o.forEach(o=>o.stop(t+0.12))}catch(e){}VO[s]=null}
const KSC={};
// 두 개의 약간 다른 줄 진동(가로·세로 방향)을 합쳐 자연스러운 울림을 만든다
function ksString(y,len,sr,hz,decay,bright,pickPos,seed,soft){const N=sr/hz,Ni=Math.floor(N),fr=N-Ni;const buf=new Float32Array(len);
let rnd=seed;const R=()=>{rnd=(rnd*16807)%2147483647;return rnd/1073741823.5-1};
const ex=new Float32Array(Ni+3);let lp=0;for(let n=0;n<ex.length;n++){lp+=soft*(R()-lp);ex[n]=lp}
const P=Math.max(1,Math.round(N*pickPos));for(let n=ex.length-1;n>=P;n--)ex[n]-=ex[n-P];
let m=0;for(let n=0;n<ex.length;n++)m+=ex[n];m/=ex.length;for(let n=0;n<ex.length;n++){buf[n]=ex[n]-m}
for(let n=ex.length;n<len;n++){const a=buf[n-Ni]*(1-fr)+buf[n-Ni-1]*fr,b=buf[n-Ni-1]*(1-fr)+buf[n-Ni-2]*fr;buf[n]=decay*((1-bright)*a+bright*b)}
for(let n=0;n<len;n++)y[n]+=buf[n]}
function ksBuf(midi,mute){const key=midi+(mute?'m':'');if(KSC[key])return KSC[key];const sr=AC.sampleRate,hz=440*Math.pow(2,(midi-69)/12);const dur=mute?0.3:4.5,len=Math.floor(sr*dur);const buf=AC.createBuffer(1,len,sr),y=buf.getChannelData(0);
const hi=Math.max(0,Math.min(1,(midi-40)/40));const T60=mute?0.12:(4.5-hi*2)*(1+2.2*hi);const decay=Math.pow(10,-3/(hz*T60));const bright=mute?0.5:0.34-0.24*hi;
ksString(y,len,sr,hz,decay,bright,0.18,midi*97+11,mute?0.18:0.24);ksString(y,len,sr,hz*1.0009,decay*0.9998,bright,0.22,midi*131+7,mute?0.18:0.2);
let dc=0,prev=0;for(let n=0;n<len;n++){const x=y[n];dc=x-prev+0.995*dc;prev=x;y[n]=dc}
const att=Math.floor(sr*0.007);for(let n=0;n<att&&n<len;n++)y[n]*=n/att;
const fade=Math.floor(sr*0.2);for(let n=0;n<fade;n++)y[len-1-n]*=n/fade;
let pk=0;for(let n=0;n<len;n++)pk=Math.max(pk,Math.abs(y[n]));if(pk>0)for(let n=0;n<len;n++)y[n]/=pk;
return KSC[key]=buf}
let BODY=null,POST=null;const SAMP=[null,null,null,null,null,null];
function irBody(){const sr=AC.sampleRate,len=Math.floor(sr*0.35),b=AC.createBuffer(2,len,sr);const modes=[[98,0.9,0.06],[196,0.7,0.05],[230,0.5,0.04],[390,0.35,0.03],[520,0.3,0.025],[700,0.2,0.02],[1050,0.12,0.015],[1600,0.08,0.01]];
for(let c=0;c<2;c++){const d=b.getChannelData(c);d[0]=1;for(let n=1;n<len;n++){const t=n/sr;let v=0;for(const [f,a,tau] of modes)v+=a*Math.exp(-t/tau)*Math.sin(2*Math.PI*f*(1+c*0.004)*t);d[n]=v*0.18}}
return b}
function irRoom(){const sr=AC.sampleRate,len=Math.floor(sr*2.6),b=AC.createBuffer(2,len,sr);const pre=Math.floor(sr*0.018);
const ER=[[0.011,0.5],[0.019,0.38],[0.027,0.3],[0.037,0.24],[0.049,0.18],[0.061,0.14]];
for(let c=0;c<2;c++){const d=b.getChannelData(c);ER.forEach(([t,g],i)=>{const n=Math.floor(sr*(t+(c?0.003*(i%2?1:-1):0)));if(n<len)d[n]+=g*(i%2===c?1:0.7)});
let lp=0;for(let n=pre;n<len;n++){const x=(n-pre)/(len-pre);const k=0.5-0.38*x;lp+=k*((Math.random()*2-1)-lp);const env=Math.min(1,(n-pre)/(sr*0.03))*Math.exp(-x*6.2);d[n]+=lp*env*0.55}}
return b}
function body(){if(BODY)return BODY;const inp=AC.createGain();const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=75;const conv=AC.createConvolver();conv.normalize=true;conv.buffer=irBody();
const dry=AC.createGain();dry.gain.value=0.55;const bodyG=AC.createGain();bodyG.gain.value=0.6;const tone=AC.createBiquadFilter();tone.type='lowpass';tone.frequency.value=3600;tone.Q.value=0.4;const warm=AC.createBiquadFilter();warm.type='peaking';warm.frequency.value=2500;warm.Q.value=0.9;warm.gain.value=-5;
const room=AC.createConvolver();room.buffer=irRoom();const rdamp=AC.createBiquadFilter();rdamp.type='lowpass';rdamp.frequency.value=2600;const rlow=AC.createBiquadFilter();rlow.type='highpass';rlow.frequency.value=160;const wet=AC.createGain();wet.gain.value=0.42;
inp.connect(hp);hp.connect(dry);hp.connect(conv);conv.connect(bodyG);dry.connect(tone);bodyG.connect(tone);tone.connect(warm);POST=warm;const dryOut=AC.createGain();dryOut.gain.value=0.8;warm.connect(dryOut);dryOut.connect(MASTER);warm.connect(rlow);rlow.connect(room);room.connect(rdamp);rdamp.connect(wet);wet.connect(MASTER);return BODY=inp}
function note(s,t,midi,vel,mute,ring){killVoice(s,t);if(SAMP.some(Boolean)){body();return sampNote(s,t,midi,vel,mute,ring)}const src=AC.createBufferSource();src.buffer=ksBuf(midi,mute);const g=AC.createGain();const v=vel*(0.9+Math.random()*0.2)*(1-0.4*Math.max(0,Math.min(1,(midi-52)/30)));g.gain.setValueAtTime(v,t);
if(!mute&&ring<4){g.gain.setValueAtTime(v,t+ring);g.gain.exponentialRampToValueAtTime(0.0001,t+ring+0.12)}
let out=g;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=(s-2.5)*0.09;g.connect(p);out=p}src.connect(g);out.connect(body());src.start(t);VO[s]={g,o:[src]}}
function sampNote(s,t,midi,vel,mute,ring){let best=null,bd=99;SAMP.forEach(x=>{if(x){const d=Math.abs(midi-x.midi)+(midi<x.midi?0.5:0);if(d<bd){bd=d;best=x}}});
const src=AC.createBufferSource();src.buffer=best.buf;src.playbackRate.value=Math.pow(2,(midi-best.midi)/12);const g=AC.createGain();const v=vel*1.6*(0.9+Math.random()*0.2);g.gain.setValueAtTime(v,t);
const r=mute?0.07:Math.min(ring,best.buf.duration/src.playbackRate.value);g.gain.setValueAtTime(v,t+r);g.gain.exponentialRampToValueAtTime(0.0001,t+r+(mute?0.03:0.15));
let out=g;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=(s-2.5)*0.09;g.connect(p);out=p}src.connect(g);out.connect(POST);src.start(t);src.stop(t+r+0.2);VO[s]={g,o:[src]}}
function ensureAC(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!MASTER){MASTER=AC.createGain();MASTER.gain.value=0.9;const comp=AC.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.attack.value=0.01;comp.release.value=0.25;MASTER.connect(comp);comp.connect(AC.destination)}}
function loadSample(i,file){const st=document.getElementById('smst'+i);st.textContent='불러오는 중…';try{ensureAC()}catch(e){st.textContent='이 브라우저에서는 소리를 쓸 수 없어요.';return}
file.arrayBuffer().then(ab=>AC.decodeAudioData(ab)).then(buf=>{const d=buf.getChannelData(0);let pk=0;for(let n=0;n<d.length;n++)pk=Math.max(pk,Math.abs(d[n]));let st0=0;while(st0<d.length&&Math.abs(d[st0])<pk*0.08)st0++;st0=Math.max(0,st0-Math.floor(buf.sampleRate*0.004));
const len=Math.min(d.length-st0,Math.floor(buf.sampleRate*5));const nb=AC.createBuffer(1,len,buf.sampleRate),o=nb.getChannelData(0);for(let c=0;c<buf.numberOfChannels;c++){const x=buf.getChannelData(c);for(let n=0;n<len;n++)o[n]+=x[st0+n]/buf.numberOfChannels}
let p2=0;for(let n=0;n<len;n++)p2=Math.max(p2,Math.abs(o[n]));if(p2>0)for(let n=0;n<len;n++)o[n]/=p2;const fade=Math.floor(nb.sampleRate*0.3);for(let n=0;n<fade&&n<len;n++)o[len-1-n]*=n/fade;
SAMP[i]={buf:nb,midi:OM[i]};st.textContent='사용 중 ('+nb.duration.toFixed(1)+'초)';document.getElementById('smclr').hidden=false}).catch(()=>{st.textContent='소리 파일을 읽을 수 없어요. mp3, m4a, wav 파일을 올려 주세요.'})}
function stepDur(){return RIFF.ts===6?60/RIFF.bpm/3/RIFF.res:60/RIFF.bpm/RIFF.res}
function scheduleCol(c,t){const st=document.getElementById('rfst').value;const ss=Object.keys(c.notes).map(Number).sort((a,b)=>c.mark==='↑'?b-a:a-b);const n=ss.length;
ss.forEach((s,j)=>{const v=c.notes[s];const mute=v==='x';const pm=c.mark==='PM';const midi=OM[s]+(mute?0:+v);
const ring=pm?stepDur()*0.9:st==='funk'?stepDur()*0.8:4;note(s,t+j*(st==='strum'?0.018:0.005)+Math.random()*0.006,midi,(pm?0.45:0.38)/Math.max(1,n*0.42)*(c.mark==='↑'?0.7:1)*(c.acc?1.1:0.85),mute,ring)})}
function tick(){if(!RIFF||!RIFF.cols.length)return;const sd=stepDur();while(NEXT<AC.currentTime+0.25){const c=RIFF.cols[IDX%RIFF.cols.length];scheduleCol(c,NEXT);NEXT+=sd;IDX++}}
function stopRiff(){if(SCHED){clearInterval(SCHED);SCHED=null}if(AC){const t=AC.currentTime;for(let s=0;s<6;s++)killVoice(s,t)}const b=document.getElementById('rfplay');b.textContent='▶ 재생 (반복)';b.setAttribute('aria-pressed','false')}
function playRiff(){if(!RIFF)return;stopRiff();try{ensureAC();AC.resume();}catch(e){document.getElementById('rferr').textContent='이 브라우저에서는 소리를 낼 수 없어요.';return}
IDX=0;NEXT=AC.currentTime+0.08;tick();SCHED=setInterval(tick,25);const b=document.getElementById('rfplay');b.textContent='● 반복 재생 중';b.setAttribute('aria-pressed','true')}
document.getElementById('rfgo').onclick=makeRiff;document.getElementById('rfplay').onclick=()=>{if(SCHED){return}makeRiff();playRiff()};document.getElementById('rfstop').onclick=stopRiff;
['rfts','rfst','rfpos','rfsp'].forEach(id=>document.getElementById(id).onchange=()=>{syncSP();makeRiff();if(SCHED)IDX=0});
function syncSP(){const st=document.getElementById('rfst').value;document.getElementById('rfspw').hidden=st!=='strum';const i=+document.getElementById('rfsp').value||0;document.getElementById('rfspd').textContent=st==='strum'?STRUM[i].n+': '+STRUM[i].d:''}document.getElementById('rfbpm').onchange=()=>{if(RIFF)RIFF.bpm=Math.max(40,Math.min(220,+document.getElementById('rfbpm').value||100))};
let RKR=9,RKM=1,RKS=0;
function drawRK(){const L=RKM?MINK:MAJK;const kr=document.getElementById('rkr');kr.innerHTML=L.map((n,i)=>`<button id="rkr${i}" aria-pressed="${i===RKR}">${n}${RKM?'m':''}</button>`).join('');kr.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{RKR=i;drawRK()});
const kn=L[RKR],D=RKM?MIN:MAJ;const el=document.getElementById('rkc');el.innerHTML=D.map(([deg,semi,rn,tq,sq],i)=>{const cr=spell(kn,deg,semi);const nm=names(cr,QI[RKS?sq:tq])[0];return `<button id="rkc${i}" data-c="${nm}" aria-label="${nm} 추가"><span style="display:block;font-size:.7rem;color:inherit;opacity:.7;font-weight:400">${rn}</span>${nm}</button>`}).join('');
el.querySelectorAll('button').forEach(b=>b.onclick=()=>{const f=document.getElementById('rfc');f.value=(f.value.trim()?f.value.trim()+' ':'')+b.dataset.c;makeRiff();})}
seg(document.getElementById('rkm'),['장조','단조'],RKM,i=>{const pc=pcOf((RKM?MINK:MAJK)[RKR]);RKM=i;RKR=(RKM?MINK:MAJK).findIndex(n=>pcOf(n)===pc);drawRK()});
seg(document.getElementById('rks'),['3화음','세븐스'],RKS,i=>{RKS=i;drawRK()});
document.getElementById('rkundo').onclick=()=>{const f=document.getElementById('rfc');const p=f.value.trim().split(/\s+/);p.pop();f.value=p.join(' ');if(f.value)makeRiff();else{stopRiff();RIFF=null;document.getElementById('rft').textContent='';document.getElementById('rfv').innerHTML=''}};
document.getElementById('rkclr').onclick=()=>{document.getElementById('rfc').value='';stopRiff();RIFF=null;document.getElementById('rft').textContent='코드를 눌러 진행을 만들어 보세요.';document.getElementById('rfv').innerHTML='';document.getElementById('rferr').textContent=''};
[0,1,2,3,4,5].forEach(i=>document.getElementById('smf'+i).onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)loadSample(i,f)});
document.getElementById('smclr').onclick=()=>{for(let i=0;i<6;i++){SAMP[i]=null;document.getElementById('smst'+i).textContent='없음';document.getElementById('smf'+i).value=''}document.getElementById('smclr').hidden=true};
let rfInit=0;
