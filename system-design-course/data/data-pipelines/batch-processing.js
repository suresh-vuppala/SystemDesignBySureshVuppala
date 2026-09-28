/* === Lesson batch-processing - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#batch-processing)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["batch-processing"] = {
  module: 12, num: "12.4", title: "Batch Processing",
  connectsFrom: "Lambda Architecture\u2019s speed layer was Stream Processing. This is the other half: process <strong>large datasets</strong> accurately in scheduled jobs, collecting the data first and processing it later.",
  tabs: {
    overview: {
      heading: "Collect First, Process On A Schedule",
      intro: "Batch jobs run on a schedule (hourly, daily, weekly) over a <strong>bounded</strong> dataset, trading latency (<strong>minutes to hours</strong>) for accuracy and throughput. The shape is MapReduce; the modern engine is Spark, which keeps that shape but runs it as an in-memory DAG, roughly <strong>100\u00d7 faster</strong> for iterative workloads.",
      cards: [
        { icon: "M", title: "Map", color: "blue", body: "<strong>Parallel transform</strong>. Each worker processes its own slice of the input independently, with no coordination." },
        { icon: "S", title: "Shuffle", color: "orange", body: "<strong>Group by key</strong>. Records with the same key are moved to the same reducer. This is the expensive, network-heavy step." },
        { icon: "R", title: "Reduce", color: "green", body: "<strong>Aggregate</strong> each key\u2019s grouped records into the final result (sums, counts, joins)." }
      ],
      table: {
        headers: ["Aspect", "Stream Processing", "Batch Processing"],
        rows: [
          ["<strong>When</strong>", "As data arrives (continuous)", "Scheduled (hourly/daily/weekly)"],
          ["<strong>Latency</strong>", "<strong>ms to seconds</strong>", "minutes to hours"],
          ["<strong>Data</strong>", "Unbounded (infinite stream)", "Bounded (fixed dataset)"],
          ["<strong>State</strong>", "In-memory (RocksDB, checkpoints)", "Disk (HDFS, S3)"],
          ["<strong>Use Case</strong>", "Fraud detection, surge pricing, alerts", "Reports, ML training, ETL, analytics"],
          ["<strong>Tools</strong>", "Flink, Kafka Streams, Spark Streaming", "Spark, MapReduce, Hive, Presto"]
        ]
      },
      callouts: [
        { color: "blue", label: "Lambda vs Kappa:", body: "<strong>Lambda Architecture</strong>: run <strong>both</strong>, batch for accuracy (recompute everything) and stream for speed (approximate, real-time), merged in a serving layer. <strong>Kappa Architecture</strong>: <strong>stream only</strong>, replay the Kafka log for reprocessing instead of a separate batch job. Simpler, but needs durable stream retention." }
      ]
    },
    realWorld: {
      heading: "Where Batch Runs",
      points: [
        { label: "Netflix", body: "A nightly Spark job processes petabytes of viewing data to power \u201cBecause you watched.\u201d" },
        { label: "Spotify", body: "A daily batch aggregates all listening history to generate Discover Weekly." },
        { label: "Uber", body: "An end-of-day batch calculates driver earnings, trip summaries, and tax reports." },
        { label: "Banks", body: "A nightly batch reconciles all transactions and generates statements and fraud reports." }
      ]
    },
    tradeoffs: {
      heading: "Batch vs Stream",
      intro: "Batch and stream sit at opposite ends of the same latency-versus-accuracy axis.",
      points: [
        { label: "Latency vs completeness", body: "Batch waits until the dataset is complete, then computes exact results, at the cost of <strong>minutes to hours</strong> of delay. Stream answers in <strong>ms to seconds</strong> but over an incomplete, still-arriving view." },
        { label: "Bounded vs unbounded", body: "Batch operates on a <strong>fixed dataset</strong> read from disk (HDFS, S3); stream operates on an <strong>infinite</strong> flow held in checkpointed memory. That shapes how each handles state and failure recovery." },
        { label: "The shuffle is the bottleneck", body: "Map and reduce parallelize cleanly, but the shuffle moves data across the network to group by key. Skewed keys create hot reducers and dominate job time." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (a single-node Spark image, free); Python (<code>pyspark</code>).",
      setup: "Local and free: <code>docker run -d bitnami/spark</code> (single-node) or <code>pip install pyspark</code> for a local Spark session with no cluster at all.",
      simulate: "Generate 1M synthetic order rows as a CSV, then write a PySpark job computing total revenue per product category (a groupBy/aggregate: the Map/Shuffle/Reduce shape happening under the hood). Time it, then write the equivalent as plain single-threaded Python (<code>pandas</code> or a manual loop) and time that too.",
      observe: "Spark\u2019s job splits into stages visible in its Web UI (<code>localhost:4040</code>), showing the shuffle step explicitly, and depending on your machine\u2019s core count it outperforms the single-threaded version on the larger dataset: a felt version of a parallel, in-memory DAG.",
      stretch: "Rerun the same aggregation as an iterative computation (for example 10 times against cached data) and compare Spark\u2019s in-memory caching (<code>.cache()</code>) against re-reading from disk each time: the roughly 100\u00d7 faster for iterative workloads claim, measured on your own hardware."
    }
  },
  keyTakeaways: [
    "Batch processes a <strong>bounded</strong> dataset on a schedule, trading <strong>minutes to hours</strong> of latency for accuracy and high throughput.",
    "The <strong>Map \u2192 Shuffle \u2192 Reduce</strong> shape from MapReduce lives on in Spark, which runs it as an in-memory DAG that is roughly <strong>100\u00d7 faster</strong> for iterative work.",
    "Stream and batch are the two halves of Lambda; Kappa collapses them into one stream-only path by replaying a durable log."
  ],
  proTip: "Watch the shuffle. Map and reduce scale with cores, but the shuffle moves data across the network to group by key, so a skewed key turns into a single hot reducer that dominates the whole job\u2019s runtime.",
  related: ["stream-processing", "etl", "data-warehouse", "data-lakes", "cdc"],
  bridgeOut: "Batch output needs somewhere to land for analysis. Next: the destination those jobs write to, the Data Warehouse."
};
