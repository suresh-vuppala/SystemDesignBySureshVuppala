/* ═══ HelloSDE Premium — Google Auth + Razorpay ═══ 
   
   SETUP INSTRUCTIONS:
   1. Create Firebase project at https://console.firebase.google.com
   2. Enable Google Sign-In under Authentication → Sign-in method
   3. Create Razorpay account at https://razorpay.com
   4. Replace the config values below with your actual keys
   5. In Firebase Firestore, create collection "users" with doc per uid:
      { email, name, isPremium: true/false, purchasedAt, razorpayPaymentId }
*/

(function(){

// ═══ CONFIGURATION ═══
var CONFIG = {
  admin: false, // Set to true to bypass premium gates (for local testing). Set false for production.
  firebase: {
    apiKey: "AIzaSyAbwqzKR-23IPRJy_S4JbQ-_EYWb8mTAzo",
    authDomain: "varaq-gif.firebaseapp.com",
    databaseURL: "https://varaq-gif-default-rtdb.firebaseio.com",
    projectId: "varaq-gif",
    storageBucket: "varaq-gif.appspot.com",
    messagingSenderId: "350573799970",r
    appId: "1:350573799970:web:c68e797081eb3818aa787b",
    measurementId: "G-RZ951SNE5G"
  },
  razorpay: {
    key: "rzp_test_SuGvjQEQWWrIZ2",  // Razorpay Key ID (public, safe for frontend)
    amount: 250000,            // ₹2500 in paise
    currency: "INR",
    name: "HelloSDE",
    description: "Premium Access — Full System Design Content",
    theme: { color: "#6c8cff" }
  }
};

// ═══ FIREBASE INITIALIZATION ═══
var firebaseReady = false;
if(typeof firebase !== 'undefined'){
    try {
    if(!firebase.apps.length){
      firebase.initializeApp(CONFIG.firebase);
          } else {
          }
    firebaseReady = true;
  } catch(e){
        firebaseReady = false;
  }
} else {
  }

// ═══ STATE ═══
var state = {
  user: null,
  isPremium: false,
  loaded: false
};

// ═══ PREMIUM CONTENT DEFINITION ═══
// Pages/sections that require premium (section IDs within concept pages)
var PREMIUM_SECTIONS = {
  // Concepts: topics 10-15 are premium
  'scalability': ['consistent-hashing','bloom-filters','rate-limiting','backpressure','auto-scaling'],
  'data-pipelines': ['stream-processing','data-warehouse','data-lakes','data-lineage'],
  'distributed-systems': ['consensus','clocks','replication','partitioning','failure-detection'],
  'observability': ['opentelemetry','dashboards','incident-response'],
  'key-numbers': ['cost-numbers','sla-math','interview-reference'],
  'decision-flowcharts': ['more-decisions']
};

// Concept PAGES that are premium (topics 10-15)
var PREMIUM_CONCEPT_PAGES = [
  '10-scalability.html',
  '11-data-pipelines.html',
  '12-distributed-systems.html',
  '13-observability.html',
  '14-ai-systems.html',
  '15-key-numbers.html',
  '16-decision-flowcharts.html'
];

// Free problem pages — only pages that have actually been created (file exists on disk)
var FREE_PROBLEM_PAGES = [
  // Module 1: Chat & Messaging (first 7 free)
  'slack-real-time-messaging.html',
  'whatsapp-offline-delivery.html',
  'discord-websocket-infra.html',
  'multi-region-ordering.html',
  'telegram-large-group-fanout.html',
  'whatsapp-presence-100m.html',
  'slack-typing-indicators.html',
  // Modules 2-28: first problem only (the ones with full HTML)
  'google-docs-collaborative-editing.html',
  'netflix-adaptive-streaming.html',
  'zoom-300-person-meeting.html',
  'bookmyshow-concert-booking.html',
  'meta-tao-cache-invalidation.html',
  'uber-kafka-ride-events.html',
  'twitter-timeline-fanout.html',
  'uber-driver-matching.html',
  'stripe-idempotent-payments.html',
  'cloudflare-rate-limiting.html',
  'slack-vitess-sharding.html',
  'etcd-raft-consensus.html',
  'cricbuzz-live-scoring.html',
  'dropbox-sync-engine.html',
  'google-web-search.html',
  'google-calendar-recurrence.html',
  'uber-jaeger-distributed-tracing.html',
  'uber-michelangelo-ml-serving.html',
  'google-session-management.html',
  'bitly-url-shortener.html',
  'sendgrid-email-delivery.html',
  'meta-content-moderation.html',
  'launchdarkly-feature-flags.html',
  'google-web-crawler.html',
  'twitter-snowflake-ids.html',
  'google-ads-ranking.html',
  'github-actions-build-system.html'
];

// ═══ UI INJECTION ═══
function injectAuthUI(){
  var header = document.querySelector('.sh');
  if(!header) return;

  var authContainer = document.createElement('div');
  authContainer.id = 'auth-container';
  authContainer.style.cssText = 'display:flex;align-items:center;gap:8px;';

  if(state.user){
    var isPro = state.isPremium;
    authContainer.innerHTML = 
      (isPro ? '<span style="font-size:.65rem;padding:2px 8px;border-radius:4px;background:rgba(108,140,255,.15);color:var(--a);font-weight:700">PRO</span>' : '')
      + '<img src="'+state.user.photoURL+'" style="width:28px;height:28px;border-radius:50%;border:2px solid '+(isPro?'var(--a)':'var(--border)') +'" title="'+state.user.displayName+'">'
      + '<button id="auth-menu-btn" style="background:none;border:none;color:var(--muted);font-size:.75rem;cursor:pointer;padding:4px">▾</button>';
  } else {
    authContainer.innerHTML = 
      '<button id="google-signin-btn" style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:6px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .15s">'
      + '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>'
      + 'Sign in</button>';
  }

  // Insert into the .sh-right container
  var shRight = header.querySelector('.sh-right');
  if(shRight){
    shRight.appendChild(authContainer);
  } else {
    var toggle = header.querySelector('.sh-toggle');
    if(toggle){
      header.insertBefore(authContainer, toggle);
    } else {
      header.appendChild(authContainer);
    }
  }

  // Show/hide Premium button in header
  var premBtn = document.getElementById('sh-premium-btn');
  if(premBtn){
    if(!state.isPremium && !state.user){
      premBtn.style.display = '';
      premBtn.onclick = function(){ showPremiumPopup(); };
    } else if(!state.isPremium && state.user && !CONFIG.admin){
      premBtn.style.display = '';
      premBtn.onclick = function(){ showPremiumPopup(); };
    } else {
      premBtn.style.display = 'none';
    }
  }
}

// ═══ PREMIUM GATE UI — Lock + Popup ═══
function gatePremiumContent(){
  if(state.isPremium || CONFIG.admin) return; // Premium user or admin sees everything

  var page = location.pathname.split('/').pop() || 'index.html';
  
  // Gate sections within cheatsheet pages — hide content completely with a lock
  Object.keys(PREMIUM_SECTIONS).forEach(function(pageKey){
    PREMIUM_SECTIONS[pageKey].forEach(function(sectionId){
      var section = document.getElementById(sectionId);
      if(!section) return;
      
      // Hide the section content and show a locked placeholder
      section.style.position = 'relative';
      section.style.minHeight = '120px';
      section.style.overflow = 'hidden';
      
      // Hide all children
      Array.from(section.children).forEach(function(child){
        if(!child.classList.contains('premium-locked-overlay')){
          child.style.display = 'none';
        }
      });
      
      // Add locked overlay
      var overlay = document.createElement('div');
      overlay.className = 'premium-locked-overlay';
      overlay.innerHTML = 
        '<div class="premium-locked-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Premium</div>';
      overlay.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        showPremiumPopup();
      });
      section.appendChild(overlay);
    });
  });

  // Gate problems in index — lock rows whose links point to non-existent placeholder pages
  if(page === 'index.html' && location.pathname.indexOf('realtime-system-design-problems') !== -1){
    var tables = document.querySelectorAll('.T table');
    tables.forEach(function(table){
      var rows = table.querySelectorAll('tr');
      for(var i = 0; i < rows.length; i++){
        var row = rows[i];
        
        // Skip topic rows and header rows
        if(row.classList.contains('prob-topics-row') || row.querySelector('th')) continue;

        // Check if this row's link points to a free problem page
        var link = row.querySelector('td a');
        if(!link) continue;
        var href = link.getAttribute('href') || '';
        
        // Extract just the filename from the href for checking against FREE_PROBLEM_PAGES
        var filename = href.split('/').pop();
        var isFree = FREE_PROBLEM_PAGES.indexOf(filename) !== -1;
        if(isFree) continue;

        row.classList.add('premium-locked-row');
        row.style.cursor = 'pointer';

        // Remove links
        var links = row.querySelectorAll('a');
        links.forEach(function(a){
          a.removeAttribute('href');
          a.style.pointerEvents = 'none';
          a.style.color = 'var(--muted)';
        });

        // Hide the concepts row below it
        var nextRow = row.nextElementSibling;
        if(nextRow && nextRow.classList.contains('prob-topics-row')){
          nextRow.style.display = 'none';
        }

        // Replace # cell content with lock icon
        var firstCell = row.querySelector('td');
        if(firstCell && !firstCell.querySelector('.row-lock-icon')){
          firstCell.innerHTML = '<span class="row-lock-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>';
        }

        // Click to show premium popup
        (function(r){
          r.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            showPremiumPopup();
          });
        })(row);
      }
    });
  }

  // Gate concept navigation links (topics 10-15) in the cheatsheet nav
  gatePremiumConceptLinks();

  // Gate individual premium problem pages (direct URL access)
  gatePremiumProblemPage();

  // Gate individual premium concept pages (direct URL access)
  gatePremiumConceptPage();
}

// ═══ GATE INDIVIDUAL PROBLEM PAGES ═══
function gatePremiumProblemPage(){
  var page = location.pathname.split('/').pop() || '';
  // Only applies to problem HTML pages (not index)
  if(page === 'index.html' || page === '' || !page.endsWith('.html')) return;
  // Only in realtime-system-design-problems folder
  if(location.pathname.indexOf('realtime-system-design-problems') === -1) return;
  // Check if this page is in the free list
  if(FREE_PROBLEM_PAGES.indexOf(page) !== -1) return;
  // This is a premium problem page — block it
  blockPageContent();
}

// ═══ GATE INDIVIDUAL CONCEPT PAGES ═══
function gatePremiumConceptPage(){
  var page = location.pathname.split('/').pop() || '';
  if(location.pathname.indexOf('system-design-cheatsheet') === -1) return;
  if(PREMIUM_CONCEPT_PAGES.indexOf(page) === -1) return;
  // This is a premium concept page — block it
  blockPageContent();
}

// ═══ BLOCK PAGE CONTENT ═══
function blockPageContent(){
  // Hide the main content
  var ct = document.querySelector('.ct');
  if(ct) ct.style.display = 'none';

  // Create a full-page premium gate
  var gate = document.createElement('div');
  gate.className = 'premium-page-gate';
  gate.innerHTML = 
    '<div class="premium-page-gate-inner">'
    + '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--a);margin-bottom:16px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    + '<h2 style="font-size:1.3rem;font-weight:700;color:var(--text);margin:0 0 8px">Premium Content</h2>'
    + '<p style="font-size:.85rem;color:var(--muted);margin:0 0 20px;max-width:360px;line-height:1.5">This content is available for premium members. Unlock access to all 201 problems, 16 concept topics, and interview cheat sheets.</p>'
    + '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">'
    + (state.user 
      ? '<button onclick="window.HelloSDE.startPayment()" style="padding:12px 28px;border-radius:8px;border:none;background:var(--a);color:#fff;font-size:.85rem;font-weight:600;cursor:pointer">Unlock for ₹2,500</button>'
      : '<button onclick="window.HelloSDE.signIn()" style="padding:12px 28px;border-radius:8px;border:none;background:var(--a);color:#fff;font-size:.85rem;font-weight:600;cursor:pointer">Sign in to Unlock</button>')
    + '<a href="javascript:history.back()" style="padding:12px 28px;border-radius:8px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);font-size:.85rem;font-weight:500;text-decoration:none">Go Back</a>'
    + '</div>'
    + '</div>';

  // Insert after hero
  var hero = document.querySelector('.hero');
  if(hero){
    hero.insertAdjacentElement('afterend', gate);
  } else {
    document.body.insertAdjacentElement('afterbegin', gate);
  }
}

// ═══ LOCK CONCEPT NAV LINKS (Topics 10-15) ═══
function gatePremiumConceptLinks(){
  var navCards = document.querySelectorAll('#topicNav .nc');
  if(!navCards.length) return;

  navCards.forEach(function(card){
    var h3 = card.querySelector('h3');
    if(!h3) return;
    var title = h3.textContent.trim();
    
    // Check if this is a premium topic (10-15)
    var isPremiumTopic = false;
    PREMIUM_CONCEPT_PAGES.forEach(function(pageName){
      var num = pageName.split('-')[0]; // "10", "11", etc.
      if(title.indexOf(num + '.') === 0) isPremiumTopic = true;
    });
    
    if(!isPremiumTopic) return;

    // Add lock badge to the heading
    if(!h3.querySelector('.nav-lock-badge')){
      var badge = document.createElement('span');
      badge.className = 'nav-lock-badge';
      badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      h3.appendChild(badge);
    }

    // Intercept all links in this card
    var links = card.querySelectorAll('a');
    links.forEach(function(a){
      a.classList.add('premium-nav-link');
      a.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        showPremiumPopup();
      });
    });
  });
}

// ═══ PREMIUM POPUP ═══
function showPremiumPopup(){
  // Remove existing popup if any
  var existing = document.getElementById('premium-popup-overlay');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'premium-popup-overlay';
  overlay.innerHTML = 
    '<div class="premium-popup">'
    + '<button class="premium-popup-close" id="premium-popup-close">&times;</button>'
    + '<div class="premium-popup-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>'
    + '<h3 class="premium-popup-title">Premium Content</h3>'
    + '<p class="premium-popup-desc">This content is available exclusively for Premium members. Unlock access to:</p>'
    + '<ul class="premium-popup-features">'
    + '<li>✓ All 201 system design problems</li>'
    + '<li>✓ Advanced topics (Scalability, Data Pipelines, Distributed Systems, Observability)</li>'
    + '<li>✓ Key Numbers & Decision Flowcharts</li>'
    + '<li>✓ Interview cheat sheets & SVG animations</li>'
    + '<li>✓ All future updates included</li>'
    + '</ul>'
    + '<div class="premium-popup-price">₹2,500 <span>one-time payment</span></div>'
    + (state.user 
      ? '<button class="premium-popup-btn" id="premium-popup-buy">Unlock Premium Access</button>'
      : '<button class="premium-popup-btn" id="premium-popup-signin">Sign in with Google to Unlock</button>')
    + '</div>';
  
  document.body.appendChild(overlay);

  // Close handlers
  document.getElementById('premium-popup-close').addEventListener('click', function(){
    overlay.remove();
  });
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) overlay.remove();
  });

  // Action button
  if(state.user){
    document.getElementById('premium-popup-buy').addEventListener('click', function(){
      overlay.remove();
      window.HelloSDE.startPayment();
    });
  } else {
    document.getElementById('premium-popup-signin').addEventListener('click', function(){
      overlay.remove();
      window.HelloSDE.signIn();
    });
  }
}

// ═══ DROPDOWN MENU ═══
function setupSignInButton(){
  var btn = document.getElementById('google-signin-btn');
  if(btn){
    btn.addEventListener('click', function(){
      window.HelloSDE.signIn();
    });
  }
}

function setupAuthMenu(){
  document.addEventListener('click', function(e){
    if(e.target.id === 'auth-menu-btn'){
      var existing = document.getElementById('auth-dropdown');
      if(existing){ existing.remove(); return; }
      
      var dropdown = document.createElement('div');
      dropdown.id = 'auth-dropdown';
      dropdown.style.cssText = 'position:absolute;top:48px;right:24px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;min-width:180px;z-index:300;box-shadow:0 8px 24px rgba(0,0,0,.4)';
      
      var items = '<div style="padding:8px 12px;font-size:.78rem;color:var(--text);font-weight:600">'+state.user.displayName+'</div>'
        + '<div style="padding:4px 12px;font-size:.7rem;color:var(--muted)">'+state.user.email+'</div>'
        + '<hr style="border:none;border-top:1px solid var(--border);margin:8px 0">';
      
      if(state.isPremium){
        items += '<div style="padding:6px 12px;font-size:.75rem;color:var(--g)">✓ Premium Active</div>';
      } else {
        items += '<div style="padding:6px 12px"><button onclick="window.HelloSDE.startPayment()" style="width:100%;padding:8px;border-radius:6px;border:none;background:var(--a);color:#fff;font-size:.78rem;font-weight:600;cursor:pointer">Upgrade to Premium — ₹2,500</button></div>';
      }
      
      items += '<hr style="border:none;border-top:1px solid var(--border);margin:8px 0">'
        + '<button onclick="window.HelloSDE.signOut()" style="width:100%;padding:6px 12px;background:none;border:none;color:var(--r);font-size:.75rem;cursor:pointer;text-align:left">Sign Out</button>';
      
      dropdown.innerHTML = items;
      document.body.appendChild(dropdown);
    } else if(!e.target.closest('#auth-dropdown')){
      var dd = document.getElementById('auth-dropdown');
      if(dd) dd.remove();
    }
  });
}

// ═══ CSS INJECTION ═══
function injectStyles(){
  var style = document.createElement('style');
  style.textContent = 
    // Locked section overlay
    '.premium-locked-overlay{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(15,17,21,.92);border:1px dashed rgba(108,140,255,.3);border-radius:8px;cursor:pointer;transition:all .2s;z-index:10}'
    + '.premium-locked-overlay:hover{background:rgba(15,17,21,.85);border-color:var(--a)}'
    + '.premium-locked-badge{display:flex;align-items:center;gap:6px;font-size:.85rem;font-weight:600;color:var(--muted);padding:10px 20px;border-radius:8px;background:rgba(108,140,255,.08)}'
    + '.premium-locked-overlay:hover .premium-locked-badge{color:var(--a);background:rgba(108,140,255,.12)}'
    
    // Locked table rows
    + '.premium-locked-row{opacity:.45;cursor:pointer !important;transition:all .2s;position:relative}'
    + '.premium-locked-row:hover{opacity:.65;background:rgba(108,140,255,.03)}'
    + '.premium-locked-row td{position:relative}'
    + '.premium-locked-row td:first-child{text-align:center}'
    + '.premium-locked-row td:first-child::before{content:none !important}'
    + '.row-lock-icon{color:var(--muted,#888);display:inline-flex;align-items:center;opacity:.7}'
    + '.premium-locked-row:hover .row-lock-icon{color:var(--a);opacity:1}'
    
    // Nav lock badge
    + '.nav-lock-badge{margin-left:6px;vertical-align:middle;color:var(--muted,#888);display:inline-flex}'
    + '.premium-nav-link{opacity:.6;cursor:pointer !important;position:relative}'
    + '.premium-nav-link:hover{opacity:.8}'
    
    // Popup overlay
    + '#premium-popup-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;backdrop-filter:blur(4px)}'
    + '.premium-popup{position:relative;background:var(--card,#1a1d23);border:1px solid var(--border,#2a2d35);border-radius:16px;padding:40px 32px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:popupIn .2s ease-out}'
    + '@keyframes popupIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}'
    + '.premium-popup-close{position:absolute;top:12px;right:16px;background:none;border:none;color:var(--muted,#888);font-size:1.5rem;cursor:pointer;padding:4px 8px;border-radius:4px;transition:color .15s}'
    + '.premium-popup-close:hover{color:var(--text,#fff)}'
    + '.premium-popup-icon{margin-bottom:12px;color:var(--muted,#888)}'
    + '.premium-popup-title{font-size:1.3rem;font-weight:700;color:var(--text,#fff);margin:0 0 8px}'
    + '.premium-popup-desc{font-size:.85rem;color:var(--muted,#888);line-height:1.5;margin:0 0 16px}'
    + '.premium-popup-features{list-style:none;padding:0;margin:0 0 20px;text-align:left}'
    + '.premium-popup-features li{font-size:.8rem;color:var(--text-2,#ccc);padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)}'
    + '.premium-popup-features li:last-child{border-bottom:none}'
    + '.premium-popup-price{font-size:1.4rem;font-weight:800;color:var(--a,#6c8cff);margin-bottom:20px}'
    + '.premium-popup-price span{font-size:.75rem;font-weight:400;color:var(--muted,#888);margin-left:4px}'
    + '.premium-popup-btn{width:100%;padding:14px 24px;border-radius:10px;border:none;background:var(--a,#6c8cff);color:#fff;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .15s}'
    + '.premium-popup-btn:hover{background:var(--a2,#8ba4ff);transform:translateY(-1px)}'
    
    // Sign-in button hover
    + '#google-signin-btn:hover{background:rgba(255,255,255,.08);border-color:var(--a)}'
    
    // Full page premium gate
    + '.premium-page-gate{display:flex;align-items:center;justify-content:center;min-height:60vh;padding:48px 24px;text-align:center}'
    + '.premium-page-gate-inner{max-width:440px}';
  document.head.appendChild(style);
}

// ═══ PUBLIC API ═══
window.HelloSDE = {
  signIn: function(){
    // Firebase Google Sign-In
    if(!firebaseReady){
      alert('Firebase not loaded. Please refresh the page.');
      return;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result){
      console.log('Signed in:', result.user.email);
      // Set session cookie for Vercel middleware
      result.user.getIdToken().then(function(token){
        document.cookie = 'hellosde_session=' + token + ';path=/;max-age=3600;SameSite=Lax';
        location.reload();
      });
    }).catch(function(err){
      // Don't show alert if user just closed the popup
      if(err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      alert('Sign-in failed: ' + err.message);
    });
  },

  signOut: function(){
    if(typeof firebase !== 'undefined'){
      firebase.auth().signOut().then(function(){
        localStorage.removeItem('hellosde_premium_cache');
        document.cookie = 'hellosde_session=;path=/;max-age=0';
        location.reload();
      });
    }
  },

  startPayment: function(){
    if(!state.user){
      window.HelloSDE.signIn();
      return;
    }
    
    if(typeof Razorpay === 'undefined'){
      alert('Payment system not loaded. Please refresh the page.');
      return;
    }

    // Step 1: Create order via backend
    fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: CONFIG.razorpay.amount,
        currency: CONFIG.razorpay.currency,
        receipt: 'hsde_' + Date.now(),
        notes: { uid: state.user.uid, email: state.user.email }
      })
    })
    .then(function(res){ return res.json(); })
    .then(function(order){
      if(!order.order_id){
        alert('Failed to create order. Please try again.');
        return;
      }

      // Step 2: Open Razorpay checkout modal
      var options = {
        key: CONFIG.razorpay.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: CONFIG.razorpay.name,
        description: CONFIG.razorpay.description,
        prefill: {
          email: state.user.email,
          name: state.user.displayName
        },
        notes: { uid: state.user.uid },
        theme: CONFIG.razorpay.theme,
        handler: function(response){
          // Step 3: Verify payment signature via backend
          fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          })
          .then(function(res){ return res.json(); })
          .then(function(result){
            if(result.verified){
              // Payment verified — mark user as premium in Firestore
              if(firebaseReady && firebase.firestore){
                firebase.firestore().collection('users').doc(state.user.uid).set({
                  email: state.user.email,
                  name: state.user.displayName,
                  isPremium: true,
                  purchasedAt: new Date().toISOString(),
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id
                }, {merge: true}).then(function(){
                  localStorage.setItem('hellosde_premium_cache', JSON.stringify({uid:state.user.uid,v:true,ts:Date.now()}));
                  alert('🎉 Welcome to Premium! Refreshing...');
                  location.reload();
                });
              }
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          })
          .catch(function(){
            alert('Payment verification error. Please contact support.');
          });
        },
        modal: {
          ondismiss: function(){
            // User closed the modal without paying
          }
        }
      };

      var rzp = new Razorpay(options);
      rzp.on('payment.failed', function(response){
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    })
    .catch(function(err){
      alert('Error starting payment. Please try again.');
    });
  },

  // Check premium status
  checkPremium: function(user){
    // Check localStorage cache (valid for 1 hour only, tied to user)
    var cached = localStorage.getItem('hellosde_premium_cache');
    if(cached){
      try {
        var data = JSON.parse(cached);
        var age = Date.now() - data.ts;
        if(data.uid === user.uid && data.v === true && age < 432000000){ // 5 days
          state.isPremium = true;
          return Promise.resolve(true);
        }
      } catch(e){}
      // Expired or invalid — clear it
      localStorage.removeItem('hellosde_premium_cache');
    }
    
    // Always verify from Firestore
    if(firebaseReady && firebase.firestore && user){
      return firebase.firestore().collection('users').doc(user.uid).get()
        .then(function(doc){
          if(doc.exists && doc.data().isPremium){
            state.isPremium = true;
            // Cache for 1 hour, tied to this user's UID
            localStorage.setItem('hellosde_premium_cache', JSON.stringify({
              uid: user.uid,
              v: true,
              ts: Date.now()
            }));
            return true;
          }
          localStorage.removeItem('hellosde_premium_cache');
          return false;
        }).catch(function(){
          localStorage.removeItem('hellosde_premium_cache');
          return false;
        });
    }
    return Promise.resolve(false);
  }
};

// ═══ INITIALIZATION ═══
function init(){
    injectStyles();
  
  // Check if Firebase is loaded and initialized
  if(firebaseReady && firebase.auth){
        firebase.auth().onAuthStateChanged(function(user){
            state.user = user;
      if(user){
        // Refresh session cookie for Vercel middleware
        user.getIdToken().then(function(token){
          document.cookie = 'hellosde_session=' + token + ';path=/;max-age=3600;SameSite=Lax';
        });
        window.HelloSDE.checkPremium(user).then(function(){
          injectAuthUI();
          setupAuthMenu();
          gatePremiumContent();
        });
      } else {
        localStorage.removeItem('hellosde_premium_cache');
        state.isPremium = false;
        injectAuthUI();
        setupSignInButton();
        gatePremiumContent();
      }
    });
  } else {
    // Firebase not loaded — use localStorage fallback
        state.isPremium = false /* always verify from Firestore */;
    injectAuthUI();
    setupAuthMenu();
    gatePremiumContent();
  }
}

// Run after DOM ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
