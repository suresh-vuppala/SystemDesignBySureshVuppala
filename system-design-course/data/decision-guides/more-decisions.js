/* === Lesson more-decisions - part of Module 15 (Decision Guides) ===
   Source: system-design-cheatsheet/16-decision-flowcharts.html (#more-decisions)
   + system-design-cheatsheet-course-hierarchy.md, Module 15.7.
   Final lesson of the course: three standalone decision trees plus the
   interview meta-tip. Cheat-sheet content ported into the tab structure. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["more-decisions"] = {
  module: 15, num: "15.7", title: "More Decision Flowcharts",
  connectsFrom: "The course closes by tying threads from several earlier modules into three final, standalone decision points: <strong>Sync vs Async</strong>, <strong>Monolith vs Microservices</strong>, and <strong>SQL vs NoSQL</strong>. Each is a lookup into a trade-off already explained in depth; the value here is speed of recall under pressure.",
  tabs: {
    overview: {
      heading: "Three Final Decision Trees",
      intro: "These are the questions almost every design interview eventually asks. Each is a short walk, and each traces back to an earlier module for the full reasoning.",
      cards: [
        { icon: "S", title: "Sync vs Async", color: "blue", body: "Need an immediate response? \u2192 <strong>Sync</strong> (HTTP/gRPC). If not, need retry/replay? \u2192 <strong>Event Stream</strong> (Kafka). Else multiple consumers? \u2192 <strong>Pub/Sub</strong>, otherwise \u2192 <strong>Task Queue</strong>. See 3.4." },
        { icon: "M", title: "Monolith vs Microservices", color: "orange", body: "A spectrum, not a binary: <strong>Monolith</strong> \u2192 <strong>Modular Monolith</strong> \u2192 <strong>SOA / Mini-services</strong> \u2192 <strong>Microservices</strong>, chosen by team size, deploy independence, and stack diversity. See 5.2." },
        { icon: "Q", title: "SQL vs NoSQL", color: "green", body: "Need ACID + joins? \u2192 <strong>SQL</strong>. Else write-heavy (&gt;100K/sec)? \u2192 <strong>Wide-Column</strong>. Else flexible JSON? \u2192 <strong>Document</strong>. Else \u2192 <strong>Key-Value</strong>. See 6.3 to 6.5." }
      ],
      table: {
        headers: ["Decision", "First question", "Named outcomes"],
        rows: [
          ["<strong>Sync vs Async</strong>", "Does the caller need the result now?", "Sync \u00b7 Event Stream \u00b7 Pub/Sub \u00b7 Task Queue"],
          ["<strong>Monolith vs Microservices</strong>", "Team size &gt; 10 engineers?", "Monolith \u00b7 Modular Mono \u00b7 SOA \u00b7 Microservices"],
          ["<strong>SQL vs NoSQL</strong>", "Need ACID + complex joins?", "SQL \u00b7 Wide-Column \u00b7 Document \u00b7 Key-Value"]
        ]
      },
      callouts: [
        { color: "blue", label: "Interview meta-tip:", body: "When asked \u201chow would you design X?\u201d start by identifying which of these decisions apply. Most systems need: <strong>API style</strong> (REST/gRPC) + <strong>database</strong> (SQL/NoSQL) + <strong>communication</strong> (sync/async) + <strong>caching strategy</strong>. Name the trade-off explicitly: \u201cI am choosing X over Y because of Z constraint.\u201d" },
        { color: "green", label: "Two quick rules:", body: "Sync vs Async: <strong>if the caller cannot wait, go async; if you need replay, go Kafka.</strong> Monolith vs Microservices: <strong>start monolith, go modular, split to services only when team or scale demands it.</strong>" }
      ]
    },
    tradeoffs: {
      heading: "The Decision Criteria",
      intro: "Each of the three trees is a trade-off, not a fashion. Here is what actually forces each branch.",
      points: [
        { label: "Sync vs Async: can the caller wait?", body: "If the caller needs the answer to proceed, the call is synchronous (HTTP, gRPC): simple, but the caller is blocked and coupled to the callee\u2019s uptime. If it can be notified later, go async: a <strong>Task Queue</strong> for one-off work, an <strong>Event Stream</strong> when you need retry and replay, <strong>Pub/Sub</strong> when multiple consumers must react." },
        { label: "Monolith vs Microservices: a 4-point spectrum", body: "This is not binary. Small team, simple deploy \u2192 <strong>Monolith</strong>. Growing, want bounded contexts in one deploy unit \u2192 <strong>Modular Monolith</strong>. Need independent deploys on a shared stack \u2192 <strong>SOA / Mini-services</strong>. Need different stacks and full deploy independence \u2192 <strong>Microservices</strong>, and you accept the operational tax of distributed systems." },
        { label: "Microservices are earned, not defaulted", body: "The rule is start monolith, go modular, and split to services only when team size, deployment independence, or operational maturity genuinely demand it. Premature microservices buy you network failures, distributed transactions, and deploy complexity before you have the team to run them." },
        { label: "SQL vs NoSQL: the same DB decision, condensed", body: "This restates 15.2 with NoSQL\u2019s three sub-branches spelled out: relationships and ACID \u2192 <strong>SQL</strong>; huge write throughput \u2192 <strong>Wide-Column</strong> (Cassandra); flexible documents \u2192 <strong>Document</strong> (MongoDB); fastest key lookups \u2192 <strong>Key-Value</strong> (Redis/DynamoDB). Rule of thumb: relationships \u2192 SQL, scale writes \u2192 Cassandra, flexible \u2192 Mongo." },
        { label: "The meta-skill: name the constraint", body: "Every one of these is won not by the answer but by the sentence \u201cX over Y because of Z.\u201d The decision guides exist so that under pressure you reach for the constraint first and the technology second." }
      ]
    }
  },
  keyTakeaways: [
    "<strong>Sync vs Async</strong>: caller must wait \u2192 sync; can be notified later \u2192 Task Queue, Event Stream (replay), or Pub/Sub (many consumers).",
    "<strong>Monolith vs Microservices</strong> is a 4-point spectrum earned by team size and deploy needs, not a default: start monolith, split later.",
    "Every decision in this course is won by naming the constraint: \u201cX over Y because of Z\u201d is the sentence that scores."
  ],
  proTip: "Keep a mental checklist for any design prompt: API style, database, sync vs async, caching, scaling. Walk each tree out loud, name the constraint at every fork, and you have a defensible architecture before you draw a single box.",
  related: ["async-apis", "sql", "nosql", "api-choice", "db-choice", "messaging-choice"],
  bridgeOut: "That is the whole course: fourteen modules of tools, and a final module of trees that pick between them. From here on the skill is not learning more technologies, it is diagnosing the constraint fast and naming the trade-off with confidence."
};
