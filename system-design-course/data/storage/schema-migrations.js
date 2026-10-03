/* === Lesson schema-migrations - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#schema-migrations)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.13.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["schema-migrations"] = {
  module: 6, num: "6.13", title: "Schema Migrations",
  connectsFrom: "Changing a live table's schema can lock the table and take production down for the duration, on a large enough table. Migrations make schema changes <strong>version-controlled, repeatable, and safe</strong> to run against a running app.",
  tabs: {
    overview: {
      heading: "Version-Controlled Schema Change",
      intro: "Migration tools turn ad-hoc <code>ALTER</code> statements into versioned, repeatable changesets with an audit trail. For very large tables, the goal is <strong>zero downtime</strong>: never take a lock that blocks the app for the length of a full backfill.",
      cards: [
        { icon: "F", title: "Flyway", color: "green", body: "JVM, polyglot SQL migrations. Versioned files like `V1__add_column.sql`, applied in order." },
        { icon: "L", title: "Liquibase", color: "blue", body: "JVM, XML/YAML changesets. Database-agnostic change descriptions." },
        { icon: "A", title: "Alembic", color: "purple", body: "Python / SQLAlchemy migrations. The standard in the Python ecosystem." },
        { icon: "O", title: "Online tools", color: "orange", body: "<strong>pt-online-schema-change</strong> (MySQL) and <strong>gh-ost</strong>: shadow table + chunked copy + atomic swap for zero-downtime changes on huge tables." }
      ],
      table: {
        headers: ["Tool", "Stack"],
        rows: [
          ["Flyway", "JVM, polyglot SQL"],
          ["Liquibase", "JVM, XML/YAML changesets"],
          ["Alembic", "Python / SQLAlchemy"],
          ["Prisma Migrate", "Node / TS"],
          ["Rails / Django Migrations", "built-in ORM"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Big-table pitfall:", body: "An <code>ALTER</code> can take an exclusive lock for hours on a large table. Use <strong>pt-online-schema-change</strong> (MySQL) or <strong>gh-ost</strong> for zero-downtime changes: a shadow table, chunked copy, and atomic swap avoid ever locking the live table for the full change." },
        { color: "green", label: "Expand-Contract pattern:", body: "Add the new column \u2192 <strong>dual-write</strong> to both old and new \u2192 <strong>backfill</strong> historical data in batches \u2192 <strong>switch reads</strong> to the new column \u2192 <strong>drop the old</strong> one, only once nothing reads it anymore. Never break the running app." }
      ]
    },
    handsOn: {
      goal: "On a 1M-row table, contrast a risky direct column rename against the Expand-Contract pattern (add, backfill in batches, switch reads, drop later) so no single step locks the whole table.",
      stack: "Postgres in Docker, driven with <code>psql</code>. Local and free.",
      steps: [
        {
          title: "Start Postgres and seed 1M rows",
          code: "docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=pw postgres\ndocker exec -i pg psql -U postgres -c \"CREATE TABLE users(id int primary key, email text);\"\ndocker exec -i pg psql -U postgres -c \"INSERT INTO users SELECT g, 'user'||g||'@test.com' FROM generate_series(1,1000000) g;\"",
          lang: "bash"
        },
        {
          title: "Time a direct rename",
          body: "Run inside <code>psql</code> with timing on. Note the duration and that it takes an exclusive lock.",
          code: "\\timing on\nALTER TABLE users RENAME COLUMN email TO email_address;",
          lang: "sql"
        },
        {
          title: "Expand: add the new column (fast, no rewrite)",
          code: "ALTER TABLE users ADD COLUMN email_addr text;",
          lang: "sql"
        },
        {
          title: "Backfill in batches, never one giant UPDATE",
          body: "Each iteration is its own transaction touching a 50k slice, so locks release between batches instead of being held for the whole backfill.",
          code: "for lo in $(seq 0 50000 950000); do\n  hi=$((lo + 50000))\n  docker exec -i pg psql -U postgres -c \\\n    \"UPDATE users SET email_addr = email WHERE id > $lo AND id <= $hi;\"\ndone",
          lang: "bash"
        },
        {
          title: "Contract: drop the old column in a later migration",
          body: "Only after the app reads <code>email_addr</code> everywhere.",
          code: "ALTER TABLE users DROP COLUMN email;",
          lang: "sql"
        }
      ],
      observe: "The direct rename's lock duration scales with table size (visible via <code>\\timing</code>), while each Expand-Contract step stays fast because no single statement locks the whole table for the full backfill.",
      stretch: "Version both changes with Flyway (<code>V1__add_column.sql</code>, <code>V2__drop_old_column.sql</code>) and run <code>flyway info</code> to see applied/pending state: the audit trail a manual <code>ALTER TABLE</code> in a terminal never leaves."
    }
  },
  keyTakeaways: [
    "Migration tools (Flyway, Liquibase, Alembic, Prisma, Rails/Django) make schema changes versioned, repeatable, and auditable instead of ad-hoc.",
    "On large tables a plain <code>ALTER</code> can hold an exclusive lock for hours; pt-online-schema-change and gh-ost do it with a shadow table and atomic swap for zero downtime.",
    "Expand-Contract (add \u2192 dual-write \u2192 backfill \u2192 switch reads \u2192 drop) changes schema without ever breaking the running app."
  ],
  proTip: "Never rename or drop a column in a single deploy. Expand-Contract across multiple deploys keeps old and new readers working, so a rollback is always safe.",
  related: ["sql", "connection-pooling", "db-choice"],
  bridgeOut: "This closes Module 6. Caching opens next, motivated directly by the fact that every one of these storage engines still requires a disk trip."
};
