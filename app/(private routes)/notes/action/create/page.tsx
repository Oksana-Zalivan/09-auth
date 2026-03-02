'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import css from './NoteForm.module.css';
import type { NoteTag } from '@/types/note';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '@/lib/api/notes';
import { useNoteStore } from '@/lib/store/noteStore';

interface NoteFormProps {
  onCancel: () => void;
}

export interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

function validate(values: NoteFormValues) {
  const errors: Partial<Record<keyof NoteFormValues, string>> = {};

  const title = values.title.trim();

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 3) {
    errors.title = 'Min 3 symbols';
  } else if (title.length > 50) {
    errors.title = 'Max 50 symbols';
  }

  if (values.content && values.content.length > 500) {
    errors.content = 'Max 500 symbols';
  }

  if (!values.tag) {
    errors.tag = 'Tag is required';
  }

  return errors;
}

export default function NoteForm({ onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();

  const draft = useNoteStore(s => s.draft);
  const setDraft = useNoteStore(s => s.setDraft);
  const clearDraft = useNoteStore(s => s.clearDraft);

  const [values, setValues] = useState<NoteFormValues>(() => draft);

  const [errors, setErrors] = useState<Partial<Record<keyof NoteFormValues, string>>>({});

  const mutation = useMutation({
    mutationFn: (data: NoteFormValues) =>
      createNote({
        title: data.title.trim(),
        content: data.content.trim(),
        tag: data.tag,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });

      clearDraft();

      onCancel();
    },
  });

  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const target = e.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      const { name, value } = target;
      if (!name) return;

      const nextValues: NoteFormValues = {
        ...values,
        [name]: name === 'tag' ? (value as NoteTag) : value,
      } as NoteFormValues;

      setValues(nextValues);

      setDraft(nextValues);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await mutation.mutateAsync(values);

    setErrors({});
  };

  return (
    <form className={css.form} onSubmit={handleSubmit} onChange={handleChange}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={values.title}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={values.content}
          aria-invalid={Boolean(errors.content)}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={values.tag}
          aria-invalid={Boolean(errors.tag)}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancel
        </button>

        <button type="submit" className={css.submitButton} disabled={mutation.isPending}>
          Create note
        </button>
      </div>
    </form>
  );
}
