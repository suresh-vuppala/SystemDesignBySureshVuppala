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
      goal: "Deploy a trivial Lambda, invoke it cold and then warm, and read the two durations from CloudWatch to feel the cold-start tax firsthand.",
      stack: "AWS Lambda plus the AWS CLI and CloudWatch Logs. Free cloud tier (1M requests/month).",
      steps: [
        {
          title: "Write and package the function",
          code: "cat > index.js <<'EOF'\nexports.handler = async () => ({ statusCode: 200, body: new Date().toISOString() });\nEOF\nzip function.zip index.js",
          lang: "bash"
        },
        {
          title: "Create the Lambda",
          body: "Reuse an existing Lambda execution role ARN (or create a basic one first).",
          code: "aws lambda create-function --function-name cold-start-demo \\\n  --runtime nodejs20.x --handler index.handler \\\n  --zip-file fileb://function.zip \\\n  --role arn:aws:iam::<ACCOUNT_ID>:role/<lambda-exec-role>",
          lang: "bash"
        },
        {
          title: "Invoke cold and read the Init Duration",
          body: "Wait 10+ minutes since the last activity so the runtime is torn down first.",
          code: "aws lambda invoke --function-name cold-start-demo out.json\naws logs tail /aws/lambda/cold-start-demo --since 2m | grep -E 'REPORT|Init Duration'",
          lang: "bash"
        },
        {
          title: "Invoke warm immediately after",
          code: "aws lambda invoke --function-name cold-start-demo out.json\naws logs tail /aws/lambda/cold-start-demo --since 1m | grep REPORT",
          lang: "bash"
        }
      ],
      observe: "The cold invocation's REPORT line carries an <code>Init Duration</code> (roughly 100ms to 10s depending on runtime) that the warm one does not; the warm call adds only a few ms. Put your own two numbers next to the \u201c100ms to 10s vs 1-5ms\u201d claim.",
      stretch: "Enable provisioned concurrency for a short window and confirm every invocation is now warm-speed, then add a Function URL and run <code>hey -n 5000 -c 100</code> against it while watching the <code>ConcurrentExecutions</code> metric scale up in CloudWatch, capacity you never provisioned."
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
