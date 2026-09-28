/* === Lesson cost-numbers - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#cost-numbers)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["cost-numbers"] = {
  module: 14, num: "14.5", title: "Cost Estimation",
  connectsFrom: "Sizing a system in servers and storage is only half the job; a design has to translate into a dollar figure. Cloud cost awareness is what separates senior engineers from juniors, because architecture decisions are budget decisions.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "pricing", label: "Pricing Reference", icon: "hex" },
    { key: "bills", label: "Worked Bills", icon: "layers" },
    { key: "realWorld", label: "What Dominates", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Cloud Cost Reference (2024 Pricing)",
      intro: "A handful of pricing anchors let you attach a monthly bill to any estimate. The one rule that dominates: <strong>bandwidth &gt; compute &gt; storage</strong>. Egress at ~$0.09/GB is what quietly wrecks budgets, which is exactly why a CDN so often pays for itself. Three levers cut the bill.",
      cards: [
        { icon: "R", title: "Reserved Instances", color: "green", body: "<strong>30-60% savings</strong>. 1-year RI ~30%, 3-year ~60%. Best for steady-state workloads where you can commit to a predictable base load." },
        { icon: "S", title: "Spot Instances", color: "orange", body: "<strong>60-90% savings</strong>. Can be reclaimed with a 2-minute notice, so use for batch jobs, CI/CD, and stateless workers, never databases or user-facing servers." },
        { icon: "Z", title: "Right-Sizing", color: "blue", body: "<strong>20-40% savings</strong>. Target <strong>60-70% average utilization</strong>, downsize over-provisioned instances, and auto-scale variable load. Stop paying for idle." }
      ],
      callouts: [
        { color: "blue", label: "The one rule: bandwidth > compute > storage", body: "Egress bandwidth (~$0.09/GB) is the line item that most often dominates and most often surprises people. When your estimate shows egress on top, a CDN is almost always the first fix." }
      ]
    },
    pricing: {
      heading: "Pricing Anchors",
      intro: "Approximate 2024 AWS on-demand pricing across the five cost categories. Memorize a few (m5.xlarge ~$140/mo, S3 ~$23/TB, egress ~$0.09/GB) and interpolate the rest.",
      table: {
        headers: ["Category", "Service", "Spec", "Monthly Cost", "Notes"],
        rows: [
          ["<strong>Compute</strong>", "EC2 m5.xlarge", "4 vCPU, 16 GB", "~$140/mo", "On-demand, general purpose"],
          ["<strong>Compute</strong>", "EC2 m5.4xlarge", "16 vCPU, 64 GB", "~$560/mo", "Typical app server"],
          ["<strong>Compute</strong>", "Lambda", "1M invocations", "~$0.20", "+ $0.0000167/GB-sec"],
          ["<strong>Compute</strong>", "Fargate", "1 vCPU, 2 GB", "~$30/mo", "Serverless containers"],
          ["<strong>Storage</strong>", "S3 Standard", "Per TB", "~$23/TB/mo", "+ request costs"],
          ["<strong>Storage</strong>", "S3 Glacier", "Per TB", "~$4/TB/mo", "Retrieval: hours"],
          ["<strong>Storage</strong>", "EBS (gp3)", "Per TB", "~$80/TB/mo", "Block storage for EC2"],
          ["<strong>Storage</strong>", "EFS", "Per TB", "~$300/TB/mo", "Shared file system"],
          ["<strong>Database</strong>", "RDS (db.r5.xlarge)", "4 vCPU, 32 GB", "~$350/mo", "Multi-AZ: 2\u00d7"],
          ["<strong>Database</strong>", "DynamoDB", "On-demand", "$1.25/M writes, $0.25/M reads", "Pay per request"],
          ["<strong>Database</strong>", "ElastiCache (r6g.large)", "2 vCPU, 13 GB", "~$200/mo", "Redis managed"],
          ["<strong>Network</strong>", "Data Transfer (egress)", "First 10 TB", "$0.09/GB", "Ingress is free"],
          ["<strong>Network</strong>", "CloudFront CDN", "First 10 TB", "$0.085/GB", "Cheaper than direct"],
          ["<strong>Messaging</strong>", "SQS", "Per 1M requests", "~$0.40", "Standard queue"],
          ["<strong>Messaging</strong>", "MSK (Kafka)", "3 brokers (m5.large)", "~$500/mo", "Managed Kafka"]
        ]
      }
    },
    bills: {
      heading: "Three Architectures, Priced",
      intro: "The pricing anchors turned into full monthly bills for three common systems. Notice how a different category dominates each one.",
      table: {
        headers: ["Chat App (10M DAU) Component", "Cost/mo"],
        rows: [
          ["20 app servers (m5.xl)", "$2,800"],
          ["WebSocket servers (10\u00d7)", "$1,400"],
          ["Redis cluster (5 nodes)", "$1,000"],
          ["RDS Multi-AZ", "$700"],
          ["S3 (media, 50TB)", "$1,150"],
          ["Bandwidth (100TB)", "$9,000"],
          ["<strong>Total</strong>", "<strong>~$16K/mo</strong>"]
        ]
      },
      tables: [
        {
          headers: ["Video Platform (5M DAU) Component", "Cost/mo"],
          rows: [
            ["Transcoding (GPU)", "$5,000"],
            ["S3 storage (500TB)", "$11,500"],
            ["CloudFront CDN (1PB)", "$40,000"],
            ["App servers (10\u00d7)", "$1,400"],
            ["Search (ES cluster)", "$2,000"],
            ["Database (RDS)", "$1,500"],
            ["<strong>Total</strong>", "<strong>~$61K/mo</strong>"]
          ]
        },
        {
          headers: ["E-commerce (2M DAU) Component", "Cost/mo"],
          rows: [
            ["App servers (8\u00d7)", "$1,120"],
            ["RDS Multi-AZ (large)", "$1,400"],
            ["ElastiCache (3 nodes)", "$600"],
            ["Elasticsearch", "$1,500"],
            ["S3 + CloudFront", "$3,000"],
            ["SQS + Lambda", "$200"],
            ["<strong>Total</strong>", "<strong>~$8K/mo</strong>"]
          ]
        }
      ]
    },
    realWorld: {
      heading: "Which Line Item Dominates",
      intro: "The worked architectures show a consistent pattern: one category eats most of the bill, and which one tells you where to focus optimization.",
      points: [
        { label: "Video and media: 60-70% CDN/bandwidth", body: "Serving bytes to users is the cost. The video platform\u2019s ~$40K CloudFront line dwarfs its compute and storage combined." },
        { label: "CRUD apps: 50-60% compute", body: "Request/response workloads with little media spend most on app and database servers, so right-sizing and Reserved Instances move the needle most." },
        { label: "Data platforms: 40-50% storage", body: "When you retain petabytes, storage and its replication dominate, which is where tiering to Glacier earns its keep." },
        { label: "Optimization levers stack", body: "Reserved Instances for the steady base, Spot for fault-tolerant batch, right-sizing everywhere. Being able to say \u201cthis costs $X/month more, and here is why it is worth it\u201d is senior-level judgment applied to money." }
      ]
    },
    handsOn: {
      prerequisites: "None needed. AWS\u2019s public Pricing Calculator (calculator.aws) requires no account.",
      setup: "Open calculator.aws in a browser. No signup required.",
      simulate: "Price out the food-delivery app you estimated in 14.4: pick EC2 instance types for your server count, an RDS instance for storage, and CloudFront for any media, then read the monthly total. Then compare On-Demand pricing against the same setup with Reserved Instances applied.",
      observe: "Find the single line item that dominates the bill and check it against the \u201cbandwidth &gt; compute &gt; storage\u201d rule. See whether your specific app matches that ordering or deviates (a chat app with little media may have compute dominate instead).",
      stretch: "Reprice the batch-processing piece using Spot Instances instead of On-Demand and quantify the savings against the 60-90% range."
    }
  },
  keyTakeaways: [
    "Anchor the bill with a few numbers: EC2 m5.xlarge ~$140/mo, S3 ~$23/TB/mo, egress ~$0.09/GB, RDS ~$350/mo, MSK ~$500/mo.",
    "The dominant cost follows the workload: <strong>60-70% CDN</strong> for video/media, <strong>50-60% compute</strong> for CRUD apps, <strong>40-50% storage</strong> for data platforms.",
    "Three levers cut cost: Reserved Instances (30-60%), Spot (60-90%, fault-tolerant batch only), and right-sizing to 60-70% utilization (20-40%)."
  ],
  proTip: "The rule of thumb <strong>bandwidth &gt; compute &gt; storage</strong> tells you where to look first. If your estimate shows egress dominating, a CDN is almost always the fix before you touch anything else.",
  related: ["estimation", "storage-numbers", "throughput-numbers", "sla-math", "interview-reference"],
  bridgeOut: "Cost buys you reliability, and reliability is measured in \u201cnines.\u201d Next: the arithmetic of combining availability across a real multi-component architecture."
};
