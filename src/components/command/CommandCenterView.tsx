import React, { useState } from 'react';
import {
  Layers,
  Route,
  Video,
  ShieldAlert,
  Workflow,
  BarChart3,
  Map as MapIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { IssueCluster, Issue, OptimizedRoute, SecurityEvent } from '../../types';
import { MunicipalWorklist } from './MunicipalWorklist';
import { RouteOptimizerPanel } from './RouteOptimizerPanel';
import { SecurityDashboard } from '../security/SecurityDashboard';
import { HumanReviewQueue } from '../security/HumanReviewQueue';
import { LangChainRoutingCard } from './LangChainRoutingCard';
import { AnalyticsView } from './AnalyticsView';

interface CommandCenterViewProps {
  clusters: IssueCluster[];
  issues: Issue[];
  activeRoute: OptimizedRoute | null;
  securityEvents: SecurityEvent[];
  onSelectIssue: (issue: Issue) => void;
  onGenerateRoute: (departmentId?: string) => void;
  onClearRoute: () => void;
  onSwitchToMap: () => void;
  initialTab?: 'worklist' | 'routes' | 'security' | 'review' | 'langchain' | 'analytics';
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  clusters,
  issues,
  activeRoute,
  securityEvents,
  onSelectIssue,
  onGenerateRoute,
  onClearRoute,
  onSwitchToMap,
  initialTab = 'worklist',
}) => {
  const [activeTab, setActiveTab] = useState<'worklist' | 'routes' | 'security' | 'review' | 'langchain' | 'analytics'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const pendingReviewsCount = securityEvents.filter((s) => s.status === 'pending_review').length;

  return (
    <div className="flex-1 bg-[#F7F8F5] overflow-y-auto p-4 md:p-6 space-y-5">
      {/* Command Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#D7DADE] shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab-cmd-worklist"
            onClick={() => setActiveTab('worklist')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              activeTab === 'worklist'
                ? 'bg-[#293B46] text-white shadow-sm'
                : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Worklist ({clusters.length})</span>
          </button>

          <button
            id="tab-cmd-routes"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              activeTab === 'routes'
                ? 'bg-[#293B46] text-white shadow-sm'
                : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Routes</span>
            {activeRoute && <span className="w-2 h-2 rounded-full bg-[#55B360]" />}
          </button>

          <button
            id="tab-cmd-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-[#293B46] text-white shadow-sm'
                : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Security CCTV</span>
          </button>

          <button
            id="tab-cmd-review"
            onClick={() => setActiveTab('review')}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-[#293B46] text-white shadow-sm'
                : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Review Queue</span>
            {pendingReviewsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            id="tab-cmd-langchain"
            onClick={() => setActiveTab('langchain')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              activeTab === 'langchain'
                ? 'bg-[#293B46] text-white shadow-sm'
                : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
            }`}
          >
            <Workflow className="w-4 h-4 text-amber-500" />
            <span>LangChain Agent</span>
          </button>

          <button
            id="tab-cmd-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#293B46] text-white shadow-sm'
                : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Back to Interactive Map Button */}
        <button
          id="btn-return-map"
          onClick={onSwitchToMap}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF8F0] hover:bg-[#55B360] text-[#55B360] hover:text-white font-semibold text-[12px] transition-colors border border-[#55B360]/30"
        >
          <MapIcon className="w-4 h-4" />
          <span>Interactive Map Canvas</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'worklist' && (
          <MunicipalWorklist
            clusters={clusters}
            onSelectCluster={(issue) => {
              onSelectIssue(issue);
              onSwitchToMap();
            }}
            onGenerateRoute={(deptId) => {
              onGenerateRoute(deptId);
              setActiveTab('routes');
            }}
          />
        )}

        {activeTab === 'routes' && (
          <RouteOptimizerPanel
            route={activeRoute}
            onGenerateNewRoute={() => onGenerateRoute()}
            onClearRoute={onClearRoute}
            onSelectIssue={(issueId) => {
              const iss = issues.find((i) => i.id === issueId);
              if (iss) {
                onSelectIssue(iss);
                onSwitchToMap();
              }
            }}
          />
        )}

        {activeTab === 'security' && (
          <SecurityDashboard
            onNavigateToReviewQueue={() => setActiveTab('review')}
          />
        )}

        {activeTab === 'review' && (
          <HumanReviewQueue events={securityEvents} />
        )}

        {activeTab === 'langchain' && (
          <LangChainRoutingCard />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            issues={issues}
            clusters={clusters}
            securityEvents={securityEvents}
          />
        )}
      </div>
    </div>
  );
};
