
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
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  const [prev, current] = sorted;

  const LabRow: React.FC<{ label: string; field: keyof HistoryEntry['patientData']; unit: string }> = ({ label, field, unit }) => {
    const valPrev = prev.patientData[field] as number;
    const valCurr = current.patientData[field] as number;
    const diff = valCurr - valPrev;
    const percentChange = valPrev !== 0 ? (diff / valPrev) * 100 : 0;
    const isSignificant = Math.abs(percentChange) >= 10;
    
    return (
      <tr className={`border-b border-slate-100 last:border-0 transition-colors ${isSignificant ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}`}>
        <td className="py-4 pl-4 text-sm font-semibold text-slate-700">
          {label}
          {isSignificant && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-tight">
              Significativo
            </span>
          )}
        </td>
        <td className="py-4 text-center text-sm text-slate-400">
          {valPrev.toLocaleString('pt-BR')} <span className="text-[10px]">{unit}</span>
        </td>
        <td className="py-4 text-center">
          <div className="flex flex-col items-center justify-center">
             <div className="flex items-center gap-1.5">
                <ArrowRightIcon className="w-3 h-3 text-slate-300" />
                {diff > 0 ? (
                  <span className="text-xs font-bold text-blue-600 flex items-center">
                    <TrendingUpIcon className="w-3.5 h-3.5 mr-0.5" /> 
                    +{diff.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                ) : diff < 0 ? (
                  <span className="text-xs font-bold text-orange-600 flex items-center">
                    <TrendingDownIcon className="w-3.5 h-3.5 mr-0.5" /> 
                    {diff.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-300">Estável</span>
                )}
             </div>
             {diff !== 0 && (
               <span className={`text-[10px] font-medium ${isSignificant ? 'text-amber-600' : 'text-slate-400'}`}>
                 ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
               </span>
             )}
          </div>
        </td>
        <td className="py-4 pr-4 text-right">
          <span className={`text-base font-bold ${isSignificant ? 'text-slate-900' : 'text-slate-800'}`}>
            {valCurr.toLocaleString('pt-BR')}
          </span>
          <span className="ml-1 text-[10px] text-slate-500 font-medium">{unit}</span>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center">
            <CompareIcon className="w-4 h-4 mr-2 text-blue-600" />
            Tendências e Evolução Laboratorial
          </h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
             <div className="flex items-center text-slate-400">
               <span className="w-2 h-2 rounded-full bg-slate-200 mr-1"></span> Estável
             </div>
             <div className="flex items-center text-amber-600">
               <span className="w-2 h-2 rounded-full bg-amber-100 mr-1"></span> >10% Variação
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3 pl-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Marcador</th>
                <th className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Anterior ({new Date(prev.timestamp).toLocaleDateString()})</th>
                <th className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolução</th>
                <th className="py-3 pr-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Atual ({new Date(current.timestamp).toLocaleDateString()})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <LabRow label="Hemoglobina" field="hemoglobin" unit="g/dL" />
              <LabRow label="Ferritina" field="ferritin" unit="ng/mL" />
              <LabRow label="IST" field="tsat" unit="%" />
              <LabRow label="Cálcio" field="calcium" unit="mg/dL" />
              <LabRow label="Fósforo" field="phosphorus" unit="mg/dL" />
              <LabRow label="PTH" field="pth" unit="pg/mL" />
              <LabRow label="F. Alcalina" field="alkalinePhosphatase" unit="U/L" />
              <LabRow label="TFG Estimada" field="egfr" unit="mL/min" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contexto Anterior</p>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed italic">"{prev.result.overallSummary}"</p>
        </div>
        <div className="bg-blue-600 p-5 rounded-xl shadow-lg shadow-blue-200 text-white">
           <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Síntese Atual</p>
           </div>
           <p className="text-sm font-medium leading-relaxed">"{current.result.overallSummary}"</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <LightbulbIcon className="w-4 h-4 mr-2 text-yellow-500" />
          Plano de Ação Atualizado
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {current.result.anemiaAnalysis.recommendations.concat(current.result.mbdAnalysis.recommendations).map((rec, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                {i + 1}
              </span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
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
    <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl min-h-[500px] border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isComparisonMode && comparisonEntries?.length === 2 ? 'Modo Comparação' : 'Análise de Exames'}
        </h2>
        {result && !isLoading && !isComparisonMode && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"
              aria-label="Baixar resultados da análise"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Exportar
            </button>
        )}
      </div>
      
      {isLoading && <LoadingSpinner />}
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">!</span>
           </div>
           <p className="font-medium">{error}</p>
        </div>
      )}

      {!isLoading && !error && !result && !isComparisonMode && (
        <div className="flex flex-col items-center justify-center h-[400px] text-center text-slate-400">
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-slate-100">
            <ClipboardListIcon className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-lg font-bold text-slate-500">Pronto para analisar</p>
          <p className="text-sm max-w-xs mt-2">Insira os valores dos exames e clique em "Analisar" para gerar o relatório baseado no PCDT.</p>
        </div>
      )}

      {!isLoading && !error && isComparisonMode && comparisonEntries?.length !== 2 && (
         <div className="flex flex-col items-center justify-center h-[400px] text-center text-slate-400">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
              <CompareIcon className="w-10 h-10 text-blue-200" />
            </div>
            <p className="text-lg font-bold text-blue-600">Modo Comparação Ativo</p>
            <p className="text-sm max-w-xs mt-2">Selecione dois exames na lista lateral para visualizar as tendências e o progresso clínico.</p>
         </div>
      )}

      {!isLoading && !error && isComparisonMode && comparisonEntries?.length === 2 && (
        <ComparisonView entries={comparisonEntries} />
      )}

      {!isLoading && !error && result && !isComparisonMode && (
        <div className="space-y-6">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-100">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-200">Visão Geral da Saúde Renal</h4>
            <p className="text-base font-medium leading-relaxed">{result.overallSummary}</p>
          </div>
          <AnalysisCard title="Gerenciamento de Anemia" {...result.anemiaAnalysis} />
          <AnalysisCard title="Metabolismo Mineral e Ósseo" {...result.mbdAnalysis} />
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
