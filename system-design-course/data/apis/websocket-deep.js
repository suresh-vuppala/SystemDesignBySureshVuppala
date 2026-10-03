/* === Lesson websocket-deep - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#websocket-deep)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.13.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. Expanded into a full deep
   dive: why HTTP falls short -> protocol internals -> lifecycle & reliability
   -> auth & security -> scaling infra -> Redis/Kafka fan-out -> real-time
   operations. Each area cross-links to its home lesson instead of repeating
   it, so the reader knows where the topic is covered in depth. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["websocket-deep"] = {
  module: 3, num: "3.13", title: "WebSocket Deep Dive",
  connectsFrom: "Choosing WebSocket for a chat feature is easy. Keeping millions of connections alive, reconnecting cleanly after a blip, and routing a message to the right connection when it is one of 10 app servers is the actual engineering work, and it is invisible until you are in production.",
  customTabs: [
    { key: "overview", label: "Why WebSocket", icon: "book" },
    { key: "protocol", label: "Handshake & Protocol", icon: "swap" },
    { key: "lifecycle", label: "Lifecycle & Reliability", icon: "loop" },
    { key: "security", label: "Auth & Security", icon: "alert" },
    { key: "scaling", label: "Scaling: LB & Proxy", icon: "layers" },
    { key: "fanout", label: "Fan-Out: Redis & Kafka", icon: "hex" },
    { key: "patterns", label: "Patterns & Operations", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Why WebSocket Exists",
      intro: "HTTP is <strong>client-initiated</strong>: the client asks, the server answers, the exchange ends (see 2.4). The server has no way to <strong>push</strong> the instant something happens, so live chat, notifications, prices, and dashboards have to fake it. The polling workarounds all pay for that in wasted requests or held connections. <strong>WebSocket</strong> removes the workaround: one persistent, <strong>full-duplex</strong> connection where either side sends at any time. The full menu of six real-time options lives in Real-Time Communication (3.12); this lesson goes deep on WebSocket itself.",
      cards: [
        { icon: "R", title: "The request-response ceiling", color: "red", body: "HTTP only flows when the client asks. The server cannot originate a message, so \u201cnew data exists\u201d never reaches the browser on its own (2.1, 2.4)." },
        { icon: "P", title: "The polling workarounds", color: "orange", body: "<strong>Short polling</strong> re-asks on a timer (most responses empty, wasteful). <strong>Long polling</strong> holds the request open until data arrives (near real-time, but one held connection per client). Both are covered in 3.12." },
        { icon: "W", title: "The WebSocket upgrade", color: "green", body: "One persistent, <strong>bidirectional</strong> TCP connection: server pushes in ~ms, no per-message HTTP overhead, ~100K+ connections per server." }
      ],
      callouts: [
        { color: "blue", label: "What this lesson covers:", body: "The <strong>handshake &amp; protocol internals</strong>, the <strong>connection lifecycle, reliability &amp; reconnection</strong>, <strong>authentication &amp; security</strong>, <strong>scaling</strong> through load balancers, proxies and firewalls, <strong>fan-out</strong> with Redis and Kafka, and the recurring <strong>real-time patterns and operations</strong>. Each tab cross-links to the lesson that owns the topic in depth." },
        { color: "yellow", label: "When NOT to reach for it:", body: "One-way server push only? <strong>SSE</strong> is simpler (3.14). Low-frequency updates? Polling is fine (3.12). Plain request/response? Stay on REST (3.1). The head-to-head decision is WebSocket vs SSE (3.15) and the Real-Time decision guide (15.5)." }
      ]
    },

    protocol: {
      heading: "The Upgrade Handshake and Frames",
      intro: "A WebSocket is born as an ordinary <strong>HTTP GET</strong> carrying an <code>Upgrade</code> header. The server answers <strong>101 Switching Protocols</strong>, and from that moment the same <strong>TCP</strong> socket (2.3) is repurposed for framed, bidirectional traffic, it is no longer speaking HTTP. Underneath, WebSocket rides on TCP, which rides on the network stack (2.2).",
      points: [
        { label: "1. HTTP Upgrade request", body: "The client sends a normal GET over its existing TCP/TLS connection (2.4) with <code>Connection: Upgrade</code>, <code>Upgrade: websocket</code>, a random <code>Sec-WebSocket-Key</code>, and <code>Sec-WebSocket-Version: 13</code>. It reuses port 80/443, so it looks like web traffic to everything in between." },
        { label: "2. 101 Switching Protocols", body: "The server validates the request and replies <code>101</code> with <code>Sec-WebSocket-Accept</code> = base64(SHA-1(key + magic GUID)). That proves the server understood the handshake. After the 101, the bytes on the wire are <strong>WebSocket frames</strong>, not HTTP requests." },
        { label: "3. Persistent, bidirectional connection", body: "The socket stays open. There are no per-message HTTP headers, just a 2\u201314 byte frame header (vs 400+ bytes/request for polling, see 3.15), and <strong>either side</strong> can send whenever it wants. This is the whole point." },
        { label: "4. Frames and opcodes", body: "Data moves as frames tagged with an opcode: <strong>text</strong> (0x1), <strong>binary</strong> (0x2), <strong>close</strong> (0x8), <strong>ping</strong> (0x9), <strong>pong</strong> (0xA). Client\u2192server frames are <strong>masked</strong> (an anti-cache-poisoning measure). A single logical message can be split across multiple frames (fragmentation)." }
      ],
      table: {
        headers: ["Handshake Header", "Purpose"],
        rows: [
          ["<code>Connection: Upgrade</code>", "Signals this request wants to switch protocols"],
          ["<code>Upgrade: websocket</code>", "Names the target protocol"],
          ["<code>Sec-WebSocket-Key</code>", "Random client nonce; server hashes it into the accept value"],
          ["<code>Sec-WebSocket-Accept</code>", "Server proof (SHA-1 of key + GUID) returned in the 101 response"],
          ["<code>Sec-WebSocket-Protocol</code>", "Optional subprotocol negotiation (STOMP, graphql-ws, custom JSON-RPC)"],
          ["<code>Sec-WebSocket-Version</code>", "Protocol version, currently 13"]
        ]
      },
      callouts: [
        { color: "blue", label: "ws:// vs wss://:", body: "<strong>wss://</strong> is WebSocket over <strong>TLS</strong>, exactly what HTTPS is to HTTP (2.4, 4.3). Always use <strong>wss://</strong> in production: it encrypts every frame and, because it looks like HTTPS on 443, it survives far more proxies and firewalls than plain <code>ws://</code>." },
        { color: "green", label: "Subprotocols:", body: "During the handshake the client can offer application protocols via <code>Sec-WebSocket-Protocol</code> (e.g. <code>[\u2019graphql-ws\u2019, \u2019json-rpc\u2019]</code>); the server picks one and echoes it in the 101. Common ones: <strong>STOMP</strong>, <strong>graphql-ws</strong>, <strong>WAMP</strong>." }
      ]
    },

    lifecycle: {
      heading: "Connection Lifecycle, Reconnection & Reliability",
      intro: "A live connection moves through four <code>readyState</code> values, and keeping a long-lived one healthy is its own discipline: detect death fast, reconnect without a stampede, and rebuild any state the drop lost.",
      cards: [
        { icon: "0", title: "CONNECTING", color: "blue", body: "State 0: handshake in progress." },
        { icon: "1", title: "OPEN", color: "green", body: "State 1: live, frames flow both ways." },
        { icon: "2", title: "CLOSING", color: "orange", body: "State 2: the close handshake has started." },
        { icon: "3", title: "CLOSED", color: "red", body: "State 3: the connection is gone." }
      ],
      points: [
        { label: "Heartbeats (ping/pong)", body: "The protocol has built-in <strong>ping/pong</strong> frames. Send a ping on an interval; a missed pong means the peer is gone even when TCP has not noticed. Heartbeats also keep proxies and load balancers from killing an <strong>idle</strong> connection (see the Scaling tab)." },
        { label: "Detecting failure", body: "A dropped peer often leaves a <strong>half-open</strong> socket that still looks alive to TCP. App-level heartbeat + timeout is how you actually know. A close with code <strong>1006</strong> means abnormal closure, no close frame was exchanged, i.e. a network drop." },
        { label: "Reconnection with backoff + jitter", body: "Never reconnect on a fixed interval: after a server restart every client retries at once and the <strong>thundering herd</strong> kills it again. Use <code>delay = min(baseMs \u00d7 2^attempt, maxMs) + random(0, jitterMs)</code>. With base=1s, max=30s: ~1s, ~2s, ~4s\u2026 capped at 30s (relates to Backpressure 10.8 and Graceful Degradation 10.10)." },
        { label: "Reliability & replay", body: "WebSocket has <strong>no built-in replay</strong> (unlike SSE\u2019s Last-Event-ID, 3.14). For at-least-once delivery, add application <strong>sequence numbers</strong> and ACKs: on reconnect the client sends its last-seen sequence and the server replays the gap from a buffer or a durable log (Redis Streams 7.7 / Kafka 8.2). Because messages can be redelivered, apply them <strong>idempotently</strong> (3.6)." }
      ],
      callouts: [
        { color: "yellow", label: "Common close codes:", body: "<strong>1000</strong> normal closure \u00b7 <strong>1001</strong> going away (tab closed or server restart) \u00b7 <strong>1006</strong> abnormal close (network drop, no close frame) \u00b7 <strong>1008</strong> policy violation (auth failed) \u00b7 <strong>1011</strong> server internal error. Log the distribution, a spike in 1006 is a network or proxy problem; a spike in 1008 is an auth problem." }
      ]
    },

    security: {
      heading: "Authenticating and Hardening the Connection",
      intro: "The upgrade is an HTTP request, so a WebSocket inherits HTTP\u2019s attack surface plus a few of its own. Get authentication onto the connection first, then harden the transport and every inbound frame.",
      points: [
        { label: "Authenticate the handshake", body: "Best options: send a <strong>short-lived token in the first message</strong> after OPEN (never in the URL query string, URLs land in logs), rely on a same-origin <strong>auth cookie</strong> on the upgrade request, or pass a token via a <strong>subprotocol</strong>. Validate before accepting messages. Authentication in depth: 4.1." },
        { label: "Authorize per action, handle expiry", body: "A connection lives for hours, so a one-time check at connect is not enough. Re-check <strong>authorization</strong> (4.2) on sensitive actions, and when the token expires, force a re-auth or close, do not let a stale session keep pushing." },
        { label: "Validate the Origin", body: "Check the <code>Origin</code> header on the upgrade and reject unexpected ones to block <strong>cross-site WebSocket hijacking</strong> (the WS analogue of CSRF)." },
        { label: "Rate-limit and validate messages", body: "Cap messages/sec per connection (Rate Limiting 10.7) so one client cannot flood the server, and <strong>validate and sanitize every inbound frame</strong> server-side. Never trust client-sent opcodes or payloads." }
      ],
      table: {
        headers: ["Risk", "Fix"],
        rows: [
          ["<strong>Credentials in the URL</strong>", "The WS URL is logged by proxies and servers. Authenticate in the first message after OPEN, not the query string."],
          ["<strong>ws:// in production</strong>", "Always use <strong>wss://</strong> (TLS, 4.3): plain WS leaks payloads and is blocked by many proxies."],
          ["<strong>No Origin validation</strong>", "Reject unexpected <code>Origin</code> values on the upgrade to stop cross-site hijacking."],
          ["<strong>Message injection / flooding</strong>", "Validate every frame server-side and rate-limit per connection (10.7)."]
        ]
      }
    },

    scaling: {
      heading: "Stateful Connections Meet the Infrastructure",
      intro: "WebSockets are <strong>stateful</strong> and <strong>long-lived</strong>, which is exactly what request-scoped infrastructure, load balancers, reverse proxies, firewalls, is not designed for. Each piece needs specific handling before millions of connections behave.",
      points: [
        { label: "Sticky sessions", body: "A client\u2019s connection state lives on the server it connected to, so the load balancer (5.1) must keep sending it back there via <strong>sticky sessions</strong> (connection affinity), or you externalize state to a shared store (Redis) so any server can serve it. Sticky sessions are the simplest first step." },
        { label: "L4 vs L7 load balancing", body: "An <strong>L4 (TCP)</strong> balancer passes the upgrade through transparently and is the easy default. An <strong>L7 (HTTP)</strong> balancer must be explicitly WebSocket-aware (forward the upgrade) or it will break the handshake. See Load Balancer (5.1)." },
        { label: "Reverse proxy / NGINX", body: "A reverse proxy (5.3) like NGINX (5.4) must forward the upgrade headers and not time out a quiet socket: <code>proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection \u2019upgrade\u2019;</code> plus a long <code>proxy_read_timeout</code>. Miss these and the 101 never completes or the connection idles out." },
        { label: "Idle timeout & connection draining", body: "Proxies and balancers kill <strong>idle</strong> connections (often ~60s), heartbeats (Lifecycle tab) keep them alive. On deploy or scale-in, use <strong>connection draining</strong>: stop accepting new connections, let existing ones finish or migrate, then shut down, so a rollout is not a mass-disconnect storm (ties to Auto-Scaling 10.9)." },
        { label: "Firewalls & proxy behavior", body: "Corporate firewalls and proxies (2.8) sometimes block raw WebSocket. <strong>wss:// on 443</strong> looks like HTTPS and passes almost everywhere; when even that fails, libraries like Socket.IO fall back to long polling (3.12)." }
      ],
      callouts: [
        { color: "blue", label: "The stateful tax:", body: "Capacity planning shifts from requests/sec to <strong>per-connection cost</strong>: 5\u201320KB memory each (3.15), open file-descriptor limits, and graceful scale-in. A box holding 200K sockets cannot be rebooted casually, drain first." }
      ]
    },

    fanout: {
      heading: "Reaching a User Connected to Another Server",
      intro: "The instant you run more than one WebSocket server, a message produced on <strong>server A</strong> must reach a client connected to <strong>server B</strong>. A local emit never leaves the box, so you need a shared backbone. Two families solve it, and real systems often use both.",
      points: [
        { label: "The multi-server problem", body: "Connections are pinned to whichever server accepted them. Server A has no socket to a client on server B, so \u201cbroadcast to this room\u201d has to travel through something every server shares." },
        { label: "Redis + WebSocket (ephemeral fan-out)", body: "Every server subscribes to a <strong>Redis Pub/Sub</strong> channel (7.6). Server A publishes an event; all servers receive it and push it to their own local clients. Sub-millisecond, no persistence, no replay, the classic <strong>Slack / Figma</strong> pattern. Store presence/room state in Redis structures (7.3) alongside it." },
        { label: "Kafka + WebSocket (durable backbone)", body: "When you need <strong>durability, ordering, and replay</strong>, put events on <strong>Kafka</strong> (8.2) or Redis Streams (7.7): servers consume the log and push to their WebSocket clients, and a reconnecting client can replay the gap. Ordered per partition (8.8), survives restarts, the high-scale trading / event-sourcing pattern." },
        { label: "Choosing (and combining)", body: "Reach for <strong>Redis Pub/Sub</strong> for fast, ephemeral fan-out; reach for <strong>Kafka / Streams</strong> when a missed message is unacceptable or you need an audit log and replay. A common hybrid: Kafka as the source of truth, Redis for live fan-out. Full map in Queues vs Streams vs Pub/Sub (8.4)." }
      ],
      table: {
        headers: ["Dimension", "Redis Pub/Sub (7.6)", "Kafka / Streams (8.2, 7.7)"],
        rows: [
          ["<strong>Delivery</strong>", "Fire-and-forget, at-most-once", "Durable, at-least-once with replay"],
          ["<strong>Persistence</strong>", "None", "Stored until retention/trim"],
          ["<strong>Ordering</strong>", "Best-effort per channel", "Guaranteed per partition (8.8)"],
          ["<strong>Latency</strong>", "Sub-millisecond fan-out", "Low, but higher than Pub/Sub"],
          ["<strong>Best for</strong>", "Presence, typing, live cursors", "Order events, trades, audit trails"]
        ]
      }
    },

    patterns: {
      heading: "Presence, Ordering, Backpressure & Observability",
      intro: "Once the connection works, the same real-time problems recur across every product. Here is the shape of each and the lesson that owns it in depth.",
      points: [
        { label: "Presence & real-time state", body: "\u201cWho is online / typing / where is their cursor\u201d is ephemeral, loss-tolerant state. Track it in Redis with TTL heartbeats and broadcast changes over Pub/Sub (7.6). A missed update self-corrects on the next heartbeat, so durability is unnecessary." },
        { label: "Ordering & delivery consistency", body: "A WebSocket delivers frames in order <strong>per connection</strong>, but not across reconnects or across servers. For real guarantees, attach sequence numbers and drive delivery from a per-entity ordered log (Kafka partitions, Ordering 8.8), then apply idempotently (3.6) so a replay is harmless." },
        { label: "Backpressure & high traffic", body: "If the server sends faster than a client reads, <code>ws.bufferedAmount</code> grows toward an OOM crash. Guard every send with a <strong>HIGH_WATER_MARK</strong> check, bound each client\u2019s queue, and drop/coalesce or use credit-based flow control. Deep dive: Backpressure (10.8); shed load with Rate Limiting (10.7) and Graceful Degradation (10.10)." },
        { label: "Observability", body: "You cannot watch a long-lived connection the way you watch a request. Emit <strong>metrics</strong> (13.2) for active connections, messages/sec, buffered bytes, reconnect rate, and close-code mix; keep <strong>structured logs</strong> per connection (13.1); <strong>trace</strong> the upgrade and message flows (13.3); and <strong>alert</strong> on connection cliffs (13.4)." },
        { label: "Failure scenarios", body: "Plan for server crash (clients see 1006, reconnect and resync), network partition, proxy idle-kill, and the restart thundering herd. Lean on graceful degradation (10.10) and fault tolerance (11.5); the full WebSocket-vs-SSE failure matrix is in 3.15." }
      ]
    },

    handsOn: {
      goal: "Build a WebSocket echo server, see the <code>101</code> upgrade, then fan a message across two servers so a client receives it from a server it never connected to.",
      stack: "Node.js + <code>ws</code> + Redis Pub/Sub (Docker), tested with <code>wscat</code>. Local and free.",
      steps: [
        {
          title: "Start Redis and set up the project",
          code: "docker run -d --name redis -p 6379:6379 redis\nmkdir ws-lab && cd ws-lab\nnpm init -y && npm install ws ioredis",
          lang: "bash"
        },
        {
          title: "Write a minimal echo server",
          body: "It accepts a connection and echoes every message back. Save as <code>echo.js</code>.",
          code: "const { WebSocketServer } = require('ws');\nconst wss = new WebSocketServer({ port: 3001 });\nwss.on('connection', (ws) => {\n  ws.on('message', (m) => ws.send('echo: ' + m));\n});\nconsole.log('echo ws on ws://localhost:3001');",
          lang: "javascript"
        },
        {
          title: "Connect and watch frames replace requests",
          body: "Run the server, then connect. Anything you type comes straight back over the one open connection.",
          code: "node echo.js &\nnpx wscat -c ws://localhost:3001\n# type 'hi' and see 'echo: hi'",
          lang: "bash"
        },
        {
          title: "Add cross-server fan-out via Redis Pub/Sub",
          body: "Each server subscribes to <code>chat</code>; an inbound message is published, and every server pushes it to its own clients. Reads <code>PORT</code> from the env. Save as <code>fanout.js</code>.",
          code: "const { WebSocketServer } = require('ws');\nconst Redis = require('ioredis');\nconst port = Number(process.env.PORT) || 3001;\nconst pub = new Redis();\nconst sub = new Redis();\nconst wss = new WebSocketServer({ port });\n\nsub.subscribe('chat');\nsub.on('message', (_ch, msg) => wss.clients.forEach(c => c.send(msg)));\n\nwss.on('connection', (ws) => {\n  ws.on('message', (data) => pub.publish('chat', data.toString()));\n});\nconsole.log('fan-out ws on ' + port);",
          lang: "javascript"
        },
        {
          title: "Run two servers and connect one client to each",
          body: "Client A talks to server 3001, Client B to server 3002. Send from A and watch it reach B.",
          code: "PORT=3001 node fanout.js &\nPORT=3002 node fanout.js &\n# terminal A:\nnpx wscat -c ws://localhost:3001\n# terminal B:\nnpx wscat -c ws://localhost:3002",
          lang: "bash"
        }
      ],
      observe: "In the browser Network tab the connection shows a single <code>101 Switching Protocols</code> handshake, then frames with no further HTTP requests. In the fan-out run, Client B receives a message that originated on a server it never connected to. Kill server 3001 mid-conversation and Client A's <code>onclose</code> fires with code <code>1006</code>.",
      stretch: "Add a ping/pong heartbeat and an exponential-backoff-with-jitter reconnect on the client, then kill and restart the server three times and log each reconnect's actual delay to confirm it grows and jitters."
    }
  },
  keyTakeaways: [
    "WebSocket exists because HTTP is client-initiated and cannot push; it upgrades a single HTTP connection (101 Switching Protocols) into a persistent, bidirectional, framed channel over TCP.",
    "A healthy long-lived connection needs heartbeats to detect death, backoff+jitter reconnection to avoid a thundering herd, and app-level sequence numbers for replay since WebSocket has none built in.",
    "It is stateful, so infrastructure needs care: sticky sessions, WebSocket-aware load balancers/proxies (forward the Upgrade header), long idle timeouts, and connection draining on deploy.",
    "Across many servers, fan-out needs a shared backbone: Redis Pub/Sub for ephemeral broadcast (presence, chat), Kafka or Redis Streams when durability, ordering, and replay matter.",
    "Always enforce wss://, authenticate off the URL (first message or cookie), validate Origin and every inbound frame, and treat backpressure and observability as first-class from day one."
  ],
  proTip: "Reconnect with exponential backoff plus jitter and keep a heartbeat running, never a fixed retry interval and never a silent idle socket. A synchronized retry storm after a restart is a self-inflicted denial of service, and a half-open connection you never detect is worse.",
  related: ["realtime", "sse-deep", "realtime-comparison", "tcp-udp", "http-https", "load-balancer", "proxy", "nginx", "firewalls", "authentication", "redis-pubsub", "kafka", "backpressure", "ordering", "realtime-choice"],
  bridgeOut: "WebSocket's hard problems are fan-out, reconnection, and backpressure. The SSE deep dive shows what you get by choosing the simpler one-way alternative instead."
};
