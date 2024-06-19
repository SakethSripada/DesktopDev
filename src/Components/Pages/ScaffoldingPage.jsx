import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid } from '@mui/material';
import { FaReact, FaVuejs, FaAngular, FaNodeJs, FaLaravel, FaRuby, FaPython, FaPhp, FaJava, FaSwift, FaWordpress } from 'react-icons/fa';
import { DiDjango, DiMongodb, DiWordpress } from 'react-icons/di';
import { SiFlask, SiSvelte, SiNextdotjs, SiPostgresql, SiExpress, SiSpring, SiKotlin, SiGatsby, SiNuxtdotjs, SiElectron, SiDotnet, SiNestjs, SiDocker, SiFlutter, SiRubyonrails, SiStrapi } from 'react-icons/si';
import '../styles/ScaffoldingPage.css';

const frameworks = [
  { name: 'React', icon: <FaReact />, color: '#61DAFB' },
  { name: 'Vue', icon: <FaVuejs />, color: '#42b883' },
  { name: 'Angular', icon: <FaAngular />, color: '#DD0031' },
  { name: 'Svelte', icon: <SiSvelte />, color: '#FF3E00' },
  { name: 'Next.js', icon: <SiNextdotjs />, color: '#000000' },
  { name: 'Nuxt.js', icon: <SiNuxtdotjs />, color: '#00C58E' },
  { name: 'Gatsby', icon: <SiGatsby />, color: '#663399' },
  { name: 'Flask', icon: <SiFlask />, color: '#000000' },
  { name: 'Django', icon: <DiDjango />, color: '#092E20' },
  { name: 'Laravel', icon: <FaLaravel />, color: '#FF2D20' },
  { name: 'Ruby on Rails', icon: <SiRubyonrails />, color: '#CC0000' },
  { name: 'Express', icon: <SiExpress />, color: '#000000' },
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

  const handleFrameworkSelect = (framework) => {
    setSelectedFramework(framework);
    setSelectedStack('');
  };

  const handleStackSelect = (stack) => {
    setSelectedStack(stack);
    setSelectedFramework('');
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
                style={{ backgroundColor: framework.color, color: 'white' }}
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
                style={{ backgroundColor: stack.color, color: 'white' }}
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
        <Button variant="contained" color="primary">
          Scaffold Project
        </Button>
      </Box>
    </Box>
  );
}

export default ScaffoldingPage;
