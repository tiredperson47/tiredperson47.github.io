import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Terminal, 
  Database, 
  Share2, 
  Zap,
  Settings as SettingsIcon,
  Activity,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentTheme: 'dark' | 'light';
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, currentTheme }) => {
  const navItems = [
    { to: '/', icon: <Users size={20} />, label: 'Operators' },
    { to: '/blogs', icon: <Terminal size={20} />, label: 'Console' },
    { to: '/artifacts', icon: <Database size={20} />, label: 'Artifacts' },
    { to: '/graph', icon: <Share2 size={20} />, label: 'Graph' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-20 md:w-64'} bg-[#161b22] border-r border-[#30363d] flex flex-col sidebar-transition relative overflow-hidden z-30`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-[#30363d] space-x-3 overflow-hidden">
        <div className="bg-[#00f5d4] p-1.5 rounded-lg flex-shrink-0">
          {currentTheme === 'dark' ? (
            <Moon className="text-[#0d1117]" size={20} />
          ) : (
            <Sun className="text-[#0d1117]" size={20} />
          )}
        </div>
        <span className={`font-bold tracking-tighter text-lg mono glow-text uppercase text-[#e6edf3] transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Sleepy C2</span>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        <div className={`px-6 mb-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest whitespace-nowrap">Navigation</span>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                title={isCollapsed ? item.label : ''}
                className={({ isActive }) => `
                  flex items-center px-5 py-3 transition-all duration-200 group relative
                  ${isActive 
                    ? 'text-[#00f5d4] bg-[#1f2937]' 
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className="z-10 flex-shrink-0">{item.icon}</span>
                    <span className={`ml-4 font-medium z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f5d4] shadow-[0_0_10px_rgba(0,245,212,0.8)]" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={`mt-8 px-6 mb-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest whitespace-nowrap">Management</span>
        </div>
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/payloads"
              title={isCollapsed ? "Payloads" : ''}
              className={({ isActive }) => `
                flex items-center px-5 py-3 transition-all duration-200 group relative
                ${isActive 
                  ? 'text-[#00f5d4] bg-[#1f2937]' 
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="z-10 flex-shrink-0"><FileText size={20} /></span>
                  <span className={`ml-4 font-medium z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Payloads</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f5d4] shadow-[0_0_10px_rgba(0,245,212,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              title={isCollapsed ? "Settings" : ''}
              className={({ isActive }) => `
                flex items-center px-5 py-3 transition-all duration-200 group relative
                ${isActive 
                  ? 'text-[#00f5d4] bg-[#1f2937]' 
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className="z-10 flex-shrink-0"><SettingsIcon size={20} /></span>
                  <span className={`ml-4 font-medium z-10 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Settings</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f5d4] shadow-[0_0_10px_rgba(0,245,212,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Collapse Toggle Button */}
      <button 
        onClick={onToggleCollapse}
        className="h-10 border-t border-[#30363d] flex items-center justify-center text-[#8b949e] hover:text-[#00f5d4] transition-colors"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Profile */}
      <div className="p-3 border-t border-[#30363d] bg-[#0d1117] overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#30363d] overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img src="/assets/mori.jpeg" alt="TiredPerson" className="w-full h-full object-cover" />
          </div>
          <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <p className="text-xs font-bold truncate">TiredPerson</p>
            <p className="text-[9px] text-green-500 mono lowercase italic">brain dead. my kernel is panicking.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;