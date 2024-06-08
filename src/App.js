import React, { useState } from 'react';
import ChatPage from './Components/Pages/ChatPage';
import GitPage from './Components/Pages/GitPage';
import MainMenu from './Components/Pages/MainMenu';
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState(null);

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
  };

  const handleBackToMenu = () => {
    setSelectedTool(null);
  };

  return (
    <div className="app-container">
      {selectedTool === null && <MainMenu onSelectTool={handleSelectTool} />}
      {selectedTool === 'chat' && <ChatPage onBackToMenu={handleBackToMenu} />}
      {selectedTool === 'git' && <GitPage onBackToMenu={handleBackToMenu} />}
    </div>
  );
}

export default App;
