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
      goal: "Run NGINX as a static server, then as a caching reverse proxy in front of an app, and prove that cached responses never reach the backend while worker count stays flat.",
      stack: "NGINX plus a <code>traefik/whoami</code> backend in Docker, load-tested with <code>hey</code>. Local and free.",
      steps: [
        {
          title: "Serve a static page",
          code: "mkdir -p site\necho '<h1>hello from nginx</h1>' > site/index.html\ndocker run -d --name web -p 8080:80 -v \"$PWD/site:/usr/share/nginx/html:ro\" nginx\ncurl -s http://localhost:8080/",
          lang: "bash"
        },
        {
          title: "Add a caching reverse proxy in front of an app",
          body: "<code>proxy_cache</code> stores 200 responses for 60s; the <code>X-Cache-Status</code> header reports HIT or MISS.",
          code: "docker network create nginxnet\ndocker run -d --name app --network nginxnet traefik/whoami\ncat > nginx.conf <<'EOF'\nevents {}\nhttp {\n  proxy_cache_path /tmp/cache keys_zone=z:10m;\n  server {\n    listen 80;\n    location / {\n      proxy_pass http://app:80;\n      proxy_cache z;\n      proxy_cache_valid 200 60s;\n      add_header X-Cache-Status $upstream_cache_status;\n    }\n  }\n}\nEOF\ndocker run -d --name proxy --network nginxnet -p 8081:80 \\\n  -v \"$PWD/nginx.conf:/etc/nginx/nginx.conf:ro\" nginx",
          lang: "bash"
        },
        {
          title: "Confirm the cache flips MISS to HIT",
          code: "curl -si http://localhost:8081/ | grep X-Cache-Status\ncurl -si http://localhost:8081/ | grep X-Cache-Status",
          lang: "bash"
        },
        {
          title: "Load-test static vs cached proxy",
          code: "hey -n 2000 -c 100 http://localhost:8080/\nhey -n 2000 -c 100 http://localhost:8081/",
          lang: "bash"
        },
        {
          title: "Watch the worker count stay small",
          code: "docker exec proxy sh -c 'ps -o pid,comm | grep nginx'",
          lang: "bash"
        }
      ],
      observe: "The cached proxy serves far more requests/sec than an uncached backend would, because after the first request <code>X-Cache-Status</code> reads <code>HIT</code> and the response never reaches <code>app</code> at all. The NGINX worker count stays small and flat even at 100 concurrent connections, the C10K event-loop model in action.",
      stretch: "Add TLS termination: generate a self-signed cert (<code>openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 1 -subj \"/CN=localhost\"</code>), have NGINX terminate TLS and forward plain HTTP to the backend, and confirm the client side is HTTPS while the hop to the backend is not."
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
