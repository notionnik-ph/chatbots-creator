import type { NextRequest } from 'next/server';

/** The widget runs inside an iframe hosted by this application, so public APIs do not use wildcard CORS. */
export function publicCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  if (!origin) return {};
  try {
    const requestOrigin = new URL(request.url).origin;
    return origin === requestOrigin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
  } catch {
    return {};
  }
}
