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
  <div class="nc"><h3 style="color:var(--y)">14. Key Numbers</h3><div class="lk">
    <a href="14-key-numbers.html#latency-numbers">Latency</a><a href="14-key-numbers.html#throughput-numbers">Throughput</a><a href="14-key-numbers.html#estimation">Estimation</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--t)">15. Decision Flowcharts</h3>
    <div class="sg"><a href="15-decision-flowcharts.html#api-choice">API</a><a href="15-decision-flowcharts.html#db-choice">Database</a><a href="15-decision-flowcharts.html#messaging-choice">Messaging</a><a href="15-decision-flowcharts.html#cache-choice">Cache</a><a href="15-decision-flowcharts.html#realtime-choice">Real-time</a></div>
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
  const rail = document.createElement('aside');
  rail.id = 'pageRail';
  rail.setAttribute('aria-label','On this page');
  rail.innerHTML = '<h4><span class="pr-dot"></span>On this page</h4>' +
    '<ol>' + items.map(it => '<li><a href="#' + it.id + '" data-id="' + it.id + '">' + it.label + '</a></li>').join('') + '</ol>';
  document.body.appendChild(rail);

  const toggle = document.createElement('button');
  toggle.id = 'pr-toggle';
  toggle.type = 'button';
  toggle.innerHTML = '<span class="pr-tog-ic">☰</span><span class="pr-tog-lbl">Sections</span>';
  document.body.appendChild(toggle);

  function setOpen(open){
    rail.classList.toggle('pr-visible', open);
    toggle.classList.toggle('pr-tog-open', open);
  }
  toggle.addEventListener('click', () => setOpen(!rail.classList.contains('pr-visible')));

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
