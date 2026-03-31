# 🧭 System Design — Complete Learning Roadmap

> Structured, sequential learning reference: foundations → distributed systems → scaling → optimization.
> Columns: S.No · Lesson · Topics Covered · References · Real Engineering Blogs

---

## 📑 Table of Contents

| # | Module | Jump |
|---|--------|------|
| 1 | Foundations | [→ Go](#1-foundations) |
| 2 | Networking and Proxy | [→ Go](#2-networking-and-proxy) |
| 3 | API Layer | [→ Go](#3-api-layer) |
| 4 | Load Balancing | [→ Go](#4-load-balancing) |
| 5 | Caching | [→ Go](#5-caching) |
| 6 | CDN | [→ Go](#6-content-delivery-networks-cdn) |
| 7 | Databases and Storage Design | [→ Go](#7-databases-and-storage-design) |
| 8 | Search Systems | [→ Go](#8-search-systems) |
| 9 | Scaling Database | [→ Go](#9-scaling-database) |
| 10 | Messaging and Async | [→ Go](#10-messaging-and-async-communication) |
| 11 | Data Processing and Storage | [→ Go](#11-data-processing-and-storage-systems) |
| 12 | Distributed Systems Deep Dive | [→ Go](#12-distributed-systems-deep-dive) |
| 13 | Observability and Monitoring | [→ Go](#13-observability-and-monitoring) |
| 14 | Design Patterns and Optimization | [→ Go](#14-design-patterns-and-system-optimization) |

---

## 1. Foundations

### 1.1 Introduction to System Design

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 1 | What, Why, How, When, Where of SD | Purpose of SD, when to apply, scope of design thinking | [HelloInterview — Intro](https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction) · [Gaurav Sen — What is SD?](https://www.youtube.com/watch?v=FSR1s2b-l_I) · [ByteByteGo](https://blog.bytebytego.com/) | [Netflix Tech Blog](https://netflixtechblog.com/) · [Uber Engineering](https://www.uber.com/blog/engineering/) |
| 2 | System Design Framework/Template | Requirements → HLD → LLD → trade-offs, structured approach | [HelloInterview — Delivery](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery) · [Neetcode — SD Template](https://www.youtube.com/watch?v=jPKTo1iGQiE) · [Educative — Grokking SD](https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers) | [Stripe Engineering Blog](https://stripe.com/blog/engineering) |
| 3 | Functional vs Non-Functional Requirements | FR: features/use-cases; NFR: latency, availability, durability, scalability | [HelloInterview — Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery) · [sudoCODE — FR vs NFR](https://www.youtube.com/watch?v=0iyLkFONhO4) | [Airbnb — 20+ Payment Methods in 360 Days](https://medium.com/airbnb-engineering) |
| 4 | Core Challenges in System Design | Scale, consistency, availability, partition tolerance, data integrity | [Gaurav Sen — Challenges](https://www.youtube.com/watch?v=xpDnVSmNFX0) · [DDIA](https://dataintensive.net/) | [Shopify — Flash Sale Architecture](https://shopify.engineering/latest) |
| 5 | Common Constraints: Users, Data, Latency | Millions of concurrent users, petabytes of data, sub-100ms targets | [ByteByteGo — Scale Zero to Millions](https://blog.bytebytego.com/p/scale-from-zero-to-millions-of-users) · [Gaurav Sen — Scaling](https://www.youtube.com/watch?v=tndzLznxq40) | [Discord — Storing Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages) |

### 1.2 Scaling and Performance Basics

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 6 | Horizontal vs Vertical Scaling | Scale-out vs scale-up, elasticity, auto-scaling groups | [HelloInterview — Scaling](https://www.hellointerview.com/learn/system-design/in-a-hurry/scaling) · [Gaurav Sen — H vs V](https://www.youtube.com/watch?v=xpDnVSmNFX0) | [Spotify — Scaling Backend Infra](https://engineering.atspotify.com/) |
| 7 | Capacity Planning & Estimation | QPS/storage/bandwidth math, Jeff Dean's latency numbers | [ByteByteGo — Estimation](https://blog.bytebytego.com/p/back-of-the-envelope-estimation) · [Jeff Dean's Numbers](http://brenocon.com/dean_perf.html) | [Google SRE — Capacity Planning](https://sre.google/sre-book/software-engineering-in-sre/) |
| 8 | Performance Metrics | QPS, TPS, error rates, saturation, utilization | [DDIA Ch. 1](https://dataintensive.net/) · [Gaurav Sen — Metrics](https://www.youtube.com/watch?v=zaRkONvyGr8) | [LinkedIn Engineering](https://engineering.linkedin.com/blog) |
| 9 | Latency & Percentiles (P50, P95, P99) | Tail latency, percentile distributions, SLA implications | [ByteByteGo — Latency Numbers](https://blog.bytebytego.com/p/latency-numbers-every-programmer) · [Gaurav Sen](https://www.youtube.com/watch?v=zaRkONvyGr8) | [Cloudflare — Measuring Edge Latency](https://blog.cloudflare.com/) |
| 10 | Throughput | Messages/sec, requests/sec, data volume/sec, bottleneck analysis | [DDIA Ch. 1](https://dataintensive.net/) · [Hussein Nasser — Throughput](https://www.youtube.com/watch?v=6bMRiJfEGhw) | [Uber — Trillions of Records with Hudi](https://www.uber.com/blog/engineering/) |
| 11 | Bandwidth | Network capacity, data transfer rates, egress costs | [Neetcode](https://neetcode.io/courses/system-design-for-beginners/1) · [ByteByteGo](https://blog.bytebytego.com/) | [Netflix — Open Connect Bandwidth](https://netflixtechblog.com/) |
| 12 | Response Time | End-to-end latency = network + processing + queue time | [DDIA Ch. 1](https://dataintensive.net/) · [High Scalability](http://highscalability.com/) | [Shopify — Reducing Checkout Latency](https://shopify.engineering/latest) |
| 13 | Fault vs Failure — Reliability | Fault tolerance, graceful degradation, Chaos Engineering | [DDIA Ch. 1](https://dataintensive.net/) · [Gaurav Sen — Fault Tolerance](https://www.youtube.com/watch?v=lsd0TgKuGHI) | [Netflix — Chaos Monkey](https://netflixtechblog.com/tagged/chaos-engineering) |

### 1.3 Architecture Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 14 | Client-Server Communication | Request-response, connection management, HTTP lifecycle | [Hussein Nasser — Client Server](https://www.youtube.com/watch?v=L5BlpPU_muY) · [MDN](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview) | [Cloudflare — How the Web Works](https://blog.cloudflare.com/) |
| 15 | Monolithic vs Microservices | Monolith benefits, decomposition strategies, migration patterns | [HelloInterview](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [Gaurav Sen](https://www.youtube.com/watch?v=qYhRvH9tJKw) · [Martin Fowler](https://martinfowler.com/articles/microservices.html) | [Uber — Monolith to Microservices](https://www.uber.com/blog/microservice-architecture/) · [Shopify — Modular Monolith](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity) |
| 16 | Stateful vs Stateless Architectures | Session management, token-based state, horizontal scaling | [ByteByteGo — Stateless (2026)](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=nFPzI_Qg3FU) | [Pinterest — Stateless Services Migration](https://medium.com/pinterest-engineering) |
| 17 | Serverless vs Traditional | FaaS, cold starts, event-driven compute, cost model | [Fireship — Serverless](https://www.youtube.com/watch?v=W_VV2Fx32_Y) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare Workers — Serverless at Edge](https://blog.cloudflare.com/) |
| 18 | Hybrid Cloud vs All-Cloud Storage | On-prem + cloud, data sovereignty, latency trade-offs | [IBM — Hybrid Cloud](https://www.ibm.com/topics/hybrid-cloud) | [Dropbox — Migrating from Cloud to Own Infra](https://dropbox.tech/) |
| 19 | Event-Driven Architecture | Event sourcing, pub/sub, choreography vs orchestration, CQRS | [Gaurav Sen](https://www.youtube.com/watch?v=rJHTK2TfZ1I) · [Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html) | [Wix — Event-Driven Microservices](https://www.wix.engineering/) · [Confluent Blog](https://www.confluent.io/blog/) |

[⬆ Back to Top](#-table-of-contents)

---

## 2. Networking and Proxy

### 2.1 Networking Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 20 | Computer Networks Overview | OSI model, TCP/IP stack, packet flow | [Hussein Nasser — Networking](https://www.youtube.com/watch?v=6G14NrjekLQ) · [Computerphile](https://www.youtube.com/user/Computerphile) | [Cloudflare — Learning Center](https://www.cloudflare.com/learning/) |
| 21 | IP Addressing, Subnets, CIDR | IPv4/IPv6, subnet masks, CIDR notation, VPC design | [Practical Networking — Subnets](https://www.youtube.com/watch?v=ecCuyq-Wprc) · [CIDR.xyz](https://cidr.xyz/) | [Tailscale Blog — Networking](https://tailscale.com/blog) |
| 22 | TCP vs UDP | Reliable vs unreliable, use cases, QUIC protocol | [Hussein Nasser — TCP vs UDP](https://www.youtube.com/watch?v=qqRYkcta6IE) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare — QUIC and HTTP/3](https://blog.cloudflare.com/the-road-to-quic/) |
| 23 | Three-Way Handshake & Connection Lifecycle | SYN, SYN-ACK, ACK, connection teardown, TIME_WAIT | [Computerphile — TCP](https://www.youtube.com/watch?v=LyDqA-dAPW4) | [Cloudflare — TCP Optimization](https://blog.cloudflare.com/) |
| 24 | HTTP vs HTTPS | TLS encryption, certificate chain, mixed content | [ByteByteGo](https://blog.bytebytego.com/) · [Fireship — HTTPS](https://www.youtube.com/watch?v=j9QmMEWmcfo) | [Let's Encrypt — Scaling HTTPS](https://letsencrypt.org/stats/) |
| 25 | DNS: Domain Name System | Recursive/iterative resolution, A/AAAA/CNAME records, DNS hierarchy | [HelloInterview — DNS](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [Hussein Nasser — DNS](https://www.youtube.com/watch?v=27r4Bzuj5NQ) | [Cloudflare — 1.1.1.1 DNS](https://blog.cloudflare.com/dns-resolver-1-1-1-1/) |
| 26 | DNS Caching and TTL | Browser/OS/resolver caching, TTL tuning, DNS propagation | [Cloudflare — DNS TTL](https://www.cloudflare.com/learning/cdn/glossary/time-to-live-ttl/) | [GitHub — DNS Infrastructure](https://github.blog/engineering/) |
| 27 | Ports and Protocols | Well-known ports (80, 443, 5432), protocol multiplexing | [Hussein Nasser — Ports](https://www.youtube.com/watch?v=g_gKI2HCElk) | [Fly.io Blog — Networking](https://fly.io/blog/) |

### 2.2 Network Security and Encryption

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 28 | TLS/SSL Handshake | TLS 1.3, key exchange, certificate validation, 0-RTT | [Computerphile — TLS](https://www.youtube.com/watch?v=0TLDTodL7Lc) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare — TLS 1.3 Explained](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/) |
| 29 | HTTPS Certificates and Validation | CA hierarchy, cert pinning, OCSP, Let's Encrypt | [Hussein Nasser — Certs](https://www.youtube.com/watch?v=r1nJT63BFQ0) | [Stripe — Certificate Transparency](https://stripe.com/blog/engineering) |
| 30 | Firewall Basics and Security Groups | Stateful/stateless firewalls, ingress/egress rules | [NetworkChuck — Firewalls](https://www.youtube.com/watch?v=kDEX1HXybrU) | [Cloudflare — Magic Firewall](https://blog.cloudflare.com/) |
| 31 | Zero Trust Networking | BeyondCorp model, identity-based access, mTLS | [Google BeyondCorp Paper](https://research.google/pubs/pub43231/) · [NIST Zero Trust](https://www.nist.gov/publications/zero-trust-architecture) | [Tailscale — Zero Trust in Practice](https://tailscale.com/blog) · [Cloudflare — Zero Trust](https://blog.cloudflare.com/) |
| 32 | DDoS Protection Basics | Volumetric/protocol/application attacks, mitigation layers | [Cloudflare — DDoS](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/) | [Cloudflare — 7.3 Tbps DDoS Attack (2025)](https://blog.cloudflare.com/ddos-threat-report-for-2025-q2/) |

### 2.3 Proxies

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 33 | Proxy Overview | Forward/reverse proxy, transparent proxy, sidecar proxy | [Hussein Nasser — Proxy](https://www.youtube.com/watch?v=SqqrOspasag) | [Envoy Blog](https://www.envoyproxy.io/blog) |
| 34 | Forward vs Reverse Proxy | Forward: client-side (VPN); Reverse: server-side (NGINX, Envoy) | [ByteByteGo — Proxy](https://blog.bytebytego.com/p/forward-proxy-vs-reverse-proxy) · [Hussein Nasser](https://www.youtube.com/watch?v=ozhe__GdWC8) | [Cloudflare — Reverse Proxy at Scale](https://blog.cloudflare.com/) |
| 35 | Service Discovery Mechanisms | Client-side vs server-side discovery, Consul, etcd, Eureka | [Hussein Nasser — Service Discovery](https://www.youtube.com/watch?v=Ia0GGKEjbKc) | [Netflix — Eureka Service Discovery](https://netflixtechblog.com/) · [HashiCorp Blog](https://www.hashicorp.com/blog) |

### 2.4 Service Mesh and Microservices Infrastructure

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 36 | Introduction to Service Mesh | Sidecar pattern, data plane vs control plane, mTLS | [IBM — Service Mesh](https://www.youtube.com/watch?v=16fgzklcF7Y) · [CNCF](https://www.cncf.io/) | [Lyft — Envoy Proxy Origin Story](https://eng.lyft.com/) |
| 37 | Istio Architecture and Components | Envoy sidecar, Istiod, traffic policies, telemetry | [Istio Docs](https://istio.io/latest/docs/) · [TechWorld with Nana — Istio](https://www.youtube.com/watch?v=6zDrLvpfCK4) | [Airbnb — Service Mesh Adoption](https://medium.com/airbnb-engineering) |
| 38 | Linkerd and Envoy Proxy | Lightweight mesh (Linkerd), high-perf proxy (Envoy) | [Envoy Docs](https://www.envoyproxy.io/) · [Linkerd Docs](https://linkerd.io/2/overview/) | [Buoyant Blog — Linkerd](https://buoyant.io/blog) |
| 39 | Service-to-Service Communication | Sync (gRPC/REST) vs Async (Kafka/NATS), retries, timeouts | [Martin Fowler](https://martinfowler.com/articles/microservices.html) | [Uber — gRPC at Scale](https://www.uber.com/blog/engineering/) |
| 40 | Traffic Management and Routing | Canary, blue-green, A/B testing, traffic splitting | [Istio — Traffic Mgmt](https://istio.io/latest/docs/concepts/traffic-management/) | [Spotify — Safe Deployments](https://engineering.atspotify.com/) |

[⬆ Back to Top](#-table-of-contents)

---

## 3. API Layer

### 3.1 API Design and Communication

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 41 | Introduction to APIs | API contracts, versioning, backward compatibility | [Neetcode — APIs](https://neetcode.io/courses/system-design-for-beginners/3) · [Postman](https://www.postman.com/what-is-an-api/) | [Stripe — API Design Philosophy](https://stripe.com/blog/engineering) |
| 42 | REST API Style | Resources, CRUD, HATEOAS, Richardson Maturity Model | [HelloInterview — REST](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [Gaurav Sen](https://www.youtube.com/watch?v=SLwpqD8n3d0) | [GitHub — REST API v3 Design](https://github.blog/engineering/) |
| 43 | GraphQL API Style | Schema, resolvers, N+1 problem, federation | [Fireship — GraphQL](https://www.youtube.com/watch?v=eIQh02xuVw4) · [GraphQL Docs](https://graphql.org/learn/) | [Airbnb — GraphQL at Scale](https://medium.com/airbnb-engineering) · [Shopify — GraphQL API](https://shopify.engineering/latest) |
| 44 | SOAP API Style | XML, WSDL, WS-Security, enterprise integrations | [IBM — SOAP](https://www.ibm.com/topics/soap) | [Legacy enterprise systems reference] |
| 45 | gRPC API Style | Protobuf, HTTP/2, bidirectional streaming, code generation | [Hussein Nasser — gRPC](https://www.youtube.com/watch?v=gnchfOojMk4) · [gRPC Docs](https://grpc.io/docs/) | [Netflix — gRPC Adoption](https://netflixtechblog.com/) · [Uber — gRPC](https://www.uber.com/blog/engineering/) |
| 46 | HTTP Versions (1.0→3) | Keep-alive, multiplexing (H2), QUIC (H3), server push | [Hussein Nasser — HTTP Versions](https://www.youtube.com/watch?v=a-sBfyiXysI) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare — HTTP/3 Adoption](https://blog.cloudflare.com/) |
| 47 | HTTP Methods | GET, POST, PUT, PATCH, DELETE, idempotency semantics | [MDN — HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) · [ByteByteGo](https://blog.bytebytego.com/) | [Stripe — Idempotent Requests](https://stripe.com/docs/api/idempotent_requests) |
| 48 | HTTP Status Codes & Best Practices | 2xx/3xx/4xx/5xx, proper error responses, problem details (RFC 9457) | [MDN — Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) | [Twilio — API Error Handling](https://www.twilio.com/blog) |

### 3.2 REST API Best Practices

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 49 | Filtering and Sorting | Query params, field selection, compound sorting | [REST API Tutorial](https://restfulapi.net/) · [Moesif — Filtering](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/) | [Shopify — API Design Guidelines](https://shopify.engineering/latest) |
| 50 | Pagination | Cursor-based vs offset, keyset pagination, page tokens | [ByteByteGo — Pagination](https://blog.bytebytego.com/) · [Slack Engineering](https://slack.engineering/) | [Slack — Evolving API Pagination](https://slack.engineering/) |
| 51 | Rate Limiting | Token bucket, sliding window, distributed rate limiting | [HelloInterview — Rate Limiter](https://www.hellointerview.com/learn/system-design/answer-keys/rate-limiter) · [Gaurav Sen](https://www.youtube.com/watch?v=FU4WlwfS3G0) | [Stripe — Rate Limiting](https://stripe.com/blog/rate-limiters) · [Cloudflare — Rate Limiting](https://blog.cloudflare.com/) |
| 52 | Versioning | URL path, header, query param versioning strategies | [REST API Tutorial — Versioning](https://restfulapi.net/versioning/) | [Stripe — API Versioning](https://stripe.com/blog/api-versioning) |
| 53 | Idempotent API | Idempotency keys, safe retries, exactly-once semantics | [Hussein Nasser — Idempotency](https://www.youtube.com/watch?v=4OuaONkZw1I) · [Stripe Docs](https://stripe.com/docs/api/idempotent_requests) | [Stripe — Designing Idempotent APIs](https://stripe.com/blog/idempotency) |
| 54 | Synchronous vs Asynchronous APIs | Blocking vs non-blocking, webhooks, polling, async response | [ByteByteGo](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=V3gOOKCRrZA) | [Twilio — Async Webhooks](https://www.twilio.com/blog) |
| 55 | Scaling APIs: Sync to Async | Offload to queues, task IDs, status polling, callbacks | [Gaurav Sen — Async Processing](https://www.youtube.com/watch?v=J6CBdSCB_fY) | [Uber — Async Task Framework](https://www.uber.com/blog/engineering/) |

### 3.3 API Authentication Methods

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 56 | Basic Authentication | Base64 encoding, limitations, when to use | [MDN — HTTP Auth](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) | — |
| 57 | Token-Based Authentication | Session tokens, bearer tokens, token storage | [Auth0 — Token Auth](https://auth0.com/learn/token-based-authentication-made-easy/) | [Okta Blog — Token Best Practices](https://developer.okta.com/blog/) |
| 58 | JWT (JSON Web Tokens) | Claims, signing (HS256/RS256), refresh tokens, stateless auth | [ByteByteGo — JWT](https://blog.bytebytego.com/) · [Fireship — JWT](https://www.youtube.com/watch?v=UBUNrFtufWo) | [Auth0 — JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook) |
| 59 | OAuth 2.0 | Authorization code flow, PKCE, scopes, token exchange | [Hussein Nasser — OAuth 2.0](https://www.youtube.com/watch?v=t4-416mg6iU) · [OAuth.net](https://oauth.net/2/) | [GitHub — OAuth App Flow](https://github.blog/engineering/) · [Okta Blog](https://developer.okta.com/blog/) |

### 3.4 API Documentation

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 60 | Introduction to API Documentation | Developer experience, examples, error docs | [Stripe API Docs](https://stripe.com/docs/api) (gold standard) | [Stripe — Building Great API Docs](https://stripe.com/blog/engineering) |
| 61 | Swagger / OpenAPI | OpenAPI 3.1, schema generation, code-first vs spec-first | [Swagger Docs](https://swagger.io/docs/) · [OpenAPI Spec](https://spec.openapis.org/oas/latest.html) | [Spotify — API Documentation](https://developer.spotify.com/documentation/) |
| 62 | Postman Collections | Shared collections, environment variables, automated testing | [Postman Learning Center](https://learning.postman.com/) | [Twilio — API Testing](https://www.twilio.com/blog) |

### 3.5 API Gateways

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 63 | API Gateway — Role and Importance | Single entry point, auth, rate limiting, routing, aggregation | [ByteByteGo — API Gateway](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=6ULyxuHKxg8) | [Netflix — Zuul Gateway](https://netflixtechblog.com/) |
| 64 | Kong Gateway | Plugin architecture, declarative config, service mesh mode | [Kong Docs](https://docs.konghq.com/) | [Kong Blog — API Gateway Patterns](https://konghq.com/blog) |
| 65 | NGINX Gateway Service | Reverse proxy, load balancing, rate limiting, caching | [NGINX Docs](https://docs.nginx.com/) · [Hussein Nasser — NGINX](https://www.youtube.com/watch?v=7VAI73roXaY) | [NGINX Blog](https://www.nginx.com/blog/) |

### 3.6 API Performance, Security & Trade-Offs

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 66 | API Performance Techniques | Caching, compression, connection pooling, batching, pagination | [ByteByteGo — API Perf](https://blog.bytebytego.com/) | [Vimeo — AI-Powered Subtitles Architecture](https://medium.com/vimeo-engineering-blog) |
| 67 | API Frameworks | Flask, Express, Django, Spring Boot, FastAPI | [FastAPI Docs](https://fastapi.tiangolo.com/) · [Express Docs](https://expressjs.com/) · [Spring Docs](https://spring.io/projects/spring-boot) | [Netflix — Spring Boot at Scale](https://netflixtechblog.com/) |
| 68 | API Security Best Practices | Input validation, auth, rate limiting, OWASP API Top 10 | [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) | [Cloudflare — API Shield](https://blog.cloudflare.com/) |
| 69 | CORS and Same-Origin Policy | Preflight requests, allowed origins, credentials | [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) | [Auth0 — CORS Guide](https://auth0.com/blog/) |
| 70 | API Key Management and Rotation | Secrets rotation, vault integration, key scoping | [HashiCorp Vault](https://www.vaultproject.io/) | [Stripe — Key Rotation](https://stripe.com/blog/engineering) |
| 71 | Encryption at Rest and in Transit | TLS for transit, AES-256 for rest, envelope encryption | [Cloudflare — Encryption](https://www.cloudflare.com/learning/ssl/what-is-encryption/) | [Google — Encryption at Rest](https://cloud.google.com/docs/security/encryption/default-encryption) |
| 72 | REST vs RPC | Resource-oriented vs action-oriented, when to use which | [ByteByteGo](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=sVg8stL2TpQ) | [Google — API Design Guide (gRPC)](https://cloud.google.com/apis/design) |
| 73 | API Gateway vs Load Balancer vs Reverse Proxy | Overlap, layering, when to combine | [ByteByteGo](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=RqfaTIWc3LQ) | [Kong Blog — Gateway Patterns](https://konghq.com/blog) |
| 74 | Polling vs Long Polling vs WebSockets vs Webhooks vs SSE | Real-time communication trade-offs, use cases per pattern | [HelloInterview](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [Fireship — WebSockets](https://www.youtube.com/watch?v=1BfCnjr_Vjg) | [Discord — WebSockets at Scale](https://discord.com/blog) · [Slack — Real-time Messaging](https://slack.engineering/) |
| 75 | Timeouts, Retries, Circuit Breakers, Fallback | Exponential backoff, jitter, Hystrix/Resilience4j patterns | [SudoCode](https://www.youtube.com/watch?v=HRS9mIfiNn4&t=270s) . [Martin Fowler — Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html) · [Hussein Nasser](https://www.youtube.com/watch?v=ADHcBxEXvFA) | [Netflix — Hystrix](https://netflixtechblog.com/) · [Shopify — Resiliency](https://shopify.engineering/latest) |

[⬆ Back to Top](#-table-of-contents)

---

## 4. Load Balancing

### 4.1 Load Balancing Essentials

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 76 | Introduction to Load Balancing | Why LB, single point of failure, redundant LBs | [HelloInterview — LB](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [Gaurav Sen](https://www.youtube.com/watch?v=K0Ta65OqQkY) | [GitHub — GLB Director](https://github.blog/engineering/infrastructure/glb-director-open-source-load-balancer/) |
| 77 | Types of Load Balancers | Hardware (F5), Software (NGINX, HAProxy, Envoy), Cloud (ALB/NLB) | [NGINX — LB](https://www.nginx.com/resources/glossary/load-balancing/) · [Hussein Nasser](https://www.youtube.com/watch?v=sCR3SAVdyCc) | [Cloudflare — Unimog LB](https://blog.cloudflare.com/unimog-cloudflares-edge-load-balancer/) |
| 78 | Load Balancing Algorithms | Round Robin, Weighted, IP Hash, Least Connections, Random | [ByteByteGo — LB Algorithms](https://blog.bytebytego.com/) | [Netflix — Adaptive LB](https://netflixtechblog.com/) |
| 79 | Round Robin | Simple sequential, weighted round robin, limitations | [NGINX — Round Robin](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/) | [HAProxy Blog](https://www.haproxy.com/blog/) |
| 80 | Consistent Hashing | Hash ring, virtual nodes, minimal redistribution on node change | [Gaurav Sen — Consistent Hashing](https://www.youtube.com/watch?v=zaRkONvyGr8) · [HelloInterview](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) | [Discord — Consistent Hashing for Messages](https://discord.com/blog) |
| 81 | Least Connections | Dynamic routing to least-busy server, weighted variant | [HAProxy Docs](https://www.haproxy.com/documentation/) | [Uber — Dynamic Load Balancing](https://www.uber.com/blog/engineering/) |
| 82 | Stateless vs Stateful Load Balancers | Stateless preferred, sticky sessions trade-off | [Hussein Nasser](https://www.youtube.com/watch?v=nFPzI_Qg3FU) | [Shopify — Stateless LB](https://shopify.engineering/latest) |
| 83 | Layer 4 vs Layer 7 Load Balancing | L4: TCP/UDP level; L7: HTTP/gRPC content-based routing | [Hussein Nasser — L4 vs L7](https://www.youtube.com/watch?v=aKMLgFVxZYk) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare — L4 LB](https://blog.cloudflare.com/) |
| 84 | Session Persistence & Sticky Sessions | Cookie-based, IP-based, trade-offs with scaling | [NGINX — Sticky Sessions](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/) | [Shopify — Session Management](https://shopify.engineering/latest) |
| 85 | Health Checks and Failover | Active/passive checks, circuit breaking, auto-removal | [HAProxy — Health Checks](https://www.haproxy.com/documentation/) | [Cloudflare — Health Checks at Edge](https://blog.cloudflare.com/) |
| 86 | Load Balancer vs API Gateway | LB for traffic distribution; Gateway for API management | [ByteByteGo](https://blog.bytebytego.com/) | [Kong Blog](https://konghq.com/blog) |

[⬆ Back to Top](#-table-of-contents)

---

## 5. Caching

### 5.1 Caching Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 87 | Caching Basics and Use Cases | Why cache, read-heavy workloads, latency reduction | [HelloInterview — Caching](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [ByteByteGo](https://blog.bytebytego.com/) | [Instagram — Caching at Scale](https://instagram-engineering.com/) |
| 88 | Why Caching Matters in SD | DB load reduction, response time improvement, cost savings | [Gaurav Sen — Caching](https://www.youtube.com/watch?v=U3RkDLtS7uY) | [Twitter — Timeline Caching](https://blog.x.com/engineering/) |
| 89 | Cache Hierarchies (CPU, App, Distributed) | L1/L2 CPU → in-process → Redis/Memcached → CDN | [ByteByteGo — Cache Layers](https://blog.bytebytego.com/) | [Meta — TAO Cache](https://engineering.fb.com/) |
| 90 | Hot vs Cold Data | Access frequency analysis, tiered storage, data lifecycle | [DDIA Ch. 3](https://dataintensive.net/) | [Netflix — Data Tiering](https://netflixtechblog.com/) |
| 91 | Cache Performance Metrics | Hit rate, miss rate, eviction rate, latency percentiles | [Redis Docs](https://redis.io/docs/) | [Pinterest — Cache Metrics](https://medium.com/pinterest-engineering) |
| 91 |Redis |Persistance[AOF, Snapshots], Use cases | [Redis Docs](https://redis.io/docs/) | [ByteByteGo - Top 5 Redis Use cases](https://www.youtube.com/watch?v=a4yX7RUgTxI) |

### 5.2 Caching Patterns and Strategies

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 92 | Cache Patterns Overview | Choosing patterns per read/write ratio and consistency needs | [ByteByteGo — Cache Strategies](https://blog.bytebytego.com/) · [Codekarle](https://www.youtube.com/watch?v=ccemOqDrc2I) | [Meta — Caching at Facebook](https://engineering.fb.com/) |
| 93 | Cache-Aside Pattern | App reads cache → miss → fetch DB → populate cache | [Microsoft — Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside) | [GitHub — Cache-Aside in Practice](https://github.blog/engineering/) |
| 94 | Write-Through Pattern | Write to cache + DB simultaneously, strong consistency | [ByteByteGo](https://blog.bytebytego.com/) | [DoorDash — Caching Strategy](https://doordash.engineering/) |
| 95 | Write-Back (Write-Behind) Pattern | Write to cache, async flush to DB, risk of data loss | [Redis Docs](https://redis.io/docs/) | [Uber — Write-Behind Caching](https://www.uber.com/blog/engineering/) |
| 96 | Read-Through & Refresh-Ahead | Cache auto-fetches on miss, proactive refresh before TTL | [Hazelcast — Read-Through](https://hazelcast.com/glossary/read-through-cache/) | [LinkedIn — Caching Patterns](https://engineering.linkedin.com/blog) |
| 97 | Cache Invalidation Strategies | TTL, event-based, manual purge, versioned keys | [ByteByteGo](https://blog.bytebytego.com/) · [Gaurav Sen](https://www.youtube.com/watch?v=U3RkDLtS7uY) | [Meta — Cache Invalidation at Scale](https://engineering.fb.com/) |
| 98 | Consistency Challenges in Caching | Stale reads, double-write, race conditions, eventual consistency | [DDIA Ch. 5](https://dataintensive.net/) | [Airbnb — Cache Consistency](https://medium.com/airbnb-engineering) |

### 5.3 Cache Management and Scaling

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 99 | Cache Eviction Policies (LRU, LFU, FIFO) | LRU for general, LFU for frequency-based, FIFO for simple queues | [Gaurav Sen — LRU](https://www.youtube.com/watch?v=7ABFKPK2hD4) · [Redis — Eviction](https://redis.io/docs/reference/eviction/) | [Twitter — LRU Cache Design](https://blog.x.com/engineering/) |
| 100 | TTL and Expiry Design | TTL tuning, jittered expiry, sliding TTL | [Redis — TTL](https://redis.io/docs/) | [Stripe — TTL Strategies](https://stripe.com/blog/engineering) |
| 101 | Thundering Herd Problem | Cache expires → all clients hit DB, mitigation: locking, staggered TTL | [ByteByteGo](https://blog.bytebytego.com/) | [Instagram — Thundering Herd](https://instagram-engineering.com/) |
| 102 | Cache Stampede & Dogpile Prevention | Probabilistic early expiry, mutex locks, request coalescing | [Redis Docs](https://redis.io/docs/) | [Meta — Preventing Stampedes](https://engineering.fb.com/) |
| 103 | Scaling Cache (Redis, Memcached, Hazelcast) | Redis Cluster, Memcached sharding, Hazelcast near-cache | [Redis Docs](https://redis.io/docs/) · [Hussein Nasser — Redis](https://www.youtube.com/watch?v=jgpVdJB2sKQ) | [Discord — Redis at Scale](https://discord.com/blog) · [Pinterest — Memcached](https://medium.com/pinterest-engineering) |
| 104 | Distributed Caching & Consistent Hashing | Hash ring for cache nodes, virtual nodes, rebalancing | [Gaurav Sen — Consistent Hashing](https://www.youtube.com/watch?v=zaRkONvyGr8) | [Meta — Memcache at Facebook](https://engineering.fb.com/) |
| 105 | Write Coalescing and Batch Updates | Batch cache writes, reduce I/O, write buffering | [DDIA Ch. 3](https://dataintensive.net/) | [Uber — Batch Processing](https://www.uber.com/blog/engineering/) |

### 5.4 Advanced Caching & Trade-Offs

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 106 | Multi-Level Caching (L1, L2, L3) | Browser → CDN → App (local) → Distributed → DB | [ByteByteGo](https://blog.bytebytego.com/) | [Netflix — EVCache Multi-Level](https://netflixtechblog.com/) |
| 107 | App-Level vs DB-Level Caching | Redis/Memcached (app) vs MySQL Query Cache / PG shared buffers | [High Scalability](http://highscalability.com/) | [Percona Blog](https://www.percona.com/blog/) |
| 108 | Geo-Distributed Cache Clusters | Redis across regions, replication lag, conflict resolution | [Redis Docs](https://redis.io/docs/) | [DoorDash — Geo-Distributed Cache](https://doordash.engineering/) |
| 109 | Cache Security and Isolation | Multi-tenant isolation, encryption, access control | [Redis — Security](https://redis.io/docs/management/security/) | [Cloudflare — Cache Security](https://blog.cloudflare.com/) |
| 110 | Redis vs Memcached vs Hazelcast | Data structures, persistence, clustering, use cases | [ByteByteGo](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=RuSfAaKIdQM) | [Discord — Why Redis](https://discord.com/blog) |
| 111 | Caching in Databases | MySQL query cache, PG shared buffers, MongoDB WiredTiger cache | [Percona Blog](https://www.percona.com/blog/) | [PlanetScale Blog](https://planetscale.com/blog) |
| 112 | Cache Warm-Up & Pre-Population | Pre-load popular items on deploy, warm-up scripts | [Netflix Tech Blog](https://netflixtechblog.com/) | [Netflix — EVCache Warm-Up](https://netflixtechblog.com/) |
| 113 | Monitoring Cache Metrics & Alerting | Hit rate dashboards, eviction alerts, latency tracking | [Redis Docs](https://redis.io/docs/) · [Grafana](https://grafana.com/) | [Datadog Blog — Cache Monitoring](https://www.datadoghq.com/blog/) |
| 114 | Common Cache Pitfalls & Anti-Patterns | Caching everything, no TTL, cache-DB inconsistency, over-caching | [ByteByteGo](https://blog.bytebytego.com/) | [Shopify — Cache Pitfalls](https://shopify.engineering/latest) |

[⬆ Back to Top](#-table-of-contents)

---

## 6. Content Delivery Networks (CDN)

### 6.1 CDN Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 115 | What is a CDN? | Edge servers, POPs, origin servers, content distribution | [Cloudflare — What is CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare Blog](https://blog.cloudflare.com/) |
| 116 | How CDNs Work | DNS routing, edge caching, cache miss → origin fetch | [Akamai — How CDN Works](https://www.akamai.com/glossary/what-is-a-cdn) | [Netflix — Open Connect](https://netflixtechblog.com/) |
| 117 | CDN Benefits | Latency reduction, scalability, DDoS absorption, availability | [Hussein Nasser — CDN](https://www.youtube.com/watch?v=RI9np1LWzqw) | [Shopify — CDN for Global Commerce](https://shopify.engineering/latest) |

### 6.2 CDN Architecture and Advanced Topics

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 118 | Edge Caching & Request Routing | Anycast, GeoDNS, latency-based routing | [Cloudflare — Edge](https://www.cloudflare.com/learning/cdn/glossary/edge-server/) | [Cloudflare — Anycast](https://blog.cloudflare.com/) |
| 119 | Cache Hierarchies in CDN | Edge → Regional → Origin shield, tiered caching | [Akamai Docs](https://www.akamai.com/) | [Fastly — Cache Hierarchy](https://www.fastly.com/blog/) |
| 120 | Geo-Replication & Load Balancing | Multi-region content, failover, traffic steering | [Cloudflare — LB](https://www.cloudflare.com/load-balancing/) | [Netflix — Global CDN](https://netflixtechblog.com/) |
| 121 | Static vs Dynamic Content | Static: images/CSS/JS; Dynamic: API responses, ESI, edge compute | [ByteByteGo](https://blog.bytebytego.com/) | [Vercel Blog — Edge Functions](https://vercel.com/blog) |
| 122 | CDN + Application Caching Integration | Layered caching: CDN + Redis + app-level | [High Scalability](http://highscalability.com/) | [Pinterest — Multi-Layer Caching](https://medium.com/pinterest-engineering) |
| 123 | Content Invalidation & Purging | Purge APIs, surrogate keys, instant purge vs TTL | [Fastly — Purging](https://www.fastly.com/documentation/guides/purging/) | [Fastly — Instant Purge](https://www.fastly.com/blog/) |
| 124 | CDN Security: DDoS, TLS, WAF | Edge WAF, bot management, TLS termination | [Cloudflare — WAF](https://www.cloudflare.com/application-services/products/waf/) | [Cloudflare — 7.3 Tbps DDoS (2025 Q2)](https://blog.cloudflare.com/ddos-threat-report-for-2025-q2/) |
| 125 | Multi-CDN Strategies & Failover | Redundancy, performance-based routing, cost optimization | [NS1](https://ns1.com/) | [GitHub — Multi-CDN](https://github.blog/engineering/) |
| 126 | Cost Optimization in CDN | Cache-Control headers, origin shield, compression | [Cloudflare Blog](https://blog.cloudflare.com/) | [Vercel — Edge Cost Optimization](https://vercel.com/blog) |
| 127 | CDN Providers Overview | Cloudflare, Fastly, Akamai, CloudFront comparison | [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare vs Fastly — Real benchmarks](https://blog.cloudflare.com/) |
| 128 | Case Study: YouTube & Netflix CDN | Netflix Open Connect, YouTube edge caching | [Hussein Nasser — Netflix CDN](https://www.youtube.com/watch?v=7AMRfNKwuYo) | [Netflix — Open Connect](https://openconnect.netflix.com/) |
| 129 | Edge Compute & Serverless at Edge | Cloudflare Workers, Durable Objects, Lambda@Edge, Vercel Edge | [Cloudflare Workers](https://developers.cloudflare.com/workers/) · [Fireship](https://www.youtube.com/watch?v=yOP5-3_WFus) | [Cloudflare — Durable Objects](https://blog.cloudflare.com/) · [Vercel — Edge Runtime](https://vercel.com/blog) |

[⬆ Back to Top](#-table-of-contents)

---

## 7. Databases and Storage Design

### 7.1 Introduction to Database

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 130 | Why Understand Database Internals? | Debugging slow queries, choosing right DB, capacity planning | [DDIA Ch. 3](https://dataintensive.net/) · [CMU DB Group](https://www.youtube.com/c/CMUDatabaseGroup) | [Uber — Schemaless DB](https://www.uber.com/blog/schemaless-part-one-mysql-datastore/) |
| 131 | Storage Engines (InnoDB, RocksDB, LevelDB) | B-Tree vs LSM engines, write/read amplification trade-offs | [DDIA Ch. 3](https://dataintensive.net/) · [Hussein Nasser](https://www.youtube.com/watch?v=I6jB0nM9SKU) | [Meta — RocksDB](https://engineering.fb.com/) · [PlanetScale Blog](https://planetscale.com/blog) |

### 7.2 Core Data Structures and Storage

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 132 | B-Tree and B+Tree Structures | Balanced tree, page splits, range queries, InnoDB internals | [DDIA Ch. 3](https://dataintensive.net/) · [Abdul Bari — B-Trees](https://www.youtube.com/watch?v=aZjYr87r1b8) · [CMU DB](https://www.youtube.com/watch?v=1D81vXw2T_w) | [PlanetScale — InnoDB Internals](https://planetscale.com/blog) |
| 133 | Log-Structured Merge (LSM) Trees | Memtable → SSTable, compaction strategies, write optimization | [DDIA Ch. 3](https://dataintensive.net/) · [Hussein Nasser](https://www.youtube.com/watch?v=I6jB0nM9SKU) | [Meta — RocksDB Compaction](https://engineering.fb.com/) · [ScyllaDB Blog](https://www.scylladb.com/blog/) |
| 134 | SSTables and Write-Ahead Logs (WAL) | Crash recovery, durability guarantees, WAL in PostgreSQL/Kafka | [DDIA Ch. 3](https://dataintensive.net/) · [CMU DB](https://www.youtube.com/c/CMUDatabaseGroup) | [CockroachDB — WAL Design](https://www.cockroachlabs.com/blog/) |

### 7.3 Data Modeling and Workloads

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 135 | Normalization vs Denormalization | 1NF→3NF, denormalization for reads, trade-offs | [DDIA Ch. 2](https://dataintensive.net/) · [Hussein Nasser](https://www.youtube.com/watch?v=GFQaEYEc8_8) | [Uber — Schema Design](https://www.uber.com/blog/engineering/) |
| 136 | SQL vs NoSQL: Models & Tradeoffs | Relational, document, wide-column, graph, key-value | [HelloInterview](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) · [Fireship](https://www.youtube.com/watch?v=W2Z7fbCLSTw) | [Discord — Migrating to ScyllaDB](https://discord.com/blog/how-discord-stores-trillions-of-messages) |
| 137 | OLTP vs OLAP Workloads | Transactional vs analytical, row-store vs column-store | [DDIA Ch. 3](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [Cloudflare — TimescaleDB for Analytics](https://blog.cloudflare.com/timescaledb-art/) |

### 7.4 Indexing and Query Optimization

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 138 | Database Indexing Fundamentals | Why index, index overhead, selectivity, cardinality | [Hussein Nasser — Indexing](https://www.youtube.com/watch?v=-qNSXPIi4D4) · [Use The Index, Luke](https://use-the-index-luke.com/) | [Percona Blog](https://www.percona.com/blog/) |
| 139 | Index Types (Clustered, Non-Clustered, Composite, Covering) | Composite index ordering, covering index for query optimization | [Use The Index, Luke](https://use-the-index-luke.com/) · [CMU DB](https://www.youtube.com/c/CMUDatabaseGroup) | [PlanetScale — Index Design](https://planetscale.com/blog) |
| 140 | Index Structures: B-Tree, Hash, GiST, GIN, Inverted | GIN for full-text, GiST for geospatial, hash for equality | [PostgreSQL Docs — Indexes](https://www.postgresql.org/docs/current/indexes.html) | [Supabase Blog — PostgreSQL Indexes](https://supabase.com/blog) |
| 141 | Bloom Filters & Index Optimization | Probabilistic data structure, false positives, SSTable optimization | [DDIA Ch. 3](https://dataintensive.net/) · [Gaurav Sen — Bloom Filters](https://www.youtube.com/watch?v=V3pzxngeLqw) | [Meta — Bloom Filters in RocksDB](https://engineering.fb.com/) |
| 142 | Index Maintenance & Performance Trade-Offs | Write penalty, index bloat, reindexing strategies | [Use The Index, Luke](https://use-the-index-luke.com/) | [GitLab — Database Index Maintenance](https://about.gitlab.com/blog/engineering/) |
| 143 | Query Execution Plans & Optimization | EXPLAIN ANALYZE, sequential vs index scan, join strategies | [Hussein Nasser — Query Plans](https://www.youtube.com/watch?v=BHwzDmr6d7s) · [PostgreSQL Docs](https://www.postgresql.org/docs/current/using-explain.html) | [Neon Blog — Query Optimization](https://neon.tech/blog) |

### 7.5 Transactions & Concurrency Control

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 144 | ACID vs BASE | Atomicity, Consistency, Isolation, Durability vs Basically Available, Soft state, Eventually consistent | [DDIA Ch. 7](https://dataintensive.net/) · [Hussein Nasser — ACID](https://www.youtube.com/watch?v=pomxJOFVcQs) | [Stripe — ACID Transactions for Payments](https://stripe.com/blog/engineering) |
| 145 | Isolation Levels | Read Uncommitted → Read Committed → Repeatable Read → Serializable | [DDIA Ch. 7](https://dataintensive.net/) · [CMU DB](https://www.youtube.com/c/CMUDatabaseGroup) | [CockroachDB — Serializable Isolation](https://www.cockroachlabs.com/blog/) |
| 146 | Locking Mechanisms | Row, table, intent locks, advisory locks, gap locks | [PostgreSQL Docs — Locking](https://www.postgresql.org/docs/current/explicit-locking.html) | [PlanetScale — MySQL Locking](https://planetscale.com/blog) |
| 147 | Two-Phase Locking (2PL) | Growing/shrinking phases, strict 2PL, deadlock risk | [DDIA Ch. 7](https://dataintensive.net/) | [CockroachDB Blog](https://www.cockroachlabs.com/blog/) |
| 148 | MVCC & Snapshot Isolation | Multi-version reads, no read locks, write skew anomaly | [DDIA Ch. 7](https://dataintensive.net/) · [Hussein Nasser — MVCC](https://www.youtube.com/watch?v=AcqtAEzuoj0) | [Neon — MVCC in PostgreSQL](https://neon.tech/blog) |
| 149 | Pessimistic vs Optimistic Concurrency | SELECT FOR UPDATE vs version columns, conflict detection | [DDIA Ch. 7](https://dataintensive.net/) · [Martin Fowler](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html) | [Stripe — Optimistic Locking](https://stripe.com/blog/engineering) |
| 150 | Deadlocks, Detection, Resolution | Wait-for graph, timeout-based, deadlock prevention | [CMU DB](https://www.youtube.com/c/CMUDatabaseGroup) | [Percona — Deadlock Analysis](https://www.percona.com/blog/) |
| 151 | Serializable Snapshot Isolation | Write skew, phantom reads, SSI implementation | [DDIA Ch. 7](https://dataintensive.net/) | [CockroachDB — SSI](https://www.cockroachlabs.com/blog/) |
| 152 | Designing for Concurrency | Short transactions, proper indexing, retry logic, connection pooling | [Percona Blog](https://www.percona.com/blog/) | [PlanetScale — Connection Pooling](https://planetscale.com/blog) |

[⬆ Back to Top](#-table-of-contents)

---

## 8. Search Systems

### 8.1 Search Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 153 | Introduction to Search Systems | Search vs query, relevance, ranking, user intent | [Gaurav Sen — Search Engine](https://www.youtube.com/watch?v=CeGtqouT8eA) | [Airbnb — Search Ranking](https://medium.com/airbnb-engineering) |
| 154 | Search vs Database Queries | Relevance scoring vs exact match, fuzzy matching, stemming | [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) | [Algolia Blog](https://www.algolia.com/blog/) |
| 155 | Full-Text Search Basics | Analyzers, tokenizers, filters, language-specific processing | [Elasticsearch — Full Text](https://www.elastic.co/guide/en/elasticsearch/reference/current/full-text-queries.html) | [Shopify — Search Infrastructure](https://shopify.engineering/latest) |
| 156 | Inverted Index & Tokenization | Term → document mapping, TF-IDF, BM25 scoring | [DDIA Ch. 3](https://dataintensive.net/) · [Hussein Nasser — Inverted Index](https://www.youtube.com/watch?v=Mlp8hlKwETs) | [Uber — Search Platform](https://www.uber.com/blog/engineering/) |
| 157 | Autocomplete & Suggestion Systems | Trie-based, prefix matching, personalized suggestions | [HelloInterview — Typeahead](https://www.hellointerview.com/learn/system-design/answer-keys/typeahead) · [Gaurav Sen](https://www.youtube.com/watch?v=us0qySiUsGU) | [LinkedIn — Typeahead Search](https://engineering.linkedin.com/blog) |
| 158 | Search Query Processing | Query parsing, spell correction, synonym expansion, stop words | [Elasticsearch Docs — Analysis](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html) | [Pinterest — Query Understanding](https://medium.com/pinterest-engineering) |
| 159 | Ranking & Relevance Scoring | TF-IDF, BM25, learning-to-rank, vector search, semantic search | [Elasticsearch — Relevance](https://www.elastic.co/guide/en/elasticsearch/reference/current/relevance-intro.html) | [Spotify — Search Ranking ML](https://engineering.atspotify.com/) |

### 8.2 Search Infrastructure and Engines

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 160 | Elasticsearch Architecture | Shards, replicas, clusters, near-real-time indexing | [Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) · [Hussein Nasser](https://www.youtube.com/watch?v=f1ULtMnMOC4) | [Uber — Elasticsearch at Scale](https://www.uber.com/blog/engineering/) |
| 161 | Lucene and Solr Internals | Segments, merging, Lucene codec, Solr cloud mode | [Apache Lucene](https://lucene.apache.org/) · [Apache Solr](https://solr.apache.org/) | [Bloomberg — Solr at Scale](https://www.techatbloomberg.com/) |
| 162 | OpenSearch Overview | AWS fork, plugins, observability integration, vector search | [OpenSearch Docs](https://opensearch.org/docs/latest/) | [OpenSearch Blog](https://opensearch.org/blog/) |

[⬆ Back to Top](#-table-of-contents)

---

## 9. Scaling Database

### 9.1 Data Partitioning

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 163 | Why Partition Data? | Single DB limits, horizontal distribution, query routing | [DDIA Ch. 6](https://dataintensive.net/) | [Shopify — Sharding at Scale](https://shopify.engineering/latest) |
| 164 | Horizontal vs Vertical Partitioning | Row-based sharding vs column splitting, hybrid approaches | [DDIA Ch. 6](https://dataintensive.net/) · [Hussein Nasser](https://www.youtube.com/watch?v=QA25cMWp9Tk) | [Uber — Schemaless Partitioning](https://www.uber.com/blog/engineering/) |
| 165 | Range, Hash, List Partitioning | Range: by date; Hash: by user_id; List: by region | [DDIA Ch. 6](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [PlanetScale — Partitioning Strategies](https://planetscale.com/blog) |
| 166 | Consistent Hashing Explained | Hash ring, virtual nodes, minimal redistribution, jump hash | [Gaurav Sen](https://www.youtube.com/watch?v=zaRkONvyGr8) · [DDIA Ch. 6](https://dataintensive.net/) | [Discord — Consistent Hashing](https://discord.com/blog) |
| 167 | Dynamic Rebalancing & Hotspot Mitigation | Auto-split, salting keys, partition-aware routing | [DDIA Ch. 6](https://dataintensive.net/) | [Slack — Shard Rebalancing](https://slack.engineering/) |
| 168 | Partition Pruning & Query Routing | Route queries to correct shard, scatter-gather, VTGate | [Vitess Docs](https://vitess.io/docs/) | [Slack — Vitess at Slack](https://slack.engineering/) |

### 9.2 Data Replication

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 169 | Replication Fundamentals | Why replicate, durability, availability, read scaling | [DDIA Ch. 5](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [GitHub — MySQL HA](https://github.blog/engineering/) |
| 170 | Leader-Follower Replication | Primary writes, replica reads, failover, promotion | [DDIA Ch. 5](https://dataintensive.net/) · [Hussein Nasser](https://www.youtube.com/watch?v=bI8Ry6GhMSE) | [GitHub — MySQL Replication](https://github.blog/engineering/) |
| 171 | Leader-Leader (Multi-Master) | Conflict resolution, CRDTs, last-write-wins, vector clocks | [DDIA Ch. 5](https://dataintensive.net/) | [Figma — Multi-Player Editing](https://www.figma.com/blog/engineering/) |
| 172 | Async vs Sync Replication | Async: faster writes, lag risk; Sync: strong consistency, slower | [DDIA Ch. 5](https://dataintensive.net/) | [Neon — Async Replication](https://neon.tech/blog) |
| 173 | Conflict Resolution & Write Conflicts | LWW, merge functions, application-level resolution | [DDIA Ch. 5](https://dataintensive.net/) | [Figma — CRDTs](https://www.figma.com/blog/engineering/) |
| 174 | Replication Lag & Read Consistency | Read-your-writes, monotonic reads, causal consistency | [DDIA Ch. 5](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [Slack — Read Consistency](https://slack.engineering/) |
| 175 | Geo-Replication & Cross-Region DBs | Global consistency, TrueTime, cross-region latency | [Google Spanner Paper](https://research.google/pubs/pub39966/) | [CockroachDB — Multi-Region](https://www.cockroachlabs.com/blog/) |

### 9.3 Data Sharding

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 176 | What is Sharding? | Horizontal partitioning across DB instances, shard key selection | [Gaurav Sen — Sharding](https://www.youtube.com/watch?v=5faMjKuB9bc) · [DDIA Ch. 6](https://dataintensive.net/) | [Pinterest — Sharding MySQL](https://medium.com/pinterest-engineering) |
| 177 | Shard Key Design & Anti-Patterns | High cardinality, even distribution, avoid hotspots, compound keys | [Vitess Docs](https://vitess.io/docs/) · [MongoDB — Shard Keys](https://www.mongodb.com/docs/manual/core/sharding-shard-key/) | [Notion — Sharding PostgreSQL](https://www.notion.so/blog) |
| 178 | Shard Management & Rebalancing | Online resharding, split/merge, zero-downtime migration | [DDIA Ch. 6](https://dataintensive.net/) | [Stripe — Online Migration](https://stripe.com/blog/online-migrations) |
| 179 | Global vs Local Indexes | Global: cross-shard search; Local: per-shard, faster writes | [DDIA Ch. 6](https://dataintensive.net/) | [CockroachDB — Global Indexes](https://www.cockroachlabs.com/blog/) |
| 180 | Distributed Joins & Query Routing | Scatter-gather, co-located joins, denormalization | [Vitess Docs](https://vitess.io/docs/) | [Vitess Blog](https://vitess.io/blog/) |
| 181 | Sharding in Practice | MongoDB sharding, Vitess for MySQL, Spanner, Citus for PG | [Vitess](https://vitess.io/) · [MongoDB Sharding](https://www.mongodb.com/docs/manual/sharding/) | [Slack — Vitess](https://slack.engineering/) · [Notion — Sharding PG](https://www.notion.so/blog) |

### 9.4 Scaling & Replication Design Patterns

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 182 | Vertical vs Horizontal Scaling (DB) | Scale up limits, scale out complexity, when to choose | [DDIA Ch. 6](https://dataintensive.net/) | [Instagram — Scaling PostgreSQL](https://instagram-engineering.com/) |
| 183 | DB Proxying & Query Routing | PgBouncer, ProxySQL, Vitess VTGate, connection pooling | [PgBouncer](https://www.pgbouncer.org/) · [ProxySQL](https://proxysql.com/documentation/) | [GitHub — ProxySQL](https://github.blog/engineering/) |
| 184 | Read/Write Splitting & Caching | Writes → primary; Reads → replicas + cache layer | [ByteByteGo](https://blog.bytebytego.com/) | [DoorDash — Read/Write Split](https://doordash.engineering/) |
| 185 | CAP Theorem Deep Dive | CP (HBase), AP (Cassandra), CA (single-node), real-world nuance | [DDIA Ch. 9](https://dataintensive.net/) · [Gaurav Sen](https://www.youtube.com/watch?v=kwCFHLbIhak) · [HelloInterview](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) | [Martin Kleppmann — Please Stop Calling DBs CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html) |
| 186 | PACELC Theorem | Partition: A vs C; Else: Latency vs Consistency | [DDIA Ch. 9](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [ScyllaDB — PACELC in Practice](https://www.scylladb.com/blog/) |
| 187 | Eventual Consistency & Tunable Levels | ONE, QUORUM, ALL; tunable consistency in Cassandra/DynamoDB | [DDIA Ch. 5](https://dataintensive.net/) · [Gaurav Sen](https://www.youtube.com/watch?v=RY_2gElt3SA) | [Netflix — Eventual Consistency](https://netflixtechblog.com/) |
| 188 | Distributed Transactions (2PC, XA, Saga) | Two-phase commit, XA transactions, Saga pattern alternative | [DDIA Ch. 9](https://dataintensive.net/) · [Martin Fowler — 2PC](https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html) | [Uber — Distributed Transactions](https://www.uber.com/blog/engineering/) |

### 9.5 Storage Performance & Optimization

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 189 | I/O & Buffer Pool Management | InnoDB buffer pool, shared buffers, page cache, dirty pages | [Percona Blog](https://www.percona.com/blog/) · [CMU DB](https://www.youtube.com/c/CMUDatabaseGroup) | [PlanetScale — Buffer Pool Tuning](https://planetscale.com/blog) |
| 190 | Caching Strategies (Page, Query, Result) | Query cache deprecation (MySQL 8), result caching, materialized views | [Percona Blog](https://www.percona.com/blog/) | [Neon — Caching in Serverless PG](https://neon.tech/blog) |
| 191 | Compression & Compaction | zstd/lz4 compression, LSM compaction strategies, space amplification | [DDIA Ch. 3](https://dataintensive.net/) | [ScyllaDB — Compaction Strategies](https://www.scylladb.com/blog/) |
| 192 | SSD vs HDD Performance | Random vs sequential I/O, IOPS, NVMe advantages | [DDIA Ch. 3](https://dataintensive.net/) | [Uber — SSD Optimization](https://www.uber.com/blog/engineering/) |
| 193 | Write Amplification & Read Latency | LSM write amp vs B-Tree read perf, tuning knobs | [DDIA Ch. 3](https://dataintensive.net/) | [Meta — RocksDB Tuning](https://engineering.fb.com/) |
| 194 | Monitoring, Profiling, Explain Plans | pg_stat_statements, slow query log, query profiling | [PostgreSQL Docs](https://www.postgresql.org/docs/) · [Percona](https://www.percona.com/blog/) | [Datadog — DB Monitoring](https://www.datadoghq.com/blog/) |

### 9.6 Distributed DB Design & Real-World Systems

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 195 | Distributed DB Architectures | Shared-nothing, shared-disk, disaggregated storage | [DDIA Ch. 6](https://dataintensive.net/) | [Neon — Disaggregated Storage](https://neon.tech/blog) |
| 196 | Google Spanner: TrueTime | Globally consistent reads, TrueTime API, external consistency | [Spanner Paper](https://research.google/pubs/pub39966/) · [Hussein Nasser](https://www.youtube.com/watch?v=nvlt0dA7rsQ) | [CockroachDB — Spanner-Inspired Design](https://www.cockroachlabs.com/blog/) |
| 197 | Amazon DynamoDB | Partition + replication, adaptive capacity, DAX caching | [Dynamo Paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) · [ByteByteGo](https://blog.bytebytego.com/) | [Werner Vogels Blog](https://www.allthingsdistributed.com/) |
| 198 | CockroachDB & YugabyteDB | Distributed SQL, Raft consensus, multi-region, PostgreSQL wire protocol | [CockroachDB Docs](https://www.cockroachlabs.com/docs/) · [YugabyteDB Docs](https://docs.yugabyte.com/) | [CockroachDB Blog](https://www.cockroachlabs.com/blog/) · [YugabyteDB Blog](https://www.yugabyte.com/blog/) |
| 199 | Cassandra & ScyllaDB | Wide-column, gossip protocol, tunable consistency, shard-per-core | [Cassandra Docs](https://cassandra.apache.org/doc/latest/) · [Hussein Nasser](https://www.youtube.com/watch?v=V8JmPmnDKms) | [Discord — ScyllaDB Migration](https://discord.com/blog/how-discord-stores-trillions-of-messages) · [ScyllaDB Blog](https://www.scylladb.com/blog/) |
| 200 | TiDB, Vitess, PlanetScale | MySQL-compatible distributed SQL, online DDL, branching | [Vitess](https://vitess.io/) · [TiDB Docs](https://docs.pingcap.com/) · [PlanetScale](https://planetscale.com/docs) | [PlanetScale Blog](https://planetscale.com/blog) · [Slack — Vitess](https://slack.engineering/) |

[⬆ Back to Top](#-table-of-contents)

---

## 10. Messaging and Async Communication

### 10.1 Messaging Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 201 | Introduction to Messaging Systems | Decoupling, buffering, async processing, event-driven | [DDIA Ch. 11](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [LinkedIn — Kafka Origin Story](https://engineering.linkedin.com/blog) |
| 202 | Why Messaging & Event-Driven? | Loose coupling, resilience, scalability, temporal decoupling | [Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html) | [Uber — Event-Driven Architecture](https://www.uber.com/blog/engineering/) |
| 203 | Sync vs Async Communication | Blocking vs non-blocking, trade-offs, hybrid patterns | [ByteByteGo](https://blog.bytebytego.com/) | [Stripe — Async Processing](https://stripe.com/blog/engineering) |
| 204 | Message Queues vs Event Streams | Point-to-point (SQS) vs pub/sub log (Kafka), retention | [DDIA Ch. 11](https://dataintensive.net/) · [Confluent Blog](https://www.confluent.io/blog/) | [Uber — Kafka vs Queues](https://www.uber.com/blog/engineering/) |
| 205 | Core Concepts: Topics, Queues, Producers, Consumers | Partitions, consumer groups, offsets, acknowledgments | [Kafka Docs](https://kafka.apache.org/documentation/) | [Confluent Blog](https://www.confluent.io/blog/) |

### 10.2 Messaging Infrastructure

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 206 | How Message Brokers Work | Store-and-forward, pub/sub, message routing, persistence | [DDIA Ch. 11](https://dataintensive.net/) | [Shopify — Message Broker Selection](https://shopify.engineering/latest) |
| 207 | Zookeeper | Distributed coordination, leader election, config management, KRaft replacement | [Zookeeper Docs](https://zookeeper.apache.org/) · [Hussein Nasser](https://www.youtube.com/watch?v=AS5a91DOmks) | [Confluent — KRaft: Kafka without ZooKeeper](https://www.confluent.io/blog/) |
| 208 | Kafka Introduction | Distributed log, partitions, replication, consumer groups | [Kafka Docs](https://kafka.apache.org/documentation/) · [Gaurav Sen](https://www.youtube.com/watch?v=aj9CDZm0Glc) · [Confluent 101](https://developer.confluent.io/courses/) | [LinkedIn — Kafka at LinkedIn](https://engineering.linkedin.com/blog) |
| 209 | Kafka Tiered Storage | Offload old segments to S3/GCS, infinite retention, cost reduction | [Confluent — Tiered Storage](https://docs.confluent.io/platform/current/kafka/tiered-storage.html) | [Uber — Kafka Tiered Storage](https://www.uber.com/blog/engineering/) |
| 210 | Kafka Connect | Source/sink connectors, CDC integration, schema registry | [Kafka Connect Docs](https://kafka.apache.org/documentation/#connect) | [Confluent Blog — Connectors](https://www.confluent.io/blog/) |
| 211 | Why Kafka is Fast | Zero-copy, sequential I/O, batching, page cache, sendfile() | [ByteByteGo — Why Kafka Fast](https://blog.bytebytego.com/p/why-is-kafka-fast) · [Hussein Nasser](https://www.youtube.com/watch?v=UNUz1-msbOM) | [LinkedIn — Kafka Performance](https://engineering.linkedin.com/blog) |
| 212 | RabbitMQ Internals | AMQP, exchanges (direct/topic/fanout), queues, bindings, quorum queues | [RabbitMQ Docs](https://www.rabbitmq.com/docs) · [Hussein Nasser](https://www.youtube.com/watch?v=7rkeORD4jSw) | [RabbitMQ Blog](https://www.rabbitmq.com/blog/) |
| 213 | Kafka vs RabbitMQ vs SQS | Stream vs queue, ordering, retention, managed vs self-hosted | [ByteByteGo](https://blog.bytebytego.com/) · [Hussein Nasser](https://www.youtube.com/watch?v=GMmRtSFQ5Z0) | [DoorDash — Choosing Message Broker](https://doordash.engineering/) |
| 214 | Schema Registry & Serialization | Avro, Protobuf, JSON Schema, schema evolution, compatibility | [Confluent — Schema Registry](https://docs.confluent.io/platform/current/schema-registry/) | [Uber — Schema Management](https://www.uber.com/blog/engineering/) |

### 10.3 Delivery Guarantees & Reliability

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 215 | Delivery Semantics | At-most-once, at-least-once, exactly-once, idempotent producer | [DDIA Ch. 11](https://dataintensive.net/) · [Confluent — Exactly Once](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/) | [Stripe — Exactly-Once Payments](https://stripe.com/blog/engineering) |
| 216 | Consumer Groups & Parallel Consumption | Partition assignment, rebalancing, cooperative rebalancing | [Kafka Docs](https://kafka.apache.org/documentation/#consumerconfigs) | [Uber — Consumer Group Scaling](https://www.uber.com/blog/engineering/) |
| 217 | Idempotency & Message Ordering | Idempotent producer, partition-level ordering, sequence numbers | [Confluent Blog](https://www.confluent.io/blog/) | [Stripe — Idempotent Event Processing](https://stripe.com/blog/engineering) |
| 218 | Retries, DLQ, Poison Messages | Retry policies, dead letter queues, poison pill handling | [ByteByteGo](https://blog.bytebytego.com/) | [Uber — DLQ Patterns](https://www.uber.com/blog/engineering/) |
| 219 | Duplicate Message Handling | Deduplication with message IDs, idempotent consumers | [DDIA Ch. 11](https://dataintensive.net/) | [Shopify — Deduplication](https://shopify.engineering/latest) |
| 220 | Transactional Messaging & Outbox Pattern | Outbox table + CDC, transactional outbox, Debezium | [Microservices.io — Outbox](https://microservices.io/patterns/data/transactional-outbox.html) · [ByteByteGo](https://blog.bytebytego.com/) | [DoorDash — Outbox Pattern](https://doordash.engineering/) |

### 10.4 Messaging Scalability & Performance

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 221 | Partitioning & Sharding Strategies | Kafka partitions, partition key design, hot partition avoidance | [Kafka Docs](https://kafka.apache.org/documentation/) | [LinkedIn — Kafka Partitioning](https://engineering.linkedin.com/blog) |
| 222 | Load Balancing Consumers | Consumer rebalancing, static membership, cooperative sticky | [Confluent Blog](https://www.confluent.io/blog/) | [Uber — Consumer Rebalancing](https://www.uber.com/blog/engineering/) |
| 223 | Handling Backpressure | Rate limiting producers, buffering, flow control, reactive streams | [Reactive Streams](https://www.reactive-streams.org/) | [Netflix — Backpressure](https://netflixtechblog.com/) |
| 224 | Batching & Windowing | batch.size, linger.ms, tumbling/sliding/session windows | [Kafka Docs](https://kafka.apache.org/documentation/#producerconfigs) | [Confluent — Kafka Tuning](https://www.confluent.io/blog/) |
| 225 | High Throughput & Low Latency Tuning | Producer/consumer config, compression, acks settings | [Confluent — Performance](https://docs.confluent.io/platform/current/kafka/deployment.html) | [LinkedIn — Kafka Performance Tuning](https://engineering.linkedin.com/blog) |
| 226 | Monitoring Consumer Lag | Burrow, consumer lag metrics, alerting on lag growth | [Burrow](https://github.com/linkedin/Burrow) · [Confluent — Monitoring](https://docs.confluent.io/platform/current/kafka/monitoring.html) | [Datadog — Kafka Monitoring](https://www.datadoghq.com/blog/) |

[⬆ Back to Top](#-table-of-contents)

---

## 11. Data Processing and Storage Systems

### 11.1 Batch Processing

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 227 | Overview of Batch Processing | ETL, nightly jobs, large-scale data transformation | [DDIA Ch. 10](https://dataintensive.net/) | [Airbnb — Batch Processing](https://medium.com/airbnb-engineering) |
| 228 | MapReduce Fundamentals | Map, shuffle, reduce phases, fault tolerance, data locality | [DDIA Ch. 10](https://dataintensive.net/) · [Google MapReduce Paper](https://research.google/pubs/pub62/) · [Gaurav Sen](https://www.youtube.com/watch?v=cHGaQz0E7AU) | [Meta — MapReduce at Scale](https://engineering.fb.com/) |
| 229 | Dataflow Engines (Beam, Flink Batch) | DAG execution, unified batch+stream, Apache Beam portability | [Apache Beam](https://beam.apache.org/) · [Flink Docs](https://flink.apache.org/) | [Spotify — Beam Pipelines](https://engineering.atspotify.com/) |
| 230 | Why Use Batch Processing? | Cost-effective analytics, historical data, ML training pipelines | [DDIA Ch. 10](https://dataintensive.net/) | [Netflix — Batch ETL](https://netflixtechblog.com/) |

### 11.2 Stream Processing

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 231 | Stream Processing Fundamentals | Real-time events, windowing, watermarks, late data handling | [DDIA Ch. 11](https://dataintensive.net/) · [Confluent](https://www.confluent.io/blog/) | [Uber — Real-Time Analytics](https://www.uber.com/blog/engineering/) |
| 232 | Batch vs Stream Processing | Latency, completeness, cost, complexity trade-offs | [DDIA Ch. 10-11](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [Spotify — Batch to Stream Migration](https://engineering.atspotify.com/) |
| 233 | Lambda Architecture | Batch layer + speed layer + serving layer, complexity trade-off | [Nathan Marz](http://nathanmarz.com/blog/how-to-beat-the-cap-theorem.html) · [ByteByteGo](https://blog.bytebytego.com/) | [LinkedIn — Lambda at LinkedIn](https://engineering.linkedin.com/blog) |
| 234 | Kappa Architecture | Stream-only, reprocessing via replay, simpler than Lambda | [Martin Kleppmann](https://www.oreilly.com/radar/questioning-the-lambda-architecture/) | [Uber — Kappa Architecture](https://www.uber.com/blog/engineering/) |
| 235 | Change Data Capture (CDC) | Debezium, log-based CDC, outbox pattern, event sourcing | [Debezium Docs](https://debezium.io/documentation/) · [ByteByteGo](https://blog.bytebytego.com/) | [Shopify — CDC with Debezium](https://shopify.engineering/latest) · [Airbnb — CDC](https://medium.com/airbnb-engineering) |
| 236 | Stream Processing Tools | Kafka Streams, Flink, Spark Streaming, Materialize | [Flink Docs](https://flink.apache.org/) · [Kafka Streams](https://kafka.apache.org/documentation/streams/) | [Pinterest — Flink at Pinterest](https://medium.com/pinterest-engineering) · [DoorDash — Flink](https://doordash.engineering/) |

### 11.3 Storage and Specialized Databases

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 237 | Object Storage (S3, GCS, Azure Blob) | Immutable objects, eventual consistency, lifecycle policies | [ByteByteGo](https://blog.bytebytego.com/) | [Dropbox — Object Storage](https://dropbox.tech/) |
| 238 | Time-Series Databases | InfluxDB, Prometheus, TimescaleDB, downsampling, retention | [InfluxDB Docs](https://docs.influxdata.com/) · [TimescaleDB Docs](https://docs.timescale.com/) | [Cloudflare — TimescaleDB at Cloudflare](https://blog.cloudflare.com/timescaledb-art/) |
| 239 | Columnar Databases | Parquet, ORC, ClickHouse, column compression, vectorized execution | [ClickHouse Docs](https://clickhouse.com/docs/) · [DDIA Ch. 3](https://dataintensive.net/) | [Cloudflare — ClickHouse at Scale](https://blog.cloudflare.com/) · [Uber — ClickHouse](https://www.uber.com/blog/engineering/) |
| 240 | Data Lakes & Lakehouse | Delta Lake, Apache Iceberg, Hudi, ACID on object storage | [Databricks — Lakehouse](https://www.databricks.com/glossary/data-lakehouse) · [Apache Iceberg](https://iceberg.apache.org/) | [Netflix — Iceberg at Netflix](https://netflixtechblog.com/) · [Uber — Hudi](https://www.uber.com/blog/engineering/) |

### 11.4 ETL and Data Pipelines

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 241 | What is ETL? | Extract → Transform → Load, ELT pattern, data warehouse loading | [DDIA Ch. 10](https://dataintensive.net/) | [Airbnb — Data Pipeline](https://medium.com/airbnb-engineering) |
| 242 | Data Ingestion Strategies | Push vs pull, micro-batch, streaming ingestion, backfill | [Confluent Blog](https://www.confluent.io/blog/) | [Uber — Data Ingestion](https://www.uber.com/blog/engineering/) |
| 243 | Workflow Orchestration | Airflow, Dagster, Prefect, DAG scheduling, retries, SLAs | [Airflow Docs](https://airflow.apache.org/docs/) · [Dagster Docs](https://docs.dagster.io/) | [Spotify — Airflow at Spotify](https://engineering.atspotify.com/) · [Lyft — Airflow](https://eng.lyft.com/) |
| 244 | Data Quality & Validation | Great Expectations, schema validation, deduplication, data contracts | [Great Expectations](https://docs.greatexpectations.io/) | [Uber — Data Quality](https://www.uber.com/blog/engineering/) |
| 245 | Batch + Stream Hybrid | Lambda/Kappa, unified processing, exactly-once across layers | [DDIA Ch. 11](https://dataintensive.net/) | [LinkedIn — Unified Processing](https://engineering.linkedin.com/blog) |

### 11.5 Trade-Offs

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 246 | Throughput vs Latency in Pipelines | Batch (high throughput) vs stream (low latency), micro-batch | [DDIA Ch. 10-11](https://dataintensive.net/) | [Confluent Blog](https://www.confluent.io/blog/) |
| 247 | Eventual Consistency & Data Ordering | Out-of-order events, watermarks, event time vs processing time | [DDIA Ch. 11](https://dataintensive.net/) | [Uber — Event Ordering](https://www.uber.com/blog/engineering/) |
| 248 | Data Freshness vs Cost | Real-time is expensive; near-real-time balances cost and freshness | [Confluent Blog](https://www.confluent.io/blog/) | [Netflix — Cost-Effective Pipelines](https://netflixtechblog.com/) |

[⬆ Back to Top](#-table-of-contents)

---

## 12. Distributed Systems Deep Dive

### 12.1 Google File System (GFS)

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 249 | GFS Introduction | Google's distributed file system, design goals, assumptions | [GFS Paper](https://research.google/pubs/pub51/) · [MIT 6.824 — GFS](https://www.youtube.com/watch?v=EpIgvowZr00) | [Google — Colossus (GFS successor)](https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system) |
| 250 | GFS High-level Architecture | Master + chunkservers, client library, chunk handles | [GFS Paper](https://research.google/pubs/pub51/) | [Google Cloud Blog](https://cloud.google.com/blog/) |
| 251 | Single Master & Large Chunk Size | 64MB chunks, metadata in memory, operation log | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 252 | GFS Metadata | In-memory metadata, operation log, checkpointing | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 253 | GFS Master Operations | Namespace mgmt, chunk placement, garbage collection, re-replication | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 254 | GFS Read Operation | Client → Master (metadata) → Chunkserver (data), caching chunk locations | [GFS Paper](https://research.google/pubs/pub51/) · [MIT 6.824](https://pdos.csail.mit.edu/6.824/) | — |
| 255 | GFS Write Operation | Primary chunk, lease mechanism, data flow pipeline | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 256 | GFS Append Operation | Record append for concurrent writers, at-least-once semantics | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 257 | GFS Consistency & Snapshotting | Relaxed consistency, defined/undefined regions, COW snapshots | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 258 | GFS Fault Tolerance & Data Integrity | Chunk replication (3x), checksums, fast recovery | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 259 | GFS Garbage Collection | Lazy deletion, background reclamation, orphan detection | [GFS Paper](https://research.google/pubs/pub51/) | — |
| 260 | GFS Criticism | Single master bottleneck, consistency trade-offs, evolution to Colossus | [GFS Paper](https://research.google/pubs/pub51/) | [Google — Colossus](https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system) |

### 12.2 Hadoop Distributed File System (HDFS)

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 261 | HDFS Introduction | Open-source GFS, Hadoop ecosystem, batch processing foundation | [HDFS Docs](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) · [Gaurav Sen](https://www.youtube.com/watch?v=GJYEsEEfjvk) | [Meta — HDFS at Facebook](https://engineering.fb.com/) |
| 262 | HDFS Architecture | NameNode + DataNodes, block storage, rack awareness | [HDFS Architecture](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) | [LinkedIn — HDFS](https://engineering.linkedin.com/blog) |
| 263 | HDFS Deep Dive | Block replication, data locality, federation, erasure coding | [HDFS Docs](https://hadoop.apache.org/docs/current/) | [Uber — HDFS at Uber](https://www.uber.com/blog/engineering/) |
| 264 | HDFS Read Operation | Client → NameNode → DataNode, short-circuit reads | [HDFS Docs](https://hadoop.apache.org/docs/current/) | — |
| 265 | HDFS Write Operation | Pipeline replication, packet-level acks, hflush/hsync | [HDFS Docs](https://hadoop.apache.org/docs/current/) | — |
| 266 | HDFS Data Integrity & Caching | Checksums, centralized cache management, memory-mapped I/O | [HDFS Docs](https://hadoop.apache.org/docs/current/) | — |
| 267 | HDFS Fault Tolerance | Block replication, heartbeats, block reports, re-replication | [HDFS Docs](https://hadoop.apache.org/docs/current/) | — |
| 268 | HDFS High Availability | Active/Standby NameNode, JournalNodes, automatic failover | [HDFS HA Guide](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HDFSHighAvailabilityWithNFS.html) | [Meta — HDFS HA](https://engineering.fb.com/) |
| 269 | HDFS Characteristics | Write-once-read-many, large files, streaming access | [HDFS Docs](https://hadoop.apache.org/docs/current/) | — |

### 12.3 Consensus Algorithms

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 270 | Intro to Consensus | FLP impossibility, safety vs liveness, leader election | [DDIA Ch. 9](https://dataintensive.net/) · [Martin Kleppmann — Distributed Systems](https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB) | [Jepsen — Consistency Testing](https://jepsen.io/) |
| 271 | Raft Consensus Algorithm | Leader election, log replication, safety, membership changes | [Raft Paper](https://raft.github.io/raft.pdf) · [Raft Visualization](https://raft.github.io/) · [MIT 6.824](https://www.youtube.com/watch?v=64Zp3tzNbpE) | [CockroachDB — Raft in Practice](https://www.cockroachlabs.com/blog/) · [etcd Blog](https://etcd.io/blog/) |
| 272 | Paxos Algorithm | Proposers, acceptors, learners, Multi-Paxos | [Paxos Made Simple — Lamport](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf) · [Computerphile](https://www.youtube.com/watch?v=s8JqcZtvnsM) | [Google — Paxos in Chubby](https://research.google/pubs/pub27897/) |
| 273 | Byzantine Fault Tolerance | BFT, PBFT, blockchain consensus, 3f+1 nodes | [Lamport — Byzantine Generals](https://lamport.azurewebsites.net/pubs/byz.pdf) | — |
| 274 | Consensus in Practice | etcd (Raft), Consul (Raft), ZooKeeper (ZAB), KRaft | [etcd Docs](https://etcd.io/docs/) · [Consul Docs](https://developer.hashicorp.com/consul/docs) | [Confluent — KRaft Mode](https://www.confluent.io/blog/) |

### 12.4 BigTable

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 275 | BigTable Introduction | Google's distributed storage, sparse sorted map | [BigTable Paper](https://research.google/pubs/pub27898/) · [MIT 6.824](https://pdos.csail.mit.edu/6.824/) | [Google Cloud — BigTable](https://cloud.google.com/blog/) |
| 276 | BigTable Data Model | (row, column family:qualifier, timestamp) → value | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 277 | BigTable System APIs | Read, write, scan, delete, single-row transactions | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 278 | BigTable Partitioning & Architecture | Tablets, tablet servers, master, METADATA table | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 279 | BigTable SSTable | Immutable sorted file, block index, compression | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 280 | BigTable GFS & Chubby | GFS for storage, Chubby for coordination/locking | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 281 | BigTable Components | Master, tablet server, client library, interactions | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 282 | Working with Tablets | Splitting, merging, assignment, load balancing | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 283 | BigTable Read & Write Ops | Memtable → SSTable, read merging, bloom filters | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 284 | Fault Tolerance & Compaction | Minor/merging/major compaction, tablet recovery | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 285 | BigTable Refinements | Locality groups, compression, bloom filters, caching | [BigTable Paper](https://research.google/pubs/pub27898/) | — |
| 286 | BigTable Characteristics | Sparse, distributed, persistent sorted map, HBase as open-source | [BigTable Paper](https://research.google/pubs/pub27898/) | [HBase Blog](https://hbase.apache.org/) |

[⬆ Back to Top](#-table-of-contents)

---

## 13. Observability and Monitoring

### 13.1 Observability Fundamentals

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 287 | Introduction to Observability | Understanding system behavior from external outputs, pillars | [Charity Majors — Observability](https://charity.wtf/) · [Honeycomb Blog](https://www.honeycomb.io/blog) | [Honeycomb Blog](https://www.honeycomb.io/blog) · [Datadog Blog](https://www.datadoghq.com/blog/) |
| 288 | Three Pillars: Logs, Metrics, Traces | Structured logs, time-series metrics, distributed traces | [ByteByteGo — Observability](https://blog.bytebytego.com/) · [Peter Bourgon](https://peter.bourgon.org/blog/2017/02/21/metrics-tracing-and-logging.html) | [Uber — Observability Stack](https://www.uber.com/blog/engineering/) |
| 289 | Observability vs Monitoring | Monitoring: known unknowns; Observability: unknown unknowns, high cardinality | [Honeycomb](https://www.honeycomb.io/blog) | [Charity Majors — Observability](https://charity.wtf/) |

### 13.2 Logging Systems

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 290 | Structured Logging Best Practices | JSON logs, correlation IDs, log levels, context propagation | [12 Factor App — Logs](https://12factor.net/logs) | [Stripe — Structured Logging](https://stripe.com/blog/engineering) |
| 291 | Log Aggregation (ELK, Splunk, Loki) | Centralized logging, indexing, search, Grafana Loki for cost | [Elastic — ELK](https://www.elastic.co/elastic-stack) · [Grafana Loki](https://grafana.com/oss/loki/) | [Grafana Blog — Loki at Scale](https://grafana.com/blog/) |
| 292 | Log Retention & Storage | Hot/warm/cold tiers, ILM policies, cost optimization | [Elastic — ILM](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html) | [Cloudflare — Log Storage](https://blog.cloudflare.com/) |

### 13.3 Metrics and Monitoring

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 293 | Metrics Collection & Aggregation | Counter, gauge, histogram, summary, push vs pull model | [Prometheus Docs](https://prometheus.io/docs/) | [Uber — M3 Metrics Platform](https://www.uber.com/blog/engineering/) |
| 294 | Prometheus & Grafana | PromQL, alerting rules, Grafana dashboards, Thanos for HA | [Prometheus Docs](https://prometheus.io/docs/) · [Grafana Docs](https://grafana.com/docs/) · [TechWorld with Nana](https://www.youtube.com/watch?v=QoDqxm7ybLc) | [Grafana Blog](https://grafana.com/blog/) · [Uber — M3](https://www.uber.com/blog/engineering/) |
| 295 | SLIs, SLOs, and SLAs | SLI: latency P99; SLO: < 200ms; SLA: 99.9% uptime, error budgets | [Google SRE Book — SLOs](https://sre.google/sre-book/service-level-objectives/) · [ByteByteGo](https://blog.bytebytego.com/) | [Google SRE Blog](https://sre.google/blog/) |
| 296 | Availability Metrics & Error Budgets | 99.99% = 52.6 min/year, error budget policies, burn rate alerts | [Google SRE Book](https://sre.google/sre-book/table-of-contents/) | [Cloudflare — SLA Reporting](https://blog.cloudflare.com/) |
| 297 | Alerting Strategies & Alert Fatigue | Symptom-based alerting, runbooks, PagerDuty integration, noise reduction | [Google SRE — Alerting](https://sre.google/sre-book/monitoring-distributed-systems/) | [Datadog — Alerting Best Practices](https://www.datadoghq.com/blog/) |

### 13.4 Distributed Tracing

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 298 | Introduction to Distributed Tracing | Trace a request across microservices, spans, trace context | [OpenTelemetry Docs](https://opentelemetry.io/docs/) · [Jaeger Docs](https://www.jaegertracing.io/docs/) | [Uber — Jaeger (created by Uber)](https://www.uber.com/blog/distributed-tracing/) |
| 299 | OpenTelemetry & Jaeger | Vendor-neutral instrumentation, OTLP protocol, auto-instrumentation | [OpenTelemetry Docs](https://opentelemetry.io/docs/) · [CNCF](https://www.cncf.io/projects/opentelemetry/) | [Grafana — OpenTelemetry + Tempo](https://grafana.com/blog/) |
| 300 | Trace Context Propagation | W3C Trace Context, B3 headers, baggage, context injection | [W3C Trace Context](https://www.w3.org/TR/trace-context/) | [Datadog — Trace Propagation](https://www.datadoghq.com/blog/) |
| 301 | Performance Profiling & Bottleneck Detection | Flame graphs, span analysis, critical path analysis, continuous profiling | [Brendan Gregg — Flame Graphs](https://www.brendangregg.com/flamegraphs.html) | [Netflix — Continuous Profiling](https://netflixtechblog.com/) · [Grafana — Pyroscope](https://grafana.com/blog/) |

[⬆ Back to Top](#-table-of-contents)

---

## 14. Design Patterns and System Optimization

### 14.1 System Design Patterns

| S.No | Lesson | Topics Covered | References | Real Engineering Blogs |
|------|--------|----------------|------------|----------------------|
| 302 | Bloom Filters | Probabilistic membership test, false positives, no false negatives, space-efficient | [Gaurav Sen](https://www.youtube.com/watch?v=V3pzxngeLqw) · [DDIA Ch. 3](https://dataintensive.net/) | [Meta — Bloom Filters in RocksDB](https://engineering.fb.com/) |
| 303 | Consistent Hashing | Hash ring, virtual nodes, minimal redistribution, jump consistent hash | [Gaurav Sen](https://www.youtube.com/watch?v=zaRkONvyGr8) · [HelloInterview](https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts) | [Discord — Consistent Hashing](https://discord.com/blog) |
| 304 | Quorum | W+R > N for consistency, sloppy quorum, read repair | [DDIA Ch. 5](https://dataintensive.net/) · [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/quorum.html) | [Cassandra Docs — Quorum](https://cassandra.apache.org/doc/latest/) |
| 305 | Leader and Follower | Primary-replica, leader election, failover, split brain prevention | [DDIA Ch. 5](https://dataintensive.net/) · [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/leader-follower.html) | [GitHub — MySQL HA](https://github.blog/engineering/) |
| 306 | Write-ahead Log | Durability before commit, crash recovery, WAL in PG/Kafka/etcd | [DDIA Ch. 3](https://dataintensive.net/) · [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/wal.html) | [CockroachDB — WAL](https://www.cockroachlabs.com/blog/) |
| 307 | Segmented Log | Log split into segments, retention, compaction, Kafka segments | [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/log-segmentation.html) | [Confluent — Kafka Log Segments](https://www.confluent.io/blog/) |
| 308 | High-Water Mark | Consumer offset, committed offset, replication progress tracking | [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/high-watermark.html) | [Confluent — Kafka Offsets](https://www.confluent.io/blog/) |
| 309 | Lease | Distributed lock with expiry, fencing tokens, lease renewal | [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/time-bound-lease.html) | [Google — Chubby Lock Service](https://research.google/pubs/pub27897/) |
| 310 | Heartbeat | Node liveness detection, failure detection timeout, phi accrual | [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/heartbeat.html) | [Cassandra — Failure Detection](https://cassandra.apache.org/doc/latest/) |
| 311 | Gossip Protocol | Epidemic protocol, membership, failure detection, state dissemination | [DDIA Ch. 5](https://dataintensive.net/) · [Gaurav Sen](https://www.youtube.com/watch?v=FuP1Fvrv6ZQ) | [Cassandra — Gossip](https://cassandra.apache.org/doc/latest/) · [HashiCorp — Serf](https://www.hashicorp.com/blog) |
| 312 | Phi Accrual Failure Detection | Adaptive failure detection, suspicion level, configurable threshold | [Cassandra Docs](https://cassandra.apache.org/doc/latest/) | [ScyllaDB — Failure Detection](https://www.scylladb.com/blog/) |
| 313 | Split Brain | Network partition → two leaders, fencing, quorum-based prevention | [DDIA Ch. 8](https://dataintensive.net/) · [Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/generation.html) | [Jepsen — Split Brain Analysis](https://jepsen.io/) |
| 314 | Fencing | Fencing tokens, monotonic IDs, preventing stale leader writes | [DDIA Ch. 8](https://dataintensive.net/) · [Martin Kleppmann](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) | [Martin Kleppmann Blog](https://martin.kleppmann.com/) |
| 315 | Checksum | CRC32, MD5, SHA-256, data integrity verification, corruption detection | [DDIA Ch. 7](https://dataintensive.net/) | [Backblaze — Data Integrity](https://www.backblaze.com/blog/) |
| 316 | Vector Clocks | Causality tracking, partial ordering, conflict detection | [DDIA Ch. 5](https://dataintensive.net/) · [Gaurav Sen](https://www.youtube.com/watch?v=jD4ECsieFbE) | [Riak — Vector Clocks](https://riak.com/posts/technical/vector-clocks-revisited/) |
| 317 | CAP Theorem | Consistency, Availability, Partition tolerance — pick two (nuanced) | [DDIA Ch. 9](https://dataintensive.net/) · [Gaurav Sen](https://www.youtube.com/watch?v=kwCFHLbIhak) | [Martin Kleppmann — Stop Calling DBs CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html) |
| 318 | PACELC Theorem | Partition: A vs C; Else: Latency vs Consistency | [DDIA Ch. 9](https://dataintensive.net/) · [ByteByteGo](https://blog.bytebytego.com/) | [ScyllaDB — PACELC](https://www.scylladb.com/blog/) |
| 319 | Hinted Handoff | Temporary storage when target node is down, sloppy quorum | [Cassandra Docs](https://cassandra.apache.org/doc/latest/) · [Dynamo Paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) | [ScyllaDB — Hinted Handoff](https://www.scylladb.com/blog/) |
| 320 | Read Repair | Fix stale replicas during reads, background repair, anti-entropy | [Cassandra Docs](https://cassandra.apache.org/doc/latest/) | [Cassandra Blog](https://cassandra.apache.org/blog/) |
| 321 | Merkle Trees | Hash tree for efficient data sync, anti-entropy repair | [Dynamo Paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) · [Gaurav Sen](https://www.youtube.com/watch?v=s7mEBY5MaOA) | [Cassandra — Anti-Entropy Repair](https://cassandra.apache.org/doc/latest/) |
| 322 | Event Sourcing | Store all state changes as immutable events, replay, temporal queries | [Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html) · [Greg Young](https://www.youtube.com/watch?v=8JKjvY4etTY) | [Confluent — Event Sourcing with Kafka](https://www.confluent.io/blog/) |
| 323 | CQRS | Separate read/write models, eventual consistency, materialized views | [Martin Fowler — CQRS](https://martinfowler.com/bliki/CQRS.html) · [ByteByteGo](https://blog.bytebytego.com/) | [Shopify — CQRS at Scale](https://shopify.engineering/latest) |
| 324 | Saga Pattern | Choreography vs orchestration, compensating transactions, distributed tx alternative | [Microservices.io — Saga](https://microservices.io/patterns/data/saga.html) · [ByteByteGo](https://blog.bytebytego.com/) | [Uber — Saga Orchestration (Cadence)](https://www.uber.com/blog/engineering/) · [DoorDash — Saga](https://doordash.engineering/) |

[⬆ Back to Top](#-table-of-contents)

---

## 📚 Key Resource Legend

| Resource | Type | Link |
|----------|------|------|
| DDIA (Designing Data-Intensive Applications) | 📖 Book | [dataintensive.net](https://dataintensive.net/) |
| HelloInterview | 🌐 Platform | [hellointerview.com](https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction) |
| ByteByteGo (Alex Xu) | 📰 Newsletter + YT | [blog.bytebytego.com](https://blog.bytebytego.com/) · [YouTube](https://www.youtube.com/@ByteByteGo) |
| Gaurav Sen | 🎥 YouTube | [youtube.com/@gkcs](https://www.youtube.com/@gkcs) |
| Hussein Nasser | 🎥 YouTube | [youtube.com/@haborhussain](https://www.youtube.com/@haborhussain) |
| Neetcode | 🎥 YouTube + Platform | [neetcode.io](https://neetcode.io/) |
| Martin Fowler | 📝 Blog | [martinfowler.com](https://martinfowler.com/) |
| Martin Kleppmann | 🎥 Lectures | [YouTube Playlist](https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB) |
| MIT 6.824 | 🎓 Course | [pdos.csail.mit.edu/6.824](https://pdos.csail.mit.edu/6.824/) |
| CMU Database Group | 🎓 Course | [YouTube](https://www.youtube.com/c/CMUDatabaseGroup) |
| Google SRE Book | 📖 Free Book | [sre.google](https://sre.google/sre-book/table-of-contents/) |
| Confluent Blog | 📝 Blog | [confluent.io/blog](https://www.confluent.io/blog/) |

## 🏢 Top Engineering Blogs (Bookmark These)

| Company | Blog URL | Known For |
|---------|----------|-----------|
| Netflix | [netflixtechblog.com](https://netflixtechblog.com/) | Microservices, Chaos Engineering, CDN |
| Uber | [uber.com/blog/engineering](https://www.uber.com/blog/engineering/) | Kafka, Hudi, Real-time Systems |
| Stripe | [stripe.com/blog/engineering](https://stripe.com/blog/engineering) | API Design, Idempotency, Payments |
| Cloudflare | [blog.cloudflare.com](https://blog.cloudflare.com/) | CDN, DDoS, Edge Computing, DNS |
| Discord | [discord.com/blog](https://discord.com/blog) | ScyllaDB, Consistent Hashing, Scale |
| Shopify | [shopify.engineering](https://shopify.engineering/latest) | Modular Monolith, Flash Sales, Sharding |
| Spotify | [engineering.atspotify.com](https://engineering.atspotify.com/) | ML, Search, Data Pipelines |
| LinkedIn | [engineering.linkedin.com](https://engineering.linkedin.com/blog) | Kafka, HDFS, Feed Systems |
| Meta | [engineering.fb.com](https://engineering.fb.com/) | TAO, RocksDB, Memcache, HDFS |
| Airbnb | [medium.com/airbnb-engineering](https://medium.com/airbnb-engineering) | Payments, Search, GraphQL |
| DoorDash | [doordash.engineering](https://doordash.engineering/) | Kafka, Caching, Outbox Pattern |
| Pinterest | [medium.com/pinterest-engineering](https://medium.com/pinterest-engineering) | Sharding, Flink, Search |
| Slack | [slack.engineering](https://slack.engineering/) | Vitess, Sharding, Real-time |
| GitHub | [github.blog/engineering](https://github.blog/engineering/) | MySQL HA, CDN, ProxySQL |
| CockroachDB | [cockroachlabs.com/blog](https://www.cockroachlabs.com/blog/) | Distributed SQL, Raft, Isolation |
| PlanetScale | [planetscale.com/blog](https://planetscale.com/blog) | Vitess, MySQL, Online DDL |
| Grafana | [grafana.com/blog](https://grafana.com/blog/) | Observability, Loki, Tempo |
| Datadog | [datadoghq.com/blog](https://www.datadoghq.com/blog/) | Monitoring, APM, Tracing |
| Confluent | [confluent.io/blog](https://www.confluent.io/blog/) | Kafka, Streaming, KRaft |
| ScyllaDB | [scylladb.com/blog](https://www.scylladb.com/blog/) | NoSQL, Compaction, Performance |

---

## 🗺️ Suggested Learning Path

```
Week 1-2:   S.No 1–19    → Foundations (concepts, scaling, architecture)
Week 3:     S.No 20–40   → Networking & Proxies
Week 4-5:   S.No 41–75   → API Layer (design, auth, gateways, trade-offs)
Week 5:     S.No 76–86   → Load Balancing
Week 6-7:   S.No 87–114  → Caching (patterns, scaling, trade-offs)
Week 7:     S.No 115–129 → CDN
Week 8-9:   S.No 130–152 → Databases & Storage (internals, indexing, txns)
Week 9:     S.No 153–162 → Search Systems
Week 10-12: S.No 163–200 → Scaling Databases (partition, replication, sharding)
Week 12-13: S.No 201–226 → Messaging & Async (Kafka, RabbitMQ, delivery)
Week 14:    S.No 227–248 → Data Processing (batch, stream, ETL)
Week 15-16: S.No 249–286 → Distributed Systems (GFS, HDFS, Consensus, BigTable)
Week 17:    S.No 287–301 → Observability & Monitoring
Week 18:    S.No 302–324 → Design Patterns & Optimization
```

---

> 💡 Start with DDIA + Gaurav Sen/ByteByteGo for each topic, then deep-dive with papers and engineering blogs. Practice with HelloInterview mock designs.

*Last updated: March 2026*
