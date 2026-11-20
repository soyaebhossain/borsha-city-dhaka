import base64,json,re,os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
s=open('game/index.html').read()
b64=lambda p: base64.b64encode(open(p,'rb').read()).decode()
old='<script type="importmap">{"imports":{"three":"./three.module.min.js","three/addons/":"./addons/"}}</script>'
assert old in s
im={"imports":{"three":"data:text/javascript;base64,"+b64('game/three.module.min.js'),"three/addons/utils/BufferGeometryUtils.js":"data:text/javascript;base64,"+b64('game/addons/utils/BufferGeometryUtils.js'),"three/addons/geometries/RoundedBoxGeometry.js":"data:text/javascript;base64,"+b64('game/addons/geometries/RoundedBoxGeometry.js')}}
s=s.replace(old,'<script type="importmap">'+json.dumps(im)+'</script>')
n=[0]
def font(m): n[0]+=1; return 'url(data:font/woff2;base64,'+b64('game/'+m.group(1))+')'
s=re.sub(r"url\((fonts/[a-z0-9-]+\.woff2)\)",font,s)
assert 'fonts/' not in re.sub(r'data:[^)]*','',s.split('<script type="module">')[0]), 'unresolved font url'
open('dist/borsha-city-dhaka.html','w').write(s)
print('fonts inlined',n[0],'size',len(s.encode())/1e6,'MB')
