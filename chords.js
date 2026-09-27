// 코드 계산 엔진: 코드 종류, 운지 계산, 다이어그램 그리기, 공통 도우미
const TU=[4,9,2,7,11,4],OM=[40,45,50,55,59,64];
const LET='CDEFGAB',NAT={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pcOf(n){return (NAT[n[0]]+[...n.slice(1)].reduce((a,c)=>a+(c==='♯'?1:c==='♭'?-1:c==='𝄪'?2:c==='𝄫'?-2:0),0)+12)%12}
function spell(root,deg,semi){const l=LET[(LET.indexOf(root[0])+deg)%7];const pc=(pcOf(root)+semi)%12;const d=((pc-NAT[l]+18)%12)-6;return l+({0:'',1:'♯',2:'𝄪','-1':'♭','-2':'𝄫'})[d]}
// tone: [deg,semi,required]
const QS=[
{k:'M',s:'',n:'메이저',t:[[2,4,1],[4,7,1]]},
{k:'m',s:'m',n:'마이너',t:[[2,3,1],[4,7,1]]},
{k:'7',s:'7',n:'세븐',t:[[2,4,1],[4,7,0],[6,10,1]]},
{k:'M7',s:'M7',n:'메이저 세븐',t:[[2,4,1],[4,7,0],[6,11,1]]},
{k:'m7',s:'m7',n:'마이너 세븐',t:[[2,3,1],[4,7,0],[6,10,1]]},
{k:'5',s:'5',n:'파워코드',t:[[4,7,1]],min:2,only:1},
{k:'sus2',s:'sus2',n:'서스 투',t:[[1,2,1],[4,7,1]]},
{k:'sus4',s:'sus4',n:'서스 포',t:[[3,5,1],[4,7,1]]},
{k:'7sus4',s:'7sus4',n:'세븐 서스 포',t:[[3,5,1],[4,7,0],[6,10,1]]},
{k:'6',s:'6',n:'식스',t:[[2,4,1],[4,7,0],[5,9,1]]},
{k:'m6',s:'m6',n:'마이너 식스',t:[[2,3,1],[4,7,0],[5,9,1]]},
{k:'add9',s:'add9',n:'애드 나인',t:[[2,4,1],[4,7,0],[1,2,1]]},
{k:'9',s:'9',n:'나인',t:[[2,4,1],[4,7,0],[6,10,1],[1,2,1]]},
{k:'M9',s:'M9',n:'메이저 나인',t:[[2,4,1],[4,7,0],[6,11,1],[1,2,1]]},
{k:'m9',s:'m9',n:'마이너 나인',t:[[2,3,1],[4,7,0],[6,10,1],[1,2,1]]},
{k:'mM7',s:'mM7',n:'마이너 메이저 세븐',t:[[2,3,1],[4,7,0],[6,11,1]]},
{k:'dim',s:'dim',n:'디미니시',t:[[2,3,1],[4,6,1]]},
{k:'m7b5',s:'m7♭5',n:'하프 디미니시',t:[[2,3,1],[4,6,1],[6,10,1]]},
{k:'dim7',s:'dim7',n:'디미니시 세븐',t:[[2,3,1],[4,6,1],[6,9,1]]},
{k:'aug',s:'aug',n:'어그먼트',t:[[2,4,1],[4,8,1]]}];
const QI=Object.fromEntries(QS.map((q,i)=>[q.k,i]));
const OPEN={M:{0:'x,3,2,0,1,0',2:'x,x,0,2,3,2',4:'0,2,2,1,0,0',7:'3,2,0,0,0,3',9:'x,0,2,2,2,0'},m:{9:'x,0,2,2,1,0',2:'x,x,0,2,3,1',4:'0,2,2,0,0,0'},'7':{0:'x,3,2,3,1,0',2:'x,x,0,2,1,2',4:'0,2,0,1,0,0',7:'3,2,0,0,0,1',9:'x,0,2,0,2,0',11:'x,2,1,2,0,2'},M7:{0:'x,3,2,0,0,0',2:'x,x,0,2,2,2',4:'0,2,1,1,0,0',7:'3,2,0,0,0,2',9:'x,0,2,1,2,0',5:'x,x,3,2,1,0'},m7:{9:'x,0,2,0,1,0',2:'x,x,0,2,1,1',4:'0,2,0,0,0,0',11:'x,2,0,2,0,2'},sus4:{9:'x,0,2,2,3,0',2:'x,x,0,2,3,3',4:'0,2,2,2,0,0'},sus2:{9:'x,0,2,2,0,0',2:'x,x,0,2,3,0'},'5':{4:'0,2,2,x,x,x',9:'x,0,2,2,x,x',2:'x,x,0,2,3,x'},'6':{0:'x,3,2,2,1,0',7:'3,2,0,0,0,0'},'7sus4':{9:'x,0,2,0,3,0',2:'x,x,0,2,1,3',4:'0,2,0,2,0,0'},add9:{0:'x,3,2,0,3,0',7:'3,x,0,2,0,3'},dim7:{},m7b5:{}};
const SH={M:[['A폼 바레',9,'x,0,2,2,2,0','5번줄 근음 바레'],['E폼 바레',4,'0,2,2,1,0,0','6번줄 근음 풀 바레'],['D폼',2,'x,x,0,2,3,2','4번줄 근음, 고음 4줄'],['고음 3줄 (E폼 윗부분)',4,'x,x,x,1,0,0','리듬 커팅용'],['고음 3줄 (A폼 윗부분)',9,'x,x,x,2,2,0','리듬 커팅용'],['C폼',0,'x,3,2,0,1,0','울림이 풍부한 보이싱']],
m:[['Am폼 바레',9,'x,0,2,2,1,0','5번줄 근음 바레'],['Em폼 바레',4,'0,2,2,0,0,0','6번줄 근음 풀 바레'],['Dm폼',2,'x,x,0,2,3,1','4번줄 근음'],['고음 3줄 (Em폼 윗부분)',4,'x,x,x,0,0,0','리듬 커팅용'],['고음 3줄 (Am폼 윗부분)',9,'x,x,x,2,1,0','리듬 커팅용']],
'7':[['A7폼 바레',9,'x,0,2,0,2,0','5번줄 근음 바레'],['E7폼 바레',4,'0,2,0,1,0,0','6번줄 근음 풀 바레'],['D7폼',2,'x,x,0,2,1,2','4번줄 근음'],['E7 셸 (5번줄 뮤트)',4,'0,x,0,1,0,x','블루스·재즈 셸 보이싱'],['C7폼',0,'x,3,2,3,1,0','5번줄 근음']],
M7:[['AM7폼 바레',9,'x,0,2,1,2,0','5번줄 근음 바레'],['EM7 셸 (5·1번줄 뮤트)',4,'0,x,1,1,0,x','재즈·팝에서 많이 씀'],['DM7폼',2,'x,x,0,2,2,2','4번줄 근음'],['CM7폼',0,'x,3,2,0,0,0','5번줄 근음']],
m7:[['Am7폼 바레',9,'x,0,2,0,1,0','5번줄 근음 바레'],['Em7폼 바레',4,'0,2,0,0,0,0','6번줄 근음 풀 바레'],['Dm7폼',2,'x,x,0,2,1,1','4번줄 근음'],['Em7 셸 (5·1번줄 뮤트)',4,'0,x,0,0,0,x','재즈 셸 보이싱']],
'5':[['6번줄 근음 파워코드',4,'0,2,2,x,x,x','록·메탈의 기본'],['5번줄 근음 파워코드',9,'x,0,2,2,x,x','록·메탈의 기본'],['6번줄 2줄 파워코드',4,'0,2,x,x,x,x','가장 간단한 형태']],
sus4:[['Asus4폼 바레',9,'x,0,2,2,3,0','5번줄 근음'],['Esus4폼 바레',4,'0,2,2,2,0,0','6번줄 근음']],
sus2:[['Asus2폼',9,'x,0,2,2,0,0','5번줄 근음']],
'7sus4':[['A7sus4폼',9,'x,0,2,0,3,0','5번줄 근음'],['E7sus4폼',4,'0,2,0,2,0,0','6번줄 근음']],
'6':[['E6 셸',4,'0,x,-1,1,0,x','6번줄 근음']],m6:[['Em6 셸',4,'0,x,-1,0,0,x','6번줄 근음']],
'9':[['C9폼',0,'x,3,2,3,3,x','5번줄 근음, 펑크 기타의 대표 보이싱']],M9:[['CM9폼',0,'x,3,2,4,3,x','5번줄 근음']],m9:[['Cm9폼',0,'x,3,1,3,3,x','5번줄 근음']],add9:[['Cadd9폼',0,'x,3,2,0,3,x','5번줄 근음']],
m7b5:[['Bm7♭5폼',11,'x,2,3,2,3,x','5번줄 근음'],['Em7♭5 (6번줄)',4,'0,x,0,0,-1,x','6번줄 근음']],dim7:[['dim7폼 (5번줄)',9,'x,0,1,-1,1,x','3프렛마다 같은 모양 반복'],['dim7폼 (4번줄)',2,'x,x,0,1,0,1','3프렛마다 같은 모양 반복']],
dim:[['dim 트라이어드 (고음)',2,'x,x,0,1,3,1','4번줄 근음']],aug:[['aug 트라이어드',9,'x,0,3,2,2,x','5번줄 근음, 4프렛마다 반복']],mM7:[['AmM7폼',9,'x,0,2,1,1,0','5번줄 근음']]};
function place(tpl,base,r){let f=(r-base+12)%12;const v=tpl.split(',');const nums=v.filter(x=>x!=='x').map(Number);if(f===0||Math.min(...nums)+f<0)f+=12;while(Math.min(...nums)+f<1&&nums.some(n=>n!==0))f+=12;const o=v.map(x=>x==='x'?'x':String(+x+f));if(o.some(x=>x!=='x'&&+x>24))return null;return o.join(',')}
const CACHE={};
function voicings(r,qi){const key=r+'_'+qi;if(CACHE[key])return CACHE[key];const q=QS[qi];
const tones=[[0,0,1],...q.t],pcs=tones.map(t=>(r+t[1])%12),req=new Set(pcs.filter((p,i)=>tones[i][2])),allow=new Set(pcs);const minS=q.min||3;const seen=new Map();
const opt=s=>{};
for(let w=1;w<=21;w++){const choices=[];for(let s=0;s<6;s++){const c=['x'];if(allow.has(TU[s]%12))c.push(0);for(let f=w;f<=w+3;f++)if(allow.has((TU[s]+f)%12))c.push(f);choices.push(c)}
const cur=[];(function rec(s){if(s<6){for(const c of choices[s]){cur[s]=c;rec(s+1)}return}
const pl=[];for(let i=0;i<6;i++)if(cur[i]!=='x')pl.push(i);if(pl.length<minS)return;let gap=0;for(let i=pl[0];i<=pl[pl.length-1];i++)if(cur[i]==='x')gap++;if(gap>1)return;
const ps=new Set(pl.map(i=>(TU[i]+cur[i])%12));for(const p of req)if(!ps.has(p))return;
const fr=pl.map(i=>cur[i]).filter(f=>f>0);if(!fr.length)return;let fg=0,mn=0;if(fr.length){mn=Math.min(...fr);const cm=fr.filter(f=>f===mn).length;fg=cm>1?fr.filter(f=>f!==mn).length+1:fr.length;if(fg>4)return;
if(fr.length>4){const bs=pl.filter(i=>cur[i]===mn);for(let i=bs[0];i<=pl[pl.length-1];i++)if(cur[i]===0)return}}
const t=cur.map(String).join(',');if(seen.has(t))return;const b=(TU[pl[0]]+cur[pl[0]])%12;const avg=pl.reduce((a,i)=>a+OM[i]+cur[i],0)/pl.length;
const mx=fr.length?Math.max(...fr):0;const sg=pl[0]>=3?1:pl[pl.length-1]<=2?2:3;seen.set(t,{sg,t:t.split(','),i:pcs.indexOf(b),p:mn,mx,g:gap,fg,n:pl.length,om:q.t.some(x=>!x[2])&&!ps.has((r+7)%12)?1:0,reg:avg<55?0:avg<64?1:2,op:pl.filter(i=>cur[i]===0).length})})(0)}
const fam=[],fs=new Set();const add=(t,l,o)=>{if(t&&seen.has(t)&&!fs.has(t)){fam.push(Object.assign({},seen.get(t),{l,o,f:1}));fs.add(t)}};
if(OPEN[q.k]&&OPEN[q.k][r])add(OPEN[q.k][r],'오픈 코드','가장 기본이 되는 운지');
(SH[q.k]||[]).forEach(([n,b,tpl,o])=>{const t=place(tpl,b,r);if(t){const m=Math.min(...t.split(',').filter(x=>x!=='x'&&x!=='0').map(Number));add(t,n+(isFinite(m)?` (${m}프렛)`:''),o)}});
const sc=v=>v.g*3+v.fg*.6+(v.i!==0?2:0)+(v.n<4&&!q.only?1:0)+v.om*.5+v.p*.04-(v.op&&v.p<=4?.8:0);
const rest=[...seen.values()].filter(v=>!fs.has(v.t.join(','))).sort((a,b)=>a.p-b.p||a.g-b.g||a.om-b.om||a.fg-b.fg||b.n-a.n);
const all=fam.concat(rest);all.forEach((v,i)=>{v.rank=i+1;v.sc=sc(v)-(v.f?3:0)});
return CACHE[key]={all,nf:fam.length}}
function names(rn,qi){const q=QS[qi];const nm=rn+q.s;return [nm,...q.t.map(t=>nm+'/'+spell(rn,t[0],t[1]))]}
function svg(t,r){const fr=t.map(v=>v==='x'||v==='0'?null:+v).filter(v=>v!==null);const mx=fr.length?Math.max(...fr):0,mn=fr.length?Math.min(...fr):0;const st=mx<=4?1:mn;const L=22,W=30,T=8,S=13,N=4;let o=`<svg class="dg" viewBox="0 0 ${L+W*N+6} ${T+S*5+22}" role="img" aria-label="${t.join(' ')}">`;
for(let i=0;i<6;i++){const y=T+i*S;o+=`<line class="ln" x1="${L}" y1="${y}" x2="${L+W*N}" y2="${y}"/>`}
for(let j=0;j<=N;j++){const x=L+j*W;o+=`<line class="${j===0&&st===1?'nut':'ln'}" x1="${x}" y1="${T}" x2="${x}" y2="${T+S*5}"/>`;if(j<N)o+=`<text x="${x+W/2}" y="${T+S*5+15}" text-anchor="middle">${st+j}</text>`}
const cnt=fr.filter(v=>v===mn).length;if(fr.length>4&&cnt>=2){const ys=[];t.forEach((v,s)=>{if(+v===mn&&v!=='0')ys.push(T+(5-s)*S)});const x=L+(mn-st+.5)*W;o+=`<rect class="bar" x="${x-5}" y="${Math.min(...ys)-5}" width="10" height="${Math.max(...ys)-Math.min(...ys)+10}" rx="5"/>`}
t.forEach((v,s)=>{const y=T+(5-s)*S;if(v==='x'){o+=`<text class="xm" x="${L-11}" y="${y+3.5}" text-anchor="middle">x</text>`;return}const f=+v,root=(TU[s]+f)%12===r;if(f===0){o+=`<circle class="${root?'opr':'op'}" cx="${L-11}" cy="${y}" r="4"/>`;return}o+=`<circle class="${root?'rt':'dot'}" cx="${L+(f-st+.5)*W}" cy="${y}" r="5"/>`});
return o+'</svg>'}
const REG=['낮은음','중간음','높은음'];
const fits=(v,n)=>v.p>=Math.max(n,1)&&v.mx<=n+4;
const NS=['전체','6줄','5줄','4줄','3줄','2줄'],nsOk=(v,k)=>k<=0||v.n===7-k;
const SG=['전체','1~3번줄만','4~6번줄만','양쪽 다 사용'],sgOk=(v,k)=>k===0||v.sg===k;
const OS=['전체','개방현 포함','개방현 없음'],osOk=(v,k)=>k===0||(k===1?v.op>0:v.op===0);
const rng=v=>(v.p===v.mx?v.p+'프렛':v.p+'–'+v.mx+'프렛')+' · '+v.n+'줄'+(v.sg===1?' · 1~3번줄':v.sg===2?' · 4~6번줄':'')+(v.op?' · 개방현':'');
function card(v,nm,r,showNote){const t=v.t,pos=v.p===0?'개방 포지션':v.p+'프렛~';return `<div class="c${v.f?' fam':''}"><div class="top"><span class="nm${v.f?' fs':''}">${nm[v.i]}</span><span class="rk">#${v.rank}</span></div>${showNote&&v.l?`<div class="lab">${v.l}</div>`:''}${svg(t,r)}<div class="meta">${t.join(' ')}<span class="reg">${rng(v)}</span>${v.om?' · <span class="om">5도 생략</span>':''}</div>${showNote&&v.o?`<div class="note">${v.o}</div>`:''}</div>`}
function seg(el,opts,val,cb){el.innerHTML=opts.map((o,i)=>`<button id="${el.id}-${i}" aria-pressed="${i===val}">${o}</button>`).join('');el.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{el.querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',o===b));cb(i)})}
