import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputBase,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
} from '@mui/material';
import { FaCopy, FaCheckCircle, FaPlay } from 'react-icons/fa';
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
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [commandToExecute, setCommandToExecute] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subDirectory, setSubDirectory] = useState('');

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
    setCommandToExecute(command);
    setIsModalOpen(true);
  };

  const handleExecuteConfirm = async () => {
    setIsModalOpen(false);
    try {
      const response = await axios.post('http://localhost:5000/api/execute-command', {
        path: subDirectory ? path + '/' + subDirectory : path,
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
      setFiles(response.data.files);
      setIsConnected(true);
      setAlert({ open: true, severity: 'success', message: 'Connected to project path successfully!' });
    } catch (error) {
      console.error('Error listing files:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
      setIsConnected(false);
    }
  };

  const handleFileSelect = async (event, newValue) => {
    setSelectedFiles(newValue);

    try {
      const fileContents = await Promise.all(newValue.map(async (filePath) => {
        const response = await axios.post('http://localhost:5000/api/read-file', {
          projectPath: path,
          filePath,
        });
        return `Content of ${filePath}:\n${response.data.content}`;
      }));

      setInput(fileContents.join('\n\n'));
    } catch (error) {
      console.error('Error reading file:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to read file.' });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, severity: '', message: '' });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
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
              Submit
            </Button>
          </Paper>
          {isConnected && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'green', mb: 2 }}>
              <FaCheckCircle style={{ marginRight: '8px' }} />
              <Typography>Connected</Typography>
            </Box>
          )}
        </Box>
        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={files}
              getOptionLabel={(option) => option}
              value={selectedFiles}
              onChange={handleFileSelect}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select files"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'white',
                      },
                      '&:hover fieldset': {
                        borderColor: 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                    },
                  }}
                />
              )}
              sx={{ backgroundColor: '#2e2e2e', borderRadius: 1, color: 'white' }}
            />
          </Box>
        )}
        <Paper sx={{ p: 2, height: '60vh', overflow: 'auto', backgroundColor: theme.palette.background.default }}>
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
                        <IconButton
                          onClick={() => handleCopy(part)}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 36, 
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
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: '#3e3e3e',
                            '&:hover': {
                              backgroundColor: '#4e4e4e',
                            },
                          }}
                        >
                          <FaPlay style={{ color: '#007bff' }} />
                        </IconButton>
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
        <Box sx={{ mt: 2, position: 'sticky', bottom: 0, backgroundColor: theme.palette.background.default }}>
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <TextField
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              variant="outlined"
              fullWidth
              multiline
              sx={{ mr: 1, '& .MuiOutlinedInput-root': { height: 'auto' } }}
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
            <TextField
              label="Sub-directory (optional)"
              variant="outlined"
              fullWidth
              value={subDirectory}
              onChange={(e) => setSubDirectory(e.target.value)}
              sx={{ mb: 2 }}
            />
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
      </Container>
    </ThemeProvider>
  );
}

export default ChatPage;
