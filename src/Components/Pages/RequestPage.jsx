import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  IconButton,
  Autocomplete,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const requestMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

const methodColors = {
  GET: '#4CAF50',
  POST: '#2196F3',
  PUT: '#FFC107',
  PATCH: '#9C27B0',
  DELETE: '#F44336',
  OPTIONS: '#FF5722',
  HEAD: '#00BCD4',
};

const commonHeaders = [
  'Content-Type',
  'Authorization',
  'Accept',
  'User-Agent',
  'Cache-Control',
  'Referer',
  'Accept-Encoding',
];

const RequestPage = ({ onBackToMenu }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);

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

  const handleSubmit = async () => {
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `http://${formattedUrl}`;
    }

    const validHeaders = headers.filter(header => header.key.trim() !== '' && header.value.trim() !== '');

    try {
      const res = await axios.post('http://localhost:5000/request', {
        method,
        url: formattedUrl,
        headers: validHeaders,
        body: (method === 'POST' || method === 'PUT' || method === 'PATCH') ? body : undefined,
      });

      setResponse(res.data);
    } catch (error) {
      setResponse({ error: error.response ? error.response.data : error.message });
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      <Button variant="contained" color="secondary" onClick={onBackToMenu} sx={{ mb: 3 }}>
        Menu
      </Button>
      <Typography variant="h4" component="h1" sx={{ mb: 3, color: '#ffffff', textAlign: 'center' }}>
        HTTP Request
      </Typography>
      <Card sx={{ backgroundColor: '#2e2e2e', borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel style={{ color: methodColors[method] }}>Method</InputLabel>
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'white' }}>
              Headers
            </Typography>
            {headers.map((header, index) => (
              <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    freeSolo
                    options={commonHeaders}
                    inputValue={header.key}
                    onInputChange={(event, newInputValue) => handleHeaderChange(index, 'key', newInputValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Header Key"
                        variant="outlined"
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ ...params.InputProps, style: { color: 'white', backgroundColor: '#333' } }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={5.5}>
                  <TextField
                    label="Header Value"
                    variant="outlined"
                    fullWidth
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{ style: { color: 'white' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={1.5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleRemoveHeader(index)} color="secondary">
                    <FaMinusCircle />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddHeader}
              startIcon={<FaPlusCircle />}
              sx={{ mt: 2 }}
            >
              Add Header
            </Button>
          </Box>
          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'white' }}>
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
        </CardContent>
        <CardActions sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, width: '50%' }}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </CardActions>
      </Card>
      {response && (
        <Card sx={{ mt: 3, backgroundColor: '#2e2e2e', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'white' }}>
              Response
            </Typography>
            <SyntaxHighlighter language="json" style={oneDark}>
              {JSON.stringify(response, null, 2)}
            </SyntaxHighlighter>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RequestPage;
