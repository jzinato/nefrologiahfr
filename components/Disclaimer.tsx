import React from 'react';
import { AlertTriangleIcon } from './Icons';

const Disclaimer: React.FC = () => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <span className="font-bold">Análise Gerada por IA:</span> Esta ferramenta fornece sugestões baseadas em diretrizes clínicas, mas{' '}
            <span className="font-bold underline">não substitui o aconselhamento médico profissional</span>.
            Sempre consulte um profissional de saúde qualificado para diagnóstico e decisões de tratamento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;