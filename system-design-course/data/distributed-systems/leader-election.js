/* === Lesson leader-election - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#leader-election)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["leader-election"] = {
  module: 11, num: "11.7", title: "Leader Election for Auto-Recovery",
  connectsFrom: "The leader in a leader-follower topology dies. Someone has to become the new leader automatically, without a human paging anyone, and exactly one: never zero, never two. That last constraint is the whole hard part.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "algorithms", label: "Algorithms", icon: "hex" },
    { key: "raftPaxos", label: "Raft vs Paxos", icon: "scale" },
    { key: "realWorld", label: "Real-World", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Electing a New Leader Automatically",
      intro: "When the leader dies, the cluster must <strong>elect a new one on its own</strong>. The winning algorithms all lean on the same trick: a candidate must win a <strong>majority quorum</strong>, which is mathematically impossible for two candidates to do at once, so split brain is prevented by construction.",
      cards: [
        { icon: "R", title: "Raft", color: "green", body: "Candidates <strong>request votes on a timeout</strong>; a majority wins. Designed to be understandable. Powers etcd, CockroachDB, Consul, TiKV." },
        { icon: "Q", title: "Majority Quorum", color: "purple", body: "A leader needs <strong>N/2+1</strong> votes. Two candidates cannot both hold a majority of the same cluster, so <strong>at most one leader</strong> ever wins." },
        { icon: "H", title: "Heartbeat Timeout", color: "blue", body: "Followers start an election only after a missed heartbeat (typically <strong>150-300ms</strong>), which is what bounds failover to a few seconds." }
      ],
      callouts: [
        { color: "blue", label: "Auto-recovery flow:", body: "Leader dies \u2192 followers detect the missing heartbeat (timeout 150-300ms) \u2192 election starts \u2192 new leader wins a majority quorum \u2192 takes over writes \u2192 clients redirected. <strong>Total downtime: 1-5 seconds</strong>, no human needed. <strong>Split-brain prevention</strong>: a majority (N/2+1) can only be held by one node." }
      ]
    },
    algorithms: {
      heading: "Election Algorithms",
      intro: "Four algorithms you will meet in practice. Raft is the modern default; the others are worth recognizing by name and knowing where they run.",
      table: {
        headers: ["Algorithm", "How It Works", "Used By"],
        rows: [
          ["<strong>Raft</strong>", "Followers time out \u2192 become candidate \u2192 request votes from a majority \u2192 win = new leader \u2192 send heartbeats. Understandable by design.", "etcd, CockroachDB, Consul, TiKV"],
          ["<strong>ZAB</strong>", "ZooKeeper Atomic Broadcast. Leader proposes, followers ACK. On failure, a new leader is elected from the most up-to-date follower.", "ZooKeeper, Kafka (pre-KRaft)"],
          ["<strong>KRaft</strong>", "Kafka\u2019s built-in Raft (replaces ZooKeeper). A controller quorum elects the active controller. Simpler ops.", "Kafka 3.3+"],
          ["<strong>Bully</strong>", "Highest-ID node simply wins. Simple but not partition-tolerant. Rarely used in production now.", "Legacy systems"]
        ]
      },
      callouts: [
        { color: "purple", label: "Raft AppendEntries mechanics:", body: "The leader tracks <code>nextIndex[]</code> and <code>matchIndex[]</code> per follower and sends <code>AppendEntries(term, leaderId, prevLogIndex, prevLogTerm, entries[], leaderCommit)</code>. A follower rejects if <code>prevLogIndex/prevLogTerm</code> don\u2019t match, so the leader decrements <code>nextIndex</code> and retries until the logs align." }
      ]
    },
    raftPaxos: {
      heading: "Raft vs Paxos, and the Split-Brain Guarantee",
      intro: "The two families differ mostly in how they handle leader failure, log gaps, and membership changes. Raft traded some flexibility for something Paxos never had: being understandable.",
      table: {
        headers: ["Aspect", "Raft", "Paxos (Classic)"],
        rows: [
          ["<strong>Design Goal</strong>", "<strong>Understandability</strong>, decomposed into sub-problems", "Correctness proof first, hard to implement"],
          ["<strong>Leader</strong>", "Strong leader required; all writes go through leader", "No inherent leader (Multi-Paxos adds one)"],
          ["<strong>Log</strong>", "Contiguous log, no gaps allowed", "Gaps possible, out-of-order commits"],
          ["<strong>Membership Change</strong>", "Joint consensus (built-in)", "Not specified in original paper"],
          ["<strong>Implementation</strong>", "~2000 lines (etcd/raft)", "Notoriously difficult to implement correctly"],
          ["<strong>Liveness</strong>", "Guaranteed with leader (leader liveness assumed)", "Can livelock with competing proposers"],
          ["<strong>Performance</strong>", "1 RTT for committed writes (leader \u2192 followers)", "2 RTTs (Prepare + Accept) unless Multi-Paxos"],
          ["<strong>Used By</strong>", "etcd, CockroachDB, Consul, TiKV, RethinkDB", "Chubby, Spanner, Megastore"]
        ]
      },
      points: [
        { label: "Raft favors understandability", body: "A strong leader, a contiguous gap-free log, and built-in membership change (joint consensus). Roughly 2000 lines in etcd/raft. This is why almost every new system picks it." },
        { label: "Paxos favors flexibility", body: "No inherent leader (Multi-Paxos adds one), log gaps and out-of-order commits allowed. Correct but notoriously hard to implement; used by Chubby, Spanner, Megastore." },
        { label: "Bully is the cautionary tale", body: "\u201cHighest ID wins\u201d is trivial to implement but not partition-tolerant: a network split can produce two \u201chighest\u201d nodes and two leaders. Quorum-based algorithms exist precisely to avoid this." }
      ]
    },
    realWorld: {
      heading: "Failover in Production",
      points: [
        { label: "etcd", body: "The Kubernetes control plane. Raft over a 5-node cluster, leader election in about 1 second." },
        { label: "Kafka KRaft", body: "A controller quorum elects the active controller, removing the old ZooKeeper dependency entirely." },
        { label: "Redis Sentinel", body: "Monitors the master and promotes a replica on failure. Simpler than full consensus, not quorum-safe in every partition." },
        { label: "Postgres + Patroni", body: "Patroni uses etcd as the source of truth to drive automated Postgres failover." }
      ]
    },
    handsOn: {
      goal: "Kill an etcd leader and measure how fast a new one is elected, confirming split brain never happens.",
      stack: "A 3-node etcd cluster in Docker, driven with <code>etcdctl</code>. Local and free.",
      steps: [
        {
          title: "Start a 3-node etcd cluster",
          body: "All three nodes share one Docker network and one initial cluster definition, so they form a single Raft group.",
          code: "docker network create etcd-net\nfor i in 1 2 3; do\n  docker run -d --name etcd$i --network etcd-net quay.io/coreos/etcd:v3.5.15 \\\n    /usr/local/bin/etcd --name etcd$i \\\n    --initial-advertise-peer-urls http://etcd$i:2380 \\\n    --listen-peer-urls http://0.0.0.0:2380 \\\n    --listen-client-urls http://0.0.0.0:2379 \\\n    --advertise-client-urls http://etcd$i:2379 \\\n    --initial-cluster etcd1=http://etcd1:2380,etcd2=http://etcd2:2380,etcd3=http://etcd3:2380 \\\n    --initial-cluster-state new --initial-cluster-token tkn\ndone",
          lang: "bash"
        },
        {
          title: "Find the current leader",
          body: "The IS LEADER column marks exactly one node true.",
          code: "docker exec etcd1 etcdctl endpoint status --cluster -w table",
          lang: "bash"
        },
        {
          title: "Kill the leader and watch re-election",
          body: "Destroy whichever node was leader (etcd1 here), then re-check status from a survivor and time how long until a new leader appears.",
          code: "docker rm -f etcd1\ndocker exec etcd2 etcdctl endpoint status --cluster -w table",
          lang: "bash"
        },
        {
          title: "Confirm writes resume",
          code: "docker exec etcd2 etcdctl put foo bar\ndocker exec etcd2 etcdctl get foo",
          lang: "bash"
        }
      ],
      observe: "Failover lands in the same rough 1-5 second range from the Overview, and at no point do 2 nodes both report IS LEADER true, no matter how many times you repeat the kill. Writes resume as soon as the new leader wins its majority.",
      stretch: "Try to force split brain by partitioning the cluster so no side holds a majority (for example 2 vs 2 with 1 node unreachable by both, on a 5-node cluster). Confirm neither side can elect a leader: the majority-quorum guarantee tested at its exact boundary."
    }
  },
  keyTakeaways: [
    "Leader election must produce <strong>exactly one</strong> leader automatically; the universal trick is requiring a <strong>majority quorum</strong>, which two candidates can never both hold.",
    "<strong>Raft</strong> dominates modern systems (etcd, CockroachDB, Consul, KRaft) because it is understandable; ZAB powers ZooKeeper, and Bully is a legacy, partition-unsafe design.",
    "A missed heartbeat (150-300ms) triggers an election that typically completes in <strong>1-5 seconds</strong> with zero human involvement."
  ],
  proTip: "If a system claims automatic failover, ask how it prevents two leaders under a network partition. If the answer isn\u2019t \u201cmajority quorum,\u201d assume split brain is possible and plan for it.",
  related: ["consensus-protocols", "zookeeper", "failure-detection", "replication-strategies", "data-redundancy", "dist-patterns", "fault-tolerance", "replication"],
  bridgeOut: "The specific algorithms named here (Raft\u2019s vote, Paxos\u2019s phases) get a full mechanical walkthrough next: consensus protocols."
};
