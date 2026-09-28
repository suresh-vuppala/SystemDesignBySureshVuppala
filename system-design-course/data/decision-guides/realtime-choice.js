/* === Lesson realtime-choice - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#realtime-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the comparison table and decision-shortcut callout. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["realtime-choice"] = {
  module: 15, num: "15.5", title: "Which Real-Time Tech?",
  connectsFrom: "Module 3.14 compared real-time transports in full. This condenses the same matrix. It branches on <strong>direction</strong> of data flow, <strong>latency</strong> ceiling, and <strong>who talks to whom</strong>.",
  tabs: {
    overview: {
      heading: "The Real-Time Decision Tree",
      intro: "The first fork is who the endpoints are: <strong>server-to-server</strong> uses a Webhook, <strong>client-facing</strong> descends into direction. Bidirectional client traffic needs WebSocket, server-push-only is simpler over SSE, and peer-to-peer media is WebRTC.",
      table: {
        headers: ["Technology", "Direction", "Latency", "Connection", "Best For"],
        rows: [
          ["<strong>WebSocket</strong>", "Bidirectional", "&lt;50ms", "Persistent, stateful", "Chat, gaming, collaborative editing"],
          ["<strong>SSE</strong>", "Server \u2192 client only", "&lt;100ms", "Persistent, HTTP-based", "Live feeds, notifications, dashboards"],
          ["<strong>gRPC Streaming</strong>", "Both (4 modes)", "&lt;10ms", "HTTP/2 multiplexed", "Internal microservice streaming, telemetry"],
          ["<strong>Long Polling</strong>", "Client pulls", "100-1000ms", "Repeated HTTP requests", "Simple fallback, legacy browser support"],
          ["<strong>WebRTC</strong>", "Peer-to-peer", "&lt;100ms", "P2P (STUN/TURN)", "Video/audio calls, screen sharing"],
          ["<strong>MQTT</strong>", "Pub/Sub (lightweight)", "&lt;50ms", "Persistent TCP", "IoT devices, low-bandwidth networks"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Decision shortcut:", body: "Browser + bidirectional? \u2192 <strong>WebSocket</strong>. Browser + server-push only? \u2192 <strong>SSE</strong> (simpler, auto-reconnect). Internal services? \u2192 <strong>gRPC streaming</strong>. Video/audio? \u2192 <strong>WebRTC</strong>. IoT/constrained? \u2192 <strong>MQTT</strong>. Legacy/simple? \u2192 <strong>Long Polling</strong>." },
        { color: "blue", label: "The first fork is endpoints:", body: "<strong>Server-to-server</strong> event delivery is a <strong>Webhook</strong>, an HTTP callback, not a persistent connection at all. Only client-facing needs push you into the WebSocket / SSE / WebRTC branches." }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "Direction and latency ceiling decide almost everything. Here is why each branch lands where it does.",
      points: [
        { label: "WebSocket for bidirectional client traffic", body: "A single persistent full-duplex connection carries messages both ways with sub-50ms latency, ideal for chat, gaming, and collaborative editing. The cost: it is stateful, so you must handle reconnection, scaling sticky connections, and fan-out yourself." },
        { label: "SSE when only the server pushes", body: "If clients never need to push over the same channel (live feeds, notifications, AI token streams), SSE is simpler than WebSocket: it rides plain HTTP and auto-reconnects. The cost: one-way only, and older proxies can buffer it." },
        { label: "gRPC streaming for internal paths", body: "Between backend services, gRPC streaming over HTTP/2 gives the lowest latency (&lt;10ms) and four streaming modes with strong typing. The cost: not browser-native, so it stays east-west." },
        { label: "WebRTC for peer-to-peer media", body: "Video, audio, and screen share go directly between peers via STUN/TURN, keeping media off your servers. The cost: NAT traversal complexity and TURN relay fallback when direct connection fails." },
        { label: "MQTT and Long Polling at the edges", body: "<strong>MQTT</strong> is a lightweight pub/sub for constrained IoT devices and flaky networks. <strong>Long Polling</strong> is the legacy fallback: repeated HTTP requests, 100-1000ms latency, chosen only when nothing better is available in the client." }
      ]
    },
    handsOn: {
      prerequisites: "No install needed. A real-time feature and the table above.",
      setup: "Take one feature and walk it through direction and endpoint questions.",
      simulate: "Scenario: \u201ca collaborative document editor where every keystroke from any user appears for all others instantly.\u201d Walk it: client-facing, bidirectional? Yes \u2192 WebSocket. Second scenario: \u201can AI chat UI that streams the model\u2019s tokens to the browser as they generate.\u201d Walk it: client-facing, server-push only? Yes \u2192 SSE.",
      observe: "The AI streaming case is the classic trap: people reach for WebSocket, but the data flows only one way, so SSE is simpler and auto-reconnects. Direction, not novelty, picks the transport.",
      stretch: "Add \u201cthe same editor must also support a live video call between editors.\u201d Which branch fires for that sub-feature? (WebRTC for the media, while WebSocket still carries the document edits, two transports in one product.)"
    }
  },
  keyTakeaways: [
    "First fork is endpoints: <strong>server-to-server</strong> \u2192 Webhook; client-facing descends into direction of data flow.",
    "Direction decides the client transport: <strong>bidirectional</strong> \u2192 WebSocket, <strong>server-push only</strong> \u2192 SSE, <strong>peer media</strong> \u2192 WebRTC.",
    "Internal service streaming \u2192 <strong>gRPC</strong>; constrained IoT \u2192 <strong>MQTT</strong>; legacy fallback \u2192 <strong>Long Polling</strong>."
  ],
  proTip: "Before reaching for WebSocket, ask \u201cdoes the client ever need to push on this channel?\u201d If not, SSE is simpler, cheaper, and reconnects on its own. Most \u201creal-time\u201d needs are actually one-way server push.",
  related: ["realtime", "realtime-comparison", "websocket-deep", "sse-deep", "grpc", "async-apis"],
  bridgeOut: "Transports move data in real time. The last of the individual decision trees: how to scale when a single machine can no longer keep up."
};
