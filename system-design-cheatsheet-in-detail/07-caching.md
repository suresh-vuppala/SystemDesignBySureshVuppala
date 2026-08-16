# Caching — Live Session Script
### 12 Topics · Spoken Delivery · Under-the-Hood · Interview-Ready

**This is a speaking script, not a reference doc.** The prose is written the way you'd actually say it out loud — short sentences, one idea at a time, every term explained the moment it appears, and an everyday analogy for anything abstract. You can read paragraphs almost verbatim and they'll sound natural.

Every topic follows the same rhythm, because that rhythm is what makes it stick:

> **Set up a problem the room feels** → let them sit with it → **reveal the mechanism** → show where it breaks → **hand off to the next topic that fixes it.**

The whole session is one story: it starts with "our database is drowning," and every piece we add exists because the last one left a gap. Caching is fast — but fast comes with a bill, and most of this session is about paying that bill honestly (stale data, invalidation, crashes, stampedes).

**Script conventions you'll see throughout:**

| Marker | What to do with it |
|---|---|
| 🗣️ **Say this** | Spoken opener — read it aloud almost as written |
| ❓ **Ask the room** | Stop and take answers. Don't answer it yourself for ~10 seconds. |
| ✋ **Pause here** | Let the tension sit before the reveal |
| 🔁 **Bridge** | The verbal transition into the next topic — keeps it one story |
| ⚠️ **Common pushback** | The objection someone will raise, and how to handle it |
| 🎯 **Interview tip** | What to actually say (and skip) in a design interview |

---

## 📑 Topics

1. [Why Cache at All](#1-why-cache-at-all)
2. [Caching Strategies](#2-caching-strategies)
3. [Invalidation, Eviction & the Nasty Failure Modes](#3-invalidation-eviction--the-nasty-failure-modes)
4. [Redis — the Data Structures](#4-redis--the-data-structures)
5. [Why Redis Is So Fast](#5-why-redis-is-so-fast)
6. [Redis as a Cache](#6-redis-as-a-cache)
7. [Redis Pub/Sub](#7-redis-pubsub)
8. [Redis Streams](#8-redis-streams)
9. [Persistence & High Availability](#9-persistence--high-availability)
10. [Deployment Modes](#10-deployment-modes)
11. [Distributed Locks & the Redlock Debate](#11-distributed-locks--the-redlock-debate)
12. [Memcached vs Redis, and CDNs](#12-memcached-vs-redis-and-cdns)

---

## 1. Why Cache at All

> 🗣️ **Open with the pain, before the word "cache":**
> "Your app is popular now. The same homepage, the same product, the same profile — it gets requested thousands of times a second. And every single time, your app turns around and asks the database for it. The exact same answer, over and over, computed fresh each time.
>
> Meanwhile that database is sweating. Every query is a trip to disk, and disk is *slow* — we're talking ten milliseconds when memory would take a hundred nanoseconds. That's not a little slower. That's a hundred thousand times slower."

> ❓ **Ask the room:** "If a million people ask you the same question and the answer barely ever changes — would you look it up in a book a million times, or write it on a sticky note after the first time?"
>
> ✋ **Pause.** Everyone knows the sticky note is the answer. That's the entire idea — you just have to name it:

> 🗣️ **Name it:**
> "That sticky note is a **cache** — a small, fast layer, usually in RAM, that holds the answers you keep needing so you don't have to recompute or re-fetch them. Ask the cache first; only bother the slow database when the cache doesn't have it."

> **The picture:** the database is the giant library archive in the basement. The cache is the stack of popular books on the desk right next to you. Ninety-five percent of the time, what you want is already on the desk. You only walk down to the basement for the rare stuff.

### What you actually get — and what it costs

Three wins, and be honest that they're the *only* reason to do this:
- **Latency** — answers come back in microseconds instead of tens of milliseconds. Users feel it.
- **Throughput** — the database does far less work, so the same hardware serves far more traffic.
- **Cost** — fewer database machines to handle the same load.

But nothing is free, and this is the part people skip. The moment you keep a copy of something, you've signed up for three headaches:
- **Staleness** — the copy on your desk can be out of date if someone changes the original in the basement.
- **Invalidation** — deciding *when* to throw the copy away is genuinely hard (there's a famous quote about this — you'll meet it in topic 3).
- **Memory** — RAM isn't free, so you can't cache everything.

> The honest one-liner: **a cache trades perfect freshness for speed.** Almost the entire rest of this session is about managing that trade without getting burned.

> 🎯 **Interview tip:** the number to know is **cache hit rate** — the percentage of requests answered from cache. Good systems run above 95%. If someone asks "how effective is your cache," that's the number they want.

> **Real-world, right from the start:** Facebook's whole social graph sits behind Memcached (their TAO layer). Twitter caches timelines in Redis. Neither of them is doing anything exotic here — they're both just applying this exact idea, at a much larger scale.

> 🔁 **Bridge into topic 2:**
> "So we agree: keep hot answers close. But that raises an immediate, practical question we glossed over. *When exactly* do we put things in the cache, and who's responsible — the app, or the cache itself? And when data changes, who updates what first? Those choices aren't details. They're named strategies, and picking the wrong one gives you stale carts or lost writes."

---

## 2. Caching Strategies

> 🗣️ **Frame it as a set of real decisions, not a vocabulary list:**
> "There isn't one 'right' way to use a cache. There are a handful of patterns, and each one is the right answer to a *different* question. The trick is to match the pattern to how your data actually behaves — is it read a lot? Written a lot? Does it need to be perfectly fresh?
>
> Let's build them up by asking the questions, not by reciting the names."

> ❓ **Ask the room, question one:** "Most of your data is read constantly but written rarely — a product page, a profile. On a cache miss, who should go fetch it from the database: your app code, or the cache?"

Two read patterns, split by who's in charge of a miss:

- **Cache-Aside — the app does the fetching.**
  - **Flow:** app checks cache → miss → app reads the DB itself → app writes the answer back into the cache.
  - **Why pick it:** you only ever cache what's actually been asked for — the genuinely hot stuff — so RAM never fills with things nobody wanted.
  - **The catch:** a miss costs three round-trips (cache, DB, cache again), and if the DB gets updated some other way, the cache doesn't find out.
  - **Seen in the wild:** Twitter timelines, YouTube video metadata, Shopify product pages — all read-heavy, all cache-aside.

- **Read-Through — the cache does the fetching.**
  - **Flow:** app asks the cache → on a miss, the cache itself goes and fetches from the DB, fills itself, then answers.
  - **Why pick it:** your app code gets simpler — it never even sees a "miss," just asks and gets an answer.
  - **The catch:** you need a cache library or plugin that actually knows how to talk to your database.
  - **Seen in the wild:** DynamoDB's DAX, Cloudflare pulling from origin.

> ❓ **Ask the room, question two:** "Now flip it — writes. When you write, should you update the cache too? And in what order?"

Three write patterns, split by how much risk you're willing to trade for speed:

- **Write-Through — write to cache and DB together, every time.**
  - **Why pick it:** zero stale window. The cache is never wrong, ever.
  - **The catch:** every write now pays for two writes, so writes get slower, and you'll end up caching some things nobody reads.
  - **Seen in the wild:** adding a friend, joining a Slack channel, add-to-cart — anywhere the user must see their own change instantly.

- **Write-Back (write-behind) — write to the cache only, flush to the DB later in a batch.**
  - **Why pick it:** the fastest writes you can get, and reads always hit.
  - **The catch:** if the cache crashes before it flushes, those writes are gone. Only use this where a little data loss is genuinely survivable.
  - **Seen in the wild:** gaming leaderboards, view counters, Uber's GPS pings every few seconds.

- **Write-Around — write straight to the DB, skip the cache entirely.**
  - **Why pick it:** no point caching a firehose of data that's rarely, if ever, read again.
  - **The catch:** slightly higher read latency the first time something is asked for, since it's never pre-cached.
  - **Seen in the wild:** logs, audit trails, IoT telemetry.

> The way to hold all five in your head: **reads** are cache-aside (app fetches) or read-through (cache fetches); **writes** are write-through (safe, slower), write-back (fast, riskier), or write-around (skip the cache for cold data). Pick by asking two questions: how fresh must this be, and how often will it actually be read?

> 🔁 **Bridge into topic 3:**
> "Every one of those strategies quietly assumed something: that we know when to *remove* or *refresh* what's in the cache. Cache-aside goes stale if the DB changes underneath it. TTLs expire. RAM fills up. So now we have to face the hard part — the part with the famous quote attached to it."

---

## 3. Invalidation, Eviction & the Nasty Failure Modes

> 🗣️ **Open with the quote, then make them feel why it's true:**
> "There's a famous line in computer science: *'There are only two hard things in computer science: cache invalidation and naming things.'* Cache invalidation made that list for a reason, and you're about to feel why.
>
> Say a user updates their profile photo. The database now has the new photo. The cache still has the old one, sitting there happily, confidently wrong. Nothing crashed. No error was thrown. Your system is just quietly lying to some fraction of your users right now, and it doesn't even know it."

> ❓ **Ask the room:** "So — who's responsible for noticing the cache is wrong, and when should they act? Immediately? On a timer? Only when someone happens to ask?"
>
> ✋ **Pause.** There isn't one clean answer — that's the whole point of the topic. There are two real strategies, and they trade off exactly the way you'd guess.

### The two ways to say "this is stale now"

**TTL — just make it expire on its own.** You set a time-to-live when you write it: "keep this for 60 seconds, then throw it away." Dead simple, zero coordination between services. The cost is honest: for up to those 60 seconds, someone might see old data. You're not preventing staleness — you're just capping how long it can last.

> **The picture:** it's milk with an expiry date stamped on it. Nobody's actively checking if the milk went bad — the date just tells you when to stop trusting it, whether or not it's actually gone off yet.

One trap worth naming out loud: if a thousand keys all get the exact same TTL, they all expire at the exact same *second* — and now a thousand requests hit your database simultaneously. The fix is almost silly in its simplicity: add a little randomness. `TTL = 3600 seconds ± a random 0–300`. Spread the expiries out so they don't all detonate together.

**Event-driven — actively delete it the moment it's wrong.** The app writes to the DB, and in the very next breath, deletes the stale key from the cache (or a Change Data Capture pipeline watching the DB does it automatically). No stale window at all — the instant the data changes, the cache entry is gone, and the next read repopulates it fresh. The cost: more moving parts, more places this can quietly fail.

> The line to leave them with: **TTL says "trust me for this long, no questions asked." Event-driven says "I'll personally tell you the moment I'm wrong."** Most production systems use both — TTL as the safety net, event-driven for the things that really can't afford to be stale.

### When the cache fills up — eviction

TTL answers *when something goes stale*. Eviction answers a different question: *the cache is full — what gets thrown out to make room for something new?* The most common policy, by far, is:

- **LRU (Least Recently Used)** — throw out whatever hasn't been touched in the longest time. The logic: if nobody's asked for it in a while, they probably won't soon either.
- **LFU (Least Frequently Used)** — throw out whatever's been asked for the *fewest* times overall, regardless of when.
- **FIFO** — just throw out the oldest thing, plain and simple, no cleverness.

LRU wins most of the time because "recently used" is usually a great predictor of "will be used again soon."

### The three ways a cache can genuinely hurt you

These aren't edge cases — they're the incidents that page people at 3am. Same underlying lesson every time: never let every request go straight to the database unsupervised.

**1. Thundering herd (cache stampede)** — one hot key dies, everyone rushes it.
- **What happens:** a popular key expires; a thousand requests discover it's missing in the same instant, and all thousand independently rush to the database to refetch it.
- **Why it hurts:** your "protective" cache just funneled a stampede straight at the exact thing it was supposed to be protecting.

> ❓ **Ask the room:** "If a thousand people all discover the fridge is empty at the same second, do you really want all thousand of them driving to the store independently?"

- **The fix:** let one person go to the store, everyone else just waits for them to get back. The first request to see the miss grabs a lock and goes to the DB; everyone else politely waits, then reads the cache the first one just filled. This is called **single-flight** or **request coalescing**.

**2. Cache penetration** — a key that never existed, hammered forever.
- **What happens:** someone queries a key that doesn't exist anywhere — not in the cache, not in the database. It's a guaranteed miss, every single time, so every request goes straight to the DB.
- **Why it hurts:** do this a few thousand times a second (attacker, or just a bug) and you've built a very effective way to bypass your own cache entirely.
- **The fix:** cache the *absence* too. Store "this key doesn't exist" with a short TTL, so repeated lookups for garbage keys get stopped at the cache.

**3. Cache avalanche** — a huge wave of keys all dying at once.
- **What happens:** not one key expiring — thousands of them, all at the same moment, usually because they were all set with the same TTL.
- **Why it hurts:** it's the thundering herd problem, but scaled up to your *entire cache* instead of one key.
- **The fix:** the same jitter trick from topic 3's TTL section — randomize expiry times so they don't all detonate in the same second.

> 🔁 **Bridge into topic 4:**
> "We've been talking about 'the cache' as this abstract box. Time to open it up and meet the tool that's actually sitting behind most caches in production — Redis. And the first surprise is that Redis isn't just a place to store a string. It's a small toolbox of data structures, and picking the right one solves problems you'd otherwise write a lot of code for."

---

## 4. Redis — the Data Structures

> 🗣️ **Open by breaking the "cache = key and blob" assumption:**
> "Ask most people what a cache does and they'll say 'stores a key and a value.' Fine for a product page. But now imagine you need a live leaderboard for a game with a million players, ranked by score, updated every second. Or you need to know how many *unique* visitors hit your site today, without storing a list of a million user IDs. Or a queue of jobs waiting to be processed.
>
> If your cache only speaks 'key → blob,' you're about to write a mountain of application code to fake all of that. Redis's actual trick is that it doesn't just store blobs — it stores *structures*, and each structure was built to make one of these problems almost trivial."

> ❓ **Ask the room:** "If I told you 'store a ranked leaderboard, and let me ask for the top 10 instantly' — would you rather do that with a plain key-value store, or a structure that's already sorted?"
>
> That question is the whole pitch for Redis's data structures. Let's walk through them by matching each one to the problem it was clearly built for.

- **String** — the plain one: a single value under a key. But it's not *just* a cache slot — `INCR` makes it an atomic counter (perfect for rate limiting), and `SET ... NX` (set only if it doesn't already exist) makes it a distributed lock for free.
- **Hash** — an object with fields, like a mini-row. Perfect for a user profile (`name`, `city`, `plan`) or a shopping cart, where you want to update *one field* without rewriting the whole blob.
- **List** — an ordered sequence you push and pop from either end. This is your job queue, or a "last 20 activities" feed — `LPUSH` to add, `BRPOP` to block-and-wait for the next job.
- **Set** — a bag of unique, unordered items. Great for "who's online right now," tagging, or deduplication. And because it's a proper set, you get `SINTER` — instant "mutual friends" between two people, for free.
- **Sorted Set** — a set where every item also has a score, kept ranked automatically. This *is* the leaderboard: `ZADD` a score, `ZREVRANGE` to grab the top 10 instantly, no manual sorting, ever. Also doubles as a sliding-window rate limiter and a delayed-job queue (score = "run at this timestamp").
- **HyperLogLog** — the strange, brilliant one. It counts *unique* things — "how many distinct visitors today" — using a *fixed* ~12KB of memory, whether you have a thousand visitors or a hundred million. The trade: it's approximate, off by about 0.81%. For "how many people visited," nobody notices 0.81%.
- **Geo** — latitude/longitude, ready-made. `GEOADD` a driver's location, `GEOSEARCH` for "everyone within 2km" — this is literally how Uber finds nearby drivers, and it's really just a sorted set with a clever geohash trick underneath.
- **Stream** — an append-only log of events, with consumer groups that track who's read what. It's a lightweight Kafka living inside Redis — we'll spend a whole topic on this shortly.

> The line to leave them with: **every one of these structures exists because someone kept re-solving the same problem in application code, and Redis decided to just solve it once, properly, at the storage layer.** Pick the structure that matches your problem, and half your logic disappears.

> 🔁 **Bridge into topic 5:**
> "All these structures are neat — but none of it matters if Redis is slow. And the wild part is: it's a *single thread*, doing a hundred thousand to a million operations a second. A single thread! Everything you were taught about needing many cores for performance — Redis seems to break it. So how?"

---

## 5. Why Redis Is So Fast

> 🗣️ **Open with the number that should sound impossible:**
> "A single Redis thread does 100,000 to a million operations a second. That's not a typo, and it's not a fleet of servers — that's one thread, on one core. Everything you've probably heard about scaling — 'use more threads, use more cores' — Redis seems to just ignore.
>
> So either the marketing is lying, or something clever is going on. It's the second one. And it's not one trick — it's about six small decisions that all compound together."

> ❓ **Ask the room:** "If I told you 'never touch the disk, and never make threads wait on each other' — how much of a performance win do you think that alone is worth?"
>
> Let them guess. Then walk the actual list — each one is a small idea, but together they add up to that eyebrow-raising number.

1. **It never touches disk for reads.** Everything lives in RAM. RAM is roughly 100 nanoseconds to access; disk — spinning or even solid-state — is more like 10 milliseconds. That's 100,000 times faster, just from refusing to touch a disk on the hot path.

2. **It's single-threaded on purpose.** Sounds backwards, until you think about what multithreading actually costs: locks, context-switching, the constant risk of two threads racing over the same data. One thread means none of that exists. Every command runs start-to-finish, atomically — nothing can sneak in halfway through.

3. **It doesn't block waiting on slow connections.** A hundred thousand clients connected doesn't mean a hundred thousand threads. Redis uses `epoll` — the OS only taps it on the shoulder when a socket actually has data ready. One thread quietly watches all hundred thousand connections and only works when there's real work.

4. **Its internals are built for CPU caches, not textbooks.** Compact string representations, compact list encodings, skip lists for sorted sets — small, contiguous memory that the CPU chews through fast.

5. **Its network protocol is embarrassingly simple.** RESP is close to plain text. Parsing a command is nearly free — no SQL parser, no query optimizer sitting in the way.

6. **You can batch requests.** Pipelining sends a whole stack of commands in one network round trip instead of one-request-one-round-trip. That alone can multiply throughput by 10x, because for small commands the network hop was the real bottleneck all along — not the CPU.

> The sentence that ties it together: **Redis is fast because it removed almost everything that normally slows a data store down — disk, locks, thread contention, protocol overhead — and the one thing left standing, the network, is exactly what pipelining attacks.** That's why the bottleneck is the network, not the CPU, and why one thread is genuinely enough.

> ⚠️ **Worth flagging honestly:** single-threaded also means one giant, slow command (like scanning a massive set with `SMEMBERS`) blocks *everything* else waiting behind it. That's why you use `SCAN` instead of `KEYS *` in production, and why Redis 6.0+ added extra I/O threads — but only for reading bytes off the network, never for running your actual commands.

> 🔁 **Bridge into topic 6:**
> "So now we know Redis has rich structures and blistering speed. Let's put it to the most common job it does in the real world: sitting in front of a database as a cache. Time to make the pattern from topic 2 concrete with actual Redis commands."

---

## 6. Redis as a Cache

> 🗣️ **Open by connecting the dots they've already built:**
> "Topic 2, we learned the strategies — cache-aside, write-through, and friends. Topic 4 and 5, we learned Redis has rich structures and is blindingly fast. Put those two together and you get the single most common thing Redis does in the world: it's the cache sitting in front of a slow database.
>
> Let's make it concrete. What actually happens, command by command, when your app asks for a user's profile?"

**The pattern in practice:** your app asks Redis for `user:42`. If it's there — a **hit** — you're done, answer served in under a millisecond. If it's not there — a **miss** — your app reads the real database, gets the answer, and writes it into Redis with a TTL before finally returning it. The *next* request for `user:42` is now a hit. This is cache-aside, the one from topic 2, just spelled out with actual Redis in the loop.

> ❓ **Ask the room:** "The cache is finite, and eventually it fills up completely. A new item needs to come in, but there's no room. What should Redis throw away to make space?"

That's eviction, and Redis gives you a policy switch for exactly this moment:
- **allkeys-lru** — throw out whatever's least recently used, across everything. This is the default choice for "I'm using Redis purely as a cache."
- **allkeys-lfu** — throw out whatever's used *least often*, ignoring recency.
- **volatile-lru** — only evict keys that actually have a TTL set; keys with no expiry are treated as permanent and protected.
- **noeviction** — refuse new writes and return an error once full. You'd pick this if Redis is a real data store for you, not just a cache, and losing data silently is unacceptable.

> The rule of thumb: **if Redis is "just a cache" for you, `allkeys-lru` is almost always the right default.**

> 🗣️ **And now — the three problems from topic 3, but with names on the fixes:**
> "Remember thundering herd, cache penetration, and cache avalanche? In Redis, here's exactly how you fight each one. Thundering herd — grab a Redis lock with `SETNX` so only one process refills a hot key while everyone else waits. Cache penetration — cache the *absence* itself with a short TTL, so a flood of lookups for a key that will never exist stops hurting your database. Cache avalanche — add jitter to your TTLs so a thousand keys don't all die in the same second."

> ⚠️ **The anti-patterns worth naming out loud** — this is exactly how real caching incidents happen:
> - **No TTL at all** — data goes stale forever and nobody notices.
> - **Caching everything indiscriminately** — you burn RAM on cold data nobody reads twice.
> - **No eviction policy configured** — Redis just fills up and crashes with an out-of-memory error.
> - **Inconsistent invalidation** — three different code paths update the DB, and only one of them remembers to clear the cache.

> 🔁 **Bridge into topic 7:**
> "Everything so far has been about *storing* an answer so you don't have to compute it twice. But there's a completely different job Redis does — not storing anything at all, just *broadcasting* a message to everyone listening, the instant it happens. That's a different muscle entirely, and it's worth seeing why it exists."

---

## 7. Redis Pub/Sub

> 🗣️ **Open with a live scenario, not a definition:**
> "You're building a chat app. Three people are in a room. One of them sends a message. The other two need to see it *right now* — not on their next page refresh, not thirty seconds from now. Instantly.
>
> Polling — 'ask the server every second if there's something new' — works, but it's wasteful and it's laggy. What you actually want is the opposite: the server should *push* the message to everyone the moment it happens."

> ❓ **Ask the room:** "If I shout something into a room, everyone currently standing in the room hears it. Someone who walks in five minutes later heard nothing — there's no way to 'catch them up' on a shout that already happened. Does that sound like a bug, or is that sometimes exactly what you want?"

> 🗣️ **Name it:**
> "That shout-into-a-room behavior is **Redis Pub/Sub**. Publishers send a message to a *channel*; every subscriber currently listening on that channel gets it, instantly, in real time. But — and this is the defining trait — if nobody's listening at that exact moment, the message is simply gone. No history, no replay, no persistence. It's fire-and-forget, on purpose."

That trade-off is completely intentional, and it's *fine* for the right use case: live chat messages, "someone is typing…" indicators, live notifications, real-time dashboards. In all of these, if you missed a message because you weren't connected, you genuinely don't care about the one you missed — you only care about what's happening *now*.

**The commands, so it's concrete:**
```
PUBLISH  chat:room1 "Hello!"     → sends to all current subscribers, delivery under 1ms
SUBSCRIBE chat:room1             → receives "Hello!" instantly, only while connected
PSUBSCRIBE chat:*                → pattern match — listen across every chat:* channel at once
```

**What you get:** real-time delivery under a millisecond, fan-out to every subscriber, pattern matching across channels.
**What you don't get:** no persistence, no replay, no acknowledgment, no consumer groups. If it wasn't heard, it's gone.

> **Real-world:** Figma uses it for real-time collaboration signals (who's editing what, cursor positions). Slack uses it for online presence. It's also a common way to tell *other app servers* "hey, invalidate this cache key" the instant something changes — a neat callback to topic 3's event-driven invalidation.

> The line to hold onto: **Pub/Sub is a shout, not a memo.** Perfect for things that are only meaningful in the instant they happen.

> 🔁 **Bridge into topic 8:**
> "But now flip the requirement. What if you *do* need history? A payment event that absolutely must be processed, even if the worker handling it was down for five minutes. An order placed at 2am that has to be picked up when the warehouse system comes back online at 6am. Pub/Sub would just lose that message forever. So Redis has a second, very different tool for exactly this case."

---

## 8. Redis Streams

> 🗣️ **Open by contrasting directly with what they just learned:**
> "Same chat-app energy, but a harder requirement: every message must be *durable*. If a consumer is offline when it arrives, it needs to see it the moment it comes back — not lose it. And if you have five workers processing orders, each order should go to exactly *one* of them, not all five doing the same job five times over.
>
> Pub/Sub can't do either of those. It shouts once and moves on. We need something that actually *remembers*."

> ❓ **Ask the room:** "What's the difference between shouting a message into a room, versus writing it down in a logbook that anyone can come read later, in order, whenever they're ready?"

> 🗣️ **Name it:**
> "That logbook is a **Redis Stream** — an append-only log of events that sticks around after it's written. Anyone can read from any point in the log, catch up on everything they missed, and Redis remembers exactly how far each reader has gotten. People call it a lightweight Kafka living inside Redis, and that's a fair description."

The piece that makes it genuinely powerful is **consumer groups**. Put five workers into one group reading the same stream, and Redis automatically splits the events between them — each event goes to exactly one worker in the group, not all five. Each worker `XACK`s an event once it's actually done processing it. If a worker dies mid-task without acknowledging, that event stays claimable, and another worker in the group can pick it back up. Nothing silently vanishes.

**The commands, so it's concrete:**
```
XADD   orders * customer_id 5 amount 100 status "pending"   → appends, returns ID 1704067200000-0
XGROUP CREATE orders payment-service 0                       → create a consumer group starting at offset 0
XREADGROUP GROUP payment-service consumer1 STREAMS orders >  → read only unprocessed entries
XACK   orders payment-service 1704067200000-0                → mark that entry done
XRANGE orders - +                                             → replay every entry, from the very start
```

**What you get:** persistence (survives a restart), replay from any offset, competing consumer groups, at-least-once delivery, blocking reads (`XREADGROUP ... BLOCK`).
**The honest limits:** single-node throughput tops out under 100K events/sec — Kafka does millions. It's RAM-bound, and there's no cross-cluster replication. Streams is best thought of as "lightweight Kafka you get for free because you already have Redis," not a Kafka replacement at real scale.

| | Pub/Sub | Streams |
|---|---|---|
| Purpose | Real-time broadcast | Durable event log |
| Persistence | None | Yes (AOF/RDB) |
| Replay | ✗ | ✓ `XRANGE` |
| Consumer groups | ✗ | ✓ competing consumers |
| Acknowledgment | ✗ fire-and-forget | ✓ `XACK` |
| Best for | Presence, typing indicators, cache invalidation | Order pipelines, audit logs, IoT events |

> The clean way to hold both, side by side: **Pub/Sub is real-time and forgetful — great for chat, typing indicators, live dashboards. Streams are durable and replayable, with built-in load-balancing across workers — great for order events, audit trails, anything you cannot afford to lose.** Same company, two tools, built for opposite guarantees.

> 🔁 **Bridge into topic 9:**
> "Streams just raised an uncomfortable question, though. We keep saying Redis lives in RAM. RAM is fast — but RAM also forgets everything the instant the power goes out. If Streams are supposed to be *durable*, and Redis is an in-memory store... what actually happens when the Redis process crashes, or the whole machine reboots?"

---

## 9. Persistence & High Availability

> 🗣️ **Open with the scary scenario directly:**
> "Redis holds everything in RAM. Now the server it's running on loses power, right now, this second. What's left in RAM the instant power dies? Nothing. Zero. Every piece of data Redis was holding just evaporated.
>
> For a pure cache, maybe that's survivable — you just rebuild it from the database over the next few minutes. But if you're using Redis Streams as a real event log, or session data as a genuine source of truth, 'everything just vanished' is not an acceptable answer."

> ❓ **Ask the room:** "If you wanted Redis to survive a crash, you'd need it to write *something* to disk. What are the two different philosophies you could take — and what would each one cost you?"

There are genuinely two answers, and they trade off in opposite directions:

- **RDB (snapshotting)** — a photograph.
  - **How it works:** periodically, Redis takes a full snapshot of everything in memory and writes it to one file on disk.
  - **Upside:** fast to restart from — just load the file back in.
  - **Downside:** you only have data as of whenever the last snapshot was taken. Anything written since is gone if you crash.

- **AOF (append-only file)** — a diary.
  - **How it works:** Redis appends every single write command to a log file as it happens; on restart, it replays the whole diary to rebuild exact state.
  - **Upside:** far less data loss — you can even configure it to fsync on every single write.
  - **Downside:** replaying a long diary on startup is slower than loading one snapshot.

> The picture that sticks: **RDB is a photograph — fast to restore, but only as fresh as the last shot. AOF is a diary — nearly zero data loss, but slower to read back through cover to cover.** Most production setups use *both together*: RDB for fast full recovery, AOF layered on top to fill in the last few seconds RDB might have missed.

| | RDB (Snapshot) | AOF (Append-Only) | Hybrid (both) |
|---|---|---|---|
| How | `fork()` → child writes `.rdb` to disk | Log every write command to file | AOF for durability, RDB for fast restart |
| Data loss | Up to the snapshot interval (1–15 min typical) | ≤ 1 second (with `appendfsync everysec`) | ≤ 1 second |
| Restart speed | Fast — load one binary dump | Slow — replay every command | Fast — load RDB, replay only the recent AOF tail |
| Disk I/O | Low (periodic bulk write) | High (continuous fsync) | Medium |
| Best for | Backups, disaster recovery | Durability-critical data | **Production default (Redis 4.0+)** |

**The AOF fsync dial** is worth knowing by name, because it's the actual speed-vs-safety slider: `always` (fsync every write — slowest, zero loss), `everysec` (flush once a second — the recommended default, ≤1s loss), `no` (let the OS decide — fastest, unpredictable loss).

### Surviving more than a crash — replication

> 🗣️ "Persistence answers 'what happens when this one machine dies.' But there's a bigger question: what happens when this one machine is *gone for good* — hardware died, region went dark? You need more than a file on disk. You need a whole other machine ready to go."

That's **replication** — the primary streams every write to one or more replicas, asynchronously, in the background. Replicas can also serve reads, which is a nice side benefit — read scaling for free.

**Sentinel** is Redis's mechanism for making failover *automatic*:
- **Setup:** 3 or more Sentinel processes independently watch the primary's heartbeat.
- **Detection:** if the primary goes unreachable and a **quorum** of Sentinels agree, they collectively decide it's really down (not just one Sentinel having a bad network day).
- **Action:** Sentinel promotes a replica to primary and reconfigures clients to point at it — typically in **5–15 seconds**, no human paged.
- **A detail worth knowing:** the Sentinels themselves elect a leader among each other using a Raft-like process, so the decision to fail over isn't made by a single Sentinel acting alone.

> ⚠️ **The honest caveat:** replication is asynchronous by default. There's a real window where a replica hasn't yet received the very latest write when the primary dies — and that write is then **permanently lost**, not just delayed. Two ways to fight this:
> - **`WAIT numreplicas timeout`** — forces a write to wait for N replicas to confirm before returning success. Extra latency on every write, in exchange for a real durability guarantee.
> - **`min-replicas-to-write 1` + `min-replicas-max-lag 10`** — the primary simply *refuses new writes* if it doesn't have at least one replica within 10 seconds of being caught up. Blunter, but effective: it trades some availability for a hard guarantee that you never accept a write with nowhere safe to land.
>
> Nothing here is free; you're always trading speed for safety, same as everywhere else in this session.

> 🔁 **Bridge into topic 10:**
> "So one Redis, backed up and replicated, survives a crash. But what happens when your dataset simply doesn't *fit* on one machine anymore — you need more RAM than any single box can offer, or more throughput than one thread can push? That's not a durability problem anymore. That's a capacity problem, and it needs a completely different answer."

---

## 10. Deployment Modes

> 🗣️ **Open with growth, not a feature list:**
> "Let's follow one Redis instance through the life of a growing company. Day one: a single Redis box for a side project. Nobody cares if it dies at 3am — it's not critical yet. Fast forward: real users, real revenue, and now if that one box dies, you have an outage. Fast forward again: your dataset is bigger than any single machine's RAM, and your traffic is bigger than one thread can push.
>
> Each of those stages needs a genuinely different setup — and this is exactly the progression Redis's deployment modes were built to match."

**Stage one — single node.**
- One instance, nothing fancy. A single point of failure, and everyone building it knows it.
- Fine for: dev, prototypes, a cache where losing it briefly is a shrug, not an incident.

**Stage two — Sentinel.**
- A primary plus replicas, with Sentinel processes watching the primary's pulse.
- The moment the primary goes quiet, Sentinel automatically promotes a replica to take over.
- What you've bought: **automatic failover.** No sharding yet — you're just no longer one bad disk away from an outage.

> ❓ **Ask the room:** "Sentinel gives you failover, but every replica still holds a *full copy* of everything. What happens when the data itself is simply too big for that?"

**Stage three — Cluster.** This is where you actually split the data, not just copy it.
- Redis divides the entire keyspace into **16,384 hash slots**.
- Every key gets hashed (`CRC16(key) % 16384`) to find its slot, and each slot lives on a specific master node.
- Add more masters, and you spread both the *data* and the *throughput* across more machines — real horizontal scale, not just a backup copy.
- Nodes find each other and stay in sync via a **gossip protocol**, quietly chatting about who's alive and who owns what.

> ⚠️ **The gotcha worth flagging clearly:** because keys scatter across slots by hash, a multi-key operation only works if *all* those keys land in the same slot. The fix is a **hash tag** — wrap the part of the key you want hashed in curly braces, like `{user:123}.profile` and `{user:123}.settings`. Redis only hashes what's inside the braces, so you can force related keys onto the same slot on purpose.

**Stage four — managed.**
- AWS ElastiCache, MemoryDB, Upstash — someone else runs Cluster or Sentinel for you: patching, failover drills, backups, all handled.
- Most production teams land here eventually — operating Redis Cluster well is a real, ongoing job, and most companies would rather pay to make that job disappear.

One more mechanical detail worth having ready: when a client asks a Cluster node for a key that actually lives on a *different* node, that node doesn't silently proxy the request — it replies **`MOVED`** (the client should permanently redirect there) or **`ASK`** (a temporary redirect, used mid-resharding while a slot is being migrated). A cluster-aware client library handles this transparently, but it's worth knowing it's happening under the hood.

> **Real-world, by name:** Twitter runs its timeline cache on Redis Cluster. GitHub's job queues (Resque/Sidekiq) sit on Redis. Snapchat does rate limiting on it. Pinterest stores billions of graph edges in Redis. Discord uses it for presence and message caching.

> The one line that ties the whole progression together: **single node has no safety net, Sentinel gives you failover without splitting data, Cluster gives you both failover and horizontal scale by splitting data across masters, and managed means someone else worries about all of it.** You climb this ladder exactly when the previous rung starts to hurt — never before.

> 🔁 **Bridge into topic 11:**
> "Here's a genuinely different problem, and it trips people up because it *feels* like it should be simple. You've got multiple app servers, and you need to make sure only *one* of them is doing a particular job at a time — sending one email, not five duplicate emails; processing one payment, not two. Redis can help. But there's a very famous, very heated argument about exactly how far you can trust it for this."

---

## 11. Distributed Locks & the Redlock Debate

> 🗣️ **Open with the concrete failure, not the theory:**
> "You've got five app servers, and every minute, a scheduled job needs to send one report email. If all five servers run that job at the same moment — which they will, because they're all on the same clock — your user gets five identical emails.
>
> You need exactly one of those five servers to say 'this one's mine,' grab the job, and have the other four back off. That's a lock. And the simplest possible way to build one is almost embarrassingly easy in Redis."

**The simple version, one Redis:**
```
SET lock:order:123 "worker-A" NX EX 30
# ... do the critical work ...
# Release safely — a Lua script makes the check-and-delete one atomic step:
EVAL "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end" 1 lock:order:123 "worker-A"
```
Read that `SET` like English: *set this key, but only if it doesn't already exist* (`NX`), *and automatically expire it in 30 seconds* (`EX 30`) so if worker-A crashes mid-job, the lock doesn't stay held forever. Whoever's `SET` actually succeeds owns the lock; everyone else's fails, and they back off. The Lua script on release matters too — without it, worker-A could accidentally delete a lock that a *different* worker now holds (if A was slow and the lock already expired and got re-acquired by someone else).

> This single-node version is genuinely fine for **rate limiting, deduplication, idempotency keys** — anywhere a rare double-execution is a shrug, not an incident.

> ❓ **Ask the room:** "That works beautifully on *one* Redis instance. But we just spent all of topic 10 saying you shouldn't run just one Redis in production — you want replicas, failover, resilience. So here's the uncomfortable question: does a lock still mean anything once there's more than one Redis machine involved?"

This is exactly the question that led to **Redlock** — an algorithm for taking a lock across *several independent* Redis instances at once, so no single instance failing can silently break your lock. The idea: try to acquire the same lock on, say, 5 separate Redis nodes; if you succeed on a majority (3 of 5), you genuinely hold the lock.

> ⚠️ **And here's the famous fight — walk through it as a concrete failure, not an abstract worry:**
> 1. Client A acquires the lock. It's now doing its critical work.
> 2. Client A's process hits a **GC pause** — 30+ seconds, completely frozen. It has no idea time is passing.
> 3. While A is frozen, the lock's TTL quietly expires.
> 4. Client B comes along, sees the lock is free, and acquires it. B starts its own critical work.
> 5. Client A finally wakes up from the GC pause — still fully convinced it holds the lock, because as far as A's own code knows, nothing went wrong.
> 6. **Both A and B are now in the critical section at the same time.** Data corruption.
>
> The root failure isn't really about GC — GC is just one trigger. A page fault, a scheduler context switch, or a slow network link can all cause the exact same pause. **The lock holder fundamentally cannot know its lock is still valid after any kind of pause.** That's Martin Kleppmann's core critique of Redlock, and it's why he calls it unsafe for correctness.

**The actual fix: fencing tokens.** This is the part that's easy to miss — Redlock's danger has a real, known solution, it's just not something Redis provides natively.

- Every time a lock is granted, hand out a **monotonically increasing number** along with it — token 33 to client A, token 34 to client B.
- The *storage system being protected* (the database, the resource itself) remembers the highest token it has ever seen.
- When a write arrives, the storage checks the token. If it's lower than or equal to the highest one already seen, **the storage rejects the write itself** — no matter how confident the client is that it holds the lock.
- So in the GC-pause scenario above: A wakes up, tries to write with its stale token 33, but storage has already seen 34 from B. A's write is rejected. B's write (with the higher, newer token 34) succeeds. No corruption — the *storage* enforces correctness, not the client's belief about its own lock.

> ⚠️ **The catch that matters:** etcd and ZooKeeper provide fencing tokens as a built-in feature. **Redis does not.** If you want this protection with Redis, you have to build the token-checking logic into your storage layer yourself.

| Failure Mode | Redlock Alone | With Fencing Token |
|---|---|---|
| GC / process pause | ✗ Unsafe — both clients end up in the critical section | ✓ Safe — the stale token gets rejected |
| Clock drift (NTP jump) | ✗ Unsafe — TTL can expire early | ✓ Safe — tokens aren't time-based |
| Network partition | ✗ Unsafe — split-brain possible | ✓ Safe — only the highest token wins |
| Redis failover | ✗ Unsafe — the lock can be lost on promotion | ✓ Safe — fencing protects the storage, not the lock |

> The honest, defensible position for an interview: **Redis `SETNX` for efficiency locks** — dedup, rate limiting, idempotency, where a rare double-execution is tolerable. **etcd or ZooKeeper with fencing tokens for correctness locks** — payments, inventory, anything where two clients believing they hold the same lock is a real incident. And where you can, **avoid the lock entirely with optimistic concurrency** (a version/CAS check) instead.
>
> Kleppmann's own verdict, worth quoting directly: *"Redlock is not safe for correctness. It's fine for efficiency. For correctness, use consensus-based locks with fencing tokens."*

> **Real-world:** Google's Chubby uses Paxos plus a sequencer (its version of a fencing token). etcd uses Raft plus revision numbers. ZooKeeper uses ephemeral znodes. And tellingly — Stripe uses Redis for idempotency keys (an efficiency concern) but leans on actual database constraints, not Redis locks, for payment correctness.

> 🔁 **Bridge into topic 12:**
> "We've gone deep on Redis — structures, speed, persistence, clustering, locks. Let's zoom back out for the close. Redis isn't the only in-memory store out there, and it's worth knowing exactly when you'd reach for something simpler instead. And separately — everything so far cached *data*. What about caching entire *web pages and files*, for users scattered all over the planet? That's a different beast, much closer to the user, and it closes out the whole session."

---

## 12. Memcached vs Redis, and CDNs

> 🗣️ **Open with the honest question people actually ask:**
> "If Redis does all this — rich structures, persistence, pub/sub, streams, clustering — is there ever a reason to reach for anything simpler? Turns out, yes. Sometimes you genuinely don't need a Swiss army knife. You just need the sharpest possible single blade."

**Memcached** is that blade:
- **Does one thing:** `GET` and `SET` on a plain key and a blob. No structures, no persistence.
- **Kill the process** and everything it held is gone — on purpose, no drama.
- **Multi-threaded at its core**, so it scales across CPU cores in a way Redis's single-threaded command execution doesn't.
- **Where it wins:** an enormous, simple, ephemeral cache. Facebook's TAO layer does billions of social-graph lookups on Memcached — raw multi-core throughput and dead-simple semantics beat every extra feature Redis offers.

> The rule of thumb that settles it fast: **need data structures, persistence, pub/sub, or built-in locking? Redis. Need the dumbest, fastest possible key-blob cache at massive scale, and nothing else? Memcached.** Most teams default to Redis today simply because they end up wanting *one* of those extra features eventually, and switching stores later is painful.

### Now zoom out — caching entire pages, not just data

> 🗣️ **Pivot to a completely different scale of problem:**
> "Everything so far lived in your data center, close to your database. Now picture a user in Mumbai loading a website whose server sits in Virginia. Light itself takes real, physical time to cross that distance — you cannot Redis your way out of geography.
>
> So instead of making the trip faster, what if the *answer* was already sitting much closer to the user, before they even asked?"

> ❓ **Ask the room:** "If you have millions of users scattered across the globe, and mostly-static content — images, videos, JS bundles — would you rather have one server answer every request from one location, or copies of that content sitting in many locations near your users?"

> 🗣️ **Name it:**
> "Copies of your content, sitting in servers physically close to users all over the world, is a **CDN — Content Delivery Network**. Each of those locations is called an edge PoP (point of presence). A user in Mumbai gets served from a PoP in Mumbai, not a round trip to Virginia — often under 20 milliseconds instead of hundreds."

Two philosophies for *how* content gets to those edge locations:

- **Pull CDN (lazy)** — the edge does nothing until the first user asks.
  - **Flow:** first request → miss → fetch from origin → cache locally → serve. Every request after that, from anyone nearby, is a fast hit.
  - **Upside:** simple, costs nothing upfront.
  - **Downside:** the very first visitor in each region eats a slower load.

- **Push CDN (proactive)** — you publish content to every edge location before anyone asks.
  - **Flow:** origin publishes → every PoP already has it → every request, everywhere, is a hit from the start.
  - **Upside:** nobody is ever "the first unlucky visitor."
  - **Downside:** you manage the publishing step yourself, and you're pushing data to regions that might never get traffic for it.

> The clean way to hold it: **pull CDN is lazy and cheap — cache on first request. Push CDN is proactive and predictable — pre-populate everywhere before the first request arrives.** Most general web traffic uses pull; live product launches or big predictable releases sometimes push ahead of time.

> ⚠️ **The honest limitation, worth saying out loud:** CDNs are fantastic for content that's the same for everyone — images, videos, static JS and CSS. The moment content is *personalized per user* — a logged-in dashboard, a feed built just for you — a CDN can't help much, because there's no single shared answer to cache. And purging something everywhere, globally, the instant it changes, is genuinely hard — that's cache invalidation again, just stretched across the entire planet instead of one Redis instance.

### How this actually grows — from a thousand requests a day to a billion

> 🗣️ "One CDN setup doesn't serve everyone from a startup to Netflix. It's a ladder, same as Redis's deployment modes were. Let's climb it."

- **Tier 1 — no CDN.** Under 10K requests/day. Just the browser's own cache, driven by `Cache-Control` headers. ~200ms average globally. Costs nothing, and for this traffic level, that's the right call.
- **Tier 2 — a pull CDN.** 10K to 100M requests/day. Edge PoPs sit in front of your origin, typically hitting 90%+ cache hit ratio, ~20ms at the edge. This is Cloudflare, CloudFront — off-the-shelf.
- **Tier 3 — multi-tier, with a shield.** 100M to 1B requests/day. Now there's a middle layer between the edge and the origin — a **shield** — and invalidation starts propagating over Pub/Sub instead of waiting on TTLs. 97%+ hit rate, under 10ms, and genuinely DDoS-resistant. Fastly and Akamai operate at this tier.
- **Tier 4 — your own custom CDN.** 1B+ requests/day. This is Netflix Open Connect — literal CDN boxes physically installed *inside ISPs*, with edge compute and real-time CDC-driven purges. 99%+ hit rate, under 5ms, almost zero traffic ever reaching the true origin.

> **The idea that makes tier 3 and 4 work — a shield layer.** Picture 100 edge PoPs around the world all missing on the same brand-new, uncached asset at once. Without a shield, that's 100 simultaneous requests hitting your origin. A shield sits *between* the edges and the origin and collapses all 100 of those misses into a single request to the origin — this is request coalescing again, just applied at planetary scale instead of inside one Redis instance.

**Three more scaling ideas worth naming:**
- **Tiered TTLs** — edge caches for 60 seconds, the shield for 5 minutes, the origin's own cache for an hour. Freshness gets progressively looser the closer you are to the source.
- **Stale-while-revalidate** — serve the slightly-stale cached copy immediately, and refresh it in the background for the *next* request. Users never wait on a refresh.
- **Cache warming** — before a known traffic spike (a product launch, Black Friday), proactively pre-populate the cache instead of letting the first wave of real users pay the cold-start cost.

> ⚠️ **The same three failure modes from topic 3, just bigger:** thundering herd (a hot key expires, every PoP stampedes the origin — fixed the same way, jittered TTLs plus coalescing), cache stampede (a popular item gets invalidated mid-spike — fixed with a lock plus stale-while-revalidate), and purge storms (a mass invalidation overwhelms the origin — fixed with a *soft* purge: keep serving the stale version while refreshing quietly in the background).

> 🎯 **Interview tip:** always mention **cache hit ratio** as the CDN metric that matters most. Going from 95% to 96% doesn't sound like much — but that's a 20% reduction in origin requests. At Netflix's scale (100B+ requests/day), that difference is billions of calls the origin never has to answer.

**Edge computing — running your own logic at the edge, not just caching.** Cloudflare Workers, Lambda@Edge, Vercel Edge Functions — small pieces of your own code executing right at the PoP, not just serving cached files. Good for A/B testing, geo-routing, validating an auth token, light personalization — all without a round trip to origin. The honest limitation: a limited runtime, and no real persistent state at the edge.

**One more pattern worth having ready — multi-level caching.** Layer several caches, each faster but smaller than the one behind it: **L1** in-process (e.g., Caffeine, living in your app's own memory) → **L2** Redis (shared across app servers) → **L3** the CDN (shared across the planet). Each level catches what the one behind it would've had to do the slow way.

> **Real-world, by name:** Netflix Open Connect serves over 95% of its traffic from ISP-local boxes. Cloudflare runs 300+ PoPs and touches over 20% of the web's traffic. CloudFront runs 400+ PoPs with Lambda@Edge for compute at the edge.

---

## Closing the session

> 🗣️ **Say this to close:**
> "Let's retrace the whole thing, because one thread ran through all twelve topics.
>
> We started because the database was drowning under repeated identical questions, so we added a **cache**. That immediately forced a decision — who fetches on a miss, and when do we write — which gave us the **caching strategies**. Every one of those strategies quietly assumed we know when data goes stale, which dragged us into **invalidation, eviction, and the three ways a cache turns on you** — thundering herd, penetration, avalanche. Then we opened up the tool that actually implements most of this in practice — **Redis**, with its rich **data structures** and its almost unreasonable **speed**. We watched it play its most common role, **as a cache**, and then met its other two personalities — **Pub/Sub** for the ephemeral shout, and **Streams** for the durable, replayable memo. That raised the scary question of what happens on a crash, which took us into **persistence and high availability**. Growth then forced the **deployment modes** — single node, Sentinel, Cluster, managed — each solving what the last one couldn't. Along the way we needed exactly one server to do a job, which led to **distributed locks**, and the very real, very public argument over how far you can trust them. And we closed by asking whether Redis is always the answer — sometimes it's simpler **Memcached** — and by zooming out to caching across the entire planet with a **CDN**.
>
> Every single one of those existed because the thing before it left a gap. Nobody designs all twelve of these on day one. You reach for each one exactly when the last one starts to hurt."

> ❓ **Final question to leave them with:** "Think about a system you actually work on. Where is it caching right now, and can you name the strategy it's using without looking it up? And — be honest — do you actually know what happens to that cache the moment the underlying data changes?"
>
> Let two or three people answer out loud. That's the moment this stops being theory and starts being their own system, looked at with fresh eyes.

### The one thing to remember

Every technique in this session bought you speed by trading away something else — usually freshness, sometimes durability, sometimes simplicity. The engineers who get burned by caching aren't the ones who used it — they're the ones who forgot they'd made that trade. Know exactly what you traded away, and caching stays a superpower instead of a landmine.
