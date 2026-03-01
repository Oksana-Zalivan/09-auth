import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import NotesClient from './Notes.client';
import { fetchNotes } from '@/lib/api/clientApi';
import type { NoteTag } from '@/types/note';

const PER_PAGE = 12;

const SITE_URL = 'https://08-zustand-six-gold.vercel.app';

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

function normalizeTag(raw: string | undefined): NoteTag | undefined {
  if (!raw || raw === 'all') return undefined;
  return raw as NoteTag;
}

function formatFilterLabel(raw: string | undefined) {
  if (!raw || raw === 'all') return 'All';
  return raw;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rawFilter = slug?.[0];
  const filterLabel = formatFilterLabel(rawFilter);

  const title = `Notes filter: ${filterLabel} | NoteHub`;
  const description = `Browse NoteHub notes filtered by: ${filterLabel}.`;

  const path = `/notes/filter/${(slug ?? []).join('/')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL + path,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: `NoteHub notes filtered by ${filterLabel}`,
        },
      ],
      type: 'website',
    },
  };
}

export default async function NotesByTagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = normalizeTag(slug?.[0]);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, '', tag ?? 'all'],
    queryFn: () => fetchNotes({ page: 1, perPage: PER_PAGE, search: '', tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient slug={slug} />
    </HydrationBoundary>
  );
}
