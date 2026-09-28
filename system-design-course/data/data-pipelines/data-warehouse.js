/* === Lesson data-warehouse - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#data-warehouse)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["data-warehouse"] = {
  module: 12, num: "12.5", title: "Data Warehouse",
  connectsFrom: "Batch jobs need somewhere to land their output for analysis. A data warehouse is that destination: an OLAP store tuned for fast aggregations over huge tables, not for the transactional reads and writes that run the business.",
  tabs: {
    overview: {
      heading: "Columnar OLAP For Fast Aggregations",
      intro: "A data warehouse is an <strong>OLAP</strong> store built on <strong>columnar storage</strong>, so an aggregate like <code>SUM(revenue)</code> reads only the revenue column and skips every other one. That access pattern enables roughly <strong>10:1 compression</strong> and fast scans. BigQuery, Snowflake, and ClickHouse are the common engines.",
      cards: [
        { icon: "C", title: "Columnar Storage", color: "purple", body: "Data is stored by column, not by row. <code>SUM(revenue)</code> reads only that column and skips the rest, which is why analytical scans are fast." },
        { icon: "Z", title: "Compression", color: "green", body: "Similar values sit together within a column, giving roughly <strong>10:1 compression</strong> and far less disk read per query." },
        { icon: "A", title: "OLAP Engines", color: "blue", body: "<strong>BigQuery</strong>, <strong>Snowflake</strong>, and <strong>ClickHouse</strong>: purpose-built for aggregation across huge tables, not point lookups." }
      ],
      table: {
        headers: ["", "OLTP", "OLAP"],
        rows: [
          ["<strong>Purpose</strong>", "Runs the business (transactional)", "Analyzes the business (analytical)"],
          ["<strong>Storage</strong>", "Row-oriented", "Columnar"],
          ["<strong>Query shape</strong>", "Point reads and writes on few rows", "Aggregates over many rows, few columns"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantee:", body: "<strong>Columnar storage</strong> reads only the needed columns, so <code>SUM(revenue)</code> skips all other columns and enables <strong>10:1 compression</strong>. <strong>OLTP</strong> runs the business (transactional); <strong>OLAP</strong> analyzes the business (analytical)." }
      ]
    },
    tradeoffs: {
      heading: "OLTP vs OLAP: Opposite Access Patterns",
      intro: "The warehouse wins on analytics precisely because it is bad at what an OLTP database is good at.",
      points: [
        { label: "Columnar helps aggregates, not lookups", body: "A query touching few columns over many rows flies, because it never reads columns it does not need. A <code>SELECT *</code> that needs every column erases most of that advantage." },
        { label: "Do not run analytics on production OLTP", body: "OLTP is row-oriented and tuned for point reads and writes. Heavy analytical scans there compete with live traffic, which is why analytics moves to a separate OLAP store." },
        { label: "Freshness lag", body: "The warehouse is loaded by batch or CDC, so its data is as fresh as the last load. Sub-second freshness needs a real-time analytics store instead." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (ClickHouse\u2019s official free image); or BigQuery\u2019s free-tier sandbox (no credit card required for sandbox mode).",
      setup: "Local and free: <code>docker run -d -p 8123:8123 clickhouse/clickhouse-server</code>.",
      simulate: "Load the same 1M-row orders dataset from 12.4 into both a row-store (Postgres) and ClickHouse (columnar). Run <code>SELECT category, SUM(revenue) FROM orders GROUP BY category</code> against both and compare execution time, especially as you widen the table (add 20 more unused columns to both and rerun).",
      observe: "Postgres\u2019s query time grows as you add more unused columns, since a row-store still reads full rows, while ClickHouse\u2019s time for the same aggregate stays essentially flat: it never reads the columns the query does not need. Check disk usage on both for the same data too, for the 10:1 compression claim.",
      stretch: "Run a <code>SELECT *</code> (needs every column) against both and note that ClickHouse\u2019s advantage shrinks or disappears. Columnar storage helps aggregate queries touching few columns, not full-row lookups: the exact opposite access pattern from OLTP."
    }
  },
  keyTakeaways: [
    "A data warehouse is an <strong>OLAP</strong> store on <strong>columnar storage</strong>: it reads only the columns a query needs, so aggregates are fast and compression is roughly 10:1.",
    "<strong>OLTP runs the business, OLAP analyzes it</strong>: opposite access patterns, which is why you never run heavy analytics against a production transactional database.",
    "Columnar wins on aggregates over few columns; a full-row <code>SELECT *</code> gives back most of that advantage."
  ],
  proTip: "If your analytical query names a handful of columns, a columnar warehouse will crush a row-store; if it needs whole rows, the gap nearly vanishes. Design the table and the query around the columns you actually read.",
  related: ["data-lakes", "etl", "batch-processing", "realtime-analytics", "cdc", "data-lineage"],
  bridgeOut: "A warehouse requires structured, transformed data. Next: where everything that has not been transformed yet lives, with Data Lakes and Lakehouse."
};
