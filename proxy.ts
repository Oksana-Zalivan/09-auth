import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from './lib/api/serverApi';

const PRIVATE_ROUTES = ['/profile', '/notes'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function applySetCookieHeaders(res: NextResponse, setCookie?: string[] | string) {
  if (!setCookie) return;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const c of arr) res.headers.append('set-cookie', c);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivate = isRouteMatch(pathname, PRIVATE_ROUTES);
  const isAuth = isRouteMatch(pathname, AUTH_ROUTES);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let isAuthenticated = Boolean(accessToken);
  let sessionSetCookie: string[] | string | undefined;

  if (!isAuthenticated && refreshToken) {
    try {
      const resp = await checkSession();
      sessionSetCookie = resp.headers['set-cookie'];
      isAuthenticated = Boolean(resp.data);
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && isPrivate) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    const res = NextResponse.redirect(url);
    applySetCookieHeaders(res, sessionSetCookie);
    return res;
  }

  if (isAuthenticated && isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/profile';
    const res = NextResponse.redirect(url);
    applySetCookieHeaders(res, sessionSetCookie);
    return res;
  }

  const res = NextResponse.next();
  applySetCookieHeaders(res, sessionSetCookie);
  return res;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
