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
      prerequisites: "The Prometheus + Grafana setup from 13.2; Prometheus Alertmanager (free, ships alongside Prometheus).",
      setup: "Local and free: add Alertmanager to your existing Compose stack.",
      simulate: "Define 2 alert rules: a bad one (<code>cpu_usage &gt; 50</code>, fires on any busy moment) and a good burn-rate one (error budget consumption over both a 5-min and 1-hour window at a 14.4\u00d7 threshold). Generate a brief error spike and a longer, low-grade one, and watch which alert fires for which scenario.",
      observe: "The naive CPU alert fires constantly during normal load spikes (alert fatigue), while the burn-rate alert stays quiet during brief blips but fires clearly once a sustained error rate would actually exhaust the SLO budget. A felt difference between a bad and good alert.",
      stretch: "Configure Alertmanager grouping and inhibition so a downstream service\u2019s alert is automatically suppressed while its known upstream dependency is already alerting, reducing 10 correlated pages down to 1 actionable one."
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
