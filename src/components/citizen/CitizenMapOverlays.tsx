import React from 'react';
import {
  Plus,
  Crosshair,
  Layers,
  Sparkles,
  Route,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { IssueCategory, Issue } from '../../types';
import { EnvironmentalSignalBar } from '../environmental/EnvironmentalSignalBar';

interface CitizenMapOverlaysProps {
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  showClusters: boolean;
  onToggleClusters: () => void;
  onOpenReportModal: () => void;
  onLocateUser: () => void;
  issues: Issue[];
  activeRouteName?: string;
  onClearActiveRoute?: () => void;
}

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All Issues' },
  { key: 'pothole', label: 'Potholes' },
  { key: 'garbage', label: 'Garbage' },
  { key: 'streetlight', label: 'Streetlights' },
  { key: 'water', label: 'Water Leaks' },
];

export const CitizenMapOverlays: React.FC<CitizenMapOverlaysProps> = ({
  categoryFilter,
  onCategoryFilterChange,
  showClusters,
  onToggleClusters,
  onOpenReportModal,
  onLocateUser,
  issues,
  activeRouteName,
  onClearActiveRoute,
}) => {
  return (
    <>
      {/* Top Floating Category Filter Bar */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:left-6 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-sm border border-[#D7DADE] shadow-birdeye-panel overflow-x-auto max-w-full">
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === 'all'
                ? issues.length
                : issues.filter((i) => i.category === cat.key).length;
            const isSelected = categoryFilter === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => onCategoryFilterChange(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#293B46] text-white shadow-sm'
                    : 'text-[#7A7A7A] hover:bg-[#F7F8F5] hover:text-[#293B46]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FBFCFA] text-[#7A7A7A]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cluster Toggle Pill */}
        <button
          onClick={onToggleClusters}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all shadow-sm ${
            showClusters
              ? 'bg-[#EEF8F0] border-[#55B360] text-[#293B46]'
              : 'bg-white/95 border-[#D7DADE] text-[#7A7A7A] hover:bg-white'
          }`}
          title="Toggle Deduplicated Clusters vs Individual Reports"
        >
          <Layers className="w-3.5 h-3.5 text-[#55B360]" />
          <span className="hidden sm:inline">Clusters</span>
        </button>
      </div>

      {/* Route notification floating pill if route active */}
      {activeRouteName && (
        <div className="absolute top-16 left-4 md:left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#293B46] text-white shadow-birdeye-floating text-[12px]">
          <Route className="w-4 h-4 text-[#55B360]" />
          <span>Active Route: <strong>{activeRouteName}</strong></span>
          {onClearActiveRoute && (
            <button
              onClick={onClearActiveRoute}
              className="ml-2 text-[10px] underline text-gray-300 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Floating Bottom Left: Real-Time Environmental & Atmospheric Signal Bar */}
      <div className="absolute bottom-6 left-4 md:left-6 z-20 max-w-lg pointer-events-auto hidden sm:block">
        <EnvironmentalSignalBar />
      </div>

      {/* Floating Bottom Action CTA & Map Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Locate Me Button */}
        <button
          id="btn-locate-user"
          onClick={onLocateUser}
          className="w-11 h-11 rounded-xl bg-white border border-[#D7DADE] shadow-birdeye-panel flex items-center justify-center text-[#293B46] hover:text-[#55B360] hover:bg-[#FBFCFA] transition-colors"
          title="Center on my location"
          aria-label="Center on my location"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* Primary CTA: + Report Issue */}
        <button
          id="btn-report-issue-main"
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#55B360] hover:bg-[#77BE86] text-white font-bold text-[14px] shadow-birdeye-floating transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Report Issue</span>
          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-black/15 text-white">
            +25 Pts
          </span>
        </button>
      </div>
    </>
  );
};
