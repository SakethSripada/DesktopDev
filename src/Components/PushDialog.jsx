import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

function PushDialog({ open, onClose, repoTabs, currentTab, handleRepoInputChange, handlePush }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ color: 'white', backgroundColor: '#333' }}>Push Changes - {repoTabs[currentTab].name}</DialogTitle>
      <DialogContent style={{ backgroundColor: '#333' }}>
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
      </DialogContent>
      <DialogActions style={{ backgroundColor: '#333' }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handlePush} color="primary">Push</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PushDialog;
