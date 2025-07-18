import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import WidgetLibrary from './WidgetLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import { Loader2 } from 'lucide-react';

const AppBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentApp, setCurrentApp, apps, isPreviewMode } = useApp();

  useEffect(() => {
    if (id && apps.length > 0) {
      const app = apps.find(a => a._id === id);
      if (app) {
        setCurrentApp(app);
      }
    }
  }, [id, apps, setCurrentApp]);

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
        <div className="flex-1 flex overflow-hidden">
          {/* Widget Library */}
          {!isPreviewMode && <WidgetLibrary />}
          
          {/* Canvas */}
          <Canvas />
          
          {/* Properties Panel */}
          {!isPreviewMode && <PropertiesPanel />}
        </div>
      </div>
    </DndProvider>
  );
};

export default AppBuilder;