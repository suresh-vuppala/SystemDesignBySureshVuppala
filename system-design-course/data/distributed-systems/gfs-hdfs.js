/* === Lesson gfs-hdfs - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#gfs-hdfs)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["gfs-hdfs"] = {
  module: 11, num: "11.3", title: "GFS & HDFS",
  connectsFrom: "ZooKeeper coordinates metadata; GFS and HDFS are what actually store the bulk data those coordinators point at. This is the storage layer under the entire big-data stack.",
  tabs: {
    overview: {
      heading: "Foundational Distributed File Systems",
      intro: "<strong>GFS</strong> (Google, 2003) directly inspired <strong>HDFS</strong> (Hadoop\u2019s file system). Both split huge files into <strong>large blocks</strong>, replicate each block 3 times rack-aware, and checksum everything, trading fine-grained random access for massive sequential throughput.",
      cards: [
        { icon: "M", title: "Single Master", color: "purple", body: "One master (GFS) / NameNode (HDFS) holds all metadata; chunkservers / DataNodes hold the actual bytes. Large blocks keep the metadata small enough to fit in memory." },
        { icon: "3", title: "3 Replicas", color: "green", body: "Every block is stored on <strong>3 nodes</strong>, placed <strong>rack-aware</strong> so a whole rack can fail without data loss." },
        { icon: "C", title: "Checksums", color: "blue", body: "Every block carries a checksum verified on read, so silent disk corruption is caught and repaired from a good replica." }
      ],
      table: {
        headers: ["", "GFS", "HDFS"],
        rows: [
          ["<strong>Architecture</strong>", "Single Master + ChunkServers", "NameNode + DataNodes"],
          ["<strong>Block Size</strong>", "64MB chunks", "128MB blocks"],
          ["<strong>Replication</strong>", "3 replicas, rack-aware", "3 replicas, rack-aware"],
          ["<strong>Write</strong>", "Pipeline to ChunkServers", "Pipeline to DataNodes"],
          ["<strong>Consistency</strong>", "Relaxed (at-least-once appends)", "Write-once-read-many"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Fault tolerance</strong> via replication plus checksums. <strong>High throughput</strong> for sequential reads. GFS evolved into Colossus; HDFS is the foundation of the Hadoop ecosystem." }
      ]
    },
    tradeoffs: {
      heading: "What the Design Buys and Costs",
      intro: "The large-block, single-master design is a deliberate set of trade-offs.",
      points: [
        { label: "Large blocks minimize metadata", body: "64MB/128MB blocks mean one file is a handful of entries, not millions, so the master can hold all metadata in memory. The cost: these systems are terrible at many tiny files." },
        { label: "Sequential over random", body: "Throughput for big sequential scans is excellent; small random reads and in-place edits are not what these systems are for. HDFS is explicitly write-once-read-many." },
        { label: "Relaxed vs strict consistency", body: "GFS accepts at-least-once record appends (a record can appear more than once, applications dedupe), while HDFS keeps it simpler by forbidding rewrites entirely." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (a single-node Hadoop/HDFS image; several free ones exist, e.g. `apache/hadoop`).",
      setup: "Local and free: a single-node HDFS via Docker.",
      simulate: "Upload a file larger than the configured block size (lower it to something small like 1MB for the lab, via `dfs.blocksize`, so you can see splitting without a huge file) and run `hdfs fsck /yourfile -files -blocks` to see it split into multiple blocks. Check the replication factor with `hdfs dfsadmin -report`.",
      observe: "One logical file represented as several fixed-size blocks under the hood, each with its own replica count: the large-block, metadata-minimizing design seen directly in `fsck` output instead of taken as a claim.",
      stretch: "None. A true multi-DataNode HDFS cluster with rack awareness needs more nodes than a single laptop comfortably runs; this lab demonstrates the block and replication concept at single-node scale."
    }
  },
  keyTakeaways: [
    "GFS (2003) inspired HDFS: both use a <strong>single metadata master</strong> plus many data nodes, with large blocks (64MB/128MB) chosen specifically to keep metadata small.",
    "Durability comes from <strong>3 rack-aware replicas plus checksums</strong>, so both a disk failing and a disk silently corrupting are survivable.",
    "They optimize for <strong>sequential throughput</strong>, not tiny files or random writes; HDFS is write-once-read-many, GFS uses relaxed at-least-once appends."
  ],
  proTip: "The \u201cmany small files\u201d problem is the classic HDFS footgun: each file eats a NameNode metadata slot regardless of size. If your data is millions of tiny objects, pack them into large files or use a different store.",
  related: ["bigtable", "zookeeper", "data-redundancy", "lsm-storage", "replication-strategies"],
  bridgeOut: "BigTable was built directly on top of GFS: the very next layer up this same stack, turning raw blocks into a structured, queryable database."
};
