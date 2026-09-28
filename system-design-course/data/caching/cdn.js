/* === Lesson cdn - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#cdn)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.12.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cdn"] = {
  module: 7, num: "7.12", title: "CDN",
  connectsFrom: "A user 8,000 miles from your origin pays for that entire round trip on every request, even for content that never changes. A CDN moves the cache to the edge, next to the user.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "scaling", label: "Scaling Ladder", icon: "layers" },
    { key: "edge", label: "Edge Compute", icon: "cpu" },
    { key: "realWorld", label: "Real-World", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Caching at the Network Edge",
      intro: "A globally distributed network of <strong>edge PoPs</strong> serves content close to users, improving <strong>latency</strong>, <strong>throughput</strong> (origin offload), and <strong>availability</strong>, at the cost of <strong>consistency</strong> (cache freshness) and invalidation complexity. Two fill models: Pull (lazy) vs Push (proactive).",
      cards: [
        { icon: "P", title: "Pull CDN (Lazy)", color: "blue", body: "Caches on first request. User \u2192 edge (miss) \u2192 origin \u2192 edge caches \u2192 user; the next request is a hit in &lt;10ms. First request is slow (cold start)." },
        { icon: "U", title: "Push CDN (Proactive)", color: "green", body: "Pre-populates every PoP before traffic arrives. Always a hit (&lt;5ms), zero cold starts, but you pay storage and must know what to push." },
        { icon: "S", title: "Shield layer", color: "purple", body: "An intermediate cache that collapses duplicate misses: 100 PoPs missing become 1 origin request, not 100." }
      ],
      callouts: [
        { color: "green", label: "What a CDN guarantees:", body: "<strong>Low latency</strong> (&lt;50ms from edge). <strong>DDoS absorption</strong> at the edge. <strong>Origin offload</strong>. Edge computing (Cloudflare Workers) runs logic at the edge." }
      ]
    },
    scaling: {
      heading: "The Four-Tier Scaling Ladder",
      intro: "CDN maturity is a ladder: each tier adds a layer as traffic grows, and the hit ratio climbs with it. Find where your traffic sits, and what the next rung buys you.",
      table: {
        headers: ["Tier", "Scale", "Architecture", "Real Products"],
        rows: [
          ["<strong>Tier 1: No CDN</strong>", "&lt;10K req/day", "Browser cache only, Cache-Control headers", "~200ms global avg, $0/mo"],
          ["<strong>Tier 2: Pull CDN</strong>", "10K to 100M req/day", "Edge PoPs + origin, 90%+ hit ratio", "Cloudflare, CloudFront"],
          ["<strong>Tier 3: Multi-Tier</strong>", "100M to 1B req/day", "Edge \u2192 shield \u2192 origin, 97%+ hit", "Fastly, Akamai"],
          ["<strong>Tier 4: Custom CDN</strong>", "1B+ req/day", "CDN boxes inside ISPs, 99%+ hit, edge compute", "Netflix Open Connect"]
        ]
      },
      callouts: [
        { color: "green", label: "Scaling principles:", body: "<strong>Shield layer</strong> collapses duplicate misses (100 PoPs miss \u2192 1 origin request). <strong>Tiered TTLs</strong> (edge 60s, shield 5min, origin 1h). <strong>Request coalescing</strong> (1,000 users on one uncached asset \u2192 1 origin request). <strong>Stale-while-revalidate</strong> serves stale and refreshes async." },
        { color: "yellow", label: "The headline metric is hit ratio:", body: "Always cite <strong>cache hit ratio</strong> as the key CDN metric. A 1% gain from 95% to 96% is 20% fewer origin requests. At Netflix scale (100B+ req/day), that is billions of saved origin calls." }
      ]
    },
    edge: {
      heading: "Edge Compute and Advanced Caching",
      intro: "Once content is at the edge, two frontiers open up: running logic there, and layering caches so a request rarely reaches the origin at all.",
      callouts: [
        { color: "blue", label: "Content delivery and edge compute:", body: "<strong>CDN</strong> caches static assets at edge PoPs (Cloudflare, CloudFront). <strong>Edge computing</strong> runs logic at the edge (Cloudflare Workers, Lambda@Edge, Vercel Edge Functions). Use for A/B testing, geo-routing, auth token validation, personalization. Reduces origin load and latency. Limitation: limited runtime, no persistent state at the edge." },
        { color: "purple", label: "Advanced caching techniques:", body: "<strong>Cache warming</strong> pre-populates before a spike (product launch, Black Friday). <strong>Multi-level</strong>: L1 (in-process, Caffeine) \u2192 L2 (Redis) \u2192 L3 (CDN). <strong>CDC invalidation</strong> turns a DB change into a real-time key invalidation. <strong>Stale-while-revalidate</strong> serves stale, refreshes in background." }
      ]
    },
    realWorld: {
      heading: "CDNs at Real Scale",
      points: [
        { label: "Netflix Open Connect", body: "A custom CDN with boxes inside ISPs, serving 95%+ of traffic from ISP-local hardware, the Tier 4 endgame." },
        { label: "Cloudflare", body: "300+ PoPs serving 20%+ of the web, with Workers for edge compute." },
        { label: "CloudFront", body: "400+ PoPs with Lambda@Edge for running logic at the edge (A/B testing, geo-routing, auth token validation)." }
      ]
    },
    tradeoffs: {
      heading: "Pitfalls at Scale",
      points: [
        { label: "Thundering herd", body: "A hot key expires and all PoPs hit the origin at once. Fix: jittered TTLs plus request coalescing." },
        { label: "Cache stampede", body: "A popular item is invalidated during a traffic spike. Fix: a lock plus stale-while-revalidate so users keep getting the stale copy while one refresh runs." },
        { label: "Purge storms", body: "A mass invalidation overloads the origin. Fix: soft purge, serve stale and refresh async, instead of hard, immediate invalidation." },
        { label: "Dynamic content limits", body: "Personalized content is hard to cache, and edge runtimes have limited compute with no persistent state at the edge." }
      ]
    },
    handsOn: {
      prerequisites: "A Cloudflare free-tier account (or AWS free-tier CloudFront).",
      setup: "Cloud free-tier: point a free Cloudflare zone at a small static site, or set up a CloudFront distribution in front of an S3 bucket (both free-tier eligible).",
      simulate: "Request a static asset (an image) through the CDN twice in a row and check the response header (`cf-cache-status` on Cloudflare, `x-cache` on CloudFront): the first request shows a miss, the second a hit. Then purge the cache and immediately request it again from 2 different locations (a VPN or an online multi-region curl service) roughly simultaneously.",
      observe: "The cache-status header flipping from MISS to HIT, and the measurable latency drop between the two requests, a real number next to \u201cavoid the round trip\u201d instead of just asserting it. If your plan exposes it, check the analytics dashboard for cache hit ratio and compare against the 95%/96% anchor from 7.1.",
      stretch: "None. CDN behavior at true multi-PoP, shield-layer scale is not reproducible on a free tier; this lab demonstrates the core cache-at-the-edge mechanism, not the full scaling ladder."
    }
  },
  keyTakeaways: [
    "A CDN caches content at globally distributed edge PoPs, cutting latency and offloading the origin; Pull fills lazily on first request, Push pre-populates every PoP.",
    "Scaling leans on a shield layer, tiered TTLs, request coalescing, and stale-while-revalidate, forming a four-tier ladder from no CDN up to custom ISP-embedded CDNs.",
    "Cache hit ratio is the headline metric: small gains near 95% translate into huge reductions in origin traffic at scale."
  ],
  proTip: "For mass invalidations, prefer soft purge over hard purge: keep serving the stale copy while a background refresh runs, so a routine content update never turns into a purge storm that hammers your origin.",
  related: ["caching", "cache-invalidation", "redis-cache", "memcached-vs-redis", "cache-choice", "scaling-choice", "proxy", "blob"],
  bridgeOut: "Caching solves \u201cavoid a repeated read.\u201d The next gap is services that need to tell each other something happened, which a cache alone cannot do."
};
