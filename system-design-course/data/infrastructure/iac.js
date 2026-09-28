/* === Lesson iac - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#iac)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.11.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["iac"] = {
  module: 5, num: "5.11", title: "Infrastructure as Code",
  connectsFrom: "Manually clicking through a cloud console to create infrastructure is not reviewable, is not repeatable, and drifts silently from whatever is actually documented.",
  tabs: {
    overview: {
      heading: "Version-Control Your Cloud",
      intro: "IaC means version-controlling cloud infrastructure the same way you version-control app code, making it <strong>reproducible</strong>, <strong>auditable</strong>, and <strong>reviewable</strong>. Tools split by approach: <strong>declarative</strong> (Terraform, OpenTofu, CloudFormation), <strong>imperative-as-code</strong> (Pulumi, AWS CDK, real code generating the declarative output), and <strong>reconciliation-loop</strong> (Crossplane, Kubernetes-native).",
      table: {
        headers: ["Tool", "Language", "Approach", "State", "Strength"],
        rows: [
          ["<strong>Terraform</strong>", "HCL (declarative)", "Plan \u2192 Apply", "S3 + DynamoDB lock / TF Cloud", "Multi-cloud, huge provider catalog, modules"],
          ["<strong>OpenTofu</strong>", "HCL (declarative)", "Plan \u2192 Apply", "Same as Terraform", "Open-source fork, community-driven"],
          ["<strong>CloudFormation</strong>", "YAML/JSON", "Stack-based", "AWS-managed (free)", "Native AWS, drift detection, StackSets"],
          ["<strong>Pulumi</strong>", "TS/Python/Go/C#", "Real code", "Pulumi Cloud / self-managed", "Loops, tests, abstractions, type safety"],
          ["<strong>AWS CDK</strong>", "TS/Python/Java/Go", "Synthesizes to CFN", "CloudFormation", "L2/L3 constructs, AWS-blessed patterns"],
          ["<strong>Crossplane</strong>", "YAML (K8s CRDs)", "Reconciliation loop", "K8s etcd", "GitOps-native, K8s-first, compositions"]
        ]
      },
      callouts: [
        { color: "green", label: "GitOps workflow:", body: "PR \u2192 <code>plan</code> in CI (diff visible in the PR comment) \u2192 team review \u2192 <code>apply</code> on merge. State in <strong>S3 + DynamoDB lock</strong> or Terraform Cloud. Use <strong>workspaces</strong> or <strong>directory structure</strong> for environment separation." },
        { color: "yellow", label: "Testing IaC:", body: "<strong>tflint</strong>, lint HCL for errors. <strong>checkov / tfsec</strong>, security scanning (open S3 buckets, missing encryption). <strong>terratest</strong>, integration tests (deploy, validate, destroy). <strong>OPA/Sentinel</strong>, policy-as-code (enforce tagging, region restrictions)." },
        { color: "blue", label: "Real-world:", body: "<strong>HashiCorp</strong>, Terraform manages millions of cloud resources globally. <strong>Shopify</strong>, CDK for AWS infrastructure. <strong>Uber</strong>, custom IaC for multi-cloud. <strong>GitLab</strong>, Terraform plus GitOps for all infrastructure changes." }
      ]
    },
    tradeoffs: {
      heading: "IaC Anti-Patterns",
      points: [
        { label: "ClickOps", body: "Manual console changes that drift from code. The state file and reality quietly diverge until something breaks." },
        { label: "Mega-stack", body: "One state file for everything is slow to plan and risky: a small change re-evaluates the entire estate." },
        { label: "Secrets in state", body: "The state file can contain sensitive values in plaintext; it must be encrypted and access-controlled." },
        { label: "No locking", body: "Concurrent applies corrupt state. Remote state with locking (S3 + DynamoDB) prevents two people applying at once." }
      ]
    },
    handsOn: {
      prerequisites: "Terraform (free) installed, plus an AWS/GCP free-tier account.",
      setup: "Local and free: Terraform pointed at a free-tier cloud account.",
      simulate: "Write a `.tf` file provisioning one free-tier resource (an S3 bucket or a small EC2 instance). Run `terraform plan` and read the diff before applying anything, then `terraform apply`. Manually change one setting on that resource directly in the cloud console (a ClickOps change), then run `terraform plan` again.",
      observe: "Terraform detects the manual drift and shows it as a diff it wants to \u201ccorrect\u201d back to what is in code: the exact ClickOps anti-pattern, caught automatically instead of silently persisting.",
      stretch: "Delete the resource with `terraform destroy`, then intentionally corrupt the local state file and try `terraform plan` again. See the error Terraform raises, and why teams store state remotely with locking (S3 + DynamoDB) instead of a local file that any one person could break."
    }
  },
  keyTakeaways: [
    "IaC version-controls infrastructure so it is reproducible, auditable, and reviewable like application code.",
    "Approaches: declarative (Terraform, CloudFormation), imperative-as-code (Pulumi, CDK), and reconciliation-loop (Crossplane).",
    "GitOps drives it: PR \u2192 plan diff \u2192 review \u2192 apply on merge, with remote state and locking to prevent corruption."
  ],
  proTip: "Always read the `plan` diff before you `apply`. The plan is a free, reversible preview of exactly what will change, and it is where you catch a ClickOps drift or an accidental destroy before it is real.",
  related: ["cicd", "docker-k8s", "serverless", "multi-region"],
  bridgeOut: "This closes Module 5. Storage opens next: much of what gets provisioned via IaC from here on is exactly the databases and stores Module 6 covers."
};
