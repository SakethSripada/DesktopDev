import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

function StashDialog({ open, onClose, stashMessage, setStashMessage, handleStash }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ color: 'white', backgroundColor: '#333' }}>Stash Changes</DialogTitle>
      <DialogContent style={{ backgroundColor: '#333' }}>
        <TextField
          label="Stash Message"
          variant="outlined"
          fullWidth
          margin="normal"
          value={stashMessage}
          onChange={(e) => setStashMessage(e.target.value)}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />
      </DialogContent>
      <DialogActions style={{ backgroundColor: '#333' }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleStash} color="primary">Stash</Button>
      </DialogActions>
    </Dialog>
  );
}

export default StashDialog;
