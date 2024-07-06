import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputBase,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Breadcrumbs,
  Link,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  FaCopy,
  FaCheckCircle,
  FaPlay,
  FaFolder,
  FaChevronUp,
  FaChevronDown,
  FaFileImport,
  FaFile,
  FaRedo,
  FaTimes,
  FaJsSquare,
  FaPython,
  FaHtml5,
  FaCss3Alt,
  FaJava,
  FaCuttlefish,
  FaPhp,
  FaGem,
  FaBolt,
  FaRust,
  FaFileCode,
  FaTerminal,
  FaMarkdown,
  FaGitAlt,
  FaFileImage,
} from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '../Alert';
import {
  fetchDirectoryTree,
  handleFileSelect,
  handleBreadcrumbClick,
  handleSendMessage,
  handleExecute,
  handleExecuteConfirm,
  handleInsertConfirm,
  handleContinueGeneration,
  handleCopy,
  handlePathSubmit,
  handleRemoveFile,
  getFileIcon
} from '../../functions/chatFunctions';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: {
      main: '#a024b4',
    },
    background: {
      default: '#1e1e1e',
      paper: '#2e2e2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
    },
  },
});

function ChatPage({ onBackToMenu }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [path, setPath] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });
  const [filesAndDirs, setFilesAndDirs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [commandToExecute, setCommandToExecute] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [codeToInsert, setCodeToInsert] = useState('');
  const [isFileSelectionOpen, setIsFileSelectionOpen] = useState(true);
  const [fileInsertPath, setFileInsertPath] = useState('');
  const [directoryTree, setDirectoryTree] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const [transitioning, setTransitioning] = useState(false);
  const [executePath, setExecutePath] = useState('');

  useEffect(() => {
    if (isConnected) {
      setFileInsertPath(path);
      setExecutePath(path);
      fetchDirectoryTree(path, setDirectoryTree, setAlert);
    }
  }, [isConnected, path]);

  const handlePathChange = (e) => {
    setPath(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(
        input, 
        setInput, 
        setIsTyping, 
        conversationHistory, 
        selectedFiles, 
        setMessages, 
        setConversationHistory, 
        setAlert
      );
    } else if (e.key === 'ArrowUp') {
      const lastUserMessage = messages.slice().reverse().find((msg) => msg.sender === 'user');
      if (lastUserMessage) {
        setInput(lastUserMessage.text);
      }
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setFilesAndDirs([]);
    setSelectedFiles([]);
    setPath('');
    setCurrentDirectory('');
    setFileInsertPath('');
    setExecutePath('');
  };

  const handleBack = async () => {
    const pathParts = currentDirectory.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    setCurrentDirectory(newPath);
    setTransitioning(true);

    try {
      const response = await axios.post('http://localhost:5000/api/list-files', { path: path + (newPath ? `/${newPath}` : '') });
      setFilesAndDirs(response.data.filesAndDirs);
    } catch (error) {
      console.error('Error listing files:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
    }

    setTransitioning(false);
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, severity: '', message: '' });
  };

  const handleInsert = (code) => {
    if (!isConnected) {
      setAlert({ open: true, severity: 'warning', message: 'No path connected. Please connect to a path first.' });
      return;
    }

    const cleanedCode = code.replace(/```(\w*\n)?([\s\S]*?)```/g, '$2').trim();

    setCodeToInsert(cleanedCode);
    setIsInsertModalOpen(true);
    fetchDirectoryTree(fileInsertPath, setDirectoryTree, setAlert);
  };

  const renderBreadcrumbs = (path, setPath, setCurrentDirectory) => {
    const pathParts = path.split('/');
    return (
      <Breadcrumbs aria-label="breadcrumb">
        {pathParts.map((part, index) => (
          <Link
            key={index}
            color="inherit"
            onClick={() => handleBreadcrumbClick(index, path, setPath, setCurrentDirectory, fetchDirectoryTree, setDirectoryTree, setAlert)}
            sx={{ cursor: 'pointer' }}
          >
            {part || 'Root'}
          </Link>
        ))}
      </Breadcrumbs>
    );
  };

  const renderDirectoryTree = (tree, basePath, setPath, setCurrentDirectory) => (
    <Fade in={!transitioning}>
      <List>
        {tree.map((item) => (
          <React.Fragment key={item.name}>
            <ListItem
              button
              onClick={() => {
                const newPath = `${basePath.trim()}/${item.name.trim()}`;
                setPath(newPath);
                fetchDirectoryTree(newPath, setDirectoryTree, setAlert);
              }}
              sx={{
                pl: basePath === path ? 2 : 4,
                backgroundColor: path === `${basePath.trim()}/${item.name.trim()}` ? 'rgba(160, 36, 180, 0.3)' : 'inherit',
                '&:hover': {
                  backgroundColor: path === `${basePath.trim()}/${item.name.trim()}` ? 'rgba(160, 36, 180, 0.3)' : 'rgba(160, 36, 180, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <FaFolder color="yellow" />
              </ListItemIcon>
              <ListItemText primary={item.name} sx={{ color: 'white' }} />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Fade>
  );

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const parts = msg.text.split(/(```[\s\S]*?\n[\s\S]*?```|```[\s\S]*?$)/g);
      let insideCodeBlock = false;
  
      const renderListItems = (text) => {
        const lines = text.split('\n');
        return (
          <Box>
            {lines.map((line, idx) => {
              const match = line.match(/^(\d+)\. (.+)/);
              if (match) {
                return (
                  <Typography key={idx} sx={{ color: '#fff' }}>
                    <Box component="span" sx={{ color: '#ff4081', fontWeight: 'bold' }}>{match[1]}.</Box> {match[2]}
                  </Typography>
                );
              }
              return <Typography key={idx} sx={{ color: '#fff' }}>{line}</Typography>;
            })}
          </Box>
        );
      };
  
      return (
        <Box key={index} sx={{ mb: 2, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
          <Paper
            sx={{
              py: 1,
              px: 2,
              display: 'inline-block',
              backgroundColor: msg.sender === 'user' ? '#4e4e4e' : '#3e3e3e',
              position: 'relative',
              maxWidth: '75%',
              wordBreak: 'break-word',
            }}
          >
            {parts.map((part, i) => {
              const codeBlockMatch = part.match(/```(\w*)\n([\s\S]+)```/);
              if (codeBlockMatch) {
                const language = codeBlockMatch[1] || 'plaintext';
                const codeContent = codeBlockMatch[2].trim();
                insideCodeBlock = false;
                return (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <SyntaxHighlighter language={language} style={oneDark}>
                      {codeContent}
                    </SyntaxHighlighter>
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 2 }}>
                      <IconButton
                        onClick={() => handleCopy(codeContent, setAlert)}
                        size="small"
                        sx={{
                          backgroundColor: '#3e3e3e',
                          '&:hover': {
                            backgroundColor: '#4e4e4e',
                          },
                        }}
                      >
                        <FaCopy style={{ color: '#007bff' }} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleExecute(codeContent, isConnected, setAlert, setCommandToExecute, setIsModalOpen)}
                        size="small"
                        sx={{
                          backgroundColor: '#3e3e3e',
                          '&:hover': {
                            backgroundColor: '#4e4e4e',
                          },
                        }}
                      >
                        <FaPlay style={{ color: '#007bff' }} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleInsert(codeContent)}
                        size="small"
                        sx={{
                          backgroundColor: '#3e3e3e',
                          '&:hover': {
                            backgroundColor: '#4e4e4e',
                          },
                        }}
                      >
                        <FaFileImport style={{ color: '#007bff' }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              } else if (part.startsWith('```')) {
                const language = part.match(/```(\w*)/)[1] || 'plaintext';
                const codeContent = part.slice(part.indexOf('\n') + 1).trim();
                insideCodeBlock = true;
                return (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <SyntaxHighlighter language={language} style={oneDark}>
                      {codeContent}
                    </SyntaxHighlighter>
                  </Box>
                );
              } else if (/^\d+\. .+/.test(part)) {
                return <Box key={i}>{renderListItems(part)}</Box>;
              } else {
                if (insideCodeBlock) {
                  return (
                    <Box key={i} sx={{ position: 'relative' }}>
                      <SyntaxHighlighter language="plaintext" style={oneDark}>
                        {part}
                      </SyntaxHighlighter>
                    </Box>
                  );
                } else {
                  return <Typography key={i} sx={{ color: '#fff' }}>{part}</Typography>;
                }
              }
            })}
            {msg.isContinued && (
              <Button
                onClick={() => handleContinueGeneration(msg.id, conversationHistory, setMessages, messages, setIsTyping, setConversationHistory)}
                startIcon={<FaRedo />}
                sx={{ mt: 1, color: '#007bff' }}
              >
                Continue generation
              </Button>
            )}
          </Paper>
        </Box>
      );
    });
  };
  

  const renderSelectedFilesTabs = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
      {selectedFiles.map((file) => {
        const fileExtension = file.name.split('.').pop();
        let IconComponent = getFileIcon(file.name);

        return (
          <Paper
            key={file.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              mr: 1,
              mb: 1,
              backgroundColor: '#4e4e4e',
              color: 'white',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#3e3e3e',
              },
            }}
          >
            {IconComponent}
            <Typography sx={{ flexGrow: 1, mr: 1, ml: 1 }}>{file.name}</Typography>
            <IconButton
              size="small"
              onClick={() => handleRemoveFile(file.name, setSelectedFiles)}
              sx={{
                backgroundColor: '#3e3e3e',
                '&:hover': {
                  backgroundColor: '#4e4e4e',
                },
              }}
            >
              <FaTimes style={{ color: '#007bff' }} />
            </IconButton>
          </Paper>
        );
      })}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Button variant="contained" color="secondary" onClick={onBackToMenu} sx={{ mb: 2 }}>
            Menu
          </Button>
          <Paper sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 2 }}>
            <InputBase
              value={path}
              onChange={handlePathChange}
              placeholder="Enter directory path"
              sx={{ ml: 1, flex: 1, color: 'white' }}
            />
            {!isConnected ? (
              <Button type="submit" variant="contained" color="primary" onClick={(e) => handlePathSubmit(e, path, setFilesAndDirs, setIsConnected, setAlert)}>
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
        {filesAndDirs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ color: 'white' }}>Files</Typography>
              <IconButton onClick={() => setIsFileSelectionOpen(!isFileSelectionOpen)} sx={{ color: 'white' }}>
                {isFileSelectionOpen ? <FaChevronUp /> : <FaChevronDown />}
              </IconButton>
            </Box>
            <Collapse in={isFileSelectionOpen}>
              {currentDirectory && (
                <Button onClick={handleBack} variant="outlined" sx={{ mb: 1, ml: 1 }}>
                  Back
                </Button>
              )}
              <Fade in={!transitioning}>
                <List>
                  {filesAndDirs.map((item) => (
                    <ListItem
                      button
                      key={item.name}
                      onClick={() => handleFileSelect(item.name, currentDirectory, path, filesAndDirs, setCurrentDirectory, setFilesAndDirs, selectedFiles, setSelectedFiles, setTransitioning, setAlert)}
                      sx={{ backgroundColor: selectedFiles.some(file => file.name === item.name) ? 'rgba(160, 36, 180, 0.3)' : 'inherit' }}
                    >
                      <ListItemIcon>
                        {item.isDirectory ? <FaFolder color="yellow" /> : getFileIcon(item.name)}
                      </ListItemIcon>
                      <ListItemText primary={item.name} sx={{ color: 'white' }} />
                    </ListItem>
                  ))}
                </List>
              </Fade>
            </Collapse>
          </Box>
        )}
        <Paper sx={{ p: 2, flexGrow: 1, overflow: 'auto', backgroundColor: theme.palette.background.default }}>
          {renderMessages()}
          {isTyping && (
            <Box sx={{ textAlign: 'left', display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                AI is typing...
              </Typography>
            </Box>
          )}
        </Paper>
        <Box sx={{ mt: 2, backgroundColor: theme.palette.background.default, pb: 2 }}>
          {renderSelectedFilesTabs()}
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(input, setInput, setIsTyping, conversationHistory, selectedFiles, setMessages, setConversationHistory, setAlert); }} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              variant="outlined"
              fullWidth
              multiline
              sx={{ mr: 1 }}
            />
            <Button type="submit" variant="contained" color="primary">
              Send
            </Button>
          </Paper>
        </Box>
        <Alert open={alert.open} onClose={handleCloseAlert} severity={alert.severity} message={alert.message} />

        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>Execute Command</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are about to execute the following command:
            </DialogContentText>
            <Paper sx={{ p: 2, mt: 1, mb: 2 }}>
              <Typography>{commandToExecute}</Typography>
            </Paper>
            <DialogContentText>
              Confirm the execution of this command in the specified directory.
            </DialogContentText>
            <Box>
              <Typography variant="subtitle1">Select Directory:</Typography>
              {renderBreadcrumbs(executePath, setExecutePath, setCurrentDirectory)}
              <List>
                <ListItem
                  button
                  onClick={() => {
                    setExecutePath(path);
                    setCurrentDirectory('');
                    fetchDirectoryTree(path, setDirectoryTree, setAlert);
                  }}
                  sx={{
                    pl: 2,
                    backgroundColor: executePath === path ? 'rgba(160, 36, 180, 0.3)' : 'inherit',
                    '&:hover': {
                      backgroundColor: executePath === path ? 'rgba(160, 36, 180, 0.3)' : 'rgba(160, 36, 180, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <FaFolder color="yellow" />
                  </ListItemIcon>
                  <ListItemText primary="Root Directory" />
                </ListItem>
              </List>
              {renderDirectoryTree(directoryTree, executePath, setExecutePath, setCurrentDirectory)}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => handleExecuteConfirm(commandToExecute, executePath, setAlert, setIsModalOpen)} color="primary">
              Execute
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isInsertModalOpen} onClose={() => setIsInsertModalOpen(false)}>
          <DialogTitle>Insert Code</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are about to insert the following code into a new file:
            </DialogContentText>
            <Paper sx={{ p: 2, mt: 1, mb: 2 }}>
              <SyntaxHighlighter language="javascript" style={oneDark}>
                {codeToInsert}
              </SyntaxHighlighter>
            </Paper>
            <TextField
              label="New file name"
              variant="outlined"
              fullWidth
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box>
              <Typography variant="subtitle1">Select Directory:</Typography>
              {renderBreadcrumbs(fileInsertPath, setFileInsertPath, setCurrentDirectory)}
              <List>
                <ListItem
                  button
                  onClick={() => {
                    setFileInsertPath(path);
                    setCurrentDirectory('');
                    fetchDirectoryTree(path, setDirectoryTree, setAlert);
                  }}
                  sx={{
                    pl: 2,
                    backgroundColor: fileInsertPath === path ? 'rgba(160, 36, 180, 0.3)' : 'inherit',
                    '&:hover': {
                      backgroundColor: fileInsertPath === path ? 'rgba(160, 36, 180, 0.3)' : 'rgba(160, 36, 180, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <FaFolder color="yellow" />
                  </ListItemIcon>
                  <ListItemText primary="Root Directory" />
                </ListItem>
              </List>
              {renderDirectoryTree(directoryTree, fileInsertPath, setFileInsertPath, setCurrentDirectory)}
            </Box>
            <DialogContentText>
              Confirm the name of the new file and the directory where this code will be inserted.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsInsertModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => handleInsertConfirm(fileInsertPath, newFileName, codeToInsert, setAlert, setIsInsertModalOpen)} color="primary">
              Insert
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default ChatPage;
