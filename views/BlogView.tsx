import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import { X, FileText, ArrowUp } from 'lucide-react';
import { BLOGS } from '../constants';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface BlogViewProps {
  theme: 'dark' | 'light';
}

const BlogView: React.FC<BlogViewProps> = ({ theme }) => {
  const { index } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setShowBackToTop(element.scrollTop > 300);
  };

  const scrollToTop = () => {
    if (contentContainerRef.current) {
      const target = contentContainerRef.current.querySelector('#table-of-contents');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        contentContainerRef.current.scrollTop = 0;
      }
    }
  };

  useEffect(() => {
    fetch(`${BLOGS[Number(index)]?.content}`)
      .then(res => res.text())
      .then(setContent)
      .catch(() => setContent('# Error loading blog'));
  }, [index]);

  useEffect(() => {
    const handleScrollTop = () => {
      scrollToTop();
    };

    window.addEventListener('blog:scroll-top', handleScrollTop);
    return () => window.removeEventListener('blog:scroll-top', handleScrollTop);
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] w-full flex flex-col relative m-0 md:-m-6 md:-mb-8">

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`hidden md:flex fixed right-8 bottom-20 w-10 h-10 rounded-lg bg-[#00f5d4] text-[#010409] items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 z-50 ${
          showBackToTop ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        title="Back to Top"
      >
        <ArrowUp size={20} />
      </button>

  {/* Blog Container with Scroll Handler */}
      <div 
        ref={contentContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollable scroll-smooth flex flex-col p-0 md:p-6"
      >
        <div className="w-full flex flex-col flex-1">
        <div className="bg-[#161b22] border border-[#30363d] overflow-hidden shadow-2xl rounded-none md:rounded-xl flex-1 flex flex-col">
          <div className="h-12 border-b border-[#30363d] bg-[#161b22] md:rounded-t-xl px-3 md:px-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText size={14} className="text-[#00f5d4]" />
              <span className="text-[12px] md:text-[14px] font-bold mono text-[#00f5d4] truncate">{BLOGS[Number(index)]?.title}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/blogs')}
                className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors group"
              >
                <span className="text-[12px] md:text-[14px] mono font-bold uppercase group-hover:underline">
                  Exit
                </span>
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="h-2 bg-[#00f5d4] w-full" />

          <div
            className="
              p-4 md:p-12
              prose prose-invert max-w-none
              flex-1 overflow-y-auto

              prose-a:relative
              prose-a:no-underline
              prose-a:text-[#00f5d4]
              prose-a:font-medium

              prose-a:after:absolute
              prose-a:after:left-0
              prose-a:after:-bottom-0.5
              prose-a:after:h-[2px]
              prose-a:after:w-0
              prose-a:after:bg-[#00f5d4]
              prose-a:after:transition-all
              prose-a:after:duration-200
              prose-a:after:ease-out

              prose-a:hover:after:w-full
            ">
            <ReactMarkdown
              rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
              components={{
                h1: ({node, ...props}) => (
                  <h1 className="text-3xl font-bold mt-10 mb-4 text-[#00f5d4] scroll-mt-24" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-xl font-bold mt-10 mb-4 text-[#00f5d4] scroll-mt-24" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-xl font-bold mt-10 mb-4 text-[#00f5d4] scroll-mt-24" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className={`mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`} {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul
                    className={`
                      list-disc list-inside mb-4 space-y-1 
                      ${theme === 'light' ? 'text-black marker:text-black' : 'text-white marker:text-white'}
                    `}
                    {...props}
                  />
                ),
                ol: ({node, ...props}) => (
                  <ol
                    className={`
                      list-decimal list-inside mb-4 space-y-1 
                      ${theme === 'light' ? 'text-black marker:text-black' : 'text-white marker:text-white'}
                    `}
                    {...props}
                  />
                ),
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-[#00f5d4] pl-4 italic my-6 text-[#00f5d4]/80 bg-[#00f5d4]/5 py-2" {...props} />
                ),
                img: ({node, ...props}) => (
                  <img className="rounded-lg border border-[#30363d] my-8 w-full object-cover" {...props} />
                ),
                pre: ({node, ...props}) => (
                  <pre className="bg-[#010409] border border-[#30363d] p-4 rounded-lg overflow-x-auto my-6" {...props} />
                ),
                code: ({node, ...props}) => (
                  <code className="bg-[#010409] text-[#00f5d4] px-1.5 py-0.5 rounded mono text-sm" {...props} />
                ),
                hr: () => <hr className="border-[#30363d] my-8" />,
                a: ({ node, ...props }) => {
                  const href = props.href || '';
                  const isToC = href.startsWith('#');

                  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (isToC) {
                      e.preventDefault();
                      const target = document.getElementById(href.slice(1)); // remove '#'
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  };
                  return (
                    <a
                    {...props}
                    onClick={handleClick}
                    target={isToC ? undefined : "_blank"}
                    rel={isToC ? undefined : "noopener noreferrer"}
                    className="
                      relative
                      text-[#00f5d4]
                      font-medium
                      no-underline

                      after:absolute
                      after:left-0
                      after:-bottom-0.5
                      after:h-[2px]
                      after:w-0
                      after:bg-[#00f5d4]
                      after:transition-all
                      after:duration-200
                      after:ease-out

                      hover:after:w-full
                    "/>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BlogView;
