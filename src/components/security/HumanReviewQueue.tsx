import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  MapPin,
  Car,
  Filter,
  Eye,
  ShieldCheck,
  Camera,
  Maximize2,
  Crosshair,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SecurityEvent, ReviewStatus } from '../../types';
import { directusStore } from '../../services/directus/store';
import { FocusedSnapshotPreviewModal } from './FocusedSnapshotPreviewModal';

interface HumanReviewQueueProps {
  events: SecurityEvent[];
}

export const HumanReviewQueue: React.FC<HumanReviewQueueProps> = ({ events }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [inspectEvent, setInspectEvent] = useState<SecurityEvent | null>(null);
  // Store view preferences (focused crop vs full scene) per event ID
  const [eventViewModes, setEventViewModes] = useState<Record<string, 'focused' | 'full'>>({});

  const filteredEvents = events.filter((evt) => {
    if (filter === 'pending') return evt.status === 'pending_review';
    if (filter === 'reviewed') return evt.status !== 'pending_review';
    return true;
  });

  const handleReviewAction = (
    id: string,
    action: 'confirm' | 'false_positive' | 'escalate'
  ) => {
    directusStore.updateSecurityReview(id, action, 'Lead Security Inspector');
  };

  const toggleViewMode = (id: string) => {
    setEventViewModes((prev) => ({
      ...prev,
      [id]: prev[id] === 'full' ? 'focused' : 'full',
    }));
  };

  return (
    <div className="space-y-4">
      {/* MANDATORY HUMAN VERIFICATION BANNER */}
      <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-900 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-bold uppercase tracking-wide text-red-900">
                Human Verification Mandate Enforced
              </h3>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
                AUTO-SNAPSHOT VERIFICATION
              </span>
            </div>
            <p className="text-[12px] text-red-800">
              High-resolution auto-snapshots are automatically triggered and locked whenever a vehicle is flagged. Human officer sign-off is mandatory before any enforcement dispatch.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-red-300 font-mono text-[11px] font-bold text-red-800">
          <Clock className="w-3.5 h-3.5" />
          <span>SLA &lt; 5 min response</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
              filter === 'all'
                ? 'bg-[#293B46] text-white border-[#293B46]'
                : 'bg-white border-[#D7DADE] text-[#7A7A7A] hover:bg-[#F7F8F5]'
            }`}
          >
            All Alerts ({events.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
              filter === 'pending'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white border-[#D7DADE] text-red-700 hover:bg-red-50'
            }`}
          >
            Pending Review ({events.filter((e) => e.status === 'pending_review').length})
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
              filter === 'reviewed'
                ? 'bg-[#55B360] text-white border-[#55B360]'
                : 'bg-white border-[#D7DADE] text-[#7A7A7A] hover:bg-[#F7F8F5]'
            }`}
          >
            Audited & Closed ({events.filter((e) => e.status !== 'pending_review').length})
          </button>
        </div>
      </div>

      {/* Alert Cards List with Focused Image Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => {
          const isPending = evt.status === 'pending_review';
          const isConfirmed = evt.status === 'confirmed_threat';
          const isFalsePositive = evt.status === 'false_positive';
          const isEscalated = evt.status === 'escalated';
          const autoSnap = evt.auto_snapshot;
          const currentMode = eventViewModes[evt.id] || 'focused';
          const isFocusedMode = currentMode === 'focused';

          return (
            <div
              key={evt.id}
              className={`p-4 rounded-xl border bg-white shadow-sm space-y-3.5 transition-all ${
                isPending
                  ? 'border-red-400 ring-2 ring-red-100/80 shadow-md'
                  : 'border-[#D7DADE] opacity-90'
              }`}
            >
              {/* Top Row: Auto-Snapshot Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        evt.event_type === 'blacklist_match'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      {evt.event_type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[11px] text-[#7A7A7A]">
                      Track: {evt.track_id}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {autoSnap?.snapshot_id || `SNAP-${evt.id.slice(-6)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono text-[17px] font-bold text-[#293B46] tracking-wide">
                      {evt.plate}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#55B360]">
                      ({evt.confidence.toFixed(1)}% OCR conf)
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    isPending
                      ? 'bg-red-100 text-red-700 animate-pulse border border-red-200'
                      : isConfirmed
                      ? 'bg-red-700 text-white'
                      : isFalsePositive
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {evt.status.replace('_', ' ')}
                </span>
              </div>

              {/* FOCUSED AUTO-SNAPSHOT IMAGE PREVIEW */}
              <div className="rounded-xl overflow-hidden border border-[#D7DADE] bg-black relative group">
                {/* Visual Highlight Reticle Header */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                  <div className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-red-500/50 text-white font-mono text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>AUTO-SNAPSHOT</span>
                    <span className="text-amber-300">&bull; {isFocusedMode ? 'FOCUSED CROP' : 'FULL FRAME'}</span>
                  </div>
                </div>

                {/* Top Right Controls: Toggle View & Magnify */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                  <button
                    onClick={() => toggleViewMode(evt.id)}
                    className="px-2 py-1 rounded-md bg-black/70 hover:bg-black/90 text-white font-mono text-[10px] border border-white/20 transition-colors flex items-center gap-1"
                    title={isFocusedMode ? 'Switch to Full CCTV Frame' : 'Switch to Focused Vehicle Crop'}
                  >
                    <Layers className="w-3 h-3" />
                    <span>{isFocusedMode ? 'Full Frame' : 'Focus Crop'}</span>
                  </button>

                  <button
                    onClick={() => setInspectEvent(evt)}
                    className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors shadow"
                    title="Open Full Optical Inspection Modal"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* The Image Container */}
                <div
                  onClick={() => setInspectEvent(evt)}
                  className="relative h-44 sm:h-48 w-full cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-900"
                >
                  <img
                    src={isFocusedMode ? (evt.focused_crop_url || evt.snapshot_url) : evt.snapshot_url}
                    alt={evt.plate}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      isFocusedMode ? 'scale-100' : ''
                    }`}
                  />

                  {/* Optical Targeting Reticle overlay in Focused Mode */}
                  {isFocusedMode && (
                    <div className="absolute inset-4 border border-red-500/70 rounded-lg pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                      {/* Corner marks */}
                      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-red-500" />
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-red-500" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-red-500" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-red-500" />
                    </div>
                  )}

                  {/* Bottom Plate Overlay Ribbon */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-amber-400 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow">
                      <Crosshair className="w-3 h-3 text-amber-400" />
                      <span>{evt.plate}</span>
                    </div>

                    <div className="px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px]">
                      t={evt.video_timestamp_sec}s &bull; {autoSnap?.camera_id || 'CAM-02'}
                    </div>
                  </div>
                </div>

                {/* Click-to-inspect callout banner */}
                <div
                  onClick={() => setInspectEvent(evt)}
                  className="px-3 py-1.5 bg-[#1E2E37] text-white/90 text-[11px] flex items-center justify-between border-t border-white/10 cursor-pointer hover:bg-[#293B46] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#55B360]" />
                    <span>Click to inspect focused optical zoom & OCR lens</span>
                  </span>
                  <span className="font-mono text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <span>{autoSnap?.optical_zoom || '2.4x Zoom'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Textual Details & Reason */}
              <div className="text-[12px] space-y-1 text-[#7A7A7A]">
                <p className="text-[#293B46] font-semibold leading-snug p-2 rounded-lg bg-[#F7F8F5] border border-[#D7DADE]">
                  {evt.reason_flagged}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#55B360] shrink-0" />
                    <span className="truncate">{evt.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] shrink-0">
                    <Car className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    <span>{evt.vehicle_meta.color} {evt.vehicle_meta.model_guess}</span>
                  </div>
                </div>
              </div>

              {/* Audit Trail if reviewed */}
              {!isPending && evt.reviewer_id && (
                <div className="p-2.5 rounded-lg bg-[#FBFCFA] border border-[#D7DADE] text-[11px] text-[#7A7A7A] flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[#293B46] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#55B360]" />
                    Audited by: {evt.reviewer_id}
                  </span>
                  <span className="font-mono">{evt.reviewer_action_time?.slice(0, 16).replace('T', ' ')}</span>
                </div>
              )}

              {/* Action Buttons for Pending Review */}
              {isPending && (
                <div className="pt-2 border-t border-[#D7DADE] flex items-center gap-2">
                  <button
                    onClick={() => handleReviewAction(evt.id, 'confirm')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm Threat
                  </button>

                  <button
                    onClick={() => handleReviewAction(evt.id, 'false_positive')}
                    className="flex-1 py-1.5 px-2 rounded-lg border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46] font-semibold text-[11px] transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5 text-gray-500" />
                    False Positive
                  </button>

                  <button
                    onClick={() => handleReviewAction(evt.id, 'escalate')}
                    className="py-1.5 px-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Escalate
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optical Inspection Modal */}
      <FocusedSnapshotPreviewModal
        event={inspectEvent}
        isOpen={!!inspectEvent}
        onClose={() => setInspectEvent(null)}
        onReviewAction={handleReviewAction}
      />
    </div>
  );
};

