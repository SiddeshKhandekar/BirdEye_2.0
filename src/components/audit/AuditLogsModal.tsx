import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Bot,
  User,
  X,
  Tag,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';
import { AuditLogEntry } from '../../types';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(directusStore.getAuditLogs());
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    return directusStore.subscribe(() => {
      setLogs(directusStore.getAuditLogs());
    });
  }, []);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (filterType !== 'all' && l.action !== filterType && l.entity_type !== filterType) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.details.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.entity_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'report_created':
        return { label: 'Report Created', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'ai_verified':
        return { label: 'AI Verified', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'cluster_created':
        return { label: 'Spatial Dedup', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'issue_assigned':
        return { label: 'Work Assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'work_started':
        return { label: 'Work Commenced', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'issue_resolved':
        return { label: 'Issue Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'security_event_created':
        return { label: 'Security Flag', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'security_event_reviewed':
        return { label: 'Security Review', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'route_generated':
        return { label: 'Route Generated', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: action, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#293B46]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#D7DADE] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[#55B360]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#293B46]">Immutable Civic & Security Audit Trail</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30">
                  Compliance Ready
                </span>
              </div>
              <p className="text-[12px] text-[#7A7A7A]">
                Cryptographically tracked lifecycle events across citizen signals, AI decisions, and security actions
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

        {/* Filters */}
        <div className="px-6 py-3 border-b border-[#D7DADE] bg-[#F7F8F5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit trail by actor, entity ID, or keyword..."
                className="w-full pl-9 pr-3 py-1.5 text-[12px] rounded-lg border border-[#D7DADE] bg-white outline-none focus:border-[#55B360]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-[#7A7A7A] font-semibold text-[11px] uppercase">Filter:</span>
            {['all', 'issue', 'work_order', 'security_event'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] uppercase transition-colors ${
                  filterType === t
                    ? 'bg-[#55B360] text-white shadow-sm'
                    : 'bg-white border border-[#D7DADE] text-[#293B46] hover:bg-[#F0F2F5]'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#7A7A7A] text-[13px]">
              No audit records match the current filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-[#D7DADE] bg-white hover:border-[#55B360]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="font-mono text-[11px] text-[#7A7A7A]">{log.entity_id}</span>
                      {log.source_id && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {log.source_id}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#293B46] font-medium leading-snug">{log.details}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#7A7A7A]">
                      <span className="font-semibold text-[#293B46]/80 flex items-center gap-1">
                        <User className="w-3 h-3 text-[#55B360]" />
                        {log.actor}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-left md:text-right font-mono text-[11px] text-[#7A7A7A]">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D7DADE] bg-[#F7F8F5] flex items-center justify-between text-[11px] text-[#7A7A7A]">
          <span>Total Audit Trail Entries: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#D7DADE] bg-white text-[#293B46] font-semibold hover:bg-[#F0F2F5]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
