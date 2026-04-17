import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Copy, Check, Layers, Plus } from 'lucide-react';
import { Flashcard } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface FlashcardSetProps {
  cards: Flashcard[];
}

export const FlashcardSet: React.FC<FlashcardSetProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleCopy = () => {
    const text = `Q: ${currentCard.front}\nA: ${currentCard.back}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-gray-100 rounded-[36px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] my-8">
      {/* Header - Refined "FLASH CARD PRO" Style */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
           <div className="bg-white/15 p-1.5 rounded-xl backdrop-blur-sm">
             <Layers className="w-4 h-4 text-white" />
           </div>
           <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Flash Card Pro</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
             <Plus className="w-3.5 h-3.5 text-white" />
           </div>
        </div>
      </div>

      {/* Card Content Area - Clean Minimalist Background */}
      <div className="p-8 pb-10 flex flex-col items-center gap-10 bg-[#F9FAFB]">
        <div className="relative w-full min-h-[320px] aspect-[16/11] perspective-1000">
          <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full h-full relative preserve-3d cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-[32px] border-2 border-orange-50/50 px-6 py-10 flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] group transition-all hover:border-orange-100/50">
              <span className="absolute top-6 left-8 text-[9px] font-black text-gray-400/80 uppercase tracking-[0.2em] bg-white pr-3">01. Question</span>
              <div className="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar mt-4 px-2">
                <p className="text-lg md:text-xl font-bold text-[#1F2937] leading-snug text-center tracking-tight break-words w-full">
                  {currentCard.front}
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                 <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                   <RotateCcw className="w-4 h-4" />
                 </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-white rounded-[32px] border-2 border-primary/10 px-6 py-10 flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] rotate-y-180">
              <span className="absolute top-6 left-8 text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] bg-white pr-3">02. Answer</span>
              <div className="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar mt-4 px-2">
                <p className="text-[15px] md:text-base font-medium text-[#4B5563] leading-relaxed text-center break-words w-full">
                  {currentCard.back}
                </p>
              </div>
               <div className="mt-4 flex justify-center">
                 <div className="p-2 rounded-full bg-orange-50/30 text-primary/40">
                   <RotateCcw className="w-4 h-4" />
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls - Refined Layout */}
        <div className="flex items-center justify-between w-full max-w-[340px]">
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="p-4 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-primary hover:border-orange-100 hover:bg-orange-50/30 transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center gap-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                {currentIndex + 1} <span className="text-gray-200">/</span> {cards.length}
             </p>
             <div className="flex gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
               {cards.map((_, i) => (
                 <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500", i === currentIndex ? "bg-primary w-5" : "bg-gray-200")} />
               ))}
             </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="p-4 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-primary hover:border-orange-100 hover:bg-orange-50/30 transition-all shadow-sm active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer Actions - Minimalist Styling */}
      <div className="px-8 py-5 border-t border-gray-50 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
           <button 
             onClick={handleCopy}
             className="p-2.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90"
             title="Copy flashcard"
           >
             {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
           </button>
        </div>
        
        <button 
           onClick={() => setIsFlipped(!isFlipped)}
           className="px-10 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_-5px_rgba(226,122,12,0.3)] hover:bg-primary-hover hover:translate-y-[-2px] active:translate-y-0 transition-all"
        >
          {isFlipped ? "Show Question" : "Reveal Answer"}
        </button>
      </div>
    </div>
  );
};
