/* === Lesson redis-ha - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-ha)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-ha"] = {
  module: 7, num: "7.8", title: "Redis Persistence & HA",
  connectsFrom: "Redis is, by design, in-memory. A crash or restart without persistence means everything it held is simply gone. Persistence and replication are how it survives that.",
  tabs: {
    overview: {
      heading: "Surviving Crashes: RDB, AOF, and Failover",
      intro: "Two persistence modes trade recovery speed against data loss: <strong>RDB</strong> is a point-in-time snapshot (fast restore, loses everything since the last one); <strong>AOF</strong> logs every write (near-zero loss). Replication gives standby copies, and <strong>Sentinel</strong> promotes a replica automatically when the primary fails.",
      cards: [
        { icon: "S", title: "RDB (Snapshot)", color: "orange", body: "<code>fork()</code> and write a compact binary dump to disk. Fast restart, but loses everything since the last snapshot (1 to 15 min typical)." },
        { icon: "A", title: "AOF (Append-Only)", color: "green", body: "Log every write command. With <code>appendfsync everysec</code>, at most ~1 second of loss. Slower restart because it replays commands." },
        { icon: "F", title: "Sentinel Failover", color: "blue", body: "3+ Sentinels monitor the primary and, on quorum, promote a replica in ~5 to 15 seconds using Raft-like leader election." }
      ],
      table: {
        headers: ["", "RDB (Snapshot)", "AOF (Append-Only)", "Hybrid (RDB + AOF)"],
        rows: [
          ["<strong>How</strong>", "fork() \u2192 child writes .rdb to disk", "Log every write command to file", "AOF for durability, RDB for fast restart"],
          ["<strong>Data loss</strong>", "Up to last snapshot interval (1-15 min)", "\u2264 1 second (appendfsync everysec)", "\u2264 1 second"],
          ["<strong>Restart speed</strong>", "Fast, load binary dump", "Slow, replay all commands", "Fast, load RDB + replay recent AOF"],
          ["<strong>Disk I/O</strong>", "Low (periodic bulk write)", "High (continuous fsync)", "Medium"],
          ["<strong>File size</strong>", "Compact binary", "Large (AOF rewrite compacts)", "Both files maintained"],
          ["<strong>Best for</strong>", "Backups, disaster recovery", "Durability-critical data", "Production default (Redis 4.0+)"]
        ]
      },
      callouts: [
        { color: "green", label: "AOF fsync options:", body: "<code>always</code> (every write, slowest, zero loss) \u00b7 <code>everysec</code> (flush once/sec, <strong>recommended</strong>, \u22641s loss) \u00b7 <code>no</code> (OS decides, fastest, unpredictable loss). AOF rewrite periodically compacts redundant commands." },
        { color: "yellow", label: "Replication:", body: "<strong>Async by default</strong>: the master streams commands to replicas, which serve reads (read scaling). Async means data loss is possible on a master crash; use <code>WAIT numreplicas timeout</code> for semi-sync." },
        { color: "yellow", label: "Sentinel (auto-failover):", body: "3+ Sentinels monitor the master. On quorum they promote a replica and reconfigure clients, in ~5 to 15 seconds, using Raft-like leader election among themselves." }
      ]
    },
    tradeoffs: {
      heading: "Where Data Loss Hides",
      points: [
        { label: "RDB loses the tail", body: "A snapshot only captures up to the last interval. Anything written since is gone on a crash, in exchange for fast restore and low disk I/O." },
        { label: "Async replication can lose writes", body: "If the master accepted writes not yet replicated before it crashed, those writes are permanently lost during failover." },
        { label: "Safety valves", body: "`WAIT numreplicas timeout` waits for N replicas to acknowledge; `min-replicas-to-write` and `min-replicas-max-lag` refuse writes when too few replicas are caught up, trading availability for durability." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Redis); `redis-cli`.",
      setup: "Local and free: 2 Redis containers, one configured as a replica of the other (`docker run -d redis --replicaof <primary-ip> 6379`); AOF enabled on the primary (`--appendonly yes`).",
      simulate: "Write 100 keys to the primary with AOF disabled, kill the container (`docker kill`) without a clean shutdown, restart it, and check how many keys survived (likely very few). Repeat with AOF enabled and `appendfsync everysec`, then kill and restart again.",
      observe: "The AOF-enabled instance recovers nearly all writes (at most ~1 second of loss, matching `everysec`'s guarantee), versus the no-persistence instance losing everything, a measured version of the RDB/AOF trade rather than an asserted one.",
      stretch: "Confirm replication by writing a key on the primary and reading it from the replica (`redis-cli -p <replica-port> GET key`) within milliseconds, then kill the primary and manually promote the replica (`REPLICAOF NO ONE`), simulating what Sentinel would do automatically."
    }
  },
  keyTakeaways: [
    "RDB snapshots restore fast but lose the tail since the last snapshot; AOF logs every write for \u22641s loss at the cost of slower restart. Hybrid is the production default.",
    "Replication is async by default, so a master crash can lose writes that were not yet replicated; WAIT and min-replicas settings trade availability for durability.",
    "Sentinel provides automatic failover in ~5 to 15 seconds via Raft-like election, without needing a full consensus protocol."
  ],
  proTip: "For anything you cannot afford to lose, enable AOF with `appendfsync everysec` and pair it with replication. RDB alone is a backup tool, not a durability guarantee.",
  related: ["redis-cluster", "redis", "redis-streams", "redis-cache", "redis-locks"],
  bridgeOut: "Persistence protects one node. What changes once Redis itself is sharded across many nodes is the next question."
};
