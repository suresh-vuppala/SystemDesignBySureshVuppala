# AI Systems — Course Hierarchy

A standalone course, split out from System Design. Same naming rule: module name plain
and short, lesson names short phrases, sub-lessons crisp — and every named technique,
algorithm, or failure mode gets its own line rather than being folded into a summary
phrase.

**Prerequisite:** this course assumes you've already done the System Design course —
it reuses caching, queues, gateways, rate limiting, and observability concepts and
applies them to LLM-specific problems rather than re-teaching them.

Source: `system-design-cheatsheet/14-ai-systems.html`. Every lesson maps 1:1 to a real
section `id` on that page. Company/product names used only as usage examples (OpenAI,
ChatGPT, GitHub Copilot, etc.) are excluded per the same rule as the System Design
course — they illustrate a concept, they aren't one.

---

## Full Tree

```
AI Systems
│
├── 1. LLM Serving & Inference  (#llm-serving)
│   ├── KV-Cache Management (PagedAttention)
│   ├── Continuous Batching
│   ├── Speculative Decoding (Medusa, SpecInfer)
│   ├── Tensor Parallelism
│   ├── Pipeline Parallelism
│   ├── INT8 Quantization
│   ├── INT4 Quantization (GPTQ/AWQ)
│   └── Flash Attention
│
├── 2. RAG (Retrieval-Augmented Generation)  (#rag)
│   ├── Chunking Strategies
│   │   ├── Fixed-Size Chunking
│   │   ├── Semantic Chunking
│   │   ├── Recursive Chunking
│   │   └── Sentence-Based Chunking
│   ├── Retrieval Methods
│   │   ├── Dense Retrieval
│   │   ├── Sparse Retrieval (BM25/TF-IDF)
│   │   └── Hybrid Retrieval (Reciprocal Rank Fusion)
│   ├── Reranking — Bi-Encoder vs Cross-Encoder
│   └── Common Pitfalls — Chunk Too Small, Chunk Too Large, Wrong Embedding Model, No Reranking, Stale Index
│
├── 3. Embeddings & Vector Search  (#embeddings)
│   ├── Batch vs Real-Time Embedding Generation
│   ├── ANN Algorithms
│   │   ├── HNSW (Hierarchical Navigable Small World)
│   │   ├── IVF (Inverted File Index)
│   │   ├── ScaNN
│   │   └── DiskANN
│   └── Tradeoffs — Recall vs Latency, Memory vs Accuracy (Product Quantization), Build Time vs Search Quality
│
├── 4. AI Gateway & LLM Routing  (#ai-gateway)
│   ├── Routing Strategies
│   │   ├── Complexity-Based Routing
│   │   ├── Cost-Based Routing
│   │   ├── Latency-Based Routing
│   │   └── Capability-Based Routing
│   ├── Semantic Caching
│   └── Cost Control — Prompt Compression (LLMLingua)
│
├── 5. Agent Systems  (#agents)
│   ├── Agent Patterns
│   │   ├── Single Agent
│   │   ├── Multi-Agent (Supervisor)
│   │   ├── Hierarchical Agents
│   │   └── Debate/Consensus
│   ├── Memory Systems
│   │   ├── Conversation Buffer Memory
│   │   ├── Summary Memory
│   │   ├── Vector Memory
│   │   └── Entity Memory
│   ├── Tool Calling
│   └── Pitfalls — Infinite Loops, Tool Misuse, Context Overflow, Hallucinated Actions, Cost Explosion
│
├── 6. Feature Stores  (#feature-stores)
│   ├── Offline Features (Batch-Computed)
│   ├── Online Features (Real-Time, <10ms p99)
│   ├── Point-in-Time Correctness
│   ├── Feature Freshness
│   └── Training-Serving Skew
│
├── 7. Distributed Training  (#ml-training)
│   ├── Parallelism Strategies
│   │   ├── Data Parallelism
│   │   ├── Model/Tensor Parallelism
│   │   ├── Pipeline Parallelism
│   │   └── Expert Parallelism (MoE)
│   ├── Memory Optimization
│   │   ├── Gradient Accumulation
│   │   ├── Activation Checkpointing
│   │   ├── ZeRO (DeepSpeed, Stages 1-3)
│   │   └── Mixed Precision (FP16/BF16)
│   └── Fault Tolerance — Periodic Checkpointing, Elastic Training, Redundant Computation, Fast Recovery
│
└── 8. Guardrails & AI Safety  (#guardrails)
    ├── Input Validation
    │   ├── Prompt Injection Detection
    │   ├── PII Filtering
    │   ├── Topic Restriction
    │   └── Token Limits
    ├── Output Validation
    │   ├── Toxicity Scoring
    │   ├── Hallucination Detection
    │   ├── Format Enforcement
    │   └── Factual Grounding
    ├── Advanced Patterns
    │   ├── Constitutional AI
    │   ├── Red-Teaming
    │   ├── Canary Tokens
    │   ├── Output Diversity Detection
    │   └── Confidence Scoring
    └── Pitfalls — Over-Filtering, Latency Overhead, Evolving Attacks, Multilingual Gaps, Context-Dependent Safety
```

---

## What Changed in This Pass

Same fix as the System Design course: every named technique that was previously
squeezed into one summary line (e.g. "Routing Strategies — Complexity/Cost/Latency/
Capability-Based") is now its own line under that lesson. This affected every one of
the 8 lessons — the worst offenders were Feature Stores (previously 1 collapsed line
for 5 named concepts) and the "Pitfalls" callouts, which existed in every lesson but
weren't represented in the tree at all despite each naming 4-5 specific failure modes.

Also added: RAG's, Agent Systems', and Guardrails' "Pitfalls" sections (previously
absent entirely), and Guardrails' Advanced Patterns gained its two dropped items
(Output Diversity Detection, Confidence Scoring).

Real-world tool/vendor lists (LiteLLM, Portkey, LangChain, Feast, Tecton, etc.) that
exist in the source as "Real-World:" callouts were intentionally left out, matching the
company-name exclusion rule — they're implementation examples, not concepts to learn.

---

## Coverage Count

8 lessons, 60+ sub-lessons (up from ~20 in the prior pass — same source content, fully
un-collapsed).
