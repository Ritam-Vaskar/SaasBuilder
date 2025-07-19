import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface WidgetSuggestion {
  type: string;
  name: string;
  description: string;
}

export interface Template {
  name: string;
  description: string;
  layout: {
    components: Array<{
      id: string;
      type: string;
      position: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      props: Record<string, any>;
    }>;
  };
}

export interface OptimizedLayout {
  suggestions: string[];
  improvements: Array<{
    id: string;
    type: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

class AIService {
  static async getSuggestions(appType: string, description: string): Promise<WidgetSuggestion[]> {
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

  static async generateTemplate(appType: string, description: string): Promise<Template | null> {
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

  static async optimizeLayout(components: any[]): Promise<OptimizedLayout | null> {
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