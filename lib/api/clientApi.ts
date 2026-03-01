import { api } from './api';
import type { User } from '@/types/user';
import type { Note, NoteTag } from '@/types/note';

export type FetchNotesParams = {
  page?: number;
  perPage?: number; 
  search?: string;
  tag?: NoteTag;
};

export type FetchNotesResponse = {
  notes: Note[];
  totalPages: number;
};

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResponse> {
  const { page = 1, perPage = 12, search, tag } = params;

  const { data } = await api.get('/notes', {
    params: { page, perPage, search, tag },
  });

  return data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get(`/notes/${id}`);
  return data;
}

export type CreateNoteRequest = {
  title: string;
  content: string;
  tag: NoteTag;
};

export async function createNote(payload: CreateNoteRequest): Promise<Note> {
  const { data } = await api.post('/notes', payload);
  return data;
}

export async function deleteNote(id: string): Promise<Note> {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
}

type AuthBody = { email: string; password: string };

export async function register(body: AuthBody): Promise<User> {
  const { data } = await api.post('/auth/register', body);
  return data;
}

export async function login(body: AuthBody): Promise<User> {
  const { data } = await api.post('/auth/login', body);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function checkSession(): Promise<User | null> {
  const { data } = await api.get('/auth/session');
  return data ?? null;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/users/me');
  return data;
}

export async function updateMe(payload: { username: string }): Promise<User> {
  const { data } = await api.patch('/users/me', payload);
  return data;
}
