/* === Lesson conflict-resolution - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#conflict-resolution)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["conflict-resolution"] = {
  module: 9, num: "9.7", title: "Conflict Resolution",
  connectsFrom: "AP systems from 9.1 and 9.2 accept that two nodes can each take a write to the same key while disconnected. When they reconnect, both values exist, and something has to decide the \u201creal\u201d value. There is no universally correct answer, only a set of strategies with different trade-offs.",
  tabs: {
    overview: {
      heading: "When Two Nodes Disagree, Who Wins?",
      intro: "Eventually consistent systems must reconcile <strong>concurrent writes</strong> to the same key. The strategies range from cheap and lossy (Last-Writer-Wins) to conflict-detecting (vector clocks) to mathematically merge-safe (CRDTs). The right one depends on whether silently dropping a write is acceptable.",
      cards: [
        { icon: "LW", title: "Last-Writer-Wins", color: "yellow", body: "Highest timestamp wins, the losing write is <strong>silently discarded</strong>. Simple and lossy. Cassandra's default." },
        { icon: "VC", title: "Vector Clocks", color: "teal", body: "Track causal history per node to <strong>detect true conflicts</strong> and surface both versions for resolution. Riak." },
        { icon: "CR", title: "CRDTs", color: "green", body: "Data structures mathematically guaranteed to <strong>auto-merge</strong> with no lost writes. Figma, Apple Notes, Redis Active-Active." }
      ],
      table: {
        headers: ["Strategy", "How It Works", "Data Loss?", "Used By"],
        rows: [
          ["<strong>Last-Writer-Wins (LWW)</strong>", "Highest timestamp wins, discard others", "Yes, silent data loss", "Cassandra (default), DynamoDB"],
          ["<strong>Vector Clocks</strong>", "Track causal history per node, detect true conflicts", "No, surfaces siblings for resolution", "Riak, Voldemort"],
          ["<strong>Version Vectors</strong>", "Simplified vector clocks (per-replica, not per-client)", "No, detects concurrent updates", "Riak (newer), Dynamo paper"],
          ["<strong>CRDTs</strong>", "Mathematically convergent data structures", "No, auto-merges", "Figma, Apple Notes, Redis CRDT, Yjs"],
          ["<strong>Operational Transform</strong>", "Transform concurrent ops to maintain intent", "No, preserves all edits", "Google Docs"],
          ["<strong>Application-level merge</strong>", "Custom merge logic per domain", "Depends on logic", "Git (3-way merge), custom apps"]
        ]
      },
      callouts: [
        { color: "green", label: "Key insight:", body: "<strong>CRDTs guarantee convergence</strong>: all replicas reach the same state without coordination. The trade-off: they are limited to data types with commutative, associative, and idempotent merge operations, and not all business logic fits naturally into a CRDT." },
        { color: "yellow", label: "Choosing a strategy:", body: "<strong>LWW</strong> for caches, session data, non-critical writes. <strong>Vector clocks</strong> for shopping carts and user preferences (surface the conflict). <strong>CRDTs</strong> for collaborative editing, counters, and distributed sets. <strong>OT</strong> for real-time text collaboration with a central server." }
      ]
    },
    realWorld: {
      heading: "CRDT Types and Where They Run",
      intro: "CRDTs come in families by data shape, and each maps to real collaborative products.",
      points: [
        { label: "Counters", body: "G-Counter is grow-only (likes, views); PN-Counter adds decrement too. Merge takes the max per node, then sums across nodes." },
        { label: "Sets", body: "G-Set is add-only; OR-Set is observed-remove (add and remove); LWW-Element-Set keeps a timestamp per element." },
        { label: "Sequences and text", body: "RGA (Replicated Growable Array) and LSEQ handle collaborative text where insertion order matters." },
        { label: "Production systems", body: "Figma uses CRDTs for multiplayer design, Apple Notes for offline-first sync, Redis Active-Active for CRDT-based conflict resolution, Riak for vector clocks with sibling resolution, and Google Docs for Operational Transform." }
      ]
    },
    tradeoffs: {
      heading: "The Cost of Each Choice",
      intro: "Every strategy trades away something: correctness, complexity, or unbounded growth.",
      points: [
        { label: "LWW loses writes silently", body: "Last-Writer-Wins is trivial to implement but discards the losing update with no signal, which is why it is Cassandra's default yet dangerous for anything that matters." },
        { label: "Anti-patterns", body: "LWW for financial data means lost writes equal lost money. Ignoring clock skew makes LWW unreliable because NTP drift reorders writes. Unbounded vector clocks grow forever without pruning. Using CRDTs for everything is overkill for simple cases." },
        { label: "CRDTs are not universal", body: "Convergence is guaranteed only for operations that are commutative, associative, and idempotent, so business rules that require a single authoritative decision do not fit and need app-level merge or OT instead." }
      ]
    },
    handsOn: {
      prerequisites: "JavaScript; a free CRDT library (`yjs` or `automerge`, both open-source).",
      setup: "Local and free only.",
      simulate: "Create 2 independent `Y.Doc` instances (Yjs) with no network between them, each an \u201coffline\u201d client. Have client A add 3 items to a shared array and client B add 2 different items to its own copy, entirely offline. Then merge the two documents' updates (`Y.applyUpdate`).",
      observe: "All 5 items present in the merged result with no manual conflict-resolution code written: the CRDT's mathematical merge guarantee, observed directly, contrasted with what a naive Last-Writer-Wins merge would have done (silently kept only one client's list).",
      stretch: "Have both clients edit the same text position concurrently (Yjs `Y.Text`) while offline, merge, and confirm both edits survive in a sensible order: the collaborative-text case that Google Docs' Operational Transform and CRDTs both solve, felt directly."
    }
  },
  keyTakeaways: [
    "Concurrent writes to the same key in an AP system need a reconciliation strategy; there is no universally correct winner, only trade-offs.",
    "<strong>LWW</strong> is simple but silently drops writes; <strong>vector clocks</strong> detect true conflicts and surface both versions; <strong>CRDTs</strong> merge automatically with no loss for data types that fit.",
    "CRDTs converge without coordination but only for commutative, associative, idempotent merges, so financial or single-decision logic needs app-level merge or Operational Transform."
  ],
  proTip: "Never use Last-Writer-Wins for anything you cannot afford to lose: if a dropped write costs money or trust, choose vector clocks to surface the conflict or a CRDT that merges both.",
  related: ["consistency-models", "clock-sync", "cap", "saga-orchestration", "replication", "concurrency", "transactions"],
  bridgeOut: "LWW depends entirely on comparing timestamps across different machines. Why that is harder than it sounds is the last lesson in this module."
};
