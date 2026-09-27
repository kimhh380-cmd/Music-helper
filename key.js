// 키별 코드 탭: 키 선택, 프렛 구간·줄 필터, 주법별 추천 코드
// ---- key view
const MAJK=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'],MINK=['C','C♯','D','E♭','E','F','F♯','G','G♯','A','B♭','B'];
const MAJ=[[0,0,'I','M','M7'],[1,2,'ii','m','m7'],[2,4,'iii','m','m7'],[3,5,'IV','M','M7'],[4,7,'V','M','7'],[5,9,'vi','m','m7'],[6,11,'vii°','dim','m7b5']];
const MIN=[[0,0,'i','m','m7'],[1,2,'ii°','dim','m7b5'],[2,3,'III','M','M7'],[3,5,'iv','m','m7'],[4,7,'v','m','m7'],[4,7,'V','M','7'],[5,8,'VI','M','M7'],[6,10,'VII','M','7']];
let KR=7,KM=0,KS=0,KG=0,KN=0,KO=0,KSG=0;
const kr=document.getElementById('kroots');
function drawKeyRoots(){const L=KM?MINK:MAJK;kr.innerHTML=L.map((n,i)=>`<button id="kr${i}" aria-pressed="${i===KR}">${n}${KM?'m':''}</button>`).join('');kr.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{KR=i;drawKeyRoots();drawKey()})}
seg(document.getElementById('kmode'),['장조','단조'],KM,i=>{KM=i;drawKeyRoots();drawKey()});
seg(document.getElementById('kset'),['3화음','세븐스'],KS,i=>{KS=i;drawKey()});
seg(document.getElementById('kns'),NS,KN,i=>{KN=i;drawKey()});seg(document.getElementById('kos'),OS,KO,i=>{KO=i;drawKey()});seg(document.getElementById('ksg'),SG,KSG,i=>{KSG=i;drawKey()});
const kpos=document.getElementById('kpos');function setKG(n){KG=Math.max(0,Math.min(20,n));kpos.value=KG;document.getElementById('kout').textContent=KG+'–'+(KG+4)+'프렛';drawKey()}
kpos.oninput=e=>setKG(+e.target.value);document.getElementById('kprev').onclick=()=>setKG(KG-1);document.getElementById('knext').onclick=()=>setKG(KG+1);
function drawKey(){const kn=(KM?MINK:MAJK)[KR],D=KM?MIN:MAJ;
document.getElementById('kdesc').textContent=`${kn}${KM?' 단조':' 장조'}에서 쓰는 코드예요. ${KG}–${KG+4}프렛 안에서 잡을 수 있는 운지를 치기 쉬운 순서로 보여줘요. 구간을 옮기면 손을 크게 움직이지 않고 이어 칠 수 있는 운지를 찾을 수 있어요. 옆으로 밀면 더 볼 수 있어요.`+(KM?' 단조의 V(메이저)는 화성단음계에서 온 코드로, 실제 곡에서 v보다 더 자주 쓰여요.':'');
const kf=v=>fits(v,KG)&&nsOk(v,KN)&&osOk(v,KO)&&sgOk(v,KSG);
const filt=`${KG}–${KG+4}프렛 · ${NS[KN]==='전체'?'줄 수 전체':NS[KN]} · ${SG[KSG]==='전체'?'줄 위치 전체':SG[KSG]} · ${OS[KO]==='전체'?'개방현 전체':OS[KO]}`;
const CR=D.map(([deg,semi,rn,tq,sq])=>{const cr=spell(kn,deg,semi),r=pcOf(cr),qi=QI[KS?sq:tq];return [rn,names(cr,qi)[0],voicings(r,qi).all.filter(kf).length]});
document.getElementById('kcnt').innerHTML=`<table><caption>현재 조건(${filt})에서 코드별 가능한 운지 개수 · 합계 ${CR.reduce((a,x)=>a+x[2],0)}개</caption><tr>${CR.map(x=>`<th>${x[0]}<br>${x[1]}</th>`).join('')}</tr><tr>${CR.map(x=>`<td class="${x[2]?'':'z'}">${x[2]?`<b>${x[2]}</b>개`:'0개'}</td>`).join('')}</tr></table>`;
drawStyles(kn,D);
document.getElementById('krows').innerHTML=D.map(([deg,semi,rn,tq,sq])=>{const croot=spell(kn,deg,semi);const r=pcOf(croot);const qk=KS?sq:tq,qi=QI[qk];const nm=names(croot,qi);const VA=voicings(r,qi).all.filter(v=>fits(v,KG)&&nsOk(v,KN)&&osOk(v,KO)&&sgOk(v,KSG)),V=VA.slice().sort((a,b)=>a.sc-b.sc).slice(0,10);
return `<div class="row"><div class="rowh"><span class="rn">${rn}</span><span class="rc">${nm[0]}</span><span class="rt2">${QS[qi].n} · 이 구간 운지 ${VA.length}개 중 상위 ${V.length}개</span></div><div class="strip">${V.map(v=>card(v,nm,r,false)).join('')||'<p class="meta">이 구간에서 잡을 수 있는 운지가 없어요. 구간을 옮겨 보세요.</p>'}</div></div>`}).join('')}

const STY=[
{g:'e',n:'파워코드 리프',tag:'록 · 메탈 · 펑크록',d:'근음과 5도만 쓰는 파워코드를 저음 줄에서 칩니다. 오른손 손날로 줄을 살짝 눌러 막는 팜뮤트와 잘 어울리고, 디스토션을 걸어도 소리가 탁해지지 않아요.',q:()=>'5',ns:[2,3],sg:2,op:2,w:[1,5]},
{g:'e',n:'바레 코드 스트로크',tag:'록 · 팝 반주',d:'5~6줄을 모두 울리는 바레 코드로 8비트·16비트 스트로크를 합니다. 개방현이 없어서 같은 모양을 그대로 옮기며 칠 수 있어요.',q:(t,s)=>t,ns:[5,6],sg:0,op:2,w:[1,5]},
{g:'e',n:'펑크 커팅',tag:'펑크 · 시티팝 · R&B',d:'고음 쪽 3~4줄만 짧게 끊어 치는 16비트 커팅이에요. 메이저는 M7, 도미넌트(V)는 9, 마이너는 m7로 바꿔 세련된 소리를 냅니다.',q:(t,s,rn)=>t==='M'?(/^V$/.test(rn)?'9':'M7'):t==='m'?'m7':'m7b5',ns:[3,4],sg:0,op:2,w:[5,8]},
{g:'e',n:'재즈 컴핑',tag:'재즈 · 보사노바',d:'세븐스 코드를 4줄 셸 보이싱으로 짧게 찍어 반주합니다. 클린 톤, 넥 픽업이 잘 어울려요.',q:(t,s)=>s,ns:[4],sg:0,op:2,w:[3,7]},
{g:'a',n:'오픈 코드 스트로크',tag:'포크 · 통기타 반주',d:'개방현을 살린 낮은 포지션의 기본 코드로 크게 스트로크합니다. 통기타의 울림이 가장 잘 사는 방법이에요.',q:(t,s)=>t,ns:[5,6],sg:0,op:1,w:[0,2]},
{g:'a',n:'아르페지오',tag:'발라드 · 핑거링',d:'코드를 잡고 한 줄씩 순서대로 뜯어 칩니다. 메이저는 add9, 마이너는 m7로 바꾸면 소리가 더 부드럽게 퍼져요.',q:(t,s)=>t==='M'?'add9':t==='m'?'m7':'m7b5',ns:[4,5,6],sg:0,op:1,w:[0,3]},
{g:'a',n:'발라드 세븐스 반주',tag:'팝 발라드 · 어쿠스틱 팝',d:'M7, m7 같은 세븐스 코드로 잔잔하게 스트로크하거나 투핑거로 칩니다. 개방현 여부와 상관없이 가장 편한 운지를 골랐어요.',q:(t,s)=>s,ns:[4,5],sg:0,op:0,w:[0,5]},
{g:'a',n:'개방현 울림(드론) 보이싱',tag:'모던 어쿠스틱 · 워십',d:'높은 포지션을 누르면서 개방현을 함께 울려 반짝이는 소리를 냅니다. 같은 음이 겹치며 풍성하게 울려요.',q:(t,s)=>t,ns:[4,5,6],sg:0,op:1,w:[5,7]}];
function drawStyles(kn,D){document.getElementById('sdesc').textContent=`현재 선택한 키(${kn}${KM?' 단조':' 장조'})를 기준으로, 주법마다 잘 어울리는 조건(프렛 구간 2개, 줄 수, 줄 위치, 개방현)을 정해 코드마다 가장 치기 쉬운 운지를 1개씩 골랐어요. 위쪽 필터와는 따로 계산돼요.`;
const one=st=>{const cond=[...st.w.map(w=>`${w}–${w+4}프렛`),st.ns.map(n=>n+'줄').join('·'),st.sg?SG[st.sg]:'',OS[st.op]==='전체'?'':OS[st.op]].filter(Boolean);
return `<div class="sb"><div class="tg">${st.tag}</div><h3>${st.n}</h3><p>${st.d}</p><div class="cond">${cond.map(c=>`<span>${c}</span>`).join('')}</div>`+st.w.map(w=>{let tot=0;const cards=D.map(([deg,semi,rn,tq,sq])=>{const cr=spell(kn,deg,semi),r=pcOf(cr),qi=QI[st.q(tq,sq,rn)],nm=names(cr,qi);const L=voicings(r,qi).all.filter(v=>fits(v,w)&&st.ns.includes(v.n)&&sgOk(v,st.sg)&&osOk(v,st.op)).sort((a,b)=>a.sc-b.sc);tot+=L.length;return L.length?card(L[0],nm,r,false).replace('<div class="top">',`<div class="top"><span class="rk">${rn}</span>`):`<div class="c"><div class="nm">${nm[0]}</div><p class="meta">${rn} · 이 조건에 맞는 운지가 없어요.</p></div>`}).join('');return `<div class="wn">${w}–${w+4}프렛 추천 (조건에 맞는 운지 총 ${tot}개)</div><div class="strip">${cards}</div>`}).join('')+'</div>'};
document.getElementById('sel').innerHTML=STY.filter(x=>x.g==='e').map(one).join('');document.getElementById('sac').innerHTML=STY.filter(x=>x.g==='a').map(one).join('')}
