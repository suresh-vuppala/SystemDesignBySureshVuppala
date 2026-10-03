/* === Lesson bloom-filters - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#bloom-filters)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.6.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["bloom-filters"] = {
  module: 10, num: "10.6", title: "Bloom Filters",
  connectsFrom: "Consistent hashing decided where a key lives. Checking whether a key exists by actually looking it up costs a real round trip, even when most checks are for things that do not exist. A Bloom filter answers that cheaper.",
  tabs: {
    overview: {
      heading: "Probably Present, or Definitely Not",
      intro: "A probabilistic structure that gives one of two answers: <strong>definitely not in the set</strong> (always correct, zero false negatives) or <strong>probably in the set</strong> (a false positive is possible, so go do the real lookup to confirm). It uses <strong>tiny memory</strong> for ultra-fast checks at massive scale.",
      cards: [
        { icon: "0", title: "Any bit is 0", color: "red", body: "<strong>Definitely NOT present.</strong> The item was never inserted, so you can trust this 100%: there are no false negatives." },
        { icon: "1", title: "All bits are 1", color: "green", body: "<strong>Might be present.</strong> A false positive is possible, so fall through to the real lookup to confirm." },
        { icon: "K", title: "K hash functions", color: "blue", body: "Insert sets K bits; lookup checks K bits. Memory is roughly <strong>~100KB for 1M items</strong> at O(K) insert and lookup." }
      ],
      table: {
        headers: ["Tuning", "Meaning", "Effect"],
        rows: [
          ["<code>m</code>", "Bit array size", "Bigger m lowers the false-positive rate"],
          ["<code>n</code>", "Number of items inserted", "More items flip more bits to 1"],
          ["<code>k</code>", "Number of hash functions", "<code>k = (m/n) \u00d7 ln(2)</code> is optimal"],
          ["<code>p</code>", "False-positive rate", "<code>m/n=10, k=7</code> \u2192 p\u22480.82%; <code>m/n=15, k=10</code> \u2192 p\u22480.03%"]
        ]
      },
      callouts: [
        { color: "green", label: "Key insight:", body: "If <strong>ANY bit is 0</strong> \u2192 <strong>definitely NOT present</strong> (zero false negatives). If <strong>ALL bits are 1</strong> \u2192 might be present (false positive possible). The double-hashing trick derives K hashes from just 2 computations: <code>h_i(x) = h1(x) + i \u00b7 h2(x)</code>." },
        { color: "yellow", label: "Where false positives come from:", body: "As you insert millions of items, more and more bits flip to <strong>1</strong>. Eventually a query for an item you <strong>never inserted</strong> can hash to positions that are all already 1, each set by a different item, so the filter says \u201cprobably present\u201d incorrectly." },
        { color: "blue", label: "One-liner:", body: "Bloom filter = <strong>K hash functions</strong> mapping items to <strong>M bits</strong>. Insert: set K bits. Lookup: check K bits. Any 0 \u2192 definitely absent. All 1 \u2192 probably present. Use <strong>m/n=10, k=7</strong> for a ~1% false-positive rate." }
      ]
    },
    realWorld: {
      heading: "Where Bloom Filters Run",
      intro: "The pattern is always the same: skip an expensive lookup when the filter says the item is definitely absent.",
      points: [
        { label: "Cassandra / Bigtable", body: "Skip a disk read entirely if the filter says \u201cdefinitely not here.\u201d Heavily used in the Cassandra read path across SSTables; HBase applies the same idea per region." },
        { label: "Chrome Safe Browsing", body: "Checks URLs against malware lists without downloading the full list, confirming only the small fraction the filter flags." },
        { label: "CDNs", body: "Avoid an origin fetch for content never requested before, because the filter says it was never seen." },
        { label: "Instagram usernames", body: "With 500M+ usernames, a Bloom filter answers \u201cis this name taken?\u201d in ~0.01ms in memory. For ~99% of names it says \u201cdefinitely free\u201d with no DB call; only the ~1% it flags fall through to a real lookup." }
      ]
    },
    tradeoffs: {
      heading: "Limits and Variants",
      intro: "A standard Bloom filter is deliberately minimal, which is both its strength and its constraint.",
      points: [
        { label: "Fixed size degrades as data grows", body: "A standard filter has a <strong>fixed m</strong> set at creation. You cannot resize it, because adding bits invalidates existing hash positions. As n grows beyond the design point, the false-positive rate climbs rapidly." },
        { label: "Cannot delete, count, resize, or enumerate", body: "Setting a bit to 0 might affect other items, so no deletes. It only answers membership (no counting), cannot resize (must rebuild with larger m), and cannot list what is in it." },
        { label: "Fixes when it outgrows sizing", body: "Chain additional filters (scalable Bloom filter), rebuild with a larger m, or partition the filter. In Cassandra this happens automatically during compaction: merged SSTables get a fresh filter." },
        { label: "Variants that trade off differently", body: "Counting Bloom Filter supports delete (at ~4\u00d7 memory). Cuckoo Filter adds delete plus better space efficiency. Quotient Filter has better cache locality." }
      ]
    },
    handsOn: {
      goal: "Build a Bloom filter from scratch, insert 100,000 usernames, and confirm the measured false-positive rate lands right on the <code>m/n=10, k=7</code> formula prediction of p\u22480.82%.",
      stack: "Python 3 only (standard library, uses <code>hashlib</code> with the double-hashing trick). Local and free.",
      steps: [
        {
          title: "Write the Bloom filter",
          body: "Derive K bit positions from two SHA-256 halves (<code>h_i = h1 + i*h2</code>), insert 100,000 names, then probe 10,000 names never inserted and count false positives. Save as <code>bloom.py</code>.",
          code: "import hashlib\n\nclass Bloom:\n    def __init__(self, n, bits_per_item, k):\n        self.m = n * bits_per_item\n        self.k = k\n        self.bits = bytearray((self.m + 7) // 8)\n\n    def _positions(self, item):\n        d = hashlib.sha256(item.encode()).digest()\n        h1 = int.from_bytes(d[:8], \"big\")\n        h2 = int.from_bytes(d[8:16], \"big\")\n        return [(h1 + i * h2) % self.m for i in range(self.k)]\n\n    def add(self, item):\n        for p in self._positions(item):\n            self.bits[p >> 3] |= (1 << (p & 7))\n\n    def __contains__(self, item):\n        return all(self.bits[p >> 3] & (1 << (p & 7)) for p in self._positions(item))\n\ndef run(bits_per_item, k):\n    n, trials = 100000, 10000\n    bf = Bloom(n, bits_per_item, k)\n    for i in range(n):\n        bf.add(\"user\" + str(i))\n    fp = sum(1 for i in range(n, n + trials) if (\"user\" + str(i)) in bf)\n    print(\"m/n=%d k=%d -> false positives %d/%d = %.3f%%\"\n          % (bits_per_item, k, fp, trials, 100 * fp / trials))\n\nrun(10, 7)\nrun(15, 10)",
          lang: "python"
        },
        {
          title: "Run it",
          code: "python3 bloom.py",
          lang: "bash"
        }
      ],
      observe: "At <code>m/n=10, k=7</code> the measured false-positive rate lands near the predicted p\u22480.82%, and there are zero false negatives (every never-inserted probe that returns true is a genuine false positive). The <code>m/n=15, k=10</code> run drops the rate toward the predicted 0.03%, more bits per item buying accuracy.",
      stretch: "Gate a real lookup behind the filter: seed the 100,000 names into Redis or Postgres, then for a miss-heavy workload only query the store when the filter says \u201cprobably present.\u201d Count how many round trips the filter skips when most checked names do not exist."
    }
  },
  keyTakeaways: [
    "A Bloom filter answers <strong>definitely not present</strong> (zero false negatives) or <strong>probably present</strong> (false positives possible), using tiny memory for fast membership checks.",
    "Tuning is governed by <code>k = (m/n) \u00d7 ln(2)</code>: <code>m/n=10, k=7</code> gives roughly a 1% false-positive rate, and more bits per item drives it lower.",
    "It cannot delete, count, resize, or enumerate; variants like Counting and Cuckoo filters trade memory for those abilities."
  ],
  proTip: "Size the filter for 2 to 3\u00d7 your expected items for headroom, and alarm on the false-positive rate. When it crosses your threshold, rebuild with a larger m or chain a new filter rather than letting accuracy silently rot.",
  related: ["consistent-hashing", "sharding", "partitioning"],
  bridgeOut: "This exact structure is the fix Caching\u2019s cache-penetration failure mode points to. Next: protecting a service from too many requests, with rate limiting."
};
