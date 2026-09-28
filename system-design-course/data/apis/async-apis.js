/* === Lesson async-apis - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#async-apis)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["async-apis"] = {
  module: 3, num: "3.5", title: "Async APIs",
  connectsFrom: "Every pattern so far assumed a request finishes fast enough that the client can just wait. Some operations, like video transcoding or report generation, genuinely take minutes, and holding an HTTP connection open that long wastes a connection slot and risks a timeout before the work even finishes.",
  tabs: {
    overview: {
      heading: "Async APIs",
      intro: "For long-running tasks, <strong>accept the request immediately</strong> (return a job ID), process in the background, and let the client check back later. The initial call returns a <strong>202 Accepted</strong> plus a status URL in milliseconds, regardless of how long the real work takes.",
      table: {
        headers: ["Get the result via", "How it works", "Best for"],
        rows: [
          ["<strong>Polling</strong>", "Client calls GET /status periodically; add a Retry-After header", "Short jobs, browser apps"],
          ["<strong>Webhook</strong>", "Server POSTs the result to the client's URL; HMAC-signed", "Server-to-server (Stripe, GitHub)"],
          ["<strong>WebSocket</strong>", "Persistent connection; server pushes the result the instant it is ready", "Real-time UIs, live progress bars"]
        ]
      },
      callouts: [
        { color: "blue", label: "When to use:", body: "Image/video processing, report generation, ML inference, bulk imports: any operation that takes <strong>seconds to minutes</strong>. Do not make the client wait. Accept the request, queue the work, return a status URL." },
        { color: "yellow", label: "Three places a request can fail:", body: "Before reaching the server (network drop), mid-processing (server crash after starting), or after completing but before the response is delivered (response lost). Each needs different handling." }
      ]
    },
    realWorld: {
      heading: "Async APIs in Production",
      points: [
        { label: "Stripe", body: "Payment intents: 202 up front, then a webhook fires on completion." },
        { label: "AWS S3", body: "Multipart upload: initiate, upload parts, then complete as a separate step." },
        { label: "GitHub Actions", body: "Trigger a workflow (202), then poll or receive a webhook for the result." },
        { label: "Vercel", body: "Deploy returns 202, then the client polls build status until done." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js or Python; a job queue is optional (an in-memory array works fine for the lab).",
      setup: "Local and free only.",
      simulate: "Build `POST /jobs` that returns `{jobId, status: \u201cpending\u201d}` immediately, kicks off a fake 10-second background task (a `setTimeout`), and stores its result keyed by `jobId`. Build `GET /jobs/:id` for the client to poll. Write a client that polls every 2 seconds until `status` becomes `\u201cdone\u201d`.",
      observe: "The initial `POST` returns in milliseconds regardless of how long the actual work takes, versus what would happen if you kept that connection open for the full 10 seconds. Try it both ways and compare how each behaves if you kill the client mid-request.",
      stretch: "Swap polling for a webhook: have the background task `POST` the result to a callback URL you control (use a free tool like webhook.site to see it land) instead of making the client ask."
    }
  },
  keyTakeaways: [
    "Async APIs <strong>accept immediately</strong> (return a job ID and 202), process in the background, and let the client check back later.",
    "A request can fail in 3 places: before the server, mid-processing, or after completing but before the response arrives.",
    "Deliver the result via <strong>polling</strong>, <strong>webhook</strong>, or <strong>WebSocket</strong>, depending on latency needs and whether the client has a public endpoint."
  ],
  proTip: "If an operation can take more than a few seconds, return 202 with a status URL instead of holding the connection open. A held connection is a wasted slot and a timeout waiting to happen.",
  related: ["idempotent-apis", "realtime", "websocket-deep", "rest", "realtime-comparison", "more-decisions", "realtime-choice"],
  bridgeOut: "Every one of those 3 failure scenarios ends the same way: the client, unsure if the request succeeded, retries. Whether that retry is safe is the very next question."
};
