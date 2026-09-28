/* === Lesson event-loop - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#event-loop)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.11.
   This is the OS-level deep dive on I/O multiplexing. The conceptual /
   Node.js event loop (phases, libuv, never-block) lives in Foundations 1.7
   (concurrency-io); this lesson goes one level down to select/poll/epoll/
   kqueue/io_uring and the reactor pattern. Content ported into the course
   tab structure, preserving tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["event-loop"] = {
  module: 2, num: "2.11", title: "Event Loop & I/O Multiplexing",
  connectsFrom: "Foundations introduced the event loop as the idea behind \u201cone thread, many connections\u201d (see [[concurrency-io|Concurrency & I/O Models]]). This lesson drops one level down, to the OS mechanism that actually makes it work: <strong>I/O multiplexing</strong>. It is the reason [[redis-fast|Redis]] and NGINX each serve huge concurrent load on a handful of threads.",
  customTabs: [
    { key: "overview", label: "The C10K Problem", icon: "book" },
    { key: "whyNotThreads", label: "Why Not a Thread Each", icon: "layers" },
    { key: "multiplexers", label: "select to io_uring", icon: "swap" },
    { key: "epoll", label: "Inside epoll", icon: "cpu" },
    { key: "reactor", label: "The Reactor Loop", icon: "loop" },
    { key: "realWorld", label: "Real-World", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "The C10K Problem: One Thread, 100K Connections",
      intro: "Around the year 2000, servers hit a wall named the <strong>C10K problem</strong>: how do you handle ten thousand concurrent connections on one box? The obvious answer, one thread (or process) per connection, collapses at that scale because most connections are just <strong>sitting idle waiting for data</strong> while each still costs a full thread stack and its share of context-switch time. The answer that won is <strong>I/O multiplexing</strong>: a single thread asks the OS \u201cout of these 10,000 sockets, which ones actually have data ready right now?\u201d and only touches those. That thread is the <strong>event loop</strong>.",
      diagram: {
        caption: "Same 10,000 connections, two models. Thread-per-connection pays for 10,000 mostly-idle threads. The event loop keeps one thread and lets the kernel report only the sockets that are ready, so no thread is ever parked on a single connection.",
        svg: '<svg width="100%" viewBox="0 0 920 300" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'
          + '<defs><marker id="ev" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="var(--muted)"/></marker></defs>'
          + '<text x="230" y="22" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="800">Thread per connection</text>'
          + '<text x="690" y="22" text-anchor="middle" fill="var(--text)" font-size="12.5" font-weight="800">Event loop + multiplexing</text>'
          + '<line x1="460" y1="14" x2="460" y2="286" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray="4,4"/>'
          + '<rect x="30" y="44" width="120" height="30" rx="6" fill="rgba(108,140,255,.10)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="90" y="63" text-anchor="middle" fill="var(--muted)" font-size="10">10,000 sockets</text>'
          + '<line x1="150" y1="59" x2="200" y2="59" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ev)"/>'
          + '<rect x="200" y="40" width="230" height="90" rx="8" fill="rgba(251,146,60,.10)" stroke="var(--brand-border)" stroke-width="1.4"/>'
          + '<text x="315" y="64" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">~10,000 threads</text>'
          + '<text x="315" y="84" text-anchor="middle" fill="var(--muted)" font-size="10">one blocked per connection</text>'
          + '<text x="315" y="102" text-anchor="middle" fill="var(--muted)" font-size="10">most just waiting on data</text>'
          + '<text x="315" y="120" text-anchor="middle" fill="var(--muted)" font-size="10">context switches pile up</text>'
          + '<rect x="200" y="150" width="230" height="46" rx="8" fill="rgba(239,68,68,.10)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="315" y="170" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">~10 GB of thread stacks</text>'
          + '<text x="315" y="187" text-anchor="middle" fill="var(--muted)" font-size="9.5">falls over well before 100K</text>'
          + '<rect x="490" y="44" width="120" height="30" rx="6" fill="rgba(108,140,255,.10)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="550" y="63" text-anchor="middle" fill="var(--muted)" font-size="10">10,000 sockets</text>'
          + '<line x1="610" y1="59" x2="660" y2="59" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ev)"/>'
          + '<rect x="660" y="40" width="230" height="60" rx="8" fill="rgba(52,211,153,.12)" stroke="var(--border-strong)" stroke-width="1.6"/>'
          + '<text x="775" y="64" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="800">kernel: epoll / kqueue</text>'
          + '<text x="775" y="83" text-anchor="middle" fill="var(--muted)" font-size="9.5">\u201cwhich sockets are ready?\u201d</text>'
          + '<line x1="775" y1="100" x2="775" y2="126" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ev)"/>'
          + '<rect x="660" y="126" width="230" height="46" rx="8" fill="rgba(251,146,60,.10)" stroke="var(--brand-border)" stroke-width="1.4"/>'
          + '<text x="775" y="146" text-anchor="middle" fill="var(--text)" font-size="11.5" font-weight="700">1 event-loop thread</text>'
          + '<text x="775" y="163" text-anchor="middle" fill="var(--muted)" font-size="9.5">runs only the ready ones, then loops</text>'
          + '<rect x="660" y="190" width="230" height="40" rx="8" fill="rgba(52,211,153,.08)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="775" y="215" text-anchor="middle" fill="var(--text)" font-size="10.5" font-weight="700">megabytes of memory, scales to 100K+</text>'
          + '</svg>'
      },
      callouts: [
        { color: "blue", label: "Concurrency without threads", body: "This is the one-line idea to carry through the whole lesson: <strong>the kernel tracks the waiting, the event loop does the work</strong>. A single thread can hold 100K connections open because it never blocks on any one of them, it only wakes to service the handful that have data ready. That is concurrency (interleaving) without parallelism (many cores), the distinction drawn in [[concurrency-io|Concurrency & I/O Models]]." },
        { color: "green", label: "Interview application", body: "When asked why Redis and NGINX are fast on one thread, say: <em>\u201cThey use epoll-based I/O multiplexing. The kernel reports which sockets have data, so the thread only processes ready connections and never blocks. That is concurrency without a thread per connection.\u201d</em>" }
      ]
    },
    whyNotThreads: {
      heading: "Why Not Just a Thread Per Connection?",
      intro: "Thread-per-connection is not wrong, it is the simplest correct model and it is fine at moderate scale. It breaks specifically when connections are <strong>numerous and mostly idle</strong>, which is exactly the shape of modern network servers: chat, feeds, gateways, streaming. The cost is not the work, it is the <strong>waiting</strong>.",
      cards: [
        { icon: "M", title: "Memory", color: "orange", body: "Each thread reserves a stack, commonly <strong>1 MB to 8 MB</strong>. Ten thousand threads is 10 GB or more of stacks doing nothing but waiting. You run out of RAM long before you run out of CPU." },
        { icon: "S", title: "Scheduling", color: "purple", body: "The OS scheduler must time-slice every runnable thread. Thousands of threads means constant <strong>context switching</strong>: save registers, swap stacks, flush caches. You burn CPU managing threads instead of serving requests." },
        { icon: "I", title: "Idleness", color: "blue", body: "For an I/O-bound server, a thread spends <strong>most of its life blocked</strong> on a socket read. You are paying full price for a thread that is doing nothing 95% of the time." }
      ],
      table: {
        headers: ["At 10,000 idle-ish connections", "Thread per connection", "Event loop + epoll"],
        rows: [
          ["<strong>Threads</strong>", "~10,000", "1 (per core)"],
          ["<strong>Memory (stacks)</strong>", "~10 GB", "Megabytes"],
          ["<strong>Context switches</strong>", "Constant, thousands/sec", "Almost none"],
          ["<strong>Cost of an idle connection</strong>", "A whole parked thread", "One file descriptor in a table"],
          ["<strong>Scales to 100K+?</strong>", "No, collapses first", "Yes, routinely"]
        ]
      },
      callouts: [
        { color: "yellow", label: "This is not the same as \u201cthreads are bad\u201d", body: "At <strong>a few hundred concurrent, mostly-active</strong> connections, a blocking thread pool is simpler and completely fine, the trade-off is spelled out in [[concurrency-io|Concurrency & I/O Models]]. Multiplexing wins only when the thread count itself becomes the bottleneck: many connections, each mostly waiting." },
        { color: "purple", label: "The modern escape hatch", body: "There is a second way to dodge the cost without callbacks: <strong>cheap runtime-scheduled tasks</strong>. Go <strong>goroutines</strong> and Java <strong>virtual threads</strong> let you write blocking-style code that still scales to millions of tasks, because the runtime parks a waiting task and reuses the OS thread. Under the hood they still call epoll/kqueue, they just hide it from you." }
      ]
    },
    multiplexers: {
      heading: "The Multiplexers: select to io_uring",
      intro: "\u201cI/O multiplexing\u201d means one syscall watches many file descriptors at once and returns when any of them is ready. Every OS ships one, and they evolved along a single axis: <strong>how expensive is it to ask \u2018what is ready?\u2019 as the number of connections grows?</strong> select scans all of them every time; epoll and kqueue only hand back the ready ones.",
      table: {
        headers: ["Multiplexer", "OS", "Scalability", "Used By"],
        rows: [
          ["<strong>select</strong>", "All", "<strong>O(n)</strong> scan, capped at 1024 fds", "Legacy, portable code"],
          ["<strong>poll</strong>", "All", "<strong>O(n)</strong> scan, no fd cap", "Slightly better select"],
          ["<strong>epoll</strong>", "Linux", "<strong>O(1)</strong> per ready fd, millions of fds", "Redis, NGINX, Node.js"],
          ["<strong>kqueue</strong>", "BSD / macOS", "<strong>O(1)</strong> per ready fd", "NGINX (macOS), FreeBSD"],
          ["<strong>io_uring</strong>", "Linux 5.1+", "<strong>O(1)</strong> + async submission, near zero-copy", "Next-gen (TigerBeetle, Seastar)"]
        ]
      },
      points: [
        { label: "select / poll (the O(n) generation)", body: "You hand the kernel the <strong>entire</strong> set of descriptors on every call, and on return you scan the whole set again to find which are ready. That is O(n) work per loop even when only one socket fired. select also has a hard cap around <strong>1024</strong> descriptors and rebuilds its fd set each call; poll lifts the cap but stays O(n). Fine at small scale, a real bottleneck past 10K." },
        { label: "epoll / kqueue (the O(1) generation)", body: "You <strong>register</strong> each descriptor once, and the kernel maintains a ready list. When you call <code>epoll_wait</code> it returns <em>only</em> the descriptors that fired, so your cost scales with the number of <strong>ready</strong> connections, not the total. epoll is Linux, kqueue is BSD/macOS, and between them they run essentially every high-scale server today." },
        { label: "io_uring (the async-submission generation)", body: "epoll still needs a syscall per operation to actually do the read or write. <strong>io_uring</strong> (Linux 5.1+) uses shared submission and completion ring buffers so you can queue many operations and reap their results with <strong>few or no syscalls</strong>, cutting the last big source of overhead. Adopted by next-gen storage and networking engines like TigerBeetle and Seastar." }
      ],
      callouts: [
        { color: "blue", label: "The through-line", body: "select asks <em>\u201clook at all of these and tell me which are ready\u201d</em> (you pay for all n). epoll flips it to <em>\u201ctell me only the ones that became ready\u201d</em> (you pay for the ready k). io_uring flips it again to <em>\u201chere is a batch of work, tell me when each is done\u201d</em> (you pay almost no syscalls). Same goal, progressively cheaper." }
      ]
    },
    epoll: {
      heading: "Inside epoll: Level vs Edge Triggered",
      intro: "epoll is worth understanding directly because it is what Linux servers actually run on. It is three calls and one important choice. The three calls: <code>epoll_create</code> makes an epoll instance, <code>epoll_ctl</code> adds or removes a descriptor and the events you care about, and <code>epoll_wait</code> blocks until one or more are ready and returns just those. The choice is <strong>level-triggered vs edge-triggered</strong> notification.",
      cards: [
        { icon: "L", title: "Level-triggered (default)", color: "green", body: "epoll_wait keeps reporting a descriptor as ready <strong>as long as there is data left to read</strong>. Forgiving: if you read only part of the buffer, you get told again next loop. This is the default and what most code should use." },
        { icon: "E", title: "Edge-triggered (EPOLLET)", color: "orange", body: "epoll_wait reports readiness <strong>only on the transition</strong> from not-ready to ready, once. You must then read in a loop until you get <code>EAGAIN</code>, or you will miss data and hang that connection. Fewer wakeups, but you must drain fully." }
      ],
      table: {
        headers: ["Aspect", "Level-triggered", "Edge-triggered (EPOLLET)"],
        rows: [
          ["<strong>Notifies</strong>", "While data remains readable", "Once, on the ready transition"],
          ["<strong>You must</strong>", "Read at least once, can stop anytime", "Read in a loop until <code>EAGAIN</code>"],
          ["<strong>Risk</strong>", "Extra wakeups if you under-read", "Stalled connection if you under-read"],
          ["<strong>Wakeups</strong>", "More", "Fewer"],
          ["<strong>Used by</strong>", "Most apps, safe default", "NGINX, high-tuned servers"]
        ]
      },
      callouts: [
        { color: "green", label: "Why O(1) actually holds", body: "With select you pay to scan all n descriptors each loop. With epoll the kernel keeps a <strong>ready list</strong> and, when data arrives on a socket, moves just that descriptor onto it. <code>epoll_wait</code> then copies out only the ready entries, so your per-loop cost tracks the number of <strong>active</strong> connections, not the total registered. 100K idle connections cost almost nothing." },
        { color: "yellow", label: "Non-blocking sockets are mandatory here", body: "Multiplexing only works if your sockets are set <strong>non-blocking</strong> (<code>O_NONBLOCK</code>). Otherwise a read on a socket that epoll reported \u201cready\u201d could still block if the data was consumed or the readiness was spurious, and blocking the one event-loop thread stalls every other connection. Readiness notification and non-blocking I/O are a package deal." }
      ]
    },
    reactor: {
      heading: "The Reactor Loop and Run-to-Completion",
      intro: "Wrapping the multiplexer is a design pattern called the <strong>reactor</strong>. It is the actual shape of the event loop: register interest, wait for events, dispatch each to its handler, repeat forever. The single most important property, and the single most common way to break it, both come from the fact that there is <strong>only one thread</strong>.",
      points: [
        { label: "1. Register interest", body: "Tell the multiplexer which descriptors you care about and for what (readable, writable). With epoll this is <code>epoll_ctl</code>." },
        { label: "2. Wait for events", body: "Call <code>epoll_wait</code> (or select/poll/kqueue). The thread <strong>blocks here and only here</strong>, on the question \u201cis anything ready?\u201d, never on a specific connection." },
        { label: "3. Dispatch to handlers", body: "The call returns the ready descriptors. For each, run its callback: accept the new connection, read the request, write the response. This is the reactor \u201creacting\u201d to events." },
        { label: "4. Loop", body: "Go back to step 2. Because each handler runs to completion quickly and then yields, thousands of connections make progress by taking tiny turns." }
      ],
      callouts: [
        { color: "yellow", label: "The golden rule: never block the loop", body: "There is one thread running every handler, so a single slow callback freezes <strong>every</strong> connection behind it. A 200 ms CPU crunch, a synchronous file read, an accidental blocking DB call: any of them stalls the whole server. This is <strong>run-to-completion</strong> scheduling, and the rule is: keep each turn tiny, and push real CPU work to a [[concurrency-io|worker pool or thread pool]]." },
        { color: "blue", label: "One loop saturates one core", body: "An event loop is single-threaded by design, so it uses exactly <strong>one CPU core</strong>. To use a whole machine you run <strong>one loop per core</strong>: NGINX worker processes, a Node.js cluster, Netty event-loop groups. [[redis-fast|Redis]] instead stays one loop and scales out by running <strong>multiple instances</strong>." },
        { color: "green", label: "Where the phases live", body: "The concrete per-tick phase order of a real reactor (timers, pending, poll, check, close, with microtasks drained between phases) is the Node.js/libuv view, covered in [[concurrency-io|Concurrency & I/O Models]]. This lesson is the layer beneath it: the epoll_wait call that the poll phase is built on." }
      ]
    },
    realWorld: {
      heading: "Who Runs on This, and How",
      intro: "Every system famous for \u201chuge concurrency on few threads\u201d is an event loop over a multiplexer. The differences are only in how they use the machine's cores.",
      points: [
        { label: "Redis", body: "One event-loop thread on <strong>epoll</strong>, 100K to 1M ops/sec. Single-threaded on purpose: it is I/O-bound, so the network, not the CPU, is the limit. Scales by running more instances ([[redis-fast|Redis Cluster]]), not more threads." },
        { label: "NGINX", body: "Multi-process: each worker is its own event loop (epoll on Linux, kqueue on macOS), typically <strong>one worker per core</strong>, scaling to millions of connections. Often runs epoll in <strong>edge-triggered</strong> mode for fewer wakeups." },
        { label: "Node.js", body: "One event-loop thread driven by <strong>libuv</strong>, plus a small worker pool for the few operations with no async OS primitive (fs, DNS, crypto, zlib). Your JavaScript is single-threaded; scale across cores with the cluster module or worker_threads." },
        { label: "io_uring adopters", body: "Newer engines like <strong>TigerBeetle</strong> and <strong>Seastar</strong> use io_uring to push past epoll's per-operation syscall cost, batching submissions and completions through shared ring buffers." }
      ],
      callouts: [
        { color: "blue", label: "It is the same mechanism you already met", body: "The [[tcp-udp|TCP]] sockets a server accepts, the [[web-request|request that travels the network]], the connection a [[ddos-defense|flood of clients]] tries to exhaust: all of them are just file descriptors in the event loop's epoll set. This lesson is the engine under those." }
      ]
    },
    tradeoffs: {
      heading: "Trade-offs and When It Bites",
      points: [
        { label: "You gain: massive idle-connection scale", body: "One thread holds 100K+ mostly-idle connections on megabytes of memory. Nothing thread-per-connection does comes close for this workload." },
        { label: "You pay: no single call gets faster", body: "Multiplexing does not lower per-request latency, it lets one thread <strong>reuse the wait</strong> across many connections. If your workload is a few active connections, you added complexity for a benefit you will never feel." },
        { label: "You pay: CPU work is dangerous", body: "Because it is one thread run-to-completion, any heavy or blocking callback stalls everyone. Event loops are for <strong>I/O-bound</strong> work; genuine CPU work must be offloaded, see [[concurrency-io|CPU-bound vs I/O-bound]]." },
        { label: "You pay: harder to reason about", body: "Callback and async flows are trickier to write and debug than straight-line blocking code. Goroutines and virtual threads exist precisely to get the scale without the callback style." },
        { label: "Portability", body: "epoll is Linux-only, kqueue is BSD/macOS-only, io_uring is Linux 5.1+. Libraries like libuv and libev paper over the differences so you code once." }
      ],
      callouts: [
        { color: "green", label: "The decision in one line", body: "Reach for an event loop when you have <strong>many connections that are mostly waiting</strong> (10K+, long-lived, I/O fan-out). Stick with a blocking thread pool when connections are <strong>few and mostly active</strong>. The full numbers-driven version of this call is in [[concurrency-io|Concurrency & I/O Models]]." }
      ]
    },
    handsOn: {
      prerequisites: "Linux or macOS (for <code>strace</code> / <code>dtruss</code>); Node.js or Python; <code>hey</code> for load.",
      setup: "Local and free only.",
      simulate: "Run a simple Node.js server under <code>strace -e trace=network -f node server.js</code> (Linux) and fire 50 concurrent connections at it with <code>hey -n 500 -c 50 http://localhost:3000</code>. Watch the syscall trace, and look specifically for <code>epoll_wait</code> calls.",
      observe: "One thread issuing a small number of <code>epoll_wait</code> calls that each report back <strong>multiple ready sockets at once</strong>, instead of one syscall per connection per check. That is the O(1) \u201ctell me only the ready ones\u201d claim seen directly in the trace rather than taken on faith.",
      stretch: "Run the same 50-connection test against a naive thread-per-connection server and compare thread counts with <code>ps -eLf | wc -l</code> before and during load: dozens of new OS threads appearing versus the event-loop version's thread count staying flat. Then add a deliberate 300 ms busy-loop inside one handler and watch every other connection stall, that is the never-block-the-loop rule, measured."
    }
  },
  keyTakeaways: [
    "The <strong>C10K problem</strong> is why this exists: thread-per-connection wastes memory and context switches when connections are numerous and mostly idle. An event loop uses one thread that only touches sockets with data ready.",
    "<strong>I/O multiplexing</strong> is the mechanism: select/poll are O(n) scans, epoll/kqueue are O(1) \u201conly the ready ones,\u201d io_uring adds async batched submission with near-zero syscall overhead.",
    "epoll is three calls (create, ctl, wait) plus a <strong>level-triggered vs edge-triggered</strong> choice; multiplexing requires <strong>non-blocking sockets</strong>.",
    "The <strong>reactor loop</strong> is register, wait, dispatch, repeat on one thread, so the golden rule is <strong>never block the loop</strong>; one loop uses one core, so run one loop per core to use the machine.",
    "This is exactly why Redis and NGINX serve massive concurrency on a handful of threads: concurrency without a thread per connection."
  ],
  proTip: "The clean interview line: <strong>epoll-based I/O multiplexing gives concurrency without threads</strong>. The kernel keeps a ready list and reports only the sockets that fired, so a single non-blocking thread never blocks on any one connection, it just services whatever is ready and loops.",
  related: ["concurrency-io", "tcp-udp", "web-request", "redis-fast", "ddos-defense"],
  bridgeOut: "This exact mechanism is why NGINX and Redis serve huge concurrent load on a handful of threads. Networking ends here, and Module 3 (APIs & Communication) assumes it as background from the first lesson on."
};
