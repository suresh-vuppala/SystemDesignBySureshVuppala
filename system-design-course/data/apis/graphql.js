/* === Lesson graphql - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#graphql)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the callouts and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["graphql"] = {
  module: 3, num: "3.3", title: "GraphQL",
  connectsFrom: "A mobile client needs 3 fields; a web client needs 15 different ones from the same resource. With a fixed REST response shape, one endpoint either over-fetches for the mobile client or under-fetches for the web client.",
  tabs: {
    overview: {
      heading: "GraphQL",
      intro: "The client specifies <strong>exactly which fields</strong> it wants, in a single request to a single endpoint, against a <strong>strongly-typed schema</strong>. No versioning, no over-fetching.",
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>No over-fetching</strong>: the client gets only the requested fields. <strong>Schema contract</strong>: the server validates queries against the schema before execution. <strong>Introspection</strong>: clients can discover available types and fields." }
      ]
    },
    realWorld: {
      heading: "GraphQL in Production",
      points: [
        { label: "GitHub API v4", body: "GitHub moved its public API from REST (v3) to GraphQL to let clients shape their own responses." },
        { label: "Shopify Storefront", body: "A GraphQL surface so storefronts fetch exactly the product and cart fields they render, nothing more." }
      ]
    },
    tradeoffs: {
      heading: "Failure Modes and Trade-offs",
      points: [
        { label: "N+1 queries", body: "A naive resolver fetches a list, then fetches each item's related data one at a time. Fixed with a batching layer like <strong>DataLoader</strong>." },
        { label: "Deep query DoS", body: "A maliciously deep or nested query can force expensive resolution. Fixed with <strong>depth limiting</strong> and query-cost analysis." },
        { label: "Caching is harder", body: "Every query can be shaped differently, so HTTP-level caching no longer maps cleanly to a URL. Complexity shifts to the server." }
      ]
    },
    handsOn: {
      goal: "Reproduce the N+1 query problem with a naive GraphQL resolver, then batch it away with DataLoader.",
      stack: "Node.js + Apollo Server + DataLoader, queried with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir gql-lab && cd gql-lab\nnpm init -y && npm pkg set type=module\nnpm install @apollo/server graphql dataloader",
          lang: "bash"
        },
        {
          title: "Define the schema and a naive resolver",
          body: "The <code>orders</code> field fires one <code>db</code> call per user. Every call is logged so you can count them. Save as <code>server.js</code>.",
          code: "import { ApolloServer } from '@apollo/server';\nimport { startStandaloneServer } from '@apollo/server/standalone';\n\nconst users = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: 'user ' + (i + 1) }));\n\n// stand-in for a per-user DB round trip\nfunction ordersForUser(id) {\n  console.log('DB call: orders for user ' + id);\n  return [{ id: id * 10, item: 'item ' + id }];\n}\n\nconst typeDefs = `#graphql\n  type Order { id: Int, item: String }\n  type User { id: Int, name: String, orders: [Order] }\n  type Query { users: [User] }\n`;\n\nconst resolvers = {\n  Query: { users: () => users },\n  User: { orders: (u) => ordersForUser(u.id) },\n};\n\nconst server = new ApolloServer({ typeDefs, resolvers });\nconst { url } = await startStandaloneServer(server, { listen: { port: 4000 } });\nconsole.log('GraphQL at ' + url);",
          lang: "javascript"
        },
        {
          title: "Run it and query 20 users with their orders",
          code: "node server.js\n# in another terminal:\ncurl -s localhost:4000 -H 'Content-Type: application/json' -d '{\"query\":\"{ users { id name orders { id item } } }\"}' > /dev/null",
          lang: "bash"
        },
        {
          title: "Count the DB calls in the server log",
          body: "You will see 1 fetch for the user list plus 20 for each user's orders: 21 round trips, the N+1 problem named in Failure Modes.",
          code: "# server terminal shows 20 lines of 'DB call: orders for user N'",
          lang: "bash"
        },
        {
          title: "Batch the lookups with DataLoader",
          body: "Wrap the per-user fetch in a loader that collects all ids in one tick and resolves them together. Swap the <code>orders</code> resolver.",
          code: "import DataLoader from 'dataloader';\n\nfunction batchOrders(ids) {\n  console.log('DB call: orders for ids ' + ids.join(','));\n  return Promise.resolve(ids.map(id => [{ id: id * 10, item: 'item ' + id }]));\n}\n\n// create one loader per request, then:\n//   User: { orders: (u, _a, ctx) => ctx.loader.load(u.id) }\n// pass context: async () => ({ loader: new DataLoader(batchOrders) })",
          lang: "javascript"
        }
      ],
      observe: "The naive version logs 20 separate <code>orders for user N</code> lines (plus the user fetch = 21 trips). After DataLoader, the same query logs a single batched <code>orders for ids 1,2,...,20</code> line: 21 round trips collapse to 2.",
      stretch: "Send a deliberately deep nested query such as <code>user { orders { user { orders { user } } } }</code> against the unprotected schema and watch resolution time balloon, then add <code>graphql-depth-limit</code> and confirm the same query is rejected before it resolves."
    }
  },
  keyTakeaways: [
    "GraphQL lets the client request <strong>exactly which fields</strong> it needs from one endpoint against a strongly-typed schema.",
    "It eliminates over-fetching and under-fetching, but shifts complexity to the server and makes HTTP caching harder.",
    "Watch for the <strong>N+1 problem</strong> (fix with DataLoader) and deep-query DoS (fix with depth limiting and cost analysis)."
  ],
  proTip: "GraphQL trades REST's caching simplicity for client-side flexibility. If your clients all need the same fixed shape, plain REST is often the calmer choice.",
  related: ["rest", "rest-vs-graphql", "grpc", "api-versioning", "web-request", "cors", "pagination", "api-choice"],
  bridgeOut: "REST and GraphQL have each made their own case. Before moving on, the practical question every design discussion actually asks: given a concrete screen, which one do you reach for, and why?"
};
