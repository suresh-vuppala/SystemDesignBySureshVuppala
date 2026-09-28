/* === Lesson search - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#search)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["search"] = {
  module: 6, num: "6.8", title: "Search (Elasticsearch)",
  connectsFrom: "<code>LIKE '%fish%'</code> against a database forces a scan of every document, O(N \u00d7 doc_size), unusably slow at millions of documents. No traditional index helps because the match can be anywhere in the text. The fix is a fundamentally different structure: the inverted index.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "insideIndex", label: "Inside the Index", icon: "hex" },
    { key: "realWorld", label: "Real-World", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Inverted Index + BM25",
      intro: "An <strong>inverted index</strong> maps each term to the documents containing it, so a search is a set intersection of tiny posting lists instead of a full scan. <strong>Apache Lucene</strong> is the core library that builds and queries this index; <strong>Elasticsearch</strong> and <strong>Solr</strong> both wrap Lucene with a distributed layer (sharding, replication, a REST API).",
      cards: [
        { icon: "L", title: "Lucene", color: "orange", body: "The <strong>core search library</strong>: builds inverted indexes, runs queries, scores with BM25, manages segments on disk. Every ES shard is a self-contained Lucene index." },
        { icon: "T", title: "Text Pipeline", color: "blue", body: "Tokenize \u2192 lowercase \u2192 remove stop words \u2192 stem (\u201cclimbed\u201d \u2192 \u201cclimb\u201d). Turns messy text into normalized terms." },
        { icon: "R", title: "BM25 Ranking", color: "green", body: "Term frequency \u00d7 inverse document frequency \u00d7 document length. Rare terms score higher; shorter, focused docs rank higher." }
      ],
      callouts: [
        { color: "purple", label: "Lucene, Elasticsearch, and Solr:", body: "<strong>Apache Lucene</strong> does the actual work: inverted indexes, BM25 scoring, segment management. <strong>Elasticsearch</strong> wraps it with sharding, replication, a REST API, and cluster management. <strong>Solr</strong> is another Lucene wrapper. When you search in ES, every shard is a self-contained Lucene index." }
      ]
    },
    insideIndex: {
      heading: "How the Inverted Index Works",
      intro: "A posting list is the per-term list of where that term appears. What you store in it decides which queries you can answer, and a handful of optimizations keep it fast at scale.",
      table: {
        headers: ["Posting List Data", "What", "Enables"],
        rows: [
          ["<strong>Doc ID</strong>", "Which documents contain this term", "Basic search: find matching docs"],
          ["<strong>Term Frequency</strong>", "How many times the term appears in a doc", "Relevance ranking: more mentions = more relevant"],
          ["<strong>Position</strong>", "Where in the doc the term appears (word #)", "Phrase queries: \u201cfish climbing\u201d (adjacent words)"],
          ["<strong>Offset</strong>", "Character start/end position in the original text", "Highlighting: bold matched words in snippets"]
        ]
      },
      tables: [
        {
          headers: ["Optimization", "How", "Why"],
          rows: [
            ["<strong>Sorted Posting Lists</strong>", "Doc IDs stored in sorted order", "Efficient merge and intersection: O(n) for AND queries"],
            ["<strong>Delta Encoding</strong>", "Store gaps between IDs, not absolute IDs", "Compress posting lists, critical at Google scale"],
            ["<strong>Tiered / Champion Lists</strong>", "Keep top-N docs per term in memory", "Fast access for frequent queries, rest on disk"],
            ["<strong>Positional Index</strong>", "Store exact word positions in each doc", "Phrase queries (\u201cfish climbing\u201d) and proximity search"],
            ["<strong>N-gram Indexing</strong>", "Index bigrams and trigrams (\u201cnew york\u201d)", "Multi-word search, autocomplete, fuzzy matching"],
            ["<strong>Sharding</strong>", "Split index across nodes (each shard = Lucene index)", "Horizontal scale: scatter-gather across shards"]
          ]
        }
      ],
      callouts: [
        { color: "blue", label: "Ranking (BM25):", body: "Not all matches are equal. BM25 scores each document by <strong>Term Frequency</strong> (more mentions = more relevant, with diminishing returns) \u00d7 <strong>Inverse Document Frequency</strong> (rare terms matter more: \u201cfish\u201d in 2 of 1M docs scores higher than \u201cthe\u201d in 999K docs) \u00d7 <strong>Document Length</strong> (shorter docs with the term rank higher: a 10-word doc mentioning \u201cfish\u201d 3\u00d7 is more focused than a 10K-word doc mentioning it 3\u00d7)." },
        { color: "yellow", label: "Segments and refresh:", body: "Lucene never updates in place. New docs go to an in-memory buffer, flush to an immutable <strong>segment</strong>, and a background <strong>merge policy</strong> combines small segments (like LSM compaction). Deletes are tombstone markers, removed on merge. This is why ES has a <strong>refresh interval</strong> (default 1s): new docs are not searchable until flushed." }
      ]
    },
    realWorld: {
      heading: "Where Search Engines Run",
      points: [
        { label: "Wikipedia", body: "Full-text search across the entire encyclopedia, ranked by relevance rather than exact match." },
        { label: "GitHub", body: "Code search across 200M+ repositories, where the query term can appear anywhere in a file." },
        { label: "Uber", body: "Trip search over huge volumes of historical ride data." },
        { label: "Netflix", body: "Log analysis via the ELK stack (Elasticsearch + Logstash + Kibana)." }
      ]
    },
    tradeoffs: {
      heading: "Fast Search, But Not a Database",
      intro: "Elasticsearch buys sub-second search at the cost of consistency and authority.",
      points: [
        { label: "Sub-second at scale", body: "Full-text search across billions of documents returns in well under a second, with a `_score` per document from BM25 ranking." },
        { label: "Eventually consistent", body: "A newly indexed document is not searchable until the refresh interval (default ~1s) flushes the buffer to a segment." },
        { label: "Not a source of truth", body: "Elasticsearch is a search layer, not a primary store. You always reindex from the source database, so a rebuild is always possible." }
      ],
      callouts: [
        { color: "green", label: "Guarantees and limits:", body: "<strong>Sub-second full-text search</strong> across billions of docs. <strong>Shard resilience</strong>: replicas survive node failure. <strong>Not ACID</strong>, eventually consistent (refresh interval delay). <strong>Not a source of truth</strong>: reindex from the primary DB. Use <code>search_after</code> for deep pagination, never <code>from/size</code>." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Elasticsearch's official free image).",
      setup: "Local and free: `docker run -d -p 9200:9200 -e \"discovery.type=single-node\" elasticsearch:8.x`.",
      simulate: "Index 1,000 short text documents (product descriptions work well) via the `_bulk` API, then run a `LIKE '%word%'`-equivalent query against a Postgres table with the same data (no index) and compare timing against an Elasticsearch `match` query for the same term.",
      observe: "Elasticsearch returns results with a `_score` per document (BM25 ranking, higher for rarer and more relevant terms) versus Postgres's `LIKE` returning an unordered list with no relevance signal at all, plus a real latency gap at this document count that widens sharply as you scale up.",
      stretch: "Index a new document, immediately query for it, and note it is sometimes not yet visible (before the refresh interval, default ~1s): the eventually consistent claim, caught in the act."
    }
  },
  keyTakeaways: [
    "An inverted index maps terms to documents, turning full-text search into a fast set intersection of posting lists instead of an O(N) scan.",
    "Lucene is the engine; Elasticsearch and Solr wrap it with sharding, replication, and a REST API, and each shard is a self-contained Lucene index.",
    "Elasticsearch is eventually consistent and explicitly not a source of truth: you always reindex from the primary database, and use <code>search_after</code> for deep pagination."
  ],
  proTip: "Never make Elasticsearch your only copy of the data. Treat it as a rebuildable projection of your source database, so a bad mapping or a lost cluster is an inconvenience, not a data-loss event.",
  related: ["db-choice", "nosql", "vector-db", "db-indexing", "blob", "distributed-indexing"],
  bridgeOut: "\u201cReindex from source DB, never a source of truth\u201d is the exact pattern Data Pipelines' CDC lesson implements to keep Elasticsearch in sync with the primary store."
};
