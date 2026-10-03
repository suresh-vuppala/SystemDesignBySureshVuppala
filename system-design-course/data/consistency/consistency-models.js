/* === Lesson consistency-models - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#consistency-models)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["consistency-models"] = {
  module: 9, num: "9.2", title: "Consistency Models",
  connectsFrom: "CAP said pick C or A during a partition, but that is a binary. Most real systems live somewhere in the middle of \u201cstrong\u201d and \u201ceventual,\u201d not at either extreme, and this lesson names the whole spectrum in between.",
  tabs: {
    overview: {
      heading: "A Spectrum From Strongest to Weakest",
      intro: "Each consistency level trades <strong>latency</strong> for <strong>correctness</strong>. The strongest levels make many machines behave like one copy at the cost of waiting for a quorum; the weakest converge eventually and answer instantly. Choose based on what happens if a user reads stale data.",
      cards: [
        { icon: "L", title: "Linearizable", color: "blue", body: "Appears as a single copy with real-time ordering: a read always returns the latest write. Highest latency (quorum write plus read). <strong>etcd, ZooKeeper, Spanner</strong>." },
        { icon: "C", title: "Causal", color: "purple", body: "Causally related writes stay ordered (a reply after its comment); concurrent, unrelated writes need no order. <strong>MongoDB causal sessions</strong>." },
        { icon: "E", title: "Eventual", color: "green", body: "Replicas converge given no new writes. Lowest latency, most available, stale reads possible. <strong>Cassandra, DNS, S3</strong>." }
      ],
      table: {
        headers: ["Model", "Guarantee", "Latency", "Use Case", "Systems"],
        rows: [
          ["<strong>Linearizable</strong>", "Appears as single copy, real-time ordering", "Highest (quorum write + read)", "Distributed locks, leader election, counters", "etcd, ZooKeeper, Spanner, CockroachDB"],
          ["<strong>Sequential</strong>", "All observers see same order (not real-time)", "High", "Event logs, total-order broadcast", "Kafka partitions, ZAB, Raft log"],
          ["<strong>Causal</strong>", "Causally related writes ordered; concurrent unordered", "Medium", "Comments/replies, chat messages", "MongoDB (causal sessions), COPS"],
          ["<strong>Read-your-writes</strong>", "Client always sees its own writes", "Medium-Low", "Profile updates, settings changes", "DynamoDB (consistent read), session affinity"],
          ["<strong>Monotonic reads</strong>", "Never see older value after seeing newer", "Low", "Timelines, feeds (no \u201cgoing back in time\u201d)", "Read from same replica, version tracking"],
          ["<strong>Eventual</strong>", "Replicas converge given no new writes", "Lowest", "Likes, DNS, shopping carts, CDN", "Cassandra, DynamoDB, S3, CouchDB"]
        ]
      },
      callouts: [
        { color: "blue", label: "Tunable consistency (quorum formula):", body: "<code>W + R &gt; N</code> guarantees overlap (strong consistency). <strong>N=3, W=2, R=2</strong>: majority quorum, the standard. <strong>N=3, W=3, R=1</strong>: fast reads, slow writes. <strong>N=3, W=1, R=1</strong>: eventual consistency, fastest, may read stale. Cassandra and DynamoDB let you tune this per query." },
        { color: "green", label: "CRDTs:", body: "Data structures that <strong>merge concurrent updates without conflicts</strong>: G-Counter (grow-only), PN-Counter (inc/dec), OR-Set (add/remove), RGA (text). Used in <strong>Figma</strong>, <strong>Apple Notes</strong>, and <strong>Redis Active-Active</strong>. All replicas converge to the same state regardless of message order." }
      ]
    },
    realWorld: {
      heading: "How Real Systems Choose",
      intro: "The same database often offers several points on the spectrum, tunable per query or per session.",
      points: [
        { label: "Spanner", body: "Linearizable globally, using TrueTime to bound clock uncertainty." },
        { label: "DynamoDB", body: "Eventual by default, with a strong per-read option when you need it." },
        { label: "Cassandra", body: "Tunable per query: ONE, QUORUM, or ALL, letting you break or satisfy <code>W + R &gt; N</code> at will." },
        { label: "MongoDB and Redis", body: "MongoDB offers causal consistency with sessions; Redis is eventual via async replication, and strong when you use the WAIT command." }
      ]
    },
    tradeoffs: {
      heading: "Strong vs Eventual, and How to Get There",
      intro: "The two ends of the spectrum use opposite mechanisms and pay opposite costs.",
      points: [
        { label: "Strong consistency techniques", body: "Quorum reads/writes (<code>W + R &gt; N</code>), synchronous replication, consensus (Raft/Paxos), and serializable isolation (Spanner, CockroachDB). Cost: higher latency and lower availability during partitions." },
        { label: "Eventual consistency techniques", body: "Async replication, anti-entropy via <strong>Merkle trees</strong> (compare two large datasets in O(log N) instead of a full scan), read repair, and hinted handoff. Cost: stale reads and the need for conflict resolution." },
        { label: "Anti-patterns", body: "Assuming strong consistency while using eventual (silent lost updates). Reaching for linearizable everywhere and paying unnecessary latency for non-critical reads. Running an eventual system with no conflict-resolution strategy. Ignoring replication lag on read replicas." }
      ]
    },
    handsOn: {
      goal: "Verify the quorum inequality <code>W + R &gt; N</code> by writing and reading the same key at ONE (which breaks it) and then at QUORUM (which satisfies it) on a 3-node Cassandra cluster.",
      stack: "The 3-node Cassandra cluster from 9.1, driven with <code>cqlsh</code> over <code>docker exec</code>. Local and free.",
      steps: [
        {
          title: "Create a keyspace with replication factor 3",
          body: "N = 3 replicas per key, so QUORUM = 2.",
          code: "docker exec cass1 cqlsh -e \"CREATE KEYSPACE IF NOT EXISTS demo WITH replication = {'class':'SimpleStrategy','replication_factor':3};\"\ndocker exec cass1 cqlsh -e \"CREATE TABLE IF NOT EXISTS demo.kv (k text PRIMARY KEY, v text);\"",
          lang: "sql"
        },
        {
          title: "Weak path: write and read at ONE from different nodes",
          body: "W = 1 and R = 1, so 1 + 1 = 2, not greater than N = 3. Loop so you catch the occasional stale read before replication catches up.",
          code: "for i in $(seq 1 50); do\n  docker exec cass1 cqlsh -e \"CONSISTENCY ONE; INSERT INTO demo.kv (k,v) VALUES ('k','v$i');\"\n  docker exec cass2 cqlsh -e \"CONSISTENCY ONE; SELECT v FROM demo.kv WHERE k='k';\"\ndone",
          lang: "bash"
        },
        {
          title: "Strong path: write and read at QUORUM from different nodes",
          body: "W = 2 and R = 2, so 2 + 2 = 4, greater than N = 3, which guarantees the read and write replica sets overlap.",
          code: "for i in $(seq 1 50); do\n  docker exec cass1 cqlsh -e \"CONSISTENCY QUORUM; INSERT INTO demo.kv (k,v) VALUES ('k','q$i');\"\n  docker exec cass2 cqlsh -e \"CONSISTENCY QUORUM; SELECT v FROM demo.kv WHERE k='k';\"\ndone",
          lang: "bash"
        }
      ],
      observe: "The ONE/ONE loop occasionally returns the previous value (the inequality fails: 1 + 1 = 2, not &gt; 3), while the QUORUM/QUORUM loop always returns the latest write (2 + 2 = 4 &gt; 3). The tunable-consistency formula, verified by deliberately breaking it and then fixing it.",
      stretch: "Disconnect one node (<code>docker network disconnect capnet cass3</code>), write at ONE so only the majority sees it, reconnect, run <code>docker exec cass1 nodetool repair demo</code>, and confirm all replicas converge to the same value: anti-entropy observed instead of described."
    }
  },
  keyTakeaways: [
    "Consistency is a <strong>spectrum</strong> from linearizable (single-copy illusion, real-time order) down through sequential, causal, read-your-writes, and monotonic reads to eventual; each step trades latency for correctness.",
    "Quorum systems make consistency tunable: <code>W + R &gt; N</code> guarantees overlap, so N=3/W=2/R=2 is strong while N=3/W=1/R=1 is eventual.",
    "Strong consistency leans on quorums, sync replication, and consensus; eventual leans on async replication, Merkle-tree anti-entropy, read repair, and CRDTs to converge."
  ],
  proTip: "Pick a model by asking \u201cwhat happens if a user reads stale data?\u201d Money lost points to linearizable, wrong ordering to sequential or causal, mild staleness to eventual, and user confusion to read-your-writes.",
  related: ["cap", "consensus", "conflict-resolution", "clock-sync", "replication", "concurrency"],
  bridgeOut: "Consensus was just named as one strong-consistency mechanism without explaining it. That is the next lesson."
};
