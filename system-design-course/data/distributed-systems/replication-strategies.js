/* === Lesson replication-strategies - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#replication)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["replication-strategies"] = {
  module: 11, num: "11.10", title: "Replication Strategies",
  connectsFrom: "Scalability covered the three replication topologies operationally. This revisits the same three with the theory just built up: the sync/async/semi-sync trade-off and the conflict math spelled out per topology.",
  tabs: {
    overview: {
      heading: "Copying Data Across Nodes",
      intro: "Replication copies data across nodes for <strong>fault tolerance</strong> and <strong>read scalability</strong>. The fundamental tension is <strong>consistency vs availability vs latency</strong>, and where you land is set first by the topology and then by how synchronously you replicate.",
      cards: [
        { icon: "S", title: "Single-Leader", color: "blue", body: "One leader takes all writes; followers replicate. Simple, no write conflicts, but the leader is a write bottleneck and a failure point." },
        { icon: "M", title: "Multi-Leader", color: "orange", body: "Every region has a leader: <strong>low-latency local writes</strong> and write availability, at the cost of <strong>conflict resolution</strong> when two leaders diverge." },
        { icon: "L", title: "Leaderless", color: "purple", body: "Any replica accepts writes; a <strong>quorum</strong> (W/R/N) tunes consistency. No single point of failure, but you manage conflicts yourself." }
      ],
      table: {
        headers: ["Aspect", "Synchronous", "Asynchronous", "Semi-Synchronous"],
        rows: [
          ["<strong>Write Latency</strong>", "High (wait for all/majority replicas)", "<strong>Low</strong> (return after local write)", "Medium (wait for 1 replica)"],
          ["<strong>Durability</strong>", "<strong>Strong</strong> (data on multiple nodes)", "Weak (data loss on leader crash)", "Good (1 replica guaranteed)"],
          ["<strong>Availability</strong>", "Lower (blocked if a replica is down)", "<strong>Higher</strong> (leader independent)", "Balanced"],
          ["<strong>Consistency</strong>", "<strong>Strong</strong> (all replicas up-to-date)", "Eventual (replication lag)", "Bounded staleness"],
          ["<strong>Used By</strong>", "Raft commit, Spanner", "Postgres streaming, MySQL", "MySQL semi-sync, Kafka (acks=1)"]
        ]
      },
      callouts: [
        { color: "green", label: "Replication lag:", body: "In async replication, followers can be seconds behind the leader, causing <strong>read-after-write inconsistency</strong> (a user reads a stale follower and misses their own write), <strong>monotonic read violations</strong> (time appears to go backward), and <strong>causality violations</strong> (a reply visible before the original message). Fixes: read-your-writes (route the user\u2019s own reads to the leader after a write) and causal consistency (track dependencies)." }
      ]
    },
    realWorld: {
      heading: "Pick a Strategy by Scenario",
      points: [
        { label: "Single-region, strong consistency", body: "Single-leader, synchronous. Simplest model, no conflicts, Raft/Paxos for high availability." },
        { label: "Multi-region, low-latency writes", body: "Multi-leader. Write to the local datacenter and async-replicate, accepting the conflict-resolution cost." },
        { label: "High availability, tunable consistency", body: "Leaderless (quorum). No single point of failure; tune W/R/N per use case." },
        { label: "Read-heavy, eventual consistency OK", body: "Single-leader with async read replicas. Scale reads with followers, accept replication lag." },
        { label: "Collaborative editing", body: "CRDTs or Operational Transform for automatic conflict-free merging of concurrent edits (Figma, Google Docs)." }
      ]
    },
    tradeoffs: {
      heading: "Resolving Conflicts",
      intro: "Once more than one node can accept a write, conflicting writes are inevitable and must be resolved.",
      points: [
        { label: "Last-Writer-Wins (LWW)", body: "Highest timestamp wins, the rest are discarded. Simple and deterministic, but concurrent writes are silently dropped, i.e. data loss. Used by Cassandra and DynamoDB." },
        { label: "Vector clocks + siblings", body: "Detect the conflict and return all versions to the client to resolve. No data loss, but the client must merge and the model is more complex. Used by Riak and optionally DynamoDB." },
        { label: "CRDTs", body: "Data structures (counters, sets, registers) that merge automatically with no coordination. Great when your data fits the available types; limited otherwise, with some space overhead. Used by Redis CRDT, Riak, Figma." },
        { label: "Operational Transform and app-level merge", body: "OT transforms concurrent ops to preserve intent (Google Docs, usually with a central server); application-level merge encodes domain rules (Amazon\u2019s shopping-cart union). Both put correctness on the developer." }
      ]
    },
    handsOn: {
      prerequisites: "The primary+replica Postgres setup from the earlier scalability lab.",
      setup: "Local and free: reuse it.",
      simulate: "Write a value on the primary, then immediately read it from the replica in a loop, logging each read\u2019s value and a timestamp, until it matches. Record the actual replication-lag window in milliseconds. Then implement the read-your-writes fix: route reads for the same user who just wrote to the primary for a short window (e.g. 2 seconds) instead of the replica.",
      observe: "A real, non-zero lag window on your own machine (even local, same-host replication has some lag), and the read-your-writes routing eliminating the stale read specifically for the writer, while other users reading the replica during that same window may still see the old value: the fix is scoped, not a blanket solution.",
      stretch: "None. This reuses the earlier infrastructure to make the failure mode and its fix concrete rather than requiring new setup."
    }
  },
  keyTakeaways: [
    "Replication topology sets the ceiling: <strong>single-leader</strong> (simple, no conflicts, bottlenecked), <strong>multi-leader</strong> (low-latency multi-region, conflict-prone), <strong>leaderless</strong> (HA, tunable quorum).",
    "The sync knob is the fine tuning: <strong>synchronous</strong> buys durability and consistency at latency cost, <strong>asynchronous</strong> is fast but risks loss and lag, <strong>semi-sync</strong> splits the difference.",
    "Any multi-writer setup must resolve conflicts: <strong>LWW</strong> (simple, lossy), <strong>vector clocks + siblings</strong> (lossless, complex), or <strong>CRDTs</strong> (auto-merge, limited types)."
  ],
  proTip: "Async replication\u2019s lag is invisible until a user reads their own write and it\u2019s missing. Add read-your-writes routing before that bug reaches production, not after.",
  related: ["data-redundancy", "clocks", "partitioning-sharding", "consensus-protocols", "cap", "bigtable", "dist-patterns", "gfs-hdfs", "leader-election", "replication"],
  bridgeOut: "The same partitioning and sharding choices from Scalability get their theory-layer treatment next: rebalancing math, scatter-gather cost, and secondary indexing."
};
