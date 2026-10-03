# System Design — The Complete Learning Path

A re-sequenced, sidebar-ready outline of the System Design course, with a content spec
for every lesson so the writing team can generate the actual page straight from this
file — no re-discovery needed.

---

## How to Read This File

**Three layers, three jobs:**

1. **Module** — sidebar section header. Plain, short, always visible.
2. **Lesson** — one page in the product. Has its own URL, its own tab set, its own
   right-rail.
3. **Sub-lesson** — a named concept inside that page, surfaced by name inside the
   lesson's tabs — never folded into a vague summary phrase.

**The core idea driving this version:** the problem, and the connection to what came
before it, is where 80% of real understanding comes from — once someone genuinely
feels the problem, the solution is easy to remember because it's obviously *for*
something. Everything else in a lesson is in service of that one connection landing
clearly. So the spec below leads with **Connects From** and **The Problem**, written
as one continuous thought, not a checklist item.

**Every Lesson gets a content-spec block, in this shape:**

```
### N.N  Lesson Label  (#anchor)
> CONNECTS FROM: one or two sentences, written as a natural handoff — where the
  previous lesson's story left a gap, and how that gap is exactly the problem this
  lesson opens with. Not "connects from X" as a label — the actual sentence a
  teacher would say out loud to bridge into this topic.

TABS (only the ones this lesson actually earns — see below):
- Overview: the mechanism, every named component, term, command, and number that
  exists in the source material — nothing paraphrased away. This is the tab where
  granularity matters most.
- Real-World: the analogy + grounded scenario that makes the mechanism click.
- Trade-offs: what you pay for this — cost, complexity, staleness, risk.
- Failure Modes: the named ways this breaks in production, and the fix for each —
  included only when the lesson actually has named failure modes (not every lesson
  does, and forcing one is worse than omitting it).
- Hands-On: a self-contained lab that lets a learner reproduce the lesson's problem
  and mechanism themselves — see the dedicated framework below. Included wherever a
  lesson's problem is genuinely simulate-able (most lessons); skipped for pure
  reference/lookup lessons and capstone decision guides where there's nothing to run.
- [occasional] Metrics / Scale Drivers / Deep Dive — added only when the lesson has
  enough distinct numeric or comparative content to earn its own tab instead of
  living inside Overview.

BRIDGE OUT: one sentence — the gap this lesson leaves open, which becomes the next
  lesson's Connects From.
```

**Tabs are not one-size-fits-all.** A reference lesson (e.g. "Key Ports Cheat Sheet")
gets Overview only. A first-principles lesson with real production incidents (e.g.
Caching, Circuit Breaker, Bloom Filters, Consistent Hashing) gets Overview +
Real-World + Trade-offs + Failure Modes + Hands-On, and sometimes a 6th tab where the
source has enough distinct numeric/comparative material (Rate Limiting's 5 algorithms,
Key Numbers' anchor tables) to deserve its own Metrics or Comparison tab rather than
crowding Overview. Decide per lesson — don't force a tab that has nothing to say.

**The Hands-On tab, framework (applied consistently wherever it appears):**
The goal is that a learner can either actually run this, or read it and immediately
understand exactly how they'd reproduce the lesson's real-world scenario on their own
— no ambiguity about what to install or what numbers to plug in.

```
**Hands-On**
- Prerequisites: the minimum a learner needs already installed/known before starting
  (e.g. "Docker installed," "basic SQL," "a free-tier cloud account") — kept minimal
  on purpose, so the barrier to starting is low.
- Setup: 2-3 concrete options across the spectrum of effort/cost, so a learner picks
  what fits them —
    - Local/free: a Docker one-liner or a local install, zero cost.
    - Cloud free-tier: the equivalent managed service on AWS/GCP/Azure, using each
      provider's free tier where one exists.
    - Managed/paid: the production-grade version, named, for learners who want to see
      the real thing (e.g. AWS ElastiCache instead of a local Redis container).
- Simulate the scenario: the exact load parameters that recreate the lesson's
  problem — concurrent users, requests/sec, read:write ratio, payload size, node
  count, CPU/memory spec — concrete numbers, not "simulate high load." Paired with
  the specific tool to generate that load (e.g. `redis-benchmark`, `k6`, `wrk`,
  `locust`) and the exact command/config to point it at the setup above.
- What to observe: the specific metric, log line, or dashboard reading that proves
  the lesson's mechanism (or failure mode) actually happened — e.g. "watch cache hit
  rate drop to 0% for 2 seconds during the thundering herd, then recover."
- Stretch goal: one optional next step that applies the lesson's fix and lets the
  learner compare before/after (e.g. "add the SETNX lock from this lesson and re-run
  — the DB query count during the spike should drop by 95%+").
```

This is a checklist, not a rigid template — a lesson with a genuinely small hands-on
scope (e.g. CORS) gets a short version; a lesson built entirely around a production
incident (Caching, Rate Limiting, Circuit Breaker, Consistent Hashing) gets the full
version with real numbers.

**Naming rule, unchanged:**
- **Module names** — plain and short.
- **Lesson names** — short phrases with personality where it earns its keep.
- **Sub-lessons** — crisp, one concept each.

**Granularity rule (tightened this pass):** every named component, command, formula,
protocol field, or product mentioned in the source material must appear by name
somewhere in the lesson's Overview — a vocabulary table (Kafka's Topic/Partition/
Broker/Cluster/Consumer Group/Offset/Replica, Redis's actual commands like `SETNX`/
`ZADD`/`XREADGROUP`) does not get compressed into "the usual components" prose. If a
term exists in the source, it exists in this file, spelled out.

**Redundancy rule, unchanged:** where a failure mode, algorithm, or pattern would
otherwise be re-taught from scratch a second time (Circuit Breaker in both API Gateway
and Fault Tolerance; Thundering Herd in both Caching and CDN), the second occurrence
says **[SEE x.x]** and adds only the delta specific to that new context.

---

## AI Systems Has Moved

AI Systems is its own course — see `ai-systems-course-hierarchy.md`.

---

## Why This Order (and How Each Module Bridges to the Next)

This is the connective tissue the whole file is built around — every module ends by
opening a gap that the next module exists to close. Read top to bottom once, and the
whole course reads like one story, the same way the "in detail" scripts do at the
lesson level.

1. **Foundations** — you learn to estimate scale and describe trade-offs. But every
   estimate assumes two machines can already talk to each other. They can't, yet.
2. **Networking** → *closes that gap*: here's how machines actually talk. But once
   they can talk, immediately the next question is: talk about *what*, in *what
   shape*? A raw TCP socket isn't an API.
3. **APIs & Communication** → *closes that gap*: here's the shape of the conversation
   (REST, gRPC, events, streams). But now that a request has a defined shape, an
   attacker can send you one too. Nothing here checks who's asking.
4. **Security** → *closes that gap*: here's how you verify identity and protect the
   payload. But security policies have to be *enforced* somewhere on the request
   path — they don't enforce themselves.
5. **Infrastructure** → *closes that gap*: here's the machinery (gateways, meshes,
   proxies) that enforces those policies and keeps one service alive under load. But
   none of this matters if the service has nowhere to durably put the data it's
   processing.
6. **Storage** → *closes that gap*: here's where data actually lives, and how a
   database internally earns the guarantees you rely on. But every storage read is a
   disk trip, and disk is 100,000× slower than RAM — most of that latency is avoidable.
7. **Caching** → *closes that gap*: here's how to avoid the disk trip for hot data.
   But caching only works when one service owns one cache; the moment services need
   to *tell each other* something happened, a direct call creates tight coupling.
8. **Messaging** → *closes that gap*: here's how services communicate without calling
   each other directly. But the instant you have more than one copy of anything —
   a cache, a replica, a queue offset — the CAP theorem's bill comes due.
9. **Consistency** → *closes that gap*: here's the hard math of multiple copies of the
   truth. But knowing the *theory* of trade-offs doesn't tell you the concrete
   *playbook* for outgrowing a single machine.
10. **Scalability** → *closes that gap*: here's the reusable playbook (sharding, rate
    limiting, backpressure) for growing past one machine. But every pattern in that
    playbook silently assumes deeper machinery — leader election, gossip, consensus —
    that was never actually explained.
11. **Distributed Systems** → *closes that gap*: here's the theory and the papers
    underneath everything you just used. But all of this produces and moves data
    between systems — nobody's covered how that data actually *travels*.
12. **Data Pipelines** → *closes that gap*: here's how data moves between the stores
    and services you've built. But now you have a live, moving, distributed system —
    and you can't operate what you can't see.
13. **Observability** → *closes that gap*: here's how you watch it, alert on it, and
    debug it. You now know *what* every piece is — the last gap is *how big, how fast,
    how much* each piece actually costs and holds.
14. **Key Numbers** → *closes that gap*: here's the memorized numbers for fast
    estimation. With every concept and every number in hand, the only thing left is
    turning a requirement into a choice.
15. **Decision Guides** → *closes that gap, and closes the course*: given a
    requirement, which of everything above do you actually pick?

---


## Module 1 — Foundations
`(01-foundations.html)` — the vocabulary and trade-off habits every later module assumes you already own.

### 1.1  Design Interview Framework  `(#sd-framework)`
> Handed an open-ended prompt like "design Twitter" with no structure, most people
> either freeze or start drawing boxes with no plan — 45 minutes disappears with no
> coherent design and no real trade-off discussion. The fix isn't more knowledge,
> it's a repeatable sequence that turns a vague prompt into a bounded conversation.

**Overview**
- A 6-step sequence, each with a time budget: Requirements (5 min, clarify scope) →
  Estimation (5 min, size the problem numerically) → High-Level Design (10 min,
  sketch the big boxes) → Detailed Design (20 min, go deep on 2-3 components) →
  Trade-offs (5 min, name what you gave up) → Scaling (5 min, show it grows 10-100×).

**Real-World**
- Worked end-to-end on "Design Twitter": requirements in one sentence (users post
  tweets, follow others, view home timeline); estimation (500M users — 2 tweets/day
  — 100K sec — 10K writes/sec, read:write ratio 100:1); high-level design (client →
  LB → tweet service → DB + cache, timeline service reading from a fan-out cache);
  detailed design (fan-out-on-write vs fan-out-on-read, with a hybrid — push for
  normal users, pull for celebrities with 1M+ followers).

**Hands-On**
- Prerequisites: none — just a timer and something to sketch boxes on (paper,
  Excalidraw, a whiteboard app).
- Setup: no infra needed for this one — the "lab" is the framework itself.
- Simulate the scenario: set a 45-minute timer and design "a URL shortener" using
  the 6-step budget exactly as specified (5/5/10/20/5/5 min). Say your numbers out
  loud: pick a concrete DAU (say 10M), a read:write ratio (100:1 for URL shorteners,
  reads dominate), and a specific storage estimate (100M new URLs/year × 500 bytes
  ≈ 50GB/year).
- What to observe: whether you actually stopped at each time boundary, or blew past
  Requirements into Detailed Design without ever stating an NFR — that's the exact
  failure this framework prevents.
- Stretch goal: repeat with "design Instagram" and compare how much faster the
  second pass goes once the sequence is muscle memory.

**Bridge out:** the framework's first step says "define FR + NFR" without defining
either — that's exactly where 1.2 starts.

### 1.2  FR vs NFR  `(#fr-nfr)`
> The framework you just learned says "clarify requirements" — but "build a login
> page" only tells you *what* the system does, not *how well*. Is a 5-second login
> fine? Is going down for an hour a month acceptable? Two designers can both build a
> technically-correct login and end up with incompatible systems, because neither
> half of the requirement was ever stated.

**Overview**
- Functional Requirements (FR) = what the system does. Non-Functional Requirements
  (NFR) = how well it must do it. Every FR should ship paired with its NFR:
  - Homepage with posts/feed/navigation → Latency: loads in <1.5s (p99)
  - Stores customer data → Security: AES-256 at rest, TLS 1.3 in transit
  - Login/sessions → Scalability: 5,000 concurrent logged-in users/server
  - Always available 24/7 → Availability: 99.7% uptime (26h max downtime/year)
  - Mobile access → Compatibility: iOS 14+, Android 10+
  - Product search → Throughput: 10K searches/sec, <100ms response
  - Payments/checkout → Consistency: strong consistency, no double-charge
  - AI chat assistant → Latency (TTFT): first token <500ms, streams 50+ tokens/sec
  - RAG knowledge-base answers → Accuracy: <5% hallucination rate, grounded sources
  - AI image generation → GPU Throughput: image in <10s, 1K concurrent users/GPU
- The 4 core challenges NFRs exist to answer: too many users → horizontal scaling,
  load balancing, caching; too much data → sharding, tiered storage; low latency →
  caching, CDN, geo-distribution; high availability → replication, multi-region,
  graceful degradation.

**Hands-On**
- Prerequisites: none.
- Setup: no infra — a text editor and the FR list above.
- Simulate the scenario: pick any product you use daily (e.g. a food-delivery app)
  and write down 5 of its FRs, then force yourself to pair each with a numeric NFR —
  not "fast," but "order confirmation p99 < 2s"; not "reliable," but "99.9% order
  placement availability, 0% double-charge rate."
- What to observe: which NFRs you genuinely don't know the right number for — that
  gap is exactly what interviewers probe, and exactly what 1.3's SLI/SLO/SLA
  framework exists to make rigorous.
- Stretch goal: for one FR/NFR pair, name which specific architecture component
  (cache, queue, replica) would actually need to exist to hit that number.

**Bridge out:** naming "p99 < 200ms" and "99.9% available" is easy — but what a
percentile actually is, and what "nines" actually cost in downtime, is the next gap.

### 1.3  NFR Metrics & SLOs  `(#nfr-metrics)`
> You just learned to pair every FR with an NFR — but "fast" and "reliable" aren't
> engineering requirements until they're numbers everyone agrees on. Without that,
> nobody can say when a regression happened or whose fault it was.

**Overview**
- SLI (the measurement, e.g. p99 latency over a 5-min window) → SLO (your internal
  target, e.g. p99 < 200ms 99.9% of the time) → SLA (the contractual promise to
  customers, with a penalty if missed) — always SLA < SLO < actual performance,
  leaving headroom as your error budget.
- 11 metrics, each with its own measurement and the levers that move it: Latency
  (p50/p95/p99/p99.9; levers: cache, CDN, async, geo-PoP, fewer hops), Throughput
  (RPS/QPS/TPS; levers: horizontal scale, batching, sharding), Availability
  ("nines"; levers: redundancy, multi-AZ/region, failover, health checks),
  Durability (nines of durability; levers: 3× replication, erasure coding,
  cross-region backup, WAL), Reliability (error rate, MTBF, MTTR; levers: retries,
  circuit breakers, idempotency, runbooks), Scalability (cost/RPS; levers: stateless
  services, sharding, autoscale), Bandwidth (MB/s, Gbps; levers: compression, CDN,
  delta sync, batching), Storage (GB/TB/PB, retention; levers: TTL, compression,
  tiering, dedup), Consistency (strong/RYW/eventual, replica lag; levers: quorum
  R+W>N, Raft/Paxos, CRDTs), Security (CVE count, % encrypted; levers: OAuth2, mTLS,
  KMS, WAF, RBAC), Cost ($/1M req, $/GB-month; levers: spot, reserved, autoscale-down,
  caching).
- Percentiles beat averages because averages hide tail pain — a 100ms average can
  still mean 5% of users wait 2 seconds. p50 = the typical user, p95/p99 = the bad
  days, p99.9 = the angry tweets.
- The "nines" cheat sheet: 99% = 3.65 days/year down; 99.9% = 8.77h; 99.99% = 52.6
  min; 99.999% = 5.26 min; 99.9999% = 31.5 sec — each extra nine costs roughly 10×
  in replicas, multi-region setup, and chaos testing.

**Trade-offs**
- You can't maximize every NFR simultaneously — more nines of availability usually
  means weaker consistency or higher cost (the CAP/PACELC trade-off, in full in
  Module 9). State the SLO numerically ("p99 < 200ms, 99.99% available, 11 × 9
  durable") and derive the architecture from it, rather than designing first and
  hoping to hit a number later.

**Hands-On**
- Prerequisites: basic command line; `curl` installed.
- Setup: local/free — run any HTTP server locally (e.g. `python3 -m http.server`
  or a small Express app); cloud free-tier — hit a public API you don't control
  (e.g. a free weather API) to get real-world latency variance.
- Simulate the scenario: run 100 sequential requests with `curl -w "%{time_total}\n"
  -o /dev/null -s <url>` (or `for i in {1..100}; do curl ...; done`), save the 100
  timings to a file, then compute p50/p95/p99 yourself (sort the numbers, take the
  value at the 50th/95th/99th position).
- What to observe: how far the p99 is from the average — this is the "average hides
  tail pain" claim from the Overview, made concrete with your own numbers instead
  of taking it on faith.
- Stretch goal: install `hey` or `k6` and run a proper load test (`hey -n 1000 -c 50
  <url>`) to get p50/p95/p99 computed for you, then compare against your manual
  calculation.

**Bridge out:** these numbers assume you can just add resources to hit them — 1.4 is
the reality check on that assumption.

### 1.4  Scaling Basics  `(#scaling-basics)`
> You now have numeric targets to hit. The instinctive first move — "buy a bigger
> machine" — works for a while. Then it stops working, and that ceiling is the whole
> reason horizontal scaling exists.

**Overview**
- Vertical scaling (scale up) = a bigger machine, more CPU/RAM/IOPS. Simple, no code
  changes, but has a hardware ceiling and remains a single point of failure.
- Horizontal scaling (scale out) = more machines behind a load balancer. No ceiling,
  survives node failure, but introduces every distributed-systems problem
  (consistency, coordination, partial failure) vertical scaling never had to face.

**Trade-offs**
- Vertical = simple but capped and fragile. Horizontal = unlimited but you now own
  everything Modules 9-11 teach. Horizontal scaling's reward is roughly linear
  throughput growth — double the nodes, double the capacity.

**Hands-On**
- Prerequisites: Docker installed.
- Setup: local/free — run 3 copies of a simple HTTP server in Docker (`docker run
  -d -p 8081:80 nginx`, `-p 8082:80`, `-p 8083:80`); cloud free-tier — an AWS EC2
  t2.micro / GCP e2-micro free-tier instance running the same app, resized up once
  (t2.micro → t2.medium) to feel the vertical ceiling directly.
- Simulate the scenario: load-test a single instance with `k6` or `hey` at
  increasing concurrency (100 → 500 → 2,000 concurrent) until latency degrades or
  it errors out — that's the vertical ceiling. Then put the 3 Docker instances
  behind a simple round-robin proxy (NGINX or HAProxy) and re-run the same 2,000
  concurrent test.
- What to observe: the single instance's p99 climbing sharply near its ceiling,
  versus the 3-instance setup handling the same load with flatter p99 — the
  "roughly linear throughput growth" claim, observed directly.
- Stretch goal: kill one of the 3 backend containers mid-test and watch the load
  balancer keep serving from the other two — the survives-node-failure property
  vertical scaling structurally can't offer.

**Bridge out:** "any server can answer any request" sounds simple, until you ask
what happens to a logged-in user's session the moment their next request lands on a
different server.

### 1.5  Stateless vs Stateful  `(#stateless-stateful)`
> Horizontal scaling just promised "any server can answer any request." But a
> user's second request might land on a different server than their first — if that
> server doesn't remember who they are, every follow-up request looks like a fresh,
> logged-out visitor.

**Overview**
- Stateless = no memory between requests, every request self-contained. Stateful =
  the server remembers past interactions (a session held in local memory).
- Stateless servers scale by adding more of them — any instance serves any request,
  a crash loses nothing. Stateful servers need sticky sessions (same user → same
  server, every time via IP hash), and a crash loses that user's state entirely.
- Converting stateful → stateless: move session storage to Redis (a shared store
  every server reads from) or move auth to a JWT (the token itself carries user
  context, no server-side session needed at all).

**Real-World**
- Netflix's API servers are stateless with session in Redis. WhatsApp's WebSocket
  connections are stateful (pinned to a server) with presence tracked in Redis.
  Kubernetes Pods are designed to be killed and restarted anytime — which only
  works because they're stateless by design.

**Hands-On**
- Prerequisites: Docker installed; basic Node.js or Python.
- Setup: local/free — 2 app instances (Docker or 2 terminal windows on different
  ports) storing session in local memory; cloud free-tier — AWS ElastiCache free
  tier (or a local `docker run -d -p 6379:6379 redis`) as the shared store.
- Simulate the scenario: build a 5-line login endpoint that stores `{userId:
  loggedInAt}` in a local in-memory object (stateful version). Log in against
  instance A, then send your next request to instance B (simulate a load balancer
  round-robining you) — observe it treats you as logged out. Now swap the in-memory
  store for `redis.set(sessionId, userId)` / `redis.get(sessionId)` and repeat —
  both instances now recognize the session.
- What to observe: the exact moment the "different server, same user" failure
  happens with local state, and disappears once state moves to Redis.
- Stretch goal: kill instance A entirely mid-session (stateful crash = session
  lost) vs kill it after moving to Redis (session survives, because it never lived
  on that instance).

**Bridge out:** "externalize state to Redis" means writing an object somewhere — and
an object sitting in memory isn't the same thing as bytes on a wire.

### 1.6  Serialization  `(#serialization)`
> The fix for statefulness was "put the object in Redis" or "put it in a JWT" — but
> an object in your program's memory (pointers, live structure) can't be sent over a
> network or written to disk as-is. Something has to flatten it into bytes, and
> something on the other end has to rebuild it.

**Overview**
- Serialization converts an in-memory object into bytes/JSON/binary; deserialization
  reverses it. Needed in 5 recurring situations: sending over a network, persisting
  to disk, crossing a language boundary (Java → Python via Protobuf), populating a
  cache, and making an RPC call.
- Format trade-off: JSON (readable, verbose, slower to parse) vs Protobuf/Avro
  (compact, fast, schema-enforced, not human-readable) vs MessagePack (binary JSON)
  vs XML (verbose, mostly legacy).
- A Schema Registry (Confluent's, most commonly) is the central store for
  Avro/Protobuf schemas — it enforces compatibility rules so a producer can't ship
  a breaking change unnoticed. [SEE 8.9] for the full messaging-specific version of
  this.

**Trade-offs**
- Readable formats cost bandwidth and parse time; schema-based binary formats save
  both but require a shared schema and a build step.

**Hands-On**
- Prerequisites: any language with a JSON and Protobuf library (Python/Node/Go all
  work); `protoc` compiler installed for the Protobuf side.
- Setup: local/free only — this needs no infrastructure, just a script.
- Simulate the scenario: take a realistic object (a user profile with 10 fields —
  id, name, email, timestamps, nested address) and serialize the same 10,000
  instances two ways: `JSON.stringify` vs a compiled Protobuf message. Measure both
  the output byte size per record and the time to serialize+deserialize all 10,000.
- What to observe: Protobuf typically running 3-10× smaller and noticeably faster
  to parse — put your own two numbers next to the trade-off claim in Overview
  instead of taking it on faith.
- Stretch goal: change a field name in the JSON payload and see nothing break;
  then change a field number in the `.proto` file and recompile — feel directly
  why schema evolution is a designed process for binary formats and an
  afterthought for JSON.

**Bridge out:** none of the format lessons above explain *why* Redis, Nginx, and
Node.js can each serve huge numbers of connections without an army of threads —
that vocabulary (concurrency vs parallelism, blocking vs non-blocking) is assumed
everywhere from here on, so it gets defined once, now.

### 1.7  Concurrency & I/O Models  `(#concurrency-io)`
> "Just use more threads" is the reflexive answer to slowness — but threads are
> expensive, and the tools that actually handle massive concurrent load (Redis,
> Nginx, Node.js) barely use any. That looks contradictory until you separate two
> ideas people conflate.

**Overview**
- Process vs Thread: a process is isolated memory; a thread shares memory with its
  siblings — cheaper to create, riskier to coordinate.
- Concurrency (interleaving many tasks, not necessarily simultaneously) vs
  Parallelism (executing many tasks at the literal same instant, across multiple
  cores) — concurrency doesn't require multiple cores, parallelism does.
- CPU-bound work needs more cores; I/O-bound work mostly waits on network/disk, and
  adding threads there just means more idle, waiting threads.
- Blocking I/O (thread-per-connection) ties up a whole thread per waiting
  connection. Non-blocking I/O (an event loop) lets one thread watch thousands of
  connections and act only when one has data ready.

**Real-World**
- Redis: one thread + `epoll`. Nginx: a handful of worker processes, each its own
  event loop. Node.js: one thread + `libuv` + a small thread pool for genuinely
  blocking calls. Go: goroutines, scheduled M:N onto OS threads.

**Hands-On**
- Prerequisites: Node.js and Python both installed (to compare a non-blocking
  runtime against a naive blocking one).
- Setup: local/free only.
- Simulate the scenario: write a server that handles 500 concurrent requests, each
  doing a 1-second I/O wait (simulate with `sleep`/`setTimeout`, standing in for a
  slow DB call). Build it two ways: (a) Python with a thread-per-request model
  (`http.server` + `threading`, or plain synchronous Flask under `werkzeug`'s dev
  server) and (b) Node.js's default event loop (`express`, `await new
  Promise(r=>setTimeout(r,1000))`). Load-test both with `hey -n 500 -c 500 <url>`.
- What to observe: the thread-per-request version's memory footprint and thread
  count climbing with concurrency (watch it via `top`/Task Manager), versus the
  event-loop version handling the same 500 concurrent waits on a handful of OS
  threads — the "one thread, thousands of connections" claim, measured.
- Stretch goal: swap the 1-second I/O wait for genuine CPU-bound work (a busy-loop
  computing primes) instead of a sleep, and watch the event-loop version degrade —
  proving non-blocking I/O helps I/O-bound work specifically, not CPU-bound work.

**Bridge out:** most "slow at scale" problems are I/O-bound, and the fix is fewer
threads with non-blocking I/O — which is exactly the mechanism Networking's Event
Loop lesson (2.11) explains at the OS level.

---

## Module 2 — Networking
`(02-networking.html)` — the network is the first distributed system every learner has already used without thinking about it.

### 2.1  Journey of a URL  `(#web-request)`
> Foundations established that data travels as serialized bytes — but "type a URL,
> see a page" looks instantaneous, and knowing where each millisecond actually goes
> is the difference between guessing at a latency fix and finding it.

**Overview**
- 8 steps: parse URL → DNS lookup → TCP handshake → TLS handshake → HTTP request →
  server processing → HTTP response → render.
- HTTP/1.1 (mostly one request per round trip per connection) vs HTTP/2
  (multiplexes many requests over one connection) vs HTTP/3 (QUIC over UDP, removes
  head-of-line blocking entirely).
- Speed tricks, each really just skipping or overlapping one of the 8 steps: DNS
  prefetch, preconnect, HTTP/2 server push, edge caching, TLS 1.3 0-RTT.

**Hands-On**
- Prerequisites: a Chrome/Firefox browser (DevTools built in).
- Setup: none — this uses the browser you already have.
- Simulate the scenario: open DevTools' Network tab, hard-refresh (Ctrl+Shift+R) a
  site you don't visit often (so DNS/TLS aren't warm), and click the very first
  request. Read its timing waterfall: DNS Lookup, Initial Connection (TCP),
  SSL (TLS), Waiting (TTFB), Content Download — the same 8 steps, with real
  millisecond numbers next to each one.
- What to observe: which step actually dominates for that site — often DNS or TLS
  on a cold connection, almost always "Waiting" (server processing) if the backend
  is slow. Compare the same request on a second load (warm cache/connection) and
  watch DNS + Connection collapse to ~0ms.
- Stretch goal: repeat on a site served over HTTP/2 vs one still on HTTP/1.1
  (check the "Protocol" column), and open 6+ resources from the same origin to see
  HTTP/1.1's per-connection request limit vs HTTP/2 multiplexing them over one.

**Bridge out:** the journey name-drops DNS, TCP, and TLS as steps without explaining
any of them — but first, the layer model those steps all sit inside.

### 2.2  OSI Model  `(#osi)`
> The 8-step journey just crossed several network layers without naming them —
> "Layer 4" and "Layer 7" get used constantly starting with the very next module's
> Load Balancer lesson, so this is where those numbers earn their meaning.

**Overview**
- 7 layers, each with its own concern and protocols: Layer 7 Application (HTTP —
  what most engineers actually work at), Layer 6 Presentation (TLS/SSL, JSON,
  Protobuf — encryption and serialization), Layer 5 Session (WebSocket, RPC —
  connection management), Layer 4 Transport (TCP/UDP — sees IP+port only), Layer 3
  Network (IP, ICMP — routing, subnets, VPCs, BGP), Layer 2 Data Link (Ethernet, ARP
  — MAC addresses, switches), Layer 1 Physical (fiber/copper — the actual data
  center hardware).

**Hands-On**
- Prerequisites: terminal access; `ping`, `traceroute`/`tracert`, `curl` (all
  built-in on macOS/Linux; `tracert` on Windows).
- Setup: none.
- Simulate the scenario: run `ping google.com` (Layer 3, ICMP), then
  `traceroute google.com` / `tracert google.com` (Layer 3, shows every router hop),
  then `curl -v https://google.com` (Layers 4-7 visible in the verbose output: TCP
  connect, TLS handshake, then the HTTP request/response headers).
- What to observe: match each command's output to its OSI layer — `ping`/
  `traceroute` never see anything above L3 (no HTTP headers exist to them), while
  `curl -v` shows you TCP connect (L4), the TLS cipher negotiated (L6), and the
  actual `GET / HTTP/1.1` request line (L7) in one run.
- Stretch goal: run `curl -v` against an HTTP (not HTTPS) site and compare — no
  TLS handshake lines at all, a direct look at what L6 was doing for you.

**Bridge out:** only two of these 7 come up daily — L4 ("fast, blind to content")
and L7 ("slower, reads the actual request") — and that one distinction is what the
next lesson's transport-layer choice is actually about.

### 2.3  TCP vs UDP  `(#tcp-udp)`
> L4 was just named as "fast, blind to content" — this lesson is what actually
> happens at that layer, and why some data (a bank transfer) can never tolerate
> loss while other data (a live video frame) would rather be dropped than delayed.

**Overview**
- TCP = reliable, ordered, connection-based — a 3-way handshake (SYN → SYN-ACK →
  ACK) sets up sequence numbers so lost packets can be detected and retransmitted;
  flow and congestion control (sliding window, slow start) prevent it from
  overwhelming the receiver or the network. UDP = fire-and-forget, no handshake, no
  ordering or delivery guarantee.
- Unicast (one-to-one, TCP's default) vs Broadcast/Multicast (one-to-many,
  UDP-only).
- Real ports in practice: TCP carries banking, HTTPS, DB connections, email (ports
  80/443/3306/5432/6379/9092). UDP carries live video, gaming, DNS, VoIP, and QUIC
  a.k.a. HTTP/3 (ports 53/123/443).

**Real-World**
- Fortnite and Valorant use UDP for player positions (a late position update is
  useless, so don't wait for a retransmit). Chrome, YouTube, and Cloudflare all use
  QUIC/HTTP3 in production.

**Hands-On**
- Prerequisites: Python or Node.js installed; `nc` (netcat) optional.
- Setup: none — pure local sockets.
- Simulate the scenario: write a minimal TCP echo server + client (Python's
  `socket.SOCK_STREAM`) and a minimal UDP echo server + client (`SOCK_DGRAM`).
  Send 1,000 messages over each, then deliberately introduce loss by killing and
  restarting the UDP receiver mid-stream.
- What to observe: the TCP client blocks/retries and eventually delivers every
  byte in order even after a receiver hiccup; the UDP client simply loses whatever
  was sent during the gap, with no error and no retransmission — the exact
  trade-off named in Overview, reproduced instead of assumed.
- Stretch goal: use Wireshark (free) to capture both sessions and see the TCP
  3-way handshake (SYN/SYN-ACK/ACK) frames explicitly, versus UDP's complete
  absence of any handshake before the first data packet.

**Bridge out:** TCP is the reliable transport HTTP rides on — the next lesson is
what happens once you wrap that transport in encryption.

### 2.4  HTTP vs HTTPS  `(#http-https)`
> TCP just gave you a reliable pipe — but plain HTTP sends everything over that
> pipe as readable text: passwords, cookies, page content. Anyone on the network
> path (a coffee-shop router, an ISP) can read or modify it in flight.

**Overview**
- HTTP methods and their properties: GET (safe, idempotent, cacheable), POST (not
  safe, not idempotent), PUT (idempotent), PATCH (not idempotent), DELETE
  (idempotent). Status code families: 2xx success (200 OK, 201 Created, 202
  Accepted, 204 No Content, 206 Partial Content), 3xx redirect (301/302 permanent/
  temporary, 304 Not Modified, 307/308 redirect-preserving-method), 4xx client
  error (400/401/403/404/405/408/409/410/413/415/422/429/451), 5xx server error
  (500/501/502/503/504).
- HTTPS = HTTP wrapped in TLS. The TLS handshake happens once per connection, right
  after the TCP handshake: ClientHello → ServerHello + certificate → key exchange →
  Finished — every byte after that point is encrypted (TLS 1.3 shortens this to
  one round trip, sometimes zero with 0-RTT).
- HTTPS's 4 guarantees: confidentiality (nobody reads it), integrity (nobody
  modifies it undetected), authenticity (you know who you're talking to), forward
  secrecy (a stolen key today doesn't decrypt yesterday's traffic).

**Hands-On**
- Prerequisites: `curl`, `openssl` (both usually preinstalled).
- Setup: none — test against any public site plus a local plain-HTTP server
  (`python3 -m http.server`, which serves HTTP only).
- Simulate the scenario: run `curl -v http://<your-local-server>` and read the
  headers in the clear (no TLS lines at all) — this is exactly what a
  coffee-shop router could see. Then run `openssl s_client -connect
  google.com:443` and observe the certificate chain and negotiated cipher suite.
  Finally hit a few endpoints with different methods (`curl -X POST`, `curl -X
  PUT`, `curl -X DELETE`) against a test API (e.g. `httpbin.org`) and inspect the
  status codes returned for each.
- What to observe: the complete absence of encryption metadata on the plain-HTTP
  request vs the full handshake detail on the HTTPS one; and that calling DELETE
  twice on the same resource returns the same result both times (idempotent)
  while two POSTs create two separate resources (not idempotent).
- Stretch goal: use `openssl s_client -connect <host>:443 -tls1_3` vs forcing
  `-tls1_2` and compare the number of round trips shown before "Verify return
  code" — TLS 1.3's 1-round-trip handshake vs TLS 1.2's 2.

**Bridge out:** HTTP methods assume you already know what happened to step 2 of
the 8-step journey — the actual lookup that turns a name into an address.

### 2.5  DNS  `(#dns)`
> Step 2 of the journey was "DNS lookup," stated without explanation — servers are
> addressed by IP, but humans and configs want names, and something has to map one
> to the other, fast, cached, and eventually consistent across the whole planet.

**Overview**
- Full resolution path: browser cache → OS cache → resolver → root server → TLD
  server → authoritative server → answer, cached at every hop with a TTL.
- 8 record types: A/AAAA (IPv4/IPv6 address), CNAME (alias to another name), ALIAS/
  ANAME (a CNAME-like alias usable at a zone's apex, where plain CNAME isn't
  allowed), MX (mail server), TXT (verification/SPF), SRV (service + port), NS
  (nameserver), CAA (who's allowed to issue TLS certs for this domain).
- Routing policies beyond a plain answer: Simple, Weighted (canary rollouts),
  Latency-based, Geolocation, Failover, Multivalue, and GeoDNS + Anycast combined
  (route to the nearest healthy replica).

**Failure Modes**
- A too-long TTL means a dead server keeps receiving traffic long after it's gone
  — DNSSEC prevents a different failure (response tampering), not staleness.

**Hands-On**
- Prerequisites: `dig` (macOS/Linux) or `nslookup` (Windows).
- Setup: none — a free-tier DNS zone on Route 53/Cloudflare DNS is a good stretch
  option if you want to edit real records.
- Simulate the scenario: run `dig google.com` and `dig +trace google.com` — the
  second one shows the full root → TLD → authoritative resolution path from
  Overview, hop by hop, with the actual server IPs and TTLs at each step. Then run
  `dig MX google.com`, `dig TXT google.com`, and `dig NS google.com` to see 3 of
  the 8 record types on a real domain.
- What to observe: the TTL value returned at each hop, and how it drops on a
  second `dig` run within that TTL window (cached, doesn't re-query) versus a
  fresh lookup after it expires.
- Stretch goal: if you have a free-tier Route 53 or Cloudflare DNS zone, create a
  Weighted or Failover routing record and query it repeatedly to see the
  responses shift — the canary-rollout pattern named in Overview, live.

**Bridge out:** DNS resolves a name to an IP address — the next lesson is what that
address actually is, and how ranges of them get carved up.

### 2.6  IP & CIDR  `(#ip-cidr)`
> DNS just resolved a name into an IP address — this lesson is what that address
> actually is, and how blocks of them get sized for a VPC before that VPC runs out
> of room.

**Overview**
- CIDR notation (`10.0.0.0/24`): the suffix is the number of fixed network bits — a
  smaller suffix means a bigger address block. Sizing table: `/32` = 1 host (a
  single allow-listed IP), `/28` = 16 hosts (a NAT gateway/bastion), `/24` = 256
  (one AZ), `/20` = 4,096 (a K8s pod CIDR), `/16` = 65,536 (a VPC per region), `/8`
  = 16.7M (an entire org).
- Private ranges (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — every
  VPC is built from one of these.

**Failure Modes**
- `172.17.0.0/16` is Docker's default bridge network — reusing that exact range for
  a VPC creates a silent routing conflict the moment a container tries to reach it.

**Hands-On**
- Prerequisites: an AWS free-tier account (or `ipcalc`/an online CIDR calculator
  for the no-signup version).
- Setup: cloud free-tier — AWS VPC console (free, no running resources needed);
  local/free — `ipcalc 10.0.0.0/24` or any online CIDR calculator.
- Simulate the scenario: create a VPC with CIDR `10.0.0.0/16` (65,536 addresses),
  then carve 2 subnets from it: `10.0.1.0/24` (256 addresses, one AZ) and
  `10.0.2.0/24`. Calculate by hand how many usable IPs each subnet has (256 minus
  5 AWS reserves it automatically), then verify against the console.
- What to observe: attempting to create a third subnet with an overlapping range
  like `10.0.1.128/25` — AWS will reject it, a direct, safe way to feel why CIDR
  blocks can't overlap.
- Stretch goal: check your home Wi-Fi or Docker's default network range
  (`docker network inspect bridge`) and confirm it's inside `172.17.0.0/16` — then
  understand why that's exactly why a VPC should avoid that range if you'll ever
  connect to it via VPN.

**Bridge out:** IP & CIDR gets traffic to the right machine — ports get it to the
right process on that machine.

### 2.7  Key Ports Cheat Sheet  `(#key-ports)`
> IP & CIDR routes to a machine; a port routes to a specific process on it — and
> these exact numbers are what Security Groups and NACLs filter on in the very next
> lesson.

**Overview**
- SSH 22, DNS 53, HTTP 80, HTTPS 443, app servers 8080/8443 (non-privileged),
  MySQL 3306, PostgreSQL 5432, Redis 6379, Kafka 9092, Elasticsearch 9200, MongoDB
  27017, etcd 2379 (client) / 2380 (peer, requires mTLS) — ports below 1024 need
  root/admin to bind.

**Failure Modes**
- Redis has no auth by default — always set `requirepass` + ACLs. Elasticsearch and
  MongoDB should never be bound to a public interface; bind to a private IP with
  auth enabled.

**Hands-On**
- Prerequisites: `nmap` installed (or `nc -zv` as a lighter substitute).
- Setup: local/free — `docker run -d -p 6379:6379 redis` (Redis with no password,
  intentionally, to see the failure mode) plus `docker run -d -p 27017:27017
  mongo`.
- Simulate the scenario: run `nmap localhost` to see which of these ports are open
  on your machine right now. Then `redis-cli -h localhost ping` — with default
  settings, it just works, no password asked.
- What to observe: that an open, unauthenticated Redis port answers `PONG` to
  anyone who can reach it — the exact failure mode named above, reproduced safely
  on your own machine. Then run `docker exec -it <container> redis-cli` and
  `CONFIG SET requirepass mypassword`, restart your `redis-cli ping` and watch it
  now require `AUTH mypassword` first.
- Stretch goal: on a cloud free-tier VM, run `nmap` against its public IP from
  your laptop and confirm only the ports you explicitly opened in its Security
  Group actually respond — the practical link into the very next lesson.

**Bridge out:** these are exactly the numbers a firewall rule filters by name —
which is the very next lesson.

### 2.8  Firewalls — SGs vs NACLs  `(#firewalls)`
> These ports are exactly what a firewall filters — without one, every port on
> every machine in a VPC is reachable from anywhere, and one misconfigured service
> becomes an open door.

**Overview**
- Security Groups = stateful, instance-level (attached to a machine, remembers
  connection state; ~60 rules per SG, 5 SGs per network interface). NACLs =
  stateless, subnet-level (evaluates every packet independently; ~20 rules per NACL
  as a soft limit) — two independent layers, so a mistake in one doesn't
  automatically expose everything.
- The Kubernetes-native equivalent: NetworkPolicy (implemented by Calico or
  Cilium) for pod-to-pod rules, with Istio layering L7-aware policy on top.

**Hands-On**
- Prerequisites: AWS free-tier account.
- Setup: cloud free-tier — a free-tier EC2 instance in a VPC you control.
- Simulate the scenario: launch an EC2 instance with a Security Group allowing
  only port 22 from your own IP. Try to `curl` port 80 on it from your laptop
  (should time out — nothing's listening AND it's not allowed). Install nginx on
  the instance, then try again — still blocked, because the SG doesn't allow 80
  yet. Add an SG rule allowing 80 from `0.0.0.0/0` and retry.
- What to observe: the exact moment the request starts succeeding is tied to the
  SG rule, not the server config — nginx was serving the whole time, the SG was
  the thing stopping traffic from reaching it (stateful: your reply traffic is
  automatically allowed back out, no separate outbound rule needed).
- Stretch goal: add a NACL on the subnet that explicitly denies port 80 inbound
  and watch it override the permissive SG — a direct demonstration of "two
  independent layers" from Overview, where NACLs evaluate every packet
  statelessly regardless of what the stateful SG already decided.

**Bridge out:** a firewall assumes anything already inside the perimeter is
trusted — Zero Trust is the explicit rejection of that assumption.

### 2.9  Zero Trust Networking  `(#zero-trust)`
> Traditional firewalls assume "inside the VPC = trusted." One compromised service
> inside that perimeter can then reach everything else inside it, unchecked — the
> perimeter was the only defense, and it just failed.

**Overview**
- "Never trust, always verify" — 8 pillars: service identity (SPIFFE/SPIRE), mTLS
  between every service pair, device posture verification, a policy engine (OPA)
  deciding allow/deny, certificate management issuing short-lived identities,
  micro-segmentation (narrow, purpose-specific network zones instead of one flat
  network), continuous verification (re-checking, not just checking once at
  connection time), and observability logging every decision.

**Real-World**
- Google's BeyondCorp removed the VPN entirely — every access request, inside or
  outside the office network, goes through the same identity-aware proxy
  (Cloudflare Access and Google IAP are the productized versions of this idea).

**Trade-offs**
- Meaningfully more operational overhead (certs, policy engine, sidecars) in
  exchange for containing lateral movement after any single breach.

**Hands-On**
- Prerequisites: Docker and `docker-compose` installed; basic familiarity with a
  service mesh is helpful but not required.
- Setup: local/free — a minimal Istio or Linkerd install on a local Kubernetes
  cluster (`kind`/`minikube`, both free); cloud free-tier — a managed K8s free
  tier (GKE/EKS) with the mesh add-on.
- Simulate the scenario: deploy 2 services (`service-a`, `service-b`) in the mesh
  and confirm they can call each other. Then check `istioctl proxy-config` (or
  the mesh's equivalent) to confirm mTLS is active between them — capture traffic
  with `tcpdump` on the pod network and confirm the payload is encrypted even
  though it's "inside" the cluster.
- What to observe: an mTLS handshake happening for pod-to-pod traffic that never
  leaves your own cluster — proof that "inside the network" isn't treated as
  automatically trusted, the core Zero Trust claim, made visible in a packet
  capture.
- Stretch goal: write an OPA policy that denies `service-a → service-b` on a
  specific path and confirm the call is rejected even though network-level
  connectivity exists — decoupling "can reach" from "is allowed."

**Bridge out:** Zero Trust defends against a threat already inside your network —
the next lesson is what stops a flood before it ever gets that far.

### 2.10 DDoS Defense  `(#ddos-defense)`
> Zero Trust assumes an attacker is already inside. A DDoS attack doesn't need to
> get inside at all — it just needs to send more traffic than your infrastructure
> can physically absorb, and no amount of auto-scaling helps if the flood exceeds
> your entire capacity ceiling.

**Overview**
- Multi-layer defense, one tool tier per layer: L3/L4 volumetric — Cloudflare
  Magic Transit, AWS Shield Advanced; L7 application — Cloudflare WAF, AWS WAF,
  Akamai Kona; bot/credential abuse — Cloudflare Bot Management, PerimeterX,
  DataDome; DNS-layer attacks (amplification, NXDOMAIN floods) — Route 53 Shield,
  Cloudflare DNS; API abuse — Kong, Apigee, AWS API Gateway.

**Failure Modes**
- Volumetric (L3/L4): SYN flood, UDP amplification, ICMP flood — try to exhaust raw
  bandwidth or connection tables. Application (L7): HTTP flood, Slowloris,
  cache-busting — much lower traffic volume, harder to distinguish from real users.

**Metrics**
- Cloudflare absorbed a 71M RPS attack in 2023; GitHub survived a 1.35 Tbps
  memcached-amplification attack in 2018 — useful anchors for what "big" means.

**Hands-On**
- Prerequisites: `k6` or `hey` installed; a cloud free-tier account if you want a
  WAF in front of the target.
- Setup: local/free — your own local server behind a local rate limiter (NGINX's
  `limit_req` module); cloud free-tier — a free-tier app behind AWS WAF or
  Cloudflare's free plan.
- Simulate the scenario: run `hey -n 5000 -c 200 <your-local-url>` against a
  plain, undefended local server — watch it either fall over or slow drastically.
  Then add NGINX's `limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;`
  in front of it and re-run the exact same load.
- What to observe: response codes shifting from mostly-200 (server overwhelmed,
  or crashing) to a mix of 200s and 429s (Too Many Requests) once the limiter is
  in place — the L7 defense pattern, felt directly at a scale you can run on a
  laptop, standing in for the L3/L4 volumetric case that needs real edge
  infrastructure to demonstrate.
- Stretch goal: if you have a Cloudflare free-tier zone, enable "I'm Under
  Attack" mode and observe the JS challenge page it inserts in front of your
  origin during the same load test.

**Bridge out:** stopping a flood at the edge is one problem; the very last
Networking concept is how one thread on one machine survives 100K real, legitimate
connections without drowning.

### 2.11 Event Loop & I/O Multiplexing  `(#event-loop)`
> Foundations introduced "one thread, many connections" as a concept — this is the
> actual OS mechanism that makes it possible, and it's the reason NGINX and Redis
> can each handle huge concurrent load on a small number of threads.

**Overview**
- A thread per connection doesn't scale to 100K concurrent connections — most sit
  idle, waiting for data, burning memory and context-switch time. An event loop is
  a single thread that asks the OS "which of these 10,000 sockets actually has data
  ready?" instead of dedicating a thread to each one.
- `select`/`poll` (older, O(n) scan of every socket) gave way to `epoll` (Linux) and
  `kqueue` (BSD/macOS) — both O(1), "tell me only the ready ones" — and `io_uring`
  (newest Linux), which further cuts syscall overhead via zero-copy, async
  submission (adopted by systems like TigerBeetle and Seastar).

**Hands-On**
- Prerequisites: Linux or macOS (for `strace`/`dtruss`); Python or Node.js.
- Setup: local/free only.
- Simulate the scenario: run your Node.js event-loop server from lesson 1.7 under
  `strace -e trace=network -f node server.js` (Linux) and watch the syscall trace
  as you send it 50 concurrent connections (`hey -n 500 -c 50`) — look specifically
  for `epoll_wait` calls.
- What to observe: one thread issuing a small number of `epoll_wait` calls that
  each report back multiple ready sockets at once, instead of one syscall per
  connection per check — the O(1) "tell me only the ready ones" claim, seen
  directly in the syscall trace rather than taken on faith.
- Stretch goal: write the same 50-connection test against a naive thread-per-
  connection server (from 1.7) and compare thread counts via `ps -eLf | wc -l`
  before and during the load — 50 new OS threads appearing vs the event-loop
  version's thread count staying flat.

**Bridge out:** this exact mechanism is why NGINX (5.4) and Redis (7.4) can each
serve huge concurrent load on a handful of threads — Networking ends here, and
Module 3 assumes this as background from the first lesson on.

---

## Module 3 — APIs & Communication
`(04-apis.html)` — now that two machines can talk (Module 2), what shape should that conversation take?

### 3.1  REST API  `(#rest)`
> Networking ended on "machines can exchange bytes over HTTP" — but two services
> still need a shared, predictable convention for "how do I ask you for a resource,
> and how do you shape the answer." Without one, every integration is a bespoke
> negotiation.

**Overview**
- Stateless, resource-oriented HTTP using verbs as the action and URLs as the
  resource address. A REST URL's anatomy: method (verb) — protocol — subdomain —
  version — endpoint (resource path) — filtering (query params) — pagination
  (cursor/offset params), 7 distinct, negotiated parts in one string.
- Conventions worth following by name: nouns, not verbs, in the path
  (`/orders`, not `/getOrders`); plural resource names; cursor pagination over
  offset ([SEE 3.10]); idempotency keys on POST ([SEE 3.5]).

**Hands-On**
- Prerequisites: Node.js or Python; `curl` or Postman.
- Setup: local/free — a minimal Express/Flask app with `GET /orders`,
  `POST /orders`, `GET /orders/:id`, `DELETE /orders/:id` backed by an in-memory
  array; cloud free-tier — deploy the same app to a free-tier host (Render,
  Railway, Fly.io) to test it over real HTTPS.
- Simulate the scenario: build the 4 endpoints above following the naming
  conventions from Overview, then hit each with `curl -X POST`, `curl -X GET`,
  `curl -X DELETE` and confirm the status codes match the method's stated
  properties (GET repeated = same result every time; DELETE on an already-deleted
  ID = idempotent, same end state; POST repeated = a new resource each time).
- What to observe: calling `DELETE /orders/5` twice in a row — both should leave
  the system in the same state (idempotent), while calling `POST /orders` twice
  with the same body creates two different resources with two different IDs.
- Stretch goal: add cursor-based pagination to `GET /orders?after=<id>&limit=20`
  and compare its behavior against a naive `?page=3&size=20` version when you
  insert a new row mid-list — [SEE 3.10] for why one shifts and the other doesn't.

**Trade-offs**
- Universally understood and cacheable by default, but chatty (multiple round
  trips for nested resources) and imprecise about which fields a client actually
  needs.

**Bridge out:** REST's cost per call — text parsing, one request per round trip —
becomes a real ceiling the moment call volume is internal and high.

### 3.2  gRPC  `(#grpc)`
> REST/JSON over HTTP/1.1 is fine for a public API, but too slow and chatty for
> high-volume service-to-service calls inside a system — text parsing and one
> request per round trip add up fast at internal scale.

**Overview**
- gRPC = HTTP/2 + Protobuf (binary, schema-defined messages), same request/response
  idea as REST but compiled and binary instead of parsed text.
- 4 call types over one HTTP/2 connection, each with a natural example method
  signature: Unary (`GetUser()` — 1 request, 1 response), Server-streaming
  (`ListPrices()` — 1 request, many responses), Client-streaming (`UploadFile()` —
  many requests, 1 response), Bidirectional (`Chat()` — both sides stream
  simultaneously).

**Trade-offs**
- Roughly 10× faster than REST for internal traffic, but not human-readable on the
  wire, requires a shared `.proto` schema and code generation, and isn't natively
  browser-friendly.

**Hands-On**
- Prerequisites: `protoc` and a gRPC library for your language (`grpc-tools` for
  Node, `grpcio` for Python).
- Setup: local/free only.
- Simulate the scenario: define a simple `.proto` with a `GetUser` unary RPC and a
  `ListOrders` server-streaming RPC, generate the client/server code with
  `protoc`, and implement both. Build the same `GetUser` call as a REST/JSON
  endpoint too. Load-test both with 1,000 sequential calls and compare total time
  and payload size per call.
- What to observe: the gRPC payload being visibly smaller (binary vs JSON text)
  and the round trip noticeably faster — put your own numbers next to the "10×
  faster" claim from Trade-offs.
- Stretch goal: implement the bidirectional-streaming `Chat()` pattern and connect
  two clients to it simultaneously — watch messages flow both directions on the
  same open connection, something a REST unary call structurally can't do.

**Bridge out:** gRPC fixed REST's cost problem, but not REST's shape problem — a
client either over-fetches or under-fetches from a fixed response shape.

### 3.3  GraphQL  `(#graphql)`
> A mobile client needs 3 fields; a web client needs 15 different ones from the
> same resource. With a fixed REST response shape, one endpoint either over-fetches
> for the mobile client or under-fetches for the web client.

**Overview**
- The client specifies exactly which fields it wants, in a single request to a
  single endpoint, against a strongly-typed schema.

**Failure Modes**
- N+1 queries: a naive resolver fetches a list, then fetches each item's related
  data one at a time — fixed with a batching layer like DataLoader. Deep query
  DoS: a maliciously deep/nested query can force expensive resolution — fixed with
  depth limiting and query-cost analysis.

**Trade-offs**
- Eliminates over/under-fetching, but shifts complexity to the server and makes
  HTTP-level caching harder, since every query can be shaped differently.

**Hands-On**
- Prerequisites: Node.js; Apollo Server or `graphql-yoga` (both free, npm-
  installable).
- Setup: local/free only.
- Simulate the scenario: build a schema with `User { id, name, orders: [Order] }`
  and a naive resolver where `orders` triggers one DB query per user. Query a list
  of 20 users each with their orders, and log every DB call your resolver makes.
- What to observe: 21 queries firing (1 for users + 20 for each user's orders) —
  the N+1 problem, reproduced exactly as named in Failure Modes. Then add
  DataLoader to batch the `orders` lookups and re-run the same query.
- Stretch goal: send a deliberately deep, nested query (e.g. `user { orders {
  user { orders { user { ... } } } } }` nested 10 levels) against your unprotected
  schema and watch resolution time balloon — then add `graphql-depth-limit` and
  confirm the same query gets rejected before it ever resolves.

**Bridge out:** GraphQL solved the shape of a fast response — it says nothing about
what happens when a response can't be fast at all.

### 3.4  Async APIs  `(#async-apis)`
> Every pattern so far assumed a request finishes fast enough that the client can
> just wait. Some operations — video transcoding, report generation — genuinely
> take minutes, and holding an HTTP connection open that long wastes a connection
> slot and risks a timeout before the work even finishes.

**Overview**
- Accept the request immediately (return a job ID), process in the background, let
  the client check back later. 3 places a request can fail, each needing different
  handling: before reaching the server (network drop), mid-processing (server
  crash after starting), or after completing but before the response is delivered
  (response lost).
- Getting the result back: polling (client asks repeatedly), webhook (server calls
  the client back), or WebSocket (a persistent connection pushes it the moment it's
  ready) — [SEE 3.11] for the full menu of real-time delivery options.

**Hands-On**
- Prerequisites: Node.js or Python; a simple job queue is optional (an in-memory
  array works fine for the lab).
- Setup: local/free only.
- Simulate the scenario: build `POST /jobs` that returns `{jobId, status:
  "pending"}` immediately, kicks off a fake 10-second background task (a
  `setTimeout`), and stores its result keyed by `jobId`. Build `GET /jobs/:id` for
  the client to poll. Write a client that polls every 2 seconds until `status`
  becomes `"done"`.
- What to observe: the initial `POST` returning in milliseconds regardless of how
  long the actual work takes, versus what would happen if you'd kept that
  connection open for the full 10 seconds instead (try it both ways and compare
  how each behaves if you kill the client mid-request).
- Stretch goal: swap polling for a webhook — have the background task `POST` the
  result to a callback URL you control (use a free tool like webhook.site to see
  it land) instead of making the client ask.

**Bridge out:** every one of those 3 failure scenarios ends the same way — the
client, unsure if the request succeeded, retries. Whether that retry is safe is the
very next question.

### 3.5  Idempotent APIs  `(#idempotent-apis)`
> A payment request times out. Did it succeed and the response got lost, or did it
> fail before reaching the server? The client can't tell — and a naive retry
> (or worse, a naive `if(!exists(key)) then process()` check) has a race condition
> that can charge a card twice.

**Overview**
- An idempotent API guarantees calling it N times has the same effect as calling it
  once. Stripe's pattern: the client generates an idempotency key before the first
  attempt; the server uses `SET key value NX EX 86400` — a single atomic
  check-and-set with a TTL for automatic cleanup — to claim that key, processes
  once, and stores the result. Any retry with the same key gets the stored result
  back instead of reprocessing.
- The race condition this closes: a plain "check if it exists, then act" is two
  separate operations, and two concurrent requests can both pass the check before
  either writes — `SETNX` (set-if-not-exists) does both atomically in one step, so
  only one request can ever win the claim.

**Hands-On**
- Prerequisites: Docker (for Redis); Node.js or Python.
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: build a `POST /charge` endpoint that reads an
  `Idempotency-Key` header, does `SET idem:<key> "processing" NX EX 86400` in
  Redis, and only actually charges (increments an in-memory counter) if that SET
  succeeded. Fire 20 concurrent requests with the *same* idempotency key using
  `hey -n 20 -c 20 -H "Idempotency-Key: abc123"`.
- What to observe: the charge counter incrementing exactly once despite 20
  concurrent attempts — the race condition described in Overview, closed. Then
  remove the `NX` (making it a plain `SET`, no atomicity) and re-run — watch the
  counter increment more than once under concurrency.
- Stretch goal: store the actual response body alongside the key so a retry with
  the same key returns the original success response instead of a generic
  "already processed" message — Stripe's actual behavior.

**Bridge out:** the `SETNX` lock used here doesn't get its own explanation until
Caching's Redis Distributed Locks lesson (7.10) — this is the first real use of it.

### 3.6  SOAP  `(#soap)`
> REST won the popularity contest, but SOAP is what came before it, and you'll
> still meet it integrating with banking, government, or legacy ERP systems where
> its rigor is required by policy, not preference.

**Overview**
- XML-over-HTTP with a strict, machine-readable contract (WSDL) — but SOAP is
  actually transport-agnostic (it can run over HTTP, SMTP, or JMS, not just HTTP)
  and can be stateful via WS-ReliableMessaging, unlike REST's stateless default.

**Trade-offs**
- Heavier and more verbose than REST, but its formal contract and built-in
  WS-Security standards still win in banking/government/legacy SAP/Oracle ERP
  integrations.

**Hands-On**
- Prerequisites: `curl` or SoapUI (free).
- Setup: local/free only — most public SOAP demo services (e.g. a public
  currency-conversion or weather WSDL demo endpoint) work without signup.
- Simulate the scenario: fetch a public WSDL file with `curl <wsdl-url>?wsdl` and
  read its structure — note the strict typed contract compared to an OpenAPI JSON
  spec from 3.8. Then send a raw SOAP XML envelope via `curl -X POST -H
  "Content-Type: text/xml"` with the request body from the WSDL's documented
  example.
- What to observe: how much more verbose the XML envelope is versus an equivalent
  REST JSON call, and how strictly the response has to match the WSDL's declared
  types — a direct, felt comparison instead of an abstract trade-off claim.
- Stretch goal: none — this lesson's value is contrast with REST, not depth.

**Bridge out:** none forward — a self-contained reference lesson.

### 3.7  CORS  `(#cors)`
> REST and GraphQL both assumed a browser could just call any API — CORS is the
> browser-enforced rule that says otherwise, specifically to stop a script on
> `evil.com` from silently calling your bank's API using the victim's own
> already-logged-in cookies.

**Overview**
- A browser-enforced policy restricting which origins a page's JavaScript can call.
  Simple requests go straight through; requests with custom headers/methods
  trigger a preflight `OPTIONS` check first. The server's preflight response uses 4
  specific headers: `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`,
  `Access-Control-Max-Age` (how long to cache the preflight result), and
  `Access-Control-Allow-Credentials`.

**Failure Modes**
- A wildcard `Access-Control-Allow-Origin: *` can't be combined with
  `Access-Control-Allow-Credentials: true` — the browser will reject that
  combination outright.

**Hands-On**
- Prerequisites: a browser; Node.js/Express.
- Setup: local/free only — serve a static HTML page from `localhost:3000` and an
  API from `localhost:4000` (two different origins, exactly what triggers CORS).
- Simulate the scenario: from the page on `:3000`, `fetch()` the API on `:4000`
  with no CORS headers set on the server — open DevTools console and see the
  browser block it. Add `Access-Control-Allow-Origin: http://localhost:3000` on
  the server and retry — it succeeds. Add a custom header to the fetch request
  (e.g. `X-Custom-Header`) and watch the Network tab show a preflight `OPTIONS`
  request firing before your actual `GET`.
- What to observe: the exact console error message browsers give for a CORS
  block, and the preflight `OPTIONS` request appearing only once headers/methods
  go beyond what counts as a "simple request."
- Stretch goal: set `Access-Control-Allow-Origin: *` together with
  `credentials: 'include'` on the fetch call and confirm the browser refuses the
  combination exactly as described in Failure Modes.

**Bridge out:** none forward — a self-contained browser-security reference lesson.

### 3.8  OpenAPI / Swagger  `(#openapi)`
> REST has no built-in way to describe itself machine-readably — OpenAPI is that
> missing contract layer, and it's what Messaging's Schema Registry (8.9) does
> again for event payloads instead of REST endpoints.

**Overview**
- A machine-readable spec of a REST API's endpoints, params, and responses.
  Workflow: design the spec → lint it (Spectral) → generate mocks/docs (Prism,
  Stoplight) → validate real responses against the spec (Dredd, Schemathesis) —
  consumed directly by API gateways (Kong, AWS API Gateway).

**Hands-On**
- Prerequisites: Node.js (for Prism); a text editor.
- Setup: local/free only.
- Simulate the scenario: write an `openapi.yaml` spec for the `/orders` API from
  3.1 (paths, request/response schemas). Run it through `npx @stoplight/prism-cli
  mock openapi.yaml` — this spins up a working mock server directly from the spec,
  with zero handwritten server code. Hit it with `curl` and confirm it returns
  responses matching your declared schema.
- What to observe: the mock server rejecting a request that doesn't match your
  declared schema (wrong field type, missing required field) — the spec is
  actively enforced, not just documentation.
- Stretch goal: run Spectral (`npx @stoplight/spectral-cli lint openapi.yaml`)
  against your spec and see it flag style/convention violations automatically.

**Bridge out:** none forward directly.

### 3.9  API Versioning  `(#api-versioning)`
> Every API lesson so far assumed one stable shape — versioning is what happens the
> day you need to change it without breaking every existing client at once.

**Overview**
- 3 places to put a version: URL path (`/v2/users` — most visible, most cacheable),
  a custom header (`API-Version: 2` — keeps URLs clean), a query param
  (`?version=2` — simplest, easiest to forget).

**Hands-On**
- Prerequisites: the `/orders` API from 3.1.
- Setup: local/free only.
- Simulate the scenario: change the response shape of `GET /orders/:id` (rename a
  field, say `total` → `totalAmount`) directly in place, no versioning. Then
  implement it properly: keep `/v1/orders/:id` returning the old shape and add
  `/v2/orders/:id` returning the new one, both served from the same codebase.
- What to observe: a client hardcoded to read `total` breaking silently (reading
  `undefined`) against your unversioned change, while the same client keeps
  working against `/v1` even after `/v2` ships — the entire point of versioning,
  demonstrated as a before/after rather than asserted.
- Stretch goal: none — this lesson's value is the before/after contrast.

**Bridge out:** none forward directly.

### 3.10 Pagination  `(#pagination)`
> Returning a million rows in one response is both slow and mostly useless — nobody
> scrolls through a million rows, and the way you paginate has a real complexity
> cost most people don't notice until it bites.

**Overview**
- Offset pagination (`?page=3&size=20`) costs O(skip + limit) on the database and
  supports jumping directly to any page — but breaks if rows are inserted/deleted
  between pages. Cursor pagination (`?after=<opaque-id>`) costs O(limit) and stays
  correct as data changes — but only supports sequential paging, never a direct
  jump to page 50.

**Hands-On**
- Prerequisites: a local Postgres or SQLite database with a `posts` table seeded
  with ~10,000 rows.
- Setup: local/free — `docker run -d -p 5432:5432 postgres`, seed with a script
  generating 10K rows.
- Simulate the scenario: implement `GET /posts?page=N&size=20` (offset:
  `OFFSET (N-1)*20 LIMIT 20`) and `GET /posts?after=<id>&size=20` (cursor:
  `WHERE id > <id> ORDER BY id LIMIT 20`). Run `EXPLAIN ANALYZE` on both queries
  at page 1 and at "page 400" (offset 8,000) — compare execution time.
- What to observe: the offset query's execution time growing as the offset grows
  (it still has to scan and discard 8,000 rows internally), while the cursor
  query's execution time stays flat regardless of how deep you page — the O(skip
  + limit) vs O(limit) claim, measured with `EXPLAIN ANALYZE` numbers instead of
  asserted.
- Stretch goal: insert 5 new rows at the top of the table between two offset-
  pagination requests and watch a row appear twice (or get skipped) across the
  page boundary — the exact instability named in Overview, reproduced.

**Bridge out:** none forward directly, but the same "stable position marker" idea
reappears as Kafka's offset (8.2) — a different domain, the same underlying problem.

### 3.11 Real-Time Communication  `(#realtime)`
> Async APIs listed 3 ways to get a result back — this lesson is the full menu,
> because HTTP's client-always-initiates model can't do what live chat,
> notifications, and dashboards actually need: the server pushing data the instant
> something happens.

**Overview**
- 6 options, roughly by connections-per-server ceiling: Short Polling (ask every N
  seconds, wasteful), Long Polling (~1K-10K connections/server, ask and wait),
  WebSocket (~100K-500K connections/server, persistent + bidirectional), SSE
  (~10K-100K connections/server, persistent, server-to-client only), WebRTC
  (peer-to-peer, for media), Webhook (server calls another server's URL directly).
  Socket.IO is worth naming as a library that auto-falls-back from WebSocket to
  polling when a WebSocket connection isn't available.

**Hands-On**
- Prerequisites: Node.js.
- Setup: local/free only.
- Simulate the scenario: build the same "live counter" feature 3 ways: short
  polling (client fetches `GET /count` every 2s), long polling (server holds the
  request open until the count actually changes, up to a 30s timeout), and
  WebSocket (server pushes the new count the instant it changes). Open each in a
  browser tab and watch the Network tab.
- What to observe: the request volume difference — short polling fires a request
  every 2s regardless of whether anything changed; long polling and WebSocket
  only produce traffic when there's an actual update. Count total requests sent
  over a 60-second idle period for each approach.
- Stretch goal: open 50 browser tabs (or simulate 50 clients with a script)
  against your long-polling server and watch server memory/connection count climb
  — a rough, laptop-scale feel for why long polling's per-server ceiling is
  1K-10K, not 100K+.

**Bridge out:** WebSocket and SSE are each substantial enough to earn their own
deep-dive lesson next.

### 3.12 WebSocket Deep Dive  `(#websocket-deep)`
> Choosing WebSocket for a chat feature is easy — keeping millions of connections
> alive, reconnecting cleanly after a blip, and routing a message to the right
> connection when it's one of 10 app servers is the actual engineering work, and
> it's invisible until you're in production.

**Overview**
- Connection lifecycle: CONNECTING → OPEN → CLOSING → CLOSED, with specific close
  codes explaining why: 1000 (normal), 1001 (going away), 1006 (abnormal), 1011
  (server error), 1008 (policy violation).
- Subprotocol negotiation via the `Sec-WebSocket-Protocol` header lets both sides
  agree on a message format on top of raw WebSocket — named ones include STOMP,
  graphql-ws, WAMP, and plain custom JSON-RPC.
- Reconnect uses exponential backoff with jitter, concretely:
  `delay = min(baseMs × 2^attempt, maxMs) + random(0, jitterMs)` — so a mass
  disconnect doesn't cause every client to retry in the same instant.

**Failure Modes**
- Fan-out across servers: a single server can't hold every connection for a
  system with millions of users, so Redis Pub/Sub lets server A publish a message
  that reaches a user connected to server B ([SEE 7.6] for the mechanism itself).
  Backpressure (a slow client can't keep up with what the server is sending):
  fixed with a `HIGH_WATER_MARK` check before every send, per-client send queues
  with a max depth, and client-side flow control via ACK/credits. Security: always
  validate the `Origin` header, never put credentials in the URL, enforce `wss://`.

**Hands-On**
- Prerequisites: Node.js with the `ws` library; Docker for Redis.
- Setup: local/free — 2 Node.js WebSocket servers on different ports (simulating
  2 app servers) plus `docker run -d -p 6379:6379 redis` for fan-out.
- Simulate the scenario: connect Client A to server-1 and Client B to server-2.
  Have server-1 and server-2 both subscribe to a Redis Pub/Sub channel
  (`SUBSCRIBE chat`). When Client A sends a message, server-1 publishes it to
  Redis (`PUBLISH chat <msg>`); server-2's subscription receives it and forwards
  it to Client B over its own WebSocket connection.
- What to observe: Client B receiving a message that originated on a completely
  different server it never connected to — the fan-out mechanism from Failure
  Modes, working end to end. Then kill server-1's process mid-conversation and
  watch Client A's `onclose` fire with a 1006 (abnormal closure) code.
- Stretch goal: implement the exponential-backoff-with-jitter reconnect formula
  from Overview on the client, kill and restart the server 3 times, and log each
  reconnect attempt's actual delay to confirm it grows and jitters as specified.

**Bridge out:** WebSocket's hard problems are fan-out, reconnection, and
backpressure — 3.13 shows what you get by choosing the simpler one-way alternative
instead.

### 3.13 SSE Deep Dive  `(#sse-deep)`
> WebSocket is powerful but heavyweight for something as simple as pushing a stream
> of one-way updates — a new protocol and new infrastructure, when plain HTTP could
> almost already do this.

**Overview**
- One-way server-to-client push over a regular, long-lived HTTP connection. The
  wire format is plain text with named fields: `event:` (names the event type),
  `id:` (for replay), `retry:` (reconnect delay hint), `data:` (the payload) — a
  blank line ends one event. A bare `data:` fires the browser's `onmessage`; a
  named `event:` only fires listeners registered via `addEventListener` for that
  exact name.
- Auto-reconnect: on disconnect, the browser's native `EventSource` API
  automatically reconnects and resumes from the last event ID it saw — replay for
  free, which WebSocket doesn't give you natively. A heartbeat is sent as a
  comment line (`: ping`) — ignored by the browser, but it resets a proxy's idle
  timeout so the connection isn't silently dropped.
- HTTP/1.1's 6-connections-per-domain limit is a real constraint SSE runs into,
  removed entirely by HTTP/2.
- `EventSource` can't set custom headers (no `Authorization` header), so auth needs
  one of 3 workarounds: a query-param token, a one-time token exchange, or cookies
  with `withCredentials`.

**Hands-On**
- Prerequisites: Node.js; a browser.
- Setup: local/free only.
- Simulate the scenario: build an Express endpoint that sets `Content-Type:
  text/event-stream` and every 2 seconds writes `data: {"price": <random
  number>}\n\n` to the response, never closing it. In the browser, connect with
  `new EventSource('/prices')` and log every message via `onmessage`.
- What to observe: killing the server and watching `EventSource` automatically
  reconnect on its own within a few seconds, with zero reconnect code written by
  you — the free auto-reconnect claim, observed directly (compare this to how much
  manual reconnect logic 3.12's WebSocket lab needed).
- Stretch goal: add an `id:` field to each event, kill the server mid-stream, and
  check the `Last-Event-ID` header the browser automatically sends on reconnect —
  confirms the replay-from-last-seen-event behavior without you implementing it.

**Bridge out:** 3.14 is the head-to-head that turns "SSE vs WebSocket" from two
independent lessons into one decision.

### 3.14 WebSocket vs SSE  `(#realtime-comparison)`
> 3.12 and 3.13 each made their own case in isolation — put the numbers side by
> side and the decision becomes obvious for most use cases.

**Overview**
- Quantified comparison: protocol overhead (WebSocket 2-14 bytes/msg vs SSE 10-50
  vs Long Polling 400+), memory per connection (WebSocket 5-20KB vs SSE 2-5KB),
  latency (WebSocket ~1-50ms, SSE ~100-200ms, Long Polling ~0.5-5s).
- Decision: bidirectional, low-latency, high-frequency (chat, collaborative
  editing, gaming) → WebSocket. Server → client only, operational simplicity
  (notifications, live feeds, AI token streaming) → SSE. Neither available
  (older proxies) → long polling as a fallback.

**Failure Modes**
- The same 6 scenarios compared side by side: network disconnection, server
  restart, proxy idle timeouts (>60s), high load spikes, message ordering, browser
  refresh — each technology degrades differently, and that comparison is often
  more decisive than the raw feature list.

**Trade-offs**
- Hybrid approaches exist for a reason: SSE + HTTP POST, WebSocket + REST fallback,
  WebSocket + Redis (fan-out), WebSocket + Kafka (durability).

**Hands-On**
- Prerequisites: the WebSocket lab from 3.12 and the SSE lab from 3.13, both
  still running.
- Setup: local/free only — reuse both prior labs side by side.
- Simulate the scenario: open both labs in two browser tabs, then throttle your
  network to "Slow 3G" in DevTools for both. Measure time-to-first-update and
  behavior under the throttle for each.
- What to observe: which one degrades more gracefully under a bad connection, and
  which reconnects faster after you toggle DevTools' "Offline" checkbox on and
  off — turning the Overview's numeric latency/overhead table into something you
  watched happen, not just read.
- Stretch goal: none — this lesson's value is direct comparison of labs you've
  already built.

**Bridge out:** closes Module 3. Every real-time connection here still needs to
answer "who is this connection allowed to represent" — Security opens next.

---

## Module 4 — Security
`(03-security.html)` — now that a request has a defined shape (Module 3), the next question is who's allowed to send one.

### 4.1  Authentication  `(#authentication)`
> Every API pattern in Module 3 assumed a caller — nothing so far has actually
> verified who that caller is. Without it, "add to cart" and "transfer $10,000"
> look identical to a server that never checks.

**Overview**
- Authentication answers "who are you." 7 ways to prove it, simplest to strongest:
  Basic Auth (username:password every request, weakest), API Key (a static secret
  per client), Session Cookie (server-side session), JWT/Bearer (self-contained
  signed token), OAuth 2.0 + OIDC (delegated, via a third party), mTLS + SPIFFE
  (both sides present certs, machine-to-machine), Passkeys/WebAuthn
  (phishing-resistant, hardware-backed).
- A JWT's actual structure is 3 dot-separated parts — `header.payload.signature`
  — with concrete fields: `alg` (signing algorithm), `typ` (token type), `sub`
  (subject/user ID), `exp` (expiry), `role`, `iss` (issuer). HS256 (symmetric,
  one shared secret) vs RS256/ES256 (asymmetric, a private key signs, a public key
  verifies) — HS256 across multiple services is a real anti-pattern, since any
  service holding the shared secret can forge a token for any other service.
- OAuth 2.0 grant types by client type: Authorization Code + PKCE (browser/mobile,
  the safe default), Client Credentials (machine-to-machine, no user), Device Code
  (TVs/CLIs with no browser), Refresh Token (long-lived session without
  re-prompting), Implicit (deprecated — token exposed in the URL fragment).

**Failure Modes**
- Token security: a long-lived access token in `localStorage` is XSS-stealable;
  prefer a short-lived (~15min) in-memory access token with an `httpOnly` refresh
  cookie. MFA mitigates credential-only compromise: TOTP, WebAuthn/Passkeys, SMS
  (flagged as weakest), push notification, hardware key.

**Hands-On**
- Prerequisites: Node.js with `jsonwebtoken`; `jwt.io` (free, in-browser) for
  decoding.
- Setup: local/free only.
- Simulate the scenario: sign a JWT with `jwt.sign({sub: "user123", role:
  "admin"}, secret, {algorithm: "HS256", expiresIn: "15m"})`, paste it into
  jwt.io, and read the decoded header/payload/signature — match each field to
  the ones named in Overview. Then write a verify endpoint and call it with (a)
  the valid token, (b) the same token with one payload character changed, and
  (c) the token after its 15-minute expiry.
- What to observe: case (b) failing signature verification instantly (any change
  to header/payload invalidates the signature) and case (c) failing with a
  distinct "expired" error — 2 different, deliberately distinguishable failure
  reasons.
- Stretch goal: sign a token with HS256 using a secret, then try to verify it as
  if it were RS256 with a public key — confirms why mixing algorithms/services
  without care is exploitable (the classic "alg confusion" JWT attack), and why
  the anti-pattern named in Overview is a real, documented vulnerability class.

**Bridge out:** knowing *who* someone is doesn't say what they're allowed to touch
— that's the very next, deliberately separate question.

### 4.2  Authorization  `(#authorization)`
> You now know who's calling — but a logged-in user and an admin are both
> "authenticated," and only one of them should be able to delete another user's
> account. Authentication alone can't make that distinction.

**Overview**
- Authorization answers "what are you allowed to do." An evolution of 5 models:
  ACL (Access Control List — simple, doesn't scale; Linux permissions, S3 ACLs) →
  RBAC (role → permissions, simple but coarse) → ABAC (attribute-based, e.g. "only
  during business hours") → ReBAC (relationship-based, e.g. "owner of this
  document") → Policy-Based (OPA/Cedar, arbitrary rule engines).
- Where to enforce it, 5 named layers: API Gateway (one place, coarse-grained),
  Service layer (fine-grained, repeated everywhere), Database (row-level security
  — Postgres RLS, Citus), Sidecar/mesh, Frontend (never trust this layer alone).

**Real-World**
- Google's Zanzibar does ReBAC at planet scale (open-sourced as SpiceDB, Ory Keto,
  OpenFGA) — "can user X view document Y" answered in milliseconds across a graph
  of billions of relationships.

**Hands-On**
- Prerequisites: Node.js; the auth API from 4.1.
- Setup: local/free only.
- Simulate the scenario: implement RBAC first — a `roles` table (`admin`, `editor`,
  `viewer`) and a middleware that checks `req.user.role` against a required role
  per route. Then implement one ABAC rule on top: "editors can only edit documents
  created in the last 24 hours." Try deleting another user's document as a
  `viewer`, then as an `editor` outside the 24-hour window, then as an `editor`
  inside it.
- What to observe: the same user/role combination being allowed or denied purely
  based on the document's `createdAt` attribute — RBAC alone can't express that
  rule; it needed ABAC's extra condition, exactly the limitation named in
  Overview.
- Stretch goal: install OpenFGA locally (`docker run -d -p 8080:8080
  openfga/openfga run`) and model "owner of this document" as a ReBAC
  relationship tuple — query `check` against it and get a sub-millisecond
  allow/deny, a small-scale version of what Zanzibar does at Google's scale.

**Bridge out:** enforcing authorization needs somewhere in the request path to
check it — Infrastructure's API Gateway (5.2) is exactly where that check usually
lives.

### 4.3  Encryption  `(#encryption)`
> You now know who's calling and what they're allowed to do — encryption is what
> stops anyone else from reading the data even if they intercept it in transit or
> steal the disk it's sitting on.

**Overview**
- Symmetric (one key, both directions, fast — AES-256-GCM) vs Asymmetric
  (public/private pair, slower, for key exchange) vs Hashing (one-way, for
  passwords). Named algorithms and their specific use: AES-256-GCM (general
  symmetric default), ChaCha20-Poly1305 (WireGuard, mobile TLS without AES-NI),
  RSA-2048+ (asymmetric, legacy-compatible), ECDSA P-256 (asymmetric, smaller
  keys), Ed25519 (fastest asymmetric, SSH keys/signing), X25519/ECDH (TLS 1.3 key
  exchange, forward secrecy), bcrypt/Argon2id (password hashing).
- Envelope encryption (the KMS pattern): a fast symmetric Data Encryption Key
  (DEK) encrypts the data; a slower asymmetric Key Encryption Key (KEK), kept in a
  hardware security module, encrypts the DEK — symmetric speed with asymmetric-grade
  key protection, and why rotating the master key doesn't mean re-encrypting every
  byte of data, only the much smaller DEKs.
- In transit: TLS 1.3 (external), mTLS (service-to-service), VPN/WireGuard
  (site-to-site), SSH (admin access). At rest: disk (LUKS, BitLocker), database TDE,
  object storage SSE-KMS, column-level encryption for individual sensitive fields.
- Compliance frameworks that specifically require this: PCI-DSS, HIPAA, GDPR,
  SOC 2.

**Failure Modes**
- Never hardcode secrets — use Vault, AWS Secrets Manager, AWS SSM Parameter Store,
  GCP Secret Manager, Azure Key Vault, SOPS, or K8s External Secrets, and scan for
  leaked ones with gitleaks/truffleHog. Do: AES-256-GCM, Argon2id, rotate keys every
  90 days, TLS 1.3 everywhere, forward secrecy. Never: MD5/SHA1 for passwords, ECB
  mode, hardcoded keys, reused IVs/nonces, rolling your own crypto.

**Hands-On**
- Prerequisites: `openssl` or a language's crypto library (Node's `crypto`,
  Python's `cryptography`).
- Setup: local/free only.
- Simulate the scenario: encrypt a short string with AES-256-GCM using a random
  key and IV, then try to decrypt it with the correct key but a different IV
  (should fail/produce garbage), then with the correct key and IV (succeeds).
  Separately, hash the same password with MD5, SHA-1, and bcrypt, then time each
  — MD5/SHA-1 will be near-instant (bad for passwords, exactly why they're
  banned), bcrypt deliberately slow.
- What to observe: bcrypt's deliberate slowness (tunable via its cost factor) is
  the actual defense against brute-forcing a leaked hash — a fast hash is a
  liability specifically for passwords, even though speed is a virtue everywhere
  else in this course.
- Stretch goal: build a tiny envelope-encryption demo — generate a DEK, encrypt
  your data with it, then encrypt the DEK itself with a second "KEK" key. Rotate
  the KEK (re-encrypt only the small DEK) and confirm you never touched the
  original (potentially large) encrypted data — the exact reason envelope
  encryption exists, demonstrated instead of described.

**Bridge out:** closes Module 4. Infrastructure opens next, and its Load
Balancer/Gateway lessons assume TLS termination — explained here — as a given
capability those components provide.

---

## Module 5 — Infrastructure
`(05-infrastructure.html)` — the machinery that enforces Module 4's security policies and keeps a service alive under real traffic.

### 5.1  Load Balancer  `(#load-balancer)`
> One server dies at 2am, or just can't keep up at peak. Running 3 copies fixes
> capacity, but immediately raises a new question: who decides which copy gets
> each request, and who notices when one copy is dead?

**Overview**
- A load balancer sits in front of a server pool, checks who's healthy, and
  distributes requests to them. Layer 4 (fast, reads only IP+port, blind to
  content — AWS NLB) vs Layer 7 (slower, reads the actual HTTP request, routes by
  URL/header — AWS ALB, NGINX). 4 algorithms decide which healthy server wins:
  Round Robin, Weighted (bigger server gets more), Least Connections (busiest
  servers skipped), IP Hash (same client → same server, enabling sticky sessions).
- L4 vs L7 comparison across 9 dimensions: works on (connection vs request), routes
  by (IP+port vs URL/headers/cookies), speed, SSL handling, sticky-session support,
  content awareness, typical use case, example products, health-check depth,
  WebSocket support.

**Trade-offs**
- Sticky sessions (IP Hash) are sometimes unavoidable but reintroduce the exact
  stateful-server fragility Foundations (1.5) warned against — prefer externalizing
  session state over relying on stickiness.

**Hands-On**
- Prerequisites: Docker, NGINX or HAProxy.
- Setup: local/free — 3 Docker containers each running a tiny HTTP server that
  responds with its own container ID (`docker run -d -p 808X:80 ...`), plus an
  NGINX container configured as a Round Robin load balancer in front of them;
  cloud free-tier — an AWS ALB with 3 free-tier EC2 targets.
- Simulate the scenario: hit the load balancer's address 30 times in a row with
  `curl` in a loop and log which backend container ID answers each time. Switch
  the NGINX config from Round Robin to IP Hash and repeat from the same client IP.
- What to observe: Round Robin cycling evenly across all 3 backends, while IP
  Hash sends every one of your 30 requests to the exact same backend — the
  sticky-session mechanism, observed as a pattern in your own logs. Then stop one
  container and confirm the LB's health check removes it from rotation within a
  few seconds.
- Stretch goal: switch the LB to Least Connections, artificially make one backend
  slow (add a `sleep` to its handler), and watch the LB route proportionally
  fewer new requests to it as its connection count climbs.

**Bridge out:** a load balancer hides which server answers — it doesn't check who's
asking, or stop abuse. That gap is what a gateway fills.

### 5.2  API Gateway  `(#api-gateway)`
> Once an app is split into many microservices, a client would need to know 20
> different addresses, and every one of those 20 services ends up reimplementing
> the same auth/rate-limit/logging code.

**Overview**
- A single front door — the client sees one address, the gateway routes each
  request to the right backend and handles shared concerns once. 12
  responsibilities in the request path: parameter validation, allow/deny-list,
  authentication/authorization, rate limiting, dynamic routing, service discovery,
  protocol conversion, error handling, logging, [SEE 11.5] circuit breaker,
  caching.
- Gateway vs LB vs Mesh vs BFF: a load balancer distributes traffic with no
  business logic; a gateway adds auth/rate-limiting/routing; a mesh handles
  service-to-service (east-west) traffic the gateway never sees; a BFF
  (Backends-for-Frontends) is a separate gateway instance tailored per client type
  (web vs mobile), so each client gets exactly the shape it needs.

**Hands-On**
- Prerequisites: Docker; Kong or a lightweight alternative (`express-gateway`,
  or NGINX with a Lua/JS auth module for the minimal version).
- Setup: local/free — `docker run -d --name kong <kong-image>` in DB-less/
  declarative mode, routing to 2 backend services you already built (e.g. the
  `/orders` API from 3.1 and a second mock service).
- Simulate the scenario: configure Kong to route `/orders/*` to service A and
  `/users/*` to service B, and add a rate-limiting plugin (5 requests/minute) plus
  a key-auth plugin on the `/orders` route only. Hit both routes with and without
  an API key, and hit `/orders` 6 times in a minute.
- What to observe: `/users` working with no key while `/orders` returns 401
  without one — auth enforced centrally at the gateway, not duplicated in each
  service's code. The 6th request to `/orders` within a minute returning 429 —
  the shared rate-limiting concern from Overview, enforced once instead of per
  service.
- Stretch goal: add a second route that points to a mobile-specific mock response
  (fewer fields) versus the web route's full response from the same underlying
  service — a minimal BFF pattern, built at gateway level.

**Bridge out:** the gateway is one specific flavor of a broader pattern — the
proxy — that shows up again and again across this module.

### 5.3  Forward vs Reverse Proxy  `(#proxy)`
> The load balancer and the gateway are both, structurally, a proxy — naming that
> pattern explicitly is what turns a pile of seemingly-unrelated tools (LB,
> gateway, CDN, NGINX) into one repeated idea.

**Overview**
- Forward proxy hides who's asking (stands in front of the client). Reverse proxy
  hides who's answering (stands in front of servers) — everything built so far
  (LB, gateway) is a reverse proxy wearing a specific hat.

**Hands-On**
- Prerequisites: Docker; `squid` (forward proxy) and `nginx` (reverse proxy)
  images.
- Setup: local/free — `docker run -d -p 3128:3128 ubuntu/squid` for the forward
  proxy; a plain NGINX container configured with `proxy_pass` for the reverse
  proxy.
- Simulate the scenario: configure `curl --proxy localhost:3128
  https://example.com` and check the request logs on the Squid container —
  you'll see the client's request being relayed outward, hiding the client from
  `example.com`'s perspective. Separately, configure NGINX to `proxy_pass` to a
  backend app and hit NGINX directly — check the backend's logs for the source
  IP it sees (NGINX's, not the real client's, unless `X-Forwarded-For` is set).
- What to observe: from the destination server's point of view in each case —
  the forward proxy hides the client's identity from the destination; the reverse
  proxy hides the backend's identity from the client. Same proxy pattern, two
  different things being hidden.
- Stretch goal: add `proxy_set_header X-Forwarded-For $remote_addr;` to the NGINX
  config and confirm the backend now sees the real client IP in that header — the
  standard way reverse proxies avoid losing this information.

**Bridge out:** NGINX is the concrete piece of software that most commonly
implements a reverse proxy in production.

### 5.4  NGINX  `(#nginx)`
> Older web servers assigned one OS thread per connection — at 100K concurrent
> connections, that's gigabytes of thread-stack memory and constant
> context-switching, a ceiling known as the C10K problem.

**Overview**
- [SEE 2.11] A small number of worker processes, each an event loop, handle
  thousands of connections without one-thread-per-connection — roughly a third of
  all websites run on it as a result. Wears 5 hats: architecture (event-driven,
  non-blocking), web server (serves static files directly), reverse proxy + load
  balancer, SSL termination (decrypt once at the edge), content caching.

**Hands-On**
- Prerequisites: Docker; a basic `nginx.conf`.
- Setup: local/free only.
- Simulate the scenario: run NGINX serving a static HTML page, then configure it
  as a reverse proxy in front of a small Node.js app, then add caching
  (`proxy_cache_path` + `proxy_cache`) in front of that same app. Load-test all 3
  configurations with `hey -n 2000 -c 100` and compare requests/sec.
- What to observe: the cached configuration serving far more requests/sec than
  the proxied-but-uncached one, since cached responses never reach your Node.js
  app at all — check `X-Cache-Status` (or add your own header) to confirm hits vs
  misses. Also check NGINX's worker process count (`ps aux | grep nginx`) staying
  small and flat throughout, even at 100 concurrent connections.
- Stretch goal: add TLS termination — generate a self-signed cert
  (`openssl req -x509 ...`), configure NGINX to terminate TLS and forward plain
  HTTP to the backend, and confirm (via `tcpdump` on the loopback interface) that
  traffic between NGINX and the backend is unencrypted while the client-facing
  side is HTTPS.

**Bridge out:** NGINX runs on a server — the next question is how you package and
orchestrate the many services (including NGINX itself) that make up a real system.

### 5.5  Docker & Kubernetes  `(#docker-k8s)`
> "Works on my machine" doesn't mean it works in production — different OS
> versions, missing dependencies, and manual deployment steps all introduce drift
> between environments.

**Overview**
- Docker packages an app and its dependencies portably: Image (the packaged
  blueprint), Container (a running instance), Volume (persistent storage outside
  the container's ephemeral filesystem). Kubernetes orchestrates many containers
  across many machines: Pod (smallest deployable unit), Service (stable network
  identity for a set of Pods), Deployment (desired-state manager), HPA
  (auto-scaler), StatefulSet (ordered/stable identities for stateful workloads
  like databases), Ingress (HTTP routing rules into the cluster).
- Rollout strategies: Rolling (replace instances one at a time), Blue-Green (flip
  traffic instantly between two full environments), Canary (small % to the new
  version first), A/B (route by user segment, not rollout progress).

**Hands-On**
- Prerequisites: Docker Desktop (includes a local Kubernetes) or `kind`/
  `minikube`, both free; `kubectl`.
- Setup: local/free — `kind create cluster`; cloud free-tier — GKE's free
  cluster tier or EKS with a free-tier node.
- Simulate the scenario: `kubectl apply` a Deployment with 3 replicas of a simple
  app, then a Service exposing it. Scale it live with `kubectl scale deployment
  myapp --replicas=6` and watch new Pods appear with `kubectl get pods -w`. Kill
  one Pod directly (`kubectl delete pod <name>`) and watch the Deployment
  controller recreate it automatically within seconds.
- What to observe: the Deployment's desired-state reconciliation happening with
  no manual intervention — you deleted a Pod, and Kubernetes noticed the actual
  state (5 Pods) didn't match the desired state (6) and fixed it itself.
- Stretch goal: update the Deployment's image tag and watch `kubectl rollout
  status` show a Rolling update replacing Pods one at a time with zero downtime
  — then run `kubectl rollout undo` and confirm it reverts cleanly.

**Bridge out:** K8s runs many services, but doesn't secure or observe the traffic
between them — that's the next gap.

### 5.6  Service Mesh  `(#service-mesh)`
> Once you have dozens of microservices talking to each other (east-west traffic),
> you need mTLS, retries, and observability between every pair of them —
> reimplementing that inside each service is the same copy-paste problem API
> Gateway solved, but for service-to-service traffic instead.

**Overview**
- A sidecar proxy (Envoy), injected next to every service instance by Istio or
  Linkerd, intercepts all its network traffic transparently — zero code changes in
  the service itself.

**Trade-offs**
- mTLS everywhere, automatic per-call observability, and traffic policies via
  config instead of code, at the cost of real operational complexity and one extra
  sidecar's resource overhead per instance.

**Hands-On**
- Prerequisites: the local K8s cluster from 5.5; `istioctl` or Linkerd's CLI
  (both free).
- Setup: local/free — `istioctl install` (or `linkerd install`) on your `kind`
  cluster, then label your namespace for automatic sidecar injection.
- Simulate the scenario: deploy the same 2-service setup from 5.5, label the
  namespace `istio-injection=enabled`, and redeploy — check `kubectl get pods`
  and notice each Pod now shows 2/2 containers (your app + the injected Envoy
  sidecar), with zero changes to your application code.
- What to observe: traffic between the 2 services still working exactly as
  before, but now visible in Istio's dashboard (Kiali, if installed) as a service
  graph with automatic mTLS between them — the "zero code changes" claim from
  Overview, confirmed by diffing your app's source before and after.
- Stretch goal: apply an Istio `VirtualService` that injects a 3-second delay on
  10% of calls to one service, without touching that service's code at all — a
  fault-injection test, useful preview of [SEE 11.x] Chaos Engineering.

**Bridge out:** one cluster, one region, isn't always enough — the next lesson is
what happens once it isn't.

### 5.7  Multi-Region & Multi-Tenant  `(#multi-region)`
> Users on the other side of the planet from your one datacenter feel every
> millisecond of that distance, and if that single region goes down, so does your
> entire product.

**Overview**
- Multi-region patterns: Active-Passive (one region serves, the other waits as
  failover), Active-Active (both serve simultaneously, harder consistency),
  Follow-the-Sun (route to whichever region is in business hours).
- Multi-tenant architectures: Shared App/Shared DB (cheapest, least isolated),
  Shared App/Multi-DB (per-tenant data isolation), Multi App/Multi-DB (full
  isolation, most expensive).

**Hands-On**
- Prerequisites: 2 free-tier cloud accounts/regions (or 2 local Docker Postgres
  instances standing in for "region A" and "region B").
- Setup: cloud free-tier — 2 small Postgres instances in 2 different AWS regions
  (or simulate with `docker run` on 2 ports locally, adding artificial latency
  with `tc netem` to mimic cross-region distance); local/free — the 2-port
  simulation alone.
- Simulate the scenario: write to "region A" and set up simple replication (a
  script polling for changes and applying them to "region B", standing in for
  real cross-region replication). Measure the delay between a write landing in A
  and becoming visible in B.
- What to observe: a real, non-zero replication lag — even a simulated one makes
  concrete the Active-Passive failover risk (if A dies right after a write, that
  write may not exist yet in B) that Module 9 will formalize with actual
  consistency models.
- Stretch goal: build the cheapest multi-tenant shape — one app, one Postgres
  instance, a `tenant_id` column on every table, and row-level security
  restricting each query to its own tenant's rows — and confirm tenant A's
  queries genuinely can't see tenant B's data even with a bug in your WHERE
  clause.

**Bridge out:** cross-region replication raises the exact consistency questions
Module 9 formalizes — this lesson raises the problem, Module 9 gives it rigor.

### 5.8  Service Discovery  `(#service-discovery)`
> Kubernetes constantly creates and destroys Pods, each with a new IP — something
> has to let other services find the current, correct address.

**Overview**
- 4 patterns: Client-Side (the app's SDK queries a registry — Consul/Eureka),
  Server-Side (a load balancer/proxy resolves and routes), DNS-Based ([SEE 2.5]
  K8s CoreDNS resolves a service name to current pod IPs), Service Mesh (a
  sidecar transparently intercepts and routes).
- Registries: Consul, etcd, Eureka, ZooKeeper, AWS Cloud Map, K8s's built-in
  discovery — each with its own consensus mechanism and health-check style. K8s's
  own service types: ClusterIP (a stable virtual IP), Headless (returns every pod
  IP directly), ExternalName (a CNAME to something outside the cluster).

**Failure Modes**
- Anti-patterns: hardcoded IPs, long DNS TTL (routes to dead instances), no health
  checks (registry serves stale entries), a single non-replicated registry (SPOF).

**Hands-On**
- Prerequisites: Docker; Consul (free, official image).
- Setup: local/free — `docker run -d -p 8500:8500 consul agent -dev`.
- Simulate the scenario: register 2 instances of a mock service with Consul
  (`curl -X PUT` to its registration API, or a client SDK), then query Consul's
  DNS interface (`dig @127.0.0.1 -p 8600 myservice.service.consul`) and its HTTP
  API (`curl localhost:8500/v1/health/service/myservice`) for the current healthy
  instances. Kill one instance's health-check endpoint (return 500 instead of
  200) and re-query after Consul's check interval passes.
- What to observe: the failed instance disappearing from the healthy-instances
  list within one check interval, with zero manual deregistration — the
  registry actively pruning stale entries, the opposite of the "no health checks"
  anti-pattern named above.
- Stretch goal: hardcode one instance's IP in a client instead of querying
  Consul, then kill that specific instance — the client keeps trying the dead IP
  forever, a direct, felt version of the "hardcoded IPs" anti-pattern.

**Bridge out:** every rollout strategy from 5.5 still needs an automated pipeline
to actually trigger and gate it on every commit.

### 5.9  CI/CD & Deployment Strategies  `(#cicd)`
> Manual deployment is slow, error-prone, and leaves no audit trail — "who
> deployed what, when" becomes a Slack-history archaeology exercise after every
> incident.

**Overview**
- Pipeline: commit → build → unit tests → build image → deploy staging → e2e
  tests → promote to production (canary ramping 5% → 25% → 100%) →
  auto-rollback on breach. 5 strategies: Rolling, Blue-Green, Canary, Feature-Flag,
  Recreate (accepts downtime — for dev/staging or stateful apps that can't run
  mixed versions).

**Failure Modes**
- Anti-patterns: manual deploys, no rollback plan, big-bang releases, no staging
  environment.

**Hands-On**
- Prerequisites: a free GitHub account; GitHub Actions (free tier for public
  repos).
- Setup: local/free — a GitHub repo with a `.github/workflows/deploy.yml`
  pipeline; cloud free-tier — deploy target on Render/Railway/Fly.io free tier.
- Simulate the scenario: build a pipeline with stages: run tests → build →
  deploy to staging → (manual approval gate) → deploy to production. Push a
  commit that fails a test and watch the pipeline stop before ever reaching
  deploy. Fix it, push again, and watch it flow through to staging automatically.
- What to observe: the pipeline's own log becoming the "who deployed what, when"
  audit trail named in the problem statement — every deploy has a commit SHA, a
  timestamp, and a pass/fail test result attached, automatically.
- Stretch goal: add a canary step — deploy to 1 of 3 instances first, run a smoke
  test against just that instance, then promote to the other 2 only if it
  passes — a minimal version of the 5%→25%→100% ramp from Overview.

**Bridge out:** every pattern here assumes a server is always running, waiting for
traffic — the next lesson is the alternative that only pays for actual invocations.

### 5.10 Serverless / FaaS  `(#serverless)`
> Running a server 24/7 to handle traffic that only spikes occasionally — a
> nightly batch job, a rarely-used endpoint — means paying for idle capacity most
> of the time.

**Overview**
- Pay-per-invocation compute that scales to zero. The cold-start problem: the
  first invocation after idle time downloads code and initializes a runtime
  (100ms to 10s, worst for JVM-based languages); a warm invocation skips that and
  adds only 1-5ms. Mitigations: Provisioned Concurrency, SnapStart
  (snapshot-and-restore, Java-specific), slim runtimes (Go/Rust cold-start in
  10-50ms), smaller deploy packages, keep-warm pings, initializing DB connections
  outside the handler so they're reused across warm invocations.
- Good for: event-driven glue, spiky/low-volume traffic, cron jobs. Bad for:
  long-running jobs (>15min limits), sustained high RPS (cost crosses over to
  containers around ~1M req/day), stateful/WebSocket workloads.

**Hands-On**
- Prerequisites: AWS free-tier account (Lambda's free tier is generous — 1M
  requests/month).
- Setup: cloud free-tier — AWS Lambda console, a simple function (Node.js or
  Python) that just returns a timestamp.
- Simulate the scenario: invoke the function once after it's been idle for 10+
  minutes and log the reported duration in CloudWatch (this is your cold start).
  Invoke it again immediately after — log that duration too (a warm invocation).
  Repeat with a heavier runtime (e.g. a Java or a Node function that imports a
  large dependency) to feel the cold-start difference by language.
- What to observe: the stark duration gap between the cold and warm invocation —
  put your own two numbers next to the "100ms to 10s vs 1-5ms" claim from
  Overview. Then enable Provisioned Concurrency (within free-tier limits or a
  short test window to avoid cost) and confirm every invocation is now warm-speed.
- Stretch goal: run a sustained load test against the function
  (`hey -n 5000 -c 100`) and watch AWS Lambda's concurrency metric scale up
  automatically in CloudWatch — no server you provisioned, no capacity you
  planned for in advance.

**Bridge out:** everything provisioned across this module (5.1-5.10) has to
actually be created somewhere — the next lesson is how that becomes repeatable
instead of manual.

### 5.11 Infrastructure as Code  `(#iac)`
> Manually clicking through a cloud console to create infrastructure isn't
> reviewable, isn't repeatable, and drifts silently from whatever's actually
> documented.

**Overview**
- Version-controlling cloud infrastructure the same way you version-control app
  code. Tools by approach: declarative (Terraform, OpenTofu, CloudFormation) vs
  imperative-as-code (Pulumi, AWS CDK — real code generating the declarative
  output) vs reconciliation-loop (Crossplane — Kubernetes-native).
- GitOps workflow: PR changes the infra code → CI runs a `plan` (a visible diff) →
  team reviews it → merge triggers `apply` automatically → state stored remotely
  with locking (S3 + DynamoDB).

**Failure Modes**
- Anti-patterns: ClickOps (manual console changes that drift from code), one
  mega-stack for everything, secrets committed unencrypted into state, no
  locking (concurrent applies corrupt state). Testing tools: tflint (syntax),
  checkov/tfsec (security scanning), terratest (deploy-validate-destroy), OPA/
  Sentinel (policy-as-code).

**Hands-On**
- Prerequisites: Terraform (free) installed; AWS/GCP free-tier account.
- Setup: local/free — Terraform pointed at a free-tier cloud account.
- Simulate the scenario: write a `.tf` file provisioning one free-tier resource
  (e.g. an S3 bucket or a small EC2 instance). Run `terraform plan` and read the
  diff before applying anything — then `terraform apply`. Manually change one
  setting on that resource directly in the cloud console (a ClickOps change),
  then run `terraform plan` again.
- What to observe: Terraform detecting the manual drift and showing it as a diff
  it wants to "correct" back to what's in code — the exact ClickOps anti-pattern
  named above, caught automatically instead of silently persisting.
- Stretch goal: delete the resource with `terraform destroy`, then intentionally
  corrupt the local state file and try `terraform plan` again — see the error
  Terraform raises, and why teams store state remotely with locking (S3 +
  DynamoDB) instead of a local file that any one person could break.

**Bridge out:** closes Module 5. Storage opens next — much of what gets
provisioned via IaC from here on is exactly the databases and stores Module 6
covers.

---

## Module 6 — Storage
`(06-storage.html)` — none of the infrastructure in Module 5 matters if the service has nowhere durable to put its data.

### 6.1  Database Internals  `(#db-internals)`
> Infrastructure assumed "a database exists" without explaining how one actually
> stores and finds data. Start with the simplest possible database — one plain
> file — and every "obvious" fix creates a new problem, which is exactly the story
> real database engines had to solve, one step at a time.

**Overview**
- Step 1 (Plain File): updates shift every byte after them, and scans are O(n).
  Step 2 (Append-Only File): writes become O(1), but the file grows forever.
  Step 3 (Segments + Compaction): split into segments, periodically merge and drop
  dead entries — a deleted key leaves a tombstone marker, physically removed only
  during merge. Step 4 (Hash Index): an in-memory key→offset map makes point
  lookups instant, but can't range-query and must fit in RAM. Step 5 (Sorting):
  sort the data so ranges are contiguous. Step 6 (LSM Tree): buffer writes in
  memory, flush sorted, merge in the background — fast writes, slightly slower
  reads. Step 7 (B+Tree): the read-optimized alternative — in-place updates, no
  merge step, more random disk I/O per write.
- 8 supporting data structures: Skiplist, Hash Index, SSTable, WAL (write-ahead
  log), LSM Tree, B-Tree/B+Tree, Inverted Index, R-Tree (spatial).
- Locks and consistency vocabulary that sits on top of all of this: Row-level
  (InnoDB's default), Table-level (MyISAM), Intent locks, Advisory locks, plus
  MVCC, Normalization (3NF) vs Denormalization, and ACID vs BASE (Basically
  Available, Soft state, Eventually consistent).

**Hands-On**
- Prerequisites: Python or Node.js; a text editor.
- Setup: local/free only — this is a from-scratch build, no database needed.
- Simulate the scenario: build Steps 1-4 from Overview yourself, in order, on a
  plain text file: (1) a naive "append a line, rewrite the whole file to update
  it" store; time an update on a 10,000-line file. (2) switch to pure append-only
  writes (never rewrite, just append new versions); time the same update — much
  faster, but the file only grows. (3) add a simple in-memory hash index
  (`{key: byteOffset}`) built by scanning the file once at startup; time a point
  lookup before and after adding the index.
- What to observe: the update time for step 1 growing with file size (rewriting
  the whole file each time) while step 2's update time stays flat — the O(n) vs
  O(1) claim, timed with your own stopwatch instead of assumed. Then the lookup
  time for step 3 dropping from "scan the whole file" to "one seek," with the
  index in memory.
- Stretch goal: implement simple compaction — merge 2 append-only segments,
  keeping only the latest value per key, and measure the file size before/after
  on a file with many overwritten keys.

**Bridge out:** the hash index and B+Tree built here get applied, deliberately, to
speed up real queries — that's indexing.

### 6.2  Database Indexing  `(#db-indexing)`
> A query without an index means scanning every row, every time — fine at 100
> rows, unusable at 1M.

**Overview**
- Disk reads happen at the block level (4-8KB chunks) — even reading 1 byte loads
  the whole block. An index is a small, sorted lookup table telling the database
  which blocks to read, skipping the rest. 9 index types: Clustered (data
  physically sorted by key), Non-Clustered (a separate structure with pointers —
  doesn't reorganize storage, just marks entries), Composite (multi-column),
  Covering (all query columns in the index, no table access needed), Partial
  (indexes only a subset of rows), GIN (multi-value keys, full-text/JSONB), GiST
  (spatial/range), BRIN (block-range summaries, huge sequential data), Sparse
  (anchor keys only, scans forward).
- The 3 precision points people conflate: a Non-Clustered Index adds an entry
  pointing to scattered pages (doesn't reorganize anything); a Clustered Index
  actually reorganizes physical storage order; Partitioning removes whole
  irrelevant chunks before a query even starts scanning.

**Hands-On**
- Prerequisites: Docker (Postgres); `psql` or any SQL client.
- Setup: local/free — `docker run -d -p 5432:5432 postgres`.
- Simulate the scenario: create a `users` table, seed it with 500,000 rows
  (`generate_series` in Postgres makes this a one-liner), then run `EXPLAIN
  ANALYZE SELECT * FROM users WHERE email = 'user250000@test.com'` with no index
  on `email`. Add `CREATE INDEX idx_email ON users(email)` and run the exact same
  query again.
- What to observe: the query plan switching from "Seq Scan" (reads all 500K rows)
  to "Index Scan" (reads a handful of blocks) — and the reported execution time
  dropping from milliseconds-times-hundreds-of-thousands-of-rows to
  near-instant. Note the actual numbers `EXPLAIN ANALYZE` reports for both.
- Stretch goal: build a covering index (`CREATE INDEX ... ON users(email)
  INCLUDE (name)`) and confirm via `EXPLAIN ANALYZE` that the plan now shows
  "Index Only Scan" — the table itself is never touched, exactly the "no table
  access needed" property named in Overview.

**Bridge out:** Index → Clustered Index → Partitioning is a progression — each
step is what you reach for once the previous one's ceiling is hit on one machine,
which is exactly where Scalability's Partitioning lesson (10.1) picks up.

### 6.3  Database Choice Guide  `(#db-choice)`
> 6.1 and 6.2 explained the internals — this lesson is where those internals
> translate into "which engine do I actually pick."

**Overview**
- 8 engine categories, each a direct consequence of the storage engine
  underneath: B+Tree (Postgres, MySQL — reads/range scans), LSM-tree (Cassandra,
  RocksDB — writes), Hash (Redis, DynamoDB — point lookups, no range scan),
  Inverted index (Elasticsearch — text matching), Columnar (BigQuery, ClickHouse,
  Apache Pinot — analytical aggregation), plus NewSQL, Graph, and Time-Series as
  their own specialist categories, each covered in its own lesson next.

**Hands-On**
- Prerequisites: none beyond what 6.4-6.8's labs will need.
- Setup: none — this lesson's "lab" is a decision exercise, not infrastructure.
- Simulate the scenario: take 3 real access patterns — "look up a user by ID"
  (point lookup), "find all orders for a user in the last 30 days" (range scan),
  "find every document mentioning 'refund'" (full-text search) — and, using only
  the categories in Overview, write down which engine category you'd pick for
  each and why, before reading the dedicated lessons that follow.
- What to observe: whether your instinct matches the pattern from Overview (B+Tree
  for point lookup + range, Inverted Index for full-text) — mismatches here are
  exactly the intuition 6.4-6.8's hands-on labs will sharpen.
- Stretch goal: none — revisit this exercise after finishing 6.4-6.8 and see if
  your answers change.

**Bridge out:** every category named here gets its own dedicated lesson,
immediately.

### 6.4  SQL (Postgres, MySQL)  `(#sql)`
> B+Tree engines favor reads and range scans — SQL databases are the concrete
> example of that trade-off.

**Overview**
- ACID: Atomicity (all-or-nothing), Consistency (constraints always enforced),
  Isolation (concurrent transactions don't corrupt each other), Durability
  (committed data survives a crash).
- Postgres features: MVCC (readers never block writers), rich indexing
  (GIN/GiST/BRIN), JSONB, native partitioning, extensions (PostGIS, TimescaleDB,
  Citus, pg_trgm). Scaling past one machine: PgBouncer (connection pooling), Citus
  (distributed Postgres extension), Vitess (originally MySQL sharding
  middleware).

**Hands-On**
- Prerequisites: Docker (Postgres); `psql`.
- Setup: local/free — `docker run -d -p 5432:5432 postgres`.
- Simulate the scenario: open 2 `psql` sessions against the same table. In
  session A, start a transaction and update a row but don't commit yet. In
  session B, read that same row (default isolation) — it sees the old value,
  proving readers aren't blocked (MVCC). Then in session A, try to update a row
  that session B is concurrently updating in an uncommitted transaction, and
  watch session A block until B commits or rolls back.
- What to observe: the exact moment session A's write blocks — that's row-level
  locking in action, distinct from the MVCC read behavior you just saw not
  block. Then deliberately violate a constraint (insert a duplicate primary key)
  and watch Postgres reject it — Atomicity and Consistency, enforced.
- Stretch goal: kill the Postgres container mid-transaction (before commit) and
  restart it — confirm the uncommitted change is gone (rolled back) while an
  earlier committed change survives the crash, Durability made concrete.

**Bridge out:** SQL trades write throughput and horizontal scale for strong
consistency — NoSQL is the family of engines making the opposite trade.

### 6.5  NoSQL  `(#nosql)`
> SQL's consistency guarantees come at the cost of horizontal scale — NoSQL trades
> some of that consistency back for scale and schema flexibility.

**Overview**
- 4 shapes for 4 access patterns: Document (nested, flexible schema — MongoDB),
  Key-Value (simplest, fastest point lookups — DynamoDB), Wide-Column (huge write
  throughput, sparse columns — Cassandra), Graph (relationships as first-class
  citizens, [SEE 6.11]).
- Cassandra's specific guarantees: a masterless ring (no single leader, no SPOF),
  tunable consistency (QUORUM vs ONE per query), and anti-entropy mechanisms —
  read repair, Merkle trees (a hash tree enabling fast comparison between two large
  datasets), hinted handoff — that quietly fix inconsistencies between replicas
  over time.

**Hands-On**
- Prerequisites: Docker (MongoDB and Cassandra images); a client for each
  (`mongosh`, `cqlsh`).
- Setup: local/free — `docker run -d -p 27017:27017 mongo` and
  `docker run -d -p 9042:9042 cassandra`.
- Simulate the scenario: model the same data (a user with a list of orders) 2
  ways — as one nested MongoDB document vs normalized rows across a Cassandra
  table partitioned by `user_id`. Fetch "user + all their orders" from each and
  compare query complexity (1 MongoDB `findOne` vs a Cassandra query scoped to
  one partition).
- What to observe: MongoDB returning the full nested structure in one call
  (flexible schema, no join needed) versus Cassandra requiring your data model
  to already be shaped around the query you'll run (partition key must match
  your access pattern, or the query fans out expensively across the cluster).
- Stretch goal: in Cassandra, set the consistency level to `ONE` for a write and
  `ONE` for a read immediately after on a different node in a multi-node local
  cluster (`docker-compose` with 2-3 Cassandra nodes) — occasionally read a stale
  value, then repeat with `QUORUM` on both and confirm it disappears.

**Bridge out:** "NoSQL" isn't one trade-off — which shape matches your data is the
right question, and NewSQL is the attempt to get NoSQL's scale without dropping ACID.

### 6.6  NewSQL  `(#newsql)`
> SQL doesn't scale horizontally easily; NoSQL scales but drops ACID — NewSQL is
> the attempt to get both.

**Overview**
- Global ACID at horizontal scale: Spanner (TrueTime + Paxos), CockroachDB (Raft),
  TiDB.

**Trade-offs**
- Strongest possible isolation, globally, and a familiar SQL interface — at the
  cost of 100ms+ consensus latency for multi-region writes and roughly 10× the
  cost of a plain Postgres instance.

**Hands-On**
- Prerequisites: Docker (CockroachDB's official free image).
- Setup: local/free — `docker run -d -p 26257:26257 -p 8080:8080
  cockroachdb/cockroach start-single-node --insecure`.
- Simulate the scenario: connect with `cockroach sql`, create a table, and run
  the same MVCC-conflict test from 6.4's Postgres lab (2 sessions, one holds an
  uncommitted update, the other tries to update the same row). Then check
  CockroachDB's built-in Admin UI (`localhost:8080`) for its replication and
  consensus visualizations.
- What to observe: the same ACID guarantees as Postgres, but explicitly built on
  Raft consensus across nodes (visible in the Admin UI once you add more than
  one node) — the "familiar SQL interface" claim from Trade-offs, felt directly
  by running SQL you already know against a fundamentally different, distributed
  engine underneath.
- Stretch goal: spin up a 3-node local CockroachDB cluster
  (`cockroach start --join=...`) and kill one node mid-query — confirm the
  cluster keeps serving reads/writes via the remaining majority, a live instance
  of Module 11's Raft/Paxos consensus.

**Bridge out:** none forward directly.

### 6.7  Time-Series DBs  `(#timeseries)`
> Wide-Column stores handle high write throughput generically; time-series
> databases specialize that further for one specific pattern.

**Overview**
- Optimized for append-heavy writes plus range queries over time — InfluxDB,
  Prometheus (pull-based scraping), TimescaleDB (a Postgres extension, full SQL
  over time-series data). High-ingest writes, automatic retention (TTL cleanup),
  downsampling (1s → 1min → 1hr as data ages).

**Hands-On**
- Prerequisites: Docker (Prometheus or InfluxDB image).
- Setup: local/free — `docker run -d -p 9090:9090 prom/prometheus`.
- Simulate the scenario: write a tiny script that exposes a `/metrics` endpoint
  in Prometheus's text format (a counter that increments every second),
  configure Prometheus to scrape it every 5s, and let it run for a few minutes.
  Query it via Prometheus's own UI (`localhost:9090`) with `rate(my_counter[1m])`.
- What to observe: Prometheus automatically building a time-series history from
  repeated scrapes with zero manual "insert a row" code on your part — pull-based
  ingestion, exactly as named in Overview, versus every other lesson's push-based
  writes.
- Stretch goal: configure a retention policy (`--storage.tsdb.retention.time=1h`)
  and confirm data older than that window disappears from queries — the
  automatic TTL cleanup claim, observed instead of assumed.

**Bridge out:** none forward directly, but this category reappears as the backing
store for Observability's Metrics lesson (13.2).

### 6.8  Search (Elasticsearch)  `(#search)`
> `LIKE '%fish%'` against a database forces a scan of every document, O(N ×
> doc_size) — unusably slow at millions of documents, and no traditional index
> helps because the match can be anywhere in the text.

**Overview**
- An inverted index maps each term to the documents containing it. Apache Lucene
  is the core library that actually builds and queries this index; Elasticsearch
  and Solr both wrap Lucene with a distributed layer (sharding, replication, a
  REST API) — Solr gets equal billing as "another Lucene wrapper," not a
  footnote.
- Text processing pipeline: tokenize → lowercase → remove stop words → stem
  ("climbed" → "climb"). A posting list stores term frequency (ranking), position
  (phrase queries), offset (highlighting). Ranking via BM25: term frequency ×
  inverse document frequency (rare terms score higher) × document length (shorter
  docs rank higher).
- Lucene never updates in place — new docs go into an in-memory buffer, flushed
  to an immutable segment, merged by a background merge policy. Inside each
  Lucene instance: the Inverted Index itself, Stored Fields, Doc Values (a
  columnar structure for fast sorting/aggregation), Segments, Merge Policy. At
  scale: sorted posting lists, delta encoding, tiered/champion lists, positional
  index, N-gram indexing (autocomplete), sharding.
- Use `search_after` for deep pagination, never `from/size` (which degrades
  badly at depth).

**Real-World**
- Wikipedia's full-text search, GitHub's code search across 200M+ repos, Uber's
  trip search.

**Trade-offs**
- Sub-second full-text search across billions of docs, but eventually consistent
  (refresh interval delay) and explicitly not a source of truth.

**Hands-On**
- Prerequisites: Docker (Elasticsearch's official free image).
- Setup: local/free — `docker run -d -p 9200:9200 -e "discovery.type=single-node"
  elasticsearch:8.x`.
- Simulate the scenario: index 1,000 short text documents (product descriptions
  work well) via the `_bulk` API, then run a `LIKE '%word%'`-equivalent query
  against a Postgres table with the same data (no index) and compare timing
  against an Elasticsearch `match` query for the same term.
- What to observe: Elasticsearch returning results with a `_score` per document
  (BM25 ranking, higher for rarer/more relevant terms) versus Postgres's `LIKE`
  returning an unordered list with no relevance signal at all — and a real
  latency gap at this document count that widens sharply as you scale it up.
- Stretch goal: index a new document, immediately query for it, and note it's
  sometimes not yet visible (before the refresh interval, default ~1s) — the
  "eventually consistent" claim from Trade-offs, caught in the act.

**Bridge out:** "reindex from source DB, never a source of truth" is the exact
pattern Data Pipelines' CDC lesson (12.1) implements to keep Elasticsearch in sync.

### 6.9  Blob Storage (S3)  `(#blob)`
> Images, videos, backups, and logs don't fit the row/column model any database in
> this module was built for, and they can be enormous.

**Overview**
- Eleven-nines (99.999999999%) durability. Storage tiers with automatic lifecycle
  transitions: Standard → Infrequent Access (30 days) → Glacier (90 days, minutes
  to retrieve) → Deep Archive (1 year, 12-48 hours to retrieve). Features:
  pre-signed URLs (client uploads directly, bypassing the app server), versioning,
  multipart upload (parallel chunks for large files), event notifications
  (trigger a Lambda on upload), cross-region replication.
- Strong read-after-write consistency (since December 2020) — a real, named
  guarantee, not "eventually." Scale limit: partition prefixes support >5,500
  GET/sec or >3,500 PUT/sec per prefix.

**Hands-On**
- Prerequisites: AWS free-tier account (S3 free tier is generous).
- Setup: cloud free-tier — an S3 bucket; local/free — MinIO (`docker run -d -p
  9000:9000 minio/minio server /data`) as an S3-compatible local alternative.
- Simulate the scenario: upload a file, immediately read it back (confirm strong
  read-after-write). Generate a pre-signed URL (`aws s3 presign s3://bucket/key
  --expires-in 300`) and use `curl` to upload directly to it from your terminal,
  with the app server never touching the file's bytes. Set up a lifecycle rule
  transitioning objects to Infrequent Access after 30 days (visible in the
  console even without waiting 30 days).
- What to observe: the pre-signed URL upload succeeding with zero involvement
  from your app server beyond generating the URL itself — the exact pattern
  named in Overview for large uploads that shouldn't proxy through your backend.
- Stretch goal: enable versioning on the bucket, overwrite the same key twice,
  and list all versions (`aws s3api list-object-versions`) — confirm both old
  versions are still retrievable.

**Bridge out:** "reindex from S3" and "cache in front of S3" both feed directly
into Caching's CDN lesson (7.12).

### 6.10 Vector Databases  `(#vector-db)`
> Elasticsearch matches on exact/fuzzy text; vector databases match on *meaning*
> — a fundamentally different similarity notion.

**Overview**
- Stores high-dimensional embeddings, finds the nearest ones to a query vector
  (approximate nearest-neighbor search, not exact match). ANN algorithms: HNSW
  (graph-based, fast and accurate, memory-hungry), IVF-PQ (clusters + compressed
  vectors, memory-efficient), Flat/brute-force (exact, only at small scale), ScaNN
  (Google's algorithm for very large-scale search).
- Concrete sizing: OpenAI's `text-embedding-3-small` (1536 dims), Cohere (1024),
  BGE/E5 (768), CLIP for images (512) — 1M vectors at 1536 dims is roughly 6GB of
  RAM, a real number worth having on hand.

**Hands-On**
- Prerequisites: Docker (Qdrant or Chroma, both free); Python.
- Setup: local/free — `docker run -d -p 6333:6333 qdrant/qdrant`; cloud
  free-tier — Qdrant Cloud's or Pinecone's free tier.
- Simulate the scenario: embed 1,000 short sentences with a free local model
  (`sentence-transformers`, no API key needed) to get 384-dim vectors, insert
  them into Qdrant, then query with a new sentence's embedding and ask for the
  top 5 nearest neighbors.
- What to observe: the returned results being semantically similar to your query
  even when they share zero exact words — the "matches on meaning, not exact
  text" distinction from the problem statement, felt directly, contrasted
  against 6.8's Elasticsearch exact/fuzzy term matching.
- Stretch goal: insert 100,000 vectors (synthetic random ones are fine for a
  timing test) and compare query latency using HNSW (Qdrant's default) versus
  forcing an exact/brute-force search — the accuracy-for-speed trade-off ANN
  algorithms make, measured.

**Bridge out:** none forward directly — this is the storage layer the separate AI
Systems course builds RAG on top of.

### 6.11 Graph DB Deep Dive  `(#graph-db-deep)`
> "Find all friends-of-friends within 3 hops" in a relational database means a
> chain of expensive JOINs, growing costlier with every additional hop.

**Overview**
- Index-free adjacency: each node record is fixed-size with a direct pointer
  (`first_rel_ptr`) to its first relationship; each relationship record
  (`first_prop_ptr`, `next_rel_ptr`) forms a linked list per node — traversing a
  connection is O(1) regardless of overall graph size, because it's pointer-chasing,
  not an index lookup. Named engines beyond Neo4j: Amazon Neptune, JanusGraph,
  ArangoDB (multi-model), TigerGraph (analytics-heavy).

**Trade-offs**
- Excellent for relationship-heavy queries; genuinely poor at simple CRUD,
  very-high-volume writes (>100K/sec), aggregation/analytics, or storing large
  blobs.

**Hands-On**
- Prerequisites: Docker (Neo4j's free Community image).
- Setup: local/free — `docker run -d -p 7474:7474 -p 7687:7687 neo4j`.
- Simulate the scenario: create ~200 `Person` nodes with `FRIENDS_WITH`
  relationships forming a realistic social graph, then run a "friends of friends
  within 3 hops" query in Cypher (`MATCH (me:Person)-[:FRIENDS_WITH*1..3]-(fof)
  WHERE me.name='Alice' RETURN DISTINCT fof`) and time it. Model the exact same
  data in Postgres as a `friendships` table and write the equivalent 3-hop query
  as nested JOINs (or a recursive CTE), then time that.
- What to observe: the Neo4j query staying fast as you increase hop depth from 1
  to 3 to 4, while the SQL JOIN-based version's execution time and query
  complexity both grow sharply — the index-free adjacency claim, measured with
  your own `EXPLAIN`/timing numbers on both sides.
- Stretch goal: visualize the graph in Neo4j's built-in browser UI
  (`localhost:7474`) and click through actual relationship paths — a felt sense
  of why "pointer-chasing, not an index lookup" makes traversal cheap regardless
  of total graph size.

**Bridge out:** none forward directly — a self-contained specialist lesson.

### 6.12 Connection Pooling  `(#connection-pooling)`
> Every database lesson so far assumes a service can just "open a connection" —
> doing that per-request is expensive and databases cap concurrent connections
> hard.

**Overview**
- Opening a connection per request costs a TCP handshake + auth handshake every
  time, and a traffic spike can exhaust the DB's connection cap outright. Poolers:
  PgBouncer (Postgres — with 3 modes: session, transaction, statement), HikariCP
  (JVM apps), ProxySQL (MySQL), RDS Proxy (managed, AWS-native).
- The serverless-specific version of this problem: 1,000 Lambda containers — 5
  connections each = 5,000 attempted connections against a database capped at 100
  — exactly why RDS Proxy or a pooler sits in front of serverless functions.

**Hands-On**
- Prerequisites: Docker (Postgres + PgBouncer images).
- Setup: local/free — `docker run -d -p 5432:5432 -e
  POSTGRES_HOST_AUTH_METHOD=trust postgres -c max_connections=20` (deliberately
  small cap) plus a PgBouncer container in front of it in transaction mode.
- Simulate the scenario: write a script that opens 50 direct connections to
  Postgres concurrently (no pooler) and watch it start erroring with "too many
  connections" once it crosses 20. Repeat the exact same script pointed at
  PgBouncer instead.
- What to observe: PgBouncer absorbing all 50 client connections while only
  holding a small pool (e.g. 10) of actual connections open to Postgres
  underneath — the many-clients-few-real-connections multiplexing that makes
  the serverless math in Overview work.
- Stretch goal: switch PgBouncer from transaction mode to session mode and
  re-run the same 50-connection test — watch it behave more like the
  no-pooler case, since session mode holds one backend connection per client
  for the whole session instead of only during an active transaction.

**Bridge out:** none forward directly.

### 6.13 Schema Migrations  `(#schema-migrations)`
> Changing a live table's schema can lock the table and take production down for
> the duration, on a large enough table.

**Overview**
- Migration tools: Flyway, Liquibase, Alembic, Prisma Migrate, Rails/Django's
  built-in migrations. Zero-downtime tools for very large tables:
  `pt-online-schema-change` (MySQL), `gh-ost`.
- Expand-Contract pattern: add the new column → dual-write to both old and new →
  backfill historical data → switch reads to the new column → drop the old one,
  only once nothing reads it anymore.

**Hands-On**
- Prerequisites: Docker (Postgres); Flyway or Alembic (both free).
- Setup: local/free — `docker run -d -p 5432:5432 postgres`.
- Simulate the scenario: seed a `users` table with 1M rows, then rename a column
  directly with `ALTER TABLE users RENAME COLUMN email TO email_address` and
  time how long it takes and whether the table locks during it. Then do the same
  change properly via Expand-Contract: add `email_address` as a new column,
  backfill it in batches (`UPDATE ... WHERE id BETWEEN x AND y`, not one giant
  UPDATE), switch the app to read the new column, then drop the old one in a
  separate, later migration.
- What to observe: the direct rename's lock duration scaling with table size
  (measurable via `EXPLAIN ANALYZE` or just wall-clock time), while the
  Expand-Contract version's individual steps each stay fast because no single
  step ever locks the whole table for the full backfill.
- Stretch goal: use Flyway to version both migrations (`V1__add_column.sql`,
  `V2__drop_old_column.sql`) and run `flyway info` to see the applied/pending
  state — the audit trail a manual `ALTER TABLE` in a terminal never leaves.

**Bridge out:** closes Module 6. Caching opens next, motivated directly by "every
one of these storage engines still requires a disk trip."

---

## Module 7 — Caching
`(07-caching.html)` — every storage read in Module 6 is a disk trip; disk is ~100,000× slower than RAM, and most of that latency is avoidable.

### 7.1  Caching Strategies  `(#caching)`
> The same homepage, product, or profile gets requested thousands of times a
> second, and every time the app asks the database for the exact same answer —
> computed or fetched fresh, even though it barely ever changes. Disk is ~10ms;
> RAM is ~100ns — a 100,000× gap sitting there unclaimed.

**Overview**
- A cache is a small, fast layer (usually RAM) holding answers you keep needing.
  Two questions split 5 strategies: on a miss, who fetches — the app (Cache-Aside)
  or the cache itself (Read-Through)? On a write, what order — cache and DB
  together (Write-Through, zero stale window, doubles write cost), cache only and
  flush later (Write-Back, fastest, real data-loss risk on crash), or skip the
  cache entirely (Write-Around, for rarely-re-read data)?

**Real-World**
- Cache-Aside: Twitter timelines, YouTube video metadata, Shopify product pages.
  Read-Through: DynamoDB's DAX, Cloudflare's origin pull. Write-Through: adding a
  friend, add-to-cart. Write-Back: gaming leaderboards, GPS pings. Write-Around:
  logs, audit trails, IoT telemetry.

**Metrics**
- Cache hit rate — good systems run above 95%; a 1-point improvement (95% → 96%)
  at scale can mean 20% fewer requests hitting the real database.

**Hands-On**
- Prerequisites: Docker (Redis + Postgres); Node.js or Python; `redis-benchmark`
  (ships with Redis) and `k6` or `hey`.
- Setup: local/free — `docker run -d -p 6379:6379 redis` and
  `docker run -d -p 5432:5432 postgres`; cloud free-tier — AWS ElastiCache free
  tier + RDS free tier for the real-infra version.
- Simulate the scenario: seed Postgres with a `products` table (10,000 rows) and
  build `GET /products/:id` two ways: (a) hits Postgres directly every time, (b)
  Cache-Aside — checks Redis first, on a miss reads Postgres and writes the
  result to Redis with `EXPIRE 300`. Load-test both at 1,000 concurrent users,
  10,000 requests total, with a realistic read pattern (80% of requests hitting
  the same 20% of product IDs — the classic hot-data skew): `hey -n 10000 -c 1000
  <url>`.
- What to observe: version (a)'s p99 latency and Postgres CPU utilization
  (`docker stats`) climbing under load, versus version (b)'s p99 staying flat
  once the cache warms up — measure your own cache hit rate with `redis-cli INFO
  stats` (`keyspace_hits` / (`keyspace_hits`+`keyspace_misses`)) and compare
  against the "above 95%" benchmark from Metrics.
- Stretch goal: implement Write-Through on `PUT /products/:id` (write to
  Postgres and Redis in the same request) and confirm a read immediately after
  a write never sees stale data — then implement Write-Back instead (write to
  Redis only, flush to Postgres every 10s) and measure how much faster writes
  become, and how much data you'd lose if the process crashed before a flush.

**Bridge out:** every strategy here assumes you know when to remove a stale entry
— a question this lesson deliberately defers.

### 7.2  Cache Invalidation & Eviction  `(#cache-invalidation)`
> "There are only two hard things in computer science: cache invalidation and
> naming things." A user updates their profile photo — the DB has the new one,
> the cache still confidently, silently serves the old one. Nothing crashes; the
> system is just quietly wrong.

**Overview**
- TTL (expires automatically — simple, caps rather than prevents staleness) vs
  Event-Driven (the app or a CDC pipeline deletes the key the instant the DB
  changes — no stale window, more moving parts). 6 invalidation methods total:
  TTL, Event-Driven Delete, CDC Invalidation, Version Keys, Double-Delete, Pub/Sub
  Broadcast.
- Eviction (a separate question — "the cache is full, what gets thrown out"): 5
  policies — LRU (default, recency predicts reuse well), LFU, FIFO, Random,
  TTL-based (closest to expiry first).

**Failure Modes**
- **Thundering Herd (Cache Stampede):** a hot key expires, thousands of requests
  discover the miss simultaneously, all rush the database at once. Fix: a
  mutex/single-flight (first request refills, everyone else waits) or
  probabilistic early expiry.
- **Cache Penetration:** a query for a key that never exists anywhere becomes a
  guaranteed miss, every time — a way to bypass the cache entirely. Fix: cache
  the absence itself (null, short TTL) or a Bloom filter that rejects impossible
  keys before they reach the cache.
- **Cache Avalanche:** thousands of keys, all given the same TTL, expire in the
  same instant, producing a coordinated DB spike. Fix: jittered TTLs
  (`3600 + random(0,300)`) so expiries spread out.
- **Hot Key Problem:** one single key gets millions of reads, overloading the one
  Redis node holding it — a hotspot, not an expiry issue. Fix: a local L1
  in-process cache, replicating the hot key across multiple slots, or sharding the
  value itself (`key:1`...`key:N`).

**Hands-On**
- Prerequisites: the Cache-Aside setup from 7.1; `redis-cli`; `hey` or `k6`.
- Setup: local/free — same Redis + Postgres containers from 7.1.
- Simulate the scenario: reproduce **Thundering Herd** directly — pick one
  product ID, set its cache TTL to 5 seconds, then fire 500 concurrent requests
  for that exact ID (`hey -n 500 -c 500 <url>/products/42`) timed to land right
  as the TTL expires. Watch Postgres's active connection count spike
  (`SELECT count(*) FROM pg_stat_activity`) as hundreds of requests all miss at
  once and hit the DB simultaneously. Then add a `SETNX lock:42 1 EX 5` guard so
  only the first miss actually queries Postgres while the rest wait/retry, and
  repeat the exact same load test.
- What to observe: the DB connection spike from the first run disappearing
  almost entirely in the second — a direct, measured fix for the exact failure
  mode named above, not just a description of it.
- Stretch goal: reproduce **Cache Penetration** by hammering `/products/999999`
  (an ID that doesn't exist) 1,000 times and watching every single request hit
  Postgres. Fix it by caching the absence (`SET product:999999:miss "" EX 60`)
  and confirm the 1,000th request never touches the database.

**Bridge out:** these 4 failure modes are exactly the incidents that page someone
at 3am — and the fix for all of them leans on Redis's actual commands, which the
next lesson introduces.

### 7.3  Redis Data Structures  `(#redis)`
> A plain key-value cache means writing a lot of application code to fake a
> leaderboard, a unique-visitor counter, or a job queue on top of "just a blob."

**Overview**
- 8 structures, each with the commands that make them worth it:
  - **String** — `SET`/`GET`/`INCR`/`EXPIRE`; `SETNX` (or `SET ... NX`) as a free
    distributed lock; `INCR` as an atomic counter for rate limiting.
  - **Hash** — `HSET`/`HGETALL`/`HINCRBY`; a user profile or cart you can update
    one field of.
  - **List** — `LPUSH`/`BRPOP`/`LRANGE`; a job queue, `BRPOP` to block-and-wait.
  - **Set** — `SADD`/`SINTER`/`SISMEMBER`; who's online, dedup, instant
    mutual-friends via `SINTER`.
  - **Sorted Set** — `ZADD`/`ZREVRANGE`/`ZINCRBY`; a leaderboard's top 10, no
    manual sorting; also a sliding-window rate limiter and delayed-job queue.
  - **HyperLogLog** — `PFADD`/`PFCOUNT`/`PFMERGE`; counts uniques in a fixed
    ~12KB, ~0.81% error.
  - **Geo** — `GEOADD`/`GEOSEARCH`/`GEODIST`; "everyone within 2km," a sorted set
    with a geohash trick underneath.
  - **Stream** — `XADD`/`XREADGROUP`/`XACK`; an append-only event log with
    consumer groups, a lightweight Kafka inside Redis.

**Hands-On**
- Prerequisites: Docker (Redis); `redis-cli`.
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: build a leaderboard with `ZADD leaderboard 1500 "alice"`,
  `ZADD leaderboard 2200 "bob"`, add 8 more players, then get the top 5 with
  `ZREVRANGE leaderboard 0 4 WITHSCORES` — no application-side sorting code at
  all. Separately, count unique visitors with `PFADD visitors:today user1 user2
  ...` for 100,000 synthetic user IDs (a script can generate these) and compare
  `PFCOUNT visitors:today` against the true distinct count — check the error
  percentage against the ~0.81% claim.
- What to observe: `ZREVRANGE`'s output already sorted, and `PFCOUNT`'s answer
  landing within roughly 1% of the true count while `MEMORY USAGE visitors:today`
  reports only a few KB regardless of whether you inserted 10,000 or 10,000,000
  IDs — the fixed ~12KB claim, verified.
- Stretch goal: build a simple job queue with `LPUSH jobs '{"task":"resize"}'`
  and 3 worker scripts calling `BRPOP jobs 0` in a loop — start all 3, push 10
  jobs, and watch them get distributed across workers with no job processed
  twice.

**Bridge out:** none of these structures matter if Redis itself is slow — the next
lesson is why it isn't.

### 7.4  Why Redis Is So Fast  `(#redis-fast)`
> A single Redis thread does 100,000 to a million operations a second — one
> thread, one core, no fleet of servers. Everything you've heard about needing
> more cores for performance, Redis seems to ignore.

**Overview**
- Six compounding decisions: never touches disk for reads (RAM ~100ns, SSD
  ~100µs, HDD ~10ms — 100,000× just from that alone); single-threaded on purpose
  (no locks, no context-switching, no race conditions); [SEE 2.11] non-blocking
  I/O via `epoll`; CPU-cache-friendly internals (SDS strings — Simple Dynamic
  Strings — and ziplist encodings, skiplists for sorted sets); a dead-simple wire
  protocol (RESP, near-free to parse); pipelining (batch many commands into one
  round trip, up to 10× throughput).

**Failure Modes**
- One slow command (`SMEMBERS` on a huge set) blocks everything behind it — use
  `SCAN` instead of `KEYS *` in production. Redis 6.0+ added extra I/O threads, but
  only for reading network bytes, never for running commands.

**Hands-On**
- Prerequisites: Docker (Redis); `redis-benchmark` (ships with Redis).
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: run `redis-benchmark -t set,get -n 100000 -q` and read
  the reported ops/sec for plain SET/GET. Then run the same benchmark with
  `-P 16` (pipelining 16 commands per round trip) and compare throughput.
- What to observe: ops/sec climbing substantially with pipelining enabled — a
  concrete number next to the "up to 10× throughput" claim from Overview,
  measured on your own machine instead of taken on faith.
- Stretch goal: insert a 1M-member set (`redis-cli` a loop of `SADD bigset
  item1..item1000000`), then time `KEYS *` against `SCAN 0 COUNT 100` in a loop —
  `KEYS *` will visibly block other commands issued from a second `redis-cli`
  session while it runs; `SCAN` won't, because it returns incrementally instead
  of all at once.

**Bridge out:** structures plus speed combine into Redis's single most common
production job — sitting in front of a database as a cache.

### 7.5  Redis as Cache  `(#redis-cache)`
> Topic 2's strategies were abstract; this is what actually happens, command by
> command, when your app asks for a user's profile.

**Overview**
- Cache-aside spelled out: app asks Redis for `user:42` → hit, done in under a
  millisecond; miss → app reads the DB, writes the result with a TTL, returns it.
- Eviction policy choice: `allkeys-lru` (the default for "Redis is purely a
  cache"), `allkeys-lfu`, `volatile-lru` (only evicts keys that have a TTL set),
  `noeviction` (refuse writes and error once full — for a real data store, not a
  cache).

**Failure Modes**
- [SEE 7.2] The same 4 failure modes, with the Redis-specific fix: thundering herd
  → `SETNX` as a refill lock; penetration → cache the absence; avalanche → jitter
  the TTLs. Anti-patterns: no TTL at all, caching everything indiscriminately, no
  eviction policy configured (OOM crash), inconsistent invalidation (multiple code
  paths update the DB, only one remembers to clear the cache).

**Hands-On**
- Prerequisites: Docker (Redis); `redis-cli`.
- Setup: local/free — `docker run -d -p 6379:6379 redis --maxmemory 10mb
  --maxmemory-policy noeviction` (deliberately tiny, to hit the limit fast).
- Simulate the scenario: write a script that inserts keys until Redis rejects a
  write (`OOM command not allowed`) under `noeviction`. Then switch the policy
  live with `CONFIG SET maxmemory-policy allkeys-lru` and repeat — Redis now
  silently evicts old keys instead of erroring.
- What to observe: the exact behavioral difference between the two policies at
  the moment memory fills up — `noeviction` breaking your writes outright
  (correct for a real data store you can't afford to silently lose data from),
  `allkeys-lru` staying available by discarding the least-recently-used entries
  (correct for a pure cache where staleness beats downtime).
- Stretch goal: set `volatile-lru` instead, insert a mix of keys with and
  without a TTL, and confirm only the TTL'd keys are ever eligible for eviction
  — keys with no expiry survive even as memory fills, exactly matching its name.

**Bridge out:** everything so far lives in Redis's RAM — the next lesson is what
happens the moment that RAM disappears.

### 7.6  Redis Pub/Sub  `(#redis-pubsub)`
> Three people in a chat room; one sends a message; the other two need to see it
> instantly, not on their next poll.

**Overview**
- Publishers send to a channel; every subscriber currently listening gets it
  instantly. If nobody's listening, the message is simply gone — no history, no
  replay, no persistence, on purpose. `PUBLISH chat:room1 "Hello!"` reaches every
  current subscriber in under a millisecond; `PSUBSCRIBE chat:*` pattern-matches
  across channels.

**Real-World**
- Real-time collaboration signals, online presence, and — a callback to 7.2 — a
  common way to tell other app servers "invalidate this cache key" the instant
  something changes.

**Hands-On**
- Prerequisites: Docker (Redis); 2 terminal windows for `redis-cli`.
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: in terminal A, run `redis-cli SUBSCRIBE chat:room1` and
  leave it running. In terminal B, run `redis-cli PUBLISH chat:room1 "hello"` —
  watch it appear instantly in terminal A. Now close terminal A (unsubscribe),
  publish another message from B, then reopen a subscriber in A.
- What to observe: the message published while nobody was subscribed simply
  never appearing anywhere — no history, no replay, exactly as stated in
  Overview, made concrete instead of asserted. Then open 3 subscriber terminals
  at once and confirm a single `PUBLISH` reaches all 3 simultaneously.
- Stretch goal: use `PSUBSCRIBE chat:*` in one terminal and publish to
  `chat:room1`, `chat:room2`, and `chat:general` from another — confirm the
  pattern subscriber catches all 3 while a plain `SUBSCRIBE chat:room1`
  subscriber only catches the first.

**Bridge out:** Pub/Sub explicitly can't guarantee delivery to an offline
consumer — the next lesson is Redis's answer when that guarantee is required.

### 7.7  Redis Streams  `(#redis-streams)`
> Same chat-app energy, harder requirement: every message must be durable, and a
> worker offline for 5 minutes must see everything it missed the moment it
> reconnects.

**Overview**
- An append-only log that persists after being written — anyone can read from any
  point and catch up. Consumer groups: multiple workers in one group each get a
  distinct share of the stream, while a second group reading the same stream sees
  everything independently.

**Trade-offs**
- Pub/Sub vs Streams: Pub/Sub is real-time broadcast with zero persistence;
  Streams is a durable log with replay (`XRANGE`) and at-least-once delivery
  (`XACK`) — but single-node throughput tops out under ~100K/sec vs Kafka's
  millions, so it's a lightweight substitute, not a full replacement.

**Hands-On**
- Prerequisites: Docker (Redis); `redis-cli`.
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: `XADD orders '*' item "widget" qty 3` a few times to
  build up a stream, then create a consumer group (`XGROUP CREATE orders
  workers '$'`) and have 2 "worker" terminals both call `XREADGROUP GROUP
  workers worker1 COUNT 1 STREAMS orders >` (and `worker2` for the second) in a
  loop. Add new entries and watch them split across the two workers, never
  duplicated. Kill worker1 mid-processing (before it `XACK`s) and check
  `XPENDING orders workers` — the unacknowledged message is still sitting there
  for another worker to claim.
- What to observe: a worker that was offline when messages were added still
  being able to `XREADGROUP` and receive everything it missed once it
  reconnects — the exact durability property Pub/Sub in 7.6 explicitly lacked,
  contrasted directly.
- Stretch goal: benchmark raw `XADD` throughput with a tight loop of 100,000
  writes and compare against Kafka's typical numbers from Module 8 once you
  reach it — a felt sense of "lightweight substitute, not full replacement."

**Bridge out:** everything so far lives in Redis's RAM — surviving a crash or
restart is the next question.

### 7.8  Redis Persistence & HA  `(#redis-ha)`
> Redis is, by design, in-memory — a crash or restart without persistence means
> everything it held is simply gone.

**Overview**
- RDB (point-in-time binary snapshot — fast restore, loses everything since the
  last snapshot) vs AOF (append-only log of every write, with 3 fsync policies:
  `always`, `everysec`, `no` — each a different data-loss guarantee). Replication
  gives standby copies; Sentinel monitors the primary and automatically promotes a
  replica on failure (using a Raft-like election among the Sentinels themselves,
  typically 5-15 seconds to fail over), without requiring a full consensus
  protocol.
- Safety valves worth naming: `WAIT numreplicas timeout` (a semi-sync command
  that waits for N replicas to acknowledge), `min-replicas-to-write` /
  `min-replicas-max-lag` (refuse writes if too few replicas are caught up).

**Hands-On**
- Prerequisites: Docker (Redis); `redis-cli`.
- Setup: local/free — 2 Redis containers, one configured as a replica of the
  other (`docker run -d redis --replicaof <primary-ip> 6379`); AOF enabled on
  the primary (`--appendonly yes`).
- Simulate the scenario: write 100 keys to the primary with AOF disabled, kill
  the container (`docker kill`) without a clean shutdown, restart it, and check
  how many keys survived (likely very few — no persistence, no defense). Repeat
  with AOF enabled and `appendfsync everysec` — kill and restart again.
- What to observe: the AOF-enabled instance recovering nearly all writes (at most
  ~1 second of loss, matching `everysec`'s stated guarantee), versus the
  no-persistence instance losing everything — a measured, not asserted, version
  of the RDB/AOF trade-off from Overview.
- Stretch goal: confirm replication by writing a key on the primary and reading
  it from the replica (`redis-cli -p <replica-port> GET key`) within
  milliseconds — then kill the primary and manually promote the replica
  (`REPLICAOF NO ONE`), simulating what Sentinel would do automatically.

**Bridge out:** what changes once Redis itself is sharded across many nodes.

### 7.9  Redis Deployment Modes  `(#redis-cluster)`
> From a single laptop-dev instance up to a globally sharded production cluster —
> 4 modes, a real progression: Single Node, Sentinel, Cluster, Managed
> (ElastiCache/MemoryDB/Upstash).

**Overview**
- Nodes discover each other and detect failures via a gossip protocol ([SEE
  11.1, 11.12]). Keys are distributed via `CRC16(key) % 16384` into 16,384 hash
  slots; clients get redirected (`MOVED`/`ASK`) when a key has migrated during a
  rebalance. Hash tags (`{user:123}.profile`) force related keys onto the same
  slot, enabling multi-key operations that would otherwise span slots.

**Hands-On**
- Prerequisites: Docker Compose; `redis-cli`.
- Setup: local/free — a 6-node Redis Cluster via `docker-compose` (3 primaries +
  3 replicas is the standard minimal topology; several ready-made Compose files
  exist for this, or use `redis-cli --cluster create` once the 6 containers are
  up).
- Simulate the scenario: connect with `redis-cli -c` (cluster mode) and set keys
  with and without hash tags: `SET user:123:name Alice` and
  `SET user:123:email a@x.com` (may land on different slots) vs
  `SET {user:123}:name Alice` and `SET {user:123}:email a@x.com` (forced onto
  the same slot via the hash tag). Try an `MGET` across both pairs.
- What to observe: the non-tagged keys potentially triggering a `MOVED`
  redirect or a cross-slot error on a multi-key operation, while the tagged
  pair always succeeds — the hash-tag mechanism, working exactly as described.
- Stretch goal: kill one primary node and watch `redis-cli --cluster check`
  report a failover to its replica, then confirm keys in that node's slot range
  are still reachable through the cluster (redirected automatically) with no
  client-side reconfiguration needed.

**Bridge out:** none forward directly, but this sharding is conceptually the same
problem Scalability's Sharding lesson (10.4) solves generically.

### 7.10 Redis Distributed Locks  `(#redis-locks)`
> Two processes both think they hold the same lock — a classic distributed-systems
> failure — and the naive fix breaks in a specific, well-documented way worth
> understanding before relying on it.

**Overview**
- Simple lock: `SET key value NX EX 30` — one atomic operation, with an automatic
  expiry so a crashed holder doesn't lock everyone out forever.

**Failure Modes**
- Why Redlock is controversial: a process can hold the lock, then pause (GC,
  clock jump, network partition) long enough for the lock to expire and be
  re-granted — the original holder resumes unaware it no longer holds it, and both
  believe they're safe. 4 named attack vectors against Redlock: GC/Process Pause,
  Clock Drift (an NTP jump), Network Partition, Redis Failover. The fix: fencing
  tokens — a monotonically increasing number issued with the lock, checked by
  whatever the lock protects, so a stale holder's write is rejected even if it
  still thinks it holds the lock.
- 3 systems built around fencing-token-native locking instead: Google Chubby
  (Paxos + sequencer), etcd (Raft + revision numbers), ZooKeeper (ephemeral
  znodes). Martin Kleppmann's framing is worth repeating: Redlock is "not safe for
  correctness, fine for efficiency."

**Hands-On**
- Prerequisites: Docker (Redis); Node.js or Python.
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: write 2 worker processes that both try `SET
  lock:resource1 <workerId> NX EX 5` in a tight retry loop against the same
  resource. Confirm only one worker "wins" the lock at a time and the other
  keeps retrying until it expires or is released. Then simulate the Redlock
  failure: have worker A acquire the lock, artificially pause it (a
  `sleep(6000)` longer than the lock's 5-second TTL, standing in for a GC pause),
  let the lock expire and worker B acquire it, then let worker A "wake up" and
  perform its action as if it still held the lock.
- What to observe: both workers believing they hold the lock simultaneously
  during that overlap window — the exact split-brain scenario named in Failure
  Modes, reproduced on purpose. Then add a fencing token (an incrementing
  counter returned with each lock grant) and have the protected resource reject
  any write carrying a token older than the last one it accepted — worker A's
  stale write now gets rejected instead of silently corrupting data.
- Stretch goal: none — this lesson's value is the failure reproduction, and it's
  already fairly involved.

**Bridge out:** none forward, but this exact lock was already used, unexplained,
in APIs' Idempotent APIs lesson (3.5).

### 7.11 Memcached vs Redis  `(#memcached-vs-redis)`
> Both are in-memory stores — the honest comparison against the other classic
> option.

**Overview**
- Redis is the Swiss-army knife (rich structures, persistence, pub/sub, streams,
  locks); Memcached is the simple speed demon (pure key-value, multi-threaded,
  nothing else). Concrete numbers: Redis's max value size is 512MB vs Memcached's
  1MB default; Memcached uses a slab allocator for memory management, a distinct
  named technique from Redis's approach.

**Hands-On**
- Prerequisites: Docker (both images); `redis-benchmark` and `memtier_benchmark`
  or Memcached's own bench tools.
- Setup: local/free — `docker run -d -p 6379:6379 redis` and
  `docker run -d -p 11211:11211 memcached`.
- Simulate the scenario: run equivalent SET/GET benchmarks against both with the
  same concurrency (`redis-benchmark -t set,get -n 100000 -c 50` and the
  Memcached equivalent) and compare raw ops/sec. Then try storing a 2MB value in
  each — Redis accepts it, Memcached's default 1MB limit rejects it outright.
- What to observe: Memcached's multi-threaded design potentially outperforming
  single-threaded Redis on raw GET/SET throughput at high concurrency on a
  multi-core machine — a real, measurable case where "simpler" wins on its one
  job, exactly the trade-off named in Overview.
- Stretch goal: try to build a leaderboard (from 7.3's ZADD/ZREVRANGE) using only
  Memcached's plain key-value model — notice how much manual sorting logic
  you'd have to write client-side that Redis's Sorted Set gave you for free.

**Bridge out:** none forward — a self-contained comparison lesson.

### 7.12 CDN  `(#cdn)`
> A user 8,000 miles from your origin pays for that entire round trip on every
> request, even for content that never changes.

**Overview**
- A globally distributed network of edge PoPs. Pull CDN (lazy — caches on first
  request) vs Push CDN (proactive — pre-populates every PoP before traffic
  arrives). A 4-tier scaling ladder, with real products at each: Tier 1 — No CDN,
  browser cache only; Tier 2 — Pull CDN (Cloudflare, CloudFront); Tier 3 —
  Multi-Tier with a shield layer (Fastly, Akamai); Tier 4 — Custom CDN inside ISPs
  (Netflix Open Connect).
- Scaling mechanics: a shield layer collapses duplicate misses (100 PoPs missing →
  1 origin request, not 100); tiered TTLs (edge 60s, shield 5min, origin 1h);
  request coalescing (1,000 users requesting the same uncached asset triggers only
  1 origin request); stale-while-revalidate.

**Failure Modes**
- [SEE 7.2] Thundering herd and cache stampede reappear here at CDN scale, plus
  purge storms (a mass invalidation overloads the origin) — fixed with soft purges
  instead of hard, immediate invalidation.

**Real-World**
- Netflix Open Connect serves 95%+ of its traffic from custom boxes inside ISPs.
  Cloudflare runs 300+ PoPs, serving 20%+ of the web. CloudFront runs 400+ PoPs
  with Lambda@Edge for compute.

**Hands-On**
- Prerequisites: a Cloudflare free-tier account (or AWS free-tier CloudFront).
- Setup: cloud free-tier — point a free Cloudflare zone at a small static site,
  or set up a CloudFront distribution in front of an S3 bucket (both free-tier
  eligible).
- Simulate the scenario: request a static asset (an image) through the CDN
  twice in a row and check the response header (`cf-cache-status` on Cloudflare,
  `x-cache` on CloudFront) — first request should show a miss, second a hit.
  Then purge the cache and immediately request it again from 2 different
  locations (use a free tool like a VPN or an online multi-region curl service)
  roughly simultaneously.
- What to observe: the cache-status header flipping from MISS to HIT, and the
  measurable latency drop between the two requests — put a real number next to
  "avoid the round trip" instead of just asserting it. If your CDN plan exposes
  it, check the analytics dashboard for cache hit ratio and compare against the
  95%/96% anchor from 7.1's Metrics tab.
- Stretch goal: none — CDN behavior at true multi-PoP, shield-layer scale isn't
  reproducible on a free tier; this lesson's lab demonstrates the core
  cache-at-the-edge mechanism, not the full scaling ladder.

**Bridge out:** closes Module 7. Caching solves "avoid a repeated read"; the next
gap is services that need to tell each other something happened, which a cache
alone can't do.

---

## Module 8 — Messaging
`(08-messaging.html)` — caching (Module 7) solves "avoid a repeated read"; services that need to tell each other something happened need a different mechanism entirely.

### 8.1  Message Queues (RabbitMQ / SQS)  `(#message-queues)`
> Service A calls Service B directly to do some work. If B is slow, A waits. If B
> is down, A's request fails outright — that tight coupling makes every service's
> reliability everyone-who-calls-it's problem too.

**Overview**
- Messages wait in a queue until a consumer is ready — each message goes to
  exactly one consumer (competing consumers). A visibility timeout hides a message
  from other consumers while one is processing it, so it isn't picked up twice;
  the message is only truly removed once the worker ACKs completion — if the
  worker crashes before ACKing, the message becomes visible again after the
  timeout, and gets redelivered.
- At-least-once delivery means a message may be processed more than once —
  handlers must be idempotent (e.g. check a durable `email_send_log` keyed by
  `order_id` before sending, so a redelivered message doesn't double-send).
- RabbitMQ routes via exchanges: Direct (exact routing key), Fanout (broadcast to
  every bound queue), Topic (pattern match, e.g. `order.*.created`), Headers
  (route by header values). SQS offers Standard (at-least-once, best-effort
  order, unlimited throughput) vs FIFO (exactly-once, strict order, capped at
  ~3,000 msg/sec, using a `MessageGroupId` to scope the ordering).

**Failure Modes**
- If a job runs long enough that its visibility timeout expires mid-processing, a
  second worker can pick up the same message while the first is still working —
  fixed with a heartbeat that periodically renews the visibility timeout, plus
  idempotent handlers as the correctness backstop regardless.

**Hands-On**
- Prerequisites: Docker (RabbitMQ); Node.js or Python with `amqplib`/`pika`;
  or an AWS free-tier account for the SQS version.
- Setup: local/free — `docker run -d -p 5672:5672 -p 15672:15672
  rabbitmq:3-management` (the management UI at `:15672` is genuinely useful
  here); cloud free-tier — AWS SQS's free tier (1M requests/month).
- Simulate the scenario: publish 100 "send email" jobs to a queue, start 3
  worker processes each consuming and ACKing after a 1-second simulated task.
  Watch RabbitMQ's management UI show messages distributed across workers in
  real time (competing consumers). Then start a worker that intentionally never
  ACKs (crashes mid-task) and watch its message reappear in the queue after the
  visibility/ack timeout for another worker to pick up.
- What to observe: the exact redelivery behavior described in Failure Modes,
  visible as a message count blip in the management UI — and confirm your
  handler is idempotent by processing the same message twice on purpose and
  checking it doesn't double-send.
- Stretch goal: switch the exchange type from Direct to Topic
  (`order.*.created`) and publish to `order.eu.created` and `order.us.created`
  — confirm a consumer bound to `order.eu.*` only receives the EU message.

**Bridge out:** a queue delivers to exactly one consumer per message — the gap is
what happens when multiple independent systems all need to see the same event.

### 8.2  Apache Kafka  `(#kafka)`
> A queue delivers a message once and it's gone. But often multiple, completely
> independent systems (analytics, fraud detection, notifications) need to react to
> the same event — and if one of them was offline, it needs to replay history, not
> just get the next new message.

**Overview**
- Messages are continuously appended to a durable, ordered log. Core vocabulary,
  matched to a real-world idea: **Topic** (the logical stream — a label for "all
  ride events"), **Event/Record** (one thing that happened, e.g. `RIDE_REQUESTED`),
  **Partition** (one ordered physical log inside a topic — a topic has many
  partitions, but a partition belongs to exactly one topic), **Broker** (a Kafka
  server storing the logs), **Cluster** (many brokers together), **Consumer** (an
  app reading events), **Consumer Group** (a team of consumers sharing the work —
  each partition goes to exactly one consumer *within* a group, but every group
  reads the full topic independently), **Offset** (a consumer's bookmark — its
  position in a partition), **Replica** (a backup copy of a partition, tracked via
  ISR — in-sync replicas).
- Partitions exist for scale, parallelism, throughput, and ordering (order is
  guaranteed only *within* one partition, never across them) — which is exactly
  why a producer partitions by key: `hash(key) % number_of_partitions` sends every
  event for the same entity (e.g. the same `trip_id`) to the same partition,
  keeping that entity's own events in order while different entities process in
  parallel across other partitions.
- Delivery guarantees, named as a triad: At-most-once (`acks=0`, lossy), At-least-once
  (`acks=all`, may duplicate), Exactly-once (idempotent producer + transactions).
  Other named concepts: Compacted Topic (keeps only the latest value per key — used
  for state snapshots/changelogs), KRaft (Kafka's own built-in Raft, replacing its
  ZooKeeper dependency since Kafka 3.3+).

**Overview**
- 5 top use cases, each a distinct shape: Event Streaming (producers → Kafka →
  Spark Streaming), Log Aggregation (many services → Kafka → ELK stack), Message
  Queuing (decoupled async processing, with replay), Web Activity Tracking
  (clicks/views → real-time dashboards), CDC/Data Replication (Debezium → Kafka →
  multiple downstream databases, [SEE 12.1]).
- A single event's journey: producer → partitioner (hashes the key to pick a
  partition) → leader broker writes it → ISR replicas copy it → an ack is sent
  back → a consumer polls and commits its offset.

**Hands-On**
- Prerequisites: Docker Compose (Kafka + Zookeeper/KRaft images, or Confluent's
  all-in-one dev image); `kafka-console-producer`/`kafka-console-consumer`
  (ship with Kafka) or `kcat`.
- Setup: local/free — `docker run -d apache/kafka` (KRaft mode, no ZooKeeper
  needed) or Confluent's `cp-all-in-one` Compose file.
- Simulate the scenario: create a topic with 3 partitions
  (`kafka-topics.sh --create --topic rides --partitions 3`), produce 20 events
  keyed by `trip_id` (e.g. `trip-1`, `trip-2`, `trip-3` repeating), and start 2
  consumers in the same consumer group reading that topic. Check
  `kafka-consumer-groups.sh --describe` to see which partitions each consumer
  owns.
- What to observe: all events for the same `trip_id` landing in the same
  partition every time (`hash(key) % 3` is deterministic) — confirm with
  `kafka-console-consumer --partition 0` filtered views. Then start a 3rd
  consumer in the same group and watch a partition rebalance happen live
  (`--describe` before and after) — with only 3 partitions, the 3rd consumer
  gets one, and if you started a 4th, it would sit idle.
- Stretch goal: kill one consumer mid-stream without committing its last offset,
  restart it, and confirm it resumes from its last *committed* offset (possibly
  reprocessing a few messages) — at-least-once delivery, observed directly
  instead of described.

**Bridge out:** the durable log and consumer-group model here is the exact
substrate Event Sourcing (8.6) and CDC (12.1) both build on.

### 8.3  Pub/Sub (SNS / Google Pub/Sub)  `(#pubsub)`
> 8.1's queue and 8.2's Kafka both assume you're managing your own broker cluster
> — Pub/Sub is the managed, broadcast-shaped alternative.

**Overview**
- Publishers broadcast (fan-out) to a topic; every subscriber receives its own
  independent copy — conceptually [SEE 7.6] Redis Pub/Sub's shape, but durable and
  managed, not fire-and-forget.

**Hands-On**
- Prerequisites: AWS free-tier account (SNS + SQS are both in the free tier).
- Setup: cloud free-tier — an SNS topic with 2 SQS queues subscribed to it
  (the standard SNS-fan-out-to-SQS pattern).
- Simulate the scenario: publish one message to the SNS topic and confirm it
  independently arrives in *both* subscribed SQS queues, each with its own copy
  — then have one "consumer" (a script polling queue A) process and delete its
  copy while queue B's message sits untouched, proving the two subscriptions are
  fully independent.
- What to observe: unlike 8.1's queue (one message, one consumer wins it), both
  subscribers here get their own full copy — the broadcast/fan-out shape,
  confirmed by checking both queues' message counts after the publish.
- Stretch goal: add a subscription filter policy on one queue (e.g. only
  messages with attribute `region: eu`) and publish 2 messages, one matching
  and one not — confirm the filtered queue only receives the matching one.

**Bridge out:** 8.4 formally compares this against queues and streams — the
three-way comparison this module has been building toward.

### 8.4  Queues vs Streams vs Pub/Sub  `(#messaging-comparison)`
> 8.1, 8.2, and 8.3 each made their own case in isolation — put them side by side
> and the decision stops requiring memorized product names.

**Overview**
- The fundamental difference is the consumption model: queues are competing
  consumers (work distribution), streams are independent consumers (each group
  reads everything, replayable), Pub/Sub is broadcast (everyone gets a copy, no
  replay). Compared by name: SQS (FIFO optional, 14-day max retention, task
  distribution), Kafka (partition-ordered, configurable retention, event
  sourcing/streaming), RabbitMQ (exchange routing, per-queue FIFO, complex
  routing/priority/RPC), Redis Pub/Sub (fire & forget, zero persistence, typing
  indicators/cache invalidation), SNS + SQS (fan-out into per-subscriber queues,
  event notifications), NATS (Pub/Sub + JetStream, stream-ordered, IoT/lightweight
  microservice messaging). A common combined pattern: SNS → SQS → Lambda fans out
  via Pub/Sub, then queues each branch for reliable processing.

**Hands-On**
- Prerequisites: the 3 labs already built in 8.1 (RabbitMQ/SQS), 8.2 (Kafka),
  and 8.3 (SNS+SQS).
- Setup: none new — reuse the running labs.
- Simulate the scenario: send the same "OrderPlaced" event through all 3 setups
  and, for each, try to answer 2 questions: can a second, independent
  application add itself as a new consumer later and see this event? Can that
  new consumer replay history from before it existed? Test it: subscribe a
  brand-new SQS queue to 8.1's exchange after messages have already been sent
  (nothing arrives — no replay); read from an early offset on 8.2's Kafka topic
  after adding a new consumer group (full history available); add a subscriber
  to 8.3's SNS topic after a publish (also nothing — SNS doesn't replay either).
- What to observe: Kafka being the only one of the 3 where a late-joining
  consumer group can see everything that happened before it existed — the
  concrete, felt reason "replayable" is Kafka's specific differentiator in the
  Overview table, not just a label.
- Stretch goal: none — this lesson's value is the direct 3-way comparison.

**Bridge out:** the choice made here determines which failure-handling pattern
even applies — a DLQ is a queue/stream concept, not really a Pub/Sub one.

### 8.5  Dead Letter Queue (DLQ)  `(#dlq)`
> 8.1's queues and 8.2's Kafka both assume messages eventually get processed
> successfully — a DLQ is what happens the moment that assumption breaks.

**Overview**
- After N failed attempts (`maxReceiveCount`, typically 3-5 retries with
  exponential back-off — 1s→2s→4s→8s→16s), a message moves to a separate
  dead-letter queue instead of retrying indefinitely. Visibility timeout sizing
  rule of thumb: 6× the average processing time. A Redrive Policy configures
  which DLQ a queue feeds into; a Redrive Allow Policy (a distinct concept)
  controls which *source* queues are allowed to target a given DLQ.
- Mechanics differ per broker: SQS uses a redrive policy + a `StartMessageMoveTask`
  API to move messages back; RabbitMQ uses a dead-letter exchange (`x-dead-letter-exchange`,
  `x-dead-letter-routing-key`) plus its Shovel plugin for republishing; Kafka apps
  write failed events to a `topic.DLT` themselves (Spring Kafka's
  `@RetryableTopic`/`@DltHandler` annotations are the common implementation); Azure
  Service Bus has a built-in `$DeadLetterQueue` sub-queue governed by
  `MaxDeliveryCount`; GCP Pub/Sub uses a `deadLetterPolicy` field pointing at a
  dead-letter topic.

**Failure Modes**
- 3 categories, each needing a different fix: Poison Messages (malformed payload,
  schema mismatch, encoding errors, oversized message — retrying won't help).
  Transient Failures (downstream unavailable, DB timeout, throttling, network
  partition — a redrive after the outage clears often just works). Logic Errors
  (unhandled exception, business rule violation, referential integrity failure,
  idempotency key collision — needs a code fix and redeploy before redriving).
- The Recovery Playbook, as a named 7-step sequence: Alert → Inspect → Identify →
  Fix → Redrive → Verify → Post-mortem.

**Hands-On**
- Prerequisites: the SQS setup from 8.1 (or RabbitMQ with a dead-letter
  exchange).
- Setup: local/free — RabbitMQ with a queue configured with
  `x-dead-letter-exchange`; cloud free-tier — an SQS queue with a Redrive Policy
  pointing at a second SQS queue as its DLQ, `maxReceiveCount: 3`.
- Simulate the scenario: send a message with a deliberately malformed payload
  (invalid JSON, or missing a required field your handler expects) and have
  your consumer throw on every attempt without ACKing. Watch it get redelivered
  3 times, then land in the DLQ automatically.
- What to observe: the message count in the main queue dropping to 0 and the DLQ's
  count incrementing by exactly 1 at the moment `maxReceiveCount` is hit — the
  Poison Message category from Failure Modes, reproduced and automatically
  quarantined instead of retried forever.
- Stretch goal: fix the handler's bug, then use the redrive API
  (`StartMessageMoveTask` on AWS, or the Shovel plugin on RabbitMQ) to move the
  message back to the main queue and confirm it now processes successfully —
  the full Alert → Inspect → Identify → Fix → Redrive → Verify sequence, walked
  end to end.

**Bridge out:** always configure a DLQ and an alarm on its depth — an unmonitored
DLQ just loses messages more quietly.

### 8.6  Event Sourcing  `(#event-sourcing)`
> Kafka introduced a durable, replayable log as infrastructure — Event Sourcing is
> an application design pattern built on that same idea: store facts, not current
> state.

**Overview**
- A traditional database only stores current state — history is gone after an
  update. Persist immutable facts (events) as the source of truth; derive current
  state by replaying the log. Named vocabulary: **Event** (an immutable fact, named
  in the past tense — `OrderCreated`), **Stream** (the ordered sequence of events
  for one aggregate instance — `order-{orderId}`), **Aggregate** (the consistency
  boundary — validates commands, emits events), **Projection** (a read model built
  by replaying events), **Snapshot** (a materialized state at a point in time, so
  you don't replay from event 0 every time), **Idempotency** (processing the same
  event twice must produce the same result).
- Event Store Technologies: EventStoreDB, Kafka (as an event store — note that
  compaction is not the same thing as snapshotting), PostgreSQL (using `NOTIFY`
  for subscriptions), DynamoDB (with a 25-item transaction limit to be aware of),
  Marten (a .NET-specific library).
- Schema Evolution: upcasting old event shapes forward, versioning, or a
  deliberately weak/flexible schema. Handling side effects: process managers/sagas,
  the Outbox Pattern, idempotent handlers, and compensating events — so a replay
  never double-sends an email or double-charges a card.

**Failure Modes**
- Common Pitfalls: GDPR's "right to erasure" directly conflicts with "events are
  immutable forever" (mitigated with crypto-shredding — delete the encryption key,
  not the event); very large aggregates become slow to replay; choosing event
  granularity is a real design decision; projection lag (the read model briefly
  behind the write log) can confuse users expecting instant consistency.

**Real-World**
- LMAX Exchange runs an event-sourced trading engine at 6M orders/sec. Git's
  commit history is the same idea — commits are events, the working tree is a
  projection.

**Hands-On**
- Prerequisites: Node.js or Python; Docker (Postgres, as a simple event store).
- Setup: local/free — `docker run -d -p 5432:5432 postgres`.
- Simulate the scenario: create an `events` table (`aggregateId, eventType,
  payload, version, timestamp`) instead of a normal `accounts` table. Model a
  bank account with only events: `AccountOpened`, `MoneyDeposited`,
  `MoneyWithdrawn`. Write a function that replays all events for one
  `aggregateId` in order and computes the current balance by folding over them.
  Insert 20 events for one account, then call your replay function.
- What to observe: the computed balance matching what you'd expect from manually
  summing deposits minus withdrawals — current state genuinely derived, not
  stored. Then add a `SnapshotTaken` event every 10 events and confirm replay
  from the most recent snapshot plus only the events after it produces the same
  answer, much faster than replaying from zero.
- Stretch goal: try to "delete" one account for a GDPR-style erasure request
  without deleting its event history — implement crypto-shredding by encrypting
  each account's events with a per-account key, then simply discarding that key
  to make the events permanently unreadable while the log itself stays intact.

**Bridge out:** event sourcing makes writes cheap (just append) but reads
expensive (replay to get current state) — CQRS is the direct fix, which is why the
two patterns are almost always taught together.

### 8.7  CQRS  `(#cqrs)`
> The same data model is being asked to serve two very different jobs — fast,
> validated writes and fast, flexibly-shaped reads — and optimizing for one often
> hurts the other.

**Overview**
- Separate the write model (commands) from the read model (queries) entirely.
  Write store examples: PostgreSQL, EventStore. Read store examples: Redis,
  Elasticsearch, DynamoDB, materialized views — each optimized for its own query
  shape. Keeping them in sync: pull-based (the read side polls for changes),
  push-based (the write side publishes an event), hybrid, or inline projection
  (updated synchronously as part of the write).
- When to use it — Good Fit: a skewed read/write ratio, queries needing very
  different shapes than the write model, complex write-side business rules,
  multiple independent read representations, already using event sourcing,
  splitting a monolith. Bad Fit: simple CRUD, strong consistency required on every
  read, a small team, low traffic, a simple domain.

**Failure Modes**
- Anti-patterns: querying the write model directly (defeats the purpose),
  bidirectional sync between the two models, sharing one database for both sides.

**Hands-On**
- Prerequisites: the Event Sourcing lab from 8.6; Docker (add Elasticsearch or
  Redis as the read side).
- Setup: local/free — Postgres (write side, from 8.6) + Redis or Elasticsearch
  (read side).
- Simulate the scenario: keep writing `AccountOpened`/`MoneyDeposited` events to
  Postgres as commands come in, and after each write, publish a small "projector"
  update that recomputes and stores the current balance in Redis
  (`SET balance:acc1 <value>`). Build a read endpoint that reads only from Redis,
  never Postgres.
- What to observe: the read path staying fast and simple (`GET balance:acc1`, no
  replay logic) while all the write-side complexity (validation, event
  emission) stays isolated in the command path — the actual separation of
  concerns from Overview, not just a diagram of it. Then introduce a deliberate
  delay in the projector and watch a read immediately after a write briefly
  return a stale value — the eventually-consistent read model, caught live.
- Stretch goal: add a second, differently-shaped read model (e.g. a
  "transaction history" list in Elasticsearch) fed by the exact same event
  stream, and confirm both read models stay independently correct from one
  shared source of truth.

**Bridge out:** none forward directly, but "the read model is eventually
consistent with the write model" is a direct instance of the replication-lag
problem Consistency (Module 9) explores in full.

### 8.8  Ordering Guarantees  `(#ordering)`
> Kafka guarantees order only within a partition — where that guarantee holds, and
> where it silently doesn't, is worth being explicit about.

**Overview**
- Partition key design determines what stays ordered together — `userId`,
  `orderId`, `accountId` as keys keep all of that entity's events in one
  partition, in order; a poorly chosen key creates hot partitions or destroys
  ordering entirely.
- Per-broker ordering mechanics, by name: Kafka (`murmur2(key) % numPartitions`),
  Kinesis (`MD5(partitionKey)` → shard, capped at 1MB/sec or 1,000 records/sec per
  shard), Azure Event Hubs (consistent hash per partition), SQS FIFO
  (`MessageGroupId` scopes strict ordering), Google Pub/Sub (an explicit
  `orderingKey`).
- Cross-Partition Ordering, when a single key genuinely isn't enough: sequence
  numbers embedded in the payload, vector clocks, Lamport timestamps, or an
  external sequencer (Redis `INCR` or a DB sequence, at the cost of a bottleneck).

**Failure Modes**
- Rebalancing risk: when partitions are added or removed, key-to-partition
  mapping changes — sticky partitioning or consistent hashing minimizes the
  disruption, since a naive rebalance can otherwise cause temporary out-of-order
  delivery.

**Hands-On**
- Prerequisites: the Kafka lab from 8.2.
- Setup: local/free — same Kafka container.
- Simulate the scenario: produce 30 events for `trip_id=trip-1` in quick
  succession, each with an incrementing sequence number in the payload
  (`{seq: 1}`, `{seq: 2}`, ...). Consume them and print the order they arrive
  in. Then produce another 30 events for `trip_id=trip-1` but this time key half
  of them with `trip-1` and half with a random key, and check whether the
  `trip-1`-keyed ones still arrive in order relative to each other once mixed
  with the others.
- What to observe: the pure `trip-1`-keyed sequence arriving in exact order
  every time (same partition, guaranteed order), while events split across
  multiple partitions have no guaranteed relative order between partitions —
  the "only within a partition" claim, demonstrated with your own sequence
  numbers instead of trusted on faith.
- Stretch goal: increase the topic's partition count while consumers are
  running and watch a rebalance occur (`kafka-consumer-groups.sh --describe`) —
  then check whether any of your `trip-1` events briefly appear out of order
  around the rebalance, and whether sticky partitioning assignment reduces how
  much shuffling happens.

**Bridge out:** every messaging lesson so far assumes producer and consumer agree
on the message shape — enforcing that agreement as both evolve is the last gap in
this module.

### 8.9  Schema Registry  `(#schema-registry)`
> A producer team changes an event's shape without telling the consumer team —
> "it broke prod" the moment that new shape reaches a consumer built for the old
> one.

**Overview**
- A central, versioned contract for event payloads. Compatibility modes: Backward
  (new consumer reads old data — safe for adding optional fields), Forward (old
  consumer reads new data — safe for removing fields), Full (both), Transitive
  (compatible with every prior version, not just the immediately previous one),
  None (no enforcement — the default that leads to "it broke prod"). Subject
  naming strategies: TopicName, RecordName, TopicRecordName.

**Hands-On**
- Prerequisites: Docker (Confluent's Schema Registry image); the Kafka lab from
  8.2; `avro-tools` or a language's Avro library.
- Setup: local/free — Confluent's `cp-schema-registry` image pointed at your
  Kafka broker.
- Simulate the scenario: register an Avro schema for your `rides` topic
  (`{trip_id: string, status: string}`), set compatibility mode to Backward,
  and produce a few events. Then try registering a new schema version that adds
  an optional field with a default (should succeed under Backward compatibility)
  versus one that removes a required field (should be rejected).
- What to observe: the Schema Registry actively refusing the breaking schema
  change at registration time — "it broke prod" prevented before a single
  event with the bad shape is ever produced, not caught after the fact by a
  confused consumer.
- Stretch goal: switch the compatibility mode to None, register the same
  breaking change (now allowed), produce an event with the new shape, and
  watch an old consumer expecting the removed field fail when it tries to read
  it — the exact failure this lesson exists to prevent, reproduced on purpose.

**Bridge out:** closes Module 8. Enforce this in CI, not in production — the
moment you have more than one copy of anything (a queue offset, a cache, a
replica), the CAP theorem's bill comes due, which is exactly where Consistency
picks up.

---

## Module 9 — Consistency
`(09-consistency.html)` — the moment you have more than one copy of the truth (a cache, a replica, a queue's read model), physics gets involved.

### 9.1  CAP Theorem & PACELC  `(#cap)`
> Caching (7.x) and Messaging (8.x) both quietly created second copies of data (a
> cached value, a read-model projection) — this lesson names the theoretical
> ceiling on how "correct" those copies can simultaneously be.

**Overview**
- CAP theorem: during a network partition, a distributed system can guarantee
  only 2 of 3 — Consistency, Availability, Partition Tolerance. Since partitions
  are a fact of networked life, the real choice is C vs A when one happens. PACELC
  extends this: even with *no* partition, you still trade Latency vs Consistency
  (ELC) on every single request.
- 3 system approaches, with real examples: CA (Postgres, MySQL — a single-node
  design that can't gracefully survive a real partition), AP (Cassandra, DynamoDB,
  CouchDB — always available, may serve stale data during a partition), CP
  (ZooKeeper, etcd, Spanner, HBase — refuses to answer rather than risk an
  inconsistent one).

**Hands-On**
- Prerequisites: Docker Compose; a 3-node Cassandra or a 3-node etcd cluster
  (both have official images).
- Setup: local/free — a 3-node cluster via Docker Compose, plus a way to
  simulate a network partition between nodes (`docker network disconnect`, or
  `iptables`/`tc` inside the containers).
- Simulate the scenario: with a 3-node etcd cluster running, disconnect one
  node from the other two (`docker network disconnect`) and try writing to the
  isolated minority node — it should refuse (CP: unavailable rather than
  inconsistent). Then repeat with a 3-node Cassandra cluster using `QUORUM`
  consistency, disconnect one node, and write to the majority side — it
  succeeds (AP: available, and consistent as long as quorum is met); write
  directly to the isolated node with consistency `ONE` and it may still accept
  the write, now diverging from the majority.
- What to observe: etcd's minority partition actively rejecting requests versus
  Cassandra's minority partition (at weak consistency) happily accepting
  writes that will conflict later — the CP vs AP choice, observed as two
  different real error/success behaviors under the identical fault you
  injected.
- Stretch goal: reconnect the partitioned Cassandra node and watch its
  divergent write get reconciled via read repair/anti-entropy — a preview of
  9.7's conflict resolution.

**Bridge out:** "pick 2 of 3" is an abstract law — the next lesson makes it
concrete by naming the actual spectrum of consistency levels you can choose along
that trade-off.

### 9.2  Consistency Models  `(#consistency-models)`
> Most real systems live somewhere in the middle of "strong" and "eventual," not
> at either extreme.

**Overview**
- A spectrum from strongest to weakest: Linearizable (every read sees the single
  most recent write — etcd, ZooKeeper, Spanner), Sequential (all operations appear
  in *some* consistent order, not necessarily real-time — Kafka partitions, ZAB),
  Causal (causally related events stay ordered, unrelated ones don't have to —
  MongoDB causal sessions), Read-Your-Writes (you always see your own writes —
  DynamoDB consistent reads), Monotonic Reads (never see an older value after a
  newer one — session affinity), Eventual (replicas converge, eventually —
  Cassandra, DNS, S3, and Redis Active-Active is a real CRDT-backed example of it).
- Tunable consistency via quorums: `W + R > N` guarantees consistency. Strong
  techniques: quorum reads/writes, synchronous replication, consensus,
  serializable isolation. Eventual techniques: async replication, anti-entropy —
  specifically Merkle trees (a hash tree letting two large datasets be compared
  for differences in O(log N) instead of a full scan) — plus read repair and
  hinted handoff.
- CRDTs — data structures (counters, sets, sequences) designed so concurrent
  updates always merge automatically, no coordination needed.

**Hands-On**
- Prerequisites: the 3-node Cassandra cluster from 9.1.
- Setup: local/free — same cluster.
- Simulate the scenario: write a key with `CONSISTENCY ONE` (fast, weak), read
  it back immediately from a *different* node also at `ONE` — occasionally
  you'll see the old value (the write hasn't propagated yet). Repeat the same
  write/read pair with `CONSISTENCY QUORUM` on both sides.
- What to observe: the `ONE`/`ONE` combination occasionally returning stale
  data (satisfying the `W + R > N` inequality fails: 1 + 1 = 2, not > 3),
  while `QUORUM`/`QUORUM` (2 + 2 = 4 > 3) never does — the tunable-consistency
  formula from Overview, verified by deliberately breaking it and watching it
  fail, then fixing it and watching it stop failing.
- Stretch goal: run `nodetool repair` after intentionally creating a
  divergence (write at `ONE` while one node is disconnected, then reconnect)
  and confirm all replicas converge to the same value afterward — anti-entropy,
  observed instead of described.

**Bridge out:** "consensus" was just named as one strong-consistency mechanism
without explaining it — that's the next lesson.

### 9.3  Consensus Algorithms  `(#consensus)`
> Multiple nodes must agree on a single value despite some of them potentially
> crashing or being slow — proving that agreement is even *possible* under those
> conditions is a genuinely hard theoretical problem.

**Overview**
- Raft (leader-based, designed explicitly for understandability) vs Paxos (the
  original, theoretically foundational, notoriously hard to implement correctly).
  A quorum-based protocol survives `f` failures with `2f+1` nodes total.
- Raft vs Paxos: Raft requires a strong leader and a contiguous log; Paxos has no
  inherent leader (Multi-Paxos adds one) and tolerates gaps. Other named protocols:
  ZAB (ZooKeeper's own), Multi-Paxos (used by Google Chubby, Spanner, and
  Megastore), EPaxos (leaderless, dependency-graph ordering), PBFT (Byzantine
  fault tolerant — assumes nodes can be actively malicious, used in blockchain),
  Viewstamped Replication (academic, directly influenced Raft).

**Hands-On**
- Prerequisites: Docker Compose; a 5-node etcd cluster (official image, easy to
  Compose).
- Setup: local/free — 5-node etcd cluster via Docker Compose.
- Simulate the scenario: write a key via `etcdctl put`, then check
  `etcdctl endpoint status` on all 5 nodes to identify the current leader. Kill
  the leader's container and immediately try another write against a follower's
  endpoint.
- What to observe: a brief unavailability window (the write fails or hangs)
  followed by a new leader being elected and writes succeeding again — check
  `etcdctl endpoint status` again to confirm a different node is now leader,
  and note roughly how long the election took.
- Stretch goal: kill 3 of the 5 nodes simultaneously (more than a minority) and
  confirm the remaining 2 can no longer elect a leader or accept writes at all
  — the `f` failures with `2f+1` nodes formula from Overview (5 nodes tolerates
  2 failures, not 3), hit exactly at its documented limit.

**Bridge out:** this is the theory; Distributed Systems' Leader Election (11.7)
and Consensus Protocols (11.8) lessons walk the exact same algorithms step-by-step
with the full RPC-level mechanics.

### 9.4  Distributed Transactions  `(#transactions)`
> [SEE 6.4] ACID on one database is solved. Writing atomically across *multiple*
> databases or services — an order service and a payment service — has no single
> engine enforcing it for you.

**Overview**
- ACID, distributed: 2PC (Two-Phase Commit — a coordinator asks every participant
  to "prepare," then tells them all to "commit" only if everyone agreed; blocking,
  and a coordinator crash mid-commit is a real operational headache), Saga
  (Choreography — no coordinator, a chain of local transactions with compensating
  actions on failure), Outbox Pattern (write the state change and the event to be
  published in the same local transaction, then reliably publish it separately —
  avoids the dual-write problem [SEE 12.1]), TCC (Try-Confirm-Cancel — reserve
  resources first, then confirm or cancel, common in fintech).

**Trade-offs**
- 2PC gives strong atomicity but blocks and doesn't scale well across many
  participants or high latency; Saga scales and doesn't block, but trades
  atomicity for eventual consistency plus real complexity in writing correct
  compensating actions.

**Hands-On**
- Prerequisites: Node.js/Python; the Kafka lab from 8.2 or a simple queue.
- Setup: local/free — 2 small services ("Order Service", "Payment Service"),
  each with its own SQLite/Postgres instance, plus a message queue between them.
- Simulate the scenario: implement the Outbox Pattern in Order Service — in one
  local transaction, insert the order row AND an `OrderCreated` event row into
  an `outbox` table. A separate poller reads unpublished outbox rows and
  publishes them to the queue, then marks them published. Payment Service
  consumes `OrderCreated` and either charges successfully or publishes
  `PaymentFailed`, which Order Service listens for and applies a compensating
  action (cancel the order).
- What to observe: killing the poller right after the DB transaction commits
  but before it publishes — the event is safely sitting in the outbox table,
  unpublished, and gets picked up once the poller restarts, with zero events
  lost. Contrast this with a naive "write to DB, then publish" without an
  outbox — kill the process between those two steps and the event is gone
  forever, the exact dual-write problem the Outbox Pattern exists to close.
- Stretch goal: force `PaymentFailed` and confirm Order Service's compensating
  action actually cancels the order — the Saga's compensation step, executed,
  not just described.

**Bridge out:** 2PC (used internally by Spanner, standardized as XA transactions)
mostly lost to Saga at the application level — but before comparing transaction
patterns, the more basic question of two transactions touching the same row is
worth its own lesson.

### 9.5  Concurrency Control  `(#concurrency)`
> Two transactions read the same row, both compute an update, both write back —
> one silently overwrites the other, and neither ever sees an error.

**Overview**
- Pessimistic Locking (`SELECT ... FOR UPDATE` — lock first, then read; right for
  high-contention paths like flash sales) vs Optimistic Locking (check a version
  number on write; only fails if something actually changed; right for
  low-contention paths like profile edits).
- Isolation levels, weakest to strongest: Read Uncommitted → Read Committed
  (Postgres' default) → Repeatable Read (MySQL's default) → Serializable
  (strongest, slowest). MVCC lets readers see a consistent snapshot without
  blocking writers at all.

**Hands-On**
- Prerequisites: Docker (Postgres); 2 `psql` sessions.
- Setup: local/free — `docker run -d -p 5432:5432 postgres`.
- Simulate the scenario: create an `accounts` table with a `balance` and a
  `version` column. Reproduce the lost-update bug first: in session A, `SELECT
  balance FROM accounts WHERE id=1` (reads 100), pause; in session B, do the
  same read, then `UPDATE accounts SET balance=90 WHERE id=1` and commit; back
  in session A, compute `balance - 10` using its stale read and `UPDATE
  accounts SET balance=90 WHERE id=1` — B's update is silently gone. Now fix it
  with optimistic locking: `UPDATE accounts SET balance=90, version=version+1
  WHERE id=1 AND version=<the version you read>` — session A's second update
  now affects 0 rows because the version moved, and your app code can detect
  that and retry.
- What to observe: the silent, undetected lost update in the first run versus
  the 0-rows-affected signal in the second — turning an invisible bug into a
  detectable, retryable one.
- Stretch goal: repeat using `SELECT ... FOR UPDATE` (pessimistic) instead —
  session B's read blocks until session A's transaction commits or rolls back,
  preventing the interleaving entirely rather than detecting it after the fact.

**Bridge out:** Saga was introduced in 9.4 as one distributed-transaction option
— it deserves its own full lesson.

### 9.6  Saga Pattern  `(#saga-orchestration)`
> None forward directly.

**Overview**
- Orchestration — a central coordinator explicitly calls each step and issues
  compensating actions on failure (easier to reason about, new central dependency)
  — vs Choreography — pure event-driven, each service reacts to the previous
  step's event, no central coordinator (no single point of failure, harder to see
  the overall flow in one place).
- Implementation tools: Temporal, AWS Step Functions, Cadence, Axon Framework,
  MassTransit, Eventuate Tram.

**Failure Modes**
- Compensation design rules: compensating actions must be semantically meaningful
  (a true undo), idempotent, ideally commutative. Common pitfalls: no isolation
  between concurrent sagas touching the same data, lost compensations, cyclic
  dependencies between steps, too many steps, no timeout on any individual step.

**Hands-On**
- Prerequisites: Node.js; the free tier of Temporal Cloud, or a local Temporal
  dev server (`temporal server start-dev`, free, one command).
- Setup: local/free — `temporal server start-dev`.
- Simulate the scenario: build a 3-step saga as a Temporal Workflow: Reserve
  Inventory → Charge Payment → Ship Order, each a separate Activity, with a
  compensating Activity for each (Release Inventory, Refund Payment, Cancel
  Shipment). Force the "Charge Payment" step to fail, and watch Temporal's own
  Web UI show the workflow's execution history, including which compensations
  ran.
- What to observe: Temporal automatically tracking exactly which steps
  completed before the failure and running only the compensations needed for
  those steps (Release Inventory only, since Charge Payment never succeeded and
  Ship Order never started) — orchestration's central visibility, seen directly
  in the UI instead of assumed.
- Stretch goal: kill the Temporal worker process mid-workflow and restart it —
  confirm the workflow resumes exactly where it left off, since Temporal
  persists workflow state independent of any single worker process being alive.

**Bridge out:** 9.2's AP systems accept that two replicas can end up with
different values for the same key — reconciling them is the next lesson.

### 9.7  Conflict Resolution  `(#conflict-resolution)`
> Two nodes each accept a write to the same key while disconnected. When they
> reconnect, both values exist — something has to decide what the "real" value is,
> and there's no universally correct answer.

**Overview**
- 6 strategies: Last-Writer-Wins (highest timestamp wins, silently discards the
  losing write — Cassandra's default), Vector Clocks (detects true conflicts,
  surfaces both versions — Riak), Version Vectors (a simplified, per-replica
  variant), CRDTs (mathematically guaranteed to auto-merge — Figma, Apple Notes,
  Redis Active-Active), Operational Transform (transforms concurrent operations to
  preserve intent — Google Docs), Application-level merge (custom domain logic —
  union two shopping carts instead of picking one).
- CRDT types: Counters (G-Counter increment-only, PN-Counter increment-and-decrement),
  Sets (G-Set add-only, OR-Set add-and-remove), Sequences/Text (RGA, LSEQ — for
  collaborative text where insertion order matters).

**Hands-On**
- Prerequisites: JavaScript; a free CRDT library (`yjs` or `automerge`, both
  free/open-source).
- Setup: local/free only.
- Simulate the scenario: create 2 independent `Y.Doc` instances (Yjs) with no
  network connection between them, each representing one "offline" client.
  Have client A add 3 items to a shared array and client B add 2 different
  items to its own copy of the same array, entirely offline. Then merge the two
  documents' updates together (`Y.applyUpdate`).
- What to observe: all 5 items present in the merged result with no manual
  conflict-resolution code written — the CRDT's mathematical merge guarantee,
  observed directly, contrasted with what a naive Last-Writer-Wins merge would
  have done (silently kept only one client's list).
- Stretch goal: have both clients edit the *same* text position concurrently
  (Yjs's `Y.Text` type) while offline, merge, and confirm both edits survive in
  a sensible order — the collaborative-text case Google Docs' Operational
  Transform and CRDTs both solve, felt directly instead of taken on faith.

**Bridge out:** LWW depends entirely on comparing timestamps across different
machines — why that's harder than it sounds is the last lesson in this module.

### 9.8  Clock Sync & Time  `(#clock-sync)`
> "Now" isn't the same instant on two different machines — clocks drift, networks
> add unpredictable delay, and NTP is only accurate to roughly 1-10ms on a LAN,
> nowhere near precise enough to safely order fast-moving events by timestamp
> alone.

**Overview**
- Physical Clocks: NTP (bounded accuracy, can jump backward on resync — chrony is
  Amazon's own NTP implementation, and Cloudflare's Roughtime protocol is a
  security-hardened alternative); Google TrueTime (GPS + atomic clocks, returns a
  bounded interval, and Spanner's commit-wait protocol waits out that interval to
  achieve external consistency).
- Logical Clocks: Lamport Timestamps (a counter giving total order, can't
  distinguish true causality from coincidence) vs Vector Clocks (detects true
  causality, size grows with node count). Hybrid Logical Clocks (HLC — physical
  time plus a logical counter, wall-clock proximity and causality tracking —
  CockroachDB).

**Failure Modes**
- Never assume two machines' clocks agree; a monotonic clock (for elapsed
  duration) and wall-clock time (for human display) are different tools — using
  wall-clock time to measure an interval can go backward on an NTP correction.

**Hands-On**
- Prerequisites: 2 machines or 2 Docker containers on different hosts (a VM and
  your laptop work fine); `ntpdate`/`chronyc` for inspection.
- Setup: local/free — 2 Docker containers with independent clocks (or, more
  realistically, 2 free-tier cloud VMs in different regions).
- Simulate the scenario: on both machines, log `Date.now()` (wall-clock,
  milliseconds) every second for a minute alongside `process.hrtime()` (a
  monotonic clock) measuring elapsed time for the same interval. Manually adjust
  one machine's system clock backward by a few seconds mid-run (`date -s
  "-5 seconds"`, needs privileges, reversible) while both loggers are running.
- What to observe: the wall-clock log showing a jump backward at the moment you
  adjusted it, while the monotonic-clock-based elapsed-time measurement never
  moves backward — the exact distinction from Failure Modes, forced to happen
  instead of described abstractly.
- Stretch goal: write two events with wall-clock timestamps from your two
  machines that are only 2ms apart, and try to determine which "really"
  happened first — then recognize you can't be confident, because typical LAN
  NTP accuracy (1-10ms) is larger than the gap you're trying to measure.

**Bridge out:** closes Module 9. Knowing the theory of trade-offs doesn't yet give
you the concrete playbook for outgrowing one machine — that playbook is next.

---

## Module 10 — Scalability
`(10-scalability.html)` — Consistency (Module 9) gave you the theory of trade-offs; this module is the concrete, reusable playbook for actually outgrowing one machine.

### 10.1 Partitioning  `(#partitioning)`
> [SEE 6.2] Indexing ended with "index → clustered index → partitioning" once one
> machine's indexing isn't enough — this lesson is that next step.

**Overview**
- Split data across multiple machines so each holds only a fraction of the whole.
  Horizontal partitioning (split by rows) vs Vertical partitioning (split by
  columns). 3 horizontal strategies: Range (contiguous key ranges, easy range
  queries, hotspot risk on sequential keys), Hash (even distribution via
  `hash(key) % N`, no hotspots, but range queries require scatter-gather), List
  (explicit, manually assigned groupings — e.g. by country).

**Failure Modes**
- The hotspot/celebrity problem: a single viral key can overload one partition
  regardless of scheme, needing additional mitigation beyond the partitioning
  strategy itself.

**Hands-On**
- Prerequisites: Docker (Citus, Postgres's sharding extension, has a free
  Docker image).
- Setup: local/free — Citus's official Docker Compose (1 coordinator + 2
  worker nodes).
- Simulate the scenario: create a distributed table partitioned by
  `hash(customer_id)` across the 2 workers (`create_distributed_table`), insert
  10,000 rows spread across 100 different `customer_id`s, then run
  `EXPLAIN ANALYZE` on a query filtered by one specific `customer_id` versus an
  unfiltered aggregate query.
- What to observe: the filtered query touching only 1 worker (visible in the
  `EXPLAIN` plan as a single-shard query), while the unfiltered aggregate has
  to scatter-gather across both workers and combine results — the Hash
  strategy's exact trade-off from Overview, seen in an actual query plan.
- Stretch goal: create a second table Range-partitioned by an `order_date`
  column instead, insert data across a date range, and compare how a
  date-range query behaves (touches only the relevant partitions) versus how
  a query on a *different* column (e.g. `customer_id`) now has to scan every
  partition — a felt trade-off between the two schemes on data you control.

**Bridge out:** once data is split, finding a row without scanning every partition
is the next question.

### 10.2 Distributed Indexing  `(#distributed-indexing)`
> A query on a non-partition-key column would otherwise require checking every
> single partition.

**Overview**
- Local Index (each partition indexes only its own data — fast writes, scatter-
  gather reads — Citus's default) vs Global Index (the index itself is
  partitioned by the indexed value — fast single-partition reads, async
  multi-partition writes — Elasticsearch's per-shard Lucene index is a concrete
  instance of this).

**Hands-On**
- Prerequisites: the Citus cluster from 10.1; or Elasticsearch from 6.8.
- Setup: local/free — reuse either lab.
- Simulate the scenario: on the Citus cluster, query the distributed table by a
  non-partition column (something other than `customer_id`) and check
  `EXPLAIN` — every worker gets hit (a Local Index, scattered). On the
  Elasticsearch cluster from 6.8 (add a second node if you can,
  `docker-compose` with 2+ Elasticsearch containers and matching cluster name),
  index documents across 2+ shards and search by a field — Elasticsearch's
  coordinating node fans the query out and merges results, functionally a
  Local Index pattern too, just abstracted away from you.
- What to observe: both systems doing the same underlying scatter-gather work
  for a non-partition-key query — the "local index" cost is real regardless of
  which product hides it more smoothly.
- Stretch goal: none — this lesson's value is recognizing the same underlying
  cost across 2 different products you've already built labs for.

**Bridge out:** none forward directly, but "local vs global index" reappears
nearly verbatim, with more theoretical rigor, in Distributed Systems (11.11).

### 10.3 Replication  `(#replication)`
> Splitting data (10.1-10.2) solves capacity — replication copies data for a
> different reason: surviving the loss of any one machine.

**Overview**
- Sync (wait for all/majority replicas — strongest durability, highest latency)
  vs Async (acknowledge after the local write — lowest latency, a leader crash can
  lose unreplicated writes) vs Semi-Sync (wait for just 1 replica — a middle
  ground).
- Single-Leader (one leader takes writes, followers replicate — simple, no
  conflicts, but a write bottleneck and brief failover downtime), Multi-Leader
  (multiple leaders accept writes, replicate to each other via circular, star, or
  all-to-all mesh topologies — lower per-region write latency, but conflicts are
  now possible; real systems: Postgres BDR, MySQL Group Replication, CouchDB
  multi-master; conflict-avoidance strategies beyond resolution itself: sticky
  routing, partition by region, append-only schema design), Leaderless (any
  replica accepts a write, reconciled via quorum — no SPOF, tunable consistency
  per operation, the most operationally complex model).

**Hands-On**
- Prerequisites: Docker (Postgres with streaming replication, or a
  ready-made Compose file for it).
- Setup: local/free — 1 Postgres primary + 1 streaming replica via Docker
  Compose (several ready Compose configs exist for this exact setup).
- Simulate the scenario: write a row on the primary and immediately try to
  read it from the replica in a tight loop, measuring the delay until it
  appears (replication lag, even locally, is rarely exactly 0). Then stop the
  primary container and manually promote the replica
  (`pg_ctl promote` or the container's promote command) and confirm it now
  accepts writes.
- What to observe: a real, measured (if small) replication lag window where the
  replica briefly disagrees with the primary — the async-replication trade-off
  from Overview, quantified instead of asserted. Then time how long the
  promotion takes — that's your real failover downtime for a single-leader
  setup.
- Stretch goal: configure synchronous replication
  (`synchronous_commit=on`, `synchronous_standby_names`) and repeat the same
  write — confirm the write now blocks until the replica acknowledges,
  trading latency for the stronger durability guarantee named in Overview.

**Bridge out:** single-leader, strong-consistency need → sync. Multi-region, low-
latency writes → multi-leader (accept the conflict cost). High availability,
tunable consistency → leaderless quorum. The next lesson is a related but
distinct move — splitting the database itself, not just copying it.

### 10.4 Sharding  `(#sharding)`
> Partitioning (10.1) explained the *how* abstractly — sharding is that idea
> applied to splitting an entire database across machines.

**Overview**
- 4 strategies: Range-Based (contiguous ranges, range-query-friendly, hotspot
  risk), Hash-Based (even, no range queries), Directory-Based (a separate lookup
  service maps key → shard — most flexible, but the directory itself becomes a
  dependency), Geo-Based (shard by user location — minimizes latency, fits
  data-residency requirements).

**Real-World**
- Instagram shards Postgres by `user_id` hash. Vitess (originally YouTube's MySQL
  sharding middleware) and Citus (distributed Postgres) are the two most common
  off-the-shelf sharding layers.

**Hands-On**
- Prerequisites: Python or Node.js only — this is a pure algorithm exercise.
- Setup: none.
- Simulate the scenario: implement `shard = hash(user_id) % 4` for 10,000
  synthetic user IDs and count how many land in each of the 4 shards (should be
  roughly even — confirm it). Then change `% 4` to `% 5` (simulating adding one
  shard) and recompute — count how many of the original 10,000 users now map to
  a *different* shard than before.
- What to observe: the overwhelming majority of users remapping to a different
  shard from a single shard-count change — this is the exact problem 10.5
  exists to solve, felt as a real percentage on your own data before you ever
  see the fix.
- Stretch goal: implement Directory-Based sharding instead — a simple `{userId:
  shardId}` lookup table — and confirm that adding a 5th shard now only
  requires moving whichever specific users you choose to move, with zero
  forced remapping for anyone else.

**Bridge out:** with hash-based sharding using `hash(key) % N`, the next lesson is
exactly why that formula breaks the moment N changes.

### 10.5 Consistent Hashing  `(#consistent-hashing)`
> Adding or removing even one server with plain `hash(key) % N` remaps almost
> every key to a different server — a massive, unnecessary cache-cold or
> data-migration event triggered by a single node change.

**Overview**
- Arrange servers and keys on a conceptual ring by hash value; each key belongs
  to the next server clockwise. Walked step by step: the modulo-hashing problem
  (3 servers vs 4, illustrated) → the ring idea → what happens on add/remove (only
  adjacent keys move) → why virtual nodes exist (a single physical server maps to
  many ring points, smoothing out uneven load) → how the ring is actually built —
  a sorted structure (array or skip list) with binary search for key lookup →
  where it's used (caching, distributed KV stores, rate limiting, CDN/LB routing,
  message brokers).
- Bounded Load (Google, 2017): even with virtual nodes, one very hot key can
  overload its assigned node — bounded load caps any node at `(1+ε) × average
  load` and spills overflow to the next node on the ring.

**Hands-On**
- Prerequisites: Python or Node.js only.
- Setup: none — implement the ring yourself, this is the point of the lab.
- Simulate the scenario: implement a basic consistent-hash ring with 4 servers,
  100 virtual nodes each, and 10,000 synthetic keys. Add a 5th server (with its
  own 100 virtual nodes) and recompute which server each key maps to.
- What to observe: this time, only roughly 1/5 of keys move to the new server
  (only the keys that fall between the new server's ring positions and the
  next one clockwise) — a small fraction, versus 10.4's plain-modulo lab where
  almost everything moved. Print the exact percentage that moved and compare
  it directly against your 10.4 result.
- Stretch goal: remove virtual nodes (1 ring position per server instead of
  100) and rerun the same add-a-server test — measure load distribution
  variance across servers with and without virtual nodes, to feel why they
  exist (smoothing out uneven load) rather than just reading the claim.

**Bridge out:** consistent hashing decided *where* a key lives — a cheaper,
related question is whether that key exists *at all*, without paying for a full
lookup.

### 10.6 Bloom Filters  `(#bloom-filters)`
> Checking "does this key exist" by actually looking it up costs a real round
> trip, even when most checks are for things that don't exist.

**Overview**
- A probabilistic structure: "definitely not in the set" (always correct, zero
  false negatives) or "probably in the set" (might be a false positive — go do
  the real lookup to confirm).
- Worked example: "is this username taken?" — a bit array plus several hash
  functions (K=3 or K=7) mark bits on insert; a lookup checks all K positions. The
  double-hashing trick derives K hashes from just 2 computations:
  `h_i(x) = h1(x) + i — h2(x)`, using MurmurHash3, xxHash, or FNV-1a as the base
  hashes. The tuning parameters: `m` (bit array size), `n` (items), `k` (hash
  functions), `p` (false-positive rate), related by `k = (m/n) × ln(2)` and
  `p ≈ (1 - e^(-kn/m))^k` — concretely, `m/n=10, k=7` gives p≈0.82%, and
  `m/n=15, k=10` gives p≈0.03%.

**Real-World**
- Cassandra/Bigtable skip a disk read entirely if the filter says "definitely
  not here" (heavily used in the Cassandra read path across multiple SSTables,
  and HBase applies the same idea per-region). Chrome's Safe Browsing checks URLs
  against malware lists without downloading the full list. CDNs avoid an origin
  fetch for content never requested before.

**Failure Modes**
- What happens when the dataset outgrows the original sizing (false-positive rate
  climbs): scalable Bloom filters (chain additional filters), rebuild with a
  larger `m`, or partition/shard the filter itself. Variants trading "no delete"
  for other properties: Counting Bloom Filter (supports deletion), Cuckoo Filter
  (deletion, often more space-efficient), Scalable Bloom Filter, Quotient Filter
  (better cache locality).

**Hands-On**
- Prerequisites: Python (`bitarray`) or Node.js (`bloomfilter` npm package), or
  Redis's built-in Bloom filter module (RedisBloom, free Docker image).
- Setup: local/free — either a small script or
  `docker run -d -p 6379:6379 redis/redis-stack-server` (includes RedisBloom).
- Simulate the scenario: insert 100,000 "taken usernames" into a Bloom filter
  sized for `m/n=10, k=7` (from Overview). Check 10,000 usernames you know are
  NOT in the set and count how many the filter incorrectly says "probably
  taken" — compare that count against the predicted p≈0.82%.
- What to observe: your measured false-positive rate landing close to the
  formula's prediction — put your own percentage next to the math instead of
  trusting it blindly. Then resize to `m/n=15, k=10` and confirm the rate drops
  toward the predicted 0.03%.
- Stretch goal: benchmark a real disk-backed lookup (query Postgres for
  "does this username exist") against the same check gated behind a Bloom
  filter first (skip the DB call entirely when the filter says "definitely
  not") — measure the latency difference on a workload where most checked
  usernames don't actually exist, the exact skip-a-disk-read scenario named in
  Real-World.

**Bridge out:** [SEE 7.2] this exact structure is the fix Caching's Cache
Penetration failure mode points to.

### 10.7 Rate Limiting  `(#rate-limiting)`
> One client — abusive, buggy, or just enthusiastic — can otherwise consume
> unlimited capacity, starving every other client of the same shared resource.

**Overview**
- 5 algorithms: Fixed Window (simple, allows a 2× burst at the boundary), Sliding
  Window Log (exact, stores every timestamp — accurate but memory-heavy; used for
  financial APIs and auth endpoints), Sliding Window Counter (a weighted blend of
  adjacent fixed windows — a scalable approximation, used by GitHub's API and
  Shopify), Token Bucket (tokens refill steadily, allows controlled bursts — AWS
  API Gateway, Stripe), Leaky Bucket (fixed output rate via a FIFO queue — Uber's
  dispatch system, Twilio SMS).
- What's being limited: per user, per IP, per API key, per endpoint, or globally
  — a single rule or stacked multi-window rules (e.g. 10/sec AND 1000/day
  simultaneously). Response when the limit hits: reject with 429 (RFC 6585
  headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`,
  `Retry-After`), queue, or throttle (Netflix reduces bitrate instead of
  stopping — a named example of throttle as distinct from reject/queue).

**Real-World**
- Twitter/X caps at 300 tweets/3hr; GitHub's API allows 5,000 req/hr; Shopify
  caps at roughly 40 req/sec.

**Hands-On**
- Prerequisites: Docker (Redis); Node.js/Python; `hey` or `k6`.
- Setup: local/free — `docker run -d -p 6379:6379 redis`.
- Simulate the scenario: implement Token Bucket rate limiting (10 requests/sec,
  burst of 20) using a Redis Lua script for the atomic read-check-decrement, in
  front of a simple endpoint. Load-test with `hey -n 200 -c 50` (a burst well
  above the limit) and log the ratio of 200s to 429s. Then implement Fixed
  Window instead (a simple `INCR key EX 1`, reject above 10) and repeat the
  exact same load test, paying attention to requests sent right at the window
  boundary.
- What to observe: Token Bucket allowing a controlled burst up to 20 before
  throttling, versus Fixed Window's known 2× boundary-burst behavior — send a
  burst that straddles two fixed windows and count how many requests got
  through in that boundary-crossing second (should approach 20 with Fixed
  Window's edge case) versus Token Bucket's steadier behavior.
- Stretch goal: run the Lua-script version and a naive non-atomic version
  (`GET` then `SET` as 2 separate Redis calls) side by side under high
  concurrency (`hey -c 200`) — count how many requests slip through the
  non-atomic version above the stated limit, the exact race condition the
  atomic Lua script exists to close.

**Bridge out:** a distributed implementation typically uses Redis + a Lua script
for atomicity — the read-check-increment must happen as one atomic operation, or
two concurrent requests can both slip through. Rate limiting protects a service
from too many requests; the related but distinct problem of one specific consumer
falling behind is next.

### 10.8 Backpressure  `(#backpressure)`
> A producer can generate work faster than a specific consumer can process it —
> without a deliberate response, the consumer's queue grows unbounded until it
> runs out of memory and crashes.

**Overview**
- 6 response strategies: Drop/load shed (503, for "latest matters, not every
  one" — real-time metrics, ad bids), Slow the producer (flow control — TCP's
  window, HTTP 429, a Kafka quota), Bounded buffer + block (Reactive Streams, Go
  channels, Akka), Scale consumers (auto-scale more workers, [SEE 10.9]), Sample/
  aggregate (process a representative subset — telemetry, logging), Priority
  queue (mixed-criticality traffic — a payment beats an analytics event).
- By layer: Network/Transport (TCP, HTTP/2, gRPC, WebSocket all have backpressure
  built into the protocol), Message Brokers (Kafka consumer lag, RabbitMQ, SQS,
  NATS), Application Frameworks (Reactive Streams, Go channels, Node.js streams,
  Akka Streams).

**Real-World**
- Uber's QALM (queue-based adaptive load management) and Twitter's Finagle
  admission control are two named, production-grade implementations of this
  exact idea.

**Hands-On**
- Prerequisites: the queue lab from 8.1 (RabbitMQ or SQS).
- Setup: local/free — reuse the RabbitMQ container from 8.1.
- Simulate the scenario: build a producer that pushes 1,000 messages/sec into
  a queue and a single consumer that can only process 100/sec (a deliberate
  `sleep` in its handler). Watch the queue depth grow unbounded in the
  management UI. Then implement 2 fixes separately: (a) load shedding — the
  producer checks queue depth before pushing and drops messages once depth
  exceeds 5,000; (b) scale consumers — add 9 more identical consumers (10 total)
  so aggregate consumption now roughly matches production rate.
- What to observe: the unbounded-growth run eventually exhausting memory or
  hitting the broker's configured max queue length, versus the load-shedding
  run's queue depth plateauing at your chosen ceiling, versus the
  scaled-consumers run keeping queue depth low because the aggregate consumer
  throughput now matches the producer's 1,000/sec — 3 different, felt outcomes
  from the same overload condition.
- Stretch goal: implement a priority queue (RabbitMQ supports message
  priorities natively) and confirm a "payment" message enqueued after 500
  "analytics" messages still gets processed first — mixed-criticality traffic
  handling, from Overview, working.

**Bridge out:** "scale consumers" as one response is the full mechanics of the
next lesson.

### 10.9 Auto-Scaling  `(#auto-scaling)`
> Provisioning for peak load 24/7 wastes money every non-peak hour; provisioning
> for average load means every spike causes an outage.

**Overview**
- Signals: CPU utilization, queue depth/consumer lag, request rate/p99 latency,
  memory/disk/network I/O, custom business metrics, a known schedule. Policy:
  Target Tracking, Step Scaling, Predictive (ML-forecasted), Scheduled
  (cron-based). Actions: scale up (fast, 30-60s), scale down (slow, drain
  connections first), cluster autoscaler (adds whole nodes), pre-warming
  (predictive scale-up ahead of an expected spike).
- Tool-to-signal mapping: Kubernetes HPA (pod-level, metric-driven) vs KEDA
  (event/queue-depth-driven, a distinct scaling model from HPA), AWS Auto Scaling
  Groups + Target Tracking (vs Lambda's own implicit concurrency scaling, a
  different mechanism entirely), GCP Managed Instance Groups, Azure VMSS.

**Hands-On**
- Prerequisites: the local Kubernetes cluster from 5.5; `kubectl`; a load
  generator (`hey` or `k6`).
- Setup: local/free — `kind`/`minikube` with the metrics-server add-on enabled
  (required for HPA to read CPU metrics).
- Simulate the scenario: deploy an app with an `HorizontalPodAutoscaler` set to
  target 50% CPU, starting at 2 replicas, max 10. Load-test it with
  increasing concurrency (`hey -z 5m -c 200 <url>`, run for several minutes)
  and watch `kubectl get hpa -w` and `kubectl get pods -w` in 2 separate
  terminals.
- What to observe: replica count climbing in response to CPU crossing the 50%
  target, and — this is the important part — the *speed* difference between
  scale-up (new pods appear within roughly 30-60s of the CPU metric crossing
  threshold) and scale-down (Kubernetes deliberately waits several minutes of
  sustained low usage before removing pods, to avoid flapping) — the asymmetry
  named in Overview, timed on your own cluster.
- Stretch goal: install KEDA and scale based on RabbitMQ queue depth instead of
  CPU (from the 8.1/10.8 queue labs) — confirm it reacts to a queue backlog
  building even if CPU on the existing pods is low, a distinct signal HPA
  alone can't see.

**Bridge out:** every pattern in this module tries to prevent overload — the last
lesson is the deliberate plan for what happens when prevention still isn't enough.

### 10.10 Graceful Degradation  `(#graceful-degradation)`
> Under extreme load, a system trying to do everything perfectly often fails
> completely — staying *partially* up by deliberately shedding non-critical work
> is usually the better outcome.

**Overview**
- 4 tiers: Healthy (everything on) → Stressed (disable non-critical features) →
  Overloaded (serve cached/stale data, disable non-essential writes) → Critical
  (core-path-only). Tactics: Feature flags (LaunchDarkly, Unleash, Flagsmith are
  the named tools), Circuit breaker ([SEE 11.5]), cached fallback, request
  hedging (a named gRPC hedging policy sends the same request to multiple
  replicas, uses whichever responds first), traffic tiering, bulkhead isolation.
- Concrete degradation thresholds worth having as anchors: CPU>80% → disable
  recommendations; DB latency>500ms → cache only; error rate>5% → circuit break;
  queue depth>10K → reject non-critical traffic.

**Hands-On**
- Prerequisites: a simple app with 2 features (a "core" endpoint and a
  "recommendations" endpoint that calls a slow downstream service); a feature
  flag library (Flagsmith and Unleash both have free self-hosted or free-tier
  options).
- Setup: local/free — Unleash's official Docker image (free, self-hosted).
- Simulate the scenario: wire the "recommendations" feature behind an Unleash
  flag, and write a small watchdog that monitors your core endpoint's p99
  latency and flips the flag off automatically once p99 crosses a threshold
  you set (simulating the CPU>80% → disable recommendations rule from
  Overview). Load-test the whole app hard enough to push latency past that
  threshold.
- What to observe: the recommendations feature switching off automatically
  mid-load-test while the core endpoint keeps responding — partial
  availability instead of a full outage, the central claim of this lesson,
  triggered by your own measured metric instead of a manual toggle.
- Stretch goal: implement request hedging on one call — fire the same request
  to 2 mock "replica" endpoints simultaneously and use whichever responds
  first, discarding the slower one — and measure how much it improves your
  p99 under artificial jitter on one of the two endpoints.

**Bridge out:** closes Module 10. Distributed Systems opens next — every pattern
here quietly assumed deeper machinery (leader election, gossip, consensus) that
was never actually explained.

---

## Module 11 — Distributed Systems
`(12-distributed-systems.html)` — every pattern in Scalability (Module 10) quietly assumed machinery this module now actually explains: leader election, gossip, consensus, the papers underneath it all.

### 11.1 Distributed System Patterns  `(#dist-patterns)`
> Scalability used pieces of this vocabulary — quorum in rate limiting's
> implementation, leader-follower in replication — without formally naming the
> whole catalog.

**Overview**
- 14 recurring building blocks: WAL (log changes before applying — crash
  recovery; Postgres, Kafka, etcd), Segmented Log (fixed-size segments, prevents
  unbounded growth), High-Water Mark (the highest committed offset all replicas
  share), Quorum (majority agreement, `W+R>N`), Leader-Follower (one writer, many
  replicating readers), Heartbeat (periodic "I'm alive," missing ones trigger
  detection), Lease (a time-bounded lock that auto-expires), Gossip Protocol
  (nodes randomly exchange state until convergence), Phi Accrual (adaptive
  failure detection, [SEE 11.12] for the formula), Split Brain (a partition
  causes two nodes to both believe they're leader, prevented by quorum), Fencing
  Tokens ([SEE 7.10] for the concrete Redlock context), Merkle Trees ([SEE 9.2]
  for the O(log N) comparison mechanic), Hinted Handoff (a neighbor temporarily
  stores a write when the real target is down), Read Repair (fix a stale replica
  lazily, on the next read), Checksum (a hash detecting corruption — HDFS, S3,
  Kafka, TCP all checksum).

**Hands-On**
- Prerequisites: none new — this lesson's value is recognizing patterns already
  built in earlier labs.
- Setup: none.
- Simulate the scenario: go back through your own labs from Modules 7-10 and,
  for each of the 14 named patterns, write down which lab you already
  reproduced it in (Quorum → 9.1/9.2's Cassandra lab; Heartbeat/Lease → 9.3's
  etcd lab; Fencing Tokens → 7.10's Redlock lab; Checksum → any TCP capture from
  Module 2). For any pattern you can't match to a lab you've already run, note
  it — that's exactly what 11.2-11.12 exist to cover.
- What to observe: how many of these 14 "distributed systems fundamentals" you
  already touched hands-on without the formal name attached — the point of
  this lesson is realizing the vocabulary was already earned, not learning it
  fresh.
- Stretch goal: none — this is a consolidation exercise, not a new build.

**Bridge out:** every pattern here gets its own deeper lesson later in this
module — this is the index, not the destination.

### 11.2 ZooKeeper  `(#zookeeper)`
> 11.1 named "quorum" and "lease" abstractly — ZooKeeper is a concrete, widely-
> used system built almost entirely from those two ideas.

**Overview**
- Distributed coordination — leader election, distributed locks, configuration,
  service discovery, backed by the ZAB consensus protocol. Guarantees:
  linearizable writes, sequential consistency for reads, ephemeral nodes
  (auto-delete when the creating session ends), watches (one-time triggers on a
  node's change).

**Hands-On**
- Prerequisites: Docker (ZooKeeper's official image); `zkCli.sh` (ships with
  it).
- Setup: local/free — `docker run -d -p 2181:2181 zookeeper`.
- Simulate the scenario: connect with `zkCli.sh` and create an ephemeral node
  (`create -e /leader "worker-1"`), then open a second `zkCli.sh` session and
  set a watch on it (`get -w /leader`). Close the first session (simulating
  that worker crashing) and watch the second session get notified the moment
  the ephemeral node disappears.
- What to observe: the ephemeral node vanishing automatically the instant its
  owning session ends, with zero manual cleanup code and zero polling — the
  exact mechanism real systems use for "who is the current leader," made
  concrete instead of described.
- Stretch goal: have 3 separate clients all try to `create /leader-election`
  (a non-ephemeral node) at once in a tight loop — confirm exactly one
  succeeds and the other two get `NodeExists` errors, a minimal leader-election
  primitive built from ZooKeeper's atomic create.

**Bridge out:** GFS and HDFS are the foundational systems that actually store the
bulk data coordination systems like this one point at.

### 11.3 GFS & HDFS  `(#gfs-hdfs)`
> ZooKeeper coordinates metadata; GFS/HDFS are what actually store the bulk data.

**Overview**
- GFS (Google, 2003) directly inspired HDFS (Hadoop's file system). Single
  master + chunkservers (GFS) / NameNode + DataNodes (HDFS); large blocks (64MB
  GFS chunks, 128MB HDFS blocks) minimize metadata overhead; 3 replicas,
  rack-aware, with checksums for fault tolerance. Distinct consistency models:
  GFS uses relaxed consistency (at-least-once appends), while HDFS is
  write-once-read-many.

**Hands-On**
- Prerequisites: Docker (a single-node Hadoop/HDFS image, several free ones
  exist, e.g. `apache/hadoop`).
- Setup: local/free — a single-node HDFS via Docker.
- Simulate the scenario: upload a file larger than the configured block size
  (lower it to something small like 1MB for the lab, via `dfs.blocksize`, so
  you can see splitting without needing a huge file) and check
  `hdfs fsck /yourfile -files -blocks` to see it split into multiple blocks.
  Check the replication factor with `hdfs dfsadmin -report`.
- What to observe: one logical file represented as several fixed-size blocks
  under the hood, each with its own replica count — the large-block,
  metadata-minimizing design from Overview, seen directly in `fsck` output
  instead of taken as a claim.
- Stretch goal: none — a true multi-DataNode HDFS cluster with rack awareness
  needs more nodes than a single laptop comfortably runs; this lesson's lab
  demonstrates the block/replication concept at single-node scale.

**Bridge out:** BigTable was built directly on top of GFS — the very next layer
up this same stack.

### 11.4 BigTable  `(#bigtable)`
> GFS provides raw block storage; BigTable is the structured, queryable layer
> built directly on top of it.

**Overview**
- Google's wide-column database (2006) — a sparse, sorted map of (row,
  column:qualifier, timestamp) → value — that directly inspired Cassandra and
  HBase. Sorted by row key; tablets auto-split as they grow; write path: memtable
  → SSTable → background compaction. Explicit dependencies: GFS + Chubby.

**Hands-On**
- Prerequisites: the Cassandra cluster from 9.1/6.5 (a BigTable-lineage
  system you can actually run).
- Setup: local/free — reuse the Cassandra container(s).
- Simulate the scenario: write 10,000 rows to a wide-column table, then check
  `nodetool tablestats` for memtable size and SSTable count. Force a flush
  (`nodetool flush`) and watch a new SSTable appear on disk
  (`nodetool cfstats`, or inspect the data directory directly). Trigger
  compaction manually (`nodetool compact`) and compare SSTable count before
  and after.
- What to observe: the exact write path from Overview (memtable → SSTable →
  compaction) happening on disk in front of you, on a system directly
  descended from BigTable's design — not an abstract diagram, your own table's
  files.
- Stretch goal: none — this reuses an existing lab to make the lineage
  concrete rather than requiring new infrastructure.

**Bridge out:** [SEE 6.1] this is a direct, real-world instance of the LSM-tree
internals Storage built from first principles.

### 11.5 Fault Tolerance & Reliability  `(#fault-tolerance)`
> Infrastructure's API Gateway lesson (5.2) flagged "circuit breaker" as one of
> its 12 responsibilities without explaining it — one slow downstream service can
> cascade, and this is the fix.

**Overview**
- Circuit breaker state machine: Closed (healthy, requests pass) → errorRate
  exceeds a threshold → Open (fail fast, a recovery timer starts) → cooldown →
  Half-Open (allow limited trial requests) → success → Closed, or failure → Open.
  Fallback on Open: a cached response, a sensible default, or a friendly error.
  Named implementations: Hystrix (Netflix, pioneered it), Resilience4j (Java),
  Envoy/Istio (built into the mesh), Polly (.NET).
- A broader reliability-patterns table: Timeouts (fail fast after N seconds),
  Retries + Backoff (jittered, to avoid a thundering herd of retries, [SEE 7.2]),
  Bulkheads (isolate thread pools per dependency), Health Checks (liveness = is
  it alive; readiness = can it serve traffic).
- Availability math, made concrete: `Downtime = (1 - availability) × 365 × 24 × 60` minutes/year (99.9%=8.76h, 99.99%=52min, 99.999%=5min); Serial:
  `A_total = A1 × A2` (each component multiplies, more serial components always
  lowers total availability); Parallel: `A_total = 1 - (1-A1)(1-A2)` (redundancy
  actively improves it).
- Chaos Engineering — intentionally injecting failures (kill pods, add latency,
  partition the network, fill a disk) to find weaknesses before a real outage
  does: Chaos Monkey (Netflix, the originator), Litmus (Kubernetes-native),
  Gremlin. Distributed Tracing Internals — injecting `trace_id`/`span_id` into
  every request header so a request's total latency can be reconstructed later
  ([SEE 13.3]).

**Hands-On**
- Prerequisites: Node.js; Resilience4j (Java) or `opossum` (Node's circuit
  breaker library, free).
- Setup: local/free only.
- Simulate the scenario: wrap a call to a deliberately flaky downstream mock
  (fails 60% of the time) with `opossum`, configured to open after 5 failures
  in 10 seconds with a 10-second reset timeout. Hammer it with 50 sequential
  calls and log the circuit's state (`Closed`/`Open`/`Half-Open`) before and
  after each call.
- What to observe: the circuit flipping to Open after the failure threshold —
  subsequent calls fail *instantly* with no network call attempted at all
  (check your mock's own hit count to confirm calls actually stopped reaching
  it) — then flipping to Half-Open after the timeout and testing one trial
  call before deciding to close or reopen.
- Stretch goal: compute the availability math from Overview on a 3-tier chain
  (App Server 99.9% → this flaky dependency's raw 40% success rate → without a
  circuit breaker) versus the same chain with the breaker's fallback (a cached
  response) substituted in during Open state — show numerically how the
  fallback changes the user-facing success rate even though the dependency
  itself never improved.

**Bridge out:** a circuit breaker's real value is stopping one failure from
cascading — but after an actual data-loss event, a different recovery strategy
takes over.

### 11.6 Data Redundancy & Recovery  `(#data-redundancy)`
> A slow dependency is 11.5's problem; an actual data-loss event (a disk failure,
> a region outage) is this lesson's.

**Overview**
- RPO (Recovery Point Objective — max tolerable data loss) and RTO (Recovery Time
  Objective — max tolerable downtime) are the two numbers every strategy
  optimizes. 5 strategies: Replication (RPO near 0, RTO seconds via auto-
  failover), Erasure Coding (fragments + parity — S3's approach, RPO 0, RTO
  minutes), Snapshots (RPO hours since last snapshot, RTO minutes-to-hours), WAL/
  Binlog (near-0 RPO, minutes RTO via replay), Geo-Redundancy (survives an entire
  region failure, async replication's lag as the cost).

**Hands-On**
- Prerequisites: the Postgres replication setup from 10.3; `pg_basebackup` for
  snapshots.
- Setup: local/free — reuse the primary+replica Postgres containers.
- Simulate the scenario: take a snapshot (`pg_basebackup`) of the primary,
  then write 100 more rows, then simulate a disaster — kill the primary
  entirely (delete the container). Restore from your snapshot and measure (a)
  how many of those 100 rows are missing (your actual RPO) and (b) how long
  the restore + restart took (your actual RTO).
- What to observe: real RPO/RTO numbers on your own setup instead of abstract
  targets — snapshot-based recovery losing exactly the rows written after your
  last snapshot, matching the "RPO = hours since last snapshot" claim, scaled
  down to however often you snapshotted.
- Stretch goal: repeat the disaster, but recover from the streaming replica
  (still running, up to date within its lag window) instead of the snapshot —
  compare its RPO (near 0, matching Overview's replication claim) and RTO
  (mostly just promotion time) against the snapshot-based recovery.

**Bridge out:** replication assumed "a new leader is elected automatically"
without explaining how.

### 11.7 Leader Election  `(#leader-election)`
> The leader in a leader-follower topology dies — someone has to become the new
> leader, automatically, without a human paging anyone, and exactly one, never
> zero, never two.

**Overview**
- Algorithm comparison: Raft (candidates request votes on timeout, majority
  wins — etcd, CockroachDB, Consul, TiKV), ZAB (ZooKeeper's broadcast protocol —
  pre-KRaft Kafka), KRaft (Kafka's own built-in Raft variant), Bully (highest-ID
  node simply wins — simple but not partition-tolerant, rarely used now).
- A 3-node walkthrough: Node A times out waiting for a heartbeat → becomes a
  candidate → requests votes from B and C → wins a 2/3 majority → becomes leader
  → begins replicating its log via AppendEntries RPCs.
- Raft's AppendEntries mechanics, specifically: the leader tracks `nextIndex[]`
  and `matchIndex[]` per follower; the RPC signature is `AppendEntries(term,
  leaderId, prevLogIndex, prevLogTerm, entries[], leaderCommit)`; a follower
  rejects if `prevLogIndex`/`prevLogTerm` don't match, and the leader decrements
  `nextIndex` and retries.
- Auto-recovery flow: heartbeat missed (typically 150-300ms timeout) → election
  starts → majority quorum wins → clients redirected → typically 1-5 seconds
  total downtime, zero humans. Split-brain is prevented because a majority quorum
  mathematically can't be won by two candidates at once.
- Failover tools: etcd (K8s's control plane), Kafka KRaft, Redis Sentinel ([SEE
  7.8], simpler than full consensus), Postgres + Patroni (etcd-backed automated
  failover).

**Hands-On**
- Prerequisites: the 5-node etcd cluster from 9.3.
- Setup: local/free — reuse that cluster.
- Simulate the scenario: use `etcdctl` to watch leader changes
  (`etcdctl endpoint status --cluster` shows the leader flag per node) while
  you kill the current leader's container. Time precisely how long it takes
  before a new leader is confirmed and a write succeeds again.
- What to observe: your measured failover time landing in the same rough
  1-5 second range named in Overview, and confirm split-brain never
  happens — check that at no point do 2 nodes simultaneously report
  themselves as leader, no matter how many times you repeat the kill.
- Stretch goal: try to force split-brain by partitioning the network into 2
  groups where neither has a clear majority (e.g. 2 vs 2 with 1 node
  unreachable by both, on a 5-node cluster) — confirm neither side can elect
  a leader, since neither has the required majority — the mathematical
  guarantee from Overview, tested at its actual boundary condition.

**Bridge out:** the specific algorithms (Paxos's 4 phases) named here get a full,
deeper mechanical walkthrough next.

### 11.8 Consensus Protocols  `(#consensus-protocols)`
> 9.3 introduced Raft and Paxos conceptually; this is the full mechanical
> walkthrough neither that lesson nor 11.7 fully gave.

**Overview**
- FLP Impossibility: no deterministic consensus algorithm can guarantee agreement
  in a fully asynchronous system where even one node might crash — every
  practical protocol works around this with timeouts and leader election, not by
  defeating the theorem.
- Classic Paxos, 4 phases on a 5-node cluster: Prepare (proposer asks for a
  promise not to accept lower-numbered proposals) → Promise (a majority agrees)
  → Accept (the proposer asks the majority to accept a value) → Accepted (a
  majority confirms — permanently chosen).
- Multi-Paxos Optimization: electing a stable leader who skips Prepare for
  subsequent proposals reduces 2 round trips to 1 — the same optimization Raft
  bakes in by design.
- Protocol comparison: Raft (1 RTT, strict log order, built-in membership
  changes), Multi-Paxos (1 RTT once elected, tolerates log gaps), ZAB (1 RTT, FIFO
  + causal ordering), Viewstamped Replication (1 RTT, influenced Raft), EPaxos
  (leaderless, 1 RTT fast path when conflict-free, uses a dependency graph
  instead of a simple log).

**Hands-On**
- Prerequisites: Python or Node.js only — Paxos is rarely run as
  off-the-shelf infrastructure, so this lab builds a minimal simulation.
- Setup: none.
- Simulate the scenario: implement the 4 Classic Paxos phases as plain
  function calls between 5 simulated "nodes" in one script (no real network):
  a proposer sends `Prepare(n)` to all 5, collects Promises, sends
  `Accept(n, value)` once it has a majority, collects Accepted confirmations.
  Then simulate 2 competing proposers racing at once with overlapping proposal
  numbers and trace which value ultimately wins.
- What to observe: exactly one value getting permanently chosen even with 2
  concurrent proposers — the majority-overlap guarantee (any 2 majorities out
  of 5 nodes must share at least 1 node) is what prevents 2 different values
  from both being "Accepted," walked through in your own trace log instead of
  taken as a proof on faith.
- Stretch goal: add the Multi-Paxos optimization — once one proposer's Prepare
  succeeds, skip Prepare for its next 5 proposals and go straight to Accept —
  and count how many total messages you saved compared to running Classic
  Paxos's full 4 phases each time.

**Bridge out:** the next distributed-systems fundamental is ordering events when
no shared clock exists at all.

### 11.9 Clocks & Time  `(#clocks)`
> [SEE 9.8] There is no global clock — two events on different machines can't be
> reliably ordered by wall-clock timestamp alone.

**Overview**
- Physical clocks: NTP (1-10ms accuracy, worse on a WAN, can jump backward on
  correction — leap smear is Google's technique for spreading a leap second over
  24h instead of a sudden jump); Google TrueTime (GPS + atomic clocks, bounds
  uncertainty under 7ms, returns an interval — Spanner's commit-wait protocol
  waits out that interval for external consistency).
- A worked Lamport Timestamp example across 3 nodes: the counter increments on
  local events and jumps to `max(local, received)+1` on receive — with the
  explicit limitation that `L(a) < L(b)` doesn't imply `a` actually happened
  before `b`.
- A worked Vector Clock example: `[2,0,0] → [2,2,0]` proves causality (every slot
  in the first is = the second); `[2,3,0]` vs `[4,0,0]` are genuinely concurrent
  (neither dominates).
- Hybrid Logical Clocks (HLC) combine physical time with a logical counter —
  CockroachDB's MVCC timestamps use this for both causal correctness and
  wall-clock proximity.

**Hands-On**
- Prerequisites: Python or Node.js only.
- Setup: none — a pure algorithm implementation lab.
- Simulate the scenario: implement Lamport timestamps for 3 simulated nodes
  exchanging messages (local events increment a counter; receiving a message
  sets `counter = max(local, received) + 1`). Then implement Vector Clocks for
  the same 3 nodes (each tracks a 3-element vector, one slot per node).
  Construct a scenario with 2 genuinely concurrent events (neither node knew
  about the other's event) and check what each clock type reports.
- What to observe: Lamport timestamps still assigning a total order to the 2
  concurrent events (one number is just bigger than the other), falsely
  implying one happened before the other — while Vector Clocks correctly
  report them as concurrent (neither vector dominates the other) — the exact
  limitation named in Overview, caught by your own test case instead of
  trusted as a claim.
- Stretch goal: implement a basic Hybrid Logical Clock (physical time + a
  logical tie-breaker counter) and confirm it stays close to wall-clock time
  for widely-separated events while still correctly ordering rapid-fire events
  that land in the same physical millisecond.

**Bridge out:** Scalability's Replication lesson (10.3) covered the 3 topologies
operationally; this module revisits them with the theory just built up.

### 11.10 Replication Strategies  `(#replication-strategies)`
> [SEE 10.3] The same 3 topologies, now with the sync/async/semi-sync trade-off
> and conflict math spelled out per topology.

**Overview**
- A scenario-based recommendation: single-region + strong consistency →
  single-leader sync (Raft/Paxos for HA); multi-region + low-latency writes →
  multi-leader async (accept the conflict-resolution cost); high availability +
  tunable consistency → leaderless quorum; read-heavy + eventual consistency OK →
  single-leader with async read replicas; collaborative editing → CRDTs or OT.

**Failure Modes**
- Replication Lag, made concrete: async replication means followers can be
  seconds behind, causing 3 named symptoms — read-after-write inconsistency (a
  user writes, then reads a stale follower and doesn't see their own write),
  monotonic read violations (time appears to go backward), causality violations
  (a reply visible before the original message). Fixes: read-your-writes (route
  the user's own reads to the leader right after a write) and causal consistency
  (explicitly track dependencies).

**Hands-On**
- Prerequisites: the primary+replica Postgres setup from 10.3.
- Setup: local/free — reuse it.
- Simulate the scenario: write a value on the primary, then immediately read
  it from the replica in a loop, logging each read's value and a timestamp,
  until it matches. Record the actual replication-lag window in milliseconds.
  Then implement the read-your-writes fix — route reads for the *same user*
  who just wrote to the primary for a short window (e.g. 2 seconds) instead of
  the replica, and confirm that user never sees a stale value even during the
  measured lag window.
- What to observe: a real, non-zero lag window on your own machine (even
  local, same-host replication has *some* lag), and the read-your-writes
  routing fix eliminating the stale read specifically for the writer, while
  other users reading the replica during that same window may still see the
  old value — the fix is scoped, not a blanket solution.
- Stretch goal: none — this reuses 10.3's infrastructure to make the failure
  mode and its fix concrete rather than requiring new setup.

**Bridge out:** the same partitioning and sharding choices from Scalability
(10.1, 10.4) get their theory-layer treatment next — rebalancing math,
scatter-gather cost, secondary indexing.

### 11.11 Partitioning & Sharding  `(#partitioning-sharding)`
> [SEE 10.1, 10.4] The operational how is covered — this adds rebalancing math,
> scatter-gather cost, and secondary indexing on top.

**Overview**
- Rebalancing Strategies: Fixed Partitions (many more partitions than nodes up
  front — Riak, Elasticsearch, Couchbase), Dynamic Splitting (start with 1
  partition per node, split/merge as needed — HBase, RethinkDB, MongoDB),
  Proportional to Nodes (a fixed number of partitions per node, a new node steals
  random partitions — Cassandra's vnodes).
- Cross-Partition Queries & Scatter-Gather: a query spanning multiple partitions
  scatters (sends to every relevant partition in parallel) and gathers (merges,
  sorts, returns) — response time is bounded by the *slowest* partition (tail
  latency), mitigated with hedged requests. A concrete example: an Elasticsearch
  `GET /users/_search` query fans out to every shard, each returns its own
  matches, and the coordinator merges and sorts before returning to the client.
- Secondary Indexes, revisited: Local Index (document-partitioned, fast writes,
  scatter-gather reads — DynamoDB) vs Global Index (term-partitioned, fast
  single-partition reads, async multi-partition writes — Elasticsearch).

**Hands-On**
- Prerequisites: the Elasticsearch cluster from 6.8 (multi-node if you set
  that up in 10.2).
- Setup: local/free — reuse it.
- Simulate the scenario: index 50,000 documents across multiple shards, then
  run a query that must check every shard (e.g. a broad match with no
  filtering) with `?search_type=query_then_fetch` and check the response's
  `_shards` field (`total`, `successful`) and the `took` time. Artificially
  slow one shard's node (e.g. throttle its container's CPU with `docker update
  --cpus`) and rerun the same query.
- What to observe: overall query latency rising to match the *slowest* shard's
  response time, not the average — the tail-latency claim from Overview,
  measured by deliberately creating one slow participant in an otherwise fast
  scatter-gather.
- Stretch goal: compare the same query's latency at 1 shard vs 5 shards (same
  total document count, different shard counts) to see the scatter-gather
  coordination overhead show up as shard count increases beyond what's useful
  for this data size.

**Bridge out:** leader election (11.7) assumed "followers detect a missing
heartbeat" as a simple fact — the last lesson in this module is the full, honest
treatment of how hard that detection actually is.

### 11.12 Failure Detection  `(#failure-detection)`
> Detecting whether a node is actually dead, versus just slow (a GC pause, a
> network blip), in a fully asynchronous network is provably impossible to do
> with 100% certainty.

**Overview**
- A fixed timeout (e.g. 5s) either causes false positives if too short, or slow
  detection if too long. Fixed Timeout and Heartbeat + Lease are the simplest,
  least adaptive detectors (Redis Sentinel, ZooKeeper sessions).
- Phi Accrual Failure Detector: outputs a continuous suspicion level f from the
  mean and variance of observed heartbeat inter-arrival times, using
  `f(t_now) = -log10(1 - F(t_now - t_last))` — worked example with mean=1000ms,
  std=200ms: f≈0.3 at 1s elapsed (probably alive), f≈3.0 at 2s (suspicious), f≈12.0
  at 5s (almost certainly dead). Cassandra defaults to marking dead at f > 8.
- SWIM Protocol (Scalable Weakly-consistent Infection-style Membership) — a node
  pings a random peer; if no response, it asks K other random peers to
  indirect-probe the same target; if all fail, the target is marked suspected,
  then dead after a timeout — membership changes piggyback on the same ping/ack
  messages. Used by HashiCorp Memberlist (Consul, Nomad, Serf) and Uber's own
  Ringpop.
- Design guidance by cluster size: small (3-7 nodes) — simple heartbeat with a
  Raft-style election timeout; medium (10-100) — Phi Accrual gives the best
  accuracy; large (100+) — SWIM/gossip is essential, O(1) per-node overhead vs a
  centralized heartbeat's O(N).

**Hands-On**
- Prerequisites: Python or Node.js only.
- Setup: none.
- Simulate the scenario: implement the Phi Accrual formula directly from
  Overview against a simulated heartbeat stream (mean=1000ms, std=200ms,
  matching the worked example). Feed it a normal heartbeat stream first and
  confirm φ stays low, then simulate a node going quiet (stop sending
  heartbeats) and compute φ at 1s, 2s, and 5s of silence.
- What to observe: your own computed φ values landing close to the worked
  example's f≈0.3/3.0/12.0 at the same elapsed times — verifying the formula
  produces the stated numbers instead of trusting the lesson's math. Then
  implement a naive fixed 2-second timeout on the same heartbeat stream and
  count how many normal, healthy delays (just network jitter, no real failure)
  get falsely flagged as dead — the false-positive problem a fixed timeout has
  that Phi Accrual's adaptive approach avoids.
- Stretch goal: implement a minimal SWIM-style indirect probe — node A can't
  reach node C directly, so it asks nodes B and D to try reaching C on its
  behalf — and confirm C gets correctly marked alive if even one indirect
  probe succeeds, despite A's own direct probe failing.

**Bridge out:** closes Module 11. This whole module produced and moved data
through countless systems, but nobody yet covered how that data actually
travels between them.

---

## Module 12 — Data Pipelines
`(11-data-pipelines.html)` — Distributed Systems (Module 11) explained the theory underneath every store and service built so far; this module is how data actually moves between them.

### 12.1 Change Data Capture (CDC)  `(#cdc)`
> [SEE 6.8] Search said "always reindex from source DB, never a source of truth"
> without explaining how — CDC is that mechanism.

**Overview**
- Stream database changes directly from the transaction log instead of a second,
  separate application write. 3 methods: Log-Based (reads the WAL/binlog via
  Debezium — near-zero impact on the source), Query-Based (polls with `WHERE
  updated_at > ?` — adds load, coarser latency), Trigger-Based (a DB trigger
  writes to a shadow table — low latency, highest source load).
- Tools: Debezium (open-source, log-based, the most common choice), AWS DMS
  (managed), Fivetran (SaaS, 200+ connectors), Airbyte (open-source Fivetran
  alternative).

**Hands-On**
- Prerequisites: Docker Compose (Postgres + Kafka + Debezium Connect, a
  well-documented free stack — Debezium's own tutorial Compose file works
  directly).
- Setup: local/free — Debezium's official quickstart Docker Compose (Postgres
  + Kafka Connect + Debezium connector).
- Simulate the scenario: enable logical replication on your Postgres table,
  register a Debezium connector pointing at it, then insert/update/delete a
  few rows directly in Postgres via `psql` — never touching Kafka directly.
  Consume the Kafka topic Debezium creates automatically and inspect the
  change events.
- What to observe: a fully-formed Kafka event appearing for every row change
  the instant it commits in Postgres, generated entirely from the WAL — no
  application code publishing anything, no second write path, no polling
  query. Compare this against a naive query-based approach (`WHERE updated_at
  > ?` on a timer) and note the latency and DB-load difference.
- Stretch goal: delete a row in Postgres and confirm Debezium emits a
  tombstone/delete event with the row's prior state still available in the
  event payload — useful for downstream systems that need to know what was
  deleted, not just that something was.

**Bridge out:** the "dual-write problem" this lesson solves is the exact
vocabulary Distributed Transactions' Outbox Pattern (9.4) references without
defining — this lesson is the deferred explanation.

### 12.2 ETL / ELT  `(#etl)`
> CDC gets raw change events flowing — this is what happens to that data once it
> needs to land somewhere analytically useful.

**Overview**
- ETL (transform before loading) vs ELT (load raw, transform inside the
  warehouse — the modern default, since warehouses are now cheap and fast enough
  to transform in place). Orchestration tools: Airflow (DAG scheduling), dbt
  (SQL transformations), Dagster/Prefect (code-first alternatives).
- Lambda Architecture (batch layer for accuracy + speed layer for real-time
  approximation, merged in a serving layer) vs Kappa Architecture (stream-only —
  replay the Kafka log for reprocessing instead of a separate batch pipeline).

**Hands-On**
- Prerequisites: Docker (dbt-core, free, pip-installable); Postgres or
  Snowflake/BigQuery's free tier.
- Setup: local/free — Postgres with a raw `orders` table loaded (ELT's "load
  raw" step already done for you); `pip install dbt-postgres`.
- Simulate the scenario: write a dbt model (`models/staging/stg_orders.sql`)
  that transforms the raw table into a cleaned view (cast types, rename
  columns), then a second model that aggregates it into daily revenue. Run
  `dbt run` and inspect the generated SQL and the resulting tables in
  Postgres.
- What to observe: the raw data landing untransformed first (ELT's "load
  raw"), with all transformation logic living as version-controlled SQL files
  that `dbt run` re-executes — contrast this with writing the same
  transformation as a one-off Python script with no lineage tracking. Run
  `dbt docs generate` and browse the auto-generated lineage graph showing
  which models depend on which.
- Stretch goal: use Airflow (a free local install, or Astronomer's free tier)
  to schedule the `dbt run` step as a DAG task running nightly, giving the
  transformation an actual orchestrated schedule instead of a manual command.

**Bridge out:** "Lambda's speed layer" and "Kappa's stream-only approach" are the
architectural choice Stream Processing and Batch Processing each represent one
half of.

### 12.3 Stream Processing  `(#stream-processing)`
> This lesson is the mechanics of processing data the instant it arrives.

**Overview**
- Frameworks: Apache Flink (true streaming, exactly-once, stateful — e.g. Uber
  counting ride requests per zone in a 5-min sliding window to compute a surge
  price multiplier), Kafka Streams (a library, not a separate cluster — e.g.
  LinkedIn joining view events with profiles for "who viewed your profile"),
  Spark Streaming (micro-batch, 100ms-1s intervals — e.g. Netflix aggregating
  play/pause/skip events for a trending dashboard).
- Windowing: Tumbling (fixed, non-overlapping), Sliding (overlapping), Session
  (gap-based). Watermarks (a policy for late-arriving events). Exactly-once
  (checkpointing + idempotent sinks). State (keyed per-entity running state,
  often backed by RocksDB inside Flink).

**Hands-On**
- Prerequisites: Docker (Flink's official image, has a free local cluster
  mode); the Kafka lab from 8.2.
- Setup: local/free — Flink's Docker Compose (JobManager + TaskManager) reading
  from your existing Kafka topic.
- Simulate the scenario: write a Flink job that reads `ride_requested` events
  keyed by `zone_id` and computes a count over a 5-minute Tumbling window,
  emitting a "requests per zone per 5 min" result. Feed it a burst of
  synthetic events with realistic timestamps (some slightly out of order,
  simulating real network delivery) and watch the Flink dashboard
  (`localhost:8081`) show the running job and its windowed output.
- What to observe: events that arrive slightly late (but within the
  watermark's allowed lateness) still getting counted into the correct window,
  while events arriving after the watermark has passed get dropped or routed
  to a separate late-data output — the watermark policy from Overview, tested
  against your own deliberately-shuffled event timestamps.
- Stretch goal: kill the Flink TaskManager mid-stream and restart it — confirm
  the job resumes from its last checkpoint with correct window counts (no
  double-counting, no gaps) — the exactly-once claim, verified instead of
  assumed.

**Bridge out:** batch processing is the direct counterpart — same data, opposite
timing philosophy.

### 12.4 Batch Processing  `(#batch-processing)`
> Lambda Architecture's "speed layer" is 12.3; this is the "process accurately,
> on a schedule" other half.

**Overview**
- MapReduce → Spark: Map (parallel transform) → Shuffle (group by key) → Reduce
  (aggregate) is MapReduce's shape; Spark keeps it but runs it as an in-memory
  DAG, roughly 100× faster for iterative workloads.
- Stream vs Batch: latency (ms-seconds vs minutes-hours), data (unbounded vs
  bounded), state (in-memory/checkpointed vs disk-based), tools (Flink/Kafka
  Streams/Spark Streaming vs Spark/MapReduce/Hive/Presto).

**Real-World**
- Netflix's nightly Spark job powers "Because you watched." Spotify's daily
  batch generates Discover Weekly. Banks run nightly reconciliation, statements,
  and fraud reports.

**Hands-On**
- Prerequisites: Docker (a single-node Spark image, free); Python (`pyspark`).
- Setup: local/free — `docker run -d bitnami/spark` (single-node) or `pip
  install pyspark` for a local Spark session with no cluster at all.
- Simulate the scenario: generate 1M synthetic order rows as a CSV, then write
  a PySpark job computing total revenue per product category (a
  groupBy/aggregate — the Map/Shuffle/Reduce shape from Overview happening
  under the hood). Time it, then write the equivalent as plain single-threaded
  Python (`pandas` or a manual loop) and time that too.
- What to observe: Spark's job splitting into stages visible in its Web UI
  (`localhost:4040`), showing the shuffle step explicitly, and — depending on
  your machine's core count — outperforming the single-threaded version on the
  larger dataset, a felt version of "parallel, in-memory DAG."
- Stretch goal: rerun the same aggregation as an iterative computation (e.g.
  running it 10 times against cached data) and compare Spark's in-memory
  caching (`.cache()`) against re-reading from disk each time — the
  "roughly 100× faster for iterative workloads" claim, measured on your own
  hardware.

**Bridge out:** batch output needs somewhere to land for analysis — a data
warehouse is that destination.

### 12.5 Data Warehouse  `(#data-warehouse)`
> Batch jobs need somewhere to land their output for analysis.

**Overview**
- OLAP — columnar storage (BigQuery, Snowflake, ClickHouse). Columnar storage
  reads only the needed columns — `SUM(revenue)` skips every other column,
  enabling roughly 10:1 compression.

**Hands-On**
- Prerequisites: Docker (ClickHouse's official free image); or BigQuery's
  free-tier sandbox (no credit card required for the sandbox mode).
- Setup: local/free — `docker run -d -p 8123:8123 clickhouse/clickhouse-server`.
- Simulate the scenario: load the same 1M-row orders dataset from 12.4 into
  both a row-store (Postgres, from earlier labs) and ClickHouse (columnar).
  Run `SELECT category, SUM(revenue) FROM orders GROUP BY category` against
  both and compare execution time, especially as you widen the table (add 20
  more unused columns to both and rerun).
- What to observe: Postgres's query time growing as you add more (unused)
  columns to the table, since row-store reads still touch full rows, while
  ClickHouse's time for the same aggregate query stays essentially flat — it
  never reads the columns your query doesn't need. Check disk usage on both
  for the same data too, for the 10:1 compression claim.
- Stretch goal: run a `SELECT *` (needs every column) against both and note
  that ClickHouse's advantage shrinks or disappears — columnar storage helps
  specifically for aggregate/analytical queries touching few columns, not for
  full-row lookups, the exact "opposite access pattern" distinction from the
  Bridge out.

**Bridge out:** OLTP runs the business ([SEE 6.4]); OLAP analyzes it — opposite
access patterns, which is why you don't run heavy analytics against a production
OLTP database.

### 12.6 Data Lakes & Lakehouse  `(#data-lakes)`
> A warehouse requires structured, transformed data — data lakes are for
> everything that hasn't been transformed yet, or never fully will be.

**Overview**
- Raw files on cheap object storage (S3/GCS); a lakehouse adds ACID + time
  travel on top (Delta Lake, Iceberg, Hudi). Columnar formats: Parquet (most
  popular), ORC — both compressed, splittable, roughly 10× smaller than CSV.

**Hands-On**
- Prerequisites: Python (`pyarrow`, `pandas`); MinIO or S3 free tier for the
  "lake" storage.
- Setup: local/free — MinIO (`docker run -d -p 9000:9000 minio/minio server
  /data`) as an S3-compatible bucket.
- Simulate the scenario: write your 1M-row orders dataset as both a CSV and a
  Parquet file, upload both to your MinIO bucket, and compare file sizes.
  Query just 2 columns out of 20 from each format using `pyarrow` (which can
  read Parquet column-by-column without loading the whole file) versus
  `pandas.read_csv` (which must parse every column regardless).
- What to observe: the Parquet file landing roughly 10× smaller than the CSV,
  and the column-selective Parquet read finishing noticeably faster than the
  CSV read that has to parse columns you don't even want — put your own
  numbers next to the "roughly 10× smaller than CSV" claim.
- Stretch goal: install Delta Lake or Iceberg locally (both have free,
  pip/Docker-installable versions) and write the same data as a Delta table,
  then update a few rows and use its time-travel feature to query the table
  "as of" the version before your update — a lakehouse feature a plain
  Parquet-on-S3 setup doesn't have.

**Bridge out:** none forward directly.

### 12.7 Data Quality  `(#data-quality)`
> Every pipeline lesson so far assumes the data flowing through is trustworthy —
> this lesson is the explicit gate that checks that assumption.

**Overview**
- A quality gate: pass → land normally; fail → quarantine + alert. 5 checks:
  Schema, Nullness (`user_id NOT NULL`), Range/set (`0 ≤ score ≤ 100`), Freshness,
  Volume (row count within an expected range of the historical median). Tools:
  Great Expectations, dbt tests, Soda, Monte Carlo.

**Hands-On**
- Prerequisites: Python; Great Expectations (`pip install great_expectations`,
  free).
- Setup: local/free only.
- Simulate the scenario: define expectations on your orders dataset —
  `expect_column_values_to_not_be_null("user_id")`,
  `expect_column_values_to_be_between("score", 0, 100)`, a freshness check on
  the max timestamp. Run the validation against clean data (should pass), then
  inject a few bad rows (a null `user_id`, a `score` of 150) and rerun.
- What to observe: Great Expectations producing a clear, itemized report of
  exactly which rows and which rule failed, instead of a downstream job
  silently consuming garbage data and producing wrong aggregates — the
  quarantine-before-consumption principle from the problem statement, working
  as a gate you can wire into a pipeline step.
- Stretch goal: wire the validation as a dbt test (`dbt test`) directly on
  your 12.2 dbt models and configure it to fail the pipeline run (not just
  warn) when a critical check fails — quality enforced as a build step, not an
  afterthought.

**Bridge out:** [SEE 8.5] the same instinct DLQ applies to bad messages, one
layer earlier — quarantine before a consumer ever sees it.

### 12.8 Schema Registry (Pipelines)  `(#pipeline-schema-registry)`
> [SEE 8.9] The same idea, applied specifically to pipeline data contracts.

**Overview**
- Compatibility modes: Backward, Forward, Full. Registry tools: Confluent,
  Apicurio, AWS Glue Schema Registry.

**Hands-On**
- Prerequisites: the Schema Registry lab from 8.9.
- Setup: local/free — reuse it.
- Simulate the scenario: point your 12.1 CDC pipeline's Kafka topic at the
  same Schema Registry, register a schema for the CDC events, and add a CI
  step (a simple shell script is enough) that runs
  `curl -X POST .../compatibility/subjects/<subject>/versions/latest` with a
  proposed new schema before allowing a merge.
- What to observe: a genuinely breaking schema change getting rejected by that
  CI check before it ever reaches the registry or a real pipeline — enforced
  in CI exactly as the Bridge out instructs, not discovered later by a broken
  downstream consumer.
- Stretch goal: none — this reuses 8.9's registry to make "enforce in CI"
  concrete rather than requiring new infrastructure.

**Bridge out:** enforce in CI — reject a schema PR that breaks compatibility.

### 12.9 Data Lineage  `(#data-lineage)`
> "Where did this specific number actually come from" is otherwise a manual,
> error-prone archaeology project once data has passed through CDC, ETL, streams,
> batch jobs, and a warehouse.

**Overview**
- A traceable graph of where data came from and what transformed it. Tools:
  OpenLineage (an open spec, plugs into Airflow/dbt/Spark), DataHub (LinkedIn-
  born), Apache Atlas (Hadoop ecosystem), Marquez (the OpenLineage reference
  implementation).

**Hands-On**
- Prerequisites: the dbt models from 12.2; Marquez (free, Docker Compose
  official).
- Setup: local/free — Marquez's official Docker Compose (includes its own
  Postgres + web UI).
- Simulate the scenario: configure dbt to emit OpenLineage events on `dbt run`
  (a documented, supported integration) pointed at your local Marquez
  instance. Run your staging and aggregation models from 12.2 and open
  Marquez's UI to view the generated lineage graph.
- What to observe: a visual graph automatically showing which raw table feeds
  which staging model feeds which aggregate — built with zero manual
  documentation, purely from instrumenting the actual `dbt run`. Trace one
  specific number in your aggregate table back to its raw source table using
  only the graph, answering "where did this number come from" the way the
  problem statement describes, but now backed by a real UI instead of memory
  or tribal knowledge.
- Stretch goal: change a column in your raw table's schema and use the
  lineage graph to identify every downstream model that would be affected
  before you make the change — the "impact analysis before a schema change"
  use case from Bridge out, exercised directly.

**Bridge out:** lineage matters most in 3 moments — a GDPR data-subject request,
impact analysis before a schema change, and root-causing a bad metric.

### 12.10 Real-Time Analytics  `(#realtime-analytics)`
> A warehouse's batch-loaded freshness (hourly, daily) isn't fast enough for a
> live "who viewed your profile" or a real-time fraud dashboard.

**Overview**
- Sub-second OLAP directly from streaming sources: Kafka (ingest) → a stream
  engine (Flink/Spark, [SEE 12.3]) → a specialized OLAP store — Apache Pinot
  (user-facing analytics), Apache Druid (time-series OLAP), ClickHouse
  (lightning-fast columnar SQL), or Materialize/RisingWave (streaming SQL with
  incremental materialized views) — → a BI dashboard, sub-second fresh.

**Hands-On**
- Prerequisites: the Kafka lab from 8.2; ClickHouse from 12.5.
- Setup: local/free — reuse both, plus ClickHouse's native Kafka table engine
  (built in, no extra service needed) to consume directly from a topic.
- Simulate the scenario: create a ClickHouse table using the `Kafka` engine
  pointed at your `rides` topic from 8.2, plus a materialized view that
  continuously inserts consumed rows into a regular ClickHouse table. Produce
  a burst of events to the topic and query the materialized table
  immediately after.
- What to observe: query results reflecting events produced just seconds
  earlier, with zero manual "run an ETL job" step — data flows continuously
  from Kafka into a queryable analytical table, the sub-second-fresh claim
  from Overview, measured by timing produce-to-queryable latency yourself.
- Stretch goal: compare this against querying your 12.5 batch-loaded
  warehouse table (populated by a scheduled dbt run) for the same recent
  events — the batch table simply won't have them yet, a direct, felt
  contrast between the two freshness models.

**Bridge out:** closes Module 12. This module produced a live, moving,
distributed system, and now you can't operate what you can't see.

---

## Module 13 — Observability
`(13-observability.html)` — Data Pipelines (Module 12) built a live, moving, distributed system; you can't operate what you can't see.

### 13.1 Logging  `(#logging)`
> Every system built across this course produces events worth recording —
> logging is the most basic way to record them.

**Overview**
- Structured JSON logs, with a specific field schema: `trace_id`, `span_id`,
  `correlation_id`, plus a `context` block (host/region/environment metadata).
  Pipeline: app → shipper (Fluentd/Filebeat) → buffer (often Kafka) → storage/
  search (Elasticsearch, or Splunk/Loki/CloudWatch) → visualization (Kibana) — the
  classic ELK/EFK stack.
- 6 levels, in order: TRACE (method entry/exit, most granular) → DEBUG → INFO →
  WARN → ERROR → FATAL. Sampling strategies at high volume: always sample errors
  (100%), rate-based, priority-based (more for VIP traffic), tail-based (decide
  after seeing the full trace), hash-based (deterministic, for consistent
  cross-service sampling).

**Failure Modes**
- Anti-patterns: logging PII/secrets in plaintext, unstructured string
  concatenation, logging inside a tight loop, logging full request bodies in
  production, missing timestamps.

**Hands-On**
- Prerequisites: Docker Compose (the ELK or EFK stack, free official images).
- Setup: local/free — Elasticsearch + Kibana + Filebeat via a standard
  Compose file (many free reference configs exist for this exact stack).
- Simulate the scenario: write a small app that emits structured JSON logs
  (`{level, trace_id, message, timestamp}`) at INFO and ERROR levels, point
  Filebeat at its log file, and confirm the logs land in Elasticsearch and are
  browsable/searchable in Kibana. Search for `level:ERROR` and confirm only
  error lines return.
- What to observe: unstructured `console.log("user " + id + " logged in")`
  strings being nearly unsearchable in Kibana (you'd need a fragile text
  match), versus structured JSON fields letting you filter precisely on
  `level`, `trace_id`, or any other field — the anti-pattern named above,
  felt directly by trying both side by side.
- Stretch goal: log a fake password field by accident, then write a Filebeat
  processor or Logstash filter that redacts any field named `password` before
  it ever reaches Elasticsearch — a real mitigation for the PII-in-logs
  anti-pattern, not just a warning to avoid it.

**Bridge out:** logs tell you what happened on one machine — metrics tell you
how the system as a whole is behaving in aggregate.

### 13.2 Metrics  `(#metrics)`
> Reading individual log lines to determine "is the system healthy right now" is
> too slow — metrics are the aggregated, numeric view that answers it instantly.

**Overview**
- Collection flow: app + OTel SDK → OTel Collector → Prometheus (a TSDB — time-
  series database, queried via PromQL) → Grafana → PagerDuty/Slack/Email.
  Long-term storage beyond Prometheus's own retention: Thanos or Cortex. Datadog
  is a common commercial alternative to the whole stack.
- Golden Signals (Google SRE): Latency, Traffic, Errors, Saturation. RED (Rate,
  Errors, Duration — service-centric) vs USE (Utilization, Saturation, Errors —
  resource-centric).
- [SEE 1.3] Why p99 beats the average, with concrete numbers: avg=85ms can hide
  p50=50ms, p95=120ms, p99=800ms, **p999=2.5s** — p999 is itself a named Golden
  Signals metric, not just an extension of p99.

**Failure Modes**
- Cardinality explosion: attaching a high-cardinality label (e.g. `user_id`)
  multiplies the number of unique time series by every distinct value it can
  take, which can silently exhaust a metrics backend's memory.

**Hands-On**
- Prerequisites: the Prometheus setup from 6.7; Grafana (free, Docker image).
- Setup: local/free — Prometheus + Grafana via Docker Compose, both official
  free images.
- Simulate the scenario: instrument a small app with request-count and
  latency histogram metrics using an OTel SDK, scrape it with Prometheus, and
  build a Grafana dashboard computing p50/p95/p99 via PromQL
  (`histogram_quantile(0.99, rate(...[5m]))`). Generate load with varying
  latency (some requests artificially slow) and watch the percentiles diverge
  from the average in real time on the dashboard.
- What to observe: your own dashboard reproducing the "avg hides tail pain"
  claim with live numbers, including a real p999 spike whenever you inject an
  artificially slow request — the Golden Signals, on your own graph instead of
  a static example.
- Stretch goal: add a `user_id` label to your request-count metric and
  generate traffic from 10,000 distinct synthetic user IDs — watch
  Prometheus's memory usage and `prometheus_tsdb_head_series` metric climb
  sharply, reproducing cardinality explosion on purpose so you recognize it
  before it happens by accident in production.

**Bridge out:** metrics and logs together still can't answer "which of a dozen
services was the bottleneck for this one request" — that's tracing.

### 13.3 Distributed Tracing  `(#tracing)`
> A single user request can touch a dozen microservices. When it's slow, "which
> one was the bottleneck" is unanswerable from logs or metrics alone, since
> neither knows about the others.

**Overview**
- Trace ID → Spans (one per service/operation) → parent-child relationships → a
  full latency breakdown. Core concepts: Trace, Span, Root Span, Child Span,
  Span Context. Propagation standards: W3C TraceContext, B3, B3 Single (a
  compact single-header Zipkin variant), Jaeger's legacy native format, Baggage
  (carrying arbitrary custom context alongside the trace).
- Backends worth naming: Jaeger, Zipkin, Datadog APM, AWS X-Ray, Grafana Tempo.
  Sampling: Head-Based, Tail-Based, Priority-Based, Rate-Limiting — a practical
  rule of thumb is 100% of errors, 1-5% of successes.

**Failure Modes**
- Async Boundary Propagation: a trace context doesn't survive crossing a queue
  or Kafka topic automatically — it must be explicitly carried: Kafka (a
  `traceparent` header), SQS (message attributes), gRPC (metadata headers), HTTP
  (request headers); a consumer often creates a linked SpanLink rather than a
  strict parent-child span, since producer and consumer aren't in the same
  causal timeframe.

**Hands-On**
- Prerequisites: Docker (Jaeger's official all-in-one image, free); an
  OpenTelemetry SDK for your language.
- Setup: local/free — `docker run -d -p 16686:16686 -p 4317:4317
  jaegertracing/all-in-one`.
- Simulate the scenario: build 3 tiny services (API Gateway → Service A →
  Service B) that call each other over HTTP, each instrumented with an OTel
  SDK exporting to Jaeger, propagating the `traceparent` header on every
  outgoing call. Make a request through the whole chain and view the trace in
  Jaeger's UI (`localhost:16686`).
- What to observe: one trace showing all 3 services as nested spans with
  exact per-service latency — visually identify which of the 3 services is
  the actual bottleneck for a slow request, the specific question named in
  the problem statement, answered directly instead of guessed at from
  separate logs.
- Stretch goal: add a Kafka hop in the middle (Service A publishes an event
  Service B consumes asynchronously) and manually propagate the trace context
  through the message's headers — confirm the trace still connects across the
  queue boundary, and note it shows up as a span link rather than a strict
  parent-child span, exactly as described in Failure Modes.

**Bridge out:** collecting metrics and traces is useless if nobody notices when
they cross a dangerous threshold.

### 13.4 Monitoring & Alerting  `(#monitoring)`
> Alerting on every anomaly means the alerts that matter drown in noise nobody
> trusts anymore.

**Overview**
- Pipeline: metrics → rule engine → alert manager (dedupe, group, silence,
  inhibit related alerts) → routing → a human via PagerDuty, Opsgenie, Grafana
  OnCall, or Prometheus Alertmanager.
- Burn-rate alerting: instead of alerting the instant an SLO is briefly breached,
  alert on how fast the error budget is being consumed — a multi-window approach
  (a short 5-min window plus a long 1-hour window, at 14.4×, 6×, and 1× burn-rate
  thresholds) catches both fast, severe incidents and slow, creeping ones.

**Failure Modes**
- Alert quality: "CPU > 50%" is a bad alert (not actionable on its own); "error
  budget burn rate > 14.4x for 1h" is a good one (specific, tied to real impact).
  Toil budget: if more than 50% of on-call time is spent on repetitive manual
  work instead of fixing root causes, fix the system, not the runbook.

**Hands-On**
- Prerequisites: the Prometheus + Grafana setup from 13.2; Prometheus
  Alertmanager (free, ships alongside Prometheus).
- Setup: local/free — add Alertmanager to your existing Compose stack.
- Simulate the scenario: define 2 alert rules — a bad one (`cpu_usage > 50`,
  fires constantly on any busy moment) and a good one, burn-rate-based
  (error budget consumption over both a 5-min and 1-hour window at a 14.4×
  threshold, per Overview's formula). Generate a brief error spike and a
  longer, low-grade one, and watch which alert fires for which scenario.
- What to observe: the naive CPU alert firing constantly during normal load
  spikes (alert fatigue, exactly as the problem statement describes), while
  the burn-rate alert stays quiet during brief blips but fires clearly once
  sustained error rate would actually exhaust the SLO's error budget — a felt
  difference between a bad and good alert, not just a description of one.
- Stretch goal: configure Alertmanager's grouping/inhibition so that a
  downstream service's alert is automatically suppressed while its known
  upstream dependency is already alerting — reducing 10 correlated pages down
  to 1 actionable one.

**Bridge out:** OpenTelemetry is the one SDK that unifies everything named across
13.2-13.4 into a single instrumentation layer.

### 13.5 OpenTelemetry  `(#opentelemetry)`
> 13.2 and 13.3 each named their own collector — OpenTelemetry is the vendor-
> neutral standard unifying both into one instrumentation layer.

**Overview**
- One SDK for all 3 signals. The API model, by signal: Traces —
  TracerProvider → Tracer → Span; Metrics — MeterProvider → Meter → Instrument
  (Counter, Histogram, Gauge, UpDownCounter); Logs — LoggerProvider → Logger →
  LogRecord.
- Architecture: SDK → OTel Collector (Receivers, Processors, Exporters,
  Connectors) → backends (Jaeger/Tempo, Prometheus, Loki/Elasticsearch, Datadog,
  or New Relic). Instrumentation patterns: auto-instrumentation, manual
  instrumentation, semantic conventions (standardized attribute names like
  `http.method`, `db.system`, `rpc.service`, so different teams' telemetry is
  comparable). Collector deployment patterns: sidecar, gateway, agent + gateway.

**Hands-On**
- Prerequisites: Docker (OTel Collector's official free image); the Jaeger and
  Prometheus setups from 13.2/13.3.
- Setup: local/free — add an OTel Collector container between your app and
  both backends, configured with one Receiver (OTLP) and two Exporters
  (Jaeger for traces, Prometheus for metrics).
- Simulate the scenario: switch your app's instrumentation from talking
  directly to Jaeger/Prometheus to talking only to the OTel Collector via one
  OTLP endpoint. Confirm traces still show up in Jaeger and metrics still show
  up in Prometheus, with zero changes to which backends you're using.
- What to observe: your application code no longer needing to know which
  specific backend it's sending to — swap the Collector's exporter config to
  point at a completely different backend (e.g. add a second Exporter sending
  the same data to a local Zipkin instance) and confirm your app code didn't
  change at all, just the Collector's config — vendor-neutrality, demonstrated
  instead of asserted.
- Stretch goal: add a Processor to the Collector pipeline that drops any span
  with `http.method: GET` on a specific health-check path, reducing noise
  before it ever reaches your trace backend.

**Bridge out:** all this signal needs a first screen a human actually looks at
during an incident.

### 13.6 Dashboards & Visualization  `(#dashboards)`
> Producing signal isn't the same as making it usable during an incident — a
> dashboard is the first screen a human actually looks at.

**Overview**
- 6 design principles: audience-first, top-down drill (summary first, detail on
  demand), time alignment (every panel on the same time window), annotations
  (mark deploys/incidents directly on the graph), visible thresholds, ≤8 panels
  per dashboard.
- The 4 golden dashboards, each answering a different question: Service Health
  (RED — request rate, error rate, p50/p95/p99, active connections),
  Infrastructure (USE — CPU%, memory, disk I/O, network), Dependencies (DB
  latency, cache hit ratio, external API latency, queue depth/lag), Business
  KPIs (orders/min, signup conversion, revenue/min, active users).
- Grafana's Exemplars feature — clicking a metric data point jumps straight to
  the exact trace that produced it.

**Failure Modes**
- Anti-patterns: too many panels, vanity metrics, average-only displays (hides
  p99 pain, [SEE 13.2]), stale dashboards, no drill-down, no context.

**Hands-On**
- Prerequisites: the Grafana setup from 13.2.
- Setup: local/free — reuse it.
- Simulate the scenario: build one "Service Health" dashboard following the
  RED model (request rate, error rate, p50/p95/p99 latency) with exactly 4
  panels, all sharing the same time range control. Add a deploy annotation
  (Grafana supports manual or API-driven annotations) at a specific timestamp,
  then generate a latency spike right after that marker.
- What to observe: the annotation line on the graph making it immediately
  obvious the spike correlates with a deploy — the "annotations mark
  deploys/incidents directly on the graph" principle, working as an actual
  diagnostic aid during a simulated incident, not just a nice-to-have.
- Stretch goal: build a second, deliberately bad dashboard with 20 panels, all
  averages-only, no annotations — then time how long it takes you (or a
  teammate) to spot the same latency spike on each dashboard. The time
  difference is the real cost of the anti-patterns named above.

**Bridge out:** every earlier lesson exists to support this exact moment — an
actual incident, in progress.

### 13.7 Incident Response  `(#incident-response)`
> Every observability lesson before this one exists to support this exact
> moment: an incident, happening right now.

**Overview**
- Structured process: Detect → Triage → Mitigate → Resolve → Postmortem —
  minimize user impact first, learn second, prevent recurrence third. Severity
  levels SEV1-SEV4 calibrate urgency. Key metrics: MTTD, MTTR, MTBF, MTTA (Mean
  Time to Acknowledge). Tools: PagerDuty, Statuspage, Slack/Teams, Jira/Linear,
  Rootly/incident.io, Blameless.
- A blameless postmortem's structure: Summary, Timeline, Root Cause, Impact,
  What Went Well, What Went Wrong, Action Items, Lessons Learned.
- Chaos Engineering ([SEE 11.5]): Chaos Monkey, Litmus, Gremlin, run as scheduled
  Game Days rather than waiting for a real incident to reveal the same weakness.

**Hands-On**
- Prerequisites: everything built across 13.1-13.6 (logs, metrics, traces,
  dashboards, alerts) pointed at the same small multi-service app.
- Setup: local/free — reuse your existing observability stack.
- Simulate the scenario: run a self-directed "Game Day" — inject a real fault
  (kill a downstream dependency container, or add artificial latency with
  `tc netem`) without telling yourself in advance exactly when, then walk the
  full Detect → Triage → Mitigate → Resolve sequence using only your
  dashboards, alerts, logs, and traces (no looking at the container logs
  directly as a shortcut). Time how long detection takes (did an alert fire?),
  and how long triage takes using traces to find the actual failing
  dependency.
- What to observe: whether your own observability setup from the earlier
  lessons in this module was actually sufficient to diagnose a real, injected
  failure without cheating — any gap you find (a missing alert, a dashboard
  that doesn't show the right signal) is a direct, concrete lesson for what's
  still missing.
- Stretch goal: write a real blameless postmortem for the incident you just
  ran, following the Summary/Timeline/Root Cause/Impact/Action Items structure
  from Overview — practice the artifact, not just the response.

**Bridge out:** closes Module 13. You now know what every piece of the system
is — the last gap is how big, how fast, how much each piece actually costs and
holds.

---

## Module 14 — Key Numbers
`(15-key-numbers.html)` — you now know what every piece of the system is; this module is how big, how fast, and how much each piece actually costs.

### 14.1 Latency Numbers  `(#latency-numbers)`
> Every "why X is fast/slow" explanation across this course referenced numbers
> without formally memorizing them.

**Overview**
- A logarithmic scale spanning roughly 8 orders of magnitude, anchored by named
  operations: branch mispredict (~3ns), mutex lock/unlock (~17ns), compress 1KB
  via Snappy (~3µs), an SSD read (~100µs), an HDD seek (~10ms), a cross-region
  network round trip (~100ms+).
- Network latency breakdown, with real ranges: DNS lookup 20-120ms, TCP
  handshake ~1 RTT (14-100ms), TLS handshake ~1-2 RTT (28-200ms).

**Metrics**
- Rules of thumb: fast (<1ms), medium (1-10ms), slow (10-100ms), very slow
  (>100ms). Memory is roughly 100× faster than SSD, SSD roughly 100× faster than
  HDD, local roughly 1,000× faster than cross-continent.

**Hands-On**
- Prerequisites: none — every number here is measurable on your own laptop.
- Setup: none.
- Simulate the scenario: write a tiny benchmark measuring 4 of the named
  operations directly: a mutex lock/unlock in a tight loop (average the time
  over 1M iterations), an SSD read of a small file you haven't touched
  recently (clear the OS page cache first if you can, or use a large enough
  file), an HDD seek if you have access to one (or skip and use the reference
  number), and a network round trip to a server in a different region (`curl
  -w "%{time_total}"` against a site hosted far from you).
- What to observe: your own measured numbers landing in the same order of
  magnitude as the reference numbers in Overview — the point isn't matching
  exactly, it's confirming the roughly-100×-per-tier pattern (RAM → SSD → HDD
  → network) holds on real, current hardware, not just in a memorized table.
- Stretch goal: measure a cross-region round trip to 3 different regions
  (e.g. via 3 different free-tier cloud regions' health-check endpoints) and
  compare against the geographic distance — confirm latency roughly tracks
  distance, bounded below by the speed of light in fiber.

**Bridge out:** these numbers are the direct input to Back-of-Envelope
Estimation (14.4) — you can't budget a system's latency without knowing what
each component actually costs.

### 14.2 Throughput Numbers  `(#throughput-numbers)`
> 14.1 covered how long one operation takes — this is how many operations per
> second a component can sustain.

**Overview**
- Relative-scale comparison across Redis, Memcached, Kafka, NGINX, Cassandra,
  gRPC, Elasticsearch, MongoDB, Postgres, S3. Concrete per-system ceilings worth
  memorizing: DynamoDB's per-partition limits (3,000 RCU, 1,000 WCU); S3's
  per-prefix limit (5,500 GET/sec or 3,500 PUT/sec).
- Connections per server, by concurrency model: event-driven (NGINX, Node.js,
  Netty — the most per server), lightweight threads (Go goroutines, Erlang
  processes at 1M+, Rust async/tokio at 500K-1M, Java virtual threads at
  100K-1M), OS threads (Java platform threads, Python's GIL-bound threads, C++ —
  the fewest per server).

**Hands-On**
- Prerequisites: `redis-benchmark`, and any Postgres client; `hey` or `k6`.
- Setup: local/free — reuse your Redis and Postgres containers from earlier
  labs.
- Simulate the scenario: run `redis-benchmark -q` with defaults and note the
  reported ops/sec for SET/GET. Then run an equivalent sustained write
  benchmark against Postgres (a simple script doing 100,000 single-row
  inserts) and compute its inserts/sec. Compare both against the relative-scale
  comparison in Overview.
- What to observe: your own two throughput numbers landing in roughly the
  expected relative order (Redis dramatically higher than a single-writer
  Postgres insert loop) — a felt, measured version of the abstract comparison
  table instead of trusting the ordering blindly.
- Stretch goal: batch the Postgres inserts (a single multi-row `INSERT` or a
  transaction wrapping 1,000 inserts) and remeasure — quantify how much
  throughput a simple batching change buys you, directly connecting back to
  [SEE 1.7]'s I/O-bound concurrency lesson.

**Bridge out:** the concurrency model a technology uses ([SEE 1.7], 2.11) directly
predicts its connections-per-server ceiling.

### 14.3 Storage & Size Estimation  `(#storage-numbers)`
> This module's third estimation axis — how much space something actually takes.

**Overview**
- Common data sizes as anchors: a tweet (~140B), a chat message (~500B), a rich
  user profile (~5-10KB), an email (~50KB), a web page (~2-5MB), a search index
  entry (~500B-2KB).
- Storage hierarchy from L1 cache to Glacier, mapped by capacity, speed, cost per
  GB ([SEE 6.9]'s S3 tiers implement this concretely for object storage).
- The Rule of 72: doubling time in periods — `72 ÷ growth%` — a fast mental-math
  way to estimate when a dataset or user base will double at a given growth rate.

**Hands-On**
- Prerequisites: none — a pure estimation exercise.
- Setup: none.
- Simulate the scenario: pick a real product you use (say, a note-taking app
  with 10M users), estimate its total stored data using only the anchors from
  Overview (average note size × notes per user × user count), then apply the
  Rule of 72 to estimate how long until that storage doubles at a stated 15%
  monthly growth rate (`72 ÷ 15 ≈ 4.8 months`).
- What to observe: whether your estimate, built entirely from memorized
  anchors and one mental-math formula, lands in a sane order of magnitude —
  the actual interview skill this lesson is training, checked against your own
  reasoning instead of a worked example you didn't produce yourself.
- Stretch goal: redo the estimate assuming the average note size is 10× larger
  (say, notes now include embedded images) and recompute both total storage
  and the doubling timeline — practicing how a single changed assumption
  cascades through the whole estimate.

**Bridge out:** feeds directly into Back-of-Envelope Estimation's storage
formulas.

### 14.4 Back-of-Envelope Estimation  `(#estimation)`
> [SEE 1.1] The single most critical system-design-interview skill — this lesson
> is what the framework's 5-minute estimation step actually contains.

**Overview**
- Core formulas chain together: Users → DAU (Total → DAU%, typically 10-30%) →
  RPS → per-request cost → total server count.
- The 80/20 rule / working-set formula: working set ≈ 20% of total data, and a
  cache hit-rate target of 95-99% follows directly from that — most traffic hits
  a small hot fraction of the data.
- 6 archetypal systems worked as calibration anchors: Social Media Post, Chat
  Message, Video Upload, Search Query, E-commerce Order, Ride-Sharing (with a
  concrete number worth knowing — a location ping is roughly 200B).
- Powers of 2 (storage: 2¹⁰=1KB, 2²⁰≈1MB, 2³⁰≈1GB, 2⁴⁰≈1TB, 2⁵⁰≈1PB) and powers of
  10 (traffic: 10¹-10⁶ RPS, each with a real-world analogy — e.g. 10⁴ RPS is
  "Slack-scale," 10⁵ RPS is "Twitter-scale," 10⁶ RPS is Google Search).

**Hands-On**
- Prerequisites: none.
- Setup: none — this is a timed estimation drill.
- Simulate the scenario: set a 5-minute timer and estimate the full RPS and
  storage/year for a food-delivery app with 50M total users, 20% DAU, 3 orders
  per active user per day, each order averaging 5KB of stored data. Chain the
  formulas exactly as listed in Overview: Users → DAU → RPS → storage/year.
  Write down every intermediate number, not just the final answer.
- What to observe: whether you can complete the full chain within 5 minutes
  without looking anything up — the actual constraint named in the Bridge out.
  Compare your RPS estimate against the "10⁴ RPS is Slack-scale" anchor from
  the powers-of-10 table to sanity-check whether your number is even in a
  plausible range.
- Stretch goal: redo the same estimate assuming DAU triples (a viral growth
  event) and recompute every downstream number — practicing how a single
  changed assumption cascades through the whole chain, the real skill an
  interviewer is testing when they ask "what if traffic 10×'d overnight."

### 14.5 Cost Estimation  `(#cost-numbers)`
> Sizing the system in servers and storage means nothing without converting it
> into an actual dollar figure.

**Overview**
- Pricing anchors: EC2 instance types, Lambda, Fargate (serverless containers),
  S3 tiers, EBS (gp3) and EFS, RDS, ElastiCache, CloudFront, SQS, MSK (managed
  Kafka).
- Worked monthly cost breakdowns for a chat app, a video platform, and an
  e-commerce site, each showing which component dominates the bill — a general
  rule of thumb: bandwidth > compute > storage in cost, with typical splits of
  60-70% CDN for video/media, 50-60% compute for CRUD apps, 40-50% storage for
  data platforms.
- Cost optimization levers: Reserved Instances (30-60% savings), Spot Instances
  (60-90% savings, fits fault-tolerant batch work), Right-Sizing (20-40% savings).

**Hands-On**
- Prerequisites: an AWS account (free tier or the pricing calculator, which
  needs no account at all).
- Setup: local/free — AWS's public Pricing Calculator (calculator.aws), no
  signup required.
- Simulate the scenario: price out the food-delivery app's estimated
  infrastructure from 14.4's lab using the real Pricing Calculator — pick EC2
  instance types for your estimated server count, an RDS instance for storage,
  and CloudFront for any media, then get a real monthly dollar total. Compare
  On-Demand pricing against the same setup with Reserved Instances applied.
- What to observe: which single line item dominates the total bill — check it
  against the "bandwidth > compute > storage" rule of thumb from Overview and
  see if your specific app's numbers actually match that ordering, or deviate
  (a chat app with little media might have compute dominate instead).
- Stretch goal: reprice the batch-processing piece of the estimate (if
  applicable) using Spot Instances instead of On-Demand and quantify the
  savings percentage against the 60-90% range named in Overview.

**Bridge out:** cost awareness is what separates a senior design from a junior
one — being able to say "this costs $X/month more, and here's why it's worth it"
demonstrates the same judgment as picking the right database, applied to money.

### 14.6 SLA Math & Availability  `(#sla-math)`
> [SEE 1.3] "Nines" were introduced as a concept — this is the full arithmetic
> behind combining them across a real multi-component architecture.

**Overview**
- Serial components multiply their availabilities (`A_total = A1 × A2` — a
  chain is only as strong as its weakest link, and every serial addition makes
  the system *less* available); parallel/redundant components combine as
  `1 - (1-A1)(1-A2)` — redundancy actively improves availability.
- A worked 3-tier composite example: Load Balancer 99.99%, App Servers ×3 in
  parallel, DB Primary+Replica in parallel, Redis HA 99.99% → a composite around
  99.98%, computed by applying both formulas across the actual dependency graph.
- Error budget = `1 - SLO` — the amount of unreliability explicitly allowed
  before breaching target, and exactly what [SEE 13.4]'s burn-rate alerting
  tracks the consumption of.

**Hands-On**
- Prerequisites: none — a pure arithmetic exercise, ideally checked with a
  script.
- Setup: none.
- Simulate the scenario: compute the exact composite availability for a
  5-component chain: Load Balancer 99.99%, App Servers ×3 in parallel (each
  99.9%), DB Primary+Replica in parallel (each 99.95%), Redis HA 99.99% — apply
  the parallel formula first to collapse each redundant group into one
  effective availability, then multiply the results in series exactly as
  Overview describes.
- What to observe: your computed composite landing close to the "~99.98%"
  figure cited in Overview — if it doesn't, that's a sign you applied a
  formula in the wrong order (parallel groups must collapse before the serial
  multiplication, not after).
- Stretch goal: recompute assuming the App Server tier has only 1 instance
  instead of 3 in parallel, and quantify exactly how much composite
  availability that single point of failure costs the whole system — a
  numeric answer to "how much does redundancy actually buy you here."

**Bridge out:** none forward directly.

### 14.7 Interview Quick Reference  `(#interview-reference)`
> The distilled, memorizable summary of every category of number this module
> covered.

**Overview**
- The 20 anchor numbers, in 4 categories: Latency, Throughput, Storage, Cost &
  SLA. 6 derivation-pattern shortcuts: RPS Calculation, Storage Sizing, Server
  Count, Cache Sizing, Bandwidth, Quick Cost. 3 mnemonics: "The 100× Rule"
  (storage-tier speed multipliers), "The 1000× Rule" (data-unit scaling), "The
  Time Rule" (seconds-per-period mental math).
- Sanity checks worth memorizing as a final gut-check: social media apps run
  100K+ RPS, typical SaaS runs 1-10K RPS; anything over 1PB/year needs tiered
  storage; a healthy utilization target is 60-70%.

**Bridge out:** closes Module 14. With every concept and every number in hand,
the only thing left is turning a requirement into a choice.

---

## Module 15 — Decision Guides
`(16-decision-flowcharts.html)` — the capstone: given a requirement, which of everything in Modules 1-14 do you actually pick?

### 15.1 Which API Style?  `(#api-choice)`
> APIs & Communication taught REST, gRPC, and GraphQL individually — this is the
> decision tree that picks between them for a given requirement.

**Overview**
- Branches on audience (public vs internal), data shape (fixed vs highly
  variable), and performance needs: REST for public/simple, gRPC for internal/
  high-performance, GraphQL for highly variable client data needs. [SEE 3.1, 3.2,
  3.3] for the full reasoning behind each branch.

**Bridge out:** none — this module is a set of parallel, independent capstone
decision trees, not a sequential narrative.

### 15.2 Which Database?  `(#db-choice)`
> [SEE 6.3] The same decision as the Database Choice Guide, framed as a
> flowchart for quick recall.

**Overview**
- Branches first on "need ACID?", then on access pattern, consistency needs, and
  scale, routing to specific named products: Postgres (ACID, relational),
  Cassandra/ScyllaDB (wide-column, huge write throughput), MongoDB (flexible
  document schema), Redis/DynamoDB (key-value, fastest point lookups), Neo4j
  (graph, relationship-heavy queries), Elasticsearch (search/full-text), Spanner
  (global ACID at scale).

**Bridge out:** every branch traces back to a specific storage-engine trade-off
already explained in Module 6.

### 15.3 Queue vs Stream vs Pub/Sub  `(#messaging-choice)`
> [SEE 8.4] The same decision as prose, condensed to a lookup.

**Overview**
- 6 named technologies compared by model/ordering/retention/best-for: SQS (FIFO
  optional, 14-day max retention, task distribution), Kafka (partition-ordered,
  configurable retention, event streaming), RabbitMQ (exchange routing, per-queue
  FIFO, complex routing/priority/RPC), Redis Pub/Sub (fire & forget, zero
  persistence, typing indicators/cache invalidation), SNS + SQS (fan-out into
  per-subscriber queues, event notifications), NATS (Pub/Sub + JetStream,
  stream-ordered, IoT/lightweight microservice messaging). The SNS → SQS →
  Lambda pattern is the common combined answer when you need both fan-out and
  reliable per-branch processing.

**Bridge out:** use this lesson for fast recall, 8.4 for the full explanation.

### 15.4 Which Caching Strategy?  `(#cache-choice)`
> [SEE 7.1] The same 5 patterns, as a quick-reference decision tree.

**Overview**
- Branches on read/write ratio and consistency needs, routing to Cache-Aside,
  Read-Through, Write-Through, Write-Back, or Write-Around — the same 5 named
  strategies 7.1 covers in depth, with the same decision criteria: does the app
  need to control cache logic, is strong consistency required, is this write-
  rarely-read-later data.

**Bridge out:** [SEE 7.1] for the full reasoning; this lesson is the fast path.

### 15.5 Which Real-Time Tech?  `(#realtime-choice)`
> [SEE 3.14] The same comparison, condensed.

**Overview**
- 6 named technologies with their latency ceilings: WebSocket (<50ms), SSE
  (<100ms), gRPC Streaming (<10ms, 4 modes), Long Polling (100-1000ms), WebRTC
  (<100ms, peer-to-peer via STUN/TURN), MQTT (<50ms, lightweight pub/sub for
  IoT) — plus Webhook as the server-to-server branch.

**Bridge out:** [SEE 3.14] for the full decision matrix and failure-scenario
comparison.

### 15.6 How to Scale?  `(#scaling-choice)`
> The whole of Scalability (Module 10) taught the individual tools — this is the
> decision tree for which tool addresses which bottleneck.

**Overview**
- Branches on bottleneck type: reads → caching, CDN, or read replicas; writes →
  sharding, partitioning, or a write-behind cache; both → some combination of all
  of the above. The first branch worth checking before any of these: can a
  bigger machine handle it (vertical) before reaching for horizontal tools at all.

**Bridge out:** correctly diagnosing *which* resource is the actual bottleneck is
the real skill — the tool choice that follows is close to mechanical once the
diagnosis is right.

### 15.7 More Decision Flowcharts  `(#more-decisions)`
> Ties together threads from across several earlier modules into 3 final,
> standalone decision points.

**Overview**
- Sync vs Async ([SEE 3.4]): choose based on whether the caller needs the result
  immediately, can be notified later via Task Queue, or needs Pub/Sub for
  multiple consumers.
- Monolith vs Microservices ([SEE 5.2]'s API Gateway origin story): a 4-point
  spectrum, not a binary choice — Monolith → Modular Monolith → SOA/Mini-services
  → Microservices, chosen based on team size, deployment independence needs, and
  operational maturity.
- SQL vs NoSQL ([SEE 6.3]-[SEE 6.5]): the same database decision as 15.2,
  reframed with NoSQL's 3 named sub-branches spelled out again — Wide-Column,
  Document, Key-Value — as the single most common real-world question teams
  actually ask.

**Bridge out:** none — this is the last lesson in the course. Every decision in
this final module is a lookup into a trade-off already explained in depth; the
value here is speed of recall under pressure, not new information.
