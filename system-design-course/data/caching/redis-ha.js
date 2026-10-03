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
      goal: "Measure the RDB versus AOF durability trade by crashing Redis with and without the append-only log, then hand-promote a replica.",
      stack: "Two Redis containers in Docker on a shared network, driven from <code>redis-cli</code>. Local and free.",
      steps: [
        {
          title: "Start a no-persistence Redis and load 100 keys",
          body: "Default persistence off means an unclean kill loses the tail.",
          code: "docker run -d --name redis-nop -p 6379:6379 redis --save '' --appendonly no\ndocker exec redis-nop sh -c 'for i in $(seq 1 100); do redis-cli SET key:$i v$i > /dev/null; done'\ndocker exec redis-nop redis-cli DBSIZE",
          lang: "bash"
        },
        {
          title: "Hard-kill and restart, then count survivors",
          body: "<code>docker kill</code> skips a clean shutdown, so nothing was flushed to disk.",
          code: "docker kill redis-nop\ndocker start redis-nop\nsleep 2\ndocker exec redis-nop redis-cli DBSIZE",
          lang: "bash"
        },
        {
          title: "Repeat with AOF enabled at everysec",
          body: "The append-only log fsyncs roughly once a second, capping loss.",
          code: "docker run -d --name redis-aof -p 6380:6379 redis --appendonly yes --appendfsync everysec\ndocker exec redis-aof sh -c 'for i in $(seq 1 100); do redis-cli SET key:$i v$i > /dev/null; done'\ndocker kill redis-aof\ndocker start redis-aof\nsleep 2\ndocker exec redis-aof redis-cli DBSIZE",
          lang: "bash"
        },
        {
          title: "Wire up replication and promote by hand",
          body: "Point a replica at the AOF primary, confirm the write propagates, then promote the replica as Sentinel would.",
          code: "docker network create rnet 2>/dev/null; docker network connect rnet redis-aof\ndocker run -d --name redis-replica --network rnet redis --replicaof redis-aof 6379\nsleep 2\ndocker exec redis-aof redis-cli SET canary hello\ndocker exec redis-replica redis-cli GET canary\ndocker exec redis-replica redis-cli REPLICAOF NO ONE",
          lang: "bash"
        }
      ],
      observe: "The AOF instance recovers nearly all 100 writes (at most ~1 second of loss, matching <code>everysec</code>'s guarantee), while the no-persistence instance comes back nearly empty: a measured version of the RDB/AOF trade rather than an asserted one. The replica returns <code>hello</code> within milliseconds and, after <code>REPLICAOF NO ONE</code>, accepts writes as a standalone primary.",
      stretch: "Add a second replica and set <code>min-replicas-to-write 1</code> on the primary. Kill both replicas and confirm the primary now refuses writes, the availability-versus-durability knob made concrete."
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
