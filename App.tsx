import React, { useState, useMemo, useEffect } from 'react';
import { ReleaseCard } from './components/ReleaseCard';
import { ReleaseForm } from './components/ReleaseForm';
import { ChangeType, FilterState, Release } from './types';
import { Search, Filter, Info, Layers, Loader2, Github, Moon, Sun } from 'lucide-react';
import { loadStaticReleases } from './services/releaseLoader';
import { APP_CONFIG } from './constants';

const App: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    types: [],
  });
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'about'>('timeline');

  // Handle Theme Change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load Releases from Files and LocalStorage
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 1. Load static content from .md files
        const staticData = await loadStaticReleases();
        
        // 2. Load custom user drafts from LocalStorage
        let localData: Release[] = [];
        try {
          const saved = localStorage.getItem('changelog_releases');
          if (saved) {
             localData = JSON.parse(saved);
          }
        } catch (e) {
          console.error("Failed to parse local storage", e);
        }

        // 3. Merge: Local data takes precedence if newer, but here we just concat.
        const combined = [...localData, ...staticData];
        
        // Sort by date descending
        const sorted = combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setReleases(sorted);
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleSaveRelease = (newRelease: Release) => {
    const updatedReleases = [newRelease, ...releases];
    setReleases(updatedReleases);
    
    try {
        const currentLocal = JSON.parse(localStorage.getItem('changelog_releases') || '[]');
        localStorage.setItem('changelog_releases', JSON.stringify([newRelease, ...currentLocal]));
    } catch (e) {
        localStorage.setItem('changelog_releases', JSON.stringify([newRelease]));
    }
    
    setIsCreating(false);
  };

  const handleResetData = () => {
    if (confirm("Clear local custom releases? Static file releases will remain.")) {
      localStorage.removeItem('changelog_releases');
      window.location.reload();
    }
  };

  // Filter Logic
  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      // Search Match
      const searchLower = filterState.search.toLowerCase();
      const matchesSearch = 
        release.title.toLowerCase().includes(searchLower) ||
        release.description.toLowerCase().includes(searchLower) ||
        release.version.includes(searchLower) ||
        release.changes.some(c => c.description.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Type Match (if any types selected)
      if (filterState.types.length > 0) {
        const hasType = release.changes.some(c => filterState.types.includes(c.type));
        if (!hasType) return false;
      }

      return true;
    });
  }, [filterState, releases]);

  const toggleFilterType = (type: ChangeType) => {
    setFilterState(prev => {
      const exists = prev.types.includes(type);
      return {
        ...prev,
        types: exists 
          ? prev.types.filter(t => t !== type)
          : [...prev.types, type]
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src="assets/logo.svg" alt={`${APP_CONFIG.name} Logo`} className="w-10 h-10 shadow-sm rounded-xl" />
             <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Keeda<span className="text-blue-600 dark:text-blue-500">Vault</span></h1>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Release System</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden sm:flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
               <button 
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'timeline' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
               >
                  Timeline
               </button>
               <button 
                  onClick={() => setActiveTab('about')}
                   className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'about' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
               >
                  About
               </button>
            </nav>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <a 
              href={APP_CONFIG.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white transition-colors p-1"
              title="View on GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        {activeTab === 'timeline' ? (
            <>
                {/* Intro Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{APP_CONFIG.name} Releases</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                            {APP_CONFIG.description}
                        </p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="mb-10 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Search versions, descriptions, or changes..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                value={filterState.search}
                                onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                            <Filter className="text-slate-400 dark:text-slate-500 w-5 h-5 shrink-0" />
                            {[ChangeType.Feature, ChangeType.BugFix, ChangeType.Improvement, ChangeType.Security].map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleFilterType(type)}
                                    className={`
                                        whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                        ${filterState.types.includes(type) 
                                            ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-600'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Release List */}
                <div className="space-y-2 relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                             <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                             <p>Loading release history...</p>
                        </div>
                    ) : filteredReleases.length > 0 ? (
                        filteredReleases.map(release => (
                            <ReleaseCard key={release.version} release={release} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Layers className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No releases found</h3>
                            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search.</p>
                            <button 
                                onClick={() => setFilterState({ search: '', types: [] })}
                                className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                        <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">About {APP_CONFIG.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400">Version {APP_CONFIG.version}</p>
                    </div>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                    <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                        {APP_CONFIG.description}
                    </p>
                    
                    <h3 className="text-slate-900 dark:text-slate-100">Core Features</h3>
                    <ul className="grid grid-cols-1 gap-2">
                        {APP_CONFIG.features.map((feature, idx) => (
                          <li key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium list-none flex items-start gap-2">
                            <span className="text-blue-500 dark:text-blue-400 font-bold mt-1">•</span>
                            {feature}
                          </li>
                        ))}
                    </ul>
                </div>
                
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                   <button 
                      onClick={handleResetData}
                      className="text-sm text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-lg transition-colors"
                   >
                     Clear Local Cache
                   </button>
                </div>
            </div>
        )}
      </main>

      {/* Release Creation Modal */}
      {isCreating && (
        <ReleaseForm 
          onSave={handleSaveRelease} 
          onCancel={() => setIsCreating(false)} 
        />
      )}
      
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} {APP_CONFIG.name}. Built with React & Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;