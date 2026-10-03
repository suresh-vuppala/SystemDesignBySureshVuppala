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
      goal: "Define a <code>.proto</code> schema with a unary and a server-streaming RPC, run a gRPC server, and call both over HTTP/2.",
      stack: "Node.js + <code>@grpc/grpc-js</code> + <code>@grpc/proto-loader</code> (no protoc code-gen needed), tested with <code>grpcurl</code>. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir grpc-lab && cd grpc-lab\nnpm init -y && npm install @grpc/grpc-js @grpc/proto-loader",
          lang: "bash"
        },
        {
          title: "Describe the service in a schema",
          body: "One unary RPC (<code>GetUser</code>) and one server-streaming RPC (<code>ListOrders</code>). Save as <code>user.proto</code>.",
          code: "syntax = \"proto3\";\npackage shop;\n\nservice Shop {\n  rpc GetUser (UserRequest) returns (User);\n  rpc ListOrders (UserRequest) returns (stream Order);\n}\n\nmessage UserRequest { int32 id = 1; }\nmessage User { int32 id = 1; string name = 2; }\nmessage Order { int32 id = 1; string item = 2; }",
          lang: "proto"
        },
        {
          title: "Implement the server",
          body: "The unary handler returns once; the streaming handler calls <code>write</code> repeatedly then <code>end</code>. Save as <code>server.js</code>.",
          code: "const grpc = require('@grpc/grpc-js');\nconst loader = require('@grpc/proto-loader');\nconst def = loader.loadSync('user.proto');\nconst proto = grpc.loadPackageDefinition(def).shop;\n\nfunction getUser(call, cb) {\n  cb(null, { id: call.request.id, name: 'Ada' });\n}\n\nfunction listOrders(call) {\n  for (let i = 1; i <= 3; i++) call.write({ id: i, item: 'item ' + i });\n  call.end();\n}\n\nconst server = new grpc.Server();\nserver.addService(proto.Shop.service, { GetUser: getUser, ListOrders: listOrders });\nserver.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {\n  console.log('gRPC on :50051');\n});",
          lang: "javascript"
        },
        {
          title: "Run the server",
          code: "node server.js",
          lang: "bash"
        },
        {
          title: "Call the unary RPC",
          body: "Install grpcurl once (<code>brew install grpcurl</code> or download a release), then send a request.",
          code: "grpcurl -plaintext -proto user.proto -d '{\"id\": 7}' localhost:50051 shop.Shop/GetUser",
          lang: "bash"
        },
        {
          title: "Call the server-streaming RPC",
          body: "One request opens a stream; the server pushes multiple <code>Order</code> messages back on the same HTTP/2 connection.",
          code: "grpcurl -plaintext -proto user.proto -d '{\"id\": 7}' localhost:50051 shop.Shop/ListOrders",
          lang: "bash"
        }
      ],
      observe: "<code>GetUser</code> returns a single object; <code>ListOrders</code> prints three separate <code>Order</code> messages arriving one after another over one connection. The wire payload is compact binary Protobuf, not JSON text, which is where the roughly 10x internal speedup comes from.",
      stretch: "Add a bidirectional <code>rpc Chat (stream Msg) returns (stream Msg)</code> and connect two clients at once: messages flow both directions on one open connection, something a REST unary call structurally cannot do."
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
