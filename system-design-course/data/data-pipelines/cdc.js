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
      goal: "Prove log-based CDC by streaming every Postgres row change into Kafka through Debezium, with zero application code doing the publishing.",
      stack: "Postgres (logical replication) + Kafka + Debezium Connect via Docker Compose, the official Debezium tutorial stack. Local and free.",
      steps: [
        {
          title: "Save the Debezium tutorial Compose file",
          body: "The <code>example-postgres</code> image already ships with <code>wal_level=logical</code> enabled and a seeded <code>inventory</code> schema. Save as <code>docker-compose.yml</code>.",
          code: "version: \"3.7\"\nservices:\n  zookeeper:\n    image: quay.io/debezium/zookeeper:2.5\n    ports: [\"2181:2181\"]\n  kafka:\n    image: quay.io/debezium/kafka:2.5\n    ports: [\"9092:9092\"]\n    environment:\n      - ZOOKEEPER_CONNECT=zookeeper:2181\n  postgres:\n    image: quay.io/debezium/example-postgres:2.5\n    ports: [\"5432:5432\"]\n    environment:\n      - POSTGRES_USER=postgres\n      - POSTGRES_PASSWORD=postgres\n  connect:\n    image: quay.io/debezium/connect:2.5\n    ports: [\"8083:8083\"]\n    environment:\n      - BOOTSTRAP_SERVERS=kafka:9092\n      - GROUP_ID=1\n      - CONFIG_STORAGE_TOPIC=my_connect_configs\n      - OFFSET_STORAGE_TOPIC=my_connect_offsets\n      - STATUS_STORAGE_TOPIC=my_connect_statuses",
          lang: "yaml"
        },
        {
          title: "Start the stack",
          code: "docker compose up -d\n# wait until Kafka Connect answers on 8083\ncurl -s localhost:8083/ | head",
          lang: "bash"
        },
        {
          title: "Register a Debezium connector on the WAL",
          body: "No polling and no app code: the connector reads the write-ahead log via <code>pgoutput</code> and creates its own Kafka topics.",
          code: "curl -i -X POST -H \"Accept:application/json\" -H \"Content-Type:application/json\" \\\n  localhost:8083/connectors/ -d '{\n  \"name\": \"inventory-connector\",\n  \"config\": {\n    \"connector.class\": \"io.debezium.connector.postgresql.PostgresConnector\",\n    \"database.hostname\": \"postgres\",\n    \"database.port\": \"5432\",\n    \"database.user\": \"postgres\",\n    \"database.password\": \"postgres\",\n    \"database.dbname\": \"postgres\",\n    \"topic.prefix\": \"dbserver1\",\n    \"table.include.list\": \"inventory.customers\",\n    \"plugin.name\": \"pgoutput\"\n  }\n}'",
          lang: "bash"
        },
        {
          title: "Change rows directly in Postgres, never touching Kafka",
          code: "docker compose exec postgres psql -U postgres -d postgres -c \"UPDATE inventory.customers SET first_name='Sally-Updated' WHERE id=1001;\"\ndocker compose exec postgres psql -U postgres -d postgres -c \"INSERT INTO inventory.customers VALUES (1005,'Ada','Lovelace','ada@math.org');\"\ndocker compose exec postgres psql -U postgres -d postgres -c \"DELETE FROM inventory.customers WHERE id=1005;\"",
          lang: "bash"
        },
        {
          title: "Consume the change-event topic Debezium created",
          code: "docker compose exec kafka /kafka/bin/kafka-console-consumer.sh \\\n  --bootstrap-server kafka:9092 \\\n  --topic dbserver1.inventory.customers \\\n  --from-beginning",
          lang: "bash"
        }
      ],
      observe: "A fully formed change event lands in Kafka the instant each row commits in Postgres, generated entirely from the WAL: no application code publishing anything, no second write path, no polling query. Compare that against a naive query-based approach (<code>WHERE updated_at &gt; ?</code> on a timer) and note the latency and DB-load difference.",
      stretch: "Watch the DELETE emit a change event whose <code>before</code> field still holds the row's prior state, followed by a null-valued tombstone record, so downstream systems know exactly what was deleted, not just that something was."
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
