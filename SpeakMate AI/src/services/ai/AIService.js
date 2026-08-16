/**
 * AIService
 * Abstract LLM Connector layer supporting SpeakMate AI backend endpoints & fallback mock AI responses.
 */

import { DEFAULT_AI_CONFIG, AI_PROVIDERS } from '../../config/AIConfig';
import { SmartChatEngine } from './SmartChatEngine';

export class AIService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  /**
   * Send user text prompt to AI provider and return textual response
   * @param {string} prompt User message text
   * @param {Array} history Conversation history array [{role, content}]
   * @param {object} options Extra options { mode, scenario, level }
   */
  async generateResponse(prompt, history = [], options = {}) {
    if (!prompt || !prompt.trim()) return '';

    try {
      if (this.config.provider === AI_PROVIDERS.SPEAKMATE_BACKEND) {
        return await this._callBackend(prompt, history);
      } else if (this.config.provider === AI_PROVIDERS.OPENAI_DIRECT) {
        return await this._callOpenAI(prompt, history);
      } else {
        return this._generateMockResponse(prompt, history, options);
      }
    } catch (err) {
      console.warn('[AIService] API call failed, falling back to dynamic smart response:', err);
      return this._generateMockResponse(prompt, history, options);
    }
  }

  async _callBackend(prompt, history) {
    const response = await fetch(`${this.config.apiBaseUrl}${this.config.chatEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history,
        systemPrompt: this.config.systemPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend response error code ${response.status}`);
    }

    const data = await response.json();
    return data.reply || data.response || data.message || 'I am listening! How can I help you practice your English today?';
  }

  async _callOpenAI(prompt, history) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY is missing.');
    }

    const messages = [
      { role: 'system', content: this.config.systemPrompt },
      ...history,
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API status error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'I am ready to practice speaking with you!';
  }

  _generateMockResponse(prompt, history = [], options = {}) {
    const feedback = SmartChatEngine.generateFeedback(prompt, { ...options, history });
    return feedback.aiReply || feedback.message;
  }
}

