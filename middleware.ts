import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIVATE_PREFIXES = ['/profile', '/notes'];
const AUTH_PAGES = ['/sign-in', '/sign-up'];

function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some(p => pathname.startsWith(p));
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some(p => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // у тебе на скріні cookies саме такі:
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const isAuthed = Boolean(accessToken || refreshToken);

  if (!isAuthed && isPrivatePath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  if (isAuthed && isAuthPage(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/profile';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
