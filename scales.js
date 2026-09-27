// 스케일 도감 탭: 스케일 정의, 지판 그림, 구간별 타브
// ---- scales
const SCL=[
{n:'마이너 펜타토닉',m:1,d:'록·블루스 솔로에서 가장 많이 쓰는 5음 스케일이에요. 반음 간격이 없어서 어떤 음을 쳐도 잘 어울리고, 처음 솔로를 배울 때 가장 먼저 익혀요.',t:[[0,0,'1'],[2,3,'♭3'],[3,5,'4'],[4,7,'5'],[6,10,'♭7']]},
{n:'메이저 펜타토닉',m:0,d:'밝은 느낌의 5음 스케일이에요. 컨트리·팝·밝은 록 솔로에 잘 맞고, 같은 모양이 나란한조(관계조) 마이너 펜타토닉과 겹쳐요.',t:[[0,0,'1'],[1,2,'2'],[2,4,'3'],[4,7,'5'],[5,9,'6']]},
{n:'메이저 스케일 (장음계)',m:0,d:'도레미파솔라시에 해당하는 7음 스케일이에요. 장조 곡의 멜로디와 코드가 모두 여기서 나와요.',t:[[0,0,'1'],[1,2,'2'],[2,4,'3'],[3,5,'4'],[4,7,'5'],[5,9,'6'],[6,11,'7']]},
{n:'내추럴 마이너 (자연단음계)',m:1,d:'라시도레미파솔에 해당하는 7음 스케일이에요. 단조 곡의 기본이 되고, 슬프거나 어두운 분위기의 솔로에 써요.',t:[[0,0,'1'],[1,2,'2'],[2,3,'♭3'],[3,5,'4'],[4,7,'5'],[5,8,'♭6'],[6,10,'♭7']]}];
let SQ=0,SR=9,SW=5;const SNM=['e','B','G','D','A','E'];
function scaleNotes(){const sc=SCL[SQ],kn=(sc.m?MINK:MAJK)[SR];const pcs=sc.t.map(t=>(pcOf(kn)+t[1])%12);const nm=sc.t.map(t=>spell(kn,t[0],t[1]));return {sc,kn,pcs,nm}}
function fbSvg(a,b,hl,opt){const {pcs,nm}=scaleNotes();const W=opt&&opt.w||30,S=opt&&opt.s||16,L=26,T=10,cols=b-a+1;const w=L+cols*W+6,h=T+S*5+22;let o=`<svg class="fb" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${a}–${b}프렛 스케일 음 위치">`;
if(hl!=null){const x0=L+(Math.max(hl,a)-a)*W,x1=L+(Math.min(hl+4,b)-a+1)*W;if(x1>x0)o+=`<rect class="win" x="${x0}" y="${T-6}" width="${x1-x0}" height="${S*5+12}"/>`}
for(let j=0;j<cols;j++){const f=a+j,x=L+j*W+W/2;if([3,5,7,9,15,17,19,21].includes(f))o+=`<circle class="mk" cx="${x}" cy="${T+S*2.5}" r="3"/>`;if(f===12||f===24){o+=`<circle class="mk" cx="${x}" cy="${T+S*1.5}" r="3"/><circle class="mk" cx="${x}" cy="${T+S*3.5}" r="3"/>`}o+=`<text class="fn" x="${x}" y="${T+S*5+16}" text-anchor="middle">${f}</text>`}
for(let i=0;i<6;i++)o+=`<line class="ln" x1="${L}" y1="${T+i*S}" x2="${L+cols*W}" y2="${T+i*S}"/><text class="fn" x="4" y="${T+i*S+3}">${SNM[i]}</text>`;
for(let j=0;j<=cols;j++){const x=L+j*W;o+=`<line class="${a===0&&j===1?'nut':'fl'}" x1="${x}" y1="${T}" x2="${x}" y2="${T+S*5}"/>`}
for(let i=0;i<6;i++){const s=5-i;for(let f=a;f<=b;f++){const pc=(TU[s]+f)%12,k=pcs.indexOf(pc);if(k<0)continue;const x=L+(f-a)*W+W/2,y=T+i*S;o+=`<circle class="${k===0?'ndr':'nd'}" cx="${x}" cy="${y}" r="${S*0.45}"/><text class="nt${k===0?' ntr':''}" x="${x}" y="${y+3}" text-anchor="middle">${nm[k].replace('𝄪','x')}</text>`}}
return o+'</svg>'}
function tabText(a,b){const {pcs}=scaleNotes();return SNM.map((n,i)=>{const s=5-i;const fs=[];for(let f=a;f<=b;f++)if(pcs.includes((TU[s]+f)%12))fs.push(f);return n+'|-'+fs.map(f=>String(f).padStart(2,'-')).join('--')+'-|'}).join('\n')}
function setSW(n){SW=Math.max(0,Math.min(20,n));document.getElementById('spos').value=SW;document.getElementById('sout').textContent=SW+'–'+(SW+4)+'프렛';drawScale()}
function drawSRoots(){const L=SCL[SQ].m?MINK:MAJK;const el=document.getElementById('sroots');el.innerHTML=L.map((n,i)=>`<button id="sr${i}" aria-pressed="${i===SR}">${n}${SCL[SQ].m?'m':''}</button>`).join('');el.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{SR=i;drawSRoots();drawScale()})}
function drawScale(){const {sc,kn,nm}=scaleNotes();
document.getElementById('sdesc2').textContent=`${kn} ${sc.n}. ${sc.d}`;
document.getElementById('stones').innerHTML=nm.map((x,i)=>`<span class="${i?'':'r'}">${x}<small>${sc.t[i][2]}</small></span>`).join('');
document.getElementById('sneck').innerHTML=fbSvg(0,24,SW,{w:30,s:16});
document.getElementById('swin').innerHTML=fbSvg(SW,SW+4,null,{w:52,s:24});
document.getElementById('stab').textContent=`${SW}–${SW+4}프렛 타브 (숫자 = 누를 프렛, 빨간 점 = 근음 ${nm[0]})\n`+tabText(SW,SW+4);
document.getElementById('sgrid').innerHTML=[0,5,10,15,20].map(a=>`<div class="c"><div class="top"><span class="nm">${a}–${a+4}프렛</span><span class="rk">${kn} ${sc.n.split(' ')[0]}</span></div><div style="overflow-x:auto;margin-top:6px">${fbSvg(a,a+4,null,{w:38,s:18})}</div></div>`).join('')}
seg(document.getElementById('sq'),SCL.map(x=>x.n),SQ,i=>{const wasM=SCL[SQ].m;SQ=i;if(wasM!==SCL[SQ].m){const pc=pcOf((wasM?MINK:MAJK)[SR]);SR=(SCL[SQ].m?MINK:MAJK).findIndex(n=>pcOf(n)===pc)}drawSRoots();drawScale()});
document.getElementById('spos').oninput=e=>setSW(+e.target.value);document.getElementById('sprev').onclick=()=>setSW(SW-1);document.getElementById('snext').onclick=()=>setSW(SW+1);
let scInit=0;
