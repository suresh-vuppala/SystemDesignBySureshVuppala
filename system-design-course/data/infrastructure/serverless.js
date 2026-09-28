/* === Lesson serverless - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#serverless)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["serverless"] = {
  module: 5, num: "5.10", title: "Serverless / FaaS",
  connectsFrom: "Running a server 24/7 to handle traffic that only spikes occasionally, a nightly batch job, a rarely-used endpoint, means paying for idle capacity most of the time.",
  tabs: {
    overview: {
      heading: "Pay Per Invocation, Scale to Zero",
      intro: "Serverless is <strong>pay-per-invocation</strong> compute that scales to zero and auto-scales per request, with no servers to manage. The catch is the <strong>cold start</strong>: the first invocation after idle time downloads code and initializes a runtime (100ms to 10s, worst for JVM-based languages); a <strong>warm invocation</strong> skips that and adds only 1-5ms.",
      table: {
        headers: ["Good For", "Bad For"],
        rows: [
          ["Event-driven glue between services", "Long-running jobs (&gt;15 min limits)"],
          ["Spiky or low-volume traffic", "Sustained high RPS (cost crosses over to containers around ~1M req/day)"],
          ["Cron jobs and scheduled tasks", "Stateful or WebSocket workloads"]
        ]
      },
      callouts: [
        { color: "green", label: "Mitigate cold start:", body: "<strong>Provisioned concurrency</strong> for latency-sensitive paths. <strong>Slim runtimes</strong> (Go, Rust: 10-50ms cold start vs Java: 3-10s). <strong>SnapStart</strong> (Lambda Java, snapshot-and-restore). <strong>Init outside the handler</strong>, DB connections and SDK clients in global scope, reused across warm invocations." },
        { color: "red", label: "Anti-patterns:", body: "<strong>Lambda monolith</strong>, one giant function doing everything. <strong>Synchronous chains</strong>, Lambda \u2192 Lambda \u2192 Lambda (use Step Functions). <strong>VPC without NAT</strong>, adds 6-10s cold start. <strong>Ignoring concurrency limits</strong>, throttled at the 1000 default." },
        { color: "yellow", label: "Real-world:", body: "<strong>Netflix</strong>, Lambda for encoding pipeline triggers. <strong>Coca-Cola</strong>, vending machine backend (spiky, event-driven). <strong>iRobot</strong>, IoT event processing. <strong>Capital One</strong>, real-time fraud detection. <strong>BBC</strong>, on-demand video transcoding." }
      ]
    },
    tradeoffs: {
      heading: "When Serverless Wins and Loses",
      points: [
        { label: "Wins on spiky and low-volume", body: "You pay nothing while idle and scale instantly on a spike, ideal for event glue, cron jobs, and rare endpoints." },
        { label: "Loses on sustained load", body: "Around ~1M requests/day the per-invocation cost crosses over what a always-on container would cost." },
        { label: "The cold-start tax", body: "Latency-sensitive paths feel the first-invocation delay; provisioned concurrency and slim runtimes buy it back at a cost." }
      ]
    },
    handsOn: {
      prerequisites: "An AWS free-tier account (Lambda's free tier is generous, 1M requests/month).",
      setup: "Cloud free-tier: the AWS Lambda console, with a simple function (Node.js or Python) that just returns a timestamp.",
      simulate: "Invoke the function once after it has been idle for 10+ minutes and log the reported duration in CloudWatch (this is your cold start). Invoke it again immediately after and log that duration too (a warm invocation). Repeat with a heavier runtime (a Java function, or a Node function importing a large dependency) to feel the cold-start difference by language.",
      observe: "The stark duration gap between the cold and warm invocation: put your own two numbers next to the \u201c100ms to 10s vs 1-5ms\u201d claim. Then enable Provisioned Concurrency (within free-tier limits or a short test window to avoid cost) and confirm every invocation is now warm-speed.",
      stretch: "Run a sustained load test against the function (`hey -n 5000 -c 100`) and watch AWS Lambda's concurrency metric scale up automatically in CloudWatch: no server you provisioned, no capacity you planned for in advance."
    }
  },
  keyTakeaways: [
    "Serverless is pay-per-invocation compute that scales to zero and auto-scales per request.",
    "The cold start (100ms to 10s, worst on JVM) is the main tax; mitigate with provisioned concurrency, slim runtimes, SnapStart, and init outside the handler.",
    "Great for spiky, event-driven, low-volume work; bad for long-running, sustained high-RPS, or stateful workloads."
  ],
  proTip: "Initialize DB connections and SDK clients in global scope, outside the handler, so warm invocations reuse them. It is the single cheapest cold-start and latency win you can make.",
  related: ["cicd", "docker-k8s", "iac", "api-gateway"],
  bridgeOut: "Everything provisioned across this module has to actually be created somewhere. The next lesson is how that becomes repeatable instead of manual."
};
