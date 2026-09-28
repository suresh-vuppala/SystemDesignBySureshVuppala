/* === Lesson partitioning-sharding - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#partitioning)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.11.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["partitioning-sharding"] = {
  module: 11, num: "11.11", title: "Partitioning & Sharding",
  connectsFrom: "Scalability covered the operational \u201chow\u201d of splitting data across nodes. This adds the theory on top: rebalancing math, the cost of scatter-gather queries, and how secondary indexes work once data is partitioned.",
  tabs: {
    overview: {
      heading: "Split Data to Scale Past One Machine",
      intro: "Partitioning splits data across nodes to scale beyond a single machine. The two goals in tension are <strong>even distribution</strong> (no hot partition) and <strong>efficient queries</strong> (avoid touching every partition). How you rebalance as the cluster grows is the crux.",
      cards: [
        { icon: "H", title: "Hash Partitioning", color: "blue", body: "<code>hash(key) % N</code> spreads keys evenly, but changing N rehashes almost everything, which is why naive modulo hashing hurts on scale-out." },
        { icon: "C", title: "Consistent Hashing", color: "green", body: "Hash keys and servers onto a ring. Adding or removing a node moves only <strong>~1/N of keys</strong>, not all of them. Cassandra, DynamoDB, Memcached." },
        { icon: "V", title: "Virtual Nodes", color: "purple", body: "Each physical server maps to <strong>100-256 vnodes</strong> on the ring, which smooths out distribution and makes rebalancing even." }
      ],
      table: {
        headers: ["Strategy", "How", "Pros", "Cons", "Used By"],
        rows: [
          ["<strong>Fixed Partitions</strong>", "Create many more partitions than nodes (e.g. 1000 partitions, 10 nodes), assign partitions to nodes", "Simple rebalancing (move whole partitions)", "Must choose partition count upfront: too few = large partitions, too many = overhead", "Riak, Elasticsearch, Couchbase"],
          ["<strong>Dynamic Splitting</strong>", "Start with 1 partition per node; split when too large, merge when too small", "Adapts to data size, no upfront decision", "Complex split/merge coordination", "HBase, RethinkDB, MongoDB"],
          ["<strong>Proportional to Nodes</strong>", "Fixed number of partitions per node; a new node steals random partitions from existing nodes", "Balanced as the cluster grows", "Random splits can create uneven sizes", "Cassandra (vnodes)"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Scatter-gather pattern:", body: "A query spanning multiple partitions <strong>scatters</strong> (the coordinator sends it to all relevant partitions in parallel) then <strong>gathers</strong> (collects, merges, sorts, returns). The problem is <strong>tail latency</strong>: response time equals the slowest partition. Mitigation: hedged requests (send to multiple replicas, use the first response)." },
        { color: "green", label: "Secondary indexes on partitioned data:", body: "<strong>Local index</strong> (document-partitioned): each partition indexes its own docs, so writes are fast (single partition) but reads need scatter-gather (DynamoDB). <strong>Global index</strong> (term-partitioned): the index is partitioned by term, so reads hit one partition but writes must update multiple index partitions asynchronously (Elasticsearch)." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Spreading Data Out",
      intro: "Partitioning scales writes and storage, but queries and indexes pay for it.",
      points: [
        { label: "Tail latency dominates scatter-gather", body: "A query that fans out to every shard is only as fast as the slowest shard, not the average. Adding shards beyond what the data needs adds coordination overhead and more chances for a slow participant." },
        { label: "Local vs global index is a read/write trade", body: "Local (document-partitioned) indexes make writes cheap and reads expensive (scatter-gather); global (term-partitioned) indexes flip it, cheap single-partition reads but async multi-partition writes that are eventually consistent." },
        { label: "Consistent hashing vs modulo", body: "Modulo hashing is simple until you add a node, at which point nearly all keys move. Consistent hashing plus vnodes moves only ~1/N of keys, which is why every elastic datastore uses it." }
      ]
    },
    handsOn: {
      prerequisites: "The Elasticsearch cluster from the earlier search lab (multi-node if you set that up).",
      setup: "Local and free: reuse it.",
      simulate: "Index 50,000 documents across multiple shards, then run a query that must check every shard (a broad match with no filtering) with `?search_type=query_then_fetch` and check the response\u2019s `_shards` field (`total`, `successful`) and the `took` time. Artificially slow one shard\u2019s node (throttle its container CPU with `docker update --cpus`) and rerun the same query.",
      observe: "Overall query latency rising to match the slowest shard\u2019s response time, not the average: the tail-latency claim measured by deliberately creating one slow participant in an otherwise fast scatter-gather.",
      stretch: "Compare the same query\u2019s latency at 1 shard vs 5 shards (same total document count) to see scatter-gather coordination overhead grow as shard count increases beyond what is useful for this data size."
    }
  },
  keyTakeaways: [
    "Partitioning trades single-machine limits for two new problems: keeping distribution <strong>even</strong> and keeping queries <strong>efficient</strong>.",
    "Rebalancing strategy matters: <strong>fixed partitions</strong> (simple, upfront count), <strong>dynamic splitting</strong> (adaptive, complex), <strong>proportional</strong> (vnodes, balanced growth); consistent hashing moves only <strong>~1/N of keys</strong> on membership change.",
    "Cross-partition queries pay <strong>tail latency</strong> (slowest shard wins), and secondary indexes force a choice between local (fast writes) and global (fast reads)."
  ],
  proTip: "The partition key is the whole design. A key that clumps requests onto one shard creates a hot partition that no amount of extra nodes will fix, so choose it from your access patterns, not your data model.",
  related: ["partitioning", "sharding", "consistent-hashing", "replication-strategies", "clocks", "dist-patterns", "failure-detection", "bigtable", "distributed-indexing"],
  bridgeOut: "Leader election assumed \u201cfollowers detect a missing heartbeat\u201d as a simple fact. The last lesson in this module is the honest treatment of how hard that detection actually is: failure detection."
};
