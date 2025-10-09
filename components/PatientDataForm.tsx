import React, { useState, useCallback, useMemo } from 'react';
import { PatientData } from '../types';

interface PatientDataFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading: boolean;
}

const labelClass = "block text-sm font-medium text-slate-700";

const validationRanges: Partial<Record<keyof PatientData, { min: number; max: number; unit: string }>> = {
    hemoglobin: { min: 5, max: 18, unit: 'g/dL' },
    ferritin: { min: 10, max: 5000, unit: 'ng/mL' },
    tsat: { min: 1, max: 100, unit: '%' },
    calcium: { min: 6, max: 12, unit: 'mg/dL' },
    phosphorus: { min: 2, max: 12, unit: 'mg/dL' },
    pth: { min: 10, max: 5000, unit: 'pg/mL' },
    alkalinePhosphatase: { min: 20, max: 1000, unit: 'U/L' },
};

const PatientDataForm: React.FC<PatientDataFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PatientData>({
    ckdStage: '5D',
    dialysisType: 'Hemodialysis',
    hemoglobin: 9.5,
    ferritin: 80,
    tsat: 18,
    calcium: 8.8,
    phosphorus: 6.1,
    pth: 750,
    alkalinePhosphatase: 110,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientData, string>>>({});

  const validateField = useCallback((name: keyof PatientData, value: number) => {
    const rules = validationRanges[name];
    if (rules) {
      if (isNaN(value)) {
        return 'Please enter a valid number.';
      }
      if (value < rules.min || value > rules.max) {
        return `Value must be between ${rules.min} and ${rules.max} ${rules.unit}.`;
      }
    }
    return '';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof PatientData;
    const isNumber = (e.target as HTMLInputElement).type === 'number';
    const parsedValue = isNumber ? parseFloat(value) : value;

    setFormData(prev => ({
      ...prev,
      [key]: parsedValue,
    }));
    
    if (isNumber) {
        const error = validateField(key, parseFloat(value));
        setErrors(prev => ({
            ...prev,
            [key]: error,
        }));
    }
  };

  const formIsValid = useMemo(() => {
    return Object.values(errors).every(error => !error) && 
           Object.keys(validationRanges).every(key => !validateField(key as keyof PatientData, formData[key as keyof PatientData] as number));
  }, [formData, errors, validateField]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formIsValid) {
      onSubmit(formData);
    } else {
      // Trigger validation for all fields on submit attempt
      let allErrors: Partial<Record<keyof PatientData, string>> = {};
      (Object.keys(formData) as Array<keyof PatientData>).forEach(key => {
          if(validationRanges[key]) {
              const error = validateField(key, formData[key] as number);
              if (error) {
                  allErrors[key] = error;
              }
          }
      });
      setErrors(allErrors);
    }
  };

  const getInputClass = (fieldName: keyof PatientData) => {
    return `mt-1 block w-full shadow-sm sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors[fieldName] ? 'border-red-500' : 'border-slate-300'}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Patient Lab Data</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <fieldset className="grid grid-cols-1 gap-y-4 gap-x-4">
          <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2 col-span-full">General Information</legend>
          <div>
            <label htmlFor="ckdStage" className={labelClass}>CKD Stage</label>
            <select id="ckdStage" name="ckdStage" value={formData.ckdStage} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="3a">Stage 3a</option>
              <option value="3b">Stage 3b</option>
              <option value="4">Stage 4</option>
              <option value="5">Stage 5 (non-dialysis)</option>
              <option value="5D">Stage 5D (dialysis)</option>
            </select>
          </div>
          <div>
            <label htmlFor="dialysisType" className={labelClass}>Dialysis Type</label>
            <select id="dialysisType" name="dialysisType" value={formData.dialysisType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>Hemodialysis</option>
              <option>Peritoneal Dialysis</option>
              <option>None</option>
            </select>
          </div>
        </fieldset>

        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-4">
          <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2 col-span-full">Anemia Panel</legend>
          <div>
              <label htmlFor="hemoglobin" className={labelClass}>Hemoglobin <span className="text-xs text-slate-500">(g/dL)</span></label>
              <input type="number" name="hemoglobin" id="hemoglobin" value={formData.hemoglobin} onChange={handleChange} required step="0.1" className={getInputClass('hemoglobin')} />
              {errors.hemoglobin && <p className="mt-1 text-xs text-red-600">{errors.hemoglobin}</p>}
          </div>
          <div>
              <label htmlFor="ferritin" className={labelClass}>Ferritin <span className="text-xs text-slate-500">(ng/mL)</span></label>
              <input type="number" name="ferritin" id="ferritin" value={formData.ferritin} onChange={handleChange} required step="1" className={getInputClass('ferritin')} />
              {errors.ferritin && <p className="mt-1 text-xs text-red-600">{errors.ferritin}</p>}
          </div>
          <div>
              <label htmlFor="tsat" className={labelClass}>TSAT <span className="text-xs text-slate-500">(%)</span></label>
              <input type="number" name="tsat" id="tsat" value={formData.tsat} onChange={handleChange} required step="1" className={getInputClass('tsat')} />
              {errors.tsat && <p className="mt-1 text-xs text-red-600">{errors.tsat}</p>}
          </div>
        </fieldset>
        
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
          <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2 col-span-full">Mineral & Bone Disorder Panel</legend>
          <div>
              <label htmlFor="calcium" className={labelClass}>Calcium <span className="text-xs text-slate-500">(mg/dL)</span></label>
              <input type="number" name="calcium" id="calcium" value={formData.calcium} onChange={handleChange} required step="0.1" className={getInputClass('calcium')} />
              {errors.calcium && <p className="mt-1 text-xs text-red-600">{errors.calcium}</p>}
          </div>
          <div>
              <label htmlFor="phosphorus" className={labelClass}>Phosphorus <span className="text-xs text-slate-500">(mg/dL)</span></label>
              <input type="number" name="phosphorus" id="phosphorus" value={formData.phosphorus} onChange={handleChange} required step="0.1" className={getInputClass('phosphorus')} />
              {errors.phosphorus && <p className="mt-1 text-xs text-red-600">{errors.phosphorus}</p>}
          </div>
          <div>
              <label htmlFor="pth" className={labelClass}>PTH <span className="text-xs text-slate-500">(pg/mL)</span></label>
              <input type="number" name="pth" id="pth" value={formData.pth} onChange={handleChange} required step="1" className={getInputClass('pth')} />
              {errors.pth && <p className="mt-1 text-xs text-red-600">{errors.pth}</p>}
          </div>
          <div>
              <label htmlFor="alkalinePhosphatase" className={labelClass}>Alk Phos <span className="text-xs text-slate-500">(U/L)</span></label>
              <input type="number" name="alkalinePhosphatase" id="alkalinePhosphatase" onChange={handleChange} required step="1" className={getInputClass('alkalinePhosphatase')} />
              {errors.alkalinePhosphatase && <p className="mt-1 text-xs text-red-600">{errors.alkalinePhosphatase}</p>}
          </div>
        </fieldset>

        <div>
          <button
            type="submit"
            disabled={isLoading || !formIsValid}
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : 'Analyze Lab Results'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientDataForm;