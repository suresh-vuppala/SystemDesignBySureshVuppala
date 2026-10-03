/* === Lesson clock-sync - part of Module 9 (Consistency) ===
   Source: system-design-cheatsheet/09-consistency.html (#clock-sync)
   + system-design-cheatsheet-course-hierarchy.md, Module 9.8.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["clock-sync"] = {
  module: 9, num: "9.8", title: "Clock Sync & Time",
  connectsFrom: "Last-Writer-Wins in 9.7 leaned entirely on comparing timestamps across machines. This lesson shows why that is dangerous: \u201cnow\u201d is not the same instant on two machines, clocks drift, networks add delay, and NTP is only accurate to roughly 1-10ms on a LAN, nowhere near precise enough to safely order fast-moving events by timestamp alone.",
  tabs: {
    overview: {
      heading: "Why \u201cNow\u201d Is Harder Than It Looks",
      intro: "Ordering events by wall-clock time fails because <strong>clocks drift</strong>, <strong>networks delay</strong>, and ordering genuinely requires coordination. The tools split into physical clocks (NTP, TrueTime), logical clocks (Lamport, vector), and hybrid clocks (HLC) that combine both.",
      cards: [
        { icon: "NT", title: "NTP", color: "orange", body: "Physical clock sync, bounded accuracy (~1-10ms LAN), can jump backward on resync. chrony is Amazon's implementation; Cloudflare's Roughtime is a security-hardened alternative." },
        { icon: "TT", title: "TrueTime", color: "blue", body: "GPS plus atomic clocks, returns a <strong>bounded interval</strong>. Spanner's commit-wait protocol waits out that interval to achieve external consistency." },
        { icon: "LC", title: "Logical Clocks", color: "purple", body: "<strong>Lamport timestamps</strong> give a total order but cannot tell true causality from coincidence; <strong>vector clocks</strong> detect real causality but grow with node count." },
        { icon: "HL", title: "HLC", color: "green", body: "Hybrid Logical Clock: physical time plus a logical counter, tracking both wall-clock proximity and causality. CockroachDB." }
      ],
      table: {
        headers: ["Clock Type", "Accuracy", "Detects Concurrency", "Real-Time Ordering", "Used By"],
        rows: [
          ["<strong>NTP</strong>", "~1-10ms (LAN), ~100ms (WAN)", "No", "Approximate", "Most systems (default)"],
          ["<strong>TrueTime</strong>", "~7ms bounded", "No (but bounded uncertainty)", "Yes (with commit-wait)", "Google Spanner"],
          ["<strong>Lamport Timestamp</strong>", "N/A (logical)", "No, total order only", "No", "Simple ordering needs"],
          ["<strong>Vector Clock</strong>", "N/A (logical)", "Yes", "No", "Riak, Dynamo"],
          ["<strong>HLC</strong>", "Physical + logical", "Yes", "Approximate + causal", "CockroachDB, YugabyteDB"]
        ]
      },
      callouts: [
        { color: "green", label: "Monotonic vs wall clock:", body: "<strong>Monotonic</strong> (<code>CLOCK_MONOTONIC</code>) never goes backward: use it for measuring durations, timeouts, and lease expiry. <strong>Wall clock</strong> (<code>gettimeofday</code>) can jump forward or backward on NTP sync: use it only for human-readable timestamps." },
        { color: "yellow", label: "How Spanner achieves external consistency:", body: "TrueTime returns an interval [earliest, latest]. On commit, Spanner <strong>waits until latest has passed</strong> (commit-wait, ~7ms), so if T1 commits before T2 starts, T1\u2019s timestamp &lt; T2\u2019s timestamp. Cost: ~7ms added latency per write." }
      ]
    },
    realWorld: {
      heading: "Time in Production",
      intro: "The systems that need reliable ordering each pick a different point on the physical-to-logical spectrum.",
      points: [
        { label: "Google Spanner", body: "TrueTime plus commit-wait for globally externally consistent transactions." },
        { label: "CockroachDB", body: "HLC for serializable transactions without GPS or atomic-clock hardware." },
        { label: "Amazon", body: "A time-sync service for EC2 (chrony), giving roughly 1ms accuracy." },
        { label: "Cloudflare", body: "The Roughtime protocol for obtaining trustworthy time from untrusted sources." }
      ]
    },
    tradeoffs: {
      heading: "What Never to Assume About Clocks",
      intro: "Most distributed-time bugs come from trusting the wall clock; the fixes are a short discipline.",
      points: [
        { label: "Never assume", body: "That system clocks agree across nodes, that a clock always moves forward (NTP can jump back), that timestamps are unique (sub-ms collisions happen), that network delay is symmetric, or that leap seconds do not exist (they do: 23:59:60)." },
        { label: "Best practices", body: "Use monotonic clocks for timeouts and durations, logical clocks for event ordering, and HLC when you need both time and causality. Store timestamps as UTC plus timezone offset, and add a node ID to break timestamp ties." },
        { label: "Anti-patterns", body: "Using <code>System.currentTimeMillis()</code> for ordering (clock skew breaks it), comparing timestamps across machines without bounded uncertainty, relying on NTP for distributed locks (drift causes split-brain), and ignoring leap seconds in time-sensitive financial systems." }
      ]
    },
    handsOn: {
      goal: "Force the monotonic-vs-wall-clock distinction to happen by moving the system clock backward while a Node logger records both clocks side by side.",
      stack: "Node.js in a throwaway Docker container granted permission to set its own clock. Local and free.",
      steps: [
        {
          title: "Write a logger that prints both clocks",
          body: "Save as <code>clock-log.js</code>. The wall clock can jump; the monotonic elapsed time only ever moves forward.",
          code: "const start = process.hrtime.bigint();\nsetInterval(() => {\n  const wall = new Date().toISOString();                          // wall clock: can jump\n  const monoMs = Number(process.hrtime.bigint() - start) / 1e6;   // monotonic: forward only\n  console.log('wall=' + wall + '  mono_elapsed_ms=' + monoMs.toFixed(0));\n}, 1000);",
          lang: "javascript"
        },
        {
          title: "Run it in a container allowed to change its clock",
          body: "The <code>SYS_TIME</code> capability lets this container set its own time without touching your host clock.",
          code: "docker run --rm -it --name clocklab --cap-add SYS_TIME -v \"$PWD\":/app -w /app node:20 bash\n# then, inside the container:\nnode clock-log.js",
          lang: "bash"
        },
        {
          title: "Jump the clock backward mid-run",
          body: "From a second terminal, move the container's wall clock back 5 seconds while the logger keeps running.",
          code: "docker exec clocklab date -s \"5 seconds ago\"",
          lang: "bash"
        }
      ],
      observe: "At the instant you move the clock, the <code>wall=</code> value jumps backward by about 5 seconds, while <code>mono_elapsed_ms</code> keeps climbing smoothly and never decreases. That is exactly why durations, timeouts, and lease expiry use the monotonic clock and wall-clock time is reserved for human-readable timestamps.",
      stretch: "Stamp two events with <code>Date.now()</code> from two separate containers only 2ms apart and try to decide which happened first. You cannot be confident: typical LAN NTP error (1-10ms) is larger than the 2ms gap you are trying to measure."
    }
  },
  keyTakeaways: [
    "\u201cNow\u201d differs across machines: clocks drift, NTP is only ~1-10ms accurate on a LAN and can jump backward, so ordering events by wall-clock timestamp alone is unsafe.",
    "Use the right clock for the job: monotonic for durations and timeouts, logical (Lamport/vector) or HLC for causal ordering, and reserve wall-clock time for human display.",
    "Spanner's TrueTime bounds uncertainty and waits it out with commit-wait for external consistency; CockroachDB gets serializability from HLC without special hardware."
  ],
  proTip: "Treat wall-clock time as a display value, never an ordering primitive: if you need to know which event happened first, use a logical or hybrid clock, because a 2ms timestamp gap is smaller than typical NTP error.",
  related: ["conflict-resolution", "consistency-models", "consensus", "cap"],
  bridgeOut: "This closes Module 9. Knowing the theory of trade-offs does not yet give you the concrete playbook for outgrowing one machine: that playbook, Scalability, is next."
};
