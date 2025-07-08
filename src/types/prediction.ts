export interface PredictionResult {
  digit: number;
  confidence: number;
  allPredictions: Array<{ digit: number; confidence: number }>;
  timestamp: number;
  reasoning?: string;
}

export interface TrainingData {
  digit: number;
  pixels: number[];
}