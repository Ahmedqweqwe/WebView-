/**
 * Android Source Code Templates and Code Generators
 * Designed in Arabic for the copy-paste hub.
 */

export interface CodeGeneratorOptions {
  blockedDomains: string[];
  saveDirectory: 'Downloads' | 'Music';
  packageName: string;
  useNotification: boolean;
  blockCounter: number;
}

export function generateMainActivity(options: CodeGeneratorOptions): string {
  const { blockedDomains, saveDirectory, packageName, useNotification } = options;
  
  // Format the blocked domains array as a Java string array
  const domainsJavaArray = blockedDomains
    .map(domain => `        "${domain}"`)
    .join(",\n");

  const directoryType = saveDirectory === 'Downloads' 
    ? 'Environment.DIRECTORY_DOWNLOADS' 
    : 'Environment.DIRECTORY_MUSIC';

  return `package ${packageName};

import android.Manifest;
import android.app.DownloadManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.io.ByteArrayInputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private WebView webView;
    private ProgressBar progressBar;
    private FloatingActionButton fabDownload;

    // قائمة الاستضافة (Domains) المعروفة لبث الإعلانات ليتم تصفيتها وحجبها
    private final List<String> adDomains = new ArrayList<>(Arrays.asList(
${domainsJavaArray}
    ));

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ربط عناصر الواجهة الرسمية
        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        fabDownload = findViewById(R.id.fabDownload);

        // إعداد الـ WebView وتفعيل الخصائص اللازمة لتشغيل اليوتيوب بسلاسة
        setupWebView();

        // إعداد زر التحميل وفحص الرابط الحالي
        fabDownload.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String currentUrl = webView.getUrl();
                if (currentUrl != null && (currentUrl.contains("youtube.com") || currentUrl.contains("youtu.be"))) {
                    // التحقق من صلاحيات التخزين قبل بدء التحميل
                    if (checkStoragePermission()) {
                        startMp3Extraction(currentUrl);
                    } else {
                        requestStoragePermission();
                    }
                } else {
                    Toast.makeText(MainActivity.this, "يرجى فتح فيديو يوتيوب أولاً لتتمكن من تحميله!", Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true); // تفعيل جافا سكريبت ضروري جداً لليوتيوب
        webSettings.setDomStorageEnabled(true); // تفعيل التخزين المؤقت المحلي
        webSettings.setDatabaseEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false); // تشغيل تلقائي للفيديو

        // تفعيل تسريع الرسوميات البرمجية لزيادة أداء تشغيل الفيديو
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // تعيين WebViewClient مخصص يحتوي على ميزة حجب الإعلانات المتقدمة
        webView.setWebViewClient(new MyWebViewClient());

        // تحميل موقع يوتيوب بإصدار الهواتف المحمولة
        webView.loadUrl("https://m.youtube.com");
    }

    /**
     * فئة WebViewClient محسّنة للتحقق من جميع اتصالات العناصر وفلترتها لحجب الإعلانات
     */
    private class MyWebViewClient extends WebViewClient {

        @Override
        public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            progressBar.setVisibility(View.VISIBLE); // إظهار مؤشر التحميل
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            progressBar.setVisibility(View.GONE); // إخفاء مؤشر التحميل
            
            // حقن كود جافا سكريبت لإخفاء الإعلانات التي تظهر على شكل حاويات مرئية في صفحة يوتيوب
            hideAdElementsInPage(view);
        }

        // للهواتف الحديثة (Android 5.0+)
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            if (isAdUrl(url)) {
                // إرجاع استجابة فارغة فوراً لقطع الاتصال بخادم الإعلان ومنع تحميله
                return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream("".getBytes()));
            }
            return super.shouldInterceptRequest(view, request);
        }

        // لدعم الهواتف الأقدم من Android 5.0
        @SuppressWarnings("deprecation")
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            if (isAdUrl(url)) {
                return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream("".getBytes()));
            }
            return super.shouldInterceptRequest(view, url);
        }
    }

    /**
     * دالة فحص رابط الاستدعاء ومقارنته بالخوادم المدرجة في القائمة السوداء لفلترة الإعلانات
     */
    private boolean isAdUrl(String url) {
        try {
            URL urlObj = new URL(url);
            String host = urlObj.getHost().toLowerCase();
            for (String adDomain : adDomains) {
                if (host.contains(adDomain) || url.contains(adDomain)) {
                    return true; // تم التعرف عليه كإعلان!
                }
            }
        } catch (MalformedURLException e) {
            // تجاهل الروابط غير الصالحة كالأكواد البرمجية المدمجة
        }
        return false;
    }

    /**
     * حقن جافا سكريبت لإخفاء طبقات الإعلانات المرئية التي قد لا يتم اعتراض روابطها مباشرة
     */
    private void hideAdElementsInPage(WebView view) {
        // إعداد أكواد CSS لإخفاء عناصر الإعلانات في يوتيوب (العناصر الدعائية والمقاطع المروجة)
        String cssHideSelector = "ytm-promoted-sparkles-web-renderer, " +
                ".ad-container, .ad-div, " +
                ".video-ads, .ytp-ad-module, " +
                "ytm-companion-card-ad-renderer";
        
        String jsCode = "javascript:(function() { " +
                "var style = document.createElement('style');" +
                "style.type = 'text/css';" +
                "style.innerHTML = '" + cssHideSelector + " { display: none !important; }';" +
                "document.getElementsByTagName('head')[0].appendChild(style);" +
                "})()";
        
        view.evaluateJavascript(jsCode, null);
    }

    /**
     * دالة معالجة رابط يوتيوب واستخراج معرف الفيديو وإرساله لخادم التحويل إلى MP3 بأسلوب آمن
     */
    private void startMp3Extraction(String videoUrl) {
        // استخراج الـ ID من الرابط: مثال https://www.youtube.com/watch?v=dQw4w9WgXcQ
        String videoId = extractVideoId(videoUrl);
        
        if (videoId == null || videoId.isEmpty()) {
            Toast.makeText(this, "فشل استخراج معرف الفيديو من الرابط الحالي!", Toast.LENGTH_SHORT).show();
            return;
        }

        Toast.makeText(this, "جاري تحضير ملف الـ MP3، يرجى الانتظار...", Toast.LENGTH_SHORT).show();

        // واجهة برمجية آمنة ومجانية وموثوقة لتحويل الفيديوهات إلى ملف صوتي MP3
        // نستخدم خادم تحويل ذائع الصيت ومستقر لمعالجة التحويل
        String mp3DownloadApiUrl = "https://api.vevioz.com/api/button/mp3/" + videoId;
        String fileName = "YouTube_Audio_" + videoId + ".mp3";

        // إطلاق دالة التحميل والتشغيل باستخدام مدير التحميلات الرسمي بالواجهة البرمجية في الأندرويد
        downloadFile(mp3DownloadApiUrl, fileName);
    }

    private String extractVideoId(String url) {
        if (url == null || url.isEmpty()) return null;
        
        String videoId = null;
        if (url.contains("v=")) {
            int index = url.indexOf("v=");
            int end = url.indexOf("&", index);
            if (end == -1) {
                videoId = url.substring(index + 2);
            } else {
                videoId = url.substring(index + 2, end);
            }
        } else if (url.contains("youtu.be/")) {
            int index = url.indexOf("youtu.be/");
            int end = url.indexOf("?", index);
            if (end == -1) {
                videoId = url.substring(index + 9);
            } else {
                videoId = url.substring(index + 9, end);
            }
        }
        return videoId;
    }

    /**
     * معالجة وبدء تنزيل ملف الـ MP3 المستخرج إلى الذاكرة المحلية عبر الـ DownloadManager الخاص بالنظام
     */
    private void downloadFile(String downloadUrl, String fileName) {
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(downloadUrl));
        request.setTitle("تحميل صوت MP3 لليوتيوب");
        request.setDescription("جاري تحميل الملف الصوتي المستخرج من اليوتيوب...");
        
        // إعداد الإشعار بالتنزيل
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
            request.allowScanningByMediaScanner();
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        }

        // تحديد مسار حفظ الملف في الذاكرة الخارجية بجهاز الأندرويد
        request.setDestinationInExternalPublicDir(${directoryType}, fileName);

        // جلب مدير تنزيل الملفات وبدء التنزيل بالخلفية تلقائياً
        DownloadManager downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
        if (downloadManager != null) {
            downloadManager.enqueue(request);
            Toast.makeText(this, "بدأ تنزيل ملف الـ MP3! تفقّد الإشعارات لمتابعة التقدم.", Toast.LENGTH_LONG).show();
        } else {
            Toast.makeText(this, "خطأ: تعذر الوصول إلى مدير التنزيل في جهازك!", Toast.LENGTH_LONG).show();
        }
    }

    // التحقق من صلاحيات التخزين للهاتف
    private boolean checkStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // في الأندرويد 10+ لا تحتاج لإذن صريح لمجلدات التحميل العامة باستخدام Scoped Storage
            return true;
        }
        int writePermission = ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        return writePermission == PackageManager.PERMISSION_GRANTED;
    }

    // طلب صلاحية التخزين من المستخدم
    private void requestStoragePermission() {
        ActivityCompat.requestPermissions(
                this,
                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                PERMISSION_REQUEST_CODE
        );
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "تم منح الصلاحية! انقر على زر التحميل مجدداً.", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "عذراً، يجب إعطاء صلاحية التخزين لنتمكن من حفظ ملفات الـ MP3!", Toast.LENGTH_LONG).show();
            }
        }
    }

    /**
     * دعم زر الرجوع الفعلي للهاتف للتنقل داخل موقع اليوتيوب بدلاً من إغلاق التطبيق فوراً
     */
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;
}

export function generateActivityMainXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.tools.com/tools"
    android:id="@+id/coordinatorLayout"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <!-- حاوية الـ WebView للتصفح وعرض الفيديوهات -->
    <RelativeLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

        <!-- مؤشر التقدم الدائري في منتصف الواجهة يظهر عند بداية تحميل الصفحات -->
        <ProgressBar
            android:id="@+id/progressBar"
            style="?android:attr/progressBarStyleLarge"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_centerInParent="true"
            android:indeterminateTint="#FF0000"
            android:visibility="gone" />

    </RelativeLayout>

    <!-- الزر العائم (Floating Action Button) مخصص لتحميل الفيديو واستخراج الصوت -->
    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fabDownload"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|end"
        android:layout_margin="16dp"
        android:contentDescription="تحميل بصيغة MP3"
        android:src="@android:drawable/stat_sys_download"
        app:backgroundTint="#FF0000"
        app:rippleColor="#FFFFFF"
        app:tint="#FFFFFF"
        app:elevation="6dp"
        app:pressedTranslationZ="12dp" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>`;
}

export function generateAndroidManifest(options: { packageName: string }): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${options.packageName}">

    <!-- الأذونات والصلاحيات الأساسية المطلوبة للتطبيق -->
    
    <!-- إذن الاتصال بالإنترنت لعرض اليوتيوب وتحميل الملفات -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- إذن فحص حالة الشبكة والاتصال بالواي فاي -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- إذن حفظ ملفات الصوت في ذاكرة الهاتف الخارجية للأجهزة القديمة (دون الـ SDK 33) -->
    <uses-permission 
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    
    <!-- إذن قراءة ملفات الصوت للميديا -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="يوتيوب بلا إعلانات"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MaterialComponents.Light.NoActionBar"
        android:usesCleartextTraffic="true"> <!-- تفعيل حركة المرور النصية الصريحة لدعم واجهات تحميل الـ MP3 غير المرمزة بـ SSL -->

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"> <!-- منع إعادة تحميل الهيكل عند دوران الشاشة لتفادي توقف الفيديو -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>`;
}

export function generateBuildGradle(): string {
  return `// ملف الإعدادات الخاص بالتطبيق (app-level build.gradle)

plugins {
    id 'com.android.application'
}

android {
    compileSdk 34

    defaultConfig {
        applicationId "com.example.youtube.webview"
        minSdk 21  // يدعم أكثر من 98% من الهواتف النشطة
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    
    // من أجل ميزات برمجية اختيارية أو واجهات حديثة
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`;
}

export function generateColorsXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primaryColor">#FF0000</color> <!-- اللون الأحمر الرسمي لزر التحميل وطابع اليوتيوب -->
    <color name="primaryLightColor">#FF3333</color>
    <color name="primaryDarkColor">#CC0000</color>
    <color name="secondaryColor">#212121</color>
    <color name="secondaryLightColor">#484848</color>
    <color name="secondaryDarkColor">#000000</color>
    <color name="primaryTextColor">#FFFFFF</color>
    <color name="secondaryTextColor">#CCCCCC</color>
</resources>`;
}

export function generateThemesXml(): string {
  return `<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- الثيم الأساسي للتطبيق بدون شريط العنوان للملء الكامل للشاشة -->
    <style name="Theme.YouTubeWebView" parent="Theme.MaterialComponents.Light.NoActionBar">
        <!-- ألوان التطبيق من ملف colors.xml -->
        <item name="colorPrimary">@color/primaryColor</item>
        <item name="colorPrimaryVariant">@color/primaryDarkColor</item>
        <item name="colorOnPrimary">@color/primaryTextColor</item>
        <!-- ألوان الخلفية وحالة الشريط العلوي -->
        <item name="android:statusBarColor">#000000</item> <!-- جعل شريط الحالة أسود ليطابق بيئة الفيديو -->
        <item name="android:windowLightStatusBar" tools:targetApi="m">false</item>
    </style>
</resources>`;
}

// Mock videos list for the simulator
export interface MockVideo {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumbnailUrl: string;
  hasAd: boolean;
  adText?: string;
}

export const MOCK_VIDEOS: MockVideo[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    channel: "Rick Astley",
    views: "1.4B views",
    duration: "3:32",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400",
    hasAd: true,
    adText: "إعلان مدفوع من قِبل Google Ads"
  },
  {
    id: "y6120QOlsfU",
    title: "تعلم برمجة تطبيقات الأندرويد في 10 دقائق فقط - للمبتدئين",
    channel: "عالم الأندرويد العربي",
    views: "250K views",
    duration: "10:15",
    thumbnailUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=400",
    hasAd: false
  },
  {
    id: "kJQP7kiw5Fk",
    title: "أسرار تطوير الـ Java والـ WebView في بيئة Android Studio",
    channel: "أكاديمية المبرمجين",
    views: "89K views",
    duration: "18:40",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400",
    hasAd: true,
    adText: "إعلان هاتف ذكي ذو رعاية ممولة"
  },
  {
    id: "L_LUpnjgPso",
    title: "موسيقى هادئة للاسترخاء والتركيز أثناء البرمجة والدراسة",
    channel: "صوت الطبيعة",
    views: "2.1M views",
    duration: "1:00:00",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=400",
    hasAd: false
  }
];
