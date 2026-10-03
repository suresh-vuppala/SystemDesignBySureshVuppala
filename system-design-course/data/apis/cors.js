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
      goal: "Trigger a real CORS block in the browser between two origins, then unblock it with one header and watch a preflight <code>OPTIONS</code> appear.",
      stack: "Node.js + Express: a page on <code>:3000</code> calling an API on <code>:4000</code>. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir cors-lab && cd cors-lab\nnpm init -y && npm install express",
          lang: "bash"
        },
        {
          title: "Serve a page that calls the other origin",
          body: "Save as <code>page.js</code>; it serves an HTML page on <code>:3000</code> that fetches the API on <code>:4000</code>.",
          code: "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send(`\n  <button onclick=\"go()\">call API</button>\n  <script>\n    async function go() {\n      const r = await fetch('http://localhost:4000/data');\n      console.log(await r.json());\n    }\n  </script>`));\napp.listen(3000, () => console.log('page on http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Serve the API with CORS headers off (toggleable)",
          body: "Set <code>ALLOW=1</code> to send the allow-origin header, leave it unset to block. Save as <code>api.js</code>.",
          code: "const express = require('express');\nconst app = express();\napp.get('/data', (req, res) => {\n  if (process.env.ALLOW) res.set('Access-Control-Allow-Origin', 'http://localhost:3000');\n  res.json({ ok: true });\n});\napp.listen(4000, () => console.log('api on http://localhost:4000'));",
          lang: "javascript"
        },
        {
          title: "Run both and watch the browser block it",
          body: "Open <code>http://localhost:3000</code>, click the button, and read the DevTools console.",
          code: "node page.js &\nnode api.js &\n# then open http://localhost:3000 and click 'call API'",
          lang: "bash"
        },
        {
          title: "Turn the header on and retry",
          code: "kill %2\nALLOW=1 node api.js &\n# reload the page and click again: it now succeeds",
          lang: "bash"
        }
      ],
      observe: "With the header off, the console shows the classic <code>blocked by CORS policy: No 'Access-Control-Allow-Origin' header</code> error and the fetch fails. With <code>ALLOW=1</code>, the same call succeeds. Add a custom header to the fetch and the Network tab shows a preflight <code>OPTIONS</code> firing before your <code>GET</code>.",
      stretch: "Set <code>Access-Control-Allow-Origin: *</code> together with <code>credentials: 'include'</code> on the fetch and confirm the browser refuses the combination, exactly as described in the Failure Mode."
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
