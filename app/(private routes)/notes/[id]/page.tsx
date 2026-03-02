import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import NoteDetailsClient from './NoteDetails.client';
import { fetchNoteById } from '@/lib/api/serverApi';

const SITE_URL = 'https://08-zustand-six-gold.vercel.app';

type PageProps = {
  params: Promise<{ id: string }>;
};

function buildDescription(content?: string) {
  if (!content) return 'Open note details in NoteHub.';
  const trimmed = content.trim().replace(/\s+/g, ' ');
  return trimmed.length > 140 ? trimmed.slice(0, 137) + '...' : trimmed;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const note = await fetchNoteById(id);

    const titleText = note?.title?.trim() || `Note ${id}`;
    const descriptionText = buildDescription(note?.content);

    const title = `${titleText} | NoteHub`;
    const description = descriptionText;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/notes/${id}`,
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
    const title = `Note details | NoteHub`;
    const description = 'Open note details in NoteHub.';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/notes/${id}`,
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
  const { id } = await params;

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
