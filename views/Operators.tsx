
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface OperatorsProps {
  theme?: 'dark' | 'light';
}

const ABOUT_MD = `
# About Me

My name is Ryan Wong and I am currently attending Cal Poly Pomona with a focus on Offensive Security. A lot of my skills were self-taught through practice and competitions. I've previously did R&D and internal engagements as an Adversary Simulation Intern at TikTok USDS. This blog documents some cool things I've been up to (that I happen to feel like writing about) so feel free to read some stuff.

I primarily focus on:
- Malware Development (Golang, C, Python)
- Linux Stuff
- Windows Exploitation
- Maybe some web stuff
- Whatever else piques my interest

If you can't tell, I'm a jack of all trades and master of none...
`;

const Operators: React.FC<OperatorsProps> = ({ theme = 'dark' }) => {
  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] w-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto scrollable scroll-smooth flex flex-col">
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className={`${theme === 'light' ? 'bg-white border-gray-300' : 'bg-[#161b22] border-[#30363d]'} border rounded-xl overflow-hidden shadow-2xl`}>
            <div className={`h-2 ${theme === 'light' ? 'bg-blue-500' : 'bg-[#00f5d4]'} w-full`} />
            <div className={`p-8 md:p-12 prose ${theme === 'light' ? 'prose text-black' : 'prose-invert'} prose-cyan max-w-none`}>
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-blue-600' : 'text-[#00f5d4]'} flex items-center`} {...props} />,
                  h2: ({node, ...props}) => <h2 className={`text-xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-[#e6edf3]'}`} {...props} />,
                  p: ({node, ...props}) => <p className={`mb-4 ${theme === 'light' ? 'text-gray-700' : 'text-[#ffffff]'} leading-relaxed`} {...props} />,
                  ul: ({node, ...props}) => <ul className={`list-disc list-inside mb-4 space-y-1 ${theme === 'light' ? 'text-gray-700' : 'text-[#ffffff]'}`} {...props} />,
                  li: ({node, ...props}) => <li className="ml-4" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className={`border-l-4 ${theme === 'light' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-[#00f5d4] text-[#00f5d4]/80 bg-[#00f5d4]/5'} pl-4 italic my-6 py-2`} {...props} />
                  ),
                  img: ({node, ...props}) => (
                    <img className={`rounded-lg border ${theme === 'light' ? 'border-gray-300' : 'border-[#30363d]'} my-8 w-full object-cover`} {...props} />
                  ),
                  hr: () => <hr className={`${theme === 'light' ? 'border-gray-300' : 'border-[#30363d]'} my-8`} />
                }}
              >
                {ABOUT_MD}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operators;
