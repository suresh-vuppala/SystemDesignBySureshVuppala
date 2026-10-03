/* === Lesson data-redundancy - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#data-redundancy)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["data-redundancy"] = {
  module: 11, num: "11.6", title: "Data Redundancy & Recovery",
  connectsFrom: "A slow dependency is the circuit breaker\u2019s problem. An actual data-loss event, a disk failing or a whole region going dark, is this lesson\u2019s. Every recovery strategy is really an argument about two numbers: how much data you can lose, and how long you can be down.",
  tabs: {
    overview: {
      heading: "Survive Failures Without Losing Data",
      intro: "Every redundancy strategy optimizes two targets: <strong>RPO</strong> (Recovery Point Objective, the max data you can lose) and <strong>RTO</strong> (Recovery Time Objective, the max downtime you can tolerate). The five strategies below trade cost against how close to zero they push each number.",
      cards: [
        { icon: "P", title: "RPO", color: "purple", body: "<strong>Recovery Point Objective</strong>: how far back your recovery point is, i.e. the maximum acceptable data loss. \u201cWe can lose at most 5 minutes of writes.\u201d" },
        { icon: "T", title: "RTO", color: "blue", body: "<strong>Recovery Time Objective</strong>: how fast you must be back up, i.e. the maximum acceptable downtime. \u201cWe must recover within 2 minutes.\u201d" },
        { icon: "3", title: "3-2-1 Rule", color: "green", body: "<strong>3 copies</strong>, on <strong>2 different media</strong>, with <strong>1 offsite</strong>. The baseline that survives a single failure of any one kind." }
      ],
      table: {
        headers: ["Strategy", "How", "RPO / RTO", "Use Case"],
        rows: [
          ["<strong>Replication</strong>", "Sync/async copies across nodes", "RPO: 0 (sync) or seconds (async). RTO: seconds (auto-failover)", "HA databases (Postgres replicas, Cassandra ring)"],
          ["<strong>Erasure Coding</strong>", "Split data into fragments + parity. Reconstruct from a subset.", "RPO: 0. RTO: minutes (rebuild)", "Object storage (S3 uses Reed-Solomon), HDFS"],
          ["<strong>Snapshots</strong>", "Point-in-time copy of the entire dataset", "RPO: hours (last snapshot). RTO: minutes to hours", "DB backups (RDS snapshots), VM snapshots"],
          ["<strong>WAL / Binlog</strong>", "Continuous log of all changes. Replay to recover.", "RPO: ~0 (continuous). RTO: minutes (replay)", "Postgres PITR, MySQL binlog replication"],
          ["<strong>Geo-Redundancy</strong>", "Replicate across regions (100+ km apart)", "RPO: seconds (async). RTO: minutes (DNS failover)", "Disaster recovery, survive an entire region failure"]
        ]
      },
      callouts: [
        { color: "green", label: "Key terms:", body: "<strong>RPO</strong> (Recovery Point Objective), max data loss tolerable (how far back?). <strong>RTO</strong> (Recovery Time Objective), max downtime tolerable (how fast to recover?). <strong>3-2-1 Rule</strong>: 3 copies, 2 media, 1 offsite. Standby tiers: <strong>Hot</strong> = instant failover, <strong>Warm</strong> = minutes, <strong>Cold</strong> = hours (cheapest)." }
      ]
    },
    tradeoffs: {
      heading: "Choosing a Strategy",
      intro: "The right strategy is whichever hits your RPO/RTO targets at the lowest cost, and they stack.",
      points: [
        { label: "Replication vs snapshots", body: "Replication gives near-zero RPO and seconds of RTO but costs a live standby. Snapshots are cheap but your RPO is \u201chowever long since the last snapshot,\u201d which can be hours." },
        { label: "Erasure coding vs replicas", body: "Erasure coding stores far less than 3x full copies for the same durability, but rebuilding a lost fragment is CPU-heavy and slower (RTO in minutes). Great for cold object storage, poor for hot databases." },
        { label: "Geo-redundancy\u2019s hidden cost", body: "Cross-region async replication survives a whole region dying, but the async lag is your RPO: whatever had not replicated when the region failed is simply gone." }
      ]
    },
    handsOn: {
      goal: "Measure your real RPO and RTO by snapshotting Postgres, writing more rows, destroying the primary, and restoring.",
      stack: "A Postgres container in Docker with <code>pg_basebackup</code> for snapshots. Local and free.",
      steps: [
        {
          title: "Seed a table and record the baseline",
          body: "Assumes a running <code>pg-primary</code> container. Note the row count: this is the state your snapshot will capture.",
          code: "docker exec -i pg-primary psql -U postgres -c \"CREATE TABLE IF NOT EXISTS events(id int, note text);\"\ndocker exec -i pg-primary psql -U postgres -c \"INSERT INTO events SELECT g,'seed-'||g FROM generate_series(1,1000) g;\"",
          lang: "bash"
        },
        {
          title: "Take a snapshot with pg_basebackup",
          code: "docker exec pg-primary rm -rf /tmp/snap\ndocker exec pg-primary pg_basebackup -U postgres -D /tmp/snap -Ft -z\ndocker cp pg-primary:/tmp/snap ./snap",
          lang: "bash"
        },
        {
          title: "Write 100 more rows after the snapshot",
          body: "These rows exist only on the primary, not in the snapshot: they are exactly what a snapshot-only recovery will lose.",
          code: "docker exec -i pg-primary psql -U postgres -c \"INSERT INTO events SELECT g,'after-snap-'||g FROM generate_series(1001,1100) g;\"\ndocker exec -i pg-primary psql -U postgres -c \"SELECT count(*) FROM events;\"",
          lang: "bash"
        },
        {
          title: "Simulate a disaster",
          body: "Destroy the primary entirely and start your restore timer now: elapsed time until queries work again is your RTO.",
          code: "docker rm -f pg-primary",
          lang: "bash"
        },
        {
          title: "Restore from the snapshot and count survivors",
          code: "mkdir -p restore && tar -xzf snap/base.tar.gz -C restore\ndocker run -d --name pg-restored -p 5433:5432 -v \"$PWD/restore:/var/lib/postgresql/data\" -e POSTGRES_PASSWORD=pw postgres\nsleep 5\ndocker exec -i pg-restored psql -U postgres -c \"SELECT count(*) FROM events;\"",
          lang: "bash"
        }
      ],
      observe: "The restored count is about 1000, missing the 100 rows written after the snapshot: that gap is your real RPO, matching the \"RPO = time since last snapshot\" claim scaled to however often you snapshot. The elapsed restore-plus-restart time is your real RTO.",
      stretch: "Repeat the disaster but recover by promoting a streaming replica (up to date within its lag window) instead of the snapshot. Compare its RPO (near 0) and RTO (mostly just promotion time) against snapshot recovery."
    }
  },
  keyTakeaways: [
    "Every recovery strategy is measured by <strong>RPO</strong> (max data loss) and <strong>RTO</strong> (max downtime); pick the cheapest option that meets both targets.",
    "The five strategies form a cost/speed ladder: <strong>replication</strong> and <strong>WAL/binlog</strong> push RPO near zero, <strong>snapshots</strong> are cheap but lossy, <strong>erasure coding</strong> saves space at rebuild cost, and <strong>geo-redundancy</strong> survives a whole region.",
    "The <strong>3-2-1 rule</strong> (3 copies, 2 media, 1 offsite) is the durable-by-default baseline."
  ],
  proTip: "Untested backups are not backups. Actually run the restore and time it: your real RTO is whatever the rehearsal shows, not the number in the runbook.",
  related: ["replication-strategies", "fault-tolerance", "gfs-hdfs", "leader-election", "wal-logging"],
  bridgeOut: "Replication assumed \u201ca new leader is elected automatically\u201d without explaining how. That is the next lesson: leader election."
};
