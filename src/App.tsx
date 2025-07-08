import React from 'react';
import DigitClassifier from './components/DigitClassifier';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            MNIST Digit Classifier
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Draw a digit (0-9) and watch our AI classify it in real-time using machine learning algorithms
          </p>
        </div>
        <DigitClassifier />
      </div>
    </div>
  );
}

export default App;