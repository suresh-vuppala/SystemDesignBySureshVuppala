/* === Lesson cqrs - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#cqrs)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cqrs"] = {
  module: 8, num: "8.7", title: "CQRS",
  connectsFrom: "The same data model is being asked to serve two very different jobs, fast validated writes and fast flexibly-shaped reads, and optimizing for one often hurts the other.",
  tabs: {
    overview: {
      heading: "Split the Write Model From the Read Model",
      intro: "CQRS (Command Query Responsibility Segregation) separates the <strong>write model</strong> (commands) from the <strong>read model</strong> (queries) entirely, so each can scale, optimize, and evolve independently instead of compromising on one shared schema.",
      cards: [
        { icon: "C", title: "Command Side", color: "blue", body: "The domain model and aggregates that <strong>enforce invariants</strong>. Validation and complex business rules live here, isolated from reads." },
        { icon: "Q", title: "Query Side", color: "green", body: "Denormalized views <strong>optimized for specific queries</strong>: Redis, Elasticsearch, DynamoDB, or materialized views, each shaped for its own read pattern." },
        { icon: "S", title: "Sync", color: "orange", body: "A projector keeps the read side current: pull-based, push-based, hybrid, or inline projection (updated synchronously in the same transaction)." }
      ],
      table: {
        headers: ["Concept", "Write Side", "Read Side"],
        rows: [
          ["<strong>Model</strong>", "Domain model / aggregates, enforces invariants", "Denormalized views, optimized for specific queries"],
          ["<strong>Store</strong>", "Normalized RDBMS or event store", "Redis, Elasticsearch, DynamoDB, materialized views"],
          ["<strong>Scale</strong>", "Vertical (consistency matters)", "Horizontal (read replicas, caches, CDN)"],
          ["<strong>Consistency</strong>", "Strong (ACID transactions)", "Eventual (async projection updates)"],
          ["<strong>Schema</strong>", "3NF, no redundancy", "Denormalized, pre-joined, pre-computed"]
        ]
      },
      callouts: [
        { color: "blue", label: "CQRS + Event Sourcing (power combo):", body: "Commands \u2192 Aggregate \u2192 <strong>Events persisted</strong> \u2192 Projectors subscribe \u2192 <strong>Read models updated async</strong>. The event store IS the write model. Projections ARE the read models. Rebuild any projection by replaying events from the beginning." },
        { color: "green", label: "Consistency strategies:", body: "<strong>Pull-based</strong>: the query handler checks whether the projection is up to date (compare position). <strong>Push-based</strong>: the projector publishes a \u201cready\u201d event. <strong>Hybrid</strong>: serve stale and indicate \u201cupdating\u201d in the UI. <strong>Inline projection</strong>: update synchronously in the same transaction (sacrifices scalability for consistency)." }
      ]
    },
    realWorld: {
      heading: "CQRS in Production",
      intro: "The split shows up wherever read and write shapes diverge sharply.",
      points: [
        { label: "Microsoft", body: "Azure architecture patterns include official CQRS guidance." },
        { label: "Uber", body: "Trip service (write) plus a rider-facing API that reads from cache." },
        { label: "Netflix", body: "Catalog writes versus personalized read views." },
        { label: "Shopify", body: "Order writes versus merchant dashboard reads." }
      ]
    },
    tradeoffs: {
      heading: "When to Use It (and When Not To)",
      intro: "CQRS is powerful and easy to over-apply. The dual model doubles maintenance, so the fit matters.",
      points: [
        { label: "Good fit", body: "A skewed read/write ratio (100:1 reads), queries needing very different shapes than the write model, complex write-side rules, multiple independent read representations, already using event sourcing, or splitting a monolith into services." },
        { label: "Bad fit", body: "Simple CRUD, strong consistency required on every read (a banking UI), a small team, low traffic, read-after-write needed immediately, or a simple domain with no complex queries." },
        { label: "Anti-pattern: querying the write model", body: "Reading directly from the command store defeats the entire purpose of the split." },
        { label: "Anti-pattern: bidirectional sync", body: "Syncing both ways between the two models creates conflicts. Data flows write \u2192 read, one direction only." },
        { label: "Anti-pattern: shared database", body: "Using one database for both sides brings the coupling right back that CQRS was meant to remove." }
      ]
    },
    handsOn: {
      prerequisites: "The Event Sourcing lab from 8.6; Docker (add Elasticsearch or Redis as the read side).",
      setup: "Local and free: Postgres (write side, from 8.6) plus Redis or Elasticsearch (read side).",
      simulate: "Keep writing `AccountOpened`/`MoneyDeposited` events to Postgres as commands arrive, and after each write publish a small projector update that recomputes and stores the current balance in Redis (`SET balance:acc1 <value>`). Build a read endpoint that reads only from Redis, never Postgres.",
      observe: "The read path stays fast and simple (`GET balance:acc1`, no replay logic) while all the write-side complexity (validation, event emission) stays isolated in the command path. Then introduce a deliberate delay in the projector and watch a read immediately after a write briefly return a stale value: the eventually-consistent read model, caught live.",
      stretch: "Add a second, differently-shaped read model (for example a \u201ctransaction history\u201d list in Elasticsearch) fed by the exact same event stream, and confirm both read models stay independently correct from one shared source of truth."
    }
  },
  keyTakeaways: [
    "CQRS <strong>separates commands (writes) from queries (reads)</strong> so each side gets its own model, store, and scaling strategy.",
    "The read side is <strong>eventually consistent</strong> with the write side, updated asynchronously by a projector; the write side stays strongly consistent.",
    "It pays off with skewed read/write ratios and divergent query shapes, but is <strong>overkill for simple CRUD</strong> and small teams."
  ],
  proTip: "Data flows one way only: write \u2192 events \u2192 read model. The moment you sync read back into write, or query the write store directly, you have re-coupled the two halves and lost the benefit.",
  related: ["event-sourcing", "kafka", "messaging-comparison", "saga-orchestration"],
  bridgeOut: "\u201cThe read model is eventually consistent with the write model\u201d is a direct instance of the replication-lag problem that Consistency (Module 9) explores in full. First, one more guarantee to pin down: ordering."
};
