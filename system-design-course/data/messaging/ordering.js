/* === Lesson ordering - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#ordering)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["ordering"] = {
  module: 8, num: "8.8", title: "Ordering Guarantees",
  connectsFrom: "Kafka guarantees order only within a partition. Where that guarantee holds, and where it silently does not, is worth being explicit about, because it is critical for financial transactions, state machines, and causal consistency.",
  tabs: {
    overview: {
      heading: "Where Order Holds, and Where It Does Not",
      intro: "Message order is preserved in some places and quietly lost in others. The <strong>partition key</strong> decides what stays ordered together: the same key routes to the same partition, keeping that entity\u2019s events in sequence, while different keys process in parallel with <strong>no ordering between them</strong>.",
      cards: [
        { icon: "K", title: "Partition Key Design", color: "green", body: "<strong>userId</strong> orders all of a user\u2019s events; <strong>orderId</strong> orders one order\u2019s lifecycle; <strong>accountId</strong> orders financial transactions; <strong>deviceId</strong> orders IoT telemetry. Watch for hot keys: a popular user becomes a partition hotspot." },
        { icon: "W", title: "Within-Partition Only", color: "orange", body: "Order is guaranteed <strong>within</strong> a single partition, never across partitions. Assuming global order in a multi-partition topic is a bug waiting to happen." },
        { icon: "X", title: "Cross-Partition Ordering", color: "blue", body: "When one key is not enough: embed <strong>sequence numbers</strong> in the payload, use <strong>vector clocks</strong> or <strong>Lamport timestamps</strong>, or an external sequencer (Redis <code>INCR</code> or a DB sequence, at the cost of a bottleneck)." }
      ],
      table: {
        headers: ["Broker", "Order Scope", "Mechanism", "Throughput Impact"],
        rows: [
          ["<strong>Kafka</strong>", "Per-partition (key \u2192 partition)", "<code>murmur2(key) % numPartitions</code>", "More partitions = more parallelism, less global order"],
          ["<strong>SQS Standard</strong>", "Best effort, <strong>may reorder</strong>", "Distributed architecture, no ordering guarantee", "Unlimited throughput"],
          ["<strong>SQS FIFO</strong>", "Strict per <code>MessageGroupId</code>", "Deduplication + sequencing per group", "<strong>3,000 msg/sec</strong> (batching: 30K)"],
          ["<strong>RabbitMQ</strong>", "Per queue (single consumer)", "FIFO within a single queue", "Prefetch count affects perceived order"],
          ["<strong>Pub/Sub</strong>", "Optional ordering keys", "<code>orderingKey</code> on publish", "Ordered messages go to same region"],
          ["<strong>Kinesis</strong>", "Per shard (partition key)", "<code>MD5(partitionKey)</code> \u2192 shard", "1 MB/sec or 1000 records/sec per shard"],
          ["<strong>Azure Event Hubs</strong>", "Per partition", "Partition key \u2192 consistent hash", "1 MB/sec ingress per throughput unit"]
        ]
      },
      callouts: [
        { color: "green", label: "Key Insight:", body: "<strong>Use a stable partition key</strong> (userId, accountId, orderId) so all related events land in the same partition and stay ordered. Choose the key based on your <strong>consistency boundary</strong>: what entity needs its events in order?" },
        { color: "yellow", label: "Rebalancing risk:", body: "When partitions are added or removed, key-to-partition mapping changes. Use <strong>sticky partitioning</strong> or <strong>consistent hashing</strong> to minimize disruption. During a rebalance, consumers may see temporary out-of-order delivery: handle it with a <strong>buffering + reordering window</strong>." }
      ]
    },
    tradeoffs: {
      heading: "Ordering Anti-Patterns",
      intro: "Most ordering bugs come from a poorly chosen key or an assumption that does not hold across partitions.",
      points: [
        { label: "Random partition key", body: "Spreading one entity\u2019s events across partitions destroys ordering entirely." },
        { label: "Too few partitions", body: "A single key funnels everything into one partition, creating a throughput bottleneck." },
        { label: "Assuming global order", body: "There is no total order across a multi-partition topic. Only per-partition order is guaranteed." },
        { label: "Processing out-of-order without idempotency", body: "If a rebalance or retry reorders events, non-idempotent handlers corrupt state. Idempotency is the backstop." }
      ]
    },
    handsOn: {
      prerequisites: "The Kafka lab from 8.2.",
      setup: "Local and free: the same Kafka container.",
      simulate: "Produce 30 events for `trip_id=trip-1` in quick succession, each with an incrementing sequence number in the payload (`{seq: 1}`, `{seq: 2}`, ...). Consume them and print the order they arrive in. Then produce another 30 events but key half with `trip-1` and half with a random key, and check whether the `trip-1`-keyed ones still arrive in order relative to each other once mixed with the others.",
      observe: "The pure `trip-1`-keyed sequence arrives in exact order every time (same partition, guaranteed order), while events split across partitions have no guaranteed relative order: the \u201conly within a partition\u201d claim, demonstrated with your own sequence numbers instead of trusted on faith.",
      stretch: "Increase the topic\u2019s partition count while consumers are running and watch a rebalance occur. Check whether any `trip-1` events briefly appear out of order around the rebalance, and whether sticky partition assignment reduces how much shuffling happens."
    }
  },
  keyTakeaways: [
    "Order is guaranteed <strong>only within a partition</strong>, decided by the partition key; there is no total order across a multi-partition topic.",
    "Pick the key by your <strong>consistency boundary</strong> (userId, orderId, accountId); a random key destroys ordering and a skewed key creates hot partitions.",
    "When one key is not enough, restore order with <strong>sequence numbers, vector clocks, Lamport timestamps, or an external sequencer</strong>, and keep handlers idempotent for rebalances."
  ],
  proTip: "Before trusting order, ask which key routes these events and whether they ever span partitions. If they can, embed a sequence number so the consumer can detect and reorder gaps itself.",
  related: ["kafka", "event-sourcing", "message-queues", "schema-registry", "clocks"],
  bridgeOut: "Every messaging lesson so far assumes producer and consumer agree on the message shape. Enforcing that agreement as both evolve is the last gap in this module: the Schema Registry."
};
