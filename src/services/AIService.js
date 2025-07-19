import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
      return response.data.template;
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