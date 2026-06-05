const express = require('express');
const router = express.Router();
const https = require('https');
const { protect } = require('../middleware/auth');
const Conversation = require('../models/Conversation');

// OpenRouter API — free models, no credit card needed
// Sign up at https://openrouter.ai and get a free API key
function callAI(messages) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return reject(new Error('API key not set in backend/.env'));
    }

    const body = JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        {
          role: 'system',
          content: 'You are Mente, a friendly, concise, and genuinely helpful AI assistant. Be warm but get to the point. Format code with proper markdown code blocks.'
        },
        ...messages
      ],
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Mente Chatbot',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            return reject(new Error(`OpenRouter ${res.statusCode}: ${parsed.error?.message}`));
          }
          const text = parsed.choices?.[0]?.message?.content || 'No response.';
          resolve({ content: [{ text }] });
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

// POST /api/chat/message
router.post('/message', protect, async (req, res) => {
  const { message, conversationId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      conversation = new Conversation({
        user: req.user._id,
        title: message.length > 40 ? message.slice(0, 40) + '…' : message,
        messages: [],
      });
    }

    conversation.messages.push({ role: 'user', content: message });

    const history = conversation.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const data = await callAI(history);
    const aiReply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';

    conversation.messages.push({ role: 'assistant', content: aiReply });
    await conversation.save();

    res.json({ reply: aiReply, conversationId: conversation._id });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(502).json({ message: error.message });
  }
});

// GET /api/chat/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(30);
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// GET /api/chat/conversations/:id
router.get('/conversations/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation' });
  }
});

// DELETE /api/chat/conversations/:id
router.delete('/conversations/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting conversation' });
  }
});

module.exports = router;