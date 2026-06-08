import React, { useState, useEffect } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  Settings,
  X,
  Plus,
  Play,
  RotateCcw,
  Terminal,
  Smartphone,
  Shield,
  ShieldAlert,
  Folder,
  Bell,
  Heart,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Layers,
  HelpCircle,
  Eye,
  Info
} from 'lucide-react';
import {
  generateMainActivity,
  generateActivityMainXml,
  generateAndroidManifest,
  generateBuildGradle,
  generateColorsXml,
  generateThemesXml,
  MOCK_VIDEOS,
  MockVideo,
  CodeGeneratorOptions
} from './androidCodeData';

export default function App() {
  // 1. App configuration state
  const [packageName, setPackageName] = useState<string>('com.example.youtube.webview');
  const [saveDirectory, setSaveDirectory] = useState<'Downloads' | 'Music'>('Downloads');
  const [blockedDomains, setBlockedDomains] = useState<string[]>([
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'youtube.com/pagead',
    'adservice.google.com',
    'zedo.com',
    'clickasegura.com',
    'adform.net',
    'serving-sys.com'
  ]);
  const [newDomain, setNewDomain] = useState<string>('');
  const [useNotification, setUseNotification] = useState<boolean>(true);

  // 2. Interactive state
  const [activeTab, setActiveTab] = useState<'java' | 'xml' | 'manifest' | 'gradle' | 'colors' | 'themes'>('java');
  const [copied, setCopied] = useState<boolean>(false);
  const [adBlockedCount, setAdBlockedCount] = useState<number>(14);

  // 3. Simulator states
  const [simulatorAdBlockEnabled, setSimulatorAdBlockEnabled] = useState<boolean>(true);
  const [activeVideo, setActiveVideo] = useState<MockVideo>(MOCK_VIDEOS[0]);
  const [simulatorUrl, setSimulatorUrl] = useState<string>('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
  const [logMessages, setLogMessages] = useState<Array<{ id: number; type: 'info' | 'blocked' | 'success'; text: string; time: string }>>([
    { id: 1, type: 'info', text: 'System: Initializing WebView component...', time: '11:07:22' },
    { id: 2, type: 'info', text: 'System: JavaScript and DOM storage enabled.', time: '11:07:22' },
    { id: 3, type: 'success', text: 'System: Connecting to https://m.youtube.com/', time: '11:07:23' }
  ]);
  
  // Downloader animation states
  const [downloadStep, setDownloadStep] = useState<number>(0); // 0: idle, 1: extracting, 2: connecting, 3: downloading, 4: completed
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadFileName, setDownloadFileName] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Auto scroll simulator terminal to bottom
  const terminalBottomRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logMessages, downloadStep]);

  // Handle URL change when selecting a mock video
  const handleSelectVideo = (video: MockVideo) => {
    setActiveVideo(video);
    const newUrl = `https://m.youtube.com/watch?v=${video.id}`;
    setSimulatorUrl(newUrl);
    
    // Add logs
    const currentTime = new Date().toLocaleTimeString('ar-SA', { hour12: false });
    const newLogs = [
      { id: Date.now(), type: 'info' as const, text: `WebView: Loading webpage ${newUrl}`, time: currentTime }
    ];

    if (simulatorAdBlockEnabled && video.hasAd) {
      setTimeout(() => {
        setAdBlockedCount(prev => prev + 1);
        setLogMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'blocked' as const,
            text: `AdBlocker: INTERCEPTED & BLOCKED request to ad services: ${video.adText || 'doubleclick.net/ad_stream'}`,
            time: currentTime
          },
          {
            id: Date.now() + 2,
            type: 'info' as const,
            text: `DOM: Injected CSS script to conceal visual promotional slots safely.`,
            time: currentTime
          }
        ]);
      }, 600);
    } else if (!simulatorAdBlockEnabled && video.hasAd) {
      setTimeout(() => {
        setLogMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'info' as const,
            text: `WebView: Displaying sponsored banner: "${video.adText}"`,
            time: currentTime
          }
        ]);
      }, 600);
    }

    setLogMessages(prev => [...prev, ...newLogs]);
  };

  // Run mock MP3 Downloader loop
  const handleTriggerDownload = () => {
    if (downloadStep > 0) return; // Prevent multiple clicks

    const currentTime = () => new Date().toLocaleTimeString('ar-SA', { hour12: false });
    
    // Start Extraction process
    setDownloadStep(1);
    setLogMessages(prev => [
      ...prev,
      { id: Date.now(), type: 'info', text: `Button: Floating Action Button clicked. Evaluating URL: ${simulatorUrl}`, time: currentTime() }
    ]);

    setTimeout(() => {
      // Step 2: Extracted video ID & Connecting to helper service
      setDownloadStep(2);
      const videoId = activeVideo.id;
      setLogMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'success', text: `Extractor: Successfully isolated YouTube Video ID: "${videoId}"`, time: currentTime() },
        { id: Date.now() + 1, type: 'info', text: `API: Building remote convert API hook: "https://api.vevioz.com/api/button/mp3/${videoId}"`, time: currentTime() }
      ]);
    }, 1200);

    setTimeout(() => {
      // Step 3: Downloading simulated file
      setDownloadStep(3);
      setDownloadFileName(`YouTube_Audio_${activeVideo.id}.mp3`);
      
      setToastMessage("بدأ تنزيل ملف الـ MP3! تفقّد لوحة الإشعارات.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setLogMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'info', text: `DownloadManager: Initializing system service on thread background...`, time: currentTime() },
        { id: Date.now() + 1, type: 'success', text: `DownloadManager: Request queued successfully. Destination: ${saveDirectory} folder`, time: currentTime() }
      ]);

      // Simulate progress bar timer
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setDownloadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Step 4: Finished download
          setDownloadStep(4);
          setLogMessages(prev => [
            ...prev,
            { id: Date.now(), type: 'success', text: `System: File downloaded completely. Registered in Android MediaStore as dynamic soundtrack.`, time: currentTime() }
          ]);
          
          setToastMessage(`تم اكتمال تنزيل الملف وحفظه بصيغة MP3 بنجاح!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      }, 300);
    }, 2800);
  };

  const handleResetDownloadSimulator = () => {
    setDownloadStep(0);
    setDownloadProgress(0);
  };

  // Add custom domain to list
  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().toLowerCase();
    if (cleanDomain && !blockedDomains.includes(cleanDomain)) {
      setBlockedDomains([...blockedDomains, cleanDomain]);
      setNewDomain('');
      
      const currentTime = new Date().toLocaleTimeString('ar-SA', { hour12: false });
      setLogMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'info', text: `Config: Added ad server domain block: "${cleanDomain}" to blacklisted filters.`, time: currentTime }
      ]);
    }
  };

  // Delete domain from list
  const handleRemoveDomain = (domain: string) => {
    setBlockedDomains(blockedDomains.filter(d => d !== domain));
    const currentTime = new Date().toLocaleTimeString('ar-SA', { hour12: false });
    setLogMessages(prev => [
      ...prev,
      { id: Date.now(), type: 'info', text: `Config: Suspended rule for ad server: "${domain}"`, time: currentTime }
    ]);
  };

  // Restore default domains
  const handleRestoreDefaults = () => {
    setBlockedDomains([
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'youtube.com/pagead',
      'adservice.google.com',
      'zedo.com',
      'clickasegura.com',
      'adform.net',
      'serving-sys.com'
    ]);
  };

  // Generate codes dynamically
  const generatorOptions: CodeGeneratorOptions = {
    blockedDomains,
    saveDirectory,
    packageName,
    useNotification,
    blockCounter: adBlockedCount
  };

  const codeJava = generateMainActivity(generatorOptions);
  const codeXml = generateActivityMainXml();
  const codeManifest = generateAndroidManifest({ packageName });
  const codeGradle = generateBuildGradle();
  const codeColors = generateColorsXml();
  const codeThemes = generateThemesXml();

  const getActiveCodeText = () => {
    switch (activeTab) {
      case 'java': return codeJava;
      case 'xml': return codeXml;
      case 'manifest': return codeManifest;
      case 'gradle': return codeGradle;
      case 'colors': return codeColors;
      case 'themes': return codeThemes;
    }
  };

  const getActiveFileName = () => {
    switch (activeTab) {
      case 'java': return 'MainActivity.java';
      case 'xml': return 'activity_main.xml';
      case 'manifest': return 'AndroidManifest.xml';
      case 'gradle': return 'build.gradle (Module: app)';
      case 'colors': return 'colors.xml';
      case 'themes': return 'themes.xml';
    }
  };

  const getActiveFileIcon = () => {
    switch (activeTab) {
      case 'java': return <div className="px-1.5 py-0.5 text-[10px] bg-amber-600 text-white font-bold rounded">JAVA</div>;
      case 'xml': return <div className="px-1.5 py-0.5 text-[10px] bg-blue-600 text-white font-bold rounded">XML</div>;
      case 'manifest': return <div className="px-1.5 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded">XML</div>;
      case 'gradle': return <div className="px-1.5 py-0.5 text-[10px] bg-indigo-600 text-white font-bold rounded">GRADLE</div>;
      case 'colors': return <div className="px-1.5 py-0.5 text-[10px] bg-fuchsia-600 text-white font-bold rounded">XML</div>;
      case 'themes': return <div className="px-1.5 py-0.5 text-[10px] bg-cyan-600 text-white font-bold rounded">XML</div>;
    }
  };

  // Clipboard copy handler
  const handleCopyCode = () => {
    const code = getActiveCodeText();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-red-500 selection:text-white" dir="rtl">
      {/* 🔴 Top Aesthetic Border */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 w-full" />

      {/* 🌐 Header Section */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl shadow-lg shadow-red-950/20">
              <Code2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  لوحة الأكواد التفاعلية
                </span>
                <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md">
                  Target API: Android 34 (Android 14)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-1">
                استوديو تطبيق أندرويد: يوتيوب WebView مع حجب الإعلانات واستخراج الصوت
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
            <div className="px-3 py-1 text-center">
              <p className="text-[10px] text-slate-400 font-medium leading-none">خوادم محجوبة</p>
              <p className="text-lg font-bold text-red-500 font-mono mt-0.5">{blockedDomains.length}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="px-3 py-1 text-center">
              <p className="text-[10px] text-slate-400 font-medium leading-none">إجراء محجوب بالمحاكي</p>
              <p className="text-lg font-bold text-amber-500 font-mono mt-0.5">{adBlockedCount}</p>
            </div>
          </div>

        </div>
      </header>

      {/* 📖 User Prompt Acknowledgment Message */}
      <div className="bg-gradient-to-r from-red-950/20 via-slate-900/40 to-slate-950 px-4 py-4 sm:px-6 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            أهلاً بك! لقد تم تصميم هذا المحيط خصيصاً لتفصيل الكود البرمجي لمشروعك في بيئة <strong>Android Studio (Java/XML)</strong>. يمكنك الآن تخصيص نطاق حجب الإعلانات المدمج، واختيار مجلدات حفظ ملفات الملتيميديا، ثم نسخ الكود المتولد تلقائياً بضغطة زر واحدة مجاناً وإدراجه يدوياً في مشروعك وبدء تطبيقه مباشرة!
          </p>
        </div>
      </div>

      {/* 🚀 Main Layout Grid (Controls, Code Hub, Simulator) */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= COLUMN 1: CONTROLS & SIMULATOR (5 COLS) ================= */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 🛠️ CARD 1: Customizer Tools */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Settings className="w-5 h-5 text-red-500" />
                <h2 className="text-base font-bold text-slate-100">تحكم بخصائص الكود البرمجي المتولد</h2>
              </div>

              {/* Package name parameter */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    1. رمز الحزمة الذكي للتطبيق (Package Name):
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-red-500 transition-colors"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="com.example.youtube.webview"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">يجب أن يطابق هذا السطر السطر الأول في ملف MainActivity لديك.</p>
                </div>

                {/* Save Folder selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    2. دليل ومجلد حفظ ملفات الصوتيات (MP3) المستخرجة:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSaveDirectory('Downloads')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        saveDirectory === 'Downloads'
                          ? 'bg-red-600/10 border-red-500 text-red-400 shadow-md shadow-red-950/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Folder className="w-4 h-4 shrink-0" />
                      مجلد التنزيلات (Downloads)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaveDirectory('Music')}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                        saveDirectory === 'Music'
                          ? 'bg-red-600/10 border-red-500 text-red-400 shadow-md shadow-red-950/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Folder className="w-4 h-4 shrink-0" />
                      مجلد الموسيقى (Music)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">تقوم دالة الحفظ تلقائياً بإيداع الملف في هذا القطاع لسهولة وصول برامج الصوت بالجهاز إليه.</p>
                </div>

                {/* Blacklisted domains control */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      3. الخوادم المستهدفة بالحجب (Ad Blocker Domains):
                    </label>
                    <button
                      type="button"
                      onClick={handleRestoreDefaults}
                      className="text-[10px] text-slate-400 hover:text-red-400 underline"
                    >
                      استعادة الافتراضي
                    </button>
                  </div>

                  {/* Add domain input form */}
                  <form onSubmit={handleAddDomain} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-red-500"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="e.g. adpartner.corp"
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة
                    </button>
                  </form>

                  {/* Chip elements list */}
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto bg-slate-950 border border-slate-800/80 p-2 rounded-lg scrollbar">
                    {blockedDomains.map((dom) => (
                      <span
                        key={dom}
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-900 border border-slate-800 text-red-400 px-2 py-0.5 rounded"
                      >
                        {dom}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(dom)}
                          className="hover:text-white text-slate-500 shrink-0"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">يقوم الـ <code>WebViewClient</code> باعتراض الاستدعاءات ومقارنتها بتلك الكلمات لحظر الإعلان تماماً.</p>
                </div>
              </div>
            </div>

            {/* Simulated Smartphone Preview layout */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-red-500" />
                  <h2 className="text-base font-bold text-slate-100">محاكي الهواتف المحمولة للأندرويد</h2>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded mr-2">
                  معاينة تفاعلية حية
                </span>
              </div>

              <div className="text-center mb-3">
                <p className="text-xs text-slate-300">
                  شاهد كيف سيتصرف كود الأندرويد الذي وفرناه في فحص الروابط، وحجب الإعلانات، وتحويل الصوت بثواني!
                </p>
              </div>

              {/* Simulated Phone Frame */}
              <div className="max-w-[290px] mx-auto bg-slate-950 rounded-[40px] p-3.5 border-4 border-slate-700 shadow-2xl relative">
                
                {/* Speaker pill top */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-900 rounded-b-xl flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Inner screen area */}
                <div className="rounded-[28px] overflow-hidden bg-slate-900 aspect-[9/18] relative flex flex-col border border-slate-800">
                  
                  {/* Mock System Bar */}
                  <div className="bg-black text-[9px] font-mono px-3.5 py-1 flex items-center justify-between text-slate-400 select-none shrink-0">
                    <span>11:07 AM</span>
                    <div className="flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500/20" />
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Android Native Mock App Bar */}
                  <div className="bg-[#aa0000] text-white px-3 py-1.5 flex items-center justify-between shadow-md shrink-0">
                    <span className="text-xs font-bold font-sans">يوتيوب بلا إعلانات</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold text-emerald-100 bg-emerald-950/40 px-1 py-0.2 rounded font-mono">AD-BLOCK: ON</span>
                    </div>
                  </div>

                  {/* Browser simulated Address Bar */}
                  <div className="bg-slate-800 px-2 py-1 text-[8px] font-mono border-b border-slate-700 text-slate-300 flex items-center gap-1 select-none shrink-0" dir="ltr">
                    <span className="text-[10px] text-emerald-500">🔒</span>
                    <span className="truncate flex-1">{simulatorUrl}</span>
                  </div>

                  {/* Dynamic WebView Simulated viewport */}
                  <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-2 flex flex-col gap-2 relative scrollbar-none">
                    
                    {/* Visual simulated player pane */}
                    <div className="w-full aspect-video bg-black rounded-lg border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center">
                      <img
                        src={activeVideo.thumbnailUrl}
                        alt={activeVideo.title}
                        className="w-full h-full object-cover opacity-60 absolute inset-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Play Button Icon */}
                      <span className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-all z-10 select-none">
                        <Play className="w-5 h-5 fill-white stroke-none translate-x-0.5" />
                      </span>
                      
                      {/* Video Player overlay indicators */}
                      <div className="absolute bottom-1 right-2 left-2 flex items-center justify-between text-white text-[8px] font-medium z-10">
                        <span className="bg-black/60 px-1 py-0.2 rounded truncate max-w-[150px]">{activeVideo.title}</span>
                        <span className="bg-red-600 px-1 rounded shrink-0">{activeVideo.duration}</span>
                      </div>
                    </div>

                    {/* AdBlock Switch inside simulated app */}
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between select-none shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-semibold text-slate-300">ميزة حجب الإعلانات:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatorAdBlockEnabled(!simulatorAdBlockEnabled);
                          const currentTime = new Date().toLocaleTimeString('ar-SA', { hour12: false });
                          setLogMessages(prev => [
                            ...prev,
                            { 
                              id: Date.now(), 
                              type: 'info', 
                              text: `Simulator: Ad-Blocking status changed to [${!simulatorAdBlockEnabled ? 'ENABLED' : 'DISABLED'}]`, 
                              time: currentTime 
                            }
                          ]);
                        }}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none ${
                          simulatorAdBlockEnabled ? 'bg-red-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform duration-200 ${
                            simulatorAdBlockEnabled ? '-translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Active simulated item list */}
                    <span className="text-[9px] font-bold text-slate-400 px-0.5">مستكشف الفيديوهات المقترحة لليوتيوب:</span>
                    <div className="space-y-1.5 flex-1 p-0.5">
                      {MOCK_VIDEOS.map((vid) => {
                        const isSelected = activeVideo.id === vid.id;
                        return (
                          <div
                            key={vid.id}
                            onClick={() => handleSelectVideo(vid)}
                            className={`p-1.5 rounded-lg border cursor-pointer flex gap-1.5 transition-all hover:bg-slate-900 ${
                              isSelected ? 'bg-slate-900/90 border-red-500/60' : 'bg-slate-950 border-slate-800/80'
                            }`}
                          >
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
                              className="w-14 h-9.5 object-cover rounded shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <p className="text-[8px] font-bold text-slate-200 leading-tight line-clamp-2 truncate">
                                {vid.title}
                              </p>
                              <div className="flex items-center justify-between text-[7px] text-slate-400 mt-0.5">
                                <span>{vid.channel}</span>
                                
                                {vid.hasAd && (
                                  <span className={`px-1 rounded text-[6px] font-bold ${
                                    simulatorAdBlockEnabled 
                                      ? 'bg-slate-800 text-slate-500 line-through' 
                                      : 'bg-yellow-500/15 text-yellow-500'
                                    }`}
                                  >
                                    {simulatorAdBlockEnabled ? "🚫 حظر إعلان" : "إعلان مروج"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* IN-APP SIMULATED FLOATING ACTION BUTTON (FAB) */}
                    <button
                      type="button"
                      onClick={handleTriggerDownload}
                      className={`absolute bottom-3 left-3 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-transform active:scale-95 cursor-pointer z-30 ${
                        downloadStep === 1 || downloadStep === 3 ? 'animate-bounce' : 'pulse-button'
                      }`}
                      title="أنقر لتحميل هذا الفيديو بصوت MP3"
                    >
                      <Download className="w-4.5 h-4.5 text-white" />
                    </button>

                  </div>

                  {/* Simulated Downloader progress banner */}
                  {downloadStep > 0 && (
                    <div className="bg-slate-950 border-t border-slate-800 p-2 text-[8.5px] text-slate-300 z-40 select-none shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200 truncate max-w-[120px]">
                          {downloadStep === 1 && "🔍 جاري فحص الرابط ومسحه..."}
                          {downloadStep === 2 && "📡 جاري إنشاء رابط التحويل..."}
                          {downloadStep === 3 && `⏳ جاري تحميل: ${downloadFileName}`}
                          {downloadStep === 4 && "✅ تم التنزيل والحفظ بنجاح!"}
                        </span>
                        {downloadStep === 3 && (
                          <span className="font-mono text-emerald-400">{downloadProgress}%</span>
                        )}
                        {downloadStep === 4 && (
                          <button
                            onClick={handleResetDownloadSimulator}
                            className="text-red-500 hover:text-white underline text-[8px]"
                          >
                            تصفير
                          </button>
                        )}
                      </div>

                      {/* Simulated Download Progress Bar */}
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            downloadStep === 4 ? 'bg-emerald-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${downloadStep === 4 ? 100 : downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Toast Popups inside the simulator */}
                  {showToast && (
                    <div className="absolute bottom-16 left-3 right-3 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-[8px] text-slate-100 shadow-xl z-50 text-wrap leading-tight text-center animate-fade-in-up">
                      🔔 {toastMessage}
                    </div>
                  )}

                </div>
              </div>

              {/* Logcat Simulator / Terminal */}
              <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-red-500" />
                    مخرجات السجلات التفاعلية (Android Logcat)
                  </span>
                  <button
                    onClick={() => setLogMessages([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300"
                  >
                    تفريع
                  </button>
                </div>
                
                <div className="h-32 overflow-y-auto font-mono text-[9.5px] space-y-1.5 scrollbar">
                  {logMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-1">
                      <span className="text-slate-500 shrink-0 select-none">[{msg.time}]</span>
                      <span className={`text-[9.2px] break-all ${
                        msg.type === 'blocked' ? 'text-red-400 font-semibold' :
                        msg.type === 'success' ? 'text-emerald-400' :
                        'text-slate-300'
                      }`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>
              </div>

            </div>

          </section>

          {/* ================= COLUMN 2: CODE HUB & ANNOTATIONS (7 COLS) ================= */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 💻 CARD 2: File tabs and explorer Code */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              
              {/* File selection tabs header */}
              <div className="bg-slate-950 border-b border-slate-800 p-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('java'); setCopied(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'java'
                      ? 'bg-red-600/15 border border-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  MainActivity.java
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('xml'); setCopied(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'xml'
                      ? 'bg-red-600/15 border border-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  activity_main.xml
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('manifest'); setCopied(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'manifest'
                      ? 'bg-red-600/15 border border-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  AndroidManifest.xml
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('gradle'); setCopied(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'gradle'
                      ? 'bg-red-600/15 border border-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  build.gradle
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('colors'); setCopied(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'colors'
                      ? 'bg-red-600/15 border border-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  colors.xml
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('themes'); setCopied(false); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'themes'
                      ? 'bg-red-600/15 border border-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  themes.xml
                </button>
              </div>

              {/* Sub-header inside code card */}
              <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActiveFileIcon()}
                  <span className="text-xs sm:text-sm font-mono font-semibold text-slate-200" dir="ltr">
                    {getActiveFileName()}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow shadow-red-950/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      تم نسخ الكود!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      نسخ الكود الكامل
                    </>
                  )}
                </button>
              </div>

              {/* Editable/Interactive View Code Block */}
              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed custom-code-block scrollbar">
                  <code>{getActiveCodeText()}</code>
                </pre>
                
                {/* Visual fading gradient bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
              </div>

            </div>

            {/* 💡 Section: Detailed Explanation in Arabic */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <HelpCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-100">شرح معماري دقيق للأكواد البرمجية البرمجية (Annotations)</h3>
              </div>

              <div className="space-y-3.5">
                
                {/* Question 1: How Ad-blocking WebView works */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1 px-2 text-xs font-bold bg-red-600/10 text-red-400 border border-red-500/20 rounded-md shrink-0">1</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">كيف يتم حجب الإعلانات من خلال فحص روابط العناصر؟</h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        نستخدم دالة <code>shouldInterceptRequest</code> المدمجة في الـ <code>WebViewClient</code>. عند تحميل صفحة يوتيوب، يقوم التطبيق باستمرار باعتراض طلبات الشبكة الفرعية (مثل الصور، وأكواد الـ JavaScript، وبثوثات الإعلانات). نقوم بفحص نطاق الرابط (Host Domain)، وإذا تطابق مع أي نطاق من "قائمة حجب خوادم الإعلانات المعروفة" (مثل <code>doubleclick.net</code>)، نقوم بإرجاع <code>WebResourceResponse</code> فارغ فوراً، مما يقطع السيرفر الخاص بالإعلانات دون تحميل أي بايتات للهاتف.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Question 2: How Visual Ads elements are hidden */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1 px-2 text-xs font-bold bg-amber-600/10 text-amber-400 border border-amber-500/20 rounded-md shrink-0">2</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">سر إخفاء الإعلانات الترويجية التي تفرزها صفحة يوتيوب (DOM Injection):</h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        بعض الإعلانات تكون محقونة مسبقاً داخل الشيفرة الأساسية ولا يتم تبادلها عبر روابط خوادم خارجية منفصلة. لذلك، عند انتهاء تحميل الصفحة في <code>onPageFinished</code>، نقوم بحقن كود جافا سكريبت عبر <code>webView.evaluateJavascript</code> يقوم بإلغاء التنسيق المرئي لحاويات الإعلانات المشهورة في الواجهة الجوالة ليوتيوب (مثل الـ CSS selectors المقابلة للـ <code>.video-ads</code> و <code>ytm-promoted-sparkles</code>) وتعديلها إلى <code>display: none !important;</code>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Question 3: How MP3 Extraction and Dowloading is handled */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1 px-2 text-xs font-bold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-md shrink-0">3</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">آلية استخراج وتحويل الفيديوهات إلى صيغة MP3:</h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        عملية تفكيك وفصل الصوت مباشرة على جهاز الأندرويد لروابط يوتيوب تتطلب كودًا ضخماً ومكتبات معقدة تتغير باستمرار بسبب حماية يوتيوب وخوارزميات التشفير الدورية. الطريقة القياسية والعملية التي تستخدمها تطبيقات WebView هي:
                      </p>
                      <ul className="text-xs text-slate-400 mt-1.5 list-disc list-inside space-y-1 pr-1 leading-relaxed">
                        <li>نقوم بالتقاط الرابط الحالي من الـ WebView باستخدام <code>webView.getUrl()</code>.</li>
                        <li>نمرر هذا الرابط لدالة تفكيك واستخلاص تأخذ معرّف الفيديو فقط (Video ID).</li>
                        <li>نستخدم واجهة التحميل المباشرة لـ <strong>Vevioz API</strong> أو ما يماثلها من خوادم تحويل مستقرة، والتي تقوم بالتحميل الذاتي وفصل الصوت وإرجاع دفق الـ MP3 في استجابة فورية.</li>
                        <li>نستخدم <code>DownloadManager</code> الرسمي والتابع لنظام الأندرويد لإتمام عملية التنزيل في الخلفية مع إظهار إشعارات تقدم التحميل بالنظام وحجزها بالهارد ديسك بشكل سريع وآمن.</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 💡 Step-by-Step implementation tutorial */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">طريقة إعداد وحشو هذا الكود داخل Android Studio (دليل المبرمج)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-950 p-4 rounded-xl">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    الخطوة 1: تهيئة المشروع والواجهة
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                    <li>1. افتح Android Studio وقم بإنشاء مشروع جديد (Empty Views Activity) بلغة <strong>Java</strong> وتأكد من اختيار اسم الحزمة الذي وضعته بالتحكم.</li>
                    <li>2. انتقل إلى مجلد <code>res/layout/activity_main.xml</code>، وانسخ كود تصميم الواجهة ووفر له لصقًا كاملاً للملء الشامل للمكونات.</li>
                    <li>3. للتناسق التام، ضع ملف <code>colors.xml</code> وملف <code>themes.xml</code> داخل مجلد <code>res/values</code> لمنع تضارب الألوان الافتراضية للواجهات بمشروعك.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    الخطوة 2: الصلاحيات وتفعيل الكود
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                    <li>1. اذهب لملف <code>AndroidManifest.xml</code> والصق قائمة الأذونات المقترحة لضمان تفعيل الإنترنت وإذن تخزين الملفات وتنزيلها بالكامل.</li>
                    <li>2. انسخ كود الـ <code>MainActivity.java</code> والصقه بالملف الرئيسي لديك، وتأكد من مطابقة السطر الأول للملف بالـ <code>package</code> الخاصة بك.</li>
                    <li>3. اربط هاتفك الفعلي أو شغل المحاكي بالأندرويد ستوديو، وباشر بالتشغيل والاستمتاع بتصفح يوتيوب خفيف وصوتيات نقية!</li>
                  </ul>
                </div>

              </div>
            </div>

          </section>

        </div>
      </main>

      {/* 💚 Pure Designer Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 text-slate-500 text-xs py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            تمت البرمجة بشغف وتطويع مميز لتطبيقات الأندرويد في استوديو الذكاء الاصطناعي Google AI Studio
          </p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors">مفسر WebView</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">تصفية إعلانات متطورة</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">استخراج ملفات MP3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
