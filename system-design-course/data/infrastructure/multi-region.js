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
      goal: "Stand up two Postgres instances as \u201cregion A\u201d and \u201cregion B,\u201d run a naive replication poller between them, and measure the real lag between a write landing in A and becoming visible in B.",
      stack: "Two Postgres containers in Docker plus a small bash poller standing in for cross-region replication. Local and free.",
      steps: [
        {
          title: "Start two Postgres regions",
          code: "docker run -d --name region-a -p 5433:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker run -d --name region-b -p 5434:5432 -e POSTGRES_PASSWORD=pw postgres",
          lang: "bash"
        },
        {
          title: "Create the same table in both",
          code: "docker exec region-a psql -U postgres -c \"CREATE TABLE orders(id int primary key, note text, ts timestamptz default now());\"\ndocker exec region-b psql -U postgres -c \"CREATE TABLE orders(id int primary key, note text, ts timestamptz default now());\"",
          lang: "bash"
        },
        {
          title: "Run a naive replication poller",
          body: "Every 5 seconds it dumps A's rows and reloads them into B, standing in for real async cross-region replication.",
          code: "cat > replicate.sh <<'EOF'\n#!/usr/bin/env bash\nwhile true; do\n  docker exec region-a pg_dump -U postgres -t orders --data-only > /tmp/a.dump\n  docker exec -i region-b psql -U postgres -q -c \"TRUNCATE orders;\" > /dev/null\n  docker exec -i region-b psql -U postgres -q < /tmp/a.dump > /dev/null\n  echo \"synced at $(date +%T)\"\n  sleep 5\ndone\nEOF\nbash replicate.sh &",
          lang: "bash"
        },
        {
          title: "Write to A and time when it reaches B",
          code: "docker exec region-a psql -U postgres -c \"INSERT INTO orders(id, note) VALUES (3, 'lag test');\"\nstart=$(date +%s)\nuntil docker exec region-b psql -U postgres -tAc \"SELECT 1 FROM orders WHERE id=3\" | grep -q 1; do sleep 1; done\necho \"visible in B after $(( $(date +%s) - start ))s\"",
          lang: "bash"
        }
      ],
      observe: "A real, non-zero replication lag (up to your 5s poll interval). It makes the Active-Passive failover risk concrete: if A dies in the window right after a write, that write does not exist in B yet, the exact problem Module 9 formalizes with consistency models.",
      stretch: "Build the cheapest multi-tenant shape in one Postgres instance: a <code>tenant_id</code> column on every table plus row-level security (<code>ALTER TABLE orders ENABLE ROW LEVEL SECURITY</code> and a policy on <code>tenant_id</code>). Confirm tenant A's queries cannot see tenant B's rows even with a bug in the WHERE clause."
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
