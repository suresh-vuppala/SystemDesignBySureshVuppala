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
      prerequisites: "The WebSocket lab and the SSE lab from the two prior lessons, both still running.",
      setup: "Local and free: reuse both prior labs side by side.",
      simulate: "Open both labs in two browser tabs, then throttle your network to \u201cSlow 3G\u201d in DevTools for both. Measure time-to-first-update and behavior under the throttle for each.",
      observe: "Which one degrades more gracefully under a bad connection, and which reconnects faster after you toggle DevTools' \u201cOffline\u201d checkbox on and off: turning the Overview's numeric latency/overhead table into something you watched happen, not just read.",
      stretch: "None. This lesson's value is the direct comparison of labs you have already built."
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
