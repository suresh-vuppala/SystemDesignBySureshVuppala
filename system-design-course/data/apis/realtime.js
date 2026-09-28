/* === Lesson realtime - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#realtime)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.12.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["realtime"] = {
  module: 3, num: "3.12", title: "Real-Time Communication",
  connectsFrom: "Async APIs listed 3 ways to get a result back. This lesson is the full menu, because HTTP's client-always-initiates model cannot do what live chat, notifications, and dashboards actually need: the server pushing data the instant something happens.",
  tabs: {
    overview: {
      heading: "Real-Time Communication",
      intro: "Technologies for <strong>pushing data</strong> from server to client, chosen by direction and latency needs. There are 6 options, roughly ordered by connections-per-server ceiling. <strong>Socket.IO</strong> is worth naming as a library that auto-falls-back from WebSocket to polling when a WebSocket connection is not available.",
      table: {
        headers: ["Tech", "Direction", "Latency", "Best For", "Guarantee"],
        rows: [
          ["<strong>Short Polling</strong>", "Client to server (repeated)", "N sec", "Dashboard refresh, legacy status checks", "<strong>Simple</strong> but 99% of requests are empty (wasteful)"],
          ["<strong>Long Polling</strong>", "Server holds connection", "~sec", "Chat (pre-WS era), low-frequency notifications", "<strong>Near real-time</strong>, but 1 connection/client held open (~1K to 10K/server)"],
          ["<strong>WebSocket</strong>", "Full duplex", "~ms", "Live prices, chat, collaborative editing, gaming", "<strong>Persistent bidirectional</strong>: server pushes instantly. ~100K to 500K connections/server"],
          ["<strong>SSE</strong>", "Server to client", "~ms", "AI token streaming, news tickers, CI/CD build logs", "<strong>Auto-reconnect</strong> built into the browser, event ID for resume, text-only (~10K to 100K/server)"],
          ["<strong>WebRTC</strong>", "Peer-to-peer", "Ultra-low", "Video/audio calls, screen sharing, Discord voice", "<strong>Direct P2P</strong>: no server bandwidth for media, browser-enforced encryption"],
          ["<strong>Webhook</strong>", "Server to your server", "~sec", "Payment events, CI/CD triggers, order updates", "<strong>Event-driven HTTP POST</strong>: fire-and-forget, retries on failure, no persistent connection"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Real-world:", body: "<strong>Slack</strong> uses WebSocket for messaging. <strong>Figma</strong> uses WebSocket for collaborative editing. <strong>Zoom</strong> uses WebRTC for video. <strong>Robinhood</strong> uses WebSocket for live stock prices. <strong>ChatGPT</strong> uses SSE for token streaming. <strong>Stripe</strong> uses Webhooks for payment events. <strong>Socket.IO</strong> auto-falls-back to polling." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js.",
      setup: "Local and free only.",
      simulate: "Build the same \u201clive counter\u201d feature 3 ways: short polling (client fetches `GET /count` every 2s), long polling (server holds the request open until the count actually changes, up to a 30s timeout), and WebSocket (server pushes the new count the instant it changes). Open each in a browser tab and watch the Network tab.",
      observe: "The request-volume difference: short polling fires a request every 2s regardless of whether anything changed; long polling and WebSocket only produce traffic when there is an actual update. Count total requests sent over a 60-second idle period for each approach.",
      stretch: "Open 50 browser tabs (or simulate 50 clients with a script) against your long-polling server and watch server memory and connection count climb: a rough, laptop-scale feel for why long polling's per-server ceiling is 1K to 10K, not 100K+."
    }
  },
  keyTakeaways: [
    "Real-time delivery has 6 options, roughly ranked by connections-per-server ceiling: short polling, long polling, WebSocket, SSE, WebRTC, and webhook.",
    "<strong>WebSocket</strong> is bidirectional and low-latency; <strong>SSE</strong> is server-to-client only but simpler; <strong>WebRTC</strong> is peer-to-peer for media.",
    "<strong>Socket.IO</strong> auto-falls-back from WebSocket to polling when a WebSocket connection is unavailable."
  ],
  proTip: "Match the tool to the direction and frequency. If the server only needs to push text one way, SSE beats the operational weight of WebSocket; save WebSocket for true two-way, high-frequency traffic.",
  related: ["websocket-deep", "sse-deep", "realtime-comparison", "async-apis", "web-request", "grpc", "realtime-choice"],
  bridgeOut: "WebSocket and SSE are each substantial enough to earn their own deep-dive lesson next."
};
