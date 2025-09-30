import React, { useState } from "react";
// Fake News Detector App
import {
  Send as SendIcon,
  AlertTriangle as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { useAnalysis } from "./hooks/useAnalysis";
import { AnalysisResult } from "./graphql/queries";

const FakeNewsDetector: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { analyzeText, budgetStatus } = useAnalysis();

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeText(inputText);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(
        err.message || "An error occurred during analysis. Please try again."
      );
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAnalyze();
    }
  };

  const getResultIcon = () => {
    if (!analysisResult) return null;

    if (analysisResult.isFake) {
      return <WarningIcon className="w-10 h-10 text-red-500" />;
    } else {
      return <CheckCircleIcon className="w-10 h-10 text-green-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 Fake News Detector
          </h1>
          <p className="text-lg text-gray-600">
            Paste any news article or text to analyze its credibility
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="card p-6">
            <div className="flex items-end gap-3">
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Paste your news article or text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={false}
              />
              <button
                onClick={handleAnalyze}
                disabled={!inputText.trim()}
                className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="card p-6">
              {/* Result Header */}
              <div className="flex items-center mb-4">
                {getResultIcon()}
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {analysisResult.isFake
                      ? "⚠️ Potentially Fake News"
                      : "✅ Legitimate News"}
                  </h2>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      analysisResult.isFake
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {(analysisResult.confidence * 100).toFixed(1)}% Confidence
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4" />

              {/* Confidence Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Confidence Level
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {(analysisResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getConfidenceColor(
                      analysisResult.confidence
                    )}`}
                    style={{ width: `${analysisResult.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {analysisResult.explanation}
                </p>
              </div>

              {/* Suspicious Phrases */}
              {analysisResult.suspiciousPhrases.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Suspicious Phrases
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.suspiciousPhrases.map((phrase, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200"
                      >
                        <AlertCircleIcon className="w-4 h-4 mr-1" />
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recommendations
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {analysisResult.recommendations}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-6">
          <p className="text-sm text-gray-500">
            Powered by OpenAI GPT-4o Mini • Always verify information from
            multiple sources
          </p>
        </div>
      </div>
    </div>
  );
};

export default FakeNewsDetector;
