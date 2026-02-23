import React, { useState, useEffect } from 'react';
import { analyzeImage } from './services/geminiService';
import { AnalysisResult, Dimension, HistoryItem, User } from './types';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import HistoryView from './components/HistoryView';
import AuthModal from './components/AuthModal';
import { authService } from './services/authService';
import { Layout, Sparkles, Loader2, BarChart3, Clock, Home, ArrowLeft, Edit2, X, ZoomIn, LogIn, User as UserIcon, LogOut } from 'lucide-react';

type ViewState = 'home' | 'analyzing' | 'result' | 'history';

const MAX_HISTORY_ITEMS = 5;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [reportTitle, setReportTitle] = useState('分析报告');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Initialize Auth
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Load history based on User (Data Isolation)
  useEffect(() => {
    try {
      // Different storage key for Guest vs Logged User
      const storageKey = user ? `pem_history_${user.email}` : 'pem_history_guest';
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory([]); // Clear history when switching accounts if no data exists
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, [user]); // Re-run when user changes

  useEffect(() => {
    if (result) setReportTitle(result.title || '分析报告');
  }, [result]);

  const saveToHistory = (newResult: AnalysisResult, imagePreview: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      previewUrl: imagePreview,
      result: newResult
    };

    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(updatedHistory);
    
    // Save to isolated storage
    const storageKey = user ? `pem_history_${user.email}` : 'pem_history_guest';
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    
    const storageKey = user ? `pem_history_${user.email}` : 'pem_history_guest';
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item.result);
    setPreview(item.previewUrl);
    setView('result');
  };

  const handleFileSelect = async (base64: string, previewUrl: string, sourceUrl?: string, mimeType: string = 'image/jpeg') => {
    setPreview(previewUrl);
    setView('analyzing');
    setResult(null);
    try {
      const data = await analyzeImage(base64, mimeType, sourceUrl);
      setResult(data);
      saveToHistory(data, previewUrl);
      setView('result');
    } catch (error: any) {
      alert(error.message || "分析失败，请稍后重试。");
      setPreview(null);
      setView('home');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsUserMenuOpen(false);
    setView('home');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f8fafc] text-slate-900 selection:bg-[#3b82f6]/20">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {/* Vercel-style Animated SVG Background (Light Theme) */}
      <div className="fixed inset-0 -z-10 bg-[#f8fafc] pointer-events-none">
          {/* Light Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          {/* Subtle Top Blue Glow */}
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_800px_at_50%_-100px,#3b82f615,transparent)]"></div>
          
          {/* Animated Beams (Colors adapted for white background) */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                  <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="10%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                      <stop offset="90%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
              </defs>
              <rect width="1" height="300" x="20%" y="-300" fill="url(#beam-gradient)">
                <animate attributeName="y" values="-300;1500" dur="7s" repeatCount="indefinite" begin="0s" keyTimes="0;1" calcMode="linear" />
                <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite" begin="0s" />
              </rect>
              <rect width="2" height="500" x="50%" y="-500" fill="url(#beam-gradient)">
                <animate attributeName="y" values="-500;1500" dur="12s" repeatCount="indefinite" begin="3s" keyTimes="0;1" calcMode="linear" />
                <animate attributeName="opacity" values="0;0.5;0" dur="12s" repeatCount="indefinite" begin="3s" />
              </rect>
              <rect width="1" height="400" x="80%" y="-400" fill="url(#beam-gradient)">
                <animate attributeName="y" values="-400;1500" dur="9s" repeatCount="indefinite" begin="1.5s" keyTimes="0;1" calcMode="linear" />
                <animate attributeName="opacity" values="0;0.8;0" dur="9s" repeatCount="indefinite" begin="1.5s" />
              </rect>
              <rect width="1" height="250" x="10%" y="-250" fill="url(#beam-gradient)">
                <animate attributeName="y" values="-250;1500" dur="15s" repeatCount="indefinite" begin="5s" keyTimes="0;1" calcMode="linear" />
              </rect>
          </svg>
      </div>

      {/* Lightbox (Keep Dark Overlay for Focus) */}
      {isLightboxOpen && preview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-md" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"><X /></button>
          <img src={preview} className="max-w-full max-h-full object-contain rounded-lg border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Nav */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
             {/* Original Logo (No invert) */}
             <img src="https://static.zhi-niao.com/static/images/logo_text-175361a7.png" alt="logo" className="h-10 opacity-90" />
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setView('history')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'history' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              <Clock className="w-4 h-4" /> 历史记录
            </button>

            {/* Auth Menu */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">已登录账号</p>
                        <p className="text-sm text-slate-900 truncate">{user.email}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> 退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                <LogIn className="w-4 h-4" /> 登录 / 注册
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {view === 'home' && (
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">B端产品易用性度量</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">上传高保真原型图，AI 将基于 6 项关键易用性指标进行深度启发式评估。</p>
            <div className="max-w-xl mx-auto mt-12 bg-white/50 backdrop-blur-xl rounded-2xl p-2 border border-slate-200/60 shadow-2xl shadow-slate-200/50">
              <FileUpload onFileSelect={handleFileSelect} isAnalyzing={false} />
            </div>
            
            {/* Show login hint if guest */}
            {!user && (
              <div className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                 当前为访客模式，记录仅保存在本地。 <button onClick={() => setIsAuthModalOpen(true)} className="text-blue-600 hover:underline font-medium">登录</button> 以同步数据。
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              {[Dimension.OPERABILITY, Dimension.LEARNABILITY, Dimension.CLARITY].map(dim => (
                <div key={dim} className="bg-white/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 text-center transition-all hover:border-blue-200 group hover:bg-white hover:shadow-lg hover:shadow-blue-900/5">
                  <div className="font-bold text-slate-700 mb-1 group-hover:text-blue-600 transition-colors">{dim}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Expert Metric</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'history' && <HistoryView history={history} onSelect={handleSelectHistory} onDelete={handleDeleteHistory} />}

        {view === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
            <div className="relative p-6 bg-white rounded-full border border-slate-100 shadow-xl shadow-blue-500/10">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mt-10">深度分析中...</h2>
            <p className="text-slate-500 mt-4">正在扫描视觉层级、操作路径与信息密度</p>
          </div>
        )}

        {view === 'result' && result && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('home')} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft /></button>
              <div className="flex items-center gap-3 group">
                <BarChart3 className="text-blue-600" />
                <input type="text" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none text-slate-900 min-w-[300px]" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              <div className="lg:col-span-1 sticky top-24">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-lg cursor-zoom-in group" onClick={() => setIsLightboxOpen(true)}>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                    <img src={preview!} className="max-w-full max-h-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-3 text-center text-[10px] text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">预览原稿</div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <AnalysisDashboard result={result} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;