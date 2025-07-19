const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Groq = require('groq-sdk');

const router = express.Router();

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'your-groq-api-key'
});

// Helper function to generate prompts
const generatePrompt = (type, appType, description) => {
  switch (type) {
    case 'suggest-widgets':
      return `As an AI app builder assistant, suggest widgets for a ${appType} app with the following description: ${description}.
Provide suggestions in this format:
[{ type: string, name: string, description: string }]
Focus on essential widgets that would enhance user experience and functionality.`;
    
    case 'generate-template':
      return `Design a template for a ${appType} app with this description: ${description}.
Create a layout with appropriate components, positions, and properties.
Ensure the template follows best practices for ${appType} applications and includes necessary features.`;
    
    case 'optimize-layout':
      return `Analyze this app layout and suggest improvements:
${JSON.stringify(description, null, 2)}
Provide specific suggestions for:
1. Component positioning
2. Spacing and alignment
3. Visual hierarchy
4. User experience enhancement`;
  }
};

// Helper function to make Groq API calls
const callGroqAPI = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama3-8b-8192", // You can also use "mixtral-8x7b-32768" or "llama3-70b-8192"
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1,
    stream: false,
    stop: null
  });

  return completion.choices[0]?.message?.content || '';
};

// Get widget suggestions
router.post('/suggest-widgets', authMiddleware, async (req, res) => {
  try {
    const { appType, description } = req.body;
    
    const prompt = generatePrompt('suggest-widgets', appType, description);
    const response = await callGroqAPI(prompt);
    
    // Parse the JSON response
    let suggestions;
    try {
      suggestions = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI service');
      }
    }
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Generate template
router.post('/generate-template', authMiddleware, async (req, res) => {
  try {
    const { appType, description } = req.body;
    
    const prompt = generatePrompt('generate-template', appType, description);
    const response = await callGroqAPI(prompt);
    
    // Parse the JSON response
    let template;
    try {
      template = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        template = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI service');
      }
    }
    
    res.json({ template });
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

// Optimize layout
router.post('/optimize-layout', authMiddleware, async (req, res) => {
  try {
    const { components } = req.body;
    
    const prompt = generatePrompt('optimize-layout', null, components);
    const response = await callGroqAPI(prompt);
    
    // Parse the JSON response
    let optimizedLayout;
    try {
      optimizedLayout = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizedLayout = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI service');
      }
    }
    
    res.json({ optimizedLayout });
  } catch (error) {
    console.error('Error optimizing layout:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

module.exports = router;