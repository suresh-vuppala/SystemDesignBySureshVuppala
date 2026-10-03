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
      goal: "Prove that the Security Group, not the server config, is what lets traffic reach an instance, and that it auto-allows return traffic.",
      stack: "AWS CLI against a free-tier EC2 instance, tested with <code>curl</code> (AWS free tier).",
      steps: [
        {
          title: "Create a Security Group allowing only SSH from your IP",
          code: "MYIP=$(curl -s https://checkip.amazonaws.com)\nSG=$(aws ec2 create-security-group --group-name lab-sg --description \"firewall lab\" --query GroupId --output text)\naws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 22 --cidr $MYIP/32",
          lang: "bash"
        },
        {
          title: "Launch a free-tier instance that installs nginx on boot",
          body: "User-data starts nginx immediately, so nothing but the SG blocks port 80. Replace the AMI id with a current one for your region.",
          code: "aws ec2 run-instances --image-id ami-xxxxxxxx --instance-type t2.micro \\\n  --security-group-ids $SG \\\n  --user-data '#!/bin/bash\napt update && apt install -y nginx' \\\n  --query 'Instances[0].InstanceId' --output text",
          lang: "bash"
        },
        {
          title: "Confirm port 80 is blocked",
          body: "Grab the public IP, then curl it: the request times out because the SG never allowed 80, even though nginx is serving.",
          code: "IP=$(aws ec2 describe-instances --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)\ncurl --max-time 5 http://$IP     # times out: blocked by the SG",
          lang: "bash"
        },
        {
          title: "Open port 80 and retry",
          body: "Opening 80 to <code>0.0.0.0/0</code> exposes it to the whole internet: fine for a throwaway lab, never for a database port.",
          code: "aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 80 --cidr 0.0.0.0/0\ncurl --max-time 5 http://$IP     # now returns the nginx welcome page",
          lang: "bash"
        }
      ],
      observe: "The exact moment <code>curl</code> starts succeeding is tied to the SG rule, not the server: nginx was serving the whole time. Because Security Groups are <strong>stateful</strong>, your reply traffic is allowed back out automatically with no separate outbound rule.",
      stretch: "Add a NACL on the subnet that explicitly denies port 80 inbound and watch it override the permissive SG. NACLs are <strong>stateless</strong>, so you must also open the ephemeral outbound range (1024-65535) for any reply, unlike the SG which handled that for you."
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
