import React from 'react';
import { Brain, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { PredictionResult } from '../types/prediction';

interface PredictionDisplayProps {
  prediction: PredictionResult | null;
  isProcessing: boolean;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({ prediction, isProcessing }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    if (confidence >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Very Confident';
    if (confidence >= 0.6) return 'Confident';
    if (confidence >= 0.4) return 'Moderate';
    return 'Low Confidence';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6" />
        Prediction Result
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </h2>

      {isProcessing && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-200">Analyzing with Gemini AI...</p>
          </div>
        </div>
      )}

      {!isProcessing && !prediction && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">Draw a digit to get started</p>
            <p className="text-sm text-gray-400 mt-2">Powered by Gemini AI</p>
          </div>
        </div>
      )}

      {!isProcessing && prediction && (
        <div className="space-y-6">
          {/* Main prediction */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <span className="text-4xl font-bold text-white">{prediction.digit}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              Predicted Digit: {prediction.digit}
            </h3>
            <p className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
              {getConfidenceLabel(prediction.confidence)} ({(prediction.confidence * 100).toFixed(1)}%)
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-200">Powered by Gemini AI</span>
            </div>
          </div>

          {/* AI Reasoning */}
          {prediction.reasoning && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Analysis
              </h4>
              <p className="text-sm text-blue-200 italic">"{prediction.reasoning}"</p>
            </div>
          )}

          {/* Confidence bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Confidence Level</span>
              <span>{(prediction.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  prediction.confidence >= 0.8
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : prediction.confidence >= 0.6
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : prediction.confidence >= 0.4
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${prediction.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* All predictions */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">All Predictions</h4>
            <div className="grid grid-cols-2 gap-2">
              {prediction.allPredictions.map((pred, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    pred.digit === prediction.digit
                      ? 'bg-blue-500/30 border border-blue-400'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{pred.digit}</span>
                    <span className="text-sm text-gray-300">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="h-1 bg-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning for low confidence */}
          {prediction.confidence < 0.4 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-400 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 text-sm">
                Low confidence. Try drawing the digit more clearly or centered.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionDisplay;