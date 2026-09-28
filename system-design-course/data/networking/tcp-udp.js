/* === Lesson tcp-udp - part of Module 2 (Networking) ===
   Source: system-design-cheatsheet/02-networking.html (#tcp-udp)
   + system-design-cheatsheet-course-hierarchy.md, Module 2.3.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["tcp-udp"] = {
  module: 2, num: "2.3", title: "TCP vs UDP",
  connectsFrom: "Layer 4 is the transport layer, and it offers exactly two choices. A bank transfer cannot tolerate a single lost byte; a dropped video frame is forgotten in milliseconds. That difference is the whole TCP-vs-UDP decision.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "comparison", label: "Side by Side", icon: "scale" },
    { key: "insideTcp", label: "Inside TCP", icon: "loop" },
    { key: "insideUdp", label: "Inside UDP", icon: "cpu" },
    { key: "headers", label: "Headers", icon: "hex" },
    { key: "realWorld", label: "Real-World & QUIC", icon: "globe" },
    { key: "tradeoffs", label: "When to Use", icon: "swap" }
  ],
  tabs: {
    overview: {
      heading: "Reliability vs Speed",
      intro: "Both are Layer 4 transport protocols, but they trade the same axis in opposite directions: <strong>TCP</strong> guarantees delivery at the cost of latency, <strong>UDP</strong> guarantees nothing and is blazing fast. Almost every protocol above them inherits one of these two personalities. TCP is a reliable, ordered <strong>byte stream</strong>; UDP is a fire-and-forget <strong>datagram</strong>.",
      cards: [
        { icon: "T", title: "TCP", color: "blue", body: "<strong>Connection-oriented, reliable, ordered.</strong> Handshake, sequence numbers, ACKs, retransmission, flow and congestion control. Slower, ~20-60 byte header." },
        { icon: "U", title: "UDP", color: "green", body: "<strong>Connectionless, best-effort.</strong> No handshake, no ordering, no retransmission. Fast, minimal 8-byte header. Reliability, if needed, is the app's job." },
        { icon: "Q", title: "QUIC", color: "purple", body: "Built <strong>on UDP</strong> but rebuilds TCP-style reliability plus TLS 1.3 in user space. Powers HTTP/3. Speed of UDP, guarantees of TCP, without head-of-line blocking." }
      ],
      callouts: [
        { color: "green", label: "What each one guarantees:", body: "<strong>TCP</strong> gives ordered, reliable, duplicate-free delivery via sequence numbers, ACKs, and retransmission. <strong>UDP</strong> guarantees nothing at all, no ordering, no delivery, no dedup, and that is exactly why it is fast." },
        { color: "blue", label: "Cast types (UDP-only beyond unicast):", body: "<strong>Unicast</strong> (one to one, the default for TCP and most UDP). <strong>Broadcast</strong> (one to every host on the subnet, UDP-only, e.g. ARP, DHCP discovery). <strong>Multicast</strong> (one to a subscribed group, UDP-only, e.g. streaming, service discovery). TCP is strictly unicast." }
      ]
    },
    comparison: {
      heading: "TCP vs UDP, Side by Side",
      intro: "The same axis, opposite ends. Every row is a guarantee TCP adds and pays for, or a cost UDP refuses to pay.",
      table: {
        headers: ["Dimension", "TCP", "UDP"],
        rows: [
          ["<strong>Connection</strong>", "Connection-oriented (3-way handshake first)", "Connectionless (send immediately)"],
          ["<strong>Reliability</strong>", "Guaranteed: retransmits lost data", "Best-effort: no retransmission"],
          ["<strong>Ordering</strong>", "In-order via sequence numbers", "No ordering guarantee"],
          ["<strong>Error handling</strong>", "Checksum + recovery (resend)", "Checksum only, corrupt packets dropped"],
          ["<strong>Flow control</strong>", "Yes (receiver's sliding window)", "None"],
          ["<strong>Congestion control</strong>", "Yes (slow start, AIMD, CUBIC/BBR)", "None (app must handle)"],
          ["<strong>Data model</strong>", "Byte stream (no message boundaries)", "Datagrams (preserves message boundaries)"],
          ["<strong>Header size</strong>", "20-60 bytes", "8 bytes (fixed)"],
          ["<strong>Speed / overhead</strong>", "Slower, more overhead", "Fast, minimal overhead"],
          ["<strong>Cast</strong>", "Unicast only", "Unicast, broadcast, multicast"],
          ["<strong>Typical use</strong>", "Web, DB, file transfer, email", "DNS, streaming, VoIP, gaming, QUIC"]
        ]
      }
    },
    insideTcp: {
      heading: "How TCP Delivers Reliably",
      intro: "Everything TCP does is in service of one promise: the bytes arrive, exactly once, in order. Here is the machinery, and the one problem it cannot escape.",
      points: [
        { label: "Connection setup: the 3-way handshake", body: "<strong>SYN \u2192 SYN-ACK \u2192 ACK</strong>. The client sends SYN with an initial sequence number, the server replies SYN-ACK with its own, the client ACKs. Both sides now agree on starting sequence numbers before any data flows. This is the latency cost UDP skips." },
        { label: "Connection teardown: the 4-way close", body: "Each side sends a <strong>FIN</strong> and gets an <strong>ACK</strong> (FIN, ACK, FIN, ACK), since either direction can close independently. The initiator then waits in <strong>TIME_WAIT</strong> (~2\u00d7 max segment lifetime) so late-arriving packets do not corrupt a new connection on the same port." },
        { label: "Sequence numbers and ACKs", body: "Every byte has a <strong>sequence number</strong>; the receiver returns <strong>cumulative ACKs</strong> for the highest contiguous byte received. <strong>Selective ACK (SACK)</strong> lets the receiver acknowledge out-of-order blocks so the sender resends only the true gaps." },
        { label: "Retransmission", body: "Lost data is resent two ways: a <strong>retransmission timeout (RTO)</strong> when no ACK arrives in time, and <strong>fast retransmit</strong> when the sender sees <strong>3 duplicate ACKs</strong> (a strong hint one segment was dropped) and resends without waiting for the timer." },
        { label: "Flow control (do not overwhelm the receiver)", body: "The receiver advertises a <strong>window</strong> (rwnd): how many more bytes it can buffer right now. The sender never has more than that unacknowledged in flight. This is the <strong>sliding window</strong>." },
        { label: "Congestion control (do not overwhelm the network)", body: "A separate <strong>congestion window (cwnd)</strong> grows with <strong>slow start</strong> (exponential) until loss, then switches to <strong>congestion avoidance</strong> (linear, AIMD: additive increase, multiplicative decrease). Modern stacks use <strong>CUBIC</strong> (Linux default) or <strong>BBR</strong> (Google). The sender is limited by <code>min(rwnd, cwnd)</code>." },
        { label: "Head-of-line (HOL) blocking", body: "Because TCP delivers strictly in order, a single lost segment <strong>stalls every later segment</strong> from reaching the app until the gap is retransmitted, even if the rest arrived fine. This is the exact limitation QUIC/HTTP-3 was designed to remove." }
      ]
    },
    insideUdp: {
      heading: "How UDP Works, and What It Skips",
      intro: "UDP is deliberately minimal: a thin wrapper that adds ports and a checksum on top of IP, then gets out of the way. Understanding it is mostly understanding what it does <em>not</em> do, and how applications add back only the guarantees they actually need.",
      points: [
        { label: "Datagram model with message boundaries", body: "Each <code>send()</code> becomes exactly one self-contained <strong>datagram</strong>: one <code>sendto</code> maps to one <code>recvfrom</code>, and the receiver gets the whole message or nothing. Unlike TCP's boundary-less byte stream, UDP <strong>preserves message framing</strong> for free." },
        { label: "Connectionless and stateless", body: "No handshake and no per-connection state on the server, so a single socket can serve huge numbers of clients cheaply. That statelessness is why DNS resolvers and NTP servers answer millions of one-shot requests over UDP." },
        { label: "No reliability, ordering, or dedup", body: "Datagrams can be <strong>lost, duplicated, or reordered</strong>, and UDP will not notice or fix any of it. If the application cares, it must detect and handle these itself." },
        { label: "Checksum only (no repair)", body: "A 16-bit checksum over the header, data, and an IP pseudo-header lets the receiver detect corruption. A corrupt datagram is <strong>silently dropped</strong>, never repaired. The checksum is optional in IPv4 (0 = disabled) and mandatory in IPv6." },
        { label: "No flow or congestion control", body: "UDP sends as fast as the app pushes. There is no window and no backoff, so a naive UDP sender can overwhelm a slow receiver or congest the network. Responsible UDP apps (and QUIC) implement their own pacing and congestion control." },
        { label: "Fragmentation and MTU", body: "A datagram larger than the path MTU is IP-fragmented, and losing a single fragment loses the <strong>entire</strong> datagram. Keeping payloads under ~1200 bytes avoids fragmentation, which is exactly why QUIC caps its packet size." },
        { label: "Reliability is built on top, selectively", body: "Apps add back only what they need: <strong>DNS</strong> retries on timeout, <strong>RTP</strong> adds sequence numbers and timestamps for media, game netcode does eventual/selective reliability, and <strong>QUIC</strong> rebuilds full per-stream reliability, ordering, and congestion control in user space." }
      ],
      callouts: [
        { color: "yellow", label: "Security: spoofing and amplification", body: "Because UDP is connectionless, the source address is easy to <strong>spoof</strong> (no handshake proves who sent it). Attackers exploit this for <strong>amplification/reflection DDoS</strong> (DNS, NTP, and memcached reflection turn a small spoofed request into a huge response aimed at a victim). Mitigations: response rate limiting, ingress filtering (BCP 38), and address validation (QUIC's Retry)." },
        { color: "green", label: "Where UDP shines:", body: "Stateless request/response (DNS), real-time media where stale data is worthless (VoIP, video, gaming), one-to-many delivery (broadcast, multicast), and as a flexible <strong>substrate for custom transports</strong> like QUIC." }
      ]
    },
    headers: {
      heading: "Segment and Datagram Structure",
      intro: "The header sizes tell the whole story: TCP carries 20+ bytes of control state per segment; UDP carries 8. Fewer fields means less to compute and less to send.",
      table: {
        headers: ["TCP Header Field", "Size", "Purpose"],
        rows: [
          ["<strong>Source / Dest Port</strong>", "16 bits each", "Which application endpoints are talking"],
          ["<strong>Sequence Number</strong>", "32 bits", "Byte offset of this segment in the stream"],
          ["<strong>Acknowledgment Number</strong>", "32 bits", "Next byte the sender expects (cumulative ACK)"],
          ["<strong>Data Offset</strong>", "4 bits", "Header length (so 20 to 60 bytes total)"],
          ["<strong>Flags</strong>", "9 bits", "SYN, ACK, FIN, RST, PSH, URG (+ ECE, CWR, NS)"],
          ["<strong>Window Size</strong>", "16 bits", "Flow control: bytes the receiver can still accept"],
          ["<strong>Checksum</strong>", "16 bits", "Error detection over header + data"],
          ["<strong>Urgent Pointer</strong>", "16 bits", "Marks urgent data (rarely used)"],
          ["<strong>Options</strong>", "0 to 40 bytes", "MSS, window scaling, SACK, timestamps"]
        ]
      },
      tables: [
        {
          headers: ["UDP Header Field", "Size", "Purpose"],
          rows: [
            ["<strong>Source Port</strong>", "16 bits", "Sender's port (optional, can be 0)"],
            ["<strong>Destination Port</strong>", "16 bits", "Receiver's port"],
            ["<strong>Length</strong>", "16 bits", "Header + data length in bytes"],
            ["<strong>Checksum</strong>", "16 bits", "Optional in IPv4, mandatory in IPv6"]
          ]
        }
      ],
      callouts: [
        { color: "blue", label: "Why the size gap matters:", body: "TCP's <strong>20-60 byte</strong> header plus its per-connection state (sequence numbers, windows, timers) is the price of reliability. UDP's <strong>fixed 8 bytes</strong> and zero connection state are why it wins on latency and on packets-per-second for tiny messages like DNS queries or game position updates." }
      ]
    },
    realWorld: {
      heading: "Where Each One Shows Up, and QUIC",
      points: [
        { label: "TCP wherever reliability matters", body: "Web (:80, :443), MySQL (:3306), Postgres (:5432), Redis (:6379), Kafka (:9092), SSH (:22), SMTP (:25). If losing a byte corrupts the result, it is TCP." },
        { label: "UDP where speed beats completeness", body: "DNS (:53), NTP (:123), DHCP, SNMP, and QUIC/HTTP-3 (:443 over UDP). Small, fast, retry-at-the-app-layer if needed." },
        { label: "Real-time games and media", body: "Fortnite and Valorant send position updates over <strong>UDP</strong>: a 20ms-old position is useless, so there is no point retransmitting it. VoIP and live video are the same, drop the stale packet, send the next." },
        { label: "QUIC / HTTP-3: the best of both", body: "Built on UDP but adds its own reliability, ordering per stream, and TLS 1.3, powering Chrome, YouTube, and Cloudflare. Crucially it removes TCP's <strong>head-of-line blocking</strong>: independent streams do not stall each other, and it supports <strong>connection migration</strong> (survive a Wi-Fi to cellular switch)." }
      ],
      callouts: [
        { color: "green", label: "Why QUIC had to use UDP:", body: "TCP is baked into operating-system kernels and middleboxes, so evolving it is glacially slow. Building on UDP let Google ship a new, faster transport entirely in <strong>user space</strong> and iterate without waiting for every OS to update." }
      ]
    },
    tradeoffs: {
      heading: "Choosing Between Them",
      intro: "One question decides it: can this data tolerate loss? Everything else follows.",
      points: [
        { label: "Choose TCP", body: "When correctness is non-negotiable: payments, database writes, file transfer, messaging, email. You accept handshake and retransmission latency to never lose or reorder data." },
        { label: "Choose UDP", body: "When latency beats completeness: live video, voice, gaming, telemetry, DNS. A late packet is worthless, so dropping it is cheaper than waiting for a resend." },
        { label: "Choose QUIC/HTTP-3", body: "When you want UDP's speed and evolvability but still need reliability and encryption, and want to avoid TCP's head-of-line blocking, for example a modern web or API stack serving many multiplexed requests." }
      ]
    },
    handsOn: {
      prerequisites: "Python 3 installed (`python --version`).",
      setup: "Create two files. This lets you feel connection-oriented vs connectionless directly.",
      simulate: "Write a tiny TCP echo server with `socket.socket(socket.AF_INET, socket.SOCK_STREAM)` (note SOCK_STREAM) that must `listen()` and `accept()` a connection before it can `recv()`. Then write a UDP version with `socket.SOCK_DGRAM` that skips accept entirely and just `recvfrom()` immediately. Send a message to each.",
      observe: "The TCP client must `connect()` first, and if the server is not up you get \u201cconnection refused.\u201d The UDP client just fires a datagram into the void, if nothing is listening, it silently vanishes with no error. That is connection-oriented vs connectionless made concrete.",
      stretch: "Run Wireshark while both are talking and watch the TCP conversation open with the SYN / SYN-ACK / ACK handshake and close with FIN / ACK, while the UDP traffic is just lone datagrams with no setup or teardown."
    }
  },
  keyTakeaways: [
    "TCP is <strong>connection-oriented, ordered, and reliable</strong> (handshake + sequence numbers + ACKs + retransmission + flow and congestion control); UDP is <strong>connectionless and best-effort</strong> (fire and forget, 8-byte header).",
    "TCP's guarantees cost latency and a 20-60 byte header, and bring <strong>head-of-line blocking</strong>: one lost segment stalls everything behind it.",
    "Reliability-critical protocols ride TCP (HTTP, SQL, Redis, Kafka); latency-critical ones ride UDP (DNS, NTP, gaming); <strong>QUIC/HTTP-3</strong> rebuilds reliability on UDP to get speed without giving up guarantees or suffering HOL blocking."
  ],
  proTip: "For any transport question, ask one thing: \u201ccan this data tolerate loss?\u201d If yes, UDP is on the table and you win on latency; if no, it is TCP (or QUIC) and you pay for the guarantees.",
  related: ["web-request", "osi", "http-https", "grpc", "websocket-deep", "event-loop"],
  bridgeOut: "TCP is the transport that HTTP rides on top of. Next: what HTTP actually adds, and why the S in HTTPS (that TLS handshake from step 4) is non-negotiable."
};
