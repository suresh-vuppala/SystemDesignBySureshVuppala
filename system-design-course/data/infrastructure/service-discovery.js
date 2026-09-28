/* === Lesson service-discovery - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#service-discovery)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["service-discovery"] = {
  module: 5, num: "5.8", title: "Service Discovery",
  connectsFrom: "Kubernetes constantly creates and destroys Pods, each with a new IP. Something has to let other services find the current, correct address as the fleet scales, restarts, and migrates.",
  tabs: {
    overview: {
      heading: "How Services Find Each Other",
      intro: "In a dynamic fleet, IPs change constantly, so services register themselves and look each other up through a registry. There are <strong>4 patterns</strong> for who does the lookup.",
      cards: [
        { icon: "C", title: "Client-Side", color: "blue", body: "The app's SDK queries a registry directly (Consul, Eureka) and picks an instance itself." },
        { icon: "S", title: "Server-Side", color: "green", body: "A load balancer or proxy resolves the name and routes, hiding the registry from the client." },
        { icon: "D", title: "DNS-Based", color: "orange", body: "K8s CoreDNS resolves a service name to the current Pod IPs." },
        { icon: "M", title: "Service Mesh", color: "purple", body: "A sidecar transparently intercepts and routes, no client code involved." }
      ],
      table: {
        headers: ["Tool", "Consensus", "Health Check", "Key Feature"],
        rows: [
          ["<strong>Consul</strong>", "Raft", "HTTP, TCP, gRPC, script", "Multi-DC, service mesh (Connect), KV store"],
          ["<strong>etcd</strong>", "Raft", "Lease-based TTL", "K8s backbone, strong consistency, watch API"],
          ["<strong>Eureka</strong>", "AP (peer replication)", "Heartbeat (30s default)", "Netflix OSS, self-preservation mode"],
          ["<strong>ZooKeeper</strong>", "ZAB", "Ephemeral nodes", "Mature, Kafka/Hadoop ecosystem"],
          ["<strong>AWS Cloud Map</strong>", "Managed", "Route 53 health checks", "Native AWS, API + DNS discovery"],
          ["<strong>K8s (built-in)</strong>", "etcd", "Liveness + readiness probes", "Zero setup, CoreDNS, Endpoints API"]
        ]
      },
      tables: [
        {
          title: "Discovery patterns: who resolves the lookup",
          headers: ["Pattern", "Who Resolves", "Examples", "Pros", "Cons"],
          rows: [
            ["<strong>Client-side</strong>", "App library / SDK", "Eureka + Ribbon, Consul SDK, gRPC name resolver", "No extra hop, client LB", "SDK per language, stale cache"],
            ["<strong>Server-side</strong>", "Load balancer / proxy", "AWS ALB + Cloud Map, Envoy, Istio", "Simple client, language-agnostic", "Extra hop, LB is SPOF"],
            ["<strong>DNS-based</strong>", "Stdlib DNS resolver", "K8s CoreDNS, Consul DNS, AWS Route 53", "Zero SDK, universal", "TTL caching, no health-aware LB"],
            ["<strong>Service Mesh</strong>", "Sidecar proxy (transparent)", "Istio/Envoy, Linkerd, Consul Connect", "Zero app changes, mTLS, observability", "Complexity, resource overhead"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Health checks:", body: "<strong>Health checks</strong> remove dead instances within seconds, critical for fast failover. Use <strong>liveness</strong> (is it alive?) plus <strong>readiness</strong> (can it serve traffic?) probes. Deregister unhealthy instances immediately, do not wait for TTL." },
        { color: "yellow", label: "K8s service types:", body: "<strong>ClusterIP</strong>, a stable virtual IP that kube-proxy routes (default). <strong>Headless</strong>, returns all Pod IPs (for stateful sets, client-side LB). <strong>ExternalName</strong>, a CNAME to an external service. <strong>Service Mesh</strong>, an Envoy sidecar intercepts all traffic transparently." }
      ]
    },
    tradeoffs: {
      heading: "Discovery Anti-Patterns",
      points: [
        { label: "Hardcoded IPs", body: "Break on any scale event. The moment a Pod restarts with a new IP, the caller is talking to nothing." },
        { label: "Long DNS TTL", body: "Caches stale addresses and routes to dead instances long after they are gone." },
        { label: "No health checks", body: "The registry keeps serving stale entries, sending traffic to instances that cannot answer." },
        { label: "Single registry without replication", body: "The registry itself becomes a single point of failure for the whole fleet." }
      ]
    },
    handsOn: {
      prerequisites: "Docker, plus Consul (free, official image).",
      setup: "Local and free: `docker run -d -p 8500:8500 consul agent -dev`.",
      simulate: "Register 2 instances of a mock service with Consul (`curl -X PUT` to its registration API, or a client SDK), then query Consul's DNS interface (`dig @127.0.0.1 -p 8600 myservice.service.consul`) and its HTTP API (`curl localhost:8500/v1/health/service/myservice`) for the current healthy instances. Kill one instance's health-check endpoint (return 500 instead of 200) and re-query after Consul's check interval passes.",
      observe: "The failed instance disappears from the healthy-instances list within one check interval, with zero manual deregistration: the registry actively pruning stale entries, the opposite of the \u201cno health checks\u201d anti-pattern.",
      stretch: "Hardcode one instance's IP in a client instead of querying Consul, then kill that specific instance. The client keeps trying the dead IP forever, a direct, felt version of the \u201chardcoded IPs\u201d anti-pattern."
    }
  },
  keyTakeaways: [
    "In a dynamic fleet, services register with a registry and look each other up rather than hardcoding IPs.",
    "The 4 patterns: Client-Side, Server-Side, DNS-Based, and Service Mesh; registries include Consul, etcd, Eureka, ZooKeeper, and K8s built-in.",
    "Health checks (liveness + readiness) prune dead instances within seconds, which is what makes fast failover possible."
  ],
  proTip: "Every discovery anti-pattern (hardcoded IPs, long TTL, no health checks, single registry) has the same root cause: assuming an address is stable when it is not. Always resolve fresh and check health.",
  related: ["docker-k8s", "service-mesh", "load-balancer", "dns", "cicd", "multi-region"],
  bridgeOut: "Every rollout strategy from the K8s lesson still needs an automated pipeline to actually trigger and gate it on every commit."
};
