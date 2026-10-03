/* === Lesson realtime-comparison - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#realtime-comparison)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.15.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["realtime-comparison"] = {
  module: 3, num: "3.15", title: "WebSocket vs SSE",
  connectsFrom: "The WebSocket and SSE deep dives each made their own case in isolation. Put the numbers side by side and the decision becomes obvious for most use cases.",
  tabs: {
    overview: {
      heading: "WebSocket vs SSE: Design Choices",
      intro: "When to pick each technology based on application requirements. The quantified comparison usually decides it: WebSocket wins on latency and bidirectionality, SSE wins on resilience and operational simplicity, and long polling is the universal fallback.",
      table: {
        headers: ["Feature", "WebSocket", "SSE", "Long Polling"],
        rows: [
          ["<strong>Communication</strong>", "Bidirectional", "Server only", "Client asks repeatedly"],
          ["<strong>Protocol Overhead</strong>", "2-14 bytes/msg", "10-50 bytes/msg", "400+ bytes/msg"],
          ["<strong>Binary Support</strong>", "Yes", "Text only", "Yes"],
          ["<strong>Auto-Reconnect</strong>", "Manual required", "Built-in browser", "Built-in (polling loop)"],
          ["<strong>Message Replay</strong>", "Manual required", "Built-in (Last-Event-ID)", "No standard"],
          ["<strong>HTTP/2 Multiplexing</strong>", "No (separate connection)", "Yes (single connection)", "Yes (HTTP requests)"],
          ["<strong>Proxy Friendly</strong>", "Sometimes blocked", "Standard HTTP", "Standard HTTP"],
          ["<strong>Connections/Server</strong>", "100K to 500K", "10K to 100K", "1K to 10K"],
          ["<strong>Latency</strong>", "~1-50ms", "~100-200ms", "~0.5-5s"],
          ["<strong>Memory/Connection</strong>", "5-20KB", "2-5KB", "Minimal"]
        ]
      },
      tables: [
        {
          headers: ["Scenario", "WebSocket Impact", "SSE Impact"],
          rows: [
            ["Network disconnection", "Connection drops, client must reconnect and resync state", "Browser auto-reconnects, replays events via Last-Event-ID \u2713"],
            ["Server restart", "All clients lose connection, must reconnect", "Clients reconnect, get missed events if stored \u2713"],
            ["Proxy timeouts (&gt;60s idle)", "Connection dies, must detect and reconnect", "Heartbeat prevents timeout \u2713"],
            ["High load spike", "100K+ connections: high memory, CPU consumed", "Fewer connections, easier to scale with multi-server \u2713"],
            ["Message ordering", "Not guaranteed across reconnects", "Event IDs allow ordering verification \u2713"],
            ["Browser refresh", "Connection lost, full state resync needed", "Can optionally restore via session storage plus server replay \u2713"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Key insight:", body: "<strong>SSE</strong> excels at resilience (auto-reconnect, event replay); <strong>WebSocket</strong> excels at latency and bidirectionality. Most real-time apps benefit from a <strong>hybrid approach</strong>: SSE for notifications, WebSocket for interactive features." }
      ]
    },
    tradeoffs: {
      heading: "Decision and Failure Scenarios",
      intro: "Pick by direction, latency, and how each technology degrades under stress. The failure-scenario comparison is often more decisive than the raw feature list.",
      points: [
        { label: "Choose WebSocket", body: "Bidirectional, low-latency, high-frequency work: chat, collaborative editing (Figma), gaming, trading apps, live prices. Also when binary data or sub-10ms latency is required." },
        { label: "Choose SSE", body: "Server-to-client only with operational simplicity: notifications, live feeds, dashboards, AI token streaming (ChatGPT), build logs. Auto-reconnect and replay come free." },
        { label: "Choose Long Polling", body: "When neither is available: older proxies, serverless timeouts, IE support, or WebSocket blocked by a firewall. The universal fallback." },
        { label: "Failure scenarios compared", body: "Across network disconnect, server restart, proxy idle timeout (&gt;60s), high load spike, message ordering, and browser refresh, <strong>SSE</strong> mostly self-heals (auto-reconnect, Last-Event-ID replay, heartbeat), while <strong>WebSocket</strong> needs manual reconnect and state resync." }
      ]
    },
    realWorld: {
      heading: "Hybrid Approaches",
      points: [
        { label: "SSE + HTTP POST", body: "SSE for server-to-client push, a regular POST for client commands (Twitch chat, YouTube comments)." },
        { label: "WebSocket + REST fallback", body: "Try WebSocket first, fall back to long polling if it is blocked (what Socket.IO does)." },
        { label: "WebSocket + Redis", body: "For scale: WebSocket per client, Redis Pub/Sub for multi-server broadcast (the Slack and Figma pattern)." },
        { label: "WebSocket + Kafka", body: "For event sourcing: all events stored in Kafka, clients subscribe via WebSocket (high-scale trading systems)." }
      ]
    },
    handsOn: {
      goal: "Run WebSocket and SSE side by side against one page, then throttle the network to watch which degrades gracefully and which reconnects faster.",
      stack: "Node.js + Express + <code>ws</code> in one server, observed in browser DevTools. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir realtime-compare && cd realtime-compare\nnpm init -y && npm install express ws",
          lang: "bash"
        },
        {
          title: "Serve both transports and a page that times each",
          body: "One <code>/events</code> SSE stream and one WebSocket, plus a page that logs time-to-first-update for both. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst { WebSocketServer } = require('ws');\nconst app = express();\n\napp.get('/events', (req, res) => {\n  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });\n  const t = setInterval(() => res.write('data: ' + Date.now() + '\\n\\n'), 1000);\n  req.on('close', () => clearInterval(t));\n});\n\napp.get('/', (req, res) => res.send(`\n  <script>\n    const sse = new EventSource('/events');\n    let sseFirst = 0;\n    sse.onmessage = () => { if (!sseFirst) { sseFirst = performance.now(); console.log('SSE first update', sseFirst.toFixed(0), 'ms'); } };\n    sse.onerror = () => console.log('SSE error, will auto-reconnect');\n    const ws = new WebSocket('ws://' + location.host);\n    let wsFirst = 0;\n    ws.onmessage = () => { if (!wsFirst) { wsFirst = performance.now(); console.log('WS first update', wsFirst.toFixed(0), 'ms'); } };\n    ws.onclose = () => console.log('WS closed (no auto-reconnect)');\n  </script>`));\n\nconst server = app.listen(3000, () => console.log('http://localhost:3000'));\nconst wss = new WebSocketServer({ server });\nsetInterval(() => wss.clients.forEach(c => c.send(String(Date.now()))), 1000);",
          lang: "javascript"
        },
        {
          title: "Run it and open the page",
          code: "node server.js\n# open http://localhost:3000 and open the DevTools console",
          lang: "bash"
        },
        {
          title: "Throttle and go offline in DevTools",
          body: "In the Network tab, switch to <strong>Slow 3G</strong>, then toggle the <strong>Offline</strong> checkbox on and back off. Watch the console logs.",
          code: "# DevTools \u2192 Network \u2192 throttling: Slow 3G\n# DevTools \u2192 Network \u2192 Offline: on, then off",
          lang: "bash"
        }
      ],
      observe: "SSE logs <code>SSE error, will auto-reconnect</code> and resumes on its own after you toggle Offline back off, while the WebSocket logs <code>WS closed</code> and stays dead with no reconnect code. The first-update times turn the Overview's latency table (WebSocket \u2248 1-50ms, SSE \u2248 100-200ms) into something you watched happen.",
      stretch: "Add exponential-backoff reconnect to the WebSocket client so it recovers like SSE does, then compare how much code each resilience story costs you."
    }
  },
  keyTakeaways: [
    "<strong>WebSocket</strong> wins on latency, bidirectionality, and binary; <strong>SSE</strong> wins on resilience and operational simplicity.",
    "The numbers decide it: WebSocket ~1-50ms and 100K to 500K connections/server, SSE ~100-200ms with free auto-reconnect and replay.",
    "Most real-time systems go <strong>hybrid</strong>: SSE for notifications, WebSocket for interactive features, long polling as the universal fallback."
  ],
  proTip: "Do not treat this as either/or. A hybrid (SSE for one-way feeds, WebSocket for interaction, long polling as fallback) gives you the strengths of each without betting everything on one.",
  related: ["websocket-deep", "sse-deep", "realtime", "async-apis", "api-choice", "realtime-choice"],
  bridgeOut: "This closes Module 3. Every real-time connection here still needs to answer \u201cwho is this connection allowed to represent,\u201d and Security opens next."
};
