import asyncio, sys
from playwright.async_api import async_playwright
OUT='shots/'
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        ctx = await b.new_context(viewport={'width':1280,'height':720})
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
        pg.on('requestfailed', lambda r: errs.append('REQFAIL '+r.url[:100]))
        pg.on('response', lambda r: errs.append('HTTP%d %s'%(r.status,r.url[:100])) if r.status>=400 else None)
        await pg.goto('http://localhost:8765/index.html')
        await pg.wait_for_function('window.__ready===true', timeout=300000)
        await pg.wait_for_selector('#home.on', timeout=20000); await asyncio.sleep(1)
        ev=lambda js: pg.evaluate(js)
        await ev("document.querySelector('#home [data-act=settings]').click()"); await asyncio.sleep(1)
        print('fs row:', await ev("!!document.querySelector('#setBody [data-a=fs]')"))
        await pg.screenshot(path=OUT+'c1_gfx.png')
        await ev("document.querySelector('#setTabs [data-t=ctl]').click()"); await asyncio.sleep(.5)
        await ev("document.querySelector('.kbtn[data-key=KeyJ]').click()"); await asyncio.sleep(.3)
        print('capturing:', await ev("document.querySelector('.kbtn.cap')&&document.querySelector('.kbtn.cap').textContent"))
        await pg.keyboard.press('KeyK'); await asyncio.sleep(.3)
        print('after bind J->K:', await ev("JSON.stringify({J:__dbg.KB.KeyJ,kxK:__dbg.kx('KeyK'),kxJ:__dbg.kx('KeyJ'),settingsOpen:document.getElementById('setScr').classList.contains('on')})"))
        await ev("document.querySelector('.kbtn[data-key=KeyF]').click()"); await asyncio.sleep(.3)
        await pg.keyboard.press('KeyK'); await asyncio.sleep(.3)
        print('swap F<-K:', await ev("JSON.stringify({F:__dbg.KB.KeyF,J:__dbg.KB.KeyJ,stored:localStorage.getItem('borsha_keys'),note:document.querySelector('#setBody .srow small').textContent})"))
        await pg.screenshot(path=OUT+'c2_keys.png')
        # Esc cancels capture without closing settings
        await ev("document.querySelector('.kbtn[data-key=KeyH]').click()"); await pg.keyboard.press('Escape'); await asyncio.sleep(.3)
        print('esc cancel:', await ev("JSON.stringify({H:__dbg.KB.KeyH,open:document.getElementById('setScr').classList.contains('on'),cap:!!document.querySelector('.kbtn.cap')})"))
        await pg.keyboard.press('Escape'); await asyncio.sleep(.5)
        print('esc closes:', await ev("!document.getElementById('setScr').classList.contains('on')"))
        # new game; check remapped enter key (K) works in game and tutorial uses new key names
        await ev("__dbg.SAVE.profile.tut=false")
        await ev("document.querySelector('#contBtn').click()"); await asyncio.sleep(1)
        print('tut text:', await ev("document.getElementById('tutP').textContent"))
        await ev("document.querySelector('#tutSkip').click()"); await asyncio.sleep(4)
        print('objective sub:', await ev("(document.getElementById('objSub')||{}).textContent||''"))
        await ev("(()=>{const v=__dbg.vehicles.find(v=>v.kind==='cng'&&v.player)||__dbg.vehicles[0]; })()")
        before=await ev("!!__dbg.player.inVeh")
        await ev("(()=>{ const P=__dbg.player; let best=null,bd=1e9; for(const v of __dbg.vehicles){ const d=Math.hypot(v.x-P.x,v.z-P.z); if(d<bd){bd=d;best=v;} } P.x=best.x+2; P.z=best.z; })()")
        await pg.keyboard.press('KeyK'); await asyncio.sleep(3)
        print('enter via remapped K:', before,'->', await ev("!!__dbg.player.inVeh"))
        await pg.keyboard.press('KeyF'); await asyncio.sleep(2)
        print('F now punches (not exit):', await ev("!!__dbg.player.inVeh"))
        # restore defaults
        await ev("localStorage.removeItem('borsha_keys')")
        print('\n'.join(errs[:20]) or 'NO ERRORS')
        await b.close()
asyncio.run(main())
