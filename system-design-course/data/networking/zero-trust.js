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
      goal: "Stand up two services in a service mesh and prove pod-to-pod traffic is mTLS-encrypted even though it never leaves the cluster.",
      stack: "<code>kind</code> (or <code>minikube</code>) plus Linkerd on local Kubernetes. Local and free.",
      steps: [
        {
          title: "Create a local cluster and install the mesh",
          code: "kind create cluster --name zt\ncurl -sL https://run.linkerd.io/install | sh\nexport PATH=$PATH:$HOME/.linkerd2/bin\nlinkerd install --crds | kubectl apply -f -\nlinkerd install | kubectl apply -f -\nlinkerd check",
          lang: "bash"
        },
        {
          title: "Deploy two meshed services",
          body: "Annotating the namespace injects a sidecar proxy into every pod, which is what terminates mTLS.",
          code: "kubectl create ns demo\nkubectl annotate ns demo linkerd.io/inject=enabled\nkubectl -n demo create deploy service-b --image=nginx --port=80\nkubectl -n demo expose deploy service-b --port=80\nkubectl -n demo run service-a --image=curlimages/curl -it --rm -- curl -s service-b",
          lang: "bash"
        },
        {
          title: "Confirm mTLS is active between the pods",
          body: "<code>linkerd edges</code> reports whether each connection is secured by mutual TLS.",
          code: "linkerd -n demo edges deploy",
          lang: "bash"
        },
        {
          title: "Capture the traffic to prove it is encrypted",
          body: "Sniff the sidecar's port: the payload is ciphertext even though both pods sit inside your own cluster.",
          code: "POD=$(kubectl -n demo get pod -l app=service-b -o jsonpath='{.items[0].metadata.name}')\nkubectl -n demo debug -it $POD --image=nicolaka/netshoot -- tcpdump -A -n port 4143",
          lang: "bash"
        }
      ],
      observe: "<code>linkerd edges</code> marks the service-a \u2192 service-b connection as <strong>secured</strong> (mTLS), and the packet capture shows ciphertext, not readable HTTP, for traffic that never left your cluster. That is the core Zero Trust claim: inside the network is not automatically trusted.",
      stretch: "Add an authorization policy that denies <code>service-a \u2192 service-b</code> on a specific path and confirm the call is rejected even though network connectivity exists, decoupling <strong>can reach</strong> from <strong>is allowed</strong>."
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
