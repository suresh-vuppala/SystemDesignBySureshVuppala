/* === Lesson blob - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#blob)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.9.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["blob"] = {
  module: 6, num: "6.9", title: "Blob Storage (S3)",
  connectsFrom: "Images, videos, backups, and logs do not fit the row/column model any database in this module was built for, and they can be enormous. Blob storage is the default home for unstructured data: cheap, effectively infinite, and extraordinarily durable.",
  tabs: {
    overview: {
      heading: "Eleven Nines of Durability",
      intro: "Object storage like S3 offers <strong>99.999999999% durability</strong> (11 nines), which means losing about 1 object per 100 billion stored per year. It scales without capacity planning and prices storage in tiers that age data down automatically.",
      cards: [
        { icon: "S", title: "Standard", color: "green", body: "Hot data, instant access. The default tier for anything read regularly." },
        { icon: "I", title: "Infrequent Access", color: "blue", body: "Cheaper storage for data touched rarely. Lifecycle transition after ~30 days." },
        { icon: "G", title: "Glacier", color: "purple", body: "Archive tier, ~90 days. Retrieval takes minutes, not milliseconds." },
        { icon: "D", title: "Deep Archive", color: "orange", body: "Cheapest tier (~$0.00099/GB/mo), ~1 year. Retrieval takes 12 to 48 hours." }
      ],
      table: {
        headers: ["Feature", "How It Works", "Use Case"],
        rows: [
          ["<strong>Pre-signed URLs</strong>", "Server generates a time-limited signed URL, client uploads/downloads directly to S3 (no proxy)", "Large file uploads without loading the app server"],
          ["<strong>Versioning</strong>", "Every overwrite creates a new version; old versions retained until explicitly deleted", "Accidental-delete protection, audit trail"],
          ["<strong>Multipart Upload</strong>", "Split large files into chunks (5MB to 5GB each), upload in parallel, assemble on S3", "Files &gt;100MB, resumable uploads over flaky networks"],
          ["<strong>Event Notifications</strong>", "S3 triggers Lambda/SQS/SNS on PUT/DELETE events", "Auto-generate thumbnails, trigger a transcoding pipeline"],
          ["<strong>Cross-Region Replication</strong>", "Async replicate objects to another region bucket", "Disaster recovery, compliance (data residency)"]
        ]
      },
      callouts: [
        { color: "green", label: "Guarantees:", body: "<strong>Strong read-after-write consistency</strong> (S3, since December 2020). <strong>11 nines durability</strong> = lose 1 object per 100 billion stored per year. <strong>Infinite scale</strong>, no capacity planning. Partition prefixes support &gt;5,500 GET/sec or &gt;3,500 PUT/sec per prefix." },
        { color: "yellow", label: "Design patterns:", body: "<strong>Media uploads</strong>: pre-signed URL \u2192 S3 \u2192 CDN. <strong>Data lake</strong>: Parquet/ORC files on S3, queried with Athena/Spark. <strong>Backups</strong>: DB snapshots \u2192 S3 \u2192 lifecycle to Glacier. <strong>Static hosting</strong>: HTML/CSS/JS on S3 + CloudFront." }
      ]
    },
    handsOn: {
      prerequisites: "AWS free-tier account (the S3 free tier is generous).",
      setup: "Cloud free-tier: an S3 bucket. Local and free: MinIO (`docker run -d -p 9000:9000 minio/minio server /data`) as an S3-compatible local alternative.",
      simulate: "Upload a file, immediately read it back (confirm strong read-after-write). Generate a pre-signed URL (`aws s3 presign s3://bucket/key --expires-in 300`) and use `curl` to upload directly to it from your terminal, with the app server never touching the file's bytes. Set up a lifecycle rule transitioning objects to Infrequent Access after 30 days (visible in the console even without waiting).",
      observe: "The pre-signed URL upload succeeds with zero involvement from your app server beyond generating the URL itself: the exact pattern for large uploads that should not proxy through your backend.",
      stretch: "Enable versioning on the bucket, overwrite the same key twice, and list all versions (`aws s3api list-object-versions`). Confirm both old versions are still retrievable."
    }
  },
  keyTakeaways: [
    "Blob storage is the default for unstructured data: 11 nines of durability, effectively infinite scale, and no capacity planning.",
    "Storage tiers (Standard \u2192 Infrequent Access \u2192 Glacier \u2192 Deep Archive) trade retrieval speed for cost, with automatic lifecycle transitions as data ages.",
    "Pre-signed URLs let clients upload directly to S3 without proxying bytes through your app server, and S3 has offered strong read-after-write consistency since December 2020."
  ],
  proTip: "For large user uploads, hand out a pre-signed URL and let the client talk to S3 directly. Proxying gigabytes through your app server wastes bandwidth, memory, and request timeouts for no benefit.",
  related: ["cdn", "db-choice", "search"],
  bridgeOut: "\u201cReindex from S3\u201d and \u201ccache in front of S3\u201d both feed directly into Caching's CDN lesson: object storage is durable but far, so a cache layer sits in front of it."
};
