import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import AdventureLearningGame from './crystal-cave-adventure.tsx';

function App() {
  return (
    <div className="App">
      <AdventureLearningGame />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 