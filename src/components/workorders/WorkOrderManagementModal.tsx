import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  UserCheck,
  Camera,
  X,
  MapPin,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';
import { WorkOrder } from '../../types';

interface WorkOrderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIssue?: (issueId: string) => void;
}

export const WorkOrderManagementModal: React.FC<WorkOrderManagementModalProps> = ({
  isOpen,
  onClose,
  onSelectIssue,
}) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(directusStore.getWorkOrders());
  const [selectedOrderId, setSelectedOrderId] = useState<string>(workOrders[0]?.id || '');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  useEffect(() => {
    return directusStore.subscribe(() => {
      setWorkOrders(directusStore.getWorkOrders());
    });
  }, []);

  if (!isOpen) return null;

  const selectedOrder = workOrders.find((w) => w.id === selectedOrderId) || workOrders[0];

  const handleStartWork = (orderId: string) => {
    directusStore.updateWorkOrderStatus(orderId, 'in_progress', 'Field team arrived on-site.');
  };

  const handleCompleteWork = (orderId: string) => {
    // Verified after photo
    const sampleAfterImages: Record<string, string> = {
      pothole:
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      garbage:
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      streetlight:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      water:
        'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    };

    const afterUrl =
      sampleAfterImages[selectedOrder?.category || 'pothole'] ||
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80';

    directusStore.updateWorkOrderStatus(
      orderId,
      'resolved',
      resolutionNotes || 'Repairs finalized and verified against municipal standards.',
      afterUrl
    );
    setIsResolving(false);
    setResolutionNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#293B46]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#D7DADE] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D7DADE] bg-[#FBFCFA]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EEF8F0] border border-[#55B360]/30 text-[#55B360]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#293B46]">Municipal Work Order Dispatch & Verification</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#EEF8F0] text-[#55B360] border border-[#55B360]/30">
                  Ground-Truth Lifecycle
                </span>
              </div>
              <p className="text-[12px] text-[#7A7A7A]">
                End-to-end work orders tracking before & after photo proof, assigned municipal crews, and resolution verification
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Orders List */}
            <div className="md:col-span-5 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A] block mb-2">
                Active & Completed Work Orders ({workOrders.length})
              </span>
              {workOrders.map((order) => {
                const isSelected = order.id === selectedOrder?.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#55B360] bg-[#EEF8F0]/40 shadow-sm'
                        : 'border-[#D7DADE] bg-white hover:border-[#55B360]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-[#7A7A7A]">{order.id}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-bold text-[13px] text-[#293B46] line-clamp-1">{order.issue_title}</div>
                    <div className="text-[11px] text-[#55B360] font-medium">{order.department_name}</div>
                    <div className="text-[11px] text-[#7A7A7A] mt-1 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>{order.assigned_to}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Details & Before/After Proof */}
            {selectedOrder && (
              <div className="md:col-span-7 bg-[#FBFCFA] rounded-xl border border-[#D7DADE] p-5 space-y-5">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D7DADE]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#55B360] bg-[#EEF8F0] px-2 py-0.5 rounded">
                        {selectedOrder.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          selectedOrder.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : selectedOrder.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedOrder.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#293B46] mt-1.5">{selectedOrder.issue_title}</h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {selectedOrder.status === 'assigned' && (
                      <button
                        onClick={() => handleStartWork(selectedOrder.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#55B360] hover:bg-[#469B50] text-white text-[12px] font-bold shadow-sm"
                      >
                        Start Work
                      </button>
                    )}
                    {selectedOrder.status === 'in_progress' && (
                      <button
                        onClick={() => setIsResolving(true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold shadow-sm flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload Resolution Proof
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="bg-white p-3 rounded-lg border border-[#D7DADE]">
                    <span className="text-[10px] uppercase font-bold text-[#7A7A7A] block mb-0.5">Assigned To</span>
                    <span className="font-semibold text-[#293B46]">{selectedOrder.assigned_to}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#D7DADE]">
                    <span className="text-[10px] uppercase font-bold text-[#7A7A7A] block mb-0.5">Assigned Department</span>
                    <span className="font-semibold text-[#293B46]">{selectedOrder.department_name}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-[12px] text-[#293B46] bg-white p-2.5 rounded-lg border border-[#D7DADE]">
                  <MapPin className="w-4 h-4 text-[#55B360] shrink-0" />
                  <span className="truncate">{selectedOrder.location.address}</span>
                  <span className="font-mono text-[11px] text-[#7A7A7A] ml-auto">
                    {selectedOrder.location.lat.toFixed(4)}, {selectedOrder.location.lng.toFixed(4)}
                  </span>
                </div>

                {/* Before vs After Photo Proof Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A7A]">
                      Resolution Evidence: Before vs After
                    </span>
                    {selectedOrder.verification_status === 'verified_resolved' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Resolved
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Before Image */}
                    <div className="space-y-1">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-[#D7DADE] bg-zinc-100">
                        <img
                          src={selectedOrder.before_image_url}
                          alt="Before repair"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-bold text-[10px] uppercase tracking-wider">
                          Before Repair
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A7A7A] font-mono text-center">Citizen reported photo</p>
                    </div>

                    {/* After Image */}
                    <div className="space-y-1">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-[#D7DADE] bg-zinc-100 flex items-center justify-center">
                        {selectedOrder.after_image_url ? (
                          <>
                            <img
                              src={selectedOrder.after_image_url}
                              alt="After repair"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                              After Repair
                            </span>
                          </>
                        ) : (
                          <div className="text-center p-3 text-[#7A7A7A]">
                            <Camera className="w-6 h-6 mx-auto mb-1 text-[#7A7A7A]/50" />
                            <span className="text-[11px] font-medium block">Awaiting completion photo</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-[#7A7A7A] font-mono text-center">
                        {selectedOrder.resolved_at ? `Verified at ${new Date(selectedOrder.resolved_at).toLocaleTimeString()}` : 'Pending field upload'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Worker Notes */}
                <div className="p-3 bg-white rounded-lg border border-[#D7DADE]">
                  <span className="text-[10px] font-bold uppercase text-[#7A7A7A] block mb-1">Field Crew Notes</span>
                  <p className="text-[12px] text-[#293B46]">{selectedOrder.worker_notes || 'No notes logged yet.'}</p>
                </div>

                {/* Resolution Dialog */}
                {isResolving && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                    <div className="font-bold text-[13px] text-emerald-950 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Upload Resolution Proof & Close Work Order
                    </div>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution notes (e.g. 1.5 tons asphalt cold-mix laid and compacted, road surface restored)..."
                      className="w-full p-2.5 text-[12px] rounded-lg border border-emerald-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none bg-white"
                      rows={2}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsResolving(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#D7DADE] bg-white text-[12px] text-[#293B46]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCompleteWork(selectedOrder.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[12px] hover:bg-emerald-700 shadow-sm"
                      >
                        Verify & Close Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D7DADE] bg-[#F7F8F5] flex items-center justify-between text-[11px] text-[#7A7A7A]">
          <span>Municipal Work Order Protocol v2.4 | Directus / PostGIS Synchronized</span>
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
