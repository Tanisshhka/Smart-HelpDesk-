import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Fallback keyword mapping
const keywordMapping = {
  'network': 'Network',
  'wifi': 'Network',
  'internet': 'Network',
  'hardware': 'Hardware',
  'laptop': 'Hardware',
  'monitor': 'Hardware',
  'mouse': 'Hardware',
  'keyboard': 'Hardware',
  'software': 'Software',
  'install': 'Software',
  'app': 'Software',
  'crash': 'Software',
  'password': 'Authentication',
  'login': 'Authentication',
  'account': 'Authentication',
  '2fa': 'Authentication',
  'security': 'Security',
  'virus': 'Security',
  'phishing': 'Security',
  'email': 'Email',
  'outlook': 'Email',
  'access': 'Access Management',
  'permission': 'Access Management',
};

const categorizeWithKeywords = (text) => {
  const lowerText = text.toLowerCase();
  for (const [keyword, category] of Object.entries(keywordMapping)) {
    if (lowerText.includes(keyword)) {
      return category;
    }
  }
  return 'General';
};

const categorizeTicket = async (title, description) => {
  const textToAnalyze = `${title} ${description}`;
  const validCategories = ['Hardware', 'Network', 'Software', 'Authentication', 'Security', 'Email', 'Access Management', 'General'];
  
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // Try 2026-era models as 1.5 is deprecated
      const modelNames = ["gemini-3.1-pro-preview", "gemini-3.1-flash-preview", "gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-1.5-flash", "gemini-pro"];
      let model;
      let errorOccurred;

      for (const name of modelNames) {
        try {
          model = genAI.getGenerativeModel({ model: name });
          const prompt = `You are an IT Helpdesk assistant. Categorize the following ticket into EXACTLY one of these categories: ${validCategories.join(', ')}. Reply ONLY with the category name.
          
          Ticket:
          Title: ${title}
          Description: ${description}`;

          const result = await model.generateContent(prompt);
          const category = result.response.text().trim();
          
          if (validCategories.includes(category)) {
            return category;
          }
        } catch (err) {
          console.warn(`Gemini model ${name} failed, trying next...`);
          errorOccurred = err;
          continue;
        }
      }
      if (errorOccurred) throw errorOccurred;
    } catch (error) {
      console.error('Gemini API Error (Categorization):', error);
    }
  }
  
  return categorizeWithKeywords(textToAnalyze);
};

const generateAiResponse = async (ticketContext, previousMessages, userMessage) => {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelNames = ["gemini-3.1-pro-preview", "gemini-3.1-flash-preview", "gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-1.5-flash", "gemini-pro"];
    
    let lastError;
    for (const name of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: name });

        // Convert history to Gemini format
        const history = previousMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });

        const systemPrompt = `You are an intelligent IT Helpdesk Assistant. Your job is to help users troubleshoot their technical issues step-by-step like a real technician.

Instructions:
1. First, carefully analyze the user's problem.
2. Identify the category (e.g., Network, Software, Hardware, Login Issue, etc.).
3. Ask 1-2 relevant diagnostic questions before giving a solution.
4. Based on the user's answers, suggest clear, step-by-step troubleshooting solutions.
5. Keep responses simple, practical, and easy to follow.
6. If the issue is not resolved, continue asking follow-up questions.
7. If the issue seems complex, suggest creating a support ticket.

Response Format:
- Problem Category:
- Possible Cause:
- Questions:
  1.
  2.
- Suggested Fix (Step-by-step):
  1.
  2.
  3.
- If not resolved:

Current Ticket Context:
Title: ${ticketContext.title}
Description: ${ticketContext.description}
Category: ${ticketContext.category}

User's current message: ${userMessage}`;

        const result = await chat.sendMessage(systemPrompt);
        return result.response.text().trim();

      } catch (error) {
        console.warn(`Gemini model ${name} failed in chat, trying next...`);
        lastError = error;
        continue;
      }
    }

    // If all models fail
    console.error('All Gemini models failed:', lastError);
    if (lastError?.message?.includes('quota')) {
      return "AI Error: Free tier quota reached. Please wait a minute and try again.";
    }
    return `AI Error: ${lastError?.message || 'Unknown Error'}`;
  }
  
  return "I'm currently unable to process your request as my AI services (Gemini) are not configured. Please add GEMINI_API_KEY to your .env file.";
};

export { categorizeTicket, generateAiResponse };
