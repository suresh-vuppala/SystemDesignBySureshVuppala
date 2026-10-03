/* === Lesson osi - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#osi)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["osi"] = {
  module: 2, num: "2.2", title: "The OSI Model",
  connectsFrom: "The URL journey kept name-dropping \u201cL4\u201d and \u201cL7\u201d (as in L4 vs L7 load balancers). Those numbers come from a 7-layer model, and in interviews only two of the layers ever really matter.",
  tabs: {
    overview: {
      heading: "The 7 Layers",
      intro: "The OSI model splits networking into <strong>7 layers</strong>, each handling one job and handing off to the next. You do not need to memorize all seven, but you must own <strong>Layer 4 (Transport)</strong> and <strong>Layer 7 (Application)</strong>, because they show up in every load-balancer and gateway question.",
      table: {
        headers: ["#", "Layer", "Protocols", "System Design Relevance"],
        rows: [
          ["7", "<strong>Application</strong>", "HTTP, gRPC, DNS, SMTP", "<strong>L7 load balancers</strong> (ALB), API Gateways, WAF"],
          ["6", "Presentation", "TLS/SSL, JSON, Protobuf", "Encryption, serialization"],
          ["5", "Session", "WebSocket, RPC", "Connection management"],
          ["4", "<strong>Transport</strong>", "TCP, UDP, QUIC", "<strong>L4 load balancers</strong> (NLB), port routing"],
          ["3", "<strong>Network</strong>", "IP, ICMP", "Routing, subnets, VPCs, BGP"],
          ["2", "Data Link", "Ethernet, ARP", "MAC addresses, switches"],
          ["1", "Physical", "Fiber, copper", "Data-center hardware"]
        ]
      },
      callouts: [
        { color: "blue", label: "The only two that come up daily:", body: "<strong>Layer 4</strong> works with IP address and port only. It is fast and blind to content, so an <strong>L4 load balancer</strong> just forwards packets. <strong>Layer 7</strong> can read the actual HTTP request (path, headers, cookies), so an <strong>L7 load balancer</strong> can route /api to one pool and /images to another." }
      ]
    },
    tradeoffs: {
      heading: "L4 vs L7 Load Balancing",
      points: [
        { label: "L4 (Transport)", body: "Routes on <strong>IP + port</strong> without inspecting content. Lower latency, higher throughput, cheaper, but cannot make decisions based on URL path, headers, or cookies." },
        { label: "L7 (Application)", body: "Terminates the connection and reads the full HTTP request, so it can do <strong>path-based routing</strong>, host-based routing, sticky sessions, and WAF filtering, at the cost of more CPU per request." }
      ]
    },
    handsOn: {
      goal: "Run the same destination through three tools and watch each one stop at the OSI layer it belongs to.",
      stack: "<code>ping</code>, <code>traceroute</code>/<code>tracert</code>, and <code>curl</code>, all preinstalled with the OS. Local and free.",
      steps: [
        {
          title: "Layer 3: is the host even reachable?",
          body: "<code>ping</code> uses ICMP at Layer 3. It knows nothing about ports, TLS, or HTTP.",
          code: "ping example.com",
          lang: "bash"
        },
        {
          title: "Layer 3: trace every router hop",
          body: "Each line is a Layer 3 router between you and the host.",
          code: "# macOS / Linux\ntraceroute example.com\n\n# Windows\ntracert example.com",
          lang: "bash"
        },
        {
          title: "Layers 4 to 7: open a real connection",
          body: "<code>curl -v</code> climbs the stack: it opens the TCP connection (L4), runs the TLS handshake (L6), then sends the HTTP request (L7).",
          code: "curl -v https://example.com",
          lang: "bash"
        },
        {
          title: "Diff plain HTTP against HTTPS",
          body: "The HTTPS run adds a whole TLS negotiation block (Layer 6) that plain HTTP skips.",
          code: "curl -v http://example.com  2>&1 | head -n 20\ncurl -v https://example.com 2>&1 | head -n 30",
          lang: "bash"
        }
      ],
      observe: "<code>ping</code> and <code>traceroute</code> never print a port, cipher, or header because they live at Layer 3. Only <code>curl -v</code> shows the TCP connect, the TLS handshake, and HTTP headers, because it climbs all the way to Layer 7.",
      stretch: "Compare the two <code>curl -v</code> runs side by side: the HTTPS output carries an extra TLS handshake section (Layer 6) that the plain HTTP run has nothing equivalent to."
    }
  },
  keyTakeaways: [
    "OSI has 7 layers, but interviews live at <strong>Layer 4 (Transport)</strong> and <strong>Layer 7 (Application)</strong>.",
    "L4 sees only IP and port, so L4 load balancers are fast and content-blind; L7 reads the HTTP request, so L7 load balancers can route on path, host, and headers.",
    "Lower layers (1 to 3) are routing and hardware; you reference them (IP, subnets, VPCs) but rarely configure them by hand."
  ],
  proTip: "When someone asks \u201cL4 or L7 load balancer?\u201d the real question is \u201cdo you need to route based on request content?\u201d If yes, you must pay for L7; if you only need to spread raw connections, L4 is faster and cheaper.",
  related: ["web-request", "tcp-udp", "http-https"],
  bridgeOut: "Layer 4 is where TCP and UDP live. That single choice, reliable-but-slow vs fast-but-lossy, drives more design decisions than any other in networking."
};
