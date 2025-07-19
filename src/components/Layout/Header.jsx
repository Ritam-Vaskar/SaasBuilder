import React, { useState } from 'react';
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
  Sun,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { 
    currentApp, 
    isPreviewMode, 
    isDarkMode,
    togglePreviewMode, 
    toggleDarkMode,
    updateApp 
  } = useApp();

  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    if (!currentApp) {
      setSaveStatus('error');
      setSaveMessage('No app to save');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    try {
      setSaveStatus('saving');
      setSaveMessage('Saving...');
      
      await updateApp(currentApp._id, {
        layout: currentApp.layout,
        updatedAt: new Date().toISOString()
      });
      
      setSaveStatus('saved');
      setSaveMessage('Saved successfully!');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save app:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to save app');
      
      // Reset status after 5 seconds for errors
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 5000);
    }
  };

  const handleShare = async () => {
    if (!currentApp) return;
    
    try {
      // Copy share URL to clipboard
      const shareUrl = `${window.location.origin}/app/${currentApp.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Show success message (you might want to add a toast notification here)
      alert(`Share URL copied to clipboard: ${shareUrl}`);
    } catch (error) {
      console.error('Failed to copy share URL:', error);
      // Fallback: show the URL in a prompt
      const shareUrl = `${window.location.origin}/app/${currentApp.slug}`;
      prompt('Copy this URL to share your app:', shareUrl);
    }
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Saved</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </>
        );
      default:
        return (
          <>
            <Save className="w-4 h-4" />
            <span>Save</span>
          </>
        );
    }
  };

  const getSaveButtonClasses = () => {
    const baseClasses = "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
    
    switch (saveStatus) {
      case 'saving':
        return `${baseClasses} bg-blue-500 text-white cursor-not-allowed`;
      case 'saved':
        return `${baseClasses} bg-green-600 text-white`;
      case 'error':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
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
              {saveMessage && (
                <span className={`text-sm ${
                  saveStatus === 'saved' ? 'text-green-600' : 
                  saveStatus === 'error' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {saveMessage}
                </span>
              )}
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
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
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
                disabled={saveStatus === 'saving'}
                className={getSaveButtonClasses()}
                title={saveMessage || 'Save your app'}
              >
                {getSaveButtonContent()}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                title="Share your app"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
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
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.plan || 'Free'} plan
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Logout"
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