import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  Users,
  Route,
  ChevronRight,
  Filter,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { IssueCluster, Issue, PriorityLevel, IssueCategory } from '../../types';
import { directusStore } from '../../services/directus/store';

interface MunicipalWorklistProps {
  clusters: IssueCluster[];
  onSelectCluster: (issue: Issue) => void;
  onGenerateRoute: (departmentId?: string) => void;
}

export const MunicipalWorklist: React.FC<MunicipalWorklistProps> = ({
  clusters,
  onSelectCluster,
  onGenerateRoute,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const departments = directusStore.getDepartments();

  const filteredClusters = clusters.filter((c) => {
    if (selectedDept !== 'all' && c.issues[0]?.department_id !== selectedDept) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    return true;
  });

  const priorityBadges: Record<PriorityLevel, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className="space-y-4">
      {/* Worklist Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#D7DADE] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-[#293B46]">Municipal Worklist</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF8F0] text-[#55B360] font-bold text-[11px] border border-[#55B360]/30">
              {filteredClusters.length} Deduplicated Clusters
            </span>
          </div>
          <p className="text-[12px] text-[#7A7A7A] mt-0.5">
            Deduplicated and clustered civic work orders ready for field crews
          </p>
        </div>

        {/* Global Action: Generate Route */}
        <button
          id="btn-generate-route-worklist"
          onClick={() => onGenerateRoute(selectedDept === 'all' ? undefined : selectedDept)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[13px] transition-colors shadow-sm"
        >
          <Route className="w-4 h-4" />
          <span>Generate Optimized Route</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="text-[#7A7A7A] font-semibold flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        <button
          onClick={() => setSelectedDept('all')}
          className={`px-2.5 py-1 rounded-lg border transition-all ${
            selectedDept === 'all'
              ? 'bg-[#EEF8F0] border-[#55B360] text-[#293B46] font-semibold'
              : 'bg-white border-[#D7DADE] text-[#7A7A7A]'
          }`}
        >
          All Departments
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              selectedDept === dept.id
                ? 'bg-[#EEF8F0] border-[#55B360] text-[#293B46] font-semibold'
                : 'bg-white border-[#D7DADE] text-[#7A7A7A]'
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Clustered Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredClusters.map((cluster) => {
          const primaryIssue = cluster.issues[0];
          const isResolved = cluster.status === 'resolved';

          return (
            <div
              key={cluster.id}
              className={`p-4 rounded-xl border bg-white shadow-sm transition-all hover:border-[#77BE86] space-y-3 ${
                isResolved ? 'opacity-80 border-green-200' : 'border-[#D7DADE]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#F7F8F5] border border-[#D7DADE] text-[11px] font-bold uppercase text-[#293B46]">
                      {cluster.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${priorityBadges[cluster.priority]}`}>
                      {cluster.priority}
                    </span>
                    {isResolved && (
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <h4 className="text-[14px] font-bold text-[#293B46] line-clamp-1 leading-snug">
                    {cluster.title}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#7A7A7A] block">Deduplicated</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EEF8F0] text-[#55B360] font-bold text-[12px]">
                    {cluster.contributor_count} Reports
                  </span>
                </div>
              </div>

              {/* Location & Department */}
              <div className="text-[12px] space-y-1 text-[#7A7A7A]">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#55B360] shrink-0" />
                  <span className="text-[#293B46] truncate">{cluster.center_location.address}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="flex items-center gap-1 text-[#293B46]">
                    <Building className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    {cluster.department_name}
                  </span>
                  <span className="text-[#7A7A7A] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Est. {primaryIssue?.estimated_effort_hours || 2.5} hrs
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-[#D7DADE]/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCluster(primaryIssue)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#55B360] hover:text-[#77BE86] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect on Map</span>
                </button>

                {!isResolved && (
                  <button
                    type="button"
                    onClick={() => {
                      directusStore.updateIssueStatus(primaryIssue.id, 'resolved');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FBFCFA] hover:bg-[#EEF8F0] border border-[#D7DADE] text-[#293B46] text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#55B360]" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
