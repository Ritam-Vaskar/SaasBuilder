import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useApp } from '../../contexts/AppContext';
import WidgetRenderer from './WidgetRenderer';
import { Plus, Grid, Move, Trash2, Copy, RotateCcw, Sparkles } from 'lucide-react';
import AIOptimizer from './AIOptimizer';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [gridSize] = useState(20);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    initialPos: { x: 0, y: 0 },
    componentId: null
  });
  const [resizeState, setResizeState] = useState({
    isResizing: false,
    startPos: { x: 0, y: 0 },
    initialSize: { width: 0, height: 0 },
    initialPos: { x: 0, y: 0 },
    componentId: null,
    handle: null
  });

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

  // Snap to grid function
  const snapToGrid = useCallback((value) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e, componentId) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const component = currentApp?.layout?.components?.find((c) => c.id === componentId);
    if (!component) return;

    setSelectedComponent(component);
    setDragState({
      isDragging: true,
      startPos: { x: e.clientX, y: e.clientY },
      initialPos: { x: component.position.x, y: component.position.y },
      componentId
    });
  }, [isPreviewMode, currentApp, setSelectedComponent]);

  // Mouse event handlers for resizing
  const handleResizeMouseDown = useCallback((e, componentId, handle) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const component = currentApp?.layout?.components?.find((c) => c.id === componentId);
    if (!component) return;

    setResizeState({
      isResizing: true,
      startPos: { x: e.clientX, y: e.clientY },
      initialSize: { width: component.position.width, height: component.position.height },
      initialPos: { x: component.position.x, y: component.position.y },
      componentId,
      handle
    });
  }, [isPreviewMode, currentApp]);

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragState.isDragging && dragState.componentId) {
        const deltaX = e.clientX - dragState.startPos.x;
        const deltaY = e.clientY - dragState.startPos.y;
        
        const newX = Math.max(0, snapToGrid(dragState.initialPos.x + deltaX));
        const newY = Math.max(0, snapToGrid(dragState.initialPos.y + deltaY));

        const component = currentApp?.layout?.components?.find((c) => c.id === dragState.componentId);
        if (component) {
          updateComponent(dragState.componentId, {
            position: {
              ...component.position,
              x: newX,
              y: newY
            }
          });
        }
      }

      if (resizeState.isResizing && resizeState.componentId) {
        const deltaX = e.clientX - resizeState.startPos.x;
        const deltaY = e.clientY - resizeState.startPos.y;
        
        let newWidth = resizeState.initialSize.width;
        let newHeight = resizeState.initialSize.height;
        let newX = resizeState.initialPos.x;
        let newY = resizeState.initialPos.y;

        switch (resizeState.handle) {
          case 'se': // Bottom-right
            newWidth = Math.max(100, snapToGrid(resizeState.initialSize.width + deltaX));
            newHeight = Math.max(60, snapToGrid(resizeState.initialSize.height + deltaY));
            break;
          case 'sw': // Bottom-left
            newWidth = Math.max(100, snapToGrid(resizeState.initialSize.width - deltaX));
            newHeight = Math.max(60, snapToGrid(resizeState.initialSize.height + deltaY));
            newX = snapToGrid(resizeState.initialPos.x + deltaX);
            break;
          case 'ne': // Top-right
            newWidth = Math.max(100, snapToGrid(resizeState.initialSize.width + deltaX));
            newHeight = Math.max(60, snapToGrid(resizeState.initialSize.height - deltaY));
            newY = snapToGrid(resizeState.initialPos.y + deltaY);
            break;
          case 'nw': // Top-left
            newWidth = Math.max(100, snapToGrid(resizeState.initialSize.width - deltaX));
            newHeight = Math.max(60, snapToGrid(resizeState.initialSize.height - deltaY));
            newX = snapToGrid(resizeState.initialPos.x + deltaX);
            newY = snapToGrid(resizeState.initialPos.y + deltaY);
            break;
          case 'e': // Right
            newWidth = Math.max(100, snapToGrid(resizeState.initialSize.width + deltaX));
            break;
          case 'w': // Left
            newWidth = Math.max(100, snapToGrid(resizeState.initialSize.width - deltaX));
            newX = snapToGrid(resizeState.initialPos.x + deltaX);
            break;
          case 's': // Bottom
            newHeight = Math.max(60, snapToGrid(resizeState.initialSize.height + deltaY));
            break;
          case 'n': // Top
            newHeight = Math.max(60, snapToGrid(resizeState.initialSize.height - deltaY));
            newY = snapToGrid(resizeState.initialPos.y + deltaY);
            break;
        }

        updateComponent(resizeState.componentId, {
          position: { x: newX, y: newY, width: newWidth, height: newHeight }
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(prev => ({ ...prev, isDragging: false, componentId: null }));
      setResizeState(prev => ({ ...prev, isResizing: false, componentId: null, handle: null }));
    };

    if (dragState.isDragging || resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState, snapToGrid, updateComponent, currentApp]);

  // Get default props helper function
  const getDefaultProps = useCallback((type) => {
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
      case 'image':
        return { title: 'Image', src: '', alt: 'Image', caption: '' };
      case 'video':
        return { title: 'Video', src: '', controls: true, autoplay: false };
      case 'map':
        return { title: 'Map', latitude: 0, longitude: 0, zoom: 10 };
      case 'rating':
        return { title: 'Rating', maxStars: 5, currentRating: 0 };
      default:
        return {};
    }
  }, []);

  // Get default styling helper function
  const getDefaultStyling = useCallback((type) => {
    return {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    };
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: 'widget',
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const offset = monitor.getClientOffset();
      if (!offset) return;

      const x = Math.max(0, snapToGrid(offset.x - canvasRect.left));
      const y = Math.max(0, snapToGrid(offset.y - canvasRect.top));

      const newComponent = {
        id: `${item.type}-${Date.now()}`,
        type: item.type,
        position: { x, y, width: 200, height: 100 },
        props: getDefaultProps(item.type),
        styling: getDefaultStyling(item.type),
        data: {}
      };

      addComponent(newComponent);
      setSelectedComponent(newComponent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleComponentClick = useCallback((component, e) => {
    if (isPreviewMode) return;
    
    e.stopPropagation();
    setSelectedComponent(component);
  }, [isPreviewMode, setSelectedComponent]);

  const handleCanvasClick = useCallback(() => {
    if (!isPreviewMode) {
      setSelectedComponent(null);
    }
  }, [isPreviewMode, setSelectedComponent]);

  const handleDeleteComponent = useCallback((componentId, e) => {
    e.stopPropagation();
    removeComponent(componentId);
  }, [removeComponent]);

  const handleDuplicateComponent = useCallback((componentId, e) => {
    e.stopPropagation();
    duplicateComponent(componentId);
  }, [duplicateComponent]);

  // Render resize handles
  const renderResizeHandles = useCallback((componentId) => {
    if (selectedComponent?.id !== componentId || isPreviewMode) return null;

    const handles = [
      { position: 'nw', cursor: 'nw-resize', className: 'top-0 left-0 -translate-x-1 -translate-y-1' },
      { position: 'n', cursor: 'n-resize', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1' },
      { position: 'ne', cursor: 'ne-resize', className: 'top-0 right-0 translate-x-1 -translate-y-1' },
      { position: 'e', cursor: 'e-resize', className: 'top-1/2 right-0 translate-x-1 -translate-y-1/2' },
      { position: 'se', cursor: 'se-resize', className: 'bottom-0 right-0 translate-x-1 translate-y-1' },
      { position: 's', cursor: 's-resize', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1' },
      { position: 'sw', cursor: 'sw-resize', className: 'bottom-0 left-0 -translate-x-1 translate-y-1' },
      { position: 'w', cursor: 'w-resize', className: 'top-1/2 left-0 -translate-x-1 -translate-y-1/2' },
    ];

    return (
      <>
        {handles.map(handle => (
          <div
            key={handle.position}
            className={`absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full ${handle.className}`}
            style={{ cursor: handle.cursor }}
            onMouseDown={(e) => handleResizeMouseDown(e, componentId, handle.position)}
          />
        ))}
      </>
    );
  }, [selectedComponent, isPreviewMode, handleResizeMouseDown]);

  // Safe access to components
  const components = currentApp?.layout?.components || [];
  const [showAIOptimizer, setShowAIOptimizer] = useState(false);

  return (
    <div className="relative h-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      {/* AI Optimizer Button */}
      {!isPreviewMode && components.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowAIOptimizer(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-md transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Optimize</span>
          </button>
        </div>
      )}
    
      {/* AI Optimizer Modal */}
      {showAIOptimizer && (
        <AIOptimizer onClose={() => setShowAIOptimizer(false)} />
      )}
    
      <div 
        ref={(node) => {
          canvasRef.current = node;
          drop(node);
        }}
        className={`flex-1 relative bg-white dark:bg-gray-800 overflow-auto ${
          isOver ? 'bg-blue-50 dark:bg-blue-900' : ''
        } ${dragState.isDragging || resizeState.isResizing ? 'select-none' : ''}`}
        onClick={handleCanvasClick}
        style={{
          backgroundImage: !isPreviewMode 
            ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          minHeight: '800px',
          cursor: dragState.isDragging ? 'grabbing' : 'default'
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
            className={`absolute transition-all ${
              selectedComponent?.id === component.id && !isPreviewMode
                ? 'ring-2 ring-blue-500 ring-offset-2'
                : ''
            }`}
            style={{
              left: `${component.position.x}px`,
              top: `${component.position.y}px`,
              width: `${component.position.width}px`,
              height: `${component.position.height}px`,
              zIndex: selectedComponent?.id === component.id ? 10 : 1,
              cursor: isPreviewMode ? 'default' : 'grab'
            }}
            onClick={(e) => handleComponentClick(component, e)}
            onMouseDown={(e) => handleMouseDown(e, component.id)}
          >
            {/* Component Actions */}
            {selectedComponent?.id === component.id && !isPreviewMode && (
              <div className="absolute -top-10 left-0 flex space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-1 z-20">
                <button
                  onClick={(e) => handleDuplicateComponent(component.id, e)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteComponent(component.id, e)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-px bg-gray-200 dark:bg-gray-600 mx-1" />
                <div className="flex items-center px-2 text-xs text-gray-500">
                  <Move className="w-3 h-3 mr-1" />
                  {component.position.width} × {component.position.height}
                </div>
              </div>
            )}
    
            {/* Widget Renderer */}
            <WidgetRenderer
              component={component}
              isSelected={selectedComponent?.id === component.id}
              isPreviewMode={isPreviewMode}
            />
    
            {/* Resize Handles */}
            {renderResizeHandles(component.id)}
          </div>
        ))}
    
        {/* Drop Zone Indicator */}
        {isOver && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900 bg-opacity-20 flex items-center justify-center pointer-events-none">
            <div className="text-blue-600 dark:text-blue-400 text-center">
              <Grid className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Drop widget here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;