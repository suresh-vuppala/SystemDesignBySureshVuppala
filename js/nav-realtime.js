/* ═══ Real-Time Problems — Module Navigation (compact pills) ═══ */
(function(){
var page = location.pathname.split('/').pop() || 'index.html';
var isIndex = (page === 'index.html' || page === '' || location.pathname.endsWith('/'));
var pathParts = location.pathname.split('/');
var inSubfolder = pathParts.length > 2 && pathParts[pathParts.length - 2] !== 'realtime-system-design-problems' && page !== 'index.html' && page !== '';
var prefix = inSubfolder ? '../' : '';

var modules = [
  {name:'1. Chat &amp; Messaging', href:'1-chat-messaging/', anchor:'#mod-chat', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'2. Real-Time Collaboration', href:'2-collaboration/', anchor:'#mod-collab', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'3. Video Streaming', href:'3-video-streaming/', anchor:'#mod-video-stream', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'4. Video Calling / WebRTC', href:'4-video-calling/', anchor:'#mod-video-call', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'5. Ticket Booking', href:'5-ticket-booking/', anchor:'#mod-tickets', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'6. Cache &amp; CDN', href:'6-cache-cdn/', anchor:'#mod-cache', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'7. Queues &amp; Events', href:'7-queues-events/', anchor:'#mod-queues', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'8. Feeds &amp; Recommendations', href:'8-social-media/', anchor:'#mod-social', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'9. Geo, Rides &amp; Delivery', href:'9-geo-rideshare/', anchor:'#mod-geo', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'10. Payment Systems', href:'10-payments/', anchor:'#mod-payments', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'11. API Gateway &amp; Backend', href:'11-api-gateway/', anchor:'#mod-api', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'12. Database &amp; Storage', href:'12-database-storage/', anchor:'#mod-db', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'13. Distributed Systems', href:'13-distributed-systems/', anchor:'#mod-distributed', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'14. Live Sports &amp; Broadcasting', href:'14-live-sports/', anchor:'#mod-sports', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'15. File Upload &amp; Media', href:'15-file-upload/', anchor:'#mod-files', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'16. Search Systems', href:'16-search-systems/', anchor:'#mod-search', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'17. Scheduling &amp; Calendar', href:'17-calendar/', anchor:'#mod-calendar', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'18. Observability &amp; Monitoring', href:'18-observability/', anchor:'#mod-observability', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'19. ML Model Serving', href:'19-ml-serving/', anchor:'#mod-ml', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'20. Security &amp; Auth', href:'20-security/', anchor:'#mod-security', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'21. URL Shortening', href:'21-url-shortening.html', anchor:'#mod-url', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'22. Email Systems', href:'22-email.html', anchor:'#mod-email', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'23. Content Moderation', href:'23-moderation.html', anchor:'#mod-moderation', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'24. Feature Flags', href:'24-feature-flags.html', anchor:'#mod-config', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'25. Web Crawling', href:'25-crawling.html', anchor:'#mod-crawling', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'26. ID Generation', href:'26-id-generation.html', anchor:'#mod-idgen', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'27. Ad Serving', href:'27-ad-serving.html', anchor:'#mod-ads', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'28. CI/CD &amp; DevPlatform', href:'28-cicd.html', anchor:'#mod-cicd', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'}
];

var pills = modules.map(function(m){
  var link = isIndex ? m.anchor : (prefix + 'index.html' + m.anchor);
  var folderName = m.href.replace(/\/$/, '').replace(/\.html$/, '');
  var active = (!isIndex && (location.pathname.indexOf(folderName) !== -1 || m.href.indexOf(page) !== -1));
  var style = 'padding:4px 10px;border-radius:5px;font-size:.75rem;font-weight:'+(active?'800':'600')+';text-decoration:none;'
    + 'background:'+(active ? m.bg.replace('.08','.2') : m.bg)+';'
    + 'border:1px solid '+(active ? m.color : m.border)+';'
    + 'color:'+m.color;
  return '<a href="'+link+'" style="'+style+'">'+m.name+'</a>';
}).join('');

var homeStyle = 'padding:4px 10px;border-radius:5px;font-size:.75rem;font-weight:'+(isIndex?'800':'600')+';text-decoration:none;'
  + 'background:'+(isIndex?'rgba(255,255,255,.08)':'rgba(255,255,255,.04)')+';'
  + 'border:1px solid var(--border);color:var(--muted)';
var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 16px;padding:0 24px;justify-content:center">'
  + '<a href="'+(isIndex ? 'index.html' : prefix + 'index.html')+'" style="'+homeStyle+'">⚡ All Modules</a>'
  + pills + '</div>';

var hero = document.querySelector('.hero');
if(hero) hero.insertAdjacentHTML('afterend', html);

/* ═══ Smooth scroll for anchor links on index page ═══ */
if(isIndex){
  document.addEventListener('click', function(e){
    var link = e.target.closest('a[href^="#"]');
    if(!link) return;
    var targetId = link.getAttribute('href').slice(1);
    var target = document.getElementById(targetId);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
      history.pushState(null, '', '#' + targetId);
    }
  });
}

/* ═══ Right Rail "On this page" (non-index pages only, no inline pills) ═══ */
if(!isIndex){
  var sections = document.querySelectorAll('.T[id]');
  if(sections.length > 2){

    /* ── Right rail "On this page" ── */
    var items = [];
    sections.forEach(function(sec){
      var h2 = sec.querySelector('h2');
      if(h2) items.push({id: sec.id, label: h2.textContent.trim(), el: sec});
    });

    var rail = document.createElement('aside');
    rail.id = 'pageRail';
    rail.setAttribute('aria-label','On this page');
    rail.innerHTML = '<h4><span class="pr-dot"></span>On this page</h4>'
      +'<ol>'+items.map(function(it){ return '<li><a href="#'+it.id+'" data-id="'+it.id+'">'+it.label+'</a></li>'; }).join('')+'</ol>';
    document.body.appendChild(rail);

    var toggle = document.createElement('button');
    toggle.id = 'pr-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '<span class="pr-tog-ic">☰</span><span class="pr-tog-lbl">Sections</span>';
    document.body.appendChild(toggle);

    function setOpen(open){
      rail.classList.toggle('pr-visible', open);
      toggle.classList.toggle('pr-tog-open', open);
    }
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      setOpen(!rail.classList.contains('pr-visible'));
    });

    // Close rail when clicking outside
    document.addEventListener('mousedown', function(e){
      if(!rail.classList.contains('pr-visible')) return;
      if(rail.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    var linkById = {};
    rail.querySelectorAll('a').forEach(function(a){ linkById[a.dataset.id] = a; });
    function setActive(id){
      Object.values(linkById).forEach(function(a){ a.classList.remove('pr-active'); });
      var a = linkById[id];
      if(a){ a.classList.add('pr-active'); a.scrollIntoView({block:'nearest'}); }
    }

    var visible = new Map();
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting) visible.set(e.target.id, true);
        else visible.delete(e.target.id);
      });
      var bestId = null, bestTop = Infinity;
      items.forEach(function(it){
        if(visible.has(it.id)){
          var t = it.el.getBoundingClientRect().top;
          if(t < bestTop){ bestTop = t; bestId = it.id; }
        }
      });
      if(!bestId){
        items.forEach(function(it){ if(it.el.getBoundingClientRect().top < 140) bestId = it.id; });
      }
      if(bestId) setActive(bestId);
    }, {rootMargin:'-100px 0px -55% 0px', threshold:[0, 0.25]});
    items.forEach(function(it){ io.observe(it.el); });
    if(location.hash){ var id = location.hash.slice(1); if(linkById[id]) setActive(id); }
  }
}
})();
