import React, { useState, useEffect } from 'react';
import { Release, ChangeType, ChangeItem } from '../types';
import { Badge } from './Badge';
import { X, Plus, Save, Sparkles, Trash2, Calendar, AlertTriangle, Eye, Edit2 } from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { marked } from 'marked';

interface ReleaseFormProps {
  onSave: (release: Release) => void;
  onCancel: () => void;
}

export const ReleaseForm: React.FC<ReleaseFormProps> = ({ onSave, onCancel }) => {
  const [version, setVersion] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  
  // Change List State
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  
  // New Change Input State
  const [newChangeDesc, setNewChangeDesc] = useState('');
  const [newChangeType, setNewChangeType] = useState<ChangeType>(ChangeType.Feature);
  const [newChangeDetails, setNewChangeDetails] = useState('');
  const [detailsMode, setDetailsMode] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  // Handle markdown parsing for preview
  useEffect(() => {
    if (detailsMode === 'preview' && newChangeDetails) {
      const parse = async () => {
        try {
          const html = await marked.parse(newChangeDetails);
          setPreviewHtml(html);
        } catch (e) {
          console.error('Markdown parsing error:', e);
          setPreviewHtml(newChangeDetails);
        }
      };
      parse();
    }
  }, [detailsMode, newChangeDetails]);

  const handleAddChange = () => {
    if (!newChangeDesc.trim()) return;

    const newChange: ChangeItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: newChangeType,
      description: newChangeDesc,
      details: newChangeDetails.trim() || undefined
    };

    setChanges([...changes, newChange]);
    setNewChangeDesc('');
    setNewChangeDetails('');
    setDetailsMode('write');
    setNewChangeType(ChangeType.Feature);
  };

  const removeChange = (id: string) => {
    setChanges(changes.filter(c => c.id !== id));
  };

  const handleGenerateDraft = async () => {
    if (changes.length === 0) return;
    setIsGenerating(true);
    const draft = await geminiService.generateDraftDescription(version, changes);
    if (draft) setDescription(draft);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!version || !title || !description) return;

    const newRelease: Release = {
        version,
        date,
        title,
        description,
        isBreaking,
        changes,
        author: {
            name: "You",
            avatar: "https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff"
        }
    };
    onSave(newRelease);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] transition-colors border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Release</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Drafting version details and changelog</p>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Version Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Version Number</label>
                <input 
                    type="text" 
                    placeholder="e.g. 1.2.0"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
             </div>
             <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Release Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Release Title</label>
            <input 
                type="text" 
                placeholder="e.g. The Performance Update"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <input 
                type="checkbox" 
                id="breaking"
                checked={isBreaking}
                onChange={e => setIsBreaking(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:bg-slate-700"
            />
            <label htmlFor="breaking" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                <AlertTriangle size={16} className="text-amber-500" />
                Contains Breaking Changes
            </label>
          </div>

          {/* Changes Builder */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Changes</h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full font-medium">{changes.length} added</span>
             </div>
             
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Type</label>
                        <select 
                            value={newChangeType}
                            onChange={e => setNewChangeType(e.target.value as ChangeType)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        >
                            {Object.values(ChangeType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Summary</label>
                        <input 
                            type="text" 
                            placeholder="Brief description of the change..."
                            value={newChangeDesc}
                            onChange={e => setNewChangeDesc(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400"
                        />
                    </div>
                 </div>
                 
                 <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Details (Optional)</label>
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 p-0.5">
                            <button
                                onClick={() => setDetailsMode('write')}
                                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${detailsMode === 'write' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <Edit2 size={12} /> Write
                            </button>
                            <button
                                onClick={() => setDetailsMode('preview')}
                                className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${detailsMode === 'preview' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <Eye size={12} /> Preview
                            </button>
                        </div>
                    </div>
                    
                    {detailsMode === 'write' ? (
                        <textarea 
                            value={newChangeDetails}
                            onChange={e => setNewChangeDetails(e.target.value)}
                            placeholder="Add technical details, code snippets, or migration guides (Markdown supported)..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm min-h-[100px] font-mono placeholder:text-slate-400"
                        />
                    ) : (
                        <div className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 min-h-[100px] prose prose-sm prose-slate dark:prose-invert max-w-none overflow-y-auto max-h-[200px]">
                            {newChangeDetails ? (
                                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                            ) : (
                                <span className="text-slate-400 italic">Nothing to preview</span>
                            )}
                        </div>
                    )}
                 </div>

                 <button 
                    onClick={handleAddChange}
                    disabled={!newChangeDesc.trim()}
                    className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    <Plus size={16} /> Add Change
                 </button>
             </div>

             {/* Changes List */}
             <div className="mt-6 space-y-3">
                {changes.map((change) => (
                    <div key={change.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                        <div className="mt-0.5"><Badge type={change.type} /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{change.description}</p>
                            {change.details && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{change.details}</div>
                            )}
                        </div>
                        <button 
                            onClick={() => removeChange(change.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {changes.length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic">
                        No changes added yet. Use the form above to build your changelog.
                    </div>
                )}
             </div>
          </div>

          {/* Description & AI */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Release Summary</label>
                <button 
                    onClick={handleGenerateDraft}
                    disabled={changes.length === 0 || isGenerating}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 transition-colors"
                >
                    {isGenerating ? (
                         <span className="animate-pulse">Generating...</span>
                    ) : (
                         <>
                            <Sparkles size={14} />
                            <span>Generate with AI</span>
                         </>
                    )}
                </button>
            </div>
            <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Overview of what this release achieves..."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[120px] placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Tip: Add your changes first, then click "Generate with AI" to get a drafted summary.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-b-2xl flex items-center justify-end gap-3">
            <button 
                onClick={onCancel}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                disabled={!version || !title || !description}
                className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <Save size={18} />
                Publish Release
            </button>
        </div>

      </div>
    </div>
  );
};