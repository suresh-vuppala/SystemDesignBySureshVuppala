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
      goal: "Inject an Envoy sidecar next to a running app with Istio, confirm each Pod becomes 2/2 with zero code changes, and get mTLS plus observability for free.",
      stack: "Istio on the local <code>kind</code> cluster from the Docker &amp; Kubernetes lesson, plus <code>kubectl</code>. Local and free.",
      steps: [
        {
          title: "Install Istio into the cluster",
          code: "curl -L https://istio.io/downloadIstio | sh -\ncd istio-*\nexport PATH=$PWD/bin:$PATH\nistioctl install --set profile=demo -y",
          lang: "bash"
        },
        {
          title: "Turn on automatic sidecar injection",
          body: "Any Pod created in a labelled namespace gets an Envoy sidecar injected transparently.",
          code: "kubectl label namespace default istio-injection=enabled",
          lang: "bash"
        },
        {
          title: "Deploy the app, then redeploy so sidecars inject",
          code: "kubectl apply -f app.yaml\nkubectl rollout restart deployment myapp",
          lang: "bash"
        },
        {
          title: "Confirm each Pod is now 2/2",
          code: "kubectl get pods -l app=myapp\nkubectl get pod -l app=myapp -o jsonpath='{.items[0].spec.containers[*].name}'",
          lang: "bash"
        }
      ],
      observe: "Each Pod now reports <code>2/2</code> containers and the container list shows <code>web istio-proxy</code>: your app plus the injected Envoy, with not a single line changed in your source. Traffic still works exactly as before, now with automatic mTLS between instances.",
      stretch: "Apply an Istio <code>VirtualService</code> with an <code>http.fault.delay</code> of 3s on 10% of calls to the service, without touching its code: a fault-injection test and a first taste of Chaos Engineering."
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
