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
} from '@mui/material';
import { FaCopy, FaCheckCircle, FaPlay, FaFolder, FaChevronUp, FaChevronDown, FaFileImport, FaFile } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '../Alert';
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

  useEffect(() => {
    if (isConnected) {
      setFileInsertPath(path);
      fetchDirectoryTree(path);
    }
  }, [isConnected, path]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePathChange = (e) => {
    setPath(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setIsTyping(true);

      try {
        const response = await fetch('http://localhost:5000/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: input }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const botMessage = { text: data.response.trim(), sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error fetching response:', error);
        const botMessage = { text: 'Error generating response. Please try again.', sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setAlert({ open: true, severity: 'success', message: 'Copied to clipboard!' });
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      setAlert({ open: true, severity: 'error', message: 'Failed to copy to clipboard.' });
    });
  };

  const handleExecute = (command) => {
    if (!isConnected) {
      setAlert({ open: true, severity: 'warning', message: 'No path connected. Please connect to a path first.' });
      return;
    }
    setCommandToExecute(command);
    setIsModalOpen(true);
  };

  const handleExecuteConfirm = async () => {
    setIsModalOpen(false);
    try {
      const response = await axios.post('http://localhost:5000/api/execute-command', {
        path: fileInsertPath,
        command: commandToExecute,
      });
      setAlert({ open: true, severity: 'success', message: `Command executed: ${response.data.output}` });
    } catch (error) {
      console.error('Error executing command:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to execute command.' });
    }
  };

  const handlePathSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/list-files', { path });
      setFilesAndDirs(response.data.filesAndDirs);
      setIsConnected(true);
      setAlert({ open: true, severity: 'success', message: 'Connected to project path successfully!' });
    } catch (error) {
      console.error('Error listing files:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
      setIsConnected(false);
    }
  };

  const handleFileSelect = async (filePath) => {
    if (filesAndDirs.find((item) => item.name === filePath && item.isDirectory)) {
      setCurrentDirectory((prev) => (prev ? `${prev}/${filePath}` : filePath));
      const newPath = path + '/' + (currentDirectory ? `${currentDirectory}/${filePath}` : filePath);
      try {
        const response = await axios.post('http://localhost:5000/api/list-files', { path: newPath });
        setFilesAndDirs(response.data.filesAndDirs);
      } catch (error) {
        console.error('Error listing files:', error);
        setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
      }
    } else {
      if (selectedFiles.includes(filePath)) {
        setSelectedFiles((prev) => prev.filter((file) => file !== filePath));
        setInput((prev) => {
          const regex = new RegExp(`Content of ${filePath}:\\n[\\s\\S]*?(\\n\\n|$)`, 'g');
          return prev.replace(regex, '').trim();
        });
      } else {
        try {
          const response = await axios.post('http://localhost:5000/api/read-file', {
            projectPath: path,
            filePath: currentDirectory ? `${currentDirectory}/${filePath}` : filePath,
          });
          const fileContent = `Content of ${filePath}:\n${response.data.content}`;
          setInput((prev) => (prev ? `${prev}\n\n${fileContent}` : fileContent));
          setSelectedFiles((prev) => [...prev, filePath]);
        } catch (error) {
          console.error('Error reading file:', error);
          setAlert({ open: true, severity: 'error', message: 'Failed to read file.' });
        }
      }
    }
  };

  const handleBack = async () => {
    const pathParts = currentDirectory.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    setCurrentDirectory(newPath);

    try {
      const response = await axios.post('http://localhost:5000/api/list-files', { path: path + (newPath ? `/${newPath}` : '') });
      setFilesAndDirs(response.data.filesAndDirs);
    } catch (error) {
      console.error('Error listing files:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
    }
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
    fetchDirectoryTree(fileInsertPath);
  };

  const handleInsertConfirm = async () => {
    setIsInsertModalOpen(false);
    try {
      const response = await axios.post('http://localhost:5000/api/insert-code', {
        path: fileInsertPath,
        fileName: newFileName,
        code: codeToInsert,
      });
      setAlert({ open: true, severity: 'success', message: `Code inserted into file: ${newFileName}` });
    } catch (error) {
      console.error('Error inserting code:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to insert code into file.' });
    }
  };

  const fetchDirectoryTree = async (basePath) => {
    try {
      const response = await axios.post('http://localhost:5000/api/list-files', { path: basePath });
      setDirectoryTree(response.data.filesAndDirs.filter(item => item.isDirectory));
    } catch (error) {
      console.error('Error fetching directory tree:', error);
    }
  };

  const handleBreadcrumbClick = async (index) => {
    const pathParts = fileInsertPath.split('/');
    const newPath = pathParts.slice(0, index + 1).join('/');
    setFileInsertPath(newPath);
    setCurrentDirectory(newPath.replace(path, '').substring(1));

    try {
      const response = await axios.post('http://localhost:5000/api/list-files', { path: newPath });
      setDirectoryTree(response.data.filesAndDirs.filter(item => item.isDirectory));
    } catch (error) {
      console.error('Error listing files:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
    }
  };

  const renderBreadcrumbs = () => {
    const pathParts = fileInsertPath.split('/');
    return (
      <Breadcrumbs aria-label="breadcrumb">
        {pathParts.map((part, index) => (
          <Link
            key={index}
            color="inherit"
            onClick={() => handleBreadcrumbClick(index)}
            sx={{ cursor: 'pointer' }}
          >
            {part || 'Root'}
          </Link>
        ))}
      </Breadcrumbs>
    );
  };

  const renderDirectoryTree = (tree, basePath) => (
    <List>
      {tree.map((item) => (
        <React.Fragment key={item.name}>
          <ListItem
            button
            onClick={() => {
              const newInsertPath = basePath + '/' + item.name;
              setFileInsertPath(newInsertPath);
              setCurrentDirectory(newInsertPath.replace(path + '/', ''));
              fetchDirectoryTree(newInsertPath);
            }}
            sx={{
              pl: basePath === path ? 2 : 4,
              backgroundColor: fileInsertPath === basePath + '/' + item.name ? 'rgba(160, 36, 180, 0.3)' : 'inherit',
              '&:hover': {
                backgroundColor: fileInsertPath === basePath + '/' + item.name ? 'rgba(160, 36, 180, 0.3)' : 'rgba(160, 36, 180, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <FaFolder color="yellow" />
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        </React.Fragment>
      ))}
    </List>
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
            <Button type="submit" variant="contained" color="primary" onClick={handlePathSubmit}>
              Connect
            </Button>
          </Paper>
          {isConnected && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'green', mb: 2 }}>
              <FaCheckCircle style={{ marginRight: '8px' }} />
              <Typography>Connected</Typography>
            </Box>
          )}
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
                <Button onClick={handleBack} variant="outlined" sx={{ mb: 1 }}>
                  Back
                </Button>
              )}
              <List>
                {filesAndDirs.map((item) => (
                  <ListItem
                    button
                    key={item.name}
                    onClick={() => handleFileSelect(item.name)}
                    sx={{ backgroundColor: selectedFiles.includes(item.name) ? 'rgba(160, 36, 180, 0.3)' : 'inherit' }}
                  >
                    <ListItemIcon>
                      {item.isDirectory ? <FaFolder color="yellow" /> : <FaFile color="white" />}
                    </ListItemIcon>
                    <ListItemText primary={item.name} sx={{ color: 'white' }} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
        <Paper sx={{ p: 2, flexGrow: 1, overflow: 'auto', backgroundColor: theme.palette.background.default }}>
          {messages.map((msg, index) => (
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
                {msg.text.split(/(```[\s\S]+?```)/g).map((part, index) => {
                  const codeBlockMatch = part.match(/```(\w*)\n([\s\S]+)```/);
                  if (codeBlockMatch) {
                    const language = codeBlockMatch[1] || 'plaintext';
                    const codeContent = codeBlockMatch[2].trim();
                    return (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <SyntaxHighlighter language={language} style={oneDark}>
                          {codeContent}
                        </SyntaxHighlighter>
                        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 2 }}>
                          <IconButton
                            onClick={() => handleCopy(part)}
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
                            onClick={() => handleExecute(part)}
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
                            onClick={() => handleInsert(part)}
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
                  } else {
                    return <Typography key={index} sx={{ color: '#fff' }}>{part}</Typography>;
                  }
                })}
              </Paper>
            </Box>
          ))}
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
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <TextField
              value={input}
              onChange={handleInputChange}
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleExecuteConfirm} color="primary">
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
              {renderBreadcrumbs()}
              <List>
                <ListItem
                  button
                  onClick={() => {
                    setFileInsertPath(path);
                    setCurrentDirectory('');
                    fetchDirectoryTree(path);
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
              {renderDirectoryTree(directoryTree, fileInsertPath)}
            </Box>
            <DialogContentText>
              Confirm the name of the new file and the directory where this code will be inserted.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsInsertModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleInsertConfirm} color="primary">
              Insert
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default ChatPage;
