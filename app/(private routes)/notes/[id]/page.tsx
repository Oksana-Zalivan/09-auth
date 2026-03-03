import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';

import NoteDetailsClient from './NoteDetails.client';
import { fetchNoteById } from '@/lib/api/serverApi';

type PageProps = {
  params: { id: string };
};

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

function buildDescription(content?: string) {
  if (!content) return 'Open note details in NoteHub.';
  const trimmed = content.trim().replace(/\s+/g, ' ');
  return trimmed.length > 140 ? trimmed.slice(0, 137) + '...' : trimmed;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const SITE_URL = getSiteUrl();

  try {
    const note = await fetchNoteById(id);

    const titleText = note?.title?.trim() || `Note ${id}`;
    const description = buildDescription(note?.content);
    const title = `${titleText} | NoteHub`;
    const url = `${SITE_URL}/notes/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        images: [
          {
            url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
            width: 1200,
            height: 630,
            alt: `NoteHub note: ${titleText}`,
          },
        ],
        type: 'article',
      },
    };
  } catch {
    const title = 'Note details | NoteHub';
    const description = 'Open note details in NoteHub.';
    const url = `${SITE_URL}/notes/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        images: [
          {
            url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
            width: 1200,
            height: 630,
            alt: 'NoteHub note details',
          },
        ],
        type: 'website',
      },
    };
  }
}

export default async function NoteDetailsPage({ params }: PageProps) {
  const { id } = params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
