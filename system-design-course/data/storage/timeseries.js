/* === Lesson timeseries - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#timeseries)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["timeseries"] = {
  module: 6, num: "6.7", title: "Time-Series DBs",
  connectsFrom: "Wide-column stores handle high write throughput generically. Time-series databases specialize that further for one specific pattern: <strong>append-heavy writes plus range queries over time</strong>.",
  tabs: {
    overview: {
      heading: "Optimized for the Time Axis",
      intro: "A time-series database is built around one shape: data arrives constantly, ordered by time, and is queried in ranges (\u201clast 5 minutes,\u201d \u201clast 30 days\u201d). That lets it ingest millions of points per second and age old data out automatically.",
      cards: [
        { icon: "I", title: "InfluxDB", color: "blue", body: "Purpose-built time-series database with high-ingest writes and a query language tuned for time ranges." },
        { icon: "P", title: "Prometheus", color: "orange", body: "<strong>Pull-based scraping</strong>: it reaches out and scrapes metrics endpoints on an interval, rather than receiving pushed writes." },
        { icon: "T", title: "TimescaleDB", color: "green", body: "A <strong>Postgres extension</strong>: full SQL over time-series data, so you keep familiar tooling while gaining time-optimized storage." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>High ingest</strong> (millions/sec), <strong>auto-retention</strong> (TTL cleanup of old data), and <strong>downsampling</strong> (1s \u2192 1min \u2192 1hr as data ages). Prometheus is pull-based scraping; TimescaleDB is a Postgres extension giving SQL over time-series." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Prometheus or InfluxDB image).",
      setup: "Local and free: `docker run -d -p 9090:9090 prom/prometheus`.",
      simulate: "Write a tiny script that exposes a `/metrics` endpoint in Prometheus's text format (a counter that increments every second), configure Prometheus to scrape it every 5s, and let it run for a few minutes. Query it via Prometheus's own UI at `localhost:9090` with `rate(my_counter[1m])`.",
      observe: "Prometheus automatically builds a time-series history from repeated scrapes with zero manual \u201cinsert a row\u201d code on your part: pull-based ingestion, exactly as named, versus every other lesson's push-based writes.",
      stretch: "Configure a retention policy (`--storage.tsdb.retention.time=1h`) and confirm data older than that window disappears from queries: the automatic TTL cleanup claim, observed instead of assumed."
    }
  },
  keyTakeaways: [
    "Time-series databases specialize for append-heavy writes plus range queries over time, hitting millions of points per second.",
    "Auto-retention (TTL) and downsampling (1s \u2192 1min \u2192 1hr) keep storage bounded by aging out and coarsening old data automatically.",
    "Prometheus is pull-based (it scrapes endpoints), while TimescaleDB is a Postgres extension that gives you full SQL over time-series data."
  ],
  proTip: "If you already run Postgres and your time-series volume is moderate, TimescaleDB often beats adding a whole new database: you keep SQL, joins, and existing tooling while gaining time-partitioned storage.",
  related: ["nosql", "db-choice", "sql"],
  bridgeOut: "This category reappears later as the backing store for Observability's Metrics lesson: the same append-heavy, range-query shape underpins how systems store their own telemetry."
};
