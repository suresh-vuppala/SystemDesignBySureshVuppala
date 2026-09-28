/* === Lesson saga-orchestration - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#saga-orchestration)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["saga-orchestration"] = {
  module: 9, num: "9.6", title: "Saga \u2192 Orchestration vs Choreography",
  connectsFrom: "9.4 named Saga as one distributed-transaction option and 9.5 covered locking a single row. Sagas are how you run a long-running transaction across many services when 2PC is too slow or spans too many participants, using compensating actions instead of a blocking commit.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "styles", label: "Orchestration vs Choreography", icon: "swap" },
    { key: "compensation", label: "Compensation", icon: "loop" },
    { key: "realWorld", label: "Tools & Real-World", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Long-Running Transactions With Compensation",
      intro: "A saga is a chain of local transactions where each step has a <strong>compensating action</strong> that undoes it on failure. Two coordination styles exist: <strong>Orchestration</strong>, where a central coordinator calls each step, and <strong>Choreography</strong>, where each service reacts to the previous step's event with no coordinator.",
      cards: [
        { icon: "OR", title: "Orchestration", color: "blue", body: "A central coordinator explicitly calls each step and issues compensations on failure. Easier to reason about and trace, but adds a new central dependency." },
        { icon: "CH", title: "Choreography", color: "purple", body: "Pure event-driven: each service reacts to the previous step's event, no central coordinator. No single point of failure, but the overall flow is harder to see in one place." },
        { icon: "CX", title: "Compensation", color: "green", body: "The undo half of every step. Compensations must be semantically meaningful (a business-level refund, not a DB rollback), idempotent, and ideally commutative." }
      ],
      callouts: [
        { color: "yellow", label: "Sagas vs 2PC:", body: "Use <strong>2PC</strong> when you need strong consistency across 2-3 databases in the same trust boundary and the transaction is short-lived. Use <strong>Sagas</strong> when spanning multiple microservices, running long, or when availability matters more than immediate consistency. Full comparison in Distributed Transactions (9.4)." }
      ]
    },
    styles: {
      heading: "Orchestration vs Choreography",
      intro: "Same saga, two ways to coordinate the steps. Orchestration centralizes control; choreography distributes it through events. The choice drives coupling, visibility, and how complexity grows.",
      table: {
        headers: ["Dimension", "Orchestration", "Choreography"],
        rows: [
          ["<strong>Coordinator</strong>", "Central orchestrator (Temporal, Cadence, Step Functions)", "None, services react to domain events"],
          ["<strong>Coupling</strong>", "Services coupled to the orchestrator", "Loosely coupled, only know their own events"],
          ["<strong>Visibility</strong>", "Easy to trace, single workflow definition", "Hard to trace, spread across event logs"],
          ["<strong>Complexity</strong>", "Grows linearly with steps", "Grows exponentially with interactions"],
          ["<strong>Failure handling</strong>", "Orchestrator decides compensation order", "Each service handles its own compensation"],
          ["<strong>Testing</strong>", "Test the workflow as a unit", "Requires integration tests across services"],
          ["<strong>Best for</strong>", "Complex flows (5+ steps), strict ordering needed", "Simple flows (2-3 steps), autonomous teams"]
        ]
      },
      callouts: [
        { color: "green", label: "Isolation countermeasures:", body: "<strong>Semantic locks</strong>: mark resources as processing (order status = PENDING). <strong>Commutative updates</strong>: operations that work in any order. <strong>Pessimistic view</strong>: reread data before compensation. <strong>Reread value</strong>: verify state hasn\u2019t changed before acting." }
      ]
    },
    compensation: {
      heading: "Getting Compensation Right",
      intro: "Sagas move the hard part from commit to compensation, and most saga bugs live there.",
      points: [
        { label: "Compensation design rules", body: "Compensations must be a semantic undo (refund, not DB rollback), idempotent (may run multiple times), ideally commutative, and must effectively never fail (retry forever). Recover backward: undo in reverse order of execution." },
        { label: "Common pitfalls", body: "No isolation between concurrent sagas causes dirty reads (use semantic locks). Lost compensations leave inconsistent state. Cyclic dependencies (A \u2192 B \u2192 C \u2192 A) deadlock. More than 7 steps suggests splitting into sub-sagas. No per-step timeout lets a saga hang forever." },
        { label: "Anti-patterns", body: "A saga without compensations is just a distributed transaction that cannot roll back. Synchronous sagas defeat the purpose, so use 2PC instead. Shared mutable state, where services read each other's database directly, breaks the isolation sagas depend on." }
      ]
    },
    realWorld: {
      heading: "Tools and Production Sagas",
      intro: "Orchestration engines have matured into off-the-shelf products, and the largest platforms run their core flows as sagas.",
      table: {
        headers: ["Tool", "Type", "Language", "Key Feature"],
        rows: [
          ["<strong>Temporal</strong>", "Orchestration", "Go, Java, TypeScript, Python", "Durable execution, automatic retries, versioning"],
          ["<strong>AWS Step Functions</strong>", "Orchestration", "Any (via Lambda)", "Serverless, visual workflow, built-in error handling"],
          ["<strong>Cadence</strong>", "Orchestration", "Go, Java", "Uber-built, predecessor to Temporal"],
          ["<strong>Axon Framework</strong>", "Both", "Java/Kotlin", "CQRS + Event Sourcing + Saga built-in"],
          ["<strong>MassTransit</strong>", "Both", ".NET", "State machine sagas, RabbitMQ/Kafka transport"],
          ["<strong>Eventuate Tram</strong>", "Choreography", "Java", "Outbox pattern, CDC-based event publishing"]
        ]
      },
      callouts: [
        { color: "blue", label: "Production sagas:", body: "<strong>Uber</strong>, trip lifecycle saga (match \u2192 pickup \u2192 ride \u2192 payment \u2192 rating). <strong>Netflix</strong>, content ingestion pipeline (transcode \u2192 validate \u2192 publish). <strong>Airbnb</strong>, booking saga (reserve \u2192 charge \u2192 confirm host \u2192 send confirmation)." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js; the free tier of Temporal Cloud, or a local Temporal dev server (`temporal server start-dev`, free, one command).",
      setup: "Local and free: `temporal server start-dev`.",
      simulate: "Build a 3-step saga as a Temporal Workflow: Reserve Inventory, Charge Payment, Ship Order, each a separate Activity with a compensating Activity (Release Inventory, Refund Payment, Cancel Shipment). Force \u201cCharge Payment\u201d to fail and watch Temporal's Web UI show the execution history, including which compensations ran.",
      observe: "Temporal tracks exactly which steps completed before the failure and runs only the needed compensations (Release Inventory only, since Charge Payment never succeeded and Ship Order never started): orchestration's central visibility, seen directly in the UI.",
      stretch: "Kill the Temporal worker mid-workflow and restart it: the workflow resumes exactly where it left off, because Temporal persists workflow state independent of any single worker process."
    }
  },
  keyTakeaways: [
    "A saga replaces a blocking distributed commit with a chain of local transactions, each paired with a <strong>compensating action</strong> that undoes it on failure.",
    "<strong>Orchestration</strong> centralizes control for easy tracing at the cost of a new dependency; <strong>choreography</strong> is event-driven with no coordinator but exponential complexity and poor visibility.",
    "Compensations must be semantic, idempotent, and effectively never fail; the common failures are lost compensations, missing isolation, cyclic dependencies, and steps with no timeout."
  ],
  proTip: "Reach for orchestration once a saga has more than a few steps or needs strict ordering: the central workflow definition is worth the dependency, and an engine like Temporal gives you retries, timeouts, and visibility for free.",
  related: ["transactions", "concurrency", "conflict-resolution", "event-sourcing", "cqrs"],
  bridgeOut: "9.2's AP systems accept that two replicas can end up with different values for the same key. Reconciling them is the next lesson."
};
