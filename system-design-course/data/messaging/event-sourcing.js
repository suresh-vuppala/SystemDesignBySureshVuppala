/* === Lesson event-sourcing - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#event-sourcing)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["event-sourcing"] = {
  module: 8, num: "8.6", title: "Event Sourcing",
  connectsFrom: "Kafka introduced a durable, replayable log as infrastructure. Event Sourcing is an application design pattern built on that same idea: store the facts that happened, not just the current state.",
  tabs: {
    overview: {
      heading: "Store Facts, Derive State by Replaying",
      intro: "A traditional database only stores <strong>current state</strong>, so history is gone after an update. Event Sourcing persists immutable <strong>facts (events)</strong> as the source of truth and derives current state by replaying the log. Never mutate, only append.",
      cards: [
        { icon: "E", title: "Event", color: "blue", body: "An immutable fact, named in the <strong>past tense</strong>: <code>OrderCreated</code>, <code>PaymentReceived</code>, <code>ItemShipped</code>. Never deleted or modified." },
        { icon: "P", title: "Projection", color: "green", body: "A read model built by processing events: subscribe to the stream, update a denormalized view. Rebuild it any time by replaying." },
        { icon: "S", title: "Snapshot", color: "orange", body: "Materialized state at a point in time, stored every N events so you replay only from the snapshot forward instead of from event 0." }
      ],
      table: {
        headers: ["Concept", "Detail", "Implementation"],
        rows: [
          ["<strong>Event</strong>", "Immutable fact that happened, past-tense naming", "<code>OrderCreated</code>, <code>PaymentReceived</code>, <code>ItemShipped</code>"],
          ["<strong>Stream</strong>", "Ordered sequence of events for one aggregate", "<code>order-{orderId}</code>, one stream per entity instance"],
          ["<strong>Aggregate</strong>", "Consistency boundary: validates commands, emits events", "Load from stream \u2192 apply events \u2192 check invariants \u2192 emit"],
          ["<strong>Projection</strong>", "Read model built by processing events", "Subscribe to stream \u2192 update denormalized view (async)"],
          ["<strong>Snapshot</strong>", "Materialized state at a point in time", "Store every N events, replay only from snapshot forward"],
          ["<strong>Idempotency</strong>", "Processing the same event twice must produce the same result", "Track last processed position or use event ID as dedup key"]
        ]
      },
      tables: [
        {
          headers: ["Store", "Type", "Strengths", "Considerations"],
          rows: [
            ["<strong>EventStoreDB</strong>", "Purpose-built", "Native projections, subscriptions, optimistic concurrency", "Smaller community, self-hosted"],
            ["<strong>Kafka</strong>", "Log-based", "High throughput, built-in replication, ecosystem", "No per-stream concurrency, compaction is not the same as snapshots"],
            ["<strong>PostgreSQL</strong>", "RDBMS", "ACID, familiar, NOTIFY for subscriptions", "Manual stream management, polling for projections"],
            ["<strong>DynamoDB</strong>", "NoSQL", "Serverless, DynamoDB Streams for projections", "25-item transaction limit, cost at scale"],
            ["<strong>Marten</strong>", "Library (.NET)", "PostgreSQL-backed, projections built-in", ".NET ecosystem only"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Wins:", body: "<strong>Perfect audit trail</strong>: every state change recorded. <strong>Time-travel debugging</strong>: reconstruct state at any point. <strong>Rebuild projections</strong>: fix bugs, replay, get corrected views. <strong>Natural fit</strong> for financial ledgers, order systems, and collaboration tools." },
        { color: "blue", label: "Event stores:", body: "<strong>EventStoreDB</strong> (native projections), <strong>Kafka</strong> (note: compaction is not the same as snapshotting), <strong>PostgreSQL</strong> (NOTIFY for subscriptions), <strong>DynamoDB</strong> (25-item transaction limit), <strong>Marten</strong> (.NET, PostgreSQL-backed)." }
      ]
    },
    realWorld: {
      heading: "Event Sourcing in the Wild",
      intro: "The pattern is old and proven: any system where history matters is a candidate.",
      points: [
        { label: "Stripe", body: "Payment state machine modeled as events." },
        { label: "LMAX Exchange", body: "An event-sourced trading engine running at 6M orders/sec." },
        { label: "Datomic", body: "An immutable database, event-sourced by design." },
        { label: "Git", body: "The same idea you already use: commits are events, and the working tree is a projection." }
      ]
    },
    tradeoffs: {
      heading: "Costs and Common Pitfalls",
      intro: "Appending facts is cheap, but living with an immutable log has real costs.",
      points: [
        { label: "Schema evolution is hard", body: "Event shapes change over time. You handle it with upcasting (transform old events on read), versioning (<code>OrderCreated_v2</code>), or a deliberately weak/flexible schema. You never delete or modify stored events." },
        { label: "Eventual consistency on reads", body: "Projections update asynchronously, so the read model can briefly lag the write log and confuse users expecting instant consistency." },
        { label: "Snapshots needed for large aggregates", body: "An aggregate with too many events becomes slow to replay. Snapshot every N events or on an interval." },
        { label: "GDPR vs immutability", body: "The right to erasure conflicts with events being immutable forever. Mitigate with crypto-shredding: delete the per-record encryption key, not the event." },
        { label: "Side effects on replay", body: "A replay must never double-send an email or double-charge a card. Use process managers/sagas, the Outbox Pattern, idempotent handlers, and compensating events." }
      ]
    },
    handsOn: {
      goal: "Model a bank account as an append-only event log in Postgres and derive its balance by folding over events, never storing current state, then speed up replay with a snapshot.",
      stack: "Postgres in Docker + Node.js (<code>pg</code>). Local and free.",
      steps: [
        {
          title: "Start Postgres",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres",
          lang: "bash"
        },
        {
          title: "Create an events table (no accounts table)",
          code: "docker exec -i pg psql -U postgres -c \"CREATE TABLE events(id serial primary key, aggregate_id text, event_type text, payload jsonb, version int, ts timestamptz default now());\"",
          lang: "bash"
        },
        {
          title: "Install the client",
          code: "npm init -y && npm install pg",
          lang: "bash"
        },
        {
          title: "Append 20 events, then replay to derive the balance",
          body: "Save as <code>es.js</code>. <code>apply</code> folds each event into state; the balance is computed, never stored. Ten deposits of 100 and nine withdrawals of 30 leave 730.",
          code: `const { Pool } = require('pg');
const pg = new Pool({ host: 'localhost', user: 'postgres', password: 'pw' });
const ACC = 'acc-1';

async function append(type, payload) {
  const { rows } = await pg.query(
    'SELECT COALESCE(MAX(version),0)+1 v FROM events WHERE aggregate_id=$1', [ACC]);
  await pg.query(
    'INSERT INTO events(aggregate_id,event_type,payload,version) VALUES($1,$2,$3,$4)',
    [ACC, type, payload, rows[0].v]);
}

function apply(state, e) {
  if (e.event_type === 'MoneyDeposited') return { balance: state.balance + e.payload.amount };
  if (e.event_type === 'MoneyWithdrawn') return { balance: state.balance - e.payload.amount };
  return state;
}

async function replay() {
  const { rows } = await pg.query(
    'SELECT * FROM events WHERE aggregate_id=$1 ORDER BY version', [ACC]);
  return rows.reduce(apply, { balance: 0 });
}

(async () => {
  await append('AccountOpened', {});
  for (let i = 1; i <= 19; i++) {
    if (i % 2) await append('MoneyDeposited', { amount: 100 });
    else await append('MoneyWithdrawn', { amount: 30 });
  }
  console.log('derived balance:', (await replay()).balance);
  await pg.end();
})();`,
          lang: "javascript"
        },
        {
          title: "Snapshot, then replay only the tail",
          body: "Save as <code>snapshot.js</code>. Store current state as a <code>SnapshotTaken</code> event, then replay starting from the snapshot instead of from event 0.",
          code: `const { Pool } = require('pg');
const pg = new Pool({ host: 'localhost', user: 'postgres', password: 'pw' });
const ACC = 'acc-1';
const apply = (s, e) =>
  e.event_type === 'MoneyDeposited' ? { balance: s.balance + e.payload.amount } :
  e.event_type === 'MoneyWithdrawn' ? { balance: s.balance - e.payload.amount } : s;

(async () => {
  const full = (await pg.query('SELECT * FROM events WHERE aggregate_id=$1 ORDER BY version', [ACC]))
    .rows.reduce(apply, { balance: 0 });
  const max = (await pg.query('SELECT MAX(version) v FROM events WHERE aggregate_id=$1', [ACC])).rows[0].v;
  await pg.query('INSERT INTO events(aggregate_id,event_type,payload,version) VALUES($1,$2,$3,$4)',
    [ACC, 'SnapshotTaken', { balance: full.balance }, max + 1]);

  const snap = (await pg.query(
    "SELECT * FROM events WHERE aggregate_id=$1 AND event_type='SnapshotTaken' ORDER BY version DESC LIMIT 1",
    [ACC])).rows[0];
  const tail = (await pg.query(
    'SELECT * FROM events WHERE aggregate_id=$1 AND version>$2 ORDER BY version', [ACC, snap.version]))
    .rows.reduce(apply, { balance: snap.payload.balance });
  console.log('full replay:', full.balance, ' snapshot + tail:', tail.balance);
  await pg.end();
})();`,
          lang: "javascript"
        }
      ],
      observe: "The derived balance is 730, computed by folding events, not read from a stored column: current state genuinely derived. The snapshot run prints the same balance from both the full replay and the snapshot-plus-tail path, but the second reads far fewer rows: the replay shortcut real event stores rely on for large aggregates.",
      stretch: "Handle a GDPR erasure request without deleting history: implement crypto-shredding by encrypting each account's event payloads with a per-account key, then discard that key so the events become permanently unreadable while the log itself stays intact."
    }
  },
  keyTakeaways: [
    "Event Sourcing stores <strong>immutable events</strong> as the source of truth and derives current state by replaying them, giving a perfect audit trail and time-travel debugging.",
    "Core vocabulary: <strong>Event</strong> (past-tense fact), <strong>Stream</strong> (per-aggregate sequence), <strong>Aggregate</strong> (consistency boundary), <strong>Projection</strong> (replayed read model), <strong>Snapshot</strong> (replay shortcut).",
    "The costs are real: hard schema evolution, eventually consistent reads, snapshot strategy for large aggregates, and immutability clashing with GDPR (solved via crypto-shredding)."
  ],
  proTip: "Name events as facts in the past tense (`OrderShipped`, not `ShipOrder`). An event records what already happened and can never be rejected or undone, only compensated by a later event.",
  related: ["kafka", "cqrs", "ordering", "schema-registry", "saga-orchestration", "transactions", "cdc", "messaging-choice"],
  bridgeOut: "Event sourcing makes writes cheap (just append) but reads expensive (replay to get current state). CQRS is the direct fix, which is why the two are almost always taught together."
};
