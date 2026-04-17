import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Scratchpad } from './components/Scratchpad';
import { Dashboard } from './components/Dashboard';
import { SourceEditor } from './components/SourceEditor';
import { AudioPlayer } from './components/AudioPlayer';
import { Source, Message, Note, Notebook } from './types';
import { getAllSources, saveSource, deleteSource, 
  getAllMessages, saveMessage, clearMessages,
  getAllNotes, saveNote, deleteNote,
  getAllNotebooks, saveNotebook, deleteNotebook,
  uploadFile, getFileUrl, savePodcast
} from './lib/db';
import { generateChatResponse, generateSourceInsights, generatePodcastScript, generateTTS } from './lib/ai';
import { createWavBlob } from './lib/audio';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, X, Play, Pause, Headphones, ArrowLeft, Edit3, Mic2, Loader2, Check, Menu, MessageSquare, StickyNote, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './screens/Auth';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Source | null>(null);
  
  // Edit states
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [isEditingNotebookName, setIsEditingNotebookName] = useState(false);
  const [tempNotebookName, setTempNotebookName] = useState('');
  
  // Responsive states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'scratchpad'>('chat');
  
  // Podcast state
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const loadNotebooks = async () => {
        const saved = await getAllNotebooks();
        setNotebooks(saved);
      };
      loadNotebooks();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeNotebookId) {
      const loadNotebookData = async () => {
        const [savedSources, savedMessages, savedNotes] = await Promise.all([
          getAllSources(activeNotebookId),
          getAllMessages(activeNotebookId),
          getAllNotes(activeNotebookId)
        ]);
        setSources(savedSources);
        setMessages(savedMessages);
        setNotes(savedNotes);
        
        // If there's at least one source, set the first one's summary as the "guide" content
        if (savedSources.length > 0) {
          setActiveGuide(savedSources[0]);
        } else {
          setActiveGuide(null);
        }
      };
      loadNotebookData();
      
      const nb = notebooks.find(n => n.id === activeNotebookId);
      if (nb) setTempNotebookName(nb.name);
    } else {
      setSources([]);
      setMessages([]);
      setNotes([]);
      setActiveGuide(null);
      setIsEditingNotebookName(false);
    }
  }, [activeNotebookId, notebooks]);

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  const handleCreateNotebook = async () => {
    if (!user) return;
    const now = Date.now();
    const newNotebook: Notebook = {
      id: uuidv4(),
      user_id: user.id,
      name: 'New Notebook',
      description: 'Add a description here...',
      created_at: now,
      updated_at: now
    };
    await saveNotebook(newNotebook);
    setNotebooks(prev => [newNotebook, ...prev]);
    setActiveNotebookId(newNotebook.id);
  };

  const handleDeleteNotebook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't select the notebook
    // Note: confirm() is avoided for iframe compatibility
    await deleteNotebook(id);
    setNotebooks(prev => prev.filter(n => n.id !== id));
  };

  const handleUpdateNotebookName = async () => {
    if (activeNotebook && tempNotebookName.trim()) {
      const updated = { ...activeNotebook, name: tempNotebookName.trim() };
      await saveNotebook(updated);
      setNotebooks(prev => prev.map(n => n.id === updated.id ? updated : n));
      setIsEditingNotebookName(false);
    }
  };

  const handleAddSource = async (source: Source, file?: File) => {
    setIsAddingSource(true);
    try {
      let file_url = source.file_url;
      if (file) {
        const path = `${user?.id}/${activeNotebookId}/${source.id}-${file.name}`;
        await uploadFile('documents', path, file);
        file_url = await getFileUrl('documents', path);
      }

      const insights = await generateSourceInsights(source.content);
      const enrichedSource: Source = { 
        ...source, 
        summary: insights.summary,
        suggested_questions: insights.questions,
        file_url 
      };
      await saveSource(enrichedSource);
      setSources(prev => [...prev, enrichedSource]);
      if (!activeGuide) setActiveGuide(enrichedSource);
    } catch (error) {
      console.error("Error adding source:", error);
      await saveSource(source);
      setSources(prev => [...prev, source]);
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleUpdateSource = async (updatedSource: Source) => {
    await saveSource(updatedSource);
    setSources(prev => prev.map(s => s.id === updatedSource.id ? updatedSource : s));
    setEditingSource(null);
    if (activeGuide?.id === updatedSource.id) {
       // Refresh insights if content changed? 
       // For now just update the content in memory
       setActiveGuide(updatedSource);
    }
  };

  const handleDeleteSource = async (id: string) => {
    await deleteSource(id);
    setSources(prev => prev.filter(s => s.id !== id));
    if (activeGuide?.id === id) setActiveGuide(sources.find(s => s.id !== id) || null);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeNotebookId) return;
    const userMessage: Message = {
      id: uuidv4(),
      notebook_id: activeNotebookId,
      role: 'user',
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setIsLoading(true);
    try {
      const response = await generateChatResponse(content, sources, messages);
      const aiMessage: Message = {
        id: uuidv4(),
        notebook_id: activeNotebookId,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (note: Note) => {
    await saveNote(note);
    setNotes(prev => [note, ...prev]);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleGeneratePodcast = async () => {
    if (sources.length === 0 || !activeNotebookId) return;
    setIsGeneratingPodcast(true);
    try {
      const script = await generatePodcastScript(sources);
      const base64Audio = await generateTTS(script);
      if (base64Audio) {
        const audioBlob = createWavBlob(base64Audio);
        
        // Upload to Supabase Storage
        const podcastId = uuidv4();
        const path = `${user?.id}/${activeNotebookId}/${podcastId}.wav`;
        await uploadFile('podcasts', path, audioBlob);
        const publicUrl = await getFileUrl('podcasts', path);

        // Save metadata to DB
        await savePodcast({
          id: podcastId,
          notebook_id: activeNotebookId,
          audio_url: publicUrl,
          script,
          created_at: Date.now()
        });

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(publicUrl);
      }
    } catch (error) {
      console.error("Error generating podcast:", error);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!activeNotebookId) {
    return (
      <Dashboard 
        notebooks={notebooks}
        onCreateNotebook={handleCreateNotebook}
        onSelectNotebook={setActiveNotebookId}
        onDeleteNotebook={handleDeleteNotebook}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] font-sans text-[#1F2937] overflow-hidden">
      {/* Header */}
      <header className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30">
        <div className="flex items-center gap-2 md:gap-6">
          <button 
            onClick={() => setActiveNotebookId(null)}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain hidden sm:block"
            referrerPolicy="no-referrer"
          />
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 md:gap-3">
             {isEditingNotebookName ? (
               <div className="flex items-center gap-2">
                 <input
                   autoFocus
                   type="text"
                   value={tempNotebookName}
                   onChange={(e) => setTempNotebookName(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleUpdateNotebookName()}
                   className="text-base md:text-xl font-bold tracking-tight border-b-2 border-primary outline-none max-w-[120px] md:max-w-none"
                 />
                 <button 
                   onClick={handleUpdateNotebookName}
                   className="p-1 text-primary hover:text-primary-hover"
                 >
                   <Check className="w-5 h-5" />
                 </button>
               </div>
             ) : (
               <>
                 <h1 className="text-base md:text-xl font-bold tracking-tight truncate max-w-[150px] md:max-w-none">
                   {activeNotebook?.name}
                 </h1>
                 <button 
                   onClick={() => setIsEditingNotebookName(true)}
                   className="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"
                 >
                   <Edit3 className="w-4 h-4" />
                 </button>
               </>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={signOut}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={handleGeneratePodcast}
            disabled={sources.length === 0 || isGeneratingPodcast}
            className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-xl text-xs md:text-sm font-bold shadow-sm hover:border-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isGeneratingPodcast ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic2 className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            )}
            <span className="hidden sm:inline">Podcast</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar with Drawer on mobile */}
        <div className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} onClick={() => setIsSidebarOpen(false)} />
        
        <div className={cn(
          "absolute inset-y-0 left-0 z-50 transform transition-transform md:relative md:translate-x-0 md:z-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar 
            notebookId={activeNotebookId}
            sources={sources}
            onAddSource={handleAddSource}
            onDeleteSource={handleDeleteSource}
            onEditSource={setEditingSource}
            isLoading={isAddingSource}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 flex flex-col min-w-0 bg-white shadow-inner relative">
          {/* Tabs for Mobile */}
          <div className="md:hidden flex bg-white border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'chat' ? "border-primary text-primary" : "border-transparent text-gray-400"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('scratchpad')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'scratchpad' ? "border-primary text-primary" : "border-transparent text-gray-400"
              )}
            >
              <StickyNote className="w-4 h-4" />
              Notes
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={cn(
              "flex-1 flex-col min-w-0",
              activeTab === 'chat' ? "flex" : "hidden md:flex"
            )}>
              <Chat 
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                selectedSources={sources}
                activeGuide={activeGuide}
              />
            </div>

            <div className={cn(
              "w-full md:w-[320px] lg:w-[380px] flex-shrink-0",
              activeTab === 'scratchpad' ? "block" : "hidden md:block"
            )}>
              <Scratchpad 
                notebookId={activeNotebookId}
                notes={notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Audio Player Overlay */}
      <AnimatePresence>
        {audioUrl && (
          <AudioPlayer 
            url={audioUrl}
            onClose={() => setAudioUrl(null)}
          />
        )}
      </AnimatePresence>

      {/* Source Editor Modal */}
      <AnimatePresence>
        {editingSource && (
          <SourceEditor 
            source={editingSource}
            onSave={handleUpdateSource}
            onClose={() => setEditingSource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
