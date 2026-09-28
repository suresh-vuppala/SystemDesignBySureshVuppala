/* === Lesson kafka - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#kafka)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["kafka"] = {
  module: 8, num: "8.2", title: "Apache Kafka",
  connectsFrom: "A queue delivers a message once and it is gone. But often multiple, completely independent systems (analytics, fraud detection, notifications) need to react to the same event, and if one of them was offline, it needs to replay history, not just get the next new message.",
  tabs: {
    overview: {
      heading: "A Durable, Replayable, Ordered Log",
      intro: "Kafka appends messages to a <strong>durable ordered log</strong> instead of deleting them after delivery. That gives you <strong>1M+ events/sec</strong>, replayable history, and multiple independent readers all consuming the same stream at their own pace.",
      cards: [
        { icon: "P", title: "Partition", color: "blue", body: "One ordered physical log inside a topic. Order is guaranteed <strong>within</strong> a partition, never across them. A producer sends by key: <code>hash(key) % numPartitions</code> keeps one entity\u2019s events together." },
        { icon: "O", title: "Offset", color: "green", body: "A consumer\u2019s bookmark, its position in a partition. Because messages are retained, a consumer can <strong>rewind and replay</strong> from any offset." },
        { icon: "G", title: "Consumer Group", color: "purple", body: "Each partition goes to exactly one consumer <strong>within</strong> a group, but every group reads the full topic independently." }
      ],
      table: {
        headers: ["Concept", "Detail", "Guarantee"],
        rows: [
          ["<strong>Partition</strong>", "Unit of parallelism. Append-only log.", "<strong>Ordered within partition</strong>, not across."],
          ["<strong>Offset</strong>", "Sequential ID per message.", "Consumer can <strong>rewind/replay</strong> from any offset."],
          ["<strong>ISR</strong>", "In-Sync Replicas caught up with the leader.", "<code>acks=all</code> + <code>min.insync.replicas=2</code> = <strong>no data loss</strong>."],
          ["<strong>Consumer Group</strong>", "Each partition \u2192 exactly 1 consumer per group.", "Multiple groups = <strong>independent reads</strong>."],
          ["<strong>Compacted Topic</strong>", "Keep latest value per key.", "State snapshots, changelogs."],
          ["<strong>KRaft</strong>", "Replaces ZooKeeper (Kafka 3.3+).", "Simpler operations."]
        ]
      },
      tables: [
        {
          headers: ["Config", "Setting", "Effect"],
          rows: [
            ["<strong>acks=all + min.insync=2</strong>", "Producer waits for 2+ replicas", "<strong>Zero data loss</strong> (even if 1 broker dies)"],
            ["<strong>enable.idempotence=true</strong>", "Sequence numbers per producer", "<strong>No duplicates</strong> on retry"],
            ["<strong>Transactions</strong>", "Atomic multi-partition writes", "<strong>Exactly-once</strong> end-to-end"],
            ["<strong>Unclean leader election=false</strong>", "Only ISR members can become leader", "<strong>No data loss</strong> (may reduce availability)"],
            ["<strong>Log compaction</strong>", "Keep latest value per key", "State snapshots, changelogs (KTable)"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Delivery Guarantees:", body: "<strong>At-most-once</strong> (acks=0, lossy). <strong>At-least-once</strong> (acks=all, may duplicate). <strong>Exactly-once</strong> (idempotent producer + transactions)." },
        { color: "blue", label: "A single event\u2019s journey:", body: "producer \u2192 partitioner (hashes the key to pick a partition) \u2192 leader broker writes it \u2192 ISR replicas copy it \u2192 an ack is sent back \u2192 a consumer polls and commits its offset." }
      ]
    },
    realWorld: {
      heading: "Where Kafka Runs",
      intro: "Kafka is the backbone of event pipelines at massive scale, and it shows up in five recurring shapes.",
      points: [
        { label: "LinkedIn", body: "4T+ events per day. Kafka originated at LinkedIn." },
        { label: "Uber", body: "Trip events and surge pricing flow through Kafka." },
        { label: "Netflix", body: "The recommendations pipeline is fed by Kafka streams." },
        { label: "Five top use cases", body: "Event Streaming (producers \u2192 Kafka \u2192 Spark), Log Aggregation (services \u2192 Kafka \u2192 ELK), Message Queuing (decoupled async with replay), Web Activity Tracking (clicks \u2192 dashboards), and CDC / data replication (Debezium \u2192 Kafka \u2192 many databases)." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of the Log",
      intro: "A durable, partitioned log is powerful but not free.",
      points: [
        { label: "Operational complexity", body: "Running brokers, partitions, replication, and consumer groups is heavier than a managed queue. KRaft removes the ZooKeeper dependency but does not make it trivial." },
        { label: "Ordering per partition only", body: "There is no global order across a topic. If you need ordering, you must design the partition key around it." },
        { label: "No per-message acking", body: "Consumers commit offsets, not individual messages, so redelivery is coarser than a queue\u2019s per-message ACK/NACK." },
        { label: "Overkill for low volume", body: "For a handful of messages per second, a simple queue is cheaper and simpler than a broker cluster." }
      ]
    },
    handsOn: {
      prerequisites: "Docker Compose (Kafka + KRaft image, or Confluent\u2019s all-in-one dev image); `kafka-console-producer`/`kafka-console-consumer` (ship with Kafka) or `kcat`.",
      setup: "Local and free: `docker run -d apache/kafka` (KRaft mode, no ZooKeeper needed) or Confluent\u2019s `cp-all-in-one` Compose file.",
      simulate: "Create a topic with 3 partitions (`kafka-topics.sh --create --topic rides --partitions 3`), produce 20 events keyed by `trip_id` (for example `trip-1`, `trip-2`, `trip-3` repeating), and start 2 consumers in the same consumer group. Run `kafka-consumer-groups.sh --describe` to see which partitions each consumer owns.",
      observe: "All events for the same `trip_id` land in the same partition every time, because <code>hash(key) % 3</code> is deterministic. Start a 3rd consumer in the same group and watch a partition rebalance happen live; with only 3 partitions, a 4th consumer would sit idle.",
      stretch: "Kill one consumer mid-stream without committing its last offset, restart it, and confirm it resumes from its last committed offset (possibly reprocessing a few messages), at-least-once delivery observed directly instead of described."
    }
  },
  keyTakeaways: [
    "Kafka is a <strong>durable, ordered, replayable log</strong>: messages are retained, so many independent consumer groups can each read the full topic at their own pace.",
    "Order is guaranteed only <strong>within a partition</strong>; producers partition by key (<code>hash(key) % numPartitions</code>) to keep one entity\u2019s events ordered while others process in parallel.",
    "Delivery can be tuned from at-most-once (acks=0) to exactly-once (idempotent producer + transactions), trading latency and complexity for stronger guarantees."
  ],
  proTip: "Choose your partition key by asking \u201cwhat entity needs its events in order?\u201d The key decides both ordering and parallelism, and a bad key either destroys ordering or creates a hot partition.",
  related: ["message-queues", "pubsub", "messaging-comparison", "event-sourcing", "ordering", "schema-registry", "redis-streams", "cdc", "pipeline-schema-registry", "realtime-analytics", "stream-processing", "messaging-choice", "cqrs", "dlq", "logging", "tracing", "auto-scaling", "backpressure"],
  bridgeOut: "The durable log and consumer-group model here is the exact substrate that Event Sourcing (8.6) and CDC both build on. First, the managed broadcast alternative: Pub/Sub."
};
