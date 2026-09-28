/* === Lesson service-mesh - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#service-mesh)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["service-mesh"] = {
  module: 5, num: "5.6", title: "Service Mesh",
  connectsFrom: "Once you have dozens of microservices talking to each other (east-west traffic), you need mTLS, retries, and observability between every pair of them. Reimplementing that inside each service is the same copy-paste problem the API Gateway solved, but for service-to-service traffic.",
  tabs: {
    overview: {
      heading: "The Sidecar Pattern",
      intro: "A <strong>sidecar proxy</strong> (Envoy), injected next to every service instance by <strong>Istio</strong> or <strong>Linkerd</strong>, intercepts all of that instance's network traffic transparently, with zero code changes in the service itself. The mesh then applies policy at the proxy layer.",
      cards: [
        { icon: "M", title: "mTLS Everywhere", color: "purple", body: "Mutual TLS between every pair of services by default, the foundation of zero-trust networking." },
        { icon: "O", title: "Observability", color: "blue", body: "Automatic metrics and traces per call, with no instrumentation code in the service." },
        { icon: "T", title: "Traffic Management", color: "green", body: "Canary, retries, and circuit breaking driven by YAML config, not application code." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>mTLS everywhere</strong> (zero-trust). <strong>Automatic observability</strong> (metrics and traces per call). <strong>Traffic management</strong> (canary, retries, circuit breaking) via YAML, not code." },
        { color: "blue", label: "vs API Gateway:", body: "A gateway handles <strong>north-south</strong> traffic (external \u2192 internal). A mesh handles <strong>east-west</strong> traffic (internal \u2192 internal). Different traffic, different tool." }
      ]
    },
    tradeoffs: {
      heading: "Power vs Complexity",
      points: [
        { label: "What you gain", body: "mTLS everywhere, automatic per-call observability, and traffic policies expressed as config instead of code." },
        { label: "What it costs", body: "Real operational complexity to run the mesh control plane, plus one extra sidecar's resource overhead per instance." },
        { label: "When it is worth it", body: "When you have enough services that reimplementing mTLS, retries, and tracing per service is more painful than operating the mesh." }
      ]
    },
    handsOn: {
      prerequisites: "The local K8s cluster from the Docker & Kubernetes lesson, plus `istioctl` or Linkerd's CLI (both free).",
      setup: "Local and free: `istioctl install` (or `linkerd install`) on your `kind` cluster, then label your namespace for automatic sidecar injection.",
      simulate: "Deploy the same 2-service setup from the K8s lesson, label the namespace `istio-injection=enabled`, and redeploy. Check `kubectl get pods` and notice each Pod now shows 2/2 containers (your app plus the injected Envoy sidecar), with zero changes to your application code.",
      observe: "Traffic between the 2 services still works exactly as before, but is now visible in Istio's dashboard (Kiali, if installed) as a service graph with automatic mTLS between them. The \u201czero code changes\u201d claim, confirmed by diffing your app's source before and after.",
      stretch: "Apply an Istio `VirtualService` that injects a 3-second delay on 10% of calls to one service, without touching that service's code at all: a fault-injection test, and a useful preview of Chaos Engineering."
    }
  },
  keyTakeaways: [
    "A service mesh injects a sidecar proxy (Envoy) beside every instance to manage east-west traffic transparently.",
    "It delivers mTLS, per-call observability, and traffic policy as config, with zero application code changes.",
    "The tradeoff is real operational complexity and per-instance sidecar overhead, worth it only at sufficient service count."
  ],
  proTip: "Gateway is north-south, mesh is east-west. If the question is about securing or observing internal service-to-service calls, that is a mesh, not a gateway.",
  related: ["api-gateway", "docker-k8s", "service-discovery", "zero-trust"],
  bridgeOut: "One cluster, one region, is not always enough. The next lesson is what happens once it is not."
};
