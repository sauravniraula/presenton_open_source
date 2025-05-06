export const publicRoutes = [
  "/",
  "/pricing",
  '/auth/callback',
  '/api/webhook',
  '/presentation-generator',
];

export const authRoutes = [
  '/auth/login',
  '/auth/callback',
  '/auth/auth-code-error',
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/verify-email",
];

export const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/upload',
  '/create',
  '/preview',
  '/documents-preview',
  
  '/questions',
  '/story-formats',
  '/themes',
 
];

export const DEFAULT_LOGIN_REDIRECT = '/'; 