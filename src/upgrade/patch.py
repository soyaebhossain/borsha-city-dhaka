import re,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
J=lambda *a: os.path.join(ROOT,*a)
P=J('game','index.html')
s=open(J('src','base','index_v7.html')).read()
css=open(J('src','upgrade','ui.css')).read()
html=open(J('src','upgrade','ui.html')).read()
meta=open(J('src','upgrade','meta.js')).read()
n_ok=0
def rep(old,new,count=1):
    global s,n_ok
    c=s.count(old)
    if c!=count:
        print('FAIL count',c,'for:',old[:120]); sys.exit(1)
    s=s.replace(old,new); n_ok+=1

# ---------- CSS / HTML
rep('<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Baloo+Da+2:wght@700;800&display=swap" rel="stylesheet">\n','')
rep('</style>',open(J('src','upgrade','fonts.css')).read()+css+'\n</style>')
a=s.index('<div class="screen" id="startScreen">'); b=s.index('<div class="screen" id="heroPanel"')
s=s[:a]+html+'\n'+s[b:]
a=s.index('<div class="screen" id="winScreen"'); b=s.index('<script type="module">')
s=s[:a]+'\n'+s[b:]
rep('<div id="money">৳৫০০</div>','<div id="money">৳৫০০</div><div id="lvl"><b id="lvlN">লেভেল ১</b><span class="lvb"><i id="lvlBar"></i></span></div>')
rep('<div class="hud" id="radio"></div>','<div class="hud" id="radio"></div>\n<div class="hud" id="tip" role="status"></div><div class="hud" id="fps"></div>')

# ---------- settings (versioned, validated, migrated from v1)
old_set=s[s.index('const settings = {'):s.index('function saveSettings(){')]
rep(old_set,'''const PRM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEF_SET={quality:IS_TOUCH?'auto':'2k',scale:100,rainDen:100,fps:false,muted:false,master:85,music:50,sfx:85,amb:75,voice:true,voiceVol:100,radio:true,camSens:100,joySize:100,btnAlpha:100,leftHand:false,vibrate:true,diff:'normal',hints:true,reduce:PRM,noFlash:PRM,bigText:false};
const settings={...DEF_SET};
try{ const s=JSON.parse(localStorage.getItem('borsha_settings')||'null'); if(s&&typeof s==='object'){ if(s.sound===false) s.muted=true; for(const k in DEF_SET) if(k in s&&typeof s[k]===typeof DEF_SET[k]) settings[k]=s[k]; } }catch(e){}
if(!['auto','1080','2k'].includes(settings.quality)) settings.quality=DEF_SET.quality;
if(!['easy','normal','hard','auto'].includes(settings.diff)) settings.diff='normal';
for(const [k,a,b] of [['scale',50,100],['rainDen',25,100],['master',0,100],['music',0,100],['sfx',0,100],['amb',0,100],['voiceVol',0,100],['camSens',40,200],['joySize',70,140],['btnAlpha',40,100]]) settings[k]=clamp(Number(settings[k])||DEF_SET[k],a,b);
const autoQ={scale:1,shadows:!IS_TOUCH};
''')

# ---------- quality: auto mode + render scale
rep('''  const maxPx=settings.quality==='2k'?2560*1440:1920*1080;
  renderer.setPixelRatio(Math.min(dpr,Math.sqrt(maxPx/(w*h))));''','''  const q=settings.quality, maxPx=q==='2k'?2560*1440:1920*1080, sc=(settings.scale/100)*(q==='auto'?autoQ.scale:1);
  renderer.setPixelRatio(Math.max(.35,Math.min(dpr,Math.sqrt(maxPx/(w*h)))*sc));''')
rep("  const sh=settings.quality==='2k';","  const sh=q==='2k'||(q==='auto'&&autoQ.shadows); needRender=true;")
rep("  document.querySelectorAll('[data-q]').forEach(b=>b.classList.toggle('on',b.dataset.q===settings.quality));\n","")

# ---------- voice volume + mute
rep("if(settings.voice===false||!settings.sound||!('speechSynthesis' in window)) return;","if(settings.voice===false||settings.muted||!(settings.master>0)||!(settings.voiceVol>0)||!('speechSynthesis' in window)) return;")
rep("u.volume=1;","u.volume=Math.min(1,settings.voiceVol/100*settings.master/100);")

# ---------- audio buses (out -> sfx / ambience / music)
rep("this.master=c.createGain(); this.master.gain.value=settings.sound?1:0; this.master.connect(c.destination);",
    "const comp=c.createDynamicsCompressor(); comp.connect(c.destination); this.out=c.createGain(); this.out.connect(comp); this.master=c.createGain(); this.master.connect(this.out); this.amb=c.createGain(); this.amb.connect(this.out); this.mus=c.createGain(); this.mus.connect(this.out);")
rep("src.connect(lp).connect(this.rainG).connect(this.master);","src.connect(lp).connect(this.rainG).connect(this.amb);")
rep("ms.connect(bp).connect(this.murG).connect(this.master);","ms.connect(bp).connect(this.murG).connect(this.amb);")
rep("o.connect(ef).connect(this.engG).connect(this.master);","o.connect(ef).connect(this.engG).connect(this.amb);")
rep("o.start();this.engO=o;\n  }catch(e){this.ctx=null;}","o.start();this.engO=o; applyVolumes();\n  }catch(e){this.ctx=null;}")

# ---------- state flags
rep("checkpoint:{x:START.x,z:START.z},won:false};","checkpoint:{x:START.x,z:START.z},won:false,runLive:false,missionFalls:0,defeatPending:false};")

# ---------- difficulty-aware damage, vibration
rep("  if(state.failT>0||player.fall>0) return;\n  player.hp=Math.max(0,player.hp-a);","  if(state.failT>0||player.fall>0||!state.started) return; a*=DF().dmg; vib(35);\n  player.hp=Math.max(0,player.hp-a);")

# ---------- wanted: chase tracking, smarter police (predictive pursuit + obstacle feelers + unstick), difficulty
rep("state.maxStars=Math.max(state.maxStars,stars());","state.maxStars=Math.max(state.maxStars,stars()); chasePeak=Math.max(chasePeak,stars()); if(stars()>=5) unlock('star5');")
rep('''    p.h=lerpAngle(p.h,Math.atan2(dx,dz),Math.min(1,dt*3));
    const top=p.max*(.85+s*.06)*(1-water.level*.4); const tgt=d<4?0:top; p.spd+=clamp(tgt-p.spd,-14*dt,p.acc*dt);
    const fx=Math.sin(p.h),fz=Math.cos(p.h); let nx=p.x+fx*p.spd*dt,nz=p.z+fz*p.spd*dt;
    if(!blocked(nx,nz,.5)){p.x=nx;p.z=nz;} else if(!blocked(nx,p.z,.5)){p.x=nx;} else if(!blocked(p.x,nz,.5)){p.z=nz;} else p.spd*=.5;''',
'''    if(p.side===undefined) p.side=Math.random()<.5?1:-1;
    const lead=clamp(d/Math.max(10,p.max),0,1.5); let want=Math.atan2(tx+PV.x*lead-p.x,tz+PV.z*lead-p.z);
    const look=Math.min(8,3+Math.abs(p.spd)*.45);
    if(d>6&&blocked(p.x+Math.sin(want)*look,p.z+Math.cos(want)*look,.6)){ for(const o of [.55,-.55,1.1,-1.1,1.7,-1.7]){ const a=want+o*p.side; if(!blocked(p.x+Math.sin(a)*look,p.z+Math.cos(a)*look,.6)){ want=a; break; } } }
    if(p.revT>0) p.revT-=dt; else p.h=lerpAngle(p.h,want,Math.min(1,dt*3.2));
    const top=p.max*(.85+s*.06)*(1-water.level*.4)*DF().cop; const tgt=p.revT>0?-4:(d<4?0:top); p.spd+=clamp(tgt-p.spd,-14*dt,p.acc*dt);
    const fx=Math.sin(p.h),fz=Math.cos(p.h); let nx=p.x+fx*p.spd*dt,nz=p.z+fz*p.spd*dt; const ox=p.x,oz=p.z;
    if(!blocked(nx,nz,.5)){p.x=nx;p.z=nz;} else if(!blocked(nx,p.z,.5)){p.x=nx;} else if(!blocked(p.x,nz,.5)){p.z=nz;} else p.spd*=.5;
    if(d>6&&p.revT<=0&&Math.hypot(p.x-ox,p.z-oz)<Math.max(.004,Math.abs(tgt)*dt*.2)){ p.stuck=(p.stuck||0)+dt; if(p.stuck>1.3){ p.stuck=0; p.revT=.9; p.side=-p.side; } } else p.stuck=0;''')
rep("heat=0; catchT=0; calmCrowd(); }}","heat=0; catchT=0; chasePeak=0; adapt(-.08); calmCrowd(); }}")
rep("if(escapeT>6){ heat=Math.max(0,heat-1); escapeT=0; if(stars()===0) toast('😮‍💨 সার্জেন্টরা হারিয়ে ফেলেছে। বাঁচলা!'); }",
    "if(escapeT>DF().decay){ heat=Math.max(0,heat-1); escapeT=0; if(stars()===0){ toast('😮‍💨 সার্জেন্টরা হারিয়ে ফেলেছে। বাঁচলা!'); onEscaped(); } }")

# ---------- crowd fights: attack tokens (others circle and wait), thugs retreat when hurt, no hits while paused
rep("  const tgt=pedTarget(); const pv=player.inVeh;\n  for(const p of peds){",
'''  const tgt=pedTarget(); const pv=player.inVeh;
  { const hs=[]; for(const p of peds){ p.engage=false; if(p.state==='fight'||p.state==='mob'||p.state==='thug') hs.push(p); }
    if(hs.length){ hs.sort((a,b)=>Math.hypot(a.x-tgt.x,a.z-tgt.z)-Math.hypot(b.x-tgt.x,b.z-tgt.z)); const k=(DF().atk||2)+(pv?2:0); for(let i=0;i<hs.length&&i<k;i++) hs[i].engage=true; } }
  for(const p of peds){''')
rep("        if(dp>1.05){ pedMove(p,dxp,dzp,dp<2.5?2.5:sp,dt); }",
'''        if(!p.engage&&dp<3.6){ const sd=(p.idx%2?1:-1), pull=(dp-2.9)*.9; pedMove(p,-dzp*sd/dp+dxp/dp*pull,dxp*sd/dp+dzp/dp*pull,1.6,dt); p.h=lerpAngle(p.h,Math.atan2(dxp,dzp),Math.min(1,dt*8)); }
        else if(dp>1.05){ pedMove(p,dxp,dzp,dp<2.5?2.5:sp,dt); }''')
rep("        if(dp<14&&!player.inVeh){ if(dp>1.05) pedMove(p,dxp,dzp,dp<2.5?2.5:5,dt); else {",
'''        if(p.retreatT>0){ p.retreatT-=dt; pedMove(p,-dxp,-dzp,4.4,dt); }
        else if(dp<14&&!player.inVeh){ if(p.hp<50&&!p.retreated){ p.retreated=true; p.retreatT=2.2; if(Math.random()<.6) toast('🗣️ '+pick(['মাস্তান: "দাঁড়া, দম নিয়া আসতেছি!"','মাস্তান: "ভাই ভাই, এক মিনিট!"']),1.8); }
          else if(!p.engage&&dp<3.6){ const sd=(p.idx%2?1:-1), pull=(dp-2.9)*.9; pedMove(p,-dzp*sd/dp+dxp/dp*pull,dxp*sd/dp+dzp/dp*pull,1.8,dt); p.h=lerpAngle(p.h,Math.atan2(dxp,dzp),Math.min(1,dt*8)); }
          else if(dp>1.05) pedMove(p,dxp,dzp,dp<2.5?2.5:5,dt); else {''')
rep("setTimeout(()=>{ const tg=pedTarget(); if(","setTimeout(()=>{ const tg=pedTarget(); if(!state.paused&&state.started&&",2)
rep("Object.assign(p,{x,z,state:'thug',hp:140,hx:j.spot.x,hz:j.spot.z,stateT:999});","Object.assign(p,{x,z,state:'thug',hp:140,hx:j.spot.x,hz:j.spot.z,stateT:999,retreated:false,retreatT:0});")

# ---------- progression hooks
rep("function recoverLoot(p){ const back=p.loot+100; state.money+=back; p.loot=0; snatchEvt.active=null;","function recoverLoot(p){ const back=p.loot+100; state.money+=back; p.loot=0; snatchEvt.active=null; stat('snatchCaught'); addXP(80); addCoins(20);")
rep("const loot=randInt(80,400); state.money+=loot; player.lastFight=state.time; AU.whoosh();","const loot=randInt(80,400); state.money+=loot; player.lastFight=state.time; AU.whoosh(); stat('snatches');")
rep("player.inVeh=v; player.lastFight=state.time; AU.noise(.3,600,.3);","player.inVeh=v; player.lastFight=state.time; AU.noise(.3,600,.3); stat('carjacks');")
rep("state.money-=fare; v.hired=true;","state.money-=fare; v.hired=true; stat('fares');")
rep("pay=150+tip; state.money+=pay; j.count++; j.phase='wait';","pay=150+tip; state.money+=pay; j.count++; j.phase='wait'; stat('deliveries'); addXP(60+(tip?30:0)); addCoins(15);")
rep("if(!left){ state.money+=600; j.count++; j.phase='wait';","if(!left){ state.money+=600; j.count++; j.phase='wait'; stat('thugs'); addXP(90); addCoins(40);")
rep("curZone=''; jobEnsure();","curZone=''; jobEnsure(); markHeroPlayed(); persistSoon();")
rep("state.step=i; state.stepT=0; const M=MISSIONS[i];","state.step=i; state.stepT=0; state.missionFalls=0; const M=MISSIONS[i];")

# completeStep with stars, win() moved to META
a=s.index('function completeStep(){'); b=s.index('function fail(title,sub,gray){')
s=s[:a]+'''function completeStep(){
  const M=MISSIONS[state.step], i=state.step;
  if(M.reward){ let r=M.reward, extra=''; const onTime=!!(M.timer&&state.stepT<M.timer); if(onTime){r+=M.bonus;extra=` (সময় বোনাস ৳${bn(M.bonus)} সহ)`;} state.money+=r;
    const st=onMissionDone(i,onTime,r); missionPassed('মিশন সম্পন্ন!',`${M.title} · +৳${bn(r)}${extra} · ${'★'.repeat(st)}${'☆'.repeat(3-st)}`); }
  if(state.step===MISSIONS.length-1){ setTimeout(win,2500); state.step++; return; }
  const next=state.step+1; setTimeout(()=>{ if(state.step===next-1||state.step===next) startStep(next); }, M.reward?2600:200); state.step=next; water.target=MISSIONS[next].water;
}
'''+s[b:]
n_ok+=1
rep("if(state.failT>0) return; state.failT=3.6; state.falls++;","if(state.failT>0) return; state.failT=3.6; state.falls++; onFail(title);")
rep("  toast(`🛟 পাশে একটা ${v.label} রাখা আছে`);\n}","  toast(`🛟 পাশে একটা ${v.label} রাখা আছে`);\n  if(state.defeatPending){ state.defeatPending=false; showDefeat(); }\n}")

# ---------- particles hooks
rep("function missionPassed(title,sub){say(title,{prio:2,pitch:1});","function missionPassed(title,sub){ fxBurst(player.x,1.6,player.z,[[.45,1,.55],[1,.85,.25],[1,1,.8]],46,5,5,1.3,.3); say(title,{prio:2,pitch:1});")
rep("AU.thud(); const ex=(p.x-player.x)/(d||1)","AU.thud(); fxBurst(p.x,1.3,p.z,[[1,.95,.7],[1,1,1]],10,3,1.6,.35,.16); const ex=(p.x-player.x)/(d||1)")
rep("knockDown(best,9); best.jv=2;","knockDown(best,9); best.jv=2; fxBurst(best.x,1.2,best.z,[[1,.9,.5],[1,1,1]],12,3.5,2,.35,.14);")
rep("player.fall=.001; player.x=m.x; player.z=m.z;","player.fall=.001; player.x=m.x; player.z=m.z; fxBurst(m.x,water.level+.1,m.z,[[.75,.7,.6],[.9,.92,.92]],30,3,4.5,.8,.26); vib(120);")
rep("damage(v,Math.abs(v.spd)*1.3);AU.noise(.3,250,.35);shake=.4;","damage(v,Math.abs(v.spd)*1.3);AU.noise(.3,250,.35);shake=.4;fxBurst(v.x+Math.sin(v.h)*v.hl,.8,v.z+Math.cos(v.h)*v.hl,[[1,.8,.3],[1,1,.8]],14,6,3,.5,.14);")


# ---------- BOSS FIGHT hooks (up/boss.js)
rep("import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';","import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';\nimport { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';")
rep("  if(x<ORIGIN-ROAD/2||x>MAXC+ROAD/2||z<ORIGIN-ROAD/2||z>MAXC+ROAD/2) return false;\n","  if(x<ORIGIN-ROAD/2||x>MAXC+ROAD/2||z<ORIGIN-ROAD/2||z>MAXC+ROAD/2) return false;\n  if(arenaBlock(x,z)) return false;\n")
rep("  const W=curW(), rng=W.range||1.55; const p=nearestPed(rng+.9,false);","  const W=curW(), rng=W.range||1.55; if(bossMelee(W,rng)) return; const p=nearestPed(rng+.9,false);")
rep("if(d<bd&&d>.5&&(dx*fx+dz*fz)/d>.95){ copHit=c; best=null; bd=d; } }","if(d<bd&&d>.5&&(dx*fx+dz*fz)/d>.95){ copHit=c; best=null; bd=d; } }\n  const bHit=bossAim(fx,fz,bd); if(bHit){ best=null; copHit=null; }")
rep("  const end=best?new THREE.Vector3(best.x,1.2,best.z)","  const end=bHit?new THREE.Vector3(bHit.x,bHit.y,bHit.z):best?new THREE.Vector3(best.x,1.2,best.z)")
rep("  addHeat((policeNear(80)?2:1)*w.heat);","  if(bHit) bossDamage(bHit.b,w.id==='rifle'?16:30,'gun');\n  addHeat((policeNear(80)?2:1)*w.heat);")
rep("  if(player.hp<=0){ const bill=","  if(player.hp<=0&&bossOn()){ bossLose(); return; }\n  if(player.hp<=0){ const bill=")
rep("function addHeat(a){ const before=stars();","function addHeat(a){ if(bossOn()) return; const before=stars();")
rep("function objective(){\n  const id=hero().id;","function objective(){\n  if(bossOn()) return bossObjective();\n  const id=hero().id;")
rep("function canSwitch(){\n","function canSwitch(){\n  if(bossOn()){ toast('👑 বস ফাইটের মাঝে নায়ক বদলানো যাবে না!'); return false; }\n")

# ---------- ELEVATED ROADS / FLYOVERS / METRO hooks (up/infra.js)
rep("  v.mesh.position.set(v.x,vib,v.z); v.mesh.rotation.set(v.pitch,v.h,v.roll+wob,'YXZ');","  v.mesh.position.set(v.x,vib+(v.y||0),v.z); v.mesh.rotation.set(v.pitch+(v.dp||0),v.h,v.roll+wob,'YXZ');")
rep("    const res=moveWithCollision(v,v.x+fx*v.spd*dt,v.z+fz*v.spd*dt,v.hw+.05,v.hl,v.h);","    const res=deckStep(v,dt,fx,fz)?0:moveWithCollision(v,v.x+fx*v.spd*dt,v.z+fz*v.spd*dt,v.hw+.05,v.hl,v.h);")
rep("    for(const m of manholes){ if(m.cool>0) continue; if(Math.hypot(m.x-v.x,m.z-v.z)<v.hw+.3","    if(!v.deck) for(const m of manholes){ if(m.cool>0) continue; if(Math.hypot(m.x-v.x,m.z-v.z)<v.hw+.3")
rep("    const deep=water.level>v.stall;","    const deep=water.level>v.stall&&!(v.deck&&v.y>1.5);")
rep("if(Math.abs(o.x-obj.x)>8||Math.abs(o.z-obj.z)>8) continue;","if(Math.abs(o.x-obj.x)>8||Math.abs(o.z-obj.z)>8) continue; if(Math.abs((o.y||0)-(obj.y||0))>2.5) continue;")
rep("  for(const p of pillars){ for(const a of mine){","  if((obj.y||0)<2.5) for(const p of pillars){ if(Math.abs(p[0]-obj.x)>7||Math.abs(p[1]-obj.z)>7) continue; for(const a of mine){")
rep("function tryEnterExit(){\n  if(state.failT>0||player.fall>0) return;","function tryEnterExit(){\n  if(state.failT>0||player.fall>0) return;\n  if(player.inVeh&&player.inVeh.deck&&player.inVeh.y>1.2){ toast('🛣️ উড়ালসড়কের উপর গাড়ি থেকে নামা যাবে না — আগে র‍্যাম্প দিয়ে নিচে নামো',2.5); return; }")
rep("  if(bossOn()){ toast('👑 বস ফাইটের মাঝে নায়ক বদলানো যাবে না!'); return false; }\n","  if(bossOn()){ toast('👑 বস ফাইটের মাঝে নায়ক বদলানো যাবে না!'); return false; }\n  if(player.inVeh&&player.inVeh.deck&&player.inVeh.y>1.2){ toast('🛣️ আগে উড়ালসড়ক থেকে নামো!'); return false; }\n")
rep("  const z=zoneAt(player.x,player.z); if(z!==curZone)","  const z=(player.inVeh&&player.inVeh.deck&&player.inVeh.y>2)?player.inVeh.deck.name:zoneAt(player.x,player.z); if(z!==curZone)")
rep("  if(metroTrain){ const u=metroTrain.userData;","  tickInfra(dt);\n  if(metroTrain){ const u=metroTrain.userData;")
rep("function buildMetro(){\n","function buildMetro(){ return;   // replaced by the multi-line metro in buildInfra()\n")
rep("  g.strokeStyle='#b07be0'; g.lineWidth=5; g.setLineDash([16,10]); g.beginPath(); g.moveTo(METRO_X,METRO_Z0); g.lineTo(METRO_X,METRO_Z1); g.stroke(); g.setLineDash([]);","  drawInfraMap(g);")
rep("\n}\nfunction drawBigMap(){","\n  window._mapLabels.push(...infraLabels());\n}\nfunction drawBigMap(){")
rep("g.fillText('↑ উত্তর · লাল রাস্তা = ঢাকা ইনার রিং রোড (আব্দুল্লাহপুর–গাবতলী–বাবুবাজার–চাষাড়া–ডেমরা–বেরাইদ)',10*dpr,16*dpr);","g.fillText('↑ উত্তর · লাল রাস্তা = ঢাকা ইনার রিং রোড (আব্দুল্লাহপুর–গাবতলী–বাবুবাজার–চাষাড়া–ডেমরা–বেরাইদ)',10*dpr,16*dpr); g.fillText('কমলা = এলিভেটেড এক্সপ্রেসওয়ে · হলুদ = ফ্লাইওভার/ওভারপাস',10*dpr,36*dpr); g.fillText('সবুজ = এমআরটি-৬ (চালু) · রঙিন ড্যাশ = নির্মাণাধীন মেট্রো · ধূসর ড্যাশ = পরিকল্পিত (MRT-2, 4, 5 দক্ষিণ)',10*dpr,56*dpr);")
# ---------- input: menus first, camera sensitivity, left-handed layout, joystick size
rep("addEventListener('keydown',e=>{\n  if(e.repeat){keys[e.code]=true;return;} keys[e.code]=true;\n","addEventListener('keydown',e0=>{\n  if(keyCapture(e0)) return;\n  const e={code:kx(e0.code),repeat:e0.repeat,preventDefault:()=>e0.preventDefault()};\n  if(e.repeat){keys[e.code]=true;return;} keys[e.code]=true;\n  if(menuKeys(e0)) return;\n")
rep("addEventListener('keyup',e=>{keys[e.code]=false;});","addEventListener('keyup',e=>{keys[kx(e.code)]=false;});")
rep("sub:()=>IS_TOUCH?'গাড়ির কাছে গিয়ে \"উঠো\" চাপো':'গাড়ির কাছে গিয়ে F চাপো'","sub:()=>IS_TOUCH?'গাড়ির কাছে গিয়ে \"উঠো\" চাপো':`গাড়ির কাছে গিয়ে ${K('KeyF')} চাপো`")
rep('<meta charset="utf-8">','<meta charset="utf-8">\n<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ctext y=%27.9em%27 font-size=%2790%27%3E%F0%9F%8C%A7%3C/text%3E%3C/svg%3E">')
rep("camYawOff-=(e.clientX-mouseDrag)*.006;","camYawOff-=(e.clientX-mouseDrag)*.006*settings.camSens/100;")
rep("camYawOff-=(e.clientX-touch.camX)*.008;","camYawOff-=(e.clientX-touch.camX)*.008*settings.camSens/100;")
rep("if(e.clientX<innerWidth*.45&&touch.jid===null){","if((settings.leftHand?e.clientX>innerWidth*.55:e.clientX<innerWidth*.45)&&touch.jid===null){")
rep("const l=Math.hypot(dx,dy),mx=55;","const l=Math.hypot(dx,dy),mx=55*settings.joySize/100;")

# ---------- overlays use the new screen system
rep("if(!state.won&&$('pauseScreen').style.display!=='flex'&&$('mapScreen').style.display!=='flex') state.paused=false;","if(!state.won&&!scrOn('pauseScreen')&&!scrOn('endScreen')&&$('mapScreen').style.display!=='flex') state.paused=false; needRender=true;")
rep("if($('pauseScreen').style.display!=='flex'&&$('heroPanel').style.display!=='flex') state.paused=false;","if(!scrOn('pauseScreen')&&$('heroPanel').style.display!=='flex') state.paused=false; needRender=true;")
rep("function toggleMap(force){ if(!state.started||state.won) return;","function toggleMap(force){ if(!state.started||state.won) return; needRender=true;")

# ---------- accessibility: shake, lightning flash; rain density; radio; zones; minimap assist
rep("if(shake>0){shake-=dt;camera.position.x+=rand(-.15,.15)*shake*3;camera.position.y+=rand(-.1,.1)*shake*3;}","if(shake>0){shake-=dt; if(!settings.reduce){camera.position.x+=rand(-.15,.15)*shake*3;camera.position.y+=rand(-.1,.1)*shake*3;}}")
rep("f=(flashT>.25||(flashT<.15&&flashT>.08))?1:0;","f=((flashT>.25||(flashT<.15&&flashT>.08))?1:0)*(settings.noFlash?.12:1);")
rep("const n=Math.floor(RAIN_N*clamp(rainLevel,0,1));","const n=Math.floor(RAIN_N*clamp(rainLevel,0,1)*settings.rainDen/100);")
rep("radioT-=dt; if(radioT<=0){radioT=11;","radioT-=dt; if(radioT<=0&&settings.radio){radioT=11;")
rep("if(z!==curZone){curZone=z;$('zone').textContent=z;$('zone').style.opacity=1;zoneT=3;}","if(z!==curZone){curZone=z;$('zone').textContent=z;$('zone').style.opacity=1;zoneT=3;onZone(z);}")
rep("for(const m of manholes){ if(m.kind==='flag'||water.level<.08){","const ast=assistOn(); for(const m of manholes){ if(m.kind==='flag'||water.level<.08||ast){")

# ---------- outfits need the hero's base look
rep("  HEROES.forEach((H,i)=>{\n    H.im=makeCrowdMesh(","  HEROES.forEach((H,i)=>{\n    H.o0={...H.o}; H.im=makeCrowdMesh(")

# ---------- main loop: menu scene, render-on-demand when paused, play tick, particles, perf
rep('''  let dt=Math.min(.05,(now-last)/1000); last=now;
  if(!state.started||state.paused){ renderer.render(scene,camera); return; }
  state.time+=dt; state.stepT+=dt; state.clock+=dt*14;''','''  const raw=Math.max(0,(now-last)/1000); let dt=Math.min(.05,raw); last=now; perfTick(raw);
  if(!state.started){ menuTick(dt); return; }
  if(state.paused){ if(needRender){ needRender=false; renderer.render(scene,camera); } return; }
  state.time+=dt; state.stepT+=dt; state.clock+=dt*14;
  playTick(dt);''')
rep("  updateCamera(dt,false);\n  miniT-=dt;","  fxTick(dt);\n  updateCamera(dt,false);\n  miniT-=dt;")

# ---------- replace old pause/start + boot with META + new boot
a=s.index('// ================= pause / start'); b=s.index('window.__dbg=')
boot='''// ================= boot (staged, with real progress)
function ldProgress(p,t){ $('ldBar').style.width=Math.round(p*100)+'%'; if(t) $('ldTxt').textContent=t; }
const LD_TIPS=['💡 পানির নিচে ঘূর্ণি, বুদবুদ বা লাল পতাকা মানে — ওখানে খোলা ম্যানহোল।','💡 সিএনজি পানিতে বন্ধ হলে রিকশা নাও — রিকশা ডোবে না।','💡 ওয়ান্টেড হলে গলিতে ঢুকে সার্জেন্টদের চোখের আড়ালে থাকো।','💡 মিতু সবচেয়ে দ্রুত দৌড়ায়, জামাল চাচার ঘুষিতে দ্বিগুণ জোর।','💡 প্রতিদিন নতুন দৈনিক চ্যালেঞ্জ — শেষ করলে XP আর কয়েন।','💡 প্রতি মিশনে ৩ তারা: শেষ করা, না পড়া, দ্রুত পৌঁছানো।'];
(async()=>{
  const step=(p,t)=>{ ldProgress(p,t); return new Promise(r=>requestAnimationFrame(()=>setTimeout(r,16))); };
  try{
    $('ldTip').textContent=pick(LD_TIPS);
    try{ await Promise.race([document.fonts.load('700 48px "Hind Siliguri"','বাংলা'),new Promise(r=>setTimeout(r,3000))]); }catch(e){}
    loadSave(); applyBody(); applyTouchLayout(); $('fps').style.display=settings.fps?'block':'none'; if(!settings.radio) $('radio').style.display='none';
    await step(.06,'গ্রাফিক্স তৈরি হচ্ছে…'); applyQuality(); buildAtlas(); buildVehicleAtlas();
    await step(.18,'বৃহত্তর ঢাকা বানানো হচ্ছে — সাভার থেকে নরসিংদী…'); buildWorld();
    await step(.62,'ম্যানহোলের ঢাকনা চুরি হচ্ছে… 😅'); buildInfra(); buildManholes(); buildMarkers();
    await step(.7,'তিন নায়ক ঘুম থেকে উঠছে…'); buildPlayer(); HEROES.forEach(H=>{ if(SAVE.outfits[H.id].cur) applyOutfit(H); }); buildAircraft(); buildBaseMap(); buildWeapons(); buildFX();
    await step(.84,'মানুষ আর গাড়ি রাস্তায় নামছে…'); buildPeds(IS_TOUCH?34:60,IS_TOUCH?10:18); for(let i=0;i<(IS_TOUCH?30:55);i++) spawnAI(null,25,280); spawnDeckCars();
    await step(.96,'শেষ ছোঁয়া…'); camYaw=player.h+.5; rainLevel=rainTarget=.45; cloudLevel=cloudTarget=.75;
    syncPeds(); syncPlayer(); updateCamera(0,true); updateSky(.016); renderer.render(scene,camera);
    ldProgress(1,'তৈরি!'); hudLevel(true);
    requestAnimationFrame(frame); window.__ready=true;
    setTimeout(()=>showHome('dash'),250);
  }catch(e){ showError('লোড করার সময় সমস্যা: '+(e&&e.message||e)); }
})();
'''
s=s[:a]+meta+'\n'+open(J('src','upgrade','boss.js')).read()+'\n'+open(J('src','upgrade','infra.js')).read()+'\n'+boot+s[b:]
n_ok+=1
rep("window.__dbg={RING_SEGS,","window.__dbg={get SAVE(){return SAVE},settings,beginStory,restoreRun,completeStep,win,showDefeat,fail,toMenu,persist,continueGame,newGame,togglePause,openSettings,closeSettings,goPage,showTutorial,tutEnd,applyOutfit,HEROES,MUS,AU,PERF,DF,get heroIdx(){return heroIdx},jobs,RING_SEGS,")
# rain/cloud targets follow the instant levels when a story begins
rep("  else { water.level=i>=2?prevM.water:0; rainLevel=i>=2?prevM.rain:0; cloudLevel=i>=2?(prevM.cloud??.6):.15; }","  else { water.level=i>=2?prevM.water:0; rainLevel=rainTarget=i>=2?prevM.rain:0; cloudLevel=cloudTarget=i>=2?(prevM.cloud??.6):.15; }")
rep("window.__dbg={get SAVE(){return SAVE},","window.__dbg={get SAVE(){return SAVE},KB,kx,toggleFS,")
rep('state.time+=dt; state.stepT+=dt; state.clock+=dt*14;','state.time+=dt; if(!bossOn()) state.stepT+=dt; state.clock+=dt*14;')
rep("window.__dbg={get SAVE(){return SAVE},","window.__dbg={get SAVE(){return SAVE},updatePlayer,keys,DECKS,METRO,INFRA,deckAt,cellAt,roadAt,CODE_NAME,hurtPlayer,blocked,bossMelee,curW,buildTank,buildSultan,buildCommando,BOSS,ARENA,bossStart,bossDamage,bossAbort,arenaBlock,")
open(P,'w').write(s)
print('patched OK',n_ok,'edits, size',len(s))
for bad in ['settings.sound','startBtn','winStats','keysHelp',"style.display!=='flex'&&$('mapScreen')"]:
    if bad in s: print('LEFTOVER',bad)
