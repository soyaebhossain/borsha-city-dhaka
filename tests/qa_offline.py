import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width':1280,'height':720})
        errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file://'+__import__('os').path.abspath('dist/borsha-city-dhaka.html')+'')
        try:
            await pg.wait_for_function('window.__ready===true', timeout=200000); print('file:// ready OK')
        except Exception: print('NOT READY')
        print('\n'.join(errs[:5])); await b.close()
asyncio.run(main())
