import React from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';

interface ImpactModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImpactModeModal: React.FC<ImpactModeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isActive = directusStore.isImpactModeActive();
  const health = directusStore.getCityHealth();

  const handleToggle = () => {
    directusStore.toggleImpactMode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#293B46]/45 backdrop-blur-[3px] animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#D7DADE] shadow-birdeye-floating overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF8F0] border border-[#55B360]/30 flex items-center justify-center text-[#55B360]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#293B46] leading-tight">
                City Impact Transformation
              </h2>
              <p className="text-[12px] text-[#7A7A7A]">
                See how swift municipal resolution elevates urban health
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F7F8F5] text-[#7A7A7A] hover:text-[#293B46] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-[13px] text-[#293B46]">
          {/* Main Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#293B46] to-[#1F2D36] text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/15 text-[#55B360]">
                ONE ACTION CHANGED THE CITY
              </span>
              <span className="text-[11px] font-mono text-[#55B360] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Live Simulation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  Active Issues
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-bold text-slate-400 line-through">24</span>
                  <ArrowRight className="w-4 h-4 text-[#55B360]" />
                  <span className="text-[28px] font-black text-white">17</span>
                </div>
                <p className="text-[10px] text-[#55B360] font-semibold">
                  7 critical hazards mitigated
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                  City Health Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-bold text-slate-400 line-through">87</span>
                  <ArrowRight className="w-4 h-4 text-[#55B360]" />
                  <span className="text-[28px] font-black text-[#55B360]">91</span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold">
                  Overall Index +4.6% Gain
                </p>
              </div>
            </div>
          </div>

          {/* Granular Sub-Dimension Metrics */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A]">
              Dimensional Elevation Breakdown
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA]">
                <span className="text-[10px] text-[#7A7A7A] uppercase font-bold block">
                  Infrastructure
                </span>
                <div className="flex items-baseline gap-1 text-[16px] font-bold text-[#293B46] mt-0.5">
                  <span>91%</span>
                  <ArrowRight className="w-3 h-3 text-[#55B360]" />
                  <span className="text-[#55B360]">95%</span>
                </div>
                <span className="text-[10px] text-[#7A7A7A]">Asphalt potholes cured</span>
              </div>

              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA]">
                <span className="text-[10px] text-[#7A7A7A] uppercase font-bold block">
                  Cleanliness
                </span>
                <div className="flex items-baseline gap-1 text-[16px] font-bold text-[#293B46] mt-0.5">
                  <span>84%</span>
                  <ArrowRight className="w-3 h-3 text-[#55B360]" />
                  <span className="text-[#55B360]">92%</span>
                </div>
                <span className="text-[10px] text-[#7A7A7A]">Overflowing bins cleared</span>
              </div>

              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA]">
                <span className="text-[10px] text-[#7A7A7A] uppercase font-bold block">
                  Citizen Confidence
                </span>
                <div className="flex items-baseline gap-1 text-[16px] font-bold text-[#293B46] mt-0.5">
                  <span>89%</span>
                  <ArrowRight className="w-3 h-3 text-[#55B360]" />
                  <span className="text-[#55B360]">97%</span>
                </div>
                <span className="text-[10px] text-[#7A7A7A]">Anonymous feedback</span>
              </div>
            </div>
          </div>

          {/* Reassuring Civic Loop */}
          <div className="p-3.5 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#55B360] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#293B46] leading-relaxed">
              Every resolved cluster automatically awards <strong>+50 shared points</strong> to all
              anonymous citizens who flagged the location, keeping civic motivation high without
              compromising privacy.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors ${
              isActive
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46]'
            }`}
          >
            {isActive ? 'Reset to Default Telemetry' : 'Simulate Resolved State (91)'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#293B46] hover:bg-[#293B46]/90 text-white font-semibold text-[13px] transition-colors"
          >
            Apply & View Map
          </button>
        </div>
      </div>
    </div>
  );
};
