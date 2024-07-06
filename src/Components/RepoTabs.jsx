import React from 'react';
import { AppBar, Tabs, Tab, Button } from '@mui/material';

function RepoTabs({ repoTabs, currentTab, handleTabChange, handleRightClick, handleAddRepoTab }) {
  return (
    <AppBar position="static" style={{ backgroundColor: '#333' }}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label="repo tabs">
        {repoTabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.name}
            onContextMenu={(event) => handleRightClick(event, index)}
          />
        ))}
        <Button onClick={handleAddRepoTab} style={{ color: 'white' }}>+</Button>
      </Tabs>
    </AppBar>
  );
}

export default RepoTabs;
