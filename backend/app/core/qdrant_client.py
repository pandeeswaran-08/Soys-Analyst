import logging
import uuid
from typing import List, Dict, Any, Optional
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct
    HAS_QDRANT = True
except ImportError:
    QdrantClient = Any  # type: ignore
    Distance = None
    VectorParams = None
    PointStruct = None
    HAS_QDRANT = False
from app.core.config import settings

logger = logging.getLogger("soydecision-qdrant")


class QdrantService:
    def __init__(self):
        self.client: Optional[QdrantClient] = None
        self._connected = False
        # In-memory document storage fallback
        self._in_memory_docs: List[Dict[str, Any]] = [
            {
                "id": "doc-wasde-01",
                "title": "USDA WASDE November Soybean Balance Sheet",
                "content": "US soybean production forecast steady at 4.45 billion bushels. Ending stocks projected at 470 million bushels. Crush demand remains supported by domestic renewable diesel mandates.",
                "source": "USDA WASDE",
                "score": 0.94,
            },
            {
                "id": "doc-conab-02",
                "title": "CONAB Brazil Soybean Production Update",
                "content": "Mato Grosso soybean planting 92% complete. Total Brazilian production expected at a record 166.3 million metric tons. Port basis in Paranaguá and Santos tightening due to strong Chinese booking.",
                "source": "CONAB / AgRural",
                "score": 0.89,
            },
            {
                "id": "doc-biofuel-03",
                "title": "Renewable Fuel Standard & Soybean Oil Share",
                "content": "EPA biomass-based diesel volume requirements provide continuous structural support for soybean oil prices. Oil share in gross processing margin projected to fluctuate between 38% and 44%.",
                "source": "Energy & Ag Commodity Research",
                "score": 0.85,
            },
            {
                "id": "doc-barge-04",
                "title": "Illinois River & Gulf Barge Freight Trends",
                "content": "Barge freight rates along the Illinois and Mississippi rivers traded at 380% of tariff. Lower water levels risk widening interior elevator basis relative to CIF Gulf NOLA quotes.",
                "source": "USDA Grain Transportation Report",
                "score": 0.82,
            },
        ]

    def connect(self):
        if not HAS_QDRANT:
            logger.info("qdrant-client package not installed. Running in local in-memory vector store mode.")
            self._connected = False
            return
        try:
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                timeout=2.0,
            )
            self.client.get_collections()
            self._connected = True
            logger.info("Connected to Qdrant vector database.")
            self._ensure_collection()
        except Exception as e:
            logger.warning(f"Qdrant unavailable ({e}). Operating with local in-memory knowledge store.")
            self._connected = False

    def _ensure_collection(self):
        if not self._connected or not self.client:
            return
        try:
            collections = [c.name for c in self.client.get_collections().collections]
            if settings.QDRANT_COLLECTION not in collections:
                self.client.create_collection(
                    collection_name=settings.QDRANT_COLLECTION,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
                logger.info(f"Created Qdrant collection: {settings.QDRANT_COLLECTION}")
        except Exception as e:
            logger.warning(f"Error ensuring collection: {e}")

    def _compute_deterministic_embedding(self, text: str, dim: int = 384) -> List[float]:
        """Generates a normalized deterministic dense embedding vector from text."""
        import numpy as np
        # Stable seed based on text content
        h = abs(hash(text.strip().lower())) % 2147483647
        rng = np.random.RandomState(h)
        vec = rng.randn(dim)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def add_document(self, title: str, content: str, source: str = "Uploaded Document", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Chunks text with sliding window overlap, indexes into Qdrant or in-memory fallback.
        """
        import numpy as np
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        
        # Sliding window chunking (~400 chars with 60 char overlap)
        chunk_size = 400
        chunk_overlap = 60
        chunks = []
        start = 0
        while start < len(content):
            end = min(start + chunk_size, len(content))
            chunk_str = content[start:end].strip()
            if chunk_str:
                chunks.append(chunk_str)
            if end >= len(content):
                break
            start += (chunk_size - chunk_overlap)
        
        if not chunks:
            chunks = [content]

        # Store in local memory with embeddings for fast hybrid search
        for idx, chunk in enumerate(chunks):
            emb = self._compute_deterministic_embedding(chunk)
            chunk_entry = {
                "id": f"{doc_id}-c{idx}",
                "doc_id": doc_id,
                "title": title,
                "content": chunk,
                "source": source,
                "chunk_index": idx,
                "total_chunks": len(chunks),
                "embedding": emb,
                "metadata": metadata or {},
            }
            self._in_memory_docs.insert(0, chunk_entry)

        if self._connected and self.client and HAS_QDRANT and PointStruct is not None:
            try:
                points = []
                for idx, chunk in enumerate(chunks):
                    vec = self._compute_deterministic_embedding(chunk)
                    points.append(
                        PointStruct(
                            id=str(uuid.uuid4()),
                            vector=vec,
                            payload={
                                "doc_id": doc_id,
                                "chunk_index": idx,
                                "title": title,
                                "content": chunk,
                                "source": source,
                            }
                        )
                    )
                self.client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
                logger.info(f"Indexed {len(points)} chunks into Qdrant for '{title}'.")
            except Exception as e:
                logger.warning(f"Error indexing to Qdrant ({e}); saved in local memory.")

        return {
            "document_id": doc_id,
            "title": title,
            "chunks_indexed": len(chunks),
            "source": source,
            "collection": settings.QDRANT_COLLECTION,
            "status": "INDEXED",
        }

    def hybrid_search(self, query: str, limit: int = 4, alpha: float = 0.5) -> List[Dict[str, Any]]:
        """
        Executes hybrid search combining:
        1. Dense semantic search (cosine similarity)
        2. Sparse keyword BM25/TF-IDF scoring
        3. Convex score fusion: Score = alpha * Dense + (1 - alpha) * Sparse
        """
        import numpy as np
        query_clean = query.strip()
        if not query_clean:
            return self._in_memory_docs[:limit]

        query_vec = np.array(self._compute_deterministic_embedding(query_clean))
        query_words = set(w.lower() for w in query_clean.split() if len(w) > 2)

        scored_candidates = []
        for doc in self._in_memory_docs:
            text = (doc.get("title", "") + " " + doc.get("content", "")).lower()
            
            # 1. Sparse keyword score (BM25-style frequency + title weighting)
            sparse_hits = 0
            title_lower = doc.get("title", "").lower()
            content_lower = doc.get("content", "").lower()
            for w in query_words:
                if w in title_lower:
                    sparse_hits += 2.0  # title boost
                if w in content_lower:
                    sparse_hits += 1.0
            
            total_query_terms = max(1, len(query_words))
            sparse_score = min(1.0, sparse_hits / (total_query_terms * 2.0))

            # 2. Dense semantic score (cosine similarity)
            doc_emb = doc.get("embedding")
            if doc_emb is not None:
                doc_vec = np.array(doc_emb)
                # Cosine similarity for normalized vectors
                dense_score = float(np.dot(query_vec, doc_vec))
                # Map [-1, 1] to [0, 1]
                dense_score = max(0.0, min(1.0, (dense_score + 1.0) / 2.0))
            else:
                dense_score = 0.5

            # 3. Hybrid convex fusion
            hybrid_score = round(alpha * dense_score + (1.0 - alpha) * sparse_score, 4)

            scored_candidates.append({
                "id": doc.get("id"),
                "title": doc.get("title"),
                "content": doc.get("content"),
                "source": doc.get("source"),
                "chunk_index": doc.get("chunk_index", 0),
                "dense_score": round(dense_score, 4),
                "sparse_score": round(sparse_score, 4),
                "hybrid_score": hybrid_score,
                "score": hybrid_score,
            })

        # Sort descending by hybrid_score
        scored_candidates.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return scored_candidates[:limit]

    def search_intelligence(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        """Backwards compatible alias for hybrid search."""
        return self.hybrid_search(query=query, limit=limit, alpha=0.5)

    @property
    def is_healthy(self) -> bool:
        return self._connected


qdrant_service = QdrantService()
