
export interface PatientData {
  ckdStage: '3a' | '3b' | '4' | '5' | '5D';
  dialysisType: 'Hemodialysis' | 'Peritoneal Dialysis' | 'None';
  hemoglobin: number;
  ferritin: number;
  tsat: number;
  calcium: number;
  phosphorus: number;
  pth: number;
  alkalinePhosphatase: number;
}

export interface AnalysisSection {
  evaluation: string;
  recommendations: string[];
}

export interface AnalysisResult {
  anemiaAnalysis: AnalysisSection;
  mbdAnalysis: AnalysisSection;
  overallSummary: string;
}
