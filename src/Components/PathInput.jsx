import React from 'react';
import { Box, Button, InputBase, Paper, Typography } from '@mui/material';
import { FaCheckCircle } from 'react-icons/fa';

const PathInput = ({
  path,
  handlePathChange,
  handlePathSubmit,
  handleDisconnect,
  isConnected,
}) => (
  <Box sx={{ mt: 2, mb: 2 }}>
    <Paper sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 2 }}>
      <InputBase
        value={path}
        onChange={handlePathChange}
        placeholder="Enter directory path"
        sx={{ ml: 1, flex: 1, color: 'white' }}
      />
      {!isConnected ? (
        <Button type="submit" variant="contained" color="primary" onClick={handlePathSubmit}>
          Connect
        </Button>
      ) : (
        <Button type="button" variant="contained" color="secondary" onClick={handleDisconnect}>
          Disconnect
        </Button>
      )}
      {isConnected && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'green', ml: 2 }}>
          <FaCheckCircle style={{ marginRight: '8px' }} />
          <Typography sx={{ mr: 2 }}>Connected</Typography>
        </Box>
      )}
    </Paper>
  </Box>
);

export default PathInput;
