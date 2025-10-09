import React from 'react';
import { AnalysisResult } from '../types';
import { ClipboardListIcon, LightbulbIcon, DownloadIcon } from './Icons';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
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
        <h4 className="font-semibold">Evaluation</h4>
      </div>
      <p className="text-slate-700 text-sm leading-relaxed">{evaluation}</p>
    </div>

    <div>
      <div className="flex items-center text-slate-600 mb-2">
        <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
        <h4 className="font-semibold">Recommendations</h4>
      </div>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, error }) => {

  const handleDownload = () => {
    if (!result) return;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    
    const link = document.createElement("a");
    link.href = jsonString;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `ckd-analysis-${timestamp}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-slate-100 p-6 rounded-lg min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">AI Analysis & Recommendations</h2>
        {result && !isLoading && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Download analysis results"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download
            </button>
        )}
      </div>
      
      {isLoading && <LoadingSpinner />}
      
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

      {!isLoading && !error && !result && (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
          <ClipboardListIcon className="w-16 h-16 mb-4 text-slate-300" />
          <p>Your analysis results will appear here.</p>
          <p className="text-sm">Please fill out the form and click "Analyze".</p>
        </div>
      )}

      {result && (
        <div>
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mb-6">
            <h4 className="font-bold">Overall Summary</h4>
            <p className="mt-1 text-sm">{result.overallSummary}</p>
          </div>
          <AnalysisCard title="Anemia Analysis" {...result.anemiaAnalysis} />
          <AnalysisCard title="Mineral & Bone Disorder Analysis" {...result.mbdAnalysis} />
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;