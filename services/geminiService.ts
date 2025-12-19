
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, AnalysisResult } from '../types';
import { pcdtContext } from '../constants/pcdtContext';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    anemiaAnalysis: {
      type: Type.OBJECT,
      properties: {
        evaluation: { type: Type.STRING, description: 'Detailed evaluation of anemia parameters (Hemoglobin, Ferritin, TSAT) based on the provided PCDT.' },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of actionable recommendations for anemia management based on the PCDT.' }
      },
      required: ['evaluation', 'recommendations']
    },
    mbdAnalysis: {
      type: Type.OBJECT,
      properties: {
        evaluation: { type: Type.STRING, description: 'Detailed evaluation of Mineral and Bone Disorder (MBD) parameters (Calcium, Phosphorus, PTH, Alkaline Phosphatase) based on the provided PCDT.' },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of actionable recommendations for MBD management based on the PCDT, including medication suggestions if applicable.' }
      },
      required: ['evaluation', 'recommendations']
    },
    overallSummary: { type: Type.STRING, description: 'A brief overall summary of the patient\'s condition and the most critical points of attention.' }
  },
  required: ['anemiaAnalysis', 'mbdAnalysis', 'overallSummary']
};

const extractionSchema = {
  type: Type.OBJECT,
  properties: {
    ckdStage: { type: Type.STRING, enum: ['3a', '3b', '4', '5', '5D'], description: 'Estágio da DRC detectado' },
    dialysisType: { type: Type.STRING, enum: ['Hemodialysis', 'Peritoneal Dialysis', 'None'], description: 'Modalidade de diálise detectada' },
    egfr: { type: Type.NUMBER, description: 'Taxa de Filtração Glomerular (TFG)' },
    hemoglobin: { type: Type.NUMBER, description: 'Valor da Hemoglobina em g/dL' },
    ferritin: { type: Type.NUMBER, description: 'Valor da Ferritina em ng/mL' },
    tsat: { type: Type.NUMBER, description: 'Saturação de Transferrina em %' },
    calcium: { type: Type.NUMBER, description: 'Cálcio Total em mg/dL' },
    phosphorus: { type: Type.NUMBER, description: 'Fósforo em mg/dL' },
    pth: { type: Type.NUMBER, description: 'Paratormônio (PTH) em pg/mL' },
    alkalinePhosphatase: { type: Type.NUMBER, description: 'Fosfatase Alcalina em U/L' }
  }
};

export async function analyzePatientData(data: PatientData): Promise<AnalysisResult> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const patientInfo = `
    - CKD Stage: ${data.ckdStage}
    - Dialysis Type: ${data.dialysisType}
    - eGFR (TFG estimada): ${data.egfr} mL/min/1.73m²
    - Hemoglobin (g/dL): ${data.hemoglobin}
    - Ferritin (ng/mL): ${data.ferritin}
    - Transferrin Saturation (%): ${data.tsat}
    - Total Calcium (mg/dL): ${data.calcium}
    - Phosphorus (mg/dL): ${data.phosphorus}
    - PTH (pg/mL): ${data.pth}
    - Alkaline Phosphatase (U/L): ${data.alkalinePhosphatase}
  `;

  const prompt = `
    Analyze the following patient's lab results based strictly on the provided Brazilian PCDT context. Provide a detailed evaluation for Anemia and MBD, suggest specific therapeutic actions according to the guidelines, and give an overall summary.

    Patient Data:
    ${patientInfo}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are a nephrology expert assistant. Your task is to analyze patient lab results based *strictly* on the provided Brazilian Clinical Protocols and Therapeutic Guidelines (PCDT). Do not use any external knowledge. Provide a structured analysis and recommendations in a JSON format. The analysis should reference specific targets and criteria from the provided context. The recommendations should be actionable and based on the treatment flowcharts and guidelines in the context. Here is the PCDT context: ${pcdtContext}`,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid analysis from the AI model.");
  }
}

export async function extractPatientDataFromFile(fileBase64: string, mimeType: string): Promise<Partial<PatientData>> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType
          }
        },
        {
          text: "Extract the following lab values from this medical report. Convert values to the specified units if necessary (e.g., calcium in mg/dL, hemoglobin in g/dL). Return ONLY the JSON object."
        }
      ],
      config: {
        systemInstruction: "You are a medical data extraction specialist. Extract lab values accurately. If a value is not found, omit it from the JSON. Respond only with the JSON object.",
        responseMimeType: 'application/json',
        responseSchema: extractionSchema,
      }
    });
    
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error extracting from document:", error);
    throw new Error("Não foi possível extrair os dados do documento.");
  }
}
