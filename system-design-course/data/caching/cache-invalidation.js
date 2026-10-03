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
      goal: "Reproduce the Thundering Herd failure mode against a real database, then kill it with a Redis mutex lock and measure the difference.",
      stack: "Redis + Postgres + Node.js in Docker, load-tested with <code>hey</code>. Reuses the Cache-Aside setup from 7.1. Local and free.",
      steps: [
        {
          title: "Reuse the Redis and Postgres containers from 7.1",
          body: "If they are not already running, start them and seed a products table.",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker run -d --name redis -p 6379:6379 redis\ndocker exec -i pg psql -U postgres -c \"CREATE TABLE IF NOT EXISTS products(id int primary key, name text, price numeric);\"\ndocker exec -i pg psql -U postgres -c \"INSERT INTO products SELECT g, 'product '||g, (random()*100)::numeric(10,2) FROM generate_series(1,10000) g ON CONFLICT DO NOTHING;\"",
          lang: "bash"
        },
        {
          title: "Build one endpoint with a herd toggle",
          body: "<code>/products/:id</code> uses a 5-second TTL. With <code>?lock=1</code> only the first miss queries Postgres via a <code>SET NX</code> mutex, the rest briefly wait and retry. Save as <code>herd.js</code>.",
          code: "const express = require('express');\nconst { Pool } = require('pg');\nconst Redis = require('ioredis');\n\nconst pg = new Pool({ host: 'localhost', user: 'postgres', password: 'pw' });\nconst redis = new Redis();\nconst app = express();\nconst sleep = (ms) => new Promise(r => setTimeout(r, ms));\n\napp.get('/products/:id', async (req, res) => {\n  const key = 'product:' + req.params.id;\n  const hit = await redis.get(key);\n  if (hit) return res.json(JSON.parse(hit));\n\n  if (req.query.lock) {\n    const lockKey = 'lock:' + req.params.id;\n    const got = await redis.set(lockKey, '1', 'NX', 'EX', 5);\n    if (!got) {\n      // someone else is rebuilding: wait and read the fresh value\n      await sleep(50);\n      const retry = await redis.get(key);\n      if (retry) return res.json(JSON.parse(retry));\n    }\n  }\n\n  const { rows } = await pg.query('SELECT * FROM products WHERE id = $1', [req.params.id]);\n  await redis.set(key, JSON.stringify(rows[0]), 'EX', 5);\n  res.json(rows[0]);\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Install dependencies and run it",
          code: "npm init -y && npm install express pg ioredis\nnode herd.js",
          lang: "bash"
        },
        {
          title: "Fire the herd right as the TTL expires (no lock)",
          body: "Let the key expire, then hit it with 500 concurrent requests that all miss at once.",
          code: "docker exec redis redis-cli DEL product:42\nsleep 6\nhey -n 500 -c 500 http://localhost:3000/products/42",
          lang: "bash"
        },
        {
          title: "Watch Postgres connections spike, then repeat with the lock",
          body: "Run the count during each load test. The first run stampedes the database; the second serializes the rebuild.",
          code: "docker exec pg psql -U postgres -c \"SELECT count(*) FROM pg_stat_activity WHERE state = 'active';\"\n\n# now the guarded path\ndocker exec redis redis-cli DEL product:42\nsleep 6\nhey -n 500 -c 500 \"http://localhost:3000/products/42?lock=1\"",
          lang: "bash"
        }
      ],
      observe: "In the no-lock run the active-connection count jumps as hundreds of requests all miss and query Postgres together. With <code>?lock=1</code> that spike almost disappears: only the first miss reaches the database, the rest read the value the winner backfilled. This is a measured fix for the exact failure mode, not just a description of it.",
      stretch: "Reproduce Cache Penetration by hammering <code>/products/999999</code> (an id that does not exist) 1,000 times and watching every request hit Postgres. Fix it by caching the absence (<code>SET product:999999:miss \"\" EX 60</code>) and confirm the 1,000th request never touches the database."
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
