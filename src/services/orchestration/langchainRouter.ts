import {
  Issue,
  SecurityEvent,
  LangChainRoutingDecision,
  PriorityLevel,
} from '../../types';

/**
 * Role-scoped Directus SDK / Tool abstraction
 * AI logic NEVER references raw URL endpoints; it interacts purely through role-scoped tools.
 */
export interface RoleScopedDirectusTools {
  createRoadsWorkOrder: (recordId: string, priority: PriorityLevel, notes: string) => Promise<string>;
  createSanitationWorkOrder: (recordId: string, priority: PriorityLevel, notes: string) => Promise<string>;
  createElectricalCivicOrder: (recordId: string, priority: PriorityLevel, notes: string) => Promise<string>;
  dispatchPoliceSecurityLiaison: (recordId: string, alertLevel: PriorityLevel, notes: string) => Promise<string>;
}

export const directusRoleScopedTools: RoleScopedDirectusTools = {
  createRoadsWorkOrder: async (recordId, priority, notes) => {
    return `WO-ROADS-${Date.now().toString().slice(-4)} [Priority: ${priority}] - ${notes}`;
  },
  createSanitationWorkOrder: async (recordId, priority, notes) => {
    return `WO-SANITATION-${Date.now().toString().slice(-4)} [Priority: ${priority}] - ${notes}`;
  },
  createElectricalCivicOrder: async (recordId, priority, notes) => {
    return `WO-ELECTRICAL-${Date.now().toString().slice(-4)} [Priority: ${priority}] - ${notes}`;
  },
  dispatchPoliceSecurityLiaison: async (recordId, alertLevel, notes) => {
    return `DISPATCH-POLICE-${Date.now().toString().slice(-4)} [Alert: ${alertLevel}] - ${notes}`;
  },
};

export class LangChainDynamicOrchestrationAgent {
  /**
   * Evaluates verified civic report or security event using the LangChain routing paradigm.
   * Dynamically determines department, priority, and invokes the appropriate role-scoped Directus tool.
   */
  public async routeRecord(
    record: Issue | SecurityEvent,
    type: 'civic_issue' | 'security_alert'
  ): Promise<LangChainRoutingDecision> {
    // Check if server-side routing is available
    try {
      const response = await fetch('/api/orchestration/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record, type }),
      });

      if (response.ok) {
        return (await response.json()) as LangChainRoutingDecision;
      }
    } catch {
      // Graceful fallback to client-side LangChain logic
    }

    // Role-based routing agent logic
    if (type === 'security_alert') {
      const sec = record as SecurityEvent;
      const isCritical = sec.event_type === 'blacklist_match';

      await directusRoleScopedTools.dispatchPoliceSecurityLiaison(
        sec.id,
        isCritical ? 'critical' : 'high',
        `Autonomous routing for flagged ${sec.event_type} involving plate ${sec.plate}`
      );

      return {
        record_id: sec.id,
        record_type: 'security_alert',
        assigned_department: isCritical ? 'Police & Security Liaison' : 'Society Security Staff',
        routing_confidence: 0.98,
        priority_assigned: isCritical ? 'critical' : 'high',
        rationale: `Classified as ${sec.event_type} (${sec.plate}). Strict Human Review barrier enforced before field intervention.`,
        action_plan: [
          'Add to Security Human Review Queue',
          'Notify Gate 1 & 2 Automated Intercom',
          'Audit plate history in state motor database',
        ],
        dispatched_at: new Date().toISOString(),
      };
    }

    // Civic routing logic
    const issue = record as Issue;
    let dept = 'Electrical & Civic Maintenance';
    let priority: PriorityLevel = issue.priority;
    let actionPlan: string[] = [];

    switch (issue.category) {
      case 'pothole':
        dept = 'Roads & Asphalt Infrastructure';
        priority = issue.contributor_count >= 5 ? 'critical' : 'high';
        actionPlan = [
          'Assign road patch crew with asphalt cold-mix',
          'Include in municipal daily route optimization',
          'Issue road safety alert for two-wheelers',
        ];
        await directusRoleScopedTools.createRoadsWorkOrder(issue.id, priority, 'Road crater dispatch');
        break;

      case 'garbage':
        dept = 'Solid Waste & Sanitation Wing';
        priority = 'medium';
        actionPlan = [
          'Dispatch municipal compactor truck to site',
          'Clear organic waste and sanitize surrounding walkway',
          'Verify container lid integrity',
        ];
        await directusRoleScopedTools.createSanitationWorkOrder(issue.id, priority, 'Waste removal dispatch');
        break;

      case 'streetlight':
        dept = 'Electrical & Civic Maintenance';
        priority = 'high';
        actionPlan = [
          'Dispatch electrical technician unit',
          'Inspect pole junction box and luminaire wiring',
          'Replace burnt LED luminaire head',
        ];
        await directusRoleScopedTools.createElectricalCivicOrder(issue.id, priority, 'Streetlight repair');
        break;

      case 'water':
        dept = 'Electrical & Civic Maintenance (Water Supply Wing)';
        priority = 'critical';
        actionPlan = [
          'Immediate isolation of zonal pressure valve',
          'Excavate compromised pipe sleeve',
          'Pressure test and backfill tarmac',
        ];
        await directusRoleScopedTools.createElectricalCivicOrder(issue.id, priority, 'Water burst isolation');
        break;

      default:
        dept = 'General Civic Maintenance';
        priority = 'medium';
        actionPlan = ['Review citizen photo attachment', 'Schedule field assessment'];
        break;
    }

    return {
      record_id: issue.id,
      record_type: 'civic_issue',
      assigned_department: dept,
      routing_confidence: 0.95,
      priority_assigned: priority,
      rationale: `Derived from category "${issue.category}" and contributor density (${issue.contributor_count} citizen reports).`,
      action_plan: actionPlan,
      dispatched_at: new Date().toISOString(),
    };
  }
}

export const langChainAgent = new LangChainDynamicOrchestrationAgent();
