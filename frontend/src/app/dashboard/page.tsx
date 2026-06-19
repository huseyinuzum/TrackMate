'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { api, Route, User } from '../../services/api';
import { 
  Compass, 
  Clock, 
  MapPin, 
  LogOut, 
  Send, 
  AlertCircle,
  Activity,
  Layers,
  History,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-bg-secondary flex items-center justify-center rounded-2xl border border-border-color theme-transition">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Harita Yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pastRoutes, setPastRoutes] = useState<Route[]>([]);
  
  // Form State
  const [query, setQuery] = useState('');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  
  // App State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    api.getMe()
      .then((u) => {
        setUser(u);
        return api.getRoutes();
      })
      .then((routes) => {
        setPastRoutes(routes);
      })
      .catch(() => {
        api.logout();
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    // Scroll to bottom when new route is loaded
    if (route) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [route]);

  if (!isMounted) return null; // Hydration fix

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center theme-transition">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLocationSelect = (lat: number | null, lon: number | null) => {
    setSelectedLocation(lat && lon ? { lat, lon } : null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setRoute(null);

    try {
      const generated = await api.generateRoute({
        query,
        lat: selectedLat || undefined,
        lon: selectedLon || undefined
      });
      setRoute(generated);
      setPastRoutes([generated, ...pastRoutes]);
      setQuery('');
      setSelectedLat(null);
      setSelectedLon(null);
    } catch (err: any) {
      setError(err.message || 'Rota oluşturulurken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  const loadPastRoute = (r: Route) => {
    setRoute(r);
    setSelectedLat(null);
    setSelectedLon(null);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col h-screen overflow-hidden theme-transition">
      {/* Header */}
      <header className="border-b border-border-color bg-bg-secondary/40 backdrop-blur-md px-4 py-3 flex items-center justify-between relative z-30 shrink-0 theme-transition">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg theme-transition"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="TrackMate Logo" className="w-10 h-10 object-contain drop-shadow-md theme-transition" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-text-primary hidden sm:inline-block theme-transition">TrackMate</span>
            <span className="text-xs text-indigo-500 sm:ml-2 border border-indigo-500/20 px-1.5 py-0.5 rounded bg-indigo-500/10">AI Chat</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-text-secondary text-sm hidden sm:inline theme-transition">Hoş geldin, <strong className="text-text-primary theme-transition">{user.username}</strong></span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 border border-border-color hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 text-text-secondary text-sm font-semibold rounded-lg transition-all duration-200 theme-transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - History */}
        <div className={`absolute md:relative z-20 h-full w-72 bg-bg-secondary border-r border-border-color flex flex-col transition-transform duration-300 theme-transition ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-border-color flex items-center gap-2 text-text-primary font-semibold theme-transition">
            <History className="w-5 h-5 text-text-secondary" />
            Geçmiş Rotalar
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {pastRoutes.length === 0 ? (
              <p className="text-text-secondary text-sm text-center mt-4 theme-transition">Henüz oluşturulmuş bir rota yok.</p>
            ) : (
              pastRoutes.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => loadPastRoute(pr)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 theme-transition ${
                    route?.id === pr.id 
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-400' 
                      : 'bg-bg-tertiary/30 border-border-color hover:border-indigo-500/30 hover:bg-bg-tertiary/60 text-text-secondary'
                  }`}
                >
                  <p className="font-medium text-sm truncate">{pr.user_prompt || pr.name || 'İsimsiz Rota'}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs opacity-70">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pr.total_duration_mins} dk</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {pr.places.length} Durak</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat & Map Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg-primary theme-transition">
          
          {/* Map Area (Top Half or Side) */}
          <div className="h-[40vh] md:h-1/2 p-2 relative z-0 border-b border-border-color theme-transition">
             <div className="absolute top-4 left-4 z-[400] bg-bg-secondary/80 backdrop-blur text-xs px-3 py-1.5 rounded-full border border-border-color shadow-xl pointer-events-none text-text-primary flex items-center gap-2 theme-transition">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {selectedLat ? 'Konum seçildi. İsteğini yazabilirsin.' : 'Önce haritadan bir yer seçebilirsin (İsteğe bağlı)'}
             </div>
             <MapComponent 
                places={route ? route.places : []} 
                onLocationSelect={handleLocationSelect}
                selectedLat={selectedLat}
                selectedLon={selectedLon}
             />
          </div>

          {/* Chat Flow (Bottom Half) */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {!route && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 animate-fadeIn">
                  <Sparkles className="w-12 h-12 text-indigo-500/50" />
                  <p className="text-center text-sm max-w-md">
                    Haritadan bir bölge işaretle veya doğrudan ne yapmak istediğini yaz. <br/>
                    Örn: "2 saatlik kahve içip müze gezebileceğim bir rota çiz."
                  </p>
                </div>
              )}

              {route && route.user_prompt && (
                <div className="flex justify-end animate-fadeIn">
                  <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-lg">
                    <p className="text-sm">{route.user_prompt}</p>
                  </div>
                </div>
              )}

              {/* AI Response Bubble */}
              {route && route.ai_response && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-bg-tertiary border border-border-color text-text-primary p-4 rounded-2xl rounded-tl-sm max-w-[95%] md:max-w-[80%] shadow-lg space-y-4 theme-transition">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="text-sm leading-relaxed mt-1">
                        {route.ai_response}
                      </div>
                    </div>
                    
                    {/* Route Steps Preview inside AI bubble */}
                    <div className="mt-4 pt-4 border-t border-border-color space-y-3 theme-transition">
                      <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold theme-transition">Rota Planın</p>
                      {route.places.map((rp, idx) => (
                        <div key={rp.id} className="flex items-center gap-3 bg-bg-secondary p-2.5 rounded-lg border border-border-color theme-transition">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate theme-transition">{rp.place.name}</p>
                            <p className="text-[10px] text-text-secondary truncate theme-transition">{rp.place.category}</p>
                          </div>
                          <div className="text-[11px] text-text-secondary text-right shrink-0 theme-transition">
                            <p>{rp.arrival_time?.slice(0,5)}</p>
                            <p>{rp.travel_time_from_prev > 0 ? `+${rp.travel_time_from_prev} dk` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                   <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-center gap-2 text-sm max-w-md">
                     <AlertCircle className="w-5 h-5 shrink-0" />
                     {error}
                   </div>
                </div>
              )}

              {loading && (
                 <div className="flex justify-start animate-pulse">
                   <div className="bg-bg-tertiary border border-border-color text-text-secondary px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3 theme-transition">
                     <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                     Rota hesaplanıyor ve en iyi mekanlar bulunuyor...
                   </div>
                 </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-bg-secondary border-t border-border-color shrink-0 relative z-30 theme-transition">
              <form onSubmit={handleGenerate} className="max-w-4xl mx-auto relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  placeholder={selectedLat ? "Seçilen konum için rotanı tarif et..." : "Örn: 2 saatlik kahve içebileceğim rota oluştur"}
                  className="w-full bg-bg-primary border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-text-primary rounded-full pl-6 pr-14 py-3.5 text-sm outline-none transition-all disabled:opacity-50 shadow-inner theme-transition"
                />
                <button
                  type="submit"
                  disabled={loading || !query}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
