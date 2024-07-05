import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Button,
  Fade,
} from '@mui/material';
import {
  FaFolder,
  FaFile,
  FaJsSquare,
  FaPython,
  FaHtml5,
  FaCss3Alt,
  FaJava,
  FaCuttlefish,
  FaFileCode,
  FaPhp,
  FaGem,
  FaBolt,
  FaRust,
  FaTerminal,
  FaMarkdown,
  FaGitAlt,
  FaFileImage,
} from 'react-icons/fa';

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

const DirectorySelector = ({
  filesAndDirs,
  handleFileSelect,
  handleBack,
  currentDirectory,
  isFileSelectionOpen,
  setIsFileSelectionOpen,
  selectedFiles,
  transitioning,
  fetchDirectoryTree,
  handleBreadcrumbClick,
}) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Button onClick={() => setIsFileSelectionOpen(!isFileSelectionOpen)} sx={{ color: 'white' }}>
        {isFileSelectionOpen ? 'Hide Files' : 'Show Files'}
      </Button>
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
);

export default DirectorySelector;
