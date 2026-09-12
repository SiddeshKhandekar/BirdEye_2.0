import React, { useState, useEffect } from 'react';
import {
  Video,
  ShieldAlert,
  Play,
  Pause,
  Sliders,
  Scan,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  RefreshCw,
  Clock,
  Shield,
  UploadCloud,
  Camera,
  Crosshair,
  Maximize2,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { computerVisionSecurityService, VideoProcessingResult } from '../../services/ai-security/computerVisionService';
import { directusStore } from '../../services/directus/store';
import { DetectedVehicleTrack, SecurityEvent } from '../../types';
import { FocusedSnapshotPreviewModal } from './FocusedSnapshotPreviewModal';

interface SecurityDashboardProps {
  onNavigateToReviewQueue: () => void;
}

const SAMPLE_CCTV_FEEDS = [
  {
    id: 'cam_gate2',
    name: 'Gate 2 Automated Boom Barrier CCTV',
    sourceUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    description: 'High-definition 1080p optical feed at entrance checkpoint.',
    cameraId: 'CAM-GATE2-NORTH',
  },
  {
    id: 'cam_east_perimeter',
    name: 'Perimeter East Road Surveillance Node',
    sourceUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    description: 'Continuous monitoring along perimeter fence & residential lane.',
    cameraId: 'CAM-PERIMETER-EAST',
  },
];

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  onNavigateToReviewQueue,
}) => {
  const [selectedFeed, setSelectedFeed] = useState(SAMPLE_CCTV_FEEDS[0]);
  const [loiteringThreshold, setLoiteringThreshold] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<VideoProcessingResult | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<DetectedVehicleTrack | null>(null);

  // Auto-Snapshot states
  const [autoSnapshotEnabled, setAutoSnapshotEnabled] = useState<boolean>(true);
  const [flashTrigger, setFlashTrigger] = useState<boolean>(false);
  const [lastAutoSnapshot, setLastAutoSnapshot] = useState<{
    trackId: string;
    plate: string;
    reason: string;
    confidence: number;
    timestamp: string;
    snapshotUrl: string;
    focusedCropUrl: string;
    cameraName: string;
  } | null>(null);

  // Modal inspection state
  const [inspectingEvent, setInspectingEvent] = useState<SecurityEvent | null>(null);

  const blacklist = directusStore.getBlacklist();

  const triggerCameraFlash = () => {
    setFlashTrigger(true);
    setTimeout(() => {
      setFlashTrigger(false);
    }, 400);
  };

  const handleRunPipeline = async () => {
    setIsProcessing(true);
    const res = await computerVisionSecurityService.processCCTVVideo(selectedFeed.name, {
      loiteringThresholdSec: loiteringThreshold,
    });
    setIsProcessing(false);
    setResult(res);

    if (res.tracks.length > 0) {
      setSelectedTrack(res.tracks[0]);
    }

    // Auto-Snapshot Trigger Logic
    if (autoSnapshotEnabled) {
      const flaggedTrack = res.tracks.find((t) => t.is_blacklisted || t.is_loitering);
      if (flaggedTrack) {
        // Visual shutter highlight flash!
        triggerCameraFlash();

        setLastAutoSnapshot({
          trackId: flaggedTrack.track_id,
          plate: flaggedTrack.plate || 'UNKNOWN',
          reason: flaggedTrack.is_blacklisted
            ? `BLACKLIST REGISTRY MATCH: License plate ${flaggedTrack.plate} flagged for security review.`
            : `LOITERING ANOMALY: Stationary for ${flaggedTrack.stationary_duration_sec}s (threshold ${loiteringThreshold}s).`,
          confidence: flaggedTrack.plate_confidence || 96.0,
          timestamp: new Date().toLocaleTimeString(),
          snapshotUrl: flaggedTrack.snapshot_url,
          focusedCropUrl: flaggedTrack.focused_crop_url || flaggedTrack.snapshot_url,
          cameraName: selectedFeed.name,
        });
      }
    }
  };

  // Test trigger for interactive demo
  const handleSimulateAutoSnapshot = () => {
    triggerCameraFlash();
    const mockTrack = result?.tracks.find((t) => t.is_blacklisted) || {
      track_id: 'Vehicle #03',
      plate: 'MH12AB1234',
      plate_confidence: 96.8,
      stationary_duration_sec: 14,
      is_blacklisted: true,
      snapshot_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      focused_crop_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=85',
    };

    setLastAutoSnapshot({
      trackId: mockTrack.track_id,
      plate: mockTrack.plate || 'MH12AB1234',
      reason: 'CRITICAL BLACKLIST MATCH: Plate MH12AB1234 detected with 96.8% OCR confidence at North Gate 2.',
      confidence: mockTrack.plate_confidence || 96.8,
      timestamp: new Date().toLocaleTimeString(),
      snapshotUrl: mockTrack.snapshot_url,
      focusedCropUrl: mockTrack.focused_crop_url || mockTrack.snapshot_url,
      cameraName: selectedFeed.name,
    });
  };

  // Quick helper to inspect a track as a SecurityEvent in the modal
  const handleInspectTrack = (track: DetectedVehicleTrack) => {
    const mockEvt: SecurityEvent = {
      id: `evt_inspect_${Date.now()}`,
      tenant_id: directusStore.getCurrentTenant().id,
      plate: track.plate || 'UNKNOWN',
      plate_confidence: track.plate_confidence || 92.0,
      event_type: track.is_blacklisted ? 'blacklist_match' : 'loitering',
      track_id: track.track_id,
      snapshot_url: track.snapshot_url,
      focused_crop_url: track.focused_crop_url || track.snapshot_url,
      auto_snapshot: {
        snapshot_id: `SNAP-${Date.now().toString().slice(-6)}`,
        camera_id: selectedFeed.cameraId,
        camera_name: selectedFeed.name,
        full_frame_url: track.snapshot_url,
        focused_crop_url: track.focused_crop_url || track.snapshot_url,
        captured_at: new Date().toISOString(),
        video_timestamp_sec: 14.2,
        bbox: track.bbox,
        optical_zoom: '2.4x Focused Optical Zoom',
        shutter_mode: 'auto_trigger_on_flag',
        trigger_rule: track.is_blacklisted
          ? 'Rule #SEC-01: Blacklist Plate Identification'
          : 'Rule #SEC-08: Stationary Loitering Anomaly',
        resolution: '1080p Optical @ 30FPS',
        visual_highlight_color: track.is_blacklisted ? 'red' : 'amber',
      },
      video_timestamp_sec: 14.2,
      timestamp: new Date().toISOString(),
      loitering_duration_sec: track.stationary_duration_sec,
      status: 'pending_review',
      reason_flagged: track.is_blacklisted
        ? `BLACKLIST MATCH: Vehicle ${track.plate} detected.`
        : `LOITERING: Stationary for ${track.stationary_duration_sec}s.`,
      confidence: track.plate_confidence || 92.0,
      location: {
        lat: directusStore.getCurrentTenant().center.lat,
        lng: directusStore.getCurrentTenant().center.lng,
        address: `${selectedFeed.name}, Green Valley`,
      },
      vehicle_meta: {
        type: track.class_name,
        color: track.color,
        model_guess: 'Passenger Vehicle',
      },
    };
    setInspectingEvent(mockEvt);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#293B46] text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55B360] animate-pulse" />
            <h3 className="text-[18px] font-bold">Security Intelligence Loop</h3>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono font-medium">
              YOLOv8 + SORT + EasyOCR
            </span>
            <span className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[11px] font-mono font-bold flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Auto-Snapshot Engine
            </span>
          </div>
          <p className="text-[13px] text-gray-300 max-w-xl">
            Surveillance AI detects vehicles, tracks movement trajectories across frames, reads license plates,
            and triggers automated high-resolution snapshots with visual highlights when anomalies are detected.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-simulate-snapshot"
            onClick={handleSimulateAutoSnapshot}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[12px] transition-colors flex items-center gap-1.5 border border-white/20"
            title="Simulate Flag & Auto-Snapshot Visual Trigger"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Auto-Snapshot</span>
          </button>

          <button
            id="btn-open-review-queue"
            onClick={onNavigateToReviewQueue}
            className="px-4 py-2 rounded-xl bg-white text-[#293B46] hover:bg-gray-100 font-bold text-[13px] transition-colors flex items-center gap-2 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Human Review Queue
          </button>
        </div>
      </div>

      {/* Main CV Pipeline Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: CCTV Player & Video Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-3">
            {/* Feed selector & Auto-Snapshot Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D7DADE]">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#55B360]" />
                <span className="text-[13px] font-bold text-[#293B46]">{selectedFeed.name}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Auto-Snapshot Toggle */}
                <button
                  onClick={() => setAutoSnapshotEnabled(!autoSnapshotEnabled)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    autoSnapshotEnabled
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <Camera className={`w-3.5 h-3.5 ${autoSnapshotEnabled ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
                  <span>Auto-Snapshot: {autoSnapshotEnabled ? 'ACTIVE' : 'OFF'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {SAMPLE_CCTV_FEEDS.map((feed) => (
                    <button
                      key={feed.id}
                      onClick={() => {
                        setSelectedFeed(feed);
                        setResult(null);
                        setLastAutoSnapshot(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        selectedFeed.id === feed.id
                          ? 'bg-[#EEF8F0] border-[#55B360] text-[#293B46]'
                          : 'bg-white border-[#D7DADE] text-[#7A7A7A]'
                      }`}
                    >
                      {feed.id === 'cam_gate2' ? 'Gate 2 Cam' : 'Perimeter East'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video / Snapshot Visual Canvas with Computer Vision Bounding Boxes */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#D7DADE] select-none">
              <img
                src={selectedFeed.sourceUrl}
                alt="CCTV Stream"
                className="w-full h-full object-cover opacity-90"
              />

              {/* Shutter Visual Flash Trigger Effect */}
              {flashTrigger && (
                <div className="absolute inset-0 bg-white/85 z-30 pointer-events-none transition-opacity duration-300 flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-black/80 text-white font-mono text-[14px] font-bold flex items-center gap-2 shadow-2xl border border-white/40 animate-scaleUp">
                    <Camera className="w-5 h-5 text-red-500 animate-spin" />
                    <span>📸 AUTO-SNAPSHOT TRIGGERED!</span>
                  </div>
                </div>
              )}

              {/* Real-time CV HUD Overlay */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/20 text-white font-mono text-[11px] flex items-center gap-2 z-20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>REC &bull; 1080p 30FPS &bull; {selectedFeed.cameraId}</span>
              </div>

              {/* LIVE AUTO-SNAPSHOT CAPTURED TOAST OVERLAY */}
              {lastAutoSnapshot && (
                <div className="absolute top-3 right-3 z-20 max-w-sm p-3 rounded-xl bg-black/90 backdrop-blur-md border-2 border-red-500 text-white shadow-2xl space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-1.5">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-red-400">
                      <Camera className="w-3.5 h-3.5 animate-pulse" />
                      <span>AUTO-SNAPSHOT CAPTURED</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">{lastAutoSnapshot.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-amber-400/80 bg-zinc-900 shrink-0">
                      <img
                        src={lastAutoSnapshot.focusedCropUrl}
                        alt="Crop"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border border-red-500/60 pointer-events-none" />
                    </div>

                    <div className="text-[11px] space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono text-[13px] text-amber-300">{lastAutoSnapshot.plate}</strong>
                        <span className="text-[10px] text-emerald-400">({lastAutoSnapshot.confidence.toFixed(1)}%)</span>
                      </div>
                      <p className="text-gray-300 text-[10px] truncate leading-tight">{lastAutoSnapshot.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        const targetTrack = result?.tracks.find((t) => t.plate === lastAutoSnapshot.plate) || {
                          track_id: lastAutoSnapshot.trackId,
                          class_name: 'car' as const,
                          bbox: [22, 18, 62, 64] as [number, number, number, number],
                          confidence: 0.95,
                          plate: lastAutoSnapshot.plate,
                          plate_confidence: lastAutoSnapshot.confidence,
                          stationary_duration_sec: 14,
                          is_loitering: false,
                          is_blacklisted: true,
                          color: 'White',
                          snapshot_url: lastAutoSnapshot.snapshotUrl,
                          focused_crop_url: lastAutoSnapshot.focusedCropUrl,
                        };
                        handleInspectTrack(targetTrack);
                      }}
                      className="flex-1 py-1 px-2 rounded bg-white/20 hover:bg-white/30 text-white font-semibold text-[10px] transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Crop</span>
                    </button>

                    <button
                      onClick={onNavigateToReviewQueue}
                      className="flex-1 py-1 px-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Review Queue</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bounding Box Annotations with Visual Highlights */}
              {result && (
                <>
                  {/* Vehicle 1 - Loitering Flag with Visual Highlight */}
                  <div
                    onClick={() => setSelectedTrack(result.tracks[0])}
                    className="absolute cursor-pointer border-2 border-amber-400 bg-amber-400/20 rounded transition-all hover:bg-amber-400/30 group shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    style={{ left: '12%', top: '28%', width: '36%', height: '44%' }}
                  >
                    {/* Targeting Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400" />

                    <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 whitespace-nowrap shadow">
                      <span>Vehicle #01 (Car)</span>
                      <span>&bull; MH14CD5678 (93%)</span>
                    </div>

                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-amber-300 text-[9px] font-mono font-bold flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      <span>Stationary: 48s [AUTO-SNAPSHOT]</span>
                    </div>
                  </div>

                  {/* Vehicle 3 - Blacklist Flag with High-Visibility Visual Highlight */}
                  <div
                    onClick={() => setSelectedTrack(result.tracks[2])}
                    className="absolute cursor-pointer border-2 border-red-500 bg-red-500/25 rounded transition-all hover:bg-red-500/35 shadow-[0_0_20px_rgba(239,68,68,0.45)] animate-pulse"
                    style={{ left: '52%', top: '22%', width: '40%', height: '42%' }}
                  >
                    {/* High-visibility Targeting Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-red-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-red-500" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-red-500" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-red-500" />

                    <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold flex items-center gap-1 whitespace-nowrap shadow">
                      <Crosshair className="w-3 h-3 text-amber-300" />
                      <span>Vehicle #03 (Car)</span>
                      <span>&bull; MH12AB1234 [BLACKLIST]</span>
                    </div>

                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-900/95 text-white text-[9px] font-mono font-bold flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5 text-amber-300" />
                      <span>⚡ AUTO-SNAPSHOT CAPTURED</span>
                    </div>
                  </div>
                </>
              )}

              {/* Scanning Overlay Animation while processing */}
              {isProcessing && (
                <div className="absolute inset-0 bg-[#293B46]/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white space-y-3 z-30">
                  <Scan className="w-10 h-10 text-[#55B360] animate-spin" />
                  <div className="text-center">
                    <h4 className="text-[15px] font-bold">Executing CV Pipeline</h4>
                    <p className="text-[12px] text-gray-300">
                      Running YOLOv8 Object Detection &bull; SORT Multi-Object Tracking &bull; EasyOCR License Plate
                      Inference &bull; Auto-Snapshot Engine...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline Controls & Sliders */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              {/* Loitering Threshold Slider */}
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <Clock className="w-4 h-4 text-[#7A7A7A]" />
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-semibold text-[#7A7A7A] mb-1">
                    <span>Loitering Stationary Threshold</span>
                    <span className="font-mono text-[#293B46] font-bold">{loiteringThreshold} seconds</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={60}
                    step={5}
                    value={loiteringThreshold}
                    onChange={(e) => setLoiteringThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#D7DADE] rounded-lg appearance-none cursor-pointer accent-[#55B360]"
                  />
                </div>
              </div>

              {/* Run Pipeline Action */}
              <button
                id="btn-run-cv-pipeline"
                disabled={isProcessing}
                onClick={handleRunPipeline}
                className="px-4 py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] disabled:opacity-50 text-white font-bold text-[13px] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>{result ? 'Re-run CV Pipeline & Snapshot' : 'Run Computer Vision Pipeline'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: OCR & Detected Tracks Inspector */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-3">
            <h4 className="text-[14px] font-bold text-[#293B46] flex items-center justify-between">
              <span>Automated Detections</span>
              <span className="text-[11px] font-mono text-[#7A7A7A]">
                {result ? `${result.tracks.length} Vehicles Detected` : 'Awaiting Pipeline'}
              </span>
            </h4>

            {result ? (
              <div className="space-y-2.5">
                {result.tracks.map((track) => {
                  const isSelected = selectedTrack?.track_id === track.track_id;
                  const isFlagged = track.is_blacklisted || track.is_loitering;

                  return (
                    <div
                      key={track.track_id}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#55B360] bg-[#EEF8F0]/70 shadow-sm'
                          : 'border-[#D7DADE] bg-[#FBFCFA] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-[#293B46]">{track.track_id}</span>
                        <div className="flex items-center gap-1">
                          {track.is_blacklisted && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                              Blacklist
                            </span>
                          )}
                          {track.is_loitering && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Loitering
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#D7DADE]/60">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-mono text-[#7A7A7A] block">
                            EasyOCR Plate
                          </span>
                          <span className="text-[13px] font-mono font-bold text-[#293B46]">
                            {track.plate || 'NO_PLATE'}
                          </span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] uppercase font-mono text-[#7A7A7A] block">Stationary</span>
                          <span className="text-[12px] font-mono font-semibold text-[#293B46]">
                            {track.stationary_duration_sec}s
                          </span>
                        </div>
                      </div>

                      {/* Auto-Snapshot Action on Flagged Track */}
                      {isFlagged && (
                        <div className="mt-2.5 pt-2 border-t border-[#D7DADE]/40 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-red-600 font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Auto-Snapshot Active
                          </span>
                          <button
                            onClick={() => handleInspectTrack(track)}
                            className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-[10px] transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect Focused Crop</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-[12px] text-[#7A7A7A] space-y-2">
                <Scan className="w-8 h-8 text-[#D7DADE] mx-auto" />
                <p>Click "Run Computer Vision Pipeline" to perform YOLO vehicle detection, SORT tracking & EasyOCR plate extraction with auto-snapshot capture.</p>
              </div>
            )}
          </div>

          {/* Blacklist Quick Reference Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#D7DADE] shadow-sm space-y-2.5">
            <h4 className="text-[13px] font-bold text-[#293B46] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-red-600" />
              <span>Society Blacklist Database ({blacklist.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {blacklist.map((b) => (
                <div
                  key={b.plate}
                  className="p-2 rounded-lg bg-[#FBFCFA] border border-[#D7DADE] text-[11px] flex items-center justify-between"
                >
                  <span className="font-mono font-bold text-[#293B46]">{b.plate}</span>
                  <span className="text-[10px] text-red-700 font-medium truncate max-w-[120px]">
                    {b.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optical Inspection Modal */}
      <FocusedSnapshotPreviewModal
        event={inspectingEvent}
        isOpen={!!inspectingEvent}
        onClose={() => setInspectingEvent(null)}
        onReviewAction={(id, action) => {
          directusStore.updateSecurityReview(id, action, 'Lead Security Inspector');
        }}
      />
    </div>
  );
};
