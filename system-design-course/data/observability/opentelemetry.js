/* === Lesson opentelemetry - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#opentelemetry)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.5.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["opentelemetry"] = {
  module: 13, num: "13.5", title: "OpenTelemetry",
  connectsFrom: "13.2 and 13.3 each named their own collector. OpenTelemetry is the vendor-neutral standard that unifies both into one instrumentation layer: <strong>one SDK for Traces + Metrics + Logs</strong>. Instrument once, export to any backend.",
  tabs: {
    overview: {
      heading: "One SDK for All Three Signals",
      intro: "OpenTelemetry is a <strong>vendor-neutral</strong> observability framework, a CNCF graduated project and the industry standard. You instrument once and export everywhere, so switching backends never means re-instrumenting your code.",
      cards: [
        { icon: "T", title: "Traces", color: "blue", body: "API model: <strong>TracerProvider \u2192 Tracer \u2192 Span</strong>. Captures request flow across services." },
        { icon: "M", title: "Metrics", color: "green", body: "API model: <strong>MeterProvider \u2192 Meter \u2192 Instrument</strong> (Counter, Histogram, Gauge, UpDownCounter). Numeric measurements over time." },
        { icon: "L", title: "Logs", color: "orange", body: "API model: <strong>LoggerProvider \u2192 Logger \u2192 LogRecord</strong>. Discrete events carrying a <code>trace_id</code> for correlation." }
      ],
      table: {
        headers: ["Signal", "What It Captures", "OTel API", "Data Model", "Best Backend"],
        rows: [
          ["<strong>Traces</strong>", "Request flow across services", "TracerProvider \u2192 Tracer \u2192 Span", "Spans with parent-child, attributes, events", "Jaeger, Tempo, Zipkin"],
          ["<strong>Metrics</strong>", "Numeric measurements over time", "MeterProvider \u2192 Meter \u2192 Instrument", "Counter, Histogram, Gauge, UpDownCounter", "Prometheus, Datadog"],
          ["<strong>Logs</strong>", "Discrete events with context", "LoggerProvider \u2192 Logger \u2192 LogRecord", "Timestamp, severity, body, attributes, trace_id", "Loki, Elasticsearch"]
        ]
      },
      tables: [
        {
          headers: ["Type", "How", "Effort", "Coverage", "Example"],
          rows: [
            ["<strong>Auto-instrumentation</strong>", "Agent/SDK hooks into frameworks automatically", "Zero code changes", "HTTP, DB, gRPC, messaging", "Java agent, Python auto-instr, Node.js require hook"],
            ["<strong>Manual instrumentation</strong>", "Developer adds spans/metrics in code", "Code changes required", "Business logic, custom operations", "<code>tracer.startSpan(\u201cprocessPayment\u201d)</code>"],
            ["<strong>Semantic Conventions</strong>", "Standardized attribute names", "Follow naming guide", "Cross-service consistency", "<code>http.method</code>, <code>db.system</code>, <code>rpc.service</code>"]
          ]
        },
        {
          headers: ["Pattern", "Architecture", "Pros", "Cons", "Best For"],
          rows: [
            ["<strong>Sidecar</strong>", "Collector per pod (DaemonSet or sidecar container)", "Isolation, per-service config, low latency", "More resource usage, many instances", "Kubernetes, per-service sampling"],
            ["<strong>Gateway</strong>", "Centralized collector cluster (Deployment)", "Fewer instances, centralized config, easier to manage", "Single point of failure, network hop", "Simple setups, centralized processing"],
            ["<strong>Agent + Gateway</strong>", "Local agent \u2192 central gateway (two-tier)", "Best of both: local buffering + central processing", "More complex, two configs", "Large-scale production"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Key benefits:", body: "<strong>Vendor-neutral</strong>: switch backends without re-instrumenting. <strong>Correlation</strong>: <code>trace_id</code> links logs, traces, and metrics together. <strong>Semantic conventions</strong>: standardized attribute names across languages. <strong>Collector</strong>: offloads batching, retry, and sampling from the app." },
        { color: "blue", label: "One-liner:", body: "Use <strong>OTel auto-instrumentation</strong> for 80% coverage, add <strong>manual spans</strong> for business logic. Deploy the collector as <strong>agent + gateway</strong> in production. Correlate all three signals via <code>trace_id</code>." }
      ]
    },
    realWorld: {
      heading: "Architecture and Instrumentation",
      intro: "OpenTelemetry is a pipeline: your app sends one protocol to a collector, and the collector fans out to whatever backends you choose.",
      points: [
        { label: "The pipeline", body: "SDK \u2192 OTel Collector \u2192 backends. The collector has <strong>Receivers</strong> (OTLP, Prometheus, Jaeger, Zipkin), <strong>Processors</strong> (batch, filter, transform, sampling), <strong>Exporters</strong> (OTLP, Prometheus, Jaeger, Datadog), and <strong>Connectors</strong> that route between pipelines. Backends include Jaeger/Tempo, Prometheus, Loki/Elasticsearch, Datadog, and New Relic." },
        { label: "Instrumentation patterns", body: "<strong>Auto-instrumentation</strong> hooks frameworks with zero code changes (HTTP, DB, gRPC, messaging). <strong>Manual instrumentation</strong> adds spans for business logic. <strong>Semantic conventions</strong> standardize attribute names (<code>http.method</code>, <code>db.system</code>, <code>rpc.service</code>) so different teams\u2019 telemetry is comparable." },
        { label: "Correlation across signals", body: "Because a shared <code>trace_id</code> flows through all three signals, you can click from a metric spike to the trace that caused it to the logs that explain it." }
      ]
    },
    tradeoffs: {
      heading: "Collector Deployment Patterns",
      intro: "Where you run the collector is a real tradeoff between isolation, cost, and operational complexity.",
      points: [
        { label: "Sidecar", body: "A collector per pod (DaemonSet or sidecar container). Pros: isolation, per-service config, low latency. Cons: more resource usage and many instances. Best for Kubernetes and per-service sampling." },
        { label: "Gateway", body: "A centralized collector cluster (Deployment). Pros: fewer instances, centralized config, easier to manage. Cons: a single point of failure and an extra network hop. Best for simple setups and centralized processing." },
        { label: "Agent + Gateway", body: "A local agent feeding a central gateway (two-tier). Pros: the best of both, local buffering plus central processing. Cons: more complex, two configs. Best for large-scale production." }
      ]
    },
    handsOn: {
      goal: "Put an OTel Collector between your app and its backends so that adding a second trace backend is a config edit, not a code change, proving vendor-neutrality instead of asserting it.",
      stack: "OpenTelemetry Collector in Docker in front of the Jaeger and Prometheus setups from 13.2/13.3. Local and free.",
      steps: [
        {
          title: "Write the Collector config",
          body: "Save as <code>otel-collector.yaml</code>. One OTLP receiver fans out to Jaeger (traces) and a Prometheus scrape endpoint (metrics).",
          code: "receivers:\n  otlp:\n    protocols:\n      http:\n        endpoint: 0.0.0.0:4318\n      grpc:\n        endpoint: 0.0.0.0:4317\n\nprocessors:\n  batch: {}\n\nexporters:\n  otlp/jaeger:\n    endpoint: jaeger:4317\n    tls:\n      insecure: true\n  prometheus:\n    endpoint: 0.0.0.0:8889\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [batch]\n      exporters: [otlp/jaeger]\n    metrics:\n      receivers: [otlp]\n      processors: [batch]\n      exporters: [prometheus]",
          lang: "yaml"
        },
        {
          title: "Start the Collector",
          code: "docker run -d --name otelcol --net obs -p 4318:4318 -p 4317:4317 -p 8889:8889 -v \"$PWD/otel-collector.yaml:/etc/otelcol/config.yaml\" otel/opentelemetry-collector:0.102.1",
          lang: "bash"
        },
        {
          title: "Point the app at the Collector only",
          body: "The app now exports OTLP to the Collector and no longer names any backend. This is the one line that changes.",
          code: "new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' });",
          lang: "javascript"
        },
        {
          title: "Verify traces in Jaeger and metrics on the Collector",
          code: "curl http://localhost:3000/\n# traces: browse to http://localhost:16686 (Jaeger)\ncurl -s http://localhost:8889/metrics | head",
          lang: "bash"
        },
        {
          title: "Add a Zipkin exporter with no app change",
          body: "Start Zipkin (<code>docker run -d --name zipkin --net obs -p 9411:9411 openzipkin/zipkin</code>), then add the exporter and list it in the traces pipeline. Restart the Collector. Your app code is untouched.",
          code: "exporters:\n  zipkin:\n    endpoint: http://zipkin:9411/api/v2/spans\n\nservice:\n  pipelines:\n    traces:\n      exporters: [otlp/jaeger, zipkin]",
          lang: "yaml"
        }
      ],
      observe: "The same app code keeps sending to one OTLP endpoint, yet traces now land in both Jaeger and Zipkin and metrics still reach Prometheus. Adding a backend was purely a Collector config edit. Vendor-neutrality, demonstrated instead of asserted.",
      stretch: "Add a <code>filter</code> processor to the traces pipeline that drops any span with <code>http.request.method</code> GET on a <code>/healthz</code> path, cutting health-check noise before it ever reaches a trace backend."
    }
  },
  keyTakeaways: [
    "OpenTelemetry is <strong>one vendor-neutral SDK</strong> for traces, metrics, and logs; instrument once and export to any backend without re-instrumenting.",
    "The <strong>Collector</strong> (Receivers \u2192 Processors \u2192 Exporters) decouples your app from backends and offloads batching, sampling, and retry; deploy it as agent + gateway in production.",
    "<strong>Semantic conventions</strong> and a shared <code>trace_id</code> make telemetry comparable across teams and correlate all three signals together."
  ],
  proTip: "Start with auto-instrumentation for roughly 80% coverage for free, then add manual spans only around business logic that matters. Point everything at a Collector so backend choices become a config change, not a code change.",
  related: ["metrics", "tracing", "logging", "monitoring", "dashboards"],
  bridgeOut: "All this signal needs a first screen a human actually looks at during an incident. Next: dashboards and visualization, where telemetry becomes usable under pressure."
};
