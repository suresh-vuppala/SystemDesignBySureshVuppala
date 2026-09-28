/* === Lesson backpressure - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#backpressure)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["backpressure"] = {
  module: 10, num: "10.8", title: "Backpressure",
  connectsFrom: "A producer can generate work faster than a specific consumer can process it. Without a deliberate response, the consumer\u2019s queue grows unbounded until it runs out of memory and crashes.",
  tabs: {
    overview: {
      heading: "When the Consumer Cannot Keep Up",
      intro: "When the <strong>consumer cannot keep up</strong> with the producer, the system must decide: <strong>slow down</strong>, <strong>buffer</strong>, or <strong>shed load</strong>. The right choice depends on whether the data is lossless or freshness-first.",
      cards: [
        { icon: "1", title: "Drop / Load Shed", color: "red", body: "Discard oldest or lowest-priority (503). For <strong>freshness &gt; completeness</strong>: real-time metrics, ad bids, live video." },
        { icon: "2", title: "Slow the Producer", color: "orange", body: "Flow control: TCP\u2019s window, HTTP 429, a Kafka quota. Propagates the signal upstream for <strong>lossless</strong> pipelines." },
        { icon: "3", title: "Bounded Buffer + Block", color: "blue", body: "The producer <strong>blocks</strong> when the buffer is full. Reactive Streams, Go channels, Akka. No loss, but latency increases." },
        { icon: "4", title: "Scale Consumers", color: "green", body: "Add more consumers or partitions to match production rate. Kafka consumer groups, KEDA, SQS + Lambda." }
      ],
      table: {
        headers: ["Strategy", "Data loss?", "Latency impact", "When to use"],
        rows: [
          ["<strong>Drop / Load Shed</strong>", "<strong>Yes</strong>", "None (fast)", "Real-time, freshness &gt; completeness"],
          ["<strong>Bounded Buffer + Block</strong>", "No", "<strong>Increases</strong> (producer waits)", "Lossless, can tolerate delay"],
          ["<strong>Slow Producer (flow control)</strong>", "No", "Propagates upstream", "End-to-end flow control"],
          ["<strong>Scale Consumers</strong>", "No", "Temporary lag during scale-up", "Elastic workloads"],
          ["<strong>Sample / Aggregate</strong>", "Partial", "None", "High-volume telemetry"],
          ["<strong>Priority Queue</strong>", "Low-priority dropped", "None for high-priority", "Mixed-criticality traffic"]
        ]
      },
      callouts: [
        { color: "green", label: "Key insight:", body: "<strong>Always use bounded buffers.</strong> Unbounded queues are how outages turn into OOMs. Set buffer size from acceptable latency \u00d7 throughput rate, and <strong>alarm on queue depth</strong>: growing depth means the consumer is falling behind." },
        { color: "yellow", label: "Monitoring:", body: "Track <strong>consumer lag</strong> (Kafka), <strong>queue depth</strong> (SQS/RabbitMQ), <strong>buffer utilization %</strong>, and <strong>drop rate</strong>. Set alerts at 60% capacity (warning) and 80% (critical), and use those signals to trigger auto-scaling." },
        { color: "blue", label: "Built into every layer:", body: "<strong>Network/Transport</strong>: TCP sliding window, HTTP/2 WINDOW_UPDATE, gRPC per-stream flow control. <strong>Message brokers</strong>: Kafka consumer lag, RabbitMQ prefetch, SQS visibility timeout. <strong>Frameworks</strong>: Reactive Streams request(N), Go bounded channels, Node.js highWaterMark." }
      ]
    },
    realWorld: {
      heading: "Backpressure in Production",
      points: [
        { label: "Netflix", body: "RxJava backpressure across the streaming pipeline." },
        { label: "Uber", body: "QALM (queue-based adaptive load management), a named production implementation of this exact idea." },
        { label: "Twitter", body: "Finagle admission control rejects requests when the service is overloaded." },
        { label: "Kafka + KEDA", body: "Consumer lag triggers auto-scaling of workers, the \u201cscale consumers\u201d strategy wired to a real signal." }
      ]
    },
    tradeoffs: {
      heading: "How Backpressure Goes Wrong",
      intro: "The failure modes here are mostly about pretending the limit does not exist.",
      points: [
        { label: "Unbounded buffers", body: "An OOM is guaranteed under sustained load. The queue absorbs the mismatch right up until the process dies." },
        { label: "No backpressure signal", body: "The producer keeps flooding because nothing tells it to stop. Backpressure only works if the signal propagates upstream." },
        { label: "Dropping without metrics", body: "Silent data loss: you shed load but have no idea how much, so you cannot tell healthy shedding from an outage." },
        { label: "Blocking in async code", body: "Blocking to apply backpressure inside an event loop deadlocks it. The mechanism has to match the concurrency model." }
      ]
    },
    handsOn: {
      prerequisites: "The queue lab from Messaging (RabbitMQ or SQS).",
      setup: "Local and free: reuse the RabbitMQ container.",
      simulate: "Build a producer that pushes 1,000 messages/sec into a queue and a single consumer that can only process 100/sec (a deliberate <code>sleep</code>). Watch queue depth grow unbounded in the management UI. Then apply two fixes separately: (a) load shedding, where the producer drops messages once depth exceeds 5,000; (b) scale consumers, adding 9 more identical consumers so aggregate consumption matches production.",
      observe: "Three different, felt outcomes from the same overload: unbounded growth eventually exhausts memory or hits the broker\u2019s max queue length; load shedding plateaus depth at your ceiling; scaled consumers keep depth low because aggregate throughput now matches the producer\u2019s 1,000/sec.",
      stretch: "Implement a priority queue (RabbitMQ supports message priorities natively) and confirm a \u201cpayment\u201d message enqueued after 500 \u201canalytics\u201d messages still gets processed first: mixed-criticality handling, working."
    }
  },
  keyTakeaways: [
    "Backpressure is the deliberate response when a consumer falls behind a producer: <strong>slow down, buffer, or shed load</strong>, chosen by whether the data is lossless or freshness-first.",
    "<strong>Always bound the buffer</strong> and alarm on queue depth; unbounded queues turn overload into out-of-memory crashes.",
    "The signal must propagate upstream, and \u201cscale consumers\u201d is one valid response, which is exactly the mechanics of the next lesson."
  ],
  proTip: "Pick the strategy from the data, not the code: if a late item is worthless, drop it; if every item must survive, block or scale. Mixing the two on one stream is how you get silent loss where you needed durability.",
  related: ["rate-limiting", "auto-scaling", "graceful-degradation", "kafka"],
  bridgeOut: "\u201cScale consumers\u201d as one response is the full mechanics of the next lesson: auto-scaling."
};
