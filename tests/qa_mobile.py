import asyncio, sys
from playwright.async_api import async_playwright
OUT='shots/'
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']
async def run(b,name,vw,vh,full):
    ctx = await b.new_context(viewport={'width':vw,'height':vh},is_mobile=True,has_touch=True,device_scale_factor=2)
    pg = await ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type=='error' and 'fonts' not in m.text else None)
    await pg.goto('http://localhost:8765/index.html')
    await pg.wait_for_function('window.__ready===true', timeout=300000)
    await pg.wait_for_function("document.getElementById('home').classList.contains('on')", timeout=20000); await asyncio.sleep(2)
    ev=lambda js: pg.evaluate(js)
    print(name,'touch:',await ev("matchMedia('(pointer:coarse)').matches"), 'overflowX:', await ev("JSON.stringify([document.documentElement.scrollWidth,innerWidth, document.getElementById('pages').scrollWidth, document.getElementById('pages').clientWidth])"))
    await pg.screenshot(path=OUT+name+'1_home.png')
    if full:
        await ev("document.querySelector('#home [data-act=settings]').click()"); await asyncio.sleep(.8)
        await ev("document.querySelector('#setTabs [data-t=ctl]').click()"); await asyncio.sleep(.5)
        await pg.screenshot(path=OUT+name+'2_set.png')
        await ev("document.getElementById('setClose').click()"); await asyncio.sleep(.5)
        await ev("document.querySelector('#home .nb[data-pg=missions]').click()"); await asyncio.sleep(1)
        await pg.screenshot(path=OUT+name+'2b_missions.png')
    await ev("document.querySelector('#home .nb[data-pg=dash]').click()"); await asyncio.sleep(.5)
    await pg.tap('#contBtn'); await asyncio.sleep(1)
    if await ev("document.getElementById('tutScr').classList.contains('on')"):
        if full: await pg.screenshot(path=OUT+name+'2c_tut.png')
        await pg.tap('#tutSkip')
    await asyncio.sleep(5)
    print(name,'started:', await ev("JSON.stringify({s:__dbg.state.started,touchVis:getComputedStyle(document.getElementById('touch')).display})"))
    await pg.screenshot(path=OUT+name+'3_game.png')
    if full:
        await pg.tap('#pauseBtn'); await asyncio.sleep(1.2)
        print(name,'paused:', await ev("__dbg.state.paused"))
        await pg.screenshot(path=OUT+name+'4_pause.png')
        await pg.tap('#resumeBtn'); await asyncio.sleep(1)
        await ev("__dbg.state.step=1; __dbg.state.missionFalls=0; for(let k=0;k<4;k++){ __dbg.state.failT=0; __dbg.fail('ধপাস! ম্যানহোলে পড়ে গেছো!','test'); } __dbg.state.failT=0.01;"); await asyncio.sleep(6)
        await pg.screenshot(path=OUT+name+'5_end.png')
        print(name,'end on:', await ev("document.getElementById('endScreen').classList.contains('on')"))
    print(name, '\n'.join(errs[:10]) or 'NO ERRORS')
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)
        which=sys.argv[1]
        if which=='land': await run(b,'d',844,390,True)
        else: await run(b,'e',390,844,False)
        await b.close()
asyncio.run(main())
