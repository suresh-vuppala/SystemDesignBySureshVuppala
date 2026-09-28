/* === Lesson dlq - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#dlq)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["dlq"] = {
  module: 8, num: "8.5", title: "Dead Letter Queue (DLQ)",
  connectsFrom: "Queues and Kafka both assume messages eventually get processed successfully. A DLQ is what happens the moment that assumption breaks: it quarantines the failing message so the main queue keeps flowing.",
  tabs: {
    overview: {
      heading: "Quarantine Poison Messages, Keep the Queue Flowing",
      intro: "After N failed attempts a message moves to a separate <strong>dead-letter queue</strong> instead of retrying forever. That gives you <strong>fault isolation</strong> (one bad message does not block the queue) and <strong>observability</strong> (a place to inspect what failed and why).",
      cards: [
        { icon: "P", title: "Poison Messages", color: "red", body: "Malformed payload, schema mismatch, encoding errors, oversized message. <strong>Retrying will not help</strong>: needs a fix or a discard." },
        { icon: "T", title: "Transient Failures", color: "orange", body: "Downstream unavailable, DB timeout, throttling, network partition. A <strong>redrive after the outage clears</strong> often just works." },
        { icon: "L", title: "Logic Errors", color: "purple", body: "Unhandled exception, business-rule violation, referential-integrity failure, idempotency-key collision. Needs a <strong>code fix and redeploy</strong> before redriving." }
      ],
      table: {
        headers: ["Broker", "Mechanism", "Configuration", "Recovery"],
        rows: [
          ["<strong>SQS</strong>", "Source queue \u2192 redrive policy \u2192 DLQ (separate queue)", "<code>RedrivePolicy: {deadLetterTargetArn, maxReceiveCount}</code>", "<strong>StartMessageMoveTask</strong> API (redrive)"],
          ["<strong>RabbitMQ</strong>", "Dead-letter exchange (DLX) on TTL/reject/nack", "<code>x-dead-letter-exchange</code> + <code>x-dead-letter-routing-key</code>", "Shovel plugin or manual republish"],
          ["<strong>Kafka</strong>", "App writes failed events to <code>topic.DLT</code>", "Spring Kafka: <code>@RetryableTopic(attempts=3)</code> + <code>@DltHandler</code>", "Replay from DLT topic (seek to beginning)"],
          ["<strong>Azure SB</strong>", "Built-in <code>$DeadLetterQueue</code> sub-queue", "<code>MaxDeliveryCount</code> on subscription/queue", "Service Bus Explorer: peek and resubmit"],
          ["<strong>GCP Pub/Sub</strong>", "Dead-letter topic on subscription", "<code>deadLetterPolicy: {deadLetterTopic, maxDeliveryAttempts}</code>", "Pull from dead-letter subscription"]
        ]
      },
      tables: [
        {
          headers: ["Concept", "Detail", "Best Practice"],
          rows: [
            ["<strong>maxReceiveCount</strong>", "Number of delivery attempts before moving to DLQ", "<strong>3-5 retries</strong> with exponential back-off"],
            ["<strong>Visibility Timeout</strong>", "Time message is hidden from other consumers during processing", "Set to <strong>6\u00d7 avg processing time</strong>"],
            ["<strong>Redrive Policy</strong>", "Config linking source queue to its DLQ", "Always configure: <strong>never lose messages silently</strong>"],
            ["<strong>Redrive Allow Policy</strong>", "Controls which source queues can target this DLQ", "Restrict to <strong>specific source queues</strong>"],
            ["<strong>Retention Period</strong>", "How long DLQ keeps messages before auto-deletion", "<strong>14 days</strong> (max for SQS): gives time to investigate"]
          ]
        }
      ],
      callouts: [
        { color: "purple", label: "Retry budget:", body: "After <code>maxReceiveCount</code> attempts (typically 3-5 retries with exponential back-off: 1s \u2192 2s \u2192 4s \u2192 8s \u2192 16s), the message moves to the DLQ. Size the visibility timeout at roughly <strong>6\u00d7 the average processing time</strong>. A Redrive Policy sets which DLQ a queue feeds; a Redrive Allow Policy controls which source queues may target a given DLQ." },
        { color: "green", label: "Best Practices:", body: "<strong>Always alarm on DLQ depth &gt; 0</strong>: even 1 message means something is broken. Emit CloudWatch / Prometheus metrics on visible message count. Include <strong>correlation IDs</strong> and <strong>original timestamps</strong> in headers for debugging. Use <strong>separate DLQs per source queue</strong> to isolate failure domains." },
        { color: "yellow", label: "Recovery Playbook:", body: "Alert \u2192 Inspect (peek, do not consume) \u2192 Identify root cause (schema? downstream? bug?) \u2192 Fix the consumer/downstream \u2192 <strong>Redrive</strong> to the source queue \u2192 Verify processing succeeds \u2192 Post-mortem if recurring." }
      ]
    },
    realWorld: {
      heading: "How Teams Run DLQs",
      intro: "A DLQ is only useful if someone is watching it and can move messages back once the bug is fixed.",
      points: [
        { label: "Uber", body: "A DLQ per microservice, with auto-redrive once the circuit breaker resets." },
        { label: "Netflix", body: "DLQ plus S3 archival for a compliance audit trail." },
        { label: "Stripe", body: "A webhook DLQ with exponential backoff, 5 retries over 3 days." }
      ]
    },
    tradeoffs: {
      heading: "DLQ Anti-Patterns",
      intro: "The failure mode of a DLQ is a DLQ nobody looks at.",
      points: [
        { label: "Ignoring the DLQ", body: "Messages expire silently and are lost. An unmonitored DLQ just loses messages more quietly than no DLQ at all." },
        { label: "No alarm", body: "Failures go unnoticed for days. Alarm on depth greater than zero." },
        { label: "Infinite retries without a DLQ", body: "A poison message that always fails blocks the entire queue behind it." },
        { label: "Same retention on DLQ as source", body: "Messages may expire before anyone investigates. Give the DLQ longer retention." },
        { label: "No metadata", body: "Without correlation IDs and timestamps you cannot trace why a message failed." }
      ]
    },
    handsOn: {
      prerequisites: "The SQS setup from 8.1 (or RabbitMQ with a dead-letter exchange).",
      setup: "Local and free: RabbitMQ with a queue configured with `x-dead-letter-exchange`. Cloud free-tier: an SQS queue with a Redrive Policy pointing at a second SQS queue as its DLQ, `maxReceiveCount: 3`.",
      simulate: "Send a message with a deliberately malformed payload (invalid JSON, or missing a required field) and have your consumer throw on every attempt without ACKing. Watch it get redelivered 3 times, then land in the DLQ automatically.",
      observe: "The main queue\u2019s count dropping to 0 and the DLQ\u2019s count incrementing by exactly 1 at the moment `maxReceiveCount` is hit: the Poison Message category, reproduced and automatically quarantined instead of retried forever.",
      stretch: "Fix the handler\u2019s bug, then use the redrive API (`StartMessageMoveTask` on AWS, or the Shovel plugin on RabbitMQ) to move the message back to the main queue and confirm it now processes successfully: the full Alert \u2192 Inspect \u2192 Identify \u2192 Fix \u2192 Redrive \u2192 Verify sequence, walked end to end."
    }
  },
  keyTakeaways: [
    "A DLQ quarantines a message after <strong>N failed attempts</strong> (maxReceiveCount) so one poison message cannot block the whole queue.",
    "Failures fall into three buckets that need different fixes: <strong>poison</strong> (fix or discard), <strong>transient</strong> (redrive after outage), and <strong>logic</strong> (code fix then redrive).",
    "Always <strong>alarm on DLQ depth</strong> and follow the recovery playbook: Alert, Inspect, Identify, Fix, Redrive, Verify, Post-mortem."
  ],
  proTip: "Always configure a DLQ and an alarm on its depth. An unmonitored DLQ does not save messages, it just loses them more quietly than having no DLQ at all.",
  related: ["message-queues", "kafka", "pubsub", "schema-registry", "messaging-choice", "messaging-comparison"],
  bridgeOut: "DLQs handle messages that fail to process. Event Sourcing flips the model entirely: store the facts as an append-only log and derive state by replaying them."
};
