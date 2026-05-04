(function(){
const navHTML = `
<div class="search-wrap" id="searchWrap">
  <input type="text" id="globalSearch" class="search-box" placeholder="Search anything… (Kafka, tombstone, QUIC, Debezium, 202)" autocomplete="off" aria-label="Search topics and content">
  <div id="searchResults" class="search-results"></div>
</div>
<div class="ng" id="topicNav">
  <div class="nc"><h3 style="color:var(--c)">1. Foundations</h3><div class="lk">
    <a href="01-foundations.html#sd-framework">Framework</a><a href="01-foundations.html#fr-nfr">FR vs NFR</a><a href="01-foundations.html#scaling-basics">Scaling</a><a href="01-foundations.html#stateless-stateful">Stateless/Stateful</a><a href="01-foundations.html#serialization">Serialization</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--c)">2. Networking</h3><div class="lk">
    <a href="02-networking.html#osi">OSI Model</a><a href="02-networking.html#tcp-udp">TCP/UDP</a><a href="02-networking.html#http-https">HTTP/HTTPS</a><a href="02-networking.html#dns">DNS</a><a href="02-networking.html#networking-extras">IP/Ports/Firewall</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--r)">3. Security</h3><div class="lk">
    <a href="03-security.html#authentication">Auth</a><a href="03-security.html#authorization">AuthZ</a><a href="03-security.html#encryption">Encryption</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--p)">4. APIs &amp; Communication</h3>
    <div class="sg"><a href="04-apis.html#rest">REST</a><a href="04-apis.html#grpc">gRPC</a><a href="04-apis.html#graphql">GraphQL</a></div>
    <div class="sg"><a href="04-apis.html#async-apis">Async APIs</a><a href="04-apis.html#idempotent-apis">Idempotency</a><a href="04-apis.html#api-extras">Extras</a></div>
    <div class="sg"><a href="04-apis.html#realtime">WebSocket/SSE/Webhook</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--t)">5. Infrastructure</h3>
    <div class="sg"><a href="05-infrastructure.html#load-balancer">Load Balancer</a><a href="05-infrastructure.html#api-gateway">API Gateway</a><a href="05-infrastructure.html#proxy">Proxy</a></div>
    <div class="sg"><a href="05-infrastructure.html#nginx">NGINX</a><a href="05-infrastructure.html#docker-k8s">Docker/K8s</a><a href="05-infrastructure.html#service-mesh">Mesh</a></div>
    <div class="sg"><a href="05-infrastructure.html#multi-region">Multi-Region/Tenant</a><a href="05-infrastructure.html#infra-extras">Extras</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--g)">6. Storage Systems</h3>
    <div class="sg"><a href="06-storage.html#db-choice">DB Choice</a><a href="06-storage.html#db-internals">Internals</a><a href="06-storage.html#db-indexing">Indexing</a></div>
    <div class="sg"><a href="06-storage.html#sql">SQL</a><a href="06-storage.html#nosql">NoSQL</a><a href="06-storage.html#newsql">NewSQL</a><a href="06-storage.html#timeseries">TimeSeries</a></div>
    <div class="sg"><a href="06-storage.html#search">Search/ES</a><a href="06-storage.html#blob">Blob/S3</a><a href="06-storage.html#storage-extras">Extras</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--y)">7. Caching</h3>
    <div class="sg"><a href="07-caching.html#caching">Strategies</a><a href="07-caching.html#cdn">CDN</a></div>
    <div class="sg"><a href="07-caching.html#redis">Redis</a><a href="07-caching.html#redis-fast">Why Redis Fast</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--o)">8. Messaging</h3>
    <div class="sg"><a href="08-messaging.html#message-queues">Queues</a><a href="08-messaging.html#kafka">Kafka</a><a href="08-messaging.html#pubsub">Pub/Sub</a></div>
    <div class="sg"><a href="08-messaging.html#messaging-comparison">Queue vs Stream vs Pub/Sub</a><a href="08-messaging.html#messaging-extras">Extras</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--a)">9. Consistency</h3>
    <div class="sg"><a href="09-consistency.html#cap">CAP/PACELC</a><a href="09-consistency.html#consistency-models">Models</a><a href="09-consistency.html#consensus">Consensus</a></div>
    <div class="sg"><a href="09-consistency.html#transactions">Transactions</a><a href="09-consistency.html#concurrency">Concurrency</a><a href="09-consistency.html#consistency-extras">Extras</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--g)">10. Scalability</h3>
    <div class="sg"><a href="10-scalability.html#partitioning">Partitioning</a><a href="10-scalability.html#sharding">Sharding</a><a href="10-scalability.html#replication">Replication</a></div>
    <div class="sg"><a href="10-scalability.html#distributed-indexing">Dist. Indexing</a><a href="10-scalability.html#consistent-hashing">Consistent Hash</a><a href="10-scalability.html#bloom-filters">Bloom Filters</a><a href="10-scalability.html#rate-limiting">Rate Limiting</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--o)">11. Data Pipelines</h3>
    <div class="sg"><a href="11-data-pipelines.html#cdc">CDC</a><a href="11-data-pipelines.html#etl">ETL/ELT</a></div>
    <div class="sg"><a href="11-data-pipelines.html#stream-processing">Stream</a><a href="11-data-pipelines.html#batch-processing">Batch</a></div>
    <div class="sg"><a href="11-data-pipelines.html#data-warehouse">Warehouse</a><a href="11-data-pipelines.html#data-lakes">Lakehouse</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--a2)">12. Distributed Systems</h3>
    <div class="sg"><a href="12-distributed-systems.html#dist-patterns">Patterns</a><a href="12-distributed-systems.html#fault-tolerance">Fault Tolerance</a></div>
    <div class="sg"><a href="12-distributed-systems.html#zookeeper">ZooKeeper</a><a href="12-distributed-systems.html#gfs-hdfs">GFS/HDFS</a><a href="12-distributed-systems.html#bigtable">BigTable</a></div>
  </div>
  <div class="nc"><h3 style="color:var(--c)">13. Observability</h3><div class="lk">
    <a href="13-observability.html#logging">Logging</a><a href="13-observability.html#metrics">Metrics</a><a href="13-observability.html#tracing">Tracing</a><a href="13-observability.html#monitoring">Monitoring</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--y)">14. Key Numbers</h3><div class="lk">
    <a href="14-key-numbers.html#latency-numbers">Latency</a><a href="14-key-numbers.html#throughput-numbers">Throughput</a><a href="14-key-numbers.html#estimation">Estimation</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--t)">15. Decision Flowcharts</h3>
    <div class="sg"><a href="15-decision-flowcharts.html#api-choice">API</a><a href="15-decision-flowcharts.html#db-choice">Database</a><a href="15-decision-flowcharts.html#messaging-choice">Messaging</a><a href="15-decision-flowcharts.html#cache-choice">Cache</a><a href="15-decision-flowcharts.html#realtime-choice">Real-time</a><a href="15-decision-flowcharts.html#scaling-choice">Scaling</a><a href="15-decision-flowcharts.html#more-decisions">More</a></div>
  </div>
</div>`;

// Inject after .hero
const hero = document.querySelector('.hero');
if(hero){
  hero.insertAdjacentHTML('afterend', navHTML);
}

// Build search index from all nav links + page headings + page content
const entries = [];
// 1. Nav links (cross-page navigation)
document.querySelectorAll('#topicNav .nc').forEach(card => {
  const cat = card.querySelector('h3').textContent.trim();
  card.querySelectorAll('a').forEach(a => {
    entries.push({ text: a.textContent.trim(), href: a.getAttribute('href'), cat, type: 'nav' });
  });
});
// 2. On-page section headings
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.T').forEach(section => {
  const h2 = section.querySelector('h2');
  if(!h2) return;
  const id = section.id;
  if(!id) return;
  entries.push({ text: h2.textContent.trim(), href: page + '#' + id, cat: 'This page', type: 'heading' });
});
// 3. Full-text content index (on-page only) — index text blocks with their parent section
document.querySelectorAll('.T').forEach(section => {
  const h2 = section.querySelector('h2');
  const id = section.id;
  if(!h2 || !id) return;
  const sectionName = h2.textContent.trim();
  const href = page + '#' + id;
  // Index: callout boxes, table cells, list items, paragraphs, code blocks
  section.querySelectorAll('.b, li, p, .su, pre').forEach(el => {
    const txt = el.textContent.trim();
    if(txt.length < 4 || txt.length > 500) return;
    entries.push({ text: txt, href, cat: sectionName, type: 'content' });
  });
  // Index table rows as combined text (so "202" shows "202 Accepted (async)")
  section.querySelectorAll('tr').forEach(tr => {
    const txt = tr.textContent.trim().replace(/\s+/g, ' ');
    if(txt.length < 2 || txt.length > 300) return;
    entries.push({ text: txt, href, cat: sectionName, type: 'content' });
  });
});

const input = document.getElementById('globalSearch');
const resultsEl = document.getElementById('searchResults');
if(!input || !resultsEl) return;

input.addEventListener('input', function(){
  const q = this.value.toLowerCase().trim();
  if(!q || q.length < 2){ resultsEl.innerHTML=''; resultsEl.style.display='none'; return; }
  // Score and filter matches
  const scored = [];
  for(const e of entries){
    const t = e.text.toLowerCase();
    const idx = t.indexOf(q);
    if(idx === -1) continue;
    // Priority: nav > heading > content
    const priority = e.type === 'nav' ? 3 : e.type === 'heading' ? 2 : 1;
    scored.push({ ...e, priority, idx });
  }
  // Also match category name
  for(const e of entries){
    if(e.cat.toLowerCase().includes(q) && !scored.find(s => s.href === e.href && s.text === e.text)){
      scored.push({ ...e, priority: e.type === 'nav' ? 3 : 0, idx: 999 });
    }
  }
  // Sort: priority desc, then position of match
  scored.sort((a,b) => b.priority - a.priority || a.idx - b.idx);
  // Deduplicate by href (keep highest priority)
  const seen = new Set();
  const unique = [];
  for(const s of scored){
    const key = s.href + '|' + (s.type === 'content' ? s.text.slice(0,40) : s.text);
    if(!seen.has(key)){ seen.add(key); unique.push(s); }
  }
  if(!unique.length){
    resultsEl.innerHTML='<div class="sr-empty">No matches</div>';
    resultsEl.style.display='block';
    return;
  }
  resultsEl.innerHTML = unique.slice(0,15).map(m => {
    // For content matches, show a snippet with the match highlighted
    let display = m.text;
    if(m.type === 'content' && display.length > 80){
      const start = Math.max(0, m.idx - 30);
      display = (start > 0 ? '…' : '') + display.slice(start, start + 80) + '…';
    }
    const typeIcon = m.type === 'nav' ? '📑' : m.type === 'heading' ? '📌' : '📝';
    return `<a class="sr-item" href="${m.href}"><span class="sr-cat">${typeIcon} ${m.cat}</span><span class="sr-text">${display}</span></a>`;
  }).join('');
  resultsEl.style.display='block';
});

// Close on outside click
document.addEventListener('click', e => {
  if(!e.target.closest('#searchWrap')){ resultsEl.style.display='none'; }
});

// Keyboard: Escape closes, Enter goes to first result
input.addEventListener('keydown', e => {
  if(e.key==='Escape'){ resultsEl.style.display='none'; input.blur(); }
  if(e.key==='Enter'){
    const first = resultsEl.querySelector('.sr-item');
    if(first) window.location.href = first.getAttribute('href');
  }
});

// Highlight active module card based on current page
document.querySelectorAll('#topicNav .nc').forEach(card => {
  const links = card.querySelectorAll('a');
  for(const a of links){
    const href = a.getAttribute('href') || '';
    if(href.split('#')[0] === page || href.split('#')[0] === '' && page === 'index.html'){
      card.classList.add('active');
      break;
    }
  }
});
})();
