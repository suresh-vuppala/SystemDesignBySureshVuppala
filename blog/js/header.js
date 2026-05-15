/* ═══ Shared Site Header — Modern Minimal ═══ */
(function(){
  var path = location.pathname;
  var page = path.split('/').pop() || 'index.html';
  var dir = path.split('/').slice(-2, -1)[0] || '';

  var activeSection = 'home';
  if(dir === 'cheatsheet' || page.match(/^(0[1-9]|1[0-5])-/)) activeSection = 'cheatsheet';
  if(dir === 'realtime') activeSection = 'realtime';
  if(page === 'engineering-blogs.html') activeSection = 'blogs';

  var prefix = '';
  if(dir === 'cheatsheet' || dir === 'realtime') prefix = '../';

  var links = [
    {href: prefix+'cheatsheet/index.html', label:'System Design', id:'cheatsheet'},
    {href: prefix+'realtime/index.html', label:'Real-Time Design', id:'realtime'},
    {href: prefix+'cheatsheet/engineering-blogs.html', label:'Engg Blogs', id:'blogs'}
  ];

  var navItems = links.map(function(l){
    return '<a href="'+l.href+'" class="sh-link'+(activeSection===l.id?' sh-active':'')+'">'+l.label+'</a>';
  }).join('');

  var html = '<header class="sh">'
    + '<a class="sh-brand" href="'+prefix+'index.html">System Design</a>'
    + '<button class="sh-toggle" aria-label="Menu" aria-expanded="false">☰</button>'
    + '<nav class="sh-nav">'+navItems+'</nav>'
    + '</header>';

  document.body.insertAdjacentHTML('afterbegin', html);

  // Mobile toggle
  var toggle = document.querySelector('.sh-toggle');
  var nav = document.querySelector('.sh-nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('sh-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? '✕' : '☰';
    });
  }
})();
