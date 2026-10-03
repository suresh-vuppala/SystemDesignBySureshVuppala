/* === Lesson caching - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#caching)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["caching"] = {
  module: 7, num: "7.1", title: "Caching Strategies",
  connectsFrom: "The same homepage, product, or profile gets requested thousands of times a second, and every time the app asks the database for the exact same answer even though it barely ever changes. Disk is ~10ms; RAM is ~100ns, a 100,000\u00d7 gap sitting there unclaimed.",
  tabs: {
    overview: {
      heading: "Serve From RAM, Not From Disk",
      intro: "A cache is a small, fast layer (usually RAM) holding answers you keep needing. It cuts <strong>latency</strong>, raises <strong>throughput</strong>, and improves <strong>cost efficiency</strong>, at the cost of <strong>consistency</strong> (stale data), invalidation complexity, and extra memory overhead. Two questions split the five strategies: on a miss, who fetches; and on a write, in what order.",
      images: [
        { src: "images/caching/caching/caching_strategies.png", alt: "The five caching strategies compared: Cache-Aside, Read-Through, Write-Around, Write-Back, and Write-Through" }
      ],
      cards: [
        { icon: "R", title: "Who fetches on a miss?", color: "blue", body: "<strong>Cache-Aside</strong>: the app checks the cache, and on a miss reads the DB and writes it back. <strong>Read-Through</strong>: the cache itself fetches from the DB automatically." },
        { icon: "W", title: "What order on a write?", color: "purple", body: "<strong>Write-Through</strong>: cache and DB together (zero stale window, doubles write cost). <strong>Write-Back</strong>: cache only, flush later (fastest, real loss risk). <strong>Write-Around</strong>: skip the cache (for rarely re-read data)." },
        { icon: "%", title: "Hit rate is the metric", color: "green", body: "Good systems run above <strong>95%</strong>. At scale, a single point (95% \u2192 96%) can mean 20% fewer requests reaching the real database." }
      ],
      table: {
        headers: ["Strategy", "Flow (Read \u00b7 Write)", "Consistency", "Strong Reason to Choose", "Why Other Strategies Are Not Ideal"],
        rows: [
          ["<strong>Cache-Aside</strong><br><span style=\"color:var(--brand);font-size:.78em;font-weight:600\">\u2192 Hot reads</span><br><span style=\"color:var(--muted);font-size:.74em;font-style:italic\">Hot, frequently read data</span>", "Read: app checks cache, miss reads DB then sets cache \u00b7 Write: app writes DB then deletes the key", "Eventual", "App controls what is cached, so only hot, popular data lives in RAM", "<strong>Write-Through</strong> wastes RAM on unread data. <strong>Read-Through</strong> needs a library plugin."],
          ["<strong>Read-Through</strong><br><span style=\"color:var(--brand);font-size:.78em;font-weight:600\">\u2192 Auto reads</span><br><span style=\"color:var(--muted);font-size:.74em;font-style:italic\">Simple application code</span>", "Read: app asks cache, cache auto-fetches DB on miss \u00b7 Write: via the cache layer", "Eventual", "Simple app code, the cache handles miss-fetching for you", "<strong>Cache-Aside</strong> requires manual miss-handling logic in every call."],
          ["<strong>Write-Around</strong><br><span style=\"color:var(--brand);font-size:.78em;font-weight:600\">\u2192 Cold writes</span><br><span style=\"color:var(--muted);font-size:.74em;font-style:italic\">Avoid caching cold data</span>", "Read: normal miss path \u00b7 Write: straight to DB, skip the cache", "Eventual", "Huge write volume where most records are never read again", "<strong>Write-Through</strong> caches every write, wasting RAM. <strong>Write-Back</strong> risks loss."],
          ["<strong>Write-Back</strong><br><span style=\"color:var(--brand);font-size:.78em;font-weight:600\">\u2192 Fast writes</span><br><span style=\"color:var(--muted);font-size:.74em;font-style:italic\">Maximum write throughput</span>", "Read: always a cache hit \u00b7 Write: to cache only, async flush to DB", "Eventual", "Fastest writes, absorb massive write traffic before persisting", "<strong>Write-Through</strong> doubles latency. <strong>Cache-Aside</strong> hits the DB on every write."],
          ["<strong>Write-Through</strong><br><span style=\"color:var(--brand);font-size:.78em;font-weight:600\">\u2192 Fresh reads after writes</span><br><span style=\"color:var(--muted);font-size:.74em;font-style:italic\">Strong consistency after writes</span>", "Read: always fresh \u00b7 Write: to cache and DB synchronously", "Strong", "Zero stale window, updates visible immediately on the next read", "<strong>Cache-Aside</strong> has a stale gap. <strong>Write-Back</strong> can lose data."]
        ]
      },
      callouts: [
        { color: "blue", label: "Invalidation:", body: "<strong>TTL</strong> (simple, stale until expiry) \u00b7 <strong>Event-driven</strong> (CDC or app triggers a delete, near real-time) \u00b7 <strong>Version key</strong> (new version = auto miss). Eviction: LRU (most common) \u00b7 LFU \u00b7 FIFO." },
        { color: "yellow", label: "Thundering Herd / cache stampede:", body: "A cache entry expires and thousands hit the DB at once. Fix: <strong>mutex on cache miss</strong>, request coalescing / single-flight, probabilistic early expiration, stale-while-revalidate." },
        { color: "green", label: "Real-world:", body: "<strong>Facebook</strong> uses Memcached (TAO). <strong>Twitter</strong> caches timelines in Redis. Target: <strong>cache hit rate &gt;95%</strong>." }
      ]
    },
    realWorld: {
      heading: "Which Strategy Shows Up Where",
      points: [
        { label: "Cache-Aside", body: "Twitter timelines, YouTube video metadata, Shopify product pages. Read-heavy, eventual consistency is fine." },
        { label: "Read-Through", body: "DynamoDB's DAX and Cloudflare's origin pull auto-fetch on a miss so the application never writes miss-handling code." },
        { label: "Write-Through", body: "Adding a friend or add-to-cart: the update must be visible on the very next read, so cache and DB move together." },
        { label: "Write-Back", body: "Gaming leaderboards and GPS pings: absorb a firehose of writes in RAM, flush to the DB in batches." },
        { label: "Write-Around", body: "Logs, audit trails, and IoT telemetry: written once, rarely re-read, so caching them just wastes RAM." }
      ]
    },
    tradeoffs: {
      heading: "Reading the Trade Axis",
      points: [
        { label: "Latency vs consistency", body: "Cache-Aside and Read-Through accept a stale window in exchange for cheap, hot reads. Write-Through pays double write latency to erase that window." },
        { label: "Write speed vs durability", body: "Write-Back gives the lowest write latency but risks losing everything buffered in cache if the process crashes before a flush. Write-Through never loses data but is slower." },
        { label: "RAM discipline", body: "Write-Around keeps cold data out of cache entirely; Write-Through pollutes RAM with data that may never be read again." }
      ]
    },
    handsOn: {
      goal: "Put Redis in front of Postgres with Cache-Aside and watch p99 latency and database load collapse under identical traffic.",
      stack: "Redis + Postgres + Node.js in Docker, load-tested with <code>hey</code>. Local and free.",
      steps: [
        {
          title: "Start Redis and Postgres",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker run -d --name redis -p 6379:6379 redis",
          lang: "bash"
        },
        {
          title: "Seed 10,000 products",
          code: "docker exec -i pg psql -U postgres -c \"CREATE TABLE products(id int primary key, name text, price numeric);\"\ndocker exec -i pg psql -U postgres -c \"INSERT INTO products SELECT g, 'product '||g, (random()*100)::numeric(10,2) FROM generate_series(1,10000) g;\"",
          lang: "bash"
        },
        {
          title: "Build the same endpoint two ways",
          body: "<code>/direct/:id</code> always hits Postgres. <code>/cached/:id</code> checks Redis first and only reads Postgres on a miss, then backfills with a 5-minute TTL. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst { Pool } = require('pg');\nconst Redis = require('ioredis');\n\nconst pg = new Pool({ host: 'localhost', user: 'postgres', password: 'pw' });\nconst redis = new Redis();\nconst app = express();\n\n// (a) always hits the database\napp.get('/direct/:id', async (req, res) => {\n  const { rows } = await pg.query('SELECT * FROM products WHERE id = $1', [req.params.id]);\n  res.json(rows[0]);\n});\n\n// (b) cache-aside: Redis first, DB on miss, then backfill\napp.get('/cached/:id', async (req, res) => {\n  const key = 'product:' + req.params.id;\n  const hit = await redis.get(key);\n  if (hit) return res.json(JSON.parse(hit));\n  const { rows } = await pg.query('SELECT * FROM products WHERE id = $1', [req.params.id]);\n  await redis.set(key, JSON.stringify(rows[0]), 'EX', 300);\n  res.json(rows[0]);\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Install dependencies and run it",
          code: "npm init -y && npm install express pg ioredis\nnode server.js",
          lang: "bash"
        },
        {
          title: "Load-test both paths with identical traffic",
          body: "Same hot key both times: the direct path pays the database on every request; cache-aside pays once, then serves from RAM.",
          code: "hey -n 20000 -c 200 http://localhost:3000/direct/42\nhey -n 20000 -c 200 http://localhost:3000/cached/42",
          lang: "bash"
        },
        {
          title: "Read your cache hit rate",
          code: "docker exec redis redis-cli INFO stats | grep keyspace",
          lang: "bash"
        }
      ],
      observe: "The <code>/direct</code> run's p99 and Postgres CPU (watch <code>docker stats pg</code>) climb with load, while <code>/cached</code> stays flat and low once warm. Your <code>keyspace_hits / (keyspace_hits + keyspace_misses)</code> should sit above 0.95 after the first request, the same above-95% benchmark real systems target.",
      stretch: "Add <code>PUT /cached/:id</code> as Write-Through (update Postgres and Redis in one request) and confirm a read right after a write is never stale. Then try Write-Back instead (write Redis only, flush to Postgres every 10s) and reason about exactly how many writes you would lose if the process crashed before a flush."
    }
  },
  keyTakeaways: [
    "Two questions define the five strategies: on a miss, who fetches (app vs cache); on a write, what order (together, cache-only, or skip cache).",
    "Write-Through gives strong consistency at double write cost; Write-Back is fastest but can lose buffered data on a crash; Write-Around keeps cold data out of RAM.",
    "Cache hit rate is the headline metric: aim above 95%, since small gains translate into large reductions in database load."
  ],
  proTip: "Before picking a strategy, ask how much staleness your users tolerate and how your data is read versus written. Read-heavy and stale-tolerant points to Cache-Aside; update-must-show-now points to Write-Through.",
  related: ["cache-invalidation", "redis-cache", "redis", "cdn", "memcached-vs-redis", "cache-choice", "scaling-choice"],
  bridgeOut: "Every strategy here assumes you know when to remove a stale entry, a question this lesson deliberately defers to the next one."
};
