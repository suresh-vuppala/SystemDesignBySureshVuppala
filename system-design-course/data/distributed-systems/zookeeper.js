/* === Lesson zookeeper - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#zookeeper)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["zookeeper"] = {
  module: 11, num: "11.2", title: "ZooKeeper",
  connectsFrom: "The patterns catalog named \u201cquorum\u201d and \u201clease\u201d abstractly. ZooKeeper is a concrete, widely deployed system built almost entirely from those two ideas, and it is what half the big-data stack leans on for coordination.",
  tabs: {
    overview: {
      heading: "Distributed Coordination",
      intro: "ZooKeeper provides <strong>distributed coordination</strong>: leader election, distributed locks, configuration, and service discovery, all backed by the <strong>ZAB</strong> consensus protocol. Clients read and write a tree of small nodes (znodes) with strong ordering guarantees.",
      cards: [
        { icon: "E", title: "Ephemeral Nodes", color: "purple", body: "A znode that <strong>auto-deletes</strong> the instant its creating session ends. This is the mechanism behind \u201cwho is the current leader,\u201d with zero cleanup code." },
        { icon: "W", title: "Watches", color: "blue", body: "<strong>One-time triggers</strong> on a znode\u2019s change. A client is notified the moment a node is created, updated, or deleted, no polling." },
        { icon: "L", title: "Linearizable Writes", color: "green", body: "All writes go through the leader and are totally ordered, so every client agrees on what happened and in what order." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Linearizable writes</strong>. <strong>Sequential consistency</strong> for reads. <strong>Ephemeral nodes</strong> auto-delete on session end. <strong>Watches</strong>, one-time triggers on znode changes." }
      ]
    },
    realWorld: {
      heading: "Where ZooKeeper Runs",
      points: [
        { label: "Kafka (pre-KRaft)", body: "For years Kafka stored broker metadata and controller election in ZooKeeper. KRaft (Kafka 3.3+) finally removed that dependency." },
        { label: "HBase and Hadoop YARN", body: "Both use ZooKeeper for master election and cluster coordination, the classic big-data control plane." },
        { label: "Alternatives", body: "<strong>etcd</strong> (Raft-based, powers the Kubernetes control plane) and <strong>Consul</strong> (Raft-based, service mesh) solve the same problem with a newer protocol." }
      ]
    },
    handsOn: {
      goal: "Use a ZooKeeper ephemeral node plus a watch to build a self-cleaning leader marker, then prove exactly one client can win an election.",
      stack: "ZooKeeper via its official Docker image, driven with the bundled <code>zkCli.sh</code>. Local and free.",
      steps: [
        {
          title: "Start a single-node ZooKeeper",
          code: "docker run -d --name zk -p 2181:2181 zookeeper",
          lang: "bash"
        },
        {
          title: "Open a client session",
          body: "This drops you into the ZooKeeper shell connected to the running server.",
          code: "docker exec -it zk zkCli.sh -server localhost:2181",
          lang: "bash"
        },
        {
          title: "Create an ephemeral leader node",
          body: "The <code>-e</code> flag ties this node's lifetime to your session: when the session ends, ZooKeeper deletes the node automatically.",
          code: "create -e /leader \"worker-1\"\nget /leader",
          lang: "bash"
        },
        {
          title: "Watch the node from a second session",
          body: "In a second terminal, open another client and register a one-time watch on the same node.",
          code: "docker exec -it zk zkCli.sh -server localhost:2181\nget -w /leader",
          lang: "bash"
        },
        {
          title: "Kill the first session",
          body: "Back in the first shell, quit to simulate that worker crashing. The watch in the second session fires the moment the ephemeral node disappears.",
          code: "quit",
          lang: "bash"
        }
      ],
      observe: "The ephemeral node vanishes the instant its owning session ends, and the second session's watch fires immediately with a <code>NodeDeleted</code> event, with zero manual cleanup and zero polling. That is the exact mechanism real systems use for \"who is the current leader,\" made concrete instead of described.",
      stretch: "Have 3 clients race to <code>create /leader-election</code> (a normal, non-ephemeral node) at once. Confirm exactly one succeeds and the other two get <code>NodeExists</code> errors: a minimal leader-election primitive built from ZooKeeper's atomic create."
    }
  },
  keyTakeaways: [
    "ZooKeeper is a <strong>coordination service</strong>, not a database: leader election, locks, config, and service discovery, backed by the ZAB consensus protocol.",
    "<strong>Ephemeral nodes</strong> plus <strong>watches</strong> are the core primitives: a node that disappears when its session dies, and a trigger that fires the instant it does, together they implement leader election with almost no code.",
    "It guarantees linearizable writes and sequential-consistency reads; etcd (Raft) and Consul are the modern alternatives."
  ],
  proTip: "Never build a naive lock by writing your name to a key and checking it back. Use an ephemeral node so a crashed client\u2019s lock releases itself; a lock that outlives its owner is how distributed systems deadlock.",
  related: ["leader-election", "consensus-protocols", "dist-patterns", "distributed-locks", "gfs-hdfs", "bigtable", "failure-detection"],
  bridgeOut: "ZooKeeper coordinates metadata. GFS and HDFS are the foundational systems that actually store the bulk data those coordinators point at."
};
