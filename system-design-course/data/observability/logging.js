/* === Lesson logging - part of Module 13 (Observability) ===
   Source: system-design-cheatsheet/13-observability.html (#logging)
   + system-design-cheatsheet-course-hierarchy.md, Module 13.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["logging"] = {
  module: 13, num: "13.1", title: "Logging",
  connectsFrom: "Data Pipelines built a live, moving, distributed system, and you cannot operate what you cannot see. Every system built across this course produces events worth recording, and logging is the most basic way to record them.",
  tabs: {
    overview: {
      heading: "Structured, Immutable Forensic Records",
      intro: "Logging emits <strong>structured JSON</strong> with correlation IDs so system behavior becomes searchable after the fact. Levels run DEBUG \u2192 INFO \u2192 WARN \u2192 ERROR \u2192 FATAL. It is the foundation of observability: <strong>immutable forensic records</strong> of what happened on one machine.",
      cards: [
        { icon: "J", title: "Structured JSON", color: "blue", body: "Every line carries a field schema: <code>trace_id</code>, <code>span_id</code>, <code>correlation_id</code>, plus a <code>context</code> block (host, region, environment). Fields, not free text, are what make logs searchable." },
        { icon: "C", title: "Correlation IDs", color: "green", body: "A shared <strong>correlation_id</strong> and <strong>trace_id</strong> stitch one request\u2019s log lines together as it crosses services, so you can follow a single flow end to end." },
        { icon: "P", title: "The Pipeline", color: "orange", body: "app \u2192 shipper (Fluentd/Filebeat) \u2192 buffer (often Kafka) \u2192 storage/search (Elasticsearch) \u2192 visualization (Kibana). The classic <strong>ELK/EFK stack</strong>, handling 100K+ logs/sec with Kafka buffering." }
      ],
      table: {
        headers: ["Level", "When to Use", "Example", "Alert?"],
        rows: [
          ["<strong>FATAL</strong>", "System cannot continue, process will exit", "Cannot bind to port, OOM killer", "Page immediately"],
          ["<strong>ERROR</strong>", "Operation failed, needs attention", "Payment gateway timeout, DB connection lost", "Alert if rate &gt; threshold"],
          ["<strong>WARN</strong>", "Unexpected but recoverable, degraded state", "Retry succeeded, cache miss fallback, deprecated API call", "Monitor trend"],
          ["<strong>INFO</strong>", "Normal business events, audit trail", "Order placed, user login, deployment started", "No"],
          ["<strong>DEBUG</strong>", "Developer troubleshooting, verbose", "SQL query, request/response body, cache key", "No, never in prod"],
          ["<strong>TRACE</strong>", "Extremely detailed, method entry/exit", "Function arguments, loop iterations", "No, dev only"]
        ]
      },
      tables: [
        {
          headers: ["Strategy", "How It Works", "Sample Rate", "Best For"],
          rows: [
            ["<strong>Always sample errors</strong>", "100% of ERROR/FATAL logs retained", "100%", "All environments"],
            ["<strong>Rate-based</strong>", "Keep 1 in N logs per time window", "1-10%", "High-volume INFO logs"],
            ["<strong>Priority-based</strong>", "Sample based on log level + service criticality", "Varies", "Cost optimization"],
            ["<strong>Tail-based</strong>", "Decide after request completes (keep if slow/error)", "Dynamic", "Distributed tracing correlation"],
            ["<strong>Hash-based</strong>", "Consistent sampling by trace_id hash", "Configurable", "Correlated log/trace sampling"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "What logging guarantees:", body: "<strong>Immutability</strong> (forensics, compliance). <strong>Searchability</strong>. <strong>Correlation IDs</strong> trace flow across services. Never log passwords or PII. Sample 100% of errors, 1-10% of normal traffic. Tools: <strong>ELK</strong>, Splunk, Loki, CloudWatch." },
        { color: "yellow", label: "\u26a0\ufe0f Log Anti-Patterns:", body: "<strong>Logging PII/secrets</strong> \u00b7 <strong>Unstructured string concatenation</strong> \u00b7 <strong>Logging inside tight loops</strong> \u00b7 <strong>No correlation ID</strong> \u00b7 <strong>Logging full request bodies in prod</strong> \u00b7 <strong>Missing timestamps</strong>" },
        { color: "blue", label: "One-liner:", body: "Emit <strong>structured JSON</strong> with <strong>correlation_id</strong> + <strong>trace_id</strong>. Ship via <strong>Fluentd \u2192 Kafka \u2192 ES</strong>. Sample 100% errors, 1-10% info. Never log PII. Use log levels as severity contracts." }
      ]
    },
    realWorld: {
      heading: "How Logs Reach a Searchable Store",
      intro: "The path from a print statement to a searchable dashboard is a pipeline, and each stage has a job.",
      points: [
        { label: "The ELK / EFK stack", body: "The industry-standard shape: Elasticsearch stores and indexes, Kibana visualizes, and Filebeat or Fluentd ships. It handles 100K+ logs/sec when a Kafka buffer sits in front." },
        { label: "Shipping and buffering", body: "Shippers like <strong>Fluentd</strong> and <strong>Filebeat</strong> parse, enrich, and filter at the edge; a <strong>Kafka</strong> buffer decouples producers from storage and absorbs backpressure during spikes." },
        { label: "Sampling at volume", body: "Always sample errors (100%), then rate-based (1-10% of INFO), priority-based (more for VIP traffic), tail-based (decide after seeing the full trace), and hash-based (deterministic by trace_id for consistent cross-service sampling)." },
        { label: "Storage tiers and tools", body: "Elasticsearch tiers logs hot/warm/cold to control cost. Alternatives to ES include Splunk, Loki, and CloudWatch." }
      ]
    },
    tradeoffs: {
      heading: "Logging Anti-Patterns",
      intro: "Most logging pain is self-inflicted. These are the recurring mistakes.",
      points: [
        { label: "Logging PII or secrets", body: "Passwords, tokens, and personal data in plaintext are a compliance and security incident waiting to happen. Redact fields (for example anything named <code>password</code>) in the shipper before they ever reach storage." },
        { label: "Unstructured string concatenation", body: "<code>\"user \" + id + \" logged in\"</code> is nearly unsearchable. Structured JSON fields let you filter precisely on <code>level</code>, <code>trace_id</code>, or any attribute." },
        { label: "Logging inside tight loops", body: "High-frequency log lines flood the pipeline, blow up storage cost, and bury the signal that matters." },
        { label: "Full request bodies in production", body: "Logging entire payloads leaks data and inflates volume. Missing timestamps and missing correlation IDs make what remains hard to reconstruct." }
      ]
    },
    handsOn: {
      goal: "Ship structured JSON logs into Elasticsearch with Filebeat, prove a field query like <code>level:ERROR</code> beats unstructured text, then redact a leaked <code>password</code> field before it lands.",
      stack: "Elasticsearch + Kibana + Filebeat in Docker, fed by a tiny Node.js app. Local and free.",
      steps: [
        {
          title: "Start Elasticsearch and Kibana",
          code: "docker network create obs\ndocker run -d --name es --net obs -p 9200:9200 -e discovery.type=single-node -e xpack.security.enabled=false docker.elastic.co/elasticsearch/elasticsearch:8.13.0\ndocker run -d --name kibana --net obs -p 5601:5601 -e ELASTICSEARCH_HOSTS=http://es:9200 docker.elastic.co/kibana/kibana:8.13.0",
          lang: "bash"
        },
        {
          title: "Emit structured JSON logs from an app",
          body: "Each line is one JSON object with <code>timestamp</code>, <code>level</code>, <code>trace_id</code>, and <code>message</code>. Save as <code>app.js</code> and run it with <code>node app.js</code> so the file keeps growing.",
          code: "const fs = require('fs');\nconst out = fs.createWriteStream('app.log', { flags: 'a' });\nfunction log(level, message, extra) {\n  const line = Object.assign(\n    { timestamp: new Date().toISOString(), level, trace_id: Math.random().toString(16).slice(2, 10), message },\n    extra || {}\n  );\n  out.write(JSON.stringify(line) + '\\n');\n}\nsetInterval(() => {\n  log('INFO', 'order placed', { order_id: Math.floor(Math.random() * 1000) });\n  if (Math.random() < 0.2) log('ERROR', 'payment gateway timeout');\n}, 500);\nconsole.log('writing app.log ...');",
          lang: "javascript"
        },
        {
          title: "Configure Filebeat to parse the NDJSON",
          body: "Save as <code>filebeat.yml</code>. The <code>ndjson</code> parser promotes every JSON key to a top-level searchable field.",
          code: "filebeat.inputs:\n  - type: filestream\n    id: app\n    paths:\n      - /logs/app.log\n    parsers:\n      - ndjson:\n          target: \"\"\n          overwrite_keys: true\n          add_error_key: true\n\noutput.elasticsearch:\n  hosts: [\"http://es:9200\"]\n  index: \"app-logs-%{+yyyy.MM.dd}\"\n\nsetup.template.name: \"app-logs\"\nsetup.template.pattern: \"app-logs-*\"\nsetup.ilm.enabled: false",
          lang: "yaml"
        },
        {
          title: "Start Filebeat pointing at the log file",
          code: "docker run -d --name filebeat --net obs -v \"$PWD/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro\" -v \"$PWD/app.log:/logs/app.log:ro\" docker.elastic.co/beats/filebeat:8.13.0 filebeat -e --strict.perms=false",
          lang: "bash"
        },
        {
          title: "Query only the ERROR lines by field",
          body: "One structured field, one clean query. No fragile text matching.",
          code: "curl -s \"http://localhost:9200/app-logs-*/_search?q=level:ERROR&size=5\" | jq \".hits.hits[]._source\"",
          lang: "bash"
        },
        {
          title: "Redact a leaked password field before indexing",
          body: "Add this to <code>filebeat.yml</code> and restart the Filebeat container. Any field named <code>password</code> is dropped before it reaches Elasticsearch.",
          code: "processors:\n  - drop_fields:\n      fields: [\"password\"]\n      ignore_missing: true",
          lang: "yaml"
        }
      ],
      observe: "The <code>level:ERROR</code> query returns only error lines cleanly. If you had instead logged <code>console.log('user ' + id + ' logged in')</code>, you would be stuck writing a fragile full-text match. That side by side is the structured versus unstructured anti-pattern, felt directly.",
      stretch: "Log a fake <code>password</code> field on purpose, then confirm the <code>drop_fields</code> processor strips it before it ever reaches Elasticsearch. A real mitigation for the PII-in-logs anti-pattern, not just a warning."
    }
  },
  keyTakeaways: [
    "Logs are <strong>immutable, structured JSON</strong> records; fields like <code>trace_id</code> and <code>correlation_id</code> are what make them searchable and correlatable across services.",
    "The classic pipeline is app \u2192 shipper \u2192 Kafka buffer \u2192 Elasticsearch \u2192 Kibana (the ELK/EFK stack), with sampling (100% errors, 1-10% info) to control volume.",
    "The dangerous anti-patterns are logging PII/secrets, unstructured concatenation, tight-loop logging, and full request bodies in production."
  ],
  proTip: "Treat log levels as a severity contract: if a line would not change what an on-call engineer does, it is INFO or lower, not ERROR. And redact PII in the shipper, never trust yourself to remember at the call site.",
  related: ["metrics", "tracing", "monitoring", "kafka", "incident-response", "opentelemetry"],
  bridgeOut: "Logs tell you what happened on one machine. Metrics tell you how the system as a whole is behaving in aggregate, and that is the fastest way to answer \u201cis it healthy right now?\u201d"
};
