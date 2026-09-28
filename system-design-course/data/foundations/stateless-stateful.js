/* === Lesson stateless-stateful - part of Module 1 (Foundations) ===
   Source: system-design-cheatsheet-course-hierarchy.md + system-design-cheatsheet/01-foundations.html
   One file per lesson for scalability; each file appends its slug's key
   to the shared window.COURSE_CONTENT object loaded by the pages that reference it. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["stateless-stateful"] = {
  module: 1, num: "1.5", title: "Stateless vs Stateful",
  connectsFrom: "Horizontal scaling just promised \u201cany server can answer any request.\u201d But a user\u2019s second request might land on a different server than their first. If that server doesn\u2019t remember who they are, every follow-up request looks like a fresh, logged-out visitor.",
  tabs: {
    overview: {
      heading: "Stateless vs Stateful Servers",
      diagram: {
        caption: "Left: a round-robin load balancer routing to any server, backed by a shared Redis store. Right: a sticky load balancer pinning each user to one server, and what happens when that server dies.",
        svg: '<svg width="100%" viewBox="0 0 920 460" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'
          + '<defs><marker id="ssv1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="var(--muted)"/></marker></defs>'
          // Left panel: STATELESS
          + '<rect x="12" y="12" width="428" height="436" rx="10" fill="rgba(52,211,153,.04)" stroke="var(--border-strong)" stroke-width="1.5"/>'
          + '<text x="226" y="38" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="800">STATELESS</text>'
          + '<text x="226" y="58" text-anchor="middle" fill="var(--muted)" font-size="12">Any server handles any request</text>'
          // Users column
          + '<rect x="32" y="86" width="66" height="30" rx="4" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="65" y="105" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">User A</text>'
          + '<rect x="32" y="128" width="66" height="30" rx="4" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="65" y="147" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">User B</text>'
          + '<rect x="32" y="170" width="66" height="30" rx="4" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="65" y="189" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">User C</text>'
          // Load balancer
          + '<line x1="98" y1="101" x2="140" y2="130" stroke="var(--muted)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="98" y1="143" x2="140" y2="143" stroke="var(--muted)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="98" y1="185" x2="140" y2="156" stroke="var(--muted)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<rect x="148" y="112" width="76" height="62" rx="6" fill="rgba(251,191,36,.10)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="186" y="138" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Load</text>'
          + '<text x="186" y="154" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Balancer</text>'
          + '<text x="186" y="168" text-anchor="middle" fill="var(--muted)" font-size="9">Round robin</text>'
          // Servers
          + '<line x1="224" y1="128" x2="266" y2="106" stroke="var(--text-2)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="224" y1="143" x2="266" y2="143" stroke="var(--text-2)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="224" y1="158" x2="266" y2="180" stroke="var(--text-2)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<rect x="274" y="92" width="120" height="28" rx="4" fill="rgba(52,211,153,.10)" stroke="var(--brand-border)" stroke-width="1"/>'
          + '<text x="334" y="111" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server 1</text>'
          + '<rect x="274" y="130" width="120" height="28" rx="4" fill="rgba(52,211,153,.10)" stroke="var(--brand-border)" stroke-width="1"/>'
          + '<text x="334" y="149" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server 2</text>'
          + '<rect x="274" y="168" width="120" height="28" rx="4" fill="rgba(52,211,153,.10)" stroke="var(--brand-border)" stroke-width="1"/>'
          + '<text x="334" y="187" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server 3</text>'
          // Shared store, own row
          + '<line x1="334" y1="158" x2="334" y2="238" stroke="var(--text-2)" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#ssv1)"/>'
          + '<rect x="234" y="246" width="180" height="46" rx="6" fill="rgba(52,211,153,.08)" stroke="var(--brand-border)" stroke-width="1.2"/>'
          + '<text x="324" y="268" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">Redis / DB</text>'
          + '<text x="324" y="284" text-anchor="middle" fill="var(--muted)" font-size="10">Shared session store</text>'
          // Results, own row with real clearance from the bottom border
          + '<text x="32" y="336" fill="var(--text)" font-size="12" font-weight="700">Result</text>'
          + '<text x="32" y="358" fill="var(--text-2)" font-size="11">+ Server dies, no state lost</text>'
          + '<text x="32" y="378" fill="var(--text-2)" font-size="11">+ Scale by just adding servers</text>'
          + '<text x="32" y="398" fill="var(--text-2)" font-size="11">+ Any instance can serve any request</text>'
          // Right panel: STATEFUL
          + '<rect x="480" y="12" width="428" height="436" rx="10" fill="rgba(248,113,113,.04)" stroke="var(--border-strong)" stroke-width="1.5"/>'
          + '<text x="694" y="38" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="800">STATEFUL</text>'
          + '<text x="694" y="58" text-anchor="middle" fill="var(--muted)" font-size="12">Each user pinned to one server</text>'
          // Users column
          + '<rect x="500" y="86" width="66" height="30" rx="4" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="533" y="105" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">User A</text>'
          + '<rect x="500" y="128" width="66" height="30" rx="4" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="533" y="147" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">User B</text>'
          + '<rect x="500" y="170" width="66" height="30" rx="4" fill="rgba(108,140,255,.12)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="533" y="189" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">User C</text>'
          // Load balancer (sticky)
          + '<line x1="566" y1="101" x2="608" y2="130" stroke="var(--muted)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="566" y1="143" x2="608" y2="143" stroke="var(--muted)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="566" y1="185" x2="608" y2="156" stroke="var(--muted)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<rect x="616" y="112" width="76" height="62" rx="6" fill="rgba(251,191,36,.10)" stroke="var(--border-strong)" stroke-width="1.2"/>'
          + '<text x="654" y="138" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Load</text>'
          + '<text x="654" y="154" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Balancer</text>'
          + '<text x="654" y="168" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="700">Sticky / IP hash</text>'
          // Servers, each pinned to one user's session
          + '<line x1="692" y1="128" x2="734" y2="106" stroke="var(--text-2)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="692" y1="143" x2="734" y2="143" stroke="var(--text-2)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<line x1="692" y1="158" x2="734" y2="180" stroke="var(--text-2)" stroke-width="1.2" marker-end="url(#ssv1)"/>'
          + '<rect x="742" y="92" width="140" height="28" rx="4" fill="rgba(251,146,60,.10)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="812" y="111" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server 1: A\u2019s session</text>'
          + '<rect x="742" y="130" width="140" height="28" rx="4" fill="rgba(251,146,60,.16)" stroke="var(--brand-border)" stroke-width="1.4"/>'
          + '<text x="812" y="149" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server 2: B\u2019s session</text>'
          + '<rect x="742" y="168" width="140" height="28" rx="4" fill="rgba(251,146,60,.10)" stroke="var(--border-strong)" stroke-width="1"/>'
          + '<text x="812" y="187" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="700">Server 3: C\u2019s session</text>'
          // Crash indicator, own row
          + '<rect x="702" y="246" width="180" height="46" rx="6" fill="rgba(248,113,113,.10)" stroke="var(--border-strong)" stroke-width="1.2" stroke-dasharray="4,3"/>'
          + '<text x="792" y="268" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">Server 2 dies</text>'
          + '<text x="792" y="284" text-anchor="middle" fill="var(--muted)" font-size="10">User B\u2019s session is lost</text>'
          // Results, own row with real clearance from the bottom border
          + '<text x="500" y="336" fill="var(--text)" font-size="12" font-weight="700">Result</text>'
          + '<text x="500" y="358" fill="var(--text-2)" font-size="11">- Server dies, state is lost</text>'
          + '<text x="500" y="378" fill="var(--text-2)" font-size="11">- Can\u2019t freely move users between servers</text>'
          + '<text x="500" y="398" fill="var(--text-2)" font-size="11">- Needs sticky sessions and replication</text>'
          + '</svg>'
      },
      cards: [
        { icon: "\u25cb", title: "Stateless", color: "teal", body: "No memory between requests, every request is a stranger, self-contained. Scales by adding more instances: any instance serves any request, a crash loses nothing." },
        { icon: "\u25cf", title: "Stateful", color: "orange", body: "The server remembers past interactions (a session held in local memory). Needs <strong>sticky sessions</strong> (same user \u2192 same server via IP hash), and a crash loses that user\u2019s state entirely." }
      ],
      table: {
        headers: ["Aspect", "Stateless", "Stateful"],
        rows: [
          ["Memory", "<strong>No memory</strong>, every request self-contained", "Remembers, keeps session and past actions"],
          ["Scaling", "<strong>Just add servers</strong>, any instance handles any request", "Sticky sessions + coordination, same user \u2192 same server"],
          ["Failure", "<strong>Any server takes over</strong>, no state lost on crash", "State lost on crash, needs replication or persistence"],
          ["State lives in", "<strong>Redis / DB / JWT</strong>, externalized from the server", "Server memory, tied to a specific instance"],
          ["Examples", "REST APIs, HTTP services, JWT auth, app servers with Redis", "WebSocket chat, game servers, DB connections, in-memory login sessions"],
          ["Load Balancer", "<strong>Round Robin</strong>, any server, no special routing", "IP Hash / Cookie, must route to the same server"]
        ]
      },
      intro: "Converting stateful to stateless: move session storage to <strong>Redis</strong> (a shared store every server reads from) so the service becomes stateless, or move auth to a <strong>JWT</strong> (the token itself carries user context, no server-side session needed at all). This is how companies horizontally scale without sticky sessions."
    },
    realWorld: {
      heading: "Netflix, WhatsApp, Kubernetes, game servers",
      points: [
        { label: "Netflix", body: "Runs stateless API servers with session data kept in <strong>Redis</strong>, not in server memory." },
        { label: "WhatsApp", body: "WebSocket connections are stateful, pinned to a specific server, with presence tracked separately in Redis." },
        { label: "Kubernetes", body: "Pods are stateless by design: they can be killed and restarted anytime with no coordination needed." },
        { label: "Game servers", body: "The opposite extreme: fully stateful, with the entire match state in memory, which is exactly why they're hard to migrate mid-game." }
      ]
    },
    handsOn: {
      prerequisites: "Docker installed; basic Node.js or Python.",
      setup: "Local/free: 2 app instances (Docker or 2 terminal windows on different ports) storing session in local memory. Cloud free-tier: AWS ElastiCache free tier (or a local docker run -d -p 6379:6379 redis) as the shared store.",
      simulate: "Build a 5-line login endpoint that stores {userId: loggedInAt} in a local in-memory object (stateful version). Log in against instance A, then send your next request to instance B (simulate a load balancer round-robining you). Observe it treats you as logged out. Now swap the in-memory store for redis.set(sessionId, userId) / redis.get(sessionId) and repeat. Both instances now recognize the session.",
      observe: "The exact moment the \u201cdifferent server, same user\u201d failure happens with local state, and disappears once state moves to Redis.",
      stretch: "Kill instance A entirely mid-session (stateful crash = session lost) vs kill it after moving to Redis (session survives, because it never lived on that instance)."
    }
  },
  keyTakeaways: [
    "<strong>Redis</strong> (shared store) or <strong>JWTs</strong> (self-contained token) are the two standard fixes for converting stateful to stateless.",
    "One-liner: <strong>stateless</strong> = no memory, near-infinite scale (REST API). <strong>Stateful</strong> = memory, scaling pain (game server, in-memory sessions). Best practice: externalize state."
  ],
  proTip: "Kubernetes Pods being killable and restartable anytime is a direct consequence of being designed stateless. Statefulness is the exception (StatefulSets), not the default.",
  related: ["scaling-basics", "redis-cache", "authentication", "serialization"],
  bridgeOut: "\u201cExternalize state to Redis\u201d means writing an object somewhere, and an object sitting in memory isn\u2019t the same thing as bytes on a wire."
};
