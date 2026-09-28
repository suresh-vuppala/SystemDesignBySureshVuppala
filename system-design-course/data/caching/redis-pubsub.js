/* === Lesson redis-pubsub - part of Module 7 (Caching) ===
   Source: system-design-cheatsheet/07-caching.html (#redis-pubsub)
   + system-design-cheatsheet-course-hierarchy.md, Module 7.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["redis-pubsub"] = {
  module: 7, num: "7.6", title: "Redis Pub/Sub",
  connectsFrom: "Three people in a chat room; one sends a message; the other two need to see it instantly, not on their next poll. Redis Pub/Sub is the fire-and-forget broadcast built for exactly that.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "commands", label: "Commands & Flow", icon: "swap" },
    { key: "scaling", label: "Multiple Instances & Scaling", icon: "layers" },
    { key: "delivery", label: "Delivery & Failures", icon: "alert" },
    { key: "streams", label: "Pub/Sub vs Streams", icon: "scale" },
    { key: "production", label: "Production & Patterns", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Fire-and-Forget Real-Time Broadcast",
      intro: "Without Pub/Sub, clients <strong>poll</strong> the server on a timer: wasted requests, added latency, and load that scales with the number of clients. Pub/Sub flips it to <strong>push</strong>: publishers send to a channel and every subscriber currently listening gets the message instantly, fully <strong>decoupled</strong> from each other. If nobody is listening, the message is gone: <strong>no history, no replay, no persistence</strong>, on purpose. That is the trade for sub-millisecond fan-out.",
      cards: [
        { icon: "P", title: "Publisher", color: "blue", body: "Sends a message to a named channel with <code>PUBLISH</code>, and never knows or cares who (if anyone) is listening." },
        { icon: "C", title: "Channel + Subscriber", color: "green", body: "A channel is just a name. A subscriber joins one with <code>SUBSCRIBE</code>, or a whole family with <code>PSUBSCRIBE chat:*</code>, and receives every message sent while it is connected." },
        { icon: "!", title: "No safety net", color: "red", body: "No persistence, no replay, no acknowledgment, no consumer groups. A message published while you were offline is gone forever." }
      ],
      callouts: [
        { color: "green", label: "Core mental model:", body: "<strong>Publisher \u2192 Channel \u2192 Subscriber.</strong> The channel decouples the two sides: publishers do not know subscribers, subscribers do not know publishers, and Redis fans each message out to every current listener in &lt;1ms." },
        { color: "yellow", label: "Why not just poll:", body: "Polling wastes requests when nothing changed, adds up to one poll-interval of latency, and its load grows with client count. Pub/Sub pushes only when there is something to send." }
      ]
    },
    commands: {
      heading: "Commands and Message Flow",
      intro: "Four commands cover everything. The read/write flow is a single hop: <strong>Publisher \u2192 Redis channel \u2192 every current subscriber</strong>, with no storage in between.",
      table: {
        headers: ["Command", "What It Does", "Example"],
        rows: [
          ["<strong>PUBLISH</strong>", "Send a message to a channel; returns the number of subscribers that received it", "<code>PUBLISH chat:room1 \"Hello!\"</code>"],
          ["<strong>SUBSCRIBE</strong>", "Listen on one or more exact channel names", "<code>SUBSCRIBE chat:room1</code>"],
          ["<strong>UNSUBSCRIBE</strong>", "Stop listening on a channel (or all channels)", "<code>UNSUBSCRIBE chat:room1</code>"],
          ["<strong>PSUBSCRIBE</strong>", "Listen on a glob pattern, matching many channels at once", "<code>PSUBSCRIBE chat:*</code>"]
        ]
      },
      callouts: [
        { color: "blue", label: "Channels and pattern matching:", body: "A channel is created implicitly on first publish, there is nothing to declare. <code>SUBSCRIBE</code> takes exact names; <code>PSUBSCRIBE</code> takes patterns (<code>news.*</code>, <code>chat:room?</code>). Many subscribers can listen to the same channel, and one subscriber can hold many subscriptions." },
        { color: "green", label: "Read/write flow:", body: "<strong>Publisher \u2192 Redis channel \u2192 subscribers.</strong> Redis holds the message just long enough to fan it out to whoever is connected right now, then forgets it. There is no queue and no disk write on the path." }
      ]
    },
    scaling: {
      heading: "Redis as the Message Broker Across Instances",
      intro: "This is the single most important production use of Pub/Sub. A real app runs <strong>many identical instances</strong> behind a load balancer, and each client holds a long-lived connection ([[websocket-deep|WebSocket]] or [[sse-deep|SSE]]) to <em>one</em> of them. When something happens on Instance A, clients connected to B, C, and D must hear about it too. An in-process event bus cannot cross the process boundary, so you need a shared broker. Redis Pub/Sub is that broker.",
      table: {
        headers: ["Step", "What Happens", "Detail"],
        rows: [
          ["<strong>1. Client connects</strong>", "A user\u2019s connection is held open by one instance", "The user\u2019s [[websocket-deep|WebSocket]] lives on App Instance A. Other users sit on B, C, or D. No instance holds them all."],
          ["<strong>2. Instance publishes</strong>", "On an event, that instance publishes to Redis", "Instead of trying to reach B, C, D directly, Instance A runs <code>PUBLISH chat:room1 \"hi\"</code>. It does not know or care which instances are listening."],
          ["<strong>3. Redis fans out</strong>", "Every subscribed instance receives it in &lt;1ms", "Instances B, C, and D each hold a <code>SUBSCRIBE chat:room1</code>, so Redis delivers the message to all of them at once."],
          ["<strong>4. Each pushes locally</strong>", "Instances forward to their own clients", "B, C, and D each push the message over the open [[websocket-deep|WebSocket]] connections <em>they</em> hold. The user on B sees a message that originated on A."]
        ]
      },
      points: [
        { label: "Multiple publishers and subscribers", body: "Any number of instances can publish to a channel and any number can subscribe; Redis fans every message to all current listeners with no coordination between them. Add or remove instances freely, the broker does not care." },
        { label: "Replication", body: "Messages published to a primary propagate to its replicas, so subscribers connected to a replica also receive them. Replication (see [[replication|Replication]]) adds read fan-out capacity here, not durability, Pub/Sub is still transient." }
      ],
      callouts: [
        { color: "green", label: "Why Redis, and not instance-to-instance:", body: "Direct fan-out would need every instance to know every other instance\u2019s address and hold an N\u00d7N mesh of connections that breaks the moment you autoscale. Routing through Redis gives <strong>decoupling</strong> (instances only know the channel), <strong>elasticity</strong> (scale the fleet without rewiring), and <strong>simplicity</strong> (one hop, no mesh). This is exactly the fan-out mechanism the [[websocket-deep|WebSocket]] and [[realtime|real-time delivery]] lessons rely on." },
        { color: "yellow", label: "Redis Cluster consideration:", body: "In classic [[redis-cluster|Redis Cluster]], a published message is broadcast to <strong>every</strong> node so a subscriber on any node receives it, which wastes inter-node bandwidth at scale. <strong>Sharded Pub/Sub</strong> (<code>SPUBLISH</code>/<code>SSUBSCRIBE</code>, Redis 7+) confines a channel to a single shard to fix that." },
        { color: "red", label: "The catch at this scale:", body: "If Instance B is momentarily disconnected from Redis, or a client reconnects to a different instance mid-blip, the in-flight message is <strong>lost</strong>, there is no catch-up. When missed messages across instances are unacceptable, move to [[redis-streams|Redis Streams]] with consumer groups." }
      ]
    },
    delivery: {
      heading: "Delivery Semantics and Failure Modes",
      intro: "Pub/Sub makes exactly one delivery promise: if you are connected when a message is published, you get it once. Everything else is a non-guarantee you must design around.",
      points: [
        { label: "Fire-and-forget, at-most-once", body: "A message is delivered to current subscribers <strong>at most once</strong> and never stored. There is no acknowledgment and no redelivery: if delivery fails, the message is simply lost." },
        { label: "Ordering", body: "Within a single channel, a given subscriber sees messages in publish order (FIFO). There is <strong>no durable replay</strong> and <strong>no cross-channel ordering guarantee</strong>." }
      ],
      table: {
        headers: ["Failure Scenario", "What Happens", "Consequence"],
        rows: [
          ["<strong>Subscriber disconnected</strong>", "Messages published during the gap are not queued", "Everything sent while offline is missed"],
          ["<strong>Redis unavailable</strong>", "Publishes and subscriptions fail outright", "No delivery at all until Redis returns"],
          ["<strong>Application restart</strong>", "Subscriptions drop and must be re-established", "A gap window where messages are lost"],
          ["<strong>Slow subscriber</strong>", "Redis buffers, then disconnects the client past a limit", "Message loss plus a dropped connection"]
        ]
      }
    },
    streams: {
      heading: "Pub/Sub vs Redis Streams",
      intro: "The moment you need an offline consumer to catch up, Pub/Sub is the wrong tool. [[redis-streams|Redis Streams]] is the persistent counterpart. This is the single most important distinction to get right.",
      table: {
        headers: ["Dimension", "Pub/Sub", "Streams"],
        rows: [
          ["<strong>Persistence</strong>", "None, transient", "Stored in the log until trimmed"],
          ["<strong>Replay</strong>", "No", "Yes, read from any ID"],
          ["<strong>Acknowledgment</strong>", "No", "Yes (<code>XACK</code>)"],
          ["<strong>Consumer groups</strong>", "No", "Yes, work split across consumers"],
          ["<strong>Offline consumer</strong>", "Misses everything", "Catches up on reconnect"],
          ["<strong>Best for</strong>", "Ephemeral real-time signals", "Durable event streams, task queues"]
        ]
      }
    },
    production: {
      heading: "Production Considerations and Patterns",
      intro: "Running Pub/Sub in production is mostly about connection health and knowing which design patterns it legitimately fits.",
      points: [
        { label: "Connection management", body: "A subscriber connection is dedicated: it cannot run normal commands while subscribed. Pool separately, and auto-reconnect and re-subscribe on drop (with backoff plus jitter), accepting the gap-window message loss." },
        { label: "Backpressure", body: "A slow subscriber makes Redis buffer output; past the client-output-buffer limit Redis disconnects it. Keep subscriber handlers fast, or hand off to a queue. See [[backpressure|Backpressure]]." },
        { label: "Monitoring", body: "Watch <code>PUBSUB CHANNELS</code> and <code>PUBSUB NUMSUB</code>, subscriber counts, and client-output-buffer usage to catch slow or leaking subscribers early." },
        { label: "Security", body: "Require auth (ACLs can scope which channels a user may publish or subscribe to), and use TLS since messages cross the network in the clear otherwise." }
      ],
      callouts: [
        { color: "yellow", label: "Use cases:", body: "<strong>Figma</strong> real-time collaboration signals. <strong>Slack</strong> online presence indicators. Cache invalidation across app servers. Chat typing indicators and live dashboards." },
        { color: "blue", label: "System design patterns:", body: "<strong>Real-time notifications</strong>, <strong>distributed [[cache-invalidation|cache invalidation]]</strong> (publish \u201cdrop key X\u201d to all app servers), <strong>chat / messaging fan-out</strong>, and <strong>live tracking / status</strong> dashboards. All share one trait: a missed message is harmless." }
      ]
    },
    realWorld: {
      heading: "Where Fire-and-Forget Fits",
      points: [
        { label: "Real-time collaboration signals", body: "Cursor positions, typing indicators, presence: data so ephemeral that a dropped message is meaningless a second later." },
        { label: "Online presence", body: "Who is online right now. If a subscriber misses an update, the next heartbeat corrects it, so durability is unnecessary." },
        { label: "Cross-server cache invalidation", body: "A callback to 7.2: publish \u201cinvalidate this key\u201d and every app server holding a local cache drops it the instant the data changes." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Redis); 2 terminal windows for `redis-cli`.",
      setup: "Local and free: `docker run -d -p 6379:6379 redis`.",
      simulate: "In terminal A, run `redis-cli SUBSCRIBE chat:room1` and leave it running. In terminal B, run `redis-cli PUBLISH chat:room1 \"hello\"` and watch it appear instantly in A. Now close terminal A (unsubscribe), publish another message from B, then reopen a subscriber in A.",
      observe: "The message published while nobody was subscribed simply never appears anywhere, no history, no replay, exactly as stated, made concrete instead of asserted. Then open 3 subscriber terminals at once and confirm a single `PUBLISH` reaches all 3 simultaneously.",
      stretch: "Use `PSUBSCRIBE chat:*` in one terminal and publish to `chat:room1`, `chat:room2`, and `chat:general` from another. Confirm the pattern subscriber catches all 3 while a plain `SUBSCRIBE chat:room1` subscriber only catches the first."
    }
  },
  keyTakeaways: [
    "Pub/Sub is a real-time broadcast: every current subscriber gets every message in under a millisecond, and PSUBSCRIBE pattern-matches channels.",
    "It is deliberately fire-and-forget: no persistence, no replay, no acknowledgment, no consumer groups. Offline subscribers miss everything.",
    "It fits ephemeral signals (presence, typing, collaboration) and cross-server cache invalidation, not anything that must survive a disconnect; the moment you need catch-up, use Streams."
  ],
  proTip: "Reach for Pub/Sub only when losing a message is harmless. The instant you need an offline consumer to catch up on what it missed, you need Streams, not Pub/Sub.",
  related: ["redis-streams", "redis", "cache-invalidation", "redis-cache", "redis-cluster", "backpressure", "pubsub"],
  bridgeOut: "Pub/Sub explicitly cannot guarantee delivery to an offline consumer. The next lesson is Redis's answer when that guarantee is required."
};
