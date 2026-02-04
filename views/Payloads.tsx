import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
const RESUME_URL = "https://drive.google.com/file/d/11TpSPW9EOd-jx6X8crFzSpYg6-NX9bo8/view?usp=sharing";

const Payloads: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-[#00f5d4] w-full" />
        
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-[#00f5d4]/10 p-4 rounded-2xl border border-[#00f5d4]/20">
                <FileText className="text-[#00f5d4]" size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#e6edf3]">RESUME.PDF</h1>
                <p className="text-[#8b949e] mono text-sm uppercase tracking-widest">Version: v2026.04</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* <button className="flex items-center space-x-2 bg-[#30363d] hover:bg-[#484f58] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase mono text-white">
                <Download size={16} />
                <span>Download</span>
              </button> */}
              <button onClick={() => window.open(RESUME_URL, "_blank", "noopener,noreferrer")}
                className="flex items-center space-x-2 bg-[#00f5d4] hover:bg-[#00f5d4]/80 text-[#0d1117] px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase mono shadow-[0_0_15px_rgba(0,245,212,0.3)]">
                <ExternalLink size={16} />
                <span>Open in Viewer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payloads;