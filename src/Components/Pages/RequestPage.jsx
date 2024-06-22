import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Select, MenuItem, FormControl, IconButton, InputLabel, OutlinedInput } from '@mui/material';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import '../styles/RequestPage.css';

const requestMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

const methodColors = {
  GET: '#4CAF50',
  POST: '#2196F3',
  PUT: '#FFC107',
  PATCH: '#9C27B0',
  DELETE: '#F44336',
  OPTIONS: '#FF5722',
  HEAD: '#00BCD4'
};

const RequestPage = ({ onBackToMenu }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = headers.slice();
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  return (
    <Box className="request-container">
      <Button variant="contained" color="secondary" onClick={onBackToMenu} className="menu-button">
        Menu
      </Button>
      <Typography variant="h4" component="h1" className="title">
        HTTP Request
      </Typography>
      <Box className="request-form" style={{ marginTop: '30px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Method</InputLabel>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                input={<OutlinedInput label="Method" />}
                style={{ color: methodColors[method], backgroundColor: '#333', borderRadius: 4 }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      backgroundColor: '#333',
                      color: 'white',
                    },
                  },
                }}
              >
                {requestMethods.map((method) => (
                  <MenuItem key={method} value={method} style={{ color: methodColors[method] }}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              label="URL"
              variant="outlined"
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              InputLabelProps={{ style: { color: 'white' } }}
              InputProps={{ style: { color: 'white' } }}
            />
          </Grid>
        </Grid>
        <Box className="headers-section">
          <Typography variant="h6" component="h2" gutterBottom>
            Headers
          </Typography>
          <Grid container spacing={2} alignItems="center" style={{ marginTop: '10px' }}>
            {headers.map((header, index) => (
              <Grid container spacing={2} alignItems="center" key={index} className="header-row">
                <Grid item xs={5}>
                  <TextField
                    label="Key"
                    variant="outlined"
                    fullWidth
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{ style: { color: 'white' } }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Value"
                    variant="outlined"
                    fullWidth
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{ style: { color: 'white' } }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => handleRemoveHeader(index)} color="secondary">
                    <FaMinusCircle />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddHeader}
            startIcon={<FaPlusCircle />}
            style={{ marginTop: '10px' }}
          >
            Add Header
          </Button>
        </Box>
        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <Box className="body-section">
            <Typography variant="h6" component="h2" gutterBottom>
              Body
            </Typography>
            <TextField
              label="Request Body"
              variant="outlined"
              fullWidth
              multiline
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              InputLabelProps={{ style: { color: 'white' } }}
              InputProps={{ style: { color: 'white' } }}
            />
          </Box>
        )}
        <Button variant="contained" color="primary" className="send-button" style={{ marginTop: '30px' }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default RequestPage;
