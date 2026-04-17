import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, BookOpen, ChevronUp, GripVertical, Copy, Check } from 'lucide-react';
import { Message, Source } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { FlashcardSet } from './FlashcardSet';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  selectedSources: Source[];
  activeGuide?: Source | null;
}

const Citation: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => (
  <span className={cn(
    "inline-flex items-center justify-center rounded-[6px] px-1.5 py-0.5 text-[9px] font-black mx-1 cursor-default select-none transition-transform hover:scale-110",
    isUser 
      ? "bg-white/20 text-white" 
      : "bg-orange-100 text-[#E27A0C] border border-orange-200"
  )}>
    {text.replace(/[\[\]]/g, '')}
  </span>
);

const MessageContent: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  const renderTextWithCitations = (text: string) => {
    return text.split(/(\[Source.*?\])/g).map((part, i) => {
      if (part.startsWith('[Source')) {
        return <Citation key={i} text={part} isUser={isUser} />;
      }
      return part;
    });
  };

  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown 
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'flashcards') {
              try {
                const cards = JSON.parse(String(children).replace(/\n$/, ''));
                return <FlashcardSet cards={cards} />;
              } catch (e) {
                return <pre className="bg-gray-50 p-4 rounded-xl text-xs overflow-auto"><code>{children}</code></pre>;
              }
            }
            return inline ? (
              <code className="bg-gray-100 px-1 rounded text-orange-600 font-bold" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-50 p-4 rounded-xl text-xs overflow-auto" {...props}>
                <code>{children}</code>
              </pre>
            );
          },
          p: ({ children }) => (
            <p>
              {React.Children.map(children, child => 
                typeof child === 'string' ? renderTextWithCitations(child) : child
              )}
            </p>
          ),
          li: ({ children }) => (
            <li>
              {React.Children.map(children, child => 
                typeof child === 'string' ? renderTextWithCitations(child) : child
              )}
            </li>
          ),
          strong: ({ children }) => <strong className="font-bold">{children}</strong>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedSources,
  activeGuide
}) => {
  const [input, setInput] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] relative overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-24 space-y-6 md:space-y-8">
        {/* Notebook Guide */}
        {activeGuide && (
          <div className="bg-orange-50/50 border border-orange-100 rounded-[24px] md:rounded-3xl p-4 md:p-6 relative group mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider">Notebook Guide</h3>
              </div>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronUp className={cn("w-5 h-5 transition-transform", !showGuide && "rotate-180")} />
              </button>
            </div>
            
            <AnimatePresence>
              {showGuide && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[#1F2937] text-sm md:text-[15px] leading-relaxed font-medium">
                    {activeGuide.summary}
                  </p>
                  
                  {activeGuide.suggested_questions && activeGuide.suggested_questions.length > 0 && (
                    <div className="mt-4 md:mt-6 flex flex-wrap gap-2">
                       {activeGuide.suggested_questions.map((q, i) => (
                         <button
                           key={i}
                           onClick={() => onSendMessage(q)}
                           className="text-[10px] md:text-xs bg-white border border-orange-100 text-primary px-3 py-1.5 rounded-full font-bold hover:bg-orange-100 transition-colors"
                         >
                           {q}
                         </button>
                       ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 text-[#1F2937] opacity-60">
           <GripVertical className="w-4 h-4" />
           <h4 className="text-base md:text-lg font-bold">Chat</h4>
           <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-widest ml-2">Source-grounded answers with inline citations</span>
        </div>

        {messages.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <p className="text-gray-400 italic font-medium text-sm md:text-base">No messages yet. Ask a question to begin.</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={message.id}
              className={cn(
                "flex flex-col gap-2 w-full max-w-[95%] md:max-w-[85%]",
                message.role === 'user' ? "ml-auto" : "mr-auto"
              )}
            >
              <div className={cn(
                "px-4 md:px-6 py-4 md:py-5 rounded-[24px] md:rounded-[28px] text-sm md:text-[15.5px] leading-relaxed relative group shadow-sm transition-all",
                message.role === 'user' 
                  ? "bg-primary text-white font-bold rounded-tr-none shadow-orange-100 ring-4 ring-primary/5" 
                  : "bg-white text-[#1F2937] font-medium rounded-tl-none border border-gray-100 hover:shadow-md"
              )}>
                {message.role === 'assistant' && (
                  <>
                    <div className="hidden sm:flex absolute -left-10 top-2 w-8 h-8 rounded-lg bg-orange-50 items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="absolute -right-2 sm:-right-10 -top-10 sm:top-2 p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all bg-white sm:bg-transparent rounded-full border border-gray-100 sm:border-none shadow-sm sm:shadow-none"
                      title="Copy to clipboard"
                    >
                      {copiedId === message.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </>
                )}
                
                <MessageContent content={message.content} isUser={message.role === 'user'} />
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mr-auto bg-white px-5 py-3 md:px-6 md:py-4 rounded-[24px] md:rounded-[28px] shadow-sm border border-gray-100"
          >
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Researching...</span>
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 md:px-8">
        <form onSubmit={handleSubmit} className="relative w-full shadow-2xl rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your sources..."
            className="w-full py-3.5 md:py-4 pl-5 md:pl-6 pr-14 md:pr-16 rounded-full border border-gray-100 bg-white outline-none text-sm md:text-[15px] font-medium shadow-lg focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover active:scale-95 disabled:bg-gray-200 disabled:shadow-none transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
