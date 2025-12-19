
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
