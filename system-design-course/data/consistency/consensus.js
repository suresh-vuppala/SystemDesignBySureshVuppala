/* === Lesson consensus - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#consensus)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["consensus"] = {
  module: 9, num: "9.3", title: "Consensus Algorithms",
  connectsFrom: "\u201cStrong consistency\u201d in the last lesson quietly assumed nodes can agree on a single value despite some of them crashing or being slow. Proving that agreement is even possible under those conditions is a genuinely hard problem, and consensus algorithms are the answer.",
  tabs: {
    overview: {
      heading: "Agreeing on One Value Despite Failures",
      intro: "Consensus lets a cluster <strong>agree on a single value</strong> even when nodes crash or messages are delayed. A quorum-based protocol survives <strong>f failures with 2f+1 nodes</strong>. <strong>Raft</strong> is leader-based and designed for understandability; <strong>Paxos</strong> is the theoretically foundational original that is notoriously hard to implement correctly.",
      cards: [
        { icon: "R", title: "Raft", color: "green", body: "Strong leader plus a contiguous append-only log, designed for clarity. All writes go through the leader; a majority ACK commits. <strong>etcd, Consul, CockroachDB, TiKV</strong>." },
        { icon: "P", title: "Paxos", color: "purple", body: "No mandatory leader (Multi-Paxos adds one), mathematically proven, and famously hard to get right. <strong>Google Chubby, Spanner, Megastore</strong>." },
        { icon: "B", title: "PBFT", color: "red", body: "Byzantine fault tolerant: assumes nodes can be actively malicious, needs <strong>3f+1</strong> nodes and 3 round trips. Used in blockchain and Hyperledger." }
      ],
      table: {
        headers: ["Algorithm", "Mechanism", "Fault Model", "Performance", "Used By"],
        rows: [
          ["<strong>Raft</strong>", "Leader election \u2192 log replication \u2192 safety", "Crash (2f+1 nodes)", "1 RTT for committed write", "etcd, CockroachDB, Consul, TiKV"],
          ["<strong>Multi-Paxos</strong>", "Proposer \u2192 Acceptors (prepare/accept). Majority quorum.", "Crash (2f+1 nodes)", "1-2 RTT (optimized)", "Google Chubby, Spanner, Megastore"],
          ["<strong>ZAB</strong>", "ZooKeeper Atomic Broadcast. Leader-based total order.", "Crash (2f+1 nodes)", "1 RTT (leader stable)", "ZooKeeper, Kafka (controller)"],
          ["<strong>EPaxos</strong>", "Leaderless Paxos. Any node can propose.", "Crash (2f+1 nodes)", "1 RTT (no conflicts)", "Research, CockroachDB (partial)"],
          ["<strong>PBFT</strong>", "Pre-prepare \u2192 Prepare \u2192 Commit. Tolerates malicious nodes.", "Byzantine (3f+1)", "3 RTT (expensive)", "Blockchain, Hyperledger"],
          ["<strong>Viewstamped Rep.</strong>", "Similar to Raft, predates it. View changes on leader failure.", "Crash (2f+1 nodes)", "1 RTT", "Academic, influenced Raft"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Safety</strong>: all nodes agree on the same value, never disagree. <strong>Liveness</strong>: eventually makes progress, given a stable leader. Survives <strong>f failures with 2f+1 nodes</strong> (2 failures with 5 nodes). <strong>FLP impossibility</strong>: no deterministic consensus in an async system with even 1 crash, so practical systems use timeouts to work around it." },
        { color: "yellow", label: "When you need consensus:", body: "<strong>Leader election</strong> (who is the primary?), <strong>distributed locks</strong> (mutual exclusion), <strong>atomic broadcast</strong> (total message order), <strong>state machine replication</strong> (replicated log \u2192 same state), and <strong>configuration management</strong> (cluster membership)." }
      ]
    },
    realWorld: {
      heading: "Consensus in Production",
      intro: "Consensus is the quiet backbone under cluster coordination, and the same handful of systems appear everywhere.",
      points: [
        { label: "etcd", body: "Raft, the backbone of Kubernetes: it stores all cluster state." },
        { label: "Google Spanner", body: "Paxos per shard, giving global consistency across data centers." },
        { label: "CockroachDB", body: "Raft per range (64MB chunks), so each slice of the keyspace has its own consensus group." },
        { label: "Kafka KRaft", body: "A Raft-based controller replacing ZooKeeper from Kafka 3.3+, removing an entire external dependency." }
      ]
    },
    tradeoffs: {
      heading: "Raft vs Paxos, and What Not to Do",
      intro: "The two foundational protocols trade clarity against flexibility, and consensus itself is easy to misuse.",
      points: [
        { label: "Raft, preferred for new systems", body: "Understandable by design, with a strong leader and an ordered append-only log. Trade-off: the leader is a write-throughput bottleneck." },
        { label: "Paxos, the theoretical foundation", body: "No mandatory leader and proven-correct safety, but notoriously hard to implement, with subtle bugs. Variants include Basic, Multi, Fast, and EPaxos." },
        { label: "Anti-patterns", body: "Using consensus for every write is too slow for high-throughput data. Even cluster sizes do not improve fault tolerance, so use 3, 5, or 7. Cross-region consensus lets RTT kill performance. Ignoring split-brain: always use fencing tokens." }
      ]
    },
    handsOn: {
      goal: "Watch Raft elect a new leader after you kill the current one on a 5-node etcd cluster, then hit the 2f+1 fault limit by killing a majority.",
      stack: "A 5-node etcd cluster in Docker on one network, driven with <code>etcdctl</code>. Local and free.",
      steps: [
        {
          title: "Start a 5-node etcd cluster",
          body: "5 nodes tolerate f = 2 failures, since 2f+1 = 5.",
          code: "docker network create raftnet\nCLUSTER=\"e1=http://e1:2380,e2=http://e2:2380,e3=http://e3:2380,e4=http://e4:2380,e5=http://e5:2380\"\nfor n in e1 e2 e3 e4 e5; do\n  docker run -d --name $n --network raftnet quay.io/coreos/etcd:v3.5.9 etcd --name $n --advertise-client-urls http://$n:2379 --listen-client-urls http://0.0.0.0:2379 --initial-advertise-peer-urls http://$n:2380 --listen-peer-urls http://0.0.0.0:2380 --initial-cluster \"$CLUSTER\" --initial-cluster-state new --initial-cluster-token raft\ndone",
          lang: "bash"
        },
        {
          title: "Write a key and find the current leader",
          body: "The status table has an IS LEADER column: exactly one node shows true.",
          code: "docker exec e1 etcdctl put color blue\nEP=e1:2379,e2:2379,e3:2379,e4:2379,e5:2379\ndocker exec e1 etcdctl --endpoints=$EP endpoint status --write-out=table",
          lang: "bash"
        },
        {
          title: "Kill the leader and write through a follower",
          body: "Replace e3 below with whichever node showed IS LEADER = true. The write may hang for a moment while Raft elects a replacement, then succeeds.",
          code: "docker stop e3\ndocker exec e1 etcdctl --command-timeout=5s put color green\ndocker exec e1 etcdctl --endpoints=$EP endpoint status --write-out=table",
          lang: "bash"
        }
      ],
      observe: "Right after the leader dies the write briefly stalls, then a follower wins the election and the write commits; the second status table shows a different node with IS LEADER = true. You just watched Raft survive one failure inside its f = 2 budget.",
      stretch: "Stop a third node so only 2 of 5 remain (<code>docker stop e2 e1</code>). The surviving 2 are a minority, cannot form a quorum, and every write now fails: the f-failures-with-2f+1-nodes formula hit exactly at its limit (5 nodes tolerate 2 failures, not 3)."
    }
  },
  keyTakeaways: [
    "Consensus lets a cluster agree on one value despite crashes, surviving <strong>f failures with 2f+1 nodes</strong> and guaranteeing safety (never disagree) plus liveness (eventually progress).",
    "<strong>Raft</strong> wins on understandability with a strong leader and ordered log; <strong>Paxos</strong> is the proven foundation but hard to implement; <strong>PBFT</strong> handles malicious nodes at 3f+1 and 3 round trips.",
    "Use consensus for coordination (leader election, locks, membership, atomic broadcast), not for every high-throughput write, and never on even-sized or cross-region clusters without care."
  ],
  proTip: "Reach for consensus only for low-volume coordination decisions, not the hot data path; put the replicated log behind the leader and keep bulk writes off the consensus group.",
  related: ["cap", "consistency-models", "transactions", "clock-sync", "replication"],
  bridgeOut: "This is the theory. Distributed Systems' Leader Election (11.7) and Consensus Protocols (11.8) walk these same algorithms step-by-step with full RPC-level mechanics."
};
