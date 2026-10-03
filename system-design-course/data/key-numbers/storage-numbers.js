/* === Lesson storage-numbers - part of Module 14 (Key Numbers) ===
   Source: system-design-cheatsheet/15-key-numbers.html (#storage-numbers)
   + system-design-cheatsheet-course-hierarchy.md, Module 14.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["storage-numbers"] = {
  module: 14, num: "14.3", title: "Storage & Size Estimation",
  connectsFrom: "Latency and throughput cover time. This is the third estimation axis: space. Know the size of common data objects and where each storage tier sits on the capacity, speed, and cost curve, and you can size a system\u2019s footprint in your head.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "sizes", label: "Size Anchors", icon: "layers" },
    { key: "rules", label: "Rules of Thumb", icon: "hex" },
    { key: "realWorld", label: "Real-World", icon: "globe" }
  ],
  tabs: {
    overview: {
      heading: "Storage and Size Estimation",
      intro: "The trick is to memorize a handful of <strong>size anchors</strong> and one scaling rule. A tweet is ~140 B, a chat message ~500 B, a rich profile ~5-10 KB. Multiply by record count using the <strong>1000\u00d7 rule</strong>: 1 KB \u00d7 1M = 1 GB, and 1 KB \u00d7 1B = 1 TB. The three storage tiers below decide where each byte lives.",
      cards: [
        { icon: "H", title: "Hot tier (RAM / SSD)", color: "green", body: "RAM 16-512 GB at ~100 ns and ~$5/GB; NVMe SSD 1-30 TB at ~100 \u00b5s and ~$0.10/GB. Small, fast, expensive. Keep the working set here." },
        { icon: "W", title: "Warm tier (HDD / S3)", color: "blue", body: "HDD 4-20 TB at ~10 ms and ~$0.02/GB; object storage (S3) effectively unlimited at 50-100 ms and ~$0.023/GB/mo. Bulk data lives here." },
        { icon: "C", title: "Cold tier (Glacier)", color: "purple", body: "Archive storage, unlimited capacity, retrieval in hours, ~$0.004/GB/mo. Cheapest per GB, for data you rarely read." }
      ],
      callouts: [
        { color: "green", label: "The 1000\u00d7 Rule:", body: "Scaling data units: 1 KB \u00d7 1M = <strong>1 GB</strong>, 1 KB \u00d7 1B = <strong>1 TB</strong>, 1 MB \u00d7 1M = <strong>1 TB</strong>, 1 MB \u00d7 1B = <strong>1 PB</strong>. Powers of 2: 2\u00b3\u2070 = 1 GB, 2\u2074\u2070 = 1 TB, 2\u2075\u2070 = 1 PB." }
      ]
    },
    sizes: {
      heading: "Object Size Anchors",
      intro: "Memorize a dozen typical object sizes and you can size any dataset by multiplying against a record count. The 1M and 1B columns already do the 1000\u00d7 arithmetic for you.",
      table: {
        headers: ["Data Type", "Typical Size", "1M Records", "1B Records"],
        rows: [
          ["<strong>Tweet / short message</strong>", "~140 B (text only)", "~140 MB", "~140 GB"],
          ["<strong>Chat message (with metadata)</strong>", "~500 B", "~500 MB", "~500 GB"],
          ["<strong>User profile (basic)</strong>", "~1 KB", "~1 GB", "~1 TB"],
          ["<strong>User profile (rich, with prefs)</strong>", "~5-10 KB", "~5-10 GB", "~5-10 TB"],
          ["<strong>Email (avg with headers)</strong>", "~50 KB", "~50 GB", "~50 TB"],
          ["<strong>Web page (HTML + assets)</strong>", "~2-5 MB", "~2-5 TB", "~2-5 PB"],
          ["<strong>Photo (compressed JPEG)</strong>", "~200 KB - 5 MB", "~200 GB - 5 TB", "~200 TB - 5 PB"],
          ["<strong>Photo (multiple resolutions)</strong>", "~1-10 MB total", "~1-10 TB", "~1-10 PB"],
          ["<strong>Video (1 min, 720p)</strong>", "~50 MB", "~50 TB", "~50 PB"],
          ["<strong>Video (1 min, 1080p)</strong>", "~130 MB", "~130 TB", "~130 PB"],
          ["<strong>Log entry</strong>", "~200-500 B", "~200-500 MB", "~200-500 GB"],
          ["<strong>Search index entry</strong>", "~500 B - 2 KB", "~500 MB - 2 GB", "~500 GB - 2 TB"]
        ]
      },
      callouts: [
        { color: "blue", label: "Tiering principle:", body: "Each tier down is roughly <strong>10-100\u00d7 slower</strong> but 10-100\u00d7 cheaper and larger. Keep hot data in upper tiers, cold data in lower tiers, and move it as it ages." }
      ]
    },
    rules: {
      heading: "Conversions and Rules of Thumb",
      intro: "The mental-math shortcuts that turn a per-second rate into a yearly footprint, and a growth rate into a doubling time.",
      table: {
        headers: ["Period", "Seconds", "Approx"],
        rows: [
          ["<strong>1 minute</strong>", "60", "~60"],
          ["<strong>1 hour</strong>", "3,600", "~4K"],
          ["<strong>1 day</strong>", "86,400", "~100K"],
          ["<strong>1 month</strong>", "2,592,000", "~2.5M"],
          ["<strong>1 year</strong>", "31,536,000", "~30M"]
        ]
      },
      callouts: [
        { color: "green", label: "Memory Rule:", body: "1 day \u2248 10\u2075 sec, 1 year \u2248 3\u00d710\u2077 sec. These two anchors let you convert any per-second rate into daily or yearly totals in your head." },
        { color: "yellow", label: "Storage Rule:", body: "2\u00b3\u2070 = <strong>1 GB</strong>, 2\u2074\u2070 = <strong>1 TB</strong>, 2\u2075\u2070 = <strong>1 PB</strong>." },
        { color: "yellow", label: "Rule of 72:", body: "Doubling time = <strong>72 \u00f7 growth%</strong>. At 15% monthly growth a dataset doubles in ~4.8 months; at 10% in ~7 months. A fast way to know when you outgrow current capacity." }
      ]
    },
    realWorld: {
      heading: "From Anchors to a Real Footprint",
      intro: "The size anchors only matter once you chain them with a record count and a growth rate. That is exactly how capacity plans get built.",
      points: [
        { label: "Object storage implements the hierarchy", body: "S3 Standard, Infrequent Access, and Glacier are the warm-to-cold tiers made concrete: same API, wildly different price and retrieval latency per class." },
        { label: "Replication multiplies everything", body: "A 3\u00d7 replication factor triples your raw storage bill, and indexes plus metadata add another ~30% overhead on top. Never quote the naked data size." },
        { label: "Growth is the number that surprises people", body: "A dataset at 15% monthly growth doubles roughly every 5 months by the Rule of 72, so \u201cfits today\u201d and \u201cfits next year\u201d are very different questions." }
      ]
    }
  },
  keyTakeaways: [
    "Memorize a few size anchors (tweet ~140 B, chat ~500 B, profile ~1 KB, email ~50 KB, 1-min 1080p video ~130 MB) and derive the rest.",
    "Scale with the <strong>1000\u00d7 rule</strong>: 1 KB \u00d7 1M = 1 GB, 1 KB \u00d7 1B = 1 TB, and always add replication (~3\u00d7) plus overhead (~1.3\u00d7).",
    "The storage hierarchy trades speed for cost: each tier down is ~10-100\u00d7 slower but ~10-100\u00d7 cheaper, so tier data by how hot it is."
  ],
  proTip: "Never report a raw data size in an interview. Multiply by replication factor and index overhead first: <strong>usable footprint \u2248 raw \u00d7 3 \u00d7 1.3</strong>. It is the difference between a junior estimate and a senior one.",
  related: ["latency-numbers", "throughput-numbers", "estimation", "cost-numbers", "interview-reference"],
  bridgeOut: "You can now size time and space for any component. Next: chaining these anchors into a full system estimate, the single most tested skill in a design interview."
};
