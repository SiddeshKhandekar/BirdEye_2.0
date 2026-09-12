import {
  DetectedVehicleTrack,
  SecurityEvent,
} from '../../types';
import { directusStore } from '../directus/store';

export interface VideoProcessingResult {
  fileName: string;
  durationSec: number;
  fps: number;
  totalFramesAnalyzed: number;
  vehiclesDetectedCount: number;
  tracks: DetectedVehicleTrack[];
  flaggedEvents: SecurityEvent[];
}

export class ComputerVisionSecurityService {
  /**
   * Processes CCTV video feed or sample clip.
   * Runs vehicle detection (YOLOv8 simulation), tracking (SORT simulation),
   * license plate reading (EasyOCR simulation), loitering check, and blacklist check.
   */
  public async processCCTVVideo(
    videoSource: string | File,
    options: {
      loiteringThresholdSec: number; // e.g. 30 seconds
      detectionConfidenceMin?: number;
    }
  ): Promise<VideoProcessingResult> {
    // Call server endpoint or realistic client-side pipeline
    try {
      const response = await fetch('/api/security/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: typeof videoSource === 'string' ? videoSource : videoSource.name,
          thresholdSec: options.loiteringThresholdSec,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data as VideoProcessingResult;
      }
    } catch (err) {
      console.warn('Backend CV endpoint not reachable, running deterministic pipeline simulation:', err);
    }

    // Realistic pipeline execution simulation
    await new Promise((resolve) => setTimeout(resolve, 1600));

    const threshold = options.loiteringThresholdSec || 30;
    const blacklist = directusStore.getBlacklist();

    // Simulated detected tracks from CCTV camera frame
    const tracks: DetectedVehicleTrack[] = [
      {
        track_id: 'Vehicle #01',
        class_name: 'car',
        bbox: [12, 28, 48, 72], // x1, y1, x2, y2 %
        confidence: 0.94,
        plate: 'MH14CD5678',
        plate_confidence: 93.4,
        stationary_duration_sec: 48, // Exceeds 30s threshold
        is_loitering: 48 >= threshold,
        is_blacklisted: false,
        color: 'Dark Grey',
        snapshot_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
        focused_crop_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=85',
      },
      {
        track_id: 'Vehicle #02',
        class_name: 'van',
        bbox: [54, 38, 86, 82],
        confidence: 0.91,
        plate: 'MH01EF9012',
        plate_confidence: 89.2,
        stationary_duration_sec: 14,
        is_loitering: 14 >= threshold,
        is_blacklisted: false,
        color: 'Silver',
        snapshot_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
        focused_crop_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=85',
      },
      {
        track_id: 'Vehicle #03',
        class_name: 'car',
        bbox: [22, 18, 62, 64],
        confidence: 0.97,
        plate: 'MH12AB1234', // Blacklist match!
        plate_confidence: 96.8,
        stationary_duration_sec: 12,
        is_loitering: 12 >= threshold,
        is_blacklisted: true,
        color: 'White',
        snapshot_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        focused_crop_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=85',
      },
    ];

    // Check loitering and blacklist flags
    const flaggedEvents: SecurityEvent[] = [];
    const tenant = directusStore.getCurrentTenant();

    tracks.forEach((track) => {
      // 1. Blacklist check
      const blacklisted = blacklist.find((b) => b.plate === track.plate);
      if (blacklisted) {
        track.is_blacklisted = true;
        const autoSnap = {
          snapshot_id: `SNAP-${Date.now().toString().slice(-6)}`,
          camera_id: 'CAM-02-NORTH',
          camera_name: 'North Gate 2 Optical Boom Barrier Sensor Node',
          full_frame_url: track.snapshot_url,
          focused_crop_url: track.focused_crop_url || track.snapshot_url,
          captured_at: new Date().toISOString(),
          video_timestamp_sec: 4.2,
          bbox: track.bbox,
          optical_zoom: '2.4x Focused Optical Zoom',
          shutter_mode: 'auto_trigger_on_flag' as const,
          trigger_rule: 'Rule #SEC-01: Blacklist Plate Identification',
          resolution: '1080p Optical @ 30FPS',
          visual_highlight_color: 'red' as const,
        };
        track.auto_snapshot = autoSnap;

        const event = directusStore.addSecurityEvent({
          plate: track.plate!,
          plate_confidence: track.plate_confidence || 95.0,
          event_type: 'blacklist_match',
          track_id: track.track_id,
          snapshot_url: track.snapshot_url,
          focused_crop_url: track.focused_crop_url,
          auto_snapshot: autoSnap,
          video_timestamp_sec: 4.2,
          timestamp: new Date().toISOString(),
          loitering_duration_sec: track.stationary_duration_sec,
          status: 'pending_review',
          reason_flagged: `CRITICAL BLACKLIST MATCH: License plate ${track.plate} detected. Matched police bulletin (${blacklisted.reason}).`,
          confidence: track.plate_confidence || 96.0,
          location: {
            lat: tenant.center.lat + 0.0003,
            lng: tenant.center.lng - 0.0002,
            address: `${tenant.name} - Automated Surveillance Node A`,
          },
          vehicle_meta: {
            type: track.class_name,
            color: track.color,
            model_guess: blacklisted.vehicle_type,
          },
          routing_department: 'Police & Security Wing',
        });
        flaggedEvents.push(event);
      } else if (track.is_loitering) {
        // 2. Loitering check
        const autoSnap = {
          snapshot_id: `SNAP-${Date.now().toString().slice(-6)}`,
          camera_id: 'CAM-04-PERIMETER',
          camera_name: 'Perimeter Lane East Optical Surveillance',
          full_frame_url: track.snapshot_url,
          focused_crop_url: track.focused_crop_url || track.snapshot_url,
          captured_at: new Date().toISOString(),
          video_timestamp_sec: 18.0,
          bbox: track.bbox,
          optical_zoom: '2.0x Focused Optical Zoom',
          shutter_mode: 'auto_trigger_on_flag' as const,
          trigger_rule: `Rule #SEC-08: Stationary Loitering Threshold (${track.stationary_duration_sec}s > ${threshold}s)`,
          resolution: '1080p Optical @ 30FPS',
          visual_highlight_color: 'amber' as const,
        };
        track.auto_snapshot = autoSnap;

        const event = directusStore.addSecurityEvent({
          plate: track.plate || 'UNKNOWN',
          plate_confidence: track.plate_confidence || 90.0,
          event_type: 'loitering',
          track_id: track.track_id,
          snapshot_url: track.snapshot_url,
          focused_crop_url: track.focused_crop_url,
          auto_snapshot: autoSnap,
          video_timestamp_sec: 18.0,
          timestamp: new Date().toISOString(),
          loitering_duration_sec: track.stationary_duration_sec,
          status: 'pending_review',
          reason_flagged: `POSSIBLE LOITERING: Vehicle remained stationary for ${track.stationary_duration_sec}s (configured threshold: ${threshold}s).`,
          confidence: track.confidence * 100,
          location: {
            lat: tenant.center.lat - 0.0004,
            lng: tenant.center.lng + 0.0003,
            address: `${tenant.name} - Perimeter Surveillance Node C`,
          },
          vehicle_meta: {
            type: track.class_name,
            color: track.color,
            model_guess: 'Passenger Vehicle',
          },
          routing_department: 'Society Security Staff',
        });
        flaggedEvents.push(event);
      }
    });

    return {
      fileName: typeof videoSource === 'string' ? videoSource : videoSource.name,
      durationSec: 45,
      fps: 30,
      totalFramesAnalyzed: 1350,
      vehiclesDetectedCount: tracks.length,
      tracks,
      flaggedEvents,
    };
  }
}

export const computerVisionSecurityService = new ComputerVisionSecurityService();
