/* === Lesson auto-scaling - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#auto-scaling)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["auto-scaling"] = {
  module: 10, num: "10.9", title: "Auto-Scaling",
  connectsFrom: "Provisioning for peak load 24/7 wastes money every non-peak hour; provisioning for average load means every spike causes an outage. Auto-scaling matches capacity to load instead.",
  tabs: {
    overview: {
      heading: "Match Capacity to Load",
      intro: "Auto-scaling matches capacity to load, either <strong>reactively</strong> (metrics-driven) or <strong>predictively</strong> (ML or schedule-based). The golden rule: <strong>scale up fast, scale down slow</strong>, and scale up on leading indicators (queue depth) while scaling down on trailing ones (CPU).",
      cards: [
        { icon: "S", title: "Signals", color: "blue", body: "CPU utilization, queue depth or consumer lag, request rate or p99 latency, memory and I/O, custom business metrics, or a known schedule." },
        { icon: "P", title: "Policy", color: "purple", body: "<strong>Target Tracking</strong>, <strong>Step Scaling</strong>, <strong>Predictive</strong> (ML-forecasted), and <strong>Scheduled</strong> (cron-based)." },
        { icon: "A", title: "Actions", color: "green", body: "Scale up fast (~30\u201360s), scale down slow (drain connections first), cluster autoscaler adds whole nodes, and pre-warming scales ahead of an expected spike." }
      ],
      table: {
        headers: ["Platform", "Tool", "Signals", "Key feature"],
        rows: [
          ["<strong>Kubernetes</strong>", "HPA", "CPU, memory, custom metrics", "Native, any metric via Prometheus adapter"],
          ["<strong>Kubernetes</strong>", "KEDA", "Queue depth, Kafka lag, cron, HTTP", "<strong>Scale to zero</strong>, 50+ scalers, event-driven"],
          ["<strong>AWS</strong>", "ASG + Target Tracking", "CPU, ALB request count, custom CW", "Predictive scaling, warm pools"],
          ["<strong>AWS</strong>", "Lambda (implicit)", "Concurrent invocations", "Instant scale, per-request billing"],
          ["<strong>GCP</strong>", "Managed Instance Groups", "CPU, HTTP LB, Pub/Sub backlog", "Predictive autoscaling"],
          ["<strong>Azure</strong>", "VMSS Autoscale", "CPU, queue, custom metrics", "Scale-in policy, overprovisioning"]
        ]
      },
      callouts: [
        { color: "green", label: "Combine signals:", body: "Base scaling on <strong>CPU for steady state</strong>, but use <strong>queue depth for burst detection</strong> (a leading indicator). Add <strong>predictive scaling</strong> to pre-warm before known peaks, and set <strong>min instances</strong> to cover baseline plus sudden spikes during scale-up lag." },
        { color: "yellow", label: "Scale-down safety:", body: "Use <strong>connection draining</strong> (deregister from the LB, finish in-flight requests). Set a <strong>termination grace period</strong> (K8s preStop hook). <strong>Scale down one at a time</strong> to avoid cascading failures, and never drop below <strong>N+1 capacity</strong>." }
      ]
    },
    realWorld: {
      heading: "Auto-Scaling at Scale",
      points: [
        { label: "Netflix", body: "Titus auto-scaling with predictive models that pre-warm for the evening peak." },
        { label: "Uber", body: "The Peloton scheduler scales 4M+ containers." },
        { label: "Shopify", body: "Scales to 80K+ requests/sec during flash sales using predictive plus reactive policies." },
        { label: "Slack", body: "KEDA scales workers based on job-queue depth, an event-driven signal HPA alone cannot see." }
      ]
    },
    tradeoffs: {
      heading: "Where Auto-Scaling Bites",
      intro: "Auto-scaling is powerful but easy to misconfigure into thrashing or runaway cost.",
      points: [
        { label: "Scaling on a single metric", body: "CPU can look fine while memory or a queue is the real bottleneck. One metric misses the actual constraint." },
        { label: "No cooldown", body: "Without cooldown periods the system thrashes: scale up, down, up, down, churning instances and cold-starting caches repeatedly." },
        { label: "No max limit", body: "Runaway scaling means runaway cost. A bug or attack that drives the signal up will happily spin up unlimited instances." },
        { label: "Scaling stateful services without draining", body: "Removing an instance mid-request drops connections or loses data. Stateful tiers need draining, and often vertical scaling first, then sharding." },
        { label: "Cold starts", body: "A new instance needs boot plus warm cache; a Lambda cold start ranges from 100ms to 10s by runtime. Warm pools and predictive scaling hide this." }
      ]
    },
    handsOn: {
      goal: "Drive a HorizontalPodAutoscaler with real CPU load and watch replicas climb fast on the way up but drain slowly on the way down.",
      stack: "A local Kubernetes cluster (minikube) with metrics-server, <code>kubectl</code>, and the classic <code>hpa-example</code> workload. Local and free.",
      steps: [
        {
          title: "Start a cluster with metrics-server",
          body: "The metrics-server add-on is required so the HPA can read CPU.",
          code: "minikube start\nminikube addons enable metrics-server",
          lang: "bash"
        },
        {
          title: "Define a CPU-bound app and a service",
          body: "The <code>hpa-example</code> image burns CPU per request. Save as <code>app.yaml</code>.",
          code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: php-apache\nspec:\n  replicas: 2\n  selector:\n    matchLabels: { run: php-apache }\n  template:\n    metadata:\n      labels: { run: php-apache }\n    spec:\n      containers:\n      - name: php-apache\n        image: registry.k8s.io/hpa-example\n        ports:\n        - containerPort: 80\n        resources:\n          requests:\n            cpu: 200m\n          limits:\n            cpu: 500m\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: php-apache\nspec:\n  selector: { run: php-apache }\n  ports:\n  - port: 80",
          lang: "yaml"
        },
        {
          title: "Deploy it and create the autoscaler",
          body: "Target 50% CPU, min 2 replicas, max 10.",
          code: "kubectl apply -f app.yaml\nkubectl autoscale deployment php-apache --cpu-percent=50 --min=2 --max=10",
          lang: "bash"
        },
        {
          title: "Generate load and watch it scale",
          body: "Run the load pod in one terminal and the watch in another.",
          code: "kubectl run load --image=busybox --restart=Never -- /bin/sh -c \"while true; do wget -q -O- http://php-apache; done\"\nkubectl get hpa -w\nkubectl get pods -w",
          lang: "bash"
        }
      ],
      observe: "Replica count climbs from 2 toward 10 as CPU crosses the 50% target, and the important part is the asymmetry: scale-up appears within roughly 30-60s of crossing the threshold, while scale-down waits several minutes of sustained low usage (the stabilization window) to avoid flapping. Delete the load pod and time how much longer it takes to shrink back.",
      stretch: "Install KEDA and scale on RabbitMQ queue depth instead of CPU. Confirm it reacts to a backlog building even when CPU on the existing pods is low, a leading-indicator signal plain HPA cannot see."
    }
  },
  keyTakeaways: [
    "Auto-scaling matches capacity to load reactively (metrics) or predictively (ML or schedule); the golden rule is <strong>scale up fast, scale down slow</strong>.",
    "Scale up on leading indicators (queue depth), scale down on trailing ones (CPU), and combine signals so you do not miss the real bottleneck.",
    "Guardrails matter: cooldowns prevent thrashing, a max limit prevents runaway cost, and connection draining protects stateful and in-flight work."
  ],
  proTip: "Set min instances above raw baseline so you can absorb a spike during the scale-up lag itself. The seconds it takes new capacity to warm up are exactly when an unbuffered service falls over.",
  related: ["backpressure", "rate-limiting", "graceful-degradation", "kafka", "scaling-choice", "scaling-basics"],
  bridgeOut: "Every pattern in this module tries to prevent overload. The last lesson is the deliberate plan for when prevention still is not enough: graceful degradation."
};
