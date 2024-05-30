import React from 'react';
import './styles/Message.css';

function Message({ message }) {
  return (
    <div className={`message ${message.sender}`}>
      <div className="pfp"></div>
      <div className="text">{message.text}</div>
    </div>
  );
}

export default Message;