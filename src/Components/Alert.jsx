import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

const Alert = ({ open, onClose, severity, message }) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <MuiAlert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
