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
      goal: "Run the familiar Postgres MVCC-conflict test against CockroachDB and see identical ACID behavior from a distributed engine built on Raft consensus underneath.",
      stack: "CockroachDB single node in Docker, its <code>cockroach sql</code> shell and built-in Admin UI. Local and free.",
      steps: [
        {
          title: "Start a single-node CockroachDB",
          code: "docker run -d --name crdb -p 26257:26257 -p 8080:8080 cockroachdb/cockroach start-single-node --insecure",
          lang: "bash"
        },
        {
          title: "Create a table",
          code: "docker exec -it crdb ./cockroach sql --insecure -e \"CREATE TABLE accounts(id int primary key, balance int); INSERT INTO accounts VALUES (1, 100);\"",
          lang: "bash"
        },
        {
          title: "Session A: open a transaction and update without committing",
          body: "Open a shell with <code>docker exec -it crdb ./cockroach sql --insecure</code>, then run:",
          code: "BEGIN;\nUPDATE accounts SET balance = 999 WHERE id = 1;\n-- leave open",
          lang: "sql"
        },
        {
          title: "Session B: try the same row in a second shell, watch it serialize",
          body: "Open a second <code>cockroach sql</code> shell. This write waits on session A, exactly like Postgres row locking.",
          code: "UPDATE accounts SET balance = 500 WHERE id = 1;",
          lang: "sql"
        },
        {
          title: "Open the Admin UI for the consensus view",
          body: "Browse to the dashboard to see replication and range/consensus metrics.",
          code: "open http://localhost:8080   # or just paste the URL into a browser",
          lang: "bash"
        }
      ],
      observe: "The same ACID guarantees as Postgres, but the Admin UI shows the work is happening over Raft ranges: identical SQL you already know, a fundamentally different distributed engine underneath.",
      stretch: "Spin up a 3-node local cluster (<code>cockroach start --join=...</code>) and kill one node mid-query. Confirm the cluster keeps serving reads and writes through the remaining majority: Raft consensus, live."
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
