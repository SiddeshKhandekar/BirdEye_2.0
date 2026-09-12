import React, { useState } from 'react';
import {
  X,
  Play,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Camera,
  Layers,
  TrendingUp,
  Truck,
  CheckCircle2,
  Bell,
  Award,
  Video,
  Eye,
  ShieldAlert,
  UserCheck,
  Activity,
  RotateCcw,
} from 'lucide-react';

interface GuidedDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToFeature?: (featureId: string) => void;
}

interface TourStep {
  stepNumber: number;
  title: string;
  category: 'civic' | 'security' | 'intelligence';
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
  systemAction: string;
  outcome: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'Citizen Photo Report',
    category: 'civic',
    icon: Camera,
    tagline: 'Anonymous mobile capture with GPS geotag',
    description:
      'A resident takes a geotagged snapshot of a deep pothole on Main Avenue. The system hashes the device ID into an anonymous token (e.g. #A7F3) ensuring total privacy from the start.',
    systemAction: 'Client generates cryptographic token & attaches EXIF GPS coordinates',
    outcome: 'Report queued for edge AI inference in < 300ms',
  },
  {
    stepNumber: 2,
    title: 'AI Multimodal Verification',
    category: 'civic',
    icon: Sparkles,
    tagline: 'Deep visual inspection & fraud rejection',
    description:
      'The Gemini Vision pipeline verifies whether the image actually depicts a road hazard, scoring confidence at 94.6% and filtering out blurry or fraudulent photos before municipal queues are flooded.',
    systemAction: 'Vision model classifies texture, depth distortion & asphalt fractures',
    outcome: '94.6% AI Confidence score confirmed',
  },
  {
    stepNumber: 3,
    title: 'PostGIS Spatial Deduplication',
    category: 'civic',
    icon: Layers,
    tagline: '50-meter radius spatial clustering',
    description:
      'Instead of creating duplicate work orders for the same pothole, PostGIS checks the 50m spatial radius and merges 14 citizen signals into a single unified cluster, preventing municipal spam.',
    systemAction: 'ST_DWithin spatial query executes against active issues database',
    outcome: 'Signals unified into single work order with 14 contributors',
  },
  {
    stepNumber: 4,
    title: 'Explainable Priority Calculation',
    category: 'civic',
    icon: TrendingUp,
    tagline: 'Severity x Traffic Volume x Unresolved Age',
    description:
      'The multi-factor engine weighs pothole depth, heavy transit volume, school zone proximity, and weather risk to escalate the issue from Medium to CRITICAL priority with 96/100 score.',
    systemAction: 'Priority breakdown matrix computed across 5 urban impact variables',
    outcome: 'Work order elevated to Top Priority dispatch',
  },
  {
    stepNumber: 5,
    title: 'Municipal Route Optimization',
    category: 'civic',
    icon: Truck,
    tagline: 'Traveling Salesperson solver for field trucks',
    description:
      'BirdEye solves an optimized dispatch sequence for municipal asphalt trucks, grouping nearby street repairs into an ordered route that reduces travel time and fuel consumption by 32%.',
    systemAction: 'TSP nearest-neighbor heuristic computes shortest repair path',
    outcome: '32% travel time reduction for municipal repair team',
  },
  {
    stepNumber: 6,
    title: 'Worker Resolution & Proof of Work',
    category: 'civic',
    icon: CheckCircle2,
    tagline: 'Field repair confirmation with after-photo',
    description:
      'Municipal workers arrive on site, apply cold-mix asphalt, and upload an after-repair confirmation photo to mark the cluster as Resolved.',
    systemAction: 'Status transitioned to RESOLVED; completion timestamp recorded',
    outcome: 'Work order closed in municipal command database',
  },
  {
    stepNumber: 7,
    title: 'Citizen Status Update',
    category: 'civic',
    icon: Bell,
    tagline: 'Real-time feedback loop without intrusive SMS',
    description:
      'Citizens who contributed to this issue receive an anonymous in-app notification indicating that their report was verified and fixed by the city.',
    systemAction: 'SSE event pushed to client session tokens',
    outcome: 'Contributors notified of tangible civic progress',
  },
  {
    stepNumber: 8,
    title: 'Anonymous Impact Points',
    category: 'civic',
    icon: Award,
    tagline: 'Decentralized gamification with privacy-by-design',
    description:
      'The anonymous contributor token receives +50 Impact Points. City-wide impact counters update (1,284 total contributions, 178 resolved) without ever revealing user names.',
    systemAction: 'Impact ledger credited for Anonymous Contributor #A7F3',
    outcome: '+50 points awarded; civic leaderboard ranking advanced',
  },
  {
    stepNumber: 9,
    title: 'CCTV Video Upload',
    category: 'security',
    icon: Video,
    tagline: 'Society gate & junction surveillance ingestion',
    description:
      'A society security admin uploads or streams a 15-second CCTV clip from the North Perimeter Gate to detect unauthorized vehicles and perimeter loitering.',
    systemAction: 'Browser loads video canvas for multi-frame tensor analysis',
    outcome: 'Video loaded into local computer-vision processing loop',
  },
  {
    stepNumber: 10,
    title: 'Plate Recognition & Detection',
    category: 'security',
    icon: Eye,
    tagline: 'YOLOv8 vehicle detection + EasyOCR text extraction',
    description:
      'YOLOv8 detects bounding boxes around vehicles, SORT tracks trajectories across frames, and EasyOCR extracts license plate alphanumeric characters in real time.',
    systemAction: 'Multi-stage inference: detection -> tracking -> OCR rectification',
    outcome: 'Vehicle plate DL 01 AB 4321 detected with 93% accuracy',
  },
  {
    stepNumber: 11,
    title: 'Blacklist Alert Generation',
    category: 'security',
    icon: ShieldAlert,
    tagline: 'Real-time database cross-check against police watchlists',
    description:
      'The extracted plate is matched against the local tenant Blacklist. An urgent alert is generated: "Blacklist Match: Stolen Silver Sedan - Armed Robbery Case #2024-91".',
    systemAction: 'O(1) hashed lookup against tenant watchlists',
    outcome: 'Critical security alert triggered on Command Dashboard',
  },
  {
    stepNumber: 12,
    title: 'Security Human Review',
    category: 'security',
    icon: UserCheck,
    tagline: 'Human-in-the-loop audit before police escalation',
    description:
      'Every alert requires human confirmation. The guard verifies the cropped plate snapshot, confirms or dismisses the detection, and triggers police dispatch or gate lockdown.',
    systemAction: 'Audit log entry created with guard ID & resolution decision',
    outcome: 'Alert confirmed; guard logs escalation to local ward patrol',
  },
  {
    stepNumber: 13,
    title: 'City Pulse Update',
    category: 'intelligence',
    icon: Activity,
    tagline: 'Living urban index reflects real-time remediation',
    description:
      'The composite City Health indicator updates in real time (87 -> 91 / 100), reflecting safer streets, resolved infrastructure bottlenecks, and zero undetected security breaches.',
    systemAction: '5-dimensional health index recalculated across tenant boundary',
    outcome: 'Living city map pulse reflects clean, secure neighborhood',
  },
];

export const GuidedDemoTour: React.FC<GuidedDemoTourProps> = ({
  isOpen,
  onClose,
  onJumpToFeature,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];
  const IconComponent = currentStep.icon;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#293B46]/50 backdrop-blur-[3px] animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#D7DADE] shadow-birdeye-floating overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Progress Track */}
        <div className="h-1.5 w-full bg-[#E5E7EB]">
          <div
            className="h-full bg-[#55B360] transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF8F0] border border-[#55B360]/30 flex items-center justify-center text-[#55B360]">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-[#293B46] leading-tight">
                  Experience BirdEye
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-[#293B46] text-white">
                  Step {currentStep.stepNumber} of {TOUR_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A7A]">
                60-Second Full-Stack Hackathon Walkthrough
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

        {/* Tour Step Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Visual Step Card */}
          <div className="p-5 rounded-2xl bg-[#FBFCFA] border border-[#D7DADE] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30 flex items-center justify-center">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#55B360]">
                    {currentStep.category.toUpperCase()} INTELLIGENCE LOOP
                  </span>
                  <h3 className="text-[18px] font-bold text-[#293B46] leading-tight">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-[#7A7A7A] italic hidden sm:inline">
                {currentStep.tagline}
              </span>
            </div>

            <p className="text-[13px] text-[#293B46] leading-relaxed pt-1">
              {currentStep.description}
            </p>

            {/* Architecture Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-[11px]">
              <div className="p-3 rounded-xl bg-white border border-[#D7DADE] space-y-1">
                <span className="font-bold uppercase tracking-wider text-[#7A7A7A] block">
                  Under the Hood
                </span>
                <p className="text-[#293B46] leading-snug">{currentStep.systemAction}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[#55B360] block">
                  Verified Outcome
                </span>
                <p className="font-semibold text-[#293B46] leading-snug">{currentStep.outcome}</p>
              </div>
            </div>
          </div>

          {/* Quick Scene Selector Ribbon */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">
              Jump to Stage:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  type="button"
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    idx === currentStepIdx
                      ? 'bg-[#55B360] text-white shadow-sm'
                      : 'bg-[#F7F8F5] text-[#7A7A7A] hover:bg-[#EEF8F0] hover:text-[#293B46]'
                  }`}
                >
                  {s.stepNumber}. {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[12px] font-semibold text-[#7A7A7A] hover:text-[#293B46] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStepIdx === 0}
              onClick={handlePrev}
              className="px-3.5 py-2 rounded-xl border border-[#D7DADE] disabled:opacity-40 hover:bg-[#F7F8F5] text-[#293B46] text-[12px] font-semibold transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStepIdx < TOUR_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white text-[12px] font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#293B46] hover:bg-[#293B46]/90 text-white text-[12px] font-bold transition-colors shadow-sm"
              >
                Start Exploring Map
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
