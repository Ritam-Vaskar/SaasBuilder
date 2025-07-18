import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { 
  User, 
  Settings, 
  LogOut, 
  Play, 
  Pause, 
  Save, 
  Share2,
  Moon,
  Sun
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    currentApp, 
    isPreviewMode, 
    isDarkMode,
    togglePreviewMode, 
    toggleDarkMode,
    updateApp 
  } = useApp();

  const handleSave = async () => {
    if (currentApp) {
      try {
        await updateApp(currentApp._id, {
          layout: currentApp.layout,
          updatedAt: new Date().toISOString()
        });
        // Show success notification
      } catch (error) {
        console.error('Failed to save app:', error);
      }
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SaaS Builder
            </span>
          </div>
          
          {currentApp && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <span>/</span>
              <span className="font-medium">{currentApp.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {currentApp && (
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePreviewMode}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isPreviewMode
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPreviewMode ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Exit Preview</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Preview</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

              <button
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.plan} plan
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;