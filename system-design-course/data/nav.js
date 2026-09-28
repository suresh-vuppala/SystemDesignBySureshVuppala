/* === Course Navigation Structure - System Design ===
   All 15 modules, all 141 lessons. Only Module 1's lessons have full content
   wired up (see data/module-1.js); the rest render a "coming soon" state so
   the sidebar is complete and navigable end-to-end from day one. */

window.COURSE_NAV = {
  courseTitle: "System Design",
  courseSubtitle: "Beginner to Advanced",
  modules: [
    {
      num: 1, title: "Foundations", slug: "foundations",
      lessons: [
        { num: "1.1", title: "Design Interview Framework", slug: "sd-framework" },
        { num: "1.2", title: "FR vs NFR", slug: "fr-nfr" },
        { num: "1.3", title: "NFR Metrics & SLOs", slug: "nfr-metrics" },
        { num: "1.4", title: "Scaling Basics", slug: "scaling-basics" },
        { num: "1.5", title: "Stateless vs Stateful", slug: "stateless-stateful" },
        { num: "1.6", title: "Serialization", slug: "serialization" },
        { num: "1.7", title: "Concurrency & I/O Models", slug: "concurrency-io" }
      ]
    },
    {
      num: 2, title: "Networking", slug: "networking",
      lessons: [
        { num: "2.1", title: "Journey of a URL", slug: "web-request" },
        { num: "2.2", title: "OSI Model", slug: "osi" },
        { num: "2.3", title: "TCP vs UDP", slug: "tcp-udp" },
        { num: "2.4", title: "HTTP vs HTTPS", slug: "http-https" },
        { num: "2.5", title: "DNS", slug: "dns" },
        { num: "2.6", title: "IP & CIDR", slug: "ip-cidr" },
        { num: "2.7", title: "Key Ports Cheat Sheet", slug: "key-ports" },
        { num: "2.8", title: "Firewalls: SGs vs NACLs", slug: "firewalls" },
        { num: "2.9", title: "Zero Trust Networking", slug: "zero-trust" },
        { num: "2.10", title: "DDoS Defense", slug: "ddos-defense" },
        { num: "2.11", title: "Event Loop & I/O Multiplexing", slug: "event-loop" }
      ]
    },
    {
      num: 3, title: "APIs & Communication", slug: "apis",
      lessons: [
        { num: "3.1", title: "REST API", slug: "rest" },
        { num: "3.2", title: "gRPC", slug: "grpc" },
        { num: "3.3", title: "GraphQL", slug: "graphql" },
        { num: "3.4", title: "REST vs GraphQL", slug: "rest-vs-graphql" },
        { num: "3.5", title: "Async APIs", slug: "async-apis" },
        { num: "3.6", title: "Idempotent APIs", slug: "idempotent-apis" },
        { num: "3.7", title: "SOAP", slug: "soap" },
        { num: "3.8", title: "CORS", slug: "cors" },
        { num: "3.9", title: "OpenAPI / Swagger", slug: "openapi" },
        { num: "3.10", title: "API Versioning", slug: "api-versioning" },
        { num: "3.11", title: "Pagination", slug: "pagination" },
        { num: "3.12", title: "Real-Time Communication", slug: "realtime" },
        { num: "3.13", title: "WebSocket Deep Dive", slug: "websocket-deep" },
        { num: "3.14", title: "SSE Deep Dive", slug: "sse-deep" },
        { num: "3.15", title: "WebSocket vs SSE", slug: "realtime-comparison" }
      ]
    },
    {
      num: 4, title: "Security", slug: "security",
      lessons: [
        { num: "4.1", title: "Authentication", slug: "authentication" },
        { num: "4.2", title: "Authorization", slug: "authorization" },
        { num: "4.3", title: "Encryption", slug: "encryption" }
      ]
    },
    {
      num: 5, title: "Infrastructure", slug: "infrastructure",
      lessons: [
        { num: "5.1", title: "Load Balancer", slug: "load-balancer" },
        { num: "5.2", title: "API Gateway", slug: "api-gateway" },
        { num: "5.3", title: "Forward vs Reverse Proxy", slug: "proxy" },
        { num: "5.4", title: "NGINX", slug: "nginx" },
        { num: "5.5", title: "Docker & Kubernetes", slug: "docker-k8s" },
        { num: "5.6", title: "Service Mesh", slug: "service-mesh" },
        { num: "5.7", title: "Multi-Region & Multi-Tenant", slug: "multi-region" },
        { num: "5.8", title: "Service Discovery", slug: "service-discovery" },
        { num: "5.9", title: "CI/CD & Deployment Strategies", slug: "cicd" },
        { num: "5.10", title: "Serverless / FaaS", slug: "serverless" },
        { num: "5.11", title: "Infrastructure as Code", slug: "iac" }
      ]
    },
    {
      num: 6, title: "Storage", slug: "storage",
      lessons: [
        { num: "6.1", title: "Database Internals", slug: "db-internals" },
        { num: "6.2", title: "Database Indexing", slug: "db-indexing" },
        { num: "6.3", title: "Database Choice Guide", slug: "db-choice" },
        { num: "6.4", title: "SQL (Postgres, MySQL)", slug: "sql" },
        { num: "6.5", title: "NoSQL", slug: "nosql" },
        { num: "6.6", title: "NewSQL", slug: "newsql" },
        { num: "6.7", title: "Time-Series DBs", slug: "timeseries" },
        { num: "6.8", title: "Search (Elasticsearch)", slug: "search" },
        { num: "6.9", title: "Blob Storage (S3)", slug: "blob" },
        { num: "6.10", title: "Vector Databases", slug: "vector-db" },
        { num: "6.11", title: "Graph DB Deep Dive", slug: "graph-db-deep" },
        { num: "6.12", title: "Connection Pooling", slug: "connection-pooling" },
        { num: "6.13", title: "Schema Migrations", slug: "schema-migrations" }
      ]
    },
    {
      num: 7, title: "Caching", slug: "caching",
      lessons: [
        { num: "7.1", title: "Caching Strategies", slug: "caching" },
        { num: "7.2", title: "Cache Invalidation & Eviction", slug: "cache-invalidation" },
        { num: "7.3", title: "Redis Data Structures", slug: "redis" },
        { num: "7.4", title: "Why Redis Is So Fast", slug: "redis-fast" },
        { num: "7.5", title: "Redis as Cache", slug: "redis-cache" },
        { num: "7.6", title: "Redis Pub/Sub", slug: "redis-pubsub" },
        { num: "7.7", title: "Redis Streams", slug: "redis-streams" },
        { num: "7.8", title: "Redis Persistence & HA", slug: "redis-ha" },
        { num: "7.9", title: "Redis Deployment Modes", slug: "redis-cluster" },
        { num: "7.10", title: "Redis Distributed Locks", slug: "redis-locks" },
        { num: "7.11", title: "Memcached vs Redis", slug: "memcached-vs-redis" },
        { num: "7.12", title: "CDN", slug: "cdn" }
      ]
    },
    {
      num: 8, title: "Messaging", slug: "messaging",
      lessons: [
        { num: "8.1", title: "Message Queues (RabbitMQ / SQS)", slug: "message-queues" },
        { num: "8.2", title: "Apache Kafka", slug: "kafka" },
        { num: "8.3", title: "Pub/Sub (SNS / Google Pub/Sub)", slug: "pubsub" },
        { num: "8.4", title: "Queues vs Streams vs Pub/Sub", slug: "messaging-comparison" },
        { num: "8.5", title: "Dead Letter Queue (DLQ)", slug: "dlq" },
        { num: "8.6", title: "Event Sourcing", slug: "event-sourcing" },
        { num: "8.7", title: "CQRS", slug: "cqrs" },
        { num: "8.8", title: "Ordering Guarantees", slug: "ordering" },
        { num: "8.9", title: "Schema Registry", slug: "schema-registry" }
      ]
    },
    {
      num: 9, title: "Consistency", slug: "consistency",
      lessons: [
        { num: "9.1", title: "CAP Theorem & PACELC", slug: "cap" },
        { num: "9.2", title: "Consistency Models", slug: "consistency-models" },
        { num: "9.3", title: "Consensus Algorithms", slug: "consensus" },
        { num: "9.4", title: "Distributed Transactions", slug: "transactions" },
        { num: "9.5", title: "Concurrency Control", slug: "concurrency" },
        { num: "9.6", title: "Saga Pattern", slug: "saga-orchestration" },
        { num: "9.7", title: "Conflict Resolution", slug: "conflict-resolution" },
        { num: "9.8", title: "Clock Sync & Time", slug: "clock-sync" }
      ]
    },
    {
      num: 10, title: "Scalability", slug: "scalability",
      lessons: [
        { num: "10.1", title: "Partitioning", slug: "partitioning" },
        { num: "10.2", title: "Distributed Indexing", slug: "distributed-indexing" },
        { num: "10.3", title: "Replication", slug: "replication" },
        { num: "10.4", title: "Sharding", slug: "sharding" },
        { num: "10.5", title: "Consistent Hashing", slug: "consistent-hashing" },
        { num: "10.6", title: "Bloom Filters", slug: "bloom-filters" },
        { num: "10.7", title: "Rate Limiting", slug: "rate-limiting" },
        { num: "10.8", title: "Backpressure", slug: "backpressure" },
        { num: "10.9", title: "Auto-Scaling", slug: "auto-scaling" },
        { num: "10.10", title: "Graceful Degradation", slug: "graceful-degradation" }
      ]
    },
    {
      num: 11, title: "Distributed Systems", slug: "distributed-systems",
      lessons: [
        { num: "11.1", title: "Distributed System Patterns", slug: "dist-patterns" },
        { num: "11.2", title: "ZooKeeper", slug: "zookeeper" },
        { num: "11.3", title: "GFS & HDFS", slug: "gfs-hdfs" },
        { num: "11.4", title: "BigTable", slug: "bigtable" },
        { num: "11.5", title: "Fault Tolerance & Reliability", slug: "fault-tolerance" },
        { num: "11.6", title: "Data Redundancy & Recovery", slug: "data-redundancy" },
        { num: "11.7", title: "Leader Election", slug: "leader-election" },
        { num: "11.8", title: "Consensus Protocols", slug: "consensus-protocols" },
        { num: "11.9", title: "Clocks & Time", slug: "clocks" },
        { num: "11.10", title: "Replication Strategies", slug: "replication-strategies" },
        { num: "11.11", title: "Partitioning & Sharding", slug: "partitioning-sharding" },
        { num: "11.12", title: "Failure Detection", slug: "failure-detection" }
      ]
    },
    {
      num: 12, title: "Data Pipelines", slug: "data-pipelines",
      lessons: [
        { num: "12.1", title: "Change Data Capture (CDC)", slug: "cdc" },
        { num: "12.2", title: "ETL / ELT", slug: "etl" },
        { num: "12.3", title: "Stream Processing", slug: "stream-processing" },
        { num: "12.4", title: "Batch Processing", slug: "batch-processing" },
        { num: "12.5", title: "Data Warehouse", slug: "data-warehouse" },
        { num: "12.6", title: "Data Lakes & Lakehouse", slug: "data-lakes" },
        { num: "12.7", title: "Data Quality", slug: "data-quality" },
        { num: "12.8", title: "Schema Registry (Pipelines)", slug: "pipeline-schema-registry" },
        { num: "12.9", title: "Data Lineage", slug: "data-lineage" },
        { num: "12.10", title: "Real-Time Analytics", slug: "realtime-analytics" }
      ]
    },
    {
      num: 13, title: "Observability", slug: "observability",
      lessons: [
        { num: "13.1", title: "Logging", slug: "logging" },
        { num: "13.2", title: "Metrics", slug: "metrics" },
        { num: "13.3", title: "Distributed Tracing", slug: "tracing" },
        { num: "13.4", title: "Monitoring & Alerting", slug: "monitoring" },
        { num: "13.5", title: "OpenTelemetry", slug: "opentelemetry" },
        { num: "13.6", title: "Dashboards & Visualization", slug: "dashboards" },
        { num: "13.7", title: "Incident Response", slug: "incident-response" }
      ]
    },
    {
      num: 14, title: "Key Numbers", slug: "key-numbers",
      lessons: [
        { num: "14.1", title: "Latency Numbers", slug: "latency-numbers" },
        { num: "14.2", title: "Throughput Numbers", slug: "throughput-numbers" },
        { num: "14.3", title: "Storage & Size Estimation", slug: "storage-numbers" },
        { num: "14.4", title: "Back-of-Envelope Estimation", slug: "estimation" },
        { num: "14.5", title: "Cost Estimation", slug: "cost-numbers" },
        { num: "14.6", title: "SLA Math & Availability", slug: "sla-math" },
        { num: "14.7", title: "Interview Quick Reference", slug: "interview-reference" }
      ]
    },
    {
      num: 15, title: "Decision Guides", slug: "decision-guides",
      lessons: [
        { num: "15.1", title: "Which API Style?", slug: "api-choice" },
        { num: "15.2", title: "Which Database?", slug: "db-choice" },
        { num: "15.3", title: "Queue vs Stream vs Pub/Sub", slug: "messaging-choice" },
        { num: "15.4", title: "Which Caching Strategy?", slug: "cache-choice" },
        { num: "15.5", title: "Which Real-Time Tech?", slug: "realtime-choice" },
        { num: "15.6", title: "How to Scale?", slug: "scaling-choice" },
        { num: "15.7", title: "More Decision Flowcharts", slug: "more-decisions" }
      ]
    }
  ]
};
