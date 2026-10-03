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
      goal: "Count ride requests per zone over a 5-minute tumbling window in Flink, and prove that watermarks fold slightly-late events into the correct window while dropping ones that arrive too late.",
      stack: "Apache Flink via PyFlink, run as a local mini-cluster with the web dashboard on port 8081. Local and free.",
      steps: [
        {
          title: "Install PyFlink",
          code: "pip install apache-flink",
          lang: "bash"
        },
        {
          title: "Write the event-time windowing job",
          body: "Events are <code>(zone_id, event_time_ms)</code>. The 4th event is deliberately out of order; the watermark allows 30s of lateness. Checkpointing every 5s is what makes the exactly-once claim testable. Save as <code>ride_windows.py</code>.",
          code: "from pyflink.common import Configuration, Duration, Time, WatermarkStrategy, Types\nfrom pyflink.common.watermark_strategy import TimestampAssigner\nfrom pyflink.datastream import StreamExecutionEnvironment\nfrom pyflink.datastream.window import TumblingEventTimeWindows\n\nconfig = Configuration()\nconfig.set_string(\"rest.port\", \"8081\")  # expose the dashboard locally\nenv = StreamExecutionEnvironment.get_execution_environment(config)\nenv.set_parallelism(1)\nenv.enable_checkpointing(5000)  # exactly-once snapshot every 5s\n\n# (zone_id, event_time_ms). The 4th event arrives out of order.\nevents = [(\"z1\", 0), (\"z1\", 60000), (\"z2\", 30000),\n          (\"z1\", 20000), (\"z2\", 290000), (\"z1\", 310000)]\nds = env.from_collection(events, type_info=Types.TUPLE([Types.STRING(), Types.LONG()]))\n\nclass ExtractTs(TimestampAssigner):\n    def extract_timestamp(self, value, record_ts):\n        return value[1]\n\nwm = (WatermarkStrategy\n      .for_bounded_out_of_orderness(Duration.of_seconds(30))\n      .with_timestamp_assigner(ExtractTs()))\n\n(ds.assign_timestamps_and_watermarks(wm)\n   .map(lambda e: (e[0], 1), output_type=Types.TUPLE([Types.STRING(), Types.INT()]))\n   .key_by(lambda e: e[0])\n   .window(TumblingEventTimeWindows.of(Time.minutes(5)))\n   .reduce(lambda a, b: (a[0], a[1] + b[1]))\n   .print())\n\nenv.execute(\"rides-per-zone-5min\")",
          lang: "python"
        },
        {
          title: "Run it and watch the windowed counts",
          body: "Each printed row is one closed 5-minute window: zone and its request count.",
          code: "python ride_windows.py\n# while it runs, open http://localhost:8081 to see the job graph",
          lang: "bash"
        }
      ],
      observe: "The out-of-order event at 20000ms still lands in the same 0-to-5-min window as the earlier <code>z1</code> events because it is within the watermark's 30s allowed lateness, so <code>z1</code>'s first window counts 3, not 2. Push that timestamp far enough back (past the watermark) and rerun: it gets dropped instead, the watermark policy tested against your own deliberately shuffled timestamps.",
      stretch: "Run the same job on a standalone Flink cluster (JobManager + TaskManager via Docker Compose), kill the TaskManager mid-stream, and restart it. Confirm the job resumes from its last checkpoint with correct window counts (no double-counting, no gaps): the exactly-once claim verified instead of assumed."
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
