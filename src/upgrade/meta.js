// ================= META · save data, profile, progression, achievements, daily, difficulty, music, effects, menus
let needRender=true;
const esc=s=>String(s).replace(/[&<>"'`]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
const num=(v,d,a=-1e12,b=1e12)=>{ v=Number(v); return Number.isFinite(v)?clamp(v,a,b):d; };
const cleanName=s=>{ s=String(s??'').replace(/[<>&"'`\\{}]/g,'').replace(/\s+/g,' ').trim().slice(0,16); return s||'খেলোয়াড়'; };
const todayKey=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const fmtDur=s=>{ s=Math.floor(s); const h=Math.floor(s/3600), m=Math.floor(s/60)%60; return h?`${bn(h)} ঘ ${bn(m)} মি`:`${bn(m)} মিনিট`; };
const fmtClock=s=>{ s=Math.floor(s); return bn(String(Math.floor(s/60)).padStart(2,'0'))+':'+bn(String(s%60).padStart(2,'0')); };
const scrOn=id=>$(id).classList.contains('on');
function showScr(id,on=true){ $(id).classList.toggle('on',on); }
const vib=ms=>{ if(IS_TOUCH&&settings.vibrate&&navigator.vibrate) try{navigator.vibrate(ms);}catch(e){} };

const SAVE_KEY='borsha_save', SAVE_V=1;
const STAT_KEYS=['dist','walk','snatchCaught','snatches','deliveries','thugs','falls','ko','carjacks','flights','missions','runs','wins','fares','escapes','dailies'];
const RUNSTAT0=()=>({snatchCaught:0,snatches:0,deliveries:0,thugs:0,escapes:0,dist:0,walk:0,fares:0,carjacks:0,falls:0,ko:0,missions:0,flights:0,xp:0,coins:0,stars:0});
const OUTFITS={
 rafi:[{name:'ক্লাসিক নীল',o:{}},{name:'সাদা-সবুজ চেক',o:{shirt:'#f2f2f2',lungi:['#1b5e20','#a5d6a7']},cost:150},{name:'হলুদ রেইনকোট',o:{shirt:'#f9c80e',lungi:['#263238','#607d8b']},lvl:3},{name:'লাল জার্সি',o:{shirt:'#c62828',lungi:['#1a237e','#7986cb']},cost:300},{name:'কালো জ্যাকেট',o:{shirt:'#232323',lungi:['#4e342e','#a1887f']},lvl:6},{name:'ঈদের পাঞ্জাবি',o:{shirt:'#e1bee7',lungi:['#4a148c','#ce93d8']},cost:600,lvl:8}],
 mitu:[{name:'ম্যাজেন্টা রাইডার',o:{}},{name:'টিল জ্যাকেট',o:{shirt:'#00897b',cap:'#00897b'},cost:150},{name:'কমলা রেইনগিয়ার',o:{shirt:'#ef6c00',cap:'#ef6c00',low:'#37474f'},lvl:3},{name:'বেগুনি স্ট্রিট',o:{shirt:'#6a1b9a',cap:'#111111',low:'#1b1b1b'},cost:300},{name:'সবুজ-লাল',o:{shirt:'#2e7d32',cap:'#c62828'},lvl:6},{name:'রাতের কালো',o:{shirt:'#1c1c1c',cap:'#d81b60',shoe:'#d81b60'},cost:600,lvl:8}],
 jamal:[{name:'সাদা পাঞ্জাবি',o:{}},{name:'ঘিয়ে রঙ',o:{shirt:'#efe3c2'},cost:150},{name:'আকাশি',o:{shirt:'#b3d9f2',lungi:['#263238','#90a4ae']},lvl:3},{name:'সবুজ পাঞ্জাবি',o:{shirt:'#2e7d32',cap:'#f4f4f4'},cost:300},{name:'মেরুন',o:{shirt:'#7b1f2b',cap:'#f4f4f4',lungi:['#3e2723','#a1887f']},lvl:6},{name:'জুম্মার সাজ',o:{shirt:'#fafafa',cap:'#fafafa',lungi:['#f0f0f0','#d6d6d6']},cost:600,lvl:8}],
};
const ACH=[
 {id:'first_ride',ic:'🛺',name:'প্রথম যাত্রা',desc:'প্রথমবার কোনো গাড়িতে ওঠো',xp:30},
 {id:'parcel',ic:'📦',name:'পার্সেল মাস্টার',desc:'মিশন ১ শেষ করো',xp:60},
 {id:'speedy',ic:'⏱️',name:'জ্যাম-ফাইটার',desc:'গুলশান ডেলিভারি বোনাস সময়ের মধ্যে শেষ করো',xp:120},
 {id:'home',ic:'🏠',name:'বাড়ি ফেরা',desc:'পুরো গল্প শেষ করো',xp:250},
 {id:'dry',ic:'🥾',name:'শুকনা পা',desc:'একবারও না পড়ে পুরো গল্প শেষ করো',xp:400},
 {id:'splash',ic:'🕳️',name:'ধপাস!',desc:'প্রথমবার খোলা ম্যানহোলে পড়ো (হয়েই যায়!)',xp:20},
 {id:'catch5',ic:'🦸',name:'জনতার নায়ক',desc:'মোট ৫ জন ছিনতাইকারী ধরো',xp:200,prog:()=>[SAVE.stats.snatchCaught,5]},
 {id:'deliv10',ic:'🛵',name:'ডেলিভারি কুইন',desc:'মিতুকে দিয়ে ১০টা ডেলিভারি দাও',xp:220,prog:()=>[SAVE.stats.deliveries,10]},
 {id:'stand5',ic:'👊',name:'স্ট্যান্ডের বড় ভাই',desc:'জামাল চাচাকে দিয়ে ৫টা স্ট্যান্ড শান্ত করো',xp:220,prog:()=>[SAVE.stats.thugs,5]},
 {id:'star5',ic:'🚨',name:'উত্তরা মহাজ্যাম',desc:'৫ তারা ওয়ান্টেড হও',xp:120},
 {id:'boss',ic:'👑',name:'সিন্ডিকেট ভাঙলো',desc:'ঢাকনা সিন্ডিকেটের তিন বসকেই হারাও',xp:300},
 {id:'boss_fast',ic:'⚡',name:'ঝড়ের গতি',desc:'বস ফাইট ৩ মিনিটের কম সময়ে জেতো',xp:200},
 {id:'boss_dodge',ic:'🛡️',name:'বুলেট এড়ানো',desc:'মিনিগানের একটা গুলিও না খেয়ে ট্যাংক মামুনকে হারাও',xp:200},
 {id:'escape3',ic:'💨',name:'হাওয়া!',desc:'৩ বা বেশি তারা থেকে পালিয়ে বাঁচো',xp:150},
 {id:'pilot',ic:'🚁',name:'আকাশে ঢাকা',desc:'হেলিকপ্টার বা প্লেন নিয়ে ওড়ো',xp:150},
 {id:'km10',ic:'🛣️',name:'রোড রাজা',desc:'মোট ১০ কিমি গাড়ি চালাও',xp:180,prog:()=>[Math.floor(SAVE.stats.dist/1000),10]},
 {id:'rich',ic:'💰',name:'পকেট ভারী',desc:'একজন নায়কের কাছে একসাথে ৳৫,০০০',xp:150},
 {id:'trio',ic:'👥',name:'তিন রত্ন',desc:'তিন নায়ককেই খেলো',xp:80,prog:()=>[SAVE.heroesPlayed.length,3]},
 {id:'explorer',ic:'🧭',name:'ঢাকা ঘুরি',desc:'১২টা আলাদা এলাকায় যাও',xp:200,prog:()=>[SAVE.zones.length,12]},
 {id:'daily3',ic:'📅',name:'রোজকার মানুষ',desc:'৩টা দৈনিক চ্যালেঞ্জ শেষ করো',xp:200,prog:()=>[SAVE.stats.dailies,3]},
 {id:'style',ic:'👕',name:'ফ্যাশনিস্তা',desc:'কয়েন দিয়ে একটা নতুন পোশাক কেনো',xp:60},
 {id:'stars12',ic:'⭐',name:'তারকা',desc:'গল্পের মিশনে মোট ১২ তারা পাও',xp:300,prog:()=>[SAVE.stars.reduce((a,b)=>a+b,0),12]},
];
const DAILY=[
 {k:'dist',n:3000,t:'৩ কিমি গাড়ি চালাও',f:v=>bn((v/1000).toFixed(1))+' / ৩ কিমি'},
 {k:'snatchCaught',n:2,t:'২ জন ছিনতাইকারী ধরো'},
 {k:'deliveries',n:3,t:'মিতুকে দিয়ে ৩টা ডেলিভারি দাও'},
 {k:'thugs',n:1,t:'জামাল চাচাকে দিয়ে একটা স্ট্যান্ড শান্ত করো'},
 {k:'missions',n:2,t:'গল্পের যেকোনো ২টা মিশন শেষ করো'},
 {k:'fares',n:3,t:'৩ বার ভাড়া দিয়ে রিকশা/সিএনজিতে ওঠো'},
 {k:'escapes',n:2,t:'ওয়ান্টেড থেকে ২ বার পালাও'},
 {k:'flights',n:1,t:'বিমানবন্দর থেকে আকাশে ওড়ো'},
 {k:'walk',n:1500,t:'১.৫ কিমি পায়ে হাঁটো বা দৌড়াও',f:v=>bn((v/1000).toFixed(1))+' / ১.৫ কিমি'},
];
const DIFFS={easy:{n:'সহজ',dmg:.6,cop:.85,decay:4,falls:99,warn:true,atk:1,mult:.8},normal:{n:'স্বাভাবিক',dmg:1,cop:1,decay:6,falls:5,warn:false,atk:2,mult:1},hard:{n:'কঠিন',dmg:1.35,cop:1.12,decay:8,falls:3,warn:false,atk:3,mult:1.3},auto:{n:'অটো',mult:1}};
const DIFF_DESC={easy:'কম আঘাত, ধীর পুলিশ, ম্যানহোলের আগাম সতর্কতা, মিশন কখনো ব্যর্থ হয় না',normal:'আসল অভিজ্ঞতা — একটা মিশনে ৫ বার পড়লে মিশন ব্যর্থ',hard:'বেশি আঘাত, দ্রুত পুলিশ, একসাথে ৩ জন মারে — ৩ বার পড়লেই ব্যর্থ (স্কোর ×১.৩)',auto:'তুমি কেমন খেলছো দেখে নিজে বদলায়: বারবার পড়লে সহজ হয়, ভালো খেললে কঠিন'};
function DF(){ if(settings.diff!=='auto') return DIFFS[settings.diff]||DIFFS.normal; const a=SAVE.adapt, t=(a+1)/2; return {n:'অটো',dmg:.65+t*.65,cop:.88+t*.24,decay:4.5+t*3.5,falls:6,warn:a<-.25,atk:a<-.3?1:a>.4?3:2,mult:1}; }
const autoLabel=()=>{ const a=SAVE.adapt; return a<-.35?'এখন সহজের দিকে':a>.35?'এখন কঠিনের দিকে':'এখন স্বাভাবিক'; };
function adapt(d){ SAVE.adapt=clamp(SAVE.adapt+d,-1,1); }
const PAR=[0,150,120,260,320];
const MDESC=['','মতিঝিল অফিস থেকে রহস্যময় পার্সেল তোলো','১২০ সেকেন্ডে গুলশানে পৌঁছাও — জ্যাম পেরিয়ে','পানি বাড়ছে — পুরান ঢাকার বিরিয়ানি দোকানে যাও','বৃষ্টি থামবে, পানি না — ম্যানহোল এড়িয়ে উত্তরায় ফেরো'];
const lvlXP=L=>50*L*(L-1);
const levelOf=xp=>{ let L=1; while(L<60&&xp>=lvlXP(L+1)) L++; return L; };
const levelTitle=L=>L>=15?'ঢাকার কিংবদন্তি':L>=10?'বর্ষার ওস্তাদ':L>=6?'জ্যাম-যোদ্ধা':L>=3?'পাড়ার চেনামুখ':'নতুন যাত্রী';

function defSave(){ return {v:SAVE_V,profile:{name:'খেলোয়াড়',xp:0,coins:0,created:Date.now(),play:0,tut:false,last:0},stats:Object.fromEntries(STAT_KEYS.map(k=>[k,0])),ach:{},stars:[0,0,0,0,0],records:[],
  outfits:{rafi:{own:[0],cur:0},mitu:{own:[0],cur:0},jamal:{own:[0],cur:0}},daily:null,heroesPlayed:[],zones:[],adapt:0,run:null,boss:{wins:0,tries:0,best:0}}; }
function cleanRun(r){
  if(!r||typeof r!=='object') return null;
  const H=Array.isArray(r.heroes)?r.heroes:[], R0=RUNSTAT0();
  return {step:num(r.step,0,0,MISSIONS.length)|0,free:!!r.free,won:!!r.won,hero:num(r.hero,0,0,HEROES.length-1)|0,clock:num(r.clock,14*3600,0,48*3600),time:num(r.time,0,0,1e7),falls:num(r.falls,0,0,1e5)|0,maxStars:num(r.maxStars,0,0,5)|0,wc:!!r.wc,
    rs:Object.fromEntries(Object.keys(R0).map(k=>[k,num(r.rs?.[k],0,0,1e9)])),jobs:{mitu:num(r.jobs?.mitu,0,0,1e6)|0,jamal:num(r.jobs?.jamal,0,0,1e6)|0},
    heroes:HEROES.map((h,i)=>{ const q=H[i]||{}; const have=Array.isArray(q.have)?q.have.filter(k=>WEAPONS.some(w=>w.id===k)):['fist'];
      return {x:num(q.x,h.home.x,ORIGIN,MAXC),z:num(q.z,h.home.z,ORIGIN,MAXC),h:num(q.h,0,-50,50),hp:num(q.hp,h.maxHp,1,h.maxHp),money:num(q.money,h.money,0,1e9)|0,have,ammo:{pistol:num(q.ammo?.pistol,0,0,9999)|0,rifle:num(q.ammo?.rifle,0,0,9999)|0},cur:num(q.cur,0,0,WEAPONS.length-1)|0}; })};
}
function cleanSave(s){
  const d=defSave(); if(!s||typeof s!=='object') return d;
  const p=s.profile||{};
  d.profile={name:cleanName(p.name),xp:num(p.xp,0,0,1e9),coins:num(p.coins,0,0,1e9)|0,created:num(p.created,Date.now()),play:num(p.play,0,0,1e9),tut:!!p.tut,last:num(p.last,0)};
  for(const k of STAT_KEYS) d.stats[k]=num(s.stats?.[k],0,0,1e12);
  if(s.ach&&typeof s.ach==='object') for(const a of ACH) if(s.ach[a.id]) d.ach[a.id]=num(s.ach[a.id],Date.now());
  if(Array.isArray(s.stars)) d.stars=d.stars.map((_,i)=>num(s.stars[i],0,0,3)|0);
  if(Array.isArray(s.records)) d.records=s.records.slice(0,8).map(r=>({name:cleanName(r?.name),score:num(r?.score,0,0,1e9)|0,time:num(r?.time,0,0,1e7),money:num(r?.money,0,0,1e9)|0,falls:num(r?.falls,0,0,1e5)|0,stars:num(r?.stars,0,0,99)|0,diff:DIFFS[r?.diff]?r.diff:'normal',date:num(r?.date,Date.now())}));
  for(const h of ['rafi','mitu','jamal']){ const o=s.outfits?.[h]; const n=OUTFITS[h].length; if(o&&typeof o==='object'){ const own=Array.isArray(o.own)?[...new Set(o.own.map(x=>num(x,0,0,n-1)|0))]:[0]; if(!own.includes(0)) own.unshift(0); const cur=num(o.cur,0,0,n-1)|0; d.outfits[h]={own,cur:own.includes(cur)?cur:0}; } }
  if(s.daily&&typeof s.daily==='object'&&typeof s.daily.day==='string') d.daily={day:s.daily.day.slice(0,10),i:num(s.daily.i,0,0,DAILY.length-1)|0,base:num(s.daily.base,0,0,1e12),done:!!s.daily.done};
  if(Array.isArray(s.heroesPlayed)) d.heroesPlayed=[...new Set(s.heroesPlayed.filter(x=>['rafi','mitu','jamal'].includes(x)))];
  if(Array.isArray(s.zones)) d.zones=[...new Set(s.zones.filter(z=>typeof z==='string').map(z=>z.slice(0,40)))].slice(0,80);
  d.adapt=num(s.adapt,0,-1,1); d.run=cleanRun(s.run);
  d.boss={wins:num(s.boss?.wins,0,0,1e6)|0,tries:num(s.boss?.tries,0,0,1e7)|0,best:num(s.boss?.best,0,0,1e6)};
  return d;
}
let SAVE=defSave(), saveWarned=false, runStats=RUNSTAT0(), runAch=[], chasePeak=0;
function loadSave(){
  try{ const raw=localStorage.getItem(SAVE_KEY); if(raw) SAVE=cleanSave(JSON.parse(raw)); }
  catch(e){ try{ localStorage.setItem(SAVE_KEY+'_corrupt',localStorage.getItem(SAVE_KEY)||''); }catch(_){} SAVE=defSave(); setTimeout(()=>popCard('⚠️','সেভ ফাইল নষ্ট ছিল','নতুন করে শুরু হলো — পুরনোটা আলাদা রাখা আছে','blue'),1500); }
  ensureDaily();
}
function writeSave(){
  try{ SAVE.profile.last=Date.now(); localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE)); return true; }
  catch(e){ if(!saveWarned){ saveWarned=true; popCard('💾','সেভ করা যাচ্ছে না','ব্রাউজারের স্টোরেজ বন্ধ বা ভরা — অগ্রগতি শুধু এই সেশনে থাকবে','blue'); } return false; }
}
function captureRun(){
  if(!state.runLive) return SAVE.run;
  const cur=hero(); Object.assign(cur.st,{x:player.x,z:player.z,h:player.h,hp:player.hp,money:state.money});
  return {step:state.step,free:!!state.freeRoam,won:!!state.won,hero:heroIdx,clock:state.clock,time:state.time,falls:state.falls,maxStars:state.maxStars,wc:weatherCleared,rs:{...runStats},
    jobs:{mitu:jobs.mitu.count,jamal:jobs.jamal.count},
    heroes:HEROES.map(H=>{ const I=H.inv||{have:{fist:1,lathi:H.id==='jamal'?1:0},ammo:{pistol:0,rifle:0},cur:H.id==='jamal'?1:0};
      return {x:H.st.x,z:H.st.z,h:H.st.h,hp:H.st.hp,money:Math.round(H.st.money),have:Object.keys(I.have).filter(k=>I.have[k]),ammo:{...I.ammo},cur:I.cur}; })};
}
let saveT=20;
function persist(){ if(state.runLive) SAVE.run=captureRun(); return writeSave(); }
function persistSoon(){ saveT=Math.min(saveT,1); }

// ---- progression
function addXP(n){ if(!(n>0)) return; const b=levelOf(SAVE.profile.xp); SAVE.profile.xp+=n; runStats.xp+=n; const a=levelOf(SAVE.profile.xp); if(a>b) levelUp(a); }
function addCoins(n){ n=Math.round(n); if(n>0){ SAVE.profile.coins+=n; runStats.coins+=n; } }
function levelUp(L){
  const un=[]; for(const h in OUTFITS) OUTFITS[h].forEach(o=>{ if(o.lvl===L) un.push(o.name); });
  addCoins(40*L); popCard('⬆️',`লেভেল আপ! লেভেল ${bn(L)} — ${levelTitle(L)}`,(un.length?'নতুন পোশাক খুলেছে: '+un.join(', ')+' · ':'')+`+${bn(40*L)} 🪙`,'');
  AU.tone(523,0,.15,'triangle',.07); AU.tone(659,0,.15,'triangle',.07,.12); AU.tone(784,0,.15,'triangle',.07,.24); AU.tone(1046,0,.4,'triangle',.07,.36);
  if(state.started) fxBurst(player.x,1.6,player.z,[[1,.85,.25],[1,1,.7]],50,5,5,1.4,.32);
}
function stat(k,n=1){ SAVE.stats[k]=(SAVE.stats[k]||0)+n; if(k in runStats) runStats[k]+=n; checkAch(); checkDaily(); }
function unlock(id){ if(SAVE.ach[id]) return; const a=ACH.find(x=>x.id===id); if(!a) return; SAVE.ach[id]=Date.now(); runAch.push(id);
  addXP(a.xp); addCoins(a.xp/4); popCard(a.ic,'অর্জন: '+a.name,`${a.desc} · +${bn(a.xp)} XP`,''); persistSoon(); }
function checkAch(){ for(const a of ACH){ if(!a.prog||SAVE.ach[a.id]) continue; const [c,n]=a.prog(); if(c>=n) unlock(a.id); } }
function ensureDaily(){ const day=todayKey(); if(!SAVE.daily||SAVE.daily.day!==day){ let h=7; for(const c of day) h=(h*31+c.charCodeAt(0))>>>0; const i=h%DAILY.length; SAVE.daily={day,i,base:SAVE.stats[DAILY[i].k]||0,done:false}; } return SAVE.daily; }
function dailyProg(){ const d=ensureDaily(), Q=DAILY[d.i]; return [d.done?Q.n:clamp((SAVE.stats[Q.k]||0)-d.base,0,Q.n),Q.n,Q,d]; }
function checkDaily(){ const d=ensureDaily(); if(d.done) return; const [c,n]=dailyProg(); if(c<n) return;
  d.done=true; SAVE.stats.dailies++; addXP(200); addCoins(120); if(state.started) state.money+=300;
  popCard('📅','দৈনিক চ্যালেঞ্জ শেষ!','+২০০ XP · +১২০ 🪙'+(state.started?' · +৳৩০০':''),'blue'); checkAch(); persistSoon(); }
function markHeroPlayed(){ const id=hero().id; if(!SAVE.heroesPlayed.includes(id)){ SAVE.heroesPlayed.push(id); checkAch(); } }
function onZone(z){ if(z&&!SAVE.zones.includes(z)){ SAVE.zones.push(z); checkAch(); } }
function onEscaped(){ stat('escapes'); if(chasePeak>=3) unlock('escape3'); chasePeak=0; adapt(.06); }
function onMissionDone(i,onTime,r){
  if(i<1) return 0;
  let st=1; if(!state.missionFalls) st++; if(onTime||state.stepT<=PAR[i]) st++;
  SAVE.stars[i]=Math.max(SAVE.stars[i]||0,st); runStats.stars+=st;
  stat('missions'); addXP(100+i*40+st*20); addCoins(r/10+st*10);
  if(i===1) unlock('parcel'); if(i===2&&onTime) unlock('speedy');
  adapt(state.missionFalls?.04:.15); checkAch(); persistSoon();
  return st;
}
function onFail(title){
  const mh=/ম্যানহোল/.test(title); stat(mh?'falls':'ko'); if(mh) unlock('splash'); adapt(-.18);
  if(hero().id==='rafi'&&!state.freeRoam&&state.step>=1&&state.step<MISSIONS.length){ state.missionFalls=(state.missionFalls||0)+1; const lim=DF().falls;
    if(state.missionFalls>=lim) state.defeatPending=true; else if(lim<20&&lim-state.missionFalls<=2) setTimeout(()=>toast(`⚠️ সাবধান! আর ${bn(lim-state.missionFalls)} বার পড়লে মিশন ব্যর্থ`,3.5),3800); }
}
const runScore=()=>Math.max(0,Math.round((state.money+runStats.stars*250+Math.max(0,1800-state.time)*2-state.falls*150)*(DF().mult||1)));

// ---- run lifecycle (no page reloads)
function resetRunState(){
  bossAbort();
  state.failT=0; state.won=false; state.freeRoam=false; state.time=0; state.stepT=0; state.falls=0; state.maxStars=0; state.missionFalls=0; state.defeatPending=false;
  heat=0; escapeT=0; catchT=0; chasePeak=0; while(police.length) removeVehicle(police.pop());
  $('game').classList.remove('gray'); hideHudFx();
  for(const p of peds){ p.loot=0; if(['thug','snatcher','mob','fight','down','flee'].includes(p.state)){ if(p.spare||p.keeper) p.state='hidden'; else { p.state='flee'; p.stateT=1; } } }
  snatchEvt.active=null; snatchEvt.timer=75; weatherCleared=false; rainbowAmt=0;
  Object.assign(jobs.mitu,{phase:null,count:0}); Object.assign(jobs.jamal,{phase:null,count:0,thugs:[]});
  runStats=RUNSTAT0(); runAch=[];
  if(player.inVeh){ player.inVeh.spd=0; player.inVeh=null; }
  HEROES.forEach(H=>{ const v=H.st.ownVeh; if(v){ Object.assign(v,{x:H.veh.x,z:H.home.z,h:H.veh.h,spd:0,hp:100,dead:false,stalled:false,y:0,fixed:true,ai:false}); }
    H.st={x:H.home.x,z:H.home.z,h:H.home.x<H.veh.x?Math.PI/2:-Math.PI/2,hp:H.maxHp,money:H.money,inVeh:null,y:.15,ownVeh:v}; H.inv=null; });
  for(const [v,x,z] of [[heliV,HELI_X,HELI_Z],[planeV,roadC(13)+14,roadC(7)+CELL*.55]]) if(v) Object.assign(v,{x,z,h:Math.PI/2,y:0,vy:0,spd:0,hp:100,dead:false,locked:true,rotorSpd:0});
  if(AU.ctx) AU.engG.gain.value=0;
}
function hideHudFx(){ for(const id of ['big','passed','toast']) $(id).style.opacity=0; toastT=bigT=passedT=0; letterbox(false); $('tip').style.opacity=0; }
function useHero(i){ heroIdx=i; const H=hero(); player.im=H.im; player.imU=H.imU; }
function spawnRideNear(){ const type=water.level>.36?'rickshaw':'cng'; let vx=player.x+Math.cos(player.h)*2.6, vz=player.z-Math.sin(player.h)*2.6; if(blocked(vx,vz,1)){ vx=player.x-Math.cos(player.h)*2.6; vz=player.z+Math.sin(player.h)*2.6; } if(blocked(vx,vz,1)){ vx=player.x+1.5; vz=player.z; } return makeVehicle(type,vx,vz,player.h,randInt(0,3),false); }
function placePlayer(x,z,h){ player.x=x; player.z=z; player.h=h; for(let t=0;t<40&&blocked(player.x,player.z,.5);t++){ player.x=x+rand(-4,4); player.z=z+rand(-4,4); } }
function beginStory(i,free){
  resetRunState(); useHero(0); const H=hero();
  Object.assign(player,{hp:H.maxHp,fall:0,punchT:0,amp:0,y:.15,inVeh:null,lastFight:-99,x:H.st.x,z:H.st.z,h:H.st.h});
  if(free){ i=MISSIONS.length; state.freeRoam=true; weatherCleared=true; }
  state.money=H.money+MISSIONS.slice(1,Math.min(i,MISSIONS.length)).reduce((a,m)=>a+(m.reward||0),0);
  state.clock=14*3600+Math.min(i,4)*3000;
  const prevM=MISSIONS[Math.max(0,Math.min(i,MISSIONS.length)-1)];
  if(free){ water.level=water.target=.1; rainLevel=rainTarget=0; cloudLevel=cloudTarget=.15; }
  else { water.level=i>=2?prevM.water:0; rainLevel=i>=2?prevM.rain:0; cloudLevel=i>=2?(prevM.cloud??.6):.15; }
  if(i>=2&&!free){ const spot=[T.motijheel,T.gulshan,T.biryani][i-2]; placePlayer(spot.x,spot.z,0); spawnRideNear(); }
  state.checkpoint={x:player.x,z:player.z}; state.step=i; state.runLive=true; radioT=2;
  camYaw=player.h+.5; updateCamera(0,true);
  if(free){ toast(`🌤️ ফ্রি রোম — পুরো বৃহত্তর ঢাকা তোমার। ${IS_TOUCH?'👥 বাটনে':K('Tab')+'-এ'} নায়ক বদলাও।`,4); }
  else if(i===0){ big('বর্ষা সিটি: ঢাকা','ঝকঝকে রোদ… কিন্তু রেডিও বলছে বিকালে ঝুম বৃষ্টি।',4); letterbox(true); setTimeout(()=>letterbox(false),3000); setTimeout(()=>{ if(state.step===0) startStep(0); },200); }
  else startStep(i);
  stat('runs'); persistSoon();
}
function restoreRun(r){
  resetRunState();
  state.step=Math.min(r.step,MISSIONS.length); state.freeRoam=r.free||r.won||state.step>=MISSIONS.length; state.time=r.time; state.falls=r.falls; state.maxStars=r.maxStars; state.clock=r.clock; weatherCleared=r.wc; Object.assign(runStats,r.rs);
  jobs.mitu.count=r.jobs.mitu; jobs.jamal.count=r.jobs.jamal;
  HEROES.forEach((H,i)=>{ const q=r.heroes[i]; let x=q.x,z=q.z; if(blocked(x,z,.4)){ x=H.home.x; z=H.home.z; }
    Object.assign(H.st,{x,z,h:q.h,hp:q.hp,money:q.money,inVeh:null});
    const have={fist:1}; q.have.forEach(k=>have[k]=1); H.inv={have,ammo:{...q.ammo},cur:have[WEAPONS[q.cur]?.id]?q.cur:0}; });
  useHero(r.hero); const H=hero(); Object.assign(player,{x:H.st.x,z:H.st.z,h:H.st.h,hp:H.st.hp,fall:0,punchT:0,amp:0,y:.15,inVeh:null}); state.money=H.st.money;
  if(state.freeRoam){ state.step=MISSIONS.length; water.level=water.target=.1; rainLevel=rainTarget=0; cloudLevel=cloudTarget=.15; weatherCleared=true; }
  else { const M=MISSIONS[state.step]; water.level=water.target=M.water; rainLevel=rainTarget=M.rain; cloudLevel=cloudTarget=M.cloud??.15;
    if(state.step===4&&weatherCleared){ rainLevel=rainTarget=0; cloudLevel=cloudTarget=.18; water.level=water.target=.52; } }
  state.checkpoint={x:player.x,z:player.z}; state.runLive=true; radioT=2;
  const own=H.st.ownVeh; if(!own||Math.hypot(own.x-player.x,own.z-player.z)>10) spawnRideNear();
  camYaw=player.h; updateCamera(0,true);
  toast(`💾 আগের জায়গা থেকে শুরু — ${H.name}`,3);
}
function enterGame(){
  document.body.classList.remove('inmenu'); showScr('home',false); showScr('pauseScreen',false); showScr('endScreen',false);
  $('topBtns').style.display='flex'; if(IS_TOUCH) $('touch').style.display='block';
  state.started=true; state.paused=false; last=performance.now(); needRender=true;
  if(AU.ctx&&AU.ctx.state==='suspended') AU.ctx.resume(); try{speechSynthesis.resume();}catch(e){}
  MUS.set('game'); markHeroPlayed(); hudLevel(true); applyTouchLayout();
  if(IS_TOUCH){ try{ const el=document.documentElement; if(!document.fullscreenElement) (el.requestFullscreen||el.webkitRequestFullscreen)?.call(el)?.catch?.(()=>{}); }catch(e){} try{screen.orientation?.lock?.('landscape').catch(()=>{});}catch(e){} }
}
function toMenu(page){
  bossAbort(); persist(); state.started=false; state.paused=false; showScr('pauseScreen',false); showScr('endScreen',false);
  if(toggleMapOpen()) $('mapScreen').style.display='none'; $('heroPanel').style.display='none'; hideHudFx();
  if(AU.ctx){ AU.ctx.resume(); AU.engG.gain.value=0; } try{speechSynthesis.cancel();}catch(e){}
  MUS.set('menu'); showHome(page||'dash');
}
const toggleMapOpen=()=>$('mapScreen').style.display==='flex';
async function newGame(i=0,free=false){
  if((state.runLive&&!state.won)||(SAVE.run&&!SAVE.run.won)){ if(!await askBox(free?'ফ্রি রোম শুরু করবে?':(i<=1?'নতুন খেলা শুরু করবে?':`মিশন ${bn(i)} থেকে শুরু করবে?`),'চলমান গল্পের অগ্রগতি (মিশন, টাকা, অবস্থান) বদলে যাবে। XP, লেভেল, কয়েন আর অর্জন থাকবে।','হ্যাঁ, শুরু করো')) return; }
  const go=()=>{ beginStory(i,free); enterGame(); };
  if(!SAVE.profile.tut&&!free) showTutorial(go); else go();
}
function continueGame(){
  if(state.runLive){ enterGame(); return; }
  if(SAVE.run){ restoreRun(SAVE.run); enterGame(); return; }
  newGame(0);
}
async function playGig(hi){
  if(!state.runLive){ if(SAVE.run) restoreRun(SAVE.run); else beginStory(0); }
  enterGame();
  if(heroIdx!==hi){ if(canSwitch()) switchHero(hi); }
}
function win(){
  state.won=true; state.paused=true; needRender=true; stat('wins'); unlock('home'); if(state.falls===0) unlock('dry');
  addXP(300); addCoins(150);
  const sc=runScore(), best=SAVE.records[0]?.score||0;
  SAVE.records.push({name:SAVE.profile.name,score:sc,time:state.time,money:Math.round(state.money),falls:state.falls,stars:runStats.stars,diff:settings.diff,date:Date.now()});
  SAVE.records.sort((a,b)=>b.score-a.score); SAVE.records=SAVE.records.slice(0,8);
  persist(); MUS.jingle();
  showEnd('win',{sc,newBest:sc>best});
}
function showDefeat(){ state.paused=true; needRender=true; showEnd('lose',{}); persist(); }
function showEnd(kind,o){
  const W=kind==='win', lim=DF().falls;
  const rew=W?[['💰 টাকা',`৳${bn(Math.round(state.money))}`],['⭐ XP',`+${bn(Math.round(runStats.xp))}`],['🪙 কয়েন',`+${bn(Math.round(runStats.coins))}`],['🏁 স্কোর',`${bn(o.sc)}${o.newBest?' <em class="tag g">নতুন রেকর্ড!</em>':''}`]]
             :[['🎯 মিশন',esc(MISSIONS[state.step]?.title||'')],['🕳️ এই মিশনে পড়া',`${bn(state.missionFalls||0)} / ${bn(lim)}`],['💰 হাতে টাকা',`৳${bn(Math.round(state.money))}`],['⚙️ কঠিনতা',DF().n]];
  const recap=[['মিশনের তারা',`★ ${bn(runStats.stars)}`],['ম্যানহোল / অজ্ঞান',`${bn(state.falls)} বার`],['সর্বোচ্চ ওয়ান্টেড',`${bn(state.maxStars)} তারা`],['ছিনতাইকারী ধরা',bn(runStats.snatchCaught)],['গাড়ি চালানো',`${bn((runStats.dist/1000).toFixed(1))} কিমি`]];
  const li=a=>a.map(([k,v])=>`<li><span>${k}</span><b>${v}</b></li>`).join('');
  $('endP').className='panel endp cut'+(W?'':' lose');
  $('endP').innerHTML=`<h1 class="title">${W?'বেঁচে গেলে!':'মিশন ব্যর্থ'}</h1>
   <h3>${W?`বৃষ্টির দিন পার — শুকনো (প্রায়) অবস্থায় বাসায় 🏠 · কঠিনতা: ${DF().n}`:`এই মিশনে ${bn(state.missionFalls||0)} বার পড়ে গেছো — ${esc(MISSIONS[state.step]?.title||'')} আবার চেষ্টা করো`}</h3>
   <div class="etime"><small>${W?'মোট সময়':'মিশনের সময়'}</small><b>${fmtClock(W?state.time:state.stepT)}</b></div>
   <div class="eblocks"><div class="eb"><h4>${W?'অর্জিত পুরস্কার':'ফলাফল'}</h4><ul>${li(rew)}</ul></div><div class="eb"><h4>রিক্যাপ</h4><ul>${li(recap)}</ul></div></div>
   ${runAch.length?`<div class="eachs">${runAch.map(id=>{const a=ACH.find(x=>x.id===id);return `<span class="bdg"><span>${a.ic}</span>${esc(a.name)}</span>`;}).join('')}</div>`:''}
   ${W?(state.falls===0?'<p class="etip">🏅 "শুকনা পা" — একবারও পড়োনি!</p>':'<p class="etip">মা বলছে: "পরের বার ছাতা না, গামবুট নিয়ে বের হবি।"</p>'):'<p class="etip">💡 পানিতে ঘূর্ণি, বুদবুদ বা লাল পতাকা দেখলে পাশ কাটাও। "সহজ" কঠিনতায় মিশন ব্যর্থ হয় না, আর ম্যানহোলের আগাম সতর্কতা পাবে।</p>'}
   <div class="btnrow c">${W?'<button class="btn ghost" id="eMenu">🏠 মেনু</button><button class="btn ghost" id="eAgain">↺ আবার খেলো</button><button class="btn cta" id="eFree">🌤️ ফ্রি রোম</button>'
     :'<button class="btn ghost" id="eMenu">🏠 মেনু</button><button class="btn ghost" id="eMis">🎯 মিশন বাছো</button><button class="btn cta" id="eRetry">↺ আবার চেষ্টা</button>'}</div>`;
  showScr('endScreen',true);
  const on=(id,f)=>{ const b=$(id); if(b) b.onclick=f; };
  on('eMenu',()=>toMenu()); on('eMis',()=>toMenu('missions'));
  on('eAgain',()=>{ beginStory(0); enterGame(); });
  on('eRetry',()=>{ const s=state.step; beginStory(s); enterGame(); });
  on('eFree',()=>{ showScr('endScreen',false); state.won=false; state.paused=false; state.freeRoam=true; rainTarget=0; cloudTarget=.15; water.target=.1; weatherCleared=true; last=performance.now(); persist(); });
  setTimeout(()=>$('endP').querySelector('.cta')?.focus(),60);
}

// ---- smart hints & assists (simple local rules, no online AI)
const HINTS={}; let hintCool=10, tipT=0, idleT=0, mhCool=0, distAcc=0, walkAcc=0, tick1=1, flyCounted=false;
const PV={x:0,z:0,lx:null,lz:null,mx:0,mz:0};
function tip(t,d=5,warn=false){ const e=$('tip'); e.textContent=t; e.classList.toggle('warn',warn); e.style.opacity=1; tipT=d; }
function smartHints(dt){
  if(!settings.hints) return; hintCool-=dt; if(hintCool>0||state.failT>0) return;
  const show=(k,t)=>{ if((HINTS[k]||0)>=3) return false; HINTS[k]=(HINTS[k]||0)+1; tip(t,6); hintCool=24; return true; };
  const v=player.inVeh, OB=objective(), tg=OB&&(OB.target||OB.checkTarget);
  if(v&&v.stalled&&!v.air&&show('stall','💡 গাড়ি পানিতে বন্ধ — নেমে রিকশা নাও (মিনিম্যাপে হলুদ ফোঁটা)')) return;
  if(stars()>=1&&policeNear(70)&&show('cop','💡 সার্জেন্টদের চোখের আড়ালে যাও — কিছুক্ষণ না দেখলে তারা কমে')) return;
  if(!v&&player.hp<hero().maxHp*.35&&show('hp','💡 মারামারি থামাও — কয়েক সেকেন্ড শান্ত থাকলে HP নিজে ফেরে')) return;
  if(tg&&!v&&Math.hypot(tg.x-player.x,tg.z-player.z)>650&&show('far',`💡 অনেক দূর! ${IS_TOUCH?'"উঠো"':'F'} চেপে ভাড়ায় সিএনজি/রিকশা নাও`)) return;
  if(tg&&idleT>40&&show('idle','💡 মাথার উপরের হলুদ তীর আর মিনিম্যাপের হলুদ বিন্দু ধরে এগোও')) return;
}
const assistOn=()=>water.level>.05&&settings.hints&&(DF().warn||(state.missionFalls||0)>=2||SAVE.adapt<-.5);
function manholeAssist(dt){
  mhCool-=dt; if(mhCool>0||!assistOn()) return; const v=player.inVeh; if(v&&v.air) return;
  const h=v?v.h:player.h, fx=Math.sin(h), fz=Math.cos(h), R=v?Math.max(8,Math.abs(v.spd)*1.2):5;
  for(const m of manholes){ const dx=m.x-player.x, dz=m.z-player.z, d=Math.hypot(dx,dz); if(d>R||d<.4||(dx*fx+dz*fz)/d<.55) continue;
    tip('⚠️ সামনে খোলা ম্যানহোল হতে পারে — পাশ কাটাও!',2.2,true); AU.tone(880,0,.08,'square',.03); AU.tone(880,0,.08,'square',.03,.14); vib(40); mhCool=3; break; }
}
function playTick(dt){
  SAVE.profile.play+=dt; bossTick(dt);
  const t=pedTarget();
  if(PV.lx!==null){ const dx=t.x-PV.lx, dz=t.z-PV.lz, d=Math.hypot(dx,dz);
    if(d<15&&dt>0){ const k=Math.min(1,dt*4); PV.x+=(dx/dt-PV.x)*k; PV.z+=(dz/dt-PV.z)*k; const v=player.inVeh; if(v&&!v.air) distAcc+=d; else if(!v) walkAcc+=d; } }
  PV.lx=t.x; PV.lz=t.z;
  if(Math.hypot(t.x-PV.mx,t.z-PV.mz)>2){ PV.mx=t.x; PV.mz=t.z; idleT=0; } else idleT+=dt;
  const av=player.inVeh;
  if(av){ if(!SAVE.ach.first_ride) unlock('first_ride'); if(av.air&&av.y>10){ if(!flyCounted){ flyCounted=true; stat('flights'); unlock('pilot'); } } else if(!av.air) flyCounted=false; }
  if(av&&!av.air&&water.level>.04&&Math.abs(av.spd)>4) fxSpray(av);
  tick1-=dt; if(tick1<=0){ tick1=1;
    if(distAcc>0){ const d=distAcc; distAcc=0; addXP(d/50); stat('dist',d); }
    if(walkAcc>0){ const d=walkAcc; walkAcc=0; stat('walk',d); }
    if(state.money>=5000) unlock('rich'); hudLevel(); }
  saveT-=dt; if(saveT<=0){ saveT=20; persist(); }
  if(tipT>0){ tipT-=dt; if(tipT<=0) $('tip').style.opacity=0; }
  smartHints(dt); manholeAssist(dt);
}
let hudLv='';
function hudLevel(force){ const xp=SAVE.profile.xp, L=levelOf(xp), a=lvlXP(L), b=lvlXP(L+1), w=Math.round((xp-a)/(b-a)*100)+'%';
  const k=L+'|'+w; if(k===hudLv&&!force) return; hudLv=k; $('lvlN').textContent='লেভেল '+bn(L); $('lvlBar').style.width=w; }

// ---- particles (one pooled draw call)
const FX={n:IS_TOUCH?260:520,i:0,pts:null,alive:0};
function buildFX(){
  const n=FX.n, g=new THREE.BufferGeometry();
  FX.pos=new Float32Array(n*3); FX.col=new Float32Array(n*3); FX.life=new Float32Array(n); FX.size=new Float32Array(n); FX.vel=new Float32Array(n*3); FX.max=new Float32Array(n).fill(1); FX.grav=new Float32Array(n);
  g.setAttribute('position',new THREE.BufferAttribute(FX.pos,3)); g.setAttribute('aCol',new THREE.BufferAttribute(FX.col,3)); g.setAttribute('aLife',new THREE.BufferAttribute(FX.life,1)); g.setAttribute('aSize',new THREE.BufferAttribute(FX.size,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uPR:{value:1}},
    vertexShader:`attribute vec3 aCol; attribute float aLife; attribute float aSize; uniform float uPR; varying float vL; varying vec3 vC; void main(){ vL=aLife; vC=aCol; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=aLife>0.001?aSize*uPR*(420./max(.5,-mv.z)):0.; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying float vL; varying vec3 vC; void main(){ vec2 d=gl_PointCoord-.5; float r=dot(d,d); if(r>.25) discard; gl_FragColor=vec4(vC,min(1.,vL*1.6)*(1.-r*3.2)); }`});
  FX.pts=new THREE.Points(g,m); FX.pts.frustumCulled=false; FX.pts.renderOrder=5; scene.add(FX.pts);
}
function fxSpawn(x,y,z,vx,vy,vz,life,size,c,grav=9){ if(!FX.pts) return; const i=FX.i=(FX.i+1)%FX.n;
  FX.pos[i*3]=x; FX.pos[i*3+1]=y; FX.pos[i*3+2]=z; FX.vel[i*3]=vx; FX.vel[i*3+1]=vy; FX.vel[i*3+2]=vz; FX.life[i]=1; FX.max[i]=life; FX.size[i]=size; FX.grav[i]=grav; FX.col[i*3]=c[0]; FX.col[i*3+1]=c[1]; FX.col[i*3+2]=c[2]; FX.alive=1.5; }
function fxBurst(x,y,z,cols,n,spd,up,life,size){ for(let k=0;k<n;k++){ const a=Math.random()*6.283, s=spd*(.3+Math.random()*.7); fxSpawn(x,y,z,Math.cos(a)*s,up*(.4+Math.random()*.8),Math.sin(a)*s,life*(.6+Math.random()*.6),size*(.6+Math.random()*.8),pick(cols)); } }
function fxSpray(v){ if(Math.random()>.85) return; const fx=Math.sin(v.h), fz=Math.cos(v.h), lx=Math.cos(v.h), lz=-Math.sin(v.h), s=Math.abs(v.spd);
  for(const sd of [-1,1]){ const x=v.x+lx*sd*(v.hw+.1)-fx*v.hl*.3, z=v.z+lz*sd*(v.hw+.1)-fz*v.hl*.3;
    fxSpawn(x,water.level+.15,z,lx*sd*rand(1.5,3)-fx*s*.12,rand(2,3.6)+s*.06,lz*sd*rand(1.5,3)-fz*s*.12,rand(.45,.7),rand(.18,.3),pick([[.78,.74,.66],[.86,.88,.88],[.6,.56,.48]])); } }
function fxTick(dt){ if(!FX.pts||FX.alive<=0) return; FX.alive-=dt; const P=FX.pos,V=FX.vel,L=FX.life;
  for(let i=0;i<FX.n;i++){ if(L[i]<=0) continue; L[i]-=dt/FX.max[i]; if(L[i]<=0){ L[i]=0; continue; } V[i*3+1]-=FX.grav[i]*dt; P[i*3]+=V[i*3]*dt; P[i*3+1]=Math.max(water.level+.02,P[i*3+1]+V[i*3+1]*dt); P[i*3+2]+=V[i*3+2]*dt; }
  const g=FX.pts.geometry; g.attributes.position.needsUpdate=g.attributes.aLife.needsUpdate=g.attributes.aCol.needsUpdate=g.attributes.aSize.needsUpdate=true; FX.pts.material.uniforms.uPR.value=renderer.getPixelRatio(); }

// ---- outfits
function applyOutfit(H){
  const O=OUTFITS[H.id][SAVE.outfits[H.id].cur]?.o||{}, o={...H.o0,...O};
  for(const k of ['im','imU']){ const old=H[k]; if(old){ scene.remove(old); old.geometry.dispose(); old.dispose?.(); } }
  H.im=makeCrowdMesh(animatedPersonGeo(H.kind,o),1); H.imU=makeCrowdMesh(animatedPersonGeo(H.kind,{...o,umbrella:'#111111'}),1);
  if(H===hero()){ player.im=H.im; player.imU=H.imU; } syncPlayer();
}
function outfitCols(H,o){ const m={...H.o0,...o.o}; return [m.shirt,(m.lungi&&m.lungi[0])||m.low||'#2b2f3a',m.cap||m.skin].filter(Boolean); }

// ---- music: original procedural score (tanpura drone, bansuri-like flute, tabla-like percussion)
const MUS={timer:null,mood:'off',nextT:0,step:0,phrase:null,SA:146.83,SC:[0,2,3,5,7,9,10],
 f(deg,oct=0){ const n=7, o=Math.floor(deg/n), d=((deg%n)+n)%n; return this.SA*Math.pow(2,(this.SC[d]+12*(o+oct))/12); },
 start(){ if(!this.timer) this.timer=setInterval(()=>this.tick(),70); },
 set(m){ if(this.mood!==m){ this.mood=m; this.phrase=null; this.step=0; } },
 tick(){ const c=AU.ctx; if(!c||!AU.mus||c.state!=='running'||this.mood==='off'||settings.muted||!(settings.music>0)||!(settings.master>0)){ this.nextT=0; return; }
   const chase=this.mood==='game'&&state.started&&!state.paused&&(stars()>=2||bossOn()), bpm=this.mood==='menu'?80:chase?116:90, s16=60/bpm/4;
   if(this.nextT<c.currentTime) this.nextT=c.currentTime+.06;
   while(this.nextT<c.currentTime+.3){ try{ this.note(this.step,this.nextT,s16,chase); }catch(e){} this.nextT+=s16; this.step++; } },
 env(t,a,d,v){ const g=AU.ctx.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(.0006,t+a+d); g.connect(AU.mus); return g; },
 osc(type,f,t,dur,dest){ const o=AU.ctx.createOscillator(); o.type=type; o.frequency.setValueAtTime(f,t); o.connect(dest); o.start(t); o.stop(t+dur); return o; },
 pluck(f,t,v,dec){ const lp=AU.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(2600,t); lp.frequency.exponentialRampToValueAtTime(420,t+dec); lp.connect(this.env(t,.012,dec,v)); this.osc('sawtooth',f,t,dec+.1,lp); this.osc('sawtooth',f*1.004,t,dec+.1,lp); },
 flute(f,t,dur,v){ const c=AU.ctx, g=c.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.07); g.gain.setValueAtTime(v,t+Math.max(.08,dur*.7)); g.gain.linearRampToValueAtTime(0,t+dur+.14); g.connect(AU.mus);
   const o=c.createOscillator(); o.type='triangle'; o.frequency.setValueAtTime(f*.982,t); o.frequency.linearRampToValueAtTime(f,t+.07);
   const l=c.createOscillator(); l.frequency.value=5.3; const lg=c.createGain(); lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(f*.011,t+dur*.6+.05); l.connect(lg).connect(o.frequency); o.connect(g); o.start(t); l.start(t); o.stop(t+dur+.2); l.stop(t+dur+.2); },
 tabla(k,t,v){ const c=AU.ctx;
   if(k==='ge'||k==='dha'||k==='dhi'){ const o=c.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(this.SA*.8,t); o.frequency.exponentialRampToValueAtTime(this.SA*.42,t+.3); o.connect(this.env(t,.004,.32,v)); o.start(t); o.stop(t+.4); }
   if(k==='na'||k==='dha'||k==='dhi'){ const o=c.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(this.SA*4,t); o.connect(this.env(t,.002,k==='dhi'?.42:.22,v*.5)); o.start(t); o.stop(t+.5); const o2=c.createOscillator(); o2.type='triangle'; o2.frequency.setValueAtTime(this.SA*8.03,t); o2.connect(this.env(t,.001,.05,v*.16)); o2.start(t); o2.stop(t+.08); }
   if(k==='ti'||k==='ka'){ const s=c.createBufferSource(); s.buffer=AU.noiseBuf; const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=k==='ti'?3200:1700; bp.Q.value=1.3; s.connect(bp).connect(this.env(t,.001,.05,v*.35)); s.start(t); s.stop(t+.08); } },
 note(i,t,s16,chase){
   const m=this.mood, st=i%16, bar=Math.floor(i/16);
   if(st%4===0){ const b=st/4; this.pluck([this.f(4,-1),this.f(0,0),this.f(0,0),this.f(0,-1)][b],t,m==='menu'?.045:chase?.02:.028,2.6); }
   const TB=['dha',0,'ge',0,'na',0,'ti','ka','na',0,'ka',0,'dhi',0,'na',0], tv=m==='menu'?(bar%8<2?0:.05):chase?.13:.04;
   if(TB[st]&&tv>0&&(m==='menu'||chase||st%4===0||TB[st]==='ti')) this.tabla(TB[st],t,tv);
   if(chase&&(st===0||st===6||st===8||st===14)){ const lp=AU.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=320; lp.connect(this.env(t,.005,.24,.08)); this.osc('square',this.f(0,-2),t,.3,lp); }
   if(chase) return;
   if(st===0&&bar%2===0) this.phrase=this.mk();
   const ph=this.phrase&&this.phrase[(bar%2)*16+st];
   if(ph&&(m==='menu'||bar%4<2)) this.flute(this.f(ph.d,1),t,ph.len*s16,m==='menu'?.05:.028); },
 mk(){ const out=new Array(32).fill(null); let d=pick([0,2,4]), s=0; while(s<27){ const len=pick([2,2,2,4,4,6]); out[s]={d,len}; s+=len+(Math.random()<.25?2:0); d=clamp(d+pick([-2,-1,-1,1,1,2,0]),-2,7); } out[28]={d:pick([0,4]),len:4}; return out; },
 jingle(){ const c=AU.ctx; if(!c||!AU.mus||settings.muted) return; const t=c.currentTime+.05; [0,1,2,4,7].forEach((d,k)=>this.flute(this.f(d,1),t+k*.16,k===4?.9:.18,.07)); this.pluck(this.f(0,0),t+.64,.06,2.5); },
};
function applyVolumes(){ if(!AU.ctx||!AU.out) return; const s=settings, t=AU.ctx.currentTime, set=(g,v)=>g.gain.setTargetAtTime(v,t,.04);
  set(AU.out,s.muted?0:s.master/100); set(AU.master,s.sfx/100); set(AU.amb,s.amb/100); set(AU.mus,s.music/100*.9); }

// ---- popups, dialogs, tutorial
function popCard(ic,t,s,kind=''){ const d=document.createElement('div'); d.className='pop '+kind; d.innerHTML=`<span class="pic">${esc(ic)}</span><div><b>${esc(t)}</b><small>${esc(s)}</small></div>`;
  const st=$('achStack'); st.appendChild(d); while(st.children.length>3) st.firstChild.remove();
  AU.tone(784,0,.12,'triangle',.06); AU.tone(1175,0,.22,'triangle',.06,.1);
  setTimeout(()=>{ d.classList.add('out'); setTimeout(()=>d.remove(),420); },4300); }
let dlgRes=null, dlgFocus=null;
function askBox(t,p,yes='হ্যাঁ',inputVal,danger){ return new Promise(res=>{
  dlgFocus=document.activeElement; $('dlgT').textContent=t; $('dlgP').textContent=p; $('dlgYes').textContent=yes; $('dlgYes').classList.toggle('danger',!!danger);
  const inp=$('dlgIn'), hasIn=inputVal!==undefined; inp.style.display=hasIn?'block':'none'; if(hasIn) inp.value=inputVal;
  showScr('dlg',true); setTimeout(()=>(hasIn?inp:$('dlgNo')).focus(),40);
  dlgRes=v=>{ showScr('dlg',false); dlgRes=null; try{dlgFocus?.focus();}catch(e){} res(hasIn?(v?inp.value:null):!!v); }; }); }
$('dlgYes').onclick=()=>dlgRes&&dlgRes(true); $('dlgNo').onclick=()=>dlgRes&&dlgRes(false);
const TUT=()=>[
 ['🛺','চালাও আর হাঁটো',IS_TOUCH?'বাঁ দিকে আঙুল টেনে জয়স্টিক, ডান দিকে টেনে ক্যামেরা ঘোরাও। দৌড় আর ব্রেক বাটন ডান পাশে।':`${K('KeyW')} ${K('KeyA')} ${K('KeyS')} ${K('KeyD')} দিয়ে চালাও/হাঁটো, মাউস টেনে ক্যামেরা ঘোরাও। ${K('ShiftLeft')} দৌড়, ${K('Space')} ব্রেক, Esc বিরতি।`],
 ['🚪','গাড়িতে ওঠো-নামো',IS_TOUCH?'গাড়ির কাছে গিয়ে "উঠো" চাপো। ড্রাইভার থাকলে ভাড়া লাগে। "ছিনতাই" চাপলে জোর করে নেবে — তখন পুলিশ তাড়া করবে!':`গাড়ির কাছে ${K('KeyF')} চাপো। ড্রাইভার থাকলে ভাড়া লাগে। ${K('KeyG')} চাপলে ছিনতাই — তখন পুলিশ তাড়া করবে!`],
 ['🕳️','খোলা ম্যানহোল!','পানির নিচে খোলা ম্যানহোল লুকানো। লাল পতাকা, ঘূর্ণি পানি আর বুদবুদ দেখলে পাশ কাটাও। বেশি বার পড়লে মিশন ব্যর্থ।'],
 ['🎯','মিশন আর তিন নায়ক',`হলুদ তীর আর আলোর খুঁটি ধরে এগোও। ${IS_TOUCH?'উপরের 👥 বাটনে':K('Tab')+' চেপে'} রাফি, মিতু আর জামাল চাচার মধ্যে বদলাও, ${IS_TOUCH?'🗺️ বাটনে':K('KeyM')+' চেপে'} পুরো ঢাকার ম্যাপ।`],
 ['⭐','তারা, XP আর পোশাক','প্রতি মিশনে ৩ তারা: শেষ করা, একবারও না পড়া, দ্রুত পৌঁছানো। XP-তে লেভেল বাড়ে, কয়েনে নতুন পোশাক কেনো। অগ্রগতি নিজে নিজে সেভ হয়।'],
];
let tutI=0, tutCb=null;
function showTutorial(cb){ tutI=0; tutCb=cb||null; showScr('tutScr',true); drawTut(); setTimeout(()=>$('tutNext').focus(),40); }
function drawTut(){ const L=TUT(), S=L[tutI]; $('tutIc').textContent=S[0]; $('tutT').textContent=S[1]; $('tutP').textContent=S[2];
  $('tutDots').innerHTML=L.map((_,i)=>`<i class="${i===tutI?'on':''}"></i>`).join(''); $('tutNext').textContent=tutI===L.length-1?(tutCb?'খেলা শুরু ▶':'বুঝেছি ✓'):'পরের ›'; $('tutPrev').disabled=tutI===0; }
function tutNext(){ if(tutI<TUT().length-1){ tutI++; drawTut(); } else tutEnd(); }
function tutPrev(){ if(tutI>0){ tutI--; drawTut(); } }
function tutEnd(){ showScr('tutScr',false); SAVE.profile.tut=true; writeSave(); const cb=tutCb; tutCb=null; cb&&cb(); }
$('tutNext').onclick=tutNext; $('tutPrev').onclick=tutPrev; $('tutSkip').onclick=tutEnd;

// ---- settings (every control is live and saved)
const SET_TABS=[
 ['gfx','🖥️ গ্রাফিক্স',[
  {k:'quality',t:'seg',l:'কোয়ালিটি',o:[['auto','অটো'],['1080','1080p'],['2k','2K + শ্যাডো']],d:'অটো: FPS দেখে নিজে রেজোলিউশন আর শ্যাডো ঠিক করে'},
  {k:'scale',t:'range',l:'রেন্ডার স্কেল',min:50,max:100,step:5,u:'%',d:'কমালে দুর্বল ফোনেও স্মুথ চলে'},
  {k:'rainDen',t:'range',l:'বৃষ্টির ঘনত্ব',min:25,max:100,step:25,u:'%'},
  {k:'fps',t:'tog',l:'FPS কাউন্টার দেখাও'},
  {t:'btn',l:'ফুলস্ক্রিন',d:'পুরো স্ক্রিন জুড়ে খেলো (কিবোর্ডে F11-ও চলে)',a:'fs',bl:'চালু করো',fs:1}]],
 ['snd','🔊 সাউন্ড',[
  {k:'muted',t:'tog',l:'সব সাউন্ড বন্ধ (মিউট)'},
  {k:'master',t:'range',l:'মাস্টার ভলিউম',min:0,max:100,step:5,u:'%'},
  {k:'music',t:'range',l:'মিউজিক',min:0,max:100,step:5,u:'%',d:'গেমের নিজস্ব তানপুরা-বাঁশি-তবলা সুর; তাড়া খেলে তাল দ্রুত হয়'},
  {k:'sfx',t:'range',l:'ইফেক্ট',min:0,max:100,step:5,u:'%',d:'হর্ন, ঘুষি, গুলি, বাটন'},
  {k:'amb',t:'range',l:'পরিবেশ',min:0,max:100,step:5,u:'%',d:'বৃষ্টি, ভিড়ের কোলাহল, ইঞ্জিন'},
  {k:'voice',t:'tog',l:'বাংলা ভয়েসে ডায়লগ',d:'ব্রাউজারে বাংলা ভয়েস থাকলে (Edge / Android Chrome)'},
  {k:'voiceVol',t:'range',l:'ভয়েস ভলিউম',min:0,max:100,step:5,u:'%'},
  {k:'radio',t:'tog',l:'রেডিও বর্ষা ৮৮.৬'}]],
 ['ctl','🎮 কন্ট্রোল',[
  {k:'camSens',t:'range',l:'ক্যামেরা ঘোরানোর গতি',min:40,max:200,step:10,u:'%'},
  {k:'joySize',t:'range',l:'জয়স্টিকের সাইজ',min:70,max:140,step:10,u:'%',touch:1},
  {k:'btnAlpha',t:'range',l:'বাটনের স্পষ্টতা',min:40,max:100,step:10,u:'%',touch:1},
  {k:'leftHand',t:'tog',l:'বাঁহাতি লেআউট',d:'বাটন বাঁয়ে, জয়স্টিক ডানে',touch:1},
  {k:'vibrate',t:'tog',l:'আঘাত পেলে ভাইব্রেশন',touch:1},
  {t:'keys',desk:1}]],
 ['play','🎯 গেমপ্লে',[
  {k:'diff',t:'seg',l:'কঠিনতা',o:[['easy','সহজ'],['normal','স্বাভাবিক'],['hard','কঠিন'],['auto','অটো']]},
  {k:'hints',t:'tog',l:'স্মার্ট হিন্ট',d:'আটকে গেলে পরামর্শ, বারবার পড়লে ম্যানহোলের আগাম সতর্কতা'},
  {t:'btn',l:'টিউটোরিয়াল',d:'কন্ট্রোল আর নিয়ম আবার দেখো',a:'tut',bl:'দেখাও'}]],
 ['acc','♿ সহজলভ্যতা',[
  {k:'reduce',t:'tog',l:'কম অ্যানিমেশন',d:'ক্যামেরা ঝাঁকি আর মেনু ট্রানজিশন বন্ধ'},
  {k:'noFlash',t:'tog',l:'বিদ্যুৎ চমকানোর ঝলক বন্ধ',d:'আলোর ঝলকানিতে অস্বস্তি হলে চালু করো'},
  {k:'bigText',t:'tog',l:'বড় লেখা'}]],
 ['data','💾 ডেটা',[
  {t:'btn',l:'প্রোফাইলের নাম',a:'name',bl:'বদলাও'},
  {t:'btn',l:'ব্যাকআপ ডাউনলোড',d:'সেভ ফাইল (.json) নামিয়ে রাখো',a:'export',bl:'ডাউনলোড'},
  {t:'btn',l:'ব্যাকআপ থেকে ফেরত আনো',d:'আগে নামানো সেভ ফাইল বেছে নাও',a:'import',bl:'ফাইল বাছো'},
  {t:'btn',l:'সব অগ্রগতি মুছে ফেলো',d:'লেভেল, কয়েন, অর্জন, রেকর্ড — সব',a:'reset',bl:'মুছে ফেলো',danger:1},
  {t:'info',x:'সেভ শুধু এই ডিভাইসের ব্রাউজারে থাকে (অনলাইন সার্ভার নেই)। অন্য ডিভাইসে নিতে ব্যাকআপ ফাইল ব্যবহার করো।'}]],
];
let setTab='gfx';
function openSettings(tab){ showScr('setScr',true); if(state.started&&state.paused&&AU.ctx) AU.ctx.resume(); renderSettings(tab||setTab); setTimeout(()=>$('setTabs').querySelector('.on')?.focus(),40); }
function closeSettings(){ showScr('setScr',false); if(state.started&&state.paused&&AU.ctx) AU.ctx.suspend(); if(scrOn('home')) RENDER[curPage]?.(); if(scrOn('pauseScreen')) fillPause(); }
$('setClose').onclick=closeSettings;
function rowHTML(r){
  const d=r.k==='diff'?`<small id="diffD">${DIFF_DESC[settings.diff]}${settings.diff==='auto'?' · '+autoLabel():''}</small>`:(r.d?`<small>${r.d}</small>`:'');
  if(r.t==='seg') return `<div class="srow"><label><b>${r.l}</b>${d}</label><div class="seg" role="radiogroup">${r.o.map(([v,n])=>`<button class="btn${settings[r.k]===v?' on':''}" role="radio" aria-checked="${settings[r.k]===v}" data-k="${r.k}" data-v="${v}">${n}</button>`).join('')}</div></div>`;
  if(r.t==='range') return `<div class="srow"><label for="r_${r.k}"><b>${r.l}</b>${d}</label><div class="rng"><input type="range" id="r_${r.k}" data-k="${r.k}" min="${r.min}" max="${r.max}" step="${r.step}" value="${settings[r.k]}"><output>${bn(settings[r.k])}${r.u||''}</output></div></div>`;
  if(r.t==='tog') return `<div class="srow"><label><b>${r.l}</b>${d}</label><button class="btn tog${settings[r.k]?' on':''}" role="switch" aria-checked="${!!settings[r.k]}" aria-label="${r.l}" data-k="${r.k}"><i></i></button></div>`;
  if(r.t==='btn') return `<div class="srow"><label><b>${r.l}</b>${d}</label><button class="btn ghost${r.danger?' dz':''}" data-a="${r.a}">${r.bl}</button></div>`;
  if(r.t==='keys') return `<p class="info" style="margin:12px 0 4px">কী বদলাতে বাটনে ক্লিক করে নতুন কী চাপো (Esc = বাতিল)। একই কী অন্য কাজে থাকলে দুটো অদলবদল হয়ে যাবে।</p>
   <div class="kmap">${KEY_ACT.map(([d,l])=>`<div class="krow"><span>${l}</span><button class="btn kbtn${capAct===d?' cap':''}" data-key="${d}" aria-label="${l}: ${K(d)}">${capAct===d?'কী চাপো…':K(d)}</button></div>`).join('')}</div>
   <div class="srow"><label><b>কী ডিফল্টে ফেরাও</b><small>${keyNote||'মাউস: টানলে ক্যামেরা · ক্লিক = ঘুষি/গুলি · চাকা = অস্ত্র · ↑↓←→ আর E/Enter সবসময় কাজ করে'}</small></label><button class="btn ghost" data-a="keysReset">ফেরাও</button></div>`;
  if(r.t==='info') return `<p class="info">${r.x}</p>`;
  return '';
}
function renderSettings(tab){
  setTab=tab;
  $('setTabs').innerHTML=SET_TABS.map(([id,l])=>`<button class="btn stab${id===tab?' on':''}" role="tab" aria-selected="${id===tab}" data-t="${id}">${l}</button>`).join('');
  $('setTabs').querySelectorAll('.stab').forEach(b=>b.onclick=()=>renderSettings(b.dataset.t));
  const rows=SET_TABS.find(t=>t[0]===tab)[2].filter(r=>!(r.touch&&!IS_TOUCH)&&!(r.desk&&IS_TOUCH)&&!(r.fs&&!FS_OK));
  $('setBody').innerHTML=rows.map(rowHTML).join('');
  $('setBody').querySelectorAll('.seg .btn').forEach(b=>b.onclick=()=>{ setSetting(b.dataset.k,b.dataset.v); renderSettings(setTab); });
  $('setBody').querySelectorAll('.tog').forEach(b=>b.onclick=()=>{ setSetting(b.dataset.k,!settings[b.dataset.k]); b.classList.toggle('on',!!settings[b.dataset.k]); b.setAttribute('aria-checked',!!settings[b.dataset.k]); });
  $('setBody').querySelectorAll('input[type=range]').forEach(inp=>{ const r=rows.find(x=>x.k===inp.dataset.k);
    inp.oninput=()=>{ setSetting(inp.dataset.k,+inp.value); inp.nextElementSibling.textContent=bn(inp.value)+(r.u||''); };
    inp.onchange=()=>{ if(['sfx','master'].includes(inp.dataset.k)) AU.tone(660,0,.08,'triangle',.06); if(inp.dataset.k==='voiceVol') say('ভয়েস ভলিউম',{prio:2,pitch:1}); }; });
  $('setBody').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>dataAction(b.dataset.a));
  $('setBody').querySelectorAll('.kbtn').forEach(b=>b.onclick=()=>{ capAct=capAct===b.dataset.key?null:b.dataset.key; keyNote=''; renderSettings('ctl'); $('setBody').querySelector('.kbtn.cap')?.focus(); });
  const fb=$('setBody').querySelector('[data-a=fs]'); if(fb) fb.textContent=isFS()?'বন্ধ করো':'চালু করো';
}
function setSetting(k,v){ settings[k]=v; saveSettings(); applySetting(k); }
function applySetting(k){
  if(k==='quality'||k==='scale'){ if(k==='quality'){ autoQ.scale=1; autoQ.shadows=!IS_TOUCH; } applyQuality(); }
  if(['muted','master','music','sfx','amb'].includes(k)) applyVolumes();
  if(k==='voice'||k==='muted'){ if(settings.voice===false||settings.muted) try{speechSynthesis.cancel();}catch(e){} else if(k==='voice') say('ভয়েস চালু হলো',{prio:2,pitch:1}); }
  if(['joySize','btnAlpha','leftHand'].includes(k)) applyTouchLayout();
  if(k==='reduce'||k==='bigText') applyBody();
  if(k==='fps') $('fps').style.display=settings.fps?'block':'none';
  if(k==='radio') $('radio').style.display=settings.radio?'':'none';
}
function applyBody(){ document.body.classList.toggle('rm',!!settings.reduce); document.body.classList.toggle('bigT',!!settings.bigText); }
function applyTouchLayout(){ const r=document.documentElement.style; r.setProperty('--joy',settings.joySize/100); r.setProperty('--btnA',settings.btnAlpha/100); document.body.classList.toggle('lefty',!!settings.leftHand); }
// backup file: inside claude.ai the page must ask through the platform's downloads prompt; the offline file uses a normal download
async function exportSave(){
  persist(); const data=JSON.stringify(SAVE,null,1), fn='borsha-city-save.json';
  if(window.AndroidBridge&&AndroidBridge.saveText){ let r=''; try{ r=String(AndroidBridge.saveText(fn,data)); }catch(e){}   // Android app build
    if(r.startsWith('saved:')) popCard('💾','ব্যাকআপ তৈরি','ফোনের '+r.slice(6)+' ফোল্ডারে সেভ হয়েছে','green');
    else if(r==='shared') popCard('💾','ব্যাকআপ','শেয়ার মেনু থেকে Drive বা ফাইলে রেখে দাও','green'); else popCard('⚠️','ব্যাকআপ হলো না','আবার চেষ্টা করো','blue');
    return; }
  let dl=null; try{ if(window.claude&&typeof claude.use==='function') dl=await Promise.race([claude.use('downloads'),new Promise(r=>setTimeout(()=>r(null),4000))]); }catch(e){ dl=null; }
  if(dl){ try{ await dl.save({filename:fn,data}); popCard('💾','ব্যাকআপ তৈরি',fn+' — যত্ন করে রেখে দাও','green'); }
    catch(e){ const c=e&&e.code; if(c==='declined') return; popCard('⚠️','ব্যাকআপ নামানো গেলো না',c==='rate_limited'?'একটু পরে আবার চেষ্টা করো':'এখানে ফাইল সেভ করা যাচ্ছে না — ডাউনলোড করা গেম-ফাইল থেকে চেষ্টা করো','blue'); }
    return; }
  try{ const u=URL.createObjectURL(new Blob([data],{type:'application/json'})); const l=document.createElement('a'); l.href=u; l.download=fn; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000);
    popCard('💾','ব্যাকআপ তৈরি',fn+' — ডাউনলোড ফোল্ডারে দেখো','green'); }
  catch(e){ popCard('⚠️','ডাউনলোড হলো না','এই ব্রাউজারে ফাইল নামানো আটকানো','blue'); }
}
async function dataAction(a){
  if(a==='tut') showTutorial(null);
  if(a==='keysReset'){ for(const [d] of KEY_ACT) KB[d]=d; capAct=null; keyNote='সব কী আগের মতো করা হলো'; saveKeys(); renderSettings('ctl'); }
  if(a==='fs'){ await toggleFS(); setTimeout(()=>renderSettings(setTab),250); }
  if(a==='name'){ const v=await askBox('তোমার নাম','প্রোফাইল আর রেকর্ডে দেখাবে (সর্বোচ্চ ১৬ অক্ষর)','সেভ করো',SAVE.profile.name); if(v!==null){ SAVE.profile.name=cleanName(v); writeSave(); renderSettings(setTab); } }
  if(a==='export') await exportSave();
  if(a==='import') $('impFile').click();
  if(a==='reset'){ if(await askBox('সব মুছে ফেলবে?','লেভেল, কয়েন, অর্জন, পোশাক, রেকর্ড আর চলমান গল্প — সব চিরতরে মুছে যাবে। সেটিংস থাকবে।','হ্যাঁ, মুছে ফেলো',undefined,true)){ try{localStorage.removeItem(SAVE_KEY);}catch(e){} location.reload(); } }
}
$('impFile').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(!f) return;
  if(f.size>300000){ popCard('⚠️','ফাইল অনেক বড়','এটা বর্ষা সিটির সেভ ফাইল না','blue'); return; }
  try{ const s=JSON.parse(await f.text()); if(!s||typeof s!=='object'||!s.profile) throw 0; const c=cleanSave(s);
    if(await askBox('ব্যাকআপ ফেরত আনবে?',`"${c.profile.name}" — লেভেল ${bn(levelOf(c.profile.xp))}, ${bn(Object.keys(c.ach).length)}টা অর্জন। এখনকার অগ্রগতির জায়গায় এটা বসবে।`,'হ্যাঁ, ফেরত আনো')){ SAVE=c; state.runLive=false; writeSave(); location.reload(); } }
  catch(err){ popCard('⚠️','ফাইলটা পড়া গেলো না','সঠিক সেভ ফাইল (.json) বাছো','blue'); } };

// ---- home menu pages
let curPage='dash', heroSel=0;
const RENDER={dash:renderDash,missions:renderMissions,heroes:renderHeroes,ach:renderAch,records:renderRecords};
function showHome(page){ document.body.classList.add('inmenu'); showScr('loading',false); showScr('home',true); goPage(page||'dash'); }
function goPage(p){ curPage=p; document.querySelectorAll('#home .nb[data-pg]').forEach(b=>b.classList.toggle('on',b.dataset.pg===p)); document.querySelectorAll('.pg').forEach(s=>s.classList.toggle('on',s.id==='pg-'+p)); RENDER[p](); renderNavFoot(); }
document.querySelectorAll('#home .nb[data-pg]').forEach(b=>b.onclick=()=>goPage(b.dataset.pg));
document.querySelector('#home .nb[data-act=settings]').onclick=()=>openSettings();
function renderNavFoot(){ const xp=SAVE.profile.xp, L=levelOf(xp); $('navFoot').innerHTML=`<b>${esc(SAVE.profile.name)}</b> · লেভেল ${bn(L)}<div class="xpb"><i style="width:${Math.round((xp-lvlXP(L))/(lvlXP(L+1)-lvlXP(L))*100)}%"></i></div><div style="margin-top:6px">🪙 ${bn(SAVE.profile.coins)}</div>`; }
const ringSVG=(p,label,cls='')=>`<div class="ring ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" class="rb"/><circle cx="50" cy="50" r="42" class="rf" style="stroke-dasharray:${(p/100*263.9).toFixed(1)} 264"/></svg><b>${label}</b></div>`;
const starsHTML=n=>`<span class="stars" aria-label="${n} তারা">${'★'.repeat(n)}<span class="e">${'★'.repeat(3-n)}</span></span>`;
function runInfo(){ if(state.runLive) return {has:!state.won||state.freeRoam,step:state.step,free:state.freeRoam||state.won}; const r=SAVE.run; return r?{has:true,step:r.step,free:r.free||r.won}:{has:false,step:0,free:false}; }
function renderDash(){
  const P=SAVE.profile, L=levelOf(P.xp), R=runInfo(), pct=R.free?100:Math.round(Math.min(R.step,MISSIONS.length)/MISSIONS.length*100);
  const chap=R.free?'ফ্রি রোম 🌤️':(R.step===0?'প্রস্তুতি — সিএনজিতে ওঠো':`মিশন ${bn(R.step)}: ${MISSIONS[R.step]?.title||''}`);
  const [dc,dn,DQ,dd]=dailyProg(), until=(()=>{ const n=new Date(), m=new Date(n); m.setHours(24,0,0,0); const s=(m-n)/1000; return `${bn(Math.floor(s/3600))} ঘ ${bn(Math.floor(s/60)%60)} মি বাকি`; })();
  const recent=Object.entries(SAVE.ach).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([id])=>ACH.find(a=>a.id===id)).filter(Boolean);
  const totStars=SAVE.stars.reduce((a,b)=>a+b,0);
  $('pg-dash').innerHTML=`
  <div class="ph"><div><small>স্বাগতম ফিরে,</small><h2>${esc(P.name)} <em class="tag">${levelTitle(L)}</em></h2></div><div class="chips"><span class="chip">🪙 ${bn(P.coins)}</span><span class="chip">⭐ লেভেল ${bn(L)}</span></div></div>
  <div class="dgrid">
   <article class="card hero-card wide rainfx">
    <div><span class="tag b">${R.has?'চলমান গল্প':'নতুন গল্প'}</span><h1 class="title" style="margin-top:10px">বর্ষা সিটি<span>ঢাকা</span></h1>
     <p class="hc-p">${R.has?`এখন: <b>${esc(chap)}</b>`:'ঢাকার সবচেয়ে বড় বৃষ্টির দিন। পার্সেল পৌঁছাও, জ্যাম আর সার্জেন্ট এড়াও — আর পানির নিচে লুকানো খোলা ম্যানহোলে না পড়ে বাসায় ফেরো।'}</p>
     <div class="btnrow"><button class="btn cta" id="contBtn">▶ ${R.has?'চালিয়ে যাও':'খেলা শুরু করো'}</button>${R.has?'<button class="btn ghost" id="newBtn">নতুন খেলা</button>':''}<button class="btn ghost" id="misBtn">🎯 মিশন বাছো</button></div></div>
    <div class="hc-r">${ringSVG(pct,bn(pct)+'%')}<small>গল্পের অগ্রগতি</small><div class="kv"><span>⭐ ${bn(totStars)}/${bn(12)}</span><span>⏱️ ${fmtDur(P.play)}</span></div></div>
   </article>
   <article class="card daily"><h4>📅 আজকের চ্যালেঞ্জ</h4><p>${DQ.t}</p><div class="pbar"><i style="width:${Math.round(dc/dn*100)}%"></i></div>
    <small><span>${dd.done?'✅ শেষ! +২০০ XP · +১২০ 🪙':(DQ.f?DQ.f(dc):`${bn(Math.floor(dc))} / ${bn(dn)}`)}</span><span>${until}</span></small></article>
   <article class="card prof">
    <div class="ava">${ringSVG(Math.round((P.xp-lvlXP(L))/(lvlXP(L+1)-lvlXP(L))*100),'','sm')}<div class="face">${esc([...P.name][0]||'খ')}</div></div>
    <div style="min-width:0;flex:1"><div class="pn">${esc(P.name)}<button class="btn" id="nameBtn" aria-label="নাম বদলাও">✎</button></div>
     <small>লেভেল ${bn(L)} · ${bn(Math.floor(P.xp-lvlXP(L)))} / ${bn(lvlXP(L+1)-lvlXP(L))} XP</small>
     <div class="stats4"><span><b>${bn(SAVE.stats.missions)}</b>মিশন</span><span><b>${bn(Object.keys(SAVE.ach).length)}/${bn(ACH.length)}</b>অর্জন</span><span><b>${bn(SAVE.stats.snatchCaught)}</b>ছিনতাইকারী ধরা</span><span><b>${bn((SAVE.stats.dist/1000).toFixed(1))}</b>কিমি চালানো</span></div></div>
   </article>
   <article class="card wide"><h4>🏅 সাম্প্রতিক অর্জন</h4>${recent.length?`<div class="badges">${recent.map(a=>`<span class="bdg"><span>${a.ic}</span>${esc(a.name)}</span>`).join('')}</div>`:'<p class="empty">এখনো কিছু নেই — প্রথম মিশনেই কয়েকটা পেয়ে যাবে!</p>'}</article>
  </div>`;
  $('contBtn').onclick=continueGame; if($('newBtn')) $('newBtn').onclick=()=>newGame(0); $('misBtn').onclick=()=>goPage('missions');
  $('nameBtn').onclick=async()=>{ const v=await askBox('তোমার নাম','প্রোফাইল আর রেকর্ডে দেখাবে (সর্বোচ্চ ১৬ অক্ষর)','সেভ করো',SAVE.profile.name); if(v!==null){ SAVE.profile.name=cleanName(v); writeSave(); renderDash(); renderNavFoot(); } };
  setTimeout(()=>$('contBtn')?.focus({preventScroll:true}),30);
}
const missionOpen=i=>i<=1||SAVE.stars[i-1]>0;
function renderMissions(){
  const R=runInfo(), won=SAVE.stats.wins>0;
  $('pg-missions').innerHTML=`<div class="ph"><div><small>গল্প মোড · রাফির বৃষ্টির দিন</small><h2>মিশন বাছো</h2></div><div class="chips"><span class="chip">⭐ ${bn(SAVE.stars.reduce((a,b)=>a+b,0))} / ${bn(12)}</span><span class="chip">⚙️ ${DF().n}</span></div></div>
  <div class="mgrid">${[1,2,3,4].map(i=>{ const op=missionOpen(i), cur=R.has&&!R.free&&(R.step===i||(i===1&&R.step===0));
    return `<button class="btn mcard${op?'':' lock'}${cur?' cur':''}" data-m="${i}" ${op?'':'aria-disabled="true"'}><span class="num">${op?bn(i):'🔒'}</span><b>${MISSIONS[i].title}</b><small>${MDESC[i]}</small>${starsHTML(SAVE.stars[i])}<small>⭐ শেষ করো · না পড়ে · ${bn(PAR[i])} সেকেন্ডে</small><span class="go">${op?(cur?'▶ চলমান — চালিয়ে যাও':'▶ শুরু করো'):`🔒 মিশন ${bn(i-1)} শেষ করো`}</span></button>`; }).join('')}</div>
  <div class="sec">সাইড গিগ ও ফ্রি রোম</div>
  <div class="mgrid">
   <button class="btn mcard" data-g="1"><span class="num" style="background:#d81b60;color:#fff">ম</span><b>মিতুর ফুড ডেলিভারি</b><small>রেস্টুরেন্ট থেকে খাবার তোলো, সময়ের মধ্যে পৌঁছালে টিপস</small><small>মোট ডেলিভারি: ${bn(SAVE.stats.deliveries)}</small><span class="go">▶ মিতু হয়ে খেলো</span></button>
   <button class="btn mcard" data-g="2"><span class="num" style="background:#2e7d32;color:#fff">জা</span><b>জামাল চাচার স্ট্যান্ড</b><small>লেগুনা স্ট্যান্ড থেকে মাস্তান হটাও — ওরা পালা করে আক্রমণ করে</small><small>শান্ত করা স্ট্যান্ড: ${bn(SAVE.stats.thugs)}</small><span class="go">▶ চাচা হয়ে খেলো</span></button>
   <button class="btn mcard boss" data-b="1"><span class="num" style="background:#b71c1c;color:#fff">👑</span><b>ঢাকনা সিন্ডিকেট — বস ফাইট</b><small>এলিট কমান্ডো, হেভি-আর্মার মিনিগান আর সিন্ডিকেট বস — তিন রাউন্ডে তিনজন</small><small>${SAVE.boss.wins?`জয় ${bn(SAVE.boss.wins)} বার · সেরা সময় ${fmtClock(SAVE.boss.best)}`:'এখনো কেউ জেতেনি'}</small><span class="go">▶ লড়াই শুরু</span></button>
   <button class="btn mcard${won?'':' lock'}" data-f="1"><span class="num" style="background:#5ec8ff">🌤</span><b>ফ্রি রোম</b><small>বৃষ্টি থেমে গেছে — পুরো বৃহত্তর ঢাকা ঘুরে দেখো</small><span class="go">${won?'▶ শুরু করো':'🔒 গল্প শেষ করলে খুলবে'}</span></button>
  </div>`;
  $('pg-missions').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.m; if(!missionOpen(i)){ AU.tone(200,0,.12,'square',.04); return; }
    if(R.has&&!R.free&&(R.step===i||(i===1&&R.step<=1))) continueGame(); else newGame(i===1?0:i); });
  $('pg-missions').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>playGig(+b.dataset.g));
  $('pg-missions').querySelector('[data-b]').onclick=()=>playBoss();
  $('pg-missions').querySelector('[data-f]').onclick=()=>{ if(won) newGame(0,true); else AU.tone(200,0,.12,'square',.04); };
}
function renderHeroes(){
  const H=HEROES[heroSel], O=SAVE.outfits[H.id], L=levelOf(SAVE.profile.xp);
  $('pg-heroes').innerHTML=`<div class="hwrap"><div class="ph"><div><small>নায়ক ও পোশাক</small><h2>${H.name}</h2></div><div class="chips"><span class="chip">🪙 ${bn(SAVE.profile.coins)}</span><span class="chip">লেভেল ${bn(L)}</span></div></div>
   <div class="htabs">${HEROES.map((h,i)=>`<button class="btn htab${i===heroSel?' on':''}" data-i="${i}"><b>${h.name}</b><small>${h.role.split('·')[0]}</small></button>`).join('')}</div>
   <div class="card"><small style="color:var(--mu)">${H.role}</small><p style="margin:6px 0 0">${H.skill}</p>
    <div class="sbars">${[['গতি',H.run/9.3],['শক্তি',H.dmg/68],['সহনশক্তি',H.maxHp/160],['ড্রাইভিং',(H.drive-.9)/.25]].map(([n,v])=>`<div><span>${n}</span><i><b style="width:${Math.round(clamp(v,.12,1)*100)}%"></b></i></div>`).join('')}</div>
    <h4 style="margin-top:14px">পোশাক</h4>
    <div class="ogrid">${OUTFITS[H.id].map((o,i)=>{ const own=O.own.includes(i), cur=O.cur===i, lock=!!o.lvl&&L<o.lvl&&!own;
      return `<button class="btn ocard${cur?' cur':''}${lock?' lock':''}" data-o="${i}"><span class="sw">${outfitCols(H,o).map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</span><b>${o.name}</b><small>${cur?'✓ পরা আছে':own?'পরো':lock?`🔒 লেভেল ${bn(o.lvl)}`:o.cost?`🪙 ${bn(o.cost)}`:'ফ্রি'}</small></button>`; }).join('')}</div>
    <p class="msg" id="hMsg"></p></div></div>`;
  $('pg-heroes').querySelectorAll('.htab').forEach(b=>b.onclick=()=>{ heroSel=+b.dataset.i; renderHeroes(); });
  $('pg-heroes').querySelectorAll('.ocard').forEach(b=>b.onclick=()=>pickOutfit(H,+b.dataset.o));
}
async function pickOutfit(H,i){
  const O=SAVE.outfits[H.id], o=OUTFITS[H.id][i], L=levelOf(SAVE.profile.xp), msg=t=>{ const e=$('hMsg'); if(e) e.textContent=t; };
  if(O.cur===i) return;
  if(O.own.includes(i)){ O.cur=i; applyOutfit(H); writeSave(); renderHeroes(); return; }
  if(o.lvl&&L<o.lvl){ msg(`🔒 লেভেল ${bn(o.lvl)}-এ খুলবে — মিশন, ডেলিভারি আর অর্জন থেকে XP পাও`); AU.tone(200,0,.12,'square',.04); return; }
  const cost=o.cost||0;
  if(SAVE.profile.coins<cost){ msg(`🪙 আরও ${bn(cost-SAVE.profile.coins)} কয়েন লাগবে — দৈনিক চ্যালেঞ্জ আর মিশনে কয়েন পাও`); AU.tone(200,0,.12,'square',.04); return; }
  if(cost&&!await askBox(`"${o.name}" কিনবে?`,`${H.name}-এর জন্য — দাম ${bn(cost)} কয়েন। (তোমার আছে ${bn(SAVE.profile.coins)})`,'কিনে ফেলো')) return;
  SAVE.profile.coins-=cost; O.own.push(i); O.cur=i; applyOutfit(H); if(cost) unlock('style'); writeSave(); renderHeroes(); renderNavFoot();
  AU.tone(660,990,.15,'triangle',.06);
}
function renderAch(){
  const n=Object.keys(SAVE.ach).length;
  $('pg-ach').innerHTML=`<div class="ph"><div><small>${bn(n)} / ${bn(ACH.length)} আনলক</small><h2>অর্জন</h2></div><div class="chips"><span class="chip">🏅 ${bn(Math.round(n/ACH.length*100))}%</span></div></div>
  <div class="agrid">${ACH.map(a=>{ const got=SAVE.ach[a.id], pr=a.prog?a.prog():null;
    return `<div class="ach${got?'':' lk'}"><span class="ic">${a.ic}</span><div><b>${a.name}</b><small>${a.desc}</small><em>${got?'✓ '+new Date(got).toLocaleDateString('bn-BD'):'+'+bn(a.xp)+' XP'}</em>${!got&&pr?`<div class="pbar"><i style="width:${Math.round(Math.min(1,pr[0]/pr[1])*100)}%"></i></div>`:''}</div></div>`; }).join('')}</div>`;
}
function renderRecords(){
  const S=SAVE.stats, rec=SAVE.records;
  $('pg-records').innerHTML=`<div class="ph"><div><small>শুধু এই ডিভাইসের রেকর্ড — অনলাইন লিডারবোর্ড নেই</small><h2>রেকর্ড ও পরিসংখ্যান</h2></div></div>
  <div class="card" style="max-width:820px;overflow:auto"><h4>🏁 সেরা গল্প-রান</h4>${rec.length?`<table class="rtab"><tr><th>#</th><th>নাম</th><th>স্কোর</th><th>সময়</th><th>তারা</th><th>পড়া</th><th>কঠিনতা</th></tr>${rec.map((r,i)=>`<tr class="${i?'':'top'}"><td>${bn(i+1)}</td><td>${esc(r.name)}</td><td>${bn(r.score)}</td><td>${fmtClock(r.time)}</td><td>★${bn(r.stars)}</td><td>${bn(r.falls)}</td><td>${DIFFS[r.diff].n}</td></tr>`).join('')}</table>`:'<p class="empty">এখনো কোনো রান শেষ হয়নি — গল্প শেষ করলে এখানে স্কোর উঠবে।</p>'}</div>
  <div class="sec">সারাজীবনের পরিসংখ্যান</div>
  <div class="tiles">${[['⏱️ খেলার সময়',fmtDur(SAVE.profile.play)],['👑 বস ফাইট সেরা সময়',SAVE.boss.best?fmtClock(SAVE.boss.best):'—'],['🛣️ গাড়ি চালানো',bn((S.dist/1000).toFixed(1))+' কিমি'],['🚶 হাঁটা',bn((S.walk/1000).toFixed(1))+' কিমি'],['🎯 মিশন শেষ',bn(S.missions)],['🏆 গল্প জেতা',bn(S.wins)],['🦸 ছিনতাইকারী ধরা',bn(S.snatchCaught)],['🛵 ডেলিভারি',bn(S.deliveries)],['👊 স্ট্যান্ড শান্ত',bn(S.thugs)],['🕳️ ম্যানহোলে পড়া',bn(S.falls)],['😵 অজ্ঞান',bn(S.ko)],['💨 পালানো',bn(S.escapes)],['🚁 ফ্লাইট',bn(S.flights)],['🧭 এলাকা ঘোরা',bn(SAVE.zones.length)],['📅 দৈনিক চ্যালেঞ্জ',bn(S.dailies)]].map(([k,v])=>`<div class="tile"><small>${k}</small><b>${v}</b></div>`).join('')}</div>`;
}

// ---- pause
function fillPause(){
  const OB=objective(), [dc,dn,DQ,dd]=dailyProg();
  $('pSum').innerHTML=`<div><small>নায়ক</small><b>${hero().name}</b></div><div><small>টাকা</small><b>৳${bn(Math.round(state.money))}</b></div>
   <div class="w"><small>এখনকার কাজ</small><b>${OB?esc(OB.text):'—'}</b></div>
   <div><small>কঠিনতা</small><b>${DF().n}</b></div><div><small>মিশনে পড়া</small><b>${bn(state.missionFalls||0)}${DF().falls<20?' / '+bn(DF().falls):''}</b></div>
   <div class="w"><small>📅 ${DQ.t}</small><b>${dd.done?'✅ শেষ':(DQ.f?DQ.f(dc):bn(Math.floor(dc))+' / '+bn(dn))}</b></div>`;
  const story=hero().id==='rafi'&&!state.freeRoam&&state.step<MISSIONS.length;
  $('pRestart').textContent=story?'↺ মিশন আবার শুরু':hero().id==='rafi'?'↺ নতুন খেলা':'↺ এই কাজ আবার শুরু';
}
function togglePause(force){
  if(state.won||!state.started) return;
  const on=force!==undefined?!!force:!state.paused; state.paused=on; showScr('pauseScreen',on); needRender=true;
  if(on){ fillPause(); $('pSaved').textContent=persist()?'✓ অগ্রগতি সেভ হয়েছে':''; setTimeout(()=>$('resumeBtn').focus(),40); } else last=performance.now();
  if(AU.ctx){ on?AU.ctx.suspend():AU.ctx.resume(); } try{ on?speechSynthesis.pause():speechSynthesis.resume(); }catch(e){}
}
$('pauseBtn').onclick=()=>togglePause(true);
$('heroBtn').onclick=()=>openHeroPanel(); $('heroClose').onclick=()=>closeHeroPanel(); $('mapBtn').onclick=()=>toggleMap(); $('mapClose').onclick=()=>toggleMap(false);
$('resumeBtn').onclick=()=>togglePause(false);
$('pSet').onclick=()=>openSettings();
$('pMap').onclick=()=>{ showScr('pauseScreen',false); if(AU.ctx) AU.ctx.resume(); toggleMap(true); };
$('pMenu').onclick=()=>toMenu();
$('pRestart').onclick=async()=>{
  const id=hero().id, story=id==='rafi'&&!state.freeRoam&&state.step<MISSIONS.length;
  if(story){ if(!await askBox('মিশন আবার শুরু করবে?',`"${MISSIONS[state.step].title||MISSIONS[state.step].text}" একদম শুরু থেকে হবে।`,'হ্যাঁ')) return; beginStory(state.step); enterGame(); return; }
  if(id==='rafi'){ if(!await askBox('নতুন খেলা শুরু করবে?','গল্প আবার প্রথম থেকে শুরু হবে। XP আর অর্জন থাকবে।','হ্যাঁ')) return; beginStory(0); enterGame(); return; }
  const j=jobs[id]; (j.thugs||[]).forEach(p=>{ if(p.state==='thug') p.state='hidden'; }); j.phase=null; jobEnsure(); togglePause(false);
};

// ---- performance: FPS meter, automatic quality, render-on-demand when paused
const PERF={acc:0,n:0,fps:60,low:0,high:0};
function perfTick(raw){ PERF.acc+=raw; PERF.n++; if(PERF.acc<.5) return; PERF.fps=PERF.n/PERF.acc; PERF.acc=0; PERF.n=0;
  if(settings.fps) $('fps').textContent=Math.round(PERF.fps)+' FPS';
  if(settings.quality!=='auto'||!state.started||state.paused) return;
  if(PERF.fps<34){ PERF.low++; PERF.high=0; } else if(PERF.fps>55){ PERF.high++; PERF.low=0; } else { PERF.low=0; PERF.high=0; }
  if(PERF.low>=6){ PERF.low=0; if(autoQ.shadows){ autoQ.shadows=false; applyQuality(); } else if(autoQ.scale>.55){ autoQ.scale=Math.max(.55,autoQ.scale-.1); applyQuality(); } }
  if(PERF.high>=16&&autoQ.scale<1){ PERF.high=0; autoQ.scale=Math.min(1,autoQ.scale+.05); applyQuality(); } }
let menuA=0, menuT=0, menuSkip=0;
function menuTick(dt){
  if((menuSkip^=1)||scrOn('setScr')||scrOn('dlg')||scrOn('tutScr')) return;
  const d=Math.min(.1,dt*2); menuT+=d;
  for(const v of vehicles) if(v.ai) updateAI(v,d);
  manageTraffic(d); updatePeds(d,menuT); recyclePeds(d); tickInfra(d); for(const v of vehicles) bodyMotion(v,d); syncPeds(); syncPlayer();
  updateRain(d); updateSky(d); cullChunks(d); fxTick(d);
  if(curPage==='heroes'&&scrOn('home')){
    const H=HEROES[heroSel], isCur=heroSel===heroIdx, st=isCur?{x:player.x,z:player.z}:H.st;
    const v=isCur?player.inVeh:H.st.inVeh, roadX=H.veh.x, face=v?v.h+Math.PI/2:Math.atan2(roadX-st.x,0)||0;
    if(!v){ if(isCur) player.h=face; else H.st.h=face; }
    menuA+=d*.35; const a=face+Math.sin(menuA)*.55, R=v?7:3.9, k=innerWidth>innerHeight*1.1?(v?2.4:1.35):0;
    camera.position.set(st.x+Math.sin(a)*R,(v?2.6:1.75)+water.level,st.z+Math.cos(a)*R); camera.lookAt(st.x-k*Math.cos(a),v?1:1.05,st.z+k*Math.sin(a));
  } else {
    menuA+=d*.04; const t=pedTarget();
    camera.position.set(t.x+Math.sin(menuA)*85,78,t.z+Math.cos(menuA)*85); camera.lookAt(t.x-Math.sin(menuA)*30,0,t.z-Math.cos(menuA)*30);
  }
  renderer.render(scene,camera);
}

// ---- reliability: errors, context loss, mobile gestures
let errShown=false;
function showError(msg){ if(errShown) return; const m=String(msg||''); if(/ResizeObserver|Script error/i.test(m)) return; errShown=true; $('errMsg').textContent=m.slice(0,220); showScr('errBox',true); try{persist();}catch(e){} }
$('errGo').onclick=()=>showScr('errBox',false);
addEventListener('error',e=>showError(e.message||e.error));
addEventListener('unhandledrejection',e=>showError(e.reason?.message||e.reason));
renderer.domElement.addEventListener('webglcontextlost',e=>{ e.preventDefault(); showError('গ্রাফিক্স কন্টেক্সট হারিয়ে গেছে — ফোনের মেমরি কম হতে পারে। রেন্ডার স্কেল কমিয়ে আবার চেষ্টা করো।'); });
document.addEventListener('gesturestart',e=>e.preventDefault()); document.addEventListener('dblclick',e=>e.preventDefault());
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ if(state.started&&!state.paused&&!state.won&&!scrOn('endScreen')) togglePause(true); persist(); } });
addEventListener('pagehide',()=>persist());
document.addEventListener('click',e=>{ if(e.target.closest('.scr .btn,.nb')&&AU.ctx) AU.tone(1250,0,.03,'triangle',.022); },true);
function firstGesture(){ AU.init(); if(AU.ctx&&AU.ctx.state==='suspended'&&!(state.started&&state.paused)) AU.ctx.resume(); applyVolumes(); MUS.start(); if(!state.started) MUS.set('menu'); initVoice(); }
addEventListener('pointerdown',firstGesture,{once:true,capture:true}); addEventListener('keydown',firstGesture,{once:true,capture:true});
// ---- key remapping: each action keeps one primary key; binding a used key swaps the two. Esc always pauses.
const KEY_ACT=[['KeyW','সামনে / এক্সেলারেটর'],['KeyS','পেছনে / রিভার্স'],['KeyA','বাঁয়ে'],['KeyD','ডানে'],['ShiftLeft','দৌড়'],['Space','ব্রেক / উপরে ওড়ো'],['KeyC','নিচে নামো (উড়োজাহাজ)'],
 ['KeyF','গাড়িতে ওঠো / নামো'],['KeyJ','ঘুষি / গুলি'],['KeyG','ছিনতাই'],['KeyQ','অস্ত্র বদলাও'],['KeyH','হর্ন'],['KeyM','ম্যাপ'],['Tab','নায়ক বদলাও'],['KeyP','বিরতি']];
const KEY_RESERVED=new Set(['Escape','MetaLeft','MetaRight','OSLeft','OSRight','F5','F11','F12','ContextMenu']);
const KB={}; let KX={}, capAct=null, keyNote='';
const keyLabel=c=>!c?'—':c.startsWith('Key')?c.slice(3):c.startsWith('Digit')?c.slice(5):c.startsWith('Numpad')?'Num '+c.slice(6):({ShiftLeft:'Shift',ShiftRight:'R-Shift',ControlLeft:'Ctrl',ControlRight:'R-Ctrl',AltLeft:'Alt',AltRight:'R-Alt',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backquote:'`',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\',CapsLock:'Caps'})[c]||c;
const K=d=>keyLabel(KB[d]||d);
function buildKX(){ KX={}; for(const [d] of KEY_ACT) KX[KB[d]]=d; for(const [d] of KEY_ACT) if(!(d in KX)) KX[d]='_none'; }
function kx(c){ return c in KX?KX[c]:c; }
function saveKeys(){ const o={}; for(const [d] of KEY_ACT) if(KB[d]!==d) o[d]=KB[d]; try{ localStorage.setItem('borsha_keys',JSON.stringify(o)); }catch(e){} buildKX(); }
(function loadKeys(){ let s=null; try{ s=JSON.parse(localStorage.getItem('borsha_keys')||'null'); }catch(e){}
  for(const [d] of KEY_ACT){ const v=s&&typeof s==='object'?s[d]:null; KB[d]=(typeof v==='string'&&/^[A-Za-z0-9]{2,24}$/.test(v)&&!KEY_RESERVED.has(v))?v:d; }
  if(new Set(Object.values(KB)).size!==KEY_ACT.length) for(const [d] of KEY_ACT) KB[d]=d;   // corrupted / duplicate → defaults
  buildKX(); })();
function keyCapture(e){
  if(!capAct||!scrOn('setScr')){ capAct=null; return false; }
  e.preventDefault(); e.stopPropagation();
  if(e.code==='Escape'){ capAct=null; keyNote=''; renderSettings('ctl'); return true; }
  if(KEY_RESERVED.has(e.code)||!e.code){ keyNote=`"${keyLabel(e.code)}" কী বাঁধা যায় না — অন্য কী চাপো`; renderSettings('ctl'); return true; }
  const act=capAct, old=KB[act], other=KEY_ACT.find(([d])=>d!==act&&KB[d]===e.code);
  if(other){ KB[other[0]]=old; keyNote=`"${keyLabel(e.code)}" আগে "${other[1]}"-এ ছিল — অদলবদল হলো, ওটা এখন "${keyLabel(old)}"`; } else keyNote=`"${KEY_ACT.find(x=>x[0]===act)[1]}" এখন "${keyLabel(e.code)}"`;
  KB[act]=e.code; capAct=null; saveKeys(); renderSettings('ctl'); setTimeout(()=>$('setBody').querySelector(`[data-key="${act}"]`)?.focus(),20); AU.tone(880,0,.06,'triangle',.05);
  for(const k in keys) keys[k]=false;
  return true;
}
// ---- fullscreen
const FS_OK=!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
async function toggleFS(){ try{ if(isFS()) await (document.exitFullscreen||document.webkitExitFullscreen).call(document); else { const el=document.documentElement; await (el.requestFullscreen||el.webkitRequestFullscreen).call(el); } }
  catch(e){ popCard('⚠️','ফুলস্ক্রিন হলো না','এই ব্রাউজার বা এমবেড করা পেজে ফুলস্ক্রিন আটকানো — নতুন ট্যাবে খুলে চেষ্টা করো','blue'); } }
document.addEventListener('fullscreenchange',()=>{ if(scrOn('setScr')&&setTab==='gfx') renderSettings('gfx'); });
function menuKeys(e){
  if(scrOn('errBox')) return true;
  if(scrOn('dlg')){ if(e.code==='Escape') dlgRes&&dlgRes(false); else if(e.code==='Enter'&&document.activeElement===$('dlgIn')) dlgRes&&dlgRes(true); return true; }
  if(scrOn('tutScr')){ if(e.code==='Escape') tutEnd(); else if(e.code==='ArrowRight') tutNext(); else if(e.code==='ArrowLeft') tutPrev(); return true; }
  if(scrOn('setScr')){ if(e.code==='Escape') closeSettings(); return true; }
  if(scrOn('endScreen')||scrOn('loading')) return true;
  if(scrOn('home')){ if(e.code==='Escape'&&curPage!=='dash') goPage('dash'); return true; }
  return false;
}
