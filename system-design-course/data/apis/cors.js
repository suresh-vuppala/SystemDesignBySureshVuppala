/* === Lesson cors - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#cors)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cors"] = {
  module: 3, num: "3.8", title: "CORS",
  connectsFrom: "REST and GraphQL both assumed a browser could just call any API. CORS is the browser-enforced rule that says otherwise, specifically to stop a script on evil.com from silently calling your bank's API using the victim's own already-logged-in cookies.",
  tabs: {
    overview: {
      heading: "CORS",
      intro: "A <strong>browser-enforced</strong> policy restricting which origins a page's JavaScript can call. <strong>Simple requests</strong> (GET/POST with standard headers) go straight through. Requests with custom headers or methods trigger a <strong>preflight OPTIONS</strong> check first, and the server must approve before the real request is sent.",
      table: {
        headers: ["Header", "Direction", "Purpose", "Example"],
        rows: [
          ["<strong>Origin</strong>", "Request", "Browser sends the requesting origin", "<code>Origin: https://app.com</code>"],
          ["<strong>Access-Control-Allow-Origin</strong>", "Response", "Server declares which origins are allowed", "<code>*</code> or <code>https://app.com</code>"],
          ["<strong>Access-Control-Allow-Methods</strong>", "Response", "Allowed HTTP methods", "<code>GET, POST, PUT, DELETE</code>"],
          ["<strong>Access-Control-Allow-Headers</strong>", "Response", "Allowed custom headers", "<code>Authorization, Content-Type</code>"],
          ["<strong>Access-Control-Max-Age</strong>", "Response", "Cache the preflight result (seconds)", "<code>86400</code> (24 hours)"],
          ["<strong>Access-Control-Allow-Credentials</strong>", "Response", "Allow cookies/auth headers", "<code>true</code> (cannot use with <code>*</code> origin)"]
        ]
      },
      tables: [
        {
          title: "Response headers at a glance",
          headers: ["Header", "Purpose"],
          rows: [
            ["<code>Access-Control-Allow-Origin</code>", "Which origins may read the response"],
            ["<code>Access-Control-Allow-Methods</code>", "Allowed verbs (GET, POST, \u2026)"],
            ["<code>Access-Control-Allow-Headers</code>", "Custom headers permitted"],
            ["<code>Access-Control-Max-Age</code>", "Preflight cache TTL (sec)"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Simple vs Preflight:", body: "<strong>Simple requests</strong> (GET/POST with standard headers) go directly: the browser adds Origin and checks the response. <strong>Preflight</strong> (PUT/DELETE, custom headers, non-standard Content-Type) triggers an OPTIONS request first, and the server must respond with the allowed methods and headers before the browser sends the real request." },
        { color: "purple", label: "Common CORS mistakes:", body: "Using <code>*</code> with credentials (browsers reject this outright). Forgetting the OPTIONS handler (preflight fails, request blocked). Not caching preflight (Max-Age=0 means an OPTIONS on every request, doubling latency). Reflecting Origin without validation (a security hole that allows any site)." },
        { color: "yellow", label: "Rule of thumb:", body: "<strong>Simple requests</strong> (GET/POST with safe headers) skip preflight. Anything else triggers an OPTIONS request first." }
      ]
    },
    tradeoffs: {
      heading: "Failure Mode",
      points: [
        { label: "Wildcard plus credentials", body: "A wildcard <code>Access-Control-Allow-Origin: *</code> cannot be combined with <code>Access-Control-Allow-Credentials: true</code>. The browser rejects that combination outright, so name the exact origin when you need cookies." }
      ]
    },
    handsOn: {
      prerequisites: "A browser; Node.js/Express.",
      setup: "Local and free only. Serve a static HTML page from `localhost:3000` and an API from `localhost:4000` (two different origins, exactly what triggers CORS).",
      simulate: "From the page on `:3000`, `fetch()` the API on `:4000` with no CORS headers set: open DevTools console and watch the browser block it. Add `Access-Control-Allow-Origin: http://localhost:3000` on the server and retry: it succeeds. Add a custom header (for example `X-Custom-Header`) to the fetch and watch the Network tab show a preflight `OPTIONS` firing before your actual `GET`.",
      observe: "The exact console error message browsers give for a CORS block, and the preflight `OPTIONS` request appearing only once headers or methods go beyond what counts as a \u201csimple request.\u201d",
      stretch: "Set `Access-Control-Allow-Origin: *` together with `credentials: \u2019include\u2019` on the fetch call and confirm the browser refuses the combination exactly as described in the Failure Mode."
    }
  },
  keyTakeaways: [
    "CORS is a <strong>browser-enforced</strong> policy that decides which origins a page's JavaScript may call.",
    "Simple requests pass straight through; custom headers or methods trigger a <strong>preflight OPTIONS</strong> the server must approve.",
    "A wildcard <code>*</code> origin cannot be combined with credentials, and preflight results should be cached via Max-Age."
  ],
  proTip: "CORS is enforced by the browser, not the server, and it is not a substitute for auth. It stops other origins' scripts from reading your responses; it does not authenticate the caller.",
  related: ["rest", "graphql", "http-https", "web-request", "sse-deep"],
  bridgeOut: "None forward: this is a self-contained browser-security reference lesson."
};
