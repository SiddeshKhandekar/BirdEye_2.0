import { InfrastructureAsset } from '../../types';
import { municipalDataProvider } from './municipalProvider';

export class OpenStreetMapService {
  private cachedAssets: InfrastructureAsset[] = municipalDataProvider.getInfrastructure();

  /**
   * Returns public facilities from OpenStreetMap in Pune
   */
  public getInfrastructureAssets(): InfrastructureAsset[] {
    return this.cachedAssets;
  }

  /**
   * Finds the closest sensitive facility (school, hospital) to an issue coordinate.
   * Returns distance in meters and facility name.
   * Used by the Real Priority Engine for proximity weighting.
   */
  public findNearestSensitiveFacility(
    lat: number,
    lng: number
  ): { facility: InfrastructureAsset; distanceMeters: number } | null {
    const sensitive = this.cachedAssets.filter(
      (a) => a.type === 'school' || a.type === 'hospital' || a.type === 'police_station'
    );

    if (sensitive.length === 0) return null;

    let closest = sensitive[0];
    let minDistance = Infinity;

    for (const item of sensitive) {
      const d = this.calculateDistanceMeters(lat, lng, item.location.lat, item.location.lng);
      if (d < minDistance) {
        minDistance = d;
        closest = item;
      }
    }

    return {
      facility: closest,
      distanceMeters: Math.round(minDistance),
    };
  }

  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }
}

export const openStreetMapService = new OpenStreetMapService();
