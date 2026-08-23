import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getAuthInfo(): Promise<{ headers: Record<string, string>; userId: string | null }> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const userId = user?.id || session?.user?.id || null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['X-User-ID'] = userId;
    headers['X-User-Id'] = userId;
    headers['user_id'] = userId;
  }

  return { headers, userId };
}

export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const rawBaseUrl = process.env.GO_BACKEND_API_BASE_URL || 'https://api.kikocloud.ca';
    // Strip trailing slashes
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${baseUrl}${cleanPath}`;

    const { headers: authHeaders, userId } = await getAuthInfo();

    // If userId exists and request URL doesn't contain user_id parameter, automatically inject query param user_id
    if (userId && !url.includes('user_id=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}user_id=${encodeURIComponent(userId)}`;
    }

    console.log(`[BFF -> Go Lambda] ${options.method || 'GET'} ${url} (User: ${userId || 'anonymous'})`);

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Backend HTTP error');
      console.error(`[BFF <- Go Lambda Error] ${res.status}:`, errorText);
      return { data: null, error: errorText, status: res.status };
    }

    const data = await res.json().catch(() => null);
    console.log(`[BFF <- Go Lambda Success] ${res.status}:`, data);
    return { data, error: null, status: res.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error connecting to Go backend';
    console.error(`[BFF Exception] ${path}:`, message);
    return { data: null, error: message, status: 500 };
  }
}
