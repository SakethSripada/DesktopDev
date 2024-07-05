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
  import axios from 'axios';

export const fetchDirectoryTree = async (basePath, setDirectoryTree, setAlert) => {
  try {
    const response = await axios.post('http://localhost:5000/api/list-files', { path: basePath.trim() });
    setDirectoryTree(response.data.filesAndDirs.filter(item => item.isDirectory));
  } catch (error) {
    console.error('Error fetching directory tree:', error);
    setAlert({ open: true, severity: 'error', message: 'Failed to fetch directory tree.' });
  }
};

export const handleFileSelect = async (
  filePath,
  currentDirectory,
  path,
  filesAndDirs,
  setCurrentDirectory,
  setFilesAndDirs,
  selectedFiles,
  setSelectedFiles,
  setTransitioning,
  setAlert
) => {
  setTransitioning(true);
  const trimmedFilePath = filePath.trim();
  const currentDirPath = currentDirectory ? `${currentDirectory.trim()}/${trimmedFilePath}` : trimmedFilePath;
  const newPath = `${path.trim()}/${currentDirPath}`;

  if (filesAndDirs.find((item) => item.name === trimmedFilePath && item.isDirectory)) {
    setCurrentDirectory(currentDirPath);
    try {
      const response = await axios.post('http://localhost:5000/api/list-files', { path: newPath });
      setFilesAndDirs(response.data.filesAndDirs);
    } catch (error) {
      console.error('Error listing files:', error);
      setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
    }
  } else {
    if (selectedFiles.find((file) => file.name === trimmedFilePath)) {
      setSelectedFiles((prev) => prev.filter((file) => file.name !== trimmedFilePath));
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/read-file', {
          projectPath: path.trim(),
          filePath: currentDirPath,
        });
        const fileContent = response.data.content;
        setSelectedFiles((prev) => [...prev, { name: trimmedFilePath, content: fileContent }]);
      } catch (error) {
        console.error('Error reading file:', error);
        setAlert({ open: true, severity: 'error', message: 'Failed to read file.' });
      }
    }
  }
  setTransitioning(false);
};

export const handleBreadcrumbClick = async (
  index,
  fileInsertPath,
  setFileInsertPath,
  path,
  setCurrentDirectory,
  setDirectoryTree,
  setAlert
) => {
  const pathParts = fileInsertPath.split('/').map(part => part.trim());
  const newPath = pathParts.slice(0, index + 1).join('/');
  setFileInsertPath(newPath);
  setCurrentDirectory(newPath.replace(path.trim(), '').substring(1).trim());

  try {
    const response = await axios.post('http://localhost:5000/api/list-files', { path: newPath });
    setDirectoryTree(response.data.filesAndDirs.filter(item => item.isDirectory));
  } catch (error) {
    console.error('Error listing files:', error);
    setAlert({ open: true, severity: 'error', message: 'Failed to list files.' });
  }
};

export const handleSendMessage = async (
  input,
  setInput,
  setIsTyping,
  conversationHistory,
  selectedFiles,
  setMessages,
  setConversationHistory,
  setAlert
) => {
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

export const handleExecute = (command, isConnected, setAlert, setCommandToExecute, setIsModalOpen) => {
  if (!isConnected) {
    setAlert({ open: true, severity: 'warning', message: 'No path connected. Please connect to a path first.' });
    return;
  }
  setCommandToExecute(command);
  setIsModalOpen(true);
};

export const handleExecuteConfirm = async (commandToExecute, fileInsertPath, setAlert, setIsModalOpen) => {
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

export const handleInsertConfirm = async (
  fileInsertPath,
  newFileName,
  codeToInsert,
  setAlert,
  setIsInsertModalOpen
) => {
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

export const handleContinueGeneration = async (
  messageId,
  conversationHistory,
  setMessages,
  messages,
  setIsTyping,
  setConversationHistory
) => {
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

export const handleCopy = (text, setAlert) => {
  navigator.clipboard.writeText(text).then(() => {
    setAlert({ open: true, severity: 'success', message: 'Copied to clipboard!' });
  }).catch((err) => {
    console.error('Failed to copy: ', err);
    setAlert({ open: true, severity: 'error', message: 'Failed to copy to clipboard.' });
  });
};

export const handlePathSubmit = async (e, path, setFilesAndDirs, setIsConnected, setAlert) => {
  e.preventDefault();
  if (!path.trim()) {
    setAlert({ open: true, severity: 'error', message: 'Please enter a directory path.' });
    return;
  }
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

export const handleRemoveFile = (fileName, setSelectedFiles) => {
  setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
};

export const getFileIcon = (fileName) => {
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
