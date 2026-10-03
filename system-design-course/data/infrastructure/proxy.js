/* === Lesson proxy - part of Module 5 (Infrastructure) ===
   Source: system-design-cheatsheet/05-infrastructure.html (#proxy)
   + system-design-cheatsheet-course-hierarchy.md, Module 5.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["proxy"] = {
  module: 5, num: "5.3", title: "Forward vs Reverse Proxy",
  connectsFrom: "The load balancer and the gateway are both, structurally, a proxy. Naming that pattern explicitly is what turns a pile of seemingly unrelated tools (LB, gateway, CDN, NGINX) into one repeated idea.",
  tabs: {
    overview: {
      heading: "Two Directions of Hiding",
      intro: "A proxy is an intermediary that stands in for something else. Which side it hides is the whole distinction: a <strong>forward proxy</strong> hides who is asking (stands in front of the client), a <strong>reverse proxy</strong> hides who is answering (stands in front of servers). Everything built so far (LB, gateway) is a reverse proxy wearing a specific hat.",
      cards: [
        { icon: "F", title: "Forward Proxy", color: "blue", body: "Stands in front of the <strong>client</strong>. The destination server sees the proxy, not the real client. Example: a corporate proxy." },
        { icon: "R", title: "Reverse Proxy", color: "green", body: "Stands in front of the <strong>servers</strong>. The client sees the proxy, not the real backends. Examples: NGINX, Cloudflare." }
      ],
      callouts: [
        { color: "green", label: "Reverse Proxy Guarantees:", body: "<strong>Backend isolation</strong>, clients never see internal IPs. <strong>SSL termination</strong>, decrypt at the proxy and speak plain HTTP internally. <strong>Caching</strong>, serve cached responses without hitting the origin. <strong>DDoS absorption</strong> at the edge." }
      ]
    },
    handsOn: {
      goal: "Run a Squid forward proxy and an NGINX reverse proxy side by side and see exactly which side each one hides.",
      stack: "Squid (forward) and NGINX (reverse) plus a <code>traefik/whoami</code> backend in Docker, driven with <code>curl</code>. Local and free.",
      steps: [
        {
          title: "Start a Squid forward proxy",
          code: "docker run -d --name squid -p 3128:3128 ubuntu/squid",
          lang: "bash"
        },
        {
          title: "Send a request through it and read Squid's log",
          body: "The destination sees Squid, not you; Squid's access log shows your request relayed outward.",
          code: "curl -s --proxy http://localhost:3128 http://example.com -o /dev/null\ndocker exec squid tail -n 5 /var/log/squid/access.log",
          lang: "bash"
        },
        {
          title: "Start a backend behind an NGINX reverse proxy",
          code: "docker network create proxynet\ndocker run -d --name backend --network proxynet traefik/whoami\ncat > rev.conf <<'EOF'\nevents {}\nhttp {\n  server {\n    listen 80;\n    location / { proxy_pass http://backend:80; }\n  }\n}\nEOF\ndocker run -d --name rproxy --network proxynet -p 8080:80 \\\n  -v \"$PWD/rev.conf:/etc/nginx/nginx.conf:ro\" nginx",
          lang: "bash"
        },
        {
          title: "See what address the backend thinks it is talking to",
          code: "curl -s http://localhost:8080/ | grep -E 'RemoteAddr|X-Forwarded-For'",
          lang: "bash"
        },
        {
          title: "Forward the real client IP",
          body: "Add <code>X-Forwarded-For</code> so the backend can recover the original client address.",
          code: "sed -i 's#location / {#location / {\\n      proxy_set_header X-Forwarded-For $remote_addr;#' rev.conf\ndocker cp rev.conf rproxy:/etc/nginx/nginx.conf\ndocker exec rproxy nginx -s reload\ncurl -s http://localhost:8080/ | grep -E 'RemoteAddr|X-Forwarded-For'",
          lang: "bash"
        }
      ],
      observe: "Through Squid, <code>example.com</code> only ever sees Squid's address (the forward proxy hides the client). Through NGINX, the backend's <code>RemoteAddr</code> is NGINX's container IP, not yours (the reverse proxy hides the backend); after the last step an <code>X-Forwarded-For</code> header carries your real address through. Same pattern, opposite side hidden.",
      stretch: "Put a second backend behind the same NGINX and turn it into a load balancer with an <code>upstream</code> block, showing a reverse proxy and a load balancer are the same tool wearing different hats."
    }
  },
  keyTakeaways: [
    "A proxy is an intermediary; the direction of hiding is what names it.",
    "<strong>Forward proxy</strong> hides the client (sits in front of clients); <strong>reverse proxy</strong> hides the servers (sits in front of backends).",
    "Load balancers, gateways, and CDNs are all reverse proxies wearing different hats."
  ],
  proTip: "When you meet a new networking box (LB, gateway, CDN, WAF), ask \u201cwhich side is it hiding?\u201d Almost all of them are reverse proxies, and seeing that collapses a dozen tools into one mental model.",
  related: ["load-balancer", "api-gateway", "nginx", "cdn"],
  bridgeOut: "NGINX is the concrete piece of software that most commonly implements a reverse proxy in production."
};
