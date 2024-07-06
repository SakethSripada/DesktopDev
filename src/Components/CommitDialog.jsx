import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Checkbox, FormControlLabel, FormGroup, MenuItem } from '@mui/material';

function CommitDialog({ open, onClose, onCommit, files, branches, currentBranch, selectedFiles, handleFileSelection, autoStage, setAutoStage, handleSelectAllFiles, handleStageFiles, stageFilesError, unstagedFiles, searchTerm, setSearchTerm, commitMessage, setCommitMessage, selectedCommitBranch, setSelectedCommitBranch, paginate, totalPages, currentFiles }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ color: 'white', backgroundColor: '#333' }}>Commit Changes</DialogTitle>
      <DialogContent style={{ backgroundColor: '#333' }}>
        <Typography variant="body1" style={{ color: 'white', marginBottom: '10px' }}>
          Committing to branch: {selectedCommitBranch || currentBranch}
        </Typography>
        <TextField
          select
          label="Branch"
          variant="outlined"
          fullWidth
          margin="normal"
          value={selectedCommitBranch || currentBranch}
          onChange={(e) => setSelectedCommitBranch(e.target.value)}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        >
          {branches.map((branch, index) => (
            <MenuItem key={index} value={branch}>
              {branch}
            </MenuItem>
          ))}
        </TextField>
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
                style={{ color: 'white' }}
              />
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
      </DialogContent>
      <DialogActions style={{ backgroundColor: '#333' }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        {!stageFilesError && <Button onClick={onCommit} color="primary">Commit</Button>}
      </DialogActions>
    </Dialog>
  );
}

export default CommitDialog;
