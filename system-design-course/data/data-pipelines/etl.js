/* === Lesson etl - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#etl)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["etl"] = {
  module: 12, num: "12.2", title: "ETL / ELT",
  connectsFrom: "CDC gets raw change events flowing. This lesson is what happens to that data once it needs to land somewhere analytically useful: cleaned, reshaped, and aggregated into tables people can query.",
  tabs: {
    overview: {
      heading: "Transform Before or After Loading",
      intro: "<strong>ETL</strong> transforms data before loading it (the traditional order). <strong>ELT</strong> loads raw data first and transforms it inside the warehouse, the modern default now that warehouses are cheap and fast enough to transform in place.",
      cards: [
        { icon: "E", title: "ETL", color: "orange", body: "<strong>Extract, Transform, Load</strong>. Clean and reshape data in a staging step, then load the finished result. Traditional, and still useful when the target cannot transform cheaply." },
        { icon: "L", title: "ELT", color: "green", body: "<strong>Extract, Load, Transform</strong>. Land the raw data first, then transform inside the warehouse with SQL. The modern default, since warehouses are now cheap and fast enough." },
        { icon: "O", title: "Orchestration", color: "blue", body: "<strong>Airflow</strong> schedules DAGs, <strong>dbt</strong> runs SQL transformations, <strong>Dagster/Prefect</strong> are code-first alternatives." }
      ],
      table: {
        headers: ["Approach", "Order", "Best when"],
        rows: [
          ["<strong>ETL</strong>", "Transform, then load", "The target cannot transform cheaply, or data must be cleaned before it lands."],
          ["<strong>ELT</strong>", "Load raw, then transform", "The warehouse is cheap and fast (the modern default); keep raw data for replay."]
        ]
      },
      callouts: [
        { color: "blue", label: "Tools and architectures:", body: "<strong>Airflow</strong> (DAG orchestration). <strong>dbt</strong> (SQL transformations). <strong>Dagster/Prefect</strong> (modern alternatives). <strong>Lambda Architecture</strong>: batch + speed + serving layers. <strong>Kappa</strong>: everything streaming (simpler)." }
      ]
    },
    tradeoffs: {
      heading: "ETL vs ELT, Lambda vs Kappa",
      intro: "Two independent choices: where you transform, and how you combine batch with real-time.",
      points: [
        { label: "ETL vs ELT", body: "ETL transforms in a separate step before loading, which protects a target that cannot transform cheaply but discards the raw form. ELT loads raw first and transforms in the warehouse, keeping raw data available for replay at the cost of storing it." },
        { label: "Lambda Architecture", body: "Runs a <strong>batch layer</strong> for accuracy alongside a <strong>speed layer</strong> for real-time approximation, merged in a serving layer. Accurate and fresh, but you maintain two code paths for the same logic." },
        { label: "Kappa Architecture", body: "<strong>Stream only</strong>: replay the Kafka log for reprocessing instead of a separate batch pipeline. Simpler with one code path, but it depends on durable stream retention." }
      ]
    },
    handsOn: {
      goal: "Transform a raw orders table into a cleaned staging view and a daily-revenue table with dbt, keeping every transformation as version-controlled SQL (the ELT pattern).",
      stack: "Postgres + dbt-core (dbt-postgres adapter) in Python. Local and free.",
      steps: [
        {
          title: "Start Postgres and load a raw orders table",
          body: "This is ELT's load-raw step: the data lands untransformed first.",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker exec -i pg psql -U postgres -c \"CREATE TABLE raw_orders(id int, cust text, amt text, ts text);\"\ndocker exec -i pg psql -U postgres -c \"INSERT INTO raw_orders VALUES (1,'ada','19.99','2024-01-01'),(2,'lin','5.00','2024-01-01'),(3,'ada','8.50','2024-01-02');\"",
          lang: "bash"
        },
        {
          title: "Install dbt and scaffold a project",
          code: "pip install dbt-postgres\nmkdir -p shop/models/staging",
          lang: "bash"
        },
        {
          title: "Point dbt at Postgres",
          body: "Two files: <code>dbt_project.yml</code> in the project root and <code>profiles.yml</code> in <code>~/.dbt/</code>.",
          code: "# shop/dbt_project.yml\nname: shop\nprofile: shop\nversion: \"1.0.0\"\nmodels:\n  shop:\n    +materialized: view\n\n# ~/.dbt/profiles.yml\nshop:\n  target: dev\n  outputs:\n    dev:\n      type: postgres\n      host: localhost\n      port: 5432\n      user: postgres\n      password: pw\n      dbname: postgres\n      schema: analytics\n      threads: 4",
          lang: "yaml"
        },
        {
          title: "Staging model: cast types and rename columns",
          body: "Save as <code>shop/models/staging/stg_orders.sql</code>.",
          code: "-- stg_orders.sql\nselect\n    id           as order_id,\n    cust         as customer,\n    amt::numeric as amount,\n    ts::date     as order_date\nfrom raw_orders",
          lang: "sql"
        },
        {
          title: "Aggregate model: daily revenue",
          body: "Save as <code>shop/models/daily_revenue.sql</code>. The <code>ref()</code> call is what lets dbt build the lineage graph.",
          code: "-- daily_revenue.sql\nselect\n    order_date,\n    count(*)    as orders,\n    sum(amount) as revenue\nfrom {{ ref('stg_orders') }}\ngroup by order_date\norder by order_date",
          lang: "sql"
        },
        {
          title: "Run the models and browse the lineage graph",
          code: "cd shop\ndbt run\ndbt docs generate && dbt docs serve",
          lang: "bash"
        }
      ],
      observe: "The raw table stays untransformed while all transformation logic lives as version-controlled SQL that <code>dbt run</code> re-executes into the <code>analytics</code> schema. Contrast that with the same transformation as a one-off Python script with no lineage tracking, then open the docs and browse the auto-generated lineage graph linking <code>raw_orders</code> \u2192 <code>stg_orders</code> \u2192 <code>daily_revenue</code>.",
      stretch: "Use Airflow (a free local install, or Astronomer's free tier) to schedule the <code>dbt run</code> step as a DAG task running nightly, giving the transformation an orchestrated schedule instead of a manual command."
    }
  },
  keyTakeaways: [
    "<strong>ETL</strong> transforms before loading; <strong>ELT</strong> loads raw and transforms in the warehouse, the modern default because warehouses are now cheap and fast enough.",
    "Orchestration is separate from the transform: <strong>Airflow</strong> schedules, <strong>dbt</strong> transforms in SQL, <strong>Dagster/Prefect</strong> are code-first alternatives.",
    "<strong>Lambda</strong> runs batch plus speed layers for accuracy and freshness; <strong>Kappa</strong> is stream-only and simpler but needs durable stream retention."
  ],
  proTip: "Default to ELT with dbt: load raw, transform in SQL, and keep the raw layer so you can always rebuild downstream tables by replaying transformations instead of re-extracting from source.",
  related: ["cdc", "data-warehouse", "batch-processing", "stream-processing", "data-lakes", "data-lineage", "data-quality", "pipeline-schema-registry", "realtime-analytics"],
  bridgeOut: "Lambda\u2019s speed layer and Kappa\u2019s stream-only approach are the architectural choices that Stream Processing and Batch Processing each represent one half of. Next: processing data the instant it arrives, with Stream Processing."
};
