/* === Lesson firewalls - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#firewalls)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["firewalls"] = {
  module: 2, num: "2.8", title: "Firewalls: SGs vs NACLs",
  connectsFrom: "Those ports are exactly what a firewall filters. Without one, every port on every machine in a VPC is reachable from anywhere, and one misconfigured service becomes an open door. Cloud VPCs give you two independent filtering layers.",
  tabs: {
    overview: {
      heading: "Two Layers of Defense in Depth",
      intro: "Every cloud VPC has two independent filtering layers: <strong>Security Groups</strong> (instance-level, stateful) and <strong>NACLs</strong> (subnet-level, stateless). Two layers means a mistake in one does not automatically expose everything, that is the whole point of defense in depth.",
      table: {
        headers: ["Aspect", "Security Group", "NACL"],
        rows: [
          ["<strong>Scope</strong>", "Instance / ENI (can reference other SGs)", "Entire subnet"],
          ["<strong>State</strong>", "<strong>Stateful</strong>, return traffic auto-allowed", "<strong>Stateless</strong>, must allow both directions explicitly"],
          ["<strong>Rules</strong>", "Allow only (implicit deny all)", "Allow + Deny (explicit deny possible)"],
          ["<strong>Evaluation</strong>", "All rules evaluated (most permissive wins)", "Numbered, first match wins"],
          ["<strong>Use case</strong>", "Fine-grained: \u201capp SG can talk to DB SG on 5432\u201d", "Coarse: \u201cblock this CIDR range entirely\u201d"],
          ["<strong>Limits</strong>", "~60 rules per SG, 5 SGs per ENI", "20 rules per NACL (soft limit)"]
        ]
      },
      callouts: [
        { color: "green", label: "Best practice:", body: "<strong>Least-privilege allow-list</strong> per port, default deny everything. Reference <strong>SG-to-SG</strong> instead of CIDR (survives IP changes). Use NACLs as a coarse \u201cblock this CIDR\u201d knife for known-bad ranges." },
        { color: "purple", label: "Kubernetes equivalent:", body: "<strong>NetworkPolicy</strong> is the pod-level firewall (implemented by Calico or Cilium): default deny all ingress/egress, then allow specific label selectors. A <strong>service mesh</strong> like Istio adds L7 policies on top (allow GET /api but deny POST)." }
      ]
    },
    tradeoffs: {
      heading: "Anti-Patterns",
      points: [
        { label: "0.0.0.0/0 on a DB port", body: "The database is now exposed to the entire internet." },
        { label: "Single SG for everything", body: "No isolation between tiers, one breach reaches all." },
        { label: "Overly permissive egress", body: "Allows data exfiltration out of a compromised host." },
        { label: "No logging", body: "You cannot detect unauthorized access you never recorded." }
      ]
    },
    handsOn: {
      prerequisites: "An AWS free-tier account.",
      setup: "Cloud free-tier: a free-tier EC2 instance in a VPC you control.",
      simulate: "Launch an EC2 instance with a Security Group allowing only port 22 from your own IP. Try to `curl` port 80 on it from your laptop (times out, nothing listening AND not allowed). Install nginx on the instance, try again (still blocked, the SG does not allow 80 yet). Add an SG rule allowing 80 from `0.0.0.0/0` and retry.",
      observe: "The exact moment the request starts succeeding is tied to the SG rule, not the server config. nginx was serving the whole time; the SG was the thing stopping traffic from reaching it. And because SGs are stateful, your reply traffic is automatically allowed back out with no separate outbound rule.",
      stretch: "Add a NACL on the subnet that explicitly denies port 80 inbound and watch it override the permissive SG, a direct demonstration of two independent layers: NACLs evaluate every packet statelessly regardless of what the stateful SG already decided."
    }
  },
  keyTakeaways: [
    "Security Groups are <strong>stateful and instance-level</strong> (allow-only); NACLs are <strong>stateless and subnet-level</strong> (allow + deny, first-match).",
    "Prefer SG-to-SG references over CIDRs so rules survive IP changes; use NACLs as a coarse block for known-bad ranges.",
    "Two independent layers is the point: it is defense in depth, so one misconfiguration does not expose everything."
  ],
  proTip: "The interview favorite: <strong>stateful vs stateless</strong>. A Security Group auto-allows return traffic, a NACL does not, so if you open inbound on a NACL you must also open the ephemeral outbound port range (1024-65535) for the reply.",
  related: ["key-ports", "zero-trust", "ip-cidr"],
  bridgeOut: "A firewall assumes anything already inside the perimeter is trusted. Zero Trust is the explicit rejection of that assumption."
};
