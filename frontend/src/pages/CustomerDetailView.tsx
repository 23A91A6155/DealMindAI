import React, { useState, useEffect } from 'react';
import { Customer, DealBriefing, Interaction, MemoryUnit, ChatMessage } from '../types';
import { generateBriefing, fetchInteractions, fetchTimeline, askDealMind } from '../services/api';
import { MemoryUsedBadge } from '../components/MemoryUsedBadge';
import {
  Sparkles,
  GitBranch,
  MessageSquare,
  History,
  Building2,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  ThumbsUp,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface Props {
  customer: Customer;
  onOpenAddInteraction: () => void;
  initialTab?: string;
}

export const CustomerDetailView: React.FC<Props> = ({
  customer,
  onOpenAddInteraction,
  initialTab = 'briefing'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Briefing state
  const [briefing, setBriefing] = useState<DealBriefing | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);

  // Timeline state
  const [timeline, setTimeline] = useState<MemoryUnit[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Interactions state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am DealMind, your sales memory intelligence copilot. I remember all past interactions, stakeholder priorities, and objections for **${customer.name}**. What would you like to know before your next call?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    loadBriefing();
    loadTimeline();
    loadInteractions();
  }, [customer.id, initialTab]);

  const loadBriefing = async () => {
    try {
      setIsLoadingBriefing(true);
      const res = await generateBriefing(customer.id);
      setBriefing(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBriefing(false);
    }
  };

  const loadTimeline = async () => {
    try {
      setIsLoadingTimeline(true);
      const res = await fetchTimeline(customer.id);
      setTimeline(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const loadInteractions = async () => {
    try {
      setIsLoadingInteractions(true);
      const res = await fetchInteractions(customer.id);
      setInteractions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingInteractions(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingChat) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userText, timestamp: 'Now' }
    ];
    setMessages(newHistory);

    try {
      setIsSendingChat(true);
      const res = await askDealMind(customer.id, userText, newHistory);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: res.reply,
          memories_used: res.memories_used,
          why_recommended: res.why_recommended,
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I apologize, I encountered an issue recalling memories for this account. Please try again.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Account Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">{customer.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
                {customer.domain}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                {customer.deal_stage}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">{customer.overview}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddInteraction}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
            >
              + Add Touchpoint
            </button>
            <button
              onClick={loadBriefing}
              disabled={isLoadingBriefing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoadingBriefing ? 'Synthesizing...' : 'Regenerate Briefing'}</span>
            </button>
          </div>
        </div>

        {/* Snapshot Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-2 text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-medium text-[10px]">Deal Value</span>
            <span className="font-bold text-base font-mono text-white">
              ${customer.deal_value.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-medium text-[10px]">Win Probability</span>
            <span className="font-bold text-base font-mono text-brand-400">
              {customer.deal_probability}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-medium text-[10px]">Buying Timeline</span>
            <span className="font-semibold text-slate-200">{customer.snapshot.buying_timeline}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-medium text-[10px]">Budget Envelope</span>
            <span className="font-semibold text-slate-200">{customer.snapshot.budget_range}</span>
          </div>
        </div>

        {/* Stakeholders & Key Profiles */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-brand-400" /> Stakeholders:
          </span>
          {customer.contacts.map((c, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
              <strong className="text-white">{c.name}</strong> ({c.role})
            </span>
          ))}
        </div>
      </div>

      {/* Structured Customer Intelligence Grid (Snapshot, Preferences, Objections, Competitors) */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Known Preferences */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Learned Preferences</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            {customer.known_preferences.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Known Objections */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Known Objections</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            {customer.known_objections.map((o, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors Mentioned */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Competitors Evaluated</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            {customer.competitors_mentioned.map((comp, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{comp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('briefing')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'briefing'
              ? 'border-brand-500 text-brand-300 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Prepare Me for My Next Call (AI Briefing)</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'timeline'
              ? 'border-brand-500 text-brand-300 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span>Memory Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'chat'
              ? 'border-brand-500 text-brand-300 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Ask DealMind (Memory Chat)</span>
        </button>

        <button
          onClick={() => setActiveTab('interactions')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'interactions'
              ? 'border-brand-500 text-brand-300 bg-brand-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>Touchpoint Logs ({interactions.length})</span>
        </button>
      </div>

      {/* Tab 1: AI Deal Briefing ("Prepare Me for My Next Call") */}
      {activeTab === 'briefing' && (
        <div className="space-y-6">
          {isLoadingBriefing ? (
            <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-white">Synthesizing Deal Intelligence from Hindsight...</p>
              <p className="text-xs text-slate-400">Recalling memories and reflecting across historical interactions</p>
            </div>
          ) : briefing ? (
            <div className="space-y-6">
              {/* Strategy Hero Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Recommended Meeting Strategy
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                    Confidence: {briefing.confidence_score}%
                  </span>
                </div>
                <p className="text-base text-white font-medium leading-relaxed">
                  {briefing.recommended_strategy}
                </p>

                {/* Grounded Memory Citations Pill */}
                <MemoryUsedBadge
                  memories={briefing.memories_used}
                  sourceCount={briefing.memory_count}
                  whyRecommended="Strategy synthesized from customer objections, positive response to manufacturing ROI case study, and competitive threats recalled from Hindsight."
                />
              </div>

              {/* What Happened & What Matters */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Deal Context: What Happened
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {briefing.what_happened}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-emerald-400 tracking-wider">
                    What Worked Before (Proven Messaging)
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {briefing.what_worked_before.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Talking Points & Questions */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Talking Points */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-brand-400 tracking-wider">
                    Suggested Talking Points (3-5 Points)
                  </h4>
                  <div className="space-y-2 text-xs text-slate-200">
                    {briefing.suggested_talking_points.map((tp, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{tp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions to Ask */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">
                    Intelligent Probing Questions to Ask
                  </h4>
                  <div className="space-y-2 text-xs text-slate-200">
                    {briefing.questions_to_ask.map((q, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          ?
                        </span>
                        <span className="leading-relaxed italic">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Next Action */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Recommended Concrete Next Action</span>
                  <span className="text-sm font-semibold text-white">{briefing.recommended_next_action}</span>
                </div>
                <button
                  onClick={onOpenAddInteraction}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
                >
                  Execute & Log
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Click Regenerate Briefing to synthesize intelligence.</div>
          )}
        </div>
      )}

      {/* Tab 2: Memory Timeline (Star Feature) */}
      {activeTab === 'timeline' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                Memory Progression Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Visual demonstration of knowledge accumulation learned by Hindsight over time
              </p>
            </div>
            <button
              onClick={onOpenAddInteraction}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
            >
              + Add Interaction to Timeline
            </button>
          </div>

          {isLoadingTimeline ? (
            <div className="py-8 text-center text-slate-500 text-xs">Loading timeline...</div>
          ) : timeline.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">No memories stored for this customer yet.</div>
          ) : (
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {timeline.map((item, idx) => (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    item.category === 'Objection' ? 'bg-red-400' :
                    item.category === 'Competitor' ? 'bg-amber-400' :
                    item.category === 'Preference' ? 'bg-emerald-400' :
                    'bg-brand-400'
                  }`}></div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 group-hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{item.timestamp}</span>
                        <span className="text-[11px] text-slate-400">• {item.interaction_type}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                        item.category === 'Objection' ? 'bg-red-500/10 text-red-300' :
                        item.category === 'Competitor' ? 'bg-amber-500/10 text-amber-300' :
                        item.category === 'Preference' ? 'bg-emerald-500/10 text-emerald-300' :
                        'bg-brand-500/10 text-brand-300'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 font-medium leading-relaxed">
                      <span className="text-brand-400 font-bold mr-1.5">Memory Learned:</span>
                      {item.memory}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Source: {item.source}</span>
                      <span className="font-mono text-[10px]">{item.importance} Importance</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Ask DealMind (Memory Chat) */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Explicit Memory Used Citation */}
                  {msg.memories_used && msg.memories_used.length > 0 && (
                    <MemoryUsedBadge
                      memories={msg.memories_used}
                      whyRecommended={msg.why_recommended}
                      sourceCount={msg.memories_used.length}
                    />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {isSendingChat && (
              <div className="flex items-center gap-2 text-xs text-brand-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recalling Hindsight memories & reasoning...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2">
            <input
              type="text"
              placeholder={`Ask DealMind: "What objections did ${customer.name} raise?", "How should I respond to Competitor X?"...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSendingChat}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !inputMessage.trim()}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Touchpoint Logs */}
      {activeTab === 'interactions' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Historical Touchpoints & Recorded Meetings</h3>
            <button
              onClick={onOpenAddInteraction}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold"
            >
              + Log New Touchpoint
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {interactions.map((inter) => (
              <div key={inter.id} className="py-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{inter.interaction_type}</span>
                    <span className="text-slate-400">• {inter.contact_name || 'Stakeholders'}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{inter.date}</span>
                </div>

                <p className="text-slate-300 leading-relaxed">{inter.notes}</p>

                {inter.retained_memory && (
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 text-brand-300 font-mono text-[11px]">
                    <span className="text-slate-500">Hindsight Retain Trace: </span>
                    {inter.retained_memory}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  {inter.objections.map((o, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      Objection: {o}
                    </span>
                  ))}
                  {inter.competitors.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Competitor: {c}
                    </span>
                  ))}
                  {inter.outcome && (
                    <span className="text-slate-400">
                      Outcome: <strong className="text-slate-200">{inter.outcome}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
