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
      prerequisites: "Docker, plus `squid` (forward proxy) and `nginx` (reverse proxy) images.",
      setup: "Local and free: `docker run -d -p 3128:3128 ubuntu/squid` for the forward proxy; a plain NGINX container configured with `proxy_pass` for the reverse proxy.",
      simulate: "Configure `curl --proxy localhost:3128 https://example.com` and check the request logs on the Squid container: you will see the client's request relayed outward, hiding the client from example.com's perspective. Separately, configure NGINX to `proxy_pass` to a backend app and hit NGINX directly, then check the backend's logs for the source IP it sees (NGINX's, not the real client's, unless `X-Forwarded-For` is set).",
      observe: "From the destination server's point of view in each case: the forward proxy hides the client's identity from the destination; the reverse proxy hides the backend's identity from the client. Same proxy pattern, two different things being hidden.",
      stretch: "Add `proxy_set_header X-Forwarded-For $remote_addr;` to the NGINX config and confirm the backend now sees the real client IP in that header, the standard way reverse proxies avoid losing this information."
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
