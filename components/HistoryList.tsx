
import React from 'react';
import { HistoryEntry } from '../types';
import { HistoryIcon, TrashIcon, CompareIcon } from './Icons';

interface HistoryListProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  currentId?: string;
  isComparisonMode: boolean;
  onToggleComparisonMode: () => void;
  selectedComparisonIds: string[];
  onToggleSelectForComparison: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ 
  entries, 
  onSelect, 
  onDelete, 
  onClearAll, 
  currentId,
  isComparisonMode,
  onToggleComparisonMode,
  selectedComparisonIds,
  onToggleSelectForComparison
}) => {
  if (entries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="flex flex-col items-center justify-center text-slate-400 py-8">
          <HistoryIcon className="w-12 h-12 mb-2 opacity-20" />
          <p className="text-sm">Nenhum histórico disponível.</p>
        </div>
      </div>
    );
  }

  // Use shallow copy before sorting to avoid mutating props
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <HistoryIcon className="w-5 h-5 mr-2 text-blue-600" />
          Análises Anteriores
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={onToggleComparisonMode}
            className={`p-1.5 rounded-md transition-all ${isComparisonMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title="Modo Comparação"
          >
            <CompareIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {isComparisonMode && (
        <p className="text-[10px] text-blue-600 font-medium mb-3">
          Selecione 2 exames para comparar ({selectedComparisonIds.length}/2)
        </p>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedEntries.map((entry) => {
          const isSelected = selectedComparisonIds.includes(entry.id);
          const isActive = currentId === entry.id;

          return (
            <div 
              key={entry.id}
              className={`group relative p-3 rounded-md border transition-all cursor-pointer ${
                isComparisonMode
                  ? (isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300')
                  : (isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50')
              }`}
              onClick={() => isComparisonMode ? onToggleSelectForComparison(entry.id) : onSelect(entry)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-start gap-2">
                  {isComparisonMode && (
                    <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-500">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">
                        Hb: {entry.patientData.hemoglobin}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">
                        PTH: {entry.patientData.pth}
                      </span>
                    </div>
                  </div>
                </div>
                {!isComparisonMode && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                    title="Excluir"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
