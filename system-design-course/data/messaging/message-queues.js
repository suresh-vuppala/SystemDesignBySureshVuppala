/* === Lesson message-queues - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#message-queues, #dlq)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.1.
   Teaches message queues through RabbitMQ (the canonical smart broker),
   with SQS kept as the managed-cloud comparison. Goes deep: the AMQP
   topology and first flow, exchanges & routing, consumers &
   acknowledgments, durability/reliability/failure, retry + dead lettering +
   ordering, the core patterns (work queues, pub/sub, RPC), scaling / HA /
   quorum queues / streams, and operations + end-to-end design. Broker-wide
   comparisons (queues vs streams vs pub/sub) live in 8.4 and deep DLQ
   mechanics in 8.5, cross-linked rather than repeated. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["message-queues"] = {
  module: 8, num: "8.1", title: "Message Queues (RabbitMQ / SQS)",
  connectsFrom: "Service A calls Service B directly to do some work. If B is slow, A waits. If B is down, A\u2019s request fails outright, and that tight coupling makes every service\u2019s reliability the problem of everyone who calls it too.",
  customTabs: [
    { key: "overview", label: "Why & Fundamentals", icon: "book" },
    { key: "architecture", label: "Architecture & First Flow", icon: "hex" },
    { key: "routing", label: "Exchanges & Routing", icon: "swap" },
    { key: "delivery", label: "Consumers & ACKs", icon: "cpu" },
    { key: "reliability", label: "Durability & Reliability", icon: "alert" },
    { key: "retry", label: "Retry, DLQ & Ordering", icon: "loop" },
    { key: "patterns", label: "Patterns", icon: "globe" },
    { key: "scaling", label: "Scaling, HA & Streams", icon: "layers" },
    { key: "ops", label: "Ops & System Design", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Why Asynchronous Messaging, and RabbitMQ vs SQS",
      intro: "When Service A calls Service B directly it is <strong>synchronous and tightly coupled</strong>: if B is slow, A blocks; if B is down, A\u2019s request fails; and a traffic spike hits B at full force with no shock absorber. A <strong>message queue</strong> breaks that coupling, the producer hands a message to the broker and moves on, and a consumer processes it when ready. This lesson teaches queues through <strong>RabbitMQ</strong>, the classic <strong>smart-broker</strong> that speaks <strong>AMQP</strong>, with <strong>SQS</strong> (the managed-cloud queue) as the running comparison.",
      cards: [
        { icon: "!", title: "The problem", color: "red", body: "Direct calls make B\u2019s <strong>slowness</strong> A\u2019s latency and B\u2019s <strong>downtime</strong> A\u2019s failure. A spike overloads B with nothing to absorb the burst, and every caller inherits B\u2019s reliability." },
        { icon: "\u2192", title: "The async fix", color: "green", body: "The producer <strong>publishes</strong> and returns immediately; the broker holds the message; a consumer pulls it when free. The queue absorbs spikes (buffering), and B being down just means messages wait." },
        { icon: "\u2261", title: "The vocabulary", color: "blue", body: "<strong>Producer</strong> sends, <strong>Consumer</strong> receives, a <strong>Message</strong> is the payload + metadata, a <strong>Queue</strong> buffers messages, and the <strong>Broker</strong> is the server routing it all." }
      ],
      table: {
        headers: ["RabbitMQ", "SQS"],
        rows: [
          ["Routes via <strong>exchanges</strong>: Direct (exact key), Fanout (broadcast), Topic (pattern like <code>order.*.created</code>), Headers", "Two flavors: <strong>Standard</strong> and <strong>FIFO</strong>"],
          ["<strong>Per-queue FIFO</strong> ordering", "<strong>Standard</strong>: at-least-once, best-effort order, unlimited throughput"],
          ["Dead-letter exchange for failed messages; self-hosted (or managed)", "<strong>FIFO</strong>: exactly-once, strict order, capped near 3,000 msg/sec, scoped by <code>MessageGroupId</code>"]
        ]
      },
      callouts: [
        { color: "green", label: "Basic message flow:", body: "<strong>Producer \u2192 Broker (Exchange \u2192 Queue) \u2192 Consumer.</strong> Unlike SQS, where a producer sends straight to a named queue, a RabbitMQ producer publishes to an <strong>exchange</strong> that routes the message to one or more queues. That indirection is the source of RabbitMQ\u2019s rich routing (see Exchanges & Routing)." },
        { color: "blue", label: "A queue is not an event log:", body: "A queue delivers each message to <strong>one</strong> consumer and deletes it on ack, ideal for distributing work, but there is no long-term history or replay for many independent readers. For that model see Apache Kafka (8.2), and for the full queues-vs-streams-vs-pub/sub decision see 8.4." }
      ]
    },

    architecture: {
      heading: "The AMQP Topology and Your First Flow",
      intro: "RabbitMQ has a specific object model. Get these eight nouns straight and everything else falls into place, because every later feature is just a property on one of them.",
      table: {
        headers: ["Object", "What it is"],
        rows: [
          ["<strong>Broker</strong>", "The RabbitMQ server (or cluster node) that holds everything below"],
          ["<strong>Connection</strong>", "A long-lived TCP connection from an app to the broker"],
          ["<strong>Channel</strong>", "A lightweight virtual connection multiplexed over one TCP connection; do work on channels, one per thread, not one connection each"],
          ["<strong>Virtual Host</strong>", "A namespace (<code>/</code> by default) isolating queues, exchanges, and permissions, like a mini-broker for one app or team"],
          ["<strong>Exchange</strong>", "Receives every published message and decides which queues it goes to"],
          ["<strong>Queue</strong>", "An ordered buffer that stores messages until a consumer takes them"],
          ["<strong>Binding</strong>", "A rule linking an exchange to a queue (with an optional binding key)"],
          ["<strong>Routing key</strong>", "A label the producer stamps on a message; the exchange matches it against bindings"]
        ]
      },
      points: [
        { label: "Your first flow, end to end", body: "<strong>Producer \u2192 Exchange \u2192 Queue \u2192 Consumer.</strong> Declare an exchange and a queue, <code>bind</code> the queue to the exchange, then <code>basic.publish</code> to the exchange with a routing key; the consumer runs <code>basic.consume</code> on the queue and, after handling each message, <code>basic.ack</code>s it so the broker can delete it." },
        { label: "Queue lifecycle & types", body: "A queue can be <strong>durable</strong> (its definition survives a broker restart), <strong>exclusive</strong> (usable only by the connection that declared it, auto-deleted when that connection closes, great for RPC replies), or <strong>auto-delete / temporary</strong> (removed once the last consumer disconnects)." },
        { label: "Queue limits", body: "Bound a queue with <code>x-max-length</code> (max messages) or <code>x-max-length-bytes</code>, and per-message or per-queue <strong>TTL</strong> (<code>x-message-ttl</code>). Overflow either drops the oldest or dead-letters it (see Retry, DLQ & Ordering)." },
        { label: "Multiple consumers", body: "Attach several consumers to one queue and the broker round-robins messages across them, each message to exactly one consumer. That is the basis of the work-queue pattern (see Patterns)." }
      ],
      callouts: [
        { color: "blue", label: "Connection vs channel:", body: "Opening a TCP <strong>connection</strong> per operation is expensive. Open one connection per process and many <strong>channels</strong> on it (one per thread/worker). Channels are cheap; connections are not, this distinction matters again in Scaling." }
      ]
    },

    routing: {
      heading: "Exchanges Decide Where a Message Goes",
      intro: "The <strong>exchange type</strong> plus the <strong>bindings</strong> decide routing. The producer sets a <strong>routing key</strong>; each binding has a <strong>binding key</strong>; the exchange matches one against the other according to its type. This is what lets the same publish reach one queue, many queues, or none.",
      table: {
        headers: ["Exchange", "Routing rule", "Use it for", "Example"],
        rows: [
          ["<strong>Direct</strong>", "Deliver to queues whose binding key <strong>exactly equals</strong> the routing key", "One-to-one, or routing by a fixed label", "<code>routingKey = \u2019image.resize\u2019</code> \u2192 the resize queue"],
          ["<strong>Fanout</strong>", "Deliver to <strong>every</strong> bound queue, ignoring the routing key", "One-to-many broadcast / pub-sub", "<code>order.created</code> \u2192 email + analytics + audit queues"],
          ["<strong>Topic</strong>", "Pattern match on dot-separated words: <code>*</code> = one word, <code>#</code> = zero or more", "Flexible pattern-based routing", "<code>order.*.created</code> matches <code>order.eu.created</code>"],
          ["<strong>Headers</strong>", "Match on message <strong>header attributes</strong>, ignoring the routing key", "Routing on structured metadata, not a string key", "<code>x-match=all, region=eu, type=vip</code>"],
          ["<strong>Default</strong>", "A nameless direct exchange; routing key is treated as a <strong>queue name</strong>", "Quick point-to-point without declaring an exchange", "<code>publish(\u2019\u2019, \u2019tasks\u2019, msg)</code> \u2192 the <code>tasks</code> queue"]
        ]
      },
      points: [
        { label: "Routing key vs binding key", body: "The <strong>routing key</strong> travels with the message from the producer. The <strong>binding key</strong> is set when you bind a queue to an exchange. The exchange type defines how they are compared, exact for direct, pattern for topic, headers for headers, ignored for fanout." },
        { label: "One-to-one vs one-to-many", body: "Direct with a unique key gives <strong>one-to-one</strong>. Fanout, or topic with overlapping patterns, gives <strong>one-to-many</strong>, the same event landing in several queues that are each consumed independently (the pub/sub pattern)." },
        { label: "Pattern-based routing", body: "Topic exchanges shine when routing is hierarchical: <code>logs.#</code> catches all logs, <code>logs.error.*</code> catches per-service errors. One publish, many precise subscribers, no producer changes when a new subscriber appears." }
      ],
      callouts: [
        { color: "yellow", label: "Rule of thumb:", body: "Start with <strong>Direct</strong> for simple label routing, reach for <strong>Topic</strong> the moment routing becomes hierarchical or wildcarded, use <strong>Fanout</strong> for pure broadcast, and keep <strong>Headers</strong> for the rare case where routing depends on several attributes rather than one key." }
      ]
    },

    delivery: {
      heading: "Consumers, Prefetch & Acknowledgments",
      intro: "Once a message reaches a queue, two things govern correctness: how work is <strong>distributed</strong> across consumers, and how each consumer <strong>acknowledges</strong> it. Get acknowledgments wrong and you either lose messages or process them twice.",
      points: [
        { label: "Competing consumers", body: "Multiple consumers on one queue each receive a distinct share of messages (each message to exactly one). Add consumers to process faster, the horizontal-scaling lever for a queue. (SQS gets the same effect with a <strong>visibility timeout</strong> that hides an in-flight message until it is deleted or the timeout lapses.)" },
        { label: "Prefetch & fair dispatch", body: "By default the broker round-robins eagerly, so a slow consumer can pile up while a fast one idles. Set <code>basic.qos(prefetch_count=N)</code> to cap unacknowledged messages per consumer; <code>prefetch=1</code> gives <strong>fair dispatch</strong>, the broker only sends a new message once the previous one is ACKed." },
        { label: "Auto ACK vs manual ACK", body: "<strong>Auto-ack</strong> acknowledges on delivery, before processing, so a crash loses the message (at-most-once). <strong>Manual ack</strong> (<code>basic.ack</code> after success) is the safe default: an unacked message is redelivered if the consumer dies." },
        { label: "NACK, reject & requeue", body: "<code>basic.nack</code> (multiple) and <code>basic.reject</code> (single) tell the broker a message failed. With <code>requeue=true</code> it goes back on the queue for another attempt; with <code>requeue=false</code> it is dropped or dead-lettered (see Retry, DLQ & Ordering)." },
        { label: "Consumer failure", body: "If a consumer disconnects or crashes before ACKing, the broker automatically redelivers its in-flight (unacked) messages to another consumer. That safety net is exactly why manual ack matters." }
      ],
      table: {
        headers: ["Guarantee", "How you get it", "Cost"],
        rows: [
          ["<strong>At-most-once</strong>", "Auto-ack, transient messages", "Fast, but messages can be lost"],
          ["<strong>At-least-once</strong>", "Manual ack + durable queue + persistent msg + publisher confirms", "Safe, but duplicates possible \u2192 need idempotency (3.6)"],
          ["<strong>\u201cExactly-once\u201d</strong>", "At-least-once + <strong>idempotent consumer</strong> / dedup key (SQS FIFO offers it natively, capped throughput)", "No native exactly-once on RabbitMQ; you engineer the effect"]
        ]
      },
      callouts: [
        { color: "green", label: "Delivery guarantees in one line:", body: "RabbitMQ gives you <strong>at-least-once</strong> when you use manual acks with durability and publisher confirms. Exactly-once is not a broker feature, you achieve its effect with <strong>idempotent consumers</strong> (dedupe on a business key). Redelivery is normal, not an edge case." }
      ]
    },

    reliability: {
      heading: "Durability, Delivery Guarantees & Failure",
      intro: "A message is only as safe as its weakest link. Surviving a crash needs the queue, the message, and the publish all to be protected, and then you plan for each component failing.",
      points: [
        { label: "Persistent messages + durable queues", body: "To survive a broker restart you need <strong>both</strong>: a <strong>durable queue</strong> (its definition persists) and <strong>persistent messages</strong> (<code>delivery_mode=2</code>, written to disk). A persistent message in a non-durable queue, or vice versa, still vanishes on restart." },
        { label: "Message-loss scenarios", body: "Loss windows: a message published but not yet persisted when the broker dies; a message auto-acked then dropped on a consumer crash; a non-durable queue on restart. Each is closed by a specific control (confirms, manual ack, durability)." },
        { label: "Publisher confirms", body: "<code>confirm.select</code> makes the broker asynchronously ACK each publish once it is safely handled, so the producer knows the message was accepted (and persisted, for a durable target). Far faster than AMQP <strong>transactions</strong> (<code>tx.select</code>), which are correct but slow, prefer confirms." },
        { label: "Failure handling by component", body: "<strong>Producer</strong> crash: retry unconfirmed publishes (idempotent). <strong>Consumer</strong> crash: unacked messages redelivered. <strong>Broker</strong> crash: durable+persistent survives; HA needs clustering (see Scaling). <strong>Network</strong> failure: the connection drops, clients auto-recover and redeliver, so duplicates happen." },
        { label: "Database + queue consistency", body: "Writing to your DB and publishing to the broker is a <strong>dual write</strong>: either can fail after the other succeeds. Fix with the <strong>Transactional Outbox</strong>, write the event to an outbox table in the same DB transaction, then a relay publishes it (see Distributed Transactions 9.4, Event Sourcing 8.6). Combined with idempotent consumers you get reliable end-to-end delivery." }
      ],
      callouts: [
        { color: "red", label: "The three-part durability rule:", body: "Durable queue <strong>and</strong> persistent message <strong>and</strong> publisher confirms. Miss any one and there is a window where an accepted message is silently lost on a crash." }
      ]
    },

    retry: {
      heading: "Retries, Dead Lettering & Message Order",
      intro: "Real consumers fail. RabbitMQ has no built-in retry-with-backoff, you build it from <strong>TTL</strong> and a <strong>Dead Letter Exchange</strong>. And every retry mechanism has to reckon with ordering. The full DLQ playbook (redrive, alarms, recovery) lives in Dead Letter Queue (8.5).",
      points: [
        { label: "Dead Letter Exchange (DLX) & DLQ", body: "A message is <strong>dead-lettered</strong> when it is rejected/nacked with <code>requeue=false</code>, exceeds its <strong>TTL</strong>, or overflows a queue length limit. Set <code>x-dead-letter-exchange</code> on the queue and those messages route to a <strong>Dead Letter Queue</strong> for inspection instead of vanishing." },
        { label: "Delayed retry", body: "RabbitMQ has no native delay, so the standard trick is a <strong>retry (wait) queue</strong>: a message rejected on the main queue dead-letters into a queue with a TTL (say 30s) and no consumer; when the TTL expires it dead-letters back to the main exchange for another attempt. Chain several for exponential backoff, or use the delayed-message-exchange plugin." },
        { label: "Retry limits & poison messages", body: "Track attempts via the <code>x-death</code> header (or a custom count). After N retries, stop looping and route the <strong>poison message</strong> to a permanent parking-lot / DLQ so one bad payload never blocks the queue behind it." },
        { label: "Queue ordering", body: "A single queue with a single consumer is strictly <strong>FIFO</strong>. Order breaks the moment you add competing consumers (they process in parallel) or requeue a message (a <strong>requeued</strong> message returns near the head and can overtake, or fall behind, others)." },
        { label: "Ordering requirements", body: "If order truly matters, use one consumer per queue, or partition by key so each key\u2019s messages share one queue (the same idea as Kafka partition keys, see Ordering Guarantees 8.8). Accept that retries and redelivery inherently relax strict ordering." }
      ],
      callouts: [
        { color: "yellow", label: "The retry recipe:", body: "Main queue \u2192 on failure nack(requeue=false) \u2192 DLX \u2192 wait queue with TTL \u2192 (TTL expires) \u2192 back to main queue. Cap attempts with <code>x-death</code>, then divert poison messages to a parking-lot queue. This is how you get delayed, bounded retries on a broker that has neither built in." }
      ]
    },

    patterns: {
      heading: "Work Queues, Pub/Sub & Request-Reply",
      intro: "Three patterns cover the vast majority of queue usage. Each is just a particular choice of exchange, queues, and acknowledgment strategy.",
      points: [
        { label: "Work queues (task distribution)", body: "A producer drops <strong>background jobs</strong> on one queue; a <strong>pool of workers</strong> competes for them. The broker load-balances across workers, and <strong>prefetch tuning</strong> (fair dispatch) keeps a slow job from starving a worker. Use it for emails, image processing, report generation, any slow task you want off the request path." },
        { label: "Publish/Subscribe (fanout)", body: "Bind <strong>multiple queues</strong> to a <strong>fanout</strong> exchange so one published event reaches every subscriber, each with its own queue and consumers. \u201cOrder placed\u201d fans out to email, analytics, and inventory independently, add a new subscriber by binding a new queue, with no producer change." },
        { label: "Request/Reply (RPC)", body: "For a synchronous answer over messaging: the client publishes a request with a <strong>reply-to</strong> queue (often an exclusive, auto-delete callback queue) and a <strong>correlation ID</strong>; the server processes and publishes the response to that reply-to queue; the client matches the response by correlation ID. Always set a <strong>request timeout</strong>. Use it sparingly, if you mostly need request/response, a direct RPC/gRPC call (3.2) is often simpler than a broker." }
      ],
      callouts: [
        { color: "green", label: "Real-world examples:", body: "<strong>Order processing</strong> (work queue + fanout to fulfilment/email/analytics), <strong>notification & email</strong> pipelines, <strong>image/video processing</strong> workers, generic <strong>background jobs</strong>, <strong>microservice communication</strong>, and <strong>event-driven workflows</strong> that chain steps through exchanges." }
      ]
    },

    scaling: {
      heading: "Scaling, High Availability, Quorum Queues & Streams",
      intro: "Scaling is about spreading load off a single queue, and keeping data safe when a node dies. Modern RabbitMQ answers both with <strong>quorum queues</strong>, and adds a log-style <strong>Streams</strong> type for high fan-out.",
      points: [
        { label: "Scaling levers", body: "Add <strong>consumers</strong> to a queue, spread work across <strong>multiple queues</strong>, reuse <strong>connections with many channels</strong>, and add <strong>nodes</strong> to a cluster for horizontal capacity. A single <strong>hot queue</strong> is the usual bottleneck (it lives on one leader node), shard it across queues (e.g. the consistent-hash exchange) so load spreads." },
        { label: "High availability & clustering", body: "A <strong>cluster</strong> shares metadata across nodes so clients can connect to any node. For queue data to survive a node loss, the queue itself must be <strong>replicated</strong>. Classic mirrored queues are deprecated, <strong>quorum queues</strong> are the modern replicated queue." },
        { label: "Quorum queues & Raft", body: "A quorum queue replicates across an odd number of nodes using the <strong>Raft</strong> consensus algorithm (see Consensus Algorithms 9.3, Leader Election 11.7): one <strong>leader</strong> plus <strong>followers</strong>. A write is committed once a <strong>majority (quorum)</strong> acknowledges, so the queue tolerates the loss of a minority of nodes. If the leader dies, Raft elects a new one and processing continues, recovery is automatic." },
        { label: "Quorum requirements", body: "Use an odd replica count (3 or 5) so a majority is well-defined; 3 nodes tolerate 1 failure, 5 tolerate 2. Quorum queues favour <strong>data safety and predictable failover</strong> over the raw speed and per-message TTL flexibility of classic queues." },
        { label: "RabbitMQ Streams", body: "A separate <strong>append-only log</strong> queue type (conceptually like Redis Streams 7.7 / Kafka 8.2): messages are retained, consumption is <strong>non-destructive</strong>, and consumers track an <strong>offset</strong> so they can replay from any point. Built for very high throughput and large fan-out where many consumers each read the whole stream, use it when the delete-on-ack queue model does not fit." }
      ],
      callouts: [
        { color: "blue", label: "Queue vs Stream inside RabbitMQ:", body: "A classic/quorum <strong>queue</strong> deletes each message once one consumer ACKs it (work distribution). A <strong>stream</strong> keeps every message and lets many consumers replay by offset (fan-out + history). Same broker, two different delivery models, pick per use case." }
      ]
    },

    ops: {
      heading: "Security, Monitoring, Performance & End-to-End Design",
      intro: "Everything above has to run safely, be observable, perform, and come together into a coherent design. This tab is the operator\u2019s and architect\u2019s view.",
      points: [
        { label: "Security", body: "Create <strong>users</strong> with least-privilege <strong>permissions</strong> (configure/write/read regexes) scoped per <strong>virtual host</strong>; isolate apps or tenants with separate vhosts. Authenticate via the internal DB, LDAP, or OAuth2 (see Authentication 4.1, Authorization 4.2), and require <strong>TLS</strong> (4.3) so credentials and payloads are never in the clear." },
        { label: "Monitoring", body: "Watch <strong>queue depth</strong> (ready messages), <strong>unacked</strong> count, publish/deliver/ack <strong>rates</strong>, <strong>consumer count</strong>, and <strong>consumer lag</strong>; alert on <strong>memory / disk alarms</strong> (RabbitMQ blocks publishers under flow control). The <strong>Management UI</strong> and a Prometheus exporter are the standard tools (see Metrics 13.2, Monitoring & Alerting 13.4)." },
        { label: "Performance", body: "Tune <strong>prefetch</strong> to balance throughput vs fairness, <strong>batch</strong> publishes and use multiple-ack, reuse <strong>connections/channels</strong> instead of reopening them, and choose <strong>persistent vs transient</strong> deliberately, persistence costs disk I/O, so only pay for it when the message must survive a crash." },
        { label: "Production design checklist", body: "Every production queue wants: <strong>retry + DLQ</strong>, <strong>idempotent</strong> consumers, defined <strong>failure recovery</strong>, <strong>HA</strong> (quorum queues), a <strong>scaling</strong> plan for hot queues, <strong>monitoring</strong> with alarms, and <strong>capacity planning</strong> (peak rate, message size, retention) with the trade-offs written down." },
        { label: "End-to-end system design", body: "Design from requirements: (1) what events flow and who needs them \u2192 (2) choose the <strong>exchange</strong> type \u2192 (3) define the <strong>queues</strong> (durable? quorum?) \u2192 (4) define <strong>routing</strong> keys/bindings \u2192 (5) define <strong>consumers</strong> and concurrency \u2192 (6) pick an <strong>ACK + retry/DLQ</strong> strategy \u2192 (7) handle <strong>failures</strong> (outbox, idempotency) \u2192 (8) plan <strong>scaling</strong> and (9) <strong>HA</strong> \u2192 (10) wire up <strong>monitoring</strong>." }
      ],
      callouts: [
        { color: "yellow", label: "Worked example \u2013 order processing:", body: "Requirement: place an order, then email + update inventory + bill, reliably. Design: publish <code>order.created</code> to a <strong>topic</strong> exchange; bind durable <strong>quorum queues</strong> for email, inventory, billing; consumers use <strong>manual ack + prefetch</strong>, are <strong>idempotent</strong> on <code>order_id</code>, and dead-letter to per-queue DLQs after 3 delayed retries; the order service uses a <strong>transactional outbox</strong> so the DB write and the publish cannot diverge; alarms fire on DLQ depth &gt; 0 and consumer lag." }
      ]
    },

    handsOn: {
      goal: "Publish 100 durable orders through RabbitMQ, watch 3 competing workers share them one at a time, then kill a worker mid-message and see its unacked message redelivered instead of lost.",
      stack: "RabbitMQ (with its Management UI) in Docker plus Node.js <code>amqplib</code>. Local and free.",
      steps: [
        {
          title: "Start RabbitMQ with the Management UI",
          body: "The UI at <code>http://localhost:15672</code> (guest / guest) makes every queue count visible in real time.",
          code: "docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management",
          lang: "bash"
        },
        {
          title: "Install the client",
          code: "npm init -y && npm install amqplib",
          lang: "bash"
        },
        {
          title: "Publish 100 persistent orders",
          body: "A durable queue plus <code>persistent</code> messages and publisher confirms means nothing is lost if the broker restarts. Save as <code>publisher.js</code>.",
          code: "const amqp = require('amqplib');\n\n(async () => {\n  const conn = await amqp.connect('amqp://localhost');\n  const ch = await conn.createConfirmChannel();\n  await ch.assertQueue('orders.process', { durable: true });\n  for (let i = 1; i <= 100; i++) {\n    ch.sendToQueue('orders.process', Buffer.from(JSON.stringify({ order_id: i })), { persistent: true });\n  }\n  await ch.waitForConfirms();\n  console.log('published 100 orders');\n  await conn.close();\n})();",
          lang: "javascript"
        },
        {
          title: "Write a fair-dispatch worker",
          body: "<code>prefetch(1)</code> plus manual ack means a worker only gets a new message after it acks the current one. Save as <code>worker.js</code>.",
          code: "const amqp = require('amqplib');\nconst id = process.argv[2] || 'w1';\nconst sleep = (ms) => new Promise(r => setTimeout(r, ms));\n\n(async () => {\n  const conn = await amqp.connect('amqp://localhost');\n  const ch = await conn.createChannel();\n  await ch.assertQueue('orders.process', { durable: true });\n  ch.prefetch(1);\n  console.log(id, 'waiting for orders');\n  ch.consume('orders.process', async (msg) => {\n    const { order_id } = JSON.parse(msg.content.toString());\n    console.log(id, 'processing order', order_id);\n    await sleep(1000);\n    ch.ack(msg);\n  });\n})();",
          lang: "javascript"
        },
        {
          title: "Run 3 workers, then publish",
          body: "Three terminals for the workers, one to publish. Watch them round-robin the orders.",
          code: "node worker.js w1   # terminal 1\nnode worker.js w2   # terminal 2\nnode worker.js w3   # terminal 3\nnode publisher.js   # terminal 4",
          lang: "bash"
        },
        {
          title: "Kill a worker mid-message and watch redelivery",
          body: "Ctrl-C one worker while it is processing, then read the queue counts.",
          code: "docker exec rabbit rabbitmqctl list_queues name messages_ready messages_unacknowledged",
          lang: "bash"
        }
      ],
      observe: "Orders spread one at a time across the 3 workers (fair dispatch from <code>prefetch(1)</code>), and when you kill a worker mid-message its unacked order is redelivered to a survivor instead of vanishing: the at-least-once, competing-consumers guarantee seen live in the UI's ready and unacked counts.",
      stretch: "Add a Dead Letter Exchange plus a 5s TTL wait queue and make one message always throw, then watch it bounce main \u2192 wait \u2192 main and land in the DLQ after 3 attempts (lesson 8.5 built by hand). Prove idempotency too: process the same <code>order_id</code> twice and confirm your handler acts once."
    }
  },
  keyTakeaways: [
    "A message queue decouples producer from consumer: the producer publishes and moves on, the broker buffers, and a consumer pulls when ready, absorbing spikes and surviving downstream downtime.",
    "RabbitMQ is a smart-broker (AMQP) system, producers publish to an <strong>exchange</strong> that routes via <strong>bindings</strong> and a <strong>routing key</strong> to <strong>queues</strong>, while SQS is the managed alternative (Standard vs FIFO).",
    "Reliability is assembled: <strong>durable queue + persistent message + publisher confirms</strong> for durability, <strong>manual ack</strong> for redelivery, and <strong>idempotent consumers</strong> because delivery is at-least-once.",
    "RabbitMQ has no built-in retry, build <strong>delayed, bounded retries</strong> from TTL + a Dead Letter Exchange (8.5), and divert poison messages to a parking-lot DLQ so one bad message never blocks the queue.",
    "For HA use <strong>quorum queues</strong> (Raft: leader + followers, majority commit, automatic failover); for high-throughput replayable fan-out use <strong>RabbitMQ Streams</strong> (append-only, offset-based)."
  ],
  proTip: "Design every queue with its failure path first: manual acks, a DLQ with bounded delayed retries, and idempotent consumers keyed on a business ID. At-least-once means redelivery is normal operation, so a consumer that is not idempotent is a bug waiting for its first retry.",
  related: ["kafka", "pubsub", "messaging-comparison", "dlq", "ordering", "event-sourcing", "transactions", "consensus", "idempotent-apis", "redis-streams", "messaging-choice"],
  bridgeOut: "A queue delivers to exactly one consumer per message. The gap is what happens when multiple independent systems all need to see the same event: that is Kafka."
};
