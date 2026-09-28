/* === Lesson cdc - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#cdc)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cdc"] = {
  module: 12, num: "12.1", title: "Change Data Capture (CDC)",
  connectsFrom: "Search told you to always reindex from the source database and never treat the index as a source of truth, without ever explaining how. CDC is that mechanism: it streams every row change straight from the database transaction log so downstream systems stay in sync.",
  tabs: {
    overview: {
      heading: "Streaming Changes Straight From the Log",
      intro: "CDC streams database changes directly from the <strong>transaction log</strong> instead of adding a second, separate application write. That buys you <strong>real-time updates</strong>, <strong>decoupling</strong> (no app code changes), and clean <strong>integration</strong> to downstream systems, all derived from one source of truth: the DB.",
      cards: [
        { icon: "L", title: "Log-Based", color: "green", body: "Reads the WAL/binlog via <strong>Debezium</strong>. Latency in <strong>milliseconds</strong> and near-<strong>zero</strong> impact, because it reads the log, not the tables." },
        { icon: "Q", title: "Query-Based", color: "orange", body: "Polls with <code>WHERE updated_at &gt; ?</code>. Coarser latency (seconds to minutes) and it adds <strong>load</strong>, because every poll queries the DB." },
        { icon: "T", title: "Trigger-Based", color: "red", body: "A DB trigger writes to a shadow table. Low latency but the <strong>highest source load</strong>, since a trigger fires on every single write." }
      ],
      table: {
        headers: ["Method", "How", "Latency", "Impact on Source"],
        rows: [
          ["<strong>Log-Based</strong>", "Read WAL/binlog (Debezium)", "<strong>~ms</strong>", "<strong>Zero</strong>: reads log, not tables"],
          ["<strong>Query-Based</strong>", "Poll with <code>WHERE updated_at &gt; ?</code>", "~sec-min", "Load: queries hit DB"],
          ["<strong>Trigger-Based</strong>", "DB triggers write to shadow table", "~ms", "High: triggers on every write"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>At-least-once delivery</strong> (consumers must be idempotent). <strong>Ordering per table</strong>. <strong>No dual-write problem</strong>: the single source of truth is the DB, and everything else is derived from its log." },
        { color: "blue", label: "CDC Tools:", body: "<strong>Debezium</strong>: open-source, log-based, a Kafka Connect plugin (most popular). <strong>AWS DMS</strong>: managed, serverless, AWS-native migrations plus replication. <strong>Fivetran</strong>: SaaS, 200+ connectors, zero-config ELT to warehouses. <strong>Airbyte</strong>: open-source Fivetran alternative, 300+ connectors. All log-based options mean zero impact on the source DB." }
      ]
    },
    realWorld: {
      heading: "Where CDC Runs",
      points: [
        { label: "LinkedIn", body: "100+ Kafka topics fed via CDC." },
        { label: "Shopify", body: "Real-time inventory sync off the change stream." },
        { label: "Airbnb", body: "Debezium drives search index updates." },
        { label: "Stripe", body: "Outbox plus CDC for reliable payment events." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Reading the Log",
      intro: "CDC removes the dual-write problem but introduces its own trade-offs.",
      points: [
        { label: "The dual-write problem it solves", body: "Writing to the DB and then to a cache in two steps has no atomicity: if the DB write succeeds and the cache write fails, the two systems drift out of sync. CDC replaces that with a single write to the DB, and the log fans changes out to every target." },
        { label: "Consistency lag", body: "Targets are <strong>eventually consistent</strong>. Change events arrive with some delay, so a downstream read can briefly see stale data." },
        { label: "Ordering", body: "Order is guaranteed <strong>per table</strong>, not globally. Events can arrive out of order across tables or partitions, so consumers must tolerate that." },
        { label: "Operational complexity", body: "Setup, monitoring, and schema handling for connectors add real operational weight. Query-based CDC adds DB load from polling, and trigger-based CDC adds the highest load of all." }
      ]
    },
    handsOn: {
      prerequisites: "Docker Compose (Postgres + Kafka + Debezium Connect, a well-documented free stack). Debezium\u2019s own tutorial Compose file works directly.",
      setup: "Local and free: Debezium\u2019s official quickstart Docker Compose (Postgres + Kafka Connect + Debezium connector).",
      simulate: "Enable logical replication on your Postgres table, register a Debezium connector pointing at it, then insert/update/delete a few rows directly in Postgres via <code>psql</code>, never touching Kafka directly. Consume the Kafka topic Debezium creates automatically and inspect the change events.",
      observe: "A fully formed Kafka event appears for every row change the instant it commits in Postgres, generated entirely from the WAL: no application code publishing anything, no second write path, no polling query. Compare that against a naive query-based approach (<code>WHERE updated_at &gt; ?</code> on a timer) and note the latency and DB-load difference.",
      stretch: "Delete a row in Postgres and confirm Debezium emits a tombstone/delete event with the row\u2019s prior state still in the payload, useful for downstream systems that need to know what was deleted, not just that something was."
    }
  },
  keyTakeaways: [
    "CDC streams row changes from the <strong>transaction log</strong>, so downstream systems stay in sync from one source of truth instead of a second, fragile application write.",
    "Three methods trade latency against source load: <strong>log-based</strong> (ms, near-zero impact), <strong>query-based</strong> (polling, adds load), <strong>trigger-based</strong> (low latency, highest load).",
    "Delivery is <strong>at-least-once with per-table ordering</strong>, so consumers must be idempotent and tolerate eventual consistency."
  ],
  proTip: "Reach for log-based CDC (Debezium) by default: it gives millisecond latency with near-zero source impact. Only fall back to query-based or trigger-based when you cannot access the WAL/binlog.",
  related: ["kafka", "etl", "data-warehouse", "event-sourcing", "stream-processing", "batch-processing", "data-lineage", "data-quality", "pipeline-schema-registry", "realtime-analytics"],
  bridgeOut: "The dual-write problem CDC solves here is the exact vocabulary the Outbox Pattern in Distributed Transactions references without defining. Next: what happens to these change events once they need to land somewhere analytically useful, with ETL / ELT."
};
