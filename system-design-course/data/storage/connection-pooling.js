/* === Lesson connection-pooling - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#connection-pooling)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.12.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["connection-pooling"] = {
  module: 6, num: "6.12", title: "Connection Pooling",
  connectsFrom: "Every database lesson so far assumes a service can just \u201copen a connection.\u201d Doing that per request is expensive, and databases cap concurrent connections hard. A pooler reuses a small set of real connections across many clients.",
  tabs: {
    overview: {
      heading: "Reuse, Do Not Reopen",
      intro: "Opening a connection per request costs a TCP handshake plus an auth handshake every time, and a traffic spike can exhaust the database's connection cap outright. A <strong>pooler</strong> holds a small set of open connections and multiplexes many clients over them.",
      cards: [
        { icon: "P", title: "PgBouncer", color: "green", body: "Postgres pooler with 3 modes: <strong>session</strong>, <strong>transaction</strong>, and <strong>statement</strong>. Transaction mode gives the most reuse." },
        { icon: "H", title: "HikariCP", color: "blue", body: "In-process pool for JVM apps. Fast, widely used default for Java services." },
        { icon: "X", title: "ProxySQL", color: "orange", body: "MySQL proxy that pools connections and adds query routing on top." },
        { icon: "R", title: "RDS Proxy", color: "purple", body: "Managed, AWS-native, IAM-aware pooler. Purpose-built to sit in front of serverless functions." }
      ],
      table: {
        headers: ["Pooler", "Stack", "Mode"],
        rows: [
          ["PgBouncer", "Postgres", "session / transaction / statement"],
          ["HikariCP", "Java / JVM", "in-process"],
          ["ProxySQL", "MySQL", "proxy + query routing"],
          ["RDS Proxy", "AWS", "managed, IAM-aware"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Serverless gotcha:", body: "1,000 Lambda containers \u00d7 5 connections each = 5,000 attempted connections against a database capped at 100. That is exactly why RDS Proxy or a pooler sits in front of serverless functions: many clients, few real connections." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Postgres + PgBouncer images).",
      setup: "Local and free: `docker run -d -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres -c max_connections=20` (a deliberately small cap) plus a PgBouncer container in front of it in transaction mode.",
      simulate: "Write a script that opens 50 direct connections to Postgres concurrently (no pooler) and watch it start erroring with \u201ctoo many connections\u201d once it crosses 20. Repeat the exact same script pointed at PgBouncer instead.",
      observe: "PgBouncer absorbs all 50 client connections while holding only a small pool (say 10) of actual connections open to Postgres underneath: the many-clients-few-real-connections multiplexing that makes the serverless math work.",
      stretch: "Switch PgBouncer from transaction mode to session mode and re-run the same 50-connection test. Watch it behave more like the no-pooler case, since session mode holds one backend connection per client for the whole session instead of only during an active transaction."
    }
  },
  keyTakeaways: [
    "Opening a connection per request pays a TCP plus auth handshake every time, and a spike can blow past the database's hard connection cap.",
    "A pooler multiplexes many client connections over a small set of real backend connections, so the database sees far fewer than the clients think they hold.",
    "PgBouncer's transaction mode maximizes reuse; session mode holds a backend connection for a whole client session and behaves closer to no pooling."
  ],
  proTip: "Serverless makes pooling non-optional: thousands of short-lived function instances will each grab connections and exhaust the database. Put RDS Proxy or PgBouncer in front before you go to production.",
  related: ["sql", "nosql", "db-choice", "schema-migrations"],
  bridgeOut: "A focused operational lesson with no direct forward dependency: it makes every other storage engine in this module usable under real concurrency."
};
