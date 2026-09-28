/* === Lesson data-quality - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#data-quality)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["data-quality"] = {
  module: 12, num: "12.7", title: "Data Quality",
  connectsFrom: "Every pipeline lesson so far assumed the data flowing through it is trustworthy. This lesson is the explicit gate that checks that assumption: validate at ingestion, because garbage in means garbage out.",
  tabs: {
    overview: {
      heading: "A Quality Gate At Ingestion",
      intro: "Data quality is a <strong>gate</strong>: data that passes lands normally, data that fails is <strong>quarantined and alerted</strong> before any downstream job consumes it. Five checks cover most cases, and they run as a step in the pipeline rather than as an afterthought.",
      cards: [
        { icon: "S", title: "Schema", color: "blue", body: "Columns and types match the <strong>contract</strong>. A renamed or retyped column is caught before it breaks a downstream job." },
        { icon: "F", title: "Freshness", color: "orange", body: "The data is recent enough, for example the last partition is <strong>&lt; 6 h old</strong>. Stale data is as dangerous as wrong data." },
        { icon: "V", title: "Volume", color: "green", body: "Row count sits within an expected band, for example <strong>\u00b110%</strong> of the 7-day median. A sudden drop or spike signals an upstream break." }
      ],
      table: {
        headers: ["Check", "Example"],
        rows: [
          ["Schema", "columns + types match contract"],
          ["Nullness", "<code>user_id NOT NULL</code>"],
          ["Range / set", "<code>0 \u2264 score \u2264 100</code>, <code>currency \u2208 {USD, ...}</code>"],
          ["Freshness", "last partition &lt; 6 h old"],
          ["Volume", "row count within \u00b110% of 7-day median"]
        ]
      },
      callouts: [
        { color: "green", label: "Tools:", body: "<strong>Great Expectations</strong>, <strong>dbt tests</strong>, <strong>Soda</strong>, <strong>Monte Carlo</strong> (observability)." }
      ]
    },
    tradeoffs: {
      heading: "Where To Put The Gate",
      intro: "A quality gate is only useful if it stops bad data early and fails loudly enough to matter.",
      points: [
        { label: "Quarantine before consumption", body: "Failing data should be routed aside and alerted on, not silently dropped or silently passed. The whole point is that a downstream aggregate never sees garbage in the first place." },
        { label: "Fail vs warn", body: "A warning that no one reads is not a gate. Critical checks should <strong>fail the pipeline run</strong>, so wire them as a build step, not an optional report." },
        { label: "Volume checks need history", body: "A <strong>\u00b110% of median</strong> rule only works once you have a stable baseline. Early on, or after a real traffic change, expect false alarms until the baseline catches up." }
      ]
    },
    handsOn: {
      prerequisites: "Python; Great Expectations (<code>pip install great_expectations</code>, free).",
      setup: "Local and free only.",
      simulate: "Define expectations on your orders dataset: <code>expect_column_values_to_not_be_null(\"user_id\")</code>, <code>expect_column_values_to_be_between(\"score\", 0, 100)</code>, and a freshness check on the max timestamp. Run the validation against clean data (should pass), then inject a few bad rows (a null <code>user_id</code>, a <code>score</code> of 150) and rerun.",
      observe: "Great Expectations produces a clear, itemized report of exactly which rows and which rule failed, instead of a downstream job silently consuming garbage and producing wrong aggregates: the quarantine-before-consumption principle working as a gate you can wire into a pipeline step.",
      stretch: "Wire the validation as a dbt test (<code>dbt test</code>) directly on your 12.2 dbt models and configure it to fail the pipeline run (not just warn) when a critical check fails: quality enforced as a build step, not an afterthought."
    }
  },
  keyTakeaways: [
    "Data quality is a <strong>gate at ingestion</strong>: pass and land normally, fail and get quarantined plus alerted before any consumer sees the data.",
    "Five checks cover most cases: <strong>schema, nullness, range/set, freshness, and volume</strong>.",
    "A check that only warns is not a gate; critical checks should <strong>fail the pipeline run</strong> so bad data never propagates."
  ],
  proTip: "Make critical quality checks fail the build, not just log a warning. A gate that quarantines bad data before consumption is worth ten dashboards that report the damage after downstream aggregates are already wrong.",
  related: ["etl", "pipeline-schema-registry", "data-lineage", "cdc", "data-lakes"],
  bridgeOut: "This is the same instinct as a dead-letter queue for bad messages, one layer earlier: quarantine before a consumer sees it. Next: enforce the shape of the data itself with a Schema Registry."
};
