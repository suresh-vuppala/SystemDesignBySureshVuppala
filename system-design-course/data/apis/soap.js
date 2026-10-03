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
      goal: "Read a real WSDL contract, then hand-write a SOAP XML envelope and call the operation, feeling how verbose it is versus REST JSON.",
      stack: "<code>curl</code> against a free public SOAP demo (the dneonline calculator). Local and free, only a network connection needed.",
      steps: [
        {
          title: "Fetch the WSDL and read its typed contract",
          body: "The WSDL declares operations and their exact parameter types up front, stricter than an OpenAPI JSON spec.",
          code: "curl -s \"http://www.dneonline.com/calculator.asmx?WSDL\" | head -60",
          lang: "bash"
        },
        {
          title: "Write the SOAP envelope from the documented example",
          body: "Every call is wrapped in an <code>Envelope</code> and a <code>Body</code>. Save it as <code>add.xml</code>.",
          code: "cat > add.xml <<'EOF'\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Body>\n    <Add xmlns=\"http://tempuri.org/\">\n      <intA>5</intA>\n      <intB>7</intB>\n    </Add>\n  </soap:Body>\n</soap:Envelope>\nEOF",
          lang: "bash"
        },
        {
          title: "POST the envelope with the SOAPAction header",
          body: "SOAP needs the operation named in a <code>SOAPAction</code> header and the content type set to <code>text/xml</code>.",
          code: "curl -s -X POST \"http://www.dneonline.com/calculator.asmx\" \\\n  -H \"Content-Type: text/xml; charset=utf-8\" \\\n  -H \"SOAPAction: http://tempuri.org/Add\" \\\n  --data @add.xml",
          lang: "bash"
        },
        {
          title: "Compare the payload weight against JSON",
          body: "Measure the envelope size next to the two numbers an equivalent REST call would send.",
          code: "wc -c add.xml\necho -n '{\"intA\":5,\"intB\":7}' | wc -c",
          lang: "bash"
        }
      ],
      observe: "The response comes back as another XML <code>Envelope</code> wrapping <code>&lt;AddResult&gt;12&lt;/AddResult&gt;</code>, and the response must match the WSDL's declared types exactly. Your <code>wc -c</code> numbers show the SOAP request is many times larger than the tiny JSON body: the verbosity trade-off, felt directly.",
      stretch: "Send a malformed body (drop <code>intB</code>) and watch SOAP return a structured <code>&lt;soap:Fault&gt;</code> element rather than a plain HTTP 400: fault handling is part of the contract."
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
