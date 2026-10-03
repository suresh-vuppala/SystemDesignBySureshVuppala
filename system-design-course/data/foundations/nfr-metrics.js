/* === Lesson nfr-metrics - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   One file per lesson for scalability; each file appends its slug's key
   to the shared window.COURSE_CONTENT object loaded by the pages that reference it. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["nfr-metrics"] = {
  module: 1, num: "1.3", title: "NFR Metrics & SLOs",
  connectsFrom: "You just learned to pair every FR with an NFR, but \u201cfast\u201d and \u201creliable\u201d aren\u2019t engineering requirements until they\u2019re numbers everyone agrees on. Without that, nobody can say when a regression happened or whose fault it was.",
  tabs: {
    overview: {
      heading: "How NFRs Are Measured",
      intro: "How non-functional requirements are <em>measured</em>: pick targets, then design to them. Every NFR you might name in an interview, with what it means, how it's measured, a typical target, and the levers that move it.",
      table: {
        headers: ["NFR", "What It Means", "Metric", "Typical Target", "Levers"],
        rows: [
          ["<strong>Latency</strong>", "Time per request", "<strong>p50/p95/p99/p99.9</strong> ms", "p99 &lt; 200ms (web), &lt; 50ms (internal RPC)", "Cache, CDN, async, geo-PoP, fewer hops"],
          ["<strong>Throughput</strong>", "Work served per unit time", "RPS/QPS/TPS/msgs\u00b7s\u207b\u00b9", "10K-1M RPS per service", "Horizontal scale, batching, sharding"],
          ["<strong>Availability</strong>", "% of time system is up", "\u201cNines\u201d uptime", "99.9% (8.7h/yr), 99.99% (52min), 99.999% (5min)", "Redundancy, multi-AZ/region, failover, health checks"],
          ["<strong>Durability</strong>", "% chance data survives (no loss, ever)", "Nines of durability", "<strong>11\u00d79</strong> (S3), 99.999999999%", "3\u00d7 replication, erasure coding, cross-region backup, WAL"],
          ["<strong>Reliability</strong>", "Correctness over time (MTBF/MTTR)", "Error rate, MTBF, MTTR", "Error budget &lt; 0.1%, MTTR &lt; 5min", "Retries, circuit breakers, idempotency, runbooks"],
          ["<strong>Scalability</strong>", "Grows with load (linear, ideally)", "Cost/RPS, scale factor", "Linear up to 10\u00d7-100\u00d7", "Stateless services, sharding, autoscale"],
          ["<strong>Bandwidth</strong>", "Data moved over network per second", "MB/s, Gbps ingress/egress", "Stay within VPC/CDN egress budget", "Compression, CDN, delta sync, batching"],
          ["<strong>Storage</strong>", "How much data is kept and for how long", "GB/TB/PB, retention", "Right-size; tier hot\u2192warm\u2192cold (S3 IA/Glacier)", "TTL, compression, tiering, dedup"],
          ["<strong>Consistency</strong>", "Freshness/agreement across replicas", "Strong/RYW/Eventual, replica lag", "Strong for $, eventual for likes", "Quorum (R+W&gt;N), Raft/Paxos, CRDTs"],
          ["<strong>Security / Privacy</strong>", "AuthN/AuthZ, encryption, audit", "CVE count, % encrypted, audit pass", "0 critical CVEs, TLS everywhere, PII encrypted at rest", "OAuth2, mTLS, KMS, WAF, RBAC"],
          ["<strong>Cost</strong>", "$ per request/GB/user", "$/1M req, $/GB-month", "Within unit-economics envelope", "Spot, reserved, autoscale-down, caching"]
        ]
      },
      callouts: [
        { color: "green", label: "Why percentiles, not averages, for latency:", body: "Averages hide tail pain. With a 100ms average, 5% of users can still see 2s responses. <strong>p50</strong> = median (the typical user), <strong>p95/p99</strong> = the bad days, <strong>p99.9</strong> = the angry tweets. SLOs are usually written on p99 for user-facing paths and p99.9 for infra." },
        { color: "yellow", label: "\u201cNines\u201d cheat sheet, downtime per year:", body: "<strong>99%</strong> = 3.65 days &middot; <strong>99.9%</strong> = 8.77h &middot; <strong>99.99%</strong> = 52.6min &middot; <strong>99.999%</strong> = 5.26min &middot; <strong>99.9999%</strong> = 31.5sec. Each extra 9 is roughly 10\u00d7 cost and complexity (more replicas, multi-region, chaos testing). Durability uses the same scale but for <em>data-loss probability</em>, S3 advertises <strong>11\u00d79</strong> = 1 object lost per 100 billion per year." },
        { color: "purple", label: "SLI \u00b7 SLO \u00b7 SLA:", body: "<strong>SLI</strong> = the <em>measurement</em> (\u201cp99 latency over a 5-min window\u201d). <strong>SLO</strong> = your <em>internal</em> target (\u201cp99 &lt; 200ms, 99.9% of the time\u201d). <strong>SLA</strong> = the <em>contractual</em> promise to customers (with a refund or credit if missed). Always: SLA &lt; SLO &lt; actual performance, leave headroom for the <strong>error budget</strong>." },
        { color: "blue", label: "Trade-offs (CAP/PACELC reminder):", body: "You cannot maximize every NFR at once. <strong>More 9's of availability</strong> means weaker consistency or higher cost. <strong>Lower latency</strong> means a larger cache footprint, more PoPs, or weaker durability (e.g. async fsync). State the SLO <em>numerically</em> in interviews, \u201cp99 &lt; 200ms, 99.99% availability, 11\u00d79 durability,\u201d then derive the architecture from it." }
      ]
    },
    tradeoffs: {
      heading: "You can\u2019t maximize every NFR at once",
      points: [
        { label: "Availability vs consistency", body: "More nines of <strong>availability</strong> usually means weaker consistency or higher cost. Full CAP/PACELC treatment is in Module 9, but the shape of the trade-off shows up here first." },
        { label: "Latency vs durability", body: "Lower <strong>latency</strong> usually means a larger cache footprint, more PoPs, or weaker durability (e.g. async fsync instead of sync)." },
        { label: "The interview move", body: "State the SLO numerically first, \u201c<strong>p99 &lt; 200ms, 99.99% available, 11\u00d79 durable</strong>,\u201d then derive the architecture from it. Designing first and hoping to hit a number later is backwards." }
      ]
    },
    handsOn: {
      goal: "Measure real latency on a local server and compute p50/p95/p99 by hand to see how far the tail sits from the average.",
      stack: "<code>curl</code> + Python's built-in HTTP server + standard shell tools (<code>sort</code>, <code>sed</code>, <code>awk</code>), optionally <code>hey</code>. Local and free.",
      steps: [
        {
          title: "Start any local HTTP server",
          body: "Python ships one, so there is nothing to install.",
          code: "python3 -m http.server 8000",
          lang: "bash"
        },
        {
          title: "Collect 100 sequential response timings",
          body: "In a second terminal, hit the server 100 times and append each total time (in seconds) to a file.",
          code: "rm -f timings.txt\nfor i in $(seq 1 100); do\n  curl -w \"%{time_total}\\n\" -o /dev/null -s http://localhost:8000/ >> timings.txt\ndone",
          lang: "bash"
        },
        {
          title: "Compute p50, p95, and p99 yourself",
          body: "Sort the numbers, then read off the value at the 50th, 95th, and 99th position.",
          code: "sort -n timings.txt -o timings.txt\necho \"p50 = $(sed -n '50p' timings.txt)\"\necho \"p95 = $(sed -n '95p' timings.txt)\"\necho \"p99 = $(sed -n '99p' timings.txt)\"",
          lang: "bash"
        },
        {
          title: "Compare the tail against the plain average",
          code: "awk '{ s += $1 } END { print \"avg =\", s / NR }' timings.txt",
          lang: "bash"
        },
        {
          title: "Let a load tester compute the percentiles for you",
          body: "Install <code>hey</code> and run a concurrent test, then check its latency distribution against your manual numbers.",
          code: "hey -n 1000 -c 50 http://localhost:8000/",
          lang: "bash"
        }
      ],
      observe: "How far the <strong>p99</strong> sits above the average. That gap is the \u201caverage hides tail pain\u201d claim made concrete with your own numbers instead of taking it on faith.",
      stretch: "Point the same loop at a public API you do not control and watch the tail widen: real-world latency variance is far larger than a loopback server, which is exactly why SLOs are written on p95/p99 rather than the mean."
    }
  },
  keyTakeaways: [
    "Percentiles beat averages for judging latency, see the callout above for exactly why.",
    "Each extra \u201cnine\u201d of uptime costs roughly 10\u00d7 more in replicas, multi-region setup, and chaos testing. Durability uses the same scale for data-loss probability."
  ],
  proTip: "Practice saying the SLO out loud before you design anything: name the numbers first, derive the architecture second.",
  related: ["fr-nfr", "scaling-basics", "sla-math", "metrics"],
  bridgeOut: "These numbers assume you can just add resources to hit them. 1.4 is the reality check on that assumption."
};
