import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  IconButton,
  InputBase,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { FaArrowLeft, FaArrowRight, FaRedo, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';

const Browser = ({ onBackToMenu }) => {
  const [tabs, setTabs] = useState([{ id: 1, url: 'https://www.google.com' }]);
  const [currentTab, setCurrentTab] = useState(1);
  const webviewRefs = useRef({});

  const handleInputChange = (e, tabId) => {
    const updatedTabs = tabs.map(tab => tab.id === tabId ? { ...tab, url: e.target.value } : tab);
    setTabs(updatedTabs);
  };

  const handleLoadUrl = (tabId) => {
    const tab = tabs.find(tab => tab.id === tabId);
    const formattedUrl = tab.url.includes('http://') || tab.url.includes('https://') ? tab.url : `https://${tab.url}`;
    const updatedTabs = tabs.map(tab => tab.id === tabId ? { ...tab, url: formattedUrl } : tab);
    setTabs(updatedTabs);
  };

  const handleGoBack = (tabId) => {
    if (webviewRefs.current[tabId]) {
      webviewRefs.current[tabId].goBack();
    }
  };

  const handleGoForward = (tabId) => {
    if (webviewRefs.current[tabId]) {
      webviewRefs.current[tabId].goForward();
    }
  };

  const handleReload = (tabId) => {
    if (webviewRefs.current[tabId]) {
      webviewRefs.current[tabId].reload();
    }
  };

  const handleAddTab = () => {
    const newTab = { id: Date.now(), url: 'https://www.google.com' };
    setTabs([...tabs, newTab]);
    setCurrentTab(newTab.id);
  };

  const handleCloseTab = (tabId) => {
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    if (currentTab === tabId && updatedTabs.length > 0) {
      setCurrentTab(updatedTabs[0].id);
    }
  };

  useEffect(() => {
    const webview = webviewRefs.current[currentTab];
    if (webview) {
      const handleDidNavigate = (event) => {
        const updatedTabs = tabs.map(tab => tab.id === currentTab ? { ...tab, url: event.url } : tab);
        setTabs(updatedTabs);
      };
      webview.addEventListener('did-navigate', handleDidNavigate);
      return () => {
        webview.removeEventListener('did-navigate', handleDidNavigate);
      };
    }
  }, [currentTab, tabs]);

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Button variant="contained" color="secondary" onClick={onBackToMenu} sx={{ mb: 1, height: '32px', fontSize: '0.75rem' }}>
        Menu
      </Button>
      <Paper sx={{ display: 'flex', flexDirection: 'column', p: 0.5, mb: 1 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flexGrow: 1, minHeight: '24px', mb: 0 }}
          TabIndicatorProps={{ style: { height: '2px' } }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" noWrap>{tab.url}</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                    sx={{ p: 0, ml: 0.5 }}
                  >
                    <FaTimes fontSize="small" />
                  </IconButton>
                </Box>
              }
              value={tab.id}
              sx={{ minHeight: '24px', padding: '0 8px', fontSize: '0.75rem' }}
            />
          ))}
          <IconButton onClick={handleAddTab} sx={{ p: 0.5 }}>
            <FaPlus fontSize="small" />
          </IconButton>
        </Tabs>
        <Paper sx={{ display: 'flex', alignItems: 'center', p: 0.5, mt: 0 }}>
          <IconButton onClick={() => handleGoBack(currentTab)} sx={{ p: 0.5 }}>
            <FaArrowLeft fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleGoForward(currentTab)} sx={{ p: 0.5 }}>
            <FaArrowRight fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleReload(currentTab)} sx={{ p: 0.5 }}>
            <FaRedo fontSize="small" />
          </IconButton>
          <InputBase
            value={tabs.find(tab => tab.id === currentTab)?.url || ''}
            onChange={(e) => handleInputChange(e, currentTab)}
            placeholder="Enter URL or search"
            sx={{ ml: 1, flex: 1, fontSize: '0.875rem', height: '32px' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLoadUrl(currentTab);
              }
            }}
          />
          <Button onClick={() => handleLoadUrl(currentTab)} variant="contained" color="primary" sx={{ ml: 1, height: '32px', minWidth: '32px', p: 0 }}>
            <FaSearch fontSize="small" />
          </Button>
        </Paper>
      </Paper>
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {tabs.map(tab => (
          <Box
            key={tab.id}
            sx={{
              display: tab.id === currentTab ? 'block' : 'none',
              width: '100%',
              height: '100%',
            }}
          >
            <webview
              ref={el => webviewRefs.current[tab.id] = el}
              src={tab.url}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Browser;
