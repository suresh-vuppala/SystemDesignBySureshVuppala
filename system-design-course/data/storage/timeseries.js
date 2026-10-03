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
      goal: "Expose a counter metric, point Prometheus at it, and watch a time-series history build itself from repeated scrapes with zero \u201cinsert a row\u201d code: pull-based ingestion, felt directly.",
      stack: "Prometheus in Docker plus a tiny Python <code>/metrics</code> endpoint. Local and free.",
      steps: [
        {
          title: "Expose a metric in Prometheus text format",
          body: "A counter that climbs every second. Save as <code>metrics.py</code> and run <code>python metrics.py</code> (serves on port 8000).",
          code: `# metrics.py - a counter exposed in Prometheus text format
import http.server, time

start = time.time()

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        value = int(time.time() - start)  # climbs ~1 per second
        body = "# TYPE my_counter counter\\nmy_counter " + str(value) + "\\n"
        self.send_response(200)
        self.end_headers()
        self.wfile.write(body.encode())

http.server.HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()`,
          lang: "python"
        },
        {
          title: "Write a scrape config",
          body: "Scrape the endpoint every 5 seconds. Save as <code>prometheus.yml</code>. <code>host.docker.internal</code> lets the container reach your host.",
          code: `global:
  scrape_interval: 5s
scrape_configs:
  - job_name: demo
    static_configs:
      - targets: ["host.docker.internal:8000"]`,
          lang: "yaml"
        },
        {
          title: "Start Prometheus with that config",
          code: "docker run -d --name prom -p 9090:9090 -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus",
          lang: "bash"
        },
        {
          title: "Query the per-second rate in the UI",
          body: "Open <code>http://localhost:9090</code>, let it run a few minutes, and run this in the expression box.",
          code: "rate(my_counter[1m])",
          lang: "text"
        }
      ],
      observe: "Prometheus builds a time-series history from repeated scrapes with no manual insert code on your part: pull-based ingestion, exactly as named, versus every other lesson's push-based writes.",
      stretch: "Restart Prometheus with <code>--storage.tsdb.retention.time=1h</code> and confirm data older than that window disappears from queries: the automatic TTL cleanup claim, observed instead of assumed."
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
