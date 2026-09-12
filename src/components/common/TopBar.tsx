import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Trophy,
  ShieldAlert,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  Compass,
  Monitor,
  Smartphone,
  Play,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Database,
  Wrench,
  FileText,
} from 'lucide-react';
import { BirdEyeLogo } from './BirdEyeLogo';
import { TenantId } from '../../types';
import { directusStore } from '../../services/directus/store';

interface TopBarProps {
  currentTenantId: TenantId;
  onTenantChange: (tenantId: TenantId) => void;
  activeAppMode: 'citizen' | 'command';
  onAppModeChange: (mode: 'citizen' | 'command') => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onOpenLeaderboard: () => void;
  onOpenReviewQueue?: () => void;
  pendingReviewsCount: number;
  onToggleLeftDrawer: () => void;
  onToggleRightDrawer: () => void;
  isLeftDrawerOpen: boolean;
  isRightDrawerOpen: boolean;
  onOpenTour: () => void;
  onOpenPrivacyCenter: () => void;
  onOpenCopilot: () => void;
  onOpenImpactMode: () => void;
  onOpenDataSources?: () => void;
  onOpenWorkOrders?: () => void;
  onOpenAuditLogs?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTenantId,
  onTenantChange,
  activeAppMode,
  onAppModeChange,
  onSearch,
  searchQuery,
  onOpenLeaderboard,
  onOpenReviewQueue,
  pendingReviewsCount,
  onToggleLeftDrawer,
  onToggleRightDrawer,
  isLeftDrawerOpen,
  isRightDrawerOpen,
  onOpenTour,
  onOpenPrivacyCenter,
  onOpenCopilot,
  onOpenImpactMode,
  onOpenDataSources,
  onOpenWorkOrders,
  onOpenAuditLogs,
}) => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const tenants = directusStore.getTenants();
  const currentTenant = directusStore.getCurrentTenant();

  return (
    <header className="h-16 border-b border-[#D7DADE] bg-[#FFFFFF] px-3 md:px-6 flex items-center justify-between gap-2 md:gap-3 select-none z-30 relative shrink-0 shadow-[0_1px_4px_rgba(41,59,70,0.04)]">
      {/* Left: Brand & Mobile Drawers Trigger */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          id="btn-toggle-left-nav"
          onClick={onToggleLeftDrawer}
          className={`p-2 rounded-lg border border-[#D7DADE] text-[#293B46] hover:bg-[#EEF8F0] transition-colors md:hidden ${
            isLeftDrawerOpen ? 'bg-[#EEF8F0] text-[#55B360] border-[#55B360]' : 'bg-[#FBFCFA]'
          }`}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <BirdEyeLogo />

        {/* Multi-tenant Selector Dropdown */}
        <div className="relative">
          <button
            id="btn-tenant-selector"
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] hover:border-[#77BE86] transition-all text-left"
          >
            <Building2 className="w-3.5 h-3.5 text-[#55B360] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] uppercase font-semibold text-[#7A7A7A] leading-none">
                Tenant Context
              </span>
              <span className="text-[12px] md:text-[13px] font-semibold text-[#293B46] leading-snug truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px]">
                {currentTenant.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7A7A7A] ml-0.5 shrink-0" />
          </button>

          {tenantDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-[#D7DADE] bg-white shadow-birdeye-panel p-1.5 z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wider border-b border-[#D7DADE]/60 mb-1">
                Multi-Tenant Isolation
              </div>
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => {
                    onTenantChange(tenant.id);
                    setTenantDropdownOpen(false);
                  }}
                  className={`w-full flex flex-col p-2.5 rounded-lg text-left transition-colors ${
                    tenant.id === currentTenantId
                      ? 'bg-[#EEF8F0] text-[#293B46] border border-[#55B360]/30'
                      : 'hover:bg-[#F7F8F5] text-[#293B46]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold">{tenant.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#7A7A7A] border border-[#D7DADE]">
                      {tenant.type === 'residential_society' ? 'Township' : 'Municipal'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7A7A7A] mt-0.5 line-clamp-1">
                    {tenant.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden lg:flex items-center gap-3 flex-1 max-w-sm mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-global-search"
            type="text"
            placeholder="Search potholes, garbage, streetlights, or vehicle plates..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-[#FBFCFA] border border-[#D7DADE] rounded-lg focus:outline-none focus:border-[#55B360] focus:ring-1 focus:ring-[#55B360] text-[#293B46] placeholder-[#969696] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Tour Trigger & Mode Control */}
      <div className="flex items-center gap-1.5 md:gap-2.5">
        {/* EXPERIENCE BIRDEYE (Guided Hackathon Demo Tour) */}
        <button
          id="btn-experience-birdeye"
          type="button"
          onClick={onOpenTour}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#293B46] to-[#1E2E37] text-white text-[12px] font-bold shadow-sm hover:from-[#1E2E37] hover:to-[#293B46] transition-all border border-white/10 shrink-0"
        >
          <Play className="w-3 h-3 text-[#55B360] fill-[#55B360]" />
          <span className="hidden sm:inline tracking-wide">EXPERIENCE BIRDEYE</span>
          <span className="sm:hidden">Tour</span>
        </button>

        {/* Ask BirdEye Copilot */}
        <button
          type="button"
          id="btn-ask-birdeye"
          onClick={onOpenCopilot}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] hover:border-[#55B360]/40 text-[#293B46] text-[12px] font-semibold transition-colors"
          title="Ask BirdEye AI City Copilot"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-[#55B360]" />
          <span className="hidden xl:inline">Ask BirdEye</span>
        </button>

        {/* Privacy Center */}
        <button
          type="button"
          id="btn-privacy-center"
          onClick={onOpenPrivacyCenter}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] text-[#293B46] text-[12px] font-semibold transition-colors"
          title="Privacy By Design Shield"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#55B360]" />
          <span className="hidden xl:inline">Privacy</span>
        </button>

        {/* Impact Mode */}
        <button
          type="button"
          id="btn-impact-mode"
          onClick={onOpenImpactMode}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] text-[#293B46] text-[12px] font-semibold transition-colors"
          title="City Impact Transformation"
        >
          <Zap className="w-3.5 h-3.5 text-[#55B360]" />
          <span className="hidden xl:inline">Impact</span>
        </button>

        {/* Data Sources Registry */}
        {onOpenDataSources && (
          <button
            type="button"
            id="btn-data-sources"
            onClick={onOpenDataSources}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] text-[#293B46] text-[12px] font-semibold transition-colors"
            title="Open Data Sources Registry & Provenance"
          >
            <Database className="w-3.5 h-3.5 text-[#55B360]" />
            <span className="hidden xl:inline">Data Sources</span>
          </button>
        )}

        {/* Work Orders Management */}
        {onOpenWorkOrders && (
          <button
            type="button"
            id="btn-work-orders"
            onClick={onOpenWorkOrders}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] text-[#293B46] text-[12px] font-semibold transition-colors"
            title="Municipal Work Order Dispatch & Photo Proof"
          >
            <Wrench className="w-3.5 h-3.5 text-[#55B360]" />
            <span className="hidden xl:inline">Work Orders</span>
          </button>
        )}

        {/* Immutable Audit Trail */}
        {onOpenAuditLogs && (
          <button
            type="button"
            id="btn-audit-logs"
            onClick={onOpenAuditLogs}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] text-[#293B46] text-[12px] font-semibold transition-colors"
            title="Immutable Civic & Security Audit Trail"
          >
            <FileText className="w-3.5 h-3.5 text-[#55B360]" />
            <span className="hidden xl:inline">Audit Trail</span>
          </button>
        )}

        {/* Mode Switcher Segmented Control */}
        <div className="flex items-center p-0.5 bg-[#F7F8F5] border border-[#D7DADE] rounded-xl">
          <button
            id="btn-mode-citizen"
            onClick={() => onAppModeChange('citizen')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              activeAppMode === 'citizen'
                ? 'bg-white text-[#293B46] shadow-[0_2px_8px_rgba(41,59,70,0.08)] border border-[#D7DADE]/60'
                : 'text-[#7A7A7A] hover:text-[#293B46]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#55B360]" />
            <span className="hidden sm:inline">Citizen Map</span>
          </button>
          <button
            id="btn-mode-command"
            onClick={() => onAppModeChange('command')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              activeAppMode === 'command'
                ? 'bg-white text-[#293B46] shadow-[0_2px_8px_rgba(41,59,70,0.08)] border border-[#D7DADE]/60'
                : 'text-[#7A7A7A] hover:text-[#293B46]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-[#293B46]" />
            <span className="hidden sm:inline">Command</span>
          </button>
        </div>

        {/* Security Review Queue Alert Indicator */}
        <button
          id="btn-review-queue-trigger"
          onClick={onOpenReviewQueue}
          className="relative p-2 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] transition-colors text-[#293B46]"
          title="Human Security Review Queue"
          aria-label="Human Security Review Queue"
        >
          <ShieldAlert className="w-4 h-4 text-[#293B46]" />
          {pendingReviewsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
              {pendingReviewsCount}
            </span>
          )}
        </button>

        {/* Gamification / Leaderboard Trigger */}
        <button
          id="btn-leaderboard-trigger"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D7DADE] bg-[#FBFCFA] hover:bg-[#EEF8F0] transition-colors text-[#293B46]"
          title="Anonymous Civic Impact"
          aria-label="Anonymous Civic Impact"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-[12px] font-semibold hidden md:inline text-[#293B46]">
            Civic Impact
          </span>
        </button>

        {/* Detail drawer toggle for mobile */}
        <button
          id="btn-toggle-right-panel"
          onClick={onToggleRightDrawer}
          className={`p-2 rounded-lg border border-[#D7DADE] text-[#293B46] hover:bg-[#EEF8F0] transition-colors md:hidden ${
            isRightDrawerOpen ? 'bg-[#EEF8F0] text-[#55B360] border-[#55B360]' : 'bg-[#FBFCFA]'
          }`}
          title="Toggle Details Panel"
          aria-label="Toggle Details Panel"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
