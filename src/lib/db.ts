import { supabase } from './supabase';
import { Source, Message, Note, Notebook, Podcast } from '../types';

// Helper to get current session user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Notebooks
export async function saveNotebook(notebook: Notebook) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notebooks')
    .upsert({ 
      ...notebook, 
      user_id: user.id,
      updated_at: Date.now() 
    });
  
  if (error) throw error;
}

export async function touchNotebook(id: string) {
  const { error } = await supabase
    .from('notebooks')
    .update({ updated_at: Date.now() })
    .eq('id', id);
  
  if (error) throw error;
}

export async function getAllNotebooks(): Promise<Notebook[]> {
  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function deleteNotebook(id: string) {
  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Sources
export async function saveSource(source: Source) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Saving source with user_id:', user.id);
  const { error } = await supabase
    .from('sources')
    .upsert({ ...source, user_id: user.id });
  
  if (error) {
    console.error('Supabase RLS Error Detail:', error);
    throw error;
  }
  await touchNotebook(source.notebook_id);
}

export async function getAllSources(notebook_id?: string): Promise<Source[]> {
  let query = supabase.from('sources').select('*');
  if (notebook_id) {
    query = query.eq('notebook_id', notebook_id);
  }
  
  const { data, error } = await query.order('added_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function deleteSource(id: string) {
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Messages
export async function saveMessage(message: Message) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('messages')
    .upsert({ ...message, user_id: user.id });
  
  if (error) throw error;
  await touchNotebook(message.notebook_id);
}

export async function getAllMessages(notebook_id?: string): Promise<Message[]> {
  let query = supabase.from('messages').select('*');
  if (notebook_id) {
    query = query.eq('notebook_id', notebook_id);
  }
  
  const { data, error } = await query.order('timestamp', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function clearMessages(notebook_id: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('notebook_id', notebook_id);
  
  if (error) throw error;
}

// Notes
export async function saveNote(note: Note) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notes')
    .upsert({ ...note, user_id: user.id });
  
  if (error) throw error;
  await touchNotebook(note.notebook_id);
}

export async function getAllNotes(notebook_id?: string): Promise<Note[]> {
  let query = supabase.from('notes').select('*');
  if (notebook_id) {
    query = query.eq('notebook_id', notebook_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteNote(id: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Podcasts
export async function savePodcast(podcast: Podcast) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('podcasts')
    .upsert({ ...podcast, user_id: user.id });
  
  if (error) throw error;
  await touchNotebook(podcast.notebook_id);
}

// Storage for PDFs and Audio
export async function uploadFile(bucket: string, path: string, file: Blob | File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  
  if (error) throw error;
  return data;
}

export async function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}
