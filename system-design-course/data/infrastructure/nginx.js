/* === Lesson nginx - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#nginx)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["nginx"] = {
  module: 5, num: "5.4", title: "NGINX",
  connectsFrom: "Older web servers assigned one OS thread per connection. At 100K concurrent connections, that is gigabytes of thread-stack memory and constant context-switching, a ceiling known as the <strong>C10K problem</strong>.",
  tabs: {
    overview: {
      heading: "One Server, Five Hats",
      intro: "NGINX uses a small number of <strong>worker processes</strong>, each an event loop, to handle thousands of connections without one-thread-per-connection. Roughly a third of all websites run on it as a result. It is <strong>event-driven and non-blocking</strong>, and it wears 5 hats.",
      cards: [
        { icon: "1", title: "Web Server", color: "green", body: "Serves static files (HTML, CSS, JS, images) directly off disk, fast." },
        { icon: "2", title: "Reverse Proxy", color: "blue", body: "Sits in front of app servers and forwards requests to them." },
        { icon: "3", title: "Load Balancer", color: "purple", body: "Distributes across a backend pool with Round Robin, Least Connections, and more." },
        { icon: "4", title: "SSL Termination", color: "orange", body: "Decrypts TLS once at the edge, so backends speak plain HTTP." },
        { icon: "5", title: "Content Cache", color: "teal", body: "Caches upstream responses so repeat requests never reach the app." }
      ],
      callouts: [
        { color: "yellow", label: "Real-world:", body: "<strong>Netflix</strong> (video delivery), <strong>Dropbox</strong> (replaced Apache, cut servers 75%), and <strong>Kubernetes</strong> (default Ingress Controller). It solves C10K: event-driven workers handle 100K+ concurrent connections vs Apache's thread-per-connection." }
      ]
    },
    handsOn: {
      prerequisites: "Docker, plus a basic `nginx.conf`.",
      setup: "Local and free only.",
      simulate: "Run NGINX serving a static HTML page, then configure it as a reverse proxy in front of a small Node.js app, then add caching (`proxy_cache_path` + `proxy_cache`) in front of that same app. Load-test all 3 configurations with `hey -n 2000 -c 100` and compare requests/sec.",
      observe: "The cached configuration serves far more requests/sec than the proxied-but-uncached one, since cached responses never reach your Node.js app at all. Check `X-Cache-Status` (or add your own header) to confirm hits vs misses. Also check NGINX's worker process count (`ps aux | grep nginx`) staying small and flat throughout, even at 100 concurrent connections.",
      stretch: "Add TLS termination: generate a self-signed cert (`openssl req -x509 ...`), configure NGINX to terminate TLS and forward plain HTTP to the backend, and confirm (via `tcpdump` on the loopback interface) that traffic between NGINX and the backend is unencrypted while the client-facing side is HTTPS."
    }
  },
  keyTakeaways: [
    "NGINX is event-driven and non-blocking: a few worker processes handle 100K+ connections, defeating the C10K problem.",
    "It wears 5 hats: web server, reverse proxy, load balancer, SSL termination, and content cache.",
    "That efficiency is why roughly a third of all websites, and the default K8s Ingress Controller, run on it."
  ],
  proTip: "Terminate TLS and cache at NGINX before requests ever reach your app. The cheapest request is the one your backend never has to serve.",
  related: ["proxy", "load-balancer", "api-gateway", "docker-k8s"],
  bridgeOut: "NGINX runs on a server. The next question is how you package and orchestrate the many services (including NGINX itself) that make up a real system."
};
