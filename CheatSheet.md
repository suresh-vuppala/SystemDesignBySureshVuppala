# 🚀 System Design Cheatsheet
### Senior Software Engineer Interviews — Google / FAANG

> **TL;DR:** Quick-scan cards up top. Click any anchor link to dive deep. Built for engineers who want signal, not noise.

---

## ⚡ Quick Navigation

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

## 🗄️ STORAGE SYSTEMS

---

### SQL (Relational DB) {#sql}
> **The OG. ACID guarantees + complex queries. Vertical scaling only. — PostgreSQL, MySQL, Cloud Spanner**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **ACID transactions:** All-or-nothing; safe for money | **Write bottleneck:** Single leader (~3K writes/sec on Postgres) |
| **Complex joins:** Denormalization not needed | **Reshard nightmare:** Adding shards = painful migration |
| **Strong consistency:** Reads always see latest write | **Rigid schema:** Schema change on 100GB table = table lock 😬 |
| **Foreign key constraints:** DB enforces data integrity | **Not built for massive unstructured data** |

**The 4 ACID Promises:**
- **A**tomicity → All or nothing. No half-baked writes.
- **C**onsistency → Constraints always hold. Can't insert a negative balance.
- **I**solation → Concurrent transactions don't see each other's dirty work (MVCC magic).
- **D**urability → Committed data survives crashes. WAL (Write-Ahead Log) replays on restart.

**When to reach for SQL:**
- Financial systems (banking, payments, stocks)
- E-commerce (orders, inventory, transactions)
- Booking systems (double-booking = disaster)
- Anything needing strong consistency + complex queries

**Scaling SQL:**
- **Read replicas** → Followers serve reads; leader handles writes
- **Connection pooling** → PgBouncer/ProxySQL — DB connections are expensive, reuse them
- **Sharding by shard key** → Trade complex queries for horizontal scale
- **Multi-leader (CockroachDB)** → Multiple regions with ACID — but consensus = higher latency

**Classic Example — E-commerce order that can't go wrong:**
```sql
BEGIN;
SELECT * FROM inventory WHERE product_id=5 FOR UPDATE;  -- Lock the row
-- quantity = 10, price = $50
UPDATE inventory SET quantity=9 WHERE product_id=5;
INSERT INTO orders (user_id, product_id, price) VALUES (123, 5, 50);
COMMIT;
-- Either BOTH succeed, or NEITHER does. Zero partial state.
```

[→ Deep Dive: SQL](#deep-dive-sql)

---

### NoSQL {#nosql}
> **Horizontal scale, flexible schema, eventual consistency. — DynamoDB, Cassandra, MongoDB, HBase**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Horizontal scaling:** Add nodes = add capacity (10x better than SQL) | **No complex joins:** Embed or make multiple queries |
| **No schema migration:** Add a field anytime, anywhere | **Eventual consistency:** Stale reads are possible |
| **High write throughput:** Multi-master replication | **No multi-doc ACID:** Single doc is atomic, not multi-doc |
| **Flexible:** Store anything; schema enforcement optional | **Ad-hoc queries hard:** Must model data for your access pattern upfront |

**The NoSQL Zoo — pick the right animal:**

| Type | Structure | Use Case | Examples |
|---|---|---|---|
| **Key-Value** | Flat: key → value | Session store, cache | DynamoDB, Redis |
| **Document** | JSON-like with nesting | User profiles, catalogs | MongoDB, Firestore |
| **Wide-Column** | Sparse: columns vary per row | Time-series, analytics | Cassandra, HBase |
| **Graph** | Nodes + edges | Social networks, fraud detection | Neo4j, Neptune |

**Consistency tuning (Cassandra):**
```
QUORUM write (W=2/3) + QUORUM read (R=2/3) → Strong consistency (W+R > N), but slower
ONE write + ONE read → Blazing fast, but replicas may diverge
```

**When to reach for NoSQL:**
- Time-series data, IoT, metrics
- User sessions (fast reads, writes don't need consistent view)
- Social graphs (likes, followers, activity feeds)
- Scale to billions of records

**Example — DynamoDB session store that auto-cleans itself:**
```
PUT /sessions/user123
{
  "user_id": "user123",     -- Partition key
  "session_id": "sess456",  -- Sort key
  "last_activity": 1704003600,
  "ttl": 1704086400         -- Auto-delete after 1 week. Zero cleanup code needed.
}
```

[→ Deep Dive: NoSQL](#deep-dive-nosql)

---

### NewSQL {#newsql}
> **ACID at global scale. The best of both worlds — at a price. — Google Spanner, CockroachDB, TiDB**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **ACID globally:** Multi-region transactions with consistency | **Consensus latency:** 5–10ms single-region, 100ms+ multi-region |
| **SQL interface:** Familiar ANSI SQL, no re-training | **Cost premium:** Spanner = 10x more expensive than Postgres |
| **Horizontal scalability:** Writes scale across regions | **Overkill for local:** Single-region adds zero benefit |
| **Strong consistency:** No eventual consistency surprises | **Ops complexity:** Distributed systems expertise required |

**The secret sauce:** TrueTime (Spanner uses atomic clocks + GPS for global timestamp ordering. No NTP jitter. Seriously.)

**When to reach for NewSQL:**
- Global financial transactions (insurance claims, settlements across regions)
- Multi-region inventory (buy in US, charge in EU, ship from APAC — all atomic)
- Ad bidding (multiple regions competing on same impression)

> **Hot take:** Most apps don't need this. Sagas + Eventual Consistency is usually enough. Use CockroachDB (cheaper + Postgres-compatible) if you genuinely need NewSQL.

[→ Deep Dive: NewSQL](#deep-dive-newsql)

---

### Time-Series DB {#timeseries}
> **Optimized for time-stamped data at massive ingest rates. — InfluxDB, Prometheus, TimescaleDB, Druid**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **High ingest:** Millions of events/sec (write-optimized) | **Limited query flexibility:** Built for specific patterns |
| **10:1 compression:** Columnar + similar values compress beautifully | **Not for mutable data:** Updates/deletes are slow |
| **Auto-retention:** TTL-based auto-delete (no cleanup scripts!) | **General-purpose queries:** Use SQL DB for those |
| **Range queries are lightning-fast:** Ordered by time = direct seek | **Cross-metric joins:** Not a thing |

**How it stores data (partition by time = blazing range queries):**
```
IoT sensors → emit CPU/memory/disk every 10s
→ InfluxDB stores in time-ordered partitions
→ "Give me CPU for server X from 10am–11am"
→ Skip Feb/Mar partitions → scan only the Jan partition → done
```

**Downsampling = smart storage tiering:**
```
Raw (1s resolution):    Keep 7 days   → recent accuracy
Downsampled (1min):     Keep 30 days  → good enough for trends
Downsampled (1hr):      Keep 1 year   → historical overview
```

**When to reach for Time-Series DB:**
- Metrics & monitoring (Prometheus scraping services)
- APM (response times, error rates)
- IoT sensors (temperature, pressure, location)
- Stock prices, OHLCV candles

[→ Deep Dive: Time-Series DB](#deep-dive-time-series-db)

---

### Search Engine (Elasticsearch / Solr) {#search}
> **Full-text search at scale. NOT a primary data store. — Elasticsearch, OpenSearch, Solr**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Full-text search:** Finds "running" in docs (vs exact match) | **Not ACID:** No transactions; conflict resolution is on you |
| **Fuzzy/typo tolerance:** "elastcsearch" still finds the right docs | **Eventual indexing:** New docs aren't immediately searchable |
| **Faceting/filtering:** Drill down by category, price, rating | **Not source of truth:** Reindex from primary DB when things go wrong |
| **Ranked results:** BM25 returns most relevant first | **Mapping explosion:** Too many unique fields = cluster pain |

**How it works under the hood:**
```
Text → Tokenize → Lowercase → Stem → Remove stop words
→ Build inverted index: "shoe" → [doc1, doc5, doc9]
→ Query time: Look up terms → intersect doc lists → rank by relevance
```

**3 pitfalls that bite everyone:**
1. **Mapping explosion** → Every new field bloats mappings. Use `dynamic: false`.
2. **Deep pagination** → `from: 10000 size: 100` = scanning 10,100 docs. Use `search_after`.
3. **Hot shards** → One shard gets 90% of traffic. Fix your distribution key.

**When to reach for Search Engine:**
- Product search on e-commerce
- Log aggregation (ELK stack)
- Document/article search, autocomplete
- **NOT as primary DB** — data can be lost; needs reindex from source of truth

**Example:**
```
Query: "blue shoes under $100"
→ Find "blue" AND "shoes" → Filter price < 100 → Rank by TF-IDF
→ Return [shoe1 (99% match), shoe2 (85% match), ...]
```

[→ Deep Dive: Search Engine](#deep-dive-search-engine)

---

## 🌐 FUNDAMENTALS & NETWORKING

---

### TCP/UDP {#tcpudp}
> **Transport layer: TCP (reliable, ordered) vs UDP (fast, fire-and-forget)**

| **TCP** | **UDP** |
|---|---|
| **Connection-oriented:** Handshake first | **Connectionless:** Send immediately |
| **Ordered delivery:** Packets arrive in sequence | **Unordered:** Packets may arrive scrambled |
| **Guaranteed delivery:** Retransmits lost packets | **Best-effort:** Lost packets = gone forever |
| **Flow control:** Won't overwhelm receiver | **No flow control:** Sender sets pace |
| **Slower** (ack overhead) | **Faster** (minimal overhead) |

**The TCP Handshake (memorize this):**
```
Client                    Server
  │── SYN (seq=100) ──────►│
  │◄── SYN-ACK (seq=300) ──│
  │── ACK (ack=301) ────────►│
  └───────── Connected! ─────┘
```

**The decision framework:**
- **Use TCP:** Banking, email, HTTPS, file transfer — when every byte matters
- **Use UDP:** Live video/audio, gaming, DNS, IoT sensors, VoIP — when speed > reliability

**Port cheat sheet:**
- TCP: 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 5432 (Postgres)
- UDP: 53 (DNS), 123 (NTP), 161 (SNMP)

[→ Deep Dive: TCP/UDP](#deep-dive-tcpudp)

---

### HTTP/HTTPS {#httphttps}
> **Application layer: HTTP (plaintext) vs HTTPS (TLS-encrypted)**

| **HTTP** | **HTTPS** |
|---|---|
| Port 80 | Port 443 |
| Plaintext — anyone on the network can read it | TLS/SSL encrypted |
| No server identity verification | Certificate-based — server proves who it is |
| Data can be modified in transit | Checksums prevent tampering |

**TLS 1.3 in 4 lines:**
```
1. Client says: "Here are my cipher choices + key share"
2. Server says: "Here's my cert + key share" (1 RTT — faster than TLS 1.2's 2 RTT)
3. Both derive session keys from key shares
4. Encrypted application data flows
```

**HTTP Methods — quick mental model:**
- `GET` → Read (safe, idempotent, cacheable)
- `POST` → Create (NOT idempotent — calling twice creates two things)
- `PUT` → Replace (idempotent — same result every time)
- `PATCH` → Partial update
- `DELETE` → Remove (idempotent)

**Status codes you WILL be asked about:**
- `200` OK · `201` Created · `204` No Content
- `301` Moved Permanently · `304` Not Modified
- `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `429` Rate Limited
- `500` Internal Error · `502` Bad Gateway · `503` Unavailable · `504` Gateway Timeout

**Rule:** HTTP → localhost/testing only. **HTTPS everywhere in production.** Full stop.

[→ Deep Dive: HTTP/HTTPS](#deep-dive-httphttps)

---

## 🔐 SECURITY

---

### Authentication {#authentication}
> **"Who are you?" — Verifying identity**

| Method | How | Best For | Security |
|---|---|---|---|
| **Basic Auth** | `Base64(user:pass)` in header | Internal APIs | ⚠️ Low (HTTPS mandatory) |
| **API Key** | `X-API-Key: abc123` | Service-to-service | ⚠️ Medium (needs rotation) |
| **Session Cookie** | Server creates session, browser sends cookie | Web apps | ✅ Medium (add CSRF protection) |
| **JWT** | `Bearer eyJh...` | Stateless APIs, microservices | ✅✅ High (use RS256) |
| **OAuth 2.0** | "Sign in with Google" | Third-party login | ✅✅ High |
| **SAML** | XML-based enterprise auth | Corporate SSO | ✅✅ High |

**JWT decoded — it's just 3 base64 blobs:**
```
Header.Payload.Signature

Header:  {"alg": "RS256", "typ": "JWT"}
Payload: {"sub": "user123", "exp": 1704086400, "iat": 1704000000}
Sig:     RSA_Sign(Header.Payload, private_key)
```

**RS256 vs HS256 — this matters:**
- **HS256:** Single shared secret. If it leaks → every token ever issued is forgeable.
- **RS256:** Private key signs (stays on auth server). Public key verifies (can be shared anywhere). **Use this for microservices.**

**The refresh token dance:**
```
Login → access_token (15 min) + refresh_token (7 days)
After 15 min → send refresh_token → get new pair
Old refresh_token is invalidated (one-time use)
```

**Security golden rules:**
- Store JWT in **httpOnly cookie** (not localStorage — XSS steals it instantly)
- Always HTTPS (JWT in plaintext = game over)
- Short-lived access tokens + long-lived refresh tokens
- Server-side token blacklist on logout

[→ Deep Dive: Authentication](#deep-dive-authentication)

---

### Authorization {#authorization}
> **"What can you do?" — Access control after identity is confirmed**

| Model | How | Complexity | Use Case |
|---|---|---|---|
| **RBAC** | Users → Roles → Permissions | Low | Most systems |
| **ABAC** | Rules based on attributes (role, time, IP, resource) | High | Healthcare, finance |
| **ACL** | Per-resource list of who can do what | Medium | File systems, S3 |
| **Policy-Based** | JSON policies define rules (AWS IAM) | High | Cloud platforms |

**RBAC hierarchy (inherit downward):**
```
Admin > Moderator > Editor > User > Guest
```

**ABAC example (granular as hell):**
```
Allow if:
  user.department == "finance"
  AND resource.type == "payroll"
  AND 09:00 <= time <= 17:00
  AND ip IN [10.0.0.0/8]
→ Grant access (else deny)
```

**5 rules that save you from auth bugs:**
1. **Deny by default** — permissions explicitly granted, never implicit
2. **Least privilege** — users only get the minimum they need
3. **Separation of duties** — no one person approves AND executes a payment
4. **Audit everything** — log who accessed what (GDPR, HIPAA, SOX)
5. **Test blocked access too** — not just that admins CAN, but that users CANNOT

[→ Deep Dive: Authorization](#deep-dive-authorization)

---

## 🔄 DATA PIPELINES

---

### Change Data Capture (CDC) {#cdc}
> **Stream every DB change to downstream systems in real-time**

**The mental model:**
```
DB Transaction Log
  ↓ (CDC tool tails it continuously)
Kafka Topic
  ↓ (fan-out to consumers)
  ├── Elasticsearch  → search index stays fresh
  ├── BigQuery       → analytics warehouse synced
  ├── Redis          → cache invalidated
  └── Replica DB     → read replica stays in sync
```

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Single source of truth:** DB is always authoritative | **Eventual consistency:** Consumers lag behind (ms to seconds) |
| **No app code changes:** DB log does the heavy lifting | **Schema evolution:** Breaking changes need careful handling |
| **Multi-consumer:** Each consumer processes independently | **Tooling required:** Debezium, AWS DMS, Fivetran, etc. |

**Top CDC tools:**

| Tool | Best For |
|---|---|
| **Debezium** | Open-source, on-prem, any major DB → Kafka |
| **AWS DMS** | AWS-native, serverless, managed |
| **Fivetran** | Zero-code, 200+ sources, commercial |

**Real-world example:**
```
1. Order Service: UPDATE inventory SET qty = qty - 1
2. CDC captures: {"op": "update", "before": {"qty": 10}, "after": {"qty": 9}}
3. Consumers react:
   → Dashboard shows "Low Stock" warning
   → Analytics pipeline logs to BigQuery
   → Redis cache invalidated (next read fetches fresh)
   → Replica DB synced
```

**Real-world users:** LinkedIn (100+ Kafka topics via CDC), Shopify (real-time inventory), Uber (rider/driver consistency).

[→ Deep Dive: CDC](#deep-dive-cdc)

---

### Fault Tolerance & Reliability {#fault-tolerance}
> **Building systems where faults don't become failures**

**Fault ≠ Failure:**
- **Fault** = component breaks (disk dies, network drops, bug triggers)
- **Failure** = users can't do their thing (500 errors, timeouts, data loss)
- **Goal** = tolerate faults silently, without system-wide failure

**Availability math (memorize this):**
```
99.0%   → 87.6 hours downtime/year   (hobby project)
99.9%   → 8.76 hours downtime/year   (enterprise standard)
99.99%  → 52 minutes downtime/year   (high-availability)
99.999% → 5 minutes downtime/year    (Google/AWS-grade — very costly)
```

**The 5 resilience patterns:**

**1. Timeouts** — Don't wait forever.
```
Call Payment API with 5s timeout → if exceeded, fail fast
```

**2. Retries with Exponential Backoff** — Transient failures heal themselves.
```
Attempt 1: 0s → 1s → 2s → 4s → 8s → give up (max 3 retries)
```

**3. Circuit Breaker** — Stop hammering a broken service.
```
[CLOSED] → (5 failures) → [OPEN: fail immediately for 30s]
→ [HALF_OPEN: test 1 request] → success = CLOSED, failure = OPEN
```

**4. Bulkheads** — Isolate thread pools so one bad service doesn't starve others.
```
Pool A: max 10 threads for Service A
Pool B: max 10 threads for Service B
Service A hangs → only its 10 threads blocked → Service B unaffected
```

**5. Health Checks:**
- **Liveness** → Is it alive? (`/health` responds)
- **Readiness** → Can it serve traffic? (DB connected, dependencies ok)

**The cardinal rule:** No SPOFs. Always run at least 2 of everything (2 DBs, 2 LBs, 2 regions).

[→ Deep Dive: Fault Tolerance](#deep-dive-fault-tolerance)

---

## 🔌 APIs & COMMUNICATION

---

### REST API {#rest}
> **Stateless, HTTP-native, universally understood. The default choice.**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Universal:** Works everywhere — browser, mobile, IoT | **Over-fetching:** Get all fields even if you need 3 |
| **HTTP caching:** CDN, browser caching built-in | **Under-fetching:** Need multiple requests for related data |
| **Simple semantics:** Everyone knows GET/POST/PUT/DELETE | **Versioning tax:** `/v1/`, `/v2/` churn as APIs evolve |
| **Stateless:** Easy to load-balance horizontally | **N+1 queries:** Often requires client-side aggregation |

**Idempotency cheat sheet:**
```
GET    → Always safe and idempotent (read-only, retry freely)
PUT    → Idempotent (same result every time — replaces whole resource)
DELETE → Idempotent (deleting twice = same state)
POST   → NOT idempotent (creates a new resource each call)
PATCH  → NOT idempotent (partial update, state-dependent)
```

**Pagination patterns:**
```
?page=2&limit=10           → simple, but slow at high offsets
?offset=20&limit=10        → same problem
?cursor=abc123&limit=10    → cursor-based (best for infinite scroll, fast at any depth)
```

**Best for:** Public APIs, mobile/web backends, microservice communication, diverse client needs.

[→ Deep Dive: REST](#deep-dive-rest-api)

---

### gRPC {#grpc}
> **High-performance RPC over HTTP/2 with binary serialization. 10x faster than REST.**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Binary protocol:** Protobuf >> JSON (3-5x smaller) | **Browser hostile:** HTTP/2 binary, can't call from browser directly |
| **Strong typing:** `.proto` file = contract. Caught at compile time. | **Debugging harder:** No `curl` — need `grpcurl` |
| **Bidirectional streaming:** Both sides stream simultaneously | **Smaller ecosystem** than REST |
| **HTTP/2 multiplexing:** Many calls over one connection | **Overkill for simple CRUD** |

**4 call types:**
```
1. Unary:             1 request → 1 response        (like REST)
2. Server streaming:  1 request → N responses       (stock feed)
3. Client streaming:  N requests → 1 response       (batch upload)
4. Bidirectional:     N requests ↔ N responses      (multiplayer game, chat)
```

**Best for:** Internal microservice-to-microservice calls, real-time bidirectional streams, performance-critical paths (10K+ RPS).

[→ Deep Dive: gRPC](#deep-dive-grpc)

---

### GraphQL {#graphql}
> **Client asks for exactly what it needs. No more, no less.**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **No over/under-fetching:** Client shapes the response | **Caching is hard:** Every query is unique |
| **Single endpoint:** No versioning hell | **N+1 queries:** Naive resolvers = DB on fire |
| **Strongly typed schema:** Auto-docs, playground, validation | **Query complexity attacks:** Nested queries can DoS your backend |
| **Developer experience:** Introspection is magic | **Auth per-field:** Complex to implement correctly |

**The N+1 problem (and the fix):**
```javascript
// BAD: 1 user query + 100 post queries = 101 DB hits
User: { posts: (user) => db.query('SELECT * FROM posts WHERE user_id = ?', user.id) }

// GOOD: DataLoader batches them into 2 total DB hits
const postLoader = new DataLoader(userIds =>
  db.query('SELECT * FROM posts WHERE user_id IN (?)', userIds)
);
User: { posts: (user) => postLoader.load(user.id) }
```

**Best for:** Complex client needs where different clients want different data shapes (mobile vs web vs partner APIs).

[→ Deep Dive: GraphQL](#deep-dive-graphql)

---

### Real-time Communication {#realtime}
> **Choosing the right "push" technology**

**Quick decision matrix:**

| Tech | Direction | Latency | Complexity | Use When |
|---|---|---|---|---|
| **Short Polling** | Client pulls | ~5-30s | Very low | Simple dashboards |
| **Long Polling** | Client pulls (held) | ~1-2s | Low | Legacy browser support |
| **WebSocket** | Bidirectional | <100ms | Medium | Chat, live feeds, collaboration |
| **SSE** | Server → Client only | <100ms | Low | Notifications, progress bars |
| **WebRTC** | Peer-to-peer | <50ms | Very high | Video/audio calls |

**WebSocket — the workhorse:**
```javascript
const ws = new WebSocket('wss://api.broker.com/trades');
ws.onmessage = (e) => updateChart(JSON.parse(e.data).price);

// Always implement reconnection with backoff:
ws.onclose = () => setTimeout(reconnect, Math.min(1000 * 2**attempts, 30000));
```

**SSE — simpler than you think:**
```javascript
const es = new EventSource('/api/feed/events');
es.onmessage = (e) => addToFeed(JSON.parse(e.data));
// Browser auto-reconnects. Free. No code needed.
```

**WebRTC secret:** The server only handles the initial handshake (~10KB). After that, media is peer-to-peer. Zoom's bandwidth bill isn't what you think.

[→ Deep Dive: Real-time](#deep-dive-realtime)

---

## ⚡ CACHING

---

### Caching Strategies {#caching}
> **The difference between 10ms and 1ms response times**

| Strategy | Pattern | Use When |
|---|---|---|
| **Cache-Aside** | App checks cache → miss → load DB → populate cache | Read-heavy, app controls logic |
| **Write-Through** | Write to cache → cache writes to DB synchronously | Cache + DB always in sync, slow writes ok |
| **Write-Behind** | Write to cache → DB updated async later | High write throughput, eventual DB sync ok |
| **Read-Through** | Cache fetches from DB transparently on miss | Cache acts as the data layer |

**The #1 cache gotcha — Thundering Herd:**
```
Cache entry expires at 12:00:00
1000 requests hit at 12:00:01 → ALL miss → ALL hit DB simultaneously
DB falls over

Fix: Probabilistic early expiration OR mutex on cache miss OR background refresh
```

**Cache invalidation (the hardest problem in CS — for real):**
- **TTL** → Simple, eventual consistency after expiry
- **Event-driven** → DB change triggers cache delete (via CDC or app logic)
- **Version key** → Embed version in key; new version = automatic miss

[→ Deep Dive: Caching](#deep-dive-caching)

---

### Redis {#redis}
> **In-memory Swiss Army knife: cache, message broker, data structure server. 100K–1M ops/sec.**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Sub-ms latency:** 100x faster than a DB read | **RAM-bound:** Memory is expensive |
| **Rich data structures:** Strings, Lists, Sets, ZSets, Hashes, Streams, HLL | **Not a primary DB:** Durability trade-offs |
| **Atomic operations:** INCR, ZADD are thread-safe natively | **Single-threaded core:** One bottleneck core |
| **Pub/Sub + Streams:** Event broadcasting built-in | **Data loss risk** without AOF or RDB configured |

**Data structures mapped to real problems:**

| Structure | Command | Real Use Case |
|---|---|---|
| **String** | `SET session:abc token123 EX 3600` | Session tokens, counters |
| **List** | `LPUSH queue:emails msg1` | Job queues, activity feeds |
| **Set** | `SADD followers:user1 user2` | Unique visitors, followers, dedup |
| **Sorted Set** | `ZADD leaderboard 1500 player1` | Leaderboards, priority queues |
| **Hash** | `HSET user:1 name Alice age 30` | User profiles, config maps |
| **Stream** | `XADD events * type login` | Event log, audit trail |
| **HyperLogLog** | `PFADD uniques ip1 ip2 ip3` | Approx unique count (0.81% error, ~12KB) |
| **Bitmap** | `SETBIT dau:2024-01-15 12345 1` | Daily active users, feature flags |

**Pub/Sub vs Streams — choose wisely:**

| Feature | Pub/Sub | Streams |
|---|---|---|
| **Persistence** | ❌ Lost if no subscribers | ✅ Survives restarts |
| **Replay** | ❌ | ✅ From any offset |
| **Consumer groups** | ❌ | ✅ With offset tracking |
| **Exactly-once** | ❌ | ✅ With XACK |
| **Best for** | Live notifications, chat | Event log, order processing |

**When NOT to use Redis:**
- As primary data store (use a real DB)
- Dataset larger than available RAM
- Ad-hoc complex queries (use a DB)

[→ Deep Dive: Redis](#deep-dive-redis)

---

### CDN {#cdn}
> **Bring your content to users, not users to your content. — Cloudflare, CloudFront, Fastly, Akamai**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Global low-latency:** Serve from 100s of PoPs worldwide | **Dynamic, personalized content** (limited edge compute helps) |
| **DDoS protection:** Absorbs attacks at the edge | **Cache invalidation complexity** at high frequency |
| **Origin offload:** 95%+ of traffic served from cache | **Cost** at very high invalidation frequency |
| **TLS termination at edge:** Faster handshakes globally | |

**How it works:**
```
User in Mumbai → DNS → Nearest CDN PoP (Mumbai)
→ Cache hit? Return immediately (<10ms)
→ Cache miss? Fetch from origin (Oregon) → cache → return
→ Next user in Mumbai: instant cache hit
```

**Real-world uses:** Image/video delivery, JS/CSS bundles, static sites, software downloads, HLS video streaming segments.

[→ Deep Dive: CDN](#deep-dive-cdn)

---

## 📨 MESSAGING

---

### Message Queue {#messagequeues}
> **Decouple producers from consumers. — RabbitMQ, AWS SQS, Azure Service Bus**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Decoupling:** Producer doesn't know/care about consumers | **No replay:** Messages deleted after consumption |
| **Work distribution:** Fan-out tasks across workers | **High throughput streaming:** Not designed for millions/sec |
| **Retry + DLQ:** Failed messages go to Dead Letter Queue | **Fan-out to many:** Not native (use Pub/Sub for that) |
| **At-least-once delivery guaranteed** | **No long-term retention** |

**Real-world uses:** Order processing, email/SMS sending, background jobs, image resize pipelines, notification dispatch.

[→ Deep Dive: Message Queue](#deep-dive-message-queue)

---

### Apache Kafka {#kafka}
> **The distributed commit log. Event streaming at insane scale. LinkedIn: 4+ trillion events/day.**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Extreme throughput:** 1M+ events/sec per cluster | **Operational overhead:** Needs cluster management |
| **Durable + replayable:** Events on disk, rewind to any point in time | **Overkill for low volume:** Heavy for simple use cases |
| **Fan-out:** Multiple consumer groups read independently | **Ordering per partition only** (not across partitions) |
| **Event sourcing:** Rebuild any state from the log | **At-least-once by default** (idempotent consumers needed) |

**The core mental model:**
```
Topic "orders"
├─ Partition 0 → Consumer Group A: Consumer 1
├─ Partition 1 → Consumer Group A: Consumer 2
└─ Partition 2 → Consumer Group A: Consumer 3
                ↕
Consumer Group B reads ALL partitions independently (different offset)
```

**Durability config (production must-have):**
```
acks=all + min.insync.replicas=2 → Zero message loss
+ enable.idempotence=true       → Exactly-once producer
```

**When to use Kafka vs alternatives:**

| Use Case | Kafka | RabbitMQ/SQS | Pub/Sub |
|---|---|---|---|
| High-volume (>100K/sec) | ✅ | ❌ | ~ |
| Replay / rewind | ✅ | ❌ | ~ |
| Fan-out many consumers | ✅ | ✅ | ✅ |
| Simple work queue | ~ | ✅ | ❌ |
| Operational simplicity | ❌ | ✅ | ✅ |

[→ Deep Dive: Kafka](#deep-dive-kafka)

---

### Pub/Sub {#pubsub}
> **Fan-out events to many subscribers simultaneously. — Google Cloud Pub/Sub, AWS SNS**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Fan-out:** One publish → all subscribers get a copy | **No guaranteed ordering** (by default) |
| **Fully managed:** No cluster ops | **No replay:** Use Kafka for that |
| **Event-driven triggers:** Fire and forget | **Complex routing:** Limited vs Kafka |

**The classic SNS + SQS fan-out pattern:**
```
SNS Topic "order-created"
  ├── SQS Queue → Email Service (own retry/DLQ)
  ├── SQS Queue → Analytics Service
  └── SQS Queue → Audit Service
```

**Real-world uses:** Mobile push notification fan-out, triggering downstream services, cross-region event propagation, webhook dispatch.

[→ Deep Dive: Pub/Sub](#deep-dive-pubsub)

---

## 🖥️ COMPUTE

---

### Microservices {#microservices}

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Independent deploy & scale** per service | **Distributed complexity:** Debugging across services is painful |
| **Team autonomy:** Own service, own DB, own deploy pipeline | **Network latency:** Every call is a network hop |
| **Technology diversity:** Best tool for each job | **Data consistency:** Cross-service transactions are hard |
| **Fault isolation:** One service down ≠ everything down | **Tracing:** Need correlation IDs, distributed tracing |

**Golden rule:** Each service owns its own DB. No shared DB between services. Ever.

**Real-world:** Netflix (1000s of services), Uber (trip, driver, payment), Amazon (order, inventory, fulfillment).

[→ Deep Dive: Microservices](#deep-dive-microservices)

---

### Serverless {#serverless}
> **AWS Lambda, Google Cloud Functions, Cloudflare Workers**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Zero infra management:** Deploy code, not servers | **Cold start latency:** 100ms–5s on first invocation |
| **Auto-scale to zero:** Pay only for what you use | **Not for long-running tasks:** Lambda = max 15 min |
| **Event-driven:** Natural fit for async workloads | **No GPU / high-memory workloads** |

**Real-world uses:** Image processing on upload, webhook handlers, scheduled jobs, low-traffic API backends, auth callbacks.

[→ Deep Dive: Serverless](#deep-dive-serverless)

---

### Service Mesh {#servicemesh}
> **Istio, Linkerd, Consul Connect — the infrastructure layer for microservice networking**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **mTLS between all services:** Zero-trust networking | **Latency overhead:** Sidecar proxy adds ~1ms per hop |
| **Observability:** Auto-traces, metrics per call | **Steep learning curve:** Complex to operate |
| **Traffic management:** Canary, retries, circuit breaking via YAML | **Small-scale systems:** Total overkill |

**Sidecar pattern:** Envoy proxy runs alongside every service pod, intercepts all traffic. The service has no idea — it just sees plain HTTP.

[→ Deep Dive: Service Mesh](#deep-dive-servicemesh)

---

## 🏗️ INFRASTRUCTURE

---

### Load Balancer {#loadbalancer}
> **L4 (TCP) or L7 (HTTP) — AWS ALB/NLB, NGINX, HAProxy**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Traffic distribution:** Round-robin, least-connections, IP hash | **State complexity:** Sticky sessions fight stateless design |
| **Health checks + failover:** Auto-removes unhealthy instances | **SPOF if not HA:** Must run 2+ LBs |
| **SSL termination:** Offload TLS from backend servers | **Added latency:** Extra network hop |

**L4 vs L7:**
- **L4:** Routes by IP + port. Fast. No content inspection. For databases, game servers.
- **L7:** Routes by URL, headers, cookies. Smarter. For web apps.

**Sticky sessions considered harmful:** Use external session store (Redis) instead. Stickiness creates hot spots and breaks when instances die.

[→ Deep Dive: Load Balancer](#deep-dive-loadbalancer)

---

### API Gateway {#apigateway}
> **AWS API Gateway, Kong, Apigee, NGINX**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **Single entry point:** One door for all external traffic | **Added latency:** Extra hop for every request |
| **Auth, rate limiting, SSL in one place** | **Bottleneck:** Must scale with traffic |
| **Route to microservices:** Path-based routing | **Business logic doesn't belong here** |

**BFF (Backend for Frontend) pattern:**
```
Mobile API Gateway → lighter, fewer fields
Web API Gateway → richer, more data
Partner API Gateway → different auth, rate limits
```

[→ Deep Dive: API Gateway](#deep-dive-apigateway)

---

### Forward & Reverse Proxy {#proxy}
> **Two different animals that people constantly confuse**

**Forward Proxy (client-side):**
```
Employee Laptop → Corporate Proxy → Internet
[Client knows about proxy. Server sees proxy IP, not client IP.]
Use: Privacy, content filtering, bandwidth caching, access control
```

**Reverse Proxy (server-side):**
```
Internet → Nginx (public IP) → Backend servers (private IPs)
[Client doesn't know backends exist. Backends are hidden.]
Use: Load balancing, SSL termination, caching, DDoS protection
```

| Aspect | Forward Proxy | Reverse Proxy |
|---|---|---|
| **Who sets it up** | Client-side | Server-side |
| **IP hidden** | Client IP | Backend server IPs |
| **Primary use** | Privacy, filtering | Load balancing, SSL, DDoS |
| **Examples** | Corporate proxy, VPN | NGINX, HAProxy, AWS ALB |

[→ Deep Dive: Proxy](#deep-dive-proxy)

---

### DNS {#dns}
> **The internet's phone book**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| **GeoDNS:** Route users to nearest region | **TTL delays:** Changes take time to propagate |
| **Failover:** Health-checked DNS records | **No fine-grained LB:** Dumb round-robin only |
| **Simple:** Just maps names to IPs | **Clients cache DNS:** Can't detect backend health |

**Resolution chain:**
```
Browser → OS cache → ISP Resolver → Root NS → TLD NS (.com) → Authoritative NS → IP
```

**TTL trade-off:**
- Low TTL (60s) → Fast failover, high DNS query load
- High TTL (86400s) → Less load, slow propagation

**Record types to know:** `A` (IPv4), `AAAA` (IPv6), `CNAME` (alias), `MX` (mail), `TXT` (verification), `SRV` (service discovery).

[→ Deep Dive: DNS](#deep-dive-dns)

---

## ⚖️ CONSISTENCY & DISTRIBUTED SYSTEMS

---

### CAP Theorem {#cap}
> **Pick 2 of 3. But since P (partition tolerance) is non-negotiable, you're really choosing CP vs AP.**

| Type | During a Partition... | Examples |
|---|---|---|
| **CP** | Returns error rather than stale data | HBase, Zookeeper, Spanner |
| **AP** | Returns possibly stale data, stays available | Cassandra, DynamoDB, CouchDB |

**The real insight:** CAP only applies during a network partition. In normal operation, you can have both C and A. The question is: *what do you sacrifice when the network splits?*

**Practical extension (PACELC):** If Partition → A or C. Else (no partition) → Latency or Consistency. This is more useful in practice.

[→ Deep Dive: CAP](#deep-dive-cap)

---

### Consistency Models {#consistency}
> **A spectrum from "always correct" to "eventually correct"**

| Model | Guarantee | Use When |
|---|---|---|
| **Strong / Linearizable** | All reads see latest write. Real-time ordering. | Distributed locks, counters, payments |
| **Eventual** | Replicas converge… eventually | Social likes, DNS, shopping carts |
| **Read-your-writes** | You always see your own writes | User profile updates |
| **Causal** | Causally related writes are ordered | Comments/replies, collaborative editing |

**CRDTs** (Conflict-free Replicated Data Types) — the nerdy magic that makes Google Docs work. Data structures that can merge concurrent updates without conflicts, automatically.

[→ Deep Dive: Consistency Models](#deep-dive-consistency)

---

### Concurrency Control {#concurrency}

**Pessimistic Locking — assume conflict, lock first:**
```sql
BEGIN;
SELECT * FROM inventory WHERE product_id = 5 FOR UPDATE; -- Lock
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 5;
COMMIT; -- Lock released
```
✅ Safe. ❌ Slow under high contention. ❌ Deadlock risk.

**Optimistic Locking — assume no conflict, verify on write:**
```sql
-- Read with version
SELECT quantity, version FROM inventory WHERE product_id = 5;
-- version = 5, quantity = 10

-- Update only if version unchanged
UPDATE inventory SET quantity = 9, version = 6
WHERE product_id = 5 AND version = 5;
-- 0 rows updated = conflict → retry with fresh read
```
✅ Fast, no blocking. ❌ Retry overhead. ❌ Bad under high contention.

**Simple rule:** High contention (concert tickets) → Pessimistic. Low contention (user profile edits) → Optimistic.

[→ Deep Dive: Concurrency](#deep-dive-concurrency)

---

### Distributed Transactions {#transactions}
> **Consistency across multiple services/DBs — it's always messy**

| Pattern | Mechanism | Trade-off |
|---|---|---|
| **2PC** | Coordinator: prepare then commit | Blocking if coordinator fails |
| **Saga** | Chain of local txns + compensating actions | Eventual consistency, complex rollback |
| **Outbox Pattern** | Write event to DB outbox table + CDC to publish | Reliable event publishing without 2PC |
| **TCC** | Reserve → Confirm or Cancel | High overhead, used in fintech |

**Saga pattern (the most practical):**
```
Order created → Charge card → Reserve inventory
If inventory fails:
  Refund card → Cancel order (compensating transactions run in reverse)
```

**Outbox pattern (solving "what if the broker is down?"):**
```
1. Write business record AND event to outbox table in one local transaction
2. Poller/CDC reads outbox table
3. Publishes event to broker
4. Marks outbox record as done
→ Events are never lost, even if broker is temporarily down
```

[→ Deep Dive: Distributed Transactions](#deep-dive-transactions)

---

## 📐 SCALABILITY PATTERNS

---

### Sharding {#sharding}
> **Horizontal partitioning — split data across multiple DB nodes**

| Strategy | How | Watch Out |
|---|---|---|
| **Range sharding** | Shard by value range (A–M, N–Z) | Sequential writes create hot spots |
| **Hash sharding** | `hash(key) % N` | Resharding requires remapping all keys |
| **Directory sharding** | Lookup table maps key → shard | Lookup table = single point of failure |
| **Geo sharding** | Shard by region | Cross-region queries get expensive |

**Consistent Hashing (the smart way):**
```
Hash ring 0 to 2³²
Nodes placed at hash(node_id) positions
Key assigned to first node clockwise from hash(key)
Add/remove a node → only adjacent keys move (minimal resharding)
Virtual nodes → each physical node = multiple ring positions (even distribution)
```

**Hotspot problem + fix:**
```
Problem:  Celebrity user (100M followers) → all reads hit one shard
Fix:      key = "celebrity_123" + random_suffix → spread across N shards → aggregate on read
```

[→ Deep Dive: Sharding](#deep-dive-sharding)

---

### Replication {#replication}

| Type | Description | Use Case |
|---|---|---|
| **Leader-Follower** | One writer, many readers | Read-heavy; MySQL, Postgres |
| **Multi-Leader** | Multiple writers, need conflict resolution | Multi-region writes, Google Docs |
| **Leaderless** | Any node accepts writes (quorum) | High availability; Cassandra, Dynamo |

**Quorum math (Dynamo/Cassandra):**
```
N = total replicas, W = write quorum, R = read quorum
W + R > N → Strong consistency guaranteed
N=3, W=2, R=2 → Strong (classic config)
N=3, W=1, R=1 → Fast + high availability, eventual consistency
```

[→ Deep Dive: Replication](#deep-dive-replication)

---

### Rate Limiting {#ratelimit}

| Algorithm | How | Best For |
|---|---|---|
| **Token Bucket** | Tokens added at fixed rate, each request consumes one | Bursty traffic (most common) |
| **Leaky Bucket** | Requests processed at fixed rate, excess queued/dropped | Smooth output rate |
| **Fixed Window** | Count requests per fixed time window | Simple; edge-burst vulnerable |
| **Sliding Window Log** | Log timestamps, count in window | Accurate, memory-heavy |
| **Sliding Window Counter** | Weighted blend of current + previous window | Accurate + memory efficient |

**Redis implementation (atomic, distributed):**
```lua
local count = redis.call('INCR', key)
if count == 1 then redis.call('EXPIRE', key, window_seconds) end
return count
```

**Standard headers to return:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1716921600
Retry-After: 60
```

[→ Deep Dive: Rate Limiting](#deep-dive-ratelimit)

---

## 🔭 OBSERVABILITY & MONITORING

---

### Logging {#logging}
> **The forensic record of what actually happened**

**Log levels:**
- `DEBUG` → Variable dumps, function entry/exit (dev only)
- `INFO` → Normal operational events (user login, job started)
- `WARN` → Something's off but not broken (high memory, deprecated API)
- `ERROR` → Something failed (exception caught, retry triggered)
- `FATAL` → System is dying (DB connection lost, OOM)

**Always log structured JSON:**
```json
{
  "timestamp": "2026-04-08T10:15:30Z",
  "level": "ERROR",
  "service": "payment",
  "trace_id": "abc-123-def",
  "user_id": "user789",
  "error": "payment_gateway_timeout",
  "duration_ms": 5000
}
```

**Cost saving trick:** Log 100% of WARN/ERROR/FATAL. Sample 1% of INFO/DEBUG. At 1K req/s, that's 10 events/s vs 1000 events/s.

**Never log:** Passwords, credit cards, API keys, SSNs. Redact everything sensitive.

[→ Deep Dive: Logging](#deep-dive-logging)

---

### Metrics {#metrics}
> **Aggregate measurements over time — the pulse of your system**

**Google SRE's 4 Golden Signals (memorize these):**

| Signal | What | Example | Alert Threshold |
|---|---|---|---|
| **Latency** | Time to serve a request | p99 = 200ms | p99 > 500ms |
| **Traffic** | Requests per second | 10K RPS | > 15K RPS |
| **Errors** | % requests that failed | 0.1% error rate | > 1% |
| **Saturation** | How "full" the system is | CPU 75%, Disk 90% | CPU > 90% |

**Cardinality trap (kills Prometheus clusters):**
```
BAD:  http_requests_total{user_id="12345"}  → 1B users = 1B time series = 💀
GOOD: http_requests_total{endpoint, method, status}  → ~100 unique combos
```

[→ Deep Dive: Metrics](#deep-dive-metrics)

---

### Distributed Tracing {#tracing}
> **Follow a single request across every service it touched**

```
User request → API Gateway (trace_id=abc123)
  ├── OrderService     span_id=1 (50ms)
  │   ├── DB Query     span_id=1.1 (10ms)
  │   └── POST /pay    span_id=1.2 (35ms)
  └── PaymentService   span_id=2 (4500ms) ← 🔴 BOTTLENECK
      └── Bank API     span_id=2.1 (4490ms) ← Root cause
```

**This tells you:** The API is slow → it's PaymentService → it's the bank API call. In seconds, not hours.

**Tools:** Jaeger (open-source), Zipkin (simpler), AWS X-Ray, Datadog APM.

**Sampling strategy:**
- Trace 100% of errors (always want these)
- Sample 0.1% of successful requests (cost control)
- Tail-based sampling > head-based (can always capture errors retroactively)

[→ Deep Dive: Distributed Tracing](#deep-dive-tracing)

---

### Monitoring & Alerting {#monitoring}
> **Collecting data is useless without action**

**Alert quality rules:**
```
BAD:  CPU > 85% for 1 second  → noisy, flappy
GOOD: CPU > 90% averaged over 5 minutes → actionable

BAD:  Any single error  → will page at 3am for 1 error
GOOD: Error rate > 1% for 2 consecutive minutes
```

**Incident severity:**
- **P1 (Critical):** Page immediately, resolve < 15 min (payment system down)
- **P2 (High):** Page, resolve < 1 hour (feature broken)
- **P3 (Medium):** Ticket, resolve < 4 hours
- **P4 (Low):** Log it, fix next sprint

**Tools:** PagerDuty/Opsgenie (paging), Prometheus + Grafana (metrics viz), Datadog (all-in-one).

[→ Deep Dive: Monitoring](#deep-dive-monitoring)

---

## 🧩 DESIGN PATTERNS

---

### Bloom Filters {#bloomfilters}
> **"Is this item definitely NOT in the set?" — probabilistic membership test in ~1.25MB**

**How it works:**
```
Insert "alice":
  hash1("alice") % 100 = 23 → bit[23] = 1
  hash2("alice") % 100 = 45 → bit[45] = 1
  hash3("alice") % 100 = 78 → bit[78] = 1

Query "bob":
  hash2("bob") % 100 = 60 → bit[60] = 0 ✗
  → "bob" is DEFINITELY not in the set (no false negatives)

Query "alice":
  All bits set → "alice" PROBABLY in set (~1% chance it's a false positive)
```

**Memory win:**
```
1M URLs in a Hash Set: ~125 MB
1M URLs in a Bloom Filter: ~1.25 MB (100x smaller, ~1% false positive rate)
```

| ✅ ADVANTAGES | ❌ DISADVANTAGES |
|---|---|
| Tiny memory footprint | False positives (tunable, not eliminatable) |
| O(K) constant time lookup | Can't delete items |
| No stored data — just probability | False positive rate grows as filter fills |

**Where you'll see this in the wild:**
- Cassandra + Bigtable: Skip SSTables on disk → avoids expensive disk seeks
- Malware detection: Is this URL in the list of 10B known-bad URLs?
- Cache miss prevention: Is this key even in the DB before hitting it?

[→ Deep Dive: Bloom Filters](#deep-dive-bloomfilters)

---

### Circuit Breaker {#circuitbreaker}
> **Fail fast. Don't cascade. Heal automatically.**

```
[CLOSED] ─── requests pass through normally
     ↓ (5 failures)
[OPEN] ─── requests fail immediately (don't call broken service)
     ↓ (wait 30s)
[HALF-OPEN] ─── let 1 test request through
     ├── success → [CLOSED]
     └── failure → [OPEN]
```

**Without circuit breaker:**
```
Payment service is down
Order service calls it → timeout (5s)
1000 req/s × 5s = 5000 stuck threads → Order service dies too
→ Cascading failure. Everything down.
```

**With circuit breaker:**
```
5 timeouts → circuit opens
Requests 6-∞ fail in <1ms (no downstream calls)
Order service stays healthy
Payment service recovers quietly
Circuit tests → success → closes
```

[→ Deep Dive: Circuit Breaker](#deep-dive-circuitbreaker)

---

### Blob Storage {#blobstorage}
> **AWS S3, Google Cloud Storage, Azure Blob — for the big stuff**

| ✅ STRENGTHS | ❌ WEAKNESSES |
|---|---|
| Cheap, durable (11 nines), infinitely scalable | Low-latency random reads within files |
| Lifecycle policies: auto-tier, auto-expire | Database-like queries |
| Pre-signed URLs for secure direct access | Frequent small writes |

**S3 storage tiers (cost optimization):**

| Class | Use Case | Retrieval |
|---|---|---|
| Standard | Frequently accessed | Instant |
| Infrequent Access | Monthly access | Instant |
| Glacier Instant | Quarterly access | Instant |
| Glacier Deep Archive | Archival | 12 hours |

**Real-world uses:** User image/video uploads, ML training datasets, backups, static site hosting, log archival.

[→ Deep Dive: Blob Storage](#deep-dive-blobstorage)

---

### Data Warehouse {#warehouse}
> **BigQuery, Snowflake, Redshift, ClickHouse — analytics at scale**

**OLTP vs OLAP:**

| | OLTP | OLAP |
|---|---|---|
| **Purpose** | Transactions | Analytics |
| **Query** | Simple, fast, many | Complex, slow, few |
| **Data** | Current | Historical |
| **Examples** | PostgreSQL, MySQL | BigQuery, Snowflake |

**Why columnar storage wins for analytics:**
```
"Give me SUM(revenue) for all orders"
Row store: Read all columns for all rows → wasteful
Column store: Read ONLY the revenue column → 10x faster
```

[→ Deep Dive: Data Warehouse](#deep-dive-warehouse)

---

## 📊 KEY NUMBERS TO MEMORIZE

```
Latency Reference:
  L1 cache:          ~1 ns
  L2 cache:          ~4 ns
  Main memory:       ~100 ns
  SSD random read:   ~100 µs
  HDD seek:          ~10 ms
  Datacenter RTT:    ~0.5 ms
  Cross-region RTT:  ~100–150 ms

Throughput Reference:
  Postgres:    ~10K QPS (reads), ~1–3K QPS (writes)
  Redis:       ~100K–1M ops/sec
  Kafka:       ~1M+ messages/sec (cluster)
  S3:          ~3,500 PUT/sec, ~5,500 GET/sec per prefix

Storage Reference:
  1 char = 1 byte     |  1 int = 4 bytes  |  UUID = 16 bytes
  1M users × 1KB profile = ~1 GB
  1B users × 1KB profile = ~1 TB
```

---
---

# 🔬 DEEP DIVES

---

## Deep Dive: SQL {#deep-dive-sql}

**B-Tree indexes — the reason SQL is fast:**
- Almost all SQL indexes are B-Trees — balanced tree structure
- Index columns used in `WHERE`, `JOIN`, `ORDER BY`
- Composite indexes: put the most selective column first
- Too many indexes = slow writes (index must be updated on every write)
- Partial indexes: index only a subset (`WHERE status = 'active'`)

**Write-Ahead Log (WAL) — how ACID durability works:**
- Every write is first logged to WAL (sequential disk write → fast)
- Data pages updated asynchronously
- On crash: replay WAL to restore committed state
- This is why `COMMIT` is durable even if the OS crashes mid-write

**Scaling SQL:**
1. **Vertical** → Bigger machine. Easiest, limited ceiling.
2. **Read replicas** → Async replication to followers. Reads scale, writes don't.
3. **Connection pooling (PgBouncer)** → DB connection setup = expensive. Pool reuses them.
4. **Sharding** → Partition tables across DB instances by shard key. Complex queries suffer.

[↑ Back to SQL](#sql)

---

## Deep Dive: NoSQL {#deep-dive-nosql}

**DynamoDB access patterns:**
- Primary key = partition key + optional sort key
- GSI (Global Secondary Index) = alternate access patterns without changing table design
- LSI (Local Secondary Index) = different sort key on same partition key

**Cassandra data modeling mantra:** "Model around your queries, not your data."
```
Table per query. If you need 3 access patterns, build 3 tables.
Data duplication is acceptable — disk is cheap, joins aren't.
```

**Wide-column optimization:**
- Data physically sorted by partition key + clustering key
- Range queries on clustering key = extremely fast
- Example: `user_id` (partition) + `timestamp` (cluster) = instant time-range queries per user

**Cassandra consistency tuning:**
```
QUORUM write + QUORUM read: W+R > N → Strong consistency
ONE write + ONE read: Fastest, eventual consistency
ALL write + ONE read: Durable writes, but write latency = slowest replica
```

[↑ Back to NoSQL](#nosql)

---

## Deep Dive: NewSQL {#deep-dive-newsql}

**Google Spanner's TrueTime (genuinely fascinating):**
- Atomic clocks + GPS receivers in every datacenter
- Returns a time range `[earliest, latest]` instead of a point
- If transaction A's `latest` < transaction B's `earliest` → guaranteed ordering
- No NTP clock skew issues. Ever.

**CockroachDB (the open-source Spanner):**
- PostgreSQL-compatible wire protocol (your Postgres app works unchanged)
- Distributed ACID via Raft consensus
- Automatic sharding + rebalancing
- ~10x cheaper than Spanner, same guarantees (mostly)

**When you actually need NewSQL:**
- Your engineers are in 3 continents all writing to the same financial ledger
- Multi-region inventory where overselling = real money lost
- Ad bidding where two regions can bid on the same impression

[↑ Back to NewSQL](#newsql)

---

## Deep Dive: Time-Series DB {#deep-dive-time-series-db}

**InfluxDB data model:**
```
Measurement: cpu_usage
Tags (indexed): host=server1, region=us-east   ← Used for filtering
Fields (not indexed): value=72.4               ← The actual metric
Timestamp: 2026-04-08T10:15:30Z
```

**Prometheus pull model:**
- Prometheus scrapes `/metrics` endpoint from each service every 10–15s
- Push model exists (Pushgateway) for batch jobs
- PromQL for queries: `avg(http_request_duration_seconds{endpoint="/checkout"}) by (pod)`

**Downsampling pipeline:**
```
Raw data (1s): TSDB stores as-is for 7 days
→ Continuous query aggregates to 1min averages every minute
→ 1min data kept 30 days
→ Continuous query aggregates to 1hr averages
→ 1hr data kept 1 year
→ Raw data deleted after 7 days
```
Total storage: fraction of keeping all raw data forever.

[↑ Back to Time-Series](#timeseries)

---

## Deep Dive: Search Engine {#deep-dive-search-engine}

**Elasticsearch architecture:**
```
Index (like a DB table)
  └── Shards (Lucene indexes for scale)
        ├── Primary shard
        └── Replica shard (HA + read scale)

Node roles:
  Master → Manages cluster state (which shard on which node)
  Data   → Stores shards, executes queries
  Coord  → Routes queries to correct shards, merges results
```

**How BM25 scoring works (simplified):**
```
Score ∝ TF × IDF
TF = term frequency in this doc (more occurrences = more relevant)
IDF = inverse doc frequency (rarer term across corpus = more informative)
BM25 adds length normalization (short docs don't get penalized)
```

**Indexing pipeline:**
```
"Blue Running Shoes"
→ Tokenize:    ["Blue", "Running", "Shoes"]
→ Lowercase:   ["blue", "running", "shoes"]
→ Stem:        ["blue", "run", "shoe"]
→ Stop words: (remove "the", "a", "is")
→ Index:       {"blue": [doc1], "run": [doc1], "shoe": [doc1]}
```

**`search_after` vs `from/size` pagination:**
```
from=10000, size=10 → Elasticsearch fetches 10,010 docs, discards 10,000 → slow
search_after=lastDocId → Elasticsearch seeks directly to doc → fast at any depth
```

[↑ Back to Search](#search)

---

## Deep Dive: TCP/UDP {#deep-dive-tcpudp}

**TCP Congestion Control:**
- **Slow start:** Exponentially increase send rate from 1 MSS
- **Congestion avoidance:** Linearly increase after hitting threshold
- **Fast retransmit:** 3 duplicate ACKs = infer packet loss → retransmit without waiting for timeout
- **CUBIC (modern):** Better than Reno for high-bandwidth long-distance links

**TCP Flow Control (sliding window):**
```
Receiver: "My buffer can hold 64KB"
Sender: tracks bytes in-flight, never exceeds receiver's window
→ Prevents overwhelming a slow receiver
```

**Why UDP for DNS:**
- DNS query fits in 1 packet (~50 bytes)
- TCP handshake = 1.5 RTT overhead before query even sends
- UDP: send query, get response = 0.5 RTT
- If packet lost? Just send another query. Much faster than TCP retry.

**Why UDP for gaming:**
- A lost packet = old position data (irrelevant in 16ms)
- TCP would stall waiting for that packet to be retransmitted
- UDP: just process the next packet. Older position data is stale anyway.

[↑ Back to TCP/UDP](#tcpudp)

---

## Deep Dive: HTTP/HTTPS {#deep-dive-httphttps}

**Certificate chain (how HTTPS trust works):**
```
Root CA (embedded in browser by OS)
  └── Intermediate CA (signed by Root)
        └── Your server cert (signed by Intermediate)

Browser checks: server cert → Intermediate (valid?) → Root (in trust store?) → ✅
```

**HTTP/2 vs HTTP/1.1:**
- HTTP/1.1: One request per connection. Head-of-line blocking. Multiple connections per domain.
- HTTP/2: Multiplexing — many streams on one TCP connection. Binary framing. Header compression (HPACK). Server push.
- HTTP/3: QUIC (UDP-based). Faster handshake. Survives IP changes (mobile switching WiFi → cellular).

**Common HTTPS gotchas:**
- **Expired cert:** Browser blocks ("Your connection is not private") — set up auto-renewal (Let's Encrypt)
- **Mixed content:** HTTPS page loading HTTP resources → browser blocks or warns
- **Self-signed cert:** Development only. Use Let's Encrypt (free) in production.
- **HSTS:** `Strict-Transport-Security: max-age=31536000` → browser refuses HTTP forever after first visit

[↑ Back to HTTP/HTTPS](#httphttps)

---

## Deep Dive: Authentication {#deep-dive-authentication}

**JWT security deep dive:**
```
Payload is BASE64 ENCODED, not encrypted.
Anyone can decode the payload. Never put sensitive data in JWT payload.

Header.Payload.Signature
If you change the payload → signature verification fails → rejected
If attacker doesn't have the private key → can't forge a valid signature
```

**RS256 in microservices:**
```
Auth Service: signs JWT with PRIVATE key (kept secret)
Order Service, Payment Service, etc.: verify with PUBLIC key (freely distributed)
Even if Order Service is compromised → it can't forge tokens (has no private key)
```

**Token storage comparison:**
```
localStorage:       Easy. XSS steals it → game over
sessionStorage:     Same as localStorage for security
httpOnly cookie:    XSS can't read it. Add SameSite=Strict → CSRF prevented.
Memory (JS):        Lost on refresh. Safest but requires refresh token API.
```

**TOTP (Google Authenticator) math:**
```
TOTP = HMAC(secret_key, floor(time / 30))
Changes every 30 seconds. Server generates same value. Compare.
No network needed → works offline.
```

[↑ Back to Authentication](#authentication)

---

## Deep Dive: Authorization {#deep-dive-authorization}

**RBAC hierarchy with inheritance:**
```
Guest:     read_public
User:      Guest + post_content + edit_own_profile
Editor:    User + approve_content + edit_all_content
Moderator: Editor + ban_user + view_reports
Admin:     Moderator + manage_users + manage_settings + view_logs
```

**Resource-level authorization (often missed):**
```
User Alice wants DELETE /posts/456
1. Is Alice authenticated? ✅
2. Does Alice have "Editor" role? ✅ (has delete permission)
3. Is post 456 owned by Alice? ✅
4. Allow.

User Bob wants DELETE /posts/456
1. Is Bob authenticated? ✅
2. Does Bob have "Editor" role? ✅
3. Is post 456 owned by Bob? ❌ (owned by Alice)
4. DENY. (Even though Bob is an Editor)
```

**Authorization testing checklist:**
- ✅ Admin can do X
- ✅ User cannot do X (privilege escalation test)
- ✅ User can do Y on their own resource
- ✅ User cannot do Y on another user's resource
- ✅ Access revoked after role removal

[↑ Back to Authorization](#authorization)

---

## Deep Dive: CDC {#deep-dive-cdc}

**Log-based CDC — how Debezium reads Postgres:**
```
PostgreSQL writes to WAL (Write-Ahead Log) first (all changes)
Debezium connects as a "logical replication slot"
→ Reads WAL stream in real-time
→ Converts to Kafka messages with before/after states
→ Zero impact on DB performance (reads log, not tables)
```

**Event schema (what you get):**
```json
{
  "op": "u",        // i=insert, u=update, d=delete
  "before": {"qty": 10, "version": 5},
  "after":  {"qty": 9,  "version": 6},
  "source": {"table": "inventory", "ts_ms": 1704000000}
}
```

**Exactly-once with Kafka + DB (no duplicates):**
```
Consumer reads message (order_id=123)
→ Write to DB: INSERT INTO processed WHERE order_id=123 (idempotent upsert)
→ If process crashes BEFORE committing Kafka offset:
   → Kafka retries → DB upsert = no-op (already processed)
→ If process crashes AFTER committing Kafka offset:
   → Message marked done → no retry
→ Result: Exactly-once processing
```

[↑ Back to CDC](#cdc)

---

## Deep Dive: Fault Tolerance {#deep-dive-fault-tolerance}

**Exponential backoff with jitter (don't create retry storms):**
```
Without jitter:
100 clients all fail at T=0 → all retry at T=1s → all fail → all retry at T=2s → thundering herd

With jitter:
Retry delay = random(0, min(cap, base × 2^attempt))
100 clients spread retries randomly → no synchronization → services recover
```

**Bulkhead pattern — isolate thread pools:**
```
Without bulkheads:
Payment service hangs → uses all 200 shared threads → Order, Inventory, User services all starve

With bulkheads:
Payment pool: 50 threads (max)
Order pool: 50 threads (max)
Inventory pool: 50 threads (max)
Payment hangs → only its 50 threads blocked → others unaffected
```

**Chaos engineering — Netflix's approach:**
```
Chaos Monkey: Randomly terminates EC2 instances during business hours
Chaos Gorilla: Terminates entire Availability Zones
Chaos Kong: Takes down entire AWS regions
→ Forces engineering to build genuinely resilient systems
→ "If it can happen randomly in production, we've already handled it"
```

**RTO vs RPO:**
- **RTO** (Recovery Time Objective): How long until the service is back?
- **RPO** (Recovery Point Objective): How much data loss is acceptable?
- Example: RTO=1min, RPO=0sec → need active-active setup with synchronous replication

[↑ Back to Fault Tolerance](#fault-tolerance)

---

## Deep Dive: REST API {#deep-dive-rest-api}

**Idempotency keys for POST (making creates safe to retry):**
```
POST /api/payments
Idempotency-Key: client-generated-uuid-abc123

First call: Creates payment, returns 201
Second call (retry): Returns same 201 with same response (no duplicate charge)
Server stores (idempotency_key → response) for 24h
```

**ETag-based caching (conditional requests):**
```
GET /api/products/123
← ETag: "abc123"  (hash of response)

Later: GET /api/products/123 + If-None-Match: "abc123"
← 304 Not Modified (nothing transferred if unchanged)
← 200 OK + new ETag (if changed)
```

**REST API design checklist:**
- ✅ Nouns not verbs in URLs (`/users` not `/getUsers`)
- ✅ Plural collection names (`/products`, not `/product`)
- ✅ Use HTTP methods for action (`DELETE /users/1` not `/users/1/delete`)
- ✅ Return `Location` header on 201 Created
- ✅ Use `409 Conflict` for business rule violations (not 400)
- ✅ Use `422 Unprocessable Entity` for validation errors
- ✅ Idempotency keys on POST for payments

[↑ Back to REST](#rest)

---

## Deep Dive: gRPC {#deep-dive-grpc}

**Protobuf field numbers — backward compatibility:**
```protobuf
message User {
  int32 id = 1;         // field number 1
  string name = 2;      // field number 2
  // REMOVED: string email = 3; -- DON'T reuse field number 3!
  string phone = 4;     // new field — old clients just ignore it
  reserved 3;           // prevents accidental reuse
}
```
This is how gRPC achieves backward-compatible schema evolution.

**gRPC Load Balancing quirk:**
```
HTTP/1.1 (REST): Short-lived connections → LB sees many connections → trivial to balance
HTTP/2 (gRPC):  Long-lived connections → 1 connection per client → LB sees 1 connection

Fix: Client-side load balancing (gRPC built-in)
Or: gRPC-aware proxy (Envoy, Istio) that understands HTTP/2 streams
```

**Benchmark (real numbers):**
```
Payload: {"user_id": 123, "name": "Alice", "email": "alice@example.com"}
JSON:     72 bytes
Protobuf: 26 bytes (3x smaller)

REST latency (internal):  ~8ms
gRPC latency (internal):  ~1ms
At 100K RPS, that 7ms difference = massive CPU + bandwidth savings
```

[↑ Back to gRPC](#grpc)

---

## Deep Dive: GraphQL {#deep-dive-graphql}

**The N+1 problem — why naive GraphQL implementations melt DBs:**
```
Query for 100 users + their posts:
→ 1 query: SELECT * FROM users LIMIT 100
→ 100 queries: SELECT * FROM posts WHERE user_id = ? (once per user)
= 101 queries total 💀

With DataLoader:
→ 1 query: SELECT * FROM users LIMIT 100
→ 1 query: SELECT * FROM posts WHERE user_id IN (1,2,...,100)
= 2 queries total ✅
```

**Query depth attack and defense:**
```graphql
# Malicious nested query → exponential DB hits
{ user { posts { author { posts { author { posts { ... } } } } } } }

Defense:
  - Max depth: 5 levels
  - Query cost analysis: Each field has a cost; reject if total > threshold
  - Rate limiting: Per-query complexity score
  - Persisted queries: Only allow pre-approved query hashes in production
```

**Authorization per field (complex but necessary):**
```javascript
const resolvers = {
  User: {
    email: (user, _, ctx) => {
      if (ctx.viewer.id === user.id || ctx.viewer.role === 'admin')
        return user.email;
      throw new ForbiddenError('Cannot view email');
    },
    salary: (user, _, ctx) => {
      if (ctx.viewer.role !== 'hr') throw new ForbiddenError();
      return user.salary;
    }
  }
};
```

[↑ Back to GraphQL](#graphql)

---

## Deep Dive: Real-time Communication {#deep-dive-realtime}

**WebSocket — reconnection with exponential backoff:**
```javascript
let attempts = 0;
function connect() {
  const ws = new WebSocket('wss://api.example.com/ws');
  ws.onopen  = () => { attempts = 0; heartbeat(); };
  ws.onclose = () => setTimeout(connect, Math.min(30000, 1000 * 2**attempts++));
  ws.onerror = (e) => console.error('WS error:', e);
}

// Heartbeat to detect silent disconnects
function heartbeat() {
  setInterval(() => ws.readyState === 1 && ws.send('ping'), 30000);
}
```

**SSE vs WebSocket — when SSE wins:**
```
SSE wins when:
- Server → Client only (no client sends needed)
- Works through HTTP proxies/firewalls that block WebSocket upgrades
- Browser auto-reconnect is a killer feature
- Simple: just an HTTP GET with Content-Type: text/event-stream

SSE loses when:
- Client needs to send data too (must use separate HTTP POST)
- Binary data (SSE is text-only)
- > 6 connections per domain (browser limit)
```

**WebRTC ICE negotiation (simplified):**
```
1. Signaling: Exchange SDP (session description) via your server
2. ICE gathering: Both peers discover their IP candidates (local, STUN, TURN)
3. ICE checking: Try each candidate pair until one works
4. Connected: Media flows peer-to-peer (your server = 0 bandwidth)

STUN: Helps peer discover its public IP (behind NAT)
TURN: Relay server if direct connection impossible (firewall blocks P2P)
```

[↑ Back to Real-time](#realtime)

---

## Deep Dive: Caching {#deep-dive-caching}

**Cache-Aside implementation:**
```python
def get_product(product_id):
    cached = redis.get(f"product:{product_id}")
    if cached:
        return json.loads(cached)      # Cache hit — ~0.1ms

    product = db.query("SELECT * FROM products WHERE id = ?", product_id)
    redis.setex(f"product:{product_id}", 3600, json.dumps(product))  # TTL=1hr
    return product                     # Cache miss — ~10ms, but next hit is fast
```

**Write-Through — never stale, but slower writes:**
```python
def update_product(product_id, data):
    db.update(product_id, data)           # Write to DB
    redis.set(f"product:{product_id}", json.dumps(data))  # Write to cache
    # Both always in sync. Write latency = DB + cache write.
```

**Write-Behind — fastest writes, risk of data loss:**
```python
def update_product(product_id, data):
    redis.set(f"product:{product_id}", json.dumps(data))  # Instant
    queue.push({"action": "update", "id": product_id, "data": data})
    # Background worker flushes queue to DB every 100ms
    # Risk: if Redis dies before flush → DB loses those writes
```

**Thundering Herd — three solutions:**
```
1. Probabilistic early expiration:
   if ttl < threshold AND random() < probability: refresh now
   
2. Mutex on miss:
   if not redis.setnx("lock:product:123", "1"): return wait_for_cache()
   result = db.query(...)
   redis.delete("lock:product:123")
   
3. Background refresh:
   Cron refreshes cache before TTL expires (always warm)
```

[↑ Back to Caching](#caching)

---

## Deep Dive: Redis {#deep-dive-redis}

**Distributed lock with Redlock (multi-node):**
```lua
-- Acquire lock on majority of N Redis nodes
-- Success = N/2 + 1 nodes acquired within TTL
-- TTL prevents deadlock if client dies

-- Release (atomic Lua script):
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0  -- Someone else's lock, don't delete it
end
```

**Redis Streams consumer group example:**
```
XADD orders * customer_id 5 amount 100 status pending

-- 3 independent services read same stream, each at their own pace:
XGROUP CREATE orders payment-svc 0
XGROUP CREATE orders fulfillment-svc 0
XGROUP CREATE orders analytics-svc 0

-- Payment service reads and ACKs:
XREADGROUP GROUP payment-svc worker1 STREAMS orders >
-- Process payment...
XACK orders payment-svc {entry_id}

-- If worker1 crashes:
XPENDING orders payment-svc          -- Find unacknowledged entries
-- worker2 takes over unfinished work
```

**Persistence config recommendations:**
```
Development:  No persistence (fastest)
Staging:      RDB snapshots every 5 min
Production:   RDB + AOF with fsync=everysec (compromise: lose max 1s data)
Critical:     AOF with fsync=always (slowest, zero data loss)
```

**Redis Cluster hash slots:**
```
16,384 slots distributed across N nodes
hash_slot = CRC16(key) % 16384
Key "user:123" → slot 7638 → Node 2

Adding a node:
  Move subset of slots from existing nodes to new node
  Data migrates live → no downtime
```

[↑ Back to Redis](#redis)

---

## Deep Dive: CDN {#deep-dive-cdn}

**Cache-Control headers — what CDNs respect:**
```
Cache-Control: max-age=86400           → Browser + CDN cache 24h
Cache-Control: s-maxage=3600          → CDN-only TTL (browser uses max-age)
Cache-Control: no-store               → Never cache (user-specific data)
Cache-Control: stale-while-revalidate=60 → Serve stale for 60s while refreshing

Surrogate-Key: product-123 category-shoes   → Tag-based bulk invalidation
→ "Invalidate all objects tagged product-123" → instant purge across all PoPs
```

**Pull vs Push CDN:**
```
Pull CDN: First request → CDN fetches from origin → caches → serves future requests
          Simple. Good for unpredictable access patterns.

Push CDN: You upload assets to CDN proactively (before anyone requests them)
          Good for: Software releases, large files, guaranteed warmth
```

**Edge computing (Cloudflare Workers):**
```
Without edge compute: Auth check → round-trip to origin (200ms+)
With Cloudflare Worker: Auth check at nearest PoP (<5ms) → reject bad requests at edge
→ Origin never sees unauthenticated traffic
→ A/B testing, personalization, geoblocking all at the edge
```

[↑ Back to CDN](#cdn)

---

## Deep Dive: Message Queue {#deep-dive-message-queue}

**Visibility timeout — the retry mechanism:**
```
Consumer receives message → message becomes "invisible" for 30s
Consumer processes successfully → sends ACK → message deleted
Consumer crashes → visibility timeout expires → message reappears → another consumer retries
```

**Dead Letter Queue — what to do with poison pills:**
```
Message fails 3 times → moved to DLQ automatically
Engineer: inspect DLQ → find bug → fix → reprocess from DLQ
Without DLQ: Failed message blocks queue forever OR is silently dropped
```

**RabbitMQ exchange types:**
```
Direct:  Route to queue matching exact routing key ("order.created" → order queue)
Fanout:  Broadcast to all bound queues (1 event → all consumers get copy)
Topic:   Pattern matching ("order.#" → matches "order.created", "order.cancelled")
Headers: Route by message headers instead of routing key
```

**SQS FIFO vs Standard:**
```
Standard: At-least-once delivery, best-effort ordering, ~unlimited throughput
FIFO:     Exactly-once, strict ordering, 3K msg/sec (30K with batching)
→ Use FIFO for financial transactions where order and dedup matter
→ Use Standard for everything else (higher throughput, cheaper)
```

[↑ Back to Message Queue](#messagequeues)

---

## Deep Dive: Kafka {#deep-dive-kafka}

**ISR (In-Sync Replicas) — the durability guarantee:**
```
Topic "orders", Partition 0:
  Leader: Broker 1 (accepts writes)
  ISR: [Broker 1, Broker 2, Broker 3]  ← all caught up

Producer writes with acks=all:
  → Broker 1 writes → waits for Broker 2 and 3 to ack
  → Only then confirms to producer
  → If Broker 2 falls behind → removed from ISR → write only needs 1+2 to ack
```

**Consumer offset management:**
```
Consumer Group "analytics":
  Partition 0 → Consumer A (last offset: 1000)
  Partition 1 → Consumer B (last offset: 850)
  Partition 2 → Consumer C (last offset: 920)

Consumer A crashes:
  → Rebalance: Partition 0 reassigned to Consumer D
  → Consumer D starts from offset 1001 (no reprocessing, no gap)
```

**Compacted topics — keeping only the latest value per key:**
```
Normal topic:      [key=user1:A, key=user2:B, key=user1:C, key=user1:D]
Compacted topic:   [key=user2:B, key=user1:D]  ← only latest per key kept

Use case: CDC (latest state per row), user preferences (current value only)
```

**Partition key strategy:**
```
Order by user: partition key = user_id → all events for user on same partition → ordered
Order by order: partition key = order_id → events for one order are ordered
Bad key: null → round-robin → no ordering guarantee anywhere
```

[↑ Back to Kafka](#kafka)

---

## Deep Dive: Pub/Sub {#deep-dive-pubsub}

**SNS + SQS fan-out — the production pattern:**
```
Order Service publishes: SNS topic "order-events"
  ↓ SNS fans out to:
  ├── SQS Queue: EmailService (own DLQ, own retry config, own throughput)
  ├── SQS Queue: AnalyticsService (can fall behind, own consumer group)
  └── SQS Queue: FraudDetectionService (high priority, short timeout)

Benefits:
  - Each consumer has isolated failure domain
  - Can add new consumers without touching publisher
  - Different retry/DLQ config per consumer
```

**Google Pub/Sub push vs pull:**
```
Pull: Consumer calls Pub/Sub API to fetch messages
      Good for: Variable-load consumers, when you control throughput

Push: Pub/Sub calls your HTTP endpoint with messages
      Good for: Serverless (Lambda/Cloud Functions auto-invoked)
      Requires: Public HTTPS endpoint, acknowledgment within deadline
```

[↑ Back to Pub/Sub](#pubsub)

---

## Deep Dive: Microservices {#deep-dive-microservices}

**Service discovery — finding other services:**
```
Client-side:
  Service A queries registry (Consul/Eureka) → gets list of Service B instances
  Service A picks one (round-robin/least-conn) → calls directly
  Pro: No extra hop. Con: Discovery logic in every client.

Server-side:
  Service A calls Load Balancer → LB queries registry → routes to Service B
  Pro: Clients are dumb. Con: Extra hop, LB is critical.
```

**Saga pattern — orchestration vs choreography:**
```
Choreography (event-driven):
  OrderCreated event → PaymentService listens → charges card
  PaymentSucceeded event → InventoryService listens → reserves stock
  Pro: Decoupled. Con: Hard to trace the flow. Cyclic dependencies.

Orchestration (central coordinator):
  SagaOrchestrator → calls PaymentService directly
  SagaOrchestrator → calls InventoryService directly
  Pro: Clear flow, easy to trace. Con: Orchestrator = God object risk.
```

**Contract testing with Pact:**
```
Consumer (Order Service) defines: "I expect Payment Service to return {status, charge_id}"
Provider (Payment Service) verifies: "My API actually returns this shape"
→ Catches breaking API changes before deployment
→ No need to run both services together to test contract
```

[↑ Back to Microservices](#microservices)

---

## Deep Dive: Serverless {#deep-dive-serverless}

**Cold start anatomy:**
```
Container provision (0–500ms)
  → Runtime init: Node.js ~50ms, Python ~100ms, JVM ~2000ms 😬
  → Handler code load (~50ms)
  → Your code executes

Mitigation:
  - Provisioned concurrency: Pre-warm N containers (costs money even at 0 RPS)
  - Keep-alive pings: Invoke function every 5 min to stay warm
  - Lighter runtimes: Node.js/Python >> Java for cold starts
  - Lazy imports: Don't import everything at top-level (import inside handler if rarely used)
```

**Lambda concurrency model:**
```
Each invocation = isolated container
Default burst limit: 1000 concurrent
Reserved concurrency: Guarantee N containers for this function
  → Also limits to N (protect downstream DBs from Lambda stampede)

Lambda + RDS problem:
  1000 concurrent Lambdas × 1 DB connection = 1000 connections → RDS falls over
  Fix: RDS Proxy (connection pooling between Lambda and RDS)
```

[↑ Back to Serverless](#serverless)

---

## Deep Dive: Service Mesh {#deep-dive-servicemesh}

**Sidecar pattern — how it intercepts traffic:**
```
Service A container (port 8080)
  ↕ (loopback — same pod)
Envoy sidecar (port 15001)
  ↓ (network)
Envoy sidecar (port 15001)
  ↕
Service B container (port 8080)

Service A just calls "http://service-b:8080" normally
Envoy intercepts, adds mTLS, retries, traces, metrics
Service A has zero knowledge of the mesh
```

**mTLS — mutual authentication:**
```
Normal TLS:
  Client verifies Server (server has certificate)
  Server trusts any client

mTLS (zero-trust):
  Client verifies Server (server cert)
  Server verifies Client (client cert)
  → Only known services can talk to each other
  → Compromised service can't impersonate others
```

**vs API Gateway:**
```
API Gateway: External traffic → your cluster (North-South traffic)
Service Mesh: Service A → Service B inside cluster (East-West traffic)
They complement each other, not compete.
```

[↑ Back to Service Mesh](#servicemesh)

---

## Deep Dive: Load Balancer {#deep-dive-loadbalancer}

**Algorithms in detail:**
```
Round Robin:      req1→server1, req2→server2, req3→server3, req4→server1...
                  Simple. Ignores server load.

Least Connections: Route to server with fewest active connections
                   Better for long-lived connections (WebSocket, gRPC)

IP Hash:          hash(client_IP) % N → same client always hits same server
                  Sticky sessions without cookies. Breaks if server dies.

Weighted:         server1 weight=3, server2 weight=1 → 75%/25% split
                  Good for canary deployments or heterogeneous hardware
```

**Global load balancing:**
```
Option 1 - GeoDNS: DNS returns different IPs per region
  Con: DNS TTL means failover is slow (seconds to minutes)

Option 2 - Anycast (AWS Global Accelerator, Cloudflare):
  Same IP announced from multiple PoPs globally
  BGP routes client to nearest PoP automatically
  Failover in seconds (BGP reconverges faster than DNS TTL)
```

[↑ Back to Load Balancer](#loadbalancer)

---

## Deep Dive: API Gateway {#deep-dive-apigateway}

**Rate limiting at API Gateway:**
```
Per-user: 1000 req/hour (identified by API key or JWT sub)
Per-IP: 100 req/min (prevent anonymous abuse)
Per-tier: Free=100/day, Pro=10000/day, Enterprise=unlimited

Response headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 847
  X-RateLimit-Reset: 1716921600
  Retry-After: 3600  (only on 429)
```

**Request transformation — why it matters:**
```
Mobile client sends: {"productId": "123", "qty": 2}
API Gateway transforms to: {"product_id": 123, "quantity": 2, "source": "mobile"}
Backend microservice sees consistent format regardless of client
→ Decouple client payload format from internal API contract
```

[↑ Back to API Gateway](#apigateway)

---

## Deep Dive: Proxy {#deep-dive-proxy}

**NGINX as reverse proxy config:**
```nginx
upstream backend {
    least_conn;                          # Least connections algorithm
    server 10.0.0.10:8080 weight=3;     # 75% of traffic
    server 10.0.0.11:8080 weight=1;     # 25% of traffic (canary)
    server 10.0.0.12:8080 backup;       # Only used if others fail
}

server {
    listen 443 ssl;
    ssl_certificate     /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    location /api/ {
        proxy_pass http://backend;
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
        add_header X-Request-ID $request_id;
    }

    location ~* \.(jpg|png|css|js)$ {
        expires 1y;                       # Cache static assets aggressively
        add_header Cache-Control public;
    }
}
```

**Forward proxy for corporate networks:**
```
Employee accesses internet → must go through proxy
Proxy enforces:
  - URL filtering (block social media, gambling)
  - DLP (Data Loss Prevention): detect SSNs/credit cards in outbound traffic
  - SSL inspection: terminate employee's HTTPS, inspect, re-encrypt (controversial)
  - Bandwidth shaping: throttle video streaming during business hours
  - Audit logging: full record of web activity
```

[↑ Back to Proxy](#proxy)

---

## Deep Dive: CAP Theorem {#deep-dive-cap}

**Why P is non-negotiable:**
```
In any distributed system across multiple machines:
- Network cables can be cut
- Switches can fail
- Cloud regions can be isolated
- BGP misconfigurations happen (real outages)

If you don't tolerate partitions (P), you have a single-node system.
So the real choice: During a partition, do you want CP or AP?
```

**Cassandra tuning example:**
```
Default (AP): ONE write + ONE read → fast, eventual consistency
Strict (CP):  QUORUM write + QUORUM read → W+R > N → strong consistency, slower
```

**PACELC — more practical than CAP:**
```
During Partition (P): choose A or C
Else (normal operation): choose Latency or Consistency

Examples:
  DynamoDB: PA/EL → Available during partition, Low latency normally
  Spanner:  PC/EC → Consistent during partition, Consistent normally (pays latency cost)
  Cassandra: PA/EL by default, tunable
```

[↑ Back to CAP](#cap)

---

## Deep Dive: Consistency Models {#deep-dive-consistency}

**The consistency spectrum (strongest → weakest):**
```
Linearizability:   Operations appear instantaneous. Real-time ordering. Most restrictive.
Sequential:        Operations appear in some sequential order. No real-time constraint.
Causal:            Causally related ops are ordered. Concurrent ops may differ.
Eventual:          Replicas converge given no new writes. No time guarantee.
```

**CRDTs — automatic conflict resolution:**
```
G-Counter (increment only):
  Node A: counter=5  |  Node B: counter=3  (concurrent increments)
  Merge:  counter = max(A, B) per-node = {A:5, B:3}
  Total:  sum = 8
  → No conflicts ever. Merge is automatic.

OR-Set (add/remove set):
  Add "alice" → generate unique tag {alice, tag1}
  Remove "alice" → remove all (alice, *) entries
  Concurrent add + remove: Whichever has more recent tag wins
  → Google Docs, Figma use CRDTs for collaborative editing
```

[↑ Back to Consistency Models](#consistency)

---

## Deep Dive: Concurrency Control {#deep-dive-concurrency}

**Deadlock — how it happens and how to prevent it:**
```
Transaction A:              Transaction B:
Lock row user_id=1          Lock row user_id=2
Try lock user_id=2 → wait   Try lock user_id=1 → wait
           DEADLOCK! Both waiting forever.

Prevention strategies:
1. Lock ordering: Always acquire locks in same order (user_id ASC)
   A: lock user 1 → lock user 2  |  B: lock user 1 → lock user 2  → B waits for A, no deadlock

2. Lock timeouts: After 100ms waiting, abort and retry

3. Optimistic locking instead: No locks, no deadlocks
```

**MVCC (Multi-Version Concurrency Control) — how Postgres isolation works:**
```
Every row has: xmin (created by txn), xmax (deleted by txn)
Reader sees a snapshot of the DB at transaction start time
Writer creates new row version (doesn't overwrite)
→ Readers never block writers. Writers never block readers.
→ Read your writes: your own transaction's writes are visible to you
```

[↑ Back to Concurrency](#concurrency)

---

## Deep Dive: Distributed Transactions {#deep-dive-transactions}

**2PC (Two-Phase Commit) — why it's avoided:**
```
Phase 1 (Prepare):
  Coordinator → "Are you ready to commit?"
  All participants → "Yes, ready" (logged to durable storage)

Phase 2 (Commit):
  Coordinator → "Commit!"
  All participants → Commit

Problem:
  Coordinator crashes after Phase 1 (participants locked, waiting forever)
  → Blocking protocol. Requires coordinator recovery to proceed.
  → Why Sagas are preferred in microservices.
```

**Saga with compensating transactions:**
```
Happy path:
  1. OrderService.createOrder()           → order_id=123
  2. PaymentService.chargeCard($100)      → charge_id=abc
  3. InventoryService.reserveItem(sku=X)  → reservation_id=xyz

Failure at step 3 (out of stock):
  3. InventoryService.reserveItem() → FAIL
  → 2. PaymentService.refundCard(charge_id=abc)   ← compensating txn
  → 1. OrderService.cancelOrder(order_id=123)      ← compensating txn

Key: Each step must be idempotent (safe to retry)
Key: Compensating txns must be designed upfront
```

[↑ Back to Distributed Transactions](#transactions)

---

## Deep Dive: Sharding {#deep-dive-sharding}

**Resharding with minimal downtime (double-shard strategy):**
```
Current: 4 shards
Target:  8 shards

Steps:
1. Create 8 new shards (shadow)
2. Dual-write: all new writes go to both old (4) and new (8) shards
3. Backfill: copy existing data from old to new shards
4. Verify: data in 8 shards matches 4 shards
5. Cut over reads to new 8 shards
6. Stop writes to old 4 shards
7. Delete old 4 shards

Result: Half of each old shard goes to new shards (minimal data movement)
Downtime: Zero (dual-write handles transition period)
```

**Hotspot mitigation for celebrities:**
```
Problem: "Beyoncé" has 300M followers → every read hits shard containing user_id=beyonce

Solution 1: Key salting
  Read key:  "user:beyonce:1", "user:beyonce:2", ..., "user:beyonce:100"
  Write: Write to all 100 keys
  Read: Read any of the 100 keys (or all 100 and sum)

Solution 2: Dedicated shard
  user_id=beyonce → always shard 0 (celebrity shard with extra capacity)
  Regular users → shards 1-N (hash-based)
```

[↑ Back to Sharding](#sharding)

---

## Deep Dive: Replication {#deep-dive-replication}

**Replication lag — the silent killer:**
```
Async replication: Follower may be 1-100ms behind leader
Read from follower: Might get stale data

Scenarios where this breaks things:
- User updates profile → reads their own profile from replica → sees old data
- Inventory check on replica → says "10 in stock" → actually 0 (just sold out)

Mitigations:
- Read-your-writes: Route reads to leader if user just wrote (sticky read for 5s)
- Monotonic reads: Route user's reads to same replica (at least no backward time travel)
- Lag monitoring: Alert if replica lag > 1s
```

**Leaderless replication (Dynamo/Cassandra style):**
```
Write: Send to all N nodes, wait for W acks
Read:  Send to all N nodes, wait for R responses, pick latest version

With N=3, W=2, R=2:
  W+R=4 > N=3 → at least 1 node in common → always get latest write

Read repair:
  Read returns: [v5, v5, v3] → node 3 is behind
  System sends v5 to node 3 → heals during reads
```

[↑ Back to Replication](#replication)

---

## Deep Dive: Rate Limiting {#deep-dive-ratelimit}

**Token Bucket — handles bursts gracefully:**
```
Bucket: 100 tokens (burst capacity)
Refill: 10 tokens/second (sustained rate)

Normal traffic (5 req/s):  Always under limit, bucket stays ~95% full
Burst (200 req/s for 10s): First 100 requests use bucket tokens → all served
                            Remaining 1,900 requests: no tokens → rejected (429)
Next 10 seconds:            Bucket refills (100 tokens) → ready for next burst
```

**Fixed Window edge case problem:**
```
Window: 0:00-1:00 (60 requests allowed)

Normal:     50 req at 0:30 → fine
Attack:     60 req at 0:59 + 60 req at 1:01 → 120 req in 2 seconds!
            Both windows are within limit. System overloaded.

Fix: Sliding Window Counter
  Count = (prev_window_count × overlap%) + current_window_count
  Attack window: (60 × 1.5%) + 60 = ~1 + 60 = 61 → rejected
```

**Distributed rate limiting across multiple nodes:**
```
Problem: 3 API gateway nodes, each with local counter
         Client sends 100 req to node 1, 100 to node 2, 100 to node 3
         Limit is 100/min total → but each node thinks it's fine

Solution 1: Centralized Redis counter (single source of truth)
  Risk: Redis becomes bottleneck

Solution 2: Local + global hybrid
  Local fast-path: Quick check (approximate)
  Global Redis: Authoritative check (every 10th request, or on local limit)
  Trade-off: ~1% requests may slip through during sync window
```

[↑ Back to Rate Limiting](#ratelimit)

---

## Deep Dive: Logging {#deep-dive-logging}

**Structured logging enables queries like these:**
```bash
# Find all payment failures for user 123 in the last hour
jq 'select(.service=="payment" and .user_id=="123" and .level=="ERROR")'

# Find all requests slower than 1s
jq 'select(.duration_ms > 1000)'

# Count error rate per endpoint
jq -r '.endpoint' | sort | uniq -c | sort -rn
```

**ELK Stack pipeline:**
```
App → Logstash (parse, filter, enrich) → Elasticsearch (index, store)
                                        ↓
                                    Kibana (visualize, dashboards, alerts)

Alternatives:
  Grafana Loki (cheaper, designed for logs, integrates with Grafana)
  Datadog Logs (managed, expensive, excellent)
  CloudWatch (AWS-native, fine for AWS workloads)
```

**Log retention by compliance requirement:**
```
GDPR:           Minimum 30 days, maximum determined by necessity
PCI-DSS:        1 year online, 3 months immediately available
HIPAA:          6 years
SOX:            7 years
General SaaS:   30-90 days hot, archive after (much cheaper)
```

[↑ Back to Logging](#logging)

---

## Deep Dive: Metrics {#deep-dive-metrics}

**Prometheus data model:**
```
http_request_duration_seconds{method="GET", endpoint="/checkout", status="200"} 0.125

At query time:
rate(http_request_duration_seconds_sum[5m]) /
rate(http_request_duration_seconds_count[5m])
→ Average latency over last 5 minutes
```

**SLI/SLO/SLA — the hierarchy:**
```
SLI (Service Level Indicator): The actual measurement
  "99.2% of requests completed in < 200ms this week"

SLO (Service Level Objective): Internal target
  "We aim for 99% of requests < 200ms"
  If SLO is missed → engineering team investigates

SLA (Service Level Agreement): External commitment with consequences
  "We guarantee 99% of requests < 200ms or customer gets 10% credit"
  If SLA is missed → money leaves your account
```

**Error budget:**
```
SLO: 99.9% availability = 0.1% allowed downtime = 43.8 minutes/month error budget
Used so far: 20 minutes
Remaining: 23.8 minutes

If budget is running low → freeze risky deploys
If budget is healthy → move fast, take risks
```

[↑ Back to Metrics](#metrics)

---

## Deep Dive: Distributed Tracing {#deep-dive-tracing}

**OpenTelemetry — the standard (finally):**
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

tracer = trace.get_tracer("order-service")

with tracer.start_as_current_span("process_order") as span:
    span.set_attribute("order.id", order_id)
    span.set_attribute("order.amount", amount)
    
    with tracer.start_as_current_span("validate_payment"):
        result = payment_service.charge(order_id, amount)
        span.set_attribute("payment.status", result.status)
```

**Context propagation — how trace IDs cross service boundaries:**
```
HTTP Header: traceparent: 00-abc123-def456-01
  ↓ (Service B extracts this header)
Service B creates child span with parent_id=def456
  ↓ (B calls Service C)
HTTP Header: traceparent: 00-abc123-xyz789-01 (same trace ID, new span ID)
  → All spans linked by same trace_id abc123
```

**Tail-based sampling (better than head-based):**
```
Head-based: Decide at request start whether to sample (miss important errors)
Tail-based: Collect all spans, decide AFTER request completes
  → 100% of errors → sampled (always keep)
  → 0.1% of success → sampled (cost control)
  → High-latency requests → always sampled (find performance issues)
  → Normal fast requests → mostly dropped
```

[↑ Back to Distributed Tracing](#tracing)

---

## Deep Dive: Monitoring & Alerting {#deep-dive-monitoring}

**Postmortem (blameless) structure:**
```
Incident: Payment service down for 23 minutes (2026-04-08 10:00-10:23)

Timeline:
  10:00 - Deployment of v2.3.1 started
  10:03 - Error rate rose from 0.1% to 15%
  10:05 - Alert fired (error rate > 1% for 2 min)
  10:07 - On-call engineer acknowledged
  10:15 - Root cause identified: missing DB index in migration
  10:23 - Rollback to v2.3.0 complete, error rate back to 0.1%

Root cause: Migration script missing index on payment_method_id column
  → Table scan on 50M row table → timeout → cascading failures

Contributing factors:
  - No staging environment with production-scale data (couldn't reproduce)
  - Migration not reviewed by DB team
  - Canary deployment not used (100% rollout)

Action items:
  - Add production-scale DB to staging (DRI: @alice, due: 2026-04-22)
  - Require DB team review for migrations (DRI: @bob, due: 2026-04-15)
  - Add automated migration dry-run in CI (DRI: @charlie, due: 2026-04-29)
```

[↑ Back to Monitoring](#monitoring)

---

## Deep Dive: Bloom Filters {#deep-dive-bloomfilters}

**Tuning for target false positive rate:**
```
Optimal parameters:
  m (bits) = -n × ln(p) / (ln 2)²
  k (hashes) = (m/n) × ln 2

For 1M items, 1% false positive rate:
  m = 9,585,058 bits = ~1.14 MB
  k = 7 hash functions

For 1M items, 0.1% false positive rate:
  m = 14,377,587 bits = ~1.72 MB  (50% more memory for 10x better accuracy)
  k = 10 hash functions
```

**Counting Bloom Filter (supports deletions):**
```
Instead of single bits, use small counters (4-bit per slot)
Insert: increment counter at each hash position
Delete: decrement counter at each hash position
→ Allows deletion at cost of 4x memory

Use case: Real-time blacklist with frequent removals (IP blocking)
```

**Cuckoo Filter — better Bloom for production:**
```
Supports deletion natively (unlike standard Bloom)
Higher lookup performance (2 hash functions vs 7)
Same memory usage at equivalent false positive rate
→ Preferred over Bloom Filter for new systems that need deletion
```

[↑ Back to Bloom Filters](#bloomfilters)

---

## Deep Dive: Circuit Breaker {#deep-dive-circuitbreaker}

**Production-grade circuit breaker (Python):**
```python
import time
from enum import Enum

class State(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=30, success_threshold=2):
        self.state = State.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.success_threshold = success_threshold

    def call(self, func, *args, **kwargs):
        if self.state == State.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                self.state = State.HALF_OPEN
                self.success_count = 0
            else:
                raise CircuitOpenError("Circuit is OPEN — fast failing")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        if self.state == State.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = State.CLOSED  # Recovered!

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = State.OPEN  # Trip the breaker
```

**Fallback strategies when circuit is open:**
```python
try:
    return payment_service.charge(amount)
except CircuitOpenError:
    if is_idempotent_retry(request):
        return queue_for_async_retry(request)    # Retry later
    elif has_cached_result(request):
        return get_cached_result(request)        # Serve stale
    else:
        return ServiceUnavailableResponse()      # Fail gracefully
```

[↑ Back to Circuit Breaker](#circuitbreaker)

---

## Deep Dive: Blob Storage {#deep-dive-blobstorage}

**Pre-signed URLs — the right pattern for file uploads:**
```
Without pre-signed URLs:
  Client → Your server (entire file, 500MB) → S3
  Your server is a bottleneck + bandwidth cost

With pre-signed URLs:
  Client → Your server: "I want to upload a 500MB file"
  Your server → Client: pre-signed URL (valid 15 min)
  Client → S3 directly (no server involvement, no bandwidth cost)

Pre-signed URL generation:
  url = s3.generate_presigned_url('put_object',
    Params={'Bucket': 'my-bucket', 'Key': f'uploads/{user_id}/{filename}'},
    ExpiresIn=900  # 15 minutes
  )
```

**Multipart upload for large files:**
```
File: 5GB video
→ Split into 100 parts (50MB each)
→ Upload parts in parallel (10 at a time)
→ S3 assembles parts server-side
→ Atomic: either all parts complete or nothing committed

Benefits:
  - Resume after network failure (only re-upload failed parts)
  - Parallel upload = faster total time
  - Required for files > 5GB
```

[↑ Back to Blob Storage](#blobstorage)

---

## Deep Dive: DNS {#deep-dive-dns}

**DNS resolution in detail:**
```
You type: www.example.com

1. Browser DNS cache: miss (first time)
2. OS DNS cache: miss
3. Recursive resolver (your ISP/8.8.8.8): 
   → Asks Root NS: "Who handles .com?"
   → Root NS: "Ask 192.5.6.30 (Verisign .com TLD)"
   → Asks .com TLD: "Who handles example.com?"
   → .com TLD: "Ask 205.251.196.1 (example.com authoritative)"
   → Asks authoritative NS: "What's www.example.com?"
   → Returns: 93.184.216.34

Total time: ~50-100ms (cold)
Cached: <1ms (resolver caches for TTL duration)
```

**GeoDNS routing:**
```
Client in India → authoritative NS detects client IP region = Asia
→ Returns: 143.204.175.1 (AWS Singapore)

Client in Germany → region = Europe
→ Returns: 18.185.130.82 (AWS Frankfurt)

→ Same domain, different IPs, each routed to nearest region
→ Used by: Netflix, Google, AWS CloudFront, every major CDN
```

[↑ Back to DNS](#dns)

---

## Deep Dive: Data Warehouse {#deep-dive-warehouse}

**Columnar storage vs row storage:**
```
Row store (PostgreSQL):
  [user_id=1, name=Alice, revenue=100, timestamp=T1]
  [user_id=2, name=Bob,   revenue=200, timestamp=T2]
  → "SELECT SUM(revenue)" reads ALL columns for ALL rows

Column store (BigQuery):
  revenue column: [100, 200, 50, 300, ...]  (all together, no other columns)
  → "SELECT SUM(revenue)" reads ONLY revenue column → 10x less I/O
  → Compresses beautifully (revenue values are similar → 10:1 ratio)
```

**Partition pruning:**
```
Table partitioned by month (2022-01 to 2026-04)
Query: "SELECT * FROM orders WHERE month = '2026-04'"
→ BigQuery reads ONLY April 2026 partition (2 weeks of data)
→ Skips 51 other months entirely
→ 50x less data scanned → 50x cheaper query

Cluster by user_id within partition:
→ "WHERE user_id = 123" → reads only the user_id=123 block
→ Another 10x improvement
```

**ELT vs ETL:**
```
ETL (traditional):
  Extract raw data → Transform in pipeline (Python/Spark) → Load clean data
  Problem: Transform is bottleneck, slow, hard to scale

ELT (modern):
  Extract raw data → Load raw data to warehouse → Transform IN the warehouse (SQL)
  BigQuery/Snowflake are so powerful → transforming in SQL is fastest
  dbt (Data Build Tool) = write SQL transforms, version control, test, deploy
```

[↑ Back to Data Warehouse](#warehouse)

---

*Last updated: April 2026 — covers all major system design topics for Senior SWE interviews at Google / FAANG*
