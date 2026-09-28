/* === Lesson ip-cidr - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#ip-cidr)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["ip-cidr"] = {
  module: 2, num: "2.6", title: "IP & CIDR",
  connectsFrom: "DNS just resolved a name into an IP address. This lesson is what that address actually is, and how blocks of them get sized for a VPC before that VPC runs out of room.",
  tabs: {
    overview: {
      heading: "Address Space and Subnet Sizing",
      intro: "In CIDR notation like <strong>10.0.0.0/24</strong>, the suffix is the number of fixed <strong>network bits</strong>. A <strong>smaller suffix means a bigger block</strong>. The rule to internalize: <strong>suffix +1 = half the block</strong> (a /24 splits into two /25s of 128 hosts each).",
      table: {
        headers: ["CIDR", "Hosts", "Typical Use", "Subnet Mask"],
        rows: [
          ["/32", "1", "Single host (allow-list a server)", "255.255.255.255"],
          ["/28", "16", "Small subnet (NAT GW, bastion)", "255.255.255.240"],
          ["/24", "256", "Standard subnet (one AZ)", "255.255.255.0"],
          ["/20", "4,096", "Large subnet (K8s pod CIDR)", "255.255.240.0"],
          ["/16", "65,536", "VPC per region", "255.255.0.0"],
          ["/8", "16.7M", "Entire org (10.0.0.0/8)", "255.0.0.0"]
        ]
      },
      callouts: [
        { color: "green", label: "Private ranges (RFC 1918):", body: "<strong>10.0.0.0/8</strong>, <strong>172.16.0.0/12</strong>, <strong>192.168.0.0/16</strong>. Used inside VPCs, not routable on the public internet. Every VPC is built from one of these. <strong>Plan CIDR carefully</strong>: VPC peering requires non-overlapping ranges." },
        { color: "yellow", label: "VPC design:", body: "Use a <strong>/16 per VPC</strong>, split into <strong>/24 subnets per AZ</strong>. Separate public (load balancer), private (app), and isolated (database) subnets. Leave room for growth, you cannot resize a VPC CIDR easily. Note AWS reserves 5 IPs per subnet (network, router, DNS, future, broadcast)." }
      ]
    },
    tradeoffs: {
      heading: "Anti-Patterns",
      points: [
        { label: "Overlapping CIDRs", body: "You cannot peer two VPCs whose ranges overlap, full stop." },
        { label: "Too-small VPC", body: "Run out of IPs the moment you scale, and you cannot easily resize." },
        { label: "/16 subnets", body: "Waste addresses and make the broadcast domain too large." },
        { label: "Using 172.17.0.0/16", body: "This is Docker's default bridge network. Reusing that exact range for a VPC creates a silent routing conflict the moment a container tries to reach it." }
      ]
    },
    handsOn: {
      prerequisites: "An AWS free-tier account (or `ipcalc` / an online CIDR calculator for the no-signup version).",
      setup: "Cloud free-tier: the AWS VPC console (free, no running resources needed). Local/free: `ipcalc 10.0.0.0/24` or any online CIDR calculator.",
      simulate: "Create a VPC with CIDR `10.0.0.0/16` (65,536 addresses), then carve 2 subnets from it: `10.0.1.0/24` (256 addresses, one AZ) and `10.0.2.0/24`. Calculate by hand how many usable IPs each subnet has (256 minus the 5 AWS reserves automatically), then verify against the console.",
      observe: "Try to create a third subnet with an overlapping range like `10.0.1.128/25`. AWS rejects it, a direct and safe way to feel why CIDR blocks cannot overlap.",
      stretch: "Check your home Wi-Fi range or Docker's default network (`docker network inspect bridge`) and confirm it sits inside `172.17.0.0/16`. That is exactly why a VPC should avoid that range if you will ever reach it over a VPN."
    }
  },
  keyTakeaways: [
    "The CIDR suffix counts network bits: <strong>smaller suffix = bigger block</strong>, and suffix +1 halves the block.",
    "Memorize the sizing anchors: /24 = 256 (one AZ), /16 = 65,536 (a VPC), /8 = 16.7M (an org).",
    "All VPCs come from RFC 1918 private ranges; keep them non-overlapping (peering demands it) and avoid Docker's 172.17.0.0/16."
  ],
  proTip: "Size the VPC for the org you will be, not the one you are. You cannot cleanly resize a VPC CIDR later, so a /16 with room to spare beats a tight /20 you outgrow in a year.",
  related: ["dns", "key-ports", "web-request", "firewalls"],
  bridgeOut: "IP & CIDR gets traffic to the right machine. Ports get it to the right process on that machine, and those exact numbers are what firewalls filter on next."
};
