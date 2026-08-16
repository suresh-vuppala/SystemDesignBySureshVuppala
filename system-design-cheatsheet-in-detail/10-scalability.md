# Scalability Patterns — Live Session Script
### 10 Topics · Spoken Delivery · Under-the-Hood · Interview-Ready

**This is a speaking script, not a reference doc.** The prose is written the way you'd actually say it out loud in a session — short sentences, one idea at a time, and every term explained the moment it appears. You can read paragraphs almost verbatim and they'll sound natural.

Each topic follows the same rhythm, because that rhythm is what makes concepts stick:

> **Set up a problem the room feels** → let them sit with it → **reveal the mechanism** → show where it breaks → **hand off to the next topic that fixes it.**

**Script conventions you'll see throughout:**

| Marker | What to do with it |
|---|---|
| 🗣️ **Say this** | Spoken opener — read it aloud almost as written to set the scene |
| ❓ **Ask the room** | Stop and take answers. Do not answer it yourself for ~10 seconds. |
| ✋ **Pause here** | Let the tension sit before you reveal the solution. Resist filling the silence. |
| 🔁 **Bridge** | The verbal transition into the next topic — keeps the session feeling like one story |
| ⚠️ **Common pushback** | The objection someone in the room will raise, and how to handle it |

Every topic is also scoped explicitly: what it solves, and what it **doesn't**. When something is out of scope you'll see a pointer to the topic that owns it. That framing is deliberate — it's what stops learners from using these terms interchangeably.

---

## 📑 Topics

1. [Partitioning](#1-partitioning)
2. [Distributed Indexing](#2-distributed-indexing)
3. [Replication](#3-replication)
4. [Sharding](#4-sharding)
5. [Consistent Hashing](#5-consistent-hashing)
6. [Bloom Filters](#6-bloom-filters)
7. [Rate Limiting](#7-rate-limiting)
8. [Backpressure](#8-backpressure)
9. [Auto-Scaling](#9-auto-scaling)
10. [Graceful Degradation](#10-graceful-degradation)

---

## 1. Partitioning

**What it solves:** slow queries on a massive single table, within one database server.
**What it does NOT solve:** write throughput limits — that's sharding (topic 4). Server capacity limits — also sharding.

> 🗣️ **Say this to open:**
> "Let's start somewhere uncomfortable. You've got an orders table. It's been in production five years. Two billion rows. And this morning someone from finance ran a report that took forty minutes and slowed down checkout for everybody.
>
> Nobody wrote bad code. The query is a simple WHERE clause on a date. So what actually went wrong?"

> ❓ **Ask the room:** "What do you think the database is physically doing when it runs that query?"
>
> You'll usually get "it scans the table." Good — push once more: *"Scans it how? What's the smallest thing it can read off the disk?"* Most people have never been asked that. That's the doorway into pages, and pages are what makes the rest of this module make sense.

### Start here: what does a database actually store on disk?

When you create a table and insert rows, the database doesn't keep everything in one giant file. It writes rows into fixed-size **pages** — typically 8KB in Postgres, 16KB in MySQL. A page is the smallest unit the DB reads from disk. If you want one row, the DB still reads the entire page that contains it.

Now imagine your `orders` table has 2 billion rows spread across millions of these pages. A query like "show me orders from January 2024" forces the DB to scan every single page to find which ones contain January rows. That's a **full table scan** — the most expensive operation in a database. It reads terabytes of data just to find a few million matching rows.

Partitioning solves this by physically grouping related rows into **separate storage segments** (each with their own set of pages), so the engine can skip entire segments without reading them.

Put simply: instead of storing all the data together in one large pool of pages, partitioning splits it into **separate storage segments** based on a rule you define.

---

### What "skip most of them" actually means — Partition Pruning

When you partition an `orders` table by year, the engine creates three separate physical storage areas:

```
orders_p2022  ← its own pages on disk, only 2022 rows
orders_p2023  ← its own pages, only 2023 rows
orders_p2024  ← its own pages, only 2024 rows
```

To your application it still looks like one table called `orders`. But internally, the DB maintains a **partition map** — a small catalog that says "p2022 contains rows where created_at is between Jan 1 2022 and Dec 31 2022."

When you run `SELECT * FROM orders WHERE created_at >= '2024-01-01'`, the query planner reads the partition map first, compares your WHERE clause against each partition's range, and decides: "p2022 and p2023 can't possibly contain 2024 rows." It eliminates them without reading a single page. This elimination is called **partition pruning**.

The query then reads only `orders_p2024` — maybe 5% of the total data. That's the entire value proposition of partitioning.

---

### Where partitioning sits vs indexes

Partitioning is often confused with indexing. They solve different problems, and the cleanest way to keep them straight:

```
Query arrives
     │
     ▼
① Partitioning ──────── "Which chunks can I ignore completely?"
     │                   → prunes whole segments before any search
     ▼
② Clustered Index ───── "How are the surviving rows laid out on disk?"
     │                   → makes range reads sequential, not scattered
     ▼
③ Non-Clustered Index ─ "Where exactly is the specific row I want?"
```

The key distinction: partitioning **removes irrelevant chunks** so there's less data to consider. It does *not* make row fetches sequential — that's the clustered index's job, by physically storing rows in key order.

> Full walkthrough of the index → clustered index → partitioning progression (with the page-level mechanics and the three things people commonly get wrong) is in the **Storage module — Database Indexing**.

---

### Horizontal vs Vertical Partitioning — the internal difference

**Horizontal partitioning** (splitting rows) — each partition has the same column structure, just different rows. The pages in each partition look identical in format, just containing a different slice of the data.

```
orders table schema:  id | amount | customer_id | created_at
orders_p2022 pages:   ... rows where year(created_at) = 2022 ...
orders_p2023 pages:   ... rows where year(created_at) = 2023 ...
```

The DB engine rewrites your INSERT statement internally: `INSERT INTO orders (...)` becomes `INSERT INTO orders_p2024 (...)` after evaluating which partition the row belongs to. This is transparent — your application never sees it.

**Vertical partitioning** (splitting columns) — the same row is physically stored in two separate tables, split by which columns are accessed together.

```
users_core:   id | name | email | is_active    ← 40 bytes per row
users_profile: id | bio | avatar_blob          ← 50,000 bytes per row
```

Here's why this matters at the page level: if all columns are in one table, loading any row means reading a page that contains the full 50,040 bytes per row. Your "hot" query that only needs `name` and `is_active` is loading 50,000 bytes of blob data into memory just to extract 40 bytes of useful data. With vertical partitioning, the hot-path pages only contain 40-byte rows — you fit 200 rows per 8KB page instead of 0 rows (the blob won't even fit). Fewer pages read = faster queries.

> **Follow-up you'll get:** "Is vertical partitioning just two tables?" — Effectively yes. Some engines call it "table splitting" and you manage it yourself as separate tables joined by ID. A few column-store databases (like Redshift, BigQuery) do this automatically — they physically store each column separately, which is why they're so fast at aggregations: `SELECT AVG(price) FROM orders` reads only the price column's pages, ignoring everything else.

---

### The three partitioning strategies — what the engine does with each

**Range partitioning** — the partition map stores a min/max boundary per partition.

```
Partition map:
  p_jan: created_at >= '2024-01-01' AND < '2024-02-01'
  p_feb: created_at >= '2024-02-01' AND < '2024-03-01'
  ...
```

On INSERT, the engine evaluates the partition key value against these boundaries and routes the row to the matching partition. On SELECT, it prunes by comparing your WHERE clause bounds against the partition map. This is O(log n) in the number of partitions — fast.

The risk is **skew**: if most of your data clusters in one range (e.g., most orders are from this month), one partition handles all the I/O while others sit empty.

**Hash partitioning** — the engine applies a deterministic hash function to the partition key, then takes modulo of the number of partitions: `partition = hash(order_id) % 4`.

The hash function is chosen to distribute values uniformly across the range, so regardless of whether order_ids are sequential integers or random UUIDs, each partition gets roughly the same number of rows. Even distribution = no skew.

The cost: there's no ordering in the result. Rows with consecutive order_ids end up in completely different partitions. A query like "all orders from last week" can't be pruned — the engine doesn't know which partition "last week" maps to, so it reads all of them.

**List partitioning** — the partition map is an explicit value-to-partition dictionary.

```
Partition map:
  p_americas: country IN ('US', 'CA', 'MX', 'BR')
  p_europe:   country IN ('DE', 'FR', 'GB', 'IT')
  p_asia:     country IN ('IN', 'JP', 'SG', 'AU')
```

On INSERT, the engine looks up the country value in this dictionary and routes accordingly. On SELECT with `WHERE country = 'DE'`, it prunes to `p_europe` only. Clear, explicit, auditable — important for GDPR compliance where you need to prove EU data never left EU storage.

---

### The hotspot problem — and the ugly fix that works

A social platform partitions posts by `post_id`. A celebrity publishes a post that gets 10 million views in an hour. All reads go to the single partition containing that `post_id`. The partition's pages are being read from disk hundreds of times per second while every other partition is idle.

This is a **hotspot** — uneven load distribution where one partition does most of the work. Partitioning doesn't prevent it because the problem is in the data distribution, not the partition design.

The fix is deliberate key salting:

```
Instead of post_key = post_42
Write 10 copies: post_42_0, post_42_1, ..., post_42_9
```

Now 10 different partitions each hold a copy. Reads are routed by `hash(request_id) % 10` — load spreads evenly. On aggregate reads (get total view count), you query all 10 and sum. You traded read simplicity for write survivability.

> **Follow-up you'll get:** "Does partitioning help with write throughput?" — No, and this is a critical distinction. All partitions still share the same server's CPU, RAM, disk I/O, and network. Adding a partition doesn't add any of those resources. Partitioning helps with *query performance* (pruning) and *maintenance* (drop old partition in milliseconds). If your writes are saturating the server itself, that's not a partitioning problem — that's a **sharding** problem (topic 4), where you actually move partitions onto different servers.

### The four things to land before you move on

If the room remembers only four sentences from this topic, make them these.

**Partition pruning is the whole point.** The planner skips irrelevant partitions entirely — not just rows, entire physical storage segments. That's the difference between reading 5% of your data and 100%.

**Cross-partition queries are expensive.** A query touching multiple partitions has to read each one independently and merge the results — scatter-gather. Keep these off the hot path. Say it plainly: *design your partition key to match the query you run most.*

**Changing your mind later is painful.** Switching from monthly to weekly partitions, or range to hash, means recreating the table. Emphasise this — it's the decision people regret most.

**Writes to different partitions don't fight each other.** No cross-partition locking, so two inserts into different partitions run in parallel. That's the write-concurrency benefit — and it's the one thing partitioning *does* give you on the write side.

> 🔁 **Bridge into topic 2:**
> "So partitioning cut our data down. Good. But notice what we quietly assumed — that every query filters on the partition key. Date, in our case.
>
> Now what happens when someone queries by something else entirely? Customer email. City. Status. The partition key doesn't help us at all anymore. And that's where indexes come in — except in a distributed world, indexes get strange."

---

## 2. Distributed Indexing


> 🗣️ **Say this to open:**
> "In a single database, indexes are boring. You add one, queries get fast, everyone's happy.
>
> The moment your data lives on four different machines, you have to answer a question that didn't exist before: **where does the index live?** And there are only two possible answers — and they have completely opposite performance profiles."

> ❓ **Ask the room:** "If your users table is split across four servers and I ask for everyone in New York — what has to happen?"
>
> Let them work it out. Someone will say "check all four." That's exactly right, and it's the local index model. Name it for them once they've said it — it lands much harder that way than if you name it first.

**What it solves:** query performance when data is split across multiple nodes — how do you find rows without scanning everything?
**What it does NOT solve:** the initial splitting of data — that's partitioning (topic 1) or sharding (topic 4).

### First — what is a database index, at the storage level?

An index is a separate data structure that the DB maintains alongside your table's pages. The most common structure is a **B-tree** — a balanced tree where each node contains sorted key values and pointers to the next level, down to leaf nodes that contain the actual row pointers (page number + slot within that page).

```
B-tree index on city column:
         [M]
        /    \
    [F, J]   [R, Z]
   /  |  \   /  \
[A-E][G-I][K-L] ... [S-Q][T-Z]
  ↓                      ↓
page#14, slot 3     page#7, slot 1
```

When you query `WHERE city = 'NYC'`, the engine traverses this tree in O(log n) steps and gets back a set of page+slot pointers. It reads exactly those pages. Without the index, it reads every page in the table to check each row's city value.

Now scale that to a distributed system where the table's pages are spread across 4 different servers. Where does this B-tree index live?

---

### Local Index — each node indexes only its own pages

Each node builds and maintains a B-tree index over only the rows it physically stores. Node 1's index only knows about rows on Node 1. It has no visibility into what's on Nodes 2, 3, or 4.

```
Node 1 index (city): Austin→row5, NYC→row2, NYC→row8
Node 2 index (city): LA→row1, NYC→row3
Node 3 index (city): Chicago→row6
Node 4 index (city): (no NYC users here)
```

A query for `WHERE city = 'NYC'` must go to **all 4 nodes**, each traverses its local B-tree, and the results are merged at the query coordinator. This is called **scatter-gather**: scatter the query to all nodes, gather the results back.

The write path is fast: inserting a user on Node 1 updates only Node 1's index. No network hop. No coordination with other nodes.

> Cassandra, DynamoDB local secondary indexes, MongoDB sharded collections, and Postgres with logical partitioning all use this model. It's the default because it keeps writes simple.

---

### Global Index — one index structure spans all nodes

A global index is a separate data structure (often itself sharded across nodes) that maintains a mapping from any column value to the exact node and row where data lives.

```
Global index (city):
  NYC → [Node1:row2, Node1:row8, Node2:row3]
  LA  → [Node2:row1]
  Chicago → [Node3:row6]
```

A query for `WHERE city = 'NYC'` hits the global index once, gets back `[Node1, Node2]`, and reads only those two nodes. No scatter to Node 3 or Node 4.

The write path is more expensive: inserting a user on Node 1 must also update the global index — which lives somewhere else on the network. That's a cross-node write. And you have to decide: do you update the global index synchronously (strong consistency, slower writes) or asynchronously (faster writes, but the index briefly points to stale data)?

DynamoDB's Global Secondary Index (GSI) is async by default. Their documentation explicitly says reads against a GSI are "eventually consistent." This means for a short window after a write, the GSI might not reflect it yet.

> **Follow-up you'll get:** "Which should I use?" — Ask yourself: what does my query pattern look like? If you almost always query by the partition key (e.g., `user_id`), a local index is all you need — fast both ways. If you frequently query by a non-partition column (city, category, status), you either accept scatter-gather with a local index or pay the write coordination cost of a global index. For full-text search (keyword matching in messages or product descriptions), neither is great — you hand that to **Elasticsearch**, which builds its own distributed inverted index. An inverted index is different from a B-tree: instead of "row→value", it stores "value→list of rows", optimized for fast keyword lookups across large text.

---

> 🔁 **Bridge into topic 3:**
> "Notice that everything in the last two topics was about making reads *fast*. Partitioning, indexes — all performance.
>
> We haven't said a single word about what happens when a machine dies. And every one of these designs still has exactly one copy of your data."

## 3. Replication

> 🗣️ **Say this to open:**
> "Everything we've discussed so far assumes one thing: that the server is up.
>
> So let's remove that assumption. It's 2am. The disk on your primary database dies. Right now — with what we've built so far — what do you have?
>
> Nothing. No data, no service, no customers. That's the problem replication exists to solve. But the interesting part isn't *copy the data somewhere* — everyone gets that. The interesting part is one specific decision that changes everything downstream."

> ❓ **Ask the room:** "When you write a row and the database says *success* — how many machines have that data at that exact moment?"
>
> ✋ **Pause here.** Most people have never thought about it. The honest answer is *it depends entirely on how you configured replication* — and that single choice determines whether you can lose data, and how slow your writes are. That's the whole topic in one question.

**What it solves:** single server as a single point of failure — availability, fault tolerance, read scalability.
**What it does NOT solve:** write throughput limits or storage capacity — that's sharding (topic 4). Consistency between replicas is a trade-off this topic introduces, not solves.

### What a replica actually is, under the hood

Every write to a database goes through a **WAL (Write-Ahead Log)** first. The WAL is a sequential append-only file on disk. Before the DB changes any page, it writes the intended change to the WAL. If the server crashes mid-write, the WAL lets the DB recover — it replays the log to reconstruct the committed state.

Replication is built on top of this: the primary server **streams its WAL to follower servers** in near-real-time. Each follower replays those WAL entries in order, applying the same changes to its own pages. The follower ends up with an identical copy of the data.

This is how Postgres streaming replication, MySQL binlog replication, and MongoDB oplog replication all work. The format differs (WAL in Postgres, binary log in MySQL, oplog in Mongo) but the concept is the same: stream the log, replay the operations.

```
Primary:
  WAL entry LSN-1001: INSERT INTO orders (id=555, amount=99)
  WAL entry LSN-1002: UPDATE users SET last_order=555 WHERE id=42
  WAL entry LSN-1003: ...
  → streams to followers

Follower A (LSN: 1003 — caught up)   ← data is fresh
Follower B (LSN: 1001 — 2 behind)    ← slightly stale
```

**LSN** (Log Sequence Number) is the position in the WAL. The gap between the primary's LSN and a follower's LSN is the **replication lag** — how far behind the follower is. Usually milliseconds. Under heavy write load, it can be seconds.

---

### The three replication modes — when does the client hear back?

**Synchronous replication** — the primary writes to its WAL, applies the change, then waits for every configured follower to confirm they've written and applied the same WAL entry before responding to the client.

```
Client writes → Primary (WAL + apply) → waits for Follower ACK → responds to client
```

Zero data loss: if the primary dies the moment after responding, every follower already has the data. But the client's write latency is bounded by the *slowest* follower in the cluster, including followers in distant regions.

**Asynchronous replication** — the primary writes to its WAL, applies the change, and immediately responds to the client. WAL streaming to followers happens in the background, on its own schedule.

```
Client writes → Primary (WAL + apply) → responds immediately
                Primary → streams WAL to followers (background)
```

Fastest possible writes. The risk: if the primary crashes before the WAL entry reaches any follower, those writes are permanently lost. The follower that gets promoted has an older WAL — it never saw the last few entries.

**Semi-synchronous replication** — the primary waits for at least one follower to acknowledge, then responds. The rest catch up asynchronously.

Best of both in practice: you have at least two copies at the moment of success (primary + one follower), which is usually enough durability, without the latency penalty of waiting for every replica.

---

### Replication lag anomalies — what "eventually consistent" actually means

Because followers replay the WAL slightly behind the primary, they're serving slightly old data during that window. This creates three specific problems worth naming.

**Read-after-write anomaly:** A user updates their profile photo. The write goes to the primary (primary WAL entry LSN-5000). The page refresh hits a follower still at LSN-4995. The user sees their old photo. From their perspective, the update "didn't work." Fix: after a user's own write, route that user's next few reads to the primary for a short window (or until the follower catches up, tracked by LSN).

**Monotonic reads violation:** A user loads their timeline — hits Follower A (LSN-5000, fresh) and sees a post. Refreshes — hits Follower B (LSN-4990, lagging) and the post disappears. Time appears to go backward. Fix: sticky sessions — pin each user to the same follower for the duration of a session.

**Consistent prefix reads:** Two writes are causally linked (event A causes event B). On a lagging follower, B appears before A — effect without cause. Fix: route causally linked writes through the same path so they arrive in order.

> **Follow-up you'll get:** "What happens when the primary dies?" — **Failover**. A monitoring process (Patroni for Postgres, Orchestrator for MySQL) detects a missed heartbeat after ~30 seconds. It elects the follower with the highest LSN — the one closest to the primary's last state. It redirects writes there (via DNS update or VIP reassignment) and demotes the old primary to follower when it recovers. The hard part is **split-brain**: if the primary is unreachable but not dead (network partition), you now have two nodes accepting writes. They diverge. Fixing the split means discarding one side's writes. STONITH (Shoot The Other Node In The Head) — physically cutting the power or network to the old primary via a management API — prevents this by ensuring only one node is ever live.

---

### Multi-leader replication — for globally distributed writes

Single-leader means all writes cross the Atlantic if your primary is in us-east-1 and your EU users are writing. Every write takes ~80ms for the round trip. Multiply that across millions of writes per day — it's a real problem.

Multi-leader puts a primary in each region, each accepting writes locally. Replicas cross-replicate in the background.

The problem this creates: if a US user and an EU user edit the same row concurrently, both writes succeed locally, and when the WAL streams arrive at each other's region, there's a conflict. Two different WAL entries claim ownership of the same row at nearly the same LSN.

**Conflict resolution** is how you decide which wins — LWW (last timestamp wins, simple but silently drops one write), CRDTs (data structures that merge automatically, like a counter that adds instead of replacing), or custom application logic.

**Conflict avoidance** is better — design so the conflict never happens. Sticky routing (`user_id=42` always writes to the US primary, never EU) means no two leaders ever write the same row simultaneously. Append-only schemas (store events, never update them) make conflicts structurally impossible.

---

### Leaderless replication — for maximum availability

No primary. Every node accepts writes. Every node serves reads. Consistency is governed by quorum math.

The quorum rule is **W + R > N** (W = nodes that must confirm a write, R = nodes that must respond to a read, N = total replicas).

With N=3, W=2, R=2: the write set and read set overlap by at least 1. So the read always hits at least one node that has the latest write.

```
Write user:42 name=Alice → send to all 3 nodes, wait for 2 ACKs
  Node A: ACK ✓  Node B: ACK ✓  Node C: down ✗   → success! (W=2 met)

Read user:42 → send to all 3, take 2 responses
  Node A: {name:Alice, version:5} ✓
  Node C: {name:Bob, version:4}   ✓  (old version — was down during write)
  → pick highest version: Alice ✓
  → write version:5 back to Node C (this is read repair)
```

**Read repair** is how stale replicas get fixed: when a read detects an old version on one node, it pushes the newer version back. Lazy — only fixes data that gets read. **Anti-entropy** (background Merkle tree comparison) finds and fixes everything else.

> Cassandra `consistency=QUORUM` is exactly W=2, R=2 on a 3-node cluster. `consistency=ONE` is W=1, R=1 — fastest but stale reads possible.

---

> 🔁 **Bridge into topic 4:**
> "So replication gave us survival, and it gave us more read capacity — every replica can serve reads.
>
> But count the write paths with me. In single-leader replication, how many machines accept writes? One. We've scaled reads beautifully and done absolutely nothing for writes. That's the wall we hit next."

## 4. Sharding

> 🗣️ **Say this to open:**
> "Now we hit a wall that no amount of clever configuration gets you past.
>
> Your writes have saturated the box. The CPU is pinned, the disk can't keep up, and you've already bought the biggest instance your cloud provider sells. Partitioning didn't help — all those partitions still share that one CPU. Replication didn't help either, because replicas take reads, not writes.
>
> You've run out of *one machine*. That's the moment sharding stops being optional."

> ⚠️ **Common pushback:** *"Isn't sharding just partitioning?"*
>
> This will come up almost every time, and it's worth stopping for. Answer it with one question back: **"Do the pieces live on the same server, or different ones?"** Same server, one CPU, one disk → partitioning. Separate servers, each with its own CPU, RAM and disk → sharding. All sharding is a form of partitioning; almost no partitioning is sharding. Get this straight here and the rest of the session is easier.

**What it solves:** a single server is the bottleneck for writes, storage, or both — you need to spread load across multiple independent servers.
**What it does NOT solve:** read scalability within a shard — that's replication (topic 3). Query performance on large datasets within one server — that's partitioning (topic 1).

### The key distinction from partitioning — different servers, not different storage areas

Partitioning splits a table into multiple physical storage segments that still live on the same server, sharing the same CPU, RAM, disk I/O, and network card. You gain query pruning, but you're still bound by one machine's limits.

Sharding takes those physical segments and puts each on a **completely separate, independent server** — its own CPU, its own RAM, its own disk, its own network. This is called a **shared-nothing architecture**: no shared memory, no shared disk. Each shard is a fully independent database instance.

```
Partitioning:          Sharding:
┌─────────────┐        ┌──────┐  ┌──────┐  ┌──────┐
│  Server 1   │        │Shard1│  │Shard2│  │Shard3│
│ ├─ Part A   │        │(own  │  │(own  │  │(own  │
│ ├─ Part B   │        │ CPU) │  │ CPU) │  │ CPU) │
│ └─ Part C   │        └──────┘  └──────┘  └──────┘
└─────────────┘        server 1  server 2  server 3
Same machine           Three independent machines
```

The consequence: 3 shards = 3× the write throughput capacity, 3× the storage, 3× the memory. That's the only reason you shard — to break past one machine's ceiling.

---

### Sharding strategies — the routing layer

Every read and write must be routed to the correct shard. The routing rule is the strategy.

**Hash sharding** — `shard = hash(shard_key) % N`.

A routing layer (often a proxy or library) computes this for every query. `user_id=1001`, `hash(1001) % 4 = 1` → send to Shard 1. Even distribution. No hotspots.

The scaling problem: adding a fifth shard changes N from 4 to 5, which changes the modulo result for most keys. A key that was on Shard 1 now computes to Shard 3. You have to physically move that data to Shard 3 before the new routing is live. At Instagram scale (billions of rows), this migration takes days. **Consistent hashing** (topic 5) is the fix for exactly this problem — it minimizes how many keys need to move when N changes.

**Range sharding** — the routing layer has a range map: `user_id 1–1M → Shard 1`, `1M–2M → Shard 2`. Fast lookups, supports range queries on the shard key. Problem: sequential inserts (new user_ids are always higher than existing ones) mean all new writes hit the last shard until it fills up.

**Directory sharding** — a lookup service maps `key → shard_id`. Flexible — you can move any key to any shard by updating the directory. The cost: the directory itself is a bottleneck and a single point of failure. You need to replicate it and cache it aggressively at the routing layer.

---

### The real headaches sharding introduces

**Cross-shard queries** — a JOIN between `users` and `orders` where users are on Shard 1 and their orders are on Shard 2 means the query engine must fetch from both shards over the network, merge the results in memory, and return. This is slow and complex. The typical response in sharded systems is aggressive **denormalization**: embed the user's name inside the order record so you never need to join. You trade storage (duplicated data) for query simplicity (no cross-shard joins).

**Distributed transactions** — if a purchase debits a wallet on Shard A and credits an account on Shard B, both operations must succeed or both must fail. Coordinating this across independent servers requires a distributed transaction protocol (2PC — two-phase commit), which adds latency and has failure modes. Most sharded systems avoid distributed transactions by designing data to colocate related entities on the same shard (`wallet` and `account` for the same user always on the same shard by `user_id`).

> **Follow-up you'll get:** "How does Vitess handle sharding for MySQL?" — Vitess sits between your application and your MySQL shards as a proxy layer. Your app connects to Vitess like it's one MySQL server. Vitess parses every query, determines which shard(s) it targets based on the routing configuration, rewrites the query if needed, sends it, and merges results. Resharding (splitting one shard into two) is handled by Vitess online — it double-writes to both shards during migration, backfills, and cuts over without downtime.

---

> 🔁 **Bridge into topic 5:**
> "We glossed over something in hash sharding, and it's the single most painful operation in a sharded system.
>
> I said `hash(key) % N`. So what happens to N when you add a shard? It changes. And when N changes, that formula gives a different answer for almost every key you have. Let's look at exactly how bad that is."

## 5. Consistent Hashing

> 🗣️ **Say this to open:**
> "We just said sharding lets you add servers. Let me show you why adding a server used to be one of the most dangerous things you could do in production.
>
> Three cache servers. Routing is `hash(key) % 3`. Simple, works fine. Traffic grows, so on a Tuesday afternoon you add a fourth server. Nothing crashed, no bad deploy. And thirty seconds later your database is on fire."

> ❓ **Ask the room:** "Why? Nothing broke. We just added capacity."
>
> ✋ **Pause here** and let it be genuinely uncomfortable. Then walk one key through the arithmetic out loud: *"`hash` gives me 210. 210 mod 3 is 0 — server 0. Now with four servers: 210 mod 4 is 2 — server 2. That key just moved. Now do that for every key you have."*
>
> When it lands, say it plainly: **about 75% of your keys just changed servers, so your entire cache is now wrong, and every one of those requests goes to the database at the same time.** That's a thundering herd, caused by a routine scale-up. Consistent hashing exists to make this a non-event.

**What it solves:** when nodes are added or removed from a cluster, minimizing how many keys need to be remapped to different nodes.
**What it does NOT solve:** hotspots from a single very popular key — that's bounded load or key salting (mentioned in partitioning). Data migration itself — it minimizes it, doesn't eliminate it.

### Why regular modulo hashing breaks on scale

You have 3 cache servers. Your routing rule: `server = hash(key) % 3`.

Works great. Then you add a fourth server for capacity. Now: `server = hash(key) % 4`.

Pick any key — say `hash("user:42") = 210`. With 3 servers: `210 % 3 = 0` → Server 0. With 4 servers: `210 % 4 = 2` → Server 2. The key moved. In fact, for a random hash function, about 75% of all keys move when you go from 3 to 4 servers. Your entire cache is effectively invalidated.

Every one of those cache misses now hits the database. Under high traffic, this is a thundering herd — millions of concurrent requests all missing cache simultaneously, all hitting the database, overwhelming it during what was supposed to be a routine scale-up operation.

---

### The hash ring — how it works internally

The insight is to hash both servers and keys onto the same circular space (0 to 2³²). Think of it as a clock face with 2³² positions instead of 60.

```
Hash the servers:
  hash("server-A") % 2³² = 75      → Server A sits at position 75 on the ring
  hash("server-B") % 2³² = 150     → Server B at 150
  hash("server-C") % 2³² = 225     → Server C at 225

Hash each key:
  hash("user:42") % 2³² = 60       → sits at position 60
  hash("user:99") % 2³² = 110      → sits at position 110
  hash("user:7")  % 2³² = 200      → sits at position 200
```

Assignment rule: each key belongs to the **first server clockwise** from its position.

```
user:42 at 60 → walk clockwise → first server is A at 75 ✓
user:99 at 110 → walk clockwise → first server is B at 150 ✓
user:7 at 200 → walk clockwise → first server is C at 225 ✓
```

Now add Server D at position 110 (between A and B). What moves? Only keys that were in the arc from A (75) to D (110) — they used to go to B, now they go to D. Everything outside that arc is untouched. With 4 servers, you move 1/4 of the keys. With 100 servers, you move 1/100. That's the guarantee.

The routing layer implements this with a sorted data structure (sorted array or skip list) of server positions. Finding the right server for a key is a binary search: O(log n) in the number of servers.

---

### Virtual nodes — why physical positions aren't enough

With only 3 physical servers on the ring, the positions are random. You might get Server A covering 60% of the ring arc, B covering 30%, C covering 10%. That's wildly uneven load.

**Virtual nodes** give each physical server multiple positions on the ring:

```
Server A: positions at 23, 89, 156, 201, 278, 312 ...  (100 positions)
Server B: positions at 12, 67, 144, 188, 260, 330 ...  (100 positions)
Server C: positions at 45, 105, 172, 230, 295, 360 ... (100 positions)
```

With 100 virtual positions per server, the arcs average out across the ring. Each server owns roughly equal total arc length = equal key distribution = equal load.

The routing layer still uses one sorted array of all positions. Each position in the array maps back to its physical server. Binary search finds the position, look up the server. Same O(log n) operation.

**Weighting:** give larger servers more virtual positions. A server with 32GB RAM gets 200 virtual positions; one with 16GB gets 100. It naturally handles twice the traffic.

**Graceful failure:** when a server dies, its virtual positions are spread across the ring. The keys that were on those positions each go to the next clockwise server — which is a different physical server for each virtual position. The dead server's load spreads across many healthy servers instead of all dumping onto one neighbor.

> **Follow-up you'll get:** "Where does this show up in real systems?" — Redis Cluster hashes keys into 16,384 fixed slots. Adding a node means moving some slots (and their keys) to it. Cassandra uses a token ring where each node owns a range of the ring — when a node joins, it takes token ranges from existing nodes. Rate limiters use it to route `user_id` to the same limiter server consistently — without it, a user's request count would be split across all limiter instances.

---

> 🔁 **Bridge into topic 6:**
> "We've now spent five topics making sure that when a query arrives, we can find the data efficiently.
>
> Let's flip it around. What's the fastest possible way to answer a query? Not to run it at all. If you can prove the answer is 'nothing here' before you touch the disk, you've won — and you can do that with a surprisingly small amount of memory."

## 6. Bloom Filters

> 🗣️ **Say this to open:**
> "Here's a question that sounds trivial until you put a number on it.
>
> Someone signs up for Instagram and types a username. You need to answer one thing: *is this taken?* Easy — one database query.
>
> Now do that for every signup, against five hundred million existing usernames, thousands of times a second. Suddenly this trivial question is hammering your database all day long — and the honest truth is that most of the time the answer is just 'no, it's free.'"

> ❓ **Ask the room:** "Could we keep all five hundred million usernames in memory instead?"
>
> Let them do the math — a hash set of that many strings is tens of gigabytes. Then reframe it: *"What if I told you we could answer this in memory, and I'm allowed to be wrong — but only in one specific direction, and only about 1% of the time?"* That trade is the entire idea, and framing it as a **trade you're choosing** rather than a data structure you're memorising is what makes Bloom filters click.

**What it solves:** answering "have I seen this key before?" millions of times per second using tiny memory, with a predictable and configurable error rate in one direction only.
**What it does NOT solve:** exact membership queries (use a hash set). Storing or retrieving values (it only answers yes/no about keys). Deletion without rebuilding (use a Counting Bloom Filter variant).

### Start here: what's inside a Bloom filter

A Bloom filter is just an **array of bits**, all initialized to 0, plus K independent hash functions.

```
Bit array (m = 20 bits):
Index: 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19
Bits:  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0
```

To **insert** an item, you run it through all K hash functions and set those K bit positions to 1.

```
Insert "alice" with K=3 hash functions:
  H1("alice") % 20 = 3   → set bit 3
  H2("alice") % 20 = 11  → set bit 11
  H3("alice") % 20 = 17  → set bit 17

Bit array after inserting alice:
Index: 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19
Bits:  0  0  0  1  0  0  0  0  0  0  0  1  0  0  0  0  0  1  0  0
```

Insert "bob":
```
  H1("bob") % 20 = 6    → set bit 6
  H2("bob") % 20 = 11   → bit 11 already 1 (shared with alice — fine)
  H3("bob") % 20 = 19   → set bit 19
```

To **query** an item, run it through the same K hash functions and check those K bit positions:

- If **any bit is 0** → that item was never inserted. Guaranteed. No false negatives. You can skip the database call entirely.
- If **all bits are 1** → the item was probably inserted. But not certainly — those bits might all be 1 from different items.

---

### Why false positives are unavoidable — and why that's OK

Query "carol" (never inserted):
```
H1("carol") % 20 = 2   → bit 2 is 0 → STOP. Definitely not in set. ✓
```

Query "dave" (also never inserted, but unlucky hash positions):
```
H1("dave") % 20 = 6    → bit 6 is 1 (set by bob)  ✓
H2("dave") % 20 = 3    → bit 3 is 1 (set by alice) ✓
H3("dave") % 20 = 11   → bit 11 is 1 (set by both) ✓
→ All bits 1 → "probably in set" — but dave was never inserted. FALSE POSITIVE.
```

This isn't a bug — it's the fundamental trade-off. You get a compact bit array instead of storing the full key. The cost is that hash collisions across different items occasionally produce a "probably yes" for something that was never inserted. The false positive rate is **tunable** — controlled by how many bits you allocate per item (m/n ratio) and how many hash functions you use (k).

At m/n=10 (10 bits per item), k=7 hash functions: false positive rate ≈ 1%. That's 1 unnecessary database call per 100 queries. Totally acceptable for most use cases.

> **Follow-up you'll get:** "Why can't you delete from a Bloom filter?" — Because bits are shared. Bit 11 was set by both alice and bob. If you "delete" alice by clearing bit 11, you just broke bob's membership — bob's query now sees bit 11 as 0 and returns "definitely not in set" incorrectly. The filter has no way to know which items contributed to which bits. The fix is a **Counting Bloom Filter**: instead of a single bit per position, store a small integer (counter). Increment on insert, decrement on delete. When a counter hits 0, the bit is effectively cleared. Costs 4× more memory but supports deletion.

---

### Where it shows up in production systems

**Cassandra / RocksDB SSTable filtering:** when Cassandra writes data, it creates immutable files on disk called SSTables. Over time you accumulate many SSTables per table. A read for a single key might need to check dozens of SSTables to find the current version. Each SSTable has a Bloom filter. Before opening any SSTable file (a disk read, ~10ms), Cassandra checks its filter. "Definitely not in this file" → skip. This eliminates 60–70% of SSTable reads.

**Chrome Safe Browsing:** Chrome ships with a local Bloom filter containing millions of known malicious URLs (a few MB download). When you visit any URL, Chrome checks this local filter first. "Definitely safe" → no network call, zero latency, no privacy exposure (the URL never left your machine). Only "probably malicious" triggers a network verification call. ~99% of URL checks are answered locally.

---

> 🔁 **Bridge into topic 7:**
> "Everything so far has been about the data layer — storing it, finding it, copying it, spreading it.
>
> For the rest of the session we move up the stack, to traffic. Because you can build the most beautifully sharded, replicated, indexed database in the world, and a single client with a bad retry loop can still take the whole thing down."

## 7. Rate Limiting

> 🗣️ **Say this to open:**
> "Let's talk about the cheapest insurance policy in distributed systems.
>
> Somewhere out there, a client has a retry loop with no backoff. It's not malicious — it's a bug someone shipped on a Friday. It is now sending your API ten thousand requests a second.
>
> Without rate limiting, that one broken client takes down service for every other customer you have. With rate limiting, it's a line in a dashboard and nobody else notices. That's the entire value: **rate limiting is the line between one client's problem and everyone's problem.**"

> ❓ **Ask the room:** "Before we pick an algorithm — what are we actually counting? What's the key?"
>
> This is the question people skip straight past, and it matters more than the algorithm choice. Per user? Per IP? Per API key? Per endpoint? Take a few answers, then point out that real systems do several at once — and that a login endpoint has to be keyed per-IP, because before login you don't *have* a user to key on.

**What it solves:** protecting your system from too many requests from any one client — malicious or accidental — and returning a clear 429 Too Many Requests signal.
**What it does NOT solve:** distributing load across servers — that's load balancing. Handling a surge in total traffic — that's auto-scaling (topic 9) and backpressure (topic 8).

### What happens at the system level when you hit a rate limit

A rate limiter is a layer that sits in front of your API and answers one question on every request: "has this client (identified by API key, user ID, or IP) exceeded their quota in the current window?"

To answer that, it needs a shared counter that every instance of your service can read and write atomically. That shared store is almost always **Redis** — an in-memory key-value store that processes 1M+ operations per second and supports atomic operations.

The key design constraint: the check and the increment must happen atomically. If two concurrent requests both read count=99, both decide "still under 100," and both increment — you've allowed 2 requests when you should have allowed 1. Redis solves this with **Lua scripts** that run as a single atomic transaction on the Redis server.

```lua
-- runs atomically; no other Redis command can interleave
local current = redis.call('INCR', KEYS[1])         -- increment counter
if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])           -- set TTL on first call
end
if current > tonumber(ARGV[2]) then
    return 0   -- rejected
end
return 1       -- allowed
```

The Redis key is usually `rate:{user_id}:{window_bucket}` — e.g., `rate:42:2024-01-15-10` for user 42 during the 10am window on Jan 15.

---

### The four algorithms — what changes is the window shape

**Fixed Window** — the simplest. A counter per time bucket. Resets at bucket boundaries.

```
Window 10:00–10:01 (limit=100):
  requests 1–100: INCR → 1, 2, ... 100 → allowed
  request 101:    INCR → 101 → return 0 → 429
Window 10:01–10:02: new key, counter starts at 0
```

The edge burst problem: a client sends 100 requests at 10:00:59 (last second of window 1) and 100 at 10:01:00 (first second of window 2). Both windows allow them. 200 requests in 2 seconds against a 100/minute limit — the boundary creates a seam in enforcement.

**Sliding Window Log** — store the timestamp of every request in a sorted set. On each request, delete timestamps older than the window, count what's left.

```
Redis ZADD: add current_timestamp to sorted set
Redis ZREMRANGEBYSCORE: remove timestamps older than now - window
Redis ZCARD: count remaining entries
If count >= limit → reject
```

Exact — no edge burst possible because the window is always the last 60 seconds from *right now*, not from an arbitrary boundary. Cost: memory. Each stored timestamp is ~8–16 bytes. A user with a 10,000 req/hour limit stores up to 10,000 timestamps in Redis. Manageable per user, expensive at millions of users with high limits.

**Sliding Window Counter** — instead of storing every timestamp, keep two counters: previous window and current window. Estimate the current rate using a weighted blend.

```
At 10:01:42 (42 seconds into the current minute = 70% through):
  prev_window_count = 80 requests (10:00–10:01)
  current_window_count = 30 requests (10:01–10:01:42)
  estimated = 80 × (1 - 0.70) + 30 = 80 × 0.30 + 30 = 24 + 30 = 54
```

The logic: 70% of the current minute has elapsed, so only 30% of the previous window's requests are still "in" the 60-second rolling window. This is an approximation — off by ~0.1% in practice, which is acceptable for rate limiting. Two counters per user instead of N timestamps. GitHub's API rate limiter uses this approach.

**Token Bucket** — a bucket that fills at a constant rate (tokens per second). Each request consumes one token. If the bucket is empty, reject.

Internally: you don't run a background job to add tokens. Instead, you calculate how many tokens have accumulated since the last request, lazily, on each request:

```
tokens_since_last = (current_time - last_refill_time) × refill_rate
current_tokens = min(bucket_capacity, stored_tokens + tokens_since_last)
If current_tokens >= 1: consume 1 token, allow
Else: reject
```

This allows **controlled bursts**: if a client hasn't made any requests for 10 seconds, the bucket accumulates up to its capacity. The client can then send a burst of requests up to that capacity before being throttled. Stripe and Twilio use token bucket for exactly this — batch API clients that need to send a burst of requests then go idle.

> **Follow-up you'll get:** "What's the difference between token bucket and leaky bucket?" — Token bucket controls *input rate* and allows bursts. Leaky bucket controls *output rate* and forbids bursts. In a leaky bucket, requests queue up and exit at a fixed rate (like water leaking from a bucket at a constant drip). The outflow is smooth regardless of input bursts. Use leaky bucket when you're protecting a fragile downstream with a hard rate limit (an SMS carrier that will cut you off if you exceed X messages/second). Use token bucket for user-facing APIs where occasional bursts are tolerable.

---

### Distributed rate limiting — the problem with 20 app servers

One app server tracks one Redis key. If you have 20 app servers and a user's requests round-robin across all of them, each server increments a different Redis key. The user has 20 separate counters, each at 5 requests — total 100 requests, but never rate-limited because no single counter hit the limit.

The fix: **all servers share one Redis key per user**, not one per server. Every app server calls the same Redis instance with the same key. This adds ~1ms per request for the Redis round-trip — acceptable for most APIs.

For very high throughput where even 1ms is too much, **token leasing** approximates this: each app server periodically borrows a batch of tokens from Redis (say, 100 at a time) and spends them locally. When exhausted, it fetches another batch. Slightly over-allows at boundaries (two servers might each have a partially consumed batch) but no synchronous Redis call on every request.

### What are we actually limiting? (the HTML's granularity breakdown)

The algorithm choice is secondary to the question of *what the counter key represents*:

| Granularity | Redis key pattern | Example |
|---|---|---|
| Per User | `rate:user:123` | Instagram — 100 posts/day per user |
| Per IP | `rate:ip:1.2.3.4` | Login page — 5 attempts/min per IP (pre-auth, identity unknown) |
| Per API Key | `rate:apikey:abc123` | Stripe — Partner A gets 1000/sec, Partner B gets 100/sec |
| Per Endpoint | `rate:endpoint:/generate` | AI image gen — /profile: 1000/min, /generate: 10/min |
| Global | `rate:service:total` | DB protection — entire service max 50K req/sec |

Most real systems combine multiple of these. A user can be under their per-user limit but their IP is blocked, or the global cap is hit.

### Stacked rules (multi-window)

Instead of one limit, stack multiple windows:

```
GitHub API: 10/sec  AND  100/min  AND  5000/hour
```

The 10/sec catches short bursts. The 5000/hour catches sustained abuse. A user can't hammer for one second (blocked at 10/sec) but also can't run forever at just under the per-second limit (blocked at 5000/hour). Each window requires its own Redis counter with its own TTL.

### What happens when the limit is hit — three responses

**429 Reject** — immediate HTTP 429 Too Many Requests + `Retry-After` header. Client retries with backoff. Used by GitHub, Stripe. Simple and cheap.

**Queue** — accept the request, process it later from a queue. Good for non-time-critical operations (SMS sending, email). Twilio queues SMS messages and drains at the carrier's allowed rate.

**Throttle** — degrade quality instead of rejecting. Netflix reduces video bitrate under load instead of returning an error. Better UX than a hard failure.

### Tier-based limits

Limits tied to pricing tier. Store the tier in the user profile, look it up at the gateway:

```
Free       →  100 req/hr
Premium    →  10,000 req/hr
Enterprise →  100,000 req/hr
```

Common in SaaS APIs, AI platforms (OpenAI, Anthropic), cloud services. Same algorithm, different thresholds per key.

### Fail-open vs fail-closed — when Redis is down

If the rate limiter store (Redis) goes down, you have two choices:

**Fail-open** (allow all traffic) — used for public APIs, product catalog, news. Availability matters more than protection. Risk: a brief window of unlimited traffic.

**Fail-closed** (block all traffic) — used for bank login, OTP, admin portal. Security matters more than availability. Risk: legitimate users are locked out while Redis is down.

### Anti-patterns from the HTML

- **Rate limit only at the app layer** — a DDoS bypasses your app layer entirely. Rate limit at the edge (CDN, API gateway) too.
- **No `Retry-After` header** — clients have no idea when to retry, so they hammer blindly, making the problem worse.
- **Same limit for all endpoints** — `/login` needs strict limits (5 attempts/min), `/search` can be loose (100/min). One-size-fits-all hurts both security and UX.
- **No tier differentiation** — paid enterprise users getting the same rate as free users is a broken product.

### Interview answer pattern (from the HTML)

*"I'd put rate limiting at the API Gateway layer using Redis sorted sets for a sliding window counter. Per-user limits keyed by API key for authenticated endpoints, per-IP limits for unauthenticated (login, OTP). Return 429 with `Retry-After` header. Fail-open on Redis failure for public APIs, fail-closed for security-critical endpoints."*

---

> 🔁 **Bridge into topic 8:**
> "Rate limiting handles traffic arriving from outside. But here's the uncomfortable part — most overload incidents aren't caused by outsiders.
>
> They're caused by one of your own services producing work faster than another one of your services can consume it. No attacker, no bad client. Just two components of yours, running at different speeds."

## 8. Backpressure


> 🗣️ **Say this to open:**
> "Rate limiting protected us from the outside world. Now let's break the system from the inside.
>
> Flash sale. Orders come in at five thousand a second. Each one triggers a confirmation email, and the email service can process one thousand a second.
>
> Nothing is broken. No exceptions, no errors. Every component is doing exactly what it was built to do. And this service is going to crash."

> ❓ **Ask the room:** "Where do the other four thousand emails per second go?"
>
> ✋ **Pause.** Someone will say "a queue." Then walk the clock forward out loud: *"One minute in, that's two hundred and forty thousand queued. Five minutes in, over a million. Where is that queue living?"*
>
> In memory. So the process runs out of heap, dies, and every queued email vanishes — including for customers who ordered five minutes ago. Land the principle hard: **an unbounded queue isn't a buffer, it's a delayed crash.**

**What it solves:** a producer generating data faster than a consumer can process it — preventing unbounded queue growth, memory exhaustion, and data loss.
**What it does NOT solve:** the root cause of the speed mismatch — that might require auto-scaling (topic 9) or architectural changes. It handles the *symptom* safely.

### Why ignoring backpressure causes crashes

An order service processes 5,000 orders/second during a flash sale. It sends each order to an email notification service that can only process 1,000/second. The email service queues the excess.

After 1 minute: 4,000 × 60 = 240,000 queued emails.
After 5 minutes: 1.2 million queued emails.

If the queue is in memory (a Java `LinkedList`, a Node.js array, an unbounded channel), the process runs out of heap and crashes. All queued emails are lost. The service restarts, starts processing live orders again, and the backlog is gone — users who ordered 5 minutes ago never got a confirmation email.

Backpressure is the set of deliberate mechanisms that prevent this.

---

### Strategy 1: Drop (Load Shedding) — when data freshness matters more than completeness

Drop new items when the queue is full. The key design decision is which items to drop.

**Drop newest:** when the queue is full, reject new arrivals. The caller gets an immediate error (503 or 429). This is the simplest form of backpressure — the system's queue is the signal.

**Drop oldest (eviction):** when the queue is full, remove the oldest item to make room for the new one. The newest data survives. Used for live metrics: a sensor reading from 30 seconds ago is less useful than one from right now. If you're falling behind, keep the recent data, discard the stale data.

Real example: a real-time trading system receiving market data updates. If the consumer falls behind, you want the latest price tick, not one from 5 seconds ago. Drop oldest.

---

### Strategy 2: Bounded Queue — explicit ceiling with upstream signal

Accept work into a queue but cap the queue depth. When the cap is reached, propagate the signal upstream: block the caller, return a 503, or in stream-based systems, pause the data source.

```
Producer → [Queue: max 10,000 items] → Consumer (1,000/sec)

Queue hits 10,000:
  → HTTP callers: return 503 immediately
  → Kafka consumers: stop calling poll() — Kafka holds messages, producer not affected
  → gRPC streams: receiver stops sending WINDOW_UPDATE — sender naturally pauses
```

The queue size is a policy decision: "how many seconds of lag are acceptable before I'd rather drop?" At 1,000/second consumer, a 10,000-item queue = 10 seconds of lag. If 10-second-old data is still useful (order processing, email delivery), buffer. If not (live video frames, real-time metrics), drop.

---

### Strategy 3: Flow Control — tell the producer to slow down

In protocols that support it, the consumer explicitly grants permission to the producer to send.

**TCP:** when your application isn't reading from a socket, the OS receive buffer fills up. Once full, the TCP stack stops sending ACKs for new data. The sender's TCP stack sees its send window fill up and pauses. This is TCP flow control — built into the protocol.

**Kafka:** a Kafka consumer only receives messages when it calls `poll()`. If the consumer stops polling, messages stay in Kafka's log (on disk) — not in the consumer's memory. The producer keeps producing and Kafka keeps writing to disk, but the consumer's memory is protected. This is why Kafka consumers can catch up after a processing slowdown without data loss.

**gRPC / HTTP/2:** HTTP/2 has a built-in **flow control window**. The receiver sends a `WINDOW_UPDATE` frame to grant the sender permission to send N more bytes. When the receiver stops sending updates, the sender blocks. This is the mechanism gRPC uses for streaming RPCs.

> **Follow-up you'll get:** "How do you decide which strategy to use?" — Two questions: Can you lose data? And how stale can the data be? Can't lose data + stale is fine → bounded queue + flow control. Can't lose data + needs to be fresh → scale consumers (add workers). Can lose some data + freshness critical → drop oldest. Under peak load, can shed entire categories → load shedding (drop low-priority notification emails, keep order confirmations).

### Two more strategies from the HTML

**Sample / Aggregate** — instead of processing every item, process 1 in N. For high-volume telemetry (1 million events/sec), sample at 1-in-10, emit aggregated metrics every second. StatsD does exactly this. The consumer processes 100K items/sec instead of 1M, with 90% less work and only a slight loss of precision. Good for: metrics, logging, analytics — any case where you care about trends, not individual events.

**Priority Queue** — split the queue into tiers. High-priority items (payment confirmations, checkout) are always processed first. Low-priority items (analytics, recommendation updates) are processed only when the high-priority queue is clear, and dropped first under overload. Good for: mixed-criticality traffic where shedding the right load matters more than shedding any load.

### Backpressure by system — how each implements it

**Network / Transport:**
- TCP: the receiver's socket buffer fills up → TCP shrinks the advertised receive window → sender throttles automatically. This is transparent — your application doesn't do anything.
- HTTP/2 / gRPC: `WINDOW_UPDATE` frames grant capacity. No update = sender blocks.
- WebSocket: no built-in flow control — you implement application-level ACKs.

**Message Brokers:**
- Kafka: consumer lag metric + `fetch.max.bytes` to throttle. Consumer stopping `poll()` naturally limits how much it receives.
- RabbitMQ: `prefetch_count` limits how many unacknowledged messages a consumer can hold. When full, RabbitMQ stops delivering until messages are acked.
- SQS: visibility timeout keeps messages invisible while being processed. Dead Letter Queue (DLQ) catches failures after N retries.
- NATS: detects slow consumers and disconnects them — harsh but prevents one slow subscriber from blocking the broker.

**Application Frameworks:**
- Reactive Streams (RxJava/Project Reactor): `request(N)` protocol — the subscriber explicitly tells the publisher how many items it can handle right now.
- Go channels: a `make(chan T, N)` with buffer size N blocks the sender when full — backpressure is structural in the language.
- Node.js streams: `highWaterMark` sets the buffer ceiling. When it's exceeded, `write()` returns false. The `drain` event signals when the buffer is clear and the producer can resume.

### Monitoring signals (from the HTML)

Track these metrics and alert on them:
- **Consumer lag** (Kafka) — how many messages behind the consumer is
- **Queue depth** (SQS, RabbitMQ) — absolute number of messages queued
- **Buffer utilization %** — current depth / max depth
- **Drop rate** — how many messages are being discarded

Alert at 60% capacity (warning), 80% (critical). Use these signals to trigger auto-scaling (topic 9) before the queue overflows.

**Key principle: always use bounded queues.** Unbounded queues are how production outages turn into OOM crashes. The queue size should be set based on: acceptable lag window × throughput rate. If 10 seconds of lag is acceptable and throughput is 1,000/sec, your max queue depth is 10,000.

### Anti-patterns

- **Unbounded buffers** — OOM is guaranteed under sustained load. Every queue must have a max depth.
- **No backpressure signal** — producer keeps flooding even when the consumer is overwhelmed. Always propagate the signal upstream.
- **Dropping without metrics** — silent data loss. If you're dropping, you must know how much and which items.
- **Blocking in async code** — blocking a thread in an async event loop (Node.js, async Python) deadlocks the entire event loop for that process.

**Real-world:** Netflix uses RxJava backpressure throughout its streaming pipeline. Uber built QALM (Queue-based Adaptive Load Management) for admission control. Twitter's Finagle rejects requests when internal queues exceed capacity. Kafka consumer lag directly triggers KEDA-based pod auto-scaling.

---

> 🔁 **Bridge into topic 9:**
> "One of the backpressure strategies we listed was 'scale the consumers.' We left that as a hand-wave — *just add more workers.*
>
> Let's actually build that. And let's be honest about the part nobody mentions: adding a server is easy. Knowing *when*, and safely taking one away again, is the hard part."

## 9. Auto-Scaling


> 🗣️ **Say this to open:**
> "One of our backpressure answers was 'just add more consumers.' Let's make that automatic — and let's be honest about why it's harder than it sounds.
>
> A news site runs along quietly, then a story breaks and traffic goes up ten times for four hours. You have two bad options. Provision for the peak and pay ten times your bill twenty-four hours a day for something that happens twice a month. Or provision for the average and go down exactly when the most people are watching."

> ❓ **Ask the room:** "What signal would you scale on?"
>
> You'll get CPU almost immediately. Accept it, then complicate it: *"CPU is a lagging indicator. By the time CPU is at 90%, your users are already waiting. What would have told you earlier?"* Steer them toward queue depth and request rate — leading indicators. That distinction is the golden rule at the end of this topic, so it's worth planting it here.

**What it solves:** matching server capacity to actual traffic so you don't over-pay at 3am and don't collapse during a traffic spike.
**What it does NOT solve:** stateful services that can't be arbitrarily added/removed — that's an architecture problem (externalize state, drain connections). Root causes of traffic spikes — that's capacity planning and backpressure (topic 8).

### How a scale-out decision actually happens

An auto-scaler is a control loop: it continuously reads a metric, compares it to a target, and adjusts the number of instances.

```
Every 30 seconds:
1. Read metric (CPU avg across fleet)
2. Desired replicas = current_replicas × (current_metric / target_metric)
   e.g., 10 pods × (80% CPU / 50% target) = 16 pods → add 6
3. Apply the change (create 6 new pods / EC2 instances)
4. Wait for cooldown before next decision
```

Kubernetes HPA (Horizontal Pod Autoscaler) does exactly this. It queries the metrics API every 15 seconds and recalculates. The cooldown (default 5 minutes for scale-in, 3 minutes for scale-out) prevents thrashing — rapid add/remove cycles when metrics oscillate around the threshold.

---

### What signals to scale on

**CPU utilization** — the most common. Simple, available everywhere. Lagging indicator: CPU spikes while requests are already slow, before you can add capacity.

**Request queue depth** — more precise. If your API gateway shows 500 requests waiting vs the normal 5, that's a cleaner signal. KEDA (Kubernetes Event-Driven Autoscaler) can scale pods directly from Kafka consumer lag, SQS queue depth, or any custom metric. Scale before CPU becomes a symptom.

**Custom application metrics** — latency p99 > 500ms → scale. Error rate > 1% → scale. Active WebSocket connections > 80,000/pod → scale. These are closer to the user experience and more actionable than infrastructure metrics.

**Scheduled scaling** — you know traffic spikes every weekday at 9am EST when US employees log in. Pre-scale at 8:45am. Don't wait for CPU to spike and then add capacity while users are already waiting. Combine with reactive scaling for unpredictable events.

---

### Scale up fast, scale in slow — and why

This asymmetry is deliberate. When traffic spikes, you want capacity *immediately* — before latency rises. When traffic drops, you want to remove capacity *slowly* — because another spike might arrive in the next few minutes, and spinning up a server takes time. You're paying a small amount in extra server-time to avoid a bad user experience window.

```
Scale-out policy: trigger at 70% CPU → add 2 instances → cooldown 2 min
Scale-in  policy: trigger at 30% CPU → remove 1 instance → cooldown 15 min
```

The asymmetric cooldown (2 min out vs 15 min in) means you respond fast to load and cautiously to drops.

---

### The stateless vs stateful problem

**Stateless services** — a server holds no per-user data in local memory or local disk. Any instance is identical to any other. Adding an instance immediately handles new requests. Removing one loses nothing. Auto-scaling is straightforward.

**Stateful services** — a server holds per-user sessions in memory, active WebSocket connections, or data on local disk. Adding a new instance doesn't help existing users on other servers. Removing an instance loses their session state.

Solutions:
- **Externalize state:** move sessions to Redis. Every server becomes stateless. Sessions survive instance termination. Auto-scaling works freely. This is the standard pattern for web applications.
- **Drain before terminate:** before removing an instance, stop routing new requests to it (deregister from load balancer). Wait for existing connections to close naturally (drain timeout). Only terminate after the drain. Kubernetes `terminationGracePeriodSeconds` and ALB deregistration delay implement this.
- **Consistent hashing for assignment:** new users go to new servers, existing users stay on their server (sticky routing). Works until a server dies and its users must reconnect.

> **Follow-up you'll get:** "What is KEDA and how is it different from HPA?" — Kubernetes HPA scales based on CPU and memory from the cluster's internal metrics. KEDA (Kubernetes Event-Driven Autoscaler) scales based on *external* event sources: Kafka consumer group lag, SQS queue depth, Redis list length, HTTP request rate, custom Prometheus metrics. KEDA can also scale to **zero pods** when there's no work — HPA keeps at least 1 pod running. For a background worker that processes a queue, KEDA is the right tool: 0 pods when queue is empty, scale up based on queue depth, scale back to 0 when done.

### The three scaling policy types (from the HTML)

**Target Tracking** — tell the autoscaler to maintain a target metric level. "Keep average CPU at 70%." The autoscaler does the math: if actual is 80% and target is 70%, add instances. AWS ASG and Kubernetes HPA both support this. Simplest to configure — you just name the target.

**Step Scaling** — define explicit threshold bands. "If CPU 70–80%: add 1 instance. If CPU 80–90%: add 2. If CPU > 90%: add 4." More control, more config. Good when you know the workload well enough to tune the bands.

**Predictive Scaling (ML)** — the autoscaler learns your traffic pattern (weekly cycles, daily morning spikes) and scales ahead of the spike rather than reacting to it. AWS Predictive Scaling does this. Combines with reactive scaling as a fallback. Eliminates the "reaction lag" window where users experience degraded performance while scaling catches up.

**Scheduled Scaling** — cron-based. "At 8:45am every weekday, increase to 20 instances." No ML, no reaction lag. You know the spike is coming (lunch rush, market open, end-of-month batch jobs), so you provision ahead of time. Most production systems combine scheduled pre-scaling with reactive scaling for unpredictable events.

### Platform comparison (from the HTML)

| Platform | Tool | Key Feature |
|---|---|---|
| Kubernetes | HPA | CPU/memory/custom metrics, min 1 pod |
| Kubernetes | KEDA | Scale to zero, 50+ external scalers |
| AWS | ASG + Target Tracking | Predictive scaling, warm pools, mixed instances |
| AWS | Lambda | Per-request billing, instant scale, no infra management |
| GCP | Managed Instance Groups | Predictive autoscaling, per-instance metrics |
| Azure | VMSS Autoscale | Scale-in policy (newest/oldest first) |

### Cold start and warm pools

A "cold start" is the time between "we need more capacity" and "the new instance is serving requests." For a Java service: JVM startup + dependency initialization + cache warming can be 2–5 minutes. For Lambda: 100–500ms for the function container to spin up.

**Warm pool** (AWS): keep a pool of pre-initialized instances in a "stopped" state — already booted, already configured, just not receiving traffic. When the autoscaler fires, these instances start in seconds instead of minutes. You pay a reduced rate for stopped instances vs full running cost.

**Pre-warming**: for known large events (Super Bowl ad, product launch, Black Friday), manually increase capacity ahead of time. Cloud providers' load balancers (AWS ALB, CloudFront) also need pre-warming for sudden 100× traffic events — request it in advance or they'll throttle you.

**Golden rule from the HTML:** *Scale up on leading indicators (queue depth, request rate), scale down on trailing indicators (CPU). Queue depth tells you the future load; CPU tells you the current situation — you want to act before CPU spikes, not after.*

---

> 🔁 **Bridge into topic 10:**
> "Auto-scaling assumes you have time to react — that traffic ramps up and you catch up with it.
>
> Sometimes you don't. Sometimes a dependency is just *down*, right now, and no amount of capacity fixes it. So the last question of the session is the most important one: when part of your system is broken and you can't fix it in the next thirty seconds — what do you serve?"

## 10. Graceful Degradation


> 🗣️ **Say this to open:**
> "Last topic, and it's the one that separates systems that survive from systems that make the news.
>
> Open an Amazon product page. That single page is assembled from something like fifty different service calls — price, stock, reviews, recommendations, seller info, related items, delivery estimate.
>
> Now the recommendations service goes down. Just that one. What *should* happen?"

> ❓ **Ask the room:** Take answers. Almost everyone says "hide the recommendations." Then make the point sharp:
>
> *"Right — obviously. So why does so much production software return a 500 for the entire page instead? Because nobody decided in advance what was optional."*
>
> That's the whole topic. Graceful degradation isn't a library you install — it's **deciding, ahead of time, which parts of your product are allowed to disappear.**

**What it solves:** partial failures in a distributed system cascading into total failure — serve a reduced experience instead of returning an error page.
**What it does NOT solve:** the underlying failure itself — that's fault tolerance, replication (topic 3), and operational practices. Rate limiting the traffic causing overload — that's rate limiting (topic 7).

### Why distributed systems fail partially, not completely

A monolith fails completely or not at all. A distributed system has 10–50 services, each independently deployable. At any moment, 1 of those services might be degraded — overloaded, deploying, or hitting a bug in a specific code path. The question is: does that 1 failing service take down the whole user-facing experience?

Without graceful degradation, the answer is yes — because your main service calls the failing service, waits for a timeout (maybe 5 seconds), returns an error to the caller, and the user sees a 500 error page.

With graceful degradation, the main service detects the failure, substitutes a fallback (cached data, empty section, default value), and serves the rest of the page normally.

---

### Feature tiers — design what to drop first

Not all features are equally critical. Design them in priority tiers:

```
Tier 1 (must never fail): checkout, payment, auth, order confirmation
Tier 2 (important):       product pages, search, cart
Tier 3 (nice to have):    recommendations, personalization, reviews
Tier 4 (extras):          social sharing, live chat widget, badges
```

Give Tier 1 dedicated, isolated resources — its own database connections, its own thread pools, its own rate limits — that are never shared with lower tiers. Under load, shed Tier 4 first, then Tier 3 if needed. Tier 1 is never touched.

---

### Circuit Breaker — stop calling a service that's down

A circuit breaker is a proxy that tracks the health of a downstream service and stops forwarding calls when that service is clearly failing.

**States:**

```
CLOSED (normal):
  → Track recent call results (success/failure)
  → When failure rate > threshold (e.g., 50% in last 10 calls): trip → OPEN

OPEN (tripped):
  → Immediately return fallback — no network call, no timeout wait
  → After a configured time (e.g., 30 seconds): → HALF-OPEN

HALF-OPEN (probe):
  → Let one request through
  → If success: → CLOSED (recovered)
  → If failure: → OPEN again
```

The critical insight: in the OPEN state, you're not waiting for a timeout. You return the fallback in microseconds. If the recommendations service normally takes 200ms, and it's down (timeout = 5 seconds), a circuit breaker at OPEN means your page loads in 200ms instead of 5200ms. Multiply across millions of requests — that's the difference between degraded-but-usable and cascading failure.

The **fallback** is what makes it graceful: return a cached recommendation list from the last successful call, serve an empty section ("recommendations unavailable"), use a hardcoded default. Anything beats a 5-second hang followed by a 500 error.

> **Follow-up you'll get:** "When should I use retries vs circuit breakers?" — These solve different failure types and should never be confused. A **retry** is for transient failures: a brief network hiccup, a momentary overload that recovers in under a second. You retry once or twice, quickly (with exponential backoff). A **circuit breaker** is for sustained failures: a service that's down for minutes or hours. Retrying a sustained failure amplifies the problem — you're hammering a service that's trying to recover, making it worse. The circuit breaker recognizes the sustained pattern and stops all calls, giving the service breathing room. Use both: retry first, circuit breaker after the failure pattern is sustained.

---

### Bulkheads — contain failure to its own resource pool

A bulkhead on a ship divides the hull into compartments. If one floods, the watertight doors prevent it from flooding the rest.

In distributed systems: give each type of downstream call its own **thread pool** and **connection pool**, sized independently. A slow downstream can exhaust its own pool — it cannot affect the threads serving other features.

```
Checkout thread pool:          50 threads (high priority, SLA = 200ms)
Recommendations thread pool:   10 threads (low priority, SLA = 2s)
Review service thread pool:     5 threads (low priority, SLA = 3s)
```

The recommendations service starts timing out. Its 10 threads all block waiting for responses. Once all 10 are occupied, new recommendation requests get an immediate rejection (circuit breaker's OPEN state). The checkout service's 50 threads are completely unaffected — they were never shared.

Without bulkheads: one shared thread pool of 65 threads. The recommendations service hangs, consumes all 65 threads, and checkout starts timing out too. Total outage from one degraded service.

> **Follow-up you'll get:** "Does this only apply to microservices?" — No. You can implement bulkheads inside a monolith: separate thread pools per downstream (one for the DB, one for the email provider, one for the search service), separate connection pools per integration. The pattern is about isolating resource exhaustion, not about deployment topology. Hystrix (Netflix's circuit breaker library) ran entirely inside a monolith. Resilience4j does the same in modern Java. The principle is universal.

### Feature flags — deliberate degradation on your terms

A circuit breaker degrades automatically when error thresholds are hit. A feature flag degrades *proactively* — you decide ahead of time what to turn off before a high-risk event.

```python
if feature_flag("recommendations_enabled"):
    recs = get_recommendations(user_id)   # calls the recommendations service
else:
    recs = []   # empty list, no service call at all
```

Before a product launch or Black Friday, disable Tier 3 and Tier 4 features preemptively. Your checkout path has zero competition for resources from recommendation queries. No surprises, no cascading failures under unexpected load.

Feature flag systems (LaunchDarkly, Unleash, Flipt) let you toggle this in production without a deploy. That's the real power: your rollback is one switch flip, not a deployment pipeline.

### Timeouts everywhere — the most overlooked defense

Every downstream call must have a timeout. Without one, a hanging downstream (not failing, just slow) holds a thread indefinitely. Fifty simultaneous hanging calls hold fifty threads. Your thread pool is exhausted.

Three timeouts to set explicitly:
- **Connection timeout** — how long to wait to establish the TCP connection (2–5 seconds typically).
- **Read timeout** — how long to wait for the response after the connection is open (10–30 seconds).
- **Overall request timeout** — the ceiling on the entire call including retries (never more than your SLA budget).

The relationship between retries and circuit breakers:
- Set a short timeout (e.g., 5 seconds per attempt). Retry once or twice for transient failures.
- If failures are sustained across attempts, the circuit breaker trips to OPEN state.
- In OPEN state: no timeout wait, instant fallback, service gets recovery time.

### Real-world patterns (from the HTML)

**Netflix** — Hystrix (now Resilience4j) circuit breakers on every service-to-service call. Each service has a fallback: recommendations fall back to a cached "popular content" list. The system serves a slightly degraded experience instead of propagating failures.

**Amazon product page** — assembled from 50+ microservice calls. Each section has a fallback: recommendations → empty, reviews → cached from CDN, seller info → "sold by Amazon" default. Page renders in all cases.

**Twitter (2012–2015)** — "Fail Whale" era. Lack of bulkheads meant one slow downstream cascaded to the entire API. Post-incident engineering introduced per-service thread pools and admission control (Finagle), which eliminated the cascading failures.

### Graceful degradation anti-patterns (from the HTML context)

- **No fallback defined** — circuit breaker trips and there's nothing to serve. Users see errors anyway. Always define the fallback before the failure.
- **Fallback calls another failing service** — the fallback itself depends on something that's also degraded. Fallbacks must be self-contained (cached data, static content, default values).
- **Circuit breaker never tested** — the only way to know a fallback works is to test it in production (chaos engineering) or staging. A fallback that's never executed is a fallback that probably has a bug.
- **Too-aggressive timeouts** — timeouts so short that legitimate slow operations always trip the circuit breaker under normal load. Tune timeouts based on actual p99 latency of each downstream.

---

## Closing the session

> 🗣️ **Say this to close:**
> "Let's walk back through what we did, because there was a thread running through all of it.
>
> We started with one table that was too slow, and we **partitioned** it. Then we couldn't query by anything except the partition key, so we talked about **indexes** — and found out they behave differently once data is spread out. Then we admitted the server could die, so we **replicated**. Replication gave us reads but not writes, so we **sharded**. Sharding made adding servers dangerous, so we fixed that with **consistent hashing**. Then we realised the fastest query is the one you never run, and used **Bloom filters** to skip work entirely.
>
> Then we moved up the stack. **Rate limiting** for traffic from outside. **Backpressure** for traffic from inside. **Auto-scaling** to match capacity to demand. And **graceful degradation** for the moments when nothing else saves you.
>
> Every single one of those existed because the previous one left something unsolved. That's not a coincidence — that's how real architecture gets built. Nobody sits down and designs all ten of these on day one. You add each one when the previous design stops holding."

> ❓ **Final question to leave them with:** "Pick the system you work on. Which of these ten does it already have — and which one is it currently missing?"
>
> This is the single most valuable minute of the session. Let two or three people answer out loud. It converts everything abstract we just covered into something they'll act on Monday.

### The one thing to remember

Each technique owns exactly one problem. The value isn't in memorising all ten — it's in knowing **what each one cannot do**, so you stop reaching for the wrong tool. When someone proposes sharding to fix a slow query, or an index to fix write throughput, you'll hear it immediately.

