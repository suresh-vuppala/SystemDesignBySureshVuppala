/* === Lesson partitioning-sharding - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#partitioning)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.11.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["partitioning-sharding"] = {
  module: 11, num: "11.11", title: "Partitioning & Sharding",
  connectsFrom: "Scalability covered the operational \u201chow\u201d of splitting data across nodes. This adds the theory on top: rebalancing math, the cost of scatter-gather queries, and how secondary indexes work once data is partitioned.",
  tabs: {
    overview: {
      heading: "Split Data to Scale Past One Machine",
      intro: "Partitioning splits data across nodes to scale beyond a single machine. The two goals in tension are <strong>even distribution</strong> (no hot partition) and <strong>efficient queries</strong> (avoid touching every partition). How you rebalance as the cluster grows is the crux.",
      cards: [
        { icon: "H", title: "Hash Partitioning", color: "blue", body: "<code>hash(key) % N</code> spreads keys evenly, but changing N rehashes almost everything, which is why naive modulo hashing hurts on scale-out." },
        { icon: "C", title: "Consistent Hashing", color: "green", body: "Hash keys and servers onto a ring. Adding or removing a node moves only <strong>~1/N of keys</strong>, not all of them. Cassandra, DynamoDB, Memcached." },
        { icon: "V", title: "Virtual Nodes", color: "purple", body: "Each physical server maps to <strong>100-256 vnodes</strong> on the ring, which smooths out distribution and makes rebalancing even." }
      ],
      table: {
        headers: ["Strategy", "How", "Pros", "Cons", "Used By"],
        rows: [
          ["<strong>Fixed Partitions</strong>", "Create many more partitions than nodes (e.g. 1000 partitions, 10 nodes), assign partitions to nodes", "Simple rebalancing (move whole partitions)", "Must choose partition count upfront: too few = large partitions, too many = overhead", "Riak, Elasticsearch, Couchbase"],
          ["<strong>Dynamic Splitting</strong>", "Start with 1 partition per node; split when too large, merge when too small", "Adapts to data size, no upfront decision", "Complex split/merge coordination", "HBase, RethinkDB, MongoDB"],
          ["<strong>Proportional to Nodes</strong>", "Fixed number of partitions per node; a new node steals random partitions from existing nodes", "Balanced as the cluster grows", "Random splits can create uneven sizes", "Cassandra (vnodes)"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Scatter-gather pattern:", body: "A query spanning multiple partitions <strong>scatters</strong> (the coordinator sends it to all relevant partitions in parallel) then <strong>gathers</strong> (collects, merges, sorts, returns). The problem is <strong>tail latency</strong>: response time equals the slowest partition. Mitigation: hedged requests (send to multiple replicas, use the first response)." },
        { color: "green", label: "Secondary indexes on partitioned data:", body: "<strong>Local index</strong> (document-partitioned): each partition indexes its own docs, so writes are fast (single partition) but reads need scatter-gather (DynamoDB). <strong>Global index</strong> (term-partitioned): the index is partitioned by term, so reads hit one partition but writes must update multiple index partitions asynchronously (Elasticsearch)." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Spreading Data Out",
      intro: "Partitioning scales writes and storage, but queries and indexes pay for it.",
      points: [
        { label: "Tail latency dominates scatter-gather", body: "A query that fans out to every shard is only as fast as the slowest shard, not the average. Adding shards beyond what the data needs adds coordination overhead and more chances for a slow participant." },
        { label: "Local vs global index is a read/write trade", body: "Local (document-partitioned) indexes make writes cheap and reads expensive (scatter-gather); global (term-partitioned) indexes flip it, cheap single-partition reads but async multi-partition writes that are eventually consistent." },
        { label: "Consistent hashing vs modulo", body: "Modulo hashing is simple until you add a node, at which point nearly all keys move. Consistent hashing plus vnodes moves only ~1/N of keys, which is why every elastic datastore uses it." }
      ]
    },
    handsOn: {
      goal: "Index 50,000 documents across 5 shards and prove a scatter-gather query fans out to every shard and pays the slowest one.",
      stack: "A single-node Elasticsearch in Docker, queried with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Start Elasticsearch",
          code: "docker run -d --name es -p 9200:9200 -e discovery.type=single-node -e xpack.security.enabled=false docker.elastic.co/elasticsearch/elasticsearch:8.13.4",
          lang: "bash"
        },
        {
          title: "Create an index with 5 shards",
          code: "curl -s -X PUT localhost:9200/lab -H 'Content-Type: application/json' -d '{\"settings\":{\"number_of_shards\":5,\"number_of_replicas\":0}}'",
          lang: "bash"
        },
        {
          title: "Bulk-index 50,000 documents",
          code: "for i in $(seq 1 50000); do echo '{\"index\":{}}'; echo \"{\\\"msg\\\":\\\"event $i\\\"}\"; done > bulk.ndjson\ncurl -s -X POST 'localhost:9200/lab/_bulk' -H 'Content-Type: application/x-ndjson' --data-binary @bulk.ndjson > /dev/null\ncurl -s -X POST 'localhost:9200/lab/_refresh'",
          lang: "bash"
        },
        {
          title: "Run a query that touches every shard",
          body: "Read the <code>_shards</code> block (total and successful) and the <code>took</code> time from the response.",
          code: "curl -s 'localhost:9200/lab/_search?search_type=query_then_fetch' -H 'Content-Type: application/json' -d '{\"query\":{\"match\":{\"msg\":\"event\"}}}' | python -m json.tool | grep -E 'took|total|successful'",
          lang: "bash"
        },
        {
          title: "Throttle the node and rerun",
          body: "Starving CPU makes the scatter-gather slower and lets you watch tail latency dominate.",
          code: "docker update --cpus 0.2 es\ncurl -s 'localhost:9200/lab/_search' -H 'Content-Type: application/json' -d '{\"query\":{\"match\":{\"msg\":\"event\"}}}' | python -m json.tool | grep took",
          lang: "bash"
        }
      ],
      observe: "The <code>_shards.total</code> is 5, so every query fans out to all 5 shards and waits for the slowest to return before merging. Under a throttled node the <code>took</code> time climbs, showing latency track the slowest participant, not the average. On a real multi-node cluster you throttle a single shard's node to isolate one slow shard.",
      stretch: "Compare the same query's <code>took</code> time at 1 shard versus 5 shards for the same document count, to see scatter-gather coordination overhead grow as shard count rises beyond what the data needs."
    }
  },
  keyTakeaways: [
    "Partitioning trades single-machine limits for two new problems: keeping distribution <strong>even</strong> and keeping queries <strong>efficient</strong>.",
    "Rebalancing strategy matters: <strong>fixed partitions</strong> (simple, upfront count), <strong>dynamic splitting</strong> (adaptive, complex), <strong>proportional</strong> (vnodes, balanced growth); consistent hashing moves only <strong>~1/N of keys</strong> on membership change.",
    "Cross-partition queries pay <strong>tail latency</strong> (slowest shard wins), and secondary indexes force a choice between local (fast writes) and global (fast reads)."
  ],
  proTip: "The partition key is the whole design. A key that clumps requests onto one shard creates a hot partition that no amount of extra nodes will fix, so choose it from your access patterns, not your data model.",
  related: ["partitioning", "sharding", "consistent-hashing", "replication-strategies", "clocks", "dist-patterns", "failure-detection", "bigtable", "distributed-indexing"],
  bridgeOut: "Leader election assumed \u201cfollowers detect a missing heartbeat\u201d as a simple fact. The last lesson in this module is the honest treatment of how hard that detection actually is: failure detection."
};
