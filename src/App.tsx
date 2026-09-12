/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { directusStore } from './services/directus/store';
import { Issue, TenantId, OptimizedRoute, SecurityEvent, ScaleLevel } from './types';
import { TopBar } from './components/common/TopBar';
import { LeftNavDrawer } from './components/common/LeftNavDrawer';
import { MapView } from './components/map/MapView';
import { CitizenMapOverlays } from './components/citizen/CitizenMapOverlays';
import { ReportIssueModal } from './components/citizen/ReportIssueModal';
import { IssueDetailPanel } from './components/citizen/IssueDetailPanel';
import { LeaderboardModal } from './components/citizen/LeaderboardModal';
import { CommandCenterView } from './components/command/CommandCenterView';

// New Intelligence Experience Components
import { CityPulseOverlay } from './components/citizen/CityPulseOverlay';
import { BirdsEyeModeControl } from './components/citizen/BirdsEyeModeControl';
import { GuidedDemoTour } from './components/tour/GuidedDemoTour';
import { PrivacyCenterModal } from './components/common/PrivacyCenterModal';
import { AskBirdEyeModal } from './components/citizen/AskBirdEyeModal';
import { ImpactModeModal } from './components/citizen/ImpactModeModal';
import { DataSourceRegistryModal } from './components/datasources/DataSourceRegistryModal';
import { WorkOrderManagementModal } from './components/workorders/WorkOrderManagementModal';
import { AuditLogsModal } from './components/audit/AuditLogsModal';

export default function App() {
  // Store subscription for reactive updates
  const [, setStoreTick] = useState<number>(0);
  useEffect(() => {
    return directusStore.subscribe(() => {
      setStoreTick((t) => t + 1);
    });
  }, []);

  const currentTenant = directusStore.getCurrentTenant();
  const allIssues = directusStore.getIssues();
  const allClusters = directusStore.getClusters();
  const allSecurityEvents = directusStore.getSecurityEvents();

  // App mode: citizen mobile/PWA map vs command center desktop
  const [appMode, setAppMode] = useState<'citizen' | 'command'>('citizen');
  const [commandTab, setCommandTab] = useState<'worklist' | 'routes' | 'security' | 'review' | 'langchain' | 'analytics'>('worklist');

  // Single-drawer state management
  // RULE: Only ONE drawer can be open at a time. Never allow both simultaneously.
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState<boolean>(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState<boolean>(false);
  const [isWorkOrdersOpen, setIsWorkOrdersOpen] = useState<boolean>(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState<boolean>(false);

  // Map state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showClusters, setShowClusters] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<OptimizedRoute | null>(null);
  const [highlightedCoords, setHighlightedCoords] = useState<{
    lat: number;
    lng: number;
    radiusMeters?: number;
  } | null>(null);

  // User simulated GPS coordinates
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: currentTenant.center.lat + 0.0008,
    lng: currentTenant.center.lng + 0.0006,
  });

  // Global search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update user location when tenant changes
  useEffect(() => {
    setUserLocation({
      lat: currentTenant.center.lat + 0.0008,
      lng: currentTenant.center.lng + 0.0006,
    });
    // Reset route when tenant changes
    setActiveRoute(null);
    setHighlightedCoords(null);
  }, [currentTenant.id]);

  // Single drawer handlers
  const handleOpenLeftDrawer = () => {
    setIsRightDrawerOpen(false);
    setSelectedIssue(null);
    setIsLeftDrawerOpen(true);
  };

  const handleCloseLeftDrawer = () => {
    setIsLeftDrawerOpen(false);
  };

  const handleOpenRightDrawer = (issue: Issue) => {
    setIsLeftDrawerOpen(false);
    setSelectedIssue(issue);
    setIsRightDrawerOpen(true);
    setHighlightedCoords({
      lat: issue.location.lat,
      lng: issue.location.lng,
      radiusMeters: 50,
    });
  };

  const handleCloseRightDrawer = () => {
    setIsRightDrawerOpen(false);
    setSelectedIssue(null);
    setHighlightedCoords(null);
  };

  // Filter issues by search query
  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) return allIssues;
    const q = searchQuery.toLowerCase();
    return allIssues.filter(
      (iss) =>
        iss.title.toLowerCase().includes(q) ||
        iss.category.toLowerCase().includes(q) ||
        iss.location.address.toLowerCase().includes(q) ||
        iss.description.toLowerCase().includes(q)
    );
  }, [allIssues, searchQuery]);

  const pendingReviewsCount = allSecurityEvents.filter(
    (e) => e.status === 'pending_review'
  ).length;

  const handleGenerateRoute = (deptId?: string) => {
    const route = directusStore.generateOptimizedRoute(deptId);
    setActiveRoute(route);
  };

  const handleLocateUser = () => {
    setHighlightedCoords({
      lat: userLocation.lat,
      lng: userLocation.lng,
      radiusMeters: 30,
    });
  };

  const handleIssueCreated = (issue: Issue, isDuplicate: boolean) => {
    setHighlightedCoords({
      lat: issue.location.lat,
      lng: issue.location.lng,
      radiusMeters: isDuplicate ? 60 : 40,
    });
    handleOpenRightDrawer(issue);
  };

  const handleScaleChange = (scale: ScaleLevel) => {
    // Center map or adjust zoom accordingly
    let targetZoom = 16;
    if (scale === 'street') targetZoom = 18;
    if (scale === 'neighborhood') targetZoom = 16;
    if (scale === 'ward') targetZoom = 14;
    if (scale === 'city') targetZoom = 12;

    setHighlightedCoords({
      lat: currentTenant.center.lat,
      lng: currentTenant.center.lng,
      radiusMeters: scale === 'street' ? 40 : scale === 'neighborhood' ? 200 : 800,
    });
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-[#F7F8F5] text-[#293B46]">
      {/* Top Application Bar */}
      <TopBar
        currentTenantId={currentTenant.id}
        onTenantChange={(tid) => directusStore.setCurrentTenant(tid)}
        activeAppMode={appMode}
        onAppModeChange={(mode) => {
          setAppMode(mode);
          if (mode === 'command') {
            handleCloseRightDrawer();
          }
        }}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenReviewQueue={() => {
          setCommandTab('review');
          setAppMode('command');
        }}
        pendingReviewsCount={pendingReviewsCount}
        onToggleLeftDrawer={() => {
          if (isLeftDrawerOpen) {
            handleCloseLeftDrawer();
          } else {
            handleOpenLeftDrawer();
          }
        }}
        onToggleRightDrawer={() => {
          if (isRightDrawerOpen) {
            handleCloseRightDrawer();
          } else if (allIssues.length > 0) {
            handleOpenRightDrawer(allIssues[0]);
          }
        }}
        isLeftDrawerOpen={isLeftDrawerOpen}
        isRightDrawerOpen={isRightDrawerOpen}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenPrivacyCenter={() => setIsPrivacyOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenImpactMode={() => setIsImpactModalOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onOpenWorkOrders={() => setIsWorkOrdersOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Citizen View: Primary Map Canvas with Floating Controls */}
        {appMode === 'citizen' ? (
          <main className="relative w-full h-full">
            <MapView
              issues={filteredIssues}
              clusters={allClusters}
              selectedIssueId={selectedIssue?.id || null}
              onSelectIssue={handleOpenRightDrawer}
              activeRoute={activeRoute}
              securityEvents={allSecurityEvents}
              center={currentTenant.center}
              zoom={currentTenant.zoom}
              userLocation={userLocation}
              categoryFilter={categoryFilter}
              showClusters={showClusters}
              showPredictiveHotspots={true}
              highlightedCoords={highlightedCoords}
            />

            {/* City Pulse Live Ticker & Radar Breakdown */}
            <CityPulseOverlay onOpenPulseDetail={() => setIsImpactModalOpen(true)} />

            {/* Bird's-Eye Perspective Scale Switcher (Street -> Neighborhood -> Ward -> City) */}
            <BirdsEyeModeControl onSelectScale={handleScaleChange} />

            <CitizenMapOverlays
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              showClusters={showClusters}
              onToggleClusters={() => setShowClusters(!showClusters)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onLocateUser={handleLocateUser}
              issues={filteredIssues}
              activeRouteName={activeRoute ? activeRoute.department_name : undefined}
              onClearActiveRoute={() => setActiveRoute(null)}
            />
          </main>
        ) : (
          /* Command Center View */
          <CommandCenterView
            clusters={allClusters}
            issues={filteredIssues}
            activeRoute={activeRoute}
            securityEvents={allSecurityEvents}
            initialTab={commandTab}
            onSelectIssue={(iss) => {
              setAppMode('citizen');
              handleOpenRightDrawer(iss);
            }}
            onGenerateRoute={handleGenerateRoute}
            onClearRoute={() => setActiveRoute(null)}
            onSwitchToMap={() => setAppMode('citizen')}
          />
        )}

        {/* Drawers (Guaranteed Single-Open Constraint) */}
        <LeftNavDrawer
          isOpen={isLeftDrawerOpen}
          onClose={handleCloseLeftDrawer}
          activeAppMode={appMode}
          onSelectMode={setAppMode}
          onOpenCommandTab={(tab) => {
            setCommandTab(tab);
            setAppMode('command');
          }}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          pendingReviewsCount={pendingReviewsCount}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenPrivacyCenter={() => setIsPrivacyOpen(true)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenImpactMode={() => setIsImpactModalOpen(true)}
          onOpenDataSources={() => setIsDataSourcesOpen(true)}
          onOpenWorkOrders={() => setIsWorkOrdersOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        />

        <IssueDetailPanel
          issue={selectedIssue}
          isOpen={isRightDrawerOpen && appMode === 'citizen'}
          onClose={handleCloseRightDrawer}
        />
      </div>

      {/* Floating Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userCoords={userLocation}
        onIssueCreated={handleIssueCreated}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <GuidedDemoTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      <PrivacyCenterModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <AskBirdEyeModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInspectIssue={(iss) => {
          setAppMode('citizen');
          handleOpenRightDrawer(iss);
        }}
      />

      <ImpactModeModal
        isOpen={isImpactModalOpen}
        onClose={() => setIsImpactModalOpen(false)}
      />

      <DataSourceRegistryModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
      />

      <WorkOrderManagementModal
        isOpen={isWorkOrdersOpen}
        onClose={() => setIsWorkOrdersOpen(false)}
        onSelectIssue={(issueId) => {
          const found = allIssues.find((i) => i.id === issueId);
          if (found) {
            setAppMode('citizen');
            handleOpenRightDrawer(found);
          }
        }}
      />

      <AuditLogsModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
      />
    </div>
  );
}
