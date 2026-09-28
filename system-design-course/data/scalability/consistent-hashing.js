/* === Lesson consistent-hashing - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#consistent-hashing)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["consistent-hashing"] = {
  module: 10, num: "10.5", title: "Consistent Hashing & Bounded Load",
  connectsFrom: "With plain <code>hash(key) % N</code>, adding or removing even one server remaps almost every key to a different server: a massive, unnecessary cache-cold or data-migration event triggered by a single node change.",
  tabs: {
    overview: {
      heading: "Stable Key Placement Under Change",
      intro: "Arrange servers and keys on a conceptual ring by hash value; each key belongs to the <strong>next server clockwise</strong>. When a server is added or removed, only the keys between it and its neighbor move, instead of nearly all of them.",
      cards: [
        { icon: "R", title: "The Ring", color: "blue", body: "Hash servers onto a ring (0 to 2\u00b3\u00b2), hash keys onto the same ring, and each key goes to the <strong>first server clockwise</strong>. Add or remove a node and only <strong>adjacent keys move</strong>." },
        { icon: "V", title: "Virtual Nodes", color: "green", body: "One physical server maps to <strong>many ring points</strong>, smoothing out uneven load and enabling weighted capacity (a bigger server gets more vnodes)." },
        { icon: "B", title: "Bounded Load", color: "purple", body: "Google, 2017. Even with vnodes, one hot key can overload its node. Bounded load caps any node at <code>(1+\u03b5) \u00d7 average load</code> and spills overflow to the next node on the ring." }
      ],
      table: {
        headers: ["Approach", "Keys moved when N changes", "Load balance"],
        rows: [
          ["<strong>Modulo</strong> <code>hash(key) % N</code>", "<strong>Almost all keys</strong> remap", "Even while N is fixed"],
          ["<strong>Consistent hashing</strong>", "Only keys near the changed node (~1/N)", "Uneven without virtual nodes"],
          ["<strong>+ Virtual nodes</strong>", "Only keys near the changed node", "<strong>Smooth</strong>, supports weighted capacity"]
        ]
      },
      callouts: [
        { color: "green", label: "Why virtual nodes:", body: "<strong>Virtual nodes</strong> give <strong>better balance</strong>, <strong>smoother failover</strong>, and <strong>weighted capacity</strong> (a bigger server maps to more vnodes)." },
        { color: "blue", label: "Mental model:", body: "Consistent hashing is not about hashing. <strong>It is about stable key placement under change.</strong> The ring is built as a sorted structure (array or skip list) with binary search for key lookup." }
      ]
    },
    realWorld: {
      heading: "Where the Ring Shows Up",
      points: [
        { label: "Caching and KV stores", body: "Distributed caches and key-value stores use the ring so adding a node reshuffles only a slice of keys, not the whole cache." },
        { label: "Load balancing and CDN routing", body: "Consistent hashing routes a client or object to a stable backend, so scaling the fleet does not scatter every session." },
        { label: "Rate limiting and message brokers", body: "The same ring keeps a given key\u2019s counters or partitions pinned to one node as the cluster grows or shrinks." },
        { label: "Bounded load in practice", body: "Google\u2019s 2017 bounded-load variant caps any single node, spilling overflow clockwise so one very hot key cannot melt its assigned node." }
      ]
    },
    tradeoffs: {
      heading: "What the Ring Costs",
      intro: "Consistent hashing trades a little complexity for a lot of stability.",
      points: [
        { label: "Uneven load without virtual nodes", body: "With one ring position per server, key distribution is lumpy. Virtual nodes fix this but add memory and bookkeeping for many ring points per physical server." },
        { label: "Hot keys still overload one node", body: "A single very popular key lands on one node regardless of vnodes. Bounded load addresses it, but adds spill logic and a tunable \u03b5." },
        { label: "Ring management complexity", body: "You maintain a sorted ring and do binary-search lookups, which is more machinery than a one-line modulo, justified only once node churn is real." }
      ]
    },
    handsOn: {
      prerequisites: "Python or Node.js only.",
      setup: "None: implement the ring yourself, this is the point of the lab.",
      simulate: "Implement a basic consistent-hash ring with 4 servers, 100 virtual nodes each, and 10,000 synthetic keys. Add a 5th server (with its own 100 virtual nodes) and recompute which server each key maps to.",
      observe: "This time only roughly 1/5 of keys move to the new server, versus the plain-modulo lab from 10.4 where almost everything moved. Print the exact percentage that moved and compare it directly against your 10.4 result.",
      stretch: "Remove virtual nodes (1 ring position per server instead of 100) and rerun the same add-a-server test. Measure load-distribution variance across servers with and without virtual nodes, to feel why they exist rather than just reading the claim."
    }
  },
  keyTakeaways: [
    "Consistent hashing places keys on a ring so adding or removing a node moves only <strong>~1/N of keys</strong>, not nearly all of them like plain modulo.",
    "<strong>Virtual nodes</strong> smooth out uneven load and support weighted capacity by mapping one server to many ring points.",
    "<strong>Bounded load</strong> caps any node at <code>(1+\u03b5) \u00d7 average</code> and spills overflow clockwise, protecting against a single hot key."
  ],
  proTip: "The real point is not the hash function; it is minimizing key movement when the cluster changes. Measure the percentage of keys that move on a node change: that number is why the ring exists.",
  related: ["sharding", "partitioning", "partitioning-sharding", "rate-limiting", "replication", "bloom-filters", "distributed-indexing"],
  bridgeOut: "Consistent hashing decided where a key lives. A cheaper, related question is whether that key exists at all, without paying for a full lookup. That is the Bloom filter."
};
