/* === Lesson dashboards - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#dashboards)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["dashboards"] = {
  module: 13, num: "13.6", title: "Dashboards & Visualization",
  connectsFrom: "Producing signal is not the same as making it usable during an incident. A dashboard is the <strong>first screen a human actually looks at</strong>, so design for clarity: USE for infra, RED for services, business KPIs for stakeholders.",
  tabs: {
    overview: {
      heading: "The First Screen During an Incident",
      intro: "A dashboard is the first thing you look at during an incident, so it must be scannable under stress. The discipline is a few design principles plus <strong>four golden dashboards</strong> that each answer a different question.",
      cards: [
        { icon: "1", title: "Service Health (RED)", color: "blue", body: "Request rate, error rate, p50/p95/p99 latency, and active connections. Answers \u201cis this service healthy?\u201d" },
        { icon: "2", title: "Infrastructure (USE)", color: "green", body: "CPU %, memory usage/limits, disk I/O and space, network in/out. Answers \u201cis the box overloaded?\u201d" },
        { icon: "3", title: "Dependencies", color: "orange", body: "DB query latency, cache hit ratio, external API latency, queue depth/lag. Answers \u201cis something downstream slow?\u201d" },
        { icon: "4", title: "Business KPIs", color: "purple", body: "Orders/min, signup conversion, revenue/min, active users. Answers \u201cdoes any of this matter to the business?\u201d" }
      ],
      table: {
        headers: ["Principle", "Description", "Example"],
        rows: [
          ["<strong>Audience-first</strong>", "Different dashboards for different roles", "SRE: latency/errors. PM: conversion rate. Exec: uptime %"],
          ["<strong>Top-down drill</strong>", "Start high-level, click to detail", "Service overview \u2192 endpoint breakdown \u2192 individual trace"],
          ["<strong>Time alignment</strong>", "All panels share the same time range", "Correlate a CPU spike with a latency increase at the same moment"],
          ["<strong>Annotations</strong>", "Mark deployments and incidents on the timeline", "Vertical line: \u201cv2.4.1 deployed\u201d, correlate with a metric change"],
          ["<strong>Thresholds visible</strong>", "Show SLO/SLA lines on graphs", "Red line at p99 = 500ms (SLO boundary)"],
          ["<strong>\u2264 8 panels</strong>", "Cognitive load limit per dashboard", "More panels = slower load and harder to scan during an incident"]
        ]
      },
      tables: [
        {
          headers: ["Anti-Pattern", "Problem", "Fix"],
          rows: [
            ["<strong>Too many panels</strong>", "Cognitive overload, slow rendering, can\u2019t find signal in noise", "Max 6-8 panels per dashboard. Split into sub-dashboards."],
            ["<strong>Vanity metrics</strong>", "\u201cTotal requests ever\u201d, not actionable, always goes up", "Show <strong>rate of change</strong> (RPS), not cumulative totals"],
            ["<strong>No context</strong>", "Graph shows spike but no reference for \u201cnormal\u201d", "Add <strong>SLO threshold lines</strong> + deployment annotations"],
            ["<strong>Average-only</strong>", "Hides tail latency, 1% of users suffering", "Always show <strong>p50 + p95 + p99</strong> together"],
            ["<strong>Stale dashboards</strong>", "Panels for decommissioned services, broken queries", "Quarterly dashboard review. Delete unused panels."],
            ["<strong>No drill-down</strong>", "See problem but can\u2019t investigate further", "Link panels to detailed dashboards, traces, logs"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Grafana tips:", body: "Use <strong>variables</strong> for service and environment selectors. <strong>Annotations</strong> for deploys. <strong>Alert rules</strong> directly on panels. <strong>Exemplars</strong>: click a metric data point to jump straight to the exact trace that produced it. <strong>Explore</strong> mode for ad-hoc investigation." },
        { color: "blue", label: "One-liner:", body: "Build <strong>4 dashboards per service</strong> (RED, USE, Dependencies, Business). Max <strong>8 panels each</strong>. Show percentiles not averages. Add <strong>SLO lines and deploy annotations</strong>. Link to traces for drill-down." }
      ]
    },
    realWorld: {
      heading: "Designing for the Incident",
      intro: "Good dashboards are built from a small set of principles that pay off exactly when things are on fire.",
      points: [
        { label: "Six design principles", body: "Audience-first, top-down drill (summary first, detail on demand), time alignment (every panel on the same window), annotations (mark deploys and incidents on the graph), visible thresholds, and 8 panels or fewer per dashboard." },
        { label: "The four golden dashboards", body: "Service Health (RED), Infrastructure (USE), Dependencies (DB latency, cache hit ratio, external API latency, queue depth), and Business KPIs (orders/min, conversion, revenue, active users). Each answers a distinct question." },
        { label: "Exemplars close the loop", body: "Grafana\u2019s <strong>Exemplars</strong> feature lets you click a metric data point and jump straight to the exact trace that produced it, connecting the aggregate view back to a single request." }
      ]
    },
    tradeoffs: {
      heading: "Dashboard Anti-Patterns",
      intro: "A cluttered or misleading dashboard costs you minutes exactly when minutes matter most.",
      points: [
        { label: "Too many panels", body: "Cognitive overload, slow rendering, and signal lost in noise. Cap at 6-8 panels per dashboard and split the rest into sub-dashboards." },
        { label: "Vanity and average-only metrics", body: "\u201cTotal requests ever\u201d always goes up and is not actionable; show rate of change (RPS) instead. Average-only displays hide the p99 tail, so always show p50 + p95 + p99 together." },
        { label: "No context", body: "A spike with no reference for \u201cnormal\u201d is unreadable. Add SLO threshold lines and deployment annotations so a change has meaning." },
        { label: "Stale dashboards and no drill-down", body: "Panels for decommissioned services and broken queries erode trust; review quarterly. Without links to detailed dashboards, traces, and logs, you can see a problem but cannot investigate it." }
      ]
    },
    handsOn: {
      goal: "Build a 4-panel RED \u201cService Health\u201d dashboard in Grafana, drop a deploy annotation on the timeline, then trigger a latency spike right after it so the annotation visibly explains the change.",
      stack: "Grafana + Prometheus from 13.2, driven by the instrumented app. Provisioned entirely over the HTTP API. Local and free.",
      steps: [
        {
          title: "Add Prometheus as a Grafana datasource",
          body: "Grafana is on port 3001 from 13.2; <code>prom</code> is the Prometheus container name on the <code>obs</code> network.",
          code: "curl -s -X POST http://admin:admin@localhost:3001/api/datasources -H \"Content-Type: application/json\" -d '{\"name\":\"Prometheus\",\"type\":\"prometheus\",\"url\":\"http://prom:9090\",\"access\":\"proxy\",\"isDefault\":true}'",
          lang: "bash"
        },
        {
          title: "Define a 4-panel RED dashboard",
          body: "Save as <code>dashboard.json</code>. Four panels only (rate, errors, latency percentiles, traffic by status), all sharing one time range. PromQL uses single quotes so the JSON stays clean.",
          code: `{
  "dashboard": {
    "title": "Service Health (RED)",
    "time": { "from": "now-15m", "to": "now" },
    "panels": [
      { "id": 1, "title": "Request rate (RPS)", "type": "timeseries", "gridPos": {"h":8,"w":12,"x":0,"y":0},
        "targets": [ { "expr": "sum(rate(http_server_duration_ms_count[1m]))" } ] },
      { "id": 2, "title": "Error rate", "type": "timeseries", "gridPos": {"h":8,"w":12,"x":12,"y":0},
        "targets": [ { "expr": "sum(rate(http_server_duration_ms_count{status=~'5..'}[1m])) / sum(rate(http_server_duration_ms_count[1m]))" } ] },
      { "id": 3, "title": "Latency p50/p95/p99", "type": "timeseries", "gridPos": {"h":8,"w":12,"x":0,"y":8},
        "targets": [
          { "expr": "histogram_quantile(0.50, sum(rate(http_server_duration_ms_bucket[1m])) by (le))" },
          { "expr": "histogram_quantile(0.95, sum(rate(http_server_duration_ms_bucket[1m])) by (le))" },
          { "expr": "histogram_quantile(0.99, sum(rate(http_server_duration_ms_bucket[1m])) by (le))" }
        ] },
      { "id": 4, "title": "Traffic by status", "type": "timeseries", "gridPos": {"h":8,"w":12,"x":12,"y":8},
        "targets": [ { "expr": "sum by (status) (rate(http_server_duration_ms_count[1m]))" } ] }
    ],
    "schemaVersion": 39
  },
  "overwrite": true
}`,
          lang: "json"
        },
        {
          title: "Import the dashboard via the API",
          code: "curl -s -X POST http://admin:admin@localhost:3001/api/dashboards/db -H \"Content-Type: application/json\" -d @dashboard.json",
          lang: "bash"
        },
        {
          title: "Mark a deploy on the timeline",
          body: "The annotations API stamps a vertical line at the current moment tagged <code>deploy</code>.",
          code: "curl -s -X POST http://admin:admin@localhost:3001/api/annotations -H \"Content-Type: application/json\" -d \"{\\\"time\\\": $(($(date +%s)*1000)), \\\"tags\\\": [\\\"deploy\\\"], \\\"text\\\": \\\"v2.4.1 deployed\\\"}\"",
          lang: "bash"
        },
        {
          title: "Trigger a latency spike right after the marker",
          body: "Restart the app with the slow branch cranked up (or just hammer it) so p99 jumps just after the annotation.",
          code: "hey -z 60s -c 100 http://localhost:3000/",
          lang: "bash"
        }
      ],
      observe: "The vertical <code>deploy</code> line sits immediately before the p99 climb, so the correlation is obvious at a glance. The \u201cannotations mark deploys and incidents on the graph\u201d principle works as an actual diagnostic aid, not just a nice-to-have.",
      stretch: "Build a second, deliberately bad dashboard with 20 panels, all averages-only and no annotations, then time how long it takes to spot the same spike on each. The gap is the real cost of the anti-patterns."
    }
  },
  keyTakeaways: [
    "Every service needs <strong>four golden dashboards</strong>: Service Health (RED), Infrastructure (USE), Dependencies, and Business KPIs, each answering a distinct question.",
    "Design for clarity under stress: <strong>8 panels or fewer</strong>, shared time ranges, visible SLO thresholds, and deploy annotations so changes have context.",
    "Avoid the anti-patterns: too many panels, vanity metrics, <strong>average-only displays</strong> that hide p99, stale dashboards, and no drill-down to traces."
  ],
  proTip: "Wire up Grafana Exemplars early: being able to click a p99 spike and land on the exact slow trace turns a dashboard from \u201csomething is wrong\u201d into \u201chere is the request that proves it.\u201d",
  related: ["metrics", "tracing", "monitoring", "opentelemetry", "incident-response"],
  bridgeOut: "Every earlier lesson exists to support this exact moment: an actual incident, in progress. Next: incident response, the process that turns all this signal into a fast, calm recovery."
};
