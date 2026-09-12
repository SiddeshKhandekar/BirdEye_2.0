import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  Server,
  Layers,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const impact = directusStore.getAnonymousImpact();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#293B46]/45 backdrop-blur-[3px] animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#D7DADE] shadow-birdeye-floating overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF8F0] border border-[#55B360]/30 flex items-center justify-center text-[#55B360]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#293B46] leading-tight">
                BirdEye Privacy & Trust Center
              </h2>
              <p className="text-[12px] text-[#7A7A7A]">
                Privacy-by-design civic intelligence and AI governance
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
          {/* Active Anonymous Identity Session */}
          <div className="p-4 rounded-xl bg-[#EEF8F0] border border-[#55B360]/40 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#55B360]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#55B360]">
                  Active Protected Session
                </span>
              </div>
              <p className="text-[15px] font-mono font-bold text-[#293B46]">
                {impact.session_token}
              </p>
              <p className="text-[11px] text-[#7A7A7A]">
                Cryptographically salted ephemeral token. No personally identifiable data attached.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white border border-[#55B360]/30 text-[11px] font-bold text-[#55B360]">
              100% Anonymous
            </span>
          </div>

          {/* Privacy Architecture Pillars */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#7A7A7A]">
              Core Architectural Guarantees
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[13px] text-[#293B46]">
                  <EyeOff className="w-4 h-4 text-[#55B360]" />
                  <span>No Personal Identifiers</span>
                </div>
                <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
                  BirdEye never asks for, records, or stores user real names, phone numbers, email
                  addresses, or device IMEI signatures.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[13px] text-[#293B46]">
                  <Layers className="w-4 h-4 text-[#55B360]" />
                  <span>Strict Data Separation</span>
                </div>
                <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
                  Municipal work orders receive spatial coordinates and priority factors. The citizen
                  identity is physically isolated from field crew tablets.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[13px] text-[#293B46]">
                  <Cpu className="w-4 h-4 text-[#55B360]" />
                  <span>Human-in-the-Loop AI</span>
                </div>
                <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
                  AI flags potential security events and civic deduplication, but zero punitive
                  actions are executed without authorized human review.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D7DADE] bg-[#FBFCFA] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[13px] text-[#293B46]">
                  <Server className="w-4 h-4 text-[#55B360]" />
                  <span>PostGIS Spatial Deduplication</span>
                </div>
                <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
                  Nearby citizen reports are combined into single clusters within 50m to amplify
                  civic signals while protecting individual reporting patterns.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Microcopy Note */}
          <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#D7DADE] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#55B360] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#293B46] leading-relaxed">
              <strong>Your report can help fix your neighborhood without revealing who you are.</strong>{' '}
              All community leaderboard contributions are displayed strictly as Anonymous
              Contributors with cryptographically randomized tokens.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D7DADE] bg-[#FBFCFA] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#293B46] hover:bg-[#293B46]/90 text-white font-semibold text-[13px] transition-colors shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
