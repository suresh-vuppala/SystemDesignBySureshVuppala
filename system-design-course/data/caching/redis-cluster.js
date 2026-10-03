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
      goal: "Stand up a 6-node Redis Cluster and see hash tags force related keys onto one slot so multi-key operations survive sharding.",
      stack: "A local 6-node cluster (3 primaries + 3 replicas) in Docker, driven from <code>redis-cli -c</code>. Local and free.",
      steps: [
        {
          title: "Launch a 6-node cluster locally",
          body: "This image boots 3 primaries and 3 replicas on ports 7000-7005 and runs <code>redis-cli --cluster create</code> for you.",
          code: "docker run -d --name redis-cluster -p 7000-7005:7000-7005 -e IP=0.0.0.0 grokzen/redis-cluster:latest\nsleep 15",
          lang: "bash"
        },
        {
          title: "Confirm the topology",
          body: "You should see 3 masters, each owning a slice of the 16,384 hash slots.",
          code: "docker exec redis-cluster redis-cli -p 7000 cluster info\ndocker exec redis-cluster redis-cli -p 7000 cluster nodes",
          lang: "bash"
        },
        {
          title: "Set untagged keys and watch them scatter",
          body: "In cluster mode (<code>-c</code>) the client follows <code>MOVED</code> redirects. These two keys may hash to different slots.",
          code: "docker exec -it redis-cluster redis-cli -c -p 7000 SET user:123:name Alice\ndocker exec -it redis-cluster redis-cli -c -p 7000 SET user:123:email a@x.com\ndocker exec -it redis-cluster redis-cli -c -p 7000 MGET user:123:name user:123:email",
          lang: "bash"
        },
        {
          title: "Force related keys onto one slot with a hash tag",
          body: "The <code>{user:123}</code> braces mean only that substring is hashed, so both keys share a slot and cross-key ops work.",
          code: "docker exec -it redis-cluster redis-cli -c -p 7000 SET '{user:123}:name' Alice\ndocker exec -it redis-cluster redis-cli -c -p 7000 SET '{user:123}:email' a@x.com\ndocker exec -it redis-cluster redis-cli -c -p 7000 MGET '{user:123}:name' '{user:123}:email'",
          lang: "bash"
        }
      ],
      observe: "The untagged <code>MGET</code> can fail with <code>CROSSSLOT Keys ... must hash to the same slot</code> (or trigger a <code>MOVED</code> hop), while the tagged pair always lands on one slot and returns both values: the hash-tag mechanism working exactly as described.",
      stretch: "Kill one primary (<code>redis-cli -p 7000 shutdown nosave</code> for the right port) and watch <code>redis-cli --cluster check 127.0.0.1:7000</code> report a failover to its replica, then confirm keys in that slot range are still reachable through the cluster with no client-side reconfiguration."
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
