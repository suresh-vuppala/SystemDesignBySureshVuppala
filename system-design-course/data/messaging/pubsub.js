/* === Lesson pubsub - part of Module 8 (Messaging) ===
   Source: system-design-cheatsheet/08-messaging.html (#pubsub)
   + system-design-cheatsheet-course-hierarchy.md, Module 8.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["pubsub"] = {
  module: 8, num: "8.3", title: "Pub/Sub (SNS / Google Pub/Sub)",
  connectsFrom: "The queue and Kafka both assume you are managing your own broker cluster. Pub/Sub is the managed, broadcast-shaped alternative: publish once, and every interested subscriber gets its own copy.",
  tabs: {
    overview: {
      heading: "Publish Once, Every Subscriber Gets a Copy",
      intro: "Publishers <strong>broadcast (fan-out)</strong> to a topic, and every subscriber receives its <strong>own independent copy</strong>. Conceptually it is the shape of Redis Pub/Sub, but durable and managed rather than fire-and-forget.",
      cards: [
        { icon: "F", title: "Fan-out", color: "blue", body: "One publish, <strong>N independent deliveries</strong>. Add a subscriber and it starts receiving new messages without touching the publisher." },
        { icon: "C", title: "Independent Copies", color: "green", body: "Unlike a queue where one consumer wins the message, here <strong>every subscriber</strong> gets its own full copy. Subscriptions are fully independent." },
        { icon: "M", title: "Fully Managed", color: "purple", body: "No broker cluster to run. SNS pushes to SQS, Lambda, HTTP, email, or SMS; Google Pub/Sub adds seek-to-timestamp and ordering keys." }
      ],
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>At-least-once delivery</strong> to every subscriber. <strong>Independent processing</strong>. <strong>Fully managed</strong>. Google Pub/Sub: <strong>seek to timestamp</strong>, <strong>ordering keys</strong>, <strong>exactly-once delivery</strong>. SNS: push to SQS/Lambda/HTTP/email/SMS." },
        { color: "blue", label: "Common combined pattern:", body: "<strong>SNS \u2192 SQS \u2192 Lambda</strong>: fan out with Pub/Sub, then queue each branch so every downstream processes reliably and independently." }
      ]
    },
    realWorld: {
      heading: "Where Pub/Sub Runs",
      intro: "The broadcast shape fits event-driven microservices where many services react to the same event.",
      points: [
        { label: "Spotify", body: "Google Pub/Sub for event-driven microservices." },
        { label: "Shopify", body: "SNS + SQS for order event fan-out." },
        { label: "Uber", body: "Google Pub/Sub for cross-service event propagation." }
      ]
    },
    tradeoffs: {
      heading: "What Pub/Sub Gives Up",
      intro: "Broadcast delivery is simple and managed, but it is not a durable log and not a work queue.",
      points: [
        { label: "No long retention by default", body: "Messages are meant for live delivery, not durable history (SNS keeps none; Google Pub/Sub keeps about 7 days)." },
        { label: "No consumer-side replay in SNS", body: "A subscriber added after a publish never sees the earlier message. There is no rewind." },
        { label: "Ordering not guaranteed by default", body: "You need explicit ordering keys (Google Pub/Sub) to keep related messages in order." },
        { label: "Not for point-to-point work queues", body: "Broadcasting a task to many subscribers causes duplicate processing. Use a queue when exactly one worker should handle a job." }
      ]
    },
    handsOn: {
      prerequisites: "AWS free-tier account (SNS and SQS are both in the free tier).",
      setup: "Cloud free-tier: an SNS topic with 2 SQS queues subscribed to it (the standard SNS-fan-out-to-SQS pattern).",
      simulate: "Publish one message to the SNS topic and confirm it independently arrives in <strong>both</strong> subscribed SQS queues, each with its own copy. Then have one consumer (a script polling queue A) process and delete its copy while queue B\u2019s message sits untouched, proving the two subscriptions are fully independent.",
      observe: "Unlike a queue (one message, one consumer wins it), both subscribers get their own full copy: the broadcast/fan-out shape, confirmed by checking both queues\u2019 message counts after the publish.",
      stretch: "Add a subscription filter policy on one queue (for example, only messages with attribute `region: eu`) and publish 2 messages, one matching and one not. Confirm the filtered queue only receives the matching one."
    }
  },
  keyTakeaways: [
    "Pub/Sub is <strong>broadcast (fan-out)</strong>: one publish delivers an independent copy to every subscriber, not to just one competing consumer.",
    "It is fully managed and delivers at-least-once, but by default offers <strong>no replay</strong> (SNS) and <strong>no guaranteed ordering</strong> without explicit ordering keys.",
    "The classic pattern is <strong>SNS \u2192 SQS \u2192 Lambda</strong>: fan out to topics, then queue each branch for reliable independent processing."
  ],
  proTip: "Reach for Pub/Sub when you want to broadcast a notification and let each consumer decide what to do. If you need durable replayable history, that is Kafka, not SNS.",
  related: ["message-queues", "kafka", "messaging-comparison", "dlq", "messaging-choice"],
  bridgeOut: "Next, the three patterns go side by side: queues vs streams vs Pub/Sub, so the decision stops requiring memorized product names."
};
