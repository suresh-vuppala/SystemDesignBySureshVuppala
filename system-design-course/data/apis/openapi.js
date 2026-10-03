/* === Lesson openapi - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#openapi)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["openapi"] = {
  module: 3, num: "3.9", title: "OpenAPI / Swagger",
  connectsFrom: "REST has no built-in way to describe itself machine-readably. OpenAPI is that missing contract layer, and it is what Messaging's Schema Registry does again for event payloads instead of REST endpoints.",
  tabs: {
    overview: {
      heading: "OpenAPI / Swagger",
      intro: "A <strong>machine-readable spec</strong> of a REST API's endpoints, params, and responses. The spec becomes a single source of truth: it drives docs, SDKs, mocks, and runtime validation. Workflow: design the spec, lint it, generate mocks and docs, then validate real responses against it.",
      table: {
        headers: ["Get", "From the spec"],
        rows: [
          ["Interactive docs", "Swagger UI, Redoc"],
          ["Client SDKs", "openapi-generator (Java/Go/TS...)"],
          ["Mock server", "Prism, Stoplight"],
          ["Contract tests", "Dredd, Schemathesis"],
          ["Gateway config", "Kong, AWS API Gateway import"]
        ]
      },
      callouts: [
        { color: "green", label: "Workflow:", body: "Design \u2192 lint (Spectral) \u2192 commit YAML \u2192 CI generates SDKs and docs \u2192 the server validates against the same spec. One spec drives docs, SDKs, mocks, and runtime validation, so they never drift apart." }
      ]
    },
    handsOn: {
      goal: "Write an OpenAPI spec for <code>/orders</code> and get a working, schema-validating mock server from it with zero handwritten server code.",
      stack: "Prism (<code>@stoplight/prism-cli</code>) via <code>npx</code>, tested with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Write the contract",
          body: "Paths, request bodies, and response schemas, all machine-readable. Save as <code>openapi.yaml</code>.",
          code: "openapi: 3.0.0\ninfo: { title: Orders API, version: 1.0.0 }\npaths:\n  /orders:\n    post:\n      requestBody:\n        required: true\n        content:\n          application/json:\n            schema:\n              type: object\n              required: [item, qty]\n              properties:\n                item: { type: string }\n                qty: { type: integer }\n      responses:\n        '201':\n          content:\n            application/json:\n              schema:\n                type: object\n                properties:\n                  id: { type: integer }\n                  item: { type: string }",
          lang: "yaml"
        },
        {
          title: "Spin up a mock server straight from the spec",
          body: "Prism reads the spec and serves responses shaped like your schema, no server code written.",
          code: "npx @stoplight/prism-cli mock openapi.yaml",
          lang: "bash"
        },
        {
          title: "Call a valid request",
          code: "curl -s -X POST localhost:4010/orders \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"item\":\"book\",\"qty\":2}'",
          lang: "bash"
        },
        {
          title: "Send a request that violates the schema",
          body: "Wrong type for <code>qty</code> and a missing required field: watch the spec get enforced.",
          code: "curl -s -X POST localhost:4010/orders \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"item\":\"book\",\"qty\":\"two\"}'",
          lang: "bash"
        }
      ],
      observe: "The valid call returns a <code>201</code> body matching your declared schema. The invalid call is rejected with a validation error naming the bad field: the spec is actively enforced, not just documentation.",
      stretch: "Run Spectral (<code>npx @stoplight/spectral-cli lint openapi.yaml</code>) against the spec and watch it flag style and convention violations automatically."
    }
  },
  keyTakeaways: [
    "OpenAPI is a <strong>machine-readable contract</strong> for a REST API's endpoints, params, and responses.",
    "One spec drives interactive docs, client SDKs, mock servers, contract tests, and gateway config.",
    "The workflow is design \u2192 lint \u2192 generate \u2192 validate, so documentation and implementation stay in sync."
  ],
  proTip: "Treat the OpenAPI spec as the source of truth, not an afterthought. When the spec generates your mocks, SDKs, and validation, drift between docs and code becomes structurally impossible.",
  related: ["rest", "soap", "api-versioning"],
  bridgeOut: "None forward directly."
};
