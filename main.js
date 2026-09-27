// 탭 전환과 첫 화면 시작
// tabs
const TABS=[['t-key','p-key'],['t-dic','p-dic'],['t-sc','p-sc'],['t-rf','p-rf']];let dicInit=0;
TABS.forEach(([t,p])=>document.getElementById(t).onclick=()=>{TABS.forEach(([t2,p2])=>{document.getElementById(t2).setAttribute('aria-selected',t2===t);document.getElementById(p2).hidden=t2!==t});
if(t==='t-dic'&&!dicInit){dicInit=1;drawQ();drawRoots();full()}if(t==='t-sc'&&!scInit){scInit=1;drawSRoots();setSW(SW)}if(t==='t-rf'&&!rfInit){rfInit=1;drawRK();syncSP();makeRiff()}});
drawKeyRoots();drawKey();
