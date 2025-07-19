import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Type, MousePointer, BarChart, Calendar, Clock, Hash } from 'lucide-react';

interface WidgetRendererProps {
  component: any;
  isSelected: boolean;
  isPreviewMode: boolean;
  onDrag: (newPosition: any) => void;
  onResize: (newSize: any) => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  component,
  isSelected,
  isPreviewMode,
  onDrag,
  onResize
}) => {
  const { submitFormData, fetchComponentData } = useApp();
  const [formData, setFormData] = useState<{[key: string]: any}>({});
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const loadTableData = async () => {
      if (component.type === 'table' && isPreviewMode) {
        try {
          const response = await fetchComponentData(component.id);
          if (response && Array.isArray(response.data)) {
            setTableData(response.data);
          }
        } catch (error) {
          console.error('Error fetching table data:', error);
          setTableData([]);
        }
      }
    };

    loadTableData();
  }, [component.id, component.type, isPreviewMode, fetchComponentData]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreviewMode) return;

    try {
      await submitFormData(component.id, formData);
      setFormData({});
      const form = e.target as HTMLFormElement;
      form.reset();

      if (component.props.linkedTable) {
        fetchComponentData(component.props.linkedTable)
          .then(response => {
            if (response && Array.isArray(response.data)) {
              setTableData(response.data);
            }
          })
          .catch(error => console.error('Error refreshing table data:', error));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderWidget = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border" style={component.styling}>
            <div 
              className="text-gray-900 dark:text-white"
              style={{
                fontSize: component.props.fontSize === 'large' ? '1.5rem' : 
                         component.props.fontSize === 'small' ? '0.875rem' : '1rem',
                textAlign: component.props.textAlign || 'left'
              }}
            >
              {component.props.content || 'Sample text'}
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="w-full h-full flex items-center justify-center" style={component.styling}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                component.props.variant === 'secondary'
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{
                fontSize: component.props.size === 'large' ? '1.125rem' : 
                         component.props.size === 'small' ? '0.875rem' : '1rem'
              }}
            >
              {component.props.text || 'Click me'}
            </button>
          </div>
        );

      case 'form':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border" style={component.styling}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {component.props.title || 'Form'}
              </h3>

              {component.props.fields?.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}{field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows={3}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={!isPreviewMode}
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      name={field.name}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={!isPreviewMode}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option: string, i: number) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      disabled={!isPreviewMode}
                    />
                  )}
                </div>
              ))}

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isPreviewMode}
              >
                {component.props.submitText || 'Submit'}
              </button>
            </form>
          </div>
        );

      case 'table':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border overflow-auto" style={component.styling}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {component.props.title || 'Table'}
            </h3>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {component.props.columns?.map((column: any, index: number) => (
                    <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isPreviewMode && tableData.length > 0 ? (
                  tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {component.props.columns?.map((column: any, colIndex: number) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {row[column.field]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={component.props.columns?.length || 1} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {isPreviewMode ? 'No data available' : 'Data will be displayed in preview mode'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'chart':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border" style={component.styling}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {component.props.title || 'Chart'}
            </h3>
            <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-center">
                <BarChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {component.props.type || 'bar'} chart
                </p>
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border" style={component.styling}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {component.props.title || 'Calendar'}
            </h3>
            <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Calendar view
                </p>
              </div>
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border flex items-center justify-center" style={component.styling}>
            <div className="text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {component.props.title || 'Timer'}
              </h3>
              <div className="text-2xl font-mono text-gray-900 dark:text-white">
                05:00
              </div>
            </div>
          </div>
        );

      case 'counter':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border flex items-center justify-center" style={component.styling}>
            <div className="text-center">
              <Hash className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {component.props.title || 'Counter'}
              </h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {component.props.initialValue || 0}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">-</button>
                <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">+</button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border flex items-center justify-center" style={component.styling}>
            <div className="text-center">
              <Type className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {component.type} widget
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full relative">
      {renderWidget()}

      {isSelected && !isPreviewMode && (
        <>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 rounded-full cursor-se-resize opacity-75 hover:opacity-100" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 rounded-full cursor-ne-resize opacity-75 hover:opacity-100" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 rounded-full cursor-sw-resize opacity-75 hover:opacity-100" />
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 rounded-full cursor-nw-resize opacity-75 hover:opacity-100" />
        </>
      )}
    </div>
  );
};

export default WidgetRenderer;
