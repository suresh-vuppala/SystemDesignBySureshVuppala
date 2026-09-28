/* === Lesson zero-trust - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#zero-trust)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["zero-trust"] = {
  module: 2, num: "2.9", title: "Zero Trust Networking",
  connectsFrom: "Traditional firewalls assume \u201cinside the VPC = trusted.\u201d One compromised service inside that perimeter can then reach everything else inside it, unchecked. The perimeter was the only defense, and it just failed. Zero Trust removes that assumption entirely.",
  tabs: {
    overview: {
      heading: "Never Trust, Always Verify",
      intro: "<strong>Never trust, always verify</strong>: there is no implicit trust for internal traffic. Network location does not equal trust, so internal traffic is treated exactly like external. Every request is authenticated, authorized, and encrypted, which means lateral movement is blocked even if one service is compromised.",
      table: {
        headers: ["Component", "Purpose", "Tools"],
        rows: [
          ["<strong>Service Identity</strong>", "Cryptographic identity per workload", "SPIFFE/SPIRE, K8s ServiceAccount, AWS IAM Roles"],
          ["<strong>mTLS</strong>", "Mutual authentication + encryption", "Istio, Linkerd, Consul Connect, Cilium"],
          ["<strong>Policy Engine</strong>", "Fine-grained authorization (who can call what)", "OPA/Rego, Istio AuthorizationPolicy, Cedar"],
          ["<strong>Cert Management</strong>", "Auto-rotate short-lived certificates", "cert-manager, Vault PKI, SPIRE"],
          ["<strong>BeyondCorp Proxy</strong>", "Identity-aware access for humans", "Cloudflare Access, Google IAP, Zscaler"],
          ["<strong>Observability</strong>", "Audit all access decisions", "Envoy access logs, OPA decision logs"]
        ]
      },
      callouts: [
        { color: "purple", label: "The 8 pillars:", body: "Verify identity (mTLS/JWT), verify device posture, least-privilege access, encrypt everything, log and audit all access, <strong>assume breach</strong>, micro-segmentation (narrow purpose-specific zones instead of one flat network), and continuous verification (re-check, do not just check once at connection time)." },
        { color: "green", label: "Implementation:", body: "<strong>Istio/Linkerd</strong> inject a sidecar proxy for auto-mTLS between all pods. <strong>SPIFFE</strong> gives universal workload identity (x509 SVIDs). <strong>OPA</strong> expresses rules like \u201csvc-a can call svc-b GET /api/orders but not DELETE.\u201d <strong>Short-lived certs (1h)</strong> mean a compromised cert expires quickly." }
      ]
    },
    realWorld: {
      heading: "In Production",
      points: [
        { label: "Google BeyondCorp", body: "Removed the VPN entirely, every access request (inside or outside the office network) goes through the same identity-aware proxy. Cloudflare Access and Google IAP are the productized versions of this idea." },
        { label: "Netflix", body: "mTLS everywhere via a custom CA." },
        { label: "Airbnb", body: "SPIFFE for service identity." },
        { label: "Cloudflare", body: "Access replaces the VPN for employee access." }
      ]
    },
    tradeoffs: {
      heading: "Cost and Anti-Patterns",
      intro: "Zero Trust buys containment at a real operational price.",
      points: [
        { label: "The trade-off", body: "Meaningfully more operational overhead (certs, policy engine, sidecars) in exchange for containing lateral movement after any single breach." },
        { label: "VPN = trusted", body: "Anti-pattern: once inside the VPN, full access to a flat network." },
        { label: "IP-based allow-lists", body: "Anti-pattern: IPs change and can be spoofed." },
        { label: "Long-lived certs / no east-west encryption", body: "A compromised cert stays valid for years, and unencrypted internal traffic is sniffable." }
      ]
    },
    handsOn: {
      prerequisites: "Docker and `docker-compose`; basic service-mesh familiarity helps but is not required.",
      setup: "Local/free: a minimal Istio or Linkerd install on a local Kubernetes cluster (`kind` or `minikube`). Cloud free-tier: a managed K8s free tier (GKE/EKS) with the mesh add-on.",
      simulate: "Deploy 2 services (`service-a`, `service-b`) in the mesh and confirm they can call each other. Then run `istioctl proxy-config` (or the mesh equivalent) to confirm mTLS is active, and capture traffic with `tcpdump` on the pod network to confirm the payload is encrypted even though it is \u201cinside\u201d the cluster.",
      observe: "An mTLS handshake happening for pod-to-pod traffic that never leaves your own cluster, proof that \u201cinside the network\u201d is not treated as automatically trusted, the core Zero Trust claim made visible in a packet capture.",
      stretch: "Write an OPA policy that denies `service-a \u2192 service-b` on a specific path and confirm the call is rejected even though network-level connectivity exists, decoupling \u201ccan reach\u201d from \u201cis allowed.\u201d"
    }
  },
  keyTakeaways: [
    "Zero Trust discards perimeter trust: network location never implies trust, so every request is authenticated, authorized, and encrypted.",
    "The machinery is workload identity (SPIFFE), mTLS everywhere (Istio/Linkerd), a policy engine (OPA), and short-lived auto-rotated certs.",
    "It costs real operational overhead but contains lateral movement, one compromised service can no longer roam the whole network."
  ],
  proTip: "The one-liner that lands: Zero Trust means a stolen credential or a compromised pod buys the attacker <strong>almost nothing</strong>, because the very next hop re-verifies identity and checks policy instead of trusting the network.",
  related: ["firewalls", "ddos-defense", "http-https", "service-mesh", "authentication", "authorization", "encryption"],
  bridgeOut: "Zero Trust defends against a threat already inside your network. The next lesson is what stops a flood before it ever gets that far."
};
