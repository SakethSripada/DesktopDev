import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Tabs, Tab, AppBar, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import axios from 'axios';
import '../styles/GitPage.css';

function GitPage({ onBackToMenu }) {
  const [repoTabs, setRepoTabs] = useState([{ repoUrl: '', localPath: '', githubUsername: '', githubToken: '', branchName: '' }]);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentConfig, setCurrentConfig] = useState('remote');
  const [commitHash, setCommitHash] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [autoStage, setAutoStage] = useState(false);
  const [stageFilesError, setStageFilesError] = useState(false);
  const [unstagedFiles, setUnstagedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 10;

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setCurrentConfig('remote');
  };

  const handleConfigChange = (configType) => {
    setCurrentConfig(configType);
  };

  const handleRepoInputChange = (index, field, value) => {
    const newRepoTabs = [...repoTabs];
    newRepoTabs[index][field] = value;
    setRepoTabs(newRepoTabs);
  };

  const handleAddRepoTab = () => {
    setRepoTabs([...repoTabs, { repoUrl: '', localPath: '', githubUsername: '', githubToken: '', branchName: '' }]);
  };

  const handleCloneRepo = async () => {
    try {
      const { repoUrl, localPath } = repoTabs[currentTab];
      const response = await axios.post('http://localhost:5000/connect-repo', { repoUrl, localPath });
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
      const { localPath } = repoTabs[currentTab];
      const response = await axios.post('http://localhost:5000/run-commit', { commitHash, localPath });
      alert(response.data.message);
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const fetchChangedFiles = async () => {
    try {
      const { localPath } = repoTabs[currentTab];
      const response = await axios.post('http://localhost:5000/get-status', { localPath });
      setFiles(response.data.changedFiles);
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
    if (type === 'commit') {
      fetchChangedFiles();
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setStageFilesError(false);
    setUnstagedFiles([]);
  };

  const handleFileSelection = (file) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.includes(file)
        ? prevSelectedFiles.filter((f) => f !== file)
        : [...prevSelectedFiles, file]
    );
  };

  const handleSelectAllFiles = (event) => {
    if (event.target.checked) {
      const allFiles = files.map(file => file.path);
      setSelectedFiles(allFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleCommit = async () => {
    try {
      const { localPath } = repoTabs[currentTab];
      const filesToCommit = selectedFiles.join(',');
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
      const { localPath } = repoTabs[currentTab];
      const response = await axios.post('http://localhost:5000/stage-files', { filesToCommit: selectedFiles.join(','), localPath });
      alert(response.data.message);
      setStageFilesError(false);
      setUnstagedFiles([]);
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const handlePush = async () => {
    try {
      const { branchName, localPath, repoUrl, githubUsername, githubToken } = repoTabs[currentTab];
      const response = await axios.post('http://localhost:5000/push', { branchName, localPath, remoteUrl: repoUrl, githubUsername, githubToken });
      alert(response.data.message);
      handleModalClose();
    } catch (error) {
      alert(`Error: ${error.response.data.error}`);
    }
  };

  const handlePull = async () => {
    try {
      const { branchName, localPath, repoUrl, githubUsername, githubToken } = repoTabs[currentTab];
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

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;

  const filteredFiles = files.filter(file => 
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  return (
    <Box className="git-page-container" sx={{ color: 'white' }}>
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
          Manage Git Repositories
        </Typography>
        <AppBar position="static" style={{ backgroundColor: '#333' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="repo tabs">
            {repoTabs.map((tab, index) => (
              <Tab key={index} label={`Repo ${index + 1}`} />
            ))}
            <Button onClick={handleAddRepoTab} style={{ color: 'white' }}>+</Button>
          </Tabs>
        </AppBar>
        <Box className="config-section">
          <Box className="connection-type-section">
            <Button
              onClick={() => handleConfigChange('remote')}
              className={`config-button ${currentConfig === 'remote' ? 'active' : ''}`}
            >
              Remote Config
            </Button>
            <Button
              onClick={() => handleConfigChange('local')}
              className={`config-button ${currentConfig === 'local' ? 'active' : ''}`}
            >
              Local Config
            </Button>
          </Box>
          <Box className="input-fields-container">
            {repoTabs.map((tab, index) => (
              <Box hidden={currentTab !== index} key={index} sx={{ width: '100%' }}>
                {currentConfig === 'remote' ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Repository URL" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        value={tab.repoUrl}
                        onChange={(e) => handleRepoInputChange(index, 'repoUrl', e.target.value)}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="GitHub Username" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        value={tab.githubUsername}
                        onChange={(e) => handleRepoInputChange(index, 'githubUsername', e.target.value)}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="GitHub Token" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        value={tab.githubToken}
                        onChange={(e) => handleRepoInputChange(index, 'githubToken', e.target.value)}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        label="Branch Name" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        value={tab.branchName}
                        onChange={(e) => handleRepoInputChange(index, 'branchName', e.target.value)}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleCloneRepo}
                        style={{ marginTop: '20px' }}
                      >
                        Clone Repository
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField 
                        label="Local Path" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal"
                        value={tab.localPath}
                        onChange={(e) => handleRepoInputChange(index, 'localPath', e.target.value)}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            ))}
          </Box>
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

      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
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
                label="Search Files"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFiles.length === files.length}
                    onChange={handleSelectAllFiles}
                    name="selectAllFiles"
                    style={{ color: 'white' }}
                  />
                }
                label="Select All Changes"
                style={{ color: 'white' }}
              />
              <Typography variant="h6" component="h3" gutterBottom style={{ color: 'white' }}>
                Select Files to Commit
              </Typography>
              {files.length === 0 ? (
                <Typography variant="body1" style={{ color: 'white' }}>
                  No changes to commit.
                </Typography>
              ) : (
                <FormGroup>
                  {currentFiles.map((file, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={selectedFiles.includes(file.path)}
                          onChange={() => handleFileSelection(file.path)}
                          name={file.path}
                          style={{ color: 'white' }}
                        />
                      }
                      label={file.path}
                      style={{ color: 'white' }}/>
                  ))}
                </FormGroup>
              )}
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Button key={index + 1} onClick={() => paginate(index + 1)} style={{ color: 'white' }}>
                      {index + 1}
                    </Button>
                  ))}
                </div>
              )}
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoStage}
                      onChange={(e) => setAutoStage(e.target.checked)}
                      name="autoStage"
                      style={{ color: 'white' }}
                    />
                  }
                  label="Auto Stage Files"
                  style={{ color: 'white' }}
                />
              </FormGroup>
              {stageFilesError && (
                <>
                  <Typography variant="body1" color="error" gutterBottom>
                    One or more files are not staged. Would you like to stage the files?
                  </Typography>
                  <ul>
                    {unstagedFiles.map((file, index) => (
                      <li key={index} style={{ color: 'white' }}>{file}</li>
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
                value={repoTabs[currentTab].githubUsername}
                onChange={(e) => handleRepoInputChange(currentTab, 'githubUsername', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="GitHub Token"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].githubToken}
                onChange={(e) => handleRepoInputChange(currentTab, 'githubToken', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Branch Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].branchName}
                onChange={(e) => handleRepoInputChange(currentTab, 'branchName', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Local Path"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].localPath}
                onChange={(e) => handleRepoInputChange(currentTab, 'localPath', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Repository URL"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].repoUrl}
                onChange={(e) => handleRepoInputChange(currentTab, 'repoUrl', e.target.value)}
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
                value={repoTabs[currentTab].githubUsername}
                onChange={(e) => handleRepoInputChange(currentTab, 'githubUsername', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="GitHub Token"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].githubToken}
                onChange={(e) => handleRepoInputChange(currentTab, 'githubToken', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Branch Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].branchName}
                onChange={(e) => handleRepoInputChange(currentTab, 'branchName', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Local Path"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].localPath}
                onChange={(e) => handleRepoInputChange(currentTab, 'localPath', e.target.value)}
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
              />
              <TextField
                label="Repository URL"
                variant="outlined"
                fullWidth
                margin="normal"
                value={repoTabs[currentTab].repoUrl}
                onChange={(e) => handleRepoInputChange(currentTab, 'repoUrl', e.target.value)}
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
