import React from 'react';
import { Plus, Book, ArrowRight, Clock, Sparkles, Trash2 } from 'lucide-react';
import { Notebook } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  notebooks: Notebook[];
  onCreateNotebook: () => void;
  onSelectNotebook: (id: string) => void;
  onDeleteNotebook: (id: string, e: React.MouseEvent) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  notebooks,
  onCreateNotebook,
  onSelectNotebook,
  onDeleteNotebook
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-4xl pt-12 md:pt-24 pb-12 md:pb-16 px-6 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-primary border border-orange-100 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          AI-Powered Research Assistant
        </div>
        
        <div className="flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Lumina Notebook Logo" 
            className="w-48 md:w-64 h-auto"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-sm md:text-base px-2">
          Upload your documents, ask questions, and get source-grounded answers with citations. Your personal AI research companion.
        </p>

        <button
          onClick={onCreateNotebook}
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-primary-hover transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Notebook
        </button>
      </section>

      {/* Notebooks List */}
      <section className="w-full max-w-6xl px-6 pb-24">
        <h2 className="text-xl font-bold mb-8">Your Notebooks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.length === 0 ? (
            <div className="col-span-full py-20 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400">
              <Book className="w-10 h-10 mb-4 opacity-20" />
              <p>No notebooks yet. Create one to get started.</p>
            </div>
          ) : (
            notebooks.map((notebook) => (
              <motion.div
                key={notebook.id}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => onSelectNotebook(notebook.id)}
                className="group bg-white border border-gray-100 rounded-[28px] p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-orange-100 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => onDeleteNotebook(notebook.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Notebook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                  <Book className="w-5 h-5 text-primary" />
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors truncate">{notebook.name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed h-[40px]">
                  {notebook.description || "No description provided."}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                   <div className="flex flex-col gap-0.5">
                     <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Modified</p>
                     <div className="flex items-center gap-1.5 text-gray-600 text-[11px] font-medium">
                       <Clock className="w-3 h-3 text-gray-400" />
                       {new Date(notebook.updated_at || notebook.created_at).toLocaleDateString(undefined, {
                         month: 'short',
                         day: 'numeric',
                         year: 'numeric'
                       })}
                     </div>
                   </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
