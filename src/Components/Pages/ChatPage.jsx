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
    } else if (e.key === 'ArrowUp') {
      const lastUserMessage = messages.slice().reverse().find((msg) => msg.sender === 'user');
      if (lastUserMessage) {
        setInput(lastUserMessage.text);
      }
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

      const updatedConversationHistory = [
        ...conversationHistory,
        { role: 'user', content: input },
        ...selectedFiles.map((file) => ({
          role: 'system',
          content: `Content of ${file.name}:\n${file.content}`,
        })),
      ];

      const validConversationHistory = updatedConversationHistory.slice(-5).filter(msg => msg.content && msg.content.trim());

      try {
        const response = await fetch('http://localhost:5000/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversationHistory: validConversationHistory }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const botMessage = { text: data.response.trim(), sender: 'bot', id: data.id, isContinued: data.isContinued };
        setMessages((prevMessages) => [...prevMessages, botMessage]);

        setConversationHistory((prevHistory) => [...prevHistory, { role: 'assistant', content: data.response.trim() }]);
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

  const handleDisconnect = () => {
    setIsConnected(false);
    setFilesAndDirs([]);
    setSelectedFiles([]);
    setPath('');
    setCurrentDirectory('');
    setFileInsertPath('');
  };

  const handleFileSelect = async (filePath) => {
    setTransitioning(true);
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
      if (selectedFiles.find((file) => file.name === filePath)) {
        setSelectedFiles((prev) => prev.filter((file) => file.name !== filePath));
      } else {
        try {
          const response = await axios.post('http://localhost:5000/api/read-file', {
            projectPath: path,
            filePath: currentDirectory ? `${currentDirectory}/${filePath}` : filePath,
          });
          const fileContent = response.data.content;
          setSelectedFiles((prev) => [...prev, { name: filePath, content: fileContent }]);
        } catch (error) {
          console.error('Error reading file:', error);
          setAlert({ open: true, severity: 'error', message: 'Failed to read file.' });
        }
      }
    }
    setTransitioning(false);
  };

  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
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
    <Fade in={!transitioning}>
      <List>
        {tree.map((item) => (
          <React.Fragment key={item.name}>
            <ListItem
              button
              onClick={() => handleFileSelect(item.name)}
              sx={{
                pl: basePath === path ? 2 : 4,
                backgroundColor: fileInsertPath === basePath + '/' + item.name ? 'rgba(160, 36, 180, 0.3)' : 'inherit',
                '&:hover': {
                  backgroundColor: fileInsertPath === basePath + '/' + item.name ? 'rgba(160, 36, 180, 0.3)' : 'rgba(160, 36, 180, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                {item.isDirectory ? <FaFolder color="yellow" /> : getFileIcon(item.name)}
              </ListItemIcon>
              <ListItemText primary={item.name} sx={{ color: 'white' }} />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Fade>
  );

  const getFileIcon = (fileName) => {
    const fileExtension = fileName.split('.').pop();
    switch (fileExtension) {
      case 'js':
        return <FaJsSquare color="yellow" />;
      case 'py':
        return <FaPython color="blue" />;
      case 'html':
        return <FaHtml5 color="orange" />;
      case 'css':
        return <FaCss3Alt color="blue" />;
      case 'java':
        return <FaJava color="red" />;
      case 'cpp':
      case 'c':
        return <FaCuttlefish color="blue" />;
      case 'cs':
        return <FaFileCode color="purple" />;
      case 'php':
        return <FaPhp color="violet" />;
      case 'rb':
        return <FaGem color="red" />;
      case 'go':
        return <FaBolt color="teal" />;
      case 'rs':
        return <FaRust color="brown" />;
      case 'ts':
        return <FaJsSquare color="lightblue" />;
      case 'json':
        return <FaFileCode color="green" />;
      case 'xml':
        return <FaFileCode color="orange" />;
      case 'sh':
        return <FaTerminal color="lightgrey" />;
      case 'md':
        return <FaMarkdown color="blue" />;
      case 'gitignore':
        return <FaGitAlt color="orange" />;
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FaFileImage color="pink" />;
      default:
        return <FaFile color="white" />;
    }
  };
  

  const handleContinueGeneration = async (messageId) => {
    setIsTyping(true);
    const lastMessages = conversationHistory.slice(-5);
    try {
      const response = await fetch('http://localhost:5000/api/continue-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationHistory: lastMessages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const lastMessageIndex = messages.findIndex(msg => msg.id === messageId);
      const lastMessage = messages[lastMessageIndex];
      const updatedText = lastMessage.text + data.response.trim();

      const updatedMessages = [...messages];
      updatedMessages[lastMessageIndex] = {
        ...lastMessage,
        text: updatedText,
        isContinued: data.isContinued,
      };

      setMessages(updatedMessages);

      setConversationHistory((prevHistory) => [...prevHistory, { role: 'assistant', content: data.response.trim() }]);
    } catch (error) {
      console.error('Error continuing generation:', error);
      const botMessage = { text: 'Error generating response. Please try again.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const parts = msg.text.split(/(```[\s\S]*?\n[\s\S]*?```|```[\s\S]*?$)/g);
      let insideCodeBlock = false;

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
                        onClick={() => handleCopy(codeContent)}
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
                        onClick={() => handleExecute(codeContent)}
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
                onClick={() => handleContinueGeneration(msg.id)}
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
        let IconComponent;

        switch (fileExtension) {
          case 'js':
            IconComponent = <FaJsSquare color="yellow" />;
            break;
          case 'py':
            IconComponent = <FaPython color="blue" />;
            break;
          case 'html':
            IconComponent = <FaHtml5 color="orange" />;
            break;
          case 'css':
            IconComponent = <FaCss3Alt color="blue" />;
            break;
          default:
            IconComponent = <FaFile color="white" />;
        }

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
              onClick={() => handleRemoveFile(file.name)}
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
                      onClick={() => handleFileSelect(item.name)}
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
