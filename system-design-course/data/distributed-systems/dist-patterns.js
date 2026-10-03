/* === Lesson dist-patterns - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#dist-patterns)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["dist-patterns"] = {
  module: 11, num: "11.1", title: "Distributed System Patterns",
  connectsFrom: "Scalability used pieces of this vocabulary, quorum inside a rate limiter, leader-follower inside replication, without ever naming the whole catalog. This lesson is that catalog: the 14 recurring building blocks every distributed system is assembled from.",
  tabs: {
    overview: {
      heading: "The 14 Building Blocks",
      intro: "Almost every distributed system is built from the same small set of <strong>recurring patterns</strong>. Learn these cold and most \u201cnew\u201d systems become recombinations of blocks you already know. This is the index; each block gets its own deeper lesson later in the module.",
      cards: [
        { icon: "W", title: "WAL", color: "blue", body: "<strong>Write-ahead log</strong>: record the change before applying it, so a crash can be replayed forward. Postgres, Kafka, etcd." },
        { icon: "Q", title: "Quorum", color: "purple", body: "<strong>Majority agreement</strong> (N/2+1). When <code>W+R&gt;N</code>, a read and a write must overlap on at least one node, which guarantees consistency." },
        { icon: "G", title: "Gossip", color: "green", body: "Nodes <strong>randomly exchange state</strong> until every node converges. Cassandra, Consul, Redis Cluster use it for membership and metadata." }
      ],
      table: {
        headers: ["Pattern", "What", "Guarantee", "Used By"],
        rows: [
          ["<strong>WAL</strong>", "Log changes before applying", "<strong>Crash recovery</strong>", "Postgres, Kafka, etcd"],
          ["<strong>Segmented Log</strong>", "Split log into fixed-size segments", "Prevents unbounded growth", "Kafka log segments"],
          ["<strong>High-Water Mark</strong>", "Highest committed offset all replicas have", "Consumers can\u2019t read uncommitted data", "Kafka, Raft"],
          ["<strong>Quorum</strong>", "Majority (N/2+1) agreement", "<code>W+R&gt;N</code> guarantees consistency", "Cassandra, Raft, Paxos"],
          ["<strong>Leader-Follower</strong>", "1 leader writes, followers replicate", "Single source of truth for writes", "Postgres, Kafka, Raft"],
          ["<strong>Heartbeat</strong>", "Periodic \u201cI\u2019m alive\u201d messages", "Missing heartbeats trigger failure detection", "ZooKeeper, K8s probes"],
          ["<strong>Lease</strong>", "Time-bounded lock/permission", "Auto-expires \u2192 no stale locks", "Chubby, ZooKeeper, DynamoDB"],
          ["<strong>Gossip Protocol</strong>", "Nodes randomly exchange state", "Eventually all nodes converge", "Cassandra, Consul, Redis Cluster"],
          ["<strong>Phi Accrual</strong>", "Adaptive failure detection", "Better than fixed timeouts", "Cassandra, Akka"],
          ["<strong>Split Brain</strong>", "Partition causes two leaders", "Prevented by quorum", "ZooKeeper, etcd"],
          ["<strong>Fencing Tokens</strong>", "Monotonic tokens for stale leader prevention", "Old leader\u2019s writes rejected", "ZooKeeper, Redlock"],
          ["<strong>Merkle Trees</strong>", "Hash tree for efficient data comparison", "O(log N) sync", "Cassandra, Git, blockchain"],
          ["<strong>Hinted Handoff</strong>", "Neighbor stores write when target is down", "Delivers when target recovers", "Cassandra, DynamoDB"],
          ["<strong>Read Repair</strong>", "On read, fix stale replicas", "Lazy consistency fix", "Cassandra, DynamoDB"],
          ["<strong>Checksum</strong>", "Hash of data to detect corruption", "Verified on read", "HDFS, S3, Kafka, TCP"]
        ]
      },
      callouts: [
        { color: "blue", label: "Most of these get their own lesson:", body: "Phi Accrual is unpacked in <strong>Failure Detection</strong> (11.12), Merkle Trees in anti-entropy sync (9.2), and Fencing Tokens in the Redlock context (7.10). This lesson is the map, not the destination." },
        { color: "green", label: "You have already touched these:", body: "Quorum showed up in the Cassandra labs, Heartbeat and Lease in the etcd lab, Fencing Tokens in the Redlock lab, and Checksum in every TCP capture. The vocabulary was earned earlier; here it finally gets its formal name." }
      ]
    }
  },
  keyTakeaways: [
    "Distributed systems are assembled from a small set of <strong>recurring patterns</strong>: logging (WAL, segmented log), coordination (quorum, leader-follower, lease), anti-entropy (gossip, Merkle trees, read repair, hinted handoff), and integrity (checksum, fencing tokens).",
    "<strong>Quorum</strong> is the workhorse: majority agreement with <code>W+R&gt;N</code> is what prevents split brain and gives tunable consistency.",
    "This module is a guided tour of these blocks; recognizing them by name is what turns a \u201cnew\u201d system into a familiar recombination."
  ],
  proTip: "When you meet an unfamiliar distributed system, don\u2019t memorize it, decompose it. Ask which of these 14 blocks it uses for durability, coordination, and repair, and the design falls out fast.",
  related: ["zookeeper", "leader-election", "consensus-protocols", "failure-detection", "replication-strategies", "quorum-consensus", "clocks", "partitioning-sharding"],
  bridgeOut: "Every pattern here gets a deeper lesson later in this module. First, a concrete system built almost entirely from quorum and lease: ZooKeeper."
};
