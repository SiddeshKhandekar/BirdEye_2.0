import React from 'react';

interface BirdEyeLogoProps {
  className?: string;
  showText?: boolean;
}

export const BirdEyeLogo: React.FC<BirdEyeLogoProps> = ({ className = 'h-8', showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#293B46] shadow-sm">
        {/* Stylized BirdEye Optical Iris & Radar Aperture */}
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
          {/* Outer radar sweep arc */}
          <path
            d="M5 16C5 9.92487 9.92487 5 16 5C22.0751 5 27 9.92487 27 16"
            stroke="#55B360"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Central watchful pupil */}
          <circle cx="16" cy="16" r="4.5" fill="#55B360" />
          <circle cx="17.5" cy="14.5" r="1.5" fill="#FFFFFF" />
          {/* Subtle horizontal sensor beam */}
          <line x1="8" y1="16" x2="24" y2="16" stroke="#77BE86" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
        {/* Live indicator pip */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#55B360] ring-2 ring-white animate-pulse" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[18px] tracking-tight text-[#293B46]">BirdEye</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30">
              OS
            </span>
          </div>
          <span className="text-[10px] text-[#7A7A7A] font-medium tracking-tight">Smart City Intelligence</span>
        </div>
      )}
    </div>
  );
};
