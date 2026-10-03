/* === Lesson api-gateway - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#api-gateway)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["api-gateway"] = {
  module: 5, num: "5.2", title: "API Gateway",
  connectsFrom: "Once an app is split into many microservices, a client would need to know 20 different addresses, and every one of those 20 services ends up reimplementing the same auth, rate-limit, and logging code.",
  tabs: {
    overview: {
      heading: "The Single Front Door",
      intro: "A gateway is a <strong>single entry point</strong>: the client sees one address, and the gateway routes each request to the right backend while handling shared concerns once. Products: Kong, Apigee, AWS API Gateway. It owns <strong>12 responsibilities</strong> in the request path.",
      cards: [
        { icon: "1", title: "Validate + Guard", color: "purple", body: "Parameter validation, allow-list / deny-list, then <strong>authentication and authorization</strong>." },
        { icon: "2", title: "Route + Limit", color: "blue", body: "Rate limiting, dynamic routing, service discovery, and protocol conversion." },
        { icon: "3", title: "Resilience", color: "orange", body: "Error handling, logging, circuit breaking, and response caching." }
      ],
      table: {
        headers: ["Pattern", "What It Does"],
        rows: [
          ["<strong>Load Balancer</strong>", "Distributes traffic with no business logic"],
          ["<strong>API Gateway</strong>", "Adds auth, rate limiting, and routing on top"],
          ["<strong>Service Mesh</strong>", "Handles service-to-service (east-west) traffic the gateway never sees"],
          ["<strong>BFF (Backends-for-Frontends)</strong>", "A separate gateway instance tailored per client type (web vs mobile), so each client gets exactly the shape it needs"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantee:", body: "An API Gateway provides a <strong>single enforcement point</strong> for cross-cutting concerns. Auth, rate limiting, logging, and circuit breaking happen once at the edge, not duplicated in every service." },
        { color: "blue", label: "North-South vs East-West:", body: "The gateway handles <strong>north-south</strong> traffic (external clients \u2192 internal services). A service mesh handles <strong>east-west</strong> traffic (internal \u2192 internal). They are complements, not competitors." }
      ]
    },
    handsOn: {
      goal: "Put a Kong gateway in front of two backends, enforce key-auth on one route plus a 5-per-minute rate limit, and prove both are applied at the edge instead of inside each service.",
      stack: "Kong (DB-less) plus 2 <code>traefik/whoami</code> backends in Docker, driven with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Start two backends on a Docker network",
          code: "docker network create kongnet\ndocker run -d --name be-orders --network kongnet traefik/whoami\ndocker run -d --name be-users --network kongnet traefik/whoami",
          lang: "bash"
        },
        {
          title: "Declare routes, auth, and the rate limit",
          body: "Save as <code>kong.yml</code>. The <code>/orders</code> route gets key-auth plus a 5/min limit; <code>/users</code> stays open.",
          code: "_format_version: \"3.0\"\nservices:\n  - name: orders\n    url: http://be-orders:80\n    routes:\n      - name: orders-route\n        paths:\n          - /orders\n    plugins:\n      - name: key-auth\n      - name: rate-limiting\n        config:\n          minute: 5\n  - name: users\n    url: http://be-users:80\n    routes:\n      - name: users-route\n        paths:\n          - /users\nconsumers:\n  - username: alice\n    keyauth_credentials:\n      - key: secret123",
          lang: "yaml"
        },
        {
          title: "Start Kong in DB-less mode",
          code: "docker run -d --name kong --network kongnet -p 8000:8000 \\\n  -v \"$PWD/kong.yml:/kong/kong.yml:ro\" \\\n  -e \"KONG_DATABASE=off\" \\\n  -e \"KONG_DECLARATIVE_CONFIG=/kong/kong.yml\" \\\n  -e \"KONG_PROXY_LISTEN=0.0.0.0:8000\" \\\n  kong:3.6",
          lang: "bash"
        },
        {
          title: "Hit the open route, then the guarded one",
          body: "<code>/users</code> needs no key; <code>/orders</code> is 401 without one and 200 with it.",
          code: "curl -s -o /dev/null -w \"users: %{http_code}\\n\" http://localhost:8000/users\ncurl -s -o /dev/null -w \"orders no key: %{http_code}\\n\" http://localhost:8000/orders\ncurl -s -o /dev/null -w \"orders with key: %{http_code}\\n\" http://localhost:8000/orders -H \"apikey: secret123\"",
          lang: "bash"
        },
        {
          title: "Trip the rate limit",
          code: "for i in $(seq 6); do curl -s -o /dev/null -w \"%{http_code}\\n\" http://localhost:8000/orders -H \"apikey: secret123\"; done",
          lang: "bash"
        }
      ],
      observe: "<code>/users</code> returns 200 with no key while <code>/orders</code> returns 401 until you pass <code>apikey: secret123</code> (auth enforced once at the edge, not per service). The 6th request within a minute returns <code>429</code>, the shared rate limit applied centrally instead of duplicated everywhere.",
      stretch: "Add a second route to the same <code>orders</code> service that trims fields for a mobile client (for example with a response-transformer plugin) alongside the full web route, a minimal BFF built at the gateway layer."
    }
  },
  keyTakeaways: [
    "An API Gateway is the single front door: one client-facing address, routing to many backends behind it.",
    "It centralizes cross-cutting concerns (auth, rate limiting, logging, circuit breaking) so services do not each reimplement them.",
    "Gateway handles north-south traffic; a mesh handles east-west; a BFF is a per-client-type gateway."
  ],
  proTip: "If you find the same auth or rate-limit code copy-pasted across services, that logic belongs at the gateway. Push cross-cutting concerns to the edge and keep services focused on business logic.",
  related: ["load-balancer", "proxy", "service-mesh", "nginx", "fault-tolerance", "serverless", "authorization"],
  bridgeOut: "The gateway is one specific flavor of a broader pattern, the proxy, that shows up again and again across this module."
};
