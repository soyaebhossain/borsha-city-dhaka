#!/bin/bash
# Builds dist/borsha-city-dhaka.apk from dist/borsha-city-dhaka.html (run tools/build_single.py first).
# Needs (Ubuntu): sudo apt install aapt apksigner zipalign android-sdk-platform-23 dalvik-exchange default-jdk
# Signing: KS_PASS=<password> [KEYSTORE=path.jks] tools/build_apk.sh   — the keystore is never committed.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT/android"
SDK=${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}
KEYSTORE=${KEYSTORE:-$ROOT/android/borsha-release.jks}
: "${KS_PASS:?set KS_PASS to the keystore password}"
rm -rf obj bin gen && mkdir -p obj bin gen assets
python3 - "$ROOT" <<'PY'
import sys; R=sys.argv[1]
s=open(R+'/dist/borsha-city-dhaka.html',encoding='utf-8').read(); shim=open(R+'/android/shim.html',encoding='utf-8').read()
a='<meta charset="utf-8">'; assert a in s
open(R+'/android/assets/index.html','w',encoding='utf-8').write(s.replace(a,a+'\n'+shim,1))
PY
aapt package -f -m -J gen -M AndroidManifest.xml -S res -I "$SDK"
javac -nowarn -Xlint:-options -source 8 -target 8 -encoding UTF-8 -bootclasspath "$SDK" -classpath "$SDK" -d obj src/com/borshacity/dhaka/MainActivity.java gen/com/borshacity/dhaka/R.java
dalvik-exchange --dex --output=bin/classes.dex obj
aapt package -f -M AndroidManifest.xml -S res -A assets -I "$SDK" -F bin/unsigned.apk
(cd bin && aapt add -f unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 bin/unsigned.apk bin/aligned.apk
[ -f "$KEYSTORE" ] || keytool -genkeypair -keystore "$KEYSTORE" -storepass "$KS_PASS" -keypass "$KS_PASS" -alias borsha -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Borsha City Dhaka, O=Borsha City, C=BD"
apksigner sign --ks "$KEYSTORE" --ks-pass env:KS_PASS --key-pass env:KS_PASS --ks-key-alias borsha --min-sdk-version 24 --out "$ROOT/dist/borsha-city-dhaka.apk" bin/aligned.apk
rm -f "$ROOT/dist/borsha-city-dhaka.apk.idsig"
apksigner verify "$ROOT/dist/borsha-city-dhaka.apk" && echo "APK OK: dist/borsha-city-dhaka.apk"
