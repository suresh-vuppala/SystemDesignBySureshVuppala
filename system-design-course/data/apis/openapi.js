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
      prerequisites: "Node.js (for Prism); a text editor.",
      setup: "Local and free only.",
      simulate: "Write an `openapi.yaml` spec for the `/orders` API (paths, request/response schemas). Run it through `npx @stoplight/prism-cli mock openapi.yaml`: this spins up a working mock server directly from the spec, with zero handwritten server code. Hit it with `curl` and confirm it returns responses matching your declared schema.",
      observe: "The mock server rejecting a request that does not match your declared schema (wrong field type, missing required field): the spec is actively enforced, not just documentation.",
      stretch: "Run Spectral (`npx @stoplight/spectral-cli lint openapi.yaml`) against your spec and see it flag style and convention violations automatically."
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
