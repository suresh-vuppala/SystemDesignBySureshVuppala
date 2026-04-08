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
| **APIs & Comms** | [REST](#-rest-api) · [gRPC](#-grpc) · [GraphQL](#-graphql) · [Real-time](#-real-time-communication) |
| **Compute** | [Microservices](#-microservices) · [Serverless](#-serverless) · [Service Mesh](#-service-mesh) |
| **Networking** | [Load Balancer](#-load-balancer) · [API Gateway](#-api-gateway) · [Reverse Proxy](#-reverse-proxy) |
| **Consistency** | [CAP Theorem](#-cap-theorem) · [Consistency Models](#-consistency-models) · [Distributed Transactions](#-distributed-transactions) · [Concurrency Control](#-concurrency-control) |
| **Patterns** | [Bloom Filters](#-bloom-filters) · [Circuit Breaker](#-circuit-breaker) · [Sharding](#-sharding) · [Replication](#-replication) · [Rate Limiting](#-rate-limiting) |
| **Infra** | [Blob Storage](#-blob-storage-s3--gcs) · [DNS](#-dns) · [Data Warehouse](#-data-warehouse) |

---

## ⚡ STORAGE

---

### 🟦 SQL (Relational DB)
> **ACID guarantees + complex queries; vertical scaling only. Examples: PostgreSQL, MySQL, Cloud Spanner**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: SQL](#deep-dive-sql)

---

### 🟦 NoSQL
> **Horizontal scaling, flexible schema, eventual consistency. Examples: DynamoDB, Cassandra, MongoDB, HBase**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: NoSQL](#deep-dive-nosql)

---

### 🟦 NewSQL
> **Global ACID at scale: SQL + NoSQL tradeoff. Examples: Google Spanner, CockroachDB, TiDB**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: NewSQL](#deep-dive-newsql)

---

### 🟦 Time-Series DB
> **Optimized for time-stamped data ingestion + range queries. Examples: InfluxDB, Prometheus, TimescaleDB, Druid**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: Time-Series DB](#deep-dive-time-series-db)

---

### 🟦 Search Engine (Elasticsearch / Solr)
> **Full-text search at scale; not a primary data store. Examples: Elasticsearch, OpenSearch, Solr**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: Search Engine](#deep-dive-search-engine)

---

## ⚡ APIs & COMMUNICATION

---

### 🟦 REST API
> **Stateless HTTP-based architecture using standard methods (GET, POST, PUT, DELETE)**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: REST API](#deep-dive-rest-api)

---

### 🟦 gRPC
> **High-performance RPC framework using HTTP/2 and Protocol Buffers (binary serialization)**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: gRPC](#deep-dive-grpc)

---

### 🟦 GraphQL
> **Query language for APIs; client specifies exactly which fields it needs**

| ✅ Strengths | ❌ Weaknesses |
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

> 🔗 [Deep Dive: GraphQL](#deep-dive-graphql)

---

### 🟦 Real-time Communication
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
| ✅ Pros | ❌ Cons |
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
| ✅ Pros | ❌ Cons |
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
| ✅ Pros | ❌ Cons |
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
| ✅ Pros | ❌ Cons |
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
| ✅ Pros | ❌ Cons |
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

> 🔗 [Deep Dive: Real-time Communication](#deep-dive-real-time-communication)

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
> **In-memory data store: Lightning-fast cache, message broker, and data structure server**

| ✅ Strengths | ❌ Weaknesses |
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

**Redis Pub/Sub:**
```
Publisher: PUBLISH channel:notification "alert"
Subscriber A: SUBSCRIBE channel:notification → receives "alert"
Subscriber B: SUBSCRIBE channel:notification → receives "alert"
Subscriber C: Not listening → misses message

Cons:
- Messages not persisted → Subscriber 4 connecting later gets nothing
- Fire-and-forget: no ack, no retry
- Limited to pattern-based routing (PSUBSCRIBE)
```
Best for: Real-time notifications, live updates, cache invalidation signals. NOT for reliable messaging.

**Redis Streams (Kafka-like):**
```
XADD events * user_id 123 action "click"
  → Entry ID: 1704067200000-0 (timestamp-sequence)
  
XREAD COUNT 1 STREAMS events 0
  → Returns: [Entry 1, Entry 2, ...]

XGROUP CREATE events group1 0
XREADGROUP GROUP group1 consumer1 STREAMS events >
  → Only unread entries, tracks consumer offset
  
Guarantees:
✓ Messages persisted (within retention window)
✓ Replay via XREAD from any point
✓ Consumer groups with offsets (exactly-once possible)
✓ Blocking reads
```
Best for: Event sourcing, activity logs, lightweight message streaming <100K events/sec.

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
> **Distributed log: event streaming platform at massive scale (LinkedIn: 4+ trillion events/day)**

| ✅ Strengths | ❌ Weaknesses |
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

### 🔶 Concurrency Control
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
| ✅ Pros | ❌ Cons |
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
  WHERE product_id = 123 AND version = 5;  -- version = 6 now ❌ UPDATE fails

Retry Transaction 2:
SELECT... version = 6, quantity = 9
UPDATE... version = 7 WHERE version = 6  -- ✅ Success
```
| ✅ Pros | ❌ Cons |
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
- User 1: UPDATE seat_booking SET booked=true WHERE seat=5 AND version=10 ✅
- User 2-10: UPDATE ...WHERE version=10 ❌ (now version=11) → retry but seat taken
Result: Seat 5 goes to userI do 1; others see booking failed

Pessimistic:
- All 10 wait for lock on seat 5
- User 1 gets lock, books, releases
- User 2 gets lock, tries to book seat 5 → "already booked"
- Users 3-10 similarly: "already booked"
But blocking caused 10s queue (unacceptable for web)
```

> 🔗 [Deep Dive: Concurrency Control](#deep-dive-concurrency-control)

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

## ⚡ DESIGN PATTERNS

---

### 🟤 Bloom Filters
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

| ✅ Pros | ❌ Cons |
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

### 🟤 Circuit Breaker
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

| ✅ Pros | ❌ Cons |
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

> 🔗 [Deep Dive: Design Patterns](#deep-dive-design-patterns)

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

# 📚 FUNDAMENTALS

---

## System Design Fundamentals

### Scaling Tiers
**Vertical Scaling (up):** Bigger machine (more CPU, RAM, disk).
- Pros: Simple (no code changes).
- Cons: Hits ceiling; expensive; SPOF.

**Horizontal Scaling (out):** More machines.
- Pros: Unlimited (add more nodes). Cost-effective.
- Cons: Complexity (coordination, consistency, partitioning).

### Request Flow
```
User Request
  → DNS (resolve domain → IP)
  → LB (pick server)
  → API Gateway (auth, rate limit, routing)
  → Service (business logic)
  → Cache (Redis? Hit → return)
  → DB (hit → return)
  → Response
```

### Replication Models
**Leader-Follower (Primary-Secondary):**
- Single writer (leader), many readers (followers).
- Pros: Strong consistency on reads.
- Cons: Leader bottleneck for writes.

**Multi-Leader (Active-Active):**
- Multiple writers (W1, W2, W3).
- Pros: Write scalability, geo-distributed.
- Cons: Conflict resolution complex.

**Leaderless (Quorum-based):**
- Any node accepts writes.
- Quorum consensus ensures consistency.
- Pros: High availability.
- Cons: Complexity; tunable consistency (W+R > N required).

### Consistency Models (Quick Recap)
| Model | Guarantee | Example |
|---|---|---|
| **Strong** | All replicas identical always | SQL primary key consistency |
| **Linearizable** | Real-time ordering of all ops | Distributed locks (Redlock) |
| **Causal** | Related events ordered | Comment replies (B's reply after A's comment always) |
| **Eventual** | Converge over time | Web cache, DNS |

### Partition Strategies
| Strategy | Pros | Cons |
|---|---|---|
| **Range** | Easy queries (e.g., "students A–M") | Hotspots (all Jan birthdays) |
| **Hash** | Balanced distribution | Resharding hard (rehash every key) |
| **Directory** | Flexible (remap without rehashing) | Directory = SPOF |
| **Geo** | Data residency (EU data in EU) | Cross-geo queries expensive |

### Monitoring & Metrics
**Golden Signals (SRE book):**
1. **Latency:** Response time (p50, p95, p99).
2. **Traffic:** Requests/sec, throughput.
3. **Errors:** Error rate (5xx responses, exceptions).
4. **Saturation:** Resource utilization (CPU, disk, connections).

Alert on: P99 latency up 2x, error rate > 1%, disk > 85%.

### Trade-offs in System Design
**CAP Theorem:** Choose 2 of 3 (Consistency, Availability, Partition-tolerance).

**PACELC:** If Partition (choose A or C) Else Latency or Consistency.
- Most systems: CP + low latency (not always possible).
- Alternative: AP + high consistency (eventual).

**Consistency vs Latency:**
- Strong consistency = slower (sync replication).
- Eventual consistency = faster (async replication).

**Cost vs Performance:**
- Premium: Spanner (ACID global), Kafka (durable), RDS multi-AZ.
- Budget: DynamoDB on-demand, Cassandra (enough replicas), SQS.

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
// 1 query for users + 100 queries for posts = 101 queries total ❌

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
