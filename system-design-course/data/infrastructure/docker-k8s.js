/* === Lesson docker-k8s - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#docker-k8s)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["docker-k8s"] = {
  module: 5, num: "5.5", title: "Docker & Kubernetes",
  connectsFrom: "\u201cWorks on my machine\u201d does not mean it works in production. Different OS versions, missing dependencies, and manual deployment steps all introduce drift between environments.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "k8sObjects", label: "Kubernetes Objects", icon: "layers" },
    { key: "deploy", label: "Deployment & Ops", icon: "loop" }
  ],
  tabs: {
    overview: {
      heading: "Package Once, Orchestrate at Scale",
      intro: "<strong>Docker</strong> packages an app and its dependencies portably. <strong>Kubernetes (K8s)</strong> orchestrates many of those containers across many machines, reconciling actual state toward a declared desired state. These three Docker primitives are the foundation; the K8s objects that run them at scale are in the next tab.",
      cards: [
        { icon: "I", title: "Image", color: "blue", body: "Immutable template with app + dependencies. Built from a Dockerfile, stored in a registry (Docker Hub, ECR)." },
        { icon: "C", title: "Container", color: "green", body: "A running instance of an image. Lightweight isolation (shared kernel, not a full VM), starts in seconds." },
        { icon: "V", title: "Volume", color: "orange", body: "Persistent storage that survives container restarts, outside the container's ephemeral filesystem." }
      ],
      callouts: [
        { color: "green", label: "What Kubernetes guarantees:", body: "K8s guarantees <strong>desired state reconciliation</strong>: if a Pod dies, the controller restarts it. <strong>Self-healing</strong> via liveness and readiness probes. <strong>Service discovery</strong> via DNS." }
      ]
    },
    k8sObjects: {
      heading: "Kubernetes Building Blocks",
      intro: "Kubernetes is a set of objects you declare, and controllers that drive the cluster toward that declaration. These six cover almost every workload.",
      table: {
        headers: ["K8s Concept", "Detail"],
        rows: [
          ["<strong>Pod</strong>", "Smallest deployable unit. 1+ containers sharing network and storage. Ephemeral."],
          ["<strong>Service</strong>", "Stable network endpoint for a set of Pods (ClusterIP, NodePort, LoadBalancer)."],
          ["<strong>Deployment</strong>", "Declarative desired state. Handles rolling updates and rollbacks."],
          ["<strong>HPA</strong>", "Horizontal Pod Autoscaler, scales on CPU, memory, or custom metrics."],
          ["<strong>StatefulSet</strong>", "Ordered, stable Pod identities. For databases, Kafka, ZooKeeper."],
          ["<strong>Ingress</strong>", "HTTP routing rules into the cluster (NGINX Ingress, Traefik). External traffic \u2192 services."]
        ]
      }
    },
    deploy: {
      heading: "Deploying and Operating",
      intro: "How new versions reach the cluster, and who runs Kubernetes in production.",
      callouts: [
        { color: "green", label: "Deployment strategies:", body: "<strong>Rolling</strong> (gradual, the default) \u00b7 <strong>Blue-Green</strong> (swap two full environments) \u00b7 <strong>Canary</strong> (5% of traffic first) \u00b7 <strong>A/B</strong> (feature flags, Istio traffic split)." },
        { color: "yellow", label: "Real-world:", body: "<strong>Google</strong> (Borg was the predecessor). <strong>Spotify</strong> runs 2000+ services on K8s. Managed offerings: <strong>EKS</strong> (AWS), <strong>GKE</strong> (Google), <strong>AKS</strong> (Azure)." }
      ]
    },
    handsOn: {
      prerequisites: "Docker Desktop (includes a local Kubernetes) or `kind`/`minikube`, both free, plus `kubectl`.",
      setup: "Local and free: `kind create cluster`. Cloud free-tier: GKE's free cluster tier or EKS with a free-tier node.",
      simulate: "`kubectl apply` a Deployment with 3 replicas of a simple app, then a Service exposing it. Scale it live with `kubectl scale deployment myapp --replicas=6` and watch new Pods appear with `kubectl get pods -w`. Kill one Pod directly (`kubectl delete pod <name>`) and watch the Deployment controller recreate it automatically within seconds.",
      observe: "Desired-state reconciliation happening with no manual intervention: you deleted a Pod, and Kubernetes noticed the actual state (5 Pods) did not match the desired state (6) and fixed it itself.",
      stretch: "Update the Deployment's image tag and watch `kubectl rollout status` show a Rolling update replacing Pods one at a time with zero downtime, then run `kubectl rollout undo` and confirm it reverts cleanly."
    }
  },
  keyTakeaways: [
    "Docker packages an app plus its dependencies into a portable image, killing \u201cworks on my machine\u201d drift.",
    "Kubernetes orchestrates containers across machines and continuously reconciles actual state toward desired state (self-healing).",
    "Core K8s objects: Pod, Service, Deployment, HPA, StatefulSet, Ingress; rollouts can be Rolling, Blue-Green, Canary, or A/B."
  ],
  proTip: "Never treat a Pod as a pet you SSH into and fix. If a Pod is broken, delete it and let the Deployment recreate it. Declarative desired state is the whole point.",
  related: ["nginx", "service-mesh", "service-discovery", "cicd", "iac", "multi-region", "serverless"],
  bridgeOut: "K8s runs many services, but it does not secure or observe the traffic between them. That is the next gap."
};
