import React, { useState, useEffect } from 'react';
import { Customer, MemoryHealth, HindsightStatus, MemoryUnit } from './types';
import { fetchCustomers, fetchMemoryHealth, fetchHindsightStatus, fetchTimeline } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HindsightStatusModal } from './components/HindsightStatusModal';
import { JudgeModeModal } from './components/JudgeModeModal';
import { AddInteractionModal } from './components/AddInteractionModal';

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

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
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
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
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
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-white">Loading DealMind AI Workspace...</p>
                <p className="text-xs text-slate-400">Connecting to Hindsight memory bank...</p>
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
