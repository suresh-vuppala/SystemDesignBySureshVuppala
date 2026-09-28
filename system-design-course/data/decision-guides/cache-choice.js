/* === Lesson cache-choice - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#cache-choice)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the flowchart branches and the write-back data-loss warning. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cache-choice"] = {
  module: 15, num: "15.4", title: "Which Caching Strategy?",
  connectsFrom: "Module 7.1 covered five caching patterns in depth. This is the same five, framed as a quick-reference decision tree. It branches on <strong>read/write ratio</strong> and <strong>consistency needs</strong>.",
  tabs: {
    overview: {
      heading: "The Caching Strategy Decision Tree",
      intro: "The first fork is workload shape: <strong>read-heavy</strong> paths care about who populates the cache, <strong>write-heavy</strong> paths care about whether writes must be durable before the caller returns. A fifth pattern, write-around, handles write-rarely-read-later data.",
      table: {
        headers: ["If the workload is\u2026", "Choose", "Behavior"],
        rows: [
          ["Read-heavy, app controls cache logic", "<strong>Cache-Aside</strong>", "App checks cache, loads from DB on miss, writes back. Most common."],
          ["Read-heavy, cache library handles loads", "<strong>Read-Through</strong>", "Cache auto-fetches from DB on miss, app talks only to cache."],
          ["Write-heavy, strong consistency required", "<strong>Write-Through</strong>", "Write goes to cache and DB synchronously, no stale reads."],
          ["Write-heavy, latency beats durability", "<strong>Write-Back</strong>", "Write to cache, flush to DB async. Fast, with data-loss risk."],
          ["Write rarely, read later", "<strong>Write-Around</strong>", "Write straight to DB, skip the cache, populate on first read."]
        ]
      },
      callouts: [
        { color: "green", label: "Walk the tree in order:", body: "1) <strong>Read-heavy or write-heavy?</strong> 2) Read-heavy: <strong>does the app control cache logic?</strong> Yes \u2192 Cache-Aside, No \u2192 Read-Through. 3) Write-heavy: <strong>need strong consistency?</strong> Yes \u2192 Write-Through, No \u2192 Write-Back. 4) Write-rarely-read-later \u2192 Write-Around." },
        { color: "yellow", label: "Cache-Aside is the default:", body: "For most read-heavy services, <strong>Cache-Aside</strong> is the pragmatic starting point: it is simple, resilient to cache failures, and puts control in the application. Reach for the others only when a specific need (auto-loading, strong consistency, or write latency) justifies it." }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "The read patterns differ in who owns the load path; the write patterns differ in when the database sees the write. That timing is the whole trade-off.",
      points: [
        { label: "Cache-Aside vs Read-Through", body: "Both serve read-heavy workloads. Cache-Aside keeps load logic in the application, so a cache outage degrades to direct DB reads. Read-Through pushes that logic into the cache layer, simplifying app code but coupling you to the cache being up." },
        { label: "Write-Through buys consistency with latency", body: "Every write hits cache and database synchronously, so reads are never stale. The cost is write latency: the caller waits for both stores. Choose it when a stale read is unacceptable." },
        { label: "Write-Back buys speed with risk", body: "The write returns as soon as the cache accepts it, and the database is updated asynchronously. This is the fastest write path, but a crash before the flush loses data. Only acceptable where some loss is tolerable, or paired with a durable buffer." },
        { label: "Write-Around avoids cache pollution", body: "For data written often but read rarely, writing straight to the database keeps the cache from filling with entries nobody reads. The trade-off: the first read after a write is always a miss." },
        { label: "The red flag: Write-Back data loss", body: "Write-Back is the pattern most likely to bite you. Because the database lags the cache, an unclean shutdown drops any unflushed writes. Treat it as a deliberate, documented choice, never a silent default, and pair it with replication or a persistent write log if the data matters." }
      ]
    },
    handsOn: {
      prerequisites: "No install needed. A workload profile and the tree above.",
      setup: "Profile one endpoint by its read/write ratio and consistency need, then route it.",
      simulate: "Scenario: a product catalog read 10,000\u00d7 for every 1 write. Walk it: read-heavy, does the app control cache logic? Usually yes \u2192 Cache-Aside. Second scenario: a live leaderboard updated thousands of times per second where a few lost points are acceptable. Walk it: write-heavy, need strong consistency? No \u2192 Write-Back (with a note about the loss risk).",
      observe: "The read/write ratio alone narrowed the choice to two patterns, and the consistency question picked the final one. You never weighed all five at once.",
      stretch: "Flip the leaderboard requirement to \u201cno lost points, ever.\u201d Which branch changes? (Write-Back \u2192 Write-Through, trading write latency for durability, or Write-Back backed by a durable append log.)"
    }
  },
  keyTakeaways: [
    "First fork is <strong>read-heavy vs write-heavy</strong>; read paths split on who loads the cache, write paths split on when the DB is updated.",
    "<strong>Cache-Aside</strong> is the sensible read-heavy default; <strong>Write-Through</strong> trades latency for consistency, <strong>Write-Back</strong> trades durability for speed.",
    "<strong>Write-Back</strong> carries real data-loss risk on crash: choose it deliberately and back it with a durable log if the data matters."
  ],
  proTip: "Ask \u201chow bad is a stale read, and how bad is a lost write?\u201d Stale reads unacceptable \u2192 Write-Through. Lost writes unacceptable \u2192 avoid plain Write-Back. Both tolerable \u2192 you have room to optimize for latency.",
  related: ["caching", "redis", "cache-invalidation", "cdn", "memcached-vs-redis"],
  bridgeOut: "Caching handles read scale at the data layer. Next parallel decision: which real-time transport moves data between server and client."
};
