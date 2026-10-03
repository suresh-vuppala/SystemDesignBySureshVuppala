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
      goal: "Load the same 1M-row orders dataset into a row-store (Postgres) and a columnar store (ClickHouse), then watch a category aggregate stay flat in ClickHouse as the table widens while Postgres slows down.",
      stack: "Postgres + ClickHouse in Docker, identical data on both sides. Local and free.",
      steps: [
        {
          title: "Start both databases",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker run -d --name ch -p 8123:8123 -p 9000:9000 clickhouse/clickhouse-server",
          lang: "bash"
        },
        {
          title: "Load 1M identical rows into each",
          code: "docker exec -i pg psql -U postgres -c \"CREATE TABLE orders(id int, category text, revenue numeric);\"\ndocker exec -i pg psql -U postgres -c \"INSERT INTO orders SELECT g, (ARRAY['books','toys','food','tools','games'])[1+floor(random()*5)], (random()*100)::numeric(10,2) FROM generate_series(1,1000000) g;\"\ndocker exec -i ch clickhouse-client -q \"CREATE TABLE orders(id UInt32, category String, revenue Float64) ENGINE=MergeTree ORDER BY id;\"\ndocker exec -i ch clickhouse-client -q \"INSERT INTO orders SELECT number, ['books','toys','food','tools','games'][1+(rand()%5)], (rand()%10000)/100 FROM numbers(1000000);\"",
          lang: "bash"
        },
        {
          title: "Run the same aggregate on both and time it",
          code: "docker exec -i pg psql -U postgres -c \"EXPLAIN ANALYZE SELECT category, SUM(revenue) FROM orders GROUP BY category;\"\ndocker exec -i ch clickhouse-client --time -q \"SELECT category, SUM(revenue) FROM orders GROUP BY category\"",
          lang: "bash"
        },
        {
          title: "Widen both tables with 20 unused columns and rerun",
          body: "The aggregate still only needs <code>category</code> and <code>revenue</code>.",
          code: "for i in $(seq 1 20); do docker exec -i pg psql -U postgres -c \"ALTER TABLE orders ADD COLUMN pad$i text DEFAULT repeat('x',50);\"; done\nfor i in $(seq 1 20); do docker exec -i ch clickhouse-client -q \"ALTER TABLE orders ADD COLUMN pad$i String DEFAULT 'x';\"; done\ndocker exec -i pg psql -U postgres -c \"EXPLAIN ANALYZE SELECT category, SUM(revenue) FROM orders GROUP BY category;\"\ndocker exec -i ch clickhouse-client --time -q \"SELECT category, SUM(revenue) FROM orders GROUP BY category\"",
          lang: "bash"
        },
        {
          title: "Compare on-disk size",
          code: "docker exec -i pg psql -U postgres -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'));\"\ndocker exec -i ch clickhouse-client -q \"SELECT formatReadableSize(sum(bytes_on_disk)) FROM system.parts WHERE table='orders'\"",
          lang: "bash"
        }
      ],
      observe: "Postgres's query time grows as you add unused columns, since a row-store still reads full rows, while ClickHouse's time for the same aggregate stays essentially flat: it never reads the columns the query does not need. The on-disk sizes show the roughly 10:1 compression columnar storage buys you.",
      stretch: "Run a <code>SELECT *</code> (needs every column) against both and note that ClickHouse's advantage shrinks or disappears. Columnar storage helps aggregate queries touching few columns, not full-row lookups: the exact opposite access pattern from OLTP."
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
