import React, { useState } from 'react';
import { Plus, StickyNote, Trash2, Hash, GripVertical } from 'lucide-react';
import { Note } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';

interface ScratchpadProps {
  notebookId: string;
  notes: Note[];
  onAddNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  notebookId,
  notes,
  onAddNote,
  onDeleteNote
}) => {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: uuidv4(),
      notebook_id: notebookId,
      content: newNote.trim(),
      created_at: Date.now(),
    };
    
    onAddNote(note);
    setNewNote('');
    setIsAdding(false);
  };

  return (
    <div className="w-full md:w-[320px] lg:w-[380px] h-full border-l border-gray-100 bg-[#F9FAFB] flex flex-col p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Notes</h2>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-tight">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:border-gray-300 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <textarea
                autoFocus
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onBlur={() => !newNote.trim() && setIsAdding(false)}
                placeholder="Write a note..."
                className="w-full p-4 rounded-2xl border border-primary/20 bg-white outline-none text-sm font-medium shadow-sm focus:border-primary transition-all resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover disabled:bg-gray-200"
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {notes.length === 0 && !isAdding ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 grayscale">
               <GripVertical className="w-6 h-6 mb-2" />
               <p className="text-xs font-bold uppercase tracking-widest">No Notes</p>
            </div>
          ) : (
            notes.sort((a, b) => b.created_at - a.created_at).map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-200 transition-all flex gap-3 relative"
              >
                <div className="mt-0.5 text-gray-200 group-hover:text-gray-300">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1F2937] leading-relaxed font-medium">
                    {note.content}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
