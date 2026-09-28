/* === Lesson ddos-defense - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#ddos-defense)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["ddos-defense"] = {
  module: 2, num: "2.10", title: "DDoS Defense",
  connectsFrom: "Zero Trust assumes an attacker is already inside. A DDoS attack does not need to get inside at all: it just needs to send more traffic than your infrastructure can physically absorb, and no amount of auto-scaling helps if the flood exceeds your entire capacity ceiling.",
  tabs: {
    overview: {
      heading: "Layered Mitigation, Edge to Origin",
      intro: "DDoS defense is <strong>defense in depth</strong>: each layer strips away part of the attack so the next sees less. The capacity rule that governs all of it: <strong>the edge must absorb 10 to 100 times your peak legitimate traffic</strong>. One tool tier sits at each layer.",
      table: {
        headers: ["Layer", "Attack Type", "Defense", "Tools"],
        rows: [
          ["<strong>L3/L4 (Network)</strong>", "SYN flood, UDP amplification, ICMP flood", "Anycast absorption, scrubbing centers, BGP blackhole", "Cloudflare Magic Transit, AWS Shield Advanced"],
          ["<strong>L7 (Application)</strong>", "HTTP flood, Slowloris, cache-busting", "WAF rules, rate-limit per IP/JA3/path, geo-block", "Cloudflare WAF, AWS WAF, Akamai Kona"],
          ["<strong>Bot / Credential</strong>", "Credential stuffing, scraping, account takeover", "CAPTCHA, device fingerprint, behavioral ML", "Cloudflare Bot Mgmt, PerimeterX, DataDome"],
          ["<strong>DNS</strong>", "DNS amplification, NXDOMAIN flood", "Anycast DNS, rate-limit queries, DNSSEC", "Route 53 Shield, Cloudflare DNS"],
          ["<strong>API</strong>", "API abuse, enumeration, resource exhaustion", "API gateway rate-limit, token bucket, signed requests", "Kong, Apigee, AWS API Gateway"]
        ]
      },
      callouts: [
        { color: "green", label: "Defense in depth:", body: "<strong>Edge (Cloudflare/Shield)</strong> absorbs volumetric \u2192 <strong>WAF</strong> filters L7 \u2192 <strong>rate limiting</strong> per IP/path \u2192 <strong>bot management</strong> challenges the suspicious \u2192 <strong>app</strong> gracefully degrades under whatever remains. Each layer reduces the attack surface for the next." },
        { color: "yellow", label: "Preparation:", body: "<strong>Always-on protection</strong> (on-demand is too slow to activate). A <strong>runbook</strong> for escalation. <strong>Load test</strong> your own infrastructure to know its breaking points. <strong>Separate static assets</strong> onto a CDN, attackers cannot exhaust your origin for static content." }
      ]
    },
    realWorld: {
      heading: "Attack Types and Real Numbers",
      points: [
        { label: "Volumetric (L3/L4)", body: "SYN flood (exhaust the connection table), UDP amplification (DNS/NTP/memcached reflection), ICMP flood (saturate bandwidth). Scale: 1 to 3 Tbps at the record end. You absorb these at the edge, you cannot filter them at the app." },
        { label: "Application (L7)", body: "HTTP flood (legitimate-looking requests at scale), Slowloris (hold connections open slowly), cache-busting (unique URLs bypass the CDN). Scale: 10K to 10M RPS. Much harder to distinguish from real users." },
        { label: "Cloudflare, 2023", body: "Mitigated a <strong>71M RPS</strong> attack, a useful anchor for what \u201cbig\u201d means at L7." },
        { label: "GitHub, 2018", body: "Survived a <strong>1.35 Tbps</strong> memcached-amplification attack, the volumetric anchor." }
      ]
    },
    tradeoffs: {
      heading: "Anti-Patterns",
      points: [
        { label: "No edge protection", body: "The origin is directly exposed to the full flood." },
        { label: "On-demand only", body: "Takes 10+ minutes to activate, by which point the outage already happened." },
        { label: "Single-region", body: "No geographic distribution to spread and absorb the load." },
        { label: "Exposing the origin IP", body: "Attackers bypass the CDN and hit the origin directly." }
      ]
    },
    handsOn: {
      prerequisites: "`k6` or `hey` installed; a cloud free-tier account if you want a WAF in front of the target.",
      setup: "Local/free: your own local server behind a local rate limiter (NGINX's `limit_req` module). Cloud free-tier: a free-tier app behind AWS WAF or Cloudflare's free plan.",
      simulate: "Run `hey -n 5000 -c 200 <your-local-url>` against a plain, undefended local server and watch it fall over or slow drastically. Then add NGINX's `limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;` in front of it and re-run the exact same load.",
      observe: "Response codes shifting from mostly-200 (server overwhelmed or crashing) to a mix of 200s and <strong>429s (Too Many Requests)</strong> once the limiter is in place, the L7 defense pattern felt directly at laptop scale, standing in for the L3/L4 volumetric case that needs real edge infrastructure.",
      stretch: "With a Cloudflare free-tier zone, enable \u201cI'm Under Attack\u201d mode and observe the JS challenge page it inserts in front of your origin during the same load test."
    }
  },
  keyTakeaways: [
    "DDoS is a capacity problem, not an auth problem: the edge must absorb 10 to 100 times your peak legitimate traffic.",
    "Defend in layers: edge absorbs volumetric (L3/L4), WAF filters L7, rate-limiting and bot management thin the rest, the app degrades gracefully.",
    "Protection must be always-on and the origin IP hidden, on-demand activation and exposed origins are the classic ways defenses fail."
  ],
  proTip: "Split the attack in two when you answer: <strong>volumetric (L3/L4)</strong> is absorbed at the edge because you cannot filter terabits at the app, while <strong>application (L7)</strong> floods look like real users and need WAF, rate limits, and behavioral challenges.",
  related: ["zero-trust", "event-loop", "dns"],
  bridgeOut: "Stopping a flood at the edge is one problem. The very last Networking concept is how one thread on one machine survives 100K real, legitimate connections without drowning."
};
