import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  Sparkles,
  Award,
  ChevronRight,
  RefreshCw,
  Layers,
  Lock,
  ShieldCheck,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { IssueCategory, Issue, PrivacyMode } from '../../types';
import { civicVerificationService } from '../../services/ai-civic/verificationService';
import { directusStore } from '../../services/directus/store';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lat: number; lng: number };
  onIssueCreated: (issue: Issue, isDuplicate: boolean) => void;
}

const DEMO_PRESET_IMAGES: Array<{
  category: IssueCategory;
  label: string;
  url: string;
  desc: string;
}> = [
  {
    category: 'pothole',
    label: 'Deep Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    desc: 'Severe road crater on main carriage path with fractured asphalt edges.',
  },
  {
    category: 'garbage',
    label: 'Overflowing Waste Pile',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    desc: 'Commercial garbage accumulation blocking pedestrian sidewalk.',
  },
  {
    category: 'streetlight',
    label: 'Broken Streetlight',
    url: 'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?auto=format&fit=crop&w=800&q=80',
    desc: 'High-mast luminaire damaged and dark after storm.',
  },
  {
    category: 'water',
    label: 'Water Pipeline Burst',
    url: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80',
    desc: 'Drinking water pipeline ruptured flooding intersection.',
  },
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  userCoords,
  onIssueCreated,
}) => {
  // Steps: 1: Photo, 2: Location, 3: Category, 4: Privacy, 5: Verify & Deduplicate, 6: Submitted
  const [step, setStep] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>(DEMO_PRESET_IMAGES[0].url);
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [description, setDescription] = useState<string>('');
  const [locationAddress, setLocationAddress] = useState<string>('Near Gate 2, Internal Ring Road');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(userCoords);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('anonymous');

  // AI Verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    confidence: number;
    detectedCategory: string;
    explanation: string;
  } | null>(null);

  // Deduplication state
  const [dedupResult, setDedupResult] = useState<{
    isDuplicate: boolean;
    existingIssue?: Issue;
    distanceMeters?: number;
    contributorsCount?: number;
  } | null>(null);

  // Post-submission summary
  const [submittedIssue, setSubmittedIssue] = useState<Issue | null>(null);
  const [wasDuplicate, setWasDuplicate] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESET_IMAGES[0]) => {
    setImageUrl(preset.url);
    setCategory(preset.category);
    setDescription(preset.desc);
  };

  const handleRunAiVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    const res = await civicVerificationService.verifyImage(imageUrl, category, description);

    setIsVerifying(false);
    setVerificationResult({
      verified: res.verified,
      confidence: res.confidence,
      detectedCategory: res.detected_category,
      explanation: res.explanation,
    });

    if (res.verified) {
      // Spatial Deduplication Check (PostGIS 50m radius)
      const dedup = directusStore.checkSpatialDeduplication(coords.lat, coords.lng, category);
      if (dedup.is_duplicate && dedup.existing_issue) {
        setDedupResult({
          isDuplicate: true,
          existingIssue: dedup.existing_issue,
          distanceMeters: dedup.distance_meters,
          contributorsCount: dedup.cluster_contributors_count,
        });
      } else {
        setDedupResult({
          isDuplicate: false,
        });
      }
    }
  };

  const handleFinalSubmit = () => {
    const res = directusStore.addReport({
      category,
      title: `${category.toUpperCase()}: ${locationAddress.slice(0, 32)}`,
      description: description || `Anonymous citizen signal reported ${category} at ${locationAddress}`,
      image_url: imageUrl,
      lat: coords.lat,
      lng: coords.lng,
      address: locationAddress,
      ai_confidence: verificationResult?.confidence || 94.0,
      privacy_mode: privacyMode,
    });

    setSubmittedIssue(res.issue);
    setWasDuplicate(res.isDuplicate);
    onIssueCreated(res.issue, res.isDuplicate);
    setStep(6); // Show anonymous confirmation screen
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#293B46]/40 backdrop-blur-[2px] animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#D7DADE] shadow-birdeye-floating overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Privacy Indicator */}
        <div className="px-5 py-2 bg-[#EEF8F0] border-b border-[#55B360]/30 flex items-center justify-between text-[11px] font-semibold text-[#293B46]">
          <div className="flex items-center gap-1.5 text-[#55B360]">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider uppercase">Anonymous Report Protected</span>
          </div>
          <span className="text-[#7A7A7A] hidden sm:inline text-[10px]">
            Zero personal identifiers collected
          </span>
        </div>

        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF8F0] border border-[#55B360]/30 flex items-center justify-center text-[#55B360]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#293B46] leading-tight">Report Civic Issue</h2>
              <p className="text-[11px] text-[#7A7A7A]">
                Under 1-minute anonymous verification & spatial deduplication
              </p>
            </div>
          </div>
          <button
            id="btn-close-report-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F7F8F5] text-[#7A7A7A] hover:text-[#293B46] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Pills */}
        {step <= 5 && (
          <div className="px-6 py-2.5 bg-white border-b border-[#D7DADE]/60 flex items-center justify-between text-[10px] font-semibold text-[#7A7A7A] uppercase tracking-wider overflow-x-auto gap-1">
            <span className={step >= 1 ? 'text-[#55B360] font-bold' : ''}>1. Photo</span>
            <span>&bull;</span>
            <span className={step >= 2 ? 'text-[#55B360] font-bold' : ''}>2. Location</span>
            <span>&bull;</span>
            <span className={step >= 3 ? 'text-[#55B360] font-bold' : ''}>3. Category</span>
            <span>&bull;</span>
            <span className={step >= 4 ? 'text-[#55B360] font-bold' : ''}>4. Privacy</span>
            <span>&bull;</span>
            <span className={step >= 5 ? 'text-[#55B360] font-bold' : ''}>5. AI Verify</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Step 1: Photo selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#293B46]">
                  Photograph or Video Capture
                </label>
                <p className="text-[12px] text-[#7A7A7A] mt-0.5">
                  Select a test image from our library or upload your own photo.
                </p>
              </div>

              {/* Photo Preview */}
              <div className="relative rounded-xl overflow-hidden border border-[#D7DADE] bg-[#F7F8F5] h-48 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Defect Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#7A7A7A]">
                    <Camera className="w-8 h-8 text-[#969696]" />
                    <span className="text-[12px]">No image selected</span>
                  </div>
                )}
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-wider">
                  Select Presets for Fast Judging:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-all flex items-center gap-2 ${
                        imageUrl === preset.url
                          ? 'border-[#55B360] bg-[#EEF8F0] font-semibold text-[#293B46]'
                          : 'border-[#D7DADE] bg-white hover:bg-[#FBFCFA] text-[#7A7A7A]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-6 h-6 rounded object-cover shrink-0"
                      />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload input */}
              <div className="pt-1">
                <label className="flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-[#D7DADE] rounded-xl hover:bg-[#FBFCFA] cursor-pointer text-[12px] font-medium text-[#7A7A7A]">
                  <UploadCloud className="w-4 h-4 text-[#55B360]" />
                  <span>Upload local camera snapshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-step1-next"
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Continue to Location</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#293B46]">
                  Geotag Location
                </label>
                <p className="text-[12px] text-[#7A7A7A] mt-0.5">
                  Confirm the precise geographic coordinates for municipal dispatch.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] space-y-3">
                <div className="flex items-center gap-2 text-[12px]">
                  <MapPin className="w-4 h-4 text-[#55B360] shrink-0" />
                  <span className="font-mono text-[11px] text-[#7A7A7A]">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (High GPS Accuracy)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#7A7A7A] uppercase">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Near Main Gate 2, Internal Ring Road"
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#D7DADE] rounded-lg focus:outline-none focus:border-[#55B360]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46] text-[13px] font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="btn-step2-next"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Continue to Category</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Category & Description */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#293B46]">
                  Select Infrastructure Category
                </label>
                <p className="text-[12px] text-[#7A7A7A] mt-0.5">
                  AI will cross-verify your chosen category against the photo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'pothole', label: 'Pothole / Road' },
                  { id: 'garbage', label: 'Garbage Overflow' },
                  { id: 'streetlight', label: 'Broken Streetlight' },
                  { id: 'water', label: 'Water Leakage' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as IssueCategory)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      category === item.id
                        ? 'border-[#55B360] bg-[#EEF8F0] shadow-sm'
                        : 'border-[#D7DADE] bg-white hover:bg-[#FBFCFA]'
                    }`}
                  >
                    <span className="font-semibold text-[13px] text-[#293B46] block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#7A7A7A] capitalize">{item.id}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-semibold text-[#293B46]">
                  Optional Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe severity, hazards, or immediate risks..."
                  className="w-full px-3 py-2 text-[13px] bg-[#FBFCFA] border border-[#D7DADE] rounded-lg focus:outline-none focus:border-[#55B360]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46] text-[13px] font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="btn-step3-next"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Choose Privacy</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Privacy Selection */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#293B46]">
                  Report Privacy Options
                </label>
                <p className="text-[12px] text-[#7A7A7A] mt-0.5">
                  Your report can help fix your neighborhood without revealing who you are.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option A: Anonymous */}
                <label
                  onClick={() => setPrivacyMode('anonymous')}
                  className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${
                    privacyMode === 'anonymous'
                      ? 'border-[#55B360] bg-[#EEF8F0]/70 ring-1 ring-[#55B360]'
                      : 'border-[#D7DADE] bg-white hover:bg-[#FBFCFA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacyMode === 'anonymous'}
                      onChange={() => setPrivacyMode('anonymous')}
                      className="mt-1 accent-[#55B360]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px] text-[#293B46]">
                          ANONYMOUS REPORT
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#55B360] text-white">
                          RECOMMENDED
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7A7A7A] leading-snug">
                        Your identity is <strong>not shown publicly</strong> or to municipal workers.
                        Only your anonymous contributor token is attached to this cluster.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option B: Private */}
                <label
                  onClick={() => setPrivacyMode('private')}
                  className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${
                    privacyMode === 'private'
                      ? 'border-[#55B360] bg-[#EEF8F0]/70 ring-1 ring-[#55B360]'
                      : 'border-[#D7DADE] bg-white hover:bg-[#FBFCFA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacyMode === 'private'}
                      onChange={() => setPrivacyMode('private')}
                      className="mt-1 accent-[#55B360]"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-[13px] text-[#293B46] block">
                        PRIVATE REPORT
                      </span>
                      <p className="text-[12px] text-[#7A7A7A] leading-snug">
                        Your identity is retained in a secure vault solely for authorized follow-up
                        with municipal ward coordinators if more details are needed.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Microcopy Callout */}
              <div className="p-3 rounded-xl bg-[#F7F8F5] border border-[#D7DADE] flex items-center gap-2.5 text-[12px] text-[#293B46]">
                <ShieldCheck className="w-4 h-4 text-[#55B360] shrink-0" />
                <span>
                  <strong>Privacy Guaranteed:</strong> Field workers only receive issue coordinates and
                  infrastructure photos.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46] text-[13px] font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="btn-step4-next"
                  onClick={() => {
                    setStep(5);
                    handleRunAiVerification();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: AI Verification & PostGIS Deduplication Screen */}
          {step === 5 && (
            <div className="space-y-4">
              {/* AI Verification Scanner */}
              <div className="relative rounded-xl border border-[#D7DADE] bg-[#FBFCFA] p-4 overflow-hidden">
                {isVerifying ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="relative w-16 h-16 rounded-xl bg-white border border-[#D7DADE] shadow-sm flex items-center justify-center overflow-hidden">
                      <Sparkles className="w-8 h-8 text-[#55B360] animate-pulse" />
                      <div className="absolute inset-x-0 h-1 bg-[#55B360] shadow-[0_0_8px_#55B360] ai-scanner-bar" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#293B46]">
                        AI Verification in Progress
                      </h4>
                      <p className="text-[12px] text-[#7A7A7A]">
                        Analyzing visual texture, geometry & confirming {category}...
                      </p>
                    </div>
                  </div>
                ) : verificationResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {verificationResult.verified ? (
                          <div className="w-6 h-6 rounded-full bg-[#EEF8F0] text-[#55B360] flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-[13px] font-bold uppercase tracking-wider">
                          {verificationResult.verified ? 'AI VERIFIED' : 'AI REJECTED'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#D7DADE] text-[11px] font-mono font-bold text-[#293B46]">
                        {verificationResult.confidence.toFixed(1)}% Confidence
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-[#D7DADE] text-[12px] text-[#293B46] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#7A7A7A]">Detected defect:</span>
                        <span className="font-semibold capitalize text-[#55B360]">
                          {verificationResult.detectedCategory}
                        </span>
                      </div>
                      <p className="text-[#7A7A7A] leading-relaxed pt-1">
                        {verificationResult.explanation}
                      </p>
                    </div>

                    {!verificationResult.verified && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
                        Image does not sufficiently match the selected category. Only verified
                        infrastructure defects can be submitted to prevent municipal spam.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Spatial Deduplication Engine Output */}
              {verificationResult?.verified && dedupResult && (
                <div className="space-y-3 animate-fadeIn">
                  {dedupResult.isDuplicate && dedupResult.existingIssue ? (
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-[13px]">
                        <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Spatial Deduplication: Existing Cluster Within 50m</span>
                      </div>
                      <p className="text-[12px] text-amber-900 leading-snug">
                        PostGIS detected an active verified report within{' '}
                        <strong>{dedupResult.distanceMeters} meters</strong>. Your report will
                        amplify this existing work order priority!
                      </p>

                      <div className="p-2.5 rounded-lg bg-white/90 border border-amber-200/80 text-[12px] space-y-1">
                        <div className="font-semibold text-[#293B46]">
                          {dedupResult.existingIssue.title}
                        </div>
                        <div className="flex items-center justify-between text-[#7A7A7A] text-[11px]">
                          <span>
                            Current Contributors: {dedupResult.contributorsCount} anonymous citizens
                          </span>
                          <span className="capitalize font-medium text-amber-700">
                            Status: {dedupResult.existingIssue.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          +15 Shared Cluster Points
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 space-y-1">
                      <div className="flex items-center gap-2 text-[#55B360] font-bold text-[13px]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>New Unique Issue Identified</span>
                      </div>
                      <p className="text-[12px] text-[#293B46] leading-snug">
                        No conflicting reports found within 50 meters. A new municipal tracking cluster
                        will be created.
                      </p>
                      <div className="text-[11px] font-semibold text-[#55B360] pt-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        +25 Points for Verified First Report
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl border border-[#D7DADE] hover:bg-[#F7F8F5] text-[#293B46] text-[13px] font-semibold transition-colors"
                >
                  Back
                </button>

                {verificationResult && !verificationResult.verified ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setVerificationResult(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#293B46] hover:bg-[#293B46]/90 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Different Photograph
                  </button>
                ) : (
                  <button
                    id="btn-confirm-submission"
                    disabled={isVerifying || !verificationResult?.verified}
                    onClick={handleFinalSubmit}
                    className="flex-1 py-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] disabled:opacity-50 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {dedupResult?.isDuplicate
                      ? 'Merge & Award +15 Points'
                      : 'Submit Verified Report (+25 Pts)'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Anonymous Confirmation Screen */}
          {step === 6 && submittedIssue && (
            <div className="py-4 space-y-5 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF8F0] border border-[#55B360]/30 mx-auto flex items-center justify-center text-[#55B360] shadow-sm">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#55B360] px-2.5 py-0.5 rounded-full bg-[#EEF8F0]">
                  {wasDuplicate ? 'Cluster Signal Merged' : 'New Cluster Registered'}
                </span>
                <h3 className="text-[18px] font-bold text-[#293B46] pt-1">
                  REPORT SUBMITTED
                </h3>
                <p className="text-[13px] text-[#7A7A7A] max-w-sm mx-auto">
                  Your identity remains private. Your report is now helping BirdEye understand this area.
                </p>
              </div>

              {/* Anonymous Session Token Box */}
              <div className="p-4 rounded-xl bg-[#FBFCFA] border border-[#D7DADE] max-w-sm mx-auto text-left space-y-2 text-[12px]">
                <div className="flex items-center justify-between text-[#7A7A7A]">
                  <span>Contributor Token:</span>
                  <span className="font-mono font-bold text-[#293B46]">
                    {submittedIssue.anonymous_contributor_token || 'Anon Contributor #A7F3'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#7A7A7A]">
                  <span>Assigned Dept:</span>
                  <span className="font-semibold text-[#293B46]">
                    {submittedIssue.department_name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#7A7A7A]">
                  <span>Municipal Priority:</span>
                  <span className="font-semibold uppercase text-[#55B360]">
                    {submittedIssue.priority}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#293B46] hover:bg-[#293B46]/90 text-white font-semibold text-[13px] transition-colors shadow-sm"
              >
                View on Living Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
