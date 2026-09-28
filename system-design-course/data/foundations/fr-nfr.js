/* === Lesson fr-nfr - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   One file per lesson for scalability; each file appends its slug's key
   to the shared window.COURSE_CONTENT object loaded by the pages that reference it. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["fr-nfr"] = {
  module: 1, num: "1.2", title: "FR vs NFR",
  connectsFrom: "The framework you just learned says \u201cclarify requirements,\u201d but \u201cbuild a login page\u201d only tells you what the system does, not how well. Is a 5-second login fine? Is going down for an hour a month acceptable? Two designers can both build a technically-correct login and end up with incompatible systems, because neither half of the requirement was ever stated.",
  tabs: {
    overview: {
      heading: "Functional vs Non-Functional Requirements",
      intro: "<strong>Functional Requirements (FR)</strong> = what the system does. <strong>Non-Functional Requirements (NFR)</strong> = how well it must do it. Every FR should ship paired with its NFR constraint, never stated alone.",
      table: {
        headers: ["Functional (What)", "Non-Functional (How Well)"],
        rows: [
          ["User can view a homepage with posts, feed, and navigation", "<strong>Latency</strong>: homepage loads in <strong>&lt;1.5s (p99)</strong>"],
          ["System stores customer data (profile, preferences, history)", "<strong>Security</strong>: encrypted at rest (<strong>AES-256</strong>) and in transit (<strong>TLS 1.3</strong>)"],
          ["Users can log into their accounts (auth, sessions)", "<strong>Scalability</strong>: <strong>5,000 concurrent</strong> logged-in users per server"],
          ["System is always available to customers 24/7", "<strong>Availability</strong>: <strong>99.7% uptime</strong> (26h max downtime/year)"],
          ["Customers can access on mobile phones and tablets", "<strong>Compatibility</strong>: <strong>iOS 14+</strong> and <strong>Android 10+</strong> browsers"],
          ["User can search products by name, category, filters", "<strong>Throughput</strong>: <strong>10K searches/sec</strong> with &lt;100ms response"],
          ["User can make payments (checkout, refunds)", "<strong>Consistency</strong>: strong consistency, no double-charge"],
          ["User can chat with an AI assistant", "<strong>Latency (TTFT)</strong>: first token <strong>&lt;500ms</strong>, streams 50+ tokens/sec"],
          ["System answers from company docs (RAG knowledge base)", "<strong>Accuracy</strong>: <strong>&lt;5% hallucination rate</strong>, grounded sources"],
          ["User can generate images from text", "<strong>GPU Throughput</strong>: image in <strong>&lt;10s</strong>, 1K concurrent users/GPU"]
        ]
      },
      cards: [
        { icon: "\u2191", title: "Too Many Users", color: "purple", body: "Horizontal scaling, load balancing, caching." },
        { icon: "\u2261", title: "Too Much Data", color: "green", body: "Sharding, tiered storage." },
        { icon: "\u26a1", title: "Low Latency", color: "orange", body: "Caching, CDN, geo-distribution." },
        { icon: "\u2713", title: "High Availability", color: "teal", body: "Replication, multi-region, graceful degradation." }
      ],
      callouts: [
        { color: "blue", label: "Core Challenges:", body: "<strong>Too many users</strong> \u2192 horizontal scaling, LB, caching. <strong>Too much data</strong> \u2192 sharding, tiered storage. <strong>Low latency</strong> \u2192 caching, CDN, geo-distribution. <strong>High availability</strong> \u2192 replication, multi-region, graceful degradation." },
        { color: "yellow", label: "Interview tip:", body: "Always pair each FR with its NFR constraint. \u201cUsers can post tweets\u201d \u2192 \u201cat 10K tweets/sec with P99 &lt;200ms.\u201d This shows you think about <em>both</em> what the system does and how well it must do it." }
      ]
    },
    handsOn: {
      prerequisites: "None.",
      setup: "No infra needed, just a text editor and the FR list above.",
      simulate: "Pick any product you use daily (e.g. a food-delivery app) and write down 5 of its FRs, then force yourself to pair each with a numeric NFR. Not \u201cfast,\u201d but \u201corder confirmation p99 < 2s\u201d; not \u201creliable,\u201d but \u201c99.9% order placement availability, 0% double-charge rate.\u201d",
      observe: "Which NFRs you genuinely don\u2019t know the right number for. That gap is exactly what interviewers probe, and exactly what 1.3\u2019s SLI/SLO/SLA framework exists to make rigorous.",
      stretch: "For one FR/NFR pair, name which specific architecture component (cache, queue, replica) would actually need to exist to hit that number."
    }
  },
  keyTakeaways: [
    "4 core challenges every NFR traces back to: too many users, too much data, low latency, high availability.",
    "A number-free NFR (\u201cfast,\u201d \u201creliable\u201d) isn\u2019t actually a requirement yet."
  ],
  proTip: "In interviews, say the NFR as a number immediately after the FR: \u201cusers can post tweets, at <strong>10K/sec</strong> with <strong>p99 < 200ms</strong>.\u201d It signals you think about both halves.",
  related: ["sd-framework", "nfr-metrics"],
  bridgeOut: "Naming \u201cp99 < 200ms\u201d and \u201c99.9% available\u201d is easy, but what a percentile actually is, and what \u201cnines\u201d actually cost in downtime, is the next gap."
};
