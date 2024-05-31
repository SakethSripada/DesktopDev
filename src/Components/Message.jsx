import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './styles/Message.css';

function Message({ message }) {
  console.log('Message content:', message.text); 

  const parts = message.text.split(/(```[\s\S]+?```)/g);

  return (
    <div className={`message ${message.sender}`}>
      <div className="pfp"></div>
      <div className="text">
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const codeBlockMatch = part.match(/```(\w*)\n([\s\S]+)```/);
            const language = codeBlockMatch[1] || 'plaintext';
            const codeContent = codeBlockMatch[2].trim();
            return (
              <SyntaxHighlighter key={index} language={language} style={docco}>
                {codeContent}
              </SyntaxHighlighter>
            );
          } else {
            return <p key={index}>{part}</p>;
          }
        })}
      </div>
    </div>
  );
}

export default Message;
