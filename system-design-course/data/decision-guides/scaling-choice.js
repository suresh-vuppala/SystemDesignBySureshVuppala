/* === Lesson scaling-choice - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#scaling-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the flowchart branches and vertical-first rule. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["scaling-choice"] = {
  module: 15, num: "15.6", title: "How to Scale?",
  connectsFrom: "Module 10 taught each scaling tool on its own. This is the decision tree for which tool addresses which bottleneck. It branches on <strong>bottleneck type</strong>: reads, writes, or both.",
  tabs: {
    overview: {
      heading: "The Scaling Decision Tree",
      intro: "The tree starts with a diagnosis, not a tool: <strong>what is the actual bottleneck?</strong> Too many reads, too many writes, or both. Each answer routes to a different set of tools, and the \u201cboth\u201d branch first asks whether a bigger machine could simply absorb the load.",
      table: {
        headers: ["If the bottleneck is\u2026", "Reach for\u2026", "Why"],
        rows: [
          ["Too many reads", "<strong>Read replicas, Cache (Redis), CDN</strong>", "Fan reads out to copies and edge, keep them off the primary"],
          ["Too many writes", "<strong>Sharding, Partitioning, Write-behind cache</strong>", "Split the write load across nodes or absorb bursts"],
          ["Both, and a bigger box would do", "<strong>Scale Up (vertical)</strong>", "Simple, no code changes, buys time"],
          ["Both, past the single-box ceiling", "<strong>Scale Out (horizontal)</strong>", "Load balancer + sharding + stateless services"]
        ]
      },
      callouts: [
        { color: "green", label: "Walk the tree in order:", body: "1) <strong>What is the bottleneck?</strong> 2) <strong>Reads</strong> \u2192 read replicas, cache, CDN. 3) <strong>Writes</strong> \u2192 sharding, partitioning, write-behind cache. 4) <strong>Both</strong> \u2192 can a bigger machine handle it? Yes \u2192 scale up, No \u2192 scale out." },
        { color: "yellow", label: "Vertical before horizontal:", body: "The rule: <strong>start vertical, go horizontal when you hit the ceiling.</strong> A bigger machine needs no code changes and often buys months of runway. Horizontal scaling adds real complexity (sharding, statelessness, coordination), so earn it before you pay for it." }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "The hardest part is not choosing the tool, it is diagnosing which resource is actually saturated. Get the diagnosis right and the tool is nearly mechanical.",
      points: [
        { label: "Diagnosis is the real skill", body: "Correctly identifying <em>which</em> resource is the bottleneck, reads, writes, CPU, memory, or I/O, is the hard part. The tool choice that follows is close to mechanical once the diagnosis is right. Measure first, then scale." },
        { label: "Read bottlenecks scale cheaply", body: "Reads fan out beautifully: add read replicas, put a cache (Redis) in front, and push static or geo-content to a CDN. These are low-risk and often the first thing to try, because most systems are read-heavy." },
        { label: "Write bottlenecks are harder", body: "Writes cannot be trivially copied. Sharding splits data across nodes by key, partitioning divides one dataset, and a write-behind cache absorbs bursts before flushing. All add complexity around routing, rebalancing, and consistency." },
        { label: "Vertical is simple but capped", body: "Scaling up (a bigger machine) needs no code changes and no distributed-systems tax, but it has a hard ceiling and a single point of failure. It is the correct first move, not the final one." },
        { label: "Horizontal is powerful but taxing", body: "Scaling out (load balancer + sharding + stateless services) has effectively no ceiling, but it forces statelessness, data partitioning, and coordination. Adopt it when the single-box ceiling is genuinely in sight, not preemptively." }
      ]
    }
  },
  keyTakeaways: [
    "Scaling starts with <strong>diagnosis</strong>: name the saturated resource (reads, writes, or both) before naming a tool.",
    "Reads scale cheaply (replicas, cache, CDN); writes scale hard (sharding, partitioning, write-behind).",
    "Rule: <strong>vertical first, horizontal when you hit the ceiling</strong>, because scaling out adds real distributed-systems complexity."
  ],
  proTip: "When someone says \u201cwe need to scale,\u201d ask \u201cscale what, exactly?\u201d and demand a metric. Nine times out of ten the fix is a cache or a read replica, not the sharding rewrite everyone reaches for first.",
  related: ["sharding", "partitioning", "replication", "caching", "cdn", "auto-scaling"],
  bridgeOut: "That closes the individual decision trees. The final lesson bundles three more standalone decisions and ties the whole course together."
};
