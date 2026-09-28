# images/

Public static images for the site, organized by course module and lesson.

Because `vercel.json` sets `"outputDirectory": "."`, the repo root is the web
root, so anything committed here is served publicly at `/images/...`.

## Structure: images/<module>/<lesson>/

One folder per course module, and inside it one folder per lesson. The slugs
match `system-design-course/data/<module>/<lesson>.js`, so a lesson's images
live in the same-named path. Example:

    images/
    ├── infrastructure/
    │   ├── load-balancer/
    │   │   ├── types.png
    │   │   └── l4-vs-l7.png
    │   ├── api-gateway/
    │   └── nginx/
    ├── apis/
    │   ├── rest-vs-graphql/
    │   └── grpc/
    └── foundations/
        └── concurrency-io/

## Usage

Reference images with an ABSOLUTE path from the site root so it works from any
page depth (course lessons live at `system-design-course/<module>/<slug>.html`):

    <img src="/images/infrastructure/load-balancer/types.png"
         alt="Hardware vs software vs cloud load balancers" style="max-width:100%">

In a course lesson data file (`data/<module>/<slug>.js`), put that `<img>` tag
inside an `intro`, a card `body`, or a callout `body` string.

Public URL after deploy:
https://hellosde.com/images/infrastructure/load-balancer/types.png

## Notes
- Commit images to git (Vercel deploys from git, not your local disk).
- Each lesson folder has a `.gitkeep` so the empty folder stays tracked; delete
  it once the folder has real images.
- This README is a `.md` file, so `.vercelignore` (`*.md`) keeps it out of the
  deployment. It only documents the convention.
- Prefer SVG/WebP or optimized PNG/JPG to keep pages fast.
