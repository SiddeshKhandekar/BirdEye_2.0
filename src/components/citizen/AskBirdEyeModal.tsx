import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  HelpCircle,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import { directusStore } from '../../services/directus/store';
import { Issue } from '../../types';

interface AskBirdEyeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectIssue?: (issue: Issue) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'birdeye';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    issueId?: string;
  };
  factorHighlights?: string[];
}

const PRESET_QUERIES = [
  'What are the biggest problems here?',
  'Which issue should we fix first?',
  'What changed today?',
  'Where are problems increasing?',
];

export const AskBirdEyeModal: React.FC<AskBirdEyeModalProps> = ({
  isOpen,
  onClose,
  onInspectIssue,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'birdeye',
      text: "Hello! I'm the BirdEye AI City Copilot. I continuously analyze multimodal civic signals, spatial clustering, and predictive infrastructure models across your neighborhood. How can I assist municipal planning today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  if (!isOpen) return null;

  const tenant = directusStore.getCurrentTenant();
  const issues = directusStore.getIssues();
  const clusters = directusStore.getClusters();
  const health = directusStore.getCityHealth();

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: ChatMessage;
      const lower = q.toLowerCase();

      if (lower.includes('biggest problem') || lower.includes('biggest')) {
        const topCluster = clusters.sort((a, b) => b.contributor_count - a.contributor_count)[0];
        botResponse = {
          id: `bot_${Date.now()}`,
          sender: 'birdeye',
          text: `In ${tenant.name}, the highest impact problem is "${topCluster?.title || 'Main Corridor Pothole Cluster'}" with ${topCluster?.contributor_count || 5} deduplicated citizen reports. It directly impacts traffic mobility and poses a high pedestrian skid hazard.`,
          timestamp: 'Just now',
          factorHighlights: [
            `${topCluster?.contributor_count} deduplicated reports`,
            `Assigned to ${topCluster?.department_name}`,
            `Estimated 3.5 hours repair effort`,
          ],
          suggestedAction: {
            label: 'Inspect Cluster on Map',
            issueId: topCluster?.issues[0]?.id,
          },
        };
      } else if (lower.includes('fix first') || lower.includes('first') || lower.includes('priority')) {
        const criticalIssue = issues.find((i) => i.priority === 'critical' && i.status !== 'resolved') || issues[0];
        botResponse = {
          id: `bot_${Date.now()}`,
          sender: 'birdeye',
          text: `Based on multi-criteria spatial scoring (Severity: 35pts, Traffic Exposure: 20pts, Unresolved Time: 15pts), you should fix: "${criticalIssue?.title}". Delaying repair increases vehicle underbody damage risk and risks further water seepage into the road sub-base.`,
          timestamp: 'Just now',
          factorHighlights: [
            'Composite AI Score: 96 / 100',
            `Lead Agency: ${criticalIssue?.department_name}`,
            'Recommended: Emergency cold-mix asphalt patch',
          ],
          suggestedAction: {
            label: 'Open Priority Work Order',
            issueId: criticalIssue?.id,
          },
        };
      } else if (lower.includes('changed today') || lower.includes('today')) {
        botResponse = {
          id: `bot_${Date.now()}`,
          sender: 'birdeye',
          text: `Today in ${tenant.name}: ${health.resolved_today} infrastructure issues have been verified as resolved by municipal crews. City Health has elevated to ${health.overall}/100. 1 new water leakage anomaly was detected and deduplicated with 0 false dispatches.`,
          timestamp: 'Just now',
          factorHighlights: [
            `City Health: ${health.overall}/100 (+4% this week)`,
            `${health.resolved_today} work orders closed`,
            'Zero municipal duplicate crews dispatched',
          ],
        };
      } else if (lower.includes('increasing') || lower.includes('predict') || lower.includes('risk')) {
        botResponse = {
          id: `bot_${Date.now()}`,
          sender: 'birdeye',
          text: `Our predictive model indicates asphalt degradation risk is escalating along the Main Spine Road Curve (78% Pothole Probability within 14 days). Subsurface water sprinkler runoff coupled with morning delivery traffic is accelerating aggregate binder loss.`,
          timestamp: 'Just now',
          factorHighlights: [
            'Predicted Risk: 78% Asphalt Scour',
            'Trigger: Sprinkler runoff + Turning truck axle loads',
            'Action: Preventive slurry seal coating recommended',
          ],
        };
      } else {
        botResponse = {
          id: `bot_${Date.now()}`,
          sender: 'birdeye',
          text: `Analyzed telemetry for "${q}". In ${tenant.name}, all ${health.active_issues} active issues are currently mapped and deduplicated across 4 municipal wings. Would you like me to generate an optimized dispatch route for field crews?`,
          timestamp: 'Just now',
          factorHighlights: [
            `Active Signals: ${health.active_issues}`,
            `Overall Health: ${health.overall}/100`,
            'PostGIS Deduplication: Active',
          ],
        };
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#293B46]/45 backdrop-blur-[3px] animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#D7DADE] shadow-birdeye-floating overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#D7DADE] bg-[#FBFCFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF8F0] border border-[#55B360]/30 flex items-center justify-center text-[#55B360]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-[#293B46] leading-tight">Ask BirdEye</h2>
                <span className="px-2 py-0.2 rounded-full bg-[#EEF8F0] text-[#55B360] font-bold text-[10px] border border-[#55B360]/30">
                  AI City Copilot
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A7A]">
                Explainable city intelligence & priority reasoning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F7F8F5] text-[#7A7A7A] hover:text-[#293B46] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Query Pills */}
        <div className="px-6 py-2.5 bg-[#F7F8F5] border-b border-[#D7DADE]/60 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A] shrink-0">
            Suggested:
          </span>
          {PRESET_QUERIES.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => handleSend(query)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#D7DADE] hover:border-[#55B360] hover:bg-[#EEF8F0] text-[11px] text-[#293B46] font-medium whitespace-nowrap transition-colors"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              } space-y-1.5`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#293B46] text-white rounded-br-none'
                    : 'bg-[#FBFCFA] border border-[#D7DADE] text-[#293B46] rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}

                {/* Explainable Factor Highlights */}
                {msg.factorHighlights && msg.factorHighlights.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#D7DADE]/60 space-y-1 text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-[#7A7A7A] block">
                      AI Reasoning Factors:
                    </span>
                    {msg.factorHighlights.map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[#293B46]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#55B360]"></span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested CTA Button */}
                {msg.suggestedAction && (
                  <div className="mt-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (msg.suggestedAction?.issueId && onInspectIssue) {
                          const iss = directusStore.getIssueById(msg.suggestedAction.issueId);
                          if (iss) onInspectIssue(iss);
                        }
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#55B360] hover:bg-[#77BE86] text-white text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#7A7A7A] px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-[#7A7A7A] text-[12px] p-2">
              <Sparkles className="w-3.5 h-3.5 text-[#55B360] animate-spin" />
              <span>BirdEye is analyzing municipal telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-[#D7DADE] bg-[#FBFCFA] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything: e.g. Which issue should we fix first?"
            className="flex-1 px-3.5 py-2 text-[13px] bg-white border border-[#D7DADE] rounded-xl focus:outline-none focus:border-[#55B360]"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-xl bg-[#55B360] hover:bg-[#77BE86] disabled:opacity-50 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
