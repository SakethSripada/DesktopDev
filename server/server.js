const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const gitRoutes = require('./routes/gitRoutes');
const requestRoutes = require('./routes/requestRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', aiRoutes);
app.use('/', gitRoutes);
app.use('/', requestRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
