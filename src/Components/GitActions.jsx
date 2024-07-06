import React from 'react';
import { Grid, Button } from '@mui/material';

function GitActions({ handleModalOpen }) {
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} sm={4} md={3}>
        <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('push')}>Push</Button>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('pull')}>Pull</Button>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('commit')}>Commit</Button>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('stash')}>Stash</Button>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Button variant="contained" color="primary" fullWidth onClick={() => handleModalOpen('checkout')}>Checkout</Button>
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
  );
}

export default GitActions;
