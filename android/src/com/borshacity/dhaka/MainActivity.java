package com.borshacity.dhaka;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Borsha City: Dhaka — offline WebView shell. The whole game lives in assets/index.html. */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/index.html";
    private static final int FILE_REQ = 7;

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false, bnOk = false;
    private int ttsSeq = 0;
    private long lastBack = 0;
    private ValueCallback<Uri[]> fileCb;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        try {   // draw under the camera notch (API 28+), set by reflection because we compile against API 23
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.getClass().getField("layoutInDisplayCutoutMode").setInt(lp, 1);
            getWindow().setAttributes(lp);
        } catch (Throwable ignored) { }

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);

        web.addJavascriptInterface(new TtsBridge(), "AndroidTTS");
        web.addJavascriptInterface(new AppBridge(), "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return serve(req.getUrl());
            }
            // API 24+ variant (compiled against API 23, so no @Override); the String variant covers older WebViews
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) { return openOutside(req.getUrl()); }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) { return openOutside(Uri.parse(url)); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try { startActivityForResult(Intent.createChooser(i, "ব্যাকআপ ফাইল বাছো"), FILE_REQ); }
                catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });

        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override public void onInit(int status) {
                if (status != TextToSpeech.SUCCESS || tts == null) return;
                Locale[] tries = { new Locale("bn", "BD"), new Locale("bn", "IN"), new Locale("bn") };
                for (Locale l : tries) {
                    int r = tts.setLanguage(l);
                    if (r >= TextToSpeech.LANG_AVAILABLE) { bnOk = true; break; }
                }
                ttsReady = true;
            }
        });

        if (state != null) web.restoreState(state); else web.loadUrl(START);
        hideBars();
    }

    /** Serves files from assets/ under https://appassets.androidplatform.net/ so the page gets a normal https origin. */
    private WebResourceResponse serve(Uri u) {
        if (!HOST.equals(u.getHost())) return null;
        String path = u.getPath();
        if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
        String mime = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "text/javascript"
                : path.endsWith(".woff2") ? "font/woff2" : path.endsWith(".png") ? "image/png"
                : path.endsWith(".json") ? "application/json" : "application/octet-stream";
        Map<String, String> h = new HashMap<String, String>();
        h.put("Cache-Control", "no-cache");
        try {
            InputStream in = getAssets().open(path.substring(1));
            return new WebResourceResponse(mime, "utf-8", 200, "OK", h, in);
        } catch (Exception e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, null);
        }
    }

    private boolean openOutside(Uri u) {
        if (HOST.equals(u.getHost()) || "data".equals(u.getScheme()) || "blob".equals(u.getScheme())) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
        return true;
    }

    private void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideBars(); }

    /** Back = the game's Esc (pause / close a menu). On the home screen, press twice to leave. */
    @Override public void onBackPressed() {
        web.evaluateJavascript("(function(){var h=document.getElementById('home');var onHome=!!(h&&h.classList.contains('on'));"
                + "if(!onHome){var e=new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true});window.dispatchEvent(e);}return onHome;})()",
            new ValueCallback<String>() {
                @Override public void onReceiveValue(String onHome) {
                    if (!"true".equals(onHome)) return;
                    long now = System.currentTimeMillis();
                    if (now - lastBack < 2000) finish();
                    else { lastBack = now; Toast.makeText(MainActivity.this, "বের হতে আবার চাপো", Toast.LENGTH_SHORT).show(); }
                }
            });
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ && fileCb != null) {
            Uri[] r = null;
            if (res == RESULT_OK && data != null && data.getData() != null) r = new Uri[]{ data.getData() };
            fileCb.onReceiveValue(r); fileCb = null; return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override protected void onPause() { super.onPause(); if (tts != null) tts.stop(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); hideBars(); }
    @Override protected void onDestroy() {
        if (tts != null) { tts.shutdown(); tts = null; }
        if (web != null) { web.destroy(); }
        super.onDestroy();
    }

    /** Bangla speech through the phone's own text-to-speech engine (WebView has no speechSynthesis). */
    public class TtsBridge {
        @JavascriptInterface public boolean hasBangla() { return bnOk; }
        @JavascriptInterface public boolean isSpeaking() { return tts != null && tts.isSpeaking(); }
        @JavascriptInterface public void speak(String text, String lang, float pitch, float rate, float vol) {
            if (tts == null || !ttsReady || !bnOk || text == null) return;
            tts.setPitch(Math.max(.5f, Math.min(2f, pitch)));
            tts.setSpeechRate(Math.max(.5f, Math.min(2f, rate)));
            Bundle p = new Bundle();
            p.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, Math.max(0f, Math.min(1f, vol)));
            tts.speak(text, TextToSpeech.QUEUE_ADD, p, "u" + (ttsSeq++));
        }
        @JavascriptInterface public void stop() { if (tts != null) tts.stop(); }
    }

    /** Save backups to the phone's Download folder (Android 10+), otherwise hand them to the share sheet. */
    public class AppBridge {
        @JavascriptInterface public String saveText(String name, String text) {
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    ContentValues v = new ContentValues();
                    v.put("_display_name", name);
                    v.put("mime_type", "application/json");
                    v.put("relative_path", "Download/");
                    Uri uri = getContentResolver().insert(Uri.parse("content://media/external/downloads"), v);
                    if (uri != null) {
                        OutputStream os = getContentResolver().openOutputStream(uri);
                        os.write(text.getBytes("UTF-8")); os.close();
                        return "saved:Download";
                    }
                } catch (Exception ignored) { }
            }
            final String n = name, t = text;
            runOnUiThread(new Runnable() { @Override public void run() {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_SUBJECT, n);
                i.putExtra(Intent.EXTRA_TEXT, t);
                try { startActivity(Intent.createChooser(i, "ব্যাকআপ রেখে দাও")); } catch (Exception ignored) { }
            }});
            return "shared";
        }
    }
}
