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
      goal: "Compute revenue per product category over 1M rows with PySpark, watch the Map/Shuffle/Reduce stages in the Spark UI, and feel it against single-threaded pandas.",
      stack: "PySpark (a local Spark session, no cluster) plus pandas, in Python. Local and free.",
      steps: [
        {
          title: "Install Spark and pandas",
          code: "pip install pyspark pandas",
          lang: "bash"
        },
        {
          title: "Generate 1M synthetic order rows",
          body: "Save as <code>gen_data.py</code> and run it once to produce <code>orders.csv</code>.",
          code: "import csv, random\ncats = [\"books\", \"toys\", \"food\", \"tools\", \"games\"]\nwith open(\"orders.csv\", \"w\", newline=\"\") as f:\n    w = csv.writer(f)\n    w.writerow([\"id\", \"category\", \"revenue\"])\n    for i in range(1_000_000):\n        w.writerow([i, random.choice(cats), round(random.random() * 100, 2)])\nprint(\"wrote orders.csv\")",
          lang: "python"
        },
        {
          title: "Aggregate with PySpark and time it",
          body: "The <code>groupBy</code> is a Map -&gt; Shuffle -&gt; Reduce under the hood. Save as <code>spark_job.py</code>.",
          code: "import time\nfrom pyspark.sql import SparkSession\nfrom pyspark.sql.functions import sum as _sum\n\nspark = SparkSession.builder.appName(\"revenue-by-category\").master(\"local[*]\").getOrCreate()\ndf = spark.read.option(\"header\", True).option(\"inferSchema\", True).csv(\"orders.csv\")\n\nt = time.time()\ndf.groupBy(\"category\").agg(_sum(\"revenue\").alias(\"revenue\")).show()\nprint(\"spark seconds:\", round(time.time() - t, 2))\n\ninput(\"Spark UI is at http://localhost:4040 - press Enter to exit\")\nspark.stop()",
          lang: "python"
        },
        {
          title: "Do the same single-threaded with pandas and time it",
          body: "Save as <code>pandas_job.py</code>.",
          code: "import time, pandas as pd\nt = time.time()\ndf = pd.read_csv(\"orders.csv\")\nprint(df.groupby(\"category\")[\"revenue\"].sum())\nprint(\"pandas seconds:\", round(time.time() - t, 2))",
          lang: "python"
        },
        {
          title: "Run all three and compare",
          code: "python gen_data.py\npython spark_job.py\npython pandas_job.py",
          lang: "bash"
        }
      ],
      observe: "While <code>spark_job.py</code> waits at the prompt, open <code>http://localhost:4040</code>: the job splits into stages with the shuffle step shown explicitly. Depending on your machine's core count, Spark outperforms the single-threaded pandas run on the larger dataset, a felt version of a parallel, in-memory DAG.",
      stretch: "Rerun the aggregation as an iterative computation (say 10 times against the same data) and compare Spark's in-memory caching (<code>df.cache()</code>) against re-reading from disk each pass: the roughly 100\u00d7 faster for iterative workloads claim, measured on your own hardware."
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
