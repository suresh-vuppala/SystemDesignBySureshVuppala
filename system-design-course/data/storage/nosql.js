/* === Lesson nosql - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#nosql)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["nosql"] = {
  module: 6, num: "6.5", title: "NoSQL",
  connectsFrom: "SQL's consistency guarantees come at the cost of horizontal scale. NoSQL trades some of that consistency back for <strong>horizontal scaling</strong>, flexible schema, and tunable consistency. But \u201cNoSQL\u201d is not one thing: it is four shapes for four access patterns.",
  tabs: {
    overview: {
      heading: "Four Shapes, Four Patterns",
      intro: "NoSQL is not a single trade-off. Each shape is tuned for a different access pattern, so the right question is never \u201cSQL or NoSQL\u201d but \u201cwhich shape matches my data and my queries.\u201d",
      cards: [
        { icon: "K", title: "Key-Value", color: "orange", body: "Simplest, fastest point lookups. O(1) get/put. Redis, DynamoDB. Sessions and cache." },
        { icon: "D", title: "Document", color: "green", body: "Nested, flexible schema, single-doc ACID. MongoDB, Firestore. Profiles and catalogs." },
        { icon: "W", title: "Wide-Column", color: "blue", body: "Huge write throughput, sparse columns, tunable consistency. Cassandra, HBase. Time-series and IoT." },
        { icon: "G", title: "Graph", color: "purple", body: "Relationships as first-class citizens, O(1) edge traversal. Neo4j, Neptune. Covered in depth in 6.11." }
      ],
      table: {
        headers: ["Type", "Examples", "Guarantee", "Use Case"],
        rows: [
          ["<strong>Key-Value</strong>", "Redis, DynamoDB", "O(1) lookup, partition tolerant", "Sessions, cache"],
          ["<strong>Document</strong>", "MongoDB, Firestore", "Single-doc ACID, flexible schema", "Profiles, catalogs"],
          ["<strong>Wide-Column</strong>", "Cassandra, HBase", "Write-optimized, tunable consistency", "Time-series, IoT"],
          ["<strong>Graph</strong>", "Neo4j, Neptune", "O(1) edge traversal", "Social, fraud, recommendations"]
        ]
      },
      callouts: [
        { color: "green", label: "Cassandra guarantees:", body: "<strong>Masterless ring</strong>, no single leader and no SPOF. <strong>Tunable consistency</strong>: QUORUM (W+R&gt;N = strong) or ONE (fast, eventual). <strong>Anti-entropy</strong>: read repair, Merkle trees, and hinted handoff quietly keep replicas in sync over time." },
        { color: "yellow", label: "Real-world:", body: "<strong>Discord</strong> used Cassandra (later migrated to ScyllaDB). <strong>Netflix</strong> uses Cassandra for viewing history. <strong>Uber</strong> uses Cassandra for location data." }
      ]
    },
    tradeoffs: {
      heading: "What NoSQL Gives Up",
      intro: "Scale and flexibility are not free. Cassandra's limitations are representative of the wide-column and key-value families.",
      points: [
        { label: "No complex joins", body: "You cannot join across tables the way SQL does; related data must be denormalized or fetched in multiple round trips." },
        { label: "No multi-row ACID", body: "Atomicity is usually scoped to a single row or document, not a transaction spanning many rows." },
        { label: "Eventual consistency by default", body: "Unless you dial consistency up (QUORUM), a read right after a write can return a stale value." },
        { label: "Must model around queries", body: "The partition key has to match your access pattern up front, or the query fans out expensively across the cluster. Tombstone overhead is a real cost too." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (MongoDB and Cassandra images); a client for each (`mongosh`, `cqlsh`).",
      setup: "Local and free: `docker run -d -p 27017:27017 mongo` and `docker run -d -p 9042:9042 cassandra`.",
      simulate: "Model the same data (a user with a list of orders) 2 ways: as one nested MongoDB document, vs normalized rows across a Cassandra table partitioned by `user_id`. Fetch \u201cuser plus all their orders\u201d from each and compare query complexity (1 MongoDB `findOne` vs a Cassandra query scoped to one partition).",
      observe: "MongoDB returns the full nested structure in one call (flexible schema, no join needed), while Cassandra requires your data model to already be shaped around the query you will run: the partition key must match your access pattern, or the query fans out expensively across the cluster.",
      stretch: "In a multi-node local Cassandra cluster (`docker-compose` with 2 to 3 nodes), set consistency `ONE` for a write and `ONE` for a read immediately after on a different node; occasionally read a stale value. Repeat with `QUORUM` on both and confirm it disappears."
    }
  },
  keyTakeaways: [
    "NoSQL is four shapes for four access patterns: Key-Value (point lookups), Document (flexible schema), Wide-Column (write throughput), and Graph (relationships).",
    "Cassandra's masterless ring removes the single-leader bottleneck and offers tunable consistency, with read repair, Merkle trees, and hinted handoff healing replicas over time.",
    "The cost is no complex joins, no multi-row ACID, eventual consistency by default, and a data model you must shape around your queries in advance."
  ],
  proTip: "In a wide-column store, design the table backwards from the query. If you cannot name the partition key before you model, you will end up scanning the whole cluster.",
  related: ["sql", "db-choice", "newsql", "cap", "sharding", "redis", "more-decisions", "connection-pooling", "db-internals", "graph-db-deep", "search", "timeseries", "vector-db"],
  bridgeOut: "\u201cNoSQL\u201d is not one trade-off; which shape matches your data is the right question. NewSQL is the attempt to get NoSQL's scale without dropping ACID."
};
