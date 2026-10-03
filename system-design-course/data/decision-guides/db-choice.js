/* === Lesson db-choice - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#db-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.2.
   Note: the slug "db-choice" also exists under Module 6 (storage); this is the
   Module 15 decision-guide version and lives in data/decision-guides/.
   Cheat-sheet content ported into the course tab structure. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["db-choice"] = {
  module: 15, num: "15.2", title: "Which Database?",
  connectsFrom: "Module 6 covered each storage engine on its own. This is the same choice as the Database Choice Guide (6.3), framed as a flowchart for quick recall. It branches first on <strong>need ACID?</strong>, then on <strong>access pattern</strong>, <strong>consistency needs</strong>, and <strong>scale</strong>, routing to a specific named product.",
  tabs: {
    overview: {
      heading: "The Database Decision Tree",
      intro: "Walk the tree top to bottom. The first question is the loudest: <strong>do you need ACID transactions plus complex joins?</strong> If yes, you are done, it is relational. If no, keep descending through write throughput, schema flexibility, and lookup latency until a family fits.",
      table: {
        headers: ["If the requirement is\u2026", "Choose", "Family"],
        rows: [
          ["ACID + complex joins, strong consistency", "<strong>SQL (Postgres, MySQL)</strong>", "Relational"],
          ["Very high write throughput (&gt;100K/sec)", "<strong>Cassandra / ScyllaDB</strong>", "Wide-column, LSM-tree"],
          ["Flexible schema / JSON documents", "<strong>MongoDB</strong>", "Document, single-doc ACID"],
          ["Sub-millisecond key lookup", "<strong>Redis / DynamoDB</strong>", "Key-value, O(1)"],
          ["Relationship-heavy traversal queries", "<strong>Neo4j</strong>", "Graph"],
          ["Full-text / search", "<strong>Elasticsearch</strong>", "Search index"],
          ["Global ACID at scale", "<strong>Spanner</strong>", "Distributed SQL"]
        ]
      },
      callouts: [
        { color: "green", label: "Walk the tree in order:", body: "1) <strong>Need ACID + joins?</strong> Yes \u2192 SQL. 2) <strong>High write throughput?</strong> Yes \u2192 Cassandra/ScyllaDB. 3) <strong>Flexible schema/JSON?</strong> Yes \u2192 MongoDB. 4) <strong>Sub-ms key lookup?</strong> Yes \u2192 Redis/DynamoDB. 5) <strong>Relationships / search / global?</strong> \u2192 Neo4j / Elasticsearch / Spanner." },
        { color: "blue", label: "The three axes:", body: "Every branch is really testing <strong>access pattern</strong>, <strong>consistency needs</strong>, and <strong>scale</strong>. The named products are just the endpoints; the axes are what you defend." }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "Each fork traces back to a storage-engine trade-off already explained in Module 6. Here is why each branch lands where it does.",
      points: [
        { label: "ACID + joins forces relational", body: "If correctness depends on multi-row transactions and you query across entities with joins, a relational engine is the only clean fit. Postgres is the default; you accept harder horizontal scaling in exchange for consistency and query power." },
        { label: "Write throughput forces wide-column", body: "Cassandra and ScyllaDB use LSM-tree storage that turns writes into fast sequential appends, sustaining huge write rates across a ring of nodes. The cost: no joins, tunable (often eventual) consistency, and you must design tables around your query up front." },
        { label: "Schema variability forces document", body: "When records have differing shapes or nested JSON, MongoDB stores them natively with single-document ACID. The cost: cross-document transactions and joins are weaker than relational, so denormalize deliberately." },
        { label: "Latency forces key-value", body: "For sub-millisecond point lookups by key (sessions, counters, hot config), Redis or DynamoDB give O(1) access. The cost: you lose rich query; if you need range scans or joins, this is the wrong branch." },
        { label: "The specialized tail", body: "Relationship traversal \u2192 <strong>Neo4j</strong> (graph). Full-text and relevance ranking \u2192 <strong>Elasticsearch</strong>. Global strong consistency at scale \u2192 <strong>Spanner</strong>, which buys geo-distributed ACID at real cost and operational complexity." },
        { label: "Polyglot persistence is normal", body: "Real systems rarely pick one. A single product may use Postgres for orders, Redis for sessions, Elasticsearch for search, and Kafka for the event log. The tree runs once per data type, not once per system." }
      ]
    }
  },
  keyTakeaways: [
    "The database tree branches first on <strong>ACID + joins</strong>; a yes ends the walk at relational, a no descends through write throughput, schema, and latency.",
    "Named endpoints map to families: SQL (relational), Cassandra (wide-column), MongoDB (document), Redis/DynamoDB (key-value), Neo4j (graph), Elasticsearch (search), Spanner (global ACID).",
    "Real systems are <strong>polyglot</strong>: run the tree once per data type, not once per product."
  ],
  proTip: "When you cannot decide, ask \u201cwhat is the single most demanding access pattern here?\u201d That one pattern usually forces the family, and everything else can be denormalized or offloaded to a second store.",
  related: ["sql", "nosql", "db-choice", "db-indexing", "search", "graph-db-deep"],
  bridgeOut: "Storage decided, the next parallel decision is how services talk to each other asynchronously: queue, stream, or pub/sub."
};
