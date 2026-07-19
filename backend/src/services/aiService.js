const OpenAI = require('openai');
const logger = require('../utils/logger');

let openaiClient = null;

function getClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function isAvailable() {
  return !!process.env.OPENAI_API_KEY;
}

async function summarize(text, options = {}) {
  const client = getClient();
  if (!client) {
    return { summary: text.slice(0, 500) + (text.length > 500 ? '...' : ''), fallback: true };
  }

  const { maxLength = 500, style = 'concise' } = options;
  const truncated = text.slice(0, 12000);

  const prompts = {
    concise: 'Provide a concise summary of the following content in 2-3 sentences.',
    detailed: 'Provide a detailed summary of the following content, covering all key points.',
    bullet: 'Provide a summary of the following content as bullet points (5-7 key points).',
    executive: 'Provide an executive summary suitable for a business audience.',
  };

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${prompts[style] || prompts.concise} Keep it under ${maxLength} characters.` },
        { role: 'user', content: truncated },
      ],
      temperature: 0.3,
      max_tokens: Math.ceil(maxLength / 2),
    });

    const summary = response.choices[0].message.content;
    logger.info('Content summarized', { inputLength: text.length, outputLength: summary.length });
    return { summary, fallback: false };
  } catch (error) {
    logger.error('Summarization failed:', error.message);
    return { summary: text.slice(0, maxLength) + '...', fallback: true, error: error.message };
  }
}

async function extractKeywords(text, options = {}) {
  const client = getClient();
  if (!client) {
    return { keywords: fallbackKeywords(text), fallback: true };
  }

  const { maxKeywords = 20 } = options;
  const truncated = text.slice(0, 8000);

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract up to ${maxKeywords} important keywords and phrases from the text. Return them as a JSON array of objects with "keyword" (string) and "relevance" (number 0-1) properties. Only return the JSON array, no other text.`,
        },
        { role: 'user', content: truncated },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    const keywords = Array.isArray(parsed) ? parsed : (parsed.keywords || []);
    
    logger.info('Keywords extracted', { count: keywords.length });
    return { keywords: keywords.slice(0, maxKeywords), fallback: false };
  } catch (error) {
    logger.error('Keyword extraction failed:', error.message);
    return { keywords: fallbackKeywords(text), fallback: true, error: error.message };
  }
}

async function classify(text, options = {}) {
  const client = getClient();
  if (!client) {
    return { category: 'uncategorized', fallback: true };
  }

  const { categories = ['technology', 'business', 'science', 'news', 'entertainment', 'education', 'health', 'sports', 'politics', 'other'] } = options;
  const truncated = text.slice(0, 4000);

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Classify the following content into one of these categories: ${categories.join(', ')}. Return a JSON object with "category" (string), "confidence" (number 0-1), and "subcategories" (array of strings). Only return the JSON object.`,
        },
        { role: 'user', content: truncated },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content);
    
    logger.info('Content classified', { category: result.category, confidence: result.confidence });
    return { ...result, fallback: false };
  } catch (error) {
    logger.error('Classification failed:', error.message);
    return { category: 'uncategorized', confidence: 0, fallback: true, error: error.message };
  }
}

async function generateEmbedding(text) {
  const client = getClient();
  if (!client) {
    return { embedding: null, fallback: true };
  }

  const truncated = text.slice(0, 8000);

  try {
    const response = await client.embeddings.create({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      input: truncated,
      dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS) || 1536,
    });

    const embedding = response.data[0].embedding;
    logger.info('Embedding generated', { dimensions: embedding.length });
    return { embedding, fallback: false };
  } catch (error) {
    logger.error('Embedding generation failed:', error.message);
    return { embedding: null, fallback: true, error: error.message };
  }
}

async function chatWithContent(messages, context, options = {}) {
  const client = getClient();
  if (!client) {
    return { response: 'AI chat is not available. OpenAI API key is not configured.', fallback: true };
  }

  const { maxContextLength = 10000 } = options;
  const contextText = context.slice(0, maxContextLength);

  try {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that answers questions about the following scraped web content. Be concise and accurate. If the answer is not in the content, say so.\n\nContext:\n${contextText}`,
    };

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const reply = response.choices[0].message.content;
    logger.info('Chat response generated', { messageCount: messages.length });
    return { response: reply, fallback: false };
  } catch (error) {
    logger.error('Chat failed:', error.message);
    return { response: 'Failed to generate response. Please try again.', fallback: true, error: error.message };
  }
}

function fallbackKeywords(text) {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because', 'as', 'until', 'while', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'also']);
  
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const freq = {};
  
  for (const word of words) {
    if (word.length > 3 && !stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, count]) => ({ keyword, relevance: Math.min(1, count / 10) }));
}

module.exports = {
  summarize,
  extractKeywords,
  classify,
  generateEmbedding,
  chatWithContent,
  isAvailable,
};
