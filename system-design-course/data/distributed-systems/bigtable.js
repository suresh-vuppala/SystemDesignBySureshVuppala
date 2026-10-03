/* === Lesson bigtable - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#bigtable)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["bigtable"] = {
  module: 11, num: "11.4", title: "BigTable",
  connectsFrom: "GFS provides raw block storage. BigTable is the structured, queryable layer built directly on top of it, and its design is the direct ancestor of Cassandra and HBase.",
  tabs: {
    overview: {
      heading: "Google\u2019s Wide-Column Database",
      intro: "BigTable (Google, 2006) is a <strong>wide-column database</strong>: a sparse, sorted map keyed by <code>(row, column:qualifier, timestamp)</code> \u2192 value. It is sorted by row key, splits into tablets as it grows, and writes through the classic <strong>memtable \u2192 SSTable \u2192 compaction</strong> path.",
      cards: [
        { icon: "R", title: "Sorted by Row Key", color: "purple", body: "Rows are stored in <strong>sorted</strong> order, so range scans over adjacent keys are cheap. Key design decides your access patterns." },
        { icon: "T", title: "Tablets", color: "blue", body: "A contiguous range of rows. Tablets <strong>auto-split</strong> as they grow, which is how BigTable scales horizontally without manual sharding." },
        { icon: "S", title: "LSM Write Path", color: "green", body: "Writes hit an in-memory <strong>memtable</strong>, flush to immutable <strong>SSTables</strong>, and are merged later by <strong>compaction</strong>: fast writes, background cleanup." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Sorted by row key</strong>. <strong>Tablets</strong> auto-split on size. Storage path: memtable \u2192 SSTable \u2192 compaction. Dependencies: GFS + Chubby. Influenced: <strong>HBase</strong>, <strong>Cassandra</strong>, <strong>Cloud Bigtable</strong>." }
      ]
    },
    realWorld: {
      heading: "The Lineage",
      points: [
        { label: "Built on GFS + Chubby", body: "BigTable stores its SSTables in GFS and uses Chubby (Google\u2019s lock service, ZooKeeper\u2019s ancestor) for master election and metadata. It is a layered system, not a monolith." },
        { label: "HBase", body: "The open-source BigTable clone in the Hadoop ecosystem, running its tablets (regions) on top of HDFS." },
        { label: "Cassandra", body: "Took BigTable\u2019s data model and married it to Dynamo\u2019s leaderless replication, giving the wide-column model without a single master." }
      ]
    },
    handsOn: {
      goal: "Watch the BigTable-lineage LSM write path (memtable to SSTable to compaction) happen on disk using Cassandra.",
      stack: "A single Cassandra node in Docker, inspected with <code>cqlsh</code> and <code>nodetool</code>. Local and free.",
      steps: [
        {
          title: "Start a single Cassandra node",
          body: "Give it a minute to finish booting before the next step.",
          code: "docker run -d --name cass -p 9042:9042 cassandra",
          lang: "bash"
        },
        {
          title: "Create a wide-column table",
          code: "docker exec -it cass cqlsh -e \"CREATE KEYSPACE lab WITH replication={'class':'SimpleStrategy','replication_factor':1}; CREATE TABLE lab.events (id int PRIMARY KEY, payload text);\"",
          lang: "bash"
        },
        {
          title: "Write 10,000 rows",
          body: "Generate the inserts, copy them in, and run them so the writes land in the in-memory memtable.",
          code: "for i in $(seq 1 10000); do echo \"INSERT INTO lab.events (id,payload) VALUES ($i,'row-$i');\"; done > load.cql\ndocker cp load.cql cass:/load.cql\ndocker exec -it cass cqlsh -f /load.cql",
          lang: "bash"
        },
        {
          title: "Flush the memtable to an SSTable",
          body: "Check the stats before and after: the flush turns buffered writes into an immutable SSTable on disk.",
          code: "docker exec cass nodetool tablestats lab.events\ndocker exec cass nodetool flush lab events\ndocker exec cass nodetool tablestats lab.events",
          lang: "bash"
        },
        {
          title: "Trigger compaction and compare",
          code: "docker exec cass nodetool compact lab events\ndocker exec cass nodetool tablestats lab.events",
          lang: "bash"
        }
      ],
      observe: "The exact write path happening on disk in front of you: writes buffer in the memtable, <code>flush</code> materializes an immutable SSTable, and <code>compact</code> merges SSTables and drops the SSTable count, on a system directly descended from BigTable's design.",
      stretch: "Write another batch and <code>flush</code> again before compacting, so multiple SSTables coexist. Then run <code>nodetool compact</code> and watch several SSTables merge back into one."
    }
  },
  keyTakeaways: [
    "BigTable is a <strong>sparse, sorted, wide-column map</strong> keyed by (row, column:qualifier, timestamp), sorted by row key so range scans are cheap.",
    "It scales by <strong>auto-splitting tablets</strong> and writes via the <strong>LSM path</strong> (memtable \u2192 SSTable \u2192 compaction), the same internals Storage builds from first principles.",
    "It is a layered system (GFS for storage, Chubby for coordination) and the direct design ancestor of HBase and Cassandra."
  ],
  proTip: "In any wide-column store, the row key is the whole game: it decides sort order, scan locality, and hot spots. Design it from your read patterns backward, never as an afterthought.",
  related: ["gfs-hdfs", "zookeeper", "lsm-storage", "replication-strategies", "partitioning-sharding"],
  bridgeOut: "BigTable\u2019s LSM write path is a real-world instance of the storage internals built earlier. Next, a shift from storing data to keeping services alive: fault tolerance and reliability."
};
