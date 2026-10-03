/* === Lesson latency-numbers - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#latency-numbers)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["latency-numbers"] = {
  module: 14, num: "14.1", title: "Latency Numbers",
  connectsFrom: "Every \u201cwhy is X fast or slow\u201d explanation across this course leaned on numbers you never formally memorized. Jeff Dean\u2019s latency table, updated for 2024 hardware, is the foundation of every back-of-envelope calculation you will ever do.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "table", label: "The Latency Table", icon: "hex" },
    { key: "overTime", label: "Hardware Over Time", icon: "clock" },
    { key: "realWorld", label: "Request Cost", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Latency Numbers Every Programmer Should Know",
      intro: "These span roughly <strong>8 orders of magnitude</strong>, from a 1 ns L1 cache hit to a 150 ms cross-region round trip. The core pattern to internalize: <strong>memory is ~100\u00d7 faster than SSD, SSD ~100\u00d7 faster than HDD, and local ~1000\u00d7 faster than cross-continent</strong>. Design your hot path to stay in the fast tiers.",
      cards: [
        { icon: "F", title: "Fast (&lt;1ms)", color: "green", body: "In-memory ops, cache hits, local IPC. If your request never leaves RAM, it stays here." },
        { icon: "M", title: "Medium (1-10ms)", color: "teal", body: "DB queries, SSD reads, same-region calls. The comfortable working range for most APIs." },
        { icon: "S", title: "Slow (10-100ms)", color: "orange", body: "HDD seeks, cross-AZ hops, external API calls. Batch or cache these where you can." },
        { icon: "V", title: "Very Slow (&gt;100ms)", color: "red", body: "Cross-region round trips, cold starts, uncached DNS lookups. Users feel every one of these." }
      ],
      callouts: [
        { color: "blue", label: "Key Insight:", body: "Memory is <strong>100\u00d7</strong> faster than SSD, SSD is <strong>100\u00d7</strong> faster than HDD, and local is <strong>1000\u00d7</strong> faster than cross-continent. Design your hot path to stay in memory." }
      ]
    },
    table: {
      heading: "The Full Latency Table",
      intro: "Jeff Dean\u2019s numbers, updated for 2024 hardware, spanning eight orders of magnitude. Memorize the pattern (roughly 100\u00d7 per tier), not all fifteen rows.",
      table: {
        headers: ["Operation", "Latency", "Relative Scale", "Notes"],
        rows: [
          ["<strong>L1 cache reference</strong>", "~1 ns", "1\u00d7", "CPU register-adjacent"],
          ["<strong>Branch mispredict</strong>", "~3 ns", "3\u00d7", "Pipeline flush penalty"],
          ["<strong>L2 cache reference</strong>", "~4 ns", "4\u00d7", "4\u00d7 L1"],
          ["<strong>L3 cache reference</strong>", "~12 ns", "12\u00d7", "Shared across cores"],
          ["<strong>Mutex lock/unlock</strong>", "~17 ns", "17\u00d7", "Uncontended"],
          ["<strong>Main memory (RAM)</strong>", "~100 ns", "100\u00d7", "DRAM access"],
          ["<strong>Compress 1KB (Snappy)</strong>", "~3 \u00b5s", "3,000\u00d7", "Fast compression"],
          ["<strong>Send 2KB over 1Gbps NIC</strong>", "~20 \u00b5s", "20,000\u00d7", "Network card latency"],
          ["<strong>SSD random read</strong>", "~100 \u00b5s", "100,000\u00d7", "NVMe: ~20 \u00b5s"],
          ["<strong>Read 1MB sequentially (RAM)</strong>", "~250 \u00b5s", "250,000\u00d7", "Memory bandwidth"],
          ["<strong>Same datacenter RTT</strong>", "~500 \u00b5s", "500,000\u00d7", "Within AZ"],
          ["<strong>Read 1MB sequentially (SSD)</strong>", "~1 ms", "1,000,000\u00d7", "Sequential is fast"],
          ["<strong>HDD seek</strong>", "~10 ms", "10,000,000\u00d7", "Mechanical movement"],
          ["<strong>Read 1MB sequentially (HDD)</strong>", "~20 ms", "20,000,000\u00d7", "After seek"],
          ["<strong>Send packet CA\u2192NL\u2192CA</strong>", "~150 ms", "150,000,000\u00d7", "Speed of light limit"]
        ]
      },
      callouts: [
        { color: "blue", label: "Optimization Priority:", body: "Cache hot data \u2192 reduce network hops \u2192 batch I/O \u2192 move compute closer to data. Attack the slowest tier your request actually touches." }
      ]
    },
    overTime: {
      heading: "How the Numbers Have Moved",
      intro: "The absolute latencies keep improving with hardware, but the relative ordering (RAM faster than SSD faster than HDD faster than network) has held for over a decade. That is why the pattern is worth memorizing, not the exact values.",
      table: {
        headers: ["Operation", "2012", "2024"],
        rows: [
          ["<strong>L1 cache</strong>", "0.5 ns", "~1 ns"],
          ["<strong>L2 cache</strong>", "7 ns", "~4 ns"],
          ["<strong>RAM</strong>", "100 ns", "~80-100 ns"],
          ["<strong>SSD random read</strong>", "150 \u00b5s", "~16-100 \u00b5s (NVMe)"],
          ["<strong>HDD seek</strong>", "10 ms", "~4-10 ms"],
          ["<strong>1 Gbps send 1MB</strong>", "10 ms", "~1 ms (10Gbps+)"],
          ["<strong>Datacenter RTT</strong>", "500 \u00b5s", "~200-500 \u00b5s"]
        ]
      }
    },
    realWorld: {
      heading: "What a Real HTTPS Request Costs",
      intro: "A single cold request is a chain of latency phases, each adding to the total. Knowing the breakdown tells you where keep-alive, caching, and connection reuse actually pay off.",
      points: [
        { label: "DNS lookup: 20-120 ms", body: "First hop resolves the name. Fully <strong>cached it is ~0 ms</strong>, which is why DNS caching matters so much." },
        { label: "TCP handshake: ~1 RTT (14-100 ms)", body: "The SYN / SYN-ACK / ACK exchange before any data flows." },
        { label: "TLS handshake: 1-2 RTT (28-200 ms)", body: "Key exchange on top of TCP. TLS 1.3 and session resumption cut this down." },
        { label: "HTTP request + server work: 1 RTT + 5-500 ms", body: "The round trip plus whatever the app actually does. <strong>Cold start total: 80-1000+ ms; with keep-alive: 20-600 ms.</strong>" }
      ]
    },
    handsOn: {
      goal: "Measure a few of the latency-table numbers on your own machine and confirm the roughly-100\u00d7-per-tier pattern (RAM, SSD, network) holds on real hardware.",
      stack: "A shell plus <code>curl</code> and a tiny Python script. Local and free.",
      steps: [
        {
          title: "Time a memory-speed operation",
          body: "A tight lock/unlock loop over 1,000,000 iterations stands in for nanosecond-scale work.",
          code: "python3 - <<'EOF'\nimport threading, time\nlock = threading.Lock()\nN = 1000000\nt = time.perf_counter()\nfor _ in range(N):\n    with lock:\n        pass\nprint('lock/unlock: %.1f ns/op' % ((time.perf_counter() - t) / N * 1e9))\nEOF",
          lang: "bash"
        },
        {
          title: "Feel an SSD read",
          body: "Write 100MB, drop it from the OS cache if you can, then time reading it back.",
          code: "dd if=/dev/zero of=/tmp/blob bs=1M count=100\nsync; echo 3 | sudo tee /proc/sys/vm/drop_caches >/dev/null 2>&1 || true\npython3 -c \"import time; t=time.perf_counter(); open('/tmp/blob','rb').read(); print('read 100MB: %.1f ms' % ((time.perf_counter()-t)*1000))\"",
          lang: "bash"
        },
        {
          title: "Measure a same-region network round trip",
          code: "curl -s -o /dev/null -w 'time_total: %{time_total}s\\n' https://example.com",
          lang: "bash"
        },
        {
          title: "Measure a cross-continent round trip",
          body: "Hit a host you know is far away and compare it to the nearby one.",
          code: "curl -s -o /dev/null -w 'time_total: %{time_total}s\\n' https://www.google.co.jp",
          lang: "bash"
        }
      ],
      observe: "Your numbers land in the same order of magnitude as the reference table: nanoseconds for the in-memory loop, single-digit milliseconds for the SSD read, tens to over a hundred milliseconds for a cross-continent round trip. The roughly-100\u00d7 jump per tier (RAM \u2192 SSD \u2192 network), confirmed on your own hardware instead of taken on faith.",
      stretch: "curl the same path against 3 hosts on different continents and compare <code>time_total</code> to rough geographic distance: latency tracks distance, bounded below by the speed of light in fiber."
    }
  },
  keyTakeaways: [
    "The whole table is anchored by one pattern: <strong>RAM ~100\u00d7 SSD, SSD ~100\u00d7 HDD, local ~1000\u00d7 cross-continent</strong>. Memorize the pattern, not 15 exact numbers.",
    "A cold HTTPS request is a chain (DNS \u2192 TCP \u2192 TLS \u2192 HTTP \u2192 server work); keep-alive and DNS caching remove whole phases from that chain.",
    "Latency tiers map to design moves: cache hot data, cut network hops, batch I/O, and move compute closer to the data."
  ],
  proTip: "When someone asks \u201cwhy is this slow,\u201d locate the operation on this scale first. A request that touches a cross-region hop (150 ms) cannot be fixed by optimizing a mutex (17 ns); find the slowest tier before you tune anything.",
  related: ["throughput-numbers", "storage-numbers", "estimation", "interview-reference", "sla-math"],
  bridgeOut: "Latency is how long one operation takes. These numbers feed straight into Back-of-Envelope Estimation (14.4). Next: the other half of the picture, how many operations per second a component can sustain."
};
