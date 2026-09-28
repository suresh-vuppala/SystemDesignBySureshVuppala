/* === Lesson authorization - part of Module 4 (Security) ===
   Source: system-design-cheatsheet/03-security.html (#authorization)
   + system-design-cheatsheet-course-hierarchy.md, Module 4.2.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["authorization"] = {
  module: 4, num: "4.2", title: "Authorization",
  connectsFrom: "You now know who is calling, but a logged-in user and an admin are both \u201cauthenticated,\u201d and only one of them should be able to delete another user's account. Authentication alone cannot make that distinction.",
  tabs: {
    overview: {
      heading: "Verifying Permissions: What Can You Do?",
      intro: "Authorization answers <strong>what are you allowed to do?</strong> It has evolved through 5 models, from simple access lists that do not scale, through role and attribute rules, to relationship graphs and externalized policy engines. The goal at every layer is <strong>least privilege</strong>.",
      table: {
        headers: ["Model", "How It Works", "Scalability", "Use Case", "Example Systems"],
        rows: [
          ["<strong>RBAC</strong>", "Users \u2192 Roles \u2192 Permissions", "Simple, limited flexibility", "Most apps, admin panels", "GitHub, AWS IAM, K8s, PostgreSQL"],
          ["<strong>ABAC</strong>", "Rules on attributes (role, time, IP, resource tags)", "Very flexible, complex policies", "Healthcare, finance, compliance", "AWS IAM Conditions, XACML"],
          ["<strong>ReBAC</strong>", "Graph of relationships (user \u2192 resource)", "Handles sharing/hierarchy naturally", "File sharing, social, multi-tenant", "Google Zanzibar, AuthZed, Ory Keto"],
          ["<strong>Policy-Based</strong>", "Externalized rules (Rego/Cedar DSL)", "Decoupled, testable, versionable", "Microservices, multi-tenant SaaS", "OPA, AWS Cedar, Cerbos"],
          ["<strong>ACL</strong>", "Per-resource access control list", "Simple but does not scale", "File systems, small apps", "Linux permissions, S3 ACLs (legacy)"]
        ]
      },
      cards: [
        { icon: "R", title: "RBAC", color: "blue", body: "<strong>Role-based</strong>: users get roles, roles carry permissions. Simple and auditable, but suffers <strong>role explosion</strong> at scale. Used by GitHub, AWS IAM, K8s RBAC." },
        { icon: "A", title: "ABAC", color: "orange", body: "<strong>Attribute-based</strong>: rules over who, what, where, and when, e.g. \u201conly during business hours.\u201d Fine-grained and context-aware, but the policies are complex and hard to audit." },
        { icon: "G", title: "ReBAC", color: "green", body: "<strong>Relationship-based</strong>: a graph decides access, e.g. \u201cowner of this document.\u201d Natural for sharing and hierarchies, at the cost of graph-traversal complexity." }
      ],
      callouts: [
        { color: "purple", label: "Where to enforce it, 5 layers:", body: "<strong>API Gateway</strong> (coarse-grained: valid token? correct scope?), <strong>Service layer</strong> (business rules: can this user edit THIS resource?), <strong>Database</strong> (row-level security via Postgres RLS, Citus), <strong>Sidecar/mesh</strong> (OPA sidecar for policy decisions), and <strong>Frontend</strong> (UI-only, never trust it alone, always verify server-side)." },
        { color: "green", label: "Principles:", body: "<strong>Least privilege</strong> (minimal permissions needed), <strong>deny by default</strong> (explicit grants only), <strong>separation of duties</strong> (no single role can do everything), and <strong>auditability</strong> (log every access decision: who, what, when, allowed/denied)." },
        { color: "yellow", label: "Multi-tenant authorization:", body: "Every query must include a <strong>tenant_id</strong> filter. Use <strong>row-level security</strong> (Postgres RLS) as defense-in-depth, enforce <strong>tenant isolation</strong> at every layer (API \u2192 service \u2192 DB), and test with cross-tenant access attempts." }
      ]
    },
    realWorld: {
      heading: "Authorization at Scale",
      points: [
        { label: "Google Zanzibar (ReBAC)", body: "Does relationship-based access control at planet scale, powering Drive, YouTube, and Cloud IAM. \u201cCan user X view document Y\u201d is answered in &lt;10ms across a graph of billions of relationships. Open-sourced as <strong>SpiceDB</strong>, <strong>Ory Keto</strong>, and <strong>OpenFGA</strong>." },
        { label: "GitHub", body: "RBAC (owner/admin/write/read) plus fine-grained permissions." },
        { label: "AWS", body: "IAM policies, effectively ABAC with conditions." },
        { label: "Notion", body: "A workspace \u2192 team \u2192 page hierarchy, modeled as ReBAC." }
      ]
    },
    tradeoffs: {
      heading: "Choosing and Placing Enforcement",
      points: [
        { label: "RBAC vs ABAC", body: "RBAC is simple but coarse and explodes into too many roles; ABAC adds context conditions (time, IP, tags) at the cost of policies that are harder to audit." },
        { label: "ReBAC vs the rest", body: "ReBAC expresses \u201cowner of this document\u201d and sharing hierarchies naturally, but introduces graph-traversal complexity that simpler models avoid." },
        { label: "Anti-patterns", body: "Checking permissions only in the UI (the API must enforce independently), a <strong>god role</strong> with every permission, hardcoded permissions that need a deploy to change, and no tenant isolation letting one customer see another's data." }
      ]
    },
    handsOn: {
      prerequisites: "Node.js; the auth API from 4.1.",
      setup: "Local and free only.",
      simulate: "Implement RBAC first: a `roles` table (`admin`, `editor`, `viewer`) and middleware that checks `req.user.role` against a required role per route. Then add one ABAC rule on top: \u201ceditors can only edit documents created in the last 24 hours.\u201d Try deleting another user's document as a `viewer`, then as an `editor` outside the 24-hour window, then as an `editor` inside it.",
      observe: "The same user/role combination is allowed or denied purely based on the document's `createdAt` attribute. RBAC alone cannot express that rule; it needed ABAC's extra condition, exactly the limitation named in the overview.",
      stretch: "Install OpenFGA locally (`docker run -d -p 8080:8080 openfga/openfga run`) and model \u201cowner of this document\u201d as a ReBAC relationship tuple. Query `check` against it and get a sub-millisecond allow/deny, a small-scale version of what Zanzibar does at Google's scale."
    }
  },
  keyTakeaways: [
    "Authorization answers <strong>what are you allowed to do</strong>, evolving ACL \u2192 RBAC \u2192 ABAC \u2192 ReBAC \u2192 Policy-Based as flexibility needs grow.",
    "Enforce across layers (gateway, service, database, mesh) but never trust the frontend alone; always verify server-side.",
    "Apply least privilege, deny by default, separation of duties, and audit every decision; in multi-tenant systems, filter by tenant_id everywhere."
  ],
  proTip: "Push coarse checks to the API Gateway and keep fine-grained \u201ccan this user touch THIS resource\u201d decisions in the service layer. When rules get complex, externalize them to a policy engine instead of scattering if-statements through the code.",
  related: ["authentication", "encryption", "api-gateway", "zero-trust"],
  bridgeOut: "Enforcing authorization needs somewhere in the request path to check it. Infrastructure's API Gateway (5.2) is exactly where that check usually lives."
};
