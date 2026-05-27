/* ═══ Concepts Section Nav ═══
   Injects the topic navigation grid and search on cheatsheet pages.
*/
(function(){
const navHTML = `
<div class="search-wrap" id="searchWrap">
  <input type="text" id="globalSearch" class="search-box" placeholder="Search topics… (Kafka, QUIC, Debezium, 202)" autocomplete="off" aria-label="Search topics">
  <div id="searchResults" class="search-results"></div>
</div>
<div class="ng" id="topicNav">
  <div class="nc"><h3 style="color:var(--c)">1. Foundations</h3><div class="lk">
    <a href="01-foundations.html#sd-framework">Framework</a><a href="01-foundations.html#fr-nfr">FR vs NFR</a><a href="01-foundations.html#nfr-metrics">NFR Metrics</a><a href="01-foundations.html#scaling-basics">Scaling</a><a href="01-foundations.html#stateless-stateful">Stateless/Stateful</a><a href="01-foundations.html#serialization">Serialization</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--c)">2. Networking</h3><div class="lk">
    <a href="02-networking.html#osi">OSI Model</a><a href="02-networking.html#tcp-udp">TCP/UDP</a><a href="02-networking.html#http-https">HTTP/HTTPS</a><a href="02-networking.html#dns">DNS</a><a href="02-networking.html#ip-cidr">IP/CIDR</a><a href="02-networking.html#key-ports">Ports</a><a href="02-networking.html#firewalls">Firewalls</a><a href="02-networking.html#zero-trust">Zero Trust</a><a href="02-networking.html#ddos-defense">DDoS</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--r)">3. Security</h3><div class="lk">
    <a href="03-security.html#authentication">Auth</a><a href="03-security.html#authorization">AuthZ</a><a href="03-security.html#encryption">Encryption</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--p)">4. APIs &amp; Communication</h3>
    <div class="sg"><a href="04-apis.html#rest">REST</a><a href="04-apis.html#grpc">gRPC</a><a href="04-apis.html#graphql">GraphQL</a></div>
    <div class="sg"><a href="04-apis.html#async-apis">Async APIs</a><a href="04-apis.html#idempotent-apis">Idempotency</a><a href="04-apis.html#realtime">WebSocket/SSE</a></div>
    <div class="sg"><a href="04-apis.html#soap">SOAP</a><a href="04-apis.html#cors">CORS</a><a href="04-apis.html#openapi">OpenAPI</a><a href="04-apis.html#api-versioning">Versioning</a><a href="04-apis.html#pagination">Pagination</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--t)">5. Infrastructure</h3>
    <div class="sg"><a href="05-infrastructure.html#load-balancer">Load Balancer</a><a href="05-infrastructure.html#api-gateway">API Gateway</a><a href="05-infrastructure.html#proxy">Proxy</a></div>
    <div class="sg"><a href="05-infrastructure.html#nginx">NGINX</a><a href="05-infrastructure.html#docker-k8s">Docker/K8s</a><a href="05-infrastructure.html#service-mesh">Mesh</a></div>
    <div class="sg"><a href="05-infrastructure.html#multi-region">Multi-Region</a><a href="05-infrastructure.html#service-discovery">Service Discovery</a><a href="05-infrastructure.html#cicd">CI/CD</a><a href="05-infrastructure.html#serverless">Serverless</a><a href="05-infrastructure.html#iac">IaC</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--g)">6. Storage Systems</h3>
    <div class="sg"><a href="06-storage.html#db-choice">DB Choice</a><a href="06-storage.html#db-internals">Internals</a><a href="06-storage.html#db-indexing">Indexing</a></div>
    <div class="sg"><a href="06-storage.html#sql">SQL</a><a href="06-storage.html#nosql">NoSQL</a><a href="06-storage.html#newsql">NewSQL</a><a href="06-storage.html#timeseries">TimeSeries</a></div>
    <div class="sg"><a href="06-storage.html#search">Search/ES</a><a href="06-storage.html#blob">Blob/S3</a><a href="06-storage.html#vector-db">Vector DB</a><a href="06-storage.html#graph-db-deep">Graph DB</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--y)">7. Caching</h3>
    <div class="sg"><a href="07-caching.html#caching">Strategies</a><a href="07-caching.html#cdn">CDN</a></div>
    <div class="sg"><a href="07-caching.html#redis">Redis</a><a href="07-caching.html#redis-fast">Why Redis Fast</a><a href="07-caching.html#redis-cache">Redis Cache</a></div>
    <div class="sg"><a href="07-caching.html#redis-pubsub">Pub/Sub &amp; Streams</a><a href="07-caching.html#redis-ha">Persistence/HA</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--o)">8. Messaging</h3>
    <div class="sg"><a href="08-messaging.html#message-queues">Queues</a><a href="08-messaging.html#kafka">Kafka</a><a href="08-messaging.html#pubsub">Pub/Sub</a></div>
    <div class="sg"><a href="08-messaging.html#dlq">DLQ</a><a href="08-messaging.html#event-sourcing">Event Sourcing</a><a href="08-messaging.html#cqrs">CQRS</a><a href="08-messaging.html#ordering">Ordering</a><a href="08-messaging.html#schema-registry">Schema Registry</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--a)">9. Consistency</h3>
    <div class="sg"><a href="09-consistency.html#cap">CAP/PACELC</a><a href="09-consistency.html#consistency-models">Models</a><a href="09-consistency.html#consensus">Consensus</a></div>
    <div class="sg"><a href="09-consistency.html#transactions">Transactions</a><a href="09-consistency.html#saga-orchestration">Saga</a><a href="09-consistency.html#conflict-resolution">Conflict Res.</a><a href="09-consistency.html#clock-sync">Clock Sync</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--g)">10. Scalability</h3>
    <div class="sg"><a href="10-scalability.html#partitioning">Partitioning</a><a href="10-scalability.html#sharding">Sharding</a><a href="10-scalability.html#replication">Replication</a></div>
    <div class="sg"><a href="10-scalability.html#consistent-hashing">Consistent Hash</a><a href="10-scalability.html#bloom-filters">Bloom Filters</a><a href="10-scalability.html#rate-limiting">Rate Limiting</a></div>
    <div class="sg"><a href="10-scalability.html#backpressure">Backpressure</a><a href="10-scalability.html#auto-scaling">Auto-Scaling</a><a href="10-scalability.html#graceful-degradation">Degradation</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--o)">11. Data Pipelines</h3>
    <div class="sg"><a href="11-data-pipelines.html#cdc">CDC</a><a href="11-data-pipelines.html#etl">ETL/ELT</a></div>
    <div class="sg"><a href="11-data-pipelines.html#stream-processing">Stream</a><a href="11-data-pipelines.html#batch-processing">Batch</a></div>
    <div class="sg"><a href="11-data-pipelines.html#data-warehouse">Warehouse</a><a href="11-data-pipelines.html#data-lakes">Lakehouse</a><a href="11-data-pipelines.html#data-lineage">Lineage</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--a2)">12. Distributed Systems</h3>
    <div class="sg"><a href="12-distributed-systems.html#dist-patterns">Patterns</a><a href="12-distributed-systems.html#fault-tolerance">Fault Tolerance</a><a href="12-distributed-systems.html#leader-election">Leader Election</a></div>
    <div class="sg"><a href="12-distributed-systems.html#zookeeper">ZooKeeper</a><a href="12-distributed-systems.html#gfs-hdfs">GFS/HDFS</a><a href="12-distributed-systems.html#bigtable">BigTable</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--c)">13. Observability</h3><div class="lk">
    <a href="13-observability.html#logging">Logging</a><a href="13-observability.html#metrics">Metrics</a><a href="13-observability.html#tracing">Tracing</a><a href="13-observability.html#monitoring">Monitoring</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--o)">14. AI Systems</h3>
    <div class="sg"><a href="14-ai-systems.html#llm-serving">LLM Serving</a><a href="14-ai-systems.html#rag">RAG</a><a href="14-ai-systems.html#embeddings">Embeddings</a></div>
    <div class="sg"><a href="14-ai-systems.html#ai-gateway">AI Gateway</a><a href="14-ai-systems.html#agents">Agents</a><a href="14-ai-systems.html#feature-stores">Feature Stores</a></div>
    <div class="sg"><a href="14-ai-systems.html#ml-training">Training Infra</a><a href="14-ai-systems.html#guardrails">Guardrails</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--y)">15. Key Numbers</h3><div class="lk">
    <a href="15-key-numbers.html#latency-numbers">Latency</a><a href="15-key-numbers.html#throughput-numbers">Throughput</a><a href="15-key-numbers.html#estimation">Estimation</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--t)">16. Decision Flowcharts</h3>
    <div class="sg"><a href="16-decision-flowcharts.html#api-choice">API</a><a href="16-decision-flowcharts.html#db-choice">Database</a><a href="16-decision-flowcharts.html#messaging-choice">Messaging</a><a href="16-decision-flowcharts.html#cache-choice">Cache</a><a href="16-decision-flowcharts.html#realtime-choice">Real-time</a></div>
  </div>
</div>`;

// Inject after .hero or at top of .ct
const hero = document.querySelector('.hero');
if(hero) hero.insertAdjacentHTML('afterend', navHTML);
else {
  const ct = document.querySelector('.ct');
  if(ct) ct.insertAdjacentHTML('beforebegin', navHTML);
}

// Search functionality
const entries = [];
document.querySelectorAll('#topicNav .nc').forEach(card => {
  const cat = card.querySelector('h3').textContent.trim();
  card.querySelectorAll('a').forEach(a => {
    entries.push({ text: a.textContent.trim(), href: a.getAttribute('href'), cat, type: 'nav' });
  });
});
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.T').forEach(section => {
  const h2 = section.querySelector('h2');
  const id = section.id;
  if(!h2 || !id) return;
  entries.push({ text: h2.textContent.trim(), href: page + '#' + id, cat: 'This page', type: 'heading' });
  section.querySelectorAll('.b, li, p, .su, pre').forEach(el => {
    const txt = el.textContent.trim();
    if(txt.length < 4 || txt.length > 500) return;
    entries.push({ text: txt, href: page + '#' + id, cat: h2.textContent.trim(), type: 'content' });
  });
});

const input = document.getElementById('globalSearch');
const resultsEl = document.getElementById('searchResults');
if(!input || !resultsEl) return;

input.addEventListener('input', function(){
  const q = this.value.toLowerCase().trim();
  if(!q || q.length < 2){ resultsEl.innerHTML=''; resultsEl.style.display='none'; return; }
  const scored = [];
  for(const e of entries){
    const t = e.text.toLowerCase();
    const idx = t.indexOf(q);
    if(idx === -1) continue;
    const priority = e.type === 'nav' ? 3 : e.type === 'heading' ? 2 : 1;
    scored.push({ ...e, priority, idx });
  }
  scored.sort((a,b) => b.priority - a.priority || a.idx - b.idx);
  const seen = new Set();
  const unique = [];
  for(const s of scored){
    const key = s.href + '|' + s.text.slice(0,40);
    if(!seen.has(key)){ seen.add(key); unique.push(s); }
  }
  if(!unique.length){
    resultsEl.innerHTML='<div class="sr-empty">No matches</div>';
    resultsEl.style.display='block'; return;
  }
  resultsEl.innerHTML = unique.slice(0,12).map(m => {
    let display = m.text;
    if(m.type === 'content' && display.length > 80){
      const start = Math.max(0, m.idx - 30);
      display = (start > 0 ? '…' : '') + display.slice(start, start + 80) + '…';
    }
    return `<a class="sr-item" href="${m.href}"><span class="sr-cat">${m.cat}</span><span class="sr-text">${display}</span></a>`;
  }).join('');
  resultsEl.style.display='block';
});

document.addEventListener('click', e => { if(!e.target.closest('#searchWrap')) resultsEl.style.display='none'; });
input.addEventListener('keydown', e => {
  if(e.key==='Escape'){ resultsEl.style.display='none'; input.blur(); }
  if(e.key==='Enter'){ const first = resultsEl.querySelector('.sr-item'); if(first) window.location.href = first.getAttribute('href'); }
});

// Highlight active module
document.querySelectorAll('#topicNav .nc').forEach(card => {
  const links = card.querySelectorAll('a');
  const h3 = card.querySelector('h3');
  // Make h3 clickable on mobile by wrapping it in a link to the module page
  if(h3 && links.length > 0){
    var firstHref = links[0].getAttribute('href') || '';
    var pageHref = firstHref.split('#')[0]; // e.g. "01-foundations.html"
    if(pageHref){
      h3.style.cursor = 'pointer';
      h3.addEventListener('click', function(){ window.location.href = pageHref; });
    }
  }
  for(const a of links){
    const href = a.getAttribute('href') || '';
    if(href.split('#')[0] === page){ card.classList.add('active'); break; }
  }
});

// Right rail
(function buildRail(){
  const sections = Array.from(document.querySelectorAll('.T[id]'));
  if(sections.length < 2) return;
  const items = sections.map(sec => {
    const h2 = sec.querySelector('h2');
    return { id: sec.id, label: h2 ? h2.textContent.trim() : sec.id, el: sec };
  });
  var rail = document.createElement('aside');
  rail.id = 'pageRail';
  rail.setAttribute('aria-label','On this page');
  // Use module name from filename (e.g. "09-consistency.html" → "9. Consistency")
  var pageTitle = document.title.split('—')[0].trim();
  var moduleMatch = page.match(/^(\d+)-(.+)\.html$/);
  if(moduleMatch){
    pageTitle = parseInt(moduleMatch[1]) + '. ' + moduleMatch[2].replace(/-/g,' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }
  // Hide the inline .sd module title to avoid duplication with rail title
  var sdDiv = document.querySelector('.sd');
  if(sdDiv) sdDiv.style.display = 'none';

  rail.innerHTML = '<h4><span class="pr-dot"></span>' + pageTitle + '</h4>' +
    '<ol>' + items.map(it => '<li><a href="#' + it.id + '" data-id="' + it.id + '">' + it.label + '</a></li>').join('') + '</ol>';
  document.body.appendChild(rail);

  const toggle = document.createElement('button');
  toggle.id = 'pr-toggle';
  toggle.type = 'button';
  toggle.innerHTML = '<span class="pr-tog-ic">☰</span><span class="pr-tog-lbl">' + pageTitle + '</span>';
  document.body.appendChild(toggle);

  function setOpen(open){
    rail.classList.toggle('pr-visible', open);
    toggle.classList.toggle('pr-tog-open', open);
  }
  toggle.addEventListener('click', () => setOpen(!rail.classList.contains('pr-visible')));

  // Close rail when clicking outside
  document.addEventListener('mousedown', function(e){
    if(!rail.classList.contains('pr-visible')) return;
    if(rail.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });

  const linkById = {};
  rail.querySelectorAll('a').forEach(a => { linkById[a.dataset.id] = a; });
  function setActive(id){
    Object.values(linkById).forEach(a => a.classList.remove('pr-active'));
    const a = linkById[id];
    if(a){ a.classList.add('pr-active'); a.scrollIntoView({block:'nearest'}); }
  }
  const visible = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) visible.set(e.target.id, true); else visible.delete(e.target.id); });
    let bestId = null, bestTop = Infinity;
    items.forEach(it => { if(visible.has(it.id)){ const t = it.el.getBoundingClientRect().top; if(t < bestTop){ bestTop = t; bestId = it.id; } } });
    if(!bestId){ items.forEach(it => { if(it.el.getBoundingClientRect().top < 140) bestId = it.id; }); }
    if(bestId) setActive(bestId);
  }, { rootMargin: '-100px 0px -55% 0px', threshold: [0, 0.25] });
  items.forEach(it => io.observe(it.el));
  if(location.hash){ const id = location.hash.slice(1); if(linkById[id]) setActive(id); }
})();
})();

/* ═══ Prev / Next Page Navigation ═══ */
(function(){
  var pages = [
    {file:'01-foundations.html', title:'Foundations'},
    {file:'02-networking.html', title:'Networking'},
    {file:'03-security.html', title:'Security'},
    {file:'04-apis.html', title:'APIs & Communication'},
    {file:'05-infrastructure.html', title:'Infrastructure'},
    {file:'06-storage.html', title:'Storage Systems'},
    {file:'07-caching.html', title:'Caching'},
    {file:'08-messaging.html', title:'Messaging'},
    {file:'09-consistency.html', title:'Consistency'},
    {file:'10-scalability.html', title:'Scalability'},
    {file:'11-data-pipelines.html', title:'Data Pipelines'},
    {file:'12-distributed-systems.html', title:'Distributed Systems'},
    {file:'13-observability.html', title:'Observability'},
    {file:'14-ai-systems.html', title:'AI Systems'},
    {file:'15-key-numbers.html', title:'Key Numbers'},
    {file:'16-decision-flowcharts.html', title:'Decision Flowcharts'}
  ];

  var currentPage = location.pathname.split('/').pop() || 'index.html';
  var idx = -1;
  for(var i = 0; i < pages.length; i++){
    if(pages[i].file === currentPage){ idx = i; break; }
  }
  if(idx === -1) return; // Not a concept page (e.g., index.html)

  var prev = idx > 0 ? pages[idx - 1] : null;
  var next = idx < pages.length - 1 ? pages[idx + 1] : null;

  var nav = document.createElement('nav');
  nav.className = 'page-nav';
  nav.setAttribute('aria-label', 'Page navigation');

  var html = '';
  if(prev){
    html += '<a href="' + prev.file + '" class="page-nav-btn page-nav-prev">'
      + '<span class="page-nav-dir">←</span>'
      + '<span class="page-nav-title">' + prev.title + '</span>'
      + '</a>';
  } else {
    html += '<a href="../index.html" class="page-nav-btn page-nav-prev">'
      + '<span class="page-nav-dir">←</span>'
      + '<span class="page-nav-title">Home</span>'
      + '</a>';
  }

  // Center slot for premium CTA
  html += '<div class="page-nav-cta" id="pageNavCta"></div>';
  if(next){
    html += '<a href="' + next.file + '" class="page-nav-btn page-nav-next">'
      + '<span class="page-nav-title">' + next.title + '</span>'
      + '<span class="page-nav-dir">→</span>'
      + '</a>';
  } else {
    html += '<a href="../index.html" class="page-nav-btn page-nav-next">'
      + '<span class="page-nav-title">Home</span>'
      + '<span class="page-nav-dir">→</span>'
      + '</a>';
  }

  nav.innerHTML = html;

  // Insert before the footer
  var footer = document.querySelector('.site-footer');
  if(footer){
    footer.parentNode.insertBefore(nav, footer);
  } else {
    document.body.appendChild(nav);
  }

  // Show premium CTA in center after auth resolves
  setTimeout(function(){
    if(localStorage.getItem('hellosde_premium') === 'true') return;
    if(typeof CONFIG !== 'undefined' && CONFIG.admin) return;
    var ctaSlot = document.getElementById('pageNavCta');
    if(!ctaSlot) return;
    ctaSlot.innerHTML = '<span class="page-nav-cta-label">Enjoying this lesson?</span><button class="page-nav-cta-btn" onclick="window.HelloSDE ? (window.HelloSDE.state && window.HelloSDE.state.user ? window.HelloSDE.startPayment() : window.HelloSDE.signIn()) : alert(\'Loading...\')">Premium</button><span class="page-nav-cta-label">to access full content</span>';
  }, 1500);
})();
