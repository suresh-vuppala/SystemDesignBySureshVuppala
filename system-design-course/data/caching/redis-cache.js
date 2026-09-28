/* === Lesson redis-cache - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-cache)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-cache"] = {
  module: 7, num: "7.5", title: "Redis as Cache",
  connectsFrom: "Topic 7.1's strategies were abstract. This is what actually happens, command by command, when your app asks for a user's profile and Redis sits in front of the database.",
  tabs: {
    overview: {
      heading: "Cache-Aside, Spelled Out",
      intro: "The app checks Redis first: a <strong>cache hit</strong> returns in under a millisecond; a <strong>cache miss</strong> reads the DB, writes the result to Redis with a TTL, then serves it. The one real configuration choice is the eviction policy.",
      cards: [
        { icon: "H", title: "Hit path", color: "green", body: "App asks Redis for <code>user:42</code>, gets it, done in under a millisecond. No database involved." },
        { icon: "M", title: "Miss path", color: "orange", body: "App reads the DB, writes the result back to Redis with a TTL, and returns it. The next read is a hit." },
        { icon: "X", title: "Eviction policy", color: "purple", body: "<strong>allkeys-lru</strong> is the default for a pure cache. <strong>noeviction</strong> errors when full, which is correct only for a real data store." }
      ],
      callouts: [
        { color: "yellow", label: "Pattern:", body: "App checks Redis first \u2192 <strong>cache hit</strong> returns instantly \u00b7 <strong>cache miss</strong> \u2192 fetch from DB \u2192 write to Redis with TTL \u2192 serve." },
        { color: "yellow", label: "Strategies:", body: "<strong>Cache-aside</strong> (most common, app manages the cache) \u00b7 <strong>Write-through</strong> (write to cache and DB together) \u00b7 <strong>Write-back</strong> (write to cache, async flush to DB) \u00b7 <strong>Read-through</strong> (cache fetches from DB on miss)." },
        { color: "yellow", label: "Eviction policies:", body: "<strong>allkeys-lru</strong> (evict least recently used, best for a cache) \u00b7 <strong>allkeys-lfu</strong> (evict least frequently used) \u00b7 <strong>volatile-lru</strong> (only evict keys that have a TTL) \u00b7 <strong>noeviction</strong> (return an error when full, for data-store use)." },
        { color: "green", label: "Cache problems, Redis fixes:", body: "<strong>Thundering herd</strong> \u2192 SETNX refill lock or probabilistic early expiry. <strong>Cache penetration</strong> \u2192 cache null values with a short TTL. <strong>Cache avalanche</strong> \u2192 add random jitter to TTLs." }
      ]
    },
    tradeoffs: {
      heading: "Anti-Patterns That Bite in Production",
      points: [
        { label: "No TTL at all", body: "Keys live forever and serve stale data indefinitely, because nothing ever forces a refresh." },
        { label: "Caching everything indiscriminately", body: "Cold data that is written once and rarely read wastes RAM that hot data needs." },
        { label: "No eviction policy configured", body: "Redis fills up and crashes on OOM instead of gracefully shedding old entries." },
        { label: "Inconsistent invalidation", body: "Multiple code paths update the DB but only one remembers to clear the cache, so the cache and DB silently disagree." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Redis); `redis-cli`.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis --maxmemory 10mb --maxmemory-policy noeviction` (deliberately tiny, to hit the limit fast).",
      simulate: "Write a script that inserts keys until Redis rejects a write (`OOM command not allowed`) under `noeviction`. Then switch the policy live with `CONFIG SET maxmemory-policy allkeys-lru` and repeat: Redis now silently evicts old keys instead of erroring.",
      observe: "The exact behavioral difference at the moment memory fills: `noeviction` breaking your writes outright (correct for a real data store you cannot afford to lose data from), `allkeys-lru` staying available by discarding the least-recently-used entries (correct for a pure cache where staleness beats downtime).",
      stretch: "Set `volatile-lru` instead, insert a mix of keys with and without a TTL, and confirm only the TTL'd keys are ever eligible for eviction. Keys with no expiry survive even as memory fills, exactly matching the policy name."
    }
  },
  keyTakeaways: [
    "Cache-Aside in practice: hit returns sub-millisecond, miss reads the DB and back-fills Redis with a TTL, next read is a hit.",
    "The eviction policy is the key decision: allkeys-lru for a pure cache, noeviction for a data store that must never silently drop data.",
    "The three cache problems from 7.2 each have a Redis-native fix: SETNX for herd, cache-the-null for penetration, jittered TTLs for avalanche."
  ],
  proTip: "Always configure a `maxmemory-policy` explicitly. Leaving it unset means Redis will OOM-crash under pressure instead of evicting; `allkeys-lru` keeps a cache available by shedding cold entries.",
  related: ["caching", "cache-invalidation", "redis", "redis-fast", "cdn", "memcached-vs-redis", "redis-ha", "redis-pubsub", "stateless-stateful"],
  bridgeOut: "Everything so far lives in Redis's RAM. The next lesson is what happens the moment that RAM disappears, starting with real-time messaging."
};
