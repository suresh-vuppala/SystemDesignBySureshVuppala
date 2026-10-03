/* === Lesson redis-locks - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-locks)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-locks"] = {
  module: 7, num: "7.10", title: "Redis Distributed Locks",
  connectsFrom: "Two processes both think they hold the same lock, a classic distributed-systems failure, and the naive fix breaks in a specific, well-documented way worth understanding before relying on it.",
  tabs: {
    overview: {
      heading: "SETNX Locks and the Redlock Debate",
      intro: "A simple lock is one atomic command: <code>SET key value NX EX 30</code>, set only if absent, with an auto-expiry so a crashed holder does not lock everyone out forever. That is fine for efficiency, but <strong>not safe for correctness</strong>, and knowing why is the whole lesson.",
      cards: [
        { icon: "L", title: "Simple lock", color: "green", body: "<code>SET lock:order:123 \"worker-A\" NX EX 30</code> acquires; release atomically with a Lua check-and-delete so you never delete someone else's lock." },
        { icon: "!", title: "The split-brain", color: "red", body: "A holder pauses (GC, clock jump, partition) long enough for the lock to expire and be re-granted. Now two processes both believe they hold it." },
        { icon: "#", title: "Fencing tokens", color: "purple", body: "A monotonically increasing number issued with the lock. The protected resource rejects any token older than the last it accepted, so a stale holder's write fails." }
      ],
      table: {
        headers: ["Failure Mode", "Redlock Safe?", "With Fencing Token"],
        rows: [
          ["<strong>GC / Process Pause</strong>", "No, both in critical section", "Safe, stale token rejected"],
          ["<strong>Clock Drift (NTP jump)</strong>", "No, TTL expires early", "Safe, token not time-based"],
          ["<strong>Network Partition</strong>", "No, split brain", "Safe, highest token wins"],
          ["<strong>Redis Failover</strong>", "No, lock lost on promotion", "Safe, fencing protects storage"]
        ]
      },
      callouts: [
        { color: "green", label: "When single-node SETNX is fine:", body: "<strong>Rate limiting</strong>, <strong>deduplication</strong>, <strong>idempotency keys</strong>. Acceptable whenever a rare double-execution is tolerable." },
        { color: "green", label: "When to use what:", body: "<strong>Redis SETNX</strong> for efficiency locks (dedup, rate limiting, idempotency). <strong>etcd / ZooKeeper + fencing</strong> for correctness locks (payments, inventory). <strong>Optimistic concurrency (CAS)</strong> when you can avoid locks entirely." },
        { color: "red", label: "Kleppmann's verdict:", body: "\u201cRedlock is <strong>not safe for correctness</strong>. It is fine for efficiency. For correctness, use consensus-based locks (etcd, ZooKeeper, Chubby) with fencing tokens.\u201d" },
        { color: "blue", label: "Real-world:", body: "<strong>Google Chubby</strong> (Paxos + sequencer). <strong>etcd</strong> (Raft + revision numbers). <strong>ZooKeeper</strong> (ephemeral znodes). <strong>Stripe</strong> uses Redis for idempotency (efficiency) but DB constraints for payment correctness." }
      ]
    },
    tradeoffs: {
      heading: "Four Ways Redlock Breaks",
      points: [
        { label: "GC / Process Pause", body: "The holder freezes long enough for the TTL to expire; another client acquires the lock, then the first wakes up and resumes, unaware it no longer holds it. Both act in the critical section at once." },
        { label: "Clock Drift", body: "An NTP jump moves a node's clock, so the TTL expires earlier than expected and the lock is re-granted prematurely." },
        { label: "Network Partition", body: "A partition splits the cluster and two sides each grant the lock: classic split brain." },
        { label: "Redis Failover", body: "The primary crashes with the lock un-replicated; a replica is promoted with no record of it, and the lock is silently handed out again. Fencing tokens fix all four by letting the storage reject a stale holder's write." }
      ]
    },
    handsOn: {
      goal: "Reproduce the Redlock split-brain on purpose (two clients holding one lock) and then defeat it with a fencing token.",
      stack: "Redis in Docker plus Node.js with <code>ioredis</code>. Local and free.",
      steps: [
        {
          title: "Start Redis",
          code: "docker run -d --name redis -p 6379:6379 redis",
          lang: "bash"
        },
        {
          title: "Write a lock worker with a fencing token",
          body: "Acquire with <code>SET ... NX EX 5</code>. Each grant also bumps a monotonic <code>INCR</code> token. The protected resource records the highest token it has accepted. Save as <code>worker.js</code>.",
          code: "const Redis = require('ioredis');\nconst redis = new Redis();\nconst who = process.argv[2] || 'A';\nconst stall = Number(process.argv[3] || 0); // ms to pause after acquiring\nconst sleep = (ms) => new Promise(r => setTimeout(r, ms));\n\nasync function main() {\n  // 1) acquire\n  let token;\n  while (true) {\n    const got = await redis.set('lock:resource1', who, 'NX', 'EX', 5);\n    if (got) { token = await redis.incr('lock:resource1:fence'); break; }\n    await sleep(200);\n  }\n  console.log(`${who} acquired lock with fence token ${token}`);\n\n  // 2) simulate a GC pause longer than the 5s TTL\n  if (stall) { console.log(`${who} stalling ${stall}ms...`); await sleep(stall); }\n\n  // 3) try to write, guarded by the fencing token\n  const accepted = Number(await redis.get('resource:last_token')) || 0;\n  if (token >= accepted) {\n    await redis.set('resource:last_token', token);\n    console.log(`${who} WRITE ACCEPTED (token ${token} >= ${accepted})`);\n  } else {\n    console.log(`${who} WRITE REJECTED (stale token ${token} < ${accepted})`);\n  }\n  process.exit(0);\n}\nmain();",
          lang: "javascript"
        },
        {
          title: "Install ioredis",
          code: "npm init -y && npm install ioredis",
          lang: "bash"
        },
        {
          title: "Force the overlap: A stalls past its TTL, B grabs the lock",
          body: "A holds the lock, then pauses 7s (longer than the 5s TTL). While it sleeps the lock expires and B acquires it. Run A in the background, B right after.",
          code: "node worker.js A 7000 &\nsleep 1\nnode worker.js B 0\nwait",
          lang: "bash"
        }
      ],
      observe: "During the overlap both workers believe they hold the lock, the exact split-brain reproduced on purpose. But B writes first with the newer fence token, so when A wakes its write prints <code>WRITE REJECTED (stale token ...)</code> instead of corrupting data: the fencing token catches what the lock alone could not.",
      stretch: "Drop the fencing check (write unconditionally) and rerun: A's stale write now clobbers B's, showing the silent corruption the token prevented. Then move <code>resource:last_token</code> enforcement into a Lua script so the compare-and-set is atomic."
    }
  },
  keyTakeaways: [
    "A single-node `SET key val NX EX 30` is a fine efficiency lock (dedup, rate limiting, idempotency) where a rare double-run is tolerable.",
    "Redlock is unsafe for correctness: GC pauses, clock drift, partitions, and failover can all let two clients hold the same lock simultaneously.",
    "Fencing tokens (a monotonic counter checked by the protected resource) fix all four modes; etcd, ZooKeeper, and Chubby provide them natively, Redis does not."
  ],
  proTip: "Split locks into efficiency versus correctness. Redis is fine when an occasional double-execution just wastes work; when a double-execution corrupts data or money, use a consensus store with fencing tokens.",
  related: ["redis", "redis-cluster", "idempotent-apis", "redis-ha"],
  bridgeOut: "This exact lock was already used, unexplained, in the APIs module's Idempotent APIs lesson. Next: the honest comparison of Redis against Memcached."
};
