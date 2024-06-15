import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import axios from 'axios';
import '../styles/GitPage.css';

function GitPage({ onBackToMenu }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [connectionType, setConnectionType] = useState('clone');

  const handleConnectRepo = async () => {
    try {
      if (connectionType === 'clone') {
        const response = await axios.post('http://localhost:5000/connect-repo', { repoUrl, localPath });
        alert(response.data.message);
      } else if (connectionType === 'existing') {
        const response = await axios.post('http://localhost:5000/connect-existing-repo', { localPath });
        alert(response.data.message);
      }
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const handleRunCommit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/run-commit', { commitHash });
      alert(response.data.message);
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const textFieldStyles = {
    input: { color: 'white' },
    label: { color: 'white' },
  };

  return (
    <Box className="git-page-container">
      <Button variant="contained" color="secondary" onClick={onBackToMenu} className="menu-button">
        Menu
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Git Operations
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Push</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Pull</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Commit</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Stash</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Checkout</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Delete Previous Commit</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Edit Previous Commit</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Merge</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Rebase</Button>
        </Grid>
      </Grid>

      <Box mt={6} className="connect-repo-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Connect to Git Repository
        </Typography>
        <FormControl component="fieldset" className="connection-type-section">
          <FormLabel component="legend" style={{ color: 'white' }}>Connection Type</FormLabel>
          <RadioGroup
            row
            aria-label="connectionType"
            name="connectionType"
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
          >
            <FormControlLabel value="clone" control={<Radio />} label="Clone New Repository" />
            <FormControlLabel value="existing" control={<Radio />} label="Connect to Existing Repository" />
          </RadioGroup>
        </FormControl>
        <Box className="input-fields-container">
          {connectionType === 'clone' && (
            <TextField 
              label="Repository URL" 
              variant="outlined" 
              fullWidth 
              margin="normal"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              sx={textFieldStyles}
            />
          )}
          <TextField 
            label="Local Path" 
            variant="outlined" 
            fullWidth 
            margin="normal"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            sx={textFieldStyles}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleConnectRepo}
            style={{ marginTop: '20px' }}
          >
            {connectionType === 'clone' ? 'Clone Repository' : 'Connect to Repository'}
          </Button>
        </Box>
      </Box>

      <Box mt={6} className="run-commit-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Run Commit by Hash
        </Typography>
        <TextField 
          label="Commit Hash" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          value={commitHash}
          onChange={(e) => setCommitHash(e.target.value)}
          sx={textFieldStyles}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRunCommit}
          style={{ marginTop: '20px' }}
        >
          Run Commit
        </Button>
      </Box>
    </Box>
  );
}

export default GitPage;
