# বর্ষা সিটি: ঢাকা 🌧️🛺

বৃহত্তর ঢাকায় সেট করা GTA-ধাঁচের ওপেন-ওয়ার্ল্ড গেম, যা ব্রাউজারে (মোবাইল + পিসি) আর অ্যান্ড্রয়েড অ্যাপে চলে।
স্পোর্টস কারের বদলে সিএনজি-লেগুনা, পুলিশ চেজের বদলে উত্তরার জ্যাম, আর মূল মিশন: বৃষ্টির দিনে খোলা ম্যানহোলে না পড়ে বেঁচে থাকা।

> A GTA-style open-world browser game set in Greater Dhaka, built with three.js. Runs on mobile and desktop browsers, offline as a single HTML file, and as an Android APK.

## খেলো
- **অনলাইন:** https://claude.ai/artifact/KU2QG4GQVf5466rt6BeGjC
- **অফলাইন:** `dist/borsha-city-dhaka.html` নামিয়ে ব্রাউজারে খোলো (ইন্টারনেট লাগে না)
- **অ্যান্ড্রয়েড:** `dist/borsha-city-dhaka.apk` (Android 7+, আপডেট করা Android System WebView লাগবে)
- **লোকাল সার্ভার:** `cd game && python3 -m http.server 8765` → http://localhost:8765

## যা যা আছে
- তিন নায়ক: রাফি (সিএনজি চালক), মিতু (ফুড ডেলিভারি), জামাল চাচা (লেগুনা স্ট্যান্ড)
- বৃহত্তর ঢাকার ম্যাপ: কেরানীগঞ্জ থেকে গাজীপুর, নারায়ণগঞ্জ থেকে নরসিংদী; ইনার রিং রোড
- উড়ালসড়ক: ঢাকা এলিভেটেড এক্সপ্রেসওয়ে, ঢাকা–আশুলিয়া এলিভেটেড, ৭টা ফ্লাইওভার, ৫টা ওভারপাস (গাড়ি নিয়ে ওঠা যায়)
- মেট্রো: MRT-6 (উড়াল, চালু), MRT-1 ও MRT-5 (পাতাল + উড়াল অংশ, নির্মাণাধীন), MRT-2/4 পরিকল্পিত (ম্যাপে)
- বস ফাইট "ঢাকনা সিন্ডিকেট", ছিনতাই, মারামারি, অস্ত্র, হেলিকপ্টার/প্লেন, ওয়ান্টেড লেভেল
- বৃষ্টি, বন্যা, খোলা ম্যানহোল, দিন-রাত
- সেভ, XP-লেভেল, কয়েন, অর্জন, দৈনিক চ্যালেঞ্জ, কঠিনতা, কী-রিম্যাপ, বাংলা ভয়েস

## কন্ট্রোল (পিসি)
`W A S D` চালানো/হাঁটা · `Shift` দৌড় · `Space` ব্রেক · `F` গাড়িতে ওঠা/নামা · `J`/ক্লিক ঘুষি-গুলি · `G` ছিনতাই · `Q` অস্ত্র · `H` হর্ন · `M` ম্যাপ · `Tab` নায়ক বদল · `Esc` বিরতি
(সেটিংস → কন্ট্রোল থেকে কী বদলানো যায়। মোবাইলে টাচ জয়স্টিক।)

## ফোল্ডার
| ফোল্ডার | কী আছে |
|---|---|
| `game/` | খেলার ওয়েব ভার্সন (index.html + three.js + ফন্ট) — এটাই অনলাইনে চলে |
| `src/base/` | মূল ইঞ্জিন (v7) |
| `src/upgrade/` | আপগ্রেড: মেনু/সেভ/সেটিংস (`meta.js`), বস ফাইট (`boss.js`), উড়ালসড়ক ও মেট্রো (`infra.js`), UI, আর `patch.py` যা এগুলো জুড়ে `game/index.html` বানায় |
| `tools/` | `build_single.py` (অফলাইন এক-ফাইল), `build_apk.sh` (APK) |
| `android/` | WebView অ্যাপ: বাংলা TTS, ব্যাক বাটন, ব্যাকআপ সেভ |
| `dist/` | তৈরি করা ফাইল: অফলাইন HTML ও APK |
| `tests/` | Playwright QA স্ক্রিপ্ট (মেনু, সেভ, মোবাইল, বস, উড়ালসড়ক) |

## বিল্ড
```bash
python3 src/upgrade/patch.py        # src → game/index.html
python3 tools/build_single.py       # game/ → dist/borsha-city-dhaka.html
KS_PASS=yourpassword tools/build_apk.sh   # dist html → dist/borsha-city-dhaka.apk
```
APK আপডেট বসাতে হলে প্রতিবার একই keystore দিয়ে সাইন করতে হবে। keystore কখনো রিপোতে রাখবে না।

## ক্রেডিট ও লাইসেন্স
- [three.js](https://threejs.org) — MIT License
- ফন্ট: Hind Siliguri, Baloo Da 2 ([Fontsource](https://fontsource.org)) — SIL Open Font License 1.1
- সব চরিত্র, কোম্পানি ও বাসের নাম কাল্পনিক/প্যারোডি। এটি একটি ফ্যান-মেড প্যারোডি গেম; Rockstar Games বা GTA-এর সাথে কোনো সম্পর্ক নেই এবং তাদের কোনো অ্যাসেট এতে ব্যবহার করা হয়নি।
