/* === Lesson metrics - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#metrics)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["metrics"] = {
  module: 13, num: "13.2", title: "Metrics",
  connectsFrom: "Reading individual log lines to decide \u201cis the system healthy right now?\u201d is too slow. Metrics are the aggregated, numeric, time-series view that answers it instantly.",
  tabs: {
    overview: {
      heading: "The Golden Signals",
      intro: "Metrics are numeric time-series data for <strong>alerting and trending</strong>. The <strong>Golden Signals</strong> (Google SRE) are Latency, Traffic, Errors, and Saturation. Track them with <strong>RED</strong> for services and <strong>USE</strong> for infrastructure.",
      cards: [
        { icon: "R", title: "RED", color: "blue", body: "<strong>Rate, Errors, Duration</strong>. Service-centric: requests/sec, error %, and p99 response time. Best for microservices and APIs." },
        { icon: "U", title: "USE", color: "orange", body: "<strong>Utilization, Saturation, Errors</strong>. Resource-centric: CPU %, queue depth, device error count. Best for infrastructure." },
        { icon: "%", title: "p99, not average", color: "red", body: "avg=85ms can hide p50=50ms, p95=120ms, p99=800ms, and <strong>p999=2.5s</strong>. At 1M req/day, the p99 tail is 10K bad experiences the average never shows." }
      ],
      table: {
        headers: ["Signal", "What It Measures", "Key Metrics", "Alert When"],
        rows: [
          ["<strong>Latency</strong>", "Time to serve a request", "<strong>p50</strong> \u00b7 <strong>p95</strong> \u00b7 <strong>p99</strong> \u00b7 <strong>p999</strong>. Never use avg, it hides tail latency", "p99 &gt; SLA threshold"],
          ["<strong>Traffic</strong>", "Demand on the system", "<strong>RPS</strong> \u00b7 <strong>TPS</strong> \u00b7 bytes/sec \u00b7 active connections", "Sudden spike or unexpected drop"],
          ["<strong>Errors</strong>", "Rate of failed requests", "<strong>Error rate %</strong> \u00b7 5xx count \u00b7 timeout count \u00b7 <strong>DLQ depth</strong>", "Error rate &gt; 1% or any 5xx spike"],
          ["<strong>Saturation</strong>", "How full or overloaded the system is", "<strong>CPU %</strong> \u00b7 <strong>Memory %</strong> \u00b7 <strong>Disk I/O</strong> \u00b7 <strong>Thread pool queue depth</strong>", "CPU &gt; 80% sustained"]
        ]
      },
      tables: [
        {
          headers: ["Method", "Full Form", "Best For", "Metrics"],
          rows: [
            ["<strong>RED</strong>", "<strong>Rate \u00b7 Errors \u00b7 Duration</strong>", "Microservices, APIs", "Requests/sec \u00b7 Error % \u00b7 p99 response time"],
            ["<strong>USE</strong>", "<strong>Utilization \u00b7 Saturation \u00b7 Errors</strong>", "Infrastructure: CPU, memory, disk, network", "CPU % \u00b7 queue depth \u00b7 device error count"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "SLI / SLO / SLA:", body: "<strong>SLI</strong> (indicator) is the actual measured metric. <strong>SLO</strong> (objective) is the internal target. <strong>SLA</strong> (agreement) is the contractual commitment with a penalty. The SLO should be <strong>stricter than the SLA</strong>. Error Budget = 100% \u2212 SLO." },
        { color: "yellow", label: "Tools:", body: "<strong>Prometheus</strong> scrape + store time-series. <strong>Grafana</strong> dashboards + alerting. <strong>Datadog</strong> managed APM. <strong>CloudWatch</strong> AWS native. <strong>OpenTelemetry</strong> vendor-neutral standard. <strong>Thanos/Cortex</strong> long-term Prometheus storage." },
        { color: "blue", label: "One-liner:", body: "Track <strong>p99 not average</strong>. Use <strong>RED for services</strong>, <strong>USE for infra</strong>, alert on Golden Signals, and define SLOs stricter than the SLA. Watch for <strong>cardinality explosion</strong>." }
      ]
    },
    realWorld: {
      heading: "The Modern Metrics Stack",
      intro: "Metrics flow through an open-source pipeline that has become the industry default.",
      points: [
        { label: "Collection flow", body: "app + OTel SDK \u2192 OTel Collector \u2192 <strong>Prometheus</strong> (a TSDB queried via PromQL) \u2192 <strong>Grafana</strong> \u2192 PagerDuty/Slack/Email. It is the modern open-source metrics stack." },
        { label: "Golden Signals origin", body: "Latency, Traffic, Errors, and Saturation come from Google SRE. RED (Rate, Errors, Duration) is service-centric; USE (Utilization, Saturation, Errors) is resource-centric." },
        { label: "Long-term storage", body: "Prometheus retention is limited, so <strong>Thanos</strong> or <strong>Cortex</strong> extend it for long-term storage. <strong>Datadog</strong> is a common commercial alternative to the whole stack." },
        { label: "Tools", body: "Prometheus (scrape + store), Grafana (dashboards + alerting), Datadog (managed APM), CloudWatch (AWS native), OpenTelemetry (vendor-neutral standard)." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of High Cardinality",
      intro: "Metrics are cheap until a label choice makes them explode.",
      points: [
        { label: "Cardinality explosion", body: "Every unique combination of label values creates a new time series. A <code>user_id</code> label = millions of series and an OOM. A <code>request_path</code> with IDs like <code>/users/12345</code> is unbounded. It can silently exhaust a metrics backend\u2019s memory." },
        { label: "Fix: bounded labels", body: "Use bounded labels (method, status_code, service) and push high-cardinality data to <strong>logs and traces</strong> instead. A rule of thumb: fewer than 10 values per label." },
        { label: "Average hides the tail", body: "An average smooths over the exact users who are suffering. Always compute percentiles (p50/p95/p99/p999) so the tail stays visible." }
      ]
    },
    handsOn: {
      prerequisites: "The Prometheus setup from Module 6.7; Grafana (free, Docker image).",
      setup: "Local and free: Prometheus + Grafana via Docker Compose, both official free images.",
      simulate: "Instrument a small app with request-count and latency histogram metrics using an OTel SDK, scrape it with Prometheus, and build a Grafana dashboard computing p50/p95/p99 via PromQL (<code>histogram_quantile(0.99, rate(...[5m]))</code>). Generate load with varying latency and watch the percentiles diverge from the average in real time.",
      observe: "Your own dashboard reproduces the \u201cavg hides tail pain\u201d claim with live numbers, including a real p999 spike whenever you inject an artificially slow request. The Golden Signals, on your own graph instead of a static example.",
      stretch: "Add a <code>user_id</code> label to your request-count metric and generate traffic from 10,000 distinct synthetic user IDs. Watch Prometheus memory and <code>prometheus_tsdb_head_series</code> climb sharply, reproducing cardinality explosion on purpose so you recognize it before it happens by accident."
    }
  },
  keyTakeaways: [
    "The <strong>Golden Signals</strong> (Latency, Traffic, Errors, Saturation) plus <strong>RED</strong> for services and <strong>USE</strong> for infra give near-complete coverage of system health.",
    "Always track <strong>percentiles</strong> (p99, even p999), never averages: an average hides the tail latency that real users feel.",
    "Define SLOs <strong>stricter than the SLA</strong> and treat Error Budget (100% \u2212 SLO) as spendable; beware <strong>cardinality explosion</strong> from unbounded labels."
  ],
  proTip: "Before adding any metric label, ask \u201chow many distinct values can this take?\u201d If the answer is unbounded (user_id, request path with IDs), it belongs in a log or trace, not a metric label.",
  related: ["logging", "tracing", "monitoring", "opentelemetry", "nfr-metrics", "dashboards", "incident-response"],
  bridgeOut: "Metrics and logs together still cannot answer \u201cwhich of a dozen services was the bottleneck for this one request?\u201d That is what distributed tracing exists to do."
};
