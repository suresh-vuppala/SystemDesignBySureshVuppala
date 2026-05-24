/* ═══ HelloSDE — Dotted Globe (GitHub/Stripe style) ═══
   Renders land as dots on a sphere. Clean, performant, no rendering artifacts.
   Land dot positions pre-computed from world map at load time.
*/
(function(){

var VISITORS = [
  {name:'India', lat:20.5, lng:78.9, baseCount:142, tz:5.5},
  {name:'USA', lat:37.1, lng:-95.7, baseCount:98, tz:-5},
  {name:'Germany', lat:51.2, lng:10.4, baseCount:23, tz:1},
  {name:'UK', lat:55.4, lng:-3.4, baseCount:21, tz:0},
  {name:'Canada', lat:56.1, lng:-106.3, baseCount:19, tz:-6},
  {name:'Singapore', lat:1.3, lng:103.8, baseCount:16, tz:8},
  {name:'Australia', lat:-25.3, lng:133.8, baseCount:14, tz:10},
  {name:'Brazil', lat:-14.2, lng:-51.9, baseCount:12, tz:-3},
  {name:'Japan', lat:36.2, lng:138.3, baseCount:11, tz:9},
  {name:'UAE', lat:23.4, lng:53.8, baseCount:10, tz:4},
  {name:'Netherlands', lat:52.1, lng:5.3, baseCount:8, tz:1},
  {name:'France', lat:46.2, lng:2.2, baseCount:7, tz:1},
  {name:'South Korea', lat:35.9, lng:127.8, baseCount:6, tz:9},
  {name:'Israel', lat:31.0, lng:34.8, baseCount:5, tz:2},
  {name:'Poland', lat:51.9, lng:19.1, baseCount:4, tz:1},
  {name:'Nigeria', lat:9.1, lng:8.7, baseCount:3, tz:1}
];

var TOP_CONCEPTS = [
  {name:'Kafka & Event Streaming', link:'system-design-cheatsheet/08-messaging.html#kafka'},
  {name:'Database Sharding', link:'system-design-cheatsheet/10-scalability.html#sharding'},
  {name:'WebSocket Scaling', link:'system-design-cheatsheet/04-apis.html#realtime'},
  {name:'Rate Limiting', link:'system-design-cheatsheet/10-scalability.html#rate-limiting'},
  {name:'Consistent Hashing', link:'system-design-cheatsheet/10-scalability.html#consistent-hashing'},
  {name:'Cache Invalidation', link:'system-design-cheatsheet/07-caching.html#caching'},
  {name:'Load Balancer Design', link:'system-design-cheatsheet/05-infrastructure.html#load-balancer'},
  {name:'Distributed Consensus', link:'system-design-cheatsheet/12-distributed-systems.html#consensus'},
  {name:'API Gateway Patterns', link:'system-design-cheatsheet/05-infrastructure.html#api-gateway'},
  {name:'Fan-out Architecture', link:'realtime-system-design-problems/1-chat-messaging/slack-real-time-messaging.html#fanout'}
];

var canvas, ctx, W, H, R, rotation=0, landDots=[];

function getActiveCount(v){
  var now=new Date();
  var utcH=now.getUTCHours()+now.getUTCMinutes()/60;
  var localH=(utcH+v.tz+24)%24;
  var a;
  if(localH>=2&&localH<6)a=0.08;
  else if(localH>=6&&localH<8)a=0.3;
  else if(localH>=8&&localH<11)a=0.85;
  else if(localH>=11&&localH<14)a=0.5;
  else if(localH>=14&&localH<17)a=0.6;
  else if(localH>=17&&localH<19)a=0.4;
  else if(localH>=19&&localH<23)a=0.9;
  else a=0.2;
  var day=now.getUTCDay();
  var df=(day===0||day===6)?0.7:1.0;
  var noise=0.85+Math.random()*0.3;
  return Math.max(1,Math.round(v.baseCount*a*df*noise));
}

function init(){
  canvas=document.getElementById('globe-canvas');
  if(!canvas)return;
  W=380;H=380;R=168;
  canvas.width=W*2;canvas.height=H*2;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx=canvas.getContext('2d');
  ctx.scale(2,2);

  loadLandDots();
  renderTopConcepts();
  updateCounter();
  setInterval(updateCounter,4000);
  animate();
}

function loadLandDots(){
  // Load TopoJSON and sample land points as dots
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')
    .then(function(r){return r.json();})
    .then(function(topo){
      var arcs=topo.arcs, tf=topo.transform;
      // Decode all arc coordinates
      var decoded=arcs.map(function(arc){
        var x=0,y=0;
        return arc.map(function(pt){
          x+=pt[0];y+=pt[1];
          return[x*tf.scale[0]+tf.translate[0], y*tf.scale[1]+tf.translate[1]];
        });
      });
      // Sample points along all arcs (every 3rd point for density)
      decoded.forEach(function(arc){
        for(var i=0;i<arc.length;i+=3){
          landDots.push({lat:arc[i][1],lng:arc[i][0]});
        }
      });
    })
    .catch(function(){
      // Offline fallback: generate grid dots for basic globe look
      for(var lat=-80;lat<=80;lat+=6){
        for(var lng=-180;lng<=180;lng+=6){
          landDots.push({lat:lat,lng:lng});
        }
      }
    });
}

function animate(){
  requestAnimationFrame(animate);
  rotation+=0.003;
  draw();
}

function proj(lat,lng){
  var la=lat*Math.PI/180,lo=lng*Math.PI/180;
  var x=Math.cos(la)*Math.sin(lo+rotation);
  var y=Math.sin(la);
  var z=Math.cos(la)*Math.cos(lo+rotation);
  return{x:W/2+x*R,y:H/2-y*R,z:z};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  var cx=W/2,cy=H/2;

  // Atmosphere
  var atm=ctx.createRadialGradient(cx,cy,R*0.85,cx,cy,R*1.15);
  atm.addColorStop(0,'rgba(60,140,220,0)');
  atm.addColorStop(0.7,'rgba(60,140,220,.06)');
  atm.addColorStop(1,'rgba(60,140,220,0)');
  ctx.fillStyle=atm;
  ctx.beginPath();ctx.arc(cx,cy,R*1.15,0,Math.PI*2);ctx.fill();

  // Globe sphere
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
  var bg=ctx.createRadialGradient(cx-R*0.3,cy-R*0.3,0,cx,cy,R);
  bg.addColorStop(0,'#162a42');
  bg.addColorStop(0.7,'#0d1f35');
  bg.addColorStop(1,'#081525');
  ctx.fillStyle=bg;ctx.fill();

  // Globe edge
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
  ctx.strokeStyle='rgba(80,150,230,.25)';ctx.lineWidth=1.5;ctx.stroke();

  // Land dots
  if(landDots.length>0){
    for(var i=0;i<landDots.length;i++){
      var d=landDots[i];
      var p=proj(d.lat,d.lng);
      if(p.z<=0.05)continue;
      var alpha=p.z*0.6;
      ctx.fillStyle='rgba(80,200,140,'+alpha+')';
      ctx.fillRect(p.x-0.8,p.y-0.8,1.6,1.6);
    }
  } else {
    // Fallback grid while loading
    ctx.fillStyle='rgba(80,200,140,.15)';
    for(var lat=-80;lat<=80;lat+=8){
      for(var lng=-180;lng<=180;lng+=8){
        var p2=proj(lat,lng);
        if(p2.z>0.05) ctx.fillRect(p2.x-0.6,p2.y-0.6,1.2,1.2);
      }
    }
  }

  // Visitor markers
  VISITORS.forEach(function(v){
    var count=getActiveCount(v);
    if(count<2)return;
    var p=proj(v.lat,v.lng);
    if(p.z<0.15)return;
    var depth=p.z;
    var sz=4+(count/18);
    var pulse=1+0.1*Math.sin(Date.now()*0.002+v.lat);

    // Glow
    ctx.beginPath();ctx.arc(p.x,p.y,sz*pulse*2.2,0,Math.PI*2);
    ctx.fillStyle='rgba(130,100,240,'+(0.1*depth)+')';ctx.fill();

    // Badge
    ctx.beginPath();ctx.arc(p.x,p.y,sz*pulse,0,Math.PI*2);
    ctx.fillStyle='rgba(110,80,200,'+(0.9*depth)+')';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+(0.65*depth)+')';ctx.lineWidth=1.5;ctx.stroke();

    // Number
    if(depth>0.25){
      ctx.font='700 '+(sz*0.7)+'px Inter,system-ui,sans-serif';
      ctx.fillStyle='rgba(255,255,255,'+(0.9*depth)+')';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(count,p.x,p.y);
    }

    // Label — always show country name for all visible markers
    if(depth>0.2){
      ctx.font='600 8px Inter,system-ui,sans-serif';
      ctx.fillStyle='rgba(220,235,255,'+(0.7*depth)+')';
      ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(v.name,p.x,p.y+sz*pulse+3);
    }
    ctx.textAlign='start';ctx.textBaseline='alphabetic';
  });
}

function renderTopConcepts(){
  var el=document.getElementById('top-concepts');
  if(!el)return;
  el.innerHTML=TOP_CONCEPTS.map(function(c,i){
    return'<a class="tc-item" href="'+c.link+'">'
      +'<span class="tc-rank">'+(i+1)+'</span>'
      +'<span class="tc-name">'+c.name+'</span>'
      +'</a>';
  }).join('');
}

function updateCounter(){
  var el=document.getElementById('globe-counter');
  if(!el)return;
  var total=VISITORS.reduce(function(s,v){return s+getActiveCount(v);},0);
  el.textContent=total.toLocaleString();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
