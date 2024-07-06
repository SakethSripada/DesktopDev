const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const aiRoutes = require('./routes/aiRoutes');
const gitRoutes = require('./routes/gitRoutes');
const requestRoutes = require('./routes/requestRoutes');
const scaffoldingRoutes = require('./routes/scaffoldingRoutes'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 's3cR3t5TriNg', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // change this to true if using HTTPS
}));

app.use('/api', aiRoutes);
app.use('/', gitRoutes);
app.use('/', requestRoutes);
app.use('/', scaffoldingRoutes); 

app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code
  }, {
    headers: {
      Accept: 'application/json'
    }
  });
  const { access_token } = tokenResponse.data;
  req.session.githubToken = access_token;
  res.redirect('/auth/github/success'); 
});

app.get('/auth/github/success', (req, res) => {
  res.send('<script>window.close()</script>'); 
});

app.get('/auth/github/repositories', async (req, res) => {
  const token = req.session.githubToken;
  if (!token) {
    return res.status(401).send({ error: 'Not authenticated with GitHub' });
  }

  try {
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`
      }
    });
    res.send(reposResponse.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
