import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard.js';
import { CodeExplainer } from './components/explainer/CodeExplainer.js';
import { ChatInterface } from './components/chat/ChatInterface.js';
import { GraphVisualizer } from './components/graph/GraphVisualizer.js';
import { TemporalTimeline } from './components/timeline/TemporalTimeline.js';
import { DecisionExplorer } from './components/decisions/DecisionExplorer.js';
import { EvaluationSuite } from './components/eval/EvaluationSuite.js';
import { RepoModal } from './components/repository/RepoModal.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { AuthProvider } from './context/AuthContext.js';
import { fetchRepositories, syncRepository } from './api/client.js';
import { RepositorySummary } from './types/index.js';

function MainApp() {
  const [repositories, setRepositories] = useState<RepositorySummary[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositorySummary | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explainer' | 'chat' | 'graph' | 'timeline' | 'decisions' | 'eval'>('dashboard');
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      const data = await fetchRepositories();
      setRepositories(data);
      if (data.length > 0 && !selectedRepo) {
        setSelectedRepo(data[0]);
      }
    } catch (err) {
      console.error('Failed to load repositories:', err);
    }
  };

  const handleSync = async () => {
    if (!selectedRepo || isSyncing) return;
    setIsSyncing(true);
    try {
      const updated = await syncRepository(selectedRepo.id);
      setSelectedRepo(updated);
      await loadRepos();
    } catch (err) {
      console.error('Failed to sync repo:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelectRepo={(repo) => setSelectedRepo(repo)}
        onSyncRepo={handleSync}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isSyncing={isSyncing}
      />

      <main className="flex-1 flex w-full overflow-hidden">
        {activeTab === 'dashboard' && (
          <ProjectDashboard
            repositories={repositories}
            onSelectProject={(repo) => {
              setSelectedRepo(repo);
              setActiveTab('chat');
            }}
            onOpenIngestModal={() => setIsIngestModalOpen(true)}
            onRefreshRepos={loadRepos}
          />
        )}

        {selectedRepo && activeTab === 'explainer' && (
          <CodeExplainer repositoryId={selectedRepo.id} />
        )}

        {selectedRepo && activeTab === 'chat' && (
          <ChatInterface repository={selectedRepo} />
        )}

        {selectedRepo && activeTab === 'graph' && (
          <GraphVisualizer repositoryId={selectedRepo.id} />
        )}

        {selectedRepo && activeTab === 'timeline' && (
          <TemporalTimeline repositoryId={selectedRepo.id} />
        )}

        {selectedRepo && activeTab === 'decisions' && (
          <DecisionExplorer repositoryId={selectedRepo.id} />
        )}

        {activeTab === 'eval' && <EvaluationSuite />}
      </main>

      <RepoModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onRepositoryIngested={(newRepo) => {
          setRepositories((prev) => [...prev, newRepo]);
          setSelectedRepo(newRepo);
          setActiveTab('dashboard');
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
