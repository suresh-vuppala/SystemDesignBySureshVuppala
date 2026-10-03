/* === Lesson partitioning - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#partitioning)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["partitioning"] = {
  module: 10, num: "10.1", title: "Partitioning",
  connectsFrom: "Database Indexing ended with a chain: index, then clustered index, then partitioning, once one machine\u2019s indexing is no longer enough. This is that next step: split the data so each piece holds only a fraction of the whole.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "strategies", label: "Partitioning Strategies", icon: "layers" },
    { key: "keyRouting", label: "Key & Routing", icon: "swap" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" },
    { key: "pitfalls", label: "Common Pitfalls", icon: "alert" },
    { key: "whenNot", label: "When NOT to Partition", icon: "ban" }
  ],
  tabs: {
    overview: {
      heading: "Splitting One Table Into Smaller Pieces",
      intro: "Partitioning splits one logical table into smaller physical <strong>partitions</strong>, still managed by the engine as one unified table, keyed by a <strong>partition key</strong>. It improves <strong>query performance</strong> (pruning skips irrelevant partitions), <strong>manageability</strong> (archive or drop partitions cheaply), and <strong>parallelism</strong> (scan partitions concurrently). The concrete ways to slice the data live in the <strong>Partitioning Strategies</strong> tab.",
      images: [
        { src: "images/scalability/partitioning/HorizontalvsVerticalPartitioning.png", alt: "Horizontal partitioning splits a table by rows across partitions; vertical partitioning splits it by columns", caption: "Horizontal partitioning splits rows across partitions; vertical partitioning splits columns, keeping hot fields separate from cold ones." }
      ],
      table: {
        headers: ["Horizontal (split rows)", "Vertical (split columns)"],
        rows: [
          ["Same columns, different rows per partition. Each node holds a subset of rows.", "Same rows, different columns per partition. Split hot columns from cold ones."],
          ["Most common. Scales writes and storage across nodes.", "Keep ID and name fast and small; push large bio or avatar blobs to a cold partition."]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "Partitioning provides <strong>linear write scaling</strong>. <strong>Partition pruning</strong> skips irrelevant partitions so there is less to scan." },
        { color: "yellow", label: "Hotspot mitigation:", body: "The celebrity problem, where one viral key overloads a single partition. Fix: add a random suffix to scatter across shards, then aggregate on read." },
        { color: "blue", label: "Where partitioning sits vs indexes:", body: "Three tools solve different problems. <strong>Partitioning</strong> removes irrelevant chunks so there is less to consider. <strong>Clustered index</strong> makes remaining rows physically sequential (kills random I/O). <strong>Non-clustered index</strong> pinpoints the exact row. Partitioning does <strong>not</strong> make row fetches sequential; that is the clustered index\u2019s job." }
      ]
    },
    strategies: {
      heading: "Six Ways to Slice the Data",
      intro: "The partition key decides <em>where</em> a row goes; the strategy decides <em>how</em> that mapping is computed. Each one trades even distribution against query locality differently, so pick the one that matches how your hottest queries filter.",
      images: [
        { src: "images/scalability/partitioning/SliceTheData.png", alt: "The strategies for slicing data across partitions - Hash, Range, List, Round-Robin, Composite, and Dynamic", caption: "Six ways to slice the data, each trading even distribution against query locality differently." }
      ],
      table: {
        headers: ["Strategy", "How It Works", "Best For", "Tip", "Sweet Spot"],
        rows: [
          ["<strong>Hash</strong>", "Applies a hash function to a key to place each row.", "Evenly distributing large datasets across partitions.", "Choose high-cardinality columns to minimize data skew.", "One of the most common strategies for parallel processing."],
          ["<strong>Range</strong>", "Groups rows into partitions by value ranges.", "Time-series data, ordered datasets, and analytical queries.", "Carefully define ranges to avoid hotspot partitions.", "Excellent when queries filter by dates or numeric ranges."],
          ["<strong>List</strong>", "Assigns rows by predefined categorical values.", "Country, region, department, status, or business domains.", "Keep category lists manageable and plan for new values.", "Makes partition pruning highly effective for filtered queries."],
          ["<strong>Round-Robin</strong>", "Distributes rows evenly, ignoring key values.", "Fast data loading and balanced write performance.", "Avoid for workloads needing joins or frequent filtering.", "Great for staging layers, rarely ideal for analytics."],
          ["<strong>Composite</strong>", "Combines two strategies, such as Range + Hash.", "Large enterprise data warehouses with diverse workloads.", "Partition by a business filter (like Date), then hash.", "Flexible; improves both query performance and scalability."],
          ["<strong>Dynamic</strong>", "Creates partitions automatically as new values arrive.", "Streaming data, growing datasets, cloud-native platforms.", "Monitor growth to avoid thousands of tiny partitions.", "Perfect for modern data lakes with evolving workloads."]
        ]
      },
      callouts: [
        { color: "blue", label: "Quick rule of thumb:", body: "Filter mostly by <strong>ranges or dates</strong>, reach for Range. Need an <strong>even spread with no hot spots</strong>, reach for Hash. Split by a <strong>fixed set of categories</strong>, use List. Want the two best traits together, <strong>Composite</strong> (range first, then hash) is the enterprise default." }
      ]
    },
    keyRouting: {
      heading: "Choosing the Key and Finding the Partition",
      intro: "Two questions decide day-to-day behavior. <strong>Partition key</strong>: which column decides where a row lives? <strong>Routing</strong>: once a request arrives, how does the system find the partition holding that key? Get the key right and most queries touch one partition; get routing right and they get there in a single hop.",
      table: {
        headers: ["System", "Partition Key", "Why It Works"],
        rows: [
          ["<strong>Discord</strong>", "<code>guild_id</code> (server)", "All of a server's messages live together, so one busy server maps cleanly to one partition."],
          ["<strong>Instagram / Slack</strong>", "<code>user_id</code> / <code>workspace_id</code>", "A user's or workspace's data is co-located, and almost every read is scoped to one of them."],
          ["<strong>Stripe</strong>", "<code>account_id</code> (merchant)", "Each merchant's data is isolated, and queries almost always filter by account."],
          ["<strong>Notion</strong>", "<code>workspace_id</code>", "A workspace's pages and blocks load together from a single partition."],
          ["<strong>URL shortener</strong>", "<code>hash(short_code)</code>", "Lookups are always by code, so hashing spreads them evenly with no hot spot."]
        ]
      },
      tables: [
        {
          headers: ["Routing Model", "How It Works", "Real Systems"],
          rows: [
            ["<strong>Partition-aware client</strong>", "The client library hashes the key and talks straight to the node that owns it, with no extra hop. Fastest, but the client must track topology.", "Cassandra and ScyllaDB token-aware drivers"],
            ["<strong>Routing tier / proxy</strong>", "A stateless router sits in front, computes the target partition, and forwards. Simple clients, one extra hop.", "Vitess VTGate (sharded MySQL), MongoDB <code>mongos</code>, Redis Cluster (<code>MOVED</code> redirect)"],
            ["<strong>Coordinator / any-node</strong>", "The request hits any node, which forwards to the owner and, for multi-partition queries, gathers the results.", "DynamoDB request router, Elasticsearch coordinating node, Cassandra (any node coordinates)"]
          ]
        }
      ],
      callouts: [
        { color: "yellow", label: "Keys that backfire:", body: "<strong>Low-cardinality keys</strong> (status, country, a boolean) pile most rows into one partition, causing severe skew. <strong>Sequential keys</strong> (timestamp, auto-increment ID) send every new write to the newest partition, a moving hot spot. Fix: pick a high-cardinality key, hash it, or use a Composite key (for example date then hash)." },
        { color: "blue", label: "Single-partition vs cross-partition:", body: "A query that filters on the partition key is routed to exactly <strong>one</strong> partition, which is the fast path. A query that does not becomes a <strong>scatter-gather</strong>: the router fans out to every partition and merges, so latency tracks the slowest one. This is the concrete reason the key should match your hottest query." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Splitting",
      intro: "Partitioning buys scale, but the split itself creates new problems.",
      points: [
        { label: "Cross-partition queries are expensive", body: "A query that cannot be pruned to one partition becomes a <strong>scatter-gather</strong> across all of them, then a merge. The Hash strategy\u2019s exact trade-off: even distribution, but no cheap range queries." },
        { label: "Partition-key choice is permanent-feeling", body: "The key decides both pruning and skew. A poor key means queries touch every partition or one partition holds most of the data." },
        { label: "Skew and the hotspot problem", body: "A single viral or sequential key can overload one partition regardless of scheme, needing mitigation beyond the partitioning strategy itself." },
        { label: "DDL complexity", body: "Adding, dropping, or resplitting partitions is heavier operationally than managing one flat table." }
      ]
    },
    pitfalls: {
      heading: "Common Pitfalls and How to Avoid Them",
      intro: "Partitioning done wrong is often slower than not partitioning at all. Five failure modes account for most of the pain, each with a concrete fix.",
      points: [
        { label: "Pitfall 1: Over-partitioning", body: "Too many small partitions hurts performance, since each one carries overhead (metadata, file handles, and so on). A rule of thumb: a partition should hold at least hundreds of thousands of rows. Daily partitions for a table that only gets 1,000 rows a day is over-partitioning. <strong>Solution:</strong> use larger partition windows, weekly or monthly instead of daily. The right size depends on your data volume and query patterns." },
        { label: "Pitfall 2: Missing partition key in queries", body: "If queries do not filter by the partition key, the database must scan every partition, which is slower than a non-partitioned table because of the per-partition overhead. <strong>Solution:</strong> audit your query patterns before partitioning. Use <code>EXPLAIN ANALYZE</code> to verify that queries use partition pruning. If most queries do not benefit, reconsider partitioning or choose a different partition key." },
        { label: "Pitfall 3: Forgetting about maintenance operations", body: "<code>VACUUM</code>, <code>ANALYZE</code>, and <code>REINDEX</code> must run on each partition separately. With 100 partitions, maintenance operations take roughly 100x longer. <strong>Solution:</strong> automate partition-specific maintenance. Schedule <code>VACUUM</code> and <code>ANALYZE</code> for each partition based on its update frequency; old, read-only partitions rarely need it." },
        { label: "Pitfall 4: Inconsistent partition schema", body: "Adding columns or changing indexes on the parent table does not automatically apply to existing partitions in some databases, so schemas drift apart across partitions. <strong>Solution:</strong> use a database that propagates schema changes to partitions (PostgreSQL 11+ does this automatically). For older versions or other engines, keep scripts that apply the change to every partition." },
        { label: "Pitfall 5: Poor shard key distribution in sharding", body: "Hash-based sharding with a weak hash function creates hotspots where some shards take far more traffic than others. <strong>Solution:</strong> use proven hash functions (MurmurHash, CityHash) or the database's built-in sharding features. Monitor shard load distribution and be prepared to reshard if needed." }
      ]
    },
    whenNot: {
      heading: "When NOT to Partition",
      intro: "Partitioning is not always the answer. It adds monitoring, maintenance automation, and operational complexity, so skip it when the payoff is not there. Avoid partitioning if:",
      points: [
        { label: "Your table is small", body: "If the entire table fits comfortably in memory (typically under 10GB), partitioning adds complexity without any real benefit." },
        { label: "Queries do not filter on a consistent column", body: "If different queries filter on different columns, no single partition key will help all of them." },
        { label: "You need complex cross-partition joins", body: "If most queries join data across partitions, partitioning hurts performance by making those joins more expensive." },
        { label: "Your infrastructure is not ready", body: "Partitioning requires more monitoring, maintenance automation, and operational sophistication. If you are still learning basic database administration, master those skills first." }
      ]
    },
    handsOn: {
      goal: "Distribute a table across two Citus workers by <code>hash(customer_id)</code> and watch a filtered query hit one shard while an unfiltered aggregate scatter-gathers across all of them.",
      stack: "Citus (Postgres\u2019s distributed extension) in Docker: one coordinator plus two workers. Local and free.",
      steps: [
        {
          title: "Start a Citus coordinator and two workers",
          body: "All three share one Docker network so the coordinator can reach the workers by name.",
          code: "docker network create citus\ndocker run -d --name coord --net citus -p 5432:5432 -e POSTGRES_PASSWORD=pw citusdata/citus:12.1\ndocker run -d --name w1 --net citus -e POSTGRES_PASSWORD=pw citusdata/citus:12.1\ndocker run -d --name w2 --net citus -e POSTGRES_PASSWORD=pw citusdata/citus:12.1",
          lang: "bash"
        },
        {
          title: "Register the workers with the coordinator",
          code: "sleep 5\ndocker exec coord psql -U postgres -c \"SELECT citus_set_coordinator_host('coord', 5432);\"\ndocker exec coord psql -U postgres -c \"SELECT citus_add_node('w1', 5432);\"\ndocker exec coord psql -U postgres -c \"SELECT citus_add_node('w2', 5432);\"",
          lang: "bash"
        },
        {
          title: "Create a distributed table and seed 10,000 orders",
          body: "Open a shell first with <code>docker exec -it coord psql -U postgres</code>, then run this. <code>create_distributed_table</code> hash-shards on <code>customer_id</code> across both workers.",
          code: "CREATE TABLE orders(id bigserial, customer_id int, order_date date, amount numeric);\nSELECT create_distributed_table('orders', 'customer_id');\nINSERT INTO orders(customer_id, order_date, amount)\nSELECT (random()*100)::int, current_date - (random()*365)::int, (random()*500)::numeric(10,2)\nFROM generate_series(1, 10000);",
          lang: "sql"
        },
        {
          title: "Compare a single-shard read with a scatter-gather",
          body: "The first query filters on the shard key; the second cannot be pruned and must touch every shard.",
          code: "EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;\nEXPLAIN ANALYZE SELECT count(*), avg(amount) FROM orders;",
          lang: "sql"
        }
      ],
      observe: "The <code>customer_id = 42</code> plan shows a single task routed to one worker (<code>Task Count: 1</code>), while the unfiltered aggregate fans out to every shard on both workers and merges the partials. That is the Hash strategy trade-off (even spread and cheap point lookups, but no free cross-key scans) visible in a real query plan.",
      stretch: "Create a second table with native Postgres declarative partitioning by <code>order_date</code>, load a year of rows, and compare: a date-range filter prunes to a few partitions while a filter on a different column (for example <code>customer_id</code>) now scans every partition. The trade-off between the two schemes, felt on data you control."
    }
  },
  keyTakeaways: [
    "Partitioning splits one logical table into physical pieces by a <strong>partition key</strong>, keeping it a single table to the engine while enabling pruning, cheap archival, and parallel scans.",
    "Six strategies trade differently: <strong>Hash</strong> and <strong>Round-Robin</strong> spread evenly; <strong>Range</strong> and <strong>List</strong> keep related rows together for cheap pruning; <strong>Composite</strong> and <strong>Dynamic</strong> combine or auto-create partitions for large, evolving workloads.",
    "The win is <strong>partition pruning</strong>; the cost is <strong>scatter-gather</strong> on any query that cannot be pruned to one partition.",
    "The <strong>partition key</strong> and the <strong>routing model</strong> are the two operational levers: a high-cardinality key matched to your hottest query keeps requests on one partition, and the routing tier (partition-aware client, proxy, or coordinator) decides how many hops it takes to get there."
  ],
  proTip: "Pick the partition key by asking which column your hottest queries filter on. Prune on that column and everything is fast; query any other column and you pay the scatter-gather tax.",
  related: ["distributed-indexing", "sharding", "consistent-hashing", "replication", "partitioning-sharding", "scaling-choice", "bloom-filters"],
  bridgeOut: "Once data is split, finding a row without scanning every partition is the next question. That is distributed indexing."
};
