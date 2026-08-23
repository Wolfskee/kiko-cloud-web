import { NextResponse } from 'next/server';
import { createClient } from '@/web/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/web';

  // Ensure local development environment uses http:// instead of https:// for localhost
  let targetOrigin = origin;
  if (targetOrigin.startsWith('https://localhost') || targetOrigin.startsWith('https://127.0.0.1')) {
    targetOrigin = targetOrigin.replace('https://', 'http://');
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${targetOrigin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${targetOrigin}${next}`);
      }
    }
  }

  // Return the user to login page if code exchange fails
  return NextResponse.redirect(`${targetOrigin}/web/login?error=auth-callback-failed`);
}
