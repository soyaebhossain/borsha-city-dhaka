// ================= BOSS FIGHT · "ঢাকনা সিন্ডিকেট"
// Three original bosses (heavy-armour enforcer, cyber commando, syndicate boss) fought one after another in a
// container yard behind the old airport terminal. Articulated PBR models, telegraphed attacks, per-boss weak spots.
var ARENA={x:roadC(14)+CELL*.5, z:roadC(9)+CELL*.26, r:16.5, built:false, boxes:[]};
var BOSS={on:false,phase:0,b:null,t:0,goons:[],tankHits:0,nextT:0,ended:false,kills:[]};
function bossOn(){ return !!(BOSS&&BOSS.on); }
const SKIN='#9a6646', SKIN_D='#87563a', HAIR='#120d0a', BEARDC='#1d1511';
const HAIRCAP=new THREE.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI*.55);
const BEARDG=new THREE.SphereGeometry(1,16,8,0,Math.PI,Math.PI*.42,Math.PI*.58);
const VISORG=new THREE.CylinderGeometry(1,1,1,18,1,true,-1.05,2.1);
const TORH=new THREE.TorusGeometry(1,.08,6,18,Math.PI);
const RBc={}, CAPc={};
function RB(w,h,d,r=.02){ const k=[w,h,d,r].map(v=>v.toFixed(4)).join(); return RBc[k]||(RBc[k]=new RoundedBoxGeometry(w,h,d,2,Math.max(.002,Math.min(r,w*.45,h*.45,d*.45)))); }
function CAP(r,l){ const k=r+','+l; return CAPc[k]||(CAPc[k]=new THREE.CapsuleGeometry(r,l,4,12)); }
const GLOWM=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
function bLimb(parent,x,y,z,parts,glow){ const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g);
  if(parts&&parts.length){ const m=new THREE.Mesh(finish(parts),paintMat); m.castShadow=true; g.add(m); }
  if(glow&&glow.length) g.add(new THREE.Mesh(finish(glow),GLOWM));
  return g; }

function headParts(o){ const p=[],g=[];
  p.push(P(SPH,SKIN,0,0,0,.096,.118,.106)); p.push(P(SPH,SKIN,0,-.058,.018,.074,.052,.082));
  p.push(P(HAIRCAP,HAIR,0,.012,-.008,.102,.114,.11,-.22,0,0));
  if(o.slick) p.push(P(SPH,HAIR,0,.012,-.045,.099,.1,.085,0,0,0,.35));
  p.push(P(BEARDG,BEARDC,0,-.052,.006,.092,.082,.1)); p.push(P(RB(.066,.013,.02,.006),BEARDC,0,-.03,.1)); p.push(P(RB(.03,.006,.01,.003),'#5a2e22',0,-.046,.103));
  for(const s of[-1,1]) p.push(P(RB(.016,.05,.04,.008),BEARDC,s*.084,-.02,.03));
  p.push(P(SPH,SKIN_D,0,-.006,.108,.017,.028,.022));
  for(const s of[-1,1]){ p.push(P(SPH,SKIN_D,s*.097,-.004,-.004,.015,.03,.022)); p.push(P(SPH,'#efe6dc',s*.037,.022,.093,.016,.01,.007));
    p.push(P(SPH,'#1a120e',s*.037,.022,.099,.0075,.0075,.003)); p.push(P(RB(.042,.01,.012,.004),HAIR,s*.038,.046,.097,1,1,1,0,0,-s*.12)); }
  if(o.glasses){ const fr='#1b1c20';
    for(const s of[-1,1]){ p.push(P(TOR,fr,s*.038,.022,.112,.028,.022,.12,0,0,0,.8)); p.push(P(RB(.006,.006,.1,.002),fr,s*.099,.026,.06)); }
    p.push(P(RB(.024,.006,.006,.002),fr,0,.027,.113));
    for(const s of[-1,1]) (o.glasses==='blue'?g:p).push(P(CYL,o.glasses==='blue'?'#3d86d8':'#59626c',s*.038,.022,.11,.025,.003,.019,Math.PI/2,0,0,.95)); }
  if(o.visor){ g.push(P(VISORG,'#3ff0ff',0,.022,0,.115,.03,.115,0,0,0,1)); p.push(P(VISORG,'#15171a',0,.043,0,.117,.012,.117,0,0,0,.8)); p.push(P(VISORG,'#15171a',0,.002,0,.117,.01,.117,0,0,0,.8));
    for(const s of[-1,1]){ p.push(P(CYL,'#1b1d20',s*.106,.008,0,.04,.03,.04,0,0,Math.PI/2,.6)); p.push(P(CYL,'#3a3f45',s*.123,.008,0,.027,.008,.027,0,0,Math.PI/2,.85)); }
    p.push(P(TORH,'#1b1d20',0,.008,0,.118,.122,.22,0,0,0,.5)); p.push(P(CYL,'#1b1d20',.075,-.045,.08,.006,.11,.006,.9,0,-.5,.4)); }
  if(o.spiky) for(let k=0;k<7;k++) p.push(P(CONE,HAIR,-.06+k*.02,.112,-.015+(k%2)*.022,.017,.055,.017,-.35,0,(k-3)*.09));
  return [p,g];
}
// shared skeleton: hip → torso → head / shoulders → elbows ; hip → thighs → knees. Model faces +z; its right side is -x.
function skeleton(B,scale){
  const root=new THREE.Group(); root.scale.setScalar(scale);
  const M={root}; M.hip=bLimb(root,0,.96,0,B.pelvis,B.pelvisG); M.torso=bLimb(M.hip,0,0,0,B.torso,B.torsoG);
  const [hp,hg]=headParts(B.head); M.head=bLimb(M.torso,0,.72,0,hp,hg); M.head.scale.setScalar(1.08);
  for(const [s,k] of [[-1,'R'],[1,'L']]){
    M['ua'+k]=bLimb(M.torso,s*B.sh,.5,0,B.ua(s),B.uaG?.(s)); M['fa'+k]=bLimb(M['ua'+k],0,-.29,0,B.fa(s),B.faG?.(s));
    M['th'+k]=bLimb(M.hip,s*.1,-.04,0,B.th(s),B.thG?.(s)); M['sn'+k]=bLimb(M['th'+k],0,-.44,0,B.sn(s),B.snG?.(s)); }
  return M;
}
const handP=(c)=>P(RB(.078,.098,.05,.02),c,0,-.31,.004);
const bSleeve=(c,r=.054)=>P(CAP(r,.2),c,0,-.145,0);
const fore=(c,r=.046)=>P(CAP(r,.18),c,0,-.13,0);
const thighP=(c,r=.072)=>P(CAP(r,.3),c,0,-.21,0);
const shinP=(c,r=.06)=>P(CAP(r,.32),c,0,-.21,0);

function buildTank(){
  const S='#1d1f23', A='#3b3f46', A2='#30343a', RED='#ff2b2b', p=[], g=[];
  const B={sh:.215,head:{glasses:'clear'}};
  B.pelvis=[P(RB(.36,.17,.23,.06),S,0,-.03,0),P(RB(.43,.085,.27,.02),'#2b2e33',0,.02,0,1,1,1,0,0,0,.4),P(RB(.15,.13,.05,.02),A2,0,-.09,.12,1,1,1,0,0,0,.5),
    ...[-1,1].flatMap(s=>[P(RB(.08,.1,.06,.015),'#3c3f35',s*.15,-.01,.13),P(RB(.07,.1,.07,.015),'#3c3f35',s*.215,-.01,0)])];
  // torso: armoured chest, ab plates, power pack, ammo belt feeding the minigun
  p.push(P(CAP(.165,.2),S,0,.33,0,1,1,.74)); p.push(P(CYL,S,0,.07,0,.155,.14,.115));
  p.push(P(RB(.5,.29,.32,.055),A,0,.43,.01,1,1,1,0,0,0,.55)); p.push(P(RB(.2,.1,.05,.02),A2,-.12,.5,.17,1,1,1,0,0,.15,.6)); p.push(P(RB(.2,.1,.05,.02),A2,.12,.5,.17,1,1,1,0,0,-.15,.6));
  for(let k=0;k<3;k++) p.push(P(RB(.36-k*.03,.07,.27,.025),k%2?A:A2,0,.235-k*.08,.012,1,1,1,0,0,0,.45));
  p.push(P(CYL,'#2b2e33',0,.6,0,.125,.08,.115,0,0,0,.5)); p.push(P(RB(.42,.4,.18,.05),'#26292d',0,.39,-.21,1,1,1,0,0,0,.4));
  for(let k=0;k<4;k++) p.push(P(RB(.3,.022,.02,.006),'#111214',0,.27+k*.06,-.305));
  p.push(P(CYL,'#1c1d20',.13,.62,-.22,.05,.18,.05,0,0,0,.5)); p.push(P(CYL,'#1c1d20',-.13,.62,-.22,.05,.18,.05,0,0,0,.5));
  const belt=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.09,.04,.27),new THREE.Vector3(-.25,-.02,.12),new THREE.Vector3(-.29,.1,-.08),new THREE.Vector3(-.2,.27,-.25)]),20,.03,6);
  p.push(colorize(belt,'#a07c34',.75));
  g.push(P(RB(.09,.014,.012,.004),RED,-.12,.47,.172),P(RB(.09,.014,.012,.004),RED,.12,.47,.172),P(RB(.05,.012,.01,.004),RED,0,.33,.142),P(RB(.26,.014,.01,.004),RED,0,.5,-.302));
  B.torso=p; B.torsoG=g;
  B.ua=s=>[P(RB(.21,.13,.26,.05),A,s*.035,.03,0,1,1,1,0,0,s*.32,.55),P(RB(.17,.07,.22,.03),A2,s*.06,-.06,0,1,1,1,0,0,s*.38,.5),bSleeve(S,.066),P(RB(.135,.15,.14,.03),A2,0,-.17,0,1,1,1,0,0,0,.45)];
  B.uaG=s=>[P(RB(.012,.012,.16,.004),RED,s*.12,.035,0,1,1,1,0,0,s*.32)];
  B.fa=s=>[fore(S,.05),P(RB(.135,.22,.145,.035),A,0,-.12,0,1,1,1,0,0,0,.55),handP('#16171a')];
  B.faG=s=>[P(RB(.012,.12,.012,.004),RED,s*.069,-.12,.02)];
  B.th=s=>[thighP(S,.08),P(RB(.17,.28,.2,.04),A2,0,-.2,.012,1,1,1,0,0,0,.5)];
  B.sn=s=>[shinP(S,.066),P(RB(.135,.11,.1,.035),A,0,-.01,.07,1,1,1,0,0,0,.6),P(RB(.145,.3,.165,.04),A2,0,-.22,.02,1,1,1,0,0,0,.5),P(RB(.155,.13,.29,.04),'#17181b',0,-.42,.05,1,1,1,0,0,0,.35)];
  B.snG=s=>[P(RB(.045,.012,.01,.004),RED,0,0,.123)];
  const M=skeleton(B,1.13);
  // minigun held at the right hip
  const gun=bLimb(M.torso,-.2,.07,.3,[P(RB(.17,.2,.36,.04),'#2a2c30',0,0,0,1,1,1,0,0,0,.5),P(CYL,'#1c1d20',0,0,-.21,.085,.12,.085,Math.PI/2,0,0,.5),
    P(RB(.035,.035,.22,.01),'#1a1b1e',0,.15,.02,1,1,1,0,0,0,.5),P(RB(.03,.06,.03,.01),'#1a1b1e',0,.11,-.07),P(RB(.03,.06,.03,.01),'#1a1b1e',0,.11,.1),
    P(RB(.04,.11,.05,.01),'#1a1b1e',0,-.13,-.1,1,1,1,.3,0,0)]);
  const bar=[]; for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; bar.push(P(CYL,'#151618',Math.cos(a)*.048,Math.sin(a)*.048,.36,.017,.62,.017,Math.PI/2,0,0,.75)); }
  bar.push(P(CYL,'#2a2c30',0,0,.14,.076,.035,.076,Math.PI/2,0,0,.6),P(CYL,'#2a2c30',0,0,.5,.072,.03,.072,Math.PI/2,0,0,.6),P(CYL,'#2a2c30',0,0,.66,.07,.03,.07,Math.PI/2,0,0,.6),P(CYL,'#111',0,0,.36,.02,.7,.02,Math.PI/2));
  M.barrels=bLimb(gun,0,0,.18,bar); M.gun=gun;
  const heat=new THREE.Mesh(M.barrels.children[0].geometry,new THREE.MeshBasicMaterial({color:0xff5418,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  heat.scale.setScalar(1.04); M.barrels.add(heat); M.heat=heat;
  M.flash=new THREE.Mesh(finish([P(SPH,'#ffe1a0',0,0,0,.1,.1,.22,0,0,0,1),P(SPH,'#fff7d8',0,0,0,.05,.05,.12,0,0,0,1)]),GLOWM); M.flash.position.set(0,0,.86); M.flash.visible=false; gun.add(M.flash);
  M.muzzle=new THREE.Object3D(); M.muzzle.position.set(0,0,.86); gun.add(M.muzzle);
  return M;
}
function buildSultan(){
  const C='#121214', T='#16171a', AR='#3a3e45', BL='#4aa8ff', p=[], g=[];
  const B={sh:.205,head:{glasses:'blue',slick:true}};
  B.pelvis=[P(RB(.33,.16,.22,.06),T,0,-.03,0),P(RB(.34,.045,.226,.01),'#0b0b0c',0,.03,0,1,1,1,0,0,0,.7),P(RB(.045,.032,.012,.005),'#c9ced4',0,.03,.115,1,1,1,0,0,0,.95)];
  p.push(P(CAP(.155,.2),'#202126',0,.33,0,1,1,.72,0,0,0,.2)); p.push(P(CYL,'#16171a',0,.07,0,.145,.14,.11));
  p.push(P(RB(.1,.36,.02,.008),'#e8e8ec',0,.4,.106)); p.push(P(RB(.045,.3,.012,.006),'#1d2a48',0,.39,.118,1,1,1,0,0,0,.45),P(RB(.05,.045,.022,.01),'#1d2a48',0,.535,.112,1,1,1,0,0,0,.45));
  for(let k=0;k<3;k++) p.push(P(SPH,'#8d939b',.03,.3-k*.07,.112,.008,.008,.006,0,0,0,.9));
  p.push(P(new THREE.CylinderGeometry(.205,.19,.54,24,1,true,.46,Math.PI*2-.92),C,0,.33,0,1.04,1,.74,0,0,0,.45));
  p.push(P(HAIRCAP,C,0,.565,0,.214,.075,.158,0,0,0,.45));
  for(const s of[-1,1]) p.push(P(RB(.058,.36,.016,.006),'#1c1c21',s*.075,.43,.128,1,1,1,-.12,0,-s*.3,.6));
  p.push(P(RB(.4,.12,.04,.015),C,0,.61,-.085,1,1,1,-.3,0,0,.45)); p.push(P(CYL,'#e8e8ec',0,.61,.01,.07,.06,.07));
  B.torso=p; B.torsoG=[P(RB(.006,.2,.006,.002),BL,-.07,.38,.12),P(RB(.006,.2,.006,.002),BL,.07,.38,.12)];
  B.ua=s=>[bSleeve(C,.058),P(HAIRCAP,AR,s*.02,-.01,0,.095,.075,.105,0,0,s*.35,.7),P(TOR,'#24272c',s*.02,-.055,0,.085,.1,.4,Math.PI/2,0,0,.6)];
  B.uaG=s=>[P(RB(.008,.008,.12,.003),BL,s*.07,.02,0,1,1,1,0,0,s*.35)];
  B.fa=s=>{ const q=[fore(C,.05),P(RB(.115,.2,.125,.03),'#2f3238',0,-.13,0,1,1,1,0,0,0,.6),handP('#0c0c0d')];
    if(s<0) q.push(P(RB(.034,.2,.042,.008),'#1b1c1f',0,-.4,.004,1,1,1,0,0,0,.7),P(RB(.03,.04,.11,.01),'#141517',0,-.33,-.05,1,1,1,.15,0,0,.5),P(CYL,'#0a0a0a',0,-.5,.012,.008,.02,.008));
    return q; };
  B.faG=s=>{ const q=[P(RB(.008,.15,.008,.003),BL,s*.06,-.13,.03)]; if(s<0) q.push(P(RB(.006,.16,.006,.002),BL,.018,-.4,.008)); return q; };
  B.th=s=>[thighP(T,.07)]; B.sn=s=>[shinP(T,.06),P(RB(.105,.08,.27,.03),'#0b0b0c',0,-.43,.045,1,1,1,0,0,0,.85)];
  const M=skeleton(B,1.02);
  M.coat=bLimb(M.hip,0,0,0,[]);
  M.flapR=bLimb(M.coat,0,0,0,[P(new THREE.CylinderGeometry(.21,.275,.7,14,1,true,Math.PI,Math.PI-.42),C,0,-.35,0,1.04,1,.78,0,0,0,.45)]);
  M.flapL=bLimb(M.coat,0,0,0,[P(new THREE.CylinderGeometry(.21,.275,.7,14,1,true,.42,Math.PI-.42),C,0,-.35,0,1.04,1,.78,0,0,0,.45)]);
  M.muzzle=new THREE.Object3D(); M.muzzle.position.set(0,-.51,.012); M.faR.add(M.muzzle);
  M.flash=new THREE.Mesh(finish([P(SPH,'#ffe1a0',0,0,0,.05,.12,.05,0,0,0,1)]),GLOWM); M.flash.position.set(0,-.56,.012); M.flash.visible=false; M.faR.add(M.flash);
  return M;
}
function buildCommando(){
  const J='#202125', V='#2b2c30', PN='#1a1b1d', CY='#4ff4ff', p=[];
  const B={sh:.2,head:{visor:true,spiky:true}};
  B.pelvis=[P(RB(.32,.16,.22,.06),PN,0,-.03,0),P(RB(.34,.05,.232,.012),'#101112',0,.03,0,1,1,1,0,0,0,.4),P(RB(.07,.09,.05,.015),'#26272a',.15,-.03,.1),P(RB(.06,.12,.05,.015),'#141516',-.17,-.08,.03)];
  p.push(P(CAP(.16,.2),J,0,.33,0,1,1,.74)); p.push(P(CYL,J,0,.07,0,.145,.14,.11));
  p.push(P(RB(.37,.31,.285,.04),V,0,.38,0,1,1,1,0,0,0,.15)); for(let k=0;k<3;k++) p.push(P(RB(.34,.013,.012,.004),PN,0,.33+k*.045,.144));
  for(let k=0;k<3;k++) p.push(P(RB(.075,.11,.05,.015),'#26272a',-.09+k*.09,.27,.16,1,1,1,0,0,0,.1));
  // bandolier: left shoulder → right hip, cartridges along it
  const a0=new THREE.Vector3(.16,.6,.15), a1=new THREE.Vector3(-.17,.08,.16), dv=a1.clone().sub(a0), ang=Math.atan2(dv.x,-dv.y)*-1;
  p.push(P(RB(.055,dv.length(),.022,.008),'#2a2118',(a0.x+a1.x)/2,(a0.y+a1.y)/2,.165,1,1,1,0,0,ang,.2));
  for(let k=1;k<10;k++){ const t=k/10; p.push(P(CYL,'#c39a3e',a0.x+dv.x*t,a0.y+dv.y*t,.18,.011,.055,.011,0,0,ang+Math.PI/2,.85)); }
  p.push(P(SPH,J,0,.6,-.1,.15,.09,.1)); for(const s of[-1,1]) p.push(P(RB(.06,.03,.2,.01),V,s*.13,.56,0));
  const ra=.62, rc=new THREE.Vector3(.02,.36,-.2), rp=(ly,lz=0)=>[rc.x-Math.sin(ra)*ly,rc.y+Math.cos(ra)*ly,rc.z+lz];
  p.push(P(RB(.05,.34,.08,.012),'#141414',...rp(0),1,1,1,0,0,ra,.4),P(CYL,'#0f0f10',...rp(.3),.012,.3,.012,0,0,ra,.6),P(RB(.04,.14,.065,.012),'#141414',...rp(-.24),1,1,1,0,0,ra,.3),P(RB(.03,.09,.05,.01),'#141414',...rp(-.02,.06),1,1,1,0,0,ra));
  B.torso=p; B.torsoG=[P(RB(.012,.012,.012,.004),CY,.12,.47,.146)];
  B.ua=s=>[bSleeve(J,.056),P(RB(.08,.06,.12,.02),V,s*.02,.02,0)];
  B.fa=s=>{ const q=[s>0?P(CAP(.044,.18),'#666b72',0,-.13,0,1,1,1,0,0,0,.85):fore(J,.048),handP('#121314'),P(RB(.026,.11,.032,.008),'#111',0,-.34,0),P(RB(.06,.012,.032,.004),'#2a2b2e',0,-.395,0,1,1,1,0,0,0,.8),P(RB(.009,.3,.008,.003),'#22262a',0,-.55,-.02,1,1,1,0,0,0,.8)];
    if(s>0) q.push(P(CYL,'#3d4147',0,-.01,0,.05,.04,.05,0,0,0,.85),P(CYL,'#3d4147',0,-.25,0,.048,.03,.048,0,0,0,.85));
    return q; };
  B.faG=s=>{ const q=[P(RB(.007,.3,.042,.003),CY,0,-.55,0)]; if(s>0) q.push(P(RB(.006,.16,.006,.002),CY,.04,-.13,.02),P(RB(.006,.16,.006,.002),CY,-.04,-.13,.02)); return q; };
  B.th=s=>[thighP(PN,.07),P(RB(.05,.1,.12,.015),'#26272a',s*.075,-.18,0)];
  B.sn=s=>[shinP(PN,.06),P(RB(.115,.115,.09,.035),'#141516',0,-.01,.066,1,1,1,0,0,0,.5),P(CYL,'#121212',0,-.33,.01,.065,.08,.07),P(RB(.118,.13,.275,.035),'#121212',0,-.415,.045,1,1,1,0,0,0,.3)];
  const M=skeleton(B,1.0); return M;
}

// ---- boss roster (names and fighting styles are original)
const BOSS_DEF=[
 {id:'chhaya',name:'ছায়া',title:'এলিট কমান্ডো · জোড়া ছুরি',hp:300,build:buildCommando,spd:5.2,
  intro:'ছায়া: “শব্দ করবি না… আমি এসে গেছি।”',tip:'ঝাঁপ দেওয়ার আগে ও নিচু হয় — তখন সরে যাও, ঝাঁপের পর হাঁপালে মারো'},
 {id:'tank',name:'ট্যাংক মামুন',title:'হেভি আর্মার · মিনিগান',hp:700,build:buildTank,spd:2.3,
  intro:'ট্যাংক মামুন: “গুদামে ঢুকছো? ভাড়া দিছো?”',tip:'মিনিগানের চারপাশে ঘুরতে থাকো — ব্যারেল লাল হয়ে থামলে (গরম) তখন ৩ গুণ জোরে লাগে'},
 {id:'sultan',name:'বস সুলতান',title:'ঢাকনা সিন্ডিকেটের মালিক · পিস্তল',hp:420,build:buildSultan,spd:3.4,
  intro:'বস সুলতান: “বর্ষার দিনে শহরটা আমার। ম্যানহোলের ঢাকনাগুলো কে বেচে, জানো?”',tip:'লাল লেজার তোমার গায়ে থাকলে গুলি আসছে — নড়াচড়া থামাবে না'},
];
const bossHpMul=()=>({easy:.7,normal:1,hard:1.3})[settings.diff]||(.8+(SAVE.adapt+1)*.2);

// ---- shared FX: tracers (additive vertex-colour lines) and laser sight
const TR_N=40; let trLines=null, trLife=new Float32Array(TR_N), trCol=[], trI=0, laser=null;
function bossFX(){
  if(trLines) return;
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(TR_N*6),3)); g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(TR_N*6),3));
  trLines=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); trLines.frustumCulled=false; scene.add(trLines);
  const lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));
  laser=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xff2020,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})); laser.frustumCulled=false; laser.visible=false; scene.add(laser);
}
function bTracer(a,b,col=[1,.85,.45]){ const i=trI++%TR_N, pa=trLines.geometry.attributes.position; pa.setXYZ(i*2,a.x,a.y,a.z); pa.setXYZ(i*2+1,b.x,b.y,b.z); pa.needsUpdate=true; trLife[i]=.09; trCol[i]=col; }
function setLaser(a,b,on){ laser.visible=on; if(!on) return; const pa=laser.geometry.attributes.position; pa.setXYZ(0,a.x,a.y,a.z); pa.setXYZ(1,b.x,b.y,b.z); pa.needsUpdate=true; laser.material.opacity=.55+Math.sin(state.time*40)*.3; }
function fxLinesTick(dt){ if(!trLines) return; const ca=trLines.geometry.attributes.color; let any=false;
  for(let i=0;i<TR_N;i++){ if(trLife[i]>0){ trLife[i]-=dt; any=true; } const k=Math.max(0,trLife[i])/.09, c=trCol[i]||[0,0,0]; ca.setXYZ(i*2,c[0]*k,c[1]*k,c[2]*k); ca.setXYZ(i*2+1,c[0]*k*.4,c[1]*k*.4,c[2]*k*.4); }
  ca.needsUpdate=true; trLines.visible=any; }

// ---- arena: container yard behind the terminal (ring of containers, crates, barrels, flood lights); containers collide
function buildArena(){
  if(ARENA.built) return; ARENA.built=true;
  const p=[], g=[], cx=ARENA.x, cz=ARENA.z;
  p.push(P(CYL,'#3b3e42',cx,.025,cz,20.5,.05,20.5,0,0,0,.15)); p.push(P(CYL,'#d8b11f',cx,.055,cz,17.2,.01,17.2)); p.push(P(CYL,'#3b3e42',cx,.06,cz,16.8,.012,16.8,0,0,0,.15));
  for(let k=0;k<8;k++){ const a=k/8*Math.PI*2; p.push(P(BOX,'#e7e2d6',cx+Math.cos(a)*9,.07,cz+Math.sin(a)*9,.18,.01,2.4,0,-a,0)); }
  const CC=['#7a3a2a','#2c4f7a','#3e5e3a','#8a6a2a','#5b2f4d','#3b4a52'];
  const gaps=[Math.PI*.5]; let k=0;
  for(let a=0;a<Math.PI*2-.01;a+=Math.PI*2/11){ if(gaps.some(q=>Math.abs(((a-q+Math.PI*3)%(Math.PI*2))-Math.PI)<.2)) continue;
    const x=cx+Math.cos(a)*21.5, z=cz+Math.sin(a)*21.5, ry=-a+Math.PI/2, col=CC[k++%CC.length], two=k%3===0;
    for(let h=0;h<(two?2:1);h++){ p.push(P(RB(6.1,2.6,2.45,.06),col,x,1.3+h*2.6,z,1,1,1,0,ry,0,.3));
      for(let r=-5;r<=5;r++) p.push(P(BOX,shade(col,-.08),x+Math.cos(ry)*r*.55,1.3+h*2.6,z-Math.sin(ry)*r*.55,.08,2.4,2.5,0,ry,0)); }
    ARENA.boxes.push({x,z,c:Math.cos(ry),s:Math.sin(ry),hw:3.25,hd:1.45}); }
  const lamps=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(const [sx,sz] of lamps){ const x=cx+sx*15.5, z=cz+sz*15.5; p.push(P(CYL,'#55595e',x,4.5,z,.12,9,.12,0,0,0,.6)); p.push(P(RB(1.2,.35,.5,.05),'#2a2c30',x-sx*.4,9,z-sz*.4,1,1,1,.35*sz,0,-.35*sx,.5));
    g.push(P(RB(1,.05,.38,.02),'#fff4d0',x-sx*.4,8.82,z-sz*.4,1,1,1,.35*sz,0,-.35*sx,1)); }
  for(let i=0;i<14;i++){ const a=rand(0,6.283), r=rand(18,19.4), x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r;
    if(i%2) p.push(P(RB(1.1,1.1,1.1,.04),'#6b4b2b',x,.55,z,1,1,1,0,rand(0,3),0,.1)); else { p.push(P(CYL,i%4?'#245b8a':'#8a2a24',x,.55,z,.38,1.1,.38,0,0,0,.45)); p.push(P(TOR,'#202020',x,.75,z,.39,.39,.8,Math.PI/2,0,0)); } }
  for(const a of [1.1,4.4]){ const x=cx+Math.cos(a)*18.6, z=cz+Math.sin(a)*18.6; p.push(P(CYL,'#3a3a3a',x,.5,z,.4,1,.4,0,0,0,.4)); g.push(P(CONE,'#ff8a2a',x,1.25,z,.32,.6,.32,0,0,0,1),P(CONE,'#ffd27a',x,1.15,z,.18,.4,.18,0,0,0,1)); ARENA.fire=ARENA.fire||[]; ARENA.fire.push([x,z]); }
  const m=new THREE.Mesh(finish(p),paintMat); m.castShadow=true; m.receiveShadow=true; scene.add(m);
  ARENA.glow=new THREE.Mesh(finish(g),GLOWM); scene.add(ARENA.glow);
}
function arenaBlock(x,z){ if(!ARENA||!ARENA.built||Math.abs(x-ARENA.x)>26||Math.abs(z-ARENA.z)>26) return false;
  for(const b of ARENA.boxes){ const dx=x-b.x, dz=z-b.z, lx=dx*b.c-dz*b.s, lz=dx*b.s+dz*b.c; if(Math.abs(lx)<b.hw&&Math.abs(lz)<b.hd) return true; } return false; }

// ---- HUD
const bossBar=document.createElement('div'); bossBar.className='hud'; bossBar.id='bossBar'; bossBar.setAttribute('role','status');
bossBar.innerHTML='<div class="bbn"><b id="bbName"></b><small id="bbTitle"></small><em id="bbRound"></em></div><div class="bbt"><i id="bbHp"></i><i id="bbLag"></i></div>';
document.body.appendChild(bossBar);
function bossHUD(){ const b=BOSS.b; if(!BOSS.on||!b){ bossBar.style.display='none'; return; } bossBar.style.display='block';
  $('bbName').textContent=b.def.name; $('bbTitle').textContent=b.def.title+(b.state==='overheat'?' · 🔥 গরম!':''); $('bbRound').textContent=`রাউন্ড ${bn(BOSS.phase+1)}/${bn(BOSS_DEF.length)}`;
  const f=Math.max(0,b.hp/b.max); $('bbHp').style.width=(f*100).toFixed(1)+'%'; b.lag=Math.max(f,(b.lag??1)-.004); $('bbLag').style.width=(b.lag*100).toFixed(1)+'%';
  bossBar.classList.toggle('weak',b.state==='overheat'||b.state==='recover'); }

// ---- lifecycle
function playBoss(){
  if(!state.runLive){ if(SAVE.run) restoreRun(SAVE.run); else beginStory(0); }
  enterGame(); setTimeout(bossStart,60);
}
function bossStart(){
  if(player.inVeh){ if(player.inVeh.air&&player.inVeh.y>1){ toast('আগে মাটিতে নামো!',2); return; } tryEnterExit(); if(player.inVeh) return; }
  buildArena(); bossFX(); bossClear();
  Object.assign(BOSS,{on:true,phase:0,t:0,tankHits:0,ended:false,kills:[]}); SAVE.boss.tries++; heat=0;
  player.hp=hero().maxHp; player.fall=0; state.failT=0; $('game').classList.remove('gray');
  placePlayer(ARENA.x,ARENA.z+ARENA.r*.72,Math.PI); player.h=Math.PI;
  const I=inv(); I.have.lathi=1; I.have.pistol=1; I.ammo.pistol=Math.max(I.ammo.pistol,40); if(I.cur===0) I.cur=WEAPONS.findIndex(w=>w.id==='lathi');
  toast(`🧰 গুদামের মেঝেতে লাঠি আর পিস্তল (৪০ গুলি) পেলে — ${IS_TOUCH?'"অস্ত্র" বাটনে':K('KeyQ')+' দিয়ে'} বদলাও`,4);
  bossSpawn(0); persistSoon();
}
function bossSpawn(i){
  const D=BOSS_DEF[i], M=D.build(), hp=Math.round(D.hp*bossHpMul());
  const b={def:D,type:D.id,M,x:ARENA.x,z:ARENA.z-ARENA.r*.55,h:0,aim:0,hp,max:hp,state:'intro',st:2.4,walk:0,spd:0,flinch:0,dead:0,cool:1,side:1,lag:1,spin:0,heatV:0,summoned:0,shots:0};
  M.root.position.set(b.x,0,b.z); scene.add(M.root); BOSS.b=b; BOSS.phase=i;
  big(`রাউন্ড ${bn(i+1)} · ${D.name}`,D.title,3.2,true); setTimeout(()=>{ if(BOSS.b===b) toast('🗣️ '+D.intro,4); },900);
  AU.tone(110,55,.9,'sawtooth',.06);
}
function bossClear(){
  if(BOSS.b){ scene.remove(BOSS.b.M.root); BOSS.b=null; }
  for(const p of BOSS.goons) if(p.state==='thug'||p.state==='down'){ p.state='hidden'; }
  BOSS.goons=[]; if(laser) laser.visible=false; bossBar.style.display='none';
}
function bossAbort(){ if(!BOSS.on) return; BOSS.on=false; bossClear(); }
function bossLose(){
  if(!BOSS.on||BOSS.ended) return; BOSS.ended=true; const ph=BOSS.phase, nm=BOSS.b?.def.name;
  player.hp=1; $('game').classList.add('gray'); vib(200); AU.thud();
  setTimeout(()=>{ BOSS.on=false; bossClear(); $('game').classList.remove('gray'); player.hp=hero().maxHp; persist(); bossEnd(false,{ph,nm}); },1600);
}
function bossWin(){
  BOSS.on=false; const t=BOSS.t; bossClear();
  SAVE.boss.wins++; const best=SAVE.boss.best, newBest=!best||t<best; if(newBest) SAVE.boss.best=t;
  state.money+=5000; addXP(600); addCoins(250); unlock('boss'); if(t<180) unlock('boss_fast');
  persist(); MUS.jingle(); bossEnd(true,{t,newBest});
}
function bossEnd(W,o){
  state.paused=true; needRender=true; const li=a=>a.map(([k,v])=>`<li><span>${k}</span><b>${v}</b></li>`).join('');
  const rows=W?[['💰 টাকা','+৳৫০০০'],['⭐ XP','+৬০০'],['🪙 কয়েন','+২৫০'],['⏱️ সময়',fmtClock(o.t)+(o.newBest?' <em class="tag g">নতুন রেকর্ড!</em>':'')]]
              :[['👑 যে হারালো',esc(o.nm||'')],['🎯 পৌঁছেছিলে',`রাউন্ড ${bn(o.ph+1)}/${bn(BOSS_DEF.length)}`],['⚙️ কঠিনতা',DF().n],['🔁 মোট চেষ্টা',bn(SAVE.boss.tries)]];
  const recap=[['ছায়া',BOSS.kills.includes('chhaya')?'✔ হারানো':'—'],['ট্যাংক মামুন',BOSS.kills.includes('tank')?'✔ হারানো':'—'],['বস সুলতান',BOSS.kills.includes('sultan')?'✔ হারানো':'—'],['সেরা সময়',SAVE.boss.best?fmtClock(SAVE.boss.best):'—']];
  $('endP').className='panel endp cut'+(W?'':' lose');
  $('endP').innerHTML=`<h1 class="title">${W?'সিন্ডিকেট খতম!':'অজ্ঞান!'}</h1>
   <h3>${W?'ঢাকনা সিন্ডিকেট ভেঙে গেলো — এবার ম্যানহোলে ঢাকনা ফিরবে 🕳️✅':`${esc(o.nm||'বস')} আপাতত জিতে গেলো — আবার চেষ্টা করো`}</h3>
   <div class="etime"><small>${W?'লড়াইয়ের সময়':'রাউন্ড'}</small><b>${W?fmtClock(o.t):bn(o.ph+1)+' / '+bn(BOSS_DEF.length)}</b></div>
   <div class="eblocks"><div class="eb"><h4>${W?'পুরস্কার':'ফলাফল'}</h4><ul>${li(rows)}</ul></div><div class="eb"><h4>তিন বস</h4><ul>${li(recap)}</ul></div></div>
   <p class="etip">💡 ${W?'আরও দ্রুত জিতলে "ঝড়ের গতি" অর্জন — ৩ মিনিটের কম সময়ে!':esc(BOSS_DEF[o.ph].tip)}</p>
   <div class="btnrow c"><button class="btn ghost" id="eMenu">🏠 মেনু</button><button class="btn ghost" id="eCont">▶ শহরে ফেরো</button><button class="btn cta" id="eBoss">↺ ${W?'আবার লড়ো':'আবার চেষ্টা'}</button></div>`;
  showScr('endScreen',true);
  $('eMenu').onclick=()=>toMenu(); $('eCont').onclick=()=>{ showScr('endScreen',false); state.paused=false; last=performance.now(); persist(); };
  $('eBoss').onclick=()=>{ showScr('endScreen',false); state.paused=false; last=performance.now(); bossStart(); };
  setTimeout(()=>$('eBoss')?.focus(),60);
}
function bossObjective(){ const b=BOSS.b; if(!b) return {text:'👑 ঢাকনা সিন্ডিকেট',sub:'পরের বস আসছে…'};
  return {text:`👑 ${b.def.name} — ${b.def.title.split('·')[0]}`,sub:b.def.tip,target:null,checkTarget:{x:b.x,z:b.z}}; }

// ---- damage from the player
function bossAim(fx,fz,maxD){ const b=BOSS.b; if(!BOSS.on||!b||b.dead) return null; const s=b.M.root.scale.x;
  const dx=b.x-player.x, dz=b.z-player.z, d=Math.hypot(dx,dz); if(d>maxD+.5||d<.3) return null;
  const along=dx*fx+dz*fz, perp=Math.abs(dx*fz-dz*fx); if(along<0||perp>.55*s+d*.06) return null;
  return {b,d,x:b.x,y:1.25*s,z:b.z}; }
function bossMelee(W,rng){ const b=BOSS.b; if(!BOSS.on||!b||b.dead) return false;
  const d=Math.hypot(b.x-player.x,b.z-player.z), reach=rng+.35*b.M.root.scale.x; if(d>reach+.9) return false;
  const pn=nearestPed(rng+.9,false); if(pn&&pn.state==='thug'&&Math.hypot(pn.x-player.x,pn.z-player.z)<d-.3) return false;
  player.h=Math.atan2(b.x-player.x,b.z-player.z);
  setTimeout(()=>{ if(BOSS.b!==b||b.dead) return; const d2=Math.hypot(b.x-player.x,b.z-player.z); if(d2>reach) return;
    AU.thud(); if(W.melee) AU.noise(.15,W.id==='knife'?3000:500,.4); if(hero().id==='jamal') shake=.15;
    bossDamage(b,hero().dmg*(W.mul||1),'melee'); },110);
  return true; }
function bossDamage(b,a,kind){
  if(b.dead||b.state==='intro') return;
  if(b.type==='chhaya'&&b.state==='stalk'&&Math.random()<(kind==='gun'?.38:.22)){ b.state='dodge'; b.st=.38; b.side=-b.side; AU.whoosh(); if(Math.random()<.5) toast('💨 ছায়া এড়িয়ে গেলো!',1.2); return; }
  let m=1; if(b.type==='tank'){ m=b.state==='overheat'?2.4:(kind==='melee'?.4:.5); }
  if(b.type==='chhaya'&&b.state==='recover') m=1.5;
  const dmg=a*m; b.hp-=dmg; b.flinch=Math.min(1,b.flinch+(b.type==='tank'?.35:.8));
  const y=1.25*b.M.root.scale.x, sp=b.type==='tank'&&m<1;
  fxBurst(b.x,y,b.z,sp?[[1,.75,.3],[1,.95,.6]]:[[1,.95,.7],[1,1,1]],sp?14:9,sp?4.5:3,2,.35,sp?.09:.15);
  if(sp&&Math.random()<.3) toast('🛡️ আর্মারে লাগছে না — গরম হওয়া পর্যন্ত অপেক্ষা করো!',1.6);
  if(b.hp<=0) bossDie(b);
}
function bossDie(b){ b.dead=.001; b.state='dead'; BOSS.kills.push(b.type); AU.thud(); AU.tone(220,40,.8,'sawtooth',.07); shake=.35; setLaser(0,0,false);
  fxBurst(b.x,1,b.z,[[1,.85,.4],[1,1,.8]],30,5,4,.8,.2); addXP(120); addCoins(40);
  const last=BOSS.phase>=BOSS_DEF.length-1;
  missionPassed(`${b.def.name} খতম!`,last?'ঢাকনা সিন্ডিকেটের শেষ বস!':`রাউন্ড ${bn(BOSS.phase+1)} জয় · একটু দম নাও`);
  if(b.type==='tank'&&BOSS.tankHits===0) unlock('boss_dodge');
  setTimeout(()=>{ if(!BOSS.on||BOSS.b!==b) return; scene.remove(b.M.root); BOSS.b=null;
    for(const p of BOSS.goons) if(p.state==='thug'){ p.state='flee'; p.stateT=6; }
    if(last){ bossWin(); return; }
    player.hp=Math.min(hero().maxHp,player.hp+hero().maxHp*.45); toast('🩹 বসের ব্যাগে ফার্স্ট-এইড — স্বাস্থ্য কিছুটা ফিরলো',2.5);
    const I=inv(); I.ammo.pistol+=12; setTimeout(()=>{ if(BOSS.on&&!BOSS.b) bossSpawn(BOSS.phase+1); },2600); },2400);
}

// ---- boss AI + animation (runs inside playTick while the game is live)
function bossMove(b,dx,dz,sp,dt){ const l=Math.hypot(dx,dz); if(l<1e-4) return; const nx=b.x+dx/l*sp*dt, nz=b.z+dz/l*sp*dt;
  const r=Math.hypot(nx-ARENA.x,nz-ARENA.z); if(r>ARENA.r-.6) return; if(!blocked(nx,nz,.4)&&!arenaBlock(nx,nz)){ b.x=nx; b.z=nz; } }
function pHit(a,dmgKind){ if(BOSS.ended) return; hurtPlayer(a); if(dmgKind==='tank') BOSS.tankHits++; }
function bossTick(dt){
  fxLinesTick(dt);
  if(!BOSS.on) return;
  BOSS.t+=dt; heat=0;
  BOSS.clearT=(BOSS.clearT||0)-dt; if(BOSS.clearT<=0){ BOSS.clearT=.5;   // civilians keep out of the yard
    for(const p of peds){ if(p.state==='hidden'||p.state==='thug'||p.state==='down'||BOSS.goons.includes(p)) continue; const ex=p.x-ARENA.x, ez=p.z-ARENA.z, e=Math.hypot(ex,ez);
      if(e<ARENA.r+3){ if(e<ARENA.r-1&&p.spare){ p.state='hidden'; } else { p.state='flee'; p.stateT=6; } } } }
  if(!player.inVeh){ const dx=player.x-ARENA.x, dz=player.z-ARENA.z, d=Math.hypot(dx,dz); if(d>ARENA.r){ player.x=ARENA.x+dx/d*ARENA.r; player.z=ARENA.z+dz/d*ARENA.r; } }
  const b=BOSS.b; bossHUD(); if(!b){ setLaser(0,0,false); return; }
  const M=b.M, S=M.root.scale.x, px=player.x, pz=player.z, dx=px-b.x, dz=pz-b.z, d=Math.hypot(dx,dz)||.01, toP=Math.atan2(dx,dz);
  b.st-=dt; b.cool-=dt; b.flinch=Math.max(0,b.flinch-dt*3); let mv=0, face=toP, turn=6;
  const pose={uaR:[-.15,0],uaL:[-.15,0],faR:-.25,faL:-.25,lean:0,crouch:0,twist:0};
  if(b.dead){ b.dead+=dt; const k=Math.min(1,b.dead/.7); M.root.rotation.x=-k*k*Math.PI/2*.96; M.root.position.y=0; setLaser(0,0,false); if(M.flash) M.flash.visible=false; M.root.updateMatrixWorld(); return; }
  if(b.state==='intro'){ if(b.st<=0){ b.state=b.type==='chhaya'?'stalk':b.type==='tank'?'advance':'strafe'; b.st=1.2; } turn=3; }
  else if(b.type==='chhaya'){
    pose.uaR=[-.9,.15]; pose.uaL=[-.9,-.15]; pose.faR=-1.1; pose.faL=-1.1;
    if(b.state==='stalk'){ const want=4.6, rad=(d-want)*.9; bossMove(b,dx/d*rad+(-dz/d)*b.side*2.6,dz/d*rad+(dx/d)*b.side*2.6,b.def.spd*.75,dt); mv=b.def.spd*.75;
      if(Math.random()<dt*.35) b.side=-b.side; if(b.st<=0&&d<9){ b.state='windup'; b.st=.5; AU.noise(.4,4200,.12,'highpass'); } }
    else if(b.state==='windup'){ pose.crouch=.18; pose.lean=.45; pose.uaR=[-1.9,.5]; pose.uaL=[-1.9,-.5]; pose.faR=-.6; pose.faL=-.6; if(b.st<=0){ b.state='dash'; b.st=.55; b.dashH=toP; b.hit=0; } }
    else if(b.state==='dash'){ face=b.dashH; turn=1.5; bossMove(b,Math.sin(b.dashH),Math.cos(b.dashH),13.5,dt); mv=12; pose.lean=.5;
      const sl=1-b.st/.55; pose.uaR=[-1.9+sl*1.7,.5-sl*1.2]; pose.uaL=[-1.9+sl*1.7,-.5+sl*1.2]; pose.faR=-.3; pose.faL=-.3;
      if(d<1.55&&b.hit<2&&(b.hit===0||b.st<.25)){ b.hit++; AU.whoosh(); AU.noise(.08,3500,.3); pHit(b.hit===1?12:9); fxBurst(px,1.2,pz,[[.3,1,1],[1,1,1]],8,3,1.5,.25,.12); }
      if(b.st<=0){ b.state='recover'; b.st=1.15; } }
    else if(b.state==='recover'){ pose.crouch=.1; pose.lean=.25; pose.uaR=[-.4,.1]; pose.uaL=[-.4,-.1]; mv=0; turn=2; if(b.st<=0){ b.state='stalk'; b.st=rand(1.2,2.4); } }
    else if(b.state==='dodge'){ bossMove(b,-dz/d*b.side,dx/d*b.side,9,dt); mv=8; pose.lean=-.2; if(b.st<=0){ b.state='stalk'; b.st=rand(.6,1.4); } }
  }
  else if(b.type==='tank'){
    pose.uaR=[.45,.05]; pose.faR=-1.45; pose.uaL=[-.6,-.8]; pose.faL=-.35; turn=1.6;
    b.aim=lerpAngle(b.aim,toP,Math.min(1,dt*(b.state==='fire'?1.05:2.2)));
    if(b.state==='advance'){ if(d>7) { bossMove(b,dx,dz,b.def.spd,dt); mv=b.def.spd; }
      if(d<2.6&&b.cool<=0){ b.state='stomp'; b.st=.75; AU.tone(90,40,.7,'sawtooth',.06); }
      else if(b.st<=0&&d<26){ b.state='spinup'; b.st=1.15; AU.tone(70,420,1.15,'sawtooth',.045); } }
    else if(b.state==='spinup'){ b.spin=Math.min(40,b.spin+dt*36); }
    else if(b.state==='fire'){ b.spin=40; b.shots+=dt; shake=Math.max(shake,.05);
      while(b.shots>.085){ b.shots-=.085; const a=M.muzzle.getWorldPosition(new THREE.Vector3()), diff=Math.abs(((toP-b.aim+Math.PI*3)%(Math.PI*2))-Math.PI);
        const hit=diff<.13&&d<30&&Math.random()<.55, sp=hit?0:rand(.05,.25)*(Math.random()<.5?-1:1), ang=b.aim+sp, L=hit?d:30;
        bTracer(a,new THREE.Vector3(b.x+Math.sin(ang)*L,hit?1.2:rand(.6,1.8),b.z+Math.cos(ang)*L)); if(Math.random()<.5) AU.noise(.05,2300,.16,'bandpass');
        if(hit) pHit(3.1,'tank'); }
      M.flash.visible=Math.random()<.7; M.flash.rotation.z=rand(0,6); }
    else if(b.state==='overheat'){ b.spin=Math.max(0,b.spin-dt*30); M.flash.visible=false; if(Math.random()<dt*14){ M.muzzle.getWorldPosition(_v); fxSpawn(_v.x,_v.y,_v.z,rand(-.4,.4),rand(1,2),rand(-.4,.4),1.1,.3,[.85,.85,.88],-1.2); } }
    else if(b.state==='stomp'){ pose.crouch=b.st>.3?.2:0; pose.uaR=[-1.4,.2]; if(b.st<=.0){ shake=.5; AU.thud(); fxBurst(b.x,.2,b.z,[[.7,.65,.55],[.9,.9,.9]],26,6,1.5,.6,.22); if(d<3.4){ pHit(18); const k=2.2/d; const nx=px+dx*k*.6, nz=pz+dz*k*.6; if(!blocked(nx,nz,.4)){ player.x=nx; player.z=nz; } } b.state='advance'; b.st=1.4; b.cool=3; } }
    if(b.state==='spinup'&&b.st<=0){ b.state='fire'; b.st=2.5; }
    else if(b.state==='fire'&&b.st<=0){ b.state='overheat'; b.st=3.3; M.flash.visible=false; AU.noise(1.2,900,.12,'highpass'); toast('🔥 মিনিগান গরম! এখনই মারো!',2); }
    else if(b.state==='overheat'&&b.st<=0){ b.state='advance'; b.st=rand(1.2,2.2); }
    b.heatV+=((b.state==='overheat'?1:b.state==='fire'?.5:0)-b.heatV)*Math.min(1,dt*1.5); M.heat.material.opacity=b.heatV*.75;
    M.barrels.rotation.z+=b.spin*dt; if(b.state!=='fire') b.spin=Math.max(0,b.spin-dt*12*(b.state==='spinup'?0:1));
    face=b.aim;
    const showL=b.state==='spinup'||b.state==='fire'; if(showL){ const a=M.muzzle.getWorldPosition(new THREE.Vector3()); setLaser(a,new THREE.Vector3(b.x+Math.sin(b.aim)*30,a.y-.3,b.z+Math.cos(b.aim)*30),true); } else setLaser(0,0,false);
  }
  else if(b.type==='sultan'){
    const rage=b.hp<b.max*.4;
    if(b.summoned===0&&b.hp<b.max*.66||b.summoned===1&&b.hp<b.max*.3){ b.summoned++; bossGoons(b.summoned===1?2:3); }
    if(d<1.7&&b.cool<=0&&b.state!=='aim'){ b.state='whip'; b.st=.45; b.cool=2.2; }
    if(b.state==='strafe'){ const want=11, rad=(d-want)*.6; bossMove(b,dx/d*rad+(-dz/d)*b.side*2,dz/d*rad+(dx/d)*b.side*2,b.def.spd*(rage?1.25:1),dt); mv=b.def.spd;
      if(Math.random()<dt*.4) b.side=-b.side; pose.uaR=[-.35,.05]; pose.faR=-.5;
      if(b.st<=0){ b.state='aim'; b.st=rage?.45:.7; b.ax=px; b.az=pz; b.double=rage; AU.tone(1400,1400,.06,'sine',.03); } }
    else if(b.state==='aim'){ pose.uaR=[-1.52,0]; pose.faR=0; face=Math.atan2(b.ax-b.x,b.az-b.z)+.04; turn=12;
      const k=Math.min(1,dt*(rage?5:3.4)); b.ax+=(px-b.ax)*k; b.az+=(pz-b.az)*k;
      const a=M.muzzle.getWorldPosition(new THREE.Vector3()); setLaser(a,new THREE.Vector3(b.ax,1.15,b.az),true);
      if(b.st<=0){ const a2=a.clone(), miss=Math.hypot(px-b.ax,pz-b.az); const hit=miss<.85&&d<40;
        bTracer(a2,hit?new THREE.Vector3(px,1.25,pz):new THREE.Vector3(b.ax+(b.ax-b.x)*.6,1.15,b.az+(b.az-b.z)*.6),[1,.9,.6]); M.flash.visible=true; setTimeout(()=>{ M.flash.visible=false; },60);
        AU.noise(.12,2200,.45,'bandpass'); AU.noise(.22,180,.5); if(hit) pHit(15);
        if(b.double){ b.double=false; b.st=.22; } else { b.state='strafe'; b.st=rand(1.4,2.3)*(rage?.7:1); setLaser(0,0,false); } } }
    else if(b.state==='whip'){ pose.uaR=[-2.2+(1-b.st/.45)*1.8,.3]; pose.faR=-.4; if(b.st<=0){ if(d<1.9){ pHit(11); const nx=px+dx/d*1.6, nz=pz+dz/d*1.6; if(!blocked(nx,nz,.4)){ player.x=nx; player.z=nz; } AU.thud(); } b.state='strafe'; b.st=.9; } }
    if(b.state!=='aim') setLaser(0,0,false);
    M.coat.rotation.x=Math.sin(b.walk*2)*.04*Math.min(1,mv/3);
  }
  // locomotion + pose
  b.h=lerpAngle(b.h,face,Math.min(1,dt*turn)); b.spd+=(mv-b.spd)*Math.min(1,dt*8);
  const run=Math.min(1,b.spd/(b.type==='tank'?2.4:5.5)); b.walk+=dt*(2.2+b.spd*(b.type==='tank'?1.2:1.35));
  const sw=Math.sin(b.walk)*run, br=Math.sin(state.time*2.1)*.015;
  M.root.position.set(b.x,0,b.z); M.root.rotation.set(0,b.h,0);
  M.hip.position.y=.96-pose.crouch+Math.abs(Math.cos(b.walk))*.04*run;
  M.thL.rotation.x=-sw*.75-pose.crouch*1.6; M.thR.rotation.x=sw*.75-pose.crouch*1.6;
  M.snL.rotation.x=Math.max(0,Math.sin(b.walk+1.6))*run*1.1+pose.crouch*2.6; M.snR.rotation.x=Math.max(0,Math.sin(b.walk+1.6+Math.PI))*run*1.1+pose.crouch*2.6;
  M.torso.rotation.set(pose.lean+run*.12-b.flinch*.35+br,Math.sin(b.walk)*.08*run+pose.twist,0); M.head.rotation.set(-pose.lean*.6+b.flinch*.2,0,0);
  const armSw=sw*.55;
  const rx=v=>v>-.3&&v<0; M.uaR.rotation.set(pose.uaR[0]+(rx(pose.uaR[0])?armSw:0),0,pose.uaR[1]); M.uaL.rotation.set(pose.uaL[0]+(rx(pose.uaL[0])?-armSw:0),0,pose.uaL[1]);
  M.faR.rotation.x=pose.faR; M.faL.rotation.x=pose.faL;
  if(M.flapL){ M.flapL.rotation.x=M.thL.rotation.x*.45; M.flapR.rotation.x=M.thR.rotation.x*.45; }
  M.root.updateMatrixWorld();
}
function bossGoons(n){
  big('গুণ্ডারা আসছে!','বস সুলতান: “এই! সবাই আয়!”',2.4,true);
  for(let k=0;k<n;k++){ const p=freePed(); if(!p) break; const a=rand(0,6.283), x=ARENA.x+Math.cos(a)*14, z=ARENA.z+Math.sin(a)*14;
    Object.assign(p,{x,z,state:'thug',hp:120,hx:ARENA.x,hz:ARENA.z,stateT:999,retreated:false,retreatT:0}); p.im.geometry.attributes.iTint.setXYZ(p.idx,.12,.12,.16); p.im.geometry.attributes.iTint.needsUpdate=true; BOSS.goons.push(p); }
}
