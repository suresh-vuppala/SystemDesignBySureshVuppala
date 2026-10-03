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
      goal: "Prove Kafka guarantees order only within a partition: tag events with sequence numbers and watch same-key events stay ordered while mixed-key events do not.",
      stack: "The Kafka lab from 8.2 (<code>apache/kafka</code> in Docker, topic <code>rides</code> with 3 partitions) + the bundled CLI. Local and free.",
      steps: [
        {
          title: "Produce 30 events, all keyed trip-1",
          body: "Every event shares the key <code>trip-1</code>, so all 30 hash to the same partition.",
          code: "for i in $(seq 1 30); do echo \"trip-1:{\\\"seq\\\":$i}\"; done | \\\n  docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh \\\n    --topic rides --bootstrap-server localhost:9092 \\\n    --property parse.key=true --property key.separator=:",
          lang: "bash"
        },
        {
          title: "Consume and print key + partition",
          body: "Read the seq values in arrival order. For the single key they climb 1, 2, 3, ... with no gaps.",
          code: "docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh \\\n  --topic rides --from-beginning --timeout-ms 8000 \\\n  --property print.key=true --property print.partition=true \\\n  --bootstrap-server localhost:9092",
          lang: "bash"
        },
        {
          title: "Produce 30 mixed-key events",
          body: "Even <code>seq</code> keeps key <code>trip-1</code>; odd <code>seq</code> uses a random key, scattering those across partitions.",
          code: "for i in $(seq 1 30); do \\\n  if [ $((i%2)) -eq 0 ]; then echo \"trip-1:{\\\"seq\\\":$i}\"; \\\n  else echo \"k$RANDOM:{\\\"seq\\\":$i}\"; fi; \\\ndone | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh \\\n    --topic rides --bootstrap-server localhost:9092 \\\n    --property parse.key=true --property key.separator=:",
          lang: "bash"
        },
        {
          title: "Consume again and inspect relative order",
          body: "Filter to the <code>trip-1</code> partition and confirm its seq values are still monotonic among themselves, even though other keys interleave across partitions.",
          code: "docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh \\\n  --topic rides --from-beginning --timeout-ms 8000 \\\n  --property print.key=true --property print.partition=true \\\n  --bootstrap-server localhost:9092",
          lang: "bash"
        }
      ],
      observe: "The pure <code>trip-1</code> run arrives in exact seq order every time (same partition, guaranteed order). In the mixed run the <code>trip-1</code> events are still ordered relative to each other, but there is no consistent global order across the random-keyed events on other partitions: the \"only within a partition\" claim, demonstrated with your own sequence numbers instead of trusted on faith.",
      stretch: "Increase the topic's partition count with <code>kafka-topics.sh --alter --partitions 6</code> while a consumer runs, watch the rebalance, and check whether new <code>trip-1</code> events now hash to a different partition (breaking order against the old ones) and whether sticky assignment reduces the shuffling."
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
