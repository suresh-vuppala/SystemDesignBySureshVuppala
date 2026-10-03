/* === Lesson authentication - part of Module 4 (Security) ===
   Source: system-design-cheatsheet/03-security.html (#authentication)
   + system-design-cheatsheet-course-hierarchy.md, Module 4.1.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["authentication"] = {
  module: 4, num: "4.1", title: "Authentication",
  connectsFrom: "Every API pattern in Module 3 assumed a caller, but nothing so far has actually verified who that caller is. Without authentication, \u201cadd to cart\u201d and \u201ctransfer $10,000\u201d look identical to a server that never checks.",
  tabs: {
    overview: {
      heading: "Verifying Identity: Who Are You?",
      intro: "Authentication answers one question: <strong>who are you?</strong> There are 7 common ways to prove it, spanning a spectrum from the weakest (credentials on every request) to the strongest (cryptographic and phishing-resistant identity).",
      table: {
        headers: ["Method", "Mechanism", "Stateless?", "Best For", "Security Level"],
        rows: [
          ["<strong>Basic Auth</strong>", "base64(user:pass) in header", "Yes", "Internal APIs, dev/test", "<strong>Low</strong>: credentials in every request"],
          ["<strong>API Key</strong>", "X-API-Key header or query param", "Yes", "Service-to-service, third-party", "Medium: no expiry by default"],
          ["<strong>Session Cookie</strong>", "Server-side session store + cookie ID", "No (stateful)", "Traditional web apps", "Medium: CSRF risk, server state"],
          ["<strong>JWT (Bearer)</strong>", "Signed token with claims", "<strong>Yes</strong>", "APIs, microservices, mobile", "<strong>High</strong>: self-contained, verifiable"],
          ["<strong>OAuth 2.0 + OIDC</strong>", "Delegated auth via authorization server", "Yes (token-based)", "SSO, social login, third-party access", "<strong>High</strong>: industry standard"],
          ["<strong>mTLS</strong>", "Mutual X.509 certificates", "Yes", "Service mesh, zero-trust", "<strong>Highest</strong>: cryptographic identity"],
          ["<strong>Passkeys / WebAuthn</strong>", "FIDO2 public key credential", "Yes", "Passwordless user login", "<strong>Highest</strong>: phishing-resistant"]
        ]
      },
      tables: [
        {
          title: "OAuth 2.0 flows: choosing the right grant type",
          headers: ["Flow", "Client Type", "Use Case", "Security"],
          rows: [
            ["<strong>Authorization Code + PKCE</strong>", "Public (SPA, mobile, CLI)", "User login, \u201cSign in with Google\u201d", "<strong>Most secure</strong>, no client secret exposed"],
            ["<strong>Client Credentials</strong>", "Confidential (backend service)", "Machine-to-machine, no user context", "High, client_id + client_secret"],
            ["<strong>Device Code</strong>", "Input-constrained (TV, IoT)", "User authorizes on separate device", "High, out-of-band verification"],
            ["<strong>Refresh Token</strong>", "Any", "Get new access token without re-login", "Rotate on use, bind to device"],
            ["<strong>Implicit</strong>", "N/A", "<strong>DEPRECATED</strong>", "<strong>Insecure</strong>, token in URL fragment"]
          ]
        }
      ],
      cards: [
        { icon: "J", title: "JWT Structure", color: "blue", body: "A JWT is 3 dot-separated parts: <strong>header.payload.signature</strong>. Header carries <strong>alg</strong> and <strong>typ</strong>; payload carries <strong>sub</strong> (user ID), <strong>exp</strong> (expiry), <strong>role</strong>, and <strong>iss</strong> (issuer)." },
        { icon: "H", title: "HS256 vs RS256", color: "purple", body: "<strong>HS256</strong> is symmetric (one shared secret). <strong>RS256/ES256</strong> is asymmetric: a private key signs, a public key verifies. Sharing an HS256 secret across services lets any of them forge tokens." },
        { icon: "O", title: "OAuth Grant Types", color: "green", body: "<strong>Authorization Code + PKCE</strong> (browser/mobile, safe default), <strong>Client Credentials</strong> (machine-to-machine), <strong>Device Code</strong> (TVs/CLIs), <strong>Refresh Token</strong> (long sessions), and <strong>Implicit</strong> (deprecated, token in URL fragment)." }
      ],
      callouts: [
        { color: "green", label: "OAuth 2.0 flows:", body: "<strong>Authorization Code + PKCE</strong> is the most secure for public clients (SPA, mobile, CLI): no client secret is exposed. <strong>Client Credentials</strong> suits confidential backend services. <strong>Device Code</strong> handles input-constrained devices like TVs and IoT." },
        { color: "yellow", label: "Microservices auth pattern:", body: "An <strong>API Gateway</strong> validates the JWT \u2192 extracts claims \u2192 passes user context in headers \u2192 downstream services trust the gateway. Use <strong>token exchange</strong> for service-to-service calls (audience-restricted tokens) and <strong>service accounts</strong> for machine identity." }
      ]
    },
    realWorld: {
      heading: "Where Authentication Shows Up",
      points: [
        { label: "Identity providers", body: "<strong>Auth0</strong> for universal login with social and enterprise SSO. <strong>Keycloak</strong> for open-source, self-hosted. <strong>Firebase Auth</strong> is mobile-first. <strong>Okta</strong> for enterprise workforce identity. <strong>AWS Cognito</strong> for serverless user pools." },
        { label: "Google", body: "OIDC tokens for all API access." },
        { label: "Stripe", body: "Scoped API keys with restricted permissions." },
        { label: "GitHub", body: "Fine-grained personal access tokens replacing the classic tokens." },
        { label: "Cloudflare", body: "Access replaces the VPN with an identity-aware proxy." }
      ]
    },
    tradeoffs: {
      heading: "Token Security and MFA",
      points: [
        { label: "Access token", body: "Short-lived (15 min), kept in memory." },
        { label: "Refresh token", body: "Longer (7d), stored in an httpOnly cookie, rotated on use." },
        { label: "Storage", body: "Use an httpOnly + Secure + SameSite=Strict cookie. <strong>Never</strong> localStorage (XSS-stealable) or URL params (leak into logs)." },
        { label: "MFA strength", body: "<strong>WebAuthn/Passkeys</strong> and <strong>hardware keys</strong> (YubiKey, FIDO2) are strongest and phishing-proof. <strong>TOTP</strong> (Google Authenticator, Authy) and push (Duo) are solid. <strong>SMS</strong> is the weakest: SIM-swap attacks." },
        { label: "Anti-patterns to avoid", body: "Rolling your own auth, long-lived tokens without rotation, symmetric JWT (HS256) shared across services, and no rate-limiting on login (credential stuffing)." }
      ]
    },
    handsOn: {
      goal: "Sign a real JWT, decode it in the browser, then prove that tampering and expiry produce two distinct, deliberate verification failures.",
      stack: "Node.js + <code>jsonwebtoken</code>, with jwt.io (free, in-browser) for decoding. Local and free.",
      steps: [
        {
          title: "Install the library",
          code: "npm init -y && npm install jsonwebtoken",
          lang: "bash"
        },
        {
          title: "Sign an HS256 token that expires in 15 minutes",
          body: "Save as <code>sign.js</code>.",
          code: "const jwt = require('jsonwebtoken');\nconst secret = 'dev-secret-change-me';\nconst token = jwt.sign(\n  { sub: 'user123', role: 'admin' },\n  secret,\n  { algorithm: 'HS256', expiresIn: '15m' }\n);\nconsole.log(token);",
          lang: "javascript"
        },
        {
          title: "Print it and decode it at jwt.io",
          body: "Paste the printed token into jwt.io and match the decoded <strong>header</strong>, <strong>payload</strong>, and <strong>signature</strong> to the fields named in the overview.",
          code: "node sign.js",
          lang: "bash"
        },
        {
          title: "Verify a valid, a tampered, and an expired token",
          body: "Save as <code>verify.js</code>. The tampered token has its last signature characters overwritten; the expired one is signed with a negative lifetime.",
          code: "const jwt = require('jsonwebtoken');\nconst secret = 'dev-secret-change-me';\n\nfunction check(label, token) {\n  try {\n    console.log(label, 'OK   ->', jwt.verify(token, secret));\n  } catch (e) {\n    console.log(label, 'FAIL ->', e.name + ':', e.message);\n  }\n}\n\nconst valid = jwt.sign({ sub: 'user123', role: 'admin' }, secret, { algorithm: 'HS256', expiresIn: '15m' });\nconst tampered = valid.slice(0, -4) + 'AAAA';\nconst expired = jwt.sign({ sub: 'user123' }, secret, { algorithm: 'HS256', expiresIn: '-1s' });\n\ncheck('(a) valid   ', valid);\ncheck('(b) tampered', tampered);\ncheck('(c) expired ', expired);",
          lang: "javascript"
        },
        {
          title: "Run the verifier",
          code: "node verify.js",
          lang: "bash"
        }
      ],
      observe: "Case (b) fails signature verification instantly (any change to header or payload invalidates the signature), and case (c) fails with a distinct <code>TokenExpiredError</code>: two different, deliberately distinguishable failure reasons.",
      stretch: "Sign a token with HS256 using a secret, then try to verify it as if it were RS256 with a public key. This confirms why mixing algorithms across services without care is exploitable (the classic \u201calg confusion\u201d JWT attack), and why the shared-secret anti-pattern is a real, documented vulnerability class."
    }
  },
  keyTakeaways: [
    "Authentication answers <strong>who are you</strong>, on a spectrum from Basic Auth (weakest) through JWT and OAuth to mTLS and Passkeys (strongest, phishing-resistant).",
    "A JWT is <strong>header.payload.signature</strong>; HS256 is symmetric (shared secret) while RS256/ES256 is asymmetric (private key signs, public key verifies).",
    "Keep access tokens short-lived and in memory, refresh tokens in httpOnly cookies, and never store tokens in localStorage; add MFA and rate-limit login."
  ],
  proTip: "Never roll your own auth. Reach for a battle-tested identity provider, keep access tokens short-lived, and treat any token you can read in localStorage as already compromised.",
  related: ["authorization", "encryption", "http-https", "zero-trust", "stateless-stateful"],
  bridgeOut: "Knowing who someone is does not say what they are allowed to touch. That is the very next, deliberately separate question: authorization."
};
