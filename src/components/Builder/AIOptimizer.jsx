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
      if (optimizedLayout) {
        setSuggestions(optimizedLayout.suggestions);
        
        // Apply optimized positions
        optimizedLayout.improvements.forEach(improvement => {
          const component = currentApp.layout.components.find(c => c.id === improvement.id);
          if (component) {
            updateComponent(improvement.id, {
              position: improvement.position
            });
          }
        });
      }
    } catch (error) {
      console.error('Error optimizing layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Layout Optimizer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          AI will analyze your layout and suggest improvements for better user experience.
        </p>

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

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Suggestions
            </h4>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md text-sm text-gray-700 dark:text-gray-300"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIOptimizer;