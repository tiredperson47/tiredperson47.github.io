import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ARTIFACTS } from '../constants';
import { Artifact } from '../types';
import { Maximize2, X, Info, Camera, ChevronDown, ChevronUp } from 'lucide-react';

interface ArtifactsProps {
  theme?: 'dark' | 'light';
}

const Artifacts: React.FC<ArtifactsProps> = ({ theme = 'dark' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelected] = useState<number | null>(null);
  const selected = selectedIndex !== null ? ARTIFACTS[selectedIndex] : null;
  
  // Filter and pagination state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const itemsPerPage = 18;

  // Apply tag filter from navigation state on mount
  useEffect(() => {
    if (location.state?.filterTag) {
      setSelectedTags([location.state.filterTag]);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelected((selectedIndex + 1) % ARTIFACTS.length);
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelected(
      (selectedIndex - 1 + ARTIFACTS.length) % ARTIFACTS.length
    );
  };

  const formatID = (id: number) => {
    return id.toString().padStart(3, '0');
  }

  // Get all unique tags and their counts
  const allTags = ARTIFACTS.reduce((acc, artifact) => {
    artifact.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Filter artifacts
  const filteredArtifacts = ARTIFACTS.filter(artifact => {
    // Filter by tags
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some(tag => artifact.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Filter by rating
    if (selectedRating !== null) {
      if (artifact.rating !== selectedRating) return false;
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredArtifacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArtifacts = filteredArtifacts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTags, selectedRating]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Toggle rating selection
  const toggleRating = (rating: number) => {
    setSelectedRating(prev => prev === rating ? null : rating);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedRating(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Filter Section */}
      <div className={`${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-[#161b22] border-[#30363d]'} border rounded-xl overflow-hidden`}>
        <div className={`flex items-center justify-between p-6 cursor-pointer ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-[#21262d]/50'} transition-colors`} onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
          <div className="flex items-center space-x-3">
            <h2 className={`text-lg font-bold mono uppercase ${theme === 'light' ? 'text-blue-600' : 'text-[#00f5d4]'}`}>Filters</h2>
            {(selectedTags.length > 0 || selectedRating !== null) && (
              <span className={`px-2 py-0.5 text-xs mono rounded ${theme === 'light' ? 'bg-blue-200 text-blue-800' : 'bg-[#00f5d4]/20 text-[#00f5d4]'}`}>
                {(selectedTags.length + (selectedRating !== null ? 1 : 0))} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {(selectedTags.length > 0 || selectedRating !== null) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                className={`text-xs mono uppercase transition-colors ${theme === 'light' ? 'text-gray-600 hover:text-blue-600' : 'text-[#8b949e] hover:text-[#00f5d4]'}`}
              >
                Clear All
              </button>
            )}
            {isFiltersOpen ? <ChevronUp size={20} className={theme === 'light' ? 'text-gray-600' : 'text-[#8b949e]'} /> : <ChevronDown size={20} className={theme === 'light' ? 'text-gray-600' : 'text-[#8b949e]'} />}
          </div>
        </div>

        {isFiltersOpen && (
          <div className={`px-6 pb-6 space-y-4 pt-4 ${theme === 'light' ? 'border-t border-gray-300' : 'border-t border-[#30363d]'}`}>
            {/* Rating Filter */}
            <div>
              <p className={`text-xs mono uppercase mb-3 ${theme === 'light' ? 'text-gray-600' : 'text-[#8b949e]'}`}>Rating</p>
              <div className={`grid grid-cols-5 gap-2 p-3 md:p-4 rounded-lg border ${theme === 'light' ? 'bg-gray-200 border-gray-300' : 'bg-[#21262d] border-[#30363d]'}`}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => toggleRating(rating)}
                    className="group w-full"
                  >
                    <div 
                      className={`h-4 md:h-6 w-full rounded-full transition-all ${
                        selectedRating !== null && rating <= selectedRating
                          ? theme === 'light' ? 'bg-blue-500' : 'bg-[#00f5d4]'
                          : theme === 'light' ? 'bg-gray-400 group-hover:bg-gray-500' : 'bg-[#30363d] group-hover:bg-[#484f58]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            {Object.keys(allTags).length > 0 && (
              <div>
                <p className={`text-xs mono uppercase mb-2 ${theme === 'light' ? 'text-gray-600' : 'text-[#8b949e]'}`}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(allTags).map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs mono transition-all ${
                        selectedTags.includes(tag)
                          ? theme === 'light' ? 'bg-blue-500 text-white font-bold' : 'bg-[#00f5d4] text-[#0d1117] font-bold'
                          : theme === 'light' ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'
                      }`}
                    >
                      {tag} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className={`pt-2 ${theme === 'light' ? 'border-t border-gray-300' : 'border-t border-[#30363d]'}`}>
              <p className={`text-xs mono ${theme === 'light' ? 'text-gray-600' : 'text-[#8b949e]'}`}>
                Showing {paginatedArtifacts.length} of {filteredArtifacts.length} artifacts
                {filteredArtifacts.length !== ARTIFACTS.length && ` (${ARTIFACTS.length} total)`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedArtifacts.map((artifact) => {
          const originalIndex = ARTIFACTS.findIndex(a => a.id === artifact.id);
          return (
          <div 
            key={artifact.id}
            className="group relative bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden cursor-crosshair transition-all hover:border-[#00f5d4]/50"
            onClick={() => setSelected(originalIndex)}
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={artifact.url} 
                alt={artifact.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
            </div>
            
            {/* Overlay Info */}
            <div className="p-4 bg-[#161b22]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase mono tracking-wider text-[#e6edf3]">{artifact.title}</h3>
                  <h3 className="text-sm font-bold uppercase mono tracking-wider text-[#e6edf3]">ID: {formatID(artifact.id)}</h3>
                </div>
                <Maximize2 size={16} className="text-[#8b949e] group-hover:text-[#00f5d4]" />
              </div>
            </div>

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
              <div className="w-full h-[2px] bg-[#00f5d4] absolute top-0 animate-scan"></div>
            </div>
          </div>
        );})}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#21262d] text-[#8b949e] rounded-lg mono text-sm hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          
          <div className="flex space-x-1">
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 bg-[#21262d] text-[#8b949e] rounded-lg mono text-sm hover:bg-[#30363d] transition-all"
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span className="px-3 py-2 text-[#8b949e]">...</span>
                )}
              </>
            )}
            
            {/* Show pages around current page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 2)
              .map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg mono text-sm transition-all ${
                    currentPage === page
                      ? 'bg-[#00f5d4] text-[#0d1117] font-bold'
                      : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'
                  }`}
                >
                  {page}
                </button>
              ))}
            
            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="px-3 py-2 text-[#8b949e]">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 bg-[#21262d] text-[#8b949e] rounded-lg mono text-sm hover:bg-[#30363d] transition-all"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#21262d] text-[#8b949e] rounded-lg mono text-sm hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* No Results Message */}
      {filteredArtifacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8b949e] mono text-sm">No artifacts match the selected filters.</p>
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1117]/95 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <button 
            onClick={() => setSelected(null)}
            className="absolute top-6 right-6 text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            <X size={32} />
          </button>

          <button
            onClick={goPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#161b22]/80 border border-[#30363d] rounded-full p-3 hover:border-[#00f5d4]"
          >
            ←
          </button>

          <button
            onClick={goNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-[#161b22]/80 border border-[#30363d] rounded-full p-3 hover:border-[#00f5d4]"
          >
            →
          </button>

          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={selected.url} 
                alt={selected.title}
                className="w-full h-full object-contain max-h-[80vh]"
              />
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col">
              <div className="flex items-center space-x-2 text-[#00f5d4] mb-6">
                <Info size={20} />
                <h2 className="font-bold mono uppercase">Metadata</h2>
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-[10px] text-[#8b949e] mono uppercase">Asset ID</p>
                  <p className="text-sm font-bold mono">{formatID(selected.id)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8b949e] mono uppercase">Label</p>
                  <p className="text-sm font-bold">{selected.title}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Camera size={12} className="text-[#00f5d4]" />
                    <p className="text-[10px] text-[#8b949e] mono uppercase">Settings</p>
                  </div>
                  <p className="text-sm font-bold mono text-[#00f5d4]">{selected.camera}</p>
                  <p className="text-sm font-bold mono text-[#00f5d4]">{selected.settings}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8b949e] mono uppercase">Context</p>
                  <p className="text-xs text-[#8b949e] leading-relaxed">{selected.description}</p>
                </div>
                <div className="pt-4 border-t border-[#30363d]">
                  <p className="text-[10px] text-[#8b949e] mono uppercase">Rating</p>
                  <div className="flex space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= selected.rating ? (theme === 'light' ? 'bg-blue-500' : 'bg-[#00f5d4]') : (theme === 'light' ? 'bg-gray-400' : 'bg-[#30363d]')
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {selected.tags && selected.tags.length > 0 && (
                  <div className="pt-4 border-t border-[#30363d]">
                    <p className="text-[10px] text-[#8b949e] mono uppercase mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            navigate('/artifacts', { state: { filterTag: tag } });
                            setSelected(null);
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] mono transition-all cursor-pointer ${
                            theme === 'light'
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-[#00f5d4] text-[#0d1117] hover:bg-[#00f5d4]/80 font-bold'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelected(null)}
                className="mt-8 py-3 bg-[#30363d] hover:bg-[#484f58] text-white transition-colors rounded-xl font-bold mono uppercase text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          from { top: 0%; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Artifacts;