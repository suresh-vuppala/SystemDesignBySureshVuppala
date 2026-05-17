/* ═══ Real-Time Problems — Module Navigation (compact pills) ═══ */
(function(){
var page = location.pathname.split('/').pop() || 'index.html';
var isIndex = (page === 'index.html');

var modules = [
  {name:'1. Chat &amp; Messaging', href:'01-chat-messaging.html', anchor:'#mod-chat', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'2. Real-Time Collaboration', href:'02-collaboration.html', anchor:'#mod-collab', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'3. Video Streaming', href:'03-video-streaming.html', anchor:'#mod-video-stream', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'4. Video Calling / WebRTC', href:'04-video-calling.html', anchor:'#mod-video-call', bg:'rgba(244,114,182,.08)', border:'rgba(244,114,182,.2)', color:'var(--p)'},
  {name:'5. Ticket Booking', href:'05-ticket-booking.html', anchor:'#mod-tickets', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'6. Cache &amp; CDN', href:'06-cache-cdn.html', anchor:'#mod-cache', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'7. Queues &amp; Events', href:'07-queues-events.html', anchor:'#mod-queues', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'8. Feeds &amp; Recommendations', href:'08-social-media.html', anchor:'#mod-social', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'9. Geo, Rides &amp; Delivery', href:'09-geo-rideshare.html', anchor:'#mod-geo', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'},
  {name:'10. Payment Systems', href:'10-payments.html', anchor:'#mod-payments', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'11. API Gateway &amp; Backend', href:'11-api-gateway.html', anchor:'#mod-api', bg:'rgba(34,211,238,.08)', border:'rgba(34,211,238,.2)', color:'var(--c)'},
  {name:'12. Database &amp; Storage', href:'12-database-storage.html', anchor:'#mod-db', bg:'rgba(52,211,153,.08)', border:'rgba(52,211,153,.2)', color:'var(--g)'},
  {name:'13. Distributed Systems', href:'13-distributed-systems.html', anchor:'#mod-distributed', bg:'rgba(108,140,255,.08)', border:'rgba(108,140,255,.2)', color:'var(--a)'},
  {name:'14. Live Sports &amp; Broadcasting', href:'14-live-sports.html', anchor:'#mod-sports', bg:'rgba(248,113,113,.08)', border:'rgba(248,113,113,.2)', color:'var(--r)'},
  {name:'15. File Upload &amp; Media', href:'15-file-upload.html', anchor:'#mod-files', bg:'rgba(251,146,60,.08)', border:'rgba(251,146,60,.2)', color:'var(--o)'},
  {name:'16. Search Systems', href:'16-search-systems.html', anchor:'#mod-search', bg:'rgba(251,191,36,.08)', border:'rgba(251,191,36,.2)', color:'var(--y)'},
  {name:'17. Scheduling &amp; Calendar', href:'17-calendar.html', anchor:'#mod-calendar', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.2)', color:'var(--a2)'}
];

var pills = modules.map(function(m){
  var link = isIndex ? m.anchor : m.href;
  var active = (!isIndex && m.href === page);
  var style = 'padding:4px 10px;border-radius:5px;font-size:.75rem;font-weight:'+(active?'800':'600')+';text-decoration:none;'
    + 'background:'+(active ? m.bg.replace('.08','.2') : m.bg)+';'
    + 'border:1px solid '+(active ? m.color : m.border)+';'
    + 'color:'+m.color;
  return '<a href="'+link+'" style="'+style+'">'+m.name+'</a>';
}).join('');

var homeStyle = 'padding:4px 10px;border-radius:5px;font-size:.75rem;font-weight:'+(isIndex?'800':'600')+';text-decoration:none;'
  + 'background:'+(isIndex?'rgba(255,255,255,.08)':'rgba(255,255,255,.04)')+';'
  + 'border:1px solid var(--border);color:var(--muted)';
var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px auto 16px;max-width:900px;padding:0 12px">'
  + '<a href="index.html" style="'+homeStyle+'">⚡ All Modules</a>'
  + pills + '</div>';

var hero = document.querySelector('.hero');
if(hero) hero.insertAdjacentHTML('afterend', html);
})();
