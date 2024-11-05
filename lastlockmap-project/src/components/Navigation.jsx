// src/components/Navigation.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/new-map-page">New Map Page</Link></li>
        <li><Link to="/conference-rooms">Conference Rooms</Link></li>
      </ul>
    </nav>
  );
};

export default Navigation;