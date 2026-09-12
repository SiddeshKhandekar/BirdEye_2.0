import React from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Layers,
  Route,
  Video,
  ShieldAlert,
  Trophy,
  Building2,
  Cpu,
  CheckCircle2,
  Play,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Database,
  Wrench,
  FileText,
} from 'lucide-react';
import { BirdEyeLogo } from './BirdEyeLogo';
import { directusStore } from '../../services/directus/store';

interface LeftNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAppMode: 'citizen' | 'command';
  onSelectMode: (mode: 'citizen' | 'command') => void;
  onOpenCommandTab: (tab: 'worklist' | 'routes' | 'security' | 'review') => void;
  onOpenLeaderboard: () => void;
  pendingReviewsCount: number;
  onOpenTour?: () => void;
  onOpenPrivacyCenter?: () => void;
  onOpenCopilot?: () => void;
  onOpenImpactMode?: () => void;
  onOpenDataSources?: () => void;
  onOpenWorkOrders?: () => void;
  onOpenAuditLogs?: () => void;
}

export const LeftNavDrawer: React.FC<LeftNavDrawerProps> = ({
  isOpen,
  onClose,
  activeAppMode,
  onSelectMode,
  onOpenCommandTab,
  onOpenLeaderboard,
  pendingReviewsCount,
  onOpenTour,
  onOpenPrivacyCenter,
  onOpenCopilot,
  onOpenImpactMode,
  onOpenDataSources,
  onOpenWorkOrders,
  onOpenAuditLogs,
}) => {
  if (!isOpen) return null;

  const currentTenant = directusStore.getCurrentTenant();

  return (
    <aside
      id="drawer-left-nav"
      className="fixed inset-y-0 left-0 w-80 bg-white border-r border-[#D7DADE] shadow-birdeye-panel z-40 flex flex-col transition-transform duration-200 ease-out animate-fadeIn"
    >
      {/* Header */}
      <div className="h-16 px-5 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between shrink-0">
        <BirdEyeLogo />
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#F7F8F5] text-[#7A7A7A] hover:text-[#293B46] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Experience BirdEye Tour Trigger Button */}
        {onOpenTour && (
          <button
            onClick={() => {
              onOpenTour();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#293B46] to-[#1E2E37] text-white shadow-sm hover:from-[#1E2E37] hover:to-[#293B46] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#55B360]/20 flex items-center justify-center text-[#55B360]">
                <Play className="w-3.5 h-3.5 fill-[#55B360]" />
              </div>
              <div className="text-left">
                <span className="text-[12px] font-bold block leading-tight">
                  EXPERIENCE BIRDEYE
                </span>
                <span className="text-[10px] text-slate-300">13-Scene Hackathon Tour</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-[#55B360]">
              60s
            </span>
          </button>
        )}

        {/* Tenant context card */}
        <div className="p-3.5 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] space-y-1">
          <div className="flex items-center gap-2 text-[#7A7A7A] text-[11px] font-bold uppercase">
            <Building2 className="w-3.5 h-3.5 text-[#55B360]" />
            <span>Active Tenant Partition</span>
          </div>
          <h4 className="text-[14px] font-bold text-[#293B46]">{currentTenant.name}</h4>
          <p className="text-[11px] text-[#7A7A7A]">{currentTenant.description}</p>
        </div>

        {/* Primary View Navigation */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block px-1">
            Application Mode
          </span>
          <button
            onClick={() => {
              onSelectMode('citizen');
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-[13px] font-semibold transition-all ${
              activeAppMode === 'citizen'
                ? 'bg-[#EEF8F0] border-[#55B360] text-[#293B46]'
                : 'bg-white border-[#D7DADE] text-[#7A7A7A] hover:bg-[#FBFCFA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-[#55B360]" />
              <span>Citizen Experience</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#55B360] font-bold border border-[#55B360]/30">
              Mobile PWA
            </span>
          </button>

          <button
            onClick={() => {
              onSelectMode('command');
              onClose();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-[13px] font-semibold transition-all ${
              activeAppMode === 'command'
                ? 'bg-[#293B46] text-white border-[#293B46]'
                : 'bg-white border-[#D7DADE] text-[#7A7A7A] hover:bg-[#FBFCFA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-[#55B360]" />
              <span>Command Center</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-bold">
              Desktop
            </span>
          </button>
        </div>

        {/* Intelligence Features */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block px-1">
            Smart City Intelligence
          </span>

          {onOpenCopilot && (
            <button
              onClick={() => {
                onOpenCopilot();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
            >
              <BrainCircuit className="w-4 h-4 text-[#55B360]" />
              <span>Ask BirdEye (AI Copilot)</span>
            </button>
          )}

          {onOpenPrivacyCenter && (
            <button
              onClick={() => {
                onOpenPrivacyCenter();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#55B360]" />
              <span>Privacy Center (Anonymous-First)</span>
            </button>
          )}

          {onOpenImpactMode && (
            <button
              onClick={() => {
                onOpenImpactMode();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
            >
              <Zap className="w-4 h-4 text-[#55B360]" />
              <span>City Impact Transformation</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenLeaderboard();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-amber-50 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Civic Impact & Tokens</span>
          </button>
        </div>

        {/* Command Shortcuts */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block px-1">
            Municipal Modules
          </span>
          <button
            onClick={() => {
              onSelectMode('command');
              onOpenCommandTab('worklist');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
          >
            <Layers className="w-4 h-4 text-[#55B360]" />
            <span>Municipal Worklist</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('command');
              onOpenCommandTab('routes');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
          >
            <Route className="w-4 h-4 text-[#55B360]" />
            <span>Route Optimization</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('command');
              onOpenCommandTab('security');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
          >
            <Video className="w-4 h-4 text-[#293B46]" />
            <span>Security CCTV Feed</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('command');
              onOpenCommandTab('review');
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Human Review Queue</span>
            </div>
            {pendingReviewsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px]">
                {pendingReviewsCount}
              </span>
            )}
          </button>

          {onOpenDataSources && (
            <button
              onClick={() => {
                onOpenDataSources();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
            >
              <Database className="w-4 h-4 text-[#55B360]" />
              <span>Data Source Registry</span>
            </button>
          )}

          {onOpenWorkOrders && (
            <button
              onClick={() => {
                onOpenWorkOrders();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
            >
              <Wrench className="w-4 h-4 text-[#55B360]" />
              <span>Work Order Dispatch</span>
            </button>
          )}

          {onOpenAuditLogs && (
            <button
              onClick={() => {
                onOpenAuditLogs();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-[13px] text-[#293B46] hover:bg-[#EEF8F0] transition-colors"
            >
              <FileText className="w-4 h-4 text-[#55B360]" />
              <span>Immutable Audit Trail</span>
            </button>
          )}
        </div>

        {/* Intelligence Engine Pipeline Card */}
        <div className="p-3.5 rounded-xl bg-[#EEF8F0]/50 border border-[#55B360]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#55B360] font-bold text-[12px]">
            <Cpu className="w-4 h-4" />
            <span>System Pipeline Status</span>
          </div>
          <div className="space-y-1 text-[11px] text-[#7A7A7A]">
            <div className="flex justify-between">
              <span>Civic VLM:</span>
              <span className="text-[#55B360] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Gemini 3.8 Flash
              </span>
            </div>
            <div className="flex justify-between">
              <span>Spatial PostGIS:</span>
              <span className="text-[#55B360] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ST_DWithin 50m
              </span>
            </div>
            <div className="flex justify-between">
              <span>Security CV:</span>
              <span className="text-[#55B360] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> YOLOv8 + SORT
              </span>
            </div>
            <div className="flex justify-between">
              <span>License OCR:</span>
              <span className="text-[#55B360] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> EasyOCR Module
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
