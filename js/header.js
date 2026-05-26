/* ═══ Shared Site Header — HelloSDE.com ═══ */
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

  // Calculate prefix to reach the project root
  var prefix = '';
  if(dir === 'system-design-cheatsheet') prefix = '../';
  else if(dir === 'realtime-system-design-problems') prefix = '../';
  else if(inRealtime) prefix = '../../';
  else if(inCheatsheet) prefix = '../';

  var links = [
    {href: prefix+'system-design-cheatsheet/index.html', label:'Concepts', id:'concepts'},
    {href: prefix+'realtime-system-design-problems/index.html', label:'Problems', id:'realtime'},
    {href: prefix+'system-design-cheatsheet/engineering-blogs.html', label:'Blogs', id:'blogs'}
  ];

  var navItems = links.map(function(l){
    return '<a href="'+l.href+'" class="sh-link'+(activeSection===l.id?' sh-active':'')+'">'+l.label+'</a>';
  }).join('');

  var html = '<header class="sh">'
    + '<a class="sh-brand" href="'+prefix+'index.html">'
    + '<svg class="sh-logo" width="22" height="22" viewBox="0 0 24 24" style="animation:shLogoSpin 8s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="var(--a)" stroke-width="2" stroke-dasharray="14 6" opacity=".7"/><circle cx="12" cy="12" r="5" fill="var(--a)" opacity=".9"/><circle cx="12" cy="12" r="2" fill="#fff"/></svg>'
    + '<span>HelloSDE<span style="font-size:.65em;color:#fff;font-weight:500">.</span><span style="font-size:.65em;opacity:.5;font-weight:500">com</span></span></a>'
    + '<nav class="sh-nav">'+navItems+'</nav>'
    + '<div class="sh-right">'
    + '<button class="sh-premium-btn" id="sh-premium-btn" style="display:none" title="Unlock Premium">Premium</button>'
    + '</div>'
    + '<button class="sh-toggle" aria-label="Menu" aria-expanded="false">☰</button>'
    + '</header>';

  document.body.insertAdjacentHTML('afterbegin', html);

  // Mobile toggle
  var toggle = document.querySelector('.sh-toggle');
  var nav = document.querySelector('.sh-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('sh-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? '✕' : '☰';
    });
  }

  // Footer (injected on all pages)
  var footer = '<footer class="site-footer">'
    + '<p><svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;animation:shLogoSpin 8s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="var(--a)" stroke-width="2" stroke-dasharray="14 6" opacity=".7"/><circle cx="12" cy="12" r="5" fill="var(--a)" opacity=".9"/><circle cx="12" cy="12" r="2" fill="#fff"/></svg><a href="'+prefix+'index.html">HelloSDE.com</a> · System Design for Senior Engineers</p>'
    + '</footer>';
  document.body.insertAdjacentHTML('beforeend', footer);
})();
