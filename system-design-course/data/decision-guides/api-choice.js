/* === Lesson api-choice - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#api-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the flowchart branches, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["api-choice"] = {
  module: 15, num: "15.1", title: "Which API Style?",
  connectsFrom: "Modules 3.1 to 3.3 taught REST, gRPC, and GraphQL one at a time. Now the capstone question: given a concrete requirement, which one do you actually pick? The answer branches on three things: <strong>audience</strong>, <strong>data shape</strong>, and <strong>performance needs</strong>.",
  tabs: {
    overview: {
      heading: "The API Style Decision Tree",
      intro: "Start at the top and walk down. The first fork is <strong>audience</strong>: internal service-to-service traffic goes one way, client-facing traffic goes another. Each answer at the bottom is a named style you already studied, now reached by following the requirement rather than memorizing a list.",
      table: {
        headers: ["If the requirement is\u2026", "Choose", "Why"],
        rows: [
          ["Internal, service-to-service, performance-critical", "<strong>gRPC</strong>", "Protobuf over HTTP/2: roughly 10\u00d7 faster and type-safe"],
          ["Client-facing and over/under-fetching hurts", "<strong>GraphQL</strong>", "Client picks exactly the fields it needs from a single endpoint"],
          ["Client-facing, simple, cache-friendly", "<strong>REST</strong>", "HTTP verbs, cacheable, the default for public APIs"],
          ["Bidirectional real-time stream", "<strong>WebSocket</strong>", "Full-duplex persistent connection"],
          ["Server-push only", "<strong>SSE</strong>", "One-way server \u2192 client over plain HTTP"],
          ["Legacy or very simple polling", "<strong>Long Polling</strong>", "Repeated HTTP requests, widest compatibility"]
        ]
      },
      callouts: [
        { color: "green", label: "Walk the tree in order:", body: "1) <strong>Client-facing or internal?</strong> Internal \u2192 gRPC. 2) If client-facing, <strong>is over/under-fetching a concern?</strong> Yes \u2192 GraphQL, No \u2192 REST. 3) <strong>Need streaming?</strong> Bidirectional \u2192 WebSocket, server-push only \u2192 SSE, legacy \u2192 Long Polling." },
        { color: "blue", label: "The three axes:", body: "<strong>Audience</strong> (public vs internal), <strong>data shape</strong> (fixed vs highly variable), and <strong>performance needs</strong> drive every branch. Name the axis out loud before you name the answer." }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "Each branch is a trade-off, not a rule. Here is the reasoning behind each fork so you can defend the choice, not just recite it.",
      points: [
        { label: "gRPC for internal, high-performance paths", body: "Protobuf binary encoding over HTTP/2 gives you strong typing, code-generated clients, and streaming. The cost: it is not browser-native and needs a proxy for web clients, so it fits east-west service traffic, not public APIs." },
        { label: "GraphQL when the client data shape varies wildly", body: "One mobile screen needs 3 fields, one web dashboard needs 30. GraphQL lets each caller ask for exactly what it needs from a single endpoint, killing over-fetch and under-fetch. The cost: caching is harder, and a naive query can be expensive on the server." },
        { label: "REST as the sensible default", body: "For public, resource-oriented APIs where responses are cacheable and clients are diverse, REST wins on simplicity, tooling, and HTTP cache semantics. Reach past it only when a specific pain (fetching shape, latency, or streaming) justifies it." },
        { label: "Streaming picks based on direction", body: "Bidirectional and low-latency (chat, gaming) needs <strong>WebSocket</strong>. Server-to-client only (AI token streams, live feeds) is simpler with <strong>SSE</strong>, which auto-reconnects over plain HTTP. Fall back to <strong>Long Polling</strong> only for legacy constraints." }
      ]
    },
    handsOn: {
      prerequisites: "No install needed. A pen, or a whiteboard tool.",
      setup: "Take one real requirement and run it through the tree end to end, saying each fork out loud.",
      simulate: "Scenario: \u201cAn internal pricing service is called 50,000 times/sec by other backend services, latency budget under 5ms.\u201d Walk the tree: client-facing or internal? Internal \u2192 gRPC. Now a second scenario: \u201cA public mobile app where the home screen and the settings screen need very different subsets of the same user object.\u201d Walk it: client-facing, over/under-fetching a concern? Yes \u2192 GraphQL.",
      observe: "Notice that you never compared all styles at once. You answered two or three yes/no questions and the style fell out. That is the whole point of a decision guide: replace \u201cwhich is best?\u201d with \u201cwhat does this requirement force?\u201d",
      stretch: "Now break your own answer: for the gRPC scenario, add \u201ca browser dashboard also needs to call it directly.\u201d What changes? (A REST or GraphQL gateway in front, or gRPC-Web with a proxy.) Defending the edge case is the interview skill."
    }
  },
  keyTakeaways: [
    "Pick an API style by walking a tree, not by ranking: <strong>internal</strong> \u2192 gRPC, <strong>variable client data</strong> \u2192 GraphQL, <strong>simple public</strong> \u2192 REST.",
    "Streaming is its own sub-branch: bidirectional \u2192 <strong>WebSocket</strong>, server-push \u2192 <strong>SSE</strong>, legacy \u2192 <strong>Long Polling</strong>.",
    "Always name the axis (audience, data shape, performance) before naming the answer, so the choice is defensible."
  ],
  proTip: "In an interview, never say \u201cI would use REST.\u201d Say \u201cthis is a public, cacheable, resource-oriented API, so REST; if the client data shape were highly variable I would switch to GraphQL.\u201d Naming the fork is what scores.",
  related: ["rest", "grpc", "graphql", "websocket-deep", "sse-deep", "realtime-comparison", "rest-vs-graphql", "more-decisions"],
  bridgeOut: "API style is only the first of the parallel capstone decisions. Next: the storage question, which of seven database families a requirement actually forces."
};
