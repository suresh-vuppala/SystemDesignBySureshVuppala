# System Design Cheatsheet
### Senior Software Engineer Interviews — Google / FAANG

> **How to use this:** Top section = quick-scan reference cards. Bottom section = deep-dive details via anchor links.

---

## 📋 Quick Navigation

| Category | Topics |
|---|---|
| **Storage** | [SQL](#-sql-relational-db) · [NoSQL](#-nosql) · [NewSQL](#-newsql) · [Time-Series DB](#-time-series-db) · [Search Engine](#-search-engine-elasticsearch--solr) |
| **Caching** | [Cache Strategies](#-caching) · [Redis](#-redis) · [CDN](#-cdn) |
| **Messaging** | [Message Queues](#-message-queue-rabitmq--sqs) · [Kafka](#-apache-kafka) · [Pub/Sub](#-pubsub-google-pub--sub--sns) |
| **Compute** | [Microservices](#-microservices) · [Serverless](#-serverless) · [Service Mesh](#-service-mesh) |
| **Networking** | [Load Balancer](#-load-balancer) · [API Gateway](#-api-gateway) · [Reverse Proxy](#-reverse-proxy) |
| **Consistency** | [CAP Theorem](#-cap-theorem) · [Consistency Models](#-consistency-models) · [Distributed Transactions](#-distributed-transactions) |
| **Scale** | [Sharding](#-sharding) · [Replication](#-replication) · [Rate Limiting](#-rate-limiting) |
| **Infra** | [Blob Storage](#-blob-storage-s3--gcs) · [DNS](#-dns) · [Data Warehouse](#-data-warehouse) |

---

## ⚡ STORAGE

---

### 🟦 SQL (Relational DB)
> **Examples:** PostgreSQL, MySQL, Cloud Spanner

| ✅ Good At | ❌ Bad At |
|---|---|
| ACID transactions | Horizontal write scaling |
| Complex joins & aggregations | Very high write throughput (millions/sec) |
| Strong consistency | Schema changes at scale |
| Well-understood query patterns | Unstructured / variable data |

**Real-world use cases:** Banking transactions · E-commerce orders · User account data · Booking systems

> 🔗 [Deep Dive: SQL](#deep-dive-sql)

---

### 🟦 NoSQL
> **Examples:** DynamoDB, Cassandra, MongoDB, HBase

| ✅ Good At | ❌ Bad At |
|---|---|
| Horizontal scaling (massive data) | Complex multi-table joins |
| Flexible / dynamic schemas | ACID across multiple documents |
| High write throughput | Ad-hoc queries |
| Low-latency key-value lookups | Strong consistency (mostly eventual) |

**Sub-types at a glance:**

| Type | Best For | Example |
|---|---|---|
| Key-Value | Session store, cache | DynamoDB, Redis |
| Document | User profiles, catalogs | MongoDB, Firestore |
| Wide-Column | Time-series, analytics | Cassandra, HBase |
| Graph | Social graphs, recommendations | Neo4j, Neptune |

**Real-world use cases:** User sessions · Shopping carts · Social feeds · IoT sensor data · Recommendation graphs

> 🔗 [Deep Dive: NoSQL](#deep-dive-nosql)

---

### 🟦 NewSQL
> **Examples:** Google Spanner, CockroachDB, TiDB

| ✅ Good At | ❌ Bad At |
|---|---|
| ACID at global scale | Operational complexity |
| SQL interface with NoSQL scalability | Higher latency than NoSQL (consensus overhead) |
| Multi-region strong consistency | Cost (especially Spanner) |
| Familiar tooling | Not suitable for simple use cases |

**Real-world use cases:** Global financial systems · Multi-region inventory · Ad bidding systems

> 🔗 [Deep Dive: NewSQL](#deep-dive-newsql)

---

### 🟦 Time-Series DB
> **Examples:** InfluxDB, Prometheus, TimescaleDB, Druid

| ✅ Good At | ❌ Bad At |
|---|---|
| High ingest rate of timestamped data | General-purpose queries |
| Efficient range queries over time | Relational joins |
| Built-in downsampling / retention policies | Mutable/updatable records |
| Compression of sequential numeric data | Low cardinality lookups |

**Real-world use cases:** Metrics & monitoring (CPU, memory) · IoT sensor streams · Stock tick data · App performance analytics

> 🔗 [Deep Dive: Time-Series DB](#deep-dive-time-series-db)

---

### 🟦 Search Engine (Elasticsearch / Solr)
> **Examples:** Elasticsearch, OpenSearch, Solr

| ✅ Good At | ❌ Bad At |
|---|---|
| Full-text search with ranking | Primary data store (not durable source of truth) |
| Fuzzy / typo-tolerant search | Strong consistency |
| Faceted filtering at scale | High-frequency updates |
| Log aggregation & analytics | Complex transactions |

**Real-world use cases:** Product search · Log analysis (ELK stack) · Document search · Autocomplete

> 🔗 [Deep Dive: Search Engine](#deep-dive-search-engine)

---

## ⚡ CACHING

---

### 🟨 Caching
> Strategies: Cache-Aside, Write-Through, Write-Behind, Read-Through

| ✅ Good At | ❌ Bad At |
|---|---|
| Reducing DB load (read-heavy workloads) | Write-heavy workloads |
| Sub-millisecond read latency | Cache invalidation (notoriously hard) |
| Absorbing traffic spikes | Consistency with source of truth |
| Reducing expensive computation | Large object storage (memory is expensive) |

**Strategy quick-pick:**

| Strategy | Use When |
|---|---|
| **Cache-Aside** | Read-heavy; app controls cache explicitly |
| **Write-Through** | Need cache + DB always in sync; slower writes OK |
| **Write-Behind** | High write throughput; eventual DB sync OK |
| **Read-Through** | Cache handles DB fetch transparently |

**Real-world use cases:** DB query results · API responses · Session tokens · Leaderboards · Rate limit counters

> 🔗 [Deep Dive: Caching Strategies](#deep-dive-caching)

---

### 🟨 Redis
> **Type:** In-memory data store (cache + more)

| ✅ Good At | ❌ Bad At |
|---|---|
| Sub-millisecond read/write | Dataset larger than RAM |
| Rich data structures (lists, sets, sorted sets, streams) | Complex queries / joins |
| Pub/Sub messaging | Full ACID transactions |
| Distributed locking (Redlock) | Persistence-first use cases |
| Atomic operations (INCR, ZADD) | Large blob storage |

**Real-world use cases:** Session management · Rate limiting · Leaderboards (`ZADD`) · Distributed locks · Real-time feeds · Job queues (BullMQ)

> 🔗 [Deep Dive: Redis](#deep-dive-redis)

---

### 🟨 CDN
> **Examples:** Cloudflare, AWS CloudFront, Fastly, Akamai

| ✅ Good At | ❌ Bad At |
|---|---|
| Serving static assets globally with low latency | Dynamic, user-specific content |
| DDoS protection / edge security | Real-time personalization at edge (limited) |
| Reducing origin server load | Frequent cache invalidations (complex) |
| TLS termination at edge | Cost at very high invalidation frequency |

**Real-world use cases:** Image/video delivery · JS/CSS bundles · HTML pages (SSG sites) · Software downloads · Streaming (HLS segments)

> 🔗 [Deep Dive: CDN](#deep-dive-cdn)

---

## ⚡ MESSAGING

---

### 🟩 Message Queue (RabbitMQ / SQS)
> **Examples:** RabbitMQ, AWS SQS, Azure Service Bus

| ✅ Good At | ❌ Bad At |
|---|---|
| Decoupling producers from consumers | Message replay (messages deleted after consume) |
| Work queue / task distribution | High-throughput streaming (millions/sec) |
| Retry logic + dead-letter queues | Fan-out to many consumers simultaneously |
| At-least-once delivery guarantees | Long-term message retention |

**Real-world use cases:** Order processing · Email/SMS sending · Background jobs · Image resize pipelines · Notification dispatch

> 🔗 [Deep Dive: Message Queue](#deep-dive-message-queue)

---

### 🟩 Apache Kafka
> **Type:** Distributed log / event streaming platform

| ✅ Good At | ❌ Bad At |
|---|---|
| Very high throughput (millions of events/sec) | Low message count workloads (overkill) |
| Durable log with configurable retention | Per-message acknowledgment (batch-oriented) |
| Message replay / rewind | Exactly-once across external systems (complex) |
| Fan-out to multiple consumer groups | Low operational simplicity (high overhead) |
| Event sourcing / audit logs | Fine-grained message routing (use RabbitMQ) |

**Real-world use cases:** Activity tracking (LinkedIn) · Real-time analytics pipelines · Microservice event bus · Change Data Capture (CDC) · Audit logs

> 🔗 [Deep Dive: Kafka](#deep-dive-kafka)

---

### 🟩 Pub/Sub (Google Pub/Sub / SNS)
> **Examples:** Google Cloud Pub/Sub, AWS SNS, Azure Event Grid

| ✅ Good At | ❌ Bad At |
|---|---|
| Fan-out to many subscribers simultaneously | Ordered delivery (not guaranteed by default) |
| Fully managed, serverless scale | Long retention / replay (use Kafka for that) |
| Event-driven architecture triggers | Complex routing logic |
| Cross-service async communication | Point-to-point work queues |

**Real-world use cases:** Triggering downstream services on events · Mobile push notification fan-out · Cross-region event propagation · Webhook fan-out

> 🔗 [Deep Dive: Pub/Sub](#deep-dive-pubsub)

---

## ⚡ COMPUTE

---

### 🟪 Microservices

| ✅ Good At | ❌ Bad At |
|---|---|
| Independent deployment & scaling per service | Distributed system complexity |
| Team autonomy (own service, own DB) | Network latency between services |
| Technology diversity per service | Harder debugging / tracing |
| Fault isolation | Data consistency across services |

**Real-world use cases:** Netflix (1000s of services) · Uber (trip, driver, payment services) · Amazon (order, inventory, fulfillment)

> 🔗 [Deep Dive: Microservices](#deep-dive-microservices)

---

### 🟪 Serverless
> **Examples:** AWS Lambda, Google Cloud Functions, Cloudflare Workers

| ✅ Good At | ❌ Bad At |
|---|---|
| Event-driven, spiky workloads | Long-running or stateful processes |
| Zero infra management | Cold start latency |
| Auto-scaling to zero | GPU / high-memory workloads |
| Pay-per-execution cost model | Fine-grained performance control |

**Real-world use cases:** Image processing on upload · Webhook handlers · Scheduled jobs · API backends for low-traffic apps · Auth callbacks

> 🔗 [Deep Dive: Serverless](#deep-dive-serverless)

---

### 🟪 Service Mesh
> **Examples:** Istio, Linkerd, Consul Connect

| ✅ Good At | ❌ Bad At |
|---|---|
| mTLS between services (zero-trust networking) | Adds latency (sidecar proxy overhead) |
| Observability (traces, metrics per service) | Operational complexity |
| Traffic management (canary, circuit breaking) | Small-scale systems (overkill) |
| Retries / timeouts declaratively | Steep learning curve |

**Real-world use cases:** Zero-trust service-to-service auth · Canary deployments · Circuit breaking · Distributed tracing infrastructure

> 🔗 [Deep Dive: Service Mesh](#deep-dive-service-mesh)

---

## ⚡ NETWORKING

---

### 🟥 Load Balancer
> **Types:** L4 (TCP/UDP), L7 (HTTP); Examples: AWS ALB/NLB, NGINX, HAProxy

| ✅ Good At | ❌ Bad At |
|---|---|
| Distributing traffic across instances | Single point of failure if not HA |
| Health checks + automatic failover | State persistence (sticky sessions add complexity) |
| SSL termination (L7) | Very low-latency requirements (adds hop) |
| Routing by path/header (L7) | Custom application-level logic |

**Algorithms:** Round Robin · Least Connections · IP Hash · Weighted

**Real-world use cases:** Web server fleets · API tier · Microservice ingress · Blue-green deployments

> 🔗 [Deep Dive: Load Balancer](#deep-dive-load-balancer)

---

### 🟥 API Gateway
> **Examples:** AWS API Gateway, Kong, Apigee, Nginx

| ✅ Good At | ❌ Bad At |
|---|---|
| Single entry point for all clients | Added latency (extra hop) |
| Auth, rate limiting, SSL in one place | Becomes a bottleneck if not scaled |
| Request routing to microservices | Complex request transformations |
| API versioning & throttling | Business logic (should not live here) |

**Real-world use cases:** Mobile/web API access · Third-party API exposure · B2B partner APIs · Aggregating multiple microservice responses

> 🔗 [Deep Dive: API Gateway](#deep-dive-api-gateway)

---

### 🟥 Reverse Proxy
> **Examples:** NGINX, HAProxy, Caddy, Cloudflare

| ✅ Good At | ❌ Bad At |
|---|---|
| Hiding backend topology from clients | Not a replacement for a full API Gateway |
| Caching, compression, SSL termination | Dynamic complex routing |
| DDoS/abuse mitigation | |

**Real-world use cases:** Static asset serving · SSL offloading · Rate limiting at edge · Backend for frontend (BFF) pattern

> 🔗 [Deep Dive: Reverse Proxy](#deep-dive-reverse-proxy)

---

## ⚡ CONSISTENCY & DISTRIBUTED SYSTEMS

---

### 🔶 CAP Theorem

> A distributed system can guarantee only **2 of 3**: **C**onsistency, **A**vailability, **P**artition Tolerance.
> Since network partitions are unavoidable, the real trade-off is **CP vs AP**.

| System Type | Behavior During Partition | Examples |
|---|---|---|
| **CP** | Returns error rather than stale data | HBase, Zookeeper, Spanner |
| **AP** | Returns possibly stale data | Cassandra, DynamoDB, CouchDB |

> 🔗 [Deep Dive: CAP Theorem](#deep-dive-cap-theorem)

---

### 🔶 Consistency Models

| Model | Guarantee | Use When |
|---|---|---|
| **Strong** | All reads see latest write | Financial transactions, inventory |
| **Linearizable** | Strongest — real-time ordering | Distributed locks, counters |
| **Eventual** | Replicas converge over time | Social likes, DNS, shopping carts |
| **Read-your-writes** | You always see your own writes | User profile updates |
| **Causal** | Causally related writes are ordered | Comments/replies, collaborative editing |

> 🔗 [Deep Dive: Consistency Models](#deep-dive-consistency-models)

---

### 🔶 Distributed Transactions

| Pattern | Mechanism | Trade-off |
|---|---|---|
| **2PC (Two-Phase Commit)** | Coordinator + prepare/commit phases | Blocking — coordinator failure = stuck |
| **Saga** | Chain of local transactions + compensating actions | Complex rollback; eventual consistency |
| **Outbox Pattern** | Write event to DB outbox table + poll/CDC to publish | Reliable event publishing without 2PC |
| **TCC (Try-Confirm-Cancel)** | Reserve → Confirm or Cancel | High overhead; used in fintech |

**Real-world use cases:** Order + payment + inventory (Saga) · Reliable event publishing (Outbox) · Airline seat reservations (TCC)

> 🔗 [Deep Dive: Distributed Transactions](#deep-dive-distributed-transactions)

---

## ⚡ SCALABILITY PATTERNS

---

### 🟤 Sharding

| ✅ Good At | ❌ Bad At |
|---|---|
| Horizontal write + read scaling | Cross-shard queries / joins |
| Partitioning large datasets | Resharding (painful at scale) |
| Reducing hot-spot on single node | Uneven distribution (hotspots) |

**Strategies:**

| Strategy | How | Watch Out |
|---|---|---|
| **Range sharding** | Shard by value range (e.g., A–M, N–Z) | Hot spots for sequential writes |
| **Hash sharding** | `hash(key) % N` | Resharding requires remapping |
| **Directory sharding** | Lookup table maps key → shard | Lookup table = single point of failure |
| **Geo sharding** | Shard by region | Cross-region queries expensive |

**Real-world use cases:** User data (by user_id hash) · Twitter timelines (by tweet_id) · Uber trips (by geo region)

> 🔗 [Deep Dive: Sharding](#deep-dive-sharding)

---

### 🟤 Replication

| Type | Description | Use Case |
|---|---|---|
| **Leader-Follower** | One writer, many readers | Read-heavy workloads; MySQL, Postgres |
| **Multi-Leader** | Multiple writers, conflict resolution needed | Multi-region writes; Google Docs |
| **Leaderless** | Any node accepts writes (quorum) | High availability; Cassandra, Dynamo |

**Sync vs Async:**
- **Synchronous:** Strong consistency, higher write latency.
- **Asynchronous:** Lower latency, risk of data loss if leader fails before replication.

> 🔗 [Deep Dive: Replication](#deep-dive-replication)

---

### 🟤 Rate Limiting

| Algorithm | How It Works | Best For |
|---|---|---|
| **Token Bucket** | Tokens added at fixed rate; request consumes token | Bursty traffic (common default) |
| **Leaky Bucket** | Requests processed at fixed rate; excess queued/dropped | Smooth output rate |
| **Fixed Window** | Count requests per fixed time window | Simple; susceptible to edge bursts |
| **Sliding Window Log** | Log timestamps of requests in window | Accurate; memory-heavy |
| **Sliding Window Counter** | Weighted blend of current + previous window | Accurate + memory efficient |

**Where to implement:** API Gateway · Reverse proxy · Redis (atomic INCR + TTL) · Application layer

**Real-world use cases:** API abuse prevention · Login attempt throttling · SMS OTP limits · Search query rate limiting

> 🔗 [Deep Dive: Rate Limiting](#deep-dive-rate-limiting)

---

## ⚡ INFRASTRUCTURE

---

### 🔵 Blob Storage (S3 / GCS)
> **Examples:** AWS S3, Google Cloud Storage, Azure Blob

| ✅ Good At | ❌ Bad At |
|---|---|
| Storing large unstructured files (GB/TB scale) | Low-latency random reads within files |
| Cheap, durable, infinitely scalable | Database-like queries |
| Lifecycle policies (tiering, expiry) | Frequent small writes |
| Pre-signed URLs for secure access | Strong consistency on list operations (eventually consistent in some systems) |

**Real-world use cases:** User image/video uploads · Backups · ML training datasets · Static website hosting · Log archival

> 🔗 [Deep Dive: Blob Storage](#deep-dive-blob-storage)

---

### 🔵 DNS

| ✅ Good At | ❌ Bad At |
|---|---|
| Human-readable → IP address translation | Instant propagation (TTL delays) |
| Global traffic routing (GeoDNS) | Dynamic, per-request routing |
| Failover via health-checked records | Fine-grained load balancing |

**Record types to know:** `A` (IPv4) · `AAAA` (IPv6) · `CNAME` (alias) · `MX` (mail) · `TXT` (verification) · `SRV` (service discovery)

**Real-world use cases:** GeoDNS routing users to nearest region · DNS-based failover · Service discovery in microservices

> 🔗 [Deep Dive: DNS](#deep-dive-dns)

---

### 🔵 Data Warehouse
> **Examples:** BigQuery, Snowflake, Redshift, ClickHouse

| ✅ Good At | ❌ Bad At |
|---|---|
| Analytical queries on huge datasets (OLAP) | Transactional writes (use OLTP DB) |
| Columnar storage → fast aggregations | Low-latency point lookups |
| Separation of compute and storage | Real-time data (minutes/hours delay typical) |
| BI tool integration | |

**OLTP vs OLAP:**

| | OLTP | OLAP |
|---|---|---|
| **Purpose** | Transactions | Analytics |
| **Query** | Simple, fast, many | Complex, slow, few |
| **Data** | Current | Historical |
| **Example** | PostgreSQL | BigQuery |

**Real-world use cases:** Business intelligence dashboards · Product analytics · Fraud detection models · A/B test result analysis

> 🔗 [Deep Dive: Data Warehouse](#deep-dive-data-warehouse)

---

## ⚡ KEY NUMBERS TO KNOW

```
Latency Reference (approximate):
  L1 cache:          ~1 ns
  L2 cache:          ~4 ns
  Main memory:       ~100 ns
  SSD random read:   ~100 µs
  HDD seek:          ~10 ms
  Datacenter RTT:    ~0.5 ms
  Cross-region RTT:  ~100–150 ms

Throughput Reference:
  Single DB (Postgres):   ~10K QPS (reads), ~1–3K QPS (writes)
  Redis:                  ~100K–1M ops/sec
  Kafka:                  ~1M+ messages/sec (cluster)
  S3:                     ~3,500 PUT/sec, ~5,500 GET/sec per prefix

Storage Reference:
  1 char = 1 byte
  1 int  = 4 bytes
  UUID   = 16 bytes
  1M users × 1KB profile = ~1 GB
  1B users × 1KB profile = ~1 TB
```

---

---
---

# 📚 DEEP DIVES

---

## Deep Dive: SQL

**How it works:**
- Data stored in tables with rows and columns. Schema is enforced.
- Uses B-Tree indexes (most common) for fast lookups.
- ACID: Atomicity (all or nothing), Consistency (constraints enforced), Isolation (concurrent txns don't interfere), Durability (committed data survives crashes).
- Write-Ahead Log (WAL) ensures durability — changes are logged before applied.

**Scaling SQL:**
- **Vertical scaling** (bigger machine) — easiest but has limits.
- **Read replicas** — leader handles writes, followers serve reads.
- **Connection pooling** (PgBouncer) — DB connections are expensive; pool them.
- **Sharding** — partition tables across multiple DB instances by a shard key.

**Indexing tips:**
- Index columns used in `WHERE`, `JOIN`, `ORDER BY`.
- Composite indexes: column order matters — most selective first.
- Too many indexes slow down writes.
- Partial indexes for subsets of data (e.g., `WHERE status='active'`).

**When to use:** Transactions, financial data, anything needing strong consistency and joins.

[↑ Back to top](#-sql-relational-db)

---

## Deep Dive: NoSQL

**Key-Value (DynamoDB, Redis):**
- O(1) get/put by key. No joins.
- DynamoDB: primary key = partition key + optional sort key. Supports LSI/GSI for alternate access patterns.
- Best for: Sessions, caches, user preferences.

**Document (MongoDB, Firestore):**
- JSON-like documents; flexible schema.
- Query by any field (with indexes). No joins — embed related data.
- Best for: User profiles, product catalogs, CMS.

**Wide-Column (Cassandra, HBase):**
- Rows identified by a primary key; columns can vary per row.
- Optimized for writes; data physically sorted by partition + clustering key.
- Cassandra mantra: model your tables around your queries.
- Best for: Write-heavy workloads, time-series, recommendation data.

**Graph (Neo4j, Neptune):**
- Nodes and edges with properties.
- Traversal queries are fast (no joins needed).
- Best for: Social graphs, fraud detection, knowledge graphs.

**Consistency in NoSQL:**
- Most offer tunable consistency: eventual by default, strong available at cost.
- Cassandra: `QUORUM` reads/writes for stronger consistency.

[↑ Back to top](#-nosql)

---

## Deep Dive: NewSQL

**How it works:**
- SQL semantics + distributed architecture.
- Uses Paxos or Raft consensus for distributed transactions.
- Google Spanner: uses TrueTime (atomic clocks + GPS) for global timestamp ordering.
- CockroachDB: open-source Spanner-like; PostgreSQL compatible.

**Trade-offs:**
- Commit latency includes consensus round-trip (~5–10ms single-region, ~100ms multi-region for Spanner).
- Expensive — Spanner costs more than equivalent Postgres.

**When to choose:** You need global ACID with SQL and can tolerate slightly higher latency and cost.

[↑ Back to top](#-newsql)

---

## Deep Dive: Time-Series DB

**How it works:**
- Optimized for append-heavy workloads with time as the primary index.
- Data is stored in time-ordered chunks; older chunks are compressed or downsampled.
- Prometheus: pull-based scraping model; stores as TSDB locally.
- InfluxDB: line protocol ingestion; tags + fields + timestamp model.
- Druid: columnar, real-time + historical, used for interactive analytics.

**Key features:**
- **Downsampling:** Automatically aggregate old data (1s → 1min → 1hr).
- **Retention policies:** Auto-delete data older than N days.
- **Continuous queries:** Materialized rollups updated in real-time.

**When to choose:** Any workload where the primary access pattern is "give me metric X between time T1 and T2."

[↑ Back to top](#-time-series-db)

---

## Deep Dive: Search Engine

**How it works:**
- Documents are indexed via an **inverted index**: maps terms → list of document IDs.
- At query time, terms are looked up, document lists are intersected/unioned, results scored by relevance (BM25, TF-IDF).
- Sharded across nodes; each shard is a Lucene index.

**Elasticsearch architecture:**
- **Index** → collection of documents (like a table).
- **Shard** → Lucene index; each index has primary + replica shards.
- **Node roles:** Master (cluster state), Data (stores shards), Coordinating (routes queries).

**Common pitfalls:**
- Don't use as a primary DB — it's not ACID, data can be lost.
- Mapping explosion — too many dynamic fields create huge mappings.
- Deep pagination is expensive — use `search_after` instead of `from/size`.

**When to choose:** Any feature requiring full-text search, fuzzy matching, or faceted filtering.

[↑ Back to top](#-search-engine-elasticsearch--solr)

---

## Deep Dive: Caching

**Cache-Aside (Lazy Loading):**
```
1. App checks cache → cache miss
2. App queries DB
3. App writes result to cache
4. Next request hits cache → cache hit
```
- App owns the cache logic. Cache only contains requested data.
- Risk: thundering herd on cold start.

**Write-Through:**
```
1. App writes to cache
2. Cache synchronously writes to DB
3. Read always hits warm cache
```
- Pros: Always consistent. Cons: Write latency doubles.

**Write-Behind (Write-Back):**
```
1. App writes to cache only
2. Cache asynchronously writes to DB later
```
- Pros: Fast writes. Cons: Data loss risk if cache dies before flush.

**Cache Invalidation patterns:**
- **TTL (Time-to-Live):** Simple; eventual consistency guaranteed after TTL expires.
- **Event-driven invalidation:** DB change triggers cache delete (via CDC or app logic).
- **Cache-aside with version key:** Embed version in key; new version = automatic miss.

**Thundering Herd:** Many requests hit DB simultaneously when cache expires. Mitigate with: probabilistic early expiration, mutex/lock on cache miss, background refresh.

[↑ Back to top](#-caching)

---

## Deep Dive: Redis

**Data structures:**
- `String` — counter, session token, simple KV.
- `Hash` — user profile (field: value pairs).
- `List` — message queue, activity feed (LPUSH/RPOP).
- `Set` — unique visitors, tags.
- `Sorted Set (ZSet)` — leaderboards (ZADD with score).
- `Stream` — append-only log; consumer groups (like lightweight Kafka).
- `Bitmap` — daily active users (set bit per user_id).
- `HyperLogLog` — approximate unique count (very memory efficient).

**Persistence modes:**
- **RDB (snapshot):** Periodic dump. Fast restart. Risk: data loss since last snapshot.
- **AOF (Append-Only File):** Logs every write. Slow restart. Near-zero data loss.
- **Combined:** Use both — RDB for fast restart, AOF for safety.

**Redis Cluster:**
- Hash slots (16384 total) distributed across nodes.
- Each master handles a slot range; replicas for HA.
- Clients use cluster-aware client libraries.

**Distributed lock (Redlock):**
- Acquire lock on majority of N independent Redis nodes.
- TTL prevents deadlock. Release with Lua script (atomic check + delete).

[↑ Back to top](#-redis)

---

## Deep Dive: CDN

**How it works:**
- CDN has **Points of Presence (PoPs)** globally (100s of locations).
- DNS routes user to nearest PoP.
- First request: PoP fetches from origin → caches response.
- Subsequent requests: served directly from PoP cache (cache hit).

**Cache control:**
- `Cache-Control: max-age=86400` — browser + CDN caches for 24h.
- `Cache-Control: s-maxage=3600` — CDN-only TTL (browser uses max-age).
- `Surrogate-Key` / `Cache-Tag` — tag-based bulk invalidation.

**Push vs Pull CDN:**
- **Pull:** CDN fetches from origin on first request (lazy). Simpler to set up.
- **Push:** You upload assets to CDN proactively. Good for large files known in advance.

**Edge computing (Cloudflare Workers, Lambda@Edge):**
- Run logic at CDN edge — auth, A/B testing, personalization, request transformation.
- Reduces round-trips to origin.

[↑ Back to top](#-cdn)

---

## Deep Dive: Message Queue

**How it works:**
- Producer sends message to queue. Broker stores it. Consumer polls and processes. Consumer acknowledges → message deleted.
- If no ack within visibility timeout → message reappears for retry.

**Dead Letter Queue (DLQ):**
- After N failed retries, message moved to DLQ.
- Enables alerting + manual inspection of failed messages.

**RabbitMQ exchanges:**
- `Direct` — route by exact routing key.
- `Fanout` — broadcast to all bound queues.
- `Topic` — route by pattern (e.g., `order.*.created`).
- `Headers` — route by message headers.

**SQS FIFO vs Standard:**
- Standard: At-least-once, best-effort ordering. Higher throughput.
- FIFO: Exactly-once, strict ordering. 3K msg/sec (with batching: 30K).

**When to use over Kafka:** Smaller scale, task queues, complex routing, when message replay is not needed.

[↑ Back to top](#-message-queue-rabitmq--sqs)

---

## Deep Dive: Kafka

See the dedicated [Kafka Internals Guide](kafka_internals.md) for full detail.

**Key concepts:**
- **Topic → Partitions → Offsets:** Unit of storage. Partitions are append-only logs.
- **Consumer Groups:** Each partition consumed by exactly one consumer per group. Multiple groups = independent reads.
- **ISR (In-Sync Replicas):** Replicas considered caught up. `acks=all` + `min.insync.replicas=2` = durable.
- **High Watermark:** Minimum committed offset across all ISR members. Consumers can't read beyond this.
- **Pull-based consumption:** Consumers fetch from leader. Broker is stateless w.r.t. consumer progress.

**Delivery semantics:**
- **At-most-once:** No retries. Fast but lossy.
- **At-least-once:** Retries enabled. Duplicates possible.
- **Exactly-once:** Idempotent producer + transactions. Highest overhead.

**When to choose Kafka over SQS/RabbitMQ:**
- Need replay / rewind of events.
- Need fan-out to many independent consumer groups.
- Very high throughput (>100K events/sec).
- Building event sourcing or CDC pipelines.

[↑ Back to top](#-apache-kafka)

---

## Deep Dive: Pub/Sub

**How it works:**
- Publisher sends message to a **topic** (not a queue).
- All subscribers receive a copy independently.
- Google Pub/Sub: push (HTTP delivery to subscriber endpoint) or pull model.
- AWS SNS: push to SQS queues, Lambda, HTTP endpoints, email, SMS.

**SNS + SQS fan-out pattern:**
```
SNS Topic
   ├── SQS Queue A (Email Service)
   ├── SQS Queue B (Analytics Service)
   └── SQS Queue C (Audit Service)
```
Each downstream service gets its own queue with its own retry/DLQ logic.

**vs Kafka:** Pub/Sub is fully managed and simpler; Kafka has replay and much higher throughput. For event streaming at scale, use Kafka.

[↑ Back to top](#-pubsub-google-pub--sub--sns)

---

## Deep Dive: Microservices

**Principles:**
- Single Responsibility: each service owns one bounded context.
- Own your data: each service has its own DB (no shared DB).
- Communicate via APIs (REST/gRPC) or events (async messaging).

**Inter-service communication:**
- **Synchronous (REST/gRPC):** Simple but creates temporal coupling.
- **Asynchronous (events):** Decoupled but eventual consistency.

**Service discovery:**
- **Client-side:** Client queries registry (Consul, Eureka) and picks instance.
- **Server-side:** Load balancer queries registry; client just calls LB.

**Challenges:**
- **Distributed tracing:** Correlation IDs; use Jaeger, Zipkin, or Cloud Trace.
- **Data consistency:** Use Saga pattern for cross-service transactions.
- **Testing:** Contract testing (Pact) for service-to-service API contracts.

[↑ Back to top](#-microservices)

---

## Deep Dive: Serverless

**Cold start breakdown:**
- Container provisioned → Runtime initialized → Handler loaded → Request handled.
- Cold start: 100ms–5s depending on runtime (JVM worst; Node.js/Python fastest).
- Mitigation: Provisioned concurrency (pre-warm), keep-alive pings, lighter runtimes.

**Concurrency model (Lambda):**
- Each invocation runs in its own isolated container.
- Burst limit: 1000 concurrent invocations by default (region-specific).
- `Reserved concurrency` prevents one function from consuming all capacity.

**When to avoid:**
- Long-running processes (>15 min for Lambda).
- Heavy stateful computation.
- Low-latency SLAs where cold starts are unacceptable.

[↑ Back to top](#-serverless)

---

## Deep Dive: Service Mesh

**Sidecar proxy pattern:**
- A proxy container (Envoy) is injected alongside every service pod.
- All network traffic goes through the sidecar — invisible to the service.
- Control plane (Istiod) pushes config to all sidecars.

**Features:**
- **mTLS:** Automatic mutual TLS between all services. Zero-trust.
- **Traffic management:** Weighted routing, retries, timeouts, circuit breaking — configured via YAML, not code.
- **Observability:** Automatic generation of metrics, traces, and access logs for every call.
- **Circuit breaker:** After N failures, open circuit → fail fast → protect downstream.

**vs API Gateway:** API Gateway handles external → internal traffic. Service Mesh handles internal → internal traffic.

[↑ Back to top](#-service-mesh)

---

## Deep Dive: Load Balancer

**L4 vs L7:**
- **L4 (TCP):** Routes based on IP + port. Fast. No content inspection. Use for non-HTTP (databases, game servers).
- **L7 (HTTP):** Routes based on URL, headers, cookies. Slower but smarter. Use for web apps.

**Health checks:**
- Active: LB periodically pings instances (TCP/HTTP).
- Passive: LB monitors real traffic for errors; removes unhealthy backends.

**Session persistence (sticky sessions):**
- Route same client to same backend (via cookie or IP hash).
- Problem: Hot spots. Breaks when instance dies.
- Better: Store session state externally (Redis) and remove need for stickiness.

**Global Load Balancing:**
- Route users to nearest healthy region (GeoDNS or Anycast IP).
- Examples: AWS Global Accelerator, Google Cloud Global LB, Cloudflare.

[↑ Back to top](#-load-balancer)

---

## Deep Dive: API Gateway

**Responsibilities:**
- **Auth:** Verify JWT/API key before routing to upstream service.
- **Rate limiting:** Enforce per-client, per-IP, or per-tier quotas.
- **Request/response transformation:** Modify headers, reshape payloads.
- **Routing:** Forward to correct microservice based on path/method.
- **Circuit breaking:** Stop forwarding to unhealthy upstreams.

**BFF (Backend for Frontend) pattern:**
- Separate API Gateways optimized for different clients (mobile vs web vs partner).
- Each BFF aggregates and shapes data specifically for that client's needs.

**GraphQL as API Gateway alternative:**
- Clients request exactly the fields they need (no over/under-fetching).
- Single endpoint; resolver stitches data from multiple services.
- Trade-off: Complex query execution, caching is harder.

[↑ Back to top](#-api-gateway)

---

## Deep Dive: CAP Theorem

**Why P is always required:**
- Networks partition (drop packets, become unreachable) — this is unavoidable in any distributed system.
- So you must always choose between C and A when a partition occurs.

**Practical interpretation (PACELC extension):**
- **PACELC:** If Partition → choose A or C. Else (no partition) → choose Latency or Consistency.
- Most real systems are tunable: Cassandra (AP by default, can tune to CP), DynamoDB (AP by default, strong consistency option).

**Common misconceptions:**
- CAP applies only during a network partition — not in normal operation.
- "Consistency" in CAP = linearizability, not ACID consistency.

[↑ Back to top](#-cap-theorem)

---

## Deep Dive: Consistency Models

**Strong / Linearizability:**
- All operations appear instantaneous; every read returns the latest write.
- Requires synchronous replication or consensus (Paxos/Raft).
- Example: Zookeeper, etcd, Spanner.

**Eventual Consistency:**
- Replicas diverge temporarily but converge given no new writes.
- No guarantee on convergence time.
- Conflict resolution needed (last-write-wins, vector clocks, CRDTs).
- Example: Cassandra, S3, DNS.

**CRDTs (Conflict-free Replicated Data Types):**
- Data structures designed to merge concurrent updates without conflicts.
- Examples: G-Counter (increment-only counter), OR-Set (add/remove set).
- Used in: Redis CRDT, collaborative editing (Figma, Google Docs).

[↑ Back to top](#-consistency-models)

---

## Deep Dive: Distributed Transactions

**Saga pattern (most common in microservices):**
```
Order Service   → Create Order (local txn)
Payment Service → Charge Card (local txn)
Inventory Service → Reserve Items (local txn)

On failure: compensating transactions run in reverse
  Inventory: Release Items
  Payment: Refund Card
  Order: Cancel Order
```
- **Choreography:** Each service emits events; next service reacts. Decoupled but hard to trace.
- **Orchestration:** Central saga orchestrator tells each service what to do. Easier to reason about.

**Outbox Pattern (reliable event publishing):**
```
1. Write business record + event to DB outbox table (same local txn)
2. Poller / CDC (Debezium) reads outbox table
3. Publishes event to message broker
4. Marks outbox record as published
```
Ensures events are never lost even if the broker is temporarily down.

[↑ Back to top](#-distributed-transactions)

---

## Deep Dive: Sharding

**Consistent Hashing:**
- Hash space arranged as a ring (0 to 2³²).
- Nodes placed on ring by hash of their ID.
- Key assigned to first node clockwise from `hash(key)`.
- Adding/removing a node only affects adjacent keys (minimal resharding).
- **Virtual nodes (vnodes):** Each physical node gets multiple positions on ring for even distribution.
- Used by: Cassandra, DynamoDB, Redis Cluster.

**Hotspot problem:**
- Certain keys (celebrity users, viral posts) receive disproportionate traffic.
- Mitigation: Add random suffix to key (`user_123_1`, `user_123_2`) → distribute across shards → aggregate at read time.

**Resharding:**
- Doubling shards (2x strategy) minimizes data movement — only half of each shard moves.
- Live resharding: Shadow new shards, dual-write, verify, cut over.

[↑ Back to top](#-sharding)

---

## Deep Dive: Replication

**Replication lag:**
- Async replication means followers may be seconds behind leader.
- Reading from replica may return stale data.
- Mitigation: Read your own writes from leader. Monitor replication lag metric.

**Quorum reads/writes (Dynamo model):**
- `N` = total replicas, `W` = write quorum, `R` = read quorum.
- Consistency guaranteed when `W + R > N`.
- Common: `N=3, W=2, R=2` → strong consistency.
- `W=1, R=1` → high availability, eventual consistency.

**Replication conflict resolution:**
- **Last-Write-Wins (LWW):** Timestamp decides winner. Risk: clock skew.
- **Vector clocks:** Track causal history; detect true conflicts.
- **CRDTs:** Merge concurrent updates automatically.

[↑ Back to top](#-replication)

---

## Deep Dive: Rate Limiting

**Token Bucket (most common):**
```
Bucket capacity: 100 tokens
Refill rate: 10 tokens/sec
Each request consumes 1 token
If empty → request rejected (429)
```
Allows bursts up to bucket capacity. Smooth average rate enforced.

**Redis implementation:**
```lua
-- Atomic Lua script for sliding window counter
local count = redis.call('INCR', key)
if count == 1 then
  redis.call('EXPIRE', key, window_seconds)
end
return count
```

**Distributed rate limiting:**
- Single Redis node → single point of failure.
- Redis Cluster → shard by user_id for distribution.
- Local + global hybrid: Fast local check (approximate) → global Redis check (accurate).

**Rate limiting headers (standard practice):**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1716921600
Retry-After: 60
```

[↑ Back to top](#-rate-limiting)

---

## Deep Dive: Blob Storage

**How S3 works:**
- Objects stored in **buckets** (globally unique name). Object addressed by key (path-like string).
- Internally: key hashed to distribute across storage nodes. No real folder hierarchy — just key prefixes.
- Multipart upload for large files (>100MB): upload parts in parallel, combine at end.

**Access patterns:**
- **Pre-signed URLs:** Generate a time-limited URL so clients upload/download directly to S3 (bypasses your server).
- **CloudFront + S3:** CDN in front of S3 for low-latency global reads.

**Storage classes (cost optimization):**
| Class | Use Case | Retrieval |
|---|---|---|
| Standard | Frequently accessed | Instant |
| Infrequent Access | Monthly access | Instant |
| Glacier Instant | Quarterly access | Instant |
| Glacier Deep Archive | Archival | 12 hours |

[↑ Back to top](#-blob-storage-s3--gcs)

---

## Deep Dive: DNS

**Resolution chain:**
```
Browser → OS cache → Resolver (ISP) → Root NS → TLD NS (.com) → Authoritative NS → IP returned
```

**TTL trade-offs:**
- Low TTL (60s): Fast failover. High DNS query load.
- High TTL (86400s): Less load. Slow propagation of changes.

**GeoDNS:**
- Authoritative DNS returns different IPs based on client's geographic location.
- Used for: Routing users to nearest data center, compliance (data residency), A/B traffic splitting.

**DNS-based load balancing:**
- Return multiple A records (round-robin DNS).
- Problem: Clients cache DNS; can't detect backend health. Prefer L4/L7 LB for health-aware balancing.

[↑ Back to top](#-dns)

---

## Deep Dive: Data Warehouse

**Columnar storage:**
- OLAP DBs store data by column, not by row.
- Aggregating one column (e.g., SUM of revenue) only reads that column — skips others.
- High compression ratios (column values are similar → compresses well).

**Partitioning + clustering:**
- Partition by date → queries with date filters only scan relevant partitions.
- Cluster by user_id within partition → co-locates related rows for faster aggregation.

**ETL vs ELT:**
- **ETL:** Transform before loading (traditional). Data warehouse receives clean data.
- **ELT:** Load raw, transform inside warehouse (modern). BigQuery/Snowflake are powerful enough to transform in-place.

**Lambda Architecture:**
- **Batch layer:** Processes all historical data periodically (Spark, MapReduce).
- **Speed layer:** Processes recent data in real-time (Kafka, Flink).
- **Serving layer:** Merges batch + speed views for queries.
- Modern alternative: **Kappa Architecture** — everything is streaming (Kafka + Flink only).

[↑ Back to top](#-data-warehouse)

---

*Last updated: 2026 — covers all major system design topics for Sr. SWE interviews at Google / FAANG*
