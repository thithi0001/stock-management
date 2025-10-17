import React, { useEffect, useState } from 'react';
import { testAPI } from './services/api';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    testAPI().then(data => {
      setMessage(data.message);
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Stock Management App</h1>
      <p>Backend message: {message}</p>
    </div>
  );
}

export default App;