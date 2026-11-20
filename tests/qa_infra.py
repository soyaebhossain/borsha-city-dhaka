import asyncio, base64
from playwright.async_api import async_playwright
OUT='shots/'
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
VIEW="""(()=>{ const D=__dbg, c=D.camera; D.state.paused=true; c.position.set(%s); c.lookAt(%s); c.updateMatrixWorld(); D.renderer.render(D.scene,c); return D.renderer.domElement.toDataURL('image/jpeg',.85); })()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
        pg=await b.new_page(viewport={'width':1280,'height':720}); errs=[]
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_function('window.__ready===true',timeout=200000); await asyncio.sleep(1)
        ev=pg.evaluate
        await pg.wait_for_function("!!document.getElementById('contBtn')",timeout=30000)
        await ev("__dbg.SAVE.profile.tut=true; document.getElementById('contBtn').click()"); await asyncio.sleep(3)
        await ev("__dbg.renderer.setPixelRatio(1); __dbg.renderer.setSize(1280,720,false); __dbg.state.clock=11*3600;")
        print('decks:', await ev("JSON.stringify(__dbg.DECKS.map(d=>[d.id,Math.round(d.L)]))"), 'trains', await ev("__dbg.INFRA.trains.length"), 'deckCars', await ev("__dbg.INFRA.deckCars.length"))
        R="(k)=>-962+k*74"
        views=[('i1_tejgaon','roadC(10.6)+0,70,roadC(13.6)','roadC(12.3),4,roadC(11.6)'),('i2_metro','roadC(10)+40,26,roadC(11)+30','roadC(10),10,roadC(10.5)'),
               ('i3_kuril','roadC(13.4),45,roadC(11.6)','roadC(15.5),5,roadC(9.6)'),('i4_under','roadC(12)+5,1.7,roadC(12)+30','roadC(12)-2,9,roadC(11.3)'),
               ('i5_turag','roadC(8.5),40,roadC(8.4)','roadC(8),8,roadC(7)'),('i6_hanif','roadC(12.4),38,roadC(18)','roadC(14),4,roadC(16.6)'),('i7_kalshi','roadC(11.5),22,roadC(10)','roadC(11.3),3,roadC(9)')]
        for name,pos,look in views:
            js=VIEW%(pos,look); js=js.replace('roadC(','((k)=>-962+k*74)(')
            url=await ev(js); open(OUT+name+'.jpg','wb').write(base64.b64decode(url.split(',')[1]))
        # drive test onto exp1 ramp
        r=await ev("""(()=>{ const D=__dbg.DECKS[0], q=__dbg.deckAt(D,D.s0), h=Math.atan2(q.tx,q.tz); const x=q.x-q.tx*18, z=q.z-q.tz*18;
            const v=__dbg.makeVehicle('car',x-q.tz*1.2,z+q.tx*1.2,h); __dbg.player.x=x+2; __dbg.player.z=z; __dbg.state.paused=false; __dbg.tryEnterExit(); return JSON.stringify({inVeh:!!__dbg.player.inVeh,ORIGIN_check:-962}); })()""")
        print('enter car:', r)
        await pg.keyboard.down('KeyW')
        for t in range(8):
            await asyncio.sleep(2.5)
            print('drive', t, await ev("(()=>{const v=__dbg.player.inVeh; return JSON.stringify({deck:v&&v.deck&&v.deck.id,y:v&&+(v.y||0).toFixed(2),s:v&&v.deckS&&Math.round(v.deckS),spd:v&&+v.spd.toFixed(1),fps:+__dbg.PERF.fps.toFixed(1)})})()"))
        await pg.keyboard.up('KeyW')
        await pg.screenshot(path=OUT+'i8_ondeck.png')
        await ev("__dbg.state.paused=false"); await pg.keyboard.press('KeyM'); await asyncio.sleep(1.5); await pg.screenshot(path=OUT+'i9_map.png')
        print('\n'.join(errs[:10]) or 'NO ERRORS'); await b.close()
asyncio.run(main())
