/* === Lesson incident-response - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#incident-response)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["incident-response"] = {
  module: 13, num: "13.7", title: "Incident Response",
  connectsFrom: "Every observability lesson before this one exists to support this exact moment: an incident, happening right now. The structured process is <strong>Detect \u2192 Triage \u2192 Mitigate \u2192 Resolve \u2192 Postmortem</strong>.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "lifecycle", label: "Lifecycle & Severity", icon: "loop" },
    { key: "learning", label: "Postmortem & Prevention", icon: "star" }
  ],
  tabs: {
    overview: {
      heading: "Detect, Triage, Mitigate, Resolve, Learn",
      intro: "Incident response is a structured process: <strong>Detect \u2192 Triage \u2192 Mitigate \u2192 Resolve \u2192 Postmortem</strong>. The priorities in order are minimize user impact first, learn second, prevent recurrence third. The four MTT* metrics grade how well you do it.",
      cards: [
        { icon: "D", title: "MTTD", color: "red", body: "<strong>Mean Time to Detect</strong>: failure start to alert firing. Target &lt; 5 min. Improve with better monitoring, anomaly detection, and synthetic probes." },
        { icon: "R", title: "MTTR", color: "orange", body: "<strong>Mean Time to Resolve</strong>: detection to service restored. Target &lt; 30 min for SEV1. Improve with runbooks, automation, rollback, and feature flags." },
        { icon: "B", title: "MTBF", color: "green", body: "<strong>Mean Time Between Failures</strong>: total uptime \u00f7 number of failures. Maximize with chaos engineering, testing, redundancy, and code quality." },
        { icon: "A", title: "MTTA", color: "blue", body: "<strong>Mean Time to Acknowledge</strong>: alert to a human acknowledging. Target &lt; 5 min. Improve with a clear escalation policy and on-call rotation." }
      ],
      callouts: [
        { color: "blue", label: "In one line:", body: "<strong>Detect fast</strong> (MTTD &lt; 5 min), <strong>mitigate first</strong> (rollback beats debug), <strong>resolve properly</strong>, then run a <strong>blameless postmortem</strong> with action items. Every SEV1 gets a postmortem within 48h." }
      ]
    },
    lifecycle: {
      heading: "The Incident Lifecycle",
      intro: "Five phases, in order. The whole point of the first three is to shrink user impact before you even understand the root cause. Severity levels calibrate how hard and how fast you push.",
      points: [
        { label: "1. Detect", body: "An alert fires, a user reports, or anomaly detection flags it. The metric here is MTTD; synthetic probes and good alerting shrink it." },
        { label: "2. Triage", body: "Assess severity, assign an <strong>incident commander</strong>, and open a war room. Severity decides who gets paged and how fast." },
        { label: "3. Mitigate", body: "Stop the bleeding before debugging: <strong>rollback</strong>, scale out, or flip a <strong>feature flag</strong> off. A fast rollback almost always beats a clever live fix." },
        { label: "4. Resolve", body: "Apply the root-cause fix, verify recovery against your dashboards and SLOs, and formally close the incident." },
        { label: "5. Postmortem", body: "Run a blameless review with concrete, assigned action items. This is where the incident turns into a permanent improvement." }
      ],
      table: {
        headers: ["Severity", "Impact", "Response Time", "Who Is Paged", "Example"],
        rows: [
          ["<strong>SEV1, Critical</strong>", "Complete outage, data loss, security breach", "&lt; 5 min", "On-call + manager + exec", "Payment system down, data breach"],
          ["<strong>SEV2, Major</strong>", "Significant degradation, partial outage", "&lt; 15 min", "On-call + team lead", "50% of requests failing, one region down"],
          ["<strong>SEV3, Minor</strong>", "Limited impact, workaround available", "&lt; 4 hours", "On-call (next business day OK)", "Non-critical feature broken, slow queries"],
          ["<strong>SEV4, Low</strong>", "Cosmetic, no user impact", "Next sprint", "Ticket only", "Typo in error message, minor UI glitch"]
        ]
      }
    },
    learning: {
      heading: "Postmortem and Prevention",
      intro: "The incident is not over when the service recovers. The learning loop, plus proactively breaking things, is what stops the next one.",
      callouts: [
        { color: "green", label: "Blameless postmortem structure:", body: "<strong>1. Summary</strong> (what happened, impact, duration, severity). <strong>2. Timeline</strong> (minute-by-minute). <strong>3. Root Cause</strong> (the \u201c5 Whys\u201d). <strong>4. Impact</strong> (users, revenue, SLO budget consumed). <strong>5. What Went Well</strong>. <strong>6. What Went Wrong</strong>. <strong>7. Action Items</strong> (specific, assigned, time-bound). <strong>8. Lessons Learned</strong>." },
        { color: "yellow", label: "Incident response tools:", body: "<strong>PagerDuty</strong> (alerting + escalation) \u00b7 <strong>Statuspage</strong> (external communication) \u00b7 <strong>Slack/Teams</strong> (war room) \u00b7 <strong>Jira/Linear</strong> (action items) \u00b7 <strong>Rootly/incident.io</strong> (incident management) \u00b7 <strong>Blameless</strong> (postmortem tracking)" },
        { color: "purple", label: "Chaos engineering:", body: "Proactively inject failures to find weaknesses <strong>before</strong> production incidents. Tools: <strong>Chaos Monkey</strong> (random instance kill), <strong>Litmus</strong> (Kubernetes chaos), <strong>Gremlin</strong> (managed platform). Run as scheduled <strong>Game Days</strong> rather than waiting for a real incident to reveal the same weakness." }
      ]
    },
    handsOn: {
      prerequisites: "Everything built across 13.1 to 13.6 (logs, metrics, traces, dashboards, alerts) pointed at the same small multi-service app.",
      setup: "Local and free: reuse your existing observability stack.",
      simulate: "Run a self-directed Game Day: inject a real fault (kill a downstream dependency container, or add artificial latency with <code>tc netem</code>) without telling yourself exactly when, then walk the full Detect \u2192 Triage \u2192 Mitigate \u2192 Resolve sequence using only your dashboards, alerts, logs, and traces. No peeking at container logs directly as a shortcut. Time how long detection takes (did an alert fire?) and how long triage takes using traces to find the failing dependency.",
      observe: "Whether your observability setup from the earlier lessons was actually sufficient to diagnose a real, injected failure without cheating. Any gap you find (a missing alert, a dashboard that lacks the right signal) is a direct, concrete lesson for what is still missing.",
      stretch: "Write a real blameless postmortem for the incident you just ran, following the Summary / Timeline / Root Cause / Impact / Action Items structure. Practice the artifact, not just the response."
    }
  },
  keyTakeaways: [
    "Incident response is <strong>Detect \u2192 Triage \u2192 Mitigate \u2192 Resolve \u2192 Postmortem</strong>, with priorities in order: minimize user impact, then learn, then prevent recurrence.",
    "Grade yourself with <strong>MTTD, MTTR, MTBF, and MTTA</strong>, and calibrate urgency with SEV1 to SEV4; mitigate first (rollback beats debugging live).",
    "Close every serious incident with a <strong>blameless postmortem</strong> (root cause, impact, action items) and use chaos engineering Game Days to find weaknesses before they find you."
  ],
  proTip: "In the moment, resist the urge to find the root cause first. Mitigate to stop user pain (rollback, feature flag, scale), then debug calmly. A fast rollback almost always beats a clever live fix.",
  related: ["monitoring", "dashboards", "metrics", "tracing", "logging"],
  bridgeOut: "This closes Module 13. You now know what every piece of the system is. The last gap is how big, how fast, and how much each piece actually costs and holds: the key numbers."
};
