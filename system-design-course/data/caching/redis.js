/* === Lesson redis - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis"] = {
  module: 7, num: "7.3", title: "Redis Data Structures",
  connectsFrom: "A plain key-value cache means writing a lot of application code to fake a leaderboard, a unique-visitor counter, or a job queue on top of \u201cjust a blob.\u201d Redis ships those structures as first-class primitives instead.",
  tabs: {
    overview: {
      heading: "An In-Memory Data Store, Not Just a Cache",
      intro: "<strong>In-memory</strong> data store with <strong>sub-ms latency</strong> and <strong>100K to 1M ops/sec</strong>. It is a cache, a set of data structures, and a messaging bus at once. Eight structures, each with the commands that make it worth reaching for.",
      images: [
        { src: "images/caching/redis/RedisDS.png", alt: "The eight Redis data structures - String, Hash, List, Set, Sorted Set, HyperLogLog, Geo, and Stream - with their core commands and use cases", caption: "The eight Redis data structures at a glance: each one replaces application code you would otherwise write by hand." }
      ],
      cards: [
        { icon: "Z", title: "Sorted Set", color: "purple", body: "<code>ZADD</code>/<code>ZREVRANGE</code>/<code>ZINCRBY</code> give you a leaderboard's top 10 with no manual sorting, plus sliding-window rate limiters and delayed-job queues." },
        { icon: "H", title: "HyperLogLog", color: "teal", body: "<code>PFADD</code>/<code>PFCOUNT</code>/<code>PFMERGE</code> count uniques in a fixed ~12KB with ~0.81% error, regardless of how many IDs you add." },
        { icon: "S", title: "Stream", color: "green", body: "<code>XADD</code>/<code>XREADGROUP</code>/<code>XACK</code> form an append-only event log with consumer groups, a lightweight Kafka inside Redis." }
      ],
      table: {
        headers: ["Structure", "Commands", "Use Case"],
        rows: [
          ["<strong>String</strong>", "SET/GET/INCR/SETNX/EXPIRE", "Counters \u00b7 session tokens \u00b7 cache \u00b7 distributed lock (SETNX) \u00b7 feature flags"],
          ["<strong>Hash</strong>", "HSET/HGET/HGETALL/HDEL/HINCRBY", "User profiles \u00b7 cache objects \u00b7 shopping cart \u00b7 config store"],
          ["<strong>List</strong>", "LPUSH/RPOP/LRANGE/LLEN/BRPOP", "Job queues \u00b7 activity feeds \u00b7 recent history \u00b7 blocking queue (BRPOP)"],
          ["<strong>Set</strong>", "SADD/SMEMBERS/SINTER/SUNION/SISMEMBER", "Unique visitors \u00b7 tags \u00b7 deduplication \u00b7 common friends \u00b7 online users"],
          ["<strong>Sorted Set</strong>", "ZADD/ZRANGE/ZRANK/ZREVRANGE/ZINCRBY", "Leaderboards \u00b7 rate limiting \u00b7 priority queues \u00b7 trending \u00b7 delayed jobs"],
          ["<strong>HyperLogLog</strong>", "PFADD/PFCOUNT/PFMERGE", "Approximate unique count, ~0.81% error at a fixed ~12KB \u00b7 DAU \u00b7 unique views"],
          ["<strong>Geo</strong>", "GEOADD/GEODIST/GEOSEARCH/GEOPOS", "Nearby drivers (Uber/Lyft) \u00b7 store locator \u00b7 sorted set with a geohash underneath"],
          ["<strong>Stream</strong>", "XADD/XREAD/XREADGROUP/XACK/XRANGE", "Event log \u00b7 consumer groups \u00b7 lightweight Kafka \u00b7 audit trail"]
        ]
      },
      callouts: [
        { color: "green", label: "Why the structures matter:", body: "A <strong>Sorted Set</strong> replaces client-side sorting for a leaderboard, <strong>SINTER</strong> computes mutual friends in one call, and <strong>HyperLogLog</strong> counts uniques in constant memory. Each one is application code you no longer write." },
        { color: "blue", label: "Free distributed lock:", body: "<strong>SETNX</strong> (or <code>SET ... NX</code>) sets a key only if it does not exist, giving you an atomic lock primitive; <strong>INCR</strong> is an atomic counter perfect for rate limiting." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Redis); `redis-cli`.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis`.",
      simulate: "Build a leaderboard with `ZADD leaderboard 1500 \"alice\"`, `ZADD leaderboard 2200 \"bob\"`, add 8 more players, then get the top 5 with `ZREVRANGE leaderboard 0 4 WITHSCORES`, no application-side sorting at all. Separately, count unique visitors with `PFADD visitors:today user1 user2 ...` for 100,000 synthetic user IDs and compare `PFCOUNT visitors:today` against the true distinct count.",
      observe: "`ZREVRANGE`'s output already sorted, and `PFCOUNT` landing within roughly 1% of the true count while `MEMORY USAGE visitors:today` reports only a few KB whether you inserted 10,000 or 10,000,000 IDs, the fixed ~12KB claim verified.",
      stretch: "Build a simple job queue with `LPUSH jobs '{\"task\":\"resize\"}'` and 3 worker scripts calling `BRPOP jobs 0` in a loop. Start all 3, push 10 jobs, and watch them get distributed across workers with no job processed twice."
    }
  },
  keyTakeaways: [
    "Redis is a data-structure server: eight types (String, Hash, List, Set, Sorted Set, HyperLogLog, Geo, Stream) each replace hand-written application logic.",
    "Sorted Sets give leaderboards and rate limiters for free; HyperLogLog counts uniques in a fixed ~12KB; Streams are a lightweight Kafka built in.",
    "SETNX is an atomic lock and INCR an atomic counter, so caching, locking, and rate limiting all share one store."
  ],
  proTip: "Reach for the structure that matches the shape of your problem instead of stuffing JSON blobs into strings. A Sorted Set or HyperLogLog turns pages of application code into a single O(log n) or O(1) command.",
  related: ["redis-fast", "redis-cache", "redis-streams", "caching", "cache-invalidation", "memcached-vs-redis", "redis-cluster", "redis-ha", "redis-locks", "redis-pubsub", "cache-choice", "nosql"],
  bridgeOut: "None of these structures matter if Redis itself is slow. The next lesson is why it is not."
};
