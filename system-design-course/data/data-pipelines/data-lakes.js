/* === Lesson data-lakes - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#data-lakes)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["data-lakes"] = {
  module: 12, num: "12.6", title: "Data Lakes & Lakehouse",
  connectsFrom: "A warehouse requires structured, transformed data. A data lake is for everything that has not been transformed yet, or never fully will be: raw files kept cheaply on object storage until you decide what to do with them.",
  tabs: {
    overview: {
      heading: "Raw Files On Cheap Storage, Plus ACID",
      intro: "A <strong>data lake</strong> is raw files on cheap object storage (S3/GCS). A <strong>lakehouse</strong> adds warehouse features on top: <strong>ACID transactions</strong> and <strong>time travel</strong> via Delta Lake, Iceberg, or Hudi. It combines the lake\u2019s low cost with the warehouse\u2019s reliability.",
      cards: [
        { icon: "R", title: "Data Lake", color: "blue", body: "Raw files on <strong>S3/GCS</strong>. Cheap and schema-on-read: store anything now, decide the structure later." },
        { icon: "H", title: "Lakehouse", color: "green", body: "Lake (cheap) plus warehouse (<strong>ACID</strong>). <strong>Delta Lake, Iceberg, Hudi</strong> add transactions and <strong>time travel</strong> over the same files." },
        { icon: "P", title: "Parquet", color: "purple", body: "Column-oriented, compressed, splittable. The most popular format (ORC is the alternative), roughly <strong>10x smaller than CSV</strong>." }
      ],
      table: {
        headers: ["", "Data Lake", "Lakehouse"],
        rows: [
          ["<strong>Storage</strong>", "Raw files on S3/GCS", "Same files, plus a transaction layer"],
          ["<strong>ACID</strong>", "No", "Yes (Delta Lake, Iceberg, Hudi)"],
          ["<strong>Time travel</strong>", "No", "Yes, query the table as of an earlier version"]
        ]
      },
      callouts: [
        { color: "blue", label: "Columnar Formats:", body: "<strong>Parquet</strong> (most popular), ORC. Column-oriented, compressed, and splittable, roughly 10x smaller than CSV." }
      ]
    },
    tradeoffs: {
      heading: "Lake, Warehouse, or Lakehouse",
      intro: "The three storage layers trade cost, structure, and guarantees against each other.",
      points: [
        { label: "Cheap and flexible vs governed", body: "A raw lake is the cheapest place to keep data and imposes no schema up front, but that same freedom lets it rot into a <strong>data swamp</strong> without cataloging and quality checks." },
        { label: "Why the lakehouse exists", body: "A plain lake has no <strong>ACID</strong> guarantees, so concurrent writes and partial failures can corrupt a table. Delta Lake, Iceberg, and Hudi add a transaction log that brings ACID and time travel to lake files." },
        { label: "File format matters", body: "CSV is row-oriented, uncompressed, and slow to scan. <strong>Parquet</strong> is columnar, compressed, and splittable, roughly 10x smaller, so column-selective reads move far less data." }
      ]
    },
    handsOn: {
      prerequisites: "Python (<code>pyarrow</code>, <code>pandas</code>); MinIO or an S3 free tier for the lake storage.",
      setup: "Local and free: MinIO (<code>docker run -d -p 9000:9000 minio/minio server /data</code>) as an S3-compatible bucket.",
      simulate: "Write your 1M-row orders dataset as both a CSV and a Parquet file, upload both to your MinIO bucket, and compare file sizes. Query just 2 columns out of 20 from each format using <code>pyarrow</code> (which reads Parquet column-by-column without loading the whole file) versus <code>pandas.read_csv</code> (which must parse every column).",
      observe: "The Parquet file lands roughly 10x smaller than the CSV, and the column-selective Parquet read finishes noticeably faster than the CSV read that parses columns you do not even want. Put your own numbers next to the roughly 10x smaller than CSV claim.",
      stretch: "Install Delta Lake or Iceberg locally (both have free, pip/Docker-installable versions), write the same data as a Delta table, update a few rows, then use time travel to query the table as of the version before your update: a lakehouse feature a plain Parquet-on-S3 setup does not have."
    }
  },
  keyTakeaways: [
    "A <strong>data lake</strong> stores raw files cheaply on object storage; a <strong>lakehouse</strong> adds <strong>ACID</strong> and <strong>time travel</strong> on top via Delta Lake, Iceberg, or Hudi.",
    "<strong>Parquet</strong> is the columnar workhorse: compressed, splittable, and roughly 10x smaller than CSV, so column-selective reads are cheap.",
    "Freedom is the risk: without cataloging and quality checks, a lake degrades into an unqueryable data swamp."
  ],
  proTip: "Store lake data as Parquet, not CSV, from day one. You get columnar reads and roughly 10x compression for free, and a lakehouse format on top adds ACID and time travel without moving off cheap object storage.",
  related: ["data-warehouse", "etl", "batch-processing", "data-quality", "data-lineage"],
  bridgeOut: "Storage is settled, but every pipeline so far assumed the data flowing through it is trustworthy. Next: the explicit gate that checks that assumption, with Data Quality."
};
