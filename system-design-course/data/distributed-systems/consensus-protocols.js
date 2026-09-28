/* === Lesson consensus-protocols - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#consensus)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["consensus-protocols"] = {
  module: 11, num: "11.8", title: "Consensus Protocols",
  connectsFrom: "Leader election introduced Raft and Paxos conceptually. This is the full mechanical walkthrough: how nodes actually agree on a single value, why that is provably hard, and how every practical protocol works around the hardness.",
  tabs: {
    overview: {
      heading: "Agreement Among Distributed Nodes",
      intro: "Consensus is the <strong>hardest problem</strong> in distributed systems: getting nodes to agree on one value despite crashes and delays. <strong>FLP impossibility</strong> proves no deterministic protocol can guarantee agreement in a fully asynchronous system where even one node may crash, so every real protocol works around it with timeouts and leader election.",
      cards: [
        { icon: "F", title: "FLP Impossibility", color: "red", body: "No deterministic consensus can be guaranteed in a fully async system with even <strong>one</strong> possible crash. Protocols don\u2019t defeat this; they sidestep it with timeouts." },
        { icon: "4", title: "Classic Paxos", color: "purple", body: "Four phases on a majority: <strong>Prepare \u2192 Promise \u2192 Accept \u2192 Accepted</strong>. Once a majority accepts a value, it is permanently chosen." },
        { icon: "M", title: "Multi-Paxos", color: "green", body: "Elect a stable leader who <strong>skips Prepare</strong> for later proposals, cutting 2 round trips to 1. The same shortcut Raft bakes in by design." }
      ],
      table: {
        headers: ["Protocol", "Leader Required?", "RTTs (steady state)", "Log Ordering", "Membership Change", "Used By"],
        rows: [
          ["<strong>Raft</strong>", "Yes (strong leader)", "<strong>1 RTT</strong>", "Strict sequential, no gaps", "Joint consensus (built-in)", "etcd, CockroachDB, Consul"],
          ["<strong>Multi-Paxos</strong>", "Yes (elected proposer)", "<strong>1 RTT</strong> (after leader elected)", "Gaps possible, out-of-order", "Separate protocol needed", "Spanner, Chubby, Megastore"],
          ["<strong>ZAB</strong>", "Yes (primary)", "<strong>1 RTT</strong>", "FIFO + causal ordering", "Reconfiguration protocol", "ZooKeeper"],
          ["<strong>Viewstamped Replication</strong>", "Yes (primary)", "<strong>1 RTT</strong>", "Sequential within view", "View change protocol", "Academic, influenced Raft"],
          ["<strong>EPaxos</strong>", "No (leaderless)", "<strong>1 RTT</strong> (fast path, no conflicts)", "Dependency graph", "Complex", "Research, some Google systems"]
        ]
      },
      callouts: [
        { color: "green", label: "Multi-Paxos optimization:", body: "Classic Paxos needs 2 RTTs per decision (Prepare + Accept). <strong>Multi-Paxos</strong> elects a stable leader who skips Phase 1 for subsequent proposals, reducing to <strong>1 RTT</strong> (just Accept). The leader holds a lease on proposal numbers; if it fails, a new leader runs full Paxos once, then resumes the fast path. Used by <strong>Google Spanner</strong> and <strong>Chubby</strong>." },
        { color: "purple", label: "Key insight:", body: "All practical consensus protocols converge on a <strong>stable leader</strong> for performance. The difference is how they handle leader failure, log gaps, and membership changes: Raft wins on understandability, Multi-Paxos on flexibility, ZAB on ordering guarantees." }
      ]
    },
    tradeoffs: {
      heading: "Why the Protocols Diverge",
      intro: "They all reach 1 RTT in steady state, so the real differences are in the edges.",
      points: [
        { label: "FLP is worked around, never beaten", body: "Because guaranteed async consensus is impossible, every protocol adds a timeout-driven leader election. This trades a theoretical impossibility for a practical liveness assumption: progress happens as long as a leader can stay elected." },
        { label: "Leader-based vs leaderless", body: "Raft, Multi-Paxos, and ZAB funnel everything through one leader (simple, but the leader is a bottleneck and a failure point). EPaxos is leaderless with a fast path when operations don\u2019t conflict, at the cost of a much more complex dependency-graph design." },
        { label: "Majority overlap is the safety core", body: "Any two majorities of an odd cluster share at least one node. That single shared node is what makes it impossible for two different values to both be chosen: the guarantee under Paxos and Raft alike." }
      ]
    },
    handsOn: {
      prerequisites: "Python or Node.js only. Paxos is rarely run off-the-shelf, so this lab builds a minimal simulation.",
      setup: "None.",
      simulate: "Implement the 4 Classic Paxos phases as plain function calls between 5 simulated nodes in one script (no real network): a proposer sends `Prepare(n)` to all 5, collects Promises, sends `Accept(n, value)` once it has a majority, and collects Accepted confirmations. Then simulate 2 competing proposers racing with overlapping proposal numbers and trace which value wins.",
      observe: "Exactly one value getting permanently chosen even with 2 concurrent proposers. The majority-overlap guarantee (any 2 majorities out of 5 share at least 1 node) is what prevents two different values from both being Accepted, walked through in your own trace log instead of taken on faith.",
      stretch: "Add the Multi-Paxos optimization: once one proposer\u2019s Prepare succeeds, skip Prepare for its next 5 proposals and go straight to Accept. Count how many total messages you saved versus running Classic Paxos\u2019s full 4 phases each time."
    }
  },
  keyTakeaways: [
    "<strong>FLP impossibility</strong> means guaranteed consensus in a fully async system is impossible; real protocols work around it with timeouts and leader election, they don\u2019t defeat it.",
    "<strong>Classic Paxos</strong> is 4 phases (Prepare \u2192 Promise \u2192 Accept \u2192 Accepted) at 2 RTTs; <strong>Multi-Paxos</strong> and <strong>Raft</strong> elect a stable leader to reach 1 RTT in steady state.",
    "Safety comes from <strong>majority overlap</strong>: any two majorities share a node, so two conflicting values can never both be chosen."
  ],
  proTip: "Don\u2019t implement Paxos or Raft yourself for production. Use etcd, ZooKeeper, or a Raft library; correct consensus is famously easy to get subtly, catastrophically wrong.",
  related: ["leader-election", "zookeeper", "clocks", "replication-strategies", "dist-patterns", "failure-detection"],
  bridgeOut: "The next distributed-systems fundamental is ordering events when no shared clock exists at all: clocks and time."
};
