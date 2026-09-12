import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { langChainAgent } from '../../services/orchestration/langchainRouter';
import { directusStore } from '../../services/directus/store';
import { LangChainRoutingDecision, Issue } from '../../types';

export const LangChainRoutingCard: React.FC = () => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [decision, setDecision] = useState<LangChainRoutingDecision | null>(null);

  const issues = directusStore.getIssues();

  const handleRunRouting = async (issue: Issue) => {
    setIsRouting(true);
    setSelectedIssueId(issue.id);
    const result = await langChainAgent.routeRecord(issue, 'civic_issue');
    setIsRouting(false);
    setDecision(result);
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D7DADE]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[#55B360] flex items-center justify-center">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#293B46]">
              LangChain Dynamic Role Orchestrator
            </h3>
            <span className="text-[12px] text-[#7A7A7A]">
              Role-Scoped Directus Tool Invocation & Autonomous Department Dispatch
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-[#FBFCFA] border border-[#D7DADE] text-[11px] font-mono text-[#55B360] font-bold">
          Zero Hardcoded URLs
        </span>
      </div>

      {/* Conceptual Pipeline Architecture Schematic */}
      <div className="p-3.5 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] flex flex-wrap items-center justify-between text-[11px] font-medium text-[#7A7A7A] gap-2">
        <div className="flex items-center gap-1.5 text-[#293B46] font-semibold">
          <Layers className="w-3.5 h-3.5 text-[#55B360]" />
          <span>Verified Record</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#D7DADE]" />
        <div className="flex items-center gap-1.5 text-[#293B46] font-semibold">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>LangChain Router Agent</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#D7DADE]" />
        <div className="flex items-center gap-1.5 text-[#293B46] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Derive Dept & SLA</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-[#D7DADE]" />
        <div className="flex items-center gap-1.5 text-[#55B360] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#55B360]" />
          <span>Directus Role Tool Executed</span>
        </div>
      </div>

      {/* Test Sample Records */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block">
          Trigger Routing on Real Tenant Records:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {issues.slice(0, 3).map((iss) => (
            <button
              key={iss.id}
              onClick={() => handleRunRouting(iss)}
              disabled={isRouting}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedIssueId === iss.id
                  ? 'border-[#55B360] bg-[#EEF8F0]'
                  : 'border-[#D7DADE] bg-[#FBFCFA] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#7A7A7A]">
                <span>{iss.category}</span>
                <span className="text-[#55B360]">{iss.contributor_count} Reports</span>
              </div>
              <h5 className="text-[12px] font-bold text-[#293B46] truncate mt-1">{iss.title}</h5>
              <span className="text-[11px] text-[#7A7A7A] truncate block mt-0.5">
                Current: {iss.department_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Output Decision Inspector */}
      {decision && (
        <div className="p-4 rounded-xl bg-[#FBFCFA] border border-[#55B360]/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#55B360] font-bold text-[13px]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Orchestration Complete &bull; Tool Invocation Succeeded</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white border border-[#D7DADE] text-[11px] font-mono text-[#293B46]">
              {(decision.routing_confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-2.5 rounded-lg bg-white border border-[#D7DADE] space-y-0.5">
              <span className="text-[10px] uppercase text-[#7A7A7A] font-bold">Assigned Department</span>
              <p className="font-bold text-[#293B46]">{decision.assigned_department}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#D7DADE] space-y-0.5">
              <span className="text-[10px] uppercase text-[#7A7A7A] font-bold">Priority SLA</span>
              <p className="font-bold uppercase text-red-700">{decision.priority_assigned}</p>
            </div>
          </div>

          <div className="text-[12px] text-[#293B46] space-y-1">
            <span className="font-semibold text-[#7A7A7A]">Reasoning Trace:</span>
            <p className="p-2 rounded bg-white border border-[#D7DADE] text-[11px] font-mono text-[#293B46]">
              {decision.rationale}
            </p>
          </div>

          <div className="space-y-1 text-[12px]">
            <span className="font-semibold text-[#7A7A7A]">Autonomous Action Plan:</span>
            <ul className="list-disc pl-5 text-[11px] text-[#293B46] space-y-0.5">
              {decision.action_plan.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
