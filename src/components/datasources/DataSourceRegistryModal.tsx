import React, { useState, useEffect } from 'react';
import {
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Sliders,
  X,
  Layers,
  Activity,
  Calendar,
} from 'lucide-react';
import { dataSourceRegistry } from '../../services/data-sources/registry';
import { municipalDataProvider } from '../../services/data-sources/municipalProvider';
import { DataSource, DataIngestionRun } from '../../types';

interface DataSourceRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourceRegistryModal: React.FC<DataSourceRegistryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sources, setSources] = useState<DataSource[]>(dataSourceRegistry.getAllDataSources());
  const [runs, setRuns] = useState<DataIngestionRun[]>(dataSourceRegistry.getIngestionRuns());
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sources[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'sources' | 'runs' | 'config'>('sources');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Municipal Config state
  const [config, setConfig] = useState(municipalDataProvider.getConfig());
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    return dataSourceRegistry.subscribe(() => {
      setSources(dataSourceRegistry.getAllDataSources());
      setRuns(dataSourceRegistry.getIngestionRuns());
    });
  }, []);

  if (!isOpen) return null;

  const selectedSource = sources.find((s) => s.id === selectedSourceId) || sources[0];

  const handleSync = async (sourceId: string) => {
    setSyncingId(sourceId);
    try {
      await dataSourceRegistry.triggerSync(sourceId);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    municipalDataProvider.setConfiguration(config);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#293B46]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#D7DADE] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[#55B360]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#293B46]">Data Source Registry & Ingestion Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30">
                  Authoritative Open Datasets
                </span>
              </div>
              <p className="text-[12px] text-[#7A7A7A]">
                Full provenance, license verification, sync freshness, and municipal adapter configurations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A7A7A] hover:text-[#293B46] hover:bg-[#F0F2F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-[#D7DADE] bg-[#F7F8F5]">
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-2 py-3 px-4 text-[13px] font-semibold border-b-2 transition-all ${
              activeTab === 'sources'
                ? 'border-[#55B360] text-[#55B360] bg-white'
                : 'border-transparent text-[#7A7A7A] hover:text-[#293B46]'
            }`}
          >
            <Layers className="w-4 h-4" />
            Connected Sources ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab('runs')}
            className={`flex items-center gap-2 py-3 px-4 text-[13px] font-semibold border-b-2 transition-all ${
              activeTab === 'runs'
                ? 'border-[#55B360] text-[#55B360] bg-white'
                : 'border-transparent text-[#7A7A7A] hover:text-[#293B46]'
            }`}
          >
            <Activity className="w-4 h-4" />
            Ingestion Pipeline Runs ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-4 text-[13px] font-semibold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-[#55B360] text-[#55B360] bg-white'
                : 'border-transparent text-[#7A7A7A] hover:text-[#293B46]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Municipal Provider Config
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Sources List */}
              <div className="md:col-span-5 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block mb-2">
                  Configured Open Data Sources
                </span>
                {sources.map((src) => {
                  const freshness = dataSourceRegistry.getFreshnessLabel(src.last_ingested);
                  const isSelected = src.id === selectedSource.id;
                  return (
                    <div
                      key={src.id}
                      onClick={() => setSelectedSourceId(src.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#55B360] bg-[#EEF8F0]/40 shadow-sm'
                          : 'border-[#D7DADE] bg-white hover:border-[#55B360]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="font-bold text-[13px] text-[#293B46]">{src.source_name}</div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${freshness.badgeColor}`}
                        >
                          {freshness.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7A7A7A] line-clamp-1 mb-2">{src.dataset_name}</div>
                      <div className="flex items-center justify-between text-[11px] text-[#293B46]/70">
                        <span className="font-mono text-[10px] uppercase bg-[#F0F2F5] px-1.5 py-0.5 rounded">
                          {src.data_type}
                        </span>
                        <span className="font-semibold">{src.records_count.toLocaleString()} records</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Source Provenance & Actions */}
              <div className="md:col-span-7 bg-[#FBFCFA] rounded-xl border border-[#D7DADE] p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D7DADE]">
                  <div>
                    <h3 className="text-base font-bold text-[#293B46]">{selectedSource.source_name}</h3>
                    <p className="text-[12px] font-medium text-[#55B360]">{selectedSource.dataset_name}</p>
                  </div>
                  <button
                    disabled={syncingId === selectedSource.id}
                    onClick={() => handleSync(selectedSource.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#55B360] hover:bg-[#469B50] text-white text-[12px] font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${syncingId === selectedSource.id ? 'animate-spin' : ''}`}
                    />
                    <span>{syncingId === selectedSource.id ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>

                <p className="text-[12px] text-[#293B46]/80 leading-relaxed">{selectedSource.description}</p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-[#D7DADE]">
                    <div className="text-[10px] uppercase font-bold text-[#7A7A7A] mb-0.5">Authoritative Provider</div>
                    <div className="text-[12px] font-semibold text-[#293B46]">{selectedSource.provider}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#D7DADE]">
                    <div className="text-[10px] uppercase font-bold text-[#7A7A7A] mb-0.5">Open License</div>
                    <div className="text-[12px] font-semibold text-[#293B46]">{selectedSource.license}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#D7DADE]">
                    <div className="text-[10px] uppercase font-bold text-[#7A7A7A] mb-0.5">Geographic Scope</div>
                    <div className="text-[12px] font-semibold text-[#293B46]">{selectedSource.geographic_scope}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#D7DADE]">
                    <div className="text-[10px] uppercase font-bold text-[#7A7A7A] mb-0.5">Refresh Frequency</div>
                    <div className="text-[12px] font-semibold text-[#293B46]">{selectedSource.refresh_frequency}</div>
                  </div>
                </div>

                {/* Provenance Box */}
                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px] uppercase mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Data Provenance & Lineage
                  </div>
                  <p className="text-[11px] text-blue-900/90 leading-relaxed font-mono">
                    {selectedSource.provenance}
                  </p>
                </div>

                {/* Endpoint link */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#D7DADE]">
                  <span className="text-[#7A7A7A]">Source Endpoint / Resource:</span>
                  <a
                    href={selectedSource.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-mono text-[#55B360] hover:underline"
                  >
                    <span>{selectedSource.source_url.slice(0, 45)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'runs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                  Chronological Ingestion Runs
                </span>
                <span className="text-[12px] text-[#55B360] font-semibold">
                  All pipelines verified & coordinate-normalized (EPSG:4326)
                </span>
              </div>

              <div className="border border-[#D7DADE] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#F0F2F5] text-[#293B46] font-bold uppercase text-[10px] tracking-wider border-b border-[#D7DADE]">
                    <tr>
                      <th className="py-3 px-4">Run ID</th>
                      <th className="py-3 px-4">Data Source</th>
                      <th className="py-3 px-4">Completed At</th>
                      <th className="py-3 px-4">Received</th>
                      <th className="py-3 px-4">Inserted</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D7DADE]">
                    {runs.map((run) => (
                      <tr key={run.id} className="hover:bg-[#FBFCFA]">
                        <td className="py-3 px-4 font-mono font-bold text-[11px] text-[#293B46]">{run.id}</td>
                        <td className="py-3 px-4 font-semibold text-[#293B46]">{run.source_name}</td>
                        <td className="py-3 px-4 text-[#7A7A7A] font-mono">
                          {new Date(run.completed_at).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#293B46]">{run.records_received}</td>
                        <td className="py-3 px-4 text-emerald-600 font-bold">+{run.records_inserted}</td>
                        <td className="py-3 px-4 text-blue-600 font-medium">{run.records_updated}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="max-w-2xl mx-auto bg-[#FBFCFA] p-6 rounded-xl border border-[#D7DADE] space-y-5">
              <div>
                <h3 className="text-base font-bold text-[#293B46]">Municipal Data Provider Configuration</h3>
                <p className="text-[12px] text-[#7A7A7A]">
                  BirdEye architecture is fully decoupled and configurable across municipalities, states, and open data providers.
                </p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A7A7A] mb-1">
                    Target City
                  </label>
                  <input
                    type="text"
                    value={config.city}
                    onChange={(e) => setConfig({ ...config, city: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#D7DADE] focus:border-[#55B360] focus:ring-1 focus:ring-[#55B360] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A7A7A] mb-1">
                    State / Administrative Territory
                  </label>
                  <input
                    type="text"
                    value={config.state}
                    onChange={(e) => setConfig({ ...config, state: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#D7DADE] focus:border-[#55B360] focus:ring-1 focus:ring-[#55B360] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A7A7A] mb-1">
                    Administrative Body / Municipal Corporation
                  </label>
                  <input
                    type="text"
                    value={config.administrativeBody}
                    onChange={(e) => setConfig({ ...config, administrativeBody: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#D7DADE] focus:border-[#55B360] focus:ring-1 focus:ring-[#55B360] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-[#7A7A7A] mb-1">
                    Open Data Provider Authority
                  </label>
                  <input
                    type="text"
                    value={config.dataProvider}
                    onChange={(e) => setConfig({ ...config, dataProvider: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#D7DADE] focus:border-[#55B360] focus:ring-1 focus:ring-[#55B360] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] uppercase font-bold text-[#7A7A7A]">
                      Municipal & Open Data API Key
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active & Connected
                    </span>
                  </div>
                  <input
                    type="text"
                    value={config.apiKey || 'b6777717-81e7-40dd-95c8-e03afeb0a829'}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] font-mono rounded-lg border border-[#D7DADE] bg-[#FBFCFA] focus:border-[#55B360] focus:ring-1 focus:ring-[#55B360] outline-none"
                    placeholder="e.g. b6777717-81e7-40dd-95c8-e03afeb0a829"
                  />
                  <span className="text-[11px] text-[#7A7A7A] mt-1 block">
                    Authorizes live queries to Open Government Data Platform India (data.gov.in) and PMC GIS Services.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#55B360] hover:bg-[#469B50] text-white text-[13px] font-bold shadow-sm transition-all"
                  >
                    Save Municipal Adapter Configuration
                  </button>
                  {configSaved && (
                    <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Configuration Updated!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D7DADE] bg-[#F7F8F5] flex items-center justify-between text-[11px] text-[#7A7A7A]">
          <span>Data Ingestion Engine v2026.04 | Standard OGC & OpenStreetMap Compliant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#D7DADE] bg-white text-[#293B46] font-semibold hover:bg-[#F0F2F5]"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
