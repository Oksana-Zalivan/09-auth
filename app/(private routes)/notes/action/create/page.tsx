import type { Metadata } from 'next';
import CreateNoteClient from './CreateNoteClient';

export const metadata: Metadata = {
  title: 'Create note | NoteHub',
  description: 'Create a new note in NoteHub.',
  openGraph: {
    title: 'Create note | NoteHub',
    description: 'Create a new note in NoteHub.',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'Create note in NoteHub',
      },
    ],
    type: 'website',
  },
};

export default function CreateNotePage() {
  return (
    <main>
      <h1>Create note</h1>
      <CreateNoteClient />
    </main>
  );
}
