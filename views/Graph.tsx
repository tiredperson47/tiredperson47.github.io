import React, { useRef, useState } from 'react';
import { ROADMAP, EDGES } from '../constants';
import { RoadmapNode } from '../types';
import { Circle, ScrollText, BookOpen, Cpu, Info, ChevronRight, Swords, Flag, University, Cog } from 'lucide-react';

const Graph: React.FC = () => {
  const [activeNode, setActiveNode] = useState<RoadmapNode | null>(null);
  const maxX = Math.max(...ROADMAP.map(n => n.x)) + 100;
  const maxY = Math.max(...ROADMAP.map(n => n.y)) + 100;


  const renderIcon = (category: string) => {
    switch (category) {
      case 'certification': return <ScrollText size={18} />;
      case 'project': return <Cpu size={18} />;
      case 'skill': return <BookOpen size={18} />;
      case 'competition': return <Swords size={18} />;
      case 'milestone': return <Flag size={18} />;
      case 'club': return <University size={18} />;
      case 'work': return <Cog size={18} />;
      default: return <Circle size={18} />;
    }
  };

  const nodeMap = Object.fromEntries(
    ROADMAP.map(node => [node.id, node])
  );

  const getAncestorEdges = (nodeId: string) => {
    const visitedNodes = new Set<string>();
    const activeEdges = new Set<string>();

    const dfs = (currentId: string) => {
      if (visitedNodes.has(currentId)) return;
      visitedNodes.add(currentId);

      EDGES.forEach(edge => {
        if (edge.to === currentId) {
          activeEdges.add(`${edge.from}->${edge.to}`);
          dfs(edge.from);
        }
      });
    };

    dfs(nodeId);
    return activeEdges;
  };

  const activeAncestorEdges = activeNode ? getAncestorEdges(activeNode.id) : new Set<string>();

  const getAncestorNodes = (nodeId: string) => {
    const visited = new Set<string>();

    const dfs = (currentId: string) => {
      EDGES.forEach(edge => {
        if (edge.to === currentId && !visited.has(edge.from)) {
          visited.add(edge.from);
          dfs(edge.from);
        }
      });
    };

    dfs(nodeId);
    return visited; // Set of ancestor node IDs
  };

  const activeAncestorNodes = activeNode ? getAncestorNodes(activeNode.id) : new Set<string>();

  const [offset, setOffset] = useState({ x: -50, y: -800 });
  const [scale, setScale] = useState(0.8);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => Math.min(2, Math.max(0.4, prev - e.deltaY * 0.001)));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    dragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || e.touches.length !== 1) return;
    e.preventDefault();

    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = () => {
    dragging.current = false;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in slide-in-from-right-4 duration-700">
      {/* Visual Graph View */}
      <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-2xl relative overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]/20">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-[#00f5d4] rounded-full animate-pulse shadow-[0_0_8px_#00f5d4]"></span>
            <span className="text-[10px] font-bold mono uppercase text-[#00f5d4]">NETWORK_GRAPH</span>
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1 text-[10px] mono">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>COMPLETED</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] mono">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>IN_PROGRESS</span>
            </div>
          </div>
        </div>

        <div
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG Connections - Increased opacity for light mode visibility */}
            <svg className="absolute inset-0 pointer-events-none" width={maxX} height={maxY} viewBox={`0 0 ${maxX} ${maxY}`}>
              {EDGES.map((edge, idx) => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                if (!from || !to) return null;

                const edgeKey = `${edge.from}->${edge.to}`;
                const isAncestor = activeAncestorEdges.has(edgeKey);

                return (
                  <line
                    key={idx}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isAncestor ? '#00f5d4' : 'currentColor'}
                    strokeWidth={isAncestor ? 3 : 1.25}
                    strokeDasharray={isAncestor ? 'none' : '5,5'}
                    opacity={isAncestor ? 1 : 0.15}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            {ROADMAP.map((node) => (
              <button
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`
                  absolute transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2
                  flex flex-col items-center group
                `}
                style={{ left: node.x, top: node.y }}
              >
                <div className={`
                  w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300
                  ${activeNode?.id === node.id 
                    ? 'bg-[#00f5d4] border-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.6)] text-[#0d1117] scale-110' 
                    : activeAncestorNodes.has(node.id)
                      ? 'bg-[#00f5d4]/100 border-[#00f5d4] text-[#0d1117]'
                      : node.status === 'completed'
                        ? 'bg-green-500/10 border-green-500 text-green-500'
                        : 'bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse'
                  }
                  group-hover:scale-110 group-active:scale-95`}>
                  {renderIcon(node.category)}
                </div>
                <span className={`
                  mt-2 text-[10px] mono font-bold whitespace-nowrap px-2 py-0.5 rounded shadow-sm
                  ${activeNode?.id === node.id ? 'bg-[#00f5d4] text-[#0d1117]' : 'bg-[#161b22] text-[#e6edf3] border border-[#30363d]'}
                `}>
                  {node.label}
                </span>
              </button>
            ))}
            </div>
        </div>
      </div>

      {/* Detail Sidebar */}
      <div className="w-full lg:w-80 flex flex-col space-y-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col shadow-xl">
          {activeNode ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col h-full">
              <div className="flex items-center space-x-2 text-[#00f5d4] mb-4">
                <Info size={18} />
                <h2 className="font-bold mono uppercase tracking-tight text-xs">Node_Details</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold leading-tight text-[#e6edf3]">{activeNode.label}</h3>
                  <div className="flex space-x-2 mt-2">
                    <span className="text-[9px] px-2 py-0.5 bg-[#30363d] text-white rounded mono uppercase">{activeNode.category}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded mono uppercase font-bold ${
                      activeNode.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {activeNode.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#010409] border border-[#30363d] rounded-xl">
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    {activeNode.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
                    Gained
                  </h4>

                  <ul className="space-y-2">
                    {activeNode.gained?.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center text-[11px] text-[#e6edf3] mono"
                      >
                        <ChevronRight size={14} className="text-[#00f5d4] mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setActiveNode(null)}
                  className="w-full py-2 bg-[#30363d] hover:bg-[#484f58] text-white transition-colors rounded-lg font-bold mono uppercase text-[10px]"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <Circle size={40} className="text-[#8b949e]" />
              <div>
                <p className="text-xs font-bold uppercase mono text-[#e6edf3]">No Selection</p>
                <p className="text-[10px] mono text-[#8b949e] px-4">Click a graph node to pull intelligence reports.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Graph;