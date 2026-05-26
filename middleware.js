/**
 * Vercel Edge Middleware — Premium Content Protection
 * 
 * For static sites (non-Next.js), use the Web Standard Request/Response API.
 */

// Premium problem pages (problems 6+ in module 1)
const PREMIUM_PROBLEMS = [
  '/realtime-system-design-problems/1-chat-messaging/whatsapp-presence-100m.html',
  '/realtime-system-design-problems/1-chat-messaging/slack-typing-indicators.html',
  '/realtime-system-design-problems/1-chat-messaging/slack-chat-search.html',
  '/realtime-system-design-problems/1-chat-messaging/whatsapp-push-notifications.html',
  '/realtime-system-design-problems/1-chat-messaging/telegram-multi-device-sync.html',
  '/realtime-system-design-problems/1-chat-messaging/slack-active-channels.html',
];

// Premium concept pages (topics 10-16)
const PREMIUM_CONCEPTS = [
  '/system-design-cheatsheet/10-scalability.html',
  '/system-design-cheatsheet/11-data-pipelines.html',
  '/system-design-cheatsheet/12-distributed-systems.html',
  '/system-design-cheatsheet/13-observability.html',
  '/system-design-cheatsheet/14-ai-systems.html',
  '/system-design-cheatsheet/15-key-numbers.html',
  '/system-design-cheatsheet/16-decision-flowcharts.html',
];

const ALL_PREMIUM_PATHS = [...PREMIUM_PROBLEMS, ...PREMIUM_CONCEPTS];

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this is a premium page
  const isPremiumPage = ALL_PREMIUM_PATHS.some(p => pathname === p || pathname.endsWith(p));
  if (!isPremiumPage) {
    return; // Free page — pass through
  }

  // Check for premium session cookie
  const cookies = request.headers.get('cookie') || '';
  const sessionMatch = cookies.match(/hellosde_session=([^;]+)/);

  if (!sessionMatch || !sessionMatch[1]) {
    // No session — rewrite to premium gate page
    url.pathname = '/premium-required.html';
    return Response.redirect(url.toString(), 302);
  }

  // Cookie exists — let the page through
  // (Full token verification happens client-side via Firebase;
  //  the cookie presence is the gate. For stronger verification,
  //  use an API route — but Edge Middleware can't call external APIs reliably)
  return;
}

export const config = {
  matcher: [
    '/system-design-cheatsheet/:path*.html',
    '/realtime-system-design-problems/:path*',
  ],
};
