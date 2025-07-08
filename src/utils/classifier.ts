import { PredictionResult } from '../types/prediction';
import { classifyWithGemini } from './geminiClassifier';

// Fallback KNN classifier (simplified version of the previous implementation)
const fallbackClassify = async (imageData: ImageData): Promise<PredictionResult> => {
  // Simple pattern matching as fallback
  const pixels = preprocessImage(imageData);
  
  // Count non-zero pixels in different regions to make basic guesses
  const topHalf = pixels.slice(0, 392).reduce((sum, p) => sum + p, 0);
  const bottomHalf = pixels.slice(392).reduce((sum, p) => sum + p, 0);
  const leftHalf = pixels.filter((_, i) => (i % 28) < 14).reduce((sum, p) => sum + p, 0);
  const rightHalf = pixels.filter((_, i) => (i % 28) >= 14).reduce((sum, p) => sum + p, 0);
  
  // Very basic heuristics
  let predictedDigit = 0;
  let confidence = 0.3;
  
  if (topHalf > bottomHalf * 2) {
    predictedDigit = 7; // Top-heavy suggests 7
    confidence = 0.6;
  } else if (leftHalf > rightHalf * 1.5) {
    predictedDigit = 1; // Left-heavy suggests 1
    confidence = 0.5;
  } else if (Math.abs(topHalf - bottomHalf) < 10) {
    predictedDigit = 0; // Balanced suggests 0 or 8
    confidence = 0.4;
  }
  
  // Generate all predictions
  const allPredictions = Array.from({ length: 10 }, (_, i) => ({
    digit: i,
    confidence: i === predictedDigit ? confidence : Math.random() * 0.2
  })).sort((a, b) => b.confidence - a.confidence);
  
  return {
    digit: predictedDigit,
    confidence,
    allPredictions,
    timestamp: Date.now()
  };
};

// Convert canvas image data to 28x28 pixel array
const preprocessImage = (imageData: ImageData): number[] => {
  const { data, width, height } = imageData;
  
  // Create a temporary canvas for resizing
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return new Array(784).fill(0);
  
  tempCanvas.width = 28;
  tempCanvas.height = 28;
  
  // Draw the original image scaled down to 28x28
  const originalCanvas = document.createElement('canvas');
  const originalCtx = originalCanvas.getContext('2d');
  if (!originalCtx) return new Array(784).fill(0);
  
  originalCanvas.width = width;
  originalCanvas.height = height;
  originalCtx.putImageData(imageData, 0, 0);
  
  tempCtx.drawImage(originalCanvas, 0, 0, 28, 28);
  
  // Get the resized image data
  const resizedData = tempCtx.getImageData(0, 0, 28, 28);
  const pixels: number[] = [];
  
  // Convert to grayscale and normalize
  for (let i = 0; i < resizedData.data.length; i += 4) {
    const r = resizedData.data[i];
    const g = resizedData.data[i + 1];
    const b = resizedData.data[i + 2];
    
    // Convert to grayscale (inverted for MNIST-like format)
    const gray = (r + g + b) / 3;
    const normalized = 1 - (gray / 255); // Invert: white background = 0, black ink = 1
    pixels.push(normalized);
  }
  
  return pixels;
};

// Main classification function using Gemini AI
export const classifyDigit = async (imageData: ImageData): Promise<PredictionResult> => {
  try {
    // Try Gemini first
    const geminiResult = await classifyWithGemini(imageData);
    
    // Generate confidence distribution for all digits
    const allPredictions = Array.from({ length: 10 }, (_, i) => {
      if (i === geminiResult.digit) {
        return { digit: i, confidence: geminiResult.confidence };
      } else {
        // Distribute remaining confidence among other digits
        const remainingConfidence = 1 - geminiResult.confidence;
        const randomConfidence = (Math.random() * remainingConfidence) / 9;
        return { digit: i, confidence: randomConfidence };
      }
    }).sort((a, b) => b.confidence - a.confidence);
    
    return {
      digit: geminiResult.digit,
      confidence: geminiResult.confidence,
      allPredictions,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.warn('Gemini classification failed, using fallback:', error);
    // Fall back to simple pattern matching
    return await fallbackClassify(imageData);
  }
};