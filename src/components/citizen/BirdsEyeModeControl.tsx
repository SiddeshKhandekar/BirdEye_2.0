import React from 'react';
import { Layers, Eye, Compass, Globe } from 'lucide-react';
import { ScaleLevel } from '../../types';
import { directusStore } from '../../services/directus/store';

interface BirdsEyeModeControlProps {
  onSelectScale: (scale: ScaleLevel) => void;
}

const SCALE_LEVELS: Array<{
  id: ScaleLevel;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'street', label: 'Street', sub: 'Precise Pothole & CCTV Nodes', icon: Eye },
  { id: 'neighborhood', label: 'Neighborhood', sub: 'Society & Sector Clusters', icon: Layers },
  { id: 'ward', label: 'Ward', sub: 'Municipal Administrative Zone', icon: Compass },
  { id: 'city', label: 'City', sub: 'Macro Urban Pulse & Routing', icon: Globe },
];

export const BirdsEyeModeControl: React.FC<BirdsEyeModeControlProps> = ({ onSelectScale }) => {
  const currentScale = directusStore.getScaleLevel();

  const handleScaleChange = (scale: ScaleLevel) => {
    directusStore.setScaleLevel(scale);
    onSelectScale(scale);
  };

  return (
    <div
      id="birds-eye-scale-control"
      className="absolute bottom-20 left-4 z-20 hidden md:block"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#D7DADE] rounded-2xl shadow-birdeye-floating p-2 max-w-[280px]">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">
            Perspective Scale
          </span>
          <span className="text-[10px] font-bold text-[#55B360] uppercase">
            Bird&apos;s-Eye View
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 mt-1 bg-[#F7F8F5] p-1 rounded-xl border border-[#D7DADE]/60">
          {SCALE_LEVELS.map((item) => {
            const isActive = currentScale === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScaleChange(item.id)}
                className={`py-1.5 px-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                  isActive
                    ? 'bg-white shadow-sm border border-[#55B360]/40 text-[#293B46]'
                    : 'hover:bg-white/50 text-[#7A7A7A]'
                }`}
                title={item.sub}
              >
                <item.icon
                  className={`w-3.5 h-3.5 ${isActive ? 'text-[#55B360]' : 'text-[#7A7A7A]'}`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-tight ${
                    isActive ? 'text-[#293B46]' : 'text-[#7A7A7A]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
