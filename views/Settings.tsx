import React from 'react';
import { Sun, Moon, Settings as SettingsIcon, Monitor } from 'lucide-react';

interface SettingsProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onToggleTheme }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-[#00f5d4]/10 p-3 rounded-2xl border border-[#00f5d4]/20">
          <SettingsIcon className="text-[#00f5d4]" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mono uppercase tracking-tight">System Configuration</h1>
          <p className="text-xs text-[#8b949e] mono">Modify operational environmental variables</p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <div className="flex items-center space-x-2 text-[#00f5d4] mb-6">
            <Monitor size={18} />
            <h2 className="font-bold mono uppercase text-sm">Appearance</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => theme === 'light' && onToggleTheme()}
              className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${
                theme === 'dark' ? 'border-[#00f5d4] bg-[#00f5d4]/5' : 'border-[#30363d] hover:border-[#484f58]'
              }`}
            >
              <Moon size={24} className={theme === 'dark' ? 'text-[#00f5d4]' : 'text-[#8b949e]'} />
              <span className={`mono text-xs font-bold ${theme === 'dark' ? 'text-[#00f5d4]' : 'text-[#4c566a]'}`}>DARK MODE</span>
            </button>
            <button 
              onClick={() => theme === 'dark' && onToggleTheme()}
              className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-3 ${
                theme === 'light' ? 'border-[#00f5d4] bg-[#00f5d4]/5' : 'border-[#30363d] hover:border-[#484f58]'
              }`}
            >
              <Sun size={24} className={theme === 'light' ? 'text-[#00f5d4]' : 'text-[#8b949e]'} />
              <span className={`mono text-xs font-bold ${theme === 'light' ? 'text-[#00f5d4]' : 'text-[#4c566a]'}`}>LIGHT MODE</span>
            </button>
          </div>
        </section>

        {/* Mock Sections */}
        {/* <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 opacity-50 cursor-not-allowed">
          <div className="flex items-center space-x-2 text-[#8b949e] mb-4">
            <h2 className="font-bold mono uppercase text-sm">Network Overlay</h2>
          </div>
          <p className="text-xs text-[#8b949e] mono">Proxy settings and encrypted tunnel configurations are managed by the kernel.</p>
        </section> */}
      </div>
    </div>
  );
};

export default Settings;