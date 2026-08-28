import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getAuthInfo(req?: Request): Promise<{ headers: Record<string, string>; userId: string | null; token: string | null }> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ghpyfaegcjxfpufilxbh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1Gb2J5xRDZe89zwTNk2lPQ_62rQtMc5';

  // 1. Try reading Authorization header directly from incoming HTTP request
  let incomingToken: string | null = null;
  if (req) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      incomingToken = authHeader.substring(7);
    }
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  let {
    data: { session },
  } = await supabase.auth.getSession();

  // If session is missing or expired, attempt refresh
  if (!session) {
    const { data: refreshData } = await supabase.auth.refreshSession();
    if (refreshData?.session) {
      session = refreshData.session;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let token = incomingToken || session?.access_token;

  // 2. Fallback: Parse cookieStore for Supabase JWT access token (must start with eyJ)
  if (!token || !token.startsWith('eyJ')) {
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.includes('auth-token') || c.name.startsWith('sb-')) {
        try {
          const parsed = JSON.parse(c.value);
          if (parsed?.access_token && parsed.access_token.startsWith('eyJ')) {
            token = parsed.access_token;
            break;
          } else if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].startsWith('eyJ')) {
            token = parsed[0];
            break;
          }
        } catch {
          if (c.value.startsWith('eyJ')) {
            token = c.value;
            break;
          }
        }
      }
    }
  }

  const userId = user?.id || session?.user?.id || null;

  const headers: Record<string, string> = {};
  if (token && token.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    console.warn('[BFF Auth Warning] Token does not match JWT format (eyJ...):', token.substring(0, 20));
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-User-ID'] = userId;
  }

  return { headers, userId, token: token || null };
}

export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  req?: Request
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const rawBaseUrl = process.env.GO_BACKEND_API_BASE_URL || 'https://olv5z7fky4.execute-api.ca-central-1.amazonaws.com';
    // Strip trailing slashes
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${baseUrl}${cleanPath}`;

    const { headers: authHeaders, userId } = await getAuthInfo(req);

    // If userId exists and request URL doesn't contain user_id parameter, automatically inject query param user_id
    if (userId && !url.includes('user_id=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}user_id=${encodeURIComponent(userId)}`;
    }

    const tokenPrefix = authHeaders.Authorization ? authHeaders.Authorization.substring(0, 25) + '...' : 'NONE';
    console.log(`[BFF -> Go Lambda] ${options.method || 'GET'} ${url} (TokenPrefix: ${tokenPrefix}, User: ${userId})`);

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
