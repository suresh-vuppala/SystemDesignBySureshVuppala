/* === Lesson rest-vs-graphql - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#rest, #graphql)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.4.
   A situation-first comparison: who controls the response shape, and what
   operational bill each choice carries. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["rest-vs-graphql"] = {
  module: 3, num: "3.4", title: "REST vs GraphQL",
  connectsFrom: "REST (3.1) and GraphQL (3.3) each made their own case in isolation. The useful skill is not declaring a winner; it is knowing, from the shape of the screen and who owns the response, which one a concrete situation calls for. They solve slightly different API problems.",
  tabs: {
    overview: {
      heading: "Who Controls the Shape of the Response?",
      intro: "REST and GraphQL are not \u201cbetter or worse\u201d; they answer a different question: <strong>who decides the shape of the response?</strong> With REST the <strong>server</strong> defines the resources and the representation you can GET. With GraphQL the <strong>client</strong> asks for exactly the fields it needs. Almost every REST-vs-GraphQL decision comes down to that one axis, plus the operational bill each choice carries.",
      cards: [
        { icon: "R", title: "REST (server decides)", color: "blue", body: "The <strong>server</strong> defines each resource and its representation. <code>GET /users/123</code> returns a server-shaped response. Resource-oriented and HTTP-native: verbs, status codes, and caching come for free." },
        { icon: "G", title: "GraphQL (client decides)", color: "purple", body: "The <strong>client</strong> sends a query for exactly the fields it needs from a <strong>single endpoint</strong>, and the server returns that shape. One request can pull a graph of data spanning many backend services." },
        { icon: "+", title: "They coexist", color: "green", body: "Not mutually exclusive. A common pattern: <strong>GraphQL for the data graph, REST for the file</strong>. Get a document\u2019s metadata via GraphQL, then download its bytes from a REST or object-storage URL." }
      ],
      table: {
        headers: ["Situation", "Natural fit"],
        rows: [
          ["Complex frontend screens", "<strong>GraphQL</strong>"],
          ["Multiple clients with different data needs", "<strong>GraphQL</strong>"],
          ["Data aggregated from many services", "<strong>GraphQL</strong>"],
          ["Rapidly changing frontend requirements", "<strong>GraphQL</strong>"],
          ["Simple CRUD APIs", "<strong>REST</strong>"],
          ["Resource-oriented APIs", "<strong>REST</strong>"],
          ["File upload / download / streaming", "<strong>REST / HTTP</strong>"],
          ["Simple public APIs", "<strong>REST</strong>"],
          ["Strong use of HTTP caching semantics", "<strong>REST</strong>"]
        ]
      },
      callouts: [
        { color: "blue", label: "The mental model", body: "<strong>REST</strong>, the server says: \u201chere are the resources and the representation you can get.\u201d <strong>GraphQL</strong>, the client says: \u201chere is exactly the data I need.\u201d That single shift in who owns the response shape explains almost every other difference." },
        { color: "yellow", label: "It is not really \u201cGraphQL vs REST\u201d", body: "The useful system-design question is not which to crown. It is <strong>who should control the shape of the response, how complex is the data graph, and what operational trade-offs do we want?</strong> Answer those three and the choice names itself." }
      ]
    },
    realWorld: {
      heading: "Six Situations, Two Fits",
      intro: "The fastest way to internalize the choice is by situation, not definition. Watch the pattern: GraphQL wins when the <strong>screen</strong> drives the data and it comes from many places; REST wins when the <strong>resource</strong> is well-defined and HTTP is doing real work.",
      points: [
        { label: "E-commerce product page \u2192 GraphQL", body: "A product screen needs name, price, images, rating, seller, inventory, reviews, and recommendations, sourced from separate <strong>Product</strong>, <strong>Review</strong>, and <strong>Recommendation</strong> services. The web app asks for exactly that graph in one query; the mobile app asks for a smaller subset (say name, price, rating) without anyone building a new endpoint." },
        { label: "Social / news feed \u2192 GraphQL", body: "One screen needs the user plus posts (author, text, likes, comments) plus connections plus recommendations. REST would be <code>GET /me</code>, <code>/me/posts</code>, <code>/me/connections</code>, <code>/recommendations</code>, several round trips. GraphQL fetches the whole graph in one request. That is where the \u201cGraph\u201d in GraphQL becomes intuitive." },
        { label: "Banking dashboard \u2192 GraphQL", body: "Account balance + last 5 transactions + credit card (balance, dueDate) + rewards on a single screen is either <strong>4 REST calls</strong> or a bespoke <code>GET /dashboard</code> that every new client bends out of shape or over-fetches from. One GraphQL query shaped to the screen avoids both problems." },
        { label: "Simple CRUD (employees) \u2192 REST", body: "<code>POST /employees</code>, <code>GET /employees/123</code>, <code>PUT /employees/123</code>, <code>DELETE /employees/123</code>. The resource is well-defined, clients need the same representation, and there is no complex graph to assemble. GraphQL adds machinery you would not use." },
        { label: "File upload / download \u2192 REST / HTTP", body: "Uploading a 50 MB PDF or streaming a video leans on what HTTP already gives you: streaming, content types, status codes, <strong>range requests</strong>, caching, and CDN integration. GraphQL is not a file-transfer protocol, so the real shape is: GraphQL for the metadata, then a REST or object-storage URL for the bytes." },
        { label: "Public API (weather) \u2192 REST", body: "For thousands of external developers, <code>GET /weather/current</code> and <code>GET /weather/forecast</code> give a familiar HTTP + URLs + methods + status-codes contract. GraphQL\u2019s flexibility would force you to police query complexity, depth, field-level authorization, and caching for untrusted callers." }
      ]
    },
    tradeoffs: {
      heading: "GraphQL's Flexibility Has a Bill",
      intro: "Letting the client shape the response is powerful, and it moves real cost onto the server. GraphQL does <strong>not</strong> make any single call faster; it changes who assembles the response, and that comes with four bills.",
      points: [
        { label: "Query complexity and depth", body: "A client can ask <code>friends { friends { friends { friends } } }</code> and detonate the server. You need <strong>depth limits</strong>, <strong>complexity/cost scoring</strong>, and timeouts, protections a fixed REST endpoint never needs because the server already decided the shape." },
        { label: "The N+1 problem", body: "Request 100 posts, each needing its author, and a naive resolver runs <strong>1 query for the posts + 100 for the authors = 101 queries</strong>. The fix is batching with <strong>DataLoader</strong>, which collapses the 100 author lookups into 1, bringing the total to 2." },
        { label: "Caching", body: "REST gets HTTP caching and CDN almost for free on a <code>GET</code> keyed by URL. GraphQL usually <code>POST</code>s to a single endpoint, so you lose URL-based caching and lean on <strong>persisted queries</strong> and a normalized client cache instead." },
        { label: "Authorization and observability", body: "REST authorizes and meters per endpoint. GraphQL needs <strong>field-level</strong> authorization and per-field cost accounting, because one query can touch many resources at once. Rate limiting by request count no longer means much when one request can be 10x heavier than another." }
      ],
      callouts: [
        { color: "yellow", label: "The question that actually matters", body: "Not \u201cGraphQL or REST?\u201d but <strong>\u201cwho should control the shape of the response, how complex is the data graph, and what operational trade-offs do we accept?\u201d</strong> Answer those and the choice names itself, and the two happily coexist in one system." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js; a GraphQL server (Apollo Server) and a tiny REST server (Express).",
      setup: "Local and free. Model a product whose fields come from 2 to 3 in-memory \u201cservices\u201d (product, reviews, recommendations).",
      simulate: "Expose the product both ways: a GraphQL schema, and REST endpoints (<code>/product/:id</code>, <code>/product/:id/reviews</code>, <code>/product/:id/recommendations</code>). Fetch one screen\u2019s data (name, price, reviews) via a single GraphQL query, then via REST, and count the round trips. Then deliberately build the N+1: resolve 100 posts where each fetches its author with a per-author query, and log the query count.",
      observe: "The GraphQL screen fetch is <strong>1 request shaped exactly to the fields you asked for</strong>, versus multiple REST calls or an over-fetching <code>/dashboard</code>. Then watch the naive resolver fire <strong>101 queries</strong> for 100 posts; add a DataLoader to batch the authors and watch it drop to 2.",
      stretch: "Add a query <strong>depth limit</strong> (say max depth 5) and a cost limit to the GraphQL server, then send a deeply nested friends-of-friends query and confirm the server rejects it before touching the database, the exact protection a fixed REST endpoint never needs."
    }
  },
  keyTakeaways: [
    "The axis is <strong>who controls the response shape</strong>: REST = server-defined representation; GraphQL = the client asks for exactly the fields it needs.",
    "GraphQL shines when a <strong>screen</strong> needs a graph of data from many services and different clients need different fields; REST shines for well-defined resources, files/streaming, and simple public APIs with strong HTTP caching.",
    "GraphQL\u2019s flexibility costs you query-complexity limits, the <strong>N+1 problem</strong> (fix with DataLoader batching), harder caching, and field-level authorization.",
    "They coexist: GraphQL for the data graph, REST/HTTP for downloads and cache-friendly public endpoints."
  ],
  proTip: "In an interview, never answer \u201cGraphQL or REST\u201d with a winner. Ask \u201cwho owns the response shape, how connected is the data, and what operational cost can we carry?\u201d Then place each where it fits, they belong in the same system.",
  related: ["rest", "graphql", "grpc", "api-choice", "api-versioning", "pagination"],
  bridgeOut: "REST and GraphQL both still assume the client waits for one response. The next lesson is what to do when the work genuinely takes minutes and waiting is not an option: async APIs."
};
