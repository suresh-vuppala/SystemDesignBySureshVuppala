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
      goal: "Build an async job API that returns <code>202</code> instantly, processes in the background, and lets a client poll for the result.",
      stack: "Node.js + Express with an in-memory job store, driven by <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Set up the project",
          code: "mkdir async-jobs && cd async-jobs\nnpm init -y && npm install express",
          lang: "bash"
        },
        {
          title: "Accept work immediately, finish it in the background",
          body: "<code>POST /jobs</code> returns a job id and <code>202</code> right away, then a <code>setTimeout</code> stands in for a 10-second task. <code>GET /jobs/:id</code> lets the client poll. Save as <code>server.js</code>.",
          code: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst jobs = {};\nlet nextId = 1;\n\napp.post('/jobs', (req, res) => {\n  const id = String(nextId++);\n  jobs[id] = { status: 'pending', result: null };\n  // background work: does not block the response\n  setTimeout(() => { jobs[id] = { status: 'done', result: 42 }; }, 10000);\n  res.status(202).json({ jobId: id, status: 'pending' });\n});\n\napp.get('/jobs/:id', (req, res) => {\n  const job = jobs[req.params.id];\n  if (!job) return res.status(404).json({ error: 'not found' });\n  res.json(job);\n});\n\napp.listen(3000, () => console.log('http://localhost:3000'));",
          lang: "javascript"
        },
        {
          title: "Run the server",
          code: "node server.js",
          lang: "bash"
        },
        {
          title: "Submit a job and time the response",
          body: "The response returns in milliseconds even though the work takes 10 seconds.",
          code: "curl -i -w '\\ntime: %{time_total}s\\n' -X POST localhost:3000/jobs",
          lang: "bash"
        },
        {
          title: "Poll until the job is done",
          body: "Ask every 2 seconds; status flips from <code>pending</code> to <code>done</code> after the background task finishes.",
          code: "while true; do\n  curl -s localhost:3000/jobs/1\n  echo\n  sleep 2\ndone",
          lang: "bash"
        }
      ],
      observe: "The <code>POST</code> returns in milliseconds with <code>202</code> and a <code>jobId</code>, no matter how long the real work runs. The poll loop shows <code>pending</code> for about five checks, then <code>done</code> with the result: the client never held a connection open for the full task.",
      stretch: "Swap polling for a webhook: have the background task <code>POST</code> the result to a callback URL you control (use a free tool like webhook.site to watch it land) instead of making the client keep asking."
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
