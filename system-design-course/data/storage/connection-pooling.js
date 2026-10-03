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
      goal: "Cap Postgres at 20 connections, watch 50 direct clients start erroring with \u201ctoo many connections,\u201d then put PgBouncer in front and see the same 50 clients succeed over a small backend pool.",
      stack: "Postgres (capped) and PgBouncer in Docker, load script in Python. Local and free.",
      steps: [
        {
          title: "Start Postgres with a deliberately small connection cap",
          code: "docker network create pool-net\ndocker run -d --name pg --network pool-net -e POSTGRES_HOST_AUTH_METHOD=trust postgres -c max_connections=20",
          lang: "bash"
        },
        {
          title: "Open 50 concurrent connections directly, no pooler",
          body: "Save as <code>flood.py</code>. It holds each connection open so they pile up past the cap. Run against port 5432 first.",
          code: `# flood.py - open N connections at once and hold them
import sys, threading, time
import psycopg2

host, port = sys.argv[1], int(sys.argv[2])
errors = []

def hold():
    try:
        c = psycopg2.connect(host=host, port=port, user="postgres", dbname="postgres")
        c.cursor().execute("SELECT pg_sleep(5)")
    except Exception as e:
        errors.append(str(e).strip())

threads = [threading.Thread(target=hold) for _ in range(50)]
for t in threads: t.start()
for t in threads: t.join()
print("failed:", len(errors))
if errors: print("example:", errors[0])`,
          lang: "python"
        },
        {
          title: "Run it straight at Postgres and watch it fail",
          body: "Expose Postgres on the host, install the driver, and flood it.",
          code: "docker run -d --name pg-direct --network pool-net -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres -c max_connections=20\npip install psycopg2-binary\npython flood.py localhost 5432",
          lang: "bash"
        },
        {
          title: "Put PgBouncer in transaction mode in front",
          body: "PgBouncer accepts all 50 clients but keeps only a small pool open to Postgres.",
          code: "docker run -d --name pgbouncer --network pool-net -p 6432:6432 \\\n  -e DATABASES_HOST=pg -e DATABASES_PORT=5432 -e DATABASES_USER=postgres -e DATABASES_DBNAME=postgres \\\n  -e POOL_MODE=transaction -e DEFAULT_POOL_SIZE=10 -e AUTH_TYPE=trust \\\n  edoburu/pgbouncer",
          lang: "bash"
        },
        {
          title: "Rerun the same flood through PgBouncer",
          code: "python flood.py localhost 6432",
          lang: "bash"
        }
      ],
      observe: "Straight at Postgres, connections past 20 fail with \u201csorry, too many clients already.\u201d Through PgBouncer, all 50 clients succeed while only ~10 real backend connections exist: many clients multiplexed over few connections, the math that makes serverless work.",
      stretch: "Switch PgBouncer to <code>POOL_MODE=session</code> and rerun the 50-connection flood. It behaves more like the no-pooler case, since session mode holds one backend connection per client for the whole session instead of only during an active transaction."
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
