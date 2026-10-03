/* === Lesson data-lineage - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#data-lineage)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["data-lineage"] = {
  module: 12, num: "12.9", title: "Data Lineage",
  connectsFrom: "Once data has passed through CDC, ETL, streams, batch jobs, and a warehouse, answering \u201cwhere did this specific number actually come from\u201d becomes a manual, error-prone archaeology project. Lineage makes that answer automatic.",
  tabs: {
    overview: {
      heading: "A Traceable Graph Of Where Data Came From",
      intro: "Data lineage is a <strong>traceable graph</strong> of where data originated and what transformed it at each hop: <code>orders.csv \u2192 stage.orders \u2192 fact_orders \u2192 revenue dashboard</code>. Built by instrumenting the tools that already run the pipeline, it turns \u201cwhere did this number come from\u201d into a lookup instead of a guess.",
      cards: [
        { icon: "G", title: "GDPR requests", color: "purple", body: "Answer \u201cwhere is user X\u2019s data?\u201d by tracing every table and output that a source feeds." },
        { icon: "I", title: "Impact analysis", color: "blue", body: "Before a schema change, see every downstream model that would break, instead of finding out in production." },
        { icon: "R", title: "Root cause", color: "orange", body: "When a metric looks wrong, walk the graph back to the exact source and transform that produced it." }
      ],
      table: {
        headers: ["Tool", "Niche"],
        rows: [
          ["OpenLineage", "Open spec, plugs into Airflow / dbt / Spark"],
          ["DataHub", "LinkedIn-born catalog + lineage"],
          ["Apache Atlas", "Hadoop ecosystem"],
          ["Marquez", "Reference impl of OpenLineage"]
        ]
      },
      callouts: [
        { color: "purple", label: "Why it matters:", body: "GDPR \u201cwhere is user X\u2019s data?\u201d, impact analysis before schema changes, and root-cause for bad metrics. These are the three moments lineage earns its keep." }
      ]
    },
    handsOn: {
      goal: "Instrument your dbt project to emit OpenLineage events into Marquez, then watch a lineage graph build itself linking raw table to staging model to aggregate, with zero hand-written documentation.",
      stack: "Marquez (Docker Compose, its own Postgres + web UI) + dbt with the <code>openlineage-dbt</code> wrapper. Local and free.",
      steps: [
        {
          title: "Start Marquez",
          body: "Clones the project and brings up the API and web UI with one script.",
          code: "git clone https://github.com/MarquezProject/marquez.git\ncd marquez\n./docker/up.sh\n# web UI: http://localhost:3000   API: http://localhost:5000",
          lang: "bash"
        },
        {
          title: "Install the OpenLineage dbt wrapper and point it at Marquez",
          code: "pip install openlineage-dbt\nexport OPENLINEAGE_URL=http://localhost:5000\nexport OPENLINEAGE_NAMESPACE=shop",
          lang: "bash"
        },
        {
          title: "Run your 12.2 dbt models through the wrapper",
          body: "<code>dbt-ol run</code> is a drop-in for <code>dbt run</code> that also emits lineage events as it executes.",
          code: "cd shop         # the dbt project from lesson 12.2\ndbt-ol run      # same models, now emitting OpenLineage events\n# then open http://localhost:3000 and select the 'shop' namespace",
          lang: "bash"
        }
      ],
      observe: "A visual graph automatically shows which raw table feeds which staging model feeds which aggregate, built with zero manual documentation, purely from instrumenting the actual <code>dbt run</code>. Trace one specific number in your aggregate table back to its raw source using only the graph.",
      stretch: "Change a column in your raw table's schema and use the lineage graph to identify every downstream model that would be affected before you make the change: impact analysis before a schema change, exercised directly."
    }
  },
  keyTakeaways: [
    "Data lineage is a <strong>traceable graph</strong> of where data came from and what transformed it, built by instrumenting the tools that already run the pipeline.",
    "It earns its keep in three moments: <strong>GDPR</strong> data-subject requests, <strong>impact analysis</strong> before schema changes, and <strong>root-causing</strong> a bad metric.",
    "<strong>OpenLineage</strong> is the open spec; <strong>DataHub</strong>, <strong>Apache Atlas</strong>, and <strong>Marquez</strong> implement or extend the idea."
  ],
  proTip: "Capture lineage automatically by instrumenting dbt, Airflow, or Spark with OpenLineage. Hand-maintained lineage docs go stale the moment a pipeline changes; graphs built from the real runs never do.",
  related: ["etl", "data-quality", "cdc", "data-warehouse", "pipeline-schema-registry", "data-lakes"],
  bridgeOut: "Lineage matters most in three moments: a GDPR request, impact analysis before a schema change, and root-causing a bad metric. Next: serve analytics fresh enough to act on, with Real-Time Analytics."
};
