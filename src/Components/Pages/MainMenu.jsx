import React from 'react';
import '../styles/MainMenu.css';

function MainMenu({ onSelectTool }) {
  return (
    <div className="main-menu-container">
      <h1>DevTools Companion</h1>
      <div className="tool-buttons">
        <button onClick={() => onSelectTool('chat')}>AI Chat</button>
        <button onClick={() => onSelectTool('git')}>Git Tools</button>
        <button onClick={() => onSelectTool('scaffold')}>Project Scaffolding</button>
      </div>
    </div>
  );
}

export default MainMenu;
