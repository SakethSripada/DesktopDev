import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';

function CheckoutDialog({ open, onClose, branches, checkoutBranch, setCheckoutBranch, handleCheckoutBranch }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ color: 'white', backgroundColor: '#333' }}>Checkout Branch</DialogTitle>
      <DialogContent style={{ backgroundColor: '#333' }}>
        <TextField
          select
          label="Branch"
          variant="outlined"
          fullWidth
          margin="normal"
          value={checkoutBranch}
          onChange={(e) => setCheckoutBranch(e.target.value)}
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        >
          {branches.map((branch, index) => (
            <MenuItem key={index} value={branch}>
              {branch}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions style={{ backgroundColor: '#333' }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleCheckoutBranch} color="primary">Checkout</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CheckoutDialog;
