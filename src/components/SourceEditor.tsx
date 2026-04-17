import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Source } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SourceEditorProps {
  source: Source;
  onSave: (updatedSource: Source) => void;
  onClose: () => void;
}

export const SourceEditor: React.FC<SourceEditorProps> = ({
  source,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(source.name);
  const [content, setContent] = useState(source.content);

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;
    onSave({
      ...source,
      name: name.trim(),
      content: content.trim()
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold">Edit Source</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Source Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-colors font-medium"
              placeholder="e.g. Research Paper.pdf"
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Content (Text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-colors font-medium resize-none"
              placeholder="Source text content..."
            />
            {source.type === 'pdf' && (
              <p className="text-[10px] text-orange-500 font-bold mt-2">
                Note: This source was extracted from a PDF. Editing the text will update the knowledge base used for AI responses.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-primary-hover transition-all active:scale-95 disabled:bg-gray-200"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
