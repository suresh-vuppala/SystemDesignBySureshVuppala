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
    {href: prefix+'system-design-cheatsheet/01-foundations.html', label:'Concepts', id:'concepts'},
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

  // Analytics (Umami)
  var umami = document.createElement('script');
  umami.defer = true;
  umami.src = 'https://cloud.umami.is/script.js';
  umami.setAttribute('data-website-id', 'be293e2f-a06e-4259-a351-c871c789893b');
  document.head.appendChild(umami);

  // Footer (injected on all pages)
  var footer = '<footer class="site-footer">'
    + '<p><svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;animation:shLogoSpin 8s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="var(--a)" stroke-width="2" stroke-dasharray="14 6" opacity=".7"/><circle cx="12" cy="12" r="5" fill="var(--a)" opacity=".9"/><circle cx="12" cy="12" r="2" fill="#fff"/></svg><a href="'+prefix+'index.html">HelloSDE.com</a> · System Design for Senior Engineers</p>'
    + '<a href="https://wa.me/919100880133" target="_blank" rel="noopener" class="footer-wa">Need any help? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-left:4px"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.476A11.929 11.929 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.115 0-4.09-.57-5.793-1.564l-.415-.248-2.746.877.878-2.684-.272-.432A9.71 9.71 0 0 1 2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg></a>'
    + '</footer>';
  document.body.insertAdjacentHTML('beforeend', footer);
})();
