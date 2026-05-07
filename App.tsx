import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Operators from './views/Operators';
import Callbacks from './views/Callbacks';
import Artifacts from './views/Artifacts';
import Graph from './views/Graph';
import Payloads from './views/Payloads';
import Settings from './views/Settings';
import BlogView from './views/BlogView';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [latency, setLatency] = useState(42);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, Math.min(100, prev + diff));
      });
    }, 2000);

    const dateTimer = setInterval(() => {
      setCurrentDate(new Date().toLocaleDateString());
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(dateTimer);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();

    if (media.addEventListener) {
      media.addEventListener('change', update);
    } else {
      media.addListener(update);
    }

    return () => {
      if (media.addEventListener) {
        media.removeEventListener('change', update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  }, [isMobile]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'ABOUT ME';
      case '/blogs': return 'BLOGS';
      case '/artifacts': return 'ART GALLERY';
      case '/graph': return 'ROADMAP';
      case '/payloads': return 'RESUME';
      case '/settings': return 'SETTINGS';
      default: return 'TIRED PERSON BLOGS';
    }
  };

  return (
    <div className={`flex h-screen text-[#e6edf3] overflow-hidden select-none transition-colors duration-300 flex-col md:flex-row ${theme === 'light' ? 'light-theme' : 'bg-[#0d1117]'}`}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentTheme={theme}
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 order-1 md:order-2">
        <Header title={getPageTitle()} isMobile={isMobile} />
        <main
          className="flex-1 min-h-0 overflow-y-auto scrollable p-4 md:p-6 scroll-smooth relative pb-24 md:pb-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Routes>
            <Route path="/" element={<Operators theme={theme} />} />
            <Route path="/blogs" element={<Callbacks theme={theme} />} />
            <Route path="/artifacts" element={<Artifacts theme={theme} />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/payloads" element={<Payloads />} />
            <Route path="/settings" element={<Settings theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />} />
            <Route path="/blogs/:index" element={<BlogView theme={theme} />} />
          </Routes>
        </main>
        
        {/* Footer Bar */}
        <footer className="hidden md:flex h-8 bg-[#161b22] border-t border-[#30363d] items-center px-4 justify-between text-[10px] mono uppercase tracking-widest text-[#8b949e]">
          <div className="flex space-x-4">
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div> SERVER: ONLINE</span>
            <span>DATE: {currentDate}</span>
          </div>
          <div className="flex space-x-4">
            <span>REGION: US-EAST-1</span>
            <span className="transition-all duration-300">LATENCY: {latency}MS</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

export default App;