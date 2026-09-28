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
      prerequisites: "The Kafka lab from 8.2; ClickHouse from 12.5.",
      setup: "Local and free: reuse both, plus ClickHouse\u2019s native Kafka table engine (built in, no extra service needed) to consume directly from a topic.",
      simulate: "Create a ClickHouse table using the <code>Kafka</code> engine pointed at your <code>rides</code> topic from 8.2, plus a materialized view that continuously inserts consumed rows into a regular ClickHouse table. Produce a burst of events to the topic and query the materialized table immediately after.",
      observe: "Query results reflect events produced just seconds earlier, with zero manual run-an-ETL-job step: data flows continuously from Kafka into a queryable analytical table, the sub-second-fresh claim measured by timing produce-to-queryable latency yourself.",
      stretch: "Compare this against querying your 12.5 batch-loaded warehouse table (populated by a scheduled dbt run) for the same recent events: the batch table simply will not have them yet, a direct, felt contrast between the two freshness models."
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
