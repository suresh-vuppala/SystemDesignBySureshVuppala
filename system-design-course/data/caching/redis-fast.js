/* === Lesson redis-fast - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-fast)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-fast"] = {
  module: 7, num: "7.4", title: "Why Redis Is So Fast",
  connectsFrom: "A single Redis thread does 100,000 to a million operations a second, one thread, one core, no fleet of servers. Everything you have heard about needing more cores for performance, Redis seems to ignore.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "why", label: "Why It's Fast", icon: "cpu" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Fast on a Single Thread",
      intro: "Redis is fast because several design decisions compound to reach <strong>100K to 1M ops/sec</strong> on a single thread. The insight underneath: the bottleneck is the network, not the CPU, so one thread is enough. The full list of decisions lives in the <strong>Why It's Fast</strong> tab; these three carry most of the win.",
      cards: [
        { icon: "M", title: "In-Memory", color: "orange", body: "All data lives in <strong>RAM</strong>. RAM ~100ns vs disk ~10ms, roughly 100,000\u00d7 faster, and reads never touch disk." },
        { icon: "1", title: "Single-Threaded Core", color: "purple", body: "<strong>No locks, no context switching, no race conditions</strong>. Commands execute atomically, one at a time." },
        { icon: "P", title: "Pipelining", color: "green", body: "Batch many commands into one TCP round trip for up to <strong>10\u00d7 throughput</strong>, since the round trip, not the work, is the cost." }
      ],
      callouts: [
        { color: "purple", label: "The mental model:", body: "RAM ~100ns \u00b7 SSD ~100\u00b5s \u00b7 HDD ~10ms. A single GET/SET does 100K to 1M ops/sec; pipelining adds up to 10\u00d7. The bottleneck is the <strong>network</strong>, not the CPU, so one thread is enough." }
      ]
    },
    why: {
      heading: "Six Compounding Decisions, Plus One",
      intro: "No single trick makes Redis fast. Six decisions compound, and a seventh helps at the edges. Each one removes a cost that a traditional disk-based, multi-threaded, SQL database pays on every request.",
      table: {
        headers: ["Decision", "Why It Helps"],
        rows: [
          ["<strong>In-Memory</strong>", "All data in RAM. RAM ~100ns vs disk ~10ms = 100,000\u00d7 faster"],
          ["<strong>Single-Threaded Core</strong>", "No locks, no context switching, no race conditions; commands run atomically"],
          ["<strong>Non-Blocking I/O</strong>", "<code>epoll</code> multiplexing lets one thread watch 100K+ sockets"],
          ["<strong>Efficient Internals</strong>", "SDS strings, ziplist, skiplist encodings, all CPU cache-friendly"],
          ["<strong>Simple Protocol (RESP)</strong>", "Plain text, O(1) parsing, near-free to decode"],
          ["<strong>Pipelining</strong>", "Batch many commands in one TCP round trip, up to 10\u00d7 throughput gain"],
          ["<strong>No Query Planner</strong>", "Commands are direct operations; no SQL parsing, no optimizer (the bonus seventh)"]
        ]
      },
      callouts: [
        { color: "green", label: "Version notes:", body: "<strong>Redis 6.0+</strong> added I/O threads for network read/write, but command execution stays single-threaded. <strong>Redis 7.0</strong> added functions, multi-part AOF, and sharded pub/sub." }
      ]
    },
    tradeoffs: {
      heading: "Where The Single Thread Bites",
      points: [
        { label: "One slow command blocks everything", body: "`SMEMBERS` on a huge set, or `KEYS *` in production, stalls every request queued behind it. Use `SCAN` instead, which returns incrementally rather than all at once." },
        { label: "Big keys are dangerous", body: "A single very large value or collection ties up the event loop while it is processed, hurting every other client." },
        { label: "I/O threads are not command threads", body: "Redis 6.0+ parallelizes reading network bytes only, never running commands. RAM is the hard ceiling; use Redis Cluster to shard beyond a single node's limits." }
      ]
    },
    handsOn: {
      goal: "Measure Redis throughput on your own machine and watch pipelining multiply it, turning the up-to-10\u00d7 claim into a real number.",
      stack: "Redis in Docker with the bundled <code>redis-benchmark</code>. Local and free.",
      steps: [
        {
          title: "Start Redis",
          code: "docker run -d --name redis -p 6379:6379 redis",
          lang: "bash"
        },
        {
          title: "Benchmark plain SET and GET",
          body: "One command per round trip. Note the ops/sec it reports.",
          code: "docker exec redis redis-benchmark -t set,get -n 100000 -q",
          lang: "bash"
        },
        {
          title: "Benchmark again with pipelining",
          body: "<code>-P 16</code> sends 16 commands per round trip, amortizing network cost.",
          code: "docker exec redis redis-benchmark -t set,get -n 100000 -P 16 -q",
          lang: "bash"
        },
        {
          title: "Prove one slow command blocks the single thread",
          body: "Load a big set, then compare a blocking <code>KEYS *</code> to an incremental <code>SCAN</code> while a second session issues commands.",
          code: "docker exec redis sh -c 'for i in $(seq 1 1000000); do echo \"SADD bigset item$i\"; done | redis-cli'\ndocker exec redis redis-cli --scan --pattern '*' | head -n 5",
          lang: "bash"
        }
      ],
      observe: "Ops/sec climbs substantially with <code>-P 16</code> enabled: a concrete number next to the up-to-10\u00d7 throughput claim, measured on your own machine instead of taken on faith. The bottleneck was the round trip, not the CPU.",
      stretch: "Open two <code>redis-cli</code> sessions. In one, run <code>KEYS *</code> against the millon-member set; in the other, issue a <code>GET</code>. The <code>GET</code> visibly stalls until <code>KEYS</code> finishes, because both share one command thread. Repeat with <code>SCAN 0 COUNT 100</code> and the stall disappears."
    }
  },
  keyTakeaways: [
    "Redis's speed is not one trick but six compounding ones: in-memory data, a single-threaded core, non-blocking epoll I/O, cache-friendly internals, the RESP protocol, and pipelining.",
    "The bottleneck is the network, not the CPU, which is why a single command thread comfortably serves 100K to 1M ops/sec.",
    "The same single thread means one slow command (KEYS *, SMEMBERS on a huge set) blocks everyone; use SCAN and avoid big keys."
  ],
  proTip: "Never run `KEYS *` against a production instance. It is O(n) and blocks the single command thread for every other client; `SCAN` walks the keyspace incrementally and keeps Redis responsive.",
  related: ["redis", "redis-cache", "event-loop", "memcached-vs-redis", "concurrency-io"],
  bridgeOut: "Structures plus speed combine into Redis's single most common production job: sitting in front of a database as a cache."
};
