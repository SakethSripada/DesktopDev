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
} from '@mui/material';
import { FaCopy } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '../Alert';

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

  const handleInputChange = (e) => {
    setInput(e.target.value);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
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

  const handlePathSubmit = (e) => {
    e.preventDefault();
    console.log('Path submitted:', path);
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
        </Box>
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
                            right: 8,
                            backgroundColor: '#3e3e3e',
                            '&:hover': {
                              backgroundColor: '#4e4e4e',
                            },
                          }}
                        >
                          <FaCopy style={{ color: '#007bff' }} />
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
        <Box sx={{ mt: 2 }}>
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <TextField
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              variant="outlined"
              fullWidth
              sx={{ mr: 1, '& .MuiOutlinedInput-root': { height: '40px' } }}
            />
            <Button type="submit" variant="contained" color="primary">
              Send
            </Button>
          </Paper>
        </Box>
        <Alert open={alert.open} onClose={handleCloseAlert} severity={alert.severity} message={alert.message} />
      </Container>
    </ThemeProvider>
  );
}

export default ChatPage;
