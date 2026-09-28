/* === Lesson db-indexing - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#db-indexing)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["db-indexing"] = {
  module: 6, num: "6.2", title: "Database Indexing",
  connectsFrom: "A query without an index means scanning every row, every time. Fine at 100 rows, unusable at 1M. The B+Tree and sparse index from the internals lesson now get pointed at a real problem: reading as few disk blocks as possible.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "howItWorks", label: "How Indexing Works", icon: "hex" },
    { key: "types", label: "Index Types", icon: "layers" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Read Fewer Blocks",
      intro: "Your data lives on <strong>disk</strong>, not RAM, and disk reads are roughly <strong>10,000\u00d7 slower</strong> than memory. Worse, reads happen at the <strong>block level</strong> (4KB or 8KB chunks): even reading 1 byte loads the whole block. An index is a small, sorted lookup table that tells the database <em>which blocks</em> to read, so it skips the rest, like a book's table of contents.",
      cards: [
        { icon: "N", title: "Non-Clustered", color: "blue", body: "A separate structure holding an entry per key that points to <strong>scattered</strong> table pages. It does not reorganize storage, it just marks where rows live." },
        { icon: "C", title: "Clustered", color: "green", body: "Changes <strong>storage organization</strong>: the table itself is stored in clustered-key order. One per table. Great for primary-key lookups and range scans." },
        { icon: "P", title: "Partitioning", color: "orange", body: "Removes whole <strong>irrelevant chunks</strong> before a query even starts scanning, so there is less to consider at all. Distinct from what an index does." }
      ],
      callouts: [
        { color: "green", label: "Bottom line:", body: "An index is like a <strong>book's table of contents</strong>: instead of reading every page to find \u201cChapter 7,\u201d you look up the page number and jump there. At scale, the difference between indexed and unindexed is <strong>seconds vs milliseconds</strong>." }
      ]
    },
    howItWorks: {
      heading: "What an Index Actually Skips",
      intro: "The three mechanisms above solve different problems. Here is what each one does with concrete blocks and pages, so the distinctions stop blurring together.",
      callouts: [
        { color: "blue", label: "Query: SELECT * FROM users WHERE age = 23", body: "The database needs all users aged 23. Without an index it has <strong>no idea which blocks contain age=23</strong>, so it reads every block (a full table scan, for example 34 block reads over 100 rows). With an index it first checks the tiny index to learn <strong>exactly which row IDs match</strong>, then fetches only those specific blocks (roughly 4 reads: 2 index plus 2 data)." },
        { color: "green", label: "Clustered index solves:", body: "Range scans become <strong>sequential</strong> reads. A clustered index does not add a map, it <strong>reorders the table itself</strong> so rows are physically stored in key order (Page 1: Jan 1, 2, 3; Page 2: Jan 4, 5, 6). Contrast a non-clustered index where index order \u2260 physical order forces random I/O." },
        { color: "green", label: "Partitioning solves:", body: "It reduces <strong>how much data</strong> is even considered. Split the table into physical segments so the engine skips whole segments first (2023 \u2192 skip, 2024 \u2192 skip, 2025 \u2192 search here), before any index or row scan runs." }
      ]
    },
    types: {
      heading: "A Catalog of Index Types",
      intro: "Beyond clustered and non-clustered, engines ship specialized index types, each matching one access pattern. Reach for the one that fits the query shape.",
      table: {
        headers: ["Index Type", "How", "Use Case"],
        rows: [
          ["<strong>Clustered</strong>", "Data physically sorted by index key (1 per table)", "Primary key lookups, range scans"],
          ["<strong>Non-clustered</strong>", "Separate structure with pointers to data rows", "Secondary lookups (email, name)"],
          ["<strong>Composite</strong>", "Multi-column index (leftmost prefix rule)", "<code>WHERE a=1 AND b=2</code>"],
          ["<strong>Covering</strong>", "All query columns in the index, no table access", "Index-only scans (fastest reads)"],
          ["<strong>Partial</strong>", "Index only a subset of rows (<code>WHERE active=true</code>)", "Sparse data, smaller index size"],
          ["<strong>GIN</strong>", "Generalized Inverted, multi-value keys", "Full-text search, JSONB, arrays (Postgres)"],
          ["<strong>GiST</strong>", "Generalized Search Tree, spatial/range", "Geo queries (PostGIS), range types"],
          ["<strong>BRIN</strong>", "Block Range, summary per block range", "Large sequential data (time-series, logs)"],
          ["<strong>Sparse</strong>", "Stores only anchor keys; scan forward from nearest match (needs sorted data)", "SSTable indexes, B+Tree internal nodes"]
        ]
      }
    },
    tradeoffs: {
      heading: "The Problem Each Step Solves",
      intro: "Index \u2192 Clustered Index \u2192 Partitioning is a progression. Each step exists because the previous one left something unsolved.",
      points: [
        { label: "The core problem: disk is slow and block-based", body: "Your data lives on <strong>disk</strong>, not RAM, and disk reads are roughly 10,000\u00d7 slower than memory. Worse, reads happen at the <strong>block level</strong> (4KB or 8KB): even reading 1 byte loads the entire block. The whole game is to read as few disk blocks as possible, which is exactly what an index does." },
        { label: "Baseline (no index): full table scan", body: "A query like WHERE CustomerId=500 on 100M rows makes the database read <strong>every page</strong>, checking each row. Finding a few rows scans the whole table: O(N) disk I/O." },
        { label: "Non-clustered index: random I/O on range scans", body: "A separate B-tree maps key \u2192 row location, so point queries are fast. But a range query returning millions of rows jumps around (Jan 1 \u2192 Page 500, Jan 2 \u2192 Page 20, Jan 3 \u2192 Page 900): index order \u2260 physical order, so range scans become random I/O." },
        { label: "Indexes are not free: they slow writes", body: "Every index speeds up matching reads but <strong>slows down writes</strong>: each INSERT, UPDATE, and DELETE must maintain every index on the table. Index only the columns your hot queries filter or join on, and drop indexes the planner never uses." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Postgres); `psql` or any SQL client.",
      setup: "Local and free: `docker run -d -p 5432:5432 postgres`.",
      simulate: "Create a `users` table, seed it with 500,000 rows (`generate_series` makes this a one-liner), then run `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user250000@test.com'` with no index on `email`. Add `CREATE INDEX idx_email ON users(email)` and run the exact same query again.",
      observe: "The query plan switches from \u201cSeq Scan\u201d (reads all 500K rows) to \u201cIndex Scan\u201d (reads a handful of blocks), and the reported execution time drops from milliseconds-times-hundreds-of-thousands-of-rows to near-instant. Note the actual numbers `EXPLAIN ANALYZE` reports for both.",
      stretch: "Build a covering index (`CREATE INDEX ... ON users(email) INCLUDE (name)`) and confirm via `EXPLAIN ANALYZE` that the plan now shows \u201cIndex Only Scan,\u201d the table itself is never touched, exactly the \u201cno table access needed\u201d property."
    }
  },
  keyTakeaways: [
    "Disk reads happen at the block level, so the whole game is reading as few blocks as possible; an index is a small sorted map from key to the blocks worth reading.",
    "Non-clustered adds pointers to scattered pages, clustered reorganizes physical storage order, and partitioning removes irrelevant chunks entirely: three different mechanisms people routinely conflate.",
    "Specialized index types (composite, covering, partial, GIN, GiST, BRIN) each match a specific access pattern; a covering index can answer a query with zero table access."
  ],
  proTip: "Always confirm an index is used, never assume. Run `EXPLAIN ANALYZE` and look for \u201cIndex Scan\u201d or \u201cIndex Only Scan\u201d rather than \u201cSeq Scan.\u201d An index the planner ignores is pure write overhead.",
  related: ["db-internals", "db-choice", "sql", "sharding", "search", "distributed-indexing"],
  bridgeOut: "Index \u2192 Clustered Index \u2192 Partitioning is a progression: each step is what you reach for once the previous one's ceiling is hit on one machine, which is exactly where Scalability's Partitioning lesson picks up."
};
