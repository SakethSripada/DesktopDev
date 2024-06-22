const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/request', async (req, res) => {
  const { method, url, headers, body } = req.body;

  try {
    const validHeaders = headers.reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const response = await axios({
      method,
      url,
      headers: validHeaders,
      data: body,
    });

    res.status(200).send({ data: response.data, status: response.status });
  } catch (error) {
    res.status(500).send({ error: error.message, details: error.response ? error.response.data : null });
  }
});

module.exports = router;
