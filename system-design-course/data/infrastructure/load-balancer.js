/* === Lesson load-balancer - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#load-balancer)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["load-balancer"] = {
  module: 5, num: "5.1", title: "Load Balancer",
  connectsFrom: "One server dies at 2am, or just cannot keep up at peak. Running 3 copies fixes capacity, but immediately raises a new question: who decides which copy gets each request, and who notices when one copy is dead?",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "types", label: "Hardware / Software / Cloud", icon: "layers" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "What a Load Balancer Does",
      intro: "A load balancer sits in front of a server pool, checks who is healthy, and distributes requests across them. It works at one of two layers: <strong>L4</strong> (TCP, fast, reads only IP and port, blind to content) or <strong>L7</strong> (HTTP, smarter, routes by URL and headers). Products: ALB, NLB, NGINX, HAProxy.",
      images: [
        { src: "images/infrastructure/load-balancer/what-it-does.png", alt: "A load balancer in front of a pool of servers, health-checking each backend and spreading incoming requests across the healthy ones" },
        { src: "images/infrastructure/load-balancer/l4-vs-l7.png", alt: "L4 transport-layer load balancer routing on IP and port versus L7 application-layer load balancer routing on URL, headers, and cookies" },
        { src: "images/infrastructure/load-balancer/types.png", alt: "Hardware load balancer appliance versus software load balancer on commodity servers versus a managed cloud load balancer service" }
      ],
      cards: [
        { icon: "R", title: "Round Robin", color: "green", body: "Cycle through backends evenly: 1 \u2192 2 \u2192 3 \u2192 1 \u2192 2 \u2192 3. The simple default." },
        { icon: "W", title: "Weighted", color: "blue", body: "Bigger servers get proportionally more traffic (Srv 1 \u00d73 vs Srv 2 \u00d71)." },
        { icon: "L", title: "Least Connections", color: "purple", body: "Skip the busiest servers, route to whoever has the fewest open connections." },
        { icon: "H", title: "IP Hash", color: "orange", body: "hash(client IP) always maps to the same server, enabling <strong>sticky sessions</strong>." }
      ],
      table: {
        headers: ["Aspect", "L4 (Transport Layer)", "L7 (Application Layer)"],
        rows: [
          ["Works On", "<strong>IP + TCP/UDP</strong>, raw bytes, no content inspection", "<strong>HTTP, gRPC, WebSocket</strong>, reads headers, URL, cookies"],
          ["Routing By", "<strong>IP address + port</strong> only", "<strong>URL path, host, method, headers, cookies</strong>"],
          ["Speed", "<strong>Faster</strong>, no parsing overhead", "<strong>Slightly slower</strong>, inspects every request"],
          ["SSL", "<strong>Passthrough</strong>, encrypted traffic forwarded as-is", "<strong>Termination</strong>, decrypts, inspects, re-encrypts"],
          ["Sticky Sessions", "IP-based only", "<strong>Cookie / header</strong> based, more reliable"],
          ["Content Awareness", "<strong>None</strong>, blind to payload", "<strong>Full</strong>, can rewrite headers, redirect, A/B route"],
          ["Use Case", "<strong>TCP proxying</strong>, DB connections, raw throughput, gaming", "<strong>API gateway</strong>, microservices routing, canary deploys"],
          ["Examples", "<strong>AWS NLB</strong>, HAProxy (TCP mode), NGINX (stream)", "<strong>AWS ALB</strong>, NGINX (http), Envoy, Traefik, Istio"],
          ["Health Check", "TCP connect only (is the port open?)", "<strong>HTTP /health</strong> endpoint, checks actual app response"],
          ["WebSocket", "<strong>Native</strong>, TCP passthrough, no extra config", "Needs explicit <strong>Upgrade header</strong> proxying config"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>No single point of failure</strong> (if the LB itself is highly available). <strong>Health checks</strong> auto-remove unhealthy backends. <strong>SSL termination</strong> at L7 offloads crypto from backends." },
        { color: "yellow", label: "Sticky Sessions:", body: "Route the same client to the same backend. Problem: hot spots, and the session breaks when that backend dies. <strong>Better: externalize session state to Redis.</strong>" }
      ]
    },
    types: {
      heading: "Hardware, Software, and Cloud Load Balancers",
      intro: "L4 vs L7 (from the Overview) is <em>what</em> a load balancer routes on. This is a separate axis: <em>where and how</em> it actually runs. The same balancing idea ships in three deployment forms, and the choice is mostly about cost, control, and how you scale it.",
      cards: [
        { icon: "H", title: "Hardware", color: "orange", body: "A dedicated physical <strong>appliance</strong> with purpose-built ASICs. Highest throughput and lowest latency, but expensive, fixed capacity, and data-center only. <strong>F5 BIG-IP, Citrix ADC (NetScaler), A10</strong>. Common in banks, telcos, and regulated on-prem data centers." },
        { icon: "S", title: "Software", color: "green", body: "A load balancer running as software on commodity servers, VMs, or containers. Cheap or free, flexible, runs anywhere, scales by adding instances, but <strong>you</strong> operate, patch, and make it highly available. <strong>NGINX, HAProxy, Envoy, Traefik</strong>." },
        { icon: "C", title: "Cloud / Managed", color: "blue", body: "Load-balancer-as-a-service: fully managed, elastic, pay-per-use, HA across zones out of the box. Less low-level control and some provider lock-in. <strong>AWS ELB (ALB/NLB), GCP Cloud Load Balancing, Azure Load Balancer, Cloudflare</strong>." }
      ],
      table: {
        headers: ["Aspect", "Hardware", "Software", "Cloud / Managed"],
        rows: [
          ["<strong>Examples</strong>", "F5 BIG-IP, Citrix ADC, A10", "NGINX, HAProxy, Envoy, Traefik", "AWS ELB (ALB/NLB), GCP CLB, Azure LB, Cloudflare"],
          ["<strong>Runs on</strong>", "Dedicated appliance (ASICs)", "Commodity servers, VMs, containers", "Provider infrastructure"],
          ["<strong>Cost</strong>", "High upfront capex + licenses", "Low (open-source) + your ops time", "Pay-per-use opex, no upfront"],
          ["<strong>Scaling</strong>", "Buy another box (slow)", "Add instances (you manage)", "Elastic, auto-scales for you"],
          ["<strong>Performance</strong>", "Highest throughput, lowest latency", "Very good, tunable", "Very good, abstracted away"],
          ["<strong>HA / failover</strong>", "You build it (active-passive pair)", "You build it", "Built in, multi-AZ"],
          ["<strong>Control</strong>", "Full, but vendor-specific", "Full, you own the config", "Limited to provider knobs"],
          ["<strong>Best for</strong>", "On-prem / regulated, extreme throughput", "Self-managed clusters, Kubernetes, cost-sensitive", "Cloud-native apps, elastic traffic, small teams"]
        ]
      },
      callouts: [
        { color: "blue", label: "A different axis from L4 vs L7", body: "Hardware/software/cloud is <em>where the balancer runs</em>; L4/L7 is <em>what it routes on</em>. They are independent: a cloud <strong>NLB is managed and L4</strong>, a cloud <strong>ALB is managed and L7</strong>, an on-prem <strong>F5</strong> does both, and <strong>NGINX</strong> (software) does both. Do not confuse the two axes." },
        { color: "green", label: "When to choose (with real-world)", body: "<strong>Hardware</strong> for regulated or on-prem data centers needing extreme, predictable throughput (banks, telcos). <strong>Software</strong> (NGINX/HAProxy/Envoy) when you run your own servers or Kubernetes and want full control at low cost. <strong>Cloud/managed</strong> (ALB/NLB) when you are already on a cloud and want elasticity with minimal ops. Most cloud-native teams start managed and drop to software only for control the managed LB does not expose." },
        { color: "yellow", label: "The trend", body: "Software and cloud load balancers now dominate; dedicated hardware is niche (ultra-low-latency, on-prem, compliance). Service meshes push L7 balancing right next to each service as an <strong>Envoy sidecar</strong>, and CDNs like Cloudflare act as a global software load balancer at the edge." }
      ]
    },
    tradeoffs: {
      heading: "Sticky Sessions vs Stateless",
      points: [
        { label: "When sticky is unavoidable", body: "IP Hash sends every request from one client to one backend, which is sometimes required by legacy stateful apps." },
        { label: "The cost", body: "Sticky sessions reintroduce the exact stateful-server fragility Foundations warned against: hot spots, and total session loss when a backend dies." },
        { label: "The better default", body: "Externalize session state to a shared store like Redis so any backend can serve any request. Stickiness becomes an optimization, not a dependency." }
      ]
    },
    handsOn: {
      goal: "Stand up an NGINX Round Robin load balancer over 3 identical backends, watch requests spread evenly, then switch to IP Hash and watch them pin to one backend.",
      stack: "NGINX plus 3 <code>traefik/whoami</code> backends in Docker, driven with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Start 3 backends on one Docker network",
          body: "Each <code>whoami</code> backend replies with its own hostname, so you can tell which one answered.",
          code: "docker network create lbnet\ndocker run -d --name be1 --network lbnet traefik/whoami\ndocker run -d --name be2 --network lbnet traefik/whoami\ndocker run -d --name be3 --network lbnet traefik/whoami",
          lang: "bash"
        },
        {
          title: "Write a Round Robin NGINX config",
          code: "cat > nginx.conf <<'EOF'\nevents {}\nhttp {\n  upstream backends {\n    server be1:80;\n    server be2:80;\n    server be3:80;\n  }\n  server {\n    listen 80;\n    location / { proxy_pass http://backends; }\n  }\n}\nEOF",
          lang: "bash"
        },
        {
          title: "Start NGINX in front of the pool",
          code: "docker run -d --name lb --network lbnet -p 8080:80 \\\n  -v \"$PWD/nginx.conf:/etc/nginx/nginx.conf:ro\" nginx",
          lang: "bash"
        },
        {
          title: "Send 30 requests and tally who answered",
          code: "for i in $(seq 30); do curl -s http://localhost:8080/ | grep Hostname; done | sort | uniq -c",
          lang: "bash"
        },
        {
          title: "Switch to IP Hash and repeat",
          body: "Add <code>ip_hash;</code> to the upstream, reload NGINX, and rerun the loop from the same client IP.",
          code: "sed -i 's/upstream backends {/upstream backends {\\n    ip_hash;/' nginx.conf\ndocker cp nginx.conf lb:/etc/nginx/nginx.conf\ndocker exec lb nginx -s reload\nfor i in $(seq 30); do curl -s http://localhost:8080/ | grep Hostname; done | sort | uniq -c",
          lang: "bash"
        },
        {
          title: "Kill a backend and watch it drop out",
          code: "docker stop be2\nfor i in $(seq 10); do curl -s http://localhost:8080/ | grep Hostname; done | sort | uniq -c",
          lang: "bash"
        }
      ],
      observe: "Round Robin spreads the 30 requests roughly 10/10/10 across all three hostnames; IP Hash sends every one of them to a single backend (sticky sessions, seen in your own tally). After <code>docker stop be2</code>, NGINX routes only to the survivors within a few seconds as its health check drops the dead one.",
      stretch: "Switch the upstream to <code>least_conn</code>, make one backend slow (put it behind a handler that sleeps), and watch the balancer send proportionally fewer new requests to it as its open-connection count climbs."
    }
  },
  keyTakeaways: [
    "A load balancer distributes requests across a healthy pool and auto-removes dead backends via health checks.",
    "<strong>L4</strong> routes on IP and port (fast, content-blind); <strong>L7</strong> routes on URL, headers, and cookies (content-aware, can terminate SSL).",
    "The 4 algorithms: Round Robin, Weighted, Least Connections, and IP Hash (which enables sticky sessions).",
    "Three deployment forms, independent of L4/L7: <strong>hardware</strong> appliances (F5, extreme throughput, on-prem), <strong>software</strong> (NGINX/HAProxy/Envoy, flexible and self-managed), and <strong>cloud/managed</strong> (AWS ELB, elastic and low-ops)."
  ],
  proTip: "Reach for L4 when you need raw throughput or non-HTTP protocols; reach for L7 when routing decisions depend on the request content. And prefer externalized session state over sticky sessions wherever you can.",
  related: ["api-gateway", "proxy", "nginx", "service-discovery"],
  bridgeOut: "A load balancer hides which server answers, but it does not check who is asking, or stop abuse. That gap is what a gateway fills."
};
