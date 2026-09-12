import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Issue,
  IssueCluster,
  OptimizedRoute,
  SecurityEvent,
  IssueCategory,
} from '../../types';
import { directusStore } from '../../services/directus/store';
import { municipalDataProvider } from '../../services/data-sources/municipalProvider';
import { openStreetMapService } from '../../services/data-sources/openStreetMapService';

interface MapViewProps {
  issues: Issue[];
  clusters: IssueCluster[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: Issue) => void;
  activeRoute: OptimizedRoute | null;
  securityEvents?: SecurityEvent[];
  center: { lat: number; lng: number };
  zoom: number;
  userLocation: { lat: number; lng: number } | null;
  categoryFilter: string;
  showClusters: boolean;
  showHeatmap?: boolean;
  showPredictiveHotspots?: boolean;
  highlightedCoords?: { lat: number; lng: number; radiusMeters?: number } | null;
}

export const MapView: React.FC<MapViewProps> = ({
  issues,
  clusters,
  selectedIssueId,
  onSelectIssue,
  activeRoute,
  securityEvents = [],
  center,
  zoom,
  userLocation,
  categoryFilter,
  showClusters,
  showHeatmap = false,
  showPredictiveHotspots = true,
  highlightedCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const highlightLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const predictiveLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const infrastructureLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      const stadiaKey = import.meta.env.VITE_STRADIA_API;
      const tileUrl = stadiaKey
        ? `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: 'BirdEye Smart City Engine' })
        .addTo(map);

      const boundaryGroup = L.layerGroup().addTo(map);
      const infrastructureGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);
      const routeGroup = L.layerGroup().addTo(map);
      const highlightGroup = L.layerGroup().addTo(map);
      const predictiveGroup = L.layerGroup().addTo(map);

      boundaryLayerGroupRef.current = boundaryGroup;
      infrastructureLayerGroupRef.current = infrastructureGroup;
      markersLayerGroupRef.current = markersGroup;
      routeLayerGroupRef.current = routeGroup;
      highlightLayerGroupRef.current = highlightGroup;
      predictiveLayerGroupRef.current = predictiveGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // ResizeObserver for reliable responsive canvas
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update map center when tenant center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom, {
        animate: true,
        duration: 0.6,
      });
    }
  }, [center.lat, center.lng, zoom]);

  // Update Markers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const highlightGroup = highlightLayerGroupRef.current;
    if (!map || !markersGroup || !highlightGroup) return;

    markersGroup.clearLayers();
    highlightGroup.clearLayers();

    // 1. Draw User Location with pulse ring
    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-[#55B360]/20 user-pulse-marker"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-[#55B360] border-2 border-white shadow-md"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: userHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .bindTooltip('Your Current Geolocation', { direction: 'top', offset: [0, -10] })
        .addTo(markersGroup);
    }

    // 2. Draw Highlighted Coordinate / Spatial Deduplication Radius
    if (highlightedCoords) {
      const radius = highlightedCoords.radiusMeters || 50;
      L.circle([highlightedCoords.lat, highlightedCoords.lng], {
        radius: radius,
        color: '#55B360',
        weight: 2,
        dashArray: '4, 6',
        fillColor: '#55B360',
        fillOpacity: 0.15,
      }).addTo(highlightGroup);

      // Focus map
      map.setView([highlightedCoords.lat, highlightedCoords.lng], 17, { animate: true });
    }

    // Filter issues based on categoryFilter
    const filteredIssues = issues.filter((iss) => {
      if (categoryFilter === 'all') return true;
      return iss.category === categoryFilter;
    });

    // Helper: Marker color semantics
    const getMarkerColor = (issue: Issue) => {
      if (issue.status === 'resolved') return '#55B360'; // Green
      if (issue.priority === 'critical') return '#DC2626'; // Red
      if (issue.priority === 'high') return '#EA580C'; // Orange / Red
      return '#D97706'; // Orange pending
    };

    // Helper: Category Icon SVG
    const getCategoryIconSvg = (cat: IssueCategory) => {
      switch (cat) {
        case 'pothole':
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
        case 'garbage':
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
        case 'streetlight':
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zM9 21h6"/></svg>`;
        case 'water':
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
        default:
          return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      }
    };

    // 3. Render Markers or Clusters
    if (showClusters) {
      clusters.forEach((cluster) => {
        if (categoryFilter !== 'all' && cluster.category !== categoryFilter) return;

        const isMulti = cluster.contributor_count > 1;
        const color = cluster.status === 'resolved' ? '#55B360' : cluster.priority === 'critical' ? '#DC2626' : '#EA580C';

        const clusterHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[12px] shadow-lg border-2 border-white"
                 style="background-color: ${color};">
              ${isMulti ? cluster.contributor_count : getCategoryIconSvg(cluster.category)}
            </div>
            ${isMulti ? `
              <div class="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-[#293B46] text-white text-[9px] font-bold border border-white">
                Cluster
              </div>` : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-cluster-marker',
          html: clusterHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([cluster.center_location.lat, cluster.center_location.lng], { icon });
        marker.on('click', () => {
          if (cluster.issues.length > 0) {
            onSelectIssue(cluster.issues[0]);
          }
        });

        marker.bindTooltip(
          `<div class="text-[12px] font-semibold text-[#293B46]">${cluster.title}</div>
           <div class="text-[11px] text-[#7A7A7A]">${cluster.contributor_count} citizen reports &bull; ${cluster.status}</div>`,
          { direction: 'top', offset: [0, -16] }
        );

        marker.addTo(markersGroup);
      });
    } else {
      // Individual Issue Markers
      filteredIssues.forEach((issue) => {
        const isSelected = issue.id === selectedIssueId;
        const color = getMarkerColor(issue);
        const iconSvg = getCategoryIconSvg(issue.category);

        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 ${
              isSelected ? 'border-[#293B46] ring-2 ring-[#55B360]' : 'border-white'
            }"
                 style="background-color: ${color};">
              ${iconSvg}
            </div>
            ${issue.contributor_count > 1 ? `
              <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#293B46] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                ${issue.contributor_count}
              </div>` : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-issue-marker',
          html: markerHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([issue.location.lat, issue.location.lng], { icon });
        marker.on('click', () => onSelectIssue(issue));

        marker.bindTooltip(
          `<div class="text-[12px] font-bold text-[#293B46]">${issue.title}</div>
           <div class="text-[11px] text-[#7A7A7A]">${issue.location.address} &bull; ${issue.status}</div>`,
          { direction: 'top', offset: [0, -12] }
        );

        marker.addTo(markersGroup);
      });
    }

    // 4. Render Security CCTV Event nodes
    securityEvents.forEach((evt) => {
      const isBlacklist = evt.event_type === 'blacklist_match';
      const secColor = isBlacklist ? '#DC2626' : '#2563EB';

      const secHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
          <div class="w-7 h-7 rounded-md flex items-center justify-center text-white shadow-md border-2 border-white"
               style="background-color: ${secColor};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#293B46] border border-white"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-security-marker',
        html: secHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([evt.location.lat, evt.location.lng], { icon })
        .bindTooltip(
          `<div class="text-[12px] font-bold text-[#293B46]">${evt.event_type.toUpperCase()}</div>
           <div class="text-[11px] text-[#7A7A7A]">${evt.plate} (${evt.confidence.toFixed(0)}% conf)</div>`,
          { direction: 'top', offset: [0, -10] }
        )
        .addTo(markersGroup);
    });
    // 5. Render AI Predictive Hotspots
    const predictiveGroup = predictiveLayerGroupRef.current;
    if (predictiveGroup) {
      predictiveGroup.clearLayers();
      if (showPredictiveHotspots) {
        const hotspots = directusStore.getPredictiveHotspots();
        hotspots.forEach((spot) => {
          // Circle contour
          L.circle([spot.center.lat, spot.center.lng], {
            radius: spot.radius_meters,
            color: '#8B5CF6',
            weight: 2,
            dashArray: '5, 5',
            fillColor: '#8B5CF6',
            fillOpacity: 0.12,
          }).addTo(predictiveGroup);

          // Center AI Prediction Badge marker
          const predHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white font-bold text-[10px] shadow-md border border-white flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>AI RISK: ${spot.risk_score}%</span>
              </div>
            </div>
          `;
          const icon = L.divIcon({
            className: 'custom-prediction-marker',
            html: predHtml,
            iconSize: [88, 22],
            iconAnchor: [44, 11],
          });

          const reasonsList = spot.reasons.map((r) => `&bull; ${r}`).join('<br/>');
          L.marker([spot.center.lat, spot.center.lng], { icon })
            .bindTooltip(
              `<div class="p-1 text-[12px] space-y-1">
                 <div class="font-bold text-[#8B5CF6] uppercase text-[10px]">AI Infrastructure Prediction</div>
                 <div class="font-bold text-[#293B46]">${spot.title} (${spot.risk_score}% Risk)</div>
                 <div class="text-[11px] text-[#7A7A7A] pt-1 leading-snug">
                   <strong>Identified Factors:</strong><br/>
                   ${reasonsList}
                 </div>
                 <div class="text-[11px] text-[#55B360] font-semibold pt-1">
                   Recommended: ${spot.recommended_prevention}
                 </div>
               </div>`,
              { direction: 'top', offset: [0, -12] }
            )
            .addTo(predictiveGroup);
        });
      }
    }
  }, [issues, clusters, selectedIssueId, categoryFilter, showClusters, userLocation, highlightedCoords, securityEvents, showPredictiveHotspots]);

  // Update Route Polyline & Sequence Stop Numbers
  useEffect(() => {
    const routeGroup = routeLayerGroupRef.current;
    if (!routeGroup) return;

    routeGroup.clearLayers();

    if (activeRoute && activeRoute.stops.length > 0) {
      // Draw glowing polyline
      const polyline = L.polyline(activeRoute.path_coordinates, {
        color: '#55B360',
        weight: 4,
        opacity: 0.9,
        dashArray: '6, 8',
      }).addTo(routeGroup);

      // Add numbered stop markers
      activeRoute.stops.forEach((stop) => {
        const stopHtml = `
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#293B46] text-[#55B360] font-bold text-[11px] border-2 border-white shadow-md">
            ${stop.stop_index}
          </div>
        `;
        const icon = L.divIcon({
          className: 'custom-stop-marker',
          html: stopHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([stop.location.lat, stop.location.lng], { icon })
          .bindTooltip(`Stop ${stop.stop_index}: ${stop.title}`, { direction: 'top', offset: [0, -10] })
          .addTo(routeGroup);
      });

      // Fit map bounds to show full route
      if (mapInstanceRef.current && activeRoute.path_coordinates.length > 1) {
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    }
  }, [activeRoute]);

  // Render Municipal GIS Ward Boundaries & Public Infrastructure Assets
  useEffect(() => {
    const boundaryGroup = boundaryLayerGroupRef.current;
    const infraGroup = infrastructureLayerGroupRef.current;
    if (!boundaryGroup || !infraGroup) return;

    boundaryGroup.clearLayers();
    infraGroup.clearLayers();

    // 1. Municipal Ward Boundaries (Open Data Platform India)
    const boundaries = municipalDataProvider.getAdministrativeBoundaries();
    boundaries.forEach((b) => {
      const latlngs = b.polygon;
      const polygon = L.polygon(latlngs, {
        color: '#55B360',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#55B360',
        fillOpacity: 0.04,
        dashArray: '4, 4',
      }).addTo(boundaryGroup);

      polygon.bindTooltip(
        `<div class="p-1">
          <strong class="text-[#293B46]">${b.ward_name}</strong> (Ward #${b.electoral_number})<br/>
          <span class="text-[10px] text-[#7A7A7A]">${b.zonal_office} | Pop: ${(b.population_estimate || 0).toLocaleString()}</span>
        </div>`,
        { sticky: true }
      );
    });

    // 2. Public Infrastructure Assets (OpenStreetMap Overpass)
    const assets = openStreetMapService.getInfrastructureAssets();
    assets.forEach((asset) => {
      const colorMap: Record<string, string> = {
        hospital: '#E53E3E',
        school: '#3182CE',
        police_station: '#805AD5',
        bus_stop: '#319795',
        park: '#38A169',
        water_facility: '#0BC5EA',
        waste_facility: '#D69E2E',
        streetlight: '#ECC94B',
      };
      const bg = colorMap[asset.type] || '#718096';
      const iconHtml = `
        <div class="flex items-center justify-center w-5 h-5 rounded-full border border-white shadow-sm text-white text-[9px] font-bold" style="background-color: ${bg}">
          ${asset.type.slice(0, 1).toUpperCase()}
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-infra-marker',
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([asset.location.lat, asset.location.lng], { icon })
        .bindTooltip(
          `<div class="p-1">
            <span class="text-[9px] uppercase font-bold text-[#7A7A7A]">${asset.type.replace('_', ' ')}</span><br/>
            <strong class="text-[#293B46] text-[12px]">${asset.name}</strong><br/>
            <span class="text-[10px] text-[#7A7A7A]">${asset.attributes?.operator ? String(asset.attributes.operator) : 'Municipal Public'}</span>
          </div>`,
          { direction: 'top', offset: [0, -8] }
        )
        .addTo(infraGroup);
    });
  }, [center.lat, center.lng]);

  return (
    <div className="relative w-full h-full bg-[#F7F8F5]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
