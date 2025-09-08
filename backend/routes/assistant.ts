import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// No authentication required for assistant - it's a free service using OpenRouter API key

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// POST /api/assistant/chat
// Proxies a minimal chat request to OpenRouter using a free/lightweight model
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages?: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Ensure API key exists
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API key not configured');
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }
    
    console.log('OpenRouter API key exists:', !!apiKey);

    // Keep a short context to avoid exceeding token limits
    const MAX_MESSAGES = 8;
    const MAX_CONTENT_LEN = 1000; // characters per message

    const trimmedMessages: ChatMessage[] = messages
      .slice(-MAX_MESSAGES)
      .map((m) => ({
        role: m.role,
        content: String(m.content || '').slice(0, MAX_CONTENT_LEN)
      }));

    // Add a concise system prompt
    const systemMessage: ChatMessage = {
      role: 'system',
      content:
        'You are Astra, a concise and helpful compliance assistant inside a dashboard. Answer briefly and avoid long outputs. Default to bullet points when appropriate.'
    };

    // Use a free/lightweight model to minimize cost and latency
    const preferredModel = 'qwen/qwen2.5-7b-instruct';
    const fallbackModel = 'google/gemma-2-9b-it';

    const callOpenRouter = async (model: string) => {
      return axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [systemMessage, ...trimmedMessages],
          max_tokens: 256,
          temperature: 0.2
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Compliance-SaaS Assistant'
          },
          timeout: 20000
        }
      );
    };

    let response;
    try {
      console.log('Trying preferred model:', preferredModel);
      response = await callOpenRouter(preferredModel);
    } catch (e: any) {
      console.log('Preferred model failed, trying fallback:', e?.message || 'Unknown error');
      try {
        response = await callOpenRouter(fallbackModel);
      } catch (fallbackError: any) {
        console.error('Both models failed:', fallbackError?.message || 'Unknown error');
        throw fallbackError;
      }
    }

    const choice = response.data?.choices?.[0];
    const content: string = choice?.message?.content || '';

    return res.json({ message: content });
  } catch (err: any) {
    console.error('Assistant route error:', err);
    
    // Handle specific OpenRouter API errors
    if (err?.response?.status === 401) {
      return res.status(500).json({ 
        error: 'OpenRouter API authentication failed', 
        detail: 'Please check the OPENROUTER_API_KEY environment variable' 
      });
    }
    
    if (err?.response?.status === 429) {
      return res.status(500).json({ 
        error: 'OpenRouter API rate limit exceeded', 
        detail: 'Please try again in a moment' 
      });
    }
    
    const detail = err?.response?.data || err?.message || 'Unknown error';
    console.error('Error detail:', detail);
    return res.status(500).json({ error: 'Failed to get assistant response', detail });
  }
});

export default router; 