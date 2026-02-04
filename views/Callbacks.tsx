import React, { useState, useRef, useEffect } from 'react';
import { Github, Linkedin, Terminal as TerminalIcon, Twitter } from 'lucide-react';
import { BLOGS } from '../constants';
import { TerminalLine } from '../types';
import { useNavigate } from 'react-router-dom';

interface CallbacksProps {
  theme: 'dark' | 'light';
}

const Callbacks: React.FC<CallbacksProps> = ({ theme }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: "TIRED PERSON CONSOLE INITIALIZED [SESSION: 0x534C45455059]", type: 'system' },
    { text: "TYPE 'help' TO VIEW AVAILABLE COMMANDS.", type: 'system' },
  ]);
  const [input, setInput] = useState('');
  const [showSocials, setShowSocials] = useState(false);
  const [readingBlog, setReadingBlog] = useState<string | null>(null);
  const [blogContent, setBlogContent] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmdLine = input.trim().toLowerCase();
    const args = cmdLine.split(' ');
    const command = args[0];

    const newHistory: TerminalLine[] = [...history, { text: `root@tiredperson:~$ ${input}`, type: 'input' }];

    switch (command) {
      case 'help':
        newHistory.push({ text: "AVAILABLE COMMANDS:", type: 'system' });
        newHistory.push({ text: "  ls              - List all available blog entries (indexed)", type: 'system' });
        newHistory.push({ text: "  use <index>     - Load specific blog content into the terminal", type: 'system' });
        newHistory.push({ text: "  connect         - Display operator connection links", type: 'system' });
        newHistory.push({ text: "  clear           - Clear terminal buffer", type: 'system' });
        break;

      case 'ls':
        newHistory.push({ text: "INDEXING CALL DATA...", type: 'system' });
        BLOGS.forEach((blog, index) => {
          newHistory.push({ text: `[${index}] ${blog.title}`, type: 'success' });
          newHistory.push({ text: `    SUMMARY: ${blog.summary}`, type: 'output' });
        });
        break;

      case 'use':
        const index = parseInt(args[1]);
        if (isNaN(index) || index < 0 || index >= BLOGS.length) {
          newHistory.push({ text: "ERROR: INVALID INDEX. USE 'ls' TO VIEW ENTRIES.", type: 'error' });
        } else {
          newHistory.push({ text: `INITIATING DECRYPTION SEQUENCE [0x0${index}]...`, type: 'system' });
          const blog = BLOGS[index];
          newHistory.push({ text: `LOADING FILESYSTEM OBJECT: ${blog.content}`, type: 'system' });

          fetch(blog.content)
            .then(res => {
              if (!res.ok) throw new Error("File not found");
              return res.text();
            })
            .then(md => {
              navigate(`/blogs/${index}`);
            })
            .catch(() => {
              newHistory.push({ text: "ERROR: UNABLE TO READ MARKDOWN BUFFER", type: 'error' });
              setHistory([...newHistory]);
            });
        }
        break;

      case 'connect':
        newHistory.push({ text: "INITIATING SOCIAL HANDSHAKE...", type: 'system' });
        setShowSocials(true);
        newHistory.push({ text: "EXTERNAL LINKS DEPLOYED.", type: 'success' });
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      default:
        newHistory.push({ text: `UNKNOWN COMMAND: '${command}'`, type: 'error' });
        break;
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="flex-1 min-h-0 bg-[#010409] border border-[#30363d] rounded-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Terminal Header */}
        <div className="h-8 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f85149]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#d29922]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950]"></div>
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <TerminalIcon size={12} className="text-[#8b949e]" />
            <span className="text-[9px] md:text-[10px] mono text-[#8b949e] truncate">operator-console -- session-0x534C45455059</span>
          </div>
        </div>

        {/* Output */}
        <div 
          ref={scrollRef}
          className="flex-1 min-h-0 p-3 md:p-4 overflow-y-auto mono text-[11px] md:text-sm scroll-smooth leading-relaxed"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {history.map((line, i) => (
            <div 
              key={i} 
              className={`mb-1 break-words ${
                line.type === 'input' ? 'text-[#e6edf3]' : 
                line.type === 'error' ? 'text-red-400' :
                line.type === 'success' ? 'text-[#00f5d4]' :
                line.type === 'system' ? 'text-blue-400 font-bold' : 'text-[#8b949e]'
              }`}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Command Line */}
        <form onSubmit={handleCommand} className="p-2 md:p-3 border-t border-[#30363d] flex items-center bg-[#0d1117] gap-2 min-w-0">
          <span className="text-[#00f5d4] mono font-bold tracking-tighter text-[10px] md:text-sm whitespace-nowrap">
            <span className="hidden md:inline">root@tiredperson:~$</span>
            <span className="md:hidden">root@tiredperson:~$</span>
          </span>
          <input 
            type="text"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-[#e6edf3] mono text-sm caret-[#00f5d4]"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </form>
      </div>

      {/* Social Overlay */}
      <div className={`grid grid-cols-1 transition-all duration-700 ease-in-out ${showSocials ? 'max-h-32 md:max-h-48 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col h-full shadow-lg">
          <div className="p-2 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]/50">
            <span className="text-[9px] font-bold mono text-[#00f5d4] uppercase px-2">Operator_Handshake.protocol</span>
            <button onClick={() => setShowSocials(false)} className="text-[9px] text-red-500 hover:text-red-400 mono px-2">EXIT</button>
          </div>
          <div className="flex-1 flex items-center justify-center space-x-16 p-6">
            <a href="https://github.com/tiredperson47" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center group-hover:border-[#00f5d4] group-hover:scale-110 transition-all shadow-md">
                <Github size={28} />
              </div>
              <span className="text-[10px] mono group-hover:text-[#00f5d4] font-bold">GITHUB</span>
            </a>
            <a href="https://www.linkedin.com/in/ryan-wong14705/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center group-hover:border-[#00f5d4] group-hover:scale-110 transition-all shadow-md">
                <Linkedin size={28} />
              </div>
              <span className="text-[10px] mono group-hover:text-[#00f5d4] font-bold">LINKEDIN</span>
            </a>
            <a href="https://x.com/thatguy4705" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center group-hover:border-[#00f5d4] group-hover:scale-110 transition-all shadow-md">
                <Twitter size={28} />
              </div>
              <span className="text-[10px] mono group-hover:text-[#00f5d4] font-bold">TWITTER</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callbacks;
