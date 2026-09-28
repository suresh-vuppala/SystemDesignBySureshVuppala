/* === Lesson clocks - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#clocks)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["clocks"] = {
  module: 11, num: "11.9", title: "Clocks & Time",
  connectsFrom: "There is no global clock. Two events on different machines cannot be reliably ordered by wall-clock timestamp alone, because those clocks drift, skew, and occasionally jump backward. Ordering events is a fundamental distributed-systems problem, and there are three families of answers.",
  tabs: {
    overview: {
      heading: "Ordering Events With No Global Clock",
      intro: "Three approaches order events across machines: <strong>physical</strong> clocks (sync the wall clock), <strong>logical</strong> clocks (count causality, ignore wall time), and <strong>hybrid</strong> clocks (combine both). Each answers a different question about what \u201cbefore\u201d even means.",
      cards: [
        { icon: "L", title: "Lamport Timestamp", color: "orange", body: "A single counter: increment on a local event, and on receive set <code>C = max(local, received) + 1</code>. Gives a <strong>total order</strong>, but cannot prove causality." },
        { icon: "V", title: "Vector Clock", color: "green", body: "One counter <strong>per node</strong>. Comparing vectors detects genuine <strong>concurrency</strong>: if neither vector dominates, the events are concurrent." },
        { icon: "H", title: "Hybrid Logical Clock", color: "purple", body: "Physical time plus a logical tie-breaker. Stays close to wall-clock while still ordering rapid-fire events correctly. Powers CockroachDB\u2019s MVCC timestamps." }
      ],
      table: {
        headers: ["Approach", "Mechanism", "What It Gives", "Used By"],
        rows: [
          ["<strong>NTP</strong> (physical)", "Sync wall clocks over the network", "~1-10ms on LAN, worse on WAN; can jump backward", "General-purpose systems"],
          ["<strong>TrueTime</strong> (physical)", "GPS + atomic clocks, returns an uncertainty interval", "Bounded uncertainty under 7ms; Spanner waits it out for external consistency", "Google Spanner"],
          ["<strong>Lamport</strong> (logical)", "<code>C = max(local, received) + 1</code>", "Total order only; <code>L(a) &lt; L(b)</code> does not imply a happened-before b", "Kafka offsets"],
          ["<strong>Vector Clock</strong> (logical)", "One counter per node", "Detects causality and true concurrency", "DynamoDB, Riak"],
          ["<strong>HLC</strong> (hybrid)", "Physical time + logical counter", "Causal correctness + wall-clock proximity", "CockroachDB MVCC"]
        ]
      },
      callouts: [
        { color: "green", label: "NTP limitations:", body: "NTP syncs clocks to ~1-10ms on LAN, ~100ms on WAN. Problems: <strong>clock skew</strong> (machines drift at different rates), <strong>clock jumps</strong> (NTP can step the clock backward), <strong>monotonic vs wall-clock</strong> (use monotonic for durations, wall-clock only for display), and <strong>leap seconds</strong> (a 1s jump). Fix: leap smear (Google spreads it over 24h)." },
        { color: "yellow", label: "Practical guidance:", body: "Use <strong>Lamport timestamps</strong> when you only need a total order (Kafka offsets). Use <strong>vector clocks</strong> when you must detect conflicts (DynamoDB, Riak). Use <strong>HLC</strong> when you need causality plus wall-clock proximity (CockroachDB MVCC). Use <strong>TrueTime</strong> if you have GPS/atomic clocks (Spanner)." }
      ]
    },
    tradeoffs: {
      heading: "Which Clock Answers Which Question",
      intro: "The clocks are not ranked; they answer different questions and trade different costs.",
      points: [
        { label: "Lamport is cheap but blind to concurrency", body: "One integer, total order, tiny overhead. But <code>L(a) &lt; L(b)</code> can hold for two genuinely concurrent events, so a smaller number does not mean \u201chappened before.\u201d" },
        { label: "Vector clocks are honest but grow with the cluster", body: "They correctly report concurrency (neither vector dominates), which is what conflict detection needs, but each timestamp carries one entry per node, so they grow with membership." },
        { label: "TrueTime buys certainty with hardware", body: "By returning an uncertainty interval and having Spanner wait it out, TrueTime gives external consistency, but it requires GPS and atomic clocks in every datacenter, which almost no one else has." }
      ]
    },
    handsOn: {
      prerequisites: "Python or Node.js only.",
      setup: "None, a pure algorithm lab.",
      simulate: "Implement Lamport timestamps for 3 simulated nodes exchanging messages (local events increment a counter; on receive set <code>counter = max(local, received) + 1</code>). Then implement vector clocks for the same 3 nodes (each tracks a 3-element vector). Construct a scenario with 2 genuinely concurrent events and check what each clock type reports.",
      observe: "Lamport timestamps still assigning a total order to the 2 concurrent events (one number is just bigger), falsely implying one happened first, while vector clocks correctly report them as concurrent (neither vector dominates): the exact limitation caught by your own test case instead of trusted as a claim.",
      stretch: "Implement a basic Hybrid Logical Clock (physical time + a logical tie-breaker) and confirm it stays close to wall-clock time for widely separated events while still correctly ordering rapid-fire events that land in the same physical millisecond."
    }
  },
  keyTakeaways: [
    "There is <strong>no global clock</strong>; wall-clock timestamps drift, skew, and can jump backward, so they cannot reliably order events across machines.",
    "<strong>Lamport</strong> gives a cheap total order but not causality; <strong>vector clocks</strong> detect true concurrency; <strong>HLC</strong> combines physical time with a logical counter.",
    "<strong>TrueTime</strong> (GPS + atomic clocks, an uncertainty interval Spanner waits out) is how Google gets external consistency, at a hardware cost few can match."
  ],
  proTip: "Never order distributed events by comparing wall-clock timestamps from different machines. If you need causality, reach for logical or vector clocks; wall-clock time is for humans to read, not for correctness.",
  related: ["consensus-protocols", "replication-strategies", "ordering", "cap", "dist-patterns", "partitioning-sharding"],
  bridgeOut: "The replication lesson covered the three topologies operationally. Now, with clocks and consensus in hand, replication strategies get their theory layer."
};
