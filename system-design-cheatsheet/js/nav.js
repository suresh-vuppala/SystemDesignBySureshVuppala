(function(){
const navHTML = `
<div class="search-wrap" id="searchWrap">
  <input type="text" id="globalSearch" class="search-box" placeholder="Search topics… (e.g. Kafka, CAP, Redis, JWT)" autocomplete="off" aria-label="Search topics">
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
  <div class="nc"><h3 style="color:var(--p)">4. APIs</h3><div class="lk">
    <a href="04-apis.html#rest">REST</a><a href="04-apis.html#grpc">gRPC</a><a href="04-apis.html#graphql">GraphQL</a><a href="04-apis.html#api-extras">SOAP/Idempotency</a><a href="04-apis.html#realtime">Real-time</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--t)">5. Infrastructure</h3><div class="lk">
    <a href="05-infrastructure.html#load-balancer">LB</a><a href="05-infrastructure.html#api-gateway">API Gateway</a><a href="05-infrastructure.html#proxy">Proxy</a><a href="05-infrastructure.html#nginx">NGINX</a><a href="05-infrastructure.html#docker-k8s">Docker/K8s</a><a href="05-infrastructure.html#service-mesh">Mesh</a><a href="05-infrastructure.html#multi-region">Multi-Region</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--g)">6. Storage</h3><div class="lk">
    <a href="06-storage.html#db-choice">DB Choice</a><a href="06-storage.html#db-internals">Internals</a><a href="06-storage.html#sql">SQL</a><a href="06-storage.html#nosql">NoSQL</a><a href="06-storage.html#newsql">NewSQL</a><a href="06-storage.html#timeseries">TimeSeries</a><a href="06-storage.html#search">Search</a><a href="06-storage.html#blob">Blob</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--y)">7. Caching</h3><div class="lk">
    <a href="07-caching.html#caching">Strategies</a><a href="07-caching.html#redis">Redis</a><a href="07-caching.html#cdn">CDN</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--o)">8. Messaging</h3><div class="lk">
    <a href="08-messaging.html#message-queues">Queues</a><a href="08-messaging.html#kafka">Kafka</a><a href="08-messaging.html#pubsub">Pub/Sub</a><a href="08-messaging.html#messaging-comparison">Queue vs Stream vs Pub/Sub</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--a)">9. Consistency</h3><div class="lk">
    <a href="09-consistency.html#cap">CAP</a><a href="09-consistency.html#consistency-models">Models</a><a href="09-consistency.html#consensus">Consensus</a><a href="09-consistency.html#transactions">Transactions</a><a href="09-consistency.html#concurrency">Concurrency</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--g)">10. Scalability</h3><div class="lk">
    <a href="10-scalability.html#partitioning">Partitioning</a><a href="10-scalability.html#replication">Replication</a><a href="10-scalability.html#sharding">Sharding</a><a href="10-scalability.html#consistent-hashing">Consistent Hash</a><a href="10-scalability.html#bloom-filters">Bloom Filters</a><a href="10-scalability.html#rate-limiting">Rate Limiting</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--o)">11. Data Pipelines</h3><div class="lk">
    <a href="11-data-pipelines.html#cdc">CDC</a><a href="11-data-pipelines.html#etl">ETL</a><a href="11-data-pipelines.html#stream-processing">Stream</a><a href="11-data-pipelines.html#batch-processing">Batch</a><a href="11-data-pipelines.html#data-warehouse">Warehouse</a><a href="11-data-pipelines.html#data-lakes">Lakehouse</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--a2)">12. Distributed Systems</h3><div class="lk">
    <a href="12-distributed-systems.html#dist-patterns">Patterns</a><a href="12-distributed-systems.html#zookeeper">ZooKeeper</a><a href="12-distributed-systems.html#gfs-hdfs">GFS/HDFS</a><a href="12-distributed-systems.html#bigtable">BigTable</a><a href="12-distributed-systems.html#fault-tolerance">Fault Tolerance</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--c)">13. Observability</h3><div class="lk">
    <a href="13-observability.html#logging">Logging</a><a href="13-observability.html#metrics">Metrics</a><a href="13-observability.html#tracing">Tracing</a><a href="13-observability.html#monitoring">Monitoring</a>
  </div></div>
  <div class="nc"><h3 style="color:var(--y)">14. Key Numbers</h3><div class="lk">
    <a href="14-key-numbers.html#latency-numbers">Latency</a><a href="14-key-numbers.html#throughput-numbers">Throughput</a><a href="14-key-numbers.html#estimation">Estimation</a>
  </div></div>
</div>`;

// Inject after .hero
const hero = document.querySelector('.hero');
if(hero){
  hero.insertAdjacentHTML('afterend', navHTML);
}

// Build search index from all nav links + page headings
const entries = [];
document.querySelectorAll('#topicNav .nc').forEach(card => {
  const cat = card.querySelector('h3').textContent.trim();
  card.querySelectorAll('.lk a').forEach(a => {
    entries.push({ text: a.textContent.trim(), href: a.getAttribute('href'), cat });
  });
});
// Also index on-page section headings (.T h2)
document.querySelectorAll('.T').forEach(section => {
  const h2 = section.querySelector('h2');
  if(!h2) return;
  const id = section.id;
  if(!id) return;
  const page = location.pathname.split('/').pop() || 'index.html';
  entries.push({ text: h2.textContent.trim(), href: page + '#' + id, cat: 'This page', local: true });
});

const input = document.getElementById('globalSearch');
const resultsEl = document.getElementById('searchResults');
if(!input || !resultsEl) return;

input.addEventListener('input', function(){
  const q = this.value.toLowerCase().trim();
  if(!q){ resultsEl.innerHTML=''; resultsEl.style.display='none'; return; }
  const matches = entries.filter(e => e.text.toLowerCase().includes(q) || e.cat.toLowerCase().includes(q));
  if(!matches.length){
    resultsEl.innerHTML='<div class="sr-empty">No matches</div>';
    resultsEl.style.display='block';
    return;
  }
  resultsEl.innerHTML = matches.slice(0,12).map(m =>
    `<a class="sr-item" href="${m.href}"><span class="sr-cat">${m.cat}</span><span class="sr-text">${m.text}</span></a>`
  ).join('');
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
})();
