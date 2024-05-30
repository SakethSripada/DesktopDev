import React, { useState } from 'react';
import './styles/PathForm.css';

function PathForm() {
  const [path, setPath] = useState('');

  const handlePathChange = (e) => {
    setPath(e.target.value);
  };

  const handlePathSubmit = (e) => {
    e.preventDefault();
    console.log('Path submitted:', path);
  };

  return (
    <form className="path-form" onSubmit={handlePathSubmit}>
      <input
        type="text"
        value={path}
        onChange={handlePathChange}
        placeholder="Enter directory path"
        className="path-input"
      />
      <button type="submit" className="path-submit">Submit</button>
    </form>
  );
}

export default PathForm;