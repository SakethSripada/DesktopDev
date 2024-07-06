import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

function RenameDialog({ open, onClose, renameValue, setRenameValue, onRename }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rename Repository</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="New Name"
          type="text"
          fullWidth
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onRename();
              onClose();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onRename} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RenameDialog;
