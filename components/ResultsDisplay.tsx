
import React, { useRef, useState, useMemo } from 'react';
import { AnalysisResult, HistoryEntry, PatientProfile, PatientData } from '../types';
import { ClipboardListIcon, LightbulbIcon, DownloadIcon, CompareIcon, TrendingUpIcon, TrendingDownIcon, ArrowRightIcon, FileTextIcon, UserIcon } from './Icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  comparisonEntries?: HistoryEntry[];
  isComparisonMode: boolean;
  activeEntry?: HistoryEntry;
  onUpdateProfile?: (profile: PatientProfile) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AnalysisCard: React.FC<{ 
  title: string; 
  evaluation: string; 
  recommendations: string[];
  footerAction?: React.ReactNode;
}> = ({ title, evaluation, recommendations, footerAction }) => (
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

    {footerAction && (
      <div className="mt-6 pt-4 border-t border-slate-100">
        {footerAction}
      </div>
    )}
  </div>
);

const MBDTipsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <LightbulbIcon className="w-5 h-5 text-yellow-300" />
            <h3 className="text-lg font-bold">Dicas de Autocuidado para DMO</h3>
          </div>
          <p className="text-blue-100 text-xs">Orientações baseadas nos protocolos clínicos (PCDT) para gestão de saúde óssea.</p>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Uso Correto de Quelantes</h5>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">O carbonato de cálcio ou sevelâmer deve ser ingerido <strong>durante a refeição</strong>. O objetivo é que o remédio "encontre" o fósforo no estômago antes dele ser absorvido.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Controle de Fósforo Orgânico vs Inorgânico</h5>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">Dê preferência a proteínas frescas. Evite aditivos (inorgânicos) comuns em refrigerantes de cola e alimentos embutidos, cuja absorção pelo corpo chega a 100%.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Prevenção de Calcificação Vascular</h5>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">Manter o produto Cálcio x Fósforo abaixo de 55 é vital. Isso evita que o cálcio se deposite em suas artérias, protegendo o coração.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Importância da Diálise</h5>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">A diálise é sua aliada na remoção de solutos urêmicos. Cumpra o tempo integral de cada sessão prescrita para garantir a depuração adequada.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">5</div>
              <div>
                <h5 className="text-sm font-bold text-slate-800">Monitoramento Constante</h5>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">Dores ósseas ou prurido (coceira) podem ser sinais de desequilíbrio mineral. Informe sempre sua equipe de nefrologia sobre esses sintomas.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Fechar Orientações
          </button>
        </div>
      </div>
    </div>
  );
};

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

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, error, comparisonEntries, isComparisonMode, activeEntry, onUpdateProfile }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showMBDTips, setShowMBDTips] = useState(false);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  const [profileData, setProfileData] = useState<PatientProfile>(activeEntry?.patientProfile || { name: '', patientId: '', dob: '' });

  // Update profile data when active entry changes
  React.useEffect(() => {
    if (activeEntry?.patientProfile) {
      setProfileData(activeEntry.patientProfile);
    } else {
      setProfileData({ name: '', patientId: '', dob: '' });
    }
  }, [activeEntry]);

  const handleDownloadJSON = () => {
    if (!result) return;

    const dataToExport = activeEntry || { result, timestamp: Date.now() };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    
    const link = document.createElement("a");
    link.href = jsonString;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `analise-drc-${timestamp}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    
    setIsExportingPDF(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f1f5f9', // Matching slate-100
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = activeEntry?.patientProfile?.name 
        ? `relatorio-drc-${activeEntry.patientProfile.name.replace(/\s+/g, '-')}`
        : `relatorio-drc-${new Date().getTime()}`;

      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(profileData);
      setShowProfileForm(false);
    }
  };

  const pcdtGoals = useMemo(() => {
    if (!activeEntry?.patientData) return null;
    const stage = activeEntry.patientData.ckdStage;
    return {
      hemoglobin: "10.0 - 12.0 g/dL",
      ferritin: stage === '5D' ? "> 200 ng/mL" : "> 100 ng/mL",
      tsat: "> 20%",
      calcium: "8.5 - 10.0 mg/dL",
      phosphorus: stage === '5D' ? "< 5.5 mg/dL" : "< 4.5 mg/dL",
      pth: stage === '5D' ? "150 - 600 pg/mL" : "Limites Normais",
      alkalinePhosphatase: "Monitorar Tendência"
    };
  }, [activeEntry]);

  const TableView = () => {
    if (!activeEntry || !result || !pcdtGoals) return null;
    
    const rows = [
      { section: 'Anemia', label: 'Hemoglobina', value: activeEntry.patientData.hemoglobin, unit: 'g/dL', goal: pcdtGoals.hemoglobin, recommendations: result.anemiaAnalysis.recommendations.filter(r => r.toLowerCase().includes('hemoglobina') || r.toLowerCase().includes('eritropoese') || r.toLowerCase().includes('alfaepoetina')) },
      { section: 'Anemia', label: 'Ferritina', value: activeEntry.patientData.ferritin, unit: 'ng/mL', goal: pcdtGoals.ferritin, recommendations: result.anemiaAnalysis.recommendations.filter(r => r.toLowerCase().includes('ferro') || r.toLowerCase().includes('ferritina')) },
      { section: 'Anemia', label: 'IST', value: activeEntry.patientData.tsat, unit: '%', goal: pcdtGoals.tsat, recommendations: result.anemiaAnalysis.recommendations.filter(r => r.toLowerCase().includes('saturação') || r.toLowerCase().includes('ist') || r.toLowerCase().includes('ferro')) },
      { section: 'DMO', label: 'Cálcio', value: activeEntry.patientData.calcium, unit: 'mg/dL', goal: pcdtGoals.calcium, recommendations: result.mbdAnalysis.recommendations.filter(r => r.toLowerCase().includes('cálcio')) },
      { section: 'DMO', label: 'Fósforo', value: activeEntry.patientData.phosphorus, unit: 'mg/dL', goal: pcdtGoals.phosphorus, recommendations: result.mbdAnalysis.recommendations.filter(r => r.toLowerCase().includes('fósforo') || r.toLowerCase().includes('quelante')) },
      { section: 'DMO', label: 'PTH', value: activeEntry.patientData.pth, unit: 'pg/mL', goal: pcdtGoals.pth, recommendations: result.mbdAnalysis.recommendations.filter(r => r.toLowerCase().includes('pth') || r.toLowerCase().includes('vitamina d') || r.toLowerCase().includes('cinacalcete') || r.toLowerCase().includes('calcidiol')) },
      { section: 'DMO', label: 'Fosf. Alcalina', value: activeEntry.patientData.alkalinePhosphatase, unit: 'U/L', goal: pcdtGoals.alkalinePhosphatase, recommendations: result.mbdAnalysis.recommendations.filter(r => r.toLowerCase().includes('fosfatase') || r.toLowerCase().includes('ósseo')) },
    ];

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Marcador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Meta PCDT</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recomendações Específicas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter mb-1 ${row.section === 'Anemia' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {row.section}
                    </span>
                    <div className="text-sm font-bold text-slate-800">{row.label}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-slate-900">{row.value}</span>
                    <span className="text-[10px] text-slate-400 ml-1">{row.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{row.goal}</span>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="list-disc list-inside space-y-1">
                      {(row.recommendations.length > 0 ? row.recommendations : ['Seguir plano de monitoramento geral.']).map((rec, ri) => (
                        <li key={ri} className="text-xs text-slate-600 leading-relaxed">{rec}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl min-h-[500px] border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isComparisonMode && comparisonEntries?.length === 2 ? 'Modo Comparação' : 'Análise de Exames'}
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {result && !isLoading && !isComparisonMode && (
              <>
                <div className="flex bg-white rounded-xl border border-slate-300 p-1 shadow-sm">
                  <button 
                    onClick={() => setViewType('cards')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${viewType === 'cards' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Cards
                  </button>
                  <button 
                    onClick={() => setViewType('table')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${viewType === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Tabela
                  </button>
                </div>
                <button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95"
                  title="Identificar Paciente"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Paciente
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95"
                  title="Exportar JSON"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  JSON
                </button>
              </>
          )}
          {(result || (isComparisonMode && comparisonEntries?.length === 2)) && !isLoading && (
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingPDF ? (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FileTextIcon className="w-4 h-4 mr-2" />
              )}
              {isExportingPDF ? 'Gerando...' : 'Exportar PDF'}
            </button>
          )}
        </div>
      </div>

      {showProfileForm && (
        <div className="mb-6 p-6 bg-white rounded-2xl shadow-md border border-blue-100 animate-in slide-in-from-top duration-300">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
            <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
            Dados de Identificação
          </h3>
          <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={profileData.name} 
                onChange={e => setProfileData({...profileData, name: e.target.value})}
                placeholder="Ex: João da Silva"
                className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prontuário / ID</label>
              <input 
                type="text" 
                value={profileData.patientId} 
                onChange={e => setProfileData({...profileData, patientId: e.target.value})}
                placeholder="Ex: 123456"
                className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data de Nasc.</label>
              <input 
                type="date" 
                value={profileData.dob} 
                onChange={e => setProfileData({...profileData, dob: e.target.value})}
                className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
               <button 
                 type="button" 
                 onClick={() => setShowProfileForm(false)}
                 className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
               >
                 Cancelar
               </button>
               <button 
                 type="submit"
                 className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
               >
                 Salvar Dados
               </button>
            </div>
          </form>
        </div>
      )}
      
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

      <div ref={contentRef} className="rounded-2xl overflow-hidden p-1">
        {!isLoading && !error && (result || isComparisonMode) && (
           <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">
                     {activeEntry?.patientProfile?.name || 'Paciente Não Identificado'}
                   </h3>
                   <div className="flex flex-wrap gap-x-6 gap-y-2">
                     {activeEntry?.patientProfile?.patientId && (
                       <span className="text-xs text-slate-500 flex items-center">
                         <span className="font-bold mr-1 text-slate-400">ID:</span> {activeEntry.patientProfile.patientId}
                       </span>
                     )}
                     {activeEntry?.patientProfile?.dob && (
                       <span className="text-xs text-slate-500 flex items-center">
                         <span className="font-bold mr-1 text-slate-400">NASC:</span> {new Date(activeEntry.patientProfile.dob).toLocaleDateString()}
                       </span>
                     )}
                     <span className="text-xs text-slate-500 flex items-center">
                       <span className="font-bold mr-1 text-slate-400">EXAME:</span> {new Date(activeEntry?.timestamp || Date.now()).toLocaleString()}
                     </span>
                   </div>
                </div>
                {!isComparisonMode && activeEntry?.patientData && (
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condição DRC</span>
                    <span className="text-sm font-bold text-blue-600">
                      Estágio {activeEntry.patientData.ckdStage} • {
                        activeEntry.patientData.dialysisType === 'Hemodialysis' ? 'HD' : 
                        activeEntry.patientData.dialysisType === 'Peritoneal Dialysis' ? 'DP' : 'Conservador'
                      }
                    </span>
                  </div>
                )}
             </div>
           </div>
        )}

        {!isLoading && !error && isComparisonMode && comparisonEntries?.length === 2 && (
          <ComparisonView entries={comparisonEntries} />
        )}

        {!isLoading && !error && result && !isComparisonMode && (
          <>
            {viewType === 'cards' ? (
              <div className="space-y-6">
                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-100">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-200">Visão Geral da Saúde Renal</h4>
                  <p className="text-base font-medium leading-relaxed">{result.overallSummary}</p>
                </div>
                <AnalysisCard title="Gerenciamento de Anemia" {...result.anemiaAnalysis} />
                <AnalysisCard 
                  title="Metabolismo Mineral e Ósseo" 
                  {...result.mbdAnalysis} 
                  footerAction={
                    <div 
                      onClick={() => setShowMBDTips(true)}
                      className="cursor-pointer bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between group hover:bg-blue-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                          <LightbulbIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-blue-800">Dicas de Autocuidado para DMO</h5>
                          <p className="text-[10px] text-blue-600 font-medium">Clique para ver orientações práticas do PCDT</p>
                        </div>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-sm mb-4">
                   <p className="text-sm font-medium leading-relaxed italic">"{result.overallSummary}"</p>
                </div>
                <TableView />
                <div className="flex justify-end">
                   <button 
                      onClick={() => setShowMBDTips(true)}
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <LightbulbIcon className="w-4 h-4 mr-2 text-yellow-500" />
                      Dicas de Autocuidado para DMO
                    </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <MBDTipsModal isOpen={showMBDTips} onClose={() => setShowMBDTips(false)} />
    </div>
  );
};

export default ResultsDisplay;
