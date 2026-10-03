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
      goal: "Wire a RabbitMQ dead-letter exchange with a timed retry loop so a poison message auto-quarantines after 3 failed attempts instead of blocking the main queue forever.",
      stack: "RabbitMQ (with the management UI) in Docker + Node.js <code>amqplib</code>. Local and free.",
      steps: [
        {
          title: "Start RabbitMQ",
          code: "docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management",
          lang: "bash"
        },
        {
          title: "Install the client",
          code: "npm init -y && npm install amqplib",
          lang: "bash"
        },
        {
          title: "Declare main, retry, and dead-letter queues",
          body: "Save as <code>setup.js</code>. Failed messages dead-letter to <code>jobs.retry</code>, which waits 2s then routes them back to <code>jobs</code>. Each cycle bumps the <code>x-death</code> count.",
          code: `const amqp = require('amqplib');
(async () => {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue('jobs.dlq', { durable: true });
  await ch.assertQueue('jobs', { durable: true, arguments: {
    'x-dead-letter-exchange': '',
    'x-dead-letter-routing-key': 'jobs.retry'
  }});
  await ch.assertQueue('jobs.retry', { durable: true, arguments: {
    'x-dead-letter-exchange': '',
    'x-dead-letter-routing-key': 'jobs',
    'x-message-ttl': 2000
  }});
  console.log('queues ready');
  await ch.close();
  await conn.close();
})();`,
          lang: "javascript"
        },
        {
          title: "Write a consumer that gives up after 3 attempts",
          body: "Save as <code>consumer.js</code>. It reads the retry count from the <code>x-death</code> header; a NACK sends the message to the retry loop, and on the 3rd attempt it routes to <code>jobs.dlq</code>.",
          code: `const amqp = require('amqplib');
const MAX = 3;
const attempts = (msg) => {
  const xd = msg.properties.headers['x-death'];
  return xd && xd[0] ? xd[0].count : 0;
};
(async () => {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  ch.prefetch(1);
  ch.consume('jobs', (msg) => {
    const n = attempts(msg) + 1;
    console.log('attempt ' + n + ': ' + msg.content.toString());
    try {
      JSON.parse(msg.content.toString());
      ch.ack(msg);
    } catch (e) {
      if (n >= MAX) {
        console.log('giving up -> jobs.dlq');
        ch.sendToQueue('jobs.dlq', msg.content, { persistent: true });
        ch.ack(msg);
      } else {
        ch.nack(msg, false, false);
      }
    }
  });
})();`,
          lang: "javascript"
        },
        {
          title: "Run it, then publish one poison message",
          body: "The payload is invalid JSON, so <code>JSON.parse</code> throws on every attempt.",
          code: "node setup.js\nnode consumer.js &\ndocker exec rabbit rabbitmqadmin publish routing_key=jobs payload='{bad json'",
          lang: "bash"
        }
      ],
      observe: "The consumer logs attempt 1, then attempt 2 and 3 roughly 2 seconds apart (the retry TTL), then <code>giving up -&gt; jobs.dlq</code>. In the management UI at <code>http://localhost:15672</code> the <code>jobs</code> queue settles back to 0 while <code>jobs.dlq</code> increments by exactly 1: the Poison Message category, automatically quarantined instead of retried forever.",
      stretch: "Fix the bug (publish valid JSON), then redrive: republish the message from <code>jobs.dlq</code> back to <code>jobs</code> and confirm it now processes and ACKs, walking the full Alert, Inspect, Identify, Fix, Redrive, Verify sequence end to end."
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
