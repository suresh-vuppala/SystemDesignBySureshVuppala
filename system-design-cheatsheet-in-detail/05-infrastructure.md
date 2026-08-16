# Infrastructure — Live Session Script
### 11 Topics · Spoken Delivery · Under-the-Hood · Interview-Ready

**This is a speaking script, not a reference doc.** The prose is written the way you'd actually say it out loud in a session — short sentences, one idea at a time, every term explained the moment it appears. You can read paragraphs almost verbatim and they'll sound natural.

Every topic follows the same rhythm, because that rhythm is what makes it stick:

> **Set up a problem the room feels** → let them sit with it → **reveal the mechanism** → show where it breaks → **hand off to the next topic that fixes it.**

The whole session tells one story: a single server, traffic growing, and every piece of infrastructure we add because the previous setup ran out of room. Nobody designs all eleven of these on day one — you reach for each one when the last design stops holding.

**Script conventions you'll see throughout:**

| Marker | What to do with it |
|---|---|
| 🗣️ **Say this** | Spoken opener — read it aloud almost as written to set the scene |
| ❓ **Ask the room** | Stop and take answers. Don't answer it yourself for ~10 seconds. |
| ✋ **Pause here** | Let the tension sit before you reveal the solution |
| 🔁 **Bridge** | The verbal transition into the next topic — keeps it one story |
| ⚠️ **Common pushback** | The objection someone will raise, and how to handle it |

---

## 📑 Topics

1. [Load Balancer](#1-load-balancer)
2. [API Gateway](#2-api-gateway)
3. [Forward & Reverse Proxy](#3-forward--reverse-proxy)
4. [NGINX](#4-nginx)
5. [Docker & Kubernetes](#5-docker--kubernetes)
6. [Service Mesh](#6-service-mesh)
7. [Multi-Region & Multi-Tenant](#7-multi-region--multi-tenant)
8. [Service Discovery](#8-service-discovery)
9. [CI/CD & Deployment](#9-cicd--deployment)
10. [Serverless / FaaS](#10-serverless--faas)
11. [Infrastructure as Code](#11-infrastructure-as-code)

---

## 1. Load Balancer

> 🗣️ **Open with the problem — don't name anything yet:**
> "Your app runs on one server. Things are going great. In fact, a little too great — at peak hours, that one server is gasping for air. So you do the obvious thing: you run three copies of it instead of one.
>
> And just like that, you've handed yourself a brand-new headache. A user types your web address. Which of the three servers picks up? And here's the scary one: at 2am, one of those three quietly dies. Do a third of your users suddenly get error pages, while the other two servers sit there totally fine, twiddling their thumbs?"

> ❓ **Ask the room, and actually wait:** "So clearly, *something* has to stand in front of those three servers and decide who takes each request. Put yourself in that something's shoes — what would you need to know to do the job well?"
>
> Let them run with it. You're nudging them toward two simple questions: *is this server even alive right now?* and *which one's the least swamped?* Once both are out loud, you just put a name on the thing they've already invented:

> 🗣️ **Now name it:**
> "Congratulations — you just designed a **load balancer**. And those two questions you came up with? 'Is it alive' and 'who's least busy' — those aren't footnotes. That's the whole job, right there."

> **Analogy that sticks:** it's the host at a busy restaurant. You walk in, and instead of wandering around hunting for a free table, the host seats you at one that's open — and they'd never seat you in a section where the waiter just went home. Spread people out, skip the dead sections. That's a load balancer.

### So what's it really doing?

It sits between your users and your pile of servers. Every request lands on it first, and it passes each one to a healthy server behind it. Three jobs, and that's it:

1. **Spread the load** — nobody gets buried while others sit idle.
2. **Check the pulse** — it's constantly pinging each server. The instant one stops answering, it stops sending traffic there. *This* is the magic that turns "a server died" from a 2am page into a total non-event.
3. **Hide the crowd** — users only ever see one address: the load balancer's. Behind it, you can add servers, kill servers, swap servers — and nobody on the outside notices a thing.

### How closely does it need to look? — where L4 and L7 come from

Here's the trick: don't hand them the terms "Layer 4" and "Layer 7." Hand them the *choice*, and let the terms show up on their own.

> 🗣️ **Pose the real choice:**
> "Our load balancer has to pick a server. But we skipped over a real decision: how much of the request should it actually *read* before choosing?
>
> Two very different worlds. In the first, all three servers are identical twins — any of them can handle anything. So the balancer doesn't need to understand the request at all. It just flings each connection at whoever's free, as fast as it possibly can. In the second world, you've split things up: `/api` needs to go to the API servers, `/video` to the streaming servers. Now the balancer is stuck — it *can't* choose until it opens the request and actually reads the URL."

> ❓ **Ask the room:** "In which world does the balancer have to understand HTTP? And what do you reckon it costs to crack open and read *every single request*, versus just forwarding raw packets?"
>
> ✋ **Pause.** Let it click: reading the request is powerful but slow; forwarding blind is dumb but lightning-fast. That tug-of-war *is* the whole distinction. The two names are just labels for the two answers:

**The "just forward it, fast" answer** lives down at the transport layer — that's **Layer 4**. All it sees is the connection: an IP and a port. It shovels the raw packets through without ever peeking inside, so it genuinely has no clue whether you're logging in or uploading a video. And because it barely does anything, it's ridiculously fast. (That's AWS NLB.)

**The "read it, then route smartly" answer** lives up at the application layer — **Layer 7**. It opens the request, reads the real HTTP — the URL, the headers, the cookies — and makes clever calls: `/api` over here, `/video` over there, mobile users somewhere else entirely. More work per request, but a lot more brains. (That's AWS ALB, and NGINX.)

> **The mailroom picture:** Layer 4 is a sorting machine that reads the address on the envelope and nothing else — fast, but clueless about what's inside. Layer 7 is a receptionist who opens the letter, reads it, and decides exactly where it should go. So: **L4 routes by the address, L7 routes by what's inside.** The moment your routing depends on what's *in* the request, you need L7.

### And which server exactly? — the algorithms

> Send them back to their own idea: "Remember when someone said 'send it to the least busy one'? That's a real strategy — it even has a name. And there are a few cousins, each better for a different situation."

- **Round robin** — server 1, then 2, then 3, then back to 1. Dead simple. Perfect when every request costs about the same.
- **Least connections** — this was your instinct: hand it to whoever's juggling the fewest right now. Better when some requests are quick and others drag on, so "busy" keeps shifting.
- **IP hash** — the same user always lands on the same server. Useful when that server is keeping the user's session in memory (though hang on till topic 8 — we'll see why keeping sessions in memory is a trap you'll regret).
- **Weighted** — the beefier server gets a bigger slice. Handy mid-migration, when half your fleet is shiny and new and half is old and tired.

> 🔁 **Bridge into topic 2:**
> "So — the load balancer spreads traffic and dodges dead servers. Lovely. But look at everything it *shrugs off*. It doesn't check whether you're logged in. It doesn't stop some bot hammering you a million times an hour. It doesn't deal with your SSL certificates. All that still has to happen somewhere — and if the answer is 'inside every single service,' you're about to write the same code twenty times. Feel that itch? That's exactly the gap the next thing fills."

---

## 2. API Gateway

> 🗣️ **Tell the story of how we got here — it's the cleanest way in:**
> "Rewind to the 2000s. Life was simple. Your whole app was one big program on one server — a **monolith**. The client hit one address, and that single thing did everything: users, orders, payments, all of it. One door, one URL. Easy.
>
> Then, around 2010, that stopped scaling. So the industry broke the monolith into pieces — **microservices**. Users became its own service, orders its own, payments its own. Great for scaling. But look what it did to the poor client."

> ❓ **Ask the room:** "The client used to know one address. Now there are twenty services, each on its own host, each moving around as they scale and restart. What's the client's life like now?"
>
> ✋ **Pause.** Let it land: the client is now a switchboard operator, forced to memorize twenty different URLs — and every time the backend team adds a service or moves one, every client app in the world has to be updated. That's madness. So around 2013–2014, someone said the obvious thing:

> 🗣️ **Name it:**
> "What if the client just talked to *one* address again — like the monolith days — and one thin layer behind it figured out where each request should really go? That thin layer is the **API Gateway**. Client sees one front door; the gateway quietly routes `/messages` to the messages service, `/orders` to orders, and so on."

Now hit them with the *second* win, because it's the one that makes gateways indispensable:

> 🗣️ **The follow-up pain:**
> "And once every request is flowing through this one door anyway — think about all the boring stuff each of those twenty services was *also* having to do on its own. Every one checks if you're logged in. Every one blocks spammers. Every one juggles the HTTPS certificate. Do we really write that twenty times, and fix every bug in twenty places? Or... do we just do it once, right here at the door we already built?"

> **Analogy that sticks:** it's the security desk in a big office lobby. You sign in *once*, and then you can visit any floor. Two things happen at that desk — they point you to the right floor (routing), and they check your badge (the shared guard-rail stuff). The alternative, a guard at every single office door re-checking your ID, is exactly the twenty-copies nightmare. The gateway is that one lobby desk.

### What actually happens at that front door

Follow a single request as it walks through the gateway, top to bottom. Each step is a job you'd otherwise be copy-pasting into all twenty services:

1. **Validation** — first, a quick sanity check. Are the required headers there? Is the body shaped the way it should be? Garbage requests get bounced right here, before they waste a service's time.
2. **The shared guard-rails (middleware)** — now the repetitive stuff every service needed anyway: **authenticate** the caller (verify their token — OIDC and friends), **rate-limit** them (the same counter idea from the scalability module, moved to the edge), and quietly record **metrics** on the way through. Fail any of these and the request never reaches a backend.
3. **Routing** — the original reason we built this thing. The gateway reads the path — `/messages` — and looks up, from config, which service owns it, then forwards it there. (Notice this is exactly the L7 "read it and route by content" move from the last topic. A gateway is an L7 router with policy bolted on.)
4. **Response transformation** — the backend might reply in gRPC or some internal format, but the client is a browser expecting plain JSON. The gateway translates on the way out, so neither side has to care what the other speaks.

Adding a new service, then, is just a line of routing config — no client anywhere needs to change. That's the whole promise: **one stable front door, everything messy hidden behind it.**

The names you'll hear: managed ones like **AWS API Gateway** and **Azure API Management**; open-source ones like **Kong**, **Tyk**, and **Express Gateway**.

> ⚠️ **The question that always comes up:** *"Hang on — isn't that just a load balancer?"*
>
> Great question, worth pausing on. A load balancer asks one thing: *"which of these identical servers takes this?"* A gateway asks a different thing: *"should I even let this in, and which *different* service does it belong to?"* They overlap — a gateway almost always balances load too — but the gateway stacks the validation, auth, rate limiting, and translation on top. Quick way to hold it: **load balancer = distribution. Gateway = distribution *plus* the bouncer.**

> 🎯 **Interview tip — say this and move on:** in a system design interview, an API Gateway is *expected* in any microservices answer. Drop it in, name its two headline jobs — routing and shared middleware (auth, rate limiting) — and keep walking. It's standard infrastructure plumbing; interviewers want to see you know it's there, not watch you spend five minutes lovingly describing it. Mention it, then get back to the interesting parts of your design.

> 🔁 **Bridge into topic 3:**
> "Now step back and notice something sneaky. The load balancer sits in front of your servers and hides them. The gateway sits in front of your services and hides them. Same move, twice. They're both really just one older, simpler idea wearing different outfits — and once you see that idea, half of infrastructure suddenly stops looking like a random pile of tools. Let's name it."

---

## 3. Forward & Reverse Proxy

> 🗣️ **Point at what they already built:**
> "Look at the last two things we made. The load balancer sits between the user and the servers, hiding the servers. The gateway sits between the user and the services, hiding the services. Spot the pattern?
>
> It's the same shape both times — a middleman that stands in between and talks on behalf of one side. And here's the payoff: once that shape clicks, a whole shelf of tools you thought were different suddenly turn out to be the same trick in different clothes."

> ❓ **Ask the room:** "A middleman could hide *who's asking*, or it could hide *who's answering*. Those are two genuinely different jobs. Where would each one actually be handy?"
>
> ✋ **Pause.** Let them fish for examples. Then hand them the name:

> 🗣️ **Name it:**
> "That middleman is a **proxy**. And which way it faces is the whole story. Stand in front of the *client* and hide who's asking — that's a **forward proxy**. Stand in front of the *servers* and hide who's answering — that's a **reverse proxy**. Everything we've built so far, and a bunch of what's coming, is really just a reverse proxy in a costume."

### Make each direction real

The words only stick if you tie them to something people have actually seen:

**Forward proxy — the one guarding the client.** Picture your office network. Every employee's web traffic goes out through one company gateway that filters, logs, and caches it. The websites they visit only ever see *the company*, never little you at desk 14. It's standing in front of the people making the requests, speaking for them.

**Reverse proxy — the one guarding the servers.** This is everything we've built. Hit any Cloudflare-protected site and you'll never know which of its origin servers actually answered you — you only ever spoke to the proxy out front. Your load balancer? Reverse proxy. Your API gateway? Reverse proxy. It's standing in front of the machines doing the work, speaking for them.

> **The switchboard picture:** a reverse proxy is like an old company switchboard. You call one number, and the operator quietly connects you to the right person inside — you never learn anyone's direct extension. A forward proxy is the reverse: it's your office mailroom, sending all your outgoing mail stamped with the company's return address, so the outside world never sees your name. **Forward hides who's asking; reverse hides who's answering.**

### Why this one idea is everywhere

Here's the real reason it's worth naming the pattern instead of just memorizing products. The second you put a reverse proxy in front of your servers, you've created a single doorway that *every* request has to walk through. And once you own that doorway, a pile of superpowers come almost for free. Ask the room — "if every request has to pass through one door you control, what could you start doing at that door?" — and they'll come up with most of these themselves:

- **Hide the servers** — the outside world never learns your internal IPs, so there's simply less to attack.
- **Handle HTTPS once** — decrypt at the door; your servers behind it never touch a certificate.
- **Cache** — answer repeat requests right at the door without ever bothering the real server.
- **Soak up attacks** — absorb a DDoS at the edge, long before it reaches anything breakable.

And *that's* the punchline: the load balancer, the gateway, the CDN, NGINX — they all look alike because they're all the same doorway trick, each one just leaning into a different superpower.

> 🔁 **Bridge into topic 4:**
> "Okay — 'reverse proxy' is the idea. But an idea doesn't run in production. Something concrete has to actually *be* the doorway. And nine times out of ten, it's a single piece of software that can wear every one of these hats at once. Let's go meet it."

---

## 4. NGINX

> 🗣️ **Open with the gap they should be feeling:**
> "We've been saying 'reverse proxy' and 'load balancer' and 'SSL termination' as if they're abstract roles. But something concrete has to actually *be* those things — a real piece of software you install and run. So what is it?
>
> For a huge chunk of the internet, the answer is one tool. But before I name it, let me tell you about the problem that made it win — because that problem is more interesting than the tool."

> ❓ **Ask the room:** "The older generation of web servers gave every incoming connection its own dedicated thread. Picture a hundred thousand users connected at once. What goes wrong?"
>
> ✋ **Pause and let it hurt.** Steer them to it: a hundred thousand threads is gigabytes of memory just for thread stacks, and the CPU spends its life switching between them instead of doing work. That's the famous **C10K problem** — how do you handle ten thousand-plus concurrent connections on one box?

> 🗣️ **Now name it as the answer:**
> "The tool that cracked C10K, and as a result now runs about a third of all websites, is **NGINX**. And the way it cracked it is the one thing worth remembering about it."

### The architecture — why it's fast

Old web servers like Apache used **thread-per-connection**: every open connection got its own operating-system thread. Threads are expensive — each one eats memory and forces the CPU to constantly switch context. At ten thousand connections, the machine spends more time managing threads than doing work.

NGINX flips it. It uses a small number of **worker processes**, each running an **event loop** — a single thread that juggles thousands of connections by only doing work when a connection actually has data ready (this is the `epoll` mechanism on Linux). One thread handles thousands of connections. No thread-per-request, no memory explosion.

> The line to say: **one NGINX worker thread handles thousands of connections at once, because it never sits blocked waiting — it only wakes up when there's actual work.** That's how it serves 100K+ concurrent connections on modest hardware.

A **master process** reads the config and manages the workers; the **workers** do all the actual connection handling.

### The roles it plays

Because it's a fast, general reverse proxy, NGINX wears many hats — often several at the same time:
- **Web server** — serve static files (HTML, CSS, images) straight off disk, extremely fast.
- **Reverse proxy + load balancer** — sit in front of your app servers, distribute traffic (round robin, least connections, IP hash, weighted).
- **SSL termination** — HTTPS in from the client, plain HTTP out to the backends.
- **Content cache** — `proxy_cache` serves repeated responses without touching the backend.
- **API gateway** — with the right config, it does auth and rate limiting too.

> **Real-world:** Netflix uses it for video delivery. Dropbox replaced Apache with it and cut their server count by 75%. It's the default Ingress Controller in Kubernetes — which is the perfect segue, because we've been assuming these servers just *exist*. Time to talk about how the apps get packaged and run in the first place.

> 🔁 **Bridge into topic 5:**
> "We've spent four topics on the traffic layer — getting requests to servers. But we quietly skipped a huge question: what *is* a server now? How does your app actually get packaged, shipped, and kept running when it crashes? For the last decade the answer has been two tools that changed everything."

---

> 🗣️ **Open with two pains everyone in the room has lived:**
> "We've spent four topics getting traffic to servers. But we've been hand-waving one word this whole time: *server*. What actually is one now? Let me give you two problems that every engineer here has hit personally.
>
> First: 'it works on my machine.' The code runs perfectly on your laptop and falls over in production — different OS, different library versions, different config. Second: it's 3am, a server crashes, and the current recovery plan is *a human wakes up and restarts it.*"

> ❓ **Ask the room, one at a time.** First: "What actually differs between your laptop and prod that makes the same code behave differently?"
>
> Let them list it — OS, library versions, env vars, dependencies. *That list is the first problem.* Then ask: "And who's responsible for noticing a crashed server and fixing it — should that really be a person?"

> 🗣️ **Name both, in order:**
> "The first problem — the environment differences — is solved by **Docker**: you package the app *with* its entire environment so it runs identically everywhere. The second — keeping a fleet alive without a human babysitting it — is solved by **Kubernetes**. And the order matters: Kubernetes only makes sense once your apps are already in containers, so we take Docker first."

### Docker — package the app with everything it needs

A container bundles your app together with every dependency it needs to run — the right runtime, the right libraries, the right config — into one **image**. That image runs identically on your laptop, in staging, and in production, because it carries its whole world with it.

Three terms to define as you go:
- **Image** — the immutable template: app + dependencies, built from a `Dockerfile`, stored in a registry (Docker Hub, ECR).
- **Container** — a running instance of an image. Unlike a full virtual machine, it shares the host's kernel, so it's lightweight and starts in *seconds*, not minutes.
- **Volume** — persistent storage that survives a container restart (containers themselves are disposable).

### Kubernetes — keep the fleet alive

Docker runs one container. But production is hundreds of containers across many machines, and they crash, and traffic spikes. Managing that by hand is impossible. Kubernetes (K8s) is the **orchestrator** — you declare the state you want, and it constantly works to make reality match.

The concepts, in the order they build on each other:
- **Pod** — the smallest unit: one or more containers that share a network and storage. Ephemeral — expected to die and be replaced.
- **Deployment** — you declare "I want 5 copies of this pod running version 2.3." K8s makes it so, and handles rolling updates and rollbacks.
- **Service** — pods die and get new IPs constantly, so a Service gives them one **stable network address**. (Hold that thought — it's the seed of topic 8.)
- **HPA (Horizontal Pod Autoscaler)** — automatically adds/removes pods based on CPU, memory, or custom metrics (this is the auto-scaling from the scalability module).
- **StatefulSet** — like a Deployment but with stable, ordered identities, for things like databases and Kafka that can't be treated as interchangeable.
- **Ingress** — the HTTP routing rules for external traffic coming into the cluster (often backed by an NGINX Ingress Controller — there's our topic 4 again).

> The core guarantee to state clearly: **you declare the desired state, and Kubernetes continuously reconciles reality to match it.** A pod dies → the controller notices → it starts a new one. Nobody gets paged. That reconciliation loop is the whole philosophy.

**Self-healing** works through probes: a **liveness probe** asks "is this pod alive?" (restart it if not) and a **readiness probe** asks "can it serve traffic yet?" (don't route to it until yes).

> **Real-world:** Kubernetes descends from Google's internal Borg. Spotify runs 2000+ services on it. The managed flavors are EKS (AWS), GKE (Google), AKS (Azure).

> 🔁 **Bridge into topic 6:**
> "So now we've got hundreds of services running in a cluster, all talking to each other constantly. New question: how do those internal calls stay secure and observable? The gateway guarded the front door — but it has no idea what's happening between services *inside*. Encrypting every internal call and tracing it, in application code, across hundreds of services? That's a nightmare. So we push it down into the infrastructure."

---

## 6. Service Mesh

> 🗣️ **Build the problem before offering anything:**
> "Kubernetes is now running two hundred of our services, and they call each other constantly. Three demands land on your desk in the same week. Security: every internal call must be encrypted. Ops: we need a trace of every call to debug anything. Product: we want to send 5% of internal traffic to a new version to test it.
>
> Every one of those is about traffic *between* your own services. And the obvious place to put the logic — inside the services — means writing mutual TLS and tracing and traffic-splitting into all two hundred of them, in every language your teams use. Fix a bug, fix it two hundred times."

> ❓ **Ask the room:** "We already learned we can't scatter shared logic across services — that's why we built the gateway. But the gateway only sees traffic coming *in from outside*; it has no idea what's happening between services on the inside. So if not the app, and not the gateway — where does this logic go?"
>
> ✋ **Pause.** Nudge them: what if every service had its own little helper sitting right next to it, quietly intercepting everything it sends and receives?

> 🗣️ **Name it:**
> "That helper-beside-every-service is called a **sidecar**, and a fleet of them, centrally controlled, is a **service mesh**. Because every call now flows through these proxies, the platform can encrypt, trace, and reroute traffic — and your application code never knows it's happening."

### The sidecar model

A service mesh puts a small proxy — usually **Envoy** — right next to every single service instance. This is the **sidecar**. Your service doesn't talk to the network directly anymore; it talks to its sidecar, and the sidecar talks to the other service's sidecar.

Because every call now flows through a pair of proxies that the platform controls, you get — with *zero* application code changes:

- **mTLS everywhere** — mutual TLS between every pair of services automatically. Zero-trust: even internal traffic is encrypted and authenticated.
- **Automatic observability** — metrics and traces for every single call, because the proxies see everything.
- **Traffic management** — canary releases, retries, timeouts, and circuit breaking (from the graceful-degradation topic) — all configured in YAML, not code.

Istio and Linkerd are the common meshes; both typically use Envoy as the sidecar proxy.

> The distinction to nail — and interviewers love this one: **API Gateway is north-south (traffic between the outside world and your system). Service mesh is east-west (traffic between your own services).** Say it with the compass image; it sticks.

> ⚠️ **Common pushback:** *"This sounds like a lot of overhead."*
>
> It is — and be honest about it. A sidecar next to every pod doubles your proxy count and adds latency and resource cost. You don't reach for a mesh at ten services. You reach for it when the *number of services* makes hand-rolling mTLS and tracing in code more painful than running the mesh. Naming that trade-off honestly builds credibility.

> 🔁 **Bridge into topic 7:**
> "Everything so far lives in one cluster, in one place. But 'one place' is a liability. What if that whole region goes down? What if your European users are 150ms away because your servers are all in Virginia? What if the law says EU data must physically stay in the EU? One location can't answer any of those. So we spread out geographically."

---

## 7. Multi-Region & Multi-Tenant

> 🗣️ **Open with three complaints landing at once:**
> "Everything we've built so far lives in one place — one cluster, one data center. Let me read you three complaints that hit a growing company in the same month. Your users in Tokyo say the app is sluggish. Your one data center had an outage and took the whole product down for an hour. And your legal team says a new EU law requires European customer data to physically stay in Europe.
>
> Notice something — not one of those three problems can be fixed by anything we've discussed. They're all the same root cause: you only exist in one location."

> ❓ **Ask the room:** "What's the only real fix for 'slow from far away,' 'the whole site dies if one place dies,' and 'the data must live in a specific country'?"
>
> They'll arrive at it — run in more than one place. That's the reveal:

> 🗣️ **Name it — and separate the two ideas cleanly:**
> "Running in several geographic locations is **multi-region**, and it directly answers all three: latency, disaster recovery, and compliance. There's a second, easily-confused idea we'll cover right after — **multi-tenant** — which is a different axis entirely: not *where* you run, but *how many customers share the same running copy*. Region first."

### Multi-region — why run in more than one place

Three drivers, and it's worth asking the room which they think matters most for their product:

- **Low latency** — put servers near users. A user in Tokyo shouldn't wait for a round trip to Virginia.
- **Disaster recovery** — if an entire region goes down (it happens), another region keeps you alive.
- **Compliance** — data-residency laws (GDPR) can require EU user data to physically stay in the EU.

The deployment patterns:

- **Active-Passive** — one region serves all traffic; a standby waits to take over. Simple, but the standby sits idle burning money, and failover takes minutes.
- **Active-Active** — both regions serve traffic simultaneously, data replicated between them. Low latency globally, *but* now you can have the same record written in two regions at once — and that's the conflict-resolution problem from multi-leader replication.
- **Follow-the-Sun** — route to whichever region is in business hours. Good for support/ops workloads.

> The honest trade-off to state: **multi-region buys you latency, resilience, and compliance — and charges you in replication lag and conflict resolution.** There's no free lunch; going active-active means confronting "what if both regions wrote the same row?"

### Multi-tenant — how many customers share a copy

A "tenant" is a customer. The question is how much they share:

- **Shared app, shared DB** — everyone runs on the same app and the same database; rows are separated by a `tenant_id` column. Cheapest, simplest ops. Risk: noisy-neighbor (one tenant's load hurts others) and data-leak risk (one missing `WHERE tenant_id` and you've shown customer A's data to customer B). Salesforce, Slack.
- **Shared app, DB-per-tenant** — one app, but each customer gets their own database. Better isolation, more operational overhead. Shopify-style.
- **Everything separate** — each tenant gets their own app *and* database. Full isolation, needed for enterprise/compliance deals, most expensive.

> The progression to say out loud: **most SaaS starts fully shared for cost, then migrates toward isolation as they land bigger customers who demand it.** You grow into isolation; you don't start there.

> 🔁 **Bridge into topic 8:**
> "Now step back and look at what we've built. Containers that die and respawn with new IPs. Autoscalers adding and removing pods. Multiple regions. The entire fleet is in constant motion — IPs are changing every minute. So here's a question we've been quietly dodging since the Kubernetes Service slide: when service A wants to call service B, how does it even find B, if B's address changed thirty seconds ago?"

---

> 🗣️ **Open by contrasting the old world with the one we just built:**
> "Rewind ten years. You put the database's IP address in a config file, and you never touched it again — that server lived for three years at the same address.
>
> Now look at what we've built over the last few topics: containers that die and respawn, autoscalers adding and removing pods, multiple regions. In this world, a service's address might change every few minutes. So if service A hardcodes service B's IP, it breaks the very first time B restarts. Remember that stable-address thing Kubernetes gave us with a Service? This is the problem it was quietly hinting at."

> ❓ **Ask the room:** "When B's address is a moving target, *someone* has to always know B's current location. Should that be the caller's job, or should something in the middle handle it?"
>
> ✋ **Pause.** That single question forks into the two real models. Once they've wrestled with it, name the whole area:

> 🗣️ **Name it:**
> "The general problem — 'how does anything find anything in a fleet that never holds still' — is **service discovery**. And your instinct about *who* does the finding is exactly the fork: the caller can do it (client-side) or a middleman can (server-side). Both are real; they trade off differently."

### The core idea: a registry

Every service, when it starts up, **registers** itself — "I'm service B, I'm at 10.0.0.5, and I'm healthy." When it dies or fails a health check, it's **deregistered**. That registry is the source of truth for "who's alive and where."

Health checks are the critical part: the registry constantly verifies instances and drops dead ones **within seconds** — that's what makes failover fast. Use **liveness** (is it alive?) plus **readiness** (can it serve traffic yet?) probes, and deregister immediately rather than waiting for a TTL to expire.

### The three ways it happens

**Client-side discovery** — the caller asks the registry directly, gets back a list of healthy IPs, and picks one itself (it load-balances locally). No extra network hop. Downside: every service needs the discovery logic baked in — an SDK per language, and the client can cache stale entries. (Eureka + Ribbon, Consul SDK.)

**Server-side discovery** — the caller just makes a simple request to a stable address (a load balancer or proxy), and *that* thing does the lookup and routing. Simple clients, language-agnostic. Downside: an extra network hop, and the LB is a potential single point of failure. (AWS ALB + Cloud Map, Envoy.)

**DNS-based discovery** — the caller resolves a name like `service-b.namespace` through DNS, which returns current IPs. Zero SDK — every language already has a DNS resolver. This is how Kubernetes works, via CoreDNS. Downside: DNS TTL caching can hand you a stale IP for a dead instance.

> The Kubernetes specifics worth naming: a **ClusterIP** service gives one virtual IP and `kube-proxy` routes it to a live pod; a **headless** service returns all the pod IPs directly (for stateful sets or client-side load balancing).

### The registry tools

Worth knowing a few by name and what makes each distinct:
- **Consul** — Raft consensus, rich health checks, multi-datacenter, doubles as a service mesh.
- **etcd** — Raft, strongly consistent, and it's the backbone Kubernetes itself uses to store cluster state.
- **Eureka** — Netflix's, AP (favors availability), heartbeat-based.
- **ZooKeeper** — the mature elder, used across the Kafka/Hadoop world.
- **Kubernetes built-in** — uses etcd + CoreDNS, zero setup, probes for health.

> The anti-patterns to warn about: **hardcoded IPs** (break on any scale event), **long DNS TTLs** (route to dead instances), and **no health checks** (registry serves stale entries).

> 🔁 **Bridge into topic 9:**
> "So now the platform can run our services, keep them alive, spread them across regions, and let them find each other. Everything to *operate* the system is in place. But we've dodged one thing the whole time: how does new code actually get *into* this platform safely? Because 'push to prod and pray' doesn't survive contact with real users."

---

## 9. CI/CD & Deployment

> 🗣️ **Open on the moment everyone dreads:**
> "We can now run our services, keep them alive, spread them across regions, let them find each other. The platform is solid. But we've dodged one thing entirely: how does *new code* actually get onto it?
>
> Picture the old way. A person, on a Friday afternoon, SSH-ing into servers and running commands by hand, hoping nothing breaks. If it does break, that same person is now frantically trying to remember what the old version was. That's the scariest moment in software — and it's scary precisely because it's manual, unrepeatable, and has no undo."

> ❓ **Ask the room:** "You've got a new version to push to a service that's handling live traffic *right now*. How do you swap it in without a single user seeing an error — and how do you get back if it's bad?"
>
> ✋ **Pause.** Let them propose something. Then frame the two halves of the answer:

> 🗣️ **Name it:**
> "Automating that whole path from commit to production is **CI/CD** — and the *way* you swap the new version in is your **deployment strategy**, which turns out to be the part that decides how much damage a bad release can do before you catch it. There are four standard strategies, each a different trade between risk, cost, and speed."

### CI vs CD

- **CI (Continuous Integration)** — every commit automatically triggers a build and the test suite. You catch breakage in minutes, not at release time.
- **CD (Continuous Delivery/Deployment)** — those validated builds flow automatically through staging to production.

The pipeline: `commit → build → test → build image → deploy staging → e2e tests → canary in prod → full rollout → auto-rollback if it misbehaves.`

### The deployment strategies — the heart of this topic

**Rolling update** — replace instances one at a time: v1, v1, v2, v1, v2, v2... until all are v2. Zero downtime, and it's the Kubernetes default. Catch: for a while you're running *mixed* versions, so v1 and v2 must be compatible.

**Blue-Green** — run two complete environments. Blue is live; you deploy the new version to Green, test it, then flip the router so all traffic goes to Green instantly. **Rollback is instant** — just flip back. Catch: you're paying for 2× the infrastructure, and any database schema change has to work with both versions.

**Canary** — release to a tiny slice first: 95% stay on v1, 5% get v2. Watch the error rate and latency on that 5%. Looks good? Ramp to 25%, then 100%. **Smallest blast radius** — a bad release only hits 5% before you catch it. Catch: slow, and it needs good observability to judge the canary.

**Feature Flag** — deploy the code to everyone but keep the feature switched *off*, then toggle it on (per user, per region, or all at once) without redeploying. Decouples "deploy" from "release." Instant kill switch. Catch: flags accumulate as debt, and your testing matrix grows with every flag.

> The framing to give: **rolling is the safe default, blue-green buys instant rollback at double cost, canary buys the smallest blast radius at the cost of speed, and feature flags decouple releasing from deploying entirely.** Match the strategy to how much a bad release would cost you.

**Auto-rollback** is the safety net: the pipeline watches SLOs — error rate above 1%, p99 latency above 500ms — and automatically rolls back if the new version breaches them. Nobody has to be awake.

> **Real-world:** Netflix's Spinnaker runs automated canary analysis. Google ramps 1% → 10% → 50% → 100% over days. Amazon deploys to a single host first ("one-box"). Tools: GitHub Actions, GitLab CI, ArgoCD, Spinnaker, Flux.

> 🔁 **Bridge into topic 10:**
> "Everything to this point assumes you're managing servers — even if Kubernetes hides a lot of it, there are still machines, still capacity to plan, still a fleet to keep patched. What if, for a whole class of workloads, you just... didn't? No servers to manage, and you pay only when your code actually runs. That's the pitch of serverless."

---

## 10. Serverless / FaaS

> 🗣️ **Open by questioning everything they just learned:**
> "We've spent nine topics learning to manage servers — balance them, orchestrate them, mesh them, scale them. So let me ask an almost heretical question: what if, for a whole class of work, you just... didn't have servers to manage at all?
>
> Imagine you upload a single function. You never provision a machine, never plan capacity, never pay for idle time. A request comes in, your function runs, you pay for those few milliseconds. No traffic for an hour? It costs you nothing — it literally scaled down to zero."

> ❓ **Ask the room:** "That sounds like it should replace everything we've built. Before you believe the hype — if a function scales all the way to zero when nobody's using it, what must happen the instant the *next* request shows up?"
>
> ✋ **Pause.** Let them realize it: there's nothing running, so the platform has to build the environment from scratch — download the code, boot the runtime — before your function can even start. That delay is the whole catch.

> 🗣️ **Name it, and name the catch:**
> "This model is **serverless**, or **FaaS** — functions as a service. And that startup delay you just identified has a name: the **cold start**. Everything about where serverless fits, and where it absolutely doesn't, comes down to that one trade-off."

### The execution model — cold vs warm

**Cold start** — the first invocation (or after idle) has to: download your code, spin up the runtime (JVM, Node, Python), then run your handler. That's anywhere from ~100ms to several seconds — and Java is the worst offender because the JVM is heavy to boot.

**Warm invocation** — if the environment is still around from a recent call, it skips all that and just runs your handler. 1–5ms of overhead.

> The line to land: **serverless scales to zero, which is why it's cheap when idle — but scaling up from zero means a cold start, which is why it's wrong for anything latency-sensitive.** That single trade-off explains the entire "good for / bad for" table.

### Where it fits — and where it doesn't

**Great for:**
- Event-driven glue — respond to an S3 upload, a queue message, a DynamoDB change.
- Spiky or low-volume traffic — pay nothing between bursts.
- Image/video processing, cron jobs, queue workers.
- Prototypes and MVPs — zero infra to stand up.

**Bad for:**
- Low-latency APIs (p99 under 10ms) — the cold start alone blows the budget.
- Long-running jobs — Lambda caps at 15 minutes.
- Sustained high traffic — past roughly a million requests a day, containers become cheaper.
- Stateful sessions or WebSockets — functions are stateless by design; keep state in an external store.

**Cold-start mitigations** worth naming: **provisioned concurrency** (pre-warm N instances — costs money), **SnapStart** (snapshot the JVM after init and restore it, for Java), and picking **fast runtimes** like Go or Rust (10–50ms cold starts).

The **cost model**: requests × duration × memory. Cheap at low volume; it crosses over and becomes *more* expensive than containers at sustained high throughput.

> 🔁 **Bridge into topic 11:**
> "So now we have every option on the table — load balancers, gateways, clusters, meshes, regions, pipelines, functions. Which raises one final, uncomfortable question. All of this infrastructure — who created it, and how? If the answer is 'someone clicked around the AWS console for two days,' then nobody can reproduce it, review it, or recover it when it's gone. That's the last problem to solve."

---

## 11. Infrastructure as Code

> 🗣️ **Open with a scenario that should make them uneasy:**
> "We've now assembled a lot of infrastructure — load balancers, clusters, meshes, regions, pipelines. So let me ask the uncomfortable question: *who built all of it, and how?*
>
> Picture the honest answer at most companies: one engineer clicked through the cloud console for two days to set it all up. Now play it forward. That engineer leaves. Or the whole region goes down and you need to rebuild every piece of it, in a new region, by tonight. Could you? Does anyone even know exactly what was clicked, in what order?"

> ❓ **Ask the room:** "We'd never manage application code by editing it live on the server with no version control, no review, no history. So why do we tolerate exactly that for the infrastructure the code runs on?"
>
> ✋ **Pause.** Let the double standard sink in. The fix is to treat infrastructure the same way we treat code:

> 🗣️ **Name it:**
> "If you write your infrastructure *down* — in files, in git, reviewed in pull requests, applied by a tool — then it's reproducible, auditable, and rebuildable from scratch. That's **Infrastructure as Code**. The console-clicking becomes a text file you can diff, review, and re-run."

### The core idea

Instead of clicking in a console, you *write down* what you want in files: "an S3 bucket named X with versioning on, a database of this size, a load balancer routing to these servers." A tool reads those files and makes the cloud match them.

Two flavors of how you express it:
- **Declarative** — you describe the desired end state; the tool figures out the steps. Terraform (HCL), CloudFormation (YAML). This is the dominant style.
- **Imperative / real code** — you write actual programming code (loops, conditionals, types) that produces infrastructure. Pulumi (TS/Python/Go), AWS CDK. Good when you want abstraction and testing.

The main tools: **Terraform** (multi-cloud, huge provider catalog — the de facto standard), **OpenTofu** (its open-source fork), **CloudFormation** (AWS-native), **Pulumi** and **AWS CDK** (real programming languages), **Crossplane** (Kubernetes-native).

### The workflow — why this is powerful

The magic is that infrastructure changes now go through the exact same flow as code changes:

1. **PR** — you change the infra files; CI runs `terraform plan`, which shows *exactly* what will change.
2. **Review** — your team reads that plan diff in the PR. You see "this will delete a database" *before* it happens.
3. **Merge** — `terraform apply` runs automatically and makes the change.
4. **State** — the tool keeps a **state file** (in S3 with a DynamoDB lock) tracking what currently exists, so it knows the difference between what's there and what you want.
5. **Drift detection** — scheduled `plan` runs catch it when someone changes something by hand.

> The one guarantee to say clearly: **because the whole environment is defined in code, you can destroy it and rebuild it identically — in a new region, in a new account — from the files alone.** That's disaster recovery, environment parity, and onboarding, all from the same property.

The **anti-patterns** to warn about: **ClickOps** (manual console changes that drift from the code), a single **mega-stack** (one state file for everything — slow and risky), **secrets in state** (the state file can contain sensitive values — encrypt it, keep real secrets in Vault/SSM), and **no state locking** (two people applying at once corrupts the state).

> **Real-world:** HashiCorp's Terraform manages millions of cloud resources. Shopify uses CDK. GitLab runs all infrastructure changes through Terraform + GitOps.

---

## Closing the session

> 🗣️ **Say this to close:**
> "Let's retrace the whole thing, because there was one story running through all eleven topics.
>
> We started with one server that couldn't cope, so we put many behind a **load balancer**. The load balancer only spread traffic, so we added an **API gateway** for auth and rate limiting. Both turned out to be kinds of **reverse proxy**, and the tool that actually plays that role is **NGINX**. Then we asked what a server even is anymore, and the answer was **Docker** to package apps and **Kubernetes** to keep a fleet of them alive. Hundreds of services talking to each other needed secure, observable internal traffic, so we added a **service mesh**. One location was a liability, so we went **multi-region and multi-tenant**. In that constantly-shifting fleet, services needed a way to find each other — **service discovery**. Then we needed to get new code in safely, so **CI/CD**. For some workloads we skipped servers entirely with **serverless**. And finally, we defined the whole thing in code so it's reproducible — **Infrastructure as Code**.
>
> Every single one of those existed because the previous setup left a gap. That's how real infrastructure is built — not designed all at once, but grown, one problem at a time."

> ❓ **Final question to leave them with:** "Think about the system you work on. Which of these eleven does it have — and which gap is it living with right now?"
>
> Let two or three people answer out loud. It turns everything abstract into something they'll notice on Monday.

### The one thing to remember

Each layer owns one problem. Traffic in (LB, gateway, proxy, NGINX). Running the apps (Docker, K8s). Talking between them (mesh, discovery). Scale and geography (multi-region). Shipping changes (CI/CD). Skipping servers (serverless). Managing it all as code (IaC). When you know which layer owns which problem, you stop reaching for a service mesh to fix a deployment problem, or a bigger server to fix a routing problem.
