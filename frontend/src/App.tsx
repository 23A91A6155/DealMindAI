import React, { useState, useEffect, useRef } from 'react';
import { Customer, MemoryHealth, HindsightStatus, MemoryUnit } from './types';
import { fetchCustomers, fetchMemoryHealth, fetchHindsightStatus, fetchTimeline } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HindsightStatusModal } from './components/HindsightStatusModal';
import { JudgeModeModal } from './components/JudgeModeModal';
import { AddInteractionModal } from './components/AddInteractionModal';
import { Brain, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

// Views
import { DashboardView } from './pages/DashboardView';
import { CustomerDetailView } from './pages/CustomerDetailView';
import { TimelineView } from './pages/TimelineView';
import { DemoView } from './pages/DemoView';
import { InsightsView } from './pages/InsightsView';
import { DealsView } from './pages/DealsView';
import { CustomersView } from './pages/CustomersView';
import { InteractionsView } from './pages/InteractionsView';
import { SettingsView } from './pages/SettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-acme');
  const [customerDetailTab, setCustomerDetailTab] = useState<string>('briefing');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [memoryHealth, setMemoryHealth] = useState<MemoryHealth | null>(null);
  const [hindsightStatus, setHindsightStatus] = useState<HindsightStatus | null>(null);
  const [recentMemories, setRecentMemories] = useState<MemoryUnit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSeconds, setLoadSeconds] = useState<number>(0);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadError(null);
    setIsLoading(true);
    setLoadSeconds(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLoadSeconds((s) => s + 1);
    }, 1000);

    try {
      const [custs, health, status] = await Promise.all([
        fetchCustomers(),
        fetchMemoryHealth(),
        fetchHindsightStatus()
      ]);
      setCustomers(custs);
      setMemoryHealth(health);
      setHindsightStatus(status);

      // Load initial recent memories from Acme Corp
      if (custs.length > 0) {
        const mems = await fetchTimeline(custs[0].id);
        setRecentMemories(mems);
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Initial data loading failed, checking retry:', err);
      setLoadError(err?.message || 'Server is taking longer than expected to wake up.');
      setIsLoading(false);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSelectCustomer = (customerId: string, tab: string = 'briefing') => {
    setSelectedCustomerId(customerId);
    setCustomerDetailTab(tab);
    setActiveTab('customer-detail');
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'briefing') {
      setActiveTab('customer-detail');
      setCustomerDetailTab('briefing');
    } else {
      setActiveTab(tab);
    }
  };

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-brand-500/30 selection:text-brand-200">
      {/* Header */}
      <Header
        hindsightStatus={hindsightStatus}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenJudgeModal={() => setIsJudgeModalOpen(true)}
        onSelectCustomer={(id) => handleSelectCustomer(id, 'briefing')}
        onNavigate={handleNavigate}
      />

      {/* Main Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab === 'customer-detail' && customerDetailTab === 'briefing' ? 'briefing' : activeTab}
          onNavigate={handleNavigate}
          onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="h-full min-h-[500px] flex items-center justify-center">
              <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6 animate-fadeIn">
                {/* Glowing Brain Icon */}
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-brand-400/30 relative">
                    <Brain className="w-7 h-7 animate-pulse text-brand-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-2">
                    DealMind AI Initializing
                    <Sparkles className="w-4 h-4 text-brand-400" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    {loadSeconds < 6
                      ? "Connecting to Hindsight memory bank & loading deals..."
                      : "Cloud service is warming up from idle state. Auto-reconnecting..."}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, Math.max(15, loadSeconds * 8))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Hindsight Cloud Bank: dealmind-demo</span>
                    <span>{loadSeconds}s elapsed</span>
                  </div>
                </div>

                {loadSeconds >= 6 && (
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-300">
                    <span className="font-semibold">Notice:</span> Cold starts take ~15-25 seconds to spin up. Your live demo will load automatically without refreshing.
                  </div>
                )}
              </div>
            </div>
          ) : loadError && customers.length === 0 ? (
            <div className="h-full min-h-[500px] flex items-center justify-center">
              <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-red-500/20 text-center space-y-5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connection Taking Longer</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    The cloud container is finalizing its startup sequence.
                  </p>
                </div>
                <button
                  onClick={loadInitialData}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Retry Connection Now
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  customers={customers}
                  memoryHealth={memoryHealth}
                  recentMemories={recentMemories}
                  onSelectCustomer={(id) => handleSelectCustomer(id, 'briefing')}
                  onNavigate={handleNavigate}
                  onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
                />
              )}

              {activeTab === 'deals' && (
                <DealsView
                  customers={customers}
                  onSelectCustomer={(id) => handleSelectCustomer(id, 'briefing')}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  onSelectCustomer={(id) => handleSelectCustomer(id, 'briefing')}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'customer-detail' && activeCustomer && (
                <CustomerDetailView
                  customer={activeCustomer}
                  initialTab={customerDetailTab}
                  onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  customers={customers}
                  selectedCustomerId={selectedCustomerId}
                  onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
                />
              )}

              {activeTab === 'interactions' && (
                <InteractionsView
                  customers={customers}
                  onOpenAddInteraction={() => setIsAddInteractionOpen(true)}
                  onSelectCustomer={(id) => handleSelectCustomer(id, 'interactions')}
                />
              )}

              {activeTab === 'insights' && <InsightsView />}

              {activeTab === 'demo' && (
                <DemoView onRefreshGlobalData={loadInitialData} />
              )}

              {activeTab === 'settings' && (
                <SettingsView hindsightStatus={hindsightStatus} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <HindsightStatusModal
        status={hindsightStatus}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      <JudgeModeModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onRunDemo={() => {
          setActiveTab('demo');
        }}
      />

      <AddInteractionModal
        isOpen={isAddInteractionOpen}
        onClose={() => setIsAddInteractionOpen(false)}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onInteractionAdded={loadInitialData}
      />
    </div>
  );
}

export default App;
