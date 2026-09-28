/* === Lesson scaling-basics - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   One file per lesson for scalability; each file appends its slug's key
   to the shared window.COURSE_CONTENT object loaded by the pages that reference it. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["scaling-basics"] = {
  module: 1, num: "1.4", title: "Scaling Basics",
  connectsFrom: "You now have numeric targets to hit. The instinctive first move, \u201cbuy a bigger machine,\u201d works for a while. Then it stops working, and that ceiling is the whole reason horizontal scaling exists.",
  tabs: {
    overview: {
      heading: "Vertical vs Horizontal Scaling",
      diagram: {
        caption: "Left: one machine growing until it hits a hardware ceiling. Right: a load balancer spreading traffic across a growing pool of same-sized machines with no such ceiling.",
        svg: '<svg width="100%" viewBox="0 0 920 400" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'
          + '<defs><marker id="scv1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="var(--muted)"/></marker></defs>'
          // Left panel frame
          + '<rect x="12" y="12" width="428" height="376" rx="10" fill="rgba(251,146,60,.04)" stroke="var(--border-strong)" stroke-width="1.5"/>'
          + '<text x="226" y="38" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="800">Vertical Scaling (Scale Up)</text>'
          + '<text x="226" y="58" text-anchor="middle" fill="var(--muted)" font-size="12">Bigger machine: more CPU, RAM, IOPS</text>'
          // Ceiling annotation gets its own row, clear of the subtitle above and the box below
          + '<text x="235" y="86" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="700">Hardware ceiling</text>'
          + '<line x1="182" y1="92" x2="288" y2="92" stroke="var(--text-2)" stroke-width="1.5" stroke-dasharray="4,3"/>'
          // Small server -> big server visual
          + '<rect x="50" y="104" width="72" height="90" rx="6" fill="rgba(108,140,255,.10)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="86" y="140" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">4 CPU</text>'
          + '<text x="86" y="158" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">16 GB</text>'
          + '<text x="86" y="176" text-anchor="middle" fill="var(--muted)" font-size="11">Small</text>'
          + '<line x1="130" y1="149" x2="172" y2="149" stroke="var(--text-2)" stroke-width="2" marker-end="url(#scv1)"/>'
          + '<rect x="182" y="100" width="106" height="120" rx="8" fill="rgba(251,146,60,.12)" stroke="var(--brand-border)" stroke-width="1.8"/>'
          + '<text x="235" y="134" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">64 CPU</text>'
          + '<text x="235" y="154" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">512 GB</text>'
          + '<text x="235" y="172" text-anchor="middle" fill="var(--text)" font-size="11">NVMe SSD</text>'
          + '<text x="235" y="190" text-anchor="middle" fill="var(--muted)" font-size="11" font-weight="700">BIG</text>'
          // Vertical's pros/cons: own full-width block below the visual, one per line
          + '<text x="32" y="248" fill="var(--text)" font-size="12" font-weight="700">Pros</text>'
          + '<text x="32" y="268" fill="var(--text-2)" font-size="11">+ Simple, no code changes</text>'
          + '<text x="32" y="286" fill="var(--text-2)" font-size="11">+ No distributed-systems complexity</text>'
          + '<text x="32" y="314" fill="var(--text)" font-size="12" font-weight="700">Cons</text>'
          + '<text x="32" y="334" fill="var(--text-2)" font-size="11">- Has a hardware ceiling</text>'
          + '<text x="32" y="352" fill="var(--text-2)" font-size="11">- Single point of failure, cost rises</text>'
          + '<text x="32" y="370" fill="var(--text-2)" font-size="11">  exponentially at the top tier</text>'
          // Right panel frame
          + '<rect x="480" y="12" width="428" height="376" rx="10" fill="rgba(52,211,153,.04)" stroke="var(--border-strong)" stroke-width="1.5"/>'
          + '<text x="694" y="38" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="800">Horizontal Scaling (Scale Out)</text>'
          + '<text x="694" y="58" text-anchor="middle" fill="var(--muted)" font-size="12">More machines behind a load balancer</text>'
          // "No ceiling" annotation gets its own row, matching the vertical panel's layout
          + '<text x="694" y="86" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="700">No ceiling, add nodes as needed</text>'
          // One server -> many servers visual
          + '<rect x="514" y="104" width="62" height="62" rx="5" fill="rgba(108,140,255,.10)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="545" y="130" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server</text>'
          + '<text x="545" y="148" text-anchor="middle" fill="var(--muted)" font-size="10">4 CPU</text>'
          + '<line x1="584" y1="135" x2="620" y2="135" stroke="var(--text-2)" stroke-width="2" marker-end="url(#scv1)"/>'
          + '<rect x="632" y="100" width="66" height="46" rx="4" fill="rgba(52,211,153,.12)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="665" y="128" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Srv 1</text>'
          + '<rect x="706" y="100" width="66" height="46" rx="4" fill="rgba(52,211,153,.12)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="739" y="128" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Srv 2</text>'
          + '<rect x="780" y="100" width="66" height="46" rx="4" fill="rgba(52,211,153,.12)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="813" y="128" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Srv 3</text>'
          + '<rect x="632" y="154" width="66" height="46" rx="4" fill="rgba(52,211,153,.12)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="665" y="182" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Srv 4</text>'
          + '<rect x="706" y="154" width="66" height="46" rx="4" fill="rgba(52,211,153,.12)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="739" y="182" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Srv 5</text>'
          + '<rect x="780" y="154" width="66" height="46" rx="4" fill="rgba(52,211,153,.08)" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="3,2"/>'
          + '<text x="813" y="182" text-anchor="middle" fill="var(--muted)" font-size="11">+ more</text>'
          // Horizontal's pros/cons: own full-width block below the visual, one per line
          + '<text x="500" y="248" fill="var(--text)" font-size="12" font-weight="700">Pros</text>'
          + '<text x="500" y="268" fill="var(--text-2)" font-size="11">+ Unlimited scale, add nodes as needed</text>'
          + '<text x="500" y="286" fill="var(--text-2)" font-size="11">+ Fault tolerant: one node dies, others serve</text>'
          + '<text x="500" y="314" fill="var(--text)" font-size="12" font-weight="700">Cons</text>'
          + '<text x="500" y="334" fill="var(--text-2)" font-size="11">- Distributed-systems complexity,</text>'
          + '<text x="500" y="352" fill="var(--text-2)" font-size="11">  harder consistency across nodes</text>'
          + '<text x="500" y="370" fill="var(--text-2)" font-size="11">- Cost grows roughly linearly per node</text>'
          + '</svg>'
      },
      table: {
        headers: ["Vertical (Scale Up)", "Horizontal (Scale Out)"],
        rows: [
          ["Bigger machine (more CPU/RAM/IOPS)", "More machines behind a load balancer"],
          ["<strong>Simple</strong>, no code changes", "<strong>Unlimited</strong>, add nodes as needed"],
          ["<strong>Has a ceiling</strong>, biggest machine has limits", "<strong>Complex</strong>, distributed state and consistency"],
          ["Single point of failure", "Fault tolerant (node dies, others serve)"]
        ]
      },
      cards: [
        { icon: "\u2191", title: "Vertical Scaling (Scale Up)", color: "purple", body: "A bigger machine: more CPU/RAM/IOPS. Simple, no code changes, but has a hardware ceiling and remains a single point of failure. Cost rises exponentially at the top tier." },
        { icon: "\u2194", title: "Horizontal Scaling (Scale Out)", color: "teal", body: "More machines behind a load balancer. No ceiling, survives node failure, but introduces every distributed-systems problem vertical scaling never had to face." }
      ]
    },
    tradeoffs: {
      heading: "Simple but capped, vs unlimited but complex",
      points: [
        { label: "Vertical's real cost", body: "Simple, but capped and fragile: one machine dying takes the whole service down." },
        { label: "Horizontal's real cost", body: "Unlimited, but you now own everything Modules 9-11 teach: consistency, coordination, and partial failure across nodes." },
        { label: "The guarantee that makes it worth it", body: "Doubling nodes roughly doubles capacity, because each node handles an independent subset of traffic. That near-<strong>linear throughput growth</strong> is what horizontal scaling buys you in exchange for the added complexity." }
      ]
    },
    handsOn: {
      prerequisites: "Docker installed.",
      setup: "Local/free: run 3 copies of a simple HTTP server in Docker (docker run -d -p 8081:80 nginx, -p 8082:80, -p 8083:80). Cloud free-tier: an AWS EC2 t2.micro / GCP e2-micro free-tier instance running the same app, resized up once (t2.micro \u2192 t2.medium) to feel the vertical ceiling directly.",
      simulate: "Load-test a single instance with k6 or hey at increasing concurrency (100 \u2192 500 \u2192 2,000 concurrent) until latency degrades or it errors out. That's the vertical ceiling. Then put the 3 Docker instances behind a simple round-robin proxy (NGINX or HAProxy) and re-run the same 2,000 concurrent test.",
      observe: "The single instance\u2019s p99 climbing sharply near its ceiling, versus the 3-instance setup handling the same load with flatter p99. The \u201croughly linear throughput growth\u201d claim, observed directly.",
      stretch: "Kill one of the 3 backend containers mid-test and watch the load balancer keep serving from the other two. The survives-node-failure property vertical scaling structurally can\u2019t offer."
    }
  },
  keyTakeaways: [
    "<strong>Vertical scaling</strong> is simple but hits a hardware ceiling and stays a single point of failure.",
    "<strong>Horizontal scaling</strong> has no ceiling and survives node failure, but you inherit distributed-systems complexity."
  ],
  proTip: "Always check if vertical scaling buys you enough headroom before reaching for horizontal complexity. [SEE 15.6] for the full decision tree.",
  related: ["nfr-metrics", "stateless-stateful", "auto-scaling", "concurrency-io", "sd-framework"],
  bridgeOut: "\u201cAny server can answer any request\u201d sounds simple, until you ask what happens to a logged-in user\u2019s session the moment their next request lands on a different server."
};
