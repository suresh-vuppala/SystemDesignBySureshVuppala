/* === Lesson rate-limiting - part of Module 10 (Scalability) ===
   Source: system-design-cheatsheet/10-scalability.html (#rate-limiting)
   + system-design-cheatsheet-course-hierarchy.md, Module 10.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["rate-limiting"] = {
  module: 10, num: "10.7", title: "Rate Limiting",
  connectsFrom: "One client, whether abusive, buggy, or just enthusiastic, can otherwise consume unlimited capacity, starving every other client of the same shared resource. Rate limiting throttles requests to keep the service fair and available.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "algorithms", label: "Algorithms", icon: "hex" },
    { key: "applying", label: "Where & How", icon: "layers" },
    { key: "choosing", label: "Choosing & Distributed", icon: "swap" },
    { key: "realWorld", label: "Real-World", icon: "globe" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Five Algorithms and What They Trade",
      intro: "Rate limiting throttles requests to improve <strong>availability</strong> (prevent overload), <strong>fairness</strong> (per-user limits), and <strong>cost control</strong> (limit usage), at the cost of rejected requests. The standard rejection is <strong>429 Too Many Requests</strong>. These five algorithms are compared in full in the next tab.",
      cards: [
        { icon: "T", title: "Token Bucket", color: "green", body: "Tokens refill steadily and each request spends one; allows <strong>controlled bursts</strong> up to the bucket size. AWS API Gateway, Stripe." },
        { icon: "L", title: "Leaky Bucket", color: "blue", body: "A FIFO queue drains at a <strong>fixed output rate</strong>, smoothing bursts into a steady stream. Uber\u2019s dispatch, Twilio SMS." },
        { icon: "S", title: "Sliding Window", color: "purple", body: "Sliding Window Log stores every timestamp (exact but memory-heavy); Sliding Window Counter blends adjacent windows (a scalable approximation with <strong>no edge burst</strong>). GitHub, Shopify." },
        { icon: "F", title: "Fixed Window", color: "orange", body: "A simple counter per window. Easy, but allows a <strong>2\u00d7 burst</strong> at the window boundary." }
      ],
      callouts: [
        { color: "blue", label: "Interview tip:", body: "\u201cI would put rate limiting at the API Gateway layer using Redis sorted sets for a sliding window. Per-user limits with API key, per-IP limits for unauthenticated. Return 429 with Retry-After. Fail-open on Redis failure to avoid blocking all traffic.\u201d" }
      ]
    },
    algorithms: {
      heading: "The Five Algorithms Compared",
      intro: "Each algorithm trades burst tolerance against memory and accuracy. Match the algorithm to whether you need to allow spikes, smooth output, or count exactly.",
      table: {
        headers: ["Algorithm", "How It Works", "Burst?", "Memory", "Accuracy", "Best For", "Real-World"],
        rows: [
          ["<strong>Fixed Window</strong><br>\u2192 Simple but unfair", "Counter resets every N seconds (e.g., every minute). Simple <code>INCR</code> + <code>EXPIRE</code>.", "<strong>2\u00d7 at edge</strong>, user sends max at end of window + start of next", "<strong>Low</strong>, 1 counter per key", "Approximate", "Quick to implement, acceptable when occasional unfairness at window edges is fine", "<strong>Twitter/X</strong> \u2192 300 tweets/3hr<br><strong>Basic NGINX</strong> limit_req zone"],
          ["<strong>Sliding Window Log</strong><br>\u2192 Fair and exact", "Store timestamp of each request in sorted set. Count entries within last N seconds.", "<strong>No</strong>", "<strong>High</strong>, stores every request timestamp", "<strong>Exact</strong>", "Must guarantee exact count per user, no one gets even 1 extra request through", "<strong>Financial APIs</strong> \u2192 strict per-second limits<br><strong>Auth endpoints</strong> \u2192 brute-force prevention"],
          ["<strong>Sliding Window Counter</strong><br>\u2192 Fair and scalable", "Weighted blend: prev_window \u00d7 overlap% + current_window count", "<strong>No</strong>", "<strong>Low</strong>, 2 counters per key", "<strong>Accurate</strong> (approx)", "Need fair enforcement without storing every timestamp, best tradeoff for high-volume APIs", "<strong>GitHub API</strong> \u2192 5000 req/hr<br><strong>Shopify</strong> \u2192 40 req/sec per app"],
          ["<strong>Token Bucket</strong><br>\u2192 Controlled bursts", "Bucket fills at fixed rate. Each request consumes 1 token. Empty = reject.", "<strong>Yes (controlled)</strong>, burst up to bucket capacity", "<strong>Low</strong>, 2 values (tokens + last_refill)", "Good", "Allow short spikes while enforcing average rate, users can burst then slow down naturally", "<strong>AWS API Gateway</strong> \u2192 token bucket per stage<br><strong>Stripe</strong> \u2192 100/sec burst allowed<br><strong>NGINX</strong> limit_req with burst param"],
          ["<strong>Leaky Bucket</strong><br>\u2192 Smooth output", "FIFO queue drains at fixed rate. Overflow = reject. Smooths output.", "<strong>No</strong>, perfectly smooth output", "Queue size", "Exact", "Downstream service needs steady traffic, not spikes, protect fragile backends from bursts", "<strong>Uber</strong> \u2192 dispatch queue (smooth ride assignment)<br><strong>Twilio</strong> \u2192 SMS sending at fixed rate<br><strong>Network routers</strong> \u2192 QoS shaping"]
        ]
      }
    },
    applying: {
      heading: "Where to Limit, and What to Do on Reject",
      intro: "Two orthogonal choices beyond the algorithm: the granularity of the limit (whose requests you count) and the action when the limit is hit.",
      table: {
        headers: ["Granularity", "Key Pattern", "Where Applied", "Example", "Why This Level"],
        rows: [
          ["<strong>Per User</strong>", "<code>rate_limit:user:123</code>", "Application / Gateway", "<strong>Instagram</strong> \u2192 100 posts/day per user", "One user shouldn\u2019t spam. Others unaffected."],
          ["<strong>Per IP</strong>", "<code>rate_limit:ip:1.2.3.4</code>", "Edge / CDN / Gateway", "<strong>Login page</strong> \u2192 5 attempts/min per IP", "User identity unknown (pre-auth). Used for login, OTP, signup."],
          ["<strong>Per API Key</strong>", "<code>rate_limit:apikey:abc123</code>", "API Gateway", "<strong>Stripe</strong> \u2192 Partner A: 1000/sec, Partner B: 100/sec", "Each customer pays differently. Tied to billing tier."],
          ["<strong>Per Endpoint</strong>", "<code>rate_limit:endpoint:/generate</code>", "Application / Gateway", "<strong>AI image gen</strong> \u2192 /profile: 1000/min, /generate: 10/min", "Not all APIs cost the same. Expensive endpoints need stricter limits."],
          ["<strong>Global</strong>", "<code>rate_limit:service:total</code>", "Load Balancer / Gateway", "<strong>DB protection</strong> \u2192 entire service max 50K req/sec", "Protect backend from total overload regardless of who sends."]
        ]
      },
      tables: [
        {
          headers: ["Response", "Behavior", "Example", "When to Use"],
          rows: [
            ["<strong>Reject (429)</strong>", "Immediately return <strong>429 Too Many Requests</strong>", "<strong>GitHub</strong>, <strong>Stripe</strong>, public APIs", "Simple, cheap, predictable. Client retries with backoff."],
            ["<strong>Queue</strong>", "Accept request, process later from queue", "<strong>Twilio SMS</strong>, email sending (100K emails queued)", "User wants eventual delivery. Not time-critical."],
            ["<strong>Throttle</strong>", "Degrade quality instead of failing", "<strong>Netflix</strong> \u2192 reduce video bitrate instead of stopping", "Better UX than hard rejection. Graceful degradation."]
          ]
        }
      ],
      callouts: [
        { color: "yellow", label: "Tier the limits to revenue:", body: "<strong>Free</strong> \u2192 100 req/hr \u00b7 <strong>Premium</strong> \u2192 10,000 req/hr \u00b7 <strong>Enterprise</strong> \u2192 100,000 req/hr. Common in SaaS APIs, AI platforms (OpenAI, Anthropic), and cloud services. Store the tier in the user profile and look it up at the gateway." }
      ]
    },
    choosing: {
      heading: "Choosing an Algorithm and Going Distributed",
      intro: "Work down the NFR questions to land on an algorithm and a store, then handle the problems that appear once the limiter spans multiple servers.",
      table: {
        headers: ["NFR Question", "If This...", "Then Choose...", "Why"],
        rows: [
          ["<strong>Scale?</strong>", "Small (100 users, internal)", "Sliding Window Log", "Exact, simple, memory is fine"],
          ["", "Huge (10M+ users)", "Sliding Counter or Token Bucket", "Log stores every timestamp \u2192 memory explosion at scale"],
          ["<strong>Single or Distributed?</strong>", "One server", "In-memory counter", "No network hop needed"],
          ["", "Multiple servers (Uber, Netflix)", "Redis (shared state)", "All nodes must see same count"],
          ["<strong>Accuracy?</strong>", "Security-critical (login, OTP)", "Sliding Window Log", "Even 2 extra attempts matter"],
          ["", "Approximate fine (social posting)", "Sliding Counter / Token Bucket", "101 instead of 100 \u2192 not a disaster"],
          ["<strong>Latency budget?</strong>", "Ultra-sensitive (HFT, gaming)", "Local in-memory limiter", "Redis lookup adds 2-5ms"],
          ["", "Normal APIs (e-commerce, SaaS)", "Redis", "2-5ms acceptable"],
          ["<strong>Limiter store fails?</strong>", "<strong>Fail-Open</strong> (allow traffic)", "Public APIs, product catalog, news", "Availability &gt; protection. Risk abuse over downtime."],
          ["", "<strong>Fail-Closed</strong> (reject traffic)", "Bank login, OTP, admin portal", "Security &gt; availability. Block all over unlimited attacks."]
        ]
      },
      callouts: [
        { color: "green", label: "Distributed challenges:", body: "<strong>Race conditions</strong>: two nodes check simultaneously; fix with a Redis Lua script (atomic). <strong>Clock skew</strong>: use Redis server time. <strong>Redis failure</strong>: fail-open (allow) for public APIs, fail-closed (block) for security-critical." }
      ]
    },
    realWorld: {
      heading: "Real Limits in the Wild",
      points: [
        { label: "Twitter / X", body: "Caps at 300 tweets per 3 hours." },
        { label: "GitHub API", body: "Allows 5,000 requests per hour for authenticated clients." },
        { label: "Shopify", body: "Caps at roughly 40 requests per second." },
        { label: "Throttle instead of reject", body: "Netflix reduces bitrate rather than stopping the stream, a named example of throttle as distinct from reject or queue. Rejection uses RFC 6585 headers: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>, <code>Retry-After</code>." }
      ]
    },
    tradeoffs: {
      heading: "Getting It Wrong",
      intro: "Rate limiting has a handful of well-known anti-patterns that quietly defeat it.",
      points: [
        { label: "Rate limit only at the app layer", body: "A DDoS bypasses it and buries the app before the check runs. Limit at the gateway or edge as well." },
        { label: "No Retry-After header", body: "Clients hammer blindly on rejection instead of backing off, amplifying the overload." },
        { label: "Same limit for all endpoints", body: "<code>/login</code> needs stricter limits than <code>/search</code>. One global limit either starves normal use or lets abuse through." },
        { label: "No differentiation between users", body: "Paid users get the same limits as free, which is both unfair and a missed revenue signal. Fixed Window also allows a 2\u00d7 boundary burst that a sliding window avoids." }
      ]
    },
    handsOn: {
      prerequisites: "Docker (Redis); Node.js or Python; <code>hey</code> or <code>k6</code>.",
      setup: "Local and free: <code>docker run -d -p 6379:6379 redis</code>.",
      simulate: "Implement Token Bucket (10 requests/sec, burst of 20) using a Redis Lua script for the atomic read-check-decrement, in front of a simple endpoint. Load-test with <code>hey -n 200 -c 50</code> and log the ratio of 200s to 429s. Then implement Fixed Window (a simple <code>INCR key EX 1</code>, reject above 10) and repeat the exact same load test, watching requests right at the window boundary.",
      observe: "Token Bucket allows a controlled burst up to 20 before throttling, versus Fixed Window\u2019s known 2\u00d7 boundary-burst: send a burst straddling two windows and count how many got through in that boundary-crossing second.",
      stretch: "Run the Lua-script version and a naive non-atomic version (<code>GET</code> then <code>SET</code> as two calls) side by side under high concurrency (<code>hey -c 200</code>). Count how many requests slip through the non-atomic version above the limit, the exact race the atomic script closes."
    }
  },
  keyTakeaways: [
    "Five algorithms trade burst tolerance against memory and accuracy: Fixed Window (2\u00d7 boundary burst), Sliding Window Log (exact, heavy), Sliding Window Counter (scalable blend), Token Bucket (controlled bursts), Leaky Bucket (fixed drain).",
    "A distributed limiter needs an <strong>atomic</strong> read-check-increment, typically a Redis Lua script, or concurrent requests both slip through.",
    "Limit at the gateway, differentiate by user and endpoint, and always return <strong>429 with Retry-After</strong> so clients back off instead of hammering."
  ],
  proTip: "Decide your Redis-failure policy up front: fail-open for public APIs so an outage does not block all traffic, fail-closed for security-critical endpoints like login where letting requests through is the bigger risk.",
  related: ["consistent-hashing", "backpressure", "auto-scaling", "graceful-degradation", "fault-tolerance"],
  bridgeOut: "Rate limiting protects a service from too many requests. The related but distinct problem, one specific consumer falling behind its producer, is next: backpressure."
};
