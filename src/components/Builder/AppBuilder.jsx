import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import WidgetLibrary from './WidgetLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import AIWidget from './AIWidget';
import { Loader2, ChevronLeft, ChevronRight, Package, Bot, Settings } from 'lucide-react';

const AppBuilder = () => {
  const { id } = useParams();
  const { currentApp, setCurrentApp, apps, isPreviewMode, addComponent } = useApp();
  
  // Panel visibility states
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(true);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  useEffect(() => {
    if (id && apps.length > 0) {
      const app = apps.find(a => a._id === id);
      if (app) {
        setCurrentApp(app);
      }
    }
  }, [id, apps, setCurrentApp]);

  const handleApplyTemplate = (template) => {
    if (!currentApp) return;
    
    // Apply template components to the current app
    template.layout.components.forEach(component => {
      addComponent({
        ...component,
        id: `${component.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
    });
  };

  const handleAddSuggestedWidget = (widget) => {
    if (!currentApp) return;

    // Add suggested widget as a new component
    addComponent({
      id: `${widget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: widget.type,
      position: {
        x: 0,
        y: 0,
        width: 300,
        height: 200
      },
      props: {},
      styling: {},
      data: {}
    });
  };

  if (!currentApp) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading app...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Top Toolbar with Toggle Buttons */}
        {!isPreviewMode && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showWidgetLibrary
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Toggle Widget Library"
              >
                <Package className="w-4 h-4" />
                Widgets
              </button>
              
              <button
                onClick={() => setShowAIWidget(!showAIWidget)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showAIWidget
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title="Toggle AI Assistant"
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </button>

              <div className="ml-auto">
                <button
                  onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    showPropertiesPanel
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  title="Toggle Properties Panel"
                >
                  <Settings className="w-4 h-4" />
                  Properties
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          {!isPreviewMode && (showWidgetLibrary || showAIWidget) && (
            <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col w-80">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {showWidgetLibrary && (
                    <button
                      onClick={() => {
                        setShowWidgetLibrary(true);
                        setShowAIWidget(false);
                      }}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        showWidgetLibrary && !showAIWidget
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      Widget Library
                    </button>
                  )}
                  
                  {showAIWidget && (
                    <button
                      onClick={() => {
                        setShowAIWidget(true);
                        setShowWidgetLibrary(false);
                      }}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        showAIWidget && !showWidgetLibrary
                          ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Bot className="w-4 h-4 inline mr-2" />
                      AI Assistant
                    </button>
                  )}
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {showWidgetLibrary && !showAIWidget && (
                  <div className="h-full">
                    <WidgetLibrary />
                  </div>
                )}
                
                {showAIWidget && !showWidgetLibrary && (
                  <div className="h-full p-4">
                    <AIWidget
                      onApplyTemplate={handleApplyTemplate}
                      onAddSuggestedWidget={handleAddSuggestedWidget}
                    />
                  </div>
                )}
                
                {/* Both panels shown - split view */}
                {showWidgetLibrary && showAIWidget && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
                      <WidgetLibrary />
                    </div>
                    <div className="flex-1 p-4">
                      <AIWidget
                        onApplyTemplate={handleApplyTemplate}
                        onAddSuggestedWidget={handleAddSuggestedWidget}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapse Button */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                  onClick={() => {
                    setShowWidgetLibrary(false);
                    setShowAIWidget(false);
                  }}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Collapse
                </button>
              </div>
            </div>
          )}

          {/* Collapsed Sidebar Toggle */}
          {!isPreviewMode && !showWidgetLibrary && !showAIWidget && (
            <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-12 flex flex-col items-center py-4 gap-3">
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Open Widget Library"
              >
                <Package className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAIWidget(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Open AI Assistant"
              >
                <Bot className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>

          {/* Properties Panel */}
          {!isPreviewMode && showPropertiesPanel && (
            <div className="relative">
              <PropertiesPanel />
              
              {/* Collapse Button for Properties Panel */}
              <button
                onClick={() => setShowPropertiesPanel(false)}
                className="absolute top-4 -left-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                title="Collapse Properties Panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Collapsed Properties Panel Toggle */}
          {!isPreviewMode && !showPropertiesPanel && (
            <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-12 flex flex-col items-center py-4">
              <button
                onClick={() => setShowPropertiesPanel(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Open Properties Panel"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default AppBuilder;