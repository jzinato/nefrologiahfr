import React, { useState } from 'react';
import { PatientData, AnalysisResult } from './types';
import { analyzePatientData } from './services/geminiService';
import PatientDataForm from './components/PatientDataForm';
import ResultsDisplay from './components/ResultsDisplay';
import Disclaimer from './components/Disclaimer';
import { StethoscopeIcon, ZapIcon } from './components/Icons';

const App: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (data: PatientData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setPatientData(data);
    try {
      const result = await analyzePatientData(data);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar os dados. Por favor, verifique sua chave de API e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-full">
              <StethoscopeIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">IA Analisador de Exames DRC</h1>
          </div>
           <div className="flex items-center space-x-2 text-sm text-slate-500">
             <ZapIcon className="w-4 h-4 text-yellow-500" />
            <span>Powered by Gemini</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Disclaimer />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <PatientDataForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-3">
            <ResultsDisplay
              result={analysisResult}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
      
      <footer className="text-center py-4 mt-8 text-sm text-slate-500 border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} IA Analisador de Exames DRC. Apenas para fins educacionais e informativos.</p>
      </footer>
    </div>
  );
};

export default App;