/**
 * BirdEye Domain Types and Schema Contracts
 * Follows Directus & PostGIS collection schemas
 */

export type TenantId = 'tenant_a' | 'tenant_b';

export interface Tenant {
  id: TenantId;
  name: string;
  type: 'residential_society' | 'municipal_zone';
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  description: string;
}

export type IssueCategory = 'pothole' | 'garbage' | 'streetlight' | 'water' | 'other';

export type IssueStatus = 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export type PrivacyMode = 'anonymous' | 'private';

export interface IssueContributor {
  contributor_token: string; // e.g. "Anonymous Contributor #A7F3"
  timestamp: string;
  points_awarded: number;
  privacy_mode: PrivacyMode;
}

export interface PriorityFactorBreakdown {
  citizen_reports: number;
  severity: number;
  traffic_exposure: number;
  time_unresolved: number;
  sensitive_location: number;
  total_score: number;
  recommended_action: string;
}

export interface Issue {
  id: string;
  tenant_id: TenantId;
  category: IssueCategory;
  title: string;
  description: string;
  image_url: string;
  location: GeoLocation;
  status: IssueStatus;
  priority: PriorityLevel;
  ai_verified: boolean;
  ai_confidence: number;
  ai_model?: string;
  ai_model_version?: string;
  ai_evidence?: string;
  detected_category?: string;
  cluster_id: string;
  contributor_count: number;
  contributors: IssueContributor[];
  department_id: string;
  department_name: string;
  estimated_effort_hours: number;
  created_at: string;
  resolved_at?: string;
  privacy_mode: PrivacyMode;
  anonymous_contributor_token?: string;
  priority_factors?: PriorityFactorBreakdown;
  source_id?: string;
  source_record_id?: string;
  source_timestamp?: string;
  ingestion_timestamp?: string;
  work_order_id?: string;
  after_image_url?: string;
  resolution_notes?: string;
}

export interface IssueCluster {
  id: string;
  tenant_id: TenantId;
  category: IssueCategory;
  title: string;
  center_location: GeoLocation;
  issues: Issue[];
  contributor_count: number;
  radius_meters: number;
  status: IssueStatus;
  priority: PriorityLevel;
  department_name: string;
  priority_factors?: PriorityFactorBreakdown;
}

export interface PredictiveHotspot {
  id: string;
  tenant_id: TenantId;
  category: IssueCategory;
  title: string;
  risk_score: number; // e.g. 78%
  center: GeoLocation;
  radius_meters: number;
  reasons: string[];
  recommended_prevention: string;
  ai_confidence: number;
}

export type ScaleLevel = 'street' | 'neighborhood' | 'ward' | 'city';

export interface CityHealthDimensions {
  overall: number; // dynamically calculated, never fabricated
  infrastructure: number;
  cleanliness: number;
  mobility: number;
  response: number;
  safety: number;
  active_issues: number;
  verified_issues: number;
  resolved_today: number;
  security_events: number;
  data_coverage_pct: number; // e.g. 64% - explicit coverage indicator
  verified_records_count: number;
  calculated_at: string;
  data_coverage_status: 'sufficient' | 'partial' | 'insufficient';
  is_calculated: boolean;
}

export interface DataSource {
  id: string;
  source_name: string;
  provider: string;
  dataset_name: string;
  source_url: string;
  license: string;
  data_type: 'api' | 'gis' | 'geojson' | 'csv' | 'osm' | 'cctv' | 'citizen';
  geographic_scope: string;
  refresh_frequency: string;
  last_updated: string;
  last_ingested: string;
  status: 'healthy' | 'degraded' | 'offline' | 'syncing';
  records_count: number;
  provenance: string;
  description: string;
}

export interface DataIngestionRun {
  id: string;
  source_id: string;
  source_name: string;
  started_at: string;
  completed_at: string;
  records_received: number;
  records_inserted: number;
  records_updated: number;
  records_rejected: number;
  status: 'success' | 'partial' | 'failed';
  error_summary?: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'police_station' | 'bus_stop' | 'park' | 'water_facility' | 'waste_facility' | 'streetlight';
  location: GeoLocation;
  osm_id?: string;
  source_id: string;
  distance_to_nearest_issue_m?: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface EnvironmentalSignal {
  temperature_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  weather_condition: string;
  air_quality_index: number;
  air_quality_label: 'Good' | 'Moderate' | 'Poor' | 'Unhealthy';
  wind_speed_kmh: number;
  retrieved_at: string;
  source_name: string;
  risk_assessment?: {
    risk_level: 'low' | 'moderate' | 'high';
    title: string;
    reason: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action:
    | 'report_created'
    | 'ai_verified'
    | 'cluster_created'
    | 'issue_assigned'
    | 'route_generated'
    | 'work_started'
    | 'issue_resolved'
    | 'security_event_created'
    | 'security_event_reviewed';
  actor: string;
  entity_type: 'issue' | 'cluster' | 'route' | 'security_event' | 'work_order';
  entity_id: string;
  details: string;
  source_id?: string;
}

export interface WorkOrder {
  id: string;
  issue_id: string;
  issue_title: string;
  category: IssueCategory;
  department_id: string;
  department_name: string;
  assigned_to: string;
  status: 'assigned' | 'in_progress' | 'resolved';
  priority: PriorityLevel;
  assigned_at: string;
  started_at?: string;
  resolved_at?: string;
  worker_notes?: string;
  before_image_url: string;
  after_image_url?: string;
  location: GeoLocation;
  verification_status: 'pending_verification' | 'verified_resolved';
}

export interface AnonymousCivicImpact {
  total_anonymous_contributions: number;
  total_issues_verified: number;
  total_issues_resolved: number;
  neighborhoods_improved: number;
  session_token: string;
  session_points: number;
  session_reports_submitted: number;
  session_issues_contributed: number;
  session_neighborhood_alerts: number;
}

export interface Department {
  id: string;
  name: string;
  code: 'sanitation' | 'civic_maintenance' | 'roads_infrastructure' | 'police_security';
  contact_officer: string;
  active_teams: number;
}

export interface RouteStop {
  stop_index: number;
  issue_id: string;
  category: IssueCategory;
  title: string;
  location: GeoLocation;
  priority: PriorityLevel;
  estimated_stop_duration_min: number;
}

export interface OptimizedRoute {
  id: string;
  tenant_id: TenantId;
  department_id: string;
  department_name: string;
  stops: RouteStop[];
  total_distance_km: number;
  est_duration_min: number;
  status: 'planned' | 'dispatched' | 'completed';
  created_at: string;
  path_coordinates: [number, number][]; // lat, lng pairs
}

export interface BlacklistEntry {
  plate: string;
  vehicle_type: string;
  reason: string;
  added_at: string;
  alert_level: 'high' | 'critical';
  notes: string;
}

export type SecurityEventType = 'blacklist_match' | 'loitering' | 'unauthorized_parking' | 'suspicious_motion';

export type ReviewStatus = 'pending_review' | 'confirmed_threat' | 'false_positive' | 'escalated';

export interface AutoSnapshotTelemetry {
  snapshot_id: string; // e.g. "SNAP-2026-9482"
  camera_id: string; // e.g. "CAM-GATE2-NORTH"
  camera_name: string; // e.g. "Gate 2 Automated Boom Barrier CCTV"
  full_frame_url: string; // Full CCTV scene
  focused_crop_url: string; // High-res focused vehicle crop
  plate_crop_url?: string; // Focused plate zoom
  captured_at: string; // ISO timestamp
  video_timestamp_sec: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] %
  optical_zoom: string; // e.g. "2.4x Focused Optical Zoom"
  shutter_mode: 'auto_trigger_on_flag' | 'manual_override';
  trigger_rule: string; // e.g. "Rule #SEC-04: Blacklist Plate Match"
  resolution: string; // e.g. "1080p Optical @ 30FPS"
  visual_highlight_color: 'red' | 'amber';
}

export interface DetectedVehicleTrack {
  track_id: string; // e.g. "Vehicle #01"
  class_name: 'car' | 'motorcycle' | 'van' | 'truck' | 'auto';
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] relative percentages 0..100
  confidence: number;
  plate?: string;
  plate_confidence?: number;
  stationary_duration_sec: number;
  is_loitering: boolean;
  is_blacklisted: boolean;
  color: string;
  snapshot_url: string;
  focused_crop_url?: string;
  auto_snapshot?: AutoSnapshotTelemetry;
}

export interface SecurityEvent {
  id: string;
  tenant_id: TenantId;
  plate: string;
  plate_confidence: number;
  event_type: SecurityEventType;
  track_id: string;
  snapshot_url: string;
  focused_crop_url?: string;
  auto_snapshot?: AutoSnapshotTelemetry;
  video_timestamp_sec: number;
  timestamp: string;
  loitering_duration_sec: number;
  status: ReviewStatus;
  reviewer_id?: string;
  reviewer_action_time?: string;
  reason_flagged: string;
  confidence: number;
  location: GeoLocation;
  vehicle_meta: {
    type: string;
    color: string;
    model_guess: string;
  };
  routing_department?: string;
}

export interface CitizenLeaderboardUser {
  id: string;
  tenant_id: TenantId;
  name: string;
  avatar_url?: string;
  rank: number;
  points: number;
  reports_submitted: number;
  issues_resolved: number;
  badges: string[];
}

export interface CivicVerificationResult {
  verified: boolean;
  detected_category: IssueCategory;
  confidence: number;
  explanation: string;
  bounding_box?: [number, number, number, number];
  tags: string[];
}

export interface SpatialDeduplicationCheck {
  is_duplicate: boolean;
  existing_issue?: Issue;
  distance_meters?: number;
  merged_into_cluster_id?: string;
  cluster_contributors_count?: number;
  points_awarded?: number;
}

export interface LangChainRoutingDecision {
  record_id: string;
  record_type: 'civic_issue' | 'security_alert';
  assigned_department: string;
  routing_confidence: number;
  priority_assigned: PriorityLevel;
  rationale: string;
  action_plan: string[];
  dispatched_at: string;
}
