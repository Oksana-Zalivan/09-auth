'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getMe, updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './EditProfilePage.module.css';

export default function EditProfilePage() {
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);

  const [email, setEmail] = useState<string>('user_email@example.com');
  const [avatar, setAvatar] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        const user = await getMe();
        if (!isMounted) return;

        setUser(user);
        setEmail(user.email);
        setAvatar(user.avatar);
        setUsername(user.username);
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load profile');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const updated = await updateMe({ username });
      setUser(updated);
      router.push('/profile');
    } catch (e) {
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => router.back();

  if (isLoading) return <p className={css.mainContent}>Loading...</p>;

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        {avatar ? (
          <Image src={avatar} alt="User Avatar" width={120} height={120} className={css.avatar} />
        ) : (
          <div className={css.avatar} />
        )}

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <p>Email: {email}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton}>
              Save
            </button>
            <button type="button" className={css.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
          </div>

          {error ? <p className={css.error}>{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
