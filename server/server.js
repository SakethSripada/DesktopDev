const express = require('express');
const axios = require('axios');
const cors = require('cors');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

app.post('/api/generate', async (req, res) => {
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

app.post('/connect-repo', async (req, res) => {
  const { repoUrl, localPath } = req.body;

  const normalizedPath = path.normalize(localPath);
  const git = simpleGit();

  console.log(`Attempting to clone repository: ${repoUrl}`);
  console.log(`Cloning into local path: ${normalizedPath}`);

  if (fs.existsSync(normalizedPath)) {
    const files = fs.readdirSync(normalizedPath);
    if (files.length > 0) {
      console.error(`Directory is not empty: ${normalizedPath}`);
      return res.status(400).send({ error: 'Destination path is not empty.' });
    }
  } else {
    try {
      fs.mkdirSync(normalizedPath, { recursive: true });
      console.log(`Directory created at: ${normalizedPath}`);
    } catch (mkdirError) {
      console.error(`Failed to create directory at: ${normalizedPath}`, mkdirError);
      return res.status(500).send({ error: 'Failed to create directory.', details: mkdirError.message });
    }
  }

  try {
    await git.clone(repoUrl, normalizedPath);
    console.log('Repository cloned successfully.');
    res.status(200).send({ message: 'Repository cloned successfully.' });
  } catch (error) {
    console.error('Error cloning repository:', error.message);
    console.error(error.stack);
    res.status(500).send({ error: 'Failed to clone repository.', details: error.message });
  }
});

app.post('/connect-existing-repo', async (req, res) => {
  const { localPath } = req.body;

  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Attempting to connect to existing repository at: ${normalizedPath}`);

  if (!fs.existsSync(normalizedPath)) {
    console.error(`Directory does not exist: ${normalizedPath}`);
    return res.status(400).send({ error: 'Directory does not exist.' });
  }

  try {
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      console.log('Connected to existing repository.');
      res.status(200).send({ message: 'Connected to existing repository.' });
    } else {
      console.error(`Directory is not a Git repository: ${normalizedPath}`);
      res.status(400).send({ error: 'Directory is not a Git repository.' });
    }
  } catch (error) {
    console.error('Error connecting to repository:', error.message);
    res.status(500).send({ error: 'Failed to connect to repository.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
