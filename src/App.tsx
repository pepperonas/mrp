import { useEffect, useState } from 'react';
import { useSettingsStore } from './stores/useSettingsStore';
import { useApiKeysStore } from './stores/useApiKeysStore';
import { useMetapromptsStore } from './stores/useMetapromptsStore';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Metaprompts from './pages/Metaprompts';
import Settings from './pages/Settings';
import History from './pages/History';
import Header from './components/layout/Header';
import StatusBar from './components/layout/StatusBar';
import type { Provider } from './types';

type Page = 'dashboard' | 'api-keys' | 'metaprompts' | 'settings' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { loadSettings, settings } = useSettingsStore();
  const { loadApiKey } = useApiKeysStore();
  const { loadMetaprompts } = useMetapromptsStore();

  useEffect(() => {
    // Initial load
    loadSettings();
    loadMetaprompts();
    
    // Load all API keys
    (['openai', 'anthropic', 'grok', 'gemini'] as Provider[]).forEach(provider => {
      loadApiKey(provider);
    });

    // Listen for provider changes from tray
    const unsubscribeProvider = window.mrp.onProviderChange((provider: Provider) => {
      useSettingsStore.getState().updateSettings({ activeProvider: provider });
    });

    const unsubscribeMetaprompt = window.mrp.onMetapromptChange((id: string) => {
      useSettingsStore.getState().updateSettings({ activeMetapromptId: id });
    });

    return () => {
      unsubscribeProvider();
      unsubscribeMetaprompt();
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'api-keys':
        return <ApiKeys />;
      case 'metaprompts':
        return <Metaprompts />;
      case 'settings':
        return <Settings />;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
      <StatusBar />
    </div>
  );
}

export default App;

