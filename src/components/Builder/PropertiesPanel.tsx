import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Settings, Palette, Code, Layers } from 'lucide-react';

const PropertiesPanel: React.FC = () => {
  const { selectedComponent, updateComponent } = useApp();

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No widget selected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a widget to customize its properties
          </p>
        </div>
      </div>
    );
  }

  const handlePropUpdate = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      props: { ...selectedComponent.props, [key]: value }
    });
  };

  const handleStyleUpdate = (key: string, value: any) => {
    updateComponent(selectedComponent.id, {
      styling: { ...selectedComponent.styling, [key]: value }
    });
  };

  const handlePositionUpdate = (key: string, value: number) => {
    updateComponent(selectedComponent.id, {
      position: { ...selectedComponent.position, [key]: value }
    });
  };

  const renderPropertiesForm = () => {
    switch (selectedComponent.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={selectedComponent.props?.content || ''}
                onChange={(e) => handlePropUpdate('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Enter text content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size
              </label>
              <select
                value={selectedComponent.props?.fontSize || 'medium'}
                onChange={(e) => handlePropUpdate('fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Align
              </label>
              <select
                value={selectedComponent.props?.textAlign || 'left'}
                onChange={(e) => handlePropUpdate('textAlign', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={selectedComponent.props?.text || ''}
                onChange={(e) => handlePropUpdate('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter button text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variant
              </label>
              <select
                value={selectedComponent.props?.variant || 'primary'}
                onChange={(e) => handlePropUpdate('variant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <select
                value={selectedComponent.props?.size || 'medium'}
                onChange={(e) => handlePropUpdate('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form Title
              </label>
              <input
                type="text"
                value={selectedComponent.props?.title || ''}
                onChange={(e) => handlePropUpdate('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form Fields
              </label>
              <div className="space-y-2">
                {selectedComponent.props?.fields?.map((field: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const newFields = [...(selectedComponent.props?.fields || [])];
                        newFields[index].label = e.target.value;
                        handlePropUpdate('fields', newFields);
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="Field label"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newFields = [...(selectedComponent.props?.fields || [])];
                        newFields[index].type = e.target.value;
                        handlePropUpdate('fields', newFields);
                      }}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFields = [
                      ...(selectedComponent.props?.fields || []),
                      { name: `field${Date.now()}`, type: 'text', label: 'New Field', required: false }
                    ];
                    handlePropUpdate('fields', newFields);
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={selectedComponent.props?.title || ''}
                onChange={(e) => handlePropUpdate('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter widget title"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Properties
          </h2>
        </div>

        <div className="space-y-6">
          {/* Widget Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Widget Info
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-sm text-gray-900 dark:text-white ml-2 capitalize">
                  {selectedComponent.type}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">ID:</span>
                <span className="text-sm text-gray-900 dark:text-white ml-2 font-mono">
                  {selectedComponent.id}
                </span>
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Properties
              </h3>
            </div>
            {renderPropertiesForm()}
          </div>

          {/* Position & Size */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Position & Size
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X</label>
                <input
                  type="number"
                  value={selectedComponent.position?.x || 0}
                  onChange={(e) => handlePositionUpdate('x', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y</label>
                <input
                  type="number"
                  value={selectedComponent.position?.y || 0}
                  onChange={(e) => handlePositionUpdate('y', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={selectedComponent.position?.width || 0}
                  onChange={(e) => handlePositionUpdate('width', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  value={selectedComponent.position?.height || 0}
                  onChange={(e) => handlePositionUpdate('height', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Styling */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Code className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Styling
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={selectedComponent.styling?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Border Radius
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={parseInt(selectedComponent.styling?.borderRadius?.replace('px', '') || '8')}
                  onChange={(e) => handleStyleUpdate('borderRadius', `${e.target.value}px`)}
                  className="w-full"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedComponent.styling?.borderRadius || '8px'}
                </span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Padding
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={parseInt(selectedComponent.styling?.padding?.replace('px', '') || '16')}
                  onChange={(e) => handleStyleUpdate('padding', `${e.target.value}px`)}
                  className="w-full"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedComponent.styling?.padding || '16px'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;