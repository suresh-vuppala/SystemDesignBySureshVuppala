/* ═══ Shared Site Header — HelloSDE.com ═══ */

/* Theme init — runs before any paint of the injected header to avoid FOUC.
   Order: saved preference → OS preference → light default. */
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
  if(inCheatsheet) activeSection = 'concepts';
  if(inRealtime) activeSection = 'realtime';
  if(page === 'engineering-blogs.html') activeSection = 'blogs';
  if(page === 'master-system-design.html') activeSection = 'courses';

  // Calculate prefix to reach the project root
  var prefix = '';
  if(dir === 'system-design-cheatsheet') prefix = '../';
  else if(dir === 'realtime-system-design-problems') prefix = '../';
  else if(inRealtime) prefix = '../../';
  else if(inCheatsheet) prefix = '../';

  var links = [
    {href: prefix+'system-design-cheatsheet/01-foundations.html', label:'Concepts', id:'concepts'},
    {href: prefix+'realtime-system-design-problems/index.html', label:'Problems', id:'realtime'},
    {href: prefix+'system-design-cheatsheet/engineering-blogs.html', label:'Blogs', id:'blogs'}
  ];

  var courses = [
    {href: prefix+'master-system-design.html', label:'Master System Design', desc:'8-week live weekend cohort'}
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
    + '<span class="sh-livedot" aria-hidden="true"></span>Live Course <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sh-dd-caret"><polyline points="6 9 12 15 18 9"/></svg>'
    + '</button>'
    + '<div class="sh-dropdown-menu">'+courseItems+'</div>'
    + '</div>';
  navItems = navItems + coursesDropdown;

  // Brand logo — hollow ring in text color, filled dot in brand orange.
  var logoSvg = '<svg class="sh-logo" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">'
    + '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>'
    + '<circle cx="12" cy="12" r="4" fill="var(--brand)"/>'
    + '</svg>';

  var themeBtn = '<button class="sh-theme" id="sh-theme-toggle" aria-label="Toggle theme" title="Toggle theme">'
    + '<svg class="sh-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    + '<svg class="sh-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
    + '</button>';

  var html = '<header class="sh">'
    + '<a class="sh-brand" href="'+prefix+'index.html">'
    + logoSvg
    + '<span>HelloSDE<span style="opacity:.5;font-weight:500">.com</span></span></a>'
    + '<nav class="sh-nav">'+navItems+'</nav>'
    + '<div class="sh-right">'
    + '<button class="sh-premium-btn" id="sh-premium-btn" style="display:none" title="Unlock Premium">Premium</button>'
    + themeBtn
    + '</div>'
    + '<button class="sh-toggle" aria-label="Menu" aria-expanded="false">☰</button>'
    + '</header>';

  document.body.insertAdjacentHTML('afterbegin', html);

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

  // Courses dropdown — hover on desktop (CSS), click on touch/mobile
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

  // Analytics
  var umami = document.createElement('script');
  umami.defer = true;
  umami.src = 'https://cloud.umami.is/script.js';
  umami.setAttribute('data-website-id', 'be293e2f-a06e-4259-a351-c871c789893b');
  document.head.appendChild(umami);

  // Footer
  var footer = '<footer class="site-footer">'
    + '<p>'
    + '<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="var(--brand)"/></svg>'
    + '<a href="'+prefix+'index.html">HelloSDE.com</a> · System Design for Senior Engineers'
    + '</p>'
    + '<a href="https://wa.me/919100880133" target="_blank" rel="noopener" class="footer-wa">Need any help?</a>'
    + '</footer>';
  document.body.insertAdjacentHTML('beforeend', footer);
})();
