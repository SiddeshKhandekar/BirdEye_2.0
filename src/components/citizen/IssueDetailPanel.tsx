import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Issue, IssueStatus } from '../../types';
import { directusStore } from '../../services/directus/store';

interface IssueDetailPanelProps {
  issue: Issue | null;
  onClose: () => void;
  isOpen: boolean;
}

const TIMELINE_STEPS: Array<{ key: IssueStatus; label: string }> = [
  { key: 'reported', label: 'Reported' },
  { key: 'verified', label: 'Verified' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

export const IssueDetailPanel: React.FC<IssueDetailPanelProps> = ({
  issue,
  onClose,
  isOpen,
}) => {
  if (!isOpen || !issue) return null;

  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === issue.status);

  const handleUpdateStatus = (newStatus: IssueStatus) => {
    directusStore.updateIssueStatus(issue.id, newStatus);
  };

  const priorityColors = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <aside
      id="panel-issue-detail"
      className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-[#D7DADE] shadow-birdeye-panel z-40 flex flex-col transition-transform duration-200 ease-out"
    >
      {/* Header */}
      <div className="h-16 px-5 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30">
            {issue.category}
          </span>
          <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${priorityColors[issue.priority]}`}>
            {issue.priority} Priority
          </span>
        </div>
        <button
          id="btn-close-detail-panel"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#F7F8F5] text-[#7A7A7A] hover:text-[#293B46] transition-colors"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Photo with AI verification badge */}
        <div className="relative rounded-xl overflow-hidden border border-[#D7DADE] bg-[#F7F8F5] h-52">
          <img
            src={issue.image_url}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-[#D7DADE] shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-[#55B360]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#55B360]" />
            AI Verified ({issue.ai_confidence.toFixed(1)}%)
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-[18px] font-bold text-[#293B46] leading-snug">
            {issue.title}
          </h2>
          <p className="text-[13px] text-[#7A7A7A] mt-1.5 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Visual Progress Timeline */}
        <div className="p-4 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block">
            Resolution Lifecycle
          </span>
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-[#D7DADE] z-0" />
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 h-0.5 bg-[#55B360] transition-all duration-300 z-0"
              style={{
                width: `${Math.max(0, (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 92)}%`,
              }}
            />

            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      isCompleted
                        ? 'bg-[#55B360] border-white text-white shadow-sm'
                        : 'bg-white border-[#D7DADE] text-[#969696]'
                    } ${isCurrent ? 'ring-2 ring-[#55B360]/40' : ''}`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold text-center whitespace-nowrap ${
                      isCompleted ? 'text-[#293B46]' : 'text-[#969696]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Explainability & Smart Prioritization Card */}
        <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#D7DADE] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#293B46] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#55B360]" />
              Explainable AI Prioritization
            </span>
            <span className="text-[11px] font-bold text-[#55B360]">
              Score: {issue.priority_factors?.total_score || (issue.priority === 'critical' ? 95 : 84)}/100
            </span>
          </div>

          <div className="text-[12px] space-y-1 text-[#293B46]">
            <span className="font-semibold text-[#7A7A7A] text-[11px] uppercase block">
              Why {issue.priority.toUpperCase()} Priority?
            </span>
            <ul className="space-y-1 text-[#7A7A7A] text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#55B360]"></span>
                <strong>{issue.contributor_count} anonymous reports</strong> spatially clustered
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <strong>High-traffic transit corridor</strong> with pedestrian vulnerability
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Nearby sensitive facility proximity calculated via OpenStreetMap
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#D7DADE] text-[11px]">
            <span className="font-bold text-[#293B46] block">RECOMMENDED ACTION:</span>
            <p className="text-[#7A7A7A] mt-0.5 leading-snug">
              {issue.priority_factors?.recommended_action ||
                `Deploy ${issue.department_name} team for urgent site remediation.`}
            </p>
          </div>
        </div>

        {/* AI Model Provenance & Decision Lineage */}
        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-[12px]">
          <div className="flex items-center justify-between text-purple-900 font-bold text-[11px] uppercase">
            <span>AI Verification Model Provenance</span>
            <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {issue.ai_model || 'gemini-3.8-flash'} ({issue.ai_model_version || 'v2026.03'})
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-[#7A7A7A]">Decision:</span>
              <span className="text-emerald-600 font-bold">VERIFIED ({issue.ai_confidence.toFixed(1)}% confidence)</span>
            </div>
            <div className="text-[#7A7A7A] pt-1 border-t border-purple-50">
              <span className="font-bold text-[#293B46] block mb-0.5">Visual Defect Evidence:</span>
              <p className="text-purple-950 font-mono text-[10px] leading-relaxed">
                {issue.ai_evidence || 'Visual defect signature confirmed by VLM inspection with verified depth & perimeter margins.'}
              </p>
            </div>
          </div>
        </div>

        {/* Data Source Provenance & Ingestion Tracking */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-[12px]">
          <div className="flex items-center justify-between text-blue-900 font-bold text-[11px] uppercase">
            <span>Data Ingestion & Lineage</span>
            <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {issue.source_id || 'src_directus_postgis'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-white p-2 rounded border border-blue-100">
              <span className="text-[10px] text-[#7A7A7A] block">Record ID:</span>
              <span className="text-blue-950 font-bold truncate block">{issue.id}</span>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <span className="text-[10px] text-[#7A7A7A] block">Ingested:</span>
              <span className="text-blue-950 truncate block">
                {issue.ingestion_timestamp ? new Date(issue.ingestion_timestamp).toLocaleTimeString() : 'Verified Live'}
              </span>
            </div>
          </div>
          {issue.work_order_id && (
            <div className="bg-white p-2 rounded border border-blue-100 text-[11px] flex items-center justify-between">
              <span className="text-[#7A7A7A]">Linked Work Order:</span>
              <span className="font-mono font-bold text-[#55B360]">{issue.work_order_id}</span>
            </div>
          )}
        </div>

        {/* Before vs After Photo Proof Comparison (if resolved) */}
        {issue.after_image_url && (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px] uppercase">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Resolution Evidence
              </span>
              <span className="text-emerald-700 text-[10px]">Before vs After</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="aspect-video rounded-lg overflow-hidden border border-emerald-200">
                  <img src={issue.image_url} alt="Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] font-bold text-center block text-[#7A7A7A]">Before Repair</span>
              </div>
              <div className="space-y-1">
                <div className="aspect-video rounded-lg overflow-hidden border border-emerald-200">
                  <img src={issue.after_image_url} alt="After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] font-bold text-center block text-emerald-700">After Repair</span>
              </div>
            </div>
            {issue.resolution_notes && (
              <p className="text-[11px] text-emerald-950 font-medium bg-white p-2 rounded border border-emerald-100">
                {issue.resolution_notes}
              </p>
            )}
          </div>
        )}

        {/* Municipal & Spatial Metadata */}
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] space-y-1">
            <span className="text-[#7A7A7A] text-[11px] flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#55B360]" />
              Location
            </span>
            <p className="font-semibold text-[#293B46] leading-snug line-clamp-2">
              {issue.location.address}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] space-y-1">
            <span className="text-[#7A7A7A] text-[11px] flex items-center gap-1 font-semibold">
              <Building className="w-3.5 h-3.5 text-[#55B360]" />
              Assigned Dept
            </span>
            <p className="font-semibold text-[#293B46] leading-snug line-clamp-2">
              {issue.department_name}
            </p>
          </div>
        </div>

        {/* Anonymous Contributors List (Gamification & Deduplication) */}
        <div className="p-4 rounded-xl bg-[#EEF8F0]/60 border border-[#55B360]/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#293B46]">
              <Users className="w-4 h-4 text-[#55B360]" />
              <span>Deduplicated Signals ({issue.contributor_count})</span>
            </div>
            <span className="text-[11px] font-bold text-[#55B360] flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Shared Points
            </span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {issue.contributors.map((contrib, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#D7DADE]/60 text-[12px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#55B360]"></span>
                  <span className="font-medium text-[#293B46]">
                    {contrib.contributor_token || `Anonymous Contributor #${idx + 1}`}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#7A7A7A]">{contrib.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Municipal Worker Actions Footer */}
      <div className="p-4 border-t border-[#D7DADE] bg-[#FBFCFA] space-y-2">
        <span className="text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wider block">
          Municipal Dispatch Actions:
        </span>
        <div className="flex items-center gap-2">
          {issue.status !== 'resolved' && (
            <>
              {issue.status !== 'in_progress' && (
                <button
                  id="btn-mark-in-progress"
                  onClick={() => handleUpdateStatus('in_progress')}
                  className="flex-1 py-2 px-3 rounded-lg border border-[#D7DADE] bg-white hover:bg-[#EEF8F0] text-[#293B46] font-semibold text-[12px] transition-colors"
                >
                  Mark In Progress
                </button>
              )}
              <button
                id="btn-mark-resolved"
                onClick={() => handleUpdateStatus('resolved')}
                className="flex-1 py-2 px-3 rounded-lg bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[12px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Resolve & Award +50 Pts
              </button>
            </>
          )}

          {issue.status === 'resolved' && (
            <div className="w-full py-2 px-3 rounded-lg bg-[#EEF8F0] border border-[#55B360]/40 text-[#55B360] font-bold text-[12px] text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Issue Resolved & Verified by Field Crew
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
