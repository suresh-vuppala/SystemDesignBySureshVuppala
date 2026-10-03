/* === Lesson sharding - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#sharding)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["sharding"] = {
  module: 10, num: "10.4", title: "Sharding",
  connectsFrom: "Partitioning (10.1) explained the how abstractly. Sharding is that same idea applied at the top level: splitting an entire database across independent machines, not just splitting one table inside one engine.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "keyStrategies", label: "Shard Key & Strategies", icon: "layers" },
    { key: "queries", label: "Reads, Writes & Cross-Shard", icon: "swap" },
    { key: "scaling", label: "Rebalancing & Failures", icon: "alert" },
    { key: "realWorld", label: "Real-World & Design", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Horizontal Partitioning Across Machines",
      intro: "Sharding is <strong>horizontal partitioning across independent database instances</strong>. You reach for it when one node hits a wall: <strong>storage limits</strong>, <strong>CPU limits</strong>, <strong>read/write throughput</strong>, or a general <strong>single-node bottleneck</strong>. It buys write scalability, read scalability, and storage, and charges you in routing, rebalancing, cross-shard queries, and hotspots.",
      cards: [
        { icon: "H", title: "Hash-Based", color: "blue", body: "<code>hash(key) % N</code> gives <strong>even distribution</strong>, but resharding requires migrating data and no cheap range queries." },
        { icon: "R", title: "Range-Based", color: "orange", body: "Split by value range (age, date). <strong>Range-query friendly</strong> within a shard, but hot spots for sequential keys." },
        { icon: "D", title: "Directory-Based", color: "purple", body: "A lookup table maps key \u2192 shard. <strong>Most flexible</strong> mapping, but the directory itself becomes a dependency and a single point of failure." },
        { icon: "G", title: "Geo-Based", color: "teal", body: "Shard by user location (US \u2192 shard1, EU \u2192 shard2). Minimizes latency and fits data-residency rules, but cross-region queries are expensive." }
      ],
      callouts: [
        { color: "blue", label: "Partitioning vs sharding vs replica:", body: "<strong>Partitioning</strong> (10.1) is the general idea of splitting a table, possibly inside one engine. <strong>Sharding</strong> applies it across independent machines. A <strong>shard</strong> holds a different subset of rows (capacity); a <strong>replica</strong> holds the same rows (availability, 10.3). They are orthogonal and usually combined." },
        { color: "green", label: "Sharding architecture:", body: "The application talks to a <strong>router</strong> (client library, proxy, or coordinator) that maps a key to a shard. Each <strong>shard</strong> is an independent database, and each shard is itself <strong>replicated</strong> (a primary plus replicas) for availability." }
      ]
    },
    keyStrategies: {
      heading: "Choosing a Shard Key and a Strategy",
      intro: "The shard key is the whole design: it decides distribution and which queries stay on one shard. Pick it from four properties, then pick the strategy that maps keys to shards.",
      points: [
        { label: "Cardinality", body: "Enough distinct values to spread across many shards. A boolean or a status column cannot shard anything." },
        { label: "Distribution", body: "Values should spread evenly. A key that clumps (most rows share a value) creates a hot shard no extra nodes can fix." },
        { label: "Access pattern", body: "Most queries should filter by the shard key so they hit one shard. If they do not, you pay scatter-gather constantly." },
        { label: "Query locality", body: "Rows read together should live together. Sharding a chat by <code>conversation_id</code> keeps a conversation on one shard." }
      ],
      table: {
        headers: ["Strategy", "How", "Guarantee", "Risk"],
        rows: [
          ["<strong>Range</strong>", "Split by value range (age, date)", "Efficient range queries within shard", "<strong>Hot spots</strong> for sequential keys"],
          ["<strong>Hash</strong>", "<code>hash(key) % N</code>", "<strong>Even distribution</strong>", "Resharding requires data migration"],
          ["<strong>Directory</strong>", "Lookup table maps key \u2192 shard", "Flexible, any mapping", "Lookup table = single point of failure"],
          ["<strong>Geographic</strong>", "Region-based (US \u2192 shard1, EU \u2192 shard2)", "Data locality + compliance", "Cross-region queries expensive"],
          ["<strong>Composite</strong>", "Combine keys (region then hash)", "Locality + even spread together", "More complex key management"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Hash sharding: modulo vs consistent:", body: "<strong>Modulo hashing</strong> (<code>hash(key) % N</code>) spreads evenly but remaps almost every key when N changes, forcing a huge migration. <strong>Consistent hashing</strong> (10.5) hashes keys and nodes onto a ring so adding a node moves only ~1/N of keys. Every elastic datastore uses it." },
        { color: "blue", label: "Shard routing:", body: "<strong>Application-level</strong> (the app computes the shard, fastest, but couples app to topology), <strong>database router</strong> (a coordinator like MongoDB <code>mongos</code> routes), and <strong>proxy / middleware</strong> (Vitess VTGate in front of MySQL). Same trade-off as partition routing in 10.1." }
      ]
    },
    queries: {
      heading: "Reads, Writes, and Cross-Shard Queries",
      intro: "A query that includes the shard key is cheap; one that does not becomes a scatter-gather. Cross-shard operations are where sharding hurts most.",
      points: [
        { label: "Write flow", body: "The router hashes the shard key, sends the write to the owning shard, which persists it and replicates to that shard\u2019s replicas (10.3)." },
        { label: "Read flow, single-shard (targeted)", body: "A query filtered by the shard key routes to exactly one shard and returns fast. This is the path to design for." },
        { label: "Cross-shard query (scatter-gather)", body: "A query without the shard key fans out to every shard, and results merge at the router. Latency tracks the slowest shard." },
        { label: "Cross-shard operations", body: "<strong>Joins</strong> across shards are the classic pain, usually avoided by denormalization. <strong>Transactions</strong> across shards need 2PC or Saga (9.4). <strong>Aggregations</strong> compute partial results per shard, then combine." }
      ]
    },
    scaling: {
      heading: "Hotspots, Rebalancing, and Failures",
      intro: "Once sharded, the ongoing work is keeping shards balanced and surviving the loss of one.",
      points: [
        { label: "Hot shards and data skew", body: "A celebrity user or a sequential key concentrates load on one shard. Mitigate by salting the key, splitting the hot value, or a dedicated shard for whales." },
        { label: "Rebalancing", body: "Adding or removing shards means moving data between nodes. Modulo hashing moves almost everything; consistent hashing (10.5) moves only ~1/N." },
        { label: "Resharding", body: "Online resharding uses <strong>dual write</strong> (write both old and new layout), backfill and verify, then <strong>cutover</strong> reads to the new layout and retire the old, all with zero downtime." },
        { label: "Shard failures", body: "A down shard loses its slice of data unless replicated; a network partition can isolate a shard. Recovery promotes a replica of that shard (10.3)." }
      ],
      callouts: [
        { color: "green", label: "Sharding + replication, and going multi-region:", body: "The standard production shape is <strong>shard for capacity, replicate each shard for availability</strong>: every shard is a primary plus replicas. <strong>Global / multi-region sharding</strong> places shards near users for latency and data residency (see 5.7), at the cost of expensive cross-region queries." }
      ]
    },
    realWorld: {
      heading: "Real Systems, Ops, and Design",
      points: [
        { label: "MongoDB", body: "Range or hashed shard key, routed by <code>mongos</code>; each shard is a replica set." },
        { label: "Cassandra", body: "Consistent hashing with virtual nodes; any node coordinates, data is replicated by a tunable factor." },
        { label: "DynamoDB", body: "A managed partition (shard) key; hot partitions are the classic failure mode." },
        { label: "Elasticsearch", body: "Index split into shards, each a Lucene index; searches scatter-gather across shards (6.8)." },
        { label: "Vitess / MySQL", body: "YouTube\u2019s MySQL sharding middleware, now the reference for sharding a relational store." }
      ],
      callouts: [
        { color: "blue", label: "Operational challenges:", body: "<strong>Monitoring</strong> per-shard load to catch skew early, <strong>backup and restore</strong> coordinated across shards, <strong>schema changes</strong> applied to every shard, and <strong>capacity planning</strong> for when to add shards before a hot one tips over." },
        { color: "purple", label: "Design examples:", body: "<strong>User database</strong>: shard by <code>user_id</code> (hash). <strong>E-commerce orders</strong>: shard by <code>customer_id</code> for per-customer reads, accept scatter-gather for cross-customer analytics. <strong>Messaging</strong>: shard by <code>conversation_id</code> so a thread stays together. <strong>Social media</strong>: shard by <code>user_id</code>, and plan for the celebrity problem." }
      ]
    },
    tradeoffs: {
      heading: "The Four Trade-Off Axes",
      intro: "Sharding scales the parts you can split cleanly and punishes the queries that cross shards. Weigh it on four axes.",
      points: [
        { label: "Scalability (the win)", body: "Near-linear write and storage scaling that a single machine cannot reach: the entire reason to shard." },
        { label: "Availability", body: "More nodes means more failure surface, but replicating each shard turns a shard failure into a failover rather than an outage." },
        { label: "Complexity", body: "Routing, rebalancing, cross-shard queries, and per-shard operations are overhead a single database never had." },
        { label: "Consistency", body: "Cross-shard transactions are hard, so you often drop to eventual consistency or app-level coordination (9.4). And plain <code>hash(key) % N</code> breaks the moment N changes, which is exactly what consistent hashing (10.5) fixes." }
      ]
    },
    handsOn: {
      goal: "Prove on your own data that <code>hash(user_id) % N</code> spreads evenly but remaps almost every key the moment N changes, the exact pain consistent hashing (10.5) fixes.",
      stack: "Python 3 only (standard library), a pure algorithm exercise. Local and free.",
      steps: [
        {
          title: "Write the modulo-sharding script",
          body: "Hash 10,000 user IDs across 4 shards, then recompute for 5 shards and count how many move. Save as <code>shard.py</code>.",
          code: "import hashlib\n\ndef shard(user_id, n):\n    h = int(hashlib.md5(str(user_id).encode()).hexdigest(), 16)\n    return h % n\n\nusers = list(range(10000))\n\n# distribution across 4 shards\ncounts = {}\nfor u in users:\n    s = shard(u, 4)\n    counts[s] = counts.get(s, 0) + 1\nprint(\"distribution across 4 shards:\", dict(sorted(counts.items())))\n\n# how many keys move when we go from 4 to 5 shards\nmoved = sum(1 for u in users if shard(u, 4) != shard(u, 5))\nprint(\"moved when 4 -> 5:\", moved, \"of\", len(users),\n      \"(\", round(100 * moved / len(users), 1), \"%)\")",
          lang: "python"
        },
        {
          title: "Run it",
          code: "python3 shard.py",
          lang: "bash"
        }
      ],
      observe: "The 4-shard counts sit near 2,500 each (an even spread), but going from 4 to 5 shards remaps the overwhelming majority of users (roughly 80%). That massive forced migration from a single node change is exactly the problem 10.5 exists to solve, felt as a real percentage before you ever see the fix.",
      stretch: "Replace modulo with a directory table (a plain <code>{user_id: shard_id}</code> dict), then add a fifth shard by reassigning only a handful of users you choose. Count the forced remaps: zero, versus the ~80% modulo just charged you."
    }
  },
  keyTakeaways: [
    "Sharding is horizontal partitioning across <strong>independent database instances</strong>: it adds write capacity and storage that a single machine cannot provide.",
    "The <strong>shard key</strong> is the whole design: choose it for cardinality, even distribution, access pattern, and query locality, then map it with hash, range, directory, geo, or composite.",
    "Cross-shard queries and rebalancing are the recurring costs, plain <code>hash(key) % N</code> breaks when N changes, and the production shape is shard-for-capacity plus replicate-each-shard-for-availability."
  ],
  proTip: "Choose the shard key by the access pattern you run most, and check for a celebrity key before you ship. A single hot user or tenant can overwhelm one shard no matter how even the hash looks on paper.",
  related: ["partitioning", "consistent-hashing", "replication", "distributed-indexing", "partitioning-sharding", "redis-cluster", "scaling-choice", "bloom-filters", "db-indexing", "nosql", "multi-region", "transactions"],
  bridgeOut: "With hash-based sharding using <code>hash(key) % N</code>, the next lesson is exactly why that formula breaks the moment N changes, and how to fix it."
};
