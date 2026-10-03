/* === Lesson tracing - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#tracing)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["tracing"] = {
  module: 13, num: "13.3", title: "Distributed Tracing",
  connectsFrom: "A single user request can touch a dozen microservices. When it is slow, \u201cwhich one was the bottleneck?\u201d is unanswerable from logs or metrics alone, since neither knows about the others.",
  tabs: {
    overview: {
      heading: "One Request Across Every Service",
      intro: "Tracing tracks a single request across services: <strong>Trace ID \u2192 Spans \u2192 parent-child relationships \u2192 latency breakdown</strong>. Each span is one unit of work, and nesting them reveals exactly which service owned the slow part.",
      cards: [
        { icon: "T", title: "Trace", color: "blue", body: "The end-to-end journey of a single request, identified by one <strong>Trace ID</strong> and made of many spans." },
        { icon: "S", title: "Span", color: "green", body: "A single unit of work, one service call or operation, with a name, duration, status, and a <strong>parent span ID</strong>." },
        { icon: "R", title: "Root Span", color: "orange", body: "The first span in a trace. It sets the total trace duration; every other span is a child nested beneath it." },
        { icon: "X", title: "Span Context", color: "purple", body: "<code>trace_id</code> + <code>span_id</code> + flags, propagated across service boundaries so the trace stays connected." }
      ],
      table: {
        headers: ["Standard", "Header Format", "Example", "Used By"],
        rows: [
          ["<strong>W3C TraceContext</strong>", "<code>traceparent</code> / <code>tracestate</code>", "<code>00-abc123-span456-01</code>", "OpenTelemetry (default), modern systems"],
          ["<strong>B3 (Zipkin)</strong>", "<code>X-B3-TraceId</code> / <code>X-B3-SpanId</code>", "<code>X-B3-TraceId: abc123</code>", "Zipkin, Spring Cloud Sleuth"],
          ["<strong>B3 Single</strong>", "<code>b3</code> (single header)", "<code>abc123-span456-1</code>", "Zipkin compact format"],
          ["<strong>Jaeger</strong>", "<code>uber-trace-id</code>", "<code>abc123:span456:0:1</code>", "Jaeger native (legacy)"],
          ["<strong>Baggage</strong>", "<code>baggage</code>", "<code>user_id=123,region=us</code>", "W3C Baggage, custom context across services"]
        ]
      },
      tables: [
        {
          headers: ["Strategy", "Decision Point", "Pros", "Cons", "Best For"],
          rows: [
            ["<strong>Head-based</strong>", "At trace start (first service)", "Simple, low overhead, consistent", "<strong>May miss interesting traces</strong> (errors decided later)", "High-volume, cost-sensitive"],
            ["<strong>Tail-based</strong>", "After trace completes (collector)", "Keep all errors/slow traces, smarter", "<strong>Higher memory</strong> (buffer full traces), complex", "Debug-focused, error analysis"],
            ["<strong>Priority-based</strong>", "Based on attributes (user tier, endpoint)", "VIP users always traced", "Configuration complexity", "Multi-tenant systems"],
            ["<strong>Rate-limiting</strong>", "N traces per second per service", "Predictable cost", "May miss bursts", "Budget-constrained"]
          ]
        }
      ],
      callouts: [
        { color: "yellow", label: "Async Boundary Propagation:", body: "For <strong>Kafka</strong>, inject trace context into message headers (<code>traceparent</code>). For <strong>SQS</strong>, use message attributes. For <strong>gRPC</strong>, metadata headers. For <strong>HTTP</strong>, request headers. The consumer creates a <strong>new span linked to the producer span</strong> (a SpanLink, not parent-child)." },
        { color: "green", label: "Tools:", body: "<strong>OpenTelemetry</strong> (vendor-neutral SDK), <strong>Jaeger</strong> (open-source backend), <strong>Zipkin</strong> (lightweight), <strong>Datadog APM</strong>, <strong>AWS X-Ray</strong>, <strong>Tempo</strong> (Grafana, object storage). Sample 100% of errors, 1-5% of successes." },
        { color: "blue", label: "One-liner:", body: "Propagate <strong>W3C TraceContext</strong> headers across all boundaries. Use <strong>tail-based sampling</strong> to capture errors. Every span needs service name, operation, duration, status, and <strong>parent span ID</strong>." }
      ]
    },
    realWorld: {
      heading: "Backends, Standards, and Sampling",
      intro: "A trace is only useful if context survives every hop and the interesting traces get kept.",
      points: [
        { label: "Propagation standards", body: "<strong>W3C TraceContext</strong> is the OpenTelemetry default. Others: B3 and B3 Single (Zipkin), Jaeger\u2019s legacy <code>uber-trace-id</code>, and Baggage for carrying arbitrary custom context alongside the trace." },
        { label: "Backends worth naming", body: "Jaeger, Zipkin, Datadog APM, AWS X-Ray, and Grafana Tempo. Tempo uses cheap object storage to keep long retention affordable." },
        { label: "Sampling strategies", body: "Head-based (decide at trace start, low overhead), tail-based (decide after the trace completes, keeps all errors and slow traces), priority-based (VIP users always traced), and rate-limiting (predictable cost). A practical rule: 100% of errors, 1-5% of successes." },
        { label: "The latency breakdown", body: "A trace renders nested spans with exact per-service timing, so the bottleneck is visually obvious: a DB span that is 36% of total duration jumps out immediately." }
      ]
    },
    tradeoffs: {
      heading: "Where Tracing Gets Hard",
      intro: "The two recurring challenges are crossing async boundaries and choosing when to sample.",
      points: [
        { label: "Async boundary propagation", body: "Trace context does not survive a queue or Kafka topic automatically; it must be explicitly carried in headers or message attributes. Across a queue, the consumer usually creates a linked <strong>SpanLink</strong> rather than a strict parent-child span, because producer and consumer are not in the same causal timeframe." },
        { label: "Head-based sampling", body: "Deciding at the start is simple and low-overhead, but it may discard the very traces you needed, since errors are only known later." },
        { label: "Tail-based sampling", body: "Deciding after completion keeps every error and slow trace, but it costs more memory (you buffer full traces) and adds collector complexity." }
      ]
    },
    handsOn: {
      goal: "Run 3 tiny HTTP services instrumented with OpenTelemetry that call each other in a chain, and read one trace in Jaeger that breaks the latency down span by span.",
      stack: "Jaeger all-in-one in Docker + the OpenTelemetry Node SDK with auto-instrumentation. Local and free.",
      steps: [
        {
          title: "Start Jaeger all-in-one",
          body: "Port 16686 is the UI; 4318 is the OTLP/HTTP ingest endpoint.",
          code: "docker run -d --name jaeger -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:1.57",
          lang: "bash"
        },
        {
          title: "Write a shared OTel bootstrap",
          body: "Save as <code>tracing.js</code>. Preloading it auto-instruments the built-in <code>http</code> module, which injects and reads the <code>traceparent</code> header for you.",
          code: "const { NodeSDK } = require('@opentelemetry/sdk-node');\nconst { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');\nconst { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');\n\nconst sdk = new NodeSDK({\n  serviceName: process.env.SVC || 'unknown',\n  traceExporter: new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' }),\n  instrumentations: [getNodeAutoInstrumentations()]\n});\nsdk.start();",
          lang: "javascript"
        },
        {
          title: "Write three tiny chained services",
          body: "gateway (3000) calls serviceA (3001) calls serviceB (3002). serviceB sleeps 120ms so it is the obvious bottleneck.",
          code: "// gateway.js\nconst http = require('http');\nhttp.createServer((req, res) => {\n  http.get('http://localhost:3001/', up => up.on('data', () => {}).on('end', () => res.end('gateway ok')));\n}).listen(3000);\n\n// serviceA.js\nconst http = require('http');\nhttp.createServer((req, res) => {\n  http.get('http://localhost:3002/', up => up.on('data', () => {}).on('end', () => res.end('A ok')));\n}).listen(3001);\n\n// serviceB.js\nconst http = require('http');\nhttp.createServer((req, res) => setTimeout(() => res.end('B ok'), 120)).listen(3002);",
          lang: "javascript"
        },
        {
          title: "Install deps and run all three with the tracer preloaded",
          code: "npm init -y\nnpm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http\nSVC=serviceB node -r ./tracing.js serviceB.js &\nSVC=serviceA node -r ./tracing.js serviceA.js &\nSVC=gateway node -r ./tracing.js gateway.js &",
          lang: "bash"
        },
        {
          title: "Fire one request and open the trace",
          body: "In the Jaeger UI pick service <code>gateway</code> and open the newest trace.",
          code: "curl http://localhost:3000/\n# then browse to http://localhost:16686",
          lang: "bash"
        }
      ],
      observe: "One trace shows gateway, serviceA, and serviceB as nested spans with exact per-service timing, and serviceB\u2019s ~120ms sleep is visibly the bottleneck. The <code>traceparent</code> header was propagated automatically by auto-instrumentation, so the chain stays connected without any manual header code.",
      stretch: "Add a Kafka hop in the middle (serviceA publishes an event serviceB consumes asynchronously) and manually inject the trace context into the message headers. Confirm the trace still connects across the queue as a span link rather than a strict parent-child span."
    }
  },
  keyTakeaways: [
    "A trace is a <strong>Trace ID</strong> plus nested <strong>spans</strong> (parent-child) that give a full per-service latency breakdown, answering \u201cwhich service was slow?\u201d directly.",
    "Context must be <strong>propagated</strong> across every boundary; W3C TraceContext is the default, and async hops (Kafka, SQS) need explicit header injection and often a SpanLink.",
    "Sampling trades cost for coverage: head-based is cheap but misses late-discovered errors; tail-based keeps all errors at higher memory cost. Rule of thumb: 100% errors, 1-5% successes."
  ],
  proTip: "When a trace stops at a queue, you have an async propagation bug: the producer did not inject <code>traceparent</code> into the message. Fix the injection and the consumer will link back to the right trace.",
  related: ["logging", "metrics", "monitoring", "opentelemetry", "kafka", "dashboards", "incident-response"],
  bridgeOut: "Collecting metrics and traces is useless if nobody notices when they cross a dangerous threshold. Next: monitoring and alerting, the layer that pages a human only when action is needed."
};
