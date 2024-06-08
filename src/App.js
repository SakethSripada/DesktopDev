import React, { useState } from 'react';
import ChatPage from './Components/Pages/ChatPage';
import MainMenu from './Components/Pages/MainMenu';
import './App.css';

function App() {
  const [selectedTool, setSelectedTool] = useState(null);

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
  };

  return (
    <div className="app-container">
      {selectedTool === null && <MainMenu onSelectTool={handleSelectTool} />}
      {selectedTool === 'chat' && <ChatPage />}
    </div>
  );
}

export default App;
