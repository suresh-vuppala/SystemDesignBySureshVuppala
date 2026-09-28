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
      prerequisites: "Docker (Redis); Node.js or Python.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis`.",
      simulate: "Write 2 worker processes that both try `SET lock:resource1 <workerId> NX EX 5` in a tight retry loop against the same resource. Confirm only one worker wins the lock at a time and the other keeps retrying. Then simulate the Redlock failure: have worker A acquire the lock, artificially pause it (a `sleep(6000)` longer than the 5-second TTL, standing in for a GC pause), let the lock expire and worker B acquire it, then let worker A wake up and act as if it still held the lock.",
      observe: "Both workers believing they hold the lock during the overlap window, the exact split-brain scenario reproduced on purpose. Then add a fencing token (an incrementing counter returned with each grant) and have the protected resource reject any write carrying a token older than the last it accepted; worker A's stale write now gets rejected instead of corrupting data.",
      stretch: "None. This lesson's value is the failure reproduction, and it is already fairly involved."
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
