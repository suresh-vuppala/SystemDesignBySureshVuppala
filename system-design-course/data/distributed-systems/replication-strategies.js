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
      goal: "Measure the real replication-lag window between a Postgres primary and its replica, then fix the stale read with read-your-writes routing.",
      stack: "Primary and replica Postgres containers in Docker, plus a short routing snippet in Node.js. Local and free.",
      steps: [
        {
          title: "Write to the primary and poll the replica for the value",
          body: "Assumes running <code>pg-primary</code> and <code>pg-replica</code> containers. The loop spins until the write shows up on the replica and prints how long that took in milliseconds.",
          code: "docker exec -i pg-primary psql -U postgres -c \"CREATE TABLE IF NOT EXISTS kv(k text primary key, v text);\"\ndocker exec -i pg-primary psql -U postgres -c \"INSERT INTO kv VALUES('x','v1') ON CONFLICT (k) DO UPDATE SET v=excluded.v;\"\nstart=$(date +%s%3N)\nuntil docker exec -i pg-replica psql -U postgres -tAc \"SELECT v FROM kv WHERE k='x';\" | grep -q v1; do :; done\necho \"replica caught up after $(( $(date +%s%3N) - start )) ms\"",
          lang: "bash"
        },
        {
          title: "Implement read-your-writes routing",
          body: "After a user writes, pin that user's own reads to the primary for a short window so they never hit a stale replica. Save as <code>ryw.js</code>.",
          code: "// pin a user's reads to the primary briefly after they write\nconst lastWrite = new Map();\n\nfunction writeFor(userId) {\n  lastWrite.set(userId, Date.now() + 2000); // pin for 2s\n  return 'primary';\n}\nfunction readFor(userId) {\n  const pinnedUntil = lastWrite.get(userId) || 0;\n  return Date.now() < pinnedUntil ? 'primary' : 'replica';\n}\n\nconsole.log('write u1 ->', writeFor('u1'));   // primary\nconsole.log('read u1  ->', readFor('u1'));     // primary (pinned)\nconsole.log('read u2  ->', readFor('u2'));     // replica (not the writer)\nsetTimeout(() => console.log('read u1 later ->', readFor('u1')), 2500); // replica after window",
          lang: "javascript"
        },
        {
          title: "Run the routing demo",
          code: "node ryw.js",
          lang: "bash"
        }
      ],
      observe: "A real, non-zero lag window even on the same host (replication is never instant), and the read-your-writes routing sending the writer's reads to the primary during the pin window while other users still read the replica. The fix is scoped to the writer, not a blanket solution.",
      stretch: "Increase write load on the primary and re-measure the lag window: watch it widen as the replica falls further behind, which is exactly when read-after-write bugs surface in production."
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
