/* === Lesson vector-db - part of Module 6 (Storage) ===
   Source: system-design-cheatsheet/06-storage.html (#vector-db)
   + system-design-cheatsheet-course-hierarchy.md, Module 6.10.
   Cheat-sheet content ported into the course tab structure, preserving
   the tables, callouts, and highlighted terms. */

window.COURSE_CONTENT = window.COURSE_CONTENT || {};
window.COURSE_CONTENT["vector-db"] = {
  module: 6, num: "6.10", title: "Vector Databases",
  connectsFrom: "Elasticsearch matches on exact or fuzzy text. Vector databases match on <em>meaning</em>: they store high-dimensional embeddings and find the nearest ones to a query vector, a fundamentally different similarity notion.",
  customTabs: [
    { key: "overview", label: "Overview", icon: "book" },
    { key: "ann", label: "ANN Algorithms", icon: "hex" },
    { key: "tradeoffs", label: "Trade-offs", icon: "scale" }
  ],
  tabs: {
    overview: {
      heading: "Search by Meaning",
      intro: "A vector database stores <strong>high-dimensional embeddings</strong> and returns the vectors nearest a query vector using <strong>approximate nearest-neighbor (ANN)</strong> search, not exact match. Top-K nearest neighbors come back as semantically similar items even when they share zero exact words.",
      cards: [
        { icon: "P", title: "Managed / OSS", color: "green", body: "Pinecone, Weaviate, Milvus: native ANN engines, managed or self-hosted." },
        { icon: "V", title: "pgvector", color: "blue", body: "A Postgres extension: reuse your existing database for vector search instead of adding a new one." },
        { icon: "Q", title: "Qdrant / Chroma", color: "purple", body: "Lightweight, developer-friendly vector stores, easy to run locally." },
        { icon: "H", title: "Hybrid", color: "orange", body: "OpenSearch / Elastic combine lexical (keyword) and vector search in one query." }
      ],
      callouts: [
        { color: "green", label: "Use cases:", body: "Semantic search, RAG, deduplication, recommendations, image and audio similarity." },
        { color: "blue", label: "RAG pattern:", body: "User query \u2192 embed \u2192 ANN search top-K docs \u2192 feed docs plus query to the LLM \u2192 grounded answer. The vector DB is the retrieval layer that makes LLMs factual." }
      ]
    },
    ann: {
      heading: "Approximate Nearest-Neighbor Search",
      intro: "Exact nearest-neighbor search is O(n) per query, too slow at scale. ANN algorithms trade a little recall for a large speed and memory win. Here is how the main ones compare, and how to size the memory they need.",
      table: {
        headers: ["Algorithm", "How It Works", "Speed", "Accuracy", "Memory", "Best For"],
        rows: [
          ["<strong>HNSW</strong>", "Hierarchical graph, navigate layers coarse to fine", "Very fast", "High (95%+)", "High (in-memory graph)", "Low-latency serving, &lt;1M vectors"],
          ["<strong>IVF-PQ</strong>", "Cluster vectors (IVF) + compress with Product Quantization", "Fast", "Good (90%+)", "Low (compressed)", "Billions of vectors, cost-sensitive"],
          ["<strong>Flat (brute force)</strong>", "Compare query against every vector", "Slow (O(n))", "Perfect (100%)", "Full vectors in RAM", "Small datasets (&lt;100K), ground truth"],
          ["<strong>ScaNN</strong>", "Anisotropic quantization + tree partitioning", "Very fast", "High", "Medium", "Google-scale, TensorFlow ecosystem"]
        ]
      },
      callouts: [
        { color: "yellow", label: "Embedding dimensions and memory:", body: "OpenAI text-embedding-3-small = <strong>1536 dims</strong>. Cohere = 1024. BGE/E5 = 768. Image (CLIP) = 512. Each vector = dims \u00d7 4 bytes (float32), so 1M vectors \u00d7 1536 dims = <strong>~6GB RAM</strong>. Use PQ compression for 10 to 50\u00d7 reduction." }
      ]
    },
    tradeoffs: {
      heading: "Accuracy vs Speed vs Memory",
      intro: "ANN algorithms trade recall for latency and RAM. The right choice depends on scale and budget.",
      points: [
        { label: "HNSW: fast and accurate, memory-hungry", body: "A graph-based index that is very fast with 95%+ recall, but keeps the graph in memory. Best under about 1M vectors where low latency matters most." },
        { label: "IVF-PQ: memory-efficient at billions", body: "Clusters plus compressed vectors trade a little accuracy for a large drop in memory, the choice for very large, cost-sensitive datasets." },
        { label: "Flat: exact but O(n)", body: "Brute-force comparison is perfectly accurate but scans every vector, viable only at small scale or as a ground-truth baseline." }
      ]
    },
    handsOn: {
      goal: "Embed sentences with a free local model, store them in Qdrant, and see nearest-neighbor search return semantically similar results even when they share zero exact words with the query.",
      stack: "Qdrant in Docker plus Python <code>sentence-transformers</code> (no API key). Local and free.",
      steps: [
        {
          title: "Start Qdrant",
          code: "docker run -d --name qdrant -p 6333:6333 qdrant/qdrant",
          lang: "bash"
        },
        {
          title: "Install the Python client and embedding model",
          code: "pip install qdrant-client sentence-transformers",
          lang: "bash"
        },
        {
          title: "Embed sentences and load them into Qdrant",
          body: "The model produces 384-dim vectors. Save as <code>load.py</code> and run it.",
          code: `# load.py - embed sentences and upsert into Qdrant
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

model = SentenceTransformer("all-MiniLM-L6-v2")   # 384 dims, downloads once
sentences = [
    "the cat sat on the mat",
    "a feline rested on the rug",
    "the stock market fell sharply today",
    "shares dropped in heavy trading",
    "how to bake sourdough bread",
]
vecs = model.encode(sentences)

client = QdrantClient(url="http://localhost:6333")
client.recreate_collection(
    "notes",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
)
client.upsert("notes", [
    PointStruct(id=i, vector=v.tolist(), payload={"text": s})
    for i, (s, v) in enumerate(zip(sentences, vecs))
])
print("loaded", len(sentences), "sentences")`,
          lang: "python"
        },
        {
          title: "Query by meaning and read the top matches",
          body: "The query shares no words with \u201ca feline rested on the rug\u201d yet should rank it first. Save as <code>query.py</code>.",
          code: `# query.py - nearest neighbors for a fresh sentence
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

model = SentenceTransformer("all-MiniLM-L6-v2")
client = QdrantClient(url="http://localhost:6333")

q = model.encode("a kitten lay on a carpet").tolist()
hits = client.search("notes", query_vector=q, limit=3)
for h in hits:
    print(round(h.score, 3), h.payload["text"])`,
          lang: "python"
        },
        {
          title: "Run both",
          code: "python load.py\npython query.py",
          lang: "bash"
        }
      ],
      observe: "The top results are semantically close to the query even with zero shared words (the cat/feline sentences rank above the bread one): matches on meaning, not exact text, unlike Elasticsearch's term matching.",
      stretch: "Insert 100,000 vectors (synthetic random ones are fine for timing) and compare query latency using HNSW (Qdrant's default) versus an exact brute-force search: the accuracy-for-speed trade-off ANN algorithms make, measured."
    }
  },
  keyTakeaways: [
    "Vector databases search by meaning: they store embeddings and return approximate nearest neighbors, so semantically similar items match even without shared words.",
    "ANN algorithms trade accuracy, speed, and memory: HNSW is fast and accurate but memory-hungry, IVF-PQ is compressed for billions of vectors, Flat is exact but O(n).",
    "Sizing matters: at dims \u00d7 4 bytes per vector, 1M \u00d7 1536-dim vectors is ~6GB of RAM, and vector DBs are the retrieval layer behind RAG."
  ],
  proTip: "If you already run Postgres and your vector count is modest, start with pgvector before adopting a dedicated vector database. One fewer system to operate often outweighs the extra ANN performance you may not need yet.",
  related: ["search", "db-choice", "nosql"],
  bridgeOut: "This is the storage layer the separate AI Systems course builds RAG on top of: retrieval-augmented generation is just ANN search feeding an LLM."
};
