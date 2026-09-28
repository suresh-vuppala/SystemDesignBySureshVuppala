/* === Lesson grpc - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#grpc, #grpc-streaming)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["grpc"] = {
  module: 3, num: "3.2", title: "gRPC",
  connectsFrom: "REST/JSON over HTTP/1.1 is fine for a public API, but too slow and chatty for high-volume service-to-service calls inside a system. Text parsing and one request per round trip add up fast at internal scale.",
  tabs: {
    overview: {
      heading: "gRPC",
      intro: "gRPC = <strong>HTTP/2 + Protobuf</strong> (binary, schema-defined messages): the same request/response idea as REST, but compiled and binary instead of parsed text, and roughly <strong>10x faster</strong>. It offers 4 call types over one HTTP/2 connection.",
      table: {
        headers: ["Mode", "Use Case", "Example"],
        rows: [
          ["<strong>Unary</strong>", "Simple request/response (1 request \u2192 1 response)", "GetUser, CreateOrder"],
          ["<strong>Server Stream</strong>", "Server pushes multiple results (1 request \u2192 N responses)", "Stock ticker, log tailing"],
          ["<strong>Client Stream</strong>", "Client sends a batch (N requests \u2192 1 response)", "File upload, telemetry"],
          ["<strong>Bidirectional</strong>", "Real-time two-way (both sides stream at once)", "Chat, multiplayer game"]
        ]
      },
      tables: [
        {
          title: "Streaming patterns over one HTTP/2 connection",
          headers: ["Pattern", "Flow", "Real-world uses"],
          rows: [
            ["<strong>Unary</strong>", "1 request \u2192 1 response", "Simple RPC: GetUser, CreateOrder"],
            ["<strong>Server stream</strong>", "1 request \u2192 N responses", "Stock ticker, log tail"],
            ["<strong>Client stream</strong>", "N requests \u2192 1 response", "File upload, batched metrics"],
            ["<strong>Bidirectional</strong>", "N requests \u2194 N responses", "Chat, collab editor, long-lived RPC sessions"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Type safety</strong>: the .proto schema plus code generation catches incompatibility at compile time. <strong>Deadline propagation</strong>: a timeout flows through the entire call chain. <strong>Multiplexing</strong>: many concurrent calls ride a single HTTP/2 connection." },
        { color: "blue", label: "One connection, four patterns:", body: "All four call types ride one HTTP/2 stream: multiplexed, header-compressed, and binary framed, which is what makes the streaming modes cheap." }
      ]
    },
    realWorld: {
      heading: "gRPC in Production",
      points: [
        { label: "Google", body: "Internal service-to-service communication, the environment gRPC was born in." },
        { label: "Netflix and Uber", body: "Microservice-to-microservice traffic where internal throughput matters more than human readability." },
        { label: "Best fit", body: "Internal APIs, 10K+ RPS, and bidirectional streaming. <strong>Not for browsers</strong> directly: use a gRPC-Web proxy." }
      ]
    },
    tradeoffs: {
      heading: "gRPC vs REST",
      points: [
        { label: "Roughly 10x faster internally", body: "Binary Protobuf on the wire plus HTTP/2 multiplexing beats JSON text over HTTP/1.1 for internal traffic." },
        { label: "Not human-readable", body: "You cannot just eyeball the payload; you need tooling to decode the binary frames." },
        { label: "Requires a shared schema", body: "Both sides need the same `.proto` and generated code, and it is not natively browser-friendly." }
      ]
    },
    handsOn: {
      prerequisites: "`protoc` and a gRPC library for your language (`grpc-tools` for Node, `grpcio` for Python).",
      setup: "Local and free only.",
      simulate: "Define a simple `.proto` with a `GetUser` unary RPC and a `ListOrders` server-streaming RPC, generate the client/server code with `protoc`, and implement both. Build the same `GetUser` call as a REST/JSON endpoint too. Load-test both with 1,000 sequential calls and compare total time and payload size per call.",
      observe: "The gRPC payload is visibly smaller (binary vs JSON text) and the round trip is noticeably faster. Put your own numbers next to the \u201c10x faster\u201d claim from Trade-offs.",
      stretch: "Implement the bidirectional-streaming `Chat()` pattern and connect two clients to it at once. Watch messages flow both directions on the same open connection, something a REST unary call structurally cannot do."
    }
  },
  keyTakeaways: [
    "gRPC is <strong>HTTP/2 + Protobuf</strong>: binary, schema-defined messages that are roughly 10x faster than REST for internal traffic.",
    "Four call types ride one HTTP/2 connection: unary, server-streaming, client-streaming, and bidirectional.",
    "The cost is a shared `.proto` schema, code generation, and no native browser support (needs gRPC-Web)."
  ],
  proTip: "Reach for gRPC when the caller and callee are both your own services and volume is high. Keep REST at the public edge where any client, including a browser, has to connect.",
  related: ["rest", "graphql", "web-request", "tcp-udp", "realtime", "rest-vs-graphql", "soap", "api-choice", "realtime-choice", "serialization"],
  bridgeOut: "gRPC fixed REST's cost problem, but not REST's shape problem: a client still either over-fetches or under-fetches from a fixed response shape."
};
