/* === Course Viewer - App Logic ===
   Renders the left sidebar from window.COURSE_NAV, renders lesson content
   from window.COURSE_CONTENT (only Module 1 is wired up for now), handles
   tab switching, hash-based routing, and completion-state persistence via
   localStorage so the sidebar progress dots/counters are real. */

(function(){
  "use strict";

  var STORAGE_KEY = "hsde-course-progress";
  var nav = window.COURSE_NAV;
  var content = window.COURSE_CONTENT || {};

  /* -- URL resolution --
     Static lesson pages (system-design-course/<module-slug>/<lesson-slug>.html)
     set window.CURRENT_LESSON_SLUG before this script runs. Each module's
     slug (nav.js) doubles as its URL folder name (e.g. "foundations"),
     so once a module is listed in STATIC_MODULES below, every internal
     link this app builds for its lessons becomes a real, crawlable,
     bookmarkable href instead of a "#/slug" hash. The old hash-router
     (system-design-course/index.html, no longer linked to from the
     sidebar) still works as a fallback for modules not yet migrated, and
     for any bookmarked "#/slug" links from before this migration. */
  var STATIC_MODULES = { foundations: true, networking: true, apis: true, security: true, infrastructure: true, storage: true, caching: true, messaging: true, consistency: true, scalability: true, "distributed-systems": true, "data-pipelines": true, observability: true, "key-numbers": true, "decision-guides": true }; // modules migrated to static per-lesson pages so far
  // Static lesson pages live one folder deeper than the old SPA shell
  // (system-design-course/<module-slug>/<lesson-slug>.html vs
  // system-design-course/index.html), so every root-relative link
  // (favicon, site nav, "back to courses") needs one extra "../" when
  // running as a static page.
  var ROOT_PREFIX = window.CURRENT_LESSON_SLUG ? '../../' : '../';
  // From a static lesson page (system-design-course/<module>/<lesson>.html)
  // a link to another lesson needs to go up one level first ("../"), then
  // into the target module's folder. From the old SPA shell
  // (system-design-course/index.html) there's no "up" to do, the module
  // folder is already a direct child. Reusing the wrong one of these two
  // is exactly what sent index.html's sidebar links to a nonexistent
  // "foundations/" at the project root instead of
  // "system-design-course/foundations/".
  var MODULE_LINK_PREFIX = window.CURRENT_LESSON_SLUG ? '../' : '';
  // Fallback for lessons in modules not yet built as static pages: route
  // through the SPA shell's hash-router (system-design-course/index.html
  // #/slug), which renders the "coming soon" placeholder for any slug
  // with no COURSE_CONTENT entry. A bare "#/slug" only works if you're
  // already sitting on index.html; from a static lesson page it just
  // appends a dead hash to that page's own URL, so this always points at
  // the actual index.html file first, then the hash.
  var INDEX_PREFIX = window.CURRENT_LESSON_SLUG ? '../' : '';
  function lessonHref(slug){
    var info = findLessonBySlug(slug);
    if(info && STATIC_MODULES[info.module.slug]) return MODULE_LINK_PREFIX + info.module.slug + '/' + slug + '.html';
    return INDEX_PREFIX + 'index.html#/' + slug;
  }

  // The slug of the lesson currently being rendered, so auto-linking never
  // links a lesson to itself. Set in renderLesson().
  var ACTIVE_SLUG = null;

  // Curated aliases: the common name a topic goes by in prose, mapped to its
  // lesson slug. These carry most of the auto-linking value because prose
  // rarely uses a lesson's full title verbatim. Slugs that do not exist are
  // silently ignored, so this list is safe to over-specify.
  var LINK_ALIASES = {
    "consistent hashing": "consistent-hashing",
    "rate limiting": "rate-limiting",
    "bloom filter": "bloom-filters",
    "bloom filters": "bloom-filters",
    "backpressure": "backpressure",
    "auto-scaling": "auto-scaling",
    "autoscaling": "auto-scaling",
    "graceful degradation": "graceful-degradation",
    "cap theorem": "cap",
    "consistency models": "consistency-models",
    "consensus algorithms": "consensus",
    "consensus protocols": "consensus-protocols",
    "distributed transactions": "transactions",
    "two-phase commit": "transactions",
    "saga": "saga-orchestration",
    "conflict resolution": "conflict-resolution",
    "event sourcing": "event-sourcing",
    "cqrs": "cqrs",
    "cache invalidation": "cache-invalidation",
    "redis streams": "redis-streams",
    "redis pub/sub": "redis-pubsub",
    "redis cluster": "redis-cluster",
    "memcached": "memcached-vs-redis",
    "cdn": "cdn",
    "websocket": "websocket-deep",
    "websockets": "websocket-deep",
    "server-sent events": "sse-deep",
    "grpc": "grpc",
    "graphql": "graphql",
    "message queue": "message-queues",
    "message queues": "message-queues",
    "rabbitmq": "message-queues",
    "quorum queue": "message-queues",
    "quorum queues": "message-queues",
    "dead letter queue": "dlq",
    "dead-letter queue": "dlq",
    "kafka": "kafka",
    "load balancer": "load-balancer",
    "load balancing": "load-balancer",
    "api gateway": "api-gateway",
    "service mesh": "service-mesh",
    "service discovery": "service-discovery",
    "leader election": "leader-election",
    "failure detection": "failure-detection",
    "database indexing": "db-indexing",
    "database internals": "db-internals",
    "distributed indexing": "distributed-indexing",
    "partitioning": "partitioning",
    "sharding": "sharding",
    "replication": "replication",
    "vector database": "vector-db",
    "vector databases": "vector-db",
    "elasticsearch": "search",
    "idempotency": "idempotent-apis",
    "idempotent": "idempotent-apis",
    "multi-region": "multi-region"
  };

  // Built once: a list of {phrase, slug} sorted longest-phrase-first, from
  // the curated aliases plus every lesson's full title. Only slugs that
  // resolve to a real lesson are kept.
  var _linkIndex = null;
  function linkIndex(){
    if(_linkIndex) return _linkIndex;
    var seen = {}, entries = [];
    function add(phrase, slug){
      phrase = phrase.toLowerCase();
      var key = phrase + '\u0000' + slug;
      if(seen[key] || !findLessonBySlug(slug)) return;
      seen[key] = 1;
      entries.push({ phrase: phrase, slug: slug });
    }
    for(var p in LINK_ALIASES){ if(LINK_ALIASES.hasOwnProperty(p)) add(p, LINK_ALIASES[p]); }
    (nav.modules || []).forEach(function(m){
      (m.lessons || []).forEach(function(l){
        if(l.title && l.title.length >= 7) add(l.title, l.slug);
      });
    });
    entries.sort(function(a, b){ return b.phrase.length - a.phrase.length; });
    _linkIndex = entries;
    return entries;
  }

  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Link the first unlinked, whole-phrase occurrence of each known topic in a
  // plain-text segment, skipping the current lesson and respecting a per-tab
  // cap. `used` dedupes so each target is linked at most once per tab.
  function autoLinkText(text, used, cap, selfSlug){
    var entries = linkIndex();
    for(var i = 0; i < entries.length && used.count < cap; i++){
      var e = entries[i];
      if(e.slug === selfSlug || used.slugs[e.slug]) continue;
      var re = new RegExp('(^|[^\\w-])(' + escapeRegExp(e.phrase) + ')(?![\\w-])', 'i');
      var m = re.exec(text);
      if(m){
        var link = m[1] + '<a class="cc-xlink" href="' + lessonHref(e.slug) + '">' + m[2] + '</a>';
        text = text.slice(0, m.index) + link + text.slice(m.index + m[0].length);
        used.slugs[e.slug] = true;
        used.count++;
      }
    }
    return text;
  }

  // Walk the HTML, auto-linking only in text outside tags and outside
  // <a>, <code>, and headings, so we never nest links or touch markup.
  function autoLink(html, selfSlug){
    var parts = html.split(/(<[^>]+>)/);
    var skip = 0;
    var used = { slugs: {}, count: 0 };
    var selfInfo = selfSlug && findLessonBySlug(selfSlug);
    var selfNum = selfInfo ? String(selfInfo.lesson.num) : null;
    for(var i = 0; i < parts.length; i++){
      if(i % 2 === 1){
        var tag = parts[i].toLowerCase();
        if(/^<(a|code|h3|h4|h5)\b/.test(tag)) skip++;
        else if(/^<\/(a|code|h3|h4|h5)>/.test(tag) && skip > 0) skip--;
        continue;
      }
      if(skip > 0 || !parts[i]) continue;
      // Link topic phrases first, then bare "(N.N)" lesson-number references,
      // both only in text outside tags/code/headings/existing links.
      parts[i] = autoLinkText(parts[i], used, 10, selfSlug);
      parts[i] = linkLessonNumbers(parts[i], selfNum);
    }
    return parts.join('');
  }

  // Resolve inline lesson links written in lesson content as [[slug|label]]
  // or [[slug]] into real <a> links via lessonHref (working both on a static
  // lesson page and in the SPA shell; unknown slugs degrade to plain text),
  // then auto-link mentions of other lessons' topics for easy navigation.
  function linkifyLessons(html){
    if(!html) return html;
    html = html.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi, function(_m, slug, label){
      var info = findLessonBySlug(slug);
      var text = label || (info ? info.lesson.title : slug);
      if(!info) return text;
      return '<a class="cc-xlink" href="' + lessonHref(slug) + '">' + text + '</a>';
    });
    return autoLink(html, ACTIVE_SLUG);
  }

  function getProgress(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    }catch(e){ return {}; }
  }
  function setComplete(slug, done){
    var p = getProgress();
    p[slug] = !!done;
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }catch(e){}
  }
  function isComplete(slug){
    return !!getProgress()[slug];
  }

  function findLessonBySlug(slug){
    for(var m=0; m<nav.modules.length; m++){
      var mod = nav.modules[m];
      for(var l=0; l<mod.lessons.length; l++){
        if(mod.lessons[l].slug === slug){
          return { module: mod, lesson: mod.lessons[l], index: l };
        }
      }
    }
    return null;
  }

  function moduleProgress(mod){
    var done = 0;
    for(var i=0; i<mod.lessons.length; i++){
      if(isComplete(mod.lessons[i].slug)) done++;
    }
    return { done: done, total: mod.lessons.length };
  }

  /* -- Numeric lesson references --
     The prose convention throughout the course cites other lessons by number
     inside parentheses, e.g. "(7.6)" or "(see 2.1, 2.4)". autoLink() only
     links topic *phrases*, so those bare numbers stayed dead text. This maps
     a lesson number to its slug and linkifies every "(N.N)" that names a real
     lesson. It only touches numbers inside parentheses, skips a number
     immediately followed by a unit (so "2.5 TB", "<1.5s", "3.6 TB" stay plain
     measurements), and never links a lesson to itself. Uses the same
     cc-xlink class and lessonHref() as the rest of the auto-linker, so it
     resolves on both static lesson pages and the SPA shell. */
  var _numToSlug = null;
  function numToSlug(){
    if(_numToSlug) return _numToSlug;
    _numToSlug = {};
    nav.modules.forEach(function(m){
      m.lessons.forEach(function(l){ _numToSlug[String(l.num)] = l.slug; });
    });
    return _numToSlug;
  }
  function linkLessonNumbers(text, selfNum){
    var map = numToSlug();
    return text.replace(/\(([^()<>]+)\)/g, function(full, inner){
      var out = inner.replace(/(^|[^A-Za-z0-9.\/])(\d{1,2}\.\d{1,2})(?![\d.])(\s*(?:x|%|s|ms|GB|MB|KB|TB|K|M|B)\b)?/g,
        function(m, pre, num, unit){
          if(unit) return m;                       // a measurement, not a lesson ref
          var slug = map[num];
          if(!slug || num === String(selfNum)) return m; // unknown or self-reference
          return pre + '<a class="cc-xlink" href="' + lessonHref(slug) + '">' + num + '</a>';
        });
      return '(' + out + ')';
    });
  }

  /* -- Sidebar rendering -- */
  function renderSidebar(activeSlug){
    var root = document.getElementById("courseSidebar");
    if(!root) return;

    var activeInfo = findLessonBySlug(activeSlug);
    var activeModuleNum = activeInfo ? activeInfo.module.num : 1;

    var html = '';
    html += '<a class="cs-back" href="' + ROOT_PREFIX + 'master-system-design.html">'
      + iconSvg('chevLeft')
      + ' Back to Courses</a>';
    html += '<div class="cs-course-title"><h1>' + nav.courseTitle + '</h1><p>' + nav.courseSubtitle + '</p></div>';

    // Search box: filters the whole course (modules, lessons, tab names, and
    // important terms) against window.COURSE_SEARCH_INDEX (data/search-index.js).
    html += '<div class="cs-search">'
      + '<span class="cs-search-icon">' + iconSvg('search') + '</span>'
      + '<input type="text" class="cs-search-input" id="csSearchInput" placeholder="Search lessons, tabs, terms\u2026" autocomplete="off" spellcheck="false" aria-label="Search the course">'
      + '<button class="cs-search-clear" id="csSearchClear" type="button" aria-label="Clear search" hidden>' + iconSvg('close') + '</button>'
      + '</div>';
    // Results list (hidden until the user types); replaces the tree while active.
    html += '<div class="cs-search-results" id="csSearchResults" hidden></div>';

    html += '<div class="cs-tree">';
    nav.modules.forEach(function(mod){
      var isActiveModule = mod.num === activeModuleNum;
      var prog = moduleProgress(mod);
      var expanded = isActiveModule; // only the active module auto-expands; others stay collapsed
      html += '<div class="cs-module' + (expanded ? ' cs-expanded' : '') + '" data-module="' + mod.num + '">';
      html += '  <button class="cs-module-header' + (isActiveModule ? ' cs-active-module' : '') + '" data-toggle-module="' + mod.num + '">';
      html += '    <span class="cs-module-label"><span class="cs-module-dot"></span><span class="cs-module-title">' + mod.num + '. ' + mod.title + '</span></span>';
      html += '    <span class="cs-module-meta"><span class="cs-progress">' + prog.done + '/' + prog.total + '</span>';
      html += '      ' + iconSvg('chevRight', 'cs-chevron');
      html += '    </span>';
      html += '  </button>';
      html += '  <div class="cs-lessons">';
      mod.lessons.forEach(function(lesson){
        var active = lesson.slug === activeSlug;
        var complete = isComplete(lesson.slug);
        html += '<a class="cs-lesson' + (active ? ' cs-active-lesson' : '') + (complete ? ' cs-complete' : '') + '" href="' + lessonHref(lesson.slug) + '" data-lesson="' + lesson.slug + '">';
        html += '  <span class="cs-lesson-dot">' + (complete ? iconSvg('check') : '') + '</span>';
        html += '  <span class="cs-lesson-label"><span class="cs-lesson-num">' + lesson.num + '</span>' + lesson.title + '</span>';
        html += '</a>';
      });
      html += '  </div>';
      html += '</div>';
    });
    html += '</div>';

    root.innerHTML = html;

    // Module expand/collapse
    root.querySelectorAll('[data-toggle-module]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var wrap = btn.closest('.cs-module');
        wrap.classList.toggle('cs-expanded');
      });
    });

    // Lesson click -> close both mobile drawers
    root.querySelectorAll('[data-lesson]').forEach(function(a){
      a.addEventListener('click', function(){
        closeMobileSidebar();
        closeRailDrawer();
      });
    });

    wireSidebarSearch(activeSlug);
  }

  /* -- Sidebar search --
     Filters the entire course from window.COURSE_SEARCH_INDEX (built by
     build.js into data/search-index.js). Matches module titles, lesson
     titles/numbers, tab names, and each lesson's important terms, then
     renders a ranked result list in place of the module tree. Works on both
     static lesson pages and the SPA shell since the index is loaded on both. */
  function highlight(text, q){
    var s = String(text == null ? '' : text);
    if(!q) return escapeHtml(s);
    var i = s.toLowerCase().indexOf(q);
    if(i < 0) return escapeHtml(s);
    return escapeHtml(s.slice(0, i))
      + '<mark class="cs-hl">' + escapeHtml(s.slice(i, i + q.length)) + '</mark>'
      + escapeHtml(s.slice(i + q.length));
  }

  function scoreRecord(rec, q){
    // Lower score = stronger match, shown first. Also collects the tab
    // labels and terms that matched so the result row can show why it hit.
    var titleHit = rec.t.toLowerCase().indexOf(q) >= 0 || String(rec.n).toLowerCase().indexOf(q) >= 0;
    var moduleHit = rec.mt.toLowerCase().indexOf(q) >= 0 || (rec.m + '.').indexOf(q) === 0;
    var tabHits = (rec.tabs || []).filter(function(l){ return l.toLowerCase().indexOf(q) >= 0; });
    var termHits = (rec.terms || []).filter(function(t){ return t.toLowerCase().indexOf(q) >= 0; });

    if(!titleHit && !moduleHit && !tabHits.length && !termHits.length) return null;

    var score = 4;
    if(titleHit) score = rec.t.toLowerCase().indexOf(q) === 0 ? 0 : 1;
    else if(moduleHit) score = 2;
    else if(tabHits.length) score = 3;
    else if(termHits.length) score = 4;

    return { rec: rec, score: score, titleHit: titleHit, moduleHit: moduleHit, tabHits: tabHits, termHits: termHits };
  }

  function renderSearchResults(q){
    var index = window.COURSE_SEARCH_INDEX || [];
    var matches = [];
    for(var i=0; i<index.length; i++){
      var r = scoreRecord(index[i], q);
      if(r) matches.push(r);
    }
    matches.sort(function(a, b){
      if(a.score !== b.score) return a.score - b.score;
      if(a.rec.m !== b.rec.m) return a.rec.m - b.rec.m;
      return String(a.rec.n).localeCompare(String(b.rec.n), undefined, { numeric: true });
    });

    if(!index.length){
      return '<div class="cs-search-empty">Search index not loaded.</div>';
    }
    if(!matches.length){
      return '<div class="cs-search-empty">No matches for \u201c' + escapeHtml(q) + '\u201d</div>';
    }

    var capped = matches.slice(0, 50);
    var html = '<div class="cs-search-count">' + matches.length + ' result' + (matches.length === 1 ? '' : 's') + '</div>';
    capped.forEach(function(m){
      var rec = m.rec;
      html += '<a class="cs-search-hit" href="' + lessonHref(rec.s) + '" data-lesson="' + rec.s + '">';
      html += '<span class="cs-hit-title"><span class="cs-hit-num">' + escapeHtml(rec.n) + '</span>' + highlight(rec.t, q) + '</span>';
      html += '<span class="cs-hit-module">' + escapeHtml(rec.m + '. ') + highlight(rec.mt, q) + '</span>';

      var chips = '';
      m.tabHits.forEach(function(l){ chips += '<span class="cs-hit-chip cs-hit-chip-tab">' + iconSvg('book') + highlight(l, q) + '</span>'; });
      m.termHits.slice(0, 4).forEach(function(t){ chips += '<span class="cs-hit-chip">' + highlight(t, q) + '</span>'; });
      if(m.termHits.length > 4) chips += '<span class="cs-hit-chip cs-hit-chip-more">+' + (m.termHits.length - 4) + '</span>';
      if(chips) html += '<span class="cs-hit-context">' + chips + '</span>';

      html += '</a>';
    });
    return html;
  }

  function wireSidebarSearch(activeSlug){
    var input = document.getElementById('csSearchInput');
    var clearBtn = document.getElementById('csSearchClear');
    var results = document.getElementById('csSearchResults');
    var tree = document.querySelector('#courseSidebar .cs-tree');
    if(!input || !results || !tree) return;

    function apply(){
      var q = input.value.trim().toLowerCase();
      if(clearBtn) clearBtn.hidden = !input.value;
      if(!q){
        results.hidden = true;
        results.innerHTML = '';
        tree.hidden = false;
        return;
      }
      tree.hidden = true;
      results.hidden = false;
      results.innerHTML = renderSearchResults(q);
      // Result clicks close the mobile drawers, same as tree lesson links.
      results.querySelectorAll('[data-lesson]').forEach(function(a){
        a.addEventListener('click', function(){
          closeMobileSidebar();
          closeRailDrawer();
        });
      });
    }

    input.addEventListener('input', apply);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        input.value = '';
        apply();
        input.blur();
      } else if(e.key === 'Enter'){
        var first = results.querySelector('.cs-search-hit');
        if(first){ e.preventDefault(); first.click(); }
      }
    });
    if(clearBtn){
      clearBtn.addEventListener('click', function(){
        input.value = '';
        apply();
        input.focus();
      });
    }
  }

  /* -- Mobile drawer toggles (left sidebar + right rail) --
     Both drawers share one dimming overlay. Opening either one closes the
     other first, so they never fight for screen space on a small phone. */
  function closeMobileSidebar(){
    var sb = document.getElementById("courseSidebar");
    if(sb) sb.classList.remove("cs-open");
    updateOverlay();
  }
  function closeRailDrawer(){
    var rail = document.getElementById("courseRail");
    if(rail) rail.classList.remove("cr-open");
    updateOverlay();
  }
  function updateOverlay(){
    var ov = document.getElementById("courseOverlay");
    if(!ov) return;
    var sb = document.getElementById("courseSidebar");
    var rail = document.getElementById("courseRail");
    var anyOpen = (sb && sb.classList.contains("cs-open")) || (rail && rail.classList.contains("cr-open"));
    ov.classList.toggle("cs-overlay-visible", !!anyOpen);
  }
  function initMobileToggle(){
    var toggle = document.getElementById("courseMobileToggle");
    var railToggle = document.getElementById("courseRailToggle");
    var sb = document.getElementById("courseSidebar");
    var rail = document.getElementById("courseRail");
    var ov = document.getElementById("courseOverlay");

    if(toggle && sb){
      toggle.addEventListener('click', function(){
        closeRailDrawer();
        sb.classList.toggle("cs-open");
        updateOverlay();
      });
    }
    if(railToggle && rail){
      railToggle.addEventListener('click', function(){
        closeMobileSidebar();
        rail.classList.toggle("cr-open");
        updateOverlay();
      });
    }
    if(ov){
      ov.addEventListener('click', function(){
        closeMobileSidebar();
        closeRailDrawer();
      });
    }
  }

  /* -- Sticky tab bar offset --
     The title header and the tab bar are both sticky; the tabs need to pin
     exactly below the header. Since the header's height is dynamic (the
     lesson title can wrap to two lines, and it changes with viewport
     width), we measure it and publish it as the --cm-header-h custom
     property that the tabs' `top` reads in CSS. A ResizeObserver keeps it
     correct through title changes (hash navigation) and reflows; a resize
     listener covers browsers without ResizeObserver. */
  function initStickyTabs(){
    var header = document.querySelector('.cm-header');
    var tabsEl = document.getElementById('cmTabs');
    var main = document.querySelector('.course-main');
    if(!header || !main) return;
    function apply(){
      var h = header.offsetHeight;
      var t = tabsEl ? tabsEl.offsetHeight : 0;
      // --cm-header-h: where the tab bar pins (just below the header).
      // --cm-sticky-h: header + tabs combined, used to give the body a
      // min-height so there's always room to scroll the tabs to the top,
      // even for short tabs (otherwise the scroll clamps and switching to a
      // short tab wouldn't bring the tabs up).
      main.style.setProperty('--cm-header-h', h + 'px');
      main.style.setProperty('--cm-sticky-h', (h + t) + 'px');
    }
    apply();
    if(typeof ResizeObserver !== 'undefined'){
      var ro = new ResizeObserver(apply);
      ro.observe(header);
      if(tabsEl) ro.observe(tabsEl);
    }
    window.addEventListener('resize', apply);
  }

  /* -- Desktop collapse handles (left nav + right rail) --
     Lets a reader minimize either side panel to widen the center reading
     column on wide screens. The choice is saved in localStorage and
     restored on every page so it persists as you move between lessons
     (each lesson is its own static page load). The CSS that actually hides
     a column is scoped to wide breakpoints; at narrow widths the panels
     are drawers and these handles are hidden, so toggling is a harmless
     no-op there. */
  function initCollapseToggles(){
    var app = document.querySelector('.course-app');
    if(!app) return;

    var LS_SIDEBAR = 'sdc-sidebar-collapsed';
    var LS_RAIL = 'sdc-rail-collapsed';

    function readFlag(key){
      try{ return localStorage.getItem(key) === '1'; }catch(e){ return false; }
    }
    function writeFlag(key, val){
      try{ localStorage.setItem(key, val ? '1' : '0'); }catch(e){}
    }

    var sideBtn = document.getElementById('courseSidebarCollapse');
    var railBtn = document.getElementById('courseRailCollapse');

    function syncBtn(btn, collapsed, showLabel, hideLabel){
      if(!btn) return;
      var label = collapsed ? showLabel : hideLabel;
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }

    // Restore saved state up front (before .cc-anim is added) so a kept-
    // collapsed panel opens already closed, with no animation flash.
    var sidebarCollapsed = readFlag(LS_SIDEBAR);
    var railCollapsed = readFlag(LS_RAIL);
    app.classList.toggle('sidebar-collapsed', sidebarCollapsed);
    app.classList.toggle('rail-collapsed', railCollapsed);
    syncBtn(sideBtn, sidebarCollapsed, 'Show course navigation', 'Hide course navigation');
    syncBtn(railBtn, railCollapsed, 'Show lesson details', 'Hide lesson details');

    // Enable slide transitions only after the restored state has painted.
    requestAnimationFrame(function(){ app.classList.add('cc-anim'); });

    if(sideBtn){
      sideBtn.addEventListener('click', function(){
        sidebarCollapsed = !app.classList.contains('sidebar-collapsed');
        app.classList.toggle('sidebar-collapsed', sidebarCollapsed);
        writeFlag(LS_SIDEBAR, sidebarCollapsed);
        syncBtn(sideBtn, sidebarCollapsed, 'Show course navigation', 'Hide course navigation');
      });
    }
    if(railBtn){
      railBtn.addEventListener('click', function(){
        railCollapsed = !app.classList.contains('rail-collapsed');
        app.classList.toggle('rail-collapsed', railCollapsed);
        writeFlag(LS_RAIL, railCollapsed);
        syncBtn(railBtn, railCollapsed, 'Show lesson details', 'Hide lesson details');
      });
    }
  }

  /* -- Breadcrumb -- */
  function renderBreadcrumb(mod, lesson){
    var el = document.getElementById("cmBreadcrumb");
    if(!el) return;
    var firstSlug = mod.lessons[0] ? mod.lessons[0].slug : '';
    el.innerHTML =
      '<a href="' + ROOT_PREFIX + 'master-system-design.html">Courses</a>' +
      '<span class="cm-sep">/</span>' +
      '<a href="' + lessonHref(firstSlug) + '">' + nav.courseTitle + '</a>' +
      '<span class="cm-sep">/</span>' +
      '<span class="cm-current-module">' + mod.title + '</span>' +
      '<span class="cm-sep">/</span>' +
      '<span class="cm-current">' + lesson.title + '</span>';
  }

  /* -- Tabs -- */
  var TAB_DEFS = [
    { key: 'overview', label: 'Overview', icon: 'book' },
    { key: 'realWorld', label: 'Real-World', icon: 'globe' },
    { key: 'tradeoffs', label: 'Trade-offs', icon: 'scale' },
    { key: 'handsOn', label: 'Hands-On', icon: 'tool' },
    { key: 'related', label: 'Related', icon: 'link' }
  ];

  var TAB_ICONS = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    scale: '<line x1="12" y1="3" x2="12" y2="21"/><path d="M5 7l-3 8a4 4 0 0 0 8 0z"/><path d="M19 7l-3 8a4 4 0 0 0 8 0z"/><path d="M2 7h20"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    chevLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevRight: '<polyline points="9 18 15 12 9 6"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    hex: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    loop: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    ban: '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>'
  };

  function iconSvg(name, cls){
    return '<svg class="' + (cls||'') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (TAB_ICONS[name]||'') + '</svg>';
  }

  function availableTabs(lessonData){
    // A lesson may declare its own tab set via `customTabs: [{key,label,icon}]`.
    // When present, those become the content tabs (rendered generically), with
    // Hands-On appended if it exists and Related always last. Otherwise fall
    // back to the fixed overview/realWorld/tradeoffs set.
    if(lessonData.customTabs && lessonData.customTabs.length){
      var tabs = lessonData.customTabs.filter(function(t){ return !!(lessonData.tabs && lessonData.tabs[t.key]); });
      if(lessonData.tabs && lessonData.tabs.handsOn) tabs = tabs.concat([{ key: 'handsOn', label: 'Hands-On', icon: 'tool' }]);
      tabs = tabs.concat([{ key: 'related', label: 'Related', icon: 'link' }]);
      return tabs;
    }
    return TAB_DEFS.filter(function(t){
      if(t.key === 'related') return true; // always show related/bridge tab
      return !!lessonData.tabs[t.key];
    });
  }

  /* When switching tabs, bring the (sticky) tab bar to the top so the new
     tab's content starts right at the tabs, with the breadcrumb/title/
     connects area scrolled out of view. tabsEl.offsetTop is its natural
     layout offset inside the scroll container (.course-main is positioned),
     unaffected by its sticky shift; subtracting the header height lands the
     scroll exactly where the header + tabs pin together. */
  function scrollTabsIntoView(){
    var main = document.querySelector('.course-main');
    var tabsEl = document.getElementById('cmTabs');
    var header = document.querySelector('.cm-header');
    if(!main || !tabsEl) return;
    var headerH = header ? header.offsetHeight : 0;
    var target = Math.max(0, tabsEl.offsetTop - headerH);
    main.scrollTo({ top: target, behavior: 'smooth' });
  }

  function renderTabs(lessonData){
    var tabsEl = document.getElementById("cmTabs");
    if(!tabsEl) return;
    var tabs = availableTabs(lessonData);
    var html = '';
    tabs.forEach(function(t, i){
      html += '<button class="cm-tab' + (i===0 ? ' cm-tab-active' : '') + '" data-tab="' + t.key + '">' + iconSvg(t.icon) + t.label + '</button>';
    });
    tabsEl.innerHTML = html;
    tabsEl.querySelectorAll('.cm-tab').forEach(function(btn){
      btn.addEventListener('click', function(){
        tabsEl.querySelectorAll('.cm-tab').forEach(function(b){ b.classList.remove('cm-tab-active'); });
        btn.classList.add('cm-tab-active');
        renderTabBody(lessonData, btn.getAttribute('data-tab'));
        scrollTabsIntoView();
      });
    });
    renderTabBody(lessonData, tabs[0] ? tabs[0].key : 'overview');
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>]/g, function(c){
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }

  // A copy-paste code block for hands-on labs: escaped content plus a Copy
  // button (wired in wireCopyButtons). Optional language shows as a label.
  function renderCodeBlock(code, lang){
    var label = lang ? '<span class="ho-code-lang">' + escapeHtml(lang) + '</span>' : '';
    return '<div class="ho-code">'
      + '<button class="ho-copy" type="button" aria-label="Copy to clipboard">Copy</button>'
      + label
      + '<pre><code>' + escapeHtml(code) + '</code></pre>'
      + '</div>';
  }

  function renderCardGrid(cards){
    if(!cards || !cards.length) return '';
    var html = '<div class="cc-card-grid">';
    cards.forEach(function(c){
      html += '<div class="cc-card"><div class="cc-card-icon cc-' + c.color + '">' + c.icon + '</div>'
        + '<h4>' + c.title + '</h4><p>' + c.body + '</p></div>';
    });
    html += '</div>';
    return html;
  }

  function renderTable(table){
    if(!table) return '';
    var html = '<div class="cc-table-wrap"><table class="cc-table"><thead><tr>';
    table.headers.forEach(function(h){ html += '<th>' + h + '</th>'; });
    html += '</tr></thead><tbody>';
    table.rows.forEach(function(row){
      html += '<tr>';
      row.forEach(function(cell){ html += '<td>' + cell + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  // Render a list of tables (schema allows `tables: [ {headers,rows}, ... ]`
  // on any tab, in addition to the single `table` field, so lessons that
  // carry several reference tables do not lose any of them).
  function renderTables(tables){
    if(!tables || !tables.length) return '';
    var html = '';
    tables.forEach(function(t){ html += renderTable(t); });
    return html;
  }

  // Resolve an image path. Lesson data stores paths relative to the repo
  // root (e.g. "images/foo/bar.png"); prepend ROOT_PREFIX so it works both
  // as a static lesson page (../../) and inside the SPA shell (../). Absolute
  // URLs (http/https) and already-relative "../" paths are left untouched.
  function resolveAsset(src){
    if(!src) return '';
    if(/^(https?:)?\/\//.test(src) || src.indexOf('../') === 0) return src;
    return ROOT_PREFIX + src.replace(/^\/+/, '');
  }

  // Render images (schema: `images: [ {src, alt, caption} ]` on any tab).
  // One image renders as a single figure card; two or more render as a
  // carousel with prev/next arrows and clickable dots so any image is one
  // tap away. Wired up by wireCarousels() after the tab body is injected.
  function renderImageSeries(images){
    if(!images || !images.length) return '';
    var imgs = images.filter(function(im){ return im && im.src; });
    if(!imgs.length) return '';

    if(imgs.length === 1){
      var im0 = imgs[0];
      var f = '<div class="cc-figs"><figure class="cc-fig">';
      f += '<div class="cc-imgwrap">';
      f += '<img loading="lazy" src="' + resolveAsset(im0.src) + '" alt="' + (im0.alt || '') + '">';
      f += '<button class="cc-fig-expand" type="button" aria-label="Expand image">' + iconSvg('expand') + '</button>';
      f += '</div>';
      if(im0.caption) f += '<figcaption>' + im0.caption + '</figcaption>';
      f += '</figure></div>';
      return f;
    }

    var html = '<div class="cc-carousel" data-idx="0">';
    html += '<div class="cc-car-viewport">';
    html += '<div class="cc-car-track">';
    imgs.forEach(function(im){
      html += '<figure class="cc-slide">';
      html += '<div class="cc-imgwrap">';
      html += '<img loading="lazy" src="' + resolveAsset(im.src) + '" alt="' + (im.alt || '') + '">';
      html += '</div>';
      if(im.caption) html += '<figcaption>' + im.caption + '</figcaption>';
      html += '</figure>';
    });
    html += '</div>'; // track
    html += '<button class="cc-car-btn cc-car-prev" type="button" aria-label="Previous image">' + iconSvg('chevLeft') + '</button>';
    html += '<button class="cc-car-btn cc-car-next" type="button" aria-label="Next image">' + iconSvg('chevRight') + '</button>';
    html += '<button class="cc-car-btn cc-car-expand" type="button" aria-label="Expand image">' + iconSvg('expand') + '</button>';
    html += '<div class="cc-car-count"><span class="cc-car-cur">1</span> / ' + imgs.length + '</div>';
    html += '</div>'; // viewport
    html += '<div class="cc-car-dots">';
    imgs.forEach(function(im, i){
      html += '<button class="cc-dot' + (i === 0 ? ' cc-dot-active' : '') + '" type="button" data-i="' + i + '" aria-label="Go to image ' + (i + 1) + '"></button>';
    });
    html += '</div>';
    html += '</div>'; // carousel
    return html;
  }

  // Collect the images inside a scope element as [{src, alt, caption}] so the
  // lightbox can reuse whatever is already rendered (carousel or single figure).
  function collectImages(scope){
    var out = [];
    scope.querySelectorAll('img').forEach(function(img){
      var fig = img.closest('figure');
      var fc = fig ? fig.querySelector('figcaption') : null;
      out.push({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', caption: fc ? fc.textContent : '' });
    });
    return out;
  }

  // A single, lazily-built fullscreen lightbox with zoom (buttons, wheel,
  // click), drag-to-pan, prev/next, and keyboard shortcuts. Reused across the
  // whole app, created once.
  var LB = null;
  function ensureLightbox(){
    if(LB) return LB;
    var el = document.createElement('div');
    el.className = 'cc-lb';
    el.setAttribute('hidden', '');
    el.innerHTML =
      '<div class="cc-lb-backdrop"></div>' +
      '<div class="cc-lb-count"></div>' +
      '<button class="cc-lb-ctrl cc-lb-close" type="button" aria-label="Close">' + iconSvg('close') + '</button>' +
      '<button class="cc-lb-nav cc-lb-prev" type="button" aria-label="Previous">' + iconSvg('chevLeft') + '</button>' +
      '<button class="cc-lb-nav cc-lb-next" type="button" aria-label="Next">' + iconSvg('chevRight') + '</button>' +
      '<div class="cc-lb-stage"><img class="cc-lb-img" alt=""></div>' +
      '<div class="cc-lb-caption"></div>' +
      '<div class="cc-lb-bar">' +
        '<button class="cc-lb-ctrl" type="button" data-act="out" aria-label="Zoom out">' + iconSvg('minus') + '</button>' +
        '<button class="cc-lb-ctrl cc-lb-reset" type="button" data-act="reset">100%</button>' +
        '<button class="cc-lb-ctrl" type="button" data-act="in" aria-label="Zoom in">' + iconSvg('plus') + '</button>' +
      '</div>';
    document.body.appendChild(el);

    var img = el.querySelector('.cc-lb-img');
    var stage = el.querySelector('.cc-lb-stage');
    var capEl = el.querySelector('.cc-lb-caption');
    var countEl = el.querySelector('.cc-lb-count');
    var resetBtn = el.querySelector('.cc-lb-reset');
    var s = { list: [], idx: 0, scale: 1, x: 0, y: 0, drag: false, sx: 0, sy: 0 };

    function apply(){
      img.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) scale(' + s.scale + ')';
      resetBtn.textContent = Math.round(s.scale * 100) + '%';
      img.style.cursor = s.scale > 1 ? 'grab' : 'zoom-in';
    }
    function zoom(d){ s.scale = Math.min(5, Math.max(1, +(s.scale + d).toFixed(2))); if(s.scale === 1){ s.x = 0; s.y = 0; } apply(); }
    function load(){
      var it = s.list[s.idx]; if(!it) return;
      img.src = it.src; img.alt = it.alt || '';
      capEl.textContent = it.caption || '';
      countEl.textContent = (s.idx + 1) + ' / ' + s.list.length;
      s.scale = 1; s.x = 0; s.y = 0; apply();
      var multi = s.list.length > 1;
      el.querySelector('.cc-lb-prev').style.display = multi ? '' : 'none';
      el.querySelector('.cc-lb-next').style.display = multi ? '' : 'none';
    }
    function nav(d){ if(!s.list.length) return; s.idx = (s.idx + d + s.list.length) % s.list.length; load(); }
    function close(){ el.setAttribute('hidden', ''); document.body.style.overflow = ''; }

    el.querySelector('.cc-lb-backdrop').addEventListener('click', close);
    el.querySelector('.cc-lb-close').addEventListener('click', close);
    el.querySelector('.cc-lb-prev').addEventListener('click', function(){ nav(-1); });
    el.querySelector('.cc-lb-next').addEventListener('click', function(){ nav(1); });
    el.querySelector('[data-act=in]').addEventListener('click', function(){ zoom(0.5); });
    el.querySelector('[data-act=out]').addEventListener('click', function(){ zoom(-0.5); });
    resetBtn.addEventListener('click', function(){ s.scale = 1; s.x = 0; s.y = 0; apply(); });
    stage.addEventListener('wheel', function(e){ e.preventDefault(); zoom(e.deltaY < 0 ? 0.3 : -0.3); }, { passive: false });
    img.addEventListener('click', function(e){ e.stopPropagation(); if(s.scale === 1){ zoom(1); } });
    img.addEventListener('pointerdown', function(e){ if(s.scale <= 1) return; s.drag = true; s.sx = e.clientX - s.x; s.sy = e.clientY - s.y; img.setPointerCapture(e.pointerId); img.style.cursor = 'grabbing'; });
    img.addEventListener('pointermove', function(e){ if(!s.drag) return; s.x = e.clientX - s.sx; s.y = e.clientY - s.sy; apply(); });
    img.addEventListener('pointerup', function(){ s.drag = false; if(s.scale > 1) img.style.cursor = 'grab'; });
    document.addEventListener('keydown', function(e){
      if(el.hasAttribute('hidden')) return;
      if(e.key === 'Escape') close();
      else if(e.key === 'ArrowLeft') nav(-1);
      else if(e.key === 'ArrowRight') nav(1);
      else if(e.key === '+' || e.key === '=') zoom(0.5);
      else if(e.key === '-' || e.key === '_') zoom(-0.5);
    });

    LB = { open: function(list, idx){ s.list = list || []; s.idx = idx || 0; el.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; load(); } };
    return LB;
  }
  function openLightbox(list, idx){ ensureLightbox().open(list, idx); }

  // Wire expand buttons and image clicks (carousels and single figures) to
  // open the lightbox at the right image.
  function wireImageZoom(){
    document.querySelectorAll('.cc-carousel').forEach(function(car){
      var list = collectImages(car);
      var exp = car.querySelector('.cc-car-expand');
      if(exp) exp.addEventListener('click', function(e){ e.stopPropagation(); openLightbox(list, parseInt(car.getAttribute('data-idx'), 10) || 0); });
      car.querySelectorAll('.cc-slide img').forEach(function(im, i){
        im.style.cursor = 'zoom-in';
        im.addEventListener('click', function(){ openLightbox(list, i); });
      });
    });
    document.querySelectorAll('.cc-fig').forEach(function(fig){
      var list = collectImages(fig);
      var exp = fig.querySelector('.cc-fig-expand');
      if(exp) exp.addEventListener('click', function(e){ e.stopPropagation(); openLightbox(list, 0); });
      var im = fig.querySelector('img');
      if(im){ im.style.cursor = 'zoom-in'; im.addEventListener('click', function(){ openLightbox(list, 0); }); }
    });
  }

  // Wire prev/next/dot navigation and keyboard arrows for every carousel in
  // the freshly rendered tab body.
  function wireCarousels(){
    document.querySelectorAll('.cc-carousel').forEach(function(car){
      var track = car.querySelector('.cc-car-track');
      var slides = car.querySelectorAll('.cc-slide');
      var dots = car.querySelectorAll('.cc-dot');
      var cur = car.querySelector('.cc-car-cur');
      var n = slides.length;
      if(!track || !n) return;
      function go(i){
        i = (i % n + n) % n;
        car.setAttribute('data-idx', i);
        track.style.transform = 'translateX(-' + (i * 100) + '%)';
        dots.forEach(function(d, di){ d.classList.toggle('cc-dot-active', di === i); });
        if(cur) cur.textContent = (i + 1);
      }
      function idx(){ return parseInt(car.getAttribute('data-idx'), 10) || 0; }
      var prev = car.querySelector('.cc-car-prev');
      var next = car.querySelector('.cc-car-next');
      if(prev) prev.addEventListener('click', function(){ go(idx() - 1); });
      if(next) next.addEventListener('click', function(){ go(idx() + 1); });
      dots.forEach(function(d){ d.addEventListener('click', function(){ go(parseInt(d.getAttribute('data-i'), 10)); }); });
      car.setAttribute('tabindex', '0');
      car.addEventListener('keydown', function(e){
        if(e.key === 'ArrowLeft'){ go(idx() - 1); }
        else if(e.key === 'ArrowRight'){ go(idx() + 1); }
      });
    });
  }

  function renderCallouts(callouts){
    if(!callouts || !callouts.length) return '';
    var html = '';
    callouts.forEach(function(c){
      var color = c.color || 'blue';
      html += '<div class="cc-callout cc-callout-' + color + '">';
      if(c.label) html += '<span class="cc-callout-label">' + c.label + '</span> ';
      html += c.body;
      html += '</div>';
    });
    return html;
  }

  function renderPoints(points){
    if(!points || !points.length) return '';
    var html = '<div class="cc-points">';
    points.forEach(function(pt){
      html += '<div class="cc-point">';
      if(pt.label) html += '<h5>' + pt.label + '</h5>';
      html += '<p>' + pt.body + '</p>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  /* Diagram block: wraps a ported SVG diagram in a scrollable frame (both
     axes, since these diagrams have a fixed internal layout that shouldn't
     be squeezed to fit) plus the shared DP Engine's expand/zoom/pan modal
     (same "+/-/reset zoom" controls already used across the cheat sheet).
     dp-engine.js's dpInit() only auto-wraps ".T svg" on page load, which
     the course app's SPA routing bypasses entirely, so this builds the
     same .dp-panel/.dp-ctrls markup by hand and calls the engine's globals
     directly instead of relying on its auto-discovery pass. */
  function renderDiagram(diagram){
    if(!diagram || !diagram.svg) return '';
    var html = '<div class="cc-diagram">';
    // .dp-ctrls sits as a sibling of the scrolling content, not inside the
    // .dp-panel that scrolls, so the expand button stays pinned to the
    // frame's top-right corner no matter how far the diagram is scrolled
    // in either direction.
    html += '<div class="cc-diagram-frame">';
    html += '<div class="cc-diagram-scroll"><div class="dp-panel cc-dp-panel">' + diagram.svg + '</div></div>';
    html += '<div class="dp-ctrls cc-diagram-ctrls"></div>';
    html += '</div>';
    if(diagram.caption) html += '<p class="cc-diagram-caption">' + diagram.caption + '</p>';
    html += '</div>';
    return html;
  }

  // Wrap the shared DP Engine's dpZoom so "Reset zoom" inside the modal
  // returns a course diagram to natural (1x) scale instead of the shared
  // engine's hardcoded 5x default. Only intercepts f===0 (the reset
  // button's call) while the open panel is one of this app's diagrams
  // (.cc-dp-panel); every other page/diagram using dp-engine.js keeps its
  // original reset-to-5x behavior untouched.
  if(window.dpZoom && !window.dpZoom._courseWrapped){
    var originalDpZoom = window.dpZoom;
    window.dpZoom = function(f){
      if(f === 0){
        var openPanel = document.querySelector('#dp-zoom-inner .cc-dp-panel');
        if(openPanel){ originalDpZoom(0); originalDpZoom(0.2); return; }
      }
      originalDpZoom(f);
    };
    window.dpZoom._courseWrapped = true;
  }

  function wireDiagramControls(){
    var frames = document.querySelectorAll('#cmBody .cc-diagram-frame');
    Array.prototype.forEach.call(frames, function(frame){
      var ctrls = frame.querySelector('.cc-diagram-ctrls');
      var panel = frame.querySelector('.cc-dp-panel');
      if(!ctrls || !panel || ctrls.dataset.wired) return;
      ctrls.dataset.wired = '1';
      ctrls.innerHTML = '<button class="dp-ctrl dp-expand" title="Expand diagram">\u26F6</button>';
      ctrls.querySelector('.dp-expand').addEventListener('click', function(){
        if(!window.dpExpand) return;
        window.dpExpand(panel);
        // The shared DP Engine (js/dp-engine.js) opens every diagram at a
        // hardcoded 5x zoom (internal dpScale=5), tuned for the cheat
        // sheet's much smaller, fine-print diagrams. This app's diagrams
        // are already sized to read clearly at 1x, so bring it back down
        // to natural scale via the engine's own dpZoom(f) (a *5 -> *0.2
        // multiplier lands exactly on 1x) rather than only overwriting
        // the transform style, so the engine's internal zoom state stays
        // correct for any +/-/reset click made after this. Doesn't touch
        // the shared engine's default, which the cheat sheet's own
        // diagrams still rely on.
        if(window.dpZoom) window.dpZoom(0.2);
      });
    });
  }

  function renderTabBody(lessonData, tabKey){
    var body = document.getElementById("cmBody");
    if(!body) return;
    var html = '';

    if(tabKey === 'overview'){
      var o = lessonData.tabs.overview;
      html += '<h3 class="cc-heading">' + iconSvg('book') + o.heading + '</h3>';
      if(o.intro) html += '<p class="cc-intro">' + o.intro + '</p>';
      html += renderImageSeries(o.images);
      html += renderDiagram(o.diagram);
      html += renderCardGrid(o.cards);
      html += renderTable(o.table);
      html += renderTables(o.tables);
      html += renderCallouts(o.callouts);
    } else if(tabKey === 'realWorld'){
      var rw = lessonData.tabs.realWorld;
      html += '<h3 class="cc-heading">' + iconSvg('globe') + rw.heading + '</h3>';
      if(rw.intro) html += '<p class="cc-intro">' + rw.intro + '</p>';
      if(rw.points && rw.points.length){
        html += renderPoints(rw.points);
      } else if(rw.body){
        html += '<p class="cc-intro">' + rw.body + '</p>';
      }
      html += renderTable(rw.table);
      html += renderTables(rw.tables);
      html += renderCallouts(rw.callouts);
    } else if(tabKey === 'tradeoffs'){
      var to = lessonData.tabs.tradeoffs;
      html += '<h3 class="cc-heading">' + iconSvg('scale') + to.heading + '</h3>';
      if(to.intro) html += '<p class="cc-intro">' + to.intro + '</p>';
      if(to.points && to.points.length){
        html += renderPoints(to.points);
      } else if(to.body){
        html += '<p class="cc-intro">' + to.body + '</p>';
      }
      html += renderTable(to.table);
      html += renderTables(to.tables);
      html += renderCallouts(to.callouts);
    } else if(tabKey === 'handsOn'){
      var h = lessonData.tabs.handsOn;
      html += '<h3 class="cc-heading">' + iconSvg('tool') + 'Hands-On Lab</h3>';
      if(h.steps && h.steps.length){
        // Structured, copy-paste lab: a one-line goal, a one-line stack, then
        // numbered steps each with an optional runnable code block.
        if(h.goal) html += '<p class="cc-intro">' + h.goal + '</p>';
        if(h.stack) html += '<div class="ho-stack">' + iconSvg('layers') + '<span><strong>Stack:</strong> ' + h.stack + '</span></div>';
        html += '<ol class="ho-steps">';
        h.steps.forEach(function(st){
          html += '<li class="ho-step">';
          html += '<div class="ho-step-head"><span class="ho-step-n"></span><span class="ho-step-title">' + (st.title || '') + '</span></div>';
          if(st.body) html += '<p class="ho-step-body">' + st.body + '</p>';
          if(st.code) html += renderCodeBlock(st.code, st.lang);
          html += '</li>';
        });
        html += '</ol>';
        if(h.observe) html += '<div class="ho-callout ho-observe"><h4>' + iconSvg('star') + 'What to look for</h4><p>' + h.observe + '</p></div>';
        if(h.stretch) html += '<div class="ho-callout ho-stretch"><h4>' + iconSvg('plus') + 'Stretch goal</h4><p>' + h.stretch + '</p></div>';
      } else {
        // Legacy prose format (kept for any lesson not yet migrated).
        html += '<p class="cc-intro">Reproduce this lesson\u2019s problem yourself, or read through to understand exactly how you would.</p>';
        html += '<div class="ho-block"><h4><span class="ho-icon">1</span>Prerequisites</h4><p>' + h.prerequisites + '</p></div>';
        html += '<div class="ho-block"><h4><span class="ho-icon">2</span>Setup</h4><p>' + h.setup + '</p></div>';
        html += '<div class="ho-block"><h4><span class="ho-icon">3</span>Simulate the Scenario</h4><p>' + h.simulate + '</p></div>';
        html += '<div class="ho-block"><h4><span class="ho-icon">4</span>What to Observe</h4><p>' + h.observe + '</p></div>';
        html += '<div class="ho-block"><h4><span class="ho-icon">\u2605</span>Stretch Goal</h4><p>' + h.stretch + '</p></div>';
      }
    } else if(tabKey === 'related'){
      html += '<h3 class="cc-heading">' + iconSvg('link') + 'Related Lessons</h3>';
      if(lessonData.related && lessonData.related.length){
        html += '<div class="cc-related-box">' + iconSvg('link') + '<div>';
        lessonData.related.forEach(function(slug, i){
          var info = findLessonBySlug(slug);
          if(info){
            html += (i>0?', ':'') + '<a href="' + lessonHref(slug) + '">' + info.lesson.title + '</a>';
          }
        });
        html += '</div></div>';
      } else {
        html += '<p class="cc-intro">No directly related lessons. This one stands on its own.</p>';
      }
    } else if(lessonData.tabs && lessonData.tabs[tabKey]){
      // Generic content section for a lesson-defined custom tab. Renders the
      // same building blocks as overview (heading, intro, diagram, cards,
      // tables, points, callouts) in a comparison-friendly order.
      var sec = lessonData.tabs[tabKey];
      var secIcon = 'book';
      if(lessonData.customTabs){
        lessonData.customTabs.forEach(function(t){ if(t.key === tabKey && t.icon) secIcon = t.icon; });
      }
      html += '<h3 class="cc-heading">' + iconSvg(secIcon) + (sec.heading || '') + '</h3>';
      if(sec.intro) html += '<p class="cc-intro">' + sec.intro + '</p>';
      html += renderImageSeries(sec.images);
      html += renderDiagram(sec.diagram);
      html += renderCardGrid(sec.cards);
      html += renderTable(sec.table);
      html += renderTables(sec.tables);
      if(sec.points && sec.points.length) html += renderPoints(sec.points);
      html += renderCallouts(sec.callouts);
    }

    body.innerHTML = linkifyLessons(html);
    wireDiagramControls();
    wireCarousels();
    wireImageZoom();
    wireCopyButtons();
  }

  // Copy-to-clipboard for hands-on code blocks. Reads the code element's
  // textContent (browser has already un-escaped entities), with a legacy
  // execCommand fallback for older/non-secure contexts.
  function wireCopyButtons(){
    document.querySelectorAll('.ho-copy').forEach(function(btn){
      btn.addEventListener('click', function(){
        var code = btn.parentElement.querySelector('code');
        var text = code ? code.textContent : '';
        var done = function(){ btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = 'Copy'; }, 1500); };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(done).catch(function(){ legacyCopy(code, done); });
        } else {
          legacyCopy(code, done);
        }
      });
    });
  }
  function legacyCopy(code, done){
    if(!code) return;
    try{
      var r = document.createRange(); r.selectNodeContents(code);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      document.execCommand('copy'); sel.removeAllRanges(); done();
    }catch(e){}
  }

  /* -- Right rail -- */
  function renderRail(mod, lesson, lessonData){
    var rail = document.getElementById("courseRail");
    if(!rail) return;

    var idx = mod.lessons.findIndex(function(l){ return l.slug === lesson.slug; });
    var next = mod.lessons[idx+1];
    var prev = mod.lessons[idx-1];

    var html = '';

    // Quick Links
    html += '<div class="cr-box"><h5><span class="cr-ic cr-ic-purple">\u2192</span>Quick Links</h5>';
    if(next){
      html += '<a class="cr-link" href="' + lessonHref(next.slug) + '"><span><span class="cr-link-title">' + next.num + ' ' + next.title + '</span><span class="cr-link-sub">Next Lesson</span></span><span class="cr-link-arrow">\u203a</span></a>';
    }
    if(prev){
      html += '<a class="cr-link" href="' + lessonHref(prev.slug) + '"><span><span class="cr-link-title">' + prev.num + ' ' + prev.title + '</span><span class="cr-link-sub">Previous Lesson</span></span><span class="cr-link-arrow">\u2039</span></a>';
    }
    html += '</div>';

    // Live-cohort promo: sell the live courses. Links resolve to the site
    // root via ROOT_PREFIX (../../ from a static lesson page, ../ from the
    // SPA shell), same as the "back to courses" link.
    html += '<div class="cr-box cr-promo">'
      + '<span class="cr-promo-badge">\uD83D\uDD34 Live Cohort</span>'
      + '<h5 class="cr-promo-title">Learn this live, hands-on</h5>'
      + '<p class="cr-promo-text">These lessons are your foundation. Go further in a small live cohort: build real systems, weekly labs, and mentor feedback.</p>'
      + '<a class="cr-promo-btn" href="' + ROOT_PREFIX + 'master-system-design.html">Master Advanced System Design \u203a</a>'
      + '<a class="cr-promo-btn cr-promo-btn-alt" href="' + ROOT_PREFIX + 'master-ai-engineering.html">Master AI Engineering \u203a</a>'
      + '</div>';

    // What's next (bridge-out) - lives once in the rail, not repeated
    // across tabs in the main reading column.
    if(lessonData.bridgeOut){
      html += '<div class="cr-box cr-bridge"><h5><span class="cr-ic cr-ic-brand">' + iconSvg('link') + '</span>What\u2019s Next</h5>'
        + '<p>' + lessonData.bridgeOut + '</p></div>';
    }

    // Related topics
    if(lessonData.related && lessonData.related.length){
      html += '<div class="cr-box"><h5><span class="cr-ic cr-ic-blue">' + iconSvg('hex') + '</span>Related Topics</h5><div class="cr-topics">';
      lessonData.related.forEach(function(slug){
        var info = findLessonBySlug(slug);
        if(info) html += '<a class="cr-topic-chip" href="' + lessonHref(slug) + '">' + info.lesson.title + '</a>';
      });
      html += '</div></div>';
    }

    // Key takeaways
    if(lessonData.keyTakeaways && lessonData.keyTakeaways.length){
      html += '<div class="cr-box"><h5><span class="cr-ic cr-ic-green">' + iconSvg('star') + '</span>Key Takeaways</h5>';
      lessonData.keyTakeaways.forEach(function(t){
        html += '<div class="cr-takeaway">' + iconSvg('check') + '<span>' + t + '</span></div>';
      });
      html += '</div>';
    }

    // Pro tip
    if(lessonData.proTip){
      html += '<div class="cr-box cr-protip"><h5><span class="cr-ic cr-ic-purple">' + iconSvg('star') + '</span>Pro Tip</h5><p>' + lessonData.proTip + '</p></div>';
    }

    rail.innerHTML = html;

    // Any in-rail navigation link (Quick Links, Related Topics, promo CTAs)
    // should close both mobile drawers too, same as sidebar lesson links.
    // Applies whether the link is a real static-page href or a legacy "#/" hash.
    rail.querySelectorAll('.cr-link, .cr-topic-chip, .cr-promo-btn').forEach(function(a){
      a.addEventListener('click', function(){
        closeMobileSidebar();
        closeRailDrawer();
      });
    });
  }

  /* -- Placeholder for un-built lessons -- */
  function renderPlaceholder(mod, lesson){
    renderBreadcrumb(mod, lesson);
    document.getElementById("cmTitle").textContent = lesson.title;
    document.getElementById("cmModuleBadge").textContent = "Lesson " + lesson.num;
    document.getElementById("cmModuleBadge2").textContent = mod.title;
    document.getElementById("cmConnects").style.display = "none";
    document.getElementById("cmTabs").innerHTML = "";
    document.getElementById("cmBody").innerHTML =
      '<div class="cm-placeholder">'
      + iconSvg('clock')
      + '<h3>Coming soon</h3>'
      + '<p>Module ' + mod.num + ' (' + mod.title + ') content is being built out. Module 1: Foundations is fully live, try any lesson there.</p>'
      + '</div>';
    document.getElementById("courseRail").innerHTML = '';
  }

  /* -- "Derived from" banner --
     Replaces the old plain "Recap" label with a clickable pointer back to
     the specific lesson this one builds on (the previous lesson in the
     module's sequence), so the connection is something you can act on,
     not just read past. Falls back to a plain "Where this starts" framing
     for a module's first lesson, which has no previous lesson to link. */
  function renderConnects(mod, lesson, lessonData){
    var connectsEl = document.getElementById("cmConnects");
    if(!connectsEl) return;
    connectsEl.style.display = "flex";

    var idx = mod.lessons.findIndex(function(l){ return l.slug === lesson.slug; });
    var prev = mod.lessons[idx-1];

    var derivedEl = document.getElementById("cmConnectsDerived");
    if(prev){
      derivedEl.innerHTML = '<span class="cm-connects-kicker">' + iconSvg('link') + 'Derived from</span>'
        + '<a class="cm-connects-source" href="' + lessonHref(prev.slug) + '">' + prev.num + ' ' + escapeHtml(prev.title) + '</a>';
    } else {
      derivedEl.innerHTML = '<span class="cm-connects-kicker">' + iconSvg('star') + 'Where this module starts</span>';
    }

    connectsEl.querySelector(".cm-connects-text").textContent = lessonData.connectsFrom;
  }

  /* -- Main render -- */
  function renderLesson(slug){
    var info = findLessonBySlug(slug);
    if(!info){
      // default to the first lesson of module 1
      slug = nav.modules[0].lessons[0].slug;
      info = findLessonBySlug(slug);
    }
    var mod = info.module, lesson = info.lesson;
    var lessonData = content[slug];
    ACTIVE_SLUG = slug;

    renderSidebar(slug);

    if(!lessonData){
      renderPlaceholder(mod, lesson);
      return;
    }

    renderBreadcrumb(mod, lesson);
    document.getElementById("cmTitle").textContent = lessonData.title;
    document.getElementById("cmModuleBadge").textContent = "Lesson " + lessonData.num;
    document.getElementById("cmModuleBadge2").textContent = mod.title;

    renderConnects(mod, lesson, lessonData);

    renderTabs(lessonData);
    renderRail(mod, lesson, lessonData);

    document.title = lessonData.num + " " + lessonData.title + " - System Design - HelloSDE";
    document.querySelector(".course-main").scrollTop = 0;
  }

  function currentSlugFromHash(){
    var h = location.hash || '';
    var m = h.match(/^#\/(.+)$/);
    return m ? m[1] : null;
  }

  function boot(){
    initMobileToggle();
    initCollapseToggles();
    // Static lesson pages set window.CURRENT_LESSON_SLUG in an inline
    // script before course.js loads, so the lesson to render is known
    // upfront with no routing needed. The old hash-router
    // (system-design-course/index.html) still works as a fallback for any
    // bookmarked "#/slug" links.
    var slug = window.CURRENT_LESSON_SLUG || currentSlugFromHash();
    renderLesson(slug);
    initStickyTabs();
    if(!window.CURRENT_LESSON_SLUG){
      window.addEventListener('hashchange', function(){
        renderLesson(currentSlugFromHash());
      });
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
