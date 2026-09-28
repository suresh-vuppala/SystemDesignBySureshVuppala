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
      prerequisites: "The Schema Registry lab from 8.9.",
      setup: "Local and free: reuse it.",
      simulate: "Point your 12.1 CDC pipeline\u2019s Kafka topic at the same Schema Registry, register a schema for the CDC events, and add a CI step (a simple shell script is enough) that runs a compatibility check against the latest registered version before allowing a merge.",
      observe: "A genuinely breaking schema change gets rejected by that CI check before it ever reaches the registry or a real pipeline: enforced in CI, not discovered later by a broken downstream consumer.",
      stretch: "This reuses 8.9\u2019s registry to make enforce in CI concrete rather than requiring new infrastructure, so no extra stretch setup is needed."
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
