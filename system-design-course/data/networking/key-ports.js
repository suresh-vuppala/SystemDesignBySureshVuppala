/* === Lesson key-ports - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#key-ports)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["key-ports"] = {
  module: 2, num: "2.7", title: "Key Ports Cheat Sheet",
  connectsFrom: "IP & CIDR routes traffic to the right machine; a port routes it to a specific process on that machine. These exact numbers are also what Security Groups and NACLs filter on in the very next lesson, so they are worth memorizing once.",
  tabs: {
    overview: {
      heading: "Ports You Will Meet in Every Diagram",
      intro: "Standard ports show up in every architecture diagram. The one structural rule: ports below <strong>1024 are privileged</strong> and need root/admin to bind, which is exactly why apps run on 8080/8443 and let a load balancer own 80/443.",
      table: {
        headers: ["Port", "Service", "Protocol", "Security Notes"],
        rows: [
          ["22", "SSH", "TCP", "Key-based auth only, disable password login"],
          ["53", "DNS", "UDP/TCP", "UDP first, TCP for &gt; 512B or zone transfers"],
          ["80", "HTTP", "TCP", "Redirect to 443, never serve sensitive data"],
          ["443", "HTTPS", "TCP", "TLS 1.3, HSTS header, cert pinning for mobile"],
          ["3306", "MySQL", "TCP", "Private subnet only, never expose publicly"],
          ["5432", "PostgreSQL", "TCP", "SSL mode = require, restrict to app CIDR"],
          ["6379", "Redis", "TCP", "<strong>No auth by default</strong>, always set requirepass + ACL"],
          ["9092", "Kafka", "TCP", "9093 for TLS, SASL for auth"],
          ["9200", "Elasticsearch", "TCP", "Never expose publicly (data exfil risk)"],
          ["27017", "MongoDB", "TCP", "Enable auth, bind to private IP only"],
          ["8080/8443", "App servers", "TCP", "Non-privileged, behind LB on 80/443"],
          ["2379/2380", "etcd", "TCP", "Client/peer ports, mTLS required"]
        ]
      },
      callouts: [
        { color: "green", label: "Rule of thumb:", body: "Run apps on <strong>8080/8443</strong> (non-privileged) and let a load balancer terminate 80/443. Only expose ports that <strong>must</strong> be public. Database ports should <strong>never</strong> be reachable from the internet." },
        { color: "blue", label: "Common breaches:", body: "<strong>Open Redis (6379)</strong> leads to cryptominer injection. <strong>Open Elasticsearch (9200)</strong> leads to data exfiltration. <strong>Open MongoDB (27017)</strong> leads to ransomware. Always scan with `nmap` or a cloud security tool." }
      ]
    },
    handsOn: {
      goal: "Reproduce the open, unauthenticated Redis breach on your own machine, then lock it down with a password.",
      stack: "Docker, <code>nmap</code> (or <code>nc -zv</code>), and <code>redis-cli</code>. Local and free.",
      steps: [
        {
          title: "Start datastores with no password (on purpose)",
          code: "docker run -d --name redis -p 6379:6379 redis\ndocker run -d --name mongo -p 27017:27017 mongo",
          lang: "bash"
        },
        {
          title: "Scan which ports are open right now",
          body: "No nmap? Use <code>nc -zv localhost 6379</code> instead.",
          code: "nmap -p 6379,27017 localhost",
          lang: "bash"
        },
        {
          title: "Talk to the open, unauthenticated Redis",
          body: "It answers anyone who can reach the port, no password asked: the exact breach pattern.",
          code: "docker exec -it redis redis-cli ping",
          lang: "bash"
        },
        {
          title: "Require a password and watch access change",
          code: "docker exec -it redis redis-cli CONFIG SET requirepass mypassword\ndocker exec -it redis redis-cli ping                 # -> NOAUTH error\ndocker exec -it redis redis-cli -a mypassword ping   # -> PONG",
          lang: "bash"
        }
      ],
      observe: "Before the password, <code>ping</code> returns <strong>PONG</strong> to anyone who can reach 6379, the open-Redis breach reproduced safely. After <code>CONFIG SET requirepass</code>, the same <code>ping</code> fails with a <strong>NOAUTH</strong> error until you pass <code>-a mypassword</code>.",
      stretch: "On a cloud free-tier VM, run <code>nmap</code> against its public IP from your laptop and confirm only the ports you explicitly opened in its Security Group respond, the practical link straight into the next lesson."
    }
  },
  keyTakeaways: [
    "Ports below 1024 are privileged; run apps on 8080/8443 and let the load balancer own 80/443.",
    "Database and datastore ports (3306, 5432, 6379, 9200, 27017) must live on private subnets, never the public internet.",
    "Redis, Elasticsearch, and MongoDB ship insecure-by-default, an open port is a real, exploited breach vector, not a theoretical one."
  ],
  proTip: "If you can name what runs on 22, 443, 5432, 6379, and 9092 without thinking, you can read any architecture diagram at a glance, and instantly spot the one database port someone left open to 0.0.0.0/0.",
  related: ["ip-cidr", "firewalls", "http-https"],
  bridgeOut: "These are exactly the numbers a firewall rule filters by, which is the very next lesson: Security Groups vs NACLs."
};
