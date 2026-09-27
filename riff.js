// 리프 만들기 탭: 코드 진행 해석, 주법·스트로크 패턴, 타브 만들기
// ---- riff maker
(function(){const ps=document.getElementById('rfpos');for(let i=0;i<=20;i++){const o=document.createElement('option');o.value=i;o.textContent=i+'–'+(i+4)+'프렛';ps.appendChild(o)}})();
const SUF={'':'M','M':'M','maj':'M','m':'m','min':'m','-':'m','7':'7','M7':'M7','maj7':'M7','Δ7':'M7','m7':'m7','min7':'m7','-7':'m7','5':'5','sus2':'sus2','sus4':'sus4','sus':'sus4','7sus4':'7sus4','6':'6','m6':'m6','add9':'add9','9':'9','M9':'M9','maj9':'M9','m9':'m9','mM7':'mM7','mmaj7':'mM7','dim':'dim','°':'dim','m7b5':'m7b5','m7♭5':'m7b5','ø':'m7b5','dim7':'dim7','°7':'dim7','aug':'aug','+':'aug'};
function parseProg(txt,ts){const bb=ts===6?6:ts;const out=[];for(const tok of txt.trim().split(/[\s,|]+/).filter(Boolean)){const m=tok.match(/^([A-Ga-g])([#b♯♭]?)([^:\/]*)(?:\/[^:]*)?(?::(\d+(?:\.\d+)?))?$/);if(!m)throw `“${tok}”을(를) 코드로 읽을 수 없어요. 예: G, Am, D7, Cmaj7, F#m7b5`;
const acc=m[2].replace('#','♯').replace('b','♭');const root=m[1].toUpperCase()+acc;const q=SUF[m[3]];if(q===undefined)throw `“${m[3]}” 코드 종류는 아직 지원하지 않아요. 지원: M, m, 7, M7, m7, 5, sus2, sus4, 7sus4, 6, m6, add9, 9, M9, m9, mM7, dim, m7b5, dim7, aug`;
const beats=m[4]?+m[4]:bb;if(beats<=0||beats>32)throw `“${tok}”의 박수는 1~32 사이로 적어 주세요.`;out.push({name:root+m[3],r:pcOf(root),qi:QI[q],beats})}if(!out.length)throw '코드를 하나 이상 적어 주세요.';return out}
const STF={pw:v=>v.n<=3&&v.sg===2,arp:v=>v.n>=4&&v.i===0,funk:v=>v.n>=3&&v.n<=4&&v.sg!==2&&v.p>=4,strum:v=>v.n>=5};
function pickV(c,st,prev,pos){const qi=st==='pw'?QI['5']:c.qi;let L=voicings(c.r,qi).all;let F=L.filter(STF[st]);if(pos>=0){const w=F.filter(v=>fits(v,pos));if(w.length)F=w}if(!F.length)F=L.filter(v=>pos<0||fits(v,pos));if(!F.length)F=L;const anchor=prev?prev.p:(pos>=0?pos:(st==='funk'?7:st==='pw'?3:1));return {v:F.slice().sort((a,b)=>(Math.abs(a.p-anchor)*1.2+a.sc)-(Math.abs(b.p-anchor)*1.2+b.sc))[0],qi}}
const STRUM=[
{n:'칼립소 (포크 기본)',d:'↓ ↓↑ ↑↓↑ — 통기타 반주에서 가장 많이 쓰는 패턴',4:{r:2,p:'D.DU.UDU'},3:{r:2,p:'D.DUDU'},6:{r:1,p:'D.DUDU'}},
{n:'8비트 다운업',d:'↓↑↓↑ 고르게 — 록·팝 반주의 기본',4:{r:2,p:'DUDUDUDU'},3:{r:2,p:'DUDUDU'},6:{r:1,p:'DUDUDU'}},
{n:'슬로우 고고 (16비트 발라드)',d:'16분음표로 쪼갠 부드러운 발라드 리듬',4:{r:4,p:'D..UD.DUD..UD.DU'},3:{r:4,p:'D..UD.DUD.DU'},6:{r:2,p:'D..UD.D..UDU'}},
{n:'4비트 다운 (록 발라드)',d:'박마다 ↓ 한 번씩 — 가장 쉬운 패턴',4:{r:2,p:'D.D.D.D.'},3:{r:2,p:'D.D.D.'},6:{r:1,p:'D..D..'}}];
const PAT={pw:{4:'CCCCCCRF',3:'CCCCRF',6:'CCCRCF'},funk:{4:'CxCCxCxC',3:'CxCxCC',6:'CxCCxC'},strum:{4:'D.DU.UDU',3:'D.DUDU',6:'D..DU.'}};
let RIFF=null;
function makeRiff(){const err=document.getElementById('rferr');err.textContent='';try{const ts=+document.getElementById('rfts').value,st=document.getElementById('rfst').value,pos=+document.getElementById('rfpos').value;const prog=parseProg(document.getElementById('rfc').value,ts);
const SP=st==='strum'?STRUM[+document.getElementById('rfsp').value||0][ts]:null;const spb=SP?SP.r:(ts===6?1:2),barSteps=SP?SP.p.length:(ts===6?6:ts*2);const cols=[];let prev=null;const used=[];
prog.forEach(c=>{const {v,qi}=pickV(c,st,prev,pos);prev=v;used.push({c,v,qi});const pl=[];v.t.forEach((f,s)=>{if(f!=='x')pl.push(s)});const n=Math.round(c.beats*spb);
for(let k=0;k<n;k++){const g=cols.length%barSteps;const col={notes:{},mark:'',chord:k===0?c.name:''};
if(st==='arp'){const up=pl.slice(1);const cyc=up.concat(up.slice(1,-1).reverse());const s=k%(barSteps/ (ts===6?1:2))===0&&(k%barSteps===0||(ts===4&&g===4))?pl[0]:cyc.length?cyc[(k-1+cyc.length*4)%cyc.length]:pl[0];col.notes[s]=v.t[s]}
else{const PP=SP?SP.p:PAT[st][ts];const ch=PP[g%PP.length];col.acc=g%spb===0;
if(st==='pw'){if(ch==='C'){pl.forEach(s=>col.notes[s]=v.t[s]);col.mark='PM'}else if(ch==='R')col.notes[pl[0]]=v.t[pl[0]];else col.notes[pl[1]||pl[0]]=v.t[pl[1]||pl[0]]}
else if(st==='funk'){pl.forEach(s=>col.notes[s]=ch==='C'?v.t[s]:'x')}
else{if(ch!=='.'){pl.forEach(s=>col.notes[s]=v.t[s]);col.mark=ch==='D'?'↓':'↑'}}}
cols.push(col)}});
RIFF={cols,ts,barSteps,res:spb,bpm:Math.max(40,Math.min(220,+document.getElementById('rfbpm').value||100)),spb};
document.getElementById('rfv').innerHTML=used.map(({c,v,qi})=>card(v,names(DR[c.r]||c.name,qi),c.r,false).replace(/<span class="nm">[^<]*<\/span>/,`<span class="nm">${c.name}</span>`)).join('');
renderTab()}catch(e){err.textContent=typeof e==='string'?e:'리프를 만드는 중 문제가 생겼어요. 코드 진행을 다시 확인해 주세요.';}}
function renderTab(){const {cols,ts,barSteps,res}=RIFF;const W=res>=4?3:4;const barsPerRow=res>=4?1:2,rowSteps=barSteps*barsPerRow;const beats=ts;const sub=res>=4?['','e','&','a']:res===2?['','&']:[''];const cnt=Array.from({length:beats},(_,i)=>sub.map((x,j)=>j===0?String(i+1):x)).flat();let out=[];
for(let r0=0;r0<cols.length;r0+=rowSteps){const seg=cols.slice(r0,r0+rowSteps);const L={ch:'  ',mk:'  ',cn:'  '};const S=SNM.map(n=>n+'|');
seg.forEach((c,j)=>{if(j>0&&j%barSteps===0){S.forEach((_,i)=>S[i]+='|');L.ch+=' ';L.mk+=' ';L.cn+=' '}
L.ch+=(c.chord||'').padEnd(W).slice(0,W);L.mk+=(c.mark||'').padEnd(W);L.cn+=cnt[j%barSteps].padEnd(W);
for(let i=0;i<6;i++){const s=5-i,v=c.notes[s];S[i]+=(v===undefined?'-':String(v)).padEnd(W,'-')}});
S.forEach((_,i)=>S[i]+='|');out.push([L.ch,L.mk,...S,L.cn].join('\n'))}
document.getElementById('rft').textContent=out.join('\n\n')}
