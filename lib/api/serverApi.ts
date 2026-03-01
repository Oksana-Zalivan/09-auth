import { cookies } from 'next/headers';
import { api } from './api';
import type { User } from '@/types/user';
import type { Note } from '@/types/note';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
}

export async function fetchNotes(params: FetchNotesParams): Promise<FetchNotesResponse> {
  const { data } = await api.get('/notes', {
    params,
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get(`/notes/${id}`, {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return data;
}

export async function checkSession(): Promise<User | null> {
  const { data } = await api.get<User | null>('/auth/session', {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return data ?? null;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me', {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return data;
}
