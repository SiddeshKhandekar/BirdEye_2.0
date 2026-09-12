import React, { useState } from 'react';
import {
  X,
  Camera,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  MapPin,
  Clock,
  Car,
  FileText,
  Eye,
  Crosshair,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SecurityEvent } from '../../types';
import { directusStore } from '../../services/directus/store';

interface FocusedSnapshotPreviewModalProps {
  event: SecurityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewAction?: (id: string, action: 'confirm' | 'false_positive' | 'escalate') => void;
}

export const FocusedSnapshotPreviewModal: React.FC<FocusedSnapshotPreviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onReviewAction,
}) => {
  const [viewMode, setViewMode] = useState<'focused' | 'full' | 'plate'>('focused');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !event) return null;

  const autoSnap = event.auto_snapshot;
  const isBlacklist = event.event_type === 'blacklist_match';
  const isLoitering = event.event_type === 'loitering';
  const isPending = event.status === 'pending_review';

  // Blacklist match details if applicable
  const blacklist = directusStore.getBlacklist();
  const matchedBlacklistEntry = blacklist.find((b) => b.plate === event.plate);

  const handleAction = (action: 'confirm' | 'false_positive' | 'escalate') => {
    if (onReviewAction) {
      onReviewAction(event.id, action);
    } else {
      directusStore.updateSecurityReview(event.id, action, 'Lead Security Inspector');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#D7DADE] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#293B46] text-white flex items-center justify-between border-b border-[#D7DADE]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center shadow">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold tracking-wide">
                  Auto-Snapshot Optical Inspection
                </h3>
                <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-mono uppercase tracking-wider text-amber-300 border border-white/20">
                  {autoSnap?.snapshot_id || `SNAP-${event.id.slice(-6)}`}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[10px] font-bold">
                  {event.event_type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-mono">
                {autoSnap?.camera_name || 'Automated Surveillance Optical Node'} &bull; Frame t={event.video_timestamp_sec}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F7F8F5]">
          {/* Shutter Trigger Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/70 to-[#293B46] text-white flex flex-wrap items-center justify-between gap-2 border border-red-500/30 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[12px] font-bold tracking-wide">
                ⚡ AUTO-SNAPSHOT TRIGGERED & LOCKED BY CV PIPELINE
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-200 flex items-center gap-3">
              <span>Sensor: {autoSnap?.camera_id || 'CAM-02-NORTH'}</span>
              <span>Res: {autoSnap?.resolution || '1080p Optical'}</span>
              <span>Optical Zoom: {autoSnap?.optical_zoom || '2.4x Focused'}</span>
            </div>
          </div>

          {/* Dual View Selector & Zoom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-xl border border-[#D7DADE]">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setViewMode('focused');
                  setZoomLevel(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  viewMode === 'focused'
                    ? 'bg-[#293B46] text-white shadow-sm'
                    : 'text-[#7A7A7A] hover:bg-[#F7F8F5]'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-[#55B360]" />
                <span>Focused Vehicle Auto-Crop</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('plate');
                  setZoomLevel(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  viewMode === 'plate'
                    ? 'bg-[#293B46] text-white shadow-sm'
                    : 'text-[#7A7A7A] hover:bg-[#F7F8F5]'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Plate Optical Zoom</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('full');
                  setZoomLevel(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  viewMode === 'full'
                    ? 'bg-[#293B46] text-white shadow-sm'
                    : 'text-[#7A7A7A] hover:bg-[#F7F8F5]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Full CCTV Frame Context</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
                className="p-1.5 rounded-lg border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold text-[#293B46] min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded-lg border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Focused Visual Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-[16/9] flex items-center justify-center border-2 border-red-500/40 shadow-inner group">
            {/* The Image View */}
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >
              {viewMode === 'focused' ? (
                /* Focused crop centered on vehicle */
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={event.focused_crop_url || event.snapshot_url}
                    alt={event.plate}
                    className="w-full h-full object-cover"
                  />

                  {/* Optical Targeting Reticle Frame */}
                  <div className="absolute inset-6 sm:inset-12 border-2 border-red-500/80 rounded-xl pointer-events-none shadow-[0_0_25px_rgba(239,68,68,0.35)]">
                    {/* Corner Reticle Brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-red-500" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-red-500" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-red-500" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-red-500" />

                    {/* HUD Targeting Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600/90 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 shadow">
                      <Crosshair className="w-3 h-3 animate-spin" />
                      <span>FOCUSED TARGET: {event.track_id}</span>
                    </div>

                    {/* License Plate HUD Zoom Callout */}
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/85 backdrop-blur-sm border border-amber-400 text-amber-300 font-mono text-[12px] font-bold flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>{event.plate}</span>
                      <span className="text-[10px] text-gray-300">({event.plate_confidence.toFixed(1)}% Conf)</span>
                    </div>
                  </div>
                </div>
              ) : viewMode === 'plate' ? (
                /* Extreme Plate Zoom */
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 p-6">
                  <div className="relative p-6 rounded-xl border-2 border-amber-400 bg-black/90 shadow-2xl max-w-lg text-center space-y-3">
                    <span className="text-[10px] uppercase font-mono text-amber-400 tracking-widest block font-bold">
                      Optical Character Recognition Lens (EasyOCR 2.0)
                    </span>
                    <div className="py-3 px-6 bg-white text-black font-mono text-[28px] sm:text-[34px] font-black tracking-widest rounded-lg border-4 border-black shadow-inner">
                      {event.plate}
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-gray-300 pt-2 border-t border-white/20">
                      <span>OCR Confidence: <strong className="text-[#55B360]">{event.plate_confidence.toFixed(1)}%</strong></span>
                      <span>Format: IND Standard HSRP</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Full CCTV Frame Context */
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={event.snapshot_url}
                    alt="Full CCTV Frame"
                    className="w-full h-full object-cover"
                  />
                  {/* Vehicle Bounding Box within full scene */}
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    style={{ left: '25%', top: '22%', width: '45%', height: '48%' }}
                  >
                    <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow whitespace-nowrap">
                      <span>{event.track_id}</span>
                      <span>&bull; {event.plate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Watermark Telemetry Overlay */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/75 backdrop-blur-sm border border-white/20 text-white font-mono text-[10px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>REC // 2026-09-07 // AUTO-SNAPSHOT LOCK</span>
            </div>
          </div>

          {/* Details & Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Flag Reason & Vehicle Metadata */}
            <div className="p-4 rounded-xl bg-white border border-[#D7DADE] space-y-2.5 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#293B46] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#55B360]" />
                <span>Detection & Flag Telemetry</span>
              </h4>

              <div className="space-y-1.5 text-[12px]">
                <p className="font-semibold text-red-900 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {event.reason_flagged}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-[#7A7A7A]">
                  <div>
                    <span className="block text-[10px] uppercase">Vehicle Type</span>
                    <strong className="text-[#293B46]">{event.vehicle_meta.type} ({event.vehicle_meta.color})</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Model Guess</span>
                    <strong className="text-[#293B46]">{event.vehicle_meta.model_guess}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Camera Location</span>
                    <strong className="text-[#293B46] truncate block">{event.location.address}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase">Loitering Time</span>
                    <strong className="text-[#293B46]">{event.loitering_duration_sec}s</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Blacklist Cross-Reference or Police Bulletin */}
            <div className="p-4 rounded-xl bg-white border border-[#D7DADE] space-y-2.5 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#293B46] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Cross-Reference Intelligence Match</span>
              </h4>

              {matchedBlacklistEntry ? (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900 uppercase">Police Registry Match</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                      {matchedBlacklistEntry.alert_level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-red-800 leading-snug">
                    {matchedBlacklistEntry.reason}
                  </p>
                  <p className="text-red-700 italic text-[10px]">
                    Note: {matchedBlacklistEntry.notes}
                  </p>
                </div>
              ) : isLoitering ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 uppercase">Perimeter Loitering Rule</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">
                      ALERT
                    </span>
                  </div>
                  <p className="text-amber-800">
                    Vehicle lingered stationary for {event.loitering_duration_sec}s along perimeter lane, exceeding the 30-second automated anomaly threshold.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#FBFCFA] border border-[#D7DADE] text-[11px] text-[#7A7A7A]">
                  Standard vehicle detection flagged by security sensor node for human verification.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer (HITL Audit Controls) */}
        {isPending ? (
          <div className="p-4 bg-white border-t border-[#D7DADE] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[12px] text-[#7A7A7A]">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Mandatory Human Officer Audit: Require signature before dispatch.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleAction('false_positive')}
                className="px-3.5 py-2 rounded-xl border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46] font-bold text-[12px] transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-gray-500" />
                <span>Mark False Positive</span>
              </button>

              <button
                onClick={() => handleAction('escalate')}
                className="px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[12px] transition-colors flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Escalate to Warden</span>
              </button>

              <button
                onClick={() => handleAction('confirm')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Threat & Dispatch</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-white border-t border-[#D7DADE] flex items-center justify-between text-[12px] text-[#7A7A7A] shrink-0">
            <span className="flex items-center gap-1.5 font-medium text-[#293B46]">
              <CheckCircle2 className="w-4 h-4 text-[#55B360]" />
              Audited by: {event.reviewer_id || 'Security Officer'}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#D7DADE] hover:bg-[#F7F8F5] font-semibold text-[#293B46]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
