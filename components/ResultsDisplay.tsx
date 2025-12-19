
import React from 'react';
import { AnalysisResult, HistoryEntry } from '../types';
import { ClipboardListIcon, LightbulbIcon, DownloadIcon, CompareIcon, TrendingUpIcon, TrendingDownIcon, ArrowRightIcon } from './Icons';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  comparisonEntries?: HistoryEntry[];
  isComparisonMode: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AnalysisCard: React.FC<{ title: string; evaluation: string; recommendations: string[] }> = ({ title, evaluation, recommendations }) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
    
    <div className="mb-4">
      <div className="flex items-center text-slate-600 mb-2">
        <ClipboardListIcon className="w-5 h-5 mr-2 text-blue-600" />
        <h4 className="font-semibold">Avaliação</h4>
      </div>
      <p className="text-slate-700 text-sm leading-relaxed">{evaluation}</p>
    </div>

    <div>
      <div className="flex items-center text-slate-600 mb-2">
        <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
        <h4 className="font-semibold">Recomendações</h4>
      </div>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
);

const ComparisonView: React.FC<{ entries: HistoryEntry[] }> = ({ entries }) => {
  // Sort by date (oldest first for comparison)
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const [prev, current] = sorted;

  const LabRow: React.FC<{ label: string; field: keyof HistoryEntry['patientData']; unit: string }> = ({ label, field, unit }) => {
    const valPrev = prev.patientData[field] as number;
    const valCurr = current.patientData[field] as number;
    const diff = valCurr - valPrev;
    
    return (
      <tr className="border-b border-slate-100 last:border-0">
        <td className="py-3 text-sm font-medium text-slate-600">{label}</td>
        <td className="py-3 text-center text-sm text-slate-500">{valPrev} {unit}</td>
        <td className="py-3 text-center">
          <div className="flex items-center justify-center gap-1">
             <ArrowRightIcon className="w-3 h-3 text-slate-300" />
             {diff > 0 ? (
               <span className="text-[10px] font-bold text-blue-600 flex items-center">
                 <TrendingUpIcon className="w-3 h-3 mr-0.5" /> +{diff.toFixed(1)}
               </span>
             ) : diff < 0 ? (
               <span className="text-[10px] font-bold text-orange-600 flex items-center">
                 <TrendingDownIcon className="w-3 h-3 mr-0.5" /> {diff.toFixed(1)}
               </span>
             ) : (
               <span className="text-[10px] font-bold text-slate-400">0.0</span>
             )}
          </div>
        </td>
        <td className="py-3 text-center text-sm font-bold text-slate-800">{valCurr} {unit}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <CompareIcon className="w-5 h-5 mr-2 text-blue-600" />
          Tendência de Marcadores Laboratoriais
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th className="pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Marcador</th>
                <th className="pb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Anterior ({new Date(prev.timestamp).toLocaleDateString()})</th>
                <th className="pb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Evolução</th>
                <th className="pb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Atual ({new Date(current.timestamp).toLocaleDateString()})</th>
              </tr>
            </thead>
            <tbody>
              <LabRow label="Hemoglobina" field="hemoglobin" unit="g/dL" />
              <LabRow label="Ferritina" field="ferritin" unit="ng/mL" />
              <LabRow label="IST" field="tsat" unit="%" />
              <LabRow label="Cálcio" field="calcium" unit="mg/dL" />
              <LabRow label="Fósforo" field="phosphorus" unit="mg/dL" />
              <LabRow label="PTH" field="pth" unit="pg/mL" />
              <LabRow label="F. Alcalina" field="alkalinePhosphatase" unit="U/L" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
           <p className="text-xs font-bold text-slate-400 uppercase mb-3">Resumo Anterior</p>
           <p className="text-sm text-slate-600 italic">"{prev.result.overallSummary}"</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
           <p className="text-xs font-bold text-blue-400 uppercase mb-3">Resumo Atual</p>
           <p className="text-sm text-blue-900 font-medium">"{current.result.overallSummary}"</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="font-bold text-slate-800 mb-4">Comparação de Recomendações (Atual)</h4>
        <ul className="grid grid-cols-1 gap-3">
          {current.result.anemiaAnalysis.recommendations.concat(current.result.mbdAnalysis.recommendations).map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded">
              <LightbulbIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, error, comparisonEntries, isComparisonMode }) => {

  const handleDownload = () => {
    if (!result) return;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    
    const link = document.createElement("a");
    link.href = jsonString;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `analise-drc-${timestamp}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-slate-100 p-6 rounded-lg min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {isComparisonMode && comparisonEntries?.length === 2 ? 'Modo Comparação' : 'Análise e Recomendações da IA'}
        </h2>
        {result && !isLoading && !isComparisonMode && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Baixar resultados da análise"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Baixar
            </button>
        )}
      </div>
      
      {isLoading && <LoadingSpinner />}
      
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

      {!isLoading && !error && !result && !isComparisonMode && (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
          <ClipboardListIcon className="w-16 h-16 mb-4 text-slate-300" />
          <p>Os resultados da sua análise aparecerão aqui.</p>
          <p className="text-sm">Por favor, preencha o formulário e clique em "Analisar".</p>
        </div>
      )}

      {!isLoading && !error && isComparisonMode && comparisonEntries?.length !== 2 && (
         <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <CompareIcon className="w-16 h-16 mb-4 text-slate-300 opacity-50" />
            <p className="text-lg font-medium">Modo Comparação Ativo</p>
            <p className="text-sm">Selecione exatamente 2 exames na lista à esquerda para ver a comparação.</p>
         </div>
      )}

      {!isLoading && !error && isComparisonMode && comparisonEntries?.length === 2 && (
        <ComparisonView entries={comparisonEntries} />
      )}

      {!isLoading && !error && result && !isComparisonMode && (
        <div>
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mb-6">
            <h4 className="font-bold">Resumo Geral</h4>
            <p className="mt-1 text-sm">{result.overallSummary}</p>
          </div>
          <AnalysisCard title="Análise de Anemia" {...result.anemiaAnalysis} />
          <AnalysisCard title="Análise de Distúrbio Mineral e Ósseo" {...result.mbdAnalysis} />
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
