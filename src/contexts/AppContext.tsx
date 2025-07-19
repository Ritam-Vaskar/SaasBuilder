import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface Component {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  props: any;
  styling: any;
  data: any;
}

interface App {
  _id: string;
  name: string;
  description: string;
  type: string;
  slug: string;
  isPublic: boolean;
  layout: {
    components: Component[];
    gridSize: number;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      textColor: string;
      darkMode: boolean;
    };
  };
  analytics: {
    views: number;
    uniqueVisitors: number;
    lastViewed?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  apps: App[];
  currentApp: App | null;
  selectedComponent: Component | null;
  isPreviewMode: boolean;
  isDarkMode: boolean;
  fetchApps: () => Promise<void>;
  fetchPublicApp: (slug: string) => Promise<App>;
  createApp: (appData: Partial<App>) => Promise<App>;
  updateApp: (appId: string, updates: Partial<App>) => Promise<void>;
  deleteApp: (appId: string) => Promise<void>;
  toggleAppVisibility: (appId: string, isPublic: boolean) => Promise<void>;
  setCurrentApp: (app: App | null) => void;
  setSelectedComponent: (component: Component | null) => void;
  togglePreviewMode: () => void;
  toggleDarkMode: () => void;
  updateComponent: (componentId: string, updates: Partial<Component>) => void;
  addComponent: (component: Component) => void;
  removeComponent: (componentId: string) => void;
  duplicateComponent: (componentId: string) => void;
  submitFormData: (formId: string, data: any) => Promise<any>;
  fetchComponentData: (componentId: string) => Promise<any>;
  getComponentById: (componentId: string) => Component | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [apps, setApps] = useState<App[]>([]);
  const [currentApp, setCurrentApp] = useState<App | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  

  

  // const getComponentById = (componentId: string): Component | null => {
  //   if (!currentApp) return null;
  //   return currentApp.layout.components.find(comp => comp.id === componentId) || null;
  // };

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

  const fetchPublicApp = async (slug: string): Promise<App> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/apps/${slug}/public`);
      return response.data.app;
    } catch (error: any) {
      console.error('Error fetching public app:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch app');
    }
  };

  const createApp = async (appData: Partial<App>): Promise<App> => {
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create app');
    }
  };

  const updateApp = async (appId: string, updates: Partial<App>) => {
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update app');
    }
  };

  const deleteApp = async (appId: string) => {
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete app');
    }
  };

  const toggleAppVisibility = async (appId: string, isPublic: boolean) => {
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
    } catch (error: any) {
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

  const updateComponent = (componentId: string, updates: Partial<Component>) => {
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

  const addComponent = (component: Component) => {
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

  const removeComponent = (componentId: string) => {
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

  const duplicateComponent = (componentId: string) => {
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

    const submitFormData = async (formId: string, data: any) => {
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
    } catch (error: any) {
      console.error('Error submitting form data:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit form data');
    }
  };

  const fetchComponentData = async (componentId: string) => {
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
    } catch (error: any) {
      console.error('Error fetching component data:', error);
      return { data: component?.type === 'table' ? [] : null };
    }
  };

  const getComponentById = (componentId: string): Component | null => {
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