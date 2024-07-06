import axios from 'axios';

export const handleCloneRepo = async (repoTabs, currentTab, showAlert) => {
  try {
    const { repoUrl, localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/connect-repo', { repoUrl, localPath });
    showAlert(response.data.message, 'success');
  } catch (error) {
    console.error('Error connecting to repository:', error);
    if (error.response && error.response.data) {
      showAlert(`Error: ${error.response.data.error}`, 'error');
    } else {
      showAlert('An unknown error occurred.', 'error');
    }
  }
};

export const handleRunCommit = async (commitHash, repoTabs, currentTab, showAlert) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/run-commit', { commitHash, localPath });
    showAlert(response.data.message, 'success');
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const fetchChangedFiles = async (repoTabs, currentTab, setFiles, showAlert) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/get-status', { localPath });
    setFiles(response.data.changedFiles);
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const handleCommit = async (repoTabs, currentTab, selectedFiles, commitMessage, autoStage, selectedCommitBranch, currentBranch, showAlert, handleModalClose, setStageFilesError, setUnstagedFiles) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const filesToCommit = selectedFiles.join(',');
    const branchToCommit = selectedCommitBranch || currentBranch;
    await axios.post('http://localhost:5000/checkout', { branchName: branchToCommit, localPath });
    const response = await axios.post('http://localhost:5000/commit', { commitMessage, filesToCommit, localPath, autoStage });
    showAlert(response.data.message, 'success');
    handleModalClose();
  } catch (error) {
    if (error.response.data.error === 'One or more files are not staged.') {
      setStageFilesError(true);
      setUnstagedFiles(error.response.data.unstagedFiles);
    } else {
      showAlert(`Error: ${error.response.data.error}`, 'error');
    }
  }
};

export const handleStageFiles = async (repoTabs, currentTab, selectedFiles, showAlert, setStageFilesError, setUnstagedFiles) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/stage-files', { filesToCommit: selectedFiles.join(','), localPath });
    showAlert(response.data.message, 'success');
    setStageFilesError(false);
    setUnstagedFiles([]);
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const handlePush = async (repoTabs, currentTab, showAlert, handleModalClose) => {
  try {
    const { branchName, localPath, repoUrl, githubUsername, githubToken } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/push', { branchName, localPath, remoteUrl: repoUrl, githubUsername, githubToken });
    showAlert(response.data.message, 'success');
    handleModalClose();
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const handlePull = async (repoTabs, currentTab, showAlert, handleModalClose) => {
  try {
    const { branchName, localPath, repoUrl, githubUsername, githubToken } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/pull', { branchName, localPath, remoteUrl: repoUrl, githubUsername, githubToken });
    showAlert(response.data.message, 'success');
    handleModalClose();
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const handleStash = async (repoTabs, currentTab, stashMessage, showAlert, handleModalClose) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/stash', { stashMessage, localPath });
    showAlert(response.data.message, 'success');
    handleModalClose();
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const handleCheckoutBranch = async (repoTabs, currentTab, checkoutBranch, showAlert, handleModalClose, setBranches, setCurrentBranch) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/checkout', { branchName: checkoutBranch, localPath });
    showAlert(response.data.message, 'success');
    handleModalClose();
    fetchBranches(repoTabs, currentTab, setBranches, setCurrentBranch, showAlert); 
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};

export const fetchBranches = async (repoTabs, currentTab, setBranches, setCurrentBranch, showAlert) => {
  try {
    const { localPath } = repoTabs[currentTab];
    const response = await axios.post('http://localhost:5000/list-branches', { localPath });
    setBranches(response.data.branches);
    setCurrentBranch(response.data.currentBranch);
  } catch (error) {
    showAlert(`Error: ${error.response.data.error}`, 'error');
  }
};
