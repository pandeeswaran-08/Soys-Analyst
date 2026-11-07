"""
LLM Configuration and Factory for SoyDecision Desk.
Initializes Gemini (2.5-Flash / 3.5-Flash-Lite), Claude 3.5 Sonnet, or GPT-4o for reasoning, planning, and strategic synthesis.
Strict constraint: LLMs are used solely for reasoning, planning, and synthesis - NEVER for calculating numbers.
"""

import os
import time
import logging
from typing import Optional, Any, List
import httpx
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.outputs import ChatResult, ChatGeneration
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage
from soy_agent.config import agent_settings

logger = logging.getLogger("soydecision-llm")

SYSTEM_GUARDRAIL_PROMPT = """You are the Senior Commodity Hedging & Quantitative Risk Strategist for SoyDecision Desk.
You analyze physical soybean processing, domestic mandi vs import landed costs, forecasting, and inventory risk.

STRICT OPERATIONAL DIRECTIVE:
1. You must NEVER compute, estimate, or hallucinate mathematical or statistical numbers.
2. Every number, percentage, currency amount, and inventory metric in your answer MUST be derived verbatim from the math_core tool outputs provided in your context.
3. Every numeric claim must cite its corresponding tool execution trace.
4. If an ungrounded number is detected, the NumericalSafetyGuard will immediately reject the output and force recalculation.
"""


class ChatGeminiRest(BaseChatModel):
    """
    Robust Gemini Chat Model using HTTPX and Google Generative Language REST API.
    Provides native LangChain BaseChatModel compliance without requiring external binary wheels.
    Features automatic retry on 503/429 and fallback model support.
    """
    api_key: str
    model: str = "gemini-2.5-flash"
    fallback_models: List[str] = ["gemini-3.5-flash-lite"]
    temperature: float = 0.1
    timeout_seconds: float = 45.0

    @property
    def _llm_type(self) -> str:
        return "gemini-rest"

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any
    ) -> ChatResult:
        system_instruction = None
        contents = []

        for m in messages:
            content_text = m.content if isinstance(m.content, str) else str(m.content)
            if isinstance(m, SystemMessage) or getattr(m, "type", "") == "system":
                system_instruction = {"parts": [{"text": content_text}]}
            elif isinstance(m, HumanMessage) or getattr(m, "type", "") == "human":
                contents.append({"role": "user", "parts": [{"text": content_text}]})
            else:
                contents.append({"role": "model", "parts": [{"text": content_text}]})

        if not contents:
            contents = [{"role": "user", "parts": [{"text": "Synthesize the recommendation according to instructions."}]}]

        payload: dict = {"contents": contents}
        if system_instruction:
            payload["system_instruction"] = system_instruction
        if self.temperature is not None:
            payload["generationConfig"] = {"temperature": self.temperature}

        models_to_try = [self.model] + [m for m in self.fallback_models if m != self.model]
        last_error = None

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            for attempt in range(2):
                try:
                    with httpx.Client(timeout=self.timeout_seconds) as client:
                        resp = client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                return ChatResult(generations=[ChatGeneration(message=AIMessage(content=text))])
                        elif resp.status_code in (429, 503):
                            time.sleep(1.0 * (attempt + 1))
                            continue
                        else:
                            last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
                            break
                except Exception as ex:
                    last_error = str(ex)
                    time.sleep(0.5)

        logger.warning(f"Gemini API request failed across models {models_to_try}: {last_error}")
        raise RuntimeError(f"Gemini API invocation failed: {last_error}")


def get_reasoning_llm(model_name: Optional[str] = None, provider: Optional[str] = None):
    """
    Returns an instance of Gemini (ChatGeminiRest), ChatAnthropic, or ChatOpenAI.
    Accepts optional model_name or provider override (e.g. from backend API).
    Falls back gracefully if API keys are not currently configured.
    """
    resolved_model = model_name or agent_settings.DEFAULT_MODEL_NAME
    resolved_provider = (provider or agent_settings.DEFAULT_LLM_PROVIDER).lower()

    if model_name:
        m_lower = model_name.lower()
        if any(g in m_lower for g in ["gemini", "flash", "google"]):
            resolved_provider = "gemini"
        elif "claude" in m_lower or "anthropic" in m_lower:
            resolved_provider = "anthropic"
        elif "gpt" in m_lower or "openai" in m_lower:
            resolved_provider = "openai"

    gemini_key = (
        agent_settings.GEMINI_API_KEY
        or agent_settings.GOOGLE_API_KEY
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
    )
    anthropic_key = agent_settings.ANTHROPIC_API_KEY or os.getenv("ANTHROPIC_API_KEY")
    openai_key = agent_settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

    # Priority 1: Gemini (Google)
    if (resolved_provider in ("gemini", "google") or not (anthropic_key or openai_key)) and gemini_key:
        try:
            target_model = resolved_model if "gemini" in resolved_model else "gemini-2.5-flash"
            # Check if official langchain_google_genai is available
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                logger.info(f"Initializing ChatGoogleGenerativeAI ({target_model}) for reasoning.")
                return ChatGoogleGenerativeAI(
                    model=target_model,
                    google_api_key=gemini_key,
                    temperature=0.1,
                )
            except ImportError:
                # Use robust REST BaseChatModel
                logger.info(f"Initializing ChatGeminiRest ({target_model}) for reasoning.")
                return ChatGeminiRest(
                    api_key=gemini_key,
                    model=target_model,
                    temperature=0.1,
                )
        except Exception as e:
            logger.warning(f"Could not initialize Gemini LLM: {e}")

    # Priority 2: Anthropic (Claude)
    if (resolved_provider == "anthropic" or not gemini_key) and anthropic_key:
        try:
            from langchain_anthropic import ChatAnthropic
            target_model = resolved_model if "claude" in resolved_model else "claude-3-5-sonnet-20241022"
            logger.info(f"Initializing Claude (ChatAnthropic, {target_model}) for reasoning.")
            return ChatAnthropic(
                model=target_model,
                anthropic_api_key=anthropic_key,
                temperature=0.1,
                max_tokens=4096,
            )
        except Exception as e:
            logger.warning(f"Could not initialize ChatAnthropic: {e}")

    # Priority 3: OpenAI (GPT-4o)
    if (resolved_provider == "openai" or not (gemini_key or anthropic_key)) and openai_key:
        try:
            from langchain_openai import ChatOpenAI
            target_model = resolved_model if "gpt" in resolved_model else "gpt-4o"
            logger.info(f"Initializing OpenAI (ChatOpenAI, {target_model}) for reasoning.")
            return ChatOpenAI(
                model=target_model,
                openai_api_key=openai_key,
                temperature=0.1,
                max_tokens=4096,
            )
        except Exception as e:
            logger.warning(f"Could not initialize ChatOpenAI: {e}")

    # If no key is present, return None (nodes will use structured template synthesis)
    return None
