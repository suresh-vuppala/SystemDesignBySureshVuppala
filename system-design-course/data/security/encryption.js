/* === Lesson encryption - part of Module 4 (Security) ===
   Source: system-design-cheatsheet/03-security.html (#encryption)
   + system-design-cheatsheet-course-hierarchy.md, Module 4.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["encryption"] = {
  module: 4, num: "4.3", title: "Encryption",
  connectsFrom: "You now know who is calling and what they are allowed to do. Encryption is what stops anyone else from reading the data even if they intercept it in transit or steal the disk it is sitting on.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "algorithms", label: "Algorithms", icon: "hex" },
    { key: "secrets", label: "Secrets Management", icon: "layers" },
    { key: "realWorld", label: "Real-World", icon: "globe" },
    { key: "tradeoffs", label: "Do & Never Do", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Protecting Data at Rest and in Transit",
      intro: "Encryption comes in 3 flavors: <strong>symmetric</strong> (one key both directions, fast), <strong>asymmetric</strong> (a public/private pair, slower, for key exchange and signing), and <strong>hashing</strong> (one-way, for passwords and integrity). Picking the right algorithm for each job is the core skill; the <strong>Algorithms</strong> tab is the full reference.",
      cards: [
        { icon: "S", title: "Symmetric", color: "blue", body: "The <strong>same key</strong> encrypts and decrypts. Fast thanks to hardware AES-NI. Default is <strong>AES-256-GCM</strong>. Use for disk, database, and S3 SSE encryption." },
        { icon: "A", title: "Asymmetric", color: "green", body: "A <strong>public key</strong> encrypts, a <strong>private key</strong> decrypts. Roughly 1000\u00d7 slower than AES, so it is used for the TLS handshake, JWT signing, SSH, and PGP." },
        { icon: "H", title: "Hashing", color: "orange", body: "An <strong>irreversible</strong> one-way transform with no key: you can verify without storing the secret. Use bcrypt/Argon2id for passwords and SHA-256 for integrity." },
        { icon: "E", title: "Envelope Encryption", color: "purple", body: "A fast symmetric <strong>DEK</strong> encrypts the data; a slower <strong>KEK</strong> in an HSM encrypts the DEK. Rotating the master key re-wraps only the small DEKs, never the bulk data." }
      ]
    },
    algorithms: {
      heading: "Algorithms and Where They Apply",
      intro: "One reference table for which algorithm fits which job, then where encryption sits in transit and at rest.",
      table: {
        headers: ["Type", "Algorithm", "Key Size", "Use Case", "Notes"],
        rows: [
          ["<strong>Symmetric</strong>", "AES-256-GCM", "256-bit", "Data at rest, disk, DB column encryption", "<strong>Standard choice</strong>. GCM provides authentication."],
          ["<strong>Symmetric</strong>", "ChaCha20-Poly1305", "256-bit", "TLS on mobile (no AES-NI)", "Software-fast, used by WireGuard"],
          ["<strong>Asymmetric</strong>", "RSA-2048+", "2048-4096 bit", "TLS certs, JWT RS256 signing", "Slow, being replaced by ECDSA"],
          ["<strong>Asymmetric</strong>", "ECDSA (P-256)", "256-bit", "TLS 1.3, JWT ES256, SSH keys", "<strong>Preferred</strong>. Smaller keys, faster."],
          ["<strong>Asymmetric</strong>", "Ed25519", "256-bit", "SSH keys, signing", "Fastest, simplest, no config pitfalls"],
          ["<strong>Key Exchange</strong>", "X25519 (ECDH)", "256-bit", "TLS 1.3 key exchange", "Forward secrecy (new key per session)"],
          ["<strong>Hashing</strong>", "bcrypt / Argon2id", "N/A", "Password storage", "<strong>Slow by design</strong>. Salt + work factor."],
          ["<strong>Hashing</strong>", "SHA-256 / SHA-3", "N/A", "Integrity checks, HMAC, content addressing", "Fast. Never for passwords."],
          ["<strong>Envelope</strong>", "DEK + KEK", "Varies", "Cloud KMS pattern (AWS, GCP, Azure)", "Master key never leaves HSM"]
        ]
      },
      callouts: [
        { color: "green", label: "TLS 1.3 in transit:", body: "A <strong>1-RTT handshake</strong> (vs 2-RTT in TLS 1.2), with 0-RTT resumption possible. A typical suite is TLS_AES_256_GCM_SHA384 with <strong>X25519</strong> key exchange (forward secrecy) and an Ed25519 cert. Use <strong>mTLS</strong> service-to-service, <strong>VPN/WireGuard</strong> site-to-site, and <strong>SSH</strong> for admin access." },
        { color: "blue", label: "At rest:", body: "<strong>Disk</strong> (LUKS, BitLocker, EBS encryption), <strong>database</strong> TDE (Transparent Data Encryption), <strong>object storage</strong> (S3 SSE-KMS, GCS CMEK), and <strong>column-level</strong> encryption for individual sensitive PII fields." }
      ]
    },
    secrets: {
      heading: "Secrets Management",
      intro: "Encryption is only as strong as your key handling. Never hardcode secrets; store them in a dedicated system with rotation and audit.",
      table: {
        headers: ["Tool", "Type", "Key Feature", "Use Case"],
        rows: [
          ["<strong>HashiCorp Vault</strong>", "Secrets engine", "Dynamic secrets, auto-rotation, audit log", "DB creds, API keys, PKI certs"],
          ["<strong>AWS Secrets Manager</strong>", "Managed", "Auto-rotation for RDS, Redshift", "AWS-native apps, Lambda"],
          ["<strong>AWS SSM Parameter Store</strong>", "Config + secrets", "Free tier, hierarchical paths", "Config values, non-rotating secrets"],
          ["<strong>GCP Secret Manager</strong>", "Managed", "IAM-based access, versioning", "GCP workloads"],
          ["<strong>Azure Key Vault</strong>", "Managed", "HSM-backed, cert management", "Azure workloads, .NET integration"],
          ["<strong>SOPS</strong>", "File encryption", "Encrypt values in YAML/JSON, git-friendly", "GitOps, IaC secrets in repo"],
          ["<strong>K8s External Secrets</strong>", "Operator", "Sync from Vault/AWS/GCP \u2192 K8s Secrets", "K8s workloads needing external secrets"]
        ]
      }
    },
    realWorld: {
      heading: "Encryption in Production",
      points: [
        { label: "AWS", body: "KMS + envelope encryption for S3, EBS, and RDS, on by default." },
        { label: "Google", body: "Default encryption at rest with Google-managed keys, plus a CMEK option." },
        { label: "Stripe", body: "PGP for API key delivery, AES-256 for card data." },
        { label: "Signal", body: "The Double Ratchet protocol gives forward secrecy per message." },
        { label: "Secrets tooling", body: "<strong>HashiCorp Vault</strong> (dynamic secrets, auto-rotation), <strong>AWS Secrets Manager</strong>, <strong>AWS SSM Parameter Store</strong>, <strong>GCP Secret Manager</strong>, <strong>Azure Key Vault</strong>, <strong>SOPS</strong> (git-friendly), and <strong>K8s External Secrets</strong>." }
      ],
      callouts: [
        { color: "yellow", label: "Compliance drivers:", body: "<strong>PCI-DSS</strong> (encrypt cardholder data, rotate keys annually), <strong>HIPAA</strong> (encrypt PHI at rest and in transit), <strong>GDPR</strong> (encryption as a technical safeguard), and <strong>SOC 2</strong> (demonstrate encryption controls in audit)." }
      ]
    },
    tradeoffs: {
      heading: "Do and Never Do",
      points: [
        { label: "Do", body: "Use <strong>AES-256-GCM</strong> (authenticated encryption), <strong>bcrypt/Argon2id</strong> for passwords (cost factor \u2265 12), <strong>envelope encryption</strong> for data at rest, rotate keys (90 days for data keys), enable <strong>TLS 1.3</strong> everywhere, and use <strong>forward secrecy</strong>." },
        { label: "Never", body: "<strong>MD5/SHA1 for passwords</strong> (rainbow tables), <strong>ECB mode</strong> (reveals patterns), <strong>hardcoded keys</strong>, <strong>reused IVs/nonces</strong> (breaks AES-GCM completely), rolling your own crypto, or logging sensitive data." },
        { label: "Key rotation", body: "Envelope encryption makes rotation cheap: rotate the master key (KEK) and re-wrap the data keys; the data itself does not need re-encryption. KMS can auto-rotate, keeping old key versions for decrypting existing data." },
        { label: "Secrets anti-patterns", body: "Secrets in a .env committed to git (scan with gitleaks/truffleHog), the same key across all environments (a dev leak becomes a prod compromise), no rotation, and client-side encryption with no key escrow (data lost if the key is lost)." }
      ]
    },
    handsOn: {
      goal: "Encrypt with AES-256-GCM and watch a wrong nonce fail authentication, then time MD5, SHA-1, and bcrypt to feel why a slow hash is the point for passwords.",
      stack: "Node.js built-in <code>crypto</code> plus <code>bcryptjs</code> (pure JS, no native build). Local and free.",
      steps: [
        {
          title: "Install the password-hashing library",
          code: "npm init -y && npm install bcryptjs",
          lang: "bash"
        },
        {
          title: "Encrypt once, then decrypt with a wrong and a correct nonce",
          body: "AES-256-GCM authenticates the ciphertext, so decrypting with a different IV fails instead of silently returning garbage. Save as <code>aes.js</code>.",
          code: "const crypto = require('crypto');\n\nconst key = crypto.randomBytes(32); // AES-256 key\nconst iv = crypto.randomBytes(12);  // GCM nonce\n\nfunction encrypt(text, iv) {\n  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);\n  const ct = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);\n  return { ct, tag: cipher.getAuthTag() };\n}\n\nfunction decrypt(ct, tag, iv) {\n  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);\n  d.setAuthTag(tag);\n  return Buffer.concat([d.update(ct), d.final()]).toString('utf8');\n}\n\nconst { ct, tag } = encrypt('transfer 1000 to alice', iv);\nconsole.log('ciphertext:', ct.toString('hex'));\n\ntry {\n  console.log('wrong IV   ->', decrypt(ct, tag, crypto.randomBytes(12)));\n} catch (e) {\n  console.log('wrong IV   -> FAILED:', e.message);\n}\nconsole.log('correct IV ->', decrypt(ct, tag, iv));",
          lang: "javascript"
        },
        {
          title: "Run the AES demo",
          code: "node aes.js",
          lang: "bash"
        },
        {
          title: "Time three ways to hash the same password",
          body: "MD5 and SHA-1 are general-purpose fast hashes; bcrypt is deliberately slow, tuned by its cost factor. Save as <code>hash.js</code>.",
          code: "const crypto = require('crypto');\nconst bcrypt = require('bcryptjs');\n\nconst password = 'hunter2';\n\nfunction time(label, fn) {\n  const t = process.hrtime.bigint();\n  fn();\n  const ms = Number(process.hrtime.bigint() - t) / 1e6;\n  console.log(label, ms.toFixed(3), 'ms');\n}\n\ntime('MD5   ', () => crypto.createHash('md5').update(password).digest('hex'));\ntime('SHA-1 ', () => crypto.createHash('sha1').update(password).digest('hex'));\ntime('bcrypt', () => bcrypt.hashSync(password, 12)); // cost factor 12",
          lang: "javascript"
        },
        {
          title: "Run the hashing benchmark",
          code: "node hash.js",
          lang: "bash"
        }
      ],
      observe: "MD5 and SHA-1 finish in a fraction of a millisecond (bad for passwords, exactly why they are banned), while bcrypt takes tens of milliseconds. That slowness, tunable via the cost factor, is the actual defense against brute-forcing a leaked hash: fast is a liability specifically for passwords, even though speed is a virtue everywhere else.",
      stretch: "Build a tiny envelope-encryption demo: generate a DEK, encrypt your data with it, then encrypt the DEK itself with a second \u201cKEK\u201d key. Rotate the KEK (re-encrypt only the small DEK) and confirm you never touched the original encrypted data, the exact reason envelope encryption exists."
    }
  },
  keyTakeaways: [
    "3 tools for 3 jobs: <strong>symmetric</strong> (AES-256-GCM, fast, bulk data), <strong>asymmetric</strong> (RSA/ECDSA/Ed25519, key exchange and signing), and <strong>hashing</strong> (bcrypt/Argon2id for passwords, SHA-256 for integrity).",
    "<strong>Envelope encryption</strong> pairs a fast per-object DEK with a KEK kept in an HSM, so rotating the master key re-wraps only the small keys, not the bulk data.",
    "Encrypt in transit (TLS 1.3, mTLS, WireGuard, SSH) and at rest (disk, TDE, SSE-KMS, column-level), store secrets in Vault/KMS, and never hardcode keys or reuse nonces."
  ],
  proTip: "When speed is a virtue everywhere else, passwords are the exception: choose a hash that is deliberately slow (bcrypt/Argon2id). And never roll your own crypto; reach for AES-256-GCM and vetted libraries.",
  related: ["authentication", "authorization", "http-https", "zero-trust"],
  bridgeOut: "This closes Module 4. Infrastructure opens next, and its Load Balancer and Gateway lessons assume TLS termination, explained here, as a given capability those components provide."
};
