/* === Lesson redis-streams - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-streams)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. Structured to follow the
   full Redis Streams roadmap: why -> anatomy -> commands/flow -> consumer
   groups -> delivery & recovery -> scaling & retention -> comparisons ->
   production & patterns, with cross-links instead of repeating content. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-streams"] = {
  module: 7, num: "7.7", title: "Redis Streams",
  connectsFrom: "Same chat-app energy, harder requirement: every message must be durable, and a worker offline for 5 minutes must see everything it missed the moment it reconnects. Pub/Sub (7.6) cannot do that; Streams can.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "commands", label: "Commands & Flow", icon: "swap" },
    { key: "groups", label: "Consumer Groups", icon: "layers" },
    { key: "reliability", label: "Delivery & Recovery", icon: "alert" },
    { key: "scaling", label: "Scaling & Retention", icon: "loop" },
    { key: "comparisons", label: "vs Pub/Sub & Kafka", icon: "scale" },
    { key: "production", label: "Production & Patterns", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "A Durable, Replayable Event Log",
      intro: "Wire a <strong>producer</strong> straight to a <strong>consumer</strong> and the coupling bites immediately: if the consumer is down the event is lost, a second consumer means duplicating the wiring, and nobody can replay what already happened. A <strong>Redis Stream</strong> fixes all three by sitting in the middle as an <strong>append-only, persistent event log</strong>. Producers append; consumers read from any point and catch up; the log survives a restart via RDB/AOF (see 7.8). It is a <strong>lightweight Kafka</strong> built into a store you already run.",
      cards: [
        { icon: "!", title: "The problem without it", color: "red", body: "Direct producer \u2192 consumer is tightly coupled: a consumer that is offline <strong>loses</strong> the event, adding a second consumer means re-plumbing, and there is <strong>no replay</strong> of past events." },
        { icon: "\u2713", title: "Why a stream", color: "green", body: "One <strong>persistent event log</strong> decouples both sides: producers do not know consumers, consumers read at their own pace, and any reader can <strong>replay</strong> history from any point." },
        { icon: "#", title: "Anatomy", color: "blue", body: "A <strong>Stream</strong> is the log (a Redis key). An <strong>Entry</strong> is one record in it, identified by an <strong>Entry ID</strong> and carrying arbitrary <strong>fields &amp; values</strong> (a small map, like a row)." }
      ],
      callouts: [
        { color: "green", label: "Core mental model:", body: "<strong>Producer \u2192 Stream \u2192 Consumer Group \u2192 Consumers \u2192 ACK.</strong> The stream durably stores every entry; a consumer group hands each entry to exactly one consumer in the group; the consumer acknowledges (<code>XACK</code>) once it has safely processed it. Keep this chain in mind, every command below slots into one link of it." },
        { color: "blue", label: "Entry ID:", body: "Every entry gets an ID of the form <code>&lt;millisecondsTime&gt;-&lt;sequence&gt;</code> (e.g. <code>1719849600000-0</code>). IDs are <strong>monotonically increasing</strong>, so the log is always strictly ordered and an ID doubles as a cursor you can resume from." }
      ]
    },

    commands: {
      heading: "Commands, Write Flow & Read Flow",
      intro: "A handful of commands cover the basics. The <strong>write flow</strong> is one hop: <strong>Producer \u2192 <code>XADD</code> \u2192 Stream</strong>. The <strong>read flow</strong> is its mirror: <strong>Consumer \u2192 <code>XREAD</code> \u2192 Stream \u2192 Consumer</strong>, optionally blocking until new entries arrive.",
      table: {
        headers: ["Command", "What It Does", "Example"],
        rows: [
          ["<strong>XADD</strong>", "Append an entry; <code>*</code> asks Redis to auto-generate the next ID", "<code>XADD orders * item widget qty 3</code>"],
          ["<strong>XLEN</strong>", "Number of entries currently in the stream", "<code>XLEN orders</code>"],
          ["<strong>XRANGE</strong>", "Read a range of entries by ID (<code>-</code> to <code>+</code> = all); the basis of <strong>replay</strong>", "<code>XRANGE orders - +</code>"],
          ["<strong>XREAD</strong>", "Read entries after a given ID; <code>BLOCK</code> waits for new ones (tailing)", "<code>XREAD BLOCK 0 STREAMS orders $</code>"]
        ]
      },
      points: [
        { label: "Basic write flow", body: "The producer calls <code>XADD orders * ...</code>. Passing <code>*</code> lets Redis stamp the entry with the next auto ID and append it. The command returns that ID, which is your receipt and your resume cursor." },
        { label: "Basic read flow", body: "A simple consumer calls <code>XREAD STREAMS orders 0</code> to read from the start, or <code>XREAD BLOCK 0 STREAMS orders $</code> to block and receive only entries added <em>after</em> it connected. <code>$</code> means \u201clast ID currently in the stream.\u201d" },
        { label: "Stream IDs: auto vs explicit", body: "<strong>Auto</strong> (<code>*</code>) is what you use 99% of the time. You may also pass an <strong>explicit</strong> ID (e.g. <code>1719849600000-0</code>) when importing or aligning IDs to an external clock, but it must be strictly greater than the last ID." },
        { label: "Ordering", body: "Because IDs only ever increase, entries are stored and read in <strong>insertion order</strong> within a single stream. There is no cross-stream ordering, ordering is a per-stream (per-log) guarantee, the same way a partition orders in Kafka (8.2)." }
      ],
      callouts: [
        { color: "blue", label: "Tailing vs replaying:", body: "Use <code>XREAD ... $</code> to <strong>tail</strong> (only future entries), a specific ID to <strong>resume</strong> after a known point, and <code>XRANGE - +</code> to <strong>replay</strong> the entire history. Same log, three read intents." }
      ]
    },

    groups: {
      heading: "Independent Readers vs a Consumer Group",
      intro: "Two completely different read models share one stream. Plain <code>XREAD</code> gives every consumer the <strong>full</strong> stream independently (fan-out). A <strong>consumer group</strong> instead splits entries <strong>across</strong> its members so each entry is handled once (work-sharing / competing consumers).",
      points: [
        { label: "Multiple independent consumers", body: "Several consumers each running their own <code>XREAD</code> all see <strong>every</strong> entry, tracking their own position. This is fan-out: three services each reacting to every order, none aware of the others." },
        { label: "Consumer group = load balancing", body: "<code>XGROUP CREATE orders workers $</code> creates a group. Every member then calls <code>XREADGROUP GROUP workers worker1 ...</code>; Redis hands each new entry to <strong>exactly one</strong> member, spreading load across <code>worker1</code>, <code>worker2</code>, and so on. A second group reading the same stream still sees everything independently." },
        { label: "Consumer group flow", body: "<strong>Producer \u2192 Stream \u2192 Consumer Group \u2192 Consumer.</strong> The group holds a <strong>last-delivered-ID</strong> cursor so it never re-hands the same new entry twice, and it remembers which entries each consumer still owes an ACK." }
      ],
      table: {
        headers: ["Command", "Role in the group", "Example"],
        rows: [
          ["<strong>XGROUP CREATE</strong>", "Create a group, starting at an ID (<code>$</code> = only new, <code>0</code> = from start)", "<code>XGROUP CREATE orders workers $</code>"],
          ["<strong>XREADGROUP</strong>", "Read as a named consumer; <code>&gt;</code> = new (undelivered) entries", "<code>XREADGROUP GROUP workers worker1 COUNT 1 STREAMS orders &gt;</code>"],
          ["<strong>XINFO GROUPS</strong>", "Inspect a group: consumers, lag, last-delivered-ID", "<code>XINFO GROUPS orders</code>"]
        ]
      },
      callouts: [
        { color: "blue", label: "The '>' matters:", body: "<code>&gt;</code> asks for entries never delivered to <em>this</em> group. Any other ID (e.g. <code>0</code>) instead re-reads that consumer\u2019s own <strong>pending</strong> (delivered-but-unacked) entries, which is exactly how a restarted worker resumes unfinished work." }
      ]
    },

    reliability: {
      heading: "Acknowledgment, the PEL & Message Recovery",
      intro: "Consumer groups promise <strong>at-least-once</strong> delivery, and that promise is built on three pieces: an <strong>acknowledgment</strong>, a per-consumer <strong>Pending Entries List</strong>, and <strong>claim</strong> commands that let a healthy worker rescue a dead one\u2019s work.",
      points: [
        { label: "XACK and the PEL", body: "When Redis hands an entry to a consumer it records it in that consumer\u2019s <strong>Pending Entries List (PEL)</strong>. The entry stays there until the consumer calls <code>XACK orders workers &lt;id&gt;</code>. Un-ACKed = still owed = will be redelivered. No ACK, no forgetting." },
        { label: "Recovering a crashed consumer\u2019s work", body: "<code>XPENDING</code> lists what is stuck and for how long. <code>XCLAIM</code> transfers a specific pending entry to another consumer once it has been idle too long. <code>XAUTOCLAIM</code> automates that sweep, reassigning idle entries in one call, the standard way to drain a dead worker\u2019s backlog." },
        { label: "Delivery semantics & idempotency", body: "Because a message can be delivered again after a crash (before its ACK), consumers must be <strong>idempotent</strong>: processing the same entry twice must be harmless. Dedupe on a business key or the entry ID. This is the same discipline as Idempotent APIs (3.6)." }
      ],
      table: {
        headers: ["Failure", "What happens", "Recovery"],
        rows: [
          ["<strong>Consumer crashes</strong>", "Its in-flight entries stay in the PEL, unacked", "<code>XAUTOCLAIM</code> / <code>XCLAIM</code> reassign them to a live consumer"],
          ["<strong>Redis crashes</strong>", "In-memory state is lost on the spot", "AOF/RDB replay restores the stream and PELs on restart (see 7.8, 7.9)"],
          ["<strong>Network failure</strong>", "ACK never reaches Redis; entry looks pending", "Entry is redelivered, so idempotent handling absorbs the duplicate"],
          ["<strong>Whole group falls behind</strong>", "Pending count and lag climb", "Add consumers, then reclaim old pending entries to catch up"]
        ]
      },
      callouts: [
        { color: "red", label: "At-least-once, never exactly-once:", body: "Streams guarantee an entry is delivered <strong>one or more</strong> times, not exactly once. Duplicates are a normal outcome of recovery, not a bug, so <strong>idempotent consumers</strong> are mandatory, not optional." }
      ]
    },

    scaling: {
      heading: "Scaling Consumers, Bounding Memory",
      intro: "A stream lives in <strong>RAM</strong>, so scaling is two problems at once: spreading read load across more workers, and stopping the log from growing until it evicts everything else.",
      points: [
        { label: "Scale within a group", body: "Add more consumers to a group and Redis spreads new entries across them automatically, more parallelism with zero code change. This is the first and cheapest lever." },
        { label: "Scale with multiple streams", body: "A single stream is one ordered log, so per-stream throughput has a ceiling. To go wider, <strong>shard</strong> across many streams (e.g. <code>orders:{region}</code>) and process each in parallel, the same partitioning idea as Kafka topics (8.2) and Partitioning (10.1)." },
        { label: "Retention with XTRIM / MAXLEN", body: "Cap the log so it cannot grow forever: <code>XADD orders MAXLEN ~ 100000 * ...</code> trims on write, or run <code>XTRIM orders MAXLEN 100000</code> separately. The <code>~</code> makes trimming <strong>approximate</strong> and far cheaper. Use <code>MINID</code> for <strong>time-based</strong> retention (drop everything older than a timestamp-derived ID)." }
      ],
      table: {
        headers: ["Retention control", "Effect", "Example"],
        rows: [
          ["<strong>MAXLEN</strong>", "Keep at most N entries", "<code>XTRIM orders MAXLEN 100000</code>"],
          ["<strong>MAXLEN ~</strong>", "Keep about N, trimming cheaply on write", "<code>XADD orders MAXLEN ~ 100000 * ...</code>"],
          ["<strong>MINID</strong>", "Drop entries older than an ID (time-based)", "<code>XTRIM orders MINID 1719849600000</code>"]
        ]
      },
      callouts: [
        { color: "red", label: "RAM-bound reality:", body: "An untrimmed stream grows until Redis runs out of memory and starts evicting or failing writes. <strong>Always set a retention bound</strong>, and remember trimmed entries are gone for consumers that had not read them yet." }
      ]
    },

    comparisons: {
      heading: "Streams vs Pub/Sub vs Kafka",
      intro: "Two comparisons decide whether Streams is the right tool. Against <strong>Pub/Sub</strong> (7.6) it is the durable upgrade; against <strong>Kafka</strong> (8.2) it is the lightweight substitute. See Queues vs Streams vs Pub/Sub (8.4) for the full messaging map.",
      tables: [
        {
          headers: ["Dimension", "Pub/Sub (7.6)", "Streams"],
          rows: [
            ["<strong>Persistence</strong>", "None, transient", "Stored until trimmed"],
            ["<strong>Replay</strong>", "No", "Yes, <code>XRANGE</code> from any ID"],
            ["<strong>Acknowledgment</strong>", "No, fire-and-forget", "Yes, <code>XACK</code>"],
            ["<strong>Consumer groups</strong>", "No", "Yes, competing consumers"],
            ["<strong>Offline consumer</strong>", "Misses everything", "Catches up on reconnect"]
          ]
        },
        {
          headers: ["Dimension", "Redis Streams", "Kafka (8.2)"],
          rows: [
            ["<strong>Scale</strong>", "Single node, under ~100K events/sec", "Millions/sec across a cluster"],
            ["<strong>Durability</strong>", "RAM + AOF/RDB, single-node", "Disk-first, replicated across brokers"],
            ["<strong>Partitioning</strong>", "Manual, via multiple streams", "Native, partitions per topic"],
            ["<strong>Consumer model</strong>", "Consumer groups + PEL", "Consumer groups + offsets"],
            ["<strong>Operational complexity</strong>", "Almost none if you run Redis", "A cluster to run and tune"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "Pick Streams when:", body: "You already run Redis, need <strong>durability</strong>, <strong>replay</strong>, and <strong>consumer groups</strong>, and your volume fits under a single node. It is not a Kafka replacement at Kafka scale, it is the right call below that line with zero new infrastructure." }
      ]
    },

    production: {
      heading: "Production, Use Cases & Design Patterns",
      intro: "Running Streams in production is mostly watching memory and consumer lag; the payoff is a small set of patterns it fits cleanly.",
      points: [
        { label: "Memory & retention", body: "The stream is in RAM, so an unbounded log is an outage waiting to happen. Set <code>MAXLEN</code>/<code>MINID</code>, and size retention to your slowest consumer plus a safety margin." },
        { label: "Consumer lag", body: "Watch <code>XINFO GROUPS</code> for growing <strong>lag</strong> and pending counts, the earliest signal that consumers cannot keep up. Fix by adding consumers or shedding load (see Backpressure, 10.8)." },
        { label: "Persistence & HA", body: "Durability is only as strong as your Redis persistence and failover setup: pair Streams with AOF and a replicated/HA topology (see 7.8 and 7.9). A stream on a single un-persisted node is not durable." }
      ],
      callouts: [
        { color: "yellow", label: "Real-world use cases:", body: "<strong>Order / event processing</strong> pipelines, <strong>notifications</strong>, <strong>activity feeds</strong>, <strong>background jobs</strong>, and <strong>audit / event logs</strong>, anywhere an event must survive a consumer being briefly down." },
        { color: "blue", label: "System design patterns:", body: "<strong>Event-driven processing</strong>, <strong>work queues</strong> (competing consumers with ACK), <strong>reliable background workers</strong> (PEL + claim so nothing is dropped on crash), and <strong>real-time event pipelines</strong> feeding stream processing (12.3) and real-time analytics (12.10)." }
      ]
    },

    handsOn: {
      prerequisites: "Docker (Redis 5+); `redis-cli`; 2 terminal windows for the workers.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis`.",
      simulate: "Build a stream: `XADD orders '*' item \"widget\" qty 3` a few times, then `XLEN orders` and `XRANGE orders - +` to see the ordered log and its `<ms>-<seq>` IDs. Create a group with `XGROUP CREATE orders workers '$'` and, in two terminals, loop `XREADGROUP GROUP workers worker1 COUNT 1 STREAMS orders >` (and `worker2` in the other). Add new entries and watch them split across the two workers, never duplicated. Now kill worker1 *before* it `XACK`s and run `XPENDING orders workers`: the unacked entry is still owed.",
      observe: "A worker that was offline when entries were added still receiving everything it missed on reconnect (the durability Pub/Sub in 7.6 explicitly lacks), and the killed worker\u2019s entry sitting in the PEL until `XAUTOCLAIM orders workers worker2 60000 0` reassigns it to the survivor, message recovery made concrete.",
      stretch: "Add `MAXLEN ~ 1000` to your `XADD` and confirm `XLEN` plateaus as you keep writing (retention working). Then benchmark a tight loop of 100,000 `XADD`s to feel the single-node ceiling, and contrast it with Kafka\u2019s numbers when you reach Module 8."
    }
  },

  keyTakeaways: [
    "A Stream is an append-only, persistent log of entries (each an <ms>-<seq> ID plus field/value pairs); readers start from any point and replay, which Pub/Sub cannot do.",
    "The chain Producer \u2192 Stream \u2192 Consumer Group \u2192 Consumers \u2192 ACK is the whole model: groups load-balance entries across consumers, and XACK + the Pending Entries List drive at-least-once delivery.",
    "Recovery is XPENDING/XCLAIM/XAUTOCLAIM to reclaim a dead worker\u2019s entries; because delivery is at-least-once, consumers must be idempotent.",
    "Streams are RAM-bound and single-node: cap growth with XTRIM/MAXLEN/MINID, and treat it as a lightweight Kafka below ~100K events/sec, not a Kafka replacement."
  ],
  proTip: "Reach for Streams the moment a consumer must survive a disconnect and replay what it missed. Always pair it with a retention bound (MAXLEN/MINID) and idempotent consumers, then track XPENDING so a crashed worker\u2019s entry is reclaimed instead of silently lost.",
  related: ["redis-pubsub", "redis", "redis-ha", "redis-cluster", "kafka", "message-queues", "messaging-comparison", "ordering", "idempotent-apis", "backpressure", "stream-processing"],
  bridgeOut: "Streams durability leans entirely on how Redis persists to disk and fails over. That persistence-and-HA story is the next lesson."
};
