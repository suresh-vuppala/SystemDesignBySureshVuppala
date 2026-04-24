# Google Senior SWE (L5) Interview Checklist
### C++ Engineer Edition — Full Preparation Guide

> **How to use this:** Work through each section sequentially during your prep. Tick boxes as you become confident, not just when you've read about them. The iPad + screenshare tip is addressed in each round.

---

## Table of Contents
1. [Mindset & The L5 Bar](#1-mindset--the-l5-bar)
2. [Coding Rounds — DSA Deep Dive](#2-coding-rounds--dsa-deep-dive)
3. [Coding Rounds — Systems Thinking (L5 Differentiator)](#3-coding-rounds--systems-thinking-l5-differentiator)
4. [System Design Round](#4-system-design-round)
5. [Googliness & Leadership Round](#5-googliness--leadership-round)
6. [iPad + Screenshare Strategy](#6-ipad--screenshare-strategy)
7. [Weekly Prep Routine](#7-weekly-prep-routine)
8. [Process & Logistics](#8-process--logistics)
9. [Negotiation Checklist](#9-negotiation-checklist)

---

## 1. Mindset & The L5 Bar

The single most important shift: at L4 you are expected to **solve the problem**. At L5 you are expected to **own the problem** — edge cases, production concerns, scalability, and clarity of communication are all on you without prompting.

- [ ] Understand that "solving" the base problem is **table stakes**, not the win
- [ ] Know that Google uses a **packet system** — multiple interviewers submit independent feedback; one weak signal can tip a borderline hire to a no-hire
- [ ] Internalize that **clarity of thinking > clever code** — a well-reasoned brute force beats a bug-ridden optimised solution
- [ ] Accept that Google's problem statements are **intentionally vague** — navigating ambiguity IS part of the signal
- [ ] Do not wait for the interviewer to prompt you on edge cases, complexity, or trade-offs — proactively surface them

---

## 2. Coding Rounds — DSA Deep Dive

### 2.1 Before You Write a Single Line

- [ ] **Re-read the problem** aloud in your own words and confirm with the interviewer
- [ ] **Type all constraints** into the shared doc immediately — do not rely on verbal memory
- [ ] Manually trace through the given example(s) step by step
- [ ] Identify **what kind of problem this is** (graph, DP, interval, trie, etc.) before committing to an approach
- [ ] State the brute-force approach first, its time/space complexity, then propose the optimisation
- [ ] Get **explicit interviewer buy-in** on your approach before coding — saves you from a total rework at minute 25
- [ ] Ask: *"Are there constraints on memory?"* and *"Can input values be negative / zero / empty?"*

### 2.2 While Coding (C++ Specifics)

- [ ] Use **descriptive variable names** — `adjacencyList`, not `adj` or `a`
- [ ] Use **STL correctly and intentionally**:
  - `unordered_map` for O(1) average lookup — mention amortised caveat
  - `map` when you need sorted order (e.g., interval problems)
  - `priority_queue` for heaps (min-heap: `priority_queue<int, vector<int>, greater<int>>`)
  - `deque` for sliding window problems needing front/back access
  - `bitset` for bitmask DP when set is dense
- [ ] **No raw pointers** unless absolutely necessary — prefer references, `unique_ptr`, or `shared_ptr`
- [ ] Write **modular code**: separate traversal logic from comparison/business logic into named helper functions
- [ ] For recursive solutions, clearly define your **base case first** before the recursive case
- [ ] Leave `// TODO: optimise this to O(n) using monotonic stack` style comments for deferred improvements — shows awareness
- [ ] **Never use `using namespace std;`** in interviews — it signals sloppiness

### 2.3 High-Frequency Google L5 Patterns

Master these patterns, not just individual problems:

#### Trees & Graphs
- [ ] DFS (recursive and iterative with explicit stack) — know both
- [ ] BFS with level tracking — not just "visited", but level-by-level state
- [ ] Topological sort (Kahn's BFS and DFS-based) — dependency resolution
- [ ] Cycle detection in directed and undirected graphs
- [ ] Lowest Common Ancestor (LCA) — binary lifting for large trees
- [ ] Diameter of a tree — two-pass DFS pattern
- [ ] Graph coloring / bipartite checking

#### Tries (Prefix Trees) — L5 Favourite
- [ ] Implement insert, search, starts-with from scratch in C++
- [ ] Wildcard / regex matching on a Trie
- [ ] Trie with frequency counts (autocomplete)
- [ ] **Systems extension (L5 only):** How would you serialize a Trie to disk?
  - Answer: Flatten into a Sorted String Table (SSTable) or use DFS pre-order with null markers
- [ ] **Distributed extension:** How would you partition a Trie across nodes in a cluster?
  - Answer: Hash-based partitioning on the first N characters; each shard handles a prefix range

#### Dynamic Programming
- [ ] Memoisation (top-down) vs tabulation (bottom-up) — know when each is preferable
- [ ] DP on intervals (matrix chain multiplication, burst balloons)
- [ ] DP on subsets / bitmask DP
- [ ] DP on trees (re-rooting technique)
- [ ] String DP: edit distance, LCS, palindromic substrings

#### Sliding Window & Two Pointers
- [ ] Fixed-size sliding window (max/min in window)
- [ ] Variable-size window with a condition (at most K distinct, longest without repeat)
- [ ] Two pointers on sorted arrays (pair sum, container with most water)
- [ ] Monotonic stack/queue — running max/min in O(n)

#### Intervals
- [ ] Merge overlapping intervals
- [ ] Insert interval into sorted list
- [ ] Meeting rooms II (minimum number of conference rooms)
- [ ] Sweep line technique for area/coverage problems

#### Heaps
- [ ] Top-K elements (min-heap of size K)
- [ ] Merge K sorted arrays / lists
- [ ] Median of a data stream (two heaps)
- [ ] Task scheduler with cooldown

#### Strings & Hashing
- [ ] Rolling hash (Rabin-Karp) for substring matching
- [ ] KMP for pattern matching
- [ ] Anagram / permutation detection with frequency arrays
- [ ] Group anagrams using sorted key or prime hash

### 2.4 The Last 5 Minutes

- [ ] Dry-run your code with the interviewer's **original example** line by line
- [ ] Introduce **your own edge case** and trace it — don't wait to be asked
  - Empty input, single element, all-same elements, maximum constraint (stress test)
- [ ] State **time complexity** with reasoning: not just "O(n log n)" but "we sort once which costs O(n log n), then each query is O(log n) with binary search"
- [ ] State **space complexity** including recursion stack depth for recursive solutions
- [ ] Mention what you would do **differently in production**: input validation, logging, testing strategy

---

## 3. Coding Rounds — Systems Thinking (L5 Differentiator)

> This is the section that separates L4 from L5 at Google. You will be given what looks like a pure DSA problem, but you are expected to **think beyond the algorithm** into how it runs at scale.

### 3.1 The Mental Model

For every coding problem, after solving it algorithmically, ask yourself:

- [ ] **If input is 10TB, what breaks?** — Your in-memory structure won't fit; think external merge sort, disk-based trie, chunked processing
- [ ] **If this runs on 1000 machines, how do I partition work?** — Hashing, range partitioning, or broadcast?
- [ ] **If a node crashes mid-job, what do I lose?** — Checkpoint state, idempotency, at-least-once vs exactly-once
- [ ] **How do I test this in production?** — Unit testable? Can I inject faults? Is the logic deterministic?
- [ ] **What is the hot path and how do I cache it?** — Memoisation at function level maps to caching at service level

### 3.2 Pattern: In-Memory → Distributed

Practice converting these in-memory structures to distributed equivalents:

| In-Memory (DSA) | Distributed Equivalent | What to Say |
|---|---|---|
| HashMap | Distributed KV store (Redis, Bigtable) | Sharding strategy, replication factor |
| Sorted array | SSTable / LSM tree | How writes are batched and merged |
| Trie | Prefix-partitioned shards | Each shard owns a prefix range |
| Graph adjacency list | Edge-cut or vertex-cut partitioning | Trade-off: edge-cut for low-degree, vertex-cut for high-degree graphs |
| Priority Queue | Distributed scheduler | Coordinator node aggregates per-shard min-heaps |
| BFS queue | Message queue (Pub/Sub, Kafka) | Workers pull from queue, mark visited in shared store |

### 3.3 Pattern: Algorithm → Production Code

When writing code, proactively mention:

- [ ] **Idempotency:** If my `processFile()` function is called twice on the same input, is the result the same? How do I ensure that?
- [ ] **Error handling:** What happens if `checksum()` fails? I'd return an error code and log to the audit trail, not silently continue
- [ ] **Retry logic:** For network calls inside algorithms (e.g., fetching chunks), mention exponential backoff
- [ ] **Observability:** "In production I'd add a counter here for `files_processed` and emit a latency histogram per chunk"
- [ ] **Rate limiting:** Token Bucket or Leaky Bucket — know the difference and when to use each
  - Token Bucket: allows bursts up to bucket size; good for egress control
  - Leaky Bucket: smooths output to a constant rate; good for protecting downstream services

### 3.4 Specific L5 Coding Signals to Demonstrate

- [ ] When doing **tree traversal**, mention how you'd serialize state to resume after a crash (byte-offset checkpointing for files, node ID + depth for trees)
- [ ] When doing **graph problems**, mention what happens with very large sparse graphs — adjacency list vs compressed sparse row (CSR) format
- [ ] When doing **string matching**, mention how Rabin-Karp maps to distributed log grep (sliding window hash over chunks)
- [ ] When doing **sorting**, mention external merge sort for datasets larger than RAM
- [ ] When doing **DP**, mention how memoisation maps to a distributed cache with TTL and eviction policy
- [ ] When doing **BFS on a graph**, mention MapReduce graph traversal (each round is one map-reduce pass expanding the frontier)

### 3.5 C++ Production Code Patterns

- [ ] Write functions that return `std::optional<T>` or error codes instead of throwing exceptions in performance-critical paths
- [ ] Mention `const` correctness — pass large structures by `const&`, not by value
- [ ] For concurrent extensions: mention `std::mutex`, `std::atomic`, and lock-free data structures (read-copy-update)
- [ ] Know how `std::vector` reallocation works and when to `reserve()` upfront for performance
- [ ] For file I/O mentions: know `mmap` for large files, buffered vs unbuffered reads

---

## 4. System Design Round

### 4.1 The First 5–10 Minutes: Requirements

- [ ] **Never assume scope** — the problem is intentionally vague; drive the scoping
- [ ] Ask: *"Who are the users and what is the primary use case?"*
- [ ] Ask: *"What is the expected scale — QPS, data volume, number of users?"*
- [ ] Ask: *"What are the consistency requirements — is eventual consistency acceptable?"*
- [ ] Ask: *"Are there regulatory constraints — GDPR, data residency, audit logs?"*
- [ ] Separate **functional requirements** (what the system does) from **non-functional** (latency, availability, durability)
- [ ] Define your **out-of-scope** explicitly — "I will not cover billing or auth in this session"

### 4.2 Estimation (Scale Dictates Tech)

- [ ] **Do the math before picking a stack** — let numbers justify choices
- [ ] Compute: QPS at peak, storage per day/year, bandwidth required
- [ ] Identify the **primary bottleneck**: storage, compute, network, or latency?
- [ ] Example estimation for a migration service:
  - 100 Mbps cap → 12.5 MB/s → ~1.08 TB/day → 1 PB takes ~925 days at single stream
  - Conclusion: need parallel streams or physical appliance for bulk; this service is only viable for incremental sync
- [ ] Know rough numbers by heart:
  - SSD read: ~0.1ms | Network round trip: ~1ms | HDD seek: ~10ms
  - 1 Gbps = 125 MB/s | 1 TB = 10^12 bytes
  - A commodity server: ~64 cores, ~512 GB RAM, ~20 TB SSD

### 4.3 Core Architecture

- [ ] Define **entities and schema first** — what are the core objects and their relationships?
- [ ] Justify **every database choice**:
  - Relational (Spanner, PostgreSQL): ACID transactions, strong consistency, complex joins
  - Wide-column (Bigtable, Cassandra): time-series, write-heavy, known access patterns
  - Document (Firestore): flexible schema, hierarchical data
  - In-memory (Redis, Memcache): caching hot paths, ephemeral state
- [ ] Design the **API surface** before internal components — it clarifies contracts
- [ ] For Google Docs: write the design **textually as a flow** — no whiteboard available; document your reasoning as you speak so the interviewer can reference it in their feedback

### 4.4 Deep Dives & Trade-offs

#### Reliability & Resiliency
- [ ] **Checkpointing:** How does the system resume after a failure?
  - File migration: byte-level offset stored in metadata DB, not just file-level
  - Distributed job: task IDs with status (PENDING / IN_PROGRESS / DONE / FAILED)
- [ ] **Idempotency:** Can operations be safely retried without side effects?
- [ ] **Circuit breakers:** Prevent cascade failures when a downstream service is degraded
- [ ] **Dead letter queues:** For messages/tasks that fail after N retries

#### Data Integrity
- [ ] **Checksums:** CRC32 / SHA-256 verified post-write — who verifies and how?
- [ ] **At-least-once vs exactly-once delivery** — know the trade-offs
- [ ] **Deduplication:** How do you detect and reject duplicate writes?

#### Scale & Performance
- [ ] **Sharding strategy:** Range vs hash partitioning; hot-spot risk with range
- [ ] **Read replicas:** For read-heavy workloads; discuss replication lag implications
- [ ] **Caching layers:** What do you cache, for how long, and how do you invalidate?
- [ ] **Async processing:** What can be offloaded to a queue vs must be synchronous?
- [ ] **Throttling:** Token Bucket for egress; rate limits per tenant

#### Observability
- [ ] Metrics: latency (p50/p99), error rate, throughput, queue depth
- [ ] Tracing: distributed trace IDs across service boundaries
- [ ] Alerting: SLOs, burn rate alerts, not just raw metric thresholds

### 4.5 Topics to Be Fluent In

- [ ] Consistent hashing — how it minimises reshuffling when nodes are added/removed
- [ ] CAP theorem — what it actually means in practice (not just the theorem)
- [ ] LSM trees and SSTables — how LevelDB / RocksDB works under the hood
- [ ] Kafka / Pub-Sub — partitioning, consumer groups, at-least-once guarantees
- [ ] MapReduce — map phase, shuffle/sort phase, reduce phase; when it applies
- [ ] Two-phase commit vs Saga pattern for distributed transactions
- [ ] Bloom filters — probabilistic membership testing, false positive rate
- [ ] GDPR-aware design — soft delete, data deletion propagation, right to erasure

---

## 5. Googliness & Leadership Round

### 5.1 What Google Actually Wants at L5

This is **not** a culture-fit check. Google wants evidence that you can:
- Lead through **influence without authority**
- Navigate **ambiguity** and make decisions with incomplete information
- Maintain **engineering rigour** under pressure
- Act with **integrity** even when it's unpopular

### 5.2 Your Story Bank (Prepare 6–8 Stories)

Each story must be **specific, complex, and evidence-based**. Generic answers ("I am a good communicator") are red flags.

- [ ] **Story 1 — Resolving cross-team conflict:** A disagreement between teams on technical approach; how you found common ground
- [ ] **Story 2 — Leading without authority:** A project that was stalling; how you drove it forward without being the manager
- [ ] **Story 3 — Pushing back on a bad decision:** A time you disagreed with leadership or stakeholders and how you handled it
- [ ] **Story 4 — Helping someone grow:** A junior engineer or teammate you unblocked, mentored, or advocated for
- [ ] **Story 5 — Ambiguity and shifting requirements:** Requirements changed mid-project; how you adapted without losing quality
- [ ] **Story 6 — Integrity under pressure:** A time you chose the right thing over the expedient thing
- [ ] **Story 7 — User/customer impact:** A time you advocated for the user even when internal priorities said otherwise
- [ ] **Story 8 — Failure and recovery:** A time something went wrong and what you specifically changed as a result

### 5.3 STAR+ Framework for L5

| Component | What to include | L5 Nuance |
|---|---|---|
| **Situation** | Stakes, constraints, who was involved | Keep this brief — 2-3 sentences max |
| **Task** | Your specific ownership, not the team's | Use "I" not "we" |
| **Action** | Your decisions and reasoning | Explain *why* you chose that path |
| **Result** | Quantified impact | Latency, incidents avoided, velocity, revenue |
| **Reflection** *(L5 addition)* | What you learned and how you changed | This is the growth mindset signal |

- [ ] Every story has a quantified result (even approximate: "reduced deploy time by ~40%")
- [ ] Every story has a reflection — what you would do differently, or how this changed your approach
- [ ] Stories are drawn from **real complexity** — not trivial wins but genuine hard problems

### 5.4 Values to Thread Into Your Answers

- [ ] **User-first:** "My deciding factor was what would be least disruptive for the end user"
- [ ] **Intellectual humility:** "I was wrong about X, and here's how I updated my view"
- [ ] **High standards:** "I pushed back because I knew we'd pay technical debt in 6 months"
- [ ] **Collaborative:** "I brought in the other team early rather than presenting a fait accompli"

---

## 6. iPad + Screenshare Strategy

> Using your iPad paired with your laptop screenshare is a strong setup — but only if used deliberately. Here's how to make it a signal amplifier, not a distraction.

### 6.1 Setup Checklist (Do Before Every Mock)

- [ ] iPad is mirrored to your laptop via Sidecar (Apple) or a casting app — test this works smoothly
- [ ] Screenshare shows your **laptop screen only** — not the iPad; the iPad is your scratchpad
- [ ] Apple Pencil (or stylus) is charged and paired
- [ ] Notes app or GoodNotes is open on iPad in a blank page, ready to draw
- [ ] Laptop has the shared Google Doc / coding environment open and visible

### 6.2 How to Use iPad During Each Round

#### Coding Rounds
- [ ] Use iPad to **sketch data structures** before coding — draw the tree, graph, or trie by hand first
- [ ] Draw your **worked example trace** on the iPad as you talk through it — visual aids help interviewers follow your logic
- [ ] Sketch the **before/after state** of your data structure as the algorithm runs — especially for in-place modifications
- [ ] When explaining time complexity, draw the **recursion tree** on the iPad to show why it's O(2^n) vs O(n log n)

#### System Design
- [ ] Draw your **architecture diagram** on the iPad as you describe components — even a rough sketch is more scannable than a wall of text in Google Docs
- [ ] Use iPad for **data flow arrows** — show how a write request flows through ingestion → queue → storage → metadata update
- [ ] Sketch your **entity schema** as a simple box diagram with arrows for relationships
- [ ] Draw **estimation breakdowns** visually: a bar showing "100 Mbps cap → 0.8 TB/day vs 1 PB target"

#### Googliness Round
- [ ] Not needed here — keep this conversational and human, no diagrams

### 6.3 Communication Protocol

- [ ] **Narrate what you're drawing** — "I'm sketching the three main components here on my end, let me walk you through each..."
- [ ] Say when you're switching to draw: "Let me quickly sketch this on my end to make the data flow clearer"
- [ ] Do **not** go silent while drawing — keep talking, even if it's just narrating
- [ ] Keep diagrams **simple and scannable** — 3-5 boxes with labels, not a full-detail architecture
- [ ] After drawing, **summarise in words** what you drew — the interviewer may not be watching your iPad in real time

### 6.4 Risks to Avoid

- [ ] Do not spend more than **60–90 seconds** drawing before returning to dialogue — it can feel like you've gone quiet
- [ ] Do not make your diagram **too detailed** — complexity on the iPad ≠ depth of thinking; it can distract
- [ ] Ensure your drawings are **legible and large** — thin lines or small text won't scan well on screenshare
- [ ] Test your screenshare **shows the iPad content clearly** if you're screen-sharing the iPad directly; if not, narrate more

---

## 7. Weekly Prep Routine

Consistency over intensity. 10 hours/week for 12 weeks beats a 40-hour cram week.

### Suggested Weekly Split (10 hrs/week)

| Day | Activity | Duration |
|---|---|---|
| Monday | LeetCode: 2 medium problems (focus on weekly pattern) | 1.5 hrs |
| Tuesday | System design: read one chapter or watch one video, take notes | 1 hr |
| Wednesday | LeetCode: 1 hard problem (Google-tagged) | 1.5 hrs |
| Thursday | System design: design one system end-to-end from scratch | 1.5 hrs |
| Friday | Behavioral: write out 2 STAR+ stories in full | 1 hr |
| Saturday | Mock coding interview (timed, no hints, talk out loud) | 2 hrs |
| Sunday | Review the week: consolidate patterns, update notes | 1.5 hrs |

### Pattern Focus by Week

- **Weeks 1–2:** Trees, Graphs, BFS/DFS
- **Weeks 3–4:** Tries, Heaps, Priority Queues
- **Weeks 5–6:** Dynamic Programming (intervals, subsets, strings)
- **Weeks 7–8:** Sliding Window, Two Pointers, Monotonic Stack
- **Weeks 9–10:** System Design deep dives (storage, messaging, migration)
- **Weeks 11–12:** Full mock rounds, STAR+ story refinement, iPad workflow practice

---

## 8. Process & Logistics

### Scheduling

- [ ] Offer **multiple time slots across different days** when asked for availability — do not give a single slot
- [ ] 5 PM – 9 PM IST typically aligns well with interviewers in US time zones
- [ ] Request a retake without hesitation if the interviewer does not communicate the problem clearly — this is acceptable and expected

### During the Interview

- [ ] Have water nearby — talking for 45 minutes non-stop is drying
- [ ] Keep a physical notebook (or iPad) for scratch work — do not rely solely on mental math
- [ ] If you get stuck: **narrate your thinking out loud** — "I'm thinking this might be a DP problem because of overlapping subproblems, let me check..." — silence is the worst signal
- [ ] If you realise your approach is wrong mid-way: **say so clearly** — "I think there's an issue with this approach when the input is X, let me reconsider" — pivoting gracefully is an L5 signal

### After Each Round

- [ ] **Write down every problem** you were asked within 1 hour of finishing — memory fades fast
- [ ] Note what you said, what you should have said, and what tripped you up
- [ ] Search LeetCode Discuss for the exact problem wording — Google versions often have extra constraints

### Team Match Phase

- [ ] Do not panic during the quiet phase — it can last 4–8 weeks post-interviews
- [ ] Be **flexible on location** — L5 openings vary by city; being open to Bangalore vs Hyderabad can speed up matching significantly
- [ ] Treat every Hiring Manager call as a **two-way interview**: you are evaluating them too
- [ ] Ask HMs: "What is the 3-year charter of this team?", "Who are the primary stakeholders?", "What does the on-call burden look like?", "How does the team interact with Staff/Principal engineers?"

---

## 9. Negotiation Checklist

- [ ] **Never accept the first offer** — the first EVP is a starting point, not a ceiling
- [ ] Get a competing offer (or at minimum, be in late stages with another company) before negotiating — it is your single strongest lever
- [ ] Know your target: base, RSUs (4-year vest, cliff at year 1), signing bonus, annual bonus
- [ ] Ask for an offer breakdown in writing before negotiating — you need numbers to counter
- [ ] Negotiate RSU quantity and vest schedule, not just base — RSUs are where L5 comp diverges significantly
- [ ] The recruiter is your **advocate inside Google** — be transparent with them about competing offers; they use it to justify a stronger package to the comp team
- [ ] Do not negotiate via email alone — a quick call gives you more signal and more flexibility
- [ ] Counter at least once even if the offer feels good — it is expected and never penalises you

---

## Quick Reference: L5 Signal Phrases

Use these naturally in interviews to signal senior-level thinking:

| Context | Phrase |
|---|---|
| Proposing an approach | *"Before I code this, let me align on the approach — I'm thinking X because of Y constraint"* |
| Handling edge cases | *"I want to make sure we handle the case where the input is empty / all-same / maximum size"* |
| Systems thinking in coding | *"If this ran on a dataset that doesn't fit in memory, I'd switch to an external merge sort approach"* |
| System design trade-off | *"I'm choosing eventual consistency here because the latency cost of strong consistency outweighs the staleness risk for this use case"* |
| Leadership story | *"The decision I made was unpopular at the time, but here's the reasoning and what it prevented"* |
| Complexity explanation | *"This is O(n log n) because we're doing a sort upfront, and then each of the n queries is O(log n) with binary search"* |
| Asking for a retake | *"I want to make sure I fully understand the problem — could you clarify the constraint around X? I want to solve the right problem"* |

---

*Last updated for Google L5 C++ track. Good luck — consistency beats intensity.*
