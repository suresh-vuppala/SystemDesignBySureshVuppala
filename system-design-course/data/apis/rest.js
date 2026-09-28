/* === Lesson rest - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#rest)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["rest"] = {
  module: 3, num: "3.1", title: "REST API",
  connectsFrom: "Networking ended on \u201cmachines can exchange bytes over HTTP,\u201d but two services still need a shared, predictable convention for how to ask for a resource and how the answer is shaped. Without one, every integration is a bespoke negotiation.",
  tabs: {
    overview: {
      heading: "REST API",
      intro: "<strong>Stateless</strong>, resource-oriented HTTP that uses verbs as the action and URLs as the resource address. It is the <strong>default choice</strong> for public APIs: universal and cacheable. A single REST URL packs 7 distinct, negotiated parts.",
      table: {
        headers: ["Part", "Example", "Notes"],
        rows: [
          ["<strong>Method</strong>", "GET / POST / PUT / DELETE", "The verb: the action being taken"],
          ["<strong>Protocol</strong>", "https://", "Always HTTPS in production"],
          ["<strong>Subdomain</strong>", "api.example.com", "Routes to the API tier"],
          ["<strong>Version</strong>", "/v1", "Preserves backward compatibility"],
          ["<strong>Endpoint</strong>", "/users", "Nouns, not verbs; plural resource names"],
          ["<strong>Filtering</strong>", "?age=25&amp;gender=male", "Query params narrow the result set"],
          ["<strong>Pagination</strong>", "?page=2&amp;limit=10", "Cursor params preferred for large datasets"]
        ]
      },
      cards: [
        { icon: "G", title: "GET", color: "green", body: "Fetch a resource. <strong>Cacheable</strong> and <strong>idempotent</strong>: safe to retry." },
        { icon: "P", title: "POST", color: "orange", body: "Create a resource. Use an <strong>idempotency key</strong> to prevent duplicates on retry." },
        { icon: "U", title: "PUT", color: "blue", body: "Replace a resource. <strong>Idempotent</strong>: the same call twice leaves the same state." },
        { icon: "D", title: "DELETE", color: "red", body: "Cancel or remove a resource. <strong>Idempotent</strong>: deleting twice is the same end state." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Statelessness</strong>: no server-side session, so any instance handles any request. <strong>Idempotency</strong> of GET/PUT/DELETE: safe to retry on failure. <strong>Cacheability</strong>: HTTP caching (CDN, browser) reduces load." },
        { color: "yellow", label: "Conventions worth following:", body: "Nouns, not verbs, in the path (<strong>/orders</strong>, not /getOrders); plural resource names; cursor pagination over offset; idempotency keys on POST." }
      ]
    },
    realWorld: {
      heading: "REST in Production",
      points: [
        { label: "Stripe API", body: "The gold standard: idempotency keys, versioning, and cursor pagination all done right." },
        { label: "GitHub API v3", body: "A large, well-documented public REST surface (v4 later moved to GraphQL)." },
        { label: "Twilio", body: "REST for SMS and voice, with clean resource modeling around messages and calls." }
      ]
    },
    tradeoffs: {
      heading: "Where REST Costs You",
      points: [
        { label: "Universally understood", body: "Every language, framework, and tool speaks HTTP verbs and JSON out of the box, and responses are cacheable by default." },
        { label: "Chatty", body: "Nested resources need multiple round trips, one request per relationship, which adds up fast." },
        { label: "Imprecise about fields", body: "A fixed response shape means clients often over-fetch or under-fetch what they actually need." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js or Python; `curl` or Postman.",
      setup: "Local and free: a minimal Express/Flask app with `GET /orders`, `POST /orders`, `GET /orders/:id`, `DELETE /orders/:id` backed by an in-memory array. Optional cloud free-tier: deploy the same app to Render, Railway, or Fly.io to test it over real HTTPS.",
      simulate: "Build the 4 endpoints following the naming conventions from Overview, then hit each with `curl -X POST`, `curl -X GET`, and `curl -X DELETE`. Confirm the status codes match each method's stated properties.",
      observe: "Call `DELETE /orders/5` twice in a row: both should leave the system in the same state (idempotent). Then call `POST /orders` twice with the same body and watch it create two different resources with two different IDs.",
      stretch: "Add cursor-based pagination to `GET /orders?after=&lt;id&gt;&amp;limit=20` and compare its behavior against a naive `?page=3&amp;size=20` version when you insert a new row mid-list: one shifts, the other does not."
    }
  },
  keyTakeaways: [
    "REST is <strong>stateless</strong>, resource-oriented HTTP: verbs are the action, URLs are the resource address.",
    "A REST URL has 7 negotiated parts: method, protocol, subdomain, version, endpoint, filtering, and pagination.",
    "It is universal and cacheable, but chatty for nested resources and imprecise about which fields a client needs."
  ],
  proTip: "Model resources as nouns and let HTTP verbs carry the action. If you find yourself writing /getUser or /createOrder, the verb belongs in the method, not the path.",
  related: ["web-request", "http-https", "grpc", "graphql", "api-versioning", "pagination", "idempotent-apis", "async-apis", "cors", "openapi", "rest-vs-graphql", "soap", "api-choice"],
  bridgeOut: "REST's cost per call, text parsing and one request per round trip, becomes a real ceiling the moment call volume is internal and high."
};
