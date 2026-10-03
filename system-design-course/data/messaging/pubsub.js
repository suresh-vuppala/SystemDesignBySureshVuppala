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
      goal: "Fan one SNS publish out to two independent SQS queues and prove each subscriber gets its own full copy, unlike a queue where one consumer wins the message.",
      stack: "AWS CLI driving SNS and SQS (both in the AWS free tier). No local broker to run.",
      steps: [
        {
          title: "Create the topic and two queues",
          code: "aws sns create-topic --name orders\naws sqs create-queue --queue-name orders-a\naws sqs create-queue --queue-name orders-b",
          lang: "bash"
        },
        {
          title: "Capture ARNs and subscribe both queues",
          body: "Standard SNS-fan-out-to-SQS: each queue becomes an independent subscriber of the topic.",
          code: "TOPIC=$(aws sns create-topic --name orders --query TopicArn --output text)\nA_URL=$(aws sqs get-queue-url --queue-name orders-a --query QueueUrl --output text)\nB_URL=$(aws sqs get-queue-url --queue-name orders-b --query QueueUrl --output text)\nA_ARN=$(aws sqs get-queue-attributes --queue-url $A_URL --attribute-names QueueArn --query Attributes.QueueArn --output text)\nB_ARN=$(aws sqs get-queue-attributes --queue-url $B_URL --attribute-names QueueArn --query Attributes.QueueArn --output text)\naws sns subscribe --topic-arn $TOPIC --protocol sqs --notification-endpoint $A_ARN\naws sns subscribe --topic-arn $TOPIC --protocol sqs --notification-endpoint $B_ARN",
          lang: "bash"
        },
        {
          title: "Allow SNS to deliver into the queues",
          body: "Each queue needs an access policy granting SNS <code>sqs:SendMessage</code>, or the delivery is silently dropped.",
          code: "POLICY='{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"sns.amazonaws.com\"},\"Action\":\"sqs:SendMessage\",\"Resource\":\"*\"}]}'\naws sqs set-queue-attributes --queue-url $A_URL --attributes Policy=\"$POLICY\"\naws sqs set-queue-attributes --queue-url $B_URL --attributes Policy=\"$POLICY\"",
          lang: "bash"
        },
        {
          title: "Publish one message",
          code: "aws sns publish --topic-arn $TOPIC --message '{\"event\":\"OrderPlaced\",\"id\":1}'",
          lang: "bash"
        },
        {
          title: "Read both queues, then delete from A only",
          body: "Both queues hold their own copy of the single publish. Deleting A's copy leaves B's untouched.",
          code: "aws sqs receive-message --queue-url $A_URL\naws sqs receive-message --queue-url $B_URL\nRH=$(aws sqs receive-message --queue-url $A_URL --query 'Messages[0].ReceiptHandle' --output text)\naws sqs delete-message --queue-url $A_URL --receipt-handle $RH\naws sqs get-queue-attributes --queue-url $B_URL --attribute-names ApproximateNumberOfMessages",
          lang: "bash"
        }
      ],
      observe: "The single publish arrives independently in <strong>both</strong> queues, each with its own copy: the broadcast / fan-out shape, not the one-consumer-wins model of a plain queue. After you delete A's copy, B still reports one message available, proving the two subscriptions are fully independent.",
      stretch: "Add a subscription filter policy on one queue (for example attribute <code>region: eu</code>), publish two messages (one matching, one not), and confirm the filtered queue receives only the matching message."
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
