/* === Lesson sla-math - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#sla-math)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["sla-math"] = {
  module: 14, num: "14.6", title: "SLA Math & Availability",
  connectsFrom: "\u201cNines\u201d were introduced earlier as a concept. This is the full arithmetic behind combining them across a real multi-component architecture. Each additional nine is 10\u00d7 harder to achieve and 10\u00d7 more expensive, so knowing how to compute a composite SLA is a budget skill, not just a math one.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "nines", label: "The Nines", icon: "hex" },
    { key: "composite", label: "Combining Availability", icon: "swap" },
    { key: "tradeoffs", label: "Cost of Every Nine", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "SLA Math and Availability",
      intro: "Availability is measured in nines, and the downtime each one allows shrinks fast. The two formulas that matter: <strong>serial components multiply</strong> (A_total = A1 \u00d7 A2), and <strong>parallel/redundant components combine as 1 - (1-A1)(1-A2)</strong>. Serial always makes things worse; redundancy actively improves availability.",
      cards: [
        { icon: "S", title: "Serial (all must work)", color: "orange", body: "A_total = A1 \u00d7 A2 \u00d7 A3. Three components at 99.9% give <strong>0.999\u00b3 = 99.7%</strong> (~26 hrs/yr). A chain is only as strong as its weakest link." },
        { icon: "P", title: "Parallel (any one works)", color: "green", body: "A_total = 1 - (1-A1)(1-A2). Two components at 99.9% give <strong>1-(0.001)\u00b2 = 99.9999%</strong> (~31.5 sec/yr). Redundancy multiplies reliability." },
        { icon: "B", title: "Error Budget", color: "blue", body: "Error budget = <strong>1 - SLO</strong>. At 99.9% SLO you get 43.8 min/month to spend on deploys and incidents; at 99.99% only 4.38 min, almost zero tolerance." }
      ],
      callouts: [
        { color: "green", label: "SLI vs SLO vs SLA:", body: "<strong>SLI</strong> is the metric you measure (p99 latency &lt; 200ms). <strong>SLO</strong> is your internal target (99.95% of requests). <strong>SLA</strong> is the external contract with penalties (99.9% or credits)." }
      ]
    },
    nines: {
      heading: "The Nines and the Error Budget",
      intro: "Each additional nine cuts allowed downtime by 10\u00d7. The second table converts an SLO into a monthly error budget, the time you can actually spend on deploys and incidents.",
      table: {
        headers: ["SLA Level", "Uptime %", "Downtime/Year", "Downtime/Month", "Downtime/Week", "Typical Systems"],
        rows: [
          ["<strong>One Nine</strong>", "90%", "36.5 days", "72 hours", "16.8 hours", "Batch jobs, internal tools"],
          ["<strong>Two Nines</strong>", "99%", "3.65 days", "7.2 hours", "1.68 hours", "Personal projects"],
          ["<strong>Three Nines</strong>", "99.9%", "8.76 hours", "43.8 min", "10.1 min", "Business SaaS apps"],
          ["<strong>Four Nines</strong>", "99.99%", "52.6 min", "4.38 min", "1.01 min", "E-commerce, fintech"],
          ["<strong>Five Nines</strong>", "99.999%", "5.26 min", "26.3 sec", "6.05 sec", "Payment systems, DNS"],
          ["<strong>Six Nines</strong>", "99.9999%", "31.5 sec", "2.63 sec", "0.6 sec", "Pacemakers, aviation"]
        ]
      },
      tables: [
        {
          headers: ["SLO", "Error Budget/Month", "Meaning"],
          rows: [
            ["99.9%", "43.8 minutes", "~1 incident allowed"],
            ["99.95%", "21.9 minutes", "Very tight"],
            ["99.99%", "4.38 minutes", "Almost zero tolerance"]
          ]
        }
      ],
      callouts: [
        { color: "blue", label: "Rule: SLO stricter than SLA:", body: "SLO should be <strong>stricter than SLA</strong>. If SLA = 99.9%, set SLO = 99.95%. The gap is your safety buffer before you breach the contract and owe credits." }
      ]
    },
    composite: {
      heading: "Computing a Composite SLA",
      intro: "Real systems are graphs of components. To find the whole-system availability, <strong>collapse each parallel/redundant group first</strong> with the parallel formula, then <strong>multiply the groups in series</strong> along the dependency path.",
      callouts: [
        { color: "purple", label: "Worked composite (3-tier):", body: "Load Balancer 99.99% \u00d7 App Servers \u00d73 in parallel (99.9999%) \u00d7 DB Primary+Replica in parallel (99.9999%) \u00d7 Redis HA 99.99% \u2248 <strong>99.98%</strong> (~1.75 hrs/yr). Collapse parallel groups first, then multiply in series." },
        { color: "blue", label: "Why the composite is always lower:", body: "Every serial hop can only multiply availability <em>down</em>. The system SLA is therefore always below the best component, and often below the worst, which is why a single non-redundant tier silently caps the whole design." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Every Nine",
      intro: "Availability arithmetic makes two uncomfortable truths concrete, and both drive real architecture and budget decisions.",
      points: [
        { label: "Every serial component makes it worse", body: "Adding serial dependencies <em>always</em> reduces availability. Five serial components at 99.9% each land at 99.5% overall, roughly 43.8 hrs/yr of downtime. The fix is redundancy (parallel) at each layer, especially the weakest link." },
        { label: "Each nine costs 10\u00d7 more", body: "Going from 99.9% to 99.99% is not a small tuning task; it is 10\u00d7 harder and 10\u00d7 more expensive, demanding redundancy, faster failover, and tighter operations. Match the target to the business need, do not chase nines for their own sake." },
        { label: "Redundancy is the lever, and it is not free", body: "Parallel paths turn 99.9% into six-nines on paper, but each replica adds cost, and the single-point-of-failure component (a lone app tier, a solo primary) silently caps the whole system." }
      ]
    },
    handsOn: {
      prerequisites: "None. A pure arithmetic exercise, ideally checked with a short script.",
      setup: "No setup, just a calculator or a few lines of code.",
      simulate: "Compute the exact composite availability for a 5-component chain: Load Balancer 99.99%, App Servers \u00d73 in parallel (each 99.9%), DB Primary+Replica in parallel (each 99.95%), Redis HA 99.99%. Apply the parallel formula first to collapse each redundant group into one effective number, then multiply the results in series.",
      observe: "Your composite should land close to the ~99.98% figure. If it does not, you likely applied a formula in the wrong order: parallel groups must collapse <em>before</em> the serial multiplication, not after.",
      stretch: "Recompute assuming the App Server tier has only 1 instance instead of 3 in parallel, and quantify exactly how much composite availability that single point of failure costs. That is a numeric answer to \u201chow much does redundancy actually buy you.\u201d"
    }
  },
  keyTakeaways: [
    "Two formulas do all the work: <strong>serial multiplies</strong> (A1 \u00d7 A2, always worse) and <strong>parallel combines as 1 - (1-A1)(1-A2)</strong> (redundancy improves it).",
    "To compute a composite SLA, collapse parallel/redundant groups first, then multiply the groups in series across the dependency graph.",
    "Error budget = <strong>1 - SLO</strong>, and each extra nine is ~10\u00d7 harder and more expensive, so match the target to the business need."
  ],
  proTip: "In an interview, never quote a single component\u2019s SLA as the system\u2019s SLA. Walk the dependency graph: collapse each redundant tier with the parallel formula, then multiply. The composite is always lower than the best component and often lower than the worst.",
  related: ["cost-numbers", "estimation", "latency-numbers", "interview-reference", "nfr-metrics"],
  bridgeOut: "You now have every category of number this module covers. The last step is compressing them into a memorizable cheat card you can recall under interview pressure."
};
