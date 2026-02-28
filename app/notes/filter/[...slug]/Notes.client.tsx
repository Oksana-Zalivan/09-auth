'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';

import { fetchNotes } from '@/lib/api';
import type { NoteTag } from '@/types/note';
import css from './NotesPage.module.css';

const PER_PAGE = 12;

function normalizeTag(raw: string): NoteTag | undefined {
  if (!raw || raw === 'all') return undefined;
  return raw as NoteTag;
}

type Props = {
  slug: string[];
};

export default function NotesClient({ slug }: Props) {
  const tagValue = slug?.[0] ?? 'all';
  const tag = normalizeTag(tagValue);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPage(1);
    setSearchInput('');
    setSearch('');
  }, [tagValue]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setPage(1);
    setSearch(value.trim());
  }, 400);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const queryKey = useMemo(() => ['notes', page, search, tag ?? 'all'], [page, search, tag]);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search, tag }),
    placeholderData: keepPreviousData,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onChange={onSearchChange} />

        {totalPages > 1 && <Pagination pageCount={totalPages} page={page} onPageChange={setPage} />}

        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>

      {isLoading && <p>Loading, please wait...</p>}
      {isError && <p>Something went wrong.</p>}

      {notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}
