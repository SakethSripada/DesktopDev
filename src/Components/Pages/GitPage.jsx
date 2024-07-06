import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Grid, Menu, MenuItem, TextField } from '@mui/material';
import axios from 'axios';
import Alert from '../Alert';
import RepoTabs from '../RepoTabs';
import GitActions from '../GitActions';
import CommitDialog from '../CommitDialog';
import PushDialog from '../PushDialog';
import PullDialog from '../PullDialog';
import StashDialog from '../StashDialog';
import CheckoutDialog from '../CheckoutDialog';
import RenameDialog from '../RenameDialog';
import { 
  handleCloneRepo, handleRunCommit, fetchChangedFiles, handleCommit, handleStageFiles, 
  handlePush, handlePull, handleStash, handleCheckoutBranch, fetchBranches 
} from '../../functions/gitFunctions';
import '../styles/GitPage.css';

function GitPage({ onBackToMenu }) {
  const [repoTabs, setRepoTabs] = useState([{ repoUrl: '', localPath: '', githubUsername: '', githubToken: '', branchName: '', name: 'Repo 1' }]);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [rightClickedTab, setRightClickedTab] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [stashMessage, setStashMessage] = useState('');
  const [checkoutBranch, setCheckoutBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('');
  const [selectedCommitBranch, setSelectedCommitBranch] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

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
    const newRepoTabs = [...repoTabs, { repoUrl: '', localPath: '', githubUsername: '', githubToken: '', branchName: '', name: `Repo ${repoTabs.length + 1}` }];
    setRepoTabs(newRepoTabs);
    setCurrentTab(newRepoTabs.length - 1);
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
    if (type === 'commit') {
      fetchChangedFiles(repoTabs, currentTab, setFiles, showAlert);
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

  const handleRightClick = (event, index) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setRightClickedTab(index);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setRightClickedTab(null);
  };

  const handleRenameTab = () => {
    const newRepoTabs = [...repoTabs];
    newRepoTabs[rightClickedTab].name = renameValue;
    setRepoTabs(newRepoTabs);
    setRenameValue('');
    handleCloseMenu();
  };

  const handleDeleteTab = () => {
    const newRepoTabs = repoTabs.filter((_, index) => index !== rightClickedTab);
    setRepoTabs(newRepoTabs);
    setCurrentTab(Math.max(0, currentTab - 1));
    handleCloseMenu();
  };

  const handleOpenRenameDialog = () => {
    setIsRenaming(true);
    setRenameValue(repoTabs[rightClickedTab].name);
  };

  const handleCloseRenameDialog = () => {
    setIsRenaming(false);
  };

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;

  const filteredFiles = files.filter(file =>
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  useEffect(() => {
    fetchBranches(repoTabs, currentTab, setBranches, setCurrentBranch, showAlert);
  }, [currentTab]);

  return (
    <Box className="git-page-container" sx={{ color: 'white' }}>
      <Button variant="contained" color="secondary" onClick={onBackToMenu} className="menu-button">
        Menu
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Git Operations
      </Typography>
      <GitActions handleModalOpen={handleModalOpen} />
      <Box mt={6} className="connect-repo-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Manage Git Repositories
        </Typography>
        <RepoTabs repoTabs={repoTabs} currentTab={currentTab} handleTabChange={handleTabChange} handleRightClick={handleRightClick} handleAddRepoTab={handleAddRepoTab} />
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
                        onClick={() => handleCloneRepo(repoTabs, currentTab, showAlert)}
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
          onClick={() => handleRunCommit(commitHash, repoTabs, currentTab, showAlert)}
          style={{ marginTop: '20px' }}
        >
          Run Commit
        </Button>
      </Box>

      <CommitDialog
        open={modalOpen && modalType === 'commit'}
        onClose={handleModalClose}
        onCommit={() => handleCommit(repoTabs, currentTab, selectedFiles, commitMessage, autoStage, selectedCommitBranch, currentBranch, showAlert, handleModalClose, setStageFilesError, setUnstagedFiles)}
        files={files}
        branches={branches}
        currentBranch={currentBranch}
        selectedFiles={selectedFiles}
        handleFileSelection={handleFileSelection}
        autoStage={autoStage}
        setAutoStage={setAutoStage}
        handleSelectAllFiles={handleSelectAllFiles}
        handleStageFiles={() => handleStageFiles(repoTabs, currentTab, selectedFiles, showAlert, setStageFilesError, setUnstagedFiles)}
        stageFilesError={stageFilesError}
        unstagedFiles={unstagedFiles}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        commitMessage={commitMessage}
        setCommitMessage={setCommitMessage}
        selectedCommitBranch={selectedCommitBranch}
        setSelectedCommitBranch={setSelectedCommitBranch}
        paginate={paginate}
        totalPages={totalPages}
        currentFiles={currentFiles}
      />

      <PushDialog
        open={modalOpen && modalType === 'push'}
        onClose={handleModalClose}
        repoTabs={repoTabs}
        currentTab={currentTab}
        handleRepoInputChange={handleRepoInputChange}
        handlePush={() => handlePush(repoTabs, currentTab, showAlert, handleModalClose)}
      />

      <PullDialog
        open={modalOpen && modalType === 'pull'}
        onClose={handleModalClose}
        repoTabs={repoTabs}
        currentTab={currentTab}
        handleRepoInputChange={handleRepoInputChange}
        handlePull={() => handlePull(repoTabs, currentTab, showAlert, handleModalClose)}
      />

      <StashDialog
        open={modalOpen && modalType === 'stash'}
        onClose={handleModalClose}
        stashMessage={stashMessage}
        setStashMessage={setStashMessage}
        handleStash={() => handleStash(repoTabs, currentTab, stashMessage, showAlert, handleModalClose)}
      />

      <CheckoutDialog
        open={modalOpen && modalType === 'checkout'}
        onClose={handleModalClose}
        branches={branches}
        checkoutBranch={checkoutBranch}
        setCheckoutBranch={setCheckoutBranch}
        handleCheckoutBranch={() => handleCheckoutBranch(repoTabs, currentTab, checkoutBranch, showAlert, handleModalClose, () => fetchBranches(repoTabs, currentTab, setBranches, setCurrentBranch, showAlert))}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenRenameDialog}>Rename</MenuItem>
        <MenuItem onClick={handleDeleteTab}>Delete</MenuItem>
      </Menu>

      <RenameDialog
        open={isRenaming}
        onClose={handleCloseRenameDialog}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        onRename={handleRenameTab}
      />

      <Alert
        open={alertOpen}
        onClose={handleAlertClose}
        severity={alertSeverity}
        message={alertMessage}
      />
    </Box>
  );
}

export default GitPage;
