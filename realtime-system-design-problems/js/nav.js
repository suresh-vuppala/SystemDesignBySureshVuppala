(function(){
const navHTML = `
<div class="ng" id="topicNav">
  <div class="nc"><h3>💬 Chat & Messaging</h3><div class="lk">
    <a href="01-chat-messaging.html#slack-10b">Slack 10B msgs/day</a><a href="01-chat-messaging.html#whatsapp-offline">WhatsApp offline delivery</a><a href="01-chat-messaging.html#discord-websockets">Discord WebSockets</a><a href="01-chat-messaging.html#multi-region-ordering">Multi-region ordering</a><a href="01-chat-messaging.html#large-group-fanout">1M member groups</a><a href="01-chat-messaging.html#presence-100m">Presence 100M users</a><a href="01-chat-messaging.html#typing-indicators">Typing indicators</a><a href="01-chat-messaging.html#chat-search">Search billions msgs</a><a href="01-chat-messaging.html#push-notifications">Push notifications</a><a href="01-chat-messaging.html#telegram-sync">Telegram multi-device</a>
  </div></div>
  <div class="nc"><h3>✏️ Real-Time Collaboration</h3><div class="lk">
    <a href="02-collaboration.html">7 Problems</a>
  </div></div>
  <div class="nc"><h3>📹 Video Streaming</h3><div class="lk">
    <a href="03-video-streaming.html">8 Problems</a>
  </div></div>
  <div class="nc"><h3>🎥 Video Calling / WebRTC</h3><div class="lk">
    <a href="04-video-calling.html">6 Problems</a>
  </div></div>
  <div class="nc"><h3>🎟️ Ticket Booking</h3><div class="lk">
    <a href="05-ticket-booking.html">7 Problems</a>
  </div></div>
  <div class="nc"><h3>⚡ Cache & CDN</h3><div class="lk">
    <a href="06-cache-cdn.html">7 Problems</a>
  </div></div>
  <div class="nc"><h3>📨 Queues & Events</h3><div class="lk">
    <a href="07-queues-events.html">8 Problems</a>
  </div></div>
  <div class="nc"><h3>📱 Social Media Feeds</h3><div class="lk">
    <a href="08-social-media.html">8 Problems</a>
  </div></div>
  <div class="nc"><h3>🗺️ Geo & Ride Sharing</h3><div class="lk">
    <a href="09-geo-rideshare.html">7 Problems</a>
  </div></div>
  <div class="nc"><h3>💳 Payment Systems</h3><div class="lk">
    <a href="10-payments.html">7 Problems</a>
  </div></div>
  <div class="nc"><h3>🚪 API Gateway & Backend</h3><div class="lk">
    <a href="11-api-gateway.html">8 Problems</a>
  </div></div>
  <div class="nc"><h3>🗄️ Database & Storage</h3><div class="lk">
    <a href="12-database-storage.html">10 Problems</a>
  </div></div>
  <div class="nc"><h3>🔗 Distributed Systems</h3><div class="lk">
    <a href="13-distributed-systems.html">7 Problems</a>
  </div></div>
</div>`;

const hero = document.querySelector('.hero');
if(hero){
  hero.insertAdjacentHTML('afterend', navHTML);
}

// Highlight active module
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('#topicNav .nc').forEach(card => {
  const links = card.querySelectorAll('a');
  for(const a of links){
    const href = a.getAttribute('href') || '';
    if(href.split('#')[0] === page){
      card.classList.add('active');
      break;
    }
  }
});
})();
