/* === Lesson failure-detection - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#failure-detection)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.12.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["failure-detection"] = {
  module: 11, num: "11.12", title: "Failure Detection",
  connectsFrom: "Leader election assumed \u201cfollowers detect a missing heartbeat\u201d as a simple fact. It is not. Deciding whether a node is actually dead, versus just slow from a GC pause or a network blip, in a fully asynchronous network is provably impossible to do with certainty.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "detectors", label: "Comparing Detectors", icon: "layers" },
    { key: "mechanics", label: "How They Work", icon: "hex" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Deciding If a Node Is Really Dead",
      intro: "Detecting failure perfectly is <strong>impossible</strong> (FLP): you cannot tell a crashed node from a slow one for sure. So every detector trades <strong>detection speed</strong> against <strong>false-positive rate</strong>, and the art is choosing the right point on that curve for your cluster size.",
      cards: [
        { icon: "T", title: "Fixed Timeout", color: "blue", body: "Declare dead after N seconds of silence. Too short \u2192 false positives during a GC pause; too long \u2192 slow detection. Simple, non-adaptive." },
        { icon: "\u03c6", title: "Phi Accrual", color: "purple", body: "Outputs a continuous <strong>suspicion level \u03c6</strong> from heartbeat history instead of a binary alive/dead. The app picks a threshold. Self-adjusting to network conditions." },
        { icon: "S", title: "SWIM", color: "green", body: "Gossip-based: ping a random peer, and on no response ask K peers to probe it indirectly. <strong>O(1) per-node</strong> load, so it scales to huge clusters." }
      ],
      callouts: [
        { color: "green", label: "The problem with fixed timeouts:", body: "Network latency varies, so a fixed timeout (e.g. 5s) is either <strong>too short</strong> (false positives: a healthy node marked dead during a GC pause) or <strong>too long</strong> (slow detection: real failures take too long to catch). There is no single good value, which is why adaptive detectors exist." }
      ]
    },
    detectors: {
      heading: "Comparing Detectors",
      intro: "Five detectors along the speed / accuracy / scale axes. Pick by cluster size: the right choice at 5 nodes is the wrong one at 500.",
      table: {
        headers: ["Detector", "Detection Time", "False Positive Rate", "Scalability", "Adaptivity", "Used By"],
        rows: [
          ["<strong>Fixed Timeout</strong>", "timeout value (e.g. 5s)", "High if timeout too short", "O(N) messages from monitor", "None, manual tuning", "Simple systems, Redis Sentinel"],
          ["<strong>Heartbeat + Lease</strong>", "lease duration (e.g. 10s)", "Low (conservative timeout)", "O(N) per monitor", "None", "ZooKeeper sessions, Chubby"],
          ["<strong>Phi Accrual</strong>", "Adaptive (based on history)", "<strong>Tunable via \u03c6 threshold</strong>", "O(N) per monitor", "<strong>Self-adjusting</strong>", "Cassandra, Akka Cluster"],
          ["<strong>SWIM (Gossip)</strong>", "O(log N) protocol periods", "Low (indirect probes reduce it)", "<strong>O(1) per node</strong>", "Moderate", "Consul, Serf, Memberlist"],
          ["<strong>SWIM + Suspicion</strong>", "O(log N) + suspicion timeout", "<strong>Very low</strong>", "<strong>O(1) per node</strong>", "Good", "Consul (Lifeguard)"]
        ]
      },
      callouts: [
        { color: "blue", label: "Design guidance by cluster size:", body: "Small (3-7 nodes): simple heartbeat with a Raft-style election timeout (150-300ms). Medium (10-100): Phi Accrual gives the best accuracy. Large (100+): SWIM/gossip is essential, O(1) per-node overhead vs a centralized heartbeat\u2019s O(N). Always add a <strong>suspicion period</strong> before declaring dead, to absorb transient blips and GC pauses." }
      ]
    },
    mechanics: {
      heading: "How Phi Accrual and SWIM Work",
      intro: "The two adaptive detectors worth understanding in detail: one turns heartbeat timing into a probability, the other spreads the work across the whole cluster.",
      callouts: [
        { color: "yellow", label: "Phi (\u03c6) accrual detector:", body: "Instead of binary alive/dead, output a <strong>suspicion level \u03c6</strong> (higher = more likely dead) and let the app pick a threshold. It tracks heartbeat inter-arrival times, fits a distribution, and computes <code>\u03c6 = -log10(1 - F(t_now - t_last))</code>. Worked example (mean 1000ms, std 200ms): \u03c6 \u2248 0.3 at 1s (probably alive), \u03c6 \u2248 3.0 at 2s (suspicious), \u03c6 \u2248 12.0 at 5s (almost certainly dead). Cassandra marks dead at \u03c6 &gt; 8." },
        { color: "purple", label: "SWIM protocol:", body: "Scalable Weakly-consistent Infection-style Membership. A node pings a random peer; on no response it asks K random peers to <code>ping-req</code> the target indirectly; if all fail the target is <strong>suspected</strong>, then <strong>dead</strong> after a timeout. Membership changes piggyback on the same ping/ack messages. Used by HashiCorp Memberlist (Consul, Nomad, Serf) and Uber Ringpop." }
      ]
    },
    tradeoffs: {
      heading: "Speed vs False Positives vs Scale",
      intro: "No detector wins on every axis; each buys one property with another.",
      points: [
        { label: "Speed vs false positives", body: "Detect faster and you flag healthy-but-slow nodes as dead (false positives); detect conservatively and real failures linger. A suspicion period is the standard compromise: suspect quickly, confirm before acting." },
        { label: "Adaptive beats fixed", body: "Phi Accrual adjusts to the observed network automatically, so the same detector works on a low-latency LAN and a jittery WAN without retuning; a fixed timeout cannot." },
        { label: "O(1) vs O(N) at scale", body: "Centralized heartbeat detectors cost O(N) messages per monitor and buckle past ~100 nodes. SWIM\u2019s gossip is O(1) per node, which is why large clusters (Consul, Serf) depend on it." }
      ]
    },
    handsOn: {
      prerequisites: "Python or Node.js only.",
      setup: "None.",
      simulate: "Implement the Phi Accrual formula directly against a simulated heartbeat stream (mean 1000ms, std 200ms, matching the worked example). Feed it a normal stream first and confirm \u03c6 stays low, then simulate a node going quiet (stop the heartbeats) and compute \u03c6 at 1s, 2s, and 5s of silence.",
      observe: "Your own computed \u03c6 values landing close to the worked example\u2019s \u2248 0.3 / 3.0 / 12.0 at the same elapsed times, verifying the formula produces the stated numbers. Then implement a naive fixed 2-second timeout on the same stream and count how many normal, healthy delays (just jitter, no real failure) get falsely flagged: the false-positive problem Phi Accrual avoids.",
      stretch: "Implement a minimal SWIM-style indirect probe: node A can\u2019t reach node C directly, so it asks nodes B and D to try reaching C on its behalf. Confirm C is correctly marked alive if even one indirect probe succeeds, despite A\u2019s own direct probe failing."
    }
  },
  keyTakeaways: [
    "Perfect failure detection is <strong>impossible</strong> in an async network (FLP): you cannot distinguish a crashed node from a slow one with certainty, so every detector trades detection speed against false positives.",
    "<strong>Phi Accrual</strong> replaces a binary timeout with a continuous suspicion level \u03c6 that adapts to network conditions (Cassandra marks dead at \u03c6 &gt; 8).",
    "<strong>SWIM</strong> gossip, with indirect probes and a suspicion period, is O(1) per node and the only approach that scales to hundreds of nodes."
  ],
  proTip: "Always insert a suspicion period before declaring a node dead. Marking a node down on the first missed heartbeat is how a routine GC pause triggers an unnecessary, disruptive failover.",
  related: ["leader-election", "dist-patterns", "consensus-protocols", "fault-tolerance", "zookeeper", "partitioning-sharding"],
  bridgeOut: "This closes Module 11. The module produced and moved data through countless systems; next, how that data actually travels between them: data pipelines."
};
