import React, { useRef } from 'react';
import { Upload, FileText, Trash2, Headphones, Loader2, Edit2, X } from 'lucide-react';
import { Source } from '../types';
import { cn } from '../lib/utils';
import { extractTextFromPdf } from '../lib/pdf';
import { v4 as uuidv4 } from 'uuid';

interface SidebarProps {
  notebookId: string;
  sources: Source[];
  onAddSource: (source: Source, file?: File) => void;
  onDeleteSource: (id: string) => void;
  onEditSource: (source: Source) => void;
  isLoading: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notebookId,
  sources,
  onAddSource,
  onDeleteSource,
  onEditSource,
  isLoading,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let content = '';
    if (file.type === 'application/pdf') {
      content = await extractTextFromPdf(file);
    } else {
      content = await file.text();
    }

    const newSource: Source = {
      id: uuidv4(),
      notebook_id: notebookId,
      name: file.name,
      type: file.type === 'application/pdf' ? 'pdf' : 'text',
      content,
      added_at: Date.now(),
    };

    onAddSource(newSource, file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readySourcesCount = sources.filter(s => s.summary && s.suggested_questions).length;

  return (
    <div className="w-[280px] h-full border-r border-gray-100 bg-[#F9FAFB] flex flex-col p-6 space-y-8 overflow-y-auto relative shadow-2xl md:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sources</h2>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-tight">
            {readySourcesCount} of {sources.length} sources ready
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 -mt-1 -mr-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center group hover:border-primary hover:bg-orange-50 transition-all cursor-pointer bg-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-bold text-[#1F2937]">Upload sources</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">
                PDF, TXT, Markdown
              </p>
            </>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.txt,.md"
          onChange={handleFileUpload}
        />

        <div className="space-y-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="group flex flex-col gap-1 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 transition-all relative"
            >
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => onEditSource(source)}
                  className="p-1 text-gray-300 hover:text-primary transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteSource(source.id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#1F2937] truncate">{source.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pl-10">
                {source.summary ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    READY
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-orange-50 px-1.5 py-0.5 rounded-full animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ANALYZING
                  </div>
                )}
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full uppercase">
                  {source.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
