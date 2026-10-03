/* === Lesson pipeline-schema-registry - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#pipeline-schema-registry)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["pipeline-schema-registry"] = {
  module: 12, num: "12.8", title: "Schema Registry (Pipelines)",
  connectsFrom: "The same schema-registry idea from Messaging, applied specifically to pipeline data contracts. A registry is the single source of truth for event payloads, so producers and consumers can evolve without breaking each other.",
  tabs: {
    overview: {
      heading: "One Source Of Truth For Event Payloads",
      intro: "A schema registry stores the agreed shape of every event and enforces <strong>compatibility</strong> as schemas evolve. The mode you pick decides which direction of change is safe: <strong>backward</strong> (add optional fields), <strong>forward</strong> (remove fields), or <strong>full</strong> (both, strictest).",
      cards: [
        { icon: "B", title: "Backward", color: "green", body: "A <strong>new consumer</strong> reads <strong>old data</strong>. The default for adding optional fields, since old records still parse." },
        { icon: "F", title: "Forward", color: "blue", body: "An <strong>old consumer</strong> reads <strong>new data</strong>. Safe to remove fields, since existing consumers ignore what they do not know." },
        { icon: "U", title: "Full", color: "purple", body: "<strong>Both</strong> directions at once. The strictest and safest mode in production, at the cost of the least freedom to change." }
      ],
      table: {
        headers: ["Compatibility", "Effect"],
        rows: [
          ["Backward", "New consumer reads old data: default for adding optional fields"],
          ["Forward", "Old consumer reads new data: safe to remove fields"],
          ["Full", "Both: strictest, safest in production"]
        ]
      },
      callouts: [
        { color: "blue", label: "Optional field with a default:", body: "An Avro <code>Order</code> record with <code>id: string</code> and <code>amount: double</code> can add <code>coupon: [\"null\",\"string\"]</code> with <code>default: null</code>. The default is what makes the added field <strong>backward compatible</strong>: old records with no coupon still parse." },
        { color: "yellow", label: "Enforce in CI:", body: "Reject a schema PR if it breaks compatibility against the registry. <strong>Confluent</strong> / <strong>Apicurio</strong> / <strong>AWS Glue Schema Registry</strong>." }
      ]
    },
    tradeoffs: {
      heading: "Choosing A Compatibility Mode",
      intro: "Each mode trades freedom to change against the risk of breaking the other side.",
      points: [
        { label: "Backward: safe to add", body: "New consumers read old data, so you can add <strong>optional</strong> fields with defaults. You cannot safely add a required field or remove one consumers still expect." },
        { label: "Forward: safe to remove", body: "Old consumers read new data, so you can <strong>remove</strong> fields. New required fields are the risk, since old producers will not send them." },
        { label: "Full: strictest", body: "Both directions must hold, which is safest in production but leaves the least room to change a schema in a single step. Big changes become multi-step migrations." }
      ]
    },
    handsOn: {
      goal: "Register an Avro schema for your CDC events, set BACKWARD compatibility, and prove the compatibility check a CI step would run rejects a genuinely breaking change before merge.",
      stack: "Confluent Schema Registry (+ Kafka) in Docker, driven by <code>curl</code> and <code>jq</code>. Local and free.",
      steps: [
        {
          title: "Start Kafka and the Schema Registry",
          body: "Reuses the 8.9 registry stack. Save as <code>docker-compose.yml</code>.",
          code: `version: "3.7"
services:
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports: ["9092:9092"]
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_LISTENERS: PLAINTEXT://kafka:9092,CONTROLLER://kafka:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      CLUSTER_ID: kraftcluster0000000001
  schema-registry:
    image: confluentinc/cp-schema-registry:7.6.0
    depends_on: [kafka]
    ports: ["8081:8081"]
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: kafka:9092
      SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081`,
          lang: "yaml"
        },
        {
          title: "Bring it up and wait for the registry",
          code: `docker compose up -d
until curl -s localhost:8081/subjects >/dev/null; do sleep 2; done
echo "schema registry up"`,
          lang: "bash"
        },
        {
          title: "Register the base CDC schema and pin BACKWARD compatibility",
          body: "<code>jq -Rn</code> builds a correctly escaped registry payload from the raw schema string, so you never hand-escape JSON.",
          code: `BASE='{"type":"record","name":"Customer","fields":[{"name":"id","type":"int"},{"name":"email","type":"string"}]}'
jq -Rn --arg s "$BASE" '{schema:$s}' | curl -s -X POST \\
  http://localhost:8081/subjects/customers-value/versions \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" -d @-
echo
curl -s -X PUT http://localhost:8081/config/customers-value \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d '{"compatibility":"BACKWARD"}'`,
          lang: "bash"
        },
        {
          title: "Check a safe change: add an optional field with a default",
          code: `SAFE='{"type":"record","name":"Customer","fields":[{"name":"id","type":"int"},{"name":"email","type":"string"},{"name":"phone","type":"string","default":""}]}'
jq -Rn --arg s "$SAFE" '{schema:$s}' | curl -s -X POST \\
  http://localhost:8081/compatibility/subjects/customers-value/versions/latest \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" -d @-
# expect: {"is_compatible":true}`,
          lang: "bash"
        },
        {
          title: "Check a breaking change: add a required field with no default",
          code: `BREAK='{"type":"record","name":"Customer","fields":[{"name":"id","type":"int"},{"name":"email","type":"string"},{"name":"phone","type":"string"}]}'
jq -Rn --arg s "$BREAK" '{schema:$s}' | curl -s -X POST \\
  http://localhost:8081/compatibility/subjects/customers-value/versions/latest \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" -d @-
# expect: {"is_compatible":false}  -- a CI step keys off this and fails the merge`,
          lang: "bash"
        }
      ],
      observe: "The safe candidate returns <code>{\"is_compatible\":true}</code> while the breaking one returns <code>{\"is_compatible\":false}</code>, so the check rejects the breaking schema before it ever reaches the registry or a real pipeline: enforced in CI, not discovered later by a broken downstream consumer.",
      stretch: "Wrap the compatibility <code>POST</code> in a shell script that exits non-zero when <code>is_compatible</code> is false, then call it from a CI job so a breaking schema pull request fails the build automatically instead of relying on a human to run the check."
    }
  },
  keyTakeaways: [
    "A schema registry is the <strong>single source of truth</strong> for event payloads and enforces compatibility as schemas evolve.",
    "<strong>Backward</strong> is safe for adding optional fields, <strong>forward</strong> for removing fields, and <strong>full</strong> enforces both and is strictest in production.",
    "Enforce compatibility <strong>in CI</strong>: reject a schema PR that would break consumers, instead of finding out downstream."
  ],
  proTip: "Add fields as optional with a default and you stay backward compatible almost for free. Save full compatibility for topics where both producers and consumers deploy independently and you cannot coordinate a breaking change.",
  related: ["cdc", "kafka", "data-quality", "etl", "data-lineage"],
  bridgeOut: "Contracts keep the shape of data honest. Next: track where a given number actually came from as it moves through CDC, ETL, streams, and the warehouse, with Data Lineage."
};
