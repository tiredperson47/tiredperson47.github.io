import React from 'react';

interface HeaderProps {
  title: string;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, isMobile = false }) => {
  const showMobileBackToTop = isMobile && title === 'TIRED PERSON BLOGS';

  const handleBackToTop = () => {
    window.dispatchEvent(new Event('blog:scroll-top'));
  };

  return (
    <header className="h-12 md:h-16 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between px-4 md:px-6 z-20">
      <div className="flex items-center space-x-4">
        <h1 className="text-[11px] md:text-sm font-bold tracking-widest mono text-[#00f5d4] truncate">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
        {showMobileBackToTop && (
          <button
            onClick={handleBackToTop}
            className="text-[10px] mono uppercase text-[#00f5d4] hover:text-[#00f5d4]/80 transition-colors"
          >
            Back to Top
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;