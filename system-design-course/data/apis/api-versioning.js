/* === Lesson api-versioning - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#api-versioning)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["api-versioning"] = {
  module: 3, num: "3.10", title: "API Versioning",
  connectsFrom: "Every API lesson so far assumed one stable shape. Versioning is what happens the day you need to change it without breaking every existing client at once.",
  tabs: {
    overview: {
      heading: "API Versioning",
      intro: "There are <strong>three places you can put a version</strong>, each with its own trade-off between visibility, cache-friendliness, and cleanliness. The URL path is the most visible and cacheable; a header keeps URLs clean; a query param is simplest but easiest to forget.",
      table: {
        headers: ["Style", "Example", "Pros", "Cons"],
        rows: [
          ["<strong>URL path</strong>", "<code>/v1/users</code>", "Cacheable, obvious, browseable", "URL churns on version bumps"],
          ["<strong>Header</strong>", "<code>Accept: application/vnd.api.v2+json</code>", "Clean URLs, native content negotiation", "Hidden, harder to test in a browser"],
          ["<strong>Query param</strong>", "<code>?version=2</code>", "Quick to try in a browser", "Pollutes cache keys"]
        ]
      },
      callouts: [
        { color: "purple", label: "Default to URL path:", body: "<strong>Default to the URL path</strong> (Stripe and GitHub do). Bump the major version only on breaking changes; add fields backward-compatibly the rest of the time so existing clients keep working." }
      ]
    },
    handsOn: {
      goal: "Ship a breaking field rename behind <code>/v2</code> while <code>/v1</code> keeps its old shape, and prove an old client survives.",
      stack: "Node.js + Express serving both versions from one codebase, tested with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir versioning-lab && cd versioning-lab\nnpm init -y && npm install express",
          lang: "bash"
        },
        {
          title: "Serve both versions from the same handler data",
          body: "<code>/v1</code> returns <code>total</code>; <code>/v2</code> renames it to <code>totalAmount</code>. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst app = express();\nconst order = { id: 5, item: 'book', amount: 42 };\n\n// v1: original shape, kept stable forever\napp.get('/v1/orders/:id', (req, res) => {\n  res.json({ id: order.id, item: order.item, total: order.amount });\n});\n\n// v2: breaking rename total -> totalAmount\napp.get('/v2/orders/:id', (req, res) => {\n  res.json({ id: order.id, item: order.item, totalAmount: order.amount });\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Run the server",
          code: "node server.js",
          lang: "bash"
        },
        {
          title: "Read the field an old client depends on, both ways",
          body: "The old client only knows about <code>.total</code>. It keeps working on v1 and reads <code>null</code> on v2.",
          code: "curl -s localhost:3000/v1/orders/5 | node -e \"process.stdin.on('data',d=>console.log('v1 total =', JSON.parse(d).total))\"\ncurl -s localhost:3000/v2/orders/5 | node -e \"process.stdin.on('data',d=>console.log('v2 total =', JSON.parse(d).total))\"",
          lang: "bash"
        }
      ],
      observe: "The v1 line prints <code>v1 total = 42</code>; the v2 line prints <code>v2 total = undefined</code> because the field was renamed. Had you renamed in place with no version, every old client would silently read <code>undefined</code>. Behind <code>/v1</code>, that same client keeps working even after <code>/v2</code> ships.",
      stretch: "Move the version from the URL path into an <code>Accept: application/vnd.api.v2+json</code> header and route on that instead, comparing how cacheable and browseable each approach is."
    }
  },
  keyTakeaways: [
    "There are three places to put a version: the <strong>URL path</strong>, a <strong>header</strong>, or a <strong>query param</strong>.",
    "URL path versioning is the most visible, cacheable, and browseable, which is why Stripe and GitHub default to it.",
    "Bump the major version only on breaking changes; add new fields backward-compatibly the rest of the time."
  ],
  proTip: "Version at the first breaking change, not before. Additive changes (new optional fields) do not need a new version; renaming or removing fields does.",
  related: ["rest", "openapi", "graphql", "rest-vs-graphql"],
  bridgeOut: "None forward directly."
};
