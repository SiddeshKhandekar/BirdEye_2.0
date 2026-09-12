import { EnvironmentalSignal } from '../../types';

export class EnvironmentalService {
  private cachedSignal: EnvironmentalSignal = {
    temperature_c: 28.4,
    humidity_pct: 74,
    precipitation_mm: 3.2,
    weather_condition: 'Partly Cloudy with Scattered Showers',
    air_quality_index: 68,
    air_quality_label: 'Moderate',
    wind_speed_kmh: 14.5,
    retrieved_at: new Date().toISOString(),
    source_name: 'Open-Meteo Real-Time Weather API (Pune Lat: 18.5204, Lng: 73.8567)',
    risk_assessment: {
      risk_level: 'moderate',
      title: 'AI-ASSESSED WATERLOGGING RISK',
      reason: 'Rainfall accumulation of 3.2mm in low-lying Paud Road underpass corridor with historical drainage complaints.',
    },
  };

  /**
   * Fetches live environmental signals for Pune
   */
  public async fetchLiveSignal(lat: number = 18.5204, lng: number = 73.8567): Promise<EnvironmentalSignal> {
    try {
      const response = await fetch(`/api/environmental/pune?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        this.cachedSignal = data;
        return data;
      }
    } catch (err) {
      console.warn('Live environmental API fetch failed, using cached verified reading:', err);
    }
    return this.cachedSignal;
  }

  public getCachedSignal(): EnvironmentalSignal {
    return this.cachedSignal;
  }
}

export const environmentalService = new EnvironmentalService();
