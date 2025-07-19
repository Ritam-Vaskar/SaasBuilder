import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [apps, setApps] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.get(`${API_BASE_URL}/apps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApps(response.data.apps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      throw error;
    }
  };

  const fetchPublicApp = async (slug) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/apps/${slug}/public`);
      return response.data.app;
    } catch (error) {
      console.error('Error fetching public app:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch app');
    }
  };

  const createApp = async (appData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.post(`${API_BASE_URL}/apps`, appData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const newApp = response.data.app;
      setApps(prev => [newApp, ...prev]);
      return newApp;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create app');
    }
  };

  const updateApp = async (appId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.put(`${API_BASE_URL}/apps/${appId}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const updatedApp = response.data.app;
      
      setApps(prev => prev.map(app => 
        app._id === appId ? updatedApp : app
      ));
      
      if (currentApp?._id === appId) {
        setCurrentApp(updatedApp);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update app');
    }
  };

  const deleteApp = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      await axios.delete(`${API_BASE_URL}/apps/${appId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApps(prev => prev.filter(app => app._id !== appId));
      
      if (currentApp?._id === appId) {
        setCurrentApp(null);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete app');
    }
  };

  const toggleAppVisibility = async (appId, isPublic) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.patch(`${API_BASE_URL}/apps/${appId}/visibility`, 
        { isPublic },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const updatedApp = response.data.app;
      setApps(prev => prev.map(app => 
        app._id === appId ? updatedApp : app
      ));
      
      if (currentApp?._id === appId) {
        setCurrentApp(updatedApp);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update app visibility');
    }
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(prev => !prev);
    setSelectedComponent(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateComponent = (componentId, updates) => {
    if (!currentApp) return;

    const updatedComponents = currentApp.layout.components.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    );

    const updatedApp = {
      ...currentApp,
      layout: {
        ...currentApp.layout,
        components: updatedComponents
      }
    };

    setCurrentApp(updatedApp);
    
    // Update selected component if it's the one being updated
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
  };

  const addComponent = (component) => {
    if (!currentApp) return;

    const updatedApp = {
      ...currentApp,
      layout: {
        ...currentApp.layout,
        components: [...currentApp.layout.components, component]
      }
    };

    setCurrentApp(updatedApp);
  };

  const removeComponent = (componentId) => {
    if (!currentApp) return;

    const updatedComponents = currentApp.layout.components.filter(
      comp => comp.id !== componentId
    );

    const updatedApp = {
      ...currentApp,
      layout: {
        ...currentApp.layout,
        components: updatedComponents
      }
    };

    setCurrentApp(updatedApp);
    
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  const duplicateComponent = (componentId) => {
    if (!currentApp) return;

    const originalComponent = currentApp.layout.components.find(
      comp => comp.id === componentId
    );

    if (!originalComponent) return;

    const duplicatedComponent = {
      ...originalComponent,
      id: `${originalComponent.id}-copy-${Date.now()}`,
      position: {
        ...originalComponent.position,
        x: originalComponent.position.x + 20,
        y: originalComponent.position.y + 20
      }
    };

    addComponent(duplicatedComponent);
  };

  const submitFormData = async (formId, data) => {
    try {
      if (!currentApp) throw new Error('No active app');
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const formComponent = getComponentById(formId);
      if (!formComponent) throw new Error('Form component not found');

      // If the form is linked to a table, use the table's ID as the collection
      const collectionId = formComponent.props.linkedTable || formId;

      const response = await axios.post(`${API_BASE_URL}/data/${currentApp._id}`, {
        collection: collectionId,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          formId: formId
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting form data:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit form data');
    }
  };

  const fetchComponentData = async (componentId) => {
    try {
      if (!currentApp) throw new Error('No active app');
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const component = getComponentById(componentId);
      if (!component) throw new Error('Component not found');

      const response = await axios.get(`${API_BASE_URL}/data/${currentApp._id}`, {
        params: { collection: componentId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // For tables, return all data entries as an array
      if (component.type === 'table') {
        return { data: Array.isArray(response.data) ? response.data : [] };
      }

      // For forms or other components, return the latest entry
      if (Array.isArray(response.data) && response.data.length > 0) {
        return { data: response.data[response.data.length - 1] };
      }

      return { data: null };
    } catch (error) {
      console.error('Error fetching component data:', error);
      return { data: component?.type === 'table' ? [] : null };
    }
  };

  const getComponentById = (componentId) => {
    if (!currentApp) return null;
    return currentApp.layout.components.find(comp => comp.id === componentId) || null;
  };

  const value = {
    apps,
    currentApp,
    selectedComponent,
    isPreviewMode,
    isDarkMode,
    fetchApps,
    fetchPublicApp,
    createApp,
    updateApp,
    deleteApp,
    toggleAppVisibility,
    setCurrentApp,
    setSelectedComponent,
    togglePreviewMode,
    toggleDarkMode,
    updateComponent,
    addComponent,
    removeComponent,
    duplicateComponent,
    submitFormData,
    fetchComponentData,
    getComponentById
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};