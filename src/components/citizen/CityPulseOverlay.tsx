import React, { useState } from 'react';
import {
  Activity,
  Heart,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building,
  Sparkles,
  Zap,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';

interface CityPulseOverlayProps {
  onOpenPulseDetail?: () => void;
}

export const CityPulseOverlay: React.FC<CityPulseOverlayProps> = ({ onOpenPulseDetail }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const health = directusStore.getCityHealth();
  const tenant = directusStore.getCurrentTenant();

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#55B360]';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div
      id="city-pulse-widget"
      className="absolute top-4 left-4 z-20 transition-all duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#D7DADE] rounded-2xl shadow-birdeye-floating overflow-hidden min-w-[280px] max-w-xs transition-all">
        {/* Main Pulse Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-3 cursor-pointer hover:bg-[#FBFCFA] transition-colors flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            {/* Animated living breathing pulse beacon */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[#55B360] shrink-0">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#55B360] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#55B360]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                  City Pulse
                </span>
                <span className="text-[10px] text-[#55B360] font-bold">&bull; Live</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[18px] font-black text-[#293B46] tracking-tight">
                  {health.overall}
                </span>
                <span className="text-[11px] font-bold text-[#7A7A7A]">/ 100 HEALTH</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#7A7A7A]">
            <span className="text-[11px] font-semibold hidden sm:inline">
              {isExpanded ? 'Hide' : 'Details'}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Quick Micro Ticker */}
        <div className="px-4 py-1.5 bg-[#FBFCFA] border-t border-[#D7DADE]/60 flex items-center justify-between text-[11px] text-[#7A7A7A]">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {health.active_issues} Active
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55B360]"></span>
            {health.resolved_today} Fixed Today
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {health.security_events} Alerts
          </span>
        </div>

        {/* Explicit Data Coverage Indicator (No-Simulation Compliance) */}
        <div className="px-4 py-1 bg-amber-50/60 border-t border-amber-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-amber-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            DATA COVERAGE: {health.data_coverage_pct}% ({health.data_coverage_status.toUpperCase()})
          </span>
          <span className="text-amber-800/80 font-mono">{health.verified_records_count} RECORDS</span>
        </div>

        {/* Expanded 5-Dimension Radar Breakdown */}
        {isExpanded && (
          <div className="p-4 border-t border-[#D7DADE] bg-white space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#7A7A7A] uppercase tracking-wider">
                Health Dimensions (Calculated)
              </span>
              <span className="text-[10px] text-[#7A7A7A] truncate max-w-[140px]">
                {tenant.name}
              </span>
            </div>

            {/* Dimensional bars */}
            <div className="space-y-2 text-[11px]">
              {[
                { label: 'Infrastructure', val: health.infrastructure, icon: Building },
                { label: 'Cleanliness', val: health.cleanliness, icon: Sparkles },
                { label: 'Mobility', val: health.mobility, icon: Zap },
                { label: 'Response Time', val: health.response, icon: CheckCircle2 },
                { label: 'Neighborhood Safety', val: health.safety, icon: Heart },
              ].map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex justify-between font-semibold text-[#293B46]">
                    <span className="text-[#7A7A7A] flex items-center gap-1">
                      <dim.icon className="w-3 h-3 text-[#55B360]" />
                      {dim.label}
                    </span>
                    <span className={getScoreColor(dim.val)}>{dim.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F0F2F5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#55B360] rounded-full transition-all duration-500"
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Summary Callout with transparent data coverage note */}
            <div className="p-2.5 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[11px] text-[#293B46] leading-snug space-y-1">
              <div>
                <strong>Dynamically Calculated:</strong> AI deduping {health.verified_issues} verified civic signals across {tenant.name}.
              </div>
              <div className="text-[10px] text-[#7A7A7A] border-t border-[#55B360]/20 pt-1">
                Note: Score requires additional verified data sources to reach sufficient confidence threshold.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
