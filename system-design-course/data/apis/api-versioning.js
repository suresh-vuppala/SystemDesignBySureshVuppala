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
      prerequisites: "The `/orders` API from the REST lesson.",
      setup: "Local and free only.",
      simulate: "Change the response shape of `GET /orders/:id` (rename a field, say `total` \u2192 `totalAmount`) directly in place, with no versioning. Then implement it properly: keep `/v1/orders/:id` returning the old shape and add `/v2/orders/:id` returning the new one, both served from the same codebase.",
      observe: "A client hardcoded to read `total` breaks silently (reading `undefined`) against your unversioned change, while the same client keeps working against `/v1` even after `/v2` ships: the entire point of versioning, demonstrated as a before/after rather than asserted.",
      stretch: "None. This lesson's value is the before/after contrast."
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
