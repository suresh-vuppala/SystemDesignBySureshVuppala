/* === Lesson message-queues - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#message-queues)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["message-queues"] = {
  module: 8, num: "8.1", title: "Message Queues (RabbitMQ / SQS)",
  connectsFrom: "Service A calls Service B directly to do some work. If B is slow, A waits. If B is down, A\u2019s request fails outright, and that tight coupling makes every service\u2019s reliability the problem of everyone who calls it too.",
  tabs: {
    overview: {
      heading: "Messages Wait for a Worker to Pick Them Up",
      intro: "A message queue holds work until a consumer is ready. Each message goes to <strong>exactly one</strong> consumer (competing consumers), giving you <strong>task distribution and load balancing</strong> with built-in retry and a dead letter queue for failures.",
      cards: [
        { icon: "C", title: "Competing Consumers", color: "green", body: "Many workers read one queue, but each message is delivered to <strong>exactly one</strong> of them. Add workers to process faster." },
        { icon: "V", title: "Visibility Timeout", color: "orange", body: "A message is hidden from other consumers while one processes it. If the worker crashes before it ACKs, the message reappears after the timeout and gets redelivered." },
        { icon: "A", title: "At-Least-Once", color: "blue", body: "A message can be processed more than once, so handlers must be <strong>idempotent</strong> (for example, check a durable log keyed by order_id before acting)." }
      ],
      table: {
        headers: ["RabbitMQ", "SQS"],
        rows: [
          ["Routes via <strong>exchanges</strong>: Direct (exact key), Fanout (broadcast), Topic (pattern like <code>order.*.created</code>), Headers", "Two flavors: <strong>Standard</strong> and <strong>FIFO</strong>"],
          ["<strong>Per-queue FIFO</strong> ordering", "<strong>Standard</strong>: at-least-once, best-effort order, unlimited throughput"],
          ["Dead-letter exchange for failed messages", "<strong>FIFO</strong>: exactly-once, strict order, capped near 3,000 msg/sec, scoped by <code>MessageGroupId</code>"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>At-least-once delivery</strong> (consumer must be idempotent). <strong>Ordering</strong> per queue (FIFO). <strong>Dead Letter Queue</strong>: after N retries, the message moves to a DLQ. <strong>Visibility timeout</strong>: the message is invisible to others while being processed." },
        { color: "blue", label: "Delivery lifecycle:", body: "A worker that finishes ACKs and the message is deleted. A worker that fails NACKs and the message is retried. A worker that crashes mid-task never ACKs, so the message becomes visible again after the timeout for another worker." }
      ]
    },
    tradeoffs: {
      heading: "Where Queues Fall Short",
      intro: "Queues are excellent for distributing one-time work, but the point-to-point delete-after-ACK model has hard limits.",
      points: [
        { label: "No message replay", body: "Once a message is ACKed it is gone. A new consumer added later cannot see anything that happened before it existed." },
        { label: "Limited throughput", body: "Roughly 10K to 100K msg/sec, far below a streaming log. Not built for high-volume event streaming." },
        { label: "Fan-out is harder", body: "Delivering the same message to many independent systems is awkward compared to Kafka or Pub/Sub." },
        { label: "No long-term retention", body: "Messages are not kept as durable history, so the queue is not an audit log." },
        { label: "Visibility timeout expiry", body: "If a job runs longer than its visibility timeout, a second worker can pick up the same message while the first is still working. Fix it with a heartbeat that renews the timeout, plus idempotent handlers as the correctness backstop." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (for RabbitMQ); Node.js or Python with `amqplib`/`pika`; or an AWS free-tier account for the SQS version.",
      setup: "Local and free: `docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management` (the management UI at `:15672` is genuinely useful here). Cloud free-tier: SQS\u2019s free tier (1M requests/month).",
      simulate: "Publish 100 \u201csend email\u201d jobs to a queue, then start 3 worker processes that each consume and ACK after a 1-second simulated task. Watch the management UI distribute messages across workers in real time (competing consumers). Then start a worker that intentionally never ACKs (crashes mid-task) and watch its message reappear after the visibility timeout for another worker to pick up.",
      observe: "The redelivery behavior made concrete: a message count blip in the UI as the crashed worker\u2019s message returns. Confirm your handler is idempotent by processing the same message twice on purpose and checking it does not double-send.",
      stretch: "Switch the exchange type from Direct to Topic (`order.*.created`), publish to `order.eu.created` and `order.us.created`, and confirm a consumer bound to `order.eu.*` only receives the EU message."
    }
  },
  keyTakeaways: [
    "A message queue delivers each message to <strong>exactly one</strong> consumer (competing consumers), which is ideal for task distribution and load balancing.",
    "Delivery is <strong>at-least-once</strong>, so handlers must be idempotent; a <strong>visibility timeout</strong> hides an in-flight message and redelivers it if the worker crashes before ACKing.",
    "RabbitMQ routes with exchanges (Direct, Fanout, Topic, Headers); SQS offers Standard (best-effort order) vs FIFO (strict order, exactly-once, capped throughput)."
  ],
  proTip: "Make every consumer idempotent from day one. At-least-once delivery means redelivery is not an edge case, it is normal operation, so double-processing must be harmless.",
  related: ["kafka", "pubsub", "messaging-comparison", "dlq", "messaging-choice", "ordering"],
  bridgeOut: "A queue delivers to exactly one consumer per message. The gap is what happens when multiple independent systems all need to see the same event: that is Kafka."
};
