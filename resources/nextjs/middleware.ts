import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';
import { publicRoutes, authRoutes, DEFAULT_LOGIN_REDIRECT, protectedRoutes } from './utils/auth/config';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.includes('.') || // Skip files with extensions (e.g., .jpg, .css)
    pathname.startsWith('/api/') || // Skip API routes
    pathname.startsWith('/_next/') || // Skip Next.js internals
    pathname === '/favicon.ico' // Skip favicon
  ) {
    return NextResponse.next();
  }

  // Update the Supabase auth session
  const supabaseResponse = await updateSession(req);

  // Get the user from the response headers set by updateSession
  const user = supabaseResponse.headers.get('x-user');
 
  const isAuthenticated = !!user;

  // Redirect to dashboard if user is authenticated and on the root route
  if(isAuthenticated && pathname === '/'){
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isProtectedRoute = protectedRoutes.includes(pathname) ||
                           protectedRoutes.some(route => 
                             pathname.startsWith(route) );
    // console.log('isProtectedRoute',isProtectedRoute);
  if(isProtectedRoute && !isAuthenticated){
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  // Check if the route exactly matches a public route
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       publicRoutes.some(route => 
                         pathname.startsWith(route) );
  
  // Check if the route exactly matches an auth route
  const isAuthRoute = authRoutes.includes(pathname) ||
                     authRoutes.some(route => pathname.startsWith(route));


  // Redirect authenticated users away from auth routes
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // Redirect unauthenticated users to login if trying to access protected route
  if (!isAuthenticated && !isPublicRoute && !isAuthRoute) {
    const redirectTo = `${req.nextUrl.origin}/auth/login${search}`;
    return NextResponse.redirect(redirectTo);
  }

  return supabaseResponse;
}

// The matcher config is fine as is
export const config = {
  matcher: [
    // Special case for root route
    '/',
    // Match all authenticated routes
    '/profile/:path*',
    '/editor/:path*',
    '/dashboard/:path*',
    '/documents-preview/:path*',
    '/questions/:path*',
    '/story-formats/:path*',
    '/themes/:path*',
   
  
    // Add direct matches for create and upload routes
    '/create/:path*',
    '/upload/:path*',
    // Match all auth routes
    '/auth/:path*',
  ],
};