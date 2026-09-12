from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import PromptTemplate

class OfflineLLMConnector:
    """
    Handles connections to local, offline inference servers (e.g., Ollama).
    """

    def __init__(self, model_name: str = "llama3", base_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self._llm = None

    @property
    def llm(self) -> ChatOllama:
        """
        Lazy-loads the Ollama Chat Model
        """
        if not self._llm:
            self._llm = ChatOllama(
                model=self.model_name,
                base_url=self.base_url,
                temperature=0.1,  # Low temperature for strict routing logic
                format="json"     # We enforce JSON output for Pydantic parsing
            )
        return self._llm

    def generate_routing_decision(self, prompt_text: str):
        """
        Placeholder method to invoke the LLM for routing
        """
        return self.llm.invoke(prompt_text)

# Singleton instance for the application to import
offline_llm = OfflineLLMConnector(model_name="llama3")
