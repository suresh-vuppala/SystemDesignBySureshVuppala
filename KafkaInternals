# Apache Kafka Internals — Complete Guide

---

## Table of Contents

1. [What is Kafka Today?](#1-what-is-kafka-today)
2. [High-Level Architecture](#2-high-level-architecture)
   - [ZooKeeper Mode (Legacy)](#zookeeper-mode-legacy)
   - [KRaft Mode (Modern)](#kraft-mode-modern)
3. [Core Concepts](#3-core-concepts)
   - [Topics and Partitions](#topics-and-partitions)
   - [Leaders and Followers](#leaders-and-followers)
   - [In-Sync Replica Set (ISR)](#in-sync-replica-set-isr)
4. [The Write Path (Producer → Broker)](#4-the-write-path-producer--broker)
   - [Producer Internals](#producer-internals)
   - [Partition Selection](#partition-selection)
   - [Batching](#batching)
   - [Writing to the Log](#writing-to-the-log)
   - [Page Cache and Kernel Delegation](#page-cache-and-kernel-delegation)
   - [Replication](#replication)
   - [Acknowledgment (acks) Configuration](#acknowledgment-acks-configuration)
   - [Min In-Sync Replicas (min.insync.replicas)](#min-in-sync-replicas-mininsyncreplicass)
   - [High Watermark](#high-watermark)
   - [Metadata Propagation](#metadata-propagation)
5. [Failure Handling](#5-failure-handling)
   - [Leader Failure](#leader-failure)
   - [Duplicate Records and Idempotency](#duplicate-records-and-idempotency)
6. [Zero Copy](#6-zero-copy)
7. [The Read Path (Broker → Consumer)](#7-the-read-path-broker--consumer)
   - [Pull vs Push Model](#pull-vs-push-model)
   - [Consumer Groups](#consumer-groups)
   - [Consumer Group Protocol (Rebalancing)](#consumer-group-protocol-rebalancing)
   - [Offset Management](#offset-management)
   - [Fetch Request](#fetch-request)
   - [Batch Size Configuration](#batch-size-configuration)
   - [Committing Offsets](#committing-offsets)
8. [Key Configurations Summary](#8-key-configurations-summary)
9. [Designing Topics and Partitions](#9-designing-topics-and-partitions)
   - [Choosing Number of Partitions](#choosing-number-of-partitions)
   - [Keyed vs Non-Keyed Messages](#keyed-vs-non-keyed-messages)
   - [Number of Consumers](#number-of-consumers)
10. [Kafka as a Database?](#10-kafka-as-a-database)
11. [Recommended Production Settings](#11-recommended-production-settings)

---

## 1. What is Kafka Today?

Apache Kafka is a **streaming platform** (not just a messaging queue) that consists of several components working together:

| Component | Role |
|---|---|
| **Kafka Cluster** | Core — persists, replicates, and makes events durable. A pub/sub messaging system. |
| **Producer API** | Client library to publish events to the cluster. |
| **Consumer API** | Client library to consume events from the cluster. |
| **Kafka Connect** | Integration framework with connectors for third-party systems (e.g., MySQL, Salesforce). |
| **Kafka Streams** | A streaming library for real-time stream processing built on top of Kafka. |

---

## 2. High-Level Architecture

### ZooKeeper Mode (Legacy)

```
┌────────────────────────────────────────────────────────┐
│  ZooKeeper Ensemble                                     │
│  (Metadata store: topics, partitions, users, configs)  │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│  Broker Pool                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │Broker 1 │  │Broker 2 │  │Broker 3 │  ← one elected  │
│  │         │  │(Controller)│ │        │    as Controller│
│  └─────────┘  └─────────┘  └─────────┘                 │
└────────────────────────────────────────────────────────┘
```

- **ZooKeeper** acts as a coordination/metadata store.
- One broker is elected as the **Controller** — the "brain" of the cluster that handles partition leadership, broker failures, and reassignment.
- **Drawback:** Loading all metadata from ZooKeeper into memory on startup takes a long time and becomes a bottleneck at scale.

---

### KRaft Mode (Modern)

```
┌──────────────────────────────────────────────────────┐
│  KRaft Controller Quorum (3 or 5 nodes)               │
│  Uses a modified Raft consensus algorithm             │
│  (No more ZooKeeper dependency)                       │
└──────────────────────────┬───────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────┐
│  Broker Pool                                          │
│  (Same role as before — store and serve data)         │
└──────────────────────────────────────────────────────┘
```

- ZooKeeper is eliminated.
- The controller is now built into Kafka itself, using a variant of the **Raft consensus algorithm**.
- Benefits: simpler deployment, better performance, faster startup, no ZooKeeper bottleneck.

---

## 3. Core Concepts

### Topics and Partitions

- A **Topic** is a logical name + metadata grouping. It has no physical meaning on its own.
- Data is physically stored in **Partitions**, which are distributed across brokers.
- Partitions enable **horizontal scalability** — more partitions = higher throughput potential.
- Internally, Kafka only understands partitions. Topics are just a logical abstraction on top.

```
Topic: "orders"
  ├── Partition 0  → stored on Broker 1
  ├── Partition 1  → stored on Broker 2
  └── Partition 2  → stored on Broker 3
```

### Leaders and Followers

- Each partition has exactly **one leader** and zero or more **followers** (replicas), depending on the replication factor.
- The leader handles all reads and writes for that partition.
- Followers replicate data from the leader to provide fault tolerance.
- Kafka is a **leader-based architecture** at the partition level.

### In-Sync Replica Set (ISR)

- The **ISR** is the set of follower replicas that are considered "caught up" with the leader.
- A replica is in the ISR if it continuously fetches from the leader and stays within a configurable lag boundary.
- If a follower falls too far behind, it is **kicked out of the ISR**.
- The ISR is central to how Kafka guarantees durability.

---

## 4. The Write Path (Producer → Broker)

### Producer Internals

When you call the produce API in your application, the following sequence happens:

```
Application
    │
    ▼
[1] Determine target partition (key hash or custom partitioner)
    │
    ▼
[2] Append record to internal producer buffer
    │
    ▼
[3] Flush buffer → send ProduceRequest to partition leader
    │
    ▼
[4] Leader validates record and appends to local log
    │
    ▼
[5] Followers pull (fetch) the data from leader and replicate
    │
    ▼
[6] Leader waits for ISR acknowledgment (based on acks config)
    │
    ▼
[7] ProduceResponse sent back to producer
```

---

### Partition Selection

When a record has a **key**:
- Default: `hash(key) % numPartitions` → determines partition.
- This is **pluggable** — you can implement your own custom partitioner.

When a record has **no key**:
- A partition is selected randomly / in round-robin.

---

### Batching

- The producer does **not** send one record per network call — it accumulates records into a **batch** and sends them together.
- This maximizes network bandwidth utilization.
- The batch can be sent:
  - Immediately (low latency mode), or
  - After a configurable delay / buffer fill threshold (high throughput mode).

---

### Writing to the Log

- Each partition is backed by an **append-only log on disk**.
- Every batch written to the log gets a unique **offset** (a monotonically increasing integer).
- The broker does **not** maintain an in-memory cache of records — it delegates caching entirely to the OS.

---

### Page Cache and Kernel Delegation

One of the most important early design decisions in Kafka:

> **Kafka relies heavily on the OS page cache instead of managing its own cache.**

- The broker writes as fast as possible to the **page cache**.
- The kernel accumulates writes in the page cache and flushes larger chunks to disk periodically.
- **Benefits:**
  - Fewer, larger disk writes → higher efficiency.
  - Simpler broker internals (no need for a custom caching layer).
  - The kernel is highly optimized for this pattern.

---

### Replication

- Replication in Kafka is **pull-based from followers**, not push-based from the leader.
- Each follower runs a **fetch thread** that continuously issues fetch requests to the leader.
- The fetch request used by followers is the **same type** as the one used by consumers.
- The follower sends the next fetch request to implicitly acknowledge what it has already written.

```
Leader (Broker 1)
   ↑  ↑  ↑
   │  │  │  ← Followers continuously pull (fetch) from leader
Broker 2  Broker 3  Broker 4
```

---

### Acknowledgment (acks) Configuration

Controls when the leader considers a ProduceRequest "done" and replies to the producer.

| `acks` value | Meaning | Durability | Latency |
|---|---|---|---|
| `0` | Fire and forget — no acknowledgment | Very low | Very low |
| `1` | Acknowledge after leader writes to local log | Medium | Low |
| `all` (or `-1`) | Acknowledge only after **all ISR members** have committed | High | Higher |

> ⚠️ **Important:** `acks=all` alone is not sufficient if the ISR has shrunk to 1 replica. See `min.insync.replicas` below.

---

### Min In-Sync Replicas (min.insync.replicas)

- Configured at the broker or topic level.
- Specifies the **minimum number of replicas** that must be in the ISR before a ProduceRequest is accepted.
- Used in combination with `acks=all` for strong durability guarantees.

**Example:**
- `replication.factor = 3`
- `min.insync.replicas = 2`
- `acks = all`

This means: the produce request will only succeed if at least **2 replicas** (including the leader) have committed the data. Even if 1 broker goes down, the system continues accepting writes safely.

> If `min.insync.replicas` is not set, `acks=all` could succeed with only the leader — defeating the purpose of replication.

---

### High Watermark

The **High Watermark (HW)** is a single offset number that represents the point up to which all ISR members have committed data.

- It is the **minimum end offset across all ISR replicas**.
- Stored **in memory only** (not persisted to disk) — it can always be recomputed from the logs on recovery.
- Consumers can only read up to the High Watermark — they cannot read uncommitted records.

```
Leader log:     offset 1 ... 160  (latest written)
Follower A:     offset 1 ... 152
Follower B:     offset 1 ... 155
Follower C:     offset 1 ... 160

High Watermark = min(152, 155, 160) = 152
```

When a pending ProduceRequest is waiting in the **purgatory** (an in-memory data structure on the broker), the leader checks whether the High Watermark has advanced enough to satisfy the `acks` requirement, and only then responds to the producer.

---

### Metadata Propagation

Before sending a ProduceRequest, the producer needs to know **which broker is the leader** for the target partition.

- Every broker knows the full cluster metadata and exposes an API to retrieve it.
- The producer **caches** this metadata and refreshes it periodically.
- On connection errors or timeouts, the producer triggers a **metadata refresh** to rediscover the current leader.
- This cache is **eventually consistent** — there can be brief periods of stale metadata during leader elections.

---

## 5. Failure Handling

### Leader Failure

When a leader broker fails:

1. The broker stops sending heartbeats to the **Controller**.
2. After a timeout, the Controller marks the broker as dead.
3. The Controller **elects a new leader** from the current ISR members.
4. The Controller propagates the new leader information to all brokers.
5. Followers are instructed to replicate from the new leader.
6. The old leader, when it comes back, will **truncate any uncommitted records** that were not replicated before the failure.

**From the producer's perspective:**
- The in-flight ProduceRequest will get a timeout or connection error.
- The producer must **retry** the request.
- There is no data loss for records that were fully committed to the ISR before the failure.

---

### Duplicate Records and Idempotency

A retry after a leader failure can cause **duplicate records** if the original request was actually committed but the acknowledgment was never received.

**Solutions:**

- **Idempotent Producer** (`enable.idempotence=true`): The broker assigns each producer a unique ID and tracks sequence numbers, deduplicating retried records automatically.
- **Transactions**: Provides exactly-once semantics across multiple partitions and topics.

> The architectural philosophy is: **let the consumer or the storage layer deal with duplicates**, rather than complicating the broker protocol.

---

## 6. Zero Copy

Kafka uses **zero copy** optimization on the **read (consume) path**, not the write path.

**Normal (non-zero-copy) read flow:**
```
Disk → Kernel space → User space → Kernel space (network) → Network
                      ↑ extra copy here
```

**Zero-copy read flow (via `sendfile` syscall):**
```
Disk → Kernel space → Network
       (direct transfer, no user space involvement)
```

- When serving fetch requests to consumers, Kafka uses `sendfile` to transfer data directly from disk to the network socket.
- This eliminates a copy and reduces CPU usage significantly.
- **Write path** uses a normal `write` syscall (data goes through user space) since Kafka needs to process and validate incoming records.

---

## 7. The Read Path (Broker → Consumer)

### Pull vs Push Model

Kafka uses a **pull-based model** — consumers poll the broker for new data.

| Aspect | Pull (Kafka's choice) | Push |
|---|---|---|
| Offset tracking | Done by the consumer | Must be done by the broker |
| Broker complexity | Simple — broker just stores data | Complex — broker tracks consumer state |
| Scale | Easy — broker is stateless per consumer | Hard — broker becomes a bottleneck |
| Consumer failure recovery | Consumer re-fetches from last committed offset | Broker must track and replay |

> **Key insight:** The pull model moves offset tracking responsibility entirely to the consumer, keeping the broker simple and stateless w.r.t. consumption progress.

---

### Consumer Groups

- A **Consumer Group** is a logical group of consumers that collectively consume a topic.
- Each partition is assigned to **exactly one consumer** within a group at any time.
- Multiple consumer groups can independently consume the same topic — each group maintains its own offsets.

```
Topic "orders" (10 partitions)

Consumer Group A (Notifications Service)
  ├── Consumer 1 → Partitions 0, 1
  ├── Consumer 2 → Partitions 2, 3
  └── ...

Consumer Group B (Analytics Service)
  ├── Consumer 1 → Partitions 0, 1, 2, 3, 4
  └── Consumer 2 → Partitions 5, 6, 7, 8, 9
```

---

### Consumer Group Protocol (Rebalancing)

When consumers join or leave a group, a **rebalance** is triggered to redistribute partitions. This is a two-phase protocol:

**Phase 1: JoinGroup**
1. All consumers send a `JoinGroup` request to the **Group Coordinator** (a service hosted on one of the brokers).
2. The Group Coordinator selects one consumer as the **group leader**.
3. The group leader receives all member subscriptions and computes the partition assignment.

**Phase 2: SyncGroup**
1. All consumers send a `SyncGroup` request to the Group Coordinator.
2. The group leader includes the computed assignment in its SyncGroup request.
3. The Group Coordinator distributes the assignment to all members via SyncGroup responses.
4. Consumers begin consuming their assigned partitions.

**In parallel:** Each consumer sends periodic **heartbeats** to the Group Coordinator to signal it is alive and healthy.

---

#### Assignment Strategies

| Strategy | Behavior | Caveat |
|---|---|---|
| **Range Assigner** (default) | Aligns partitions across topics — first N partitions of all subscribed topics go to consumer 1, etc. Useful for joining across topics. | On any rebalance event (failure, scale-in/out), **all consumption stops** until rebalance completes. Can take minutes. |
| **Cooperative Sticky Assigner** | Allows consumers to continue processing during a rebalance. Only partitions that need to move are revoked. | More complex but much better for production. |

> A brand new consumer group protocol (KIP) is being developed to replace the current one, focused on stability and scalability at large group sizes (1000+ members).

---

### Offset Management

An **offset** is a unique, monotonically increasing integer that identifies each record within a partition.

- When a consumer group starts fresh:
  - It starts from the **beginning** (`auto.offset.reset=earliest`), or
  - It starts from the **end** (`auto.offset.reset=latest`).
- When a consumer group **rejoins** (after a restart or rebalance):
  - The consumer asks the Group Coordinator for the **last committed offset** for each assigned partition.
  - Consumption resumes from that offset.

---

### Fetch Request

Once assigned partitions and starting offsets are known, consumers issue **FetchRequests** to the partition leader:

```
FetchRequest {
  partition: 3,
  startOffset: 100,
  maxBytes: 10MB,         // max total bytes for the request
  maxBytesPerPartition: 1MB  // max bytes per partition
}
```

- If data is available at the requested offset → the leader responds immediately with a batch of records.
- If no data is available (consumer is caught up) → the request enters the **purgatory** and waits up to a configurable timeout (default: 500ms) before returning an empty response.
- Consumers can only read up to the **High Watermark** — uncommitted records are not visible.

---

### Batch Size Configuration

- Kafka does not let you request "N records." You request **N bytes**.
- This is because data is written to the log in **batches** (which may be compressed). A batch is an indivisible unit on disk.
- The consumer unwraps the batch and delivers individual records to the application transparently.

**Key consumer fetch configurations:**

| Config | Default | Description |
|---|---|---|
| `fetch.max.bytes` | ~50MB | Max bytes per FetchRequest |
| `max.partition.fetch.bytes` | 1MB | Max bytes per partition per FetchRequest |
| `fetch.max.wait.ms` | 500ms | Max wait time if no data is available |

> In most cases, defaults work well. Only tune these if you have specific throughput or latency requirements and have profiled the issue.

---

### Committing Offsets

After processing records, consumers **commit offsets** to the Group Coordinator to checkpoint their progress.

```
Consumer processes records up to offset 250
    │
    ▼
CommitOffsetRequest → Group Coordinator
    │
    ▼
Group Coordinator persists: {group: "notifications", partition: 3, offset: 251}
```

**Commit strategies:**

| Strategy | Description | Risk |
|---|---|---|
| **Auto commit** | Kafka commits every N ms automatically | May commit before processing is complete → data loss on failure |
| **Manual commit (sync)** | Application explicitly calls `commitSync()` after processing | Safe but adds latency |
| **Manual commit (async)** | Application calls `commitAsync()` | High throughput, but requires retry logic |
| **Periodic manual commit** | Commit every X records or every X seconds | Good balance for most use cases |

> You can choose to commit every message, every few seconds, or any interval that fits your use case.

---

## 8. Key Configurations Summary

### Producer Configurations

| Config | Recommended (Production) | Description |
|---|---|---|
| `acks` | `all` | Wait for full ISR acknowledgment |
| `min.insync.replicas` | `2` | Require at least 2 replicas to be in sync |
| `replication.factor` | `3` | 3 copies of every partition |
| `enable.idempotence` | `true` | Prevent duplicates on retry |
| `linger.ms` | depends | Delay before flushing batch (higher = bigger batches) |
| `batch.size` | depends | Max bytes in a batch |

### Consumer Configurations

| Config | Default | Description |
|---|---|---|
| `auto.offset.reset` | `latest` | Where to start if no committed offset exists |
| `fetch.max.bytes` | ~50MB | Max bytes per FetchRequest |
| `max.partition.fetch.bytes` | 1MB | Max bytes per partition per fetch |
| `fetch.max.wait.ms` | 500ms | Wait time when no data is available |
| `enable.auto.commit` | `true` | Auto-commit offsets periodically |
| `auto.commit.interval.ms` | 5000ms | Interval for auto-commit |
| `partition.assignment.strategy` | Range | Partition assignment algorithm |

---

## 9. Designing Topics and Partitions

### Choosing Number of Partitions

This is more art than science, but here are the guiding principles:

**If you use key-based partitioning:**
- Partition count is **fixed at creation time** (changing it breaks key → partition mapping).
- **Over-provision**: It's better to start with more partitions (e.g., 50 rather than 5) if you're unsure of throughput.
- Think about peak throughput and consumer parallelism requirements upfront.

**If you do NOT use key-based partitioning:**
- You can add partitions later without any ordering concerns.
- Scale out as needed.

### Keyed vs Non-Keyed Messages

| Scenario | Use Key? | Reason |
|---|---|---|
| Stream processing with aggregations | ✅ Yes | All records for the same entity (e.g., customer) go to the same partition → one consumer handles all state for that key |
| Ordering guarantee required | ✅ Yes | Single partition guarantees order for a key |
| Microservice event bus (no ordering needed) | ❌ No | Random distribution for load balancing |
| Simple data pipeline | ❌ No | Flexibility to add partitions later |

> **Important:** If ordering matters (e.g., `ORDER_CREATED` before `ORDER_SHIPPED`), you must use keyed messages so all events for the same order go to the same partition.

### Number of Consumers

- Maximum **useful** consumers in a group = number of partitions.
- Extra consumers beyond that count sit **idle** (no partition assigned).
- Typical pattern: fewer consumers than partitions, each consumer handles multiple partitions.
- Hundreds/thousands of consumer group members can trigger instability in the rebalance protocol (being fixed in new KIP).

---

## 10. Kafka as a Database?

Kafka is **not a traditional database** (no tables, no SQL), but it shares a key internal component with databases:

| Feature | Databases | Kafka |
|---|---|---|
| Commit log | ✅ Yes | ✅ Yes (the core of Kafka) |
| Transactions (ACID) | ✅ Yes | ✅ Partial (Kafka transactions exist but are scoped) |
| Queryable materialized views | ✅ Yes | ❌ Not natively |
| Horizontal scalability | Varies | ✅ Yes |

> **David's view:** Kafka provides the **core commit log** that underpins databases. Combined with a materialization layer (like Kafka Streams or ksqlDB), you can build a database-like system on top of Kafka.

Kafka **enables** you to build purpose-built database-like systems for your specific use case rather than being one itself.

---

## 11. Recommended Production Settings

For maximum **durability and correctness**, use:

```properties
# Producer
acks=all
enable.idempotence=true

# Topic / Broker
replication.factor=3
min.insync.replicas=2
```

This ensures:
- Data is written to at least **2 replicas** before acknowledgment.
- Even if 1 broker dies, no committed data is lost.
- Retried produce requests do not create duplicates.

> If you diverge from these settings, make sure you understand *exactly* what guarantees you are giving up and why it is acceptable for your use case.

---

## Architecture Flow Diagram

```
PRODUCERS
   │
   │ ProduceRequest (batched, keyed/unkeyed)
   ▼
┌─────────────────────────────────────────────────────┐
│                   BROKER POOL                        │
│                                                      │
│  Partition Leader                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │ 1. Validate record                           │   │
│  │ 2. Write to page cache (append-only log)     │   │
│  │ 3. Wait in purgatory                         │   │
│  │ 4. Followers fetch & replicate               │   │
│  │ 5. High Watermark advances                   │   │
│  │ 6. Send ProduceResponse to producer          │   │
│  └──────────────────────────────────────────────┘   │
│       │ Fetch (pull)  │ Fetch (pull)                 │
│  Follower 1      Follower 2                          │
│  (ISR member)    (ISR member)                        │
└─────────────────────────────────────────────────────┘
   │
   │ FetchRequest (offset-based, byte-limited)
   ▼
CONSUMERS (Consumer Groups)
   │
   ├── Group Coordinator manages:
   │     • Partition assignment
   │     • Offset commits
   │     • Heartbeat / liveness
   │
   └── Each consumer: fetch → process → commit offset → repeat
```

---

*This document covers the full internals of Apache Kafka including the write path, read path, replication, fault tolerance, consumer group protocol, and key production configurations.*
