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
      goal: "Split the write model (a Postgres event log) from a read model (a Redis balance) with an async projector, then catch the read side returning a stale value right after a write.",
      stack: "Postgres + Redis in Docker + Node.js (<code>pg</code>, <code>ioredis</code>). Reuses the event log from 8.6. Local and free.",
      steps: [
        {
          title: "Start Postgres and Redis",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker run -d --name redis -p 6379:6379 redis",
          lang: "bash"
        },
        {
          title: "Ensure the events table exists",
          code: "docker exec -i pg psql -U postgres -c \"CREATE TABLE IF NOT EXISTS events(id serial primary key, aggregate_id text, event_type text, payload jsonb, version int, ts timestamptz default now());\"",
          lang: "bash"
        },
        {
          title: "Install the clients",
          code: "npm init -y && npm install pg ioredis",
          lang: "bash"
        },
        {
          title: "Write command, projector, and query paths",
          body: "Save as <code>cqrs.js</code>. The command appends an event; the projector recomputes the balance into Redis asynchronously; the query reads only Redis. A <code>LAG</code> knob slows the projector on purpose.",
          code: `const { Pool } = require('pg');
const Redis = require('ioredis');
const pg = new Pool({ host: 'localhost', user: 'postgres', password: 'pw' });
const redis = new Redis();
const ACC = 'acc-1';
let LAG = 0;

// COMMAND SIDE: append event, then project asynchronously
async function deposit(amount) {
  const { rows } = await pg.query(
    'SELECT COALESCE(MAX(version),0)+1 v FROM events WHERE aggregate_id=$1', [ACC]);
  await pg.query(
    'INSERT INTO events(aggregate_id,event_type,payload,version) VALUES($1,$2,$3,$4)',
    [ACC, 'MoneyDeposited', { amount }, rows[0].v]);
  project();
}

async function project() {
  if (LAG) await new Promise(r => setTimeout(r, LAG));
  const { rows } = await pg.query(
    "SELECT COALESCE(SUM((payload->>'amount')::int),0) bal FROM events WHERE aggregate_id=$1 AND event_type='MoneyDeposited'",
    [ACC]);
  await redis.set('balance:' + ACC, rows[0].bal);
}

// QUERY SIDE: read only from Redis, never Postgres
const getBalance = () => redis.get('balance:' + ACC);

(async () => {
  await deposit(100);
  await new Promise(r => setTimeout(r, 200));
  console.log('read model balance:', await getBalance());

  LAG = 1000;
  await deposit(50);
  console.log('immediately after write:', await getBalance());
  await new Promise(r => setTimeout(r, 1200));
  console.log('after projection catches up:', await getBalance());
  await pg.end();
  redis.disconnect();
})();`,
          lang: "javascript"
        },
        {
          title: "Run it",
          code: "node cqrs.js",
          lang: "bash"
        }
      ],
      observe: "The read path is a single <code>GET balance:acc-1</code> with no replay logic, while validation and event emission stay isolated on the command side. With <code>LAG</code> set, the read immediately after the second deposit still prints 100 (stale), then catches up to 150 once the projector runs: the eventually-consistent read model, caught live.",
      stretch: "Add a second, differently-shaped read model (a transaction-history list in a Redis LIST or in Elasticsearch) fed by the same events, and confirm both read models stay independently correct from one shared source of truth."
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
