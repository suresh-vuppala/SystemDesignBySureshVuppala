/* === Lesson db-choice - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#db-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["db-choice"] = {
  module: 6, num: "6.3", title: "Database Choice Guide",
  connectsFrom: "Internals and indexing explained how engines work. Now the choice becomes clear: different engines are just different trade-offs on the read / write / range-query spectrum, and every row below is a consequence of the storage engine underneath.",
  tabs: {
    overview: {
      heading: "Match Engine to Access Pattern",
      intro: "<strong>B+Tree</strong> engines (Postgres, MySQL) favour reads and range scans. <strong>LSM-tree</strong> engines (Cassandra, RocksDB) favour writes. <strong>Hash</strong> engines (Redis, DynamoDB) favour point lookups but cannot range-scan. <strong>Inverted index</strong> engines (Elasticsearch) favour text matching. Pick the engine whose native shape matches your dominant access pattern.",
      table: {
        headers: ["Need", "Choose", "Why (engine underneath)", "Examples"],
        rows: [
          ["ACID + complex joins", "<strong>SQL</strong>", "B+Tree: strong consistency, referential integrity, range scans", "Postgres, MySQL, Aurora"],
          ["High write throughput", "<strong>Wide-Column</strong>", "LSM-tree: sequential writes, masterless, tunable consistency", "Cassandra, ScyllaDB"],
          ["Flexible schema", "<strong>Document</strong>", "B-tree over JSON: single-doc ACID, no migration needed", "MongoDB, Firestore"],
          ["Sub-ms key lookup", "<strong>Key-Value</strong>", "Hash index: O(1) get/put, in-memory option, no range scans", "Redis, DynamoDB"],
          ["Relationship traversal", "<strong>Graph</strong>", "Index-free adjacency: O(1) hops, no joins", "Neo4j, Neptune"],
          ["Full-text search", "<strong>Search Engine</strong>", "Inverted index + BM25 ranking, distributed across shards", "Elasticsearch, OpenSearch"],
          ["Global ACID at scale", "<strong>NewSQL</strong>", "B+Tree + distributed consensus (Paxos/Raft)", "Spanner, CockroachDB"],
          ["Analytics (OLAP)", "<strong>Columnar</strong>", "Column-oriented storage: reads only the columns you aggregate", "BigQuery, ClickHouse, Apache Pinot"]
        ]
      },
      callouts: [
        { color: "blue", label: "Every row is a consequence of the engine underneath:", body: "<strong>B+Tree</strong> engines (Postgres, MySQL) favour reads and range scans. <strong>LSM-tree</strong> engines (Cassandra, RocksDB) favour writes. <strong>Hash</strong> engines (Redis, DynamoDB) favour point lookups but cannot range-scan. <strong>Inverted index</strong> engines (Elasticsearch) favour text matching. Pick the engine whose native shape matches your dominant access pattern." },
        { color: "yellow", label: "Most systems use several:", body: "A typical product runs Postgres as the source of truth, Redis for hot lookups, Elasticsearch for search, S3 for blobs, and a columnar warehouse for analytics. The question is rarely \u201cwhich one database,\u201d it is \u201cwhich engine owns which access pattern.\u201d" }
      ]
    },
    handsOn: {
      prerequisites: "None beyond what the labs in 6.4 to 6.8 will need.",
      setup: "None. This lesson's \u201clab\u201d is a decision exercise, not infrastructure.",
      simulate: "Take 3 real access patterns: \u201clook up a user by ID\u201d (point lookup), \u201cfind all orders for a user in the last 30 days\u201d (range scan), \u201cfind every document mentioning 'refund'\u201d (full-text search). Using only the categories above, write down which engine category you would pick for each and why, before reading the dedicated lessons that follow.",
      observe: "Whether your instinct matches the pattern: B+Tree for point lookup plus range, Inverted Index for full-text. Mismatches here are exactly the intuition the hands-on labs in 6.4 to 6.8 will sharpen.",
      stretch: "None. Revisit this exercise after finishing 6.4 to 6.8 and see if your answers change."
    }
  },
  keyTakeaways: [
    "Database choice is not about brand loyalty, it is about matching the storage engine's native shape to your dominant access pattern.",
    "The eight categories (SQL, Wide-Column, Document, Key-Value, Graph, Search, NewSQL, Columnar) each map to an engine: B+Tree, LSM-tree, hash, inverted index, or columnar storage.",
    "Real systems are polyglot: source of truth in SQL, hot lookups in Redis, search in Elasticsearch, blobs in S3, analytics in a columnar warehouse."
  ],
  proTip: "Do not start from the database, start from the access pattern. Name the read/write mix and the query shapes first, and the engine category usually names itself.",
  related: ["db-internals", "db-indexing", "sql", "nosql", "cap", "more-decisions", "blob", "connection-pooling", "graph-db-deep", "newsql", "schema-migrations", "search", "timeseries", "vector-db"],
  bridgeOut: "Every category named here gets its own dedicated lesson, immediately, starting with SQL."
};
