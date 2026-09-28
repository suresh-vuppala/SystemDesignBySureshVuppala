/* === Lesson concurrency - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#concurrency)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["concurrency"] = {
  module: 9, num: "9.5", title: "Concurrency Control",
  connectsFrom: "Distributed transactions coordinated writes across services. This lesson zooms into a smaller, sharper problem: two transactions read the same row, both compute an update, both write back, and one silently overwrites the other with no error at all.",
  tabs: {
    overview: {
      heading: "Same Data, No Corruption",
      intro: "Concurrency control keeps multiple transactions from corrupting <strong>the same data</strong>. The two core strategies are <strong>pessimistic locking</strong> (lock first, then work) and <strong>optimistic locking</strong> (work freely, check a version on write). <strong>MVCC</strong> lets readers see a consistent snapshot without blocking writers at all.",
      cards: [
        { icon: "PL", title: "Pessimistic Locking", color: "red", body: "Lock first, then work: <code>SELECT ... FOR UPDATE</code>. Safe with no retry, but risks deadlock and blocks other writers. Right for <strong>high contention</strong>: flash sales, seat booking, inventory." },
        { icon: "OL", title: "Optimistic Locking", color: "green", body: "No lock; check a version number on write (<code>WHERE version=N</code>). High throughput and deadlock-free, but retries under contention. Right for <strong>low contention</strong>: profile edits, wiki pages, config." },
        { icon: "MV", title: "MVCC", color: "blue", body: "Multi-version concurrency control: readers see a consistent <strong>snapshot</strong> without taking read locks, so readers never block writers." }
      ],
      table: {
        headers: ["Pessimistic Locking", "Optimistic Locking"],
        rows: [
          ["<strong>Lock first</strong>, then read and write (<code>SELECT ... FOR UPDATE</code>)", "<strong>No lock</strong>: read freely, verify a version on write (<code>WHERE version=N</code>)"],
          ["Safe: no race condition, no retry needed", "High throughput, no blocking, deadlock-free"],
          ["Deadlock risk and throughput bottleneck (others wait)", "Retry overhead when a conflict actually happens"],
          ["Use for high contention: flash sales, seat booking", "Use for low contention: profile edits, wiki pages, config"]
        ]
      },
      callouts: [
        { color: "blue", label: "Isolation levels (weakest to strongest):", body: "<strong>Read Uncommitted</strong> \u2192 <strong>Read Committed</strong> (Postgres default) \u2192 <strong>Repeatable Read</strong> (MySQL default) \u2192 <strong>Serializable</strong> (strongest, slowest). <strong>MVCC</strong>: readers see a snapshot, no read locks. <strong>Deadlock prevention</strong>: acquire locks in the same order, use timeouts." },
        { color: "green", label: "How optimistic locking detects a conflict:", body: "Read the row and its version, then write with <code>WHERE version=&lt;the version you read&gt;</code> and <code>version=version+1</code>. If another writer moved on first, your update affects <strong>0 rows</strong>, a clean signal your app can catch and retry." }
      ]
    },
    realWorld: {
      heading: "Where Each Strategy Fits",
      intro: "The right choice follows contention: how often two writers actually collide on the same row.",
      points: [
        { label: "High-contention paths", body: "Flash sales, seat booking, and inventory decrements use pessimistic locking, because conflicts are near-certain and overselling must be prevented up front." },
        { label: "Low-contention paths", body: "Profile edits, wiki pages, and config changes use optimistic locking, because collisions are rare and a cheap retry beats holding locks." },
        { label: "Database defaults", body: "Postgres defaults to Read Committed, MySQL (InnoDB) to Repeatable Read, and both use MVCC so readers never block on writers." }
      ]
    },
    tradeoffs: {
      heading: "The Lost Update, and the Cost of Preventing It",
      intro: "Locks exist because of one specific silent bug, and each strategy pays a different price to avoid it.",
      points: [
        { label: "The lost update", body: "Without locks, two users buying the <strong>last ticket</strong> both read <code>stock=1</code>, both decrement, both succeed, and the store is oversold. It is a race condition that produces no error at all." },
        { label: "Pessimistic cost", body: "Locking up front prevents the interleaving entirely, but risks deadlock and becomes a throughput bottleneck because other writers wait." },
        { label: "Optimistic cost", body: "Skipping locks maximizes concurrency, but a real conflict turns into a 0-rows-affected write your code must detect and retry, which is wasted work under high contention." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Postgres); 2 `psql` sessions.",
      setup: "Local and free: `docker run -d -p 5432:5432 postgres`.",
      simulate: "Create an `accounts` table with `balance` and `version`. Reproduce the lost-update bug: in session A, `SELECT balance FROM accounts WHERE id=1` (reads 100) and pause; in session B, do the same read, then `UPDATE accounts SET balance=90 WHERE id=1` and commit; back in A, use its stale read to `UPDATE accounts SET balance=90 WHERE id=1`, and B's update is silently gone. Now fix it with optimistic locking: `UPDATE accounts SET balance=90, version=version+1 WHERE id=1 AND version=<the version you read>`.",
      observe: "The silent, undetected lost update in the first run versus the 0-rows-affected signal in the second: an invisible bug turned into a detectable, retryable one because the version had moved.",
      stretch: "Repeat with `SELECT ... FOR UPDATE` (pessimistic) instead: session B's read blocks until session A commits or rolls back, preventing the interleaving entirely rather than detecting it after the fact."
    }
  },
  keyTakeaways: [
    "Without concurrency control, two writers reading the same row produce a silent <strong>lost update</strong>: both succeed, one overwrites the other, and no error is raised.",
    "<strong>Pessimistic locking</strong> (<code>SELECT ... FOR UPDATE</code>) prevents conflicts up front for high-contention paths; <strong>optimistic locking</strong> (version check) detects them cheaply for low-contention paths.",
    "Isolation runs Read Uncommitted \u2192 Read Committed \u2192 Repeatable Read \u2192 Serializable, and MVCC lets readers see a snapshot so they never block writers."
  ],
  proTip: "Pick your locking strategy by contention, not habit: if collisions on a row are near-certain, lock up front; if they are rare, let writers race and detect the loser with a version check and a retry.",
  related: ["transactions", "consistency-models", "conflict-resolution", "saga-orchestration"],
  bridgeOut: "Saga was introduced in 9.4 as one distributed-transaction option. It deserves its own full lesson."
};
