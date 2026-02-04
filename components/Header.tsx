import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-16 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between px-6 z-20">
      <div className="flex items-center space-x-4">
        <h1 className="text-sm font-bold tracking-widest mono text-[#00f5d4]">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
      </div>
    </header>
  );
};

export default Header;