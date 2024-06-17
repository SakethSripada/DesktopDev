const express = require('express');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.post('/connect-repo', async (req, res) => {
  const { repoUrl, localPath } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit();

  console.log(`Attempting to clone repository: ${repoUrl}`);
  console.log(`Cloning into local path: ${normalizedPath}`);

  if (fs.existsSync(normalizedPath)) {
    const files = fs.readdirSync(normalizedPath);
    if (files.length > 0) {
      console.error(`Directory is not empty: ${normalizedPath}`);
      return res.status(400).send({ error: 'Destination path is not empty.' });
    }
  } else {
    try {
      fs.mkdirSync(normalizedPath, { recursive: true });
      console.log(`Directory created at: ${normalizedPath}`);
    } catch (mkdirError) {
      console.error(`Failed to create directory at: ${normalizedPath}`, mkdirError);
      return res.status(500).send({ error: 'Failed to create directory.', details: mkdirError.message });
    }
  }

  try {
    await git.clone(repoUrl, normalizedPath);
    console.log('Repository cloned successfully.');
    res.status(200).send({ message: 'Repository cloned successfully.' });
  } catch (error) {
    console.error('Error cloning repository:', error.message);
    console.error(error.stack);
    res.status(500).send({ error: 'Failed to clone repository.', details: error.message });
  }
});

router.post('/connect-existing-repo', async (req, res) => {
  const { localPath } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Attempting to connect to existing repository at: ${normalizedPath}`);

  if (!fs.existsSync(normalizedPath)) {
    console.error(`Directory does not exist: ${normalizedPath}`);
    return res.status(400).send({ error: 'Directory does not exist.' });
  }

  try {
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      console.log('Connected to existing repository.');
      res.status(200).send({ message: 'Connected to existing repository.' });
    } else {
      console.error(`Directory is not a Git repository: ${normalizedPath}`);
      res.status(400).send({ error: 'Directory is not a Git repository.' });
    }
  } catch (error) {
    console.error('Error connecting to repository:', error.message);
    res.status(500).send({ error: 'Failed to connect to repository.', details: error.message });
  }
});

router.post('/commit', async (req, res) => {
  const { commitMessage, filesToCommit, localPath, autoStage } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Committing files: ${filesToCommit} with message: ${commitMessage} in ${normalizedPath}`);

  try {
    await git.cwd(normalizedPath);
    const statusBefore = await git.status();
    console.log('Status before adding files:', statusBefore);

    const filesArray = filesToCommit.split(',').map(filePath => filePath.trim());
    if (filesArray.length === 0) {
      return res.status(400).send({ error: 'No files specified to commit.' });
    }

    let needsStaging = false;
    for (const file of filesArray) {
      if (!statusBefore.staged.includes(file)) {
        needsStaging = true;
        break;
      }
    }

    if (needsStaging) {
      if (autoStage) {
        for (const file of filesArray) {
          const addResult = await git.add(file);
          console.log(`Adding file: ${file}`, addResult);
        }
        const statusAfterAdding = await git.status();
        console.log('Status after adding files:', statusAfterAdding);
      } else {
        return res.status(400).send({ error: 'One or more files are not staged.', unstagedFiles: filesArray });
      }
    } else {
      console.log('All specified files are already staged.');
    }

    const statusBeforeCommit = await git.status();
    if (statusBeforeCommit.staged.length === 0) {
      return res.status(400).send({ error: 'No files staged for commit.' });
    }

    const commitResult = await git.commit(commitMessage);

    console.log('Commit successful.', commitResult);
    const statusAfterCommit = await git.status();
    console.log('Status after commit:', statusAfterCommit);

    res.status(200).send({ message: 'Commit successful.', details: commitResult });
  } catch (error) {
    console.error('Error committing files:', error.message);
    res.status(500).send({ error: 'Failed to commit files.', details: error.message });
  }
});

router.post('/push', async (req, res) => {
  const { branchName, localPath, remoteUrl, githubUsername, githubToken } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Pushing to branch: ${branchName} from ${normalizedPath}`);

  try {
    await git.cwd(normalizedPath);
    await git.addRemote('origin', `https://${githubUsername}:${githubToken}@${remoteUrl}`);
    const pushResult = await git.push('origin', branchName);
    console.log('Push successful.', pushResult);
    res.status(200).send({ message: 'Push successful.', details: pushResult });
  } catch (error) {
    console.error('Error pushing to branch:', error.message);
    res.status(500).send({ error: 'Failed to push to branch.', details: error.message });
  }
});

router.post('/pull', async (req, res) => {
  const { branchName, localPath, remoteUrl, githubUsername, githubToken } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Pulling from branch: ${branchName} into ${normalizedPath}`);

  try {
    await git.cwd(normalizedPath);
    await git.addRemote('origin', `https://${githubUsername}:${githubToken}@${remoteUrl}`);
    const pullResult = await git.pull('origin', branchName);
    console.log('Pull successful.', pullResult);
    res.status(200).send({ message: 'Pull successful.', details: pullResult });
  } catch (error) {
    console.error('Error pulling from branch:', error.message);
    res.status(500).send({ error: 'Failed to pull from branch.', details: error.message });
  }
});

router.post('/stage-files', async (req, res) => {
  const { filesToCommit, localPath } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Staging files: ${filesToCommit} in ${normalizedPath}`);

  try {
    await git.cwd(normalizedPath);

    const filesArray = filesToCommit.split(',').map(filePath => filePath.trim());
    if (filesArray.length === 0) {
      return res.status(400).send({ error: 'No files specified to stage.' });
    }

    for (const file of filesArray) {
      const addResult = await git.add(file);
      console.log(`Adding file: ${file}`, addResult);
    }

    const statusAfterAdding = await git.status();
    console.log('Status after adding files:', statusAfterAdding);

    res.status(200).send({ message: 'Files staged successfully.', details: statusAfterAdding });
  } catch (error) {
    console.error('Error staging files:', error.message);
    res.status(500).send({ error: 'Failed to stage files.', details: error.message });
  }
});

router.post('/list-files', async (req, res) => {
  const { localPath } = req.body;
  const normalizedPath = path.normalize(localPath);

  console.log(`Listing files in: ${normalizedPath}`);

  try {
    const files = await fs.promises.readdir(normalizedPath);
    res.status(200).send({ files });
  } catch (error) {
    console.error('Error listing files:', error.message);
    res.status(500).send({ error: 'Failed to list files.', details: error.message });
  }
});

router.post('/get-status', async (req, res) => {
  const { localPath } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Getting status of repository: ${normalizedPath}`);

  try {
    await git.cwd(normalizedPath);
    const status = await git.status();
    const modifiedFiles = status.files.filter(file => file.index !== ' ' || file.working_dir !== ' ');
    res.status(200).send({ changedFiles: modifiedFiles });
  } catch (error) {
    console.error('Error getting repository status:', error.message);
    res.status(500).send({ error: 'Failed to get repository status.', details: error.message });
  }
});

router.post('/stash', async (req, res) => {
  const { localPath, stashMessage } = req.body;
  const normalizedPath = path.normalize(localPath);
  const git = simpleGit(normalizedPath);

  console.log(`Stashing changes in ${normalizedPath} with message: ${stashMessage}`);

  try {
    await git.cwd(normalizedPath);
    const stashResult = await git.stash(['push', '-m', stashMessage]);
    console.log('Stash successful.', stashResult);
    res.status(200).send({ message: 'Stash successful.', details: stashResult });
  } catch (error) {
    console.error('Error stashing changes:', error.message);
    res.status(500).send({ error: 'Failed to stash changes.', details: error.message });
  }
});



module.exports = router;
