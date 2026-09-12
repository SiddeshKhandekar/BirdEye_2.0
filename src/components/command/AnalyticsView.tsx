import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { Issue, SecurityEvent, IssueCluster } from '../../types';

interface AnalyticsViewProps {
  issues: Issue[];
  clusters: IssueCluster[];
  securityEvents: SecurityEvent[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  issues,
  clusters,
  securityEvents,
}) => {
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'resolved').length;
  const totalReportsCount = issues.reduce((acc, i) => acc + i.contributor_count, 0);
  const deduplicationSavings = Math.max(0, totalReportsCount - clusters.length);
  const dedupRatio = totalReportsCount > 0 ? ((deduplicationSavings / totalReportsCount) * 100).toFixed(0) : '0';

  const confirmedThreats = securityEvents.filter((s) => s.status === 'confirmed_threat').length;
  const falsePositives = securityEvents.filter((s) => s.status === 'false_positive').length;
  const pendingReviews = securityEvents.filter((s) => s.status === 'pending_review').length;

  const categoryCounts = issues.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Top Level KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#D7DADE] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#7A7A7A] text-[11px] font-bold uppercase">
            <span>Deduplication Ratio</span>
            <Layers className="w-4 h-4 text-[#55B360]" />
          </div>
          <div className="text-[24px] font-bold text-[#293B46]">{dedupRatio}%</div>
          <p className="text-[11px] text-[#7A7A7A]">
            {deduplicationSavings} duplicate reports merged into clusters
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D7DADE] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#7A7A7A] text-[11px] font-bold uppercase">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#55B360]" />
          </div>
          <div className="text-[24px] font-bold text-[#55B360]">
            {totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%
          </div>
          <p className="text-[11px] text-[#7A7A7A]">
            {resolvedIssues} of {totalIssues} work items completed
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D7DADE] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#7A7A7A] text-[11px] font-bold uppercase">
            <span>Avg Response SLA</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-[24px] font-bold text-[#293B46]">3.4 hrs</div>
          <p className="text-[11px] text-[#7A7A7A]">Median time from report to dispatch</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#D7DADE] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#7A7A7A] text-[11px] font-bold uppercase">
            <span>Security Alerts</span>
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-[24px] font-bold text-[#293B46]">{securityEvents.length}</div>
          <p className="text-[11px] text-[#7A7A7A]">
            {confirmedThreats} Confirmed &bull; {pendingReviews} Pending Review
          </p>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Civic Defect Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-4">
          <h4 className="text-[14px] font-bold text-[#293B46] flex items-center justify-between">
            <span>Civic Category Distribution</span>
            <span className="text-[11px] font-mono text-[#7A7A7A]">{totalIssues} Total Issues</span>
          </h4>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const countNum = Number(count);
              const pct = totalIssues > 0 ? Math.round((countNum / totalIssues) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-semibold text-[#293B46] capitalize">
                    <span>{cat}</span>
                    <span>{countNum} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F7F8F5] overflow-hidden">
                    <div
                      className="h-full bg-[#55B360] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Audit Accuracy */}
        <div className="p-5 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-4">
          <h4 className="text-[14px] font-bold text-[#293B46] flex items-center justify-between">
            <span>Computer Vision Audit Metrics</span>
            <span className="text-[11px] font-mono text-[#7A7A7A]">Human-In-The-Loop</span>
          </h4>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#293B46]">Confirmed Threats</span>
              <span className="font-mono font-bold text-red-600">{confirmedThreats}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#293B46]">Audited False Positives</span>
              <span className="font-mono font-bold text-gray-600">{falsePositives}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#293B46]">Pending Officer Verification</span>
              <span className="font-mono font-bold text-amber-600">{pendingReviews}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
