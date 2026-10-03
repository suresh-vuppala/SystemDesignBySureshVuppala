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
      goal: "Model the same data (a user with their orders) two ways: one nested MongoDB document versus a Cassandra table partitioned by <code>user_id</code>, and feel how each shape forces a different query.",
      stack: "MongoDB and Cassandra in Docker, driven with <code>mongosh</code> and <code>cqlsh</code>. Local and free.",
      steps: [
        {
          title: "Start MongoDB and Cassandra",
          body: "Cassandra takes a minute to accept connections on first boot.",
          code: "docker run -d --name mongo -p 27017:27017 mongo\ndocker run -d --name cass -p 9042:9042 cassandra",
          lang: "bash"
        },
        {
          title: "MongoDB: store the user and orders as one nested document",
          code: "docker exec -it mongo mongosh --eval '\ndb.users.insertOne({\n  _id: 1,\n  name: \"Alice\",\n  orders: [ { id: 101, total: 40 }, { id: 102, total: 15 } ]\n});\n'",
          lang: "bash"
        },
        {
          title: "MongoDB: fetch user plus all orders in one call",
          body: "One <code>findOne</code> returns the whole nested structure, no join.",
          code: "docker exec -it mongo mongosh --eval 'db.users.findOne({ _id: 1 })'",
          lang: "bash"
        },
        {
          title: "Cassandra: model the table AROUND the query first",
          body: "The partition key <code>user_id</code> must match your read pattern up front.",
          code: "docker exec -it cass cqlsh -e \"\nCREATE KEYSPACE IF NOT EXISTS shop WITH replication = {'class':'SimpleStrategy','replication_factor':1};\nCREATE TABLE shop.orders_by_user (user_id int, order_id int, total int, PRIMARY KEY (user_id, order_id));\nINSERT INTO shop.orders_by_user (user_id, order_id, total) VALUES (1, 101, 40);\nINSERT INTO shop.orders_by_user (user_id, order_id, total) VALUES (1, 102, 15);\n\"",
          lang: "bash"
        },
        {
          title: "Cassandra: read scoped to one partition",
          code: "docker exec -it cass cqlsh -e \"SELECT * FROM shop.orders_by_user WHERE user_id = 1;\"",
          lang: "bash"
        }
      ],
      observe: "MongoDB returns the full nested structure in one call (flexible schema, no join), while Cassandra only stays cheap because the partition key matches the access pattern. Query anything other than <code>user_id</code> and Cassandra makes you add <code>ALLOW FILTERING</code> or fan out across the cluster.",
      stretch: "In a multi-node local Cassandra cluster (<code>docker compose</code> with 2 to 3 nodes), write with consistency <code>ONE</code> and immediately read with <code>ONE</code> from a different node: you will occasionally read a stale value. Repeat with <code>QUORUM</code> on both and confirm it disappears."
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
