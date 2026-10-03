/* === Lesson distributed-indexing - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#distributed-indexing)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["distributed-indexing"] = {
  module: 10, num: "10.2", title: "Distributed Indexing",
  connectsFrom: "Partitioning (10.1) split the data, but a query on any column that is not the partition key would otherwise have to check every single partition. Indexing across nodes is how you avoid that. How a single-machine index works (B+Tree, sparse index) is Database Indexing (6.2); this lesson is what changes once that index has to span many nodes.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "placement", label: "Placement & Strategies", icon: "layers" },
    { key: "paths", label: "Paths & Routing", icon: "swap" },
    { key: "scaling", label: "Failures & Rebalancing", icon: "alert" },
    { key: "realWorld", label: "Real-World & Design", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Indexing Once You Have Partitions",
      intro: "A single-database index covers all rows (see 6.2). The moment you partition or shard (10.1, 10.4), the index must either live <strong>inside each partition</strong> (local) or span <strong>across all of them</strong> (global), or sit in a <strong>separate service</strong>. That one choice drives query routing, write latency, and consistency.",
      cards: [
        { icon: "L", title: "Local Index", color: "green", body: "Each partition indexes only its own rows. <strong>Fast writes</strong> (touch one partition), but a query on a non-partition key must scatter-gather across all partitions. Cassandra, MongoDB, Elasticsearch per-shard." },
        { icon: "G", title: "Global Index", color: "blue", body: "The index is partitioned by the <strong>indexed value</strong>, not the base-table key. <strong>Targeted reads</strong> on that value, but a write must update the index on another partition, usually async. DynamoDB GSI." },
        { icon: "C", title: "Separate / Centralized", color: "purple", body: "The index lives in a dedicated system (a search engine). Decouples index scaling from the store, at the cost of a second system to keep in sync. Elasticsearch beside a primary DB." }
      ],
      callouts: [
        { color: "blue", label: "Rule of thumb:", body: "Query by <strong>partition key</strong> \u2192 a local index is enough (fast). Query by <strong>non-partition column</strong> \u2192 you need a <strong>global secondary index</strong> (DynamoDB GSI) or you accept scatter-gather. Search-style workloads \u2192 push to a dedicated engine (Elasticsearch, see 6.8)." }
      ]
    },
    placement: {
      heading: "Where the Index Lives, and How It Is Split",
      intro: "Two questions: where does the index sit relative to the data (local, global, separate), and how is the index itself partitioned. The index is partitioned by hash, range, or composite, the same trade-offs as data partitioning in 10.1.",
      table: {
        headers: ["Aspect", "Local Index", "Global Index"],
        rows: [
          ["<strong>Write speed</strong>", "<strong>Fast</strong>: update local index only", "<strong>Slower</strong>: must update global index (cross-partition)"],
          ["<strong>Read (by partition key)</strong>", "<strong>Fast</strong>: single partition", "<strong>Fast</strong>: single partition"],
          ["<strong>Read (non-partition key)</strong>", "<strong>Scatter-gather</strong>: query ALL partitions", "<strong>Targeted</strong>: index routes to exact partitions"],
          ["<strong>Consistency</strong>", "<strong>Strong</strong> (same partition)", "<strong>Eventual</strong> (async update) or strong (sync, slower)"],
          ["<strong>Examples</strong>", "Cassandra, MongoDB, Postgres partitions", "DynamoDB GSI, Spanner, CockroachDB"]
        ]
      },
      tables: [
        {
          headers: ["Strategy", "How", "Best When"],
          rows: [
            ["<strong>Local index per partition</strong>", "Each partition maintains its own index over its rows", "Writes dominate; most reads filter by partition key"],
            ["<strong>Global (term-partitioned) index</strong>", "One logical index partitioned by the indexed value", "Reads on a non-partition column must be fast"],
            ["<strong>Partitioned / sharded index</strong>", "The global index is itself sharded across nodes", "The index is too large for one node"],
            ["<strong>Replicated index</strong>", "Copy the whole index to every node", "Small, read-hot index where any node must answer"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Primary vs secondary index:", body: "The <strong>primary index</strong> is on the partition/shard key, so it always routes to one partition. A <strong>secondary index</strong> is on any other column, which is exactly what forces the local-vs-global decision." },
        { color: "blue", label: "Global Secondary Index (GSI):", body: "A DynamoDB GSI is a global index on a non-key attribute, maintained <strong>asynchronously</strong>. It gives targeted reads on that attribute but is <strong>eventually consistent</strong> and costs extra write capacity, since every base-table write also updates the GSI." }
      ]
    },
    paths: {
      heading: "Write Path, Read Path, Query Routing",
      intro: "Following a write and a read through the system makes the local-vs-global cost concrete. Routing is the same three-model question as partitioning (see 10.1 Key & Routing).",
      points: [
        { label: "Write path", body: "A local index update touches only the partition that owns the row: one node, fast. A global index update must also write the index partition that owns the <strong>indexed value</strong>, which is usually a different node, and is typically applied asynchronously to keep writes fast." },
        { label: "Read path by partition key", body: "Routed straight to the one owning partition, then its local index answers. This is the fast path and needs nothing global." },
        { label: "Read path by non-partition key", body: "With a global index, an <strong>index lookup</strong> routes the query to the exact partitions holding matches. With only local indexes, the coordinator <strong>scatter-gathers</strong>: every partition searches its own index and results are merged." },
        { label: "Three routing models", body: "<strong>Partition-aware lookup</strong> (client or coordinator knows the key to partition map), <strong>index lookup</strong> (a global index resolves value to partitions), and <strong>scatter-gather</strong> (ask everyone, merge). Tail latency on scatter-gather tracks the slowest partition." }
      ],
      callouts: [
        { color: "yellow", label: "Consistency of index updates:", body: "<strong>Synchronous</strong>: the index updates in the same transaction as the row, strong but slower writes. <strong>Asynchronous</strong>: the index lags, giving eventual consistency (a just-written row may miss an index query briefly). <strong>Eventual</strong>: the common default for global indexes, DynamoDB GSI included." }
      ]
    },
    scaling: {
      heading: "Failures, Hotspots, and Rebalancing",
      intro: "A distributed index has the same failure and skew problems as distributed data, plus one of its own: the index can drift out of sync with the rows it points at.",
      points: [
        { label: "Index node / partition failure", body: "If an index partition is lost, queries needing that value range cannot be served until a replica takes over or the index is rebuilt. Replicate index partitions the same way you replicate data (10.3)." },
        { label: "Stale index", body: "An async global index lags its writes, so a read can miss a row that was just written or return one that was just deleted. This is the eventual-consistency window; size it and design around it." },
        { label: "Hot index / hot partition", body: "A popular indexed value (a celebrity, a viral tag) concentrates load on one index partition. Mitigate by salting or splitting that value across partitions, the same fix as a hot data partition (10.1)." },
        { label: "Rebalancing and resharding", body: "Adding index partitions moves index entries between nodes. Naive modulo hashing remaps almost everything; consistent hashing (10.5) moves only ~1/N, which is why elastic index tiers use it." }
      ]
    },
    realWorld: {
      heading: "Real Systems and a Design Sketch",
      points: [
        { label: "Elasticsearch", body: "A local (document-partitioned) inverted index per shard; the coordinating node scatter-gathers a search across shards and merges by score (6.8)." },
        { label: "DynamoDB GSI", body: "A global secondary index on a non-key attribute, updated asynchronously, eventually consistent, billed extra write capacity." },
        { label: "Cassandra", body: "Local secondary indexes per node (and SASI); global lookups are better served by a query-first table or a materialized view." },
        { label: "MongoDB", body: "Indexes are local to each shard; a query that does not include the shard key scatter-gathers across shards." },
        { label: "Distributed SQL (Spanner, CockroachDB)", body: "Global secondary indexes kept strongly consistent through consensus, paying write latency for it." }
      ],
      callouts: [
        { color: "green", label: "Design example: a distributed search system", body: "Ingest documents, partition them across shards, and build a <strong>local inverted index</strong> per shard. A coordinator scatter-gathers a query, each shard scores its own hits, and results merge by relevance. For fast exact-value lookups (for example by user ID), add a <strong>global secondary index</strong> keyed on that attribute. Replicate each shard for availability (10.3), and use consistent hashing (10.5) so adding a shard moves little data." }
      ]
    },
    tradeoffs: {
      heading: "Same Cost, Different Products",
      intro: "The local vs global choice is really a choice about where the scatter-gather cost lands.",
      points: [
        { label: "Local index: cheap writes, expensive off-key reads", body: "Writes only touch one partition\u2019s index, but any query on a non-partition column fans out to every partition and merges. The cost is real regardless of which product hides it." },
        { label: "Global index: expensive writes, cheap targeted reads", body: "The index routes a non-partition-key query to the exact partitions, but every write must update a cross-partition structure, usually asynchronously, which makes it eventually consistent." },
        { label: "Consistency follows the write path", body: "Local index reads are strongly consistent within a partition; global index reads can be stale while the async index update catches up." }
      ]
    },
    handsOn: {
      goal: "On the Citus cluster prove that a partition-key read hits one shard while a non-partition-key read scatter-gathers across all of them, even after you add a local index.",
      stack: "The Citus cluster and <code>orders</code> table from Partitioning (10.1), driven through <code>psql</code>. Local and free.",
      steps: [
        {
          title: "Confirm the distributed orders table is still there",
          body: "If you tore down the 10.1 lab, rebuild it first (start the cluster, register the workers, run <code>create_distributed_table</code>, and reseed). Then open a shell:",
          code: "docker exec -it coord psql -U postgres -c \"SELECT count(*) FROM orders;\"",
          lang: "bash"
        },
        {
          title: "Contrast a partition-key read with a non-partition-key read",
          body: "The first filters on the shard key and prunes to one shard; the second filters on a non-key column, so every shard must search its own local index.",
          code: "EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;\nEXPLAIN ANALYZE SELECT * FROM orders WHERE amount > 490;",
          lang: "sql"
        },
        {
          title: "Add a local secondary index and re-run",
          body: "Citus builds the index inside each shard (local), so it speeds each shard\u2019s scan but does not remove the fan-out.",
          code: "CREATE INDEX ON orders (amount);\nEXPLAIN ANALYZE SELECT * FROM orders WHERE amount > 490;",
          lang: "sql"
        }
      ],
      observe: "The <code>customer_id</code> query runs as a single task on one worker; the <code>amount</code> query runs a task on every shard across both workers and merges (a local index, scattered). Adding the index makes each per-shard scan faster but the coordinator still fans out to all shards. The local index cost is real regardless of which product hides it.",
      stretch: "Start single-node Elasticsearch (<code>docker run -p 9200:9200 -e discovery.type=single-node docker.elastic.co/elasticsearch/elasticsearch:8.13.0</code>), create an index with 2 shards, add documents, and search a field: the coordinating node fans the query to both shards and merges by score, the same scatter-gather pattern the local index forces here."
    }
  },
  keyTakeaways: [
    "A <strong>local index</strong> lives inside each partition: fast writes, but a non-partition-key read must scatter-gather across all partitions.",
    "A <strong>global index</strong> is partitioned by the indexed value: targeted reads on that value, but writes update a cross-partition index, usually async and eventually consistent.",
    "The decision is really about where the cost lands: cheap writes plus expensive off-key reads, or expensive writes plus cheap targeted reads."
  ],
  proTip: "If you find yourself reaching for a global secondary index on many columns, that is often the signal to hand the workload to a dedicated search engine instead of bolting indexes onto your primary store.",
  related: ["partitioning", "sharding", "replication", "partitioning-sharding", "db-indexing", "consistent-hashing", "search", "cap"],
  bridgeOut: "Splitting data solved capacity. The next move copies data for a different reason: surviving the loss of any one machine. That is replication."
};
