/* === Lesson concurrency-io - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   Taught as one connected story with a dedicated tab per core comparison
   (Process vs Thread, Concurrency vs Parallelism, CPU vs I/O bound,
   Blocking vs Non-blocking) plus a numbers-driven "When to Choose What" tab.
   Uses the renderer's `customTabs` support. One file per lesson; each appends
   its slug's key to the shared window.COURSE_CONTENT object. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["concurrency-io"] = {
  module: 1, num: "1.7", title: "Concurrency & I/O Models",
  connectsFrom: "\u201cJust add more threads\u201d is the reflexive fix for a slow service, yet the tools that survive the most concurrent load (Redis, Nginx, Node.js) barely use any threads at all. That contradiction dissolves the moment you stop starting from threads and start from the <strong>workload</strong>: count the requests, measure where each one spends its time, and the architecture follows.",
  customTabs: [
    { key: "overview", label: "Start Here: Workload", icon: "book" },
    { key: "procThread", label: "Process vs Thread", icon: "layers" },
    { key: "concParallel", label: "Concurrency vs Parallelism", icon: "clock" },
    { key: "cpuIo", label: "CPU vs I/O Bound", icon: "cpu" },
    { key: "blocking", label: "Blocking vs Non-Blocking", icon: "swap" },
    { key: "eventLoop", label: "Event Loop (Node.js)", icon: "loop" },
    { key: "chooseWhat", label: "When to Choose What", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Start With the Workload, Not the Threads",
      intro: "Before choosing threads, processes, or an event loop, size the problem. The whole topic is one chain: <strong>workload \u2192 CPU/I-O profile \u2192 concurrency \u2192 threads/processes \u2192 blocking or non-blocking \u2192 parallelism \u2192 scaling decision</strong>. The numbers make each step meaningful: 10 requests/sec is a completely different system from 10,000 requests/sec, even at the same 100 ms per request. The tabs after this one take each comparison in turn, then show how the <strong>event loop</strong> actually implements non-blocking I/O, and finally turn it all into a numbers-driven decision.",
      diagram: {
        caption: "Read top to bottom. The workload's CPU-vs-I/O profile sends you down one of two paths (parallelism for compute, concurrency for waiting), and both converge on the same rule: measure the saturated resource before you scale anything.",
        svg: '<svg width="100%" viewBox="0 0 920 500" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'
          + '<defs><marker id="cio" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="var(--muted)"/></marker></defs>'
          + '<rect x="370" y="14" width="180" height="40" rx="8" fill="rgba(148,163,184,.10)" stroke="var(--border-strong)" stroke-width="1.5"/>'
          + '<text x="460" y="39" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="800">Incoming workload</text>'
          + '<line x1="460" y1="54" x2="460" y2="72" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="298" y="72" width="324" height="50" rx="8" fill="rgba(108,140,255,.08)" stroke="var(--border-strong)" stroke-width="1.5"/>'
          + '<text x="460" y="93" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">Where does each request spend its time?</text>'
          + '<text x="460" y="111" text-anchor="middle" fill="var(--muted)" font-size="10">Little\u2019s Law: concurrency \u2248 throughput \u00d7 latency</text>'
          + '<line x1="400" y1="122" x2="240" y2="148" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<line x1="520" y1="122" x2="680" y2="148" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="60" y="150" width="340" height="54" rx="8" fill="rgba(251,146,60,.12)" stroke="var(--brand-border)" stroke-width="1.6"/>'
          + '<text x="230" y="173" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">CPU-bound: the bottleneck is computation</text>'
          + '<text x="230" y="191" text-anchor="middle" fill="var(--muted)" font-size="10">encoding, ML inference, compression, encryption</text>'
          + '<line x1="230" y1="204" x2="230" y2="222" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="60" y="222" width="340" height="44" rx="8" fill="rgba(251,146,60,.06)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="230" y="249" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Parallelism: run on N cores at the same instant</text>'
          + '<line x1="230" y1="266" x2="230" y2="284" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="60" y="284" width="340" height="44" rx="8" fill="rgba(251,146,60,.06)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="230" y="311" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Threads or processes \u2248 CPU core count</text>'
          + '<rect x="520" y="150" width="340" height="54" rx="8" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1.6"/>'
          + '<text x="690" y="173" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">I/O-bound: the bottleneck is waiting</text>'
          + '<text x="690" y="191" text-anchor="middle" fill="var(--muted)" font-size="10">DB, REST/gRPC, Redis, Kafka, file, S3</text>'
          + '<line x1="690" y1="204" x2="690" y2="222" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="520" y="222" width="340" height="44" rx="8" fill="rgba(108,140,255,.06)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="690" y="249" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Concurrency: interleave, never sit idle</text>'
          + '<line x1="690" y1="266" x2="690" y2="284" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="520" y="284" width="340" height="44" rx="8" fill="rgba(108,140,255,.06)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="690" y="311" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Non-blocking I/O + event loop, few threads</text>'
          + '<line x1="230" y1="328" x2="380" y2="356" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<line x1="690" y1="328" x2="540" y2="356" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<rect x="310" y="356" width="300" height="46" rx="8" fill="rgba(52,211,153,.12)" stroke="var(--border-strong)" stroke-width="1.6"/>'
          + '<text x="460" y="384" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="800">Measure the bottleneck</text>'
          + '<line x1="460" y1="402" x2="460" y2="420" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#cio)"/>'
          + '<text x="460" y="436" text-anchor="middle" fill="var(--muted)" font-size="10">Scale or optimize whatever is actually saturated</text>'
          + '<rect x="20" y="448" width="208" height="44" rx="6" fill="rgba(148,163,184,.08)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="124" y="466" text-anchor="middle" fill="var(--text)" font-size="10.5" font-weight="700">CPU 95%+</text>'
          + '<text x="124" y="482" text-anchor="middle" fill="var(--muted)" font-size="9.5">add cores, scale out</text>'
          + '<rect x="244" y="448" width="208" height="44" rx="6" fill="rgba(148,163,184,.08)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="348" y="466" text-anchor="middle" fill="var(--text)" font-size="10.5" font-weight="700">Threads full, CPU low</text>'
          + '<text x="348" y="482" text-anchor="middle" fill="var(--muted)" font-size="9.5">go async, tune pools</text>'
          + '<rect x="468" y="448" width="208" height="44" rx="6" fill="rgba(148,163,184,.08)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="572" y="466" text-anchor="middle" fill="var(--text)" font-size="10.5" font-weight="700">DB CPU 95%+</text>'
          + '<text x="572" y="482" text-anchor="middle" fill="var(--muted)" font-size="9.5">cache, replicas, shard</text>'
          + '<rect x="692" y="448" width="208" height="44" rx="6" fill="rgba(148,163,184,.08)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="796" y="466" text-anchor="middle" fill="var(--text)" font-size="10.5" font-weight="700">Downstream slow</text>'
          + '<text x="796" y="482" text-anchor="middle" fill="var(--muted)" font-size="9.5">timeouts, batch, async</text>'
          + '</svg>'
      },
      callouts: [
        { color: "green", label: "Little's Law: does concurrency even matter yet?", body: "<strong>Concurrency \u2248 throughput \u00d7 latency</strong>. At <strong>10 req/sec \u00d7 100 ms</strong>, only ~1 request is in flight, so event loops and thread pools are premature. Scale the traffic and the picture flips: <strong>10,000 req/sec \u00d7 100 ms = 1,000 concurrent requests</strong>. That number, not a language preference, is what forces you to care about concurrency at all." },
        { color: "blue", label: "The real question is never \u201cthreads or processes?\u201d", body: "It is <strong>\u201cwhere is my bottleneck?\u201d</strong> Every tab here answers one piece: how work is isolated (process vs thread), how it overlaps (concurrency vs parallelism), what it is limited by (CPU vs I/O), and what a thread does while waiting (blocking vs non-blocking). The final tab turns those into one numbers-driven decision." }
      ]
    },
    procThread: {
      heading: "Process vs Thread",
      intro: "A <strong>process</strong> is an independently running program with its own memory space; a <strong>thread</strong> is a lightweight unit of execution inside a process that shares that memory with its siblings. The entire trade-off is <strong>isolation versus cheap sharing</strong>.",
      cards: [
        { icon: "P", title: "Process", color: "purple", body: "Own <strong>isolated memory</strong> and file descriptors. If Process A crashes, Process B keeps running. Reliable, but heavier to create and slower to communicate across. Nginx workers, Chrome tabs, Gunicorn workers." },
        { icon: "T", title: "Thread", color: "blue", body: "Runs <strong>inside</strong> a process and shares its memory. Cheap to spawn, fast to communicate, so you can have thousands. The catch: shared memory means <strong>race conditions</strong>. Java thread pools, Go goroutines, asyncio tasks." }
      ],
      table: {
        headers: ["Aspect", "Process", "Thread"],
        rows: [
          ["<strong>Memory</strong>", "Own isolated address space", "Shared within the process"],
          ["<strong>Isolation</strong>", "Crash-safe: A dies, B lives", "A bad thread can take the whole process down"],
          ["<strong>Creation cost</strong>", "Heavy (megabytes, slower)", "Light (kilobytes, fast)"],
          ["<strong>Memory each</strong>", "~1 to 10 MB (own heap)", "~256 KB to 1 MB stack (a goroutine starts ~2 KB)"],
          ["<strong>Communication</strong>", "IPC, sockets, pipes (slower)", "Shared memory (fast)"],
          ["<strong>Main risk</strong>", "More overhead per unit", "Race conditions, needs synchronization"],
          ["<strong>Examples</strong>", "Nginx workers, Chrome tabs, Gunicorn", "Tomcat pool, Go goroutines, asyncio"]
        ]
      },
      callouts: [
        { color: "purple", label: "Why shared memory needs locks", body: "Two threads read <code>balance = $100</code>, both withdraw $80, and without synchronization both still think the balance is $100. Threads are cheap and fast precisely because they share memory, but that same sharing is why you reach for <strong>locks, mutexes, atomic operations, and concurrent data structures</strong>." },
        { color: "blue", label: "Cheaper is not automatically better", body: "Threads win on cost, but <strong>isolation is something you pay for on purpose</strong>. A crashed Chrome tab does not take the browser down, and one bad Nginx worker does not take the site down. <strong>Postgres runs a process per connection</strong> for that isolation, which is exactly why teams put <strong>PgBouncer</strong> in front to keep the process count sane. Reach for processes when a fault must stay contained, not just when isolation sounds nice." },
        { color: "green", label: "When to choose which (with numbers)", body: "Use <strong>processes</strong> for isolation or to sidestep a runtime lock like Python's GIL: a common shape is <strong>1 worker process per core</strong> (an 8-core box runs <code>gunicorn -w 8</code>), each with a thread or async pool inside. Use <strong>threads/async</strong> for many cooperative tasks that share state. Spawning 10,000 processes for 10,000 connections is a terrible design; 10,000 lightweight tasks on a few threads is normal." }
      ]
    },
    concParallel: {
      heading: "Concurrency vs Parallelism",
      intro: "<strong>Concurrency</strong> is making progress on many tasks in the same period by rapidly switching between them; <strong>parallelism</strong> is many tasks executing at the literal same instant. Concurrency is about <em>dealing with</em> many things; parallelism is about <em>doing</em> many things at once. They are independent: you can have either without the other.",
      cards: [
        { icon: "\u21c4", title: "Concurrency", color: "green", body: "Interleave tasks on a <strong>single core</strong>, switching so fast it looks simultaneous. One core can hold thousands of connections when most are just waiting. This is the event-loop trick behind Redis and Node.js." },
        { icon: "\u2225", title: "Parallelism", color: "orange", body: "Tasks running at the <strong>same instant on N cores</strong>. The only way to go faster at pure computation. Kafka partitions, MapReduce, and ffmpeg using every core." }
      ],
      table: {
        headers: ["Aspect", "Concurrency", "Parallelism"],
        rows: [
          ["<strong>Cores needed</strong>", "1 is enough", "Requires N cores"],
          ["<strong>Mechanism</strong>", "Task switching / event loop", "Multiple cores executing at once"],
          ["<strong>Best for</strong>", "I/O-bound (lots of waiting)", "CPU-bound (lots of computing)"],
          ["<strong>What it buys</strong>", "Hides waiting time", "Multiplies compute throughput"],
          ["<strong>Example</strong>", "Redis: 100K ops/sec on 1 thread", "ffmpeg encoding across all 8 cores"],
          ["<strong>Ceiling</strong>", "The one core's compute budget", "The number of cores"]
        ]
      },
      callouts: [
        { color: "green", label: "One core, thousands of connections", body: "A single core handles thousands of <strong>concurrent</strong> connections when most are waiting on I/O, because it only does work when data is ready. This is exactly why Node.js and event loops scale to enormous connection counts: they are concurrent, not parallel." },
        { color: "blue", label: "When to choose which (with numbers)", body: "1,000 concurrent I/O-bound requests (mostly waiting) \u2192 <strong>concurrency</strong> on 1 to a few threads. 8 CPU-heavy tasks \u2192 <strong>parallelism</strong> across 8 cores. Adding 100 compute threads to an 8-core box does not give you 100 CPUs; those 100 threads fight over 8 cores and add context-switching overhead. Match compute concurrency to core count." },
        { color: "purple", label: "More is not automatically faster", body: "Extra <strong>concurrency</strong> does nothing for a CPU-bound task (it is already compute-limited), and extra <strong>cores</strong> do little for an I/O-bound one (it is already waiting). Parallelism also has a ceiling: by <strong>Amdahl\u2019s Law</strong>, if 90% of the work parallelizes, infinite cores still cap you near 10\u00d7, and coordination and locking eat into even that. Python\u2019s <strong>GIL</strong> is the classic gotcha: threads give concurrency but not CPU parallelism, so CPU-bound Python needs multiple processes." }
      ]
    },
    cpuIo: {
      heading: "CPU-Bound vs I/O-Bound",
      intro: "The single most important question about any request: <strong>where does it spend its time?</strong> Little's Law tells you how many requests are in flight; this tells you what they are doing while in flight. A request that is <strong>20 ms CPU + 80 ms database wait</strong> is I/O-bound (80% idle); one that is <strong>500 ms of computation</strong> is CPU-bound. This profile decides everything downstream.",
      cards: [
        { icon: "C", title: "CPU-bound", color: "orange", body: "The bottleneck is <strong>computation</strong>, with little waiting. More threads do not help past the core count; you need <strong>parallelism</strong> and more cores. Video encoding, image processing, compression, encryption, ML inference." },
        { icon: "I", title: "I/O-bound", color: "blue", body: "The bottleneck is <strong>waiting</strong> on network or disk. The CPU is mostly idle, so the fix is <strong>non-blocking I/O + concurrency</strong>, not more cores. DB queries, REST/gRPC calls, Redis, Kafka, file reads, S3." }
      ],
      table: {
        headers: ["Profile", "What dominates", "Examples", "Design lever"],
        rows: [
          ["<strong>CPU-bound</strong>", "Computation, almost no waiting", "Video encoding, image processing, compression, encryption, ML inference", "Parallelism near the core count"],
          ["<strong>I/O-bound</strong>", "Waiting on network or disk", "DB queries, REST/gRPC, Redis, Kafka, file reads, S3/object storage", "Non-blocking I/O + concurrency"]
        ]
      },
      callouts: [
        { color: "yellow", label: "How to tell which one you have", body: "Profile a single request. <strong>20 ms CPU + 80 ms waiting = 80% idle = I/O-bound</strong>. Near-100% CPU with almost no waiting = CPU-bound. Most web APIs are I/O-bound (they mostly wait on a database); media and ML pipelines are CPU-bound." },
        { color: "green", label: "When to choose which (with numbers)", body: "An <strong>I/O-bound</strong> API at 10,000 req/sec \u00d7 100 ms is 1,000 in flight, but each uses the CPU only ~5 ms, so a single event-loop thread copes. A <strong>CPU-bound</strong> service at 100 req/sec \u00d7 200 ms of compute needs roughly 20 cores' worth of parallel work, so you scale cores and machines, not threads." },
        { color: "blue", label: "Real requests are often mixed, and the profile shifts", body: "Few requests are purely one or the other. An image-thumbnail endpoint is <strong>I/O-bound fetching from S3, then CPU-bound resizing</strong>: keep the fetch on the event loop and push the resize to a <strong>worker pool</strong>. Profiles also shift under load: a cache hit is I/O-light, a cache miss turns DB-bound, and a response that grows adds serialization CPU. So <strong>measure, do not assume</strong>, and re-measure when traffic changes." }
      ]
    },
    blocking: {
      heading: "Blocking vs Non-Blocking I/O",
      intro: "Blocking I/O is <strong>not worse by default</strong>. It handles concurrency perfectly well by using more threads: 1,000 concurrent requests can run on a 1,000-thread pool where most threads simply wait, and that works. The real question is never \u201cwhich is faster\u201d (non-blocking makes no single call faster); it is <strong>at what scale does creating more threads cost more than multiplexing many I/O operations over a few threads?</strong>",
      cards: [
        { icon: "B", title: "Blocking", color: "teal", body: "The thread <strong>sleeps</strong> until the I/O returns, then continues. Simple to write and perfectly fine at moderate concurrency; the cost only shows up at scale, where 10,000 concurrent waits means roughly 10,000 threads. Apache, classic Java Servlet." },
        { icon: "N", title: "Non-blocking", color: "green", body: "Start the I/O, <strong>move on</strong> to other work, and resume when the OS signals ready (<strong>epoll/kqueue</strong>). One thread manages thousands of outstanding operations, doing work only when data arrives. Redis, Nginx, Node.js." }
      ],
      table: {
        headers: ["Aspect", "Blocking I/O", "Non-blocking I/O"],
        rows: [
          ["<strong>Thread while waiting</strong>", "Occupied, sleeps", "Freed to do other work"],
          ["<strong>10K connections</strong>", "\u2248 10,000 threads", "A few threads"],
          ["<strong>Memory at 10K</strong>", "~10 GB of thread stacks", "Megabytes"],
          ["<strong>Model</strong>", "Thread-per-connection", "Event loop + epoll/kqueue"],
          ["<strong>Breaks when</strong>", "Thread pool exhausts", "Per-event CPU work is heavy"],
          ["<strong>Sweet spot</strong>", "Moderate concurrency, healthy pools", "10K+ or long-lived connections, mostly waiting"],
          ["<strong>Examples</strong>", "Apache, Java Servlet", "Redis, Nginx, Node.js, Netty"]
        ]
      },
      tables: [
        {
          headers: ["Reach for non-blocking when...", "What it looks like (numbers / examples)"],
          rows: [
            ["<strong>Very high concurrency</strong>", "10K \u2192 100K \u2192 millions of connections: API gateways, chat, real-time feeds"],
            ["<strong>Mostly I/O waiting</strong>", "5 ms CPU, 95 ms network/DB wait: threads spend nearly their whole life idle"],
            ["<strong>Long-lived connections</strong>", "WebSockets, SSE, streaming, long polling: open for minutes with little CPU"],
            ["<strong>Fan-out to many I/O calls</strong>", "One request hits API A \u2192 DB \u2192 Redis \u2192 API B: many outstanding operations at once"],
            ["<strong>Threads are the bottleneck</strong>", "CPU ~30%, thread pool ~100%, memory climbing: you are paying to manage blocked threads"]
          ]
        }
      ],
      points: [
        { label: "Redis", body: "1 thread + <strong>epoll</strong>, 100K to 1M ops/sec. Single-threaded because it is I/O-bound: the network, not the CPU, is the limit." },
        { label: "Nginx", body: "Multi-process, each worker its own event loop, scaling to millions of connections." },
        { label: "Node.js", body: "1 event-loop thread + libuv, plus a small thread pool reserved for genuinely CPU-bound work." },
        { label: "Go", body: "Goroutines M:N-scheduled onto OS threads, millions of lightweight tasks without a thread each." },
        { label: "Java Netty", body: "A handful of threads + NIO. This is what Discord runs on." },
        { label: "Apache (classic)", body: "The older thread-per-connection model, maxing out around 10K connections." }
      ],
      callouts: [
        { color: "green", label: "Blocking is often the right call (with numbers)", body: "At <strong>200 req/sec and 50 ms latency</strong> only ~10 requests are in flight, so a plain blocking thread pool, with a healthy CPU, thread pool, and DB connection pool, is simple, readable, and completely sufficient. Do not add the complexity of non-blocking for a theoretical efficiency you will never feel. Most internal CRUD services, admin tools, and business apps live happily here." },
        { color: "yellow", label: "Correction: more cores do not fix a waiting problem", body: "If 1,000 threads are blocked waiting on a database, giving the machine <strong>32 cores instead of 8 does not make the database respond any faster</strong>. Cores help when you are <strong>CPU-bound</strong>. A thread-waiting problem is solved by non-blocking I/O (fewer threads holding the waits) or by fixing the downstream, never by adding CPU." },
        { color: "blue", label: "The real win is thread reuse, not a faster call", body: "Picture one request calling Service A, then B, then C at 100 ms each. Non-blocking does <strong>not</strong> turn a 100 ms call into 50 ms. What it does: while that request waits out each 100 ms, the same thread does useful work for <strong>other</strong> requests. The benefit is reusing the thread during the wait, not lower per-call latency." },
        { color: "purple", label: "Never forget the downstream", body: "Put <strong>10,000 app threads</strong> in front of a database that handles only <strong>500 concurrent queries</strong> and you do not get more capacity, you get thousands of threads queued or a melting database. More threads never create more downstream capacity, and can make it worse. Size the connection pool to what the downstream can take, not to your traffic." }
      ]
    },
    eventLoop: {
      heading: "The Event Loop (and Node.js)",
      intro: "Non-blocking I/O needs <em>something</em> to ask the OS \u201cwhich of these thousands of operations are ready right now?\u201d and run the matching callback. That something is the <strong>event loop</strong>: a single thread that loops forever, blocking only on \u201ctell me what is ready\u201d and never on any one connection. This tab is the practical <strong>Node.js</strong> view of that loop; for the OS mechanism beneath it (select, poll, epoll, kqueue, io_uring, and level vs edge triggering) see [[event-loop|Event Loop & I/O Multiplexing]] (2.11).",
      diagram: {
        caption: "One thread cycles through fixed phases forever. The poll phase asks the OS which sockets are ready and runs their callbacks; libuv's small thread pool covers the few operations with no async OS primitive. One loop saturates one core, so you run one loop per core to use the whole machine.",
        svg: '<svg width="100%" viewBox="0 0 920 330" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'
          + '<defs><marker id="el" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="var(--muted)"/></marker></defs>'
          + '<text x="460" y="18" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="700">Node.js event loop: one thread, cycling through phases forever</text>'
          // loop-back curve above the phases
          + '<path d="M735 58 C735 30 95 30 95 58" fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#el)"/>'
          + '<text x="415" y="34" text-anchor="middle" fill="var(--muted)" font-size="9.5">the loop repeats every tick</text>'
          // phase boxes
          + '<rect x="20" y="58" width="150" height="46" rx="7" fill="rgba(108,140,255,.08)" stroke="var(--border-strong)" stroke-width="1.3"/>'
          + '<text x="95" y="80" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">timers</text>'
          + '<text x="95" y="95" text-anchor="middle" fill="var(--muted)" font-size="8.5">setTimeout</text>'
          + '<rect x="180" y="58" width="150" height="46" rx="7" fill="rgba(108,140,255,.08)" stroke="var(--border-strong)" stroke-width="1.3"/>'
          + '<text x="255" y="80" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">pending</text>'
          + '<text x="255" y="95" text-anchor="middle" fill="var(--muted)" font-size="8.5">deferred callbacks</text>'
          + '<rect x="340" y="58" width="150" height="46" rx="7" fill="rgba(52,211,153,.16)" stroke="var(--border-strong)" stroke-width="1.6"/>'
          + '<text x="415" y="80" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="800">poll</text>'
          + '<text x="415" y="95" text-anchor="middle" fill="var(--muted)" font-size="8.5">I/O events (the main one)</text>'
          + '<rect x="500" y="58" width="150" height="46" rx="7" fill="rgba(108,140,255,.08)" stroke="var(--border-strong)" stroke-width="1.3"/>'
          + '<text x="575" y="80" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">check</text>'
          + '<text x="575" y="95" text-anchor="middle" fill="var(--muted)" font-size="8.5">setImmediate</text>'
          + '<rect x="660" y="58" width="150" height="46" rx="7" fill="rgba(108,140,255,.08)" stroke="var(--border-strong)" stroke-width="1.3"/>'
          + '<text x="735" y="80" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">close</text>'
          + '<text x="735" y="95" text-anchor="middle" fill="var(--muted)" font-size="8.5">close callbacks</text>'
          // arrows between phases
          + '<line x1="170" y1="81" x2="180" y2="81" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#el)"/>'
          + '<line x1="330" y1="81" x2="340" y2="81" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#el)"/>'
          + '<line x1="490" y1="81" x2="500" y2="81" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#el)"/>'
          + '<line x1="650" y1="81" x2="660" y2="81" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#el)"/>'
          + '<text x="460" y="122" text-anchor="middle" fill="var(--muted)" font-size="9.5">Between every phase, drain microtasks: process.nextTick queue, then Promise queue</text>'
          // poll down to epoll + libuv
          + '<line x1="400" y1="104" x2="300" y2="158" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#el)"/>'
          + '<line x1="430" y1="104" x2="620" y2="158" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#el)"/>'
          + '<rect x="150" y="158" width="270" height="54" rx="8" fill="rgba(52,211,153,.10)" stroke="var(--border-strong)" stroke-width="1.4"/>'
          + '<text x="285" y="182" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">epoll / kqueue</text>'
          + '<text x="285" y="199" text-anchor="middle" fill="var(--muted)" font-size="9.5">which sockets have data ready?</text>'
          + '<rect x="500" y="158" width="300" height="54" rx="8" fill="rgba(251,146,60,.10)" stroke="var(--brand-border)" stroke-width="1.4"/>'
          + '<text x="650" y="182" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">libuv thread pool (default 4)</text>'
          + '<text x="650" y="199" text-anchor="middle" fill="var(--muted)" font-size="9.5">fs, DNS, crypto, zlib (no async OS API)</text>'
          // bottom banner
          + '<rect x="60" y="252" width="800" height="52" rx="8" fill="rgba(148,163,184,.10)" stroke="var(--border-strong)" stroke-width="1.4"/>'
          + '<text x="460" y="275" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="800">1 event loop = 1 CPU core</text>'
          + '<text x="460" y="293" text-anchor="middle" fill="var(--muted)" font-size="10">Run one loop per core (Node cluster, Nginx workers, Netty groups) to use all N cores</text>'
          + '</svg>'
      },
      cards: [
        { icon: "P", title: "The problem it solves", color: "orange", body: "Thread-per-connection at 10K connections means ~10K threads (~10 GB of stacks) plus constant context switching. The event loop replaces all of them with <strong>one thread that only does work when data is ready</strong>." },
        { icon: "H", title: "How the loop works", color: "green", body: "Register interest in each socket, ask the OS which are ready, run each ready socket's callback quickly, then loop. It <strong>never waits on any single connection</strong>. The kernel side of that question (epoll and friends) is the deep dive in [[event-loop|Event Loop & I/O Multiplexing]] (2.11)." },
        { icon: "N", title: "The Node.js model", color: "blue", body: "Your JavaScript runs on <strong>one thread</strong> (the event loop). libuv adds a small worker pool for work with no async OS primitive. So Node is single-threaded for <em>your code</em>, not for everything it does." }
      ],
      table: {
        headers: ["Phase", "What runs there"],
        rows: [
          ["<strong>timers</strong>", "setTimeout / setInterval callbacks whose delay has elapsed"],
          ["<strong>pending</strong>", "A few deferred system callbacks (for example some TCP errors)"],
          ["<strong>poll</strong>", "Retrieve new I/O events and run their callbacks (the main phase)"],
          ["<strong>check</strong>", "setImmediate callbacks"],
          ["<strong>close</strong>", "Close-event callbacks (for example socket.on(\u2019close\u2019))"],
          ["<strong>microtasks</strong>", "process.nextTick, then Promise callbacks, drained fully between every phase"]
        ]
      },
      tables: [
        {
          headers: ["", "Single event loop", "Multiple event loops"],
          rows: [
            ["<strong>Cores used</strong>", "1", "N (one loop per core)"],
            ["<strong>Examples</strong>", "Redis, one bare Node process", "Nginx workers, Node cluster/PM2, Netty groups"],
            ["<strong>Pros</strong>", "Simplest, no locks, no data races", "Uses the whole machine"],
            ["<strong>Cons</strong>", "Caps at one core's throughput", "Shared state must be coordinated across loops"],
            ["<strong>How to run N</strong>", "n/a", "fork/cluster + SO_REUSEPORT, or worker_threads"]
          ]
        }
      ],
      callouts: [
        { color: "yellow", label: "The golden rule: never block the event loop", body: "There is only one thread running your callbacks, so a single 500 ms CPU loop or a synchronous <code>fs.readFileSync</code> freezes <strong>every</strong> connection behind it. Keep per-event work tiny: offload CPU work to <code>worker_threads</code> or a separate service, and always prefer the async API over the sync one." },
        { color: "purple", label: "libuv's thread pool is not your JS", body: "<code>fs</code>, DNS (<code>getaddrinfo</code>), <code>crypto</code>, and <code>zlib</code> have no async OS primitive, so libuv runs them on a <strong>4-thread pool</strong> (<code>UV_THREADPOOL_SIZE</code>) and hands the result back to the single event-loop thread. Node quietly uses a few threads even though your code is single-threaded." },
        { color: "green", label: "Single vs multi-threaded non-blocking I/O (with numbers)", body: "One event loop on one core handles roughly <strong>50K to 100K</strong> mostly-idle connections. Need more? Run <strong>one loop per core</strong>: an 8-core box runs 8 Node workers (cluster) behind the kernel's load balancer for about 8x. Redis stays single-threaded and scales by running <strong>multiple instances</strong> (Redis Cluster) instead of adding threads." },
        { color: "blue", label: "The event loop is not the only model", body: "It is one way to avoid wasting a thread while waiting; the other is <strong>cheap runtime-scheduled threads</strong>. Go <strong>goroutines</strong> and Java <strong>virtual threads</strong> (Project Loom) let you write simple blocking-style code that still scales to millions of concurrent tasks, because an M:N scheduler parks a waiting task and reuses the OS thread. Same goal, no callback nesting." }
      ]
    },
    chooseWhat: {
      heading: "When to Choose What",
      intro: "Do not ask \u201cthreads or processes?\u201d or \u201cNode or Java?\u201d Ask <strong>\u201cwhere is my bottleneck?\u201d</strong> and let the workload numbers answer. Write down four numbers, and the architecture almost picks itself.",
      tables: [
        {
          headers: ["System", "Traffic", "CPU vs I/O per request", "Concurrency (Little's Law)", "What you reach for"],
          rows: [
            ["<strong>A. CPU-heavy</strong>", "100 req/sec", "200 ms CPU, 5 ms I/O", "~20 in flight", "Cores, worker processes, horizontal scale"],
            ["<strong>B. I/O-heavy, blocking</strong>", "1,000 req/sec", "10 ms CPU, 90 ms I/O", "~100 in flight", "Thread pool + connection pool, watch for pool exhaustion"],
            ["<strong>C. I/O-heavy, non-blocking</strong>", "10,000 req/sec", "5 ms CPU, 95 ms I/O", "~1,000 in flight", "Event loop, few threads, many outstanding I/O ops"]
          ]
        },
        {
          headers: ["Symptom", "Real bottleneck", "Where to look / what to do"],
          rows: [
            ["CPU at 95 to 100%", "<strong>CPU-bound</strong>", "Add cores, more worker capacity, more instances, scale horizontally"],
            ["Thread pool full, CPU ~30%", "<strong>Threads blocked on I/O</strong>", "I/O latency, thread-pool size, connection pools, downstream capacity, switch to async"],
            ["App CPU ~30%, DB CPU ~95%", "<strong>Database</strong>", "Query optimization, indexes, read replicas, caching, connection pooling, sharding"],
            ["App CPU ~20%, downstream ~500 ms", "<strong>Slow dependency</strong>", "Timeouts, caching, batching, async processing, scale the downstream"]
          ]
        }
      ],
      points: [
        { label: "1. Requests per second", body: "Sets the raw scale. 10/sec and 10,000/sec are different universes even at identical latency." },
        { label: "2. CPU per request", body: "How much real computation each request needs. This is the CPU-bound signal." },
        { label: "3. I/O wait per request", body: "How much time is spent waiting on the DB, cache, or network. This is the I/O-bound signal." },
        { label: "4. Concurrency = throughput \u00d7 latency", body: "How many requests are in flight at once. This is the number that decides whether you need an event loop at all." }
      ],
      callouts: [
        { color: "yellow", label: "Heuristics are starting points, not laws", body: "\u201cCPU-bound \u2192 more cores\u201d and \u201cI/O-bound \u2192 non-blocking I/O\u201d are useful first guesses, not universal fixes. In system design the correct answer is always driven by the <strong>measured bottleneck</strong> and the workload numbers. Measure first, then choose." },
        { color: "blue", label: "Same latency, opposite architecture", body: "<strong>10 req/sec \u00d7 20 ms</strong> is a different universe from <strong>10,000 req/sec \u00d7 100 ms</strong>, and <strong>100 ms of pure CPU</strong> is a different problem from <strong>10 ms CPU + 90 ms I/O wait</strong> even though both are \u201c100 ms.\u201d Let the numbers, not the framework, pick the design." }
      ]
    },
    handsOn: {
      goal: "Serve 500 concurrent requests that each wait 1 second on I/O, once on Node's event loop and once with Python thread-per-request, and watch which model pays in threads and memory.",
      stack: "Node.js and Python (both built-in HTTP servers), load-tested with <code>hey</code>. Local and free.",
      steps: [
        {
          title: "Non-blocking server on Node's event loop",
          body: "<code>setTimeout</code> stands in for a slow DB call; the single loop thread is free while each request waits. Save as <code>server.js</code>.",
          code: "const http = require('http');\nhttp.createServer((req, res) => {\n  setTimeout(() => res.end('done\\n'), 1000); // non-blocking 1s I/O wait\n}).listen(3000, () => console.log('node event loop on :3000'));",
          lang: "javascript"
        },
        {
          title: "Thread-per-request server in Python",
          body: "<code>ThreadingHTTPServer</code> hands each request its own thread, and <code>time.sleep</code> blocks that thread for the full second. Save as <code>server.py</code>.",
          code: "import time\nfrom http.server import BaseHTTPRequestHandler, ThreadingHTTPServer\n\nclass Handler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        time.sleep(1)  # blocking 1s I/O wait, holds a thread\n        self.send_response(200)\n        self.end_headers()\n        self.wfile.write(b'done\\n')\n\nThreadingHTTPServer(('', 3001), Handler).serve_forever()",
          lang: "python"
        },
        {
          title: "Run both servers",
          code: "node server.js     # terminal 1, port 3000\npython3 server.py  # terminal 2, port 3001",
          lang: "bash"
        },
        {
          title: "Fire 500 concurrent requests at each",
          code: "hey -n 500 -c 500 http://localhost:3000/   # Node event loop\nhey -n 500 -c 500 http://localhost:3001/   # Python thread-per-request",
          lang: "bash"
        }
      ],
      observe: "The thread-per-request version's thread count and memory footprint climb with concurrency (watch <code>top</code> or Task Manager), while the event-loop version absorbs the same 500 concurrent waits on a handful of OS threads. That is the \u201cone thread, thousands of connections\u201d claim measured directly, and the concurrency number matches Little's Law (500 in flight \u2248 500 req/sec \u00d7 1 sec).",
      stretch: "Swap the 1-second wait for genuine CPU-bound work (a busy loop computing primes) instead of a sleep, and watch the event-loop version degrade badly. That proves the caveat: non-blocking I/O does nothing for CPU-bound work."
    }
  },
  keyTakeaways: [
    "Start from the <strong>workload</strong>, not the thread count: <strong>concurrency \u2248 throughput \u00d7 latency</strong> tells you whether concurrency is even a concern (10 req/sec is not; 10,000 req/sec is).",
    "<strong>Process vs thread</strong> is isolation vs cheap sharing; <strong>concurrency vs parallelism</strong> is interleaving vs simultaneous; <strong>CPU vs I/O bound</strong> is computing vs waiting; <strong>blocking vs non-blocking</strong> is whether a thread sleeps while it waits.",
    "The <strong>event loop</strong> is how non-blocking I/O is implemented: one thread runs callbacks and blocks only on \u201cwhat is ready?\u201d (epoll). It uses one core, so scale it with <strong>one loop per core</strong> (cluster/workers), and never block it with heavy CPU work.",
"Blocking I/O is <strong>not worse by default</strong>: it scales with threads and is simplest at moderate concurrency. Non-blocking wins only when <strong>threads themselves become the cost</strong> (10K+ or long-lived connections, heavy I/O fan-out), and it reuses the waiting thread rather than making any call faster. And more threads never buy more downstream capacity.",
    "Scaling is <strong>bottleneck-driven</strong>: measure which resource is saturated (CPU, threads, DB, or a downstream dependency) before adding anything."
  ],
  proTip: "Before choosing threads, processes, or an event loop, write down four numbers: <strong>requests/sec</strong>, <strong>CPU per request</strong>, <strong>I/O wait per request</strong>, and their product (<strong>concurrency</strong>). Those numbers name the bottleneck, and the bottleneck, not the language, names the fix.",
  related: ["serialization", "scaling-basics", "event-loop", "redis-fast"],
  bridgeOut: "Most \u201cslow at scale\u201d problems turn out to be I/O-bound, and the fix is fewer threads with non-blocking I/O. That is exactly the mechanism Networking's Event Loop lesson (2.11) explains at the OS level. This closes Module 1. Networking opens next."
};
