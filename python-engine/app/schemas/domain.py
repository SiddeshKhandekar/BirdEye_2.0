from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime

# Enums based on TypeScript types
PriorityLevel = Literal['low', 'medium', 'high', 'critical']
RecordType = Literal['civic_issue', 'security_alert']

class LangChainRoutingDecision(BaseModel):
    """
    Matches the LangChainRoutingDecision TypeScript interface in src/types/index.ts
    """
    record_id: str = Field(..., description="ID of the civic issue or security alert")
    record_type: RecordType = Field(..., description="Type of the record")
    assigned_department: str = Field(..., description="Department assigned to handle the issue")
    routing_confidence: float = Field(..., description="Confidence score from 0.0 to 1.0", ge=0.0, le=1.0)
    priority_assigned: PriorityLevel = Field(..., description="Calculated priority level")
    rationale: str = Field(..., description="Detailed explanation of the routing decision")
    action_plan: List[str] = Field(..., description="Step-by-step action plan for the assigned department")
    dispatched_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z", description="ISO 8601 timestamp")

# Additional input models based on standard issues
class GeoLocation(BaseModel):
    lat: float
    lng: float
    address: str

class Issue(BaseModel):
    id: str
    tenant_id: str
    category: Literal['pothole', 'garbage', 'streetlight', 'water', 'other']
    title: str
    description: str
    location: GeoLocation
    status: str
    priority: PriorityLevel
    contributor_count: int

class SecurityEvent(BaseModel):
    id: str
    tenant_id: str
    plate: str
    event_type: str
    status: str
    location: GeoLocation
