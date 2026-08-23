import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Root path redirect to /web
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/web', request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If in demo mode (unconfigured credentials), allow access so UI preview works smoothly
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo-project');

  // Protect /web dashboard routes
  const isWebRoute = pathname === '/web' || pathname.startsWith('/web/');
  const isAuthRoute = pathname === '/web/login' || pathname.startsWith('/web/auth');

  if (isWebRoute && !isAuthRoute) {
    if (!user && !isDemo) {
      const url = request.nextUrl.clone();
      url.pathname = '/web/login';
      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/web';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/',
    '/web/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
