
import React, { useState, useEffect, useMemo } from 'react';
import { PatientData, AnalysisResult, HistoryEntry, PatientProfile } from './types';
import { analyzePatientData } from './services/geminiService';
import PatientDataForm from './components/PatientDataForm';
import ResultsDisplay from './components/ResultsDisplay';
import Disclaimer from './components/Disclaimer';
import HistoryList from './components/HistoryList';
import { StethoscopeIcon, ZapIcon } from './components/Icons';

const App: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('drc_exam_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('drc_exam_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (data: PatientData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPatientData(data);
    setActiveHistoryId(undefined);
    setIsComparisonMode(false);
    
    try {
      const result = await analyzePatientData(data);
      setAnalysisResult(result);
      
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        patientData: data,
        result: result
      };
      setHistory(prev => [newEntry, ...prev]);
      setActiveHistoryId(newEntry.id);
      
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHistoryEntry = (id: string, profile: PatientProfile) => {
    setHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, patientProfile: profile } : entry
    ));
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    if (isComparisonMode) {
      handleToggleSelectForComparison(entry.id);
      return;
    }
    setPatientData(entry.patientData);
    setAnalysisResult(entry.result);
    setActiveHistoryId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(undefined);
      setAnalysisResult(null);
    }
    setSelectedComparisonIds(prev => prev.filter(cid => cid !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm("Apagar todo o histórico?")) {
      setHistory([]);
      setActiveHistoryId(undefined);
      setSelectedComparisonIds([]);
      setAnalysisResult(null);
    }
  };

  const handleToggleComparisonMode = () => {
    setIsComparisonMode(prev => !prev);
    setSelectedComparisonIds([]);
  };

  const handleToggleSelectForComparison = (id: string) => {
    setSelectedComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[0], id];
    });
  };

  const activeHistoryEntry = useMemo(() => {
    return history.find(h => h.id === activeHistoryId);
  }, [history, activeHistoryId]);

  const comparisonEntries = useMemo(() => {
    return history.filter(h => selectedComparisonIds.includes(h.id));
  }, [history, selectedComparisonIds]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-full">
              <StethoscopeIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">IA Analisador de Exames DRC</h1>
          </div>
           <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
             <ZapIcon className="w-4 h-4 text-yellow-500" />
            <span>Powered by Gemini</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <Disclaimer />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <PatientDataForm 
              onSubmit={handleAnalyze} 
              isLoading={isLoading} 
              initialData={(activeHistoryId && patientData) ? patientData : undefined} 
            />
            <HistoryList 
              entries={history} 
              onSelect={handleSelectHistory} 
              onDelete={handleDeleteHistory} 
              onClearAll={handleClearHistory}
              currentId={activeHistoryId}
              isComparisonMode={isComparisonMode}
              onToggleComparisonMode={handleToggleComparisonMode}
              selectedComparisonIds={selectedComparisonIds}
              onToggleSelectForComparison={handleToggleSelectForComparison}
            />
          </div>
          <div className="lg:col-span-8">
            <ResultsDisplay
              result={analysisResult}
              isLoading={isLoading}
              error={error}
              isComparisonMode={isComparisonMode}
              comparisonEntries={comparisonEntries}
              activeEntry={activeHistoryEntry}
              onUpdateProfile={activeHistoryId ? (profile) => handleUpdateHistoryEntry(activeHistoryId, profile) : undefined}
            />
          </div>
        </div>
      </main>
      
      <footer className="text-center py-8 mt-8 text-sm text-slate-500 border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} IA Analisador de Exames DRC.</p>
      </footer>
    </div>
  );
};

export default App;
