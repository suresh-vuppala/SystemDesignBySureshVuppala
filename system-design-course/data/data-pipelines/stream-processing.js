/* === Lesson stream-processing - part of Module 12 (Data Pipelines) ===
   Source: system-design-cheatsheet/11-data-pipelines.html (#stream-processing)
   + system-design-cheatsheet-course-hierarchy.md, Module 12.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["stream-processing"] = {
  module: 12, num: "12.3", title: "Stream Processing",
  connectsFrom: "Lambda\u2019s speed layer needed a real implementation. This lesson is the mechanics of processing data <strong>in real-time</strong> as it arrives, event by event, with no waiting for a batch window to close.",
  tabs: {
    overview: {
      heading: "Process Each Event As It Arrives",
      intro: "Stream processing handles <strong>unbounded</strong> data continuously: each event is processed the instant it lands, giving <strong>ms to sec</strong> latency for surge pricing, fraud alerts, and live dashboards. Three frameworks dominate, and they differ mainly in whether they are a true stream, a library, or a micro-batch.",
      cards: [
        { icon: "F", title: "Apache Flink", color: "purple", body: "True streaming, <strong>exactly-once</strong>, stateful. Uber counts ride requests per zone in a 5-min sliding window to compute a surge multiplier in real-time." },
        { icon: "K", title: "Kafka Streams", color: "blue", body: "A <strong>library</strong>, not a separate cluster. LinkedIn joins view events with profiles for \u201cwho viewed your profile\u201d and emits within seconds." },
        { icon: "S", title: "Spark Streaming", color: "orange", body: "<strong>Micro-batch</strong> (100ms to sec intervals). Netflix aggregates play/pause/skip events per title for a trending dashboard." }
      ],
      table: {
        headers: ["Framework", "Model", "Real-World Example"],
        rows: [
          ["<strong>Apache Flink</strong>", "True streaming, exactly-once, stateful", "<strong>Uber</strong>: surge pricing, count ride requests per zone in a 5-min sliding window \u2192 price multiplier in real-time"],
          ["<strong>Kafka Streams</strong>", "Library (no cluster), Kafka ecosystem", "<strong>LinkedIn</strong>: \u201cwho viewed your profile\u201d, join view events with user profiles, emit within seconds"],
          ["<strong>Spark Streaming</strong>", "Micro-batch (100ms to sec intervals)", "<strong>Netflix</strong>: real-time viewing metrics, aggregate play/pause/skip events per title for a trending dashboard"]
        ]
      },
      callouts: [
        { color: "green", label: "Key Concepts:", body: "<strong>Windowing</strong>: tumbling (fixed, non-overlapping: count per 5 min), sliding (overlapping: last 10 min, updated every 1 min), session (gap-based: activity until 30 min idle). <strong>Watermarks</strong>: a policy for late-arriving events (allow 5 sec late data). <strong>Exactly-once</strong>: checkpointing + idempotent sinks. <strong>State</strong>: RocksDB in Flink for keyed state, such as a running count per user." }
      ]
    },
    realWorld: {
      heading: "Where Stream Processing Runs",
      points: [
        { label: "Uber", body: "Surge pricing: count ride requests per zone in a 5-minute sliding window, then emit a price multiplier in real-time." },
        { label: "LinkedIn", body: "\u201cWho viewed your profile\u201d: join view events with user profiles on Kafka Streams and emit within seconds." },
        { label: "Netflix", body: "Real-time viewing metrics: aggregate play/pause/skip events per title on Spark Streaming for a trending dashboard." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Real-Time",
      intro: "Processing an unbounded stream is powerful but harder than a bounded batch.",
      points: [
        { label: "Late and out-of-order data", body: "Events do not arrive in perfect order. <strong>Watermarks</strong> set how long to wait for stragglers: too short drops valid late data, too long delays every result." },
        { label: "Exactly-once is not free", body: "It requires <strong>checkpointing</strong> plus idempotent sinks. Without both, a failure and replay gives you at-least-once with duplicates instead." },
        { label: "Stateful operators cost memory", body: "Windowed counts and joins keep <strong>keyed state</strong> (often RocksDB in Flink). Large key spaces and long windows grow that state and must be checkpointed to survive restarts." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Flink\u2019s official image has a free local cluster mode); the Kafka lab from 8.2.",
      setup: "Local and free: Flink\u2019s Docker Compose (JobManager + TaskManager) reading from your existing Kafka topic.",
      simulate: "Write a Flink job that reads <code>ride_requested</code> events keyed by <code>zone_id</code> and computes a count over a 5-minute tumbling window, emitting a requests-per-zone-per-5-min result. Feed it a burst of synthetic events with realistic timestamps (some slightly out of order) and watch the Flink dashboard (<code>localhost:8081</code>) show the running job and its windowed output.",
      observe: "Events that arrive slightly late but within the watermark\u2019s allowed lateness still get counted into the correct window, while events arriving after the watermark passes get dropped or routed to a separate late-data output: the watermark policy tested against your own deliberately shuffled timestamps.",
      stretch: "Kill the Flink TaskManager mid-stream and restart it. Confirm the job resumes from its last checkpoint with correct window counts (no double-counting, no gaps): the exactly-once claim verified instead of assumed."
    }
  },
  keyTakeaways: [
    "Stream processing handles <strong>unbounded</strong> data event by event at <strong>ms to sec</strong> latency, powering surge pricing, fraud alerts, and live dashboards.",
    "Frameworks differ by model: <strong>Flink</strong> is true streaming and stateful, <strong>Kafka Streams</strong> is a library, <strong>Spark Streaming</strong> is micro-batch.",
    "<strong>Windowing, watermarks, checkpointing, and keyed state</strong> are the core mechanics that make correct real-time results possible over messy, late-arriving data."
  ],
  proTip: "Pick the window type from the question you are answering: tumbling for non-overlapping buckets, sliding for a moving recent window, session for per-user bursts of activity. The wrong window silently produces the wrong number.",
  related: ["batch-processing", "kafka", "realtime-analytics", "etl", "cdc"],
  bridgeOut: "Batch processing is the direct counterpart: same data, opposite timing philosophy. Next: process accurately on a schedule, with Batch Processing."
};
