/* === Lesson transactions - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#transactions)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["transactions"] = {
  module: 9, num: "9.4", title: "Distributed Transactions",
  connectsFrom: "ACID on a single database is a solved problem (6.4). Writing atomically across multiple databases or services, an order service and a payment service, has no single engine enforcing it for you, so you rebuild atomicity at the application level.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "patterns", label: "Compare Patterns", icon: "layers" },
    { key: "acid", label: "Single DB vs Distributed", icon: "swap" },
    { key: "realWorld", label: "Real-World", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Atomicity Across Services",
      intro: "Once a transaction spans multiple services, you pick a pattern that trades strictness for scale. <strong>2PC</strong> gives strong atomicity but blocks; <strong>Saga</strong>, <strong>Outbox</strong>, and <strong>TCC</strong> accept eventual consistency to stay non-blocking and available. The <strong>Compare Patterns</strong> tab lines them up side by side.",
      cards: [
        { icon: "2P", title: "2PC (Two-Phase Commit)", color: "blue", body: "A coordinator asks every participant to <strong>prepare</strong>, then tells them all to <strong>commit</strong> only if everyone agreed. Strong, but blocking, and a coordinator crash mid-commit leaves participants stuck." },
        { icon: "SG", title: "Saga", color: "green", body: "No coordinator (choreography): a chain of local transactions, each with a <strong>compensating action</strong> that undoes it on failure." },
        { icon: "OB", title: "Outbox Pattern", color: "teal", body: "Write the state change and the event to publish in the <strong>same local transaction</strong>, then publish it separately. Closes the dual-write problem (12.1)." },
        { icon: "TC", title: "TCC (Try-Confirm-Cancel)", color: "orange", body: "Reserve resources first, then confirm or cancel. Common in fintech, where holding funds before capture is natural." }
      ]
    },
    patterns: {
      heading: "The Four Patterns Side by Side",
      intro: "Same goal, different points on the strict-vs-scalable axis. Match the pattern to how much blocking and staleness the workload can tolerate.",
      table: {
        headers: ["Pattern", "Consistency", "Blocking?", "Best For"],
        rows: [
          ["<strong>2PC</strong>", "Strong", "Yes, coordinator is a single point of failure", "Distributed DBs (Spanner, XA)"],
          ["<strong>Saga</strong>", "Eventual", "No", "Most microservices (Uber, Airbnb)"],
          ["<strong>Outbox</strong>", "Eventual", "No", "Reliable event publishing (Stripe)"],
          ["<strong>TCC</strong>", "Eventual", "No", "Fintech, reserve before commit"]
        ]
      },
      callouts: [
        { color: "green", label: "Why Outbox exists:", body: "A naive \u201cwrite to DB, then publish\u201d can lose the event if the process dies between the two steps. Writing the row and the event in one transaction, then publishing from the outbox, guarantees the event is <strong>never lost</strong>." }
      ]
    },
    acid: {
      heading: "How ACID Changes When You Distribute",
      intro: "Every ACID property still applies across services, but the mechanism that enforces it moves out of the database engine and into your architecture.",
      table: {
        headers: ["Property", "Single DB", "Distributed (Microservices)"],
        rows: [
          ["<strong>Atomicity</strong>", "<strong>commit/rollback</strong> via WAL", "<strong>2PC</strong> (strict, blocking) or <strong>Saga</strong> (eventual + compensating)"],
          ["<strong>Consistency</strong>", "DB constraints, <strong>PK, FK, UNIQUE</strong>", "App logic + events, no global constraints"],
          ["<strong>Isolation</strong>", "<strong>Locks / MVCC</strong>", "Distributed MVCC, optimistic locks, high latency"],
          ["<strong>Durability</strong>", "<strong>WAL + disk</strong>", "<strong>Replication + quorum writes</strong>, survives node failure"]
        ]
      }
    },
    realWorld: {
      heading: "Who Uses Which Pattern",
      intro: "At the application level, Saga and Outbox dominate; 2PC survives mostly inside distributed databases.",
      points: [
        { label: "Uber", body: "Saga via Temporal/Cadence for the trip and payment lifecycle." },
        { label: "Stripe", body: "Outbox for reliably publishing payment events without a dual-write." },
        { label: "Airbnb", body: "Saga for booking: reserve, then charge, then confirm." },
        { label: "Spanner and XA", body: "2PC lives on inside distributed databases and the XA standard, where participants share a trust boundary and transactions are short-lived." }
      ]
    },
    tradeoffs: {
      heading: "2PC vs Saga",
      intro: "The core choice is strong-but-blocking against scalable-but-eventual.",
      points: [
        { label: "2PC", body: "Gives strong atomicity but blocks, and does not scale well across many participants or high latency: a coordinator crash after PREPARE leaves everyone waiting." },
        { label: "Saga", body: "Scales and does not block, but trades atomicity for eventual consistency plus real complexity in writing correct compensating actions." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js or Python; the Kafka lab from 8.2 or a simple queue.",
      setup: "Local and free: 2 small services (\u201cOrder Service\u201d and \u201cPayment Service\u201d), each with its own SQLite/Postgres instance, plus a message queue between them.",
      simulate: "Implement the Outbox Pattern in Order Service: in one local transaction, insert the order row AND an `OrderCreated` event row into an `outbox` table. A separate poller reads unpublished outbox rows, publishes them to the queue, and marks them published. Payment Service consumes `OrderCreated` and either charges or publishes `PaymentFailed`, which Order Service listens for and compensates by cancelling the order.",
      observe: "Kill the poller right after the DB transaction commits but before it publishes: the event is safely sitting in the outbox, unpublished, and gets picked up once the poller restarts, with zero events lost. Contrast with a naive \u201cwrite to DB, then publish\u201d: kill the process between those steps and the event is gone forever, the exact dual-write problem Outbox exists to close.",
      stretch: "Force `PaymentFailed` and confirm Order Service's compensating action actually cancels the order: the Saga's compensation step, executed rather than described."
    }
  },
  keyTakeaways: [
    "Across services there is no single engine enforcing ACID, so you choose a pattern: <strong>2PC</strong> (strong, blocking), <strong>Saga</strong> (eventual, compensating), <strong>Outbox</strong> (reliable publishing), or <strong>TCC</strong> (reserve then confirm/cancel).",
    "2PC blocks and makes the coordinator a single point of failure; Saga scales and never blocks but pushes correctness into compensating actions and eventual consistency.",
    "The Outbox Pattern writes data and event in one local transaction to close the dual-write problem, which is why Stripe and others use it for reliable event publishing."
  ],
  proTip: "Default to Saga plus Outbox for microservices and keep 2PC for the rare case of a few databases in one trust boundary; the moment a transaction is long-running or crosses teams, blocking two-phase commit is the wrong tool.",
  related: ["saga-orchestration", "concurrency", "consensus", "conflict-resolution", "event-sourcing", "sharding"],
  bridgeOut: "2PC mostly lost to Saga at the application level. Before comparing transaction patterns further, the more basic question of two transactions touching the same row deserves its own lesson."
};
