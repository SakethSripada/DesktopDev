import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import '../styles/MainMenu.css';

function MainMenu({ onSelectTool }) {
  return (
    <Box className="main-menu-container">
      <Typography variant="h4" component="h1" gutterBottom>
        DevTools Companion
      </Typography>
      <Button variant="contained" color="primary" onClick={() => onSelectTool('chat')}>
        AI Chat
      </Button>
      <Button variant="contained" color="primary" onClick={() => onSelectTool('git')}>
        Git Tools
      </Button>
      <Button variant="contained" color="primary" onClick={() => onSelectTool('scaffolding')}>
        Project Scaffolding
      </Button>
      <Button variant="contained" color="primary" onClick={() => onSelectTool('request')}>
        Requests
      </Button>
      <Button variant="contained" color="primary" onClick={() => onSelectTool('browser')}>
        Browser
      </Button>
    </Box>
  );
}

export default MainMenu;
