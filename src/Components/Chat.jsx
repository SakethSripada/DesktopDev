import React, { useState } from 'react';
import Message from './Message';
import './styles/Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        const botMessage = { text: 'Lorem ipsum dolor sit amet...', sender: 'bot' };
        setMessages([...messages, newMessage, botMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        {isTyping && (
          <div className="message bot">
            <div className="pfp"></div>
            <div className="text">
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="send-button">Send</button>
      </div>
    </div>
  );
}

export default Chat;