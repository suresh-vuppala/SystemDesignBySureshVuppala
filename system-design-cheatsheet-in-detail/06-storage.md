# Storage Systems — Deep Session Script
### Under-the-Hood · Natural Language · Interview-Ready

Written the way you'd explain storage internals to a smart engineer who wants to *understand* them, not memorize them. Every term is explained when introduced. Each topic is scoped to the problem it owns — and when it can't solve something, you'll see a pointer to what does.

---

## 📑 Topics

1. [How a Database Stores Data on Disk](#1-how-a-database-stores-data-on-disk)
2. [Database Indexing — The Full Progression](#2-database-indexing--the-full-progression)

---

## 1. How a Database Stores Data on Disk

Before indexes make any sense, you need to know what the database is actually reading.

When you insert rows, the database doesn't keep them in one giant continuous blob. It writes them into fixed-size **pages** — typically 8KB in Postgres, 16KB in MySQL InnoDB. A page is the smallest unit the database reads from or writes to disk.

That detail matters more than it sounds: **if you want one row, the database still reads the entire page that contains it.** There's no such thing as reading half a page. This is why row size affects query speed — a table with 40-byte rows fits ~200 rows per 8KB page, while a table with 4KB rows fits only 2.

```
Orders table (100 million rows)
├── Page 1    → rows 1–120
├── Page 2    → rows 121–240
├── Page 3    → rows 241–360
│   ...
└── Page 833,334 → rows 99,999,880–100,000,000
```

Every query ultimately answers one question: **which pages do I need to read?** Everything in this module — indexes, clustered indexes, partitioning — exists to shrink that answer.

---

## 2. Database Indexing — The Full Progression

**What it solves:** finding rows without reading the whole table.
**What it does NOT solve:** the table being enormous even when well-organized — that's partitioning (covered at the end, and in the Scalability module).

These concepts get confused constantly — index, clustered index, partitioning. The cleanest way to keep them straight is to walk the progression. Each step exists because the previous step left something unsolved.

---

### Step 1: No index — the full table scan

You have a 100-million-row `Orders` table and you run:

```sql
SELECT * FROM Orders WHERE CustomerId = 500;
```

The database has no shortcut. It has to check every page:

```
Page 1 → any CustomerId=500? 
Page 2 → any CustomerId=500?
Page 3 → any CustomerId=500?
   ...
Page 833,334 → any CustomerId=500?
```

Even if only 3 rows match, it read all 833,334 pages to be sure it didn't miss any. This is a **full table scan** — the most expensive operation in a database.

**The problem:** finding a few rows requires scanning the entire table.

---

### Step 2: Non-clustered index — fast point lookups, painful large ranges

```sql
CREATE INDEX idx_customer ON Orders(CustomerId);
```

The database builds a **separate** data structure — usually a B-tree — that stores just the indexed column value plus a pointer to where the row lives (page number + slot within that page).

```
Index on CustomerId (separate structure, much smaller than the table)

           [500]
          /     \
     [200]       [800]
     /   \       /   \
  ...    ...   ...   ...
                │
                ▼
   CustomerId=500 → Page 200, Slot 15
```

For a point query, this is excellent:

```
Search index for CustomerId=500       (a few page reads, O(log n))
  → Index says: Page 200, Slot 15
  → Read Page 200
  → Extract the row
Done. ~4 page reads instead of 833,334.
```

**Where it breaks down:** large range queries.

```sql
SELECT * FROM Orders WHERE OrderDate BETWEEN '2024-01-01' AND '2024-12-31';
```

Say this matches 40 million rows. The index *can* find all 40 million entries efficiently — it locates the first match and scans forward through its own leaf pages, which are linked together in sorted order.

The problem is what happens next. The index is sorted by `OrderDate`. The table's physical pages are **not** — rows were stored in whatever order they were inserted. So the database ends up doing this:

```
Index entry: Jan 1  → Page 500    → jump to Page 500, fetch row
Index entry: Jan 2  → Page 20     → jump to Page 20, fetch row
Index entry: Jan 3  → Page 900    → jump to Page 900, fetch row
Index entry: Jan 4  → Page 100    → jump to Page 100, fetch row
Index entry: Jan 5  → Page 640    → jump to Page 640, fetch row
   ... 40 million times ...
```

The disk head (or SSD controller) is jumping all over the place. This is **random I/O**, and it's dramatically slower than reading pages in order. For 3 rows, nobody notices. For 40 million rows, the query takes hours instead of minutes.

> **Precision point:** a non-clustered index does not merely point to a "starting point." It contains an entry for *every* matching key, and for a range query it finds the first match then scans its own leaf pages sequentially. The index scan itself is cheap. The expensive part is that each of those entries points to a potentially **scattered** location in the actual table — so fetching the real rows is random I/O.

**The problem:** the index finds rows quickly, but retrieving millions of *scattered* rows is expensive.

---

### Step 3: Clustered index — reorganize the table itself

A clustered index is a fundamentally different thing from a non-clustered index. It doesn't build a separate lookup structure on the side. It **changes how the table's rows are physically stored on disk**, so they sit in the order of the index key.

The table *is* the index. That's why you can only have one clustered index per table — the data can only be physically sorted one way.

```sql
CREATE CLUSTERED INDEX idx_orderdate ON Orders(OrderDate);
```

**Before** — pages hold rows in insertion order (effectively random by date):

```
Page 1:  Jan 10,  July 5,   March 20
Page 2:  Jan 2,   Dec 1,    Feb 10
Page 3:  Nov 30,  Jan 7,    Aug 14
```

**After** — pages hold rows in `OrderDate` order:

```
Page 1:  Jan 1,  Jan 2,  Jan 3
Page 2:  Jan 4,  Jan 5,  Jan 6
Page 3:  Jan 7,  Jan 8,  Jan 9
```

Now the same range query:

```sql
WHERE OrderDate BETWEEN '2024-01-01' AND '2024-01-30'
```

Executes like this:

```
Find where Jan 1 lives          (a few index page reads)
  → Read Page 1   (Jan 1, Jan 2, Jan 3)
  → Read Page 2   (Jan 4, Jan 5, Jan 6)
  → Read Page 3   (Jan 7, Jan 8, Jan 9)
  → Keep reading forward until past Jan 30
```

Rows that are logically adjacent are now physically adjacent. The database reads pages **sequentially** — like reading a book front to back, rather than flipping to a random page for every sentence. Sequential reads are an order of magnitude faster than random reads on spinning disks, and still meaningfully faster on SSDs (better prefetching, fewer I/O operations).

> **Precision point:** a clustered index doesn't *replace* the index concept — it changes **storage organization**. In MySQL InnoDB, the primary key is always the clustered index, and every non-clustered index entry stores the primary key value (not a raw page pointer), meaning a secondary lookup does two traversals: secondary index → primary key → clustered index → row.

**Solves:** random I/O when reading a large group of related rows.

---

### Step 4: But the table can still be too big

Suppose you now have 10 billion rows, all beautifully sorted by `OrderDate` thanks to the clustered index:

```
2022 rows ....... 2023 rows ....... 2024 rows ....... 2025 rows ....... 2026 rows
```

You query:

```sql
WHERE OrderDate >= '2026-01-01'
```

The clustered index means once you find the start of 2026, the reads are sequential — good. But you're still operating inside one gigantic structure. Index maintenance is slow. `VACUUM`/statistics updates take hours. Deleting 2022's data means a massive `DELETE` that bloats the table. Backups cover everything even though you only care about recent data.

**The problem:** how do we avoid dealing with data that is completely irrelevant to the query?

---

### Step 5: Partitioning — split the table into independent physical segments

Partitioning divides one logical table into separate physical storage segments, each with its own set of pages, each independently maintainable.

```
Orders (one logical table, four physical segments)
├── Partition 2023  → its own pages · 2023 rows only
├── Partition 2024  → its own pages · 2024 rows only
├── Partition 2025  → its own pages · 2025 rows only
└── Partition 2026  → its own pages · 2026 rows only
```

The database keeps a small **partition map** describing each segment's boundaries. When you query:

```sql
WHERE OrderDate >= '2026-01-01'
```

The planner consults the map *before touching any data*:

```
Partition 2023 → range is 2023-01-01..2023-12-31 → cannot match → SKIP
Partition 2024 → cannot match → SKIP
Partition 2025 → cannot match → SKIP
Partition 2026 → could match  → SEARCH HERE
```

Three quarters of the data is eliminated without reading a single page. This is **partition pruning**.

The other wins are operational: dropping 2023's data is `DROP PARTITION` — a metadata operation that completes in milliseconds instead of a multi-hour `DELETE`. Index rebuilds happen per-partition. Statistics are per-partition and therefore more accurate.

> **Precision point:** partitioning does **not** make row fetches sequential — that's the clustered index's job. Partitioning reduces the **amount of data the database needs to consider** by removing irrelevant chunks from the plan entirely. The two are complementary, not alternatives.

**Solves:** the table is still enormous even when perfectly organized.

---

### The complete picture — all three layers together

A well-designed large table uses all three. Each answers a different question at a different granularity:

```
Query arrives
     │
     ▼
① Partitioning ──────── "Which chunks can I ignore completely?"
     │                   → prunes whole segments before any search
     ▼
② Clustered Index ───── "How are the surviving rows laid out on disk?"
     │                   → makes range reads sequential, not scattered
     ▼
③ Non-Clustered Index ─ "Where exactly is the specific row I want?"
     │                   → pinpoints page + slot for targeted lookups
     ▼
   Rows returned
```

Skip a layer and the next one works harder:
- No partitioning → the clustered index scan covers far more data than necessary.
- No clustered index → range results come back via random I/O.
- No non-clustered index → point lookups on non-key columns need a scan.

---

### The three things people get wrong

**1. "A non-clustered index just tells you where to start."**
No — it holds an entry for every matching key and can scan its own leaf pages in sorted order. The cost isn't finding the entries; it's that each entry may point to a **scattered** table page, producing random I/O.

**2. "A clustered index is a better kind of index."**
No — it's a different mechanism. It changes the table's **physical storage organization** so rows are stored in key order. The table *is* the index. Hence one per table.

**3. "Partitioning makes reads sequential."**
No — that's the clustered index. Partitioning **removes irrelevant chunks** so there's less data to consider in the first place. Different problem, different solution.

---

*Related: partitioning as a scalability tool (skew, hotspots, partition-key selection) is covered in the Scalability module. Sharding — partitions spread across separate servers — is also there.*
