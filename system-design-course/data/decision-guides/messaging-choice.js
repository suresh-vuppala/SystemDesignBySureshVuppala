/* === Lesson messaging-choice - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#messaging-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the comparison table and decision-shortcut callout. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["messaging-choice"] = {
  module: 15, num: "15.3", title: "Queue vs Stream vs Pub/Sub",
  connectsFrom: "Module 8 taught each messaging technology in prose. This condenses the same decision (8.4) into a lookup. It branches on two questions: <strong>how many consumers read each message</strong>, and <strong>do you need replay and retention</strong>.",
  tabs: {
    overview: {
      heading: "The Messaging Decision Tree",
      intro: "The first fork is consumption model: <strong>one consumer per message</strong> means a queue, <strong>many independent consumers</strong> means a stream or pub/sub. The second fork splits many-consumer cases by whether you need to replay history.",
      table: {
        headers: ["Technology", "Model", "Ordering", "Retention", "Best For"],
        rows: [
          ["<strong>SQS</strong>", "Queue (1 consumer per msg)", "FIFO optional", "14 days max", "Task distribution, decoupling services"],
          ["<strong>Kafka</strong>", "Log (N consumers, replay)", "Partition-ordered", "Configurable (days \u2192 forever)", "Event sourcing, streaming, high throughput"],
          ["<strong>RabbitMQ</strong>", "Queue + exchange routing", "Per-queue FIFO", "Until consumed", "Complex routing, priority queues, RPC"],
          ["<strong>Redis Pub/Sub</strong>", "Pub/Sub (fire &amp; forget)", "None", "Zero (no persistence)", "Ephemeral events, typing indicators, cache invalidation"],
          ["<strong>SNS + SQS</strong>", "Fan-out (1 msg \u2192 N queues)", "Per-subscriber queue", "Per SQS settings", "Event notifications to multiple services"],
          ["<strong>NATS</strong>", "Pub/Sub + JetStream", "Stream-ordered", "JetStream: configurable", "Lightweight microservice messaging, IoT"]
        ]
      },
      callouts: [
        { color: "green", label: "Decision shortcut:", body: "Need replay? \u2192 <strong>Kafka</strong>. Need exactly-once task processing? \u2192 <strong>SQS</strong>. Need complex routing (topic/fanout/headers)? \u2192 <strong>RabbitMQ</strong>. Need fire-and-forget speed? \u2192 <strong>Redis Pub/Sub</strong>. Need fan-out to multiple services? \u2192 <strong>SNS + SQS</strong>." },
        { color: "blue", label: "The combined answer:", body: "When you need both fan-out and reliable per-branch processing, the common pattern is <strong>SNS \u2192 SQS \u2192 Lambda</strong>: SNS broadcasts, each SQS queue buffers for one service, and Lambda processes at its own pace." }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "Each technology optimizes a different pair of concerns. Here is the trade-off behind each branch.",
      points: [
        { label: "Queue when work must be done once", body: "SQS and RabbitMQ delete a message after it is acknowledged, so exactly one worker handles each task. This is the right model for job distribution and decoupling. The cost: once consumed, the message is gone, there is no replay." },
        { label: "Stream when history matters", body: "Kafka keeps messages in a durable, partition-ordered log, so many independent consumer groups can each read the full topic and rewind. The cost: operational weight and ordering only within a partition, not across the topic." },
        { label: "Pub/Sub when speed beats durability", body: "Redis Pub/Sub broadcasts to whoever is listening right now, with zero persistence. Perfect for typing indicators and cache invalidation. The cost: a subscriber that is offline misses the message forever." },
        { label: "Routing complexity picks RabbitMQ", body: "When delivery depends on topic, header, or priority rules, RabbitMQ exchanges express that natively. The cost: more moving parts than a plain queue, and lower raw throughput than Kafka." },
        { label: "Fan-out plus buffering picks SNS + SQS", body: "One event that must reach several services, each processing independently and reliably, is the classic SNS \u2192 SQS \u2192 Lambda shape. SNS gives broadcast, SQS gives per-service durability, so a slow consumer never blocks the others." }
      ]
    }
  },
  keyTakeaways: [
    "First fork is consumption model: <strong>one consumer per message</strong> \u2192 queue, <strong>many independent consumers</strong> \u2192 stream or pub/sub.",
    "Second fork is retention: need replay \u2192 <strong>Kafka</strong>; fire-and-forget \u2192 <strong>Redis Pub/Sub</strong>; broadcast with per-service buffering \u2192 <strong>SNS + SQS</strong>.",
    "One event can legitimately use two technologies when its consumers have different durability needs."
  ],
  proTip: "Ask \u201cif a consumer is offline for an hour, what should happen to the messages it missed?\u201d Must-replay \u2192 Kafka, must-buffer-per-service \u2192 SQS, fine-to-lose \u2192 Redis Pub/Sub. That single question resolves most messaging debates.",
  related: ["kafka", "message-queues", "pubsub", "messaging-comparison", "dlq", "event-sourcing", "more-decisions"],
  bridgeOut: "Messaging decides how services talk. Next parallel decision: which caching strategy sits between your app and its data store."
};
