/* === Lesson newsql - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#newsql)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["newsql"] = {
  module: 6, num: "6.6", title: "NewSQL",
  connectsFrom: "SQL does not scale horizontally easily; NoSQL scales but drops ACID. NewSQL is the attempt to get both: <strong>global ACID</strong> at horizontal scale.",
  tabs: {
    overview: {
      heading: "Global ACID at Scale",
      intro: "NewSQL keeps a familiar SQL interface and full ACID semantics, then spreads data across many machines using distributed consensus. The result is <strong>serializability globally</strong>, the strongest isolation, on a cluster that scales out.",
      cards: [
        { icon: "S", title: "Spanner", color: "blue", body: "Google's globally-distributed SQL database. Uses <strong>TrueTime</strong> (synchronized clocks) plus <strong>Paxos</strong> for consensus." },
        { icon: "C", title: "CockroachDB", color: "green", body: "Open-source, Postgres-compatible. Uses the <strong>Raft</strong> consensus protocol across nodes." },
        { icon: "T", title: "TiDB", color: "purple", body: "MySQL-compatible distributed SQL, separating storage and compute for independent scaling." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Serializability</strong> globally, the strongest isolation. A <strong>SQL interface</strong> so familiar tools work. Trade-off: <strong>consensus latency</strong> (100ms+ multi-region) and <strong>10\u00d7 cost</strong> vs Postgres. Most apps do not need this." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Global ACID",
      intro: "NewSQL is not a free upgrade over Postgres. You buy strong global guarantees with latency and money.",
      points: [
        { label: "What you gain", body: "The strongest possible isolation, globally, and a familiar SQL interface: your existing tools and queries mostly just work against a distributed engine." },
        { label: "What you pay", body: "Roughly 100ms+ of consensus latency for multi-region writes (a round trip to reach a quorum) and about 10\u00d7 the cost of a plain Postgres instance. Most applications never need this and are better served by SQL plus replicas." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (CockroachDB's official free image).",
      setup: "Local and free: `docker run -d -p 26257:26257 -p 8080:8080 cockroachdb/cockroach start-single-node --insecure`.",
      simulate: "Connect with `cockroach sql`, create a table, and run the same MVCC-conflict test from the Postgres lab (2 sessions, one holds an uncommitted update, the other tries to update the same row). Then open CockroachDB's built-in Admin UI at `localhost:8080` for its replication and consensus visualizations.",
      observe: "The same ACID guarantees as Postgres, but explicitly built on Raft consensus across nodes (visible in the Admin UI once you add more than one node): the familiar SQL interface, felt directly by running SQL you already know against a fundamentally different, distributed engine underneath.",
      stretch: "Spin up a 3-node local cluster (`cockroach start --join=...`) and kill one node mid-query. Confirm the cluster keeps serving reads and writes via the remaining majority: a live instance of Raft/Paxos consensus."
    }
  },
  keyTakeaways: [
    "NewSQL aims to combine SQL's ACID guarantees with NoSQL's horizontal scale, using distributed consensus (Paxos in Spanner, Raft in CockroachDB and TiDB).",
    "It delivers global serializability and a familiar SQL interface, so existing tools and queries mostly work unchanged.",
    "The price is real: 100ms+ consensus latency for multi-region writes and roughly 10\u00d7 the cost of plain Postgres, so most apps do not need it."
  ],
  proTip: "Do not reach for NewSQL by default. Unless you genuinely need strong consistency across regions at scale, Postgres with read replicas is cheaper, faster for single-region writes, and simpler to operate.",
  related: ["sql", "nosql", "db-choice", "cap"],
  bridgeOut: "NewSQL's consensus engine reappears later in the course: the Raft and Paxos protocols under CockroachDB and Spanner are the same ones the distributed-systems module studies directly."
};
