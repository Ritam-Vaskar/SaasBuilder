import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Widget = ({ component }) => {
  const [formData, setFormData] = useState({});
  const [componentData, setComponentData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComponentData = async () => {
      if (!component.id || !component.appId) return;
      
      // Only fetch data for components that need to display data (table, chart, etc.)
      if (!['table', 'chart'].includes(component.type)) return;
      
      try {
        setLoading(true);
        
        // Use the linkedCollection if specified, otherwise use the component id
        const collection = component.props?.linkedCollection || component.id;
        
        console.log('Fetching data for collection:', collection);
        
        const response = await axios.get(`${API_BASE_URL}/data/${component.appId}`, {
          params: { 
            collection: collection,
            page: 1,
            limit: 50
          }
        });
        
        console.log('Fetched data:', response.data);
        
        setComponentData({
          data: response.data.data || [],
          pagination: response.data.pagination || { page: 1, limit: 50, total: 0, pages: 0 }
        });
      } catch (error) {
        console.error('Error fetching component data:', error);
        setComponentData({ data: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } });
      } finally {
        setLoading(false);
      }
    };

    fetchComponentData();
  }, [component.id, component.appId, component.props?.linkedCollection, refreshTrigger, component.type]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!component.appId) return;

    try {
      // Use the linkedCollection if specified, otherwise use the component id
      const collection = component.props?.linkedCollection || component.id;
      
      console.log('Submitting to collection:', collection);
      console.log('Form data:', formData);
      
      await axios.post(`${API_BASE_URL}/data/${component.appId}`, {
        collection: collection,
        data: formData
      });
      
      setFormData({});
      
      // Trigger a refresh for all components
      setRefreshTrigger(prev => prev + 1);

      // Notify parent to refresh all components
      if (component.props?.onSubmitSuccess) {
        component.props.onSubmitSuccess();
      }
      
      // Trigger global refresh if available
      if (window.triggerGlobalRefresh) {
        window.triggerGlobalRefresh();
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Add defensive checks for component structure
  if (!component || typeof component !== 'object') {
    return (
      <div className="w-full h-full p-4 bg-red-100 dark:bg-red-900 rounded-lg border border-red-300 dark:border-red-700 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-300 text-sm">Invalid component</p>
      </div>
    );
  }

  const componentProps = component.props || {};
  const componentStyling = component.styling || {};

  const renderWidget = () => {
    switch (component.type) {
      case 'text':
        return (
          <div
            className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border"
            style={componentStyling}
          >
            <div 
              className="text-gray-900 dark:text-white"
              style={{
                fontSize: componentProps.fontSize === 'large' ? '1.5rem' : 
                         componentProps.fontSize === 'small' ? '0.875rem' : '1rem',
                textAlign: componentProps.textAlign || 'left'
              }}
            >
              {componentProps.content || 'Sample text'}
            </div>
          </div>
        );

      case 'button':
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={componentStyling}
          >
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                componentProps.variant === 'secondary'
                  ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{
                fontSize: componentProps.size === 'large' ? '1.125rem' : 
                         componentProps.size === 'small' ? '0.875rem' : '1rem'
              }}
              onClick={() => {
                if (componentProps.onClick) {
                  // Handle button click actions
                  console.log('Button clicked:', componentProps.onClick);
                }
              }}
            >
              {componentProps.text || 'Click me'}
            </button>
          </div>
        );

      case 'form':
        return (
          <div
            className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border"
            style={componentStyling}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {componentProps.title || 'Form'}
            </h3>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {componentProps.fields?.map((field, index) => {
                if (!field || typeof field !== 'object') return null;
                
                const fieldLabel = field.label || `Field ${index + 1}`;
                const fieldType = field.type || 'text';
                const fieldRequired = Boolean(field.required);
                
                return (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fieldLabel}
                      {fieldRequired && <span className="text-red-500">*</span>}
                    </label>
                    {fieldType === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        rows={3}
                        required={fieldRequired}
                      />
                    ) : fieldType === 'select' ? (
                      <select 
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required={fieldRequired}
                      >
                        <option value="">Select {fieldLabel.toLowerCase()}</option>
                        {field.options?.map((option, i) => (
                          <option key={i} value={option || `Option ${i + 1}`}>
                            {option || `Option ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={fieldType}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        required={fieldRequired}
                      />
                    )}
                  </div>
                );
              }) || (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  No form fields configured
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {componentProps.submitText || 'Submit'}
              </button>
            </form>
          </div>
        );

      case 'image':
        return (
          <div
            className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border overflow-hidden"
            style={componentStyling}
          >
            {componentProps.src ? (
              <img
                src={componentProps.src}
                alt={componentProps.alt || 'Image'}
                className="w-full h-full object-cover"
                style={{
                  objectFit: componentProps.fit || 'cover'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <span className="text-gray-500 dark:text-gray-400">No image</span>
              </div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div
            className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border"
            style={componentStyling}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {componentProps.title || 'Chart'}
            </h3>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {componentProps.chartType || 'Bar'} Chart
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Data points: {componentData?.data?.length || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'table':
        return (
          <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border overflow-auto" style={componentStyling}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {componentProps.title || 'Table'}
              </h3>
              {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
            </div>
            
            {/* Debug info - remove in production */}
            <div className="mb-2 text-xs text-gray-500">
              Collection: {component.props?.linkedCollection || component.id} | 
              Records: {componentData?.data?.length || 0}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {componentProps.columns?.map((column, index) => (
                      <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {column.header || column.field}
                      </th>
                    )) || (
                      // Auto-generate columns from data if no columns specified
                      componentData?.data?.[0] && Object.keys(componentData.data[0].data || {}).map((key, index) => (
                        <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {key}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {componentData?.data && componentData.data.length > 0 ? (
                    componentData.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {componentProps.columns?.map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {row.data?.[column.field] ?? '—'}
                          </td>
                        )) || (
                          // Auto-generate cells if no columns specified
                          Object.entries(row.data || {}).map(([key, value], colIndex) => (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {value ?? '—'}
                            </td>
                          ))
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={componentProps.columns?.length || Object.keys(componentData?.data?.[0]?.data || {}).length || 1} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {loading ? 'Loading...' : 'No data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {componentData?.pagination && (
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>Total: {componentData.pagination.total} items</span>
                <span>Page {componentData.pagination.page} of {componentData.pagination.pages}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div
            className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg border flex items-center justify-center"
            style={componentStyling}
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {component.type || 'Unknown'} widget
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderWidget()}
    </div>
  );
};

const AppPreview = () => {
  const { slug } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appId, setAppId] = useState(null);
  const [globalRefreshTrigger, setGlobalRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchApp = async () => {
      if (!slug) {
        setError('No app slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch public app by slug
        const response = await axios.get(`${API_BASE_URL}/apps/${slug}/public`);
        setApp(response.data.app);
        setAppId(response.data.app._id);
      } catch (err) {
        console.error('Error fetching app:', err);
        if (err.response?.status === 404) {
          setError('App not found or not public');
        } else if (err.response?.status === 403) {
          setError('Access denied');
        } else {
          setError('Failed to load app');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [slug]);

  // Set up global refresh function
  useEffect(() => {
    window.triggerGlobalRefresh = () => {
      setGlobalRefreshTrigger(prev => prev + 1);
    };
    
    return () => {
      delete window.triggerGlobalRefresh;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading app preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load App
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">App not found</p>
        </div>
      </div>
    );
  }

  const handleDataRefresh = () => {
    setGlobalRefreshTrigger(prev => prev + 1);
  };

  const components = app.layout?.components || [];
  const theme = app.layout?.theme;

  return (
    <div 
      className={`min-h-screen ${theme?.darkMode ? 'dark' : ''}`}
      style={{ 
        backgroundColor: theme?.backgroundColor || '#f9fafb',
        color: theme?.textColor || '#111827'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* App Header */}
        <div className="mb-6">
          <h1 
            className="text-3xl font-bold"
            style={{ color: theme?.primaryColor || '#111827' }}
          >
            {app.name}
          </h1>
          {app.description && (
            <p className="mt-2 text-lg opacity-80">
              {app.description}
            </p>
          )}
        </div>

        {/* App Canvas */}
        <div 
          className="rounded-xl shadow-sm border p-6 relative min-h-[600px]"
          style={{
            backgroundColor: theme?.backgroundColor || '#ffffff',
            borderColor: theme?.darkMode ? '#374151' : '#e5e7eb'
          }}
        >
          {components.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                This app has no components yet.
              </p>
            </div>
          ) : (
            <div className="relative">
              {components.map((component) => (
                <div
                  key={`${component.id}-${globalRefreshTrigger}`}
                  className="absolute"
                  style={{
                    left: component.position.x,
                    top: component.position.y,
                    width: component.position.width,
                    height: component.position.height,
                    minHeight: '40px',
                    zIndex: 1
                  }}
                >
                  <Widget 
                    component={{
                      ...component,
                      appId: appId
                    }} 
                    key={globalRefreshTrigger}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* App Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm opacity-60">
            Views: {app.analytics?.views || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppPreview;