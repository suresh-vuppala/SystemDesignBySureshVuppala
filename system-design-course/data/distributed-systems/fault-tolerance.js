/* === Lesson fault-tolerance - part of Module 11 (Distributed Systems) ===
   Source: system-design-cheatsheet/12-distributed-systems.html (#fault-tolerance)
   + system-design-cheatsheet-course-hierarchy.md, Module 11.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["fault-tolerance"] = {
  module: 11, num: "11.5", title: "Fault Tolerance & Reliability",
  connectsFrom: "The API Gateway lesson flagged \u201ccircuit breaker\u201d as one of its responsibilities without explaining it. One slow downstream service can cascade and take down everything calling it, and this lesson is the set of patterns that stop that.",
  tabs: {
    overview: {
      heading: "Survive Failures Without Losing Function",
      intro: "The <strong>circuit breaker</strong> is the headline pattern: a fuse for microservices that fails fast instead of letting a slow dependency block every caller. It sits inside a broader toolbox of timeouts, retries, bulkheads, and health checks that together keep one failure from becoming an outage.",
      cards: [
        { icon: "C", title: "Closed", color: "green", body: "Healthy. Requests pass normally and the error count resets on success. This is the steady state." },
        { icon: "O", title: "Open", color: "red", body: "Error rate crossed the threshold. Calls are <strong>short-circuited</strong> (fail fast, no network call) while a recovery timer runs." },
        { icon: "H", title: "Half-Open", color: "orange", body: "After the cooldown, allow a few <strong>trial calls</strong>. Success \u2192 back to Closed; failure \u2192 back to Open." }
      ],
      table: {
        headers: ["Pattern", "How", "Guarantee"],
        rows: [
          ["<strong>Timeouts</strong>", "Fail fast after N seconds", "Prevents indefinite waiting"],
          ["<strong>Retries + Backoff</strong>", "0s \u2192 1s \u2192 2s \u2192 4s + jitter", "Recovers from transient failures without a thundering herd"],
          ["<strong>Circuit Breaker</strong>", "CLOSED \u2192 OPEN \u2192 HALF-OPEN", "<strong>Fast-fail</strong> when downstream is broken. Self-healing."],
          ["<strong>Bulkheads</strong>", "Isolate thread pools per dependency", "One hanging service doesn\u2019t starve the others"],
          ["<strong>Health Checks</strong>", "Liveness (alive?) + Readiness (can serve?)", "LB/K8s auto-removes unhealthy instances"],
          ["<strong>Graceful Degradation</strong>", "Serve stale cache, disable non-critical features", "Partial outage \u2260 total failure"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Fallback on Open:", body: "Return a <strong>cached response</strong>, a default value, or a friendly error (\u201cTry again later\u201d) instead of a 500. Named implementations: <strong>Netflix Hystrix</strong> (pioneered it), <strong>Resilience4j</strong> (Java), <strong>Envoy/Istio</strong> (built into the mesh), <strong>Polly</strong> (.NET)." },
        { color: "green", label: "No single point of failure:", body: "Keep <strong>at least 2 of everything</strong>. <strong>Netflix Chaos Monkey</strong> randomly kills production instances to prove the redundancy actually works before a real outage tests it for you." },
        { color: "purple", label: "Availability math:", body: "<code>Downtime = (1 - availability) \u00d7 365 \u00d7 24 \u00d7 60</code> min/year: 99.9% = 8.76h, 99.99% = 52min, 99.999% = 5min. <strong>Serial</strong>: <code>A_total = A1 \u00d7 A2</code> (each component multiplies, so more serial hops always lowers total). <strong>Parallel</strong>: <code>A_total = 1 - (1-A1)(1-A2)</code> (redundancy actively improves it)." }
      ]
    },
    realWorld: {
      heading: "Beyond the Breaker",
      points: [
        { label: "Chaos Engineering", body: "Intentionally inject failures (kill pods, add latency, partition the network, fill a disk) to find weaknesses before a real outage does. Tools: <strong>Chaos Monkey</strong> (Netflix, the originator), <strong>Litmus</strong> (Kubernetes-native), <strong>Gremlin</strong>." },
        { label: "Distributed Tracing internals", body: "Inject a <code>trace_id</code> and <code>span_id</code> into every request header; each service creates a child span. Collected via OpenTelemetry into Jaeger or Datadog, this reconstructs a request\u2019s total latency broken down per service." },
        { label: "Named breaker libraries", body: "Hystrix proved the pattern at Netflix; Resilience4j is the modern Java choice; Envoy/Istio bake it into the service mesh so no application code is needed; Polly is the .NET standard." }
      ]
    },
    tradeoffs: {
      heading: "Reading the Availability Math",
      intro: "The formulas are not trivia; they change how you architect.",
      points: [
        { label: "Serial dependencies multiply down", body: "A chain of services each at 99.9% is worse than 99.9% overall, because availabilities multiply. Every extra synchronous hop is a tax on total availability." },
        { label: "Redundancy is the only lever up", body: "Parallel copies use <code>1 - (1-A1)(1-A2)</code>: two 99% components in parallel reach 99.99%. This is why \u201cat least 2 of everything\u201d is the baseline for high availability." },
        { label: "Retries can amplify failure", body: "Naive retries against a struggling service create a thundering herd that finishes it off. Jittered exponential backoff, paired with a circuit breaker, is what makes retries safe." }
      ]
    },
    handsOn: {
      goal: "Wrap a flaky dependency in an <code>opossum</code> circuit breaker and watch it trip to Open, fail fast with a fallback, then self-heal through Half-Open.",
      stack: "Node.js with the <code>opossum</code> circuit-breaker library. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "npm init -y && npm install opossum",
          lang: "bash"
        },
        {
          title: "Wrap a 60%-flaky dependency in a breaker",
          body: "The breaker opens once the error rate crosses the threshold over a minimum volume of calls, short-circuits to a cached fallback while Open, then allows a trial call after the reset timeout. Save as <code>breaker.js</code>.",
          code: "const CircuitBreaker = require('opossum');\n\nlet reached = 0;\n// downstream that fails ~60% of the time\nfunction flakyDependency() {\n  reached++;\n  return new Promise((resolve, reject) => {\n    Math.random() < 0.6 ? reject(new Error('downstream failed')) : resolve('ok');\n  });\n}\n\nconst breaker = new CircuitBreaker(flakyDependency, {\n  timeout: 500,\n  errorThresholdPercentage: 50,\n  volumeThreshold: 5,\n  resetTimeout: 3000\n});\nbreaker.fallback(() => 'cached-fallback');\n\nbreaker.on('open', () => console.log('>> circuit OPEN'));\nbreaker.on('halfOpen', () => console.log('>> circuit HALF-OPEN'));\nbreaker.on('close', () => console.log('>> circuit CLOSED'));\n\n(async () => {\n  for (let i = 1; i <= 50; i++) {\n    const result = await breaker.fire().catch(e => e.message);\n    const state = breaker.opened ? 'OPEN' : (breaker.halfOpen ? 'HALF' : 'CLOSED');\n    console.log(i, state, '->', result);\n    await new Promise(r => setTimeout(r, 200));\n  }\n  console.log('calls that actually reached downstream:', reached);\n})();",
          lang: "javascript"
        },
        {
          title: "Run it and watch the state transitions",
          code: "node breaker.js",
          lang: "bash"
        }
      ],
      observe: "After the failure threshold is crossed the circuit flips to Open, and subsequent calls return <code>cached-fallback</code> instantly with no downstream attempt (the <code>reached</code> counter stops climbing). After the 3s reset timeout it goes Half-Open and tries one trial call before deciding to close or reopen.",
      stretch: "Compute the availability math on a 3-tier chain: App Server 99.9% in front of a dependency at only 40% success, without a breaker, versus the same chain with the breaker's cached fallback during Open. Show numerically how the fallback lifts the user-facing success rate even though the dependency never improved."
    }
  },
  keyTakeaways: [
    "The <strong>circuit breaker</strong> (Closed \u2192 Open \u2192 Half-Open) fails fast when a dependency is broken, stopping one slow service from cascading into a full outage.",
    "It lives in a family of patterns: <strong>timeouts, jittered retries, bulkheads, health checks, and graceful degradation</strong>, each isolating failure a different way.",
    "Availability is math: serial dependencies <strong>multiply down</strong> (<code>A1 \u00d7 A2</code>), and only <strong>redundancy</strong> (<code>1 - (1-A1)(1-A2)</code>) buys it back, which is why you keep at least 2 of everything."
  ],
  proTip: "A circuit breaker without a fallback just turns slow errors into fast errors. The real win is pairing Open state with a cached or default response, so the user sees degraded service instead of a 500.",
  related: ["data-redundancy", "leader-election", "rate-limiting", "api-gateway", "observability", "failure-detection"],
  bridgeOut: "A circuit breaker stops a slow dependency from cascading. But after an actual data-loss event, a disk or a whole region gone, a different recovery strategy takes over: data redundancy."
};
