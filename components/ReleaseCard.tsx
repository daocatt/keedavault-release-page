import React, { useState } from 'react';
import { Release, ChangeType } from '../types';
import { Badge } from './Badge';
import { Sparkles, Bot, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { marked } from 'marked';

interface ReleaseCardProps {
  release: Release;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({ release }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  const handleGenerateSummary = async (audience: 'technical' | 'general') => {
    setIsLoadingAI(true);
    setChatMode(false);
    const result = await geminiService.summarizeRelease(release, audience);
    setSummary(result);
    setIsLoadingAI(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoadingAI(true);
    const result = await geminiService.chatWithRelease(release, question);
    setChatResponse(result);
    setIsLoadingAI(false);
  };

  const renderMarkdown = (text: string) => {
     // Assumption: marked.parse renders synchronously in this environment or returns string.
     // For complex setups, an effect would be better, but for simple change details this is performant.
     const html = marked.parse(text) as string;
     return { __html: html };
  };

  return (
    <div className="relative pl-8 sm:pl-12 py-6 group">
      {/* Timeline Connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 group-last:bottom-auto group-last:h-6"></div>
      <div className="absolute left-[-4px] top-8 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-950 bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors"></div>

      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            v{release.version}
            {release.isBreaking && (
              <span className="text-xs font-bold uppercase tracking-wide text-rose-600 border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full">
                Breaking
              </span>
            )}
          </h2>
          <time className="text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date(release.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
             <img src={release.author.avatar} alt={release.author.name} className="w-6 h-6 rounded-full border border-white dark:border-slate-800 shadow-sm" />
             <span className="text-xs text-slate-600 dark:text-slate-400">Released by <span className="font-semibold text-slate-800 dark:text-slate-200">{release.author.name}</span></span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-shadow hover:shadow-md dark:shadow-none">
        <div className="flex justify-between items-start">
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-6">{release.description}</p>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => setChatMode(!chatMode)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors"
                    title="Ask AI about this release"
                >
                    <MessageSquare size={18} />
                </button>
                <div className="relative group/ai">
                    <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 rounded-lg transition-colors">
                        <Sparkles size={18} />
                    </button>
                    {/* Dropdown for summary types */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-1 hidden group-hover/ai:block z-10">
                        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-2 uppercase tracking-wider">Summarize For</div>
                        <button 
                            onClick={() => handleGenerateSummary('general')}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md flex items-center gap-2"
                        >
                            <span>🏢</span> Management
                        </button>
                        <button 
                            onClick={() => handleGenerateSummary('technical')}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md flex items-center gap-2"
                        >
                            <span>👨‍💻</span> Developers
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* AI Output Section */}
        {(summary || chatMode || isLoadingAI) && (
            <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <Bot size={16} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide">Gemini Intelligence</span>
                </div>
                
                <div className="p-4">
                    {isLoadingAI ? (
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm animate-pulse">
                            <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                            <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                            Thinking...
                        </div>
                    ) : chatMode ? (
                         <div className="space-y-4">
                            {chatResponse && (
                                <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 mb-3">
                                    {chatResponse}
                                </div>
                            )}
                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Ask about this release (e.g., 'Does this fix the login bug?')"
                                    className="flex-1 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 dark:text-white rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500 outline-none px-3 py-1.5"
                                />
                                <button type="submit" className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-700 dark:hover:bg-purple-500">
                                    Ask
                                </button>
                            </form>
                         </div>
                    ) : (
                        <div className="prose prose-sm prose-purple dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                           <div dangerouslySetInnerHTML={{ __html: summary?.replace(/\n/g, '<br/>') || '' }} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Change List */}
        <div className="space-y-3">
          {release.changes.slice(0, isExpanded ? undefined : 3).map((change) => (
            <div key={change.id} className="flex items-start gap-3 text-sm">
               <div className="mt-0.5 shrink-0">
                  <Badge type={change.type} />
               </div>
               <div className="flex-1">
                 <p className="text-slate-800 dark:text-slate-200 font-medium">{change.description}</p>
                 {change.details && (
                   <div 
                        className="text-slate-500 dark:text-slate-400 mt-1 text-xs leading-relaxed prose prose-sm prose-slate dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>li]:m-0"
                        dangerouslySetInnerHTML={renderMarkdown(change.details)} 
                   />
                 )}
               </div>
            </div>
          ))}
        </div>

        {release.changes.length > 3 && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
                {isExpanded ? (
                    <>Show less <ChevronUp size={16} /></>
                ) : (
                    <>Show {release.changes.length - 3} more updates <ChevronDown size={16} /></>
                )}
            </button>
        )}
      </div>
    </div>
  );
};