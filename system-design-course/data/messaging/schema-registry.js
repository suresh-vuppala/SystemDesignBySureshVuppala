/* === Lesson schema-registry - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#schema-registry)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["schema-registry"] = {
  module: 8, num: "8.9", title: "Schema Registry",
  connectsFrom: "A producer team changes an event\u2019s shape without telling the consumer team, and \u201cit broke prod\u201d the moment that new shape reaches a consumer built for the old one. A schema registry makes the contract explicit and enforced.",
  tabs: {
    overview: {
      heading: "A Central, Versioned Contract for Event Payloads",
      intro: "A schema registry is the <strong>central contract</strong> for event payloads. Producers register a schema and embed its ID in every message; consumers fetch the schema by ID to deserialize. It <strong>enforces backward/forward compatibility</strong> across producer and consumer versions, preventing \u201cit broke prod.\u201d",
      cards: [
        { icon: "R", title: "Central Contract", color: "blue", body: "Stores schema versions (v1 \u2192 v2 \u2192 v3), validates compatibility, and returns a schema ID. Every message carries <code>[magic byte][schema_id][data]</code>." },
        { icon: "C", title: "Compatibility Modes", color: "green", body: "<strong>Backward</strong> (new reads old), <strong>Forward</strong> (old reads new), <strong>Full</strong> (both), <strong>Transitive</strong> (all prior versions), <strong>None</strong> (no checks, dangerous)." },
        { icon: "S", title: "Serialization", color: "orange", body: "<strong>Avro</strong> (compact binary, schema evolution), <strong>Protobuf</strong> (typed, fast, gRPC native), <strong>JSON Schema</strong> (human readable). Plain JSON has no schema and is risky." }
      ],
      table: {
        headers: ["Compatibility", "Rule", "Producers May", "Consumers May", "Use Case"],
        rows: [
          ["<strong>Backward</strong>", "New schema can read old data", "Add optional fields, remove fields", "Read old data with new code", "<strong>Most common</strong>: consumers upgrade first"],
          ["<strong>Forward</strong>", "Old schema can read new data", "Add fields, remove optional fields", "Read new data with old code", "Producers upgrade first"],
          ["<strong>Full</strong>", "Both backward + forward", "Only add/remove optional fields", "Both directions work", "<strong>Safest</strong>: independent deployments"],
          ["<strong>Transitive</strong>", "Compatible with ALL previous versions", "Strictest constraints", "Any version reads any other", "Long-lived topics, many consumers"],
          ["<strong>None</strong>", "No checks", "Anything", "<strong>May break</strong>", "Development only, never in prod"]
        ]
      },
      tables: [
        {
          headers: ["Tool", "Formats", "Integration", "Key Feature"],
          rows: [
            ["<strong>Confluent Schema Registry</strong>", "Avro, Protobuf, JSON Schema", "Kafka native, REST API", "De facto standard, subject strategies, schema references"],
            ["<strong>AWS Glue Schema Registry</strong>", "Avro, JSON Schema, Protobuf", "MSK, Kinesis, Lambda", "Serverless, IAM integration, auto-registration"],
            ["<strong>Apicurio Registry</strong>", "Avro, Protobuf, JSON, OpenAPI, GraphQL", "Kafka, HTTP, gRPC", "Open source, CNCF, multi-format"],
            ["<strong>Azure Schema Registry</strong>", "Avro", "Event Hubs", "Azure-native, RBAC, client-side caching"],
            ["<strong>Buf (BSR)</strong>", "Protobuf", "gRPC, Connect", "Breaking change detection, linting, code gen"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Best Practices:", body: "<strong>Enforce compatibility in CI</strong>: reject PRs that break schema contracts. Use <strong>subject naming strategies</strong> to control scope. <strong>Cache schemas</strong> on producer and consumer (schema ID \u2192 schema). Set <strong>FULL_TRANSITIVE</strong> for critical topics." },
        { color: "yellow", label: "Subject Strategies:", body: "<strong>TopicNameStrategy</strong> (default): one schema per topic. <strong>RecordNameStrategy</strong>: schema per record type (multiple types in one topic). <strong>TopicRecordNameStrategy</strong>: schema per topic+record combo (most flexible)." }
      ]
    },
    realWorld: {
      heading: "Schema Registries in Production",
      intro: "At scale, a registry with CI enforcement is the difference between safe evolution and silent breakage.",
      points: [
        { label: "LinkedIn", body: "Avro + Confluent Schema Registry for all Kafka topics (thousands of schemas)." },
        { label: "Uber", body: "Protobuf + a custom registry for gRPC services." },
        { label: "Netflix", body: "Avro schemas with automated compatibility testing in CI." },
        { label: "Shopify", body: "Protobuf for event-driven architecture, with Buf for linting." }
      ]
    },
    tradeoffs: {
      heading: "Safe Changes, Breaking Changes, and Anti-Patterns",
      intro: "Compatibility modes only help if you know which changes they permit and which will be rejected.",
      points: [
        { label: "Safe (backward compatible)", body: "Add an optional field with a default, add a new enum value (if consumers ignore unknowns), widen a numeric type (int \u2192 long), add a new union member (Avro), or deprecate a field (keep it, stop writing)." },
        { label: "Breaking (avoid)", body: "Remove a required field, rename a field without an alias, change a field type (string \u2192 int), remove an enum value, or change a field from optional to required." },
        { label: "Anti-pattern: no registry", body: "\u201cJust use JSON\u201d leads to silent breakage when shapes drift apart." },
        { label: "Anti-pattern: compatibility NONE in prod", body: "A ticking time bomb: nothing stops a breaking change from reaching consumers." },
        { label: "Anti-pattern: tight coupling", body: "If producer and consumer must deploy simultaneously, you have no real contract. Not versioning schemas also means you cannot roll back." }
      ]
    },
    handsOn: {
      goal: "Register an Avro schema for the rides topic and watch the registry reject a breaking change at registration time, before a single bad-shaped event is ever produced.",
      stack: "Confluent <code>cp-schema-registry</code> in Docker pointed at the Kafka broker from 8.2 + <code>curl</code> against its REST API. Local and free.",
      steps: [
        {
          title: "Run the Schema Registry against your broker",
          body: "Host networking lets the registry reach Kafka on <code>localhost:9092</code>. On macOS or Windows, use a shared Docker network and the broker's container name instead.",
          code: "docker run -d --name schema-registry --network host \\\n  -e SCHEMA_REGISTRY_HOST_NAME=localhost \\\n  -e SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS=localhost:9092 \\\n  -e SCHEMA_REGISTRY_LISTENERS=http://0.0.0.0:8081 \\\n  confluentinc/cp-schema-registry:latest",
          lang: "bash"
        },
        {
          title: "Register v1 and set Backward compatibility",
          body: "The subject <code>rides-value</code> starts with two required string fields.",
          code: `curl -s -X POST http://localhost:8081/subjects/rides-value/versions \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d '{"schema":"{\\"type\\":\\"record\\",\\"name\\":\\"Ride\\",\\"fields\\":[{\\"name\\":\\"trip_id\\",\\"type\\":\\"string\\"},{\\"name\\":\\"status\\",\\"type\\":\\"string\\"}]}"}'

curl -s -X PUT http://localhost:8081/config/rides-value \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d '{"compatibility":"BACKWARD"}'`,
          lang: "bash"
        },
        {
          title: "Register a backward-compatible change (accepted)",
          body: "Adding an optional field with a default is safe under Backward, so this returns a new schema id.",
          code: `curl -s -X POST http://localhost:8081/subjects/rides-value/versions \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d '{"schema":"{\\"type\\":\\"record\\",\\"name\\":\\"Ride\\",\\"fields\\":[{\\"name\\":\\"trip_id\\",\\"type\\":\\"string\\"},{\\"name\\":\\"status\\",\\"type\\":\\"string\\"},{\\"name\\":\\"driver_id\\",\\"type\\":[\\"null\\",\\"string\\"],\\"default\\":null}]}"}'`,
          lang: "bash"
        },
        {
          title: "Try a breaking change (rejected)",
          body: "Removing the required <code>status</code> field breaks consumers on the old schema, so the registry refuses it.",
          code: `curl -s -X POST http://localhost:8081/subjects/rides-value/versions \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d '{"schema":"{\\"type\\":\\"record\\",\\"name\\":\\"Ride\\",\\"fields\\":[{\\"name\\":\\"trip_id\\",\\"type\\":\\"string\\"}]}"}'`,
          lang: "bash"
        }
      ],
      observe: "The compatible change returns a new schema id (HTTP 200), while the breaking change returns HTTP 409 with a message like \"Schema being registered is incompatible with an earlier schema\": the registry refuses the breaking change at registration time, so \"it broke prod\" is prevented before any bad-shaped event is produced, not caught later by a confused consumer.",
      stretch: "Set compatibility to <code>NONE</code> with a PUT to <code>/config/rides-value</code>, register the same breaking change (now allowed), produce an event with the new shape, and watch a consumer expecting the removed field fail on read: the exact failure this lesson exists to prevent, reproduced on purpose."
    }
  },
  keyTakeaways: [
    "A schema registry is a <strong>central, versioned contract</strong>: producers embed a schema ID in each message and consumers fetch the schema to deserialize.",
    "Compatibility modes (<strong>Backward, Forward, Full, Transitive, None</strong>) decide which schema changes are allowed; <strong>None</strong> in production is a ticking time bomb.",
    "Enforce compatibility <strong>in CI</strong> so breaking changes are rejected at merge time, before any bad-shaped event is ever produced."
  ],
  proTip: "Enforce schema compatibility in CI, not in production. The registry should reject a breaking change at the pull request, long before a bad event reaches a consumer.",
  related: ["kafka", "event-sourcing", "ordering", "messaging-comparison", "serialization", "dlq"],
  bridgeOut: "This closes Module 8. The moment you have more than one copy of anything (a queue offset, a cache, a replica), the CAP theorem\u2019s bill comes due, which is exactly where Consistency picks up."
};
