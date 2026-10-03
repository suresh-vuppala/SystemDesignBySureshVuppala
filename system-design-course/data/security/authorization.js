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
      goal: "Build RBAC role middleware, layer one ABAC rule on top, and watch the same editor be allowed or denied purely by a document's age.",
      stack: "Node.js + Express, tested with <code>curl</code> (optional OpenFGA via Docker for the stretch). Local and free.",
      steps: [
        {
          title: "Install Express",
          code: "npm init -y && npm install express",
          lang: "bash"
        },
        {
          title: "Write RBAC middleware plus one ABAC rule",
          body: "<code>requireRole</code> is pure RBAC. The 24-hour check inside the handler is the ABAC condition RBAC alone cannot express. The role comes from a header here, standing in for the verified JWT from lesson 4.1. Save as <code>app.js</code>.",
          code: "const express = require('express');\nconst app = express();\n\nconst docs = {\n  d1: { owner: 'bob', createdAt: Date.now() - 2 * 3600 * 1000 },   // 2h old\n  d2: { owner: 'bob', createdAt: Date.now() - 48 * 3600 * 1000 }   // 48h old\n};\n\napp.use((req, res, next) => {\n  req.user = { name: req.header('x-user') || 'anon', role: req.header('x-role') || 'viewer' };\n  next();\n});\n\n// RBAC: caller must hold one of these roles\nconst requireRole = (...roles) => (req, res, next) =>\n  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'RBAC: role denied' });\n\napp.delete('/docs/:id', requireRole('admin', 'editor'), (req, res) => {\n  const doc = docs[req.params.id];\n  if (!doc) return res.status(404).json({ error: 'not found' });\n  // ABAC: editors may only touch docs created in the last 24h\n  const ageHours = (Date.now() - doc.createdAt) / 3600000;\n  if (req.user.role === 'editor' && ageHours > 24) {\n    return res.status(403).json({ error: 'ABAC: document older than 24h' });\n  }\n  delete docs[req.params.id];\n  res.json({ deleted: req.params.id });\n});\n\napp.listen(3000, () => console.log('authz on :3000'));",
          lang: "javascript"
        },
        {
          title: "Run it",
          code: "node app.js",
          lang: "bash"
        },
        {
          title: "Try the same action across role and attribute",
          code: "# viewer: blocked by RBAC before the rule even runs\ncurl -s -X DELETE -H \"x-role: viewer\" http://localhost:3000/docs/d1\n\n# editor, document 48h old: blocked by ABAC\ncurl -s -X DELETE -H \"x-role: editor\" http://localhost:3000/docs/d2\n\n# editor, document 2h old: allowed\ncurl -s -X DELETE -H \"x-role: editor\" http://localhost:3000/docs/d1",
          lang: "bash"
        }
      ],
      observe: "The same editor is allowed or denied purely based on the document's <code>createdAt</code> attribute. RBAC alone cannot express that rule; it needed ABAC's extra condition, exactly the limitation named in the overview.",
      stretch: "Run OpenFGA locally with <code>docker run -d -p 8080:8080 openfga/openfga run</code> and model \u201cowner of this document\u201d as a ReBAC relationship tuple. Query <code>check</code> against it and get a sub-millisecond allow/deny, a small-scale version of what Zanzibar does at Google's scale."
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
