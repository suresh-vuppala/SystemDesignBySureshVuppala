/* === Lesson pagination - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#pagination)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.11.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["pagination"] = {
  module: 3, num: "3.11", title: "Pagination",
  connectsFrom: "Returning a million rows in one response is both slow and mostly useless. Nobody scrolls through a million rows, and the way you paginate has a real complexity cost most people do not notice until it bites.",
  tabs: {
    overview: {
      heading: "Pagination: Cursor vs Offset",
      intro: "Two ways to keep responses small and stable. <strong>Offset</strong> (<code>?page=3&amp;size=20</code>) costs O(skip + limit) and can jump to any page, but breaks when rows are inserted or deleted between pages. <strong>Cursor</strong> (<code>?after=&lt;opaque-id&gt;</code>) costs O(limit) and stays correct as data changes, but only supports sequential paging.",
      table: {
        headers: ["", "Offset", "Cursor"],
        rows: [
          ["Cost", "O(skip + limit) on DB", "O(limit)"],
          ["Stability", "Items shift on insert/delete", "Stable"],
          ["Jump-to-page", "Yes", "No (sequential only)"],
          ["Use", "Admin tables, small sets", "Feeds, infinite scroll, deep lists"]
        ]
      },
      callouts: [
        { color: "green", label: "Rule of thumb:", body: "Prefer <strong>cursor pagination</strong> for feeds, infinite scroll, and deep lists where correctness under change matters. Keep <strong>offset</strong> for admin tables and small sets where jump-to-page is worth the instability." }
      ]
    },
    tradeoffs: {
      heading: "Why Offset Breaks",
      points: [
        { label: "Offset pagination", body: "Costs O(skip + limit): at page 400 the database still scans and discards 8,000 rows internally. It supports jumping directly to any page, but a row inserted mid-list shifts everything, so items appear twice or get skipped across a page boundary." },
        { label: "Cursor pagination", body: "Costs O(limit) regardless of depth, because it seeks with <code>WHERE id &gt; &lt;cursor&gt;</code> instead of skipping. It stays correct as data changes, at the price of never allowing a direct jump to page 50." }
      ]
    },
    handsOn: {
      goal: "Measure why deep offset pagination slows down while cursor pagination stays flat, using <code>EXPLAIN ANALYZE</code> on 10,000 rows.",
      stack: "Postgres in Docker, queried with <code>psql</code>. Local and free.",
      steps: [
        {
          title: "Start Postgres and seed 10,000 rows",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker exec -i pg psql -U postgres -c \"CREATE TABLE posts(id serial primary key, title text);\"\ndocker exec -i pg psql -U postgres -c \"INSERT INTO posts(title) SELECT 'post '||g FROM generate_series(1,10000) g;\"",
          lang: "bash"
        },
        {
          title: "Time offset pagination at page 1",
          code: "docker exec -i pg psql -U postgres -c \"EXPLAIN ANALYZE SELECT * FROM posts ORDER BY id OFFSET 0 LIMIT 20;\"",
          lang: "sql"
        },
        {
          title: "Time offset pagination at page 400",
          body: "Same query, offset 8000. The database still scans and discards every skipped row.",
          code: "docker exec -i pg psql -U postgres -c \"EXPLAIN ANALYZE SELECT * FROM posts ORDER BY id OFFSET 8000 LIMIT 20;\"",
          lang: "sql"
        },
        {
          title: "Time cursor pagination just as deep",
          body: "Seek past id 8000 with a <code>WHERE</code> on the indexed primary key instead of skipping.",
          code: "docker exec -i pg psql -U postgres -c \"EXPLAIN ANALYZE SELECT * FROM posts WHERE id > 8000 ORDER BY id LIMIT 20;\"",
          lang: "sql"
        }
      ],
      observe: "The offset query's actual time grows from page 1 to page 400 (it internally scans and throws away 8,000 rows), while the cursor query stays flat and uses an index scan no matter how deep you page: the O(skip + limit) vs O(limit) difference, measured rather than asserted.",
      stretch: "Insert 5 new rows between two offset requests and watch a row appear twice or get skipped across the page boundary, the exact instability named in Overview, reproduced."
    }
  },
  keyTakeaways: [
    "<strong>Offset</strong> pagination is O(skip + limit) and allows jump-to-page, but shifts when rows are inserted or deleted.",
    "<strong>Cursor</strong> pagination is O(limit) and stable under change, but only supports sequential paging.",
    "Use cursor for feeds and deep lists; use offset for admin tables and small, mostly-static sets."
  ],
  proTip: "If users page deep into a changing list, cursor pagination is the only correct choice. Offset feels convenient until page 400 scans 8,000 rows and a mid-list insert double-shows a row.",
  related: ["rest", "web-request", "graphql", "rest-vs-graphql"],
  bridgeOut: "None forward directly, but the same \u201cstable position marker\u201d idea reappears as Kafka's offset: a different domain, the same underlying problem."
};
