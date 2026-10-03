/* === Lesson monitoring - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#monitoring)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["monitoring"] = {
  module: 13, num: "13.4", title: "Monitoring & Alerting",
  connectsFrom: "Alerting on every anomaly means the alerts that matter drown in noise nobody trusts anymore. The pipeline is Collect \u2192 Evaluate \u2192 Alert \u2192 Route \u2192 Respond \u2192 Root Cause Analysis, and you only page if human action is needed.",
  tabs: {
    overview: {
      heading: "Page a Human Only When Action Is Needed",
      intro: "Monitoring turns metrics into decisions: evaluate rules, fire alerts, deduplicate and route them, and only <strong>page a human when action is needed</strong>. The hard part is not detecting problems, it is not crying wolf.",
      cards: [
        { icon: "D", title: "Dedupe & Group", color: "blue", body: "The alert manager <strong>deduplicates, groups, silences, and inhibits</strong> related alerts before routing, so one root cause becomes one page, not ten." },
        { icon: "B", title: "Burn-Rate Alerting", color: "orange", body: "Alert on how fast the <strong>error budget</strong> is being consumed, not on a single breach. A 14.4\u00d7 burn rate exhausts a month\u2019s budget in ~2 days, so page immediately." },
        { icon: "K", title: "Runbook per Alert", color: "green", body: "Every alert links a <strong>runbook</strong> in its annotation. Escalate if there is no ack in 5 min. Rotate weekly with handoff notes." }
      ],
      table: {
        headers: ["Quality", "Alert Example", "Why", "Action"],
        rows: [
          ["<strong>Good</strong>", "Error rate &gt; 1% for 5 min on payment-svc", "Sustained, actionable, specific service", "Investigate payment gateway"],
          ["<strong>Good</strong>", "p99 latency &gt; 2s for 3 min", "User-impacting, time-windowed", "Check DB queries, scale pods"],
          ["<strong>Good</strong>", "Error budget burn rate &gt; 14.4\u00d7 for 1h", "SLO-based, predictive", "Will breach SLO in 6h if unchecked"],
          ["<strong>Bad</strong>", "Any single 500 error", "Too noisy, single errors are normal", "Alert fatigue, ignored"],
          ["<strong>Bad</strong>", "CPU &gt; 50%", "Not actionable, 50% is healthy", "Wastes on-call time"],
          ["<strong>Bad</strong>", "Disk usage &gt; 80% (no duration)", "No time window, transient spikes trigger", "False positives"]
        ]
      },
      callouts: [
        { color: "purple", label: "Burn-rate alerting:", body: "If SLO = 99.9% over 30 days, the error budget = 0.1% = 43.2 min/month. <strong>1\u00d7</strong> consumes it at the allowed rate (30 days). <strong>14.4\u00d7</strong> exhausts it in ~2 days, so page immediately. <strong>6\u00d7</strong> exhausts in ~5 days, so ticket and investigate. Use a <strong>short window (5 min)</strong> to detect fast burns plus a <strong>long window (1h)</strong> to confirm sustained ones." },
        { color: "green", label: "On-call rules:", body: "Every alert must have a <strong>runbook</strong> linked in its annotation. <strong>Escalation</strong>: if no ack in 5 min, escalate. <strong>Rotation</strong>: weekly with handoff notes. <strong>Blameless culture</strong>: focus on systems, not people." },
        { color: "blue", label: "One-liner:", body: "Only page if <strong>human action is needed</strong>. Use <strong>burn-rate alerts</strong> over static thresholds. Every alert needs a runbook. Group and deduplicate to prevent <strong>alert fatigue</strong>." }
      ]
    },
    realWorld: {
      heading: "From Metric to Page",
      intro: "An alert travels a pipeline before it ever reaches a phone, and each stage exists to reduce noise.",
      points: [
        { label: "The alerting pipeline", body: "metrics \u2192 rule engine \u2192 alert manager (dedupe, group, silence, inhibit related alerts) \u2192 routing \u2192 a human via PagerDuty, Opsgenie, Grafana OnCall, or Prometheus Alertmanager." },
        { label: "Multi-window burn rate", body: "Instead of alerting the instant an SLO is briefly breached, alert on how fast the error budget is consumed. A multi-window approach (a short 5-min window plus a long 1-hour window at 14.4\u00d7, 6\u00d7, and 1\u00d7 thresholds) catches both fast, severe incidents and slow, creeping ones." },
        { label: "Routing by severity", body: "SEV1 goes to PagerDuty, lower severities to Slack or email or a Jira ticket. Escalation chains page the next person if the first does not acknowledge." },
        { label: "Tools", body: "PagerDuty, Opsgenie, Grafana OnCall, and Prometheus Alertmanager. Key features: deduplication, grouping, silencing, inhibition, and escalation chains." }
      ]
    },
    tradeoffs: {
      heading: "Alert Quality and Toil",
      intro: "A bad alert is worse than no alert, because it trains people to ignore the good ones.",
      points: [
        { label: "Actionable, not just anomalous", body: "\u201cCPU &gt; 50%\u201d is a bad alert: 50% is healthy and there is nothing to do. \u201cError budget burn rate &gt; 14.4\u00d7 for 1h\u201d is a good one: specific, tied to real user impact, and predictive." },
        { label: "Time windows matter", body: "An alert with no duration (\u201cdisk &gt; 80%\u201d) fires on transient spikes. Requiring a sustained window filters out the noise that erodes trust." },
        { label: "Toil budget", body: "If more than 50% of on-call time goes to repetitive manual work instead of fixing root causes, the fix belongs in the system, not the runbook." }
      ]
    },
    handsOn: {
      goal: "Define one naive threshold alert and one multi-window burn-rate alert, then drive load at the app from 13.2 to see which one cries wolf and which one stays quiet until it matters.",
      stack: "Prometheus + Alertmanager in Docker, on the metrics stack and instrumented app from 13.2. Local and free.",
      steps: [
        {
          title: "Define a bad alert and a good burn-rate alert",
          body: "Save as <code>rules.yml</code>. <code>HighTraffic</code> fires on any busy moment (not actionable). The burn-rate alert fires only when both a 5m and a 1h window agree the 99.9% SLO budget is burning too fast.",
          code: "groups:\n  - name: demo\n    rules:\n      - alert: HighTraffic\n        expr: sum(rate(http_server_duration_ms_count[1m])) > 5\n        labels: { severity: noisy }\n        annotations:\n          summary: \"Traffic over 5 rps (fires on any busy moment, not actionable)\"\n\n      - record: job:error_ratio:rate5m\n        expr: sum(rate(http_server_duration_ms_count{status=~'5..'}[5m])) / sum(rate(http_server_duration_ms_count[5m]))\n      - record: job:error_ratio:rate1h\n        expr: sum(rate(http_server_duration_ms_count{status=~'5..'}[1h])) / sum(rate(http_server_duration_ms_count[1h]))\n\n      - alert: ErrorBudgetFastBurn\n        expr: job:error_ratio:rate5m > (14.4 * 0.001) and job:error_ratio:rate1h > (14.4 * 0.001)\n        for: 2m\n        labels: { severity: page }\n        annotations:\n          runbook: \"https://runbooks.local/error-budget\"\n          summary: \"Burning the 30-day budget in ~2 days\"",
          lang: "yaml"
        },
        {
          title: "Point Prometheus at the rules and Alertmanager",
          body: "Append to your <code>prometheus.yml</code> from 13.2.",
          code: "rule_files:\n  - /etc/prometheus/rules.yml\n\nalerting:\n  alertmanagers:\n    - static_configs:\n        - targets: [\"alertmanager:9093\"]",
          lang: "yaml"
        },
        {
          title: "Add a minimal Alertmanager route",
          body: "Save as <code>alertmanager.yml</code>. Grouping by <code>alertname</code> is enough for the demo.",
          code: "route:\n  receiver: log\n  group_by: ['alertname']\nreceivers:\n  - name: log",
          lang: "yaml"
        },
        {
          title: "Start Alertmanager and reload Prometheus with the rules",
          code: "docker run -d --name alertmanager --net obs -p 9093:9093 -v \"$PWD/alertmanager.yml:/etc/alertmanager/alertmanager.yml\" prom/alertmanager\ndocker rm -f prom\ndocker run -d --name prom --net obs -p 9090:9090 -v \"$PWD/prometheus.yml:/etc/prometheus/prometheus.yml\" -v \"$PWD/rules.yml:/etc/prometheus/rules.yml\" prom/prometheus",
          lang: "bash"
        },
        {
          title: "See which alert is firing",
          body: "Drive load with <code>hey -z 60s -c 50 http://localhost:3000/</code> in another terminal, then poll the alerts.",
          code: "curl -s http://localhost:9090/api/v1/alerts | jq \".data.alerts[] | {name: .labels.alertname, state: .state}\"",
          lang: "bash"
        }
      ],
      observe: "<code>HighTraffic</code> flips to firing the moment load arrives (alert fatigue), while <code>ErrorBudgetFastBurn</code> stays quiet through brief blips and only fires once both the 5m and 1h windows confirm a sustained burn. The felt difference between a bad and a good alert.",
      stretch: "Configure Alertmanager grouping and inhibition so a downstream service\u2019s alert is automatically suppressed while its known upstream dependency is already alerting, collapsing 10 correlated pages into 1 actionable one."
    }
  },
  keyTakeaways: [
    "Only page a human when <strong>action is needed</strong>; route everything else to tickets or chat, and dedupe, group, and inhibit so one root cause is one page.",
    "<strong>Burn-rate alerting</strong> on error budget consumption (multi-window: 5 min + 1 hour at 14.4\u00d7/6\u00d7/1\u00d7) beats static thresholds, catching both fast and slow incidents without false positives.",
    "A good alert is <strong>sustained, specific, and actionable</strong> (\u201cerror rate &gt; 1% for 5 min\u201d); a bad one is noisy or non-actionable (\u201cCPU &gt; 50%\u201d) and breeds alert fatigue."
  ],
  proTip: "For any proposed alert, ask \u201cwhat would the on-call engineer actually do when this fires?\u201d If the honest answer is \u201cnothing\u201d or \u201cwait and see,\u201d it is a dashboard panel, not a page.",
  related: ["metrics", "logging", "tracing", "incident-response", "dashboards", "opentelemetry"],
  bridgeOut: "Every collector named across 13.2 to 13.4 has its own SDK. OpenTelemetry is the one vendor-neutral standard that unifies traces, metrics, and logs into a single instrumentation layer."
};
