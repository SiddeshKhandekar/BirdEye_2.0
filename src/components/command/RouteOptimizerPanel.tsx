import React, { useState } from 'react';
import {
  Route,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Send,
  Trash2,
  Play,
} from 'lucide-react';
import { OptimizedRoute, Issue } from '../../types';

interface RouteOptimizerPanelProps {
  route: OptimizedRoute | null;
  onGenerateNewRoute: () => void;
  onClearRoute: () => void;
  onSelectIssue: (issueId: string) => void;
}

export const RouteOptimizerPanel: React.FC<RouteOptimizerPanelProps> = ({
  route,
  onGenerateNewRoute,
  onClearRoute,
  onSelectIssue,
}) => {
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  if (!route) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-[#D7DADE] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[#55B360] flex items-center justify-center mx-auto">
          <Route className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-[#293B46]">No Active Route Planned</h3>
          <p className="text-[13px] text-[#7A7A7A] max-w-md mx-auto mt-1">
            Generate an optimized Travelling Salesperson (TSP) route for municipal repair crews,
            minimizing transit time and maximizing resolution throughput.
          </p>
        </div>
        <button
          onClick={onGenerateNewRoute}
          className="px-4 py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[13px] transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Generate Work Order Route
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-5">
      {/* Header & KPI telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D7DADE]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#293B46] text-[#55B360] flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#293B46]">{route.department_name}</h3>
            <span className="text-[12px] text-[#7A7A7A]">
              Optimized Traveling Salesperson Multi-Stop Sequence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearRoute}
            className="p-2 rounded-lg border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#7A7A7A] transition-colors"
            title="Clear Route"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDispatched(true)}
            disabled={isDispatched}
            className={`px-3.5 py-2 rounded-xl text-white font-semibold text-[12px] transition-colors flex items-center gap-1.5 shadow-sm ${
              isDispatched ? 'bg-green-700' : 'bg-[#55B360] hover:bg-[#77BE86]'
            }`}
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Dispatched to Field Crew
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch to Field Unit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] text-center">
          <span className="text-[11px] uppercase font-bold text-[#7A7A7A] block">Total Stops</span>
          <span className="text-[20px] font-bold text-[#293B46]">{route.stops.length} Stops</span>
        </div>
        <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] text-center">
          <span className="text-[11px] uppercase font-bold text-[#7A7A7A] block">Travel Distance</span>
          <span className="text-[20px] font-bold text-[#55B360]">{route.total_distance_km} km</span>
        </div>
        <div className="p-3 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] text-center">
          <span className="text-[11px] uppercase font-bold text-[#7A7A7A] block">Est. Duration</span>
          <span className="text-[20px] font-bold text-[#293B46]">{route.est_duration_min} min</span>
        </div>
      </div>

      {/* Stop Sequence Flow */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block">
          Stop-by-Stop Navigation Plan:
        </span>
        <div className="space-y-2">
          {/* Start Point */}
          <div className="p-2.5 rounded-lg bg-[#F7F8F5] border border-[#D7DADE] text-[12px] flex items-center gap-2 text-[#7A7A7A]">
            <div className="w-5 h-5 rounded-full bg-[#293B46] text-white flex items-center justify-center text-[10px] font-bold">
              0
            </div>
            <span className="font-semibold text-[#293B46]">START: Municipal Works Depot & Staging Hub</span>
          </div>

          {route.stops.map((stop) => (
            <div
              key={stop.stop_index}
              onClick={() => onSelectIssue(stop.issue_id)}
              className="p-3 rounded-xl bg-white border border-[#D7DADE] hover:border-[#55B360] transition-colors flex items-center justify-between gap-3 cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30 flex items-center justify-center font-bold text-[11px]">
                  {stop.stop_index}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#293B46] group-hover:text-[#55B360] transition-colors">
                      {stop.title}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#F7F8F5] border border-[#D7DADE] text-[#7A7A7A]">
                      {stop.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#7A7A7A] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#55B360]" />
                    <span className="truncate max-w-xs">{stop.location.address}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-[#7A7A7A] shrink-0">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  ~{stop.estimated_stop_duration_min} min on-site
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
