/* === Lesson web-request - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#web-request)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["web-request"] = {
  module: 2, num: "2.1", title: "Journey of a URL",
  connectsFrom: "Foundations established that data travels as serialized bytes, but \u201ctype a URL, see a page\u201d looks instantaneous. Knowing where each millisecond actually goes is the difference between guessing at a latency fix and finding it.",
  tabs: {
    overview: {
      heading: "The 8-Step Journey",
      intro: "What happens from the moment you type a URL to seeing the page, end to end in <strong>8 steps</strong>. Each step maps to a protocol and a layer, and each adds its own slice of latency.",
      table: {
        headers: ["Step", "What Happens", "Protocol / Layer", "Latency"],
        rows: [
          ["<strong>1. URL Parse</strong>", "Browser extracts scheme, host, and path from https://example.com/page", "Browser internals", "&lt;1ms"],
          ["<strong>2. DNS Lookup</strong>", "Resolve example.com to an IP. Checks browser cache \u2192 OS cache \u2192 resolver \u2192 root/TLD/authoritative", "DNS (UDP :53)", "0-100ms"],
          ["<strong>3. TCP Handshake</strong>", "3-way handshake: SYN \u2192 SYN-ACK \u2192 ACK. Establishes a reliable connection", "TCP (L4)", "1 RTT (~30ms)"],
          ["<strong>4. TLS Handshake</strong>", "Negotiate cipher, exchange keys, verify certificate. TLS 1.3 = 1 RTT, TLS 1.2 = 2 RTT", "TLS (L5/L6)", "1-2 RTT (~50ms)"],
          ["<strong>5. HTTP Request</strong>", "Send GET /page HTTP/2 with headers (Host, Accept, Cookie, Auth)", "HTTP (L7)", "&lt;1ms"],
          ["<strong>6. Server Processing</strong>", "Load balancer \u2192 app server \u2192 DB query \u2192 build response", "Application", "50-500ms"],
          ["<strong>7. HTTP Response</strong>", "Server sends 200 OK + HTML body. May be chunked or streamed", "HTTP (L7)", "Depends on size"],
          ["<strong>8. Render</strong>", "Parse HTML \u2192 fetch CSS/JS/images (parallel) \u2192 build DOM \u2192 paint pixels", "Browser engine", "100-2000ms"]
        ]
      },
      callouts: [
        { color: "green", label: "Key insight:", body: "Steps 2, 3, and 4 are the <strong>connection overhead</strong>. This is why <strong>HTTP/2 multiplexing</strong> (reuse one connection), <strong>connection pooling</strong>, and <strong>CDNs</strong> (shorter distance means fewer round trips) matter so much for performance." },
        { color: "yellow", label: "Optimizations:", body: "<strong>DNS prefetch</strong>, <strong>preconnect</strong> (TCP and TLS ahead of time), <strong>HTTP/2 push</strong> (send CSS before the browser asks), <strong>edge caching</strong> (skip the server steps entirely), and <strong>TLS 1.3 0-RTT</strong> (resume without a handshake)." }
      ]
    },
    tradeoffs: {
      heading: "HTTP/1.1 vs HTTP/2 vs HTTP/3",
      points: [
        { label: "HTTP/1.1", body: "Mostly one request per round trip per connection, so browsers open ~6 parallel connections per origin just to compensate." },
        { label: "HTTP/2", body: "<strong>Multiplexes</strong> many requests over a single connection, removing the per-connection request limit and the need for those 6 sockets." },
        { label: "HTTP/3 (QUIC over UDP)", body: "Removes head-of-line blocking entirely by running over UDP with built-in TLS 1.3 and 0-RTT resumption." }
      ]
    },
    handsOn: {
      prerequisites: "A Chrome or Firefox browser (DevTools built in).",
      setup: "None, this uses the browser you already have.",
      simulate: "Open DevTools' Network tab, hard-refresh (Ctrl+Shift+R) a site you don't visit often (so DNS and TLS aren't warm), and click the very first request. Read its timing waterfall: DNS Lookup, Initial Connection (TCP), SSL (TLS), Waiting (TTFB), Content Download, the same 8 steps with real millisecond numbers next to each.",
      observe: "Which step actually dominates for that site, often DNS or TLS on a cold connection, almost always \u201cWaiting\u201d (server processing) if the backend is slow. Reload once more and watch DNS and Connection collapse to ~0ms on the warm cache and connection.",
      stretch: "Repeat on a site served over HTTP/2 vs one still on HTTP/1.1 (check the \u201cProtocol\u201d column), and open 6+ resources from the same origin to see HTTP/1.1's per-connection request limit vs HTTP/2 multiplexing them over one."
    }
  },
  keyTakeaways: [
    "The 8 steps: parse URL \u2192 DNS \u2192 TCP \u2192 TLS \u2192 HTTP request \u2192 server processing \u2192 HTTP response \u2192 render.",
    "Steps 2 to 4 (DNS, TCP, TLS) are pure connection overhead, which is exactly what HTTP/2, connection pooling, and CDNs attack.",
    "Every speed trick (prefetch, preconnect, push, edge caching, 0-RTT) is really just skipping or overlapping one of the 8 steps."
  ],
  proTip: "When asked \u201cwhat happens when you type a URL,\u201d walk these 8 steps out loud. It shows you understand DNS, TCP, TLS, HTTP, and server architecture, the full networking stack in one answer.",
  related: ["osi", "tcp-udp", "dns", "cors", "graphql", "grpc", "idempotent-apis", "pagination", "realtime", "rest", "event-loop", "http-https", "ip-cidr"],
  bridgeOut: "The journey name-drops DNS, TCP, and TLS as steps without explaining any of them. But first, the layer model those steps all sit inside."
};
