import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamingPage from './components/GamingPage';
import RetroPage from './components/RetroPage';
import TcgPage from './components/TcgPage';
import GoodiesPage from './components/GoodiesPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gaming" element={<GamingPage />} />
          <Route path="/retro" element={<RetroPage />} />
          <Route path="/tcg" element={<TcgPage />} />
          <Route path="/goodies" element={<GoodiesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;