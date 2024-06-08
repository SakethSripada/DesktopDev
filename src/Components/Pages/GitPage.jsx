import React from 'react';
import { Box, Button, TextField, Typography, Grid } from '@mui/material';
import '../styles/GitPage.css';

function GitPage({ onBackToMenu }) {
  return (
    <Box className="git-page-container">
      <Button variant="contained" color="secondary" onClick={onBackToMenu} className="menu-button">
        Menu
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Git Operations
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Push</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Pull</Button>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Button variant="contained" color="primary" fullWidth>Commit</Button>
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

      <Box mt={6} className="run-commit-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Run Commit by Hash
        </Typography>
        <TextField 
          label="Commit Hash" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          className="outlined-textfield"
        />
        <Button variant="contained" color="primary" className="run-commit-button" style={{ marginTop: '20px' }}>
          Run Commit
        </Button>
      </Box>
    </Box>
  );
}

export default GitPage;
