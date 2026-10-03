/* === Lesson db-internals - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#db-internals)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["db-internals"] = {
  module: 6, num: "6.1", title: "Database Internals",
  connectsFrom: "Infrastructure assumed \u201ca database exists\u201d without explaining how one actually stores and finds data. Start with the simplest possible database, one plain file, and watch every \u201cobvious\u201d fix create a new problem. That is exactly the story real engines had to solve, one step at a time.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "principles", label: "From First Principles", icon: "loop" },
    { key: "structures", label: "Data Structures", icon: "hex" },
    { key: "tradeoffs", label: "LSM vs B+Tree", icon: "scale" },
    { key: "schema", label: "Schema & Concurrency", icon: "cpu" }
  ],
  tabs: {
    overview: {
      heading: "Built From First Principles",
      intro: "How databases actually store and find data, built from first principles: each problem leads directly to the next solution. This lesson walks the whole path in the <strong>From First Principles</strong> tab, names the building blocks in <strong>Data Structures</strong>, and ends at the one real fork: <strong>LSM-tree</strong> engines optimize writes, <strong>B+Tree</strong> engines optimize reads.",
      cards: [
        { icon: "!", title: "The starting problem", color: "orange", body: "A plain key-value file breaks two ways: updates shift every byte after them (<strong>O(n) writes</strong>), and lookups scan the whole file (<strong>O(n) reads</strong>). Every step that follows fixes one of these." },
        { icon: "W", title: "Write-optimized: LSM Tree", color: "green", body: "Buffer writes in a sorted in-memory Memtable, flush to immutable SSTables, merge in the background. Sequential writes, extremely fast. Cassandra, RocksDB, LevelDB." },
        { icon: "R", title: "Read-optimized: B+Tree", color: "blue", body: "Keep data always sorted on disk in a balanced tree. Reads are <strong>O(log N)</strong> and range scans walk linked leaves. Postgres, MySQL InnoDB." }
      ],
      callouts: [
        { color: "green", label: "The whole path in one line:", body: "Plain file \u2192 append-only (fast writes) \u2192 segments and compaction (bounded size) \u2192 hash index (O(1) reads) \u2192 sorted and sparse index (range queries) \u2192 memtable and SSTable (sort without re-sorting on disk) = <strong>LSM Tree</strong>. Or: always-sorted pages plus WAL = <strong>B+Tree</strong>." }
      ]
    },
    principles: {
      heading: "Each Fix Creates the Next Problem",
      intro: "Seven steps, in order. Read them top to bottom: every solution introduces the limitation the next step has to solve. By the end you have derived both dominant storage engines from scratch.",
      points: [
        { label: "Step 1: Why a plain file fails", body: "The naive design writes key-value pairs to a file: <code>set</code> appends a line, <code>get</code> scans through. Two things break immediately: mutable updates shift every byte after them (O(n) per write), and lookups scan the whole file (O(n) reads). Every later step exists to fix one of these." },
        { label: "Step 2: Append-only", body: "Make records <strong>immutable</strong>. Every write, whether insert, update, or delete, is appended to the end. No byte-shifting, so writes become O(1). Updates become new records; deletes become <strong>tombstones</strong> (a record with a null value). To read, find the last occurrence of the key." },
        { label: "Step 3: Segments + compaction", body: "Append-only grows forever. Once a file exceeds a size threshold, close it and start a new one. Old segments are <strong>compacted</strong> in the background: stale and tombstoned keys removed, only the latest value per key kept. Compacted segments can be merged; the database always reads the newest segment first." },
        { label: "Step 4: Hash index", body: "Even with segments, finding a key still means scanning records. Solution: keep an <strong>in-memory hash table</strong> mapping every key to its <strong>byte offset</strong> in the file. Every write updates both. Lookups become: find offset in RAM (nanoseconds), then jump directly to that position on disk (one I/O, not N scans). Limit: all keys must fit in RAM, and it cannot range-query." },
        { label: "Step 5: Sort the data", body: "Keep the file <strong>sorted by key</strong> and range queries become a bounded scan: find the start key, read forward to the end key, stop. Sorting also enables a <strong>sparse index</strong>: store only some keys as anchors. To find key 18, look up the nearest anchor \u2264 18, seek to that offset, scan forward. Fewer RAM entries, same fast lookup." },
        { label: "Step 6: LSM Tree (the write-optimized answer)", body: "Keeping a file sorted on disk while appending is expensive: you would re-sort on every insert. Solution: sort in memory first, flush to disk in sorted batches. New writes go to a sorted in-memory structure (Memtable, usually a skiplist). When it fills, it is flushed as a sorted, immutable <strong>SSTable</strong> on disk. A <strong>WAL</strong> is written simultaneously so nothing is lost on a crash." },
        { label: "Step 7: B+Tree (the read-optimized answer)", body: "A different trade-off: instead of batching writes in memory and flushing, keep data <strong>always sorted on disk in a tree</strong>. Reads need at most O(log N) comparisons from the root. Updates mutate pages in place (WAL-protected). This optimizes reads at the cost of more complex writes (page splits, rebalancing). Data lives only in linked leaf nodes, so range scans traverse the leaf chain without going back up the tree." }
      ]
    },
    structures: {
      heading: "The Building Blocks",
      intro: "The steps above lean on a handful of data structures. These are the ones worth knowing by name, where they live (memory or disk), and what real systems use them.",
      table: {
        headers: ["Structure", "What it is"],
        rows: [
          ["<strong>Skiplist</strong>", "In-memory, O(log N) search/insert. Multiple levels act as express lanes. Backs Redis sorted sets and most Memtables."],
          ["<strong>Hash Index</strong>", "In-memory, O(1) average. Bucket array plus chaining for collisions. Point lookups only, no range queries."],
          ["<strong>SSTable</strong>", "Disk, sorted immutable key-value file. Enables sparse indexes and range queries. Flushed from the Memtable."],
          ["<strong>WAL</strong>", "Write-Ahead Log: every change logged before applying, replayed on crash. Postgres, MySQL, etcd, Kafka."],
          ["<strong>LSM Tree</strong>", "Memory plus disk. Writes hit a sorted Memtable + WAL, flush to SSTables, compaction merges them. Cassandra, RocksDB, LevelDB."],
          ["<strong>B-Tree / B+Tree</strong>", "Disk, balanced tree, data in linked leaves. O(log N). Most popular DB index. Postgres, MySQL InnoDB."],
          ["<strong>Inverted Index</strong>", "Maps each term to a list of documents. BM25 ranking. Powers Elasticsearch and Lucene."],
          ["<strong>R-Tree</strong>", "Multi-dimensional. Hierarchical bounding boxes for spatial data. PostGIS, MongoDB 2dsphere."]
        ]
      },
      callouts: [
        { color: "blue", label: "Bloom filter:", body: "A small probabilistic structure that answers \u201cis this key definitely absent?\u201d in O(1). LSM engines put one in front of each SSTable so a read skips files that cannot contain the key, cutting wasted disk seeks." }
      ]
    },
    tradeoffs: {
      heading: "LSM Tree vs B+Tree",
      intro: "The final two steps are not a progression, they are a fork. Same data, opposite optimization. This is the single most useful comparison in storage engines.",
      table: {
        headers: ["Dimension", "LSM Tree", "B+Tree"],
        rows: [
          ["Optimized for", "Writes", "Reads"],
          ["Write path", "Sequential append to Memtable + WAL, later flush to SSTables", "In-place page updates (WAL-protected), page splits on overflow"],
          ["Read path", "May check several SSTables; bloom filters prune misses", "O(log N) from the root, at most tree-height seeks"],
          ["Range scans", "Merge across sorted SSTables", "Walk the linked leaf chain"],
          ["Disk I/O", "Mostly sequential", "More random"],
          ["Used by", "Cassandra, RocksDB, LevelDB, DynamoDB", "Postgres, MySQL InnoDB"]
        ]
      },
      points: [
        { label: "LSM Tree (write-optimized)", body: "Buffer writes in a sorted Memtable, flush to immutable SSTables, merge in the background. Writes are extremely fast (sequential append). Reads may check multiple SSTables, so bloom filters prune unnecessary disk reads. Best for write-heavy and append-heavy workloads." },
        { label: "B+Tree (read-optimized)", body: "Keep data always sorted on disk in a tree, mutate pages in place (WAL-protected). Reads are O(log N) from the root; linked leaves make range scans cheap. The cost is more complex writes: page splits and rebalancing, more random disk I/O. Best for read-heavy workloads and frequent range scans." }
      ]
    },
    schema: {
      heading: "Schema and Concurrency",
      intro: "Two topics that sit on top of any storage engine: how you shape the data (schema) and how concurrent transactions stay correct (locks and MVCC).",
      callouts: [
        { color: "green", label: "Schema design:", body: "<strong>Normalization</strong> (3NF, eliminate redundancy, needs JOINs) vs <strong>Denormalization</strong> (duplicate for read speed, no JOINs). <strong>ACID vs BASE</strong>: ACID = strong consistency (SQL); BASE = Basically Available, Soft state, Eventually consistent (NoSQL)." },
        { color: "blue", label: "Locks and isolation:", body: "<strong>Row-level</strong> (InnoDB default), <strong>Table-level</strong> (MyISAM), <strong>Intent locks</strong> (signal intent), <strong>Advisory locks</strong> (app-level). <strong>MVCC</strong>: readers see a consistent snapshot and take no read locks, so readers never block writers (Postgres, MySQL InnoDB)." }
      ]
    },
    handsOn: {
      goal: "Build a tiny key-value store on a plain text file and prove, with your own stopwatch, that append-only writes are O(1) while whole-file rewrites are O(n), then add a hash index that turns a full scan into a single seek.",
      stack: "Python 3 and a plain text file as the storage engine. No database. Local and free.",
      steps: [
        {
          title: "Seed 10,000 rows and time a naive rewrite update",
          body: "The naive store updates a key by reading every line and rewriting the whole file. Save as <code>naive.py</code> and run it.",
          code: `# naive.py - updating a key rewrites the entire file
import time

def seed(path, n):
    with open(path, "w") as f:
        for i in range(n):
            f.write(str(i) + ",value" + str(i) + "\\n")

def update_naive(path, key, value):
    with open(path) as f:
        lines = f.readlines()
    with open(path, "w") as f:
        for line in lines:
            k = line.split(",", 1)[0]
            f.write(key + "," + value + "\\n" if k == key else line)

seed("naive.db", 10000)
t = time.time()
update_naive("naive.db", "5000", "updated")
print("naive update:", round((time.time() - t) * 1000, 3), "ms")`,
          lang: "python"
        },
        {
          title: "Switch to append-only writes and time the same update",
          body: "An append-only store never rewrites: an update just appends a new version at the end, so the latest line for a key wins. Save as <code>append.py</code>.",
          code: `# append.py - updating a key just appends a new version
import time

def append(path, key, value):
    with open(path, "a") as f:
        f.write(key + "," + value + "\\n")

open("append.db", "w").close()
for i in range(10000):
    append("append.db", str(i), "value" + str(i))

t = time.time()
append("append.db", "5000", "updated")
print("append update:", round((time.time() - t) * 1000, 4), "ms")`,
          lang: "python"
        },
        {
          title: "Build an in-memory hash index and do a point lookup",
          body: "Scan the file once at startup to build <code>{key: byteOffset}</code> (later versions overwrite earlier offsets), then a lookup is a single <code>seek</code> instead of a full scan.",
          code: `# index.py - hash index maps key -> byte offset of its latest line
def build_index(path):
    index = {}
    with open(path, "rb") as f:
        offset = f.tell()
        line = f.readline()
        while line:
            key = line.split(b",", 1)[0].decode()
            index[key] = offset
            offset = f.tell()
            line = f.readline()
    return index

def get(path, index, key):
    with open(path, "rb") as f:
        f.seek(index[key])
        return f.readline().decode().strip()

idx = build_index("append.db")
print("lookup 5000 ->", get("append.db", idx, "5000"))`,
          lang: "python"
        },
        {
          title: "Run all three and compare the timings",
          code: "python naive.py\npython append.py\npython index.py",
          lang: "bash"
        }
      ],
      observe: "The naive update time grows as you raise the seed count (it rewrites the whole file each time) while the append-only update stays flat: the O(n) vs O(1) claim, timed instead of assumed. The hash-index lookup returns <code>updated</code> from one <code>seek</code> rather than scanning every line.",
      stretch: "Implement simple compaction: merge two append-only segments, keeping only the latest value per key, and measure file size before and after on a file with many overwritten keys."
    }
  },
  keyTakeaways: [
    "Every database feature is a fix for a problem the previous design created: append-only fixes byte-shifting, compaction fixes unbounded growth, the hash index fixes slow reads, sorting fixes range queries.",
    "The two dominant engines are a fork, not a ladder: <strong>LSM-tree</strong> optimizes writes (Memtable + SSTables + compaction), <strong>B+Tree</strong> optimizes reads (always-sorted pages + WAL).",
    "Supporting structures (skiplist, SSTable, WAL, bloom filter, inverted index, R-Tree) plus locks, MVCC, and ACID vs BASE are the vocabulary that sits on top of all of this."
  ],
  proTip: "When someone says a database is \u201cfast,\u201d ask fast at what: an LSM engine is fast at writes and an append-heavy workload, a B+Tree engine is fast at reads and range scans. The storage engine underneath decides which.",
  related: ["db-indexing", "db-choice", "sql", "nosql"],
  bridgeOut: "The hash index and B+Tree built here get applied, deliberately, to speed up real queries. That is indexing."
};
