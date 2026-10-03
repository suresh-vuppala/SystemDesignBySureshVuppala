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
      goal: "Simulate Classic Paxos across 5 in-process nodes and watch a single value stay chosen even when a later proposer tries a different one.",
      stack: "A single Python script, no real network and no dependencies. Local and free.",
      steps: [
        {
          title: "Implement the acceptors and the propose flow",
          body: "Each acceptor tracks the highest number it promised and the value it accepted. A proposal needs a majority in Phase 1 (Prepare/Promise) and Phase 2 (Accept/Accepted), and must adopt any value already accepted. Save as <code>paxos.py</code>.",
          code: "class Acceptor:\n    def __init__(self):\n        self.promised = 0      # highest proposal number promised\n        self.accepted_n = 0    # number of the accepted value\n        self.accepted_v = None # the accepted value\n\n    def prepare(self, n):\n        if n > self.promised:\n            self.promised = n\n            return (True, self.accepted_n, self.accepted_v)\n        return (False, None, None)\n\n    def accept(self, n, v):\n        if n >= self.promised:\n            self.promised = n\n            self.accepted_n, self.accepted_v = n, v\n            return True\n        return False\n\ndef propose(acceptors, n, value):\n    majority = len(acceptors) // 2 + 1\n    # Phase 1: Prepare -> Promise\n    promises = [a.prepare(n) for a in acceptors]\n    oks = [p for p in promises if p[0]]\n    if len(oks) < majority:\n        return None\n    # adopt the highest already-accepted value, if any\n    chosen, best = value, 0\n    for ok, an, av in oks:\n        if av is not None and an > best:\n            best, chosen = an, av\n    # Phase 2: Accept -> Accepted\n    if sum(a.accept(n, chosen) for a in acceptors) >= majority:\n        return chosen\n    return None\n\nacceptors = [Acceptor() for _ in range(5)]\nprint('proposer 1 (n=1, value-A):', propose(acceptors, 1, 'value-A'))\nprint('proposer 2 (n=2, value-B):', propose(acceptors, 2, 'value-B'))\nprint('proposer 3 (n=3, value-C):', propose(acceptors, 3, 'value-C'))",
          lang: "python"
        },
        {
          title: "Run the simulation",
          code: "python paxos.py",
          lang: "bash"
        }
      ],
      observe: "Once a value is accepted by a majority, later proposers are forced to adopt it: proposer 2 and proposer 3 report the already-chosen value, not their own. The majority-overlap guarantee (any 2 majorities of 5 share at least 1 node) is what prevents two different values from both being chosen, walked through in your own output instead of taken on faith.",
      stretch: "Add the Multi-Paxos optimization: once a proposer's Prepare succeeds, skip Phase 1 for its next proposals and go straight to Accept. Count how many messages you save versus running all 4 phases every time."
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
