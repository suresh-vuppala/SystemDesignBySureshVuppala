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

// ═══ CONFIGURATION — Replace with your actual keys ═══
var CONFIG = {
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  razorpay: {
    key: "rzp_live_YOUR_KEY",  // or rzp_test_ for testing
    amount: 250000,            // ₹2500 in paise
    currency: "INR",
    name: "HelloSDE",
    description: "Premium Access — Full System Design Content",
    theme: { color: "#6c8cff" }
  }
};

// ═══ STATE ═══
var state = {
  user: null,
  isPremium: false,
  loaded: false
};

// ═══ PREMIUM CONTENT DEFINITION ═══
// Pages/sections that require premium
var PREMIUM_SECTIONS = {
  // Concepts: topics 10-15 are premium
  'scalability': ['consistent-hashing','bloom-filters','rate-limiting','backpressure','auto-scaling'],
  'data-pipelines': ['stream-processing','data-warehouse','data-lakes','data-lineage'],
  'distributed-systems': ['consensus','clocks','replication','partitioning','failure-detection'],
  'observability': ['opentelemetry','dashboards','incident-response'],
  'key-numbers': ['cost-numbers','sla-math','interview-reference'],
  'decision-flowcharts': ['more-decisions']
};

// Problem pages: problems 6+ in each module are premium
var PREMIUM_PROBLEM_INDEX = 5; // 0-indexed: first 5 free, rest premium

// ═══ UI INJECTION ═══
function injectAuthUI(){
  var header = document.querySelector('.sh');
  if(!header) return;

  var authContainer = document.createElement('div');
  authContainer.id = 'auth-container';
  authContainer.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:auto;';

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

  // Insert before the toggle button or at end of header
  var toggle = header.querySelector('.sh-toggle');
  if(toggle){
    header.insertBefore(authContainer, toggle);
  } else {
    header.appendChild(authContainer);
  }
}

// ═══ PREMIUM GATE UI ═══
function gatePremiumContent(){
  if(state.isPremium) return; // Premium user sees everything

  var page = location.pathname.split('/').pop() || 'index.html';
  
  // Gate sections within cheatsheet pages
  Object.keys(PREMIUM_SECTIONS).forEach(function(pageKey){
    PREMIUM_SECTIONS[pageKey].forEach(function(sectionId){
      var section = document.getElementById(sectionId);
      if(!section) return;
      
      section.style.position = 'relative';
      section.style.overflow = 'hidden';
      section.style.maxHeight = '200px';
      
      var overlay = document.createElement('div');
      overlay.className = 'premium-gate';
      overlay.innerHTML = 
        '<div class="premium-gate-inner">'
        + '<div class="premium-lock">🔒</div>'
        + '<div class="premium-title">Premium Content</div>'
        + '<div class="premium-desc">Unlock full access to all 201 problems, advanced topics, and interview cheat sheets</div>'
        + (state.user 
          ? '<button class="premium-buy-btn" onclick="window.HelloSDE.startPayment()">Unlock for ₹2,500</button>'
          : '<button class="premium-buy-btn" onclick="window.HelloSDE.signIn()">Sign in to Unlock</button>')
        + '</div>';
      section.appendChild(overlay);
    });
  });

  // Gate problems in index (problems 6+ in each module table)
  if(page === 'index.html' && location.pathname.indexOf('realtime-system-design-problems') !== -1){
    var tables = document.querySelectorAll('.T table');
    tables.forEach(function(table){
      var rows = table.querySelectorAll('tr');
      for(var i = PREMIUM_PROBLEM_INDEX + 1; i < rows.length; i++){ // +1 for header row
        rows[i].style.filter = 'blur(3px)';
        rows[i].style.pointerEvents = 'none';
        rows[i].style.userSelect = 'none';
      }
    });
  }
}

// ═══ DROPDOWN MENU ═══
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
    '.premium-gate{position:absolute;bottom:0;left:0;right:0;height:100%;display:flex;align-items:flex-end;justify-content:center;background:linear-gradient(to bottom,transparent 0%,var(--bg) 60%);z-index:10;padding-bottom:20px}'
    + '.premium-gate-inner{text-align:center;padding:16px}'
    + '.premium-lock{font-size:1.5rem;margin-bottom:6px}'
    + '.premium-title{font-size:.9rem;font-weight:700;color:var(--text);margin-bottom:4px}'
    + '.premium-desc{font-size:.75rem;color:var(--muted);margin-bottom:12px;max-width:300px}'
    + '.premium-buy-btn{padding:10px 24px;border-radius:8px;border:none;background:var(--a);color:#fff;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s}'
    + '.premium-buy-btn:hover{background:var(--a2);transform:translateY(-1px)}'
    + '#google-signin-btn:hover{background:rgba(255,255,255,.08);border-color:var(--a)}';
  document.head.appendChild(style);
}

// ═══ PUBLIC API ═══
window.HelloSDE = {
  signIn: function(){
    // Firebase Google Sign-In
    if(typeof firebase === 'undefined'){
      alert('Firebase not loaded. Add Firebase SDK to your page.');
      return;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result){
      console.log('Signed in:', result.user.email);
      location.reload();
    }).catch(function(err){
      console.error('Sign-in error:', err);
      alert('Sign-in failed: ' + err.message);
    });
  },

  signOut: function(){
    if(typeof firebase !== 'undefined'){
      firebase.auth().signOut().then(function(){
        localStorage.removeItem('hellosde_premium');
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
      alert('Razorpay not loaded. Add Razorpay script to your page.');
      return;
    }

    var options = {
      key: CONFIG.razorpay.key,
      amount: CONFIG.razorpay.amount,
      currency: CONFIG.razorpay.currency,
      name: CONFIG.razorpay.name,
      description: CONFIG.razorpay.description,
      prefill: {
        email: state.user.email,
        name: state.user.displayName
      },
      theme: CONFIG.razorpay.theme,
      handler: function(response){
        // Payment successful — mark user as premium
        console.log('Payment success:', response.razorpay_payment_id);
        
        // Save to Firestore
        if(typeof firebase !== 'undefined' && firebase.firestore){
          firebase.firestore().collection('users').doc(state.user.uid).set({
            email: state.user.email,
            name: state.user.displayName,
            isPremium: true,
            purchasedAt: new Date().toISOString(),
            razorpayPaymentId: response.razorpay_payment_id
          }, {merge: true}).then(function(){
            localStorage.setItem('hellosde_premium', 'true');
            alert('🎉 Welcome to Premium! Refreshing...');
            location.reload();
          });
        } else {
          localStorage.setItem('hellosde_premium', 'true');
          location.reload();
        }
      }
    };

    var rzp = new Razorpay(options);
    rzp.open();
  },

  // Check premium status
  checkPremium: function(user){
    // Quick check from localStorage (for speed)
    if(localStorage.getItem('hellosde_premium') === 'true'){
      state.isPremium = true;
      return Promise.resolve(true);
    }
    
    // Verify from Firestore
    if(typeof firebase !== 'undefined' && firebase.firestore && user){
      return firebase.firestore().collection('users').doc(user.uid).get()
        .then(function(doc){
          if(doc.exists && doc.data().isPremium){
            state.isPremium = true;
            localStorage.setItem('hellosde_premium', 'true');
            return true;
          }
          return false;
        }).catch(function(){ return false; });
    }
    return Promise.resolve(false);
  }
};

// ═══ INITIALIZATION ═══
function init(){
  injectStyles();
  
  // Check if Firebase is loaded
  if(typeof firebase !== 'undefined' && firebase.auth){
    firebase.auth().onAuthStateChanged(function(user){
      state.user = user;
      if(user){
        window.HelloSDE.checkPremium(user).then(function(){
          injectAuthUI();
          setupAuthMenu();
          gatePremiumContent();
        });
      } else {
        localStorage.removeItem('hellosde_premium');
        state.isPremium = false;
        injectAuthUI();
        gatePremiumContent();
      }
    });
  } else {
    // Firebase not loaded — use localStorage fallback
    state.isPremium = localStorage.getItem('hellosde_premium') === 'true';
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
