import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  RefreshCw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { environmentalService } from '../../services/data-sources/environmentalService';
import { EnvironmentalSignal } from '../../types';

interface EnvironmentalSignalBarProps {
  className?: string;
  onOpenRiskDetail?: () => void;
}

export const EnvironmentalSignalBar: React.FC<EnvironmentalSignalBarProps> = ({
  className = '',
  onOpenRiskDetail,
}) => {
  const [signal, setSignal] = useState<EnvironmentalSignal>(environmentalService.getCachedSignal());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch from live API
    environmentalService.fetchLiveSignal().then((s) => setSignal(s));
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const live = await environmentalService.fetchLiveSignal();
      setSignal(live);
    } finally {
      setLoading(false);
    }
  };

  const risk = signal.risk_assessment;

  return (
    <div
      className={`bg-white/95 backdrop-blur-md border border-[#D7DADE] rounded-2xl p-3 shadow-md ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Weather Metrics */}
        <div className="flex items-center gap-4 text-[12px] text-[#293B46]">
          <div className="flex items-center gap-1.5 font-bold text-[13px]">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <span>{signal.weather_condition}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">{signal.temperature_c}°C</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            <span>{signal.humidity_pct}% Humidity</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-indigo-500" />
            <span>{signal.wind_speed_kmh} km/h</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EEF8F0] border border-[#55B360]/30 text-[11px] font-bold text-[#55B360]">
            AQI {signal.air_quality_index} ({signal.air_quality_label})
          </div>
        </div>

        {/* Right: Data Freshness & Refresh */}
        <div className="flex items-center gap-2">
          <span className="hidden xl:inline text-[10px] font-mono text-[#7A7A7A]">
            {signal.source_name.slice(0, 32)}...
          </span>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500 text-white tracking-wider animate-pulse">
            LIVE
          </span>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg border border-[#D7DADE] hover:bg-[#F0F2F5] text-[#293B46] transition-colors"
            title="Refresh Environmental Feed from Open-Meteo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contextual Risk Assessment Callout (Explicitly AI-Assessed Risk, NOT Confirmed Flooding) */}
      {risk && risk.risk_level !== 'low' && (
        <div className="mt-2.5 pt-2.5 border-t border-[#D7DADE]/60 flex items-start gap-2 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-amber-900">
                {risk.title}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                AI CONTEXTUAL SIGNAL
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
              {risk.reason} <span className="font-semibold text-amber-950">(Note: Assessed vulnerability, not confirmed active flooding).</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
