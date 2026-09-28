/* === Lesson throughput-numbers - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#throughput-numbers)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["throughput-numbers"] = {
  module: 14, num: "14.2", title: "Throughput Numbers",
  connectsFrom: "14.1 covered how long one operation takes. This is the other axis: how many operations per second a component can sustain. These capacity benchmarks are what you reach for when sizing a system on the back of an envelope.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "benchmarks", label: "System Benchmarks", icon: "hex" },
    { key: "concurrency", label: "Concurrency Models", icon: "cpu" },
    { key: "realWorld", label: "Why the Ceiling", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Capacity Benchmarks for Common Systems",
      intro: "Numbers assume modern (2024) hardware with proper tuning. The spread is enormous: an in-memory store like <strong>Redis does 100K-1M ops/sec</strong> while a single indexed <strong>Postgres node does ~10-30K reads/sec</strong>. Memorize the relative order, then remember the two ceilings that bite in interviews: DynamoDB per-partition (3K RCU, 1K WCU) and S3 per-prefix (5,500 GET/sec, 3,500 PUT/sec).",
      cards: [
        { icon: "E", title: "Event-Driven", color: "green", body: "A single thread multiplexes many sockets via <strong>epoll/kqueue</strong>. The most connections per server, ideal for idle-heavy WebSocket and long-poll workloads." },
        { icon: "L", title: "Lightweight Threads", color: "blue", body: "Runtime-scheduled tasks (goroutines, Erlang processes, virtual threads). Blocking-style code that still scales to <strong>~1M concurrent tasks</strong>." },
        { icon: "O", title: "OS Threads", color: "orange", body: "One kernel thread per connection. Simple but expensive (stack + context switch), so it tops out in the <strong>low thousands</strong>." }
      ],
      callouts: [
        { color: "blue", label: "Scaling Rule:", body: "For WebSocket-heavy apps (chat, gaming, live updates), budget <strong>500K connections per server</strong> with epoll. For request/response APIs, budget <strong>10-50K RPS per server</strong> depending on processing complexity." }
      ]
    },
    benchmarks: {
      heading: "System Throughput Benchmarks",
      intro: "Sustained read/write throughput for common datastores and network components on tuned 2024 hardware. Memorize the relative order; the caches sit ~10-100\u00d7 above the relational nodes.",
      table: {
        headers: ["System", "Read Throughput", "Write Throughput", "Notes"],
        rows: [
          ["<strong>PostgreSQL</strong>", "~10-30K reads/sec", "~1-5K writes/sec", "Single node, indexed queries"],
          ["<strong>MySQL (InnoDB)</strong>", "~10-25K reads/sec", "~1-5K writes/sec", "Similar to Postgres"],
          ["<strong>Redis</strong>", "~100K-1M ops/sec", "~100K-500K ops/sec", "In-memory, single-threaded per shard"],
          ["<strong>Memcached</strong>", "~200K-1M ops/sec", "~200K-1M ops/sec", "Multi-threaded, simple K/V"],
          ["<strong>Cassandra</strong>", "~20-50K reads/sec/node", "~50-100K writes/sec/node", "Write-optimized LSM tree"],
          ["<strong>DynamoDB</strong>", "Unlimited (auto-scale)", "Unlimited (auto-scale)", "Per-partition: 3K RCU, 1K WCU"],
          ["<strong>MongoDB</strong>", "~20-50K reads/sec", "~10-30K writes/sec", "Single node, WiredTiger"],
          ["<strong>Kafka</strong>", "~1M+ msg/sec (consume)", "~1M+ msg/sec (produce)", "Per cluster, partitioned"],
          ["<strong>RabbitMQ</strong>", "~20-50K msg/sec", "~20-50K msg/sec", "Per node, persistent"],
          ["<strong>Elasticsearch</strong>", "~10-50K queries/sec", "~10-50K docs/sec indexing", "Depends on query complexity"],
          ["<strong>S3</strong>", "~5,500 GET/sec/prefix", "~3,500 PUT/sec/prefix", "Partition prefixes for more"],
          ["<strong>NGINX / HAProxy</strong>", "~100K-500K concurrent connections", "(event-driven)", "Non-blocking, epoll/kqueue"],
          ["<strong>gRPC</strong>", "~50-100K RPC/sec per server", "(HTTP/2)", "Multiplexed streams"]
        ]
      },
      callouts: [
        { color: "green", label: "Horizontal beats vertical:", body: "Scaling out means <strong>more servers, not bigger servers</strong>. A single box has a hard ceiling; a fleet behind a load balancer does not." }
      ]
    },
    concurrency: {
      heading: "Connections by Concurrency Model",
      intro: "How many concurrent connections or tasks a single server holds is decided by its concurrency model. The three tiers differ by roughly two orders of magnitude.",
      table: {
        headers: ["Event-Driven (epoll/kqueue)", "Connections"],
        rows: [
          ["<strong>NGINX</strong>", "500K-1M"],
          ["<strong>Node.js (libuv)</strong>", "100K-500K"],
          ["<strong>Netty (Java)</strong>", "100K-500K"],
          ["<strong>WebSocket server</strong>", "500K-1M"]
        ]
      },
      tables: [
        {
          headers: ["Lightweight Threads", "Concurrency"],
          rows: [
            ["<strong>Go goroutines</strong>", "100K-1M"],
            ["<strong>Erlang processes</strong>", "1M+"],
            ["<strong>Java virtual threads</strong>", "100K-1M"],
            ["<strong>Rust async (tokio)</strong>", "500K-1M"]
          ]
        },
        {
          headers: ["OS Threads", "Threads"],
          rows: [
            ["<strong>Java (platform)</strong>", "5K-10K"],
            ["<strong>Python (GIL)</strong>", "~1K effective"],
            ["<strong>C++ threads</strong>", "10K-50K"],
            ["<strong>Linux max</strong>", "~32K default"]
          ]
        }
      ]
    },
    realWorld: {
      heading: "Why the Concurrency Model Sets the Ceiling",
      intro: "A technology\u2019s connections-per-server number is not arbitrary; it is a direct consequence of how it handles concurrency, the same trade-off covered in the concurrency and I/O lessons.",
      points: [
        { label: "Event-driven wins on idle connections", body: "NGINX and Node.js hold hundreds of thousands of mostly-idle sockets because a single thread multiplexes them with epoll. Perfect for WebSockets and long-poll." },
        { label: "Lightweight threads win on simplicity", body: "Go and Erlang give you blocking-style code that still scales to a million concurrent tasks, because the runtime, not the OS, schedules them." },
        { label: "OS threads hit a wall fast", body: "One OS thread per connection means stack memory and context-switch cost per connection, so classic thread-per-request servers top out in the thousands." },
        { label: "The hard per-partition ceilings", body: "DynamoDB caps a single partition at 3,000 RCU / 1,000 WCU, and S3 caps a single prefix at 5,500 GET / 3,500 PUT per second. Both scale by spreading keys across more partitions or prefixes." }
      ]
    },
    handsOn: {
      prerequisites: "`redis-benchmark`, a Postgres client, and optionally `hey` or `k6`.",
      setup: "Local and free: reuse your Redis and Postgres containers from earlier labs.",
      simulate: "Run `redis-benchmark -q` with defaults and note the reported ops/sec for SET and GET. Then run a sustained write benchmark against Postgres (a script doing 100,000 single-row inserts) and compute its inserts/sec. Compare both against the table above.",
      observe: "Your two numbers should land in the expected relative order: Redis dramatically higher than a single-writer Postgres insert loop. That is the abstract comparison table turned into something you measured yourself.",
      stretch: "Batch the Postgres inserts (a single multi-row INSERT, or a transaction wrapping 1,000 inserts) and remeasure. Quantify how much throughput a simple batching change buys, connecting directly back to the I/O-bound concurrency lesson."
    }
  },
  keyTakeaways: [
    "In-memory stores (Redis, Memcached) do <strong>100K-1M ops/sec</strong>; a single relational node does <strong>~10-30K reads and 1-5K writes/sec</strong>. That gap is why caches exist.",
    "Connections per server are set by the concurrency model: event-driven (500K-1M) &gt; lightweight threads (100K-1M) &gt; OS threads (single-digit thousands).",
    "Watch the hard ceilings: DynamoDB per-partition (3K RCU / 1K WCU) and S3 per-prefix (5,500 GET / 3,500 PUT). You scale past them by spreading keys."
  ],
  proTip: "Size the fleet from two anchors: <strong>~500K connections/server</strong> for WebSocket workloads and <strong>~10-50K RPS/server</strong> for APIs. Divide your peak load by the right anchor and you have a server count in seconds.",
  related: ["latency-numbers", "storage-numbers", "estimation", "interview-reference", "cost-numbers"],
  bridgeOut: "You now know how fast one operation is and how many per second a component sustains. The third estimation axis is space: how much storage the data actually takes."
};
