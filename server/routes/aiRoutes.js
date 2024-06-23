const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error generating response' });
  }
});

router.post('/list-files', (req, res) => {
  const { path: projectPath } = req.body;

  if (!projectPath || typeof projectPath !== 'string') {
    console.error('Invalid project path:', projectPath);
    return res.status(400).json({ error: 'Valid project path is required' });
  }

  fs.readdir(projectPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Error reading directory' });
    }

    res.json({ files });
  });
});

router.post('/read-file', (req, res) => {
  const { projectPath, filePath } = req.body;

  if (!projectPath || typeof projectPath !== 'string') {
    console.error('Invalid project path:', projectPath);
    return res.status(400).json({ error: 'Valid project path is required' });
  }

  if (!filePath || typeof filePath !== 'string') {
    console.error('Invalid file path:', filePath);
    return res.status(400).json({ error: 'Valid file path is required' });
  }

  const fullPath = path.join(projectPath, filePath);

  fs.readFile(fullPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    res.json({ content: data });
  });
});

module.exports = router;
