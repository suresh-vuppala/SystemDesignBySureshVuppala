/* === Lesson realtime-analytics - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#realtime-analytics)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["realtime-analytics"] = {
  module: 12, num: "12.10", title: "Real-Time Analytics",
  connectsFrom: "A warehouse\u2019s batch-loaded freshness (hourly, daily) is not fast enough for a live \u201cwho viewed your profile\u201d feature or a real-time fraud dashboard. Real-time analytics delivers sub-second OLAP directly from streaming sources.",
  tabs: {
    overview: {
      heading: "Sub-Second OLAP From Streaming Sources",
      intro: "Real-time analytics wires streaming ingestion straight into a specialized OLAP store: <code>Kafka \u2192 stream engine (Flink/Spark) \u2192 OLAP store \u2192 dashboard</code>. The result is <strong>sub-second freshness</strong> with queries answered in <strong>milliseconds</strong>, something a batch-loaded warehouse cannot offer.",
      cards: [
        { icon: "P", title: "Apache Pinot", color: "purple", body: "<strong>User-facing analytics</strong> at scale. Powers LinkedIn\u2019s \u201cwho viewed your profile.\u201d" },
        { icon: "D", title: "Apache Druid", color: "blue", body: "<strong>Time-series OLAP</strong>, built for slicing and dicing across time dimensions." },
        { icon: "C", title: "ClickHouse", color: "orange", body: "<strong>Lightning-fast columnar SQL</strong>. Used by Cloudflare for high-volume analytics." }
      ],
      table: {
        headers: ["Engine", "Sweet spot"],
        rows: [
          ["Apache Pinot", "User-facing analytics (LinkedIn \u201cwho viewed\u201d)"],
          ["Apache Druid", "Time-series OLAP, slicing and dicing"],
          ["ClickHouse", "Lightning-fast columnar SQL (Cloudflare)"],
          ["Materialize / RisingWave", "Streaming SQL with incremental views"]
        ]
      },
      callouts: [
        { color: "green", label: "Architecture:", body: "<code>Kafka \u2192 stream engine (Flink/Spark) \u2192 OLAP store \u2192 BI / app dashboards</code>. Sub-second freshness, query in ms." }
      ]
    },
    tradeoffs: {
      heading: "Real-Time OLAP vs A Batch Warehouse",
      intro: "A real-time OLAP store buys freshness, but it is a specialized system alongside the warehouse, not a replacement for it.",
      points: [
        { label: "Freshness vs simplicity", body: "A batch warehouse is loaded on a schedule, so recent events simply are not there yet. A real-time store ingests continuously for sub-second freshness, at the cost of running another moving system." },
        { label: "Serving fast reads", body: "Engines like <strong>Pinot</strong> and <strong>Druid</strong> are tuned for high-concurrency, low-latency queries feeding user-facing features, not the heavy ad-hoc scans a warehouse handles." },
        { label: "Incremental views", body: "<strong>Materialize / RisingWave</strong> keep results fresh with streaming SQL and incremental materialized views, avoiding a full recompute but adding streaming-state complexity." }
      ]
    },
    handsOn: {
      goal: "Stream events from Kafka straight into ClickHouse and query them seconds after producing, with no manual ETL step, proving the sub-second-freshness claim.",
      stack: "Kafka plus ClickHouse in Docker, using ClickHouse's built-in Kafka table engine. Local and free.",
      steps: [
        {
          title: "Start Kafka and ClickHouse on one network",
          code: "docker network create rtnet 2>/dev/null || true\ndocker run -d --name kafka --network rtnet -p 9092:9092 apache/kafka:latest\ndocker run -d --name clickhouse --network rtnet -p 8123:8123 clickhouse/clickhouse-server",
          lang: "bash"
        },
        {
          title: "Create the topic and produce a burst of rides",
          code: "docker exec kafka /opt/kafka/bin/kafka-topics.sh --create --topic rides --bootstrap-server localhost:9092\ndocker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic rides --bootstrap-server localhost:9092 <<'EOF'\n{\"id\":1,\"fare\":12}\n{\"id\":2,\"fare\":30}\n{\"id\":3,\"fare\":7}\nEOF",
          lang: "bash"
        },
        {
          title: "Wire a Kafka engine table plus a materialized view",
          body: "The Kafka engine consumes the topic; the materialized view continuously inserts consumed rows into a regular table you can query. Save as <code>rt.sql</code>.",
          code: "CREATE TABLE rides_queue (id UInt64, fare UInt32)\n  ENGINE = Kafka SETTINGS kafka_broker_list = 'kafka:9092',\n  kafka_topic_list = 'rides', kafka_group_name = 'ch', kafka_format = 'JSONEachRow';\n\nCREATE TABLE rides (id UInt64, fare UInt32) ENGINE = MergeTree ORDER BY id;\n\nCREATE MATERIALIZED VIEW rides_mv TO rides AS SELECT id, fare FROM rides_queue;",
          lang: "sql"
        },
        {
          title: "Load the SQL and query the fresh data",
          code: "docker exec -i clickhouse clickhouse-client --multiquery < rt.sql\ndocker exec clickhouse clickhouse-client -q \"SELECT count(), avg(fare) FROM rides\"",
          lang: "bash"
        }
      ],
      observe: "The query returns a count and average for events you produced seconds earlier, with no run-an-ETL-job step: data flows continuously from Kafka into a queryable analytical table. Time the produce-to-queryable gap yourself and watch it stay in the seconds range.",
      stretch: "Query your 12.5 batch-loaded warehouse table (populated by a scheduled dbt run) for the same recent events: it simply will not have them yet, a direct, felt contrast between streaming and batch freshness."
    }
  },
  keyTakeaways: [
    "Real-time analytics delivers <strong>sub-second OLAP</strong> from streaming sources: <code>Kafka \u2192 stream engine \u2192 OLAP store \u2192 dashboard</code>.",
    "Engines fit different niches: <strong>Pinot</strong> for user-facing analytics, <strong>Druid</strong> for time-series, <strong>ClickHouse</strong> for fast columnar SQL, <strong>Materialize/RisingWave</strong> for streaming SQL.",
    "It complements the warehouse rather than replacing it: freshness in exchange for running another streaming system."
  ],
  proTip: "Reach for a real-time OLAP store only when freshness must beat the next batch load. If hourly or daily data is good enough, a warehouse is simpler and cheaper than operating Kafka plus a stream engine plus Pinot or Druid.",
  related: ["stream-processing", "data-warehouse", "kafka", "etl", "cdc"],
  bridgeOut: "This closes Module 12. The pipeline is now a live, moving, distributed system, and you cannot operate what you cannot see. Next up: Observability."
};
