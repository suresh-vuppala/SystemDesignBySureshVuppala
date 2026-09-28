/* === Lesson cicd - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#cicd)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cicd"] = {
  module: 5, num: "5.9", title: "CI/CD & Deployment Strategies",
  connectsFrom: "Manual deployment is slow, error-prone, and leaves no audit trail. \u201cWho deployed what, when\u201d becomes a Slack-history archaeology exercise after every incident.",
  tabs: {
    overview: {
      heading: "From Commit to Production, Automatically",
      intro: "The goal is to ship safely without taking the site down, automating everything from commit to production. A pipeline moves code through gated stages: commit \u2192 build \u2192 unit tests \u2192 build image \u2192 deploy staging \u2192 e2e tests \u2192 promote to production (canary ramping 5% \u2192 25% \u2192 100%) \u2192 auto-rollback on breach.",
      cards: [
        { icon: "R", title: "Rolling", color: "green", body: "Replace instances one at a time. The gradual default, zero downtime." },
        { icon: "B", title: "Blue-Green", color: "blue", body: "Flip traffic instantly between two full environments; instant rollback by flipping back." },
        { icon: "C", title: "Canary", color: "orange", body: "Send a small % to the new version first, watch it, then ramp up." },
        { icon: "F", title: "Feature-Flag", color: "purple", body: "Ship code dark, then toggle it on per segment without redeploying." },
        { icon: "X", title: "Recreate", color: "red", body: "Stop old, start new. Accepts downtime, for dev/staging or apps that cannot run mixed versions." }
      ],
      table: {
        headers: ["Strategy", "Downtime", "Rollback Speed", "Risk", "Best For"],
        rows: [
          ["<strong>Rolling</strong>", "Zero", "Minutes (re-roll)", "Mixed versions during rollout", "Stateless services, K8s default"],
          ["<strong>Blue/Green</strong>", "Zero", "<strong>Instant</strong> (flip router)", "2\u00d7 cost, DB schema must be compatible", "Critical services, instant rollback needed"],
          ["<strong>Canary</strong>", "Zero", "Fast (route 0% to canary)", "Slow rollout, needs good observability", "High-traffic services, gradual confidence"],
          ["<strong>Feature Flag</strong>", "Zero", "<strong>Instant</strong> (toggle off)", "Flag debt, testing matrix grows", "Per-user rollout, A/B testing, kill switch"],
          ["<strong>Recreate</strong>", "<strong>Yes</strong>", "Redeploy old version", "Downtime during swap", "Dev/staging, stateful apps that cannot run mixed"]
        ]
      },
      callouts: [
        { color: "green", label: "Pipeline:", body: "commit \u2192 build \u2192 unit tests \u2192 image \u2192 deploy staging \u2192 e2e \u2192 promote prod (canary 5% \u2192 25% \u2192 100%) \u2192 <strong>auto-rollback on SLO breach</strong>. Use <strong>GitOps</strong> (ArgoCD/Flux) for declarative, auditable deployments." },
        { color: "yellow", label: "Real-world:", body: "<strong>Netflix</strong>, Spinnaker canary with automated analysis (Kayenta). <strong>Google</strong>, 1% \u2192 10% \u2192 50% \u2192 100% over days. <strong>Amazon</strong>, one-box deployment (single host first). <strong>GitHub</strong>, feature flags plus Scientist for safe refactoring." }
      ]
    },
    tradeoffs: {
      heading: "Deployment Anti-Patterns",
      points: [
        { label: "Manual deploys", body: "Error-prone and leave no audit trail: the exact problem CI/CD exists to solve." },
        { label: "No rollback plan", body: "\u201cWe'll fix forward\u201d fails at 3am. Without a tested rollback, every bad deploy is an outage." },
        { label: "Big-bang releases", body: "All changes at once makes it impossible to isolate which change broke production." },
        { label: "No staging environment", body: "Production becomes your test environment, and your users become your QA team." }
      ]
    },
    handsOn: {
      prerequisites: "A free GitHub account, plus GitHub Actions (free tier for public repos).",
      setup: "Local and free: a GitHub repo with a `.github/workflows/deploy.yml` pipeline. Cloud free-tier: a deploy target on Render, Railway, or Fly.io free tier.",
      simulate: "Build a pipeline with stages: run tests \u2192 build \u2192 deploy to staging \u2192 (manual approval gate) \u2192 deploy to production. Push a commit that fails a test and watch the pipeline stop before ever reaching deploy. Fix it, push again, and watch it flow through to staging automatically.",
      observe: "The pipeline's own log becomes the \u201cwho deployed what, when\u201d audit trail from the problem statement: every deploy has a commit SHA, a timestamp, and a pass/fail test result attached, automatically.",
      stretch: "Add a canary step: deploy to 1 of 3 instances first, run a smoke test against just that instance, then promote to the other 2 only if it passes, a minimal version of the 5% \u2192 25% \u2192 100% ramp."
    }
  },
  keyTakeaways: [
    "A CI/CD pipeline gates code through automated stages from commit to production, with auto-rollback on breach.",
    "5 deployment strategies: Rolling, Blue-Green, Canary, Feature-Flag, and Recreate (which accepts downtime).",
    "The pipeline log is the audit trail: every deploy carries a commit SHA, timestamp, and test result."
  ],
  proTip: "Your rollback path is more important than your deploy path. Blue-Green and Canary are valued not because they deploy fast, but because they let you undo fast when something breaks.",
  related: ["docker-k8s", "iac", "service-discovery", "serverless"],
  bridgeOut: "Every pattern here assumes a server is always running, waiting for traffic. The next lesson is the alternative that only pays for actual invocations."
};
