/* === Lesson idempotent-apis - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#idempotent-apis)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["idempotent-apis"] = {
  module: 3, num: "3.6", title: "Idempotent APIs",
  connectsFrom: "A payment request times out. Did it succeed and the response got lost, or did it fail before reaching the server? The client cannot tell, and a naive retry (or worse, a naive if(!exists(key)) then process() check) has a race condition that can charge a card twice.",
  tabs: {
    overview: {
      heading: "Idempotent APIs",
      intro: "An idempotent API guarantees that calling it N times has the <strong>same effect as calling it once</strong>. Critical for <strong>payments</strong>, <strong>orders</strong>, and any operation that must not duplicate. Stripe's pattern: the client generates an <strong>idempotency key</strong> before the first attempt, the server claims it atomically with <strong>SET key value NX EX 86400</strong>, processes once, and stores the result. Any retry with the same key gets the stored result back.",
      table: {
        headers: ["Failure Scenario", "Retry Safe?", "With Idempotency Key"],
        rows: [
          ["Request fails before reaching server", "<strong>Safe</strong>", "Key not consumed: retry works normally"],
          ["Server processing interrupted", "<strong>Unsafe</strong>", "<strong>Safe</strong>: key marks partial, server resumes or rejects"],
          ["Response lost in transit", "<strong>Unsafe</strong>", "<strong>Safe</strong>: key already processed, returns cached result"]
        ]
      },
      callouts: [
        { color: "purple", label: "Why SETNX (atomic) is critical:", body: "A naive <strong>if(!exists(key)) { process(); save(key); }</strong> has a <strong>race condition</strong>: two concurrent retries both see \u201ckey not found\u201d and both process the payment. <strong>SETNX</strong> (SET if Not eXists) is a <strong>single atomic Redis operation</strong> that checks AND sets in one step. Only the first request wins the lock; every other one reads the cached response." },
        { color: "green", label: "Implementation (concurrency-safe):", body: "Use <strong>Redis SETNX</strong>: key = UUID, value = {status: processing}. After the work completes, update the value to {status: done, response: ...}. On retry, SETNX fails (key exists) \u2192 read the stored response \u2192 return immediately. A <strong>24h TTL</strong> auto-cleans keys. Stripe requires an <strong>Idempotency-Key</strong> header on all POST endpoints." },
        { color: "yellow", label: "Key guarantees:", body: "<strong>Exactly-once</strong> side effects (the payment charges once). <strong>No double charges</strong> even under concurrent retries. <strong>Concurrency-safe</strong> via the atomic lock, not check-then-act. <strong>Network-retry resilient</strong>: clients can safely retry on any timeout." }
      ]
    },
    tradeoffs: {
      heading: "The Three Failure Scenarios",
      intro: "During any API call, three things can go wrong, and only an idempotency key makes scenarios 2 and 3 safe to retry.",
      points: [
        { label: "1. Request fails before reaching the server", body: "The server never saw it, so it is <strong>safe to retry</strong>: nothing has started processing." },
        { label: "2. Request reaches the server, processing interrupted", body: "<strong>Unsafe</strong> without a key: did the $100 deduct or not? You cannot tell from the client side." },
        { label: "3. Server processes fully, response lost", body: "<strong>Unsafe</strong> without a key: a blind retry means a double charge, because the work already happened." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (for Redis); Node.js or Python.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis`.",
      simulate: "Build a `POST /charge` endpoint that reads an `Idempotency-Key` header, does `SET idem:&lt;key&gt; \u201cprocessing\u201d NX EX 86400` in Redis, and only actually charges (increments an in-memory counter) if that SET succeeded. Fire 20 concurrent requests with the same idempotency key using `hey -n 20 -c 20 -H \u201cIdempotency-Key: abc123\u201d`.",
      observe: "The charge counter increments exactly once despite 20 concurrent attempts: the race condition from Overview, closed. Then remove the `NX` (making it a plain `SET`, no atomicity) and re-run: watch the counter increment more than once under concurrency.",
      stretch: "Store the actual response body alongside the key so a retry with the same key returns the original success response instead of a generic \u201calready processed\u201d message, which is Stripe's actual behavior."
    }
  },
  keyTakeaways: [
    "An idempotent API guarantees N calls have the <strong>same effect as one</strong>: essential for payments and orders.",
    "The client sends an <strong>idempotency key</strong>; the server claims it with an atomic <strong>SETNX</strong> and caches the result under it.",
    "SETNX closes the check-then-act <strong>race condition</strong>: only the first concurrent request wins the lock, the rest get the cached response."
  ],
  proTip: "Never write if(!exists(key)) then process(): those are two operations and two concurrent retries can both pass the check. Make the claim atomic with SETNX so exactly one request wins.",
  related: ["async-apis", "rest", "web-request", "redis-locks"],
  bridgeOut: "The SETNX lock used here does not get its own full explanation until Caching's Redis Distributed Locks lesson. This is the first real use of it."
};
