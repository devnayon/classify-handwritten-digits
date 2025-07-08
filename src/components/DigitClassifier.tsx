import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Brain, TrendingUp, RotateCcw } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import PredictionDisplay from './PredictionDisplay';
import { classifyDigit } from '../utils/classifier';
import { PredictionResult } from '../types/prediction';

const DigitClassifier: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasChange = async (imageData: ImageData) => {
    setIsProcessing(true);
    
    // Simulate processing time for better UX
    setTimeout(async () => {
      const result = await classifyDigit(imageData);
      setPrediction(result);
      setIsProcessing(false);
      
      if (result.confidence > 0.1) {
        setHistory(prev => [result, ...prev].slice(0, 10));
      }
    }, 300);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setPrediction(null);
  };

  const resetAll = () => {
    clearCanvas();
    setHistory([]);
    setPrediction(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drawing Section */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Draw Your Digit
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 bg-gray-500/80 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            <DrawingCanvas
              ref={canvasRef}
              onChange={handleCanvasChange}
              className="w-full"
            />
            
            <div className="mt-4 text-sm text-blue-200">
              <p>• Draw a single digit (0-9) in the center of the canvas</p>
              <p>• Use clear, bold strokes for better recognition</p>
              <p>• The classifier uses KNN algorithm for prediction</p>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">Algorithm Details</h3>
            <div className="space-y-2 text-sm text-blue-200">
              <p>• <strong>Dataset:</strong> MNIST (Modified National Institute of Standards and Technology)</p>
              <p>• <strong>Algorithm:</strong> Gemini AI Vision Model</p>
              <p>• <strong>Features:</strong> 28x28 pixel intensity values</p>
              <p>• <strong>Accuracy:</strong> State-of-the-art handwriting recognition</p>
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="space-y-6">
          <PredictionDisplay
            prediction={prediction}
            isProcessing={isProcessing}
          />

          {/* History Section */}
          {history.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Predictions
              </h3>
              <div className="space-y-3">
                {history.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {result.digit}
                      </div>
                      <span className="text-white text-sm">
                        Digit {result.digit}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitClassifier;