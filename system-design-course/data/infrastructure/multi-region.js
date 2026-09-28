/* === Lesson multi-region - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#multi-region)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["multi-region"] = {
  module: 5, num: "5.7", title: "Multi-Region & Multi-Tenant",
  connectsFrom: "Users on the other side of the planet from your one datacenter feel every millisecond of that distance, and if that single region goes down, so does your entire product.",
  tabs: {
    overview: {
      heading: "Across Regions, Across Tenants",
      intro: "Two independent axes of \u201cwho shares what.\u201d <strong>Multi-region</strong> is about deploying across geographies for low latency, disaster recovery, and compliance. <strong>Multi-tenant</strong> is about how much infrastructure your customers share.",
      table: {
        headers: ["Pattern", "How", "Trade-off"],
        rows: [
          ["<strong>Active-Passive</strong>", "Primary region serves traffic; standby waits for failover", "Simple, but the standby sits idle and failover takes minutes"],
          ["<strong>Active-Active</strong>", "Both regions serve traffic; data replicated", "<strong>Low latency globally</strong>, but conflict resolution is needed"],
          ["<strong>Follow-the-Sun</strong>", "Route to whichever region is in business hours", "Good for support and ops workloads"]
        ]
      },
      cards: [
        { icon: "1", title: "Shared App, Shared DB", color: "green", body: "Cheapest, simplest ops. Risk: noisy neighbor and data-leak. A <strong>tenant_id</strong> column separates rows. Ex: Salesforce, Slack." },
        { icon: "2", title: "Shared App, Multi DB", color: "blue", body: "Strong data isolation with shared compute. Cost: more DB ops and connection pooling. Ex: Shopify, GitHub Enterprise." },
        { icon: "3", title: "Multi App, Multi DB", color: "purple", body: "Full isolation, no noisy neighbor. Cost: expensive, complex ops at scale. Ex: dedicated AWS accounts per tenant." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "Multi-region provides <strong>disaster recovery</strong> (an entire region can fail) and <strong>data residency compliance</strong> (GDPR: EU data stays in the EU). Trade-off: <strong>cross-region replication lag</strong> and <strong>conflict resolution</strong> complexity." },
        { color: "blue", label: "Choosing a tenant model:", body: "<strong>Shared/Shared</strong> for cost (Salesforce) \u2192 <strong>Shared/Multi-DB</strong> for data isolation (Shopify) \u2192 <strong>Multi/Multi</strong> for full isolation (enterprise/compliance). Most SaaS starts shared and migrates to hybrid as it scales." }
      ]
    },
    tradeoffs: {
      heading: "What Distribution Costs",
      points: [
        { label: "Active-Passive", body: "Simplest to reason about, but you pay for idle standby capacity and eat a multi-minute failover window." },
        { label: "Active-Active", body: "Best latency and availability, but concurrent writes in two regions force you to solve conflict resolution and consistency." },
        { label: "Isolation vs cost (tenancy)", body: "More isolation means less noisy-neighbor risk and easier compliance, but higher per-tenant cost and operational overhead." }
      ]
    },
    handsOn: {
      prerequisites: "2 free-tier cloud accounts/regions, or 2 local Docker Postgres instances standing in for \u201cregion A\u201d and \u201cregion B.\u201d",
      setup: "Cloud free-tier: 2 small Postgres instances in 2 different AWS regions (or simulate with `docker run` on 2 ports locally, adding artificial latency with `tc netem` to mimic cross-region distance). Local and free: the 2-port simulation alone.",
      simulate: "Write to \u201cregion A\u201d and set up simple replication (a script polling for changes and applying them to \u201cregion B,\u201d standing in for real cross-region replication). Measure the delay between a write landing in A and becoming visible in B.",
      observe: "A real, non-zero replication lag. Even a simulated one makes concrete the Active-Passive failover risk: if A dies right after a write, that write may not exist yet in B, the exact problem Module 9 will formalize with consistency models.",
      stretch: "Build the cheapest multi-tenant shape: one app, one Postgres instance, a `tenant_id` column on every table, and row-level security restricting each query to its own tenant's rows. Confirm tenant A's queries genuinely cannot see tenant B's data even with a bug in your WHERE clause."
    }
  },
  keyTakeaways: [
    "Multi-region patterns: Active-Passive (idle standby, simple), Active-Active (global low latency, conflict resolution), Follow-the-Sun.",
    "Multi-tenant models trade cost against isolation: Shared/Shared \u2192 Shared/Multi-DB \u2192 Multi/Multi.",
    "The core multi-region tax is cross-region replication lag, which is really a consistency question."
  ],
  proTip: "Start tenants shared for cost and migrate the isolation boundary outward only when a real customer or compliance requirement forces it. Do not pay for Multi/Multi isolation before you need it.",
  related: ["docker-k8s", "service-discovery", "cap", "replication", "iac", "sharding"],
  bridgeOut: "Cross-region replication raises the exact consistency questions Module 9 formalizes. This lesson raises the problem; Module 9 gives it rigor."
};
