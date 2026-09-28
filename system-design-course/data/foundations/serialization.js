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
      prerequisites: "Any language with a JSON and Protobuf library (Python/Node/Go all work); protoc compiler installed for the Protobuf side.",
      setup: "Local/free only. This needs no infrastructure, just a script.",
      simulate: "Take a realistic object (a user profile with 10 fields: id, name, email, timestamps, nested address) and serialize the same 10,000 instances two ways: JSON.stringify vs a compiled Protobuf message. Measure both the output byte size per record and the time to serialize+deserialize all 10,000.",
      observe: "Protobuf typically running 3-10\u00d7 smaller and noticeably faster to parse. Put your own two numbers next to the trade-off claim in Overview instead of taking it on faith.",
      stretch: "Change a field name in the JSON payload and see nothing break; then change a field number in the .proto file and recompile. Feel directly why schema evolution is a designed process for binary formats and an afterthought for JSON."
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
