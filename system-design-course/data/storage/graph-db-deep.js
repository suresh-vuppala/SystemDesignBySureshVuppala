/* === Lesson graph-db-deep - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#graph-db-deep)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.11.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["graph-db-deep"] = {
  module: 6, num: "6.11", title: "Graph DB Deep Dive",
  connectsFrom: "\u201cFind all friends-of-friends within 3 hops\u201d in a relational database means a chain of expensive JOINs, growing costlier with every additional hop. Graph databases make that traversal cheap through <strong>index-free adjacency</strong>: O(1) hops between connected nodes.",
  tabs: {
    overview: {
      heading: "Index-Free Adjacency",
      intro: "In a graph database, each node record is fixed-size with a direct pointer (`first_rel_ptr`) to its first relationship, and each relationship record (`first_prop_ptr`, `next_rel_ptr`) forms a linked list per node. Traversing a connection is <strong>O(1) regardless of overall graph size</strong>, because it is pointer-chasing, not an index lookup.",
      cards: [
        { icon: "N", title: "Node Record", color: "blue", body: "Fixed-size record with `first_rel_ptr` \u2192 its first relationship and `first_prop_ptr` \u2192 its properties. A direct pointer, no index lookup." },
        { icon: "R", title: "Relationship Record", color: "green", body: "Holds `start_node`, `end_node`, and `next_rel_ptr`, forming a linked list of relationships per node." },
        { icon: "T", title: "Traversal", color: "orange", body: "Following a connection is just following pointers: <strong>O(1) per hop</strong> regardless of total graph size." }
      ],
      table: {
        headers: ["Use for", "Avoid for"],
        rows: [
          ["Social graphs, fraud cycles, recommendations", "Tabular OLAP / aggregates"],
          ["Knowledge graphs, dependency trees", "High write throughput, BLOBs"],
          ["Pathfinding, shortest-path", "Simple CRUD apps (overkill)"]
        ]
      },
      callouts: [
        { color: "green", label: "Engines:", body: "Neo4j, Amazon Neptune, JanusGraph, ArangoDB (multi-model), TigerGraph (analytics-heavy)." },
        { color: "yellow", label: "Graph vs relational for relationships:", body: "A SQL JOIN on a 5-hop social query = <strong>5 table scans, exponential cost</strong>. A graph DB = <strong>5 pointer follows, constant cost per hop</strong>. At 1M nodes with an average of 50 edges, SQL \u201cfriends of friends of friends\u201d takes seconds; the graph takes milliseconds." },
        { color: "blue", label: "When NOT to use a graph DB:", body: "Simple CRUD with no relationships. High-volume writes (&gt;100K/sec). Aggregations and analytics over all data (use a columnar DB). Storing blobs or documents. If your queries do not traverse relationships, a graph DB adds complexity for no benefit." }
      ]
    },
    tradeoffs: {
      heading: "Great at Relationships, Poor at Everything Else",
      intro: "Index-free adjacency is a sharp specialization, not a general-purpose win.",
      points: [
        { label: "Excellent for relationship-heavy queries", body: "Multi-hop traversals (friends-of-friends, fraud rings, dependency chains, shortest path) stay cheap because each hop is a pointer follow, not a join." },
        { label: "Genuinely poor at the rest", body: "Simple CRUD, very-high-volume writes (&gt;100K/sec), aggregation and analytics over all data, and storing large blobs are all things a graph DB does worse than the engine built for them." }
      ]
    },
    handsOn: {
      goal: "Build a social graph in Neo4j, run a 3-hop friends-of-friends traversal in Cypher, and feel why index-free adjacency stays cheap where the equivalent SQL nested JOINs blow up.",
      stack: "Neo4j Community in Docker, Cypher via the browser UI or <code>cypher-shell</code>. Local and free.",
      steps: [
        {
          title: "Start Neo4j",
          body: "Sets an initial password so you can log in at once.",
          code: "docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password123 neo4j",
          lang: "bash"
        },
        {
          title: "Generate ~200 people with random friendships",
          body: "Open <code>http://localhost:7474</code> (or <code>docker exec -it neo4j cypher-shell -u neo4j -p password123</code>) and run this.",
          code: "UNWIND range(1, 200) AS i CREATE (:Person {id: i, name: 'p' + i});\nMATCH (a:Person), (b:Person)\nWHERE a.id < b.id AND rand() < 0.03\nMERGE (a)-[:FRIENDS_WITH]-(b);",
          lang: "sql"
        },
        {
          title: "Run the friends-of-friends within 3 hops query",
          body: "Prefix with <code>PROFILE</code> to see the db hits and timing.",
          code: "PROFILE\nMATCH (me:Person {id: 1})-[:FRIENDS_WITH*1..3]-(fof)\nRETURN DISTINCT fof.name;",
          lang: "sql"
        },
        {
          title: "Compare the same query in Postgres",
          body: "Model friendships as a table and express 3 hops as a recursive CTE, then <code>EXPLAIN ANALYZE</code> it. Complexity and cost climb with each added hop.",
          code: "EXPLAIN ANALYZE\nWITH RECURSIVE reach(id, depth) AS (\n  SELECT 1, 0\n  UNION\n  SELECT CASE WHEN f.a = r.id THEN f.b ELSE f.a END, r.depth + 1\n  FROM reach r\n  JOIN friendships f ON (f.a = r.id OR f.b = r.id)\n  WHERE r.depth < 3\n)\nSELECT DISTINCT id FROM reach WHERE id <> 1;",
          lang: "sql"
        }
      ],
      observe: "The Neo4j traversal stays fast as you raise hop depth from 1 to 3 to 4, while the SQL recursive/JOIN version's execution time and complexity both grow sharply: index-free adjacency, measured with <code>PROFILE</code> and <code>EXPLAIN ANALYZE</code> on both sides.",
      stretch: "Visualize the graph in Neo4j's browser UI at <code>http://localhost:7474</code> and click through relationship paths: a felt sense of why pointer-chasing, not an index lookup, keeps traversal cheap regardless of total graph size."
    }
  },
  keyTakeaways: [
    "Index-free adjacency stores a direct pointer from each node to its relationships, so a hop is O(1) regardless of total graph size, not an index lookup.",
    "Multi-hop queries that cost exponential JOINs in SQL (friends-of-friends, fraud rings, shortest path) stay cheap in a graph DB: constant cost per hop.",
    "It is a specialist: poor at simple CRUD, very-high-volume writes, whole-dataset analytics, and blobs, so use it only when queries actually traverse relationships."
  ],
  proTip: "Count the hops before choosing a graph DB. One or two hops are fine in SQL; it is the deep, variable-depth traversals where index-free adjacency pulls decisively ahead.",
  related: ["nosql", "db-choice", "sql"],
  bridgeOut: "A self-contained specialist lesson with no direct forward dependency: graph storage stands on its own among the storage engines."
};
