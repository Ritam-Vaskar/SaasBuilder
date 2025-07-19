import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import AIService from '../../services/AIService';
import { useApp } from '../../contexts/AppContext';

const AIOptimizer = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { currentApp, updateComponent } = useApp();

  const handleOptimizeLayout = async () => {
    if (!currentApp?.layout?.components) return;

    setIsLoading(true);
    try {
      const optimizedLayout = await AIService.optimizeLayout(currentApp.layout.components);
      console.log('Optimized Layout:', optimizedLayout);

      if (optimizedLayout) {
        // Extract suggestions from the nested structure
        let extractedSuggestions = [];
        
        if (Array.isArray(optimizedLayout)) {
          // If optimizedLayout is an array, extract suggestions from the first item
          if (optimizedLayout.length > 0 && optimizedLayout[0].suggestions) {
            extractedSuggestions = optimizedLayout[0].suggestions;
          }
        } else if (optimizedLayout.suggestions) {
          // If optimizedLayout has direct suggestions property
          extractedSuggestions = optimizedLayout.suggestions;
        }

        // Ensure extractedSuggestions is an array
        const safeSuggestions = Array.isArray(extractedSuggestions) ? extractedSuggestions : [];
        setSuggestions(safeSuggestions);

        // Handle improvements (if they exist)
        if (Array.isArray(optimizedLayout.improvements)) {
          optimizedLayout.improvements.forEach((improvement) => {
            const component = currentApp.layout.components.find((c) => c.id === improvement.id);
            if (component && improvement.position) {
              updateComponent(improvement.id, {
                position: improvement.position,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error optimizing layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Layout Optimizer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          AI analyzes your layout and suggests improvements for better usability.
        </p>

        {/* Button */}
        <button
          onClick={handleOptimizeLayout}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 mb-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Optimize Layout'
          )}
        </button>

        {/* Suggestions */}
        {Array.isArray(suggestions) && suggestions.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              AI Suggestions ({suggestions.length}):
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg"
                >
                  {/* Issue */}
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Issue:
                    </span>
                    <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                      {suggestion.issue || 'No issue specified'}
                    </p>
                  </div>
                  
                  {/* Recommendation */}
                  <div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Recommendation:
                    </span>
                    <p className="text-sm text-gray-800 dark:text-gray-100 mt-1">
                      {suggestion.recommendation || 'No recommendation provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && suggestions.length === 0 && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
            Debug: No suggestions found. Check console for raw data structure.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIOptimizer;