import asyncio
from playwright.async_api import async_playwright
OUT='shots/'
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']
CLOSE="""(()=>{ const D=__dbg, b=D.BOSS.b, c=D.camera; D.state.paused=true; const s=b.M.root.scale.x, h=b.h, d=%s;
  c.position.set(b.x+Math.sin(h+%s)*d, %s*s, b.z+Math.cos(h+%s)*d); c.lookAt(b.x,%s*s,b.z); c.updateMatrixWorld(); D.renderer.render(D.scene,c); })()"""
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        ctx = await br.new_context(viewport={'width':1280,'height':720}); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
        await pg.goto('http://localhost:8765/index.html')
        await pg.wait_for_function('window.__ready===true', timeout=300000)
        await pg.wait_for_function("document.getElementById('home').classList.contains('on')", timeout=20000); await asyncio.sleep(1)
        ev=lambda js: pg.evaluate(js)
        await ev("__dbg.SAVE.profile.tut=true; document.querySelector('#home .nb[data-pg=missions]').click()"); await asyncio.sleep(1)
        await pg.screenshot(path=OUT+'f0_missions.png')
        await ev("document.querySelector('[data-b]').click()"); await asyncio.sleep(4)
        print('start:', await ev("JSON.stringify({on:__dbg.BOSS.on,type:__dbg.BOSS.b&&__dbg.BOSS.b.type,built:__dbg.ARENA.built,p:[__dbg.player.x-__dbg.ARENA.x,__dbg.player.z-__dbg.ARENA.z].map(v=>+v.toFixed(1)),hp:__dbg.BOSS.b&&__dbg.BOSS.b.hp,bar:getComputedStyle(document.getElementById('bossBar')).display,obj:document.getElementById('obj').textContent.slice(0,60)})"))
        print('arena clear:', await ev("(()=>{ const A=__dbg.ARENA; let bad=0; for(let r=0;r<=16.5;r+=1.5) for(let a=0;a<6.28;a+=.3){ if(__dbg.blocked?__dbg.blocked(A.x+Math.cos(a)*r,A.z+Math.sin(a)*r,.4):false) bad++; } return bad; })()"))
        await pg.screenshot(path=OUT+'f1_arena.png')
        # close-ups for each boss
        for i,name in enumerate(['chhaya','tank','sultan']):
            await pg.wait_for_function(f"__dbg.BOSS.b&&__dbg.BOSS.b.type==='{name}'", timeout=60000)
            await ev("(()=>{const b=__dbg.BOSS.b; b.state='intro'; b.st=999; })()"); await asyncio.sleep(1.5)
            await ev(CLOSE%('3.4','0','1.15','0','1.0')); await asyncio.sleep(.3); await pg.screenshot(path=OUT+f'g{i}_{name}_front.png')
            await ev(CLOSE%('3.0','2.3','1.3','2.3','1.0')); await asyncio.sleep(.3); await pg.screenshot(path=OUT+f'g{i}_{name}_back.png')
            await ev(CLOSE%('1.0','.25','1.68','.25','1.66')); await asyncio.sleep(.3); await pg.screenshot(path=OUT+f'g{i}_{name}_face.png')
            # action pose
            st={'chhaya':"b.state='windup'; b.st=999;",'tank':"b.state='fire'; b.st=999;",'sultan':"b.state='aim'; b.st=999; b.ax=__dbg.player.x; b.az=__dbg.player.z;"}[name]
            await ev("(()=>{const b=__dbg.BOSS.b; __dbg.state.paused=false; const P=__dbg.player; P.x=b.x+Math.sin(b.h)*7; P.z=b.z+Math.cos(b.h)*7; "+st+" })()"); await asyncio.sleep(5)
            await pg.screenshot(path=OUT+f'g{i}_{name}_action.png')
            await ev(CLOSE%('4.2','.7','1.4','.7','1.0')); await asyncio.sleep(.3); await pg.screenshot(path=OUT+f'g{i}_{name}_action2.png')
            print(name,'hp(player):', await ev("Math.round(__dbg.player.hp)"), 'state', await ev("__dbg.BOSS.b.state"))
            # melee test then kill
            await ev("(()=>{const b=__dbg.BOSS.b; __dbg.state.paused=false; b.state='recover'; b.st=999; const P=__dbg.player; P.x=b.x+Math.sin(b.h)*1.2; P.z=b.z+Math.cos(b.h)*1.2; P.hp=999; window._h0=b.hp; __dbg.punch(); })()"); await asyncio.sleep(2)
            print(name,'melee dmg:', await ev("Math.round(window._h0-__dbg.BOSS.b.hp)"))
            await ev("(()=>{const b=__dbg.BOSS.b; b.state='recover'; __dbg.bossDamage(b,99999,'gun'); })()"); await asyncio.sleep(3)
            await pg.screenshot(path=OUT+f'g{i}_{name}_dead.png')
        await pg.wait_for_function("document.getElementById('endScreen').classList.contains('on')", timeout=60000); await asyncio.sleep(1)
        await pg.screenshot(path=OUT+'h1_bosswin.png')
        print('win:', await ev("JSON.stringify({w:__dbg.SAVE.boss,ach:Object.keys(__dbg.SAVE.ach),on:__dbg.BOSS.on})"))
        await ev("document.getElementById('eBoss').click()"); await asyncio.sleep(3)
        print('retry on:', await ev("__dbg.BOSS.on&&__dbg.BOSS.b.type"))
        await ev("(()=>{ const b=__dbg.BOSS.b; b.state='stalk'; __dbg.player.hp=5; __dbg.hurtPlayer(50); })()"); await asyncio.sleep(4)
        await pg.screenshot(path=OUT+'h2_bosslose.png')
        print('lose:', await ev("JSON.stringify({end:document.getElementById('endScreen').classList.contains('on'),lose:document.getElementById('endP').classList.contains('lose'),on:__dbg.BOSS.on,hp:__dbg.player.hp})"))
        await ev("document.getElementById('eCont').click()"); await asyncio.sleep(1)
        print('after cont:', await ev("JSON.stringify({paused:__dbg.state.paused,on:__dbg.BOSS.on,heat:0})"))
        await pg.reload(); await pg.wait_for_function('window.__ready===true', timeout=300000); await asyncio.sleep(2)
        print('saved boss:', await ev("JSON.stringify(__dbg.SAVE.boss)"))
        print('\n'.join(errs[:20]) or 'NO ERRORS'); await br.close()
asyncio.run(main())
