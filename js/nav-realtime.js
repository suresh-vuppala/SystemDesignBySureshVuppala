/* ═══ Real-Time Problems — Module Navigation (compact pills) ═══ */
(function(){
var page = location.pathname.split('/').pop() || 'index.html';
var isIndex = (page === 'index.html' || page === '' || location.pathname.endsWith('/'));
var pathParts = location.pathname.split('/');
var inSubfolder = pathParts.length > 2 && pathParts[pathParts.length - 2] !== 'realtime-system-design-problems' && page !== 'index.html' && page !== '';
var prefix = inSubfolder ? '../' : '';

var modules = [
  {name:'Chat', full:'1. Chat &amp; Messaging', href:'1-chat-messaging/', anchor:'#mod-chat', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'Collab', full:'2. Real-Time Collaboration', href:'2-collaboration/', anchor:'#mod-collab', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'Video', full:'3. Video Streaming', href:'3-video-streaming/', anchor:'#mod-video-stream', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'WebRTC', full:'4. Video Calling / WebRTC', href:'4-video-calling/', anchor:'#mod-video-call', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'Tickets', full:'5. Ticket Booking', href:'5-ticket-booking/', anchor:'#mod-tickets', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'Cache', full:'6. Cache &amp; CDN', href:'6-cache-cdn/', anchor:'#mod-cache', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'Queues', full:'7. Queues &amp; Events', href:'7-queues-events/', anchor:'#mod-queues', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'Feeds', full:'8. Feeds &amp; Recommendations', href:'8-social-media/', anchor:'#mod-social', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'Geo', full:'9. Geo, Rides &amp; Delivery', href:'9-geo-rideshare/', anchor:'#mod-geo', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'Payments', full:'10. Payment Systems', href:'10-payments/', anchor:'#mod-payments', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'API GW', full:'11. API Gateway &amp; Backend', href:'11-api-gateway/', anchor:'#mod-api', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'DB', full:'12. Database &amp; Storage', href:'12-database-storage/', anchor:'#mod-db', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'Distributed', full:'13. Distributed Systems', href:'13-distributed-systems/', anchor:'#mod-distributed', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'Sports', full:'14. Live Sports &amp; Broadcasting', href:'14-live-sports/', anchor:'#mod-sports', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'Upload', full:'15. File Upload &amp; Media', href:'15-file-upload/', anchor:'#mod-files', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'Search', full:'16. Search Systems', href:'16-search-systems/', anchor:'#mod-search', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'Calendar', full:'17. Scheduling &amp; Calendar', href:'17-calendar/', anchor:'#mod-calendar', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'Observability', full:'18. Observability &amp; Monitoring', href:'18-observability/', anchor:'#mod-observability', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'ML', full:'19. ML Model Serving', href:'19-ml-serving/', anchor:'#mod-ml', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'Security', full:'20. Security &amp; Auth', href:'20-security/', anchor:'#mod-security', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'URL', full:'21. URL Shortening', href:'21-url-shortening.html', anchor:'#mod-url', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'Email', full:'22. Email Systems', href:'22-email.html', anchor:'#mod-email', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'Moderation', full:'23. Content Moderation', href:'23-moderation.html', anchor:'#mod-moderation', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'Flags', full:'24. Feature Flags', href:'24-feature-flags.html', anchor:'#mod-config', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'Crawling', full:'25. Web Crawling', href:'25-crawling.html', anchor:'#mod-crawling', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'IDs', full:'26. ID Generation', href:'26-id-generation.html', anchor:'#mod-idgen', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'Ads', full:'27. Ad Serving', href:'27-ad-serving.html', anchor:'#mod-ads', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'CI/CD', full:'28. CI/CD &amp; DevPlatform', href:'28-cicd.html', anchor:'#mod-cicd', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'AI/LLM', full:'29. AI &amp; LLM Systems', href:'29-ai-systems.html', anchor:'#mod-ai', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'}
];

// Inject styles
var navStyle = document.createElement('style');
navStyle.textContent = ''
  + '.mod-nav{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 16px;padding:0 24px;justify-content:center}'
  + '.mod-nav a{padding:3px 9px;border-radius:5px;font-size:.72rem;font-weight:600;text-decoration:none;white-space:nowrap;transition:all .15s}'
  + '.mod-nav a:hover{transform:translateY(-1px);filter:brightness(1.3)}'
  + '.mod-nav .mn-short{display:none}'
  + '@media(max-width:600px){.mod-nav{gap:4px;padding:0 10px;margin:6px 0 12px}'
  + '.mod-nav a{padding:3px 7px;font-size:.62rem;border-radius:4px}'
  + '.mod-nav .mn-full{display:none}.mod-nav .mn-short{display:inline}}';
document.head.appendChild(navStyle);

// Build pills
var pills = modules.map(function(m){
  var link = isIndex ? m.anchor : (prefix + 'index.html' + m.anchor);
  var folderName = m.href.replace(/\/$/, '').replace(/\.html$/, '');
  var active = (!isIndex && (location.pathname.indexOf(folderName) !== -1 || m.href.indexOf(page) !== -1));
  var style = 'background:'+(active ? m.bg.replace('.08','.2') : m.bg)+';'
    + 'border:1px solid '+(active ? m.color : m.border)+';'
    + 'color:'+m.color+';'
    + 'font-weight:'+(active?'700':'600');
  return '<a href="'+link+'" style="'+style+'" title="'+m.full.replace(/&amp;/g,'&')+'"><span class="mn-full">'+m.full+'</span><span class="mn-short">'+m.name+'</span></a>';
}).join('');

var homeLink = isIndex ? 'index.html' : prefix + 'index.html';
var homeStyle = 'background:'+(isIndex?'rgba(255,255,255,.08)':'rgba(255,255,255,.04)')+';'
  + 'border:1px solid var(--border);color:var(--muted);font-weight:'+(isIndex?'700':'600');

var container = document.createElement('div');
container.className = 'mod-nav';
container.innerHTML = '<a href="'+homeLink+'" style="'+homeStyle+'"><span class="mn-full">⚡ All Modules</span><span class="mn-short">⚡ All</span></a>' + pills;

var hero = document.querySelector('.hero');
if(hero) hero.insertAdjacentElement('afterend', container);

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

  // Right rail with module list for index page
  (function(){
    var moduleSections = document.querySelectorAll('.T[id^="mod-"]');
    if(moduleSections.length < 2) return;

    var items = [];
    moduleSections.forEach(function(sec){
      var h2 = sec.querySelector('h2');
      if(h2){
        var text = h2.childNodes[0].textContent.trim();
        items.push({id: sec.id, label: text, el: sec});
      }
    });

    var rail = document.createElement('aside');
    rail.id = 'pageRail';
    rail.setAttribute('aria-label','Modules');
    rail.innerHTML = '<h4><span class="pr-dot"></span>Modules</h4>'
      + '<ol style="max-height:calc(100vh - 140px);overflow-y:auto;scrollbar-width:thin">'
      + items.map(function(it){ return '<li><a href="#'+it.id+'" data-id="'+it.id+'">'+it.label+'</a></li>'; }).join('')
      + '</ol>';
    document.body.appendChild(rail);

    var toggle = document.createElement('button');
    toggle.id = 'pr-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '<span class="pr-tog-ic">☰</span><span class="pr-tog-lbl">Modules</span>';
    document.body.appendChild(toggle);

    function setOpen(open){
      rail.classList.toggle('pr-visible', open);
      toggle.classList.toggle('pr-tog-open', open);
    }
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      setOpen(!rail.classList.contains('pr-visible'));
    });
    document.addEventListener('mousedown', function(e){
      if(!rail.classList.contains('pr-visible')) return;
      if(rail.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    // Track active module on scroll
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
  })();
}

/* ═══ Right Rail "On this page" (non-index pages only) ═══ */
if(!isIndex){
  var sections = document.querySelectorAll('.T[id]');
  if(sections.length > 2){

    var items = [];
    sections.forEach(function(sec){
      var h2 = sec.querySelector('h2');
      if(h2) items.push({id: sec.id, label: h2.textContent.trim(), el: sec});
    });

    var rail = document.createElement('aside');
    rail.id = 'pageRail';
    rail.setAttribute('aria-label','On this page');
    var railTitle = 'On this page';
    var folderParts = location.pathname.split('/');
    var parentFolder = folderParts.length > 2 ? folderParts[folderParts.length - 2] : '';
    var folderMatch = parentFolder.match(/^(\d+)-(.+)$/);
    if(folderMatch){
      railTitle = parseInt(folderMatch[1]) + '. ' + folderMatch[2].replace(/-/g,' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
    } else {
      var fileMatch = page.match(/^(\d+)-(.+)\.html$/);
      if(fileMatch){
        railTitle = parseInt(fileMatch[1]) + '. ' + fileMatch[2].replace(/-/g,' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      }
    }
    var sdDiv = document.querySelector('.sd');
    if(sdDiv) sdDiv.style.display = 'none';

    rail.innerHTML = '<h4><span class="pr-dot"></span>' + railTitle + '</h4>'
      +'<ol>'+items.map(function(it){ return '<li><a href="#'+it.id+'" data-id="'+it.id+'">'+it.label+'</a></li>'; }).join('')+'</ol>';
    document.body.appendChild(rail);

    var toggle = document.createElement('button');
    toggle.id = 'pr-toggle';
    toggle.type = 'button';
    toggle.innerHTML = '<span class="pr-tog-ic">☰</span><span class="pr-tog-lbl">' + railTitle + '</span>';
    document.body.appendChild(toggle);

    function setOpen(open){
      rail.classList.toggle('pr-visible', open);
      toggle.classList.toggle('pr-tog-open', open);
    }
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      setOpen(!rail.classList.contains('pr-visible'));
    });

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

/* ═══ Prev/Next + Premium CTA for problem pages ═══ */
if(!isIndex){
  (function(){
    var currentFolder = '';
    var pathSegments = location.pathname.split('/');
    for(var si = 0; si < pathSegments.length; si++){
      if(/^\d+-/.test(pathSegments[si]) && si < pathSegments.length - 1){
        currentFolder = pathSegments[si];
      }
    }

    var moduleEntry = null;
    for(var mi = 0; mi < modules.length; mi++){
      var mFolder = modules[mi].href.replace(/\/$/, '').replace(/\.html$/, '');
      if(currentFolder && currentFolder === mFolder){
        moduleEntry = modules[mi]; break;
      }
    }

    var siblings = [];
    var currentFile = page;
    
    document.querySelectorAll('a[href]').forEach(function(a){
      var href = a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('http') || href.indexOf('/') !== -1) return;
      if(href.endsWith('.html') && href !== currentFile && siblings.indexOf(href) === -1){
        siblings.push(href);
      }
    });

    var knownProblems = {
      '1-chat-messaging': ['slack-real-time-messaging.html','whatsapp-offline-delivery.html','discord-websocket-infra.html','multi-region-ordering.html','telegram-large-group-fanout.html','whatsapp-presence-100m.html','slack-typing-indicators.html','slack-chat-search.html','whatsapp-push-notifications.html','telegram-multi-device-sync.html','slack-active-channels.html']
    };

    var problemList = knownProblems[currentFolder] || siblings;
    var currentIdx = -1;
    for(var pi = 0; pi < problemList.length; pi++){
      if(problemList[pi] === currentFile){ currentIdx = pi; break; }
    }

    var prevProb = currentIdx > 0 ? problemList[currentIdx - 1] : null;
    var nextProb = currentIdx >= 0 && currentIdx < problemList.length - 1 ? problemList[currentIdx + 1] : null;

    var navBar = document.createElement('nav');
    navBar.className = 'page-nav';
    var html = '';

    if(prevProb){
      var prevTitle = prevProb.replace('.html','').replace(/-/g,' ').replace(/\b\w/g, function(c){return c.toUpperCase();});
      html += '<a href="' + prevProb + '" class="page-nav-btn page-nav-prev">'
        + '<span class="page-nav-dir">←</span>'
        + '<span class="page-nav-title">' + prevTitle + '</span>'
        + '</a>';
    } else {
      html += '<a href="' + prefix + 'index.html" class="page-nav-btn page-nav-prev">'
        + '<span class="page-nav-dir">←</span>'
        + '<span class="page-nav-title">All Problems</span>'
        + '</a>';
    }

    html += '<div class="page-nav-cta" id="pageNavCtaProb"></div>';

    if(nextProb){
      var nextTitle = nextProb.replace('.html','').replace(/-/g,' ').replace(/\b\w/g, function(c){return c.toUpperCase();});
      html += '<a href="' + nextProb + '" class="page-nav-btn page-nav-next">'
        + '<span class="page-nav-title">' + nextTitle + '</span>'
        + '<span class="page-nav-dir">→</span>'
        + '</a>';
    } else {
      html += '<a href="' + prefix + 'index.html" class="page-nav-btn page-nav-next">'
        + '<span class="page-nav-title">All Problems</span>'
        + '<span class="page-nav-dir">→</span>'
        + '</a>';
    }

    navBar.innerHTML = html;

    var footer = document.querySelector('.site-footer');
    if(footer){
      footer.parentNode.insertBefore(navBar, footer);
    } else {
      document.body.appendChild(navBar);
    }

    setTimeout(function(){
      if(localStorage.getItem('hellosde_premium') === 'true') return;
      if(typeof CONFIG !== 'undefined' && CONFIG.admin) return;
      var ctaSlot = document.getElementById('pageNavCtaProb');
      if(!ctaSlot) return;
      ctaSlot.innerHTML = '<span class="page-nav-cta-label">Enjoying this lesson?</span><button class="page-nav-cta-btn" onclick="window.HelloSDE ? (window.HelloSDE.state && window.HelloSDE.state.user ? window.HelloSDE.startPayment() : window.HelloSDE.signIn()) : alert(\'Loading...\')">Premium</button><span class="page-nav-cta-label">to access full content</span>';
    }, 1500);
  })();
}

})();
