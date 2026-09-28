/* === Lesson messaging-comparison - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#messaging-comparison)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["messaging-comparison"] = {
  module: 8, num: "8.4", title: "Queues vs Streams vs Pub/Sub",
  connectsFrom: "Queues, Kafka, and Pub/Sub each made their own case in isolation. Put them side by side and the decision stops requiring memorized product names: it comes down to one question about how messages are consumed.",
  tabs: {
    overview: {
      heading: "Three Fundamentally Different Messaging Patterns",
      intro: "The real difference is the <strong>consumption model</strong>. Queues are <strong>competing consumers</strong> (work distribution). Streams are <strong>independent consumers</strong> (each group reads everything, replayable). Pub/Sub is <strong>broadcast</strong> (everyone gets a copy, no replay).",
      cards: [
        { icon: "Q", title: "Message Queue", color: "blue", body: "Point-to-point. A message waits for one worker; <strong>each message \u2192 exactly one consumer</strong>. Best for task distribution and job queues." },
        { icon: "S", title: "Event Stream", color: "green", body: "Log-based. Messages are appended to a durable ordered log; <strong>each group reads the full log</strong> at its own pace and can replay. Best for event sourcing, CDC, analytics." },
        { icon: "B", title: "Pub/Sub", color: "orange", body: "Fan-out. One publish, <strong>N independent deliveries</strong>, no replay. Best for notifications and triggers." }
      ],
      table: {
        headers: ["Feature", "Message Queue", "Event Stream", "Pub/Sub"],
        rows: [
          ["<strong>Model</strong>", "Competing consumers (load balancing)", "Independent readers (each group reads all)", "Fan-out (one publish, N deliveries)"],
          ["<strong>Consumption</strong>", "One consumer per message", "Multiple groups, each reads all", "All subscribers get a copy"],
          ["<strong>After read</strong>", "Deleted", "Retained", "Gone (SNS) or short retention"],
          ["<strong>Delivery</strong>", "At-least-once (idempotent consumer)", "At-least-once, exactly-once possible", "At-least-once to every subscriber"],
          ["<strong>Retention</strong>", "None after ACK", "Configurable (days / size / compaction)", "Short (SNS: none, Pub/Sub: 7 days)"],
          ["<strong>Replay</strong>", "No", "Yes (rewind to any offset)", "Limited"],
          ["<strong>Ordering</strong>", "Per queue (FIFO)", "Per partition", "Not by default"],
          ["<strong>Throughput</strong>", "~10K-100K msg/sec", "~1M+ msg/sec", "~100K-1M msg/sec"],
          ["<strong>Best for</strong>", "Task distribution, job queues", "Event sourcing, CDC, analytics", "Notifications, fan-out, triggers"],
          ["<strong>Example</strong>", "RabbitMQ, SQS", "Kafka, Kinesis, Redis Streams", "SNS, Google Pub/Sub"]
        ]
      },
      callouts: [
        { color: "green", label: "Key Insight:", body: "The fundamental difference is the <strong>consumption model</strong>. Queues are <strong>competing consumers</strong> (work distribution). Streams are <strong>independent consumers</strong> (each reads everything). Pub/Sub is <strong>broadcast</strong> (everyone gets a copy). Many real systems combine them, for example SNS \u2192 SQS \u2192 Lambda." },
        { color: "blue", label: "The replay tell:", body: "The one felt difference is replay. Kafka is the only pattern where a late-joining consumer group can see everything that happened <strong>before it existed</strong>; a new SQS queue or SNS subscription sees only what arrives after it joins." }
      ]
    },
    handsOn: {
      prerequisites: "The 3 labs already built in 8.1 (RabbitMQ/SQS), 8.2 (Kafka), and 8.3 (SNS+SQS).",
      setup: "None new: reuse the running labs.",
      simulate: "Send the same \u201cOrderPlaced\u201d event through all 3 setups and, for each, answer two questions: can a second independent application add itself as a new consumer later and see this event, and can that new consumer replay history from before it existed? Test it: subscribe a brand-new SQS queue to the exchange after messages were sent (nothing arrives, no replay); read from an early offset on the Kafka topic after adding a new consumer group (full history available); add a subscriber to the SNS topic after a publish (also nothing, SNS does not replay).",
      observe: "Kafka is the only one of the 3 where a late-joining consumer group sees everything that happened before it existed: the concrete reason \u201creplayable\u201d is Kafka\u2019s specific differentiator, not just a label in a table.",
      stretch: "None. This lesson\u2019s value is the direct 3-way comparison itself."
    }
  },
  keyTakeaways: [
    "The choice is about the <strong>consumption model</strong>: competing consumers (queue), independent readers (stream), or broadcast (Pub/Sub), not about product names.",
    "Only streams <strong>retain and replay</strong>; queues delete after ACK and Pub/Sub broadcasts live with little or no replay.",
    "Real systems often <strong>combine</strong> patterns, such as SNS \u2192 SQS \u2192 Lambda, fanning out then queuing each branch for reliable processing."
  ],
  proTip: "Decide by asking two questions: should exactly one worker handle this (queue), or should many independent systems each react (stream or Pub/Sub)? And does a late joiner need history (stream) or only new events (Pub/Sub)?",
  related: ["message-queues", "kafka", "pubsub", "dlq", "redis-streams", "messaging-choice", "cqrs", "schema-registry"],
  bridgeOut: "The choice made here decides which failure-handling pattern even applies: a DLQ is a queue/stream concept, not really a Pub/Sub one."
};
