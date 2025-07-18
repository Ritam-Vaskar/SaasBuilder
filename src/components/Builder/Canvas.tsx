import React, { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useApp } from '../../contexts/AppContext';
import WidgetRenderer from './WidgetRenderer';
import { Plus, Grid, Move, Trash2, Copy } from 'lucide-react';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [gridSize] = useState(20);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const { 
    currentApp, 
    selectedComponent, 
    setSelectedComponent, 
    addComponent, 
    updateComponent, 
    removeComponent,
    duplicateComponent,
    isPreviewMode 
  } = useApp();

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: 'widget',
    drop: (item: { type: string }, monitor) => {
      if (monitor.didDrop()) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const offset = monitor.getClientOffset();
      if (!offset) return;

      const x = Math.max(0, Math.round((offset.x - canvasRect.left) / gridSize) * gridSize);
      const y = Math.max(0, Math.round((offset.y - canvasRect.top) / gridSize) * gridSize);

      const newComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        position: { x, y, width: 200, height: 100 },
        props: getDefaultProps(item.type),
        styling: getDefaultStyling(item.type),
        data: {}
      };

      addComponent(newComponent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'text':
        return { content: 'Sample text', fontSize: 'medium', textAlign: 'left' };
      case 'button':
        return { text: 'Click me', variant: 'primary', size: 'medium' };
      case 'form':
        return { 
          title: 'New Form', 
          fields: [
            { name: 'name', type: 'text', label: 'Name', required: true }
          ]
        };
      case 'table':
        return { 
          title: 'Data Table', 
          columns: ['Name', 'Value'], 
          sortable: true,
          filterable: true
        };
      case 'chart':
        return { 
          title: 'Chart', 
          type: 'bar', 
          data: [
            { name: 'A', value: 10 },
            { name: 'B', value: 20 },
            { name: 'C', value: 15 }
          ]
        };
      case 'calendar':
        return { title: 'Calendar', viewType: 'month' };
      case 'kanban':
        return { 
          title: 'Kanban Board', 
          columns: ['To Do', 'In Progress', 'Done']
        };
      case 'fileUpload':
        return { 
          title: 'File Upload', 
          accept: '*/*', 
          maxSize: 10, 
          multiple: false 
        };
      case 'timer':
        return { title: 'Timer', type: 'countdown', duration: 300 };
      case 'counter':
        return { title: 'Counter', initialValue: 0, step: 1 };
      default:
        return {};
    }
  };

  const getDefaultStyling = (type: string) => {
    return {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    };
  };

  const handleComponentClick = (component: any, e: React.MouseEvent) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    setSelectedComponent(component);
  };

  const handleCanvasClick = () => {
    if (!isPreviewMode) {
      setSelectedComponent(null);
    }
  };

  const handleComponentDrag = (componentId: string, newPosition: any) => {
    updateComponent(componentId, { position: newPosition });
  };

  const handleComponentResize = (componentId: string, newSize: any) => {
    updateComponent(componentId, { 
      position: { 
        ...currentApp?.layout.components.find(c => c.id === componentId)?.position,
        ...newSize 
      } 
    });
  };

  const components = currentApp?.layout.components || [];

  return (
    <div 
      ref={(node) => {
        const canvasRef = useRef<HTMLDivElement>(null);
        drop(node);
      }}
      className={`flex-1 relative bg-white dark:bg-gray-800 overflow-auto ${
        isOver ? 'bg-blue-50 dark:bg-blue-900' : ''
      }`}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: !isPreviewMode 
          ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
          : 'none',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        minHeight: '800px'
      }}
    >
      {/* Canvas Background Message */}
      {components.length === 0 && !isPreviewMode && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start building your app
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag widgets from the library to get started
            </p>
          </div>
        </div>
      )}

      {/* Render Components */}
      {components.map((component) => (
        <div
          key={component.id}
          className={`absolute cursor-pointer transition-all ${
            selectedComponent?.id === component.id && !isPreviewMode
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : ''
          }`}
          style={{
            left: component.position.x,
            top: component.position.y,
            width: component.position.width,
            height: component.position.height,
            minHeight: '40px',
            zIndex: selectedComponent?.id === component.id ? 10 : 1
          }}
          onClick={(e) => handleComponentClick(component, e)}
        >
          <WidgetRenderer
            component={component}
            isSelected={selectedComponent?.id === component.id}
            isPreviewMode={isPreviewMode}
            onDrag={(newPosition) => handleComponentDrag(component.id, newPosition)}
            onResize={(newSize) => handleComponentResize(component.id, newSize)}
          />
          
          {/* Component Controls */}
          {selectedComponent?.id === component.id && !isPreviewMode && (
            <div className="absolute -top-8 left-0 flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateComponent(component.id);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeComponent(component.id);
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900 bg-opacity-20 flex items-center justify-center">
          <div className="text-blue-600 dark:text-blue-400 text-center">
            <Grid className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Drop widget here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;