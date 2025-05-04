import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  // Avoid throwing error during build time if key is not yet set
  console.warn('OPENAI_API_KEY environment variable is not set. AI features will not work.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Default to empty string if not set
});

