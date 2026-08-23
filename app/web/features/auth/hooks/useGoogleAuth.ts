'use client';

import { useState } from 'react';
import { createClient } from '@/web/lib/supabase/client';

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();

      let origin = window.location.origin;
      if (origin.startsWith('https://localhost') || origin.startsWith('https://127.0.0.1')) {
        origin = origin.replace('https://', 'http://');
      }

      const redirectTo = `${origin}/web/auth/callback`;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/web/login';
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signOut,
    isLoading,
    error,
  };
}
