import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from langchain_core.tools import tool

# Ensure backend root is on sys.path
backend_path = Path(__file__).resolve().parents[3] / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.qdrant_client import qdrant_service


@tool
def qdrant_hybrid_search_tool(query: str, limit: int = 4, alpha: float = 0.5) -> List[Dict[str, Any]]:
    """
    Executes hybrid RAG search against Qdrant vector database.
    Combines dense semantic vector search (cosine similarity) and sparse keyword search (BM25 token matching)
    across USDA WASDE reports, CONAB Brazilian crop updates, freight rates, and market policy documents.
    Args:
        query: Search query for market intelligence or commodity fundamentals.
        limit: Maximum number of chunks to return (default 4).
        alpha: Weight for dense search vs sparse search (0.0=pure sparse, 1.0=pure dense, default 0.5).
    Returns:
        List of chunks with id, title, content, source, dense_score, sparse_score, and hybrid_score.
    """
    return qdrant_service.hybrid_search(query=query, limit=limit, alpha=alpha)


@tool
def search_market_intelligence_tool(query: str, limit: int = 4) -> List[Dict[str, Any]]:
    """
    Retrieves USDA WASDE reports, South American harvest progress, barge tariff rates,
    and biofuel policy intelligence using Qdrant hybrid search.
    """
    return qdrant_service.hybrid_search(query=query, limit=limit, alpha=0.5)


__all__ = ["qdrant_hybrid_search_tool", "search_market_intelligence_tool"]

