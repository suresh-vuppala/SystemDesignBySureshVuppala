/* === Lesson redis-cluster - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-cluster)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-cluster"] = {
  module: 7, num: "7.9", title: "Redis Deployment Modes",
  connectsFrom: "From a single laptop-dev instance up to a globally sharded production cluster: four modes forming a real progression as load and criticality grow.",
  tabs: {
    overview: {
      heading: "Single Node to Sharded Cluster",
      intro: "Four modes: <strong>Single Node</strong> (dev), <strong>Sentinel</strong> (HA, no sharding), <strong>Cluster</strong> (sharded across masters), and <strong>Managed</strong> (ElastiCache/MemoryDB/Upstash). Cluster distributes keys across 16,384 hash slots and routes clients with MOVED/ASK redirects.",
      cards: [
        { icon: "#", title: "16,384 hash slots", color: "purple", body: "Keys map via <code>CRC16(key) % 16384</code> to a slot, and each slot lives on a master. Rebalancing migrates slots between nodes." },
        { icon: "{", title: "Hash tags", color: "blue", body: "<code>{user:123}.profile</code> forces related keys onto the same slot, enabling multi-key operations that would otherwise span slots." },
        { icon: "G", title: "Gossip + redirects", color: "green", body: "Nodes discover each other and detect failures via a gossip protocol; clients get <code>MOVED</code>/<code>ASK</code> when a key has migrated." }
      ],
      table: {
        headers: ["Mode", "Architecture", "Sharding", "HA", "Use Case"],
        rows: [
          ["<strong>Single Node</strong>", "One instance", "No", "No (SPOF)", "Dev, small cache, non-critical"],
          ["<strong>Sentinel</strong>", "Master + replicas + sentinel monitors", "No", "Yes (auto-failover)", "HA cache, sessions, moderate load"],
          ["<strong>Cluster</strong>", "N masters (16,384 hash slots) + replicas", "Yes", "Yes", "Large datasets, high throughput, horizontal scale"],
          ["<strong>Managed</strong>", "ElastiCache / MemoryDB / Upstash", "Yes", "Yes", "Production, no ops overhead"]
        ]
      },
      callouts: [
        { color: "green", label: "Cluster details:", body: "<strong>16,384 hash slots</strong> distributed across masters. Key \u2192 CRC16(key) % 16384 \u2192 slot \u2192 node. Each master has 1+ replicas. <strong>Gossip protocol</strong> for node discovery. <strong>MOVED/ASK</strong> redirects for routing. Multi-key ops only within one slot (use hash tags: <code>{user:123}.profile</code>)." },
        { color: "red", label: "Limitations:", body: "<strong>RAM-bound</strong>, all data must fit in memory. <strong>Single-threaded core</strong>, one slow command blocks everything. <strong>Not a primary DB</strong>, use as a cache/accelerator. <strong>Async replication</strong>, data loss possible on failover (use WAIT for sync)." },
        { color: "blue", label: "Real-world:", body: "<strong>Twitter</strong> timeline cache (Redis Cluster). <strong>GitHub</strong> job queues (Resque/Sidekiq). <strong>Snapchat</strong> rate limiting. <strong>Pinterest</strong> graph storage (billions of edges). <strong>Discord</strong> presence and message cache." }
      ]
    },
    tradeoffs: {
      heading: "Choosing a Mode",
      points: [
        { label: "Single Node", body: "Simplest, but a single point of failure. Fine for dev and non-critical caches, never for production data you cannot lose." },
        { label: "Sentinel vs Cluster", body: "Sentinel adds automatic failover without sharding, ideal when one node holds all your data but you need HA. Cluster adds sharding when the dataset or throughput outgrows a single node." },
        { label: "Managed", body: "ElastiCache, MemoryDB, or Upstash remove the operational burden of running Sentinel or Cluster yourself, the usual production default when you would rather not operate Redis." }
      ]
    },
    handsOn: {
      prerequisites: "Docker Compose; `redis-cli`.",
      setup: "Local and free: a 6-node Redis Cluster via `docker-compose` (3 primaries + 3 replicas is the standard minimal topology; use `redis-cli --cluster create` once the 6 containers are up).",
      simulate: "Connect with `redis-cli -c` (cluster mode) and set keys with and without hash tags: `SET user:123:name Alice` and `SET user:123:email a@x.com` (may land on different slots) vs `SET {user:123}:name Alice` and `SET {user:123}:email a@x.com` (forced onto the same slot). Try an `MGET` across both pairs.",
      observe: "The non-tagged keys potentially triggering a `MOVED` redirect or a cross-slot error on a multi-key operation, while the tagged pair always succeeds, the hash-tag mechanism working exactly as described.",
      stretch: "Kill one primary node and watch `redis-cli --cluster check` report a failover to its replica, then confirm keys in that node's slot range are still reachable through the cluster (redirected automatically) with no client-side reconfiguration needed."
    }
  },
  keyTakeaways: [
    "Four modes form a progression: Single Node (dev), Sentinel (HA), Cluster (sharding), Managed (no ops), chosen by load and criticality.",
    "Cluster distributes keys across 16,384 hash slots via CRC16(key) % 16384, with gossip for discovery and MOVED/ASK for client routing.",
    "Hash tags force related keys onto the same slot so multi-key operations work; without them, cross-slot ops fail."
  ],
  proTip: "When you need multi-key operations in Cluster mode, wrap the shared portion of the key in braces (`{user:123}`) so related keys hash to the same slot. Otherwise the operation errors across slots.",
  related: ["redis-ha", "redis", "sharding", "redis-locks"],
  bridgeOut: "This sharding is conceptually the same problem the Scalability module's Sharding lesson solves generically. Next: what breaks when you use Redis for distributed locks."
};
