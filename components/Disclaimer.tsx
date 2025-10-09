
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
            <span className="font-bold">AI-Generated Analysis:</span> This tool provides suggestions based on clinical guidelines but is{' '}
            <span className="font-bold underline">not a substitute for professional medical advice</span>.
            Always consult with a qualified healthcare provider for diagnosis and treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
