import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid } from '@mui/material';
import axios from 'axios';
import {
  FaReact, FaVuejs, FaAngular, FaNodeJs, FaLaravel, FaRuby, FaPython,
  FaPhp, FaJava, FaSwift, FaWordpress
} from 'react-icons/fa';
import {
  DiDjango, DiMongodb, DiWordpress
} from 'react-icons/di';
import {
  SiFlask, SiSvelte, SiNextdotjs, SiPostgresql, SiExpress, SiSpring,
  SiKotlin, SiGatsby, SiNuxtdotjs, SiElectron, SiDotnet, SiNestjs,
  SiDocker, SiFlutter, SiRubyonrails, SiStrapi
} from 'react-icons/si';
import '../styles/ScaffoldingPage.css';
import Alert from '../Alert';

const frameworks = [
  { name: 'React', icon: <FaReact />, color: '#61DAFB' },
  { name: 'Vue', icon: <FaVuejs />, color: '#42b883' },
  { name: 'Angular', icon: <FaAngular />, color: '#DD0031' },
  { name: 'Svelte', icon: <SiSvelte />, color: '#FF3E00' },
  { name: 'Next.js', icon: <SiNextdotjs />, color: '#808080' },  
  { name: 'Nuxt.js', icon: <SiNuxtdotjs />, color: '#00C58E' },
  { name: 'Gatsby', icon: <SiGatsby />, color: '#663399' },
  { name: 'Flask', icon: <SiFlask />, color: '#808080' }, 
  { name: 'Django', icon: <DiDjango />, color: '#092E20' },
  { name: 'Laravel', icon: <FaLaravel />, color: '#FF2D20' },
  { name: 'Ruby on Rails', icon: <SiRubyonrails />, color: '#CC0000' },
  { name: 'Express', icon: <SiExpress />, color: '#808080' },  
  { name: 'Spring', icon: <SiSpring />, color: '#6DB33F' },
  { name: '.NET', icon: <SiDotnet />, color: '#512BD4' },
  { name: 'NestJS', icon: <SiNestjs />, color: '#E0234E' },
  { name: 'Electron', icon: <SiElectron />, color: '#47848F' },
  { name: 'Strapi', icon: <SiStrapi />, color: '#2F2E8B' },
  { name: 'WordPress', icon: <FaWordpress />, color: '#21759B' },
];

const stacks = [
  { name: 'MERN', icon: <FaReact />, color: '#61DAFB' },
  { name: 'MEAN', icon: <FaAngular />, color: '#DD0031' },
  { name: 'PERN', icon: <SiPostgresql />, color: '#336791' },
  { name: 'T3', icon: <FaNodeJs />, color: '#68A063' },
  { name: 'LAMP', icon: <FaPhp />, color: '#777BB4' },
  { name: 'LEMP', icon: <FaPhp />, color: '#777BB4' },
  { name: 'JAMstack', icon: <SiGatsby />, color: '#663399' },
  { name: 'MEVN', icon: <FaVuejs />, color: '#42b883' },
  { name: 'Django + React', icon: <FaReact />, color: '#61DAFB' },
  { name: 'Rails + React', icon: <FaReact />, color: '#61DAFB' },
  { name: 'WordPress + Gatsby', icon: <SiGatsby />, color: '#663399' },
  { name: 'WordPress + Nuxt', icon: <SiNuxtdotjs />, color: '#00C58E' },
  { name: 'Spring Boot + Angular', icon: <FaAngular />, color: '#DD0031' },
];

function ScaffoldingPage({ onBackToMenu }) {
  const [projectPath, setProjectPath] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedStack, setSelectedStack] = useState('');
  const [alert, setAlert] = useState({ open: false, severity: '', message: '' });

  const handleFrameworkSelect = (framework) => {
    setSelectedFramework(framework);
    setSelectedStack('');
  };

  const handleStackSelect = (stack) => {
    setSelectedStack(stack);
    setSelectedFramework('');
  };

  const handleScaffoldProject = async () => {
    try {
      const response = await axios.post('http://localhost:5000/scaffold', {
        projectPath,
        selectedFramework,
        selectedStack,
      });

      setAlert({ open: true, severity: 'success', message: response.data.message });
    } catch (error) {
      setAlert({ open: true, severity: 'error', message: `Error: ${error.response?.data?.error || error.message}` });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, severity: '', message: '' });
  };

  return (
    <Box className="container">
      <Button variant="contained" color="secondary" onClick={onBackToMenu} className="menu-button">
        Menu
      </Button>
      <Typography variant="h4" component="h1" className="title">
        Project Scaffolding
      </Typography>
      <Box className="section">
        <Typography variant="h6" component="h2" gutterBottom>
          Specify Project Path
        </Typography>
        <TextField
          label="Project Path"
          variant="outlined"
          value={projectPath}
          onChange={(e) => setProjectPath(e.target.value)}
          className="path-input"
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white' } }}
        />
      </Box>
      <Box className="section">
        <Typography variant="h6" component="h2" gutterBottom>
          Choose Framework
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {frameworks.map((framework) => (
            <Grid item key={framework.name}>
              <Button
                variant={selectedFramework === framework.name ? 'contained' : 'outlined'}
                style={{
                  backgroundColor: selectedFramework === framework.name ? framework.color : 'transparent',
                  color: 'white',
                  borderColor: framework.color
                }}
                onClick={() => handleFrameworkSelect(framework.name)}
                startIcon={framework.icon}
                className="option-button"
              >
                {framework.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Typography variant="h6" component="h2" gutterBottom className="or-text">
        Or
      </Typography>
      <Box className="section">
        <Typography variant="h6" component="h2" gutterBottom>
          Choose Stack
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {stacks.map((stack) => (
            <Grid item key={stack.name}>
              <Button
                variant={selectedStack === stack.name ? 'contained' : 'outlined'}
                style={{
                  backgroundColor: selectedStack === stack.name ? stack.color : 'transparent',
                  color: 'white',
                  borderColor: stack.color
                }}
                onClick={() => handleStackSelect(stack.name)}
                startIcon={stack.icon}
                className="option-button"
              >
                {stack.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box className="scaffold-button-section">
        <Button variant="contained" color="primary" onClick={handleScaffoldProject}>
          Scaffold Project
        </Button>
      </Box>
      <Alert open={alert.open} onClose={handleCloseAlert} severity={alert.severity} message={alert.message} />
    </Box>
  );
}

export default ScaffoldingPage;
