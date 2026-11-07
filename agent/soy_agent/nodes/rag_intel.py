from soy_agent.state import AgentState
from soy_agent.tools.vector_tools import search_market_intelligence_tool

def rag_intel_node(state: AgentState) -> AgentState:
    """Retrieves contextual market reports and fundamental intelligence from Qdrant."""
    trace = state.get("trace", [])
    query = state.get("query", "soybean crush margin basis")
    trace.append("[RAGIntelNode] Querying Qdrant vector store for commodity intelligence...")

    docs = search_market_intelligence_tool.invoke({"query": query, "limit": 3})
    state["retrieved_intel"] = docs
    trace.append(f"[RAGIntelNode] Retrieved {len(docs)} documents (Top match: {docs[0]['title'] if docs else 'None'})")

    state["trace"] = trace
    return state

