/* === Lesson memcached-vs-redis - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#memcached-vs-redis)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.11.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["memcached-vs-redis"] = {
  module: 7, num: "7.11", title: "Memcached vs Redis",
  connectsFrom: "Both are in-memory stores. This is the honest comparison against the other classic option, so you can defend the choice instead of defaulting to Redis by habit.",
  tabs: {
    overview: {
      heading: "Swiss Army Knife vs Speed Demon",
      intro: "<strong>Redis</strong> is the Swiss army knife: rich structures, persistence, pub/sub, streams, locks. <strong>Memcached</strong> is the simple speed demon: pure key-value, multi-threaded, nothing else. The multi-threaded design can beat single-threaded Redis on raw GET/SET at high concurrency on a many-core box.",
      cards: [
        { icon: "R", title: "Redis strengths", color: "red", body: "Rich data structures, RDB/AOF persistence, built-in replication and Cluster, pub/sub, Lua scripting, 512MB max value, 8 eviction policies." },
        { icon: "M", title: "Memcached strengths", color: "teal", body: "Multi-threaded, scales across CPU cores; a slab allocator keeps memory fragmentation low. Pure key-value, no persistence, LRU only." },
        { icon: "=", title: "Value size", color: "orange", body: "Redis accepts values up to <strong>512MB</strong>; Memcached's default limit is <strong>1MB</strong>, so large objects are rejected outright." }
      ],
      table: {
        headers: ["", "Redis", "Memcached"],
        rows: [
          ["<strong>Data Structures</strong>", "Rich: strings, hashes, lists, sets, sorted sets, streams, geo, HLL", "Strings only (key \u2192 blob)"],
          ["<strong>Threading</strong>", "Single-threaded core (I/O threads in 6.0+)", "Multi-threaded, scales with CPU cores"],
          ["<strong>Persistence</strong>", "RDB + AOF, survives restarts", "None, pure volatile cache"],
          ["<strong>Replication</strong>", "Built-in: master-replica, Sentinel, Cluster", "None (client-side sharding)"],
          ["<strong>Pub/Sub</strong>", "Yes, channels + streams", "No"],
          ["<strong>Max Value Size</strong>", "512 MB", "1 MB (default)"],
          ["<strong>Memory Efficiency</strong>", "Higher overhead (metadata per key)", "Slab allocator, less fragmentation"],
          ["<strong>Eviction</strong>", "8 policies (LRU, LFU, volatile, etc.)", "LRU only"],
          ["<strong>Scripting</strong>", "Lua scripts, atomic multi-step ops", "No"],
          ["<strong>Best For</strong>", "Sessions, leaderboards, queues, pub/sub, locks", "Simple key-value cache at massive scale"]
        ]
      },
      callouts: [
        { color: "green", label: "When to pick Memcached:", body: "You only need simple <code>GET/SET</code> caching, want <strong>multi-threaded performance</strong> on a single node, and do not need persistence or data structures. Facebook's TAO uses Memcached for billions of social graph lookups." },
        { color: "yellow", label: "When to pick Redis:", body: "You need <strong>data structures</strong> (sorted sets for leaderboards, lists for queues), <strong>persistence</strong>, <strong>pub/sub</strong>, <strong>Lua scripting</strong>, or <strong>built-in HA</strong>. Most modern systems default to Redis unless they have a specific Memcached use case." }
      ]
    },
    tradeoffs: {
      heading: "Where Simpler Wins",
      points: [
        { label: "Raw throughput at high concurrency", body: "Memcached's multi-threaded design can outperform single-threaded Redis on pure GET/SET on a multi-core machine, a real, measurable case where simpler wins on its one job." },
        { label: "Memory management", body: "Memcached's slab allocator reduces fragmentation for uniform value sizes; Redis carries more per-key metadata but supports far richer types." },
        { label: "Everything beyond key-value", body: "The moment you need a leaderboard, a queue, persistence, or pub/sub, Memcached forces you to rebuild it in application code that Redis gives you for free." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (both images); `redis-benchmark` and `memtier_benchmark` or Memcached's own bench tools.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis` and `docker run -d -p 11211:11211 memcached`.",
      simulate: "Run equivalent SET/GET benchmarks against both with the same concurrency (`redis-benchmark -t set,get -n 100000 -c 50` and the Memcached equivalent) and compare raw ops/sec. Then try storing a 2MB value in each: Redis accepts it, Memcached's default 1MB limit rejects it outright.",
      observe: "Memcached's multi-threaded design potentially outperforming single-threaded Redis on raw GET/SET throughput at high concurrency on a multi-core machine, a real, measurable case where simpler wins on its one job.",
      stretch: "Try to build a leaderboard (from 7.3's ZADD/ZREVRANGE) using only Memcached's plain key-value model, and notice how much manual sorting logic you would write client-side that Redis's Sorted Set gave you for free."
    }
  },
  keyTakeaways: [
    "Redis is a multi-tool (structures, persistence, replication, pub/sub, scripting, locks); Memcached is a pure, multi-threaded key-value cache and nothing more.",
    "Memcached can win on raw GET/SET throughput at high concurrency on many cores, and uses a slab allocator to limit fragmentation.",
    "Redis accepts 512MB values with 8 eviction policies; Memcached caps at 1MB default with LRU only. Pick Memcached only when you truly need nothing beyond key-value."
  ],
  proTip: "Default to Redis unless your workload is genuinely pure GET/SET at extreme concurrency. The moment you need a structure, persistence, or pub/sub, choosing Memcached means reinventing them in your own code.",
  related: ["redis", "redis-fast", "caching", "redis-cache", "cdn", "cache-choice"],
  bridgeOut: "A self-contained comparison. Next: moving the cache all the way out to the network edge with a CDN."
};
