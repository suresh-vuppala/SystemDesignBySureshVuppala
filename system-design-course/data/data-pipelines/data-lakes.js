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
      goal: "Write a 20-column, 1M-row dataset to a MinIO bucket as both CSV and Parquet, then prove Parquet is far smaller and that reading 2 columns out of 20 is much cheaper.",
      stack: "MinIO (S3-compatible object store) in Docker + Python (pandas, pyarrow, s3fs). Local and free.",
      steps: [
        {
          title: "Start MinIO as an S3-compatible bucket store",
          code: "docker run -d --name minio -p 9000:9000 -p 9001:9001 \\\n  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \\\n  minio/minio server /data --console-address \":9001\"",
          lang: "bash"
        },
        {
          title: "Install the Python client libraries",
          code: "pip install pandas pyarrow s3fs",
          lang: "bash"
        },
        {
          title: "Write the same data as CSV and Parquet",
          body: "18 filler columns plus <code>category</code> and <code>revenue</code>, uploaded straight to the lake bucket. Save as <code>write_lake.py</code>.",
          code: "import numpy as np, pandas as pd, s3fs\n\nstorage = {\"key\": \"minioadmin\", \"secret\": \"minioadmin\",\n           \"client_kwargs\": {\"endpoint_url\": \"http://localhost:9000\"}}\nfs = s3fs.S3FileSystem(**storage)\nif not fs.exists(\"lake\"):\n    fs.mkdir(\"lake\")\n\nn = 1_000_000\ndf = pd.DataFrame({f\"col{i}\": np.random.rand(n) for i in range(18)})\ndf[\"category\"] = np.random.choice([\"books\", \"toys\", \"food\"], n)\ndf[\"revenue\"] = np.random.rand(n) * 100\n\ndf.to_csv(\"s3://lake/orders.csv\", index=False, storage_options=storage)\ndf.to_parquet(\"s3://lake/orders.parquet\", index=False, storage_options=storage)\nprint(\"uploaded both\")",
          lang: "python"
        },
        {
          title: "Compare sizes and time a 2-column read of each",
          body: "Parquet reads only the 2 column chunks it needs; CSV must scan every row. Save as <code>compare.py</code>.",
          code: "import time, pandas as pd, s3fs\n\nstorage = {\"key\": \"minioadmin\", \"secret\": \"minioadmin\",\n           \"client_kwargs\": {\"endpoint_url\": \"http://localhost:9000\"}}\nfs = s3fs.S3FileSystem(**storage)\nprint(\"csv bytes    :\", fs.info(\"lake/orders.csv\")[\"size\"])\nprint(\"parquet bytes:\", fs.info(\"lake/orders.parquet\")[\"size\"])\n\nt = time.time()\npd.read_csv(\"s3://lake/orders.csv\", usecols=[\"category\", \"revenue\"], storage_options=storage)\nprint(\"csv 2-col read    :\", round(time.time() - t, 2))\n\nt = time.time()\npd.read_parquet(\"s3://lake/orders.parquet\", columns=[\"category\", \"revenue\"], storage_options=storage)\nprint(\"parquet 2-col read:\", round(time.time() - t, 2))",
          lang: "python"
        },
        {
          title: "Run both scripts",
          code: "python write_lake.py\npython compare.py",
          lang: "bash"
        }
      ],
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
