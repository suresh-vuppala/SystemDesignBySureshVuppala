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
      goal: "Fire 20 concurrent charges with the same idempotency key and prove an atomic Redis <code>SET NX</code> lets exactly one through.",
      stack: "Node.js + Express + Redis (Docker), load-tested with <code>hey</code>. Local and free.",
      steps: [
        {
          title: "Start Redis and set up the project",
          code: "docker run -d --name redis -p 6379:6379 redis\nmkdir idem-lab && cd idem-lab\nnpm init -y && npm install express ioredis",
          lang: "bash"
        },
        {
          title: "Claim the key atomically before charging",
          body: "<code>SET idem:&lt;key&gt; processing NX EX 86400</code> succeeds only for the first request; the charge counter increments only when the claim wins. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst Redis = require('ioredis');\nconst redis = new Redis();\nconst app = express();\n\nlet charges = 0; // stand-in for a real payment\n\napp.post('/charge', async (req, res) => {\n  const key = req.header('Idempotency-Key');\n  // atomic claim: NX means 'only if it does not already exist'\n  const won = await redis.set('idem:' + key, 'processing', 'NX', 'EX', 86400);\n  if (!won) return res.status(200).json({ status: 'already processed', charges });\n  charges++;\n  res.status(201).json({ status: 'charged', charges });\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Run the server",
          code: "node server.js",
          lang: "bash"
        },
        {
          title: "Fire 20 concurrent requests with one shared key",
          code: "hey -n 20 -c 20 -m POST -H 'Idempotency-Key: abc123' http://localhost:3000/charge\ndocker exec redis redis-cli GET idem:abc123",
          lang: "bash"
        },
        {
          title: "Break it to see the race, then fix it back",
          body: "Drop the <code>NX</code> so the claim is no longer atomic, restart, clear the key, and re-run the load test.",
          code: "# change the SET line to a plain, non-atomic write:\n#   await redis.set('idem:' + key, 'processing', 'EX', 86400);\ndocker exec redis redis-cli DEL idem:abc123\nhey -n 20 -c 20 -m POST -H 'Idempotency-Key: abc123' http://localhost:3000/charge",
          lang: "bash"
        }
      ],
      observe: "With <code>NX</code>, the charge counter reaches exactly <strong>1</strong> despite 20 concurrent attempts: 1 response says <code>charged</code> and 19 say <code>already processed</code>. Remove <code>NX</code> and the counter climbs past 1 under concurrency, the check-then-act race from Overview, reopened.",
      stretch: "Store the real response body alongside the key so a retry with the same key returns the original success payload instead of a generic <code>already processed</code> message, which is Stripe's actual behavior."
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
