#!/usr/bin/env node
/* === Course Static Page Builder ===
   Generates one standalone, crawlable HTML page per lesson
   (system-design-course/<module-slug>/<lesson-slug>.html) from
   system-design-course/_template.html, using the lesson metadata in
   system-design-course/data/nav.js and the lesson content in
   system-design-course/data/<module-slug>/<lesson-slug>.js.

   Why this exists: the course app used to be a single hash-routed SPA
   (system-design-course/index.html + "#/slug"), which meant no lesson had
   its own real URL, so nothing was directly linkable or crawlable by
   search engines. This script produces real static pages while still
   reusing the exact same client-side render pipeline
   (system-design-course/js/course.js) for the actual lesson content, tab
   switching, and right rail, just told upfront which lesson to render via
   a `window.CURRENT_LESSON_SLUG` bootstrap instead of reading
   location.hash.

   Usage:
     node build.js               build every module listed below
     node build.js foundations   build just one module (by slug)

   Add a module to STATIC_MODULES below once its data/<module-slug>/*.js
   files exist, and it will be picked up automatically. */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const COURSE_DIR = __dirname;
const SITE_ROOT = "https://hellosde.com"; // update if the real production domain differs

// Modules that have per-lesson data files ready to build. Each entry maps
// the module's nav.js slug to its data folder name (normally identical).
const STATIC_MODULES = ["foundations", "networking", "apis", "security", "infrastructure", "storage", "caching", "messaging", "consistency", "scalability", "distributed-systems", "data-pipelines", "observability", "key-numbers", "decision-guides"];

function loadNav() {
  const navPath = path.join(COURSE_DIR, "data", "nav.js");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(navPath, "utf8"), sandbox, { filename: navPath });
  return sandbox.window.COURSE_NAV;
}

function loadLessonContent(moduleSlug, lessonSlug) {
  const dataPath = path.join(COURSE_DIR, "data", moduleSlug, lessonSlug + ".js");
  if (!fs.existsSync(dataPath)) return null;
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(dataPath, "utf8"), sandbox, { filename: dataPath });
  return (sandbox.window.COURSE_CONTENT || {})[lessonSlug] || null;
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]+>/g, "");
}

function truncate(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

function buildDescription(lessonData) {
  const raw = lessonData.tabs && lessonData.tabs.overview && lessonData.tabs.overview.intro
    ? lessonData.tabs.overview.intro
    : lessonData.connectsFrom || "";
  return truncate(stripHtml(raw).replace(/\s+/g, " ").trim(), 155);
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

function renderPage(template, vars) {
  let out = template;
  Object.keys(vars).forEach((key) => {
    out = out.split("{{" + key + "}}").join(vars[key]);
  });
  return out;
}

function buildModule(nav, moduleSlug, template) {
  const mod = nav.modules.find((m) => m.slug === moduleSlug);
  if (!mod) {
    console.warn("No module found in nav.js with slug:", moduleSlug);
    return { built: 0, skipped: 0 };
  }

  const outDir = path.join(COURSE_DIR, moduleSlug);
  fs.mkdirSync(outDir, { recursive: true });

  let built = 0;
  let skipped = 0;

  mod.lessons.forEach((lesson) => {
    const lessonData = loadLessonContent(moduleSlug, lesson.slug);
    if (!lessonData) {
      console.warn("  skip (no data file):", moduleSlug + "/" + lesson.slug);
      skipped++;
      return;
    }

    const pageTitle = escapeAttr(lessonData.num + " " + lessonData.title + " - System Design Course - HelloSDE");
    const description = escapeAttr(buildDescription(lessonData));
    const canonicalUrl = SITE_ROOT + "/system-design-course/" + moduleSlug + "/" + lesson.slug + ".html";
    const dataSrc = "../data/" + moduleSlug + "/" + lesson.slug + ".js";

    const html = renderPage(template, {
      PAGE_TITLE: pageTitle,
      PAGE_DESCRIPTION: description,
      CANONICAL_URL: canonicalUrl,
      LESSON_DATA_SRC: dataSrc,
      LESSON_SLUG: lesson.slug
    });

    const outPath = path.join(outDir, lesson.slug + ".html");
    fs.writeFileSync(outPath, html, "utf8");
    console.log("  built:", path.relative(COURSE_DIR, outPath));
    built++;
  });

  return { built, skipped };
}

/* === Search index generation ===
   Produces system-design-course/data/search-index.js (a single
   window.COURSE_SEARCH_INDEX array) so the sidebar search box can match
   against every module, lesson, tab, and the important terms/words inside
   each lesson, on any page, without loading all 141 lesson data files.

   One record per lesson in nav.js. Lessons with a data file get enriched
   with their real tab labels and extracted terms; lessons without one
   (module not built yet) still appear so they remain searchable by title
   and route to the SPA "coming soon" placeholder. */

// Standard tab labels, mirrors TAB_DEFS / availableTabs() in js/course.js so
// the searchable tab names match exactly what the UI renders.
const STANDARD_TAB_LABELS = {
  overview: "Overview",
  realWorld: "Real-World",
  tradeoffs: "Trade-offs",
  handsOn: "Hands-On",
  related: "Related"
};

function tabLabelsFor(lessonData) {
  if (!lessonData) return [];
  const tabs = lessonData.tabs || {};
  // A lesson may declare its own tab set via customTabs; otherwise the
  // fixed overview/realWorld/tradeoffs/handsOn set applies. Related is
  // always shown last (see availableTabs() in js/course.js).
  if (Array.isArray(lessonData.customTabs) && lessonData.customTabs.length) {
    const labels = lessonData.customTabs
      .filter((t) => tabs[t.key])
      .map((t) => t.label);
    if (tabs.handsOn) labels.push("Hands-On");
    labels.push("Related");
    return labels;
  }
  const labels = [];
  ["overview", "realWorld", "tradeoffs", "handsOn"].forEach((k) => {
    if (tabs[k]) labels.push(STANDARD_TAB_LABELS[k]);
  });
  labels.push("Related");
  return labels;
}

// Pull every <strong>...</strong> highlighted phrase out of an HTML string.
// These are the lesson's deliberately emphasized "important terms/words".
function extractStrongTerms(html) {
  const out = [];
  const re = /<strong>([\s\S]*?)<\/strong>/gi;
  let m;
  while ((m = re.exec(String(html))) !== null) {
    out.push(stripHtml(m[1]));
  }
  return out;
}

// Normalize a candidate term for de-duplication / quality filtering, and
// return a cleaned display string (or "" to drop it).
function cleanTerm(raw) {
  let t = stripHtml(String(raw || ""))
    .replace(/\s+/g, " ")
    .replace(/[:.,;]+$/, "")
    .trim();
  // Drop empties, single characters, over-long phrases (those are sentences,
  // not terms), and anything that is just a number.
  if (t.length < 2 || t.length > 42) return "";
  if (/^\d+%?$/.test(t)) return "";
  return t;
}

function collectLessonTerms(lessonData) {
  if (!lessonData) return [];
  const terms = [];
  const push = (v) => {
    const c = cleanTerm(v);
    if (c) terms.push(c);
  };

  const tabs = lessonData.tabs || {};
  Object.keys(tabs).forEach((key) => {
    const tab = tabs[key];
    if (!tab || typeof tab !== "object") return;
    push(tab.heading);
    if (tab.intro) extractStrongTerms(tab.intro).forEach(push);
    if (tab.body) extractStrongTerms(tab.body).forEach(push);
    (tab.cards || []).forEach((c) => {
      push(c.title);
      extractStrongTerms(c.body).forEach(push);
    });
    (tab.points || []).forEach((p) => {
      push(p.label);
      extractStrongTerms(p.body).forEach(push);
    });
    (tab.callouts || []).forEach((c) => {
      push(c.label);
      extractStrongTerms(c.body).forEach(push);
    });
    const tableList = [];
    if (tab.table) tableList.push(tab.table);
    (tab.tables || []).forEach((t) => tableList.push(t));
    tableList.forEach((tbl) => {
      (tbl.headers || []).forEach(push);
    });
  });

  // De-duplicate case-insensitively, keep first-seen casing, and cap the
  // list so the index stays lean.
  const seen = Object.create(null);
  const unique = [];
  terms.forEach((t) => {
    const k = t.toLowerCase();
    if (seen[k]) return;
    seen[k] = true;
    unique.push(t);
  });
  return unique.slice(0, 40);
}

function buildSearchIndex(nav) {
  const records = [];
  nav.modules.forEach((mod) => {
    mod.lessons.forEach((lesson) => {
      const lessonData = loadLessonContent(mod.slug, lesson.slug);
      records.push({
        m: mod.num,
        mt: mod.title,
        ms: mod.slug,
        n: lesson.num,
        t: lesson.title,
        s: lesson.slug,
        tabs: tabLabelsFor(lessonData),
        terms: collectLessonTerms(lessonData)
      });
    });
  });

  const header =
    "/* === Course Search Index - AUTO-GENERATED by build.js ===\n" +
    "   Do not hand-edit. One record per lesson: module (m/mt/ms), lesson\n" +
    "   (n/t/s), tab labels, and extracted important terms. Regenerate with:\n" +
    "   node build.js */\n";
  const body =
    "window.COURSE_SEARCH_INDEX = " + JSON.stringify(records) + ";\n";
  const outPath = path.join(COURSE_DIR, "data", "search-index.js");
  fs.writeFileSync(outPath, header + body, "utf8");

  const termCount = records.reduce((n, r) => n + r.terms.length, 0);
  console.log(
    "Search index: " +
      records.length +
      " lesson(s), " +
      termCount +
      " term(s) -> " +
      path.relative(COURSE_DIR, outPath)
  );
}

function main() {
  const requestedModule = process.argv[2];
  const modulesToBuild = requestedModule ? [requestedModule] : STATIC_MODULES;

  const templatePath = path.join(COURSE_DIR, "_template.html");
  const template = fs.readFileSync(templatePath, "utf8");
  const nav = loadNav();

  let totalBuilt = 0;
  let totalSkipped = 0;

  modulesToBuild.forEach((moduleSlug) => {
    console.log("Building module:", moduleSlug);
    const { built, skipped } = buildModule(nav, moduleSlug, template);
    totalBuilt += built;
    totalSkipped += skipped;
  });

  // The search index always spans the whole course (every module/lesson in
  // nav.js), regardless of which module(s) were rebuilt above, so the
  // sidebar search stays complete.
  buildSearchIndex(nav);

  console.log("Done. Built " + totalBuilt + " page(s), skipped " + totalSkipped + " (no data file yet).");
}

main();
