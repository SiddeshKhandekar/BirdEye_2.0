import React from 'react';
import {
  X,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  MapPin,
  TrendingUp,
  Award,
  Lock,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';

interface CivicImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CivicImpactModal: React.FC<CivicImpactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const impact = directusStore.getAnonymousImpact();
  const leaderboard = directusStore.getLeaderboard();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#293B46]/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#D7DADE] shadow-birdeye-floating overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF8F0] border border-[#55B360]/30 flex items-center justify-center text-[#55B360]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#293B46] leading-tight">
                Civic Impact Intelligence
              </h2>
              <p className="text-[12px] text-[#7A7A7A]">
                Decentralized community achievements with zero identity tracking
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Individual Anonymous Session: YOUR IMPACT */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#EEF8F0] to-[#E2F3E5] border border-[#55B360]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#55B360]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#55B360]">
                  Your Protected Anonymous Session
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-[#55B360]/30 text-[#293B46]">
                {impact.session_token}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A] block">
                  Your Civic Score
                </span>
                <div className="text-[28px] font-black text-[#293B46] leading-none">
                  {impact.session_points}{' '}
                  <span className="text-[14px] font-bold text-[#55B360]">POINTS</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#55B360] bg-white px-2.5 py-1 rounded-full border border-[#55B360]/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Active Contributor
              </span>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#55B360]/20 text-center">
              <div className="p-2 rounded-lg bg-white/80">
                <span className="text-[18px] font-bold text-[#293B46] block">
                  {impact.session_reports_submitted}
                </span>
                <span className="text-[10px] text-[#7A7A7A] font-semibold">Verified Reports</span>
              </div>
              <div className="p-2 rounded-lg bg-white/80">
                <span className="text-[18px] font-bold text-[#293B46] block">
                  {impact.session_issues_contributed}
                </span>
                <span className="text-[10px] text-[#7A7A7A] font-semibold">Clusters Joined</span>
              </div>
              <div className="p-2 rounded-lg bg-white/80">
                <span className="text-[18px] font-bold text-[#293B46] block">
                  {impact.session_neighborhood_alerts}
                </span>
                <span className="text-[10px] text-[#7A7A7A] font-semibold">Alerts Triggered</span>
              </div>
            </div>
          </div>

          {/* Aggregate Telemetry: CITY CONTRIBUTORS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                City Contributors Aggregate
              </h3>
              <span className="text-[11px] font-semibold text-[#55B360] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Community Total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] text-center">
                <div className="text-[18px] font-bold text-[#293B46]">
                  {impact.total_anonymous_contributions.toLocaleString()}
                </div>
                <div className="text-[10px] font-semibold text-[#7A7A7A] leading-tight mt-0.5">
                  Anonymous Contributions
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] text-center">
                <div className="text-[18px] font-bold text-[#55B360]">
                  {impact.total_issues_verified}
                </div>
                <div className="text-[10px] font-semibold text-[#7A7A7A] leading-tight mt-0.5">
                  Issues AI-Verified
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] text-center">
                <div className="text-[18px] font-bold text-[#293B46]">
                  {impact.total_issues_resolved}
                </div>
                <div className="text-[10px] font-semibold text-[#7A7A7A] leading-tight mt-0.5">
                  Issues Resolved
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] text-center">
                <div className="text-[18px] font-bold text-[#55B360]">
                  {impact.neighborhoods_improved}
                </div>
                <div className="text-[10px] font-semibold text-[#7A7A7A] leading-tight mt-0.5">
                  Neighborhoods Improved
                </div>
              </div>
            </div>
          </div>

          {/* Privacy-Preserving Contributor Tokens List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                Top Anonymous Signal Nodes
              </h3>
              <span className="text-[10px] text-[#7A7A7A] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#55B360]" />
                Zero Personal Data Disclosed
              </span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    idx === 0
                      ? 'bg-[#EEF8F0]/40 border-[#55B360]/40 shadow-sm'
                      : 'bg-[#FBFCFA] border-[#D7DADE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        idx === 0
                          ? 'bg-[#55B360] text-white'
                          : 'bg-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-[#293B46]">{item.name}</div>
                      <div className="text-[11px] text-[#7A7A7A]">
                        {item.reports_submitted} signals &bull; {item.issues_resolved} resolved
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[14px] text-[#55B360]">
                      {item.points} pts
                    </span>
                    <span className="text-[10px] text-[#7A7A7A] block">
                      {item.badges[0] || 'Contributor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D7DADE] bg-[#FBFCFA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#293B46] hover:bg-[#293B46]/90 text-white font-semibold text-[13px] transition-colors"
          >
            Close Impact Panel
          </button>
        </div>
      </div>
    </div>
  );
};
