import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Locate potential .env paths (agent directory, root directory, or current working directory)
current_dir = Path(__file__).resolve().parent
agent_env = current_dir.parent / ".env"
root_env = current_dir.parent.parent / ".env"

env_candidates = [str(agent_env), str(root_env), ".env"]


class AgentSettings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "gemini")
    DEFAULT_MODEL_NAME: str = os.getenv("DEFAULT_MODEL_NAME", "gemini-2.5-flash")

    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "soy_market_intelligence")

    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")

    model_config = SettingsConfigDict(
        env_file=tuple(env_candidates),
        env_file_encoding="utf-8",
        extra="ignore"
    )


agent_settings = AgentSettings()
