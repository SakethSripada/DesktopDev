import React, { useState } from 'react';
import Chat from './Components/Chat';
import PathForm from './Components/PathForm';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <PathForm />
      <Chat />
    </div>
  );
}

export default App;
