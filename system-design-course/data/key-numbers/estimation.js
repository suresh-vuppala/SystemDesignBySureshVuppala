/* === Lesson estimation - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#estimation)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["estimation"] = {
  module: 14, num: "14.4", title: "Back-of-Envelope Estimation",
  connectsFrom: "This is the single most critical system-design-interview skill, and it is what the framework\u2019s 5-minute estimation step actually contains. Master a short chain of formulas and you can size any system before you have drawn a single box.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "formula", label: "The Formula Chain", icon: "swap" },
    { key: "reference", label: "Reference Anchors", icon: "hex" },
    { key: "examples", label: "Worked Examples", icon: "layers" },
    { key: "realWorld", label: "Reading the Answer", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Size Any System in 5 Minutes",
      intro: "Every estimate is one chain: <strong>Users \u2192 DAU \u2192 RPS \u2192 per-request cost \u2192 servers, storage, bandwidth</strong>. Round aggressively (86,400 sec/day \u2248 100K is fine) and state your assumptions out loud. Interviewers care far more about the <strong>process</strong> than exact numbers.",
      cards: [
        { icon: "C", title: "The Chain", color: "green", body: "<strong>Users \u2192 DAU \u2192 requests/day \u2192 avg RPS \u2192 peak RPS \u2192 storage, bandwidth, servers.</strong> Every estimate is this one chain, walked top to bottom." },
        { icon: "\u2248", title: "Round Hard", color: "blue", body: "<strong>86,400 sec/day \u2248 100K.</strong> State each assumption out loud. Order of magnitude beats false precision every time." },
        { icon: "%", title: "80/20", color: "orange", body: "The <strong>working set is ~20%</strong> of the data and serves ~80% of the traffic. That fifth is what you cache." }
      ],
      callouts: [
        { color: "green", label: "Interview Tip:", body: "State assumptions clearly: \u201cI\u2019ll assume 100M total users, 20% DAU, 10 actions per user per day.\u201d Interviewers care more about your <em>process</em> than exact numbers. Round aggressively: 86,400 \u2248 100K is perfectly fine." }
      ]
    },
    formula: {
      heading: "The Estimation Chain",
      intro: "One table, nine steps, worked end to end on a 100M-user system. Memorize the formulas; the worked column shows the rounding in action.",
      table: {
        headers: ["Step", "Formula", "Worked Example (100M users)"],
        rows: [
          ["<strong>DAU</strong>", "Total \u00d7 DAU% (typically 10-30%)", "100M \u00d7 20% = 20M active/day"],
          ["<strong>Requests/day</strong>", "DAU \u00d7 actions_per_user", "20M \u00d7 10 = 200M req/day"],
          ["<strong>Avg RPS</strong>", "Requests/day \u00f7 86,400 (\u2248 100K)", "200M \u00f7 100K \u2248 2,300 RPS"],
          ["<strong>Peak RPS</strong>", "Avg RPS \u00d7 peak multiplier (3-5\u00d7)", "2,300 \u00d7 5 \u2248 11,500 RPS"],
          ["<strong>Storage/day</strong>", "Requests/day \u00d7 avg_object_size", "200M \u00d7 1 KB = 200 GB/day"],
          ["<strong>Storage/year</strong>", "Storage/day \u00d7 365 (\u00d7 replication)", "200 GB \u00d7 365 \u2248 73 TB/year"],
          ["<strong>Bandwidth</strong>", "Peak RPS \u00d7 avg_response_size", "11.5K \u00d7 10 KB \u2248 115 MB/s (~1 Gbps)"],
          ["<strong>Servers</strong>", "Peak RPS \u00f7 RPS_per_server (\u00d7 1.5 headroom)", "11.5K \u00f7 1K \u2248 12, +50% \u2248 18 servers"],
          ["<strong>Cache size</strong>", "Working set (\u2248 20% of data) \u00d7 hit-rate target", "hit-rate target 95-99% for read-heavy"]
        ]
      },
      callouts: [
        { color: "blue", label: "Rule of 72 (capacity planning):", body: "Doubling time = <strong>72 \u00f7 growth%</strong>. At 10% monthly growth, data doubles in ~7 months. At 5% monthly growth, doubles in ~14 months. Plan capacity for 2\u00d7 current load minimum." }
      ]
    },
    reference: {
      heading: "Anchors to Sanity-Check Against",
      intro: "Two lookup tables to keep the magnitudes honest: byte sizes as powers of 2, and RPS scales as powers of 10. If your estimate lands far from these, recheck an assumption.",
      table: {
        headers: ["Power", "Value", "Name", "Real-World"],
        rows: [
          ["2\u00b9\u2070", "1,024", "1 KB", "A short paragraph"],
          ["2\u00b2\u2070", "~1M", "1 MB", "A book, a photo"],
          ["2\u00b3\u2070", "~1B", "1 GB", "A movie, 1K photos"],
          ["2\u2074\u2070", "~1T", "1 TB", "1M photos, 500h video"],
          ["2\u2075\u2070", "~1P", "1 PB", "Netflix library (3\u00d7)"]
        ]
      },
      tables: [
        {
          headers: ["Scale", "RPS", "Real-World Analogy"],
          rows: [
            ["10\u00b9", "10 RPS", "Personal blog"],
            ["10\u00b2", "100 RPS", "Small SaaS app"],
            ["10\u00b3", "1K RPS", "Medium startup"],
            ["10\u2074", "10K RPS", "Large app (Slack)"],
            ["10\u2075", "100K RPS", "Twitter, Netflix"],
            ["10\u2076", "1M RPS", "Google Search"]
          ]
        }
      ],
      callouts: [
        { color: "blue", label: "Powers of 10 (traffic anchors):", body: "10\u00b3 RPS = medium startup, 10\u2074 = Slack-scale, 10\u2075 = Twitter/Netflix-scale, 10\u2076 = Google Search. Compare your RPS estimate to these to sanity-check the order of magnitude." },
        { color: "yellow", label: "80/20 Rule:", body: "20% of data generates 80% of traffic. Cache the hot 20% in Redis or Memcached. For a 1 TB dataset you need ~200 GB of cache to serve 80% of reads from memory." }
      ]
    },
    examples: {
      heading: "Six Systems, Sized",
      intro: "The same chain applied to six common interview prompts. Use these as reference points, and as a check that your per-request assumptions are in the right ballpark.",
      table: {
        headers: ["System", "DAU", "Actions/User/Day", "Object Size", "Daily Storage", "Peak RPS"],
        rows: [
          ["<strong>Social Media Post</strong>", "500M", "2 posts + 50 reads", "1 KB text + 500 KB media", "~500 TB", "~300K"],
          ["<strong>Chat Message</strong>", "100M", "50 messages", "500 B", "~2.5 TB", "~250K"],
          ["<strong>Video Upload</strong>", "50M", "0.01 uploads + 5 views", "500 MB (upload)", "~250 TB", "~15K uploads"],
          ["<strong>Search Query</strong>", "1B", "5 searches", "~100 B query, 10 KB result", "~50 TB results", "~250K"],
          ["<strong>E-commerce Order</strong>", "10M", "0.1 orders + 20 browses", "5 KB order, 50 KB page", "~10 TB", "~12K orders"],
          ["<strong>Ride-sharing</strong>", "20M", "2 rides + 100 location pings", "200 B per ping", "~400 GB pings", "~50K"]
        ]
      }
    },
    realWorld: {
      heading: "Reading the Final Answer",
      intro: "A finished estimate is not just an RPS number; it is a small architecture sketch. The worked 100M-user example lands at roughly 18 app servers, 73 TB/year, and 1 Gbps peak, and each of those numbers implies a next design step.",
      points: [
        { label: "Servers imply a load balancer and headroom", body: "12 servers at peak becomes 18 with 50% headroom for failover and growth. You never run a fleet at 100% utilization." },
        { label: "Storage/year implies replication and tiering", body: "73 TB/year is the raw figure; add 3\u00d7 replication and it is ~220 TB, which is the point where tiered storage stops being optional." },
        { label: "Bandwidth implies a CDN decision", body: "~1 Gbps peak of egress is where serving static assets directly gets expensive, and a CDN starts paying for itself." },
        { label: "Add the supporting cast", body: "A real answer layers in a cache (Redis), DB read replicas, and a CDN for static assets on top of the bare server count." }
      ]
    },
    handsOn: {
      prerequisites: "None. This is a timed estimation drill.",
      setup: "Set a 5-minute timer. No tools, no lookups.",
      simulate: "Estimate full RPS and storage/year for a food-delivery app: 50M total users, 20% DAU, 3 orders per active user per day, each order ~5 KB stored. Chain the formulas exactly: Users \u2192 DAU \u2192 requests/day \u2192 avg RPS \u2192 peak RPS \u2192 storage/year. Write down every intermediate number, not just the final answer.",
      observe: "Check whether you finished the full chain inside 5 minutes without looking anything up. Compare your RPS against the \u201c10\u2074 RPS is Slack-scale\u201d anchor to confirm the number is even plausible.",
      stretch: "Redo the estimate assuming DAU triples during a viral growth event and recompute every downstream number. This is the real skill an interviewer probes with \u201cwhat if traffic 10\u00d7\u2019d overnight.\u201d"
    }
  },
  keyTakeaways: [
    "Every estimate is one chain: <strong>Users \u2192 DAU (10-30%) \u2192 requests/day \u2192 avg RPS \u2192 peak RPS (3-5\u00d7) \u2192 storage, bandwidth, servers</strong>.",
    "Two shortcuts do most of the work: <strong>86,400 sec/day \u2248 100K</strong>, and the <strong>80/20 rule</strong> (working set \u2248 20% of data, cache hit-rate target 95-99%).",
    "Sanity-check against powers-of-10 anchors: 10\u2074 RPS is Slack-scale, 10\u2075 is Twitter-scale, 10\u2076 is Google Search."
  ],
  proTip: "When asked \u201cdesign X for Y million users,\u201d immediately write four lines: (1) DAU, (2) RPS, (3) storage/year, (4) peak bandwidth. It shows structured thinking and buys you time to reason about the actual architecture.",
  related: ["latency-numbers", "throughput-numbers", "storage-numbers", "cost-numbers", "interview-reference", "sd-framework", "sla-math"],
  bridgeOut: "Sizing a system in servers and storage means nothing until you convert it into dollars. Next: cost estimation, the number that separates a senior design from a junior one."
};
