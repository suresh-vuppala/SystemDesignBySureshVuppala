/* ═══ HelloSDE — Live Course Chat Widget ═══ */
/* DISABLED — will enable in future */
(function(){
return; // disabled

var COURSE_MESSAGE = `🎓 *System Design Live Course*

Hey! 👋 Thanks for checking out HelloSDE.

We're running a *live cohort-based course* on System Design for Senior/Staff engineers.

📋 *What's included:*
• 8 weeks of live sessions (weekends)
• 20+ system design problems solved live
• Mock interviews with feedback
• Private community access
• Lifetime recording access
• Certificate of completion

🎯 *Who is this for:*
• Engineers targeting L5/L6/Staff roles
• FAANG/MAANG interview prep
• 3+ years experience required

💰 *Investment:* ₹2,500 (one-time)
🗓️ *Next batch:* Starting soon

📌 *Topics covered:*
Distributed Systems, Kafka, Sharding, Caching, Load Balancing, Microservices, Real-time Systems, and more.

---
Interested? Type your email below and we'll send you the details! 👇`;

function init(){
  injectStyles();
  injectWidget();
}

function injectStyles(){
  var style = document.createElement('style');
  style.textContent = `
.lc-fab{position:fixed;bottom:24px;right:24px;z-index:500;display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:50px;background:var(--card);color:var(--g);font-size:.72rem;font-weight:600;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2);transition:all .2s;border:1px solid rgba(37,211,102,.3);font-family:inherit}
.lc-fab:hover{transform:scale(1.03);background:var(--card-2);border-color:var(--g)}
.lc-fab .lc-rec{width:10px;height:10px;border-radius:50%;background:#ff3b3b;animation:lcPulse 1.5s infinite}
@keyframes lcPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}

.lc-chat{position:fixed;bottom:80px;right:24px;z-index:501;width:320px;max-width:calc(100vw - 48px);height:420px;max-height:calc(100vh - 120px);border-radius:12px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5);display:none;flex-direction:column;animation:lcSlideUp .25s ease}
@keyframes lcSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.lc-chat.open{display:flex}

.lc-chat-header{background:#075E54;padding:12px 16px;display:flex;align-items:center;gap:10px}
.lc-chat-avatar{width:36px;height:36px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:1rem}
.lc-chat-info{flex:1}
.lc-chat-name{color:#fff;font-size:.85rem;font-weight:700}
.lc-chat-status{color:rgba(255,255,255,.7);font-size:.7rem}
.lc-chat-close{background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;padding:4px 8px}

.lc-chat-body{flex:1;background:#0b141a;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L30 12 L25 15Z' fill='%23ffffff' opacity='.02'/%3E%3C/svg%3E");padding:16px;overflow-y:auto}

.lc-msg{background:#1f2c34;border-radius:0 8px 8px 8px;padding:10px 12px;margin-bottom:8px;max-width:90%;font-size:.78rem;color:#e9edef;line-height:1.6;white-space:pre-wrap;word-wrap:break-word}
.lc-msg-time{text-align:right;font-size:.6rem;color:rgba(255,255,255,.4);margin-top:4px}

.lc-chat-footer{background:#1f2c34;padding:8px 12px;display:flex;align-items:center;gap:8px;border-top:1px solid rgba(255,255,255,.06)}
.lc-input{flex:1;background:#2a3942;border:none;border-radius:20px;padding:10px 16px;color:#e9edef;font-size:.8rem;outline:none;font-family:inherit}
.lc-input::placeholder{color:rgba(255,255,255,.4)}
.lc-send{background:#25D366;border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.lc-send:hover{background:#20c05c}
.lc-send svg{width:18px;height:18px;fill:#fff}

@media(max-width:400px){.lc-chat{bottom:0;right:0;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0}}
`;
  document.head.appendChild(style);
}

function injectWidget(){
  // FAB button
  var fab = document.createElement('button');
  fab.className = 'lc-fab';
  fab.innerHTML = '<span class="lc-rec"></span> Live Course';
  document.body.appendChild(fab);

  // Chat window
  var chat = document.createElement('div');
  chat.className = 'lc-chat';
  chat.innerHTML = `
    <div class="lc-chat-header">
      <div class="lc-chat-avatar">🎓</div>
      <div class="lc-chat-info">
        <div class="lc-chat-name">HelloSDE Course</div>
        <div class="lc-chat-status">● online</div>
      </div>
      <button class="lc-chat-close" id="lc-close">✕</button>
    </div>
    <div class="lc-chat-body" id="lc-body">
      <div class="lc-msg">${formatMessage(COURSE_MESSAGE)}<div class="lc-msg-time">${getTime()}</div></div>
    </div>
    <div class="lc-chat-footer">
      <input class="lc-input" id="lc-input" type="text" placeholder="Type your email or message...">
      <button class="lc-send" id="lc-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
    </div>
  `;
  document.body.appendChild(chat);

  // Events
  fab.addEventListener('click', function(){
    chat.classList.toggle('open');
    if(chat.classList.contains('open')){
      var body = document.getElementById('lc-body');
      body.scrollTop = body.scrollHeight;
    }
  });

  document.getElementById('lc-close').addEventListener('click', function(){
    chat.classList.remove('open');
  });

  document.getElementById('lc-send').addEventListener('click', sendMessage);
  document.getElementById('lc-input').addEventListener('keydown', function(e){
    if(e.key === 'Enter') sendMessage();
  });

  // Close on outside click
  document.addEventListener('mousedown', function(e){
    if(!chat.contains(e.target) && !fab.contains(e.target)){
      chat.classList.remove('open');
    }
  });
}

// ═══ CONFIG ═══
var WHATSAPP_NUMBER = '919XXXXXXXXX'; // Replace with your number

function sendMessage(){
  var input = document.getElementById('lc-input');
  var text = input.value.trim();
  if(!text) return;

  var body = document.getElementById('lc-body');

  // User message
  var userMsg = document.createElement('div');
  userMsg.style.cssText = 'background:#005c4b;border-radius:8px 0 8px 8px;padding:10px 12px;margin-bottom:8px;max-width:80%;margin-left:auto;font-size:.78rem;color:#e9edef;line-height:1.5';
  userMsg.innerHTML = text + '<div class="lc-msg-time" style="color:rgba(255,255,255,.5)">' + getTime() + ' ✓✓</div>';
  body.appendChild(userMsg);
  input.value = '';
  body.scrollTop = body.scrollHeight;

  // Save to Firestore (if available)
  if(typeof firebase !== 'undefined' && firebase.firestore){
    firebase.firestore().collection('course_leads').add({
      message: text,
      timestamp: new Date().toISOString(),
      page: location.href
    }).catch(function(){});
  }

  // Reply
  setTimeout(function(){
    var reply = document.createElement('div');
    reply.className = 'lc-msg';
    var replyText;
    if(isEmail(text)){
      replyText = "Thanks! 🎉 We've noted your email.\n\nOur team will reach out within 24 hours with course details, schedule, and payment link.\n\nMeanwhile, explore the free content! 👆";
    } else if(isPhone(text)){
      replyText = "Got it! 📱 We'll WhatsApp you the course details shortly.\n\nExpect a message within a few hours.";
    } else {
      replyText = "Thanks for your interest! 🙌\n\nPlease share your *email* or *phone number* and we'll send you the complete course details.";
    }
    reply.innerHTML = formatMessage(replyText) + '<div class="lc-msg-time">' + getTime() + '</div>';
    body.appendChild(reply);
    body.scrollTop = body.scrollHeight;
  }, 800);
}

function formatMessage(text){
  // Bold: *text* → <strong>
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

function getTime(){
  var now = new Date();
  return now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}

function isEmail(text){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function isPhone(text){
  return /^[\+]?[\d\s\-]{8,15}$/.test(text.replace(/\s/g,''));
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
