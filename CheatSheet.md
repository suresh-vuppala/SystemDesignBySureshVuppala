# System Design Cheatsheet
### Senior Software Engineer Interviews — Google / FAANG

> **How to use this:** Top section = quick-scan reference cards. Bottom section = deep-dive details via anchor links.

---

##  Quick Navigation

| Category | Key Topics |
|---|---|
| **Fundamentals** | [TCP/UDP](#tcpudp) · [HTTP/HTTPS](#httphttps) · [DNS](#dns) · [Fault Tolerance](#fault-tolerance) |
| **Security** | [Authentication](#authentication) · [Authorization](#authorization) |
| **Storage** | [SQL](#sql) · [NoSQL](#nosql) · [NewSQL](#newsql) · [Time-Series](#timeseries) · [Search](#search) |
| **Caching** | [Cache Strategies](#caching) · [Redis](#redis) · [CDN](#cdn) |
| **Messaging** | [Message Queues](#messagequeues) · [Kafka](#kafka) · [Pub/Sub](#pubsub) |
| **APIs** | [REST](#rest) · [gRPC](#grpc) · [GraphQL](#graphql) · [Real-time](#realtime) |
| **Compute** | [Microservices](#microservices) · [Serverless](#serverless) · [Service Mesh](#servicemesh) |
| **Infrastructure** | [Load Balancer](#loadbalancer) · [API Gateway](#apigateway) · [Proxy](#proxy) |
| **Consistency** | [CAP](#cap) · [Consistency Models](#consistency) · [Transactions](#transactions) · [Concurrency](#concurrency) |
| **Data Pipelines** | [CDC](#cdc) · [Sharding](#sharding) · [Replication](#replication) · [Rate Limiting](#ratelimit) |
| **Observability** | [Logging](#logging) · [Metrics](#metrics) · [Distributed Tracing](#tracing) · [Monitoring](#monitoring) |
| **Design Patterns** | [Blob Storage](#blobstorage) · [Data Warehouse](#warehouse) · [Bloom Filters](#bloomfilters) · [Circuit Breaker](#circuitbreaker) |

---

## STORAGE SYSTEMS

### SQL (Relational DB)
> **ACID guarantees + complex queries; vertical scaling only. Examples: PostgreSQL, MySQL, Cloud Spanner**

| STRENGTHS | WEAKNESSES |
|---|---|
| **ACID transactions:** All-or-nothing consistency; safe for money | **Write bottleneck:** Single leader (Postgres RPS: ~3K writes) |
| **Complex joins:** Denormalization not needed; queries flexible | **Reshard nightmare:** Adding shards is painful migration |
| **Strong consistency:** Reads always see latest writes | **Rigid schema:** Schema changes on 100GB table locks table |
| **Foreign key constraints:** Data integrity enforced by DB | **Not suitable for massive unstructured data** |

**Core Guarantees:**
- **ACID:** Atomicity (all/nothing), Consistency (constraints), Isolation (MVCC), Durability (WAL).
- **Transactional integrity:** Impossible to have partial updates.
- **No data corruption** even on crashes (WAL replay).

**When to use:**
- Financial systems (banking, payments, stocks).
- E-commerce (orders, inventory, transactions).
- Booking systems (must prevent double-booking).
- Anything requiring strong consistency + complex queries.

**Scaling SQL:**
- **Read replicas:** Followers serve reads; leader handles writes.
- **Connection pooling:** PgBouncer/ProxySQL — reuse connections (expensive to create).
- **Sharding by shard key:** Trade complex queries for horizontal scalability (N-1 shards unreachable for some queries).
- **Multi-leader (CockroachDB):** Multiple regions with ACID — but higher latency (consensus overhead).

**Example (E-commerce order):**
```sql
BEGIN;
SELECT * FROM inventory WHERE product_id=5 FOR UPDATE;  -- Lock
-- Check: quantity = 10, price = $50
UPDATE inventory SET quantity=9 WHERE product_id=5;
INSERT INTO orders (user_id, product_id, price) VALUES (123, 5, 50);
COMMIT;
```
Either whole transaction succeeds or nothing (invoice + inventory both or neither).

> See **Deep Dive: SQL** section for detailed implementation patterns

---

### NoSQL
> **Horizontal scaling, flexible schema, eventual consistency. Examples: DynamoDB, Cassandra, MongoDB, HBase**

| STRENGTHS | WEAKNESSES |
|---|---|
| **Horizontal scaling:** Add more nodes = more capacity (10x better than SQL) | **No complex joins:** Embedding or multiple queries needed |
| **No schema migration:** Add field to any document | **Eventual consistency:** Replicas out-of-sync (stale reads possible) |
| **High write throughput:** Write to any node (multi-master replication) | **No ACID across docs:** Single document atomic, not multi-doc |
| **Flexible:** Store anything; schema enforcement optional | **Ad-hoc queries hard:** Need to model data around specific access patterns |

**Core Guarantees:**
- **High availability:** Node down ≠ service down (replication).
- **Partition tolerance:** Network split ≠ data loss (async replication).
- **Trade:** Eventual consistency (stale reads) instead of strong consistency.

**Consistency tuning (Cassandra example):**
```
QUORUM write (W=2/3 nodes) + QUORUM read (R=2/3 nodes)
→ Guaranteed strong consistency (W+R > N)
→ But slower (must wait for majority)

ONE write (W=1) + ONE read (R=1)
→ Fast (local write) + fast (local read)
→ But replicas may diverge (eventual consistency)
```

**When to use:**
- Time-series data (IoT, metrics, logs).
- User sessions (fast reads, writes don't need consistent view).
- High write throughput (activity feeds, analytics).
- Social graphs (likes, followers).
- Scale to billions of records.

**Sub-types at a glance:**

| Type | Structure | Use Case | Examples |
|---|---|---|---|
| **Key-Value** | Flat: key → value | Session store, cache | DynamoDB, Redis |
| **Document** | JSON-like with nesting | User profiles, catalogs | MongoDB, Firestore, CouchDB |
| **Wide-Column** | Sparse: columns vary per row | Time-series, analytics, recommendations | Cassandra, HBase, Bigtable |
| **Graph** | Nodes + edges with properties | Social networks, recommendations, fraud | Neo4j, Neptune, ArangoDB |

**Example (DynamoDB user session):**
```
PUT /sessions/user123
{
  "user_id": "user123",           -- Partition key
  "session_id": "sess456",        -- Sort key
  "login_time": 1704000000,
  "last_activity": 1704003600,
  "ttl": 1704086400               -- Auto-delete (1 week TTL)
}
```
Can scale to billions of sessions; auto-cleanup with TTL.

>  [Deep Dive: NoSQL](#deep-dive-nosql)

---

### NewSQL
> **Global ACID at scale: SQL + NoSQL tradeoff. Examples: Google Spanner, CockroachDB, TiDB**

| STRENGTHS | WEAKNESSES |
|---|---|
| **ACID globally:** Multi-region transactions with consistency | **Consensus latency:** 5–10ms single-region, 100ms+ multi-region |
| **SQL interface:** Familiar ANSI SQL + code reuse | **Cost premium:** Spanner 10x more expensive than Postgres |
| **Horizontal scalability:** Write scales across regions (unlike SQL) | **Operational complexity:** Distributed system expertise needed |
| **Strong consistency:** No eventual consistency quirks | **Overkill for local systems:** Single-region adds zero benefit |

**Core Guarantees:**
- **Serializability:** All transactions appear to execute sequentially (strongest consistency).
- **Global consistency:** Cross-region strong consistency (via Paxos/Raft consensus).
- **No clock dependencies:** TrueTime (Spanner) uses atomic clocks; not dependent on NTP sync.

**When to use:**
- Financial systems demanding global transactions (insurance claims, settlements).
- Multi-region inventory (advertiser buys in US, charges in EU, bonus in APAC — all atomic).
- Ad bidding (multiple regions bidding on same impression).

**Trade-off:** Most apps don't need this. Sagas + Eventual Consistency usually sufficient. Use CockroachDB (cheaper) if you truly need NewSQL.

>  [Deep Dive: NewSQL](#deep-dive-newsql)

---

### Time-Series DB
> **Optimized for time-stamped data ingestion + range queries. Examples: InfluxDB, Prometheus, TimescaleDB, Druid**

| STRENGTHS | WEAKNESSES |
|---|---|
| **High ingest:** Millions of events/sec (write-optimized) | **Limited query flexibility:** Designed for specific patterns |
| **Compression:** 10:1 ratio (columns similar; compress well) | **Not for mutable data:** Updates/deletes slow |
| **Auto-retention:** TTL-based auto-delete old data | **General-purpose queries awkward:** Use SQL DB for those |
| **Range queries fast:** Ordered by time; seek directly | **Relational joins:** Can't join across metrics easily |

**Core Guarantees:**
- **Write durability:** Events written to disk/replication (not lost on crash).
- **Query isolation:** Concurrent reads/writes don't block each other.
- **Approximate aggregations:** Some DBs (Druid) trade accuracy for speed (HyperLogLog for unique counts).

**Typical architecture:**
```
IoT sensors send metrics (CPU, memory, disk) every 10s
→ InfluxDB/Prometheus scrapes and stores
→ Time-based partitions (data for Jan lives in Jan partition)
→ Query: "Give me CPU usage for server X between 10am-11am"
→ Partition prune: Skip Feb, Mar, ... partitions
→ Scan Jan partition only
```

**Retention + downsampling:**
- Raw 1s resolution: Keep 7 days.
- Downsampled 1min: Keep 30 days.
- Downsampled 1hour: Keep 1 year.
```
Query Today: Use 1s data (accurate).
Query 3 months ago: Use 1min data (approximate but good).
Query 1 year ago: Use 1hour data (very approximate).
```

**When to use:**
- Metrics & monitoring (Prometheus scraping services).
- Application performance monitoring (response times, error rates).
- Sensor data (temperature, pressure, location from IoT).
- Stock prices, market data (OHLCD candles).

>  [Deep Dive: Time-Series DB](#deep-dive-time-series-db)

---

### Search Engine (Elasticsearch / Solr)
> **Full-text search at scale; not a primary data store. Examples: Elasticsearch, OpenSearch, Solr**

| STRENGTHS | WEAKNESSES |
|---|---|
| **Full-text search:** Find "running" in documents (vs exact match) | **Not ACID:** No transactions; conflict resolution issues |
| **Fuzzy/typo tolerance:** "elasticsearch" matches "elasticsearch" | **Stale data:** Index lag (document not searchable immediately) |
| **Faceting/filtering:** Drill down by category, price range, etc. | **Not durable source of truth:** Reindex from primary needed |
| **Ranked results:** BM25 algorithm returns most relevant first | **Mapping explosion:** Too many unique fields break cluster |
| **Log aggregation:** Fast search across billions of log lines | **Query can be expensive:** Complex queries = high CPU |

**Core Guarantees:**
- **Inverted index:** Blazing fast lookups (milliseconds for billions of docs).
- **Shard resilience:** Replicas survive shard/node failure.
- **No consistency:** Index updates eventual (documents searchable after refresh interval).

**Architecture:**
```
Index (Lucene) → Shards (for scale) → Replicas (for HA)
Each shard: Segments (immutable) + inverted index

Indexing pipeline:
Text → Tokenization → Lowercasing → Stemming
→ Stop word removal → Term → Inverted index
```

**Common Pitfalls:**
- **Mapping explosion:** Every new field type bloats mappings (use dynamic:false).
- **Deep pagination:** Don't do `from:10000 size:100` (scans 10,100 docs). Use `search_after`.
- **Hot shards:** One shard receives 90% traffic (unbalanced distribution).

**When to use:**
- Product search on e-commerce.
- Log aggregation (ELK stack: Elasticsearch, Logstash, Kibana).
- Document/article search.
- Autocomplete suggestions.
- NOT as primary DB (data can be lost; reindex needed).

**Example (E-commerce):**
```
Query: "blue shoes under $100"
→ Search all documents for "blue" AND "shoes"
→ Filter price < 100
→ Rank by relevance (TF-IDF)
→ Return [shoe1 (99% match), shoe2 (85% match), ...]
```
Postgres full-text search exists but Elasticsearch is superior at scale.

>  [Deep Dive: Search Engine](#deep-dive-search-engine)

---

## ⚡ FUNDAMENTALS & NETWORKING

---

###  TCP/UDP
> **Transport layer protocols: TCP (reliable, ordered), UDP (fast, unreliable)**

| **TCP (Transmission Control Protocol)** | **UDP (User Datagram Protocol)** |
|---|---|
| **Connection-oriented:** Handshake before data | **Connection-less:** Send immediately (no setup) |
| **Ordered delivery:** Packets arrive in sequence | **Unordered:** Packets may arrive out-of-order |
| **Guaranteed delivery:** Retransmits lost packets | **Best-effort:** Lost packets not retransmitted |
| **Slow:** Acknowledgments + retries overhead | **Fast:** Minimal overhead (50+ Mbps vs 10+ Gbps UDP) |
| **Flow control:** Prevents overwhelming receiver | **No flow control:** Sender controls pace entirely |

**TCP Three-Way Handshake (SYN, SYN-ACK, ACK):**
```
Client                          Server
  |                               |
  |---- SYN (seq=100) --------→  |
  |                               |
  |  ←---- SYN-ACK (seq=300, ack=101) ----|
  |                               |
  |---- ACK (seq=101, ack=301) -→|
  |                               |
  └──────────── Connection Established ──────────────
```
**Guarantees:** 3-way handshake establishes connection, enables error detection, checksums verify data integrity.

**When to use:**
- **TCP:** Banking (transactions must be complete), email, HTTPS, file transfer, anything requiring reliability.
- **UDP:** Live video/audio streaming (some loss ok), gaming, DNS queries, IoT sensors (fire-and-forget), VoIP.

**Port numbers to know:** TCP (80:HTTP, 443:HTTPS, 3306:MySQL, 5432:Postgres) · UDP (53:DNS, 123:NTP, 161:SNMP).

> See **Deep Dive: TCP/UDP** section for detailed implementation patterns

---

###  HTTP/HTTPS
> **Application layer: HTTP (plaintext), HTTPS (encrypted with TLS/SSL)**

| **HTTP** | **HTTPS** |
|---|---|
| **Port 80** | **Port 443** |
| **Plaintext:** Anyone can read (unencrypted) | **Encrypted:** TLS/SSL protects data |
| **No authentication:** Server identity unverified | **Certificate-based:** Server proves identity (CA signed) |
| **No integrity:** Data can be modified in transit | **Integrity:** Checksums prevent tampering |
| **Fast:** No encryption overhead (~5% savings) | **Slight overhead:** Encryption + cert validation (~10ms) |

**TLS Handshake (TLS 1.3):**
```
Client                          Server
  |                               |
  |---- Client Hello (ciphers, version) -→
  |  ←--- Server Hello (cipher, certificate)
  |  ←--- [encrypted extensions & finished]
  |                              
  |---- Finished (encrypted) -→  |
  |                               |
  └──────── Encrypted Connection ──────────────
```

**Core Guarantees:**
- **Confidentiality:** Encrypted (AES-256).
- **Integrity:** Tamper-proof (SHA-256 HMAC).
- **Authenticity:** Server certificate verified by Certificate Authority.
- **Forward secrecy:** Session key discarded after use (if using ECDHE).

**HTTP Methods (recap):**
- **GET** — Retrieve data (safe, idempotent, cacheable).
- **POST** — Create data (not idempotent, side effects).
- **PUT** — Replace data (idempotent, whole resource).
- **PATCH** — Partial update (not idempotent, subset of fields).
- **DELETE** — Remove data (idempotent, removes resource).
- **HEAD** — Like GET but no body (for headers only).
- **OPTIONS** — Describe communication options (CORS preflight).

**HTTP Status Codes (common):**
- **2xx Success:** 200 OK, 201 Created, 204 No Content.
- **3xx Redirect:** 301 Moved, 302 Found, 304 Not Modified.
- **4xx Client Error:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict.
- **5xx Server Error:** 500 Internal, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout.

**When to use:**
- **HTTP:** Internal networks, testing, non-sensitive data.
- **HTTPS:** Everything in production. **Mandatory for:** Login, payments, health data, GDPR compliance, financial transactions.

**Real-world:** All major sites enforce HTTPS (HTTP → HTTPS 301 redirect). Let's Encrypt provides free certificates.

> See **Deep Dive: HTTP/HTTPS** section for TLS handshake, HTTP/2, HTTP/3 details

---

## SECURITY

---

###  Authentication
> **Verifying identity: "Who are you?" (Login & Credentials)**

**Authentication Methods:**

| Method | Protocol | Best For | Security |
|---|---|---|---|
| **Basic Auth** | `Authorization: Basic base64(user:pass)` | Internal APIs | ⚠️ Low (use HTTPS only) |
| **API Key** | `X-API-Key: abc123...` | Service-to-service, public APIs | ⚠️ Medium (needs rotation) |
| **Session Cookie** | Server creates session; browser sends cookie | Web apps | ✓ Medium (CSRF protection needed) |
| **Token (JWT)** | `Authorization: Bearer eyJh...` | Stateless APIs, microservices | ✓✓ High (if using RS256) |
| **OAuth 2.0** | 3rd-party login (Google, GitHub) | "Sign in with..." features | ✓✓ High (delegated auth) |
| **SAML** | XML-based enterprise auth | Corporate SSO | ✓✓ High (for enterprises) |
| **Kerberos** | Ticket-based (mutual auth) | Windows networks | ✓✓ High |

**JWT (JSON Web Token) Breakdown:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 (Header)
.
eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ (Payload)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c (Signature)

Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "user123", "name": "John Doe", "iat": 1516239022, "exp": 1516242622}
Signature: HMAC(HS256, Header.Payload, secret_key)
```

**JWT Algorithms:**
- **HS256 (HMAC):** Single server; shared secret. ⚠️ If secret leaked, all tokens forged.
- **RS256 (RSA):** Distributed; public/private key. ✓✓ Private key on auth server only; public key on services.

**Core Guarantees:**
- **Identity:** Server verified it's actually the user.
- **Token integrity:** Signature proves token wasn't tampered with.
- **Expiration:** Token expires after N seconds (force re-auth).
- **No replay:** Each token bound to session/timestamp.

**Best Practices:**
- Store JWT in **httpOnly cookie** (not localStorage; XSS-proof).
- Use **RS256** for microservices; HS256 for monoliths.
- **Always HTTPS** (JWT in plaintext = instantly compromised).
- Implement **token refresh:** Short-lived access token (15 min) + long-lived refresh token (7 days).
- **Invalidate on logout:** Server-side blacklist or short TTL.
- **Include user context:** sub (subject/user ID), iat (issued at), exp (expiration).

**Real-world:** Google generates JWT tokens for APIs. GitHub OAuth lets you "Sign in with GitHub" on third-party apps.

---

###  Authorization
> **Verifying permissions: "What are you allowed to do?" (Access Control)**

**Authorization Models:**

| Model | Definition | Use Case | Complexity |
|---|---|---|---|
| **Role-Based (RBAC)** | Users assigned roles; roles have permissions | Most systems, teams | Low |
| **Attribute-Based (ABAC)** | Rules based on attributes (user role, resource, time, location) | Fine-grained; healthcare, finance | High |
| **Access Control Lists (ACL)** | Per-resource list: who can do what | File systems, S3 policies | Medium |
| **Policy-Based** | JSON policies define rules (AWS IAM) | Cloud platforms, multi-tenant | High |

**RBAC Example:**
```
User: john@example.com
Role: Editor
Permissions: read, write, delete (own posts), edit profile

User: jane@example.com
Role: Admin
Permissions: read, write, delete (all), manage users, view logs, manage settings
```

**ABAC Example:**
```
Rule: Allow if
  - user.department == "finance"
  AND resource.type == "payroll"
  AND time >= 9:00 AND time <= 17:00
  AND ip_address in [192.168.0.0/16]
→ Grant access (else deny)
```
**Benefit:** Very granular (can't access after hours from unknown IP).

**Guarantees:**
- **Least privilege:** Users only get minimal permissions needed.
- **Deny by default:** Permissions explicitly granted (not implicit).
- **Auditability:** Log who accessed what (GDPR, HIPAA, SOX compliance).
- **No privilege escalation:** Can't promote yourself to admin.

**Best Practices:**
- **Separation of duties:** No one person approves + executes (payment approval, fund transfer).
- **Role hierarchies:** Admin > Moderator > User > Guest (inherit permissions downward).
- **Regular audits:** Remove unused permissions (quarterly).
- **Test authorization:** Test blocked access too (user cannot access, admin can).
- **Time-based access:** Revoke access after contract ends (auto-expire).

**Real-world:** GitHub uses RBAC (owner, maintainer, contributor, viewer roles). AWS IAM uses policy-based (JSON policies with conditions).

> See **Deep Dive: Authorization** section for RBAC hierarchies, ABAC examples, resource-level authorization

---

## DATA PIPELINES

---

###  Change Data Capture (CDC)
> **Streaming database changes to downstream systems (Event-driven data sync)**

**How CDC Works:**
```
Database Change Log:
  INSERT user='alice', email='alice@ex.com'
   ↓ (CDC tool reads continuously)
  UPDATE user SET status='active' WHERE id=1
   ↓
  DELETE user WHERE id=2
   ↓
  → Message Broker (Kafka) or Event Stream
       ↓ Consumers:
       ├─ Search Index (Elasticsearch) - update search results
       ├─ Analytics (BigQuery/Snowflake) - append to warehouse
       ├─ Cache (Redis) - invalidate old cache
       └─ Replica DB - replay to stay in sync
```

| STRENGTHS | WEAKNESSES |
|---|---|
| **Single source of truth:** DB is authoritative | **Latency:** Event delivery not instant (ms to seconds) |
| **Event ordering:** Changes in sequence (per partition) | **Eventually consistent:** Replicas lag behind |
| **No app code changes:** DB handles change capture | **Complexity:** Need CDC tool (Debezium, etc.) |
| **Multi-consumer:** Consumers independently process | **Schema evolution:** Backward compatibility required |

**CDC Tools & Platforms:**

| Tool | Sources | Destinations | Best For |
|---|---|---|---|
| **Debezium** | PostgreSQL, MySQL, MongoDB, Oracle, SQL Server | Kafka, S3, data lakes | Open-source, flexible, on-premise |
| **AWS DMS** | Any DB | RDS, S3, Redshift, Kinesis | AWS-native, serverless |
| **Fivetran** | 200+ SaaS & DB sources | Warehouses, data lakes | Zero-code, commercial |
| **Striim** | Real-time DB sources | Kafka, data lakes | Complex transformations |
| **Maxwell** | MySQL only | Kafka, files | Lightweight, MySQL-specific |

**Core Guarantees:**
- **Capture all changes:** At-least-once delivery (duplicates possible; consumer must be idempotent).
- **Ordering per table:** Changes for a user always in order (within partition).
- **Durability:** Changes logged in database transaction log before commit.

**Example (E-commerce):**
```
1. Order Service: UPDATE inventory SET qty = qty - 1 WHERE id=5
2. CDC captures: operational_db.inventory: {"op": "update", "before": {"qty": 10}, "after": {"qty": 9}}
3. Consumers process:
   - Real-time dashboard: qty now shows 9 (low stock warning)
   - Analytics pipeline: Sends to Kafka → BigQuery
   - Cache invalidation: Removes product from cache (force refresh on next view)
   - Replica sync: Secondary DB receives update (stays in sync)
```

**Real-world:** LinkedIn uses CDC to sync data across multiple data warehouses (100+ Kafka topics). Shopify uses CDC for real-time inventory across regions. Uber uses CDC for rider/driver data consistency.

---

###  Fault Tolerance & Reliability
> **Building systems that survive failures without losing functionality**

**Fault vs Failure:**
- **Fault:** Component breaks (disk fails, network drops, server crashes, software bug).
- **Failure:** System stops working (users can't complete transactions, API returns 500).
- **Goal:** Tolerate faults without system-wide failure.

**Failure Types & Mitigations:**

| Failure | Cause | Mitigation | RTO* | RPO** |
|---|---|---|---|---|
| **Hardware** | Disk corruption, server dies | Replication (2+ copies), RAID | 1 min | 0 sec |
| **Network** | Packet loss, high latency, partition | Retry, circuit breaker, multi-region | 5 sec | 0 sec |
| **Software** | Bug, memory leak, deadlock, OOM | Health checks, restart, canary deploy | 30 sec | 5 sec |
| **Cascading** | One service down → dependent services fail | Timeout, bulkheads, fallbacks | 10 sec | 1 sec |
| **Data corruption** | Silent data loss, encryption failure | Backup, replication, checksums | 1 hour | 15 min |

*RTO = Recovery Time Objective (how long until service restored)  
**RPO = Recovery Point Objective (how much data loss acceptable)

**Redundancy Models:**

| Model | Setup | Pros | Cons |
|---|---|---|---|
| **Active-Passive** | 1 primary, 1 standby (not serving traffic) | Simple failover | Standby machine idle; failover delay |
| **Active-Active** | 2+ primaries both serving traffic | No idle capacity, fast failover | Complex (conflict resolution, state) |
| **N+1** | N servers + 1 spare | Survives N failures | Extra cost (33% overhead) |

**Availability Tiers:**
```
99.0%   → 87.6 hours downtime/year       (basic, home projects)
99.9%   → 8.76 hours downtime/year       (enterprise standard)
99.99%  → 52 minutes downtime/year       (high-availability)
99.999% → 5 minutes downtime/year        (ultra-high; Google/AWS-grade; very costly)

Formula: Downtime (min) = (1 - availability) × 365 × 24 × 60
```

**Resilience Patterns:**

1. **Timeouts:** Don't wait forever for external calls.
   ```
   Call Payment API with 5s timeout
   If timeout → Fail fast (don't retry indefinitely)
   ```

2. **Retries (Exponential Backoff):** Transient failures recover.
   ```
   Attempt 1: Immediate (0s)
   Attempt 2: Wait 1s (database might have restarted)
   Attempt 3: Wait 2s
   Attempt 4: Wait 4s
   Attempt 5: Wait 8s max (don't retry forever; max 3 attempts typical)
   ```

3. **Circuit Breaker:** Stop retrying when clearly broken.
   ```
   [CLOSED] ← Requests pass through
     ↓ (5 failures)
   [OPEN] ← Requests fail immediately (don't call downstream)
     ↓ (wait 30s)
   [HALF_OPEN] ← Try 1 request
     ├─ Success → Back to CLOSED
     └─ Failure → Back to OPEN
   ```

4. **Bulkheads:** Isolate thread pools; one service doesn't starve others.
   ```
   Thread pool 1: Service A (max 10 threads)
   Thread pool 2: Service B (max 10 threads)
   If Service A hangs, only its 10 threads blocked (Service B unaffected)
   ```

5. **Health Checks:**
   - **Liveness:** Is service alive? (responds to /health).
   - **Readiness:** Can it handle traffic? (dependencies ok, DB connected).

**Example (Payment Service Failure):**
```
Order Service calls Payment Service:
Attempt 1: timeout (payment service slow) → retry
Attempt 2: timeout → retry
Attempt 3: timeout → 4th attempt would wait 8s
Circuit opens: Return "Payment temporarily unavailable" (fail fast)
User sees: "Transaction failed; try again later"
Payment service recovers (30s later)
Circuit half-opens: Test 1 request
Test succeeds: Circuit closes
Resume normal traffic
```

**Guarantees:**
- **No SPOF:** At least 2 of everything (2 DBs, 2 LBs, 2 regions).
- **Graceful degradation:** Partial outage doesn't mean 100% failure (cache results, serve stale).
- **Observability:** Monitor failures (metrics, logs, alerts).

**Real-world:** Netflix Chaos Monkey deliberately breaks things to test resilience. AWS multi-AZ ensures zone-level failures don't affect service. Stripe uses bulkheads for payment processing (one failing region doesn't affect others).

---

## ⚡ APIs & COMMUNICATION

---

###  REST API
> **Stateless HTTP-based architecture using standard methods (GET, POST, PUT, DELETE)**

| STRENGTHS | WEAKNESSES |
|---|---|
| **Universal:** Works everywhere (browsers, mobile, IoT) | **Over-fetching:** Get all fields even if you need 3 |
| **Cacheable:** HTTP caching (CDN, browser) out of the box | **Under-fetching:** Multiple requests for related data |
| **Simple:** Standard HTTP semantics everyone understands | **N+1 queries:** Often requires client-side aggregation |
| **Scalable:** Stateless; easy to load balance | **Versioning complexity:** `/v1/`, `/v2/` or content-type overhead |
| **Contracts:** OpenAPI/Swagger standardizes API docs | **No strong typing** on client side (without codegen) |

**Core Guarantees:**
- **Idempotency:** GET, PUT, DELETE are idempotent (safe to retry).
- **HTTP status codes** communicate intent (200=OK, 201=Created, 400=Bad Request, 404=Not Found, 500=Server Error).
- **Statelessness:** No session state on server; simplifies horizontal scaling.

**Strong Example:** E-commerce product API
```
GET /api/v1/products/123          → Fetch product
POST /api/v1/orders               → Create order (409 if inventory conflict)
PUT /api/v1/orders/456            → Update order (idempotent)
DELETE /api/v1/orders/456         → Cancel order
```

**Best for:** Public APIs · Microservice communication · Mobile/web backends · When you have diverse field requirements.

>  [Deep Dive: REST API](#deep-dive-rest-api)

---

###  gRPC
> **High-performance RPC framework using HTTP/2 and Protocol Buffers (binary serialization)**

| STRENGTHS | WEAKNESSES |
|---|---|
| **Ultra-fast:** Binary protocol (not JSON); 10x faster than REST | **Browser hostile:** HTTP/2 + binary; can't call directly from browsers |
| **Strong typing:** Protocol Buffers define exact schema; code generation | **Debugging harder:** Can't use curl; need gRPCurl or similar |
| **Bidirectional streaming:** Client → Server, Server → Client simultaneously | **Smaller ecosystem:** Fewer libraries than REST |
| **Connection reuse:** Multiplexing over single HTTP/2 connection | **Heavy dependency:** gRPC library required (not just HTTP client) |
| **Load balancing-friendly:** Built-in health checks and client-side LB | **Overkill for simple APIs:** Complexity not justified |

**Core Guarantees:**
- **Type safety:** Both sides generated from `.proto` file; incompatibility caught at compile time.
- **Streaming semantics:** Unary, server-stream, client-stream, bidirectional.
- **Timeout enforcement:** Deadline propagates through call chain.

**Strong Example:** Real-time trading system
```protobuf
service TradeService {
  // Bidirectional: client sends orders, server streams back fills
  rpc StreamTrades(stream Order) returns (stream Fill);
  // Low-latency request-response
  rpc QuotePrice(QuoteRequest) returns (Quote);
}
```

**Best for:** Microservice-to-microservice comms · Real-time bidirectional streams · Performance-critical paths (10K+ RPS) · Internal APIs only.

>  [Deep Dive: gRPC](#deep-dive-grpc)

---

###  GraphQL
> **Query language for APIs; client specifies exactly which fields it needs**

| STRENGTHS | WEAKNESSES |
|---|---|
| **No over-fetching:** Request only the fields you use | **Gateway complexity:** Must stitch multiple data sources |
| **Strongly typed schema:** Introspection enables powerful tooling | **Caching is hard:** Each query is unique (can't cache like REST) |
| **Single endpoint:** No versioning (`/v1/`, `/v2/` not needed) | **Query complexity:** Malicious query can DoS backend (N+1 queries) |
| **Developer experience:** Auto-docs, playground, real-time schema validation | **File uploads awkward:** Not as natural as REST multipart |
| **Nested fetches:** Reduce round-trips by requesting related data in one query | **Authorization complex:** Per-field permissions hard to implement |

**Core Guarantees:**
- **Schema** defines all possible types and operations (like a contract).
- **Type safety** on queries — server validates before execution.
- **Single query→single response** (batching possible but not default).

**Strong Example:** Social media feed API
```graphql
# Client requests only what's needed
query FetchFeed {
  user(id: "123") {
    name
    posts(limit: 10) {
      title
      content
      likes
      author { name }
    }
  }
}
```

**Query Complexity Threat:**
```graphql
# Attacker could send deeply nested query causing exponential database hits
query StealData {
  user { posts { author { posts { author { posts { ... } } } } } }
}
```
Mitigation: Depth limiting, query cost analysis, rate limiting per query complexity.

**Best for:** Complex client needs (mobile wants summary, web wants full data) · Internal tools · Frontend flexibility prioritized over backend simplicity.

>  [Deep Dive: GraphQL](#deep-dive-graphql)

---

###  Real-time Communication
> **Technologies for pushing data from server to client (vs polling)**

#### Short Polling
**Client repeatedly asks server "Got anything for me?"**
```
Client: GET /api/messages?last_id=100
Server: [messages 101, 102, 103]
Client: Waits N seconds
Client: GET /api/messages?last_id=103
...
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| Simple (just REST) | Wasteful: 99% of requests return nothing (empty polling) |
| Works in browsers instantly | High latency: N-second delay (often 5-30 sec) |
| Easy to rate limit | Server load scales with polling frequency × clients |

**Example:** Dashboard refreshing every 5 seconds, Twitter.com old-style.

---

#### Long Polling
**Client asks server; server holds connection until data available**
```
Client: GET /api/messages (connection open)
[Server waits...]
Event occurs → Server: [message]
Client: Processes response, immediately sends new GET
Server holds again...
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| Near real-time (seconds vs minutes) | Connection held open (consumes server resources) |
| Works in all browsers | Complex to implement reliably (timeout handling) |
| | Scalability limited (1 connection per client) |

**Example:** Chat applications before WebSockets. Facebook notifications (historically).

---

#### WebSockets (WS / WSS)
**Persistent bidirectional TCP connection over HTTP upgrade**
```
Client                    Server
  |                         |
  |---- WebSocket Upgrade --|
  |<--- 101 Switching ---- |
  |◄──── Full Duplex ─────►| (binary frames)
  |                         |
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| **True bidirectional:** Server pushes instantly | Server resources: One TCP connection per client (scales to ~100K) |
| **Low latency:** Milliseconds (not seconds) | Complex: Connection management, reconnection logic, heartbeats |
| **Efficient:** No HTTP overhead per message | Stateful (breaking LB assumption); requires sticky sessions or connection migration |
| **Binary mode:** Smaller frame size than HTTP | Harder debugging (not plain text) |

**Guarantees:**
- No ordering guarantee (need app-level sequencing if needed).
- No automatic reconnection (must implement with exponential backoff).
- Message framing (can't just dump bytes; must follow frame protocol).

**Strong Example:** Real-time stock ticker
```javascript
// Client
const ws = new WebSocket('wss://api.broker.com/trades');
ws.onmessage = (event) => {
  const trade = JSON.parse(event.data);
  updateChart(trade.price); // Instant update
};

// Server
socket.emit('trade', {price: 154.2, volume: 1000});
```

**Best for:** Live feeds (stock prices, sports scores) · Collaborative editing (Figma, Notion) · Gaming · Real-time notifications.

---

#### Server-Sent Events (SSE)
**Server pushes to client over HTTP (unidirectional)**
```
Client: GET /api/events (streaming)
Server: data: {stock: "AAPL", price: 150}\n\n
Server: data: {stock: "AAPL", price: 150.5}\n\n
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| **Simpler than WS:** Just HTTP GET on a stream endpoint | Unidirectional: client can't send data to server (must use separate HTTP POST) |
| **Auto-reconnect:** Browser handles connection drop + retry | Text-only (no binary; encode binary as base64) |
| **Works through proxies:** Standard HTTP | Limited to ~6 connections per domain (browser limit) |
| **Built-in event ID:** For resuming from last event | Not all browsers (IE not supported) |

**Strong Example:** Activity feed updates
```javascript
const eventSource = new EventSource('/api/feed/events');
eventSource.onmessage = (e) => {
  const update = JSON.parse(e.data);
  addPostToFeed(update);
};
```

**Best for:** One-way updates (notifications, activity feeds, progress bars) · Where WebSocket complexity is overkill.

---

#### WebRTC
**Peer-to-peer real-time communication (audio, video, data)**
```
Client A ←────P2P───► Client B
  ▲                     ▲
  └──── STUN/TURN ─────┘
       (signaling only)
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| **Direct peer:** No server bandwidth consumed for media (huge savings) | **Complex:** STUN, TURN, ICE candidates, SDP negotiation |
| **Encryption:** Browser-enforced encryption by default | **NAT/firewall issues:** Not always achievable (TURN fallback costly) |
| **Ultra-low latency:** Direct path | Requires JS in browser (no Curl or simple HTTP client) |
| | Takes time to establish (SDP exchange + ICE gathering) |

**Strong Example:** Video conference (Zoom, Google Meet, Jitsi)
- Initial signaling: Use server to exchange SDP (session description).
- Once connected: Media streams P2P directly.
- Server role: Tiny (10 KB handshake) vs centralized (entire bitstream).

**Best for:** Video/audio conferences · Real-time gaming · File sharing P2P · When bandwidth efficiency is critical for media.

---

>  [Deep Dive: Real-time Communication](#deep-dive-real-time-communication)

---

## ⚡ CACHING

---

###  Caching
> Strategies: Cache-Aside, Write-Through, Write-Behind, Read-Through

| GOOD AT | LIMITATIONS |
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

>  [Deep Dive: Caching Strategies](#deep-dive-caching)

---

###  Redis
> **In-memory data store: Lightning-fast cache, message broker, and data structure server**

| STRENGTHS | WEAKNESSES |
|---|---|
| **Sub-ms latency:** 100x faster than DB (in-memory) | **RAM-bound:** At $0.50/GB/month, cost adds up (Memcached cheaper than Redis) |
| **Rich structures:** Strings, Lists, Sets, Hashes, Sorted Sets, Streams, HyperLogLog | **No complex queries:** Not a replacement for databases |
| **Pub/Sub:** Broadcast messages to subscribers (fan-out) | **Not persistent by default:** RDB snapshots or AOF needed |
| **Streams:** Append-only log with consumer groups (Kafka-light) | **Single-threaded:** High throughput but one core bottleneck |
| **Atomic operations:** INCR, ZADD are inherently thread-safe | **Data loss risk:** Durability trade-offs between AOF (slow) and RDB (lossy) |

**Core Guarantees:**
- **Atomicity:** Operations are all-or-nothing (no partial updates due to crashes).
- **No replication without Cluster/Sentinel:** Out of box is single node (SPOF).
- **Ordered Sorted Sets:** Guaranteed ordering by score; ZSet operations O(log N).

**Data Structures & Use Cases:**

| Structure | Example | Use Case |
|---|---|---|
| **String** | `SET counter 42` · `INCR counter` | Session tokens, atomic counters, small configs |
| **List** | `LPUSH queue:emails msg1 msg2` · `RPOP` | Job queues, activity feeds, message buffers |
| **Set** | `SADD favorites:user1 post_5 post_8` | Unique visitors, tags, followers, deduplication |
| **Sorted Set (ZSet)** | `ZADD leaderboard 100 player1 95 player2` | Leaderboards, priority queues, rate limit counters |
| **Hash** | `HSET user:1 name "Alice" age 30` | User profiles, cache objects, config maps |
| **Stream** | `XADD events * TYPE login` · Consumer groups | Event log, message broker, audit trail |
| **Bitmap** | `SETBIT dau:2024-01-15 12345 1` | Daily active users, feature flags, attendance |
| **HyperLogLog** | `PFADD unique:visitors ip1 ip2 ip3` | Approximate unique count (error: 0.81%) |

#### Redis Pub/Sub (Fire-and-Forget Broadcasting)
**Pattern:** Publisher sends to channel; all current subscribers receive (no history, no persistence).

```
Publisher: PUBLISH chat:room1 "Hello everyone!"
Subscriber A: SUBSCRIBE chat:room1 → receives "Hello everyone!"
Subscriber B: SUBSCRIBE chat:room1 → receives "Hello everyone!"
Subscriber C: Not listening → MISSES message (not stored)
Subscriber D: Joins later → NO MESSAGE HISTORY (can't replay)
```

| STRENGTHS | WEAKNESSES |
|---|---|
| **Real-time:** Instant delivery to subscribers (~1ms) | **No persistence:** Messages lost if no subscribers |
| **Fan-out:** One publish → all subscribers receive | **No replay:** Subscriber joining late misses all history |
| **Pattern matching:** PSUBSCRIBE channel:* | **No ack/retry:** Fire-and-forget (can lose messages) |
| **Low latency:** Minimal overhead | **Limited routing:** Can't do complex message routing |

**Use cases:** Live chat notifications, real-time collaboration (Figma), cache invalidation signals, activity feeds (online status), sports live scores.

**Example:**
```
PUBLISH user:123:online "active"
→ Multiple services listening get notification
   - Messaging service sees user online → enables chat
   - Presence service sees user online → updates status
   - Analytics sees login → increments counter
```

---

#### Redis Streams (Persistent Message Log with Consumer Groups)
**Pattern:** Append-only log of entries; multiple consumer groups track progress independently.

```
XADD events * user_id 123 action "purchase" amount 99.99
  → Returns: 1704067200000-0 (timestamp-sequence, auto-generated)

XREAD COUNT 10 STREAMS events 0
  → Returns all 10 entries; blocks if empty

XGROUP CREATE events order-service 0  (group named "order-service")
XREADGROUP GROUP order-service consumer1 STREAMS events >
  → Returns unread entries (since group creation)
  → Tracks: which consumer processed which entries

If consumer1 crashes:
  Consumer2 takes over: XREADGROUP GROUP order-service consumer2 STREAMS events >
  → Gets entries consumer1 didn't finish (auto-rebalance)
```

| STRENGTHS | WEAKNESSES |
|---|---|
| **Persistent:** Messages survive server restart (AOF/RDB) | **Single-threaded:** Can't parallelize per-entry processing (partition across multiple keys if needed) |
| **Consumer groups:** Track offset per group (exactly-once semantics) | **No ordering across streams:** Different streams = different order |
| **Replay:** Read from any offset (XREAD with ID, XRANGE) | **Not as fast as Kafka:** Single node <100K events/sec typical |
| **Blocking reads:** XREAD BLOCK 0 (wait if empty) | **Manual consumer management:** No auto-scaling like Kafka |
| **Range queries:** XRANGE events - + (all entries, with filtering) | **Cluster replication:** Must use Sentinel/Cluster (no built-in HA) |

**Consumer Group Guarantees:**
- **Exactly-once:** Once consumer ACKs (XACK), entry marked done.
- **Auto-rebalance:** If consumer dies, other consumers auto-assigned (need to call XREADGROUP again).
- **Pending entries:** XPENDING events group (shows unacknowledged entries).

**Real-world use cases:** Activity logs (audit trail), event sourcing (rebuild state), order processing workflow, IoT sensor streams, real-time analytics pipelines.

**Example (Order Processing):**
```
1. Order created:
   XADD orders * customer_id 5 amount 100 status "pending"
   
2. Payment service:
   XGROUP CREATE orders payment-service 0
   XREADGROUP GROUP payment-service consumer1 STREAMS orders > (blocks)
   → Gets order → Charges card → XACK orders payment-service {entry_id}
   
3. Fulfillment service (independent):
   XGROUP CREATE orders fulfillment-service 0
   XREADGROUP GROUP fulfillment-service consumer1 STREAMS orders > (blocks)
   → Gets order → Ships → XACK
   
4. Analytics service (independent):
   XGROUP CREATE orders analytics 0
   XREADGROUP GROUP analytics consumer1 STREAMS orders > (blocks)
   → Gets order → Logs to DW → XACK
   
5. Crash recovery:
   If payment service crashes: Consumer2 processes pending entries (XPENDING)
```

**Redis Pub/Sub vs Streams:**

| Feature | Pub/Sub | Streams |
|---|---|---|
| **Persistence** | ✗ | ✓ (within retention) |
| **Replay** | ✗ | ✓ (from any offset) |
| **Consumer groups** | ✗ | ✓ (with offset tracking) |
| **Exactly-once** | ✗ | ✓ (with ACK) |
| **Latency** | <1ms | <5ms |
| **Best for** | Real-time notifications | Event log, queuing |

---

**Persistent Modes:**
- **RDB (Snapshot):** Periodic `BGSAVE` → compact file. Fast restore, data loss since last snapshot possible.
- **AOF (Append-Only File):** Log every write. Slower startup, safer. `fsync: always` is durable but slow.
- **Hybrid:** RDB for bulk + AOF for recent changes (Redis 4.0+).

**Redis Cluster:**
- **Hash slots:** 16,384 slots distributed across N nodes.
- **Failover:** Each node has replicas; Sentinel promotes replica on master failure.
- **Scaling reads:** Multiple replicas; reads distributed.
- **But writes still hit one master per slot** (not distributed).

**Distributed Lock (Redlock):**
```lua
-- Acquire lock on N nodes
-- Success = majority (N/2 + 1) acquire lock
-- TTL prevents deadlock
-- Release with Lua script (atomic check + delete)

EVAL [[
  if redis.call('GET', key) == token then
    return redis.call('DEL', key)
  else
    return 0
  end
]], 1, lock_key, my_token
```

**When to use Redis:**
- In-memory cache (speeds up reads 100x).
- Rate limiting (INCR + TTL is perfect).
- Leaderboards (`ZADD` with scoring).
- Session store (atomic, fast).
- Distributed locks (Redlock with TTL).
- Event streams (consumer groups).

**When NOT to use:**
- Primary data store (not durable enough; NoSQL DB if you need persistence).
- Large datasets > available RAM (Memcached, ElastiCache tiering).
- Ad-hoc queries (use a database).

**Real-world use cases:** Session management · Rate limiting · Leaderboards · Distributed locks · Real-time feeds · Job queues (BullMQ) · Cache-aside with TTL · Event sourcing

>  [Deep Dive: Redis](#deep-dive-redis)

---

###  CDN
> **Examples:** Cloudflare, AWS CloudFront, Fastly, Akamai

| GOOD AT | LIMITATIONS |
|---|---|
| Serving static assets globally with low latency | Dynamic, user-specific content |
| DDoS protection / edge security | Real-time personalization at edge (limited) |
| Reducing origin server load | Frequent cache invalidations (complex) |
| TLS termination at edge | Cost at very high invalidation frequency |

**Real-world use cases:** Image/video delivery · JS/CSS bundles · HTML pages (SSG sites) · Software downloads · Streaming (HLS segments)

>  [Deep Dive: CDN](#deep-dive-cdn)

---

## ⚡ MESSAGING

---

###  Message Queue (RabbitMQ / SQS)
> **Examples:** RabbitMQ, AWS SQS, Azure Service Bus

| GOOD AT | LIMITATIONS |
|---|---|
| Decoupling producers from consumers | Message replay (messages deleted after consume) |
| Work queue / task distribution | High-throughput streaming (millions/sec) |
| Retry logic + dead-letter queues | Fan-out to many consumers simultaneously |
| At-least-once delivery guarantees | Long-term message retention |

**Real-world use cases:** Order processing · Email/SMS sending · Background jobs · Image resize pipelines · Notification dispatch

>  [Deep Dive: Message Queue](#deep-dive-message-queue)

---

###  Apache Kafka
> **Distributed log: event streaming platform at massive scale (LinkedIn: 4+ trillion events/day)**

| STRENGTHS | WEAKNESSES |
|---|---|
| **Extreme throughput:** 1M+ events/sec per cluster | **Operational overhead:** Requires ZooKeeper, cluster management |
| **Durable:** Events persisted to disk; replayable | **Overkill for low volume:** Setup + maintenance complexity |
| **Replay/rewind:** Consumer can reset to any offset (rebuild state) | **per-message acking not possible:** Batch-oriented (efficiency vs flexibility) |
| **Fan-out:** Multiple consumer groups independently consume | **Ordering per partition only:** Different partitions can be out-of-order |
| **Event sourcing ready:** Build audit logs, state machines | **Network I/O bound:** High latency networks kill throughput |

**Core Guarantees (critical):**
- **No message loss** when `acks=all` + `min.insync.replicas=2` (default: N/A; must be set explicitly).
- **In-order delivery per partition:** Messages stay ordered in a partition (not across partitions).
- **At-least-once semantics:** Default (duplicates possible; idempotent consumer needed for exactly-once).

**Kafka Architecture:**
```
Topic (e.g., "orders")
├─ Partition 0 (messages 0-999)   → Replica on Leader + Follower
├─ Partition 1 (messages 1000-1999)
└─ Partition 2 (messages 2000-2999)

Consumer Group A: Consumer1 → Partition 0
Consumer Group A: Consumer2 → Partition 1
Consumer Group B: Consumer3 → All partitions (independent!)
```

**Delivery Semantics (producer config):**
```
acks=0: Fire-and-forget (lossy, fastest)
acks=1: Leader acks, doesn't wait for followers (ok, fast)
acks=all: Wait for all in-sync replicas (durable, slowest)
  + min.insync.replicas=2: At least 2 copies written

Exactly-once needs:
- Idempotent producer (enable.idempotence=true)
- Transactional writes (atomic multi-partition)
- Consumer idempotency (dedup by message key)
```

**Consumer offsets:**
```
Consumer reads partition 0:
Message offset 0: "purchase $50"    ← Last processed
Message offset 1: "purchase $30"
Message offset 2: "refund $50"

Consumer commits offset=0 → server stores this
If consumer crashes:
  Restart: Read from offset=1 (resume without reprocessing 0)

No seek ability in KV store; must replay from beginning (inefficient)
```

**Key concepts (from KafkaInternals.md deep dive):**
- **ISR (In-Sync Replicas):** Replicas caught up with leader (not lagging).
- **High Watermark:** Safe offset (all ISR have replicated).
- **Log segment:** Time-rolling chunks (e.g., rolled every 1 GB or 1 day).
- **Compacted topic:** Keep only latest value per key (state snapshots, not event log).

**When to use Kafka vs alternatives:**

| Use Case | Kafka | RabbitMQ/SQS | Pub/Sub |
|---|---|---|---|
| **High-volume events (>100K/sec)** | ✓ | ✗ | ~ |
| **Replay / rewind** | ✓ | ✗ | ~ |
| **Fan-out to many consumers** | ✓ | ✓ | ✓ |
| **Point-to-point work queue** | ~ | ✓ | ✗ |
| **Operational simplicity** | ✗ | ✓ | ✓ |

**Strong Example (LinkedIn activity):**
```
Events: Page views, clicks, comments (4T+/day)
→ Stored in Kafka (durable log)
→ Multiple consumer groups:
   - Real-time counters (Flink) → "Trending feed"
   - Batch analytics (Spark) → Dashboards
   - ML pipeline (Kafka Streams) → Recommendations
   - Search indexing (ES plugin) → Search results

Without Kafka (recreate same event ingestion):
- Multiple sources (page view service, click service, comment service)
- Each publishes to different destination (DB, cache, queue)
- Nightmare to build "feed" from separate sources
- With Kafka: Single source of truth (event log)
```

**Real-world use cases:** Activity tracking (LinkedIn) · Real-time analytics pipelines · Microservice event bus · Change Data Capture (CDC) · Audit logs · Stream processing (Flink, Kafka Streams)

>  [Deep Dive: Kafka](#deep-dive-kafka)

---

###  Pub/Sub (Google Pub/Sub / SNS)
> **Examples:** Google Cloud Pub/Sub, AWS SNS, Azure Event Grid

| GOOD AT | LIMITATIONS |
|---|---|
| Fan-out to many subscribers simultaneously | Ordered delivery (not guaranteed by default) |
| Fully managed, serverless scale | Long retention / replay (use Kafka for that) |
| Event-driven architecture triggers | Complex routing logic |
| Cross-service async communication | Point-to-point work queues |

**Real-world use cases:** Triggering downstream services on events · Mobile push notification fan-out · Cross-region event propagation · Webhook fan-out

>  [Deep Dive: Pub/Sub](#deep-dive-pubsub)

---

## ⚡ COMPUTE

---

###  Microservices

| GOOD AT | LIMITATIONS |
|---|---|
| Independent deployment & scaling per service | Distributed system complexity |
| Team autonomy (own service, own DB) | Network latency between services |
| Technology diversity per service | Harder debugging / tracing |
| Fault isolation | Data consistency across services |

**Real-world use cases:** Netflix (1000s of services) · Uber (trip, driver, payment services) · Amazon (order, inventory, fulfillment)

>  [Deep Dive: Microservices](#deep-dive-microservices)

---

###  Serverless
> **Examples:** AWS Lambda, Google Cloud Functions, Cloudflare Workers

| GOOD AT | LIMITATIONS |
|---|---|
| Event-driven, spiky workloads | Long-running or stateful processes |
| Zero infra management | Cold start latency |
| Auto-scaling to zero | GPU / high-memory workloads |
| Pay-per-execution cost model | Fine-grained performance control |

**Real-world use cases:** Image processing on upload · Webhook handlers · Scheduled jobs · API backends for low-traffic apps · Auth callbacks

>  [Deep Dive: Serverless](#deep-dive-serverless)

---

###  Service Mesh
> **Examples:** Istio, Linkerd, Consul Connect

| GOOD AT | LIMITATIONS |
|---|---|
| mTLS between services (zero-trust networking) | Adds latency (sidecar proxy overhead) |
| Observability (traces, metrics per service) | Operational complexity |
| Traffic management (canary, circuit breaking) | Small-scale systems (overkill) |
| Retries / timeouts declaratively | Steep learning curve |

**Real-world use cases:** Zero-trust service-to-service auth · Canary deployments · Circuit breaking · Distributed tracing infrastructure

>  [Deep Dive: Service Mesh](#deep-dive-service-mesh)

---

## ⚡ NETWORKING

---

###  Load Balancer
> **Types:** L4 (TCP/UDP), L7 (HTTP); Examples: AWS ALB/NLB, NGINX, HAProxy

| GOOD AT | LIMITATIONS |
|---|---|
| Distributing traffic across instances | Single point of failure if not HA |
| Health checks + automatic failover | State persistence (sticky sessions add complexity) |
| SSL termination (L7) | Very low-latency requirements (adds hop) |
| Routing by path/header (L7) | Custom application-level logic |

**Algorithms:** Round Robin · Least Connections · IP Hash · Weighted

**Real-world use cases:** Web server fleets · API tier · Microservice ingress · Blue-green deployments

>  [Deep Dive: Load Balancer](#deep-dive-load-balancer)

---

###  API Gateway
> **Examples:** AWS API Gateway, Kong, Apigee, Nginx

| GOOD AT | LIMITATIONS |
|---|---|
| Single entry point for all clients | Added latency (extra hop) |
| Auth, rate limiting, SSL in one place | Becomes a bottleneck if not scaled |
| Request routing to microservices | Complex request transformations |
| API versioning & throttling | Business logic (should not live here) |

**Real-world use cases:** Mobile/web API access · Third-party API exposure · B2B partner APIs · Aggregating multiple microservice responses

>  [Deep Dive: API Gateway](#deep-dive-api-gateway)

---

###  Forward & Reverse Proxy
> **Network intermediaries: Forward Proxy (client-side), Reverse Proxy (server-side)**

**Forward Proxy (Client Perspective):**
```
Client (Internal Network)
  ↓ (forwards request through proxy)
Forward Proxy
  ↓ (makes request to external internet)
External Server
```
Client talks to proxy; proxy fetches from internet on their behalf.

| STRENGTHS | WEAKNESSES |
|---|---|
| **Privacy:** Hide client IP from internet | **Performance:** Extra hop adds latency |
| **Content filtering:** Block malicious sites | **Single point of failure:** If proxy down, no internet |
| **Caching:** Cache popular responses | **Complexity:** Must configure each client |
| **Logging:** Monitor employee internet usage | **Not for high-volume:** Can become bottleneck |

**Use cases:** Corporate networks (employees behind proxy), accessing restricted regions, anonymity, bandwidth caching.

---

**Reverse Proxy (Server Perspective):**
```
Internet Clients
  ↓ (external request)
Reverse Proxy (Public IP)
  ↓ (routes to backend)
Backend Servers (Private IPs)
```
Clients talk to proxy; proxy forwards to internal backends (clients don't know internal topology).

| STRENGTHS | WEAKNESSES |
|---|---|
| **Hide backend:** Clients don't see internal IPs | **Added latency:** Extra hop through proxy |
| **Load balancing:** Distribute traffic across servers | **Becomes bottleneck:** If proxy not scaled |
| **SSL termination:** Decrypt HTTPS at proxy (backends use HTTP) | **Single point of failure:** Must be HA (2+ proxies) |
| **Caching:** Cache responses before returning to client | **Complex**: State tracking, session persistence |
| **DDoS protection:** Absorb attacks before reaching backends | |
| **Rate limiting:** Throttle abusive clients | |
| **Compression:** Compress responses (gzip) | |

**Use cases:** Web server fleets (NGINX in front of 100 servers), microservice ingress, SSL offloading, CDN edge nodes.

**Forward vs Reverse Proxy:**

| Aspect | Forward Proxy | Reverse Proxy |
|---|---|---|
| **Initiator** | Client (knows about proxy) | Client (doesn't know about proxy) |
| **IP visibility** | Client IP hidden from server | Server IPs hidden from client |
| **Primary use** | Privacy, filtering, caching | Load balancing, SSL, DDoS protection |
| **Setup** | Configure each client | Configure at server entry point |
| **Scaling** | Hard (each client needs config) | Easy (single entry point scales) |
| **Example** | Corporate/VPN proxy | AWS ALB, NGINX, Cloudflare |

**Real-world example (Reverse Proxy):**
```
Client in Brazil: GET https://api.example.com/users

Reverse Proxy (Cloudflare edge in Brazil):
  1. Decrypt TLS (SSL termination)
  2. Check cache (hit) → return stored response
  3. Route to backend (miss) → forward to Oregon data center
  4. Cache response locally (for next client)
  5. Encrypt response → send to client

Benefit: Latency < 50ms (local) vs 150ms+ (cross-ocean to Oregon)
```

>  [Deep Dive: Forward/Reverse Proxy](#deep-dive-forward-reverse-proxy)

---

## ⚡ CONSISTENCY & DISTRIBUTED SYSTEMS

---

###  CAP Theorem

> A distributed system can guarantee only **2 of 3**: **C**onsistency, **A**vailability, **P**artition Tolerance.
> Since network partitions are unavoidable, the real trade-off is **CP vs AP**.

| System Type | Behavior During Partition | Examples |
|---|---|---|
| **CP** | Returns error rather than stale data | HBase, Zookeeper, Spanner |
| **AP** | Returns possibly stale data | Cassandra, DynamoDB, CouchDB |

>  [Deep Dive: CAP Theorem](#deep-dive-cap-theorem)

---

###  Consistency Models

| Model | Guarantee | Use When |
|---|---|---|
| **Strong** | All reads see latest write | Financial transactions, inventory |
| **Linearizable** | Strongest — real-time ordering | Distributed locks, counters |
| **Eventual** | Replicas converge over time | Social likes, DNS, shopping carts |
| **Read-your-writes** | You always see your own writes | User profile updates |
| **Causal** | Causally related writes are ordered | Comments/replies, collaborative editing |

>  [Deep Dive: Consistency Models](#deep-dive-consistency-models)

---

###  Concurrency Control
> **How multiple transactions access the same data without corruption**

#### Pessimistic Locking
**Principle:** Lock first; assume conflict will happen; hold lock until done.
```sql
-- Get inventory, lock it (exclusive), update, release
BEGIN;
SELECT * FROM inventory WHERE product_id = 123 FOR UPDATE;  -- Lock acquired
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 123;
COMMIT;  -- Lock released
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| **Safe:** No conflicts once lock acquired | **Slower:** Waiting threads blocked |
| **No retry logic:** Execute once, guaranteed success | **Deadlock risk:** Lock A → Lock B vs Lock B → Lock A |
| **Predictable:** Blocking is clear | **Scale bottleneck:** Heavy contention kills throughput |

**Use when:** High contention (seats for concert). Conflicts are expected and frequent.

**Example (E-commerce):**
```sql
-- Assume 10,000 users buy last 5 items
-- Pessimistic: 4,999 are blocked until first buyer releases lock
-- Lock held: ~100ms → queue of 4999 × 100ms = 8+ minutes → unacceptable!
```

---

#### Optimistic Locking
**Principle:** Assume no conflict; check on write; retry if conflict detected.
```sql
-- Transaction 1
SELECT id, quantity, version FROM inventory WHERE product_id = 123;
-- version = 5, quantity = 10
[do computation]
UPDATE inventory SET quantity = 9, version = 6 
  WHERE product_id = 123 AND version = 5;  -- Check version matches

-- Transaction 2 (concurrent)
SELECT id, quantity, version FROM inventory WHERE product_id = 123;
-- version = 5, quantity = 10
[do computation]
UPDATE inventory SET quantity = 9, version = 6 
  WHERE product_id = 123 AND version = 5;  -- version = 6 now  UPDATE fails

Retry Transaction 2:
SELECT... version = 6, quantity = 9
UPDATE... version = 7 WHERE version = 6  --  Success
```
| ADVANTAGES | DISADVANTAGES |
|---|---|
| **High throughput:** No blocking | **Retry overhead:** Lost work on conflict |
| **Low latency:** No waiting | **Wasted computation:** Aborted queries are wasted |
| **Deadlock-free:** No locks = no deadlocks | **Not ideal for high contention:** Many retries |

**Use when:** Low contention (most edits succeed). Example: Google Docs simultaneous edits.

**Guarantees:**
- **Version field:** Application must track and check version on update.
- **Stale read possible:** Version might be outdated between read and write.
- **Lost update prevented:** CAS (Compare-And-Set) operation ensures atomicity.

**Strong Example (Booking system):**
```
10 users check availability (10:00am)
All see: seats [5, 6, 7, 8, 9] available, version=10
All try to book seat 5 simultaneously

Optimistic:
- User 1: UPDATE seat_booking SET booked=true WHERE seat=5 AND version=10 
- User 2-10: UPDATE ...WHERE version=10  (now version=11) → retry but seat taken
Result: Seat 5 goes to userI do 1; others see booking failed

Pessimistic:
- All 10 wait for lock on seat 5
- User 1 gets lock, books, releases
- User 2 gets lock, tries to book seat 5 → "already booked"
- Users 3-10 similarly: "already booked"
But blocking caused 10s queue (unacceptable for web)
```

>  [Deep Dive: Concurrency Control](#deep-dive-concurrency-control)

---

###  Distributed Transactions



| Pattern | Mechanism | Trade-off |
|---|---|---|
| **2PC (Two-Phase Commit)** | Coordinator + prepare/commit phases | Blocking — coordinator failure = stuck |
| **Saga** | Chain of local transactions + compensating actions | Complex rollback; eventual consistency |
| **Outbox Pattern** | Write event to DB outbox table + poll/CDC to publish | Reliable event publishing without 2PC |
| **TCC (Try-Confirm-Cancel)** | Reserve → Confirm or Cancel | High overhead; used in fintech |

**Real-world use cases:** Order + payment + inventory (Saga) · Reliable event publishing (Outbox) · Airline seat reservations (TCC)

>  [Deep Dive: Distributed Transactions](#deep-dive-distributed-transactions)

---

## ⚡ SCALABILITY PATTERNS

---

###  Sharding

| GOOD AT | LIMITATIONS |
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

>  [Deep Dive: Sharding](#deep-dive-sharding)

---

###  Replication

| Type | Description | Use Case |
|---|---|---|
| **Leader-Follower** | One writer, many readers | Read-heavy workloads; MySQL, Postgres |
| **Multi-Leader** | Multiple writers, conflict resolution needed | Multi-region writes; Google Docs |
| **Leaderless** | Any node accepts writes (quorum) | High availability; Cassandra, Dynamo |

**Sync vs Async:**
- **Synchronous:** Strong consistency, higher write latency.
- **Asynchronous:** Lower latency, risk of data loss if leader fails before replication.

>  [Deep Dive: Replication](#deep-dive-replication)

---

###  Rate Limiting

| Algorithm | How It Works | Best For |
|---|---|---|
| **Token Bucket** | Tokens added at fixed rate; request consumes token | Bursty traffic (common default) |
| **Leaky Bucket** | Requests processed at fixed rate; excess queued/dropped | Smooth output rate |
| **Fixed Window** | Count requests per fixed time window | Simple; susceptible to edge bursts |
| **Sliding Window Log** | Log timestamps of requests in window | Accurate; memory-heavy |
| **Sliding Window Counter** | Weighted blend of current + previous window | Accurate + memory efficient |

**Where to implement:** API Gateway · Reverse proxy · Redis (atomic INCR + TTL) · Application layer

**Real-world use cases:** API abuse prevention · Login attempt throttling · SMS OTP limits · Search query rate limiting

>  [Deep Dive: Rate Limiting](#deep-dive-rate-limiting)

---

## OBSERVABILITY & MONITORING

---

### Logging

**Purpose:** Record detailed events and errors for debugging, auditing, and compliance.

**Log Levels (by severity):**
- **DEBUG:** Low-level diagnostic info (variable values, function entry/exit)
- **INFO:** Operational events (user login, job started, service deployed)
- **WARN:** Potentially harmful situations (deprecated API used, high memory)
- **ERROR:** Error events (exception caught, operation failed, retry triggered)
- **CRITICAL/FATAL:** System is unusable or about to fail (db connection lost, out of memory)

**Logging Best Practices:**
- **Structured logging:** JSON format with key-value pairs (not free-form text)
  ```json
  {"timestamp": "2026-04-08T10:15:30Z", "level": "ERROR", "service": "payment", "user_id": "123", "error": "payment_failed", "amt": 99.99}
  ```
- **Correlation IDs:** Include `request_id` to trace flow across services
- **Sampling:** Log 100% of errors, but only 1% of normal requests (cost savings)
- **Don't log:** Passwords, credit cards, API keys (redact sensitive data)

**Logging Tools:**
- **ELK Stack:** Elasticsearch (store), Logstash (parse), Kibana (visualize)
- **Splunk:** Enterprise log aggregation and search
- **CloudWatch:** AWS-native logging
- **Datadog:** Log aggregation + monitoring + APM

**Core Guarantees:**
- **Immutability:** Logs cannot be tampered with (forensics, compliance)
- **Searchability:** Find all events for a user/transaction/service
- **Retention:** Meet compliance (GDPR 30 days minimum, some industries years)
- **Privacy:** PII redacted; only authorized access

---

### Metrics

**Purpose:** Aggregate measurements of system behavior over time (not individual events).

**Common Metrics (Golden Signals by Google SRE):**

| Metric | Definition | Example Value | Alert Threshold |
|---|---|---|---|
| **Latency** | Time to process request | p50=10ms, p99=200ms | p99 > 500ms |
| **Traffic** | Requests per second | 10K RPS | > 15K RPS |
| **Errors** | % of requests that failed | 0.1% error rate | > 1% |
| **Saturation** | How "full" is the service | CPU 75%, Memory 80%, Disk 90% | CPU > 90% |

**Metrics Collection:**
```
Application (Prometheus client) → Pushes metrics → Prometheus server (scrapes)
                                                  ↓
                                              Time-series DB
                                                  ↓
                                          Grafana (visualize)
```

**Sample Metrics Dashboard:**
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database query latency
- Cache hit rate
- Queue depth
- CPU/Memory utilization
- Network I/O

**Metrics Tools:**
- **Prometheus:** Open-source time-series DB + alerting (pull model)
- **Datadog:** SaaS metrics + APM + logs (push model)
- **InfluxDB:** Time-series specialized DB (good for time-series data)
- **CloudWatch:** AWS-native metrics

**Core Guarantees:**
- **Cardinality safety:** High-cardinality labels (user IDs) can explode storage; monitor label design
- **Data aggregation:** No individual events (privacy + storage efficiency)
- **Retention:** Delete old metrics after N days (cost)
- **Query language:** PromQL (Prometheus), Datadog Query Language, etc.

---

### Distributed Tracing

**Purpose:** Track a single request flow across multiple services (end-to-end visibility).

**How Tracing Works:**
```
User Request → API Gateway (trace_id=abc123)
                ├── OrderService (span_id=1, trace_id=abc123)
                │   ├── GET /inventory (span_id=1.1)
                │   └── POST /orders (span_id=1.2)
                ├── PaymentService (span_id=2, parent_id=1.2)
                │   └── Charge credit card (span_id=2.1)
                └── NotificationService (span_id=3, parent_id=1)
                    └── Send email (span_id=3.1)

Result: Timeline of latency per service + dependencies
```

**Tracing Components:**
- **Trace ID:** Links all spans for one request (abc123)
- **Span ID:** Individual operation within a trace (1.2, 2.1, etc.)
- **Parent Span ID:** Links parent-child relationships
- **Timestamps:** Start + end time for latency calculation
- **Tags:** Metadata (user_id, error, retry_count)
- **Logs:** Detailed events within a span

**Tracing Tools:**
- **Jaeger:** Open-source, 100K+ spans/sec, backend visualization
- **Zipkin:** Open-source, simpler than Jaeger
- **AWS X-Ray:** AWS-native tracing
- **Datadog APM:** Commercial, integrated with logs + metrics
- **New Relic:** Commercial APM + monitoring + logs

**Core Guarantees:**
- **Request correlation:** Find any request's lifecycle across all services
- **Latency breakdown:** Which service is slow? (Order Service 50ms, Payment 200ms)
- **Dependency mapping:** Auto-generate service topology
- **Error root cause:** See exactly where request failed and why
- **Sampling:** Trace 100% of errors, sample 1% of successes (cost)

**Real-world Use Case:**
```
User gets slow order response (3 seconds expected, but took 5s)
→ Query tracing tool for order123
→ See: API Gateway 10ms → Order Service 100ms → Payment Service 4500ms ← BOTTLENECK
→ Payment Service logs show: "Timeout connecting to bank gateway"
→ Action: Increase payment service timeout or add circuit breaker
```

---

### Monitoring & Alerting

**Monitoring = Observability + Response:**
1. **Collect** metrics, logs, traces
2. **Alert** when thresholds breached
3. **Incident Response:** PagerDuty page on-call engineer
4. **Root Cause Analysis:** Debug using logs + traces + metrics

**Alert Design (Avoid False Positives):**

| Alert Type | Example | Bad Alert | Good Alert |
|---|---|---|---|
| **Threshold** | CPU > 90% | CPU > 85% for 1s (flaky) | CPU > 90% for 5min average |
| **Rate** | Error rate > 1% | Any single error | Error rate > 1% for 2 min |
| **Anomaly** | Latency 2x normal | p99 > 100ms | p99 > baseline + 2σ |
| **Absence** | Heartbeat missing | Check every hour | No events in 15 min window |

**On-Call Response SLO's:**
- **P1 (Critical):** Page immediately, resolve within 15 min (payment down)
- **P2 (High):** Page, resolve within 1 hour (API latency 2x)
- **P3 (Medium):** Create ticket, resolve within 4 hours (metric anomaly)
- **P4 (Low):** Log issue, resolve within sprint (slow query)

**Alerting Tools:**
- **PagerDuty:** Incident routing, escalation, on-call scheduling
- **Opsgenie:** Similar to PagerDuty, broader integration
- **Prometheus AlertManager:** Open-source; integrates with Grafana
- **Datadog:** Built-in alerting + incident management

**Core Guarantees:**
- **Actionable alerts:** Only page if human action needed (not dashboards)
- **Clear runbooks:** When alert fires, on-call knows how to respond
- **Ownership:** Each alert owned by one team
- **Test regularly:** Monthly alert drills; ensure escalation works

---

## DESIGN PATTERNS

---

###  Bloom Filters
> **Probabilistic data structure for membership testing (does value exist in set?)**

**How it works:**
- K hash functions + bit array of size M.
- Insert X: set bits at positions `hash1(X) % M`, `hash2(X) % M`, ..., `hashK(X) % M`.
- Query X: check if all K bits are set.
  - If all set → "probably in set"
  - If any bit unset → "definitely not in set"

```
Insert: "alice"
Hash1("alice") % 100 = 23  → bit[23] = 1
Hash2("alice") % 100 = 45  → bit[45] = 1
Hash3("alice") % 100 = 78  → bit[78] = 1

Query: "bob"
Hash1("bob") % 100 = 23   → bit[23] = 1 ✓
Hash2("bob") % 100 = 60   → bit[60] = 0 ✗
Result: "bob" definitely NOT in set
```

| ADVANTAGES | DISADVANTAGES |
|---|---|
| **Tiny memory:** Set of 1M items uses only ~100 KB | **False positives:** Can't be 100% sure (tuneable error rate) |
| **O(K) lookup:** Constant time (K hashes) | **No delete:** Hard to remove items (set bits can't be unset safely) |
| **No storing data:** Just probability test | **False positive rate grows** as filter fills up |

**Tuning false positive rate:**
- More hash functions or larger bit array → fewer false positives.
- Typical: 1-2% false positive rate with 10 bits per item.

**Strong use cases:**
1. **Cache miss prevention:** Check if key exists in Cassandra before hitting disk.
   - Query hits Bloom filter → likely eviction check before expensive read.
2. **Malware detection:** Billions of known bad hashes; is URL in blacklist?
3. **Spelling checker:** Is word in dictionary? Bloom filter first, then slow lookup if needed.
4. **Deduplication:** Processed messages? Check Bloom filter (few false positives ok for dupes).

**Real-world:** Google Bigtable uses Bloom filters to optimize disk seeks (Cassandra too).

---

###  Circuit Breaker
> **Prevent cascading failures by fast-failing when downstream service is broken**

```
State Machine:

[CLOSED] ──request─→ Success: 95%+ ✓
  ↓ (10 failures)
[OPEN] ──request─→ Fail immediately (don't call downstream)
  │ Timeout: 30s
  ↓
[HALF_OPEN] ──test request─→
  ├─ Success: Back to [CLOSED]
  └─ Failure: Back to [OPEN]
```

| ADVANTAGES | DISADVANTAGES |
|---|---|
| **Fast fail:** Don't waste time on dead service | **Added complexity:** State machine logic |
| **Saves resources:** No cascading queue buildup | **Fallback logic needed:** What to return when open? |
| **Self-healing:** Retries periodically (HALF_OPEN) | **Metrics tuning:** Right threshold needed |

**Thresholds (typical):**
- Failure Rate: 50% of requests failed → OPEN
- Slow requests: 90th percentile latency > 2s → OPEN
- Volume: Less than 10 req/min → ignore errors (too noisy)

**Strong Example (Microservices):**
```
Order Service → Payment Service (down)
  Request 1: Timeout
  Request 2: Timeout
  Request 3: Timeout
  ...
  Requests queue up (slow)
  Order Service overwhelmed with stuck threads

With Circuit Breaker:
  Request 1-5: Timeout, increment failure count
  Request 6: OPEN → return "Payment service unavailable" instantly
  Request 7-∞: Instant fail (no timeout overhead)
  Requests clear quickly
  Order Service stays healthy
```

**Guarantees:**
- **Prevents overload:** Stops propagation of load to broken service.
- **Faster recovery:** Broken service not hammered; can recover faster.
- **Monitoring:** Circuit state is a metric (alerting).

---

>  [Deep Dive: Design Patterns](#deep-dive-design-patterns)

---



## ⚡ INFRASTRUCTURE

---

###  Blob Storage (S3 / GCS)
> **Examples:** AWS S3, Google Cloud Storage, Azure Blob

| GOOD AT | LIMITATIONS |
|---|---|
| Storing large unstructured files (GB/TB scale) | Low-latency random reads within files |
| Cheap, durable, infinitely scalable | Database-like queries |
| Lifecycle policies (tiering, expiry) | Frequent small writes |
| Pre-signed URLs for secure access | Strong consistency on list operations (eventually consistent in some systems) |

**Real-world use cases:** User image/video uploads · Backups · ML training datasets · Static website hosting · Log archival

>  [Deep Dive: Blob Storage](#deep-dive-blob-storage)

---

###  DNS

| GOOD AT | LIMITATIONS |
|---|---|
| Human-readable → IP address translation | Instant propagation (TTL delays) |
| Global traffic routing (GeoDNS) | Dynamic, per-request routing |
| Failover via health-checked records | Fine-grained load balancing |

**Record types to know:** `A` (IPv4) · `AAAA` (IPv6) · `CNAME` (alias) · `MX` (mail) · `TXT` (verification) · `SRV` (service discovery)

**Real-world use cases:** GeoDNS routing users to nearest region · DNS-based failover · Service discovery in microservices

>  [Deep Dive: DNS](#deep-dive-dns)

---

###  Data Warehouse
> **Examples:** BigQuery, Snowflake, Redshift, ClickHouse

| GOOD AT | LIMITATIONS |
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

>  [Deep Dive: Data Warehouse](#deep-dive-data-warehouse)

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

#  DEEP DIVES

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

---

## Deep Dive: REST API

**HTTP Methods (Semantic Safety):**
```
GET     /users/123        → Safe, idempotent, cacheable
POST    /users            → Not idempotent (creates new each time)
PUT     /users/123        → Idempotent (same result on retry)
DELETE  /users/123        → Idempotent
PATCH   /users/123        → Partial update (not idempotent)
```

**Status codes:**
- `200 OK` — Request succeeded.
- `201 Created` — Resource created (include Location header).
- `204 No Content` — Success with no response body.
- `400 Bad Request` — Invalid parameters (client error).
- `401 Unauthorized` — Auth required.
- `403 Forbidden` — Auth ok but not allowed (authorization).
- `404 Not Found` — Resource doesn't exist.
- `409 Conflict` — Version mismatch, inventory conflict.
- `429 Too Many Requests` — Rate limited.
- `500 Internal Server Error` — Server fault.

**Rate Limiting Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1716921600
```

**Caching:**
- `Cache-Control: max-age=3600` — Cache 1 hour (browser + CDN).
- `ETag: "abc123"` — Content hash; conditional GET if changed.
- `Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT` — Revalidate if newer.
- `Vary: Accept-Encoding` — Cache separately for gzip vs plain.

**Pagination:**
```
GET /posts?page=2&limit=10
GET /posts?offset=20&limit=10
GET /posts?sort=createdAt&cursor=abc123   ← Cursor (best for scroll)
```

**API Versioning (anti-patterns):**
- `/v1/users`, `/v2/users` ← URL versioning (forces client updates).
- `Accept: application/vnd.api+json;version=2` ← Header versioning (cleaner but not widely used).

**Best practice:** Versioning through URL for breaking changes; minor additions backward-compatible.

[↑ Back to top](#-rest-api)

---

## Deep Dive: gRPC

**Protobuf (Protocol Buffers) Definition:**
```protobuf
syntax = "proto3";

service OrderService {
  rpc GetOrder(OrderRequest) returns (OrderResponse);
  rpc StreamOrders(stream Order) returns (stream OrderUpdate);
}

message OrderRequest {
  int32 order_id = 1;
}

message OrderResponse {
  int32 order_id = 1;
  string status = 2;
  repeated LineItem items = 3;
}

message LineItem {
  int32 product_id = 1;
  int32 quantity = 2;
}
```

**gRPC call types:**
1. **Unary:** Client sends 1 request, server returns 1 response (simple RPC).
2. **Server streaming:** Client sends 1, server streams many responses.
3. **Client streaming:** Client streams requests, server returns 1 response (batch processing).
4. **Bidirectional:** Both stream (chat, multiplayer game).

**Streaming Example (stock feed):**
```protobuf
service QuoteService {
  rpc StreamQuotes(stream SymbolRequest) returns (stream Quote);
}
```
Client: `AAPL`, `GOOGL`, `MSFT` (stream).
Server: Quote updates for each symbol as they change (stream back).

**gRPC vs REST Performance:**
```
Protocol Buffers binary (much smaller than JSON)
Example: 100-byte JSON → 30-byte Protobuf

REST POST /orders:
{"user_id": 123, "product_id": 456, "quantity": 2}
→ JSON encoding time + network + decode

gRPC call OrderService.CreateOrder(CreateOrder):
→ Protobuf binary (faster), HTTP/2 (multiplexing)
→ Multiple concurrent calls on single connection

Benchmark: REST ~10ms, gRPC ~1ms (10x faster for internal services).
```

**Load Balancing gRPC:**
- Normal (REST): LB sees many short connections. Trivial to balance.
- gRPC: Long-lived connections. LB must use connection-level hashing or Layer 7 (proxy).

[↑ Back to top](#-grpc)

---

## Deep Dive: GraphQL

**Query vs Mutation vs Subscription:**
```graphql
# Query (read)
query GetUser {
  user(id: "123") {
    name
    posts { title }
  }
}

# Mutation (write)
mutation CreatePost {
  createPost(title: "Hello", content: "World") {
    id
    createdAt
  }
}

# Subscription (real-time)
subscription OnNewPost {
  postCreated {
    id
    title
    author { name }
  }
}
```

**Resolver (backend logic):**
```javascript
const resolvers = {
  Query: {
    user: (parent, { id }) => fetchUserFromDB(id),
  },
  User: {
    posts: (user) => fetchPostsByUserId(user.id),
  },
};
```
When client requests `user { posts { title } }`, resolver chain: `user` then `posts` then `title`.

**N+1 Problem (from poor resolvers):**
```javascript
// BAD: User resolver fetches relat with N separate queries
User: {
  posts: (user) => db.query('SELECT * FROM posts WHERE user_id = ?', user.id),
}

// If client requests 100 users + their posts:
// 1 query for users + 100 queries for posts = 101 queries total 

// GOOD: Batch loader
const postLoader = new DataLoader(async (userIds) => {
  return db.query('SELECT * FROM posts WHERE user_id IN (?)', userIds);
});

User: {
  posts: (user) => postLoader.load(user.id),
}

// Result: 1 query for users + 1 query for all posts = 2 queries ✓
```

**Authentication in GraphQL:**
```javascript
// Middleware on all resolvers
function authenticate(next) {
  return (parent, args, context, info) => {
    if (!context.user) throw new Error('Unauthenticated');
    return next(parent, args, context, info);
  };
}

// Or per-field authorization
const resolvers = {
  User: {
    email: (user, _, context) => {
      if (context.user.id === user.id) return user.email;
      throw new Error('Not authorized');
    },
  },
};
```

[↑ Back to top](#-graphql)

---

## Deep Dive: Real-time Communication

See main section above for architecture and use cases. Key points:

**Choosing between them:**
- **Short polling:** Simplicity > latency. Dashboard refresh every 5 sec.
- **Long polling:** Browser needs push; WebSocket setup complex.
- **WebSocket:** Real-time required (<1s latency).
- **SSE:** One-way server push (notifications, activity feed).
- **WebRTC:** Peer-to-peer media (video, audio, streaming).

**Connection state management (WebSocket):**
```javascript
const ws = new WebSocket('wss://api.example.com/stream');

// Heartbeat (keep-alive)
const heartbeat = setInterval(() => ws.send('ping'), 30000);

// Reconnection with exponential backoff
let reconnectAttempts = 0;
function reconnect() {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
  reconnectAttempts++;
  setTimeout(() => {
    ws = new WebSocket(url);
    ws.onopen = () => { reconnectAttempts = 0; };
  }, delay);
}

ws.onclose = reconnect;
```

[↑ Back to top](#-real-time-communication)

---

## Deep Dive: Concurrency Control

See main section above for Pessimistic vs Optimistic locking patterns and use cases.

**Implementing Optimistic Locking (SQL):**
```sql
-- Table schema
CREATE TABLE inventory (
  product_id INT,
  quantity INT,
  version INT,  -- Increment on every update
  PRIMARY KEY (product_id)
);

-- Update (check version matches)
UPDATE inventory 
SET quantity = quantity - 1, version = version + 1
WHERE product_id = 5 AND version = 10;

-- If 0 rows updated → conflict (version changed)
-- Retry: fetch new version, try again
```

**Implementing Pessimistic Locking (SQL):**
```sql
BEGIN TRANSACTION;
SELECT * FROM inventory WHERE product_id = 5 FOR UPDATE;  -- Exclusive lock
-- ... do computation ...
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 5;
COMMIT;  -- Lock released
```

**Deadlock Example & Prevention:**
```
Transaction A:              Transaction B:
Lock User 1                 Lock User 2
Try Lock User 2 → wait      Try Lock User 1 → wait
                DEADLOCK!

Prevention:
- Always acquire locks in same order (User 1 then User 2).
- Use timeouts (10ms timeout → retry).
- Use optimistic locking instead.
```

[↑ Back to top](#-concurrency-control)

---

## Deep Dive: Design Patterns

See main sections above for Bloom Filters and Circuit Breaker.

**Bloom Filter Tuning:**
- False positive rate = (1 - e^(-K*N/M))^K
- K = number of hash functions.
- N = items inserted.
- M = bit array size.
- Typical: M = 10*N, K = 0.7*M/N → ~1% FP rate.

**Circuit Breaker Implementation (pseudocode):**
```java
enum CircuitState { CLOSED, OPEN, HALF_OPEN };

class CircuitBreaker {
  private CircuitState state = CLOSED;
  private int failureCount = 0;
  private long lastOpenTime = 0;
  
  public void call() {
    if (state == OPEN) {
      if (System.currentTimeMillis() - lastOpenTime > 30000) {
        state = HALF_OPEN;
      } else {
        throw new CircuitBreakerOpenException();
      }
    }
    
    try {
      downstreamService.call();
      onSuccess();
    } catch (Exception e) {
      onFailure();
      throw e;
    }
  }
  
  private void onSuccess() {
    failureCount = 0;
    state = CLOSED;
  }
  
  private void onFailure() {
    failureCount++;
    if (failureCount >= 5) {  // Threshold
      state = OPEN;
      lastOpenTime = System.currentTimeMillis();
    }
  }
}
```

[↑ Back to top](#-design-patterns)

---

## Deep Dive: TCP/UDP

**TCP Three-Way Handshake (Connection Establishment):**
```
1. CLIENT → SYN (seq=100)
2. SERVER ← SYN-ACK (seq=300, ack=101)
3. CLIENT → ACK (seq=101, ack=301)
   Connection established; now send data
```
After handshake, reliable bidirectional communication.

**TCP Flow Control (Sliding Window):**
- Receiver tells sender: "I can accept 64KB"
- Sender keeps track: can't send more than receiver buffer.
- Prevents overwhelming slow receivers.

**UDP Advantages:**
- No setup (fire immediately).
- Multiplexing: one socket handles many clients.
- Lower CPU (no state tracking).
- Real-time tolerance: losing a few packets is ok (game frame, video packet).

**Real-world Applications:**
- **TCP:** Finance (every dollar matters), email, HTTPS, file transfer.
- **UDP:** Live streaming, gaming, DNS, VOIP, gaming lag matters less than latency.

**Congestion Control (TCP):**
- Slow start: exponentially increase send rate.
- Congestion avoidance: linearly increase after hitting limit.
- Fast retransmit: if 3 duplicate ACKs, assume loss; don't wait for timeout.
- CUBIC (modern) vs Reno (traditional): CUBIC better for high-bandwidth links.

[↑ Back to top](#tcpudp)

---

## Deep Dive: HTTP/HTTPS

**TLS 1.3 Handshake (Faster than TLS 1.2):**
```
1. Client Hello (ciphers, key share)
   ↓
2. Server Hello (chosen cipher, certificate, key share)
   ↓
3. [encrypted handshake messages]
   ↓
4. Client sends Finished (encrypted with new keys)
   ↓
5. Both sides: Application Data (encrypted)
```
Total: ~1 RTT (TLS 1.2 was 2 RTT). For HTTPS connections, this matters.

**Certificate Chain:**
```
Root CA (self-signed, embedded in browser)
  ├─ Intermediate CA (signed by Root)
  └─ Server Certificate (signed by Intermediate)
```
To verify: check server cert → validate Intermediate → validate Root in browser trust store.

**HTTP/2 Multiplexing:**
- Single TCP connection, multiple streams (not HTTP 1.1's head-of-line blocking).
- Server push: push resources proactively.
- Binary framing (not text like HTTP 1.1).

**HTTP/3 (QUIC):**
- Uses UDP instead of TCP (faster recovery from packet loss).
- Faster handshake (less round trips).
- Connection ID (survives IP changes; good for mobile).

**Common Pitfalls:**
- Expired certificate: browser blocks ("Your connection is not private").
- Mixed content: HTTPS page loading HTTP resource → warning + blocked.
- Self-signed cert: Trust warnings; use Let's Encrypt.

[↑ Back to top](#httphttps)

---

## Deep Dive: Authentication

**JWT (JSON Web Token) Deep Dive:**
```
Header.Payload.Signature

Header: {"alg": "RS256", "typ": "JWT"}
Payload: {"sub": "user123", "email": "user@ex.com", "iat": 1704000000, "exp": 1704086400}
Signature: RSA_Sign(Header.Payload, private_key)
```

**RS256 (RSA) vs HS256 (HMAC):**
| Feature | RS256 | HS256 |
|---|---|---|
| **Keys** | Public + Private | Single shared secret |
| **Security** | If private leak, only auth server affected | If secret leak, all tokens forged everywhere |
| **Use case** | Distributed systems (services verify via public key) | Monolith (only app server has secret) |
| **Performance** | Slower (RSA crypto) | Faster (HMAC) |

**Token Storage (Security):**
- **localStorage:** Easy, but XSS can steal.
- **httpOnly cookie:** Immune to XSS, but CSRF possible (use SameSite=Strict).
- **Memory:** Lost on page refresh.
- Best: httpOnly cookie + SameSite=Strict + secure flag (HTTPS only).

**Refresh Token Pattern:**
- Access token: 15 minutes, short-lived, in memory or httpOnly cookie.
- Refresh token: 7 days, rotated on use, stored securely.
```
1. User login → return accessToken (15m) + refreshToken (7d)
2. After 15m, accessToken expires
3. Browser sends refreshToken → get new accessToken + refreshToken
4. Old refreshToken invalidated (one-time use)
```

**MFA (Multi-Factor Authentication):**
- Base: password (something you know).
- Add: TOTP (Google Authenticator; time-based), push notifications, security keys (FIDO2).
- Bypass: Backup codes (store safely).

[↑ Back to top](#authentication)

---

## Deep Dive: Authorization

**RBAC (Role-Based Access Control) Hierarchy:**
```
Admin
  ├─ Permissions: create_user, delete_user, view_logs, manage_settings
  └─ Inherits from: Moderator

Moderator
  ├─ Permissions: approve_content, edit_content, ban_user
  └─ Inherits from: User

User
  ├─ Permissions: read_content, post_content, edit_own_profile
  └─ Inherits from: Guest

Guest
  └─ Permissions: read_public_content
```
Benefits: Maintainability (roles, not per-user permissions), scaling.

**ABAC (Attribute-Based Access Control) Example:**
```
Rule: Allow upload if
  AND user.department == "Engineering"
  AND time >= 09:00 AND time <= 17:00
  AND ip_address IN [10.0.0.0/8]
  AND resource.size <= 100MB
```
Result: Fine-grained control; used in healthcare (HIPAA), finance (PCI).

**Resource-Level Authorization:**
```
User alice wants to DELETE /posts/123
1. Check role: alice has "Editor" role? ✓
2. Check resource: resource 123 owner == alice? ✓
3. Check action: Editor can delete? ✓
4. Allow ✓
```

**Testing Authorization:**
```
Test 1: Admin can delete → ✓
Test 2: User CANNOT delete (but admin can) → catch permissions bypass
Test 3: User CAN delete own post → check resource ownership
Test 4: User from different department CANNOT access → check attributes
```

[↑ Back to top](#authorization)

---

## Deep Dive: Change Data Capture (CDC)

**Log-Based CDC (Most Common):**
```
Database transaction log:
  INSERT user='alice'
    ↓ CDC tool (Debezium) tails log
  Query: SELECT * FROM user WHERE id > offset
    ↓
  Kafka topic: operational_db.users
    ↓ Consumers:
    ├── Elasticsearch (full-text search index)
    ├── BigQuery (analytics warehouse)
    ├── Redis (cache invalidation)
    └── Replica DB (read-only copy)
```

**CDC Patterns:**

| Pattern | Use | Pros | Cons |
|---|---|---|---|
| **Log-based** | PostgreSQL, MySQL | Minimal app code changes | Requires log access |
| **Query-based** | Any DB (polling) | Universal | High DB load, lag |
| **Trigger-based** | Custom handling | Precise control | Complex to maintain |

**Exactly-Once Delivery (with Kafka + DB):**
```
Message consumed: order_id=123
Write: INSERT INTO processed_orders WHERE order_id=123, offset=1000
If failure between Kafka offset commit and DB write:
  → Kafka retries
  → DB upsert prevents duplicates (idempotent)
  → Consumer processed order only once
```

**Real-world: E-commerce Order Flow:**
```
1. ORDER service: INSERT INTO orders (user_id, product, amount)
2. CDC captures: {"op": "insert", "table": "orders", "new": {...}}
3. PAYMENT service: consumes, charges credit card
4. CDC captures PAYMENT update
5. FULFILLMENT service: consumes, ships product
6. ANALYTICS service: consumes all, builds dashboards
→ Single source of truth (orders table) feeds all systems
```

[↑ Back to top](#cdc)

---

## Deep Dive: Fault Tolerance & Reliability

**Failure Types & Mitigation:**

| Failure Type | Example | RTO | RPO | Mitigation |
|---|---|---|---|---|
| **Hardware** | Disk fails | Minutes | ~1 min | RAID, replicas |
| **Network** | BGP misconfiguration | Hours | Varies | Multi-region, failover |
| **Software** | OOM crash | Minutes | ~30s | Restarts, circuit breaker |
| **Cascading** | Service A down → B starves → C down | Hours | Hours | Timeouts, bulkheads, fallbacks |

**Redundancy Models:**

| Model | Setup | Failover Time | Cost |
|---|---|---|---|
| **Active-Passive** | Primary in US, standby in EU | 30s–5m | ~2x hardware |
| **Active-Active** | Primary + secondary both answer | 0s (instant) | ~3x hardware, complex conflict resolution |
| **N+1** | N instances + 1 spare | 30s | ~(N+1)/N cost |

**Availability Tiers:**

| Availability | Downtime/Year | Example | Requires |
|---|---|---|---|
| **99.0%** | 87.6 hours | Single region, basic monitoring | 1 server |
| **99.9%** | 8.76 hours | Multi-AZ, auto-failover | 2 servers, monitoring |
| **99.99%** | 52 minutes | Multi-region, active-active, circuit breaker | 4+ servers, complexity |
| **99.999%** | 5 minutes | Netflix-scale: multi-region chaos engineering | Enterprise setup |

**Resilience Patterns:**
- **Timeouts:** Don't wait forever; fail fast after Nth millis.
- **Retries:** Exponential backoff (1s, 2s, 4s, 8s...); max 3 retries.
- **Bulkheads:** Isolate thread pools; payment service can't starve order service.
- **Health checks:** Every 10s pings; remove unhealthy instances.
- **Chaos engineering:** Netflix kills random instances in production to test resilience.

[↑ Back to top](#fault-tolerance)

---

## Deep Dive: Logging

**Structured Logging Best Practices:**
```json
{
  "timestamp": "2026-04-08T10:15:30.123Z",
  "level": "ERROR",
  "service": "payment",
  "trace_id": "abc-123-def",
  "user_id": "user789",
  "endpoint": "/api/checkout",
  "method": "POST",
  "status_code": 500,
  "error": "payment_gateway_timeout",
  "duration_ms": 5000,
  "stack_trace": "...",
  "metadata": {"amount": 99.99, "currency": "USD"}
}
```

**Log Levels in Context:**
```
DEBUG: Entering function X with args [a=1, b=2]        → Use only in dev
INFO: User 123 logged in successfully                   → Operational events
WARN: Cache hit rate dropped to 60% (was 90%)           → Monitor
ERROR: Failed to charge card after 3 retries            → Always log
FATAL: Out of memory; process exiting                   → System critical
```

**Sampling Strategy (Cost Reduction):**
```
Log 100% of: WARN, ERROR, FATAL
Log 1% of: INFO, DEBUG
Result: Catch errors, but don't log every request (99% × 1K req/s = 10 events/s instead of 1K)
```

**Retention Policy (Compliance):**
- GDPR: Right to deletion (30+ days minimum, but can't prove deletion without audit trail).
- SOX/HIPAA: 5–7 years mandatory.
- Strategy: Hot storage (7 days, fast), archive (60 days, cheaper), delete after policy.

[↑ Back to top](#logging)

---

## Deep Dive: Metrics

**Time-Series Database Basics:**
```
Metric: http_request_duration_seconds
Tags: method=POST, endpoint=/api/checkout, status=200
Value: 0.125 (seconds)
Timestamp: 2026-04-08T10:15:30Z

Every 10s, collect from all services → store in Prometheus
Query: avg(http_request_duration_seconds{endpoint="/checkout"}) → get average latency
```

**Cardinality Explosion (Common Mistake):**
```
BAD: Metric http_requests_total with label user_id=USER_ID
→ If 1B users, cardinality = 1B (database collapses)

GOOD: Metric http_requests_total with labels endpoint, method, status (cardinality ~100)
→ Query: count by endpoint; get per-endpoint counts
```

**Sampling Rates (Telemetry):**
```
Trace 100% of errors
Trace 0.1% of successful requests (1 per 1000)
Result: 1000 req/s traffic → ~100 traces/s logged (manageable)
```

**SLI/SLO/SLA Metrics:**
- **SLI** (Indicator): % of requests < 200ms latency (e.g., 99.5%)
- **SLO** (Objective): We commit to 99% availability
- **SLA** (Agreement): If we miss SLO, customer gets credits
- Measurement: (successful_requests / total_requests) × 100

[↑ Back to top](#metrics)

---

## Deep Dive: Distributed Tracing

**Trace Instrumentation (Using Jaeger):**
```python
from jaeger_client import Config

config = Config(
    config={
        'sampler': {'type': 'const', 'param': 1},
        'local_agent': {'reporting_host': 'localhost', 'reporting_port': 6831}
    },
    service_name='order-service'
)
tracer = config.initialize_tracer()

with tracer.start_active_span('process_order') as scope:
    with tracer.start_active_span('validate_payment'):
        # Call payment service; trace auto-propagates
        response = requests.post('http://payment-service/charge')
```

**Trace Propagation (Context Passing):**
```
Request Header:
  X-Trace-ID: abc-123-def
  X-Span-ID: span-1
  X-Parent-Span-ID: span-0

Service B receives header → creates child span with Parent-Span-ID=span-1
→ Entire chain linked in tracing backend
```

**Sampling Strategy:**
- **Head-based:** Sampler decides at request start (probability: 1% of requests).
- **Tail-based:** Sampler decides after request completes (error traces always included).
- Tail-based better (can sample all errors even if <1% of traffic).

**Common Tracing Problems:**
```
1. Span timeout: Span never closed → trace appears broken
   Fix: Use try-finally to ensure span.close()
   
2. Context loss: Service doesn't pass trace header
   Fix: Use middleware to auto-propagate headers
   
3. Cardinality explosion: Every unique user_id = new trace type
   Fix: Sample by status (100% errors, 1% success)
```

[↑ Back to top](#tracing)

---

## Deep Dive: Monitoring & Alerting

**Alert Tuning (Reduce Alert Fatigue):**

| Alert Type | Bad | Good |
|---|---|---|
| **Threshold** | CPU > 85% for 1 sec | CPU > 90% average over 5 min |
| **Rate** | Any error | Error rate > 0.5% for 2 min consecutive |
| **Anomaly** | p99 latency change > 10% | p99 > baseline + 2σ (statistical) |

**Alert Routing & Escalation:**
```
1. Alert fires: payment_service down
2. PagerDuty pages: on-call engineer
3. If no ack after 15 min: escalate to team lead
4. If no ack after 30 min: escalate to manager
5. Incident created: auto-notify Slack, create postmortem

On-call response:
P1: <15 min (system down)
P2: <1 hour (feature broken)
P3: <4 hours (degraded)
P4: <next day (minor issue)
```

**Monitoring Checklist:**
- [ ] Latency: p50, p95, p99 per service
- [ ] Error rate: % errors, error codes breakdown
- [ ] Saturation: CPU %, disk %, memory %, connections
- [ ] Traffic: QPS, throughput, request size distribution
- [ ] Custom: application-specific metrics (order count, payment success rate)

**Incident Response Runbook Example:**
```
ALERT: High error rate on /checkout

1. Check: Error rate dashboard; what's the percentage?
2. Check: Recent deployments; was something released?
3. Check: Database metrics; is DB running?
4. Check: Downstream services; is payment service down?
5. Action: Roll back recent deployment OR scale up servers
6. Verify: Error rate drops
7. Postmortem: Why did it happen? How to prevent?
```

[↑ Back to top](#monitoring)

---

## Deep Dive: Forward & Reverse Proxy

**Forward Proxy (Client-Side):**
```
Client Request: GET http://google.com/search
    ↓
    Client → Forward Proxy (IP: 10.0.0.1)
    ↓
    Forward Proxy → Google (Client IP hidden; Google sees proxy IP)
    ↓
    Response → Forward Proxy → Client
```

**Use Cases:**
- Corporate employee accessing the web (company monitors traffic).
- Anonymity: Hide real IP address.
- Geographic bypass: Proxy in another country.
- Content filtering: Block adult sites, malicious domains.

**Reverse Proxy (Server-Side):**
```
Client Request: GET https://example.com/api/users
    ↓
    Client → Reverse Proxy (public IP)
    ↓
    Reverse Proxy routes to:
    ├── Backend 1 (IP: 10.0.0.10)
    ├── Backend 2 (IP: 10.0.0.11)
    └── Backend 3 (IP: 10.0.0.12)
    ↓
    Backend servers don't expose IPs (hidden)
```

**Reverse Proxy Features:**
- **Load Balancing:** Distribute traffic across backends.
- **SSL Termination:** Decrypt at proxy; talk plain HTTP to backends (backends don't need SSL certs).
- **Caching:** Cache responses; don't hit backends.
- **WAF (Web App Firewall):** Block SQL injection, XSS, DDoS.
- **Rate Limiting:** 100 req/sec per IP.

**Popular Reverse Proxies:**
- NGINX: Fast, lightweight, used by 30% of web (load balancing, caching).
- HAProxy: High-performance, extreme reliability (financial institutions).
- AWS ALB: Managed, auto-scales, integrates with AWS services.
- Envoy: Modern, used in service meshes (Istio), gRPC support.

**Comparison: Forward vs Reverse:**

| Aspect | Forward Proxy | Reverse Proxy |
|---|---|---|
| **Initiator** | Client | Server |
| **Client sees** | Proxy IP | Reverse proxy IP (transparent to client) |
| **Use** | Employee internet access | Load balancing, SSL termination |
| **IP hiding** | Client IP hidden | Backend IP hidden |
| **Examples** | Corporate proxy, VPN | NGINX, HAProxy, AWS ALB |

[↑ Back to top](#proxy)

---

## Deep Dive: Bloom Filters (Detailed Implementation)

**Bloom Filter vs Hash Set Memory Comparison:**

```
Scenario: Store 1M URLs (blacklist)

Hash Set Approach:
  URL length: ~100 bytes × 1M = 100 MB
  HashSet overhead (~25%): +25 MB
  Total: ~125 MB

Bloom Filter Approach:
  Bit array: 10 bits per item × 1M = 10M bits = 1.25 MB
  Hash functions: 7 (small constant)
  False positive rate: ~1%
  Total: ~1.25 MB
```

**Implementation (Python):**
```python
import hashlib

class BloomFilter:
    def __init__(self, size_bits, num_hashes):
        self.size = size_bits
        self.bits = [0] * size_bits
        self.num_hashes = num_hashes
    
    def add(self, item):
        for i in range(self.num_hashes):
            hash_val = int(hashlib.md5(f"{item}{i}".encode()).hexdigest(), 16)
            index = hash_val % self.size
            self.bits[index] = 1
    
    def contains(self, item):
        for i in range(self.num_hashes):
            hash_val = int(hashlib.md5(f"{item}{i}".encode()).hexdigest(), 16)
            index = hash_val % self.size
            if self.bits[index] == 0:
                return False  # Definitely not in set
        return True  # Probably in set (1% false positive)
```

**Cascading Bloom Filters (Scalability):**
```
Level 1 (newest 1M items): Check first
  ├─ If found: return "probably in set"
  ├─ If not: check Level 2
Level 2 (1M–10M items): Check if not in Level 1
  └─ If not found in both: return "definitely not in set"
```
Benefits: Add new filters without rehashing existing data.

**Real-world: Cassandra's Bloom Filter:**
```
Cassandra stores LSM trees (levels). Each level has Bloom filter.
Query: Find user_id=123
1. Check Level 1 Bloom filter → not found
2. Check Level 2 Bloom filter → found (probably)
3. Do disk seek only for Level 2 (skip Levels 1, 3, 4)
Result: 80% of disk seeks avoided (major CPU savings for LinkedIn-scale)
```

[↑ Back to top](#bloomfilters)

---

## Deep Dive: Circuit Breaker (Detailed Patterns)

**State Transitions with Timeouts:**
```
[CLOSED] (normal state)
  ├─ Every request succeeds → stay CLOSED
  ├─ 5 failures in a row → transition to OPEN
  
[OPEN] (fail fast)
  ├─ Duration: 30 seconds
  ├─ After 30s → transition to HALF_OPEN (test recoveryy)
  
[HALF_OPEN] (test recovery)
  ├─ Allow 1 test request
  ├─ If successful → CLOSED (recovered)
  ├─ If fails → OPEN (not ready)
```

**Circuit Breaker with Fallback:**
```python
class CircuitBreakerWithFallback:
    def call(self, request):
        try:
            return self.protected_call(request)
        except CircuitBreakerOpenException:
            # Fallback strategy
            if request.endpoint == "/payment/charge":
                return self.queue_for_later(request)  # Eventual retry
            elif request.endpoint == "/user/profile":
                return self.get_cached_profile()  # Return stale data
            else:
                return {"error": "service_unavailable"}  # Return error
```

**Metrics from Circuit Breaker:**
```
CircuitBreaker_State: OPEN (time series: when transitions occur)
CircuitBreaker_FailureRate: 0.85 (85% failures)
CircuitBreaker_RequestsBlocked: 1200 (how many fast-failed)
CircuitBreaker_Recovery: 1 (how many half-open tests succeeded)

Alert: if CircuitBreaker_State == OPEN for > 5 min → page engineer
```

**Multi-level Circuit Breaker (Complex Systems):**
```
API Gateway Circuit Breaker (overall system)
  ├─ Order Service Circuit Breaker (for payment service integration)
  ├─ Order Service Circuit Breaker (for inventory service integration)
  └─ ...

Single failure (payment down) → Order service CB opens
  But other services (inventory, fulfillment) unaffected
```

[↑ Back to top](#circuitbreaker)

---


