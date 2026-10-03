/* === Lesson sse-deep - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#sse-deep)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.14.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["sse-deep"] = {
  module: 3, num: "3.14", title: "SSE Deep Dive",
  connectsFrom: "WebSocket is powerful but heavyweight for something as simple as pushing a stream of one-way updates: a new protocol and new infrastructure, when plain HTTP could almost already do this.",
  tabs: {
    overview: {
      heading: "Server-Sent Events (SSE)",
      intro: "One-way <strong>server-to-client push</strong> over a regular, long-lived HTTP connection. The wire format is plain text with named fields, a blank line ends one event, and the browser's native <strong>EventSource</strong> API handles reconnect and replay for free. It is the middle ground: polling is wasteful, WebSocket is overkill when you only push one way.",
      table: {
        headers: ["Field", "Purpose"],
        rows: [
          ["<code>event:</code>", "Names the event type (fires addEventListener for that name)"],
          ["<code>id:</code>", "Unique ID for replay via Last-Event-ID"],
          ["<code>retry:</code>", "Reconnect delay hint in milliseconds"],
          ["<code>data:</code>", "The payload; a bare data: fires the browser's onmessage"],
          ["<code>: comment</code>", "A heartbeat line, ignored by the browser, resets proxy idle timeout"]
        ]
      },
      tables: [
        {
          headers: ["Use", "Example"],
          rows: [
            ["Live prices / market data", "Robinhood, Finnhub, Binance"],
            ["AI token streaming", "ChatGPT, GitHub Copilot"],
            ["Build logs, CI/CD output", "GitHub Actions, Jenkins, CircleCI"],
            ["Live notifications", "Gmail, Slack, email"]
          ]
        }
      ],
      callouts: [
        { color: "purple", label: "Middle ground:", body: "Polling is wasteful (99% empty requests), WebSocket is overkill if the flow is unidirectional. <strong>SSE is perfect for server-only push</strong> with auto-reconnect built in." },
        { color: "green", label: "Auto-reconnect and replay:", body: "On disconnect, the browser's native <strong>EventSource</strong> automatically reconnects and resumes from the <strong>Last-Event-ID</strong> it last saw: replay for free, which WebSocket does not give you natively. A heartbeat comment line (<code>: ping</code>) is ignored by the browser but resets a proxy's idle timeout so the connection is not silently dropped." },
        { color: "yellow", label: "Named vs bare events:", body: "A bare <code>data:</code> line fires <code>onmessage</code>. A named <code>event: priceUpdate</code> only fires listeners registered via <code>addEventListener(\u2019priceUpdate\u2019, ...)</code>. Use named events to multiplex multiple event types over one stream." }
      ]
    },
    realWorld: {
      heading: "SSE in Production",
      points: [
        { label: "Live prices / market data", body: "Robinhood, Finnhub, and Binance stream quotes over SSE." },
        { label: "AI token streaming", body: "ChatGPT and GitHub Copilot stream tokens to the browser as they are generated." },
        { label: "Build logs, CI/CD output", body: "GitHub Actions, Jenkins, and CircleCI push log lines live." },
        { label: "Performance", body: "10K to 100K connections/server, 2 to 5KB memory per connection, about 10 bytes overhead per message versus 400+ for HTTP polling." }
      ]
    },
    tradeoffs: {
      heading: "Limits and Fixes",
      points: [
        { label: "HTTP/1.1 6-connection limit", body: "Browsers cap at <strong>6 connections per domain</strong>, so a 7th SSE stream is blocked, a real problem for multi-tab apps. <strong>HTTP/2</strong> multiplexes all streams over one TCP connection and removes the limit entirely." },
        { label: "Proxy idle timeouts", body: "Proxies (Nginx, AWS ALB) kill idle HTTP connections after about 60s. Send a <strong>comment heartbeat</strong> every 15 to 30s: it costs nothing and resets the idle timer." },
        { label: "No custom headers", body: "<code>EventSource</code> cannot set an Authorization header. Use one of 3 workarounds: a query-param token, a short-lived one-time token exchanged from a REST endpoint, or cookies with <code>withCredentials</code>." }
      ]
    },
    handsOn: {
      goal: "Stream server-pushed prices over plain HTTP with SSE and watch the browser auto-reconnect with zero reconnect code.",
      stack: "Node.js + Express and the browser's built-in <code>EventSource</code>, plus <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir sse-lab && cd sse-lab\nnpm init -y && npm install express",
          lang: "bash"
        },
        {
          title: "Push an event every 2 seconds and never close",
          body: "Set <code>Content-Type: text/event-stream</code>, write an <code>id:</code> and a <code>data:</code> line ended by a blank line, and keep the response open. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send(\n  `<script>const es = new EventSource('/prices'); es.onmessage = e => console.log(e.data);</script>`\n));\n\napp.get('/prices', (req, res) => {\n  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });\n  let id = Number(req.headers['last-event-id'] || 0);\n  const timer = setInterval(() => {\n    id++;\n    res.write('id: ' + id + '\\n');\n    res.write('data: {\"price\": ' + (100 + Math.floor(Math.random() * 50)) + '}\\n\\n');\n  }, 2000);\n  req.on('close', () => clearInterval(timer));\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Run it and see the raw stream",
          body: "<code>curl -N</code> keeps the connection open so you can watch events arrive.",
          code: "node server.js &\ncurl -N localhost:3000/prices",
          lang: "bash"
        },
        {
          title: "Watch auto-reconnect in the browser",
          body: "Open the page, then kill and restart the server. The console keeps logging with no reconnect code from you.",
          code: "# open http://localhost:3000 and watch the console\n# then: kill %1 ; node server.js &",
          lang: "bash"
        }
      ],
      observe: "After you kill the server, <code>EventSource</code> reconnects on its own within a few seconds, zero reconnect code written, unlike the manual backoff the WebSocket lab needed. On reconnect the browser automatically sends a <code>Last-Event-ID</code> header carrying the last <code>id:</code> it saw.",
      stretch: "Log <code>req.headers['last-event-id']</code> on the server, kill it mid-stream, and confirm the browser resumes from the last seen event id, replay-from-last-seen without you implementing it."
    }
  },
  keyTakeaways: [
    "SSE is one-way <strong>server-to-client</strong> push over plain HTTP, using a simple text format where a blank line ends each event.",
    "The browser's <strong>EventSource</strong> gives <strong>auto-reconnect</strong> and <strong>replay</strong> (via Last-Event-ID) for free, which WebSocket does not.",
    "Watch the HTTP/1.1 6-connection limit (fixed by HTTP/2), proxy idle timeouts (fixed by heartbeats), and the missing Authorization header (3 auth workarounds)."
  ],
  proTip: "If the data only flows one way and is text, SSE gets you reconnect and replay for free. Reach for WebSocket only when you genuinely need the client to send too.",
  related: ["websocket-deep", "realtime", "realtime-comparison", "cors", "http-https", "api-choice", "realtime-choice"],
  bridgeOut: "The next lesson is the head-to-head that turns \u201cSSE vs WebSocket\u201d from two independent lessons into one decision."
};
