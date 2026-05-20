const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const client = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const getMockAnalysis = (code, language) => ({
  summary: `This ${language} code contains basic functionality. The analysis below identifies potential improvements in performance, readability, and best practices. Consider the suggestions to enhance code quality and maintainability.`,
  problems: [
    'Missing error handling in async operations',
    'Potential null/undefined reference without checks',
    'Unused variables or imports detected',
  ],
  suggestions: [
    'Add try-catch blocks around async operations',
    'Implement proper input validation before use',
    'Use optional chaining (?.) for safer property access',
    'Remove unused imports and variables',
    'Consider using const instead of let for immutable bindings',
  ],
  modifications: [
    'Wrap async calls in try-catch for error handling',
    'Add null checks before accessing object properties',
    'Use destructuring for cleaner variable assignments',
    'Implement proper error logging and debugging',
  ],
  improvedCode: `// Improved version with better practices
async function processData(data) {
  try {
    if (!data) {
      throw new Error('Data is required');
    }
    
    const result = await fetchResults(data);
    return result ?? null;
  } catch (error) {
    console.error('Processing error:', error.message);
    return null;
  }
}`,
});

const parseAIResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (firstError) {
    const fallbackJsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (fallbackJsonMatch) {
      try {
        return JSON.parse(fallbackJsonMatch[0]);
      } catch (secondError) {
        return null;
      }
    }
    return null;
  }
};

router.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'Code is required for AI analysis.' });
    }

    // Dev mode: return mock analysis
    if (process.env.DEV_AI_MOCK === 'true') {
      const mock = getMockAnalysis(code, language);
      return res.status(200).json(mock);
    }

    // Production mode: require real API key
    if (!process.env.GEMINI_API_KEY || !client) {
      return res.status(500).json({
        message: 'AI provider key is not configured. Set GEMINI_API_KEY in .env or enable DEV_AI_MOCK=true for development.',
      });
    }

    const prompt = `Analyze the following ${language} code and return only valid JSON in this exact structure:
{
  "summary": "",
  "problems": [],
  "suggestions": [],
  "modifications": [],
  "improvedCode": ""
}

Focus on syntax issues, bad practices, scalability, optimization, React issues, Redux issues, async issues, security concerns, memory leaks, unnecessary re-renders, naming conventions, readability, and maintainability.

Code:
${code}`;

    const model = client.getGenerativeModel({ model: 'gemini-1.0' });
    const result = await model.generateContent({
      text: prompt,
      temperature: 0.1,
      maxOutputTokens: 800,
    });

    const rawText = typeof result?.response?.text === 'function'
      ? result.response.text()
      : '';

    const parsed = parseAIResponse(rawText);

    if (!parsed) {
      return res.status(200).json({
        summary: rawText || 'AI returned an unexpected response format.',
        problems: [],
        suggestions: [],
        modifications: [],
        improvedCode: '',
      });
    }

    return res.status(200).json({
      summary: parsed.summary || '',
      problems: Array.isArray(parsed.problems) ? parsed.problems : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      modifications: Array.isArray(parsed.modifications) ? parsed.modifications : [],
      improvedCode: parsed.improvedCode || '',
    });
  } catch (error) {
    console.error('AI route error:', error);
    return res.status(500).json({ message: 'Failed to analyze code. Check server logs for details.' });
  }
});


module.exports = router;
