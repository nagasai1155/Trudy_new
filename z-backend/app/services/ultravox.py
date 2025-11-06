"""
Ultravox API Client
"""
import httpx
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.core.retry import retry_with_backoff
from app.core.exceptions import ProviderError

logger = logging.getLogger(__name__)


class UltravoxClient:
    """Client for Ultravox API"""
    
    def __init__(self):
        self.base_url = settings.ULTRAVOX_BASE_URL
        self.api_key = settings.ULTRAVOX_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request with retry logic"""
        url = f"{self.base_url}{endpoint}"
        
        async def _make_request():
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.request(
                    method,
                    url,
                    json=data,
                    params=params,
                    headers=self.headers,
                )
                response.raise_for_status()
                return response.json()
        
        try:
            return await retry_with_backoff(_make_request)
        except httpx.HTTPStatusError as e:
            raise ProviderError(
                provider="ultravox",
                message=f"Ultravox API error: {e.response.status_code}",
                http_status=e.response.status_code,
                retry_after=int(e.response.headers.get("Retry-After", 0)) if e.response.status_code == 429 else None,
            )
    
    # Voices
    async def create_voice(self, voice_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create voice in Ultravox"""
        response = await self._request("POST", "/voices", data=voice_data)
        return response.get("data", {})
    
    async def get_voice(self, voice_id: str) -> Dict[str, Any]:
        """Get voice from Ultravox"""
        response = await self._request("GET", f"/voices/{voice_id}")
        return response.get("data", {})
    
    # Agents
    async def create_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create agent in Ultravox"""
        response = await self._request("POST", "/agents", data=agent_data)
        return response.get("data", {})
    
    async def get_agent(self, agent_id: str) -> Dict[str, Any]:
        """Get agent from Ultravox"""
        response = await self._request("GET", f"/agents/{agent_id}")
        return response.get("data", {})
    
    async def update_agent(self, agent_id: str, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update agent in Ultravox"""
        response = await self._request("PATCH", f"/agents/{agent_id}", data=agent_data)
        return response.get("data", {})
    
    # Knowledge Bases (Corpora)
    async def create_corpus(self, corpus_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create corpus in Ultravox"""
        response = await self._request("POST", "/corpora", data=corpus_data)
        return response.get("data", {})
    
    async def add_corpus_source(self, corpus_id: str, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add source to corpus"""
        response = await self._request("POST", f"/corpora/{corpus_id}/sources", data=source_data)
        return response.get("data", {})
    
    # Calls
    async def create_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create call in Ultravox"""
        response = await self._request("POST", "/calls", data=call_data)
        return response.get("data", {})
    
    async def get_call(self, call_id: str) -> Dict[str, Any]:
        """Get call from Ultravox"""
        response = await self._request("GET", f"/calls/{call_id}")
        return response.get("data", {})
    
    async def get_call_transcript(self, call_id: str) -> Dict[str, Any]:
        """Get call transcript"""
        response = await self._request("GET", f"/calls/{call_id}/transcript")
        return response.get("data", {})
    
    async def get_call_recording(self, call_id: str) -> str:
        """Get call recording URL"""
        response = await self._request("GET", f"/calls/{call_id}/recording")
        return response.get("data", {}).get("url", "")
    
    # Campaigns (Batches)
    async def create_scheduled_batch(
        self,
        agent_id: str,
        batch_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Create scheduled batch for campaign"""
        response = await self._request(
            "POST",
            f"/agents/{agent_id}/scheduled-batches",
            data=batch_data,
        )
        return response.get("data", {})
    
    async def get_batch(self, batch_id: str) -> Dict[str, Any]:
        """Get batch status"""
        response = await self._request("GET", f"/batches/{batch_id}")
        return response.get("data", {})
    
    # Tools
    async def create_tool(self, tool_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create tool in Ultravox"""
        response = await self._request("POST", "/tools", data=tool_data)
        return response.get("data", {})
    
    async def update_tool(self, tool_id: str, tool_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update tool in Ultravox"""
        response = await self._request("PATCH", f"/tools/{tool_id}", data=tool_data)
        return response.get("data", {})
    
    async def delete_tool(self, tool_id: str) -> None:
        """Delete tool from Ultravox"""
        await self._request("DELETE", f"/tools/{tool_id}")
    
    # TTS API Keys
    async def update_tts_api_key(self, provider: str, api_key_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update TTS API key for provider"""
        response = await self._request(
            "PATCH",
            "/accounts/me/tts-api-keys",
            data={"provider": provider, **api_key_data},
        )
        return response.get("data", {})
    
    # SIP/Telephony
    async def get_sip_config(self) -> Dict[str, Any]:
        """Get SIP configuration from Ultravox"""
        response = await self._request("GET", "/sip/config")
        return response.get("data", {})


# Global client instance
ultravox_client = UltravoxClient()

