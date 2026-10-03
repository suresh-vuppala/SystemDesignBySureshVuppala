/* === Shared Site Header - HelloSDE.com === */

/* Theme init, runs before any paint of the injected header to avoid FOUC.
   Order: saved preference, then OS preference, then light default. */
(function initTheme(){
  try{
    var saved = localStorage.getItem('hsde-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }catch(e){
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

(function(){
  var path = location.pathname;
  var page = path.split('/').pop() || 'index.html';
  var parts = path.split('/').filter(function(p){ return p !== ''; });
  var dir = parts.length > 1 ? parts[parts.length - 2] : '';

  // Detect which section we're in (handles subfolders)
  var activeSection = 'home';
  var inCheatsheet = path.indexOf('system-design-cheatsheet') !== -1;
  var inRealtime = path.indexOf('realtime-system-design-problems') !== -1;
  var inCourse = path.indexOf('/system-design-course/') !== -1 || dir === 'system-design-course';
  if(inCheatsheet) activeSection = 'concepts';
  if(inRealtime) activeSection = 'realtime';
  if(inCourse) activeSection = 'course';
  if(page === 'engineering-blogs.html') activeSection = 'blogs';
  if(page === 'master-system-design.html' || page === 'master-ai-engineering.html' || page === 'master-dsa.html') activeSection = 'courses';

  // Calculate prefix to reach the project root. Course lesson pages live
  // two levels deep (system-design-course/<module>/<lesson>.html), one
  // level deeper than the course landing page or the other sections, so
  // depth is measured directly from the path segment count rather than
  // just the immediate parent folder name.
  var prefix = '';
  if(dir === 'system-design-cheatsheet') prefix = '../';
  else if(dir === 'realtime-system-design-problems') prefix = '../';
  else if(inRealtime) prefix = '../../';
  else if(inCheatsheet) prefix = '../';
  else if(inCourse){
    // parts = [...,'system-design-course', maybe <module>, page]
    var courseIdx = parts.indexOf('system-design-course');
    var depth = parts.length - 1 - courseIdx; // segments after system-design-course/, excluding the page itself
    prefix = new Array(depth + 1).join('../');
  }

  var links = [
    {href: prefix+'system-design-course/index.html', label:'System Design', id:'course'},
    {href: prefix+'system-design-cheatsheet/engineering-blogs.html', label:'Blogs', id:'blogs'}
  ];

  var courses = [
    {href: prefix+'master-system-design.html', label:'Master Advanced System Design', desc:'8-week live weekend cohort'},
    {href: prefix+'master-ai-engineering.html', label:'Master AI Engineering', desc:'8-week live RAG & Agents cohort'},
    {href: prefix+'master-dsa.html', label:'Master Advanced Data Structures and Algorithms', desc:'14-week live coding & DSA cohort'}
  ];

  var navItems = links.map(function(l){
    return '<a href="'+l.href+'" class="sh-link'+(activeSection===l.id?' sh-active':'')+'">'+l.label+'</a>';
  }).join('');

  var courseItems = courses.map(function(c){
    return '<a href="'+c.href+'" class="sh-dd-item">'
      + '<span class="sh-dd-title">'+c.label+'</span>'
      + '<span class="sh-dd-desc">'+c.desc+'</span></a>';
  }).join('');
  var coursesDropdown = '<div class="sh-dropdown'+(activeSection==='courses'?' sh-dd-active':'')+'">'
    + '<button class="sh-link sh-dd-toggle'+(activeSection==='courses'?' sh-active':'')+'" aria-haspopup="true" aria-expanded="false">'
    + '<span class="sh-livedot" aria-hidden="true"></span>Live Courses <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sh-dd-caret"><polyline points="6 9 12 15 18 9"/></svg>'
    + '</button>'
    + '<div class="sh-dropdown-menu">'+courseItems+'</div>'
    + '</div>';
  navItems = navItems + coursesDropdown;

  // Brand logo: the waving-hand emoji (with skin tone), echoing the site
  // name "HelloSDE". The wave is a CSS rotation animation on the wrapping
  // span, pivoted near the wrist, looping continuously.
  var logoSvg = '<span class="sh-logo-wave" role="img" aria-label="Waving hand">\uD83D\uDC4B\uD83C\uDFFB</span>';

  var themeBtn = '<button class="sh-theme" id="sh-theme-toggle" aria-label="Toggle theme" title="Toggle theme">'
    + '<svg class="sh-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    + '<svg class="sh-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
    + '</button>';

  // Brand wordmark fonts: Doto (dotted 8-bit terminal face) for the "SDE"
  // mark, and Caveat (handwritten script) for the "Hello" part, matching
  // the logo reference. Injected here (rather than in every page's <head>)
  // since this header is itself injected site-wide from this one script.
  if(!document.getElementById('hsde-doto-font')){
    var dotoLink = document.createElement('link');
    dotoLink.id = 'hsde-doto-font';
    dotoLink.rel = 'stylesheet';
    dotoLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Doto:ROND,wght@0,900&display=swap';
    document.head.appendChild(dotoLink);
  }

  var html = '<header class="sh">'
    + '<a class="sh-brand" href="'+prefix+'index.html">'
    + '<span class="sh-brand-word">'
    +   '<span class="sh-brand-underlined">'
    +     '<span class="sh-brand-hello">Hello</span>'
    +     '<span class="sh-brand-sde">SDE</span>'
    +     '<svg class="sh-brand-underline" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3,9 Q46,13 82,6 T118,3" fill="none" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'
    +   '</span>'
    +   '<span class="sh-brand-dot">.com</span>'
    + '</span></a>'
    + '<nav class="sh-nav">'+navItems+'</nav>'
    + '<div class="sh-right">'
    + '<button class="sh-premium-btn" id="sh-premium-btn" style="display:none" title="Unlock Premium">Premium</button>'
    + themeBtn
    + '</div>'
    + '<button class="sh-toggle" aria-label="Menu" aria-expanded="false">☰</button>'
    + '</header>';

  // Early-15 promo announcement bar, sits above the header on non-course
  // pages (the course app shell is a fixed-height layout the bar would
  // disrupt). Always shown (non-dismissible) while the offer runs.
  var promoHtml = '';
  if(!inCourse){
    var promoWa = 'https://wa.me/919100880133?text=' + encodeURIComponent("Hi, I'd like to claim the Early 15 Offer (15% off on a course)");
    promoHtml = '<div class="sh-promo" id="sh-promo">'
      + '<span class="sh-promo-spark" aria-hidden="true">\u26A1</span>'
      + '<span class="sh-promo-text"><strong>Early\u201115 Offer</strong> \u00b7 <strong>15% OFF</strong> any course \u00b7 only the first <strong>15 seats</strong></span>'
      + '<a class="sh-promo-cta" href="' + promoWa + '" target="_blank" rel="noopener">Claim 15% OFF <span class="sh-promo-arrow" aria-hidden="true">\u2192</span></a>'
      + '</div>';
  }

  document.body.insertAdjacentHTML('afterbegin', promoHtml + html);

  // Theme toggle behavior
  var themeToggle = document.getElementById('sh-theme-toggle');
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try{ localStorage.setItem('hsde-theme', next); }catch(e){}
    });
  }

  // Mobile nav
  var toggle = document.querySelector('.sh-toggle');
  var nav = document.querySelector('.sh-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('sh-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? '✕' : '☰';
    });
  }

  // Courses dropdown: hover on desktop (CSS), click on touch/mobile
  var dd = document.querySelector('.sh-dropdown');
  var ddToggle = dd && dd.querySelector('.sh-dd-toggle');
  if(dd && ddToggle){
    ddToggle.addEventListener('click', function(e){
      e.preventDefault();
      var open = dd.classList.toggle('sh-dd-open');
      ddToggle.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function(e){
      if(!dd.contains(e.target)) dd.classList.remove('sh-dd-open');
    });
  }

  // Sticky header: the bar is position:sticky; add a shadow once the page is
  // scrolled so it clearly reads as an elevated, floating menu.
  var shEl = document.querySelector('.sh');
  if(shEl){
    var onShScroll = function(){ shEl.classList.toggle('sh-scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', onShScroll, {passive:true});
    onShScroll();
  }

  // Analytics
  var umami = document.createElement('script');
  umami.defer = true;
  umami.src = 'https://cloud.umami.is/script.js';
  umami.setAttribute('data-website-id', 'be293e2f-a06e-4259-a351-c871c789893b');
  document.head.appendChild(umami);

  // Floating WhatsApp button, injected on every page (including the course
  // app shell). Clicking opens WhatsApp with a default "course details"
  // message prefilled.
  var waText = "Hi, I'm looking for Course details";
  var waFab = '<a class="wa-fab" href="https://wa.me/919100880133?text=' + encodeURIComponent(waText) + '"'
    + ' target="_blank" rel="noopener"'
    + ' aria-label="Chat with us on WhatsApp about course details"'
    + ' title="Course details? Chat on WhatsApp">'
    + '<svg class="wa-fab-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.005c6.582 0 11.945-5.335 11.948-11.896C24 8.455 22.761 5.46 20.521 3.45"/></svg>'
    + '<span class="wa-fab-label">Course details?</span>'
    + '</a>';
  document.body.insertAdjacentHTML('beforeend', waFab);

  // Footer: skipped on the course app shell, which is a fixed-height,
  // internally-scrolling layout (sidebar + main + rail) that a trailing
  // footer would break rather than complement.
  if(!inCourse){
    // Social links default to each platform's home page, swap in the real
    // channel URLs when they exist.
    var social = [
      {href:'https://www.linkedin.com', label:'LinkedIn', svg:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'},
      {href:'https://www.youtube.com', label:'YouTube', svg:'<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>'},
      {href:'https://www.instagram.com', label:'Instagram', svg:'<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'}
    ];
    var socialItems = social.map(function(s){
      return '<a href="'+s.href+'" target="_blank" rel="noopener" aria-label="'+s.label+'" title="'+s.label+'">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+s.svg+'</svg>'
        + '</a>';
    }).join('');

    var footer = '<footer class="site-footer">'
      + '<a class="footer-brand" href="'+prefix+'index.html" aria-label="HelloSDE home">'
      +   '<span class="sh-brand-word"><span class="sh-brand-underlined">'
      +     '<span class="sh-brand-hello">Hello</span><span class="sh-brand-sde">SDE</span>'
      +     '<svg class="sh-brand-underline" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><path d="M3,9 Q46,13 82,6 T118,3" fill="none" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'
      +   '</span><span class="sh-brand-dot">.com</span></span>'
      + '</a>'
      + '<p>System Design for Senior Engineers</p>'
      + '<div class="footer-social">'+socialItems+'</div>'
      + '<a href="https://wa.me/919100880133" target="_blank" rel="noopener" class="footer-wa">Need any help?</a>'
      + '</footer>';
    document.body.insertAdjacentHTML('beforeend', footer);
  }
})();
