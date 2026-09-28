/* === Lesson http-https - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#http-https)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.4.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["http-https"] = {
  module: 2, num: "2.4", title: "HTTP / HTTPS",
  connectsFrom: "TCP gives you a reliable pipe for delivering data in order and retransmitting anything that gets lost. HTTP defines what is sent through that pipe, like requests, responses, cookies, and page content. HTTPS adds TLS to HTTP, encrypting the data and protecting it from being read or modified in transit. IP handles where the data needs to go.",
  tabs: {
    overview: {
      heading: "Methods, Status Codes, and the TLS Handshake",
      intro: "HTTP is the <strong>application-layer</strong> protocol of the web: <span class=\"hr\">plaintext</span> on its own, <strong>TLS-encrypted</strong> as HTTPS. You need three things cold: the methods and their properties, the status-code families, and what the TLS handshake buys you.",
      table: {
        headers: ["Method", "Purpose", "Idempotent", "Safe", "Cacheable"],
        rows: [
          ["<strong>GET</strong>", "Retrieve", "Yes", "Yes", "Yes"],
          ["<strong>POST</strong>", "Create", "No", "No", "No"],
          ["<strong>PUT</strong>", "Replace", "Yes", "No", "No"],
          ["<strong>PATCH</strong>", "Partial update", "No", "No", "No"],
          ["<strong>DELETE</strong>", "Remove", "Yes", "No", "No"]
        ]
      },
      tables: [
        {
          title: "Status code families",
          headers: ["Family", "Code", "Meaning"],
          rows: [
            ["<strong>2xx Success</strong>", "<strong>200</strong>", "OK"],
            ["<strong>2xx Success</strong>", "<strong>201</strong>", "Created"],
            ["<strong>2xx Success</strong>", "<strong>202</strong>", "Accepted (async)"],
            ["<strong>2xx Success</strong>", "<strong>204</strong>", "No Content"],
            ["<strong>2xx Success</strong>", "<strong>206</strong>", "Partial Content (streaming)"],
            ["<strong>3xx Redirect</strong>", "<strong>301</strong>", "Moved Permanently"],
            ["<strong>3xx Redirect</strong>", "<strong>302</strong>", "Found (temp redirect)"],
            ["<strong>3xx Redirect</strong>", "<strong>304</strong>", "Not Modified (cache)"],
            ["<strong>3xx Redirect</strong>", "<strong>307</strong>", "Temp Redirect (keep method)"],
            ["<strong>3xx Redirect</strong>", "<strong>308</strong>", "Perm Redirect (keep method)"],
            ["<strong>4xx Client Error</strong>", "<strong>400</strong>", "Bad Request"],
            ["<strong>4xx Client Error</strong>", "<strong>401</strong>", "Unauthorized"],
            ["<strong>4xx Client Error</strong>", "<strong>403</strong>", "Forbidden"],
            ["<strong>4xx Client Error</strong>", "<strong>404</strong>", "Not Found"],
            ["<strong>4xx Client Error</strong>", "<strong>405</strong>", "Method Not Allowed"],
            ["<strong>4xx Client Error</strong>", "<strong>408</strong>", "Request Timeout"],
            ["<strong>4xx Client Error</strong>", "<strong>409</strong>", "Conflict"],
            ["<strong>4xx Client Error</strong>", "<strong>410</strong>", "Gone (deleted)"],
            ["<strong>4xx Client Error</strong>", "<strong>413</strong>", "Payload Too Large"],
            ["<strong>4xx Client Error</strong>", "<strong>415</strong>", "Unsupported Media Type"],
            ["<strong>4xx Client Error</strong>", "<strong>422</strong>", "Unprocessable Entity"],
            ["<strong>4xx Client Error</strong>", "<strong>429</strong>", "Too Many Requests"],
            ["<strong>4xx Client Error</strong>", "<strong>451</strong>", "Unavailable For Legal Reasons"],
            ["<strong>5xx Server Error</strong>", "<strong>500</strong>", "Internal Server Error"],
            ["<strong>5xx Server Error</strong>", "<strong>501</strong>", "Not Implemented"],
            ["<strong>5xx Server Error</strong>", "<strong>502</strong>", "Bad Gateway"],
            ["<strong>5xx Server Error</strong>", "<strong>503</strong>", "Service Unavailable"],
            ["<strong>5xx Server Error</strong>", "<strong>504</strong>", "Gateway Timeout"]
          ]
        }
      ],
      callouts: [
        { color: "green", label: "HTTPS guarantees:", body: "<strong>Confidentiality</strong> (AES-256 encryption, nobody reads it), <strong>Integrity</strong> (SHA-256 HMAC, nobody modifies it undetected), <strong>Authenticity</strong> (CA-signed certificate proves server identity), and <strong>Forward secrecy</strong> (ECDHE, a stolen key today does not decrypt yesterday's traffic)." },
        { color: "blue", label: "The TLS handshake:", body: "Happens once per connection, right after the TCP handshake: <strong>ClientHello</strong> \u2192 <strong>ServerHello + certificate</strong> \u2192 <strong>key exchange</strong> \u2192 Finished. The trick: <strong>asymmetric encryption (slow) for the key exchange, then symmetric encryption (fast, AES-256) for the actual data</strong>. TLS 1.3 shortens this to 1 round trip, sometimes 0 with 0-RTT resumption." },
        { color: "yellow", label: "Status code families:", body: "<strong>2xx</strong> success (200 OK, 201 Created, 202 Accepted async, 204 No Content, 206 Partial Content). <strong>3xx</strong> redirect (301/302 permanent/temporary, 304 Not Modified, 307/308 method-preserving). <strong>4xx</strong> client error (400, 401, 403, 404, 409 Conflict, 429 Too Many Requests). <strong>5xx</strong> server error (500, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)." }
      ]
    },
    tradeoffs: {
      heading: "HTTP/1.1 vs HTTP/2 vs HTTP/3",
      points: [
        { label: "HTTP/1.1", body: "One request per TCP connection (or pipelining, rarely used), so browsers open ~6 connections per origin to compensate." },
        { label: "HTTP/2", body: "Binary framing, <strong>multiplexed streams</strong> over a single TCP connection, header compression (HPACK), server push. But TCP head-of-line blocking remains: one lost packet stalls all streams." },
        { label: "HTTP/3 (QUIC over UDP)", body: "Each stream is independent, so a lost packet only stalls its own stream. Built-in TLS 1.3 and <strong>0-RTT resumption</strong>. Adopted by Chrome, YouTube, Cloudflare, and Meta." }
      ]
    },
    handsOn: {
      prerequisites: "`curl` and `openssl` (both usually preinstalled).",
      setup: "None. Test against any public site plus a local plain-HTTP server (`python -m http.server`, which serves HTTP only).",
      simulate: "Run `curl -v http://<your-local-server>` and read the headers in the clear, no TLS lines at all. This is exactly what a coffee-shop router could see. Then run `openssl s_client -connect google.com:443` and observe the certificate chain and negotiated cipher suite. Finally hit a test API (e.g. httpbin.org) with `curl -X POST`, `curl -X PUT`, `curl -X DELETE` and inspect the status codes.",
      observe: "The complete absence of encryption metadata on the plain-HTTP request vs the full handshake detail on the HTTPS one. Also: calling DELETE twice on the same resource returns the same result both times (idempotent), while two POSTs create two separate resources (not idempotent).",
      stretch: "Use `openssl s_client -connect <host>:443 -tls1_3` vs forcing `-tls1_2` and compare the round trips shown before \u201cVerify return code.\u201d TLS 1.3's 1-round-trip handshake vs TLS 1.2's 2 is right there in the output."
    }
  },
  keyTakeaways: [
    "Method properties matter: <strong>GET/PUT/DELETE are idempotent</strong> (safe to retry), <strong>POST/PATCH are not</strong> (retries can duplicate).",
    "HTTPS = HTTP wrapped in TLS, giving confidentiality, integrity, authenticity, and forward secrecy; the handshake uses asymmetric crypto to exchange a symmetric session key.",
    "HTTP/2 multiplexes over one TCP connection; HTTP/3 (QUIC over UDP) removes TCP head-of-line blocking so one lost packet no longer stalls every stream."
  ],
  proTip: "Know your status codes precisely: <strong>401</strong> means \u201cnot authenticated\u201d (who are you?), <strong>403</strong> means \u201cauthenticated but not allowed\u201d (I know you, no). Mixing them up is a classic interview tell.",
  related: ["tcp-udp", "dns", "web-request", "cors", "rest", "sse-deep", "key-ports", "osi", "zero-trust", "authentication", "encryption"],
  bridgeOut: "HTTP methods assume you already know what happened at step 2 of the 8-step journey: the actual lookup that turns a name into an address."
};
