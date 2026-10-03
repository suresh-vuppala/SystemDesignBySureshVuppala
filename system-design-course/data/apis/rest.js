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
      goal: "Build a minimal REST <code>/orders</code> API with four endpoints and prove that DELETE is idempotent while POST is not.",
      stack: "Node.js + Express, tested with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Create the project and install Express",
          code: "mkdir rest-orders && cd rest-orders\nnpm init -y && npm install express",
          lang: "bash"
        },
        {
          title: "Write the four resource endpoints",
          body: "Nouns in the URL, verbs in the HTTP method. Back it with an in-memory array. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet orders = [];\nlet nextId = 1;\n\n// list all\napp.get('/orders', (req, res) => res.json(orders));\n\n// create (not idempotent: each call makes a new resource)\napp.post('/orders', (req, res) => {\n  const order = { id: nextId++, ...req.body };\n  orders.push(order);\n  res.status(201).json(order);\n});\n\n// read one\napp.get('/orders/:id', (req, res) => {\n  const order = orders.find(o => o.id === Number(req.params.id));\n  if (!order) return res.status(404).json({ error: 'not found' });\n  res.json(order);\n});\n\n// delete (idempotent: same end state every time)\napp.delete('/orders/:id', (req, res) => {\n  orders = orders.filter(o => o.id !== Number(req.params.id));\n  res.status(204).end();\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Run the server",
          code: "node server.js",
          lang: "bash"
        },
        {
          title: "Exercise each verb and watch the status codes",
          code: "curl -i -X POST localhost:3000/orders -H 'Content-Type: application/json' -d '{\"item\":\"book\"}'\ncurl -i localhost:3000/orders/1\ncurl -i localhost:3000/orders",
          lang: "bash"
        },
        {
          title: "Prove idempotency vs non-idempotency",
          body: "DELETE the same id twice: both leave the system identical. POST the same body twice: two different ids appear.",
          code: "curl -i -X DELETE localhost:3000/orders/1\ncurl -i -X DELETE localhost:3000/orders/1\ncurl -s -X POST localhost:3000/orders -H 'Content-Type: application/json' -d '{\"item\":\"pen\"}'\ncurl -s -X POST localhost:3000/orders -H 'Content-Type: application/json' -d '{\"item\":\"pen\"}'",
          lang: "bash"
        }
      ],
      observe: "POST returns <code>201</code> with a fresh <code>id</code> each time, so two identical bodies create two distinct resources. DELETE returns <code>204</code> both times and the collection is identical after each call: that sameness is idempotency.",
      stretch: "Add cursor pagination to <code>GET /orders?after=&lt;id&gt;&amp;limit=20</code> and compare it to a naive <code>?page=3&amp;size=20</code>: insert a new row mid-list and watch the offset version shift results while the cursor version stays stable."
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
