/**
 * Vercel Edge Middleware — Premium Content Protection
 * 
 * This runs BEFORE the page is served. If the user doesn't have a valid
 * premium session cookie, premium pages return a "locked" page instead
 * of the actual content.
 * 
 * Flow:
 * 1. User signs in + pays → auth.js sets a session cookie with Firebase ID token
 * 2. Middleware checks the cookie on every premium page request
 * 3. If valid premium user → serve the page normally
 * 4. If not → redirect to a "premium required" page
 */

import { NextResponse } from 'next/server';

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

export const config = {
  matcher: [
    '/system-design-cheatsheet/:path*.html',
    '/realtime-system-design-problems/:path*',
  ],
};

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if this is a premium page
  const isPremiumPage = ALL_PREMIUM_PATHS.some(p => pathname.endsWith(p) || pathname === p);
  if (!isPremiumPage) {
    return NextResponse.next(); // Free page — serve normally
  }

  // Check for premium session cookie
  const sessionCookie = request.cookies.get('hellosde_session');
  if (!sessionCookie || !sessionCookie.value) {
    // No session — redirect to premium gate page
    return NextResponse.rewrite(new URL('/premium-required.html', request.url));
  }

  // Verify the session token with Firebase Admin (via API route)
  try {
    const verifyUrl = new URL('/api/verify-session', request.url);
    const verifyRes = await fetch(verifyUrl, {
      headers: { 'Authorization': `Bearer ${sessionCookie.value}` },
    });

    if (verifyRes.ok) {
      const data = await verifyRes.json();
      if (data.isPremium) {
        return NextResponse.next(); // Premium user — serve the page
      }
    }
  } catch (e) {
    // Verification failed — treat as non-premium
  }

  // Not premium — show gate page
  return NextResponse.rewrite(new URL('/premium-required.html', request.url));
}
