/* === Lesson graceful-degradation - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#graceful-degradation)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["graceful-degradation"] = {
  module: 10, num: "10.10", title: "Graceful Degradation",
  connectsFrom: "Under extreme load, a system trying to do everything perfectly often fails completely. Staying <em>partially</em> up by deliberately shedding non-critical work is usually the better outcome.",
  tabs: {
    overview: {
      heading: "Stay Partially Up, Not Fully Down",
      intro: "Graceful degradation keeps you <strong>partially up</strong> instead of fully down: shed non-critical features to protect <strong>core user journeys</strong>. It progresses through four tiers as load climbs, shedding more at each step.",
      cards: [
        { icon: "1", title: "Healthy", color: "green", body: "All features active: recommendations, analytics, search suggestions, personalization, A/B tests, real-time updates." },
        { icon: "2", title: "Stressed", color: "orange", body: "Disable non-essential: recommendations off, analytics delayed, A/B tests paused, serve stale cache, throttle non-critical APIs." },
        { icon: "3", title: "Overloaded", color: "purple", body: "Read-only mode: browse and view still work, new writes queue, images drop to low-res, free tier blocked." },
        { icon: "4", title: "Critical", color: "red", body: "Core path only: login, checkout, and payment stay up. Everything else off, static error page for non-critical paths." }
      ],
      table: {
        headers: ["Tactic", "How it works", "Implementation", "Example"],
        rows: [
          ["<strong>Feature Flags</strong>", "Toggle features without deploy", "LaunchDarkly, Unleash, Flagsmith", "Disable recommendations when DB is slow"],
          ["<strong>Circuit Breaker</strong>", "Stop calling a failing dependency", "Hystrix, Resilience4j, Polly", "Payment service down \u2192 queue orders"],
          ["<strong>Cached Fallback</strong>", "Serve stale data when source is down", "Redis/CDN with TTL override", "Catalog from cache when DB is down"],
          ["<strong>Request Hedging</strong>", "Send to multiple backends, use first reply", "gRPC hedging policy", "Tail latency reduction (p99 \u2192 p50)"],
          ["<strong>Traffic Tiering</strong>", "Prioritize paid/VIP over free", "Priority queues, weighted routing", "Paid get full features, free get basic"],
          ["<strong>Bulkhead Isolation</strong>", "Isolate failures to one component", "Separate thread pools, pods, clusters", "Search failure does not affect checkout"]
        ]
      },
      callouts: [
        { color: "green", label: "Tactics:", body: "<strong>Feature flags</strong> (LaunchDarkly) for instant toggle. <strong>Traffic tiering</strong> by importance (paid &gt; free). <strong>Cached fallbacks</strong> with extended TTL. <strong>Circuit breakers</strong> per dependency. <strong>Request hedging</strong> for tail latency. <strong>Bulkhead isolation</strong> so failure in one component does not cascade." },
        { color: "yellow", label: "Testing degradation:", body: "<strong>Chaos engineering</strong>: inject failures in prod (Netflix Chaos Monkey). <strong>Game days</strong>: simulate outages with the team. <strong>Load testing</strong>: push past capacity to verify degradation tiers activate. <strong>Dependency kill switch</strong>: test each circuit breaker independently." },
        { color: "blue", label: "Degradation decision matrix:", body: "<strong>CPU &gt; 80%</strong> \u2192 disable recommendations. <strong>DB latency &gt; 500ms</strong> \u2192 serve from cache only. <strong>Error rate &gt; 5%</strong> \u2192 circuit break the failing service. <strong>Queue depth &gt; 10K</strong> \u2192 reject non-critical work. <strong>Memory &gt; 90%</strong> \u2192 drop sessions, reduce cache." }
      ]
    },
    realWorld: {
      heading: "Degradation in Production",
      points: [
        { label: "Netflix", body: "Hystrix circuit breakers with fallback to cached recommendations." },
        { label: "Amazon", body: "Static product pages from S3 when the app tier is overloaded." },
        { label: "Twitter", body: "The fail whale era: a degraded timeline with no trends and no who-to-follow rather than a full outage." },
        { label: "Shopify", body: "Checkout always works, even if the storefront is degraded during flash sales." }
      ]
    },
    tradeoffs: {
      heading: "Why Degradation Fails",
      intro: "Graceful degradation only helps if the degraded path actually works and triggers itself.",
      points: [
        { label: "All-or-nothing design", body: "A system that is either fully up or fully down has no middle ground to fall back to. Degradation requires deliberate tiers built in advance." },
        { label: "Untested fallbacks", body: "The fallback path has its own bugs, discovered only during the outage it was meant to survive. Fallbacks must be exercised regularly." },
        { label: "Cascading failures", body: "Without bulkheads, one service going down takes everything with it. Isolation is what keeps a local failure local." },
        { label: "Manual intervention required", body: "If a human has to flip the switch, degradation is too slow. It should trigger automatically from measured metrics like the decision matrix." }
      ]
    },
    handsOn: {
      goal: "Build an app whose non-critical feature switches itself off automatically when the core endpoint\u2019s p99 latency crosses a threshold, staying partially up instead of fully down.",
      stack: "Node.js and Express with an in-process feature flag and latency watchdog, load-tested with <code>hey</code>. The production equivalent is a flag service like Unleash or Flagsmith. Local and free.",
      steps: [
        {
          title: "Write the app: core, flagged recommendations, watchdog",
          body: "The watchdog samples the core endpoint\u2019s p99 and flips the recommendations flag off past 100ms (the CPU &gt; 80% rule, simulated). Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst app = express();\n\nlet recommendationsOn = true;\nconst latencies = [];\n\nfunction record(ms) {\n  latencies.push(ms);\n  if (latencies.length > 200) latencies.shift();\n}\nfunction p99() {\n  if (!latencies.length) return 0;\n  const s = [...latencies].sort((a, b) => a - b);\n  return s[Math.min(s.length - 1, Math.floor(s.length * 0.99))];\n}\n\n// core endpoint: must always stay up\napp.get('/core', (req, res) => {\n  const start = Date.now();\n  const end = start + 5;\n  while (Date.now() < end) {}\n  record(Date.now() - start);\n  res.json({ ok: true });\n});\n\n// non-critical: calls a slow downstream\napp.get('/recommendations', async (req, res) => {\n  if (!recommendationsOn) return res.status(503).json({ degraded: true });\n  await new Promise(r => setTimeout(r, 300));\n  res.json({ items: [1, 2, 3] });\n});\n\n// watchdog: shed the non-critical feature when core p99 crosses 100ms\nsetInterval(() => {\n  const now = p99();\n  if (now > 100 && recommendationsOn) {\n    recommendationsOn = false;\n    console.log('DEGRADE: recommendations OFF, core p99 =', now, 'ms');\n  } else if (now < 50 && !recommendationsOn) {\n    recommendationsOn = true;\n    console.log('RECOVER: recommendations ON, core p99 =', now, 'ms');\n  }\n}, 1000);\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Install dependencies and run it",
          code: "npm init -y && npm install express\nnode server.js",
          lang: "bash"
        },
        {
          title: "Hammer the core endpoint to push p99 past the threshold",
          code: "hey -z 60s -c 200 http://localhost:3000/core",
          lang: "bash"
        },
        {
          title: "Watch recommendations degrade in another terminal",
          code: "while true; do curl -s -o /dev/null -w \"%{http_code}\\n\" http://localhost:3000/recommendations; sleep 1; done",
          lang: "bash"
        }
      ],
      observe: "Once the core p99 crosses 100ms under load, the watchdog logs <code>DEGRADE</code> and <code>/recommendations</code> starts returning 503 while <code>/core</code> keeps serving 200s: partial availability instead of a full outage, triggered by a measured metric rather than a manual toggle. When the load stops, it logs <code>RECOVER</code> and flips back on.",
      stretch: "Add request hedging on one call: fire the same request to two mock replica endpoints at once and use whichever responds first, discarding the slower one. Measure how much p99 improves when you inject artificial jitter into one of the two replicas."
    }
  },
  keyTakeaways: [
    "Graceful degradation stays <strong>partially up</strong> by shedding non-critical features in tiers (Healthy \u2192 Stressed \u2192 Overloaded \u2192 Critical) to protect core journeys.",
    "The toolkit is feature flags, circuit breakers, cached fallbacks, request hedging, traffic tiering, and bulkhead isolation.",
    "It must be <strong>automatic and tested</strong>: metric-driven thresholds trigger degradation, and fallbacks are exercised before the real outage."
  ],
  proTip: "Write the degradation decision matrix as concrete thresholds (CPU &gt; 80%, DB latency &gt; 500ms, error rate &gt; 5%) and wire them to automatic actions. A plan that needs a human to trigger it is not a plan, it is a hope.",
  related: ["auto-scaling", "backpressure", "rate-limiting", "cap"],
  bridgeOut: "This closes Module 10. Distributed Systems opens next: every pattern here quietly assumed deeper machinery (leader election, gossip, consensus) that was never actually explained."
};
