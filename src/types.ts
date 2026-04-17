export interface Notebook {
  id: string;
  user_id?: string; // Linked to auth.users
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
}

export interface Source {
  id: string;
  user_id?: string; // Linked to auth.users
  notebook_id: string;
  name: string;
  type: 'pdf' | 'text' | 'markdown';
  content: string;
  file_url?: string; // URL to the file in Supabase Storage
  summary?: string;
  suggested_questions?: string[];
  added_at: number;
}

export interface Podcast {
  id: string;
  user_id?: string; // Linked to auth.users
  notebook_id: string;
  audio_url: string;
  script?: string;
  created_at: number;
}

export interface Message {
  id: string;
  user_id?: string; // Linked to auth.users
  notebook_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[]; // IDs of sources cited
}

export interface Note {
  id: string;
  user_id?: string; // Linked to auth.users
  notebook_id: string;
  content: string;
  title?: string;
  created_at: number;
  color?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface NotebookState {
  activeNotebook: Notebook | null;
  sources: Source[];
  messages: Message[];
  notes: Note[];
}
