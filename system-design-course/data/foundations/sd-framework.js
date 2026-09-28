/* === Lesson sd-framework - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   One file per lesson for scalability; each file appends its slug's key
   to the shared window.COURSE_CONTENT object loaded by the pages that reference it. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["sd-framework"] = {
  module: 1, num: "1.1", title: "Design Interview Framework",
  connectsFrom: "Handed an open-ended prompt like \u201cdesign Twitter\u201d with no structure, most people either freeze or start drawing boxes with no plan. 45 minutes disappears with no coherent design and no real trade-off discussion. The fix isn\u2019t more knowledge, it\u2019s a repeatable sequence that turns a vague prompt into a bounded conversation.",
  tabs: {
    overview: {
      heading: "What is the Design Interview Framework?",
      intro: "A <strong>6-step sequence</strong>, each with a time budget, that turns an open-ended prompt into a bounded, structured conversation lasting about <strong>45-60 minutes</strong> total.",
      cards: [
        { icon: "1", title: "Requirements", color: "purple", body: "5 min: clarify scope. Ask questions. Define FR + NFR." },
        { icon: "2", title: "Estimation", color: "green", body: "5 min: users, QPS, storage, bandwidth (back-of-envelope)." },
        { icon: "3", title: "High-Level Design", color: "blue", body: "10 min: draw clients \u2192 LB \u2192 services \u2192 DB \u2192 cache." },
        { icon: "4", title: "Detailed Design", color: "orange", body: "20 min: deep-dive 2-3 critical components." },
        { icon: "5", title: "Trade-offs", color: "red", body: "5 min: alternatives, bottlenecks, failure modes." },
        { icon: "6", title: "Scaling", color: "teal", body: "5 min: how to handle 10x, 100x growth." }
      ]
    },
    realWorld: {
      heading: "Full interview walkthrough: \u201cDesign Twitter\u201d",
      intro: "Same 6 steps from Overview, run end-to-end on a real prompt so you can see how each step's output feeds the next.",
      points: [
        { label: "1. Requirements (5 min)", body: "Users post tweets, follow others, view a home timeline. NFR: 500M users, 10K tweets/sec, p99 &lt; 200ms, 99.99% availability." },
        { label: "2. Estimation (5 min)", body: "500M users \u00d7 2 tweets/day = 1B tweets/day \u00f7 100K sec \u2248 10K writes/sec. Read-heavy at a 100:1 read/write ratio. Storage: 1B \u00d7 200B = 200GB/day." },
        { label: "3. High-Level Design (10 min)", body: "Client \u2192 load balancer \u2192 tweet service \u2192 DB + cache. Timeline service reads from a fan-out cache. Media goes through S3 + CDN." },
        { label: "4. Detailed Design (20 min)", body: "Fan-out on write (push to follower timelines in Redis) vs fan-out on read (pull at read time). Hybrid: push for normal users, pull for celebrities (&gt;1M followers). Shard tweets by user_id. Timeline cache lives in Redis sorted sets." },
        { label: "5. Trade-offs (5 min)", body: "Push means fast reads but expensive writes for celebrities. Pull means cheap writes but slow reads. The hybrid balances both." },
        { label: "6. Scaling (5 min)", body: "Shard the DB by user_id, use Redis Cluster for timelines, CDN for media, Kafka for async fan-out." }
      ]
    }
  },
  keyTakeaways: [
    "Say your numbers out loud. Estimation isn\u2019t optional, it drives every later decision.",
    "Depth beats breadth: 2-3 components deep, not 10 components shallow.",
    "Always end on trade-offs and scaling. That\u2019s what separates senior from junior answers."
  ],
  proTip: "Practice this on your own: set a 45-minute timer and design \u201ca URL shortener\u201d using the 6-step budget above (5/5/10/20/5/5 min). Say your numbers out loud as you go. It's the fastest way to make this sequence muscle memory.",
  related: ["fr-nfr", "estimation", "scaling-basics"],
  bridgeOut: "The framework\u2019s first step says \u201cdefine FR + NFR\u201d without defining either. That\u2019s exactly where 1.2 starts."
};
