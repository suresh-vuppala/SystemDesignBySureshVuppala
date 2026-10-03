/* === Lesson serialization - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   One file per lesson for scalability; each file appends its slug's key
   to the shared window.COURSE_CONTENT object loaded by the pages that reference it. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["serialization"] = {
  module: 1, num: "1.6", title: "Serialization",
  connectsFrom: "The fix for statefulness was \u201cput the object in Redis\u201d or \u201cput it in a JWT,\u201d but an object in your program\u2019s memory (pointers, live structure) can\u2019t be sent over a network or written to disk as-is. Something has to flatten it into bytes, and something on the other end has to rebuild it.",
  tabs: {
    overview: {
      heading: "Serialization & Deserialization",
      intro: "<strong>Serialization</strong> converts an in-memory object into bytes/JSON/binary; <strong>deserialization</strong> reverses it. Needed in 5 recurring situations: sending over a network (bytes are the only thing a network understands), persisting to disk or Redis, crossing a language boundary (Java \u2192 Python via Protobuf), populating a cache, and making an RPC call (<strong>gRPC</strong> serializes to Protobuf binary, faster and smaller than JSON for internal service calls).",
      table: {
        headers: ["Format", "Type", "Size", "Speed", "Use Case"],
        rows: [
          ["<strong>JSON</strong>", "Text", "Large", "Slow", "REST APIs, config files, human-readable"],
          ["<strong>Protocol Buffers</strong>", "Binary", "Small", "Fast", "gRPC, internal services (Google)"],
          ["<strong>Avro</strong>", "Binary", "Small", "Fast", "Kafka events, Hadoop (schema in header)"],
          ["<strong>MessagePack</strong>", "Binary", "Small", "Fast", "Redis, embedded systems"],
          ["<strong>XML</strong>", "Text", "Very large", "Slow", "SOAP, legacy enterprise"]
        ]
      }
    },
    tradeoffs: {
      heading: "Bandwidth vs schema discipline",
      points: [
        { label: "The core trade", body: "Readable formats (JSON, XML) cost bandwidth and parse time. Schema-based binary formats save both but require a shared schema and a build step." },
        { label: "Schema evolution", body: "Binary formats like <strong>Protobuf</strong> and <strong>Avro</strong> give you <strong>backward/forward compatibility</strong>: old consumers can read new messages and vice versa, because fields are identified by number, not name. That's what makes zero-downtime deployments possible." },
        { label: "Schema Registry", body: "A <strong>Schema Registry</strong> (Confluent's, most commonly) is the central store for Avro/Protobuf schemas. It enforces compatibility rules, and is used with <strong>Kafka</strong> to prevent breaking changes so a producer can't ship one unnoticed." }
      ]
    },
    handsOn: {
      goal: "Serialize the same user profile 10,000 times as JSON and as Protobuf, and measure the byte size and speed difference yourself.",
      stack: "Node.js + <code>protobufjs</code> (loads the <code>.proto</code> at runtime, so no <code>protoc</code> install needed). Local and free.",
      steps: [
        {
          title: "Define a realistic schema",
          body: "A user profile with 10 fields including a nested address. Save as <code>user.proto</code>.",
          code: "cat > user.proto <<'EOF'\nsyntax = \"proto3\";\nmessage User {\n  int32 id = 1;\n  string name = 2;\n  string email = 3;\n  string created_at = 4;\n  string updated_at = 5;\n  message Address { string street = 1; string city = 2; string zip = 3; }\n  Address address = 6;\n}\nEOF",
          lang: "bash"
        },
        {
          title: "Install the Protobuf library",
          code: "npm init -y && npm install protobufjs",
          lang: "bash"
        },
        {
          title: "Benchmark both formats over 10,000 records",
          body: "Encode and decode the same object 10,000 times each way, printing bytes per record and total milliseconds. Save as <code>bench.js</code>.",
          code: "const protobuf = require('protobufjs');\n\nconst sample = {\n  id: 42, name: 'Ada Lovelace', email: 'ada@example.com',\n  createdAt: '2020-01-01T00:00:00Z', updatedAt: '2023-06-15T12:30:00Z',\n  address: { street: '10 Analytical Way', city: 'London', zip: 'EC1A' }\n};\nconst N = 10000;\n\n(async () => {\n  const root = await protobuf.load('user.proto');\n  const User = root.lookupType('User');\n\n  let t = Date.now(), jsonBytes = 0;\n  for (let i = 0; i < N; i++) {\n    const buf = Buffer.from(JSON.stringify(sample));\n    jsonBytes = buf.length;\n    JSON.parse(buf.toString());\n  }\n  const jsonMs = Date.now() - t;\n\n  t = Date.now();\n  let pbBytes = 0;\n  for (let i = 0; i < N; i++) {\n    const buf = User.encode(User.create(sample)).finish();\n    pbBytes = buf.length;\n    User.decode(buf);\n  }\n  const pbMs = Date.now() - t;\n\n  console.log('JSON    :', jsonBytes, 'bytes/record,', jsonMs, 'ms');\n  console.log('Protobuf:', pbBytes, 'bytes/record,', pbMs, 'ms');\n})();",
          lang: "javascript"
        },
        {
          title: "Run it",
          code: "node bench.js",
          lang: "bash"
        }
      ],
      observe: "Protobuf typically comes out 3 to 10\u00d7 smaller per record and faster to parse. Put your own two numbers next to the trade-off claim in Overview instead of taking it on faith.",
      stretch: "Change a field name in the JSON <code>sample</code> and see nothing break; then change a field number in <code>user.proto</code> and re-run. Feel directly why schema evolution is a designed process for binary formats and an afterthought for JSON."
    }
  },
  keyTakeaways: [
    "Serialization flattens an in-memory object into bytes; deserialization rebuilds it on the other end.",
    "JSON is readable but slow and verbose; Protobuf/Avro/MessagePack are compact and fast but need a shared schema.",
    "A Schema Registry enforces compatibility so a producer can't silently break a consumer."
  ],
  proTip: "[SEE 8.9] Messaging's Schema Registry lesson covers the full event-payload-specific version of this same idea.",
  related: ["stateless-stateful", "schema-registry", "grpc", "concurrency-io"],
  bridgeOut: "None of the format lessons above explain why Redis, Nginx, and Node.js can each serve huge numbers of connections without an army of threads. That vocabulary (concurrency vs parallelism, blocking vs non-blocking) is assumed everywhere from here on, so it gets defined once, now."
};
