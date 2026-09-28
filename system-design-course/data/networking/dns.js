/* === Lesson dns - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#dns)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["dns"] = {
  module: 2, num: "2.5", title: "DNS",
  connectsFrom: "Step 2 of the journey was \u201cDNS lookup,\u201d stated without explanation. Servers are addressed by IP, but humans and configs want names, and something has to map one to the other: fast, cached, and eventually consistent across the whole planet.",
  tabs: {
    overview: {
      heading: "The Internet's Phone Book",
      intro: "DNS translates <strong>domains \u2192 IP addresses</strong>. It is hierarchical, cached at every hop, and eventually consistent. The full resolution path: <strong>browser cache \u2192 OS cache \u2192 recursive resolver \u2192 root server \u2192 TLD server \u2192 authoritative server \u2192 answer</strong>, with a TTL caching the result at every step.",
      table: {
        headers: ["Record", "Purpose", "Example", "TTL Guidance"],
        rows: [
          ["<strong>A / AAAA</strong>", "Domain \u2192 IPv4 / IPv6", "example.com \u2192 93.184.216.34", "300s (failover) to 86400s (stable)"],
          ["<strong>CNAME</strong>", "Alias to another domain", "www \u2192 example.com", "Cannot coexist with other records at apex"],
          ["<strong>ALIAS / ANAME</strong>", "CNAME at zone apex", "example.com \u2192 cdn.provider.com", "Provider-specific (Route 53, Cloudflare)"],
          ["<strong>MX</strong>", "Mail routing (priority)", "10 mail.example.com", "3600s typical"],
          ["<strong>TXT</strong>", "Verification, SPF, DKIM", "v=spf1 include:_spf.google.com", "3600s"],
          ["<strong>SRV</strong>", "Service discovery (port + weight)", "_http._tcp.example.com 8080", "Used by Consul, K8s"],
          ["<strong>NS</strong>", "Delegate to nameservers", "ns1.example.com", "86400s (rarely changes)"],
          ["<strong>CAA</strong>", "Which CAs can issue certs", "0 issue \u201cletsencrypt.org\u201d", "Security: restrict cert issuance"]
        ]
      },
      callouts: [
        { color: "purple", label: "Routing policies:", body: "Beyond a plain answer, DNS can route by policy: <strong>Simple</strong> (single IP), <strong>Weighted</strong> (70/30 split, canary rollouts), <strong>Latency-based</strong> (nearest region), <strong>Geolocation</strong> (country-based), <strong>Failover</strong> (health-check based), <strong>Multivalue</strong> (return multiple IPs). <strong>GeoDNS + Anycast</strong> together = a global load balancer." },
        { color: "green", label: "TTL strategy:", body: "<strong>Low TTL (60s)</strong> = fast failover, higher query load, good for active-passive DR. <strong>High TTL (86400s)</strong> = less load, slow propagation, good for stable records. <strong>Pre-lower the TTL</strong> before migrations (drop to 60s 24h before cutover)." }
      ]
    },
    realWorld: {
      heading: "In Production",
      points: [
        { label: "Route 53", body: "GeoDNS + health checks for multi-region failover." },
        { label: "Cloudflare 1.1.1.1", body: "Resolves in ~11ms globally." },
        { label: "Anycast", body: "The same IP announced from multiple PoPs, nearest one wins." },
        { label: "DNSSEC", body: "A cryptographic chain of trust preventing DNS spoofing (tampering), which is a different failure from staleness." }
      ]
    },
    tradeoffs: {
      heading: "Anti-Patterns",
      intro: "Most DNS outages are self-inflicted. The classics:",
      points: [
        { label: "High TTL before migration", body: "Users stuck on the old IP for hours after you cut over." },
        { label: "CNAME at apex", body: "Breaks MX and NS records, use ALIAS/ANAME instead." },
        { label: "No health checks", body: "DNS happily routes to dead servers." },
        { label: "Relying on DNS for sub-second failover", body: "TTL caching makes it impossible; a too-long TTL means a dead server keeps receiving traffic long after it is gone." }
      ]
    },
    handsOn: {
      prerequisites: "`dig` (macOS/Linux) or `nslookup` (Windows).",
      setup: "None. A free-tier DNS zone on Route 53 or Cloudflare DNS is a good stretch option if you want to edit real records.",
      simulate: "Run `dig google.com` and then `dig +trace google.com`. The second shows the full root \u2192 TLD \u2192 authoritative resolution path from the Overview, hop by hop, with the actual server IPs and TTLs at each step. Then run `dig MX google.com`, `dig TXT google.com`, and `dig NS google.com` to see 3 of the 8 record types on a real domain.",
      observe: "The TTL value returned at each hop, and how it drops on a second `dig` run within that TTL window (cached, does not re-query) versus a fresh lookup after it expires.",
      stretch: "With a free-tier Route 53 or Cloudflare DNS zone, create a Weighted or Failover routing record and query it repeatedly to watch the responses shift, the canary-rollout pattern named in the Overview, live."
    }
  },
  keyTakeaways: [
    "Resolution walks a cached hierarchy: <strong>browser \u2192 OS \u2192 resolver \u2192 root \u2192 TLD \u2192 authoritative</strong>, with a TTL at every hop.",
    "Know the record types: A/AAAA (address), CNAME (alias), MX (mail), TXT (verification), NS (delegation), CAA (cert control), and why CNAME cannot live at the apex.",
    "TTL is the core trade-off: low = fast failover but more load, high = less load but slow propagation. Pre-lower TTL before any migration."
  ],
  proTip: "DNS is <strong>eventually consistent</strong>, never treat it as a sub-second failover mechanism. If you need instant failover, that job belongs to a load balancer or Anycast, not a TTL.",
  related: ["web-request", "ip-cidr", "http-https", "service-discovery", "ddos-defense"],
  bridgeOut: "DNS resolves a name to an IP address. The next lesson is what that address actually is, and how ranges of them get carved up for a VPC."
};
