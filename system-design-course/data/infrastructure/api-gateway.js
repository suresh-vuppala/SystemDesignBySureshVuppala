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
      prerequisites: "Docker, plus Kong or a lightweight alternative (`express-gateway`, or NGINX with a Lua/JS auth module for the minimal version).",
      setup: "Local and free: `docker run -d --name kong <kong-image>` in DB-less/declarative mode, routing to 2 backend services you already built (for example the `/orders` API from Module 3 and a second mock service).",
      simulate: "Configure Kong to route `/orders/*` to service A and `/users/*` to service B, then add a rate-limiting plugin (5 requests/minute) plus a key-auth plugin on the `/orders` route only. Hit both routes with and without an API key, and hit `/orders` 6 times in a minute.",
      observe: "`/users` works with no key while `/orders` returns 401 without one, auth enforced centrally at the gateway instead of duplicated in each service's code. The 6th request to `/orders` within a minute returns 429, the shared rate-limiting concern enforced once instead of per service.",
      stretch: "Add a second route pointing to a mobile-specific mock response (fewer fields) versus the web route's full response from the same underlying service, a minimal BFF pattern built at the gateway level."
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
