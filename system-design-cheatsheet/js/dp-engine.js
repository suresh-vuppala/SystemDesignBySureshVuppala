/* ════════════════════════════════════════════════════════════════
   DP Engine — shared Play / Expand engine for every diagram page
   Usage: include after the page body content + nav.js (or before nav).
     <link rel="stylesheet" href="css/dp-engine.css">
     <script src="js/dp-engine.js"></script>
   On load, every <svg> inside any .T section gets:
     • A ▶ Play / Pause button and ⛶ Expand button (top-right of the panel)
     • A shared fullscreen modal with zoom, play, restart, prev/next steps
   See 360SystemDesignHTMLCodeContext.md for full design notes.
   ════════════════════════════════════════════════════════════════ */
(function(){
  // 1) Inject the shared modal markup once per page.
  function ensureModal(){
    if(document.getElementById('dp-modal'))return;
    var html=''+
      '<div id="dp-modal" onclick="if(event.target===this)dpModalClose()">'+
      '<div id="dp-modal-content">'+
        '<button id="dp-modal-close" onclick="dpModalClose()" title="Close (Esc)">✕</button>'+
        '<div class="dp-mbar">'+
          '<button class="dp-mbtn" onclick="dpZoom(1.25)" title="Zoom in">+</button>'+
          '<button class="dp-mbtn" onclick="dpZoom(0.8)" title="Zoom out">−</button>'+
          '<button class="dp-mbtn" style="font-size:11px" onclick="dpZoom(0)" title="Reset zoom">Reset zoom</button>'+
          '<button class="dp-mbtn dp-pan-btn" id="dp-pan-btn" onclick="dpTogglePan()" title="Pan tool — drag to move (Space)" aria-pressed="false">✋</button>'+
          '<button class="dp-mbtn" id="dp-modal-play" onclick="dpModalPlay()" title="Play / Pause">▶</button>'+
          '<button class="dp-mbtn" style="font-size:11px" onclick="dpModalRestart()" title="Restart">↻ Restart</button>'+
          '<div class="dp-speed" role="group" aria-label="Step navigation">'+
            '<span class="dp-speed-lbl">Steps</span>'+
            '<button class="dp-step-nav" id="dp-step-prev" onclick="dpStepPrev()" title="Previous step (←)">◀ Prev</button>'+
            '<span class="dp-step-ind"><span id="dp-step-cur">0</span> / <span id="dp-step-tot">0</span></span>'+
            '<button class="dp-step-nav" id="dp-step-next" onclick="dpStepNext()" title="Next step (→)">Next ▶</button>'+
          '</div>'+
        '</div>'+
        '<div id="dp-zoom-wrap"><div id="dp-zoom-inner"></div></div>'+
      '</div>'+
      '</div>';
    var c=document.createElement('div');c.innerHTML=html;
    document.body.appendChild(c.firstChild);
  }

  var SKIP={defs:1,style:1,title:1,desc:1,marker:1,lineargradient:1,radialgradient:1,clippath:1,filter:1,mask:1,pattern:1,symbol:1};
  function dpCenter(el){try{var b=el.getBBox();return [b.x+b.width/2,b.y+b.height/2];}catch(e){return [0,0];}}

  /* Tag every direct SVG child as a step element, computing its conceptual
     order via: explicit data-dp-step → numbered badges → connector constraint
     → document order. See 360SystemDesignHTMLCodeContext.md §9d. */
  function dpAutoTag(panel){
    var svg=panel.querySelector('svg');if(!svg)return [];
    var kids=svg.children,topKids=[];
    for(var i=0;i<kids.length;i++){
      var c=kids[i];
      if(SKIP[c.tagName.toLowerCase()])continue;
      topKids.push(c);
    }
    var explicit=topKids.some(function(e){return e.hasAttribute('data-dp-step');});
    var badges=[];
    if(!explicit){
      topKids.forEach(function(el){
        if(el.tagName.toLowerCase()==='text'){
          var t=(el.textContent||'').trim();
          if(/^\d{1,2}$/.test(t)){
            var c=dpCenter(el);badges.push({n:parseInt(t,10),cx:c[0],cy:c[1],el:el});
          }
        }
      });
    }
    var ranked=topKids.map(function(el,idx){
      var step;
      if(explicit){
        step=el.hasAttribute('data-dp-step')?parseFloat(el.getAttribute('data-dp-step')):1e6+idx;
      } else if(badges.length>=2){
        var ys=badges.map(function(b){return b.cy;});
        var maxBy=Math.max.apply(null,ys);
        var minSpacing=Infinity;
        for(var bi=0;bi<badges.length;bi++)for(var bj=bi+1;bj<badges.length;bj++){
          var dx=badges[bi].cx-badges[bj].cx,dy=badges[bi].cy-badges[bj].cy;
          var d=Math.sqrt(dx*dx+dy*dy);if(d<minSpacing)minSpacing=d;
        }
        var zoneR=Math.max(12,minSpacing*0.55);
        var c=dpCenter(el),best=null,bestD=Infinity;
        badges.forEach(function(b){var dx=c[0]-b.cx,dy=c[1]-b.cy,d=Math.sqrt(dx*dx+dy*dy);if(d<bestD){bestD=d;best=b;}});
        if(bestD<=zoneR){step=best.n;}
        else if(c[1]>maxBy+zoneR*0.6){step=1e5;}
        else {step=-1;}
      } else { step=idx; }
      return {el:el,step:step,docIdx:idx};
    });
    var CONNECT={line:1,polyline:1,path:1};
    var nodeRanked=ranked.filter(function(r){return !CONNECT[r.el.tagName.toLowerCase()];});
    function nearestNodeStep(px,py){
      var best=null,bestD=Infinity;
      nodeRanked.forEach(function(r){
        var c=dpCenter(r.el);var dx=c[0]-px,dy=c[1]-py;var d=dx*dx+dy*dy;
        if(d<bestD){bestD=d;best=r;}
      });
      return best?best.step:-1;
    }
    ranked.forEach(function(r){
      if(!CONNECT[r.el.tagName.toLowerCase()])return;
      if(typeof r.el.getTotalLength!=='function')return;
      try{
        var L=r.el.getTotalLength();if(!L)return;
        var p1=r.el.getPointAtLength(0),p2=r.el.getPointAtLength(L);
        var s1=nearestNodeStep(p1.x,p1.y),s2=nearestNodeStep(p2.x,p2.y);
        var need=Math.max(s1,s2);
        if(r.step<need)r.step=need;
      }catch(e){}
    });
    ranked.sort(function(a,b){return a.step-b.step || a.docIdx-b.docIdx;});
    var els=[];
    ranked.forEach(function(r){
      if(!r.el.classList.contains('dp-el'))r.el.classList.add('dp-el');
      els.push(r.el);
    });
    panel._dpEls=els;
    return els;
  }

  function dpInit(){
    ensureModal();
    var svgs=document.querySelectorAll('.T svg');
    Array.prototype.forEach.call(svgs,function(svg){
      if(svg.closest && svg.closest('.dp-panel'))return;
      var wrap=document.createElement('div');
      wrap.className='dp-panel dp-auto';
      svg.parentNode.insertBefore(wrap,svg);
      wrap.appendChild(svg);
      var ctrls=document.createElement('div');
      ctrls.className='dp-ctrls';
      wrap.appendChild(ctrls);
      var els=dpAutoTag(wrap);
      // Diagrams with <3 steps don't benefit from a sequence — show Expand only.
      var play=(els.length>=3)?'<button class="dp-ctrl" onclick="dpToggle(this.closest(\'.dp-panel\'),this)" title="Play / Pause">▶</button>':'';
      ctrls.innerHTML=play+'<button class="dp-ctrl dp-expand" onclick="dpExpand(this.closest(\'.dp-panel\'))" title="Expand diagram">⛶</button>';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){requestAnimationFrame(dpInit);});else requestAnimationFrame(dpInit);

  function dpStepsOf(p){return p._dpEls||Array.prototype.slice.call(p.querySelectorAll('.dp-el'));}
  function dpRender(p){
    var els=dpStepsOf(p);
    var i=p._step?p._step.i:0;
    els.forEach(function(el,idx){el.classList.toggle('dp-on',idx<i);});
    var cur=document.getElementById('dp-step-cur');if(cur)cur.textContent=i;
    var tot=document.getElementById('dp-step-tot');if(tot)tot.textContent=els.length;
    var pv=document.getElementById('dp-step-prev'),nx=document.getElementById('dp-step-next');
    if(pv)pv.disabled=(i<=0);
    if(nx)nx.disabled=(i>=els.length);
  }
  function dpEnterStepped(p){
    if(p._timer){clearInterval(p._timer);p._timer=null;}
    p.classList.add('dp-stepped');
    if(!p._step)p._step={i:0};
    dpAutoTag(p);
    dpRender(p);
    var mb=document.getElementById('dp-modal-play');if(mb){mb.textContent='▶';mb.title='Play';}
  }
  function dpModalPanel(){return document.querySelector('#dp-zoom-inner .dp-panel');}

  window.dpStepNext=function(){var p=dpModalPanel();if(!p)return;if(!p.classList.contains('dp-stepped'))dpEnterStepped(p);var n=dpStepsOf(p).length;p._step.i=Math.min(n,(p._step.i||0)+1);dpRender(p);};
  window.dpStepPrev=function(){var p=dpModalPanel();if(!p)return;if(!p.classList.contains('dp-stepped'))dpEnterStepped(p);p._step.i=Math.max(0,(p._step.i||0)-1);dpRender(p);};

  window.dpToggle=function(p,btn){
    if(!p)return;
    if(!p.classList.contains('dp-stepped'))dpEnterStepped(p);
    var els=dpStepsOf(p);var n=els.length;if(n===0)return;
    if(p._timer){clearInterval(p._timer);p._timer=null;if(btn){btn.textContent='▶';btn.title='Resume';}return;}
    if(p._step.i>=n){p._step.i=0;dpRender(p);}
    var step=Math.max(180,Math.min(700,Math.round(4500/n)));
    if(btn){btn.textContent='⏸';btn.title='Pause';}
    p._timer=setInterval(function(){
      p._step.i++;dpRender(p);
      if(p._step.i>=n){clearInterval(p._timer);p._timer=null;if(btn){btn.textContent='▶';btn.title='Replay';}}
    },step);
  };
  window.dpRestart=function(p,btn){
    if(!p)return;if(p._timer){clearInterval(p._timer);p._timer=null;}
    if(!p.classList.contains('dp-stepped'))dpEnterStepped(p);
    p._step.i=0;dpRender(p);dpToggle(p,btn);
  };

  var dpScale=5,dpTx=0,dpTy=0,dpPan=false;
  function dpApplyTransform(){var z=document.getElementById('dp-zoom-inner');if(z)z.style.transform='translate('+dpTx+'px,'+dpTy+'px) scale('+dpScale+')';}
  window.dpZoom=function(f){if(f===0){dpScale=5;dpTx=0;dpTy=0;}else dpScale=Math.min(20,Math.max(.5,dpScale*f));dpApplyTransform();};
  window.dpTogglePan=function(){dpPan=!dpPan;dpSetPanUI();};
  function dpSetPanUI(){var b=document.getElementById('dp-pan-btn'),w=document.getElementById('dp-zoom-wrap');if(!w)return;if(dpPan){w.classList.add('dp-pan-on');if(b){b.classList.add('dp-pan-active');b.setAttribute('aria-pressed','true');}}else{w.classList.remove('dp-pan-on','dp-panning');if(b){b.classList.remove('dp-pan-active');b.setAttribute('aria-pressed','false');}}}
  /* Pan: hold Space, or click ✋ then drag. Middle-mouse always pans. */
  document.addEventListener('mousedown',function(e){
    var w=document.getElementById('dp-zoom-wrap');if(!w||!w.contains(e.target))return;
    var modal=document.getElementById('dp-modal');if(!modal||modal.style.display!=='flex')return;
    if(!(dpPan||e.button===1))return;
    e.preventDefault();var sx=e.clientX-dpTx,sy=e.clientY-dpTy;w.classList.add('dp-panning');
    function mv(ev){dpTx=ev.clientX-sx;dpTy=ev.clientY-sy;dpApplyTransform();}
    function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);w.classList.remove('dp-panning');}
    document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
  });
  window.dpExpand=function(panel){
    ensureModal();
    var inner=document.getElementById('dp-zoom-inner');
    inner.innerHTML=panel.outerHTML;
    var ctrls=inner.querySelector('.dp-ctrls');if(ctrls)ctrls.remove();
    var clone=inner.querySelector('.dp-panel');
    if(clone){clone.classList.remove('dp-stepped');clone._step=null;clone._timer=null;dpAutoTag(clone);
      var n=clone.querySelectorAll('.dp-el').length;
      var cur=document.getElementById('dp-step-cur');if(cur)cur.textContent='0';
      var tot=document.getElementById('dp-step-tot');if(tot)tot.textContent=n;
      var pv=document.getElementById('dp-step-prev'),nx=document.getElementById('dp-step-next');
      if(pv)pv.disabled=true;if(nx)nx.disabled=(n===0);
    }
    var mb=document.getElementById('dp-modal-play');if(mb){mb.textContent='▶';mb.title='Play';}
    dpScale=5;dpTx=0;dpTy=0;dpPan=false;dpSetPanUI();dpApplyTransform();
    document.getElementById('dp-modal').style.display='flex';
  };
  window.dpModalPlay=function(){var p=dpModalPanel();if(p)dpToggle(p,document.getElementById('dp-modal-play'));};
  window.dpModalRestart=function(){var p=dpModalPanel();if(p)dpRestart(p,document.getElementById('dp-modal-play'));};
  window.dpModalClose=function(){var p=dpModalPanel();if(p&&p._timer){clearInterval(p._timer);p._timer=null;}var m=document.getElementById('dp-modal');if(m)m.style.display='none';};
  document.addEventListener('keydown',function(e){
    var m=document.getElementById('dp-modal');var open=m&&m.style.display==='flex';
    if(e.key==='Escape'&&open){dpModalClose();return;}
    if(open&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();if(e.key==='ArrowRight')dpStepNext();else dpStepPrev();}
    if(open&&e.code==='Space'&&!e.repeat){var tag=(e.target&&e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea')return;e.preventDefault();dpTogglePan();}
  });
})();
