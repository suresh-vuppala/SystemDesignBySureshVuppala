/* === Lesson cache-invalidation - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#cache-invalidation)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cache-invalidation"] = {
  module: 7, num: "7.2", title: "Cache Invalidation & Eviction",
  connectsFrom: "\u201cThere are only two hard things in computer science: cache invalidation and naming things.\u201d A user updates their profile photo. The DB has the new one, the cache still confidently serves the old one. Nothing crashes; the system is just quietly wrong.",
  tabs: {
    overview: {
      heading: "Removing Stale Entries, and Making Room",
      intro: "Two separate questions. <strong>Invalidation</strong>: when does a cached answer stop being trusted? <strong>Eviction</strong>: when the cache is full, what gets thrown out? Invalidation trades freshness against complexity; eviction trades hit rate against simplicity.",
      images: [
        { src: "images/caching/cache-invalidation/CacheInvalidation.png", alt: "Cache invalidation methods: TTL, event-driven delete, CDC invalidation, version keys, and pub/sub broadcast" },
        { src: "images/caching/cache-invalidation/CachingEvictionPolicies.png", alt: "Cache eviction policies: LRU, LFU, FIFO, Random, and TTL-based" }
      ],
      cards: [
        { icon: "T", title: "TTL", color: "blue", body: "The key expires automatically after N seconds. Simple, needs no coordination, but caps rather than prevents staleness." },
        { icon: "E", title: "Event-Driven", color: "green", body: "The app or a CDC pipeline deletes the key the instant the DB changes. No stale window, more moving parts." },
        { icon: "L", title: "LRU eviction", color: "purple", body: "Least Recently Used is the default: recency predicts reuse well. LFU, FIFO, Random, and TTL-based cover the other shapes." }
      ],
      table: {
        headers: ["Method", "How It Works", "Freshness", "Complexity", "Best For"],
        rows: [
          ["<strong>TTL (Time-to-Live)</strong>", "Key auto-expires after N seconds", "Stale up to TTL", "Low", "General purpose, acceptable staleness"],
          ["<strong>Event-Driven Delete</strong>", "App deletes cache key on DB write", "Near real-time", "Medium", "User profiles, settings"],
          ["<strong>CDC Invalidation</strong>", "DB change \u2192 CDC event \u2192 delete key", "Real-time (~100ms)", "High", "Multi-service, decoupled systems"],
          ["<strong>Version Keys</strong>", "Key includes version: <code>user:5:v3</code>", "Instant (new key = miss)", "Medium", "Immutable data, API responses"],
          ["<strong>Double-Delete</strong>", "Delete before and after DB write (with delay)", "Near real-time", "Medium", "Race condition prevention"],
          ["<strong>Pub/Sub Broadcast</strong>", "Publish invalidation event to all app nodes", "Real-time", "Medium", "Multi-node local caches"]
        ]
      },
      tables: [
        {
          headers: ["Policy", "Evicts", "Best For"],
          rows: [
            ["<strong>LRU</strong> (Least Recently Used)", "Key not accessed longest", "General purpose, the most common default"],
            ["<strong>LFU</strong> (Least Frequently Used)", "Key accessed fewest times", "Hot/cold data, keeps popular items"],
            ["<strong>FIFO</strong> (First In First Out)", "Oldest key inserted", "Simple, predictable, time-series data"],
            ["<strong>Random</strong>", "Random key", "When access patterns are uniform"],
            ["<strong>TTL-based</strong>", "Keys closest to expiry first", "Mixed workloads with varying freshness needs"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Eviction policies (when the cache is full):", body: "<strong>LRU</strong> evicts the key not accessed longest (general default) \u00b7 <strong>LFU</strong> evicts the least frequently accessed (keeps hot items) \u00b7 <strong>FIFO</strong> evicts the oldest inserted \u00b7 <strong>Random</strong> for uniform access \u00b7 <strong>TTL-based</strong> evicts keys closest to expiry first." },
        { color: "blue", label: "Interview pattern:", body: "Always name the <strong>consistency vs latency tradeoff</strong>. TTL is simple but stale. Event-driven is fresh but complex. The right choice depends on how much staleness your users can tolerate." }
      ]
    },
    tradeoffs: {
      heading: "The Four Failure Modes That Page You at 3am",
      points: [
        { label: "Thundering Herd (Cache Stampede)", body: "A hot key expires and thousands of requests discover the miss simultaneously, all rushing the database at once. Fix: a mutex / single-flight (first request refills, everyone else waits) or probabilistic early expiry." },
        { label: "Cache Penetration", body: "A query for a key that never exists anywhere is a guaranteed miss every time, a way to bypass the cache entirely. Fix: cache the absence itself (null, short TTL) or a Bloom filter that rejects impossible keys before they reach the cache." },
        { label: "Cache Avalanche", body: "Thousands of keys given the same TTL expire in the same instant, producing a coordinated DB spike. Fix: jittered TTLs (<code>3600 + random(0,300)</code>) so expiries spread out." },
        { label: "Hot Key Problem", body: "One single key gets millions of reads, overloading the one Redis node holding it, a hotspot rather than an expiry issue. Fix: a local L1 in-process cache, replicating the hot key across multiple slots, or sharding the value itself (<code>key:1</code>...<code>key:N</code>)." }
      ]
    },
    handsOn: {
      prerequisites: "The Cache-Aside setup from 7.1; `redis-cli`; `hey` or `k6`.",
      setup: "Local and free: the same Redis + Postgres containers from 7.1.",
      simulate: "Reproduce Thundering Herd directly: pick one product ID, set its cache TTL to 5 seconds, then fire 500 concurrent requests for that exact ID (`hey -n 500 -c 500 <url>/products/42`) timed to land right as the TTL expires. Watch Postgres's active connection count spike (`SELECT count(*) FROM pg_stat_activity`) as hundreds of requests all miss at once. Then add a `SETNX lock:42 1 EX 5` guard so only the first miss queries Postgres while the rest wait, and repeat the same load test.",
      observe: "The DB connection spike from the first run almost entirely disappears in the second, a direct, measured fix for the exact failure mode named above, not just a description of it.",
      stretch: "Reproduce Cache Penetration by hammering `/products/999999` (an ID that does not exist) 1,000 times and watching every request hit Postgres. Fix it by caching the absence (`SET product:999999:miss \"\" EX 60`) and confirm the 1,000th request never touches the database."
    }
  },
  keyTakeaways: [
    "Invalidation and eviction are different questions: invalidation decides when a cached answer is stale; eviction decides what to drop when memory is full.",
    "Six invalidation methods span the freshness/complexity trade: TTL (simple, stale) up through CDC and Pub/Sub (fresh, complex); LRU is the default eviction policy.",
    "Four failure modes recur constantly: thundering herd, penetration, avalanche, and hot key, each with a known fix (mutex, cache-the-null, jitter, L1/shard)."
  ],
  proTip: "Never give every key the same TTL. Add random jitter so expiries scatter instead of firing together, which alone prevents the avalanche that turns a routine expiry into a database outage.",
  related: ["caching", "redis-cache", "redis", "cdn", "redis-pubsub", "cache-choice"],
  bridgeOut: "These four failure modes are exactly the incidents that page someone at 3am, and the fix for all of them leans on Redis's actual commands, which the next lesson introduces."
};
