/* === Lesson soap - part of Module 3 (APIs & Communication) ===
   Source: system-design-cheatsheet/04-apis.html (#soap)
   + system-design-cheatsheet-course-hierarchy.md, Module 3.7.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["soap"] = {
  module: 3, num: "3.7", title: "SOAP",
  connectsFrom: "REST won the popularity contest, but SOAP is what came before it, and you will still meet it integrating with banking, government, or legacy ERP systems where its rigor is required by policy, not preference.",
  tabs: {
    overview: {
      heading: "SOAP",
      intro: "<strong>XML over HTTP</strong> with a strict, machine-readable contract (<strong>WSDL</strong>). SOAP is actually transport-agnostic (it can run over HTTP, SMTP, or JMS, not just HTTP) and can be stateful via WS-ReliableMessaging, unlike REST's stateless default. The XML envelope carries a header (auth, routing, WS-Security) and a body (operation plus parameters).",
      table: {
        headers: ["Aspect", "SOAP"],
        rows: [
          ["Format", "XML envelope (header + body)"],
          ["Contract", "<strong>WSDL</strong>: strict, machine-readable"],
          ["Security", "WS-Security (signed/encrypted parts)"],
          ["Transport", "HTTP, SMTP, JMS (transport-agnostic)"],
          ["State", "Can be stateful (WS-ReliableMessaging)"],
          ["Use today", "Banking, telco, government, legacy ERP"]
        ]
      },
      callouts: [
        { color: "yellow", label: "When SOAP still wins:", body: "<strong>Banking and finance</strong> (WS-Security for signed transactions), <strong>Government</strong> (strict contracts, audit trails), and <strong>Legacy integration</strong> (SAP, Oracle ERP). If you are building new, use REST or gRPC. If you are integrating with enterprise, expect SOAP." },
        { color: "purple", label: "Why it is heavier than REST:", body: "XML parsing, a verbose envelope, mandatory schemas, and stateful sessions all add weight: payloads can be 10 to 100 times larger than an equivalent REST/JSON call." }
      ]
    },
    tradeoffs: {
      heading: "SOAP vs REST",
      points: [
        { label: "SOAP", body: "Strict XML envelope, a WSDL contract for generated clients, transport-agnostic, message-level WS-Security, and optional statefulness. Verbose on the wire." },
        { label: "REST (comparison)", body: "HTTP methods, an optional and human-friendly OpenAPI contract, HTTP-only transport, transport-level TLS plus OAuth2, stateless by design, and lightweight JSON." },
        { label: "The trade", body: "SOAP buys formal rigor and built-in security standards at the cost of size and ceremony. REST buys simplicity and reach." }
      ]
    },
    handsOn: {
      prerequisites: "`curl` or SoapUI (free).",
      setup: "Local and free only. Most public SOAP demo services (for example a public currency-conversion or weather WSDL demo endpoint) work without signup.",
      simulate: "Fetch a public WSDL file with `curl &lt;wsdl-url&gt;?wsdl` and read its structure; note the strict typed contract compared to an OpenAPI JSON spec. Then send a raw SOAP XML envelope via `curl -X POST -H \u201cContent-Type: text/xml\u201d` with the request body from the WSDL's documented example.",
      observe: "How much more verbose the XML envelope is versus an equivalent REST JSON call, and how strictly the response has to match the WSDL's declared types: a direct, felt comparison instead of an abstract trade-off claim.",
      stretch: "None. This lesson's value is the contrast with REST, not depth."
    }
  },
  keyTakeaways: [
    "SOAP is <strong>XML over HTTP</strong> (and SMTP or JMS) with a strict <strong>WSDL</strong> contract and message-level WS-Security.",
    "It is heavier and more verbose than REST, with payloads that can be 10 to 100 times larger.",
    "It still wins where a formal contract and built-in security are mandated: banking, government, and legacy ERP."
  ],
  proTip: "Do not choose SOAP for a greenfield system. Learn it so you can integrate cleanly when a bank, government agency, or legacy ERP hands you a WSDL.",
  related: ["rest", "openapi", "grpc"],
  bridgeOut: "None forward: this is a self-contained reference lesson."
};
