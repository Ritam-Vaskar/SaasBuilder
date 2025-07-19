const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Groq = require('groq-sdk');

const router = express.Router();

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'your-groq-api-key'
});

// Strict prompt generator
const generatePrompt = (type, appType, description) => {
  switch (type) {
    case 'suggest-widgets':
      return `You are an expert UI assistant.

Suggest widgets for a ${appType} app with the following description: "${description}".

Return ONLY a JSON array like this:
[
  { "type": "input", "name": "Task Name", "description": "Field to enter task title" },
  { "type": "button", "name": "Submit", "description": "Submits the task form" }
]

No markdown, no explanation, no preface. Just pure JSON.`;

    case 'generate-template':
      return `Create a layout template for a ${appType} app with this description: "${description}".

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Template Name",
  "description": "Template Description",
  "layout": {
    "components": [
      {
        "id": "unique-id-1",
        "type": "text|button|form|table",
        "props": { },
        "position": { "x": 0, "y": 0, "width": 200, "height": 100 }
      }
    ]
  }
}

No explanation, no markdown. Just the JSON object.`;

    case 'optimize-layout':
      return `You're a UI optimization assistant.

Given this app layout:
${JSON.stringify(description, null, 2)}

Return ONLY a valid JSON object with improved layout suggestions, like:
{
  "suggestions": [
    {
      "issue": "Button misaligned",
      "recommendation": "Center the button within its parent container"
    },
    {
      "issue": "Too much spacing",
      "recommendation": "Reduce margin between cards from 32px to 16px"
    }
  ]
}

Do NOT include any explanation, preface, or markdown. JSON only.`;
  }
};

// Safer JSON extractor
function extractFirstJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Fallback: try to extract the first valid JSON object or array
    const arrayMatch = text.match(/\[[\s\S]*?\]/);
    const objectMatch = text.match(/\{(?:[^{}]|{[^{}]*})*\}/); // handles nested {}
    try {
      if (arrayMatch) return JSON.parse(arrayMatch[0]);
      if (objectMatch) return JSON.parse(objectMatch[0]);
    } catch (e2) {
      return null;
    }
  }
  return null;
}

// Groq API call
const callGroqAPI = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama3-8b-8192',
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1,
    stream: false
  });

  return completion.choices[0]?.message?.content || '';
};

// Routes

router.post('/suggest-widgets', authMiddleware, async (req, res) => {
  try {
    const { appType, description } = req.body;

    const prompt = generatePrompt('suggest-widgets', appType, description);
    const response = await callGroqAPI(prompt);
    console.log("Groq Response [widgets]:", response);

    const suggestions = extractFirstJSON(response);
    if (!suggestions) throw new Error('Invalid JSON response from AI');

    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting widget suggestions:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

router.post('/generate-template', authMiddleware, async (req, res) => {
  try {
    const { appType, description } = req.body;

    const prompt = generatePrompt('generate-template', appType, description);
    const response = await callGroqAPI(prompt);
    console.log("Groq Response [template]:", response);

    const template = extractFirstJSON(response);
    if (!template) throw new Error('Invalid JSON response from AI');

    res.json({ template });
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

router.post('/optimize-layout', authMiddleware, async (req, res) => {
  try {
    const { components } = req.body;

    const prompt = generatePrompt('optimize-layout', null, components);
    const response = await callGroqAPI(prompt);
    console.log("Groq Response [optimize-layout]:", response);

    const optimizedLayout = extractFirstJSON(response);
    if (!optimizedLayout) throw new Error('Invalid JSON response from AI');

    res.json({ optimizedLayout });
  } catch (error) {
    console.error('Error optimizing layout:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
});

module.exports = router;
