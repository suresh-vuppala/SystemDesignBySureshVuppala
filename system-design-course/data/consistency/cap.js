/* === Lesson cap - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#cap)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cap"] = {
  module: 9, num: "9.1", title: "CAP Theorem & PACELC",
  connectsFrom: "Caching (7.x) and Messaging (8.x) both quietly created second copies of the truth (a cached value, a read-model projection). This lesson names the theoretical ceiling on how \u201ccorrect\u201d those copies can simultaneously be.",
  tabs: {
    overview: {
      heading: "Pick 2 of 3, Then Pick Again",
      intro: "A distributed system can guarantee only <strong>2 of 3</strong>: Consistency, Availability, Partition Tolerance. Since partitions are a fact of networked life, the real choice is <strong>C vs A</strong> when one happens. <strong>PACELC</strong> goes further: even with no partition, you still trade <strong>Latency vs Consistency</strong> on every request.",
      cards: [
        { icon: "CA", title: "CA \u00b7 Consistent + Available", color: "teal", body: "Single DB, not distributed. No partition tolerance. <strong>Postgres, MySQL</strong> on a single node cannot gracefully survive a real partition." },
        { icon: "AP", title: "AP \u00b7 Available + Partition Tolerant", color: "orange", body: "Always responds, may serve stale data during a partition. <strong>Cassandra, DynamoDB, CouchDB</strong>." },
        { icon: "CP", title: "CP \u00b7 Consistent + Partition Tolerant", color: "purple", body: "Returns an error rather than risk an inconsistent answer. <strong>ZooKeeper, etcd, Spanner, HBase</strong>." }
      ],
      table: {
        headers: ["Type", "Trade-off", "Systems", "When Partition Happens"],
        rows: [
          ["<strong>CA</strong>", "No partition tolerance", "Single-node Postgres, MySQL", "N/A, not distributed"],
          ["<strong>AP</strong>", "Eventual consistency", "Cassandra, DynamoDB, CouchDB", "Serves stale data, resolves later"],
          ["<strong>CP</strong>", "Reduced availability", "ZooKeeper, etcd, Spanner, HBase", "Rejects requests until consistent"]
        ]
      },
      callouts: [
        { color: "green", label: "What each letter guarantees:", body: "<strong>C</strong>, all nodes see the same data (reads get the latest write). <strong>A</strong>, every request gets a non-error response. <strong>P</strong>, the system works despite network splits." },
        { color: "blue", label: "PACELC decision tree:", body: "If there is a <strong>Partition</strong> \u2192 choose <strong>Availability</strong> or <strong>Consistency</strong>. Else (no partition) \u2192 choose <strong>Latency</strong> or <strong>Consistency</strong>. Most real systems are tunable along this spectrum." }
      ]
    },
    realWorld: {
      heading: "The Three Approaches in Production",
      intro: "Every distributed datastore lands in one of three camps, and the label tells you exactly how it behaves when the network splits.",
      points: [
        { label: "CA (single-node SQL)", body: "Postgres and MySQL on one node are consistent and available, but a real partition has no graceful answer because there is nothing to partition across." },
        { label: "AP (always answer)", body: "Cassandra, DynamoDB, and CouchDB stay available during a partition and may serve stale data, reconciling it afterward via read repair and anti-entropy." },
        { label: "CP (refuse rather than lie)", body: "ZooKeeper, etcd, Spanner, and HBase reject requests on the minority side of a partition rather than risk returning an inconsistent value." }
      ]
    },
    tradeoffs: {
      heading: "The Real Choice Is CP vs AP",
      intro: "The classic \u201cpick 2 of 3\u201d framing hides where the actual decision lives.",
      points: [
        { label: "Partitions are unavoidable", body: "In a distributed system the network will split eventually, so the real choice is always <strong>CP vs AP</strong> during a partition. CA exists only for single-node systems." },
        { label: "Latency is a cost even without partitions", body: "PACELC's ELC branch says that when there is no partition you still pay for consistency in latency: a strongly consistent read waits for a quorum, a fast read may be stale." }
      ]
    },
    handsOn: {
      prerequisites: "Docker Compose; a 3-node Cassandra or a 3-node etcd cluster (both have official images).",
      setup: "Local and free: a 3-node cluster via Docker Compose, plus a way to simulate a partition between nodes (`docker network disconnect`, or `iptables`/`tc` inside the containers).",
      simulate: "With a 3-node etcd cluster running, disconnect one node from the other two (`docker network disconnect`) and write to the isolated minority node: it should refuse (CP, unavailable rather than inconsistent). Then repeat with a 3-node Cassandra cluster using `QUORUM`, disconnect one node, and write to the majority side: it succeeds (AP, available and consistent as long as quorum is met). Write directly to the isolated node with consistency `ONE` and it may still accept the write, now diverging from the majority.",
      observe: "etcd's minority partition actively rejecting requests versus Cassandra's minority partition (at weak consistency) happily accepting writes that will conflict later. That is the CP vs AP choice, observed as two different real behaviors under the identical fault you injected.",
      stretch: "Reconnect the partitioned Cassandra node and watch its divergent write get reconciled via read repair and anti-entropy, a preview of 9.7's conflict resolution."
    }
  },
  keyTakeaways: [
    "During a partition you can keep <strong>Consistency</strong> or <strong>Availability</strong>, not both; since partitions are unavoidable, the practical decision is always <strong>CP vs AP</strong>.",
    "<strong>PACELC</strong> extends CAP: even with no partition (the ELC branch), every request trades <strong>Latency</strong> against <strong>Consistency</strong>.",
    "CA labels a single-node system (Postgres, MySQL); AP means always-answer with possible staleness (Cassandra, DynamoDB); CP means refuse rather than return a wrong value (etcd, ZooKeeper, Spanner)."
  ],
  proTip: "When someone calls a database \u201cCA,\u201d push back: unless it is a single node, the honest question is what it does during a partition, and the answer is always either CP or AP.",
  related: ["consistency-models", "consensus", "conflict-resolution", "replication", "clock-sync", "db-choice", "clocks", "replication-strategies", "multi-region", "graceful-degradation", "newsql", "nosql"],
  bridgeOut: "\u201cPick 2 of 3\u201d is an abstract law. The next lesson makes it concrete by naming the actual spectrum of consistency levels you can choose along that trade-off."
};
