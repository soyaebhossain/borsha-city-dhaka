// ================= ELEVATED ROADS, FLYOVERS, OVERPASSES & METRO (real Dhaka routes mapped onto the game grid)
// Grid points are [i,j] road intersections (x=roadC(i), z=roadC(j)); north is -z. Order of stops follows the real alignments.
const DECKS=[
 {id:'exp1',kind:'exp',name:'ঢাকা এলিভেটেড এক্সপ্রেসওয়ে',H:12.5,W:15,pts:[[13,8],[13,10],[12,10],[12,14],[13,14],[13,15],[14,15],[14,18],[15,18]],
  stops:[['কাওলা',13,8.9],['কুড়িল–বনানী',12.6,10],['মহাখালী',12,11.4],['তেজগাঁও',12,12.5],['মগবাজার',12,13.5],['কমলাপুর',13,14.6],['যাত্রাবাড়ী',14,16.4],['কুতুবখালী',14,17.6]]},
 {id:'exp2',kind:'exp',name:'ঢাকা–আশুলিয়া এলিভেটেড এক্সপ্রেসওয়ে',H:12.5,W:15,pts:[[13,7],[9,7],[5,7],[5,3]],
  stops:[['আব্দুল্লাহপুর',11.6,7],['ধউর',9.6,7],['আশুলিয়া',6.4,7],['বাইপাইল',5,4.4]]},
 {id:'hanif',kind:'fly',name:'মেয়র মোহাম্মদ হানিফ ফ্লাইওভার',H:7,W:9,pts:[[11,16],[13,16],[13,17],[15,17]],ends:['গুলিস্তান','যাত্রাবাড়ী']},
 {id:'mogh',kind:'fly',name:'মগবাজার–মৌচাক ফ্লাইওভার',H:7,W:9,pts:[[11,13],[14,13],[14,14]],ends:['সাতরাস্তা','শান্তিনগর']},
 {id:'kuril',kind:'fly',name:'কুড়িল ফ্লাইওভার',H:7,W:9,pts:[[13,10],[15,10],[15,8]],ends:['বনানী','কুড়িল বিশ্বরোড']},
 {id:'mohak',kind:'fly',name:'মহাখালী ফ্লাইওভার',H:7,W:9,pts:[[11,11],[13,11]],ends:['মহাখালী','গুলশান']},
 {id:'khil',kind:'fly',name:'খিলগাঁও ফ্লাইওভার',H:7,W:9,pts:[[15,13],[15,15]],ends:['মালিবাগ','বাসাবো']},
 {id:'tongi',kind:'fly',name:'শহীদ আহসান উল্লাহ মাস্টার ফ্লাইওভার',H:7,W:9,pts:[[12,4],[12,6]],ends:['টঙ্গী স্টেশন রোড','টঙ্গী ব্রিজ']},
 {id:'kalshi',kind:'fly',name:'কালশী ফ্লাইওভার',H:7,W:9,pts:[[10,9],[13,9]],ends:['মিরপুর-১১','ইসিবি চত্বর']},
 {id:'bijoy',kind:'ovp',name:'বিজয় সরণি–তেজগাঁও লিংক ওভারপাস',H:5.8,W:8,pts:[[10,12],[12,12]],ends:['বিজয় সরণি','তেজগাঁও শিল্পাঞ্চল']},
 {id:'banani',kind:'ovp',name:'বনানী ওভারপাস',H:5.8,W:8,pts:[[14,11],[14,12]],ends:['বনানী','ক্যান্টনমেন্ট']},
 {id:'jillur',kind:'ovp',name:'জিল্লুর রহমান ফ্লাইওভার',H:5.8,W:8,pts:[[10,8],[12,8]],ends:['মিরপুর ডিওএইচএস','বিমানবন্দর সড়ক']},
 {id:'jdemra',kind:'ovp',name:'যাত্রাবাড়ী–ডেমরা ওভারপাস',H:5.8,W:8,pts:[[14,19],[15,19]],ends:['যাত্রাবাড়ী','ডেমরা']},
 {id:'gabtoli',kind:'ovp',name:'গাবতলী–আমিনবাজার ওভারপাস',H:5.8,W:8,pts:[[9,14],[10,14]],ends:['গাবতলী','আমিনবাজার']},
];
const METRO=[  // what is elevated in reality is elevated here; underground sections only show their entrances
 {id:'mrt6',name:'এমআরটি লাইন-৬',tag:'MRT-6',col:'#16884a',status:'চালু',pts:[[10,6.9],[10,15],[12.8,15]],
  st:['উত্তরা উত্তর','উত্তরা দক্ষিণ','পল্লবী','মিরপুর-১০','আগারগাঁও','ফার্মগেট','কারওয়ান বাজার','শাহবাগ','সচিবালয়','মতিঝিল']},
 {id:'mrt1e',name:'এমআরটি লাইন-১ (নতুন বাজার–পূর্বাচল, উড়াল অংশ)',tag:'MRT-1',col:'#c2185b',status:'নির্মাণাধীন',pts:[[15.3,10],[18.6,10]],build:true,ramp:'start',
  st:['মাস্তুল','পূর্বাচল টার্মিনাল'],stX:[17.35,18.3]},
 {id:'mrt5w',name:'এমআরটি লাইন-৫ উত্তর (হেমায়েতপুর–আমিনবাজার, উড়াল অংশ)',tag:'MRT-5',col:'#00b5e2',status:'নির্মাণাধীন',pts:[[4.4,13],[7.9,13]],build:true,ramp:'end',
  st:['হেমায়েতপুর','বালিয়ারপুর','বিলামালিয়া','আমিনবাজার'],stX:[4.7,5.45,6.2,6.95]},
];
const UNDERGROUND=[ // underground stations (both lines under construction in 2026): street-level entrances behind hoarding
 ...[['বিমানবন্দর',13,8.6,'v'],['টার্মিনাল-৩',13,7.55,'v-'],['খিলক্ষেত',15,9.35,'v'],['উত্তর বাড্ডা',15,11.2,'v'],['বাড্ডা',15,11.8,'v'],['আফতাবনগর',15.5,12,'h'],['রামপুরা',15,12.55,'v'],['মালিবাগ',14,13.5,'v'],['রাজারবাগ',14,14.4,'v'],['কমলাপুর',13.4,15,'h']].map(a=>['MRT-1',...a]),
 ['MRT-1 ও 5','নতুন বাজার',15,10.55,'v'],
 ...[['গাবতলী',9,13.3,'v'],['দারুস সালাম',9.5,12.55,'h'],['মিরপুর-১',9.55,12,'h'],['মিরপুর-১০',10.5,10,'h'],['মিরপুর-১৪',11,10.4,'v'],['কচুক্ষেত',11.6,10,'h'],['বনানী',12.6,11,'h'],['গুলশান-২',14,10.6,'v']].map(a=>['MRT-5',...a]),
];
const PLANNED=[ // map-only: lines still on paper
 {tag:'MRT-2',name:'এমআরটি লাইন-২ (পরিকল্পিত)',pts:[[9,13],[11,13],[11,14],[14,14],[16,15],[18,15]]},
 {tag:'MRT-4',name:'এমআরটি লাইন-৪ (পরিকল্পিত)',pts:[[13,15],[14,16],[15,19],[16,20],[17,21]]},
 {tag:'MRT-5S',name:'এমআরটি লাইন-৫ দক্ষিণ (পরিকল্পিত)',pts:[[9,13],[9,15],[11,16],[13,16],[14,18]]},
];
const IST=2;   // path sample spacing (m)

// ---- path: polyline through grid points with rounded corners, resampled every IST metres
function gridPath(pts,rad=17){
  const W=pts.map(([i,j])=>new THREE.Vector2(roadC(i),roadC(j))), raw=[W[0].clone()];
  for(let k=1;k<W.length-1;k++){ const A=W[k-1],B=W[k],C=W[k+1], u1=B.clone().sub(A), u2=C.clone().sub(B), l1=u1.length(), l2=u2.length(); u1.normalize(); u2.normalize();
    const r=Math.min(rad,l1*.45,l2*.45), T1=B.clone().addScaledVector(u1,-r), T2=B.clone().addScaledVector(u2,r);
    for(let t=0;t<=1.0001;t+=1/12){ const a=(1-t)*(1-t), b=2*(1-t)*t, c=t*t; raw.push(new THREE.Vector2(T1.x*a+B.x*b+T2.x*c,T1.y*a+B.y*b+T2.y*c)); } }
  raw.push(W[W.length-1].clone());
  const S=[]; let acc=0, nextS=0;
  for(let k=0;k<raw.length-1;k++){ const a=raw[k], b=raw[k+1], L=a.distanceTo(b); if(L<1e-6) continue;
    while(nextS<=acc+L+1e-6){ const t=(nextS-acc)/L; S.push({x:a.x+(b.x-a.x)*t,z:a.y+(b.y-a.y)*t,s:nextS}); nextS+=IST; } acc+=L; }
  for(let k=0;k<S.length;k++){ const p=S[Math.max(0,k-1)], q=S[Math.min(S.length-1,k+1)], l=Math.hypot(q.x-p.x,q.z-p.z)||1; S[k].tx=(q.x-p.x)/l; S[k].tz=(q.z-p.z)/l; }
  return {S,L:S[S.length-1].s,corners:W.slice(1,-1)};
}
const smooth01=t=>{ t=clamp(t,0,1); return t*t*(3-2*t); };
const ENDGAP=11;   // ramps start this far into the road from the end intersections
function deckProfile(D){
  const L=D.L, R=Math.min(D.kind==='exp'?82:62,(L-2*ENDGAP)*.45);
  for(const p of D.S){ const a=p.s-ENDGAP, b=L-ENDGAP-p.s; p.y=D.H*Math.min(smooth01(a/R),smooth01(b/R)); if(a<0||b<0) p.y=0;
    p.w=D.W*clamp(.42+.58*p.y/Math.min(D.H,6),0,1); }
  D.R=R; D.s0=ENDGAP; D.s1=L-ENDGAP;
}
function deckAt(D,s){ const S=D.S, f=clamp(s/IST,0,S.length-1.001), i=Math.floor(f), t=f-i, a=S[i], b=S[i+1];
  return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:a.y+(b.y-a.y)*t,w:a.w+(b.w-a.w)*t,tx:a.tx+(b.tx-a.tx)*t,tz:a.tz+(b.tz-a.tz)*t,i}; }

// ---- swept cross-sections: prof = [{p:[[lat,v],...],c,g,dash,low}] ; lat scales with p.w/W, v:'G' means ground
function sweep(D,prof,i0,i1,out){
  const S=D.S, pos=[], col=[];
  for(const it of prof){ const c=new THREE.Color(it.c);
    for(let k=i0;k<i1;k++){ const A=S[k], B=S[k+1]; if(it.dash&&Math.floor(A.s/7)%2) continue; if(it.low&&Math.max(A.y,B.y)>it.low) continue; if(it.high&&Math.min(A.y,B.y)<it.high) continue;
      const P=(Q,l,v)=>{ const sc=Q.w/D.W, vv=v==='G'?-Q.y-.05:v; return [Q.x-Q.tz*l*sc, Q.y+vv, Q.z+Q.tx*l*sc]; };
      for(let e=0;e<it.p.length-1;e++){ const [l0,v0]=it.p[e], [l1,v1]=it.p[e+1];
        const a=P(A,l0,v0), b=P(A,l1,v1), cc=P(B,l1,v1), d=P(B,l0,v0); pos.push(...a,...b,...cc,...a,...cc,...d); for(let q=0;q<6;q++) col.push(c.r,c.g,c.b,it.g||0); } } }
  if(!pos.length) return; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,4));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(pos.length/3*2),2)); g.computeVertexNormals(); out.push(g);
}
function deckCross(D){
  const h=D.W/2, CON='#c3bdb2', CON2='#aaa497', ASP='#3a3d42', WH='#eceae4', YL='#e8c33a', t=D.kind==='exp'?1.35:1.0, gd=D.kind==='exp'?2.7:1.9, gw=D.kind==='exp'?4.6:2.8, pr=D.kind==='ovp'?.95:1.05;
  const P=[{p:[[-h+.5,.02],[h-.5,.02]],c:ASP,g:.08},{p:[[-h,0],[-h,-t],[h,-t],[h,0]],c:CON},{p:[[-h,0],[-h,pr],[-h+.5,pr],[-h+.5,.02]],c:'#d6d1c6'},{p:[[h-.5,.02],[h-.5,pr],[h,pr],[h,0]],c:'#d6d1c6'},
    {p:[[-gw,-t],[-gw*.82,-gd],[gw*.82,-gd],[gw,-t]],c:CON2},{p:[[-h+.75,.035],[-h+.9,.035]],c:WH},{p:[[h-.9,.035],[h-.75,.035]],c:WH},
    {p:[[-h*.9,-t],[-h*.9,'G'],[h*.9,'G'],[h*.9,-t]],c:'#b5ae9f',low:4.6}];
  if(D.kind!=='ovp') P.push({p:[[-.32,.02],[-.14,.85],[.14,.85],[.32,.02]],c:'#cfc9bd'},{p:[[-.55,.035],[-.45,.035]],c:YL},{p:[[.45,.035],[.55,.035]],c:YL});
  else P.push({p:[[-.07,.035],[.07,.035]],c:YL,dash:true});
  if(D.kind==='exp') P.push({p:[[-3.85,.035],[-3.7,.035]],c:WH,dash:true},{p:[[3.7,.035],[3.85,.035]],c:WH,dash:true});
  return P;
}

// ---- road-sign atlas (2048² canvas, 512×128 slots)
const ISG={cv:null,g:null,n:0,map:{},tex:null};
function isgSlot(text,style){ const key=style+'|'+text; if(key in ISG.map) return ISG.map[key];
  if(!ISG.cv){ ISG.cv=document.createElement('canvas'); ISG.cv.width=ISG.cv.height=2048; ISG.g=ISG.cv.getContext('2d'); }
  const n=ISG.n++; if(n>=64) return 0; const g=ISG.g, x=(n%4)*512, y=Math.floor(n/4)*128;
  const bg={exp:'#0d6b3a',fly:'#1c4f9c',ovp:'#1c4f9c',metro:'#f4f4f2',build:'#f2c418'}[style]||'#0d6b3a';
  g.fillStyle=bg; g.fillRect(x,y,512,128); g.strokeStyle=style==='metro'?'#222':'#fff'; g.lineWidth=6; g.strokeRect(x+6,y+6,500,116);
  let tx=x+28; if(style==='metro'||style==='build'){ g.fillStyle=style==='build'?'#111':'#16884a'; g.beginPath(); g.arc(x+64,y+64,44,0,7); g.fill(); g.fillStyle='#fff'; g.font='800 60px "Baloo Da 2",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('M',x+64,y+68); tx=x+124; }
  else { g.fillStyle='#fff'; g.beginPath(); g.moveTo(x+48,y+30); g.lineTo(x+74,y+62); g.lineTo(x+58,y+62); g.lineTo(x+58,y+98); g.lineTo(x+38,y+98); g.lineTo(x+38,y+62); g.lineTo(x+22,y+62); g.closePath(); g.fill(); tx=x+96; }
  g.fillStyle=style==='metro'||style==='build'?'#111':'#fff'; g.textAlign='left'; g.textBaseline='middle';
  let fs=56; g.font=`700 ${fs}px "Hind Siliguri",sans-serif`; while(g.measureText(text).width>x+496-tx&&fs>22){ fs-=2; g.font=`700 ${fs}px "Hind Siliguri",sans-serif`; }
  g.fillText(text,tx,y+68); ISG.map[key]=n; if(ISG.tex) ISG.tex.needsUpdate=true; return n; }
function signPair(out,n,x,y,z,ry,w,h){ const nx=Math.sin(ry)*.03, nz=Math.cos(ry)*.03; signQuad(out,n,x+nx,y,z+nz,ry,w,h); signQuad(out,n,x-nx,y,z-nz,ry+Math.PI,w,h); }
function signQuad(out,n,x,y,z,ry,w=6,h=1.5){ const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv, u0=(n%4)/4, v0=1-(Math.floor(n/4)+1)/16;
  for(let k=0;k<uv.count;k++) uv.setXY(k,u0+uv.getX(k)/4,v0+uv.getY(k)/16);
  g.rotateY(ry); g.translate(x,y,z); out.push(g); }

// ---- build everything
const INFRA={meshes:[],trains:[],deckCars:[],built:false};
function buildInfra(){
  const p=[], gl=[], sg=[];
  for(const D of DECKS){ Object.assign(D,gridPath(D.pts,D.kind==='exp'?24:16)); deckProfile(D);
    const i0=Math.max(0,Math.floor((D.s0-1)/IST)), i1=Math.min(D.S.length-1,Math.ceil((D.s1+1)/IST));
    const parts=[]; sweep(D,deckCross(D),i0,i1,parts); for(const g of parts) p.push(g);
    // piers: straight parts only, never inside an intersection
    const gap=D.kind==='exp'?26:20, cr=D.kind==='exp'?1.15:.85;
    for(let s=D.s0+gap/2;s<D.s1;s+=gap){ const q=deckAt(D,s); if(q.y<4.4) continue;
      if(D.corners.some(c=>Math.hypot(c.x-q.x,c.y-q.z)<(D.kind==='exp'?30:22))) continue;
      const lx=mod(q.x-ORIGIN,CELL), lz=mod(q.z-ORIGIN,CELL), nearX=lx<12||lx>CELL-12, nearZ=lz<12||lz>CELL-12; if(nearX&&nearZ) continue;
      const bot=q.y-(D.kind==='exp'?2.7:1.9), ry=Math.atan2(q.tx,q.tz);
      p.push(P(CYL,'#c9c3b8',q.x,bot/2,q.z,cr,bot,cr,0,0,0,.05)); p.push(P(RB(D.kind==='exp'?9.5:6,1.2,2.2,.25),'#bfb9ad',q.x,bot-.4,q.z,1,1,1,0,ry+Math.PI/2,0,.05));
      pillars.push([q.x,q.z]); }
    // median lamps (expressways), gantry signs at the stops, entry signs at both ramps
    if(D.kind==='exp'){ for(let s=D.s0+D.R;s<D.s1-D.R;s+=38){ const q=deckAt(D,s), ry=Math.atan2(q.tx,q.tz);
        p.push(P(CYL,'#7d8288',q.x,q.y+3.6,q.z,.09,7,.09,0,0,0,.6)); for(const sd of[-1,1]){ const ax=q.x-q.tz*sd*1.6, az=q.z+q.tx*sd*1.6; p.push(P(RB(3.2,.12,.18,.04),'#7d8288',(q.x+ax)/2,q.y+7,(q.z+az)/2,1,1,1,0,ry+Math.PI/2,0,.6)); gl.push(P(RB(.9,.08,.35,.04),'#fff1c7',ax,q.y+6.92,az,1,1,1,0,ry+Math.PI/2,0,1)); } }
      for(const [t,i,j] of D.stops){ let best=0,bd=1e9; for(const S of D.S){ const d=Math.hypot(S.x-roadC(i),S.z-roadC(j)); if(d<bd){bd=d;best=S.s;} }
        const q=deckAt(D,clamp(best,D.s0+D.R*.7,D.s1-D.R*.7)), ry=Math.atan2(q.tx,q.tz), n=isgSlot(t,'exp');
        for(const sd of[-1,1]) p.push(P(CYL,'#6d7278',q.x-q.tz*sd*7.4,q.y+3.3,q.z+q.tx*sd*7.4,.16,6.6,.16,0,0,0,.6));
        p.push(P(RB(15.2,.35,.35,.08),'#6d7278',q.x,q.y+6.4,q.z,1,1,1,0,ry+Math.PI/2,0,.6));
        signQuad(sg,n,q.x-q.tx*.25+q.tz*3.7,q.y+5.4,q.z-q.tz*.25-q.tx*3.7,ry+Math.PI,6.4,1.6); signQuad(sg,n,q.x+q.tx*.25-q.tz*3.7,q.y+5.4,q.z+q.tz*.25+q.tx*3.7,ry,6.4,1.6); } }
    for(const end of [0,1]){ const s=end?D.s1:D.s0, q=deckAt(D,s), dir=end?-1:1, ry=Math.atan2(q.tx*dir,q.tz*dir), n=isgSlot(D.name,D.kind);
      const bx=q.x-q.tx*dir*8+q.tz*dir*6.6, bz=q.z-q.tz*dir*8-q.tx*dir*6.6;   // left kerb, a little before the ramp
      p.push(P(CYL,'#6d7278',bx,2.1,bz,.08,4.2,.08,0,0,0,.6)); signPair(sg,n,bx,3.6,bz,ry+Math.PI,4.4,1.1); }
  }
  // metro viaducts, stations, trains
  for(const L of METRO){ Object.assign(L,gridPath(L.pts,26));
    for(const q of L.S){ const RL=62, a=L.ramp==='start'?q.s/RL:L.ramp==='end'?(L.L-q.s)/RL:1; q.y=-1.6+11.8*smooth01(a); q.w=7.5; }
    const V={S:L.S,W:7.5,kind:'metro'}, prof=[{p:[[-3.75,0],[-3.75,-1.2],[3.75,-1.2],[3.75,0]],c:'#bdb8ae',high:-1},{p:[[-3.75,0],[-3.75,.9],[-3.45,.9],[-3.45,0]],c:'#a19c92'},{p:[[3.45,0],[3.45,.9],[3.75,.9],[3.75,0]],c:'#a19c92'},
      {p:[[-3.45,.02],[3.45,.02]],c:'#8c8a85'},{p:[[-1.6,.12],[-1.4,.12]],c:'#4a4a4a',g:.8},{p:[[-.1,.12],[.1,.12]],c:'#4a4a4a',g:.8},{p:[[1.4,.12],[1.6,.12]],c:'#4a4a4a',g:.8},{p:[[2.9,.12],[3.1,.12]],c:'#4a4a4a',g:.8},{p:[[-3.1,.12],[-2.9,.12]],c:'#4a4a4a',g:.8},
      {p:[[-2.6,-1.2],[-2,-2.2],[2,-2.2],[2.6,-1.2]],c:'#aaa497',high:4.5},
      {p:[[-3.75,-1.2],[-3.75,'G'],[3.75,'G'],[3.75,-1.2]],c:'#b0aa9c',low:4.5},
      {p:[[-4.2,'G'],[-4.2,1.6],[-3.75,1.6],[-3.75,'G']],c:'#c9c3b7',low:2.2},{p:[[3.75,'G'],[3.75,1.6],[4.2,1.6],[4.2,'G']],c:'#c9c3b7',low:2.2}];
    if(L.ramp){ const s0=L.ramp==='start'?0:L.L, q=deckAt(V,s0), ry=Math.atan2(q.tx,q.tz), dir=L.ramp==='start'?1:-1;   // tunnel portal: the track dives underground here
      p.push(P(RB(9.6,4.2,1.2,.1),'#bdb7ab',q.x-q.tx*dir*.6,1.1,q.z-q.tz*dir*.6,1,1,1,0,ry,0)); p.push(P(RB(7.2,2.6,1.4,.05),'#0d0f12',q.x,.3,q.z,1,1,1,0,ry,0));
      for(const sd of[-1,1]) p.push(P(RB(.5,2.2,10,.05),'#c9c3b7',q.x+q.tz*sd*4.4+q.tx*dir*5,1.1,q.z-q.tx*sd*4.4+q.tz*dir*5,1,1,1,0,ry,0));
      const n=isgSlot('↧ পাতালে যাচ্ছে · '+L.tag,'build'); signPair(sg,n,q.x-q.tx*dir*1.3,3.6,q.z-q.tz*dir*1.3,ry,6,1.5); }
    const parts=[]; sweep(V,prof,0,L.S.length-1,parts); for(const g of parts) p.push(g);
    for(let s=8;s<L.L-4;s+=24){ const q=deckAt(V,s); if(q.y<4.5) continue; const lx=mod(q.x-ORIGIN,CELL), lz=mod(q.z-ORIGIN,CELL); if((lx<11||lx>CELL-11)&&(lz<11||lz>CELL-11)) continue;
      if(L.corners.some(c=>Math.hypot(c.x-q.x,c.y-q.z)<26)) continue; const top=q.y-2.2; p.push(P(CYL,'#c4bfb5',q.x,top/2,q.z,.9,top,.9)); p.push(P(BOX,'#bdb8ae',q.x,top-.2,q.z,5,1,2,0,Math.atan2(q.tx,q.tz)+Math.PI/2,0)); pillars.push([q.x,q.z]); }
    L.stS=[]; const nst=L.st.length; for(let k=0;k<nst;k++){ const s=L.stX?(L.stX[k]-L.pts[0][0])*CELL:(k<8?(k+.6)*CELL+4:L.L-(nst-1-k)*CELL-40); L.stS.push(s);
      const q=deckAt(V,s), ry=Math.atan2(q.tx,q.tz)+Math.PI/2, n=isgSlot(L.st[k],L.build?'build':'metro');
      const Y=q.y; p.push(P(RB(36,.6,18,.2),'#d6d0c4',q.x,Y+2.6,q.z,1,1,1,0,ry,0)); p.push(P(RB(34,2.6,17,.2),L.build?'#9aa0a6':'#8aa0aa',q.x,Y+1.1,q.z,1,1,1,0,ry,0,.7));
      p.push(P(RB(34.4,.5,17.4,.1),L.col,q.x,Y-.05,q.z,1,1,1,0,ry,0,.4));
      for(const sd of[-1,1]) signQuad(sg,n,q.x+q.tz*sd*9.15,Y+3.7,q.z-q.tx*sd*9.15,Math.atan2(q.tz*sd,-q.tx*sd),7,1.75);
      for(const sd of[-1,1]){ const sx=q.x+q.tz*sd*10.5, sz=q.z-q.tx*sd*10.5; p.push(P(RB(3,Y,3.5,.15),'#cfc9bd',sx,Y/2,sz,1,1,1,0,ry,0)); gl.push(P(RB(.1,1.2,2.4,.05),'#b9f0ff',sx+q.tz*sd*1.55,Y*.6,sz-q.tx*sd*1.55,1,1,1,0,ry,0,1)); } }
    if(L.build){ const q=deckAt(V,L.ramp==='end'?L.L*.45:L.L-6); p.push(P(CYL,'#e0a800',q.x+6,14,q.z+5,.35,28,.35,0,0,0,.4)); p.push(P(RB(26,.6,.6,.1),'#e0a800',q.x-3,28,q.z+5,1,1,1,0,.4,0,.4)); p.push(P(RB(3,2,3,.2),'#d84315',q.x+6,25.5,q.z+5));
      for(let s=6;s<L.L;s+=9){ const r=deckAt(V,s); if(r.y<3) continue; for(const sd of[-1,1]) p.push(P(RB(.25,1.1,8.6,.05),(Math.floor(s/9)%2)?'#f2c418':'#222',r.x+r.tz*sd*3.55,r.y+1.4,r.z-r.tx*sd*3.55,1,1,1,0,Math.atan2(r.tx,r.tz),0)); } }
    else { const cars=[]; for(let c=0;c<6;c++){ const t=[P(RB(3,3.4,20,.4),'#f3f3f3',0,1.7,0,1,1,1,0,0,0,.4),P(BOX,'#16884a',0,.8,0,3.03,.4,20.02),P(BOX,'#c62828',0,2.6,0,3.04,.12,20.02),P(BOX,'#1f2a33',0,2.25,0,3.05,1,18)];
        if(c===0||c===5) t.push(P(RB(2.9,2.6,1.6,.6),'#f3f3f3',0,1.6,c?-10.2:10.2),P(BOX,'#1f2a33',0,2.3,c?-10.9:10.9,2.4,1,.2));
        const m=new THREE.Mesh(finish(t),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.2})); m.castShadow=true; scene.add(m); cars.push(m); }
      INFRA.trains.push({L,V,cars,s:clamp(L.stS[0],6*20.6/2+3,L.L-6*20.6/2-3),dir:1,dwell:3,next:1}); } }
  // underground entrances (glass kiosk + M sign); MRT-5 ones behind construction hoarding
  for(const [tag,t,i,j,axs] of UNDERGROUND){ const V=axs[0]==='v', sg2=axs[1]==='-'?-1:1, x=roadC(i)+(V?8.6*sg2:0), z=roadC(j)+(V?0:8.6*sg2), ry=V?Math.PI/2:0, b=true;
    p.push(P(RB(5.2,.2,2.6,.06),'#7d8288',x,2.7,z,1,1,1,0,ry,0,.7)); p.push(P(RB(5.2,.3,2.6,.05),'#5b5f64',x,.15,z,1,1,1,0,ry,0,.3));
    for(const e of[-1,1]) p.push(P(RB(.12,2.5,2.6,.03),'#7d8288',x+(V?0:e*2.55),1.35,z+(V?e*2.55:0),1,1,1,0,ry,0,.7));
    gl.push(P(RB(5,2.3,.06,.02),'#9fd9ff',x+(V?1.25*sg2:0),1.3,z+(V?0:1.25*sg2),1,1,1,0,ry,0,1));
    if(b) for(let k=-2;k<=2;k++) p.push(P(RB(1.8,2,.08,.02),k%2?'#f2c418':'#2a2a2a',x+(V?-2*sg2:k*1.9),1,z+(V?k*1.9:-2*sg2),1,1,1,0,ry,0));
    const n=isgSlot('পাতাল · '+tag+' · '+t,'build'); signPair(sg,n,x+(V?-1.35*sg2:0),3.45,z+(V?0:-1.35*sg2),V?-Math.PI/2*sg2:(sg2>0?Math.PI:0),4.6,1.15); }
  const m=new THREE.Mesh(finish(p),paintMat); m.castShadow=true; m.receiveShadow=true; scene.add(m); INFRA.meshes.push(m);
  if(gl.length){ const mg=new THREE.Mesh(finish(gl),GLOWM); scene.add(mg); INFRA.meshes.push(mg); }
  ISG.tex=new THREE.CanvasTexture(ISG.cv); ISG.tex.colorSpace=THREE.SRGBColorSpace; ISG.tex.anisotropy=8;
  const ms=new THREE.Mesh(mergeGeometries(sg),new THREE.MeshBasicMaterial({map:ISG.tex,side:THREE.DoubleSide,toneMapped:false})); scene.add(ms); INFRA.meshes.push(ms);
  INFRA.built=true;
}
// ---- traffic that lives on the decks (cars only on expressways; CNG/rickshaw banned there, as in reality)
function spawnDeckCars(){
  for(const D of DECKS){ const n=D.kind==='exp'?(IS_TOUCH?3:5):D.kind==='fly'?(IS_TOUCH?1:2):(IS_TOUCH?0:1);
    for(let k=0;k<n;k++){ const dir=k%2?-1:1, type=D.kind==='exp'?pick(['car','car','microbus','bus','truck','car']):pick(['car','cng','microbus','bus','bike']);
      const v=makeVehicle(type,0,0,0,randInt(0,11),true); Object.assign(v,{fixed:true,noDrive:true,deckCar:true,ai:false});
      v.dk={D,dir,s:rand(D.s0+5,D.s1-5),lane:D.kind==='exp'?(k%4<2?2.1:5.2):2.1,spd:rand(11,17)*(type==='bus'||type==='truck'?.8:1)}; INFRA.deckCars.push(v); } }
}
function tickInfra(dt){
  const cx=player.x, cz=player.z;
  for(const v of INFRA.deckCars){ const k=v.dk, D=k.D; let sp=k.spd; v.mesh.visible=Math.abs(v.x-cx)+Math.abs(v.z-cz)<(IS_TOUCH?320:460);
    const pv=player.inVeh; if(pv&&pv.deck===D){ const gap=(pv.deckS-k.s)*k.dir; const q=deckAt(D,k.s); const pl=(pv.x-q.x)*-q.tz+(pv.z-q.z)*q.tx; if(gap>0&&gap<14&&Math.abs(pl-(-k.dir*k.lane))<2.4) sp=Math.min(sp,Math.max(0,(gap-6)*1.4)); }
    k.cur=(k.cur??sp)+(sp-(k.cur??sp))*Math.min(1,dt*2); k.s+=k.dir*k.cur*dt;
    if(k.s>D.s1-1||k.s<D.s0+1){ const st=k.dir>0?D.s0+1:D.s1-1; if(Math.abs(st-((pv&&pv.deck===D)?pv.deckS:-999))>40) k.s=st; else k.s=clamp(k.s,D.s0+1,D.s1-1); }
    const q=deckAt(D,k.s), lat=-k.dir*k.lane, sc=q.w/D.W; v.x=q.x-q.tz*lat*sc; v.z=q.z+q.tx*lat*sc; v.y=q.y; v.h=Math.atan2(q.tx*k.dir,q.tz*k.dir); v.spd=k.cur;
    const q2=deckAt(D,k.s+k.dir*2); v.dp=-Math.atan2(q2.y-q.y,2); }
  for(const T of INFRA.trains){ const L=T.L, half=6*20.6/2+3, tgt=clamp(L.stS[T.next],half,L.L-half);
    if(T.dwell>0) T.dwell-=dt; else { const d=tgt-T.s, v=Math.min(14,Math.max(3,Math.abs(d)*.6)), st=Math.min(Math.abs(d),v*dt); T.s+=Math.sign(d)*st;
      if(Math.abs(d)<.05){ T.dwell=5; T.next+=T.dir; if(T.next<0||T.next>=L.stS.length){ T.dir=-T.dir; T.next+=2*T.dir; } } }
    T.cars.forEach((m,c)=>{ const q=deckAt(T.V,T.s+(2.5-c)*20.6); m.position.set(q.x,10.2,q.z); m.rotation.y=Math.atan2(q.tx,q.tz); m.visible=Math.abs(q.x-cx)+Math.abs(q.z-cz)<700; }); }
}
// ---- driving on a deck (player vehicle). Returns true when the deck handled movement this frame.
function deckProject(D,x,z,hint){ let best=null,bd=1e9; const S=D.S, a=hint==null?0:Math.max(0,hint-30), b=hint==null?S.length-1:Math.min(S.length-2,hint+30);
  for(let i=a;i<=b;i++){ const d=(S[i].x-x)**2+(S[i].z-z)**2; if(d<bd){ bd=d; best=i; } }
  const A=S[best], al=(x-A.x)*A.tx+(z-A.z)*A.tz, lat=-(x-A.x)*A.tz+(z-A.z)*A.tx; return {s:A.s+al,lat,i:best}; }
let deckScrapeT=0;
function deckStep(v,dt,fx,fz){
  deckScrapeT-=dt;
  const nx=v.x+fx*v.spd*dt, nz=v.z+fz*v.spd*dt;
  if(!v.deck){ if(Math.abs(v.spd)<1||v.air) return false;
    const mvx=fx*Math.sign(v.spd), mvz=fz*Math.sign(v.spd);
    for(const D of DECKS){ for(const end of [0,1]){ const q=deckAt(D,end?D.s1:D.s0); if(Math.abs(v.x-q.x)>10||Math.abs(v.z-q.z)>10) continue;
        const al=(v.x-q.x)*q.tx+(v.z-q.z)*q.tz, lat=-(v.x-q.x)*q.tz+(v.z-q.z)*q.tx, dot=mvx*q.tx+mvz*q.tz;
        if(Math.abs(lat)<q.w/2+.3&&(end?(al<.3&&al>-7&&dot<-.55):(al>-.3&&al<7&&dot>.55))){ v.deck=D; v.deckS=end?D.s1+Math.min(0,al):D.s0+Math.max(0,al); v.deckLat=undefined; v.deckI=Math.round(v.deckS/IST);
          toast(`🛣️ ${D.name}${D.kind==='exp'?' — টোল ৳৮০':''}`,2.5); if(D.kind==='exp'&&state.money>=80){ state.money-=80; } return false; } } }
    return false; }
  const D=v.deck, pr=deckProject(D,nx,nz,v.deckI);
  if(pr.s<D.s0-.5||pr.s>D.s1+.5){ v.deck=null; v.y=0; v.dp=0; v.x=nx; v.z=nz; return true; }
  const q=deckAt(D,clamp(pr.s,D.s0,D.s1)), half=Math.max(.1,q.w/2-.55-v.hw); let lat=pr.lat, hit=false;
  if(Math.abs(lat)>half){ lat=Math.sign(lat)*half; hit=true; }
  if(D.kind!=='ovp'&&q.y>3&&v.deckLat!==undefined&&Math.sign(lat)!==Math.sign(v.deckLat)&&Math.abs(v.deckLat)>.05){ lat=Math.sign(v.deckLat)*(.45+v.hw); hit=true; }
  if(hit){ const ang=Math.abs(fx*-q.tz+fz*q.tx); v.spd*=1-Math.min(.9,(1.2+ang*6)*dt);
    if(deckScrapeT<=0&&Math.abs(v.spd)>5){ deckScrapeT=.5; AU.noise(.25,1400,.18,'bandpass'); if(ang>.45&&Math.abs(v.spd)>9){ damage(v,Math.abs(v.spd)*.6); shake=.3; } } }
  v.x=q.x-q.tz*lat; v.z=q.z+q.tx*lat; v.y=q.y; v.deckS=clamp(pr.s,D.s0,D.s1); v.deckI=q.i; v.deckLat=lat;
  const q2=deckAt(D,v.deckS+1), slope=(q2.y-q.y)*(fx*q.tx+fz*q.tz); v.dp=-Math.atan(slope);
  return true;
}
// ---- map
function infraPath(g,pts,S){ g.beginPath(); if(S){ S.forEach((q,k)=>k?g.lineTo(q.x,q.z):g.moveTo(q.x,q.z)); } else pts.forEach(([i,j],k)=>k?g.lineTo(roadC(i),roadC(j)):g.moveTo(roadC(i),roadC(j))); }
function drawInfraMap(g){
  g.lineCap='round'; g.lineJoin='round';
  for(const P2 of PLANNED){ g.strokeStyle='rgba(220,220,220,.55)'; g.lineWidth=4; g.setLineDash([10,10]); infraPath(g,P2.pts); g.stroke(); }
  g.setLineDash([]);
  for(const D of DECKS){ const sl=D.S.filter(q=>q.s>=D.s0&&q.s<=D.s1); g.strokeStyle='#1a1a1a'; g.lineWidth=D.kind==='exp'?17:D.kind==='fly'?12:10; infraPath(g,null,sl); g.stroke();
    g.strokeStyle=D.kind==='exp'?'#ff9f1c':D.kind==='fly'?'#ffd166':'#f6e58d'; g.lineWidth=D.kind==='exp'?11:D.kind==='fly'?7:6; infraPath(g,null,sl); g.stroke(); }
  for(const L of METRO){ g.strokeStyle='#111'; g.lineWidth=9; infraPath(g,null,L.S); g.stroke(); g.strokeStyle=L.col; g.lineWidth=5.5; if(L.build) g.setLineDash([14,8]); infraPath(g,null,L.S); g.stroke(); g.setLineDash([]);
    for(const s of L.stS||[]){ const q=deckAt({S:L.S},s); g.fillStyle='#fff'; g.beginPath(); g.arc(q.x,q.z,7,0,7); g.fill(); g.lineWidth=3; g.strokeStyle=L.col; g.stroke(); } }
  const ug={'MRT-1':['#c2185b',[[13,7.55],[13,8.6],[15,9.35],[15,10],[15,11.2],[15,11.8],[15.5,12],[15,12.55],[14,13.5],[14,14.4],[13.4,15]]],'MRT-5':['#00b5e2',[[7.9,13],[9,13.3],[9.5,12.55],[9.55,12],[10.5,10],[11,10.4],[11.6,10],[12.6,11],[14,10.6],[15,10.55],[15.6,9]]]};
  for(const k in ug){ const [c,pts]=ug[k]; g.strokeStyle=c; g.lineWidth=4; g.setLineDash([6,8]); infraPath(g,pts); g.stroke(); g.setLineDash([]); }
  for(const [tag,t,i,j,ax] of UNDERGROUND){ const sg2=ax[1]==='-'?-1:1; g.fillStyle=tag==='MRT-5'?'#00b5e2':'#c2185b'; g.beginPath(); g.arc(roadC(i)+(ax[0]==='v'?8.6*sg2:0),roadC(j)+(ax[0]==='h'?8.6*sg2:0),5.5,0,7); g.fill(); }
}
function infraLabels(){ const out=[];
  for(const D of DECKS){ if(D.kind!=='exp') continue; const q=deckAt(D,D.id==='exp1'?D.L*.62:D.L*.3); out.push([D.id==='exp1'?'🛣️ ঢাকা এলিভেটেড এক্সপ্রেসওয়ে':'🛣️ ঢাকা–আশুলিয়া এক্সপ্রেসওয়ে',q.x+(D.id==='exp1'?120:0),q.z+(D.id==='exp1'?0:-22)]); }
  out.push(['Ⓜ MRT-6 উড়াল (চালু)',roadC(10)-70,roadC(11)],['Ⓜ MRT-1 উড়াল (নির্মাণাধীন)',roadC(17)+10,roadC(10)-20],['Ⓜ MRT-1 পাতাল',roadC(15)+52,roadC(12)+30],['Ⓜ MRT-5 উড়াল → পাতাল',roadC(6),roadC(13)+26]);
  return out; }
