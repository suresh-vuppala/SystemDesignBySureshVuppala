/* === Lesson interview-reference - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#interview-reference)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["interview-reference"] = {
  module: 14, num: "14.7", title: "Interview Quick Reference",
  connectsFrom: "This is the distilled, memorizable summary of every category of number the module covered. Learn these 20 anchors and the derivation patterns that use them, and you can reconstruct everything else on the whiteboard from memory.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "numbers", label: "The 20 Anchors", icon: "hex" },
    { key: "derivations", label: "Derivation Patterns", icon: "swap" }
  ],
  tabs: {
    overview: {
      heading: "The 20 Numbers You Must Know",
      intro: "Your cheat card for system design interviews, in four categories: <strong>Latency, Throughput, Storage, Cost & SLA</strong>. Memorize the anchors (next tab) and derive the rest, because interviewers reward a number you can reason to over one you clearly guessed. Three mnemonics glue the anchors together.",
      cards: [
        { icon: "1", title: "The 100\u00d7 Rule", color: "green", body: "Each storage tier is ~100\u00d7 slower: L1 \u2192 RAM ~100\u00d7, RAM \u2192 SSD ~1000\u00d7, SSD \u2192 HDD ~100\u00d7, HDD \u2192 network ~15\u00d7." },
        { icon: "2", title: "The 1000\u00d7 Rule", color: "blue", body: "Scaling data units: 1 KB \u00d7 1M = 1 GB, 1 KB \u00d7 1B = 1 TB, 1 MB \u00d7 1M = 1 TB, 1 MB \u00d7 1B = 1 PB." },
        { icon: "3", title: "The Time Rule", color: "purple", body: "Seconds per period: 1 day \u2248 10\u2075 sec, 1 month \u2248 2.5 \u00d7 10\u2076, 1 year \u2248 3 \u00d7 10\u2077. Peak = avg \u00d7 3-5." }
      ],
      callouts: [
        { color: "blue", label: "Final Interview Tip:", body: "When asked \u201cdesign X for Y million users,\u201d immediately write down: <strong>(1)</strong> DAU estimate, <strong>(2)</strong> RPS calculation, <strong>(3)</strong> storage per year, <strong>(4)</strong> bandwidth peak. This shows structured thinking and buys time to reason about the architecture. Round aggressively." }
      ]
    },
    numbers: {
      heading: "The 20 Anchors, by Category",
      intro: "Rehearse writing these from memory until it takes under two minutes. Dumping them on the board first turns every follow-up estimate into simple arithmetic.",
      table: {
        headers: ["#", "Latency Anchor", "Value"],
        rows: [
          ["1", "RAM access", "<strong>100 ns</strong>"],
          ["2", "SSD random read", "<strong>100 \u00b5s</strong>"],
          ["3", "HDD seek", "<strong>10 ms</strong>"],
          ["4", "Same datacenter RTT", "<strong>0.5 ms</strong>"],
          ["5", "Cross-region RTT", "<strong>150 ms</strong>"]
        ]
      },
      tables: [
        {
          headers: ["#", "Throughput Anchor", "Value"],
          rows: [
            ["6", "Redis ops/sec", "<strong>100K ops/s</strong>"],
            ["7", "Kafka messages/sec", "<strong>1M msg/s</strong>"],
            ["8", "PostgreSQL reads/sec", "<strong>10K reads/s</strong>"],
            ["9", "WebSocket connections/server", "<strong>500K conn</strong>"],
            ["10", "S3 GET per prefix", "<strong>5,500/s</strong>"]
          ]
        },
        {
          headers: ["#", "Storage Anchor", "Value"],
          rows: [
            ["11", "Tweet / short msg", "<strong>~140 B</strong>"],
            ["12", "User profile", "<strong>~1 KB</strong>"],
            ["13", "Photo (JPEG)", "<strong>~200 KB - 5 MB</strong>"],
            ["14", "Video (1 min, 720p)", "<strong>~50 MB</strong>"],
            ["15", "1 day in seconds", "<strong>~100K sec</strong>"]
          ]
        },
        {
          headers: ["#", "Cost &amp; SLA Anchor", "Value"],
          rows: [
            ["16", "S3 cost per TB/mo", "<strong>$23/TB</strong>"],
            ["17", "EC2 m5.xlarge/mo", "<strong>~$140</strong>"],
            ["18", "Bandwidth egress/GB", "<strong>$0.09/GB</strong>"],
            ["19", "99.9% downtime/yr", "<strong>8.76 hours</strong>"],
            ["20", "99.99% downtime/yr", "<strong>52.6 minutes</strong>"]
          ]
        }
      ]
    },
    derivations: {
      heading: "Six Derivation Patterns",
      intro: "The anchors are only useful chained into a derivation. These six shortcuts come up in almost every interview, each starting from a memorized number.",
      points: [
        { label: "RPS calculation", body: "100M users \u00d7 20% DAU = 20M; \u00d7 10 req/day = 200M/day; \u00f7 100K sec \u2248 2,000 RPS avg; \u00d7 5 = <strong>10,000 RPS peak</strong>." },
        { label: "Storage sizing", body: "50M posts/day \u00d7 1 KB = 50 GB/day; \u00d7 365 = 18.25 TB/year; \u00d7 3 replication = 55 TB/year; a 5-year plan \u2248 <strong>275 TB</strong>." },
        { label: "Server count", body: "Peak 10,000 RPS \u00f7 ~1K RPS/server = 10 servers; with 50% headroom = <strong>15 servers</strong>." },
        { label: "Cache sizing", body: "18 TB total, hot 20% = 3.6 TB; at 64 GB/Redis node that is <strong>~57 nodes</strong>." },
        { label: "Bandwidth", body: "10K peak RPS \u00d7 50 KB avg response = 500 MB/s = ~4 Gbps peak, roughly <strong>1.3 PB/month egress</strong>." },
        { label: "Quick cost", body: "15 servers \u00d7 $140 = $2,100/mo; 55 TB S3 \u00d7 $23 = $1,265/mo; 1.3 PB egress \u00d7 $90/TB = $117K/mo, which screams <strong>CDN needed</strong> ($40K vs $117K)." }
      ],
      callouts: [
        { color: "green", label: "Sanity checks:", body: "Is RPS reasonable for the system type? (Social media 100K+, SaaS 1-10K.) Is storage growing faster than you can afford? (Over 1 PB/year needs tiered storage.) Is bandwidth cost dominant? (If yes, add a CDN.) Are you over-provisioning? (Target 60-70% utilization.)" }
      ]
    }
  },
  keyTakeaways: [
    "Twenty anchors across four categories (Latency, Throughput, Storage, Cost & SLA) are enough to derive almost any number an interview asks for.",
    "Three mnemonics glue them together: <strong>100\u00d7 Rule</strong> (tier speed), <strong>1000\u00d7 Rule</strong> (data scaling), <strong>Time Rule</strong> (1 day \u2248 10\u2075 sec, 1 year \u2248 3 \u00d7 10\u2077 sec).",
    "Always finish with sanity checks: RPS plausible for the type, storage under control, bandwidth not dominant, utilization near 60-70%."
  ],
  proTip: "Rehearse writing the 20 anchors from memory until it takes under two minutes. In the interview, dumping them on the board first turns every follow-up estimate into simple arithmetic instead of a stall.",
  related: ["latency-numbers", "throughput-numbers", "storage-numbers", "estimation", "cost-numbers", "sla-math"],
  bridgeOut: "This closes Module 14. With every concept and every number in hand, the only thing left is turning a requirement into a choice, which is what the Decision Guides do next."
};
