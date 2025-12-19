
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PatientData } from '../types';

interface PatientDataFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading: boolean;
  initialData?: PatientData;
}

const labelClass = "block text-sm font-medium text-slate-700";

const validationRanges: Partial<Record<keyof PatientData, { min: number; max: number; unit: string }>> = {
    egfr: { min: 1, max: 200, unit: 'mL/min' },
    hemoglobin: { min: 5, max: 18, unit: 'g/dL' },
    ferritin: { min: 10, max: 5000, unit: 'ng/mL' },
    tsat: { min: 1, max: 100, unit: '%' },
    calcium: { min: 6, max: 12, unit: 'mg/dL' },
    phosphorus: { min: 2, max: 12, unit: 'mg/dL' },
    pth: { min: 10, max: 5000, unit: 'pg/mL' },
    alkalinePhosphatase: { min: 20, max: 1000, unit: 'U/L' },
};

const PatientDataForm: React.FC<PatientDataFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<PatientData>(initialData || {
    ckdStage: '5D',
    dialysisType: 'Hemodialysis',
    egfr: 10,
    hemoglobin: 9.5,
    ferritin: 80,
    tsat: 18,
    calcium: 8.8,
    phosphorus: 6.1,
    pth: 750,
    alkalinePhosphatase: 110,
  });

  // Estados para a calculadora
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcData, setCalcData] = useState({ creatinine: 1.2, age: 60, sex: 'male' as 'male' | 'female' });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData]);

  const validateField = useCallback((name: keyof PatientData, value: number) => {
    const rules = validationRanges[name];
    if (rules) {
      if (isNaN(value)) {
        return 'Por favor, insira um número válido.';
      }
      if (value < rules.min || value > rules.max) {
        return `O valor deve estar entre ${rules.min} e ${rules.max} ${rules.unit}.`;
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

  const calculateCKDEPI = () => {
    const { creatinine, age, sex } = calcData;
    if (creatinine <= 0 || age <= 0) return;

    // Fórmula CKD-EPI (2021) sem fator de raça
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const constant = 142;
    const genderFactor = sex === 'female' ? 1.012 : 1.0;

    const minScrKappa = Math.min(creatinine / kappa, 1);
    const maxScrKappa = Math.max(creatinine / kappa, 1);

    const egfrValue = constant * Math.pow(minScrKappa, alpha) * Math.pow(maxScrKappa, -1.200) * Math.pow(0.9938, age) * genderFactor;
    const roundedEgfr = Math.round(egfrValue * 10) / 10;

    // Determinar estágio sugerido
    let suggestedStage: PatientData['ckdStage'] = '5';
    if (roundedEgfr >= 45 && roundedEgfr < 60) suggestedStage = '3a';
    else if (roundedEgfr >= 30 && roundedEgfr < 45) suggestedStage = '3b';
    else if (roundedEgfr >= 15 && roundedEgfr < 30) suggestedStage = '4';
    else if (roundedEgfr < 15) suggestedStage = '5';

    // Se o paciente já estiver marcado como 5D, manter 5D mas atualizar eGFR
    const finalStage = formData.ckdStage === '5D' || formData.dialysisType !== 'None' ? '5D' : suggestedStage;

    setFormData(prev => ({
      ...prev,
      egfr: roundedEgfr,
      ckdStage: finalStage
    }));
    setShowCalculator(false);
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dados do Exame</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <fieldset className="grid grid-cols-1 gap-y-4 gap-x-4">
          <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2 col-span-full flex justify-between items-center">
            Informações Gerais
            <button 
              type="button" 
              onClick={() => setShowCalculator(!showCalculator)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
            >
              {showCalculator ? "Fechar Calculadora" : "Calculadora CKD-EPI"}
            </button>
          </legend>

          {showCalculator && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 col-span-full grid grid-cols-2 md:grid-cols-4 gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-[10px] uppercase font-bold text-blue-800">Creatinina</label>
                <input type="number" step="0.01" value={calcData.creatinine} onChange={e => setCalcData({...calcData, creatinine: parseFloat(e.target.value)})} className="mt-1 block w-full text-xs rounded border-blue-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-blue-800">Idade</label>
                <input type="number" value={calcData.age} onChange={e => setCalcData({...calcData, age: parseInt(e.target.value)})} className="mt-1 block w-full text-xs rounded border-blue-200 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-blue-800">Sexo</label>
                <select value={calcData.sex} onChange={e => setCalcData({...calcData, sex: e.target.value as any})} className="mt-1 block w-full text-xs rounded border-blue-200 focus:ring-blue-500 focus:border-blue-500">
                  <option value="male">Masc</option>
                  <option value="female">Fem</option>
                </select>
              </div>
              <button type="button" onClick={calculateCKDEPI} className="h-9 px-3 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors">
                Calcular
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ckdStage" className={labelClass}>Estágio da DRC</label>
              <select id="ckdStage" name="ckdStage" value={formData.ckdStage} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="3a">Estágio 3a (TFG 45-59)</option>
                <option value="3b">Estágio 3b (TFG 30-44)</option>
                <option value="4">Estágio 4 (TFG 15-29)</option>
                <option value="5">Estágio 5 (TFG < 15)</option>
                <option value="5D">Estágio 5D (em diálise)</option>
              </select>
            </div>
            <div>
              <label htmlFor="egfr" className={labelClass}>TFG Estimada <span className="text-xs text-slate-500">(mL/min)</span></label>
              <input type="number" name="egfr" id="egfr" value={formData.egfr} onChange={handleChange} required step="0.1" className={getInputClass('egfr')} />
              {errors.egfr && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.egfr}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="dialysisType" className={labelClass}>Tipo de Diálise</label>
            <select id="dialysisType" name="dialysisType" value={formData.dialysisType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="Hemodialysis">Hemodiálise</option>
              <option value="Peritoneal Dialysis">Diálise Peritoneal</option>
              <option value="None">Nenhuma</option>
            </select>
          </div>
        </fieldset>

        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-4">
          <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2 col-span-full">Painel de Anemia</legend>
          <div>
              <label htmlFor="hemoglobin" className={labelClass}>Hb <span className="text-xs text-slate-500">(g/dL)</span></label>
              <input type="number" name="hemoglobin" id="hemoglobin" value={formData.hemoglobin} onChange={handleChange} required step="0.1" className={getInputClass('hemoglobin')} />
              {errors.hemoglobin && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.hemoglobin}</p>}
          </div>
          <div>
              <label htmlFor="ferritin" className={labelClass}>Ferritina <span className="text-xs text-slate-500">(ng/mL)</span></label>
              <input type="number" name="ferritin" id="ferritin" value={formData.ferritin} onChange={handleChange} required step="1" className={getInputClass('ferritin')} />
              {errors.ferritin && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.ferritin}</p>}
          </div>
          <div>
              <label htmlFor="tsat" className={labelClass}>IST <span className="text-xs text-slate-500">(%)</span></label>
              <input type="number" name="tsat" id="tsat" value={formData.tsat} onChange={handleChange} required step="1" className={getInputClass('tsat')} />
              {errors.tsat && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.tsat}</p>}
          </div>
        </fieldset>
        
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
          <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2 col-span-full">Painel de DMO</legend>
          <div>
              <label htmlFor="calcium" className={labelClass}>Cálcio <span className="text-xs text-slate-500">(mg/dL)</span></label>
              <input type="number" name="calcium" id="calcium" value={formData.calcium} onChange={handleChange} required step="0.1" className={getInputClass('calcium')} />
              {errors.calcium && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.calcium}</p>}
          </div>
          <div>
              <label htmlFor="phosphorus" className={labelClass}>Fósforo <span className="text-xs text-slate-500">(mg/dL)</span></label>
              <input type="number" name="phosphorus" id="phosphorus" value={formData.phosphorus} onChange={handleChange} required step="0.1" className={getInputClass('phosphorus')} />
              {errors.phosphorus && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.phosphorus}</p>}
          </div>
          <div>
              <label htmlFor="pth" className={labelClass}>PTH <span className="text-xs text-slate-500">(pg/mL)</span></label>
              <input type="number" name="pth" id="pth" value={formData.pth} onChange={handleChange} required step="1" className={getInputClass('pth')} />
              {errors.pth && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.pth}</p>}
          </div>
          <div>
              <label htmlFor="alkalinePhosphatase" className={labelClass}>F. Alcalina <span className="text-xs text-slate-500">(U/L)</span></label>
              <input type="number" name="alkalinePhosphatase" id="alkalinePhosphatase" value={formData.alkalinePhosphatase} onChange={handleChange} required step="1" className={getInputClass('alkalinePhosphatase')} />
              {errors.alkalinePhosphatase && <p className="mt-1 text-[10px] text-red-600 leading-tight">{errors.alkalinePhosphatase}</p>}
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
                Analisando...
              </>
            ) : 'Analisar Exames'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientDataForm;
