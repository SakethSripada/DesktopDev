import React from 'react';
import PathForm from '../PathForm';
import Chat from '../Chat';
import '../styles/ChatPage.css';

function ChatPage({ onBackToMenu }) {
  return (
    <div className="chat-page-container">
      <button className="menu-button" onClick={onBackToMenu}>Menu</button>
      <PathForm />
      <Chat />
    </div>
  );
}

export default ChatPage;
