import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';;

class AIService {
  static async getSuggestions(appType, description) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/suggest-widgets`, {
        appType,
        description
      });
      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  }

  static async generateTemplate(appType, description) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate-template`, {
        appType,
        description
      });
      
      // Ensure the template has the correct structure
      const template = response.data.template;
      if (!template || !template.layout || !template.layout.components) {
        throw new Error('Invalid template structure');
      }
      
      return {
        name: template.name,
        description: template.description,
        layout: {
          components: template.layout.components.map(component => ({
            ...component,
            id: component.id || crypto.randomUUID(),
            position: component.position || { x: 0, y: 0, width: 200, height: 100 }
          }))
        }
      };
    } catch (error) {
      console.error('Error generating template:', error);
      return null;
    }
  }

  static async optimizeLayout(components) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/optimize-layout`, {
        components
      });
      return response.data.optimizedLayout;
    } catch (error) {
      console.error('Error optimizing layout:', error);
      return null;
    }
  }
}

export default AIService;