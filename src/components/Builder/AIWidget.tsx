import React, { useState, useEffect } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import AIService, { WidgetSuggestion, Template } from '../../services/AIService';
import { useApp } from '../../contexts/AppContext';

interface AIWidgetProps {
  onApplyTemplate?: (template: Template) => void;
  onAddSuggestedWidget?: (widget: WidgetSuggestion) => void;
}

const AIWidget: React.FC<AIWidgetProps> = ({ onApplyTemplate, onAddSuggestedWidget }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [appType, setAppType] = useState('');
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<WidgetSuggestion[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const { currentApp } = useApp();

  const handleGetSuggestions = async () => {
    if (!appType || !description) return;
    
    setIsLoading(true);
    try {
      const suggestions = await AIService.getSuggestions(appType, description);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!appType || !description) return;
    
    setIsLoading(true);
    try {
      const template = await AIService.generateTemplate(appType, description);
      if (template) {
        setTemplate(template);
      }
    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeLayout = async () => {
    if (!currentApp?.layout?.components) return;
    
    setIsLoading(true);
    try {
      const optimizedLayout = await AIService.optimizeLayout(currentApp.layout.components);
      if (optimizedLayout) {
        // Handle layout optimization suggestions
        console.log('Layout suggestions:', optimizedLayout.suggestions);
      }
    } catch (error) {
      console.error('Error optimizing layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[70vh] overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Wand2 className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            App Type
          </label>
          <select
            value={appType}
            onChange={(e) => setAppType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select type...</option>
            <option value="todo">Todo App</option>
            <option value="crm">CRM</option>
            <option value="dashboard">Dashboard</option>
            <option value="ecommerce">E-commerce</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            rows={3}
            placeholder="Describe your app's purpose and features..."
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleGetSuggestions}
            disabled={isLoading || !appType || !description}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Get Suggestions'
            )}
          </button>
          <button
            onClick={handleGenerateTemplate}
            disabled={isLoading || !appType || !description}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Generate Template'
            )}
          </button>
        </div>

        {currentApp?.layout?.components && currentApp.layout.components.length > 0 && (
          <button
            onClick={handleOptimizeLayout}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Optimize Layout'
            )}
          </button>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Suggested Widgets
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                  {onAddSuggestedWidget && (
                    <button
                      onClick={() => onAddSuggestedWidget(suggestion)}
                      className="p-1 text-purple-600 hover:text-purple-700"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {template && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Generated Template
            </h4>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {template.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {template.description}
              </p>
              {onApplyTemplate && (
                <button
                  onClick={() => onApplyTemplate(template)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Apply Template
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWidget;