/* === Lesson sql - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#sql)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["sql"] = {
  module: 6, num: "6.4", title: "SQL (PostgreSQL, MySQL)",
  connectsFrom: "B+Tree engines favor reads and range scans. SQL databases are the concrete example of that trade-off: <strong>ACID</strong> transactions plus complex queries, the default choice when you need consistency.",
  tabs: {
    overview: {
      heading: "The Consistency Default",
      intro: "SQL databases give you <strong>ACID</strong> guarantees on a B+Tree engine. Those guarantees mean <strong>partial updates are impossible</strong> and <strong>committed data is never lost</strong>, which is why they are the default any time correctness is not optional.",
      cards: [
        { icon: "A", title: "Atomicity", color: "green", body: "All or nothing. A transaction either fully commits or fully rolls back, never half-applied." },
        { icon: "C", title: "Consistency", color: "blue", body: "Constraints (PK, FK, UNIQUE) are <strong>always enforced</strong>. The database rejects anything that would break them." },
        { icon: "I", title: "Isolation", color: "purple", body: "Locks and MVCC prevent dirty reads, so concurrent transactions do not corrupt each other." },
        { icon: "D", title: "Durability", color: "orange", body: "The <strong>WAL</strong> survives crashes: once committed, data is safe even if the process dies a moment later." }
      ],
      table: {
        headers: ["Postgres Feature", "Detail"],
        rows: [
          ["<strong>MVCC</strong>", "Multi-version: readers see a snapshot, writers create a new version. No read locks."],
          ["<strong>Indexes</strong>", "B-Tree (default), GIN (full-text/JSONB), GiST (geo), BRIN (large sequential)"],
          ["<strong>JSONB</strong>", "Binary JSON with indexing, bridges the SQL and document models"],
          ["<strong>Partitioning</strong>", "Range/list/hash. Partition pruning speeds queries on large tables."],
          ["<strong>Extensions</strong>", "PostGIS (geo), TimescaleDB (time-series), Citus (distributed), pg_trgm (fuzzy)"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Atomicity</strong> (all or nothing), <strong>Consistency</strong> (constraints always enforced), <strong>Isolation</strong> (locks / MVCC prevent dirty reads), <strong>Durability</strong> (WAL survives crashes). Partial updates are impossible and committed data is never lost." },
        { color: "blue", label: "Scaling:", body: "<strong>Read replicas</strong> (followers serve reads), <strong>PgBouncer</strong> (connection pooling), <strong>Citus</strong>/Vitess (sharding), and vertical (a bigger machine)." },
        { color: "yellow", label: "Real-world:", body: "<strong>Instagram</strong> runs sharded Postgres. <strong>Stripe</strong> uses Postgres for payments. <strong>Supabase</strong> is \u201cFirebase on Postgres.\u201d" }
      ]
    },
    tradeoffs: {
      heading: "What SQL Gives Up",
      intro: "Strong consistency on a single leader has a cost, and it shows up exactly where scale and schema change.",
      points: [
        { label: "Write bottleneck", body: "A single leader handles writes, roughly 1 to 3K writes/sec before you feel it. Read replicas do not help write throughput." },
        { label: "Resharding is painful", body: "Splitting data across more machines after the fact is a hard, manual, risky operation, unlike engines built masterless from day one." },
        { label: "Rigid schema", body: "An <code>ALTER</code> on a large table can take an exclusive lock, which is why zero-downtime migrations are their own topic." },
        { label: "Vertical scaling ceiling", body: "You can buy a bigger machine only up to a point; past it, you must shard or move to a distributed engine." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Postgres); `psql`.",
      setup: "Local and free: `docker run -d -p 5432:5432 postgres`.",
      simulate: "Open 2 `psql` sessions against the same table. In session A, start a transaction and update a row but do not commit. In session B, read that same row (default isolation): it sees the old value, proving readers are not blocked (MVCC). Then in session A, try to update a row that session B is concurrently updating in an uncommitted transaction, and watch session A block until B commits or rolls back.",
      observe: "The exact moment session A's write blocks: that is row-level locking, distinct from the MVCC read that did not block. Then deliberately violate a constraint (insert a duplicate primary key) and watch Postgres reject it: Atomicity and Consistency, enforced.",
      stretch: "Kill the Postgres container mid-transaction (before commit) and restart it. Confirm the uncommitted change is gone (rolled back) while an earlier committed change survives the crash: Durability made concrete."
    }
  },
  keyTakeaways: [
    "ACID is the whole value proposition: Atomicity, Consistency, Isolation, Durability make partial updates impossible and committed data permanent.",
    "MVCC lets readers see a snapshot without taking read locks, so readers never block writers; row-level locks only bite when two writers touch the same row.",
    "SQL scales reads with replicas and pooling, but write throughput sits behind a single leader and resharding is painful: the trade-off for strong consistency."
  ],
  proTip: "Reach for JSONB before reaching for a separate document database. Postgres can index and query JSON natively, which often removes the need for a second engine entirely.",
  related: ["db-choice", "nosql", "newsql", "connection-pooling", "schema-migrations", "more-decisions", "db-indexing", "db-internals", "graph-db-deep", "timeseries"],
  bridgeOut: "SQL trades write throughput and horizontal scale for strong consistency. NoSQL is the family of engines making the opposite trade."
};
