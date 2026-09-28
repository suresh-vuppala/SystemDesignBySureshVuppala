/* === Lesson replication - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#replication)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["replication"] = {
  module: 10, num: "10.3", title: "Replication",
  connectsFrom: "Splitting data (10.1 and 10.2) solves capacity. Replication copies data for a different reason: surviving the loss of any one machine, and serving reads from more than one place.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "models", label: "Who Accepts Writes", icon: "layers" },
    { key: "acking", label: "Ack & Methods", icon: "swap" },
    { key: "flows", label: "Flows & Consistency", icon: "loop" },
    { key: "failures", label: "Failover & Conflicts", icon: "alert" },
    { key: "realWorld", label: "Real-World & Patterns", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Copying Data for Availability",
      intro: "Replication copies data across nodes to improve <strong>availability</strong> (failover), <strong>read throughput</strong> (followers serve reads), and <strong>durability</strong>. The two big questions are <strong>when</strong> a write is acknowledged (sync, semi-sync, async) and <strong>who</strong> can accept writes (single-leader, multi-leader, leaderless).",
      cards: [
        { icon: "S", title: "Single-Leader", color: "green", body: "One leader takes writes, followers replicate. <strong>Simple, no conflicts</strong>, but a write bottleneck and brief failover downtime when the leader dies." },
        { icon: "M", title: "Multi-Leader", color: "orange", body: "Multiple leaders accept writes and replicate to each other. <strong>Lower per-region write latency</strong>, but conflicts are now possible (LWW, CRDTs, custom resolution)." },
        { icon: "L", title: "Leaderless", color: "purple", body: "Any replica accepts a write, reconciled via quorum (<code>W+R&gt;N</code>). <strong>No single point of failure</strong>, tunable consistency, the most operationally complex model." }
      ],
      callouts: [
        { color: "blue", label: "Partitioning vs replication:", body: "They solve different problems and combine. <strong>Partitioning / sharding</strong> (10.1, 10.4) splits <em>different</em> rows across nodes for capacity. <strong>Replication</strong> copies the <em>same</em> rows for availability and read scaling. Real systems do both: shard for size, replicate each shard for safety." },
        { color: "green", label: "Decision guide:", body: "Need <strong>strong consistency</strong> plus simple ops? \u2192 <strong>Single-Leader</strong>. Need <strong>multi-region low-latency writes</strong>? \u2192 <strong>Multi-Leader</strong>. Need <strong>maximum availability</strong> and no single point of failure? \u2192 <strong>Leaderless</strong>. Most systems start single-leader and evolve as scale demands." }
      ]
    },
    models: {
      heading: "Who Accepts Writes",
      intro: "The write-authority axis: how many nodes may accept a write, and how they are wired together. This decides whether conflicts can even happen.",
      table: {
        headers: ["Aspect", "Single-Leader", "Multi-Leader", "Leaderless"],
        rows: [
          ["<strong>Write path</strong>", "All writes \u2192 1 leader", "Writes \u2192 nearest leader", "Writes \u2192 ALL replicas (W of N)"],
          ["<strong>Read scaling</strong>", "<strong>Followers serve reads</strong>", "<strong>Local leader + followers</strong>", "<strong>Any replica serves reads</strong>"],
          ["<strong>Write scaling</strong>", "Bottleneck at leader", "<strong>Distributed across leaders</strong>", "<strong>No bottleneck (no leader)</strong>"],
          ["<strong>Consistency</strong>", "<strong>Strong</strong> (read from leader)", "Eventual (conflicts possible)", "Tunable (W+R&gt;N = strong)"],
          ["<strong>Conflicts</strong>", "<strong>None</strong> (single writer)", "Yes, LWW, CRDTs, custom", "Yes, version vectors, CRDTs"],
          ["<strong>Failover</strong>", "Election needed (downtime)", "<strong>Other leaders continue</strong>", "<strong>No failover needed</strong>"],
          ["<strong>Complexity</strong>", "<strong>Simple</strong>", "High (conflict resolution)", "Medium (quorum tuning)"],
          ["<strong>Best for</strong>", "Read-heavy, single-region", "Multi-region writes, collab", "High availability, write-heavy"],
          ["<strong>Examples</strong>", "Postgres, MySQL, MongoDB, Redis", "CouchDB, Postgres BDR, Google Docs", "Cassandra, DynamoDB, Riak"]
        ]
      },
      callouts: [
        { color: "blue", label: "Topologies:", body: "<strong>Primary\u2013Replica</strong> (one writer, N read replicas), <strong>Multi-Primary</strong> (several writers replicate to each other), and <strong>Peer-to-Peer</strong> (every node is equal, leaderless). The topology is the physical shape; the direction below is the write rule on top of it." },
        { color: "purple", label: "Write direction:", body: "<strong>Single-Leader</strong> (one node owns writes), <strong>Multi-Leader</strong> (writes accepted in multiple regions, reconciled), <strong>Leaderless</strong> (any replica accepts, quorum reconciles). More writers means more availability but more conflict handling." }
      ]
    },
    acking: {
      heading: "When a Write Is Acknowledged, and How Bytes Move",
      intro: "The durability axis: how long the client waits before a write is considered safe, and the mechanism that ships changes to replicas.",
      table: {
        headers: ["Mode", "Client waits for", "Data loss risk", "Write latency", "Use case"],
        rows: [
          ["<strong>Sync</strong>", "ALL replicas ACK", "<strong>Zero</strong>", "<strong>Highest</strong>", "Banking, payments (Spanner)"],
          ["<strong>Semi-Sync</strong>", "1 replica ACK", "<strong>Near-zero</strong>", "Medium", "E-commerce, orders (MySQL semi-sync)"],
          ["<strong>Async</strong>", "Master only", "<strong>Possible</strong> (lag window)", "<strong>Lowest</strong>", "Social feeds, analytics (Postgres async)"]
        ]
      },
      tables: [
        {
          headers: ["Method", "How It Ships Changes", "Note"],
          rows: [
            ["<strong>Statement-based</strong>", "Replay the SQL statement on each replica", "Compact, but nondeterministic functions (NOW(), RAND()) can diverge"],
            ["<strong>WAL / log-based</strong>", "Stream the write-ahead log records", "Postgres streaming replication; tied to storage format"],
            ["<strong>Physical</strong>", "Ship byte-level page changes", "Exact, but replica must match the engine and version"],
            ["<strong>Logical</strong>", "Stream row-level change events", "Cross-version and cross-engine friendly; powers CDC (8.x)"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Quorum replication (N, W, R):", body: "In leaderless systems, <strong>N</strong> = number of replicas, <strong>W</strong> = replicas that must ack a write, <strong>R</strong> = replicas read from. When <strong>W + R &gt; N</strong>, a read is guaranteed to overlap the latest write, giving strong consistency; lower W or R trades consistency for latency and availability." }
      ]
    },
    flows: {
      heading: "Flows, Lag, and Consistency",
      intro: "Following a read and a write end to end shows where staleness creeps in, and which consistency guarantee closes each gap. The formal models live in Consistency Models (9.2).",
      points: [
        { label: "Write to primary", body: "In single-leader, the write lands on the leader, which appends it to its log and applies it locally, then acknowledges (immediately for async, after replica ack for sync)." },
        { label: "Replicate", body: "The leader ships the change to followers via one of the replication methods. The delay between leader-apply and follower-apply is the replication lag window." },
        { label: "Read from primary vs replica", body: "Reading from the leader is always current but does not scale reads. Reading from a follower scales reads but can return stale data inside the lag window." }
      ],
      callouts: [
        { color: "blue", label: "Replication lag problems and fixes:", body: "<strong>Read-after-write</strong>: a user writes then reads a follower and sees old data; fix by reading own writes from the leader. <strong>Monotonic reads</strong>: reading a fresh follower then a stale one makes time go backward; fix with sticky sessions. <strong>Consistent prefix</strong>: causal order violated across partitions; fix with causal ordering or version vectors." },
        { color: "yellow", label: "Consistency models (see 9.2):", body: "<strong>Strong</strong> (every read sees the latest write), <strong>Eventual</strong> (replicas converge given time), <strong>Causal</strong> (cause-before-effect order preserved), and <strong>Session / read-your-writes</strong> (a client always sees its own writes). Replication mode and read routing together decide which one you actually get." }
      ]
    },
    failures: {
      heading: "Failover, Split-Brain, and Conflicts",
      intro: "Replication exists for failures, so how it behaves when a node or the network dies is the whole point.",
      points: [
        { label: "Primary failure", body: "Writes stop until a new leader is chosen. This is the failover window, and its length is your write-downtime budget." },
        { label: "Replica failure", body: "Drop the replica from the read pool; it catches up from the log when it returns. Reads lose a little capacity but writes are unaffected." },
        { label: "Network failure (partition)", body: "Nodes cannot tell a dead peer from an unreachable one. If both sides keep accepting writes, you get split-brain." }
      ],
      callouts: [
        { color: "blue", label: "Failover:", body: "<strong>Manual</strong> (an operator promotes a replica, safe but slow), <strong>Automatic</strong> (a monitor promotes on a missed heartbeat, fast but risks false positives), and <strong>Leader election</strong> (peers vote via a consensus protocol; see Leader Election, 11.7)." },
        { color: "yellow", label: "Split-brain:", body: "A network partition leaves two nodes each believing they are primary, so both accept conflicting writes. Fenced with a <strong>quorum requirement</strong> (a minority side steps down) or fencing tokens / STONITH so only one node can write." },
        { color: "green", label: "Conflict resolution:", body: "When multiple writers diverge: <strong>Last-Write-Wins</strong> (simple, silently drops a write), <strong>versioning</strong> (version vectors keep all versions to merge), <strong>timestamps</strong> (needs synced clocks, see 11.9), and <strong>application-level merge</strong> (CRDTs or custom logic). Deep dive in Conflict Resolution." }
      ]
    },
    realWorld: {
      heading: "Real Systems and Design Patterns",
      points: [
        { label: "Single-Leader", body: "Postgres, MySQL, MongoDB, Redis. Read-heavy, single-region workloads: followers serve reads, one leader owns writes." },
        { label: "Multi-Leader", body: "CouchDB, Postgres BDR, MySQL Group Replication, Google Docs style collaboration. Multi-region writes at the cost of conflict resolution." },
        { label: "Leaderless", body: "Cassandra, DynamoDB, Riak. Any replica takes writes, quorum reconciles; <code>W+R&gt;N</code> tunes strong versus eventual consistency per operation." },
        { label: "Conflict avoidance", body: "Beyond resolving conflicts, multi-leader systems avoid them: sticky routing, partition by region, and append-only schema design." }
      ],
      callouts: [
        { color: "blue", label: "Design patterns:", body: "<strong>Read-heavy system</strong>: single leader plus many read replicas, read own writes from the leader. <strong>Multi-region system</strong>: multi-leader or leaderless with per-region writes (see 5.7). <strong>Highly available database</strong>: leaderless quorum, or single-leader with fast automatic failover." },
        { color: "green", label: "Backup vs replication (not the same thing):", body: "Replication protects against a lost <em>node</em> but faithfully copies a bad <code>DELETE</code> to every replica instantly. Backups are point-in-time snapshots that let you recover from corruption or human error. You need both. Also combine replication with sharding (10.4, 11.11): shard for capacity, replicate each shard for availability." }
      ]
    },
    tradeoffs: {
      heading: "What Each Model Costs",
      intro: "There is no free replication: you pay in latency, conflicts, or operational complexity.",
      points: [
        { label: "Sync trades latency for durability", body: "Waiting for all replicas to ACK gives zero data loss but the highest write latency. Async is the opposite: lowest latency, but a leader crash can lose unreplicated writes." },
        { label: "Single-leader has a write bottleneck", body: "All writes funnel through one node, and failover requires an election, which means brief downtime while a follower is promoted." },
        { label: "Multi-leader introduces conflicts", body: "Two leaders can accept conflicting writes to the same key; you must resolve them (last-write-wins, CRDTs, custom) or avoid them by design." },
        { label: "Leaderless is the most complex", body: "No single point of failure and tunable consistency, but quorum tuning, read repair, and hinted handoff make it the hardest to operate." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Postgres with streaming replication, or a ready-made Compose file).",
      setup: "Local and free: 1 Postgres primary + 1 streaming replica via Docker Compose.",
      simulate: "Write a row on the primary and immediately try to read it from the replica in a tight loop, measuring the delay until it appears (replication lag, even locally, is rarely exactly 0). Then stop the primary container and manually promote the replica (<code>pg_ctl promote</code>) and confirm it now accepts writes.",
      observe: "A real, measured replication lag window where the replica briefly disagrees with the primary: the async trade-off quantified instead of asserted. Then time how long the promotion takes: that is your real failover downtime for a single-leader setup.",
      stretch: "Configure synchronous replication (<code>synchronous_commit=on</code>, <code>synchronous_standby_names</code>) and repeat the write. Confirm the write now blocks until the replica acknowledges, trading latency for the stronger durability guarantee."
    }
  },
  keyTakeaways: [
    "Replication answers two questions: <strong>when</strong> to acknowledge a write (sync, semi-sync, async) and <strong>who</strong> may accept writes (single-leader, multi-leader, leaderless).",
    "Async replication is fast but has a lag window that can lose recent writes on a leader crash; sync has zero loss but the highest latency.",
    "Single-leader is simple with no conflicts, multi-leader enables multi-region writes at the cost of conflicts, and leaderless removes the single point of failure but is the hardest to operate.",
    "Replication is not backup: it copies bad writes instantly, so pair it with point-in-time backups, and combine it with sharding (replicate each shard) for capacity plus availability."
  ],
  proTip: "Before choosing a model, name the failure you are buying protection against. If it is a lost write, lean sync; if it is a slow region, lean multi-leader; if it is a dead node with no downtime allowed, lean leaderless quorum.",
  related: ["sharding", "partitioning", "consistent-hashing", "replication-strategies", "cap", "conflict-resolution", "consensus", "consistency-models", "scaling-choice", "multi-region", "distributed-indexing", "leader-election"],
  bridgeOut: "Replication copies the same data many times. The next move splits the database itself across machines, not just copies it. That is sharding."
};
