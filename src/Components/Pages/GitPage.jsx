import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormGroup } from '@mui/material';
import axios from 'axios';
import '../styles/GitPage.css';

function GitPage({ onBackToMenu }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [connectionType, setConnectionType] = useState('clone');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [filesToCommit, setFilesToCommit] = useState('');
  const [branchName, setBranchName] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [autoStage, setAutoStage] = useState(false);
  const [stageFilesError, setStageFilesError] = useState(false);
  const [unstagedFiles, setUnstagedFiles] = useState([]);

  const handleConnectRepo = async () => {
    try {
      let response;
      if (connectionType === 'clone') {
        response = await axios.post('http://localhost:5000/connect-repo', { repoUrl, localPath });
      } else if (connectionType === 'existing') {
        response = await axios.post('http://localhost:5000/connect-existing-repo', { localPath });
      }
      alert(response.data.message);
    } catch (error) {
      console.error('Error connecting to repository:', error);
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('An unknown error occurred.');
      }
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

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setStageFilesError(false);
    setUnstagedFiles([]);
  };

  const handleCommit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/commit', { commitMessage, filesToCommit, localPath, autoStage });
      alert(response.data.message);
      handleModalClose();
    } catch (error) {
      if (error.response.data.error === 'One or more files are not staged.') {
        setStageFilesError(true);
        setUnstagedFiles(error.response.data.unstagedFiles);
      } else {
        alert(`Error: ${error.response.data.error}`);
      }
    }
  };

  const handleStageFiles = async () => {
    try {
      const response = await axios.post('http://localhost:5000/stage-files', { filesToCommit, localPath });
      alert(response.data.message);
      setStageFilesError(false);
      setUnstagedFiles([]);
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const handlePush = async () => {
    try {
      const response = await axios.post('http://localhost:5000/push', { branchName, localPath, remoteUrl: repoUrl, githubUsername, githubToken });
      alert(response.data.message);
      handleModalClose();
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const handlePull = async () => {
    try {
      const response = await axios.post('http://localhost:5000/pull', { branchName, localPath, remoteUrl: repoUrl, githubUsername, githubToken });
      alert(response.data.message);
      handleModalClose();
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
          <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('push')}>Push</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('pull')}>Pull</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('commit')}>Commit</Button>
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
              InputLabelProps={{ style: { color: 'white' } }}
              InputProps={{ style: { color: 'white' } }}
            />
          )}
          <TextField 
            label="Local Path" 
            variant="outlined" 
            fullWidth 
            margin="normal"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white' } }}
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
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
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

      <Dialog open={modalOpen} onClose={handleModalClose}>
        <DialogTitle style={{ color: 'white', backgroundColor: '#333' }}>
          {modalType === 'commit' && 'Commit Changes'}
          {modalType === 'push' && 'Push Changes'}
          {modalType === 'pull' && 'Pull Changes'}
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#333' }}>
          {modalType === 'commit' && (
            <>
              <TextField
                label="Commit Message"
                variant="outlined"
                fullWidth
                margin="normal"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Files to Commit (comma-separated)"
                variant="outlined"
                fullWidth
                margin="normal"
                value={filesToCommit}
                onChange={(e) => setFilesToCommit(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Local Path"
                variant="outlined"
                fullWidth
                margin="normal"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoStage}
                      onChange={(e) => setAutoStage(e.target.checked)}
                      name="autoStage"
                      color="primary"
                    />
                  }
                  label="Auto Stage Files"
                />
              </FormGroup>
              {stageFilesError && (
                <>
                  <Typography variant="body1" color="error" gutterBottom>
                    One or more files are not staged. Would you like to stage the files?
                  </Typography>
                  <ul>
                    {unstagedFiles.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStageFiles}
                    style={{ marginTop: '10px' }}
                  >
                    Stage Files
                  </Button>
                </>
              )}
            </>
          )}
          {modalType === 'push' && (
            <>
              <TextField
                label="GitHub Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="GitHub Token"
                variant="outlined"
                fullWidth
                margin="normal"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Branch Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Local Path"
                variant="outlined"
                fullWidth
                margin="normal"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Repository URL"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
            </>
          )}
          {modalType === 'pull' && (
            <>
              <TextField
                label="GitHub Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="GitHub Token"
                variant="outlined"
                fullWidth
                margin="normal"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Branch Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Local Path"
                variant="outlined"
                fullWidth
                margin="normal"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Repository URL"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#333' }}>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          {modalType === 'commit' && !stageFilesError && (
            <Button onClick={handleCommit} color="primary">
              Commit
            </Button>
          )}
          {modalType === 'push' && (
            <Button onClick={handlePush} color="primary">
              Push
            </Button>
          )}
          {modalType === 'pull' && (
            <Button onClick={handlePull} color="primary">
              Pull
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GitPage;
